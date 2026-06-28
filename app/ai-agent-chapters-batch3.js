// =============================================================
// AI Agent开发实战 - 第三批章节(第三部分,共 4 章)
// =============================================================

const chapters = [
  {
    id: 'a-ch09',
    group: '第三部分 主流Agent框架',
    icon: '🔗',
    title: 'LangChain入门——构建Chain与Agent',
    content: `## 第九章　LangChain入门——构建Chain与Agent

### 9.1 LangChain 是什么

LangChain 是目前最具影响力的 LLM 应用开发框架之一,由 Harrison Chase 在 2022 年底开源。它的核心理念是:**把"大模型 + 数据 + 工具 + 记忆"组装成可复用、可编排的组件**,让开发者像搭积木一样构建复杂的 AI 应用。

LangChain 解决了一个关键痛点:直接调用 OpenAI API 写应用,代码很快就会变成"面条式"的——Prompt、解析、重试、工具调用、上下文记忆全部耦合在一起。LangChain 把这些环节抽象成独立组件,通过统一的接口组合起来。

> **核心理念**:Chain(链)是 LangChain 的灵魂——把"输入处理 → 模型调用 → 输出解析"这一流程标准化,任何环节都可以替换、组合、嵌套。

### 9.2 五大核心概念

LangChain 的世界观由五个核心概念支撑,理解它们就掌握了 80% 的内容。

**1. Model(模型)**
统一的模型抽象层,屏蔽不同厂商差异:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# 同一接口,不同后端
llm_openai = ChatOpenAI(model='gpt-4o', temperature=0)
llm_claude = ChatAnthropic(model='claude-3-5-sonnet-20241022')

# 切换模型,业务代码无需改动
llm = llm_openai
response = llm.invoke('用一句话解释什么是 Agent')
\`\`\`

**2. Prompt(提示词)**
PromptTemplate 把变量插值与模板管理统一起来,支持部分插值和组合:

\`\`\`python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ('system', '你是一名{role},回答风格要{style}。'),
    ('user', '{question}'),
])

# 部分插值:先固定 system 角色,后续再填 user
partial = prompt.partial(role='Python 老师', style='幽默')
chain = partial | llm
\`\`\`

**3. Chain(链)**
链是把多个组件串联起来的执行单元。在 LangChain 0.1+ 时代,链的实现统一为 LCEL 表达式语言(下节详述)。

**4. Memory(记忆)**
Memory 负责跨轮次保存对话上下文。常用实现:
- \`ConversationBufferMemory\`:保存全部历史,简单但 token 膨胀快
- \`ConversationBufferWindowMemory\`:只保留最近 k 轮
- \`ConversationSummaryMemory\`:用模型把历史压缩成摘要
- \`VectorStoreRetrieverMemory\`:把历史向量化,按需检索

**5. Tool(工具)**
Tool 是 Agent 调用外部能力的统一抽象,任何函数都能被包装成 Tool:

\`\`\`python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询指定城市的实时天气。

    Args:
        city: 城市中文名,例如"北京"
    """
    # 实际接入天气 API
    return f'{city}今天晴,气温 22℃'

# Tool 自带 schema,模型可识别参数
print(get_weather.name)        # get_weather
print(get_weather.description) # 查询指定城市的实时天气...
\`\`\`

### 9.3 LCEL 表达式语言

LCEL(LangChain Expression Language)是 LangChain 推荐的链式语法,用管道符 \`|\` 把组件串联起来。它的优势在于:

- **流式输出**原生支持,无需额外改造
- **异步/同步**同一份代码两种调用方式
- **批处理**通过 \`batch\` 自动并行
- **回退机制**用 \`.with_fallbacks()\` 配置降级

下面是一个典型的 LCEL 链:

\`\`\`python
from langchain_core.output_parsers import StrOutputParser

# 经典 RAG 三段式链
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 同步调用
answer = chain.invoke('LangChain 的作者是谁?')

# 流式输出
for chunk in chain.stream('详细介绍 LangChain'):
    print(chunk, end='', flush=True)

# 批处理
answers = chain.batch([
    '什么是 LCEL?',
    'Memory 有哪些类型?',
    '如何自定义 Tool?'
])
\`\`\`

> **LCEL 的本质**:每个组件都实现 \`Runnable\` 接口(\`invoke\`/\`stream\`/\`batch\`/\`ainvoke\`),管道符 \`|\` 把上一个 Runnable 的输出作为下一个的输入。这种"约定大于配置"的设计让组件可任意组合。

### 9.4 构建第一个 Agent

把 LLM 升级为"会主动调用工具的决策者",就得到了 Agent。Agent 的运行循环是:**接收任务 → 思考是否需要工具 → 调用工具 → 观察结果 → 继续思考 → 给出最终答案**。

\`\`\`python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.tools import tool

@tool
def add(a: float, b: float) -> float:
    """两个数相加,返回和。"""
    return a + b

@tool
def multiply(a: float, b: float) -> float:
    """两个数相乘,返回积。"""
    return a * b

tools = [add, multiply]

# Agent 提示词模板
prompt = ChatPromptTemplate.from_messages([
    ('system', '你是一个会使用工具的数学助手。'),
    ('placeholder', '{chat_history}'),
    ('user', '{input}'),
    ('placeholder', '{agent_scratchpad}'),
])

llm = ChatOpenAI(model='gpt-4o', temperature=0)
agent = create_tool_calling_agent(llm, tools, prompt)

# AgentExecutor 负责驱动 Agent 循环
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({
    'input': '先计算 12 加 8,再把结果乘以 3,告诉我最终答案。'
})
print(result['output'])
\`\`\`

运行时,你会看到 Agent 先调用 \`add(12, 8)\` 得到 20,再调用 \`multiply(20, 3)\` 得到 60,最后输出"最终答案是 60"。这就是经典的 **ReAct(Reasoning + Acting)** 模式。

### 9.5 AgentExecutor 详解

\`AgentExecutor\` 是 Agent 的"驱动引擎",核心参数:

- \`max_iterations\`:最大循环次数,防止 Agent 失控(默认 15)
- \`early_stopping_method\`:超限后的兜底策略(\`generate\` 让模型强行收尾,或 \`force\` 直接报错)
- \`handle_parsing_errors\`:模型输出格式错误时的回调,避免直接崩溃
- \`return_intermediate_steps\`:是否返回中间步骤,调试时很有用

\`\`\`python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10,
    handle_parsing_errors=True,
    return_intermediate_steps=True,
)
\`\`\`

### 9.6 实战要点

1. **工具描述决定能力边界**:模型靠 description 决定何时调用哪个工具,描述要清晰、有边界、含示例。
2. **限制迭代次数**:Agent 极易陷入"调用→失败→再调用"的死循环,务必设置 \`max_iterations\`。
3. **错误必须兜底**:工具调用失败时,AgentExecutor 会把错误信息回传给模型让它重试,要避免敏感信息泄露。
4. **优先用 \`create_tool_calling_agent\`**:它依赖模型原生 function calling,比旧的 ReAct 文本解析更稳定。
5. **生产环境慎用 verbose**:verbose 输出包含完整 prompt,可能泄露用户数据,日志要做脱敏。

### 9.7 小结

LangChain 的价值不在"封装 OpenAI API",而在于提供了一套**可组合、可替换、可观察**的组件体系。LCEL 让链式调用变得优雅,AgentExecutor 让"工具循环"变得可控。掌握这一章,你就拥有了构建复杂 LLM 应用的"标准零件库"。
`,
  },
  {
    id: 'a-ch10',
    group: '第三部分 主流Agent框架',
    icon: '🦙',
    title: 'LlamaIndex——数据驱动的Agent框架',
    content: `## 第十章　LlamaIndex——数据驱动的Agent框架

### 10.1 LlamaIndex 的定位

如果说 LangChain 是"通用 LLM 应用框架",那么 LlamaIndex 就是"数据驱动的 RAG 框架"。它由 Jerry Liu 创建,最初叫 \`gpt-index\`,核心目标是:**让私有数据与 LLM 高效对接**。

LlamaIndex 的设计哲学是:在大多数企业场景中,LLM 的瓶颈不是模型能力,而是**如何把企业内部文档、数据库、API 数据高质量地喂给模型**。它围绕"数据摄入 → 索引 → 查询"这条主线,提供了完整工具链。

> **核心差异**:LangChain 强调"流程编排",LlamaIndex 强调"数据管道"。两者并非互斥,LlamaIndex 的检索组件甚至可以作为 LangChain 的 Retriever 使用。

### 10.2 LlamaIndex vs LangChain

| 维度 | LangChain | LlamaIndex |
| --- | --- | --- |
| 核心抽象 | Chain / Agent / Runnable | Index / QueryEngine / Retriever |
| 强项 | 流程编排、工具调用 | 数据摄入、索引结构、检索质量 |
| 文档处理 | 基础 splitter | 内置多种高级 parser(PDF/HTML/Markdown) |
| Agent 能力 | 成熟、生态广 | 较新、聚焦数据 Agent |
| 适用场景 | 通用对话、工具型 Agent | 知识库问答、文档分析 |

**选择建议**:
- 需要复杂工具编排、多步骤决策 → LangChain
- 核心需求是"基于文档回答问题" → LlamaIndex
- 两者都需要的复杂系统 → 用 LlamaIndex 做检索,LangChain 做编排

### 10.3 三大核心抽象

#### 10.3.1 数据连接器(DataConnector)

\`SimpleDirectoryReader\` 是最常用的入口,支持 PDF、Word、Markdown、HTML 等几十种格式:

\`\`\`python
from llama_index.core import SimpleDirectoryReader

# 一行代码加载整个目录
documents = SimpleDirectoryReader('./docs').load_data()
print(f'加载 {len(documents)} 个文档片段')
\`\`\`

对于复杂 PDF(表格、图片),用 \`LlamaParse\` 服务能拿到结构化结果,质量远超朴素解析。

#### 10.3.2 索引(Index)

索引是 LlamaIndex 的核心数据结构,常见的有四种:

- **VectorStoreIndex**:语义检索,用 embedding 找相似片段
- **SummaryIndex**:把所有节点串成链,适合"整体摘要"类查询
- **KnowledgeGraphIndex**:构建知识图谱,支持多跳推理
- **TreeIndex**:层级树状索引,适合长文档逐层压缩

\`\`\`python
from llama_index.core import VectorStoreIndex

# 从文档构建向量索引
index = VectorStoreIndex.from_documents(documents)

# 持久化到磁盘
index.storage_context.persist(persist_dir='./storage')

# 重新加载
from llama_index.core import load_index_from_storage
from llama_index.core import StorageContext
storage_context = StorageContext.from_defaults(persist_dir='./storage')
index = load_index_from_storage(storage_context)
\`\`\`

#### 10.3.3 查询引擎(QueryEngine)

QueryEngine 把"检索 + 拼 Prompt + 调模型 + 解析输出"封装为一次调用:

\`\`\`python
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query('公司的差旅报销标准是什么?')
print(response.response)

# 查看检索到的源文档
for node in response.source_nodes:
    print(node.node.text[:80], '| score:', node.score)
\`\`\`

### 10.4 构建 RAG Agent

把 QueryEngine 升级为"会主动决策的 Agent",就是 LlamaIndex 的 Agent 形态。下面是一个完整的 RAG Agent,它能根据问题决定是否需要查文档、查哪个文档:

\`\`\`python
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.llms.openai import OpenAI

# 分别针对"产品手册"和"HR 制度"建两个索引
product_index = VectorStoreIndex.from_documents(product_docs)
hr_index = VectorStoreIndex.from_documents(hr_docs)

# 把每个 QueryEngine 包装成 Tool
tools = [
    QueryEngineTool(
        query_engine=product_index.as_query_engine(),
        metadata=ToolMetadata(
            name='product_manual',
            description='查询产品使用手册、功能说明、故障排查。'
        ),
    ),
    QueryEngineTool(
        query_engine=hr_index.as_query_engine(),
        metadata=ToolMetadata(
            name='hr_policy',
            description='查询 HR 制度、请假、报销、考勤等。'
        ),
    ),
]

llm = OpenAI(model='gpt-4o', temperature=0)
agent = ReActAgent.from_tools(tools, llm=llm, verbose=True)

# Agent 会自动判断该用哪个工具
answer = agent.chat('我想报销差旅费,需要哪些材料?')
print(answer.response)
\`\`\`

运行时,Agent 会先思考"这是 HR 问题",调用 \`hr_policy\` 工具检索,再用检索结果生成答案。这就是 **Agentic RAG**——把 RAG 从"无脑向量检索"升级为"会判断、会选择"的智能体。

### 10.5 高级技巧:查询变换

直接用原始问题做检索,效果往往不佳。LlamaIndex 提供了一系列查询变换器,显著提升检索质量:

- **SubQuestionQueryEngine**:把复杂问题拆成多个子问题,分别检索再合并
- **HyDE(Hypothetical Document Embeddings)**:先让模型生成"假设答案",再用它做检索
- **MultiQuery**:让模型从多个角度重写问题,提高召回

\`\`\`python
from llama_index.core.query_engine import SubQuestionQueryEngine

# 把"对比 A 和 B 产品的优缺点"拆成两个子问题
sub_engine = SubQuestionQueryEngine.from_defaults(query_engine_tools=tools)
response = sub_engine.query('对比产品 A 和产品 B 的性能差异')
\`\`\`

### 10.6 实战要点

1. **Chunk Size 是关键参数**:chunk 太小丢失上下文,太大稀释语义。经验值 256-512 token,overlap 10%-20%。
2. **不要迷信 top_k**:k 越大召回越多但噪音也多,配合 reranker(如 Cohere Rerank)效果更好。
3. **评估必须做**:用 \`ragas\` 或 LlamaIndex 自带的 \`FaithfulnessEvaluator\` 量化 RAG 质量,不要凭感觉。
4. **Metadata 过滤提效**:给文档打标签(部门、时间、版本),查询时用 metadata filter 缩小检索范围。
5. **Streaming 必备**:RAG 响应通常较长,流式输出显著改善体验:\`query_engine.query(...).response_gen\`。

### 10.7 小结

LlamaIndex 把"让 LLM 读懂你的数据"这件事做到了极致。它的索引结构、查询变换、文档解析能力,是构建生产级 RAG 系统的利器。把它和 LangChain 的编排能力结合,基本能覆盖 90% 的企业 LLM 应用场景。
`,
  },
  {
    id: 'a-ch11',
    group: '第三部分 主流Agent框架',
    icon: '🤖',
    title: '开源Agent项目分析——AutoGPT、BabyAGI、MetaGPT',
    content: `## 第十一章　开源Agent项目分析——AutoGPT、BabyAGI、MetaGPT

### 11.1 为什么研究开源项目

理论书籍讲 Agent,容易停留在"工具调用循环"的抽象层面。而真正理解 Agent 的工程价值,必须看那些**已经跑在 GitHub 上、被数万人尝试过的开源项目**。本章分析三个里程碑式项目:AutoGPT、BabyAGI、MetaGPT。它们分别代表了 Agent 的三种范式:**自主目标驱动**、**任务清单驱动**、**多角色协作**。

### 11.2 AutoGPT:目标驱动的自主 Agent

AutoGPT 由 Significant Gravitas 在 2023 年 3 月发布,一度引爆全网。它的核心理念是:**用户只给一个高层目标,Agent 自主规划、行动、反思,直到完成目标**。

#### 11.2.1 核心循环:思考-行动-观察

AutoGPT 的执行循环可以概括为:

\`\`\`
1. 思考(Thoughts):基于当前状态推理下一步该做什么
2. 推理(Reasoning):解释为什么这么做
3. 计划(Plan):列出后续几步
4. 批评(Criticism):自我质疑,发现风险
5. 行动(Action):调用工具(搜索、写文件、执行代码)
6. 观察(Observation):读取工具返回结果
7. 回到 1,直到任务完成或达到迭代上限
\`\`\`

这个循环就是经典的 **Reasoning + Acting + Observation**,ReAct 的工程化实现。

#### 11.2.2 架构分析

AutoGPT 的核心模块:

- **Agent Server**:主循环驱动,负责调度思考与行动
- **Workspace**:文件系统工作区,Agent 读写文件的地方
- **Plugins**:工具插件,如 web 搜索、网页抓取、代码执行
- **Memory**:基于 Pinecone/Redis 的长期向量记忆
- **JSON 指令协议**:Agent 输出结构化 JSON,框架解析后执行

\`\`\`python
# AutoGPT 的 Prompt 协议(简化版)
INSTRUCTION = """
You are AutoGPT, an AI assistant optimizing toward a goal.
Respond STRICTLY with JSON:
{
  "thoughts": {
    "text": "思考内容",
    "reasoning": "推理过程",
    "plan": ["步骤1", "步骤2"],
    "criticism": "自我批评"
  },
  "command": {
    "name": "google_search",
    "args": {"query": "搜索词"}
  }
}
"""
\`\`\`

#### 11.2.3 启发与局限

**启发**:
- **结构化输出**让 Agent 行为可解析、可中断、可恢复
- **长期记忆**让 Agent 能跨越长任务保留上下文
- **工作区文件**是 Agent 的"外部大脑",缓解上下文窗口限制

**局限**:
- **容易跑偏**:目标模糊时,Agent 会无限发散,典型表现是"在网上乱搜一通"
- **成本失控**:每轮都要带长 prompt + 历史,token 消耗惊人
- **难以终止**:何时算"完成"很难定义,经常卡在循环里
- **可靠性差**:JSON 解析失败、工具调用报错频繁

> AutoGPT 的最大贡献不是产品本身,而是它**证明了"LLM + 工具 + 循环"可以完成非平凡任务**,点燃了整个 Agent 赛道。

### 11.3 BabyAGI:任务清单驱动的极简 Agent

BabyAGI 由 Yohei Nakajima(AutoGPT 同一作者)发布,是 AutoGPT 的"瘦身版"。它只有几百行代码,却把 Agent 的核心机制讲得最清楚。

#### 11.3.1 三个核心 Agent

BabyAGI 由三个协作的 Agent 组成:

- **Creation Agent**:根据目标和上一步结果,创建新任务
- **Prioritization Agent**:对任务清单重新排序
- **Execution Agent**:执行队列头部任务,返回结果

#### 11.3.2 执行循环

\`\`\`python
# BabyAGI 核心循环(简化伪代码)
def run(goal):
    task_list = [Task(description=goal)]
    while task_list:
        # 1. 取出最高优先级任务
        task = task_list.pop(0)
        # 2. 执行任务
        result = execution_agent(task, context)
        # 3. 根据结果创建新任务
        new_tasks = creation_agent(goal, result, task_list)
        # 4. 重新排序任务清单
        task_list = prioritization_agent(task_list + new_tasks)
        # 5. 保存结果到向量库
        memory.add(result)
\`\`\`

#### 11.3.3 启发

BabyAGI 的精妙在于它揭示了 Agent 的本质:**用 LLM 把"任务管理"本身自动化**。传统软件的 TODO 列表是人写的,BabyAGI 让模型自己创建、排序、执行任务。

这种模式特别适合"目标明确但路径未知"的场景,如:
- 学术综述:目标是写一篇综述,子任务是"读某篇论文""总结某个方向"
- 市场调研:目标是出一份报告,子任务是"查某个公司财报""分析某个细分市场"

### 11.4 MetaGPT:多角色协作的软件团队

MetaGPT 由 DeepWisdom 团队开源,核心创新是:**把软件开发流程(产品经理→架构师→工程师→QA)用多个 Agent 角色模拟出来**,让一群 Agent 协作完成一个软件项目。

#### 11.4.1 角色与 SOP

MetaGPT 借鉴人类软件公司的 SOP(标准作业流程):

- **ProductManager(产品经理)**:把模糊需求转成 PRD(产品需求文档)
- **Architect(架构师)**:基于 PRD 设计系统架构、技术选型
- **ProjectManager(项目经理)**:拆分任务、分配给工程师
- **Engineer(工程师)**:按设计写代码
- **QAEngineer(测试工程师)**:写测试用例、验证代码

每个角色有专属 prompt 和产出物格式,角色之间通过"文档"传递信息,而非裸对话。

#### 11.4.2 消息机制

MetaGPT 用 **Environment + Message Queue** 实现角色通信:

\`\`\`python
# 简化的 MetaGPT 角色协作
from metagpt.roles import ProductManager, Architect, Engineer, QAEngineer
from metagpt.team import Team

team = Team()
team.hire([
    ProductManager(),
    Architect(),
    ProjectManager(),
    Engineer(),
    QAEngineer(),
])
team.invest('写一个贪吃蛇游戏')
team.run()
\`\`\`

运行后,产品经理会先输出 PRD,架构师看到 PRD 后输出设计文档,工程师根据设计写代码,QA 写测试。整个过程高度结构化,产出物接近真实项目。

#### 11.4.3 启发与局限

**启发**:
- **SOP 比自由协作更可靠**:结构化的角色和流程显著提升输出质量
- **文档驱动**比"裸对话"更适合复杂任务,文档是知识的稳定载体
- **多 Agent 角色分工**能模拟出超越单 Agent 的复杂行为

**局限**:
- **成本高**:一次任务多个角色多轮调用,token 消耗大
- **依赖模型强**:GPT-4 才能稳定输出结构化文档,弱模型容易塌方
- **场景受限**:适合"流程化"任务,创意性任务收益不明显

### 11.5 三个项目的对比与启示

| 项目 | 范式 | 适合场景 | 核心贡献 |
| --- | --- | --- | --- |
| AutoGPT | 自主目标驱动 | 开放式探索 | 结构化输出协议 |
| BabyAGI | 任务清单驱动 | 目标明确的分步任务 | 任务自动生成与排序 |
| MetaGPT | 多角色协作 | 流程化生产任务 | SOP + 文档驱动 |

**对开发者的启示**:
1. **不要追求"全自主"**:AutoGPT 式的全自主 Agent 在生产环境几乎不可用,要做"半自主"——人定义边界,Agent 在边界内自主。
2. **结构化输出是生命线**:所有可靠 Agent 系统都依赖结构化协议(JSON/Function Calling),不要让 Agent 输出自由文本。
3. **任务分解胜过单次推理**:把复杂任务拆成小步骤,BabyAGI 的"任务清单"模式比"一把梭"更可靠。
4. **角色协作能放大能力**:MetaGPT 证明,多个有明确职责的 Agent 协作,效果常常优于单个"全能 Agent"。

### 11.6 小结

这三个开源项目是 Agent 工程的"活教材"。AutoGPT 教会我们结构化输出,BabyGPT 教会我们任务分解,MetaGPT 教会我们角色协作。理解它们的原理与局限,你就能在自己的项目里取其精华、避其坑点。
`,
  },
  {
    id: 'a-ch12',
    group: '第三部分 主流Agent框架',
    icon: '🛠️',
    title: 'OpenAI Assistants API详解',
    content: `## 第十二章　OpenAI Assistants API详解

### 12.1 Assistants API 的定位

2023 年 11 月,OpenAI 在 DevDay 上发布 Assistants API,它的目标是:**让开发者不用自己搭建"Agent 基础设施",就能快速得到一个有记忆、能用工具的 Agent**。

在 Assistants API 出现前,自建一个 Agent 需要自己实现:对话上下文管理、工具调用解析、代码沙箱、文件检索、状态持久化……这些工作量大且容易出错。Assistants API 把这些能力封装成托管服务,开发者只需关心业务逻辑。

> **核心价值**:把 Agent 的"基础设施"托管化,开发者专注业务。代价是必须绑定 OpenAI 生态,且对底层控制力减弱。

### 12.2 四个核心对象

Assistants API 的世界观由四个对象组成,理解它们的关系就掌握了全部:

**1. Assistant(助手)**
代表一个"配置好的 Agent 人格",包含模型、指令、工具配置。Assistant 是无状态的,创建后可被多个 Thread 复用。

\`\`\`python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
    name='数学辅导老师',
    instructions='你是一名耐心的数学老师,讲解要分步骤,优先用代码演示。',
    model='gpt-4o',
    tools=[{'type': 'code_interpreter'}],
)
print(assistant.id)  # asst_xxx
\`\`\`

**2. Thread(会话)**
代表一次会话的上下文,管理消息历史。每个用户、每段对话都应有独立 Thread。

\`\`\`python
thread = client.beta.threads.create()
print(thread.id)  # thread_xxx
\`\`\`

**3. Message(消息)**
会话中的单条消息,有 \`user\` / \`assistant\` 两种角色。可以包含文本、图片、文件。

\`\`\`python
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role='user',
    content='帮我计算斐波那契数列前 20 项的和。',
)
\`\`\`

**4. Run(运行)**
触发 Assistant 在某个 Thread 上"运行",这是真正调用模型的动作。Run 是异步的,需要轮询状态。

\`\`\`python
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id,
)

# 轮询直到完成
import time
while run.status in ['queued', 'in_progress']:
    time.sleep(1)
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id,
    )

print(run.status)  # completed
\`\`\`

四者关系:**Assistant(人格) + Thread(上下文) + Message(输入) → Run(执行) → Message(输出)**。

### 12.3 内置三大工具

Assistants API 最大的卖点之一是内置了三个开箱即用的工具,无需自己实现。

#### 12.3.1 Code Interpreter(代码解释器)

让 Agent 能在沙箱里执行 Python 代码,适合数据处理、计算、生成图表:

\`\`\`python
assistant = client.beta.assistants.create(
    name='数据分析助手',
    instructions='你是数据分析师,优先用代码处理数据。',
    model='gpt-4o',
    tools=[{'type': 'code_interpreter'}],
)

# 上传数据文件
file = client.files.create(
    file=open('sales.csv', 'rb'),
    purpose='assistants',
)

# 在消息中附加文件
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role='user',
    content='分析这个 CSV 的销售趋势,画一张折线图。',
    attachments=[{'file_id': file.id, 'tools': [{'type': 'code_interpreter'}]}],
)
\`\`\`

Agent 会自动写 pandas 代码读取文件、清洗、绘图,并把生成的图片作为返回消息发回。

#### 12.3.2 Retrieval(文件检索)

把文件上传给 Assistant,OpenAI 自动做切分、向量化、检索(注:后续已升级为 \`file_search\` 工具):

\`\`\`python
assistant = client.beta.assistants.create(
    name='知识库助手',
    model='gpt-4o',
    tools=[{'type': 'file_search'}],
)

# 创建向量存储并上传文档
vector_store = client.beta.vector_stores.create(name='company_docs')
client.beta.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id=file.id,
)

assistant = client.beta.assistants.update(
    assistant_id=assistant.id,
    tool_resources={'file_search': {'vector_store_ids': [vector_store.id]}},
)
\`\`\`

查询时,Agent 自动检索相关片段并引用来源,无需手写 RAG 流程。

#### 12.3.3 Function Calling(自定义函数)

当内置工具不够用时,自定义函数让 Agent 调用你的业务 API:

\`\`\`python
assistant = client.beta.assistants.create(
    name='客服助手',
    model='gpt-4o',
    tools=[{
        'type': 'function',
        'function': {
            'name': 'get_order_status',
            'description': '查询订单状态',
            'parameters': {
                'type': 'object',
                'properties': {
                    'order_id': {'type': 'string', 'description': '订单号'}
                },
                'required': ['order_id']
            }
        }
    }],
)
\`\`\`

Run 执行时,如果 Agent 决定调用函数,Run 状态会变成 \`requires_action\`,你需要解析参数、执行函数、把结果回传:

\`\`\`python
if run.status == 'requires_action':
    tool_calls = run.required_action.submit_tool_outputs.tool_calls
    outputs = []
    for call in tool_calls:
        if call.function.name == 'get_order_status':
            args = json.loads(call.function.arguments)
            result = my_backend.get_order(args['order_id'])
            outputs.append({
                'tool_call_id': call.id,
                'output': json.dumps(result),
            })
    # 回传工具结果,让 Run 继续
    run = client.beta.threads.runs.submit_tool_outputs(
        thread_id=thread.id,
        run_id=run.id,
        tool_outputs=outputs,
    )
\`\`\`

### 12.4 流式输出与异步

长任务等待让人焦躁,Assistants API 支持 streaming:

\`\`\`python
from typing_extensions import override
from openai import AssistantEventHandler

class EventHandler(AssistantEventHandler):
    @override
    def on_text_created(self, text):
        print('Assistant: ', end='', flush=True)

    @override
    def on_text_delta(self, delta, snapshot):
        print(delta.value, end='', flush=True)

    @override
    def on_tool_call_created(self, tool_call):
        print(f'\\n调用工具: {tool_call.type}')

with client.beta.threads.runs.stream(
    thread_id=thread.id,
    assistant_id=assistant.id,
    event_handler=EventHandler(),
) as stream:
    stream.until_done()
\`\`\`

### 12.5 完整示例:构建一个数据问答 Agent

下面是一个端到端的例子,综合运用 Code Interpreter 和 Function Calling:

\`\`\`python
import json, time
from openai import OpenAI

client = OpenAI()

# 1. 创建带两类工具的 Assistant
assistant = client.beta.assistants.create(
    name='运营分析助手',
    instructions='你是运营分析师。数值计算用 code_interpreter,查询业务数据用 function。',
    model='gpt-4o',
    tools=[
        {'type': 'code_interpreter'},
        {
            'type': 'function',
            'function': {
                'name': 'query_metrics',
                'description': '查询指定日期的运营指标',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'date': {'type': 'string', 'description': '日期 YYYY-MM-DD'},
                        'metric': {'type': 'string', 'enum': ['dau', 'revenue', 'retention']}
                    },
                    'required': ['date', 'metric']
                }
            }
        }
    ],
)

# 2. 创建会话
thread = client.beta.threads.create()
client.beta.threads.messages.create(
    thread_id=thread.id,
    role='user',
    content='帮我分析最近 7 天的 DAU 趋势,并预测明天。',
)

# 3. 运行并处理工具调用
run = client.beta.threads.runs.create(
    thread_id=thread.id, assistant_id=assistant.id
)

while run.status in ['queued', 'in_progress', 'requires_action']:
    if run.status == 'requires_action':
        outputs = []
        for call in run.required_action.submit_tool_outputs.tool_calls:
            if call.function.name == 'query_metrics':
                args = json.loads(call.function.arguments)
                data = backend.query(args['date'], args['metric'])  # 你的业务逻辑
                outputs.append({
                    'tool_call_id': call.id,
                    'output': json.dumps(data)
                })
        run = client.beta.threads.runs.submit_tool_outputs(
            thread_id=thread.id, run_id=run.id, tool_outputs=outputs
        )
    else:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id, run_id=run.id
        )

# 4. 读取最终答案
messages = client.beta.threads.messages.list(thread_id=thread.id)
print(messages.data[0].content[0].text.value)
\`\`\`

### 12.6 与自建 Agent 的取舍

Assistants API 不是银弹,要不要用,要看场景:

**用 Assistants API 的理由**:
- **快速验证 MVP**:几天就能上线一个有记忆、能用工具的 Agent
- **不想维护基础设施**:沙箱、向量库、状态管理都托管了
- **生态绑定可接受**:你的业务深度依赖 OpenAI 模型

**自建 Agent(LangChain/LlamaIndex)的理由**:
- **多模型支持**:要随时切换 Claude、Gemini、开源模型
- **数据合规要求高**:数据不能出境、需私有化部署
- **深度定制**:需要自定义检索算法、特殊记忆策略
- **成本敏感**:Assistants API 按 token 计费且文件存储有额外费用,大规模场景自建更经济

> **经验法则**:MVP 阶段用 Assistants API 快速验证,生产规模化阶段评估是否自建。两者也可以混用——用 Assistants 做对话,用自建 RAG 做检索,通过 Function Calling 桥接。

### 12.7 实战要点

1. **Thread 要按用户/会话隔离**:不要让多个用户共享一个 Thread,会串话。
2. **Run 一定要轮询超时**:加上最大轮询时间,防止卡死。
3. **文件要清理**:上传的文件、向量存储会持续计费,用完调用 \`delete\`。
4. **instructions 要稳定**:每次更新 Assistant 的 instructions,历史 Run 行为可能不一致。
5. **限流要处理**:Assistants API 有严格的 rate limit,要做指数退避重试。

### 12.8 小结

Assistants API 把 Agent 的"脏活累活"托管化了,是快速构建 Agent 应用的捷径。但它本质是"黑盒基础设施",在多模型、私有化、深度定制场景下,LangChain + LlamaIndex 的自建方案依然不可替代。理解两者的取舍,根据项目阶段和约束灵活选择,才是成熟的工程决策。
`,
  },
];

export { chapters };
