// =============================================================
// AI 应用编程教程 —— 第 6 批章节（提示词工程实战组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   26. aiapp-prompt-framework  编程提示词框架
//   27. aiapp-prompt-codegen    代码生成提示词模板
//   28. aiapp-prompt-review     代码审查与重构模板
//   29. aiapp-prompt-debug      Bug 修复与调试模板
//   30. aiapp-prompt-docs       文档与测试模板
//
// 信息时效：2026-07-05。框架命名与字段含义以公开社区约定为准。
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
    id: "aiapp-prompt-framework",
    icon: "🏗️",
    group: "提示词工程实战",
    title: "编程提示词框架",
    content: `
# 第26章：编程提示词框架

## 26.1 为什么需要框架

写提示词和写代码一样，没有结构也能跑，但有了结构就能复用、能审查、能迭代。所谓"提示词框架"，就是把一段凌乱的需求描述拆成几个固定槽位（slot），让模型在每个槽位里都能拿到明确的信号。这一章会拆解 4 个在编程社区里被反复使用的框架：**RTCF**、**CRISPE**、**TAG**、**CO-STAR**，并给出编程场景下的推荐组合。

先说为什么不能"想到什么写什么"。一个反面例子是这样的需求："帮我写个用户登录接口，要安全，用 Node。"模型接到这种提示后只能靠猜：用什么框架？Express 还是 Fastify？JWT 还是 Session？密码用什么哈希？返回 JSON 还是 HTML？要不要限流？由于信号不足，模型会自动"补全默认值"——而这些默认值往往不是你想要的。结果是你要么拿到一段不能用、要么反复来回改 5 轮。

框架的价值就是"把该说的提前说清"，把 5 轮来回压缩成 1 轮出活。下面四个框架的命名都是社区约定俗成的助记符，记不住名字没关系，记住槽位就行。

## 26.2 RTCF：Role / Task / Context / Format

**RTCF** 是最朴素也最实用的框架，四个槽位覆盖了 80% 的编程场景：

- **Role（角色）**：让模型扮演谁，比如"资深 Node.js 后端工程师"。
- **Task（任务）**：要做什么，比如"实现用户登录接口"。
- **Context（上下文）**：相关约束与背景，比如技术栈、版本、已有代码。
- **Format（输出格式）**：要什么样的产物，比如"只输出代码 + 文件路径，不要解释"。

一个最小可用的 RTCF 示例：

\`\`\`text
[Role]
你是一位有 10 年经验的 Node.js 后端工程师，熟悉 Express、JWT、PostgreSQL。

[Task]
实现一个用户登录接口 POST /api/login，校验用户名密码并签发 JWT。

[Context]
- 技术栈：Node.js 20 + Express 4 + pg 8
- 密码在数据库中已用 bcrypt(cost=12) 存储
- JWT 算法用 HS256，密钥从 process.env.JWT_SECRET 读取
- 已有 db.js 导出 query(text, params) 函数
- 不需要引入新依赖

[Format]
- 输出单个文件 routes/login.js
- 代码顶部带简短注释说明设计取舍
- 不要输出 markdown 围栏，不要输出测试代码
\`\`\`

RTCF 的优点是**槽位少、记忆成本低、几乎不会出错**。它的缺点是没有显式地容纳"风格、受众、约束"这类维度——而这些在写文档、写营销文案时很重要。所以编程场景 RTCF 几乎是默认选择，但写"给人看"的内容时建议换 CO-STAR。

## 26.3 CRISPE：Capacity / Role / Insight / Statement / Personality / Experiment

**CRISPE** 来自 GitHub 上一份广为流传的提示词工程指南，把维度拆得更细，适合复杂任务：

- **Capacity & Role（能力与角色）**：模型应以什么专家身份回答，例如"既懂分布式系统又懂 PostgreSQL 调优的架构师"。
- **Insight（洞察）**：背景与隐含信息，例如"当前系统 QPS 约 2000，主库 CPU 长期 80%"。
- **Statement（陈述）**：具体要做什么，对应 RTCF 的 Task。
- **Personality（个性）**：回答风格，例如"先给结论再展开理由"。
- **Experiment（实验）**：要求模型给出多个备选方案并对比，而不是单一答案。

一个 CRISPE 示例，用于"数据库慢查询优化"：

\`\`\`text
[Capacity & Role]
你是一名同时持有 AWS Database Specialty 与 MongoDB Associate 认证的 DBA，
擅长 PostgreSQL 15 的查询计划分析与索引调优。

[Insight]
- 表 orders 约 2 亿行，按 created_at 范围分区，48 个分区
- 慢查询：SELECT * FROM orders WHERE user_id = ? AND status = 'paid'
  平均执行时间 4.2s，p99 11s
- 现有索引：PRIMARY KEY (id)，INDEX (created_at)
- 业务约束：写多读少，不能停服，可加索引但不能改表结构

[Statement]
给出 3 个不同方向的优化方案，每个方案包含：
1) 改动点（索引/查询/连接池/配置）
2) 预期收益（基于 EXPLAIN 推断）
3) 实施风险与回滚方式

[Personality]
先一句话结论，再列方案，最后给出你的推荐排序与理由。

[Experiment]
对每个方案给出"如果无效，下一步排查方向"。
\`\`\`

CRISPE 的"Experiment"槽位是它区别于其他框架的灵魂——它强迫模型给出多方案与回退路径，这在不确定根因的运维/调优场景非常有用。代价是输出会变长、token 消耗变高，简单 CRUD 用它属于"杀鸡用牛刀"。

## 26.4 TAG：Task / Action / Goal

**TAG** 是三个槽位里最简的，适合"目标明确、步骤也明确"的小任务：

- **Task（任务）**：做什么。
- **Action（动作）**：怎么做，可枚举步骤。
- **Goal（目标）**：达成什么效果，可验证。

TAG 示例：

\`\`\`text
[Task]
把 utils/date.js 里的 formatDate 函数从 moment 改成 dayjs。

[Action]
1. 读取 utils/date.js 当前实现
2. 找出所有 moment 调用点
3. 用 dayjs 等价替换，保留函数签名
4. 移除 moment 的 import，新增 dayjs 的 import
5. 不修改任何调用方代码

[Goal]
- 运行 npm test 全绿
- 打包体积减少至少 60KB（moment → dayjs 的典型收益）
- 不引入 dayjs 插件以外的任何新依赖
\`\`\`

TAG 的精髓在于 **Goal 是可验证的**——"全绿""体积减少 60KB""不引入新依赖"都是机器或人能立刻判断对错的条件。这让它特别适合做重构、迁移、性能改造这类"有客观标准"的任务。它的缺点是没有 Role 和 Context，处理复杂上下文时容易"想当然"。

## 26.5 CO-STAR：Context / Objective / Style / Tone / Audience / Response

**CO-STAR** 是新加坡政府开源提示词工具包里推广的框架，特别适合"写给人看的内容"——文档、博客、邮件、PR 描述：

- **Context（背景）**：事情的前因后果。
- **Objective（目标）**：要产出什么。
- **Style（风格）**：行文风格，例如"技术博客，每段不超过 3 句"。
- **Tone（语气）**：正式/轻松/严谨。
- **Audience（受众）**：给谁看，例如"有 1-3 年经验的前端工程师"。
- **Response（响应格式）**：输出结构。

CO-STAR 示例，用于"写一篇技术博客"：

\`\`\`text
[Context]
我刚把一个 Next.js 13 项目从 Pages Router 迁移到 App Router，
踩了 7 个坑，其中 3 个是数据获取相关的，2 个是 SEO 相关的，2 个是部署相关。

[Objective]
写一篇 2000 字左右的技术博客，分享这次迁移的经验。

[Style]
- 技术博客体，第一人称
- 每个坑独立成节：标题 + 现象 + 根因 + 解决方案 + 代码片段
- 代码片段不超过 15 行

[Tone]
务实、不卖弄，承认踩坑，不夸大收益

[Audience]
有 1-3 年 React 经验、正打算迁移到 App Router的前端工程师

[Response]
Markdown 格式，含一级标题、TOC、每个坑用二级标题
\`\`\`

## 26.6 四框架差异对比

把四个框架并排放在一起看会更清楚：

| 框架 | 槽位数 | 强项 | 弱项 | 典型场景 |
| --- | --- | --- | --- | --- |
| RTCF | 4 | 简单、覆盖编程主路径 | 缺风格/受众 | 代码生成、接口实现 |
| CRISPE | 6 | 多方案、可回退、深度推理 | 长、贵、过度设计 | 调优、架构决策、根因分析 |
| TAG | 3 | 目标可验证、步骤清晰 | 无角色、无上下文 | 重构、迁移、性能改造 |
| CO-STAR | 6 | 风格/受众/语气齐全 | 偏写作、代码槽位弱 | 文档、博客、PR 描述 |

一个直觉性的选用顺序：

1. 写代码 → **RTCF**（默认）
2. 写代码但不确定方案 → **RTCF + CRISPE 的 Experiment**
3. 写文档/博客 → **CO-STAR**
4. 重构/迁移/性能改造 → **TAG**
5. 复杂运维/调优/根因 → **CRISPE**

## 26.7 编程场景为何偏爱 RTCF + 约束

下面解释为什么编程场景几乎都收敛到"RTCF + 一份约束清单"。原因有三：

第一，**代码任务的目标函数是"能跑通 + 满足约束"**，而不是"读起来舒服"。所以风格、语气这些维度价值低，Role + Task + Format 已经覆盖了 90% 的需要。

第二，**代码任务的方差主要来自"约束没说清"**。模型不会因为你没说"用 TypeScript"就主动用 TS，也不会因为你没说"别装新依赖"就忍住不装。所以与其换框架，不如把约束写成清单。

第三，**RTCF 的 Format 槽位直接决定"能不能即贴即用"**。下面这个 Format 段落是经过反复验证的"零摩擦"模板：

\`\`\`text
[Format]
- 只输出代码，不要解释、不要总结、不要"希望这对你有帮助"
- 每个文件用 "=== 文件路径 ===" 分隔
- 不要输出 markdown 围栏
- 不要输出 git commit 信息
- 如需新增依赖，在文件顶部用注释 // requires: pkg@version 标注
- 函数签名必须有 TypeScript 类型
- 错误处理用自定义 AppError 类，不要直接 throw new Error()
\`\`\`

这一段加进 RTCF 后，模型输出的代码通常可以"复制 → 粘贴 → 跑"，不需要手动删围栏、删寒暄、改错误处理风格。

## 26.8 通用编程提示词模板（六段式）

把 RTCF + 约束 + 示例 + 思考过程合并，可以得到一个"通用编程模板"，几乎所有代码任务都能套：

\`\`\`text
# 角色
你是 <具体技术栈> 资深工程师，遵守 <风格指南/规范名>。

# 任务
<一句话说清要做什么>

# 上下文
- 技术栈：<语言/框架/版本>
- 已有代码：<贴关键片段或文件路径>
- 约束：<不能装新依赖/不能改公开 API/必须兼容 ...>

# 约束清单
- 语言版本：<Node.js 20 / Python 3.12>
- 依赖策略：<不引入新依赖 / 仅允许 lodash>
- 代码风格：<Airbnb / PEP 8 / Google Style>
- 性能要求：<单次响应 < 50ms / 内存 < 100MB>
- 安全要求：<输入校验 / 参数化查询 / 不输出敏感日志>

# 示例（few-shot，可选）
输入：xxx
输出：xxx

# 输出格式
- 只输出代码，每个文件用 "=== path ===" 分隔
- 不要 markdown 围栏，不要解释
- 顶部用 // requires: pkg@version 标注新依赖
- 复杂逻辑前用 1-2 行注释说明思路

# 思考过程（Chain-of-Thought）
在输出代码前，先用 <thinking>...</thinking> 标签写：
1. 你识别到的核心问题
2. 你考虑过的 2 个方案及取舍
3. 你最终选择的方案与原因
然后再输出代码。
\`\`\`

这个模板把"指令 / 上下文 / 约束 / 示例 / 输出格式 / 思考过程"六个段都显式化了。最后一段"思考过程"是 Chain-of-Thought 的标准化用法，对复杂任务能显著提升一次成功率。

## 26.9 少样本（Few-Shot）提示

Few-Shot 是"给模型看几个输入→输出例子，让它照着做"。它的核心价值是**用例子消除歧义**——很多约束用文字说十遍不如一个例子清楚。

一个把自然语言转成 SQL 的 Few-Shot 模板：

\`\`\`text
任务：把用户的自然语言问题翻译成 SQL。

示例 1：
输入：上个月销售额最高的 3 个商品
输出：SELECT product_name, SUM(amount) AS total
      FROM orders
      WHERE created_at >= date_trunc('month', now()) - interval '1 month'
        AND created_at < date_trunc('month', now())
      GROUP BY product_name
      ORDER BY total DESC
      LIMIT 3;

示例 2：
输入：每个部门有多少在职员工
输出：SELECT dept_id, COUNT(*) AS headcount
      FROM employees
      WHERE status = 'active'
      GROUP BY dept_id;

示例 3：
输入：找出从未下过单的用户
输出：SELECT u.id, u.name
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE o.id IS NULL;

现在翻译：
输入：<用户的实际问题>
输出：
\`\`\`

Few-Shot 的经验法则：

1. **2-3 个例子通常足够**，超过 5 个收益递减、且挤占上下文。
2. **例子要覆盖典型分支**：上面 3 个例子分别覆盖了"聚合 + 时间窗口""分组统计""LEFT JOIN 反向匹配"，正好是业务里最常见的三类查询。
3. **例子的输出格式必须 100% 一致**，否则模型会学到不一致的格式。
4. **不要把边界 case 放进 Few-Shot**——边界 case 应该让模型推理，而不是模仿。

## 26.10 思维链（Chain-of-Thought）

Chain-of-Thought（CoT）的核心是"让模型在给答案前先把推理过程写出来"。在编程场景，CoT 的价值集中在三类任务：

1. **算法题**：先分析复杂度，再写代码，能显著降低错误率。
2. **根因分析**：先列假设，再验证，比直接给结论靠谱。
3. **多步重构**：先列步骤，再执行，避免漏改。

最简单的 CoT 触发方式是在 prompt 末尾加一句：

\`\`\`text
请先在 <thinking> 标签里写出你的推理过程，再在 <answer> 标签里给出最终答案。
\`\`\`

或者用 OpenAI/Anthropic 都支持的"thinking"模式（API 上的 reasoning_effort / thinking 参数），让模型在结构化字段里输出推理。两者的区别是：prompt 触发的 CoT 用户可见、可控但占输出 token；API thinking 字段对最终答案隔离，可以单独计费与丢弃。

一个把 CoT 用在"两数之和变种"的例子：

\`\`\`text
任务：给定一个整数数组 nums 和目标值 target，返回所有
"和等于 target 且不重复"的两两组合。要求 O(n) 时间。

请在 <thinking> 中：
1. 先分析为什么经典两数之和的 hash 解法在这里不够
2. 给出你的改进思路
3. 分析时间复杂度与空间复杂度

然后在 <answer> 中给出 TypeScript 实现。
\`\`\`

CoT 不是万能药。它的代价是输出变长、token 成本上升，**简单 CRUD、模板代码不要用 CoT**——这些任务没有"推理"可做，强制 CoT 反而会让模型编一段没用的废话。判断标准很简单：如果这个任务你自己做也需要先想 30 秒，那就该用 CoT；如果闭着眼睛也能写，就不用。

## 26.11 小结

框架不是教条，是脚手架。记住四件事就够用了：

1. 编程任务默认用 **RTCF**，配一份"约束清单"。
2. 写给人看的内容用 **CO-STAR**。
3. 重构/迁移用 **TAG**，目标必须可验证。
4. 调优/根因用 **CRISPE**，强制多方案与回退。

下一章会把 RTCF + 约束清单这套组合，落到 5 个最常见的代码生成模板上。
`,
    code: `// =============================================================
// 第26章示例：提示词框架选择器与 RTCF 模板生成器
// 输入任务描述与场景，自动推荐框架并渲染可复制的 prompt 模板
// =============================================================

// ---- 四个框架的元数据 ----
const FRAMEWORKS = [
  {
    code: "RTCF",
    name: "Role / Task / Context / Format",
    slots: ["Role", "Task", "Context", "Format"],
    fitScenarios: ["codegen", "api", "script"],
    note: "槽位少、覆盖编程主路径，是代码任务的默认选择",
  },
  {
    code: "CRISPE",
    name: "Capacity/Role/Insight/Statement/Personality/Experiment",
    slots: ["Capacity & Role", "Insight", "Statement", "Personality", "Experiment"],
    fitScenarios: ["rootcause", "tuning", "architecture"],
    note: "强制多方案与回退路径，适合不确定根因的复杂任务",
  },
  {
    code: "TAG",
    name: "Task / Action / Goal",
    slots: ["Task", "Action", "Goal"],
    fitScenarios: ["refactor", "migrate", "perf"],
    note: "Goal 必须可验证，适合重构/迁移/性能改造",
  },
  {
    code: "CO-STAR",
    name: "Context/Objective/Style/Tone/Audience/Response",
    slots: ["Context", "Objective", "Style", "Tone", "Audience", "Response"],
    fitScenarios: ["doc", "blog", "email"],
    note: "风格/受众/语气齐全，适合写给人看的内容",
  },
];

// ---- 任务场景到框架的推荐映射 ----
const SCENARIO_TO_FRAMEWORK = {
  codegen: "RTCF",
  api: "RTCF",
  script: "RTCF",
  refactor: "TAG",
  migrate: "TAG",
  perf: "TAG",
  rootcause: "CRISPE",
  tuning: "CRISPE",
  architecture: "CRISPE",
  doc: "CO-STAR",
  blog: "CO-STAR",
  email: "CO-STAR",
};

// ---- 推荐函数：根据场景返回框架 ----
function recommendFramework(scenario) {
  const code = SCENARIO_TO_FRAMEWORK[scenario];
  if (!code) {
    return { code: "RTCF", reason: "未识别场景，默认推荐 RTCF（编程通用）" };
  }
  const fw = FRAMEWORKS.find((f) => f.code === code);
  return {
    code: fw.code,
    reason: \`场景 \${scenario} → 推荐 \${fw.code}：\${fw.note}\`,
  };
}

// ---- RTCF 模板渲染器 ----
function renderRTCF({ role, task, context, format, constraints }) {
  // 把约束清单拼成 bullet 列表
  const constraintLines = (constraints || [])
    .map((c) => "- " + c)
    .join("\\n");

  return \`[Role]
\${role}

[Task]
\${task}

[Context]
\${context}

[Constraints]
\${constraintLines || "- （无额外约束）"}

[Format]
\${format}
\`;
}

// ---- 通用六段式模板渲染器 ----
function renderSixPartTemplate(t) {
  return \`# 角色
你是 \${t.role}。

# 任务
\${t.task}

# 上下文
- 技术栈：\${t.stack}
- 已有代码：\${t.existingCode || "（无）"}
- 约束：\${t.hardConstraints || "（无）"}

# 约束清单
\${(t.constraints || []).map((c) => "- " + c).join("\\n") || "- （无）"}

# 示例（few-shot，可选）
\${t.fewShot || "（无）"}

# 输出格式
\${t.format}

# 思考过程（Chain-of-Thought）
在输出代码前，先用 <thinking>...</thinking> 标签写：
1. 你识别到的核心问题
2. 你考虑过的 2 个方案及取舍
3. 你最终选择的方案与原因
然后再输出代码。
\`;
}

// ---- 演示用例 1：选框架 ----
console.log("========================================");
console.log("  提示词框架推荐演示");
console.log("  生成时间：2026-07-05");
console.log("========================================\\n");

const demoScenarios = ["codegen", "refactor", "tuning", "blog", "unknown_xxx"];
demoScenarios.forEach((s) => {
  const r = recommendFramework(s);
  console.log(\`场景: \${s.padEnd(12)} → \${r.code.padEnd(8)} | \${r.reason}\`);
});

// ---- 演示用例 2：渲染 RTCF 模板 ----
console.log("\\n========================================");
console.log("  RTCF 模板示例：登录接口");
console.log("========================================\\n");

const loginRTCF = renderRTCF({
  role: "你是有 10 年经验的 Node.js 后端工程师，熟悉 Express、JWT、PostgreSQL。",
  task: "实现一个用户登录接口 POST /api/login，校验用户名密码并签发 JWT。",
  context:
    "- 技术栈：Node.js 20 + Express 4 + pg 8\\n" +
    "- 密码用 bcrypt(cost=12) 存储\\n" +
    "- JWT 算法 HS256，密钥从 process.env.JWT_SECRET 读取\\n" +
    "- 已有 db.js 导出 query(text, params) 函数",
  format:
    "- 只输出代码，不要解释\\n" +
    "- 文件路径用 === routes/login.js === 分隔\\n" +
    "- 不要 markdown 围栏\\n" +
    "- 函数签名带 TypeScript 类型",
  constraints: [
    "语言版本：Node.js 20",
    "依赖策略：不引入新依赖",
    "代码风格：Airbnb JavaScript Style",
    "安全要求：参数化查询 + bcrypt 校验 + 不输出密码日志",
  ],
});
console.log(loginRTCF);

// ---- 演示用例 3：渲染六段式模板 ----
console.log("\\n========================================");
console.log("  六段式通用模板示例：两数之和变种");
console.log("========================================\\n");

const twoSumTemplate = renderSixPartTemplate({
  role: "算法竞赛选手，熟悉 TypeScript 与哈希表技巧",
  task: "给定整数数组 nums 和目标值 target，返回所有和等于 target 且不重复的两两组合。要求 O(n) 时间。",
  stack: "TypeScript 5.4 + Node.js 20",
  existingCode: "无",
  hardConstraints: "不允许排序后双指针（要求保留原 O(n) 哈希思路）",
  constraints: [
    "语言版本：TypeScript 5.4",
    "性能要求：O(n) 时间，O(n) 空间",
    "代码风格：函数式，无副作用",
    "测试要求：给出 3 个边界 case 注释",
  ],
  fewShot: "输入：[1,2,3,4,5], 6 → 输出：[[1,5],[2,4]]",
  format:
    "- 先在 <thinking> 中分析\\n" +
    "- 再在 <answer> 中输出 TypeScript 代码\\n" +
    "- 不要 markdown 围栏",
});
console.log(twoSumTemplate);

// ---- 输出框架对比表 ----
console.log("========================================");
console.log("  四框架对比表");
console.log("========================================\\n");
console.log("框架\\t槽位数\\t典型场景\\t\\t说明");
FRAMEWORKS.forEach((f) => {
  console.log(\`\${f.code}\\t\${f.slots.length}\\t\${f.fitScenarios.join("/")}\\t\${f.note}\`);
});
`,
  },
  {
    id: "aiapp-prompt-codegen",
    icon: "⚡",
    group: "提示词工程实战",
    title: "代码生成提示词模板",
    content: `
# 第27章：代码生成提示词模板

## 27.1 五个高频代码生成场景

把第 26 章的 RTCF + 约束清单落到工程里，会发现 80% 的"AI 写代码"需求都收敛到五个模板：

1. **CRUD 接口**：增删改查的后端 endpoint，最常见。
2. **React 组件**：UI 组件，含 props 类型与状态管理。
3. **工具函数**：纯函数库，强调可测试性。
4. **CLI 工具**：命令行脚本，含参数解析与子命令。
5. **数据模型**：ORM schema / 类型定义 / 数据库迁移。

这一章会给每个模板一份**可以直接复制**的完整 prompt，并讲解每个槽位为什么这么写。先讲共用的"约束清单"，因为它是五个模板里最稳定的部分。

## 27.2 约束清单：六维度

代码生成的方差 90% 来自约束没说清。把约束拆成六个维度，每个维度都给一句"必填"的话：

| 维度 | 必填内容 | 不写的后果 |
| --- | --- | --- |
| 语言/版本 | "TypeScript 5.4 + Node.js 20" | 模型用旧语法或新 API，跑不起来 |
| 依赖策略 | "不引入新依赖" / "仅允许 lodash" | 模型装一堆包，体积爆炸 |
| 风格规范 | "Airbnb / Google / PEP 8" | 命名、缩进、引号风格混乱 |
| 性能要求 | "p95 < 50ms / 内存 < 100MB" | 模型给出"能跑但慢"的实现 |
| 安全要求 | "参数化查询 / 输入校验 / 不日志密码" | 留下 SQL 注入、信息泄露 |
| 兼容性 | "保持函数签名不变 / 兼容 Postgres 12+" | 改坏公开 API 或低版本跑不了 |

一份"标准约束清单"模板：

\`\`\`text
# 约束清单
- 语言版本：TypeScript 5.4 + Node.js 20
- 依赖策略：不引入新依赖（已有：express, pg, zod, bcrypt, jsonwebtoken）
- 代码风格：Airbnb JavaScript Style，2 空格缩进，单引号
- 性能要求：单次请求 p95 < 100ms，并发 200
- 安全要求：
  1. 所有 SQL 必须参数化
  2. 用户输入必须用 zod schema 校验
  3. 密码相关字段禁止写入任何日志
  4. 错误信息对外不暴露内部堆栈
- 兼容性：保持现有 routes/index.js 的注册方式不变
\`\`\`

这段约束清单在五个模板里几乎原样复用，只换"语言版本"和"已有依赖"两行。

## 27.3 模板一：CRUD 接口

CRUD 是 AI 代码生成里 ROI 最高的场景——结构高度规整，模型一次就能写对。关键是把"数据模型"和"路由风格"说清楚。

\`\`\`text
[Role]
你是有 8 年经验的 Node.js 后端工程师，熟悉 Express 4 + pg 8 + zod。

[Task]
为"文章（Article）"资源实现完整 CRUD 接口，共 5 个 endpoint：
- GET    /api/articles          列表，支持分页、按 title 模糊搜索
- GET    /api/articles/:id      详情
- POST   /api/articles          创建
- PUT    /api/articles/:id      全量更新
- DELETE /api/articles/:id      删除

[Context]
- 表结构 articles(id BIGSERIAL, title TEXT NOT NULL, content TEXT,
                  author_id BIGINT NOT NULL, created_at TIMESTAMPTZ,
                  updated_at TIMESTAMPTZ)
- 已有 db.js 导出 query(text, params)
- 已有 middleware/auth.js 导出 requireAuth，会挂 req.user
- 已有 utils/errors.js 导出 AppError(status, message)
- 已有 routes/users.js 作为风格参考（见下）

风格参考片段（routes/users.js）：
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id, name FROM users LIMIT 20');
    res.json({ data: rows });
  } catch (e) { next(e); }
});

[Constraints]
- 语言版本：TypeScript 5.4 + Node.js 20
- 依赖策略：不引入新依赖
- 风格：与 routes/users.js 完全一致（try/catch + next(e)）
- 性能：列表查询必须走索引，title 模糊搜索用 ILIKE
- 安全：
  1. 创建/更新必须用 zod 校验 body
  2. author_id 来自 req.user.id，不允许前端传入
  3. 更新/删除必须校验文章属于当前用户
  4. DELETE 用软删除（updated_at + deleted_at 字段）

[Format]
- 输出 3 个文件：
  === routes/articles.js ===
  === schemas/article.ts ===
  === migrations/20260705_articles_soft_delete.sql ===
- 不要 markdown 围栏
- 每个文件顶部用一行注释说明职责
- 不要输出测试代码
\`\`\`

这个 prompt 的几个关键设计：

1. **风格参考片段**比任何文字描述都有效——模型直接照着抄结构。
2. **"author_id 来自 req.user.id，不允许前端传入"**这条约束很关键，否则模型会把 author_id 写进 zod schema 让前端能传。
3. **软删除用 SQL 迁移文件单独输出**，而不是在 JS 里 hack——这是"输出多文件"思路的典型用法。
4. **明确说"不要测试代码"**——CRUD 测试模板第 30 章会单独讲，这里混进来会污染输出。

## 27.4 模板二：React 组件

React 组件生成的难点不在 JSX，而在"props 设计 + 状态管理 + 样式方案"三件事。模板里要把这三件事都说死。

\`\`\`text
[Role]
你是资深 React 前端工程师，熟悉 React 18 + TypeScript + Tailwind CSS。

[Task]
实现一个 <PaginatedTable /> 组件：服务端分页的数据表格，含搜索框与页码切换。

[Context]
- 技术栈：Next.js 14 App Router + React 18 + TypeScript 5.4 + Tailwind 3.4
- 数据获取：用 fetch 调用 /api/items?page=1&size=20&q=xxx
- 项目已有 utils/cn.ts 导出 cn(...) 类名合并函数
- 不使用任何 UI 组件库（不要 MUI / AntD）

[Constraints]
- 语言版本：TypeScript 5.4
- 依赖策略：不引入新依赖
- 风格：函数式组件 + Hooks，禁用 class 组件
- Props 设计：
  1. 必须支持受控与非受控两种模式
  2. 列定义用泛型 <T>，支持自定义 render
  3. 翻页 onChange 回调，参数为 { page, size, q }
- 性能：
  1. 列表项用 React.memo
  2. 搜索框用 useDeferredValue 做防抖
  3. 不在 render 里创建新对象（避免 memo 失效）
- 可访问性：
  1. 表格用 <table>/<thead>/<tbody>，不要 div 模拟
  2. 翻页按钮加 aria-label
  3. 搜索框关联 label

[Format]
- 输出 2 个文件：
  === components/PaginatedTable.tsx ===
  === components/PaginatedTable.types.ts ===
- 不要 markdown 围栏
- 不要 storybook 文件
- 不要测试文件
- 顶部 1 行注释说明设计取舍
\`\`\`

注意"必须支持受控与非受控两种模式"这种约束——它会把组件复杂度推高一档，但如果不写，模型会默认只做受控模式，导致接入时还要返工。这种"未来会改但当下不写就漏"的约束，应该在第一次 prompt 里就写进去。

## 27.5 模板三：工具函数

工具函数生成的关键是"可测试性 + 边界 case"。模板里要把"必须覆盖的 case"列成清单，模型会在函数里直接写注释标记。

\`\`\`text
[Role]
你是开源库作者，擅长写高可测、零依赖的工具函数。

[Task]
实现 formatBytes(bytes: number, options?): string：
把字节数格式化为人类可读字符串，如 1536 → "1.5 KB"。

[Context]
- 已有 utils/formatNumber.ts，可参考其精度处理
- 项目用 vitest 做测试

[Constraints]
- 语言版本：TypeScript 5.4
- 依赖策略：零依赖
- 风格：纯函数，无副作用，无 this
- 行为规范：
  1. 默认精度 1 位小数，但 0 时不显示小数（如 1024 → "1 KB" 而非 "1.0 KB"）
  2. 单位序列：B, KB, MB, GB, TB, PB
  3. 进制：1024（不是 1000）
  4. 负数：返回 "-" + 绝对值的格式化结果
  5. NaN / Infinity：抛 RangeError
  6. 非数字：抛 TypeError
- 性能：O(1)，禁止递归

[Format]
- 输出 1 个文件：
  === utils/formatBytes.ts ===
- 不要 markdown 围栏
- 顶部用 JSDoc 注释，含 @example 2 个
- 函数末尾用注释列出"必须覆盖的测试 case"清单（不写测试代码本身）：
  // cases: 0 → "0 B"; 1024 → "1 KB"; 1536 → "1.5 KB"; -1024 → "-1 KB";
  //        NaN → RangeError; "x" → TypeError; 1.5e15 → "1.4 PB"
\`\`\`

这个模板的"cases 清单"是个高 ROI 技巧——它把测试用例的需求显式化，但又没让模型真去写测试（避免测试代码风格污染主文件）。等下一章让 AI 写测试时，直接把这段 cases 注释贴过去就是现成的测试列表。

## 27.6 模板四：CLI 工具

CLI 工具生成的难点是"参数解析 + 子命令 + 帮助文本"三件套。模板里要把"用什么参数解析库"明示，否则模型会用 commander、yargs、meow 各搞一套。

\`\`\`text
[Role]
你是 Node.js CLI 工具作者，熟悉 commander 12 与 chalk 5。

[Task]
实现一个 CLI 工具 "imgpack"：
把指定目录下的图片批量压缩并输出到目标目录。

子命令：
- imgpack compress <dir> [-o output] [--quality 80]
- imgpack diff <dir1> <dir2>          对比两个目录的图片差异
- imgpack info <file>                  显示图片元信息

[Context]
- 技术栈：Node.js 20 + TypeScript 5.4
- 已选库：commander 12、chalk 5、sharp 0.33
- 包管理器：pnpm
- 入口：src/cli.ts，bin 字段指向 dist/cli.js

[Constraints]
- 语言版本：TypeScript 5.4
- 依赖策略：仅限 commander / chalk / sharp，不引入 fs-extra 等
- 风格：异步函数，async/await，禁用回调
- 错误处理：
  1. 文件不存在 → 退出码 2，红色错误信息
  2. sharp 处理失败 → 退出码 3，输出原图路径
  3. 用户 Ctrl-C → 退出码 130
- 性能：compress 子命令对目录并发 4（不要一次读全部）
- 安全：禁止读取目标目录之外的文件（防路径穿越）

[Format]
- 输出 3 个文件：
  === src/cli.ts ===                入口与 commander 定义
  === src/commands/compress.ts ===
  === src/commands/diff.ts ===
- 不要 markdown 围栏
- 每个子命令导出 async function，cli.ts 仅做注册
- 顶部用注释说明"如何本地调试"：pnpm build && node dist/cli.js compress ./demo
\`\`\`

CLI 模板里有两个约束特别值得强调：**"禁止读取目标目录之外的文件"** 是安全约束，防止路径穿越攻击；**"并发 4"** 是性能约束，避免一次性把磁盘吃满。这两条不写，模型会默认用 glob 全扫 + 串行处理，跑大目录时会卡死。

## 27.7 模板五：数据模型

数据模型生成的核心是"ORM schema + 类型 + 迁移"三件套同步。模板要让模型一次输出三个文件，否则三者会漂移。

\`\`\`text
[Role]
你是熟悉 PostgreSQL + Prisma 5 的后端工程师。

[Task]
为"订单系统"设计数据模型，覆盖以下实体：
- User（用户）
- Product（商品）
- Order（订单，含多个 OrderItem）
- OrderItem（订单项）
- Payment（支付记录，与 Order 1:1）

[Context]
- ORM：Prisma 5（schema.prisma）
- 数据库：PostgreSQL 15
- 已有模型 User（不要重新定义，仅引用）

[Constraints]
- 语言版本：Prisma 5 + PG 15
- 依赖策略：不引入新依赖
- 命名：
  1. Prisma model 用 PascalCase，字段 camelCase
  2. 数据库表用 snake_case
  3. 外键字段命名：{referenced_table}_id
- 索引：
  1. 所有外键加索引
  2. Order.status 加索引（高频过滤）
  3. Payment.paid_at 加索引（按时间统计）
- 软删除：Order 用 deleted_at，其他实体不软删
- 金额：用 Decimal(12,2)，禁止用 float
- 时间：统一 DateTime @db.Timestamptz

[Format]
- 输出 3 个文件：
  === prisma/schema.prisma ===        仅追加新 model，不要改 User
  === src/types/order.ts ===          从 Prisma 生成类型再导出的业务类型
  === prisma/migrations/20260705_orders.sql ===   手写 SQL 迁移
- 不要 markdown 围栏
- 不要输出 seed 数据
- 不要输出 client 生成命令
\`\`\`

数据模型模板的"金额用 Decimal"这条是行业里反复踩坑的教训——如果不写，模型会用 \`Float\`，财务对账时会出现 \`0.1 + 0.2 = 0.30000000000000004\` 这种经典问题。把这种"血泪教训"沉淀进约束清单，是 prompt 工程长期收益最大的部分。

## 27.8 如何让 AI 输出"即贴即用"代码

五个模板都遵循同一套"即贴即用"纪律，总结成 7 条：

1. **Format 段必须包含"不要 markdown 围栏"**。否则模型会把代码包在 \`\`\`js ... \`\`\` 里，复制时还要手动删。
2. **Format 段必须包含"不要解释/总结/寒暄"**。否则代码前后会有一段"希望这对你有帮助"。
3. **多文件用 === path === 分隔**。比"// file: xxx" 更显眼，机器和人都能稳定切分。
4. **新依赖在文件顶部用 // requires: pkg@version 标注**。复制完跑 npm i 之前一眼能看到要装啥。
5. **风格参考片段贴 5-10 行真实代码**。比 1000 字描述都有效。
6. **"不要 X"清单**：不要测试、不要 storybook、不要 seed、不要 migration 命令——把这些"模型爱顺手加的东西"提前禁掉。
7. **复杂任务加 CoT 段**：让模型先想再写，能避免 30% 的"想错了直接动手"问题。

把这 7 条加进任何代码生成 prompt，一次成功率会从大约 50% 提到 80% 以上。剩下 20% 是任务本身的歧义，需要二轮对话解决。

## 27.9 模板复用：把约束清单抽成"项目级常量"

如果你在一个项目里反复用 AI 生成代码，每个 prompt 都重写一遍约束清单很烦。推荐做法是把约束清单抽成一个 Markdown 文件，每次 prompt 时引用：

\`\`\`text
# 项目约束（.ai/constraints.md，所有代码生成 prompt 默认遵守）

- 语言版本：TypeScript 5.4 + Node.js 20
- 依赖策略：默认不引入新依赖，引入需在 prompt 里显式说明理由
- 代码风格：Airbnb + 2 空格 + 单引号 + 末尾分号
- 错误处理：用 utils/errors.ts 的 AppError，禁止 throw new Error()
- 日志：用 utils/logger.ts，禁止 console.log 进生产代码
- 测试：vitest，覆盖率门槛 80%
- 安全：所有 SQL 参数化、所有输入 zod 校验、密码字段不进日志
- 兼容性：必须兼容 PostgreSQL 12+（生产环境版本）
\`\`\`

然后在每次 prompt 的 [Context] 段加一行："项目约束见 .ai/constraints.md，默认遵守"。这样约束清单只维护一份，新 prompt 不用重复写。Claude Projects、Cursor Rules、Continue 的 .continuerc.json 都是这种思路的产品化形态。

## 27.10 小结

五个模板覆盖了日常代码生成的 80%。记住三件事：

1. **约束清单是 ROI 最高的部分**，把六维度说清比换框架重要。
2. **风格参考片段 > 1000 字描述**，每次都贴 5-10 行真实代码。
3. **Format 段的"即贴即用"7 条纪律**，照着做能让一次成功率显著上升。

下一章会讲怎么用提示词做代码审查与重构——和这一章的"从 0 生成"不同，审查是"从已有代码出发"的反向任务，prompt 结构也不一样。
`,
    code: `// =============================================================
// 第27章示例：代码生成 prompt 模板渲染器
// 内置 5 个模板（CRUD/React/工具函数/CLI/数据模型），可按需渲染
// =============================================================

// ---- 共用的"项目约束清单"（可被所有模板引用）----
const PROJECT_CONSTRAINTS = [
  "语言版本：TypeScript 5.4 + Node.js 20",
  "依赖策略：默认不引入新依赖",
  "代码风格：Airbnb + 2 空格 + 单引号 + 末尾分号",
  "错误处理：用 utils/errors.ts 的 AppError，禁止 throw new Error()",
  "日志：用 utils/logger.ts，禁止 console.log 进生产代码",
  "安全：所有 SQL 参数化、所有输入 zod 校验、密码字段不进日志",
  "兼容性：必须兼容 PostgreSQL 12+",
];

// ---- "即贴即用"7 条纪律（自动拼进 Format 段）----
const ZERO_FRICTION_FORMAT = [
  "不要 markdown 围栏",
  "不要解释/总结/寒暄",
  "多文件用 === path === 分隔",
  "新依赖在文件顶部用 // requires: pkg@version 标注",
  "不要输出测试代码",
  "不要输出 storybook / seed / migration 命令",
  "复杂逻辑前用 1-2 行注释说明思路",
];

// ---- 渲染工具：把数组拼成 bullet 列表 ----
function toBullets(arr) {
  return arr.map((x) => "- " + x).join("\\n");
}

// ---- 模板一：CRUD 接口 ----
function renderCRUD(input) {
  return \`[Role]
你是有 8 年经验的 Node.js 后端工程师，熟悉 Express 4 + pg 8 + zod。

[Task]
为"\${input.entity}"资源实现完整 CRUD 接口，共 5 个 endpoint：
- GET    /api/\${input.route}          列表，支持分页与按 \${input.searchField} 模糊搜索
- GET    /api/\${input.route}/:id      详情
- POST   /api/\${input.route}          创建
- PUT    /api/\${input.route}/:id      全量更新
- DELETE /api/\${input.route}/:id      软删除

[Context]
- 表结构：\${input.tableDDL}
- 已有 db.js 导出 query(text, params)
- 已有 middleware/auth.js 导出 requireAuth，挂 req.user
- 已有 utils/errors.js 导出 AppError(status, message)
- 风格参考片段（routes/users.js）：
  router.get('/', async (req, res, next) => {
    try {
      const { rows } = await query('SELECT id, name FROM users LIMIT 20');
      res.json({ data: rows });
    } catch (e) { next(e); }
  });

[Constraints]
\${toBullets(PROJECT_CONSTRAINTS)}
- 风格：与 routes/users.js 一致（try/catch + next(e)）
- 性能：列表查询必须走索引，模糊搜索用 ILIKE
- 安全：
  1. 创建/更新必须用 zod 校验 body
  2. owner 字段来自 req.user，不允许前端传入
  3. 更新/删除必须校验资源属于当前用户
  4. DELETE 用软删除（deleted_at 字段）

[Format]
- 输出 3 个文件：
  === routes/\${input.route}.js ===
  === schemas/\${input.entity.toLowerCase()}.ts ===
  === migrations/\${input.migrationName}.sql ===
\${toBullets(ZERO_FRICTION_FORMAT)}
\`;
}

// ---- 模板二：React 组件 ----
function renderReactComponent(input) {
  return \`[Role]
你是资深 React 前端工程师，熟悉 React 18 + TypeScript + Tailwind CSS。

[Task]
实现一个 <\${input.componentName} /> 组件：\${input.description}

[Context]
- 技术栈：Next.js 14 App Router + React 18 + TypeScript 5.4 + Tailwind 3.4
- 已有 utils/cn.ts 导出 cn(...) 类名合并函数
- 不使用任何 UI 组件库

[Constraints]
\${toBullets(PROJECT_CONSTRAINTS)}
- 风格：函数式组件 + Hooks，禁用 class 组件
- Props 设计：
  1. 支持受控与非受控两种模式
  2. 用泛型 <T> 支持自定义数据类型
  3. 关键回调参数显式声明类型
- 性能：
  1. 列表项用 React.memo
  2. 输入框用 useDeferredValue 防抖
  3. 不在 render 里创建新对象
- 可访问性：用语义化标签 + aria-label

[Format]
- 输出 2 个文件：
  === components/\${input.componentName}.tsx ===
  === components/\${input.componentName}.types.ts ===
\${toBullets(ZERO_FRICTION_FORMAT)}
\`;
}

// ---- 模板三：工具函数 ----
function renderUtilFunction(input) {
  return \`[Role]
你是开源库作者，擅长写高可测、零依赖的工具函数。

[Task]
实现 \${input.signature}：
\${input.description}

[Context]
- 已有 \${input.relatedFile || "（无）"}
- 项目用 vitest 做测试

[Constraints]
\${toBullets(PROJECT_CONSTRAINTS)}
- 依赖策略：零依赖
- 风格：纯函数，无副作用，无 this
- 行为规范：
\${toBullets(input.behaviors)}
- 性能：\${input.complexity || "O(n)"}

[Format]
- 输出 1 个文件：
  === \${input.filePath} ===
\${toBullets(ZERO_FRICTION_FORMAT)}
- 顶部用 JSDoc 注释，含 @example 2 个
- 函数末尾用注释列出"必须覆盖的测试 case"清单（不写测试代码本身）
\`;
}

// ---- 演示：渲染 CRUD 模板 ----
console.log("========================================");
console.log("  代码生成模板演示 1：CRUD 接口");
console.log("========================================\\n");

const crudPrompt = renderCRUD({
  entity: "Article",
  route: "articles",
  searchField: "title",
  tableDDL:
    "articles(id BIGSERIAL, title TEXT NOT NULL, content TEXT, " +
    "author_id BIGINT NOT NULL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)",
  migrationName: "20260705_articles_soft_delete.sql",
});
console.log(crudPrompt);

// ---- 演示：渲染 React 组件模板 ----
console.log("\\n========================================");
console.log("  代码生成模板演示 2：React 组件");
console.log("========================================\\n");

const reactPrompt = renderReactComponent({
  componentName: "PaginatedTable",
  description: "服务端分页的数据表格，含搜索框与页码切换",
});
console.log(reactPrompt);

// ---- 演示：渲染工具函数模板 ----
console.log("\\n========================================");
console.log("  代码生成模板演示 3：工具函数");
console.log("========================================\\n");

const utilPrompt = renderUtilFunction({
  signature: "formatBytes(bytes: number, options?): string",
  description: "把字节数格式化为人类可读字符串，如 1536 → '1.5 KB'",
  relatedFile: "utils/formatNumber.ts",
  behaviors: [
    "默认精度 1 位小数，0 时不显示小数",
    "单位序列：B, KB, MB, GB, TB, PB",
    "进制：1024（不是 1000）",
    "负数：返回 '-' + 绝对值的格式化结果",
    "NaN / Infinity：抛 RangeError",
    "非数字：抛 TypeError",
  ],
  complexity: "O(1)，禁止递归",
  filePath: "utils/formatBytes.ts",
});
console.log(utilPrompt);

// ---- 输出"即贴即用"7 条纪律 ----
console.log("\\n========================================");
console.log("  即贴即用 7 条纪律（自动注入 Format 段）");
console.log("========================================\\n");
ZERO_FRICTION_FORMAT.forEach((rule, i) => {
  console.log(\`\${i + 1}. \${rule}\`);
});
`,
  },
  {
    id: "aiapp-prompt-review",
    icon: "🔍",
    group: "提示词工程实战",
    title: "代码审查与重构模板",
    content: `
# 第28章：代码审查与重构模板

## 28.1 审查与重构是两种任务

代码审查（review）和重构（refactor）经常被混在一起说，但它们是两种任务，prompt 结构也不同：

- **审查**：从已有代码出发，找出问题，**不写新代码**或只写补丁片段。
- **重构**：从已有代码出发，**重写**代码，保持外部行为不变。

混淆两者的典型表现是"让 AI review 一段代码，结果它把整段重写了一遍"——这既消耗 token，又让你看不到它到底改了什么。这一章会给出两套独立的 prompt 模板，并讲清楚什么时候用 refactor、什么时候用 rewrite。

## 28.2 代码审查的四个维度

代码审查的方差主要来自"维度没说清"。把审查拆成四个正交维度，每个维度单独 prompt，效果远好于"帮我 review 这段代码"：

| 维度 | 关键问题 | 典型 AI 输出 |
| --- | --- | --- |
| 安全 | SQL 注入、XSS、越权、信息泄露 | "第 12 行用字符串拼接 SQL，应改参数化查询" |
| 性能 | N+1 查询、不必要的循环、内存泄漏 | "第 45 行在循环里查 DB，是 N+1，应批量查询" |
| 可读性 | 命名、嵌套深度、函数长度 | "doStuff 命名模糊，建议改为 calculateTax" |
| 最佳实践 | 设计模式、错误处理、类型完备性 | "缺少输入校验，建议用 zod schema 包一层" |

四个维度可以单独 prompt，也可以一次性 prompt 让模型按维度输出。下面给出"四维度合一"的审查模板。

## 28.3 模板一：四维度代码审查

\`\`\`text
[Role]
你是有 10 年经验的全栈技术 Lead，审查代码时务实、具体、不卖弄。

[Task]
对下面这段代码做四维度审查：安全 / 性能 / 可读性 / 最佳实践。
按维度分节输出，每个问题独立编号。

[Context]
- 这段代码来自 src/services/order.ts，是订单服务的核心
- 业务场景：电商下单，QPS 约 500，强一致
- 已知约束：必须兼容 PostgreSQL 12，不能引入新依赖

[待审查代码]
\`\`\`typescript
// src/services/order.ts
export async function createOrder(userId: number, items: CartItem[]) {
  const conn = await pool.getConnection();
  let total = 0;
  for (const item of items) {
    const rows = await conn.query(
      'SELECT price FROM products WHERE id = ' + item.productId
    );
    total += rows[0].price * item.qty;
  }
  const orderId = await conn.query(
    'INSERT INTO orders (user_id, total) VALUES (' + userId + ',' + total + ')'
  );
  await conn.query(
    'INSERT INTO order_items (order_id, product_id, qty) VALUES ' +
      items.map(i => '(' + orderId + ',' + i.productId + ',' + i.qty + ')').join(',')
  );
  return orderId;
}
\`\`\`

[审查输出格式]
对每个发现的问题，按以下结构输出：

### <维度名> #<编号>
- 位置：第 X 行
- 问题：<一句话描述>
- 风险：<可能造成的后果>
- 建议：<具体改法，可贴 3-5 行补丁代码>
- 优先级：P0/P1/P2

[审查约束]
- 只在"建议"里贴补丁代码，不要重写整段
- 不要给"理论科普"，每条都要对应到具体行号
- 优先级定义：
  P0 = 安全漏洞/数据丢失/线上必崩
  P1 = 性能严重退化/明显坏味道
  P2 = 风格问题/可读性优化
- 最多列 10 条，按优先级排序，宁缺毋滥
\`\`\`

这个模板的几个关键设计：

1. **"每个问题独立编号"** 让审查结果可追踪——你可以在回复里说"#3 已修，#4 不修因为业务原因"。
2. **"按维度分节"** 避免模型把所有问题混在一起，方便你按维度分配给不同人修。
3. **"最多 10 条"** 是反过度输出的关键——不加这条，模型会列 30 条鸡毛蒜皮的小事，把 P0 淹没。
4. **"位置：第 X 行"** 强制模型对应到具体行号，避免它说"建议改进错误处理"这种无的放矢的话。

模型对上面这段代码的典型输出会包含：P0 SQL 注入（第 7、11、14 行字符串拼接）、P0 事务缺失（创建订单和订单项不在事务里）、P1 N+1 查询（第 6 行循环查 DB）、P1 连接泄漏（没释放 conn）、P2 函数过长。这正是这段代码的真实问题。

## 28.4 模板二：重构模板（refactor）

重构的 prompt 关键是"**保持外部行为不变**"——这句话必须在 prompt 里出现，否则模型会顺手改 API 签名。

\`\`\`text
[Role]
你是熟悉重构手法（提取函数、策略模式等）的资深工程师。

[Task]
对下面这段代码做重构，目标：
1. 单一职责：函数长度 < 30 行
2. 消除重复：相似逻辑提取为内部函数
3. 简化条件：嵌套 < 3 层
4. 命名清晰：函数名动宾结构，变量名名词

[关键约束]
- 保持外部行为 100% 不变（公开 API 签名、返回值、副作用范围）
- 保持现有依赖不变（不引入新库）
- 保持性能不退化（如有性能权衡，在注释里说明）

[Context]
- 代码来自 src/utils/priceCalculator.ts
- 已有测试 src/utils/priceCalculator.test.ts 全绿，重构后必须仍全绿
- 业务背景：电商价格计算，含促销、优惠券、会员折扣

[待重构代码]
\`\`\`typescript
export function calcPrice(order, user, promotions, coupon) {
  let price = 0;
  for (let i = 0; i < order.items.length; i++) {
    price += order.items[i].price * order.items[i].qty;
  }
  if (user.level === 'vip') {
    if (price > 1000) {
      price = price * 0.8;
    } else {
      price = price * 0.9;
    }
  }
  if (promotions && promotions.length > 0) {
    for (let i = 0; i < promotions.length; i++) {
      if (promotions[i].type === 'discount') {
        price = price * (1 - promotions[i].value);
      } else if (promotions[i].type === 'reduce') {
        if (price > promotions[i].threshold) {
          price = price - promotions[i].value;
        }
      }
    }
  }
  if (coupon && coupon.valid && coupon.expireAt > Date.now()) {
    if (coupon.type === 'fixed') {
      price = Math.max(0, price - coupon.value);
    } else if (coupon.type === 'percent') {
      price = price * (1 - coupon.value);
    }
  }
  return Math.round(price * 100) / 100;
}
\`\`\`

[重构输出格式]
- 输出 1 个完整文件 src/utils/priceCalculator.ts
- 顶部用注释列出"重构动作清单"：
  // refactor:
  // 1. 提取 calculateBasePrice(items) → 内部函数
  // 2. 提取 applyVipDiscount(price, user) → 内部函数
  // 3. 提取 applyPromotions(price, promotions) → 内部函数
  // 4. 提取 applyCoupon(price, coupon) → 内部函数
  // 5. calcPrice 改为编排上述 4 个函数
- 不要 markdown 围栏
- 不要输出测试文件
\`\`\`

这个模板的精髓是 **"重构动作清单"**——它强迫模型先列出"打算做哪些重构动作"，再给出重构后的代码。这一方面让模型自己想清楚再动手，另一方面让你能一眼判断"模型的重构方向对不对"，比直接看 200 行重构后代码高效得多。

## 28.5 模板三：refactor vs rewrite 的选择

重构（refactor）和重写（rewrite）不是同一件事，选错会导致灾难：

- **refactor**：保持外部行为，小步改进内部结构。适合"代码能跑、结构烂"的场景。
- **rewrite**：从零重写，可能改 API。适合"代码跑不动、需求也变了"的场景。

判断标准是下面这张决策表：

| 情况 | 选择 | 理由 |
| --- | --- | --- |
| 代码能跑，有测试覆盖 | refactor | 测试是安全网，小步改可验证 |
| 代码能跑，无测试 | 先补测试再 refactor | 无测试的 refactor = 盲改 |
| 代码能跑，但需求已大变 | rewrite | refactor 改不动语义 |
| 代码不能跑，bug 多到修不动 | rewrite | 修比重写还慢 |
| 代码规模 > 1000 行 | 分块 refactor | 一次性 rewrite 风险太高 |

对应的 prompt 选择：

- **refactor** 用上一节的模板（"保持外部行为不变"）。
- **rewrite** 用第 27 章的代码生成模板，把旧代码作为 [Context] 里的"参考实现"。

rewrite 模板的关键差异是：**明确说"可以改 API"**，并在 Context 里说明"旧代码的哪些行为必须保留、哪些可以改"。否则模型可能把不该改的也改了。

## 28.6 模板四：让 AI 输出"前后对比"

审查和重构的输出都建议带"前后对比"，方便人快速判断改动是否合理。最有效的格式是 **diff 风格**，而不是"旧代码 + 新代码"两段独立代码：

\`\`\`text
[输出格式补充要求]
对每个重构动作，输出一段 diff：

--- before (src/utils/priceCalculator.ts:5-12)
+++ after
@@
-  let price = 0;
-  for (let i = 0; i < order.items.length; i++) {
-    price += order.items[i].price * order.items[i].qty;
-  }
+  const price = calculateBasePrice(order.items);

// 新增内部函数
function calculateBasePrice(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

理由：原循环 4 行 → 1 行调用 + 1 行工具函数；reduce 比 for 循环更声明式；
函数名 calculateBasePrice 直接表达意图。
\`\`\`

diff 风格的优势：

1. **删/增一目了然**——带 \`-\` 的是删的，带 \`+\` 的是加的，比读两段代码快。
2. **理由紧跟改动**——每段 diff 后面跟"理由：..."，让审查者能立刻判断这个改动合不合理。
3. **可机器解析**——diff 格式稳定，可以写脚本批量统计"AI 改了多少行"。

如果你的工具链支持，可以进一步要求模型输出 unified diff（git diff 风格），这样可以直接 \`git apply\`。但对人工审查，上面这种简化 diff 更友好。

## 28.7 审查清单模板（可复用）

把审查的常见问题抽成一份"审查清单"，每次 review 时引用。这份清单可以随项目积累，越用越准：

\`\`\`text
# 代码审查清单（.ai/review-checklist.md）

## 安全
- [ ] 所有 SQL 是否参数化？是否有字符串拼接？
- [ ] 用户输入是否经过 zod / class-validator 校验？
- [ ] 鉴权是否覆盖到每个 endpoint？是否有越权风险？
- [ ] 错误信息是否泄露内部堆栈 / 表名 / 用户ID？
- [ ] 密码、token、密钥是否避免写入日志？
- [ ] 文件上传是否校验类型、大小、路径？

## 性能
- [ ] 循环内是否有 DB / Redis 调用？（N+1）
- [ ] 列表查询是否有分页？是否有索引？
- [ ] 大对象是否在请求作用域内长期持有？
- [ ] 异步任务是否有限流 / 队列？
- [ ] 缓存 key 是否合理？是否会击穿？

## 可读性
- [ ] 函数长度是否 < 50 行？嵌套是否 < 3 层？
- [ ] 命名是否动宾结构？是否避免 temp / data / info 这种空名？
- [ ] 注释是否解释"为什么"而不是"做什么"？
- [ ] 复杂条件是否提取为命名变量？

## 最佳实践
- [ ] 错误是否用统一 AppError？是否传到 next(e)？
- [ ] 异步是否用 async/await 而非回调？
- [ ] 类型是否完备？是否禁用 any？
- [ ] 是否有单元测试？覆盖率是否 > 80%？
\`\`\`

在审查 prompt 里加一行 "对照 .ai/review-checklist.md 检查"，模型会按清单逐项过，比让它"自由发挥"稳定得多。

## 28.8 重构优先级矩阵

重构动作不是平等的，有 ROI 高低之分。下面这张矩阵是工程上反复验证的优先级排序：

| 优先级 | 重构动作 | ROI 理由 |
| --- | --- | --- |
| P0 | 修 SQL 注入 / 越权 | 不修会出事，修起来快 |
| P0 | 补事务边界 | 数据不一致是线上事故 |
| P1 | 消除 N+1 查询 | 性能提升立竿见影 |
| P1 | 提取重复逻辑为函数 | 改一处影响多处 |
| P1 | 拆超长函数 | 提升可读性 + 可测试性 |
| P2 | 改善命名 | 风险低、收益小 |
| P2 | 引入设计模式 | 收益看场景，可能过度设计 |
| P3 | 风格统一（引号、缩进） | 交给 prettier / eslint 自动做 |

在重构 prompt 里把这张矩阵作为 [Constraints] 注入："重构优先级遵循 .ai/refactor-priority.md，先做 P0 再做 P1，P2/P3 不做"。这样模型不会"为了用策略模式而用策略模式"，把简单代码改复杂。

## 28.9 模板五：审查 + 重构的"两轮法"

实际工程里，审查和重构经常配合使用，推荐"两轮法"：

**第一轮：审查（不写代码）**

\`\`\`text
[Role] 资深技术 Lead
[Task] 对 src/services/order.ts 做四维度审查，只输出问题清单，不写新代码
[Format] 按维度分节，每条带"位置/问题/风险/建议/优先级"
\`\`\`

**第二轮：按审查结果重构**

\`\`\`text
[Role] 资深工程师
[Task] 根据以下审查结果，对 src/services/order.ts 做重构

[审查结果]
（贴第一轮的输出）

[约束]
- 只处理 P0 和 P1，P2/P3 不动
- 保持外部行为不变
- 每个重构动作输出 diff + 理由

[Format] 按重构动作清单 + 完整新文件
\`\`\`

两轮法的好处是：**第一轮让你看清问题全貌再决定改什么**，避免"边审查边改"导致改了一半发现方向错了。代价是两次 prompt 的 token 成本，但对 100 行以上的代码，这点成本远低于"改错方向返工"的损失。

## 28.10 小结

1. **审查与重构是两种任务**，prompt 结构不同，不要混。
2. **审查按四维度分节**，每条问题带位置/风险/建议/优先级，最多 10 条。
3. **重构保持外部行为不变**，要求模型先列"重构动作清单"再动手。
4. **refactor vs rewrite 看测试覆盖与需求变化**，无测试就先补测试。
5. **输出 diff + 理由**比"旧代码 + 新代码"两段更利于人审。
6. **审查清单和重构优先级矩阵**是项目级资产，越积累越值钱。

下一章讲怎么用提示词做 Bug 修复与调试——这是和审查/重构都不同的第三种任务，核心是"让模型当侦探而不是当重写机器"。
`,
    code: `// =============================================================
// 第28章示例：代码审查与重构 prompt 生成器
// 包含：四维度审查清单、重构优先级矩阵、diff 格式化器
// =============================================================

// ---- 审查的四个维度 ----
const REVIEW_DIMENSIONS = [
  {
    name: "安全",
    questions: [
      "SQL 是否参数化？是否有字符串拼接？",
      "用户输入是否经过 zod / class-validator 校验？",
      "鉴权是否覆盖到每个 endpoint？是否有越权风险？",
      "错误信息是否泄露内部堆栈 / 表名 / 用户ID？",
      "密码、token、密钥是否避免写入日志？",
      "文件上传是否校验类型、大小、路径？",
    ],
  },
  {
    name: "性能",
    questions: [
      "循环内是否有 DB / Redis 调用？（N+1）",
      "列表查询是否有分页？是否有索引？",
      "大对象是否在请求作用域内长期持有？",
      "异步任务是否有限流 / 队列？",
      "缓存 key 是否合理？是否会击穿？",
    ],
  },
  {
    name: "可读性",
    questions: [
      "函数长度是否 < 50 行？嵌套是否 < 3 层？",
      "命名是否动宾结构？是否避免 temp / data / info？",
      "注释是否解释'为什么'而不是'做什么'？",
      "复杂条件是否提取为命名变量？",
    ],
  },
  {
    name: "最佳实践",
    questions: [
      "错误是否用统一 AppError？是否传到 next(e)？",
      "异步是否用 async/await 而非回调？",
      "类型是否完备？是否禁用 any？",
      "是否有单元测试？覆盖率是否 > 80%？",
    ],
  },
];

// ---- 重构优先级矩阵 ----
const REFACTOR_PRIORITY = [
  {
    priority: "P0",
    actions: ["修 SQL 注入 / 越权", "补事务边界"],
    reason: "不修会出事，修起来快",
  },
  {
    priority: "P1",
    actions: ["消除 N+1 查询", "提取重复逻辑为函数", "拆超长函数"],
    reason: "性能/可读性提升立竿见影",
  },
  {
    priority: "P2",
    actions: ["改善命名", "引入设计模式"],
    reason: "收益看场景，可能过度设计",
  },
  {
    priority: "P3",
    actions: ["风格统一（引号、缩进）"],
    reason: "交给 prettier / eslint 自动做",
  },
];

// ---- 渲染审查 prompt ----
function renderReviewPrompt(codePath, code, businessContext) {
  return \`[Role]
你是有 10 年经验的全栈技术 Lead，审查代码时务实、具体、不卖弄。

[Task]
对下面这段代码做四维度审查：安全 / 性能 / 可读性 / 最佳实践。
按维度分节输出，每个问题独立编号。

[Context]
- 代码来自 \${codePath}
- 业务场景：\${businessContext}
- 已知约束：必须兼容 PostgreSQL 12，不能引入新依赖

[待审查代码]
\${code}

[审查输出格式]
对每个发现的问题，按以下结构输出：

### <维度名> #<编号>
- 位置：第 X 行
- 问题：<一句话描述>
- 风险：<可能造成的后果>
- 建议：<具体改法，可贴 3-5 行补丁代码>
- 优先级：P0/P1/P2

[审查约束]
- 只在"建议"里贴补丁代码，不要重写整段
- 每条都要对应到具体行号
- 优先级：P0=安全/数据丢失/必崩；P1=性能严重退化/坏味道；P2=风格
- 最多列 10 条，按优先级排序，宁缺毋滥
\`;
}

// ---- 渲染重构 prompt ----
function renderRefactorPrompt(codePath, code, refactorGoals) {
  return \`[Role]
你是熟悉重构手法（提取函数、策略模式等）的资深工程师。

[Task]
对下面这段代码做重构，目标：
\${refactorGoals.map((g, i) => \`\${i + 1}. \${g}\`).join("\\n")}

[关键约束]
- 保持外部行为 100% 不变（公开 API 签名、返回值、副作用范围）
- 保持现有依赖不变（不引入新库）
- 保持性能不退化（如有权衡，在注释里说明）

[Context]
- 代码来自 \${codePath}
- 重构优先级遵循 .ai/refactor-priority.md，只做 P0/P1，P2/P3 不动

[待重构代码]
\${code}

[重构输出格式]
- 输出 1 个完整文件 \${codePath}
- 顶部用注释列出"重构动作清单"：
  // refactor:
  // 1. 提取 xxx → 内部函数
  // 2. ...
- 对每个重构动作，输出一段 diff + 理由：
  --- before (\${codePath}:X-Y)
  +++ after
  @@
  - 旧代码
  + 新代码
  理由：<一句话>
- 不要 markdown 围栏
- 不要输出测试文件
\`;
}

// ---- 演示：渲染审查 prompt ----
console.log("========================================");
console.log("  代码审查 prompt 演示");
console.log("========================================\\n");

const sampleCode = \`export async function createOrder(userId, items) {
  const conn = await pool.getConnection();
  let total = 0;
  for (const item of items) {
    const rows = await conn.query(
      'SELECT price FROM products WHERE id = ' + item.productId
    );
    total += rows[0].price * item.qty;
  }
  const orderId = await conn.query(
    'INSERT INTO orders (user_id, total) VALUES (' + userId + ',' + total + ')'
  );
  return orderId;
}\`;

console.log(renderReviewPrompt(
  "src/services/order.ts",
  sampleCode,
  "电商下单，QPS 约 500，强一致"
));

// ---- 演示：渲染重构 prompt ----
console.log("\\n========================================");
console.log("  重构 prompt 演示");
console.log("========================================\\n");

console.log(renderRefactorPrompt(
  "src/utils/priceCalculator.ts",
  "export function calcPrice(order, user, promotions, coupon) { /* ... */ }",
  [
    "单一职责：函数长度 < 30 行",
    "消除重复：相似逻辑提取为内部函数",
    "简化条件：嵌套 < 3 层",
    "命名清晰：函数名动宾结构",
  ]
));

// ---- 输出审查清单（按维度）----
console.log("\\n========================================");
console.log("  代码审查清单（项目级资产）");
console.log("========================================\\n");

REVIEW_DIMENSIONS.forEach((dim) => {
  console.log(\`## \${dim.name}\`);
  dim.questions.forEach((q) => {
    console.log(\`  - [ ] \${q}\`);
  });
  console.log("");
});

// ---- 输出重构优先级矩阵 ----
console.log("========================================");
console.log("  重构优先级矩阵");
console.log("========================================\\n");
console.log("优先级\\t动作\\t\\t\\t理由");
REFACTOR_PRIORITY.forEach((p) => {
  console.log(\`\${p.priority}\\t\${p.actions.join("; ")}\\t\${p.reason}\`);
});
`,
  },
  {
    id: "aiapp-prompt-debug",
    icon: "🐛",
    group: "提示词工程实战",
    title: "Bug 修复与调试模板",
    content: `
# 第29章：Bug 修复与调试模板

## 29.1 调试是"侦探任务"而不是"重写任务"

Bug 修复和代码生成、重构都不一样。代码生成是"从 0 到 1"，重构是"从 1 到 1（结构变好）"，**调试是"从 1（坏）到 1（好）"，核心是先找根因再动手**。

新人最常犯的错误是把 bug 当成代码生成任务——直接把报错贴给 AI，让它"修一下"。AI 会很乐意重写一整段，结果经常是：原来的 bug 没了，新的 bug 来了。原因是它没找到根因，只是把"看起来有问题"的部分换了个写法。

正确的调试 prompt 结构有五个槽位：**错误现象 / 复现步骤 / 相关代码 / 已尝试方案 / 期望行为**。下面逐个讲。

## 29.2 调试 prompt 的五槽位结构

\`\`\`text
[Role]
你是有 10 年经验的调试专家，擅长根因分析，不靠"重写"掩盖问题。

[Task]
帮我分析并修复下面的 bug。先给根因假设，再给最小修改方案。

[1. 错误现象]
- 报错信息：TypeError: Cannot read properties of undefined (reading 'map')
- 报错位置：src/components/UserList.tsx:42
- 出现频率：约 30% 的请求会触发，本地难复现
- 影响：用户列表页白屏

[2. 复现步骤]
1. 登录普通用户账号（非 admin）
2. 进入 /users 页面
3. 等待 2-3 秒，约 30% 概率白屏
4. 刷新页面通常能恢复

[3. 相关代码]
// src/components/UserList.tsx
import { useEffect, useState } from 'react';

export function UserList() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setData(d));
  }, []);
  return (
    <ul>
      {data.items.map(u => <li key={u.id}>{u.name}</li>)}  // 第 42 行
    </ul>
  );
}

// src/pages/api/users.ts（后端）
export default async function handler(req, res) {
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'forbidden' });  // 非管理员返回错误
    return;
  }
  const users = await db.user.findMany();
  res.json({ items: users });
}

[4. 已尝试方案]
- 在本地用 admin 账号测试，无法复现
- 在本地用普通账号测试，能看到 403 但不会白屏（因为本地 fetch 不抛错）
- 怀疑是 race condition，但没找到证据

[5. 期望行为]
- 非管理员访问 /users 时，前端应显示"无权限"提示，而不是白屏
- 加载中应显示 loading，而不是 undefined.map 崩溃
- 后端 403 时前端要能识别错误响应

[输出格式]
1. 根因假设（最多 3 个，按可能性排序，每个带"如何验证"）
2. 最可能的根因 + 验证方法
3. 最小修改方案（diff 风格，只改必要部分）
4. 修复后的回归测试建议（3 个 case，不写测试代码）
\`\`\`

这个 prompt 的关键设计：

1. **"先给根因假设再给方案"** 强制模型当侦探，而不是直接重写。
2. **"已尝试方案"** 避免模型让你做你已经做过的事——你本地用 admin 试过了，它就不会再让你"用 admin 试试"。
3. **"最小修改方案"** 强调 diff 风格，避免整段重写引入新问题。
4. **"回归测试建议"** 让修复有验收标准，不靠"看着没崩"就发布。

模型对上面这段代码的典型分析会是：根因是 fetch 拿到 403 时仍然调用了 .json() 解析了 {error: 'forbidden'}，赋给 data 后 data.items 是 undefined，触发白屏。本地不崩是因为本地某些环境下 fetch 对 4xx 也会 resolve（取决于实现）。修复点是处理非 2xx 响应 + 给 data 加初始值 + 区分错误态。

## 29.3 模板一：根因分析提示词

有时候你不需要 AI 立刻给修复方案，而是要它先帮你"列假设、排优先级、给验证方法"。这种"纯分析"的 prompt 模板：

\`\`\`text
[Role]
你是熟悉分布式系统、浏览器运行时、数据库引擎的资深 SRE。

[Task]
对下面的 bug 做根因分析，不要给修复方案，只给假设与验证方法。

[现象]
- 服务：order-service
- 症状：偶发 502，约 0.3% 请求触发，无规律
- 持续时间：最近 7 天开始出现，期间无发布
- 影响：少量用户下单失败，重试通常成功

[环境]
- 部署：k8s，3 副本，每副本 2C/4G
- 依赖：PostgreSQL 14（主从）、Redis 7、RabbitMQ
- 入口：nginx ingress → order-service（Node.js 20）

[监控数据]
- CPU/内存：正常，无突增
- DB 连接数：峰值 80/100，未到上限
- 慢查询：无明显新增
- order-service 日志：偶发 "ETIMEDOUT" 连 DB，时间与 502 吻合
- DB 日志：偶发 "connection reset by peer"

[已排查]
- 网络抖动：跨可用区延迟正常
- DB 负载：CPU 30%，无锁等待
- 服务重启：无 OOM，无重启记录

[输出格式]
按以下结构输出 3-5 个假设，按可能性从高到低排序：

## 假设 N：<一句话标题>
- 可能性：高/中/低
- 机理：<为什么会触发这个现象>
- 验证方法：<具体怎么验证，可观测的指标或实验>
- 排除方法：<如果验证不通过，怎么排除这个假设>

最后给一段"建议排查顺序"：先做哪个验证，再做哪个。
\`\`\`

这种纯分析模板的价值是：**强迫模型穷举假设，而不是锚定在第一个想到的解释上**。新人调试常犯的错就是"锚定偏差"——想到一个解释就去验证，忽略了更可能的其他解释。让 AI 先列 3-5 个假设，能显著降低这种偏差。

## 29.4 模板二：让 AI 解释报错堆栈

复杂堆栈（尤其是异步、Promise、事件循环相关的）人眼看很累。让 AI 解释堆栈时，关键是 **"逐帧解释 + 指出关键帧"**：

\`\`\`text
[Role]
你是熟悉 Node.js 事件循环、V8 异步栈追踪的工程师。

[Task]
解释下面这段报错堆栈，按帧逐行说明，并指出"真正的出错点"。

[报错堆栈]
Error: Connection terminated
    at Connection.<anonymous> (/app/node_modules/pg/lib/client.js:132:36)
    at Object.onceWrapper (node:events:633:26)
    at Connection.emit (node:events:513:28)
    at Socket.<anonymous> (/app/node_modules/pg/lib/connection.js:58:14)
    at Socket.emit (node:events:513:28)
    at TCP.<anonymous> (node:net:345:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async query (/app/src/db.ts:23:5)
    at async getUserById (/app/src/services/user.ts:11:5)
    at async handler (/app/src/routes/user.ts:7:5)

[业务上下文]
- 这是 /api/users/:id 接口偶发的报错
- 报错时数据库本身正常
- 频率：约 0.1% 请求

[输出格式]
1. 一句话结论：这是什么类型的错误？
2. 逐帧解释：每帧用 1-2 句话说"这帧在做什么"
3. 关键帧：哪一帧是"真正的出错点"，为什么
4. 业务层影响：哪一层最该处理这个错误？为什么
5. 修复方向：3 个不同方向的修复思路（不写完整代码）
\`\`\`

这种模板的精髓是 **"逐帧解释 + 关键帧 + 业务层影响"**。模型会指出 pg 库的 Connection terminated 是 TCP 被对端关闭导致的，真正的出错点不在 pg 内部栈帧，而在业务层的 src/db.ts:23 调用 query 时连接已被回收——所以应该在 db.ts 加重试或连接池预热，而不是去改 pg 库。

## 29.5 模板三：定位性能瓶颈

性能问题的 prompt 关键是 **"提供量化数据，让模型基于数据推断"**。空口说"很慢"AI 只能给模板答案。

\`\`\`text
[Role]
你是熟悉 Node.js 性能调优、PostgreSQL EXPLAIN 分析的工程师。

[Task]
帮我定位下面接口的性能瓶颈，并给出 3 个不同方向的优化方案。

[接口]
GET /api/orders?page=1&size=20
- 当前 p95：2.8s
- 目标 p95：< 200ms

[量化数据]
1. 服务器端耗时分解（APM 拆分）：
   - DB 查询：2.3s（占比 82%）
   - 业务逻辑：0.3s
   - 序列化：0.2s
2. DB 慢查询日志：
   SELECT o.*, u.name, p.name AS product_name
   FROM orders o
   LEFT JOIN users u ON u.id = o.user_id
   LEFT JOIN order_items oi ON oi.order_id = o.id
   LEFT JOIN products p ON p.id = oi.product_id
   WHERE o.status = 'paid'
   ORDER BY o.created_at DESC
   LIMIT 20 OFFSET 0;

   EXPLAIN ANALYZE 输出：
   Limit (cost=12345.67..12345.87 rows=20 width=200) (actual time=2301.4..2301.6 rows=20)
     -> Sort (cost=12345.67..12500.00 rows=100000 width=200) (actual time=2300.1..2300.5 rows=20)
          Sort Key: o.created_at DESC
          Sort Method: external merge  Disk: 25600kB
          -> Hash Join (cost=...) (actual time=...)
               -> Seq Scan on orders o (...)
               -> Hash Join (...)
                    -> Seq Scan on order_items oi (...)
                    -> ...

3. 表数据量：
   - orders: 2000 万行
   - order_items: 8000 万行
   - users: 100 万行
   - products: 10 万行

4. 现有索引：
   - orders: PK(id), INDEX(status, created_at)
   - order_items: PK(id), INDEX(order_id)

[输出格式]
1. 瓶颈定位（基于 EXPLAIN）：
   - 最耗时的算子是哪个？为什么？
   - 数据量与索引是否匹配？
2. 3 个优化方案（不同方向）：
   方案 A（索引层）：加什么索引？预期收益？风险？
   方案 B（查询层）：改写 SQL？预期收益？
   方案 C（架构层）：分页策略改 cursor？反范式？
3. 推荐排序与理由
\`\`\`

模型基于 EXPLAIN 输出会指出"external merge 用了磁盘排序 25MB，说明 work_mem 不够 + 排序行数太多（10 万行而不是 20 行）"，根因是 JOIN 在 LIMIT 之前发生，先 JOIN 出 10 万行再排序再 LIMIT。优化方向是子查询先 LIMIT 拿到 20 个 order id，再 JOIN 其他表。这是经典的"N+1 反过来"问题，模型基于数据能给得很准。

## 29.6 增量调试法（5 步法）

复杂 bug 不能"一把修好"，需要增量逼近。增量调试法的 5 步：

1. **最小复现**：把 bug 缩到最小的输入/步骤。
2. **二分定位**：在代码里二分，找出哪一段引入了问题。
3. **假设验证**：写一个最小测试验证假设。
4. **最小修复**：只改触发根因的那一行/那一段。
5. **回归测试**：把 bug case 固化为测试，防止复发。

对应的 prompt 模板：

\`\`\`text
[Role]
你是熟悉增量调试法的工程师，不靠"重写"修 bug。

[Task]
用增量调试法帮我定位下面的 bug。不要立刻给修复方案，先陪我走完 5 步。

[当前状态]
- bug：用户上传头像后，约 5% 概率头像显示为黑屏
- 已知：上传走 /api/upload，处理后存 S3，前端从 CDN 取
- 已尝试：本地连续上传 100 次未复现

[请按以下步骤与我协作]
1. 最小复现：问我 3 个问题，帮我找到稳定的复现路径
2. 二分定位：根据我的回答，给出"在哪两个环节之间二分"的建议
3. 假设验证：根据二分结果，提出 1 个根因假设 + 1 个最小验证测试
4. 最小修复：等验证通过后再给修复方案（只改必要行）
5. 回归测试：给出 3 个 case，把 bug 固化为测试

[输出格式]
现在只输出"步骤 1：3 个复现问题"。等我的回答后再进入步骤 2。
\`\`\`

这个模板的精髓是 **"一步一步来，每步等用户回答"**——避免 AI 一口气把 5 步都讲完，结果全是不基于真实数据的猜测。把 AI 当成"陪练侦探"而不是"答案机器"，是调试场景用 AI 的最佳姿态。

## 29.7 与 AI 配合的二分查找法

二分查找是调试的核武器。和 AI 配合时，可以让它帮你"决定二分点"：

\`\`\`text
[Role]
你是熟悉 git bisect 与代码二分法的工程师。

[Task]
帮我设计一个二分查找方案，定位下面的回归 bug。

[bug]
- 现象：登录接口 p95 从 50ms 退化到 800ms
- 引入时间：最近 2 周内
- 影响版本：v1.8.0 起，v1.7.5 正常

[仓库信息]
- 当前 HEAD：main 分支
- v1.7.5 到 v1.8.0 之间有 87 个 commit
- 已知：期间有大重构（DB 层从 callback 改 async/await）

[请输出]
1. 二分方案：
   - 起点与终点 commit
   - 每次二分的"判断标准"（怎么判断这个 commit 是好是坏）
   - 预计要跑几次二分
2. 加速策略：
   - 是否能用 commit message 过滤掉明显无关的 commit？
   - 是否能在测试环境批量跑多个 commit？
3. 注意事项：
   - 数据库 schema 变更怎么处理？
   - 配置变更怎么处理？
\`\`\`

模型会建议从 v1.7.5（好）和 v1.8.0（坏）开始，二分点取中间 commit，判断标准是"跑一遍登录压测看 p95"。87 个 commit 大约 7 次二分就能定位到具体 commit。它还会提醒你：DB schema 变更的 commit 不能直接 checkout 跑（要先跑 migration），配置变更的 commit 要保证环境变量对得上——这些是人容易忘的细节。

## 29.8 调试 prompt 的常见反模式

下面几种写法是调试 prompt 的反面教材，要避免：

**反模式 1：把整个报错贴过去问"修一下"**

\`\`\`text
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:42)
    at renderWithHooks (...)
    ...
帮我修一下
\`\`\`

问题：没有复现步骤、没有相关代码、没有期望行为。模型只能猜，给的修复要么是"加个可选链 ?. 凑合"，要么是"重写整个组件"——两种都没解决根因。

**反模式 2：让 AI "重写这段代码避免报错"**

\`\`\`text
这段代码报 TypeError，帮我重写避免报错。
\`\`\`

问题：这是把 bug 当代码生成任务。AI 会写一段新代码，原 bug 没了（因为代码全换了），但新代码可能有新 bug。正确做法是"找根因 + 最小修复"。

**反模式 3：把所有日志一股脑贴过去**

\`\`\`text
[贴 5000 行日志] 帮我找问题
\`\`\`

问题：上下文太长，模型会被无关日志淹没，反而找不到关键信息。正确做法是先自己用 grep 过滤出"报错时间窗口内的关键日志"，再贴给 AI。

**反模式 4：不给"已尝试方案"**

\`\`\`text
现象：502 偶发。帮我排查。
\`\`\`

问题：模型会让你做一堆你已经做过的事（"检查 CPU""检查内存""看 DB 连接数"）。给"已尝试方案"能让模型直接跳过这些，给新的排查方向。

## 29.9 调试 prompt 的元原则

把这一章总结成一句话：**让 AI 当侦探，而不是当重写机器**。具体落到 prompt 上是四条：

1. **五槽位结构**：错误现象 / 复现步骤 / 相关代码 / 已尝试方案 / 期望行为。
2. **先分析后修复**：要求模型先给"根因假设 + 验证方法"，再给"最小修复"。
3. **最小修改**：要求 diff 风格，禁止整段重写。
4. **回归测试**：把 bug case 固化为测试，防止复发。

下一章讲怎么用 AI 生成文档与测试——这是和代码生成、审查、调试都不同的第四种任务，核心是"让 AI 当文档员与测试员"。
`,
    code: `// =============================================================
// 第29章示例：调试 prompt 生成器与根因分析模板
// 包含：五槽位调试模板、增量调试 5 步法、二分查找方案生成器
// =============================================================

// ---- 调试 prompt 的五槽位 ----
const DEBUG_SLOTS = [
  { key: "symptom", label: "1. 错误现象", desc: "报错信息、位置、频率、影响" },
  { key: "reproduce", label: "2. 复现步骤", desc: "稳定的复现路径，按步骤编号" },
  { key: "code", label: "3. 相关代码", desc: "贴报错位置的代码与上下游调用" },
  { key: "tried", label: "4. 已尝试方案", desc: "列出已经排查过的方向，避免重复" },
  { key: "expected", label: "5. 期望行为", desc: "正常情况下应该是什么样" },
];

// ---- 渲染五槽位调试 prompt ----
function renderDebugPrompt(input) {
  const sections = DEBUG_SLOTS.map((slot) => {
    const val = input[slot.key] || "（待填写）";
    return \`[\${slot.label}]
\${val}\`;
  }).join("\\n\\n");

  return \`[Role]
你是有 10 年经验的调试专家，擅长根因分析，不靠"重写"掩盖问题。

[Task]
帮我分析并修复下面的 bug。先给根因假设，再给最小修改方案。

\${sections}

[输出格式]
1. 根因假设（最多 3 个，按可能性排序，每个带"如何验证"）
2. 最可能的根因 + 验证方法
3. 最小修改方案（diff 风格，只改必要部分）
4. 修复后的回归测试建议（3 个 case，不写测试代码）
\`;
}

// ---- 根因分析 prompt（纯分析，不修复）----
function renderRootCausePrompt(input) {
  return \`[Role]
你是熟悉分布式系统、浏览器运行时、数据库引擎的资深 SRE。

[Task]
对下面的 bug 做根因分析，不要给修复方案，只给假设与验证方法。

[现象]
- 服务：\${input.service}
- 症状：\${input.symptom}
- 持续时间：\${input.duration}
- 影响：\${input.impact}

[环境]
\${input.env}

[监控数据]
\${input.metrics}

[已排查]
\${input.checked}

[输出格式]
按以下结构输出 3-5 个假设，按可能性从高到低排序：

## 假设 N：<一句话标题>
- 可能性：高/中/低
- 机理：<为什么会触发这个现象>
- 验证方法：<具体怎么验证，可观测的指标或实验>
- 排除方法：<如果验证不通过，怎么排除这个假设>

最后给一段"建议排查顺序"：先做哪个验证，再做哪个。
\`;
}

// ---- 增量调试 5 步法 ----
const INCREMENTAL_DEBUG_STEPS = [
  {
    step: 1,
    name: "最小复现",
    action: "把 bug 缩到最小的输入/步骤",
    output: "3 个复现问题，帮用户找到稳定复现路径",
  },
  {
    step: 2,
    name: "二分定位",
    action: "在代码里二分，找出哪一段引入了问题",
    output: "在哪两个环节之间二分的建议",
  },
  {
    step: 3,
    name: "假设验证",
    action: "写一个最小测试验证假设",
    output: "1 个根因假设 + 1 个最小验证测试",
  },
  {
    step: 4,
    name: "最小修复",
    action: "只改触发根因的那一行/那一段",
    output: "diff 风格的最小修复方案",
  },
  {
    step: 5,
    name: "回归测试",
    action: "把 bug case 固化为测试，防止复发",
    output: "3 个回归测试 case",
  },
];

function renderIncrementalDebugPrompt(bugDescription) {
  return \`[Role]
你是熟悉增量调试法的工程师，不靠"重写"修 bug。

[Task]
用增量调试法帮我定位下面的 bug。不要立刻给修复方案，先陪我走完 5 步。

[当前状态]
\${bugDescription}

[请按以下步骤与我协作]
\${INCREMENTAL_DEBUG_STEPS.map((s) => \`\${s.step}. \${s.name}：\${s.action}（输出：\${s.output}）\`).join("\\n")}

[输出格式]
现在只输出"步骤 1：3 个复现问题"。等我的回答后再进入步骤 2。
\`;
}

// ---- 二分查找方案生成器 ----
function renderBisectPrompt(input) {
  return \`[Role]
你是熟悉 git bisect 与代码二分法的工程师。

[Task]
帮我设计一个二分查找方案，定位下面的回归 bug。

[bug]
- 现象：\${input.symptom}
- 引入时间：\${input.duration}
- 影响版本：\${input.badVersion} 起，\${input.goodVersion} 正常

[仓库信息]
- 当前 HEAD：\${input.branch} 分支
- \${input.goodVersion} 到 \${input.badVersion} 之间有 \${input.commitCount} 个 commit
- 已知：\${input.context}

[请输出]
1. 二分方案：
   - 起点与终点 commit
   - 每次二分的"判断标准"（怎么判断这个 commit 是好是坏）
   - 预计要跑几次二分（log2(commitCount)）
2. 加速策略：
   - 是否能用 commit message 过滤掉明显无关的 commit？
   - 是否能在测试环境批量跑多个 commit？
3. 注意事项：
   - 数据库 schema 变更怎么处理？
   - 配置变更怎么处理？
\`;
}

// ---- 演示：渲染五槽位调试 prompt ----
console.log("========================================");
console.log("  调试 prompt 演示：五槽位结构");
console.log("========================================\\n");

const debugPrompt = renderDebugPrompt({
  symptom:
    "- 报错：TypeError: Cannot read properties of undefined (reading 'map')\\n" +
    "- 位置：src/components/UserList.tsx:42\\n" +
    "- 频率：约 30% 请求触发，本地难复现\\n" +
    "- 影响：用户列表页白屏",
  reproduce:
    "1. 登录普通用户账号（非 admin）\\n" +
    "2. 进入 /users 页面\\n" +
    "3. 等待 2-3 秒，约 30% 概率白屏\\n" +
    "4. 刷新页面通常能恢复",
  code:
    "// src/components/UserList.tsx\\n" +
    "const [data, setData] = useState();\\n" +
    "useEffect(() => {\\n" +
    "  fetch('/api/users').then(r => r.json()).then(d => setData(d));\\n" +
    "}, []);\\n" +
    "return <ul>{data.items.map(u => <li key={u.id}>{u.name}</li>)}</ul>;",
  tried:
    "- 本地用 admin 测试，无法复现\\n" +
    "- 本地用普通账号，能看到 403 但不白屏\\n" +
    "- 怀疑 race condition，无证据",
  expected:
    "- 非管理员访问应显示'无权限'，不白屏\\n" +
    "- 加载中应显示 loading，不崩溃\\n" +
    "- 后端 403 时前端要能识别错误响应",
});
console.log(debugPrompt);

// ---- 演示：增量调试 5 步法 ----
console.log("\\n========================================");
console.log("  增量调试 5 步法");
console.log("========================================\\n");
INCREMENTAL_DEBUG_STEPS.forEach((s) => {
  console.log(\`步骤 \${s.step}：\${s.name}\`);
  console.log(\`  动作：\${s.action}\`);
  console.log(\`  输出：\${s.output}\\n\`);
});

// ---- 演示：二分查找方案 ----
console.log("========================================");
console.log("  二分查找方案 prompt 演示");
console.log("========================================\\n");

const bisectPrompt = renderBisectPrompt({
  symptom: "登录接口 p95 从 50ms 退化到 800ms",
  duration: "最近 2 周内",
  badVersion: "v1.8.0",
  goodVersion: "v1.7.5",
  branch: "main",
  commitCount: 87,
  context: "期间有大重构（DB 层从 callback 改 async/await）",
});
console.log(bisectPrompt);

// ---- 调试反模式提醒 ----
console.log("========================================");
console.log("  调试 prompt 4 大反模式（避免！）");
console.log("========================================\\n");
console.log("1. 把报错一股脑贴过去问'修一下'");
console.log("   → 缺五槽位，模型只能猜");
console.log("2. 让 AI '重写代码避免报错'");
console.log("   → 把 bug 当代码生成，引入新 bug");
console.log("3. 把 5000 行日志全贴过去");
console.log("   → 上下文太长，模型被淹没");
console.log("4. 不给'已尝试方案'");
console.log("   → 模型让你重复已做过的事");
`,
  },
  {
    id: "aiapp-prompt-docs",
    icon: "📚",
    group: "提示词工程实战",
    title: "文档与测试模板",
    content: `
# 第30章：文档与测试模板

## 30.1 文档与测试为什么放在一起讲

文档和测试都是"代码的副产品"，但它们的 prompt 结构惊人地相似——都要求模型"基于已有代码生成结构化产物"，都需要在 prompt 里给出"目标读者"和"覆盖范围"。这一章把两类模板放在一起讲，对比它们的异同，你会发现同一套方法论可以复用到很多"代码 → 产物"的场景。

## 30.2 模板一：API 文档生成

API 文档生成的关键不是"格式漂亮"，而是 **"代码先行"原则**——让 AI 从代码里提取信息，而不是凭空描述。这能避免文档与代码漂移。

\`\`\`text
[Role]
你是熟悉 OpenAPI 3 规范的技术文档工程师。

[Task]
基于下面的 Express 路由代码，生成 API 文档。要求：
1. 每个端点单独一节
2. 字段说明从代码注释与 zod schema 提取，不要编造
3. 含请求/响应示例

[Context]
- 项目：电商后台 API
- 技术栈：Express 4 + zod
- 文档受众：前端工程师与移动端工程师

[待文档化代码]
// src/routes/articles.ts
import { Router } from 'express';
import { z } from 'zod';

const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

const router = Router();

/**
 * 创建文章
 * 需要登录，仅作者角色可调用
 */
router.post('/api/articles', requireAuth, requireRole('author'), async (req, res) => {
  const body = createArticleSchema.parse(req.body);
  const article = await articleService.create(req.user.id, body);
  res.status(201).json({ data: article });
});

/**
 * 获取文章详情
 * 公开接口
 */
router.get('/api/articles/:id', async (req, res) => {
  const article = await articleService.findById(Number(req.params.id));
  if (!article) return res.status(404).json({ error: 'not_found' });
  res.json({ data: article });
});

export default router;

[输出格式]
按以下结构输出 Markdown：

## POST /api/articles
- 描述：<从注释提取>
- 鉴权：需要 Bearer Token + author 角色
- 请求体：
  | 字段 | 类型 | 必填 | 校验 | 说明 |
  | --- | --- | --- | --- | --- |
  | title | string | 是 | 1-200 字符 | 文章标题 |
  ...
- 请求示例：
  \`\`\`json
  { "title": "...", "content": "...", "tags": ["a","b"] }
  \`\`\`
- 响应：201
  | 字段 | 类型 | 说明 |
  ...
- 响应示例：
  \`\`\`json
  { "data": { "id": 1, "title": "..." } }
  \`\`\`
- 错误码：
  | 状态 | code | 说明 |
  | 400 | invalid_body | 请求体校验失败 |
  | 401 | unauthorized | 未登录 |
  | 403 | forbidden | 非 author 角色 |

[约束]
- 字段说明必须来自 zod schema 与代码注释，不要编造
- 不知道的字段标"（代码未标注，建议补充）"
- 不要输出"希望对你有帮助"之类的客套话
\`\`\`

"代码先行"原则的核心是 **"字段说明必须来自代码，不能编造"**。这条约束加上"不知道的标'建议补充'"，能让文档与代码保持一致，避免模型凭空写出"created_at：创建时间"这种代码里根本没有的字段。

## 30.3 模板二：README 生成

README 生成的关键是 **"分读者"**——同一个 README 给开发者看和给用户看是不一样的。模板里要把"读者"和"必备章节"都说清。

\`\`\`text
[Role]
你是熟悉开源项目运营的技术写手。

[Task]
为下面的项目生成 README.md。

[Context]
- 项目名：imgpack
- 一句话介绍：把目录下的图片批量压缩并输出到目标目录的 CLI 工具
- 技术栈：Node.js 20 + TypeScript + sharp
- 仓库结构：
  src/cli.ts           CLI 入口
  src/commands/        子命令实现
  src/utils/           工具函数
  tests/               测试
  docs/                文档
- 已有 docs/usage.md 与 docs/api.md 可引用

[读者]
主要读者：想用这个工具的开发者（不需要看源码）
次要读者：想贡献代码的开发者（需要看开发指南）

[必备章节]
1. 项目标题 + 一句话介绍 + badges（license/node version）
2. 特性（3-5 条，每条一句话）
3. 安装（npm / pnpm / yarn 三种）
4. 快速开始（5 行内的最小用例）
5. 子命令（compress / diff / info，每个含示例）
6. 配置（环境变量、配置文件）
7. 常见问题（FAQ，5 条）
8. 贡献指南（链接到 CONTRIBUTING.md）
9. License

[输出格式]
- Markdown 格式
- 命令行示例用 \`\`\`bash 围栏
- 不要输出"本文档由 AI 生成"之类的元信息
- 安装与快速开始必须能直接复制运行
\`\`\`

README 模板的两个关键设计：

1. **"分读者"**——主要读者决定前 6 节怎么写（用法导向），次要读者决定贡献指南怎么写（开发导向）。不分读者的话，模型会把 README 写成"功能介绍 + 源码结构 + API 全表"的四不像。
2. **"快速开始必须能直接复制运行"**——这条约束会逼模型给出最小的、不依赖额外配置的示例，而不是"先建配置文件、再设置环境变量、再运行"的复杂流程。

## 30.4 模板三：技术博客生成

技术博客生成的关键是 **CO-STAR 框架**（第 26 章讲过），核心是 **"先定受众再定深度"**。给"3 年经验的前端"和给"5 年经验的全栈"写法完全不同。

\`\`\`text
[Context]
我刚完成一次性能优化：把 React 列表页的渲染时间从 1200ms 降到 200ms。
关键改动：
1. 列表项用 React.memo + 自定义比较函数
2. 把 useCallback 套到所有事件处理函数
3. 用虚拟列表（react-window）替代全量渲染
4. 把 Context 拆成 3 个，避免无关订阅者重渲染

[Objective]
写一篇 1500-2000 字的技术博客，分享这次优化。

[Style]
- 第一人称，技术博客体
- 每段不超过 4 句
- 改动前后都贴代码片段（每段不超过 15 行）
- 数据驱动：每条优化都给"优化前 X ms → 优化后 Y ms"

[Tone]
务实、不卖弄、承认踩坑、不夸大收益

[Audience]
有 1-3 年 React 经验的前端工程师，知道 memo/useCallback 但不知道"什么时候该用"

[Response]
- Markdown 格式
- 含一级标题 + TOC
- 每个优化点独立成节：标题 + 现象 + 根因 + 改动 + 数据
- 末尾加"踩坑总结"小节
\`\`\`

这个模板把 CO-STAR 六个槽位都填满了，模型给出的博客会非常聚焦——不会写"React 渲染原理简介"这种受众不需要的科普，而是直接进入"我遇到了什么问题、怎么改的、效果多少"。

## 30.5 模板四：单元测试生成（Jest/Vitest/PyTest/JUnit）

测试生成的关键是 **"覆盖路径清单"**——把要测的 case 列成清单，让模型按清单逐个写，而不是让它"自由发挥"写一堆 happy path。

\`\`\`text
[Role]
你是熟悉 Vitest 与测试驱动开发的工程师，写的测试可读、独立、快。

[Task]
为下面的函数生成单元测试。

[待测代码]
// src/utils/formatBytes.ts
export function formatBytes(bytes: number, opts?: { decimals?: number }): string {
  if (typeof bytes !== 'number') throw new TypeError('bytes must be a number');
  if (Number.isNaN(bytes) || !Number.isFinite(bytes)) throw new RangeError('bytes must be finite');
  const decimals = opts?.decimals ?? 1;
  if (bytes === 0) return '0 B';
  const sign = bytes < 0 ? '-' : '';
  const abs = Math.abs(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(abs) / Math.log(1024));
  const val = abs / Math.pow(1024, i);
  const formatted = val.toFixed(decimals).replace(/\\.?0+$/, '');
  return sign + formatted + ' ' + units[i];
}

[覆盖路径清单]
按以下清单逐个写测试 case，每个 case 独立一个 it：

## 边界值
- 0 → "0 B"
- 1024 → "1 KB"（不显示小数）
- 1023 → "1023 B"
- 1025 → "1 KB"（四舍五入）

## 单位切换
- 1536 → "1.5 KB"
- 1048576 → "1 MB"
- 1073741824 → "1 GB"
- 1.125899906842624e15 → "1 PB"

## 负数
- -1024 → "-1 KB"
- -1536 → "-1.5 KB"

## 精度参数
- formatBytes(1536, { decimals: 2 }) → "1.50 KB"
- formatBytes(1536, { decimals: 0 }) → "2 KB"

## 异常
- formatBytes(NaN) → 抛 RangeError
- formatBytes(Infinity) → 抛 RangeError
- formatBytes("1024" as any) → 抛 TypeError

[输出格式]
- 输出 1 个文件 src/utils/formatBytes.test.ts
- 用 describe/it 结构
- 每个 it 名字用"输入 → 期望"格式，如 it('1536 → "1.5 KB"')
- 用 expect(fn).toBe() 与 expect(fn).toThrow()
- 不要 markdown 围栏
- 测试文件顶部用注释列出"覆盖路径"与对应的 case 数
\`\`\`

"覆盖路径清单"是测试生成的灵魂。清单分五类：边界值、单位切换、负数、精度参数、异常——这五类覆盖了纯函数 90% 的测试需要。模型按清单写，每个 case 都有明确目的，不会出现"为了凑数"的 happy path 测试。

## 30.6 不同测试框架的 prompt 差异

四个主流测试框架的 prompt 槽位几乎一样，只在"输出格式"段有差异。下面给出四个框架的输出格式片段：

**Vitest/Js（推荐）**：

\`\`\`text
[输出格式]
- 文件：src/utils/formatBytes.test.ts
- import { describe, it, expect } from 'vitest'
- 用 describe/it/expect 结构
- 异常用 expect(fn).toThrow(RegexOrClass)
\`\`\`

**Jest**：

\`\`\`text
[输出格式]
- 文件：src/utils/formatBytes.test.js
- 不需要 import，describe/it/expect 是全局
- 异常用 expect(fn).toThrow(RegexOrClass)
- 用 jest.fn() 创建 mock
\`\`\`

**PyTest**：

\`\`\`text
[输出格式]
- 文件：tests/test_format_bytes.py
- import pytest
- 用 def test_xxx(): 函数式
- 异常用 with pytest.raises(ValueError):
- 参数化用 @pytest.mark.parametrize
\`\`\`

**JUnit 5**：

\`\`\`text
[输出格式]
- 文件：src/test/java/com/example/FormatBytesTest.java
- import org.junit.jupiter.api.Test
- 用 @Test void shouldXxx() 命名
- 异常用 assertThrows(Class, () -> ...)
- 参数化用 @ParameterizedTest + @CsvSource
\`\`\`

四套框架的"覆盖路径清单"完全可以复用，只换输出格式段。这也是为什么测试生成的 ROI 高——同一套方法论可以跨语言迁移。

## 30.7 模板五：E2E 测试生成

E2E 测试生成的关键是 **"用户旅程"**——不是测单个函数，而是测"用户从 A 到 B 的完整路径"。

\`\`\`text
[Role]
你是熟悉 Playwright 的 E2E 测试工程师。

[Task]
为"用户下单"流程生成 E2E 测试。

[用户旅程]
1. 用户访问首页 /
2. 搜索"iPhone"
3. 点击第一个商品
4. 加入购物车
5. 进入购物车，点"结算"
6. 填写地址，选支付方式
7. 提交订单
8. 看到订单成功页

[待测页面]
- 首页：/，搜索框 selector [data-testid="search-input"]
- 商品列表：搜索结果 [data-testid="product-card"]
- 商品详情：加入购物车按钮 [data-testid="add-to-cart"]
- 购物车：[data-testid="cart-page"]，结算按钮 [data-testid="checkout"]
- 结算页：地址 [data-testid="address"]，支付 [data-testid="payment"]，提交 [data-testid="submit-order"]
- 成功页：[data-testid="order-success"]

[关键断言]
- 步骤 3 后 URL 应为 /product/:id
- 步骤 5 后购物车应有 1 件商品
- 步骤 7 后 URL 应为 /order/success
- 步骤 8 后应显示订单号（不为空）

[输出格式]
- 文件：tests/e2e/order-flow.spec.ts
- import { test, expect } from '@playwright/test'
- 用 test('用户下单完整流程', async ({ page }) => { ... })
- 每个步骤用注释分隔 // step 1: 访问首页
- 关键断言用 expect(page).toHaveURL / expect(locator).toBeVisible
- 失败时截图：test.afterEach(async ({ page }, testInfo) => { ... })
- 不要 markdown 围栏
\`\`\`

E2E 模板的关键是 **"selector 用 data-testid"**——这避免模型用 CSS class 或 XPath（容易随 UI 改动而失效）。如果你的项目还没有 data-testid，第一步应该是让 AI 给现有组件加 data-testid，而不是直接写 E2E。

## 30.8 模板六：测试覆盖率提升

覆盖率提升的关键是 **"基于覆盖率报告定位未覆盖路径"**，而不是让模型"凭空补测试"。

\`\`\`text
[Role]
你是熟悉 Vitest 覆盖率报告的测试工程师。

[Task]
基于下面的覆盖率报告，补充未覆盖的测试 case。

[当前覆盖率]
File                          | % Stmts | % Branch | % Funcs | % Lines
src/utils/formatBytes.ts      |   85.71 |    75.00 |   100.0 |   85.71
src/utils/priceCalculator.ts  |   62.50 |    50.00 |    80.0 |   60.00
src/services/order.ts         |   45.00 |    30.00 |    60.0 |   45.00

[未覆盖的具体行（来自 lcov.info）]
src/utils/priceCalculator.ts:
  - 第 23-28 行：applyVipDiscount 的 else 分支（user.level !== 'vip'）
  - 第 45-50 行：applyCoupon 的过期分支（coupon.expireAt <= Date.now()）
  - 第 67 行：Math.round 的边界值

src/services/order.ts:
  - 第 15-20 行：库存不足的错误分支
  - 第 35-40 行：优惠券无效的错误分支
  - 第 50-55 行：事务回滚分支

[目标]
- 行覆盖率从 60% 提升到 85%+
- 分支覆盖率从 40% 提升到 80%+
- 不要为了凑覆盖率写无意义的测试

[输出格式]
- 对每个未覆盖分支，输出 1 个测试 case
- 文件命名：src/utils/priceCalculator.test.ts（追加到现有测试文件）
- 用 it('should ... when ...') 命名
- 每个 it 顶部用注释说明"覆盖了第 X 行的哪个分支"
- 不要 markdown 围栏
\`\`\`

这个模板的精髓是 **"基于 lcov.info 的具体行号"**——模型不用猜哪里没覆盖，直接看报告写。这比让模型"自由补测试"高效得多，也避免了"为了凑覆盖率写无意义测试"的反模式。

## 30.9 测试生成 prompt 的"覆盖路径清单"模板

把测试 case 的设计抽成一份可复用的清单模板，纯函数与服务端函数都能套：

\`\`\`text
# 覆盖路径清单（纯函数版）
## 边界值
- 空输入（[] / "" / 0 / null / undefined）
- 单元素
- 最大值/最小值
- 临界值（如 1023/1024/1025）

## 正常路径
- 典型输入
- 多个典型输入（覆盖不同分支）

## 异常路径
- 类型错误（string 传 number）
- 值域错误（NaN / Infinity / 负数）
- 依赖错误（DB 断连 / 网络超时）

## 参数组合
- 默认参数
- 显式参数
- 边界参数组合

# 覆盖路径清单（服务端函数版）
## 鉴权
- 未登录
- 已登录无权限
- 已登录有权限

## 输入校验
- 缺字段
- 字段类型错
- 字段值越界

## 业务规则
- 正常流程
- 资源不存在
- 资源已存在（创建冲突）
- 业务规则不满足（如库存不足）

## 副作用
- 写入成功
- 写入失败（DB 异常）
- 事务回滚

## 并发
- 两个请求同时操作同一资源
\`\`\`

把这份清单保存到 \`.ai/test-paths.md\`，每次生成测试时引用"对照 .ai/test-paths.md 列出覆盖路径"，模型会按清单系统地覆盖，不会漏掉"资源已存在"或"事务回滚"这种容易被忘的分支。

## 30.10 文档生成的"代码先行"原则

文档生成最大的坑是 **"文档与代码漂移"**——文档说有这个字段，代码早就删了。避免漂移的方法就是"代码先行"：

1. **文档字段必须来自代码**——prompt 里明确写"字段说明必须来自 zod schema / TypeScript 类型 / 代码注释，不能编造"。
2. **不知道的标"建议补充"**——不要让模型猜，让它诚实标注。
3. **文档与代码同 PR**——改代码的人同时改文档，CI 检查文档是否同步。
4. **关键示例必须是可运行的**——README 的"快速开始"必须能直接复制运行，不能是伪代码。

下面是"代码先行"在 prompt 里的标准约束段：

\`\`\`text
[代码先行约束]
- 字段说明必须来自代码（zod schema / 类型注解 / 注释），不能编造
- 不知道的字段标"（代码未标注，建议补充）"
- 示例值必须是合理的、与代码一致的
- 如发现代码与文档冲突，在末尾列"代码与文档不一致"清单
- 不要输出"由 AI 生成"之类的元信息
\`\`\`

这段约束加到任何文档生成 prompt 里，都能显著降低漂移概率。模型会变成"诚实的文档员"——它不知道的会标出来，而不是编一段听起来合理但实际错误的描述。

## 30.11 文档与测试的共同方法论

把这一章和测试章放在一起看，会发现"代码 → 产物"的任务有一套共同方法论：

1. **基于已有代码，不要凭空生成**——文档字段来自代码，测试 case 来自覆盖路径清单。
2. **给目标受众**——文档给"前端工程师"，测试给"未来改代码的人"。
3. **覆盖路径清单是核心**——文档的"必备章节"清单、测试的"覆盖路径"清单，本质都是"该覆盖什么的清单"。
4. **代码先行**——文档与测试都必须能追溯到代码，避免漂移。
5. **诚实标注未知**——不知道的标"建议补充"，不要编造。

这套方法论可以推广到很多场景：生成 changelog（基于 git log + commit message）、生成架构图（基于代码依赖）、生成 on-call 文档（基于告警规则）。核心都是"代码先行 + 覆盖清单 + 受众明确"。

## 30.12 第 6 批章节小结

这一批 5 章合起来，是一套完整的"提示词工程实战"方法论：

- **第 26 章**：四大框架（RTCF/CRISPE/TAG/CO-STAR）与编程场景的 RTCF + 约束组合。
- **第 27 章**：五个代码生成模板（CRUD/React/工具函数/CLI/数据模型），核心是约束清单 + 即贴即用 7 条。
- **第 28 章**：审查与重构是两种任务，四维度审查 + 重构优先级矩阵 + diff 风格输出。
- **第 29 章**：调试是侦探任务，五槽位结构 + 增量调试 5 步法 + 二分查找法。
- **第 30 章**：文档与测试共享"代码先行 + 覆盖清单 + 受众明确"方法论。

记住一个元原则：**框架不是教条，是脚手架；模板不是终点，是起点**。把这一批的模板用熟之后，你应该能根据具体任务调整槽位——比如加一个"性能预算"槽位给性能敏感的代码生成，加一个"合规要求"槽位给金融场景的文档生成。提示词工程的终极目标，是让你和 AI 之间的协作成本趋近于"你和自己思考的成本"，让 AI 真正成为你的"外脑"而不是"复读机"。
`,
    code: `// =============================================================
// 第30章示例：文档与测试 prompt 生成器
// 包含：API 文档模板、README 模板、单元测试覆盖路径清单
// =============================================================

// ---- 测试覆盖路径清单（纯函数版）----
const TEST_PATHS_PURE = {
  边界值: [
    "空输入（[] / \\"\\" / 0 / null / undefined）",
    "单元素",
    "最大值/最小值",
    "临界值（如 1023/1024/1025）",
  ],
  正常路径: [
    "典型输入",
    "多个典型输入（覆盖不同分支）",
  ],
  异常路径: [
    "类型错误（string 传 number）",
    "值域错误（NaN / Infinity / 负数）",
    "依赖错误（DB 断连 / 网络超时）",
  ],
  参数组合: [
    "默认参数",
    "显式参数",
    "边界参数组合",
  ],
};

// ---- 测试覆盖路径清单（服务端函数版）----
const TEST_PATHS_SERVER = {
  鉴权: ["未登录", "已登录无权限", "已登录有权限"],
  输入校验: ["缺字段", "字段类型错", "字段值越界"],
  业务规则: [
    "正常流程",
    "资源不存在",
    "资源已存在（创建冲突）",
    "业务规则不满足（如库存不足）",
  ],
  副作用: ["写入成功", "写入失败（DB 异常）", "事务回滚"],
  并发: ["两个请求同时操作同一资源"],
};

// ---- 渲染 API 文档 prompt ----
function renderAPIDocPrompt(code, audience) {
  return \`[Role]
你是熟悉 OpenAPI 3 规范的技术文档工程师。

[Task]
基于下面的代码生成 API 文档。要求：
1. 每个端点单独一节
2. 字段说明从代码注释与 zod schema 提取，不要编造
3. 含请求/响应示例

[Context]
- 文档受众：\${audience}

[待文档化代码]
\${code}

[输出格式]
按以下结构输出 Markdown：

## <METHOD> <path>
- 描述：<从注释提取>
- 鉴权：<从中间件提取>
- 请求体：
  | 字段 | 类型 | 必填 | 校验 | 说明 |
  | --- | --- | --- | --- | --- |
  ...
- 请求示例：json 代码块
- 响应：<status>
  | 字段 | 类型 | 说明 |
  ...
- 响应示例：json 代码块
- 错误码：
  | 状态 | code | 说明 |
  ...

[代码先行约束]
- 字段说明必须来自代码（zod schema / 类型注解 / 注释），不能编造
- 不知道的字段标"（代码未标注，建议补充）"
- 如发现代码与文档冲突，在末尾列"代码与文档不一致"清单
- 不要输出"由 AI 生成"之类的元信息
\`;
}

// ---- 渲染 README prompt ----
function renderReadmePrompt(projectInfo) {
  return \`[Role]
你是熟悉开源项目运营的技术写手。

[Task]
为下面的项目生成 README.md。

[Context]
- 项目名：\${projectInfo.name}
- 一句话介绍：\${projectInfo.intro}
- 技术栈：\${projectInfo.stack}
- 仓库结构：
\${projectInfo.structure}

[读者]
主要读者：想用这个工具的开发者（不需要看源码）
次要读者：想贡献代码的开发者（需要看开发指南）

[必备章节]
1. 项目标题 + 一句话介绍 + badges（license/node version）
2. 特性（3-5 条，每条一句话）
3. 安装（npm / pnpm / yarn 三种）
4. 快速开始（5 行内的最小用例）
5. 子命令（每个含示例）
6. 配置（环境变量、配置文件）
7. 常见问题（FAQ，5 条）
8. 贡献指南（链接到 CONTRIBUTING.md）
9. License

[输出格式]
- Markdown 格式
- 命令行示例用 \`\`\`bash 围栏
- 不要输出"本文档由 AI 生成"之类的元信息
- 安装与快速开始必须能直接复制运行
\`;
}

// ---- 渲染单元测试 prompt ----
function renderUnitTestPrompt(fnCode, paths) {
  const pathLines = Object.entries(paths).map(([category, items]) => {
    const itemLines = items.map((i) => \`  - \${i}\`).join("\\n");
    return \`## \${category}\\n\${itemLines}\`;
  }).join("\\n\\n");

  return \`[Role]
你是熟悉 Vitest 与测试驱动开发的工程师，写的测试可读、独立、快。

[Task]
为下面的函数生成单元测试。

[待测代码]
\${fnCode}

[覆盖路径清单]
按以下清单逐个写测试 case，每个 case 独立一个 it：

\${pathLines}

[输出格式]
- 输出 1 个测试文件
- 用 describe/it 结构
- 每个 it 名字用"输入 → 期望"格式
- 用 expect(fn).toBe() 与 expect(fn).toThrow()
- 不要 markdown 围栏
- 测试文件顶部用注释列出"覆盖路径"与对应的 case 数
\`;
}

// ---- 演示：渲染 API 文档 prompt ----
console.log("========================================");
console.log("  API 文档 prompt 演示");
console.log("========================================\\n");

const apiCode = \`// src/routes/articles.ts
const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

/** 创建文章，需要登录 + author 角色 */
router.post('/api/articles', requireAuth, requireRole('author'), async (req, res) => {
  const body = createArticleSchema.parse(req.body);
  const article = await articleService.create(req.user.id, body);
  res.status(201).json({ data: article });
});\`;

console.log(renderAPIDocPrompt(apiCode, "前端工程师与移动端工程师"));

// ---- 演示：渲染 README prompt ----
console.log("\\n========================================");
console.log("  README prompt 演示");
console.log("========================================\\n");

console.log(renderReadmePrompt({
  name: "imgpack",
  intro: "把目录下的图片批量压缩并输出到目标目录的 CLI 工具",
  stack: "Node.js 20 + TypeScript + sharp",
  structure:
    "  src/cli.ts           CLI 入口\\n" +
    "  src/commands/        子命令实现\\n" +
    "  src/utils/           工具函数\\n" +
    "  tests/               测试\\n" +
    "  docs/                文档",
}));

// ---- 演示：渲染单元测试 prompt（纯函数版）----
console.log("\\n========================================");
console.log("  单元测试 prompt 演示：纯函数覆盖路径");
console.log("========================================\\n");

const fnCode = \`export function formatBytes(bytes: number, opts?: { decimals?: number }): string {
  if (typeof bytes !== 'number') throw new TypeError('bytes must be a number');
  if (Number.isNaN(bytes) || !Number.isFinite(bytes)) throw new RangeError('bytes must be finite');
  const decimals = opts?.decimals ?? 1;
  if (bytes === 0) return '0 B';
  const sign = bytes < 0 ? '-' : '';
  const abs = Math.abs(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(abs) / Math.log(1024));
  const val = abs / Math.pow(1024, i);
  return sign + val.toFixed(decimals).replace(/\\\\.?0+$/, '') + ' ' + units[i];
}\`;

console.log(renderUnitTestPrompt(fnCode, TEST_PATHS_PURE));

// ---- 输出测试覆盖路径清单（服务端版）----
console.log("\\n========================================");
console.log("  服务端测试覆盖路径清单");
console.log("========================================\\n");

Object.entries(TEST_PATHS_SERVER).forEach(([cat, items]) => {
  console.log(\`## \${cat}\`);
  items.forEach((i) => console.log(\`  - [ ] \${i}\`));
  console.log("");
});

// ---- 文档与测试的共同方法论 ----
console.log("========================================");
console.log("  文档与测试的共同方法论（5 条）");
console.log("========================================\\n");
console.log("1. 基于已有代码，不要凭空生成");
console.log("2. 给目标受众（文档给 X 工程师，测试给未来改代码的人）");
console.log("3. 覆盖路径清单是核心");
console.log("4. 代码先行（避免文档与代码漂移）");
console.log("5. 诚实标注未知（不知道的标'建议补充'，不要编造）");
`,
  },
];
