// =============================================================
// AI Agent 应用开发实战 - 第一批章节（AI 基础概念，共 4 章）
// 第 1-4 章：什么是 AI Agent / LLM 原理 / Token 与上下文 / 开发环境搭建
// =============================================================

export const chapters = [
  {
    id: 'ai-what-is-agent',
    group: 'AI 基础概念',
    icon: '🤖',
    title: '什么是 AI Agent',
    content: `## 什么是 AI Agent

在动手写第一行 Agent 代码之前，我们必须先把"Agent 到底是什么"这件事想透。很多人把 Agent 等同于"会聊天的机器人"，这种误解会导致整个项目方向跑偏。本章从定义出发，讲清楚 Agent 的本质、组成要素、与传统程序的区别，以及它的历史演进。

### 一、Agent 的定义：感知—决策—行动—目标的闭环

**AI Agent（人工智能智能体）**，是指能够**感知环境、自主决策、采取行动、从而达成目标**的智能系统。这四个词构成一个完整的闭环：

1. **感知（Perceive）**：从环境获取信息。对软件 Agent 来说，环境就是用户输入、API 返回、数据库、文件系统、网页等。
2. **决策（Decide）**：基于感知到的信息，结合自身目标，决定下一步做什么。这一步由 LLM（大语言模型）充当"大脑"完成。
3. **行动（Act）**：执行决策，比如调用一个工具、返回一段回答、修改一条数据库记录。
4. **目标（Goal）**：所有感知和行动都服务于一个明确目标，比如"帮用户订一张明天去上海的机票"。

\`\`\`text
感知环境 ──▶ 自主决策 ──▶ 采取行动 ──▶ 观察结果 ──▶ (循环) ──▶ 达成目标
   ▲                                                        │
   └────────────────────────────────────────────────────────┘
\`\`\`

关键在于"**自主**"二字：Agent 不是被动地执行预写好的 if-else 分支，而是根据当前情况动态判断该做什么。这就是它与传统程序最本质的区别。

### 二、AI Agent vs 传统程序：规则驱动 vs 模型驱动

理解 Agent，最快的方式是和传统程序对比：

| 维度 | 传统程序 | AI Agent |
| --- | --- | --- |
| 行为来源 | 开发者预先写死的规则（if-else） | LLM 根据输入动态生成 |
| 应对新情况 | 没见过的场景就报错或走默认分支 | 能处理训练时没见过的开放任务 |
| 可维护性 | 规则越多越难维护，分支爆炸 | 用自然语言描述意图，逻辑由模型组织 |
| 确定性 | 高，同样的输入永远同样的输出 | 低，存在随机性（可通过温度等控制） |
| 失败模式 | 崩溃、异常 | "幻觉"、走错方向，但通常能给出某个结果 |
| 适合场景 | 规则清晰、要求 100% 准确 | 开放、模糊、需要灵活判断的任务 |

举一个具体例子。假设要做"根据用户描述自动分类工单"的功能：

- **传统做法**：维护一张关键词表，"退款"归售后、"bug"归技术……新词一来就漏分，得不停加规则。
- **Agent 做法**：把工单内容丢给 LLM，让它理解语义后分类，天然能处理"我充了会员但没生效"这种没见过的表达。

### 三、Agent 三要素：LLM 大脑 + 工具 + 记忆

一个完整的 Agent 由三个核心要素组成，缺一不可：

**1. LLM（大脑）**
负责理解、推理、决策。它是 Agent 的"思考器官"，决定了 Agent 能力的上限。常见选择有 GPT-4o、Claude 3.5、Gemini、以及 Qwen、DeepSeek 等开源模型。

**2. 工具（Tools）**
LLM 本身是"封闭"的——它只能基于训练数据回答问题，不能联网、不能执行代码、不能访问数据库。工具就是 Agent 的"手脚"，让模型能对外部世界产生影响。典型工具有：
- 搜索引擎（联网获取实时信息）
- 代码解释器（执行 Python、做计算）
- 数据库查询（读取业务数据）
- 外部 API（发邮件、创建任务、操作系统）

**3. 记忆（Memory）**
LLM 是"无状态"的，每次调用都像失忆。记忆机制让 Agent 能记住历史对话和中间结果。记忆分两种：
- **短期记忆**：当前这一次对话的上下文历史。
- **长期记忆**：跨会话存储，通常用向量数据库保存，按相关性检索。

\`\`\`text
        ┌──────────────────────────────────┐
        │            LLM 大脑               │
        │   (理解 / 推理 / 决策 / 生成)      │
        └──────────────────────────────────┘
              ▲                    │
   记忆召回   │                    │  决策:调用哪个工具
              │                    ▼
        ┌─────────┐          ┌──────────────┐
        │  记忆    │◀─────────│   工具调用     │──▶ 外部世界
        │(短期/长期)│  结果回写 │  (搜索/代码/API)│
        └─────────┘          └──────────────┘
\`\`\`

### 四、Agent 的应用场景

Agent 不是"万能的"，它特别适合那些**任务明确但路径不固定**的场景：

- **智能客服**：理解用户问题，查知识库，调工单系统，必要时转人工。
- **编程助手**：读懂需求→写代码→跑测试→修 bug→提 PR，整个流程自主完成（如 Trae、Cursor）。
- **研究助手**：给定一个课题，自动联网搜索、阅读论文、整理综述。
- **办公自动化**：解析邮件→提取关键信息→填表→发通知。
- **数据分析 Agent**：用自然语言提问，Agent 自动写 SQL、画图、给结论。

共同特征是：**输入模糊、步骤多、需要边做边判断**。如果你的任务是一条 SQL 就能搞定的，那不需要 Agent，直接查就行。

### 五、Agent 与 Chatbot 的区别：主动行动 vs 单轮对话

这是最容易混淆的一点。两者的对比：

| 维度 | Chatbot（聊天机器人） | Agent（智能体） |
| --- | --- | --- |
| 核心动作 | 回答问题 | 完成任务 |
| 主动性 | 被动响应，问一句答一句 | 主动规划、多步执行、自我纠错 |
| 接触外部 | 封闭，不调用工具 | 开放，可调任意工具 |
| 终止条件 | 用户关闭对话 | 任务完成 |
| 例子 | 早期的 Siri、FAQ 机器人 | AutoGPT、Trae Agent、客服 Agent |

一句话总结：**Chatbot 告诉你"答案"，Agent 替你"把事做完"**。

### 六、历史演进：从专家系统到 LLM Agent

Agent 这个概念并不新，它经历了漫长的演进：

1. **1950s-1980s 专家系统时代**：用人工编写的规则模拟专家推理（如 MYCIN 诊断细菌感染）。问题是规则写不完，遇到没覆盖的情况就傻眼。
2. **1990s-2010s 机器学习时代**：让模型从数据中学习模式（SVM、决策树、早期神经网络）。能力局限于特定任务（图像分类、文本分类），无法做开放推理。
3. **2017-2022 预训练模型时代**：Transformer 提出，BERT、GPT 出现，模型开始具备通用语言理解能力，但仍是"单点任务"。
4. **2023 至今 LLM Agent 时代**：大模型 + 工具调用 + 记忆，第一次让"自主完成复杂任务"成为可能。Function Calling、Computer Use 等技术成熟，Agent 真正可用。

\`\`\`python
# 一个最小化的 Agent 循环伪代码，帮你建立直观感受
# 真实框架（LangChain 等）封装得更复杂，但核心就是这个循环

def agent_loop(user_goal, llm, tools, memory, max_steps=10):
    """Agent 主循环：感知-决策-行动-观察，直到任务完成"""
    messages = [{"role": "user", "content": user_goal}]

    for step in range(max_steps):
        # 1. 决策：让 LLM 大脑决定下一步做什么
        decision = llm.decide(messages, tools=tools, memory=memory)

        # 2. 判断是否已完成任务
        if decision.is_final:
            return decision.answer  # 任务完成，返回最终结果

        # 3. 行动：调用 LLM 选中的工具
        tool_result = tools[decision.tool_name].run(decision.tool_input)

        # 4. 观察并记忆：把工具结果存入记忆，供下一轮决策
        memory.append({"role": "tool", "content": tool_result})
        messages.append({"role": "assistant", "content": f"调用了 {decision.tool_name}，结果是：{tool_result}"})

    return "达到最大步数，任务未完成"
\`\`\`

这段伪代码揭示了 Agent 的本质——一个**有目标的循环**。理解了这个循环，后面学任何框架都是在学"如何把这个循环做得更稳、更快、更可控"。

### 七、本章小结与易错点

| 易错点 | 说明 | 正确理解 |
| --- | --- | --- |
| 把 Agent 当 Chatbot | 只让模型回答，不接工具 | Agent 的标志是"能动手做事" |
| 认为模型越强 Agent 越好 | 忽略工具和记忆设计 | 三要素缺一不可，工程决定下限 |
| 追求完全确定 | 给 Agent 套 if-else | Agent 的价值就在于处理不确定性 |
| 忽视目标定义 | Agent 不知道何时该停 | 必须给 Agent 明确的终止条件 |

> **核心结论**：Agent = 能感知、能决策、能行动、有目标的智能体，由 **LLM 大脑 + 工具 + 记忆** 三要素组成。它和传统程序的本质区别是"规则驱动"变为"模型驱动"。`,
  },
  {
    id: 'ai-llm-principle',
    group: 'AI 基础概念',
    icon: '🧠',
    title: 'LLM 大语言模型原理',
    content: `## LLM 大语言模型原理

Agent 的"大脑"是 LLM。开发 Agent 不需要你从头训练模型，但你需要理解 LLM 的工作原理——因为只有懂它的能力从哪来、边界在哪，你才能知道什么时候该信任它、什么时候该给它加"护栏"。本章讲清楚 LLM 的本质、架构、训练流程和能力边界。

### 一、LLM 的本质：下一个 token 预测器

抛开所有玄学，LLM 做的事情极其简单：**根据已经看到的文本，预测下一个最可能出现的 token**。

给它"今天天气真"，它预测下一个 token 大概率是"好"；给它"1+1="，它预测"2"。就这么一遍遍重复，每次预测一个 token，拼起来就成了生成的文本。

\`\`\`text
输入: "今天天气真"  ──▶ LLM ──▶ 预测下一个 token: "好"
输入: "今天天气真好" ──▶ LLM ──▶ 预测下一个 token: "，"
输入: "今天天气真好，" ──▶ LLM ──▶ 预测: "适合" ... 不断重复
\`\`\`

这个看似简单的机制之所以能产生"智能"，是因为模型在海量文本上训练后，学会了语言背后的规律、知识、甚至推理模式。**所谓"涌现能力"，就是当模型足够大、训练数据足够多时，预测下一个 token 这件小事，量变引起质变，表现出推理、写作、写代码等复杂能力。**

### 二、Transformer 架构简介：自注意力机制

几乎所有现代 LLM 都基于 **Transformer** 架构（2017 年 Google 论文《Attention Is All You Need》提出）。它的核心创新是**自注意力机制（Self-Attention）**。

**自注意力解决什么问题？** 处理一句话时，每个词的含义依赖其他词。比如"苹果公司发布了新品"里的"苹果"指公司，而"我吃了一个苹果"里指水果。自注意力让模型在处理每个词时，能"看到"整句话，自动判断哪些词和当前词关系更密切。

\`\`\`text
"苹果 公司 发布 了 新品"
  │    │    │    │   │
  └────┴────┴────┴───┘  每个词都和其他所有词计算"注意力权重"
                       权重越高，表示关系越紧密
\`\`\`

Transformer 的优势：
- **并行计算**：不像 RNN 必须逐词处理，Transformer 一次处理整句话，训练快得多。
- **长距离依赖**：自注意力让相隔很远的词也能直接关联，不丢失信息。
- **可扩展**：模型越大、数据越多，效果越好，没有明显天花板（这也是 GPT 一路变大的原因）。

GPT 系列用的是 **Decoder-only Transformer**（只用解码器部分），专门做"从左到右预测下一个 token"，正好契合生成任务。

### 三、训练流程：预训练 → SFT → RLHF

一个 LLM 从无到有，要经过三个阶段，理解这三个阶段能解释很多模型行为：

**1. 预训练（Pre-training）**
用海量互联网文本（万亿级 token）训练，目标是"预测下一个 token"。这一步让模型学会语言和世界知识。**但预训练出来的模型只会"续写"**，你问它"北京的天气"，它可能续写成"北京的天气真好，适合出游"，而不是回答你的问题。

**2. 指令微调（SFT, Supervised Fine-Tuning）**
用"问题→高质量回答"的成对数据微调，让模型学会"按指令行事"。SFT 后的模型变成助手，会直接回答问题而不是瞎续写。

**3. 人类反馈强化学习（RLHF, Reinforcement Learning from Human Feedback）**
让人类给模型的多个回答打分，训练一个"奖励模型"，再用强化学习优化 LLM，让它倾向于生成人类喜欢的回答（有用、无害、诚实）。这一步决定了模型的"性格"和安全性。

\`\`\`text
互联网语料 ──预训练──▶ 会续写但不听话的基座模型
                              │
                              ├──SFT──▶ 会按指令回答的助手
                                          │
                                          ├──RLHF──▶ 有用、安全、对齐人类偏好的成品模型
\`\`\`

理解这三步，你就能明白：
- 为什么模型会"幻觉"——预训练知识有截止日期，且会编造没见过的内容。
- 为什么有时要加"你是一个 XX 专家"——SFT 阶段模型学会了响应角色设定。
- 为什么不同模型"性格"不同——RLHF 的偏好数据决定了它们各自的特点。

### 四、参数规模与能力涌现

模型的"参数量"（Parameters）是衡量模型规模的指标，类似大脑里神经元连接的数量。常见说法：

- **小模型（<10B）**：如 Llama 3 8B、Qwen 7B。能做基础问答，复杂推理较弱，可本地部署。
- **中等模型（10B-100B）**：如 Llama 3 70B。能力较强，是性价比之选。
- **大模型（>100B）**：如 GPT-4、Claude 3 Opus。能力最强，但只能 API 调用。

**涌现能力（Emergent Abilities）**：当模型规模超过某个阈值，某些能力会"突然出现"——小模型完全不会，大模型突然会了。比如多步数学推理、理解讽刺、遵循复杂格式指令。这也是为什么 Agent 一般要用大模型：很多 Agent 任务（多步推理、工具选择）需要的就是这些涌现能力。

### 五、为什么 LLM 适合做 Agent 大脑

LLM 具备做 Agent 大脑的三个关键能力：

1. **推理能力**：能拆解复杂任务，"要订机票→先查航班→再选座→最后支付"这种多步规划，LLM 能想出来。
2. **生成能力**：能生成自然语言回答、代码、结构化 JSON，灵活适配各种输出需求。
3. **指令遵循（Instruction Following）**：经过 SFT/RLHF 后，模型会按你的格式、约束行事，这是 Agent 能稳定调用工具的前提。

\`\`\`python
# 演示 LLM 作为"大脑"做一次简单决策
# 这里用伪代码展示思路，后续章节会换成真实 SDK 调用

def llm_decide(goal, available_tools, history):
    """让 LLM 决定下一步调用哪个工具"""
    prompt = f"""你是一个任务助手，目标：{goal}
    可用工具：{list(available_tools.keys())}
    历史记录：{history}
    请决定下一步：要么调用某个工具，要么给出最终答案。
    只输出 JSON：{{"action": "工具名或final", "input": "...", "answer": "..."}}"""
    # 调用 LLM 生成决策
    response = llm.chat(prompt)
    return parse_json(response)  # 解析成结构化决策
\`\`\`

### 六、模型能力边界：幻觉、上下文、时效性

LLM 不是万能的，它有明确的能力边界，做 Agent 时必须心里有数：

**1. 幻觉（Hallucination）**
模型会一本正经地编造不存在的事实。原因：它本质是在"预测最可能的 token"，而不是"查询数据库"。**对策**：关键事实用 RAG 检索真实数据，或用工具核实，不要全信模型。

**2. 上下文长度限制**
模型一次能"看"的文本有上限（见下章）。超出的内容它完全不知道。**对策**：合理管理上下文，用摘要、检索压缩历史。

**3. 时效性**
训练数据有截止日期，模型不知道之后发生的事。**对策**：需要实时信息时，给 Agent 配搜索工具。

**4. 数学与计算**
LLM 做复杂计算容易出错（它不是计算器）。**对策**：让 Agent 调用代码解释器算数学，而不是让模型心算。

**5. 指令遵循不稳定**
复杂格式要求模型可能不遵守。**对策**：用 Function Calling 或 JSON 模式强制结构化输出。

### 七、主流模型简介对比

| 模型 | 厂商 | 特点 | 适合场景 |
| --- | --- | --- | --- |
| GPT-4o / GPT-4o-mini | OpenAI | 综合能力强、多模态、生态成熟 | 通用 Agent、英文为主 |
| Claude 3.5 Sonnet | Anthropic | 长文本、逻辑推理强、风格稳 | 长文档处理、代码 Agent |
| Gemini 2.5 | Google | 超长上下文、多模态原生 | 超长上下文任务 |
| Llama 3 | Meta | 开源、可本地部署 | 私有化、成本敏感 |
| Qwen / DeepSeek | 阿里/深度求索 | 中文好、开源、性价比高 | 中文场景、本地部署 |

### 八、本章小结与易错点

| 易错点 | 说明 | 正确理解 |
| --- | --- | --- |
| 以为 LLM 在"查数据库" | 把模型当知识库 | LLM 在预测 token，不是检索 |
| 完全相信模型输出 | 不核实关键事实 | 重要信息要用 RAG/工具核实 |
| 用小模型做复杂 Agent | 期待涌现能力 | 多步推理需要大模型 |
| 忽略训练数据截止 | 问模型最新新闻 | 实时信息配搜索工具 |
| 让模型心算复杂数学 | 直接问"1234×5678" | 让 Agent 调用代码计算 |

> **核心结论**：LLM 本质是"下一个 token 预测器"，经预训练→SFT→RLHF 三步成为可用助手。它有推理、生成、指令遵循三大能力，但也存在幻觉、上下文限制、时效性等边界。做 Agent 的核心工程工作，就是在发挥模型能力的同时，用工具和流程弥补它的边界。`,
  },
  {
    id: 'ai-token-context',
    group: 'AI 基础概念',
    icon: '📊',
    title: 'Token 与上下文窗口',
    content: `## Token 与上下文窗口

开发 LLM 应用绕不开两个概念：**token** 和**上下文窗口**。它们直接决定了"模型能看多少、要花多少钱、能记多久"。理解 token 是算成本、管上下文、调 API 的前提。本章把这两个概念讲透。

### 一、Token 是什么：文本的切片单位

**Token 是 LLM 处理文本的最小单位**，可以理解为"模型眼中的一个词"。但 token 不等于一个字或一个词，它介于字符和词之间，是模型把文本切成的"碎片"。

经验估算（英文）：
- **1 个 token ≈ 4 个英文字符**（约 3/4 个英文单词）
- "hello world" 约 2 个 token

经验估算（中文）：
- **1 个中文字 ≈ 1-2 个 token**（中文比英文"费 token"）
- "你好世界" 约 4-6 个 token

为什么用 token 不用字符？因为模型是按 token 训练的：训练前会把语料用分词器切成 token，模型只认识这些 token。常见分词器如 OpenAI 的 tiktoken、Anthropic 的分词器。

\`\`\`python
# 用 tiktoken 库数 token（OpenAI 模型）
# 安装: pip install tiktoken
import tiktoken

# 选择编码方式（gpt-4o 用 o200k_base）
enc = tiktoken.encoding_for_model("gpt-4o")

text_zh = "你好，世界"          # 中文
text_en = "Hello, world"        # 英文

tokens_zh = enc.encode(text_zh)
tokens_en = enc.encode(text_en)

print(f"中文 '{text_zh}' 的 token 数: {len(tokens_zh)}")  # 中文通常更费 token
print(f"英文 '{text_en}' 的 token 数: {len(tokens_en)}")
print(f"中文 token 列表: {tokens_zh}")
\`\`\`

运行后你会发现：同样含义，中文比英文费更多 token。这就是为什么做中文应用时，**压缩 prompt、精简输出**对成本影响更明显。

### 二、Token 计费原理：按量付费

几乎所有 LLM API 都按 token 计费，分两部分：

- **输入 token（prompt_tokens）**：你发给模型的内容，包括 system prompt、历史对话、用户输入。
- **输出 token（completion_tokens）**：模型生成的内容。

\`\`\`text
费用 = 输入 token 数 × 输入单价 + 输出 token 数 × 输出单价
\`\`\`

输出单价通常比输入贵 3-5 倍（因为生成比理解更耗算力）。以 GPT-4o 为例（参考价）：
- 输入约 \$2.5 / 百万 token
- 输出约 \$10 / 百万 token

**为什么做 Agent 要特别关注 token？** 因为 Agent 一轮对话可能要带大量历史 + 工具结果，token 消耗远超普通问答。一个跑 10 轮的 Agent，每轮带 5k token 历史，光输入就是 50k token。成本会快速累积，必须精打细算。

### 三、上下文窗口：模型能处理的最大 token 数

**上下文窗口（Context Window）** 是模型一次能处理的 token 上限，包括输入 + 输出。超出窗口的内容模型"看不见"。

\`\`\`text
┌──────────────── 上下文窗口（比如 128k token）────────────────┐
│  system prompt + 历史对话 + 工具结果 + 当前输入 + 模型输出    │
│                                                              │
│   ←───────────── 必须全部塞进这个窗口 ─────────────→         │
└──────────────────────────────────────────────────────────────┘
\`\`\`

常见模型上下文大小对比：

| 模型 | 上下文窗口 | 约等于 |
| --- | --- | --- |
| GPT-4o | 128k | 约 9 万字中文 / 一本中篇小说 |
| GPT-4o-mini | 128k | 同上 |
| Claude 3.5 Sonnet | 200k | 约 15 万字中文 |
| Gemini 2.5 Pro | 1M+ | 约 70 万字中文 / 多本书 |

**注意**：上下文窗口 ≠ 免费额度。窗口越大，能塞越多，但也意味着每次调用可能花越多钱（按 token 计费）。"能用"不等于"用得起"。

### 四、长上下文的挑战：注意力衰减与成本

窗口大不代表效果一样好，长上下文有两个挑战：

**1. 注意力衰减（Lost in the Middle）**
研究发现，模型对上下文**开头和结尾**记得清楚，**中间部分容易"失忆"**。即使有 128k 窗口，把关键信息放在中间也可能被忽略。

\`\`\`text
记忆强度:  ████████░░░░░░░░████████
           开头记得牢    中间模糊    结尾也记得
\`\`\`

**对策**：把最重要的指令放 system prompt（开头），最相关的信息放最后（靠近模型要生成的位置）。

**2. 成本与延迟**
塞满 128k token 一次调用要花不少钱，而且生成更慢。**对策**：只放真正相关的信息，不要"反正窗口大就全塞进去"。

### 五、上下文管理策略：截断、摘要、RAG

当对话历史超出窗口时，必须管理上下文，常见四种策略：

**策略 1：全量历史（简单但贵）**
把所有历史原样发给模型。适合对话短、预算足的场景。

**策略 2：滑动窗口（保留最近 N 轮）**
只保留最近 N 轮对话，老的丢弃。简单高效，但会丢失早期重要信息。

**策略 3：摘要压缩**
把旧对话摘要成一段话，再带上最近几轮原文。兼顾记忆和成本。

**策略 4：RAG 检索**
把历史存进向量库，每次只检索和当前问题相关的片段。适合长期记忆。

\`\`\`python
# 策略2：滑动窗口示例
def build_messages(history, current_input, max_rounds=5):
    """只保留最近 max_rounds 轮历史，控制上下文长度"""
    # 截取最近的对话
    recent = history[-(max_rounds * 2):]  # 每轮一问一答，乘2
    messages = [{"role": "system", "content": "你是一个助手"}]
    messages.extend(recent)
    messages.append({"role": "user", "content": current_input})
    return messages
\`\`\`

### 六、token 计数管理：用 tiktoken

做 Agent 必须实时知道当前用了多少 token，避免超限报错。

\`\`\`python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o")

def count_tokens(messages, model="gpt-4o"):
    """计算一组消息的总 token 数（含角色开销）"""
    # 不同模型每条消息的额外开销不同，gpt-4o 约每条消息 +3 token
    total = 3  # 起始开销
    for msg in messages:
        total += 3  # 每条消息的固定开销
        total += len(enc.encode(msg["content"]))
        total += len(enc.encode(msg["role"]))
    total += 3  # 结尾开销
    return total

# 实战：发请求前先检查会不会超限
def safe_chat(messages, max_tokens=4096, context_limit=128000):
    """发请求前检查 token 是否超限"""
    input_tokens = count_tokens(messages)
    if input_tokens + max_tokens > context_limit:
        # 超限了，需要压缩历史
        raise ValueError(f"上下文超限：{input_tokens}+{max_tokens}>{context_limit}")
    # ... 正常调用 API
\`\`\`

### 七、本章小结与易错点

| 易错点 | 说明 | 正确做法 |
| --- | --- | --- |
| 中文按字符算成本 | 低估中文 token 消耗 | 中文 1 字 ≈ 1-2 token，比英文贵 |
| 以为窗口大就能全塞 | 忽略中间失忆与成本 | 关键信息放头尾，只放相关内容 |
| 不做 token 计数 | 请求超限报错才后悔 | 发请求前用 tiktoken 预检 |
| 全量历史不管控 | 成本爆炸、上下文超限 | 用滑动窗口/摘要/RAG 管理 |
| 把窗口当免费额度 | 塞满 128k 觉得"赚了" | 按 token 付费，塞越多越贵 |

> **核心结论**：token 是模型处理文本的最小单位，按 token 计费；上下文窗口是模型一次能处理的上限。窗口大不等于效果好（注意力衰减）也不等于免费（按量计费）。做好 Agent 的关键工程能力之一，就是**在有限窗口里塞进最相关的信息**。`,
  },
  {
    id: 'ai-dev-env',
    group: 'AI 基础概念',
    icon: '🛠️',
    title: 'AI 开发环境搭建',
    content: `## AI 开发环境搭建

工欲善其事，必先利其器。在写 Agent 代码之前，需要把开发环境搭好。本章用最务实的方式带你完成 Python 环境、SDK 安装、API Key 管理、项目结构搭建。搭建原则：**隔离、安全、可复现**。

### 一、Python 环境：用虚拟环境隔离

LLM 开发主流语言是 Python（生态最全）。推荐 Python 3.10+，原因：3.10 引入的结构化模式匹配、3.11 的性能提升对开发体验有帮助；很多新库只支持 3.9+。

**为什么要用虚拟环境（venv）？** 不同项目依赖不同版本的库，装在全局会冲突。虚拟环境给每个项目一个独立的"小房间"，互不干扰。

\`\`\`bash
# 检查 Python 版本（建议 3.10+）
python3 --version

# 在项目目录创建虚拟环境（名为 .venv）
python3 -m venv .venv

# 激活虚拟环境
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
# .venv\\Scripts\\Activate.ps1

# 激活后命令行前面会出现 (.venv) 标记
# 之后所有 pip install 都只装进这个虚拟环境，不影响全局

# 退出虚拟环境（用完再退）
deactivate
\`\`\`

**最佳实践**：把依赖列表存成 requirements.txt，别人或未来的你能一键复现环境。

\`\`\`bash
# 导出当前依赖
pip freeze > requirements.txt

# 在新环境一键安装
pip install -r requirements.txt
\`\`\`

### 二、安装核心 SDK：openai 与 anthropic

开发 Agent 最常用的两个 SDK：

\`\`\`bash
# 先激活虚拟环境
source .venv/bin/activate

# OpenAI 官方 SDK（调用 GPT 系列）
pip install openai

# Anthropic 官方 SDK（调用 Claude 系列）
pip install anthropic

# 安装后会带上版本号，建议固定版本避免 API 变动
# pip install "openai>=1.0" "anthropic>=0.20"
\`\`\`

验证安装：

\`\`\`python
# 验证 SDK 能正常导入
import openai
import anthropic

print(f"openai 版本: {openai.__version__}")
print(f"anthropic 版本: {anthropic.__version__}")
\`\`\`

### 三、安装常用库：langchain / llama-index / 向量库

随着项目复杂度提升，你会用到这些库：

\`\`\`bash
# LangChain：编排 LLM + 工具 + 记忆的框架，最流行
pip install langchain langchain-openai langchain-community

# LlamaIndex：专注 RAG（检索增强生成）的框架
pip install llama-index

# 向量数据库（存记忆/做 RAG）
pip install chromadb   # 轻量本地向量库，适合开发
pip install faiss-cpu  # Facebook 出品，高性能相似度检索

# tiktoken：OpenAI 的 token 计数工具
pip install tiktoken

# python-dotenv：管理 .env 环境变量
pip install python-dotenv
\`\`\`

| 库 | 作用 | 何时用 |
| --- | --- | --- |
| openai / anthropic | 调用 LLM API | 任何时候都要 |
| langchain | 编排 Agent 工作流 | Agent 逻辑复杂时 |
| llama-index | RAG 检索增强 | 做知识库问答时 |
| chromadb / faiss | 向量存储与检索 | 存长期记忆/做 RAG |
| tiktoken | 数 token | 算成本、防超限 |
| python-dotenv | 读 .env | 管理密钥 |

### 四、API Key 管理：绝不硬编码

**最重要的一条安全规则**：API Key 绝对不能写在代码里！一旦提交到 Git，密钥就泄露了，会被人盗刷余额。正确做法是用环境变量。

**步骤 1：在 .env 文件存密钥**

\`\`\`bash
# 在项目根目录创建 .env 文件（注意：这个文件绝不能提交到 Git！）
# .env 内容如下：
# OPENAI_API_KEY=sk-你的真实key
# ANTHROPIC_API_KEY=sk-ant-你的真实key
\`\`\`

**步骤 2：在 .gitignore 里忽略 .env**

\`\`\`bash
# .gitignore 文件必须包含这行，防止密钥被提交
.env
.venv/
__pycache__/
\`\`\`

**步骤 3：代码里用 python-dotenv 读取**

\`\`\`python
# config.py —— 统一管理配置
import os
from dotenv import load_dotenv

# 加载 .env 文件里的环境变量
load_dotenv()

# 读取密钥（代码里不出现真实 key）
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# 启动时检查密钥是否配置
if not OPENAI_API_KEY:
    raise RuntimeError("请在 .env 中配置 OPENAI_API_KEY")
\`\`\`

**步骤 4：用代码时通过环境变量初始化 SDK**

\`\`\`python
from openai import OpenAI
import os

# SDK 会自动读取环境变量 OPENAI_API_KEY
# 也可以显式传入：client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client = OpenAI()

# 现在可以安全地调用，密钥不会出现在任何业务代码里
\`\`\`

### 五、Jupyter Notebook：适合实验探索

写 Agent 时，很大一部分工作是"试 prompt、看效果、调参数"。这种探索性工作用 **Jupyter Notebook** 特别合适——可以一段段跑代码，立即看输出，不用每次重跑整个脚本。

\`\`\`bash
# 安装 Jupyter
pip install jupyter

# 启动（会打开浏览器）
jupyter notebook
\`\`\`

**使用建议**：
- 实验性、调试 prompt → 用 Notebook。
- 正式 Agent 服务、要部署 → 用 .py 脚本/框架。
- Notebook 里也用虚拟环境的内核，保持依赖一致。

### 六、编辑器：VSCode + Python 插件

推荐 VSCode，原因：免费、插件丰富、对 Python 和 Jupyter 支持好。

必装插件：
- **Python**（Microsoft）：语法、调试、IntelliSense。
- **Jupyter**：在 VSCode 里直接跑 Notebook。
- **Pylance**：类型检查、智能提示。
- **autoDocstring**：快速生成函数文档。

### 七、项目结构建议

一个规范的 AI 项目结构如下：

\`\`\`text
my-agent-project/
├── .env                  # 密钥（不提交 Git）
├── .gitignore            # 忽略 .env 等
├── requirements.txt      # 依赖列表
├── README.md             # 项目说明
├── config.py             # 配置加载（读 .env）
├── agents/               # Agent 逻辑
│   ├── __init__.py
│   └── customer_service.py
├── tools/                # 工具定义
│   ├── __init__.py
│   └── search.py
├── prompts/              # Prompt 模板
│   └── system_prompt.txt
├── memory/               # 记忆模块
│   └── store.py
├── notebooks/            # 实验用 Notebook
│   └── explore.ipynb
└── tests/                # 测试
    └── test_agent.py
\`\`\`

**组织原则**：把 prompt、工具、Agent 逻辑、记忆分开存放，方便复用和替换。比如换一个 LLM，只改 config.py；换一个工具实现，只改 tools/ 下的文件。

### 八、第一个验证脚本

环境搭好后，跑一个最小脚本确认一切正常（这里用 OpenAI，需要先配好 key）：

\`\`\`python
# hello_ai.py —— 验证开发环境是否就绪
import os
from dotenv import load_dotenv
from openai import OpenAI

# 1. 加载环境变量（从 .env 读取密钥）
load_dotenv()

# 2. 初始化客户端（自动用环境变量里的 key）
client = OpenAI()

# 3. 发一个最简单的请求
response = client.chat.completions.create(
    model="gpt-4o-mini",  # 便宜的小模型，适合验证
    messages=[
        {"role": "user", "content": "用一句话介绍 AI Agent"}
    ]
)

# 4. 打印结果
print("模型回答：", response.choices[0].message.content)
print("消耗 token：", response.usage.total_tokens)
\`\`\`

如果能看到模型回答和 token 统计，说明环境完全就绪，可以开始正式开发 Agent 了。

### 九、本章小结与易错点

| 易错点 | 说明 | 正确做法 |
| --- | --- | --- |
| 密钥硬编码在代码里 | 提交 Git 后泄露被盗刷 | 用 .env + 环境变量 |
| 不用虚拟环境 | 全局依赖冲突、无法复现 | 每个项目用 venv 隔离 |
| 不写 .gitignore | .env 被误提交 | 第一件事就加 .env 到 .gitignore |
| 不固定依赖版本 | 库升级导致代码失效 | 用 requirements.txt 固定版本 |
| 全用脚本调试 prompt | 改一次重跑一次 | 用 Notebook 快速迭代 |

> **核心结论**：开发环境三件套——**venv 隔离依赖、.env 管密钥、requirements.txt 锁版本**。把这套规范养成习惯，后续所有 Agent 项目都能快速、安全地启动。`,
  },
];
