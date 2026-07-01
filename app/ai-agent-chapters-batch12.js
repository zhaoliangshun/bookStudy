// =============================================================
// AI Agent开发实战 - 第十二批章节（第十二部分 LlamaIndex，共 4 章）
// 章节 45-48：数据框架 / 索引加载 / 查询引擎 / 框架对比
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十五章：LlamaIndex 数据框架
  // =============================================================
  {
    id: 'llamaindex-intro',
    group: 'LlamaIndex',
    icon: '🦙',
    title: 'LlamaIndex 数据框架',
    content: `## 第四十五章　LlamaIndex 数据框架

> "做 RAG 选 LlamaIndex,做 Agent 选 LangChain。"这是社区的共识。本章讲清 LlamaIndex 是什么、为什么 RAG 首选它。

### 45.1 LlamaIndex 是什么

**LlamaIndex** 是一个专注于"数据连接 + RAG"的 LLM 应用框架,由 Jerry Liu 于 2022 年 11 月发布。它的核心定位是:**把外部数据接入 LLM,让 LLM 能基于你的私有数据回答问题**。

\`\`\`text
LangChain 的强项:Agent 决策、Chain 编排、复杂流程
LlamaIndex 的强项:数据接入、RAG 检索、文档处理

不是竞争关系,而是分工:
- 你要做 Agent 决策 → LangChain 更顺手
- 你要做 RAG 文档问答 → LlamaIndex 更专业
\`\`\`

### 45.2 和 LangChain 的定位区别

两者都是 LLM 框架,但侧重点不同:

| 维度 | LlamaIndex | LangChain |
|------|-------------|----------|
| 核心定位 | 数据连接 + RAG | 通用 LLM 应用 + Agent |
| 强项 | 文档加载、索引、检索 | Chain 编排、Agent 决策 |
| 数据连接器 | 100+ 种(LlamaHub) | 也丰富,但 LlamaIndex 更专 |
| RAG 优化 | 深度优化,查询引擎丰富 | 基础支持 |
| Agent | 有,但不是主打 | 强项 |
| 学习曲线 | 较平缓 | 较陡峭 |
| 适合场景 | 文档问答、知识库 | 复杂工作流、Agent |

\`\`\`text
看代码量对比(做一个简单文档问答):

LangChain:
  loader → splitter → embeddings → vectorstore → retriever → prompt → chain

LlamaIndex:
  documents = SimpleDirectoryReader(...).load_data()
  index = VectorStoreIndex.from_documents(documents)
  query_engine = index.as_query_engine()
  response = query_engine.query("问题")
\`\`\`

**LlamaIndex 把 RAG 流程高度封装**,几行代码就能跑通完整 RAG,适合快速原型和"专注 RAG"的项目。

### 45.3 核心概念

理解 LlamaIndex 的几个核心概念,是理解整个框架的基础。

\`\`\`text
1. Document(文档):原始文档的抽象,有 text 和 metadata
2. Node(节点):文档切分后的最小单元,有 text、metadata、relationships
3. Index(索引):基于 Node 构建的检索结构
4. QueryEngine(查询引擎):基于 Index 接收查询、返回答案
5. Retriever(检索器):从 Index 中检索相关 Node
6. ResponseSynthesizer(响应合成器):把检索到的 Node 合成最终答案
\`\`\`

\`\`\`text
Document (原始)
   ↓ NodeParser 切分
Node (节点)
   ↓ Index 构建
Index (索引,如向量库)
   ↓ as_query_engine()
QueryEngine
   ↓ query("问题")
Response
\`\`\`

### 45.4 安装和第一个示例

\`\`\`bash
# 安装
pip install llama-index

# 如果用 OpenAI(默认)
pip install llama-index-llms-openai
pip install llama-index-embeddings-openai

# 设置 API Key
export OPENAI_API_KEY=sk-...
\`\`\`

**5 行代码完成文档问答:**

\`\`\`python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# 1. 加载文档(从 ./data 目录读所有支持的文件)
documents = SimpleDirectoryReader("./data").load_data()

# 2. 构建索引
index = VectorStoreIndex.from_documents(documents)

# 3. 创建查询引擎
query_engine = index.as_query_engine()

# 4. 提问
response = query_engine.query("这份文档讲了什么?")
print(response)
\`\`\`

这就是 LlamaIndex 的魅力——5 行代码,从原始文档到问答答案。LangChain 同样实现至少要 20+ 行。

### 45.5 为什么 RAG 首选 LlamaIndex

RAG 项目选 LlamaIndex 的几个核心理由:

#### 45.5.1 数据连接器丰富

LlamaHub 有 100+ 种数据连接器,覆盖几乎你能想到的所有数据源:

\`\`\`text
- 文件类:PDF、DOCX、MD、HTML、CSV、PPT、Excel
- 数据库:PostgreSQL、MySQL、MongoDB、Snowflake、Notion
- API 类:Google Drive、Slack、GitHub、Confluence、Jira
- 网页类:Web 页面、RSS、Sitemap
- 多媒体:图片、音频(转写)、视频
- 特殊:Discord、Notion、Roam Research
\`\`\`

\`\`\`python
# 几个连接器示例
from llama_index.readers.file import PDFReader
from llama_index.readers.github import GithubRepositoryReader
from llama_index.readers.notion import NotionPageReader

# 读 PDF
pdf_docs = PDFReader().load_data("report.pdf")

# 读 GitHub 仓库
github_docs = GithubRepositoryReader(
    owner="langchain-ai", repo="langchain"
).load_data()

# 读 Notion 页面
notion_docs = NotionPageReader(integration_token="...").load_data(
    page_ids=["page_id_1", "page_id_2"]
)
\`\`\`

#### 45.5.2 RAG 优化深度

LlamaIndex 对 RAG 各环节都有深度优化:

\`\`\`text
- 切分:多种 NodeParser,支持 sentence、semantic、hierarchical
- 检索:Vector、Sparse、Hybrid、Knowledge Graph、Tree
- 重排:集成多种 Reranker
- 响应合成:多种模式(compact、refine、tree_summarize)
- 高级:子问题拆分、查询转换、Streaming
\`\`\`

#### 45.5.3 索引类型丰富

LlamaIndex 不只支持向量索引,还有针对不同场景的索引:

\`\`\`text
- VectorStoreIndex: 通用向量索引(RAG 主力)
- SummaryIndex(原 ListIndex): 顺序遍历所有节点
- TreeIndex: 树状索引,适合长文档概要
- KeywordTableIndex: 关键词索引
- KnowledgeGraphIndex: 知识图谱索引
- DocumentSummaryIndex: 文档摘要索引
\`\`\`

每种索引对应不同问题类型,选对了能大幅提升效果。

### 45.6 适用场景

LlamaIndex 在这些场景表现尤其好:

| 场景 | LlamaIndex 适配度 | 原因 |
|------|------------------|------|
| 私有知识库问答 | ★★★★★ | 数据连接 + RAG 是它的核心 |
| 文档智能(合同/论文分析) | ★★★★★ | LlamaParse 等工具强 |
| 客服知识库 | ★★★★ | RAG 流程封装好 |
| 个人助理(基于个人数据) | ★★★★ | 能接邮件、日历、笔记 |
| 复杂 Agent 决策 | ★★ | 也有 Agent,但不如 LangChain |
| 实时工作流 | ★★ | 不是它的强项 |
| 简单 LLM 调用 | ★ | 杀鸡用牛刀 |

### 45.7 LlamaIndex 的版本演进

\`\`\`text
v0.9 之前: 大单体 llama-index 包
v0.10(2024 年初): 拆分,引入 llama-index-core + 各种插件包
v0.11+: 进一步优化,拥抱 LSP(LlamaIndex Server Protocol)

今天的结构(类似 LangChain):
- llama-index-core: 核心抽象
- llama-index-llms-openai: OpenAI LLM
- llama-index-embeddings-openai: OpenAI embedding
- llama-index-readers-xxx: 各种数据连接器
- llama-index-vector-stores-xxx: 各种向量库
\`\`\`

\`\`\`bash
# 安装核心 + OpenAI(最常用组合)
pip install llama-index llama-index-llms-openai llama-index-embeddings-openai
\`\`\`

### 45.8 简单示例:文档问答

下面是一个稍微完整的示例,展示 LlamaIndex 的标准用法:

\`\`\`python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# 1. 全局配置 LLM 和 embedding
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# 2. 加载文档(假设 ./data 目录下有几份 .md 文件)
documents = SimpleDirectoryReader("./data").load_data()
print(f"加载了 {len(documents)} 个文档")

# 3. 构建向量索引
index = VectorStoreIndex.from_documents(documents)
print("索引构建完成")

# 4. 创建查询引擎
# similarity_top_k: 检索 top-3 相关片段
query_engine = index.as_query_engine(similarity_top_k=3)

# 5. 提问
questions = [
    "这份文档的核心主题是什么?",
    "提到了哪些关键技术?",
    "适用于什么场景?",
]

for q in questions:
    response = query_engine.query(q)
    print(f"\\n问题: {q}")
    print(f"答案: {response}")
    # 引用来源
    for i, node in enumerate(response.source_nodes):
        print(f"  来源 [{i+1}] (相似度 {node.score:.3f}): {node.text[:80]}...")
\`\`\`

### 45.9 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 不配置 Settings.llm | 用默认 Llama2 模型,效果差 | 显式配置 OpenAI 等 |
| 装旧版 llama-index | API 不兼容 | 装 v0.10+ |
| 用 LlamaIndex 做 Agent | 不如 LangChain 顺手 | Agent 用 LangChain |
| 文档目录有非文本文件 | 加载报错 | 用 required_exts 限定 |
| 不持久化索引 | 每次重启都重建 | 用 StorageContext 持久化 |
| 直接 print(response) | 看不到引用来源 | 遍历 response.source_nodes |

> **小结**:LlamaIndex 是 RAG 项目的"专门武器"。如果你的应用核心是"让 LLM 基于私有数据回答问题",选 LlamaIndex;如果是 Agent 决策,选 LangChain。两者也可以混用,下几章深入 LlamaIndex 的具体能力。`,
  },

  // =============================================================
  // 第四十六章：文档索引与加载
  // =============================================================
  {
    id: 'llamaindex-index',
    group: 'LlamaIndex',
    icon: '📇',
    title: '文档索引与加载',
    content: `## 第四十六章　文档索引与加载

> 数据是 RAG 的源头。本章讲 LlamaIndex 怎么把各种数据接进来,以及怎么选择合适的索引类型。

### 46.1 数据连接器 SimpleDirectoryReader

最常用的数据接入方式:用 \`SimpleDirectoryReader\` 加载一个目录下的所有支持文件。

\`\`\`python
from llama_index.core import SimpleDirectoryReader

# 加载目录下所有支持的文件
reader = SimpleDirectoryReader(
    input_dir="./data",
    input_files=None,         # 不指定文件,加载目录全部
    required_exts=[".pdf", ".md", ".txt", ".docx"],  # 限定文件类型
    recursive=True,           # 递归子目录
    exclude=["*.tmp"],         # 排除某些文件
)

documents = reader.load_data()
print(f"加载了 {len(documents)} 个文档")
for doc in documents[:3]:
    print(f"- {doc.metadata.get('file_path')}: {doc.text[:80]}...")
\`\`\`

**支持的所有文件类型:**

\`\`\`text
PDF(.pdf)         - PDFReader
Word(.docx)       - DocxReader
Markdown(.md)     - MarkdownReader
文本(.txt)        - TextReader
HTML(.html)       - HTMLTagReader
CSV(.csv)         - CSVReader
PPT(.pptx)        - PptxReader
Excel(.xlsx)      - ExcelReader
JSON(.json)       - JSONReader
图片(.jpg/.png)   - ImageReader(需 OCR 或视觉模型)
音频(.mp3)        - AudioTranscriber
\`\`\`

### 46.2 处理复杂文档:LlamaParse

PDF、PPT 这类格式常含表格、图片、公式,普通 loader 提取效果差。LlamaIndex 的 \`LlamaParse\` 是商用服务,专门处理这类复杂文档:

\`\`\`python
from llama_parse import LlamaParse

# LlamaParse(需要 API Key,商用服务)
parser = LlamaParse(
    api_key="llx-...",  # 在 https://cloud.llamaindex.ai 注册获取
    result_type="markdown",  # 输出 markdown 格式
    num_workers=4,
)

# 解析复杂 PDF
documents = parser.load_data("./complex_report.pdf")
# LlamaParse 能正确提取:
# - 表格(转成 markdown 表格)
# - 图片(转成图片描述或保留)
# - 公式(转成 LaTeX)
# - 多栏排版(顺序正确)
\`\`\`

**对比效果:**
- 普通 PDFReader 提取表格:文字散乱、顺序混乱
- LlamaParse 提取表格:结构化 markdown 表格,顺序正确

### 46.3 节点 Node 和 NodeParser

Document 是整篇文档,Node 是切分后的小块。检索的最小单元是 Node。

\`\`\`python
from llama_index.core.node_parser import (
    SentenceSplitter,
    SemanticSplitterNodeParser,
    HierarchicalNodeParser,
)
from llama_index.core import Document

# 准备文档
documents = [Document(text="..." * 1000)]  # 一段长文本

# 方式 1: 句子切分(默认,类似 LangChain 的 RecursiveCharacterTextSplitter)
sentence_splitter = SentenceSplitter(
    chunk_size=500,
    chunk_overlap=50,
)
nodes = sentence_splitter.get_nodes_from_documents(documents)
print(f"切分出 {len(nodes)} 个节点")
# 每个节点是一个 TextNode 对象,有 text、metadata、id
\`\`\`

#### 46.3.1 语义切分器

\`\`\`python
from llama_index.embeddings.openai import OpenAIEmbedding

# 语义切分:基于相邻句子相似度
semantic_splitter = SemanticSplitterNodeParser(
    buffer_size=1,
    breakpoint_percentile_threshold=95,
    embed_model=OpenAIEmbedding(),
)
nodes = semantic_splitter.get_nodes_from_documents(documents)
\`\`\`

#### 46.3.2 层级切分器

\`\`\`python
# 层级切分:生成多层节点(大、中、小)
# 用于 AutoMergingRetriever,实现 Parent-Child 类似效果
hierarchical_parser = HierarchicalNodeParser.from_defaults(
    chunk_sizes=[2048, 512, 128]  # 三层:大块 2048、中块 512、小块 128
)
nodes = hierarchical_parser.get_nodes_from_documents(documents)
\`\`\`

### 46.4 索引类型详解

LlamaIndex 提供多种索引,各有适用场景。

#### 46.4.1 VectorStoreIndex(最常用)

通用向量索引,基于 embedding 检索相似 Node。

\`\`\`python
from llama_index.core import VectorStoreIndex

# 从文档构建
index = VectorStoreIndex.from_documents(documents)

# 从节点构建(更灵活)
index = VectorStoreIndex(nodes)

# 查询
query_engine = index.as_query_engine(similarity_top_k=3)
response = query_engine.query("问题")
\`\`\`

#### 46.4.2 SummaryIndex(原 ListIndex)

顺序遍历所有节点,适合"全文档摘要"类查询。

\`\`\`python
from llama_index.core import SummaryIndex

index = SummaryIndex.from_documents(documents)
query_engine = index.as_query_engine()
# 适合问"这份文档整体讲了什么?"
\`\`\`

#### 46.4.3 TreeIndex

树状索引,把节点组织成层次树,适合长文档的概要查询。

\`\`\`python
from llama_index.core import TreeIndex

index = TreeIndex.from_documents(documents)
# 适合"这本书的第三章讲了什么?"这种结构化查询
\`\`\`

#### 46.4.4 KnowledgeGraphIndex

把文档内容构建成知识图谱,适合实体关系查询。

\`\`\`python
from llama_index.core import KnowledgeGraphIndex

index = KnowledgeGraphIndex.from_documents(documents)
# 适合"张三是谁?他和李四什么关系?"这种实体查询
\`\`\`

#### 46.4.5 索引类型对比表

| 索引类型 | 适用场景 | 检索方式 | 性能 |
|---------|---------|---------|------|
| VectorStoreIndex | 通用 RAG | 向量相似度 | 快 |
| SummaryIndex | 全文摘要 | 顺序遍历 | 慢(节点多时) |
| TreeIndex | 长文档层级 | 树形遍历 | 中 |
| KnowledgeGraphIndex | 实体关系 | 图查询 | 中(构建慢) |
| DocumentSummaryIndex | 文档级检索 | 摘要+向量 | 中 |

### 46.5 索引构建和持久化

每次重建索引很慢(尤其文档多时),要持久化。

\`\`\`python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage

# === 第一次:构建并保存 ===
documents = SimpleDirectoryReader("./data").load_data()

# 持久化到 ./storage 目录
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = VectorStoreIndex.from_documents(
    documents,
    storage_context=storage_context,
)
# 保存
index.storage_context.persist(persist_dir="./storage")
print("索引已保存到 ./storage")

# === 之后:直接加载 ===
storage_context = StorageContext.from_defaults(persist_dir="./storage")
loaded_index = load_index_from_storage(storage_context)
# 等价于 VectorStoreIndex.from_documents(...) 的结果
print("索引加载完成")
\`\`\`

### 46.6 多文档索引

实际项目常有多个文档来源,要合并索引。

\`\`\`python
from llama_index.core import VectorStoreIndex, Document

# 多来源文档
docs1 = SimpleDirectoryReader("./pdfs").load_data()      # PDF
docs2 = SimpleDirectoryReader("./notes").load_data()      # Markdown 笔记
docs3 = SimpleDirectoryReader("./web").load_data()       # 网页缓存

# 给每个文档加 metadata 区分来源
for doc in docs1:
    doc.metadata["source_type"] = "pdf"
for doc in docs2:
    doc.metadata["source_type"] = "notes"
for doc in docs3:
    doc.metadata["source_type"] = "web"

# 合并构建统一索引
all_docs = docs1 + docs2 + docs3
index = VectorStoreIndex.from_documents(all_docs)
print(f"合并索引共 {len(all_docs)} 个文档")

# 查询时可以过滤来源
from llama_index.core.vector_stores import MetadataFilters, MetadataFilter

# 只在 PDF 中检索
filters = MetadataFilters(filters=[
    MetadataFilter(key="source_type", value="pdf")
])
query_engine = index.as_query_engine(filters=filters)
response = query_engine.query("...问题")
\`\`\`

### 46.7 实战:索引一份技术文档

下面是一个完整的实战示例,索引一份长技术文档,支持持久化和过滤查询:

\`\`\`python
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Settings,
    Document,
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
import os

# 1. 配置
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

class TechDocIndexer:
    """技术文档索引器"""
    
    def __init__(self, persist_dir="./tech_doc_index"):
        self.persist_dir = persist_dir
        self.index = None
    
    def build_index(self, doc_dir):
        """构建索引(首次)"""
        # 加载文档
        documents = SimpleDirectoryReader(doc_dir).load_data()
        
        # 给文档加来源标记
        for doc in documents:
            doc.metadata["source_dir"] = doc_dir
            # 提取文件名作为标题
            file_path = doc.metadata.get("file_name", "unknown")
            doc.metadata["title"] = os.path.splitext(file_path)[0]
        
        # 切分(自定义参数)
        splitter = SentenceSplitter(chunk_size=500, chunk_overlap=50)
        nodes = splitter.get_nodes_from_documents(documents)
        
        # 构建索引
        storage_context = StorageContext.from_defaults(persist_dir=self.persist_dir)
        self.index = VectorStoreIndex(
            nodes,
            storage_context=storage_context,
        )
        
        # 持久化
        self.index.storage_context.persist()
        print(f"索引构建完成: {len(documents)} 文档, {len(nodes)} 节点")
    
    def load_index(self):
        """加载已有索引"""
        storage_context = StorageContext.from_defaults(persist_dir=self.persist_dir)
        self.index = load_index_from_storage(storage_context)
        print("索引加载完成")
    
    def query(self, question, top_k=3):
        """查询"""
        if not self.index:
            self.load_index()
        
        query_engine = self.index.as_query_engine(similarity_top_k=top_k)
        response = query_engine.query(question)
        
        return {
            "answer": str(response),
            "sources": [
                {
                    "text": node.text[:200],
                    "score": node.score,
                    "metadata": node.metadata,
                }
                for node in response.source_nodes
            ],
        }


# 使用示例
if __name__ == "__main__":
    indexer = TechDocIndexer("./tech_doc_index")
    
    # 首次:构建索引
    # indexer.build_index("./docs")
    
    # 之后:加载索引
    indexer.load_index()
    
    # 查询
    result = indexer.query("RAG 的核心步骤是什么?")
    print("答案:", result["answer"])
    print("\\n引用:")
    for src in result["sources"]:
        print(f"- 来源: {src['metadata'].get('title')}")
        print(f"  相似度: {src['score']:.3f}")
        print(f"  内容: {src['text'][:80]}...")
\`\`\`

### 46.8 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 不持久化 | 每次重启重建索引 | 用 StorageContext.persist |
| 用错索引类型 | VectorStoreIndex 用于全文摘要 | 摘要用 SummaryIndex |
| 文档 metadata 丢失 | 查询无来源 | 切分后保留 metadata |
| chunk_size 过大 | 节点信息混杂 | 控制在 500-800 |
| 加载索引时 embedding 不一致 | 检索质量崩盘 | 用同一 embedding 模型 |
| 多文档没标来源 | 无法区分来源 | 加 metadata 区分 |
| LlamaParse 用错版本 | API 变化 | 看 v0.10+ 文档 |

> **小结**:索引是 LlamaIndex 的核心抽象。选对索引类型,做好切分和持久化,RAG 系统的地基就稳了。下一章讲怎么"用"这个索引——查询引擎和响应合成。`,
  },

  // =============================================================
  // 第四十七章：查询引擎与响应合成
  // =============================================================
  {
    id: 'llamaindex-query',
    group: 'LlamaIndex',
    icon: '🔍',
    title: '查询引擎与响应合成',
    content: `## 第四十七章　查询引擎与响应合成

> 上一章建好了索引,本章讲怎么"查"它。LlamaIndex 的查询引擎比 LangChain 的简单 \`retriever\` 强大很多,有大量优化空间。

### 47.1 QueryEngine 查询流程

QueryEngine 是 LlamaIndex 查询的入口,完整流程:

\`\`\`text
用户问题(query)
  ↓
Retriever 检索器: 从索引中检索 top-k 相关节点
  ↓
NodePostprocessor 后处理: 过滤、重排、修改节点
  ↓
ResponseSynthesizer 响应合成: 用 LLM 把节点合成最终答案
  ↓
Response(包含 answer + source_nodes)
\`\`\`

每一步都可定制,这是 LlamaIndex RAG 优化的关键。

### 47.2 Retriever 检索器

#### 47.2.1 向量检索 VectorIndexRetriever

最基础也最常用,基于 embedding 相似度检索:

\`\`\`python
from llama_index.core.retrievers import VectorIndexRetriever

retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=5,  # 检索 top-5
)

# 检索
nodes = retriever.retrieve("什么是 RAG?")
for i, node in enumerate(nodes):
    print(f"节点 {i+1} (相似度 {node.score:.3f}): {node.text[:100]}...")
\`\`\`

#### 47.2.2 关键词检索

基于 BM25 等关键词算法,擅长精确匹配:

\`\`\`python
from llama_index.core.retrievers import KeywordTableRetriever

# 需要构建 KeywordTableIndex
keyword_index = KeywordTableIndex.from_documents(documents)
keyword_retriever = KeywordTableRetriever(index=keyword_index, similarity_top_k=5)

nodes = keyword_retriever.retrieve("GPT-4 Turbo 价格")
\`\`\`

#### 47.2.3 混合检索

向量 + 关键词混合,效果通常比单一好:

\`\`\`python
from llama_index.core.retrievers import QueryFusionRetriever

# 把多个 retriever 融合
fusion_retriever = QueryFusionRetriever(
    retrievers=[vector_retriever, keyword_retriever],
    similarity_top_k=5,
    num_queries=1,  # 不做查询扩展
)

nodes = fusion_retriever.retrieve("...")
\`\`\`

### 47.3 NodePostprocessor 后处理

检索到的节点不一定都好用,可以后处理过滤、重排。

#### 47.3.1 相似度过滤

过滤掉相似度太低的节点:

\`\`\`python
from llama_index.core.postprocessor import SimilarityPostprocessor

# 只保留相似度 > 0.7 的节点
postprocessor = SimilarityPostprocessor(similarity_cutoff=0.7)

# 在 query_engine 中使用
query_engine = index.as_query_engine(
    similarity_top_k=10,  # 先检索 top-10
    node_postprocessors=[postprocessor],  # 再过滤
)
# 最终可能只有 3-5 个节点进入 LLM
\`\`\`

#### 47.3.2 Reranker 重排

用 cross-encoder 对检索结果重排,精度显著提升:

\`\`\`python
from llama_index.postprocessor.flag_embedding_reranker import FlagEmbeddingReranker

# 用 BAAI/bge-reranker 重排
reranker = FlagEmbeddingReranker(
    top_n=3,                          # 重排后取前 3 个
    model="BAAI/bge-reranker-base",   # 中文友好
)

query_engine = index.as_query_engine(
    similarity_top_k=10,  # 初步检索 top-10
    node_postprocessors=[reranker],  # 重排选 top-3
)
\`\`\`

#### 47.3.3 其他后处理器

\`\`\`python
from llama_index.core.postprocessor import (
    KeywordNodePostprocessor,    # 关键词过滤(必须包含某些词)
    PrevNextNodePostprocessor,  # 取相邻节点(扩大上下文)
    PIINodePostprocessor,        # 脱敏处理
)

# 必须包含关键词 "RAG" 的节点才保留
keyword_filter = KeywordNodePostprocessor(
    required_keywords=["RAG"],
)
\`\`\`

### 47.4 ResponseSynthesizer 响应合成

把检索到的节点用 LLM 合成最终答案。有多种模式可选。

\`\`\`python
from llama_index.core import get_response_synthesizer

# 创建响应合成器
synthesizer = get_response_synthesizer(
    response_mode="compact",  # 合成模式
)
\`\`\`

**主要 response_mode:**

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| refine | 逐个节点累加 refine 答案 | 节点多、需要细节 |
| compact(默认) | 把节点合并成大 chunk 再合成 | 通用,token 经济 |
| simple_summarize | 一次性合成,丢多余节点 | 节点少 |
| tree_summarize | 树形合并,适合多节点 | 多角度汇总 |
| no_text | 不调 LLM,直接返回节点 | 仅检索不需合成 |
| generation | 忽略 context,直接生成 | 测试用 |

\`\`\`python
# 不同模式对比
for mode in ["compact", "refine", "tree_summarize"]:
    qe = index.as_query_engine(response_mode=mode)
    response = qe.query("RAG 的核心步骤?")
    print(f"\\n=== {mode} ===")
    print(str(response)[:200])
\`\`\`

### 47.5 自定义 QueryEngine

把上面所有组件拼起来,定制一个生产级 QueryEngine:

\`\`\`python
from llama_index.core import (
    VectorStoreIndex,
    get_response_synthesizer,
)
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.postprocessor.flag_embedding_reranker import FlagEmbeddingReranker

# 1. 检索器:初步检索 top-10
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=10,
)

# 2. 后处理:相似度过滤 + reranker 重排
postprocessors = [
    SimilarityPostprocessor(similarity_cutoff=0.5),  # 过滤低分
    FlagEmbeddingReranker(top_n=3, model="BAAI/bge-reranker-base"),  # 重排 top-3
]

# 3. 响应合成器:compact 模式
response_synthesizer = get_response_synthesizer(
    response_mode="compact",
)

# 4. 组装 QueryEngine
custom_query_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=postprocessors,
    response_synthesizer=response_synthesizer,
)

# 查询
response = custom_query_engine.query("RAG 的核心步骤?")
print(response)
\`\`\`

### 47.6 子问题查询 SubQuestionQueryEngine

复杂问题往往包含多个子问题,SubQuestionQueryEngine 自动拆分并分别查询:

\`\`\`python
from llama_index.core.query_engine import SubQuestionQueryEngine

# 把多个 query_engine 组成子问题引擎
sub_question_engine = SubQuestionQueryEngine.from_defaults(
    query_engine_tools=[
        # 可以是不同的引擎(查不同索引)
        query_engine_1,
        query_engine_2,
    ],
)

# 复杂问题会被拆成子问题
response = sub_question_engine.query(
    "对比 GPT-4 和 Claude 3 在代码生成上的差异"
)
# 内部会拆成:
# - GPT-4 在代码生成上表现如何?
# - Claude 3 在代码生成上表现如何?
# 然后综合
\`\`\`

### 47.7 查询转换

用户原始问题不一定适合直接检索。LlamaIndex 支持多种查询转换。

#### 47.7.1 查询重写

\`\`\`python
from llama_index.core.query_engine import CustomQueryEngine
from llama_index.core import PromptTemplate

# 用 LLM 重写查询(类似 LangChain 章节讲的查询重写)
rewrite_prompt = PromptTemplate("""
把下面的问题重写成更适合向量检索的版本,保留原意。
原问题: {query}
重写:""")

# 实际使用要写一个 wrapper,简化版:
def rewrite_query(query, llm):
    rewritten = llm.complete(rewrite_prompt.format(query=query))
    return str(rewritten).strip()

# 在查询前重写
original = "那个怎么用"
rewritten = rewrite_query(original, llm)
response = query_engine.query(rewritten)
\`\`\`

#### 47.7.2 HyDE 假设性文档

\`\`\`python
from llama_index.core.indices.query.query_transform import HyDEQueryTransform
from llama_index.core.query_engine import TransformQueryEngine

# HyDE:先让 LLM 生成假设性答案,再用答案检索
hyde = HyDEQueryTransform(include_original=True)
hyde_query_engine = TransformQueryEngine(query_engine, hyde)

response = hyde_query_engine.query("RAG 怎么优化?")
# 内部会:
# 1. LLM 生成一个假设性答案(基于训练知识)
# 2. 用这个答案去检索(陈述句匹配文档)
# 3. 再用检索到的真实文档合成答案
\`\`\`

### 47.8 Streaming 流式响应

LlamaIndex 原生支持流式输出,体验更好:

\`\`\`python
# 同步流式
query_engine = index.as_query_engine(streaming=True)
response = query_engine.query("讲讲 RAG 的核心思想")
for chunk in response.response_gen:
    print(chunk, end="", flush=True)
# 逐字打印

# 异步流式
import asyncio
async def stream_query():
    response = await query_engine.aquery("...")
    async for chunk in response.async_response_gen():
        print(chunk, end="", flush=True)

asyncio.run(stream_query())
\`\`\`

### 47.9 实战:带引用来源的文档问答

下面是一个完整实战,综合用上面所有技术:

\`\`\`python
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Settings,
    get_response_synthesizer,
)
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.core.response_synthesizers import ResponseMode
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# 1. 配置
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# 2. 加载文档 + 构建索引
documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)

# 3. 构建定制 QueryEngine
class CitingQueryEngine:
    """带引用来源的查询引擎"""
    
    def __init__(self, index, top_k=10, final_k=3):
        # 检索器
        self.retriever = VectorIndexRetriever(
            index=index,
            similarity_top_k=top_k,
        )
        # 后处理:过滤低分
        self.postprocessors = [
            SimilarityPostprocessor(similarity_cutoff=0.5),
        ]
        # 响应合成器(自定义 prompt)
        self.response_synthesizer = get_response_synthesizer(
            response_mode=ResponseMode.COMPACT,
            text_qa_template=None,  # 用默认 prompt,实际可定制
        )
        # 组装 QueryEngine
        self.engine = RetrieverQueryEngine(
            retriever=self.retriever,
            node_postprocessors=self.postprocessors,
            response_synthesizer=self.response_synthesizer,
        )
        self.final_k = final_k
    
    def query(self, question):
        """查询并返回带引用的结果"""
        response = self.engine.query(question)
        
        # 整理引用来源
        citations = []
        for i, node in enumerate(response.source_nodes[:self.final_k]):
            citations.append({
                "id": i + 1,
                "score": node.score,
                "text": node.text,
                "metadata": node.metadata,
            })
        
        return {
            "question": question,
            "answer": str(response),
            "citations": citations,
        }


# 使用
if __name__ == "__main__":
    engine = CitingQueryEngine(index, top_k=10, final_k=3)
    
    questions = [
        "RAG 的核心步骤是什么?",
        "如何优化 RAG 的检索质量?",
    ]
    
    for q in questions:
        result = engine.query(q)
        print(f"\\n{'=' * 60}")
        print(f"问题: {result['question']}")
        print(f"答案: {result['answer']}")
        print(f"\\n引用来源:")
        for c in result["citations"]:
            print(f"  [{c['id']}] 相似度 {c['score']:.3f}")
            print(f"      来源: {c['metadata'].get('file_name', 'unknown')}")
            print(f"      内容: {c['text'][:100]}...")
\`\`\`

### 47.10 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| similarity_top_k 设过大 | context 太长,token 超限 | 5-10 起步,配合 reranker |
| 不用 reranker | 检索精度差 | 加 FlagEmbeddingReranker |
| response_mode 选错 | 节点多时丢信息或超 token | 用 compact,refine 备选 |
| SimilarityPostprocessor 阈值太高 | 过滤后没节点 | 0.5 起步,看分布调 |
| 子问题引擎没拆对 | 综合答案乱 | 检查 query_engine_tools 配置 |
| HyDE 用在简单问题上 | 假设答案引入噪音 | 仅在表述差异大时用 |
| 流式时直接 print(response) | 一次性返回不流式 | 用 response.response_gen 迭代 |
| 不看 source_nodes | 没引用来源 | 遍历 response.source_nodes 取 |

> **小结**:QueryEngine 是 LlamaIndex 的"查询大脑"。Retriever + Postprocessor + ResponseSynthesizer 三件套,可组合出从朴素到高级的各种 RAG 配置。会用这三件套,LlamaIndex 就学会了 80%。`,
  },

  // =============================================================
  // 第四十八章：框架对比与选型
  // =============================================================
  {
    id: 'framework-compare',
    group: 'LlamaIndex',
    icon: '⚖️',
    title: '框架对比与选型',
    content: `## 第四十八章　框架对比与选型

> "工具选不对,事倍功半。"本章把 LangChain、LlamaIndex 和其他主流框架做全面对比,帮你做出正确的选型决策。

### 48.1 LangChain vs LlamaIndex 全面对比

经过前面几章的学习,我们已经对两个框架有了深入理解。下表做一个全面对比:

| 维度 | LangChain | LlamaIndex |
|------|----------|------------|
| 定位 | 通用 LLM 应用框架 | 数据连接 + RAG 框架 |
| 核心抽象 | Runnable / LCEL | Index / QueryEngine |
| 强项 | Agent、Chain 编排 | 数据加载、RAG 检索 |
| 数据连接器 | 多(community 集成) | 更多(LlamaHub 100+) |
| RAG 优化 | 基础 | 深度优化,索引类型丰富 |
| Agent | 强项,功能完整 | 也有,但不是主打 |
| Memory | 多种策略 | 简单对话记忆 |
| 流式/异步 | LCEL 原生支持 | 原生支持 |
| 学习曲线 | 较陡(概念多) | 较平缓(开箱即用) |
| 文档质量 | 一般(API 变动多) | 较好(教程完整) |
| 社区活跃度 | 高(Star 100k+) | 高(Star 35k+) |
| 生态 | 庞大,集成多 | 聚焦 RAG,但精而专 |
| 适合规模 | 小到大 | 小到中 |
| 商业服务 | LangSmith(监控) | LlamaCloud(LlamaParse 等) |

### 48.2 选 LangChain 的场景

**这些场景 LangChain 更顺手:**

#### 48.2.1 Agent 决策应用

\`\`\`text
场景:
- 自动写代码、改代码的编程助手
- 自动调研、写报告的 Agent
- 多步骤决策的客服系统
- 工具调用密集的自动化任务

为什么选 LangChain:
- AgentExecutor 成熟,工具调用稳定
- 工具描述、解析错误处理完善
- LangGraph(下一章详讲)能做复杂状态机 Agent
\`\`\`

#### 48.2.2 复杂 Chain 编排

\`\`\`text
场景:
- 多步骤工作流(翻译 → 摘要 → 评分)
- 条件分支(根据输入走不同路径)
- 并行处理(同时做多个任务再合并)

为什么选 LangChain:
- LCEL 管道语法直观
- RunnableBranch / RunnableParallel 原生支持
- 组件高度可组合
\`\`\`

#### 48.2.3 生态丰富的项目

\`\`\`text
场景:
- 需要接很多第三方 API(Slack、Notion、GitHub)
- 需要大量现成工具(搜索、计算、邮件)
- 需要多种向量库切换

为什么选 LangChain:
- community 包集成 500+ 工具/loader
- 抽象层统一,切换无侵入
\`\`\`

### 48.3 选 LlamaIndex 的场景

**这些场景 LlamaIndex 更顺手:**

#### 48.3.1 RAG 文档问答为主

\`\`\`text
场景:
- 企业知识库问答
- 私有文档智能助手
- 论文/合同/技术文档分析
- 个人笔记问答

为什么选 LlamaIndex:
- 几行代码跑通完整 RAG
- 多种索引类型(Vector/Summary/Tree/KG)
- 查询引擎高度可定制
- LlamaParse 处理复杂 PDF 强
\`\`\`

#### 48.3.2 数据处理为主的任务

\`\`\`text
场景:
- 把多种数据源接入 LLM
- 文档结构化提取
- 多模态数据(图、文、表)

为什么选 LlamaIndex:
- LlamaHub 100+ 数据连接器
- NodeParser 切分策略丰富
- 多文档、多来源统一索引
\`\`\`

#### 48.3.3 简单、追求快速上线

\`\`\`text
场景:
- 内部工具,几天内上线
- MVP 原型,验证想法
- 小团队,不想学太多概念

为什么选 LlamaIndex:
- 学习曲线平缓
- 5 行代码跑通 RAG
- 默认配置就够用
\`\`\`

### 48.4 两个一起用

不是非此即彼,实际项目常常两个一起用——**LlamaIndex 做 RAG,LangChain 做 Agent**。

\`\`\`python
# LlamaIndex 提供 RAG 能力
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
llamaindex_query_engine = index.as_query_engine()


# 包装成 LangChain Tool,给 LangChain Agent 用
from langchain_core.tools import tool

@tool
def search_knowledge_base(query: str) -> str:
    """在企业知识库中搜索信息。
    
    Args:
        query: 搜索问题
    """
    response = llamaindex_query_engine.query(query)
    return str(response)


# LangChain Agent 调用这个 Tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [search_knowledge_base]

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是企业客服助手,可以查询知识库回答问题。"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 用户问题
result = agent_executor.invoke({"input": "我们的退款政策是什么?"})
# Agent 会决定:这是知识库问题 → 调 search_knowledge_base → 返回答案
\`\`\`

**优势:**
- LlamaIndex 专注做好 RAG 检索
- LangChain 专注做好 Agent 决策
- 各取所长,效果最好

### 48.5 其他主流框架简介

除了 LangChain 和 LlamaIndex,LLM 应用开发还有几个值得关注的框架。

#### 48.5.1 Haystack(deepset)

\`\`\`text
定位: 类似 LangChain,但更工业级、更稳定
特点:
- 由 deepset 公司维护,商用支持好
- API 设计更稳定,不像 LangChain 频繁变动
- RAG 是强项,做企业搜索有历史积累
适合: 追求稳定性的企业项目
\`\`\`

#### 48.5.2 DSPy

\`\`\`text
定位: "提示词编程"框架
特点:
- 把 prompt 当成可优化程序,自动调优
- 用示例驱动,而不是手写 prompt
- 学术界更流行,适合做实验
适合: 研究、prompt 优化、自动化 prompt 工程
\`\`\`

\`\`\`python
# DSPy 风格:不写 prompt,写程序
import dspy

class QAModule(dspy.Module):
    def __init__(self):
        self.cot = dspy.ChainOfThought("question -> answer")
    
    def forward(self, question):
        return self.cot(question=question)

# DSPy 自动优化 prompt,不必手写
\`\`\`

#### 48.5.3 AutoGen(Microsoft)

\`\`\`text
定位: 多 Agent 协作框架
特点:
- 微软出品,做多 Agent 对话协作强
- Agent 之间能"开会"讨论
- 适合复杂的多 Agent 任务
适合: 多 Agent 系统、需要 Agent 间协作
\`\`\`

#### 48.5.4 CrewAI

\`\`\`text
定位: 角色扮演式多 Agent 框架
特点:
- 把 Agent 当作"团队成员",有角色、目标、背景
- API 简洁,上手快
- 适合"分工合作"型任务
适合: 多 Agent 流程、团队模拟
\`\`\`

#### 48.5.5 LangGraph

\`\`\`text
定位: LangChain 的状态机 Agent 框架
特点:
- 把 Agent 流程建模成图(状态机)
- 支持循环、分支、并行
- 适合复杂 Agent 流程控制
适合: 复杂 Agent 工作流(后面章节详讲)
\`\`\`

### 48.6 框架对比表

| 框架 | 主要场景 | 学习曲线 | 生态 | 商业支持 |
|------|---------|---------|------|---------|
| LangChain | Agent、Chain | 陡 | 大 | LangSmith |
| LlamaIndex | RAG | 平缓 | 中 | LlamaCloud |
| Haystack | RAG、企业搜索 | 中 | 中 | deepset |
| DSPy | prompt 优化 | 陡 | 小 | 无 |
| AutoGen | 多 Agent | 中 | 中 | 微软 |
| CrewAI | 多 Agent | 平缓 | 小 | 无 |
| LangGraph | 复杂 Agent 流程 | 陡 | 中 | LangSmith |

### 48.7 选型决策表

**根据你的需求选框架:**

| 你的需求 | 推荐框架 | 备选 |
|---------|---------|------|
| 做一个文档问答系统 | LlamaIndex | LangChain |
| 做一个能调工具的 Agent | LangChain | LlamaIndex |
| 做一个企业知识库 + Agent | LlamaIndex(RAG) + LangChain(Agent) | LangChain 全栈 |
| 做一个客服系统(对话+查库) | LlamaIndex + LangChain Memory | LangChain 全栈 |
| 做多 Agent 协作 | AutoGen / CrewAI | LangGraph |
| 做复杂 Agent 流程(循环、分支) | LangGraph | AutoGen |
| 自动优化 prompt | DSPy | 无 |
| 做企业级搜索 | Haystack | LlamaIndex |
| 快速原型验证想法 | LlamaIndex | LangChain |
| 极致性能、低延迟 | 直接用厂商 SDK | LangChain core |

### 48.8 不要过度依赖框架

**核心忠告**:框架是工具,不是信仰。理解原理比会用框架更重要。

\`\`\`text
框架的好处:
- 节省时间,不用重造轮子
- 封装最佳实践
- 社区支持

框架的代价:
- 抽象层增加,性能损耗
- 学习成本(每个框架都要学一遍)
- 锁定风险(API 变动、版本兼容)
- 黑盒风险(出 bug 不会调)
\`\`\`

**建议的进阶路径:**

\`\`\`text
1. 先手写一遍 Agent、RAG(理解原理)
2. 再用 LangChain/LlamaIndex(快速实现)
3. 然后看框架源码(深度理解)
4. 最后能自己造轮子或定制框架

阶段不同,选框架策略不同:
- 学习阶段:多用手写,理解原理
- 原型阶段:用框架快速验证
- 生产阶段:用框架 + 定制 + 理解原理备调优
\`\`\`

### 48.9 框架选型案例

下面是几个常见项目的选型决策:

#### 案例 1:企业知识库问答

\`\`\`text
需求:员工通过对话查询公司文档、政策、流程
数据:多类型(PDF、Word、Confluence),量大
关键能力:RAG 检索质量、引用来源、多用户

选型:LlamaIndex
理由:
- 数据连接器丰富,能接 Confluence
- 查询引擎可定制,优化空间大
- 5 行代码跑通 MVP,迭代快

补充:
- 多用户管理用 LangChain Memory 或自建
- 引用来源用 LlamaIndex 原生 source_nodes
\`\`\`

#### 案例 2:智能编程助手

\`\`\`text
需求:用户描述需求,Agent 自动写代码、测试、改 bug
数据:GitHub 仓库、API 文档、用户需求
关键能力:Agent 决策、工具调用、循环控制

选型:LangChain + LangGraph
理由:
- LangChain Agent 工具调用成熟
- LangGraph 能做复杂状态机(写→测→改循环)
- 工具生态丰富(Shell、Git、文件操作)
\`\`\`

#### 案例 3:多 Agent 客服系统

\`\`\`text
需求:多个 Agent 协同处理客服工单(分流、查库、改单、退款)
关键能力:Agent 间协作、状态管理、流程控制

选型:LangGraph 或 AutoGen
理由:
- LangGraph 适合复杂流程控制(状态机)
- AutoGen 适合 Agent 间自由对话
- 看是否需要严格流程还是灵活对话
\`\`\`

#### 案例 4:个人笔记助手

\`\`\`text
需求:导入个人笔记(Notion/Obsidian),LLM 帮你查、总结、关联
关键能力:数据接入、RAG

选型:LlamaIndex
理由:
- Notion、Obsidian 都有现成 loader
- RAG 开箱即用
- 个人项目,简单优先
\`\`\`

### 48.10 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 跟着教程选框架 | 不适合自己的场景 | 先看需求,再看框架 |
| 一个框架走天下 | 强行用 LlamaIndex 做 Agent | 必要时混用 |
| 不学原理直接用框架 | 出 bug 不会调 | 至少手写一遍理解原理 |
| 框架版本不锁 | 升级后代码崩 | 锁版本号,定期评估升级 |
| 用废弃 API | 警告废弃 | 看 v0.2+ 文档,别看旧教程 |
| 过度抽象 | 简单需求堆复杂框架 | 简单需求用厂商 SDK 即可 |
| 不关注性能 | 框架开销让延迟翻倍 | 性能敏感场景评估裸 SDK |
| 盲目跟风新框架 | 新出的框架没经过验证 | 等社区验证再考虑 |

> **小结**:框架是工具,不是信仰。选型要基于需求,而不是热度。会一个框架不够,要会选框架——根据项目特点,在 LangChain、LlamaIndex、AutoGen、LangGraph 之间做明智选择。最重要的永远是理解原理,框架只是工具。`,
  },
];
