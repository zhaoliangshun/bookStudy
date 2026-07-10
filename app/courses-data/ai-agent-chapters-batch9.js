// =============================================================
// AI Agent开发实战 - 第九批章节（第九部分 RAG 实战，共 4 章）
// 章节 33-36：文档切分 / RAG 完整流程 / 高级 RAG 技术 / RAG 质量评估
// =============================================================

export const chapters = [
  // =============================================================
  // 第三十三章：文档切分策略
  // =============================================================
  {
    id: 'doc-split',
    group: 'RAG 实战',
    icon: '✂️',
    title: '文档切分策略',
    content: `## 第三十三章　文档切分策略

> "RAG 系统的天花板,往往不是模型决定的,而是切分决定的。"
> 检索质量 = 切分粒度 × embedding 质量 × top-k 策略,本章拆解第一项。

### 33.1 为什么必须切分

很多初学者第一次做 RAG 时,会天真地把整篇文档直接喂给 LLM 提问,这在小段文本下勉强可行,但真实业务场景几乎不可能这样做。原因有三:

- **上下文窗口有限**:即便 GPT-4 Turbo 支持 128K token,一份 200 页的 PDF 也可能塞爆上下文,且 token 越多越贵越慢
- **检索需要细粒度**:RAG 的本质是"只取相关片段",不切分就等于"全文塞进去",失去检索意义
- **答案质量与片段强相关**:整篇文档喂入会引入大量噪音,LLM 容易被无关内容带偏,出现"幻觉式合理回答"

**核心矛盾**:切得太细会割裂语义(一句话被腰斩),切得太粗会引入噪音(一个 chunk 里塞多个主题)。文档切分本质上是在**语义完整性**和**检索精度**之间找平衡。

\`\`\`text
未切分 → 检索退化为全文填塞 → 失去 RAG 价值
切得太细 → chunk 信息残缺 → 检索命中但答非所问
切得太粗 → chunk 主题混杂 → 检索精度下降
理想切分 → chunk 主题单一 + 语义完整 + 大小适中
\`\`\`

### 33.2 主流切分方法

#### 33.2.1 固定字符数切分(Fixed-Size Chunking)

最朴素的方法:按固定字符数滑动窗口切割。实现简单,但容易在句子中间硬切。

\`\`\`python
# 固定字符数切分（最朴素版本）
def fixed_size_chunk(text, chunk_size=500, overlap=50):
    """
    按固定字符数切分文本
    :param text: 原始文本
    :param chunk_size: 每个 chunk 的字符数
    :param overlap: 相邻 chunk 之间的重叠字符数
    :return: 切分后的 chunk 列表
    """
    chunks = []
    start = 0
    while start < len(text):
        # 取出当前 chunk
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        # 下一个 chunk 起点回退 overlap 个字符,保证上下文连续
        start = end - overlap
    return chunks

# 测试
text = "今天天气真好," * 200  # 一段长文本
chunks = fixed_size_chunk(text, chunk_size=200, overlap=30)
print(f"切分出 {len(chunks)} 个 chunk, 每个 chunk 长度约 200")
\`\`\`

**问题**:硬切会破坏句子边界,如 "今天天气真" 和 "好" 被分到两个 chunk,语义割裂。

#### 33.2.2 递归字符切分(Recursive Character Splitting)

LangChain 的 \`RecursiveCharacterTextSplitter\` 是工业界默认选择。它的核心思想是**按优先级递归尝试分隔符**:先按段落切,段落太大再按句子,句子太大再按字符。

\`\`\`python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 创建递归字符切分器
# separators 按优先级排列,优先使用靠前的分隔符
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,           # 每个 chunk 最大 500 字符
    chunk_overlap=50,         # 相邻 chunk 重叠 50 字符
    separators=["\\n\\n", "\\n", "。", "！", "？", "，", " ", ""],  # 中文优先级
    length_function=len,
)

# 切分一段长文本
text = """
第一段:大模型的能力边界。
大模型在通用问答上表现优秀,但在专业领域仍有局限。

第二段:RAG 的核心思想。
RAG 通过外部知识库弥补大模型的知识盲区,提升答案可信度。
"""

chunks = splitter.split_text(text)
print(f"切分结果: {len(chunks)} 个 chunk")
for i, c in enumerate(chunks):
    print(f"--- chunk {i} ---")
    print(c)
\`\`\`

**为什么递归切分是默认选择?**
- 尽量在自然边界(段落、句子)处切分
- 当单个段落超过 chunk_size 时,自动降级到更细的分隔符
- 通过 chunk_overlap 保证上下文连续性
- 支持自定义分隔符列表(中文场景要加 "。" "！" 等)

#### 33.2.3 按语义切分(Semantic Chunking)

更高级的方法:用 embedding 计算相邻句子的语义相似度,在语义"断点"处切分。

\`\`\`python
# 概念性代码:基于语义相似度的切分
from sentence_transformers import SentenceTransformer
import numpy as np

def semantic_chunk(text, model_name='all-MiniLM-L6-v2', threshold=0.5):
    """
    按语义相似度切分:相邻句子相似度低于阈值时切分
    """
    model = SentenceTransformer(model_name)
    # 先按句号切分成句子
    sentences = [s.strip() for s in text.split("。") if s.strip()]
    if not sentences:
        return [text]
    # 计算每个句子的 embedding
    embeddings = model.encode(sentences)
    chunks = []
    current_chunk = [sentences[0]]
    for i in range(1, len(sentences)):
        # 计算当前句子与上一句的余弦相似度
        sim = np.dot(embeddings[i], embeddings[i-1]) / (
            np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[i-1])
        )
        if sim < threshold:
            # 相似度低,认为是话题切换点,开启新 chunk
            chunks.append("。".join(current_chunk) + "。")
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])
    # 最后一个 chunk
    if current_chunk:
        chunks.append("。".join(current_chunk) + "。")
    return chunks
\`\`\`

**优点**:语义边界更自然。**缺点**:速度慢、依赖 embedding 模型质量、阈值难调。

#### 33.2.4 按段落/结构切分

对于有结构的文档(Markdown、HTML、代码),按结构切分更合理。

\`\`\`python
from langchain_text_splitters import MarkdownHeaderTextSplitter

# 按 Markdown 标题切分
markdown_text = """
# 第一章 概述
这是概述内容。

## 1.1 背景
背景介绍。

## 1.2 目标
目标说明。

# 第二章 设计
设计内容。
"""

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]

splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
chunks = splitter.split_text(markdown_text)
# 每个 chunk 会带上所属标题作为元数据
for c in chunks:
    print(c.metadata, "->", c.page_content[:30])
\`\`\`

### 33.3 chunk_size 与 overlap 怎么选

这是新手最常问的问题。下面给出经验值和取舍逻辑。

**chunk_size 的取舍:**
- **200-500 字符**:适合 FAQ、问答对、知识片段零散的场景。粒度细,检索精准,但单 chunk 信息量少
- **500-1000 字符**:大多数通用场景的甜点区。平衡语义完整性和检索精度
- **1000-2000 字符**:适合长篇叙述、技术文档。chunk 信息量大,但容易引入噪音
- **>2000 字符**:慎用,除非做摘要式检索(先摘要后检索)

**overlap 的取舍:**
- 一般取 chunk_size 的 10%-20%
- overlap 太小:边界句子被腰斩,信息不完整
- overlap 太大:chunk 之间内容高度重复,浪费存储和 token
- 推荐:chunk_size=500 → overlap=50-100

**经验对照表:**

| 文档类型 | 推荐 chunk_size | 推荐 overlap | 备注 |
|---------|----------------|-------------|------|
| FAQ/问答 | 200-300 | 0-30 | 每个问答对独立成 chunk |
| 技术文档 | 500-800 | 50-100 | 通用甜点区 |
| 长篇小说 | 800-1500 | 100-200 | 叙述性强,可大一些 |
| 代码文件 | 按函数/类 | 0 | 按结构切,不要硬切 |
| Markdown | 按标题 | 0 | 用 MarkdownHeaderTextSplitter |
| 法律合同 | 300-500 | 50 | 条款要单独成 chunk |

### 33.4 不同文档类型的切分实践

#### 33.4.1 PDF 切分

\`\`\`python
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 加载 PDF
loader = PyPDFLoader("report.pdf")
pages = loader.load()  # 每页一个 Document 对象

# 按 500 字符切分,每页再切多块
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
)

chunks = splitter.split_documents(pages)
print(f"PDF 共 {len(pages)} 页, 切分为 {len(chunks)} 个 chunk")
# 每个 chunk 自带 metadata: {"source": "report.pdf", "page": 0}
\`\`\`

#### 33.4.2 代码切分

代码不能按字符硬切,否则会破坏函数定义。要用专门的代码切分器。

\`\`\`python
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language

# Python 代码切分器
python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=800,
    chunk_overlap=100,
)

code = """
def calculate_sum(a, b):
    \"\"\"计算两个数的和\"\"\"
    return a + b

class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = calculate_sum(a, b)
        self.history.append(result)
        return result
"""

chunks = python_splitter.split_text(code)
# 切分器会尽量在 def/class 边界处切分,而不是在函数内部硬切
\`\`\`

#### 33.4.3 HTML 切分

\`\`\`python
from langchain_text_splitters import HTMLHeaderTextSplitter

html_text = "<html><body><h1>标题</h1><p>段落</p></body></html>"
splitter = HTMLHeaderTextSplitter(headers_to_split_on=[("h1", "Title")])
chunks = splitter.split_text(html_text)
\`\`\`

### 33.5 切分对检索质量的影响

切分策略直接决定 RAG 系统的召回率和精度。下面用一个对照实验展示:

\`\`\`python
# 模拟实验:同一份文档,不同切分策略对检索结果的影响
documents = ["..."]  # 你的文档列表

# 策略 A:chunk_size=100(过细)
splitter_a = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=0)
# 策略 B:chunk_size=500(适中)
splitter_b = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
# 策略 C:chunk_size=2000(过粗)
splitter_c = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)

# 评估指标:
# - 召回率(Recall):正确的 chunk 是否被检索到 top-k 中
# - 精确率(Precision):top-k 中有多少 chunk 是真正相关的
# - 答案正确率:最终 LLM 回答的正确率
\`\`\`

**典型现象:**
- 过细切分:精确率高,但召回率低,单 chunk 信息不足,LLM 难以给出完整答案
- 过粗切分:召回率高,但精确率低,引入噪音,LLM 易被干扰
- 适中切分:在两者之间取得平衡,是经验和实验的产物

### 33.6 切分实战:切分一份长技术文档

下面是一个完整的实战示例,把一份长 Markdown 技术文档切分成可用于 RAG 的 chunk:

\`\`\`python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
)

# 第一步:加载文档
loader = TextLoader("tech_doc.md")
documents = loader.load()

# 第二步:先按 Markdown 标题切分,保留结构信息
headers_to_split_on = [
    ("#", "h1"),
    ("##", "h2"),
    ("###", "h3"),
]
md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
md_chunks = md_splitter.split_text(documents[0].page_content)

# 第三步:再对每个 Markdown 块用 RecursiveCharacterTextSplitter 切分
# 这样既能保留结构,又能控制 chunk 大小
char_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", "。", " ", ""],
)

final_chunks = []
for md_chunk in md_chunks:
    # 把标题信息加到 metadata 里
    sub_chunks = char_splitter.split_text(md_chunk.page_content)
    for sub in sub_chunks:
        final_chunks.append({
            "content": sub,
            "metadata": md_chunk.metadata,  # {"h1": "...", "h2": "..."}
        })

print(f"原始文档 {len(documents[0].page_content)} 字符")
print(f"切分为 {len(final_chunks)} 个 chunk")
print(f"平均 chunk 长度: {sum(len(c['content']) for c in final_chunks) / len(final_chunks):.0f} 字符")

# 输出示例:
# 原始文档 15320 字符
# 切分为 38 个 chunk
# 平均 chunk 长度: 487 字符
\`\`\`

### 33.7 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 用空格当分隔符处理中文 | 中文文本无空格,切分失败 | 配置中文分隔符:["。","！","？","\\n"," "] |
| overlap 设为 0 | 边界句子被腰斩,信息丢失 | 至少 10-20% 的 overlap |
| chunk_size 设得过大 | 单 chunk 主题混杂,检索精度下降 | 控制在 500-1000 字符 |
| 切代码用通用切分器 | 函数定义被腰斩,代码不可读 | 用 from_language 指定语言 |
| 切 HTML 忽略标签 | 标签和正文混杂,噪音大 | 用 HTMLHeaderTextSplitter |
| 忽略元数据 | 检索后无法溯源 | 切分时保留 source/page/title 元数据 |
| 一份文档一刀切 | 不同文档类型用同一参数 | 按类型分别配置切分器 |

> **小结**:文档切分是 RAG 系统的"地基"。地基不对,embedding 模型再贵、LLM 再强也救不回来。投入时间调优切分策略,是 RAG 工程中性价比最高的优化。`,
  },

  // =============================================================
  // 第三十四章:RAG 完整流程
  // =============================================================
  {
    id: 'rag-pipeline',
    group: 'RAG 实战',
    icon: '🔧',
    title: 'RAG 完整流程',
    content: `## 第三十四章　RAG 完整流程

> 前面几章我们分别讲了 embedding、向量库、文档切分。本章把它们串起来,跑通一个能跑、能用、能改的 RAG 流程。

### 34.1 RAG 完整流程总览

一个生产可用的 RAG 系统由两个 pipeline 组成:**索引 pipeline**(离线)和**查询 pipeline**(在线)。

\`\`\`text
【索引 pipeline(离线,跑一次或定期跑)】
原始文档 → 加载 → 切分 → embedding → 存入向量库

【查询 pipeline(在线,每次提问都跑)】
用户问题 → query embedding → 向量检索 top-k → 拼接 prompt → LLM 生成答案
\`\`\`

为什么分成两条?因为索引一次可以查询无数次,把昂贵的 embedding 计算分摊到每次查询。如果文档库更新频率低,这条 pipeline 极具性价比。

### 34.2 索引 pipeline 实现

#### 34.2.1 加载文档

LangChain 提供丰富的 document loader,覆盖 PDF、DOCX、HTML、Markdown、CSV 等几乎所有常见格式。

\`\`\`python
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredMarkdownLoader,
    WebBaseLoader,
    DirectoryLoader,
)

# 加载单个 PDF
pdf_loader = PyPDFLoader("research_paper.pdf")
pdf_docs = pdf_loader.load()  # 每页一个 Document

# 加载 Word 文档
docx_loader = Docx2txtLoader("notes.docx")
docx_docs = docx_loader.load()

# 加载一个目录下所有 .md 文件
dir_loader = DirectoryLoader(
    "./docs",
    glob="**/*.md",
    loader_cls=UnstructuredMarkdownLoader,
)
dir_docs = dir_loader.load()

# 加载网页
web_loader = WebBaseLoader("https://example.com/article")
web_docs = web_loader.load()

# 合并所有文档
all_docs = pdf_docs + docx_docs + dir_docs + web_docs
print(f"共加载 {len(all_docs)} 个文档")
\`\`\`

每个 Document 对象有 \`page_content\`(正文)和 \`metadata\`(元数据,如来源、页码)。元数据在后续溯源时至关重要,务必保留。

#### 34.2.2 切分文档

切分策略参见上一章,这里给出标准模板:

\`\`\`python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", "。", "！", "？", "，", " ", ""],
)

chunks = splitter.split_documents(all_docs)
print(f"切分为 {len(chunks)} 个 chunk")
\`\`\`

#### 34.2.3 生成 embedding

\`\`\`python
from langchain_openai import OpenAIEmbeddings

# 选择 embedding 模型
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 测试一个文本
test_vector = embeddings.embed_query("测试文本")
print(f"向量维度: {len(test_vector)}")  # 通常 1536 维
\`\`\`

#### 34.2.4 存入向量库

主流向量库对比:

| 向量库 | 特点 | 适用场景 |
|--------|------|---------|
| Chroma | 轻量纯 Python,本地开发友好 | 原型、小规模数据 |
| FAISS | Meta 开源,纯本地,高性能 | 单机大规模、不需持久化 |
| Pinecone | 全托管云服务 | 生产环境、免运维 |
| Weaviate | 开源+云,功能全 | 多模态、复杂查询 |
| Milvus | 开源,分布式,性能强 | 大规模生产 |
| PGVector | PostgreSQL 扩展 | 已有 PG 基础设施 |

\`\`\`python
from langchain_community.vectorstores import Chroma

# 持久化到本地磁盘
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",  # 持久化目录
    collection_name="my_docs",
)

# 之后加载时:
# vectorstore = Chroma(
#     persist_directory="./chroma_db",
#     embedding_function=embeddings,
#     collection_name="my_docs",
# )

print(f"向量库已存入 {len(chunks)} 个 chunk")
\`\`\`

### 34.3 查询 pipeline 实现

#### 34.3.1 用户问题向量化

\`\`\`python
query = "RAG 系统怎么选 embedding 模型?"
query_embedding = embeddings.embed_query(query)
\`\`\`

#### 34.3.2 检索 top-k

\`\`\`python
# 从向量库检索最相关的 5 个 chunk
retrieved_docs = vectorstore.similarity_search_with_relevance_scores(
    query,
    k=5,  # 检索 top-5
)

# 每个结果包含 chunk 内容、元数据、相似度分数
for i, (doc, score) in enumerate(retrieved_docs):
    print(f"--- 第 {i+1} 条 (相关度 {score:.3f}) ---")
    print(f"来源: {doc.metadata.get('source', 'unknown')}")
    print(f"内容: {doc.page_content[:100]}...")
    print()
\`\`\`

**top-k 怎么选?**
- k=3-5:大多数场景的甜点区。太少易漏,太多引入噪音
- k=1-2:简单 FAQ、强匹配场景
- k=8-10:复杂问题、需要多角度信息综合时
- k>10:慎用,通常说明切分或 embedding 有问题

#### 34.3.3 设计 prompt 模板

prompt 模板是 RAG 系统的"灵魂"。好的 prompt 应该明确告诉 LLM:基于哪些材料、如何引用、不知道时如何回应。

\`\`\`python
from langchain_core.prompts import ChatPromptTemplate

# RAG prompt 模板
template = """你是一个严谨的知识库问答助手。请基于以下检索到的文档片段回答用户问题。

要求:
1. 只基于提供的文档内容回答,不要编造或使用文档外的知识
2. 如果文档中没有相关信息,请明确说"根据现有资料,我无法回答这个问题"
3. 在回答中标注引用来源,格式为 [来源: 文件名, 第 X 页]
4. 回答要简洁清晰,不要冗余扩展

检索到的文档片段:
{context}

用户问题: {question}

回答:"""

prompt = ChatPromptTemplate.from_template(template)
\`\`\`

#### 34.3.4 拼接 context

\`\`\`python
def format_context(retrieved_docs):
    """
    把检索到的多个 chunk 拼成一段 context 文本
    每个 chunk 前加上来源标记,方便 LLM 引用
    """
    context_parts = []
    for i, (doc, score) in enumerate(retrieved_docs):
        source = doc.metadata.get('source', 'unknown')
        page = doc.metadata.get('page', '?')
        context_parts.append(
            f"【片段 {i+1}】(来源: {source}, 第 {page} 页)\\n{doc.page_content}"
        )
    return "\\n\\n".join(context_parts)

context = format_context(retrieved_docs)
\`\`\`

#### 34.3.5 调用 LLM 生成答案

\`\`\`python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 构造最终 prompt
final_prompt = prompt.format(context=context, question=query)

# 调用 LLM
response = llm.invoke(final_prompt)
print(response.content)
\`\`\`

### 34.4 完整可运行的 RAG 示例

把以上所有步骤串成一个完整的 RAG 类,可直接用于生产:

\`\`\`python
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os

class RAGSystem:
    """一个完整的 RAG 系统"""
    
    def __init__(self, doc_path, persist_dir="./chroma_db"):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.persist_dir = persist_dir
        self.doc_path = doc_path
        self.vectorstore = None
        self.retriever = None
        
        # 切分器
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )
        
        # prompt 模板
        self.prompt = ChatPromptTemplate.from_template("""你是一个严谨的知识库问答助手。请基于以下文档片段回答问题。

要求:
1. 只基于文档内容,不要编造
2. 无相关信息时回答"根据现有资料,我无法回答"
3. 标注引用来源

文档片段:
{context}

问题: {question}

回答:""")
    
    def build_index(self):
        """构建索引(离线跑一次)"""
        # 加载文档
        loader = PyPDFLoader(self.doc_path)
        docs = loader.load()
        # 切分
        chunks = self.splitter.split_documents(docs)
        # 存入向量库
        self.vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=self.persist_dir,
        )
        # 配置检索器
        self.retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5},
        )
        print(f"索引构建完成,共 {len(chunks)} 个 chunk")
    
    def load_index(self):
        """加载已有索引"""
        self.vectorstore = Chroma(
            persist_directory=self.persist_dir,
            embedding_function=self.embeddings,
        )
        self.retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 5},
        )
    
    def query(self, question):
        """查询并返回答案"""
        # 检索相关文档
        retrieved_docs = self.retriever.invoke(question)
        # 拼接 context
        context = "\\n\\n".join(
            f"【来源: {d.metadata.get('source', '?')}】\\n{d.page_content}"
            for d in retrieved_docs
        )
        # 调用 LLM
        chain = self.prompt | self.llm | StrOutputParser()
        answer = chain.invoke({"context": context, "question": question})
        return {
            "answer": answer,
            "sources": [d.metadata for d in retrieved_docs],
        }


# 使用示例
if __name__ == "__main__":
    rag = RAGSystem(doc_path="knowledge.pdf")
    # 第一次需要构建索引
    rag.build_index()
    # 之后用 rag.load_index() 加载
    
    # 提问
    result = rag.query("RAG 系统的核心步骤是什么?")
    print("答案:", result["answer"])
    print("引用来源:", result["sources"])
\`\`\`

### 34.5 引用来源标注

引用来源是 RAG 系统可信度的关键。LLM 不一定靠谱,但引用源可以人工核实。下面是更精细的引用管理:

\`\`\`python
def query_with_citations(rag, question):
    """带精确引用的查询"""
    retrieved_docs = rag.retriever.invoke(question)
    context_parts = []
    citations = []
    for i, doc in enumerate(retrieved_docs):
        source = doc.metadata.get('source', 'unknown')
        page = doc.metadata.get('page', 0)
        citation_id = f"[{i+1}]"
        context_parts.append(f"{citation_id} {doc.page_content}")
        citations.append({
            "id": citation_id,
            "source": source,
            "page": page,
            "preview": doc.page_content[:80] + "...",
        })
    
    context = "\\n\\n".join(context_parts)
    chain = rag.prompt | rag.llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})
    return {"answer": answer, "citations": citations}
\`\`\`

### 34.6 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 索引不持久化 | 每次重启都要重新切分、embed | 用 persist_directory 持久化到磁盘 |
| 检索结果不带元数据 | 答案无引用来源,无法核实 | 切分时保留 source/page 元数据 |
| k 值过大 | context 太长,token 超限,LLM 慢 | 控制 k=3-5,监控总 token 数 |
| prompt 不限制"编造" | LLM 用文档外知识"补全"答案 | 显式要求"无相关信息时回答不知道" |
| temperature 太高 | LLM 胡乱发挥,答案不稳定 | RAG 场景 temperature=0 |
| 未处理 chunk 元数据冲突 | 多文档合并时 metadata 丢失 | 切分后统一加 source 字段 |
| 索引和查询用不同 embedding | 检索质量断崖式下降 | 索引和查询必须用同一 embedding 模型 |

> **小结**:RAG 流程看似简单,但每个环节都有坑。把这套流程跑通只是第一步,真正的工程化挑战在切分调优、prompt 工程、评估和持续迭代。下一章讲高级 RAG 技术,把这些坑一个个填掉。`,
  },

  // =============================================================
  // 第三十五章:高级 RAG 技术
  // =============================================================
  {
    id: 'rag-advanced',
    group: 'RAG 实战',
    icon: '🚀',
    title: '高级 RAG 技术',
    content: `## 第三十五章　高级 RAG 技术

> 上一章的"朴素 RAG"跑得起来,但生产环境往往答非所问。本章讲五个核心改进技术,把 RAG 从"能用"推到"好用"。

### 35.1 基础 RAG 的五大问题

跑通基础 RAG 后,真实业务中你会遇到这些症状:

1. **检索不准**:用户问题表述模糊,vector 相似度高但语义不对
2. **检索重复**:top-k 中多个 chunk 内容高度重叠,浪费 context
3. **噪音干扰**:低相关度 chunk 被检索到,拉低答案质量
4. **问题与文档语言不一致**:用户问"Python 怎么读文件",文档用"file I/O"表述
5. **chunk 太小信息不全**:检索到一句"参见第三章",但第三章内容不在 chunk 里

下面五个技术分别对应这些问题。

### 35.2 改进 1:查询重写(Query Rewriting)

**问题**:用户问"那个怎么用",代词"那个"指代不清,直接 embedding 检索效果差。

**思路**:让 LLM 先把用户问题重写成更清晰、更适合检索的版本。

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# 查询重写 prompt
rewrite_prompt = ChatPromptTemplate.from_template("""你是一个查询重写助手。
将用户的口语化问题重写为更适合向量检索的清晰问题。

要求:
1. 保留原意,不要引入新信息
2. 补充代词的指代对象(基于对话历史)
3. 输出 1-3 个重写版本,每行一个

对话历史: {history}
原始问题: {question}
重写版本:""")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def rewrite_query(question, history=""):
    """用 LLM 重写用户查询"""
    chain = rewrite_prompt | llm
    result = chain.invoke({"question": question, "history": history})
    # 解析多个重写版本
    rewrites = [line.strip() for line in result.content.split("\\n") if line.strip()]
    return rewrites

# 示例
rewrites = rewrite_query("那个怎么用", history="用户在问 Python 的 open 函数")
# 输出: ["Python 的 open 函数怎么使用?", "如何在 Python 中用 open 打开文件?", ...]
\`\`\`

**进阶:多查询重写(Multi-Query)**——从多个角度重写同一个问题,分别检索,合并去重:

\`\`\`python
def multi_query_search(vectorstore, question, k=3):
    """多查询检索:对多个重写版本分别检索,合并去重"""
    rewrites = rewrite_query(question)
    all_docs = []
    seen_ids = set()  # 用于去重
    
    for rewrite in rewrites:
        docs = vectorstore.similarity_search(rewrite, k=k)
        for doc in docs:
            # 用内容 hash 作为去重 key
            doc_id = hash(doc.page_content)
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                all_docs.append(doc)
    
    # 按相关度排序(这里简化处理)
    return all_docs[:k*2]
\`\`\`

### 35.3 改进 2:重排序 Reranker

**问题**:向量检索是"双塔模型"(query 和 doc 各自 embed 后算相似度),精度有限,容易召回看似相关实则跑题的 chunk。

**思路**:用 cross-encoder(交叉编码器)对 top-k 候选 chunk 重新打分。Cross-encoder 把 query 和 doc 拼一起送入模型,精度更高但更慢。所以只能用于小规模重排。

\`\`\`python
from sentence_transformers import CrossEncoder

# 加载 cross-encoder 模型
reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank_docs(query, docs, top_k=3):
    """
    用 cross-encoder 对检索结果重新打分排序
    :param query: 用户问题
    :param docs: 初步检索到的文档列表
    :param top_k: 重排后返回前 top_k 个
    """
    # 构造 query-doc 对
    pairs = [(query, doc.page_content) for doc in docs]
    # 用 cross-encoder 打分
    scores = reranker.predict(pairs)
    # 按 score 降序排序
    scored_docs = list(zip(docs, scores))
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in scored_docs[:top_k]]

# 完整流程
# 1. 向量检索 top-10
initial_docs = vectorstore.similarity_search(query, k=10)
# 2. reranker 重排选 top-3
final_docs = rerank_docs(query, initial_docs, top_k=3)
\`\`\`

**为什么有效?** 双塔模型为了快速检索,牺牲了 query-doc 的细粒度交互;cross-encoder 让 query 和 doc 在 transformer 内部充分交互,精度显著提升。

**主流 Reranker 模型:**
- \`cross-encoder/ms-marco-MiniLM-L-6-v2\`:英文,轻量
- \`BAAI/bge-reranker-base\`:中文友好,开源
- Cohere Rerank API:商用,效果好
- Jina Reranker:商用,多语言

### 35.4 改进 3:混合检索(向量 + 关键词)

**问题**:纯向量检索对专有名词、人名、产品型号不敏感。比如搜"GPT-4 Turbo",向量模型可能召回所有提到 GPT 的文档,但真正含"Turbo"这个关键词的反而不在前。

**思路**:向量检索(语义匹配) + BM25(关键词匹配),两路结果融合。

\`\`\`python
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import Chroma
from langchain.retrievers import EnsembleRetriever

# 第一路:BM25 关键词检索
bm25_retriever = BM25Retriever.from_documents(chunks)
bm25_retriever.k = 5

# 第二路:向量检索
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 融合检索器:加权融合
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.3, 0.7],  # BM25 权重 0.3, 向量权重 0.7
)

# 检索
docs = ensemble_retriever.invoke("GPT-4 Turbo 的价格是多少?")
\`\`\`

**为什么有效?** 向量擅长语义相似(同义词、跨语言),BM25 擅长精确匹配(关键词、专有名词)。两者互补,召回率显著提升。

**权重怎么调?**
- 知识库以专有名词为主(产品文档、API):BM25 权重高些(0.4-0.5)
- 知识库以叙述为主(小说、新闻):向量权重高些(0.8)
- 默认 0.5/0.5 起步,根据评估结果调整

### 35.5 改进 4:Multi-Query 多角度检索

**问题**:用户问题往往只问一个角度,但答案可能分散在多个 chunk 里。

**思路**:让 LLM 把一个问题拆成多个子问题,分别检索,合并答案。

\`\`\`python
from langchain_core.prompts import ChatPromptTemplate

# 子问题拆分 prompt
decompose_prompt = ChatPromptTemplate.from_template("""把用户问题拆分成 2-4 个独立的子问题,每个子问题可单独检索回答。

用户问题: {question}

输出格式(每行一个子问题):
1. ...
2. ...
3. ...
""")

def decompose_question(question, llm):
    """拆分多角度子问题"""
    chain = decompose_prompt | llm
    result = chain.invoke({"question": question})
    # 解析子问题
    sub_questions = [line.split(". ", 1)[-1] for line in result.content.split("\\n") if line.strip()]
    return sub_questions

# 示例
question = "对比 GPT-4 和 Claude 3 在代码生成上的差异"
sub_qs = decompose_question(question, llm)
# 输出:
# ['GPT-4 在代码生成上的表现如何?', 'Claude 3 在代码生成上的表现如何?', 'GPT-4 和 Claude 3 在代码生成上的差异是什么?']

def multi_query_pipeline(question, retriever, llm, k=3):
    """多角度检索 pipeline"""
    # 拆分子问题
    sub_questions = decompose_question(question, llm)
    # 对每个子问题检索
    sub_results = {}
    for sub_q in sub_questions:
        docs = retriever.invoke(sub_q)[:k]
        sub_results[sub_q] = docs
    
    # 综合答案
    final_prompt = f"""基于以下多角度检索结果,综合回答用户问题。
    
原始问题: {question}

子问题及检索结果:
"""
    for sub_q, docs in sub_results.items():
        final_prompt += f"\\n## 子问题: {sub_q}\\n"
        for doc in docs:
            final_prompt += f"- {doc.page_content[:200]}...\\n"
    
    final_prompt += "\\n综合回答:"
    
    return llm.invoke(final_prompt).content
\`\`\`

### 35.6 改进 5:Parent-Child 索引(小块检索,大块返回)

**问题**:为了检索精度,chunk 切得小;但小 chunk 信息不足,LLM 难以给出完整答案。

**思路**:用小块做检索,但返回时换成它所属的大块(父块)。

\`\`\`python
# Parent-Child 索引实现思路
# 1. 文档先切成大块(parent chunks),每个大块 1500 字符
# 2. 每个大块再切成小块(child chunks),每个小块 300 字符
# 3. 小块做 embedding 存入向量库,并记录它属于哪个 parent
# 4. 检索时检索小块,返回时换回对应的 parent

from langchain.retrievers import ParentDocumentRetriever
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# 加载文档
loader = TextLoader("long_doc.txt")
docs = loader.load()

# 父切分器(大块)
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=1500)
# 子切分器(小块)
child_splitter = RecursiveCharacterTextSplitter(chunk_size=300)

# 向量库存子块
vectorstore = Chroma(embedding_function=OpenAIEmbeddings())
# 内存文档库存父块
from langchain.storage import InMemoryStore
store = InMemoryStore()

# Parent-Child 检索器
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
retriever.add_documents(docs)

# 检索时:用小块检索,返回大块
results = retriever.invoke("某个具体问题")
\`\`\`

**为什么有效?** 小块 embedding 语义集中,检索精度高;大块返回信息完整,LLM 有充足上下文。

### 35.7 HyDE:假设性文档 Embedding

**问题**:用户问题通常是疑问句,而文档库的 chunk 是陈述句。问题与文档的语义空间不一致,直接相似度计算效果差。

**思路**:HyDE(Hypothetical Document Embeddings)先用 LLM 生成一个"假设性答案文档",再用这个文档去向量库检索,而不是用原问题。

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# 生成假设性答案的 prompt
hyde_prompt = ChatPromptTemplate.from_template("""请为以下问题写一段 100-200 字的假设性答案,即使你不确定也要写一段合理的陈述。

问题: {question}

假设性答案:""")

def hyde_search(question, vectorstore, llm, k=3):
    """HyDE 检索"""
    # 1. 生成假设性答案
    chain = hyde_prompt | llm
    hypothetical_answer = chain.invoke({"question": question}).content
    print(f"生成的假设性答案: {hypothetical_answer[:100]}...")
    
    # 2. 用假设性答案去检索(而不是用原问题)
    docs = vectorstore.similarity_search(hypothetical_answer, k=k)
    return docs
\`\`\`

**为什么有效?** 假设性答案和真实文档都是陈述句,语义空间更接近,检索精度提升。

**适用场景**:用户问题表述与文档表述差异大时。**不适用**:简单事实型问题(反而引入噪音)。

### 35.8 各技术效果对比

下表是同一份测试集上各技术的典型效果对比(数据为示意):

| 技术 | 召回率 | 答案准确率 | 额外成本 | 实现难度 | 推荐度 |
|------|--------|-----------|---------|---------|--------|
| 基础 RAG | 60% | 65% | 低 | ★ | 基线 |
| 查询重写 | +5% | +3% | 1 次 LLM 调用 | ★★ | 高 |
| Reranker | +10% | +8% | cross-encoder 推理 | ★★ | 极高 |
| 混合检索 | +8% | +5% | BM25 索引 | ★★ | 极高 |
| Multi-Query | +12% | +6% | N 次 LLM 调用 | ★★★ | 中 |
| Parent-Child | +3% | +10% | 双重索引 | ★★★ | 中高 |
| HyDE | +7% | +4% | 1 次 LLM 调用 | ★★ | 中 |

**组合推荐(生产环境):** 查询重写 + 混合检索 + Reranker,通常能把基础 RAG 准确率从 65% 提到 80%+。

### 35.9 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| Reranker 模型选错 | 中文场景用英文 reranker 效果差 | 中文用 BAAI/bge-reranker |
| Multi-Query 子问题没去重 | 同一 chunk 被多次召回,占满 context | 检索结果按内容 hash 去重 |
| HyDE 用在简单问题上 | 假设答案反而引入噪音 | 仅在表述差异大时启用 |
| 混合检索权重不调 | 默认 0.5/0.5 不一定最优 | 按数据类型评估调权重 |
| Parent-Child 父块过大 | 父块 2000+ 字符撑爆 context | 父块控制在 1000-1500 字符 |
| 重写后丢失原问题 | LLM 改写偏离原意 | 改写 prompt 强调"保留原意" |

> **小结**:高级 RAG 不是"越多技术越好",而是"按症状下药"。先用基础 RAG 跑通评估,看具体问题在哪一环,再针对性地加改进。盲目堆技术反而增加延迟和成本。`,
  },

  // =============================================================
  // 第三十六章:RAG 质量评估
  // =============================================================
  {
    id: 'rag-eval',
    group: 'RAG 实战',
    icon: '📊',
    title: 'RAG 质量评估',
    content: `## 第三十六章　RAG 质量评估

> "无法度量就无法改进。"RAG 系统的每个改进都要靠评估数据反馈。本章讲怎么构建评估体系、怎么定位 bad case、怎么做持续监控。

### 36.1 为什么 RAG 评估难

传统机器学习评估有标准答案,跑个准确率就行。RAG 评估难在三方面:

- **无标准答案**:同一个问题可以有多种正确表述,字面匹配会判错
- **多维质量**:不止"对错",还要看是否引用源、是否简洁、是否完整
- **多环节失败**:可能是检索失败,可能是 LLM 生成失败,也可能是 prompt 设计失败,定位难

**关键认知**:RAG 评估要分两层——**检索质量**和**生成质量**,分别评估才能定位问题。

### 36.2 RAGAS 框架

RAGAS(Retrieval-Augmented Generation Assessment)是当前最流行的 RAG 自动评估框架,提供四个核心指标:

#### 36.2.1 四个核心指标

\`\`\`text
1. Faithfulness(忠实度)
   定义:答案是否忠实于检索到的文档,有没有"编造"
   衡量:答案中每个事实陈述能否在 context 中找到支持
   高分 = 答案都来自文档;低分 = LLM 在编造

2. Answer Relevancy(答案相关性)
   定义:答案是否真正回答了用户问题
   衡量:从答案反推问题,看与原问题的相似度
   高分 = 答案切题;低分 = 答非所问

3. Context Precision(上下文精确率)
   定义:检索到的 chunk 中有多少是真正相关的
   衡量:top-k 中相关 chunk 的比例
   高分 = 检索精准;低分 = 引入大量噪音

4. Context Recall(上下文召回率)
   定义:回答问题所需的信息是否都被检索到
   衡量:标准答案中的事实在 context 中的覆盖比例
   高分 = 信息齐全;低分 = 检索漏掉关键信息
\`\`\`

#### 36.2.2 RAGAS 实战代码

\`\`\`python
# 安装: pip install ragas
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from ragas.dataset_schema import SingleTurnSample
from datasets import Dataset

# 构造评估数据集
# 每条样本需要:question, answer, contexts, ground_truth
eval_data = [
    {
        "question": "RAG 系统的核心步骤是什么?",
        "answer": "RAG 的核心步骤包括:文档加载、切分、embedding、存入向量库、检索、prompt 拼接、LLM 生成。",
        "contexts": ["RAG 流程包括索引和查询两个 pipeline..."],
        "ground_truth": "RAG 流程: 加载文档→切分→embedding→存向量库→查询→检索→prompt→生成。",
    },
    # ... 更多评估样本
]

# 转换为 HuggingFace Dataset
dataset = Dataset.from_list(eval_data)

# 运行评估
results = evaluate(
    dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall,
    ],
)

print(results)
# 输出示例:
# {'faithfulness': 0.85, 'answer_relevancy': 0.78, 'context_precision': 0.72, 'context_recall': 0.68}
\`\`\`

**指标解读:**
- faithfulness 低 → LLM 在编造,改 prompt 强调"基于文档"
- answer_relevancy 低 → 答案跑题,可能是检索不准或 prompt 误导
- context_precision 低 → 检索引入噪音,加 reranker 或调小 k
- context_recall 低 → 检索漏信息,加大 k、改切分、加查询重写

### 36.3 人工评估维度

自动评估再好,也有覆盖不到的盲区。生产环境一定要配人工评估。常见维度:

| 维度 | 含义 | 评分方式 |
|------|------|---------|
| 正确性 | 答案事实是否准确 | 1-5 分,5=完全正确 |
| 完整性 | 是否覆盖所有要点 | 1-5 分,5=完全覆盖 |
| 相关性 | 是否切题 | 1-5 分,5=高度相关 |
| 引用准确性 | 引用源是否对应答案内容 | 1-5 分 |
| 简洁性 | 是否冗余 | 1-5 分,5=恰到好处 |
| 可读性 | 表述是否清晰 | 1-5 分 |

\`\`\`python
# 人工评估表生成模板
def generate_eval_sheet(rag_results, output_file="eval_sheet.csv"):
    """
    生成人工评估表
    :param rag_results: RAG 系统的查询结果列表
    """
    import csv
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "id", "question", "answer", "contexts",
            "正确性(1-5)", "完整性(1-5)", "相关性(1-5)",
            "引用准确性(1-5)", "简洁性(1-5)", "备注"
        ])
        for i, r in enumerate(rag_results):
            writer.writerow([
                i, r["question"], r["answer"],
                " || ".join(r["contexts"])[:200],
                "", "", "", "", "", ""  # 人工填写
            ])
    print(f"评估表已生成: {output_file}")
\`\`\`

### 36.4 A/B 测试

RAG 系统改了切分器或加了 reranker,不能直接上线,要做 A/B 测试。

\`\`\`python
import random

def ab_test(version_a_results, version_b_results):
    """
    简单 A/B 测试:对比两个版本的指标
    :param version_a_results: 版本 A 的评估结果
    :param version_b_results: 版本 B 的评估结果
    """
    metrics = ["faithfulness", "answer_relevancy", "context_precision", "context_recall"]
    print(f"{'指标':<25} {'版本 A':<10} {'版本 B':<10} {'变化':<10}")
    print("-" * 55)
    for m in metrics:
        a_avg = sum(r[m] for r in version_a_results) / len(version_a_results)
        b_avg = sum(r[m] for r in version_b_results) / len(version_b_results)
        delta = (b_avg - a_avg) / a_avg * 100
        arrow = "↑" if delta > 0 else "↓"
        print(f"{m:<25} {a_avg:.3f}     {b_avg:.3f}     {arrow}{abs(delta):.1f}%")

# 示例:对比基础 RAG 和加了 reranker 的 RAG
print("基础 RAG vs 加 Reranker:")
ab_test(baseline_results, reranker_results)
\`\`\`

### 36.5 评估数据集构建

评估数据集是 RAG 优化的基石,质量直接决定评估结论可信度。

#### 36.5.1 数据来源

\`\`\`text
1. 真实用户问题(最宝贵)
   - 从生产日志中采样,覆盖真实分布
   - 重点关注长尾问题、错误案例
   
2. 人工构造
   - 领域专家根据文档生成 Q&A 对
   - 覆盖不同难度:事实型、推理型、对比型、否定型
   
3. LLM 合成
   - 用 LLM 从文档自动生成 Q&A
   - 适合冷启动,但需要人工抽检
   
4. 公开数据集
   - MS MARCO、Natural Questions、HotpotQA
   - 通用能力评估,但与业务可能不匹配
\`\`\`

#### 36.5.2 数据集规模

- **冷启动**:50-100 条精选,够跑通评估流程
- **稳定迭代**:200-500 条,覆盖主要问题类型
- **生产级**:1000+ 条,包含长尾和难例

\`\`\`python
# 用 LLM 自动生成评估数据集
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

gen_prompt = ChatPromptTemplate.from_template("""基于以下文档片段,生成 3 个问答对,要求:
1. 问题应该能用文档内容回答
2. 问题类型多样:事实型、推理型、对比型
3. 答案要简洁,且标注在文档中的位置

文档片段: {doc}

输出格式(JSON):
[{{"question": "...", "answer": "...", "type": "事实型"}}]
""")

def generate_eval_dataset(docs, llm):
    """从文档自动生成评估数据集"""
    dataset = []
    for doc in docs:
        chain = gen_prompt | llm
        result = chain.invoke({"doc": doc.page_content})
        # 解析 JSON(简化处理,实际要用 JSON 解析器)
        import json
        try:
            qa_pairs = json.loads(result.content)
            for qa in qa_pairs:
                qa["source_doc"] = doc.metadata.get("source")
                dataset.append(qa)
        except Exception as e:
            print(f"解析失败: {e}")
    return dataset
\`\`\`

### 36.6 Bad Case 分析与改进

评估不只是看分数,更要看哪些 case 失败、为什么失败。

#### 36.6.1 Bad Case 分类

\`\`\`text
【检索失败类】
- 召回为空:相关 chunk 没被检索到 → 加大 k、改进切分、加查询重写
- 召回噪音:top-k 中很多无关 chunk → 加 reranker、调小 k
- 召回重复:多个 chunk 内容高度重复 → 切分时去重、调 overlap

【生成失败类】
- 编造:答案含文档外内容 → prompt 强调"基于文档"
- 跑题:答非所问 → 检索质量差,或 prompt 误导
- 不完整:只答了一部分 → context 不全,或 k 太小

【Prompt 失败类】
- 格式错乱:未按指定格式输出 → 加 few-shot 示例
- 引用错:引用源对不上答案 → 在 prompt 中教 LLM 引用

【数据失败类】
- 文档本身错:知识库有过时信息 → 定期更新
- 文档结构乱:PDF 表格、图片未提取 → 换 loader、用 LlamaParse
\`\`\`

#### 36.6.2 Bad Case 追踪流程

\`\`\`python
def trace_bad_case(question, rag_system):
    """追踪一个 bad case 的失败环节"""
    print(f"问题: {question}")
    
    # 1. 看检索结果
    retrieved = rag_system.retriever.invoke(question)
    print(f"\\n检索到 {len(retrieved)} 个 chunk:")
    for i, doc in enumerate(retrieved):
        print(f"  [{i+1}] {doc.page_content[:80]}...")
    
    # 2. 看 context 拼接
    context = "\\n".join(d.page_content for d in retrieved)
    
    # 3. 看最终 prompt
    final_prompt = rag_system.prompt.format(
        context=context, question=question
    )
    print(f"\\n最终 prompt 长度: {len(final_prompt)} 字符")
    
    # 4. 看 LLM 输出
    answer = rag_system.query(question)["answer"]
    print(f"\\n答案: {answer}")
    
    # 5. 分析失败环节
    print("\\n诊断:")
    if not retrieved:
        print("  ⚠ 检索失败:无召回,检查 embedding 或文档是否入库")
    elif any("无关" in c.page_content for c in retrieved):
        print("  ⚠ 检索噪音:召回内容不相关,建议加 reranker")
    elif "无法回答" in answer:
        print("  ⚠ 检索失败:有召回但未命中关键信息,建议加查询重写或增大 k")
    else:
        print("  ℹ 看起来正常,需人工核实答案准确性")
\`\`\`

### 36.7 持续监控

生产环境的 RAG 不是"上线就完事",要持续监控指标变化。

#### 36.7.1 监控指标

\`\`\`text
【业务指标】
- 用户满意度:点赞率、采纳率
- 任务完成率:用户是否需要重新提问
- 错误率:返回"无法回答"的比例

【技术指标】
- 检索相关度:top-k 平均相似度分数
- LLM 调用延迟:p99 延迟
- Token 消耗:每次查询平均 token 数
- 错误率:LLM 超时、向量库异常等

【质量指标(定期跑)】
- RAGAS 四指标趋势
- Bad case 增长率
- 用户反馈负向率
\`\`\`

#### 36.7.2 监控告警代码

\`\`\`python
import time
from collections import defaultdict

class RAGMonitor:
    """简易 RAG 监控器"""
    
    def __init__(self):
        self.metrics = defaultdict(list)
    
    def record(self, metric_name, value):
        """记录指标"""
        self.metrics[metric_name].append({
            "value": value,
            "timestamp": time.time(),
        })
    
    def get_average(self, metric_name, window=100):
        """获取最近 N 次的平均值"""
        recent = self.metrics[metric_name][-window:]
        if not recent:
            return None
        return sum(r["value"] for r in recent) / len(recent)
    
    def check_alerts(self):
        """检查告警"""
        alerts = []
        # 检索相关度告警
        avg_sim = self.get_average("retrieval_similarity")
        if avg_sim and avg_sim < 0.5:
            alerts.append(f"⚠ 检索相关度低: {avg_sim:.3f} < 0.5")
        # 无法回答率告警
        cant_answer_rate = self.get_average("cant_answer")
        if cant_answer_rate and cant_answer_rate > 0.2:
            alerts.append(f"⚠ 无法回答率高: {cant_answer_rate:.1%}")
        # 延迟告警
        avg_latency = self.get_average("latency_ms")
        if avg_latency and avg_latency > 5000:
            alerts.append(f"⚠ 平均延迟高: {avg_latency:.0f}ms")
        return alerts

# 使用
monitor = RAGMonitor()
# 每次 RAG 查询后记录
# monitor.record("retrieval_similarity", 0.78)
# monitor.record("latency_ms", 1200)
# alerts = monitor.check_alerts()
\`\`\`

### 36.8 评估代码示例:端到端评估流程

下面是一个完整的评估脚本模板,可直接用于生产环境:

\`\`\`python
import json
from datetime import datetime

def run_evaluation(rag_system, eval_dataset, output_file=None):
    """
    端到端 RAG 评估
    :param rag_system: RAG 系统实例
    :param eval_dataset: 评估数据集
    :param output_file: 结果输出文件
    """
    results = []
    
    for i, sample in enumerate(eval_dataset):
        question = sample["question"]
        ground_truth = sample.get("answer", "")
        
        # 跑 RAG
        start_time = time.time()
        rag_result = rag_system.query(question)
        latency = time.time() - start_time
        
        # 记录结果
        result = {
            "id": i,
            "question": question,
            "answer": rag_result["answer"],
            "contexts": [d.page_content for d in rag_result.get("sources", [])],
            "ground_truth": ground_truth,
            "latency_ms": latency * 1000,
        }
        results.append(result)
        print(f"[{i+1}/{len(eval_dataset)}] {question[:30]}... 耗时 {latency:.2f}s")
    
    # 跑 RAGAS 自动评估
    from ragas import evaluate
    from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
    
    dataset = Dataset.from_list(results)
    ragas_scores = evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
    )
    
    # 输出报告
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_samples": len(results),
        "avg_latency_ms": sum(r["latency_ms"] for r in results) / len(results),
        "ragas_scores": dict(ragas_scores),
        "details": results,
    }
    
    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\\n评估报告已保存: {output_file}")
    
    return report

# 使用
# eval_data = [...]  # 评估数据集
# report = run_evaluation(rag_system, eval_data, "eval_report.json")
\`\`\`

### 36.9 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 评估数据集太小 | 50 条以下,指标波动大 | 至少 100-200 条 |
| 评估数据全是简单问题 | 评估分数虚高,生产翻车 | 加入难例、长尾、否定型问题 |
| 只看自动指标不看人工 | RAGAS 高分但用户不满意 | 自动 + 人工双重评估 |
| 评估数据未与生产分布一致 | 评估好但上线差 | 从生产日志采样评估数据 |
| 没有基线对比 | 改进是否有效不知道 | 每次改动都和基线对比 |
| 评估只看平均分 | 长尾 bad case 被掩盖 | 看 p50/p90/p99 和 bad case |
| 评估一次性 | 改动后没重跑评估 | 每次改动都跑全套评估 |

> **小结**:RAG 评估是 RAG 系统的"度量衡"。没有评估,改进就是盲目的;有了评估,每个改进都能量化收益。投入时间构建评估数据集和流程,是 RAG 工程化最划算的投资之一。`,
  },
];
