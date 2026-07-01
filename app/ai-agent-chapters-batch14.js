// =============================================================
// AI Agent 开发实战 - 第十四批章节(多 Agent 协作,共 4 章)
// 章节 53-56:多 Agent 架构 / CrewAI / AutoGen / 多 Agent 实战
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十三章:多 Agent 系统架构
  // =============================================================
  {
    id: 'multi-agent',
    group: '多 Agent 协作',
    icon: '👥',
    title: '多 Agent 系统架构',
    content: `## 第五十三章　多 Agent 系统架构

### 53.1 为什么单个 Agent 不够

前面章节我们一直在讲"一个 Agent 撑全场"。但当任务复杂到一定程度,单 Agent 会撞上几堵墙:

- **上下文爆炸**:一个 Agent 又要检索、又要写代码、又要审稿,所有上下文塞进一个对话历史,token 成本飙升且容易"失忆";
- **专长冲突**:写代码的 prompt 和写营销文案的 prompt 要求完全不同的"人设",硬塞一个 Agent 会让它精神分裂;
- **调试困难**:单 Agent 出错时,你不知道是检索错了、推理错了、还是生成错了,黑盒太大;
- **扩展瓶颈**:任务变多只能加深单 Agent 的上下文,而多 Agent 可以并行分工。

> 一句话:**单 Agent 像"全能打杂工",什么都能干一点但什么都不精;多 Agent 像"专业团队",各司其职、协同交付。**复杂任务从"一人扛"走向"团队协作"是必然。

### 53.2 多 Agent 的本质:角色 + 协作 + 通信

多 Agent 系统 = **一组有明确角色的 Agent + 一套协作模式 + 一种通信机制**。

- **角色**:每个 Agent 有专属的 system prompt、工具集、目标;
- **协作模式**:谁先谁后、谁听谁的、谁监督谁;
- **通信机制**:Agent 之间怎么传数据(共享 state、消息传递、文件交接)。

### 53.3 四种经典架构模式

#### 模式一:Sequential 顺序协作

Agent 们排成一条流水线,前一个的输出是后一个的输入。

\`\`\`text
研究员 → 作家 → 编辑 → 校对
(找资料)  (写初稿) (改稿)  (查错)
\`\`\`

特点:简单清晰,易调试;缺点是无法回头改前面环节,且慢(串行)。

#### 模式二:Supervisor 主管模式

一个"主管 Agent"统筹全局,把任务拆给下属 Agent,汇总结果。

\`\`\`text
        主管 Supervisor
       /      |      \\
   研究员   分析师   写手
\`\`\`

特点:有统一决策点,可控性强;缺点是主管是瓶颈和单点。

#### 模式三:Hierarchical 层级模式

主管下还有小组长,形成树状层级。

\`\`\`text
      总管
      /  \\
  组长A  组长B
  / \\     / \\
成员 成员 成员 成员
\`\`\`

特点:适合超大规模任务;缺点是层级深时通信延迟大、调试难。

#### 模式四:Network 网络模式

Agent 之间两两可通信,无固定层级。

\`\`\`text
   A —— B
   | \\  |
   C —— D
\`\`\`

特点:灵活、涌现性强;缺点是行为难预测、容易陷入无意义对话。

### 53.4 角色分工:Planner / Executor / Critic

一个高效的小团队通常有三种角色:

\`\`\`python
# 角色一:Planner 规划者——拆解任务、分配子任务
PLANNER_PROMPT = """你是项目规划师。
你的职责:把用户的大目标拆成可执行的子任务清单。
不要自己执行,只输出任务列表及每项的负责角色。"""

# 角色二:Executor 执行者——动手干活
CODER_PROMPT = """你是资深程序员。
你的职责:根据任务描述写代码。
只输出可运行代码,不要解释。"""

# 角色三:Critic 批评者——审查纠错
REVIEWER_PROMPT = """你是严格的代码审查员。
你的职责:检查代码的 bug、安全、性能。
列出问题并给出修改建议,不要直接改。"""
\`\`\`

**为什么要有 Critic?** 因为 LLM 自查错误率很高,独立第三方审查能抓到执行者自己看不到的问题。这是多 Agent 比单 Agent 质量高的关键来源。

### 53.5 通信机制

Agent 之间怎么传数据?三种主流方式:

| 方式 | 实现 | 适用 |
| --- | --- | --- |
| **共享 State** | LangGraph 的 State 对象 | 同一图内、需持久中间态 |
| **消息传递** | Agent 直接发消息(像聊天) | 对话式协作(AutoGen) |
| **产物交接** | 上一个的输出文件传给下一个 | 流水线式(CrewAI) |

\`\`\`python
# 共享 State 示例(LangGraph 风格)
class TeamState(TypedDict):
    plan: list           # Planner 写入
    code: str            # Executor 写入
    review: str          # Critic 写入

def planner(state) -> dict:
    return {"plan": ["写函数", "写测试", "写文档"]}

def executor(state) -> dict:
    return {"code": "def add(a,b): return a+b"}

def critic(state) -> dict:
    return {"review": "缺少类型注解和测试"}
\`\`\`

### 53.6 协调与冲突解决

多 Agent 会出现意见不一致(两个 Agent 给出不同方案)。解决策略:

- **主管裁决**:Supervisor 听完各方意见后拍板;
- **投票/打分**:多个 Agent 各出方案,Critic 打分选最优;
- **优先级**:预定义某角色意见优先(如安全 Agent 一票否决);
- **人介入**:僵持不下时升级到人。

### 53.7 架构选择决策表

| 任务特征 | 推荐架构 | 理由 |
| --- | --- | --- |
| 流程固定、线性 | Sequential | 简单可控 |
| 任务需动态拆分 | Supervisor | 主管统一调度 |
| 超大规模、多子任务 | Hierarchical | 分层管理 |
| 需要头脑风暴、涌现 | Network | 多向激发 |
| 需要并行加速 | Supervisor + 并行子任务 | 主管扇出 |
| 质量要求极高 | 加 Critic 角色 | 第三方审查 |

### 53.8 多 Agent 的挑战

| 挑战 | 表现 | 应对 |
| --- | --- | --- |
| **通信成本** | Agent 互发消息 token 翻倍 | 只传必要信息,精简消息 |
| **一致性** | 各 Agent 视角不同产生矛盾 | 主管统一收口 |
| **调试难** | 不知道哪个环节出错 | 完整日志 + 每步留痕 |
| **死锁** | 两个 Agent 互相等对方 | 设超时 + 主管介入 |
| **无限循环** | Agent 互相推诿"你先做" | 限制最大轮数 |

### 53.9 一个最小多 Agent 示意(LangGraph)

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

class TeamState(TypedDict):
    messages: Annotated[list, add_messages]
    plan: list
    code: str
    review: str
    pass_review: bool

def planner(state) -> dict:
    # 规划者:拆解任务
    return {"plan": ["实现 add 函数", "加类型注解"]}

def coder(state) -> dict:
    # 执行者:按计划写代码
    return {"code": "def add(a: int, b: int) -> int:\\n    return a + b"}

def reviewer(state) -> dict:
    # 批评者:审查代码
    passed = "def " in state["code"] and "int" in state["code"]
    return {"review": "通过" if passed else "缺类型注解", "pass_review": passed}

def route_review(state) -> str:
    # 不通过就回到 coder 重写,通过就结束
    return "end" if state["pass_review"] else "coder"

gb = StateGraph(TeamState)
gb.add_node("planner", planner)
gb.add_node("coder", coder)
gb.add_node("reviewer", reviewer)
gb.add_edge(START, "planner")
gb.add_edge("planner", "coder")
gb.add_edge("coder", "reviewer")
gb.add_conditional_edges("reviewer", route_review, {"coder": "coder", "end": END})
app = gb.compile()

result = app.invoke({"messages": []})
print(result["code"])      # def add(a: int, b: int) -> int: ...
print(result["review"])    # 通过
\`\`\`

### 53.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| Agent 没有清晰人设 | 角色混搭,输出四不像 | system prompt 明确角色和边界 |
| 所有 Agent 共用一个上下文 | token 爆炸、互相干扰 | 各自独立上下文,只传结论 |
| 没有 Critic | 错误没人发现 | 关键产物必过审查 |
| 无最大轮数限制 | 无限对话烧钱 | 设循环上限 |
| 主管什么都自己干 | 退化成单 Agent | 主管只做拆分和汇总 |

> **本章小结**:多 Agent 通过角色分工解决单 Agent 的专长冲突、上下文爆炸、调试困难。四种架构(顺序/主管/层级/网络)按任务特征选择。关键是"清晰角色 + 合适协作模式 + 高效通信"。下两章我们看两个具体框架:CrewAI 和 AutoGen。`,
  },

  // =============================================================
  // 第五十四章:CrewAI 框架
  // =============================================================
  {
    id: 'crewai',
    group: '多 Agent 协作',
    icon: '🚢',
    title: 'CrewAI 框架',
    content: `## 第五十四章　CrewAI 框架

### 54.1 CrewAI 是什么

CrewAI 是一个"角色扮演风格"的多 Agent 协作框架。它的核心思想是:**把多 Agent 协作当成一个剧组(Crew)来组织——每个 Agent 是一个有 role(角色)、goal(目标)、backstory(背景故事)的"演员",任务(Task)是剧本,Crew 是剧组,Process 是导演。**

这种拟人化的设计让 prompt 更自然,也让非技术人容易理解协作结构。

> CrewAI 适合:**流程相对固定、角色分工明确、强调"交付物"的场景**,比如写报告、做研究、内容生产。它不太适合需要复杂动态路由和循环的场景(那是 LangGraph 的强项)。

### 54.2 核心概念

| 概念 | 作用 | 类比 |
| --- | --- | --- |
| **Agent** | 一个角色化的执行者 | 剧组里的演员 |
| **Task** | 一项具体工作,有描述和预期产出 | 剧本里的戏份 |
| **Crew** | 把 Agent 和 Task 组装起来 | 整个剧组 |
| **Process** | 协作方式(顺序/层级) | 导演的调度方式 |
| **Tool** | Agent 可调用的工具 | 演员的道具 |

### 54.3 定义 Agent:role / goal / backstory

Agent 的三个灵魂字段:

\`\`\`python
from crewai import Agent

researcher = Agent(
    role="资深市场研究员",                    # 角色名:决定人设
    goal="收集并整理关于 {topic} 的核心信息",   # 目标:它要达成什么
    backstory="""你是一位有 10 年经验的市场研究员,
擅长从海量信息中提炼关键洞察。你只负责研究,
不负责写作或润色。""",                       # 背景:塑造行为风格
    llm="gpt-4o-mini",                        # 用哪个模型
    tools=[search_tool, web_tool],            # 可用工具
    verbose=True,                             # 打印执行过程
    allow_delegation=False,                    # 是否允许把任务转交他人
)
\`\`\`

**backstory 为什么重要?** 它相当于 system prompt 的扩展,能引导模型"进入角色"。好的 backstory 会让 Agent 的输出风格、详细程度、关注点都更符合预期。

### 54.4 定义 Task:description / agent / expected_output

\`\`\`python
from crewai import Task

research_task = Task(
    description="""研究 {topic} 的现状:
1. 市场规模与增长趋势
2. 主要竞争者
3. 三个关键机会点""",
    expected_output="一份 500 字的市场研究简报,分点列出",  # 期望产出格式
    agent=researcher,                          # 由哪个 Agent 负责
)
\`\`\`

**expected_output 是 CrewAI 的精髓**:它强制你提前定义"什么算完成",这比"尽量写好"这种模糊指令有效得多——模型会按你定义的格式和长度产出。

### 54.5 组装 Crew 并 kickoff

\`\`\`python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, writer, editor],   # 剧组成员
    tasks=[research_task, write_task, edit_task],  # 按顺序的戏份
    process=Process.sequential,             # 顺序流程
    verbose=True,
)

# 启动!传入变量
result = crew.kickoff(inputs={"topic": "AI Agent 市场"})
print(result.raw)   # 最终产出
\`\`\`

**执行流程**:顺序模式下,Task 按列表顺序执行,前一个 Task 的结果会作为上下文传给后一个,最后一个 Task 的产出就是 Crew 的最终结果。

### 54.6 Process 类型

| Process | 含义 | 适用 |
| --- | --- | --- |
| \`sequential\` | 严格按 Task 列表顺序执行 | 流程固定的流水线 |
| \`hierarchical\` | 自动派一个"经理 Agent"统筹 | 任务需动态分配 |

\`\`\`python
# 层级模式:框架自动生成一个经理来调度
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, write_task, edit_task],
    process=Process.hierarchical,
    manager_llm="gpt-4o",   # 经理用的模型(建议用更强的)
)
\`\`\`

### 54.7 工具分配

不同 Agent 配不同工具,各司其职:

\`\`\`python
from crewai_tools import SerperDevTool, WebsiteSearchTool

# 搜索工具只给研究员
search_tool = SerperDevTool()
researcher = Agent(role="研究员", tools=[search_tool], ...)

# 作家不需要搜索工具,只靠研究员给的资料写作
writer = Agent(role="作家", tools=[], ...)
\`\`\`

### 54.8 实战:研究 Crew(研究员+作家+编辑)

完整流程:给定主题 → 研究员收集资料 → 作家起草报告 → 编辑润色 → 输出。

\`\`\`python
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

# 1. 准备工具
search_tool = SerperDevTool()

# 2. 定义三个 Agent(角色化人设)
researcher = Agent(
    role="资深市场研究员",
    goal="收集 {topic} 的市场规模、竞争者、机会点",
    backstory="10 年经验的市场研究员,擅长提炼关键洞察。",
    tools=[search_tool],
    llm="gpt-4o-mini",
)

writer = Agent(
    role="技术内容作家",
    goal="把研究资料写成一份清晰易读的报告",
    backstory="擅长把复杂技术讲通俗,注重结构和可读性。",
    llm="gpt-4o-mini",
)

editor = Agent(
    role="严格的内容编辑",
    goal="检查报告的事实、逻辑、表达,给出终稿",
    backstory="出版业老编辑,容不得错别字和逻辑漏洞。",
    llm="gpt-4o",   # 编辑用更强的模型把关
)

# 3. 定义三个 Task(顺序)
research_task = Task(
    description="研究 {topic}:1.市场规模 2.主要竞争者 3.三个机会点",
    expected_output="500 字市场研究简报,分点列出",
    agent=researcher,
)

write_task = Task(
    description="基于研究结果写一份面向管理层的报告,要有摘要和结论",
    expected_output="800 字报告,含摘要、正文、结论",
    agent=writer,
)

edit_task = Task(
    description="审校报告的事实准确性、逻辑、表达,输出终稿",
    expected_output="修订后的终稿,附改动说明",
    agent=editor,
)

# 4. 组装 Crew 并启动
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, write_task, edit_task],
    process=Process.sequential,
    verbose=True,
)

final = crew.kickoff(inputs={"topic": "AI Agent 市场"})
print(final.raw)
\`\`\`

### 54.9 CrewAI vs LangGraph

| 维度 | CrewAI | LangGraph |
| --- | --- | --- |
| 抽象层次 | 高(角色+任务) | 中(图+节点) |
| 上手难度 | 低,贴近自然语言 | 中,需图思维 |
| 流程控制 | 顺序/层级两种 | 任意条件图、循环 |
| 人机协作 | 较弱 | 原生 interrupt |
| 适合场景 | 内容生产、研究 | 复杂动态工作流 |
| 灵活性 | 中 | 高 |

### 54.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| expected_output 写太模糊 | 产出格式不可控 | 明确字数、结构、要点 |
| 所有 Agent 用一个模型 | 编辑能力不足放水 | 关键角色用更强模型 |
| Task 顺序与 agent 能力不符 | 后续 Agent 拿不到所需信息 | 顺序匹配能力依赖 |
| 没给 Agent 工具却让它查资料 | 它会瞎编 | 需查资料的 Agent 必须配工具 |
| 变量 {topic} 没在 kickoff 传入 | 报错或字面输出 | inputs 提供所有占位变量 |

> **本章小结**:CrewAI 用"剧组"隐喻组织多 Agent——Agent 有角色、Task 有期望产出、Crew 按流程串起来。强项是流程固定、强调交付物的内容生产场景。下一章看对话式的 AutoGen。`,
  },

  // =============================================================
  // 第五十五章:AutoGen 框架
  // =============================================================
  {
    id: 'autogen',
    group: '多 Agent 协作',
    icon: '💬',
    title: 'AutoGen 框架',
    content: `## 第五十五章　AutoGen 框架

### 55.1 AutoGen 是什么

AutoGen 是微软开源的**多 Agent 对话框架**。和 CrewAI 的"角色扮演 + 任务流水线"不同,AutoGen 的核心是**让多个 Agent 像开会一样"对话"解决问题**——你说一句我接一句,直到达成结论。

> 一句话对比:**CrewAI 像剧组按剧本演戏,AutoGen 像会议室里几个人讨论拍板。**前者流程固定产出明确,后者灵活涌现适合需要"讨论达成共识"的任务。

### 55.2 Conversable Agent:能对话的 Agent

AutoGen 的基础单元是 \`ConversableAgent\`,它最大的特点是支持**自动回复**——收到消息后会按 system message 自动生成回复。

\`\`\`python
import autogen

# 配置 LLM
llm_config = {"model": "gpt-4o-mini", "api_key": "sk-..."}

# 创建一个可对话的 Agent
coder = autogen.ConversableAgent(
    name="Coder",                       # 名字
    system_message="你是资深程序员。收到需求就写代码,只输出代码。",  # 人设
    llm_config=llm_config,              # LLM 配置
    human_input_mode="NEVER",           # 不向真人求助(全自动)
)
\`\`\`

\`human_input_mode\` 三个值:\`NEVER\`(全自动)、\`TERMINATE\`(结束时问人)、\`ALWAYS\`(每轮都问人)。生产常用 NEVER 或 TERMINATE。

### 55.3 GroupChat:多 Agent 群聊

多个 Agent 一起讨论,需要一个"群聊"容器和一个"群主"管理发言顺序。

\`\`\`python
# 创建多个 Agent
coder = autogen.ConversableAgent(name="Coder", system_message="...", llm_config=llm_config)
reviewer = autogen.ConversableAgent(name="Reviewer", system_message="你是严格的审查员,检查代码 bug", llm_config=llm_config)

# 建群聊
groupchat = autogen.GroupChat(
    agents=[coder, reviewer],     # 参与者
    messages=[],                  # 消息历史
    max_round=6,                  # 最多对话 6 轮,防无限聊
)

# 群主:管理谁该发言
manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config,
)
\`\`\`

### 55.4 对话模式:轮次发言 vs 自由发言

\`\`\`python
# 模式一:自动选择发言者(群主根据内容决定谁接话,最灵活)
groupchat = autogen.GroupChat(agents=[...], messages=[], max_round=6)

# 模式二:固定轮次(指定发言顺序,更可控)
def fixed_speaker(last_speaker, groupchat):
    """让 coder 和 reviewer 严格轮流发言。"""
    speakers = groupchat.agents
    idx = speakers.index(last_speaker)
    return speakers[(idx + 1) % len(speakers)]

groupchat = autogen.GroupChat(
    agents=[coder, reviewer],
    messages=[],
    max_round=6,
    speaker_selection_method=fixed_speaker,   # 自定义发言规则
)
\`\`\`

### 55.5 Agent 终止判断

不限制的话 Agent 会无限聊下去。终止靠两点:

1. **max_round**:群聊最大轮数(硬上限);
2. **is_termination_msg**:某条消息触发终止(软终止)。

\`\`\`python
# 当某 Agent 输出包含 "APPROVED" 时终止对话
reviewer = autogen.ConversableAgent(
    name="Reviewer",
    system_message="审查通过就回复 'APPROVED',有问题就指出。",
    llm_config=llm_config,
    is_termination_msg=lambda msg: "APPROVED" in msg.get("content", ""),
)
\`\`\`

### 55.6 实战:Coder + Reviewer 讨论

需求:写一个二分查找函数,Reviewer 审查,通过则结束。

\`\`\`python
import autogen

llm_config = {"model": "gpt-4o-mini"}

# Coder:写代码
coder = autogen.ConversableAgent(
    name="Coder",
    system_message="""你是资深 Python 程序员。
收到需求就写代码,只输出代码块。如果被指出 bug 就修改重发。""",
    llm_config=llm_config,
)

# Reviewer:审查,通过说 APPROVED
reviewer = autogen.ConversableAgent(
    name="Reviewer",
    system_message="""你是严格的代码审查员。
检查代码的正确性、边界情况。
没问题就只回复 'APPROVED'。
有问题就指出并要求重写。""",
    llm_config=llm_config,
    is_termination_msg=lambda msg: "APPROVED" in msg.get("content", ""),
)

# 群聊
groupchat = autogen.GroupChat(
    agents=[coder, reviewer],
    messages=[],
    max_round=6,
)
manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)

# 开始:用 user_proxy 发起
user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=0,
)
user_proxy.initiate_chat(
    manager,
    message="写一个 Python 二分查找函数,要求处理空列表和找不到的情况。",
)
\`\`\`

**典型对话过程:**

\`\`\`text
User: 写一个二分查找函数...
Coder: def binary_search(arr, target): ...
Reviewer: 没处理 arr 为 None 的情况,请加检查。
Coder: def binary_search(arr, target): if arr is None: return -1 ...
Reviewer: APPROVED
(对话终止)
\`\`\`

### 55.7 AutoGen vs CrewAI

| 维度 | AutoGen | CrewAI |
| --- | --- | --- |
| 协作方式 | 对话讨论 | 角色任务流水线 |
| 控制粒度 | 轮次/发言选择 | 任务顺序 |
| 终止机制 | max_round + 终止消息 | 任务列表跑完 |
| 适合场景 | 需讨论/迭代/审查 | 流程固定的产出 |
| 涌现性 | 高(自由讨论) | 低(按剧本) |
| 可预测性 | 中 | 高 |

### 55.8 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 不设 max_round | 无限对话烧钱 | 设硬上限 |
| 没有终止消息 | 即使完成也不停 | is_termination_msg |
| 所有 Agent 全自动且人设模糊 | 无意义互相附和 | 明确对立角色(写/审) |
| 群主模型太弱 | 发言分配混乱 | 群主用较强模型 |
| 消息太长全量传 | token 爆炸 | 精简历史/压缩 |

> **本章小结**:AutoGen 用"群聊"组织多 Agent,通过对话讨论解决问题。关键是 \`ConversableAgent\` + \`GroupChat\` + \`GroupChatManager\` 三件套,配合 max_round 和终止消息控制结束。下一章我们做一个完整的多 Agent 研究助手。`,
  },

  // =============================================================
  // 第五十六章:实战:多 Agent 研究助手
  // =============================================================
  {
    id: 'multi-practice',
    group: '多 Agent 协作',
    icon: '🔬',
    title: '实战:多 Agent 研究助手',
    content: `## 第五十六章　实战:多 Agent 研究助手

本章把前面讲的架构和 LangGraph 落地成一个完整项目:**给定主题 → 搜索 Agent 收集资料 → 分析 Agent 提炼要点 → 写作 Agent 起草 → 审校 Agent 检查 → 输出报告**。

### 56.1 系统设计

四个角色分工:

\`\`\`text
搜索 Agent ──资料──> 分析 Agent ──要点──> 写作 Agent ──初稿──> 审校 Agent ──终稿──> 输出
(找资料)         (提炼)         (起草)         (检查)
\`\`\`

每个 Agent 有专属 prompt 和工具,通过共享 State 传递中间产物。

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END

class ResearchState(TypedDict):
    topic: str              # 研究主题
    raw_materials: list    # 搜索 Agent 产出:原始资料
    key_points: list       # 分析 Agent 产出:要点
    draft: str             # 写作 Agent 产出:初稿
    final_report: str      # 审校 Agent 产出:终稿
    review_passed: bool     # 审校是否通过
    retry_count: int        # 重试次数(防无限循环)
\`\`\`

### 56.2 各 Agent 的角色与 prompt

\`\`\`python
SEARCH_PROMPT = """你是资料搜索员。
任务:围绕主题 {topic} 找 3-5 条高质量资料。
输出 JSON 数组,每条含 title 和 content 字段。"""

ANALYZE_PROMPT = """你是资料分析师。
任务:从原始资料中提炼 3-5 个关键要点。
要求:每个要点一句结论 + 一句依据。"""

WRITE_PROMPT = """你是技术报告作家。
任务:基于要点写一份 600 字报告,含摘要、正文、结论。
风格:专业、简洁、面向管理层。"""

REVIEW_PROMPT = """你是严格的审校编辑。
任务:检查报告的事实、逻辑、错别字、结构。
通过就回复 'PASS' 并附终稿;不通过就回复 'FAIL' 并列出问题。"""
\`\`\`

### 56.3 节点实现与数据流

\`\`\`python
import json

def search_agent(state: ResearchState) -> dict:
    """搜索 Agent:调用搜索工具收集资料。"""
    # 实际项目里这里调 search_tool / web_search
    materials = [
        {"title": f"{state['topic']}概述", "content": "..."},
        {"title": f"{state['topic']}趋势", "content": "..."},
    ]
    return {"raw_materials": materials}

def analyze_agent(state: ResearchState) -> dict:
    """分析 Agent:提炼要点。"""
    # 把原始资料喂给 LLM 提炼
    prompt = ANALYZE_PROMPT.format(topic=state["topic"])
    # 模拟 LLM 输出
    points = [
        "市场年增长 30%,AI Agent 是核心驱动力。",
        "头部厂商集中在工具调用与记忆能力。",
        "垂直行业落地是下一波机会。",
    ]
    return {"key_points": points}

def write_agent(state: ResearchState) -> dict:
    """写作 Agent:起草报告。"""
    points = "\\n".join(f"- {p}" for p in state["key_points"])
    draft = f"""# {state['topic']} 研究报告

## 摘要
本报告分析了 {state['topic']} 的现状与机会。

## 关键要点
{points}

## 结论
{state['topic']} 处于快速增长期,建议重点关注垂直落地。
"""
    return {"draft": draft}

def review_agent(state: ResearchState) -> dict:
    """审校 Agent:检查并产出终稿。"""
    draft = state["draft"]
    # 模拟审查:如果 draft 超过 50 字就算通过
    passed = len(draft) > 50
    # 通过则输出终稿(可能做了小幅润色)
    final = draft.replace("研究", "深度研究") if passed else ""
    return {"final_report": final, "review_passed": passed, "retry_count": state.get("retry_count", 0) + 1}

def route_review(state: ResearchState) -> str:
    """审校不通过且未超次数则回写作 Agent 重写。"""
    if state["review_passed"]:
        return "end"
    if state["retry_count"] >= 2:   # 最多重试 2 次
        return "end"   # 超次数也结束(用最后的初稿)
    return "rewrite"
\`\`\`

### 56.4 组装图

\`\`\`python
gb = StateGraph(ResearchState)
gb.add_node("search", search_agent)
gb.add_node("analyze", analyze_agent)
gb.add_node("write", write_agent)
gb.add_node("review", review_agent)

gb.add_edge(START, "search")
gb.add_edge("search", "analyze")
gb.add_edge("analyze", "write")
gb.add_edge("write", "review")
# 审校后条件路由:通过或超次数→结束;否则回到 write 重写
gb.add_conditional_edges("review", route_review, {
    "rewrite": "write",
    "end": END,
})

app = gb.compile()

# 运行
result = app.invoke({"topic": "AI Agent"})
print(result["final_report"])
\`\`\`

### 56.5 错误处理与重试

搜索失败、LLM 超时是常态。在节点里加 try/except:

\`\`\`python
def search_agent(state: ResearchState) -> dict:
    """带重试的搜索节点。"""
    for attempt in range(3):
        try:
            materials = call_search_api(state["topic"])
            if materials:
                return {"raw_materials": materials}
        except Exception as e:
            print(f"搜索第 {attempt+1} 次失败:{e}")
    # 全失败则给空,后续节点可降级处理
    return {"raw_materials": []}
\`\`\`

### 56.6 结果聚合

如果想让搜索 Agent 并行查多个来源再合并,用 Map-Reduce:

\`\`\`python
from langgraph.constants import Send

def fanout_search(state) -> list:
    """对多个来源并行搜索。"""
    sources = ["web", "news", "paper"]
    return [Send("do_search", {"topic": state["topic"], "source": s}) for s in sources]

def do_search(state) -> dict:
    return {"raw_materials": search(state["topic"], state["source"])}

# raw_materials 用 Annotated[list, add] 自动累加合并
\`\`\`

### 56.7 改进方向

| 改进 | 做法 | 收益 |
| --- | --- | --- |
| **并行** | 多来源搜索用 Send 扇出 | 速度提升 |
| **人工介入** | review 后加 interrupt | 关键报告人工把关 |
| **质量评估** | 加一个 scorer Agent 打分 | 量化报告质量 |
| **缓存** | 相同主题结果缓存 | 省钱省时 |
| **引用溯源** | 资料带 URL,报告标注来源 | 提高可信度 |

### 56.8 完整流程回顾

\`\`\`text
[输入主题]
    ↓
搜索 Agent(找资料,带重试)─失败重试3次─┐
    ↓(raw_materials)                       │
分析 Agent(提炼要点)                       │
    ↓(key_points)                           │
写作 Agent(起草)                          │
    ↓(draft)                               │
审校 Agent(检查)──不通过──> 回写作重写 ──┘
    ↓(pass)
[输出终稿]
\`\`\`

### 56.9 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 搜索失败不兜底 | 整条流程崩 | try/except + 降级空值 |
| 审校无重试上限 | 无限重写烧钱 | retry_count 上限 |
| 各 Agent 共用一个大 prompt | 角色混搭 | 每个独立 system prompt |
| 要点太多塞进写作 | draft 过长 | 限制要点数 3-5 |
| 终稿没带来源 | 可信度低 | 资料带 URL,报告引用 |

> **本章小结**:多 Agent 研究助手用 LangGraph 把"搜索→分析→写作→审校"串成带重试和回环的图。关键是每个 Agent 专属 prompt 和工具、通过共享 State 传递产物、审校不通过可回环重写。到这里多 Agent 协作部分结束,下一批进入实战项目。`,
  },
];
