// =============================================================
// AI Agent开发实战 - 第十一批章节（第十一部分 LangChain 框架，共 4 章）
// 章节 41-44：架构总览 / Chain 与 LCEL / Memory / Agent 与 Tools
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十一章：LangChain 架构总览
  // =============================================================
  {
    id: 'langchain-intro',
    group: 'LangChain 框架',
    icon: '🔗',
    title: 'LangChain 架构总览',
    content: `## 第四十一章　LangChain 架构总览

> "不要重复造轮子。"LangChain 是 LLM 应用开发最流行的框架,本章带你鸟瞰它的全貌,理解它的设计哲学和适用边界。

### 41.1 LangChain 是什么

**LangChain** 是一个用于开发 LLM 驱动应用的开源框架,由 Harrison Chase 于 2022 年 10 月发布。它把 LLM 应用开发的常见模式封装成可复用组件,让开发者不必每次都从零写 prompt、解析器、向量库适配代码。

\`\`\`text
没有 LangChain 的世界:
- 接 OpenAI 要写一套代码
- 接 Claude 又要重写
- 切换向量库又得改一遍
- 每个 prompt 都要自己写解析逻辑

有 LangChain 的世界:
- 统一的 Model 接口,切换模型改一行代码
- 统一的 VectorStore 接口,切换向量库无侵入
- 现成的 Chain、Agent、Memory 组件
- 大量社区集成的工具和文档加载器
\`\`\`

### 41.2 为什么用框架

很多人问:"直接调 OpenAI SDK 不行吗?"行,但只在最简单的场景下行。一旦应用复杂,你会发现自己在重写 LangChain 已经做好的事情。

**框架的核心价值:**

1. **统一接口**:换 LLM、换向量库、换 loader,业务代码不动
2. **组件复用**:Prompt、Memory、Chain、Agent 这些抽象可跨项目复用
3. **生态丰富**:数百个第三方集成,不必自己写适配
4. **社区支持**:遇到问题有大量案例可参考
5. **最佳实践沉淀**:框架封装了踩过的坑,你不必再踩

### 41.3 核心概念

LangChain 的设计围绕几个核心抽象。理解了它们,就理解了 LangChain 的 80%。

\`\`\`text
1. Model(模型):封装 LLM 调用,统一接口
   - ChatModel: 对话型(GPT-4、Claude)
   - LLM: 补全型(已较少用)

2. Prompt(提示词):模板化、参数化的 prompt
   - ChatPromptTemplate: 多角色消息模板
   - FewShotPromptTemplate: few-shot 示例

3. Chain(链):把多个步骤串成流水线
   - 旧版: LLMChain(已不推荐)
   - 新版: LCEL 表达式

4. Agent(智能体):基于 LLM 决策执行
   - AgentExecutor: 执行器
   - create_tool_calling_agent: 工具调用 Agent

5. Memory(记忆):管理对话历史
   - BufferMemory / WindowMemory / SummaryMemory

6. Retriever(检索器):从向量库检索相关文档
   - VectorStoreRetriever / 多种检索策略

7. Tool(工具):Agent 能调用的外部能力
   - @tool 装饰器 / Tool 类
\`\`\`

### 41.4 模块结构

LangChain 在 v0.2 之后拆分成多个独立包,以解耦和提升可维护性。

\`\`\`text
langchain-core          ← 核心抽象(Runnable、PromptTemplate 等)
   ↑
langchain              ← 主包(Chain、Agent 等高层抽象)
   ↑
langchain-community    ← 社区集成(各种第三方 loader、vectorstore)
   ↑
langchain-openai       ← 厂商专用包(OpenAI 模型适配)
langchain-anthropic    ← Anthropic 适配
langchain-google       ← Google 适配
...
\`\`\`

**为什么拆分?**
- 早期 langchain 是一个大包,装它就装了一堆依赖
- 拆分后只装需要的部分,体积小、依赖少
- 厂商专用包独立发布,迭代更快

**安装方式:**

\`\`\`bash
# 核心包(必装)
pip install langchain langchain-core

# 模型厂商(按需)
pip install langchain-openai        # OpenAI
pip install langchain-anthropic    # Claude
pip install langchain-google-genai  # Gemini

# 社区集成(按需)
pip install langchain-community

# 全家桶(图省事)
pip install langchain[all]
\`\`\`

### 41.5 版本演进

LangChain 迭代很快,理解版本演进能避免被旧教程误导。

| 版本 | 时间 | 关键变化 |
|------|------|---------|
| v0.0 | 2022.10 | 诞生,Chain、Agent、Memory 基础抽象 |
| v0.1 | 2024.01 | 引入 langchain-core,稳定 API |
| v0.2 | 2024.05 | LCEL 成默认,废弃旧 LLMChain |
| v0.3 | 2024.10 | 全面拥抱 LCEL,清理废弃 API |

**今天写代码,默认用 LCEL 表达式**(下一章详讲),不要再用 \`LLMChain\` 那套旧 API。

### 41.6 LCEL 是什么

**LCEL** = **LangChain Expression Language**,LangChain 的新一代"管道"语法。它让你用 \`|\` 把多个组件串成流水线,像 Unix 管道一样直观。

\`\`\`python
# 旧版 LLMChain(已不推荐)
from langchain.chains import LLMChain
chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(question="你好")

# 新版 LCEL(推荐)
chain = prompt | llm | output_parser
result = chain.invoke({"question": "你好"})
\`\`\`

LCEL 的优势会在下一章详细讲,这里只先有个印象:**今天的 LangChain 就是 LCEL**。

### 41.7 LangChain 适合什么

框架不是银弹,LangChain 有它擅长的场景,也有不适合的场景。

**适合的场景:**
- **快速原型**:几天内跑通一个 LLM 应用 demo
- **复杂流程**:多步骤 Chain、Agent 决策、工具调用编排
- **多模型/多向量库**:需要灵活切换、对比
- **RAG 应用**:大量现成 loader、splitter、retriever
- **Agent 应用**:成熟的 Agent 框架,降低开发门槛

**不适合的场景:**
- **简单调用**:就调一次 LLM,直接用厂商 SDK 更轻
- **极致性能**:框架有抽象开销,延迟敏感场景慎用
- **高度定制流程**:你的流程逻辑特别定制,框架反而束缚
- **小团队小项目**:不需要跨项目复用,框架引入额外复杂度

\`\`\`text
判断标准:
- 应用复杂度高、需要复用 → 用 LangChain
- 应用简单、追求极致性能 → 直接用厂商 SDK
- 介于之间 → 用 langchain-core 的轻量抽象,不用全套
\`\`\`

### 41.8 安装和第一个示例

\`\`\`bash
# 安装核心包 + OpenAI 适配
pip install langchain langchain-openai

# 设置环境变量
export OPENAI_API_KEY=sk-...
\`\`\`

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 1. 创建 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 2. 创建 prompt 模板
prompt = ChatPromptTemplate.from_template("用一句话解释 {topic} 是什么")

# 3. 用 LCEL 串成 chain
chain = prompt | llm | StrOutputParser()

# 4. 调用
result = chain.invoke({"topic": "向量数据库"})
print(result)
# 输出示例: "向量数据库是专门存储和检索高维向量的数据库,常用于 AI 相似度搜索。"
\`\`\`

**代码解读:**
- \`prompt\` 接收 \`{"topic": "..."}\`,生成完整 prompt
- \`llm\` 接收 prompt,调用 LLM 返回 \`AIMessage\`
- \`StrOutputParser()\` 接收 \`AIMessage\`,提取出字符串
- 整个 chain 通过 \`|\` 串起来,\`invoke\` 触发执行

### 41.9 LangChain 的常见抽象对照表

理解 LangChain 最快的方式是看它的抽象对应到普通代码什么:

| LangChain 抽象 | 对应普通代码 | 作用 |
|---------------|-------------|------|
| ChatModel | 一个函数 \`messages -> response\` | 封装 LLM 调用 |
| PromptTemplate | 一个 \`f-string\` 模板 | 参数化 prompt |
| OutputParser | 一个解析函数 \`response -> data\` | 解析 LLM 输出 |
| Chain | 多个函数串起来 | 流程编排 |
| Memory | 一个 messages 列表 | 管理对话历史 |
| Retriever | 一个搜索函数 \`query -> docs\` | 检索相关文档 |
| Tool | 一个可调用函数 | Agent 调用的外部能力 |
| Agent | 一个决策循环 | LLM 决策执行 |

### 41.10 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 用旧版 LLMChain | 警告废弃 | 改用 LCEL \`prompt | llm\` |
| 装一个大 langchain 包 | 体积巨大、依赖冲突 | 按需装 langchain-openai 等 |
| 不区分 langchain 和 langchain-core | 改 core 报错 | 业务代码用 langchain,抽象在 core |
| 用教程代码报错 | API 改了 | 看 v0.3+ 文档,旧教程会误导 |
| 切换模型后代码大改 | 直接用 OpenAI SDK 写死 | 用 ChatModel 抽象,改一行切换 |
| 把 LangChain 当万能工具 | 简单调用也用框架 | 简单场景用厂商 SDK 即可 |

> **小结**:LangChain 是 LLM 应用开发的"瑞士军刀",不是"银弹"。理解它的抽象,知道什么时候用、什么时候不用,才是会用框架。下一章讲它的核心语法——LCEL。`,
  },

  // =============================================================
  // 第四十二章：Chain 链式调用与 LCEL
  // =============================================================
  {
    id: 'langchain-chain',
    group: 'LangChain 框架',
    icon: '⛓️',
    title: 'Chain 链式调用与 LCEL',
    content: `## 第四十二章　Chain 链式调用与 LCEL

> LCEL 是 LangChain 的核心语法,理解了它,LangChain 就学会了一半。本章把 LCEL 讲透,从原理到组合到实战。

### 42.1 Chain 是什么

**Chain**(链)就是"把多个步骤串成流水线"。在 LangChain 中,典型的 Chain 是 \`prompt → llm → parser\`:

\`\`\`text
输入 {topic: "RAG"}
  ↓
prompt 模板渲染: "用一句话解释 RAG 是什么"
  ↓
LLM 调用: AIMessage("RAG 是检索增强生成...")
  ↓
parser 解析: "RAG 是检索增强生成..."
  ↓
最终输出字符串
\`\`\`

每个步骤接收上一步的输出,产出下一步的输入。这和 Unix 管道 \`cat file | grep keyword | wc -l\` 是同一个思想。

### 42.2 旧版 LLMChain(已不推荐)

LangChain 早期用 \`LLMChain\` 类封装 chain:

\`\`\`python
# 旧版(不推荐)
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("什么是 {topic}?")
chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(topic="RAG")
\`\`\`

**为什么不推荐?**
- 不支持流式、异步、批处理的原生能力
- 接口不统一,不同 Chain 用法不一
- 调试和组合困难

LangChain v0.2 之后,官方推荐用 LCEL 替代。

### 42.3 LCEL:LangChain 表达式语言

**LCEL** 用 \`|\` 操作符把组件串起来,语法极其简洁:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 三个组件
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
prompt = ChatPromptTemplate.from_template("用一句话解释 {topic}")
parser = StrOutputParser()

# LCEL:用 | 串成 chain
chain = prompt | llm | parser

# 调用
result = chain.invoke({"topic": "向量数据库"})
print(result)
\`\`\`

**为什么 \`|\` 能用?** 因为 LangChain 的核心组件都实现了 \`Runnable\` 协议,定义了 \`__or__\` 方法,让 \`|\` 操作成为可能。

### 42.4 Runnable 协议

LCEL 的根基是 \`Runnable\` 协议。任何实现了 \`Runnable\` 的对象都可以用 \`|\` 串联。

\`\`\`text
Runnable 协议要求实现:
- invoke(input): 单次调用,同步
- batch(inputs): 批量调用
- stream(input): 流式调用,逐块返回
- ainvoke(input): 异步单次调用
- abatch(inputs): 异步批量
- astream(input): 异步流式

只要实现这些方法,任何对象都能成为 chain 的一环。
\`\`\`

\`\`\`python
from langchain_core.runnables import Runnable

# 自定义 Runnable(简化版)
class LengthChecker(Runnable):
    """检查输出长度,过长则截断"""
    
    def invoke(self, input, config=None):
        if isinstance(input, str) and len(input) > 100:
            return input[:100] + "..."
        return input

# 把它加进 chain
chain = prompt | llm | parser | LengthChecker()
\`\`\`

### 42.5 LCEL 三大优势

#### 42.5.1 流式原生支持

LCEL chain 自带流式能力,不必额外写代码:

\`\`\`python
# 流式输出
chain = prompt | llm | parser
for chunk in chain.stream({"topic": "AI Agent"}):
    print(chunk, end="", flush=True)
# 输出会逐字打印,体验好
\`\`\`

#### 42.5.2 异步原生支持

\`\`\`python
import asyncio

async def main():
    # 异步调用,不阻塞
    result = await chain.ainvoke({"topic": "RAG"})
    print(result)

asyncio.run(main())
\`\`\`

#### 42.5.3 批处理原生支持

\`\`\`python
# 批量调用:一次处理多个输入
results = chain.batch([
    {"topic": "RAG"},
    {"topic": "Agent"},
    {"topic": "LangChain"},
])
# 内部并发,效率高
\`\`\`

这三个能力是 LCEL 的核心卖点——写一遍 chain,流式、异步、批处理都自动支持。

### 42.6 组合多个 Chain

LCEL 的强大在于组件可组合。一个 chain 可以是另一个 chain 的一环。

\`\`\`python
# 第一个 chain:生成解释
explain_chain = (
    ChatPromptTemplate.from_template("用一句话解释 {topic}")
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
)

# 第二个 chain:基于解释生成例子
example_chain = (
    ChatPromptTemplate.from_template("基于以下解释,给一个例子:\\n{explanation}")
    | ChatOpenAI(model="gpt-4o-mini")
    | StrOutputParser()
)

# 组合成一个 chain
from langchain_core.runnables import RunnablePassthrough

full_chain = (
    {"explanation": explain_chain, "topic": RunnablePassthrough()}
    | example_chain
)

result = full_chain.invoke("向量数据库")
# 解释和例子都会被生成
\`\`\`

### 42.7 条件分支 RunnableBranch

有时需要根据输入走不同 chain。LCEL 用 \`RunnableBranch\` 实现:

\`\`\`python
from langchain_core.runnables import RunnableBranch

# 定义不同分支
branch = RunnableBranch(
    # (条件函数, 执行的 chain)
    (lambda x: x["type"] == "技术", tech_chain),
    (lambda x: x["type"] == "闲聊", chat_chain),
    # 默认分支
    default_chain,
)

result = branch.invoke({"type": "技术", "question": "什么是 RAG?"})
\`\`\`

**注意**:分支会让 chain 不可流式(因为要等条件判断后才能确定走哪条),慎用。

### 42.8 并行 RunnableParallel

需要同时跑多个 chain 然后合并结果时,用 \`RunnableParallel\`:

\`\`\`python
from langchain_core.runnables import RunnableParallel

# 同时生成解释、例子、应用场景
parallel_chain = RunnableParallel(
    explanation=explain_chain,
    example=example_chain,
    applications=application_chain,
)

result = parallel_chain.invoke("向量数据库")
# 返回 {"explanation": ..., "example": ..., "applications": ...}
\`\`\`

### 42.9 实战代码示例:翻译+摘要+情感分析

下面是一个完整的实战示例:输入一段文本,并行做翻译、摘要、情感分析,然后综合输出:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

# 共享 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 翻译 chain
translate_chain = (
    ChatPromptTemplate.from_template("把以下文本翻译成英文:\\n{text}")
    | llm | StrOutputParser()
)

# 摘要 chain
summary_chain = (
    ChatPromptTemplate.from_template("用一句话总结以下文本:\\n{text}")
    | llm | StrOutputParser()
)

# 情感分析 chain
sentiment_chain = (
    ChatPromptTemplate.from_template("分析以下文本的情感(正面/负面/中性),只输出情感词:\\n{text}")
    | llm | StrOutputParser()
)

# 综合处理:并行三个 chain
analyze_chain = (
    RunnableParallel(
        translation=translate_chain,
        summary=summary_chain,
        sentiment=sentiment_chain,
    )
)

# 调用
text = "今天的发布会太让人失望了,产品没什么新意,股价大跌。"
result = analyze_chain.invoke({"text": text})

print("翻译:", result["translation"])
print("摘要:", result["summary"])
print("情感:", result["sentiment"])

# 输出示例:
# 翻译: Today's product launch was disappointing, with no new ideas and the stock price dropped.
# 摘要: 发布会令人失望,产品无新意,股价下跌。
# 情感: 负面
\`\`\`

### 42.10 LCEL 的常用模式

\`\`\`text
1. 简单 chain: prompt | llm | parser
2. 加 RAG: retriever | prompt | llm | parser
3. 加 memory: 用 RunnablePassthrough 把 history 注入
4. 加条件: RunnableBranch
5. 并行: RunnableParallel
6. 自定义函数: 用 RunnableLambda 包装
\`\`\`

\`\`\`python
from langchain_core.runnables import RunnableLambda

# 用 RunnableLambda 把普通函数变成 Runnable
def to_upper(text):
    return text.upper()

chain = prompt | llm | parser | RunnableLambda(to_upper)
\`\`\`

### 42.11 调试 LCEL Chain

LCEL chain 调试稍麻烦,因为数据在组件间流动不可见。常用技巧:

\`\`\`python
# 方法 1: 用 RunnableLambda 打印中间结果
def debug_print(x):
    print(f"[DEBUG] {type(x).__name__}: {x}")
    return x

chain = prompt | RunnableLambda(debug_print) | llm | parser

# 方法 2: 启用 langchain 调试日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 方法 3: 单独调用每个组件,看输出
prompt_output = prompt.invoke({"topic": "RAG"})
print("Prompt 输出:", prompt_output)
llm_output = llm.invoke(prompt_output)
print("LLM 输出:", llm_output)
\`\`\`

### 42.12 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 用旧版 LLMChain | 警告废弃 | 改用 LCEL \`prompt | llm\` |
| 不实现 Runnable 协议 \| \`|\` 报错 | 继承 Runnable 或用 RunnableLambda |
| RunnableBranch 期待流式 | 不支持流式 | 分支逻辑别用 stream |
| 并行 chain 输出顺序乱 | dict 不保证顺序 | 用 RunnableParallel 显式命名 key |
| 不传 dict 给 invoke | 模板变量报错 | invoke 传 \`{"key": val}\` |
| 忘记 StrOutputParser | 返回 AIMessage 而非字符串 | 末尾加 \`| StrOutputParser()\` |
| 自定义函数没包 RunnableLambda \| \`|\` 报错 | 用 RunnableLambda 包装 |
| invoke 而非 stream | 想要流式却一次返回 | 改用 chain.stream |

> **小结**:LCEL 是 LangChain 的"灵魂语法"。它把组件像积木一样拼起来,代码简洁、流式/异步/批处理原生支持。下一章讲 Chain 不可或缺的搭档——Memory。`,
  },

  // =============================================================
  // 第四十三章：LangChain Memory 记忆
  // =============================================================
  {
    id: 'langchain-memory',
    group: 'LangChain 框架',
    icon: '💾',
    title: 'LangChain Memory 记忆',
    content: `## 第四十三章　LangChain Memory 记忆

> LLM 是无状态的,每次调用都"失忆"。Memory 是 LangChain 给应用"加记忆"的方案。本章讲清楚为什么需要、有哪些类型、怎么用。

### 43.1 为什么需要 Memory

**核心问题**:LLM API 调用是无状态的——你每次发请求,模型都不记得上次说了什么。下面这段对话,LLM 第二次回答会"失忆":

\`\`\`python
from openai import OpenAI
client = OpenAI()

# 第一次对话
client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "我叫张三"}]
)
# LLM 回答:"你好,张三"

# 第二次对话
client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "我叫什么?"}]
)
# LLM 回答:"你叫什么我不知道"(失忆了)
\`\`\`

**解决方案**:把历史对话作为 messages 一起发给 LLM:

\`\`\`python
# 正确做法:把历史也带上
client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "我叫张三"},
        {"role": "assistant", "content": "你好,张三"},
        {"role": "user", "content": "我叫什么?"},  # 这次 LLM 知道了
    ]
)
\`\`\`

**Memory 的本质**:就是帮你管理这个"历史 messages 列表"的组件。它决定:
- 存哪些历史(全存还是只存最近几轮)
- 怎么压缩(原样存还是摘要存)
- 怎么取(直接取还是按相关度检索)

### 43.2 主流 Memory 类型

LangChain 提供了多种 Memory 实现,各有适用场景。

#### 43.2.1 ConversationBufferMemory(全量历史)

最简单粗暴:存全部历史,每次调用全部带上。

\`\`\`python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
memory.chat_memory.add_user_message("我叫张三")
memory.chat_memory.add_ai_message("你好,张三")
memory.chat_memory.add_user_message("我喜欢 Python")

# 取出历史
history = memory.load_memory_variables({})
print(history)
# {'history': 'Human: 我叫张三\\nAI: 你好,张三\\nHuman: 我喜欢 Python'}
\`\`\`

**优点**:实现简单,信息无损。**缺点**:对话一长就超 token 上限,贵且慢。

#### 43.2.2 ConversationBufferWindowMemory(滑动窗口)

只保留最近 k 轮对话,前面的丢弃。

\`\`\`python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=3)  # 只保留最近 3 轮

# 模拟 5 轮对话
for i in range(5):
    memory.chat_memory.add_user_message(f"用户消息 {i}")
    memory.chat_memory.add_ai_message(f"AI 回复 {i}")

history = memory.load_memory_variables({})
# 只能看到最近 3 轮:消息 2/3/4 + 回复 2/3/4
\`\`\`

**优点**:token 消耗可控。**缺点**:前面的对话完全丢失,长程记忆丢失。

#### 43.2.3 ConversationSummaryMemory(摘要记忆)

用 LLM 把历史对话压缩成摘要,每次存摘要而不是完整对话。

\`\`\`python
from langchain.memory import ConversationSummaryMemory
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
memory = ConversationSummaryMemory(llm=llm)

memory.chat_memory.add_user_message("我叫张三,是一名 Python 开发者")
memory.chat_memory.add_ai_message("你好张三,认识你很高兴")

memory.chat_memory.add_user_message("我在做 RAG 项目")
memory.chat_memory.add_ai_message("RAG 是检索增强生成,需要 embedding 和向量库")

history = memory.load_memory_variables({})
# 不是原始对话,而是一段摘要:
# "用户叫张三,是 Python 开发者,正在做 RAG 项目。AI 介绍了 RAG 的基本概念。"
\`\`\`

**优点**:token 占用少,保留长程语义。**缺点**:细节丢失,需要额外 LLM 调用做摘要。

#### 43.2.4 ConversationSummaryBufferMemory(混合)

折中方案:近期对话原样保留,远的对话压缩成摘要。

\`\`\`python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=200,  # 原始对话最多 200 token,超了就压缩成摘要
)
\`\`\`

**逻辑**:近期对话保留原样,超出 token 上限的部分自动用 LLM 压成摘要。这是平衡信息保留和 token 消耗的方案,生产环境最常用之一。

#### 43.2.5 VectorStoreRetrieverMemory(向量检索相关历史)

把所有历史对话存入向量库,每次只取和当前问题相关的几条。

\`\`\`python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# 向量库存对话
vectorstore = Chroma(embedding_function=OpenAIEmbeddings())

memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
)

# 存历史
memory.save_context({"input": "我叫张三"}, {"output": "你好张三"})
memory.save_context({"input": "我喜欢 Python"}, {"output": "Python 很好用"})
memory.save_context({"input": "我在做 RAG"}, {"output": "RAG 是..."})

# 取相关历史
history = memory.load_memory_variables({"prompt": "RAG 怎么做?"})
# 只返回和 RAG 相关的历史,其他无关对话不带上
\`\`\`

**优点**:支持超长对话(因为只取相关的),信息保留好。**缺点**:依赖向量库,延迟略高,实现复杂。

### 43.3 Memory 类型对比表

| Memory 类型 | 信息保留 | Token 消耗 | 实现复杂度 | 适用场景 |
|------------|---------|-----------|-----------|---------|
| BufferMemory | 完整 | 高 | ★ | 短对话、调试 |
| WindowMemory(k=3) | 最近 k 轮 | 低 | ★ | 短期对话应用 |
| SummaryMemory | 摘要 | 中 | ★★ | 长对话、对细节不敏感 |
| SummaryBufferMemory | 近期+摘要 | 中 | ★★★ | 生产环境最常用 |
| VectorStoreMemory | 相关历史 | 低 | ★★★★ | 超长对话、多话题 |

### 43.4 Memory 和 prompt 模板的结合

Memory 本身只是个数据结构,要把它接入对话 chain,需要 prompt 模板配合。

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 创建带 history 占位符的 prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个友好的助手。"),
    MessagesPlaceholder(variable_name="history"),  # 历史对话插入这里
    ("human", "{input}"),
])

# Memory
memory = ConversationBufferMemory(return_messages=True)

# 主流程
def chat(user_input):
    # 1. 取历史
    history = memory.load_memory_variables({})["history"]
    
    # 2. 调用 LLM
    response = llm.invoke(
        prompt.format_messages(history=history, input=user_input)
    )
    
    # 3. 把这轮存入 memory
    memory.chat_memory.add_user_message(user_input)
    memory.chat_memory.add_ai_message(response.content)
    
    return response.content

# 测试
print(chat("我叫张三"))
print(chat("我喜欢 Python"))
print(chat("我叫什么?"))  # 应该答"张三"
\`\`\`

### 43.5 用 LCEL 实现带 Memory 的 Chain

LCEL 风格下,Memory 用 \`RunnablePassthrough\` 注入:

\`\`\`python
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser

# 一个简单的 memory 对象
memory = ConversationBufferMemory(return_messages=True)

# LCEL chain
def load_history(_):
    return memory.load_memory_variables({})["history"]

chain = (
    RunnablePassthrough.assign(history=RunnableLambda(load_history))
    | prompt
    | llm
    | StrOutputParser()
)

# 调用并保存
def chat(user_input):
    answer = chain.invoke({"input": user_input})
    memory.chat_memory.add_user_message(user_input)
    memory.chat_memory.add_ai_message(answer)
    return answer

print(chat("我叫张三"))
print(chat("我叫什么?"))
\`\`\`

### 43.6 多用户记忆隔离

生产环境常常一个应用服务多个用户,每个用户的记忆必须隔离。

\`\`\`python
class MultiUserMemoryManager:
    """多用户 Memory 隔离管理器"""
    
    def __init__(self, memory_class=ConversationBufferMemory):
        self.memories = {}  # {user_id: memory}
        self.memory_class = memory_class
    
    def get_memory(self, user_id):
        """获取指定用户的 memory,没有则创建"""
        if user_id not in self.memories:
            self.memories[user_id] = self.memory_class(return_messages=True)
        return self.memories[user_id]
    
    def clear_memory(self, user_id):
        """清除某用户的记忆"""
        if user_id in self.memories:
            del self.memories[user_id]


# 使用
manager = MultiUserMemoryManager()

# 用户 A 的对话
memory_a = manager.get_memory("user_A")
memory_a.chat_memory.add_user_message("我是 Alice")

# 用户 B 的对话
memory_b = manager.get_memory("user_B")
memory_b.chat_memory.add_user_message("我是 Bob")

# 互不干扰
print(memory_a.load_memory_variables({}))
print(memory_b.load_memory_variables({}))
\`\`\`

**生产级实现**:用 Redis 或数据库存 memory,而不是内存 dict,避免重启丢失。

### 43.7 实战:带记忆的聊天机器人

下面是一个完整的可运行聊天机器人示例,带不同 Memory 策略切换:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import (
    ConversationBufferMemory,
    ConversationBufferWindowMemory,
    ConversationSummaryBufferMemory,
)
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser


class MemoryChatBot:
    """可切换 Memory 策略的聊天机器人"""
    
    def __init__(self, memory_type="buffer", **memory_kwargs):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        
        # 创建 memory
        if memory_type == "buffer":
            self.memory = ConversationBufferMemory(
                return_messages=True, **memory_kwargs
            )
        elif memory_type == "window":
            self.memory = ConversationBufferWindowMemory(
                return_messages=True, k=memory_kwargs.get("k", 5)
            )
        elif memory_type == "summary":
            self.memory = ConversationSummaryBufferMemory(
                llm=self.llm,
                return_messages=True,
                max_token_limit=memory_kwargs.get("max_token_limit", 300),
            )
        else:
            raise ValueError(f"未知 memory 类型: {memory_type}")
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个友好的助手,请基于对话历史回答用户问题。"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])
        
        # 构建 chain
        def load_history(_):
            return self.memory.load_memory_variables({})["history"]
        
        self.chain = (
            RunnablePassthrough.assign(history=RunnableLambda(load_history))
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
    
    def chat(self, user_input):
        """对话"""
        answer = self.chain.invoke({"input": user_input})
        # 保存到 memory
        self.memory.chat_memory.add_user_message(user_input)
        self.memory.chat_memory.add_ai_message(answer)
        return answer


# 测试
if __name__ == "__main__":
    # 用 summary memory 长对话
    bot = MemoryChatBot(memory_type="summary", max_token_limit=200)
    
    print(bot.chat("我叫张三,是一名 Python 开发者"))
    print(bot.chat("我在做一个 RAG 项目"))
    print(bot.chat("我叫什么?我是做什么的?"))
    # 输出应该能回忆起名字和职业
\`\`\`

### 43.8 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| BufferMemory 长对话超 token | LLM 报 token 超限 | 改用 Window 或 Summary |
| SummaryMemory 漏细节 | 早期信息被压缩丢失 | 关键信息另外存 |
| WindowMemory k 太小 | 早期重要信息丢失 | 调大 k 或换 Summary |
| Memory 不保存到磁盘 | 重启全失 | 用 Redis/数据库持久化 |
| 多用户共享 memory | 用户串话 | 用 user_id 隔离 |
| Memory 加在 chain 外面 | 调用没记忆 | 在 chain 内用 RunnablePassthrough 注入 |
| 每轮都重传全部历史 | token 消耗大 | 用 Summary 或 VectorStore |
| VectorStoreMemory 检索不准 | 找不到相关历史 | 调 k 值、改 embedding |

> **小结**:Memory 让 LLM 应用从"一锤子买卖"变成"持续对话"。选哪种 memory,要在信息保留和 token 消耗之间权衡。生产环境最常用 SummaryBufferMemory,长对话用 VectorStoreRetrieverMemory。下一章讲 Memory 的天然搭档——Agent 和 Tools。`,
  },

  // =============================================================
  // 第四十四章：LangChain Agent 与 Tools
  // =============================================================
  {
    id: 'langchain-agent',
    group: 'LangChain 框架',
    icon: '🤖',
    title: 'LangChain Agent 与 Tools',
    content: `## 第四十四章　LangChain Agent 与 Tools

> 前面手写过 Agent,本章看 LangChain 怎么把 Agent 工程化。重点:AgentExecutor、工具定义、解析错误处理、实战 Agent。

### 44.1 LangChain Agent 架构

LangChain 的 Agent 系统围绕 \`AgentExecutor\` 设计,核心组件:

\`\`\`text
用户输入
  ↓
AgentExecutor(执行器,管理循环)
  ↓
Agent(LLM + prompt,负责决策)
  ↓
Tools(工具列表)
  ↓
执行工具,返回 Observation
  ↓
回到 Agent,继续决策(直到完成或达到上限)
\`\`\`

**AgentExecutor 的职责:**
- 管理主循环(反复调用 Agent)
- 解析 Agent 输出(决定是调工具还是返回)
- 调用工具,把结果回传给 Agent
- 处理错误(解析失败、工具失败)
- 控制终止(最大步数、超时)

### 44.2 创建 Agent 的几种方式

LangChain 提供多种 \`create_xxx_agent\` 函数,对应不同的 LLM 接口风格:

\`\`\`python
from langchain.agents import (
    create_openai_tools_agent,
    create_tool_calling_agent,
    create_react_agent,
    create_structured_chat_agent,
)

# 1. create_openai_tools_agent: 适合支持 OpenAI tools API 的模型(GPT-4、Claude 3+)
# 2. create_tool_calling_agent: 通用工具调用,大多数现代模型支持
# 3. create_react_agent: 经典 ReAct 文本协议(老模型 fallback)
# 4. create_structured_chat_agent: 工具参数支持复杂 JSON 结构
\`\`\`

**今天推荐**:用 \`create_tool_calling_agent\`,它兼容大多数现代模型,且支持结构化工具调用。

### 44.3 工具定义

LangChain 提供多种工具定义方式,各有适用场景。

#### 44.3.1 @tool 装饰器(推荐)

最简洁的方式:用 \`@tool\` 装饰一个普通函数,自动从函数签名和 docstring 生成工具描述。

\`\`\`python
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """在网上搜索信息。
    
    Args:
        query: 搜索关键词
    """
    # 实际调用搜索 API
    return f"搜索结果: {query} 的相关内容..."

@tool
def calculate(expression: str) -> str:
    """计算数学表达式。
    
    Args:
        expression: 数学表达式,如 '3 + 5 * 2'
    """
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算失败: {e}"

@tool
def get_current_weather(city: str) -> str:
    """获取指定城市的当前天气。
    
    Args:
        city: 城市名,如 '北京'、'上海'
    """
    # 模拟(实际调天气 API)
    weather_db = {"北京": "晴 25 度", "上海": "多云 28 度"}
    return weather_db.get(city, f"未找到 {city} 的天气信息")

tools = [search_web, calculate, get_current_weather]
\`\`\`

**docstring 是关键**:LLM 通过它判断何时用这个工具。描述不清,LLM 就乱调或不调。

#### 44.3.2 Tool 类(更灵活)

需要更多控制(动态描述、自定义参数验证)时,用 \`Tool\` 类:

\`\`\`python
from langchain.tools import Tool

def search_func(query):
    return f"搜索 {query}"

search_tool = Tool(
    name="search",
    func=search_func,
    description="搜索网上信息,输入关键词",
    # 可选:返回结果直接给用户,不让 LLM 再加工
    return_direct=False,
)
\`\`\`

#### 44.3.3 StructuredTool(复杂参数)

工具需要多个参数(对象)时,用 Pydantic 模型定义参数结构:

\`\`\`python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    city: str = Field(description="城市名")
    days: int = Field(description="预报天数", default=1)

def get_forecast(city: str, days: int = 1) -> str:
    return f"{city} 未来 {days} 天的天气..."

forecast_tool = StructuredTool.from_function(
    func=get_forecast,
    name="get_forecast",
    description="获取多日天气预报",
    args_schema=WeatherInput,
)
\`\`\`

### 44.4 工具描述的重要性

**重要原则**:LLM 完全靠工具描述来决定用哪个工具、传什么参数。描述写得好,Agent 就聪明;描述差,Agent 就乱来。

\`\`\`python
# 差的描述:LLM 不知道什么时候用
@tool
def search(q: str) -> str:
    """搜索"""
    return "..."

# 好的描述:清楚说明用途、参数、返回
@tool
def search_web(query: str) -> str:
    """在网上搜索最新信息。
    
    适用于需要查找:
    - 实时信息(新闻、天气、股价)
    - 不在训练数据中的事实
    - API 文档、教程等
    
    Args:
        query: 搜索关键词,用自然语言描述
    
    Returns:
        搜索结果的摘要文本
    """
    return "..."
\`\`\`

**描述要包含:**
- 工具能做什么(适用场景)
- 输入参数的格式和含义
- 返回内容的格式
- 什么场景**不该用**(避免误调)

### 44.5 内置工具

LangChain 社区包内置了大量工具,直接 import 即可:

\`\`\`python
# 几个常用内置工具
from langchain_community.tools import (
    DuckDuckGoSearchRun,    # DuckDuckGo 搜索
    WikipediaQueryRun,      # 维基百科查询
    PythonREPLTool,         # Python 代码执行
    ShellTool,              # Shell 命令执行
)

# DuckDuckGo 搜索
search = DuckDuckGoSearchRun()
print(search.invoke("OpenAI GPT-5 发布时间"))

# Python REPL(谨慎,有安全风险)
python_tool = PythonREPLTool()
print(python_tool.invoke("print(2 ** 10)"))
\`\`\`

**安全警告**:\`PythonREPLTool\` 和 \`ShellTool\` 能执行任意代码,生产环境慎用!至少要加沙箱(Docker、隔离环境)。

### 44.6 创建完整 Agent

下面用 \`create_tool_calling_agent\` 创建一个能搜索+计算的 Agent:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate

# 1. LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 2. 工具(用前面定义的)
tools = [search_web, calculate, get_current_weather]

# 3. Prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个能调用工具的助手。根据用户问题选择合适的工具。"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),  # Agent 中间思考过程
])

# 4. 创建 Agent
agent = create_tool_calling_agent(llm, tools, prompt)

# 5. 创建执行器
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,             # 打印执行过程
    max_iterations=10,       # 最大步数
    handle_parsing_errors=True,  # 解析错误自动处理
)

# 6. 调用
result = agent_executor.invoke({"input": "北京今天天气怎么样?然后告诉我 25 度等于多少华氏度"})
print(result["output"])
\`\`\`

### 44.7 AgentExecutor 关键参数

\`\`\`python
AgentExecutor(
    agent=agent,
    tools=tools,
    
    # 1. 控制参数
    max_iterations=10,           # 最大循环步数(防死循环)
    max_execution_time=120,      # 最大执行时间(秒)
    early_stopping_method="generate",  # 达上限时的处理:"generate" 让 LLM 给当前最佳答案
    
    # 2. 错误处理
    handle_parsing_errors=True,  # 解析错误自动重试
    
    # 3. 输出控制
    verbose=True,                # 打印详细执行过程
    return_intermediate_steps=False,  # 是否返回中间步骤
    
    # 4. 工具结果处理
    handle_tool_error=True,      # 工具错误不让 Agent 崩溃
)
\`\`\`

**参数调优建议:**
- \`max_iterations\`:5-10 起步,简单任务用 3-5,复杂调研可到 15
- \`handle_parsing_errors\`:生产环境必须开,否则一个解析错误就崩
- \`verbose\`:开发时开,生产环境关(日志太多)

### 44.8 return_direct 详解

\`return_direct=True\` 的工具,结果直接返回用户,不让 LLM 再加工:

\`\`\`python
@tool(return_direct=True)
def get_stock_price(symbol: str) -> str:
    """获取股票实时价格"""
    return f"当前 {symbol} 价格: 150.25"

# Agent 调用此工具后,直接返回 "当前 AAPL 价格: 150.25"
# 不会让 LLM 再加工成"苹果公司股票当前价格是 150.25 美元..."
\`\`\`

**适用场景**:工具输出本身就是最终答案(如查股价、查天气),不需要 LLM 再解释一遍,节省一次 LLM 调用。

### 44.9 实战:一个能搜索+计算的 Agent

下面是一个完整可运行的示例:

\`\`\`python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool


# ===== 工具定义 =====
@tool
def search(query: str) -> str:
    """在网上搜索信息。
    
    适用于:
    - 查询实时信息(新闻、天气、股价)
    - 查询训练数据中没有的事实
    
    Args:
        query: 搜索关键词
    """
    # 模拟搜索(实际接 DuckDuckGo 或 SerpAPI)
    fake_results = {
        "OpenAI": "OpenAI 是 AI 公司,GPT 系列是其代表产品",
        "Python": "Python 是一门解释型编程语言",
        "LangChain": "LangChain 是 LLM 应用开发框架",
    }
    for key, val in fake_results.items():
        if key.lower() in query.lower():
            return val
    return f"搜索 '{query}' 未找到结果"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式。
    
    适用于:
    - 加减乘除、幂运算
    - 复杂数学公式
    
    Args:
        expression: 数学表达式,如 '3 + 5 * 2', '2 ** 10'
    """
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except Exception as e:
        return f"计算失败: {e}"

@tool
def get_weather(city: str) -> str:
    """获取城市天气。
    
    Args:
        city: 城市名,如 '北京'
    """
    weather_db = {"北京": "晴,25 度", "上海": "多云,28 度", "广州": "雨,30 度"}
    return weather_db.get(city, f"未找到 {city} 的天气信息")


# ===== Agent 创建 =====
def create_agent():
    """创建一个搜索+计算 Agent"""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    tools = [search, calculate, get_weather]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """你是一个能调用工具的助手。
根据用户问题,选择合适的工具:
- search: 查询网上信息
- calculate: 数学计算
- get_weather: 查询天气

如果一个问题需要多个步骤,可以多次调用工具。"""),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=8,
        handle_parsing_errors=True,
    )


# ===== 使用 =====
if __name__ == "__main__":
    agent = create_agent()
    
    # 测试 1: 简单搜索
    print("=" * 50)
    print("测试 1: 搜索")
    result = agent.invoke({"input": "LangChain 是什么?"})
    print("答案:", result["output"])
    
    # 测试 2: 多步推理
    print("\\n" + "=" * 50)
    print("测试 2: 多步推理")
    result = agent.invoke({"input": "北京天气怎么样?然后把温度乘以 2 是多少?"})
    print("答案:", result["output"])
    
    # 测试 3: 纯计算
    print("\\n" + "=" * 50)
    print("测试 3: 纯计算")
    result = agent.invoke({"input": "计算 2 的 10 次方"})
    print("答案:", result["output"])
\`\`\`

### 44.10 工具调用失败的错误处理

生产环境工具会失败(网络超时、API 报错),要稳健处理:

\`\`\`python
from langchain_core.tools import ToolException

@tool
def search_safe(query: str) -> str:
    """搜索(带错误处理)"""
    try:
        # 调用搜索 API
        result = call_search_api(query)
        if not result:
            raise ToolException("搜索结果为空,可能是关键词太宽泛")
        return result
    except TimeoutError:
        raise ToolException("搜索超时,请稍后再试或换关键词")
    except Exception as e:
        raise ToolException(f"搜索失败: {e}")

# AgentExecutor 配置:工具出错不让 Agent 崩溃
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_tool_error=True,  # 工具错误时把错误信息返回给 LLM,让 LLM 决定下一步
)
\`\`\`

### 44.11 易错点小结

| 易错点 | 现象 | 解决方案 |
|--------|------|---------|
| 工具 docstring 写得差 | LLM 不调工具或调错 | 详细描述用途、参数、返回 |
| 不设 max_iterations | 死循环烧钱 | 5-10 步上限 |
| 不开 handle_parsing_errors | 一个解析错误就崩 | 生产环境必须开 |
| PythonREPLTool 没沙箱 | 代码注入风险 | Docker 隔离或不用 |
| 用 ReAct 文本协议 | 解析失败率高 | 改用 tool_calling_agent |
| return_direct 用错 | LLM 没加工就返回,答案不连贯 | 只在工具输出即最终答案时用 |
| 工具名重复 | Agent 调用混淆 | 工具名要唯一 |
| 工具参数过多 | LLM 传错参数 | 用 StructuredTool + Pydantic 明确 schema |
| 没监控 token 消耗 | 一次任务烧很多钱 | 加 token 计数和告警 |

> **小结**:LangChain Agent 把"手写 Agent"的繁琐封装成 \`create_xxx_agent + AgentExecutor\` 几行代码。但易用性背后是大量的工程考量:工具描述、错误处理、终止控制、token 监控。会用 Agent 是入门,会调优 Agent 才是高手。`,
  },
];
