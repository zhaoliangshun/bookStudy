// =============================================================
// AI 编程方法教程 —— 第二批章节（提示词工程组，共 5 章）
// =============================================================

export const chapters = [
  {
    id: "prompt-basics",
    icon: "✍️",
    group: "提示词工程",
    title: "提示词工程基础：清晰表达的艺术",
    content: `
# 第6章：提示词工程基础——清晰表达的艺术

## 6.1 什么是提示词工程？

提示词工程（Prompt Engineering）是一门研究如何有效与大型语言模型（LLM）沟通的学科。它不仅仅是"写一段话让AI干活"，而是一套系统的方法论，涉及语言设计、认知心理学和软件工程的交叉领域。

在AI编程的语境下，提示词工程决定了你能否让AI准确理解你的需求并生成高质量的代码。一个优秀的提示词工程师，能够用最少的字数、最精确的表达，让AI产出符合预期的结果。

### 6.1.1 为什么提示词工程很重要？

想象一下以下场景：

**场景A**：你花了30分钟写了一个模糊的提示词，AI生成了一堆看起来不错但实际不能用的代码。你反复修改提示词，来回调试，最终花了2小时才得到一个能用的版本。

**场景B**：你花了5分钟精心设计了一个结构化的提示词，AI第一次就生成了90%正确的代码。你只需要微调几个细节，总共花了15分钟就完成了任务。

这就是提示词工程的威力。它不仅仅是"写得更清楚"，而是理解AI的"思维方式"，用AI能最好理解的语言来表达你的需求。

### 6.1.2 提示词工程的四个核心要素

一个优秀的提示词通常包含以下四个要素：

| 要素 | 英文 | 说明 | 示例 |
|------|------|------|------|
| 上下文 | Context | 提供背景信息，让AI理解整体场景 | "我们正在开发一个React电商应用..." |
| 指令 | Instruction | 明确告诉AI要做什么 | "请创建一个商品列表组件，支持分页和排序" |
| 约束 | Constraints | 限制AI的行为范围 | "使用TypeScript，遵循函数式编程风格，不使用any类型" |
| 输出格式 | Output Format | 指定期望的输出形式 | "请以完整的.tsx文件形式输出，包含所有必要的import" |

这四个要素构成了提示词的骨架。让我们逐一深入理解。

#### 上下文（Context）

上下文是AI理解你的需求的"背景画布"。没有足够的上下文，AI就像在黑暗中摸索。好的上下文应该包含：

1. **项目信息**：你正在做什么项目？技术栈是什么？
2. **文件结构**：当前代码在哪个文件中？相关的文件有哪些？
3. **业务逻辑**：这段代码要实现什么业务功能？
4. **历史决策**：之前为什么选择了某种方案？

**不好的上下文示例**：
\`\`\`
写一个按钮组件。
\`\`\`

**好的上下文示例**：
\`\`\`
我们正在开发一个React 18 + TypeScript的企业级管理后台。
项目使用Ant Design 5.x作为UI组件库，状态管理使用Zustand。
需要创建一个自定义按钮组件，它需要：
- 支持Ant Design Button的所有原生属性
- 额外支持loading文案自定义
- 与现有的权限系统集成（通过usePermission hook）
- 遵循项目的设计规范（圆角8px，主色#1890ff）
\`\`\`

#### 指令（Instruction）

指令是提示词的核心动作。一个好的指令应该：

1. **动词明确**：创建、修改、优化、重构、调试、解释
2. **范围清晰**：具体到哪个文件、哪个函数、哪个功能
3. **优先级排序**：如果有多个要求，指明哪个最重要

**模糊的指令**：
\`\`\`
帮我优化一下代码。
\`\`\`

**清晰的指令**：
\`\`\`
请重构 UserProfile.tsx 中的 renderUserInfo 函数：
1. 将其拆分为三个更小的函数：renderAvatar, renderDetails, renderActions
2. 每个函数不超过30行
3. 使用 useMemo 缓存计算结果
4. 移除所有 any 类型标注
\`\`\`

#### 约束（Constraints）

约束定义了AI行为的边界。好的约束是具体的、可验证的：

| 约束类型 | 示例 |
|----------|------|
| 语言约束 | "使用TypeScript，strict模式" |
| 框架约束 | "使用React 18的Server Components" |
| 风格约束 | "遵循Airbnb JavaScript风格指南" |
| 性能约束 | "避免不必要的re-render，使用React.memo" |
| 安全约束 | "不要使用eval，避免XSS漏洞" |
| 兼容性约束 | "需要兼容IE11" |
| 依赖约束 | "不使用第三方库，仅使用Node.js内置模块" |

#### 输出格式（Output Format）

明确指定输出格式可以大大减少后续的处理工作：

- **完整文件**："请以完整的.tsx文件形式输出"
- **代码片段**："只输出修改的函数，不要输出整个文件"
- **diff格式**："以git diff的格式展示修改"
- **结构化**："以JSON格式输出，包含{code, explanation, tests}三个字段"

## 6.2 坏提示词 vs 好提示词

让我们通过对比来直观感受好坏提示词的差异。

### 6.2.1 代码生成场景

**坏提示词**：
\`\`\`
写一个登录功能
\`\`\`

**问题分析**：
- 没有语言/框架信息
- 没有认证方式说明（JWT？Session？OAuth？）
- 没有错误处理要求
- 没有安全要求
- 没有UI/API区分

**好提示词**：
\`\`\`
请在 Next.js 14 App Router 中创建一个登录API路由。

技术栈：Next.js 14, TypeScript, Prisma ORM, PostgreSQL
认证方式：JWT (使用jose库)
密码加密：bcrypt

要求：
1. 创建 POST /api/auth/login 路由
2. 接收 { email: string, password: string } 请求体
3. 验证邮箱格式（使用zod）
4. 查询数据库验证用户是否存在
5. 使用bcrypt.compare验证密码
6. 成功后返回 { token: string, user: { id, email, name } }
7. 失败时返回对应的HTTP状态码和错误信息：
   - 400: 参数验证失败
   - 401: 邮箱或密码错误
   - 429: 登录尝试次数过多（5次/15分钟）
   - 500: 服务器内部错误
8. 设置JWT过期时间为7天
9. 在响应中设置httpOnly cookie（可选）
10. 添加请求日志（使用console.log，后续会替换为正式日志系统）

请以完整的route.ts文件形式输出，包含所有必要的import。
\`\`\`

### 6.2.2 调试场景

**坏提示词**：
\`\`\`
代码报错了，帮我看看
\`\`\`

**好提示词**：
\`\`\`
我在运行 Next.js 项目时遇到以下错误：

\`\`\`
Error: Hydration failed because the initial UI does not match what was rendered on the server.
  at UserProfile (src/components/UserProfile.tsx:42:15)
\`\`\`

相关代码：
\`\`\`tsx
// UserProfile.tsx
export function UserProfile() {
  const [lastLogin, setLastLogin] = useState(new Date().toLocaleString());
  // ...
  return <div>最后登录: {lastLogin}</div>;
}
\`\`\`

我怀疑是SSR和客户端渲染的时间不一致导致的hydration问题。
请帮我分析并提供修复方案。
\`\`\`

## 6.3 具体性光谱

提示词的具体性可以看作一个光谱，从极度模糊到极度精确：

\`\`\`
模糊 ←————————————————————————————→ 精确
"写代码"  "写一个React组件"  "写一个带分页的表格组件"  "写一个Ant Design ProTable封装..."
\`\`\`

### 6.3.1 不同具体性级别的适用场景

| 级别 | 适用场景 | 风险 |
|------|----------|------|
| 模糊 | 探索性编程、头脑风暴 | 结果不可控，可能需要多次迭代 |
| 中等 | 原型开发、快速验证 | 结果大致可用，但需要修改 |
| 精确 | 生产代码、关键功能 | 结果可控，但可能限制AI的创造性 |
| 过度精确 | 几乎不需要AI | 变成了代码翻译器，失去AI价值 |

**最佳实践**：在精确和灵活之间找到平衡。对于核心逻辑要精确，对于实现细节可以适当灵活。

### 6.3.2 具体性提升技巧

1. **从宽到窄**：先写一个宽泛的提示词，然后逐步添加约束
2. **使用示例**：提供一个期望输出的示例
3. **定义边界**：明确什么可以做，什么不能做
4. **量化要求**：用数字代替模糊描述（"不超过100行"而非"尽量简洁"）

## 6.4 提示词模式

### 6.4.1 零样本提示（Zero-Shot Prompting）

零样本提示是最基本的模式——不给AI任何示例，直接提出要求。

**适用场景**：
- 简单、常见的任务
- AI训练数据中充分覆盖的场景
- 快速原型开发

**示例**：
\`\`\`
用JavaScript写一个函数，接收一个数组，返回去重后的数组。
\`\`\`

**优点**：快速、简洁
**缺点**：对于复杂或特定领域的任务，结果可能不够精确

### 6.4.2 少样本提示（Few-Shot Prompting）

少样本提示通过提供1-5个示例来引导AI的输出格式和风格。

**示例**：
\`\`\`
请将以下中文变量名转换为英文驼峰命名：

输入：用户姓名 → 输出：userName
输入：订单编号 → 输出：orderId
输入：商品数量 → 输出：productQuantity
输入：收货地址 → 输出：
\`\`\`

**优点**：
- 输出格式可控
- 风格一致性高
- 对于定制化任务效果好

**缺点**：
- 占用更多token
- 示例选择不当可能误导AI

### 6.4.3 思维链提示（Chain-of-Thought Prompting）

思维链提示要求AI在给出最终答案之前，先展示推理过程。

**示例**：
\`\`\`
请分析以下代码的性能问题，并逐步推理：

1. 首先，识别代码中的潜在性能瓶颈
2. 然后，分析每个瓶颈的影响程度
3. 接着，提出优化方案
4. 最后，给出优化后的代码

请一步步思考，在每一步中展示你的推理过程。

[代码内容]
\`\`\`

**优点**：
- 提高复杂任务的准确性
- 推理过程可审查
- 便于发现AI的错误假设

**缺点**：
- 输出更长，token消耗更多
- 对于简单任务可能过度设计

### 6.4.4 角色扮演提示（Role Prompting）

让AI扮演特定角色，从该角色的视角来回答问题。

**示例**：
\`\`\`
你是一位拥有15年经验的React高级工程师，专注于性能优化和代码架构设计。
请审查以下组件的代码质量，从以下角度给出建议：
1. 组件设计模式
2. 性能优化机会
3. 可维护性
4. 测试策略
\`\`\`

### 6.4.5 自我一致性提示（Self-Consistency）

对同一个问题多次提问，综合多个回答得到更可靠的结果。

**实践方法**：
1. 用不同的措辞问同一个问题
2. 要求AI从不同角度回答
3. 比较多个回答的一致性
4. 将高一致性的部分作为可靠结果

## 6.5 提示词作为"自然语言编程"

将提示词视为一种编程语言，这是一种强大的思维模型。

### 6.5.1 与传统编程的类比

| 传统编程 | 自然语言编程（提示词） |
|----------|------------------------|
| 语法规则 | 语言习惯和模式 |
| 编译器 | AI模型 |
| 类型系统 | 约束和格式规范 |
| 函数签名 | 输入输出格式定义 |
| 注释 | 上下文和背景说明 |
| 单元测试 | 输出验证 |
| 重构 | 提示词优化 |
| 调试 | 错误分析和迭代 |

### 6.5.2 提示词"编程"的最佳实践

1. **声明式 > 命令式**：描述你想要什么结果，而非如何实现
2. **类型安全**：明确指定数据类型和格式
3. **错误处理**：告诉AI遇到不确定的情况应该怎么做
4. **版本控制**：像管理代码一样管理你的提示词
5. **代码审查**：让另一个AI（或同一AI的不同会话）审查你的提示词

### 6.5.3 提示词的"编译错误"

AI的"编译错误"表现为：
- 输出格式不符合预期
- 生成内容与要求矛盾
- 遗漏关键信息
- 幻觉（编造不存在的API）

**调试技巧**：
1. 检查提示词中是否有矛盾的指令
2. 逐步简化提示词，找到问题所在
3. 添加更明确的约束
4. 使用"不要"来排除不希望的行为

## 6.6 迭代优化方法论

提示词很少一次就完美。迭代优化是提示词工程的核心实践。

### 6.6.1 迭代循环

\`\`\`
编写 → 测试 → 分析 → 改进 → 编写 → ...
\`\`\`

### 6.6.2 分析AI输出的框架

当AI的输出不理想时，从以下维度分析：

1. **理解偏差**：AI是否误解了你的意图？
   - 解决：更明确的指令，使用示例

2. **信息不足**：AI是否缺乏必要的信息？
   - 解决：添加更多上下文

3. **约束冲突**：是否存在互相矛盾的约束？
   - 解决：调整或移除冲突的约束

4. **能力边界**：任务是否超出了AI的能力？
   - 解决：拆分任务，降低复杂度

5. **格式问题**：输出格式是否符合要求？
   - 解决：更明确的格式说明，提供模板

### 6.6.3 优化技巧

1. **添加反例**：告诉AI"不要做什么"
2. **增加约束**：逐步收紧边界
3. **提供模板**：给出期望输出的结构框架
4. **分步引导**：将复杂任务拆解为多个步骤
5. **温度调节**：对于创造性任务提高温度，对于精确任务降低温度

## 6.7 实践练习

### 练习1：提示词改写

将以下模糊提示词改写为高质量提示词：

\`\`\`
帮我在项目里加一个搜索功能
\`\`\`

**改写提示**：
1. 明确项目信息（框架、语言、组件库）
2. 说明搜索功能的具体需求
3. 添加约束条件
4. 指定输出格式

### 练习2：提示词分析

分析以下提示词的问题并改进：

\`\`\`
写一个API接口，要求安全、快速、好用
\`\`\`

**分析要点**：
- "安全"太模糊，需要具体的认证方式
- "快速"需要量化（响应时间？吞吐量？）
- "好用"需要定义（RESTful？GraphQL？文档？）

### 练习3：从零构建提示词

需求：为一家电商平台创建一个商品推荐功能的API。

请构建一个完整的提示词，包含：
- 上下文（项目背景）
- 指令（具体要做什么）
- 约束（技术限制）
- 输出格式（期望的代码形式）

## 6.8 常见陷阱

### 陷阱1：信息过载

在一个提示词中塞入太多信息，导致AI无法聚焦重点。

**解决**：分步提问，每次只关注一个核心问题。

### 陷阱2：隐含假设

假设AI知道你的项目背景、命名规范、代码风格等。

**解决**：显式声明所有关键信息，不要依赖AI的"常识"。

### 陷阱3：过度约束

添加了太多互相矛盾的约束，或者过于限制AI的实现方式。

**解决**：区分"必须满足"和"最好满足"的约束，给AI留出实现空间。

### 陷阱4：忽视输出验证

不验证AI的输出就直接使用，导致代码存在bug或安全漏洞。

**解决**：始终审查AI生成的代码，运行测试，检查安全问题。

### 陷阱5：一次性思维

期望一个提示词就能得到完美结果，不愿意迭代优化。

**解决**：接受迭代是常态，将提示词优化视为正常的开发流程。

## 6.9 本章小结

提示词工程是AI编程时代的核心技能。掌握以下要点，你就能更高效地与AI协作：

1. **四要素框架**：上下文、指令、约束、输出格式
2. **具体性平衡**：在精确和灵活之间找到最佳点
3. **模式选择**：根据任务选择合适的提示词模式
4. **迭代优化**：将提示词优化视为正常的开发流程
5. **自然语言编程**：用编程思维来设计和管理提示词

记住：好的提示词不是写出来的，是迭代出来的。每一次与AI的交互都是一次学习机会，帮助你更好地理解AI的能力边界和沟通方式。
`,
    code: `
/**
 * 提示词优化引擎模拟器
 * 
 * 功能：
 * 1. 接收一个模糊的提示词
 * 2. 分析提示词中缺失的元素
 * 3. 给出具体的改进建议
 * 4. 生成优化后的提示词
 */

// 提示词分析器
class PromptAnalyzer {
  constructor() {
    this.dimensions = {
      context: {
        name: '上下文 (Context)',
        weight: 0.25,
        checks: ['项目背景', '技术栈', '文件结构', '业务逻辑', '相关依赖']
      },
      instruction: {
        name: '指令 (Instruction)',
        weight: 0.30,
        checks: ['动词明确', '范围清晰', '优先级排序', '可验证性', '分步说明']
      },
      constraints: {
        name: '约束 (Constraints)',
        weight: 0.25,
        checks: ['语言/框架', '代码风格', '性能要求', '安全要求', '兼容性']
      },
      format: {
        name: '输出格式 (Output Format)',
        weight: 0.20,
        checks: ['输出形式', '代码结构', '命名规范', '注释要求', '测试要求']
      }
    };
  }

  analyze(prompt) {
    const results = {};
    let totalScore = 0;

    for (const [key, dim] of Object.entries(this.dimensions)) {
      const score = this.evaluateDimension(prompt, dim);
      results[key] = {
        name: dim.name,
        score: score,
        weight: dim.weight,
        missing: this.findMissing(prompt, dim.checks),
        suggestions: this.generateSuggestions(key, prompt, dim.checks)
      };
      totalScore += score * dim.weight;
    }

    return {
      originalPrompt: prompt,
      dimensionResults: results,
      overallScore: Math.round(totalScore * 100),
      grade: this.getGrade(totalScore),
      improvedPrompt: this.generateImproved(prompt, results)
    };
  }

  evaluateDimension(prompt, dimension) {
    let matched = 0;
    for (const check of dimension.checks) {
      if (this.hasElement(prompt.toLowerCase(), check)) {
        matched++;
      }
    }
    return matched / dimension.checks.length;
  }

  hasElement(prompt, check) {
    const patterns = {
      '项目背景': /项目|project|应用|应用|系统|平台/,
      '技术栈': /react|vue|angular|next\.js|node|python|java|go|typescript|javascript|框架|技术栈/,
      '文件结构': /文件|目录|src|components|utils|api|pages|路由/,
      '业务逻辑': /业务|逻辑|流程|功能|需求/,
      '相关依赖': /依赖|library|package|npm|import|require/,
      '动词明确': /创建|修改|优化|重构|调试|解释|添加|删除|实现|编写|修复/,
      '范围清晰': /函数|组件|模块|文件|类|接口|API|路由/,
      '优先级排序': /首先|然后|接着|最后|优先|重要|关键|必须/,
      '可验证性': /测试|验证|检查|确认|确保|应该|必须/,
      '分步说明': /步骤|step|第一步|第二步|1\.|2\./,
      '语言/框架': /typescript|javascript|python|react|vue|node|严格|strict/,
      '代码风格': /风格|style|规范|格式|命名|驼峰|下划线|eslint|prettier/,
      '性能要求': /性能|效率|速度|优化|缓存|memo|延迟|响应时间/,
      '安全要求': /安全|xss|csrf|注入|加密|认证|授权|权限|敏感/,
      '兼容性': /兼容|浏览器|ie|safari|chrome|移动端|响应式/,
      '输出形式': /输出|返回|格式|json|markdown|代码|文件|完整/,
      '代码结构': /结构|架构|设计模式|组件|模块/,
      '命名规范': /命名|变量名|函数名|驼峰|pascal|kebab/,
      '注释要求': /注释|文档|jsdoc|说明|解释/,
      '测试要求': /测试|test|单元测试|集成测试|jest|vitest/
    };

    return patterns[check] ? patterns[check].test(prompt) : false;
  }

  findMissing(prompt, checks) {
    return checks.filter(check => !this.hasElement(prompt.toLowerCase(), check));
  }

  generateSuggestions(key, prompt, checks) {
    const suggestions = {
      context: [
        '添加项目背景信息（如"我们正在开发一个..."）',
        '说明使用的技术栈和版本',
        '提供相关的文件路径或代码片段',
        '描述业务场景和需求背景'
      ],
      instruction: [
        '使用明确的动词（创建、修改、优化、重构）',
        '指定具体的文件、函数或组件名称',
        '如果有多个要求，标明优先级',
        '将复杂任务拆分为步骤'
      ],
      constraints: [
        '指定编程语言和版本',
        '说明代码风格要求',
        '添加性能或安全约束',
        '说明兼容性要求'
      ],
      format: [
        '指定输出格式（完整文件/代码片段/diff）',
        '说明命名规范',
        '是否需要注释或文档',
        '是否需要测试代码'
      ]
    };

    const missing = this.findMissing(prompt, checks);
    const relevant = suggestions[key] || [];
    return missing.length > 0 ? relevant.slice(0, 3) : ['该维度已基本覆盖'];
  }

  getGrade(score) {
    if (score >= 0.9) return { level: 'A+', label: '优秀', color: '🟢' };
    if (score >= 0.8) return { level: 'A', label: '良好', color: '🟢' };
    if (score >= 0.7) return { level: 'B', label: '中等', color: '🟡' };
    if (score >= 0.5) return { level: 'C', label: '需改进', color: '🟠' };
    if (score >= 0.3) return { level: 'D', label: '较差', color: '🔴' };
    return { level: 'F', label: '很差', color: '🔴' };
  }

  generateImproved(prompt, results) {
    let improved = prompt.trim();
    const additions = [];

    for (const [key, result] of Object.entries(results)) {
      if (result.score < 0.6) {
        const dimNames = {
          context: '【上下文】',
          instruction: '【指令】',
          constraints: '【约束】',
          format: '【输出格式】'
        };
        additions.push(\`\${dimNames[key] || ''} 请补充：\${result.missing.join('、')}\`);
      }
    }

    if (additions.length > 0) {
      improved += '\\n\\n--- 优化建议（请补充以下信息） ---\\n' + additions.join('\\n');
    }

    return improved;
  }

  visualize(results) {
    const maxBarLength = 40;
    let output = '\\n📊 提示词质量分析报告\\n';
    output += '═'.repeat(60) + '\\n\\n';

    for (const [key, result] of Object.entries(results)) {
      const filled = Math.round(result.score * maxBarLength);
      const empty = maxBarLength - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      const percentage = Math.round(result.score * 100);
      output += \`\${result.name} [权重: \${Math.round(result.weight * 100)}%]\\n\`;
      output += \`\${bar} \${percentage}%\\n\`;
      output += \`缺失项: \${result.missing.join(', ') || '无'}\\n\`;
      if (result.suggestions && result.suggestions.length > 0 && result.suggestions[0] !== '该维度已基本覆盖') {
        output += \`💡 建议: \${result.suggestions.slice(0, 2).join(' | ')}\\n\`;
      }
      output += '\\n';
    }

    return output;
  }
}

// ============ 测试用例 ============

const analyzer = new PromptAnalyzer();

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║       提示词优化引擎 - Prompt Refinement Engine      ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');

// 测试1：模糊提示词
const badPrompt1 = '写一个登录功能';
console.log('📝 原始提示词:', badPrompt1);
const result1 = analyzer.analyze(badPrompt1);
console.log(analyzer.visualize(result1.dimensionResults));
console.log(\`🏆 综合评分: \${result1.overallScore}/100 等级: \${result1.grade.color} \${result1.grade.level} (\${result1.grade.label})\\n\`);
console.log('📋 改进建议:\\n' + result1.improvedPrompt);
console.log('\\n' + '─'.repeat(60) + '\\n');

// 测试2：中等质量提示词
const mediumPrompt = \`使用React写一个用户列表组件，支持分页\`;
console.log('📝 原始提示词:', mediumPrompt);
const result2 = analyzer.analyze(mediumPrompt);
console.log(analyzer.visualize(result2.dimensionResults));
console.log(\`🏆 综合评分: \${result2.overallScore}/100 等级: \${result2.grade.color} \${result2.grade.level} (\${result2.grade.label})\\n\`);
console.log('📋 改进建议:\\n' + result2.improvedPrompt);
console.log('\\n' + '─'.repeat(60) + '\\n');

// 测试3：高质量提示词
const goodPrompt = \`我们正在开发一个Next.js 14 + TypeScript的企业管理系统。请创建 src/components/UserList.tsx 组件，要求：
1. 使用Ant Design 5.x的Table组件
2. 支持服务端分页、排序和筛选
3. 使用React Query进行数据获取
4. 遵循项目的ESLint配置
5. 组件props使用TypeScript接口定义
6. 添加加载状态和空数据状态处理
7. 以完整的.tsx文件形式输出，包含所有必要的import\`;
console.log('📝 原始提示词:', goodPrompt.substring(0, 60) + '...');
const result3 = analyzer.analyze(goodPrompt);
console.log(analyzer.visualize(result3.dimensionResults));
console.log(\`🏆 综合评分: \${result3.overallScore}/100 等级: \${result3.grade.color} \${result3.grade.level} (\${result3.grade.label})\\n\`);

// 对比总结
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║                   📊 对比总结                        ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');
console.log(\`提示词1（模糊）: \${result1.overallScore}分 \${result1.grade.level}\`);
console.log(\`提示词2（中等）: \${result2.overallScore}分 \${result2.grade.level}\`);
console.log(\`提示词3（优质）: \${result3.overallScore}分 \${result3.grade.level}\`);
console.log('\\n💡 关键发现：添加明确的上下文、约束和输出格式，可以显著提升提示词质量。');
console.log('   每次编写提示词时，请检查四个维度是否都有覆盖！');
`
  },
  {
    id: "structured-prompt",
    icon: "📋",
    group: "提示词工程",
    title: "结构化提示词：角色、任务、约束、输出格式",
    content: `
# 第7章：结构化提示词——角色、任务、约束、输出格式

## 7.1 为什么需要结构化提示词？

在上一章中，我们学习了提示词工程的四个核心要素。本章将深入探讨如何将这些要素组织成一个结构化的框架，让你能够系统性地构建高质量的提示词。

结构化提示词就像编程中的函数签名——它定义了输入、输出和行为边界。一个结构化的提示词让AI能够准确理解你的意图，减少误解和返工。

### 7.1.1 非结构化 vs 结构化对比

**非结构化提示词**：
\`\`\`
帮我优化这段代码，让它跑得更快。还有，代码风格也改一下，另外加一些错误处理。哦对了，还要写测试。
\`\`\`

**问题**：
- 信息混乱，没有优先级
- 要求模糊（"更快"是多少？）
- 缺少上下文
- 没有输出格式

**结构化提示词**：
\`\`\`
【角色】你是一位专注于Node.js性能优化的高级工程师

【任务】优化 src/services/dataProcessor.ts 的性能

【背景】
- 当前处理100万条数据需要45秒
- 目标：降低到10秒以内
- 运行环境：Node.js 20 LTS，8核CPU，16GB内存

【约束】
1. 使用Worker Threads进行并行处理
2. 保持现有API接口不变
3. 不引入超过2个新的npm依赖
4. 代码需通过ESLint和Prettier检查
5. 添加JSDoc注释

【输出格式】
1. 性能瓶颈分析（列出top 3瓶颈）
2. 优化方案说明
3. 完整的优化后代码
4. 性能测试方法
\`\`\`

## 7.2 角色定义（Role Definition）

角色定义是结构化提示词的第一个要素。通过为AI设定一个明确的角色，你可以引导AI以特定的视角、知识水平和思维模式来回答问题。

### 7.2.1 为什么要定义角色？

1. **激活领域知识**：AI在特定角色下会调用更相关的知识
2. **设定专业水平**：明确经验年限和专长领域
3. **引导思维模式**：不同角色有不同的思考方式
4. **建立话语风格**：技术总监和初级开发者的表达方式不同

### 7.2.2 常见角色模板

#### 高级开发者角色

\`\`\`
【角色】你是一位拥有10年经验的TypeScript全栈开发者
- 精通React、Next.js、Node.js生态系统
- 熟悉设计模式、SOLID原则和函数式编程
- 注重代码质量、可维护性和性能优化
- 习惯编写清晰的类型定义和文档
\`\`\`

#### 代码审查者角色

\`\`\`
【角色】你是一位严格的代码审查者（Code Reviewer）
- 关注代码的安全性、性能和可维护性
- 熟悉OWASP Top 10安全风险
- 注重代码的可读性和团队协作规范
- 提供建设性的改进建议，而非单纯批评
\`\`\`

#### 架构师角色

\`\`\`
【角色】你是一位系统架构师
- 擅长微服务架构设计
- 熟悉分布式系统的CAP理论
- 关注系统的可扩展性和容错性
- 能够权衡技术选型的利弊
\`\`\`

#### 测试工程师角色

\`\`\`
【角色】你是一位专注于质量的测试工程师
- 精通单元测试、集成测试和端到端测试
- 熟悉Jest、Vitest、Playwright等测试框架
- 注重测试覆盖率和边界条件
- 习惯使用TDD（测试驱动开发）方法
\`\`\`

#### 技术文档撰写者角色

\`\`\`
【角色】你是一位技术文档撰写专家
- 擅长用清晰的语言解释复杂概念
- 熟悉API文档、README、架构文档的编写规范
- 注重文档的结构化和可搜索性
- 提供代码示例和最佳实践
\`\`\`

### 7.2.3 角色定义的最佳实践

| 维度 | 说明 | 示例 |
|------|------|------|
| 专业领域 | 明确技术栈和专长 | "React/TypeScript全栈开发者" |
| 经验年限 | 设定经验水平 | "拥有8年Web开发经验" |
| 思维模式 | 引导思考方式 | "注重代码可维护性和团队协作" |
| 工具偏好 | 指定工具生态 | "熟悉Vite、Vitest和pnpm" |
| 价值观 | 引导决策方向 | "优先考虑代码简洁性和可读性" |

## 7.3 任务定义（Task Definition）

任务是结构化提示词的核心。一个好的任务定义应该遵循SMART原则：

### 7.3.1 SMART任务定义

| 原则 | 含义 | 检查问题 |
|------|------|----------|
| S - Specific | 具体的 | 任务是否明确到具体文件/函数/功能？ |
| M - Measurable | 可衡量的 | 如何判断任务是否完成？ |
| A - Achievable | 可实现的 | 任务是否在AI的能力范围内？ |
| R - Relevant | 相关的 | 任务是否与目标一致？ |
| T - Time-bound | 有时限的 | 是否有明确的完成标准？ |

### 7.3.2 任务分解策略

对于复杂任务，应该将其分解为子任务：

**复杂任务示例**：
\`\`\`
【任务】为电商系统创建完整的订单管理模块
\`\`\`

**分解后的任务**：
\`\`\`
【任务】为电商系统创建订单管理模块，按以下步骤完成：

步骤1：数据模型设计
- 创建Order、OrderItem、OrderStatus类型定义
- 设计数据库schema（Prisma）
- 定义订单状态转换规则

步骤2：API路由实现
- POST /api/orders - 创建订单
- GET /api/orders - 查询订单列表（支持分页、筛选、排序）
- GET /api/orders/:id - 获取订单详情
- PATCH /api/orders/:id/status - 更新订单状态
- DELETE /api/orders/:id - 取消订单

步骤3：业务逻辑实现
- 库存校验与扣减
- 价格计算（含优惠券和折扣）
- 订单状态机
- 事务处理

步骤4：前端组件
- 订单列表页（含搜索和筛选）
- 订单详情页
- 订单状态时间线
- 订单操作按钮组
\`\`\`

### 7.3.3 任务优先级矩阵

当有多个任务时，使用优先级矩阵帮助AI理解：

| 优先级 | 标签 | 含义 |
|--------|------|------|
| P0 | 必须完成 | 核心功能，不可省略 |
| P1 | 应该完成 | 重要但非必需 |
| P2 | 可以完成 | 锦上添花的功能 |
| P3 | 不必完成 | 明确不需要的 |

## 7.4 约束类型详解

约束是结构化提示词中最容易被忽视但极其重要的部分。

### 7.4.1 约束分类

#### 技术约束

| 类型 | 示例 |
|------|------|
| 语言版本 | "使用TypeScript 5.0+，strict模式" |
| 框架版本 | "Next.js 14 App Router，不使用Pages Router" |
| 运行时 | "Node.js 20 LTS，不使用实验性API" |
| 依赖限制 | "不引入新的npm依赖，使用项目已有的lodash" |

#### 代码风格约束

| 类型 | 示例 |
|------|------|
| 命名规范 | "变量使用camelCase，组件使用PascalCase" |
| 文件组织 | "每个组件一个文件，导出使用named export" |
| 注释规范 | "公共API使用JSDoc，内部函数使用行注释" |
| 代码长度 | "每个函数不超过50行，每个文件不超过300行" |

#### 性能约束

| 类型 | 示例 |
|------|------|
| 渲染性能 | "避免不必要的re-render，使用React.memo和useMemo" |
| 网络性能 | "使用数据预取和缓存策略" |
| 包体积 | "bundle大小增加不超过5KB（gzipped）" |
| 内存使用 | "避免内存泄漏，及时清理定时器和事件监听" |

#### 安全约束

| 类型 | 示例 |
|------|------|
| 输入验证 | "所有用户输入使用zod进行验证" |
| 注入防护 | "使用参数化查询，禁止字符串拼接SQL" |
| XSS防护 | "用户输入内容使用DOMPurify清理" |
| 认证授权 | "敏感操作需要验证用户权限" |

#### 质量约束

| 类型 | 示例 |
|------|------|
| 类型安全 | "禁止使用any，使用unknown替代" |
| 错误处理 | "所有异步操作需要try-catch" |
| 边界条件 | "处理空数组、null、undefined等边界情况" |
| 测试要求 | "核心逻辑需要单元测试，覆盖率>80%" |

### 7.4.2 约束的表述技巧

**不好的约束表述**：
\`\`\`
代码要写得好一点
\`\`\`

**好的约束表述**：
\`\`\`
【约束】
1. 类型安全：禁止使用any类型，所有函数参数和返回值必须有明确的类型标注
2. 错误处理：每个异步函数必须包含try-catch，错误信息需包含上下文
3. 性能：列表渲染使用虚拟滚动（react-window），避免同时渲染超过50个DOM节点
4. 可访问性：所有交互元素需要支持键盘操作，图片需要alt属性
5. 测试：每个导出的函数/组件需要对应的单元测试
\`\`\`

## 7.5 输出格式指定

输出格式的明确程度直接影响AI产出的可用性。

### 7.5.1 常见输出格式

#### 完整代码文件

\`\`\`
【输出格式】完整的.tsx文件，包含：
- 所有必要的import语句
- TypeScript类型定义
- 组件实现
- 默认导出
\`\`\`

#### 代码片段

\`\`\`
【输出格式】仅输出修改的部分：
- 使用注释标明修改位置
- 格式：// 文件: src/components/UserList.tsx, 行: 42-68
\`\`\`

#### 结构化数据

\`\`\`
【输出格式】JSON格式：
{
  "success": boolean,
  "data": {
    "code": "string (优化后的代码)",
    "explanation": "string (修改说明)",
    "tests": "string (测试代码)"
  },
  "metadata": {
    "linesChanged": number,
    "performanceImpact": "string"
  }
}
\`\`\`

#### 分步输出

\`\`\`
【输出格式】按以下顺序输出：
1. 【分析】问题根因分析
2. 【方案】修改方案说明
3. 【代码】修改后的代码
4. 【验证】如何验证修改正确
5. 【风险】潜在风险提示
\`\`\`

### 7.5.2 输出格式模板

\`\`\`
【输出格式模板】

[typescript 代码块]
// ==========================================
// 文件: [文件路径]
// 描述: [功能说明]
// 作者: AI Assistant
// 日期: [生成日期]
// ==========================================

[代码内容]
\`\`\`

## 7.6 实战场景

### 7.6.1 代码生成场景

\`\`\`
【角色】你是一位精通React 18和TypeScript的前端高级工程师

【任务】创建一个可复用的DataTable组件

【背景】
- 项目使用React 18 + TypeScript + Tailwind CSS
- 需要替换现有的多个表格组件
- 当前数据量：通常100-1000条，需要前端分页

【约束】
1. 使用泛型支持任意数据类型
2. 列定义支持自定义渲染函数
3. 支持排序（点击列头升序/降序切换）
4. 支持行选择（单选和多选）
5. 支持自定义空状态和加载状态
6. 不引入新的UI库依赖
7. 所有props使用TypeScript接口定义
8. 使用useCallback和useMemo优化性能

【输出格式】
完整组件文件，包含：
- DataTable.tsx（主组件）
- types.ts（类型定义）
- 使用示例
\`\`\`

### 7.6.2 Bug修复场景

\`\`\`
【角色】你是一位擅长调试React应用的资深开发者

【任务】修复ShoppingCart组件中的数量计算bug

【背景】
- 用户反馈：购物车中修改商品数量后，总价显示不正确
- 复现步骤：添加商品A(¥100)数量2 → 总价¥200；修改数量为3 → 总价仍显示¥200
- 相关文件：src/components/ShoppingCart.tsx, src/hooks/useCart.ts

【错误信息】
---
Warning: Cannot update a component while rendering a different component
---

【代码】
[tsx 代码块]
// ShoppingCart.tsx (简化版)
const [total, setTotal] = useState(0);

function handleQuantityChange(id, newQty) {
  const item = items.find(i => i.id === id);
  item.quantity = newQty; // 直接修改了state
  setTotal(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}
---

【约束】
1. 使用不可变方式更新状态
2. 使用useMemo计算总价（而非手动setTotal）
3. 修复React警告

【输出格式】
1. 问题根因分析
2. 修复后的代码（标明修改位置）
3. 预防类似问题的建议
\`\`\`

### 7.6.3 代码审查场景

\`\`\`
【角色】你是一位严格的代码审查者，专注于React应用的代码质量

【任务】审查 src/components/UserProfile.tsx

【审查维度】
1. 组件设计：是否遵循单一职责原则？
2. 性能：是否存在不必要的重渲染？
3. 类型安全：TypeScript类型使用是否恰当？
4. 错误处理：边界情况是否覆盖？
5. 可访问性：是否符合WCAG 2.1 AA标准？
6. 安全性：是否存在XSS或注入风险？

【输出格式】
\`\`\`
## 代码审查报告

### 总体评分：X/10

### 严重问题（必须修复）
- [文件:行号] 问题描述 + 修复建议

### 改进建议（建议修复）
- [文件:行号] 问题描述 + 改进建议

### 优化建议（可选）
- [文件:行号] 优化建议

### 亮点
- 做得好的地方
\`\`\`
\`\`\`

### 7.6.4 代码重构场景

\`\`\`
【角色】你是一位擅长代码重构的架构师

【任务】重构 src/services/orderService.ts

【背景】
- 当前文件800行，包含订单创建、支付、退款、物流等所有逻辑
- 函数平均长度80行，最长的函数300行
- 缺乏单元测试
- 多个函数存在重复的验证逻辑

【重构目标】
1. 按功能拆分为多个文件（orderCreate, orderPayment, orderRefund, orderLogistics）
2. 提取公共验证逻辑到独立的validator模块
3. 每个函数不超过50行
4. 为每个模块编写单元测试
5. 保持外部API接口不变

【约束】
1. 使用函数式编程风格
2. 使用依赖注入提高可测试性
3. 所有函数使用TypeScript类型标注
4. 错误处理统一使用自定义Error类

【输出格式】
1. 重构后的文件结构
2. 每个文件的核心代码
3. 测试用例
\`\`\`

### 7.6.5 文档编写场景

\`\`\`
【角色】你是一位技术文档撰写专家

【任务】为 src/utils/formatDate.ts 编写JSDoc文档

【要求】
1. 每个函数的功能描述
2. 参数说明（类型、含义、是否可选）
3. 返回值说明
4. 使用示例（至少2个）
5. 注意事项（边界情况、时区处理等）

【输出格式】
完整的JSDoc注释，可直接插入代码中
\`\`\`

### 7.6.6 测试编写场景

\`\`\`
【角色】你是一位TDD实践者，专注于测试质量

【任务】为 src/hooks/useDebounce.ts 编写单元测试

【背景】
- 测试框架：Vitest
- 测试库：@testing-library/react-hooks
- 需要测试的hook：useDebounce(value, delay)

【测试要求】
1. 基本功能：延迟后返回最新值
2. 快速变化：连续变化时只返回最后一次的值
3. 延迟时间：验证实际延迟时间
4. 清理：组件卸载时清除定时器
5. 边界条件：delay为0、负数、undefined
6. 类型安全：不同数据类型的输入

【输出格式】
完整的.test.ts文件，包含所有测试用例
\`\`\`

## 7.7 提示词模板概念

### 7.7.1 什么是提示词模板？

提示词模板是将结构化的提示词抽象为可复用的模板，通过变量替换来适应不同的场景。

### 7.7.2 模板示例

\`\`\`
【角色】你是一位{{role}}，拥有{{years}}年{{domain}}经验

【任务】{{task_description}}

【背景】
- 项目：{{project_name}}
- 技术栈：{{tech_stack}}
- 当前状态：{{current_state}}

【约束】
{{#each constraints}}
{{order}}. {{description}}
{{/each}}

【输出格式】
{{output_format}}
\`\`\`

### 7.7.3 模板变量说明

| 变量 | 类型 | 说明 |
|------|------|------|
| {{role}} | string | AI的角色定位 |
| {{years}} | number | 经验年限 |
| {{domain}} | string | 专业领域 |
| {{task_description}} | string | 任务描述 |
| {{project_name}} | string | 项目名称 |
| {{tech_stack}} | string | 技术栈 |
| {{current_state}} | string | 当前状态 |
| {{constraints}} | array | 约束列表 |
| {{output_format}} | string | 输出格式 |

## 7.8 常见错误与改进

### 错误1：角色与任务不匹配

**错误示例**：
\`\`\`
【角色】你是一位前端UI设计师
【任务】优化数据库查询性能
\`\`\`

**修正**：
\`\`\`
【角色】你是一位数据库性能优化专家
【任务】优化慢查询，将查询时间从5秒降低到500ms以内
\`\`\`

### 错误2：约束互相矛盾

**错误示例**：
\`\`\`
【约束】
1. 使用最新的ES2024特性
2. 兼容IE11
\`\`\`

**修正**：明确技术选型，移除矛盾的约束。

### 错误3：输出格式过于模糊

**错误示例**：
\`\`\`
【输出格式】输出代码
\`\`\`

**修正**：
\`\`\`
【输出格式】
- 文件格式：完整的.tsx文件
- 代码结构：先import，再types，再组件实现，最后export
- 命名规范：组件名使用PascalCase
- 注释要求：每个export的函数需要有JSDoc
\`\`\`

## 7.9 本章小结

结构化提示词是提示词工程从"艺术"走向"工程"的关键一步。通过系统性地定义角色、任务、约束和输出格式，你可以：

1. **提高一致性**：每次使用相同的结构，获得稳定的输出质量
2. **减少返工**：明确的约束和格式减少误解
3. **便于复用**：结构化的提示词更容易模板化
4. **易于协作**：团队成员可以共享和优化提示词模板

记住：好的结构是成功的一半。花5分钟规划提示词结构，可以节省50分钟的调试时间。
`,
    code: `
/**
 * 结构化提示词模板构建器
 * 
 * 功能：
 * 1. 接收参数（角色、任务、约束、格式）
 * 2. 组装为结构化的提示词
 * 3. 支持模板变量替换
 * 4. 提供预设模板
 */

// 预设角色库
const ROLE_LIBRARY = {
  seniorDev: {
    title: '高级开发者',
    description: '你是一位拥有10年经验的TypeScript全栈开发者，精通React、Next.js、Node.js生态系统。熟悉设计模式、SOLID原则和函数式编程。注重代码质量、可维护性和性能优化。',
    expertise: ['TypeScript', 'React', 'Next.js', 'Node.js', '设计模式']
  },
  codeReviewer: {
    title: '代码审查者',
    description: '你是一位严格的代码审查者。关注代码的安全性、性能和可维护性。熟悉OWASP Top 10安全风险。注重代码的可读性和团队协作规范。提供建设性的改进建议。',
    expertise: ['代码审查', '安全审计', '性能分析', '最佳实践']
  },
  architect: {
    title: '系统架构师',
    description: '你是一位系统架构师，擅长微服务架构设计，熟悉分布式系统的CAP理论。关注系统的可扩展性和容错性。能够权衡技术选型的利弊。',
    expertise: ['系统架构', '微服务', '分布式系统', '技术选型']
  },
  tester: {
    title: '测试工程师',
    description: '你是一位专注于质量的测试工程师。精通单元测试、集成测试和端到端测试。熟悉Jest、Vitest、Playwright等测试框架。注重测试覆盖率和边界条件。习惯使用TDD方法。',
    expertise: ['单元测试', '集成测试', 'E2E测试', 'TDD']
  },
  docWriter: {
    title: '技术文档撰写者',
    description: '你是一位技术文档撰写专家。擅长用清晰的语言解释复杂概念。熟悉API文档、README、架构文档的编写规范。注重文档的结构化和可搜索性。',
    expertise: ['技术文档', 'API文档', '架构文档', 'README']
  },
  performanceExpert: {
    title: '性能优化专家',
    description: '你是一位专注于Web性能的优化专家。精通Core Web Vitals、Lighthouse优化、bundle分析。熟悉React性能优化、代码分割、懒加载、缓存策略。',
    expertise: ['性能优化', 'Bundle分析', 'Core Web Vitals', '缓存策略']
  },
  securityExpert: {
    title: '安全专家',
    description: '你是一位应用安全专家。精通OWASP Top 10、CSRF防护、XSS防护、SQL注入防护。熟悉JWT安全实践、OAuth 2.0、CORS配置。',
    expertise: ['Web安全', 'OWASP', '认证授权', '加密']
  }
};

// 预设约束库
const CONSTRAINT_LIBRARY = {
  typescript: '使用TypeScript，strict模式，禁止使用any类型',
  react: '使用React 18+，优先使用函数组件和Hooks',
  nextjs: '使用Next.js 14 App Router，利用Server Components',
  testing: '编写单元测试，使用Vitest + Testing Library',
  performance: '使用useMemo/useCallback优化性能，避免不必要的重渲染',
  security: '验证所有用户输入，防止XSS和注入攻击',
  accessibility: '支持键盘导航，添加ARIA标签，图片提供alt文本',
  documentation: '公共API使用JSDoc注释，复杂逻辑添加行注释',
  errorHandling: '所有异步操作需要错误处理，提供用户友好的错误提示',
  responsive: '支持移动端和桌面端，使用响应式设计',
  cleanCode: '函数不超过50行，单一职责，有意义的变量名',
  noNewDeps: '不引入新的第三方依赖',
  bundleLimit: 'bundle大小增加不超过10KB (gzipped)',
  i18n: '支持国际化，所有文案使用i18n key',
  darkMode: '支持暗色模式，使用CSS变量管理颜色'
};

// 预设输出格式库
const FORMAT_LIBRARY = {
  fullFile: {
    name: '完整文件',
    template: \`完整的文件，包含：
- 所有必要的import语句
- TypeScript类型定义
- 主要实现代码
- 默认导出或命名导出\`
  },
  codeSnippet: {
    name: '代码片段',
    template: \`仅输出修改的代码片段，格式：
// 文件: [文件路径], 行: [起始行]-[结束行]
// 修改说明: [简要说明]\`
  },
  structured: {
    name: '结构化输出',
    template: \`按以下结构输出：
1. 【分析】问题分析
2. 【方案】解决方案
3. 【代码】实现代码
4. 【测试】测试代码
5. 【说明】使用说明\`
  },
  review: {
    name: '审查报告',
    template: \`## 代码审查报告

### 总体评分：X/10

### 严重问题（必须修复）
- [文件:行号] 问题 + 修复建议

### 改进建议（建议修复）
- [文件:行号] 问题 + 改进建议

### 优化建议（可选）
- [文件:行号] 优化建议

### 亮点
- 做得好的地方\`
  },
  diff: {
    name: 'Diff格式',
    template: '以git diff格式输出修改：\\n\`\`\`diff\\n- 删除的行\\n+ 添加的行\\n\`\`\`'
  },
  json: {
    name: 'JSON格式',
    template: \`以JSON格式输出：
{
  "code": "string",
  "explanation": "string",
  "tests": "string",
  "metadata": {
    "filesChanged": ["string"],
    "linesAdded": number,
    "linesRemoved": number
  }
}\`
  }
};

// 提示词模板构建器
class PromptBuilder {
  constructor() {
    this.role = null;
    this.task = null;
    this.background = null;
    this.constraints = [];
    this.outputFormat = null;
    this.customSections = [];
  }

  setRole(roleKey, customDescription = null) {
    if (ROLE_LIBRARY[roleKey]) {
      this.role = {
        key: roleKey,
        ...ROLE_LIBRARY[roleKey],
        customDescription
      };
    } else {
      this.role = {
        key: 'custom',
        title: '自定义角色',
        description: customDescription || '请定义角色',
        expertise: []
      };
    }
    return this;
  }

  setTask(description, priority = 'P0') {
    this.task = { description, priority };
    return this;
  }

  setBackground(info) {
    this.background = info;
    return this;
  }

  addConstraint(constraintKey, customDescription = null) {
    if (CONSTRAINT_LIBRARY[constraintKey]) {
      this.constraints.push({
        key: constraintKey,
        description: CONSTRAINT_LIBRARY[constraintKey],
        custom: false
      });
    } else if (customDescription) {
      this.constraints.push({
        key: 'custom',
        description: customDescription,
        custom: true
      });
    }
    return this;
  }

  addConstraints(constraintKeys) {
    constraintKeys.forEach(key => this.addConstraint(key));
    return this;
  }

  setOutputFormat(formatKey, customTemplate = null) {
    if (FORMAT_LIBRARY[formatKey]) {
      this.outputFormat = {
        key: formatKey,
        ...FORMAT_LIBRARY[formatKey],
        customTemplate
      };
    } else {
      this.outputFormat = {
        key: 'custom',
        name: '自定义格式',
        template: customTemplate || '请指定输出格式'
      };
    }
    return this;
  }

  addCustomSection(title, content) {
    this.customSections.push({ title, content });
    return this;
  }

  build() {
    const sections = [];

    // 角色部分
    if (this.role) {
      sections.push(\`【角色】\${this.role.description}\`);
      if (this.role.expertise && this.role.expertise.length > 0) {
        sections.push(\`专长领域：\${this.role.expertise.join('、')}\`);
      }
    }

    // 任务部分
    if (this.task) {
      sections.push(\`\\n【任务】\${this.task.description}\`);
      if (this.task.priority && this.task.priority !== 'P0') {
        sections.push(\`优先级：\${this.task.priority}\`);
      }
    }

    // 背景部分
    if (this.background) {
      sections.push(\`\\n【背景】\${this.background}\`);
    }

    // 约束部分
    if (this.constraints.length > 0) {
      sections.push('\\n【约束】');
      this.constraints.forEach((c, i) => {
        sections.push(\`\${i + 1}. \${c.description}\`);
      });
    }

    // 输出格式部分
    if (this.outputFormat) {
      sections.push(\`\\n【输出格式】\${this.outputFormat.template}\`);
    }

    // 自定义部分
    this.customSections.forEach(section => {
      sections.push(\`\\n【\${section.title}】\${section.content}\`);
    });

    return sections.join('\\n');
  }

  reset() {
    this.role = null;
    this.task = null;
    this.background = null;
    this.constraints = [];
    this.outputFormat = null;
    this.customSections = [];
    return this;
  }

  getStats() {
    return {
      hasRole: !!this.role,
      hasTask: !!this.task,
      hasBackground: !!this.background,
      constraintCount: this.constraints.length,
      hasOutputFormat: !!this.outputFormat,
      customSectionCount: this.customSections.length,
      completeness: this.calculateCompleteness()
    };
  }

  calculateCompleteness() {
    let score = 0;
    const weights = {
      role: 20,
      task: 30,
      background: 15,
      constraints: 20,
      outputFormat: 15
    };

    if (this.role) score += weights.role;
    if (this.task) score += weights.task;
    if (this.background) score += weights.background;
    if (this.constraints.length > 0) {
      score += Math.min(weights.constraints, this.constraints.length * 5);
    }
    if (this.outputFormat) score += weights.outputFormat;

    return Math.min(100, score);
  }
}

// ============ 测试用例 ============

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║    结构化提示词模板构建器 - Prompt Template Builder   ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');

const builder = new PromptBuilder();

// 测试1：代码生成场景
console.log('📋 场景1：代码生成 - React组件\\n');
const codeGenPrompt = builder
  .setRole('seniorDev')
  .setTask('创建一个可复用的SearchInput组件，支持防抖输入、搜索建议下拉、键盘导航')
  .setBackground('项目使用React 18 + TypeScript + Tailwind CSS，需要替换现有的搜索输入框')
  .addConstraints(['typescript', 'react', 'performance', 'accessibility', 'cleanCode'])
  .setOutputFormat('fullFile')
  .build();

console.log(codeGenPrompt);
console.log('\\n📊 完整度:', builder.getStats().completeness + '%');
console.log('\\n' + '═'.repeat(60) + '\\n');

// 测试2：代码审查场景
builder.reset();
console.log('📋 场景2：代码审查\\n');
const reviewPrompt = builder
  .setRole('codeReviewer')
  .setTask('审查 src/components/DataTable.tsx 的代码质量')
  .setBackground('该组件是项目中使用最频繁的组件之一，被50+个页面使用，需要确保其稳定性和性能')
  .addConstraints(['security', 'performance', 'accessibility', 'typescript'])
  .setOutputFormat('review')
  .build();

console.log(reviewPrompt);
console.log('\\n📊 完整度:', builder.getStats().completeness + '%');
console.log('\\n' + '═'.repeat(60) + '\\n');

// 测试3：重构场景
builder.reset();
console.log('📋 场景3：代码重构\\n');
const refactorPrompt = builder
  .setRole('architect')
  .setTask('重构 src/services/orderService.ts，将800行的单体文件按功能拆分为多个模块')
  .setBackground('当前文件包含订单创建、支付、退款、物流等所有逻辑，函数平均80行，缺乏测试')
  .addConstraint('cleanCode')
  .addConstraint('typescript')
  .addConstraint('testing')
  .addConstraint('errorHandling')
  .addConstraint('documentation')
  .setOutputFormat('structured')
  .build();

console.log(refactorPrompt);
console.log('\\n📊 完整度:', builder.getStats().completeness + '%');
console.log('\\n' + '═'.repeat(60) + '\\n');

// 测试4：自定义场景
builder.reset();
console.log('📋 场景4：自定义 - API设计\\n');
const customPrompt = builder
  .setRole('architect')
  .setTask('为电商系统设计RESTful API接口规范')
  .setBackground('新项目，需要从零开始设计API规范。预期用户量：10万DAU')
  .addConstraint('security')
  .addConstraint('typescript')
  .addConstraint('documentation')
  .addCustomSection('技术要求', '使用Next.js 14 API Routes，Prisma ORM，PostgreSQL')
  .addCustomSection('参考', '参考Stripe API设计风格')
  .setOutputFormat('structured')
  .build();

console.log(customPrompt);
console.log('\\n📊 完整度:', builder.getStats().completeness + '%');
console.log('\\n' + '═'.repeat(60) + '\\n');

// 可用角色和约束展示
console.log('📚 可用角色库：');
Object.entries(ROLE_LIBRARY).forEach(([key, role]) => {
  console.log(\`  \${key}: \${role.title} (\${role.expertise.slice(0, 3).join(', ')})\`);
});

console.log('\\n📚 可用约束类型：');
Object.entries(CONSTRAINT_LIBRARY).forEach(([key, desc]) => {
  console.log(\`  \${key}: \${desc.substring(0, 50)}...\`);
});

console.log('\\n📚 可用输出格式：');
Object.entries(FORMAT_LIBRARY).forEach(([key, format]) => {
  console.log(\`  \${key}: \${format.name}\`);
});

console.log('\\n✅ 提示词模板构建器演示完成！');
console.log('💡 使用 builder.setRole().setTask().addConstraints().setOutputFormat().build() 构建结构化提示词');
`
  },
  {
    id: "context-engineering",
    icon: "🔗",
    group: "提示词工程",
    title: "上下文工程：如何给AI足够的背景信息",
    content: `
# 第8章：上下文工程——如何给AI足够的背景信息

## 8.1 什么是上下文工程？

上下文工程（Context Engineering）是提示词工程的高级阶段，专注于如何高效地为AI提供背景信息。如果说提示词工程是"说什么"，上下文工程就是"提供什么素材"。

在AI编程中，上下文的质量往往比提示词本身更重要。一个简单的提示词加上丰富的上下文，可能比一个精心设计的提示词但缺乏上下文产生更好的结果。

### 8.1.1 上下文工程的核心挑战

1. **上下文窗口限制**：每个AI模型都有最大token限制（如Claude 200K，GPT-4 128K）
2. **信息密度**：如何用有限的token传递最多的有效信息
3. **信息相关性**：如何筛选出与当前任务最相关的信息
4. **信息组织结构**：如何组织信息让AI更容易理解

### 8.1.2 上下文的价值

| 有充分上下文 | 缺乏上下文 |
|-------------|-----------|
| AI理解项目整体架构 | AI只能基于局部信息猜测 |
| 生成的代码风格一致 | 代码风格可能与项目不一致 |
| 减少反复澄清 | 需要多次来回沟通 |
| 能正确处理边界情况 | 容易遗漏边界条件 |
| 可以复用现有代码 | 可能重复造轮子 |

## 8.2 上下文的类型

### 8.2.1 项目上下文

项目上下文提供了代码所在环境的全局视图。

**应该包含的信息**：

\`\`\`
项目名称：e-commerce-platform
项目类型：B2C电商平台
代码仓库：monorepo (使用Turborepo管理)
主要模块：
  - apps/web: Next.js前端应用
  - apps/admin: 管理后台
  - packages/shared: 共享类型和工具
  - packages/ui: 共享UI组件库
包管理器：pnpm 8.x
Node版本：20 LTS
\`\`\`

### 8.2.2 文件上下文

文件上下文提供当前工作文件及其相关文件的信息。

**应该包含的信息**：

\`\`\`
当前文件：src/components/ProductCard.tsx
文件作用：商品卡片组件，用于商品列表和搜索结果
文件大小：150行
相关文件：
  - src/types/product.ts: Product类型定义
  - src/hooks/useCart.ts: 购物车操作hook
  - src/components/Price.tsx: 价格显示组件
  - src/utils/formatPrice.ts: 价格格式化工具
依赖的第三方库：
  - react 18.2.0
  - @tanstack/react-query 5.0.0
  - tailwindcss 3.4.0
\`\`\`

### 8.2.3 业务上下文

业务上下文解释了代码要实现的业务逻辑。

**应该包含的信息**：

\`\`\`
业务场景：用户下单流程
用户角色：普通用户、VIP用户、企业用户
业务流程：
  1. 用户选择商品加入购物车
  2. 在购物车中确认商品和数量
  3. 选择收货地址和支付方式
  4. 提交订单
  5. 支付
  6. 等待发货

业务规则：
  - VIP用户享受9折优惠
  - 满200元免运费
  - 每个用户最多添加50件商品
  - 库存不足时显示"到货通知"
\`\`\`

### 8.2.4 历史上下文

历史上下文记录了代码的演进过程和相关决策。

**应该包含的信息**：

\`\`\`
技术决策记录：
  - 2024-01: 选择Next.js替代CRA（原因：SSR需求）
  - 2024-03: 从Redux迁移到Zustand（原因：减少样板代码）
  - 2024-06: 引入React Query（原因：统一服务端状态管理）

已知问题：
  - ProductCard在Safari下有渲染闪烁问题（#issue-123）
  - 大数据量（>1000项）时筛选性能下降（#issue-456）

重构计划：
  - Q3: 将ProductCard拆分为更小的组件
  - Q4: 迁移到React Server Components
\`\`\`

### 8.2.5 错误上下文

当调试问题时，错误上下文至关重要。

**应该包含的信息**：

\`\`\`
错误信息：
TypeError: Cannot read properties of undefined (reading 'price')
  at ProductCard (src/components/ProductCard.tsx:42:15)
  at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:16348:18)

触发条件：
- 当商品数据中缺少price字段时触发
- 发生在搜索结果页，某些商品是"即将上架"状态

复现步骤：
1. 搜索"新款手机"
2. 在搜索结果中滚动到第3页
3. 观察到白屏和错误
\`\`\`

## 8.3 上下文窗口管理

### 8.3.1 理解上下文窗口

上下文窗口是AI模型一次能"看到"的最大文本量。不同模型有不同的限制：

| 模型 | 上下文窗口 | 约等于 |
|------|-----------|--------|
| GPT-4 Turbo | 128K tokens | ~300页书 |
| GPT-4 | 8K-32K tokens | ~20-80页书 |
| Claude 3 Opus | 200K tokens | ~500页书 |
| Claude 3 Sonnet | 200K tokens | ~500页书 |
| Gemini 1.5 Pro | 1M tokens | ~2500页书 |

### 8.3.2 上下文预算概念

将上下文窗口视为一个"预算"，你需要合理分配：

\`\`\`
总预算：128K tokens

分配策略：
├── 系统提示词：2K (1.5%)
├── 项目上下文：5K (4%)
├── 相关代码文件：30K (23%)
├── 业务上下文：5K (4%)
├── 历史/决策上下文：3K (2%)
├── 用户提示词：3K (2%)
└── 预留输出空间：80K (63.5%)
\`\`\`

### 8.3.3 上下文窗口优化策略

#### 策略1：信息优先级排序

将最重要的信息放在最前面，利用AI对开头和结尾信息更敏感的特性。

\`\`\`
优先级排序：
P0（必须包含）：当前任务相关的代码、错误信息
P1（强烈建议）：项目技术栈、相关类型定义
P2（有帮助）：项目架构、业务逻辑
P3（可选）：历史决策、已知问题
\`\`\`

#### 策略2：信息压缩

将冗长的信息压缩为更紧凑的格式。

**压缩前**：
\`\`\`
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}
\`\`\`

**压缩后**：
\`\`\`
User { id, email, name, avatar?, role:'admin'|'user'|'moderator', status:'active'|'inactive'|'suspended', createdAt, updatedAt, lastLoginAt? }
\`\`\`

#### 策略3：引用而非复制

使用文件路径引用代替完整代码复制。

**不推荐**：
\`\`\`
这是User类型的完整定义：
[粘贴200行类型定义]
\`\`\`

**推荐**：
\`\`\`
User类型定义在 src/types/user.ts（第10-50行），关键字段：id, email, name, role, status
\`\`\`

## 8.4 大型代码库的上下文策略

### 8.4.1 代码分块（Chunking）

将大型代码库分成逻辑块，每次只提供相关的部分。

**分块策略**：

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 按文件分块 | 每个文件作为一个块 | 中等规模项目 |
| 按模块分块 | 相关文件组成一个模块 | 大型monorepo |
| 按功能分块 | 按业务功能组织 | 业务逻辑复杂的项目 |
| 按依赖分块 | 按依赖关系组织 | 耦合度高的代码 |

### 8.4.2 摘要化（Summarization）

为每个模块创建摘要，帮助AI快速理解代码结构。

**模块摘要示例**：
\`\`\`
模块：src/services/order/
功能：订单管理服务
文件数：8个
主要API：
  - createOrder(cart, address, payment) -> Order
  - getOrder(id) -> Order
  - listOrders(filters) -> Order[]
  - cancelOrder(id) -> void
  - refundOrder(id, reason) -> Refund
依赖：CartService, PaymentService, NotificationService
被依赖：AdminOrderController, UserOrderController
\`\`\`

### 8.4.3 相关性过滤

只提供与当前任务相关的上下文。

**相关性判断标准**：
1. 当前任务涉及的文件（直接相关）
2. 被当前文件导入的模块（依赖相关）
3. 导入当前文件的模块（被依赖相关）
4. 相同业务领域的文件（领域相关）
5. 最近修改过的文件（时间相关）

## 8.5 上下文提供技巧

### 8.5.1 文件引用

\`\`\`
请参考以下文件：
- 类型定义：src/types/product.ts（第15-30行定义了Product接口）
- 类似组件：src/components/UserCard.tsx（可作为参考实现）
- 工具函数：src/utils/formatPrice.ts（formatPrice函数）
\`\`\`

### 8.5.2 代码片段

提供最小但完整的代码片段：

\`\`\`
相关代码片段（src/components/ProductList.tsx 第42-68行）：
\`\`\`tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
});

if (isLoading) return <LoadingSkeleton count={8} />;
if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
\`\`\`
\`\`\`

### 8.5.3 依赖信息

\`\`\`
项目依赖（与当前任务相关）：
- react: ^18.2.0
- @tanstack/react-query: ^5.0.0
- zod: ^3.22.0
- tailwindcss: ^3.4.0

可用工具函数（src/utils/）：
- formatDate(date, format) - 日期格式化
- cn(...classes) - className合并（类似clsx）
- apiClient.get/post/put/delete - HTTP客户端封装
\`\`\`

### 8.5.4 项目规范

\`\`\`
项目规范：
- 命名：组件 PascalCase，函数 camelCase，常量 UPPER_SNAKE_CASE
- 文件：每个组件一个文件，测试文件添加.test.tsx后缀
- 导入顺序：React → 第三方库 → 项目模块 → 类型 → 样式
- 组件结构：imports → types → component → exports
- 状态管理：服务端状态用React Query，客户端状态用Zustand
\`\`\`

## 8.6 上下文工程工具

### 8.6.1 IDE内置功能

现代IDE提供了一些辅助上下文工程的工具：

| 工具 | 功能 |
|------|------|
| Cursor Indexing | 自动索引整个代码库，提供语义搜索 |
| Copilot Workspace | 理解项目结构，提供上下文感知的补全 |
| Cody (Sourcegraph) | 基于代码库上下文的AI辅助 |
| Continue.dev | 开源AI编程助手，支持自定义上下文 |

### 8.6.2 上下文管理策略

#### 策略1：渐进式上下文加载

不要一次性提供所有上下文，而是随着对话的深入逐步提供：

\`\`\`
第1轮：提供项目概述和当前任务
第2轮：根据AI的问题提供相关代码片段
第3轮：提供业务规则和边界条件
第4轮：提供历史决策和已知问题
\`\`\`

#### 策略2：上下文锚点

在长对话中，定期重申关键上下文信息：

\`\`\`
【上下文锚点提醒】
- 我们正在开发Next.js 14 + TypeScript的电商平台
- 当前处理的是购物车模块
- 核心约束：不使用Redux，使用Zustand管理状态
\`\`\`

#### 策略3：上下文摘要

在对话转折点，提供上下文的简要摘要：

\`\`\`
【当前进度摘要】
- 已完成：购物车UI组件、添加/删除商品逻辑
- 当前任务：实现购物车价格计算
- 待处理：库存校验、优惠券应用
- 已知问题：商品数量变更后总价计算有延迟
\`\`\`

## 8.7 常见上下文问题与解决

### 问题1：上下文过载

**症状**：AI生成的代码与要求不符，或者遗漏了关键信息

**原因**：一次提供了太多上下文信息，AI无法有效处理

**解决**：
1. 减少同时提供的文件数量
2. 使用摘要代替完整代码
3. 分步提供上下文

### 问题2：上下文不足

**症状**：AI频繁询问项目信息，生成的代码风格不一致

**原因**：缺少必要的项目上下文

**解决**：
1. 提供package.json或项目配置文件
2. 说明项目的技术栈和版本
3. 提供代码风格指南

### 问题3：上下文过时

**症状**：AI引用了不存在的API或已废弃的代码

**原因**：提供的上下文信息已经过时

**解决**：
1. 定期更新上下文信息
2. 使用@符号引用最新代码（IDE功能）
3. 在提示词中说明代码版本

### 问题4：上下文不相关

**症状**：AI关注了次要信息，忽略了关键信息

**原因**：提供的上下文与当前任务关联度低

**解决**：
1. 明确标注哪些信息是重要的
2. 使用"关键信息"标签突出重要内容
3. 移除不相关的上下文

## 8.8 上下文工程的最佳实践

### 8.8.1 上下文准备清单

在向AI提问之前，检查以下信息是否准备：

\`\`\`
□ 项目技术栈（框架、语言、版本）
□ 当前文件路径和作用
□ 相关文件的路径和关键内容
□ 业务逻辑说明
□ 错误信息（如有）
□ 项目规范和命名约定
□ 依赖的第三方库
□ 已知的边界条件
□ 期望的代码风格
□ 相关的类型定义
\`\`\`

### 8.8.2 上下文模板

\`\`\`
## 项目上下文
- 项目：[项目名称和类型]
- 技术栈：[框架、语言、工具]
- 架构：[项目架构概述]

## 文件上下文
- 当前文件：[路径和功能]
- 相关文件：[路径和关系]

## 业务上下文
- 场景：[业务场景描述]
- 规则：[关键业务规则]

## 技术上下文
- 依赖：[关键依赖和版本]
- 约束：[技术限制和要求]

## 任务上下文
- 目标：[要完成什么]
- 输入：[已知的输入条件]
- 期望输出：[期望的结果形式]
\`\`\`

## 8.9 本章小结

上下文工程是AI编程中被低估但至关重要的技能。掌握以下要点：

1. **上下文类型**：项目、文件、业务、历史、错误——每种都有其价值
2. **上下文窗口管理**：合理分配有限token预算
3. **大型代码库策略**：分块、摘要、相关性过滤
4. **提供技巧**：引用、片段、依赖、规范
5. **常见问题**：过载、不足、过时、不相关——都有相应的解决方案

记住：好的上下文让AI从"猜测"变为"理解"。投资于上下文准备，你会获得更高质量的输出。
`,
    code: `
/**
 * 上下文管理器模拟器
 * 
 * 功能：
 * 1. 模拟大型代码库的上下文管理
 * 2. 基于优先级和相关性筛选上下文
 * 3. 上下文预算管理
 * 4. 信息压缩和摘要
 */

// 模拟大型代码库
class CodebaseSimulator {
  constructor() {
    this.files = new Map();
    this.modules = new Map();
    this.dependencies = new Map();
  }

  addFile(path, content, metadata = {}) {
    const tokens = this.estimateTokens(content);
    this.files.set(path, {
      path,
      content,
      tokens,
      metadata: {
        module: metadata.module || 'unknown',
        lastModified: metadata.lastModified || new Date(),
        importance: metadata.importance || 3,
        ...metadata
      }
    });

    // 更新模块信息
    const module = metadata.module || 'unknown';
    if (!this.modules.has(module)) {
      this.modules.set(module, []);
    }
    this.modules.get(module).push(path);
  }

  estimateTokens(content) {
    // 粗略估算：中文约1.5字符/token，英文约4字符/token
    const chineseChars = (content.match(/[\\u4e00-\\u9fff]/g) || []).length;
    const otherChars = content.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }

  getFile(path) {
    return this.files.get(path);
  }

  getModuleFiles(moduleName) {
    return this.modules.get(moduleName) || [];
  }

  search(query) {
    const results = [];
    for (const [path, file] of this.files) {
      if (file.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({ path, relevance: this.calculateRelevance(file, query) });
      }
    }
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  calculateRelevance(file, query) {
    const content = file.content.toLowerCase();
    const q = query.toLowerCase();
    let score = 0;

    // 文件名匹配
    if (file.path.toLowerCase().includes(q)) score += 5;

    // 内容匹配次数
    const matches = (content.match(new RegExp(q, 'g')) || []).length;
    score += Math.min(matches, 10);

    // 重要性加权
    score += file.metadata.importance || 0;

    return score;
  }
}

// 上下文管理器
class ContextManager {
  constructor(codebase, maxTokens = 100000) {
    this.codebase = codebase;
    this.maxTokens = maxTokens;
    this.reservedTokens = maxTokens * 0.3; // 30%预留给AI输出
    this.availableTokens = maxTokens - this.reservedTokens;
    this.contextItems = [];
    this.usedTokens = 0;
  }

  addContextItem(type, content, priority = 3, metadata = {}) {
    const tokens = this.codebase.estimateTokens(content);
    this.contextItems.push({
      type,
      content,
      tokens,
      priority,
      metadata,
      compressed: null
    });
    this.usedTokens += tokens;
    return this;
  }

  addFile(path, priority = 3) {
    const file = this.codebase.getFile(path);
    if (file) {
      this.addContextItem('file', file.content, priority, {
        path: file.path,
        module: file.metadata.module
      });
    }
    return this;
  }

  addModule(moduleName, priority = 2) {
    const files = this.codebase.getModuleFiles(moduleName);
    const summary = this.summarizeModule(moduleName, files);
    this.addContextItem('module_summary', summary, priority, {
      module: moduleName,
      fileCount: files.length
    });
    return this;
  }

  summarizeModule(moduleName, files) {
    const summary = [\`模块: \${moduleName}\`, \`文件数: \${files.length}\`];
    files.forEach(f => {
      const file = this.codebase.getFile(f);
      if (file) {
        summary.push(\`  - \${f} (\${file.tokens} tokens)\`);
      }
    });
    return summary.join('\\n');
  }

  compress() {
    // 压缩策略：对于低优先级的文件内容，只保留摘要
    this.contextItems.sort((a, b) => b.priority - a.priority);

    let currentTokens = 0;
    const kept = [];

    for (const item of this.contextItems) {
      if (currentTokens + item.tokens <= this.availableTokens) {
        kept.push(item);
        currentTokens += item.tokens;
      } else if (item.priority >= 3) {
        // 高优先级但超出的项目，尝试压缩
        const compressed = this.compressContent(item.content);
        const compressedTokens = this.codebase.estimateTokens(compressed);
        if (currentTokens + compressedTokens <= this.availableTokens) {
          item.compressed = compressed;
          item.tokens = compressedTokens;
          kept.push(item);
          currentTokens += compressedTokens;
        }
      }
    }

    this.contextItems = kept;
    this.usedTokens = currentTokens;
    return this;
  }

  compressContent(content) {
    // 压缩策略：移除注释、空行、缩短变量名等
    const lines = content.split('\\n');
    const compressed = lines
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 &&
               !trimmed.startsWith('//') &&
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('*') &&
               !trimmed.startsWith('#');
      })
      .join('\\n');
    return compressed;
  }

  buildContext() {
    this.compress();
    let context = '--- 上下文信息 ---\\n\\n';

    const grouped = {};
    this.contextItems.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });

    for (const [type, items] of Object.entries(grouped)) {
      context += \`## \${type.toUpperCase()}\\n\`;
      items.forEach((item, i) => {
        const label = item.metadata.path || item.metadata.module || \`项目\${i + 1}\`;
        const size = item.compressed ? '[已压缩]' : '';
        context += \`### \${label} \${size} (优先级: \${item.priority})\\n\`;
        context += '\`\`\`\\n';
        context += (item.compressed || item.content).substring(0, 2000);
        if ((item.compressed || item.content).length > 2000) {
          context += '\\n... [内容已截断]';
        }
        context += '\\n\`\`\`\\n\\n';
      });
    }

    return context;
  }

  getStats() {
    return {
      totalItems: this.contextItems.length,
      usedTokens: this.usedTokens,
      availableTokens: this.availableTokens,
      maxTokens: this.maxTokens,
      reservedTokens: this.reservedTokens,
      usagePercent: Math.round((this.usedTokens / this.availableTokens) * 100),
      itemsByType: this.contextItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      itemsByPriority: this.contextItems.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// ============ 模拟代码库 ============

const codebase = new CodebaseSimulator();

// 添加模拟文件
codebase.addFile('src/types/product.ts', \`
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  status?: 'active' | 'inactive' | 'draft';
  sortBy?: 'price' | 'rating' | 'newest' | 'sales';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
\`, { module: 'product', importance: 5 });

codebase.addFile('src/types/user.ts', \`
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  preferences: UserPreferences;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  notifications: NotificationSettings;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}
\`, { module: 'user', importance: 5 });

codebase.addFile('src/components/ProductCard.tsx', \`
// ProductCard.tsx - 商品卡片组件
// 用于商品列表页、搜索结果页、推荐商品展示
// 功能：展示商品图片、名称、价格、评分、操作按钮

import React from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formatPrice';
import { Image } from '@/components/ui/Image';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onFavorite?: (product: Product) => void;
}

export function ProductCard({ product, variant = 'grid', onAddToCart, onFavorite }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discount = isOnSale
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    onAddToCart?.(product);
  };

  return (
    <div className={\\\`product-card product-card--\\\${variant}\\\`}>
      <div className="product-card__image">
        <Image src={product.images[0]} alt={product.name} />
        {isOnSale && <span className="product-card__discount badge">-\\\${discount}%</span>}
      </div>
      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <Rating value={product.rating} count={product.reviewCount} />
        <div className="product-card__price">
          <span className="product-card__price-current">¥{formatPrice(product.price)}</span>
          {isOnSale && (
            <span className="product-card__price-original">¥{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
      <div className="product-card__actions">
        <Button onClick={handleAddToCart} disabled={product.stock === 0}>
          {product.stock === 0 ? '已售罄' : '加入购物车'}
        </Button>
      </div>
    </div>
  );
}
\`, { module: 'product', importance: 4 });

codebase.addFile('src/hooks/useCart.ts', \`
// useCart.ts - 购物车状态管理Hook
// 使用Zustand管理购物车状态
// 功能：添加/删除商品、修改数量、计算总价、清空购物车

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(item => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity, addedAt: new Date() }],
          };
        });
      },
      
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      isInCart: (productId) => {
        return get().items.some(item => item.product.id === productId);
      },
    }),
    { name: 'cart-storage' }
  )
);
\`, { module: 'cart', importance: 5 });

codebase.addFile('src/services/api.ts', \`
// api.ts - HTTP客户端封装
// 基于fetch封装，提供统一的请求/响应处理
// 功能：自动添加认证头、错误处理、请求重试、响应拦截

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, timeout = 10000, retries = 1, ...fetchConfig } = config;

  let url = \\\`\\\${API_BASE_URL}\\\${endpoint}\\\`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += \\\`?\\\${searchParams.toString()}\\\`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchConfig.headers as Record<string, string>),
  };

  // 添加认证token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers['Authorization'] = \\\`Bearer \\\${token}\\\`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          errorData?.message || \\\`HTTP \\\${response.status}\\\`,
          response.status,
          errorData
        );
      }

      if (response.status === 204) return undefined as T;
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export const apiClient = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }),
};

export { ApiError };
\`, { module: 'core', importance: 5 });

codebase.addFile('src/utils/formatPrice.ts', \`
export function formatPrice(price: number, currency = 'CNY'): string {
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(price).replace('CNY', '');
}

export function formatDiscount(original: number, current: number): string {
  const discount = Math.round((1 - current / original) * 100);
  return \\\`-\\\${discount}%\\\`;
}
\`, { module: 'product', importance: 3 });

codebase.addFile('src/components/ProductList.tsx', \`
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, ProductFilter } from '@/types/product';
import { ProductCard } from './ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { apiClient } from '@/services/api';

interface ProductListProps {
  initialFilter?: ProductFilter;
  onProductClick?: (product: Product) => void;
}

export function ProductList({ initialFilter, onProductClick }: ProductListProps) {
  const [filter, setFilter] = useState<ProductFilter>({
    page: 1,
    pageSize: 20,
    sortBy: 'newest',
    sortOrder: 'desc',
    ...initialFilter,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filter],
    queryFn: () => apiClient.get<{ items: Product[]; total: number }>('/products', { params: filter as any }),
  });

  if (isLoading) return <LoadingSkeleton count={8} type="product-card" />;
  if (error) return <ErrorDisplay error={error} onRetry={() => refetch()} />;

  const { items = [], total = 0 } = data || {};

  return (
    <div className="product-list">
      <div className="product-list__grid">
        {items.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            variant="grid"
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="product-list__empty">
          <p>暂无商品</p>
        </div>
      )}
      <Pagination
        current={filter.page || 1}
        pageSize={filter.pageSize || 20}
        total={total}
        onChange={(page) => setFilter(prev => ({ ...prev, page }))}
      />
    </div>
  );
}
\`, { module: 'product', importance: 4 });

codebase.addFile('src/app/api/products/route.ts', \`
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['price', 'rating', 'newest', 'sales']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const where: any = { status: 'active' };
    if (params.category) where.category = params.category;
    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) where.price.gte = params.minPrice;
      if (params.maxPrice) where.price.lte = params.maxPrice;
    }
    if (params.tags) {
      where.tags = { hasSome: params.tags.split(',') };
    }

    const orderBy: any = {};
    if (params.sortBy === 'price') orderBy.price = params.sortOrder || 'asc';
    else if (params.sortBy === 'rating') orderBy.rating = params.sortOrder || 'desc';
    else if (params.sortBy === 'newest') orderBy.createdAt = params.sortOrder || 'desc';
    else if (params.sortBy === 'sales') orderBy.salesCount = params.sortOrder || 'desc';
    else orderBy.createdAt = 'desc';

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ items, total, page: params.page, pageSize: params.pageSize });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '参数验证失败', details: error.errors }, { status: 400 });
    }
    console.error('Products API Error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
\`, { module: 'product', importance: 5 });

// ============ 测试场景 ============

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║       上下文管理器 - Context Manager Simulator        ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');

// 场景1：有限的上下文窗口 - 优先加载最重要内容
console.log('📋 场景1：小型上下文窗口（5000 tokens），优先加载核心文件\\n');

const smallContext = new ContextManager(codebase, 5000);
smallContext
  .addContextItem('project_info', '项目：电商平台 (Next.js 14 + TypeScript)。任务：优化ProductCard组件性能。', 5)
  .addFile('src/types/product.ts', 5)
  .addFile('src/components/ProductCard.tsx', 5)
  .addFile('src/hooks/useCart.ts', 3);

console.log(smallContext.buildContext().substring(0, 1500) + '...\\n');
console.log('📊 上下文统计:', JSON.stringify(smallContext.getStats(), null, 2));
console.log('\\n' + '═'.repeat(60) + '\\n');

// 场景2：中等上下文窗口 - 加载完整模块
console.log('📋 场景2：中等上下文窗口（20000 tokens），加载完整产品模块\\n');

const mediumContext = new ContextManager(codebase, 20000);
mediumContext
  .addContextItem('project_info', '项目：电商平台。任务：审查产品模块的代码质量和性能。', 5)
  .addModule('product', 4)
  .addFile('src/types/product.ts', 5)
  .addFile('src/components/ProductCard.tsx', 5)
  .addFile('src/components/ProductList.tsx', 4)
  .addFile('src/app/api/products/route.ts', 5)
  .addFile('src/hooks/useCart.ts', 3)
  .addFile('src/services/api.ts', 3);

console.log(mediumContext.buildContext().substring(0, 2000) + '...\\n');
console.log('📊 上下文统计:', JSON.stringify(mediumContext.getStats(), null, 2));
console.log('\\n' + '═'.repeat(60) + '\\n');

// 场景3：大型上下文窗口 - 完整项目上下文
console.log('📋 场景3：大型上下文窗口（50000 tokens），完整项目上下文\\n');

const largeContext = new ContextManager(codebase, 50000);
largeContext
  .addContextItem('project_info', '项目：电商平台。任务：全面代码审查和优化建议。', 5)
  .addModule('product', 4)
  .addModule('user', 4)
  .addModule('cart', 4)
  .addModule('core', 4);

// 添加所有文件
for (const [path] of codebase.files) {
  largeContext.addFile(path, 3);
}

console.log(largeContext.buildContext().substring(0, 3000) + '...\\n');
console.log('📊 上下文统计:', JSON.stringify(largeContext.getStats(), null, 2));
console.log('\\n' + '═'.repeat(60) + '\\n');

// 场景4：搜索相关上下文
console.log('📋 场景4：基于搜索的上下文筛选（搜索"price"相关文件）\\n');

const searchResults = codebase.search('price');
console.log('🔍 搜索"price"的结果：');
searchResults.forEach(r => {
  console.log(\`  \${r.path} (相关性: \${r.relevance})\`);
});

const searchContext = new ContextManager(codebase, 10000);
searchContext.addContextItem('task', '任务：修复价格计算相关bug', 5);
searchResults.forEach(r => {
  searchContext.addFile(r.path, r.relevance >= 4 ? 5 : 3);
});

console.log('\\n📊 搜索上下文统计:', JSON.stringify(searchContext.getStats(), null, 2));
console.log('\\n' + '═'.repeat(60) + '\\n');

// 总结
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║                   📊 上下文管理总结                    ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');

console.log('代码库统计：');
console.log(\`  总文件数: \${codebase.files.size}\`);
console.log(\`  总模块数: \${codebase.modules.size}\`);
let totalTokens = 0;
codebase.files.forEach(f => totalTokens += f.tokens);
console.log(\`  总token数: \${totalTokens}\`);

console.log('\\n三个上下文管理策略对比：');
console.log(\`  小型窗口 (5000): \${smallContext.getStats().totalItems}项, \${smallContext.getStats().usedTokens}tokens\`);
console.log(\`  中型窗口 (20000): \${mediumContext.getStats().totalItems}项, \${mediumContext.getStats().usedTokens}tokens\`);
console.log(\`  大型窗口 (50000): \${largeContext.getStats().totalItems}项, \${largeContext.getStats().usedTokens}tokens\`);

console.log('\\n💡 关键原则：');
console.log('  1. 根据上下文窗口大小选择合适的文件数量');
console.log('  2. 高优先级文件（类型定义、核心组件）优先加载');
console.log('  3. 使用模块摘要代替完整文件内容');
console.log('  4. 基于搜索相关性筛选上下文');
console.log('  5. 始终预留30%的token空间给AI输出');
`
  },
  {
    id: "iterative-prompt",
    icon: "🔄",
    group: "提示词工程",
    title: "迭代优化：从第一版到最终版",
    content: `
# 第9章：迭代优化——从第一版到最终版

## 9.1 为什么迭代是不可避免的？

在AI编程中，极少有"一次就完美"的提示词。即使是经验丰富的提示词工程师，也需要经过多轮迭代才能得到理想的结果。这不是能力的缺陷，而是AI交互的本质特征。

### 9.1.1 迭代的现实

| 任务复杂度 | 典型迭代次数 | 说明 |
|-----------|-------------|------|
| 简单（单一函数） | 1-2轮 | 基本功能正确，微调细节 |
| 中等（组件/模块） | 2-4轮 | 需要调整设计、添加边界处理 |
| 复杂（系统/架构） | 4-8轮 | 需要多轮澄清和优化 |
| 极复杂（全新系统） | 8+轮 | 需要分步构建，逐步完善 |

### 9.1.2 迭代的价值

每次迭代不仅是修正错误，更是：

1. **深化理解**：通过与AI的对话，你可能会发现自己对需求的理解也在深化
2. **发现盲点**：AI的输出可能揭示你之前没想到的边界情况
3. **优化设计**：AI可能提出更好的实现方案
4. **知识积累**：每次迭代都是学习AI能力和局限的机会

## 9.2 迭代循环：Draft → Review → Refine → Repeat

### 9.2.1 迭代循环图

\`\`\`
┌─────────────────────────────────────────────────┐
│                  迭代循环                         │
│                                                  │
│    ┌──────────┐                                  │
│    │  Draft   │ ← 编写/修改提示词                  │
│    │  草稿    │                                  │
│    └────┬─────┘                                  │
│         │                                        │
│         ▼                                        │
│    ┌──────────┐                                  │
│    │  Review  │ ← 审查AI输出                      │
│    │  审查    │    • 功能是否正确？                │
│    └────┬─────┘    • 代码是否可用？                │
│         │          • 风格是否一致？                │
│         ▼          • 性能是否达标？                │
│    ┌──────────┐                                  │
│    │  Refine  │ ← 优化提示词                      │
│    │  优化    │    • 添加约束                     │
│    └────┬─────┘    • 提供反例                     │
│         │          • 调整期望                     │
│         │                                        │
│         └──→ 满足要求？──→ 是 ──→ 完成！          │
│                  │                               │
│                 否                               │
│                  │                               │
│                  └──→ 回到 Draft                  │
└─────────────────────────────────────────────────┘
\`\`\`

### 9.2.2 审查清单（Review Checklist）

每次收到AI输出后，使用以下清单进行系统性审查：

\`\`\`
功能审查：
□ 是否实现了所有要求的功能？
□ 输入参数是否正确处理？
□ 返回值是否符合预期？
□ 边界情况是否覆盖？
□ 错误处理是否完善？

代码质量审查：
□ 代码风格是否与项目一致？
□ 命名是否清晰有意义？
□ 是否有不必要的复杂度？
□ 是否有重复代码？
□ 类型标注是否完整？

性能审查：
□ 是否有明显的性能问题？
□ 是否使用了合适的缓存策略？
□ 是否有不必要的计算？

安全审查：
□ 是否有明显的安全漏洞？
□ 用户输入是否经过验证？
□ 敏感信息是否妥善处理？

可维护性审查：
□ 代码是否易于理解？
□ 是否有适当的注释？
□ 是否遵循了项目的设计模式？
\`\`\`

## 9.3 优化技巧详解

### 9.3.1 添加约束

当AI的输出不符合预期时，添加更具体的约束。

**迭代前**：
\`\`\`
创建一个用户列表组件
\`\`\`

**AI输出**：生成了一个基本的列表，但没有分页、没有搜索、没有加载状态。

**迭代后**：
\`\`\`
创建一个用户列表组件，具体要求：
1. 支持分页（每页20条）
2. 支持搜索（按姓名和邮箱搜索）
3. 显示加载状态（骨架屏）
4. 显示空状态（无数据时的提示）
5. 显示错误状态（加载失败时的重试按钮）
6. 使用React Query进行数据获取
7. 使用TypeScript，所有props需要类型定义
\`\`\`

### 9.3.2 提供反例

明确告诉AI"不要做什么"。

**示例**：
\`\`\`
创建用户列表组件时：
- 不要使用any类型
- 不要在组件内直接发起fetch请求（使用React Query）
- 不要使用内联样式（使用Tailwind CSS）
- 不要忽略加载和错误状态
- 不要使用class组件（使用函数组件）
- 不要在渲染中直接修改props
\`\`\`

### 9.3.3 提供边缘情况

列出需要考虑的边缘情况，帮助AI更全面地思考。

**示例**：
\`\`\`
请考虑以下边缘情况：
1. 列表为空时显示什么？
2. 数据加载失败时如何处理？
3. 用户快速切换页码时如何处理？
4. 搜索关键词为空时如何处理？
5. 搜索结果为空时显示什么？
6. 网络断开时如何处理？
7. 数据超过10000条时分页如何优化？
8. 移动端如何展示？
\`\`\`

### 9.3.4 提供替代方案

要求AI提供多个实现方案，然后选择最优的。

**示例**：
\`\`\`
请提供3种不同的实现方案：
1. 方案A：使用React Query + 服务端分页
2. 方案B：使用SWR + 前端分页
3. 方案C：使用自定义Hook + 虚拟滚动

对每种方案说明：
- 适用场景
- 优缺点
- 性能特征
- 推荐指数（1-5星）
\`\`\`

### 9.3.5 对话式迭代

当AI的输出有问题时，用对话的方式指出问题并请求修正。

**示例**：
\`\`\`
你生成的代码存在以下问题：
1. ProductCard组件中，onClick事件没有阻止冒泡，可能导致意外行为
2. useCart hook中，addToCart函数没有检查库存
3. API路由中，没有对page参数做上限限制

请逐一修复这些问题，并说明每个修复的原因。
\`\`\`

## 9.4 何时重启 vs 继续优化

### 9.4.1 继续优化的信号

以下情况应该继续优化现有对话：

| 信号 | 操作 |
|------|------|
| 输出基本正确，只有小问题 | 指出具体问题，请求修正 |
| 输出方向正确，但细节不足 | 添加具体约束 |
| 输出有1-2个明显错误 | 指出错误，请求修复 |
| 输出风格不一致 | 提供风格指南 |
| 缺少边界处理 | 列出边缘情况 |

### 9.4.2 重新开始的信号

以下情况应该重新开始一个新对话：

| 信号 | 原因 |
|------|------|
| 输出方向完全错误 | 初始提示词有根本性误解 |
| 经过3轮以上迭代仍不满意 | 对话可能进入了"死胡同" |
| AI开始"幻觉"编造API | 上下文可能已被污染 |
| 对话变得很长（>20轮） | 上下文窗口可能已满 |
| 需求发生了重大变化 | 原始上下文已不适用 |
| 需要完全不同的技术方案 | 重新开始更高效 |

### 9.4.3 重启的最佳实践

如果决定重启，应该：

1. **总结教训**：从前一轮对话中总结出有效的提示词模式
2. **优化初始提示词**：将前一轮中有效的约束整合到新的初始提示词中
3. **提供参考**：如果前一轮的某些输出是好的，可以作为参考提供给新的对话
4. **重新设定上下文**：不要依赖前一轮对话的上下文，重新提供项目信息

## 9.5 案例研究：从模糊需求到生产代码

### 9.5.1 需求描述

假设我们需要一个"商品搜索功能"。这是一个典型的需求——听起来简单，实际上涉及很多细节。

### 9.5.2 迭代过程

#### 第1轮：初始请求

**提示词**：
\`\`\`
创建一个商品搜索功能
\`\`\`

**AI输出**：一个简单的搜索框 + 结果列表，使用useState管理状态。

**审查结果**：
- ❌ 没有防抖处理
- ❌ 没有加载状态
- ❌ 没有空结果处理
- ❌ 没有错误处理
- ❌ 没有搜索建议
- ❌ 没有高亮匹配文本
- ❌ 没有键盘导航

**评分**：2/10

#### 第2轮：添加基本约束

**提示词**：
\`\`\`
创建一个商品搜索功能，要求：
1. 输入框支持防抖（300ms）
2. 显示搜索结果列表
3. 显示加载状态
4. 显示"未找到结果"提示
5. 使用React Query进行数据获取
6. 使用TypeScript
\`\`\`

**AI输出**：改进的搜索组件，添加了防抖和状态处理。

**审查结果**：
- ✅ 防抖处理
- ✅ 加载/空状态
- ❌ 搜索建议列表
- ❌ 键盘导航
- ❌ 高亮匹配文本
- ❌ 搜索历史
- ❌ 最近搜索

**评分**：5/10

#### 第3轮：添加高级功能

**提示词**：
\`\`\`
在现有搜索功能基础上添加：
1. 搜索建议下拉（输入时显示热门搜索词）
2. 键盘导航（上下箭头选择，回车确认，Esc关闭）
3. 搜索文本高亮显示
4. 搜索历史记录（最近5条，存储在localStorage）
5. 点击搜索框外部关闭建议列表
6. 搜索URL同步（搜索结果可通过URL分享）
\`\`\`

**AI输出**：功能丰富的搜索组件。

**审查结果**：
- ✅ 大多数功能正常
- ❌ 搜索建议没有防抖
- ❌ 键盘导航在边界情况下有bug
- ❌ 没有处理并发请求
- ❌ 可访问性（ARIA）不足

**评分**：7/10

#### 第4轮：优化和完善

**提示词**：
\`\`\`
请修复以下问题：
1. 搜索建议也需要防抖（200ms）
2. 键盘导航：当列表为空时，按上下键不应报错
3. 并发请求：使用AbortController取消之前的请求
4. 可访问性：添加aria-label、role属性，支持屏幕阅读器
5. 移动端：在移动端自动聚焦搜索框
6. 搜索分析：每次搜索记录搜索词（用于后续分析）
\`\`\`

**AI输出**：接近生产级别的搜索组件。

**审查结果**：
- ✅ 所有功能正常
- ✅ 边界情况处理完善
- ✅ 可访问性达标
- ❌ 缺少单元测试

**评分**：9/10

#### 第5轮：最终完善

**提示词**：
\`\`\`
请为搜索组件编写单元测试：
1. 基本渲染测试
2. 输入防抖测试
3. 搜索结果渲染测试
4. 键盘导航测试
5. 空结果状态测试
6. 错误状态测试
7. 搜索历史测试
8. 点击外部关闭测试

使用Vitest + Testing Library。
\`\`\`

**最终结果**：功能完整、测试充分、文档齐全的生产级搜索组件。

**评分**：10/10

### 9.5.3 迭代总结

| 轮次 | 主要改进 | 时间投入 | 评分变化 |
|------|----------|----------|----------|
| 第1轮 | 基础实现 | 2分钟 | 2/10 |
| 第2轮 | 添加状态处理 | 3分钟 | 5/10 |
| 第3轮 | 添加高级功能 | 5分钟 | 7/10 |
| 第4轮 | 优化和完善 | 4分钟 | 9/10 |
| 第5轮 | 测试和文档 | 6分钟 | 10/10 |

**总投入**：约20分钟
**总轮次**：5轮
**关键教训**：每轮迭代都应该有明确的改进目标，而不是漫无目的地修改。

## 9.6 提示词版本管理

### 9.6.1 为什么要版本管理提示词？

像管理代码一样管理提示词，这是一个重要的工程实践：

1. **可追溯**：知道哪个版本的提示词产生了什么效果
2. **可回滚**：新版本不理想时可以回退
3. **可共享**：团队成员可以复用和优化提示词
4. **可优化**：基于历史数据持续改进提示词模板

### 9.6.2 提示词版本管理方法

**方法1：Git管理**

将提示词作为代码的一部分存储在Git中：

\`\`\`
prompts/
├── code-generation/
│   ├── react-component.v1.md
│   ├── react-component.v2.md
│   └── react-component.v3.md
├── code-review/
│   ├── security-review.v1.md
│   └── security-review.v2.md
└── templates/
    ├── bug-fix.md
    └── refactor.md
\`\`\`

**方法2：提示词管理工具**

使用专门的提示词管理工具。

**方法3：内嵌版本标记**

在提示词中添加版本和变更日志：

\`\`\`
<!-- prompt-version: 3.2.0 -->
<!-- last-updated: 2024-06-15 -->
<!-- changelog:
  v3.2.0: 添加了性能优化约束
  v3.1.0: 添加了可访问性要求
  v3.0.0: 重构为结构化格式
-->
\`\`\`

## 9.7 从失败中学习

### 9.7.1 常见失败模式

| 失败模式 | 表现 | 根因 | 解决方案 |
|----------|------|------|----------|
| 方向错误 | AI完全误解需求 | 提示词过于模糊 | 提供具体示例 |
| 幻觉 | AI编造不存在的API | 缺少技术栈约束 | 明确技术栈和版本 |
| 过度工程 | AI生成过于复杂的代码 | 没有复杂度约束 | 添加"保持简单"约束 |
| 忽略约束 | AI忽略部分要求 | 约束太多或互相矛盾 | 减少约束，明确优先级 |
| 风格漂移 | 代码风格不一致 | 缺少风格指南 | 提供代码风格参考 |
| 上下文丢失 | 长对话中忘记早期要求 | 上下文窗口限制 | 定期重申关键要求 |

### 9.7.2 失败后的问题诊断

\`\`\`
失败分析框架：

1. 描述问题：AI的输出哪里不符合预期？
2. 分析原因：是提示词的问题还是AI能力的问题？
3. 提出假设：如果修改提示词的X部分，是否会改善？
4. 验证假设：修改提示词，观察结果
5. 记录教训：将有效的修改记录到提示词模板中
\`\`\`

## 9.8 迭代优化的最佳实践

### 9.8.1 迭代前

1. **明确目标**：知道"好"的标准是什么
2. **准备审查清单**：有标准化的审查维度
3. **设定迭代上限**：避免无限循环（如最多5轮）

### 9.8.2 迭代中

1. **每次只改一个方面**：便于定位问题
2. **记录每次修改**：知道什么改变带来了什么效果
3. **保持耐心**：迭代是正常的，不是失败的标志

### 9.8.3 迭代后

1. **总结有效模式**：将成功的提示词模式模板化
2. **更新审查清单**：加入新发现的审查维度
3. **分享经验**：与团队分享迭代中的发现

## 9.9 本章小结

迭代优化是AI编程的核心实践。掌握以下要点：

1. **接受迭代**：完美提示词不是写出来的，是迭代出来的
2. **系统化审查**：使用清单进行全面的输出审查
3. **精准优化**：每次迭代针对特定问题进行改进
4. **知道何时重启**：不是所有问题都值得继续优化
5. **版本管理**：像管理代码一样管理提示词
6. **从失败中学习**：每次失败都是优化提示词的机会

记住：每一次迭代都是向"完美提示词"迈进一步。不追求一次成功，追求持续改进。
`,
    code: `
/**
 * 迭代提示词优化过程模拟器
 * 
 * 功能：
 * 1. 模拟提示词的迭代优化过程
 * 2. 展示每轮迭代的改进
 * 3. 跟踪评分变化
 * 4. 生成优化历史报告
 */

// 提示词迭代模拟器
class PromptIterationSimulator {
  constructor() {
    this.iterations = [];
    this.currentIteration = 0;
  }

  // 模拟提示词质量评分
  evaluatePrompt(prompt) {
    const criteria = {
      clarity: this.scoreClarity(prompt),
      completeness: this.scoreCompleteness(prompt),
      specificity: this.scoreSpecificity(prompt),
      constraints: this.scoreConstraints(prompt),
      format: this.scoreFormat(prompt),
      examples: this.scoreExamples(prompt),
      context: this.scoreContext(prompt)
    };

    const weights = {
      clarity: 0.20,
      completeness: 0.20,
      specificity: 0.15,
      constraints: 0.15,
      format: 0.10,
      examples: 0.10,
      context: 0.10
    };

    let totalScore = 0;
    for (const [key, score] of Object.entries(criteria)) {
      totalScore += score * (weights[key] || 0);
    }

    return {
      criteria,
      totalScore: Math.round(totalScore * 100),
      grade: this.getGrade(totalScore),
      improvementAreas: this.getImprovementAreas(criteria)
    };
  }

  scoreClarity(prompt) {
    let score = 0;
    if (prompt.length > 50) score += 0.3;
    if (/创建|修改|优化|重构|修复|实现/.test(prompt)) score += 0.3;
    if (prompt.includes('\\n') || prompt.includes('\\n')) score += 0.2;
    if (prompt.split(/[，。,.]/).length > 5) score += 0.2;
    return Math.min(1, score);
  }

  scoreCompleteness(prompt) {
    let score = 0;
    if (/背景|项目|技术栈|框架|语言/.test(prompt)) score += 0.25;
    if (/要求|需求|功能/.test(prompt)) score += 0.25;
    if (/限制|约束|不要|禁止|必须/.test(prompt)) score += 0.25;
    if (/输出|格式|返回|文件/.test(prompt)) score += 0.25;
    return Math.min(1, score);
  }

  scoreSpecificity(prompt) {
    let score = 0;
    if (/\\d+/.test(prompt)) score += 0.3; // 包含数字
    if (/文件|路径|src|components|utils/.test(prompt)) score += 0.3;
    if (/TypeScript|JavaScript|React|Next|Node/.test(prompt)) score += 0.2;
    if (/函数|组件|接口|类型|API/.test(prompt)) score += 0.2;
    return Math.min(1, score);
  }

  scoreConstraints(prompt) {
    let score = 0;
    if (/性能|效率|速度|缓存|优化/.test(prompt)) score += 0.25;
    if (/安全|验证|权限|认证/.test(prompt)) score += 0.25;
    if (/风格|规范|命名|格式/.test(prompt)) score += 0.25;
    if (/兼容|浏览器|移动端|响应式/.test(prompt)) score += 0.25;
    return Math.min(1, score);
  }

  scoreFormat(prompt) {
    let score = 0;
    if (/完整.*文件|代码片段|格式|输出/.test(prompt)) score += 0.4;
    if (/import|export|测试|注释/.test(prompt)) score += 0.3;
    if (/步骤|step|首先|然后|最后/.test(prompt)) score += 0.3;
    return Math.min(1, score);
  }

  scoreExamples(prompt) {
    let score = 0;
    if (/例如|示例|比如|参考/.test(prompt)) score += 0.4;
    if (/\\\`\\\`\\\`/.test(prompt)) score += 0.3; // 包含代码块
    if (/输入|输出|期望/.test(prompt)) score += 0.3;
    return Math.min(1, score);
  }

  scoreContext(prompt) {
    let score = 0;
    if (/项目|应用|系统|平台/.test(prompt)) score += 0.3;
    if (/当前|现在|目前|已有/.test(prompt)) score += 0.3;
    if (/之前|历史|曾经|已经/.test(prompt)) score += 0.2;
    if (/问题|bug|错误|issue/.test(prompt)) score += 0.2;
    return Math.min(1, score);
  }

  getGrade(score) {
    if (score >= 0.9) return { level: 'A+', emoji: '🌟' };
    if (score >= 0.8) return { level: 'A', emoji: '✅' };
    if (score >= 0.7) return { level: 'B', emoji: '👍' };
    if (score >= 0.6) return { level: 'C', emoji: '⚠️' };
    if (score >= 0.4) return { level: 'D', emoji: '🔶' };
    return { level: 'F', emoji: '❌' };
  }

  getImprovementAreas(criteria) {
    const areas = [];
    for (const [key, score] of Object.entries(criteria)) {
      if (score < 0.6) {
        areas.push({
          area: key,
          score: Math.round(score * 100),
          suggestion: this.getSuggestion(key)
        });
      }
    }
    return areas.sort((a, b) => a.score - b.score);
  }

  getSuggestion(area) {
    const suggestions = {
      clarity: '使用更明确的动词，添加分步说明',
      completeness: '补充背景信息、技术栈和项目上下文',
      specificity: '添加具体的数字、文件名和技术名称',
      constraints: '添加性能、安全、风格等约束',
      format: '明确指定输出格式和文件结构',
      examples: '提供输入输出示例或参考代码',
      context: '补充项目背景、当前状态和历史决策'
    };
    return suggestions[area] || '需要进一步分析';
  }

  addIteration(round, prompt, improvement) {
    const evaluation = this.evaluatePrompt(prompt);
    this.iterations.push({
      round,
      prompt,
      improvement,
      evaluation,
      timestamp: new Date()
    });
    this.currentIteration = round;
    return evaluation;
  }

  generateReport() {
    let report = '\\n╔══════════════════════════════════════════════════════╗\\n';
    report += '║           提示词迭代优化报告                           ║\\n';
    report += '╚══════════════════════════════════════════════════════╝\\n\\n';

    if (this.iterations.length === 0) {
      report += '暂无迭代记录。\\n';
      return report;
    }

    report += \`总迭代轮次: \${this.iterations.length}\\n\`;
    report += \`起始评分: \${this.iterations[0].evaluation.totalScore}分 \${this.iterations[0].evaluation.grade.emoji}\\n\`;
    report += \`最终评分: \${this.iterations[this.iterations.length - 1].evaluation.totalScore}分 \${this.iterations[this.iterations.length - 1].evaluation.grade.emoji}\\n\`;
    report += \`提升幅度: +\${this.iterations[this.iterations.length - 1].evaluation.totalScore - this.iterations[0].evaluation.totalScore}分\\n\\n\`;

    // 评分趋势图
    report += '📈 评分趋势：\\n';
    this.iterations.forEach((iter, index) => {
      const bar = '█'.repeat(Math.round(iter.evaluation.totalScore / 2));
      report += \`  第\${iter.round}轮: \${bar} \${iter.evaluation.totalScore}分 \${iter.evaluation.grade.emoji}\${iter.evaluation.grade.level}\\n\`;
    });

    report += '\\n📋 详细迭代记录：\\n';
    report += '─'.repeat(50) + '\\n';

    this.iterations.forEach((iter, index) => {
      report += \`\\n第\${iter.round}轮迭代：\\n\`;
      report += \`  改进重点: \${iter.improvement}\\n\`;
      report += \`  提示词: \${iter.prompt.substring(0, 80)}\${iter.prompt.length > 80 ? '...' : ''}\\n\`;
      report += \`  评分: \${iter.evaluation.totalScore}分 (\${iter.evaluation.grade.level})\\n\`;

      const criteriaStr = Object.entries(iter.evaluation.criteria)
        .map(([k, v]) => \`\${k}: \${Math.round(v * 100)}%\`)
        .join(', ');
      report += \`  各维度: \${criteriaStr}\\n\`;

      if (iter.evaluation.improvementAreas.length > 0) {
        report += \`  待改进: \${iter.evaluation.improvementAreas.map(a => a.area).join(', ')}\\n\`;
      }
    });

    report += '\\n💡 优化建议总结：\\n';
    const finalAreas = this.iterations[this.iterations.length - 1].evaluation.improvementAreas;
    if (finalAreas.length === 0) {
      report += '  恭喜！提示词已达到优秀水平！\\n';
    } else {
      finalAreas.forEach(area => {
        report += \`  • \${area.area} (\${area.score}%): \${area.suggestion}\\n\`;
      });
    }

    return report;
  }

  compareIterations(round1, round2) {
    const iter1 = this.iterations.find(i => i.round === round1);
    const iter2 = this.iterations.find(i => i.round === round2);

    if (!iter1 || !iter2) return '迭代轮次不存在';

    let comparison = \`\\n比较第\${round1}轮 vs 第\${round2}轮：\\n\`;
    comparison += \`评分: \${iter1.evaluation.totalScore} → \${iter2.evaluation.totalScore} (\${iter2.evaluation.totalScore - iter1.evaluation.totalScore >= 0 ? '+' : ''}\${iter2.evaluation.totalScore - iter1.evaluation.totalScore})\\n\`;

    comparison += '\\n各维度变化：\\n';
    for (const key of Object.keys(iter1.evaluation.criteria)) {
      const diff = Math.round((iter2.evaluation.criteria[key] - iter1.evaluation.criteria[key]) * 100);
      const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
      comparison += \`  \${key}: \${Math.round(iter1.evaluation.criteria[key] * 100)}% → \${Math.round(iter2.evaluation.criteria[key] * 100)}% (\${arrow}\${Math.abs(diff)}%)\\n\`;
    }

    return comparison;
  }
}

// ============ 模拟迭代过程 ============

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║      迭代提示词优化模拟器 - Iterative Prompt Simulator  ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');

const simulator = new PromptIterationSimulator();

// 模拟5轮迭代优化过程
const iterations = [
  {
    round: 1,
    prompt: '创建一个商品搜索功能',
    improvement: '初始需求，非常模糊'
  },
  {
    round: 2,
    prompt: '创建一个商品搜索功能，要求：1.输入框支持防抖(300ms) 2.显示搜索结果列表 3.显示加载状态 4.显示"未找到结果"提示 5.使用React Query进行数据获取 6.使用TypeScript',
    improvement: '添加了基本约束和状态处理要求'
  },
  {
    round: 3,
    prompt: '在现有搜索功能基础上添加：1.搜索建议下拉 2.键盘导航 3.搜索文本高亮 4.搜索历史(localStorage) 5.点击外部关闭 6.URL同步',
    improvement: '添加了高级功能和用户体验要求'
  },
  {
    round: 4,
    prompt: '修复问题：1.搜索建议也防抖(200ms) 2.键盘导航空列表边界 3.并发请求AbortController 4.可访问性ARIA属性 5.移动端自动聚焦 6.搜索分析记录',
    improvement: '修复bug、优化边界情况和可访问性'
  },
  {
    round: 5,
    prompt: '为搜索组件编写单元测试：1.基本渲染 2.输入防抖 3.搜索结果渲染 4.键盘导航 5.空结果状态 6.错误状态 7.搜索历史 8.点击外部关闭。使用Vitest + Testing Library',
    improvement: '添加完整的测试覆盖'
  }
];

console.log('🚀 开始模拟迭代优化过程...\\n');

iterations.forEach((iter, index) => {
  const evaluation = simulator.addIteration(iter.round, iter.prompt, iter.improvement);
  console.log(\`第\${iter.round}轮迭代完成 - 评分: \${evaluation.totalScore}分 \${evaluation.grade.emoji}\${evaluation.grade.level}\`);
  console.log(\`  改进重点: \${iter.improvement}\`);
  if (evaluation.improvementAreas.length > 0) {
    console.log(\`  待改进: \${evaluation.improvementAreas.map(a => \`\${a.area}(\${a.score}%)\`).join(', ')}\`);
  }
  console.log('');
});

// 生成完整报告
console.log(simulator.generateReport());

// 比较迭代
console.log('\\n' + '═'.repeat(60));
console.log(simulator.compareIterations(1, 5));
console.log(simulator.compareIterations(1, 3));
console.log(simulator.compareIterations(3, 5));

console.log('\\n💡 迭代优化关键洞察：');
console.log('  1. 第1轮到第2轮提升最大（+30分），因为补充了基本约束');
console.log('  2. 第3轮添加高级功能后评分提升放缓，需要更精细的优化');
console.log('  3. 第4轮修复边界问题对评分提升有限，但对代码质量至关重要');
console.log('  4. 第5轮添加测试是"最后一公里"，让代码达到生产级别');
console.log('  5. 每轮迭代都应该有明确的改进目标');
`
  },
  {
    id: "prompt-templates",
    icon: "📄",
    group: "提示词工程",
    title: "提示词模板与复用",
    content: `
# 第10章：提示词模板与复用

## 10.1 为什么需要提示词模板？

在前面的章节中，我们学习了如何编写高质量的提示词。但每次都从零开始编写提示词是低效的。提示词模板让你能够将最佳实践固化为可复用的资产，大幅提升AI编程的效率。

### 10.1.1 模板化的价值

| 价值维度 | 说明 |
|----------|------|
| 效率提升 | 从几分钟缩短到几秒钟 |
| 质量保证 | 确保每次都不会遗漏关键要素 |
| 团队协作 | 团队成员共享最佳实践 |
| 持续改进 | 模板可以不断优化和迭代 |
| 知识沉淀 | 将个人经验转化为团队资产 |

### 10.1.2 模板化前后的对比

**模板化前**：
- 每次写提示词需要5-10分钟
- 质量不稳定，容易遗漏要素
- 经验无法传递
- 新人需要很长时间学习

**模板化后**：
- 每次写提示词只需30秒-1分钟
- 质量稳定，结构完整
- 团队共享最佳实践
- 新人快速上手

## 10.2 构建个人提示词库

### 10.2.1 提示词库结构

\`\`\`
prompt-library/
├── code-generation/
│   ├── react-component.md
│   ├── nextjs-api-route.md
│   ├── typescript-interface.md
│   └── database-schema.md
├── debugging/
│   ├── bug-analysis.md
│   ├── error-fix.md
│   └── performance-debug.md
├── refactoring/
│   ├── extract-function.md
│   ├── split-component.md
│   └── migrate-pattern.md
├── testing/
│   ├── unit-test.md
│   ├── integration-test.md
│   └── e2e-test.md
├── documentation/
│   ├── jsdoc.md
│   ├── readme.md
│   └── api-docs.md
├── review/
│   ├── code-review.md
│   ├── security-review.md
│   └── performance-review.md
├── architecture/
│   ├── system-design.md
│   ├── tech-selection.md
│   └── migration-plan.md
└── learning/
    ├── explain-code.md
    ├── compare-approaches.md
    └── best-practices.md
\`\`\`

### 10.2.2 模板分类详解

#### 代码生成模板

\`\`\`markdown
# React组件生成模板

【角色】你是一位精通React 18和TypeScript的前端高级工程师

【任务】创建 {{component_name}} 组件

【背景】
- 项目：{{project_name}}
- 技术栈：{{tech_stack}}
- 组件用途：{{component_purpose}}

【功能要求】
{{#each requirements}}
- {{description}}
{{/each}}

【约束】
1. 使用TypeScript，所有props必须有接口定义
2. 使用函数组件和Hooks
3. 使用useCallback和useMemo优化性能
4. 处理加载、空数据、错误三种状态
5. 遵循项目的ESLint和Prettier配置

【输出格式】
完整的.tsx文件，包含：
- 所有必要的import
- Props接口定义
- 组件实现
- 命名导出
\`\`\`

#### 调试模板

\`\`\`markdown
# Bug分析模板

【角色】你是一位擅长调试{{language}}应用的资深开发者

【任务】分析并修复以下bug

【错误信息】
\`\`\`
{{error_message}}
\`\`\`

【复现步骤】
{{reproduction_steps}}

【相关代码】
\`\`\`{{language}}
{{relevant_code}}
\`\`\`

【环境信息】
- 运行时：{{runtime}}
- 依赖版本：{{dependencies}}

【输出格式】
1. 根因分析
2. 修复方案
3. 修复后的代码
4. 预防措施
\`\`\`

#### 代码审查模板

\`\`\`markdown
# 代码审查模板

【角色】你是一位严格的代码审查者

【任务】审查 {{file_path}} 的代码质量

【审查维度】
1. 功能正确性
2. 代码可读性
3. 性能优化
4. 安全性
5. 可维护性
6. 测试覆盖

【输出格式】
## 审查报告

### 总体评分：X/10

### 严重问题
- [行号] 问题描述 + 修复建议

### 改进建议
- [行号] 改进建议

### 亮点
- 做得好的地方
\`\`\`

#### 重构模板

\`\`\`markdown
# 代码重构模板

【角色】你是一位擅长代码重构的架构师

【任务】重构 {{file_path}}

【重构目标】
{{refactoring_goals}}

【约束】
1. 保持外部API不变
2. 每个函数不超过50行
3. 提取公共逻辑
4. 添加单元测试

【输出格式】
1. 重构后的文件结构
2. 重构后的代码
3. 测试用例
4. 重构说明
\`\`\`

#### 测试模板

\`\`\`markdown
# 单元测试模板

【角色】你是一位TDD实践者

【任务】为 {{target_file}} 编写单元测试

【测试框架】{{test_framework}}

【测试要求】
1. 正常情况测试
2. 边界条件测试
3. 错误情况测试
4. 异步操作测试
5. Mock外部依赖

【输出格式】
完整的.test文件
\`\`\`

#### 文档模板

\`\`\`markdown
# JSDoc文档模板

【角色】你是一位技术文档撰写专家

【任务】为 {{target_file}} 编写JSDoc文档

【要求】
1. 每个导出函数的功能描述
2. 参数说明（类型、含义、是否可选）
3. 返回值说明
4. 使用示例（至少2个）
5. 注意事项

【输出格式】
完整的JSDoc注释
\`\`\`

#### 架构设计模板

\`\`\`markdown
# 系统设计模板

【角色】你是一位系统架构师

【任务】设计 {{system_name}} 的架构方案

【需求背景】
{{requirements}}

【约束条件】
{{constraints}}

【输出格式】
1. 架构概览图
2. 技术选型说明
3. 模块划分
4. 数据流设计
5. 接口设计
6. 部署方案
7. 风险评估
\`\`\`

#### 学习模板

\`\`\`markdown
# 代码解释模板

【角色】你是一位耐心的技术导师

【任务】解释以下代码的工作原理

【代码】
\`\`\`{{language}}
{{code}}
\`\`\`

【输出格式】
1. 整体功能概述
2. 逐行/逐段解释
3. 关键概念说明
4. 设计模式分析
5. 潜在改进建议
\`\`\`

## 10.3 模板变量系统

### 10.3.1 变量类型

| 变量类型 | 语法 | 示例 |
|----------|------|------|
| 简单变量 | {{variable}} | {{component_name}} |
| 列表变量 | {{#each list}} | {{#each requirements}} |
| 条件变量 | {{#if condition}} | {{#if has_tests}} |
| 默认值 | {{variable:default}} | {{language:TypeScript}} |

### 10.3.2 常用变量定义

\`\`\`javascript
const templateVars = {
  // 项目相关
  project_name: 'e-commerce-platform',
  tech_stack: 'React 18 + TypeScript + Next.js 14',
  package_manager: 'pnpm',
  
  // 文件相关
  file_path: 'src/components/UserList.tsx',
  component_name: 'UserList',
  target_file: 'src/utils/formatDate.ts',
  
  // 语言/框架
  language: 'TypeScript',
  framework: 'React 18',
  runtime: 'Node.js 20 LTS',
  
  // 测试
  test_framework: 'Vitest + Testing Library',
  
  // 依赖
  dependencies: 'react@18.2.0, @tanstack/react-query@5.0.0, zod@3.22.0',
  
  // 约束
  constraints: [
    '使用TypeScript strict模式',
    '函数不超过50行',
    '添加JSDoc注释',
    '编写单元测试'
  ],
  
  // 需求
  requirements: [
    '支持服务端分页',
    '支持多列排序',
    '支持关键词搜索',
    '支持批量操作'
  ]
};
\`\`\`

## 10.4 提示词工程工作流

### 10.4.1 四阶段工作流：Capture → Template → Refine → Reuse

\`\`\`
┌─────────────────────────────────────────────────────────┐
│              提示词工程工作流                             │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────┐│
│  │ Capture  │ →  │ Template │ →  │ Refine   │ →  │Reuse ││
│  │ 捕获     │    │ 模板化   │    │ 优化     │    │ 复用 ││
│  └──────────┘    └──────────┘    └──────────┘    └──────┘│
│       │               │               │               │  │
│       ▼               ▼               ▼               ▼  │
│  记录成功的    提取变量和    根据反馈      快速应用到    │
│  提示词模式    结构化为     持续改进      新场景中      │
│              可复用模板    模板质量                     │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 10.4.2 阶段1：捕获（Capture）

每次成功使用AI后，记录有效的提示词模式：

\`\`\`
捕获清单：
□ 这个提示词为什么有效？
□ 哪些部分是关键要素？
□ 有没有可以改进的地方？
□ 这个模式适用于什么场景？
\`\`\`

### 10.4.3 阶段2：模板化（Template）

将捕获的提示词转化为可复用的模板：

1. 识别变量部分（用{{variable}}替换）
2. 识别可选部分（用{{#if}}包裹）
3. 识别列表部分（用{{#each}}处理）
4. 添加注释说明模板的用途

### 10.4.4 阶段3：优化（Refine）

基于使用反馈持续改进模板：

1. 收集使用数据（哪些模板用得多？）
2. 分析失败案例（哪些场景下模板不够好？）
3. 添加新的约束和场景
4. 更新最佳实践

### 10.4.5 阶段4：复用（Reuse）

将模板应用到新场景中：

1. 选择合适的模板
2. 填入具体变量
3. 根据场景微调
4. 记录使用效果

## 10.5 提示词管理工具

### 10.5.1 工具选择

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| Git仓库 | 版本控制、协作 | 团队使用 |
| Notion/飞书文档 | 富文本、搜索 | 个人/小团队 |
| VS Code Snippets | IDE集成 | 个人使用 |
| 专用提示词管理工具 | 功能全面 | 专业需求 |
| Markdown文件 | 简单、通用 | 任何场景 |

### 10.5.2 VS Code Snippets配置

\`\`\`json
{
  "React Component Generation": {
    "prefix": "prompt-react-component",
    "body": [
      "【角色】你是一位精通React 18和TypeScript的前端高级工程师",
      "",
      "【任务】创建 \${1:component_name} 组件",
      "",
      "【背景】",
      "- 项目：\${2:project_name}",
      "- 技术栈：\${3:React 18 + TypeScript + Tailwind CSS}",
      "",
      "【功能要求】",
      "\${4:功能描述}",
      "",
      "【约束】",
      "1. 使用TypeScript，所有props必须有接口定义",
      "2. 使用函数组件和Hooks",
      "3. 处理加载、空数据、错误状态",
      "",
      "【输出格式】",
      "完整的.tsx文件"
    ]
  }
}
\`\`\`

## 10.6 社区资源与最佳实践

### 10.6.1 值得学习的提示词库

| 资源 | 说明 |
|------|------|
| Anthropic Prompt Library | Anthropic官方的提示词库 |
| OpenAI Cookbook | OpenAI的提示词示例集 |
| Prompt Engineering Guide | 社区维护的提示词工程指南 |
| Awesome ChatGPT Prompts | GitHub上的提示词集合 |
| LangChain Hub | LangChain的提示词中心 |

### 10.6.2 适应不同AI模型

不同AI模型对提示词的响应方式不同：

| 模型 | 特点 | 提示词建议 |
|------|------|-----------|
| GPT-4 | 指令遵循能力强 | 可以使用更简洁的提示词 |
| Claude 3 | 长上下文处理强 | 可以提供更多上下文 |
| Gemini | 多模态能力强 | 可以利用图片等多媒体 |
| 开源模型 | 能力参差不齐 | 需要更详细、更结构化的提示词 |

### 10.6.3 模型适配技巧

1. **测试不同模型**：同一个提示词在不同模型上的效果可能差异很大
2. **调整详细程度**：能力强的模型可以用更简洁的提示词
3. **利用模型特性**：如Claude的长上下文，Gemini的多模态
4. **准备回退方案**：为不同模型准备不同版本的提示词

## 10.7 反模式与注意事项

### 10.7.1 常见反模式

| 反模式 | 表现 | 改进方法 |
|--------|------|----------|
| 过度模板化 | 为每个小任务都创建模板 | 只模板化高频任务 |
| 模板僵化 | 严格按模板，不根据场景调整 | 模板是起点，不是终点 |
| 变量过多 | 模板有20+个变量 | 保持变量在5-10个 |
| 忽视维护 | 模板长期不更新 | 定期回顾和更新模板 |
| 独享模板 | 不分享给团队 | 建立团队共享机制 |
| 复制粘贴 | 每次都复制整个模板 | 使用工具自动化填充 |

### 10.7.2 模板维护清单

\`\`\`
每月模板维护：
□ 统计模板使用频率
□ 淘汰不常用的模板
□ 更新过时的技术栈引用
□ 添加新的最佳实践
□ 收集用户反馈
□ 同步团队变更
\`\`\`

## 10.8 模板共享与协作

### 10.8.1 团队模板库

建立团队级别的提示词模板库：

\`\`\`
团队模板库结构：
├── README.md（使用说明）
├── CONTRIBUTING.md（贡献指南）
├── CHANGELOG.md（变更日志）
├── templates/
│   ├── frontend/
│   ├── backend/
│   ├── devops/
│   └── general/
└── examples/
    ├── before-after/
    └── case-studies/
\`\`\`

### 10.8.2 模板评审流程

\`\`\`
模板评审流程：
1. 提交：创建模板PR
2. 评审：至少1位团队成员评审
3. 测试：在实际场景中验证
4. 合并：通过后合并到主分支
5. 通知：通知团队成员新模板可用
\`\`\`

## 10.9 本章小结

提示词模板与复用是提示词工程从"手艺"走向"工程"的最终步骤：

1. **构建个人提示词库**：按分类组织，逐步积累
2. **使用模板变量**：让模板灵活适应不同场景
3. **遵循四阶段工作流**：Capture → Template → Refine → Reuse
4. **选择合适的工具**：从VS Code Snippets到专用管理工具
5. **团队协作**：建立共享机制和评审流程
6. **持续改进**：定期回顾和优化模板

记住：好的模板是用出来的，不是设计出来的。从实际使用中积累，在实践中优化，让模板成为你的AI编程加速器。
`,
    code: `
/**
 * 提示词模板库系统
 * 
 * 功能：
 * 1. 存储和管理提示词模板
 * 2. 支持变量替换
 * 3. 模板分类和检索
 * 4. 模板使用统计
 */

// 提示词模板库
class PromptTemplateLibrary {
  constructor() {
    this.templates = new Map();
    this.categories = new Set();
    this.usageStats = new Map();
    this.initializeDefaults();
  }

  initializeDefaults() {
    // 预置模板
    this.addTemplate({
      id: 'react-component',
      category: 'code-generation',
      name: 'React组件生成',
      description: '用于生成React组件的结构化提示词',
      variables: ['component_name', 'project_name', 'tech_stack', 'requirements', 'additional_constraints'],
      template: \`【角色】你是一位精通React 18和TypeScript的前端高级工程师

【任务】创建 {{component_name}} 组件

【背景】
- 项目：{{project_name}}
- 技术栈：{{tech_stack}}

【功能要求】
{{requirements}}

【约束】
1. 使用TypeScript，所有props必须有接口定义
2. 使用函数组件和Hooks
3. 使用useCallback和useMemo优化性能
4. 处理加载、空数据、错误三种状态
5. 遵循项目的ESLint配置
{{additional_constraints}}

【输出格式】
完整的.tsx文件，包含所有必要的import、Props接口定义、组件实现和导出\`
    });

    this.addTemplate({
      id: 'bug-fix',
      category: 'debugging',
      name: 'Bug修复',
      description: '用于分析和修复代码bug',
      variables: ['language', 'error_message', 'reproduction_steps', 'relevant_code', 'runtime'],
      template: \`【角色】你是一位擅长调试{{language}}应用的资深开发者

【任务】分析并修复以下bug

【错误信息】
\\\`\\\`\\\`
{{error_message}}
\\\`\\\`\\\`

【复现步骤】
{{reproduction_steps}}

【相关代码】
\\\`\\\`\\\`{{language}}
{{relevant_code}}
\\\`\\\`\\\`

【环境信息】
- 运行时：{{runtime}}

【输出格式】
1. 根因分析
2. 修复方案
3. 修复后的代码
4. 预防措施\`
    });

    this.addTemplate({
      id: 'code-review',
      category: 'review',
      name: '代码审查',
      description: '用于系统性地审查代码质量',
      variables: ['file_path', 'review_focus', 'additional_checks'],
      template: \`【角色】你是一位严格的代码审查者，专注于代码质量和安全性

【任务】审查 {{file_path}} 的代码质量

【审查重点】
{{review_focus}}

【审查维度】
1. 功能正确性 - 逻辑是否正确，边界情况是否覆盖
2. 代码可读性 - 命名、结构、注释是否清晰
3. 性能优化 - 是否有不必要的计算或渲染
4. 安全性 - 是否存在常见安全漏洞
5. 可维护性 - 是否易于理解和修改
6. 测试覆盖 - 是否有足够的测试
{{additional_checks}}

【输出格式】
## 代码审查报告
### 总体评分：X/10
### 严重问题（必须修复）
- [行号] 问题描述 + 修复建议
### 改进建议（建议修复）
- [行号] 改进建议
### 亮点
- 做得好的地方\`
    });

    this.addTemplate({
      id: 'refactor',
      category: 'refactoring',
      name: '代码重构',
      description: '用于系统性地重构代码',
      variables: ['file_path', 'refactoring_goals', 'current_issues'],
      template: \`【角色】你是一位擅长代码重构的架构师

【任务】重构 {{file_path}}

【当前问题】
{{current_issues}}

【重构目标】
{{refactoring_goals}}

【约束】
1. 保持外部API接口不变
2. 每个函数不超过50行
3. 提取公共逻辑到独立模块
4. 使用依赖注入提高可测试性
5. 添加完整的TypeScript类型标注

【输出格式】
1. 重构后的文件结构
2. 每个文件的核心代码
3. 单元测试
4. 重构说明（为什么这样改）\`
    });

    this.addTemplate({
      id: 'unit-test',
      category: 'testing',
      name: '单元测试编写',
      description: '用于为代码编写单元测试',
      variables: ['target_file', 'test_framework', 'test_focus', 'special_cases'],
      template: \`【角色】你是一位TDD实践者，专注于测试质量

【任务】为 {{target_file}} 编写单元测试

【测试框架】{{test_framework}}

【测试重点】
{{test_focus}}

【测试要求】
1. 正常情况测试
2. 边界条件测试（null, undefined, 空数组, 空字符串等）
3. 错误情况测试
4. 异步操作测试
5. Mock外部依赖
{{special_cases}}

【输出格式】
完整的.test文件\`
    });

    this.addTemplate({
      id: 'api-route',
      category: 'code-generation',
      name: 'API路由生成',
      description: '用于生成Next.js API路由',
      variables: ['method', 'route_path', 'request_body', 'response_format', 'validation_rules'],
      template: \`【角色】你是一位精通Next.js API Routes的后端开发者

【任务】创建 {{method}} {{route_path}} API路由

【请求格式】
{{request_body}}

【响应格式】
{{response_format}}

【验证规则】
{{validation_rules}}

【约束】
1. 使用Next.js 14 App Router
2. 使用zod进行参数验证
3. 使用Prisma进行数据库操作
4. 添加适当的HTTP状态码
5. 统一错误处理格式
6. 添加请求日志

【输出格式】
完整的route.ts文件\`
    });

    this.addTemplate({
      id: 'jsdoc',
      category: 'documentation',
      name: 'JSDoc文档生成',
      description: '用于为代码生成JSDoc文档',
      variables: ['target_file', 'language', 'doc_style'],
      template: \`【角色】你是一位技术文档撰写专家

【任务】为 {{target_file}} 编写JSDoc文档

【语言】{{language}}

【文档风格】{{doc_style}}

【要求】
1. 每个导出函数/类的功能描述
2. 参数说明（类型、含义、是否可选、默认值）
3. 返回值说明
4. 使用示例（至少2个）
5. 注意事项（边界情况、性能考虑等）
6. @see 相关函数或文档链接

【输出格式】
完整的JSDoc注释，可直接插入代码中\`
    });

    this.addTemplate({
      id: 'explain-code',
      category: 'learning',
      name: '代码解释',
      description: '用于解释代码的工作原理',
      variables: ['language', 'code', 'focus_area'],
      template: \`【角色】你是一位耐心的技术导师，擅长用通俗易懂的方式解释复杂概念

【任务】解释以下{{language}}代码的工作原理

【代码】
\\\`\\\`\\\`{{language}}
{{code}}
\\\`\\\`\\\`

【重点解释】
{{focus_area}}

【输出格式】
1. 整体功能概述（一句话总结）
2. 核心逻辑分析（逐步解释）
3. 关键概念说明（涉及的技术点）
4. 设计模式分析（如适用）
5. 潜在改进建议
6. 学习建议（如何深入理解相关概念）\`
    });
  }

  addTemplate(template) {
    this.templates.set(template.id, {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    });
    this.categories.add(template.category);
    this.usageStats.set(template.id, {
      count: 0,
      lastUsed: null,
      successRate: 0
    });
  }

  getTemplate(id) {
    return this.templates.get(id);
  }

  getTemplatesByCategory(category) {
    const result = [];
    for (const [id, template] of this.templates) {
      if (template.category === category) {
        result.push(template);
      }
    }
    return result;
  }

  getAllCategories() {
    return Array.from(this.categories);
  }

  searchTemplates(query) {
    const results = [];
    const q = query.toLowerCase();
    for (const [id, template] of this.templates) {
      if (
        template.name.toLowerCase().includes(q) ||
        template.description.toLowerCase().includes(q) ||
        template.category.toLowerCase().includes(q)
      ) {
        results.push(template);
      }
    }
    return results;
  }

  fillTemplate(id, variables) {
    const template = this.getTemplate(id);
    if (!template) {
      throw new Error(\`模板 '\${id}' 不存在\`);
    }

    let result = template.template;

    // 替换所有变量
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(\`\\\\{\\\\{\\\\s*\${key}\\\\s*\\\\}\\\\}\`, 'g');
      result = result.replace(regex, value || '');
    }

    // 清理未替换的变量（设为空）
    result = result.replace(/\\{\\{[^}]+\\}\\}/g, '');

    // 记录使用统计
    const stats = this.usageStats.get(id);
    if (stats) {
      stats.count++;
      stats.lastUsed = new Date();
    }
    template.usageCount++;

    return result;
  }

  getUsageStats() {
    const stats = [];
    for (const [id, stat] of this.usageStats) {
      const template = this.getTemplate(id);
      if (template) {
        stats.push({
          id,
          name: template.name,
          category: template.category,
          usageCount: stat.count,
          lastUsed: stat.lastUsed,
          successRate: stat.successRate
        });
      }
    }
    return stats.sort((a, b) => b.usageCount - a.usageCount);
  }

  getSummary() {
    return {
      totalTemplates: this.templates.size,
      totalCategories: this.categories.size,
      totalUsage: Array.from(this.usageStats.values())
        .reduce((sum, s) => sum + s.count, 0),
      mostUsed: this.getUsageStats().slice(0, 3),
      categories: Array.from(this.categories)
    };
  }
}

// ============ 测试用例 ============

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║    提示词模板库系统 - Prompt Template Library         ║');
console.log('╚══════════════════════════════════════════════════════╝\\n');

const library = new PromptTemplateLibrary();

// 展示所有模板
console.log('📚 模板库概览：');
console.log(\`  模板总数: \${library.getSummary().totalTemplates}\`);
console.log(\`  分类总数: \${library.getSummary().totalCategories}\`);
console.log(\`  分类列表: \${library.getSummary().categories.join(', ')}\\n\`);

// 按分类展示
library.getAllCategories().forEach(category => {
  const templates = library.getTemplatesByCategory(category);
  console.log(\`📁 \${category} (\${templates.length}个模板):\`);
  templates.forEach(t => {
    console.log(\`  • \${t.name} - \${t.description}\`);
  });
  console.log('');
});

// 测试1：填充React组件模板
console.log('═'.repeat(60));
console.log('📋 测试1：填充React组件模板\\n');

const componentPrompt = library.fillTemplate('react-component', {
  component_name: 'SearchInput',
  project_name: '电商管理后台',
  tech_stack: 'React 18 + TypeScript + Ant Design 5.x',
  requirements: '- 支持防抖搜索（300ms）\\n- 显示搜索建议下拉列表\\n- 支持键盘导航（上下箭头选择，回车确认）\\n- 点击外部关闭建议列表\\n- 支持清空按钮',
  additional_constraints: '6. 使用Ant Design的Input组件作为基础\\n7. 下拉建议列表使用Ant Design的Dropdown组件'
});

console.log(componentPrompt);
console.log('\\n');

// 测试2：填充Bug修复模板
console.log('═'.repeat(60));
console.log('📋 测试2：填充Bug修复模板\\n');

const bugFixPrompt = library.fillTemplate('bug-fix', {
  language: 'TypeScript',
  error_message: 'TypeError: Cannot read properties of undefined (reading \\'map\\')\\n  at ProductList (src/components/ProductList.tsx:28:20)',
  reproduction_steps: '1. 进入商品列表页\\n2. 快速切换筛选条件\\n3. 在数据加载完成前再次切换筛选条件',
  relevant_code: 'const { data } = useQuery(...);\\nreturn data.items.map(item => <ProductCard key={item.id} product={item} />);',
  runtime: 'React 18.2.0, @tanstack/react-query 5.0.0'
});

console.log(bugFixPrompt);
console.log('\\n');

// 测试3：搜索模板
console.log('═'.repeat(60));
console.log('📋 测试3：搜索模板（关键词: "test"）\\n');

const searchResults = library.searchTemplates('test');
console.log(\`找到 \${searchResults.length} 个相关模板：\`);
searchResults.forEach(t => {
  console.log(\`  • [\${t.category}] \${t.name}\`);
});

// 测试4：使用统计
console.log('\\n' + '═'.repeat(60));
console.log('📋 测试4：使用统计\\n');

// 模拟多次使用
library.fillTemplate('react-component', { component_name: 'UserTable', project_name: 'Admin', tech_stack: 'React', requirements: '列表', additional_constraints: '' });
library.fillTemplate('react-component', { component_name: 'ProductCard', project_name: 'Shop', tech_stack: 'React', requirements: '卡片', additional_constraints: '' });
library.fillTemplate('bug-fix', { language: 'JS', error_message: 'test', reproduction_steps: '', relevant_code: '', runtime: '' });
library.fillTemplate('code-review', { file_path: 'test.tsx', review_focus: '性能', additional_checks: '' });

const stats = library.getUsageStats();
console.log('模板使用排名：');
stats.forEach((s, i) => {
  console.log(\`  \${i + 1}. \${s.name} (\${s.category}) - 使用\${s.usageCount}次\`);
});

// 总结
console.log('\\n' + '═'.repeat(60));
console.log('📊 库统计：');
const summary = library.getSummary();
console.log(\`  模板总数: \${summary.totalTemplates}\`);
console.log(\`  分类总数: \${summary.totalCategories}\`);
console.log(\`  总使用次数: \${summary.totalUsage}\`);
console.log(\`  最常用模板: \${summary.mostUsed.map(s => s.name).join(', ')}\`);

console.log('\\n✅ 提示词模板库系统演示完成！');
console.log('💡 使用 library.fillTemplate(id, variables) 填充模板');
console.log('💡 使用 library.searchTemplates(query) 搜索模板');
console.log('💡 使用 library.getTemplatesByCategory(category) 按分类获取');
`
  }
];