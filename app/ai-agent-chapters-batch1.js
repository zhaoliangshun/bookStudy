// =============================================================
// AI Agent开发实战 - 第一批章节（前言 + 第一部分，共 5 章）
// =============================================================

const chapters = [
  {
    id: 'a-preface',
    group: '开篇',
    icon: '📖',
    title: '前言',
    content: `## 前言：欢迎来到 Agent 的时代

如果你在 2023 年问任何一位 AI 从业者"接下来什么最值得做"，十有八九会听到同一个词：**Agent**。而到了 2026 年的今天，这个词已经从论文里的概念变成了每天有千万开发者在调用的工程对象——Anthropic 推出 Computer Use、OpenAI 推出 Operator、各类 Agent 框架（LangGraph、AutoGen、CrewAI、Trae Agent）层出不穷，**"让模型不只回答问题，而是把任务做完"**已经成为这一轮 AI 应用浪潮的主旋律。

这本书，就是为想把 Agent 真正做出来、并落地到生产环境的开发者写的。

### 一、为什么说我们正处在"Agent 元年"

回顾过去几年 AI 应用形态的变化，可以清晰地看到一条主线：

- **2017 年前后**：Transformer 架构提出，模型能力开始指数级增长，但应用主要停留在"文本分类、摘要、翻译"等单点任务。
- **2022 年 11 月**：ChatGPT 引爆，对话式 AI 进入大众视野，但本质上仍是"你问我答"的**单轮问答**。
- **2023 年**：Plugin、Function Calling 出现，模型第一次可以"动手"调用外部能力，AutoGPT 让"自主 Agent"的概念进入开发者讨论。
- **2024-2025 年**：长上下文、强推理模型（o1/Claude 3.5 Sonnet/Gemini 2.5）成熟，工具调用稳定性大幅提升，**真正可用的 Agent 开始出现**。
- **2026 年**：Computer Use、浏览器 Agent、代码 Agent 走向规模化，企业级 Agent 平台成为基础设施。

> 用一句话概括：**LLM 解决了"听懂"的问题，Agent 要解决"做完"的问题。**前者是认知革命，后者是生产力革命。

当模型不仅能理解你的意图，还能自己拆解任务、选择工具、调用 API、读取结果、纠正错误、最终交付产物时，软件的形态就从"功能集合"变成了"数字员工"。这就是 Agent 之所以被叫做"元年"的原因——它不是一次模型升级，而是**应用范式的跃迁**。

### 二、本书写给谁

本书面向**已经具备一定编程基础、希望系统掌握 AI Agent 开发**的开发者，典型读者包括：

- 后端 / 全栈工程师：想在自己的产品里集成 Agent 能力，但不确定如何架构；
- 算法工程师 / 数据科学家：熟悉模型训练与微调，但缺乏工程化经验；
- 技术负责人 / 架构师：需要评估 Agent 在业务中的可行性与成本；
- 独立开发者 / 创业者：希望用 Agent 快速构建 MVP。

本书**不要求**你懂深度学习的数学推导，但需要你能读懂 Python 与 JavaScript 代码，了解 HTTP、JSON、异步编程等基础概念。如果你用过一次 OpenAI 或 Claude 的 API，跟得上本书的节奏会非常轻松。

### 三、本书怎么读：一条清晰的学习路径

全书按"**基础 → 能力 → 工程 → 实战 → 生产**"五段式组织，建议按顺序阅读，但也可按需跳读：

1. **第一部分 AI Agent 基础入门**（第 1-4 章）：建立心智模型，搞清楚 Agent 到底是什么、由什么组成、为什么 LLM 是它的"大脑"。
2. **第二部分 Agent 核心能力构建**（第 5-9 章）：动手实现感知、记忆、规划、工具调用、反思等关键模块。
3. **第三部分 Agent 框架与工程实践**（第 10-14 章）：对比主流框架，理解状态机、并发、可观测性等工程问题。
4. **第四部分 实战案例**（第 15-19 章）：客服 Agent、数据分析 Agent、代码 Agent、研究 Agent 等完整案例。
5. **第五部分 生产化与未来**（第 20-23 章）：评测、安全、成本、部署，以及对未来方向的展望。

每一章都遵循"**原理 → 代码 → 实战要点**"的结构，配套可运行的代码示例与可复用的 Prompt 模板。

### 四、配套资源

为了让本书不只是"读得懂"，更要"做得出"，我们提供以下配套资源：

- **代码仓库**：所有示例代码均可在 GitHub 上获取，按章节组织，可直接 \`npm install\` / \`pip install\` 后运行。
- **沙盒环境**：关键章节提供在线沙盒，无需本地配置即可体验 Agent 运行过程。
- **模型适配**：示例同时给出 OpenAI、Anthropic、Gemini 以及开源模型（如 Qwen、DeepSeek）的调用方式，避免被单一厂商锁定。
- **社区共学**：书中涉及的最佳实践会随模型演进持续更新，读者可通过配套社区获取最新动态。

### 五、本书的写作原则

为了让本书真正帮你"做出来"而不只是"看明白"，写作时遵循以下四条原则：

- **原理与代码并重**：每个关键概念都配可运行代码，避免"听起来懂、动手就懵"；
- **框架与底层双线**：既教你怎么用 LangGraph / AutoGen，也讲清楚它们内部在做什么，这样框架出问题时你才知道怎么调；
- **工程而非论文**：少讲数学推导，多讲踩坑、成本、限流、监控这些真正决定项目成败的事；
- **避免厂商锁定**：所有示例尽量同时给出 OpenAI / Anthropic / 开源模型的写法，让你不被任何一家绑架。

### 六、一个约定：从"对话机器人"到"自主 Agent"

在正式开始之前，请先在心里建立一个区分，它会贯穿全书：

| 维度 | 对话机器人（Chatbot） | 自主 Agent |
| --- | --- | --- |
| 目标 | 回答用户问题 | 完成用户任务 |
| 主动性 | 被动响应 | 主动规划与执行 |
| 与外部世界 | 封闭，不接触外部 | 开放，可调用工具与环境 |
| 失败处理 | 报错给用户 | 自我反思与重试 |
| 评价标准 | 回答质量 | 任务完成度 |

理解了这个区别，你就理解了本书要做的事：**带你跨过"会聊天"的边界，进入"会干活"的世界。**

最后送你一句话——这也是本书最想传达的信念：

> **未来的软件，不是被"开发"出来的，而是被"委派"给 Agent 完成的。**而学会委派的前提，是你先学会造 Agent。

准备好了吗？让我们从第 1 章——"什么是 AI Agent"——开始。`,
  },
  {
    id: 'a-ch01',
    group: '第一部分 AI Agent 基础入门',
    icon: '🤖',
    title: '什么是AI Agent——概念、发展与未来',
    content: `## 第 1 章 什么是 AI Agent

在开始写代码之前，我们必须先回答一个看似简单却异常关键的问题：**到底什么才算 Agent？**这个词被滥用了——聊天框加个按钮就敢叫 Agent，调用一次 API 也敢叫 Agent。如果定义不清晰，后面的架构、框架、评测都会失去锚点。本章就来把它讲透。

### 1.1 Agent 的定义：感知、决策、行动的自主实体

学术界对 Agent 的定义可以追溯到上世纪 80 年代的分布式人工智能研究。一个被广泛接受的定义是：

> **Agent 是一个能够感知环境（perceive）、自主决策（decide）、采取行动（act）以达成目标的实体。**

把这个定义拆开，有四个关键词：

- **感知（Perceive）**：从环境获取信息，可以是用户的自然语言输入，也可以是 API 返回、数据库查询、传感器数据。
- **自主（Autonomous）**：不是机械执行预设流程，而是根据当前状态自己决定下一步做什么。
- **决策（Decide）**：在多个可选动作中选择，背后通常是一个推理过程（今天主要是 LLM）。
- **行动（Act）**：能对环境产生影响，比如调用工具、写文件、发消息、操作浏览器。

用一句话区分：**如果一个系统只会"你问什么我答什么"，那是 Chatbot；如果它能"自己想清楚要做什么并把它做完"，那才是 Agent。**

### 1.2 一条清晰的演进史：从 Siri 到 AutoGPT

理解 Agent 的最好方式是看它如何一步步演化而来。

#### 阶段一：规则型助手（2011 前后）

以 Apple Siri、早期 Google Now 为代表。本质是基于规则的槽位填充（slot filling）：

\`\`\`text
用户：明天北京天气怎么样？
系统：识别 intent=weather，slot={location:北京, date:明天}
系统：调用天气 API → 拼接模板回复
\`\`\`

**局限**：只能处理预定义的意图，遇到稍微复杂的请求就崩。

#### 阶段二：对话型助手（2022-2023）

以 ChatGPT 为代表。LLM 让系统具备了真正的语言理解能力，可以处理任意输入：

\`\`\`python
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "用一段话解释什么是递归"}]
)
print(response.choices[0].message.content)
\`\`\`

**突破**：能理解任意自然语言，输出流畅。
**局限**：仍是被动的"你问我答"，不能主动行动，也无法获取最新信息。

#### 阶段三：工具增强型助手（2023 中）

Function Calling / Tool Use 的出现是关键转折点。模型不再只是"输出文字"，而是可以"决定调用哪个函数"：

\`\`\`javascript
// 定义一个可供模型调用的工具
const tools = [{
  type: "function",
  function: {
    name: "get_weather",
    description: "查询某城市当前天气",
    parameters: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"]
    }
  }
}];

// 模型返回的不是文字，而是工具调用决策
const res = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "北京今天冷吗？" }],
  tools
});
// res.choices[0].message.tool_calls -> [{ function: { name: "get_weather", arguments: '{"city":"北京"}' } }]
\`\`\`

**突破**：第一次让 LLM "动了手"。
**局限**：仍然是单步调用，缺少长程规划。

#### 阶段四：自主 Agent（2023 末至今）

以 AutoGPT、BabyAGI、Devin、Claude Computer Use 为代表。系统不再是"一问一答 + 一次工具调用"，而是进入循环：

\`\`\`text
while not task_done:
    observation = perceive(environment)
    thought    = reason(observation, history)
    action     = decide_action(thought)
    result     = execute(action)
    update_memory(result)
\`\`\`

这就是后来我们要反复实现的 **Perception-Reasoning-Action-Loop**，也是本书的核心骨架。

### 1.3 Agent、Chatbot、Workflow 三者的区别

这三个概念经常被混用，但它们在工程上是**完全不同**的东西，搞清楚边界对架构选型至关重要。

| 维度 | Chatbot | Workflow | Agent |
| --- | --- | --- | --- |
| 控制流 | 无 | 固定、预定义 | 动态、由模型决定 |
| 灵活性 | 低 | 中 | 高 |
| 可预测性 | 高 | 高 | 低 |
| 适用场景 | 简单问答 | 流程明确的任务 | 开放式、需要推理的任务 |
| 调试难度 | 低 | 低 | 高 |

> **一句话区分**：Workflow 是"轨道上的火车"，Agent 是"森林里的探险者"。前者高效但死板，后者灵活但不可控。

**工程建议**：**能用 Workflow 解决的就别用 Agent。**Agent 的灵活性是有代价的——延迟更高、成本更贵、更难调试。只有当任务路径无法预先枚举时，才值得引入 Agent。

### 1.4 为什么 2024-2026 是真正的"Agent 元年"

早在 2023 年 AutoGPT 就火过一波，为什么当时没能落地？四个关键条件在 2024-2025 年才陆续成熟：

1. **模型能力达标**：强推理模型（o1、Claude 3.5/4 Sonnet、Gemini 2.5）让长程规划、代码生成、工具调用的稳定性从"勉强能用"变成"工程可用"。
2. **长上下文**：从 4K → 200K+ tokens，Agent 可以携带完整任务历史，不再因为"忘记前面做过什么"而重复劳动。
3. **工具调用协议标准化**：Function Calling、MCP（Model Context Protocol）让工具接入成本骤降。
4. **基础设施成熟**：向量数据库、可观测平台、Agent 框架（LangGraph/AutoGen/CrewAI）大幅降低工程门槛。

四个条件齐备，Agent 才从"玩具"变成"工具"。这也是本书写于 2026 年的原因——**今天学 Agent，不再是赌未来，而是抓住当下。**

### 1.5 应用场景概览

Agent 不是单一产品，而是一类应用形态。下面是已经跑通商业模式的主要场景：

- **编程 Agent**：Devin、Cursor Agent、Trae，能自主完成"理解需求 → 写代码 → 跑测试 → 修 bug"的完整闭环。
- **客服 Agent**：不只回答 FAQ，还能查订单、改地址、发起退款，真正闭环处理用户工单。
- **数据分析 Agent**：接收自然语言提问，自主查询数据库、画图、写报告。
- **研究 Agent**：自动检索文献、交叉验证、生成综述。
- **浏览器 / 电脑操作 Agent**：Anthropic Computer Use、OpenAI Operator，能像人一样点击、输入、滚动。
- **个人助理 Agent**：日程管理、邮件起草、跨应用协调。

本书第四部分的实战案例会覆盖其中最具代表性的几类。

### 1.6 本章小结与练习

- Agent = 感知 + 自主决策 + 行动的实体；
- 演进路径：规则助手 → 对话助手 → 工具增强 → 自主 Agent；
- Agent ≠ Chatbot ≠ Workflow，三者工程取舍不同；
- 2024-2026 才是真正的 Agent 元年，因为模型、上下文、协议、基础设施四者同时成熟。

**思考题**：请列举你日常工作中一个"目前用 Workflow 实现，但未来可能用 Agent 改造"的场景，并说明改造后能解决什么 Workflow 解决不了的问题。答案会在第 2 章开头揭晓。`,
  },
  {
    id: 'a-ch02',
    group: '第一部分 AI Agent 基础入门',
    icon: '🧠',
    title: 'AI Agent的核心能力——感知、推理、行动、学习',
    content: `## 第 2 章 AI Agent 的核心能力

第 1 章我们给出了 Agent 的定义，但定义只回答了"是什么"。本章要回答"由什么组成"——也就是把 Agent 拆成可工程化的几个**核心能力模块**。这四个模块是后续所有架构与框架的零件，务必在本章把它们刻进脑子。

### 2.1 四大核心能力总览

一个能干活的 Agent，本质上在做四件事循环：

\`\`\`text
        ┌──────────────────────────┐
        │   1. 感知 Perception     │  ← 从环境获取信息
        └────────────┬─────────────┘
                     ▼
        ┌──────────────────────────┐
        │   2. 推理 Reasoning      │  ← 思考、规划、决策
        └────────────┬─────────────┘
                     ▼
        ┌──────────────────────────┐
        │   3. 行动 Action          │  ← 调用工具，影响环境
        └────────────┬─────────────┘
                     ▼
        ┌──────────────────────────┐
        │   4. 学习 Learning       │  ← 积累经验、改进自身
        └────────────┬─────────────┘
                     │
                     └─────► 回到感知（新一轮循环）
\`\`\`

这四个能力合在一起，构成著名的 **Perception-Reasoning-Action-Loop**（PRA Loop），有时也写作 ReAct（Reasoning + Acting）。

### 2.2 感知 Perception：让 Agent"看见"世界

感知层负责把外部世界的各种信号**翻译成模型能理解的统一表示**（通常是文本 + 结构化数据）。常见输入：

- **用户输入**：自然语言文本、语音转写、图片；
- **工具返回**：API 的 JSON、数据库查询结果、命令行输出；
- **环境状态**：当前时间、文件系统、浏览器 DOM、屏幕截图；
- **历史记忆**：从向量数据库检索的相关片段。

> 工程要点：感知层的产物应该是**结构化、可序列化**的。模型最擅长处理"清晰列出的要点"，而不是一坨原始日志。

\`\`\`python
def perceive(user_input: str, context: dict) -> str:
    """把多源输入整理成模型可读的观测文本"""
    lines = [f"用户输入: {user_input}"]
    if context.get("retrieved_docs"):
        lines.append("相关知识:")
        for i, doc in enumerate(context["retrieved_docs"], 1):
            lines.append(f"  [{i}] {doc[:200]}")
    if context.get("tool_results"):
        lines.append(f"上次工具返回: {context['tool_results'][-1]}")
    return "\\n".join(lines)
\`\`\`

**常见坑**：把整个 API 响应原样塞给模型，导致上下文爆炸、成本飙升。正确做法是**在感知层做摘要与裁剪**。

### 2.3 推理 Reasoning：让 Agent"想清楚"再动

推理层是 Agent 的"大脑"，负责：

- **理解任务**：用户到底想要什么？目标是什么？
- **拆解计划**：把大任务拆成可执行的小步骤；
- **选择工具**：每一步该用哪个工具？参数怎么填？
- **反思纠错**：上一步失败了，是换工具还是改参数？

今天最主流的推理范式是 **ReAct**——让模型先输出"思考过程（Thought）"，再输出"行动（Action）"：

\`\`\`text
Thought: 用户问北京天气，我需要调用天气工具
Action: get_weather(city="北京")
Observation: {"temp": 5, "condition": "晴"}
Thought: 5 度比较冷，我应该提醒用户加衣服
Action: respond("北京今天 5 度，晴，建议穿羽绒服")
\`\`\`

**为什么 Thought 这一步很关键**：它强迫模型"显式思考"，在多项研究中被证明能显著提升工具调用准确率。对于强推理模型（如 o1、Claude Sonnet），这一步甚至可以省略——模型内部已隐式完成。

> 实战要点：**不要让模型一次性输出完整计划，而是"边想边做"**。完整计划容易在第一步就出错，且后续不调整；边想边做可以根据上一步结果修正下一步。

### 2.4 行动 Action：让 Agent"动手"

行动层把模型输出的"决策"翻译成对真实环境的操作。一个完整的行动通常包含：

1. **动作类型**：调用哪个工具 / 回复用户 / 等待输入；
2. **参数**：调用工具需要的入参；
3. **执行**：真正去调 API、读写文件、操作浏览器；
4. **结果回传**：把执行结果（成功或失败）交给感知层。

\`\`\`javascript
// 一个最小化的行动执行器
async function executeAction(action) {
  switch (action.name) {
    case 'get_weather': {
      const r = await fetch(\`https://api.weather.com?city=\${action.args.city}\`);
      return { ok: true, data: await r.json() };
    }
    case 'write_file': {
      // 真实环境需要做权限校验、路径白名单
      await fs.writeFile(action.args.path, action.args.content);
      return { ok: true, data: 'written' };
    }
    case 'respond': {
      return { ok: true, data: action.args.message, terminal: true };
    }
    default:
      return { ok: false, error: \`未知动作: \${action.name}\` };
  }
}
\`\`\`

**三个工程红线**：

- **沙盒化**：永远不要让 Agent 直接操作生产环境，先在沙盒里跑；
- **白名单**：可调用的工具、可写的路径、可访问的域名都要有显式白名单；
- **限流**：单次任务最多调用多少次工具、最多花多少 token，必须有上限。

这三条是 Agent 与"普通后端服务"最大的工程差异，也是后续生产化章节的重头戏。

### 2.5 学习 Learning：让 Agent"越用越聪明"

学习是 Agent 最容易被忽略、却决定长期价值的能力。可以分三个层次：

- **短期：上下文内学习**。把任务历史塞进 prompt，模型基于这些信息决策。最简单但最贵。
- **中期：记忆系统**。用向量数据库持久化经验，按需检索。是当前主流做法。
- **长期：偏好与策略更新**。收集"用户反馈 / 成功案例"，通过微调或 RLHF 让模型本身变好。成本高，通常留给大厂。

下面是一个最简化的"经验记忆"实现：

\`\`\`python
class ExperienceMemory:
    def __init__(self, embedder, store):
        self.embedder = embedder
        self.store = store  # 向量数据库

    def remember(self, task: str, plan: str, success: bool):
        vec = self.embedder.embed(task)
        self.store.add({
            "task": task, "plan": plan, "success": success, "vec": vec
        })

    def recall(self, task: str, k: int = 3):
        vec = self.embedder.embed(task)
        return self.store.search(vec, k)  # 返回最相似的历史经验
\`\`\`

> 一个常被低估的事实：**Agent 的"聪明"很大程度上来自记忆，而非模型本身**。同一个 GPT-4o，有没有记忆系统，表现可能差一个数量级。

### 2.6 与人类认知的类比

把 Agent 的四大能力对照人类认知，会更好理解：

| Agent 能力 | 人类类比 | 工程实现 |
| --- | --- | --- |
| 感知 | 看、听、读 | 多模态输入 + RAG |
| 推理 | 思考、判断 | LLM + CoT / ReAct |
| 行动 | 动手做事 | 工具调用 + 沙盒执行 |
| 学习 | 经验积累 | 向量记忆 + 偏好数据 |

这个类比不是修辞——它直接对应工程实现：每个能力模块都可以独立设计、独立评测、独立替换。这就是为什么本书后续章节会**一章一个能力**地展开。

### 2.7 动手：一个 50 行的最小 Agent Loop

把上面四块拼起来，就能写出一个真正"会干活"的最小 Agent：

\`\`\`python
import json

def minimal_agent(goal, llm, tools, memory, max_steps=10):
    """最简 Agent Loop：感知-推理-行动-学习"""
    history = []
    for step in range(max_steps):
        # 1. 感知：整理当前观测
        observation = f"目标: {goal}\\n历史: {history[-3:]}"
        # 2. 推理：让模型决定下一步
        decision = llm(observation, tools)
        # 3. 行动：执行模型选定的动作
        result = tools[decision["action"]](**decision["args"])
        history.append({"step": step, "decision": decision, "result": result})
        # 4. 学习：把经验存下来
        memory.remember(goal, decision, success=result.get("ok"))
        if decision.get("terminal"):
            return result["data"]
    return "达到最大步数仍未完成"
\`\`\`

这 20 行代码已经包含了 Agent 的全部精髓。后续整本书，本质都是在**给这个循环的每一环加细节、加鲁棒性、加可观测性**。

### 2.8 本章小结

- Agent 的四大核心能力：感知、推理、行动、学习；
- 这四者构成 **PRA Loop**，是所有 Agent 框架的骨架；
- 学习能力常被忽略，却决定 Agent 长期价值；
- 一个 50 行的最小 Loop 已经能跑通核心思想。

下一章，我们会把这个 Loop 放到不同**架构**里看——从最简单的单轮问答，一路演进到完全自主的 Agent。`,
  },
  {
    id: 'a-ch03',
    group: '第一部分 AI Agent 基础入门',
    icon: '🏗️',
    title: 'AI Agent的架构——从简单到复杂的演进',
    content: `## 第 3 章 AI Agent 的架构演进

第 2 章我们抽象出了 Agent 的四大能力，但能力不等于架构。**同样的能力，组织方式不同，系统的复杂度、可控性、成本完全不同。**本章把 Agent 的常见架构按从简单到复杂排成五级，讲清楚每一级的形态、优缺点和适用场景，并给出一份"该用哪一级"的决策指南。

### 3.1 五级架构总览

\`\`\`text
Level 1  单轮问答        ── 一问一答，无状态
Level 2  多轮对话        ── 有上下文，仍只回答
Level 3  工具调用         ── 可以调用外部能力，单步
Level 4  规划执行         ── 先拆任务再执行，多步可控
Level 5  自主 Agent      ── 闭环 Loop，自我纠错与反思
\`\`\`

每一级都是上一级的超集——更高一级包含更低一级的能力，并新增了某种"自主性"。理解这个演进，能帮你避免"一上来就上最复杂架构"的常见陷阱。

### 3.2 Level 1：单轮问答

最朴素的形态：用户问一句，模型答一句，每次调用都是独立的。

\`\`\`javascript
async function ask(question) {
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: question }]
  });
  return r.choices[0].message.content;
}
\`\`\`

**优点**：实现极简、成本可控、可预测性最高。
**缺点**：无记忆、不能行动，本质只是"LLM 套壳"。
**适用**：FAQ、文案润色、翻译、单点知识查询。

> 经验法则：**80% 的"AI 功能"需求，Level 1 就够了**。不要因为听起来酷就上更高级别。

### 3.3 Level 2：多轮对话

在 Level 1 基础上引入"对话历史"，让模型有上下文。

\`\`\`javascript
const conversation = [];
async function chat(userMsg) {
  conversation.push({ role: 'user', content: userMsg });
  const r = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: conversation
  });
  const reply = r.choices[0].message.content;
  conversation.push({ role: 'assistant', content: reply });
  return reply;
}
\`\`\`

**新增能力**：上下文连贯、指代消解（"它""那个"能被理解）。
**新增问题**：上下文窗口会爆炸——需要做**摘要 / 滑窗 / 检索式记忆**。

**适用**：陪伴型聊天、长文档问答、教学辅导。

**工程要点**：永远不要无限增长 messages 数组，必须设计**遗忘策略**：

- **滑窗**：保留最近 N 轮；
- **摘要**：把老对话压缩成一段总结；
- **检索**：把历史存向量库，按需取回。

### 3.4 Level 3：工具调用（Tool Use）

在 Level 2 基础上，允许模型"决定调用某个函数"。这是 Chatbot 走向 Agent 的关键一跳。

\`\`\`python
tools = [{
    "type": "function",
    "function": {
        "name": "query_order",
        "description": "根据订单号查询订单状态",
        "parameters": {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"]
        }
    }
}]

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools
)
# 模型返回 tool_calls，由我们真正执行
\`\`\`

**新增能力**：能"动手"，能获取最新信息、调用内部系统。
**新增问题**：

- 工具描述写不好，模型就会乱调；
- 调用参数可能不合法，要做校验与兜底；
- 单次调用仍是"一次性"的，无法处理"先查 A 再用 A 的结果查 B"这类链式任务。

**适用**：增强型客服、带数据查询的助手。

> **写工具描述的心法**：把它当成写给一个聪明但完全不知情的新同事的文档——要讲清楚"这个工具做什么、什么时候该用、什么时候不该用、参数什么含义"。

### 3.5 Level 4：规划执行（Plan-then-Execute）

把任务拆成"先规划、后执行"两阶段。先让模型生成一个步骤清单，再逐步执行。

\`\`\`python
def plan_and_execute(goal, llm, tools):
    # 阶段 1：规划
    plan = llm(f"请把任务拆成可执行步骤：{goal}")
    steps = parse_steps(plan)
    # 阶段 2：执行
    results = []
    for step in steps:
        result = execute_step(step, tools)
        results.append(result)
    return results
\`\`\`

**优点**：可控、可调试、可审计（每一步都看得见）；适合工作流明确的任务。
**缺点**：**计划一旦生成就不易修改**——如果第 2 步发现第 1 步错了，整个计划要推倒重来。

**适用**：报表生成、ETL、多步骤数据处理这类"路径相对固定但参数动态"的场景。

**改进版**：在每步执行后让模型判断"原计划还成立吗"，不成立就重新规划。这就已经半只脚踏进 Level 5 了。

### 3.6 Level 5：自主 Agent（Autonomous Agent）

最高级形态：模型在循环中**自己决定下一步做什么**，根据环境反馈调整策略，直到任务完成或主动放弃。

\`\`\`python
def autonomous_agent(goal, llm, tools, max_steps=20):
    state = {"goal": goal, "history": [], "memory": []}
    for step in range(max_steps):
        # 模型同时做：感知 + 推理 + 决策
        action = llm.decide(state)
        result = execute(action)
        state["history"].append((action, result))
        if action.get("terminal"):
            return result
        # 失败时自我反思
        if not result.get("ok"):
            reflection = llm.reflect(state)
            state["memory"].append(reflection)
    return "达到最大步数"
\`\`\`

**新增能力**：完全自主、可处理开放式任务、能在失败中纠正。
**新增问题（一箩筐）**：

- **不可控**：可能跑偏，甚至调用不该调的工具；
- **昂贵**：循环里每一步都是 LLM 调用；
- **难调试**：行为路径不固定，复现 bug 困难；
- **安全风险**：必须配合强沙盒 + 权限白名单。

**适用**：编程 Agent、研究 Agent、浏览器操作 Agent——这类"目标明确但路径不固定"的任务。

### 3.7 五级架构对比

| 维度 | L1 问答 | L2 对话 | L3 工具 | L4 规划 | L5 自主 |
| --- | --- | --- | --- | --- | --- |
| 自主性 | 无 | 无 | 单步 | 多步固定 | 多步动态 |
| 可控性 | 极高 | 高 | 高 | 中 | 低 |
| 成本 | 低 | 低 | 中 | 中 | 高 |
| 调试难度 | 低 | 低 | 中 | 中 | 高 |
| 典型代表 | 翻译 | ChatGPT | 插件版助手 | BabyAGI | Devin |

### 3.8 决策指南：我该选哪一级

不要无脑上 Level 5。用下面这个决策树：

\`\`\`text
1. 任务路径能预先枚举吗？
   ├─ 能 ──→ 用 Workflow（甚至不需要 LLM）
   └─ 不能 ↓
2. 是否需要记忆对话？
   ├─ 不需要 ──→ Level 1
   └─ 需要 ↓
3. 是否需要调用外部能力？
   ├─ 不需要 ──→ Level 2
   └─ 需要 ↓
4. 任务能否拆成线性步骤？
   ├─ 能 ──→ Level 4（Plan-then-Execute）
   └─ 不能（需要根据反馈动态决策）──→ Level 5
\`\`\`

**一条铁律**：**从低级别开始，遇到瓶颈再升级。**每一次升级都意味着更高的成本、更复杂的工程、更难调试的系统。早期阶段用 Level 2 / 3 跑通业务，比一上来就追求 Level 5 的"酷炫"要务实得多。

### 3.9 架构不是非此即彼

真实的 Agent 系统常常是**混合架构**：外层是 Level 5 自主循环，内层的某些子任务用 Level 4 规划执行，再往下某些确定步骤用 Level 1-2。这就是后面我们要讲的 **多 Agent 协作** 与 **层级式架构** 的雏形。

> 一句话总结：**架构的本质是"在灵活性与可控性之间做权衡"**。没有最好的架构，只有最适合当前任务的架构。

### 3.10 本章小结

- Agent 架构分五级：单轮问答 → 多轮对话 → 工具调用 → 规划执行 → 自主 Agent；
- 每一级是上一级的超集，新增一种"自主性"；
- 选型遵循决策树，**从低级别开始，遇到瓶颈再升级**；
- 真实系统常常是混合架构，外层自主 + 内层规划 + 底层确定步骤。

下一章我们回到 Agent 的"大脑"——LLM 本身，搞清楚它为什么适合做 Agent，以及如何用好它。`,
  },
  {
    id: 'a-ch04',
    group: '第一部分 AI Agent 基础入门',
    icon: '💬',
    title: 'LLM基础——大语言模型是Agent的大脑',
    content: `## 第 4 章 LLM 基础：Agent 的大脑

如果说第 2 章讲的四大能力是 Agent 的"四肢"，那么 LLM 就是它的"大脑"。本章不展开讲 Transformer 的数学推导（那需要单独一本书），而是从**工程视角**讲清楚三件事：LLM 到底是什么、为什么它适合做 Agent 大脑、以及如何把它用好。

### 4.1 LLM 是什么：三步走的能力来源

一个现代 LLM（如 GPT-4o、Claude、Gemini）的能力来自三个阶段：

#### 阶段一：预训练（Pretraining）

用海量文本（互联网网页、书籍、代码、论文）训练一个 Transformer 模型，让它学会**"预测下一个 token"**。

\`\`\`text
输入: "今天天气真"
模型预测下一个 token: "好"
\`\`\`

这个看似简单的任务，逼着模型学会了语法、世界知识、推理能力。**预训练决定了模型的"知识底座"**。

#### 阶段二：指令微调（Instruction Tuning / SFT）

预训练模型只会"续写"，不会"听话"。SFT 用"指令-回答"对训练，让模型学会**按指令行事**：

\`\`\`text
指令: "用三句话解释什么是引力"
回答: "引力是……"
\`\`\`

这一步让 LLM 从"续写器"变成"助手"。

#### 阶段三：对齐（RLHF / DPO）

让人类标注"哪个回答更好"，用强化学习或直接偏好优化让模型**符合人类价值观**：有用、诚实、无害。

> 三步的工程含义：预训练决定**能力上限**，SFT 决定**可用性**，对齐决定**安全性**。理解这点，你就明白为什么开源模型（只做了预训练 + SFT）在某些场景下表现差——它们往往缺少高质量的对齐数据。

### 4.2 为什么 LLM 适合做 Agent 的大脑

把 LLM 当 Agent 大脑，不是巧合，而是它的几个特性恰好匹配 Agent 的需求：

| Agent 需求 | LLM 能力 |
| --- | --- |
| 理解自然语言指令 | 强语言理解 |
| 处理多源、非结构化输入 | 上下文学习能力 |
| 拆解任务、做规划 | 推理能力（CoT） |
| 选择工具、生成参数 | 结构化输出（Function Calling） |
| 反思与纠错 | 长上下文 + 自我评估 |

更关键的是，LLM 把"决策逻辑"从**硬编码规则**变成了**自然语言 prompt**。这意味着同一个模型，换个 prompt 就能做完全不同的任务——这是过去任何规则系统都做不到的。

> 用一句话总结：**LLM 之所以是 Agent 的大脑，不是因为它"聪明"，而是因为它"可被自然语言编程"。**Prompt 就是 Agent 时代的"代码"。

### 4.3 必须搞懂的几个核心概念

#### 4.3.1 Token：模型的"最小语义单位"

LLM 不直接处理字符，而是处理 token。一个 token 大致对应：

- 英文：约 0.75 个单词（4 个字符）；
- 中文：约 0.5-1 个汉字（取决于分词器）；
- 代码：标点和关键字各占 token。

\`\`\`python
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
print(len(enc.encode("你好，世界")))  # 中文往往比英文更费 token
print(len(enc.encode("hello world")))
\`\`\`

**工程影响**：计费按 token、上下文窗口按 token、延迟与 token 数线性相关。**Prompt 越短，Agent 越快越便宜。**

#### 4.3.2 Context Window：模型能"记住"多少

上下文窗口指模型一次能处理的最大 token 数。从早期的 4K 到今天的 200K-2M：

- **4K-8K**：仅够多轮对话；
- **32K-128K**：够带少量检索结果；
- **200K-2M**：够塞整本书、整个代码库。

**长上下文 ≠ 万能**：研究表明模型对上下文中间的信息存在"中段遗忘"（lost in the middle）现象。重要信息最好放在**开头或结尾**。

#### 4.3.3 Temperature：决定"创造力"

温度控制采样的随机性：

- **0**：几乎确定性输出，适合工具调用、代码生成；
- **0.3-0.7**：少量随机，适合写作、对话；
- **1.0+**：高随机，适合创意发散。

\`\`\`javascript
// Agent 调用工具时务必用低温度
const r = await client.chat.completions.create({
  model: 'gpt-4o',
  messages,
  tools,
  temperature: 0  // 工具调用要确定性
});
\`\`\`

> 经验法则：**Agent 推理与工具调用用 temperature=0；创意生成用 0.7；不要在同一个 Loop 里混用。**

### 4.4 主流 LLM 横向对比

2026 年市面上主流的 LLM 大致可以分三档：

| 档位 | 代表模型 | 特点 | 适用 |
| --- | --- | --- | --- |
| 旗舰闭源 | GPT-5 / Claude 4 Opus / Gemini 2.5 Pro | 推理与工具调用最强 | 复杂 Agent、生产环境 |
| 中端闭源 | GPT-4o / Claude 4 Sonnet / Gemini 2.5 Flash | 性价比高 | 大多数 Agent 场景 |
| 开源 | Qwen3 / DeepSeek V3 / Llama 4 | 可私有部署、便宜 | 数据敏感、需微调 |

**选型建议**：

1. **先跑通再优化**：用 Claude Sonnet 或 GPT-4o 跑通 Agent，再考虑切换开源降本；
2. **关注工具调用能力**：Agent 看重的是稳定的 Function Calling，而非纯文本生成；
3. **避免厂商锁定**：抽象出 LLM 接口，支持多模型切换：

\`\`\`python
class LLMAdapter:
    def __init__(self, provider, model):
        self.provider = provider  # 'openai' | 'anthropic' | 'gemini'
        self.model = model

    def chat(self, messages, tools=None, temperature=0):
        if self.provider == 'openai':
            return self._call_openai(messages, tools, temperature)
        elif self.provider == 'anthropic':
            return self._call_anthropic(messages, tools, temperature)
        # ... 其他厂商
\`\`\`

### 4.5 第一次调用 LLM：代码示例

下面是一个同时支持 OpenAI 和 Anthropic 的最小调用示例，让你立即上手：

\`\`\`javascript
// 调用 OpenAI（兼容多数国产模型 API）
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: '你是一个能干活的助手，遇到不确定时主动调用工具。' },
    { role: 'user', content: '帮我查一下订单 #A12345 的物流状态。' }
  ],
  tools: [{
    type: 'function',
    function: {
      name: 'query_logistics',
      description: '根据订单号查询物流',
      parameters: {
        type: 'object',
        properties: { order_id: { type: 'string' } },
        required: ['order_id']
      }
    }
  }],
  temperature: 0
});

// 模型决定调用工具时，choices[0].message.tool_calls 会有内容
const msg = response.choices[0].message;
if (msg.tool_calls) {
  console.log('模型决定调用工具:', msg.tool_calls[0].function.name);
  console.log('参数:', msg.tool_calls[0].function.arguments);
} else {
  console.log('模型直接回复:', msg.content);
}
\`\`\`

\`\`\`python
# 调用 Anthropic Claude
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=[{
        "name": "query_logistics",
        "description": "根据订单号查询物流",
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"]
        }
    }],
    messages=[{"role": "user", "content": "帮我查一下订单 #A12345 的物流状态。"}]
)

for block in response.content:
    if block.type == "tool_use":
        print(f"调用工具: {block.name}, 参数: {block.input}")
    elif block.type == "text":
        print(f"回复: {block.text}")
\`\`\`

### 4.6 把 LLM 用好的五条军规

1. **Prompt 要给角色、给目标、给约束**——模型不是你肚子里的蛔虫；
2. **少样本（few-shot）胜过纯指令**——给一两个例子，准确率立刻提升；
3. **结构化输出优于自由文本**——能用 JSON 就别让模型写散文；
4. **复杂任务拆成多轮**——一次性让模型干十件事，结果一定不靠谱；
5. **永远做兜底校验**——模型会幻觉、会乱调工具，参数校验与异常处理是底线。

### 4.7 LLM 的局限：Agent 大脑不是万能的

清醒认识 LLM 的边界，才能避免踩坑：

- **幻觉**：会编造不存在的 API、不存在的文档，必须配合 RAG 与工具校验；
- **长程推理弱**：超过 5-7 步的规划容易跑偏，需要拆解与中间检查；
- **数学与逻辑**：纯文本推理容易错，复杂计算应交给代码解释器；
- **延迟与成本**：每次调用都要付费、都要等几秒，Loop 越深越贵。

> 一句话：**LLM 是 Agent 的大脑，但大脑也需要手（工具）和眼睛（感知）来弥补它的弱点。**这正是后面几章要解决的事。

### 4.8 本章小结

- LLM 能力来自三步：预训练（知识）+ SFT（可用性）+ 对齐（安全）；
- LLM 适合做 Agent 大脑，因为它"可被自然语言编程"；
- 必须搞懂 Token、Context Window、Temperature 三个核心概念；
- 主流模型分旗舰闭源、中端闭源、开源三档，要避免厂商锁定；
- 用好 LLM 的五条军规 + 清醒认识其局限。

第一部分到这里就结束了。你已经建立起了对 Agent 的完整心智模型——它是什么、由什么组成、怎么组织、大脑如何工作。从第 5 章开始，我们进入第二部分，**动手把每一个能力模块真的造出来**。`,
  },
];

export { chapters };
