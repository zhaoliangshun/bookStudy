// =============================================================
// Python 人工智能开发教程 —— 第七批章节（自然语言处理组，共 5 章）
// =============================================================

export const chapters = [
  // =============================================================
  // 第1章：NLP基础概念与发展
  // =============================================================
  {
    id: "aipy-nlp-intro",
    icon: "💬",
    group: "自然语言处理",
    title: "NLP基础概念与发展",
    content: `
# NLP基础概念与发展

## 引言：让机器理解人类语言

自然语言处理（Natural Language Processing，简称 NLP）是人工智能领域中最具挑战性、也最贴近人类日常生活的方向之一。它研究如何让计算机能够理解、解释、生成人类使用的自然语言（如中文、英文、日文），从而实现人机之间更加自然、流畅的交流。

与结构化数据（数据库表、Excel 表格）不同，自然语言是人类经过数千年演化形成的符号系统，它充满歧义、隐喻、上下文依赖和文化背景。同一句话在不同场景下可能有完全不同的含义；同一个词在不同语境下指向不同的事物。这种"开放性"和"创造性"使得 NLP 成为 AI 界的"皇冠问题"。

本章将从历史脉络、任务分类、核心术语三个维度，带读者系统认识 NLP 这门学科。理解这些基础概念，是后续学习分词、词向量、Transformer、大语言模型等具体技术的必要前提。

## 一、什么是自然语言处理

### 1.1 定义与目标

自然语言处理是计算机科学、人工智能、语言学的交叉学科，其目标是让计算机能够：

- **理解**：从文本或语音中抽取意义，包括识别实体、关系、事件、情感、意图等。
- **生成**：根据给定的语义或上下文，产生符合语法、连贯自然的语言。
- **翻译**：在不同语言之间转换意义，保留语义与风格。
- **对话**：与人类进行多轮自然交互，理解上下文并做出恰当回应。

NLP 的"自然"二字，是相对于"人工语言"（如 Python、C++、SQL 等编程语言）而言的。编程语言是人为设计的、语法严格、无歧义的；自然语言则是人类演化出来的、灵活多变、充满歧义的。

### 1.2 NLP 的两大支柱

NLP 通常被划分为两个核心子领域：

**自然语言理解（Natural Language Understanding，NLU）**：让机器"听懂/读懂"。包括词法分析、句法分析、语义分析、情感分析、意图识别。NLU 关注的是从表层文字到底层意义的映射。

**自然语言生成（Natural Language Generation，NLG）**：让机器"说话/写作"。从结构化信息或语义表示出发，生成符合人类语言习惯的文本。例如天气播报、新闻摘要、广告文案自动生成。

现代 NLP 系统往往同时包含 NLU 和 NLG。比如 ChatGPT 在回答问题时，先要"理解"用户的提问（NLU），再"生成"合适的回答（NLG）。

### 1.3 为什么 NLP 很难

自然语言之所以难以处理，主要源于以下几个特性：

**歧义性**：同一句话可以有多种解释。例如"我看到他拿着望远镜"——是我用望远镜看到他，还是他手里拿着望远镜？"咬死了猎人的狗"——是狗咬死了猎人，还是猎人的狗被咬死？这种结构歧义在中文里尤其常见。

**上下文依赖**：词义、句义往往取决于上下文。"苹果"在水果店里是水果，在科技公司名单里是公司，在股票行情里是股票代码。"他昨天还没来"中的"昨天"指哪一天，需要看说话时间。

**开放性**：新词、新义不断产生。"绝绝子"、"yyds"、"AI 大模型"这些词在十年前并不存在。语言是活的，会随着社会发展不断变化。

**非规范性**：真实文本充满错别字、口语化、语法错误。社交媒体文本尤其如此，比如"哈哈哈哈好的呢"这种表达对机器来说极难解析。

**文化与常识依赖**：理解一句话往往需要世界知识。"他是个诸葛亮"——你需要知道诸葛亮是谁；"今晚月色真美"——你需要知道这是日本文学中的含蓄表白。

## 二、NLP 发展史

了解 NLP 的发展历程，能帮助我们理解当前技术的来龙去脉，也能预判未来可能的方向。NLP 的发展大致可以分为四个阶段。

### 2.1 规则时代（1950s-1980s）

早期的 NLP 主要依赖语言学专家手工编写规则。代表性工作包括：

- **1950 年**：图灵提出"图灵测试"，认为机器若能与人对话而不被识破，即可视为具有智能。
- **1954 年**：乔治城-IBM 实验，用 250 个词和 6 条语法规则进行俄英机器翻译，引发对机器翻译的乐观预期。
- **1966 年**：MIT 的 Weizenbaum 开发了 ELIZA，一个基于模式匹配的"心理治疗师"对话程序。它能用简单的替换规则模仿心理咨询师的对话，令人惊讶地让用户产生"被理解"的错觉。
- **1970s**：基于规则的专家系统盛行，如 SHRDLU 可以在一个虚拟的"积木世界"中理解并执行自然语言指令。

但规则方法很快遇到了瓶颈：规则数量爆炸、无法覆盖语言的所有现象、维护成本高、跨领域迁移困难。1966 年的 ALPAC 报告指出机器翻译进展缓慢，导致美国大幅削减 NLP 研究经费，进入了所谓的"NLP 寒冬"。

### 2.2 统计时代（1990s-2010s）

90 年代起，随着计算机算力提升和大规模语料库的出现，统计方法逐渐取代规则方法成为主流。核心思想是：从大规模语料中统计语言现象的概率分布，用概率模型解决歧义问题。

代表性技术：

- **隐马尔可夫模型（HMM）**：用于词性标注、命名实体识别。
- **条件随机场（CRF）**：比 HMM 更灵活的序列标注模型，长期统治分词与 NER 任务。
- **n-gram 语言模型**：用前 n-1 个词预测第 n 个词，是统计语言模型的基石。
- **IBM 模型**：基于平行语料的统计机器翻译模型。
- **TF-IDF + 朴素贝叶斯/SVM**：文本分类的经典组合。

统计方法的优势在于：可以从数据中自动学习规律，无需手工编写规则；性能可以通过增加数据持续提升。但统计模型通常假设特征之间独立（如朴素贝叶斯），难以捕捉长距离依赖；特征工程仍然需要人工设计。

### 2.3 深度学习时代（2013-2017）

2013 年，Word2Vec 问世，标志着 NLP 进入深度学习时代。神经网络能够自动学习词的分布式表示（词向量），避免了繁琐的特征工程。

关键节点：

- **2013 年 Word2Vec**：Mikolov 提出用浅层神经网络学习词向量，词与词之间的语义关系可以用向量运算表达（如 king - man + woman ≈ queen）。
- **2014 年 Seq2Seq**：Sutskever 等人提出用 Encoder-Decoder 架构做机器翻译，端到端学习从源语言到目标语言的映射。
- **2015 年 Attention**：Bahdanau 等人在 Seq2Seq 基础上引入注意力机制，让解码器动态关注输入序列的不同部分，大幅提升长句翻译质量。
- **2015 年 LSTM/GRU**：长短期记忆网络和门控循环单元成为处理序列的主力，缓解了 RNN 的梯度消失问题。
- **2018 年前 BERT 之前**：ELMo、ULMFiT 等基于双向 LSTM 的预训练模型出现，预训练 + 微调范式初现雏形。

深度学习的优势：自动特征学习、端到端训练、性能突破。劣势：需要大量标注数据、计算资源消耗大、模型可解释性差。

### 2.4 大模型时代（2018 至今）

2018 年，Google 发布 BERT，开启了大语言模型（LLM）的新纪元。随后 GPT 系列不断刷新记录：GPT-2（2019）、GPT-3（2020）、GPT-3.5/ChatGPT（2022）、GPT-4（2023）。这些模型参数从亿级跃升到千亿级，展现出惊人的"涌现能力"。

大模型时代的特点：

- **预训练 + 提示**：通过 Prompt 引导模型完成下游任务，无需再训练。
- **统一架构**：Transformer 几乎统一了所有 NLP 任务的处理方式。
- **In-Context Learning**：模型能从上下文中的几个示例学习新任务。
- **多模态融合**：GPT-4V、Gemini 等开始融合语言、图像、音频。
- **Agent 化**：LLM 不只是"回答问题"，还能调用工具、规划任务、自主执行。

## 三、NLP 任务分类

NLP 任务可以从输入到输出的角度进行分类，下面按层次梳理。

### 3.1 词法层任务

**分词（Word Segmentation）**：将连续的文本切分为词。英文天然用空格分隔，分词简单；中文没有空格，需要专门算法。例如"自然语言处理" → ["自然", "语言", "处理"]。

**词性标注（Part-of-Speech Tagging, POS）**：为每个词标注词性，如名词、动词、形容词。例如"我/代词 爱/动词 北京/名词"。

**命名实体识别（Named Entity Recognition, NER）**：识别文本中的人名、地名、机构名、时间等实体。例如"马云于 1999 年在杭州创立阿里巴巴" → 人名：马云；时间：1999 年；地名：杭州；机构：阿里巴巴。

### 3.2 句法层任务

**句法分析（Syntactic Parsing）**：分析句子的语法结构，构建句法树。包括 constituency parsing（成分句法）和 dependency parsing（依存句法）。

**依存分析**：识别词与词之间的修饰关系，如主谓、动宾、定中。

### 3.3 语义层任务

**词义消歧（Word Sense Disambiguation）**：确定多义词在具体语境下的含义。例如"bank"在 river bank 中是"河岸"，在 bank account 中是"银行"。

**语义角色标注（Semantic Role Labeling）**：识别句子中的"谁对谁做了什么"，标注施事、受事、时间、地点等语义角色。

**文本蕴含（Textual Entailment）**：判断一句话是否能从另一句话推出。例如"小明在跑步" → "小明在运动"是蕴含关系。

### 3.4 篇章层任务

**文本分类（Text Classification）**：把文本归到预设类别。垃圾邮件检测、新闻分类、情感分析都属于此类。

**文本摘要（Text Summarization）**：抽取式（从原文中选关键句）或生成式（用自己的话重写）。

**机器翻译（Machine Translation）**：将一种语言翻译成另一种语言。

**问答系统（Question Answering）**：根据问题从知识库或文档中找答案。包括抽取式 QA、生成式 QA。

**对话系统（Dialog System）**：与人多轮对话。包括任务型对话（订机票、查天气）和开放域对话（闲聊）。

### 3.5 应用层任务

**信息抽取（Information Extraction）**：从非结构化文本中抽取结构化信息，包括 NER、关系抽取、事件抽取。

**情感分析（Sentiment Analysis）**：判断文本的情感倾向（正面/负面/中性）或情感强度。

**推荐与检索**：搜索引擎、智能客服、文档检索的核心技术。

## 四、中文 NLP 的特殊性

相较于英文，中文 NLP 有许多独特挑战：

**无空格分隔**：分词是中文 NLP 的第一步，也是难点。"南京市长江大桥"可以切分为"南京市/长江大桥"（地名）或"南京市长/江大桥"（人名），需要语义判断。

**歧义切分**：如"结婚的和尚未结婚的" → "结婚的/和/尚未/结婚的" 还是 "结婚的/和尚/未/结婚的"？

**新词识别**：网络新词、专业术语层出不穷，分词词典需要持续更新。

**缺乏形态变化**：中文动词不分时态、不分人称，需要通过上下文理解时间信息。

**古文与白话并存**：古汉语与现代汉语差异巨大，处理古籍需要专门的模型。

## 五、NLP 的核心评估指标

不同任务有不同评估指标，下面列出常见的几种：

**准确率（Accuracy）**：分类任务中预测正确的比例。
**精确率（Precision）与召回率（Recall）**：信息检索和 NER 常用，F1 是两者的调和平均。
**BLEU**：机器翻译指标，比较生成译文与参考译文的 n-gram 重合度。
**ROUGE**：文本摘要指标，关注召回率。
**Perplexity（困惑度）**：语言模型评估指标，越低越好。
**Human Eval**：大模型时代常用人工评估或 LLM-as-judge。

## 六、本章小结

NLP 是让机器理解与生成人类语言的科学，它经历了规则、统计、深度学习、大模型四个阶段。NLP 任务涵盖词法、句法、语义、篇章、应用五个层次，每个层次都有其独特挑战。中文 NLP 因其无空格、歧义多、新词快的特点，对算法提出了更高要求。

下一章我们将进入具体的实战，学习文本预处理技术——分词、停用词、词干化、TF-IDF，这些是任何 NLP 项目的基石。
`,
    code: `
# =============================================================
# 第1章代码：NLP 基础演示（纯标准库实现）
# =============================================================
# 本代码用纯 Python（不依赖 jieba/nltk/sklearn）演示：
# 1. 中文分词（前向最大匹配算法）
# 2. 词频统计
# 3. 词性标注（基于词典的简单规则）
# 4. 命名实体识别（基于词典 + 规则）
# 5. 简单的句法结构分析（依存关系示意）

import re
from collections import Counter


# -------------------------------------------------------------
# 一、前向最大匹配（FMM）中文分词
# -------------------------------------------------------------
# 思路：从左到右扫描文本，每次尽量匹配词典中最长的词
# 这是规则时代中文分词的经典算法，简单但有效
class FMMSegmenter:
    """前向最大匹配中文分词器"""

    def __init__(self, word_dict, max_len=5):
        """
        :param word_dict: 词典，set 形式
        :param max_len: 最大词长，决定每次最多匹配几个字
        """
        self.word_dict = set(word_dict)
        self.max_len = max_len

    def segment(self, text):
        """对文本进行分词"""
        result = []
        i = 0
        while i < len(text):
            # 从最大长度开始尝试匹配
            matched = False
            for length in range(min(self.max_len, len(text) - i), 0, -1):
                word = text[i:i + length]
                if word in self.word_dict:
                    result.append(word)
                    i += length
                    matched = True
                    break
            if not matched:
                # 单字成词（未登录词处理）
                result.append(text[i])
                i += 1
        return result


# 构造一个简单的中文词典
chinese_dict = [
    "我", "你", "他", "她", "我们", "你们", "他们",
    "爱", "喜欢", "是", "在", "去", "来", "看", "买",
    "北京", "上海", "杭州", "南京", "南京市", "市长", "长江", "大桥", "长江大桥",
    "自然", "语言", "处理", "自然语言", "自然语言处理",
    "机器", "学习", "机器学习", "深度", "学习",
    "苹果", "手机", "电脑", "公司",
    "于", "创立", "成立", "年", "今天", "明天",
    "的", "了", "和", "与", "是",
    "人工智能", "大数据", "云计算",
]

segmenter = FMMSegmenter(chinese_dict, max_len=6)

# 测试分词
test_sentences = [
    "我爱北京",
    "自然语言处理是人工智能的重要分支",
    "南京市长江大桥",
    "他今天去杭州买苹果手机",
    "机器学习和深度学习都属于人工智能",
]

print("=" * 60)
print("【一】中文分词演示（前向最大匹配）")
print("=" * 60)
for sent in test_sentences:
    words = segmenter.segment(sent)
    print(f"原文：{sent}")
    print(f"分词：{' / '.join(words)}")
    print("-" * 60)


# -------------------------------------------------------------
# 二、词频统计
# -------------------------------------------------------------
# 词频是文本的最基本统计特征，反映文本主题
def word_frequency(words, top_n=10):
    """统计词频并返回前 top_n 个高频词"""
    counter = Counter(words)
    return counter.most_common(top_n)


# 对一段文本统计词频
paragraph = """
自然语言处理是人工智能的重要分支 自然语言处理研究让计算机理解人类语言
深度学习推动了自然语言处理的发展 机器学习是自然语言处理的基础
人工智能和自然语言处理都在快速发展
"""

# 分词后统计
all_words = []
for sent in paragraph.strip().split("。"):
    sent = sent.strip()
    if sent:
        all_words.extend(segmenter.segment(sent))

print("\\n" + "=" * 60)
print("【二】词频统计")
print("=" * 60)
print(f"全文共 {len(all_words)} 个词，去重后 {len(set(all_words))} 个")
print("高频词 Top 10：")
for word, count in word_frequency(all_words, 10):
    print(f"  {word}: {count} 次")


# -------------------------------------------------------------
# 三、简单的词性标注（基于词典）
# -------------------------------------------------------------
# 真实系统用 HMM/CRF/BERT，这里用最简单的词典查找演示概念
pos_dict = {
    "我": "代词", "你": "代词", "他": "代词", "她": "代词",
    "爱": "动词", "喜欢": "动词", "是": "动词", "去": "动词", "买": "动词",
    "北京": "地名", "上海": "地名", "杭州": "地名", "南京": "地名",
    "苹果": "名词", "手机": "名词", "电脑": "名词", "公司": "名词",
    "自然语言处理": "专有名词", "人工智能": "专有名词", "机器学习": "专有名词",
    "的": "助词", "了": "助词", "和": "连词", "与": "连词",
    "今天": "时间词", "明天": "时间词", "年": "时间词",
}

def pos_tag(words):
    """基于词典的简单词性标注"""
    return [(w, pos_dict.get(w, "未登录词")) for w in words]


print("\\n" + "=" * 60)
print("【三】词性标注（基于词典）")
print("=" * 60)
test_sent = "我今天去杭州买苹果手机"
words = segmenter.segment(test_sent)
tagged = pos_tag(words)
print(f"句子：{test_sent}")
for word, pos in tagged:
    print(f"  {word:8s} -> {pos}")


# -------------------------------------------------------------
# 四、命名实体识别（基于词典 + 规则）
# -------------------------------------------------------------
# 真实系统用 BILOU + CRF/BERT 序列标注
# 这里演示基于实体词典的简单识别
ner_dict = {
    "人名": ["马云", "马化腾", "李彦宏", "张三", "李四"],
    "地名": ["北京", "上海", "杭州", "深圳", "南京"],
    "机构": ["阿里巴巴", "腾讯", "百度", "字节跳动"],
    "时间": ["1999年", "2024年", "今天", "明天", "昨天"],
}

def recognize_entities(text):
    """基于词典的命名实体识别"""
    entities = []
    for entity_type, entity_list in ner_dict.items():
        for entity in entity_list:
            start = 0
            while True:
                idx = text.find(entity, start)
                if idx == -1:
                    break
                entities.append({"text": entity, "type": entity_type, "start": idx})
                start = idx + len(entity)
    # 按位置排序
    entities.sort(key=lambda x: x["start"])
    return entities


print("\\n" + "=" * 60)
print("【四】命名实体识别")
print("=" * 60)
ner_text = "马云于1999年在杭州创立阿里巴巴，马化腾在深圳创立腾讯"
entities = recognize_entities(ner_text)
print(f"文本：{ner_text}")
for ent in entities:
    print(f"  [{ent['type']}] {ent['text']} (位置：{ent['start']})")


# -------------------------------------------------------------
# 五、简单的依存关系分析（示意）
# -------------------------------------------------------------
# 真实依存分析用 Neural Parser（如 spaCy、Stanza）
# 这里用简单规则识别主谓宾结构
def simple_dependency(words, tagged):
    """识别简单的主谓宾结构"""
    deps = []
    subject = None
    predicate = None
    obj = None
    for word, pos in tagged:
        if pos == "代词" or pos == "名词":
            if subject is None:
                subject = word
            elif obj is None:
                obj = word
        elif pos == "动词":
            if predicate is None:
                predicate = word
    if subject:
        deps.append((subject, "主语"))
    if predicate:
        deps.append((predicate, "谓语"))
    if obj:
        deps.append((obj, "宾语"))
    return deps


print("\\n" + "=" * 60)
print("【五】简单依存分析（主谓宾结构识别）")
print("=" * 60)
test_sent = "我爱北京"
words = segmenter.segment(test_sent)
tagged = pos_tag(words)
deps = simple_dependency(words, tagged)
print(f"句子：{test_sent}")
for word, role in deps:
    print(f"  {word:8s} -> {role}")


# -------------------------------------------------------------
# 六、文本统计指标演示
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("【六】文本统计指标")
print("=" * 60)

sample_text = "自然语言处理是人工智能的重要分支，研究让计算机理解人类语言。"
# 字符级
chars = len(sample_text)
# 词级
words = segmenter.segment(sample_text.replace("，", "").replace("。", ""))
word_count = len(words)
unique_words = len(set(words))
# 类型token比（TTR）：词汇丰富度指标
ttr = unique_words / word_count if word_count > 0 else 0

print(f"文本：{sample_text}")
print(f"字符数：{chars}")
print(f"词数：{word_count}")
print(f"唯一词数：{unique_words}")
print(f"类型token比（TTR）：{ttr:.3f}")
print(f"平均词长：{sum(len(w) for w in words) / word_count:.2f}")

print("\\n" + "=" * 60)
print("演示完成！这些都是 NLP 最基础的入门任务。")
print("真实生产系统会使用 BERT/GPT 等大模型完成这些任务。")
print("=" * 60)
`,
  },

  // =============================================================
  // 第2章：文本预处理技术
  // =============================================================
  {
    id: "aipy-text-preprocess",
    icon: "✂️",
    group: "自然语言处理",
    title: "文本预处理技术",
    content: `
# 文本预处理技术

## 引言：垃圾进，垃圾出

在机器学习领域有一句名言：**Garbage In, Garbage Out（垃圾进，垃圾出）**。这句话在 NLP 中尤为贴切。无论你的模型多先进（BERT、GPT、LLaMA），如果输入的文本没有经过合理的预处理，模型就难以学到有意义的规律。

文本预处理是 NLP 流水线的第一道工序，它决定了后续所有环节的质量上限。一个未经处理的原始文本可能包含：HTML 标签、特殊符号、错别字、大小写混用、停用词、不同编码、过长或过短的句子。这些"噪声"如果不清洗，会污染模型的训练数据，导致性能下降。

本章将系统讲解文本预处理的核心技术：分词、停用词过滤、词干化与词形还原、文本向量化（TF-IDF）。这些都是任何 NLP 项目都无法绕过的基础设施。

## 一、文本清洗

### 1.1 为什么要清洗

原始文本数据通常来自网页爬取、API 接口、用户输入、扫描 OCR，会包含大量"杂质"：

- **HTML/XML 标签**：从网页抓取的文本带有 \`<div>\`、\`<p>\`、\`<a href="...">\` 等标签
- **特殊字符**：不可见字符、控制字符、emoji、全角半角混用
- **URL 与邮箱**：在文本分类中通常无意义，需要替换或删除
- **数字与标点**：根据任务决定是否保留
- **大小写**：英文 NLP 中通常统一小写化
- **编码问题**：UTF-8、GBK、Latin-1 等编码混用

### 1.2 清洗的常见操作

**大小写归一化**：英文中 "Apple"、"apple"、"APPLE" 通常是同一个词。统一为小写可以减少词表规模。

**去除 HTML 标签**：用正则 \`<[^>]+>\` 或专门的库（如 BeautifulSoup）去除。

**去除特殊字符**：保留中文、英文、数字，去除其他符号。但要注意任务相关：情感分析可能需要保留"！"、"？"等表达情感的标点。

**去除 URL/邮箱**：用正则匹配并替换为占位符（如 \`<URL>\`）或直接删除。

**全角半角统一**：中文文本中"１２３"（全角数字）需要转为"123"（半角）。

**繁简转换**：视任务而定，可以统一为简体或繁体。

## 二、分词算法

分词（Tokenization）是将连续文本切分为有意义单元的过程，是 NLP 的"第一道关"。

### 2.1 英文分词

英文天然以空格分隔单词，分词相对简单：

\`\`\`
"Hello, world!" -> ["Hello", "world"]
\`\`\`

但仍有细节：don't 要不要拆成 do n't？state-of-the-art 是一个词还是多个词？New York 是一个词还是两个词？这些需要根据任务决定。

### 2.2 中文分词算法

中文没有空格分隔，分词是核心难点。常见算法包括：

#### 2.2.1 最大匹配法（Maximum Matching）

这是规则时代最经典的分词算法，又分为前向最大匹配（FMM）和后向最大匹配（BMM）。

**前向最大匹配（FMM）**：从左到右扫描，每次取 max_len 个字，若在词典中则切分，否则减少一个字继续匹配。

**后向最大匹配（BMM）**：从右到左扫描，逻辑与 FMM 类似。

**双向最大匹配**：同时执行 FMM 和 BMM，选择切分结果中词数更少、单字更少的那个。

最大匹配法的优点：简单、速度快。缺点：依赖词典、无法处理未登录词、歧义处理能力弱。

#### 2.2.2 统计方法

**n-gram 模型**：基于大规模语料统计词的共现频率，选择概率最高的切分方式。

**HMM（隐马尔可夫模型）**：将分词建模为序列标注问题，每个字标注为 B（词首）、M（词中）、E（词尾）、S（单字词）。

**CRF（条件随机场）**：比 HMM 更强大的序列标注模型，可以考虑丰富的上下文特征。

#### 2.2.3 深度学习方法

**BiLSTM-CRF**：双向 LSTM 提取上下文特征，CRF 解码标签序列，是 BERT 之前的主流方案。

**BERT + CRF**：用预训练的 BERT 提取特征，再接 CRF 层，是当前工业界的高精度方案。

### 2.3 Jieba 分词器

Jieba 是 Python 中最流行的中文分词库，它结合了词典和统计方法：

- **精确模式**：最精确地切分句子，适合文本分析
- **全模式**：把所有可能的词都扫描出来，速度快但有冗余
- **搜索引擎模式**：在精确模式基础上再切分长词，适合搜索引擎

Jieba 的核心是基于前缀词典的高效分词 + 动态规划求解最大概率路径 + HMM 识别新词。

## 三、停用词

### 3.1 什么是停用词

停用词（Stop Words）是文本中出现频率很高、但对语义贡献很小的词。中文如"的、了、和、是、在、我、你"；英文如 "the、a、an、is、are、of、to"。

这些词在大多数 NLP 任务中需要过滤掉，因为：

- 它们出现频率太高，会稀释真正有意义的词的权重
- 它们对文本主题、情感、分类贡献小
- 过滤后可以减小词表规模，加速计算

### 3.2 何时该保留停用词

但停用词并非总是"无用"：

- **情感分析**："不"、"没"、"太"等否定/程度副词对情感判断至关重要
- **句法分析**：停用词常常承担语法功能，是依存关系的重要节点
- **机器翻译**：每个词都对应目标语言的某个表达
- **大模型时代**：BERT/GPT 等模型会自己学习停用词的作用，通常不需要预先过滤

## 四、词干化与词形还原

这两个概念主要针对英文等屈折语言，中文没有这个问题。

### 4.1 词干化（Stemming）

词干化是粗略地切掉词尾，把不同形式归为同一词根：

- running → run
- runs → run
- happily → happili
- better → bet

经典算法：Porter Stemmer、Snowball Stemmer、Lancaster Stemmer。

词干化速度快但可能产生非词（如 "happili" 不是英语单词）。

### 4.2 词形还原（Lemmatization）

词形还原是基于词典和词法学规则，把词归为词典中的原形：

- running → run（动词原形）
- better → good（形容词原级）
- mice → mouse（名词单数）
- were → be（动词原形）

词形还原更准确但需要词典支持，速度较慢。常用工具：WordNet Lemmatizer（NLTK）、spaCy。

### 4.3 何时使用

- 信息检索、文本分类：词干化足够，速度快
- 语义分析、问答系统：词形还原更准确
- 中文 NLP：不需要这两个操作

## 五、TF-IDF 原理

### 5.1 从词频说起

最直观的文本表示是**词袋模型（Bag of Words, BoW）**：把文本表示成词频向量，每个维度对应一个词，值为该词在文本中出现的次数。

例如，词表为 ["自然", "语言", "处理", "机器", "学习"]：
- 文档1 "自然语言处理" → [1, 1, 1, 0, 0]
- 文档2 "机器学习与自然语言" → [1, 1, 0, 1, 1]

但词频有个问题：常见词（"的"、"是"、"在"）的词频很高，会主导向量，淹没真正有区分度的词。

### 5.2 TF-IDF 公式

TF-IDF（Term Frequency - Inverse Document Frequency）通过引入"逆文档频率"来修正这个问题。

**词频 TF**：词 t 在文档 d 中出现的频率
$$TF(t, d) = \\frac{\\text{词 } t \\text{ 在 } d \\text{ 中出现次数}}{\\text{文档 } d \\text{ 的总词数}}$$

**逆文档频率 IDF**：衡量词的"独特性"
$$IDF(t) = \\log\\frac{\\text{文档总数}}{\\text{包含词 } t \\text{ 的文档数} + 1}$$

- 如果一个词在所有文档中都出现（如"的"），IDF 接近 0，权重被压制
- 如果一个词只在少数文档中出现，IDF 大，权重大

**TF-IDF**：
$$TF\\text{-}IDF(t, d) = TF(t, d) \\times IDF(t)$$

### 5.3 直观理解

考虑以下三篇文档：
- 文档1："自然语言处理很有趣"
- 文档2："机器学习很有趣"
- 文档3："自然语言处理与机器学习"

词"自然"只在文档1、3出现，是有区分度的词，IDF 较高。
词"很有趣"在文档1、2都出现，区分度中等。
词"自然语言处理"集中出现在文档1、3，能很好地区分这两篇与其他文档。

TF-IDF 通过这种"局部频率 × 全局稀缺性"的组合，自动给有区分度的词更高权重。

### 5.4 TF-IDF 的应用

- **文本分类**：把 TF-IDF 向量输入朴素贝叶斯、SVM 等分类器
- **信息检索**：查询词与文档的 TF-IDF 向量计算相似度，排序结果
- **关键词抽取**：选 TF-IDF 最高的几个词作为文档关键词
- **文本聚类**：TF-IDF 向量 + KMeans 等聚类算法

### 5.5 TF-IDF 的局限

- **无序性**：词袋模型丢失了词序信息，"猫追狗"和"狗追猫"的向量相同
- **无语义**：词与词之间独立，"猫"和"小狗"的语义相似性无法体现
- **稀疏性**：词表大时向量稀疏，存储和计算开销大
- **无法处理未登录词**：词表外的词无法表示

这些局限正是后续词向量（Word2Vec）、上下文向量（BERT）要解决的问题。

## 六、完整的预处理流程

一个典型的 NLP 预处理流水线：

1. **原始文本** → 读取数据
2. **文本清洗** → 去 HTML、特殊字符、统一大小写
3. **分词** → 用 Jieba 等工具切词
4. **停用词过滤** → 删除"的、了、是"
5. **词干化/词形还原**（英文）→ 归一化词形
6. **向量化** → TF-IDF / Word2Vec / BERT
7. **输入模型** → 训练或推理

每一步都需要根据任务调整：情感分析保留否定词，文本摘要可能不需要去除标点，机器翻译保留所有信息。

## 七、本章小结

文本预处理是 NLP 的基石。本章介绍了清洗、分词（最大匹配、Jieba）、停用词、词干化与词形还原、TF-IDF 这一系列核心技术。其中 TF-IDF 是统计时代文本表示的巅峰之作，理解它是理解后续词向量、注意力机制的必要基础。

下一章我们将进入词向量世界，看 Word2Vec 如何用神经网络学习词的语义表示，开启深度学习 NLP 的新纪元。
`,
    code: `
# =============================================================
# 第2章代码：文本预处理技术（纯标准库实现）
# =============================================================
# 本代码用纯 Python（不依赖 jieba/sklearn/nltk）演示：
# 1. 文本清洗（去标签、统一大小写、去特殊字符）
# 2. 双向最大匹配分词
# 3. 停用词过滤
# 4. 词干化（Porter 算法简化版）
# 5. TF-IDF 完整实现
# 6. 基于 TF-IDF 的关键词抽取与文本相似度

import re
import math
from collections import Counter, defaultdict


# -------------------------------------------------------------
# 一、文本清洗
# -------------------------------------------------------------
def clean_text(text, lowercase=True, remove_html=True, remove_url=True):
    """通用文本清洗函数"""
    # 去 HTML 标签
    if remove_html:
        text = re.sub(r'<[^>]+>', '', text)
    # 去 URL
    if remove_url:
        text = re.sub(r'https?://\\S+', '<URL>', text)
        text = re.sub(r'\\b\\w+@\\w+\\.\\w+\\b', '<EMAIL>', text)
    # 去特殊字符（保留中文、英文、数字、基本标点）
    text = re.sub(r'[^\\u4e00-\\u9fa5a-zA-Z0-9\\s,.!?;:\\-\\(\\)<>""]', '', text)
    # 统一大小写
    if lowercase:
        text = text.lower()
    # 去多余空白
    text = re.sub(r'\\s+', ' ', text).strip()
    return text


print("=" * 60)
print("【一】文本清洗演示")
print("=" * 60)
raw_text = '<p>Hello World! 访问 https://example.com 或 email@test.com</p>'
cleaned = clean_text(raw_text)
print(f"原文：{raw_text}")
print(f"清洗：{cleaned}")


# -------------------------------------------------------------
# 二、双向最大匹配分词
# -------------------------------------------------------------
class BiMaxMatchSegmenter:
    """双向最大匹配中文分词"""

    def __init__(self, word_dict, max_len=5):
        self.word_dict = set(word_dict)
        self.max_len = max_len

    def fmm(self, text):
        """前向最大匹配"""
        result = []
        i = 0
        while i < len(text):
            matched = False
            for length in range(min(self.max_len, len(text) - i), 0, -1):
                word = text[i:i + length]
                if word in self.word_dict:
                    result.append(word)
                    i += length
                    matched = True
                    break
            if not matched:
                result.append(text[i])
                i += 1
        return result

    def bmm(self, text):
        """后向最大匹配"""
        result = []
        i = len(text)
        while i > 0:
            matched = False
            for length in range(min(self.max_len, i), 0, -1):
                word = text[i - length:i]
                if word in self.word_dict:
                    result.insert(0, word)
                    i -= length
                    matched = True
                    break
            if not matched:
                result.insert(0, text[i - 1])
                i -= 1
        return result

    def segment(self, text):
        """双向匹配，选择切分词数少、单字少的那个"""
        fmm_result = self.fmm(text)
        bmm_result = self.bmm(text)
        # 评估：词数少、单字少者胜出
        fmm_single = sum(1 for w in fmm_result if len(w) == 1)
        bmm_single = sum(1 for w in bmm_result if len(w) == 1)
        if len(fmm_result) < len(bmm_result):
            return fmm_result
        elif len(bmm_result) < len(fmm_result):
            return bmm_result
        else:
            return fmm_result if fmm_single < bmm_single else bmm_result


word_dict = [
    "我", "你", "他", "我们", "你们", "他们",
    "爱", "喜欢", "是", "在", "去", "看", "买",
    "北京", "上海", "杭州", "南京", "市长", "长江", "大桥", "长江大桥",
    "自然", "语言", "处理", "自然语言", "自然语言处理",
    "机器", "学习", "机器学习", "深度", "学习",
    "结婚", "和尚", "尚未", "未结婚",
    "的", "和", "与", "了",
]

segmenter = BiMaxMatchSegmenter(word_dict, max_len=5)

print("\\n" + "=" * 60)
print("【二】双向最大匹配分词")
print("=" * 60)
test_sentences = [
    "南京市长江大桥",
    "结婚的和尚未结婚的",
    "我爱自然语言处理",
    "机器学习与深度学习",
]
for sent in test_sentences:
    fmm = segmenter.fmm(sent)
    bmm = segmenter.bmm(sent)
    bi = segmenter.segment(sent)
    print(f"原文：{sent}")
    print(f"  FMM：{' / '.join(fmm)}")
    print(f"  BMM：{' / '.join(bmm)}")
    print(f"  双向：{' / '.join(bi)}")
    print("-" * 60)


# -------------------------------------------------------------
# 三、停用词过滤
# -------------------------------------------------------------
# 中文常用停用词表（简化版）
stopwords = {
    "的", "了", "和", "与", "是", "在", "我", "你", "他", "她",
    "我们", "你们", "他们", "也", "都", "就", "还", "又", "再",
    "把", "被", "让", "使", "对", "向", "从", "到", "于",
    "这", "那", "这个", "那个", "这些", "那些",
    "一", "二", "三", "个", "种", "些",
    "什么", "怎么", "为什么", "哪里", "谁",
}

def remove_stopwords(words):
    """过滤停用词"""
    return [w for w in words if w not in stopwords]


print("\\n" + "=" * 60)
print("【三】停用词过滤")
print("=" * 60)
text = "我爱自然语言处理，自然语言处理是人工智能的重要分支"
words = segmenter.segment(text.replace("，", "").replace("。", ""))
filtered = remove_stopwords(words)
print(f"原文：{text}")
print(f"分词：{' / '.join(words)}")
print(f"去停用词后：{' / '.join(filtered)}")


# -------------------------------------------------------------
# 四、词干化（Porter Stemmer 简化版）
# -------------------------------------------------------------
# 仅演示原理，真实 Porter 算法有大量规则
class SimpleStemmer:
    """英文词干化简化实现"""

    def stem(self, word):
        # 处理复数
        if word.endswith('ies') and len(word) > 4:
            return word[:-3] + 'y'
        if word.endswith('es') and len(word) > 3:
            return word[:-2]
        if word.endswith('s') and not word.endswith('ss') and len(word) > 2:
            return word[:-1]
        # 处理过去式
        if word.endswith('ed') and len(word) > 3:
            return word[:-2]
        # 处理进行时
        if word.endswith('ing') and len(word) > 4:
            return word[:-3]
        return word


print("\\n" + "=" * 60)
print("【四】词干化（简化 Porter）")
print("=" * 60)
stemmer = SimpleStemmer()
english_words = ["running", "runs", "ran", "easily", "fairly",
                 "studies", "studying", "studied", "cats", "dogs",
                 "happiness", "quickly"]
for w in english_words:
    print(f"  {w:15s} -> {stemmer.stem(w)}")


# -------------------------------------------------------------
# 五、TF-IDF 完整实现
# -------------------------------------------------------------
class TfidfVectorizer:
    """纯 Python 实现的 TF-IDF 向量化器"""

    def __init__(self):
        self.vocabulary = {}  # 词到索引的映射
        self.idf = {}  # 词的 IDF 值

    def fit(self, documents):
        """
        从文档集合学习词表和 IDF
        :param documents: 已分词的文档列表，每个文档是词列表
        """
        # 构建词表
        all_words = set()
        for doc in documents:
            all_words.update(doc)
        self.vocabulary = {word: idx for idx, word in enumerate(sorted(all_words))}

        # 计算 IDF
        n_docs = len(documents)
        df = Counter()  # 文档频率
        for doc in documents:
            for word in set(doc):  # 每个文档每个词只计一次
                df[word] += 1

        for word, idx in self.vocabulary.items():
            # IDF = log(N / (df + 1))，+1 是平滑
            self.idf[word] = math.log(n_docs / (df[word] + 1)) + 1

        return self

    def transform(self, documents):
        """将文档转换为 TF-IDF 向量"""
        vectors = []
        for doc in documents:
            vec = [0.0] * len(self.vocabulary)
            tf = Counter(doc)
            total = len(doc) if doc else 1
            for word, count in tf.items():
                if word in self.vocabulary:
                    idx = self.vocabulary[word]
                    tf_val = count / total
                    vec[idx] = tf_val * self.idf[word]
            # L2 归一化
            norm = math.sqrt(sum(v * v for v in vec))
            if norm > 0:
                vec = [v / norm for v in vec]
            vectors.append(vec)
        return vectors

    def get_feature_names(self):
        """返回词表"""
        return sorted(self.vocabulary.keys(), key=lambda w: self.vocabulary[w])


# 准备语料
corpus_raw = [
    "自然语言处理是人工智能的重要分支",
    "机器学习是人工智能的核心技术",
    "深度学习推动了自然语言处理的发展",
    "人工智能包括机器学习和深度学习",
    "自然语言处理研究让计算机理解人类语言",
]

# 分词
corpus = []
for doc in corpus_raw:
    # 简单按字符切（无词典时），这里我们用前面的分词器
    words = segmenter.segment(doc)
    words = remove_stopwords(words)
    corpus.append(words)

print("\\n" + "=" * 60)
print("【五】TF-IDF 实现")
print("=" * 60)
print("语料：")
for i, (raw, words) in enumerate(zip(corpus_raw, corpus)):
    print(f"  D{i+1}: {raw}")
    print(f"      分词后：{' / '.join(words)}")

# 训练 TF-IDF
vectorizer = TfidfVectorizer()
vectorizer.fit(corpus)
tfidf_matrix = vectorizer.transform(corpus)

# 打印 IDF
print("\\n词表 IDF 值：")
for word in sorted(vectorizer.idf.keys(), key=lambda w: vectorizer.idf[w]):
    print(f"  {word:8s} IDF = {vectorizer.idf[word]:.4f}")

# 打印第一篇文档的 TF-IDF
print("\\n文档 D1 的 TF-IDF 向量（非零项）：")
feature_names = vectorizer.get_feature_names()
for word, val in zip(feature_names, tfidf_matrix[0]):
    if val > 0:
        print(f"  {word:8s} TF-IDF = {val:.4f}")


# -------------------------------------------------------------
# 六、关键词抽取与文本相似度
# -------------------------------------------------------------
def extract_keywords(tfidf_vector, feature_names, top_n=3):
    """基于 TF-IDF 抽取关键词"""
    word_scores = list(zip(feature_names, tfidf_vector))
    word_scores.sort(key=lambda x: x[1], reverse=True)
    return word_scores[:top_n]


def cosine_similarity(vec1, vec2):
    """计算两个向量的余弦相似度"""
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)


print("\\n" + "=" * 60)
print("【六】关键词抽取")
print("=" * 60)
for i, vec in enumerate(tfidf_matrix):
    kws = extract_keywords(vec, feature_names, top_n=3)
    print(f"文档 D{i+1} 关键词：")
    for word, score in kws:
        print(f"  {word:8s} (TF-IDF: {score:.4f})")

print("\\n" + "=" * 60)
print("【七】文本相似度（余弦相似度）")
print("=" * 60)
print("文档间相似度矩阵：")
print("       ", "  ".join(f"D{i+1}" for i in range(len(corpus))))
for i in range(len(corpus)):
    sims = []
    for j in range(len(corpus)):
        sim = cosine_similarity(tfidf_matrix[i], tfidf_matrix[j])
        sims.append(f"{sim:.2f}")
    print(f"D{i+1}   ", "  ".join(sims))

print("\\n观察：D1 与 D3 都涉及'自然语言处理'，相似度较高")
print("     D2 与 D4 都涉及'机器学习'，相似度较高")

print("\\n" + "=" * 60)
print("演示完成！TF-IDF 是统计时代 NLP 的核心文本表示方法。")
print("=" * 60)
`,
  },

  // =============================================================
  // 第3章：词向量与 Word2Vec
  // =============================================================
  {
    id: "aipy-word2vec",
    icon: "🔢",
    group: "自然语言处理",
    title: "词向量与Word2Vec",
    content: `
# 词向量与Word2Vec

## 引言：从符号到向量

在 TF-IDF 时代，每个词被表示为一个 one-hot 向量：词表大小为 V，第 i 个词的向量是长度为 V 的向量，第 i 位是 1，其余是 0。这种表示有三个致命缺陷：

**维度灾难**：词表通常有几万到几十万，one-hot 向量维度极高，存储和计算开销巨大。

**无语义**：任何两个词的 one-hot 向量都是正交的，"猫"和"狗"的相似度与"猫"和"汽车"完全一样，无法表达语义关系。

**稀疏性**：每个向量只有一个 1，其余全 0，稀疏到无法学习有效的统计模式。

词向量（Word Embedding）的核心思想是：**用一个低维、稠密的实数向量表示每个词**，让语义相近的词在向量空间中距离相近。这一思想的代表之作就是 2013 年 Mikolov 等人提出的 **Word2Vec**。

Word2Vec 的出现是 NLP 的分水岭。它让"词的语义"第一次可以被数学计算——\`king - man + woman ≈ queen\` 这种"语义等式"成为可能。从此 NLP 进入深度学习时代，词向量成为所有神经 NLP 模型的输入基础。

## 一、分布式假设

词向量的理论基础是 1957 年 Firth 提出的"分布式假设"：

> "You shall know a word by the company it keeps."（一个词的含义由它周围的词决定）

例如，"猫"和"狗"经常出现在相似的上下文中（"我养了一只___"、"___在吃东西"），所以它们的语义相近。"北京"和"上海"经常出现在相似的上下文中（"___的天气"、"去___出差"），所以它们语义相近。

Word2Vec 正是基于这一假设：通过预测词的上下文（或被上下文预测），让模型自动学习到词的语义表示。

## 二、Word2Vec 的两种架构

Word2Vec 有两种模型架构：CBOW 和 Skip-gram。

### 2.1 CBOW（Continuous Bag-of-Words）

CBOW 的思路是：**用上下文预测中心词**。

例如句子 "the cat sits on the mat"，窗口大小为 2 时：
- 中心词 "sits"，上下文是 ["the", "cat", "on", "the"]
- 输入：["the", "cat", "on", "the"] 的词向量平均
- 输出：预测 "sits"

CBOW 的优点是：上下文多个词平均后，预测目标更稳定，训练速度快。缺点是：对低频词的学习效果较差（低频词作为中心词出现次数少）。

### 2.2 Skip-gram

Skip-gram 的思路是：**用中心词预测上下文**。

同样的句子：
- 中心词 "sits"，要预测上下文 ["the", "cat", "on", "the"]
- 输入："sits" 的词向量
- 输出：分别预测上下文中的每个词

Skip-gram 的优点是：每个中心词可以产生多个训练样本（每个上下文词一个），对低频词的学习更充分。缺点是：训练样本多，训练速度比 CBOW 慢。

### 2.3 选择哪种

实践中：

- **小数据集 + 高频词**：CBOW 更稳定
- **大数据集 + 低频词**：Skip-gram 更好
- **默认选择**：Skip-gram（Google 官方默认）

Mikolov 在原始论文中报告 Skip-gram 在语义任务上表现更好，但训练时间约为 CBOW 的 2-3 倍。

## 三、模型结构

Word2Vec 的模型结构非常简单，只有两层：

**输入层 → 隐藏层 → 输出层**

- 输入层：one-hot 向量（维度 V）
- 隐藏层：无激活函数，权重矩阵 W (V × d)，d 是词向量维度（通常 100-300）
- 输出层：softmax，输出每个词的概率

注意：**隐藏层没有激活函数**，只是简单的线性变换。输入 one-hot 向量 x，隐藏层输出就是 W 的对应行：\`h = W^T x\`。

模型训练完成后，**权重矩阵 W 的每一行就是一个词的词向量**。

### 3.1 CBOW 的前向传播

1. 取上下文 2m 个词的 one-hot 向量：\`x_{i-m}, ..., x_{i-1}, x_{i+1}, ..., x_{i+m}\`
2. 计算隐藏层：\`h = \\frac{1}{2m} \\sum W^T x_j\`（上下文词向量的平均）
3. 输出层：\`u = W'^T h\`，\`y = softmax(u)\`
4. 损失：交叉熵 \`L = -\\log y_{c}\`，c 是中心词的索引

### 3.2 Skip-gram 的前向传播

1. 取中心词的 one-hot 向量 x
2. 计算隐藏层：\`h = W^T x\`（就是中心词的词向量）
3. 对每个上下文词，输出层：\`u = W'^T h\`，\`y = softmax(u)\`
4. 损失：对每个上下文词的交叉熵之和

## 四、Softmax 的计算瓶颈

输出层的 softmax 需要对所有 V 个词计算概率并归一化：

$$P(w_o | w_i) = \\frac{\\exp(u_{w_o})}{\\sum_{w=1}^{V} \\exp(u_w)}$$

当 V = 100000 时，每次更新都要计算 10 万次指数运算，**这成为 Word2Vec 的最大瓶颈**。

Word2Vec 提出了两种加速方案：**负采样**和**层级 softmax**。

### 4.1 负采样（Negative Sampling）

负采样的核心思想：把"多分类"问题转化为"二分类"问题。

对于每个正样本（中心词 + 真实上下文词），随机采样 K 个负样本（中心词 + 随机词），训练一个二分类器：判断 (中心词, 上下文词) 是否是真实的搭配。

目标函数变为：

$$\\log \\sigma(u_{w_o}) + \\sum_{k=1}^{K} \\log \\sigma(-u_{w_k})$$

其中 σ 是 sigmoid 函数，\`w_k\` 是负采样词。

负采样的优势：

- 每次只更新 K+1 个词的向量（K 通常 5-20），而非全部 V 个
- 训练速度大幅提升
- 实现简单

负样本的采样分布：通常用 **3/4 次方采样**，即词频的 3/4 次方作为采样概率。这样既考虑到词频（高频词更可能被采为负样本），又避免高频词主导训练。

### 4.2 层级 Softmax（Hierarchical Softmax）

层级 softmax 用一棵哈夫曼树替代输出层，每个词对应一个叶子节点。从根到叶子的路径上，每个内部节点是一个二分类器。

预测一个词的概率 = 路径上所有二分类器概率的乘积。

优势：从 O(V) 降到 O(log V)。
劣势：实现复杂，且对低频词不利（路径长）。

实践中，**负采样更常用**，Google 官方默认也是负采样。

## 五、词向量的特性

训练好的词向量展现出惊人的语义特性：

### 5.1 语义相似性

语义相近的词在向量空间中距离相近：
- "猫" 与 "狗" 距离近
- "猫" 与 "汽车" 距离远

### 5.2 类比推理

最著名的例子：
$$\\text{king} - \\text{man} + \\text{woman} \\approx \\text{queen}$$

原理：\`king - man\` 大致表示"皇室"这个概念，加上"woman"得到"女性皇室"，最接近的词是 queen。

类似例子：
- 北京:中国 :: 东京:日本
- 苹果:水果 :: 白菜:蔬菜

### 5.3 线性结构

词向量空间呈现一定的线性结构：

- 性别方向：\`king - queen ≈ man - woman\`
- 时态方向：\`walked - walk ≈ jumped - jump\`
- 国家-首都方向：\`China - Beijing ≈ Japan - Tokyo\`

## 六、词向量的应用

### 6.1 文本分类

把句子中所有词的词向量平均（或加权平均），得到句向量，再输入分类器。

### 6.2 命名实体识别

每个词的词向量作为 BiLSTM-CRF 的输入，大幅提升准确率。

### 6.3 机器翻译

跨语言词向量：让不同语言的词向量空间对齐，实现零样本翻译。

### 6.4 推荐系统

把用户行为序列视为"句子"，商品视为"词"，训练商品向量，用于推荐。

### 6.5 文本相似度

句向量之间计算余弦相似度，用于检索、去重、聚类。

## 七、Word2Vec 的局限

尽管 Word2Vec 有着划时代的意义，它仍然存在几个根本性局限：

**一词多义**：每个词只有一个固定向量，无法根据上下文变化。例如"苹果"在水果上下文中应是水果，在公司上下文中应是公司，但 Word2Vec 只能给出一个混合向量。

**未登录词**：词表外的词（OOV）无法获得向量，通常用 UNK（unknown）统一表示，丢失了词本身的语义。

**静态向量**：词向量训练好后不再变化，无法适应新词、新义。

**无层次结构**：所有词的向量维度相同，无法表达词的层次性（如"动物"→"狗"→"小狗"）。

这些局限正是 **ELMo**、**BERT** 等**上下文词向量**要解决的问题。BERT 中"苹果"在水果上下文和公司上下文中会得到不同的向量表示，这一突破推动了 NLP 性能的进一步飞跃。

## 八、词向量可视化

把高维词向量用 t-SNE 或 PCA 降到 2 维可视化，可以看到：

- 同类词聚在一起（水果、动物、国家各自成簇）
- 类比关系呈现平行四边形结构
- 形容词比较级和原级形成方向

可视化是理解词向量语义结构的有力工具。

## 九、本章小结

Word2Vec 通过分布式假设和浅层神经网络，把词从离散符号转化为稠密向量，开启了神经 NLP 的新时代。本章我们学习了 CBOW 和 Skip-gram 两种架构、负采样加速技巧、词向量的语义特性及其应用。

虽然 Word2Vec 已被 BERT/GPT 等上下文模型超越，但其核心思想——**用向量表示语义**——仍然是现代 NLP 的基石。理解 Word2Vec 是理解 Transformer 中 Embedding 层、注意力机制的前提。

下一章我们将进入 NLP 的革命性架构——Transformer，看它如何用注意力机制取代 RNN，开启大模型时代。
`,
    code: `
# =============================================================
# 第3章代码：词向量与 Word2Vec（纯标准库实现）
# =============================================================
# 本代码用纯 Python（不依赖 gensim/numpy/torch）演示：
# 1. 共现矩阵词向量（最原始的分布式表示）
# 2. 简化版 Skip-gram 训练流程（教学用）
# 3. 词向量相似度计算
# 4. 词类比推理（king - man + woman ≈ queen）
# 5. 简单的文本相似度（基于词向量平均）

import math
import random
from collections import Counter, defaultdict


# -------------------------------------------------------------
# 一、基于共现矩阵的词向量（最朴素的分布式表示）
# -------------------------------------------------------------
# 思想：用每个词周围的词频分布作为该词的向量
# 这是分布式假设最直观的实现
class CooccurrenceVectorizer:
    """基于共现矩阵的词向量"""

    def __init__(self, window_size=2, vector_dim=10):
        self.window_size = window_size
        self.vector_dim = vector_dim
        self.vocabulary = {}
        self.word_vectors = {}

    def build_vocabulary(self, sentences, min_count=1):
        """构建词表"""
        word_counts = Counter()
        for sent in sentences:
            word_counts.update(sent)
        # 过滤低频词
        words = [w for w, c in word_counts.items() if c >= min_count]
        self.vocabulary = {w: i for i, w in enumerate(sorted(words))}
        return self

    def build_cooccurrence_matrix(self, sentences):
        """构建共现矩阵"""
        vocab_size = len(self.vocabulary)
        # 共现矩阵：M[i][j] 表示词 j 在词 i 的上下文中出现的次数
        matrix = [[0] * vocab_size for _ in range(vocab_size)]

        for sent in sentences:
            for i, word in enumerate(sent):
                if word not in self.vocabulary:
                    continue
                center_idx = self.vocabulary[word]
                # 看左右 window_size 个词
                for offset in range(-self.window_size, self.window_size + 1):
                    if offset == 0:
                        continue
                    j = i + offset
                    if 0 <= j < len(sent) and sent[j] in self.vocabulary:
                        context_idx = self.vocabulary[sent[j]]
                        # 距离越近权重越大
                        weight = 1.0 / abs(offset)
                        matrix[center_idx][context_idx] += weight

        # 归一化：每个向量除以其 L2 范数
        for i in range(vocab_size):
            norm = math.sqrt(sum(v * v for v in matrix[i]))
            if norm > 0:
                matrix[i] = [v / norm for v in matrix[i]]

        self.word_vectors = {
            word: matrix[idx]
            for word, idx in self.vocabulary.items()
        }
        return self

    def get_vector(self, word):
        """获取词向量"""
        return self.word_vectors.get(word, None)


# 准备一个小型语料
sentences_raw = [
    "猫 喜欢 吃 鱼",
    "狗 喜欢 吃 肉",
    "猫 和 狗 是 朋友",
    "鱼 在 水 里 游",
    "猫 不 喜欢 水",
    "狗 也 不 喜欢 水",
    "猫 喜欢吃 鱼",
    "狗 喜欢 咬 骨头",
]
sentences = [s.split() for s in sentences_raw]

print("=" * 60)
print("【一】基于共现矩阵的词向量")
print("=" * 60)
print("语料：")
for i, s in enumerate(sentences_raw):
    print(f"  句{i+1}: {s}")

vectorizer = CooccurrenceVectorizer(window_size=2)
vectorizer.build_vocabulary(sentences, min_count=1)
vectorizer.build_cooccurrence_matrix(sentences)

print(f"\\n词表大小：{len(vectorizer.vocabulary)}")
print(f"词表：{list(vectorizer.vocabulary.keys())}")

# 看看 '猫' 的向量
cat_vec = vectorizer.get_vector("猫")
dog_vec = vectorizer.get_vector("狗")
fish_vec = vectorizer.get_vector("鱼")
water_vec = vectorizer.get_vector("水")

print(f"\\n'猫' 的向量（前5维）：{[round(v, 3) for v in cat_vec[:5]]}")
print(f"'狗' 的向量（前5维）：{[round(v, 3) for v in dog_vec[:5]]}")


# -------------------------------------------------------------
# 二、向量相似度计算
# -------------------------------------------------------------
def cosine_similarity(v1, v2):
    """余弦相似度"""
    if v1 is None or v2 is None:
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def euclidean_distance(v1, v2):
    """欧氏距离"""
    if v1 is None or v2 is None:
        return float('inf')
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))


print("\\n" + "=" * 60)
print("【二】词向量相似度")
print("=" * 60)
test_pairs = [
    ("猫", "狗"),   # 应该比较相似
    ("猫", "鱼"),   # 中等相似
    ("猫", "水"),   # 较低相似
    ("狗", "水"),
    ("鱼", "水"),   # 鱼和水相关，应该较高
]

print("余弦相似度：")
for w1, w2 in test_pairs:
    sim = cosine_similarity(vectorizer.get_vector(w1), vectorizer.get_vector(w2))
    print(f"  sim({w1}, {w2}) = {sim:.4f}")

print("\\n欧氏距离：")
for w1, w2 in test_pairs:
    dist = euclidean_distance(vectorizer.get_vector(w1), vectorizer.get_vector(w2))
    print(f"  dist({w1}, {w2}) = {dist:.4f}")


# -------------------------------------------------------------
# 三、词类比推理（向量运算）
# -------------------------------------------------------------
def find_most_similar(target_vec, word_vectors, exclude_words, top_n=3):
    """找到与目标向量最相似的词"""
    similarities = []
    for word, vec in word_vectors.items():
        if word in exclude_words:
            continue
        sim = cosine_similarity(target_vec, vec)
        similarities.append((word, sim))
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]


def analogy(word_a, word_b, word_c, word_vectors, top_n=3):
    """
    类比推理：a 之于 b，相当于 c 之于 ?
    向量运算：target = vec(b) - vec(a) + vec(c)
    例如：king - man + woman ≈ queen
    """
    vec_a = word_vectors.get(word_a)
    vec_b = word_vectors.get(word_b)
    vec_c = word_vectors.get(word_c)
    if vec_a is None or vec_b is None or vec_c is None:
        return []

    # 向量运算
    target = [b - a + c for a, b, c in zip(vec_a, vec_b, vec_c)]
    exclude = {word_a, word_b, word_c}
    return find_most_similar(target, word_vectors, exclude, top_n)


print("\\n" + "=" * 60)
print("【三】词类比推理（向量运算）")
print("=" * 60)
# 由于语料较小，类比效果有限，这里仅演示原理
# 假设我们有更丰富的词向量，可以做：king - man + woman ≈ queen
# 这里用简单语料演示：
# "猫" 之于 "鱼"，相当于 "狗" 之于 "肉"（因为猫吃鱼，狗吃肉）
print("类比：'猫' 之于 '鱼'，相当于 '狗' 之于 ?")
results = analogy("猫", "鱼", "狗", vectorizer.word_vectors, top_n=3)
for word, sim in results:
    print(f"  {word}: {sim:.4f}")


# -------------------------------------------------------------
# 四、简化版 Skip-gram 训练流程（教学演示）
# -------------------------------------------------------------
# 注意：真实 Word2Vec 用神经网络 + 负采样，这里用简化版本
# 通过统计共现，模拟 Skip-gram 的训练目标
class SimpleSkipGram:
    """简化版 Skip-gram 词向量训练（教学用）"""

    def __init__(self, vector_dim=5, window_size=2, learning_rate=0.01, epochs=50):
        self.vector_dim = vector_dim
        self.window_size = window_size
        self.lr = learning_rate
        self.epochs = epochs
        self.word_vectors = {}
        self.context_vectors = {}  # 上下文词向量（输出层）

    def _init_vectors(self, vocab_size, vocab_words):
        """随机初始化词向量"""
        random.seed(42)
        for word in vocab_words:
            self.word_vectors[word] = [random.uniform(-0.5, 0.5)
                                       for _ in range(self.vector_dim)]
            self.context_vectors[word] = [random.uniform(-0.5, 0.5)
                                          for _ in range(self.vector_dim)]

    def _sigmoid(self, x):
        """sigmoid 函数"""
        if x > 30:
            return 1.0
        if x < -30:
            return 0.0
        return 1.0 / (1.0 + math.exp(-x))

    def _dot(self, v1, v2):
        """点积"""
        return sum(a * b for a, b in zip(v1, v2))

    def train(self, sentences, negative_samples=3):
        """训练 Skip-gram 模型（带负采样）"""
        # 构建词表
        word_counts = Counter()
        for sent in sentences:
            word_counts.update(sent)
        vocab_words = list(word_counts.keys())
        self._init_vectors(len(vocab_words), vocab_words)

        # 采样分布（按词频的 3/4 次方）
        total = sum(c ** 0.75 for c in word_counts.values())
        sampling_probs = [word_counts[w] ** 0.75 / total for w in vocab_words]

        # 生成训练样本
        training_pairs = []
        for sent in sentences:
            for i, center_word in enumerate(sent):
                for offset in range(-self.window_size, self.window_size + 1):
                    if offset == 0:
                        continue
                    j = i + offset
                    if 0 <= j < len(sent):
                        training_pairs.append((center_word, sent[j]))

        print(f"训练样本数：{len(training_pairs)}")
        print(f"词表大小：{len(vocab_words)}")
        print(f"向量维度：{self.vector_dim}")

        # 训练
        for epoch in range(self.epochs):
            total_loss = 0.0
            random.shuffle(training_pairs)

            for center, context in training_pairs:
                # 正样本
                v_c = self.word_vectors[center]
                u_o = self.context_vectors[context]
                score = self._dot(v_c, u_o)
                pos_label = self._sigmoid(score)
                pos_grad = pos_label - 1.0  # ∂L/∂score = sigmoid(score) - 1
                total_loss += -math.log(max(pos_label, 1e-10))

                # 负采样
                neg_grads = []
                for _ in range(negative_samples):
                    neg_word = self._sample_negative(vocab_words, sampling_probs, context)
                    u_neg = self.context_vectors[neg_word]
                    neg_score = self._dot(v_c, u_neg)
                    neg_label = self._sigmoid(neg_score)
                    neg_grads.append((u_neg, neg_label - 0.0))
                    total_loss += -math.log(max(1 - neg_label, 1e-10))

                # 更新中心词向量
                grad_v = [0.0] * self.vector_dim
                for k in range(self.vector_dim):
                    grad_v[k] += pos_grad * u_o[k]
                    for u_neg, neg_grad in neg_grads:
                        grad_v[k] += neg_grad * u_neg[k]

                # 更新上下文词向量（正样本）
                grad_u = [pos_grad * v for v in v_c]
                for k in range(self.vector_dim):
                    u_o[k] -= self.lr * grad_u[k]

                # 更新上下文词向量（负样本）
                for u_neg, neg_grad in neg_grads:
                    for k in range(self.vector_dim):
                        u_neg[k] -= self.lr * neg_grad * v_c[k]

                # 更新中心词向量
                for k in range(self.vector_dim):
                    v_c[k] -= self.lr * grad_v[k]

            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{self.epochs}, Loss: {total_loss/len(training_pairs):.4f}")


    def _sample_negative(self, vocab_words, probs, exclude):
        """负采样"""
        while True:
            word = random.choices(vocab_words, weights=probs, k=1)[0]
            if word != exclude:
                return word


print("\\n" + "=" * 60)
print("【四】简化版 Skip-gram 训练（带负采样）")
print("=" * 60)
sg_model = SimpleSkipGram(vector_dim=5, window_size=2, learning_rate=0.05, epochs=30)
sg_model.train(sentences, negative_samples=3)

# 看看训练后的词向量相似度
print("\\n训练后的词向量相似度：")
test_words = ["猫", "狗", "鱼", "水"]
for i in range(len(test_words)):
    for j in range(i+1, len(test_words)):
        w1, w2 = test_words[i], test_words[j]
        if w1 in sg_model.word_vectors and w2 in sg_model.word_vectors:
            sim = cosine_similarity(sg_model.word_vectors[w1], sg_model.word_vectors[w2])
            print(f"  sim({w1}, {w2}) = {sim:.4f}")


# -------------------------------------------------------------
# 五、句向量（词向量平均）与文本相似度
# -------------------------------------------------------------
def sentence_vector(words, word_vectors):
    """句向量 = 词向量平均"""
    vectors = [word_vectors[w] for w in words if w in word_vectors]
    if not vectors:
        return None
    dim = len(vectors[0])
    return [sum(v[k] for v in vectors) / len(vectors) for k in range(dim)]


print("\\n" + "=" * 60)
print("【五】句向量（词向量平均）与文本相似度")
print("=" * 60)

# 用共现矩阵词向量做句向量
test_sentences = [
    (["猫", "喜欢", "吃", "鱼"], "猫喜欢吃鱼"),
    (["狗", "喜欢", "吃", "肉"], "狗喜欢吃肉"),
    (["鱼", "在", "水", "里", "游"], "鱼在水里游"),
    (["猫", "不", "喜欢", "水"], "猫不喜欢水"),
]

sent_vectors = []
for words, desc in test_sentences:
    vec = sentence_vector(words, vectorizer.word_vectors)
    sent_vectors.append((vec, desc))
    print(f"  句子：{desc}")

print("\\n句间相似度矩阵：")
print("          ", "    ".join(f"S{i+1}" for i in range(len(sent_vectors))))
for i in range(len(sent_vectors)):
    sims = []
    for j in range(len(sent_vectors)):
        sim = cosine_similarity(sent_vectors[i][0], sent_vectors[j][0])
        sims.append(f"{sim:.2f}")
    print(f"  S{i+1}    ", "    ".join(sims))

print("\\n观察：S1(猫吃鱼) 与 S2(狗吃肉) 结构相似，相似度较高")
print("     S3(鱼在水里) 与 S4(猫不喜欢水) 都提到水，有一定相似度")

print("\\n" + "=" * 60)
print("演示完成！词向量是深度学习 NLP 的基石。")
print("真实场景请使用 gensim.Word2Vec 或预训练词向量。")
print("=" * 60)
`,
  },

  // =============================================================
  // 第4章：Transformer 架构详解
  // =============================================================
  {
    id: "aipy-transformer",
    icon: "🤖",
    group: "自然语言处理",
    title: "Transformer架构详解",
    content: `
# Transformer架构详解

## 引言：一场改变 AI 的革命

2017 年，Google 在论文《Attention Is All You Need》中提出了 Transformer 架构。这个原本为机器翻译设计的模型，在短短几年内彻底改变了 NLP 乃至整个 AI 领域的格局：

- **BERT**（2018）：基于 Transformer Encoder，刷新 11 项 NLP 记录
- **GPT 系列**（2018-至今）：基于 Transformer Decoder，催生 ChatGPT
- **ViT**（2020）：Transformer 用于图像识别，挑战 CNN 地位
- **AlphaFold 2**（2020）：Transformer 用于蛋白质结构预测
- **Sora、Stable Diffusion**：扩散模型中也大量使用 Transformer 组件

可以说，Transformer 是当今 AI 的"通用引擎"。理解它的内部机制，是理解一切大模型的前提。

本章将深入剖析 Transformer 的核心组件：注意力机制、自注意力、多头注意力、位置编码、Encoder-Decoder 结构。

## 一、为什么需要 Transformer

### 1.1 RNN 的局限

在 Transformer 出现前，序列建模主要依赖 RNN（包括 LSTM、GRU）。RNN 的核心问题：

**串行计算**：RNN 必须按时间步顺序计算，\`h_t = f(h_{t-1}, x_t)\`，无法并行化。这导致训练速度极慢，难以利用 GPU 的并行能力。

**长距离依赖**：虽然 LSTM 缓解了梯度消失，但当序列长度超过 100 时，RNN 仍然难以捕捉远端信息。信息在传递过程中不断衰减。

**信息瓶颈**：编码器-解码器架构中，整个输入序列被压缩成一个固定长度的向量，信息损失严重。

### 1.2 注意力机制的引入

2015 年 Bahdanau 等人在神经机器翻译中引入注意力机制：解码时不再依赖固定向量，而是动态地"关注"输入序列的不同部分。这解决了信息瓶颈问题。

但注意力机制最初是与 RNN 结合使用的，RNN 的串行问题依然存在。

### 1.3 Transformer 的核心创新

Transformer 大胆地**完全抛弃 RNN**，只用注意力机制。这带来两个突破：

- **完全并行**：所有位置可以同时计算，训练速度大幅提升
- **任意距离直接连接**：注意力让任何两个位置直接交互，无信息衰减

## 二、自注意力机制（Self-Attention）

### 2.1 直觉理解

考虑句子："The animal didn't cross the street because it was too tired."

"it" 指代什么？人能轻易看出是 "animal"，但机器如何知道？

自注意力的思路：**让每个词都"看一眼"句子中所有其他词，根据相关性决定关注谁**。

对 "it" 来说，它应该对 "animal" 给予高权重（因为语义相关），对 "tired" 也给予一定权重（动物才会累）。最终 "it" 的新表示是所有词表示的加权和。

### 2.2 Q、K、V 机制

自注意力的核心是 Query-Key-Value（查询-键-值）机制，类比检索系统：

- **Query（Q）**：当前词"想要什么"
- **Key（K）**：其他词"提供什么"
- **Value（V）**：其他词的实际"内容"

计算流程：
1. 对每个词的向量，分别通过三个线性变换得到 Q、K、V
2. 用 Q 和所有词的 K 做点积，得到"相关度"
3. 用 softmax 把相关度归一化为"注意力权重"
4. 用权重对所有词的 V 做加权平均，得到当前词的新表示

### 2.3 数学公式

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

其中：
- Q 是查询矩阵，形状 (n, d_k)
- K 是键矩阵，形状 (n, d_k)
- V 是值矩阵，形状 (n, d_v)
- \\(\\sqrt{d_k}\\) 是缩放因子，防止点积值过大导致 softmax 梯度消失

### 2.4 为什么除以 √d_k

当 d_k 较大时，Q 和 K 的点积 \\(Q \\cdot K\\) 数值会很大。softmax 对大值很敏感，会导致梯度接近 0（饱和）。除以 \\(\\sqrt{d_k}\\) 把数值缩小，让 softmax 保持合理梯度。

数学上：假设 Q、K 的元素是均值为 0、方差为 1 的独立随机变量，点积 \\(Q \\cdot K = \\sum_{i=1}^{d_k} Q_i K_i\\) 的方差是 d_k。除以 \\(\\sqrt{d_k}\\) 把方差拉回 1。

### 2.5 多头注意力（Multi-Head Attention）

单一注意力可能只能学到一种关系。多头注意力把 Q、K、V 拆成多组，每组独立做注意力，最后拼接：

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h) W^O$$

$$\\text{where } \\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

例如 d_model=512，h=8，每个头的维度是 64。8 个头相当于让模型从 8 个不同"视角"关注序列，捕捉不同的语义关系：

- 某个头可能关注语法关系（主谓）
- 某个头可能关注语义关系（同义、反义）
- 某个头可能关注长距离依赖

### 2.6 直观例子

句子 "The cat sat on the mat because it was tired"：

- 第1个头：关注"it"指代"cat"（指代消解）
- 第2个头：关注"sat"与"mat"的方位关系
- 第3个头：关注"because"前后的因果关系
- ...

每个头学到的关系不同，最后拼接起来形成丰富的表示。

## 三、位置编码（Positional Encoding）

### 3.1 问题

自注意力有个副作用：**它本身是"无序"的**。把句子打乱顺序，自注意力的输出集合不变（只是顺序不同）。

但语言显然是有序的："狗咬人"和"人咬狗"含义完全不同。必须显式地告诉模型每个词的位置。

### 3.2 解决方案：位置编码

把位置信息编码成向量，加到词向量上：

$$\\text{Input} = \\text{WordEmbedding}(x) + \\text{PositionalEncoding}(pos)$$

### 3.3 正弦余弦编码

原论文用正弦/余弦函数生成位置编码：

$$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$

$$PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$

其中 pos 是位置，i 是维度。

这种编码的特性：

- 每个位置的编码是唯一的
- 不同位置之间的编码可以线性组合（相对位置可学习）
- 可以泛化到训练中未见过的更长序列

### 3.4 其他位置编码

- **可学习位置编码**：把位置编码当作参数训练（BERT 用这种）
- **相对位置编码**：编码词与词之间的相对距离（T5 用这种）
- **RoPE（旋转位置编码）**：通过旋转矩阵编码位置，适合长序列（LLaMA 用这种）

## 四、Encoder-Decoder 结构

### 4.1 整体架构

Transformer 最初为机器翻译设计，采用 Encoder-Decoder 架构：

**Encoder（编码器）**：把输入序列编码成上下文表示。
**Decoder（解码器）**：根据 Encoder 输出，逐步生成目标序列。

### 4.2 Encoder 结构

每个 Encoder 层包含两个子层：

1. **多头自注意力**：输入序列内部互相注意
2. **前馈神经网络（FFN）**：每个位置独立通过一个两层 MLP

每个子层后接 **残差连接 + LayerNorm**：

$$\\text{output} = \\text{LayerNorm}(x + \\text{Sublayer}(x))$$

残差连接让深层网络训练更容易，LayerNorm 稳定训练。

Encoder 通常堆叠 6 层（原论文设置）。

### 4.3 Decoder 结构

Decoder 每层有三个子层：

1. **掩码自注意力（Masked Self-Attention）**：解码时只能看到已经生成的词，不能看未来
2. **交叉注意力（Cross-Attention）**：Q 来自 Decoder，K、V 来自 Encoder 输出
3. **前馈神经网络**

掩码机制：通过把未来位置的注意力权重设为 -∞（softmax 后为 0），保证自回归生成。

### 4.4 三种变体

后续研究分化出三种 Transformer 变体：

**Encoder-Only（如 BERT）**：只用 Encoder，适合理解任务（分类、NER、问答）。双向注意力，能看到上下文。

**Decoder-Only（如 GPT）**：只用 Decoder，适合生成任务（对话、写作、翻译）。单向注意力，只能看左侧。

**Encoder-Decoder（如 T5、BART）**：完整结构，适合 seq2seq 任务（翻译、摘要）。

实践证明：**Decoder-Only 在大规模预训练下效果最好**，GPT 系列的成功证明了这一点。

## 五、前馈神经网络（FFN）

每个位置的表示在通过注意力后，还要经过一个两层的前馈网络：

$$\\text{FFN}(x) = \\max(0, xW_1 + b_1) W_2 + b_2$$

特点：

- 每个位置独立计算（不同位置之间不交互）
- 中间层维度通常是 d_model 的 4 倍（如 512 → 2048 → 512）
- 激活函数：原论文用 ReLU，后续有 GELU、SwiGLU 等改进

FFN 的作用：增加非线性表达能力。注意力层负责"信息混合"，FFN 负责"特征变换"。

## 六、LayerNorm 与残差连接

### 6.1 残差连接

$$y = x + F(x)$$

梯度可以通过残差路径直接回传，缓解深层网络的梯度消失。Transformer 通常堆叠很多层（GPT-3 有 96 层），残差连接是关键。

### 6.2 LayerNorm

对每个样本的特征维度做归一化：

$$\\text{LN}(x) = \\gamma \\cdot \\frac{x - \\mu}{\\sigma} + \\beta$$

与 BatchNorm 不同，LayerNorm 不依赖 batch 内其他样本，适合变长序列。

### 6.3 Pre-Norm vs Post-Norm

原论文用 Post-Norm（先残差后归一化），训练不稳定，需要 warmup。
现代大模型多用 Pre-Norm（先归一化后残差），训练更稳定。

## 七、Transformer 的优势

### 7.1 并行性

Encoder 完全并行：所有位置同时计算注意力。GPU 利用率高，训练速度远超 RNN。

Decoder 训练时也可以并行（用掩码），只在推理时是自回归的。

### 7.2 长距离依赖

任意两个位置在注意力中直接交互，距离为 O(1)。RNN 是 O(n)。

### 7.3 可解释性

注意力权重可以可视化，看模型"关注"哪些词。虽然这种解释性有争议，但比 RNN 的隐状态直观得多。

### 7.4 可扩展性

Transformer 可以堆叠很深（GPT-4 估计有上百层），参数可以扩展到千亿。这种"规模化"带来性能的持续提升，是大模型时代的基础。

## 八、Transformer 的挑战

### 8.1 计算复杂度

自注意力的复杂度是 O(n²)，n 是序列长度。处理长文本（如整本书）时计算和显存爆炸。

解决方案：稀疏注意力、Longformer、BigBird、线性注意力等。

### 8.2 位置信息

虽然位置编码缓解了无序问题，但 Transformer 对位置的感知仍不如 RNN/CNN 自然。

### 8.3 数据需求

Transformer 参数多，需要大规模数据训练。小数据集上容易过拟合。

## 九、本章小结

Transformer 通过自注意力机制，让序列中任意两个位置直接交互，实现了完全并行化和长距离依赖建模。其核心组件包括：多头自注意力、位置编码、FFN、残差连接、LayerNorm。

Transformer 是 BERT、GPT 等大模型的共同基础。理解了 Transformer，就理解了大模型的"骨架"。下一章我们将看到，如何在这个骨架上构建出令人惊叹的大语言模型。
`,
    code: `
# =============================================================
# 第4章代码：Transformer 核心组件（纯标准库实现）
# =============================================================
# 本代码用纯 Python（不依赖 numpy/torch）演示：
# 1. 自注意力机制（Scaled Dot-Product Attention）
# 2. 多头注意力（Multi-Head Attention）
# 3. 正弦余弦位置编码
# 4. 前馈神经网络（FFN）
# 5. 完整的 Transformer Encoder 层
# 6. 注意力权重可视化

import math
import random


# -------------------------------------------------------------
# 工具函数
# -------------------------------------------------------------
def matmul(A, B):
    """矩阵乘法 A (m×n) × B (n×p) = C (m×p)"""
    m = len(A)
    n = len(B)
    p = len(B[0])
    C = [[0.0] * p for _ in range(m)]
    for i in range(m):
        for k in range(n):
            if A[i][k] == 0:
                continue
            for j in range(p):
                C[i][j] += A[i][k] * B[k][j]
    return C

def transpose(A):
    """矩阵转置"""
    return [[A[i][j] for i in range(len(A))] for j in range(len(A[0]))]

def softmax_rows(matrix):
    """对矩阵每一行做 softmax"""
    result = []
    for row in matrix:
        max_val = max(row)
        exps = [math.exp(v - max_val) for v in row]
        total = sum(exps)
        result.append([e / total for e in exps])
    return result

def relu(x):
    return max(0, x)


# -------------------------------------------------------------
# 一、缩放点积注意力（Scaled Dot-Product Attention）
# -------------------------------------------------------------
def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    计算 Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V
    :param Q: 查询矩阵 (n, d_k)
    :param K: 键矩阵 (n, d_k)
    :param V: 值矩阵 (n, d_v)
    :param mask: 可选掩码
    :return: 注意力输出 (n, d_v), 注意力权重 (n, n)
    """
    n = len(Q)
    d_k = len(Q[0])

    # 1. QK^T: (n, d_k) × (d_k, n) = (n, n)
    K_T = transpose(K)
    scores = matmul(Q, K_T)

    # 2. 缩放：除以 sqrt(d_k)
    scale = math.sqrt(d_k)
    for i in range(n):
        for j in range(n):
            scores[i][j] /= scale

    # 3. 应用掩码（可选）
    if mask is not None:
        for i in range(n):
            for j in range(n):
                if not mask[i][j]:
                    scores[i][j] = -1e9

    # 4. softmax
    attention_weights = softmax_rows(scores)

    # 5. attention_weights × V: (n, n) × (n, d_v) = (n, d_v)
    output = matmul(attention_weights, V)

    return output, attention_weights


print("=" * 60)
print("【一】缩放点积注意力")
print("=" * 60)

# 模拟一个 4 词的句子，每个词用 4 维向量表示
random.seed(42)
seq_len = 4
d_model = 4

# 随机生成 Q, K, V
Q = [[random.uniform(-1, 1) for _ in range(d_model)] for _ in range(seq_len)]
K = [[random.uniform(-1, 1) for _ in range(d_model)] for _ in range(seq_len)]
V = [[random.uniform(-1, 1) for _ in range(d_model)] for _ in range(seq_len)]

print("Q 矩阵（4×4）：")
for row in Q:
    print("  ", [round(v, 3) for v in row])

output, attn_weights = scaled_dot_product_attention(Q, K, V)
print("\\n注意力权重矩阵（4×4，每行之和为1）：")
for row in attn_weights:
    print("  ", [round(v, 3) for v in row])
print(f"\\n验证每行和为1：{[round(sum(row), 6) for row in attn_weights]}")

print("\\n注意力输出（4×4）：")
for row in output:
    print("  ", [round(v, 3) for v in row])


# -------------------------------------------------------------
# 二、多头注意力（Multi-Head Attention）
# -------------------------------------------------------------
def linear_transform(matrix, weights, bias=None):
    """线性变换 y = xW + b
    matrix: (n, in_dim)
    weights: (in_dim, out_dim)
    """
    n = len(matrix)
    out_dim = len(weights[0])
    result = matmul(matrix, weights)
    if bias is not None:
        for i in range(n):
            for j in range(out_dim):
                result[i][j] += bias[j]
    return result


def split_heads(matrix, num_heads):
    """把矩阵按维度切分成多个头
    matrix: (n, d_model)
    return: list of (n, d_model/num_heads)
    """
    n = len(matrix)
    d_model = len(matrix[0])
    head_dim = d_model // num_heads
    heads = []
    for h in range(num_heads):
        head = [[matrix[i][h * head_dim + k] for k in range(head_dim)]
                for i in range(n)]
        heads.append(head)
    return head_dim, heads


def merge_heads(heads, d_model):
    """把多个头的结果拼接回去"""
    n = len(heads[0])
    num_heads = len(heads)
    head_dim = d_model // num_heads
    merged = [[0.0] * d_model for _ in range(n)]
    for h in range(num_heads):
        for i in range(n):
            for k in range(head_dim):
                merged[i][h * head_dim + k] = heads[h][i][k]
    return merged


class MultiHeadAttention:
    """多头注意力"""

    def __init__(self, d_model, num_heads):
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads

        # 随机初始化权重矩阵（真实模型用训练得到）
        random.seed(123)
        self.W_Q = [[random.uniform(-0.5, 0.5) for _ in range(d_model)]
                    for _ in range(d_model)]
        self.W_K = [[random.uniform(-0.5, 0.5) for _ in range(d_model)]
                    for _ in range(d_model)]
        self.W_V = [[random.uniform(-0.5, 0.5) for _ in range(d_model)]
                    for _ in range(d_model)]
        self.W_O = [[random.uniform(-0.5, 0.5) for _ in range(d_model)]
                    for _ in range(d_model)]

    def forward(self, query, key, value, mask=None):
        """
        :param query, key, value: (n, d_model)
        :return: output (n, d_model), 各头的注意力权重
        """
        # 1. 线性变换
        Q = linear_transform(query, self.W_Q)
        K = linear_transform(key, self.W_K)
        V = linear_transform(value, self.W_V)

        # 2. 切分多头
        _, Q_heads = split_heads(Q, self.num_heads)
        _, K_heads = split_heads(K, self.num_heads)
        _, V_heads = split_heads(V, self.num_heads)

        # 3. 每个头独立做注意力
        head_outputs = []
        head_weights = []
        for h in range(self.num_heads):
            out, weights = scaled_dot_product_attention(
                Q_heads[h], K_heads[h], V_heads[h], mask
            )
            head_outputs.append(out)
            head_weights.append(weights)

        # 4. 拼接
        concat = merge_heads(head_outputs, self.d_model)

        # 5. 最终线性变换
        output = linear_transform(concat, self.W_O)
        return output, head_weights


print("\\n" + "=" * 60)
print("【二】多头注意力")
print("=" * 60)
d_model = 8
num_heads = 2
mha = MultiHeadAttention(d_model, num_heads)

# 输入：3 个 token，每个 8 维
input_seq = [[random.uniform(-1, 1) for _ in range(d_model)] for _ in range(3)]
print(f"输入：3 个 token，每个 {d_model} 维")
print(f"注意力头数：{num_heads}，每个头维度：{d_model // num_heads}")

output, head_weights = mha.forward(input_seq, input_seq, input_seq)
print(f"\\n输出形状：{len(output)} × {len(output[0])}")
print("每个头的注意力权重：")
for h, weights in enumerate(head_weights):
    print(f"  Head {h+1}:")
    for row in weights:
        print("    ", [round(v, 3) for v in row])


# -------------------------------------------------------------
# 三、正弦余弦位置编码
# -------------------------------------------------------------
def positional_encoding(max_len, d_model):
    """生成正弦余弦位置编码
    PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
    PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
    """
    pe = [[0.0] * d_model for _ in range(max_len)]
    for pos in range(max_len):
        for i in range(0, d_model, 2):
            # 偶数维用 sin
            div_term = 10000 ** (i / d_model)
            pe[pos][i] = math.sin(pos / div_term)
            # 奇数维用 cos
            if i + 1 < d_model:
                pe[pos][i + 1] = math.cos(pos / div_term)
    return pe


print("\\n" + "=" * 60)
print("【三】正弦余弦位置编码")
print("=" * 60)
max_len = 6
d_model_pe = 8
pe = positional_encoding(max_len, d_model_pe)

print(f"位置编码矩阵（{max_len} 个位置，{d_model_pe} 维）：")
print("位置\\维度  ", "   ".join(f"d{i}" for i in range(d_model_pe)))
for pos in range(max_len):
    vals = "   ".join(f"{pe[pos][i]:+.2f}" for i in range(d_model_pe))
    print(f"  pos={pos}  {vals}")

# 验证：相近位置的编码相似，远位置差异大
def cosine_sim(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    return dot / (n1 * n2) if n1 > 0 and n2 > 0 else 0

print("\\n位置间相似度（cosine）：")
print("       ", "  ".join(f"pos{i}" for i in range(max_len)))
for i in range(max_len):
    sims = [f"{cosine_sim(pe[i], pe[j]):+.2f}" for j in range(max_len)]
    print(f"pos{i}  ", "  ".join(sims))
print("（相近位置编码相似度高，远位置相似度低）")


# -------------------------------------------------------------
# 四、前馈神经网络（FFN）
# -------------------------------------------------------------
class FeedForward:
    """两层前馈网络：FFN(x) = ReLU(x*W1 + b1) * W2 + b2"""

    def __init__(self, d_model, d_ff):
        random.seed(456)
        self.W1 = [[random.uniform(-1, 1) for _ in range(d_ff)]
                   for _ in range(d_model)]
        self.b1 = [random.uniform(-0.1, 0.1) for _ in range(d_ff)]
        self.W2 = [[random.uniform(-1, 1) for _ in range(d_model)]
                   for _ in range(d_ff)]
        self.b2 = [random.uniform(-0.1, 0.1) for _ in range(d_model)]

    def forward(self, x):
        # x: (n, d_model)
        # 第一层：d_model -> d_ff，激活 ReLU
        hidden = linear_transform(x, self.W1, self.b1)
        for i in range(len(hidden)):
            for j in range(len(hidden[0])):
                hidden[i][j] = relu(hidden[i][j])
        # 第二层：d_ff -> d_model
        output = linear_transform(hidden, self.W2, self.b2)
        return output


print("\\n" + "=" * 60)
print("【四】前馈神经网络（FFN）")
print("=" * 60)
ffn = FeedForward(d_model=8, d_ff=16)
ffn_input = [[random.uniform(-1, 1) for _ in range(8)] for _ in range(3)]
ffn_output = ffn.forward(ffn_input)
print(f"输入：3 × 8")
print(f"中间层：16 维（带 ReLU）")
print(f"输出：{len(ffn_output)} × {len(ffn_output[0])}")


# -------------------------------------------------------------
# 五、完整的 Transformer Encoder 层
# -------------------------------------------------------------
def layer_norm(matrix, eps=1e-6):
    """Layer Normalization：对每个样本的特征维度归一化"""
    result = []
    for row in matrix:
        mean = sum(row) / len(row)
        var = sum((v - mean) ** 2 for v in row) / len(row)
        result.append([(v - mean) / math.sqrt(var + eps) for v in row])
    return result


def add_residual(x, sublayer_out):
    """残差连接：y = x + Sublayer(x)"""
    return [[x[i][j] + sublayer_out[i][j] for j in range(len(x[0]))]
            for i in range(len(x))]


class TransformerEncoderLayer:
    """Transformer Encoder 一层"""

    def __init__(self, d_model, num_heads, d_ff):
        self.mha = MultiHeadAttention(d_model, num_heads)
        self.ffn = FeedForward(d_model, d_ff)

    def forward(self, x):
        """
        :param x: (n, d_model)
        :return: (n, d_model)
        """
        # 子层1：多头自注意力 + 残差 + LayerNorm
        attn_out, _ = self.mha.forward(x, x, x)
        x = layer_norm(add_residual(x, attn_out))

        # 子层2：FFN + 残差 + LayerNorm
        ffn_out = self.ffn.forward(x)
        x = layer_norm(add_residual(x, ffn_out))

        return x


print("\\n" + "=" * 60)
print("【五】Transformer Encoder 层")
print("=" * 60)

# 完整的 Encoder 层前向传播
d_model_full = 8
encoder_layer = TransformerEncoderLayer(
    d_model=d_model_full,
    num_heads=2,
    d_ff=16
)

# 模拟一个句子的词向量序列（3 个词）
random.seed(789)
word_embeddings = [[random.uniform(-1, 1) for _ in range(d_model_full)]
                   for _ in range(3)]

# 加上位置编码
pe = positional_encoding(max_len=3, d_model=d_model_full)
input_with_pe = [[word_embeddings[i][j] + pe[i][j]
                  for j in range(d_model_full)] for i in range(3)]

print(f"输入：3 个 token，每个 {d_model_full} 维（含位置编码）")
print(f"Encoder 层配置：d_model={d_model_full}, num_heads=2, d_ff=16")

output = encoder_layer.forward(input_with_pe)
print(f"\\n输出：{len(output)} × {len(output[0])}")
print("输出向量（前2维）：")
for i, row in enumerate(output):
    print(f"  token {i}: {[round(v, 3) for v in row[:2]]} ...")


# -------------------------------------------------------------
# 六、注意力权重可视化
# -------------------------------------------------------------
print("\\n" + "=" * 60)
print("【六】注意力权重可视化")
print("=" * 60)

# 用一个简单的例子：让模型"关注"句子中相关的词
# 模拟 "猫 坐 在 垫子 上" 这句话
words = ["猫", "坐", "在", "垫子", "上"]
print(f"句子：{' '.join(words)}")

# 用固定的 Q, K 让 "猫" 关注 "坐" 和 "垫子"
random.seed(2024)
seq_len = len(words)
d_k = 4
Q = [[random.uniform(-1, 1) for _ in range(d_k)] for _ in range(seq_len)]
K = [[random.uniform(-1, 1) for _ in range(d_k)] for _ in range(seq_len)]
V = [[random.uniform(-1, 1) for _ in range(d_k)] for _ in range(seq_len)]

_, attn = scaled_dot_product_attention(Q, K, V)

# 用字符强度表示注意力权重
def visualize_attention(words, attn_weights):
    """用字符强度可视化注意力"""
    print("\\n注意力热力图（▏表示权重）：")
    print(" " * 8, "  ".join(f"{w:>4s}" for w in words))
    for i, word in enumerate(words):
        row = attn_weights[i]
        bars = "  ".join("▏" * int(v * 20) for v in row)
        print(f"{word:>4s}  ->  {bars}")
        print(f"       ", "  ".join(f"{v:.2f}" for v in row))

visualize_attention(words, attn)

# 掩码自注意力（Decoder 用）
print("\\n【掩码自注意力】（Decoder 用，下三角掩码）")
mask = [[j <= i for j in range(seq_len)] for i in range(seq_len)]
_, masked_attn = scaled_dot_product_attention(Q, K, V, mask)
visualize_attention(words, masked_attn)
print("\\n观察：掩码后每个词只能看到自己和之前的词（下三角）")

print("\\n" + "=" * 60)
print("演示完成！这就是 Transformer 的核心机制。")
print("BERT/GPT 等大模型都是由这种层堆叠而成的。")
print("=" * 60)
`,
  },

  // =============================================================
  // 第5章：大语言模型应用
  // =============================================================
  {
    id: "aipy-llm-app",
    icon: "🧠",
    group: "自然语言处理",
    title: "大语言模型应用",
    content: `
# 大语言模型应用

## 引言：大模型时代的到来

2022 年 11 月 30 日，OpenAI 发布 ChatGPT，5 天内用户突破 100 万，2 个月达到 1 亿月活，成为史上增长最快的消费级应用。这一事件标志着 NLP 进入"大语言模型（LLM）"时代。

大语言模型（Large Language Model，LLM）是基于 Transformer 架构、参数规模巨大（百亿到万亿）、在海量文本上预训练的模型。它们不仅能完成传统 NLP 任务（分类、翻译、问答），还展现出令人惊讶的"涌现能力"：推理、写代码、创作、规划、多轮对话。

本章将系统讲解 LLM 的架构（GPT 与 BERT）、关键应用技术（Prompt Engineering、RAG、微调、LangChain），帮助读者理解并实践大模型应用开发。

## 一、GPT 与 BERT 架构对比

### 1.1 共同基础

GPT 和 BERT 都基于 Transformer，都采用"预训练 + 微调"范式：

- **预训练**：在海量无标注文本上自监督学习
- **微调**：在下游任务的小规模标注数据上监督学习

但它们在架构和训练目标上有根本区别，造就了完全不同的能力。

### 1.2 BERT：Encoder-Only

**架构**：Transformer Encoder，双向注意力
**训练目标**：Masked Language Modeling（MLM）—— 随机遮挡 15% 的词，让模型预测被遮挡的词

例如：
- 原句："今天天气真好"
- 输入："今天 [MASK] 真好"
- 输出：预测 [MASK] 是 "天气"

**特点**：
- 双向：每个词能看到上下文（左右两侧）
- 适合理解任务：分类、NER、问答、相似度
- 不擅长生成：BERT 不是为生成设计的

**典型规模**：BERT-base（110M 参数）、BERT-large（340M 参数）

### 1.3 GPT：Decoder-Only

**架构**：Transformer Decoder，单向（自回归）注意力
**训练目标**：Causal Language Modeling（CLM）—— 给定前文，预测下一个词

例如：
- 输入："今天天气"
- 输出：预测下一个词 "真" / "很好" / "不错"

**特点**：
- 单向：每个词只能看到左侧（已生成的词）
- 自回归生成：从左到右逐词生成
- 适合生成任务：对话、写作、翻译、代码生成
- 规模化后涌现出推理、指令遵循等能力

**典型规模**：GPT-2（1.5B）、GPT-3（175B）、GPT-4（估计万亿级）

### 1.4 为什么 GPT 路线胜出

实践证明，**GPT 的 Decoder-Only 架构在规模化后效果最好**：

1. **生成能力**：自回归训练天然支持生成，而 BERT 需要额外改造
2. **任务通用性**：通过 Prompt 可以做几乎所有 NLP 任务，无需为每个任务设计输出层
3. **规模化收益**：参数越多、数据越多，GPT 性能持续提升；BERT 在中等规模后收益递减
4. **In-Context Learning**：GPT 大到一定程度后，能从上下文中的几个示例学习新任务，这是 BERT 不具备的

BERT 路线现在主要用于特定理解任务（如句向量、检索），而通用大模型几乎都采用 GPT 路线。

### 1.5 主流开源大模型

- **LLaMA 系列（Meta）**：LLaMA 1/2/3，开源标杆
- **Qwen 系列（阿里）**：通义千问，中文表现优秀
- **ChatGLM 系列（智谱）**：清华系，中英双语
- **Mistral 系列**：欧洲代表，效率高
- **DeepSeek 系列**：深度求索，性价比高

## 二、Prompt Engineering

### 2.1 什么是 Prompt

Prompt（提示）是给大模型的输入文本，通过它引导模型产生期望的输出。在 LLM 时代，Prompt 取代了"模型微调"成为主要的任务适配方式。

对比传统范式：
- **传统范式**：为每个任务收集标注数据 → 微调整个模型 → 部署
- **Prompt 范式**：设计好的 Prompt → 调用大模型 → 直接得到结果

Prompt 的核心思想：**大模型已经"知道"很多，只需要正确的"提问"就能释放能力**。

### 2.2 Prompt 的核心技巧

#### 2.2.1 明确角色

让模型扮演特定角色，输出更专业：

\`\`\`
你是一位资深 Python 工程师，请审查以下代码...
\`\`\`

#### 2.2.2 提供上下文

背景信息让模型更准确：

\`\`\`
我们的产品是一个面向中小企业的 SaaS 协作工具，请基于此背景写文案...
\`\`\`

#### 2.2.3 明确输出格式

指定输出结构，避免模型自由发挥：

\`\`\`
请按以下 JSON 格式输出：
{
  "summary": "一句话总结",
  "keywords": ["关键词1", "关键词2"],
  "sentiment": "positive/negative/neutral"
}
\`\`\`

#### 2.2.4 给出示例（Few-shot）

通过几个示例让模型"举一反三"：

\`\`\`
输入：苹果 → 输出：水果
输入：狗 → 输出：动物
输入：玫瑰 → 输出：花卉
输入：鲸鱼 → 输出：？
\`\`\`

#### 2.2.5 Chain of Thought（思维链）

让模型"想一想再回答"，提升推理任务准确率：

\`\`\`
问题：小明有 5 个苹果，吃了 2 个，又买了 3 个，现在有几个？
请一步步思考：
\`\`\`

模型会输出推理过程："5 - 2 = 3，3 + 3 = 6，所以现在有 6 个"，而非直接猜答案。

#### 2.2.6 分解复杂任务

把大任务拆成小步骤：

\`\`\`
第1步：分析用户需求
第2步：列出可能的解决方案
第3步：评估每个方案的优缺点
第4步：推荐最佳方案
\`\`\`

### 2.3 Prompt 的常见模式

**Zero-shot**：直接提问，不给示例
**Few-shot**：给几个示例
**Chain-of-Thought (CoT)**：让模型展示推理过程
**Self-Consistency**：多次采样取多数票
**Tree of Thoughts (ToT)**：树状搜索思维过程
**ReAct**：推理 + 行动交替（适合工具调用）

## 三、RAG（检索增强生成）

### 3.1 为什么需要 RAG

大模型有几个固有局限：

**知识截止**：模型训练时有知识截止日期，无法回答最新信息（如"今天的天气"）
**幻觉**：模型会"一本正经地胡说八道"，编造不存在的事实
**领域知识不足**：通用大模型对企业内部文档、专业领域知识了解有限
**无法溯源**：模型无法说明答案的来源

RAG（Retrieval-Augmented Generation，检索增强生成）通过"先检索，再生成"解决这些问题：

1. 用户提问
2. 从知识库检索相关文档片段
3. 把检索到的内容作为上下文，连同问题一起送给 LLM
4. LLM 基于上下文生成答案

### 3.2 RAG 的工作流程

完整的 RAG 流程包括：

**索引阶段**（离线）：
1. 文档加载：PDF、Word、HTML、Markdown
2. 文档切分：按段落或固定长度切分（如 500 字一段）
3. 向量化：用 Embedding 模型把每个片段转为向量
4. 入库：存入向量数据库（FAISS、Milvus、Chroma）

**检索阶段**（在线）：
1. 查询向量化：用同样的 Embedding 模型把用户问题转为向量
2. 相似度检索：从向量库中找最相似的 Top-K 片段
3. （可选）重排序：用更精细的模型对 Top-K 重新排序

**生成阶段**（在线）：
1. 构造 Prompt：把检索到的片段 + 用户问题组合
2. 调用 LLM 生成答案
3. （可选）溯源：返回答案引用的文档片段

### 3.3 RAG 的优势

- **知识时效性**：可以随时更新知识库，无需重训模型
- **减少幻觉**：模型基于检索到的内容回答，更可靠
- **可溯源**：答案可以追溯到具体文档
- **领域适配**：用企业内部文档构建知识库，无需微调
- **成本效益**：比微调大模型便宜得多

### 3.4 RAG 的挑战

- **检索质量**：检索不到相关内容，生成质量无从谈起
- **上下文长度**：检索太多内容会超出模型上下文窗口
- **切分策略**：切分不当可能破坏语义完整性
- **多轮对话**：多轮上下文如何检索是难点

### 3.5 高级 RAG 技术

**HyDE**：先让 LLM 假设答案，再用假设答案检索（解决查询与文档表述差异）
**Multi-Query**：让 LLM 把一个问题改写成多个，分别检索
**RAG-Fusion**：多查询结果融合排序
**Self-RAG**：模型自己判断是否需要检索、检索结果是否相关
**GraphRAG**：结合知识图谱的 RAG

## 四、微调（Fine-tuning）

### 4.1 何时需要微调

虽然 Prompt 和 RAG 解决了大部分问题，但有些场景仍需微调：

- **风格定制**：让模型说"品牌的话"
- **领域深度**：医疗、法律等需要深度领域知识
- **格式严格**：输出格式必须严格符合规范
- **降低成本**：小模型微调后可能达到大模型的效果
- **数据隐私**：敏感数据不能送到云端 LLM

### 4.2 微调方法

#### 4.2.1 全参数微调（Full Fine-tuning）

更新模型所有参数。效果好但成本高：需要大量 GPU 内存，每个任务存一份完整模型。

#### 4.2.2 参数高效微调（PEFT）

只更新少量参数，大部分参数冻结：

**LoRA（Low-Rank Adaptation）**：在原模型权重旁加一个低秩矩阵，只训练这个低秩矩阵。参数量降低数百倍，效果接近全参数微调。

**QLoRA**：LoRA + 4bit 量化，可以在单卡 GPU 上微调 65B 模型。

**Prefix Tuning**：在每层前加可学习的前缀向量。

**P-Tuning**：优化 Prompt 向量而非模型参数。

#### 4.2.3 指令微调（Instruction Tuning）

用"指令-回答"对训练模型遵循指令：

\`\`\`
指令：把以下句子翻译成英文
输入：今天天气很好
输出：The weather is nice today.
\`\`\`

指令微调让预训练模型变成"会对话"的助手，是 ChatGPT、Alpaca、Vicuna 等的关键步骤。

#### 4.2.4 RLHF（人类反馈强化学习）

ChatGPT 的核心创新之一：

1. SFT（监督微调）：用人工标注的对话数据微调
2. RM（奖励模型）：训练一个给回答打分的模型
3. PPO（强化学习）：用奖励模型的分数作为信号，优化生成策略

RLHF 让模型更"听话"、更"安全"、更"有用"。

替代方案：DPO（Direct Preference Optimization），无需显式奖励模型，直接用偏好数据训练。

### 4.3 微调 vs RAG vs Prompt

| 方法 | 适用场景 | 成本 | 效果 |
|------|---------|------|------|
| Prompt | 通用任务、快速验证 | 极低 | 中等 |
| RAG | 知识密集、需溯源 | 中等 | 高 |
| 微调 | 风格定制、领域深度 | 高 | 高 |

实践中常组合使用：先用 RAG 注入知识，再微调改变风格。

## 五、LangChain 框架

### 5.1 LangChain 是什么

LangChain 是大模型应用开发最流行的框架，提供：

- **模型抽象**：统一接口调用各种 LLM（OpenAI、Anthropic、本地模型）
- **Prompt 管理**：模板化、版本化 Prompt
- **链（Chain）**：把多个步骤串联成工作流
- **记忆（Memory）**：多轮对话的上下文管理
- **工具（Tool）**：让 LLM 调用外部工具（搜索、计算、API）
- **Agent**：让 LLM 自主决定调用什么工具、何时调用
- **检索器**：对接各种向量数据库，实现 RAG

### 5.2 核心概念

**LLM Chain**：最基础的链，Prompt + LLM + Output Parser

\`\`\`
prompt -> LLM -> parser -> 结果
\`\`\`

**Sequential Chain**：多个链串行执行，前一个的输出是后一个的输入

**Agent**：LLM 作为"大脑"，根据用户输入决定调用哪些工具

\`\`\`
用户："北京明天天气怎么样？"
Agent 思考：需要查天气 -> 调用天气 API -> 得到结果 -> 回答用户
\`\`\`

**Memory**：保存对话历史，让 LLM "记得"之前说过什么

### 5.3 典型应用

**文档问答**：上传 PDF → 切分 → 向量化 → 检索 → 生成答案

**智能客服**：知识库 RAG + 多轮对话 + 工单系统 API

**代码助手**：读取代码库 → 上下文检索 → 生成/解释代码

**数据分析**：LLM 写 SQL → 执行查询 → 解读结果 → 生成报告

### 5.4 LangChain 替代品

- **LlamaIndex**：专注 RAG 与数据连接
- **Semantic Kernel（微软）**：.NET 生态友好
- **Haystack**：搜索导向，适合企业搜索
- **Dify**：可视化构建 LLM 应用
- **LangGraph**：LangChain 的新一代，支持复杂状态机

## 六、Agent 与工具调用

### 6.1 Agent 的概念

Agent（智能体）= LLM + 工具 + 规划能力

传统 LLM 应用是"输入 → 输出"的单次调用。Agent 让 LLM 能够：

- **规划**：把复杂目标分解为多个步骤
- **工具调用**：调用搜索引擎、计算器、API、数据库
- **反思**：根据执行结果调整计划
- **多步执行**：迭代直到完成目标

### 6.2 ReAct 模式

ReAct = Reasoning + Acting，让 LLM 在"思考"和"行动"之间交替：

\`\`\`
Thought: 用户问"今天比特币价格"，我需要查实时数据
Action: search("bitcoin price today")
Observation: 比特币当前价格 $43000
Thought: 我得到了价格，可以回答用户
Answer: 今天比特币价格约为 $43000
\`\`\`

### 6.3 Function Calling

OpenAI 等模型原生支持 Function Calling：模型根据用户输入判断需要调用什么函数、传什么参数，应用层执行函数后把结果返回给模型。

\`\`\`
用户："帮我订明天去北京的机票"
模型：调用函数 book_flight(date="明天", destination="北京")
应用：执行订票
模型："已为您订好明天去北京的机票"
\`\`\`

### 6.4 多 Agent 协作

复杂任务可以由多个 Agent 分工协作：

- **AutoGPT**：自主规划、执行、反思的通用 Agent
- **MetaGPT**：模拟软件团队（产品经理、架构师、程序员）
- **CrewAI**：多 Agent 协作框架

## 七、LLM 应用最佳实践

### 7.1 评估

LLM 输出难以用传统指标评估，常用方法：

- **人工评估**：最可靠但成本高
- **LLM-as-Judge**：用更强的 LLM 评估弱 LLM 的输出
- **基准测试**：MMLU、HumanEval、GSM8K 等标准数据集
- **业务指标**：转化率、用户满意度、解决率

### 7.2 安全

- **Prompt 注入**：用户输入恶意 Prompt 篡改模型行为
- **越狱**：诱导模型突破安全限制
- **数据泄露**：模型可能"背"出训练数据中的隐私信息
- **偏见**：模型可能产生歧视性输出

防御手段：输入过滤、输出审查、宪法 AI（Constitutional AI）、红队测试。

### 7.3 成本优化

- **模型选择**：简单任务用小模型，复杂任务用大模型
- **缓存**：相同输入直接返回缓存结果
- **批量调用**：Batch API 通常更便宜
- **流式输出**：提升用户体验但不省钱
- **量化部署**：本地部署用 4bit/8bit 量化

## 八、本章小结

大语言模型基于 Transformer，以 GPT（Decoder-Only）路线为主导。本章梳理了 LLM 的架构对比、Prompt Engineering、RAG、微调、LangChain、Agent 等核心技术。

LLM 应用开发的核心范式是：**Prompt + RAG + 工具调用 + 微调**的组合。掌握这些技术，就能构建出从简单问答到复杂 Agent 的各类应用。

整个 NLP 学习到此告一段落。从最基础的分词、TF-IDF，到词向量、Transformer，再到大语言模型，我们见证了 AI 处理语言的方式从"规则"到"统计"再到"深度学习"的演进。这正是 AI 发展的缩影，也是每位 AI 工程师必须理解的知识脉络。
`,
    code: `
# =============================================================
# 第5章代码：大语言模型应用演示（纯标准库实现）
# =============================================================
# 本代码用纯 Python（不依赖 openai/langchain/transformers）演示：
# 1. 简单的语言模型（n-gram）生成文本
# 2. Prompt Engineering 模板与 Few-shot
# 3. RAG 流程模拟（关键词检索 + 上下文增强）
# 4. 简单的 Agent 模式（工具调用）
# 5. 文本向量化与相似度检索
# 6. 对话记忆管理

import math
import random
import re
from collections import Counter, defaultdict


# -------------------------------------------------------------
# 一、简单的 n-gram 语言模型
# -------------------------------------------------------------
# 大语言模型的"前身"，用统计方法预测下一个词
class NGramLanguageModel:
    """n-gram 语言模型"""

    def __init__(self, n=2):
        self.n = n
        self.ngram_counts = defaultdict(Counter)  # 上下文 -> {下一个词: 次数}
        self.context_counts = Counter()  # 上下文出现总次数
        self.vocab = set()

    def train(self, sentences):
        """训练 n-gram 模型"""
        for sent in sentences:
            words = sent if isinstance(sent, list) else sent.split()
            # 加 padding
            padded = ['<s>'] * (self.n - 1) + words + ['</s>']
            self.vocab.update(words)
            for i in range(len(padded) - self.n + 1):
                context = tuple(padded[i:i + self.n - 1])
                next_word = padded[i + self.n - 1]
                self.ngram_counts[context][next_word] += 1
                self.context_counts[context] += 1

    def predict(self, context, temperature=1.0):
        """根据上下文预测下一个词"""
        ctx = tuple(context[-(self.n - 1):]) if len(context) >= self.n - 1 \\
            else tuple(['<s>'] * (self.n - 1 - len(context)) + context)

        if ctx not in self.ngram_counts:
            return None

        candidates = self.ngram_counts[ctx]
        total = sum(candidates.values())

        # 按概率采样
        words = list(candidates.keys())
        probs = [count / total for count in candidates.values()]

        # 温度调节
        if temperature != 1.0:
            probs = [p ** (1 / temperature) for p in probs]
            s = sum(probs)
            probs = [p / s for p in probs]

        return random.choices(words, weights=probs, k=1)[0]

    def generate(self, max_words=20, temperature=1.0):
        """生成文本"""
        result = []
        for _ in range(max_words):
            ctx = result[-(self.n - 1):] if self.n > 1 else []
            next_word = self.predict(ctx, temperature)
            if next_word is None or next_word == '</s>':
                break
            result.append(next_word)
        return result


print("=" * 60)
print("【一】n-gram 语言模型")
print("=" * 60)

# 训练语料
corpus = [
    "我 爱 自然 语言 处理",
    "自然 语言 处理 很 有趣",
    "我 爱 机器 学习",
    "机器 学习 是 人工智能 的 核心",
    "深度 学习 推动 人工智能 发展",
    "自然 语言 处理 是 人工智能 的 分支",
    "我 喜欢 学习 新 知识",
    "人工智能 改变 世界",
]

# 训练 bigram 模型
bigram_model = NGramLanguageModel(n=2)
bigram_model.train(corpus)

print(f"词表大小：{len(bigram_model.vocab)}")
print(f"训练语料：{len(corpus)} 句")

# 预测下一个词
print("\\n给定上下文 '我'，预测下一个词：")
ctx = ["我"]
for _ in range(5):
    next_word = bigram_model.predict(ctx)
    if next_word:
        count = bigram_model.ngram_counts[tuple(ctx)].get(next_word, 0)
        total = bigram_model.context_counts[tuple(ctx)]
        print(f"  '我' -> '{next_word}' (概率: {count}/{total} = {count/total:.2f})")

# 生成文本
print("\\n生成文本（温度=1.0）：")
for _ in range(3):
    generated = bigram_model.generate(max_words=8, temperature=1.0)
    print(f"  {' '.join(generated)}")


# -------------------------------------------------------------
# 二、Prompt Engineering 模板
# -------------------------------------------------------------
class PromptTemplate:
    """Prompt 模板管理"""

    def __init__(self, template, input_variables):
        self.template = template
        self.input_variables = input_variables

    def format(self, **kwargs):
        """填充模板"""
        prompt = self.template
        for var in self.input_variables:
            prompt = prompt.replace("{{" + var + "}}", kwargs.get(var, ""))
        return prompt


# 角色 Prompt 模板
role_template = PromptTemplate(
    template="""你是一位{{role}}。
请用{{style}}的风格，回答以下问题：
问题：{{question}}
回答：""",
    input_variables=["role", "style", "question"]
)

print("\\n" + "=" * 60)
print("【二】Prompt Engineering 模板")
print("=" * 60)

# 不同角色的 Prompt
prompts = [
    role_template.format(role="资深Python工程师", style="专业严谨", question="如何学习编程？"),
    role_template.format(role="幼儿园老师", style="通俗易懂", question="如何学习编程？"),
    role_template.format(role="脱口秀演员", style="幽默风趣", question="如何学习编程？"),
]
for i, p in enumerate(prompts, 1):
    print(f"\\n--- Prompt {i} ---")
    print(p)


# Few-shot Prompt
def few_shot_prompt(task_desc, examples, query):
    """构造 Few-shot Prompt"""
    prompt = f"任务：{task_desc}\\n\\n"
    prompt += "示例：\\n"
    for inp, out in examples:
        prompt += f"输入：{inp}\\n输出：{out}\\n"
    prompt += f"\\n现在请处理：\\n输入：{query}\\n输出："
    return prompt


print("\\n--- Few-shot Prompt 示例 ---")
examples = [
    ("苹果", "水果"),
    ("狗", "动物"),
    ("玫瑰", "花卉"),
]
prompt = few_shot_prompt(
    "把输入的词分类到合适的类别",
    examples,
    "鲸鱼"
)
print(prompt)


# Chain of Thought
def cot_prompt(question):
    """思维链 Prompt"""
    return f"""问题：{question}

请一步步思考：
1. 首先，...
2. 然后，...
3. 最后，...

答案："""


print("\\n--- Chain of Thought Prompt 示例 ---")
print(cot_prompt("小明有5个苹果，吃了2个，又买了3个，现在有几个？"))


# -------------------------------------------------------------
# 三、RAG 流程模拟
# -------------------------------------------------------------
class SimpleRAG:
    """简化的 RAG 系统模拟"""

    def __init__(self):
        self.documents = []
        self.doc_vectors = []
        self.vocabulary = {}

    def add_documents(self, docs):
        """添加文档到知识库"""
        self.documents.extend(docs)
        # 重新构建词表
        all_words = set()
        for doc in docs:
            all_words.update(doc.split())
        self.vocabulary = {w: i for i, w in enumerate(sorted(all_words))}
        # 重新计算所有文档向量
        self.doc_vectors = [self._vectorize(doc) for doc in self.documents]

    def _vectorize(self, text):
        """简单的词频向量化"""
        vec = [0.0] * len(self.vocabulary)
        for word in text.split():
            if word in self.vocabulary:
                vec[self.vocabulary[word]] += 1
        # L2 归一化
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec

    def _cosine_sim(self, v1, v2):
        return sum(a * b for a, b in zip(v1, v2))

    def retrieve(self, query, top_k=2):
        """检索相关文档"""
        query_vec = self._vectorize(query)
        scores = [(i, self._cosine_sim(query_vec, self.doc_vectors[i]))
                  for i in range(len(self.documents))]
        scores.sort(key=lambda x: x[1], reverse=True)
        return [(self.documents[i], s) for i, s in scores[:top_k]]

    def generate(self, query, top_k=2):
        """检索 + 生成（模拟）"""
        # 1. 检索
        retrieved = self.retrieve(query, top_k)
        # 2. 构造上下文 Prompt
        context = "\\n".join([f"[文档{i+1}] {doc}" for i, (doc, _) in enumerate(retrieved)])
        prompt = f"""基于以下检索到的资料，回答用户问题。

检索到的资料：
{context}

用户问题：{query}

回答："""
        # 3. 模拟 LLM 生成（实际场景会调用 GPT 等）
        # 这里简单地从相关文档中提取关键信息
        answer = f"根据资料，关于'{query}'的相关信息：\\n"
        for doc, score in retrieved:
            if score > 0:
                answer += f"- (相关度 {score:.2f}) {doc}\\n"
        return prompt, answer


print("\\n" + "=" * 60)
print("【三】RAG 检索增强生成")
print("=" * 60)

# 构建知识库
knowledge_base = [
    "Python 是一种解释型高级编程语言 由 Guido van Rossum 创建",
    "Python 的设计哲学强调代码可读性 简洁性",
    "Python 支持面向对象 函数式 过程式编程范式",
    "TensorFlow 是 Google 开发的深度学习框架",
    "PyTorch 是 Facebook 开发的深度学习框架",
    "Transformer 是 2017 年 Google 提出的模型架构",
    "BERT 基于 Transformer Encoder 适合自然语言理解",
    "GPT 基于 Transformer Decoder 适合自然语言生成",
    "Word2Vec 是 Mikolov 在 2013 年提出的词向量模型",
    "RAG 通过检索增强生成减少大模型幻觉",
]

rag = SimpleRAG()
rag.add_documents(knowledge_base)

print(f"知识库文档数：{len(rag.documents)}")
print(f"词表大小：{len(rag.vocabulary)}")

# 检索测试
queries = ["Python 是什么", "Transformer 是什么", "GPT 和 BERT 的区别"]

for query in queries:
    print(f"\\n>>> 查询：{query}")
    prompt, answer = rag.generate(query, top_k=2)
    print(f"回答：\\n{answer}")


# -------------------------------------------------------------
# 四、Agent 模式（工具调用）
# -------------------------------------------------------------
class SimpleAgent:
    """简化的 ReAct Agent"""

    def __init__(self):
        self.tools = {
            "search": self._tool_search,
            "calculator": self._tool_calculator,
            "time": self._tool_time,
        }
        self.tool_descriptions = {
            "search": "搜索网络信息，输入查询关键词",
            "calculator": "数学计算，输入数学表达式",
            "time": "获取当前时间",
        }

    def _tool_search(self, query):
        # 模拟搜索（实际场景调用搜索 API）
        fake_results = {
            "北京天气": "北京今天晴，气温 25°C",
            "上海天气": "上海今天多云，气温 28°C",
            "Python": "Python 是一种流行的编程语言",
        }
        for key, val in fake_results.items():
            if key in query:
                return val
        return f"未找到关于 '{query}' 的信息"

    def _tool_calculator(self, expression):
        try:
            # 注意：实际生产中不要用 eval，这里仅演示
            allowed = re.match(r'^[0-9+\\-*/.() ]+$', expression)
            if allowed:
                result = eval(expression)
                return f"{expression} = {result}"
            return "无效的表达式"
        except Exception as e:
            return f"计算错误：{e}"

    def _tool_time(self, _=""):
        from datetime import datetime
        return f"当前时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    def think_and_act(self, user_input):
        """简化的 ReAct 流程"""
        print(f"\\n用户：{user_input}")
        print("-" * 50)

        # 简单的意图识别（实际用 LLM 判断）
        steps = []

        # 判断是否需要工具
        if "天气" in user_input:
            steps.append(("search", user_input.replace("天气", "").strip() + "天气"))
        elif "几点" in user_input or "时间" in user_input:
            steps.append(("time", ""))
        elif any(c in user_input for c in "+-*/"):
            # 提取数学表达式
            expr = re.search(r'[0-9+\\-*/.() ]+', user_input)
            if expr:
                steps.append(("calculator", expr.group().strip()))
        else:
            # 直接回答
            print("Thought: 这个问题不需要工具，我直接回答")
            print(f"Answer: 我了解您问的是 '{user_input}'，但我的能力有限。")
            return

        # 执行工具
        for tool_name, tool_input in steps:
            print(f"Thought: 我需要使用 {tool_name} 工具")
            print(f"Action: {tool_name}('{tool_input}')")
            result = self.tools[tool_name](tool_input)
            print(f"Observation: {result}")

        print("Thought: 我已经获得了需要的信息，可以回答用户了")
        final_answer = result if 'result' in dir() else "无法处理"
        print(f"Answer: {final_answer}")


print("\\n" + "=" * 60)
print("【四】Agent 模式（工具调用）")
print("=" * 60)
print("可用工具：")
for name, desc in SimpleAgent().tool_descriptions.items():
    print(f"  - {name}: {desc}")

agent = SimpleAgent()
test_inputs = [
    "北京天气怎么样？",
    "现在几点了？",
    "帮我计算 123 + 456 * 2",
]
for inp in test_inputs:
    agent.think_and_act(inp)


# -------------------------------------------------------------
# 五、对话记忆管理
# -------------------------------------------------------------
class ConversationMemory:
    """对话记忆管理"""

    def __init__(self, max_history=5):
        self.history = []
        self.max_history = max_history

    def add_message(self, role, content):
        """添加消息"""
        self.history.append({"role": role, "content": content})
        # 超出长度则删除最早的消息
        if len(self.history) > self.max_history * 2:
            self.history = self.history[-(self.max_history * 2):]

    def get_context(self):
        """获取对话上下文"""
        return "\\n".join([f"{m['role']}: {m['content']}" for m in self.history])

    def clear(self):
        """清空记忆"""
        self.history = []


print("\\n" + "=" * 60)
print("【五】对话记忆管理")
print("=" * 60)
memory = ConversationMemory(max_history=3)

conversation = [
    ("user", "你好"),
    ("assistant", "你好！有什么可以帮您？"),
    ("user", "什么是 Transformer？"),
    ("assistant", "Transformer 是 2017 年提出的基于注意力机制的模型架构。"),
    ("user", "它和 RNN 有什么区别？"),
    ("assistant", "Transformer 完全抛弃 RNN，只用注意力机制，可以并行计算。"),
]

for role, content in conversation:
    memory.add_message(role, content)

print("对话历史：")
print(memory.get_context())
print(f"\\n记忆长度：{len(memory.history)} 条（受 max_history 限制）")


# -------------------------------------------------------------
# 六、文本向量化与相似度检索（模拟 Embedding）
# -------------------------------------------------------------
def simple_embedding(text, dim=10):
    """简单的文本向量化（用字符哈希模拟 Embedding）"""
    vec = [0.0] * dim
    for word in text.split():
        # 用词的哈希值映射到向量维度
        h = hash(word) % dim
        vec[h] += 1.0
        # 第二个特征：词长
        h2 = (len(word) * 7) % dim
        vec[h2] += 0.5
    # L2 归一化
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]
    return vec


print("\\n" + "=" * 60)
print("【六】文本向量化与相似度检索")
print("=" * 60)

documents = [
    "Python 编程语言入门教程",
    "深度学习神经网络原理",
    "自然语言处理技术应用",
    "机器学习算法实践",
    "Transformer 注意力机制",
]

# 向量化所有文档
doc_embeddings = [(doc, simple_embedding(doc)) for doc in documents]

# 查询
query = "Python 编程"
query_vec = simple_embedding(query)

print(f"查询：{query}")
print("\\n文档相似度排序：")
similarities = []
for doc, vec in doc_embeddings:
    sim = sum(a * b for a, b in zip(query_vec, vec))
    similarities.append((doc, sim))
similarities.sort(key=lambda x: x[1], reverse=True)

for doc, sim in similarities:
    bar = "█" * int(sim * 40)
    print(f"  {sim:.4f} {bar} {doc}")


# -------------------------------------------------------------
# 七、输出格式化解析
# -------------------------------------------------------------
def parse_json_response(text):
    """模拟解析 LLM 的 JSON 输出"""
    # 简单的 JSON 提取（实际场景用 json.loads）
    import json
    try:
        # 找到 { 和 } 之间的内容
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            json_str = text[start:end]
            return json.loads(json_str)
    except Exception as e:
        return {"error": f"解析失败: {e}", "raw": text}


print("\\n" + "=" * 60)
print("【七】输出格式化解析")
print("=" * 60)

# 模拟 LLM 返回的 JSON
mock_llm_response = '''
好的，分析结果如下：
{
  "summary": "Python 是一种高级编程语言",
  "keywords": ["Python", "编程", "语言"],
  "sentiment": "positive"
}
希望对您有帮助！
'''

parsed = parse_json_response(mock_llm_response)
print("LLM 原始输出：")
print(mock_llm_response)
print("解析后的结构化数据：")
for key, value in parsed.items():
    print(f"  {key}: {value}")


# -------------------------------------------------------------
# 八、综合应用：智能问答系统
# -------------------------------------------------------------
class SimpleQA:
    """综合应用：基于 RAG 的问答系统"""

    def __init__(self):
        self.rag = SimpleRAG()
        self.memory = ConversationMemory(max_history=5)

    def add_knowledge(self, docs):
        """添加知识库"""
        self.rag.add_documents(docs)

    def ask(self, question):
        """回答问题"""
        # 1. 记录用户问题
        self.memory.add_message("user", question)

        # 2. 检索相关知识
        retrieved = self.rag.retrieve(question, top_k=2)

        # 3. 构造 Prompt
        context = " | ".join([doc for doc, _ in retrieved])
        prompt = f"上下文：{context}\\n问题：{question}\\n回答："

        # 4. 模拟生成答案
        if retrieved and retrieved[0][1] > 0:
            answer = f"根据知识库：{retrieved[0][0]}"
        else:
            answer = "抱歉，知识库中没有相关信息。"

        # 5. 记录回答
        self.memory.add_message("assistant", answer)
        return answer


print("\\n" + "=" * 60)
print("【八】综合应用：智能问答系统")
print("=" * 60)

qa_system = SimpleQA()
qa_system.add_knowledge([
    "Python 由 Guido van Rossum 创建",
    "Python 是解释型语言",
    "TensorFlow 是深度学习框架",
])

questions = [
    "Python 是谁发明的？",
    "TensorFlow 是什么？",
    "什么是机器学习？",
]

for q in questions:
    print(f"\\n用户：{q}")
    print(f"助手：{qa_system.ask(q)}")

print("\\n" + "=" * 60)
print("演示完成！这就是大模型应用开发的核心模式。")
print("实际开发请使用 LangChain / LlamaIndex + GPT/Claude API。")
print("=" * 60)
`,
  },
];
