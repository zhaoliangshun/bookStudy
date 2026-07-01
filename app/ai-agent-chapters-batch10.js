// =============================================================
// AI Agent开发实战 - 第十批章节（第十部分 Agent 基础，共 4 章）
// 章节 37-40：Agent 概念与架构 / ReAct 模式 / 手写 Agent / Agent 循环
// =============================================================

export const chapters = [
  // =============================================================
  // 第三十七章：Agent 概念与架构
  // =============================================================
  {
    id: 'agent-concept',
    group: 'Agent 基础',
    icon: '🤖',
    title: 'Agent 概念与架构',
    content: `## 第三十七章　Agent 概念与架构

> "Agent 不是更聪明的 Chatbot,而是会自己干活的程序。"
> 本章从概念、对比、架构三个角度讲清楚 Agent 到底是什么。

### 37.1 Agent 的定义

**Agent**(智能体)的定义有很多版本,本书采用一个偏工程化的定义:

> Agent 是一个能够**感知环境、自主决策、执行行动、达成目标**的 AI 系统。它不被动等待人类指挥每一步,而是给定目标后,自己规划路径、调用工具、循环迭代直到任务完成。

拆解这个定义的四个关键词:

- **感知**:从环境(用户输入、文件系统、网络、API)获取信息
- **决策**:基于当前状态和目标,选择下一步该做什么
- **行动**:执行具体操作(调 API、写文件、发邮件)
- **目标**:Agent 不是漫无目的的循环,而是为了完成某个任务

\`\`\`text
传统 Chatbot:用户问一句 → 模型答一句 → 等待下一句
Agent:用户给一个目标 → Agent 自主循环(想→做→看) → 直到完成 → 返回结果

差异核心:Agent 有"自主性"和"循环性"
\`\`\`

### 37.2 Agent vs Chatbot

这是最常见的混淆。下面这张对照表把两者彻底分开:

| 维度 | Chatbot | Agent |
|------|---------|-------|
| 交互模式 | 单轮或固定多轮 | 自主循环,步数不定 |
| 决策方式 | 用户每步指令 | Agent 自主决定下一步 |
| 行动能力 | 只输出文字 | 调用工具/API/读写文件 |
| 状态管理 | 通常无状态 | 有记忆和中间状态 |
| 终止条件 | 用户结束对话 | 任务完成或步数耗尽 |
| 失败处理 | 用户重新提问 | 可自我修正、重试 |
| 典型例子 | 客服问答、闲聊 | 自动写代码、自动订机票 |

**举个对比例子**:用户说"帮我把 last_week.csv 里的销售额按地区汇总,生成图表,发到群里"

- Chatbot 回答:"你可以用 pandas 这样写..."(给一段文字教程)
- Agent 行为:读取文件 → 写代码聚合数据 → 生成图表 → 调用 API 发到群里 → 回复"已完成"

### 37.3 Agent vs Workflow

Workflow(工作流)也是热门概念,容易和 Agent 混淆。

\`\`\`text
Workflow: 固定流程 → 节点 A → 节点 B → 节点 C → 结束
Agent:    动态决策 → 看情况走 A / B / C,中途可以回头、跳步、终止
\`\`

| 维度 | Workflow | Agent |
|------|---------|-------|
| 流程 | 预定义、固定 | 动态、按需决定 |
| 决策点 | 节点处的条件分支 | 每一步都可以决策 |
| 可预测性 | 高(知道会走哪条路) | 低(取决于 LLM 当前判断) |
| 调试难度 | 容易(流程图清晰) | 难(每次执行路径不同) |
| 适用场景 | 流程明确、规则清晰 | 流程不确定、需要灵活决策 |
| 典型例子 | ETL 数据处理、审批流 | 调研、写作、复杂客服 |

**关系不是互斥**:生产系统常常是"Workflow 套 Agent"——主体流程用 Workflow 编排,关键决策点交给 Agent。比如客服系统的整体流程是 Workflow(进线 → 路由 → 解决 → 评价),但解决环节可能用 Agent(自主查文档、改订单、退款)。

### 37.4 Agent 三要素

业界公认 Agent 由三个核心要素构成,缺一不可。

#### 37.4.1 LLM 大脑

LLM 是 Agent 的"决策引擎"。它负责:
- 理解用户意图
- 规划任务步骤
- 选择调用哪个工具
- 解析工具返回结果
- 决定何时终止

\`\`\`python
# Agent 的"大脑"就是一个 LLM 调用
from openai import OpenAI
client = OpenAI()

def agent_brain(messages):
    """LLM 大脑:接收对话历史,返回下一步决策"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=[...],  # 可用工具列表
    )
    return response.choices[0].message
\`\`\`

**关键认知**:Agent 的能力上限由 LLM 决定。LLM 太弱,Agent 就成了"摆设"——它会瞎调工具、忘事、走死循环。这也是 Agent 在 GPT-3 时代没起来、GPT-4 时代爆发的根本原因。

#### 37.4.2 工具(Tools)

工具是 Agent 影响"外部世界"的接口。没有工具的 Agent 就是个嘴上谈兵的 Chatbot。

\`\`\`python
# 几个常见工具的例子
def search_web(query):
    """联网搜索工具"""
    # 调用搜索 API
    return search_api.search(query)

def read_file(path):
    """读文件工具"""
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    """写文件工具"""
    with open(path, 'w') as f:
        f.write(content)
    return f"已写入 {path}"

def send_email(to, subject, body):
    """发邮件工具"""
    # 调用邮件 API
    return mail_api.send(to, subject, body)

# Agent 拥有的工具列表
tools = [search_web, read_file, write_file, send_email]
\`\`\`

**工具设计的两个原则:**
- 描述要清晰:LLM 通过描述选择工具,描述不清就会乱调
- 副作用要可控:写文件、发邮件等危险操作要有确认机制

#### 37.4.3 记忆(Memory)

记忆让 Agent 在多步执行中保持上下文,否则它每一步都"失忆"。

\`\`\`python
# 简单的记忆实现
class AgentMemory:
    def __init__(self):
        self.messages = []  # 对话历史
        self.intermediate_results = {}  # 中间结果
    
    def add_message(self, role, content):
        """添加对话消息"""
        self.messages.append({"role": role, "content": content})
    
    def add_result(self, key, value):
        """记录中间结果"""
        self.intermediate_results[key] = value
    
    def get_context(self):
        """获取当前上下文"""
        return self.messages
\`\`\`

**记忆的层次:**
- **短期记忆**:当前任务的对话历史,任务结束即清空
- **长期记忆**:跨任务保留,通常用向量库存(参见 RAG 章节)
- **工作记忆**:当前正在处理的中间结果(类似人类"工作记忆")

### 37.5 Agent 闭环:Observe → Think → Act

Agent 的核心运行模式是一个循环,业界俗称 OTA 或 OAT 循环。

\`\`\`text
循环开始
  ↓
Observe(观察):感知当前状态、读取工具返回结果
  ↓
Think(思考):LLM 基于状态和历史,决定下一步做什么
  ↓
Act(行动):调用工具或返回最终答案
  ↓
回到循环开始(如果未完成)
\`\`\`

\`\`\`python
# Agent 闭环的伪代码
def agent_loop(goal):
    """Agent 主循环"""
    state = {"goal": goal, "history": [], "results": {}}
    while True:
        # 1. Observe:观察当前状态
        observation = observe(state)
        
        # 2. Think:LLM 决策下一步
        action = think(state, observation)
        
        # 3. Act:执行行动
        if action.type == "final_answer":
            return action.content  # 任务完成,返回最终答案
        result = act(action)
        
        # 4. 更新状态
        state["history"].append({"action": action, "result": result})
\`\`\`

### 37.6 Agent 的终止条件

Agent 不能无限循环,必须有明确的终止条件:

1. **任务完成**:LLM 判断目标已达成,返回最终答案
2. **最大步数**:超过 max_iterations(如 10 步)强制终止
3. **用户中断**:用户主动取消
4. **错误超限**:连续错误超过阈值,避免死循环
5. **超时**:总执行时间超过限制
6. **资源耗尽**:token 用完、API 额度用完

\`\`\`python
def should_terminate(state, max_steps=10, max_errors=3):
    """判断 Agent 是否该终止"""
    if state.get("task_done"):
        return "任务完成"
    if len(state["history"]) >= max_steps:
        return "达到最大步数"
    if state.get("consecutive_errors", 0) >= max_errors:
        return "连续错误超限"
    return None  # 继续
\`\`\`

### 37.7 Agent 应用场景

什么场景适合用 Agent?核心判据是"**任务需要灵活决策**"。

| 场景 | 适合 Agent | 原因 |
|------|-----------|------|
| 自动写代码 | ★★★★★ | 需要查文档、写代码、运行、改 bug 循环 |
| 自动调研 | ★★★★★ | 需要搜索、汇总、判断信息是否足够 |
| 客服解决复杂工单 | ★★★★ | 需要查订单、改状态、走退款流程 |
| 自动订机票 | ★★★★ | 需要查航班、比价、预订,流程有变数 |
| 数据分析报告 | ★★★★ | 需要读数据、画图、写分析 |
| 简单 FAQ 问答 | ★ | 固定问答,Agent 是杀鸡用牛刀 |
| 翻译 | ★ | 流程固定,Workflow 更合适 |
| 文本分类 | ★ | 单步任务,直接调用 LLM 即可 |

### 37.8 为什么 2024 年 Agent 爆发

Agent 概念并不新,上世纪 80 年代就有 symbolic AI agent。但 2024 年成为"Agent 元年",几个关键条件同时成熟:

1. **LLM 能力够了**:GPT-4、Claude 3.5 等模型的工具调用、推理能力达到实用水平
2. **Function Calling 标准化**:OpenAI 推出 Function Calling,LLM 调用工具从"prompt 黑魔法"变成"标准接口"
3. **框架成熟**:LangChain、LangGraph、AutoGen、CrewAI 等框架大幅降低开发门槛
4. **算力便宜**:LLM API 价格大幅下降,Agent 一次任务几美分成为可能
5. **生态完善**:各类 MCP、API、工具市场让 Agent 有"手脚"可用
6. **用户教育**:ChatGPT 让用户接受了"和 AI 对话"的交互范式

**历史对照:**

| 时期 | Agent 形态 | 失败原因 |
|------|-----------|---------|
| 1980s | 专家系统 | 规则维护成本爆炸 |
| 2000s | 规划算法 | 环境假设太理想 |
| 2015 | 强化学习 Agent | 状态空间受限,难迁移 |
| 2023 | LLM Agent(早期) | LLM 太弱,经常走死循环 |
| 2024+ | LLM Agent(成熟) | LLM 能力够,框架成熟 |

### 37.9 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 把 Chatbot 当 Agent | 只会聊天,不会执行任务 | 必须有工具调用能力 |
| 把 Workflow 当 Agent | 固定流程,无决策灵活度 | 关键节点让 LLM 决策 |
| Agent 无终止条件 | 死循环、烧 token | 强制 max_iterations |
| 工具描述不清 | LLM 乱调工具、调错工具 | 描述要清晰、参数要明确 |
| Agent 无记忆 | 每步"失忆",重复劳动 | 用 messages 列表保历史 |
| 一步到位幻觉 | 期望 LLM 一次给最终答案 | Agent 价值在循环迭代 |
| 用弱模型做 Agent | 频繁走死循环、忘事 | Agent 至少用 GPT-4 级别模型 |

> **小结**:Agent = LLM 大脑 + 工具手脚 + 记忆系统,通过"观察→思考→行动"循环完成任务。它是 AI 应用从"问答"走向"做事"的关键跃迁。下一章讲 Agent 最经典的执行模式——ReAct。`,
  },

  // =============================================================
  // 第三十八章：ReAct 模式：推理+行动
  // =============================================================
  {
    id: 'react-pattern',
    group: 'Agent 基础',
    icon: '🔄',
    title: 'ReAct 模式：推理+行动',
    content: `## 第三十八章　ReAct 模式:推理+行动

> ReAct 是 Agent 最经典的执行模式,几乎所有早期 Agent 框架都基于它。本章讲透它的原理、prompt 设计和实战。

### 38.1 ReAct 是什么

**ReAct** = **Re**asoning + **Act**ing,即"推理"与"行动"交替进行。论文发表于 2022 年 10 月,作者 Yao 等人,是 Agent 领域被引用最多的工作之一。

核心思想一句话:**先想清楚下一步该做什么(Thought),再去做(Action),做完看结果(Observation),再决定下一步**。这种"先想再做"的循环,模拟人类解决陌生问题的过程。

\`\`\`text
传统 CoT 模式:
  一直想(Thought 1 → Thought 2 → ... → Answer)
  问题:模型只能基于训练知识,无法获取新信息

ReAct 模式:
  想 → 做 → 看结果 → 再想 → 再做 → 看结果 → ... → 答案
  优势:每步行动后能拿到新信息,推理基于真实环境
\`\`\`

### 38.2 为什么 ReAct 有效

#### 38.2.1 推理与行动的互补

纯推理(CoT)的局限:模型只能基于"已经知道的"知识推理,无法处理需要外部信息的问题。比如"今天北京的天气"——模型不知道"今天"是什么时候。

纯行动的局限:模型每次都"直接做",不反思,容易盲目尝试、走死路。

ReAct 把两者结合:**推理指导行动,行动反馈给推理**。

#### 38.2.2 行动后的反思

ReAct 的精髓在"行动后看结果"。模型执行一个行动后,会把 Observation 加入推理上下文,下一步思考基于真实结果,而不是凭空想象。

\`\`\`text
没有 Observation 的纯推理:
  Thought: "我觉得搜索 python 文件读取会返回 open() 函数"
  Answer: "用 open() 函数"
  问题:可能猜错,实际搜索结果可能是 pathlib

ReAct:
  Thought: "我需要搜索 python 文件读取的方法"
  Action: search("python 文件读取")
  Observation: "Python 中常用 open() 或 pathlib.Path.read_text()"
  Thought: "原来有 pathlib,我应该用更现代的 pathlib"
  ...
\`\`\`

### 38.3 Thought-Action-Observation 循环

ReAct 的执行单元是一个三段式循环:

\`\`\`text
Thought: <模型推理下一步该做什么>
Action: <执行某个工具,带参数>
Observation: <工具返回的结果>
↓
Thought: <基于上次结果,推理下一步>
Action: <执行新工具>
Observation: <新结果>
↓
... 重复 ...
↓
Thought: <我已有足够信息,可以给最终答案>
Final Answer: <最终答案>
\`\`\`

**ReAct 论文里的经典例子**(用户问 "Question: What is the elevation range of Colorado?"):

\`\`\`text
Thought 1: I need to search Colorado and find the elevation range.
Action 1: Search[Colorado]
Observation 1: Colorado is a state in the western US...
Thought 2: The article mentions elevation but not the range. I should look for more detail.
Action 2: Lookup[elevation]
Observation 2: The highest point is Mount Elbert at 4,401 m...
Thought 3: Elevation range is from the lowest to highest. I need the lowest point too.
Action 3: Lookup[lowest point]
Observation 3: The lowest point is the Arikaree River at 1,010 m...
Thought 4: I have both. The range is 1,010 m to 4,401 m.
Final Answer: The elevation range of Colorado is approximately 1,010 to 4,401 meters.
\`\`\`

### 38.4 ReAct 论文原理

ReAct 论文的核心贡献是证明了:**让 LLM 在生成 Action 之前先输出 Thought,显著提升任务完成率**。

论文做了对比实验:

| 方法 | 任务完成率 | 原因 |
|------|-----------|------|
| 直接回答(无工具) | 35% | 凭训练知识,常出错 |
| Act-only(只调工具,不推理) | 55% | 调对工具但用错参数 |
| CoT(只推理,不调工具) | 50% | 推理对但缺信息 |
| ReAct(推理+调工具) | 75% | 两者结合,效果最佳 |

**Thought 的三个作用:**
1. **分解问题**:把复杂任务拆成小步
2. **校准行动**:在调工具前想清楚要查什么、用什么参数
3. **整合观察**:每次 Observation 后反思,决定是否够用

### 38.5 ReAct Prompt 模板设计

ReAct 实战的核心是 prompt 模板。下面是一个标准模板:

\`\`\`python
REACT_PROMPT = """你是一个能调用工具解决问题的 Agent。

可用工具:
- search(query): 网络搜索
- lookup(keyword): 在当前搜索结果中查找关键词
- calculate(expression): 数学计算
- finish(answer): 给出最终答案并结束任务

解决每个问题时,严格遵循以下格式:

Question: 用户的问题
Thought 1: 你的推理,思考下一步该做什么
Action 1: 工具调用(格式: 工具名[参数])
Observation 1: 工具返回的结果
Thought 2: 基于上一步结果继续推理
Action 2: 工具调用
Observation 2: 结果
...
Thought N: 我已经有足够信息回答问题了
Final Answer: 最终答案

开始解决下面的问题:

Question: {question}
"""
\`\`\`

**模板设计要点:**
- 列出所有可用工具及其参数格式
- 明确规定输出格式(Thought/Action/Observation 三段式)
- 提供 few-shot 示例让模型学会格式
- 用 "Final Answer" 作为终止信号

### 38.6 ReAct vs CoT

CoT(Chain-of-Thought)是 ReAct 的"前辈",两者经常被拿来比较。

| 维度 | CoT | ReAct |
|------|-----|-------|
| 是否调工具 | 否 | 是 |
| 信息来源 | 仅训练知识 | 训练知识 + 实时观察 |
| 推理方式 | 单线推理 | 推理-行动-观察交替 |
| 适用场景 | 数学题、逻辑题 | 需要外部信息的问题 |
| 终止方式 | 一次性生成答案 | Final Answer 显式终止 |
| 错误纠正 | 不能(一步出错步步错) | 能(下次 Thought 可调整) |

**经验法则**:能用 CoT 解决的就用 CoT(更快、更便宜),需要外部信息或工具时才用 ReAct。

### 38.7 ReAct vs Function Calling

这是 2024 年最常被问的问题之一。答案很直接:**ReAct 是一种"模式",Function Calling 是一种"实现机制"**。

| 维度 | ReAct | Function Calling |
|------|-------|-----------------|
| 本质 | Agent 执行模式(prompt 设计) | LLM API 接口规范 |
| 实现方式 | prompt 工程 | 模型原生支持 |
| 输出格式 | 自由文本(Thought/Action) | 结构化 JSON |
| 解析难度 | 难(要正则解析文本) | 易(直接拿 JSON) |
| 历史地位 | 2022 年提出,早期 Agent 主流 | 2023+ 主流,逐步替代 ReAct 文本协议 |

\`\`\`text
ReAct 文本协议(LLM 输出一段文字,需要解析):
  Thought: 我要搜索
  Action: search["python"]

Function Calling 协议(LLM 输出结构化 JSON):
  {
    "thought": "我要搜索",
    "tool_calls": [{"name": "search", "arguments": {"query": "python"}}]
  }
\`\`\`

**今天的选择**:能用 Function Calling 就用 Function Calling(更稳、更便宜),只有在不支持 FC 的开源模型上才退回 ReAct 文本协议。

### 38.8 实战:手写 ReAct Prompt

下面是一个完整的 ReAct prompt 模板,可直接用于支持 ReAct 的 LLM:

\`\`\`python
from openai import OpenAI
import re

client = OpenAI()

# ReAct prompt 模板
REACT_TEMPLATE = """你是一个能调用工具的 Agent。

可用工具:
1. search(query: str) -> str
   描述: 在网上搜索并返回相关结果
2. calculator(expression: str) -> str
   描述: 计算数学表达式
3. lookup(keyword: str) -> str
   描述: 在上一次 search 结果中查找关键词
4. finish(final_answer: str) -> str
   描述: 提交最终答案并结束任务

每次响应必须严格遵循格式:
Thought: <你的推理>
Action: <工具名>[<参数>]
Observation: <工具返回结果>(由系统填入,你不用写)

当你认为已得到答案,使用 finish 工具:
Thought: 我已有足够信息
Action: finish[<最终答案>]

例子:
Question: 美国第 16 任总统是谁?
Thought: 我需要搜索美国第 16 任总统的信息
Action: search["美国第 16 任总统"]
Observation: 亚伯拉罕·林肯(Abraham Lincoln,1809-1865),美国第 16 任总统
Thought: 我找到了答案,可以提交了
Action: finish["美国第 16 任总统是亚伯拉罕·林肯"]

现在开始:
Question: {question}
Thought: """

# 工具实现
def search(query):
    """模拟搜索(实际接搜索 API)"""
    fake_db = {
        "Python": "Python 是一门解释型语言,常用 open() 读写文件",
        "OpenAI": "OpenAI 是一家 AI 公司,主要产品 GPT 系列",
    }
    for key, val in fake_db.items():
        if key.lower() in query.lower():
            return val
    return f"未找到与 '{query}' 相关的信息"

def calculator(expr):
    """计算器"""
    try:
        return str(eval(expr))
    except Exception as e:
        return f"计算失败: {e}"

def lookup(keyword):
    """在最近搜索结果中查找"""
    return f"在最近结果中查找 '{keyword}'..."

def parse_action(text):
    """解析 LLM 输出的 Action 行"""
    match = re.search(r'Action:\\s*(\\w+)\\[(.+?)\\]', text)
    if not match:
        return None
    tool_name = match.group(1)
    args_str = match.group(2)
    return tool_name, args_str

# ReAct 执行循环
def run_react(question, max_steps=5):
    """运行 ReAct 循环"""
    prompt = REACT_TEMPLATE.format(question=question)
    messages = [{"role": "user", "content": prompt}]
    
    for step in range(max_steps):
        # 1. LLM 思考并输出 Action
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0,
        )
        llm_output = response.choices[0].message.content
        print(f"\\n--- Step {step+1} ---")
        print(llm_output)
        
        # 2. 解析 Action
        action = parse_action(llm_output)
        if not action:
            messages.append({"role": "assistant", "content": llm_output})
            messages.append({"role": "user", "content": "格式错误,请按格式输出 Action: <tool>[<args>]"})
            continue
        
        tool_name, args = action
        
        # 3. 终止判断
        if tool_name == "finish":
            print(f"\\n✓ 任务完成: {args}")
            return args
        
        # 4. 执行工具
        tools = {"search": search, "calculator": calculator, "lookup": lookup}
        if tool_name not in tools:
            observation = f"工具 {tool_name} 不存在"
        else:
            observation = tools[tool_name](args)
        print(f"Observation: {observation}")
        
        # 5. 把 LLM 输出 + Observation 加回 messages
        messages.append({"role": "assistant", "content": llm_output})
        messages.append({"role": "user", "content": f"Observation: {observation}"})
    
    print("⚠ 达到最大步数,强制终止")
    return None

# 测试
if __name__ == "__main__":
    run_react("Python 是什么?")
\`\`\`

### 38.9 ReAct 的局限

ReAct 不是银弹,有几个明显局限:

- **依赖文本解析**:LLM 输出格式偶尔出错,正则解析失败
- **延迟高**:每步都要等 LLM 推理,多步循环累计延迟
- **成本高**:每步都要发完整 messages 给 LLM,token 消耗线性增长
- **容易跑偏**:LLM 在 Thought 中"自言自语",偏离目标
- **无并行能力**:ReAct 是串行的,无法同时调多个工具

**生产环境建议**:用 Function Calling + LangGraph 这类框架替代纯 ReAct,但理解 ReAct 思想对调优 Agent 仍然关键。

### 38.10 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| prompt 没给 few-shot | LLM 不按格式输出 | 至少 1-2 个示例 |
| Action 格式不规范 | 正则解析失败 | 严格规定 "Action: 名[参数]" 格式 |
| 没设 max_steps | 死循环烧钱 | 必须设 5-10 步上限 |
| Observation 重复发送 | messages 越来越长 | 用摘要或截断历史 |
| 把 ReAct 用在简单任务上 | 杀鸡用牛刀,延迟高 | 能直接答的不要走 ReAct |
| 工具描述太模糊 | LLM 调错工具、参数错 | 描述要明确,参数要清楚 |
| 不区分 Thought 和 Action | LLM 只输出 Action 不推理 | 模板强制 Thought 在前 |

> **小结**:ReAct 是 Agent 的"思想原点"。理解了 ReAct,就理解了 Agent 为什么能"自己干活"。今天的 Function Calling 和各种 Agent 框架,本质都是 ReAct 的工程化升级。`,
  },

  // =============================================================
  // 第三十九章：手写一个简单 Agent
  // =============================================================
  {
    id: 'agent-diy',
    group: 'Agent 基础',
    icon: '🔨',
    title: '手写一个简单 Agent',
    content: `## 第三十九章　手写一个简单 Agent

> "不要先上框架,先手写一个 Agent。"——这是理解 Agent 最快的方式。本章从零开始,不用任何框架,实现一个能跑的 Agent。

### 39.1 为什么从零手写

LangChain、LangGraph 这些框架封装得太好,以致于新手用着框架,却完全不知道 Agent 内部发生了什么。一旦出 bug,就只能盯着框架文档发呆。

**手写一遍 Agent,你能学到:**
- Agent 的主循环到底在循环什么
- LLM、工具、记忆怎么协作
- 终止条件为什么重要
- 框架到底帮你封装了什么

\`\`\`text
只用框架 → 黑盒使用,出 bug 不会调
手写一遍 → 完全理解,再用框架如虎添翼
\`\`\`

### 39.2 Agent 类结构设计

一个最小可用的 Agent 需要四个组件:

\`\`\`python
class SimpleAgent:
    def __init__(self, llm, tools, system_prompt):
        self.llm = llm                  # LLM 大脑
        self.tools = tools              # 工具列表
        self.system_prompt = system_prompt  # 系统提示
        self.memory = []                # 对话历史(短期记忆)
        self.max_steps = 10             # 最大循环步数
    
    def run(self, user_input):
        """主循环:接收用户输入,返回最终答案"""
        pass
\`\`\`

**组件职责:**
- \`llm\`:封装好的 LLM 调用接口,接收 messages,返回响应
- \`tools\`:dict 形式 {工具名: 函数},Agent 能调用的工具
- \`system_prompt\`:告诉 LLM 它是谁、有什么工具、按什么格式输出
- \`memory\`:对话历史,每次循环都把新消息加进去

### 39.3 LLM 接口封装

为了让 Agent 不依赖具体 LLM(便于切换和测试),先封装一个统一接口:

\`\`\`python
from openai import OpenAI

class LLMWrapper:
    """LLM 接口封装,提供统一调用方式"""
    
    def __init__(self, model="gpt-4o-mini"):
        self.client = OpenAI()
        self.model = model
    
    def chat(self, messages):
        """
        接收 messages 列表,返回 LLM 响应文本
        :param messages: [{"role": "...", "content": "..."}]
        :return: LLM 输出的字符串
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0,
        )
        return response.choices[0].message.content


# 测试用:MockLLM 不调真实 API,方便本地测试
class MockLLM:
    """模拟 LLM,用于本地测试和教学"""
    
    def __init__(self, responses):
        """
        :param responses: 预设的响应列表,按顺序返回
        """
        self.responses = responses
        self.call_count = 0
    
    def chat(self, messages):
        """每次调用返回下一条预设响应"""
        if self.call_count >= len(self.responses):
            return "Action: finish[任务完成]"
        response = self.responses[self.call_count]
        self.call_count += 1
        return response
\`\`\`

**为什么要有 MockLLM?** 真实 LLM 调用又慢又花钱,本地测试时用 MockLLM 模拟特定响应,能快速验证 Agent 逻辑。

### 39.4 工具定义和执行

工具是 Agent 的"手脚"。每个工具包含三部分:名字、描述、实现函数。

\`\`\`python
def search_web(query):
    """搜索工具(模拟)"""
    fake_results = {
        "天气": "北京今天晴,25 度",
        "新闻": "今日头条:OpenAI 发布新模型",
    }
    for key, val in fake_results.items():
        if key in query:
            return val
    return f"搜索 '{query}' 暂无结果"

def calculate(expression):
    """计算器工具"""
    try:
        return f"计算结果: {eval(expression)}"
    except Exception as e:
        return f"计算失败: {e}"

def get_time():
    """获取当前时间工具"""
    from datetime import datetime
    return f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

def finish(answer):
    """结束工具:返回最终答案,标记任务完成"""
    return answer

# 工具字典:工具名 -> 函数
tools = {
    "search": search_web,
    "calculate": calculate,
    "get_time": get_time,
    "finish": finish,
}
\`\`\`

### 39.5 System Prompt 设计

System prompt 是 Agent 的"大脑说明书"。要明确告诉 LLM:
- 它是谁、能做什么
- 有哪些工具、各自怎么用
- 输出格式是什么(Thought/Action)

\`\`\`python
SYSTEM_PROMPT = """你是一个能调用工具解决问题的 Agent。

可用工具:
- search(query): 搜索信息
- calculate(expression): 数学计算
- get_time(): 获取当前时间
- finish(answer): 给出最终答案并结束

每次响应必须严格按格式:
Thought: <你的推理,为什么选这个工具>
Action: <工具名>(<参数>)

工具返回结果后,你会收到:
Observation: <工具返回的内容>

循环直到你得到最终答案,然后调用 finish 工具。

例子:
Question: 现在几点了?
Thought: 我需要调用 get_time 工具获取当前时间
Action: get_time()
Observation: 当前时间: 2024-01-01 12:00:00
Thought: 我已得到答案,可以提交了
Action: finish(当前时间是 2024-01-01 12:00:00)
"""
\`\`\`

### 39.6 Agent 主循环实现

下面是 Agent 的核心代码——主循环。这是 Agent 的"心脏":

\`\`\`python
import re

class SimpleAgent:
    """手写简单 Agent"""
    
    def __init__(self, llm, tools, system_prompt, max_steps=10):
        self.llm = llm
        self.tools = tools
        self.system_prompt = system_prompt
        self.max_steps = max_steps
    
    def run(self, user_input):
        """
        Agent 主循环
        :param user_input: 用户的问题
        :return: 最终答案
        """
        # 初始化对话历史
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Question: {user_input}"},
        ]
        
        for step in range(self.max_steps):
            print(f"\\n========== Step {step + 1} ==========")
            
            # 1. 调用 LLM 决策
            llm_output = self.llm.chat(messages)
            print(f"LLM 输出:\\n{llm_output}")
            
            # 2. 解析 LLM 输出
            action = self.parse_action(llm_output)
            if not action:
                # 格式错误,要求 LLM 重新输出
                messages.append({"role": "assistant", "content": llm_output})
                messages.append({
                    "role": "user",
                    "content": "格式错误,请按 'Thought: ... Action: 工具名(参数)' 格式输出",
                })
                continue
            
            tool_name, tool_args = action
            
            # 3. 检查是否完成
            if tool_name == "finish":
                print(f"\\n✓ 任务完成! 答案: {tool_args}")
                return tool_args
            
            # 4. 执行工具
            observation = self.execute_tool(tool_name, tool_args)
            print(f"Observation: {observation}")
            
            # 5. 更新对话历史
            messages.append({"role": "assistant", "content": llm_output})
            messages.append({"role": "user", "content": f"Observation: {observation}"})
        
        print(f"\\n⚠ 达到最大步数 {self.max_steps},强制终止")
        return "Agent 未能完成任务"
    
    def parse_action(self, text):
        """
        解析 LLM 输出,提取 Action 行
        :return: (tool_name, tool_args) 或 None
        """
        # 匹配格式: Action: tool_name(arg1, arg2, ...)
        match = re.search(r'Action:\\s*(\\w+)\\((.*)\\)', text)
        if not match:
            return None
        tool_name = match.group(1)
        tool_args = match.group(2).strip()
        return tool_name, tool_args
    
    def execute_tool(self, tool_name, tool_args):
        """
        执行工具
        :param tool_name: 工具名
        :param tool_args: 参数字符串,如 '"北京天气"' 或 '3 + 5'
        """
        if tool_name not in self.tools:
            return f"工具 '{tool_name}' 不存在,可用工具: {list(self.tools.keys())}"
        
        tool_func = self.tools[tool_name]
        
        try:
            # 无参数工具
            if not tool_args:
                return str(tool_func())
            
            # 处理参数:去掉字符串两端的引号
            args_str = tool_args.strip().strip('\"').strip("'")
            
            # 简单解析:如果是单一字符串参数
            return str(tool_func(args_str))
        except Exception as e:
            return f"工具执行失败: {e}"
\`\`\`

### 39.7 完整可运行示例(用 Mock LLM)

下面是一个完整可运行的例子,用 MockLLM 模拟 LLM 响应,无需 API Key:

\`\`\`python
# 用 MockLLM 模拟 Agent 执行
# 预设 LLM 会输出的内容(模拟一个完整 ReAct 流程)
mock_responses = [
    # Step 1: 调用 search 工具
    """Thought: 用户问北京天气,我需要搜索一下
Action: search("北京天气")""",
    
    # Step 2: 看到 Observation 后,调用 finish
    """Thought: 我已经得到北京天气信息,可以提交最终答案了
Action: finish(北京今天晴,25 度)""",
]

# 创建 Mock LLM
mock_llm = MockLLM(mock_responses)

# 创建 Agent
agent = SimpleAgent(
    llm=mock_llm,
    tools=tools,
    system_prompt=SYSTEM_PROMPT,
    max_steps=5,
)

# 运行 Agent
answer = agent.run("北京今天天气怎么样?")
print(f"\\n最终答案: {answer}")

# 预期输出:
# ========== Step 1 ==========
# LLM 输出: Thought: 用户问北京天气,我需要搜索一下
# Action: search("北京天气")
# Observation: 北京今天晴,25 度
#
# ========== Step 2 ==========
# LLM 输出: Thought: 我已经得到北京天气信息,可以提交最终答案了
# Action: finish(北京今天晴,25 度)
#
# ✓ 任务完成! 答案: 北京今天晴,25 度
\`\`\`

### 39.8 用真实 LLM 跑 Agent

把 MockLLM 换成真实 LLM 即可。下面是接入 OpenAI 的版本:

\`\`\`python
# 真实 LLM 版本
real_llm = LLMWrapper(model="gpt-4o-mini")

agent = SimpleAgent(
    llm=real_llm,
    tools=tools,
    system_prompt=SYSTEM_PROMPT,
    max_steps=10,
)

# 提问
answer = agent.run("现在几点?然后告诉我 24 小时后是几点")
print(f"\\n最终答案: {answer}")
\`\`\`

### 39.9 这个简单 Agent 的局限性

我们的 SimpleAgent 跑起来了,但距离生产级 Agent 还差得远。主要局限:

| 局限 | 现象 | 生产级 Agent 怎么解决 |
|------|------|---------------------|
| 无错误恢复 | 工具失败,Agent 不知道重试 | 加重试逻辑、错误分类处理 |
| 无并行能力 | 一次只能调一个工具 | 用 LangGraph 的并发节点 |
| 无状态持久化 | 重启后记忆全失 | 用数据库存对话历史 |
| 文本解析脆弱 | LLM 输出格式偶尔出错 | 用 Function Calling 替代文本协议 |
| 无子任务分解 | 大任务直接做,容易跑偏 | 加 Planner 模块先分解 |
| 无成本控制 | 不知道 token 用了多少 | 加 token 计数和预算限制 |
| 无人工确认 | 危险操作(写文件、发邮件)直接执行 | 加 human-in-the-loop 确认 |

\`\`\`python
# 改进示例:加错误重试
class RobustAgent(SimpleAgent):
    """带错误重试的 Agent"""
    
    def execute_tool(self, tool_name, tool_args, max_retries=2):
        """带重试的工具执行"""
        for attempt in range(max_retries):
            try:
                result = super().execute_tool(tool_name, tool_args)
                # 检查是否是错误信息
                if "失败" not in result:
                    return result
                print(f"工具执行失败(尝试 {attempt+1}/{max_retries}): {result}")
            except Exception as e:
                print(f"工具异常(尝试 {attempt+1}/{max_retries}): {e}")
        return f"工具 {tool_name} 重试 {max_retries} 次后仍失败"
\`\`\`

### 39.10 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 不用 MockLLM 测试 | 每次调试都调真 API,慢且贵 | 用 MockLLM 跑通逻辑再接真 LLM |
| System prompt 不明确格式 | LLM 输出乱七八糟 | 严格规定 Thought/Action 格式 |
| 解析正则太宽松 | 匹配到错误内容 | 用 ^Action: 开头的精确匹配 |
| 工具异常未捕获 | 一个工具失败,整个 Agent 崩溃 | try/except 包住每个工具调用 |
| 不设 max_steps | 偶尔死循环烧 token | 必须设上限,5-10 步 |
| messages 越积越长 | token 超限 | 用摘要或滑动窗口管理历史 |
| 不打印中间步骤 | 出 bug 不知道在哪一步 | 打印每步 Thought/Action/Observation |

> **小结**:手写一遍 Agent,你就理解了所有 Agent 框架的"内核"。后面用 LangChain、LangGraph 时,你会清楚地知道每个组件对应代码的哪一部分。下一章讲 Agent 循环的细节:终止控制、错误处理、状态管理。`,
  },

  // =============================================================
  // 第四十章：Agent 循环与终止控制
  // =============================================================
  {
    id: 'agent-loop',
    group: 'Agent 基础',
    icon: '🔁',
    title: 'Agent 循环与终止控制',
    content: `## 第四十章　Agent 循环与终止控制

> Agent 跑起来很简单,跑得稳很难。本章聚焦 Agent 的"运行控制"——什么时候停、出错了怎么办、状态怎么管、调试怎么看。

### 40.1 Agent 主循环的设计要点

上一章我们写了一个最小 Agent 循环,但生产级循环要考虑更多。一个健壮的 Agent 循环应包含:

\`\`\`text
1. 调用 LLM 决策
2. 解析输出(可能失败)
3. 校验参数(可能不合法)
4. 检查权限(危险操作需确认)
5. 执行工具(可能失败,可重试)
6. 观察结果(可能超长,需截断)
7. 更新状态(可能超出 token 限制)
8. 检查终止条件(任务完成/步数到/错误超限)
9. 回到 1 或退出
\`\`\`

每个环节都可能出问题,健壮的循环要对每个失败点有应对策略。

### 40.2 终止条件设计

终止条件是 Agent 的"安全阀"。下面是常见终止条件及实现:

\`\`\`python
class AgentTermination:
    """Agent 终止条件管理"""
    
    def __init__(self, max_steps=10, max_tokens=10000, timeout_seconds=120):
        self.max_steps = max_steps                # 最大步数
        self.max_tokens = max_tokens              # 最大 token 消耗
        self.timeout_seconds = timeout_seconds    # 最大执行时间
        self.max_consecutive_errors = 3           # 最大连续错误
        self.start_time = None
        self.consecutive_errors = 0
        self.total_tokens = 0
        self.steps = 0
    
    def step(self, tokens_used=0, error=False):
        """每步调用,更新状态"""
        self.steps += 1
        self.total_tokens += tokens_used
        if error:
            self.consecutive_errors += 1
        else:
            self.consecutive_errors = 0
    
    def should_terminate(self, task_done=False):
        """检查是否应终止,返回(是否终止, 原因)"""
        if task_done:
            return True, "任务完成"
        if self.steps >= self.max_steps:
            return True, f"达到最大步数 {self.max_steps}"
        if self.total_tokens >= self.max_tokens:
            return True, f"token 用尽 {self.total_tokens}/{self.max_tokens}"
        if self.consecutive_errors >= self.max_consecutive_errors:
            return True, f"连续错误 {self.consecutive_errors} 次"
        import time
        if self.start_time and time.time() - self.start_time > self.timeout_seconds:
            return True, f"超时 {self.timeout_seconds} 秒"
        return False, None
\`\`\`

#### 40.2.1 主动终止:LLM 说"完成"

最理想的终止方式:LLM 自己判断任务完成,调用 finish 工具或输出最终答案。

\`\`\`python
def check_task_done(llm_output):
    """检查 LLM 是否主动表示完成"""
    # 方式 1: 调用 finish 工具
    if "Action: finish" in llm_output or "Final Answer:" in llm_output:
        return True
    # 方式 2: 显式说"任务完成"
    if "任务完成" in llm_output or "已完成" in llm_output:
        return True
    return False
\`\`\`

#### 40.2.2 被动终止:外部强制

LLM 不会自己判断"该停了"时,外部必须强制终止:

- **max_iterations**:最多循环 N 步,防止死循环
- **timeout**:总执行时间超过 X 秒,防止卡死
- **token_budget**:总 token 消耗超过预算,防止烧钱

### 40.3 防止无限循环

死循环是 Agent 最常见的坑。LLM 可能陷入"重复调同一工具、永远说'我还要再查一下'"的状态。

#### 40.3.1 步数限制

最简单的防护:硬性步数上限。

\`\`\`python
def agent_loop_with_limit(agent, question, max_steps=10):
    """带步数限制的 Agent 循环"""
    for step in range(max_steps):
        result = agent.step(question)
        if result.done:
            return result.answer
    return "Agent 达到最大步数,未能完成任务"
\`\`\`

#### 40.3.2 重复检测

更聪明的防护:检测 Agent 是否在重复同样的行动。

\`\`\`python
class ActionHistory:
    """行动历史,用于检测重复"""
    
    def __init__(self, max_repeat=3):
        self.history = []
        self.max_repeat = max_repeat  # 同一 action 最多重复 3 次
    
    def add(self, action):
        """记录行动"""
        self.history.append(action)
    
    def is_repeating(self, action):
        """检查是否在重复同一个 action"""
        recent = self.history[-self.max_repeat:]
        # 检查最近 N 次是否都是同一个 action
        if len(recent) >= self.max_repeat and all(a == action for a in recent):
            return True
        return False

# 在 Agent 循环中使用
history = ActionHistory(max_repeat=3)
for step in range(max_steps):
    action = llm_decide()
    if history.is_repeating(action):
        print("⚠ 检测到重复行动,强制终止")
        break
    history.add(action)
    execute(action)
\`\`\`

#### 40.3.3 状态指纹

更高级的重复检测:把"当前对话状态"做 hash,如果状态没变,说明卡住了。

\`\`\`python
import hashlib

def state_fingerprint(messages):
    """计算当前状态的指纹"""
    content = "".join(m["content"] for m in messages[-5:])  # 最近 5 条
    return hashlib.md5(content.encode()).hexdigest()

# 在循环中检测状态是否变化
prev_fingerprint = None
for step in range(max_steps):
    current_fingerprint = state_fingerprint(messages)
    if current_fingerprint == prev_fingerprint:
        print("⚠ 状态未变化,可能卡住")
        # 加一条"提醒"消息打破死循环
        messages.append({
            "role": "user",
            "content": "你已经重复了相同的内容,请尝试不同的方法或给出当前最佳答案",
        })
    prev_fingerprint = current_fingerprint
\`\`\`

### 40.4 错误处理

Agent 涉及多个组件,每个都可能出错。要分类处理:

#### 40.4.1 工具失败

\`\`\`python
def execute_tool_safely(tool_name, args, tools, max_retries=2):
    """带重试和错误处理的工具执行"""
    if tool_name not in tools:
        return f"错误: 工具 '{tool_name}' 不存在"
    
    for attempt in range(max_retries):
        try:
            result = tools[tool_name](args)
            # 检查结果是否是错误信息
            if isinstance(result, str) and ("error" in result.lower() or "失败" in result):
                print(f"工具返回错误(尝试 {attempt+1}): {result}")
                continue
            return result
        except Exception as e:
            print(f"工具异常(尝试 {attempt+1}): {e}")
            if attempt == max_retries - 1:
                return f"工具 {tool_name} 重试 {max_retries} 次后仍失败: {e}"
\`\`\`

#### 40.4.2 LLM 输出异常

LLM 偶尔会输出不符合格式的内容,需要解析失败处理:

\`\`\`python
def safe_parse_llm_output(text, max_attempts=2):
    """带重试的 LLM 输出解析"""
    for attempt in range(max_attempts):
        try:
            # 尝试解析
            action = parse_action(text)
            if action:
                return action
            raise ValueError("无法解析 Action 行")
        except Exception as e:
            if attempt == max_attempts - 1:
                return None, f"解析失败: {e}"
            # 让 LLM 重新输出
            text = ask_llm_to_reformat(text)
\`\`\`

#### 40.4.3 超时处理

某些工具(网络请求、长任务)可能卡住,要有超时机制:

\`\`\`python
import signal

class TimeoutError(Exception):
    pass

def call_with_timeout(func, args, timeout_seconds=30):
    """带超时的函数调用"""
    def handler(signum, frame):
        raise TimeoutError(f"超时 {timeout_seconds} 秒")
    
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(timeout_seconds)
    try:
        result = func(args)
        signal.alarm(0)  # 取消闹钟
        return result
    except TimeoutError as e:
        return f"错误: {e}"
    finally:
        signal.alarm(0)
\`\`\`

### 40.5 状态管理

Agent 运行中要维护多个状态,合理管理是健壮性的基础。

\`\`\`python
class AgentState:
    """Agent 状态管理"""
    
    def __init__(self, goal):
        self.goal = goal                    # 任务目标
        self.history = []                   # 对话历史
        self.intermediate_results = {}      # 中间结果
        self.current_step = 0               # 当前步骤
        self.status = "running"             # running/succeeded/failed/timeout
        self.error_log = []                 # 错误日志
    
    def add_result(self, key, value):
        """记录中间结果"""
        self.intermediate_results[key] = value
    
    def get_result(self, key, default=None):
        """获取中间结果"""
        return self.intermediate_results.get(key, default)
    
    def add_error(self, error):
        """记录错误"""
        self.error_log.append({
            "step": self.current_step,
            "error": error,
            "timestamp": time.time(),
        })
    
    def summary(self):
        """状态摘要(用于调试和日志)"""
        return {
            "goal": self.goal,
            "steps": self.current_step,
            "status": self.status,
            "results_count": len(self.intermediate_results),
            "errors": len(self.error_log),
        }
\`\`\`

### 40.6 日志和可观测性

Agent 是黑盒运行,没日志就等于盲跑。每一步的 Thought/Action/Observation 都要记录。

\`\`\`python
import logging
import json
from datetime import datetime

class AgentLogger:
    """Agent 日志记录器"""
    
    def __init__(self, log_file="agent.log"):
        self.log_file = log_file
        self.logger = logging.getLogger("agent")
        self.logger.setLevel(logging.INFO)
        
        # 文件日志
        handler = logging.FileHandler(log_file, encoding="utf-8")
        handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
        self.logger.addHandler(handler)
    
    def log_step(self, step, thought, action, observation):
        """记录一步"""
        entry = {
            "step": step,
            "timestamp": datetime.now().isoformat(),
            "thought": thought,
            "action": action,
            "observation": observation,
        }
        self.logger.info(json.dumps(entry, ensure_ascii=False))
    
    def log_error(self, step, error):
        """记录错误"""
        self.logger.error(f"Step {step} error: {error}")


# 在 Agent 循环中用
logger = AgentLogger("my_agent.log")
for step in range(max_steps):
    thought, action = llm_decide()
    observation = execute_tool(action)
    logger.log_step(step, thought, action, observation)
\`\`\`

### 40.7 调试技巧

Agent 出问题时,要能快速定位。下面是常用调试技巧:

\`\`\`text
1. 打印每步的 Thought/Action/Observation
   - 看 Thought 是否合理(是不是在乱想)
   - 看 Action 是否正确(工具名对不对、参数对不对)
   - 看 Observation 是否被正确解析

2. 单步执行模式
   - 每步暂停,按回车继续
   - 让你能观察每一步,而不是只看最终结果

3. 历史回放
   - 把整个执行过程记录下来
   - 出 bug 时回放,看哪一步走错了

4. 缩减上下文调试
   - 只用最近 3 条消息测试
   - 排除"历史太长导致 LLM 混乱"

5. 切换 LLM 对比
   - 同样 prompt 在 GPT-4 和 Claude 上跑
   - 区分是 prompt 问题还是模型问题
\`\`\`

\`\`\`python
def debug_agent(agent, question, interactive=True):
    """调试模式运行 Agent:每步暂停,显示详细信息"""
    print(f"问题: {question}")
    print(f"可用工具: {list(agent.tools.keys())}")
    print("-" * 50)
    
    state = AgentState(question)
    for step in range(agent.max_steps):
        # 单步执行
        thought, action = agent.decide(state)
        print(f"\\n[Step {step+1}]")
        print(f"Thought: {thought}")
        print(f"Action: {action}")
        
        if interactive:
            input("按回车继续执行...")  # 等待用户确认
        
        observation = agent.execute(action)
        print(f"Observation: {observation}")
        
        state.add_result(f"step_{step}_result", observation)
    
    return state
\`\`\`

### 40.8 生产环境注意事项

把 Agent 从 demo 推到生产,要特别注意这些点:

| 注意点 | demo 阶段 | 生产阶段 |
|--------|----------|---------|
| 工具失败 | 报错就崩 | 必须重试 + 降级 |
| LLM 超时 | 直接返回 | 必须有 timeout 和 fallback |
| Token 消耗 | 不关心 | 必须有预算限制 |
| 危险操作 | 直接执行 | 必须人工确认(human-in-the-loop) |
| 日志 | print 就行 | 结构化日志 + 监控告警 |
| 状态持久化 | 内存里 | 数据库存,可恢复 |
| 并发 | 单请求 | 必须支持多用户并发 |
| 速率限制 | 不考虑 | 必须遵守 LLM API 限速 |
| 成本归因 | 不区分 | 按用户/任务计费 |

\`\`\`python
# 生产级 Agent 示例:增加人工确认
class ProductionAgent(SimpleAgent):
    """生产级 Agent:危险操作需人工确认"""
    
    DANGEROUS_TOOLS = ["write_file", "send_email", "delete_file", "execute_sql"]
    
    def execute_tool(self, tool_name, tool_args):
        # 危险操作需人工确认
        if tool_name in self.DANGEROUS_TOOLS:
            print(f"\\n⚠ 即将执行危险操作: {tool_name}({tool_args})")
            confirm = input("确认执行? (y/n): ")
            if confirm.lower() != 'y':
                return "用户取消了此操作"
        
        return super().execute_tool(tool_name, tool_args)
    
    def run(self, user_input, user_id=None, budget_tokens=10000):
        """生产级运行:带用户、预算控制"""
        # 检查用户预算
        if not self.check_budget(user_id, budget_tokens):
            return "用户预算不足"
        
        # 执行(父类逻辑)
        return super().run(user_input)
    
    def check_budget(self, user_id, budget):
        """检查用户预算(简化版)"""
        # 实际从数据库查用户已用 token
        return True
\`\`\`

### 40.9 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 不设 max_steps | 死循环烧 token | 必须设,5-10 步 |
| 不检测重复 | 重复调同一工具 | 用 ActionHistory 检测 |
| 工具异常未捕获 | 一个失败全崩 | try/except 包每个工具 |
| 没有日志 | 出 bug 不知道哪步错 | 打印每步 + 结构化日志 |
| 危险操作无确认 | 误删文件、误发邮件 | human-in-the-loop 确认 |
| 状态全在内存 | 重启全失 | 数据库持久化关键状态 |
| 不监控 token | 一次任务烧几十美元 | 设 token 预算和告警 |
| 并发没隔离 | 多用户串话 | 每个会话独立 state |
| 没设超时 | 工具卡死,Agent 永远等 | 所有外部调用加超时 |
| 单步调试不暂停 | 看不清执行过程 | 加 interactive 模式 |

> **小结**:Agent 的循环控制是其"安全护栏"。一个能跑的 Agent 不难写,但一个跑得稳、跑得久、出问题能恢复的 Agent,需要细致的状态管理、错误处理、监控日志。这些"看不见"的工程能力,才是 Agent 从 demo 走向生产的关键。`,
  },
];
