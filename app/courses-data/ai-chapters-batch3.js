// =============================================================
// AI 编程方法教程 —— 第三批章节（AI辅助编码组，共 5 章）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 11 章：AI代码生成：从注释到实现
  // ============================================================
  {
    id: "ai-code-gen",
    icon: "⚡",
    group: "AI辅助编码",
    title: "AI代码生成：从注释到实现",
    content: `## 第11章：AI代码生成——从注释到实现

### 11.1 引言：AI代码生成的时代已经到来

在过去的几年里，AI代码生成技术经历了从实验室概念到生产工具的跨越式发展。从最初的简单代码补全，到如今能够根据自然语言描述生成完整的功能模块，AI代码生成正在彻底改变软件开发的方式。本章将深入探讨如何掌握AI代码生成的核心技术，让你能够高效地将想法转化为代码。

AI代码生成不是简单的"按下按钮就出代码"。它是一门需要学习的技能，就像学习编程语言本身一样。你需要理解AI的能力边界、掌握提示词技巧、建立验证流程，并形成一套适合自己的工作方法。

#### 11.1.1 AI代码生成的三个层次

AI代码生成可以根据复杂度和自主性分为三个层次。理解这些层次有助于你选择合适的方式与AI协作。

**第一层：代码片段生成**
这是最基础的层次。你给AI一个具体的、小范围的任务描述，AI生成一个函数或一段代码片段。例如"写一个验证邮箱格式的函数"或"生成一个防抖函数"。代码片段生成的成功率最高，因为任务范围明确、上下文简洁。

**第二层：功能模块生成**
在这个层次，AI需要理解更复杂的业务逻辑和多个组件之间的协作关系。你可能会要求AI生成一个完整的用户认证模块，包括登录、注册、密码重置等功能。这需要更详细的提示词和更多的上下文信息。

**第三层：应用生成**
最高层次是让AI生成一个完整的应用程序，包括前端界面、后端API、数据库设计等。目前这仍然是一个具有挑战性的任务，但在某些特定场景下（如简单的CRUD应用、原型开发），AI已经能够展现出令人印象深刻的能力。

#### 11.1.2 为什么AI代码生成需要学习

很多开发者第一次使用AI代码生成工具时，会感到失望——生成的代码不符合预期、有Bug、或者完全跑偏了。这通常不是因为AI不够强大，而是因为他们没有掌握正确的使用方法。

AI代码生成不是黑盒魔法，而是一个需要你主动参与、引导和验证的过程。一个优秀的AI代码生成者，需要具备以下能力：

- **精准表达**：能够清晰、准确地描述需求
- **分解能力**：能够将复杂任务拆解为AI可以处理的小任务
- **验证能力**：能够快速判断AI生成的代码是否正确、安全、高效
- **迭代优化**：能够通过多轮对话逐步改进代码质量

### 11.2 如何编写高效的代码生成提示词

提示词是AI代码生成的核心输入。一个好的提示词可以让AI准确理解你的意图，生成高质量的代码。一个差的提示词则会导致AI生成无关、错误或低质量的代码。

#### 11.2.1 提示词的核心要素

一个完整的代码生成提示词应该包含以下要素：

**1. 语言和框架**
明确指定编程语言、框架版本和运行环境。这是最基础也是最重要的信息。

\`\`\`
不明确："写一个排序函数"
明确：  "用JavaScript（ES2023）写一个数组排序函数，使用快速排序算法"
\`\`\`

**2. 输入和输出**
明确描述函数的输入参数类型、返回值的类型和含义。

\`\`\`
不明确："写一个处理用户数据的函数"
明确：  "写一个函数 processUsers(users: User[]): ProcessedUser[]，
       接收用户数组，返回处理后的用户数组。
       User 类型包含 id, name, email, age 字段"
\`\`\`

**3. 业务逻辑**
详细描述函数需要实现的业务逻辑，包括边界条件和特殊情况处理。

\`\`\`
不明确："写一个计算折扣的函数"
明确：  "写一个计算订单折扣的函数，规则如下：
       - 普通会员：满100减10，满200减30，满500减100
       - 金牌会员：额外享受9折叠加优惠
       - 订单金额为0或负数时返回0
       - 折扣不能超过订单金额的50%"
\`\`\`

**4. 约束条件**
明确性能要求、安全要求、代码风格要求等。

\`\`\`
约束条件：
- 时间复杂度不超过 O(n log n)
- 不使用 eval 或类似危险函数
- 使用 TypeScript strict 模式
- 遵循 Airbnb JavaScript 风格指南
- 需要处理空数组、null 和 undefined 输入
\`\`\`

**5. 输出格式**
指定你期望的输出格式。

\`\`\`
输出格式要求：
- 完整的函数实现，包含 JSDoc 注释
- 每个关键步骤添加行内注释
- 附上 3 个使用示例
- 输出完整的 TypeScript 代码
\`\`\`

#### 11.2.2 提示词模板

以下是一个通用的代码生成提示词模板，你可以根据具体需求进行调整：

\`\`\`
【任务】用 {语言} {框架} 实现 {功能描述}

【输入】
- 参数类型：{详细描述}
- 参数约束：{约束条件}

【输出】
- 返回值类型：{详细描述}
- 输出格式：{格式要求}

【业务规则】
1. {规则1}
2. {规则2}
3. {规则3}

【边界条件】
- {边界条件1}
- {边界条件2}

【约束条件】
- 性能要求：{性能要求}
- 安全要求：{安全要求}
- 代码风格：{代码风格}

【示例】
输入：{示例输入}
期望输出：{期望输出}
\`\`\`

#### 11.2.3 提示词优化技巧

**技巧一：使用角色设定**
给AI设定一个角色，可以帮助它更好地理解你的期望。

\`\`\`
角色：你是一位拥有10年经验的资深JavaScript架构师，精通函数式编程和设计模式。
\`\`\`

**技巧二：使用对比示例**
提供"好"与"坏"的对比，帮助AI理解你的质量标准。

\`\`\`
好的代码风格示例：
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

请避免这种风格：
function calc(x) { var t=0; for(var i=0;i<x.length;i++) { t=t+x[i].p*x[i].q; } return t; }
\`\`\`

**技巧三：使用"思维链"引导**
让AI先思考再生成代码，可以提高代码质量。

\`\`\`
请先分析这个问题：
1. 输入数据的结构是什么？
2. 有哪些边界情况需要考虑？
3. 最优的算法策略是什么？
4. 有哪些潜在的性能瓶颈？

然后基于分析结果生成代码。
\`\`\`

**技巧四：使用约束性语言**
使用"必须"、"禁止"、"确保"等明确的语言来设定硬性约束。

\`\`\`
- 必须处理所有可能的错误情况
- 禁止使用任何第三方库
- 确保所有异步操作都正确处理
- 函数必须是纯函数，不能有副作用
\`\`\`

### 11.3 注释驱动开发（Comment-Driven Development）

#### 11.3.1 什么是注释驱动开发

注释驱动开发（CDD）是一种利用AI代码生成能力的编程范式。核心思想是：先用自然语言注释描述你想要实现的功能，然后让AI根据注释生成实现代码。这与传统的"先写代码再写注释"流程完全相反。

\`\`\`javascript
// 传统开发流程：
// 1. 写代码 → 2. 测试 → 3. 写注释

// 注释驱动开发：
// 1. 写注释 → 2. AI生成代码 → 3. 审查 → 4. 测试 → 5. 优化
\`\`\`

#### 11.3.2 注释驱动开发的实践流程

**步骤一：编写功能注释**
首先，用自然语言和伪代码描述你想要实现的功能。注释应该详细、清晰，包含输入输出、业务逻辑和边界条件。

\`\`\`javascript
/**
 * 函数：formatOrderSummary
 * 
 * 功能：将订单数据格式化为可读的摘要字符串
 * 
 * 输入：
 *   - order: { id: string, items: OrderItem[], customer: Customer, createdAt: Date }
 *   - OrderItem: { name: string, quantity: number, unitPrice: number }
 *   - Customer: { name: string, email: string, membershipLevel: 'normal' | 'gold' | 'platinum' }
 * 
 * 输出：
 *   - 格式化的订单摘要字符串，包含：
 *     1. 订单编号和日期
 *     2. 商品列表（每行一个商品，显示名称、数量、单价、小计）
 *     3. 总金额
 *     4. 会员折扣信息
 *     5. 客户信息
 * 
 * 业务规则：
 *   - gold会员享受9.5折，platinum会员享受9折
 *   - 金额保留两位小数
 *   - 商品按名称字母顺序排列
 * 
 * 边界条件：
 *   - 如果订单没有商品，返回"空订单"
 *   - 如果客户信息不完整，使用默认值
 */
\`\`\`

**步骤二：让AI生成实现**
将注释提交给AI，让AI生成对应的实现代码。

**步骤三：审查生成的代码**
仔细检查AI生成的代码是否：
- 完全实现了注释中描述的功能
- 正确处理了所有边界条件
- 符合代码质量标准
- 没有引入安全漏洞

**步骤四：迭代优化**
如果代码不符合预期，修改注释或提供额外说明，让AI重新生成。

#### 11.3.3 注释驱动开发的优势

| 优势 | 说明 |
|------|------|
| 思考先行 | 先理清逻辑再写代码，减少返工 |
| 文档自动生成 | 注释本身就是文档，不会出现"代码更新了注释没更新"的问题 |
| 降低认知负担 | 不需要同时思考"做什么"和"怎么做" |
| 提高代码质量 | 详细的注释引导AI生成更高质量的代码 |
| 便于协作 | 团队成员可以通过注释理解功能意图 |

#### 11.3.4 注释驱动开发的最佳实践

**实践一：使用结构化注释**
使用JSDoc / TSDoc等标准注释格式，让注释既可以被AI理解，也可以被文档工具处理。

**实践二：先写高层注释，再逐步细化**
从高层次的功能描述开始，逐步添加细节。这类似于"自顶向下"的设计方法。

**实践三：注释中包含测试用例**
在注释中直接包含测试用例，AI可以同时生成代码和测试。

**实践四：使用"Given-When-Then"模式**
对于复杂业务逻辑，使用Given-When-Then模式描述行为。

\`\`\`javascript
/**
 * Given: 一个包含多个商品的购物车
 * When: 用户应用优惠码 "SAVE20"
 * Then: 总价减少20%，但折扣后不低于最低价格
 * 
 * Given: 购物车为空
 * When: 用户应用任何优惠码
 * Then: 返回错误提示"购物车为空，无法应用优惠码"
 */
\`\`\`

### 11.4 完整函数生成 vs 部分代码生成

#### 11.4.1 何时生成完整函数

完整函数生成适用于以下场景：

**场景一：独立的功能函数**
不依赖外部状态，输入输出明确的纯函数，最适合由AI完整生成。

\`\`\`javascript
// 适合完整生成：工具函数、计算函数、格式化函数
// 示例：生成一个格式化日期的函数
function formatDate(date, format = 'YYYY-MM-DD') {
  // AI可以独立生成完整实现
}
\`\`\`

**场景二：标准化的CRUD操作**
数据库的增删改查操作具有高度模式化，AI可以可靠地生成完整实现。

**场景三：算法实现**
排序、搜索、加密等算法有明确的定义和标准实现，AI生成的准确率很高。

**场景四：配置和模板代码**
Webpack配置、Dockerfile、CI/CD配置等模板化代码。

#### 11.4.2 何时使用部分代码生成

部分代码生成（只生成关键逻辑，手动补充上下文）适用于以下场景：

**场景一：与现有代码紧密集成**
当新代码需要与项目中的现有代码深度集成时，AI可能不了解完整的上下文。此时应该让AI生成核心逻辑，手动处理集成部分。

**场景二：涉及业务特定的复杂状态管理**
每个项目的状态管理方案不同，AI可能无法生成完全匹配的代码。

**场景三：需要精确控制性能的关键路径**
对于性能敏感的代码，你可能需要手动优化AI生成的代码。

**场景四：安全关键代码**
涉及身份验证、加密、支付等安全关键的代码，需要人工审查和调整。

#### 11.4.3 渐进式生成策略

最佳实践是采用渐进式生成策略：

\`\`\`
第一步：生成函数签名和基本结构
第二步：生成核心算法逻辑
第三步：添加错误处理
第四步：添加边界条件处理
第五步：添加性能优化
第六步：添加文档注释
\`\`\`

每一步都独立审查，确保质量后再进入下一步。这种策略让你能够充分利用AI的生成能力，同时保持对代码的完全控制。

### 11.5 将复杂逻辑拆分为小生成任务

#### 11.5.1 为什么需要拆分

AI在生成长代码时，质量会随着代码长度的增加而下降。这是因为：

1. **注意力衰减**：AI模型在处理长序列时，注意力的分布会变得不均匀，后期生成的代码质量可能不如前期
2. **上下文窗口限制**：虽然现代模型的上下文窗口越来越大，但有效利用上下文的能力仍然有限
3. **错误累积**：前期的小错误可能在后期被放大，导致整个代码块不可用

#### 11.5.2 拆分策略

**策略一：按功能模块拆分**
将一个大的功能拆分为多个独立的子功能，每个子功能对应一个函数。

\`\`\`
复杂任务：实现一个电商订单处理系统
├── 子任务1：订单验证函数 validateOrder
├── 子任务2：库存检查函数 checkInventory
├── 子任务3：价格计算函数 calculatePrice
├── 子任务4：支付处理函数 processPayment
├── 子任务5：订单状态更新函数 updateOrderStatus
└── 子任务6：通知发送函数 sendNotification
\`\`\`

**策略二：按处理流程拆分**
将一个处理流程拆分为多个步骤，每个步骤对应一个函数。

\`\`\`
复杂任务：实现用户注册流程
├── 步骤1：输入验证 validateInput
├── 步骤2：检查用户是否存在 checkUserExists
├── 步骤3：密码加密 hashPassword
├── 步骤4：创建用户记录 createUser
├── 步骤5：发送验证邮件 sendVerificationEmail
└── 步骤6：返回注册结果 buildResponse
\`\`\`

**策略三：按数据变换拆分**
将数据的转换过程拆分为多个阶段，每个阶段对应一个转换函数。

\`\`\`
复杂任务：数据ETL处理管道
├── Extract：从数据源提取原始数据
├── Clean：清洗数据（去除无效记录、处理缺失值）
├── Transform：数据转换（格式转换、字段映射）
├── Enrich：数据增强（添加计算字段、关联外部数据）
└── Load：加载到目标数据库
\`\`\`

#### 11.5.3 拆分后的集成

拆分后的子函数需要集成到一起。这里有一些技巧：

**技巧一：使用编排函数**
创建一个主函数，按照正确的顺序调用各个子函数。

\`\`\`javascript
async function processOrder(orderData) {
  // 每个子函数都是独立生成和测试的
  const validated = validateOrder(orderData);
  const inventoryOk = await checkInventory(validated);
  const price = calculatePrice(validated);
  const payment = await processPayment(price);
  await updateOrderStatus(validated.id, 'paid');
  await sendNotification(validated.customerId, '订单已确认');
  return { orderId: validated.id, status: 'confirmed' };
}
\`\`\`

**技巧二：定义清晰的接口**
在拆分任务时，先定义好每个子函数的输入输出接口。

**技巧三：使用TypeScript接口**
利用TypeScript的类型系统来确保子函数之间的接口一致性。

### 11.6 规格优先（Spec-First）方法

#### 11.6.1 什么是Spec-First方法

Spec-First方法是一种先编写详细的功能规格说明，然后基于规格说明生成代码的方法。这与传统的"先写代码再补文档"流程相反。

#### 11.6.2 Spec-First的工作流程

**第一步：编写功能规格说明**

功能规格说明应该包含以下内容：

\`\`\`markdown
# 功能规格：用户搜索

## 概述
实现一个用户搜索功能，支持按姓名、邮箱、角色进行搜索。

## 功能需求
- FR1：支持关键字搜索
- FR2：支持按角色过滤
- FR3：支持分页（每页20条）
- FR4：支持排序（按创建时间、按姓名）
- FR5：搜索结果高亮匹配关键字

## 非功能需求
- NFR1：搜索响应时间 < 200ms
- NFR2：支持1000并发搜索
- NFR3：搜索结果缓存5分钟

## API规格
GET /api/users/search
参数：
  - q: string (搜索关键字)
  - role: string (可选，角色过滤)
  - page: number (默认1)
  - sort: string (可选，排序字段)
  - order: 'asc' | 'desc' (默认'desc')
返回：
  {
    data: User[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }

## 错误处理
- 400：参数验证失败
- 401：未认证
- 403：无权限
- 500：服务器内部错误
\`\`\`

**第二步：生成代码**
将规格说明提交给AI，生成对应的代码实现。

**第三步：验证**
验证生成的代码是否完全符合规格说明。

#### 11.6.3 Spec-First的优势

- **减少歧义**：规格说明消除了需求理解上的歧义
- **可追溯**：每个功能点都可以追溯到规格说明
- **便于测试**：规格说明可以直接转化为测试用例
- **团队协作**：规格说明是团队沟通的基础
- **AI友好**：结构化、详细的规格说明最适合AI理解

### 11.7 代码质量：可读性、性能、错误处理

#### 11.7.1 确保生成代码的可读性

AI生成的代码在可读性方面可能存在问题。以下是一些提升可读性的策略：

**策略一：要求AI添加注释**
在提示词中明确要求AI添加注释。

**策略二：要求有意义的变量名**
明确要求AI使用有意义的变量名，避免使用a、b、c、temp等无意义名称。

**策略三：要求遵循命名规范**
指定你项目使用的命名规范（camelCase、snake_case、PascalCase等）。

**策略四：要求合理的函数长度**
要求AI将函数控制在合理长度内（通常不超过50行）。

#### 11.7.2 确保生成代码的性能

AI可能生成性能不佳的代码。以下是一些保障策略：

**策略一：在提示词中指定性能要求**
明确要求时间复杂度和空间复杂度。

**策略二：要求AI解释性能特征**
让AI在生成代码后，解释代码的性能特征。

**策略三：关注常见性能陷阱**
AI容易在以下方面产生性能问题：
- 不必要的循环嵌套
- 在循环中执行数据库查询（N+1问题）
- 未使用缓存
- 不必要的数据复制
- 低效的字符串操作

#### 11.7.3 确保生成代码的错误处理

AI生成的代码经常缺少充分的错误处理。以下是一些改进策略：

**策略一：在提示词中明确要求错误处理**
明确列出需要处理的错误场景。

**策略二：使用"错误处理清单"**
创建一个错误处理清单，每次生成代码后对照检查：

\`\`\`
错误处理检查清单：
□ 空值/null/undefined 检查
□ 类型验证
□ 范围验证（数值范围、字符串长度等）
□ 网络错误处理
□ 文件系统错误处理
□ 数据库错误处理
□ 超时处理
□ 重试逻辑
□ 优雅降级
□ 错误日志记录
\`\`\`

**策略三：要求AI生成错误处理代码**
在提示词中要求AI为每个函数生成完整的错误处理代码。

### 11.8 验证生成的代码：测试、边界情况、安全审查

#### 11.8.1 测试验证

**自动测试**
让AI生成测试用例，然后运行测试验证代码的正确性。

\`\`\`javascript
// 提示词示例
"为上面的函数生成至少10个测试用例，覆盖：
1. 正常情况（happy path）
2. 边界情况（空输入、极值、特殊字符）
3. 错误情况（无效输入、类型错误）
使用 Jest 测试框架"
\`\`\`

**手动测试**
对于关键功能，建议手动编写一些核心测试用例。

#### 11.8.2 边界情况检查

AI生成的代码经常在边界情况下出问题。以下是一个边界情况检查清单：

**数据边界**
- 空数组 / 空字符串 / 空对象
- null / undefined
- 零值 / 负值
- 极大值 / 极小值
- 单元素 / 大量元素

**状态边界**
- 初始状态 / 最终状态
- 状态转换的中间状态
- 并发状态冲突

**时间边界**
- 过去的时间 / 未来的时间
- 时区边界
- 闰年 / 闰秒

#### 11.8.3 安全审查

AI生成的代码可能包含安全漏洞。以下是一些需要重点审查的方面：

**注入攻击**
- SQL注入：确保使用参数化查询
- XSS攻击：确保输出正确转义
- 命令注入：避免使用exec等危险函数

**认证和授权**
- 确保认证逻辑正确
- 确保权限检查完整
- 敏感信息不暴露在日志中

**数据安全**
- 密码使用安全的哈希算法
- 敏感数据加密存储
- 安全的随机数生成

**依赖安全**
- AI可能会引入不安全的依赖
- AI可能使用过时的API

### 11.9 多语言考量

#### 11.9.1 不同语言对AI生成的影响

AI在不同编程语言上的表现差异很大。这种差异主要源于训练数据的数量和质量。

**表现优秀的语言**
- JavaScript/TypeScript：训练数据最丰富，生成质量最高
- Python：数据量媲美JS，AI非常擅长
- Java：企业级代码丰富，生成质量高
- Go：简洁的语法使得AI生成质量稳定

**表现一般的语言**
- C++：语法复杂，模板和指针容易出错
- Ruby：训练数据相对较少
- PHP：代码质量参差不齐

**表现较差的语言**
- Rust：所有权系统复杂，AI难以正确生成
- Haskell：函数式范式的训练数据较少
- 小众语言：训练数据不足

#### 11.9.2 跨语言代码生成的策略

**策略一：从强语言生成，再翻译到弱语言**
先用AI在Python或JavaScript中生成算法原型，然后翻译到目标语言。

**策略二：提供更多上下文**
对于AI不擅长的语言，提供更多代码示例和上下文信息。

**策略三：使用语言特定的提示词**
针对不同语言的特点，调整提示词的内容和风格。

### 11.10 常见陷阱

#### 11.10.1 过度工程化

AI倾向于生成过度复杂的代码，添加不必要的抽象层、设计模式和配置选项。

**表现：**
- 为简单功能创建复杂的类层次结构
- 使用不必要的设计模式
- 过度抽象，代码难以理解
- 添加"以防万一"的功能

**对策：**
- 在提示词中明确要求"保持简单"
- 遵循YAGNI原则（You Aren't Gonna Need It）
- 审查时检查是否有不必要的复杂性

#### 11.10.2 缺失边界情况

AI生成的代码通常只覆盖"快乐路径"，缺少对边界情况和错误情况的处理。

**对策：**
- 在提示词中明确列出需要处理的边界情况
- 使用边界情况检查清单
- 让AI生成测试用例，通过测试发现遗漏

#### 11.10.3 安全漏洞

AI不了解你项目的安全上下文，可能生成存在安全漏洞的代码。

**对策：**
- 在提示词中明确安全要求
- 使用安全审查清单
- 运行安全扫描工具

#### 11.10.4 幻觉问题

AI可能"发明"不存在的API、库或函数。

**对策：**
- 验证AI使用的所有API和库是否存在
- 在提示词中指定允许使用的库和API
- 运行代码验证

#### 11.10.5 不一致性

在多轮生成中，AI可能生成风格不一致的代码。

**对策：**
- 提供代码风格指南
- 使用代码格式化工具（Prettier、ESLint）
- 在提示词中引用已有的代码作为风格参考

### 11.11 生成-审查-优化循环

#### 11.11.1 循环模型

AI代码生成的最佳实践是采用"生成-审查-优化"循环：

\`\`\`
┌─────────────────────────────────────┐
│         生成-审查-优化循环           │
│                                     │
│   ┌──────────┐                      │
│   │  1. 生成  │← 编写提示词          │
│   └────┬─────┘                      │
│        ↓                            │
│   ┌──────────┐                      │
│   │  2. 审查  │← 检查代码质量        │
│   └────┬─────┘                      │
│        ↓                            │
│   ┌──────────┐                      │
│   │  3. 测试  │← 运行测试验证        │
│   └────┬─────┘                      │
│        ↓                            │
│   ┌──────────┐                      │
│   │  4. 优化  │← 改进提示词或手动修改 │
│   └────┬─────┘                      │
│        │                            │
│        └──→ 是否满意？               │
│              ├── 是 → 完成           │
│              └── 否 → 回到步骤1       │
└─────────────────────────────────────┘
\`\`\`

#### 11.11.2 各阶段的详细操作

**生成阶段**
- 编写清晰的提示词
- 提供足够的上下文
- 设定明确的约束条件

**审查阶段**
- 检查代码逻辑是否正确
- 检查是否处理了边界情况
- 检查安全性和性能
- 检查代码风格是否符合规范

**测试阶段**
- 运行AI生成的测试用例
- 运行手动编写的测试用例
- 检查测试覆盖率
- 进行集成测试

**优化阶段**
- 根据审查和测试结果修改提示词
- 重试生成更好的代码
- 手动修改AI生成的代码
- 记录经验教训，改进提示词模板

#### 11.11.3 循环终止条件

确定何时停止循环很重要。以下是一些停止条件：

- 代码通过了所有测试用例
- 代码审查没有发现重大问题
- 代码性能满足要求
- 代码安全审查通过
- 经过3轮优化后改进不明显

### 11.12 本章小结

AI代码生成是AI辅助编程中最核心的能力之一。掌握这项技能需要理解AI的工作原理、学习编写高效的提示词、建立验证和优化流程。记住，AI是你的助手而非替代者——你的判断力、经验和创造力仍然是不可替代的。

关键要点：
1. 好的提示词 = 清晰的任务描述 + 充分的上下文 + 明确的约束
2. 注释驱动开发让思考先于编码
3. 复杂任务要拆分为小任务
4. 始终验证AI生成的代码
5. 采用"生成-审查-优化"循环不断提高代码质量`,
    code: `// ============================================================
// 第11章代码演示：AI代码生成模拟器
// ============================================================
// 这个模拟器展示了AI代码生成的基本原理：
// 接收功能规格描述，分析需求，生成代码结构
// 它模拟了从自然语言到代码的转换过程

class CodeGenerator {
  constructor() {
    this.templates = {
      function: {
        pattern: /function\\s+(\\w+)\\s*\\(([^)]*)\\)/,
        template: (name, params, body) => \`function \${name}(\${params}) {
  \${body}
}\`
      },
      class: {
        pattern: /class\\s+(\\w+)/,
        template: (name, body) => \`class \${name} {
  \${body}
}\`
      },
      validation: {
        pattern: /validate|验证|校验/i,
        template: (name, target) => \`function \${name}(input) {
  if (input === null || input === undefined) {
    throw new Error('\${target} 不能为空');
  }
  // 类型检查
  if (typeof input !== 'expected_type') {
    throw new TypeError('\${target} 类型不正确');
  }
  // 业务规则验证
  return true;
}\`
      },
      crud: {
        pattern: /create|read|update|delete|创建|读取|更新|删除/i,
        template: (operation, entity) => {
          const templates = {
            create: \`function create\${entity}(data) {
  // 验证输入数据
  validate\${entity}(data);
  // 生成ID
  const id = generateId();
  // 创建记录
  const record = { id, ...data, createdAt: new Date().toISOString() };
  // 持久化存储
  return record;
}\`,
            read: \`function get\${entity}(id) {
  // 查询记录
  const record = findById(id);
  if (!record) {
    throw new Error('\${entity} 不存在');
  }
  return record;
}\`,
            update: \`function update\${entity}(id, data) {
  // 检查记录是否存在
  const record = get\${entity}(id);
  // 验证更新数据
  validate\${entity}(data);
  // 更新记录
  const updated = { ...record, ...data, updatedAt: new Date().toISOString() };
  return updated;
}\`,
            delete: \`function delete\${entity}(id) {
  // 检查记录是否存在
  const record = get\${entity}(id);
  // 软删除
  record.deletedAt = new Date().toISOString();
  return { success: true };
}\`
          };
          return templates[operation] || '// 不支持的操作';
        }
      }
    };
  }

  /**
   * 分析功能规格，提取关键信息
   */
  analyzeSpec(spec) {
    const analysis = {
      type: 'function',
      name: '',
      params: [],
      returnType: 'void',
      description: '',
      requirements: [],
      constraints: [],
      examples: []
    };

    // 提取函数名
    const nameMatch = spec.match(/(?:函数|function|方法|method)\\s*[:：]?\\s*(\\w+)/i);
    if (nameMatch) {
      analysis.name = nameMatch[1];
    }

    // 提取参数
    const paramMatches = spec.matchAll(/(?:参数|param|输入|input)\\s*[:：]?\\s*(\\w+)\\s*[:：]\\s*(\\w+)/gi);
    for (const match of paramMatches) {
      analysis.params.push({ name: match[1], type: match[2] });
    }

    // 提取返回类型
    const returnMatch = spec.match(/(?:返回|return|输出|output)\\s*[:：]?\\s*(\\w+)/i);
    if (returnMatch) {
      analysis.returnType = returnMatch[1];
    }

    // 提取功能描述
    const descMatch = spec.match(/(?:功能|描述|description|概述)\\s*[:：]?\\s*(.+)/i);
    if (descMatch) {
      analysis.description = descMatch[1].trim();
    }

    // 提取约束条件
    const constraintLines = spec.match(/约束|constraint|限制|limit|要求|require/gi);
    if (constraintLines) {
      analysis.constraints.push('需要满足特定约束条件');
    }

    // 检测性能要求
    if (spec.match(/O\\s*\\(\\s*n\\s*\\)|复杂度|complexity|performance/i)) {
      analysis.constraints.push('有性能要求');
    }

    return analysis;
  }

  /**
   * 根据分析结果生成代码
   */
  generateCode(analysis) {
    let code = '';
    const name = analysis.name || 'myFunction';

    // 生成类型注释
    code += \`/**
 * \${analysis.description || name + ' - 自动生成的函数'}
 *
 \`;
    for (const param of analysis.params) {
      code += \` * @param {\${param.type}} \${param.name} - 输入参数\\n\`;
    }
    code += \` * @returns {\${analysis.returnType}} 处理结果
 */
\`;

    // 生成函数签名
    const paramStr = analysis.params.map(p => p.name).join(', ');
    code += \`function \${name}(\${paramStr}) {\\n\`;

    // 生成函数体
    if (analysis.params.length > 0) {
      code += \`  // 输入验证\\n\`;
      for (const param of analysis.params) {
        code += \`  if (\${param.name} === null || \${param.name} === undefined) {\\n\`;
        code += \`    throw new Error('\${param.name} 不能为空');\\n\`;
        code += \`  }\\n\`;
      }
    }

    code += \`  \\n  // 核心业务逻辑\\n\`;
    code += \`  // TODO: 实现具体业务逻辑\\n\`;
    code += \`  \\n\`;

    if (analysis.returnType !== 'void') {
      code += \`  // 返回结果\\n\`;
      code += \`  return null; // 替换为实际返回值\\n\`;
    }

    code += \`}\\n\`;

    return code;
  }

  /**
   * 生成完整的代码文件，包括辅助函数
   */
  generateComplete(spec) {
    const analysis = this.analyzeSpec(spec);
    const mainCode = this.generateCode(analysis);

    let fullCode = \`// ============================================\\n\`;
    fullCode += \`// 自动生成的代码 - 基于以下规格：\\n\`;
    fullCode += \`// \${spec.split('\\n')[0].substring(0, 60)}...\\n\`;
    fullCode += \`// 生成时间：\${new Date().toISOString()}\\n\`;
    fullCode += \`// ============================================\\n\\n\`;

    fullCode += \`// 导入依赖（如果需要）\\n\`;
    fullCode += \`// const { validate, sanitize } = require('./utils');\\n\\n\`;

    fullCode += mainCode;
    fullCode += \`\\n// 导出\\n\`;
    fullCode += \`module.exports = { \${analysis.name || 'myFunction'} };\\n\`;

    return fullCode;
  }

  /**
   * 模拟不同质量等级的代码生成
   */
  generateWithQuality(spec, quality = 'standard') {
    const analysis = this.analyzeSpec(spec);

    const qualityLevels = {
      minimal: {
        hasValidation: false,
        hasErrorHandling: false,
        hasComments: false,
        hasTests: false
      },
      standard: {
        hasValidation: true,
        hasErrorHandling: true,
        hasComments: true,
        hasTests: false
      },
      premium: {
        hasValidation: true,
        hasErrorHandling: true,
        hasComments: true,
        hasTests: true
      }
    };

    const q = qualityLevels[quality] || qualityLevels.standard;
    let code = '';

    if (q.hasComments) {
      code += \`/**\\n * 高质量代码生成示例\\n */\\n\`;
    }

    code += \`function \${analysis.name || 'process'}(input) {\\n\`;

    if (q.hasValidation) {
      code += \`  // 输入验证\\n\`;
      code += \`  if (!input) throw new Error('输入不能为空');\\n\`;
    }

    code += \`  // 核心逻辑\\n\`;
    code += \`  const result = input;\\n\`;

    if (q.hasErrorHandling) {
      code += \`  // 错误处理\\n\`;
      code += \`  try {\\n\`;
      code += \`    return result;\\n\`;
      code += \`  } catch (error) {\\n\`;
      code += \`    console.error('处理失败:', error);\\n\`;
      code += \`    throw error;\\n\`;
      code += \`  }\\n\`;
    } else {
      code += \`  return result;\\n\`;
    }

    code += \`}\\n\`;

    return code;
  }
}

// ============================================================
// 演示：模拟AI代码生成过程
// ============================================================

console.log('╔══════════════════════════════════════════════╗');
console.log('║     AI 代码生成模拟器 - 第11章演示          ║');
console.log('╚══════════════════════════════════════════════╝\\n');

const generator = new CodeGenerator();

// 演示1：分析功能规格
console.log('【演示1】分析功能规格说明\\n');
const spec1 = \`
函数：calculateDiscount
功能：根据会员等级和订单金额计算折扣
参数：amount: number - 订单金额
参数：level: string - 会员等级 ('normal' | 'gold' | 'platinum')
返回：number - 折扣后的金额
要求：时间复杂度 O(1)
\`;

console.log('输入的规格说明：');
console.log(spec1);
console.log('\\n分析结果：');
const analysis1 = generator.analyzeSpec(spec1);
console.log(JSON.stringify(analysis1, null, 2));

// 演示2：生成代码
console.log('\\n\\n【演示2】根据分析结果生成代码\\n');
console.log(generator.generateCode(analysis1));

// 演示3：生成完整代码
console.log('【演示3】生成完整代码文件\\n');
const spec2 = '函数：validateEmail\\n功能：验证邮箱格式是否合法\\n参数：email: string\\n返回：boolean\\n要求：使用正则表达式验证';
console.log(generator.generateComplete(spec2));

// 演示4：不同质量等级
console.log('【演示4】不同质量等级的代码生成\\n');
const spec3 = '函数：processUserData\\n功能：处理用户数据\\n参数：data: object\\n返回：object';

console.log('--- minimal 质量 ---');
console.log(generator.generateWithQuality(spec3, 'minimal'));

console.log('--- standard 质量 ---');
console.log(generator.generateWithQuality(spec3, 'standard'));

console.log('--- premium 质量 ---');
console.log(generator.generateWithQuality(spec3, 'premium'));

// 演示5：注释驱动开发模拟
console.log('【演示5】注释驱动开发 (CDD) 流程模拟\\n');

const cddComment = \`
/**
 * 函数：mergeSortedArrays
 * 
 * 功能：合并两个已排序的数组，返回一个新的排序数组
 * 
 * 输入：
 *   - arr1: number[] - 第一个已排序数组
 *   - arr2: number[] - 第二个已排序数组
 * 
 * 输出：
 *   - number[] - 合并后的排序数组
 * 
 * 要求：
 *   - 时间复杂度 O(n + m)
 *   - 不使用内置排序方法
 *   - 处理空数组的情况
 */
\`;

console.log('步骤1：编写功能注释');
console.log(cddComment);

console.log('步骤2：AI分析注释并生成代码');
const cddAnalysis = generator.analyzeSpec(cddComment);
console.log(generator.generateCode(cddAnalysis));

console.log('步骤3：开发者审查和验证');
console.log('✓ 检查函数签名是否正确');
console.log('✓ 检查时间复杂度是否满足要求');
console.log('✓ 检查是否处理了空数组边界情况');
console.log('✓ 运行测试用例验证功能正确性');

console.log('\\n步骤4：迭代优化');
console.log('如果代码不符合预期，修改注释并重新生成...');

console.log('\\n╔══════════════════════════════════════════════╗');
console.log('║     代码生成演示完成！                      ║');
console.log('╚══════════════════════════════════════════════╝');`,
  },

  // ============================================================
  // 第 12 章：AI代码补全：让AI读懂你的意图
  // ============================================================
  {
    id: "ai-code-completion",
    icon: "⌨️",
    group: "AI辅助编码",
    title: "AI代码补全：让AI读懂你的意图",
    content: `## 第12章：AI代码补全——让AI读懂你的意图

### 12.1 引言：AI代码补全的本质

AI代码补全可能是开发者日常使用最频繁的AI编程功能。它不像代码生成那样需要你主动触发，而是在你输入代码的过程中自动提供建议。一个好的AI代码补全工具，就像是你思维的延伸——它能够预测你接下来想写什么，让你以更快的速度将想法转化为代码。

但AI代码补全远不止"自动完成"那么简单。理解它的工作原理、掌握与它协作的技巧，可以让你从"被动接受建议"升级为"主动引导AI"，大幅提升编程效率。

#### 12.1.1 AI代码补全 vs 传统代码补全

传统IDE的代码补全基于静态分析——它知道你的代码中定义了哪些变量、函数、类，可以帮你补全它们的名称。但AI代码补全更进一步——它能够理解你的意图，预测你接下来想写的代码逻辑。

| 特性 | 传统代码补全 | AI代码补全 |
|------|------------|-----------|
| 原理 | 静态分析、符号表 | 语言模型预测 |
| 补全范围 | 变量名、函数名、属性 | 完整代码行、代码块 |
| 理解能力 | 语法层面 | 语义层面 |
| 上下文 | 当前文件 | 整个项目 |
| 学习能力 | 无 | 持续学习改进 |

#### 12.1.2 AI代码补全的三种模式

**行内补全（Inline Completion）**
AI在当前光标位置显示灰色文本，预测你接下来要输入的内容。按Tab键接受，继续输入则忽略。

**多行补全（Multi-line Completion）**
AI一次预测多行代码，适用于生成完整的函数体、循环体或条件块。

**建议面板（Suggestion Panel）**
AI在侧边栏显示多个候选建议，你可以从中选择最合适的一个。

### 12.2 AI代码补全的工作原理

#### 12.2.1 Fill-in-the-Middle（FIM）机制

现代AI代码补全模型使用了一种叫做Fill-in-the-Middle（FIM）的技术。与传统的"从左到右"生成不同，FIM模型同时考虑光标前后的代码，来预测中间应该填入什么内容。

\`\`\`
传统生成（Left-to-Right）：
  已知上下文 → 预测 → 下一个token

FIM（Fill-in-the-Middle）：
  前缀代码 + 后缀代码 → 预测 → 中间缺失的代码
\`\`\`

FIM的优势在于它能利用光标后面的代码信息。例如，如果你正在写一个函数的实现，函数后面的代码（如调用该函数的代码）可以帮助AI推断函数的返回值类型和行为。

#### 12.2.2 上下文窗口

AI代码补全模型有一个"上下文窗口"，决定了它能看到多少代码。这个窗口通常包括：

- **当前文件**：光标前后的代码
- **相邻文件**：同一目录下的其他文件（如类型定义文件）
- **最近编辑的文件**：你最近打开和编辑过的文件
- **项目结构**：import/require语句揭示的依赖关系

不同类型的AI补全工具使用不同大小的上下文窗口。一般来说，窗口越大，AI的补全质量越高，但响应速度也越慢。

#### 12.2.3 补全的触发机制

AI代码补全通常在以下时机触发：

- **输入停顿**：你停止输入一段时间后（通常在100-300ms后）
- **特定字符**：输入某些字符后（如点号、括号、等号）
- **换行**：按下回车键后
- **手动触发**：使用快捷键手动触发补全

### 12.3 Tab补全 vs 内联建议

#### 12.3.1 Tab补全

Tab补全是最常见的AI补全形式。AI在编辑器中显示灰色（ghost text）的建议文本，你按Tab键接受建议。

**优势：**
- 速度快：一行代码一次Tab完成
- 不中断心流：你不必离开键盘操作
- 接受度高：研究表明开发者对Tab补全的接受率最高

**劣势：**
- 只能看到一个建议
- 如果建议不对，需要完全手动输入
- 对于复杂逻辑，单个建议可能不准确

#### 12.3.2 内联建议面板

一些AI补全工具提供内联建议面板，显示多个候选建议。

**优势：**
- 多个选择：你可以从中选择最合适的
- 预览功能：可以看到每个建议的完整代码
- 适合复杂场景：当单个建议可能不准确时

**劣势：**
- 需要额外的操作（选择建议）
- 可能打断心流
- 更多的认知负担

#### 12.3.3 选择策略

对于简单的、重复性的代码（如变量赋值、简单函数调用），Tab补全是最佳选择。对于复杂的、有多种可能实现的代码，建议面板可能更合适。

### 12.4 引导AI：提供上下文

#### 12.4.1 上下文的重要性

AI代码补全的质量高度依赖于你提供的上下文信息。AI没有"读心术"，它只能根据你给定的信息来推测你的意图。上下文越丰富，AI的补全就越准确。

#### 12.4.2 导入语句

导入语句是AI理解你意图的重要线索。明确导入你需要的模块和类型，可以帮助AI生成更准确的代码。

\`\`\`javascript
// 好：提供了明确的导入，AI知道可以使用哪些API
import { useState, useEffect } from 'react';
import { fetchUserData, updateUserProfile } from '@/api/user';
import type { User, UserProfile } from '@/types/user';

// 差：模糊的导入，AI不知道具体有哪些API可用
import * as userApi from '@/api/user';
\`\`\`

#### 12.4.3 函数签名

明确的函数签名告诉AI这个函数的输入和输出。AI可以根据函数签名推断函数体的实现。

\`\`\`javascript
// 好：清晰的函数签名，AI可以推断出需要实现数据获取和状态管理
async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  // AI将在这里生成补全...
}

// 差：模糊的函数签名，AI不知道你要做什么
function doStuff(x) {
  // AI不知道该生成什么...
}
\`\`\`

#### 12.4.4 变量命名

有意义的变量名是AI理解代码意图的重要线索。好的变量名可以让AI更准确地预测后续代码。

\`\`\`javascript
// 好：有意义的变量名
const activeUsers = [];
const filteredByRole = [];
const totalRevenue = 0;

// 差：无意义的变量名
const arr1 = [];
const arr2 = [];
const x = 0;
\`\`\`

#### 12.4.5 类型定义

TypeScript类型定义是引导AI的强大工具。类型定义不仅帮助AI理解数据结构，还能在编译时捕获潜在错误。

\`\`\`typescript
// 好的类型定义引导AI生成正确的代码
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  customerId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

function calculateOrderTotal(order: Order): number {
  // AI看到 Order 类型，知道 items 数组和 quantity/unitPrice 字段
  // 可以预测出 reduce 操作
}
\`\`\`

### 12.5 触发注释技巧

#### 12.5.1 什么是触发注释

触发注释是一种主动引导AI补全的策略。你写一个描述性的注释，然后让AI根据注释生成实现代码。这类似于注释驱动开发，但粒度更细——通常用于单个函数或代码块。

#### 12.5.2 触发注释的类型

**类型一：功能描述注释**
\`\`\`javascript
// 过滤出年龄大于18岁的用户，并按姓名排序
// AI可能生成：const adultUsers = users.filter(u => u.age > 18).sort((a, b) => a.name.localeCompare(b.name));
\`\`\`

**类型二：算法步骤注释**
\`\`\`javascript
// 步骤1：解析CSV数据
// 步骤2：过滤无效行
// 步骤3：转换为JSON格式
// 步骤4：按日期排序
// AI将根据每个步骤生成对应的代码
\`\`\`

**类型三：条件分支注释**
\`\`\`javascript
// 如果用户已登录，显示用户信息
// 如果用户未登录，显示登录按钮
// 如果正在加载，显示加载动画
// AI将生成对应的条件分支代码
\`\`\`

**类型四：错误处理注释**
\`\`\`javascript
// 尝试连接数据库
// 如果连接失败，重试3次
// 如果仍然失败，返回错误信息
// AI将生成try-catch和重试逻辑
\`\`\`

#### 12.5.3 触发注释的最佳实践

**实践一：注释要具体**
\`\`\`javascript
// 差：太模糊
// 处理数据

// 好：具体明确
// 将用户数据按角色分组，计算每个角色的平均年龄
\`\`\`

**实践二：使用关键词**
某些关键词可以触发AI生成特定模式的代码：
- "验证"、"检查" → 生成验证逻辑
- "转换"、"映射" → 生成数据转换代码
- "过滤"、"筛选" → 生成过滤逻辑
- "排序" → 生成排序代码
- "计算" → 生成计算逻辑
- "请求"、"获取" → 生成API调用代码

**实践三：注释包含示例数据**
\`\`\`javascript
// 输入：['apple', 'banana', 'Apple', 'BANANA']
// 输出：['apple', 'banana']（去重且统一小写）
// AI可以根据示例推断出需要去重和转换大小写
\`\`\`

### 12.6 多行补全 vs 单行补全

#### 12.6.1 单行补全

单行补全是AI预测你接下来要输入的当前行代码。

**适用场景：**
- 变量赋值
- 简单的函数调用
- 属性访问
- 条件表达式

**优势：**
- 准确率高
- 不会"过度生成"
- 容易审查

#### 12.6.2 多行补全

多行补全是AI一次预测多行代码，通常用于生成完整的代码块。

**适用场景：**
- 函数体实现
- 循环体
- 条件分支
- 模板代码

**优势：**
- 大幅减少输入量
- 保持代码风格一致
- 适合模式化的代码

**风险：**
- 准确率随代码长度下降
- 可能产生"幻觉"代码
- 审查成本增加

#### 12.6.3 多行补全的使用策略

**策略一：从小开始**
先用单行注释引导AI生成第一行代码，确认方向正确后再让AI补全剩余部分。

**策略二：分段接受**
对于多行补全，可以逐行接受，而不是一次性接受全部。

**策略三：使用明确的开始和结束标记**
\`\`\`javascript
function processData(data) {
  // BEGIN: 数据处理逻辑
  // AI将在这里生成多行补全
  // END: 数据处理逻辑
  return result;
}
\`\`\`

### 12.7 语言特定的补全策略

#### 12.7.1 JavaScript/TypeScript

**策略一：利用类型系统**
TypeScript的类型系统是引导AI的最强工具。定义清晰的接口和类型。

**策略二：利用解构和展开运算符**
AI擅长生成解构和展开运算符的使用代码。

**策略三：利用函数式编程模式**
map、filter、reduce等函数式操作是AI最容易预测的模式。

#### 12.7.2 Python

**策略一：利用类型注解**
Python 3.6+的类型注解可以显著提升AI补全质量。

**策略二：利用列表推导式**
AI在生成列表推导式方面表现出色。

**策略三：利用上下文管理器**
with语句的模式AI容易预测。

#### 12.7.3 Java

**策略一：利用Lombok注解**
Lombok等代码生成注解可以简化代码，让AI更容易理解结构。

**策略二：利用Stream API**
Stream操作的模式化程度高，AI补全准确率高。

**策略三：利用Builder模式**
Builder模式的代码结构固定，AI可以准确补全。

### 12.8 训练AI适应你的编码风格

#### 12.8.1 风格一致性

AI代码补全通过学习你的代码库来适应你的编码风格。因此，保持代码风格的一致性非常重要。

**做法：**
- 使用代码格式化工具（Prettier、ESLint、Black）
- 遵循一致的命名规范
- 使用一致的代码结构

#### 12.8.2 提供风格示例

在项目中创建一些"样板代码"，展示你期望的代码风格。AI会学习这些样板并在补全时模仿。

\`\`\`javascript
// 在你的项目中创建一个风格示例文件
// style-example.js

/**
 * 函数示例：展示团队期望的代码风格
 * 
 * 命名规范：camelCase
 * 注释规范：JSDoc
 * 错误处理：try-catch + 错误日志
 * 导出规范：命名导出
 */
export async function exampleFunction(input: string): Promise<Result> {
  // 输入验证
  if (!input) {
    throw new Error('输入不能为空');
  }

  try {
    // 核心逻辑
    const result = await processData(input);
    return result;
  } catch (error) {
    // 错误处理
    console.error('处理失败:', error);
    throw error;
  }
}
\`\`\`

#### 12.8.3 配置AI补全工具

大多数AI补全工具都支持配置选项，可以调整补全行为：

- **补全长度**：控制AI生成代码的最大长度
- **补全触发延迟**：控制AI在输入停顿后多久触发补全
- **补全风格**：控制AI的补全风格（保守/激进）
- **忽略文件**：指定哪些文件不参与补全训练

### 12.9 处理不正确的补全

#### 12.9.1 接受-修改-拒绝框架

当AI提供的补全建议不完全正确时，你可以采用"接受-修改-拒绝"框架来决定如何处理。

**接受（Accept）**
当补全完全正确时，直接接受（Tab键）。

**修改（Modify）**
当补全大体正确但需要微调时，接受后手动修改。这比完全手动输入更高效。

**拒绝（Reject）**
当补全完全错误时，忽略它并继续手动输入。你也可以提供更多上下文，让AI重新生成。

#### 12.9.2 常见补全错误及处理

**错误一：语法错误**
AI有时会生成语法不正确的代码。

处理：检查代码是否能通过语法检查，使用linter自动检测。

**错误二：使用不存在的API**
AI可能"发明"不存在的函数或方法。

处理：检查API是否存在，使用TypeScript类型检查。

**错误三：逻辑错误**
AI可能生成逻辑上不正确的代码。

处理：始终理解AI生成的代码，不要盲目接受。

**错误四：安全漏洞**
AI可能生成存在安全风险的代码。

处理：对安全敏感的代码（认证、加密、数据库操作）进行手动审查。

#### 12.9.3 改进补全质量的策略

**提供更多上下文**
如果AI的补全持续不准确，说明上下文不够充分。添加更多导入语句、类型定义和注释。

**调整补全工具的设置**
尝试调整补全工具的配置，如降低补全长度、增加触发延迟等。

**使用更精确的命名**
检查你的变量名和函数名是否足够描述性，AI需要清晰的命名来理解意图。

### 12.10 AI代码补全工具对比

#### 12.10.1 GitHub Copilot

**优势：**
- 生态系统最成熟，插件支持最广泛
- 代码补全质量高，尤其在JavaScript/TypeScript/Python上
- 支持多种IDE（VS Code、JetBrains、Neovim等）
- 提供Copilot Chat功能

**劣势：**
- 需要付费订阅
- 隐私问题（代码发送到云端处理）
- 在某些小众语言上表现一般

#### 12.10.2 Cursor Tab

**优势：**
- 补全速度快，延迟极低
- 上下文理解能力强，能利用整个项目的信息
- 实时预测，几乎无感知延迟
- 与Cursor编辑器深度集成

**劣势：**
- 仅限Cursor编辑器
- 需要Cursor Pro订阅

#### 12.10.3 Supermaven

**优势：**
- 超长上下文窗口（可达100万token）
- 补全速度快
- 支持多种IDE

**劣势：**
- 相对较新，生态不如Copilot成熟
- 社区插件较少

#### 12.10.4 Codeium

**优势：**
- 个人使用免费
- 支持多种IDE
- 提供代码搜索功能

**劣势：**
- 补全质量在某些场景下不如Copilot
- 云端处理，隐私考虑

#### 12.10.5 工具选择建议

| 使用场景 | 推荐工具 |
|---------|---------|
| 个人开发者，预算有限 | Codeium（免费） |
| 专业开发者，追求质量 | GitHub Copilot |
| 使用Cursor编辑器的开发者 | Cursor Tab |
| 大型项目，需要长上下文 | Supermaven |
| 企业团队，需要自托管 | Tabby（开源自托管） |

### 12.11 本章小结

AI代码补全是开发者日常使用最频繁的AI功能。掌握以下要点可以让你充分发挥AI补全的潜力：

1. **理解FIM机制**：AI同时考虑光标前后的代码来预测补全
2. **提供丰富的上下文**：导入语句、类型定义、有意义的命名
3. **善用触发注释**：用注释引导AI生成特定模式的代码
4. **区分场景使用**：简单代码用Tab补全，复杂代码用建议面板
5. **建立接受-修改-拒绝习惯**：不完全正确的补全可以修改后使用
6. **选择适合的工具**：根据个人需求和使用场景选择AI补全工具

记住：AI补全是一个协作工具，不是替代品。你的代码审查和判断能力仍然是不可替代的。`,
    code: `// ============================================================
// 第12章代码演示：AI代码补全模拟器
// ============================================================
// 这个模拟器展示了AI代码补全的基本原理：
// 分析部分代码和上下文，预测补全内容

class CodeCompletionEngine {
  constructor() {
    // 代码模式库：常见代码模式的补全模板
    this.patterns = [
      // 函数声明模式
      {
        trigger: /function\\s+(\\w+)\\s*\\(/,
        complete: (match, context) => {
          const name = match[1];
          return \`) {
  // TODO: 实现 \${name} 函数
  throw new Error('Not implemented');
}\`;
        }
      },
      // 箭头函数模式
      {
        trigger: /const\\s+(\\w+)\\s*=\\s*\\(/,
        complete: (match, context) => {
          const name = match[1];
          return \`) => {
  // \${name} 函数体
  return null;
};\`;
        }
      },
      // 数组 map 模式
      {
        trigger: /(\\w+)\\.map\\($/,
        complete: (match, context) => {
          const arr = match[1];
          return \`(item) => {
  return item;
});\`;
        }
      },
      // 数组 filter 模式
      {
        trigger: /(\\w+)\\.filter\\($/,
        complete: (match, context) => {
          return \`(item) => {
  return item !== null && item !== undefined;
});\`;
        }
      },
      // 数组 reduce 模式
      {
        trigger: /(\\w+)\\.reduce\\($/,
        complete: (match, context) => {
          return \`(acc, item) => {
  acc.push(item);
  return acc;
}, []);\`;
        }
      },
      // if 条件模式
      {
        trigger: /if\\s*\\($/,
        complete: (match, context) => {
          return \`condition) {
  // 条件成立时的处理
}\`;
        }
      },
      // for 循环模式
      {
        trigger: /for\\s*\\($/,
        complete: (match, context) => {
          return \`let i = 0; i < array.length; i++) {
  const item = array[i];
  // 处理每个元素
}\`;
        }
      },
      // try-catch 模式
      {
        trigger: /try\\s*\\{/,
        complete: (match, context) => {
          return \`
  // 尝试执行可能抛出异常的代码
} catch (error) {
  console.error('捕获到错误:', error);
  throw error;
}\`;
        }
      },
      // 注释驱动补全
      {
        trigger: /\\/\\/\\s*(验证|validate|检查|check)/i,
        complete: (match, context) => {
          return \`
if (input === null || input === undefined) {
  throw new Error('输入不能为空');
}
if (typeof input !== 'string' || input.trim().length === 0) {
  throw new Error('输入无效');
}\`;
        }
      },
      // API 请求模式
      {
        trigger: /\\/\\/\\s*(请求|fetch|获取|api)/i,
        complete: (match, context) => {
          return \`
const response = await fetch(url);
if (!response.ok) {
  throw new Error(\\\`HTTP \\\${response.status}: \\\${response.statusText}\\\`);
}
const data = await response.json();
return data;\`;
        }
      }
    ];
  }

  /**
   * 分析代码上下文
   */
  analyzeContext(code, cursorPosition) {
    const before = code.substring(0, cursorPosition);
    const after = code.substring(cursorPosition);

    // 分析当前行
    const lines = before.split('\\n');
    const currentLine = lines[lines.length - 1];

    // 分析上下文特征
    const context = {
      currentLine,
      previousLines: lines.slice(-5, -1),
      nextContent: after.split('\\n')[0] || '',
      indentation: currentLine.match(/^(\\s*)/)?.[1] || '',
      inFunction: before.includes('function') || before.includes('=>'),
      inClass: before.includes('class '),
      inTryBlock: before.lastIndexOf('try {') > before.lastIndexOf('}'),
      recentImports: [],
      recentVariables: []
    };

    // 提取最近使用的变量
    const varMatches = before.matchAll(/(?:const|let|var)\\s+(\\w+)\\s*=/g);
    for (const match of varMatches) {
      context.recentVariables.push(match[1]);
    }

    // 提取导入
    const importMatches = before.matchAll(/import\\s+.*?from\\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      context.recentImports.push(match[1]);
    }

    return context;
  }

  /**
   * 预测代码补全
   */
  predictCompletion(code, cursorPosition) {
    const context = this.analyzeContext(code, cursorPosition);
    const currentLine = context.currentLine;

    // 尝试匹配各种模式
    for (const pattern of this.patterns) {
      const match = currentLine.match(pattern.trigger);
      if (match) {
        return {
          completion: pattern.complete(match, context),
          confidence: 0.85,
          pattern: pattern.trigger.source
        };
      }
    }

    // 根据上下文特征进行启发式补全
    if (currentLine.trim().endsWith('=')) {
      return {
        completion: ' ',
        confidence: 0.9,
        pattern: 'assignment'
      };
    }

    if (currentLine.trim().endsWith('.')) {
      return {
        completion: 'then(result => {',
        confidence: 0.7,
        pattern: 'method-chain'
      };
    }

    if (currentLine.trim().endsWith('return')) {
      return {
        completion: ' null;',
        confidence: 0.6,
        pattern: 'return-statement'
      };
    }

    // 尝试补全最近的变量引用
    if (context.recentVariables.length > 0) {
      const lastVar = context.recentVariables[context.recentVariables.length - 1];
      return {
        completion: lastVar,
        confidence: 0.5,
        pattern: 'variable-reference'
      };
    }

    return {
      completion: null,
      confidence: 0,
      pattern: 'unknown'
    };
  }

  /**
   * 多行补全：预测完整的代码块
   */
  predictMultiLine(code, cursorPosition) {
    const context = this.analyzeContext(code, cursorPosition);
    const currentLine = context.currentLine.trim();

    // 检测函数声明
    if (currentLine.match(/function\\s+(\\w+)\\s*\\([^)]*\\)\\s*\\{?\\s*$/)) {
      return {
        completion: \`
  // 参数验证
  // 核心逻辑
  // 返回结果
  return null;
}\`,
        confidence: 0.8,
        type: 'function-body'
      };
    }

    // 检测组件声明
    if (currentLine.match(/(?:export\\s+)?(?:default\\s+)?function\\s+(\\w+)\\s*\\(/)) {
      return {
        completion: \`props) {
  const { data, loading, error } = props;
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}\`,
        confidence: 0.75,
        type: 'component-body'
      };
    }

    // 检测 useEffect
    if (currentLine.includes('useEffect')) {
      return {
        completion: \`(() => {
  // 副作用逻辑
  const fetchData = async () => {
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
  
  return () => {
    // 清理函数
  };
}, []);\`,
        confidence: 0.8,
        type: 'useEffect'
      };
    }

    return {
      completion: null,
      confidence: 0,
      type: 'unknown'
    };
  }

  /**
   * 模拟Tab补全的展示格式
   */
  formatGhostText(prediction) {
    if (!prediction.completion) return '';
    return \`\\x1b[90m\${prediction.completion}\\x1b[0m\`;
  }
}

// ============================================================
// 演示：模拟AI代码补全过程
// ============================================================

console.log('╔══════════════════════════════════════════════╗');
console.log('║   AI 代码补全模拟器 - 第12章演示            ║');
console.log('╚══════════════════════════════════════════════╝\\n');

const engine = new CodeCompletionEngine();

// 演示1：单行补全
console.log('【演示1】单行补全预测\\n');

const scenarios = [
  { code: 'function calculateTotal(', cursor: 22, desc: '函数声明' },
  { code: 'const result = items.map(', cursor: 24, desc: '数组 map' },
  { code: '// 验证输入数据\\n', cursor: 9, desc: '触发注释' },
  { code: 'try {\\n  ', cursor: 6, desc: 'try-catch' },
  { code: 'if (', cursor: 3, desc: 'if 条件' },
  { code: 'const users = activeUsers.filter(', cursor: 34, desc: '数组 filter' },
];

for (const scenario of scenarios) {
  console.log(\`场景：\${scenario.desc}\`);
  console.log(\`代码：\${scenario.code.replace(/\\n/g, '\\\\n')}←光标\`);
  const prediction = engine.predictCompletion(scenario.code, scenario.cursor);
  console.log(\`补全：\${prediction.completion || '(无预测)'}\`);
  console.log(\`置信度：\${(prediction.confidence * 100).toFixed(0)}%\`);
  console.log(\`模式：\${prediction.pattern}\`);
  console.log('---');
}

// 演示2：多行补全
console.log('\\n【演示2】多行补全预测\\n');

const multiLineScenarios = [
  {
    code: 'async function fetchUserData(userId) {\\n',
    cursor: 37,
    desc: '异步函数体'
  },
  {
    code: 'useEffect(',
    cursor: 9,
    desc: 'React useEffect'
  },
  {
    code: 'function UserProfile(',
    cursor: 20,
    desc: 'React 组件'
  }
];

for (const scenario of multiLineScenarios) {
  console.log(\`场景：\${scenario.desc}\`);
  console.log(\`代码：\${scenario.code.replace(/\\n/g, '\\\\n')}←光标\`);
  const prediction = engine.predictMultiLine(scenario.code, scenario.cursor);
  console.log(\`补全：\${prediction.completion || '(无预测)'}\`);
  console.log(\`置信度：\${(prediction.confidence * 100).toFixed(0)}%\`);
  console.log('---');
}

// 演示3：上下文分析
console.log('\\n【演示3】代码上下文分析\\n');

const contextCode = \`
import { useState, useEffect } from 'react';
import { fetchUser } from '@/api/user';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect
\`;

const context = engine.analyzeContext(contextCode, contextCode.length);
console.log('上下文分析结果：');
console.log(\`  当前行：\${context.currentLine}\`);
console.log(\`  缩进：\${context.indentation.length} 空格\`);
console.log(\`  在函数中：\${context.inFunction}\`);
console.log(\`  在类中：\${context.inClass}\`);
console.log(\`  最近变量：\${context.recentVariables.join(', ')}\`);
console.log(\`  导入模块：\${context.recentImports.join(', ')}\`);

// 演示4：接受-修改-拒绝流程
console.log('\\n【演示4】接受-修改-拒绝 (AMR) 框架\\n');

const amrDemo = {
  scenario: 'AI 建议补全代码',
  suggestions: [
    {
      completion: 'return data.filter(item => item.active);',
      evaluation: '完全正确',
      action: 'ACCEPT → 按Tab接受',
      result: '代码直接可用'
    },
    {
      completion: 'return data.filter(item => item.active === true);',
      evaluation: '基本正确，但=== true多余',
      action: 'MODIFY → 接受后删除多余部分',
      result: '删除 === true 后使用'
    },
    {
      completion: 'return data.filter(item => item.status = "active");',
      evaluation: '有bug（使用了赋值=而非比较===）',
      action: 'REJECT → 忽略建议，手动输入',
      result: '自己写正确的代码'
    }
  ]
};

for (const suggestion of amrDemo.suggestions) {
  console.log(\`AI建议：\${suggestion.completion}\`);
  console.log(\`评估：\${suggestion.evaluation}\`);
  console.log(\`行动：\${suggestion.action}\`);
  console.log(\`结果：\${suggestion.result}\`);
  console.log('---');
}

// 演示5：补全工具对比
console.log('\\n【演示5】补全工具性能对比\\n');

const tools = [
  { name: 'GitHub Copilot', speed: '200-500ms', accuracy: '92%', context: '中等', cost: '付费' },
  { name: 'Cursor Tab', speed: '50-150ms', accuracy: '90%', context: '大', cost: '付费' },
  { name: 'Supermaven', speed: '100-300ms', accuracy: '88%', context: '超大', cost: '付费' },
  { name: 'Codeium', speed: '150-400ms', accuracy: '85%', context: '中等', cost: '免费' },
  { name: 'Tabby', speed: '50-200ms', accuracy: '80%', context: '自定', cost: '自托管' }
];

console.log('工具名称          | 速度       | 准确率 | 上下文 | 费用');
console.log('-'.repeat(60));
for (const tool of tools) {
  console.log(\`\${tool.name.padEnd(18)}| \${tool.speed.padEnd(10)} | \${tool.accuracy.padEnd(6)} | \${tool.context.padEnd(6)} | \${tool.cost}\`);
}

console.log('\\n╔══════════════════════════════════════════════╗');
console.log('║     代码补全演示完成！                      ║');
console.log('╚══════════════════════════════════════════════╝');`,
  },

  // ============================================================
  // 第 13 章：AI代码审查：发现潜在问题
  // ============================================================
  {
    id: "ai-code-review",
    icon: "🔍",
    group: "AI辅助编码",
    title: "AI代码审查：发现潜在问题",
    content: `## 第13章：AI代码审查——发现潜在问题

### 13.1 引言：AI作为代码审查助手

代码审查是软件开发中不可或缺的环节，但人工审查耗时、费力，且容易遗漏问题。AI代码审查提供了一种补充方案——它可以快速扫描代码，发现潜在的问题，让人类审查者能够将精力集中在更高层次的架构和设计问题上。

AI代码审查不是要替代人类审查，而是要让人类审查更高效。AI可以处理那些机械的、模式化的检查工作，而人类可以专注于创造性、战略性思考。

#### 13.1.1 为什么需要AI代码审查

**人工代码审查的痛点：**
- 时间成本高：资深工程师审查代码的时间可能占工作时间的20-30%
- 审查疲劳：长时间审查后，注意力下降，漏检率上升
- 知识盲区：每个审查者都有自己不熟悉的领域
- 标准不一致：不同审查者的审查标准可能不同
- 审查瓶颈：审查者忙碌时，代码合并被阻塞

**AI代码审查的优势：**
- 24/7可用：随时可以进行审查
- 一致性：始终使用相同的审查标准
- 全面性：不会遗漏常见的检查项
- 速度：可以在几秒内完成审查
- 辅助学习：AI的审查意见可以帮助开发者学习最佳实践

### 13.2 AI能发现什么

#### 13.2.1 Bug检测

AI可以检测多种类型的Bug：

**空指针/空引用**
\`\`\`javascript
// AI会标记：user可能为null
function getUserName(user) {
  return user.name.toUpperCase(); // 潜在的空指针异常
}

// 建议修复：
function getUserName(user) {
  return user?.name?.toUpperCase() ?? 'Unknown';
}
\`\`\`

**类型错误**
\`\`\`javascript
// AI会标记：类型不匹配
function calculateTotal(price, quantity) {
  return price * quantity; // 如果price是字符串会导致意外结果
}

// 建议修复：
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}
\`\`\`

**逻辑错误**
\`\`\`javascript
// AI会标记：比较逻辑可能反了
function isEligible(age) {
  if (age < 18) {
    return true; // 可能是逻辑错误，应该 return false
  }
  return false;
}
\`\`\`

**异步处理错误**
\`\`\`javascript
// AI会标记：缺少 await
async function fetchData() {
  const data = fetch('/api/users'); // 应该 await fetch
  return data.json(); // data 是一个 Promise，不是 Response
}
\`\`\`

#### 13.2.2 安全问题

**注入攻击**
\`\`\`javascript
// AI会标记：SQL注入风险
const query = \`SELECT * FROM users WHERE name = '\${userInput}'\`;

// 建议：使用参数化查询
const query = 'SELECT * FROM users WHERE name = ?';
db.query(query, [userInput]);
\`\`\`

**XSS漏洞**
\`\`\`javascript
// AI会标记：XSS风险
element.innerHTML = userInput; // 危险

// 建议：使用安全的方式
element.textContent = userInput;
\`\`\`

**敏感信息泄露**
\`\`\`javascript
// AI会标记：敏感信息泄露
console.log('用户登录，密码:', password); // 不要记录密码
logger.info('API key:', apiKey); // 不要记录API密钥
\`\`\`

**不安全的加密**
\`\`\`javascript
// AI会标记：使用不安全的哈希算法
const hash = md5(password); // MD5不安全

// 建议：使用安全的哈希算法
const hash = await bcrypt.hash(password, 10);
\`\`\`

#### 13.2.3 性能问题

**N+1查询**
\`\`\`javascript
// AI会标记：N+1查询问题
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
  // 每个用户都会触发一次数据库查询
}

// 建议：批量查询
const userIds = users.map(u => u.id);
const allPosts = await db.query('SELECT * FROM posts WHERE user_id IN (?)', [userIds]);
\`\`\`

**不必要的重新渲染**
\`\`\`javascript
// AI会标记：不必要的重新渲染
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserItem key={user.id} user={user} onClick={() => handleClick(user.id)} />
        // 每次渲染都创建新的onClick函数
      ))}
    </div>
  );
}
\`\`\`

**内存泄漏**
\`\`\`javascript
// AI会标记：潜在的内存泄漏
useEffect(() => {
  const interval = setInterval(() => {
    // 定时任务
  }, 1000);
  // 缺少清理函数
}, []);
\`\`\`

#### 13.2.4 代码风格问题

AI可以检测代码风格问题，包括：
- 不一致的命名风格
- 过长的函数
- 过深的嵌套
- 魔法数字
- 重复代码
- 未使用的变量
- 过于复杂的表达式

#### 13.2.5 最佳实践违反

- 缺少错误处理
- 未使用严格模式
- 使用了已废弃的API
- 不正确的Promise使用
- 缺少输入验证

### 13.3 设置AI代码审查

#### 13.3.1 集成到开发流程

AI代码审查可以集成到开发流程的多个环节：

**环节一：IDE中实时审查**
在编码过程中，AI实时分析代码并给出建议。这类似于增强版的Linter。

**环节二：Git提交前审查**
在提交代码前，AI自动审查变更内容，给出审查意见。

**环节三：Pull Request审查**
在PR中，AI自动审查代码变更，生成审查报告。

**环节四：CI/CD管道中审查**
在持续集成管道中，AI作为质量门禁，自动审查代码。

#### 13.3.2 配置审查规则

AI代码审查需要配置审查规则，以匹配你的项目需求：

\`\`\`yaml
# AI代码审查配置示例
review_rules:
  severity_levels:
    - critical: 必须修复（安全漏洞、严重Bug）
    - high: 强烈建议修复（性能问题、潜在Bug）
    - medium: 建议修复（代码风格、最佳实践）
    - low: 可选修复（优化建议、风格偏好）
  
  focus_areas:
    - security: true       # 安全检查
    - performance: true    # 性能检查
    - reliability: true    # 可靠性检查
    - maintainability: true # 可维护性检查
    - style: false         # 暂时关闭风格检查
  
  ignore_patterns:
    - "**/test/**"         # 忽略测试文件
    - "**/vendor/**"       # 忽略第三方代码
    - "**/*.generated.*"   # 忽略自动生成的代码
\`\`\`

### 13.4 审查提示词模板

#### 13.4.1 通用代码审查提示词

\`\`\`
请审查以下代码，从以下角度进行分析：

1. **安全性**：是否存在安全漏洞（注入、XSS、敏感信息泄露等）？
2. **正确性**：逻辑是否正确？边界条件是否处理？
3. **性能**：是否存在性能问题（N+1查询、不必要的循环等）？
4. **可维护性**：代码是否清晰？命名是否合理？是否有重复代码？
5. **错误处理**：是否充分处理了错误和异常情况？
6. **最佳实践**：是否遵循了语言/框架的最佳实践？

对于每个发现的问题，请提供：
- 问题描述
- 严重程度（critical/high/medium/low）
- 具体的代码位置
- 修复建议和示例代码

代码：
\`\`\`javascript
{在此粘贴代码}
\`\`\`
\`\`\`

#### 13.4.2 安全审查提示词

\`\`\`
请从安全专家的角度审查以下代码，重点关注：

1. OWASP Top 10 漏洞
2. 认证和授权问题
3. 数据验证和清理
4. 加密和安全配置
5. 敏感数据保护
6. 依赖安全

对于每个安全问题，提供：
- 漏洞类型和CWE编号
- 攻击场景描述
- 修复方案（包括代码示例）
- 预防措施

代码：
\`\`\`
{在此粘贴代码}
\`\`\`
\`\`\`

#### 13.4.3 性能审查提示词

\`\`\`
请从性能角度审查以下代码，分析：

1. 时间复杂度
2. 空间复杂度
3. 数据库查询效率
4. 内存使用
5. 网络请求效率
6. 缓存策略

对于每个性能问题，提供优化建议和基准测试方案。

代码：
\`\`\`
{在此粘贴代码}
\`\`\`
\`\`\`

### 13.5 审查要点详解

#### 13.5.1 错误处理审查

**检查清单：**
- □ 所有可能抛出异常的操作都有try-catch
- □ 异步操作的错误被正确处理
- □ 错误信息对用户友好但不暴露内部信息
- □ 错误被正确记录到日志系统
- □ 失败的操作有重试或降级机制
- □ Promise链有.catch处理

#### 13.5.2 边界情况审查

**检查清单：**
- □ 空值/null/undefined处理
- □ 空数组/空字符串处理
- □ 数值范围检查（负数、零、极大值）
- □ 字符串长度限制
- □ 数组索引越界检查
- □ 日期时间边界（闰年、时区）

#### 13.5.3 输入验证审查

**检查清单：**
- □ 所有用户输入都经过验证
- □ 使用了白名单验证而非黑名单
- □ 长度限制合理
- □ 类型检查正确
- □ 特殊字符被正确处理
- □ 文件上传有类型和大小限制

#### 13.5.4 资源管理审查

**检查清单：**
- □ 数据库连接被正确关闭
- □ 文件句柄被正确释放
- □ 定时器被正确清除
- □ 事件监听器被正确移除
- □ 内存使用合理（无泄漏）
- □ 网络请求有超时设置

#### 13.5.5 并发安全审查

**检查清单：**
- □ 共享状态有适当的同步机制
- □ 不存在竞态条件
- □ 异步操作的顺序正确
- □ 事务处理正确
- □ 锁的使用合理（无死锁风险）

### 13.6 AI与人工审查的结合

#### 13.6.1 分工策略

AI和人工审查者应该各司其职：

**AI负责：**
- 机械性检查（格式、命名、导入排序）
- 模式匹配检查（已知的安全漏洞模式、性能反模式）
- 一致性检查（代码风格是否一致）
- 文档检查（是否有必要的注释和文档）

**人工负责：**
- 架构合理性评估
- 业务逻辑正确性验证
- 设计决策评估
- 团队规范和约定检查
- 用户体验影响评估

#### 13.6.2 审查流程

\`\`\`
1. AI预审查
   ├── 自动扫描代码变更
   ├── 发现问题并分类
   └── 生成审查报告

2. 人工审查
   ├── 查看AI审查报告
   ├── 确认/驳回AI发现的问题
   ├── 发现AI未覆盖的问题
   └── 给出最终审查意见

3. 作者修复
   ├── 根据审查意见修改代码
   ├── 标记已修复的问题
   └── 重新提交审查

4. 再次审查
   ├── AI重新扫描
   └── 人工确认修复
\`\`\`

### 13.7 语言特定审查考量

#### 13.7.1 JavaScript/TypeScript

- 检查是否使用 === 而非 ==
- 检查 var 的使用（应使用 const/let）
- 检查 Promise 是否正确处理
- 检查 this 绑定问题
- 检查闭包中的内存泄漏
- 检查 TypeScript 的 any 类型滥用

#### 13.7.2 Python

- 检查可变默认参数
- 检查列表推导式中的副作用
- 检查异常的捕获范围是否过宽
- 检查文件操作是否使用 with 语句
- 检查全局变量的使用
- 检查循环中修改列表

#### 13.7.3 Java

- 检查资源是否正确关闭（try-with-resources）
- 检查 equals 和 hashCode 的一致性
- 检查 null 处理
- 检查线程安全
- 检查序列化问题
- 检查字符串拼接效率

#### 13.7.4 Go

- 检查 error 是否被忽略
- 检查 defer 的使用
- 检查 goroutine 泄漏
- 检查 channel 的关闭
- 检查竞态条件
- 检查接口的 nil 判断

### 13.8 局限性和误报

#### 13.8.1 AI代码审查的局限性

**局限一：上下文理解有限**
AI可能不理解项目的特殊业务逻辑，将符合业务需求的代码标记为问题。

**局限二：无法评估架构设计**
AI擅长发现代码层面的问题，但难以评估架构层面的设计决策。

**局限三：无法理解团队约定**
每个团队有自己的编码约定，AI可能不了解这些约定。

**局限四：缺乏运行时信息**
AI只能进行静态分析，无法发现运行时才会出现的问题。

#### 13.8.2 处理误报

**误报类型：**
- 将正确的代码标记为有问题的代码
- 将低风险的问题标记为高严重性
- 提出不适用于当前场景的建议

**处理策略：**
- 建立误报反馈机制，持续改进AI审查准确性
- 配置规则白名单，排除不适合的规则
- 使用注释标记来跳过特定检查
- 定期审查和调整审查规则

### 13.9 案例分析

#### 13.9.1 案例一：安全漏洞检测

**场景：** 一个用户登录接口

**AI发现的原始代码：**
\`\`\`javascript
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  const user = await db.query(query);
  if (user) {
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});
\`\`\`

**AI审查发现的问题：**
1. SQL注入风险（Critical）
2. 密码明文存储（Critical）
3. 密码明文比较（Critical）
4. 缺少输入验证（High）
5. 缺少速率限制（Medium）
6. 错误信息可能泄露用户存在性（Low）

**修复后的代码：**
\`\`\`javascript
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // 输入验证
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  // 速率限制检查
  const attempts = await rateLimiter.get(username);
  if (attempts > 5) {
    return res.status(429).json({ error: '登录尝试次数过多，请稍后再试' });
  }
  
  // 参数化查询
  const user = await db.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  
  // 使用安全的密码比较
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    await rateLimiter.increment(username);
    return res.status(401).json({ error: '认证失败' });
  }
  
  res.json({ token: generateToken(user) });
});
\`\`\`

#### 13.9.2 案例二：性能问题检测

**场景：** 一个用户列表页面

**AI发现的原始代码：**
\`\`\`javascript
async function getUserList() {
  const users = await db.query('SELECT * FROM users');
  const result = [];
  for (const user of users) {
    const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
    const comments = await db.query('SELECT * FROM comments WHERE user_id = ?', [user.id]);
    result.push({
      ...user,
      postCount: posts.length,
      commentCount: comments.length,
      recentPosts: posts.slice(0, 5)
    });
  }
  return result;
}
\`\`\`

**AI审查发现的问题：**
1. N+1查询问题（High）
2. 未使用数据库的聚合查询（High）
3. 查询了所有字段（SELECT *）（Medium）
4. 缺少分页（Medium）

**修复后的代码：**
\`\`\`javascript
async function getUserList(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  
  // 使用JOIN和聚合查询替代N+1
  const users = await db.query(\`
    SELECT 
      u.id, u.name, u.email, u.created_at,
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT c.id) as comment_count
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
    LEFT JOIN comments c ON c.user_id = u.id
    GROUP BY u.id
    LIMIT ? OFFSET ?
  \`, [pageSize, offset]);
  
  return users;
}
\`\`\`

### 13.10 CI/CD集成

#### 13.10.1 集成方式

AI代码审查可以集成到CI/CD流水线中，作为质量门禁的一部分。

\`\`\`yaml
# GitHub Actions 示例
name: AI Code Review
on: [pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: AI Code Review
        uses: ai-review-action@v1
        with:
          severity: critical,high
          fail_on: critical
          comment_on_pr: true
\`\`\`

#### 13.10.2 质量门禁策略

**宽松策略：** AI审查仅作为建议，不阻塞合并
**标准策略：** Critical问题阻塞合并，High问题发出警告
**严格策略：** Critical和High问题都阻塞合并

### 13.11 本章小结

AI代码审查是提升代码质量的有力工具，但它不能替代人工审查。最佳实践是将AI审查与人工审查相结合，让AI处理机械性检查，让人类专注于高层次的思考和决策。

关键要点：
1. AI可以发现Bug、安全问题、性能问题和风格问题
2. 使用结构化的审查提示词模板
3. 建立系统化的审查检查清单
4. AI和人工审查应该分工协作
5. 注意AI审查的局限性，合理处理误报
6. 将AI审查集成到CI/CD流程中`,
    code: `// ============================================================
// 第13章代码演示：AI代码审查模拟器
// ============================================================
// 这个模拟器展示了AI代码审查的基本原理：
// 分析代码，发现潜在问题，生成审查意见

class CodeReviewer {
  constructor() {
    // 审查规则库
    this.rules = [
      // 安全规则
      {
        id: 'SEC-001',
        category: 'security',
        severity: 'critical',
        pattern: /\\beval\\s*\\(/,
        message: '使用了 eval() 函数，存在代码注入风险',
        suggestion: '避免使用 eval()，使用 JSON.parse() 或其他安全的替代方案'
      },
      {
        id: 'SEC-002',
        category: 'security',
        severity: 'critical',
        pattern: /innerHTML\\s*=/,
        message: '直接设置 innerHTML 存在 XSS 攻击风险',
        suggestion: '使用 textContent 或经过消毒的 HTML 内容'
      },
      {
        id: 'SEC-003',
        category: 'security',
        severity: 'critical',
        pattern: /password\\s*[=:]\\s*['"]\\w+['"]/i,
        message: '可能存在密码硬编码',
        suggestion: '使用环境变量或安全的配置管理来存储密码'
      },
      {
        id: 'SEC-004',
        category: 'security',
        severity: 'high',
        pattern: /md5\\s*\\(|sha1\\s*\\(/i,
        message: '使用了不安全的哈希算法（MD5/SHA1）',
        suggestion: '使用 bcrypt、argon2 或 SHA-256 以上版本'
      },
      // 错误处理规则
      {
        id: 'ERR-001',
        category: 'error_handling',
        severity: 'high',
        pattern: /async\\s+function.*\\{[^}]*await[^}]*\\}(?!\\s*catch)/s,
        message: '异步函数缺少错误处理',
        suggestion: '使用 try-catch 或 .catch() 处理异步错误'
      },
      {
        id: 'ERR-002',
        category: 'error_handling',
        severity: 'medium',
        pattern: /JSON\\.parse\\((?!.*try|.*catch)/,
        message: 'JSON.parse() 未包裹在 try-catch 中',
        suggestion: '将 JSON.parse() 放在 try-catch 中处理解析错误'
      },
      // 性能规则
      {
        id: 'PERF-001',
        category: 'performance',
        severity: 'high',
        pattern: /for\\s*\\([^)]*\\)\\s*\\{[^}]*await\\s+db\\.query/,
        message: '检测到循环中的数据库查询（N+1问题）',
        suggestion: '使用批量查询或 JOIN 替代循环中的数据库查询'
      },
      {
        id: 'PERF-002',
        category: 'performance',
        severity: 'medium',
        pattern: /SELECT\\s+\\*\\s+FROM/i,
        message: '使用了 SELECT *，可能查询了不必要的字段',
        suggestion: '明确指定需要的字段，减少数据传输量'
      },
      {
        id: 'PERF-003',
        category: 'performance',
        severity: 'low',
        pattern: /console\\.log\\(/,
        message: '生产代码中保留了 console.log',
        suggestion: '移除或使用环境变量控制日志输出'
      },
      // 代码质量规则
      {
        id: 'QUAL-001',
        category: 'code_quality',
        severity: 'medium',
        pattern: /function\\s+\\w+\\s*\\([^)]*\\)\\s*\\{[^}]{200,}\\}/,
        message: '函数过长（超过200字符），建议拆分',
        suggestion: '将长函数拆分为多个小函数，每个函数只做一件事'
      },
      {
        id: 'QUAL-002',
        category: 'code_quality',
        severity: 'low',
        pattern: /var\\s+/,
        message: '使用了 var 声明变量',
        suggestion: '使用 const 或 let 替代 var'
      },
      {
        id: 'QUAL-003',
        category: 'code_quality',
        severity: 'medium',
        pattern: /\\b(\\d{2,})\\b(?!.*const|.*enum|.*STATUS|.*CODE)/,
        message: '检测到魔法数字',
        suggestion: '将数字提取为有意义的常量'
      },
      {
        id: 'QUAL-004',
        category: 'code_quality',
        severity: 'medium',
        pattern: /catch\\s*\\(\\s*\\w*\\s*\\)\\s*\\{\\s*\\}/,
        message: '空的 catch 块，错误被静默吞掉',
        suggestion: '至少记录错误日志，或重新抛出错误'
      },
      // 输入验证规则
      {
        id: 'INP-001',
        category: 'input_validation',
        severity: 'high',
        pattern: /req\\.body\\.(\\w+)(?!.*validate|.*sanitize|.*check)/,
        message: '直接使用请求体数据，缺少输入验证',
        suggestion: '对用户输入进行验证和清理'
      }
    ];
  }

  /**
   * 审查代码，返回发现的问题列表
   */
  review(code) {
    const issues = [];
    
    for (const rule of this.rules) {
      const matches = code.matchAll(new RegExp(rule.pattern.source, 'g'));
      for (const match of matches) {
        // 获取问题所在的行号
        const lines = code.substring(0, match.index).split('\\n');
        const line = lines.length;
        const lineContent = code.split('\\n')[line - 1]?.trim() || '';
        
        issues.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          line: line,
          message: rule.message,
          suggestion: rule.suggestion,
          code: lineContent.substring(0, 80)
        });
      }
    }
    
    return issues;
  }

  /**
   * 生成审查报告
   */
  generateReport(code, filename = 'unknown.js') {
    const issues = this.review(code);
    
    // 按严重程度排序
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    // 统计
    const stats = {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    };
    
    // 按类别统计
    const byCategory = {};
    for (const issue of issues) {
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
    }
    
    return {
      filename,
      timestamp: new Date().toISOString(),
      stats,
      byCategory,
      issues
    };
  }

  /**
   * 格式化审查报告为可读文本
   */
  formatReport(report) {
    let output = '';
    output += '╔══════════════════════════════════════════════╗\\n';
    output += '║          AI 代码审查报告                     ║\\n';
    output += '╚══════════════════════════════════════════════╝\\n\\n';
    output += \`文件：\${report.filename}\\n\`;
    output += \`时间：\${report.timestamp}\\n\\n\`;
    
    output += '📊 问题统计：\\n';
    output += \`  • 总计：\${report.stats.total} 个问题\\n\`;
    output += \`  • 🔴 Critical：\${report.stats.critical}\\n\`;
    output += \`  • 🟠 High：\${report.stats.high}\\n\`;
    output += \`  • 🟡 Medium：\${report.stats.medium}\\n\`;
    output += \`  • 🟢 Low：\${report.stats.low}\\n\\n\`;
    
    output += '📂 按类别分布：\\n';
    for (const [category, count] of Object.entries(report.byCategory)) {
      const labels = {
        security: '🔒 安全',
        error_handling: '⚠️ 错误处理',
        performance: '⚡ 性能',
        code_quality: '📝 代码质量',
        input_validation: '✅ 输入验证'
      };
      output += \`  • \${labels[category] || category}：\${count} 个问题\\n\`;
    }
    
    output += '\\n📋 问题详情：\\n';
    output += '-'.repeat(60) + '\\n';
    
    const severityIcons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    
    for (let i = 0; i < report.issues.length; i++) {
      const issue = report.issues[i];
      output += \`\\n\${i + 1}. \${severityIcons[issue.severity]} [\${issue.ruleId}] 第 \${issue.line} 行\\n\`;
      output += \`   问题：\${issue.message}\\n\`;
      output += \`   建议：\${issue.suggestion}\\n\`;
      output += \`   代码：\${issue.code}\\n\`;
    }
    
    if (report.issues.length === 0) {
      output += '\\n✨ 未发现问题，代码质量良好！\\n';
    }
    
    return output;
  }

  /**
   * 计算代码质量评分（0-100）
   */
  calculateScore(report) {
    // 基础分
    let score = 100;
    
    // 扣分规则
    score -= report.stats.critical * 20;
    score -= report.stats.high * 10;
    score -= report.stats.medium * 5;
    score -= report.stats.low * 2;
    
    return Math.max(0, score);
  }
}

// ============================================================
// 演示：模拟AI代码审查过程
// ============================================================

console.log('╔══════════════════════════════════════════════╗');
console.log('║    AI 代码审查模拟器 - 第13章演示           ║');
console.log('╚══════════════════════════════════════════════╝\\n');

const reviewer = new CodeReviewer();

// 演示1：审查包含多个问题的代码
console.log('【演示1】审查包含安全漏洞的代码\\n');

const badCode = \`
function loginUser(username, password) {
  var query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  db.query(query);
  document.getElementById('result').innerHTML = '<p>Welcome, ' + username + '</p>';
  console.log('User login attempt:', username, password);
  eval('processLogin(' + username + ')');
}

async function getUsers() {
  const users = db.query('SELECT * FROM users');
  for (const user of users) {
    const posts = await db.query('SELECT * FROM posts WHERE user_id = ' + user.id);
  }
  return users;
}
\`;

console.log('原始代码：');
console.log(badCode);
console.log('\\n审查中...\\n');

const report = reviewer.generateReport(badCode, 'login.js');
console.log(reviewer.formatReport(report));
console.log(\`代码质量评分：\${reviewer.calculateScore(report)}/100\\n\`);

// 演示2：审查不同严重程度的问题
console.log('\\n【演示2】按严重程度分类的问题\\n');

const severityExamples = {
  critical: 'eval(userInput)',
  high: 'document.getElementById("app").innerHTML = userContent',
  medium: 'var x = 100; // 魔法数字和 var 声明',
  low: 'console.log("debug info:", data)'
};

for (const [severity, code] of Object.entries(severityExamples)) {
  const r = reviewer.generateReport(code, 'example.js');
  const sevIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
  console.log(\`\${sevIcon[severity]} \${severity.toUpperCase()}：\${code}\`);
  for (const issue of r.issues) {
    console.log(\`  → \${issue.message}\`);
  }
}

// 演示3：审查后的改进建议
console.log('\\n【演示3】审查改进建议\\n');

const improvementScenarios = [
  {
    before: 'document.getElementById("content").innerHTML = data',
    after: 'document.getElementById("content").textContent = data',
    issue: 'XSS 防护'
  },
  {
    before: 'const hash = md5(password)',
    after: 'const hash = await bcrypt.hash(password, 10)',
    issue: '安全哈希'
  },
  {
    before: 'var count = 100',
    after: 'const MAX_ITEMS = 100',
    issue: '常量命名'
  },
  {
    before: "db.query('SELECT * FROM users')",
    after: "db.query('SELECT id, name, email FROM users')",
    issue: '优化查询'
  }
];

for (const scenario of improvementScenarios) {
  console.log(\`问题：\${scenario.issue}\`);
  console.log(\`  Before：\${scenario.before}\`);
  console.log(\`  After： \${scenario.after}\`);
  console.log('');
}

// 演示4：CI/CD质量门禁模拟
console.log('【演示4】CI/CD 质量门禁模拟\\n');

const qualityGates = [
  { name: '宽松模式', maxCritical: 999, maxHigh: 999, result: '通过' },
  { name: '标准模式', maxCritical: 0, maxHigh: 5, result: '通过' },
  { name: '严格模式', maxCritical: 0, maxHigh: 0, result: '未通过' }
];

for (const gate of qualityGates) {
  console.log(\`\${gate.name}：\`);
  console.log(\`  Critical 上限：\${gate.maxCritical}，实际：\${report.stats.critical}\`);
  console.log(\`  High 上限：\${gate.maxHigh}，实际：\${report.stats.high}\`);
  console.log(\`  → 结果：\${gate.result}\\n\`);
}

console.log('╔══════════════════════════════════════════════╗');
console.log('║     代码审查演示完成！                      ║');
console.log('╚══════════════════════════════════════════════╝');`,
  },

  // ============================================================
  // 第 14 章：AI代码重构：提升代码质量
  // ============================================================
  {
    id: "ai-refactoring",
    icon: "🔧",
    group: "AI辅助编码",
    title: "AI代码重构：提升代码质量",
    content: `## 第14章：AI代码重构——提升代码质量

### 14.1 引言：重构的AI时代

重构是软件开发中持续进行的活动——它不改变代码的外部行为，但改善其内部结构。传统上，重构是一项需要丰富经验和细致耐心的工作。AI的出现改变了这一局面：AI可以快速识别代码中的坏味道，提出重构建议，甚至自动执行重构操作。

但AI重构并非魔法。你需要理解AI擅长哪些重构类型，如何引导AI进行正确的重构，以及如何验证重构后的代码是否保持了原有功能。

#### 14.1.1 为什么重构如此重要

**技术债务的代价：**
- 代码难以理解和维护
- 新功能开发速度变慢
- Bug修复成本增加
- 团队士气下降
- 系统可靠性降低

**重构的收益：**
- 代码可读性提升
- 维护成本降低
- Bug更容易被发现和修复
- 复用性提高
- 新人上手更快

#### 14.1.2 AI重构的优势

AI在重构方面有独特的优势：

- **模式识别**：AI可以识别出人类容易忽略的代码坏味道
- **一致性**：AI可以确保重构后的代码风格一致
- **速度**：AI可以在几秒内完成可能需要数小时的手动重构
- **全面性**：AI可以同时检查整个项目，确保重构不会引入不一致

### 14.2 AI擅长的重构类型

#### 14.2.1 提取方法（Extract Method）

将一段代码提取为独立的方法，是最常见也最有效的重构手法。

**重构前：**
\`\`\`javascript
function printOwing(invoice) {
  let outstanding = 0;
  
  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');
  
  // 计算未付金额
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }
  
  // 记录到期日
  const today = new Date();
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  
  // 打印详情
  console.log(\`name: \${invoice.customer}\`);
  console.log(\`amount: \${outstanding}\`);
  console.log(\`due: \${invoice.dueDate.toLocaleDateString()}\`);
}
\`\`\`

**重构后：**
\`\`\`javascript
function printOwing(invoice) {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log('***********************');
  console.log('**** Customer Owes ****');
  console.log('***********************');
}

function calculateOutstanding(invoice) {
  return invoice.orders.reduce((sum, o) => sum + o.amount, 0);
}

function recordDueDate(invoice) {
  const today = new Date();
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
}

function printDetails(invoice, outstanding) {
  console.log(\`name: \${invoice.customer}\`);
  console.log(\`amount: \${outstanding}\`);
  console.log(\`due: \${invoice.dueDate.toLocaleDateString()}\`);
}
\`\`\`

#### 14.2.2 重命名（Rename）

为变量、函数、类提供更有意义的名称。

**重构前：**
\`\`\`javascript
function calc(d) {
  let r = 0;
  for (let i = 0; i < d.length; i++) {
    r += d[i].a * d[i].b;
  }
  return r;
}
\`\`\`

**重构后：**
\`\`\`javascript
function calculateTotalPrice(orderItems) {
  let total = 0;
  for (let i = 0; i < orderItems.length; i++) {
    total += orderItems[i].quantity * orderItems[i].unitPrice;
  }
  return total;
}
\`\`\`

#### 14.2.3 简化条件表达式

将复杂的条件逻辑简化为更可读的形式。

**重构前：**
\`\`\`javascript
if (employee.type === 'manager' || employee.type === 'director' || employee.type === 'vp') {
  // 高级员工的逻辑
}

if (date.getMonth() >= 6 && date.getMonth() <= 8) {
  // 夏季逻辑
}
\`\`\`

**重构后：**
\`\`\`javascript
const SENIOR_ROLES = ['manager', 'director', 'vp'];
if (SENIOR_ROLES.includes(employee.type)) {
  // 高级员工的逻辑
}

const SUMMER_MONTHS = [6, 7, 8];
if (SUMMER_MONTHS.includes(date.getMonth())) {
  // 夏季逻辑
}
\`\`\`

#### 14.2.4 替换魔法数字

将硬编码的数字替换为有意义的常量。

**重构前：**
\`\`\`javascript
function calculateTax(income) {
  if (income < 5000) return 0;
  if (income < 8000) return income * 0.03;
  if (income < 17000) return income * 0.1;
  return income * 0.2;
}

function validatePassword(password) {
  if (password.length < 8) return false;
  return true;
}
\`\`\`

**重构后：**
\`\`\`javascript
const TAX_BRACKETS = [
  { threshold: 5000, rate: 0 },
  { threshold: 8000, rate: 0.03 },
  { threshold: 17000, rate: 0.1 },
  { threshold: Infinity, rate: 0.2 }
];

const MIN_PASSWORD_LENGTH = 8;

function calculateTax(income) {
  const bracket = TAX_BRACKETS.find(b => income < b.threshold);
  return income * bracket.rate;
}

function validatePassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}
\`\`\`

#### 14.2.5 使用现代语法

利用语言的新特性简化代码。

**重构前（旧语法）：**
\`\`\`javascript
function createUser(name, age) {
  var user = {};
  user.name = name;
  user.age = age;
  user.createdAt = new Date();
  return user;
}

var numbers = [1, 2, 3, 4, 5];
var doubled = [];
for (var i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
\`\`\`

**重构后（现代语法）：**
\`\`\`javascript
const createUser = (name, age) => ({
  name,
  age,
  createdAt: new Date()
});

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
\`\`\`

### 14.3 重构提示词设计

#### 14.3.1 通用重构提示词

\`\`\`
请重构以下代码，提升其可读性、可维护性和性能。重构要求：

1. 提取长函数中的独立逻辑为小函数
2. 使用有意义的变量名和函数名
3. 替换魔法数字和魔法字符串
4. 简化复杂的条件表达式
5. 使用现代语法特性
6. 添加适当的错误处理
7. 保持原有功能不变

同时提供：
- 重构前后的代码对比
- 每个重构步骤的说明
- 重构后的代码应该保持原有行为

代码：
\`\`\`
{在此粘贴代码}
\`\`\`
\`\`\`

#### 14.3.2 特定目标的重构提示词

**性能优化重构：**
\`\`\`
请从性能角度重构以下代码：
1. 消除不必要的循环和计算
2. 优化数据库查询模式
3. 添加缓存机制
4. 使用更高效的数据结构
5. 减少内存分配

保持原有功能不变，但提升执行效率。
\`\`\`

**可读性重构：**
\`\`\`
请从可读性角度重构以下代码：
1. 改善命名
2. 拆分长函数
3. 减少嵌套层级
4. 添加清晰的注释
5. 统一代码风格

目标：让代码读起来像自然语言一样流畅。
\`\`\`

### 14.4 坏味道检测方法

#### 14.4.1 常见代码坏味道

**长函数（Long Function）**
函数超过一定长度（通常建议不超过50行），可能承担了太多职责。

**大类（Large Class）**
类承担了太多职责，违反了单一职责原则。

**长参数列表（Long Parameter List）**
函数参数过多（通常超过3-4个），难以理解和使用。

**发散式变化（Divergent Change）**
一个类因为不同的原因在不同方向上发生变化。

**霰弹式修改（Shotgun Surgery）**
一个变化需要修改多个不同的类。

**依恋情结（Feature Envy）**
一个函数对另一个类的数据比对自己所在类的数据更感兴趣。

**数据泥团（Data Clumps）**
多个数据项总是一起出现，应该组合成一个对象。

**基本类型偏执（Primitive Obsession）**
过度使用基本类型（字符串、数字），而不是创建有意义的类型。

**重复代码（Duplicated Code）**
相同或相似的代码出现在多个地方。

**神秘命名（Mysterious Name）**
变量、函数、类的名称不能清晰地表达其用途。

#### 14.4.2 使用AI检测坏味道

你可以让AI分析代码并识别坏味道：

\`\`\`
请分析以下代码，识别其中的代码坏味道（Code Smells）。
对于每个坏味道，请提供：
1. 坏味道的类型
2. 具体位置
3. 为什么这是一个问题
4. 建议的重构方案
\`\`\`

### 14.5 模式化重构

#### 14.5.1 条件逻辑 → 策略模式

**重构前：**
\`\`\`javascript
function calculateShipping(weight, destination) {
  if (destination === 'domestic') {
    if (weight < 1) return 5;
    if (weight < 5) return 10;
    return 20;
  } else if (destination === 'international') {
    if (weight < 1) return 20;
    if (weight < 5) return 50;
    return 100;
  } else if (destination === 'express') {
    return 30 + weight * 10;
  }
}
\`\`\`

**重构后：**
\`\`\`javascript
const shippingStrategies = {
  domestic: (weight) => {
    if (weight < 1) return 5;
    if (weight < 5) return 10;
    return 20;
  },
  international: (weight) => {
    if (weight < 1) return 20;
    if (weight < 5) return 50;
    return 100;
  },
  express: (weight) => 30 + weight * 10
};

function calculateShipping(weight, destination) {
  const strategy = shippingStrategies[destination];
  if (!strategy) throw new Error(\`Unknown destination: \${destination}\`);
  return strategy(weight);
}
\`\`\`

#### 14.5.2 嵌套条件 → 提前返回（Guard Clauses）

**重构前：**
\`\`\`javascript
function getPaymentStatus(user) {
  let status = 'unknown';
  if (user) {
    if (user.subscription) {
      if (user.subscription.isActive) {
        if (user.subscription.paymentDate) {
          status = 'paid';
        } else {
          status = 'pending';
        }
      } else {
        status = 'expired';
      }
    } else {
      status = 'no_subscription';
    }
  }
  return status;
}
\`\`\`

**重构后：**
\`\`\`javascript
function getPaymentStatus(user) {
  if (!user) return 'unknown';
  if (!user.subscription) return 'no_subscription';
  if (!user.subscription.isActive) return 'expired';
  if (!user.subscription.paymentDate) return 'pending';
  return 'paid';
}
\`\`\`

### 14.6 大规模重构策略

#### 14.6.1 渐进式重构

大规模重构不应该一次性完成，而应该采用渐进式策略：

\`\`\`
阶段一：建立安全网
  ├── 确保有足够的测试覆盖
  ├── 设置CI/CD质量门禁
  └── 建立回滚机制

阶段二：小步快跑
  ├── 每次只重构一个方面
  ├── 每次重构后运行测试
  ├── 频繁提交
  └── 及时获得反馈

阶段三：逐步推进
  ├── 从最独立的模块开始
  ├── 逐步向核心模块推进
  └── 保持系统始终可运行

阶段四：验证和清理
  ├── 全面回归测试
  ├── 性能测试
  ├── 代码审查
  └── 清理遗留代码
\`\`\`

#### 14.6.2 使用AI辅助大规模重构

**步骤一：让AI分析项目结构**
\`\`\`
请分析以下项目的结构，识别需要重构的模块，并按优先级排序：
- 依赖关系复杂度
- 测试覆盖率
- 代码坏味道严重程度
- 业务重要性
\`\`\`

**步骤二：让AI生成重构计划**
\`\`\`
基于以下分析结果，生成一个渐进式重构计划，包括：
1. 每个阶段的目标
2. 具体的重构步骤
3. 预估的工作量
4. 风险和缓解措施
\`\`\`

**步骤三：让AI执行每个阶段的重构**
\`\`\`
请对以下模块执行重构，分为多个小步骤：
1. 每个步骤只做一个改变
2. 每个步骤后提供验证方法
3. 保持向后兼容性
\`\`\`

### 14.7 重构中的测试

#### 14.7.1 测试在重构中的作用

测试是重构的安全网。没有测试的重构是危险的。

**重构前：**
1. 确保有足够的测试覆盖
2. 如果测试不足，先补充测试
3. 确保所有测试都能通过

**重构中：**
1. 每次小改动后运行测试
2. 如果测试失败，立即修复
3. 不要在有失败测试的情况下继续重构

**重构后：**
1. 运行完整的测试套件
2. 补充新的测试用例
3. 确保代码覆盖率没有下降

#### 14.7.2 使用AI生成重构测试

在重构前，你可以让AI生成测试用例：

\`\`\`
请为以下代码生成全面的测试用例，使用 Jest 框架：
1. 覆盖所有正常路径
2. 覆盖所有边界情况
3. 覆盖所有错误处理分支
4. 确保测试的独立性
5. 使用有意义的测试描述

代码：
\`\`\`
{在此粘贴代码}
\`\`\`
\`\`\`

### 14.8 重构前后对比示例

#### 14.8.1 示例一：用户注册流程重构

**重构前（混乱的代码）：**
\`\`\`javascript
function registerUser(d) {
  if (!d.n) throw 'name required';
  if (!d.e) throw 'email required';
  if (!d.p) throw 'password required';
  if (d.p.length < 8) throw 'password too short';
  var e = d.e.toLowerCase();
  var re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!re.test(e)) throw 'invalid email';
  var u = { name: d.n.trim(), email: e, password: hashPassword(d.p), createdAt: new Date(), status: 'active' };
  db.users.push(u);
  sendEmail(e, 'Welcome ' + d.n);
  return u;
}
\`\`\`

**重构后（清晰的代码）：**
\`\`\`javascript
const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

class UserRegistrationService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  registerUser({ name, email, password }) {
    this.validateInput({ name, email, password });
    
    const user = this.createUserEntity({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashPassword(password)
    });
    
    this.userRepository.save(user);
    this.emailService.sendWelcomeEmail(user);
    
    return user;
  }

  validateInput({ name, email, password }) {
    if (!name?.trim()) {
      throw new ValidationError('用户名不能为空');
    }
    if (!email?.trim()) {
      throw new ValidationError('邮箱不能为空');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new ValidationError('邮箱格式不正确');
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(\`密码长度不能少于\${MIN_PASSWORD_LENGTH}位\`);
    }
  }

  createUserEntity({ name, email, password }) {
    return {
      name,
      email,
      password,
      createdAt: new Date(),
      status: 'active'
    };
  }
}
\`\`\`

### 14.9 常见重构错误

#### 14.9.1 过度重构

**表现：** 为了"完美"而不断重构，永远认为代码可以更好。

**危害：** 浪费时间，可能引入新的Bug，还可能让代码更复杂。

**对策：** 设定明确的重构目标和终止条件。当代码达到"足够好"的标准时就停止。

#### 14.9.2 改变行为的同时重构

**表现：** 在重构的同时添加新功能或修复Bug。

**危害：** 难以判断问题是重构引入的还是新功能引入的。

**对策：** 严格分离重构和功能变更。一次只做一件事。

#### 14.9.3 没有测试就重构

**表现：** 在没有测试覆盖的情况下进行重构。

**危害：** 无法验证重构是否引入了回归问题。

**对策：** 重构前确保有足够的测试。如果测试不足，先补充测试。

#### 14.9.4 盲目信任AI重构

**表现：** 完全信任AI的重构结果，不进行审查。

**危害：** AI可能引入逻辑错误、改变行为或产生次优代码。

**对策：** 始终审查AI的重构结果，运行测试验证。

### 14.10 增量重构原则

#### 14.10.1 童子军原则

"离开营地时，让它比你发现时更干净。"——每次修改代码时，顺便做一些小的重构改进。

#### 14.10.2 小步快跑

每次重构都应该是一个小步骤，可以快速完成和验证。如果一次重构需要修改超过50行代码，考虑将其拆分为更小的步骤。

#### 14.10.3 持续重构

重构不是一次性的活动，而是持续进行的过程。将重构融入日常开发流程中。

#### 14.10.4 优先重构经常修改的代码

根据"二八法则"，80%的修改发生在20%的代码上。优先重构这些高频修改的代码。

### 14.11 本章小结

AI重构是提升代码质量的强大工具，但需要谨慎使用。记住以下原则：

1. 重构不改变外部行为，只改善内部结构
2. 测试是重构的安全网，没有测试不要重构
3. 小步快跑，每次只做一个小改动
4. 选择适合的AI工具和提示词
5. 始终审查AI的重构结果
6. 将重构融入日常开发流程`,
    code: `// ============================================================
// 第14章代码演示：AI代码重构模拟器
// ============================================================
// 这个模拟器展示了AI代码重构的基本原理：
// 识别代码坏味道，应用重构模式，展示重构前后对比

class RefactoringEngine {
  constructor() {
    // 重命名映射
    this.renameMap = {
      'd': 'data',
      'r': 'result',
      't': 'total',
      'tmp': 'temp',
      'arr': 'array',
      'obj': 'object',
      'fn': 'function',
      'cb': 'callback',
      'val': 'value',
      'idx': 'index',
      'len': 'length',
      'el': 'element',
      'e': 'error',
      'res': 'response',
      'req': 'request'
    };
  }

  /**
   * 检测代码坏味道
   */
  detectSmells(code) {
    const smells = [];
    const lines = code.split('\\n');

    // 检测长函数（超过50行）
    const functionMatches = code.matchAll(/function\\s+(\\w+)\\s*\\([^)]*\\)\\s*\\{/g);
    for (const match of functionMatches) {
      const funcStart = match.index;
      let braceCount = 0;
      let funcEnd = funcStart;
      let lineCount = 0;
      for (let i = funcStart; i < code.length; i++) {
        if (code[i] === '{') braceCount++;
        if (code[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            funcEnd = i;
            break;
          }
        }
        if (code[i] === '\\n') lineCount++;
      }
      if (lineCount > 50) {
        smells.push({
          type: '长函数',
          severity: 'medium',
          location: match[1],
          message: \`函数 \${match[1]} 长度超过50行，建议拆分\`
        });
      }
    }

    // 检测魔法数字
    const magicNumberMatches = code.matchAll(/(?<!\\/\\/.*)(?<!\\w)(\\d{2,})(?!\\s*[\\/\\*])(?![^"']*["'])/g);
    const seenNumbers = new Set();
    for (const match of magicNumberMatches) {
      const num = match[1];
      if (!seenNumbers.has(num) && num !== '0' && num !== '1') {
        seenNumbers.add(num);
        if (seenNumbers.size <= 3) {
          smells.push({
            type: '魔法数字',
            severity: 'low',
            location: \`第 \${code.substring(0, match.index).split('\\n').length} 行\`,
            message: \`检测到魔法数字 \${num}，建议定义为常量\`
          });
        }
      }
    }

    // 检测 var 声明
    const varMatches = code.matchAll(/\\bvar\\s+(\\w+)/g);
    for (const match of varMatches) {
      smells.push({
        type: '过时语法',
        severity: 'low',
        location: match[1],
        message: \`使用了 var 声明变量 \${match[1]}，建议使用 const 或 let\`
      });
    }

    // 检测嵌套过深（超过3层）
    const lines2 = code.split('\\n');
    for (let i = 0; i < lines2.length; i++) {
      const indent = lines2[i].match(/^(\\s*)/)?.[1]?.length || 0;
      if (indent > 12) {
        smells.push({
          type: '嵌套过深',
          severity: 'medium',
          location: \`第 \${i + 1} 行\`,
          message: '代码嵌套层级过深（超过3层），建议使用提前返回或提取函数'
        });
        break;
      }
    }

    // 检测重复代码（简单检查）
    const trimmedLines = lines.map(l => l.trim());
    const duplicates = {};
    for (let i = 0; i < trimmedLines.length; i++) {
      const line = trimmedLines[i];
      if (line.length > 10) {
        duplicates[line] = (duplicates[line] || 0) + 1;
      }
    }
    const dupLines = Object.entries(duplicates).filter(([, count]) => count > 2);
    if (dupLines.length > 0) {
      smells.push({
        type: '重复代码',
        severity: 'medium',
        location: '多处',
        message: \`发现 \${dupLines.length} 处重复代码模式\`
      });
    }

    return smells;
  }

  /**
   * 应用命名重构
   */
  improveNaming(code) {
    let improved = code;
    let changes = [];

    for (const [oldName, newName] of Object.entries(this.renameMap)) {
      const regex = new RegExp(\`\\\\b\${oldName}\\\\b\`, 'g');
      const matches = improved.match(regex);
      if (matches) {
        improved = improved.replace(regex, newName);
        changes.push({ from: oldName, to: newName, count: matches.length });
      }
    }

    return { code: improved, changes };
  }

  /**
   * 应用提取函数重构
   */
  extractFunction(code) {
    // 识别可以被提取的代码块
    const blocks = [];
    const lines = code.split('\\n');

    // 查找注释标记的代码块
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\\/\\/\\s*(Step|步骤|第一步|第二步|第三步)/)) {
        let blockStart = i + 1;
        let blockEnd = blockStart + 5;
        blocks.push({
          start: blockStart,
          end: Math.min(blockEnd, lines.length),
          description: lines[i].trim()
        });
      }
    }

    if (blocks.length > 0) {
      let refactored = '// 重构后的代码：提取了独立函数\\n\\n';
      const funcNames = [];
      
      for (let b = 0; b < blocks.length; b++) {
        const block = blocks[b];
        const funcName = \`step\${b + 1}\`;
        funcNames.push(funcName);
        refactored += \`function \${funcName}() {\\n\`;
        for (let j = block.start; j < block.end && j < lines.length; j++) {
          refactored += \`  \${lines[j]}\\n\`;
        }
        refactored += \`}\\n\\n\`;
      }

      refactored += \`// 主函数调用提取的子函数\\n\`;
      refactored += \`function main() {\\n\`;
      for (const name of funcNames) {
        refactored += \`  \${name}();\\n\`;
      }
      refactored += \`}\\n\`;

      return refactored;
    }
    return null;
  }

  /**
   * 应用Guard Clause重构
   */
  applyGuardClauses(code) {
    // 检测嵌套的条件判断
    const hasNestedIf = code.match(/if\\s*\\([^)]+\\)\\s*\\{[^}]*if\\s*\\(/);
    if (hasNestedIf) {
      return \`// 重构建议：使用提前返回（Guard Clauses）替代嵌套条件
// 
// 重构前：
// if (condition1) {
//   if (condition2) {
//     // 主逻辑
//   }
// }
//
// 重构后：
// if (!condition1) return;
// if (!condition2) return;
// // 主逻辑
\`;
    }
    return null;
  }

  /**
   * 应用现代语法
   */
  modernize(code) {
    let modernized = code;
    let changes = [];

    // var → const/let
    const varCount = (modernized.match(/\\bvar\\s+/g) || []).length;
    if (varCount > 0) {
      modernized = modernized.replace(/\\bvar\\s+/g, 'const ');
      changes.push(\`将 \${varCount} 个 var 声明替换为 const\`);
    }

    // 函数表达式 → 箭头函数
    const funcExprCount = (modernized.match(/function\\s*\\(/g) || []).length;
    if (funcExprCount > 0) {
      modernized = modernized.replace(
        /function\\s*\\(([^)]*)\\)\\s*\\{/g,
        '($1) => {'
      );
      changes.push(\`将 \${funcExprCount} 个函数表达式转换为箭头函数\`);
    }

    // 字符串拼接 → 模板字符串
    const concatCount = (modernized.match(/\\+\\s*['"]/g) || []).length;
    if (concatCount > 0) {
      changes.push(\`检测到 \${concatCount} 处字符串拼接，建议使用模板字符串\`);
    }

    return { code: modernized, changes };
  }

  /**
   * 生成完整的重构方案
   */
  generateRefactoringPlan(code) {
    const smells = this.detectSmells(code);
    const plan = {
      smells,
      steps: [],
      estimatedImprovement: 0
    };

    if (smells.length > 0) {
      // 重命名
      plan.steps.push({
        order: 1,
        name: '改善命名',
        description: '将有意义的变量名替换无意义的缩写',
        risk: '低',
        automated: true
      });

      // 提取函数
      plan.steps.push({
        order: 2,
        name: '提取函数',
        description: '将长函数拆分为小函数',
        risk: '中',
        automated: false
      });

      // 现代语法
      plan.steps.push({
        order: 3,
        name: '现代化语法',
        description: '使用 const/let、箭头函数、模板字符串',
        risk: '低',
        automated: true
      });

      // 简化条件
      plan.steps.push({
        order: 4,
        name: '简化条件逻辑',
        description: '使用数组includes、提前返回等简化条件',
        risk: '低',
        automated: true
      });
    }

    plan.estimatedImprovement = Math.min(smells.length * 15, 60);
    return plan;
  }

  /**
   * 执行完整的重构流程
   */
  refactor(code) {
    const result = {
      original: code,
      refactored: code,
      steps: [],
      beforeAfter: []
    };

    // 步骤1：检测坏味道
    const smells = this.detectSmells(code);
    result.steps.push({ name: '检测坏味道', result: smells.length + ' 个问题发现' });

    // 步骤2：改善命名
    const namingResult = this.improveNaming(code);
    if (namingResult.changes.length > 0) {
      result.refactored = namingResult.code;
      result.steps.push({ name: '改善命名', result: namingResult.changes.length + ' 处重命名' });
      result.beforeAfter.push({
        type: '命名改善',
        before: code.substring(0, 100) + '...',
        after: namingResult.code.substring(0, 100) + '...'
      });
    }

    // 步骤3：现代化语法
    const modernResult = this.modernize(result.refactored);
    if (modernResult.changes.length > 0) {
      result.refactored = modernResult.code;
      result.steps.push({ name: '现代化语法', result: modernResult.changes.join(', ') });
    }

    // 步骤4：生成重构计划
    const plan = this.generateRefactoringPlan(code);
    result.plan = plan;

    return result;
  }
}

// ============================================================
// 演示：模拟AI代码重构过程
// ============================================================

console.log('╔══════════════════════════════════════════════╗');
console.log('║    AI 代码重构模拟器 - 第14章演示           ║');
console.log('╚══════════════════════════════════════════════╝\\n');

const refactoring = new RefactoringEngine();

// 演示1：检测代码坏味道
console.log('【演示1】检测代码坏味道\\n');

const smellyCode = \`
function calc(d) {
  var r = 0;
  var t = 100;
  for (var i = 0; i < d.length; i++) {
    r = r + d[i].a * d[i].b;
    if (r > 1000) {
      if (d[i].type === 'vip') {
        if (d[i].discount > 0) {
          r = r * (1 - d[i].discount);
        }
      }
    }
  }
  console.log(r);
  return r;
}
\`;

console.log('原始代码：');
console.log(smellyCode);

const smells = refactoring.detectSmells(smellyCode);
console.log('\\n发现的坏味道：');
for (const smell of smells) {
  console.log(\`  • [\${smell.type}] \${smell.message}\`);
}

// 演示2：改善命名
console.log('\\n【演示2】改善命名\\n');

const namingResult = refactoring.improveNaming('function calc(d) { var r = 0; return r; }');
console.log('原始：function calc(d) { var r = 0; return r; }');
console.log('改进：' + namingResult.code);
console.log('变更：' + JSON.stringify(namingResult.changes));

// 演示3：现代化语法
console.log('\\n【演示3】现代化语法\\n');

const oldCode = \`
var numbers = [1, 2, 3, 4, 5];
var doubled = [];
for (var i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
var name = "Hello, " + "World";
\`;

console.log('重构前：');
console.log(oldCode);

const modernResult = refactoring.modernize(oldCode);
console.log('重构后：');
console.log(modernResult.code);
console.log('变更：');
for (const change of modernResult.changes) {
  console.log(\`  • \${change}\`);
}

// 演示4：完整重构流程
console.log('\\n【演示4】完整重构流程\\n');

const result = refactoring.refactor(smellyCode);
console.log('重构步骤：');
for (const step of result.steps) {
  console.log(\`  \${step.name}：\${step.result}\`);
}

// 演示5：重构前后对比
console.log('\\n【演示5】重构前后对比示例\\n');

const beforeAfterExamples = [
  {
    name: '提取方法',
    before: 'function print(invoice) {\\n  // 打印banner\\n  console.log("***");\\n  // 计算\\n  let t = 0;\\n  for (let o of invoice.orders) t += o.amount;\\n  // 打印\\n  console.log(t);\\n}',
    after: 'function print(invoice) {\\n  printBanner();\\n  const t = calculateTotal(invoice);\\n  printTotal(t);\\n}'
  },
  {
    name: 'Guard Clauses',
    before: 'function getStatus(u) {\\n  let s = "unknown";\\n  if (u) {\\n    if (u.active) {\\n      s = "active";\\n    }\\n  }\\n  return s;\\n}',
    after: 'function getStatus(u) {\\n  if (!u) return "unknown";\\n  if (!u.active) return "inactive";\\n  return "active";\\n}'
  },
  {
    name: '简化条件',
    before: 'if (type === "a" || type === "b" || type === "c")',
    after: 'if (["a", "b", "c"].includes(type))'
  }
];

for (const example of beforeAfterExamples) {
  console.log(\`【\${example.name}】\`);
  console.log('Before:');
  console.log(example.before);
  console.log('After:');
  console.log(example.after);
  console.log('---');
}

console.log('╔══════════════════════════════════════════════╗');
console.log('║     代码重构演示完成！                      ║');
console.log('╚══════════════════════════════════════════════╝');`,
  },

  // ============================================================
  // 第 15 章：AI生成测试：自动化测试用例编写
  // ============================================================
  {
    id: "ai-testing",
    icon: "🧪",
    group: "AI辅助编码",
    title: "AI生成测试：自动化测试用例编写",
    content: `## 第15章：AI生成测试——自动化测试用例编写

### 15.1 引言：AI与测试的完美结合

测试是软件开发中不可或缺的环节，但编写测试用例往往是一项枯燥且耗时的工作。许多开发者对编写测试感到厌烦，导致测试覆盖率不足，技术债务积累。AI的出现改变了这一局面——AI在编写测试用例方面表现出色，是AI辅助编程中回报率最高的应用场景之一。

为什么AI特别适合编写测试？因为测试用例具有高度的模式化特征：给定输入，验证输出。AI擅长识别这种模式，并生成全面、系统的测试用例。而且，AI不会感到疲倦，不会跳过"无聊"的测试场景，能够生成比人工更全面的测试覆盖。

#### 15.1.1 测试的经济学

**人工编写测试的成本：**
- 编写测试的时间可能占开发时间的30-50%
- 测试维护成本随代码变更持续增加
- 资深开发者编写测试的机会成本高
- 测试覆盖不足导致的Bug修复成本更高

**AI编写测试的收益：**
- 测试编写速度提升5-10倍
- 测试覆盖更全面（AI不会遗漏边界情况）
- 测试维护成本降低（AI可以快速更新测试）
- 开发者可以将时间投入到更有价值的工作中

#### 15.1.2 AI测试的适用场景

AI测试在以下场景中表现最佳：
- 单元测试：输入输出明确的函数最适合AI生成测试
- 边界测试：AI擅长系统地生成边界情况测试
- 数据驱动测试：AI可以生成大量测试数据
- 回归测试：AI可以快速生成变更相关的测试

### 15.2 AI测试的类型

#### 15.2.1 单元测试

单元测试是AI最擅长的测试类型。对于输入输出明确的函数，AI可以生成全面的单元测试。

**AI生成的单元测试示例：**
\`\`\`javascript
// 原始函数
function calculateDiscount(price, membershipLevel) {
  if (price <= 0) return 0;
  
  const discounts = {
    normal: 0,
    silver: 0.05,
    gold: 0.1,
    platinum: 0.15
  };
  
  const rate = discounts[membershipLevel] || 0;
  return price * (1 - rate);
}

// AI生成的测试用例
describe('calculateDiscount', () => {
  test('正常价格，普通会员无折扣', () => {
    expect(calculateDiscount(100, 'normal')).toBe(100);
  });
  
  test('正常价格，银牌会员5%折扣', () => {
    expect(calculateDiscount(100, 'silver')).toBe(95);
  });
  
  test('正常价格，金牌会员10%折扣', () => {
    expect(calculateDiscount(100, 'gold')).toBe(90);
  });
  
  test('正常价格，铂金会员15%折扣', () => {
    expect(calculateDiscount(100, 'platinum')).toBe(85);
  });
  
  test('价格为0时返回0', () => {
    expect(calculateDiscount(0, 'gold')).toBe(0);
  });
  
  test('价格为负数时返回0', () => {
    expect(calculateDiscount(-50, 'gold')).toBe(0);
  });
  
  test('未知会员等级按普通会员处理', () => {
    expect(calculateDiscount(100, 'unknown')).toBe(100);
  });
});
\`\`\`

#### 15.2.2 集成测试

集成测试验证多个组件之间的交互。AI可以生成模拟组件间交互的测试。

**AI生成的集成测试示例：**
\`\`\`javascript
// AI生成的用户注册集成测试
describe('用户注册流程', () => {
  test('完整注册流程：验证 → 创建 → 发送邮件', async () => {
    // 模拟依赖
    const mockDb = { save: jest.fn().mockResolvedValue(true) };
    const mockEmail = { send: jest.fn().mockResolvedValue(true) };
    
    const service = new UserService(mockDb, mockEmail);
    
    const result = await service.register({
      name: '张三',
      email: 'zhangsan@example.com',
      password: 'securePass123'
    });
    
    expect(result.status).toBe('active');
    expect(mockDb.save).toHaveBeenCalled();
    expect(mockEmail.send).toHaveBeenCalledWith(
      'zhangsan@example.com',
      expect.stringContaining('张三')
    );
  });
});
\`\`\`

#### 15.2.3 边界情况测试

AI特别擅长系统地生成边界情况测试。它不会遗漏空值、零值、极值等常见边界。

**AI生成的边界测试：**
\`\`\`javascript
describe('边界情况测试', () => {
  const testCases = [
    { input: null, desc: 'null输入' },
    { input: undefined, desc: 'undefined输入' },
    { input: '', desc: '空字符串' },
    { input: [], desc: '空数组' },
    { input: [1], desc: '单元素数组' },
    { input: Array(10000).fill(1), desc: '大数组' },
    { input: -1, desc: '负数' },
    { input: 0, desc: '零值' },
    { input: Number.MAX_SAFE_INTEGER, desc: '最大安全整数' },
    { input: 'a'.repeat(10000), desc: '超长字符串' },
  ];
  
  testCases.forEach(({ input, desc }) => {
    test(\`处理 \${desc}\`, () => {
      expect(() => processInput(input)).not.toThrow();
    });
  });
});
\`\`\`

#### 15.2.4 属性测试（Property-based Testing）

AI可以生成属性测试，验证代码在大量随机输入下是否满足某些属性。

\`\`\`javascript
// 属性：排序后的数组长度应该等于排序前的长度
test('排序不改变数组长度', () => {
  for (let i = 0; i < 100; i++) {
    const arr = Array.from({ length: Math.floor(Math.random() * 100) }, 
      () => Math.floor(Math.random() * 1000));
    const sorted = [...arr].sort((a, b) => a - b);
    expect(sorted.length).toBe(arr.length);
  }
});

// 属性：排序后的数组应该是升序的
test('排序后的数组是升序的', () => {
  for (let i = 0; i < 100; i++) {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 1000));
    const sorted = [...arr].sort((a, b) => a - b);
    for (let j = 1; j < sorted.length; j++) {
      expect(sorted[j]).toBeGreaterThanOrEqual(sorted[j - 1]);
    }
  }
});
\`\`\`

### 15.3 测试生成提示词

#### 15.3.1 通用测试生成提示词

\`\`\`
请为以下函数生成全面的测试用例，使用 Jest 测试框架：

要求：
1. 覆盖所有正常输入路径（happy path）
2. 覆盖所有边界情况（空值、零值、极值、特殊字符）
3. 覆盖所有错误处理分支
4. 每个测试用例有清晰的描述
5. 使用 describe/it 或 describe/test 结构
6. 测试数据使用有意义的示例值

函数代码：
\`\`\`javascript
{在此粘贴函数代码}
\`\`\`

请生成至少 10 个测试用例。
\`\`\`

#### 15.3.2 特定场景的测试提示词

**异步函数测试：**
\`\`\`
请为以下异步函数生成测试用例，使用 Jest：
1. 测试成功场景
2. 测试网络错误场景
3. 测试超时场景
4. 测试服务器错误场景
5. 使用 async/await 语法
6. 使用 jest.mock 模拟外部依赖

函数代码：
\`\`\`
{在此粘贴代码}
\`\`\`
\`\`\`

**React组件测试：**
\`\`\`
请为以下 React 组件生成测试用例，使用 React Testing Library：
1. 测试渲染
2. 测试用户交互（点击、输入）
3. 测试状态变化
4. 测试props变化
5. 测试错误状态
6. 测试加载状态
\`\`\`

### 15.4 生成测试数据

#### 15.4.1 测试数据生成策略

AI可以生成各种类型的测试数据：

**正常数据：**
\`\`\`javascript
// AI可以生成符合业务逻辑的测试数据
const testUsers = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 35 },
];
\`\`\`

**边界数据：**
\`\`\`javascript
// AI可以生成边界值测试数据
const boundaryData = [
  { value: '', desc: '空字符串' },
  { value: 'a', desc: '单字符' },
  { value: 'a'.repeat(255), desc: '最大长度-1' },
  { value: 'a'.repeat(256), desc: '超过最大长度' },
  { value: 0, desc: '零值' },
  { value: -1, desc: '负值' },
  { value: Number.MAX_VALUE, desc: '最大值' },
];
\`\`\`

**异常数据：**
\`\`\`javascript
// AI可以生成各种异常输入
const invalidInputs = [
  null,
  undefined,
  NaN,
  Infinity,
  {},
  () => {},
  Symbol('test'),
  new Date('invalid'),
];
\`\`\`

#### 15.4.2 使用工厂函数生成数据

AI可以生成工厂函数来创建测试数据：

\`\`\`javascript
// AI生成的测试数据工厂
function createTestUser(overrides = {}) {
  return {
    id: Math.random().toString(36).substring(7),
    name: '测试用户',
    email: 'test@example.com',
    age: 25,
    role: 'user',
    createdAt: new Date(),
    ...overrides
  };
}

// 使用
const adminUser = createTestUser({ role: 'admin' });
const youngUser = createTestUser({ age: 15 });
const inactiveUser = createTestUser({ status: 'inactive' });
\`\`\`

### 15.5 覆盖率策略

#### 15.5.1 代码覆盖率

AI可以帮助你理解和提升代码覆盖率：

**语句覆盖率（Statement Coverage）**
验证代码中的每个语句是否都被执行过。

**分支覆盖率（Branch Coverage）**
验证每个条件分支（if/else、switch/case）是否都执行过。

**函数覆盖率（Function Coverage）**
验证每个函数是否都被调用过。

**行覆盖率（Line Coverage）**
验证每一行代码是否都被执行过。

#### 15.5.2 使用AI提升覆盖率

你可以让AI分析覆盖率报告，生成缺失的测试用例：

\`\`\`
以下是我的代码覆盖率报告，显示以下分支未被覆盖：
- 第45行：if (error.code === 'TIMEOUT')
- 第78行：else if (status === 'cancelled')
- 第102行：catch (error) 块

请为这些未覆盖的分支生成测试用例。
\`\`\`

### 15.6 框架特定测试

#### 15.6.1 Jest（JavaScript/TypeScript）

\`\`\`javascript
// AI生成的Jest测试模板
describe('UserService', () => {
  let userService;
  let mockRepository;
  
  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };
    userService = new UserService(mockRepository);
  });
  
  describe('getUser', () => {
    it('应该返回存在的用户', async () => {
      const user = { id: 1, name: 'Test' };
      mockRepository.findById.mockResolvedValue(user);
      
      const result = await userService.getUser(1);
      
      expect(result).toEqual(user);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });
    
    it('应该在用户不存在时抛出错误', async () => {
      mockRepository.findById.mockResolvedValue(null);
      
      await expect(userService.getUser(999))
        .rejects.toThrow('用户不存在');
    });
  });
});
\`\`\`

#### 15.6.2 Mocha/Chai（JavaScript）

\`\`\`javascript
const { expect } = require('chai');

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).to.equal(5);
    });
    
    it('should handle negative numbers', () => {
      expect(add(-2, 3)).to.equal(1);
    });
    
    it('should throw on non-number input', () => {
      expect(() => add('a', 3)).to.throw(TypeError);
    });
  });
});
\`\`\`

#### 15.6.3 Pytest（Python）

\`\`\`python
import pytest

class TestCalculator:
    def test_add_positive_numbers(self):
        assert add(2, 3) == 5
    
    def test_add_negative_numbers(self):
        assert add(-2, -3) == -5
    
    @pytest.mark.parametrize("a,b,expected", [
        (0, 0, 0),
        (1, 0, 1),
        (0, 1, 1),
        (-1, 1, 0),
    ])
    def test_add_parametrized(self, a, b, expected):
        assert add(a, b) == expected
\`\`\`

#### 15.6.4 JUnit（Java）

\`\`\`java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    private Calculator calculator;
    
    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }
    
    @Test
    void testAddPositiveNumbers() {
        assertEquals(5, calculator.add(2, 3));
    }
    
    @Test
    void testDivideByZero() {
        assertThrows(ArithmeticException.class, 
            () -> calculator.divide(10, 0));
    }
}
\`\`\`

### 15.7 测试优先与AI

#### 15.7.1 TDD与AI的结合

测试驱动开发（TDD）的传统流程是：写测试 → 写代码 → 重构。AI可以加速这个流程：

**AI增强的TDD流程：**
\`\`\`
1. 写测试用例（AI辅助生成）
2. 运行测试（应该失败）
3. 让AI根据测试生成实现代码
4. 运行测试（应该通过）
5. 让AI重构代码
6. 再次运行测试验证
\`\`\`

#### 15.7.2 从需求到测试

你可以让AI从需求描述直接生成测试用例：

\`\`\`
需求：实现一个密码验证函数，密码要求：
- 长度至少8个字符
- 包含至少一个大写字母
- 包含至少一个小写字母
- 包含至少一个数字
- 包含至少一个特殊字符

请根据以上需求生成测试用例，使用Jest框架。
\`\`\`

### 15.8 变异测试

#### 15.8.1 什么是变异测试

变异测试是一种评估测试质量的方法。它通过故意在代码中引入小错误（变异），然后检查测试是否能发现这些错误。

\`\`\`
原始代码：if (a > b) { return a; }
变异1：   if (a < b) { return a; }  // 改变比较方向
变异2：   if (a >= b) { return a; } // 改变比较运算符
变异3：   if (a > b) { return b; }  // 改变返回值
\`\`\`

如果测试能发现所有变异，说明测试质量高。如果有变异未被发现，说明测试覆盖不足。

#### 15.8.2 使用AI进行变异测试

AI可以生成代码变异，帮助你评估测试质量：

\`\`\`
请为以下代码生成5个变异版本，每个变异版本包含一个微小的错误。
然后检查现有的测试是否能发现这些变异。
\`\`\`

### 15.9 常见陷阱

#### 15.9.1 过度Mock

**问题：** AI生成的测试可能过度使用Mock，导致测试与实现细节高度耦合，测试变得脆弱。

**表现：**
\`\`\`javascript
// 不好的测试：过度Mock，测试了实现细节而非行为
const mockFn1 = jest.fn();
const mockFn2 = jest.fn();
const mockFn3 = jest.fn();
// 测试变成了验证内部调用顺序，而非验证行为结果
\`\`\`

**对策：**
- Mock只应用于外部依赖（数据库、API、文件系统）
- 测试应该验证行为而非实现细节
- 优先使用真实对象而非Mock

#### 15.9.2 脆弱的测试

**问题：** 测试对代码的微小变化过于敏感，导致频繁的测试失败。

**对策：**
- 测试应该验证行为而非实现
- 使用稳定的断言方式
- 避免测试内部状态

#### 15.9.3 测试覆盖率陷阱

**问题：** 追求100%覆盖率可能导致大量低质量的测试。

**对策：**
- 关注关键路径的覆盖率而非总体数字
- 测试质量 > 测试数量
- 使用变异测试评估测试质量

### 15.10 审查AI生成的测试

#### 15.10.1 审查清单

**测试正确性：**
- □ 测试是否验证了正确的行为？
- □ 断言是否准确？
- □ 测试是否独立（不依赖其他测试）？

**测试完整性：**
- □ 是否覆盖了所有重要场景？
- □ 是否包含边界情况？
- □ 是否包含错误处理测试？

**测试可维护性：**
- □ 测试名称是否清晰？
- □ 测试数据是否合理？
- □ Mock使用是否合理？

#### 15.10.2 常见的AI测试错误

- 生成不存在的断言方法
- 测试逻辑与实现逻辑相同（同义反复）
- 生成过于复杂的测试设置
- 遗漏关键的边界情况
- 使用了错误的Mock语法

### 15.11 本章小结

AI测试生成是AI辅助编程中投资回报率最高的应用场景之一。AI可以快速生成全面、系统的测试用例，大幅提升代码质量和开发效率。

关键要点：
1. AI在单元测试和边界测试方面表现最佳
2. 使用结构化的测试生成提示词
3. 关注测试质量而非数量
4. 避免过度Mock和脆弱测试
5. 始终审查AI生成的测试
6. 将测试生成融入日常开发流程`,
    code: `// ============================================================
// 第15章代码演示：AI测试生成模拟器
// ============================================================
// 这个模拟器展示了AI测试生成的基本原理：
// 分析函数定义，生成测试用例，评估测试质量

class TestGenerator {
  constructor() {
    // 测试模板库
    this.templates = {
      happyPath: {
        name: '正常路径测试',
        description: '验证函数在正常输入下的行为',
        generate: (funcName, params) => {
          let test = \`test('\${funcName} - 正常输入应返回预期结果', () => {\n\`;
          test += \`  const result = \${funcName}(\${params.map(p => p.example).join(', ')});\n\`;
          test += \`  expect(result).toBeDefined();\n\`;
          test += \`});\n\`;
          return test;
        }
      },
      nullCheck: {
        name: '空值检查',
        description: '验证函数处理 null/undefined 的行为',
        generate: (funcName, params) => {
          let tests = '';
          for (const param of params) {
            tests += \`test('\${funcName} - \${param.name} 为 null 时应抛出错误', () => {\n\`;
            const args = params.map(p => p.name === param.name ? 'null' : p.example).join(', ');
            tests += \`  expect(() => \${funcName}(\${args})).toThrow();\n\`;
            tests += \`});\n\n\`;
          }
          return tests;
        }
      },
      boundaryConditions: {
        name: '边界条件',
        description: '验证函数在边界值下的行为',
        generate: (funcName, params) => {
          let tests = '';
          const boundaryValues = {
            number: ['0', '-1', 'Number.MAX_SAFE_INTEGER', 'Number.MIN_SAFE_INTEGER'],
            string: ["''", "'a'.repeat(1000)", "' '"],
            array: ['[]', 'new Array(10000)'],
            boolean: ['true', 'false']
          };
          
          for (const param of params) {
            const values = boundaryValues[param.type] || [];
            for (const val of values) {
              const args = params.map(p => p.name === param.name ? val : p.example).join(', ');
              tests += \`test('\${funcName} - \${param.name} = \${val}', () => {\n\`;
              tests += \`  expect(() => \${funcName}(\${args})).not.toThrow();\n\`;
              tests += \`});\n\n\`;
            }
          }
          return tests;
        }
      },
      typeCheck: {
        name: '类型检查',
        description: '验证函数处理错误类型输入的行为',
        generate: (funcName, params) => {
          let tests = '';
          const typeValues = {
            number: ["'string'", 'true', '{}', '[]', 'null'],
            string: ['123', 'true', '{}', '[]', 'null'],
            boolean: ['123', "'string'", '{}', '[]', 'null'],
            array: ['123', "'string'", 'true', '{}', 'null'],
            object: ['123', "'string'", 'true', '[]', 'null']
          };
          
          for (const param of params) {
            const values = typeValues[param.type] || [];
            for (const val of values.slice(0, 3)) {
              const args = params.map(p => p.name === param.name ? val : p.example).join(', ');
              tests += \`test('\${funcName} - \${param.name} 类型错误 (\${val})', () => {\n\`;
              tests += \`  expect(() => \${funcName}(\${args})).toThrow();\n\`;
              tests += \`});\n\n\`;
            }
          }
          return tests;
        }
      },
      asyncTest: {
        name: '异步测试',
        description: '验证异步函数的行为',
        generate: (funcName, params) => {
          let test = \`test('\${funcName} - 异步操作应正确返回', async () => {\n\`;
          test += \`  const result = await \${funcName}(\${params.map(p => p.example).join(', ')});\n\`;
          test += \`  expect(result).toBeDefined();\n\`;
          test += \`});\n\n\`;
          test += \`test('\${funcName} - 异步操作失败应抛出错误', async () => {\n\`;
          test += \`  await expect(\${funcName}(null)).rejects.toThrow();\n\`;
          test += \`});\n\`;
          return test;
        }
      }
    };
  }

  /**
   * 分析函数签名
   */
  analyzeFunction(code) {
    // 提取函数名
    const nameMatch = code.match(/function\\s+(\\w+)/);
    const funcName = nameMatch ? nameMatch[1] : 'unknown';

    // 提取参数
    const paramsMatch = code.match(/function\\s+\\w+\\s*\\(([^)]*)\\)/);
    const paramsStr = paramsMatch ? paramsMatch[1] : '';
    
    const params = [];
    if (paramsStr.trim()) {
      const paramParts = paramsStr.split(',');
      for (const part of paramParts) {
        const trimmed = part.trim();
        let name = trimmed;
        let type = 'any';
        let example = "'test'";

        // 尝试推断类型
        if (trimmed.includes(':')) {
          // TypeScript 风格
          const [n, t] = trimmed.split(':').map(s => s.trim());
          name = n;
          type = t.toLowerCase();
        } else {
          // 从名称推断类型
          if (/^(name|title|label|text|str|string|message|email|url)/i.test(trimmed)) {
            type = 'string';
            example = "'example'";
          } else if (/^(age|count|num|number|amount|price|total|size|index|id)/i.test(trimmed)) {
            type = 'number';
            example = '42';
          } else if (/^(is|has|can|should|flag|enabled|active)/i.test(trimmed)) {
            type = 'boolean';
            example = 'true';
          } else if (/^(list|items|arr|array|data|collection)/i.test(trimmed)) {
            type = 'array';
            example = '[1, 2, 3]';
          } else if (/^(obj|object|config|options|params)/i.test(trimmed)) {
            type = 'object';
            example = '{}';
          }
        }

        params.push({ name, type, example });
      }
    }

    // 检测是否为异步函数
    const isAsync = code.includes('async ') || code.includes('await ');

    return { funcName, params, isAsync };
  }

  /**
   * 生成测试用例
   */
  generateTests(code, options = {}) {
    const analysis = this.analyzeFunction(code);
    const { funcName, params, isAsync } = analysis;
    
    let tests = '';
    tests += \`// ==========================================\n\`;
    tests += \`// 自动生成的测试用例：\${funcName}\n\`;
    tests += \`// 生成时间：\${new Date().toISOString()}\n\`;
    tests += \`// ==========================================\n\n\`;

    // 导入
    tests += \`const { \${funcName} } = require('./module');\n\n\`;

    // describe 块
    tests += \`describe('\${funcName}', () => {\n\`;

    // 正常路径测试
    if (options.happyPath !== false) {
      tests += \`  // 正常路径测试\n\`;
      tests += \`  \${this.templates.happyPath.generate(funcName, params).split('\\n').map(l => '  ' + l).join('\\n')}\n\`;
    }

    // 空值检查
    if (options.nullCheck !== false && params.length > 0) {
      tests += \`  // 空值检查\n\`;
      const nullTests = this.templates.nullCheck.generate(funcName, params);
      tests += nullTests.split('\\n').map(l => l ? '  ' + l : '').join('\\n') + '\\n';
    }

    // 边界条件
    if (options.boundary !== false && params.length > 0) {
      tests += \`  // 边界条件测试\n\`;
      const boundaryTests = this.templates.boundaryConditions.generate(funcName, params);
      tests += boundaryTests.split('\\n').map(l => l ? '  ' + l : '').join('\\n') + '\\n';
    }

    // 类型检查
    if (options.typeCheck !== false && params.length > 0) {
      tests += \`  // 类型检查\n\`;
      const typeTests = this.templates.typeCheck.generate(funcName, params);
      tests += typeTests.split('\\n').map(l => l ? '  ' + l : '').join('\\n') + '\\n';
    }

    // 异步测试
    if (isAsync && options.async !== false) {
      tests += \`  // 异步测试\n\`;
      const asyncTests = this.templates.asyncTest.generate(funcName, params);
      tests += asyncTests.split('\\n').map(l => l ? '  ' + l : '').join('\\n') + '\\n';
    }

    tests += \`});\n\`;

    return {
      code: tests,
      analysis,
      testCount: (tests.match(/test\\(/g) || []).length,
      coverage: {
        happyPath: options.happyPath !== false,
        nullCheck: options.nullCheck !== false && params.length > 0,
        boundary: options.boundary !== false && params.length > 0,
        typeCheck: options.typeCheck !== false && params.length > 0,
        async: isAsync && options.async !== false
      }
    };
  }

  /**
   * 评估测试质量
   */
  evaluateTestQuality(testCode) {
    const metrics = {
      testCount: (testCode.match(/test\\(|it\\(/g) || []).length,
      describeCount: (testCode.match(/describe\\(/g) || []).length,
      expectCount: (testCode.match(/expect\\(/g) || []).length,
      hasBeforeEach: testCode.includes('beforeEach'),
      hasAfterEach: testCode.includes('afterEach'),
      hasMock: testCode.includes('jest.fn') || testCode.includes('mock'),
      hasAsync: testCode.includes('async ') || testCode.includes('await'),
      hasErrorHandling: testCode.includes('toThrow') || testCode.includes('rejects'),
      hasNullCheck: testCode.includes('null'),
      hasBoundaryCheck: testCode.includes('0') || testCode.includes('MAX_'),
    };

    // 质量评分
    let score = 0;
    if (metrics.testCount >= 5) score += 20;
    if (metrics.testCount >= 10) score += 10;
    if (metrics.hasErrorHandling) score += 15;
    if (metrics.hasNullCheck) score += 15;
    if (metrics.hasBoundaryCheck) score += 10;
    if (metrics.hasAsync && metrics.testCount > 0) score += 10;
    if (metrics.hasBeforeEach) score += 10;
    if (metrics.describeCount >= 2) score += 10;

    return { metrics, score: Math.min(score, 100) };
  }
}

// ============================================================
// 演示：模拟AI测试生成过程
// ============================================================

console.log('╔══════════════════════════════════════════════╗');
console.log('║    AI 测试生成模拟器 - 第15章演示           ║');
console.log('╚══════════════════════════════════════════════╝\\n');

const testGen = new TestGenerator();

// 演示1：分析函数并生成测试
console.log('【演示1】分析函数签名\\n');

const funcCode = 'function calculateDiscount(price, membershipLevel, isHoliday)';
const analysis = testGen.analyzeFunction(funcCode);
console.log('函数代码：' + funcCode);
console.log('分析结果：');
console.log(JSON.stringify(analysis, null, 2));

// 演示2：生成完整测试套件
console.log('\\n【演示2】生成测试用例\\n');

const testCode = \`
function validateEmail(email) {
  if (!email) throw new Error('邮箱不能为空');
  if (typeof email !== 'string') throw new TypeError('邮箱必须是字符串');
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}
\`;

const result = testGen.generateTests(testCode, {
  happyPath: true,
  nullCheck: true,
  boundary: true,
  typeCheck: true
});

console.log('原始函数：');
console.log(testCode);
console.log('\\n生成的测试：');
console.log(result.code);
console.log(\`测试数量：\${result.testCount}\`);
console.log('覆盖范围：', JSON.stringify(result.coverage));

// 演示3：测试质量评估
console.log('\\n【演示3】测试质量评估\\n');

const quality = testGen.evaluateTestQuality(result.code);
console.log('测试指标：');
console.log(JSON.stringify(quality.metrics, null, 2));
console.log(\`质量评分：\${quality.score}/100\`);

// 演示4：不同测试类型的生成
console.log('\\n【演示4】不同函数类型的测试生成\\n');

const functionTypes = [
  {
    name: '纯计算函数',
    code: 'function add(a, b) { return a + b; }',
    options: { happyPath: true, boundary: true }
  },
  {
    name: '异步API函数',
    code: 'async function fetchUser(id) { const res = await fetch("/api/user/" + id); return res.json(); }',
    options: { happyPath: true, async: true }
  },
  {
    name: '验证函数',
    code: 'function isValidPassword(password) { return password && password.length >= 8; }',
    options: { happyPath: true, nullCheck: true, boundary: true }
  }
];

for (const ft of functionTypes) {
  console.log(\`【\${ft.name}】\`);
  const r = testGen.generateTests(ft.code, ft.options);
  console.log(\`  生成 \${r.testCount} 个测试用例\`);
  console.log(\`  覆盖：\${Object.entries(r.coverage).filter(([,v]) => v).map(([k]) => k).join(', ')}\`);
  console.log('');
}

// 演示5：测试覆盖率策略
console.log('【演示5】测试覆盖率策略\\n');

const coverageStrategies = [
  { name: '语句覆盖率', target: '80%+', description: '确保每个语句至少被执行一次', ai: 'AI可以生成覆盖所有语句的测试' },
  { name: '分支覆盖率', target: '75%+', description: '确保每个条件分支都被测试', ai: 'AI可以生成覆盖所有分支的测试' },
  { name: '函数覆盖率', target: '90%+', description: '确保每个函数都被调用', ai: 'AI可以确保每个函数都有测试' },
  { name: '行覆盖率', target: '80%+', description: '确保每一行都被执行', ai: 'AI可以生成逐行覆盖的测试' },
  { name: '变异测试', target: 'N/A', description: '通过变异评估测试质量', ai: 'AI可以生成变异体并验证' }
];

for (const strategy of coverageStrategies) {
  console.log(\`\${strategy.name}：\`);
  console.log(\`  目标：\${strategy.target}\`);
  console.log(\`  说明：\${strategy.description}\`);
  console.log(\`  AI支持：\${strategy.ai}\`);
  console.log('');
}

console.log('╔══════════════════════════════════════════════╗');
console.log('║     测试生成演示完成！                      ║');
console.log('╚══════════════════════════════════════════════╝');`,
  },
];