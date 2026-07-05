// =============================================================
// AI 应用编程教程 —— 第 8 批章节（AI编程工作流组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   36. aiapp-flow-single    单文件开发工作流
//   37. aiapp-flow-fullstack 全栈项目从零到一
//   38. aiapp-flow-refactor  老项目改造重构
//   39. aiapp-flow-api       API 设计与联调
//   40. aiapp-flow-perf      性能调优实战
//
// 信息时效：2026-07-05。工具名、命令与价格如无特别说明均以官方页面为准。
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
    id: "aiapp-flow-single",
    icon: "📄",
    group: "AI编程工作流",
    title: "单文件开发工作流",
    content: `
# 第36章：单文件开发工作流

## 36.1 单文件任务的典型场景

并不是所有 AI 编程任务都宏大。绝大多数日常 AI 协作都发生在一个非常具体的颗粒度上——"单文件任务"。所谓单文件任务，指的是这个任务的输入、产出、验证都集中在一个文件里，不跨模块、不跨服务、不需要协调多个依赖。它的边界清晰、可验证性强，是 AI 编程最容易出成果也最不容易翻车的颗粒度。

典型的单文件场景有四类。第一类是**工具函数**：比如写一个把驼峰转下划线的字符串函数、一个把秒数格式化为 \`hh:mm:ss\` 的时间函数、一个解析 URL query string 的纯函数。这类函数输入输出确定、易于写测试、没有副作用，是 AI 最擅长的领域。第二类是**脚本**：比如一次性数据清洗脚本、把某个 CSV 转成 JSON 的迁移脚本、批量重命名文件的 Node.js 脚本。脚本的特点是"跑一次就扔"，但要保证这一跑就成，所以需要 AI 把边界情况想全。第三类是**独立组件**：一个 React 函数组件、一个 Vue 单文件组件、一个不依赖外部状态的 UI 控件。组件有清晰的 props 接口和渲染输出，AI 能在隔离环境里完整产出。第四类是**单元测试**：给一个已经存在的函数补全测试用例、给一个组件补渲染测试。这类任务需要 AI 理解被测对象的契约，但产出仍然集中在测试文件里。

判断"这是不是一个单文件任务"的标准有三条：一是产出只有一个文件；二是这个文件依赖的其它文件不需要改动；三是验证不需要启动整个应用、跑这个文件本身或它的测试就能验证。三条都满足，就走单文件工作流，效率最高；任一条不满足，就要考虑多文件工作流或全栈工作流。

## 36.2 单文件 5 步工作流

单文件任务虽然简单，但仍然推荐走一个固定的 5 步流程。固定流程的价值不在于"严谨"，而在于降低认知负担：你不需要每次都重新设计协作方式，AI 也能因为流程的可预测性而给出更稳定的产出。

**第 1 步：描述需求。** 在动 prompt 之前，先在脑子里（或在便签里）想清楚三件事——这个文件的输入是什么、输出是什么、有哪些边界条件必须处理。然后把这个三件事用自然语言写出来。需求描述不要省略边界条件，因为 AI 默认会按"快乐路径"实现，你不说边界它就不处理。例如写一个金额格式化函数，需求里必须写清楚"负数怎么显示、小数位是几位、千分位用什么符号、零怎么显示"。

**第 2 步：AI 生成草稿。** 把需求描述喂给 AI，让它产出第一版代码。这一步的关键是"不要急着用"，AI 的第一版往往是快乐路径实现，可能漏掉边界、可能用了不存在的 API、可能有性能问题。你的任务是把草稿收下，进入第 3 步。

**第 3 步：人工审查。** 把草稿从头到尾读一遍。审查清单包括：函数签名是否符合需求、边界条件是否处理、是否有不必要的依赖、命名是否清晰、是否有明显 bug。审查时不要光看代码逻辑，还要看 AI 用了哪些 API——它可能会幻觉出根本不存在的库函数。这一步是整个流程里"人最有价值"的一步，AI 替代不了。

**第 4 步：AI 修测试。** 审查发现问题后，把问题清单连同代码一起回给 AI，让它修复。同时让 AI 生成单元测试。测试要覆盖快乐路径、所有边界条件、以及至少一个"异常输入"。让 AI 同时改代码和写测试有个好处：它会让代码的接口更适合测试，从而反过来提升代码质量。

**第 5 步：AI 写文档。** 测试通过后，让 AI 给这个文件写文档。文档包括：函数的用途说明、参数说明（每个参数的类型和含义）、返回值说明、抛出的异常、至少一个使用示例。文档可以放在文件顶部的注释里，也可以放到同名的 \`.md\` 文件里。这一步经常被省略，但省略的代价是三个月后你自己都看不懂这个函数为什么这么写。

## 36.3 单文件 prompt 模板

下面这个模板是单文件任务的"通用骨架"，把尖括号里的内容替换成具体值即可。

\`\`\`text
<role>
你是一位资深 JavaScript 工程师，写代码遵循 Airbnb 风格，注释用中文。
</role>

<task>
请在单个文件里实现以下功能，不要拆分多个文件。
</task>

<requirement>
- 输入：<参数类型与含义>
- 输出：<返回类型与含义>
- 边界条件：
  1. <边界 1，例如：输入为空数组时返回空数组>
  2. <边界 2，例如：输入为负数时抛出 RangeError>
  3. <边界 3>
</requirement>

<constraints>
- 只用 Node.js 18+ 标准库，不引入第三方依赖
- 函数必须是纯函数，无副作用
- 同时输出对应的 Jest 单元测试，覆盖率不低于 90%
- 文件顶部用 JSDoc 注释写明用途、参数、返回值、异常
</constraints>

<output>
先输出实现代码（用 \`\`\`js 代码块），再输出测试代码（用 \`\`\`js 代码块）。
</output>
\`\`\`

这个模板的精髓在于四个标签：role（设定身份与风格）、task（界定任务范围）、requirement（明确输入输出与边界）、constraints（限定技术约束与产出格式）。AI 看到 structured prompt 会比看到自然语言段落更稳定，因为它能逐项对照检查。

## 36.4 单文件任务的工具选择

同样是单文件任务，不同工具的擅长点不同，选错工具效率会打折。

**Cursor 的 Cmd+K（内联生成）** 最适合"在已有文件里改一段"的场景。你选中一段代码，按 Cmd+K，输入"把这个函数改成支持负数"，它就在原地生成。它的上下文就是你选中的代码 + 当前文件，所以特别精准、特别快。适合做小重构、补一段逻辑、加一段注释。

**Cursor 的 Composer / Copilot Chat** 适合"从零生成一个新文件"或"在文件间穿梭"。你打开 Chat，告诉它"在 \`src/utils/format.js\` 里新建一个金额格式化函数"，它会创建文件并写入代码。它的优势是能引用多个文件作为上下文，比如"@utils/\`parse.js\` 参考这个文件的风格"。

**Claude.ai 网页对话** 适合"先讨论再写代码"的场景。如果你对需求本身还没想清楚，需要先和 AI 聊几轮把需求澄清，Claude.ai 的长上下文和 Artifacts 预览特别好用。它会把生成的代码放到右侧 Artifacts 面板，你可以直接运行预览，确认无误再拷回项目。

**Claude Code / Codex CLI** 适合"在仓库里自动跑测试"的场景。单文件任务如果需要 AI 自己跑测试、看失败、再修，CLI Agent 比网页工具更顺手——它能直接 \`npm test\`，看到红测，自动循环修复。

一个粗略的选择规则：改小段用 Cmd+K；新文件用 Chat；需求没想清楚用 Claude.ai 网页；需要 AI 自己跑测试用 CLI Agent。

## 36.5 单文件任务常见踩坑

第一个坑是**需求描述太短**。"写个格式化函数"这种 prompt 几乎一定会得到不完整的实现。AI 不知道你要格式化什么、格式化成什么样、边界怎么处理，它只能猜，猜错了你还得返工。解药是用上面的 prompt 模板，把边界条件一条条列出来。

第二个坑是**不审查直接用**。AI 生成的代码经常"看起来对，实际上错"。常见的隐藏问题包括：用了 Node.js 不存在的 API（比如把浏览器的 \`btoa\` 用到 Node 里）、用了第三方库但没在 package.json 里声明、把异步函数写成同步的、忘了处理 Promise rejection。这些问题只有人工读一遍才能发现。

第三个坑是**测试和实现一起幻觉**。让 AI 同时写实现和测试时，有时候 AI 会写一份"实现"和一份"恰好能让实现通过的测试"，看起来覆盖率 100%，实际上没测到任何边界。解药是审查测试用例时，要问自己"这个测试如果删掉断言，实现还能不能挂"，如果删了断言实现照样过，说明测试是假的。更稳的做法是先让 AI 写测试（基于需求），再让它写实现让测试通过——测试驱动能让幻觉无所遁形。

第四个坑是**文档和代码脱节**。AI 写文档时容易把"它以为的需求"写进文档，而不是"你真实的需求"。审查文档时要对照需求描述逐条检查，确保文档里写的边界条件和需求里写的一致。

第五个坑是**忘了让 AI 说明依赖**。AI 经常默认引入 lodash、dayjs 这类常用库，但你的项目可能根本没装。审查时第一件事就是检查文件顶部的 import / require，确认每个依赖都在 package.json 里。如果引入了新依赖，要让 AI 说明"为什么需要这个依赖、能不能用标准库替代"。

把单文件工作流练熟，是 AI 编程的基本功。它看起来简单，但能把"5 步流程 + 结构化 prompt + 工具选型 + 5 个踩坑规避"内化成肌肉记忆，后续做全栈项目、做老项目重构时，你才能把单文件任务当成可靠的"积木"来组合。
`,
    code: `// =============================================================
// 第36章示例：单文件工作流编排器
// 模拟"需求 → 草稿 → 审查 → 修测试 → 文档"5 步流程，输出执行报告
// =============================================================

// ---- 单文件任务定义 ----
const TASKS = [
  {
    id: "T001",
    type: "工具函数",
    name: "金额格式化 formatMoney",
    inputs: "number（分）",
    outputs: "string（如 '¥1,234.56'）",
    boundaries: ["负数显示为 '-¥1,234.56'", "0 显示为 '¥0.00'", "NaN 抛 TypeError", "小数点保留两位"],
    tool: "Cursor Cmd+K",
    risks: ["边界遗漏", "依赖 dayjs 未声明", "测试假通过"],
  },
  {
    id: "T002",
    type: "脚本",
    name: "CSV 转 JSON 迁移脚本",
    inputs: "input.csv 文件路径",
    outputs: "output.json 文件",
    boundaries: ["空行跳过", "表头缺失抛错", "字段含逗号用双引号包裹", "UTF-8 BOM 兼容"],
    tool: "Claude Code CLI",
    risks: ["未处理大文件流式读取", "未声明 csv-parse 依赖", "编码错误"],
  },
  {
    id: "T003",
    type: "独立组件",
    name: "React 倒计时组件 CountDown",
    inputs: "props: { target: Date, onEnd: () => void }",
    outputs: "渲染剩余时间 mm:ss",
    boundaries: ["target 过期立即触发 onEnd", "组件卸载清理定时器", "负数归零"],
    tool: "Claude.ai Artifacts",
    risks: ["定时器泄漏", "SSR 不兼容", "props 变化未重置"],
  },
  {
    id: "T004",
    type: "单元测试",
    name: "为 utils/parse.js 补 Vitest 测试",
    inputs: "被测模块路径",
    outputs: "parse.test.js 文件",
    boundaries: ["覆盖所有导出函数", "边界用例真实", "覆盖率 ≥90%"],
    tool: "Copilot Chat",
    risks: ["改了被测源码", "边界用例造假", "mock 滥用"],
  },
];

// ---- 5 步工作流模板 ----
const WORKFLOW = [
  { step: 1, name: "描述需求", prompt: "输入/输出/边界三件套写清楚", output: "需求文档" },
  { step: 2, name: "AI 生成草稿", prompt: "用结构化模板喂 AI", output: "草稿代码 v1" },
  { step: 3, name: "人工审查", prompt: "查签名/边界/依赖/命名/API 真实性", output: "问题清单" },
  { step: 4, name: "AI 修测试", prompt: "把问题清单回灌 + 让 AI 写测试", output: "代码 v2 + 测试" },
  { step: 5, name: "AI 写文档", prompt: "JSDoc + 用法示例 + 异常说明", output: "文档" },
];

// ---- prompt 模板（与正文 36.3 对应）----
const PROMPT_TEMPLATE = [
  "<role> 资深工程师身份 + 风格 + 注释语言",
  "<task> 单文件产出，不拆分",
  "<requirement> 输入 + 输出 + 边界条件逐条",
  "<constraints> 依赖范围 + 纯函数 + 覆盖率 + JSDoc",
  "<output> 实现代码 + 测试代码，分两个代码块",
];

// ---- 执行单文件工作流模拟 ----
function runTask(task) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📌 " + task.id + " [" + task.type + "] " + task.name);
  console.log("  推荐工具：" + task.tool);
  console.log("  输入：" + task.inputs);
  console.log("  输出：" + task.outputs);
  console.log("  边界条件（" + task.boundaries.length + " 条）：");
  task.boundaries.forEach((b, i) => console.log("    " + (i + 1) + ". " + b));

  console.log("  5 步工作流执行：");
  WORKFLOW.forEach((w) => {
    console.log("    " + w.step + ". " + w.name + " → " + w.output);
    console.log("       prompt：" + w.prompt);
  });

  console.log("  风险点：");
  task.risks.forEach((r) => console.log("    ⚠ " + r));
  console.log("");
}

// ---- 输出 prompt 模板说明 ----
function printPromptTemplate() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 单文件 prompt 模板（5 个标签）");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  PROMPT_TEMPLATE.forEach((p, i) => console.log("  " + (i + 1) + ". " + p));
  console.log("");
}

// ---- 汇总 ----
function printSummary() {
  const totalBoundaries = TASKS.reduce((s, t) => s + t.boundaries.length, 0);
  const totalRisks = TASKS.reduce((s, t) => s + t.risks.length, 0);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 汇总");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  任务总数：" + TASKS.length);
  console.log("  边界条件总数：" + totalBoundaries);
  console.log("  风险点总数：" + totalRisks);
  console.log("  工作流步数：" + WORKFLOW.length);
  console.log("");
  console.log("  5 个常见踩坑：");
  console.log("    1. 需求描述太短 → 用模板把边界逐条列出");
  console.log("    2. 不审查直接用 → 人工读一遍，查 API 真实性");
  console.log("    3. 测试假通过 → TDD，先写测试再写实现");
  console.log("    4. 文档与代码脱节 → 对照需求逐条核对");
  console.log("    5. 忘了检查依赖 → 第一件事看 import 列表");
  console.log("\\n✅ 单文件工作流编排完成。建议在每个真实任务里复用此流程。");
}

// ---- 主流程 ----
console.log("╔══════════════════════════════════════════╗");
console.log("║   单文件开发工作流编排器（共 " + TASKS.length + " 个任务）  ║");
console.log("╚══════════════════════════════════════════╝\\n");

TASKS.forEach(runTask);
printPromptTemplate();
printSummary();
`
  },
  {
    id: "aiapp-flow-fullstack",
    icon: "🌐",
    group: "AI编程工作流",
    title: "全栈项目从零到一",
    content: `
# 第37章：全栈项目从零到一

## 37.1 全栈项目用 AI 搭的完整流程

单文件任务是积木，全栈项目是房子。用 AI 搭全栈应用不是"一句话让 AI 给我一个 SaaS"，而是要有一套分阶段的流程，每个阶段都有明确的输入、产出和验证方式。完整的流程分七步：需求 → 技术选型 → 数据库设计 → 后端 API → 前端 UI → 联调 → 部署。

**第 1 步：需求。** 在这一步要让 AI 帮你把模糊的想法变成结构化的需求文档。做法是：把脑子里的想法用自然语言告诉 AI（可以是 Claude.ai 网页对话），让它产出 PRD（产品需求文档），包括用户角色、核心用例、功能清单、非功能需求（性能/安全/合规）。这一步的关键是"让 AI 提问"，prompt 里加一句"在写 PRD 之前，先问我 5 个澄清问题"，能大幅提升需求质量。

**第 2 步：技术选型。** 把 PRD 喂给 AI，让它给出 2~3 套技术选型方案，每套包括前端框架、后端框架、数据库、部署方案，并对比优劣。AI 给的方案要让它说明"为什么这么选"，而不是只列名字。你要做的是从这些方案里挑一个，或者基于它们组合出你自己的方案。注意 AI 的技术选型会偏向"它训练数据里见得多的"——不一定是最新的，2026 年的新框架它可能不知道，所以这一步人工把关很重要。

**第 3 步：数据库设计。** 让 AI 基于需求设计数据库 schema。产出包括：表结构（字段名/类型/约束）、索引、外键关系、ER 图（用 Mermaid 表达）。这一步要让 AI 同时考虑"现在够用"和"未来扩展"——prompt 里加"请同时给出 MVP 阶段的最小 schema 和 V2 阶段的扩展 schema"。设计完 schema 后让 AI 生成对应的 migration 文件（Prisma migration / Drizzle migration / SQL 文件）。

**第 4 步：后端 API。** 让 AI 基于数据库 schema 和需求，设计 RESTful API 端点，并实现这些端点。产出包括：API 路由文件、数据模型层、业务逻辑层、错误处理中间件、输入校验（用 zod 或 joi）。这一步要让 AI 先输出"API 端点清单"（路径/方法/入参/出参/鉴权），你确认清单后再让它写代码。否则它可能会"想到哪写到哪"，端点命名不一致、鉴权策略不统一。

**第 5 步：前端 UI。** 让 AI 基于需求设计前端页面和组件。产出包括：页面路由、布局组件、业务组件、状态管理、与 API 的对接。这一步可以分两层：先用 v0 / Bolt.new / Lovable 这类"原型生成工具"快速产出 UI 草稿（视觉/交互），再把草稿代码接入到你的真实项目里（接 API、接路由、接状态管理）。

**第 6 步：联调。** 让 AI 帮你处理前后端联调的常见问题：CORS、认证（JWT 怎么传、Cookie 怎么配）、字段映射（后端返回 snake_case 前端要 camelCase）、错误处理（HTTP 状态码怎么映射到 UI 提示）。这一步最容易卡的是环境差异——本地能跑、部署后跑不通，所以要让 AI 同时产出"本地开发环境配置"和"生产环境配置"。

**第 7 步：部署。** 让 AI 产出部署相关的文件：Dockerfile、docker-compose.yml、CI/CD 配置（GitHub Actions）、环境变量清单（.env.example）、数据库迁移脚本、健康检查端点。这一步的关键是"让 AI 写出可重复的部署流程"，而不是"AI 告诉你怎么部署"——文档会过时，自动化脚本不会。

## 37.2 各阶段 prompt 模板

每个阶段的 prompt 都应该有明确的"输入/任务/产出格式"三件套。下面给出三个关键阶段的模板。

需求阶段 prompt 模板：

\`\`\`text
我有一个产品想法：<一句话描述>。
请帮我写一份 PRD，包括：
1. 目标用户与角色（不超过 3 类）
2. 核心用例 5 个（用 用户故事 格式）
3. 功能清单（MVP 必做 / V2 可做 分两组）
4. 非功能需求（性能 / 安全 / 合规各 2 条）
5. 风险与未决问题

在写 PRD 之前，先问我 5 个澄清问题，逐条编号。
\`\`\`

数据库设计阶段 prompt 模板：

\`\`\`text
基于以下 PRD，设计数据库 schema：
<贴 PRD>

要求：
1. 用 PostgreSQL，给出每张表的 DDL
2. 字段命名用 snake_case，表名用复数
3. 必须包含 created_at / updated_at / id（uuid）
4. 给出索引（包括唯一索引和复合索引）
5. 用 Mermaid erDiagram 画出关系图
6. 同时给出 Prisma schema 文件
7. MVP schema 和 V2 扩展 schema 分别给出
\`\`\`

后端 API 阶段 prompt 模板：

\`\`\`text
基于以下 schema 和 PRD，设计 RESTful API：
<贴 schema>

第一步：先输出 API 端点清单表格（路径/方法/入参/出参/鉴权/说明），不要写代码。
第二步：等我确认清单后，再实现端点。

实现要求：
- 用 Next.js App Router 的 route.ts
- 输入校验用 zod
- 错误统一用 ProblemDetails (RFC 7807) 格式
- 鉴权用 JWT，从 Cookie 读取
- 每个端点配 3 个测试用例（happy / 4xx / 5xx）
\`\`\`

模板的精髓是"先输出方案再写代码"，这能让 AI 在写代码前先把架构想清楚，避免边写边改。

## 37.3 用 v0 / Bolt.new / Lovable 快速原型

这三款工具都是"从描述到 UI"的快速原型生成器，但定位有差异。

**v0**（Vercel 出品）擅长生成 React + Tailwind + shadcn/ui 的组件和页面，产出代码可以直接拷到 Next.js 项目里运行。它的优势是"产出代码干净、和 Next.js 生态无缝衔接"，劣势是"复杂交互做不了，只适合做视觉和基础交互"。v0 的用法是：在对话框里描述"我要一个用户列表页，左边是搜索框，右边是表格，表格有分页"，它会生成 4 个候选版本，你挑一个继续改。

**Bolt.new**（StackBlitz 出品）能生成完整的全栈应用，前端 + 后端 + 数据库都在一起，跑在 StackBlitz 的 WebContainer 里。它的优势是"一键跑起来、不用本地配环境"，劣势是"产出代码量大、定制性差、迁移到自己的仓库需要清理"。Bolt.new 适合做"想法验证"——周末花两小时让它生成一个能跑的 demo，验证想法靠不靠谱。

**Lovable**（前 GPT Engineer）定位是"全栈应用生成器"，能生成前端 + Supabase 后端的应用。它的优势是"和 Supabase 深度集成、Auth/数据库一键开通"，劣势是"绑定了 Supabase 生态，换后端成本高"。Lovable 适合做"以 Supabase 为后端的小型 SaaS"。

这三款工具的共性是"快"，但快不代表能直接上生产。它们产出的是"原型"，原型的特点是功能齐备但工程化不足——没有测试、没有错误处理、没有性能优化、没有监控。从原型到生产还有一段路要走，这正是下一节要讲的。

## 37.4 用 Claude Code / Codex 实施完整项目

Claude Code 和 Codex CLI 这类终端 Agent 是"在真实仓库里干活"的工具，和上面三款原型工具是互补关系。典型的工作流是：用 v0 生成 UI 草稿 → 拷到真实仓库 → 用 Claude Code 接 API、加测试、加错误处理、加部署配置。

Claude Code 实施完整项目的流程是这样的：第一步，在仓库根目录运行 \`claude\` 启动 Agent；第二步，告诉它"基于 PRD.md 实现后端 API，schema 在 prisma/schema.prisma"，它会读文件、改文件、跑 \`npm run build\` 验证；第三步，它遇到不确定的地方会主动问你，比如"这里要不要做软删除？"；第四步，它跑通后会让你 review diff，确认后自动 commit。

Codex CLI 的流程类似，差异在于它更偏向"OpenAI 生态"，和 GitHub Copilot 的集成更紧密。两者选哪个看你的订阅——Max 订阅用 Claude Code 最划算，Copilot Pro 用 Codex CLI 最划算。

## 37.5 增量交付策略

用 AI 搭全栈项目最大的陷阱是"想一次性做完"。AI 一次性生成 5000 行代码，看起来很爽，但几乎一定跑不通——API 签名不一致、前后端字段对不上、数据库迁移没跑、环境变量没配，问题成堆。正确的做法是"增量交付"。

增量交付的节奏是"每个增量可独立验证"。比如做用户系统，增量拆解为：(1) 只做注册接口，跑通 curl；(2) 加登录接口，跑通 JWT 签发；(3) 加鉴权中间件，保护一个测试接口；(4) 前端做注册登录页，跑通端到端；(5) 加密码重置流程。每个增量的产出都能用 curl 或 Postman 验证，发现问题就在这个增量内修，不要堆到最后再调试。

每个增量交给 AI 时，prompt 里要明确"只做这一个增量，不要扩展"。AI 天然喜欢"顺便把相关的也做了"，这在增量交付里是灾难——它会改你还没准备好的文件，引入你还没验证的依赖。prompt 里加一句"严格只做以下任务，不要新增任何文件、不要新增任何依赖"，能压制这种倾向。

## 37.6 从原型到生产的差距弥合

原型能跑，不等于能上生产。从原型到生产要补五个洞。

**第一是测试。** 原型通常没测试。生产必须有单元测试（业务逻辑层）、集成测试（API 层）、E2E 测试（关键用户流程）。让 AI 基于现有代码补测试，覆盖率目标 70%起步，核心模块 90%。

**第二是错误处理。** 原型的错误处理通常是"console.log + 500"。生产必须有统一的错误中间件、结构化的错误响应、客户端友好的错误提示、服务端的错误日志（带 trace id）。让 AI 基于现有代码重构错误处理，prompt 里给明确的目标格式（比如 RFC 7807）。

**第三是安全。** 原型通常没考虑安全。生产必须做：输入校验（zod）、SQL 注入防护（用 ORM 而不是拼 SQL）、XSS 防护（React 默认转义 + CSP 头）、CSRF 防护（SameSite Cookie）、鉴权（JWT 过期 + 刷新）、限流（防爆破）。让 AI 做安全审查，prompt 里列这 6 项让它逐项检查。

**第四是性能。** 原型通常没优化。生产要关注：数据库索引（让 AI 分析慢查询加索引）、N+1 查询（让 AI 用 DataLoader 或 join 解决）、前端包大小（让 AI 做代码分割）、首屏渲染（让 AI 做 SSR 或流式渲染）。

**第五是可观测性。** 原型通常没监控。生产要加：结构化日志（JSON 格式 + trace id）、指标（Prometheus / OpenTelemetry）、错误追踪（Sentry）、健康检查端点（/healthz）、部署后烟雾测试。让 AI 产出这些可观测性基础设施的代码，prompt 里给具体工具栈（比如"用 pino + Sentry + /healthz"）。

## 37.7 组合拳：v0 生成 UI + Claude Code 接 API

把整章串起来，最实用的组合拳是"v0 做 UI + Claude Code 接 API"。具体流程：第一步，在 v0 里描述页面，挑一个满意的版本，拷贝代码；第二步，在真实仓库的 \`app/\` 目录下新建对应路由，把 v0 代码粘进去，本地能渲染；第三步，启动 Claude Code，告诉它"这个页面需要对接 /api/users 接口，请把 mock 数据替换成真实 fetch，错误处理用 toast，loading 用 skeleton"，它读你的页面代码、读 API 端点、改对接逻辑；第四步，让 Claude Code 加测试（组件测试 + API 测试）；第五步，让 Claude Code 加部署配置（Dockerfile + GitHub Actions）。

这个组合拳的精髓是"扬长避短"——v0 擅长视觉和交互，让它专注做 UI；Claude Code 擅长在真实仓库里做工程化，让它专注接 API、加测试、加部署。两者分工，比"用一个工具从头做到尾"效率高得多。
`,
    code: `// =============================================================
// 第37章示例：全栈项目交付编排器
// 模拟"需求 → 技术选型 → DB → API → UI → 联调 → 部署"7 步流程
// =============================================================

// ---- 全栈项目阶段定义 ----
const STAGES = [
  {
    step: 1,
    name: "需求",
    input: "脑中想法",
    output: "PRD（角色/用例/功能/非功能/风险）",
    tool: "Claude.ai 网页对话",
    promptKey: "先问 5 个澄清问题，再写 PRD",
    verify: "人工逐条确认 PRD 完整性",
  },
  {
    step: 2,
    name: "技术选型",
    input: "PRD",
    output: "2~3 套选型方案 + 对比",
    tool: "Claude.ai 网页对话",
    promptKey: "每套说明为什么这么选，不要只列名字",
    verify: "人工挑选或组合方案",
  },
  {
    step: 3,
    name: "数据库设计",
    input: "PRD + 选型",
    output: "DDL + Mermaid ER 图 + Prisma schema",
    tool: "Claude Code CLI",
    promptKey: "MVP schema 和 V2 schema 分别给出",
    verify: "跑通 prisma migrate dev",
  },
  {
    step: 4,
    name: "后端 API",
    input: "schema + PRD",
    output: "路由 + 模型 + 业务 + 校验 + 测试",
    tool: "Claude Code CLI",
    promptKey: "先输出端点清单表格，确认后再写代码",
    verify: "curl 每个端点 happy/4xx/5xx",
  },
  {
    step: 5,
    name: "前端 UI",
    input: "PRD + API 清单",
    output: "页面路由 + 组件 + 状态 + 对接",
    tool: "v0 → Claude Code 接入",
    promptKey: "v0 出原型，Claude Code 接 API",
    verify: "浏览器跑通关键流程",
  },
  {
    step: 6,
    name: "联调",
    input: "前后端代码",
    output: "统一错误处理 + 字段映射 + CORS",
    tool: "Claude Code CLI",
    promptKey: "本地配置 + 生产配置分别产出",
    verify: "端到端跑通注册/登录/CRUD",
  },
  {
    step: 7,
    name: "部署",
    input: "完整项目",
    output: "Dockerfile + CI/CD + .env.example + 健康检查",
    tool: "Claude Code CLI",
    promptKey: "产出可重复的自动化脚本，不要只写文档",
    verify: "在干净环境跑 docker compose up",
  },
];

// ---- 增量交付拆解（以用户系统为例）----
const INCREMENTS = [
  { id: 1, name: "注册接口", verify: "curl POST /api/register 返回 201" },
  { id: 2, name: "登录接口", verify: "curl POST /api/login 返回 JWT" },
  { id: 3, name: "鉴权中间件", verify: "无 token 访问受保护接口返回 401" },
  { id: 4, name: "前端注册登录页", verify: "浏览器跑通端到端" },
  { id: 5, name: "密码重置流程", verify: "邮件链接可重置密码" },
];

// ---- 从原型到生产的 5 个洞 ----
const PRODUCTION_GAPS = [
  { gap: "测试", target: "单元 + 集成 + E2E，覆盖率 70%+，核心 90%+", action: "让 AI 基于现有代码补测试" },
  { gap: "错误处理", target: "统一中间件 + RFC 7807 + 错误日志带 trace id", action: "让 AI 重构错误处理层" },
  { gap: "安全", target: "zod 校验 + ORM 防 SQL 注入 + CSRF + 限流 + JWT 刷新", action: "让 AI 做 6 项安全审查" },
  { gap: "性能", target: "索引 + N+1 修复 + 包大小 + 首屏 SSR", action: "让 AI 分析慢查询和 bundle" },
  { gap: "可观测性", target: "pino 日志 + Sentry + /healthz + 烟雾测试", action: "让 AI 产出可观测性基础设施" },
];

// ---- 工具能力对比 ----
const TOOLS = [
  { name: "v0", vendor: "Vercel", strength: "React + Tailwind + shadcn/ui 组件", use: "UI 原型", limit: "复杂交互做不了" },
  { name: "Bolt.new", vendor: "StackBlitz", strength: "全栈应用一键跑起来", use: "想法验证", limit: "产出代码量大，迁移要清理" },
  { name: "Lovable", vendor: "前 GPT Engineer", strength: "Supabase 深度集成", use: "小 SaaS", limit: "绑定 Supabase 生态" },
  { name: "Claude Code", vendor: "Anthropic", strength: "真实仓库 Agent + 跑测试", use: "工程化", limit: "需要订阅或 API Key" },
  { name: "Codex CLI", vendor: "OpenAI", strength: "GitHub 生态集成", use: "工程化", limit: "需要 Copilot Pro 或 API" },
];

// ---- 打印阶段 ----
function printStages() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   全栈项目 7 步流程（从零到一）           ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  STAGES.forEach((s) => {
    console.log("【第 " + s.step + " 步】" + s.name);
    console.log("  输入：" + s.input);
    console.log("  产出：" + s.output);
    console.log("  工具：" + s.tool);
    console.log("  prompt 关键：" + s.promptKey);
    console.log("  验证：" + s.verify);
    console.log("");
  });
}

// ---- 打印增量 ----
function printIncrements() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   增量交付拆解（用户系统示例）            ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  INCREMENTS.forEach((i) => {
    console.log("  增量 " + i.id + "：" + i.name);
    console.log("    验证 → " + i.verify);
  });
  console.log("\\n  原则：每个增量可独立验证，发现问题在本增量内修。");
  console.log("  prompt 加：'严格只做以下任务，不要新增文件或依赖'\\n");
}

// ---- 打印生产差距 ----
function printGaps() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   从原型到生产的 5 个洞                   ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  PRODUCTION_GAPS.forEach((g) => {
    console.log("  ▢ " + g.gap);
    console.log("    目标：" + g.target);
    console.log("    行动：" + g.action);
  });
  console.log("");
}

// ---- 打印工具对比 ----
function printTools() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   工具能力对比                            ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  console.log("  名称           厂商             用途       优势");
  TOOLS.forEach((t) => {
    const pad = (s, n) => s + " ".repeat(Math.max(0, n - s.length));
    console.log("  " + pad(t.name, 14) + pad(t.vendor, 16) + pad(t.use, 10) + t.strength);
    console.log("                 限制：" + t.limit);
  });
  console.log("");
}

// ---- 主流程 ----
printStages();
printIncrements();
printGaps();
printTools();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 组合拳：v0 出 UI + Claude Code 接 API");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  1. v0 描述页面 → 拷贝代码到 app/ 路由");
console.log("  2. Claude Code 读页面 + 读 API 端点");
console.log("  3. 让它把 mock 数据换成真实 fetch");
console.log("  4. 加 toast 错误处理 + skeleton loading");
console.log("  5. 加组件测试 + API 测试");
console.log("  6. 加 Dockerfile + GitHub Actions");
console.log("\\n✅ 全栈交付编排完成。建议按 7 步顺序 + 增量节奏推进。");
`
  },
  {
    id: "aiapp-flow-refactor",
    icon: "🔨",
    group: "AI编程工作流",
    title: "老项目改造重构",
    content: `
# 第38章：老项目改造重构

## 38.1 老项目改造的难点

老项目改造是 AI 编程里"最有价值但最难做"的场景。最有价值是因为老项目体量大、技术债重、改造后收益明显；最难做是因为老项目通常带着三个包袱——无文档、无测试、技术债。

**无文档**意味着 AI 没法快速理解项目"应该做什么"。新项目你可以把 PRD 喂给 AI，老项目连 PRD 都没有，AI 只能从代码反推意图，反推经常错。比如一个看起来在做"用户状态更新"的函数，可能因为 5 年前的某个业务规则而隐含了"周末不更新"的逻辑，AI 看不出来。

**无测试**意味着改造后没法验证"有没有改坏"。新项目边写边补测试，老项目可能一个测试都没有，改一行代码不知道有没有 break 上游。AI 在这种项目里干活特别危险——它改了 A 处，B 处可能悄悄崩了，没人知道。

**技术债**意味着代码里有大量"反直觉"的实现：global 变量、隐式依赖、复制粘贴的代码块、被注释掉的逻辑（其实还在用）、命名误导（函数名叫 getUser 实际在删 user）。AI 读这种代码会被误导，基于误导的理解做改造，结果灾难性。

理解这三个难点后，老项目改造的核心策略就清楚了：**改造前先让 AI 帮你建上下文，改造时用渐进策略，改造后用测试兜底**。下文按这个思路展开。

## 38.2 改造前的准备：让 AI 生成代码地图与依赖图

改造老项目的第一步不是改代码，是"让 AI 看懂代码"。做法是让 AI 产出两份文档：**代码地图**和**依赖图**。

**代码地图**是项目的"鸟瞰图"。把项目根目录给 Claude Code 或 Codex CLI，让它遍历 \`src/\` 目录，产出一份 Markdown 文档，包括：每个目录的职责（这个目录放什么类型的代码）、每个核心文件的用途（这个文件干什么）、关键入口（启动文件、路由文件、配置文件）、模块依赖关系（谁依赖谁）。这份文档的价值是让后续的改造有"地图"可依。

prompt 模板：

\`\`\`text
请遍历 src/ 目录，产出一份代码地图（CODEMAP.md），包括：
1. 目录树（标注每个目录的职责）
2. 核心文件清单（路径 + 一句话用途 + 依赖的其他文件）
3. 入口文件分析（启动流程）
4. 模块依赖关系（用 Mermaid graph 画出）
5. 你发现的可疑点（命名误导 / 复制粘贴 / 全局变量 / 隐式依赖）

不要修改任何代码，只产出文档。
\`\`\`

**依赖图**是模块级别的"调用关系图"。让 AI 用 Mermaid 画出一个模块被哪些模块调用、它又调用了哪些模块。这份图的价值是改造时能预判"改这里会影响哪些地方"。对于大型项目，依赖图可能很复杂，可以按子系统拆分多张图。

prompt 模板：

\`\`\`text
基于 src/ 目录，用 Mermaid graph 画出模块依赖关系图。
- 节点是文件或目录
- 边表示"A 依赖 B"
- 用子图把同一个子系统的文件圈起来
- 高亮"被 5 个以上文件依赖"的核心模块（这些模块改造风险最高）

不要修改任何代码。
\`\`\`

这两份文档产出后，你才对项目有了"AI 视角的理解"。接下来才能选改造策略。

## 38.3 四种改造策略

老项目改造有四种经典策略，每种适合不同场景。

**绞杀者模式（Strangler Fig）**：不碰老代码，新功能用新栈写，老功能逐步用新实现替换，最后老系统被"绞杀"掉。适合：老系统还能跑但维护成本高、业务不能停、改造周期长。优点：风险最低，每一步都能回滚；缺点：周期长，过渡期维护两套系统成本高。AI 的角色：帮你写新实现，同时帮你写"流量切换"的逻辑（路由层把请求从老系统导到新系统）。

**分支并行**：在另一个分支上用新栈重写整个模块，写完后切流量。适合：模块边界清晰、能短期内完整重写、业务能接受短暂停机切换。优点：改造彻底；缺点：重写期间老分支还在迭代，合并冲突可怕。AI 的角色：基于老代码的"行为契约"（不是实现）在新分支上重写，prompt 里要明确"参考老代码的行为，但用新栈实现，不要照搬"。

**原地重构**：不换技术栈，在原代码上改架构（拆函数、提模块、加类型）。适合：技术栈还能用但代码质量差、不想冒换栈风险。优点：风险可控；缺点：改动量大、收益慢。AI 的角色：分模块逐个重构，每改一个模块加测试，prompt 里要明确"只重构这一模块，不要碰其他模块"。

**重写**：从零用新栈重写整个项目。适合：技术栈严重过时（如 PHP 5、Angular 1）、业务规模允许停一段时间、有充足人力。优点：彻底脱胎换骨；缺点：风险最高，"第二系统效应"容易让重写拖很久。AI 的角色：基于老项目的行为产出 PRD，然后按新项目流程做。重写前一定要让 AI 把老项目的行为挖出来——不挖清楚就重写，一定会漏掉那些"隐含但重要"的规则。

## 38.4 JavaScript → TypeScript 迁移：7 步渐进法

JS → TS 迁移是"原地重构 + 加类型"的典型场景。一次性改 \`allowJs: false\` 几乎一定挂，正确做法是 7 步渐进。

**第 1 步：开 allowJs + checkJs。** 在 tsconfig 里开 \`allowJs: true\` 和 \`checkJs: false\`，让 TS 编译器能吃 JS 文件。这一步不改任何代码，只是让 TS 编译器"看得见"JS 文件。验证：\`tsc --noEmit\` 能跑过。

**第 2 步：加 JSDoc 类型注解。** 让 AI 给关键 JS 文件加 JSDoc 注释（/\* * @param {string} name * /\`），TS 编译器会读 JSDoc 推断类型。这一步不改文件后缀，只加注释，风险最低。prompt 让 AI"基于代码行为推断类型，不要改变运行时行为"。

**第 3 步：开 checkJs。** 把 \`checkJs\` 改成 true，TS 编译器开始检查 JS 文件的类型错误。这一步会爆出大量错误（几百到几千），不要慌。让 AI 按"错误数从多到少"排序文件，逐个文件修。每个文件修完跑一遍 \`tsc --noEmit\` 确认错误数下降。

**第 4 步：核心模块改 .ts。** 把核心模块（被很多文件依赖的）从 .js 改成 .ts。这一步要谨慎——改一个核心模块可能让一堆依赖它的文件报错。建议一次只改一个核心模块，改完跑测试，确认无回归再改下一个。

**第 5 步：业务文件批量改 .ts。** 核心模块稳定后，业务文件可以批量改。让 AI 用脚本批量改后缀，然后逐个文件加类型。这一步 AI 的"类型推断补全"特别有用，下文专门讲。

**第 6 步：开 strict。** 所有文件改完后，逐步开 strict 选项：\`noImplicitAny\` → \`strictNullChecks\` → \`strictFunctionTypes\` → \`strict\`。每个选项开了都会爆错，逐个修。这一步最耗时，但收益最大——strict 模式下 TS 才真正发挥价值。

**第 7 步：关 allowJs。** 所有文件都是 .ts 后，关掉 \`allowJs\`，项目纯 TS。这一步完成后，类型安全就有了编译时保障。

## 38.5 让 AI 做"类型推断补全"

JS → TS 迁移里最繁琐的活是"给每个变量/参数/返回值加类型"。人工做要几小时，AI 做几分钟。但 AI 做类型推断有讲究。

**不要让 AI"猜类型"**，让它"基于上下文推断"。prompt 里明确："基于函数的实现和调用方，推断最具体的类型，不要用 any。如果无法确定，用 unknown 并在注释里说明不确定的点。"

**让 AI 同时改函数签名和调用方**。如果函数原来是 \`(a, b) => a + b\`，AI 推断成 \`(a: number, b: number): number\`，调用方可能传了 string，这时要让 AI 同时改调用方（加类型转换或修正传参）。如果只改函数不改调用方，会爆一堆错。

**让 AI 输出"类型推断依据"**。prompt 里加"每个推断的类型，在注释里说明依据（如 '// 推断为 number，因为 return a + b 且 a/b 在调用方都是 number'）"。这个依据让你能 review 推断是否合理，发现 AI 的幻觉。

**用 AI 生成类型守卫**。对于无法确定类型的变量（比如第三方 API 返回的数据），让 AI 生成 zod schema 或 type guard 函数，在运行时校验类型。这比"用 any 糊过去"安全得多。

## 38.6 Python 2 → 3 迁移

Python 2 → 3 是另一类经典迁移。虽然 Python 2 已 EOL 多年，但大量老项目仍在用。AI 在这个场景里特别有用，因为迁移规则很机械（print 语句改函数、dict 方法改返回视图、unicode 处理改 str/bytes），AI 能批量改。

流程是：第一步，用 \`2to3\` 工具跑一遍自动改（机械规则）；第二步，让 AI 处理 \`2to3\` 改不了的（str/bytes 边界、迭代器/列表边界、异常链）；第三步，让 AI 加类型注解（Python 3 的 typing）；第四步，跑测试确认行为一致。

关键 prompt：

\`\`\`text
以下 Python 2 代码已用 2to3 转过一轮，但仍有 str/bytes 和迭代器边界问题。
请：
1. 找出所有 str/bytes 混用点，标注每个点应该用 str 还是 bytes
2. 找出所有 range/zip/map 在迭代后被索引用的地方（这些需要 list() 包裹）
3. 给所有函数加 typing 注解
4. 不要改变运行时行为

代码：
<贴代码>
\`\`\`

## 38.7 框架升级：Vue 2 → 3 与 React Class → Hooks

**Vue 2 → 3** 升级的难点是 Options API 到 Composition API 的迁移。Vue 3 仍兼容 Options API，所以可以渐进迁移：第一步，升 Vue 3 + 兼容模式（\`@vue/compat\`），跑通现有代码；第二步，新组件用 Composition API 写；第三步，老组件逐个迁移，AI 把 data/methods/computed 改成 ref/reactive/computed；第四步，关掉兼容模式。AI 在第三步最有用——它能机械地把 Options API 改成 Composition API，prompt 里给明确的对照规则。

**React Class → Hooks** 升级的难点是生命周期到 effect 的迁移。Class 的 componentDidMount/componentDidUpdate/componentWillUnmount 三件套要合成一个 useEffect，初学者容易写出 bug。AI 在这里要谨慎用——它经常把多个生命周期粗暴合成一个 effect，导致依赖数组错乱。建议让 AI 一个组件一个组件改，每个组件改完跑测试。prompt 里明确"effect 的依赖数组必须列全，不要用 // eslint-disable-next-line 糊过去"。

无论哪种框架升级，**测试是底线**。升级前必须先有测试覆盖（没有就让 AI 补），升级后跑同一套测试，行为不变才算通过。没有测试的升级等于在黑箱里改东西，AI 再聪明也不可靠。
`,
    code: `// =============================================================
// 第38章示例：老项目改造策略编排器
// 输出 4 种改造策略对比、JS→TS 7 步迁移、类型推断补全流程
// =============================================================

// ---- 4 种改造策略 ----
const STRATEGIES = [
  {
    name: "绞杀者模式",
    fit: "老系统还能跑、业务不能停、周期长",
    pros: "风险最低，每步可回滚",
    cons: "过渡期维护两套",
    aiRole: "写新实现 + 写流量切换路由",
  },
  {
    name: "分支并行",
    fit: "模块边界清晰、能短期重写、可短暂停机",
    pros: "改造彻底",
    cons: "合并冲突可怕",
    aiRole: "基于老代码行为契约在新分支重写",
  },
  {
    name: "原地重构",
    fit: "技术栈还能用、代码质量差、不想换栈",
    pros: "风险可控",
    cons: "改动量大、收益慢",
    aiRole: "分模块重构 + 每模块加测试",
  },
  {
    name: "重写",
    fit: "技术栈严重过时、业务能停、人力充足",
    pros: "彻底脱胎换骨",
    cons: "风险最高、第二系统效应",
    aiRole: "挖老项目行为 → 产出 PRD → 按新项目做",
  },
];

// ---- JS → TS 7 步迁移 ----
const TS_MIGRATION = [
  { step: 1, name: "开 allowJs + checkJs:false", verify: "tsc --noEmit 跑过", risk: "无（不改代码）" },
  { step: 2, name: "加 JSDoc 类型注解", verify: "类型推断可用", risk: "极低（只加注释）" },
  { step: 3, name: "开 checkJs:true", verify: "错误数从多到少排序修复", risk: "中（爆大量错）" },
  { step: 4, name: "核心模块改 .ts", verify: "改一个跑一次测试", risk: "中高（核心影响面大）" },
  { step: 5, name: "业务文件批量改 .ts", verify: "AI 类型推断补全", risk: "中" },
  { step: 6, name: "逐步开 strict", verify: "noImplicitAny → strictNullChecks → strict", risk: "高（最耗时）" },
  { step: 7, name: "关 allowJs", verify: "纯 TS 项目", risk: "低（收尾）" },
];

// ---- 类型推断补全 prompt 要点 ----
const TYPE_INFERENCE_TIPS = [
  "基于上下文推断，不要用 any，不确定用 unknown",
  "同时改函数签名和调用方，避免只改一半",
  "输出推断依据（注释说明为什么是这个类型）",
  "无法确定的运行时数据用 zod schema 校验",
];

// ---- 改造前准备文档 ----
const PREP_DOCS = [
  {
    name: "代码地图 CODEMAP.md",
    prompt: "遍历 src/，输出目录职责 + 核心文件用途 + 入口分析 + 可疑点",
    output: "Markdown 文档",
  },
  {
    name: "依赖图",
    prompt: "Mermaid graph 画模块依赖，高亮被 5+ 文件依赖的核心模块",
    output: "Mermaid 图（按子系统拆分）",
  },
];

// ---- 框架升级对比 ----
const FRAMEWORK_UPGRADES = [
  {
    from: "Vue 2",
    to: "Vue 3",
    difficulty: "Options API → Composition API",
    flow: "升 Vue 3 + compat → 新组件用 Comp → 老组件逐个迁 → 关 compat",
    aiTip: "AI 机械对照 data→ref / methods→函数 / computed→computed",
  },
  {
    from: "React Class",
    to: "React Hooks",
    difficulty: "生命周期 → useEffect",
    flow: "逐组件改 → 改完跑测试",
    aiTip: "effect 依赖数组必须列全，不许 eslint-disable",
  },
  {
    from: "Python 2",
    to: "Python 3",
    difficulty: "str/bytes + 迭代器边界",
    flow: "2to3 自动改 → AI 处理边界 → 加 typing → 跑测试",
    aiTip: "标注每处 str/bytes 应该用哪个，迭代器被索引要 list() 包裹",
  },
];

// ---- 打印策略 ----
function printStrategies() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   老项目改造 4 种策略                     ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  STRATEGIES.forEach((s, i) => {
    console.log((i + 1) + ". " + s.name);
    console.log("   适合：" + s.fit);
    console.log("   优点：" + s.pros);
    console.log("   缺点：" + s.cons);
    console.log("   AI 角色：" + s.aiRole);
    console.log("");
  });
}

// ---- 打印 JS→TS 迁移 ----
function printTSMigration() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   JS → TS 渐进迁移 7 步法                 ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  TS_MIGRATION.forEach((t) => {
    console.log("  第 " + t.step + " 步：" + t.name);
    console.log("    验证：" + t.verify);
    console.log("    风险：" + t.risk);
  });
  console.log("");
}

// ---- 打印类型推断 tips ----
function printTypeTips() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📝 AI 类型推断补全 4 要点");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  TYPE_INFERENCE_TIPS.forEach((t, i) => console.log("  " + (i + 1) + ". " + t));
  console.log("");
}

// ---- 打印准备工作 ----
function printPrep() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   改造前准备：让 AI 产出两份文档          ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  PREP_DOCS.forEach((d) => {
    console.log("  ▢ " + d.name);
    console.log("    prompt：" + d.prompt);
    console.log("    产出：" + d.output);
  });
  console.log("");
}

// ---- 打印框架升级 ----
function printFrameworkUpgrades() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   框架升级对比                            ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  FRAMEWORK_UPGRADES.forEach((f) => {
    console.log("  " + f.from + " → " + f.to);
    console.log("    难点：" + f.difficulty);
    console.log("    流程：" + f.flow);
    console.log("    AI 提示：" + f.aiTip);
  });
  console.log("");
}

// ---- 主流程 ----
printPrep();
printStrategies();
printTSMigration();
printTypeTips();
printFrameworkUpgrades();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚠ 老项目改造铁律");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  1. 改造前先让 AI 产出代码地图 + 依赖图");
console.log("  2. 没测试就先让 AI 补测试，再改");
console.log("  3. 用渐进策略（绞杀者 / 7 步法），不要一次梭哈");
console.log("  4. AI 类型推断要 review 依据，发现幻觉");
console.log("  5. effect 依赖数组不许 eslint-disable\\n");
console.log("✅ 改造编排完成。建议每个老项目都按此流程评估与推进。");
`
  },
  {
    id: "aiapp-flow-api",
    icon: "🔌",
    group: "AI编程工作流",
    title: "API 设计与联调",
    content: `
# 第39章：API 设计与联调

## 39.1 让 AI 设计 RESTful API

让 AI 设计 API 看起来简单——"给我设计一个用户接口的 API"，它就会给你一串端点。但这样得到的 API 通常不够好：命名不一致、状态码乱用、错误格式随便、分页/排序/过滤策略不统一。要拿到真正可用的 API 设计，prompt 必须把"设计原则"讲清楚。

设计原则应该在 prompt 里明确这五条：第一，**资源命名用复数名词**（\`/users\` 而不是 \`/user\` 或 \`/getUsers\`）；第二，**用 HTTP 方法表达动作**（GET 查、POST 增、PUT/PATCH 改、DELETE 删，不要把动作塞进路径）；第三，**状态码用 RFC 7231 标准**（200/201/204/400/401/403/404/409/422/500，不要全用 200 然后在 body 里塞 code）；第四，**分页/排序/过滤统一**（分页用 \`?page=1&pageSize=20\` 或 cursor，排序用 \`?sort=-created_at\`，过滤用 \`?status=active\`）；第五，**错误格式统一**（用 RFC 7807 ProblemDetails，不要每个端点一种错误格式）。

prompt 模板：

\`\`\`text
基于以下数据模型，设计一套 RESTful API：
<贴数据模型>

设计原则（必须遵守）：
1. 资源路径用复数名词
2. HTTP 方法表达动作，动作不进路径
3. 状态码用 RFC 7231 标准
4. 分页用 cursor，排序用 ?sort=-field，过滤用 ?field=value
5. 错误用 RFC 7807 ProblemDetails 格式
6. 鉴权用 Bearer JWT，受保护接口标注 [Auth]

产出格式：
- 表格：路径 | 方法 | 入参 | 出参 | 鉴权 | 说明
- 不要写实现代码
- 列出每个资源的 CRUD 端点 + 必要的子资源端点
- 列出每个端点会返回的状态码及含义
\`\`\`

这个模板的关键是"先出表格不写代码"。表格让你能在写代码前 review 设计，发现命名不一致或缺失端点。review 通过后再让 AI 写实现。

## 39.2 让 AI 生成 OpenAPI 规范

OpenAPI（前 Swagger Specification）是 API 的"机器可读契约"。有了 OpenAPI 规范文件，你能自动生成文档、Mock Server、客户端 SDK、测试用例——一鱼多吃。让 AI 生成 OpenAPI 规范是 API 开发的"基础设施投资"。

prompt 模板：

\`\`\`text
基于以下 API 设计表格，生成 OpenAPI 3.1 规范文件（YAML）：
<贴设计表格>

要求：
1. 用 OpenAPI 3.1.0
2. 服务器地址用 https://api.example.com/v1
3. 鉴权用 Bearer JWT（securitySchemes）
4. 每个端点配完整的 request schema 和 response schema
5. 错误响应用 RFC 7807 ProblemDetails schema（components/schemas/Problem）
6. 所有 schema 用 $ref 引用，不要内联
7. 每个字段写 description
8. 分页响应用统一的 PaginatedResponse 泛型 schema
9. 标注必填字段（required）
10. 给每个端点至少 1 个示例（examples）

产出：单个 YAML 文件，可直接用 swagger-cli validate 校验。
\`\`\`

产出 OpenAPI 后，立即用 \`swagger-cli validate\` 或 \`redocly lint\` 校验。AI 生成的 OpenAPI 经常有小语法错（缩进、$ref 路径错），校验能立刻发现。校验通过后，把文件提交到仓库，作为后续所有 API 工作的"唯一真相来源"。

## 39.3 让 AI 生成 API 文档

有了 OpenAPI 规范，API 文档可以自动生成。两种主流工具：**Swagger UI** 和 **Redoc**。

Swagger UI 是交互式文档——不仅能看，还能在页面上点"Try it out"直接发请求。适合开发阶段、内部 API。集成方式：用 \`swagger-ui-express\` 中间件挂载到 \`/docs\` 路径，传入 OpenAPI YAML 文件路径即可。

Redoc 是只读文档——渲染漂亮、三栏布局、适合对外发布。适合生产环境、公开 API。集成方式：用 \`redoc-cli\` 把 OpenAPI 文件构建成静态 HTML，部署到 CDN。

让 AI 帮你做集成的 prompt：

\`\`\`text
我有一个 Next.js App Router 项目，openapi.yaml 在项目根目录。
请：
1. 安装并配置 swagger-ui-express，挂载到 /api-docs 路径（开发环境用）
2. 配置 redoc-cli 构建，把产物放到 public/api-docs（生产环境用）
3. 在 package.json 加脚本：
   - "docs:dev": 启动 dev server 并打开 /api-docs
   - "docs:build": redoc-cli 构建
4. 确保 openapi.yaml 修改后 docs:build 能重新生成

不要修改 openapi.yaml 本身。
\`\`\`

## 39.4 让 AI 生成 Mock Server

前后端并行开发时，前端不能等后端 API 做完才动工。Mock Server 让前端基于"约定的 API 契约"先跑起来。有了 OpenAPI 规范，Mock Server 可以零代码生成。

主流工具是 **Prism**（Stoplight 出品）和 **MSW**（Mock Service Worker）。Prism 是独立 Mock Server，命令行启动：\`prism mock openapi.yaml\`，会起一个本地服务器，按 OpenAPI 规范返回 mock 数据。MSW 是浏览器/Node 端的 mock 库，能在前端代码里拦截 fetch 请求返回 mock，适合测试。

让 AI 配置 Prism 的 prompt：

\`\`\`text
基于 openapi.yaml，配置 Prism Mock Server：
1. 安装 @stoplight/prism-cli
2. 在 package.json 加脚本："mock": "prism mock openapi.yaml -p 4010"
3. 给每个端点在 OpenAPI 里加 examples（如果还没有）
4. 让 Prism 优先返回 examples 里的数据，没有 examples 时按 schema 生成
5. 启动后能在 http://localhost:4010 访问所有端点

确保 mock 数据真实（用真实姓名、邮箱、日期），不要用 "string" "0" 这种占位。
\`\`\`

## 39.5 让 AI 生成前端 SDK 客户端

手写前端 API 客户端是重复劳动——每个端点一个函数、每个函数处理 URL/参数/请求体/错误。有了 OpenAPI 规范，SDK 可以自动生成。主流工具是 **openapi-typescript-codegen** 和 **orval**。

openapi-typescript-codegen 把 OpenAPI 转成 TypeScript 客户端代码，每个端点一个函数，类型完备。用法：\`openapi --input openapi.yaml --output src/api/client\`。

orval 更进一步——它生成的不是手动调用的客户端，而是 React Query / SWR 的 hooks。用法：在 \`orval.config.ts\` 里配置 OpenAPI 路径和目标（React Query），跑 \`orval\` 命令，生成 \`src/api/hooks.ts\`，里面是 \`useGetUsers\` \`useCreateUser\` 这样的 hooks，前端直接用。

让 AI 配置 orval 的 prompt：

\`\`\`text
基于 openapi.yaml，用 orval 生成 React Query hooks：
1. 安装 orval 和 @tanstack/react-query
2. 创建 orval.config.ts：
   - input: ./openapi.yaml
   - output.target: src/api/hooks.ts
   - output.client: react-query
   - output.override.mutator: src/api/fetcher.ts（自定义 fetcher 处理鉴权和错误）
3. 实现 src/api/fetcher.ts：
   - 自动加 Authorization Bearer 头
   - 处理 401 时跳登录
   - 错误用 ProblemDetails 格式解析后抛出
4. 在 package.json 加脚本："gen:api": "orval"
5. 确保 openapi.yaml 修改后跑 gen:api 能重新生成

不要手写 hooks，全部由 orval 生成。
\`\`\`

## 39.6 让 AI 联调前后端

联调是"理论上应该顺、实际上总卡"的环节。常见卡点和让 AI 处理的 prompt。

**CORS**：后端没配 CORS，前端跨域请求被浏览器拦截。让 AI 在后端配 CORS 中间件：

\`\`\`text
配置 Next.js API 路由的 CORS：
- 允许来源：开发环境 localhost:3000，生产环境 https://app.example.com
- 允许方法：GET POST PUT PATCH DELETE OPTIONS
- 允许头：Authorization Content-Type
- 凭证：true（因为用 Cookie 传 JWT）
- 预检缓存：600 秒

写一个 cors.ts 中间件，所有路由都用它。
\`\`\`

**认证**：JWT 怎么传？前端发请求时加 Authorization 头，后端从 header 读。但还有"Cookie vs LocalStorage"之争。LocalStorage 容易被 XSS 偷，Cookie（HttpOnly + SameSite）更安全但要配 CORS credentials。让 AI 同时配置前后端：

\`\`\`text
配置 JWT 认证的前后端：
- 后端：登录接口签发 JWT，写到 HttpOnly + SameSite=Lax + Secure 的 Cookie
- 后端：所有受保护接口从 Cookie 读 JWT，验证后注入 request.user
- 前端：fetcher 默认 credentials: 'include'
- 前端：401 时清状态跳登录页
- 生产环境：Cookie 域名配置（父域共享）

给出前后端代码。
\`\`\`

**字段映射**：后端用 snake_case（Python/Rust 习惯），前端用 camelCase（JS 习惯）。让 AI 在 fetcher 层做自动转换：

\`\`\`text
在 src/api/fetcher.ts 里实现字段命名自动转换：
- 请求时：把 body 的 camelCase 转 snake_case
- 响应时：把 body 的 snake_case 转 camelCase
- 用一个递归函数处理嵌套对象和数组
- 保留自定义字段名（如果某个字段标了 @keepCase 就不转）

不要用 lodash，自己实现一个轻量函数。
\`\`\`

## 39.7 GraphQL API 设计

REST 之外，GraphQL 是另一种 API 风格。GraphQL 的优势是"前端要什么就拿什么"，避免 over-fetching 和 under-fetching。让 AI 设计 GraphQL API 的 prompt 与 REST 不同。

\`\`\`text
基于以下数据模型，设计 GraphQL Schema：
<贴数据模型>

要求：
1. 用 GraphQL SDL 写 schema
2. Query：每个资源一个 list query 和一个 single query
3. Mutation：每个资源 create/update/delete
4. 分页用 Relay Connection 规范（edges/node/pageInfo/cursor）
5. 鉴权用 directive @auth，受保护字段/查询标注
6. 错误用 Union 返回（Result = Success | Error）
7. 输入用 Input Type，不要直接用对象类型做参数
8. N+1 防护：在 resolver 里用 DataLoader

产出：
- schema.graphql 文件
- 每个 Query/Mutation 的 resolver 实现骨架（TypeScript）
- DataLoader 的实现骨架
\`\`\`

GraphQL 的关键不是写 schema（AI 写得很好），是写 resolver 不出 N+1。让 AI 在每个 list resolver 里默认用 DataLoader 批量加载关联数据，能避免 90% 的 N+1 问题。

## 39.8 OpenAPI 优先工作流

把这一章串起来，最值得内化的工作流是 **OpenAPI 优先（OpenAPI-first）**。它的核心是"先写 OpenAPI 规范，再做其他所有事"。

完整流程：第一步，让 AI 基于数据模型产出 API 设计表格（review 设计）；第二步，让 AI 把表格转成 OpenAPI 3.1 YAML（用 swagger-cli validate 校验）；第三步，把 OpenAPI 提交到仓库作为契约；第四步，让 AI 基于 OpenAPI 生成 Mock Server（前端基于 mock 开发）；第五步，让 AI 基于 OpenAPI 生成前端 SDK / hooks（前端集成）；第六步，让 AI 基于 OpenAPI 生成后端路由骨架（后端实现，让 AI 同时生成 zod schema 与 OpenAPI 对齐）；第七步，让 AI 基于 OpenAPI 生成 API 文档（Swagger UI + Redoc）；第八步，联调时基于 OpenAPI 做契约测试（用 Dredd 或 Schemathesis 验证后端实现符合规范）。

这个工作流的精髓是"单一真相来源"——OpenAPI 是契约，所有前后端工作都从它派生。改 API 等于改 OpenAPI，改完重新生成 SDK/Mock/文档/测试，前后端自动同步。比起"后端写完文档前端再集成"的传统流程，OpenAPI 优先能让前后端真正并行。
`,
    code: `// =============================================================
// 第39章示例：OpenAPI 优先工作流编排器
// 演示从数据模型到 SDK/Mock/文档/测试的完整派生流程
// =============================================================

// ---- 数据模型（示例：用户系统）----
const DATA_MODEL = {
  User: {
    fields: [
      { name: "id", type: "uuid", required: true },
      { name: "email", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: true },
      { name: "role", type: "enum(admin|member)", required: true },
      { name: "created_at", type: "timestamp", required: true },
    ],
  },
};

// ---- API 设计原则 5 条 ----
const DESIGN_PRINCIPLES = [
  "资源路径用复数名词（/users 不是 /user）",
  "HTTP 方法表达动作，动作不进路径",
  "状态码用 RFC 7231（200/201/204/400/401/403/404/409/422/500）",
  "分页 cursor / 排序 ?sort=-field / 过滤 ?field=value",
  "错误用 RFC 7807 ProblemDetails 统一格式",
];

// ---- API 端点清单（设计阶段产出）----
const ENDPOINTS = [
  { path: "/users", method: "GET", auth: true, desc: "列出用户（分页/排序/过滤）", codes: "200, 401, 403" },
  { path: "/users", method: "POST", auth: true, desc: "创建用户", codes: "201, 400, 401, 403, 409" },
  { path: "/users/{id}", method: "GET", auth: true, desc: "获取单个用户", codes: "200, 401, 403, 404" },
  { path: "/users/{id}", method: "PATCH", auth: true, desc: "更新用户", codes: "200, 400, 401, 403, 404, 409" },
  { path: "/users/{id}", method: "DELETE", auth: true, desc: "删除用户", codes: "204, 401, 403, 404" },
];

// ---- OpenAPI 优先工作流 8 步 ----
const OPENAPI_WORKFLOW = [
  { step: 1, name: "设计 API 表格", tool: "Claude.ai 对话", output: "端点清单表格", verify: "人工 review 命名/状态码/分页一致性" },
  { step: 2, name: "生成 OpenAPI 3.1 YAML", tool: "Claude.ai 对话", output: "openapi.yaml", verify: "swagger-cli validate 通过" },
  { step: 3, name: "提交 OpenAPI 为契约", tool: "git", output: "仓库根目录 openapi.yaml", verify: "PR review 合并" },
  { step: 4, name: "生成 Mock Server", tool: "Prism + AI 配置", output: "本地 mock on :4010", verify: "前端能基于 mock 跑通" },
  { step: 5, name: "生成前端 SDK/hooks", tool: "orval + AI 配置", output: "src/api/hooks.ts", verify: "前端编译通过" },
  { step: 6, name: "生成后端路由骨架", tool: "AI 实现 + zod 校验", output: "route.ts + zod schema", verify: "实现与 OpenAPI 对齐" },
  { step: 7, name: "生成 API 文档", tool: "Swagger UI + Redoc", output: "/api-docs + 静态 HTML", verify: "页面可访问" },
  { step: 8, name: "契约测试", tool: "Dredd / Schemathesis", output: "测试报告", verify: "后端实现符合规范" },
];

// ---- 联调常见卡点 ----
const DEBUG_ISSUES = [
  {
    issue: "CORS 拦截",
    root: "后端未配 CORS 或凭证不匹配",
    fix: "配 cors.ts 中间件，credentials=true，允许来源精确配置",
  },
  {
    issue: "JWT 传不过去",
    root: "LocalStorage 被偷 / Cookie 跨域丢失",
    fix: "HttpOnly + SameSite=Lax + Secure Cookie，credentials: 'include'",
  },
  {
    issue: "字段命名不一致",
    root: "后端 snake_case，前端 camelCase",
    fix: "fetcher 层递归转换，保留 @keepCase 字段",
  },
  {
    issue: "401 不跳登录",
    root: "fetcher 没统一处理错误状态码",
    fix: "fetcher 拦 401 → 清状态 → 跳 /login",
  },
];

// ---- 打印设计原则 ----
function printPrinciples() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   RESTful API 设计 5 原则                ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  DESIGN_PRINCIPLES.forEach((p, i) => console.log("  " + (i + 1) + ". " + p));
  console.log("");
}

// ---- 打印端点清单 ----
function printEndpoints() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   API 端点清单（设计阶段产出）            ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  console.log("  方法     路径                鉴权  说明                          状态码");
  ENDPOINTS.forEach((e) => {
    const pad = (s, n) => s + " ".repeat(Math.max(0, n - s.length));
    console.log("  " + pad(e.method, 8) + pad(e.path, 20) + pad(e.auth ? "是" : "否", 6) + pad(e.desc, 30) + e.codes);
  });
  console.log("");
}

// ---- 打印 OpenAPI 工作流 ----
function printWorkflow() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   OpenAPI 优先工作流（8 步派生）          ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  OPENAPI_WORKFLOW.forEach((w) => {
    console.log("  第 " + w.step + " 步：" + w.name);
    console.log("    工具：" + w.tool);
    console.log("    产出：" + w.output);
    console.log("    验证：" + w.verify);
  });
  console.log("");
}

// ---- 打印联调卡点 ----
function printDebugIssues() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   联调常见卡点与 AI 修法                  ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  DEBUG_ISSUES.forEach((d) => {
    console.log("  ⚠ " + d.issue);
    console.log("    根因：" + d.root);
    console.log("    修法：" + d.fix);
  });
  console.log("");
}

// ---- 简易字段命名转换演示（与 39.6 对应）----
function toSnake(obj) {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()),
        toSnake(v),
      ])
    );
  }
  return obj;
}

function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(v),
      ])
    );
  }
  return obj;
}

function printFieldDemo() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔁 字段命名自动转换演示");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const frontendData = { userId: 1, userName: "张三", profile: { createdAt: "2026-07-05" } };
  const backendData = toSnake(frontendData);
  console.log("  前端（camelCase）：" + JSON.stringify(frontendData));
  console.log("  后端（snake_case）：" + JSON.stringify(backendData));
  console.log("  转回前端：" + JSON.stringify(toCamel(backendData)));
  console.log("");
}

// ---- 主流程 ----
printPrinciples();
printEndpoints();
printWorkflow();
printFieldDemo();
printDebugIssues();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 OpenAPI 优先工作流精髓");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  OpenAPI 是契约，单一真相来源");
console.log("  改 API = 改 OpenAPI → 重新生成 SDK/Mock/文档/测试");
console.log("  前后端真正并行，不再互相等待");
console.log("\\n✅ API 工作流编排完成。建议每个新项目都按 OpenAPI-first 推进。");
`
  },
  {
    id: "aiapp-flow-perf",
    icon: "⚡",
    group: "AI编程工作流",
    title: "性能调优实战",
    content: `
# 第40章：性能调优实战

## 40.1 让 AI 分析性能瓶颈

性能调优的第一步不是"改代码"，是"找瓶颈"。盲目优化是 AI 编程里最容易翻车的场景——AI 看到代码就忍不住"优化"，但没数据支撑的优化经常是改了 A 慢了 B，甚至纯粹是噪音。让 AI 分析性能瓶颈的关键，是给它**真实的 profile 数据**，而不是让它"凭感觉"。

profile 数据有四种：**火焰图**（CPU 时间花在哪）、**慢查询日志**（数据库时间花在哪）、**构建产物分析**（前端包大小花在哪）、**真实用户监控 RUM**（用户实际体验到的耗时）。这四种数据各有工具：火焰图用 \`clinic.js\` 或 \`0x\`，慢查询用数据库自带的 \`EXPLAIN ANALYZE\`，构建产物用 \`webpack-bundle-analyzer\` 或 \`@next/bundle-analyzer\`，RUM 用 Sentry Performance 或 Datadog RUM。

让 AI 分析的通用 prompt 模板：

\`\`\`text
以下是 <工具名> 生成的 profile 数据：
<贴数据/截图/JSON>

请分析：
1. 排名前 3 的耗时/体积来源（具体到函数/查询/包名）
2. 每个来源的根因猜测（为什么慢/为什么大）
3. 每个来源的优化方案（按收益/成本比排序）
4. 优化后预期提升（量化，如 "首屏从 3.2s 降到 1.8s"）

不要给出"未基于 profile 数据"的泛泛建议（如 "请用缓存" "请加索引"）。
\`\`\`

模板的关键是最后一句——"不要给出未基于 profile 数据的建议"。AI 默认会列一堆"通用优化建议"，那些没用。强迫它基于数据说话，才能拿到可落地的方案。

## 40.2 前端性能优化

前端性能有三个核心指标：**包大小**、**首屏（FCP/LCP）**、**渲染（INP）**。

**包大小**优化让 AI 分析构建产物。prompt：

\`\`\`text
以下是 webpack-bundle-analyzer 的输出（JSON）：
<贴 stats.json 摘要>

请分析：
1. 体积排名前 5 的依赖
2. 哪些依赖可以替换为更轻量的等价库（具体给出替代方案与体积对比）
3. 哪些依赖可以做代码分割（动态 import）
4. 哪些依赖是重复打包的（多版本共存）
5. tree-shaking 失效的迹象（如整个 lodash 被打包进来）

给出具体的 webpack/next.config.js 配置改动。
\`\`\`

常见的包大小优化 AI 会建议：\`lodash\` → \`lodash-es\`（支持 tree-shaking）或换成 \`es-toolkit\`；\`moment.js\` → \`dayjs\`（10 倍体积差）；\`axios\` → 原生 \`fetch\`；动态 import 大组件（如 Markdown 编辑器）；外部化大依赖（用 CDN script 标签）。这些建议 AI 能给得很具体，但你要确认替代库的 API 兼容性。

**首屏**优化让 AI 分析 Lighthouse 报告。prompt：

\`\`\`text
以下是 Lighthouse 报告（JSON）：
<贴 lighthouse-report.json 摘要>

LCP = 4.2s，目标降到 2.5s 以内。请分析：
1. LCP 元素是什么
2. 阻塞 LCP 的资源（JS/CSS/字体/图片）
3. 关键资源加载链路（HTML → CSS → JS → 数据 → 渲染）
4. 优化方案（按收益排序）：
   - 服务端渲染 / 流式渲染
   - 关键 CSS 内联
   - 字体 preloading
   - 图片优化（next/image + AVIF）
   - 路由级代码分割
   - 第三方脚本延迟加载

给出具体配置和代码改动。
\`\`\`

**渲染**优化（INP）让 AI 分析 Chrome DevTools 的 Performance trace。INP 卡顿通常是长任务（>50ms）导致的，长任务的根因是同步 JS 计算、强制同步布局（layout thrashing）、大列表无虚拟化。AI 看 trace 能定位到具体函数，prompt 里贴 trace 的 flame chart 截图（多模态模型）或 JSON 数据，让它指出"哪个函数占用了主线程最多时间"。

## 40.3 后端性能优化

后端性能的核心是"数据库 + 缓存 + 并发"。

**SQL 优化**让 AI 分析慢查询日志。这是本章最有价值的一节，prompt 详细给出：

\`\`\`text
以下是 PostgreSQL 慢查询日志（执行时间 > 1s）：
<贴 slow queries>

对每条慢查询：
1. 用 EXPLAIN ANALYZE 的视角分析（我会去跑，你给预期）
2. 指出问题（全表扫描 / N+1 / 临时表 / 文件排序 / 索引失效）
3. 给出索引建议（具体 CREATE INDEX 语句）
4. 给出查询重写建议（具体 SQL）
5. 给出 schema 调整建议（如冗余字段、分区表）

不要给泛泛建议如 "加索引"，要具体到字段和语句。
\`\`\`

常见的 SQL 慢和 AI 能给的修法：全表扫描 → 加复合索引（顺序按"等值在前、范围在后、排序在后"）；N+1 → 改 join 或用 DataLoader 批量；索引失效 → 不要在索引列上用函数（\`WHERE DATE(created_at) = '2026-07-05'\` 改成 \`WHERE created_at >= '2026-07-05' AND created_at < '2026-07-06'\`）；文件排序 → 加覆盖索引让 ORDER BY 走索引；COUNT 慢 → 用计数表或近似计数 \`approx_count\`。

**N+1 检测**让 AI 审查代码。prompt：

\`\`\`text
审查以下代码，找出所有 N+1 查询：
<贴 ORM 代码>

判断标准：在循环里调用数据库查询、在序列化时延迟加载关联、在 map 里 await 数据库调用。

对每个 N+1：
1. 指出具体行号
2. 说明触发的查询次数（如 "N 次单查询"）
3. 给出修复（用 include / select_related / DataLoader / 批量查询）

不要做无关重构。
\`\`\`

**缓存**优化让 AI 设计缓存策略。prompt：

\`\`\`text
基于以下 API 端点，设计缓存策略：
<贴端点清单>

对每个端点：
1. 是否适合缓存（读多写少？数据时效性要求？）
2. 缓存层级（内存 / Redis / CDN / HTTP）
3. 缓存 key 设计
4. TTL（短/中/长）
5. 失效策略（写时失效 / 定期失效 / 主动失效）
6. 缓存击穿/穿透/雪崩防护

给出具体 Redis 命令和 HTTP Cache-Control 头配置。
\`\`\`

**并发**优化让 AI 找出串行的 IO。prompt：

\`\`\`text
审查以下代码，找出可以并发但被写成串行的 IO 操作：
<贴代码>

对每个发现：
1. 指出具体行号
2. 说明并发后预期提速
3. 给出修复（用 Promise.all / async.map / Worker 线程 / 进程池）
4. 说明并发限制（如"数据库连接池只有 10，不要并发 100"）

注意：CPU 密集任务不要并发，要用 Worker。
\`\`\`

## 40.4 数据库优化

数据库优化除了 SQL 本身，还有索引、查询计划、分表三个层面。

**索引优化**让 AI 基于查询模式设计索引。prompt：

\`\`\`text
以下是项目的查询模式统计（来自 pg_stat_statements）：
<贴查询统计>

请：
1. 找出执行次数最多的 10 个查询
2. 为这些查询设计复合索引（注意最左前缀原则）
3. 找出冗余索引（可被其他索引覆盖）
4. 找出未使用的索引（可删除以提升写入性能）
5. 给出 CREATE INDEX / DROP INDEX 语句（用 CONCURRENTLY 避免锁表）
\`\`\`

**查询计划分析**让 AI 解读 EXPLAIN 输出。AI 对 EXPLAIN 的解读能力很强，能识别 Seq Scan、Index Scan、Hash Join、Nested Loop、Filter 等操作符，能估算成本。prompt：

\`\`\`text
以下是 EXPLAIN ANALYZE 的输出：
<贴 EXPLAIN>

请解读：
1. 执行计划概览（按顺序列出操作符）
2. 实际耗时分布（哪个操作最慢）
3. 行数估算偏差（estimated vs actual，偏差大说明统计信息过时）
4. 是否有 Seq Scan on 大表（应该走索引）
5. 是否有 Filter 移除大量行（说明索引设计不对）
6. 优化建议
\`\`\`

**分表**让 AI 设计分表策略。当单表数据超过千万级，索引优化收益有限，要考虑分表。prompt：

\`\`\`text
业务场景：<描述>
当前单表数据量：<N 行 / 体积>
查询模式：<贴主要查询>

请设计分表策略：
1. 分表维度（按时间 / 按用户 / 按租户 / 按 hash）
2. 分表数量（如 16 / 64 / 256）
3. 路由规则（哪条数据去哪张表）
4. 跨分片查询方案（聚合查询、统计查询怎么办）
5. 扩容方案（数据怎么迁移）
6. 中间件选择（Vitess / ShardingSphere / 应用层路由）

给出 schema 设计和路由代码骨架。
\`\`\`

分表是大决策，不要让 AI 直接动手做。AI 的价值是给出方案对比，你做决策。

## 40.5 AI 性能调优的局限

AI 性能调优有几个根本局限，必须意识到。

**第一，AI 看不到生产环境。** AI 看到的是你贴给它的 profile 数据，看不到真实用户的网络、设备、并发场景。所以 AI 给的优化方案要在你的真实环境验证，"AI 说能降 50%" 不等于"你的用户感知到 50%"。RUM 数据比 AI 的预测更可信。

**第二，AI 不知道业务优先级。** 一个查询慢但只在内部管理后台触发，另一个查询略慢但每秒被调用 1000 次——AI 不知道前者优先级低、后者优先级高。你必须告诉 AI "这个端点的 QPS 是多少、影响多少用户"，它才能给出有优先级的方案。

**第三，AI 容易"过度优化"。** AI 看到代码就想优化，但有些优化是反生产力的——比如为了省 1ms 给缓存加复杂逻辑，结果引入了缓存一致性 bug。要克制 AI 的优化冲动，prompt 里明确"只优化收益超过 10% 的项，不要做边际优化"。

**第四，AI 不能跑 EXPLAIN。** AI 给的索引建议是"基于查询文本的猜测"，实际索引效果要跑 EXPLAIN 验证。AI 给的 CREATE INDEX 语句要你在测试库跑、对比前后查询计划，确认有效再上生产。

**第五，AI 不懂你的数据分布。** 索引效果高度依赖数据分布——一个 status 字段如果 99% 的值是 'active'，那 status 上的索引基本没用（区分度低）。AI 不知道你的数据分布，要你跑 \`SELECT count(*) GROUP BY status\` 告诉它，它才能给出合理的索引建议。

## 40.6 实战 prompt：慢查询分析与前端 bundle 分析

把这一章最有用的两个 prompt 完整给出。

**慢查询分析 prompt**（贴 PostgreSQL 慢查询日志）：

\`\`\`text
你是资深 PostgreSQL DBA。以下是生产环境慢查询日志（>1s 的查询）：

[贴 slow query log]

每条慢查询格式：
  duration: X ms
  statement: SELECT ...

请对每条慢查询输出：

## 查询 N
### 问题
- 类型（全表扫描 / N+1 / 索引失效 / 临时表 / 文件排序 / 锁等待）
- 具体定位（哪个 WHERE / JOIN / ORDER BY 导致）

### 索引建议
\`\`\`sql
CREATE INDEX CONCURRENTLY idx_xxx ON t (a, b);
\`\`\`
理由：<为什么这个索引能解决，依据是什么>

### 查询重写
\`\`\`sql
-- 原查询
<原 SQL>
-- 优化后
<新 SQL>
\`\`\`
说明：<重写的依据>

### 预期收益
- 执行时间：X ms → Y ms
- 验证方法：EXPLAIN ANALYZE 前后对比

不要给"加索引"这种空泛建议，必须具体到字段和语句。
不要为了优化改 SQL 语义（结果必须一致）。
\`\`\`

**前端 bundle 分析 prompt**（贴 webpack-bundle-analyzer stats）：

\`\`\`text
你是资深前端性能工程师。以下是 webpack-bundle-analyzer 输出的 stats.json 摘要：

[贴 stats 摘要，包括各 chunk 大小、依赖列表]

请输出：

## 体积 Top 5 依赖
| 依赖 | 体积 | 问题 | 替代/优化方案 | 预期体积 |
| --- | --- | --- | --- | --- |

## 代码分割机会
列出可以动态 import 的模块及预期减少的初始体积

## 重复打包
找出多版本共存的依赖（如 react 同时有 17 和 18）

## Tree-shaking 失效
找出被全量引入但只用部分功能的库（如 import _ from 'lodash'）

## 配置改动
给出 webpack.config.js / next.config.js 的具体改动：

\`\`\`js
// 改动前
<原配置>
// 改动后
<新配置>
\`\`\`

预期总初始体积：X KB → Y KB
\`\`\`

这两个 prompt 的精髓是"结构化产出 + 强制量化"——让 AI 按表格/段落输出，每个建议都带预期收益数字。这样你能横向比较"哪个优化最值得做"，也能在优化后回头验证"AI 的预测准不准"。性能调优不是一次性活动，是"测量 → 优化 → 再测量"的循环，AI 在这个循环里是"分析助手"，不是"决策者"。
`,
    code: `// =============================================================
// 第40章示例：性能调优分析编排器
// 模拟慢查询分析、bundle 分析、N+1 检测的输出结构
// =============================================================

// ---- 慢查询样本 ----
const SLOW_QUERIES = [
  {
    id: 1,
    duration: 2840,
    statement: "SELECT * FROM orders WHERE DATE(created_at) = '2026-07-04'",
    problem: "索引失效（DATE() 函数包裹 created_at）",
    indexAdvice: "CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at)",
    rewriteAdvice: "WHERE created_at >= '2026-07-04' AND created_at < '2026-07-05'",
    expected: "2840ms → 12ms",
  },
  {
    id: 2,
    duration: 1530,
    statement: "SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 20",
    problem: "文件排序（status 区分度低 + created_at 排序）",
    indexAdvice: "CREATE INDEX CONCURRENTLY idx_users_status_created ON users(status, created_at DESC)",
    rewriteAdvice: "无需重写，加索引即可",
    expected: "1530ms → 8ms",
  },
  {
    id: 3,
    duration: 920,
    statement: "SELECT u.*, (SELECT COUNT(*) FROM orders WHERE orders.user_id = u.id) FROM users u",
    problem: "N+1（每行用户都跑一次 COUNT 子查询）",
    indexAdvice: "orders.user_id 上需有索引",
    rewriteAdvice: "LEFT JOIN (SELECT user_id, COUNT(*) c FROM orders GROUP BY user_id) o ON o.user_id = u.id",
    expected: "920ms → 35ms",
  },
];

// ---- Bundle 分析样本 ----
const BUNDLE_TOP = [
  { dep: "lodash", size: "72 KB", issue: "全量引入，tree-shaking 失效", fix: "换 lodash-es 或 es-toolkit", expected: "72 → 4 KB" },
  { dep: "moment.js", size: "67 KB", issue: "含所有 locale", fix: "换 dayjs", expected: "67 → 2 KB" },
  { dep: "antd", size: "240 KB", issue: "全量引入组件", fix: "按需 import + tree-shaking", expected: "240 → 60 KB" },
  { dep: "echarts", size: "850 KB", issue: "全量引入图表", fix: "按需 import + 动态 import", expected: "850 → 120 KB" },
  { dep: "react-json-view", size: "180 KB", issue: "只在调试页用", fix: "动态 import", expected: "初始 -180 KB" },
];

// ---- N+1 检测样本 ----
const N_PLUS_ONE = [
  {
    file: "src/api/users.ts:42",
    code: "users.map(u => getOrder(u.id))",
    queries: "N 次单查询",
    fix: "const orders = await getOrdersByUserIds(users.map(u => u.id))",
  },
  {
    file: "src/api/posts.ts:18",
    code: "posts.map(p => p.author) // 延迟加载",
    queries: "N 次单查询",
    fix: "prisma.post.findMany({ include: { author: true } })",
  },
];

// ---- 性能指标基准 ----
const PERF_TARGETS = [
  { metric: "LCP", target: "< 2.5s", current: "4.2s", gap: "需优化 40%" },
  { metric: "INP", target: "< 200ms", current: "320ms", gap: "需优化 38%" },
  { metric: "初始 JS", target: "< 200 KB", current: "580 KB", gap: "需优化 66%" },
  { metric: "API P95", target: "< 300ms", current: "1240ms", gap: "需优化 76%" },
];

// ---- AI 局限性 ----
const AI_LIMITATIONS = [
  "看不到生产环境，方案要在真实环境验证",
  "不知道业务优先级，要告诉它 QPS 和影响范围",
  "容易过度优化，prompt 限定收益 >10% 才做",
  "不能跑 EXPLAIN，索引建议要你跑验证",
  "不懂数据分布，要你跑 GROUP BY 告诉它区分度",
];

// ---- 打印慢查询分析 ----
function printSlowQueries() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   慢查询分析（>1s）                      ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  SLOW_QUERIES.forEach((q) => {
    console.log("## 查询 " + q.id + "（" + q.duration + " ms）");
    console.log("  SQL: " + q.statement);
    console.log("  问题: " + q.problem);
    console.log("  索引: " + q.indexAdvice);
    console.log("  重写: " + q.rewriteAdvice);
    console.log("  预期: " + q.expected);
    console.log("");
  });
}

// ---- 打印 bundle 分析 ----
function printBundle() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   前端 Bundle 分析 Top 5                  ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  console.log("  依赖              体积     问题                  预期");
  BUNDLE_TOP.forEach((b) => {
    const pad = (s, n) => s + " ".repeat(Math.max(0, n - s.length));
    console.log("  " + pad(b.dep, 18) + pad(b.size, 8) + pad(b.issue, 22) + b.expected);
  });
  console.log("");
}

// ---- 打印 N+1 检测 ----
function printNPlusOne() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   N+1 查询检测                            ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  N_PLUS_ONE.forEach((n) => {
    console.log("  ⚠ " + n.file);
    console.log("    代码: " + n.code);
    console.log("    触发: " + n.queries);
    console.log("    修复: " + n.fix);
  });
  console.log("");
}

// ---- 打印性能指标 ----
function printTargets() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   性能指标基准与差距                      ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  console.log("  指标       目标       当前       差距");
  PERF_TARGETS.forEach((p) => {
    const pad = (s, n) => s + " ".repeat(Math.max(0, n - s.length));
    console.log("  " + pad(p.metric, 10) + pad(p.target, 10) + pad(p.current, 10) + p.gap);
  });
  console.log("");
}

// ---- 打印 AI 局限 ----
function printLimitations() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   AI 性能调优的 5 个局限                  ║");
  console.log("╚══════════════════════════════════════════╝\\n");
  AI_LIMITATIONS.forEach((l, i) => console.log("  " + (i + 1) + ". " + l));
  console.log("");
}

// ---- 模拟索引区分度评估 ----
function evaluateIndexSelectivity(values) {
  const counts = {};
  values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  const distinct = Object.keys(counts).length;
  const total = values.length;
  const selectivity = (distinct / total).toFixed(2);
  const verdict = selectivity > 0.3 ? "✅ 区分度高，适合建索引" : "⚠ 区分度低，索引收益有限";
  return { distinct, total, selectivity, verdict };
}

function printSelectivityDemo() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 索引区分度评估演示");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const statusValues = ["active", "active", "active", "active", "active", "inactive", "active", "active", "active", "active"];
  const r1 = evaluateIndexSelectivity(statusValues);
  console.log("  字段 status: " + JSON.stringify({ distinct: r1.distinct, total: r1.total, selectivity: r1.selectivity }));
  console.log("  " + r1.verdict);

  const emailValues = ["a@x.com", "b@x.com", "c@x.com", "d@x.com", "e@x.com", "f@x.com", "g@x.com", "h@x.com", "i@x.com", "j@x.com"];
  const r2 = evaluateIndexSelectivity(emailValues);
  console.log("  字段 email: " + JSON.stringify({ distinct: r2.distinct, total: r2.total, selectivity: r2.selectivity }));
  console.log("  " + r2.verdict);
  console.log("");
}

// ---- 主流程 ----
printTargets();
printSlowQueries();
printBundle();
printNPlusOne();
printSelectivityDemo();
printLimitations();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🎯 性能调优循环");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  测量 → 优化 → 再测量（AI 是分析助手，不是决策者）");
console.log("  profile 数据驱动，不许凭感觉");
console.log("  收益 >10% 才做，拒绝边际优化");
console.log("  索引建议必跑 EXPLAIN 验证");
console.log("\\n✅ 性能调优编排完成。建议每个优化项都按此结构化产出与验证。");
`
  }
];
