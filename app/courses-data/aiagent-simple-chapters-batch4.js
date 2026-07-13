// =============================================================
// AI 智能体开发入门教程 —— 第 4 批（RAG 检索增强 3 章）
// -------------------------------------------------------------
// 讲解 RAG（检索增强生成）的核心原理与简单实现。
// ID 前缀：as-（aiagent-simple）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 13 章：RAG 原理：给 Agent 知识
  // ============================================================
  {
    id: "as-rag",
    group: "RAG 检索增强",
    icon: "📚",
    title: "RAG 原理：给 Agent 知识",
    content: `# RAG 原理：给 Agent 知识

## 一、什么是 RAG

**RAG = Retrieval-Augmented Generation（检索增强生成）**

简单说：让 LLM 在回答问题前，先去知识库里"查资料"，再根据查到的内容生成答案。

## 二、为什么需要 RAG

LLM 虽然强大，但有三个硬伤：

1. **知识截止日期**：训练完就"定格"了，不知道之后发生的事
2. **不知道私有数据**：你的公司文档、个人笔记，LLM 一无所知
3. **会幻觉**：不知道的事也"一本正经地胡说"

RAG 通过"先检索、再生成"解决这些问题。

## 三、RAG 三步走

\`\`\`
1. 检索 Retrieve：从知识库找相关文档
2. 增强 Augment：把文档拼进 prompt
3. 生成 Generate：让 LLM 基于文档回答
\`\`\`

## 四、开卷考试 vs 闭卷考试

> **类比**：闭卷考试 = 纯 LLM（凭记忆答题）；开卷考试 = RAG（带参考书答题）

- 闭卷：可能记错、记漏，但答得快
- 开卷：答案有依据，但需要先翻书

LLM 自己就是"闭卷"，RAG 让它变"开卷"。

## 五、RAG vs Fine-tuning

| 维度 | RAG | Fine-tuning |
|---|---|---|
| 适合场景 | 知识更新频繁、私有数据 | 风格/格式调整、领域适配 |
| 成本 | 低（无需重训） | 高（要训练） |
| 时效性 | 好（改库即可） | 差（要重训） |
| 可解释性 | 好（可看到引用文档） | 差（黑盒） |
| 幻觉控制 | 好（有依据） | 一般 |

## 六、RAG 流程图

\`\`\`
用户提问
   │
   ▼
[检索 Retrieve] ──→ 知识库（文档/向量存储）
   │                  ↓ 返回 top-k 文档
   ▼
[增强 Augment] ──→ 拼成 prompt = 知识 + 问题
   │
   ▼
[生成 Generate] ──→ LLM
   │
   ▼
最终答案（带依据）
\`\`\`

> 下一章我们会用纯 Python 实现一个最简 RAG 系统。`,
    code: `# RAG 原理演示 —— 简单实现检索增强生成
# RAG = Retrieval-Augmented Generation
# 三步走：检索(Retrieve) → 增强(Augment) → 生成(Generate)
# 这个 demo 用关键词匹配实现一个最小可用的 RAG 系统

# ===== 模拟知识库 =====
# 实际项目中知识库从数据库或向量存储读取
# 这里用字典模拟：key 是文档 ID，value 是文档内容
documents = {
    "doc1": "Python 是一种高级编程语言，由 Guido van Rossum 于 1991 年发布。",
    "doc2": "Python 支持多种编程范式，包括面向对象、函数式和过程式编程。",
    "doc3": "FastAPI 是一个现代的 Python Web 框架，用于构建 API。",
    "doc4": "JavaScript 是一种用于网页交互的脚本语言。",
}


# ===== SimpleRAG 类：RAG 的核心实现 =====
class SimpleRAG:
    """简单的 RAG 系统：检索 → 增强 → 生成"""

    def __init__(self, knowledge_base: dict):
        """初始化：传入知识库"""
        # 把知识库存为实例属性，供后续方法使用
        self.docs = knowledge_base

    def retrieve(self, query: str) -> list:
        """第一步：检索——根据查询找到相关文档"""
        # 这里用最简单的关键词匹配：检查查询词是否出现在文档中
        # 实际项目会用向量检索，按语义相似度找文档
        results = []
        # 把查询小写化，便于做大小写不敏感的匹配
        query_lower = query.lower()
        for doc_id, content in self.docs.items():
            # 把查询拆成关键词，逐个检查是否出现在文档里
            # any() 只要有一个词命中就算相关
            if any(word in content.lower() for word in query_lower.split()):
                results.append({"id": doc_id, "content": content})
        print(f"[1. 检索] 查询: '{query}'")
        print(f"[1. 检索] 命中 {len(results)} 个文档:")
        for r in results:
            print(f"   - {r['id']}: {r['content']}")
        return results

    def augment(self, query: str, docs: list) -> str:
        """第二步：增强——把查询和检索结果拼成 prompt"""
        # RAG 的核心：把外部知识"喂"给 LLM
        # prompt 模板包含：任务说明 + 检索到的知识 + 用户问题
        context = "\\n".join([f"- {d['content']}" for d in docs])
        prompt = f"请根据以下知识回答问题。\\n知识:\\n{context}\\n\\n问题: {query}"
        print(f"[2. 增强] 拼接 prompt（{len(prompt)} 字符）")
        return prompt

    def generate(self, prompt: str) -> str:
        """第三步：生成——调用 LLM 生成答案"""
        # 这里用模板模拟 LLM 的回答
        # 实际项目会调用 OpenAI、通义千问等 API
        answer = "（模拟 LLM 回答）根据检索到的知识，"
        # 简单根据 prompt 内容生成回答
        if "Python" in prompt:
            answer += "Python 是一种高级编程语言。"
        else:
            answer += "暂无相关信息。"
        print(f"[3. 生成] 答案: {answer}")
        return answer

    def ask(self, query: str) -> str:
        """完整 RAG 流程：检索 → 增强 → 生成"""
        # 把三步串起来：这就是 RAG 的完整流程
        docs = self.retrieve(query)         # 1. 检索
        prompt = self.augment(query, docs)  # 2. 增强
        answer = self.generate(prompt)      # 3. 生成
        return answer


# ===== 测试完整流程 =====
print("=== 测试 RAG 完整流程 ===")
# 创建 RAG 实例，传入知识库
rag = SimpleRAG(documents)
# 准备一个问题
question = "Python 是什么"
print(f"\\n问题: {question}\\n")
# 调用 ask，内部自动完成检索→增强→生成三步
final_answer = rag.ask(question)
print(f"\\n最终答案: {final_answer}")

print()
print("=== 对比：问一个知识库里没有的 ===")
# 测试一个知识库里没有的问题，看检索是否返回空
rag.ask("Java 是什么")`,
  },

  // ============================================================
  // 第 14 章：向量检索入门
  // ============================================================
  {
    id: "as-vector",
    group: "RAG 检索增强",
    icon: "🧮",
    title: "向量检索入门",
    content: `# 向量检索入门

## 一、关键词匹配的局限

上一章用关键词匹配做检索，但它有明显的短板：

1. **同义词问题**：查"机器学习"，文档里写的是"ML"，匹配不上
2. **语义理解**：查"怎么学 Python"，文档里是"Python 入门教程"，字面不重叠
3. **字面陷阱**：查"苹果"，分不清是水果还是公司

关键词匹配只看"字面"，看不懂"意思"。

## 二、向量（Embedding）

把文本变成一串数字（向量），让计算机能"算"出语义距离。

\`\`\`
"机器学习"  →  [0.12, 0.85, 0.33, ...]
"ML"       →  [0.11, 0.83, 0.35, ...]  ← 接近
"JavaScript" → [0.78, 0.10, 0.55, ...]  ← 差很远
\`\`\`

意义相近的文本，向量也相近。

## 三、相似度计算

| 方法 | 说明 |
|---|---|
| 余弦相似度 | 看向量夹角，最常用 |
| 点积 | 简单，没归一化时受向量长度影响 |
| 欧氏距离 | 看空间距离，越小越相似 |

> 实际项目最常用**余弦相似度**，因为它对文本长度不敏感。

## 四、向量检索流程

\`\`\`
1. 文档 → 向量化（Embedding）
2. 存入向量索引
3. 查询 → 同样向量化
4. 在索引中找最相似的 top-k
\`\`\`

## 五、用"含义"找文档

> 类比：图书馆查书。关键词匹配 = 按书名查；向量检索 = 按"内容像不像"查。

向量检索能跨过字面差异，找到"说的是一回事"的文档。

## 六、本节实现

不依赖 numpy，用纯 Python 实现一个最简单的向量检索：

- 用**词袋模型**把文本转向量（统计词频）
- 用**余弦相似度**算两个向量的接近程度
- 实现 \`VectorStore\` 类支持 \`add\` 和 \`search\`

> 真实项目会用预训练的 Embedding 模型（如 OpenAI、BGE），效果远好于词袋。这里只是讲原理。`,
    code: `# 向量检索入门 —— 用纯 Python 实现简单向量检索
# 不依赖 numpy，只用标准库 math
# 演示：文本 → 词袋向量 → 余弦相似度 → 检索

import math  # math 提供 sqrt 等数学函数


# ===== 1. 文本转向量（词袋模型）=====
# 词袋模型：把文本拆成单词，统计每个单词出现次数
# 得到一个 {word: count} 字典，这就是文本的向量表示
def text_to_vector(text: str) -> dict:
    """把文本转成词频向量"""
    # 简单清理：转小写 + 去标点
    # 实际项目会用 jieba 等分词工具
    text = text.lower()
    for ch in "，。、；：！？,.!?;:":
        text = text.replace(ch, " ")
    # 分词：按空格切分
    words = text.split()
    # 统计词频：用字典记录每个词出现次数
    vector = {}
    for word in words:
        # get(word, 0) 取不到时返回 0，再加 1
        vector[word] = vector.get(word, 0) + 1
    return vector


# ===== 2. 余弦相似度 =====
# 余弦相似度：衡量两个向量的"方向"差异
# 值域 [-1, 1]，越接近 1 表示越相似
# 公式：cos(θ) = (A·B) / (|A| × |B|)
def cosine_similarity(v1: dict, v2: dict) -> float:
    """计算两个词频向量的余弦相似度"""
    # 找出两个向量共有的词（交集）
    common_words = set(v1.keys()) & set(v2.keys())
    # 点积：共有词的词频乘积之和
    dot_product = sum(v1[w] * v2[w] for w in common_words)
    # 向量长度：sqrt(各分量平方和)
    norm1 = math.sqrt(sum(v ** 2 for v in v1.values()))
    norm2 = math.sqrt(sum(v ** 2 for v in v2.values()))
    # 避免除零：任一向量为零时返回 0
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)


# ===== 3. 向量存储 =====
# VectorStore 负责管理文档：添加和检索
class VectorStore:
    """简单的向量存储：用余弦相似度检索"""

    def __init__(self):
        """初始化空的文档存储"""
        # vectors: key 是 doc_id，value 是文档向量
        self.vectors = {}
        # texts: 同时保留原文，方便展示结果
        self.texts = {}

    def add(self, doc_id: str, text: str):
        """添加文档：把文本转成向量后存储"""
        self.vectors[doc_id] = text_to_vector(text)
        self.texts[doc_id] = text
        print(f"[添加] {doc_id}: {text[:30]}...")

    def search(self, query: str, top_k: int = 2) -> list:
        """检索：返回与 query 最相似的 top_k 个文档"""
        # 把查询也转向量
        query_vec = text_to_vector(query)
        # 计算查询与每个文档的相似度
        scores = []
        for doc_id, vec in self.vectors.items():
            sim = cosine_similarity(query_vec, vec)
            scores.append((doc_id, sim, self.texts[doc_id]))
        # 按相似度降序排序（最相似在前）
        scores.sort(key=lambda x: x[1], reverse=True)
        # 取前 top_k 个
        return scores[:top_k]


# ===== 测试 =====
print("=== 1. 添加文档 ===")
store = VectorStore()
# 添加 4 个文档到向量库
store.add("d1", "Python 是一种流行的高级编程语言")
store.add("d2", "机器学习是人工智能的一个分支")
store.add("d3", "深度学习是机器学习的一种方法")
store.add("d4", "JavaScript 用于网页前端开发")

print()
print("=== 2. 检索：'机器学习' ===")
# 查询"机器学习"，返回最相似的 2 个文档
query = "机器学习"
results = store.search(query, top_k=2)
print(f"查询: '{query}'")
print("检索结果:")
# 遍历结果，展示文档 ID、相似度分数、原文
for doc_id, score, text in results:
    print(f"  - [{doc_id}] 相似度={score:.3f}: {text}")

print()
print("=== 3. 检索：'编程语言' ===")
# 再测一个查询，验证语义匹配能力
results2 = store.search("编程语言", top_k=2)
print("检索结果:")
for doc_id, score, text in results2:
    print(f"  - [{doc_id}] 相似度={score:.3f}: {text}")`,
  },

  // ============================================================
  // 第 15 章：简单 RAG Agent：问答系统
  // ============================================================
  {
    id: "as-rag-agent",
    group: "RAG 检索增强",
    icon: "❓",
    title: "简单 RAG Agent：问答系统",
    content: `# 简单 RAG Agent：问答系统

## 一、把 RAG 和 Agent 结合

之前的 RAG 是固定流程：**每次都检索**。

真正的 Agent 应该有"判断力"：

- 简单问题（"你好"）→ 直接回答，不用检索
- 知识性问题（"Python 怎么用"）→ 触发检索
- 不确定时 → 检索验证

> Agent = 决策者 + 工具使用者。检索就是它的"工具"之一。

## 二、完整问答 Agent 架构

\`\`\`
用户问题
   │
   ▼
[理解问题] ─→ 需要检索吗？
   │
   ├─ 不需要 → 直接回答
   │
   ▼ 需要
[检索知识] ─→ 向量库返回 top-k 文档
   │
   ▼
[生成答案] ─→ LLM 基于文档回答
   │
   ▼
[验证答案] ─→ 答案是否有依据？
   │
   ▼
返回答案
\`\`\`

## 三、处理流程

1. **理解问题**：判断问题类型，决定是否检索
2. **检索**：从知识库找相关文档
3. **生成答案**：LLM 基于文档回答
4. **验证**：检查答案是否引用了检索内容

## 四、多轮问答

多轮问答需要维护**对话上下文**：

- 第 1 轮："Python 的列表是什么" → 检索 + 回答
- 第 2 轮："它和元组有什么区别" → "它"指代列表，结合上下文检索

实际项目通常把"最近几轮对话 + 新问题"一起做检索，保证上下文连贯。

## 五、实际应用

| 场景 | 说明 |
|---|---|
| 企业知识库 | 员工问"报销流程是什么" → 检索公司制度 |
| 客服系统 | 用户问"怎么退款" → 检索帮助文档 |
| 文档助手 | 开发者问"这个 API 怎么用" → 检索 API 文档 |
| 学习辅导 | 学生问"什么是递归" → 检索教材内容 |

## 六、本节实现

集成第 14 章的 \`VectorStore\`，实现 \`RAGAgent\` 类：

- 知识库：5 个关于 Python 的小文档
- \`ask(question)\` 方法：检索 + 生成
- \`mock_llm(prompt)\` 模拟 LLM 生成答案

测试 3 个典型问题，看检索结果和最终答案。`,
    code: `# 简单 RAG Agent —— 完整的问答系统
# 把向量检索和 Agent 思路结合
# Agent 决策：是否需要检索 → 检索 → 生成答案

import math  # math 用于余弦相似度计算


# ===== 复用第 14 章的向量检索能力 =====
def text_to_vector(text: str) -> dict:
    """文本转向量（词袋模型）"""
    # 简单分词：转小写、去标点、按空格切分
    text = text.lower()
    for ch in "，。、；：！？,.!?;:":
        text = text.replace(ch, " ")
    words = text.split()
    # 统计词频
    vector = {}
    for word in words:
        vector[word] = vector.get(word, 0) + 1
    return vector


def cosine_similarity(v1: dict, v2: dict) -> float:
    """计算两个词频向量的余弦相似度"""
    # 共有词的交集
    common_words = set(v1.keys()) & set(v2.keys())
    # 点积
    dot_product = sum(v1[w] * v2[w] for w in common_words)
    # 向量长度
    norm1 = math.sqrt(sum(v ** 2 for v in v1.values()))
    norm2 = math.sqrt(sum(v ** 2 for v in v2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)


# ===== 模拟 LLM =====
# 用模板模拟 LLM 生成答案
# 实际项目应调用真实 LLM API（如 OpenAI、通义千问）
def mock_llm(prompt: str) -> str:
    """模拟 LLM：根据 prompt 生成答案"""
    # 从 prompt 关键词判断问题类型，返回对应模板答案
    if "数据类型" in prompt:
        return "Python 支持多种数据类型，包括整数(int)、浮点数(float)、字符串(str)、列表(list)、元组(tuple)、字典(dict)等。"
    elif "异常" in prompt:
        return "Python 用 try/except 语句处理异常，把可能出错的代码放在 try 块，异常处理逻辑放在 except 块。"
    elif "列表" in prompt and "元组" in prompt:
        return "列表(list)是可变的，可以增删改；元组(tuple)是不可变的，创建后不能修改。列表用 []，元组用 ()。"
    return "根据知识库内容回答该问题。"


# ===== RAG Agent =====
class RAGAgent:
    """RAG 问答 Agent：检索 + 生成"""

    def __init__(self, knowledge_base: dict):
        """初始化：构建向量存储"""
        # 保留原文，方便展示
        self.texts = knowledge_base
        # 预计算所有文档的向量，加速检索
        self.vectors = {}
        for doc_id, text in knowledge_base.items():
            self.vectors[doc_id] = text_to_vector(text)

    def retrieve(self, query: str, top_k: int = 2) -> list:
        """检索与 query 最相关的 top_k 个文档"""
        query_vec = text_to_vector(query)
        scores = []
        for doc_id, vec in self.vectors.items():
            sim = cosine_similarity(query_vec, vec)
            scores.append((doc_id, sim, self.texts[doc_id]))
        # 按相似度降序排序
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def ask(self, question: str) -> str:
        """回答用户问题：检索 + 生成"""
        print(f"问题: {question}")
        # 第 1 步：检索相关文档
        docs = self.retrieve(question)
        print("[检索结果]:")
        for doc_id, sim, text in docs:
            print(f"  - [{doc_id}] sim={sim:.3f}: {text}")
        # 第 2 步：拼接 prompt（知识 + 问题）
        context = "\\n".join([f"- {d[2]}" for d in docs])
        prompt = f"知识:\\n{context}\\n\\n问题: {question}"
        # 第 3 步：调用 LLM 生成答案
        answer = mock_llm(prompt)
        print(f"[答案]: {answer}")
        return answer


# ===== 知识库：5 个关于 Python 的小文档 =====
knowledge = {
    "d1": "Python 是一种高级编程语言",
    "d2": "Python 的数据类型包括整数 浮点数 字符串 列表 元组 字典",
    "d3": "Python 用 try except 语句处理异常",
    "d4": "Python 的列表是可变的 元组是不可变的",
    "d5": "Python 函数用 def 关键字定义",
}

# ===== 测试 3 个问题 =====
print("=== 创建 RAG Agent ===")
agent = RAGAgent(knowledge)
print()

# 问题 1：数据类型
print("--- 问题 1 ---")
agent.ask("Python 有哪些数据类型")
print()

# 问题 2：异常处理
print("--- 问题 2 ---")
agent.ask("Python 怎么处理异常")
print()

# 问题 3：列表和元组的区别
print("--- 问题 3 ---")
agent.ask("Python 的列表和元组有什么区别")`,
  },
];
