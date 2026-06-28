// =============================================================
// AI Agent开发实战 - 第四批章节(第四部分,共 4 章)
// =============================================================

const chapters = [
  {
    id: 'a-ch13',
    group: '第四部分 Agent核心能力构建',
    icon: '🧰',
    title: '工具使用——让Agent上网、搜索、执行代码',
    content: `## 第十三章　工具使用——让Agent上网、搜索、执行代码

工具（Tool）是 Agent 区别于普通聊天机器人的核心标志。一个没有工具的 LLM 只能依靠训练数据回答问题，而装备了工具的 Agent 则能够"动手"——联网搜索最新信息、操作浏览器、执行代码、调用外部 API，从而完成真实世界的任务。本章将系统讲解 Agent 工具系统的设计原理与落地实现。

### 第一节　工具的本质：函数调用协议

从工程视角看，工具本质上是一个**带描述的函数**。LLM 无法直接执行代码，它只能输出一段结构化的"调用意图"，由 Agent 运行时解析并执行对应的函数，再把结果回传给 LLM。这就是 Function Calling（函数调用）机制。

一个完整的工具调用闭环包含四个步骤：

1. **工具注册**：将工具的名称、描述、参数 schema 注册到 Agent
2. **意图生成**：LLM 根据用户请求，决定是否调用工具，并生成调用参数
3. **工具执行**：Agent 运行时执行对应函数，获取结果
4. **结果回传**：将执行结果作为 observation 反馈给 LLM，进入下一轮

下面是一个最小化的工具定义示例（Python）：

\`\`\`python
from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    """搜索工具的输入参数"""
    query: str = Field(..., description="搜索关键词")
    max_results: int = Field(default=5, description="返回结果数量上限")

def web_search(query: str, max_results: int = 5) -> str:
    """在互联网上搜索信息，返回相关网页摘要。
    适用于需要查询最新新闻、技术文档、产品信息等场景。"""
    # 实际实现会调用搜索 API
    return f"已为'{query}'找到{max_results}条结果..."

# 工具描述会被序列化为 JSON Schema 供 LLM 使用
print(SearchInput.model_json_schema())
\`\`\`

### 第二节　常见工具类型

成熟的 Agent 系统通常配备以下几类工具：

- **搜索类**：SerpAPI、Tavily、Bing Search，用于获取实时信息
- **浏览器类**：Playwright、Puppeteer，用于网页自动化操作
- **代码执行类**：Python REPL、Sandbox、Jupyter，用于计算和数据处理
- **文件操作类**：读写本地文件、目录遍历
- **API 调用类**：调用第三方服务（发邮件、查天气、操作数据库）

工具的设计要兼顾**原子性**与**组合性**——每个工具只做一件事，但能通过 Agent 的编排组合出复杂能力。

### 第三节　搜索工具集成：SerpAPI 与 Tavily

**SerpAPI** 封装了 Google/Bing 等搜索引擎的搜索结果，返回结构化数据：

\`\`\`python
import serpapi

def serpapi_search(query: str) -> str:
    """使用 SerpAPI 进行 Google 搜索"""
    client = serpapi.Client(api_key="YOUR_API_KEY")
    results = client.search(q=query, engine="google")
    # 提取有机结果
    snippets = []
    for item in results.get("organic_results", [])[:5]:
        snippets.append(f"标题: {item['title']}\\n摘要: {item['snippet']}")
    return "\\n\\n".join(snippets)
\`\`\`

**Tavily** 专为 LLM 设计，返回更精炼、更适合模型消化的内容：

\`\`\`python
from tavily import TavilyClient

tavily = TavilyClient(api_key="YOUR_API_KEY")

def tavily_search(query: str) -> str:
    """使用 Tavily 进行 AI 优化搜索，返回高质量摘要"""
    response = tavily.search(
        query=query,
        search_depth="advanced",  # advanced 模式会做内容提取
        max_results=5,
        include_answer=True  # 让 Tavily 直接返回答案
    )
    answer = response.get("answer", "")
    sources = "\\n".join(
        f"- {r['title']}: {r['url']}" for r in response["results"]
    )
    return f"AI 总结: {answer}\\n\\n来源:\\n{sources}"
\`\`\`

> 选型建议：需要原始搜索结果选 SerpAPI；需要 LLM 友好的精炼内容选 Tavily。

### 第四节　Playwright 浏览器自动化

当搜索 API 无法满足时（如需要登录后操作、动态渲染内容），浏览器自动化是终极方案：

\`\`\`python
from playwright.sync_api import sync_playwright

def browser_extract(url: str, selector: str = "article") -> str:
    """打开网页并提取指定元素文本"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")
        # 等待动态内容加载
        page.wait_for_selector(selector, timeout=10000)
        content = page.inner_text(selector)
        browser.close()
        return content[:8000]  # 截断防止超出上下文
\`\`\`

浏览器工具的典型应用场景：抓取需要 JavaScript 渲染的页面、填写表单提交查询、截图记录操作过程。注意浏览器工具**执行时间长、资源消耗大**，应当作为搜索工具的补充而非首选。

### 第五节　Sandbox 代码执行

让 Agent 执行代码风险极高——可能误删文件、泄露密钥、被注入恶意代码。**沙箱（Sandbox）** 是必选项，常用方案：

- **Docker 容器**：隔离文件系统与进程，最通用
- **Pyodide/WASM**：浏览器内运行 Python，天然隔离
- **E2B、Modal 等托管服务**：开箱即用的代码沙箱

下面用 Docker 实现一个最小沙箱：

\`\`\`python
import docker

def run_code_in_sandbox(code: str) -> str:
    """在 Docker 沙箱中执行 Python 代码，限制资源"""
    client = docker.from_env()
    try:
        result = client.containers.run(
            image="python:3.11-slim",
            command=["python", "-c", code],
            mem_limit="128m",        # 内存上限 128MB
            cpu_period=100000,
            cpu_quota=50000,         # CPU 限制 50%
            network_mode="none",     # 禁用网络，防止数据外泄
            remove=True,             # 执行完自动删除容器
            timeout=10               # 10 秒超时
        )
        return result.decode("utf-8")
    except Exception as e:
        return f"执行失败: {e}"
\`\`\`

### 第六节　工具描述编写技巧

工具描述是 LLM 决定何时、如何调用工具的唯一依据。**描述写不好，再强的模型也会用错**。三条核心原则：

1. **场景化描述**：不仅说"做什么"，还要说"什么时候用"
2. **参数明确**：每个参数都要有清晰的 description 和示例
3. **边界清晰**：明确工具的能力边界，避免误用

对比示例：

\`\`\`python
# ❌ 不好：模糊、缺乏场景
def calculator(expression: str) -> str:
    """计算数学表达式"""
    ...

# ✅ 好：场景清晰、参数有约束
def calculator(expression: str) -> str:
    """计算数学表达式并返回结果。

    适用场景：用户需要精确数值计算（如财务、统计、单位换算）。
    不适用场景：估算、概率推理（这类问题应直接由 LLM 回答）。

    参数:
        expression: Python 可执行的表达式，如 '3.14 * 12 * 12'、'sum([1,2,3])'
                    只允许数字和基础运算符，禁止 import 和函数定义
    """
    ...
\`\`\`

### 实战要点

- 工具数量控制在 5-10 个，过多会让模型选择困难
- 同类工具提供优先级（如优先 Tavily，失败回退 SerpAPI）
- 关键工具加入重试和超时机制
- 记录每次工具调用的入参、出参、耗时，便于调试
- 生产环境务必做参数校验，防止 LLM 生成危险参数（如路径穿越、命令注入）
- 工具的输出格式要稳定，便于 LLM 解析，结构化数据优于纯文本`,
  },
  {
    id: 'a-ch14',
    group: '第四部分 Agent核心能力构建',
    icon: '💾',
    title: '记忆系统——短期记忆与长期记忆',
    content: `## 第十四章　记忆系统——短期记忆与长期记忆

记忆是智能的基石。人类能够进行复杂推理、长程规划和个性化交流，本质上依赖于记忆系统——记住刚才讨论的内容、调用过往经验、识别熟悉的人与事。对于 Agent 而言，记忆系统同样不可或缺：没有记忆的 Agent 就像"金鱼"，每次对话都从零开始，无法完成跨会话的任务。

本章将深入讲解 Agent 记忆系统的设计原理，涵盖短期记忆、长期记忆、向量检索、记忆管理等多个层面，并给出完整的工程实现。

### 第一节　为什么 Agent 需要记忆

LLM 本身是**无状态**的——每次推理都是一次独立的函数调用，模型权重不会因为对话而改变。我们感觉"它记得我说过的话"，是因为应用层把历史对话重新塞进了 prompt。这种"伪记忆"有三个硬约束：

1. **上下文窗口有限**：即使是 128K 窗口，也只能塞下有限的对话历史
2. **成本随长度上升**：每多 1000 token，推理费用就增加一份
3. **信息淹没**：无关历史会干扰模型注意力，降低回答质量

真正的记忆系统要解决的核心问题：**在有限的上下文中，装入最有价值的信息**。

典型需要记忆的场景：

- 用户偏好：用户上次说过喜欢简洁回答，下次应该继续保持
- 任务上下文：跨会话的长任务，需要记住已完成的步骤
- 知识积累：用户上传的文档、过往的对话结论
- 错误经验：上次生成的代码报错了，避免重复犯错

### 第二节　短期记忆：对话历史管理

短期记忆指**当前会话内**的上下文管理。最朴素的实现是把所有历史消息塞进 prompt，但很快就会超出窗口。常用策略：

**1. 滑动窗口（Sliding Window）**

只保留最近 N 轮对话，超出部分直接丢弃。实现简单，但会丢失早期重要信息。

\`\`\`python
from collections import deque

class SlidingWindowMemory:
    def __init__(self, max_messages: int = 20):
        self.messages = deque(maxlen=max_messages)

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})

    def get_context(self) -> list:
        return list(self.messages)
\`\`\`

**2. 摘要压缩（Summarization）**

当历史超过阈值时，调用 LLM 对早期对话做摘要，用摘要替换原文：

\`\`\`python
class SummaryMemory:
    def __init__(self, llm, threshold: int = 10):
        self.llm = llm
        self.recent = []        # 最近对话，原文保留
        self.summary = ""       # 早期对话的摘要
        self.threshold = threshold

    def add(self, message: dict):
        self.recent.append(message)
        if len(self.recent) > self.threshold:
            # 触发摘要压缩
            old_msgs = self.recent[:self.threshold // 2]
            new_summary = self.llm.invoke(
                f"请简洁总结以下对话要点:\\n{old_msgs}"
            )
            self.summary = f"{self.summary}\\n{new_summary}".strip()
            self.recent = self.recent[self.threshold // 2:]

    def get_context(self) -> list:
        context = []
        if self.summary:
            context.append({
                "role": "system",
                "content": f"过往对话摘要:\\n{self.summary}"
            })
        context.extend(self.recent)
        return context
\`\`\`

**3. Token 缓冲（Token Buffer）**

按 token 数而非消息数管理，更精确控制成本：

\`\`\`python
import tiktoken

class TokenBufferMemory:
    def __init__(self, max_tokens: int = 4000):
        self.max_tokens = max_tokens
        self.messages = []
        self.encoder = tiktoken.encoding_for_model("gpt-4")

    def add(self, message: dict):
        self.messages.append({
            **message,
            "_tokens": len(self.encoder.encode(message["content"]))
        })
        # 超限时从头部丢弃
        while sum(m["_tokens"] for m in self.messages) > self.max_tokens:
            self.messages.pop(0)
\`\`\`

### 第三节　长期记忆：向量库与知识图谱

长期记忆需要**持久化存储**，跨会话保留。主流方案是基于向量数据库的语义检索：

**架构**：每段重要信息 → Embedding → 存入向量库 → 查询时按语义相似度召回

\`\`\`python
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

class LongTermMemory:
    def __init__(self, persist_path: str = "./memory_db"):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.store = Chroma(
            embedding_function=self.embeddings,
            persist_directory=persist_path
        )

    def remember(self, content: str, metadata: dict = None):
        """写入长期记忆"""
        self.store.add_texts(
            texts=[content],
            metadatas=[metadata or {}]
        )

    def recall(self, query: str, k: int = 5) -> list:
        """按语义相似度检索记忆"""
        docs = self.store.similarity_search(query, k=k)
        return [
            {"content": d.page_content, "metadata": d.metadata}
            for d in docs
        ]
\`\`\`

**元数据过滤**是工程实践的关键——只检索当前用户、当前会话相关的记忆：

\`\`\`python
# 只召回该用户、最近 7 天的记忆
memory.recall(
    query="我上次提到的项目",
    k=5,
    filter={"user_id": "u_123", "date": {"$gte": "2026-06-21"}}
)
\`\`\`

对于结构化关系（如"用户 A 是公司 B 的员工"），知识图谱比向量库更合适，可结合 Neo4j 等图数据库实现关系推理。

### 第四节　记忆的写入、检索与遗忘

成熟的记忆系统需要回答三个问题：**什么时候写入、怎么检索、何时遗忘**。

**写入时机**：

- 用户明确要求记住（"记住我喜欢..."）
- Agent 主动判断重要（任务完成的关键决策）
- 周期性总结（每晚对当天对话做摘要写入）

**检索策略**：

- **语义检索**：按相似度召回（默认）
- **时间衰减**：越近的记忆权重越高
- **重要性加权**：用户标注的"重要"记忆优先召回

**遗忘机制**——避免记忆库无限膨胀：

\`\`\`python
import math
from datetime import datetime

def decay_score(memory: dict, now: datetime) -> float:
    """时间衰减 + 重要性加权"""
    age_days = (now - memory["created_at"]).days
    importance = memory.get("importance", 0.5)
    return importance * math.exp(-age_days / 30)  # 30 天半衰期

def forget(memories: list, threshold: float = 0.1) -> list:
    """丢弃得分低于阈值的记忆"""
    now = datetime.now()
    return [m for m in memories if decay_score(m, now) > threshold]
\`\`\`

### 第五节　CrewAI 与 MemGPT 的记忆方案

**CrewAI** 采用分层记忆：短期（当前任务上下文）+ 长期（向量库）+ 实体记忆（记住特定人物/项目的属性）。三层各司其职，通过统一的 Memory 接口暴露给 Agent。

**MemGPT**（现 Letta）灵感来自操作系统虚拟内存：把上下文窗口视为"内存"，外部存储视为"磁盘"，由 LLM 自己决定何时把信息从磁盘换入内存、何时换出。这种"自管理记忆"让 Agent 能处理极长上下文任务，突破了固定窗口的限制。

### 实战要点

- 短期记忆优先解决"成本"，长期记忆优先解决"召回准确率"
- 记忆写入前先去重，避免相似信息冗余
- 给用户暴露"忘记"接口（如"忘掉我刚才说的"），满足隐私合规
- 敏感信息（密码、密钥）不要写入长期记忆，必要时做脱敏
- 定期审计记忆库，清理过时和低质内容
- 记忆系统的效果要通过端到端评测验证，而非只看召回率`,
  },
  {
    id: 'a-ch15',
    group: '第四部分 Agent核心能力构建',
    icon: '🗺️',
    title: '规划与推理——ReAct、CoT、ToT',
    content: `## 第十五章　规划与推理——ReAct、CoT、ToT

如果说工具让 Agent 有了"手脚"，那么推理与规划就是它的"大脑"。一个优秀的 Agent 不仅要会调用工具，更要知道**何时调用、按什么顺序调用、调用后如何根据结果调整下一步**。这就是规划与推理范式要解决的核心问题。

本章将深入讲解四种主流推理范式——Chain-of-Thought、ReAct、Tree of Thoughts、Reflection，并给出可运行的代码实现。

### 第一节　Chain-of-Thought（CoT）：让模型"想出来"

**原理**：CoT 的核心思想是——让模型在给出最终答案前，先生成一段中间推理步骤。研究表明，这能显著提升模型在数学、逻辑、多步推理任务上的表现。

**为什么有效**：Transformer 的自注意力机制在单次前向传播中能完成的"计算"是有限的。让模型显式输出中间步骤，等于把单步推理拆成多步，每步只做相对简单的推断，从而降低每一步的难度。

**零样本 CoT** 最简单，只需在 prompt 末尾加一句"让我们一步步思考"：

\`\`\`python
prompt = f"""
问题: 小明有 5 个苹果，给了小红 2 个，又买了 3 个，最后有多少个？
让我们一步步思考：
"""
\`\`\`

**少样本 CoT** 通过示例引导模型按特定格式推理：

\`\`\`python
few_shot = """
示例 1:
问题: 商店有 12 个鸡蛋，卖出 5 个，进货 8 个，现有多少？
思考: 起始 12 个，卖出 5 个剩 12-5=7 个，进货 8 个变 7+8=15 个。
答案: 15

示例 2:
问题: ...
"""
\`\`\`

CoT 的局限是**线性、单向**——一旦某步推理出错，后续全部受影响，且无法回溯。

### 第二节　ReAct：推理与行动的交替

**ReAct = Reasoning + Acting**，是当前最主流的 Agent 范式。它让模型在"思考"和"行动"之间交替，形成 Thought → Action → Observation 的循环。

**核心模板**：

\`\`\`
Question: 用户问题
Thought: 我需要先搜索相关信息
Action: web_search
Action Input: {"query": "..."}
Observation: 搜索返回的结果
Thought: 现在我知道...，还需要计算一下
Action: calculator
Action Input: {"expression": "..."}
Observation: 计算结果
...
Thought: 我已经得到答案
Final Answer: 最终回答
\`\`\`

**ReAct 循环的代码实现**：

\`\`\`python
import re
import json
from typing import Callable

class ReActAgent:
    def __init__(self, llm, tools: dict, max_iter: int = 5):
        self.llm = llm
        self.tools = tools  # {"工具名": 函数}
        self.max_iter = max_iter

    def run(self, question: str) -> str:
        history = f"Question: {question}\\n"
        for i in range(self.max_iter):
            # 让 LLM 生成下一步 Thought + Action
            response = self.llm.invoke(self._build_prompt(history))
            history += response

            # 检查是否给出最终答案
            if "Final Answer:" in response:
                return response.split("Final Answer:")[-1].strip()

            # 解析 Action 和 Action Input
            action_match = re.search(r"Action:\\s*(\\w+)", response)
            input_match = re.search(r"Action Input:\\s*(\\{.*\\})", response)
            if not action_match or not input_match:
                history += "\\nObservation: 无法解析行动，请重新思考\\n"
                continue

            tool_name = action_match.group(1)
            if tool_name not in self.tools:
                history += f"\\nObservation: 工具 {tool_name} 不存在\\n"
                continue

            # 执行工具
            args = json.loads(input_match.group(1))
            try:
                result = self.tools[tool_name](**args)
            except Exception as e:
                result = f"工具执行失败: {e}"

            history += f"\\nObservation: {result}\\n"

        return "已达最大迭代次数，未能完成任务"

    def _build_prompt(self, history: str) -> str:
        tools_desc = "\\n".join(
            f"- {name}: {fn.__doc__}" for name, fn in self.tools.items()
        )
        return f"""你是一个 ReAct Agent，通过 Thought-Action-Observation 循环解决问题。

可用工具:
{tools_desc}

格式要求（严格遵守）:
Thought: 你的思考
Action: 工具名
Action Input: {{"参数": "值"}}

{history}
Thought:"""
\`\`\`

ReAct 的优势在于**可解释性**——每一步推理都显式可见，便于调试。劣势是 token 消耗大、速度慢。

### 第三节　Tree of Thoughts（ToT）：树搜索推理

CoT 和 ReAct 都是**线性推理**——一条路走到底。但很多问题（如解谜、博弈、复杂规划）需要**探索多条路径并回溯**，这就需要 Tree of Thoughts。

**核心思想**：在每一步生成多个候选"思考分支"，评估每个分支的前景，选择最优的继续展开，必要时回溯。

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class ThoughtNode:
    state: str
    score: float
    parent: 'ThoughtNode' = None
    children: list = field(default_factory=list)

class TreeOfThoughts:
    def __init__(self, llm, n_branches: int = 3, max_depth: int = 5):
        self.llm = llm
        self.n_branches = n_branches
        self.max_depth = max_depth

    def solve(self, problem: str) -> str:
        root = ThoughtNode(state=problem, score=1.0)
        frontier = [root]

        for depth in range(self.max_depth):
            # 1. 生成候选分支
            candidates = []
            for node in frontier:
                for _ in range(self.n_branches):
                    new_state = self._generate_thought(node.state)
                    score = self._evaluate(new_state, problem)
                    child = ThoughtNode(
                        state=new_state, score=score, parent=node
                    )
                    candidates.append(child)

            # 2. 按得分筛选，保留最优的 N 个
            candidates.sort(key=lambda x: x.score, reverse=True)
            frontier = candidates[:self.n_branches]

            # 3. 检查是否找到解
            if frontier[0].score > 0.95:
                return self._backtrack(frontier[0])

        return self._backtrack(frontier[0])

    def _generate_thought(self, state: str) -> str:
        return self.llm.invoke(f"基于当前状态推进推理:\\n{state}\\n下一步思考:")

    def _evaluate(self, state: str, problem: str) -> float:
        resp = self.llm.invoke(
            f"问题: {problem}\\n当前推理: {state}\\n"
            f"评估当前推理是否能解决问题，给出 0-1 的得分，只输出数字:"
        )
        try:
            return float(resp.strip())
        except ValueError:
            return 0.0
\`\`\`

ToT 在 24 点游戏、数独、创意写作等需要"试错"的任务上显著优于 CoT，但代价是 LLM 调用次数指数级增长。

### 第四节　Reflection：反思机制

Reflection 让 Agent 在执行后**自我评估**，从失败中学习。典型流程：执行 → 评估 → 反思 → 改进 → 重试。

\`\`\`python
class ReflectiveAgent:
    def __init__(self, llm, executor, max_retries: int = 3):
        self.llm = llm
        self.executor = executor  # 执行任务的工具
        self.max_retries = max_retries

    def solve(self, task: str) -> str:
        history = []
        for i in range(self.max_retries):
            # 1. 生成方案
            solution = self.llm.invoke(
                f"任务: {task}\\n历史反思: {history}\\n生成解决方案:"
            )
            # 2. 执行
            result = self.executor(solution)
            if self._is_success(result):
                return result
            # 3. 反思
            reflection = self.llm.invoke(
                f"任务: {task}\\n方案: {solution}\\n结果: {result}\\n"
                f"分析失败原因并提出改进:"
            )
            history.append(reflection)
        return f"重试 {self.max_retries} 次后仍未成功，最后结果: {result}"
\`\`\`

### 第五节　Plan-and-Execute：先规划后执行

ReAct 是"边想边做"，Plan-and-Execute 则是**先制定完整计划，再逐步执行**。适合长程任务：

\`\`\`python
class PlanExecuteAgent:
    def __init__(self, llm, executor):
        self.llm = llm
        self.executor = executor

    def run(self, task: str) -> str:
        # 阶段 1: 生成多步计划
        plan = self.llm.invoke(
            f"将任务分解为可执行步骤（JSON 数组）:\\n任务: {task}"
        )
        steps = self._parse_plan(plan)

        # 阶段 2: 逐步执行
        results = []
        for i, step in enumerate(steps):
            result = self.executor.run(step)
            results.append(result)
            # 阶段 3: 必要时重新规划
            if self._needs_replan(step, result):
                steps = self._replan(task, results, steps[i+1:])
        return self.llm.invoke(f"综合结果生成最终答案:\\n{results}")
\`\`\`

### 实战要点

- 简单问答用 CoT 即可，无需复杂框架
- 需要工具调用的任务首选 ReAct
- 解谜/博弈类问题考虑 ToT
- 代码生成等可验证任务加入 Reflection
- 长程任务用 Plan-and-Execute，避免 ReAct 的"短视"
- 各种范式可以组合使用，如 ReAct + Reflection`,
  },
  {
    id: 'a-ch16',
    group: '第四部分 Agent核心能力构建',
    icon: '👥',
    title: '多Agent协作——角色分工与任务编排',
    content: `## 第十六章　多Agent协作——角色分工与任务编排

随着任务复杂度提升，单个 Agent 的能力瓶颈开始显现：上下文窗口装不下所有信息、单一角色难以兼顾不同视角、错误难以自我发现。**多 Agent 协作**通过将复杂任务分解给多个专业化 Agent，让它们各司其职、相互校验，从而突破单 Agent 的能力上限。

本章将讲解多 Agent 协作的设计模式、角色分工、框架对比，并给出完整实战示例。

### 第一节　为什么需要多 Agent

单 Agent 面对复杂任务时有四大局限：

1. **认知过载**：一个 Agent 要同时扮演需求分析、编码、测试、文档等多个角色，prompt 臃肿、注意力分散
2. **自我盲点**：自己写的代码自己很难发现 bug，"作者即审查者"是质量杀手
3. **上下文冲突**：不同子任务需要不同的工具集和知识背景，挤在一个上下文里互相干扰
4. **缺乏对抗性**：没有"反对意见"的方案容易陷入局部最优

多 Agent 协作通过**专业化分工**和**角色对抗**解决这些问题：

- 每个 Agent 专注一个角色，prompt 精简、工具聚焦
- 不同 Agent 输出互相校验（如程序员写代码、审查员找 bug）
- 通过"辩论"机制激发更全面的思考

### 第二节　角色设计：研究员、程序员、审查员

角色设计是多 Agent 系统的核心。常见角色模板：

| 角色 | 职责 | 典型工具 |
|------|------|---------|
| 研究员(Researcher) | 搜集信息、调研方案 | 搜索、浏览器 |
| 程序员(Programmer) | 编写代码实现 | 代码执行、文件操作 |
| 审查员(Reviewer) | 审查代码与方案质量 | 静态分析、测试运行 |
| 项目经理(PM) | 分解任务、协调进度 | 任务管理 API |
| 测试员(Tester) | 设计用例、验证结果 | 测试框架、Sandbox |

角色设计原则：

- **单一职责**：每个 Agent 只做一件事
- **明确产出**：每个角色的输出必须是其他角色可消费的格式
- **可替换**：角色之间松耦合，能单独升级或替换实现

### 第三节　协作模式：顺序、并行、层级

**1. 顺序模式（Pipeline）**

任务按固定顺序在 Agent 间流转，前一个的输出是后一个的输入。最简单可靠：

\`\`\`
研究员 → 程序员 → 审查员 → 测试员
\`\`\`

\`\`\`python
def pipeline(task: str) -> str:
    research = researcher.run(f"调研: {task}")
    code = programmer.run(f"根据调研实现:\\n{research}")
    reviewed = reviewer.run(f"审查代码:\\n{code}")
    if not reviewed["approved"]:
        # 回到程序员修改
        code = programmer.run(f"根据审查意见修改:\\n{reviewed}")
    return tester.run(f"测试代码:\\n{code}")
\`\`\`

**2. 并行模式（Fan-out/Fan-in）**

多个 Agent 同时处理子任务，最后汇总。适合可分解的任务：

\`\`\`python
import concurrent.futures

def parallel(task: str) -> str:
    subtasks = pm.decompose(task)  # PM 拆解任务
    with concurrent.futures.ThreadPoolExecutor() as pool:
        futures = {
            pool.submit(worker.run, st): st
            for st in subtasks
        }
        results = {
            futures[f]: f.result()
            for f in concurrent.futures.as_completed(futures)
        }
    return synthesizer.run(f"汇总子任务结果:\\n{results}")
\`\`\`

**3. 层级模式（Hierarchical）**

像公司组织架构，主管 Agent 拆分任务给下属 Agent，下属可再拆分：

\`\`\`
        主管 Agent
       /    |    \\
   研究员 程序员 测试员
              |
           调试员
\`\`\`

层级模式适合超大型任务，但调试复杂、延迟高，建议谨慎使用。

### 第四节　CrewAI、AutoGen、MetaGPT 框架对比

**CrewAI**——以"团队"为核心抽象，声明式定义角色和任务：

\`\`\`python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="研究员",
    goal="搜集技术方案信息",
    backstory="资深技术研究员，擅长信息检索",
    tools=[search_tool, browser_tool]
)

programmer = Agent(
    role="程序员",
    goal="根据调研结果编写代码",
    backstory="资深全栈工程师",
    tools=[code_tool]
)

research_task = Task(
    description="调研 React 状态管理方案",
    agent=researcher,
    expected_output="技术方案对比报告"
)

code_task = Task(
    description="根据方案实现示例代码",
    agent=programmer,
    expected_output="可运行的代码",
    context=[research_task]  # 依赖调研结果
)

crew = Crew(agents=[researcher, programmer], tasks=[research_task, code_task])
result = crew.kickoff()
\`\`\`

**AutoGen**（微软）——以"对话"为核心，Agent 之间通过消息交互：

\`\`\`python
from autogen import AssistantAgent, UserProxyAgent

coder = AssistantAgent(
    name="coder",
    system_message="你是程序员，写代码解决问题",
    llm_config={"model": "gpt-4"}
)

reviewer = AssistantAgent(
    name="reviewer",
    system_message="你是代码审查员，指出问题并要求修改",
    llm_config={"model": "gpt-4"}
)

user = UserProxyAgent(
    name="user",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=5
)

# 开启 coder 与 reviewer 的对话
user.initiate_chat(coder, message="实现一个二分查找", recipient=coder)
\`\`\`

**MetaGPT**——以"软件工程流程"为核心，模拟完整开发团队：

\`\`\`python
from metagpt.roles import (
    ProductManager, Architect, ProjectManager,
    Engineer, QAEngineer
)
from metagpt.team import Team

team = Team()
team.hire([
    ProductManager(),
    Architect(),
    ProjectManager(),
    Engineer(),
    QAEngineer()
])
team.invest("做一个待办事项 Web 应用")
team.run_project("需求: 支持增删改查、分类、提醒")
\`\`\`

**对比总结**：

| 框架 | 核心抽象 | 优势 | 适用场景 |
|------|---------|------|---------|
| CrewAI | 团队+任务 | 声明式、上手快 | 通用任务编排 |
| AutoGen | 对话消息 | 灵活、支持人类参与 | 需要人机协作 |
| MetaGPT | 软件流程 | 内置完整 SOP | 软件开发专用 |

### 第五节　完整多 Agent 示例：自动化开发一个 API

下面用 CrewAI 实现"研究员 + 程序员 + 审查员"协作开发一个 REST API：

\`\`\`python
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

# 1. 定义工具
search_tool = SerperDevTool()

# 2. 定义角色
researcher = Agent(
    role="技术研究员",
    goal="调研最佳的 REST API 设计实践",
    backstory="10 年后端经验，精通 API 设计",
    tools=[search_tool],
    verbose=True
)

programmer = Agent(
    role="Python 工程师",
    goal="用 FastAPI 实现高质量的 REST API",
    backstory="全栈工程师，注重代码质量与测试",
    verbose=True
)

reviewer = Agent(
    role="代码审查员",
    goal="确保代码符合最佳实践，无安全漏洞",
    backstory="严格的 Tech Lead，审查过上百个项目",
    verbose=True
)

# 3. 定义任务链
research_task = Task(
    description="调研 FastAPI 构建 REST API 的最佳实践，"
                "包括项目结构、错误处理、认证、文档",
    agent=researcher,
    expected_output="包含代码示例的调研报告"
)

code_task = Task(
    description="根据调研报告，实现一个用户管理的 REST API，"
                "包含增删改查、输入校验、单元测试",
    agent=programmer,
    expected_output="完整可运行的代码",
    context=[research_task]  # 依赖调研结果
)

review_task = Task(
    description="审查代码，检查安全性、可维护性、测试覆盖率，"
                "列出问题并给出修改建议",
    agent=reviewer,
    expected_output="审查报告与改进建议",
    context=[code_task]
)

# 4. 组建团队并执行
crew = Crew(
    agents=[researcher, programmer, reviewer],
    tasks=[research_task, code_task, review_task],
    process=Process.sequential  # 顺序执行
)

result = crew.kickoff()
print("最终产出:", result)
\`\`\`

### 实战要点

- 角色不要过多，3-5 个为宜，否则协调成本激增
- 任务依赖关系要清晰，避免循环依赖
- 每个 Agent 设置独立的 verbose 日志，便于调试
- 设置全局超时，防止单个 Agent 卡死整个流程
- 给"审查/对抗"角色足够的权限否决方案
- 生产环境关注 token 消耗——多 Agent 会成倍放大成本
- 引入人类审批节点（Human-in-the-loop）处理关键决策，避免 Agent 自主犯大错`,
  },
];

export { chapters };
