// =============================================================
// AI 应用编程教程 —— 第 2 批章节（主流大模型对比组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   6.  aiapp-model-basics    大模型基础与评估指标
//   7.  aiapp-claude-models   Claude 系列深度解析
//   8.  aiapp-openai-models   OpenAI GPT/o 系列解析
//   9.  aiapp-other-models    Gemini/DeepSeek/Qwen/GLM 等对比
//   10. aiapp-model-selector  按场景选模型实战指南
//
// 信息时效：2026-07-05。对仍在演进或尚未正式发布的模型，
//           文中会明确标注“已发布”或“预期/规划中”。
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
    id: "aiapp-model-basics",
    icon: "📊",
    group: "主流大模型对比",
    title: "大模型基础与评估指标",
    content: `
# 第6章：大模型基础与评估指标

## 6.1 大模型是什么

大模型（Large Language Model，LLM）是指参数量达到数十亿乃至数千亿级别、用海量文本（含代码）训练出来的神经网络语言模型。它的核心能力是“根据上文预测下一个 token”，但当我们把模型做大、把训练数据喂足之后，这种“预测下一个 token”的能力会涌现出推理、翻译、写代码、风格模仿等一系列实用能力，这正是今天 AI 编程得以成立的基础。

理解大模型，关键不在“它叫什么名字”，而在三组底层指标：**参数量、训练数据、上下文窗口**。这三者共同决定了一个模型的“天花板”，而调优、对齐、工具调用这些工程手段，则决定了它能在多大程度上逼近这个天花板。

| 维度 | 含义 | 量级参考（2026 年） | 对编程的影响 |
| --- | --- | --- | --- |
| 参数量 | 模型神经网络的权重数量 | 主力闭源模型 1T~10T 级；开源旗舰 70B~671B | 参数量决定知识与推理上限，但并非线性 |
| 训练数据 | 预训练语料的规模与质量 | 主流模型 10T~50T tokens，代码占 10%~30% | 代码语料比例直接影响 API 知识广度 |
| 上下文窗口 | 单次推理能“看到”的 token 数 | 128K~2M（Gemini 2.5 Pro 已达 2M） | 决定能处理多大仓库、多长文档 |

需要特别强调：**参数量大不等于能力强**。一个用高质量代码语料精心训练的 70B 模型，在编程任务上完全可以超过一个用杂乱语料堆出来的 300B 模型。这也是为什么不能只看模型“名片”上的数字，而要看它在 Benchmark 与真实任务上的表现。

## 6.2 三要素：参数量、训练数据、上下文窗口

**参数量（Parameters）**。参数量可以粗略理解为模型“记忆容量”的上限。参数太少的模型，记不住那么多 API 和语言细节；但参数超过某个阈值后，边际收益迅速下降。业界共识是：参数量决定能力上限，训练数据质量决定能力下限，而推理算力（inference compute）决定单次调用的实际表现。这也是 o 系列推理模型即使参数量不显著增加，也能靠“思考更多”而提升表现的原因。

**训练数据（Training Data）**。训练数据有三个关键属性：规模（tokens 数）、质量（是否经过严格清洗与去重）、多样性（覆盖多少语言、多少领域）。对编程场景而言，最关键的是代码语料的占比与覆盖度。GPT-4o、Claude 4 系列都明显在 GitHub 公开仓库、Stack Overflow、官方文档上做了大量训练；而一些纯文本偏多的模型，在调用冷门 API 时就容易出现“编造参数”的幻觉。

**上下文窗口（Context Window）**。上下文窗口是模型一次推理能处理的最大 token 数。它直接决定了你能不能把整个仓库塞进去、能不能让模型读完一本 API 手册再回答。需要注意：上下文窗口是一个“上限”，并非“有效窗口”。研究表明，几乎所有模型在长上下文下都会出现“中间被忽略”（lost in the middle）现象——开头和结尾的信息记得清楚，中间的内容容易被遗忘。因此实际工程中，有效上下文往往只有标称值的 60%~80%。

\`\`\`text
参数量        ──>  决定能力上限（脑容量）
训练数据      ──>  决定能力下限（见识）
上下文窗口    ──>  决定单次任务规模（工作台大小）
推理算力      ──>  决定单次调用表现（思考深度）
对齐/工具调用 ──>  决定工程可用性（协作能力）
\`\`\`

## 6.3 能力评估方法：Benchmark

Benchmark（基准测试）是当前评估大模型能力的最主要手段。它的核心思想是：准备一组带标准答案的题目，让模型作答，然后计算通过率。Benchmark 的优势是“可比较、可复现、可自动化”，但它的局限也同样明显——我们会在 6.5 节专门讨论。

一个合格的 Benchmark 至少要满足三个条件：

1. **题目分布合理**：覆盖足够多的难度、语言、任务类型，不能全是简单题。
2. **答案判定客观**：要么是单选题，要么是有明确通过/失败标准的执行型题目，避免主观打分。
3. **不会被训练数据污染**：题目不公开或定期换新，否则模型可能在预训练时已经“背过答案”。

## 6.4 主流编程 Benchmark 解读

编程领域有几个被广泛引用的 Benchmark，理解它们的设计与差异，是看懂各家模型发布会的必修课。

| Benchmark | 题目形式 | 语言 | 评测方式 | 特点与陷阱 |
| --- | --- | --- | --- | --- |
| HumanEval | 函数签名 + 文档字符串 | Python | 单元测试 | 经典老题，大量模型已“背过”，分数严重通胀 |
| MBPP | 自然语言描述 + 代码 | Python | 单元测试 | 题目偏基础，区分度低 |
| SWE-bench | 真实 GitHub Issue | 多语言 | 仓库测试套件 | 最接近实战，但需要 Agent 能力 |
| LiveCodeBench | 比赛题、按时间分桶 | 多语言 | 单元测试 | 强调“未见过”，按时间防污染 |
| Aider Polyglot | 真实代码编辑任务 | 多语言 | diff 通过率 | 评测“改代码”而非“写代码” |

**HumanEval** 由 OpenAI 在 2021 年随 Codex 论文发布，共 164 道 Python 编程题，每题给出函数签名和文档字符串，要求模型补全实现，再跑单元测试判定。它的好处是简单直接，坏处是题目量小、风格单一，且发布时间太久，几乎肯定被各家模型纳入了训练数据。今天 HumanEval 分数已经严重“通货膨胀”——很多模型宣称 pass@1 达到 90% 以上，但这并不代表它在真实项目里也这么强。

**MBPP**（Mostly Basic Python Problems）包含 974 道入门级 Python 题，难度比 HumanEval 还低。它在 2023 年之前还有一定区分度，今天基本只能用来验证“模型是不是完全不会写代码”，对比较强的模型几乎没有区分能力。

**SWE-bench** 是目前最被业内看重的编程 Benchmark。它由 Princeton 团队在 2023 年底发布，题目来自 12 个流行 Python 仓库的真实 GitHub Issue。每个题目给模型一段 Issue 描述和仓库当前状态，要求模型修改代码使仓库的测试套件通过。SWE-bench 的核心难度在于：

- 模型必须先**理解整个仓库的结构**，定位到需要修改的文件；
- 修改往往涉及多个文件、多个函数的协同；
- 验证标准是仓库自带的测试套件，不是模型自己写的测试；
- 模型需要具备 Agent 能力——能调工具、能跑命令、能根据报错回溯。

SWE-bench 的任务形式可以概括为：输入是 Issue 文本 + 仓库快照，输出是一个 diff，判定方式是把 diff 应用到仓库后跑 fail-to-pass 测试是否通过、pass-to-pass 测试是否仍通过。这个流程几乎复刻了真实工程师修 bug 的过程，因此它的分数和“模型在真实工作里的水平”相关性最高。截至 2026 年中，SWE-bench Verified（人工筛选过的高质量子集）的最强成绩在 70% 上下，远低于 HumanEval 的 90%+，正说明了它的难度。

**LiveCodeBench** 由 UC Berkeley 等团队提出，核心理念是“按时间分桶，防数据污染”。它从 Codeforces、AtCoder、LeetCode 等竞赛平台收集题目，并标注发布日期，评估时只看模型训练截止日期之后的题目。它的价值在于“测出模型对新题的真实水平”，而不是背答案。

**Aider Polyglot** 由 Aider 项目维护，专门评测模型“改代码”而非“写代码”的能力。它给模型一个真实的小型代码库和一个修改需求，看模型能否输出正确的 diff。它对“日常工作里的 AI 编程”代表性较好，是少数强调 diff 格式正确性的 Benchmark。

## 6.5 为什么 Benchmark 高分不等于实战好用

这是初学者最容易踩的坑。Benchmark 分数高的模型，在真实项目里不一定好用，原因至少有四点：

1. **题目分布不等于真实分布**。HumanEval 都是“一个函数、一份文档”的孤立题目，而真实工程往往是一个仓库里改十几处。模型在孤立题上拿高分，不代表它能处理大型仓库。

2. **数据污染**。Benchmark 题目一旦公开发布，下一版模型很可能就把答案背下来了。这就是为什么 LiveCodeBench 要按时间分桶、SWE-bench 要定期更新。

3. **评测环境与真实环境脱节**。Benchmark 通常给模型一个干净的执行环境，而真实环境里有依赖冲突、路径问题、网络限制、私有 SDK，模型一旦遇到训练时没见过的环境，表现会断崖式下降。

4. **软指标无法被 Benchmark 捕获**。模型是否听从指令、是否过度修改、是否解释自己的改动、是否礼貌拒绝不合理需求——这些直接影响“好不好用”的软指标，Benchmark 几乎无法衡量。一个 pass@1 高 2 分但总是自作主张改一堆无关代码的模型，实际生产力往往不如分数稍低但更“守规矩”的模型。

\`\`\`text
Benchmark 测的是：在标准题库上的通过率
实战要的是：  在你的仓库里、按你的规范、改你的代码、改完能跑
两者交集 ≠ 100%
\`\`\`

## 6.6 如何自己评测模型

由于通用 Benchmark 未必反映你的真实场景，给团队选模型时，强烈建议建立一套“内部 Benchmark”。步骤如下：

1. **收集 20~50 道真实任务**。从团队近期做过的需求、修过的 bug、回答过的技术问题里抽样，覆盖不同难度与语言。注意脱敏，不要包含公司机密。
2. **统一 Prompt 与评分标准**。每道题写一份标准 Prompt，避免“人不同分数不同”。评分要么用单元测试（编程题），要么用 LLM-as-Judge（开放题），并保留评分日志。
3. **多模型并行跑**。把同一组题目分别跑给 2~4 个候选模型，记录：通过率、平均耗时、平均 token 消耗、单次成本。
4. **人工抽查异常样本**。对“通过但很慢”“失败但很接近”“通过但代码很烂”的样本，人工看一遍，发现 Benchmark 数字背后的差异。
5. **定期重跑**。模型版本更新很快，建议每季度重跑一次内部 Benchmark，保持结论新鲜。

下表是一个内部评测报告的典型字段，可作为模板：

| 字段 | 示例 | 说明 |
| --- | --- | --- |
| 任务 ID | T-014 | 内部编号 |
| 任务类型 | 重构 | 补全/重构/修 bug/写测试/解释 |
| 语言 | TypeScript | 涉及的语言 |
| 难度 | 中 | 易/中/难 |
| 模型 A 通过 | 是 | 布尔 |
| 模型 A 耗时 | 4.2s | 单次调用耗时 |
| 模型 A 成本 | $0.012 | 单次调用成本 |
| 模型 B 通过 | 否 | 布尔 |
| 备注 | A 改了无关文件 | 人工补充观察 |

通过这种“自定义 Benchmark + 人工抽查”的组合，你才能得到一份真正能指导采购与选型的评估报告，而不是被发布会上的高分牵着鼻子走。下一章起，我们将逐一拆解主流模型家族，把这些评估方法落到具体模型上。
`,
    code: `// =============================================================
// 第6章示例：内部 Benchmark 评测器
// 模拟对多个候选模型跑同一组任务，输出通过率/耗时/成本对比
// =============================================================

// ---- 候选模型定义 ----
// 价格单位：美元 / 1M tokens（仅为示例，非真实报价）
const models = [
  {
    name: "Model-A",
    passRate: 0.82,      // 单任务历史通过率
    avgLatencyMs: 3200,  // 单任务平均耗时
    avgTokens: 1850,     // 单任务平均 token 消耗
    pricePerMTokens: 3.0,
    overEditRate: 0.15,  // 过度修改（动无关文件）概率
  },
  {
    name: "Model-B",
    passRate: 0.78,
    avgLatencyMs: 2100,
    avgTokens: 1500,
    pricePerMTokens: 1.5,
    overEditRate: 0.05,
  },
  {
    name: "Model-C",
    passRate: 0.85,
    avgLatencyMs: 5800,
    avgTokens: 2400,
    pricePerMTokens: 5.0,
    overEditRate: 0.22,
  },
];

// ---- 任务集 ----
// 假设我们准备了 40 道内部任务
const TASK_COUNT = 40;

// ---- 评测函数 ----
// 用历史概率模拟一次跑分，并累加耗时与成本
function runBenchmark(model, taskCount) {
  let passed = 0;
  let totalLatency = 0;
  let totalTokens = 0;
  let overEditCount = 0;

  for (let i = 0; i < taskCount; i++) {
    // 通过判定：用通过率做随机模拟
    const isPass = Math.random() < model.passRate;
    if (isPass) passed++;

    // 累加耗时与 token（加一点随机扰动）
    const latency = model.avgLatencyMs * (0.7 + Math.random() * 0.6);
    const tokens = Math.round(model.avgTokens * (0.8 + Math.random() * 0.4));
    totalLatency += latency;
    totalTokens += tokens;

    // 过度修改判定
    if (Math.random() < model.overEditRate) overEditCount++;
  }

  // 成本 = 总 token / 1M × 单价
  const cost = (totalTokens / 1_000_000) * model.pricePerMTokens;

  return {
    model: model.name,
    passRate: passed / taskCount,
    passed,
    total: taskCount,
    avgLatencyMs: Math.round(totalLatency / taskCount),
    totalCost: cost,
    overEditRate: overEditCount / taskCount,
  };
}

// ---- 综合得分 ----
// 通过率 0.5 + 速度 0.2 + 成本 0.2 + 守规矩（1-过度修改率）0.1
function compositeScore(r) {
  const speedScore = Math.max(0, 1 - r.avgLatencyMs / 8000); // 8s 满分 0
  const costScore = Math.max(0, 1 - r.totalCost / 1.0);      // 1 美元满分 0
  const neatScore = 1 - r.overEditRate;
  return r.passRate * 0.5 + speedScore * 0.2 + costScore * 0.2 + neatScore * 0.1;
}

// ---- 执行评测 ----
console.log("========================================");
console.log("  内部 Benchmark 评测报告");
console.log("  任务数：" + TASK_COUNT);
console.log("========================================\\n");

const results = models.map((m) => runBenchmark(m, TASK_COUNT));
results.forEach((r) => (r.score = compositeScore(r)));

// 按综合得分排序
results.sort((a, b) => b.score - a.score);

// 表头
console.log(
  "模型".padEnd(10) +
    "通过率".padStart(8) +
    "平均耗时".padStart(12) +
    "总成本".padStart(10) +
    "过度修改".padStart(10) +
    "综合分".padStart(10)
);
console.log("-".repeat(60));

results.forEach((r) => {
  console.log(
    r.model.padEnd(10) +
      (r.passRate * 100).toFixed(1).padStart(7) + "%" +
      (r.avgLatencyMs + "ms").padStart(12) +
      ("$" + r.totalCost.toFixed(3)).padStart(10) +
      (r.overEditRate * 100).toFixed(1).padStart(9) + "%" +
      r.score.toFixed(3).padStart(10)
  );
});

// ---- 结论 ----
console.log("\\n========================================");
console.log("  评测结论");
console.log("========================================");
const winner = results[0];
console.log("  综合最优：" + winner.model + "（综合分 " + winner.score.toFixed(3) + "）");
console.log("  关键观察：");
console.log("    - 通过率最高的不一定是综合最优，要看速度/成本/守规矩程度");
console.log("    - 过度修改率高的模型，即便通过率高，也容易在真实工程里制造 review 负担");
console.log("    - 内部 Benchmark 比通用 Benchmark 更能反映你的真实场景");
console.log("\\n✅ 评测完成，建议每季度重跑一次保持结论新鲜。");
`
  },

  {
    id: "aiapp-claude-models",
    icon: "🎭",
    group: "主流大模型对比",
    title: "Claude 系列深度解析",
    content: `
# 第7章：Claude 系列深度解析

## 7.1 Claude 发展史

Claude 是 Anthropic 公司推出的大模型系列，目前是 AI 编程领域与 GPT 并列的两大主力之一。理解 Claude 的发展脉络，有助于判断它的能力曲线和适用边界。

**Claude 1（2023 年 3 月）**：Anthropic 的首个公开模型，主打“Constitutional AI（宪法 AI）”对齐方法，强调安全与可控。能力上与当时的 GPT-3.5 接近，编程能力一般。

**Claude 2（2023 年 7 月）**：首次把上下文窗口拉到 100K，是“长上下文”这条技术路线的早期代表。它让“把整个代码仓库塞给模型”第一次成为可能，但代码质量仍弱于同期的 GPT-4。

**Claude 3 系列（2024 年 3 月）**：分为 Haiku（小）、Sonnet（中）、Opus（大）三档，首次在多项 Benchmark 上追平甚至超过 GPT-4。Sonnet 在编程任务上表现出色，且 200K 上下文成为标配。

**Claude 3.5 系列（2024 年 6 月—10 月）**：这是 Claude 在编程圈“一战成名”的版本。3.5 Sonnet 在 SWE-bench 等基准上的表现远超同期 GPT-4o，被广泛认为是 2024 年下半年最强的编程模型。10 月发布的 3.5 Sonnet（新版）进一步引入了 Computer Use（操作电脑）能力。

**Claude 3.7 Sonnet（2025 年 2 月）**：引入了“扩展思考（Extended Thinking）”模式，让 Sonnet 也能像 o 系列一样进行深度推理，且默认 200K 上下文。

**Claude 4 系列（2025 年 5 月，已发布）**：包含 Claude Opus 4 与 Claude Sonnet 4。Opus 4 在 SWE-bench Verified 上把分数推到新高度，并原生支持长时 Agent 任务（可连续执行数小时）。Sonnet 4 在保持速度优势的同时大幅提升推理能力。两者均支持 200K 上下文，并新增了对工具调用的更强约束。

**Claude 4.5 / 后续版本（2025 年下半年—2026 年，部分预期/规划中）**：业界普遍预期 Anthropic 会继续推进 1M 上下文窗口与更强的多模态能力，但截至 2026 年 7 月，官方未确认具体型号，请以 Anthropic 官方公告为准。本教程对未确认型号一律按“预期”处理，不臆测参数。

## 7.2 当前主力模型：Opus / Sonnet / Haiku 定位与差异

Anthropic 沿用了“三档命名”策略，让用户一眼能看出模型的定位。下表是 2026 年中主力阵容（价格为示意，请以官方最新定价为准）：

| 模型 | 定位 | 上下文 | 输入价（$/1M） | 输出价（$/1M） | 编程适用场景 |
| --- | --- | --- | --- | --- | --- |
| Claude Opus 4 | 旗舰，最强推理 | 200K | 15 | 75 | 复杂架构、长时 Agent、跨仓库重构 |
| Claude Sonnet 4 | 主力，平衡型 | 200K | 3 | 15 | 日常编程、改 bug、写测试、Code Review |
| Claude Haiku 3.5/4 | 轻量，高速 | 200K | 0.8 | 4 | 行内补全、批量分类、轻量改写 |

三档的差异不仅是“强弱”，更是“权衡”：

- **Opus** 适合“一次性把难事做对”——架构设计、复杂重构、长链路 Agent。它贵且慢，但在最难的任务上通过率最高，省下来的返工成本往往超过模型费。
- **Sonnet** 是“主力日常机型”，性价比最高。绝大多数编程任务——写函数、改 bug、写测试、解释代码——Sonnet 4 都是首选。很多团队会把 Sonnet 设为 IDE 默认模型。
- **Haiku** 适合“高频低难度”场景。比如行内补全（每敲几个字符就触发一次）、对一堆文件做分类、批量改注释。它的速度和单价让“随便用”没有心理负担。

## 7.3 Claude 在编程上的优势

Claude 在编程圈的高口碑并非偶然，它有几个明显区别于 GPT 的工程化优势：

**1. 长上下文的稳定性**。Claude 在 200K 全长度上的“有效注意力”表现优于多数竞品。这意味着把 100+ 文件塞给它，它仍能比较准确地引用中间部分的内容，这对“整仓库理解”类任务至关重要。

**2. Artifacts 与可执行输出**。Claude.ai 网页端原生支持 Artifacts，可以把生成的代码、文档、SVG、React 组件直接渲染成可交互的产物。做原型设计、做组件 demo 时非常方便，不必来回切窗口。

**3. 强推理 + 强指令遵循**。Claude 在“按规范改代码”这类任务上偏保守、偏精准，不容易自作主张改一堆无关文件。这一点在 SWE-bench 与 Aider Polyglot 的对比中表现突出，也是它适合做 Agent 主力的原因。

**4. 原生 Agent 友好**。Claude 4 系列在工具调用、长时任务、并行工具等方面做了专门优化，原生支持“连续执行数小时”的 Agent 工作流，这与 Trae、Cursor Agent、Claude Code 等工具的形态高度契合。

## 7.4 价格与速率限制

Anthropic 采用“按 token 计费 + 分层速率限制”的策略。价格方面（示意，以官方为准）：Opus 4 输入 \$15/1M、输出 \$75/1M；Sonnet 4 输入 \$3/1M、输出 \$15/1M；Haiku 输入 \$0.8/1M、输出 \$4/1M。速率限制按账号套餐分层：Free、Pro、Max、Enterprise，每档的 RPM（每分钟请求数）与 TPM（每分钟 token 数）逐级提升。

需要特别注意两点：一是**输出 token 比输入贵 5 倍**，所以让模型“少废话、直接给 diff”不仅是体验问题，更是成本问题；二是**长上下文会触发阶梯计价**，超过一定长度后单价上浮，把无关文件全塞进去并不划算。

## 7.5 Claude 3.5 Sonnet 的“编程奇迹”现象

2024 年下半年，Claude 3.5 Sonnet 在编程圈几乎成了“神话”。它在 SWE-bench Verified 上的得分一口气把同期 GPT-4o 拉开了两位数百分点，在 Aider Polyglot、LiveCodeBench 上也持续领先。社区甚至出现“Sonnet 写的代码比实习生还好”的说法。这一现象被业界称为 Claude 3.5 Sonnet 的“编程奇迹”。

怎么理解这个“奇迹”？它不是单一因素，而是几个红利叠加：

- **代码语料配比上调**：Anthropic 在 3.5 训练阶段显著提升了代码语料质量与比例；
- **对齐策略更适配编程**：Constitutional AI 在编程场景下调得更“守规矩”，减少自作主张；
- **长上下文优化**：200K 全长度有效注意力提升，让整仓库任务成为可能；
- **工具调用原生支持**：3.5 Sonnet 的 tool use 稳定性大幅提升，是 Agent 时代能跑起来的前提。

但“奇迹”也有边界：在纯算法竞赛题、在极度冷门的 API 上，3.5 Sonnet 仍会翻车；它的成功更多体现在“工程化编程”而非“算法竞赛”。这一点对选型很关键——你要做的是工程还是算法，决定了 Claude 是不是你的最优解。

## 7.6 Claude 4 Opus / Sonnet 新特性

Claude 4 系列（2025 年 5 月已发布）相对 3.5 的主要升级：

1. **长时 Agent**：Opus 4 可在受控环境下连续执行长达数小时的 Agent 任务，中途自我检查、自我修正，适合“给一个目标，自己跑半天”的场景。
2. **更强的工具调用约束**：工具调用的格式正确率与并行调用能力提升，减少 Agent 跑到一半因工具格式错而中断。
3. **记忆与文件持久化**：Claude Code 等工具配合下，可在多次会话间保留项目记忆，不必每次重新喂上下文。
4. **Opus 4 的推理深度**：在 SWE-bench Verified 上把分数推到 70% 量级（具体数字以官方为准），是当时公开模型中的最强编程表现之一。

## 7.7 200K vs 1M 上下文场景

200K 与（预期的）1M 上下文不是简单的“越大越好”，而是“场景匹配”问题：

| 上下文 | 典型场景 | 注意事项 |
| --- | --- | --- |
| 200K（当前 Claude 4 标配） | 中型仓库单次理解、长文档总结、多文件重构 | 大多数工程任务够用，性价比高 |
| 1M（业界预期方向） | 大型 monorepo 全量分析、整本书/整套文档处理 | 单价上浮、有效注意力仍受“中间遗忘”影响 |

实操建议：先用 200K 配合“精准检索 + 选择性喂文件”的方式工作；只有当任务确实需要更大窗口、且你能承担成本时，再升级到 1M。盲目塞满上下文往往既贵又慢，效果还不一定好。

\`\`\`text
选 Claude 的决策要点：
  日常编程         ──>  Sonnet 4（默认）
  难任务/长 Agent  ──>  Opus 4（按需）
  高频低难度       ──>  Haiku（批量）
  需要原始推理     ──>  开 Extended Thinking
\`\`\`

下一章我们看 Claude 的最大对手——OpenAI 的 GPT/o 系列，并对比两者在编程场景的差异。
`,
    code: `// =============================================================
// 第7章示例：Claude 模型选型与成本估算器
// 根据任务类型推荐 Claude 子型号，并估算一次任务的成本
// =============================================================

// ---- Claude 模型定义（价格为示意，请以官方为准）----
const claudeModels = {
  "Opus-4": {
    inputPrice: 15,   // $/1M tokens
    outputPrice: 75,  // $/1M tokens
    contextWindow: 200_000,
    strength: "复杂架构、长时 Agent、跨仓库重构",
    speed: "慢",
  },
  "Sonnet-4": {
    inputPrice: 3,
    outputPrice: 15,
    contextWindow: 200_000,
    strength: "日常编程、改 bug、写测试、Code Review",
    speed: "中",
  },
  "Haiku-4": {
    inputPrice: 0.8,
    outputPrice: 4,
    contextWindow: 200_000,
    strength: "行内补全、批量分类、轻量改写",
    speed: "快",
  },
};

// ---- 任务类型与推荐模型 ----
// 每种任务附带典型的输入/输出 token 量级
const taskProfiles = {
  inline_completion: { model: "Haiku-4", inTokens: 1500, outTokens: 80,  desc: "行内补全" },
  write_function:    { model: "Sonnet-4", inTokens: 2500, outTokens: 400, desc: "写一个函数" },
  fix_bug:           { model: "Sonnet-4", inTokens: 4000, outTokens: 600, desc: "修一个 bug" },
  write_tests:       { model: "Sonnet-4", inTokens: 3000, outTokens: 800, desc: "为模块写测试" },
  refactor_module:   { model: "Sonnet-4", inTokens: 8000, outTokens: 1500, desc: "重构一个模块" },
  cross_repo_task:   { model: "Opus-4",  inTokens: 60000, outTokens: 4000, desc: "跨仓库重构" },
  arch_design:       { model: "Opus-4",  inTokens: 10000, outTokens: 3000, desc: "架构设计与方案" },
  long_agent:        { model: "Opus-4",  inTokens: 80000, outTokens: 12000, desc: "长时 Agent 任务" },
};

// ---- 成本估算 ----
function estimateCost(modelName, inTokens, outTokens) {
  const m = claudeModels[modelName];
  const cost =
    (inTokens / 1_000_000) * m.inputPrice +
    (outTokens / 1_000_000) * m.outputPrice;
  return cost;
}

// ---- 推荐与估算 ----
function recommend(taskKey) {
  const task = taskProfiles[taskKey];
  if (!task) return null;
  const cost = estimateCost(task.model, task.inTokens, task.outTokens);
  return {
    task: task.desc,
    recommended: task.model,
    inTokens: task.inTokens,
    outTokens: task.outTokens,
    estCost: cost,
    modelStrength: claudeModels[task.model].strength,
    speed: claudeModels[task.model].speed,
  };
}

// ---- 执行：打印推荐表 ----
console.log("========================================");
console.log("  Claude 模型选型与成本估算器");
console.log("========================================\\n");

console.log(
  "任务类型".padEnd(18) +
    "推荐模型".padStart(12) +
    "输入token".padStart(12) +
    "输出token".padStart(12) +
    "单次成本".padStart(12) +
    "速度".padStart(6)
);
console.log("-".repeat(72));

Object.keys(taskProfiles).forEach((k) => {
  const r = recommend(k);
  console.log(
    r.task.padEnd(18) +
      r.recommended.padStart(12) +
      r.inTokens.toString().padStart(12) +
      r.outTokens.toString().padStart(12) +
      ("$" + r.estCost.toFixed(4)).padStart(12) +
      r.speed.padStart(6)
  );
});

// ---- 模拟一个月的用量与账单 ----
console.log("\\n========================================");
console.log("  模拟一个月用量与账单（单人）");
console.log("========================================");

const monthlyUsage = [
  { task: "inline_completion", count: 1500 },
  { task: "write_function",    count: 200 },
  { task: "fix_bug",           count: 80 },
  { task: "write_tests",       count: 60 },
  { task: "refactor_module",   count: 20 },
  { task: "cross_repo_task",   count: 3 },
  { task: "arch_design",       count: 5 },
  { task: "long_agent",        count: 8 },
];

let totalCost = 0;
console.log("\\n任务类型".padEnd(20) + "次数".padStart(8) + "单次成本".padStart(12) + "小计".padStart(12));
console.log("-".repeat(52));
monthlyUsage.forEach((u) => {
  const r = recommend(u.task);
  const sub = r.estCost * u.count;
  totalCost += sub;
  console.log(
    r.task.padEnd(20) +
      u.count.toString().padStart(8) +
      ("$" + r.estCost.toFixed(4)).padStart(12) +
      ("$" + sub.toFixed(2)).padStart(12)
  );
});
console.log("-".repeat(52));
console.log("月度合计".padEnd(20) + "".padStart(8) + "".padStart(12) + ("$" + totalCost.toFixed(2)).padStart(12));

console.log("\\n========================================");
console.log("  选型洞察");
console.log("========================================");
console.log("  1. 行内补全虽然次数多，但用 Haiku，单月成本通常不到 5 美元。");
console.log("  2. 长时 Agent 任务次数少，但单次成本高，是月度账单的主要来源。");
console.log("  3. 把 Sonnet 设为默认、Opus 按需切换，是性价比最高的组合策略。");
console.log("  4. 输出 token 比输入贵 5 倍，让模型少废话、直接给 diff 能显著省钱。");
console.log("\\n✅ 估算完成，建议结合团队规模乘以人数得到团队月度预算。");
`
  },

  {
    id: "aiapp-openai-models",
    icon: "🟢",
    group: "主流大模型对比",
    title: "OpenAI GPT/o 系列解析",
    content: `
# 第8章：OpenAI GPT/o 系列解析

## 8.1 GPT 发展史

OpenAI 的 GPT 系列是过去几年最被广泛使用的大模型家族，也是 AI 编程工具链（Copilot、Cursor、Trae 等）背后的重要算力来源。理解它的代际演进，能帮你判断每一代模型适合做什么。

**GPT-3（2020 年）**：参数 175B，首次证明“大模型 + 少样本提示”可以完成很多任务。代码能力有限，但 Codex（GPT-3 的代码微调版）是 GitHub Copilot 第一版的引擎。

**GPT-3.5 / ChatGPT（2022 年 11 月）**：ChatGPT 一夜爆红，背后是经过 RLHF 对齐的 GPT-3.5。代码能力比 GPT-3 显著提升，但仍有大量幻觉与 API 过时问题。

**GPT-4 / GPT-4 Turbo（2023 年 3 月—11 月）**：第一次在编程、推理、长文档处理上达到“可用”水准，是 2023 年下半年的主力编程模型。Turbo 版把上下文拉到 128K。

**GPT-4o（2024 年 5 月）**：原生多模态（文/图/音/视频），速度快、价格低，上下文 128K。在编程上与 Claude 3.5 Sonnet 形成直接竞争，但工程化精度略逊。

**o1 / o1-preview（2024 年 9 月）**：OpenAI 首个“推理模型”，引入“思考时间”机制，在数学、算法、复杂调试上表现突出，但延迟高、价格贵。

**GPT-4.1（2025 年 4 月）**：4o 的迭代，上下文拉到 1M，编程与长文档能力提升，是 2025 年上半年的主力工作模型之一。

**o3 / o4-mini（2025 年 4 月，已发布）**：o 系列迭代，推理能力进一步提升，o4-mini 在性价比上更适合高频编程场景。

**GPT-5（2025 年 8 月，已发布）**：OpenAI 的下一代旗舰，统一了“快思考”与“慢思考”两条路线，单模型即可按需切换推理深度。在编程、推理、多模态上均有提升。

**codex-1（2025 年，已发布）**：GPT-5 的代码专项调优版，专为 Agent 化的代码任务设计，是 OpenAI Codex CLI 与 Codex 云端服务的核心模型，深度配合 AGENTS.md 等项目规范文件工作。

**后续预期（2026 年）**：业界预期 OpenAI 会继续推进统一架构下的更强推理与更长上下文，但具体型号以官方公告为准，本教程不臆测。

## 8.2 GPT-4o 多模态

GPT-4o 的“o”代表 omni（全能），是 OpenAI 第一个原生多模态模型——文字、图像、音频、视频走同一个网络，而不是分别接不同的编码器。这对编程场景的直接影响有：

- **截图调试**：把报错截图、UI 截图直接发给模型，它能读图分析；
- **设计稿转代码**：把 Figma 截图贴进去，模型直接生成组件代码；
- **白板流程图转代码**：手绘的流程图、ER 图也能识别。

但多模态并不等于编程强。GPT-4o 在纯文本编程任务上略逊于 Claude 3.5/4 Sonnet，它的优势在“图文混合”场景。

## 8.3 o 系列推理模型

o 系列是 OpenAI 的“推理模型”线，核心创新是**思考时间（thinking time）**：模型在给出最终答案前，先在内部生成一段不可见（或半可见）的“思考链”，反复推演、自我纠错，再输出最终答案。

| 维度 | 普通模型（GPT-4o/4.1） | 推理模型（o3/o4/GPT-5 慢思考） |
| --- | --- | --- |
| 响应方式 | 一次性输出 | 先思考、再输出 |
| 延迟 | 低（秒级） | 高（数十秒到数分钟） |
| 单次成本 | 低 | 高（思考 token 也计费） |
| 适合任务 | 补全、改写、解释 | 架构决策、疑难调试、算法题 |
| 弱点 | 复杂推理易出错 | 慢、贵、不适合高频场景 |

**o1/o3 的“思考时间”机制**可以这样理解：模型把“内部独白”当作一种额外的计算资源来用。每多思考 N 个 token，相当于多花了一次前向计算的成本，但换来的是更深的推理。这与人类“想久一点能想得更清楚”是同一个道理，只是把它工程化了。代价是：思考 token 也要计费，且用户往往看不到完整思考过程，难以判断“它到底想清楚了没有”。

## 8.4 Codex 模型与 AGENTS.md 的关系

**codex-1** 是 OpenAI 在 2025 年推出的代码专项模型，专为 Agent 化的代码工作流设计。它和传统 GPT 模型的关键区别在于：它被训练成“先读项目规范、再动手改代码”，而不是上来就猜。

这与 **AGENTS.md** 文件紧密相关。AGENTS.md 是 OpenAI Codex 工具链推崇的一种“项目级 AI 协作规范”文件，放在仓库根目录，告诉模型：

- 这个项目用什么语言、什么框架、什么测试命令；
- 代码风格规范（命名、缩进、错误处理）；
- 哪些目录可以改、哪些目录禁止动；
- 提交信息格式、PR 流程。

codex-1 在启动时会优先读 AGENTS.md，把规范内化为本次任务的约束，然后再执行。这种“规范先行”的设计显著降低了 Agent 自作主张改错文件的概率，是 Codex CLI 与 Codex 云端服务能在企业场景站住脚的关键。

\`\`\`text
传统 GPT 流程：
  用户 Prompt ──> 模型直接生成 ──> 输出代码

codex-1 流程：
  读 AGENTS.md ──> 读相关文件 ──> 制定计划 ──> 改代码 ──> 跑测试 ──> 自我修正
\`\`\`

## 8.5 编程能力特点

GPT/o 系列在编程上的特点是“全能但偏快”：

- **响应快**：GPT-4o/4.1 的延迟低于同期 Claude Opus，适合 IDE 内联补全这种高频场景；
- **生态广**：Copilot、Cursor、Trae 等主流工具都默认支持，迁移成本低；
- **多模态强**：图文混合任务（截图调试、设计稿转代码）是 GPT-4o 的强项；
- **推理模型深**：o 系列 / GPT-5 慢思考在“需要想很久”的难题上有优势；
- **弱点**：在“按规范精准改代码”这类工程任务上，工程化精度不如 Claude 4 Sonnet，容易多改无关文件。

## 8.6 价格体系

OpenAI 的定价（示意，以官方为准）：

| 模型 | 输入（$/1M） | 输出（$/1M） | 上下文 | 备注 |
| --- | --- | --- | --- | --- |
| GPT-4o | 2.5 | 10 | 128K | 多模态，速度快 |
| GPT-4.1 | 2.0 | 8 | 1M | 长上下文主力 |
| o4-mini | 1.5 | 6 | 128K | 推理模型，性价比高 |
| o3 | 15 | 60 | 200K | 深度推理，贵 |
| GPT-5（快） | 5 | 20 | 400K | 默认快思考 |
| GPT-5（慢） | 5 | 20 + 思考 | 400K | 慢思考，思考 token 计费 |
| codex-1 | 6 | 24 | 200K | Agent 化代码任务专用 |

注意：推理模型的“思考 token”也计费，且不可见，使用时务必监控用量，否则很容易出现“一次任务几十美元”的意外账单。

## 8.7 何时该用 o 系列做架构决策

o 系列（以及 GPT-5 的慢思考模式）最适合的是“想清楚比想快更重要”的场景：

1. **架构决策**：技术选型、模块拆分、数据流设计。这类任务错一步影响很大，值得花几十秒甚至几分钟让模型深度推理。
2. **疑难调试**：那种“看了三小时也找不出原因”的 bug，让 o 系列把所有可能的原因列出来逐一推演，往往比你自己冥思苦想更快定位。
3. **算法设计**：涉及复杂数据结构、并发、性能优化的算法题，o 系列的推理深度有实质优势。
4. **跨系统协议设计**：API 契约、数据库 schema、消息格式这类“一旦定下来很难改”的设计，值得用慢思考。

反过来，下面这些场景**不要**用 o 系列：

- 行内补全、写注释、改格式——纯浪费钱和延迟；
- 简单 bug、明确需求的功能实现——普通 GPT-4o/Sonnet 已经够好；
- 高频 Agent 任务（每步都要等模型）——延迟会拖垮整个流程。

\`\`\`text
选 GPT/o 的决策要点：
  高频补全/改写      ──>  GPT-4o / GPT-4.1
  图文混合任务       ──>  GPT-4o
  Agent 化代码任务   ──>  codex-1（配合 AGENTS.md）
  难题/架构/调试     ──>  o3 / GPT-5 慢思考
  性价比推理         ──>  o4-mini
\`\`\`

下一章我们走出“两大阵营”，看看 Gemini、DeepSeek、Qwen、GLM 等其他主流模型，特别是国产模型在中文与开源场景的独特价值。
`,
    code: `// =============================================================
// 第8章示例：OpenAI 模型“思考预算”计算器
// 给定任务难度与延迟容忍度，推荐是否启用慢思考并估算成本
// =============================================================

// ---- OpenAI 模型定义（价格为示意，请以官方为准）----
const openaiModels = {
  "GPT-4o":      { in: 2.5, out: 10,  ctx: 128_000,  think: false, desc: "多模态主力，快" },
  "GPT-4.1":     { in: 2.0, out: 8,   ctx: 1_000_000, think: false, desc: "长上下文主力" },
  "o4-mini":     { in: 1.5, out: 6,   ctx: 128_000,  think: true,  desc: "推理性价比" },
  "o3":          { in: 15,  out: 60,  ctx: 200_000,  think: true,  desc: "深度推理，贵" },
  "GPT-5-fast":  { in: 5,   out: 20,  ctx: 400_000,  think: false, desc: "GPT-5 快思考" },
  "GPT-5-slow":  { in: 5,   out: 20,  ctx: 400_000,  think: true,  desc: "GPT-5 慢思考" },
  "codex-1":     { in: 6,   out: 24,  ctx: 200_000,  think: true,  desc: "Agent 代码任务" },
};

// ---- 任务画像 ----
// difficulty: 1(易)~5(极难)
// latencyToleranceMs: 可接受的最大延迟
// inTokens / outTokens: 典型 token 量级
// thinkTokens: 若启用慢思考，额外的思考 token 量级
const tasks = [
  { name: "行内补全",        difficulty: 1, latencyToleranceMs: 800,   inTokens: 1200, outTokens: 60,   thinkTokens: 0 },
  { name: "写一个函数",      difficulty: 2, latencyToleranceMs: 5000,  inTokens: 2500, outTokens: 400,  thinkTokens: 0 },
  { name: "修一个 bug",      difficulty: 3, latencyToleranceMs: 15000, inTokens: 4000, outTokens: 700,  thinkTokens: 2000 },
  { name: "架构设计",        difficulty: 5, latencyToleranceMs: 180000, inTokens: 10000, outTokens: 3000, thinkTokens: 15000 },
  { name: "疑难调试",        difficulty: 5, latencyToleranceMs: 120000, inTokens: 8000, outTokens: 2000, thinkTokens: 12000 },
  { name: "Agent 改仓库",    difficulty: 4, latencyToleranceMs: 60000,  inTokens: 60000, outTokens: 8000, thinkTokens: 6000 },
  { name: "算法题",          difficulty: 4, latencyToleranceMs: 60000,  inTokens: 2000, outTokens: 800,  thinkTokens: 8000 },
];

// ---- 选模型 ----
// 规则：
//   1. 难度 >=4 且延迟容忍 > 60s ──> 慢思考模型（GPT-5-slow / o3）
//   2. 难度 >=4 且延迟容忍 30~60s ──> o4-mini 或 codex-1（Agent 场景）
//   3. 难度 <=2 ──> GPT-4o / GPT-5-fast
//   4. Agent 改仓库 ──> codex-1
function pickModel(task) {
  if (task.name.includes("Agent") || task.name.includes("仓库")) {
    return "codex-1";
  }
  if (task.difficulty >= 4 && task.latencyToleranceMs >= 120000) {
    return "GPT-5-slow";
  }
  if (task.difficulty >= 4 && task.latencyToleranceMs >= 60000) {
    return "o4-mini";
  }
  if (task.difficulty <= 2) {
    return "GPT-4o";
  }
  return "GPT-5-fast";
}

// ---- 成本估算 ----
// 启用思考时，思考 token 按输出价计费
function estimate(modelKey, task) {
  const m = openaiModels[modelKey];
  const thinkTokens = m.think ? task.thinkTokens : 0;
  const cost =
    (task.inTokens / 1_000_000) * m.in +
    ((task.outTokens + thinkTokens) / 1_000_000) * m.out;
  return { model: modelKey, cost, thinkTokens, desc: m.desc };
}

// ---- 执行 ----
console.log("========================================");
console.log("  OpenAI 模型思考预算计算器");
console.log("========================================\\n");

console.log(
  "任务".padEnd(16) +
    "难度".padStart(6) +
    "延迟容忍".padStart(10) +
    "推荐模型".padStart(14) +
    "思考token".padStart(12) +
    "单次成本".padStart(12)
);
console.log("-".repeat(70));

tasks.forEach((t) => {
  const modelKey = pickModel(t);
  const r = estimate(modelKey, t);
  console.log(
    t.name.padEnd(16) +
      t.difficulty.toString().padStart(6) +
      (t.latencyToleranceMs / 1000 + "s").padStart(10) +
      r.model.padStart(14) +
      r.thinkTokens.toString().padStart(12) +
      ("$" + r.cost.toFixed(4)).padStart(12)
  );
});

// ---- 思考 vs 不思考 对比 ----
console.log("\\n========================================");
console.log("  同一难题：开/关思考的成本与质量对比");
console.log("========================================");

const hardTask = tasks.find((t) => t.name === "架构设计");
const withoutThink = estimate("GPT-5-fast", { ...hardTask, thinkTokens: 0 });
const withThink = estimate("GPT-5-slow", hardTask);
console.log("  任务：" + hardTask.name + "（难度 " + hardTask.difficulty + "）");
console.log("  不开思考：" + withoutThink.model + "，单次 $" + withoutThink.cost.toFixed(4) + "，质量预期：中");
console.log("  开思考：  " + withThink.model + "，单次 $" + withThink.cost.toFixed(4) + "，质量预期：高");
console.log("  成本倍数：" + (withThink.cost / withoutThink.cost).toFixed(1) + "x");
console.log("\\n  结论：");
console.log("    - 架构决策这类“错一步影响很大”的任务，开思考的多花几倍钱是值得的；");
console.log("    - 行内补全这类高频低难度任务，开思考是纯浪费；");
console.log("    - 关键是按任务难度动态切换，而不是一刀切。");

console.log("\\n✅ 计算完成，建议把这套规则接入你的 IDE 模型切换逻辑。");
`
  },

  {
    id: "aiapp-other-models",
    icon: "🌐",
    group: "主流大模型对比",
    title: "Gemini/DeepSeek/Qwen/GLM 等对比",
    content: `
# 第9章：Gemini/DeepSeek/Qwen/GLM 等对比

Claude 与 GPT 之外，2026 年的大模型版图还有一大批不可忽视的玩家。本章聚焦 Google Gemini、DeepSeek、阿里 Qwen、智谱 GLM、字节豆包、月之暗面 Kimi、Meta Llama、Mistral，并重点讨论国产模型在中文与开源场景的独特价值。

## 9.1 Google Gemini

Gemini 是 Google DeepMind 的旗舰系列，主打“原生多模态 + 超长上下文”。截至 2026 年中，主力阵容（部分型号为预期/规划中，以官方为准）：

| 模型 | 上下文 | 定位 | 编程特点 |
| --- | --- | --- | --- |
| Gemini 2.5 Pro（已发布） | 2M | 旗舰，超长上下文 | 整仓库理解、长文档+代码混合任务 |
| Gemini 2.5 Flash（已发布） | 1M | 高速主力 | IDE 补全、轻量 Agent |
| Gemini 3（预期） | — | 下一代 | 官方未确认参数 |

**Gemini 2M 超长上下文应用**：2M token 是目前公开模型里最大的上下文窗口之一。它的价值不在“日常编程”，而在“一次性吞下整个大型 monorepo 或整套技术文档”。典型场景：

- 把整个 Kubernetes 仓库 + 设计文档塞进去，让模型回答架构问题；
- 把一本 1000 页的技术书 + 配套源码喂给模型，做“带源码的书本问答”；
- 把一个大型迁移项目的历史 PR 全部喂进去，让模型总结迁移规律。

但要注意：2M 上下文单价高、有效注意力仍受“中间遗忘”影响，且大多数日常任务根本用不到这么大的窗口。它更适合“研究/分析”类一次性大任务，不适合“写代码”这种高频小任务。

## 9.2 DeepSeek

DeepSeek（深度求索）是国产开源大模型的代表之一，凭借“低成本 + 开源 + 强推理”在 2025 年全球走红。主要型号：

| 模型 | 类型 | 特点 |
| --- | --- | --- |
| DeepSeek-V3（已发布） | 通用大模型 | MoE 架构，性价比极高，编程能力接近一线闭源 |
| DeepSeek-R1（已发布） | 推理模型 | 开源推理模型代表作，能力对标 o1 |
| DeepSeek-Coder-V3（已发布） | 代码专项 | 专为编程调优，多语言表现强 |
| DeepSeek-V4（预期/规划中） | 下一代 | 官方未确认，业界普遍预期 2026 年内发布 |

**DeepSeek R1 的推理能力与开源价值**：R1 是第一个真正意义上“能打”的开源推理模型。它通过强化学习而非单纯蒸馏获得了推理能力，在数学、算法、复杂调试上接近 o1。它的开源价值有三层：

1. **可自部署**：企业可以把模型部署在内网，满足数据合规与隐私要求，这对金融、政务、军工场景极其重要；
2. **可微调**：基于 R1 做领域微调，能在垂直场景获得超过闭源模型的表现；
3. **价格锚定**：R1 的开源迫使闭源推理模型降价，是 2025 年下半年推理模型价格大幅下降的重要推手。

## 9.3 阿里 Qwen

Qwen（通义千问）是阿里的开源系列，覆盖从 0.5B 到 110B+ 的全尺寸，并细分出 Coder、Math、VL 等专项模型。截至 2026 年中：

| 模型 | 定位 | 特点 |
| --- | --- | --- |
| Qwen3-Coder（已发布） | 代码专项 | Agent 模式原生支持，多语言编程强 |
| Qwen3-Max（已发布） | 闭源旗舰 | 综合能力对标 GPT-4o |
| Qwen3-VL（已发布） | 多模态 | 图文混合任务 |

**Qwen3 Coder 的 Agent 模式**：Qwen3 Coder 在训练阶段就引入了“Agent 轨迹”数据，让模型原生理解“调用工具—观察结果—下一步”的循环。这意味着在 Aider、OpenHands、自建 Agent 框架里，它的工具调用稳定性明显高于通用模型。对中文代码仓库（注释、文档、变量名含中文）的契合度也更好。

## 9.4 智谱 GLM

智谱 AI 的 GLM 系列是国内最早开源的大模型之一，GLM-4.5/4.6（已发布）在编程与推理上稳步提升，定位偏“通用 + Agent”。它的特点是中文指令遵循好、工具调用稳定，且与智谱自家的 Agent 平台深度集成。在企业级私有化部署场景，GLM 是国内主流选项之一。

## 9.5 字节豆包

字节跳动的豆包系列主要面向消费市场（豆包 App），但豆包大模型也通过火山引擎对外开放。它在中文对话、内容生成上有优势，编程能力相对 Claude/GPT 仍有差距，适合中文内容创作 + 轻量代码辅助的混合场景。

## 9.6 月之暗面 Kimi

Kimi 以“长上下文”起家（早期主打 200 万字中文），在长文档总结、长代码仓库理解上有口碑。Kimi K2（已发布）在编程与推理上接近一线水平，且在中文长文档场景下性价比高。它的定位偏“长文档分析与中文场景”。

## 9.7 Meta Llama

Llama 是 Meta 的开源旗舰系列，Llama 3/3.1（已发布）覆盖 8B~405B，是开源社区最广泛使用的基座。Llama 4（部分型号已发布）引入了 MoE 架构与原生多模态。它的价值在于“可自由商用 + 生态最完整”——几乎所有推理框架、量化方案、微调工具都第一时间支持 Llama。但纯基座在编程上略逊于专项调优的 DeepSeek-Coder/Qwen-Coder，需要做领域微调才能发挥最佳水平。

## 9.8 Mistral

Mistral AI（法国）是欧洲代表，主打“小而精”。Mistral 7B、Mixtral 8x7B/8x22B（已发布）以极小参数量达到接近大模型的表现，适合资源受限的本地部署场景。Codestral（已发布）是其代码专项模型，在多语言补全上表现不错，常用于本地 IDE 补全（如 Continue 配合本地推理）。

## 9.9 国产模型在中文场景与开源优势

把上面这些模型放在一起看，国产模型（DeepSeek、Qwen、GLM、Kimi、豆包）有两个结构性优势：

**1. 中文场景优势**。中文语料占比高、中文指令遵循好、对中文技术文档（CSDN、掘金、知乎专栏、官方中文文档）的覆盖更全。具体表现为：

- 读懂含中文注释的代码更准；
- 生成中文文档/commit message/PR 描述更自然；
- 理解中文需求描述（尤其带行业术语）更精准；
- 在中文合规审查、中文内容审核类任务上更可控。

**2. 开源优势**。DeepSeek、Qwen、GLM 都提供开源权重，这意味着：

- 数据可自托管，满足金融/政务/医疗的合规要求；
- 可做领域微调，垂直场景表现可超过通用闭源；
- 可量化部署到本地/边缘，降低长期调用成本；
- 价格透明、可预测，不被闭源厂商的调价策略绑架。

下表是各模型在“中文/编程/开源/Agent”四个维度的粗略对比（5 分制，仅为示意）：

| 模型 | 中文 | 编程 | 开源 | Agent | 综合定位 |
| --- | --- | --- | --- | --- | --- |
| Gemini 2.5 Pro | 4 | 4 | 0 | 4 | 超长上下文、多模态 |
| DeepSeek R1 | 5 | 4 | 5 | 3 | 开源推理王者 |
| DeepSeek-Coder-V3 | 5 | 5 | 5 | 4 | 开源编程主力 |
| Qwen3-Coder | 5 | 4 | 5 | 5 | Agent 化编程 |
| GLM-4.6 | 5 | 4 | 4 | 4 | 企业私有化 |
| Kimi K2 | 5 | 4 | 3 | 3 | 长文档中文场景 |
| Llama 4 | 3 | 4 | 5 | 3 | 通用开源基座 |
| Codestral | 3 | 4 | 4 | 2 | 本地补全 |

\`\`\`text
选型速记：
  要超长上下文 / 整仓库分析 ──>  Gemini 2.5 Pro
  要开源 + 强推理            ──>  DeepSeek R1
  要开源 + 强编程            ──>  DeepSeek-Coder-V3 / Qwen3-Coder
  要 Agent 化编程            ──>  Qwen3-Coder
  要企业私有化               ──>  GLM-4.6 / Qwen3
  要本地小模型补全           ──>  Codestral / Llama 4 小尺寸
  要中文长文档               ──>  Kimi K2
\`\`\`

最后一章我们会把所有模型放在一起，给出一份“按场景选模型”的实战指南。
`,
    code: `// =============================================================
// 第9章示例：多模型对比与选型矩阵
// 给定一组候选模型与若干维度评分，输出综合排名与场景推荐
// =============================================================

// ---- 候选模型（5 分制评分，仅供示例）----
const models = [
  { name: "Gemini 2.5 Pro",   chinese: 4, coding: 4, open: 0, agent: 4, ctx: 2_000_000, priceIn: 1.25, priceOut: 5 },
  { name: "DeepSeek R1",      chinese: 5, coding: 4, open: 5, agent: 3, ctx: 128_000,   priceIn: 0.55, priceOut: 2.19 },
  { name: "DeepSeek-Coder-V3",chinese: 5, coding: 5, open: 5, agent: 4, ctx: 128_000,   priceIn: 0.27, priceOut: 1.1 },
  { name: "Qwen3-Coder",      chinese: 5, coding: 4, open: 5, agent: 5, ctx: 256_000,   priceIn: 0.5,  priceOut: 2 },
  { name: "GLM-4.6",          chinese: 5, coding: 4, open: 4, agent: 4, ctx: 128_000,   priceIn: 0.6,  priceOut: 2.2 },
  { name: "Kimi K2",          chinese: 5, coding: 4, open: 3, agent: 3, ctx: 256_000,   priceIn: 0.6,  priceOut: 2.5 },
  { name: "Llama 4 70B",      chinese: 3, coding: 4, open: 5, agent: 3, ctx: 128_000,   priceIn: 0.3,  priceOut: 0.9 },
  { name: "Codestral",        chinese: 3, coding: 4, open: 4, agent: 2, ctx: 32_000,    priceIn: 0.3,  priceOut: 0.9 },
];

// ---- 场景定义：每个场景对四个维度的权重不同 ----
const scenarios = [
  { name: "整仓库分析",     weights: { chinese: 0.2, coding: 0.3, open: 0.1, agent: 0.2 }, needCtx: 1_000_000 },
  { name: "开源推理研究",   weights: { chinese: 0.1, coding: 0.2, open: 0.6, agent: 0.1 }, needCtx: 64_000 },
  { name: "Agent 化编程",   weights: { chinese: 0.2, coding: 0.4, open: 0.1, agent: 0.5 }, needCtx: 128_000 },
  { name: "企业私有化",     weights: { chinese: 0.4, coding: 0.3, open: 0.5, agent: 0.3 }, needCtx: 128_000 },
  { name: "本地小模型补全", weights: { chinese: 0.2, coding: 0.4, open: 0.5, agent: 0.1 }, needCtx: 32_000 },
  { name: "中文长文档",     weights: { chinese: 0.6, coding: 0.1, open: 0.1, agent: 0.1 }, needCtx: 512_000 },
];

// ---- 加权打分 ----
// 综合分 = Σ(维度分 × 权重)，再减去“上下文不足”的惩罚
function score(model, scenario) {
  const w = scenario.weights;
  let s =
    model.chinese * w.chinese +
    model.coding * w.coding +
    model.open * w.open +
    model.agent * w.agent;
  // 上下文不足则扣分
  if (model.ctx < scenario.needCtx) {
    s *= 0.4;
  }
  // 价格越低越好，归一化到 0~1 的加成
  const priceScore = Math.max(0, 1 - model.priceOut / 5);
  s += priceScore * 0.3;
  return s;
}

// ---- 执行：每个场景输出 Top 3 ----
console.log("========================================");
console.log("  多模型场景化选型矩阵");
console.log("========================================\\n");

scenarios.forEach((sc) => {
  console.log("场景：" + sc.name + "（需上下文 " + (sc.needCtx / 1000) + "K）");
  const ranked = models
    .map((m) => ({ name: m.name, score: score(m, sc), ctx: m.ctx }))
    .filter((m) => m.ctx >= sc.needCtx * 0.5) // 上下文差距太大直接淘汰
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (ranked.length === 0) {
    console.log("  （无满足上下文要求的模型）\\n");
    return;
  }
  ranked.forEach((r, i) => {
    const medal = ["🥇", "🥈", "🥉"][i];
    console.log("  " + medal + " " + r.name.padEnd(22) + " 综合分 " + r.score.toFixed(2));
  });
  console.log("");
});

// ---- 全维度对比表 ----
console.log("========================================");
console.log("  全维度对比表（5 分制）");
console.log("========================================\\n");
console.log(
  "模型".padEnd(22) +
    "中文".padStart(6) +
    "编程".padStart(6) +
    "开源".padStart(6) +
    "Agent".padStart(7) +
    "上下文".padStart(10) +
    "输出价".padStart(10)
);
console.log("-".repeat(67));
models.forEach((m) => {
  console.log(
    m.name.padEnd(22) +
      m.chinese.toString().padStart(6) +
      m.coding.toString().padStart(6) +
      m.open.toString().padStart(6) +
      m.agent.toString().padStart(7) +
      (m.ctx / 1000 + "K").padStart(10) +
      ("$" + m.priceOut).padStart(10)
  );
});

console.log("\\n========================================");
console.log("  关键洞察");
console.log("========================================");
console.log("  1. 没有哪个模型在所有场景都最优，选型必须按场景加权。");
console.log("  2. 国产模型在“中文 + 开源”组合上有结构性优势，企业私有化首选。");
console.log("  3. DeepSeek-Coder-V3 在“开源 + 编程 + 价格”三项都接近满分，是性价比之王。");
console.log("  4. Gemini 2.5 Pro 的 2M 上下文是独门武器，但价格与延迟要权衡。");
console.log("  5. Qwen3-Coder 在 Agent 化编程上评分最高，适合自建 Agent 工作流。");
console.log("\\n✅ 对比完成，下一章将给出完整的“按场景选模型”实战指南。");
`
  },

  {
    id: "aiapp-model-selector",
    icon: "🎯",
    group: "主流大模型对比",
    title: "按场景选模型实战指南",
    content: `
# 第10章：按场景选模型实战指南

前四章我们拆解了 Claude、GPT/o、Gemini、DeepSeek、Qwen、GLM 等主流模型。本章把所有内容收束成一份可直接落地的“按场景选模型”实战指南，包含决策树、6 场景 × 5 维度对比表、模型组合策略与成本控制技巧。

## 10.1 选模型决策树

选模型不要从“哪个模型最强”开始，而要从“我要解决什么任务”开始。下面是一棵可直接照着走的决策树：

\`\`\`text
                       ┌─ 任务类型是什么？─┐
                       │                   │
              ┌──编程──┴──┐         ┌──非编程──┴──┐
              │           │         │            │
        难任务/长Agent   日常编程   中文长文档   多模态/图文
              │           │         │            │
       ┌──────┴──────┐    │         │            │
       │             │    │         │            │
   需要深度推理   不需要    │         │            │
       │             │    │         │            │
   o3/GPT-5慢    Claude4   │     Kimi/GLM    GPT-4o/Gemini
   /Claude4 Opus  Sonnet   │
                          │
                  ┌───────┴───────┐
                  │               │
              高频低难度       中等难度
                  │               │
              Haiku/Codestral   Sonnet/GPT-4o
              /o4-mini          /DeepSeek-Coder
\`\`\`

决策树的核心思路是“层层收敛”：

1. **第一层：任务类型**。先分清是编程还是非编程，是难任务还是日常任务。
2. **第二层：难度与延迟容忍**。难任务且容忍慢——上推理模型；难任务但要快——上旗舰非推理；日常任务——上主力机型。
3. **第三层：特殊约束**。预算极紧、需要私有化、需要中文优势、需要多模态——这些约束会把候选集进一步缩小。

## 10.2 6 类典型场景的推荐模型

下面把日常工作中最常见的 6 类场景展开，给出推荐模型与理由。

**场景 1：日常补全**（写注释、补函数、改格式）。需求是“快、便宜、够用”。推荐：Haiku 4 / Codestral / o4-mini。本地部署可考虑 Llama 4 小尺寸或 Qwen3-Coder 小尺寸。不要用 Opus 或 o3——纯浪费。

**场景 2：复杂重构**（跨文件重构、模块拆分）。需求是“精准、守规矩、长上下文”。推荐：Claude Sonnet 4（默认）/ Claude Opus 4（极复杂）/ DeepSeek-Coder-V3（开源替代）。这类任务最忌讳模型自作主张改一堆无关文件，Claude 的“守规矩”优势在这里最值钱。

**场景 3：架构设计**（技术选型、数据流设计、API 契约）。需求是“深度推理、想清楚”。推荐：o3 / GPT-5 慢思考 / Claude Opus 4 + Extended Thinking。这类任务错一步影响很大，值得花几十秒到几分钟让模型深度推理。

**场景 4：调试疑难**（找了三小时找不到原因的 bug）。需求是“能列全可能性、能读长堆栈”。推荐：o3 / Claude Opus 4 / DeepSeek R1。让模型把所有可能原因列出来逐一推演，比你自己冥思苦想更快定位。

**场景 5：文档总结**（读长文档、整理会议纪要、总结 PR）。需求是“长上下文、中文好”。推荐：Gemini 2.5 Pro（超长文档）/ Kimi K2（中文长文档）/ GLM-4.6（中文合规）。文档类任务对编程能力要求低，对长上下文与中文要求高。

**场景 6：数据分析**（读 CSV、写 SQL、做图表）。需求是“能跑代码、能看结果”。推荐：GPT-4o（Code Interpreter）/ Claude Sonnet 4（Artifacts）/ Gemini 2.5 Pro。需要模型能执行代码并基于结果迭代的场景，优先选有 Code Interpreter 的平台。

## 10.3 6 场景 × 5 维度对比表

把上面 6 个场景在“质量 / 速度 / 价格 / 上下文 / 工具支持”5 个维度上对模型的要求列清楚，便于你做最后权衡：

| 场景 | 质量 | 速度 | 价格 | 上下文 | 工具支持 |
| --- | --- | --- | --- | --- | --- |
| 日常补全 | 中 | 极高 | 极低 | 低 | 中 |
| 复杂重构 | 极高 | 中 | 中高 | 高 | 高 |
| 架构设计 | 极高 | 低（容忍慢） | 中高 | 中 | 中 |
| 调试疑难 | 高 | 低（容忍慢） | 中 | 高（堆栈长） | 高（要跑命令） |
| 文档总结 | 中 | 中 | 低 | 极高 | 低 |
| 数据分析 | 高 | 中 | 中 | 中 | 极高（要跑代码） |

读法：每个维度标注的是“这个场景对该维度的要求强度”。比如“日常补全”对“速度”要求极高、对“价格”要求极低，所以选 Haiku/Codestral 这类小模型；“架构设计”对“质量”要求极高、对“速度”要求低（容忍慢），所以选 o3/GPT-5 慢思考。

## 10.4 模型组合策略：主用 + 备用

实战中几乎没人只用一个模型。最稳健的策略是“主用 + 备用”组合：

**推荐组合 A：Claude 主力 + GPT 备用**。日常用 Claude Sonnet 4（编程精度高、守规矩），遇到需要深度推理或多模态时切到 GPT-5 慢思考 / GPT-4o。这是 2026 年最主流的组合，覆盖 90% 场景。

**推荐组合 B：开源主用 + 闭源备用**。日常用 DeepSeek-Coder-V3 / Qwen3-Coder（自部署、低成本、数据可控），遇到极难任务时调用 Claude Opus 4 / o3。适合预算敏感或合规要求高的团队。

**推荐组合 C：分场景专用**。补全用 Haiku/Codestral，重构用 Sonnet，架构用 o3，长文档用 Gemini 2.5 Pro。这是效率最高的组合，但需要在 IDE/工具链里做模型切换配置，管理复杂度高。

下表是三种组合的对比：

| 组合 | 月度成本（单人） | 管理复杂度 | 适用团队 |
| --- | --- | --- | --- |
| A：Claude + GPT | $50~150 | 低 | 通用开发团队 |
| B：开源 + 闭源备用 | $10~60 | 中 | 预算敏感/合规团队 |
| C：分场景专用 | $30~120 | 高 | AI 重度团队 |

## 10.5 成本控制技巧

模型用得越多，账单越容易失控。下面是 6 条经过验证的成本控制技巧：

1. **默认用便宜模型，按需升级**。IDE 默认设为 Sonnet/Haiku，只在任务确实难时手动切 Opus/o3。这一条能省下 60% 以上的账单。
2. **让模型少废话**。在 Prompt 里明确要求“只输出 diff，不要解释”“直接给代码，不要前后文”。输出 token 比输入贵 5 倍，少废话就是省钱。
3. **精准喂上下文，别全塞**。用检索/符号筛选把相关文件挑出来喂，而不是把整个仓库塞进去。长上下文有阶梯计价，且有效注意力会下降。
4. **缓存常用前缀**。主流 API 都支持 prompt caching，把系统提示、项目规范、常用上下文做成缓存，能显著降低重复调用的输入成本。
5. **批量任务用小模型**。分类、改格式、写注释这类批量任务，统一用 Haiku/Codestral/小尺寸开源模型，不要顺手用 Opus。
6. **监控 + 告警**。给每个成员/每个项目设月度预算阈值，超 80% 告警。没有监控的成本控制都是空谈。

\`\`\`text
成本控制口诀：
  默认便宜，按需升级
  少废话，省输出
  精喂上下文，巧用缓存
  批量用小，监控兜底
\`\`\`

## 10.6 把选型落地到工具链

选好模型后，要把它落地到日常工具链里才有效果。常见落地方式：

- **IDE 层**：在 Cursor/Trae/Continue 里配置多个模型 profile，按快捷键切换；
- **CLI 层**：在 Claude Code/Codex CLI/Aider 的配置文件里设默认模型与备用模型；
- **平台层**：在团队自建的 Agent 平台里，按任务类型路由到不同模型；
- **预算层**：在 API 网关里给每个模型设月度预算上限，超限自动降级到便宜模型。

这套“选型—组合—成本控制—工具链落地”的闭环，是把本章内容变成生产力的最后一步。模型会持续更新，但这套决策框架是稳定的——下次再有新模型发布，你只需把它放进决策树对应的位置即可。

\`\`\`text
本批 5 章（第 6~10 章）小结：
  6. 大模型基础与评估指标   ──>  看懂 Benchmark，不被发布会牵着走
  7. Claude 系列深度解析    ──>  工程化编程首选，Sonnet 默认、Opus 按需
  8. OpenAI GPT/o 系列解析  ──>  生态最广，o 系列适合难题与架构
  9. 其他主流模型对比       ──>  国产模型在中文与开源有结构性优势
  10. 按场景选模型实战指南  ──>  决策树 + 组合策略 + 成本控制

下一批章节将进入 AI 编程工具的深度使用，敬请期待。
\`\`\`
`,
    code: `// =============================================================
// 第10章示例：按场景选模型决策器
// 输入任务画像，输出推荐模型、理由与成本估算
// =============================================================

// ---- 模型库（精选，含关键属性）----
// price: $/1M tokens（输入/输出）
// think: 是否支持慢思考
// tags: 适合的标签
const modelLib = [
  { name: "Claude Opus 4",      in: 15,  out: 75, ctx: 200_000, think: true,  tags: ["难任务","长Agent","架构","重构"] },
  { name: "Claude Sonnet 4",    in: 3,   out: 15, ctx: 200_000, think: false, tags: ["日常编程","重构","写测试","CodeReview"] },
  { name: "Claude Haiku 4",     in: 0.8, out: 4,  ctx: 200_000, think: false, tags: ["补全","批量","轻量"] },
  { name: "GPT-5-slow",         in: 5,   out: 20, ctx: 400_000, think: true,  tags: ["架构","难题","调试"] },
  { name: "GPT-4o",             in: 2.5, out: 10, ctx: 128_000, think: false, tags: ["多模态","数据分析","日常编程"] },
  { name: "codex-1",            in: 6,   out: 24, ctx: 200_000, think: true,  tags: ["Agent","重构"] },
  { name: "Gemini 2.5 Pro",     in: 1.25,out: 5,  ctx: 2_000_000, think: false, tags: ["长文档","整仓库","多模态"] },
  { name: "DeepSeek-Coder-V3",  in: 0.27,out: 1.1,ctx: 128_000, think: false, tags: ["日常编程","重构","开源"] },
  { name: "DeepSeek R1",        in: 0.55,out: 2.19,ctx: 128_000, think: true, tags: ["难题","调试","开源"] },
  { name: "Qwen3-Coder",        in: 0.5, out: 2,  ctx: 256_000, think: false, tags: ["Agent","日常编程","开源"] },
  { name: "Kimi K2",            in: 0.6, out: 2.5,ctx: 256_000, think: false, tags: ["长文档","中文"] },
  { name: "GLM-4.6",            in: 0.6, out: 2.2,ctx: 128_000, think: false, tags: ["中文","私有化"] },
];

// ---- 场景定义 ----
// 每个场景附带：任务类型标签、难度、延迟容忍(ms)、典型 token 量、预算偏好
const scenarios = [
  {
    name: "日常补全",
    needTags: ["补全","轻量"],
    difficulty: 1,
    latencyMs: 800,
    inTokens: 1200, outTokens: 80,
    budgetPreference: "low",
  },
  {
    name: "复杂重构",
    needTags: ["重构"],
    difficulty: 4,
    latencyMs: 30000,
    inTokens: 20000, outTokens: 2500,
    budgetPreference: "mid",
  },
  {
    name: "架构设计",
    needTags: ["架构"],
    difficulty: 5,
    latencyMs: 180000,
    inTokens: 10000, outTokens: 3000,
    budgetPreference: "mid",
  },
  {
    name: "调试疑难",
    needTags: ["调试","难题"],
    difficulty: 5,
    latencyMs: 120000,
    inTokens: 8000, outTokens: 2000,
    budgetPreference: "mid",
  },
  {
    name: "文档总结",
    needTags: ["长文档","中文"],
    difficulty: 2,
    latencyMs: 60000,
    inTokens: 500000, outTokens: 2000,
    budgetPreference: "low",
  },
  {
    name: "数据分析",
    needTags: ["数据分析","多模态"],
    difficulty: 3,
    latencyMs: 30000,
    inTokens: 6000, outTokens: 1500,
    budgetPreference: "mid",
  },
];

// ---- 决策函数 ----
// 规则：
//   1. 必须支持所需标签中的至少一个
//   2. 上下文必须 >= 任务输入 token
//   3. 难度 >=4 时优先 think=true
//   4. 预算 low 时优先单价低
function decide(scenario) {
  // 过滤：标签匹配 + 上下文足够
  let candidates = modelLib.filter((m) => {
    const tagMatch = m.tags.some((t) => scenario.needTags.includes(t));
    const ctxOk = m.ctx >= scenario.inTokens * 1.2;
    return tagMatch && ctxOk;
  });

  if (candidates.length === 0) {
    return { recommended: "无匹配模型", cost: 0, reason: "标签或上下文不满足" };
  }

  // 打分
  candidates = candidates.map((m) => {
    let score = 0;
    // 标签匹配数
    score += m.tags.filter((t) => scenario.needTags.includes(t)).length * 2;
    // 难任务偏好思考
    if (scenario.difficulty >= 4 && m.think) score += 3;
    // 简单任务偏好不思考（省成本）
    if (scenario.difficulty <= 2 && !m.think) score += 1;
    // 预算偏好
    if (scenario.budgetPreference === "low") {
      score += Math.max(0, 5 - m.out); // 输出价越低分越高
    }
    // 成本估算
    const cost = (scenario.inTokens / 1_000_000) * m.in + (scenario.outTokens / 1_000_000) * m.out;
    return { ...m, score, cost };
  });

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return {
    recommended: best.name,
    cost: best.cost,
    reason: "标签匹配=" + best.tags.filter((t) => scenario.needTags.includes(t)).join("/") +
            "，难度=" + scenario.difficulty +
            (scenario.difficulty >= 4 && best.think ? "，支持思考" : "") +
            "，上下文=" + (best.ctx / 1000) + "K",
  };
}

// ---- 执行 ----
console.log("========================================");
console.log("  按场景选模型决策器");
console.log("========================================\\n");

console.log(
  "场景".padEnd(14) +
    "难度".padStart(6) +
    "输入token".padStart(12) +
    "推荐模型".padStart(20) +
    "单次成本".padStart(12)
);
console.log("-".repeat(64));

scenarios.forEach((sc) => {
  const r = decide(sc);
  console.log(
    sc.name.padEnd(14) +
      sc.difficulty.toString().padStart(6) +
      sc.inTokens.toString().padStart(12) +
      r.recommended.padStart(20) +
      ("$" + r.cost.toFixed(4)).padStart(12)
  );
});

// ---- 月度组合账单模拟 ----
console.log("\\n========================================");
console.log("  组合 A：Claude 主力 + GPT 备用 月度账单模拟");
console.log("========================================");

const monthlyTasks = [
  { scenario: "日常补全", count: 2000, model: "Claude Haiku 4" },
  { scenario: "复杂重构", count: 15,   model: "Claude Sonnet 4" },
  { scenario: "架构设计", count: 4,    model: "GPT-5-slow" },
  { scenario: "调试疑难", count: 6,    model: "GPT-5-slow" },
  { scenario: "文档总结", count: 20,   model: "Claude Sonnet 4" },
  { scenario: "数据分析", count: 10,   model: "GPT-4o" },
];

let total = 0;
console.log("\\n场景".padEnd(14) + "模型".padStart(20) + "次数".padStart(8) + "单次成本".padStart(12) + "小计".padStart(12));
console.log("-".repeat(66));
monthlyTasks.forEach((mt) => {
  const sc = scenarios.find((s) => s.name === mt.scenario);
  const m = modelLib.find((x) => x.name === mt.model);
  const cost = (sc.inTokens / 1_000_000) * m.in + (sc.outTokens / 1_000_000) * m.out;
  const sub = cost * mt.count;
  total += sub;
  console.log(
    mt.scenario.padEnd(14) +
      mt.model.padStart(20) +
      mt.count.toString().padStart(8) +
      ("$" + cost.toFixed(4)).padStart(12) +
      ("$" + sub.toFixed(2)).padStart(12)
  );
});
console.log("-".repeat(66));
console.log("月度合计".padEnd(14) + "".padStart(20) + "".padStart(8) + "".padStart(12) + ("$" + total.toFixed(2)).padStart(12));

console.log("\\n========================================");
console.log("  最终建议");
console.log("========================================");
console.log("  1. 默认便宜、按需升级，是控制成本的第一原则。");
console.log("  2. 把决策规则接入 IDE/CLI 的模型切换配置，让选型自动化。");
console.log("  3. 每季度用内部 Benchmark 重跑一次，保持选型结论新鲜。");
console.log("  4. 模型会变，但“按场景决策 + 组合策略 + 成本控制”的框架是稳定的。");
console.log("\\n✅ 决策器运行完毕，主流大模型对比组 5 章到此结束。");
`
  }
];
