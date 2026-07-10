// =============================================================
// AI Agent开发实战 - 第八批章节(RAG 基础,共 4 章)
// -------------------------------------------------------------
// 第29章:RAG 检索增强生成原理
// 第30章:Embedding 文本向量化
// 第31章:向量数据库 Chroma
// 第32章:FAISS 向量检索
// =============================================================

export const chapters = [
  // =============================================================
  // 第29章:RAG 检索增强生成原理
  // =============================================================
  {
    id: 'rag-intro',
    group: 'RAG 基础',
    icon: '📚',
    title: 'RAG 检索增强生成原理',
    content: `## 第29章　RAG 检索增强生成原理

到此为止,我们的 LLM 都在用"训练时学到的知识"回答问题。但现实里,用户会问"我们公司的退货政策是什么""这份合同第3条怎么说的"——这些**私有知识**,LLM 训练时根本没见过。**RAG(Retrieval Augmented Generation,检索增强生成)**就是解决这个问题的核心技术。本章讲清 RAG 的原理、价值,以及它和微调、长上下文的对比。

### 29.1 RAG 是什么

**RAG = 检索(Retrieval)+ 增强(Augmented)+ 生成(Generation)**

通俗讲:**先从你的知识库里"检索"出和问题相关的文档片段,把它们"拼"进 prompt 里,再让 LLM 基于这些片段"生成"回答。**

LLM 本身的知识有三大局限:
1. **有截止日期**:训练数据到某个时间点就停了,不知道"今天"的事
2. **不知道私有数据**:你公司的文档、产品手册、合同——它训练时没见过
3. **会幻觉**:不知道时它可能"一本正经地编",听起来像真的

RAG 的做法是:**既然 LLM 不知道,那我把答案"喂"给它,让它基于喂的内容回答。** 这样既利用了 LLM 的语言理解和总结能力,又保证了事实准确。

### 29.2 为什么需要 RAG

看几个典型痛点场景:

| 场景 | 纯 LLM 的问题 | RAG 怎么解决 |
|------|--------------|-------------|
| 问公司制度 | 不知道,或瞎编 | 检索制度文档,基于原文回答 |
| 问最新新闻 | 训练截止后的事不知道 | 检索实时新闻,基于新闻回答 |
| 问产品手册 | 不知道细节 | 检索手册,精确引用 |
| 法律咨询 | 可能编造法条 | 检索法条原文,基于真实法条回答 |
| 代码库问答 | 不了解你的代码 | 检索代码片段,针对性回答 |

### 29.3 RAG 工作原理(五步流程)

完整的 RAG 流程分两个阶段:

**离线阶段(建库)**:
1. **文档切分**:把长文档切成小片段(chunk),如每 500 字一段
2. **向量化**:用 embedding 模型把每个片段转成向量,存入向量数据库

**在线阶段(查询)**:
3. **查询向量化**:用户提问,把问题也转成向量
4. **检索**:在向量库里找最相似的 Top-K 个片段
5. **生成**:把检索到的片段拼进 prompt,让 LLM 基于片段回答

\`\`\`
【离线建库】
原始文档 → 切分chunk → embedding向量化 → 存入向量库

【在线查询】
用户提问 → embedding向量化 → 在向量库检索相似chunk → 拼进prompt → LLM生成回答
\`\`\`

用代码示意整体流程:

\`\`\`python
# RAG 流程伪代码(完整实现见后续章节)

# ===== 离线:建库 =====
documents = ["公司退货政策:7天无理由...", "保修条款:1年内免费..."]
chunks = split_into_chunks(documents)           # 切分
vectors = [embed(c) for c in chunks]            # 向量化
vector_db.insert(vectors, chunks)              # 存入向量库

# ===== 在线:查询 =====
question = "退货要几天内?"
q_vec = embed(question)                          # 问题向量化
results = vector_db.search(q_vec, top_k=3)       # 检索 Top3 片段

# 拼进 prompt
prompt = f"""基于以下文档回答问题,如文档未提及请说"我不知道"。

文档:
{results[0]}
{results[1]}
{results[2]}

问题:{question}
"""
answer = llm.generate(prompt)                    # LLM 生成
print(answer)
# "根据退货政策,7天内可无理由退货。"
\`\`\`

### 29.4 RAG vs 微调

让 LLM 学会私有知识,有两条路:RAG 和微调。对比:

| 维度 | RAG | 微调 |
|------|-----|------|
| 知识更新 | 极快(改文档即可) | 慢(需重训) |
| 成本 | 低(只存向量) | 高(需 GPU 训练) |
| 准确性 | 高(基于原文) | 中(可能记错) |
| 可解释性 | 强(能溯源到文档) | 弱(黑盒) |
| 适合内容 | 事实型知识 | 风格/能力/格式 |
| 幻觉控制 | 好(有原文兜底) | 一般 |

**结论**:**事实型知识优先 RAG,风格/能力提升用微调。** 二者可结合——先微调让模型懂领域术语,再 RAG 注入最新知识。

### 29.5 RAG vs 长上下文

有了 200K 长上下文(Claude),为什么还要 RAG?直接把所有文档塞进去不行吗?

| 维度 | RAG | 长上下文(全塞进去) |
|------|-----|-------------------|
| 成本 | 低(只检索几段) | 高(每次都传全部) |
| 精确度 | 高(聚焦相关片段) | 中(被噪音稀释) |
| 延迟 | 低(短 prompt) | 高(长 prompt 慢) |
| 知识量 | 无限(库可很大) | 受限于上下文窗口 |
| 实现复杂度 | 中(需建库) | 低(直接塞) |

**结论**:**小量文档直接塞长上下文最简单;大量文档必须 RAG。** 比如 100 篇文档,全塞进 200K 上下文既贵又可能超出窗口,RAG 只取相关的 3-5 篇,又快又准。

> 💡 **实战经验**:即便有长上下文,RAG 仍是主流——因为生产环境文档量通常远超上下文窗口,且 RAG 的"可溯源"特性对合规审计很重要(能说出"答案来自哪份文档第几段")。

### 29.6 RAG 改变了什么

RAG 把 LLM 从"知识容器"变成了"推理引擎":
- **以前**:把知识"烤"进模型参数,知识固化、更新难
- **RAG**:模型只负责推理,知识在外部数据库,随时更新

这带来几个范式转变:
1. **知识更新=更新文档库**,不用重训模型
2. **可溯源**:每个回答能追溯到原文档,适合合规
3. **权限控制**:不同用户检索不同知识库,实现"千人千面"
4. **成本可控**:只检索相关片段,prompt 短,省钱

### 29.7 完整流程图

\`\`\`
┌─────────────────────────────────────────────────┐
│                  离线阶段(一次性)                │
│  文档 → 切分 → embedding → 存入向量数据库         │
└─────────────────────────────────────────────────┘
                       │
┌─────────────────────────────────────────────────┐
│                  在线阶段(每次查询)              │
│  用户提问                                        │
│     ↓                                           │
│  问题 embedding                                 │
│     ↓                                           │
│  向量数据库检索 Top-K 相似片段                   │
│     ↓                                           │
│  拼接:[检索片段] + [问题] → prompt             │
│     ↓                                           │
│  LLM 生成回答(基于片段)                        │
│     ↓                                           │
│  返回用户(可附溯源)                            │
└─────────────────────────────────────────────────┘
\`\`\`

### 29.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 切分太粗 | 检索不精准 | chunk 大小适中(300-800字) |
| 切分太细 | 上下文断裂 | 适当重叠(overlap) |
| 检索质量差 | 答非所问 | 优化 embedding 模型 + 检索策略 |
| 不加"我不知道"兜底 | 仍会幻觉 | prompt 里强调"未提及就说不知道" |
| 全塞不检索 | 成本爆炸/超窗口 | 大量知识必须 RAG |
| 不做溯源 | 难以审计 | 记录检索来源,随答案返回 |

### 本章小结

本章讲清了 RAG 的本质:先检索相关文档片段,拼进 prompt,让 LLM 基于片段回答。它解决了 LLM 知识有截止日期、不知道私有数据、会幻觉三大痛点。相比微调,RAG 更适合事实型知识且更新快;相比长上下文,RAG 更省更精准且支持海量知识。**RAG 是当前 LLM 应用最主流的"知识注入"方案。** 接下来三章我们拆解 RAG 的核心技术:embedding(向量化)、向量数据库 Chroma、检索库 FAISS。`
  },

  // =============================================================
  // 第30章:Embedding 文本向量化
  // =============================================================
  {
    id: 'embedding',
    group: 'RAG 基础',
    icon: '🔢',
    title: 'Embedding 文本向量化',
    content: `## 第30章　Embedding 文本向量化

RAG 的第一步是把文本变成向量——这就是 **Embedding(嵌入)**。没有 embedding,计算机就无法衡量"两段文本语义有多相近",检索也就无从谈起。本章讲解 embedding 的概念、API 调用、开源方案、向量维度与相似度计算。

### 30.1 Embedding 是什么

**Embedding** 是把文本映射成一串数字(向量),使得**语义相近的文本,向量也相近**。

举例:
- "我喜欢猫" → [0.12, -0.34, 0.56, ...] (一串数)
- "我爱小猫咪" → [0.11, -0.32, 0.55, ...] (非常接近!)
- "今天股票跌了" → [-0.45, 0.67, -0.12, ...] (差很远)

这样,衡量两段文本"语义相似度"就变成了衡量两个向量的"距离/夹角"。计算机擅长算数字,于是"语义理解"问题被转化为"向量计算"问题。

> 💡 **直觉理解**:embedding 把文本投射到一个"语义空间",意思相近的文本在这个空间里位置也相近。就像把词语放进一张地图,"猫"和"狗"挨得近,"猫"和"股票"隔得远。

### 30.2 为什么需要 Embedding

传统文本检索靠**关键词匹配**(如 SQL 的 LIKE、Elasticsearch 的全文检索)。但它有局限:

| 问题 | 关键词匹配 | Embedding |
|------|----------|-----------|
| 同义词 | "手机"搜不到"移动电话" | 能匹配(语义近) |
| 表述差异 | "退货"搜不到"退款" | 能匹配 |
| 跨语言 | 中文搜不到英文 | 部分 embedding 支持跨语言 |
| 理解意图 | 只看字面 | 看语义 |

\`\`\`python
# 关键词匹配的痛点示例
docs = ["我们的退款政策是7天无理由", "退货流程请联系客服"]
# 用户问"怎么把钱退回来"
# 关键词匹配:搜"退钱" → 都搜不到(因为没有"退钱"这个词)
# Embedding:能匹配到"退款"和"退货"(语义相近)
\`\`\`

### 30.3 OpenAI Embedding API

OpenAI 提供 embedding 服务,调用方式和聊天 API 类似:

\`\`\`python
from openai import OpenAI

client = OpenAI()

# 调用 embedding 接口
response = client.embeddings.create(
    model="text-embedding-3-small",  # 小模型,便宜
    input="我喜欢猫",
)

vector = response.data[0].embedding
print(f"向量维度: {len(vector)}")  # 1536 维
print(f"前5维: {vector[:5]}")        # [0.012, -0.034, ...]
\`\`\`

OpenAI 的 embedding 模型对比:

| 模型 | 维度 | 价格(每百万token) | 适合 |
|------|------|------------------|------|
| text-embedding-3-small | 1536 | $0.02 | 通用,性价比高 |
| text-embedding-3-large | 3072 | $0.13 | 高精度 |
| text-embedding-ada-002 | 1536 | $0.10 | 旧版 |

> 💡 **批量调用**:embed 支持一次传多条文本,比循环调用省时省钱:

\`\`\`python
# 批量 embedding
texts = ["我喜欢猫", "我爱小猫咪", "今天股票跌了"]
resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
vectors = [d.embedding for d in resp.data]  # 3 个向量
\`\`\`

### 30.4 开源 Embedding 方案

不想花钱/想本地跑?开源 embedding 模型效果已接近 OpenAI:

| 模型 | 出品 | 中文能力 | 维度 |
|------|------|---------|------|
| BAAI/bge-m3 | 智源 | 优秀(中文SOTA) | 1024 |
| BAAI/bge-large-zh | 智源 | 优秀 | 1024 |
| BAAI/bge-small-zh | 智源 | 良好(轻量) | 512 |
| sentence-transformers/all-MiniLM | 社区 | 一般(英文优先) | 384 |
| text2vec-base-chinese | 社区 | 良好 | 768 |

用 sentence-transformers 调用(第26章已介绍):

\`\`\`python
from sentence_transformers import SentenceTransformer

# 加载中文 embedding 模型(首次会下载)
model = SentenceTransformer("BAAI/bge-small-zh-v1.5")

texts = ["我喜欢猫", "我爱小猫咪", "今天股票跌了"]
vectors = model.encode(texts)

print(f"向量维度: {vectors.shape}")  # (3, 512)
# 本地推理,免费,且数据不出本机
\`\`\`

> 💡 **选型建议**:中文场景首选 \`BAAI/bge-m3\`(效果接近 OpenAI 且免费)。英文场景 \`all-MiniLM\` 轻量够用。生产环境对质量要求高用 \`bge-large-zh\`。

### 30.5 向量维度

不同模型输出不同维度的向量:

| 维度 | 说明 |
|------|------|
| 384 | 轻量,速度快,质量一般 |
| 512 | 中等,平衡 |
| 768 | 标准(BERT 系列) |
| 1024 | 较高,bge 系列 |
| 1536 | OpenAI small |
| 3072 | OpenAI large,最高质量 |

**维度权衡**:
- 维度越高,表达能力越强,但存储/计算成本越大
- 实际应用中,512-1536 维是甜点区
- OpenAI 的 3-small 支持"降维"参数,可在调用时指定更短维度省空间

\`\`\`python
# OpenAI 支持降维(省存储)
resp = client.embeddings.create(
    model="text-embedding-3-small",
    input="测试",
    dimensions=256,  # 从 1536 降到 256(牺牲少量精度)
)
\`\`\`

### 30.6 相似度计算:余弦相似度

拿到两个向量后,怎么衡量"相似度"?最常用的是**余弦相似度(Cosine Similarity)**——衡量两个向量方向的夹角,不关心长度:

\`\`\`python
import numpy as np

def cosine_similarity(v1, v2):
    """计算余弦相似度,范围[-1, 1],越接近1越相似"""
    dot = np.dot(v1, v2)              # 点积
    norm = np.linalg.norm(v1) * np.linalg.norm(v2)  # 模长乘积
    return dot / norm

# 用 OpenAI embedding 测试
texts = ["我喜欢猫", "我爱小猫咪", "今天股票大跌"]
resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
vecs = [d.embedding for d in resp.data]

print(f"'我喜欢猫' vs '我爱小猫咪': {cosine_similarity(vecs[0], vecs[1]):.3f}")
# ~0.90(很相似)
print(f"'我喜欢猫' vs '今天股票大跌': {cosine_similarity(vecs[0], vecs[2]):.3f}")
# ~0.30(不相似)
\`\`\`

除了余弦相似度,还有欧氏距离(L2)和点积。但 embedding 检索最常用余弦。

### 30.7 实战:文本相似度计算

下面是一个完整的实战——做一个"语义搜索"小工具:

\`\`\`python
from sentence_transformers import SentenceTransformer
import numpy as np

class SemanticSearch:
    """语义搜索引擎(最小化 RAG 检索)"""
    def __init__(self, model_name="BAAI/bge-small-zh-v1.5"):
        self.model = SentenceTransformer(model_name)
        self.texts = []      # 原文
        self.vectors = []    # 向量

    def add(self, texts):
        """添加文档(向量化并存入)"""
        vecs = self.model.encode(texts)
        self.texts.extend(texts)
        if len(self.vectors) == 0:
            self.vectors = vecs
        else:
            self.vectors = np.vstack([self.vectors, vecs])

    def search(self, query, top_k=3):
        """检索最相似的 top_k 文档"""
        q_vec = self.model.encode([query])[0]
        # 计算查询与所有文档的余弦相似度
        sims = self.vectors @ q_vec / (
            np.linalg.norm(self.vectors, axis=1) * np.linalg.norm(q_vec)
        )
        # 取相似度最高的 top_k
        top_idx = np.argsort(sims)[::-1][:top_k]
        return [(self.texts[i], sims[i]) for i in top_idx]

# 使用
searcher = SemanticSearch()
searcher.add([
    "我们的退货政策是7天无理由退货。",
    "保修期内免费维修,联系客服。",
    "发票可在订单页申请开具。",
    "客服电话:400-123-4567。",
])

for text, score in searcher.search("怎么退款?"):
    print(f"[{score:.3f}] {text}")
# [0.78] 我们的退货政策是7天无理由退货。
# [0.52] 保修期内免费维修,联系客服。
# ...
\`\`\`

注意:即便用户问"退款"(文档里写的是"退货"),embedding 也能匹配上——这就是语义检索的力量!

### 30.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 中文用英文 embedding | 效果差 | 中文用 bge 系列 |
| 维度选太大 | 存储贵 | 512-1536 够用 |
| 用欧氏距离不归一化 | 结果偏差 | 用余弦相似度 |
| 每次查询重新 embed 文档 | 慢 | 文档向量预存,只 embed 查询 |
| 不批量 embedding | 慢且贵 | 用批量接口 |
| 忽略 token 上限 | 超长文本报错 | 长文本先切分再 embed |

### 本章小结

本章讲解了 RAG 的基石——Embedding:把文本转成向量,语义相近则向量相近,从而把"语义匹配"变成"向量计算"。OpenAI 的 text-embedding-3-small 性价比高,开源的 bge-m3 中文效果接近且免费。相似度用余弦相似度。掌握了 embedding,下一章我们把这些向量存进**向量数据库**,实现高效的相似度检索。`
  },

  // =============================================================
  // 第31章:向量数据库 Chroma
  // =============================================================
  {
    id: 'vector-db',
    group: 'RAG 基础',
    icon: '🗄️',
    title: '向量数据库 Chroma',
    content: `## 第31章　向量数据库 Chroma

第30章我们用 numpy 手写了相似度检索,但那是玩具——文档一多,逐个计算就慢了。生产环境需要一个**专门存向量、能高效检索**的数据库。本章讲解向量数据库的概念、主流选型,并实战 **Chroma**——RAG 入门最友好的向量库。

### 31.1 向量数据库是什么

**向量数据库**是专门存储向量数据,并提供**高效相似度检索**的数据库。它的核心能力:

1. **存向量**:存大量高维向量(几百到几千维)
2. **存元数据**:每个向量可附带文本、来源等元数据
3. **高效检索**:给一个查询向量,快速返回最相似的 Top-K
4. **过滤**:结合元数据过滤(如"只在 2024 年的文档里搜")

### 31.2 为什么不用普通数据库

普通数据库(MySQL/PostgreSQL)基于 B+ 树索引,擅长精确匹配和范围查询。但向量相似度检索是"找最接近的",传统索引无能为力:

\`\`\`python
# 传统 SQL:能做精确匹配,不能做相似度
SELECT * FROM docs WHERE content LIKE '%退货%';  # 关键词匹配
# 但"怎么退款"搜不到"退货政策"(语义检索做不到)

# 向量检索:找最相似的向量
SELECT * FROM docs ORDER BY cosine_sim(embedding, query_vec) DESC LIMIT 3;
# ↑ 传统数据库要遍历全表算相似度,O(n) 很慢!
\`\`\`

向量数据库用 **ANN(Approximate Nearest Neighbor,近似最近邻)索引**(如 HNSW、IVF),把检索复杂度从 O(n) 降到约 O(log n),百万级数据也能毫秒返回。

### 31.3 主流向量库对比

| 向量库 | 类型 | 特点 | 适合 |
|--------|------|------|------|
| **Chroma** | 嵌入式 | 极简,Python 友好,无需服务 | 原型/小项目/学习 |
| **FAISS** | 库 | Facebook 出品,极快,纯计算 | 高性能检索(无服务层) |
| **Pinecone** | 云服务 | 全托管,免运维 | 不想运维的生产 |
| **Weaviate** | 服务 | 功能全,支持混合检索 | 中大型项目 |
| **Qdrant** | 服务 | Rust 写,高性能 | 高性能生产 |
| **Milvus** | 服务 | 国产,支持超大规模 | 大规模生产 |

> 💡 **新手建议**:从 **Chroma** 起步——它纯 Python、嵌入式、几行代码就能用,且接口和 FAISS/Pinecone 类似,学会后迁移成本低。本章聚焦 Chroma。

### 31.4 Chroma 安装与基础使用

\`\`\`bash
pip install chromadb
\`\`\`

\`\`\`python
import chromadb

# 创建客户端(嵌入式,数据存本地)
client = chromadb.PersistentClient(path="./my_vectordb")  # 持久化到磁盘

# 创建一个集合(collection,类似数据库的表)
collection = client.create_collection(
    name="knowledge_base",
    metadata={"description": "我的知识库"}
)

# 插入文档(Chroma 会自动调用默认 embedding 模型向量化)
collection.add(
    documents=[
        "我们的退货政策是7天无理由退货。",
        "保修期内免费维修,联系客服。",
        "发票可在订单页申请开具。",
    ],
    metadatas=[
        {"source": "policy.md", "category": "退货"},
        {"source": "warranty.md", "category": "保修"},
        {"source": "invoice.md", "category": "发票"},
    ],
    ids=["doc1", "doc2", "doc3"]  # 唯一 ID
)
print(f"已存入 {collection.count()} 条文档")
\`\`\`

> ⚠️ Chroma 默认用一个内置 embedding 模型(首次会下载)。生产环境建议**自己指定 embedding 模型**(如下),保证一致性:

\`\`\`python
from chromadb.utils import embedding_functions

# 用 sentence-transformers 的模型
ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="BAAI/bge-small-zh-v1.5"
)
collection = client.create_collection(
    name="kb_bge",
    embedding_function=ef,  # 指定 embedding 函数
)
\`\`\`

### 31.5 检索查询

\`\`\`python
# 检索:Chroma 自动把查询向量化,再找最相似的
results = collection.query(
    query_texts=["怎么退款?"],
    n_results=2,  # 返回 Top2
)

print("检索结果:")
for i, (doc, meta, dist) in enumerate(zip(
    results["documents"][0],
    results["metadatas"][0],
    results["distances"][0]
)):
    print(f"{i+1}. [距离{dist:.3f}] {doc}")
    print(f"   来源: {meta['source']}")
# 1. [距离0.21] 我们的退货政策是7天无理由退货。
#    来源: policy.md
# 2. [距离0.45] 保修期内免费维修,联系客服。
#    来源: warranty.md
\`\`\`

### 31.6 元数据过滤

Chroma 支持按元数据过滤,实现"只在某类文档里检索":

\`\`\`python
# 只在"退货"类文档里搜
results = collection.query(
    query_texts=["退款流程"],
    n_results=3,
    where={"category": "退货"},  # 元数据过滤
)

# 复合过滤
results = collection.query(
    query_texts=["保修"],
    n_results=3,
    where={"$and": [
        {"category": "保修"},
        {"source": {"$contains": "warranty"}}
    ]}
)
\`\`\`

### 31.7 持久化与更新

\`\`\`python
# PersistentClient 已自动持久化到磁盘
# 下次启动直接加载,数据不丢
client = chromadb.PersistentClient(path="./my_vectordb")
collection = client.get_collection(name="knowledge_base")
print(f"已有 {collection.count()} 条")

# 更新文档
collection.update(
    ids=["doc1"],
    documents=["退货政策已更新:15天无理由退货。"],
    metadatas=[{"source": "policy_v2.md", "category": "退货"}],
)

# 删除文档
collection.delete(ids=["doc3"])
\`\`\`

### 31.8 实战:构建迷你知识库

把 embedding + Chroma 组合,做一个能问答的迷你知识库:

\`\`\`python
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI

# ===== 1. 建库 =====
client = chromadb.PersistentClient(path="./kb_demo")
ef = embedding_functions.SentenceTransformerEmbeddingFunction("BAAI/bge-small-zh-v1.5")
collection = client.get_or_create_collection("demo_kb", embedding_function=ef)

# 知识库内容
documents = [
    "公司成立于2015年,总部位于杭州。",
    "主营业务是企业级 AI 解决方案。",
    "员工超过500人,研发占比60%。",
    "客服电话:400-123-4567,工作日9-18点。",
    "退货政策:商品签收7天内可无理由退货。",
    "保修期:电子产品1年,非电子产品3个月。",
]
metadatas = [{"cat": "公司"}]*2 + [{"cat": "团队"}]*2 + [{"cat": "售后"}]*2

collection.add(documents=documents, metadatas=metadatas,
               ids=[f"d{i}" for i in range(len(documents))])

# ===== 2. RAG 问答 =====
llm = OpenAI()

def rag_qa(question):
    # 检索
    results = collection.query(query_texts=[question], n_results=3)
    context = "\\n".join(results["documents"][0])

    # 拼 prompt 让 LLM 回答
    prompt = f"""基于以下文档回答问题。如文档未提及,回答"我不知道"。

文档:
{context}

问题:{question}
"""
    resp = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    answer = resp.choices[0].message.content
    sources = [m["cat"] for m in results["metadatas"][0]]
    return answer, sources

# 测试
for q in ["公司什么时候成立的?", "怎么退货?", "客服几点下班?"]:
    ans, src = rag_qa(q)
    print(f"Q: {q}")
    print(f"A: {ans}  [来源类别: {src}]\\n")
\`\`\`

### 31.9 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 用默认 embedding 不一致 | 结果不稳定 | 显式指定 embedding 函数 |
| path 不固定 | 数据丢失 | 用固定路径持久化 |
| 插入重复 id | 报错或覆盖 | 用 upsert 或确保 id 唯一 |
| 不存原文只存向量 | 拿不到原文 | 同时存 documents |
| 检索不看距离 | 返回不相关 | 设距离阈值过滤 |
| 集合用错名字 | 查不到 | get 时名字要一致 |

### 本章小结

本章讲解了向量数据库:专门存向量并提供高效相似度检索,用 ANN 索引把复杂度从 O(n) 降到 O(log n)。Chroma 是入门首选——嵌入式、Python 友好、几行代码建库检索。掌握了"建库→插入→查询→元数据过滤",你就具备了 RAG 的检索能力。下一章我们看另一个检索利器 FAISS,对比它与 Chroma 的差异。`
  },

  // =============================================================
  // 第32章:FAISS 向量检索
  // =============================================================
  {
    id: 'faiss',
    group: 'RAG 基础',
    icon: '⚡',
    title: 'FAISS 向量检索',
    content: `## 第32章　FAISS 向量检索

Chroma 适合入门和中小项目,但当你需要**极致性能**或**完全控制检索过程**时,**FAISS** 是更好的选择。它是 Facebook 开源的向量检索库,以"极快"著称。本章讲解 FAISS 的安装、索引类型、使用方法,并与 Chroma 做对比。

### 32.1 FAISS 是什么

**FAISS(Facebook AI Similarity Search)** 是 Facebook(现 Meta)开源的向量相似度检索库。它的核心特点:

- **极快**:用 C++ 实现,Python 绑定,支持多线程和 GPU 加速
- **纯库**:不是数据库服务,只是一个计算库(类似 numpy)
- **灵活**:提供多种索引类型,可按需选择
- **海量**:能处理十亿级向量

### 32.2 FAISS 和向量数据库的区别

| 维度 | FAISS(库) | Chroma(向量数据库) |
|------|-----------|-------------------|
| 形态 | Python 库 | 嵌入式数据库 |
| 持久化 | 需自己存(文件) | 自动持久化 |
| 元数据 | 不支持(需自己管) | 内置支持 |
| 性能 | 极高(C++/GPU) | 中等 |
| 易用性 | 中(需懂索引类型) | 高(几行代码) |
| 适合 | 高性能检索 | 快速开发/带元数据 |

**一句话**:FAISS 是"检索引擎",Chroma 是"带管理的数据库"。需要极致性能用 FAISS,需要方便用 Chroma。

### 32.3 安装

\`\`\`bash
# CPU 版
pip install faiss-cpu

# GPU 版(需 CUDA 环境)
pip install faiss-gpu
\`\`\`

\`\`\`python
import faiss
import numpy as np

print(faiss.__version__)  # 验证安装
\`\`\`

### 32.4 索引类型

FAISS 的核心概念是 **Index(索引)**——决定如何存储和检索向量。不同 Index 适合不同场景:

| 索引类型 | 说明 | 精度 | 速度 | 适合 |
|---------|------|------|------|------|
| **IndexFlatL2** | 暴力遍历,欧氏距离 | 精确 | 慢 | 小数据/基准 |
| **IndexFlatIP** | 暴力遍历,内积(点积) | 精确 | 慢 | 归一化后=余弦 |
| **IndexIVFFlat** | 先聚类再搜 | 近似 | 快 | 中等数据 |
| **IndexIVFPQ** | 聚类+乘积量化压缩 | 近似 | 极快 | 大数据/省内存 |
| **IndexHNSW** | 图索引 | 近似 | 很快 | 通用高性能 |

> 💡 **新手起步**:从 **IndexFlatL2** 开始——它最简单(暴力但精确),适合几百到几千条数据。数据量大了再换 IVF 或 HNSW。

### 32.5 精确检索 vs 近似检索(ANN)

- **精确检索(Exact)**:遍历所有向量算距离,保证找到真正最近的。慢,适合小数据。
- **近似检索(ANN, Approximate Nearest Neighbor)**:用索引结构(聚类/图)快速定位"大概最近的",牺牲少量精度换巨大速度。适合大数据。

\`\`\`
数据量:  1K    10K    100K    1M     10M
精确检索: 1ms   10ms   100ms   1s     10s   ← 线性增长
ANN检索:  1ms   1ms    2ms     5ms    10ms  ← 近乎常数
\`\`\`

百万级数据必须用 ANN,否则慢到不可用。

### 32.6 实战:构建索引并检索

**步骤1:IndexFlatL2(精确,入门)**

\`\`\`python
import faiss
import numpy as np

# 模拟 1000 条 512 维向量(实际是 embedding 结果)
dimension = 512
np.random.seed(42)
vectors = np.random.random((1000, dimension)).astype('float32')

# 创建 L2 距离的 Flat 索引(精确)
index = faiss.IndexFlatL2(dimension)

# 添加向量
index.add(vectors)
print(f"已添加 {index.ntotal} 条向量")  # 1000

# 检索:找最相似的 Top5
query = np.random.random((1, dimension)).astype('float32')
distances, indices = index.search(query, 5)  # 返回距离和索引

print("Top5 索引:", indices[0])
print("Top5 距离:", distances[0])
\`\`\`

**步骤2:用余弦相似度(归一化 + IndexFlatIP)**

FAISS 没有直接的余弦相似度索引,但**向量归一化后,内积 = 余弦相似度**:

\`\`\`python
# 归一化向量(让模长=1)
faiss.normalize_L2(vectors)        # 原地归一化
faiss.normalize_L2(query)

# 用内积索引(归一化后等价于余弦)
index_ip = faiss.IndexFlatIP(dimension)
index_ip.add(vectors)

distances, indices = index_ip.search(query, 5)
# distances 现在是余弦相似度(越大越相似)
print("余弦相似度 Top5:", distances[0])
\`\`\`

**步骤3:IndexIVFFlat(近似,大数据)**

\`\`\`python
# IVF 索引:先聚类,查询时只搜最近的几个聚类
nlist = 100  # 聚类数(数据量/10 左右)
quantizer = faiss.IndexFlatL2(dimension)
index_ivf = faiss.IndexIVFFlat(quantizer, dimension, nlist)

# IVF 需要先训练(学习聚类中心)
index_ivf.train(vectors)  # 用数据训练
index_ivf.add(vectors)    # 再添加

# 检索时可设 nprobe(搜多少个聚类),越大越准越慢
index_ivf.nprobe = 10  # 默认1,设10提升精度
distances, indices = index_ivf.search(query, 5)
\`\`\`

### 32.7 持久化:保存与加载

FAISS 索引可存成文件:

\`\`\`python
# 保存
faiss.write_index(index, "my_index.faiss")

# 加载
index = faiss.read_index("my_index.faiss")

# 注意:FAISS 只存向量和索引结构
# 文本原文、元数据需你自己存(如用 JSON/SQLite 配合)
\`\`\`

### 32.8 配合元数据管理

FAISS 不存元数据,需自己管理。常见做法是"FAISS 存向量 + 外部存原文":

\`\`\`python
import json

# FAISS 存向量
index = faiss.IndexFlatIP(dimension)
index.add(vectors)

# 另存一份"索引→原文"映射
doc_store = {i: f"这是第{i}条文档内容" for i in range(1000)}
with open("doc_store.json", "w", encoding="utf-8") as f:
    json.dump(doc_store, f, ensure_ascii=False)

# 检索时:FAISS 给索引,再查 doc_store 拿原文
distances, indices = index.search(query, 5)
for idx, dist in zip(indices[0], distances[0]):
    print(f"[{dist:.3f}] {doc_store[idx]}")
\`\`\`

### 32.9 Chroma vs FAISS 对比

| 维度 | Chroma | FAISS |
|------|--------|-------|
| 易用性 | 高(自动 embedding+存元数据) | 中(需自己管) |
| 性能 | 中等 | 极高(C++/GPU) |
| 元数据 | 内置 | 需自己管 |
| 持久化 | 自动 | 手动 |
| embedding | 内置调用 | 需自己算 |
| 适合 | 快速开发/中小项目 | 高性能/大数据/深度定制 |
| 学习曲线 | 低 | 中 |

**选型建议**:
- **学习 RAG / 原型开发**:Chroma(几行代码搞定)
- **生产 + 百万级数据**:FAISS(性能)或 Qdrant/Milvus(带服务)
- **需要元数据过滤 + 性能**:Qdrant/Weaviate(两者兼得)

### 32.10 适用场景

- **用 FAISS**:海量向量(百万+),追求极致延迟,愿意自己管元数据,有 GPU
- **用 Chroma**:中小数据(几千到几十万),要快速开发,要元数据过滤
- **用 Pinecone/Milvus**:不想运维但要生产级,数据量超大

### 32.11 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 向量类型不是 float32 | 报错 | 必须 .astype('float32') |
| 维度对不上 | 报错 | 创建索引时维度要和向量一致 |
| 用 L2 但想要余弦 | 结果反 | 归一化 + IndexFlatIP |
| IVF 不训练就 add | 报错 | 先 train 再 add |
| nprobe 太小 | 漏检 | 调大 nprobe(精度↑速度↓) |
| 只存向量不存原文 | 拿不到文本 | 配合外部 doc_store |
| GPU/CPU 版混装 | 冲突 | 只装一个 |

### 本章小结

本章讲解了高性能向量检索库 FAISS:它是纯计算库,用 C++ 实现极快,支持 GPU。核心是选择索引类型——小数据用 IndexFlatL2(精确),大数据用 IndexIVFFlat/HNSW(近似 ANN)。FAISS 不存元数据,需自己管理。与 Chroma 对比:FAISS 胜在性能,Chroma 胜在易用。**新手先 Chroma,要性能再 FAISS。** 至此 RAG 基础四章完结——你已掌握 RAG 全流程:原理、embedding 向量化、Chroma/FAISS 检索。下一部分我们将进入 RAG 实战,解决文档切分、混合检索、重排序等进阶问题。`
  }
];
