// =============================================================
// AI Agent 开发实战 - 第十五批章节(实战项目,共 4 章)
// 章节 57-60:智能客服 / AI 编程助手 / 文档问答 / 自动化工作流
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十七章:实战:智能客服机器人
  // =============================================================
  {
    id: 'proj-chatbot',
    group: '实战项目',
    icon: '💬',
    title: '实战:智能客服机器人',
    content: `## 第五十七章　实战:智能客服机器人

### 57.1 需求分析

一个面向真实业务的智能客服,要覆盖四类能力:

- **FAQ 回答**:常见问题(密码重置、退换货、查询订单)直接从知识库答;
- **工单创建**:超出 FAQ 范围但能处理的问题,自动建工单转后台;
- **人工转接**:复杂或情绪激动的客户,平滑转给人工坐席;
- **多轮对话**:能记住上文,处理"那我的另一单呢"这种指代。

> 关键认知:**客服不是"问答机器人",而是"分层路由系统"**——能自助的尽量自助,不能的兜底到人。目标不是 100% 自动,而是把人工精力解放到真正需要人的复杂场景。

### 57.2 架构设计

\`\`\`text
用户消息
   ↓
意图识别(分类)──FAQ──> RAG 检索回答
   ├──工单──> 收集信息 → 建工单
   ├──人工──> 情绪检测 → 转人工
   └──闲聊──> 兜底对话
\`\`\`

三大组件:
1. **RAG 知识库**:FAQ 文档向量化,语义检索;
2. **Function Calling**:意图→路由动作(建工单、转人工);
3. **人工兜底**:情绪检测触发,转人工坐席。

### 57.3 知识库构建:FAQ 向量化

\`\`\`python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# FAQ 文档(实际从企业知识库导入)
faq_docs = [
    {"q": "怎么重置密码", "a": "登录页点'忘记密码',输入注册邮箱即可。"},
    {"q": "退换货政策", "a": "签收 7 天内可退,15 天内可换。"},
    {"q": "怎么查订单", "a": "App 首页点'我的订单'。"},
]

# 向量化入库
embeddings = OpenAIEmbeddings()
texts = [f"问:{d['q']}\\n答:{d['a']}" for d in faq_docs]
vector_db = Chroma.from_texts(texts, embeddings, collection_name="faq")

def retrieve_faq(query: str, k: int = 2) -> list:
    """检索最相关的 FAQ。"""
    return vector_db.similarity_search(query, k=k)
\`\`\`

### 57.4 意图识别与路由

用 LLM 做意图分类,输出结构化动作:

\`\`\`python
INTENT_PROMPT = """你是客服意图分类器。根据用户消息判断意图,只输出一个词:
- faq:常见问题咨询
- ticket:需要建工单的问题(投诉、报修、异常)
- human:需要人工(情绪激动、复杂纠纷)
- chat:闲聊

用户消息:{message}
"""

def detect_intent(message: str) -> str:
    """识别意图,带兜底。"""
    intent = llm.invoke(INTENT_PROMPT.format(message=message)).strip().lower()
    return intent if intent in {"faq", "ticket", "human", "chat"} else "chat"
\`\`\`

### 57.5 FAQ 检索回答

\`\`\`python
def answer_faq(message: str) -> dict:
    """检索 FAQ 并生成回答。"""
    docs = retrieve_faq(message)
    context = "\\n".join(d.page_content for d in docs)
    prompt = f"""根据知识库回答用户问题。要求:
1. 只用知识库信息,不要编造
2. 找不到相关内容就回复'该问题需转人工'
3. 回答简洁

知识库:
{context}

用户问题:{message}"""
    answer = llm.invoke(prompt)
    return {"answer": answer, "source": "faq"}
\`\`\`

### 57.6 缺失时创建工单

FAQ 命中不了,就转工单流程:

\`\`\`python
def create_ticket(message: str) -> dict:
    """收集关键信息,创建工单。"""
    # 用 function calling 提取结构化字段
    fields = llm_extract(
        message,
        schema={"order_id": "订单号", "issue": "问题描述", "contact": "联系方式"},
    )
    ticket_id = save_to_db(fields)   # 落库生成工单号
    return {
        "answer": f"已为您创建工单 #{ticket_id},客服会在 2 小时内联系您。",
        "ticket_id": ticket_id,
    }
\`\`\`

### 57.7 情绪检测转人工

\`\`\`python
EMOTION_PROMPT = """判断用户情绪,只输出 angry / normal / anxious。
用户消息:{message}"""

def detect_emotion(message: str) -> str:
    return llm.invoke(EMOTION_PROMPT.format(message=message)).strip()

def maybe_escalate(message: str) -> bool:
    """情绪激动或多次未解决就转人工。"""
    emotion = detect_emotion(message)
    return emotion == "angry"   # 实际还要看历史轮次、未解决次数
\`\`\`

### 57.8 多轮上下文管理

\`\`\`python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

class CSState(TypedDict):
    messages: Annotated[list, add_messages]   # 多轮历史自动累加
    user_id: str
    intent: str
    answer: str

def chat_node(state: CSState) -> dict:
    msg = state["messages"][-1]["content"]
    intent = detect_intent(msg)
    if intent == "faq":
        return {**answer_faq(msg), "intent": "faq"}
    elif intent == "ticket":
        return {**create_ticket(msg), "intent": "ticket"}
    elif intent == "human" or maybe_escalate(msg):
        return {"answer": "正在为您转接人工客服...", "intent": "human"}
    else:
        return {"answer": llm.invoke(msg), "intent": "chat"}

gb = StateGraph(CSState)
gb.add_node("chat", chat_node)
gb.add_edge(START, "chat")
gb.add_edge("chat", END)
bot = gb.compile()
\`\`\`

### 57.9 完整代码结构

\`\`\`text
customer-service/
├── main.py            # FastAPI 入口,接收用户消息
├── intents.py         # 意图识别
├── rag.py             # FAQ 检索
├── ticket.py          # 工单创建
├── emotion.py         # 情绪检测
├── graph.py           # LangGraph 编排
└── vector_db/         # 向量库数据
\`\`\`

### 57.10 部署建议

- **知识库热更新**:FAQ 改了不需重启,向量库支持增量写入;
- **会话存储**:多轮历史存 Redis,按 user_id 隔离;
- **限流**:单用户每分钟限制请求数,防刷;
- **监控**:记录转人工率、工单量、FAQ 命中率,定期优化知识库;
- **降级**:LLM 超时时退回关键词匹配兜底。

### 57.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| FAQ 无"找不到"兜底 | 编造答案 | 检索分数低时转人工 |
| 情绪检测漏判 | 激动客户没转人工 | 结合轮次+关键词综合判断 |
| 多轮上下文无限堆 | token 爆炸 | 只保留近 N 轮 |
| 工单字段缺失直接建 | 工单不可用 | 必填字段缺失则追问 |
| 转人工不带上下文 | 人工看不到历史 | 转接时附上对话摘要 |

> **本章小结**:智能客服 = 意图路由 + RAG + 工单 + 情绪转人工。核心是"分层兜底"——能 FAQ 的不建工单,能建工单的不转人工,真正复杂的才转人。下章看 AI 编程助手。`,
  },

  // =============================================================
  // 第五十八章:实战:AI 编程助手
  // =============================================================
  {
    id: 'proj-coder',
    group: '实战项目',
    icon: '💻',
    title: '实战:AI 编程助手',
    content: `## 第五十八章　实战:AI 编程助手

### 58.1 需求分析

一个能真正帮开发者干活的 AI 编程助手,要支持:

- **读代码**:理解现有代码库的结构和逻辑;
- **解释代码**:用自然语言讲清楚某段代码在干什么;
- **生成代码**:按需求写新函数/类;
- **审查代码**:找 bug、提改进建议;
- **修复 bug**:定位问题并给出修复。

### 58.2 架构:代码库索引 + 上下文 + LLM

\`\`\`text
用户请求(解释/生成/审查)
   ↓
代码切分 → 向量化 → 代码库索引
   ↓
相关代码检索(语义)
   ↓
上下文组装(代码+问题+约束)
   ↓
LLM 生成回答
\`\`\`

关键洞察:**AI 编程助手不是把整个仓库塞给 LLM(塞不下也贵),而是"按需检索相关代码片段"再让 LLM 处理。** 这正是 RAG 思想在代码场景的应用。

### 58.3 代码切分:按函数/类而非固定长度

代码不是散文,固定长度切分会把一个函数切成两半,丢失语义。正确做法是**按语法结构切分**:

\`\`\`python
import ast

def split_code_by_function(source: str) -> list:
    """按函数/类切分 Python 代码,保留完整结构。"""
    tree = ast.parse(source)
    chunks = []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            # 提取函数/类的完整源码段
            segment = ast.get_source_segment(source, node)
            chunks.append({
                "type": type(node).__name__,   # FunctionDef / ClassDef
                "name": node.name,
                "code": segment,
                "start_line": node.lineno,
            })
    return chunks
\`\`\`

**为什么按函数切?**

- 一个函数是完整逻辑单元,检索到就能完整理解;
- 函数名、参数是天然元数据,利于精确检索;
- 切分稳定,代码改一行不会让所有 chunk 变化。

### 58.4 相关代码检索

\`\`\`python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

def build_code_index(repo_path: str):
    """遍历仓库,切分并索引所有代码文件。"""
    chunks = []
    for py_file in find_py_files(repo_path):
        source = open(py_file).read()
        for seg in split_code_by_function(source):
            seg["file"] = py_file
            chunks.append(seg)
    # 向量化入库
    texts = [f"{c['file']}::{c['name']}\\n{c['code']}" for c in chunks]
    return Chroma.from_texts(texts, OpenAIEmbeddings(), collection_name="code")

def retrieve_code(query: str, db, k: int = 5) -> list:
    """语义检索相关代码片段。"""
    return db.similarity_search(query, k=k)
\`\`\`

### 58.5 上下文组装

\`\`\`python
def assemble_context(question: str, retrieved: list) -> str:
    """把检索到的代码拼成上下文。"""
    code_blocks = []
    for i, doc in enumerate(retrieved):
        code_blocks.append(f"### 相关代码 {i+1}\\n{doc.page_content}")
    return f"""## 相关代码
{chr(10).join(code_blocks)}

## 用户问题
{question}

## 约束
- 只基于上面代码回答,不要假设不存在的逻辑
- 引用代码时标注文件名和函数名"""
\`\`\`

### 58.6 代码生成 prompt 设计

\`\`\`python
GEN_PROMPT = """你是资深 Python 工程师。根据需求生成代码,要求:
1. 符合现有代码风格
2. 必要的类型注解和 docstring
3. 处理边界情况
4. 附 3 条关键注释说明设计选择

现有相关代码:
{context}

需求:{requirement}"""

def generate_code(requirement: str, db) -> str:
    retrieved = retrieve_code(requirement, db)
    context = assemble_context(requirement, retrieved)
    return llm.invoke(GEN_PROMPT.format(context=context, requirement=requirement))
\`\`\`

### 58.7 代码审查

\`\`\`python
REVIEW_PROMPT = """你是严格的代码审查员。检查给定代码的:
1. 潜在 bug(空指针、越界、竞态)
2. 安全问题(注入、硬编码密钥)
3. 性能问题(N+1 查询、无界循环)
4. 可读性

代码:
{code}

按严重程度分类输出问题清单。"""

def review_code(code: str) -> str:
    return llm.invoke(REVIEW_PROMPT.format(code=code))
\`\`\`

### 58.8 安全:不执行危险代码

AI 编程助手可能"建议"危险操作(删文件、改系统配置)。必须在执行前过滤:

\`\`\`python
DANGEROUS_PATTERNS = ["rm -rf", "os.remove", "DROP TABLE", "sudo", "format("]

def safety_check(code: str) -> tuple[bool, str]:
    """检查代码是否含危险操作。"""
    for pat in DANGEROUS_PATTERNS:
        if pat in code:
            return False, f"检测到危险操作:{pat},已阻止执行"
    return True, "通过"

# 执行前先过安全检查
ok, msg = safety_check(generated_code)
if not ok:
    print(msg)   # 不执行,只提示
\`\`\`

### 58.9 执行结果反馈

如果用户要运行生成代码,用沙盒隔离执行,把结果反馈给 LLM 自我修正:

\`\`\`python
def run_in_sandbox(code: str) -> dict:
    """在隔离沙盒执行代码,捕获输出和错误。"""
    # 实际用 Docker 容器或远程沙盒
    result = sandbox.execute(code, timeout=10)
    return {"output": result.stdout, "error": result.stderr, "exit_code": result.returncode}

# 失败则把错误反馈给 LLM 让它修
if run_result["exit_code"] != 0:
    fixed = llm.invoke(f"这段代码报错了,请修复:\\n{code}\\n错误:{run_result['error']}")
\`\`\`

### 58.10 对比 GitHub Copilot 原理

| 维度 | GitHub Copilot | 本助手 |
| --- | --- | --- |
| 上下文来源 | 当前打开的文件 + 邻近代码 | 整个仓库语义检索 |
| 触发方式 | 实时补全 | 按需对话 |
| 模型 | 定制 CodeT5/Codex 等 | 通用 LLM |
| 离线 | 否 | 可本地部署 |

> Copilot 的核心也是"上下文检索 + 代码生成",只是它把检索做得更轻量(就取光标附近代码),而企业自建助手可以做更深的仓库级检索。

### 58.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 按固定长度切代码 | 函数被切断,语义丢失 | 按语法结构切 |
| 检索 top-k 太少 | 漏掉关键上下文 | k=5-10,结合重排 |
| 直接执行生成代码 | 危险操作可能跑 | 沙盒+安全检查 |
| 不带文件路径 | 引用混乱 | chunk 元数据带文件名 |
| 上下文超长 | 贵且遗忘 | 截断 + 只传最相关 |

> **本章小结**:AI 编程助手 = 代码库索引(按函数切分)+ 语义检索 + 上下文组装 + LLM 生成。关键是"按需检索"而非全量塞入,以及生成代码执行前的安全沙盒。下章看企业文档问答。`,
  },

  // =============================================================
  // 第五十九章:实战:企业文档问答系统
  // =============================================================
  {
    id: 'proj-doc-qa',
    group: '实战项目',
    icon: '📖',
    title: '实战:企业文档问答系统',
    content: `## 第五十九章　实战:企业文档问答系统

### 59.1 需求场景

企业痛点:**内部文档海量(Confluence、飞书、SharePoint),员工找一个流程规范要翻半天,效率低**。目标是让员工直接"问",系统从企业文档里找答案并标注来源。

### 59.2 架构:文档处理 pipeline + RAG + 权限控制

\`\`\`text
文档源 ──> 处理 pipeline(解析/切分/向量化)──> 向量库
                                              ↑ 权限过滤
员工提问 ──> 权限校验 ──> 检索 ──> 生成答案(带引用)
\`\`\`

四大模块:
1. **文档处理 pipeline**:多源采集、解析、切分、向量化;
2. **RAG 检索**:语义检索 + 重排;
3. **权限控制**:用户只能查到有权限的文档;
4. **引用溯源**:答案标注来源文档和段落。

### 59.3 文档源与采集

\`\`\`python
# 多文档源适配器
class ConfluenceLoader:
    def load(self): ...   # 拉 Confluence 页面

class FeishuLoader:
    def load(self): ...   # 拉飞书文档

class SharePointLoader:
    def load(self): ...   # 拉 SharePoint 文档

# 统一采集
def crawl_all_sources():
    docs = []
    for loader in [ConfluenceLoader(), FeishuLoader(), SharePointLoader()]:
        docs.extend(loader.load())
    return docs
\`\`\`

### 59.4 多格式支持

PDF、Word、Excel 解析方式不同,需要适配:

\`\`\`python
def parse_document(file_path: str) -> str:
    """按扩展名分发到对应解析器。"""
    ext = file_path.split(".")[-1].lower()
    if ext == "pdf":
        return parse_pdf(file_path)        # pdfplumber/PyMuPDF
    elif ext in ("doc", "docx"):
        return parse_word(file_path)        # python-docx
    elif ext in ("xls", "xlsx"):
        return parse_excel(file_path)       # 转 markdown 表格
    elif ext == "md":
        return open(file_path).read()
    else:
        return ""
\`\`\`

### 59.5 切分与向量化

\`\`\`python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,           # 每块约 500 字
    chunk_overlap=50,         # 重叠 50 字防切断上下文
    separators=["\\n\\n", "\\n", "。", " "],  # 按段落→句→词递归切
)

def index_document(doc):
    """切分并向量化单个文档。"""
    text = parse_document(doc["path"])
    chunks = splitter.split_text(text)
    # 每个 chunk 附元数据:来源、权限组、页码
    metadatas = [{
        "source": doc["path"],
        "acl": doc["acl"],          # 哪些用户组可访问
        "title": doc["title"],
    } for _ in chunks]
    vector_db.add_texts(chunks, metadatas=metadatas)
\`\`\`

### 59.6 增量更新:新文档自动索引

\`\`\`python
import os, time

def incremental_update(watch_dir: str, last_sync: float):
    """只处理新增/修改的文档。"""
    new_docs = []
    for root, _, files in os.walk(watch_dir):
        for f in files:
            path = os.path.join(root, f)
            mtime = os.path.getmtime(path)
            if mtime > last_sync:   # 比上次新就处理
                new_docs.append(path)
    for path in new_docs:
        index_document({"path": path, "acl": get_acl(path), "title": f})
    return time.time()   # 更新同步时间戳
\`\`\`

### 59.7 权限控制:用户只能查有权限的文档

这是企业级区别于通用 RAG 的关键。检索时按用户权限组过滤:

\`\`\`python
def retrieve_with_acl(query: str, user_groups: list, k: int = 5) -> list:
    """检索时按权限组预过滤。"""
    # Chroma 支持 metadata 过滤:只取 acl 与用户组有交集的
    results = vector_db.similarity_search(
        query,
        k=k,
        filter={"acl": {"$in": user_groups}},   # 只查用户有权限的
    )
    return results

def answer_question(question: str, user_groups: list) -> dict:
    """带权限的问答。"""
    docs = retrieve_with_acl(question, user_groups)
    if not docs:
        return {"answer": "您没有权限访问相关文档。", "sources": []}
    # 生成答案
    context = "\\n".join(d.page_content for d in docs)
    answer = llm.invoke(f"基于以下文档回答:{context}\\n问题:{question}")
    return {"answer": answer, "sources": [d.metadata["source"] for d in docs]}
\`\`\`

### 59.8 引用溯源

答案必须标注来源,否则员工不敢信任:

\`\`\`python
CITE_PROMPT = """基于以下文档片段回答问题。要求:
1. 答案末尾标注引用来源,格式 [片段编号]
2. 找不到依据就说"未在文档中找到"
3. 不要编造

文档片段:
[1] {doc1} (来源:{src1})
[2] {doc2} (来源:{src2})

问题:{question}"""
\`\`\`

### 59.9 评估体系

\`\`\`text
评估指标:
- 检索召回率:相关问题是否被检索到(人工标注 gold set)
- 答案准确率:答案是否正确(人工/LLM 评分)
- 引用准确率:引用的片段是否真的支持答案
- 无权限拒绝率:越权查询是否被正确拦截
\`\`\`

### 59.10 部署架构

\`\`\`text
                    [员工 Web 入口]
                          ↓
                    [API 网关 + 鉴权]
                          ↓
              [RAG 服务(检索+生成)]
                /              \\
        [向量库]            [LLM 服务]
            ↑
    [文档处理 Worker] ← 定时拉取文档源
\`\`\`

- **向量库**:Milvus/Qdrant(企业级,支持元数据过滤);
- **LLM 服务**:可本地部署开源模型,数据不出企业;
- **文档 Worker**:定时增量同步,独立于查询服务。

### 59.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 不做权限过滤 | 越权泄露文档 | 检索时按 acl 过滤 |
| 切分太大 | 检索不精准 | chunk 500-800 字 + overlap |
| 无引用溯源 | 答案不可信 | 强制标注来源 |
| 全量重建索引 | 慢且贵 | 增量更新 |
| PDF 表格乱码 | 解析丢失信息 | 用专门的表格解析器 |

> **本章小结**:企业文档问答 = 多源采集 + 智能切分 + 带权限的向量检索 + 引用溯源。区别于通用 RAG 的两大企业特性是**权限控制**(防越权)和**增量更新**(跟得上文档变化)。下章看自动化工作流。`,
  },

  // =============================================================
  // 第六十章:实战:自动化工作流
  // =============================================================
  {
    id: 'proj-workflow',
    group: '实战项目',
    icon: '⚙️',
    title: '实战:自动化工作流',
    content: `## 第六十章　实战:自动化工作流

### 60.1 需求场景

企业里有大量"重复但有规律"的办公任务,适合 Agent 自动化:

- **邮件分类回复**:客户邮件分类(咨询/投诉/合作)→ 摘要 → 起草回复 → 发送;
- **会议纪要**:会议转录 → 提取要点 → 分配任务 → 发送;
- **日报生成**:收集各系统数据 → 生成日报 → 推送;
- **数据分析**:取数 → 分析 → 生成洞察 → 发报告。

### 60.2 工作流设计:LangGraph 编排

每个工作流是一个 LangGraph 图,定时任务触发:

\`\`\`text
[cron 定时触发]
   ↓
[工作流图(LangGraph)]
   ├─ 邮件处理 Agent
   ├─ 会议纪要 Agent
   └─ 日报 Agent
   ↓
[结果推送 + 监控告警]
\`\`\`

### 60.3 邮件处理 Agent

\`\`\`python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

class EmailState(TypedDict):
    raw_email: str
    category: str       # consult/complaint/cooperation
    summary: str
    draft_reply: str
    sent: bool

def classify_node(state: EmailState) -> dict:
    """分类邮件意图。"""
    prompt = f"分类邮件为 consult/complaint/cooperation,只输出一词。邮件:{state['raw_email']}"
    return {"category": llm.invoke(prompt).strip()}

def summary_node(state: EmailState) -> dict:
    """生成摘要。"""
    return {"summary": llm.invoke(f"一句话摘要:{state['raw_email']}")}

def draft_node(state: EmailState) -> dict:
    """按分类起草回复。"""
    templates = {
        "consult": "感谢咨询,{summary},答复如下:...",
        "complaint": "抱歉给您带来不便,已记录工单 #{ticket}",
    }
    reply = templates.get(state["category"], "已收到,稍后回复。")
    return {"draft_reply": reply.format(summary=state["summary"])}

def send_node(state: EmailState) -> dict:
    """发送回复(模拟)。"""
    print(f"发送回复:{state['draft_reply']}")
    return {"sent": True}

gb = StateGraph(EmailState)
for name, fn in [("classify", classify_node), ("summary", summary_node),
                 ("draft", draft_node), ("send", send_node)]:
    gb.add_node(name, fn)
gb.add_edge(START, "classify")
gb.add_edge("classify", "summary")
gb.add_edge("summary", "draft")
gb.add_edge("draft", "send")
gb.add_edge("send", END)
email_agent = gb.compile()
\`\`\`

### 60.4 会议纪要 Agent

\`\`\`python
class MeetingState(TypedDict):
    transcript: str      # 会议转录文本
    key_points: list      # 要点
    action_items: list    # 行动项(谁做什么)
    summary: str

def extract_points(state: MeetingState) -> dict:
    prompt = f"从会议转录提取 3-5 个关键要点:\\n{state['transcript']}"
    return {"key_points": llm_invoke_list(prompt)}

def assign_tasks(state: MeetingState) -> dict:
    """提取行动项并分配负责人。"""
    prompt = f"""从会议内容提取行动项,每项含:
- task: 任务
- owner: 负责人
- deadline: 截止
会议:{state['transcript']}"""
    return {"action_items": llm_invoke_json(prompt)}

meeting_gb = StateGraph(MeetingState)
meeting_gb.add_node("points", extract_points)
meeting_gb.add_node("tasks", assign_tasks)
meeting_gb.add_edge(START, "points")
meeting_gb.add_edge("points", "tasks")
meeting_gb.add_edge("tasks", END)
meeting_agent = meeting_gb.compile()
\`\`\`

### 60.5 日报 Agent

\`\`\`python
class DailyState(TypedDict):
    date: str
    metrics: dict        # 从各系统取的数据
    report: str

def collect_data(state: DailyState) -> dict:
    """从多个系统取数据。"""
    metrics = {
        "活跃用户": query_db("SELECT COUNT(*) FROM users WHERE active=1"),
        "订单数": query_db("SELECT COUNT(*) FROM orders WHERE date=CURDATE()"),
        "收入": query_db("SELECT SUM(amount) FROM payments WHERE date=CURDATE()"),
    }
    return {"metrics": metrics}

def generate_report(state: DailyState) -> dict:
    prompt = f"""生成 {state['date']} 的运营日报,含:
1. 数据概览:{state['metrics']}
2. 环比变化分析
3. 异常预警
4. 建议关注项"""
    return {"report": llm.invoke(prompt)}

daily_gb = StateGraph(DailyState)
daily_gb.add_node("collect", collect_data)
daily_gb.add_node("report", generate_report)
daily_gb.add_edge(START, "collect")
daily_gb.add_edge("collect", "report")
daily_gb.add_edge("report", END)
daily_agent = daily_gb.compile()
\`\`\`

### 60.6 定时触发(cron)

\`\`\`python
import schedule, time

# 每天早 9 点生成日报
schedule.every().day.at("09:00").do(
    lambda: daily_agent.invoke({"date": time.strftime("%Y-%m-%d")})
)

# 每 10 分钟处理新邮件
schedule.every(10).minutes.do(
    lambda: [email_agent.invoke({"raw_email": e}) for e in fetch_new_emails()]
)

while True:
    schedule.run_pending()
    time.sleep(60)
\`\`\`

### 60.7 异常处理

\`\`\`python
def safe_run(agent, *args, **kwargs):
    """工作流执行包装:出错不崩,记录告警。"""
    try:
        return agent.invoke(*args, **kwargs)
    except Exception as e:
        alert(f"工作流执行失败:{agent} 错误:{e}")
        return None

def alert(msg: str):
    """告警:发钉钉/飞书/邮件。"""
    send_webhook(DINGTALK_WEBHOOK, msg)
\`\`\`

### 60.8 监控告警

\`\`\`text
监控指标:
- 执行成功率(应 >95%)
- 平均执行耗时(日报应 <2 分钟)
- token 消耗(月度趋势,突增告警)
- 产出质量抽检(人工抽看日报质量)
\`\`\`

### 60.9 ROI 评估

| 项目 | 人工耗时 | 自动化后 | 节省 |
| --- | --- | --- | --- |
| 邮件回复 | 2h/天 | 0.5h 复核 | 1.5h/天 |
| 会议纪要 | 0.5h/次 | 0.1h 复核 | 0.4h/次 |
| 日报 | 1h/天 | 0.2h 复核 | 0.8h/天 |

### 60.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 定时任务无重试 | 偶发失败丢任务 | 失败重试 + 告警 |
| 工作流没设超时 | 卡住后续任务 | 每节点设超时 |
| 自动发送无审核 | 发错邮件/报告 | 关键动作 interrupt 等审核 |
| 异常静默 | 出错没人知道 | 必须告警通知 |
| 数据取数口径错 | 报告数据失真 | 取数逻辑加单元测试 |

> **本章小结**:自动化工作流用 LangGraph 编排多个 Agent,定时触发执行邮件/纪要/日报等任务。核心是"定时触发 + 图编排 + 异常告警 + 关键动作人工审核"。低风险高频任务是首选切入点。下一批进入部署与优化。`,
  },
];
