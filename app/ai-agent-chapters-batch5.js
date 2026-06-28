// =============================================================
// AI Agent开发实战 - 第五批章节（第五部分，共 4 章）
// =============================================================

const chapters = [
  // =============================================================
  // 第17章：从零构建一个简单Agent
  // =============================================================
  {
    id: 'a-ch17',
    group: '第五部分 Agent实战开发',
    icon: '🔨',
    title: '从零构建一个简单Agent',
    content: `## 第十七章　从零构建一个简单Agent

### 引言：理解Agent的本质

在动手写代码之前，我们先要回答一个根本问题：**到底什么是 Agent？** 很多人会把 Agent 等同于"带工具调用的 LLM"，这种理解不算错，但过于简化。一个真正意义上的 Agent，至少要具备以下三个能力：

- **感知（Perception）**：能接收用户输入、环境状态、工具返回结果，并将其转化为 LLM 可理解的上下文。
- **推理与决策（Reasoning & Decision）**：能基于当前上下文判断"下一步该做什么"——是直接回答、还是调用某个工具、还是终止循环。
- **行动（Action）**：能真正去执行某个动作（调用工具、修改文件、发请求等），并把执行结果反馈到下一轮推理。

这三个能力构成一个闭环：感知 → 推理 → 行动 → 再感知。这就是所谓的 **Agent Loop（Agent 循环）**。理解了这一点，你就会发现 Agent 并不神秘——它的核心就是一个 while 循环，循环体里调用 LLM 并按需执行工具。

> 💡 **重要提醒**：市面上各种 Agent 框架（LangChain Agent、AutoGen、CrewAI 等）本质上都在做这件事——封装这个循环。理解了裸实现，再用框架时你才会知道框架在帮你做什么、它的边界在哪里。这也是为什么本章不依赖任何框架。

### 17.1 设计思路：一个最简 Agent 的组成

我们要构建的 Agent 需要完成这样一个场景：用户提问"北京今天天气怎么样？"，Agent 能够：

1. 识别出需要查询天气
2. 调用模拟的天气查询工具
3. 拿到结果后用自然语言回答用户

为此，我们的 Agent 由以下几个部分组成：

- **工具集（Tools）**：一个字典，键是工具名，值是可调用函数及其描述。
- **系统提示（System Prompt）**：告诉 LLM 它是谁、能用哪些工具、如何调用。
- **对话历史（Messages）**：维护多轮对话上下文。
- **主循环（Agent Loop）**：反复调用 LLM，直到 LLM 不再请求工具调用。

### 17.2 第一步：定义工具

工具是 Agent 的"手脚"。我们先用纯 Python 定义两个工具：一个查询天气，一个做简单计算。

\`\`\`python
# tools.py —— 工具定义
import json
from datetime import datetime

def get_weather(city: str) -> str:
    """
    查询指定城市的天气（演示用，返回模拟数据）。
    真实场景应调用天气 API，如和风天气、OpenWeatherMap。
    """
    # 模拟数据：真实场景中这里发 HTTP 请求
    mock_data = {
        "北京": {"temp": 26, "weather": "晴", "wind": "北风3级"},
        "上海": {"temp": 28, "weather": "多云", "wind": "东南风2级"},
        "广州": {"temp": 31, "weather": "雷阵雨", "wind": "南风2级"},
    }
    info = mock_data.get(city)
    if not info:
        return json.dumps({"error": f"暂不支持城市：{city}"}, ensure_ascii=False)
    return json.dumps({
        "city": city,
        "temp": info["temp"],
        "weather": info["weather"],
        "wind": info["wind"],
        "query_time": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }, ensure_ascii=False)

def calculate(expression: str) -> str:
    """
    安全地计算数学表达式。
    注意：生产环境绝不能用 eval，这里仅作演示。
    真实场景应使用 ast.literal_eval 或 sympy。
    """
    try:
        # 仅允许数字和基本运算符
        allowed = set("0123456789+-*/(). ")
        if not all(c in allowed for c in expression):
            return json.dumps({"error": "表达式包含非法字符"}, ensure_ascii=False)
        result = eval(expression, {"__builtins__": {}}, {})
        return json.dumps({"expression": expression, "result": result}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": f"计算失败：{str(e)}"}, ensure_ascii=False)
\`\`\`

接下来，我们把工具注册到一个统一的结构里，方便后续传给 LLM。这里我们手动构造 OpenAI Function Calling 所需的 JSON Schema：

\`\`\`python
# 工具注册表：包含函数本身 + 给 LLM 看的 schema
TOOL_REGISTRY = {
    "get_weather": {
        "callable": get_weather,
        "description": "查询指定城市的实时天气。当用户询问天气相关信息时调用。",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "要查询天气的城市名，例如：北京、上海"
                }
            },
            "required": ["city"]
        }
    },
    "calculate": {
        "callable": calculate,
        "description": "计算数学表达式的值。仅支持加减乘除和括号。",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "数学表达式，例如：3 + 5 * 2"
                }
            },
            "required": ["expression"]
        }
    }
}

def get_tools_schema():
    """把注册表转成 OpenAI API 所需的 tools 格式"""
    return [
        {
            "type": "function",
            "function": {
                "name": name,
                "description": tool["description"],
                "parameters": tool["parameters"]
            }
        }
        for name, tool in TOOL_REGISTRY.items()
    ]
\`\`\`

### 17.3 第二步：构建系统提示

系统提示决定了 Agent 的"性格"和行为边界。一个好的系统提示应该明确：

- Agent 的角色和能力边界
- 可用工具及其使用场景
- 输出格式要求
- 安全约束

\`\`\`python
SYSTEM_PROMPT = """你是一个乐于助人的中文 AI 助手。

你具备以下能力：
1. 查询天气：当用户询问某地天气时，调用 get_weather 工具。
2. 数学计算：当用户需要计算数学表达式时，调用 calculate 工具。

行为准则：
- 当用户问题需要外部数据（如天气、计算）时，**必须**调用对应工具，不要编造答案。
- 调用工具后，根据工具返回的结果用自然语言回答用户，不要直接输出 JSON。
- 如果用户的请求超出你的能力范围，诚实告知。
- 回答使用中文，语气友好。
"""
\`\`\`

### 17.4 第三步：实现 Agent 主循环

这是整个 Agent 的核心。我们用 OpenAI SDK 的 chat completions 接口，并启用 function calling。

\`\`\`python
# agent.py —— Agent 主程序
import os
import json
from openai import OpenAI
from tools import TOOL_REGISTRY, get_tools_schema, SYSTEM_PROMPT

# 初始化客户端（建议用环境变量管理 key，切勿硬编码）
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
MODEL = "gpt-4o-mini"

def execute_tool(name: str, arguments: dict) -> str:
    """根据工具名执行对应函数，返回字符串结果"""
    tool = TOOL_REGISTRY.get(name)
    if not tool:
        return json.dumps({"error": f"未知工具：{name}"}, ensure_ascii=False)
    try:
        # 调用真正的 Python 函数
        result = tool["callable"](**arguments)
        return result
    except Exception as e:
        return json.dumps({"error": f"工具执行异常：{str(e)}"}, ensure_ascii=False)

def run_agent(user_input: str, max_iterations: int = 10) -> str:
    """
    Agent 主循环。
    max_iterations 防止 LLM 陷入无限调用工具的死循环。
    """
    # 初始化对话历史
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input},
    ]

    for i in range(max_iterations):
        print(f"\\n--- 第 {i + 1} 轮迭代 ---")

        # 1. 调用 LLM
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=get_tools_schema(),
            tool_choice="auto",  # 让模型自己决定是否调用工具
        )
        msg = response.choices[0].message

        # 2. 把 assistant 的回复加入历史
        messages.append(msg.model_dump(exclude_none=True))

        # 3. 检查是否需要调用工具
        if not msg.tool_calls:
            # 没有工具调用，说明 LLM 已经给出最终答案
            print("Agent 直接回答，循环结束。")
            return msg.content

        # 4. 执行所有工具调用
        for tool_call in msg.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)
            print(f"调用工具：{fn_name}({fn_args})")

            # 执行工具
            result = execute_tool(fn_name, fn_args)
            print(f"工具返回：{result}")

            # 把工具结果作为 tool 角色消息回填到对话
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

    return "⚠️ Agent 达到最大迭代次数仍未给出最终答案。"

if __name__ == "__main__":
    # 测试用例 1：天气查询
    answer = run_agent("北京今天天气怎么样？")
    print("\\n最终回答：", answer)

    # 测试用例 2：数学计算
    answer = run_agent("帮我算一下 (15 + 27) * 3 等于多少？")
    print("\\n最终回答：", answer)
\`\`\`

### 17.5 代码逐行解析

让我们把上面这段代码拆开理解：

**初始化部分：**
- \`OpenAI(api_key=...)\`：创建客户端实例。从 OpenAI v1 开始，必须显式实例化 client，不再使用全局函数。
- \`MODEL = "gpt-4o-mini"\`：选用性价比高的小模型即可，简单 Agent 不需要最强模型。

**execute_tool 函数：**
- 通过 \`TOOL_REGISTRY[name]\` 拿到工具的可调用对象，再用 \`**arguments\` 解包参数。
- 用 try/except 包裹，**永远不让工具异常冒泡到主循环**，否则一个工具报错整个 Agent 就崩了。返回 JSON 字符串形式的错误，让 LLM 自己判断怎么处理。

**run_agent 主循环：**
- \`messages\` 维护对话历史。第一轮包含 system 和 user 两条消息。
- \`tool_choice="auto"\`：让模型自行决定。你也可以传 \`"none"\` 强制不调用，或传 \`{"type": "function", "function": {"name": "xxx"}}\` 强制调用某个工具。
- \`msg.tool_calls\` 为空表示 LLM 认为不需要再调工具，可以给用户最终答案，循环退出。
- 工具结果必须用 \`role="tool"\` 回填，并附上 \`tool_call_id\`，这样 LLM 才能把结果和它发出的调用对应起来。

### 17.6 运行效果

执行上面代码，输出大致如下：

\`\`\`
--- 第 1 轮迭代 ---
调用工具：get_weather({'city': '北京'})
工具返回：{"city": "北京", "temp": 26, "weather": "晴", ...}

--- 第 2 轮迭代 ---
Agent 直接回答，循环结束。

最终回答： 北京今天天气晴朗，气温约 26℃，北风 3 级，整体比较舒适，适合外出。
\`\`\`

可以看到，Agent 经历了"识别意图→调用工具→拿到数据→组织语言回答"的完整流程，而这正是 Agent 区别于普通聊天机器人的关键。

### 17.7 关键设计要点与避坑指南

**1. 一定要限制最大迭代次数**
LLM 有时会陷入"调工具→再调工具→继续调工具"的死循环，特别是当工具返回结果不符合预期时。\`max_iterations\` 是一道安全网。

**2. 工具描述要写得详尽**
LLM 决定调用哪个工具，几乎完全依赖 \`description\` 字段。描述模糊会导致 LLM 误用工具。一个好的描述应该说明"什么场景下该用这个工具"。

**3. 工具返回值用 JSON 字符串**
结构化数据让 LLM 更容易解析。返回字符串虽然也能用，但 LLM 解析 JSON 比解析自然语言更稳定。

**4. 不要把工具的异常直接抛给 LLM**
工具内部错误应该被捕获，转成 \`{"error": "..."}\` 返回。LLM 看到 error 字段会自行判断是重试还是告知用户。

**5. 系统提示要约束行为边界**
明确告诉 LLM "什么情况下必须调用工具"和"什么情况下不要调用"，能显著降低幻觉。

### 17.8 本章小结

本章我们从零开始，用不到 150 行 Python 代码实现了一个具备工具调用能力的最小 Agent。核心要点：

- Agent 的本质是"感知-推理-行动"的循环。
- 工具 = 函数 + JSON Schema 描述。
- 主循环 = while + 调 LLM + 执行工具 + 回填结果。
- 安全网 = 最大迭代次数 + 异常捕获。

掌握了这个最小骨架，下一章我们将进入第一个完整实战项目——构建一个 RAG 问答 Agent，把检索增强生成和 Agent 循环结合起来。`
  },

  // =============================================================
  // 第18章：实战一——构建RAG问答Agent
  // =============================================================
  {
    id: 'a-ch18',
    group: '第五部分 Agent实战开发',
    icon: '❓',
    title: '实战一:构建RAG问答Agent',
    content: `## 第十八章　实战一：构建RAG问答Agent

### 18.1 项目背景与需求分析

**场景描述**：假设你在一家科技公司工作，公司积累了大量内部文档——产品手册、技术规范、FAQ、会议纪要等。新员工入职时总问重复的问题，老员工不胜其烦。我们希望构建一个"内部知识问答机器人"，员工用自然语言提问，机器人基于公司文档给出准确回答，并附上出处。

这就是典型的 **RAG（Retrieval-Augmented Generation，检索增强生成）** 场景。相比直接让 LLM 凭记忆回答，RAG 有三大优势：

- **时效性**：LLM 训练数据有截止日期，RAG 可以查询最新文档。
- **私有性**：公司内部文档 LLM 从未见过，RAG 让 LLM "临时学习"。
- **可溯源性**：每个回答都能指出依据哪份文档哪一段，可信度更高。

**功能需求：**

- 支持上传 PDF / Markdown / TXT 等多种格式文档。
- 自动分块、向量化、存入向量数据库。
- 用户提问后检索 top-k 相关片段，拼入 prompt 让 LLM 回答。
- 回答附带引用来源。
- 提供简易 Web UI。

**技术选型：**

| 组件 | 选型 | 理由 |
| --- | --- | --- |
| LLM | OpenAI GPT-4o-mini | 性价比高，中文表现好 |
| Embedding | text-embedding-3-small | 1536 维，便宜稳定 |
| 向量库 | Chroma | 轻量、纯 Python、易上手 |
| 文档处理 | LangChain | 生态完善，开箱即用 |
| Web UI | Gradio | 几行代码出界面 |

### 18.2 整体架构设计

\`\`\`
用户提问
   │
   ▼
[Embedding 查询] → 生成问题向量
   │
   ▼
[Chroma 检索] → 返回 top-k 相关文档块
   │
   ▼
[Prompt 拼装] → system + context + question
   │
   ▼
[LLM 生成] → 返回答案 + 引用
   │
   ▼
[UI 展示]
\`\`\`

整个流程分为**离线索引**和**在线问答**两条线：
- 离线：文档加载 → 切分 → 向量化 → 入库。
- 在线：问题向量化 → 检索 → 拼 prompt → LLM → 输出。

### 18.3 第一步：文档处理与切分

\`\`\`python
# ingest.py —— 文档处理与向量化入库
import os
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredMarkdownLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 支持的文件扩展名与对应 loader
LOADER_MAP = {
    ".txt": TextLoader,
    ".pdf": PyPDFLoader,
    ".md": UnstructuredMarkdownLoader,
}

def load_document(file_path: str):
    """根据扩展名选择合适的 loader 加载文档"""
    ext = os.path.splitext(file_path)[1].lower()
    loader_cls = LOADER_MAP.get(ext)
    if not loader_cls:
        raise ValueError(f"不支持的文件格式：{ext}")
    loader = loader_cls(file_path)
    return loader.load()

def split_documents(docs, chunk_size=500, chunk_overlap=50):
    """
    递归切分文档。
    chunk_size：每块最大字符数。
    chunk_overlap：相邻块重叠字符数，避免切断语义。
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\\n\\n", "\\n", "。", "！", "？", "；", " ", ""],
    )
    return splitter.split_documents(docs)

def build_vectorstore(docs, persist_dir="./chroma_db"):
    """把文档块向量化并持久化到 Chroma"""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=persist_dir,
    )
    return vectordb

def ingest_directory(dir_path: str):
    """批量处理目录下所有支持格式的文档"""
    all_chunks = []
    for root, _, files in os.walk(dir_path):
        for fname in files:
            fpath = os.path.join(root, fname)
            try:
                docs = load_document(fpath)
                chunks = split_documents(docs)
                all_chunks.extend(chunks)
                print(f"✅ 已处理：{fpath}，切分为 {len(chunks)} 块")
            except Exception as e:
                print(f"❌ 处理失败：{fpath}，原因：{e}")
    print(f"\\n共生成 {len(all_chunks)} 个文档块，开始入库...")
    db = build_vectorstore(all_chunks)
    print("✅ 向量库构建完成！")
    return db

if __name__ == "__main__":
    # 把 ./docs 目录下所有文档入库
    ingest_directory("./docs")
\`\`\`

**切分策略说明**：\`RecursiveCharacterTextSplitter\` 会按分隔符列表依次尝试，优先在段落边界切，其次句子边界，最后才硬切。中文场景下我们加入了"。""！"等中文标点作为分隔符，能更好地保留语义完整性。

### 18.4 第二步：构建检索器

\`\`\`python
# retriever.py —— 检索模块
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

def get_retriever(persist_dir="./chroma_db", k=4):
    """加载已持久化的向量库，返回检索器"""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectordb = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings,
    )
    # k 表示返回 top-k 最相关的文档块
    return vectordb.as_retriever(search_kwargs={"k": k})

def search(query: str, k=4):
    """直接返回检索结果，便于调试"""
    retriever = get_retriever(k=k)
    return retriever.invoke(query)
\`\`\`

> 💡 **参数选择经验**：k 一般取 3~6。太小召回不全，太大引入噪声反而拉低回答质量。可以先用 k=4 跑一遍看效果再调。

### 18.5 第三步：整合 Agent 与 LLM

这里我们不用 LangChain 的 RetrievalQA，而是手动拼装，便于控制和调试。

\`\`\`python
# rag_agent.py —— RAG 问答 Agent 核心
import os
from openai import OpenAI
from retriever import get_retriever

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o-mini"

RAG_PROMPT = """你是一个严谨的内部知识问答助手。请根据下面提供的"参考资料"回答用户问题。

规则：
1. 只能基于参考资料作答，不要编造资料中不存在的信息。
2. 如果资料不足以回答，直接说"根据现有资料无法回答该问题"，不要瞎猜。
3. 回答末尾用 [资料n] 的形式标注引用了哪几条资料。
4. 回答使用中文，条理清晰。

参考资料：
{context}

用户问题：{question}
"""

def build_context(docs):
    """把检索到的文档块拼成 context 字符串"""
    parts = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "未知来源")
        parts.append(f"[资料{i}] 来源：{source}\\n{doc.page_content}")
    return "\\n\\n".join(parts)

def answer_question(question: str, k: int = 4) -> dict:
    """
    RAG 问答主入口。
    返回：{"answer": str, "sources": list}
    """
    # 1. 检索
    retriever = get_retriever(k=k)
    docs = retriever.invoke(question)
    if not docs:
        return {"answer": "未检索到任何相关资料。", "sources": []}

    # 2. 拼 prompt
    context = build_context(docs)
    prompt = RAG_PROMPT.format(context=context, question=question)

    # 3. 调 LLM
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,  # 低温保证回答稳定、忠于资料
    )
    answer = response.choices[0].message.content

    # 4. 整理来源
    sources = [
        {"source": d.metadata.get("source", "未知"), "preview": d.page_content[:80]}
        for d in docs
    ]
    return {"answer": answer, "sources": sources}

if __name__ == "__main__":
    result = answer_question("公司的请假流程是怎样的？")
    print("回答：", result["answer"])
    print("\\n引用来源：")
    for s in result["sources"]:
        print(f"  - {s['source']}：{s['preview']}...")
\`\`\`

**关键设计点说明：**

- \`temperature=0.1\`：RAG 场景要忠于资料，温度越低越不会"自由发挥"。
- prompt 中明确要求"不能编造"和"标注引用"，能显著降低幻觉。
- 返回结构同时包含 answer 和 sources，方便 UI 展示引用列表。

### 18.6 第四步：用 Gradio 搭建 Web UI

\`\`\`python
# app.py —— Gradio 界面
import gradio as gr
from rag_agent import answer_question

def chat(question, history):
    result = answer_question(question)
    # 把引用来源拼到回答末尾
    src_text = "\\n\\n**引用来源：**\\n"
    for i, s in enumerate(result["sources"], 1):
        src_text += f"{i}. {s['source']}\\n"
    return result["answer"] + src_text

demo = gr.ChatInterface(
    fn=chat,
    title="📚 内部知识问答 Agent",
    description="基于公司文档的 RAG 问答系统，回答附带引用来源。",
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
\`\`\`

运行 \`python app.py\` 后访问 http://localhost:7860 即可看到聊天界面。整体不到 100 行 Python 代码就跑通了一个完整的 RAG 应用。

### 18.7 常见问题与优化

**问题 1：检索结果不准，召回的文档块和问题不相关。**

可能原因与对策：
- 切分粒度问题：chunk_size 过大导致一个块里塞了多个主题，向量被稀释。尝试调小到 300。
- Embedding 模型不匹配：text-embedding-3-small 对中文支持不错，但如果文档非常专业（医疗、法律），可换 bge-large-zh 等中文专用模型。
- 缺少 query 改写：用户问题可能太口语化。可以在检索前让 LLM 把问题改写得更"检索友好"。

**问题 2：LLM 回答了资料里没有的内容（幻觉）。**

对策：
- 在 prompt 里加更强约束："如果参考资料中没有相关内容，必须回答'根据现有资料无法回答'"。
- 降低 temperature 到 0。
- 在 prompt 里强调"参考资料是唯一依据，禁止使用你自身的预训练知识"。

**问题 3：回答太长或太短。**

可以在 prompt 里指定回答风格："用 3~5 句话简明扼要回答"或"详细展开，分点说明"。

**进阶优化方向：**

- **混合检索**：向量检索 + 关键词检索（BM25），用 RRF 融合，兼顾语义和关键词匹配。
- **重排序（Rerank）**：召回 top-20 后用 cross-encoder 重排，取 top-4。Cohere Rerank、bge-reranker 效果都不错。
- **多轮对话支持**：把历史对话拼入检索 query，或用 LLM 做问题压缩。
- **增量更新**：文档变化时只对增量部分向量化，避免全量重建。Chroma 支持 upsert。
- **评估体系**：构建测试集，用 Ragas 等工具量化检索命中率、回答忠实度。

### 18.8 工程化建议

- **缓存层**：对相同 query 的检索结果和 embedding 做缓存，省 token、降延迟。
- **速率控制**：OpenAI API 有 RPM 限制，高并发场景要加队列和重试。
- **可观测性**：把每次检索的 query、召回的 chunk、最终 prompt 都记日志，便于排查"为什么答得不好"。
- **成本控制**：监控 embedding 和 chat 的 token 消耗，设预算告警。

### 18.9 本章小结

本章我们完整走通了 RAG 问答 Agent 的构建流程：从文档加载、切分、向量化，到检索、prompt 拼装、LLM 生成，再到 Gradio UI。一个能上线的 RAG 系统远不止这些，但本章的骨架足以让你快速验证业务可行性，再在其上迭代优化。

下一章我们将挑战更有难度的实战——构建一个能读写文件、执行代码的编程助手 Agent。`
  },

  // =============================================================
  // 第19章：实战二——构建代码助手Agent
  // =============================================================
  {
    id: 'a-ch19',
    group: '第五部分 Agent实战开发',
    icon: '💻',
    title: '实战二:构建代码助手Agent',
    content: `## 第十九章　实战二：构建代码助手Agent

### 19.1 项目目标与挑战

本章我们要构建一个**能真正动手写代码**的 Agent——它不仅能回答编程问题，还能：

- 读取本地文件
- 修改、创建文件
- 执行 Python 代码并获取输出
- 在代码库中搜索符号定义

这类 Agent 的代表产品有 Cursor、Claude Code、Aider 等。它们让 LLM 从"只能聊天的助手"升级成"能干活的同事"。

**核心挑战：**

1. **安全**：执行任意代码意味着任意命令执行风险。必须做沙箱隔离。
2. **上下文管理**：代码库动辄上万行，不可能全塞进 prompt。需要精准检索。
3. **工具协调**：读文件→分析→改文件→运行→看报错→再改，是一个多步工作流。
4. **效果评估**：怎么判断 Agent "做得对"？需要明确的验收标准。

> ⚠️ **安全警示**：让 LLM 执行代码是高风险操作。本章示例仅用于学习，**绝对不要在生产环境直接暴露给公网**。务必配合容器隔离、资源限制、网络隔离等手段。

### 19.2 整体架构

\`\`\`
用户指令："给 utils.py 加一个去重函数并写测试"
   │
   ▼
[Agent Loop]
   ├── 工具：read_file      → 读 utils.py
   ├── 工具：write_file     → 修改 utils.py
   ├── 工具：run_python     → 跑测试
   ├── 工具：search_code    → 搜相关定义
   └── ...
   │
   ▼
最终回答 + 文件已修改
\`\`\`

### 19.3 第一步：设计沙箱执行环境

执行用户/LLM 生成的代码，必须满足：

- **文件系统隔离**：不能影响宿主机。用独立工作目录。
- **超时控制**：防止死循环耗尽资源。
- **输出捕获**：stdout/stderr 都要拿到。
- **导入限制**：禁止 os.system、subprocess 等危险操作（学习版可放宽）。

我们用 Python 的 \`subprocess\` + 临时目录 + 超时来实现一个轻量沙箱：

\`\`\`python
# sandbox.py —— 代码执行沙箱
import subprocess
import tempfile
import os
import shutil

class CodeSandbox:
    """
    轻量代码沙箱：在临时目录执行 Python 代码，带超时和输出捕获。
    生产环境建议改用 Docker 容器或 firecracker microVM。
    """
    def __init__(self, workdir=None, timeout=10):
        self.timeout = timeout
        # 如果未指定 workdir，就创建临时目录
        self.own_temp = workdir is None
        self.workdir = workdir or tempfile.mkdtemp(prefix="sandbox_")

    def run(self, code: str) -> dict:
        """
        执行一段 Python 代码。
        返回：{"success": bool, "stdout": str, "stderr": str, "returncode": int}
        """
        # 把代码写到临时文件再执行，避免命令行参数过长
        script_path = os.path.join(self.workdir, "_run.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            result = subprocess.run(
                ["python3", script_path],
                cwd=self.workdir,
                capture_output=True,
                text=True,
                timeout=self.timeout,
            )
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"⏱ 执行超时（{self.timeout}秒）",
                "returncode": -1,
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"沙箱异常：{str(e)}",
                "returncode": -2,
            }

    def cleanup(self):
        if self.own_temp and os.path.exists(self.workdir):
            shutil.rmtree(self.workdir)
\`\`\`

### 19.4 第二步：定义工具集

我们为 Agent 提供四个核心工具：读文件、写文件、运行代码、搜索符号。

\`\`\`python
# tools.py —— 代码助手工具集
import os
import re
import json

WORKSPACE = "./workspace"  # Agent 工作目录，所有文件操作限制在此目录下

def _safe_path(rel_path: str) -> str:
    """防止路径穿越攻击，确保最终路径在 WORKSPACE 内"""
    abs_path = os.path.abspath(os.path.join(WORKSPACE, rel_path))
    if not abs_path.startswith(os.path.abspath(WORKSPACE)):
        raise PermissionError("禁止访问工作目录之外的文件")
    return abs_path

def read_file(path: str) -> str:
    """读取工作目录下的文件内容"""
    try:
        abs_path = _safe_path(path)
        if not os.path.exists(abs_path):
            return json.dumps({"error": f"文件不存在：{path}"}, ensure_ascii=False)
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
        # 限制返回长度，避免占用过多 token
        if len(content) > 8000:
            content = content[:8000] + "\\n\\n...（文件较长，已截断）"
        return json.dumps({"path": path, "content": content}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)

def write_file(path: str, content: str) -> str:
    """写入或覆盖文件"""
    try:
        abs_path = _safe_path(path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        return json.dumps({"path": path, "bytes_written": len(content.encode())}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)

def run_python(code: str) -> str:
    """在沙箱中执行 Python 代码"""
    from sandbox import CodeSandbox
    sb = CodeSandbox(timeout=10)
    result = sb.run(code)
    sb.cleanup()
    return json.dumps(result, ensure_ascii=False)

def search_code(pattern: str, file_ext: str = ".py") -> str:
    """
    在工作目录下搜索代码，返回匹配的文件和行。
    pattern 支持 Python 正则。
    """
    try:
        regex = re.compile(pattern)
    except re.error as e:
        return json.dumps({"error": f"正则非法：{e}"}, ensure_ascii=False)

    matches = []
    for root, _, files in os.walk(WORKSPACE):
        for fname in files:
            if not fname.endswith(file_ext):
                continue
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, WORKSPACE)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    for i, line in enumerate(f, 1):
                        if regex.search(line):
                            matches.append({"file": rel, "line": i, "text": line.strip()})
                            if len(matches) >= 30:
                                return json.dumps({"matches": matches, "truncated": True}, ensure_ascii=False)
            except Exception:
                continue
    return json.dumps({"matches": matches}, ensure_ascii=False)

TOOL_REGISTRY = {
    "read_file": {
        "callable": read_file,
        "description": "读取工作目录下的文件内容。path 为相对工作目录的路径。",
        "parameters": {
            "type": "object",
            "properties": {"path": {"type": "string", "description": "相对路径，如 src/utils.py"}},
            "required": ["path"],
        },
    },
    "write_file": {
        "callable": write_file,
        "description": "创建或覆盖文件。会自动创建父目录。",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string", "description": "要写入的完整文件内容"},
            },
            "required": ["path", "content"],
        },
    },
    "run_python": {
        "callable": run_python,
        "description": "在沙箱中执行一段 Python 代码，返回 stdout/stderr。超时10秒。",
        "parameters": {
            "type": "object",
            "properties": {"code": {"type": "string", "description": "Python 代码"}},
            "required": ["code"],
        },
    },
    "search_code": {
        "callable": search_code,
        "description": "用正则搜索代码库，返回匹配的文件、行号、文本。",
        "parameters": {
            "type": "object",
            "properties": {
                "pattern": {"type": "string", "description": "Python 正则"},
                "file_ext": {"type": "string", "description": "文件扩展名，默认 .py"},
            },
            "required": ["pattern"],
        },
    },
}
\`\`\`

### 19.5 第三步：Agent 主程序

\`\`\`python
# coding_agent.py —— 代码助手 Agent
import os
import json
from openai import OpenAI
from tools import TOOL_REGISTRY

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
MODEL = "gpt-4o"

SYSTEM_PROMPT = """你是一个资深 Python 工程师 Agent，能读写文件、执行代码、搜索代码库。

工作原则：
1. 接到任务后先 read_file 或 search_code 了解现状，不要凭空猜测。
2. 修改文件时，先用 read_file 读取当前完整内容，再 write_file 写入修改后的版本。
3. 写完代码用 run_python 跑一下，确认能正常运行。看到报错要分析并修复。
4. 完成任务后用简短中文总结你做了什么。
5. 涉及破坏性操作（删除、覆盖）前先告知。
"""

def get_tools_schema():
    return [
        {"type": "function", "function": {"name": n, "description": t["description"], "parameters": t["parameters"]}}
        for n, t in TOOL_REGISTRY.items()
    ]

def execute_tool(name, arguments):
    tool = TOOL_REGISTRY.get(name)
    if not tool:
        return json.dumps({"error": f"未知工具：{name}"}, ensure_ascii=False)
    try:
        return tool["callable"](**arguments)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)

def run(task: str, max_iter: int = 20) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": task},
    ]
    for i in range(max_iter):
        print(f"--- 迭代 {i+1} ---")
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=get_tools_schema(),
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg.model_dump(exclude_none=True))
        if not msg.tool_calls:
            return msg.content
        for tc in msg.tool_calls:
            name = tc.function.name
            args = json.loads(tc.function.arguments)
            print(f"调用 {name}({args})")
            result = execute_tool(name, args)
            print(f"→ {result[:200]}")
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
    return "已达最大迭代次数"

if __name__ == "__main__":
    os.makedirs("./workspace", exist_ok=True)
    # 测试任务：创建一个去重函数并测试
    result = run("请在 workspace 里创建 dedupe.py，实现一个 list_dedupe 函数（保持顺序去重），并写测试验证它能处理普通列表、含 None 的列表、空列表。最后运行测试给我看结果。")
    print("\\n最终总结：", result)
\`\`\`

### 19.6 典型运行过程

执行上面任务，Agent 大致会经历这样的流程：

1. **search_code** 查找是否已有 dedupe.py → 没有
2. **write_file** 创建 dedupe.py，写入函数实现
3. **write_file** 创建 test_dedupe.py，写入测试
4. **run_python** 执行测试 → 看到全部通过
5. 输出总结："已创建 dedupe.py 和测试文件，运行测试全部通过..."

这正是人类程序员的工作流程被 Agent 化复现。Agent 的价值在于把"读→改→跑→改"的循环自动化了。

### 19.7 与 Cursor / Claude Code 的对比

| 维度 | 我们的迷你 Agent | Cursor | Claude Code |
| --- | --- | --- | --- |
| 工具集 | 4 个基础工具 | 丰富（语义检索、apply diff、终端等） | 文件操作、Bash、WebFetch 等 |
| 上下文管理 | 全靠 prompt | 代码库索引 + 智能选片段 | 自动压缩历史 |
| 编辑方式 | 全文件覆写 | apply_patch 增量 diff | 全文件或 diff |
| 安全控制 | 临时目录沙箱 | 用户确认 + 本地执行 | 用户确认 + 容器 |
| 交互形式 | 命令行单轮 | IDE 内嵌对话 | 终端对话 + 多步确认 |

可以看到，我们的迷你版本和工业级产品差距主要在三点：

1. **上下文管理**：大代码库无法整体塞进 prompt，工业级产品都用 embedding 检索 + 智能裁剪。我们本章简化为正则搜索，适合小项目。
2. **编辑粒度**：全文件覆写对小文件够用，大文件必须用 diff。Cursor 的 apply_patch 是关键创新。
3. **人机协作**：工业级产品都有"用户确认每一步"的能力，让 Agent 在关键操作前暂停等用户拍板。这是生产可用性的核心。

### 19.8 进阶优化方向

**1. 用 diff 代替全文件写入**
让 LLM 输出类似 unified diff 的格式，工具负责 apply。能大幅减少 token 消耗，且避免误覆盖。参考 Aider 的 search-replace 块设计。

**2. 引入代码库 embedding 检索**
和上一章 RAG 类似，把整个代码库向量化，用语义搜索替代正则搜索。LangChain 的 CodeSplitter、LlamaIndex 的 CodeHierarchyNodeParser 都可用。

**3. 多步规划**
对复杂任务（"重构这个模块"），先让 LLM 输出 plan，再分步执行。每步执行前可以展示给用户确认。

**4. 自动测试驱动**
要求 Agent 先写测试再写实现，让"测试通过"成为终止条件之一，能显著提升代码质量。

**5. 安全加固（生产必做）**
- 把 run_python 改为在 Docker 容器里执行，限制 CPU、内存、网络。
- 文件操作加白名单，禁止写入 .env、密钥等敏感路径。
- 所有写操作记录审计日志。
- 对执行结果做敏感信息脱敏，避免密钥、token 被回传给 LLM 后落入对话日志。

**6. 上下文压缩与会话续接**
当任务执行轮次较多时，对话历史会迅速膨胀，单轮可能超出模型上下文窗口。可以采用滚动窗口策略：保留最近若干轮工具调用细节，对更早的历史用 LLM 做摘要压缩。此外，把已读取的文件内容按需重读而非长期驻留，能显著降低 token 消耗。对于超长任务，还可以把中间状态序列化到磁盘，实现断点续接，避免中途失败就要从头再来。

### 19.9 本章小结

本章我们构建了一个具备"读、写、跑、搜"四大能力的代码助手 Agent。它虽然简陋，但完整呈现了编程 Agent 的工作原理——本质仍是上一章的 Agent 循环，只是工具集更丰富、风险更高。

关键收获：
- 沙箱设计是代码执行 Agent 的生命线。
- 路径校验（_safe_path）是防止越权的基础。
- 工具描述的精确性决定 Agent 的行为质量。
- 工业级产品（Cursor、Claude Code）的核心竞争力在上下文管理和人机协作，而非循环本身。

下一章我们将挑战 Agent 的最高形态——能自主规划、分解、执行复杂多步任务的自主 Agent。`
  },

  // =============================================================
  // 第20章：实战三——构建自主任务执行Agent
  // =============================================================
  {
    id: 'a-ch20',
    group: '第五部分 Agent实战开发',
    icon: '📋',
    title: '实战三:构建自主任务执行Agent',
    content: `## 第二十章　实战三：构建自主任务执行Agent

### 20.1 什么是自主任务执行 Agent

前三章的 Agent 本质上都是**反应式**的——用户问一句、Agent 答一句或执行一两步。本章我们要构建的 Agent 上升到**自主式**：用户给一个高层目标，Agent 自己把目标分解成可执行的子任务，逐个执行，过程中根据反馈动态调整，最后汇总结果。

**典型场景举例：**

- 用户："帮我研究一下 2025 年大模型推理优化的主流方案，写一份 2000 字综述。"
- Agent 应当：① 规划研究子任务 → ② 逐个搜索资料 → ③ 提取要点 → ④ 发现信息缺口继续搜 → ⑤ 组织成文 → ⑥ 自检并输出。

这与前几章"一问一答"的本质区别在于 **自主规划能力**。Agent 不再是"用户说什么做什么"的工具人，而是能像真人实习生一样，接到任务后自己排计划、自己推进。

> 🎯 **本章目标**：用 CrewAI 框架 + Tavily 搜索 + OpenAI，构建一个能自主完成研究报告的 Agent 系统。

### 20.2 自主 Agent 的四大能力

一个合格的自主 Agent 必须具备：

1. **目标分解（Planning）**：把"研究大模型推理优化"分解成可执行子任务。
2. **任务执行（Execution）**：能调用工具完成每个子任务。
3. **状态跟踪（State Tracking）**：知道哪些任务完成了、哪些还没做、卡在哪里。
4. **结果汇总（Aggregation）**：把多步产出整合成最终交付物。

**两种实现范式：**

- **Plan-and-Execute**：先一次性输出完整 plan，再逐步执行。结构清晰但灵活度低。
- **ReAct**：边思考边行动，每一步都重新评估。灵活但容易跑偏。

CrewAI 采用**多角色协作**范式：定义多个有明确职责的 Agent，它们像团队一样分工合作。下面我们用这种方式构建研究报告 Agent。

### 20.3 技术栈介绍

- **CrewAI**：多 Agent 协作框架，定义 Agent、Task、Crew 三个核心概念。
- **Tavily**：专为 LLM 设计的搜索 API，返回结构化结果，比直接抓网页更稳。免费额度够测试。
- **OpenAI**：底层 LLM。

安装：

\`\`\`bash
pip install crewai crewai-tools tavily-python openai
\`\`\`

### 20.4 第一步：配置环境与工具

\`\`\`python
# config.py —— 全局配置
import os

# 必须设置这两个环境变量
os.environ["OPENAI_API_KEY"] = "sk-你的-openai-key"
os.environ["TAVILY_API_KEY"] = "tvly-你的-tavily-key"

# 选用模型
LLM_MODEL = "gpt-4o-mini"
\`\`\`

Tavily 是付费但免费额度足够开发测试的搜索 API。注册地址 https://tavily.com，几分钟拿到 key。

### 20.5 第二步：定义 Agent 角色

研究报告场景下，我们设计三个角色，模拟真实研究团队：

- **研究员**：负责搜索、阅读、提炼要点。
- **审稿人**：审核研究内容的完整性、准确性，提出补充方向。
- **撰稿人**：把所有要点组织成结构化报告。

\`\`\`python
# agents.py —— 定义 Agent 角色
from crewai import Agent
from crewai_tools import SerperDevTool  # 若没有 Serper key，可用 TavilyTool
# 这里我们用自定义的 Tavily 工具
from tools import tavily_search

researcher = Agent(
    role="资深研究员",
    goal="针对给定主题，搜集并提炼准确、最新的技术信息",
    backstory="""你是一名有 10 年经验的技术研究员，擅长快速理解新技术，
    能从海量信息中筛出真正有价值的部分。你坚持每个结论都要有来源支撑，绝不编造数据。""",
    tools=[tavily_search],
    verbose=True,
    llm="gpt-4o-mini",
)

reviewer = Agent(
    role="严谨的审稿人",
    goal="审核研究内容的完整性和准确性，指出遗漏和错误",
    backstory="""你曾担任顶级技术期刊审稿人，眼光犀利。
    你擅长发现信息缺口、识别夸大表述、提出补充研究方向。
    你不会让未经验证的结论轻易过关。""",
    verbose=True,
    llm="gpt-4o-mini",
)

writer = Agent(
    role="技术撰稿人",
    goal="把零散的要点组织成逻辑清晰、可读性强的报告",
    backstory="""你是资深技术撰稿人，曾为多家科技公司撰写白皮书。
    你擅长结构化表达，能用通俗语言解释复杂概念。
    你的文章总是有清晰的章节、恰当的示例和准确的引用。""",
    verbose=True,
    llm="gpt-4o-mini",
)
\`\`\`

**为什么这样设计角色？** backstory 不是装饰，它给 LLM 一个明确的"人设"，能显著影响输出风格和决策倾向。"有 10 年经验"、"绝不编造"这种描述会真的让 LLM 表现得更专业、更谨慎。

### 20.6 第三步：定义 Tavily 搜索工具

CrewAI 的工具需要是 LangChain Tool 兼容格式。我们用 \`@tool\` 装饰器封装：

\`\`\`python
# tools.py —— Tavily 搜索工具
from crewai.tools import tool
from tavily import TavilyClient
import os

_tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

@tool("tavily_search")
def tavily_search(query: str, max_results: int = 5) -> str:
    """
    用 Tavily 搜索引擎查询最新信息。
    输入：query 搜索关键词
    返回：相关网页的标题、链接和摘要，按相关性排序
    """
    result = _tavily.search(query=query, max_results=max_results, search_depth="advanced")
    # 把结果整理成文本，方便 LLM 阅读
    parts = []
    for r in result.get("results", []):
        parts.append(
            f"标题：{r.get('title', '')}\\n"
            f"链接：{r.get('url', '')}\\n"
            f"摘要：{r.get('content', '')}\\n"
        )
    if result.get("answer"):
        parts.insert(0, f"直接答案：{result['answer']}\\n")
    return "\\n---\\n".join(parts) if parts else "未找到相关结果"
\`\`\`

> 💡 **工具描述的重要性**：和第17章一样，docstring 决定 LLM 什么时候用这个工具、怎么用。把"输入什么、返回什么"写清楚，能减少误用。

### 20.7 第四步：定义任务流

任务（Task）描述每个 Agent 要做什么，并指定由哪个 Agent 负责。任务之间可以通过 \`context\` 形成依赖关系。

\`\`\`python
# tasks.py —— 定义任务
from crewai import Task

research_task = Task(
    description="""针对主题「{topic}」展开研究：

要求：
1. 先用 3-5 次搜索覆盖该主题的主要方向。
2. 每个搜索结果都要记录关键事实和来源链接。
3. 整理出至少 5 个核心技术点，每个点说明：
   - 是什么
   - 解决什么问题
   - 适用场景
   - 主要代表方案或论文
4. 标注每条信息的来源链接，便于复核。

输出格式：结构化的要点清单（Markdown）。""",
    expected_output="一份结构化的研究要点清单，包含至少5个核心技术点及其来源",
    agent=researcher,
)

review_task = Task(
    description="""审核研究员的产出，重点检查：
1. 是否遗漏了重要方向（如主题相关但你没覆盖到的子领域）。
2. 是否有结论缺乏来源支撑。
3. 是否有明显的技术性错误。
4. 提出至少 2 个需要补充研究的方向。

如果发现缺口，明确指出应该补充搜索什么关键词。""",
    expected_output="审核报告，包含问题清单和补充研究方向",
    agent=reviewer,
    context=[research_task],  # 审稿任务依赖研究任务的输出
)

# 补充研究任务：根据审稿意见再补充
supplement_task = Task(
    description="""根据审稿人的反馈，针对遗漏的方向补充研究：
1. 针对审稿人提出的每个补充方向，至少做 1 次搜索。
2. 把新发现整合进研究要点清单。
3. 输出更新后的完整要点清单。""",
    expected_output="更新后的完整研究要点清单",
    agent=researcher,
    context=[review_task],
)

write_task = Task(
    description="""基于最终的研究要点清单，撰写一份技术综述报告：

要求：
1. 字数 1500-2500 字。
2. 结构：引言→核心技术点（每个点独立成节）→趋势展望→总结。
3. 每个技术点要包含：定义、解决的问题、典型方案、优缺点。
4. 在适当位置标注来源链接。
5. 语言风格：面向有一定技术背景的读者，专业但不晦涩。

输出纯 Markdown 格式。""",
    expected_output="一份1500-2500字的技术综述报告，Markdown格式",
    agent=writer,
    context=[supplement_task],
)
\`\`\`

注意 \`context=[research_task]\` 这种写法——它把前一个任务的输出作为后一个任务的输入上下文。这就是任务依赖关系，让多 Agent 协作形成流水线。

### 20.8 第五步：组装 Crew 并运行

\`\`\`python
# crew.py —— 组装与运行
from crewai import Crew, Process
from agents import researcher, reviewer, writer
from tasks import research_task, review_task, supplement_task, write_task

def build_research_crew(topic: str) -> Crew:
    return Crew(
        agents=[researcher, reviewer, writer],
        tasks=[research_task, review_task, supplement_task, write_task],
        process=Process.sequential,  # 顺序执行：研究→审稿→补充→撰稿
        verbose=True,
        memory=True,  # 开启短期记忆，多步骤间共享上下文
    )

def run_research(topic: str) -> str:
    crew = build_research_crew(topic)
    # inputs 用于替换任务描述里的 {topic} 占位符
    result = crew.kickoff(inputs={"topic": topic})
    return result.raw

if __name__ == "__main__":
    topic = "2025年大模型推理优化的主流方案"
    report = run_research(topic)
    print("\\n\\n======== 最终报告 ========\\n")
    print(report)

    # 保存到文件
    with open("report.md", "w", encoding="utf-8") as f:
        f.write(report)
    print("\\n报告已保存到 report.md")
\`\`\`

### 20.9 运行过程详解

执行 \`python crew.py\` 后，你会看到类似这样的执行日志（简化版）：

\`\`\`
[researcher] 思考：需要先了解大模型推理优化的整体方向...
[researcher] 调用 tavily_search("LLM inference optimization 2025")
[researcher] 拿到结果，继续搜索量化、KV Cache 等方向...
[researcher] 输出研究要点清单（含8个技术点 + 来源）

[reviewer] 审核中...
[reviewer] 发现遗漏：没覆盖 speculative decoding
[reviewer] 提出补充方向：speculative decoding, MoE 推理

[researcher] 根据审稿意见补充搜索...
[researcher] 输出更新后的要点清单

[writer] 组织材料撰写报告...
[writer] 输出 2000 字综述
\`\`\`

这正是自主 Agent 的核心特征——**Agent 自己驱动流程**，而不是被动等用户下一步指令。审稿人发现缺口后，研究员会自动补研究，整个过程无需人工干预。

### 20.10 关键设计要点

**1. 任务粒度要适中**
任务太粗，Agent 容易跳步；任务太细，Agent 失去灵活性。一般一个任务对应一个可交付产物。

**2. 用 context 显式声明依赖**
不要依赖 Agent 自己"记住"前序输出。CrewAI 的 context 参数让依赖关系明确、可追溯。

**3. expected_output 很关键**
这个字段决定 Agent 何时认为任务完成。写得太模糊（"输出报告"）Agent 可能敷衍了事；写得具体（"1500-2500字，含5个技术点"）效果会好很多。

**4. 多角色设计能产生交叉验证**
研究员容易报喜不报忧，审稿人专门挑刺，这种"对抗式协作"能显著提升输出质量。比单 Agent 自检有效得多。

**5. memory 提升一致性**
开启 memory 后，多步骤间共享上下文，避免每个任务都"从头理解"。但也增加 token 消耗，长任务要权衡。

### 20.11 常见问题与调优

**问题 1：Agent 反复搜索同一关键词，陷入死循环。**

对策：
- 在任务描述里限制："最多调用搜索 8 次"。
- 给 reviewer 加一条职责："如果发现 researcher 在重复搜索相同内容，立即叫停"。
- CrewAI 设 \`max_iter\`（在 Agent 层级）限制每个 Agent 的最大迭代次数。

**问题 2：报告内容空洞，像百度百科。**

对策：
- 在 write_task 里要求"每个技术点必须包含至少一个具体方案名/论文/项目链接"。
- 提高 model 到 gpt-4o。
- 增大搜索 \`search_depth="advanced"\`，Tavily 会返回更详细内容。

**问题 3：研究员搜出来的内容跑题。**

对策：
- 改进 search 工具的 docstring，提示"如果第一次结果不相关，尝试用英文关键词重搜"。
- 在 research_task 描述里给几个示例关键词。
- 用 query rewriting：先让 LLM 把主题拆成 5 个英文 search query 再搜。

**问题 4：执行太慢、太贵。**

对策：
- 把简单角色（reviewer）的 llm 降到 gpt-4o-mini。
- 关闭 memory。
- 减少 task 数量，合并相似任务。
- 用 async 模式（CrewAI 0.4+ 支持）让独立任务并行。

### 20.12 进阶扩展方向

**1. 加入 Web 抓取**
Tavily 只返回摘要，要拿全文需要抓网页。可加一个 \`scrape_url\` 工具，用 trafilatura 或 BeautifulSoup 提取正文。

**2. 多轮迭代**
让 reviewer 反复审核直到满意为止（设最大轮数防死循环）。这是 AutoGPT 风格的"自我修正"。

**3. 人类在环（Human-in-the-loop）**
在 reviewer 任务后插入一个"等待用户确认"步骤，让用户决定是否继续。CrewAI 支持 \`human_input=True\`。

**4. 工具扩展**
加计算工具（做数据对比）、图表工具（生成可视化）、PDF 导出工具，让 Agent 能直接产出可交付物。

**5. 评估与回归**
构建测试用例集，每次改 prompt 后跑一遍看输出质量是否下降。可以用 LLM 当评委自动打分。

### 20.13 与单 Agent 的对比

| 维度 | 单 Agent（第17章） | 多 Agent 协作（本章） |
| --- | --- | --- |
| 任务复杂度 | 单一动作 | 多步、多阶段 |
| 角色分工 | 一个角色包揽 | 各司其职 |
| 自我修正 | 难 | 内置（reviewer） |
| 上下文压力 | 全塞一个 prompt | 分散到各 Agent |
| 可观测性 | 黑盒 | 各步骤独立可见 |
| 成本 | 低 | 高（多倍 LLM 调用） |

**何时该用多 Agent？** 任务满足"可分解"+"需要交叉验证"+"多角色视角有价值"三个条件时。简单一问一答用单 Agent 即可，否则就是过度设计。

### 20.14 本章小结

本章我们用 CrewAI 构建了一个自主研究报告 Agent，它能够：

1. **自主规划**：把"研究某主题"分解为研究→审核→补充→撰稿四阶段。
2. **自主执行**：每个阶段调用搜索工具完成实际工作。
3. **自主修正**：审稿人发现缺口后，研究员自动补研究。
4. **自主汇总**：撰稿人把零散要点整合成结构化报告。

关键收获：
- 自主 Agent 的核心是 **目标分解 + 状态跟踪 + 反馈修正**。
- 多角色协作能产生交叉验证，比单 Agent 自检更可靠。
- CrewAI 通过 Agent + Task + Crew 三层抽象，让多 Agent 系统变得可组合。
- 任务描述、expected_output、context 是控制 Agent 行为的三大杠杆。

### 结语：第五部分总结

第五部分四章构成了从"理解 Agent"到"构建 Agent"再到"实战 Agent"的完整路径：

- 第17章：用 150 行代码看清 Agent 循环的本质。
- 第18章：把 RAG 与 Agent 结合，构建知识问答系统。
- 第19章：把 Agent 武装成能读写跑搜的编程助手。
- 第20章：让 Agent 具备自主规划和多角色协作能力。

走完这条路径，你已经具备了构建生产级 Agent 系统的核心能力。下一部分我们将进入更深入的话题：Agent 的评估、监控、安全与未来趋势。`
  }
];

export { chapters };
