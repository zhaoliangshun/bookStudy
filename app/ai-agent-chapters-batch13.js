// =============================================================
// AI Agent 开发实战 - 第十三批章节(LangGraph 工作流,共 4 章)
// 章节 49-52:LangGraph 状态图 / 节点与边 / 条件路由 / 人机协作
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十九章:LangGraph 状态图基础
  // =============================================================
  {
    id: 'langgraph-intro',
    group: 'LangGraph 工作流',
    icon: '📐',
    title: 'LangGraph 状态图基础',
    content: `## 第四十九章　LangGraph 状态图基础

### 49.1 为什么需要 LangGraph

在前面的章节里,我们用 LangChain 的 \`AgentExecutor\` 跑通了能调工具的 Agent。但当业务流程变复杂时,你会发现 \`AgentExecutor\` 有几个绕不开的痛点:

- **流程是黑盒**:Agent 内部"思考→调工具→再思考"的循环被封装死了,你想在中间插入一个"人工审核"步骤几乎做不到;
- **无法表达分支**:真实业务里"先判断意图,简单问题走 FAQ、复杂问题走专家"这种条件分支,\`AgentExecutor\` 只能用 prompt 硬塞,不优雅也不可控;
- **循环难以定制**:Agent 调工具失败想重试 3 次、想限制最大步数、想在特定条件下跳过某步——这些都需要对流程图有精细控制;
- **状态管理混乱**:多步执行中间结果怎么存、怎么传、怎么累加,自己用变量拼很容易出 bug。

**LangGraph 就是为了解决这些问题而生的。**它是 LangChain 团队推出的"基于图的 Agent 工作流框架",核心理念一句话:**把 Agent 流程显式地画成一张有向图(StateGraph),每个节点是一段处理逻辑,每条边是状态的流转方向,所有中间状态存进一个共享的 State 对象。**

> 一句话区分:LangChain 的 AgentExecutor 是"我帮你把循环写好了,你填 prompt 和工具就行";LangGraph 是"给你画布和画笔,流程图你自己画,我保证能编译运行"。

### 49.2 核心概念速览

LangGraph 只有四个核心概念,理解了它们就理解了 LangGraph 的全部:

| 概念 | 作用 | 类比 |
| --- | --- | --- |
| **State(状态)** | 在节点之间流转的共享数据,通常是 \`TypedDict\` | 流水线上的传送带,零件放上面 |
| **Node(节点)** | 一个处理函数,接收 state、返回 state 的更新 | 流水线上的工位 |
| **Edge(边)** | 节点之间的连线,决定下一个工位 | 传送带的走向 |
| **Graph(图)** | 把节点和边组装起来,编译成可执行对象 | 整条流水线的设计图 |

**执行流程**:从 \`START\` 节点出发 → 按边的指向依次执行各节点 → 每个节点读取/更新 state → 到达 \`END\` 节点结束,返回最终 state。

### 49.3 State:共享状态怎么定义

State 是整张图的"数据总线"。在 LangGraph 里,推荐用 Python 的 \`TypedDict\` 来定义,字段就是要在节点间传递的信息。

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import MessagesState

# 方式一:自定义 State(最常用)
class AgentState(TypedDict):
    messages: list           # 对话历史(消息列表)
    user_input: str          # 用户原始输入
    retrieved_docs: list     # 检索到的文档
    answer: str              # 最终回答
    step_count: int          # 执行步数(用于限制循环)

# 方式二:直接用内置的 MessagesState(只有 messages 字段)
# 适合不需要额外字段的简单对话场景
\`\`\`

**关键点:节点函数不是"改"state,而是"返回要更新的部分"。** LangGraph 会把你返回的字段合并进 state。这意味着节点只需要关心自己负责的字段,职责清晰。

### 49.4 节点函数:接收 state,返回更新

节点就是一个普通 Python 函数,签名固定为 \`def node(state): return {...}\`。

\`\`\`python
def greet_node(state: AgentState) -> dict:
    """打招呼节点:读取用户输入,生成欢迎消息。"""
    user_input = state["user_input"]
    # 只返回需要更新的字段,不必返回整个 state
    return {
        "messages": [{"role": "assistant", "content": f"你好!你问的是:{user_input}"}],
        "step_count": state.get("step_count", 0) + 1,
    }
\`\`\`

**设计原则(贯穿全章):**

1. **单一职责**:一个节点只做一件事(greet 只打招呼,不检索);
2. **尽量纯函数**:相同输入应产生相同输出,不要在节点里改全局变量;
3. **只返回增量**:返回 dict 里只放要更新的字段,LedgerGraph 自动合并。

### 49.5 边:连接节点

边分两种:

- **普通边(固定边)**:\`graph.add_edge("A", "B")\`——执行完 A 一定走 B;
- **条件边**:\`graph.add_conditional_edges("A", route_fn, {"yes": "B", "no": "C"})\`——执行完 A 后调用 \`route_fn\`,根据返回值决定去 B 还是 C。

\`\`\`python
def route_fn(state: AgentState) -> str:
    """根据 state 决定下一个节点名。"""
    if state["step_count"] >= 5:
        return "end"          # 步数超限,结束
    return "continue"         # 否则继续
\`\`\`

### 49.6 编译并执行:第一个完整示例

把节点和边组装成图,编译后就能像函数一样调用。

\`\`\`python
from langgraph.graph import StateGraph, START, END

# 1. 定义 State
class HelloState(TypedDict):
    user_input: str
    greeting: str

# 2. 定义节点
def say_hello(state: HelloState) -> dict:
    return {"greeting": f"你好,{state['user_input']}!欢迎使用 LangGraph。"}

def say_bye(state: HelloState) -> dict:
    print(state["greeting"])   # 打印中间结果,演示 state 已流转
    return {"greeting": state["greeting"] + " (流程结束)"}

# 3. 建图:加节点 + 连边
graph_builder = StateGraph(HelloState)
graph_builder.add_node("hello", say_hello)   # 注册节点
graph_builder.add_node("bye", say_bye)
graph_builder.add_edge(START, "hello")        # 起点 → hello
graph_builder.add_edge("hello", "bye")        # hello → bye(普通边)
graph_builder.add_edge("bye", END)            # bye → 终点

# 4. 编译成可执行图(编译后不可再改结构)
app = graph_builder.compile()

# 5. 执行:传入初始 state
result = app.invoke({"user_input": "小明"})
print(result["greeting"])
# 输出:你好,小明!欢迎使用 LangGraph。(流程结束)
\`\`\`

### 49.7 对比 LangChain AgentExecutor

| 维度 | AgentExecutor | LangGraph |
| --- | --- | --- |
| 流程表达 | 线性循环,内部封装 | 显式有向图,流程透明 |
| 分支/循环 | 难以精细控制 | 条件边、循环结构自由组合 |
| 人机协作 | 几乎不支持 | interrupt 原生支持 |
| 状态管理 | 内部维护 | 共享 State,可自定义字段 |
| 调试难度 | 黑盒,难插桩 | 节点独立可测,可打断 |
| 学习成本 | 低,开箱即用 | 中,需理解图思维 |
| 适用场景 | 简单单 Agent | 复杂多步/多 Agent 流程 |

### 49.8 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 节点返回整个 state 对象 | 字段被整体覆盖,丢失并发更新 | 只返回要更新的字段 dict |
| 忘记连 \`START\` 或 \`END\` | 编译报错或流程跑飞 | 每个图必须有入口和出口 |
| 在节点里修改入参 state | 副作用难追踪 | 把 state 当只读,用返回值更新 |
| State 字段类型与返回不符 | 运行时 KeyError 或类型错 | TypedDict 字段和返回值对齐 |
| 编译后又 \`add_node\` | 静默无效或报错 | \`compile()\` 之后再不改图 |

### 49.9 安装

\`\`\`bash
# LangGraph 依赖 LangChain 核心,通常一起装
pip install langgraph langchain-core
\`\`\`

> **本章小结**:LangGraph 用"图"来表达 Agent 流程,把黑盒循环变成了可绘制、可打断、可分支的状态机。掌握 State/Node/Edge/Graph 四个概念,你就拿到了复杂 Agent 的"工程画笔"。下一章我们深入节点和边的设计。`,
  },

  // =============================================================
  // 第五十章:节点与边的设计
  // =============================================================
  {
    id: 'langgraph-node',
    group: 'LangGraph 工作流',
    icon: '🔵',
    title: '节点与边的设计',
    content: `## 第五十章　节点与边的设计

上一章我们跑了第一个 LangGraph 示例,但那只是"直线图"。真实 Agent 之所以强大,在于节点和边可以组合出分支、并行、循环。本章把节点和边的设计原则讲透,并动手实现一个带路由的多步工作流。

### 50.1 节点设计三原则

节点是图的最小执行单元,设计好坏直接决定图的清晰度和可维护性。

**原则一:单一职责**

一个节点只做一件事。不要在"检索节点"里顺手生成回答——检索是检索、生成是生成,分开后才能单独测试、单独替换。

\`\`\`python
# ❌ 反例:一个节点干两件事
def retrieve_and_answer(state):
    docs = search(state["question"])        # 检索
    answer = llm.generate(state["question"], docs)  # 生成
    return {"docs": docs, "answer": answer}

# ✅ 正例:拆成两个节点
def retrieve_node(state):
    return {"docs": search(state["question"])}

def generate_node(state):
    return {"answer": llm.generate(state["question"], state["docs"])}
\`\`\`

**原则二:纯函数优先**

节点最好是无副作用的纯函数——相同 state 进去,相同 dict 出来。副作用(写库、发请求)不可避免时,尽量集中到"边界节点"。

**原则三:只返回增量**

\`\`\`python
def good_node(state) -> dict:
    # 只声明要更新的字段,其余字段不动
    return {"answer": "..."}

def bad_node(state) -> dict:
    # 返回整个 state 会让 reducer 整体覆盖,丢失并发的更新
    new_state = dict(state)
    new_state["answer"] = "..."
    return new_state
\`\`\`

### 50.2 边的四种类型

| 边类型 | API | 含义 |
| --- | --- | --- |
| 普通边 | \`add_edge(A, B)\` | A 执行完必走 B |
| 条件边 | \`add_conditional_edges(A, fn, mapping)\` | fn 返回值决定下一站 |
| 入口边 | \`add_edge(START, A)\` | 从 START 进 A |
| 出口边 | \`add_edge(A, END)\` | A 执行完结束 |

### 50.3 条件路由:让图会"判断"

条件边是 LangGraph 最有用的特性。路由函数根据当前 state 返回一个字符串,映射表把它翻译成节点名。

\`\`\`python
def route_by_intent(state) -> str:
    """根据意图分类决定走哪个专家节点。"""
    intent = state.get("intent", "unknown")
    if intent == "faq":
        return "faq_node"
    elif intent == "tech":
        return "tech_node"
    else:
        return "human_node"

# 用法:执行完 classify 后,按 route_by_intent 的返回值路由
graph.add_conditional_edges(
    "classify",                  # 源节点
    route_by_intent,             # 路由函数
    {                            # 返回值 → 节点名 映射
        "faq_node": "faq_node",
        "tech_node": "tech_node",
        "human_node": "human_node",
    },
)
\`\`\`

### 50.4 并行节点:扇出与汇合

LangGraph 支持让一个节点同时连到多个节点实现并行(扇出),再汇合到同一节点。状态更新会被合并。

\`\`\`python
# 扇出:search 节点之后同时跑 web 和 kb 两个检索
graph.add_edge("classify", "search")
graph.add_edge("search", "web_retrieve")   # 支路 1
graph.add_edge("search", "kb_retrieve")     # 支路 2
# 汇合:两条支路结果都进入 merge 节点
graph.add_edge("web_retrieve", "merge")
graph.add_edge("kb_retrieve", "merge")
\`\`\`

> 注意:并行节点写入同一字段时需要用 **reducer(规约函数)** 处理冲突,否则后写覆盖先写。下一节讲。

### 50.5 状态累加:Annotated reducer

默认情况下,节点返回的字段会"整体覆盖"state 里的旧值。但有些字段我们希望"累加",最典型的是消息列表——新消息要追加,不是覆盖。

LangGraph 用 \`Annotated\` 配合 reducer 来声明累加语义:

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class ChatState(TypedDict):
    # add_messages 是内置 reducer:新消息追加到列表末尾,而非覆盖
    messages: Annotated[list, add_messages]
    user_id: str

# 节点返回新消息,add_messages 自动把它们追加进 state["messages"]
def assistant_node(state: ChatState) -> dict:
    new_msg = {"role": "assistant", "content": "我能帮你什么?"}
    return {"messages": [new_msg]}   # 注意是列表
\`\`\`

**自定义 reducer 示例**(累加步数、合并检索结果):

\`\`\`python
from operator import add

def merge_docs(left: list, right: list) -> list:
    """合并两份文档列表,去重。"""
    seen = set()
    merged = []
    for doc in left + right:
        if doc["id"] not in seen:
            seen.add(doc["id"])
            merged.append(doc)
    return merged

class RAGState(TypedDict):
    docs: Annotated[list, merge_docs]   # 并行检索结果自动合并去重
    step_count: Annotated[int, add]     # 每次返回 1 就累加
\`\`\`

### 50.6 循环结构:让 Agent 多次执行

Agent 的本质是"思考-行动-观察"循环。在图里用条件边连回自己就能实现循环,但**务必加退出条件**,否则会无限循环。

\`\`\`python
def agent_node(state) -> dict:
    # 调 LLM 决定是否还要调工具
    decision = llm_should_call_tool(state["messages"])
    return {"messages": [decision["msg"]], "need_tool": decision["need_tool"]}

def should_continue(state) -> str:
    # 出口条件:要么步数超限,要么不需要再调工具
    if state["step_count"] >= 8:
        return "end"
    if not state["need_tool"]:
        return "end"
    return "tool"

graph.add_node("agent", agent_node)
graph.add_node("tool", tool_node)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, {"tool": "tool", "end": END})
graph.add_edge("tool", "agent")   # 工具执行完回到 agent,形成循环
\`\`\`

### 50.7 实战:带路由的多步工作流

需求:用户提问 → 分类意图 → 简单问题走 FAQ、需要查资料的走 RAG、复杂的转人工 → 汇总输出。

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

class ServiceState(TypedDict):
    messages: Annotated[list, add_messages]
    question: str
    intent: str
    answer: str
    step_count: Annotated[int, lambda a, b: a + b]

def classify_node(state: ServiceState) -> dict:
    """意图分类节点:判断问题属于哪一类。"""
    q = state["question"]
    if "密码" in q or "怎么登录" in q:
        intent = "faq"
    elif "报错" in q or "代码" in q:
        intent = "tech"
    else:
        intent = "human"
    return {"intent": intent, "step_count": 1}

def faq_node(state: ServiceState) -> dict:
    """FAQ 节点:从预设答案表里查。"""
    faq_db = {"密码": "请在登录页点'忘记密码'重置。"}
    ans = faq_db.get(state["intent"], "暂无该 FAQ。")
    return {"answer": ans, "step_count": 1}

def tech_node(state: ServiceState) -> dict:
    """技术节点:模拟检索知识库后生成回答。"""
    docs = ["检查网络连接", "查看错误日志"]
    return {"answer": f"建议排查:{', '.join(docs)}", "step_count": 1}

def human_node(state: ServiceState) -> dict:
    """人工节点:转人工客服。"""
    return {"answer": "已为您转接人工客服,请稍候。", "step_count": 1}

def route_intent(state: ServiceState) -> str:
    """根据意图路由到不同处理节点。"""
    return {"faq": "faq", "tech": "tech", "human": "human"}[state["intent"]]

# 组装图
gb = StateGraph(ServiceState)
gb.add_node("classify", classify_node)
gb.add_node("faq", faq_node)
gb.add_node("tech", tech_node)
gb.add_node("human", human_node)
gb.add_edge(START, "classify")
gb.add_conditional_edges("classify", route_intent, {
    "faq": "faq", "tech": "tech", "human": "human"
})
# 三条处理支路都汇合到 END
gb.add_edge("faq", END)
gb.add_edge("tech", END)
gb.add_edge("human", END)

app = gb.compile()
# 执行示例
print(app.invoke({"question": "我密码忘了"})["answer"])
# 输出:请在登录页点'忘记密码'重置。
print(app.invoke({"question": "代码报错了"})["answer"])
# 输出:建议排查:检查网络连接, 查看错误日志
\`\`\`

### 50.8 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 循环没有退出条件 | 无限循环、烧 token | 条件边里判断步数/状态 |
| 并行节点写同一字段无 reducer | 数据互相覆盖 | 用 \`Annotated[list, reducer]\` |
| 节点返回字段名拼错 | state 里始终是空 | 字段名与 TypedDict 严格一致 |
| 条件边返回值不在映射表里 | 报 KeyError | 映射表覆盖所有可能返回值 |
| 节点函数有默认参数 | LangGraph 调用只传 state | 节点签名只用一个 state 参数 |

> **本章小结**:节点要单一职责、只返回增量;边分普通和条件两种,条件边是路由和循环的关键;并行写同一字段必须配 reducer。下一章我们专门讲条件路由与分支的高级用法。`,
  },

  // =============================================================
  // 第五十一章:条件路由与分支
  // =============================================================
  {
    id: 'langgraph-route',
    group: 'LangGraph 工作流',
    icon: '🛣️',
    title: '条件路由与分支',
    content: `## 第五十一章　条件路由与分支

条件路由是 LangGraph 区别于线性 Chain 的灵魂。本章把路由函数、多路分支、动态路由、循环检测、子图、Map-Reduce 讲清楚,最后做一个客服路由实战。

### 51.1 路由函数的本质

路由函数就是一个"看一眼 state、吐出一个字符串"的纯函数。它的返回值是逻辑标签(如 \`"faq"\`),映射表负责把标签翻译成真实节点名(\`"faq_node"\`)。

\`\`\`python
def route(state) -> str:
    """返回逻辑标签,而非节点名——便于解耦。"""
    if state["score"] > 0.8:
        return "high"
    return "low"

# 标签 → 节点 的映射集中管理,改节点名只动这里
graph.add_conditional_edges("judge", route, {
    "high": "expert_node",
    "low": "basic_node",
})
\`\`\`

**为什么要标签和节点名分开?** 因为路由逻辑(基于分数判断)和具体节点(叫什么)是两件事,分开后改节点名不影响路由判断。

### 51.2 多路分支:if-else 路由

路由函数里写 if-else 就能实现多路分支。

\`\`\`python
def triage_route(state) -> str:
    """工单分流:按紧急程度路由。"""
    urgency = state["urgency"]
    if urgency == "critical":
        return "p0"          # 紧急:立即处理
    elif urgency == "high":
        return "p1"          # 高优:1 小时内
    elif urgency == "medium":
        return "p2"
    else:
        return "p3"

graph.add_conditional_edges("triage", triage_route, {
    "p0": "oncall_node",
    "p1": "queue_node",
    "p2": "queue_node",
    "p3": "batch_node",
})
\`\`\`

### 51.3 动态路由:让 LLM 决定走哪条路

当规则没法写死,可以让 LLM 来当"路由器"——给它当前 state,让它输出一个标签。

\`\`\`python
def llm_router(state) -> str:
    """用 LLM 判断该走哪条处理路径。"""
    prompt = f"""你是路由器。根据用户问题选择处理方式,只输出一个词:
- 简单常识问题 → 输出 'faq'
- 需要查资料的问题 → 输出 'rag'
- 需要写代码的问题 → 输出 'coder'
- 其他复杂问题 → 输出 'human'

用户问题:{state['question']}
"""
    label = llm.invoke(prompt).strip().lower()
    # 兜底:LLM 输出不在预期内时,走默认
    return label if label in {"faq", "rag", "coder", "human"} else "human"
\`\`\`

> **要点**:动态路由一定要有**兜底分支**,因为 LLM 可能输出意料外的内容。这是动态路由最常踩的坑。

### 51.4 循环检测:防止无限循环

循环结构(如 Agent 反复调工具)如果不加限制,会无限跑下去烧光 token。三种常见限制手段:

\`\`\`python
class LoopState(TypedDict):
    messages: Annotated[list, add_messages]
    step_count: int               # 法一:步数计数
    visited: dict                 # 法二:访问记录
    budget_tokens: int            # 法三:token 预算

def should_continue(state) -> str:
    # 法一:步数上限
    if state["step_count"] >= 10:
        return "end"
    # 法二:同一节点连续访问超阈值(防在两个节点间反复横跳)
    visits = state["visited"].get("agent", 0)
    if visits >= 5:
        return "end"
    # 法三:token 预算耗尽
    if state["budget_tokens"] <= 0:
        return "end"
    if state.get("done"):
        return "end"
    return "tool"
\`\`\`

**三种限制对比:**

| 方式 | 适用 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 步数上限 | 通用 | 简单直接 | 太死板,复杂任务可能不够 |
| 访问计数 | 防环路横跳 | 精准防死循环 | 需要维护 visited 字段 |
| token 预算 | 成本敏感 | 直接控成本 | 需要预估 token 消耗 |

### 51.5 子图:模块化复杂流程

当一个流程大到几十个节点,全部摊在一张图里会很难维护。LangGraph 允许把一组节点封装成"子图",作为单个节点挂到父图里——子图有自己的 State,通过字段映射和父图交互。

\`\`\`python
# 子图:一个独立的 RAG 流程
rag_builder = StateGraph(RAGState)
rag_builder.add_node("retrieve", retrieve_node)
rag_builder.add_node("rerank", rerank_node)
rag_builder.add_node("generate", generate_node)
rag_builder.add_edge(START, "retrieve")
rag_builder.add_edge("retrieve", "rerank")
rag_builder.add_edge("rerank", "generate")
rag_builder.add_edge("generate", END)
rag_app = rag_builder.compile()

# 父图:把整个 RAG 当一个节点
parent = StateGraph(ParentState)
# 直接把编译好的子图当节点加入
parent.add_node("rag", rag_app)
parent.add_node("answer", answer_node)
parent.add_edge(START, "rag")
parent.add_edge("rag", "answer")
parent.add_edge("answer", END)
\`\`\`

**子图的价值**:复用(同一个 RAG 子图被多个父图调用)、隔离(子图内部改动不影响父图结构)、可测试(子图能单独跑)。

### 51.6 Map-Reduce:并行处理多个

当输入是一个列表(如多个问题、多个文档),需要对每一项做相同处理再汇总,就用 Map-Reduce 模式。LangGraph 通过 \`Send\` API 实现扇出。

\`\`\`python
from langgraph.constants import Send

class MapState(TypedDict):
    topics: list                  # 待处理的主题列表
    summaries: Annotated[list, add]   # 各分支结果累加

def map_topics(state) -> list[Send]:
    """对每个主题发送一个并行任务到 summarize 节点。"""
    return [Send("summarize", {"topic": t}) for t in state["topics"]]

def summarize_node(state) -> dict:
    """每个并行分支独立总结一个主题。"""
    return {"summaries": [f"{state['topic']}的摘要"]}

gb = StateGraph(MapState)
gb.add_node("summarize", summarize_node)
gb.add_conditional_edges(START, map_topics, ["summarize"])  # 扇出
gb.add_edge("summarize", END)                                # 汇合
app = gb.compile()

result = app.invoke({"topics": ["AI", "量子", "航天"]})
print(result["summaries"])  # ['AI的摘要', '量子的摘要', '航天的摘要']
\`\`\`

### 51.7 实战:客服路由系统

需求:用户提问 → LLM 分类 → 简单问题走 FAQ、复杂问题走 RAG、技术问题转专家 Agent → 输出。

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

class CSState(TypedDict):
    messages: Annotated[list, add_messages]
    question: str
    intent: str
    answer: str

def classify_node(state: CSState) -> dict:
    """用 LLM 给用户问题分类。"""
    prompt = f"判断问题类型,只输出 faq/rag/expert 之一。问题:{state['question']}"
    intent = llm.invoke(prompt).strip()
    # 兜底:异常输出走 expert
    if intent not in {"faq", "rag", "expert"}:
        intent = "expert"
    return {"intent": intent}

def faq_node(state: CSState) -> dict:
    return {"answer": "[FAQ] 这是我们常见问题的标准答案。"}

def rag_node(state: CSState) -> dict:
    return {"answer": "[RAG] 检索知识库后生成的回答。"}

def expert_node(state: CSState) -> dict:
    return {"answer": "[专家] 已转接技术专家,工单号 #1024。"}

def route_intent(state: CSState) -> str:
    return state["intent"]

gb = StateGraph(CSState)
gb.add_node("classify", classify_node)
gb.add_node("faq", faq_node)
gb.add_node("rag", rag_node)
gb.add_node("expert", expert_node)
gb.add_edge(START, "classify")
gb.add_conditional_edges("classify", route_intent, {
    "faq": "faq", "rag": "rag", "expert": "expert"
})
for n in ["faq", "rag", "expert"]:
    gb.add_edge(n, END)
app = gb.compile()

# 测试三类问题
print(app.invoke({"question": "怎么改密码"})["answer"])
print(app.invoke({"question": "公司报销政策是什么"})["answer"])
print(app.invoke({"question": "生产环境数据库连不上"})["answer"])
\`\`\`

### 51.8 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 动态路由无兜底 | LLM 异常输出导致报错 | 默认分支兜底 |
| 路由函数返回节点名而非标签 | 耦合,难复用 | 返回逻辑标签,映射表翻译 |
| 子图与父图 State 字段不一致 | 数据传不进/出不来 | 显式做字段映射 |
| Map-Reduce 漏配累加 reducer | 并行结果互相覆盖 | summaries 用 \`Annotated[list, add]\` |
| 循环只看步数不看状态 | 死循环或过早终止 | 步数 + 状态双重判断 |

> **本章小结**:条件路由的核心是"路由函数返回标签 + 映射表翻译成节点";动态路由务必兜底;循环必须加退出条件;复杂流程用子图模块化;批量处理用 Map-Reduce 的 \`Send\` 扇出。下一章讲人机协作。`,
  },

  // =============================================================
  // 第五十二章:人机协作(Human in the Loop)
  // =============================================================
  {
    id: 'langgraph-human',
    group: 'LangGraph 工作流',
    icon: '👨‍💻',
    title: '人机协作(Human in the Loop)',
    content: `## 第五十二章　人机协作(Human in the Loop)

Agent 全自动并不总是好事——发邮件、转账、删数据这类"不可逆"动作,你敢让 Agent 直接执行吗?本章讲 LangGraph 如何让 Agent 在关键节点"停下来等人"。

### 52.1 为什么需要人机协作

全自动 Agent 的风险:

- **不可逆操作**:Agent 误发邮件给全公司、误删生产库,后果无法挽回;
- **高价值决策**:签合同、批预算、改配置,机器决策风险太高;
- **质量保证**:AI 起草的内容,人工审一眼再发,质量更稳;
- **合规要求**:金融、医疗等行业法规要求关键决策必须有人参与;
- **纠错机会**:Agent 理解错了意图,人能在执行前纠正,避免连锁错误。

> 一句话:**人机协作不是不信任 Agent,而是给 Agent 装上"刹车"和"方向盘"。**全自动适合低风险高频任务,关键节点必须有人这道"安全阀"。

### 52.2 LangGraph 的暂停机制:interrupt

LangGraph 提供两种暂停方式,都在编译时声明:

| 配置 | 含义 | 典型场景 |
| --- | --- | --- |
| \`interrupt_before=["node"]\` | 执行该节点**之前**暂停 | 节点有副作用前让人审核 |
| \`interrupt_after=["node"]\` | 执行该节点**之后**暂停 | 看节点输出再决定下一步 |

\`\`\`python
# 编译时指定:在 send_email 节点执行前暂停
app = graph_builder.compile(
    interrupt_before=["send_email"]   # 这个节点执行前停下来
)

# 第一次调用:跑到 send_email 之前会暂停
config = {"configurable": {"thread_id": "user-001"}}
result = app.invoke({"email_draft": "..."}, config)
# 此时 state 停在 send_email 之前,人工可以看草稿

# 人工审核后,用 None 恢复执行(继续跑 send_email)
result = app.invoke(None, config)
\`\`\`

**关键点:暂停和恢复依赖 \`thread_id\`**。LangGraph 用线程 ID 把整个执行过程的状态(checkpoint)持久化下来,暂停时状态存盘,恢复时从存盘点继续。所以人机协作通常配合 \`checkpointer\` 一起用。

### 52.3 配置 Checkpointer 持久化

要让中断后能恢复,必须给图配一个"检查点存储"。

\`\`\`python
from langgraph.checkpoint.memory import MemorySaver

# 内存版(开发调试用,重启丢失)
checkpointer = MemorySaver()
app = graph_builder.compile(
    checkpointer=checkpointer,
    interrupt_before=["send_email"],
)
\`\`\`

生产环境用数据库版:

\`\`\`python
# 生产推荐:用 Postgres / SQLite 持久化
from langgraph.checkpoint.postgres import PostgresSaver
# 或
from langgraph.checkpoint.sqlite import SqliteSaver
\`\`\`

### 52.4 Command:带数据恢复执行

恢复执行时如果只是"继续跑",传 \`None\` 即可。但更常见的是**人工带审核结果继续**——比如人修改了草稿、或决定改走别的节点。这时用 \`Command\` 对象传数据。

\`\`\`python
from langgraph.types import Command

# 场景:人工审核后,把修改后的草稿塞回去继续执行
result = app.invoke(
    Command(resume={"email_draft": "人工修改后的最终草稿..."}),
    config,
)
\`\`\`

\`Command\` 还能指定下一个要去的节点(\`goto\`),实现"人工决定改路":

\`\`\`python
# 人工判断后决定不发了,直接结束
result = app.invoke(Command(goto=END, update={"status": "cancelled"}), config)
\`\`\`

### 52.5 典型流程:审核-修改-继续

一个完整的"AI 起草→人工审→定稿→发送"流程:

\`\`\`python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command

class EmailState(TypedDict):
    user_request: str      # 用户要发什么邮件
    draft: str             # AI 起草的草稿
    final: str             # 定稿
    sent: bool            # 是否已发送

def draft_node(state: EmailState) -> dict:
    """AI 起草邮件草稿。"""
    draft = llm.invoke(f"为以下需求写一封邮件:{state['user_request']}")
    return {"draft": draft}

def send_node(state: EmailState) -> dict:
    """发送最终邮件(模拟)。"""
    print(f"已发送邮件:{state['final']}")
    return {"sent": True}

gb = StateGraph(EmailState)
gb.add_node("draft", draft_node)
gb.add_node("send", send_node)
gb.add_edge(START, "draft")
gb.add_edge("draft", "send")
gb.add_edge("send", END)

# 编译:在 send 之前暂停,等人工审核
app = gb.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["send"],
)

config = {"configurable": {"thread_id": "email-001"}}

# 步骤 1:AI 起草草稿(到 send 前暂停)
state = app.invoke({"user_request": "向客户催款"}, config)
print("AI 草稿:", state["draft"])

# 步骤 2:人工审核草稿,觉得措辞太硬,修改后用 Command 恢复
state = app.invoke(
    Command(update={"final": state["draft"] + "\\n\\n(人工补充:祝商旅)"}),
    config,
)
print("已发送:", state["sent"])
\`\`\`

### 52.6 超时处理

人不可能一直盯着等审核。生产系统要处理"人一直不响应"的情况:

\`\`\`python
import time

def run_with_timeout(app, config, timeout_sec=3600):
    """给人工审核设超时,超时则走默认动作。"""
    start = time.time()
    state = app.get_state(config)
    # 如果当前停在 interrupt 节点,等待人工
    while state.next:  # next 非空说明还在暂停
        if time.time() - start > timeout_sec:
            # 超时:走默认安全动作(如取消发送)
            return app.invoke(
                Command(goto=END, update={"final": "超时取消", "sent": False}),
                config,
            )
        time.sleep(5)
        state = app.get_state(config)
    return state.values
\`\`\`

### 52.7 人机协作的典型场景

| 场景 | 暂停节点 | 人工动作 | 恢复方式 |
| --- | --- | --- | --- |
| **审批** | execute 前 | 批准/拒绝 | Command(goto=END/继续) |
| **纠错** | generate 后 | 改草稿/改参数 | Command(update={...}) |
| **补充信息** | 调用工具前 | 提供缺失参数 | Command(resume={参数}) |
| **多轮确认** | 每个关键步 | 逐步确认 | 多次 invoke(None) |
| **质量门禁** | 输出前 | 检查是否达标 | 通过则继续,否则重做 |

### 52.8 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 忘记配 checkpointer | 暂停后状态丢失,无法恢复 | compile 时传入 checkpointer |
| thread_id 不固定 | 不同请求状态串了 | 每个会话用唯一 thread_id |
| 用 invoke(None) 却没等审核 | 直接继续跑,失去人机意义 | 前端触发恢复才调用 |
| interrupt_before 节点名写错 | 不在预期处暂停 | 节点名与 add_node 一致 |
| 超时不处理 | 任务永远卡住 | 设超时走兜底动作 |

### 52.9 设计建议

1. **明确哪些节点该暂停**:有副作用(发消息/写库/花钱)且不可逆的,必须暂停;
2. **给人工足够上下文**:暂停时把草稿、原因、备选都展示给审核者,别让人盲批;
3. **提供"一键通过/拒绝/修改"**:降低人工操作成本;
4. **审计日志**:谁在何时审核了什么、改了什么,全记下来。

> **本章小结**:人机协作用 \`interrupt_before/after\` 暂停、\`Command\` 恢复,配合 \`checkpointer\` 持久化状态。关键在于"哪些步骤该停、停了给人看什么、人怎么操作恢复"。到这里 LangGraph 的核心就讲完了,下一批章节进入多 Agent 协作。`,
  },
];
