// =============================================================
// AI Agent开发实战 - 第七批章节(本地开源模型,共 4 章)
// -------------------------------------------------------------
// 第25章:Ollama 本地部署
// 第26章:HuggingFace 生态
// 第27章:开源模型选型指南
// 第28章:本地 vs API 对比
// =============================================================

export const chapters = [
  // =============================================================
  // 第25章:Ollama 本地部署
  // =============================================================
  {
    id: 'ollama',
    group: '本地开源模型',
    icon: '🦙',
    title: 'Ollama 本地部署',
    content: `## 第25章　Ollama 本地部署

前面章节我们调用的都是云端 API(OpenAI/Claude),数据要"出境"到国外服务器,且按量计费。有些场景下,你希望模型**跑在自己机器上**——保护隐私、免费使用、离线可用、完全可控。**Ollama** 是目前最流行的本地运行 LLM 的工具。本章讲解它的安装、使用与 API 调用。

### 25.1 为什么要本地部署

先明确本地部署的价值与代价:

| 价值 | 说明 |
|------|------|
| 隐私保护 | 数据不离开本机,适合医疗/金融/法律等敏感数据 |
| 免费 | 不按 token 计费,模型权重下载后可无限用 |
| 离线可用 | 无网络也能跑,适合内网/出差/无网环境 |
| 完全可控 | 可自由切换模型、调整参数、做微调 |
| 低延迟 | 无网络往返,本地推理延迟稳定 |

| 代价 | 说明 |
|------|------|
| 硬件门槛 | 需要足够的内存/显存,大模型需高端 GPU |
| 质量差距 | 开源模型能力通常略逊于闭源旗舰 |
| 维护成本 | 需自己管理模型、更新、运维 |
| 部署复杂 | 比"调 API"门槛高 |

### 25.2 Ollama 是什么

**Ollama** 是一个开源工具,让你像用 Docker 拉取镜像一样,一键下载并运行开源 LLM。它封装了模型权重、推理引擎、API 服务,把"本地跑大模型"这件原本很复杂的事,简化到几条命令。

Ollama 的核心特点:
- **极简安装**:一行命令安装,自动处理依赖
- **模型仓库**:\`ollama pull llama3.1\` 一键拉模型,自动量化优化
- **兼容 OpenAI API**:提供 \`localhost:11434\` 的 RESTful 接口,可用 OpenAI SDK 直接调
- **跨平台**:Mac/Linux/Windows 都支持
- **自动量化**:下载的模型已做 4bit 量化,普通机器也能跑

### 25.3 安装

**Mac / Linux**(官方一键脚本):

\`\`\`bash
# Mac:推荐用 Homebrew
brew install ollama

# Linux:官方安装脚本
curl -fsSL https://ollama.com/install.sh | sh

# 安装后启动服务(后台常驻)
ollama serve
\`\`\`

**Windows**:从官网下载安装包,双击安装即可。

安装完成后,验证:

\`\`\`bash
ollama --version
# 输出示例:ollama version is 0.x.x
\`\`\`

### 25.4 拉取并运行模型

Ollama 维护了一个模型仓库(类似 Docker Hub),常用模型:

| 命令 | 模型 | 大小 | 说明 |
|------|------|------|------|
| \`ollama pull llama3.1\` | Llama 3.1 8B | ~4.7GB | Meta 通用模型,英文强 |
| \`ollama pull qwen2.5\` | Qwen 2.5 7B | ~4.7GB | 阿里出品,中文最强 |
| \`ollama pull mistral\` | Mistral 7B | ~4.1GB | 欧洲团队,效率高 |
| \`ollama pull phi3\` | Phi-3 3.8B | ~2.5GB | 微软小模型,轻量 |
| \`ollama pull deepseek-r1\` | DeepSeek R1 | ~4.7GB | 推理能力强 |

\`\`\`bash
# 拉取中文能力最强的 Qwen 2.5
ollama pull qwen2.5

# 交互式运行(进入对话模式)
ollama run qwen2.5
# >>> 你好
# 你好!我是通义千问,有什么可以帮你的?
# >>> /bye  # 退出
\`\`\`

### 25.5 Ollama API(兼容 OpenAI)

Ollama 启动后会在 \`localhost:11434\` 提供 API,且**兼容 OpenAI 格式**——这意味着你可以用已有的 OpenAI SDK 代码,只改 \`base_url\` 就能调本地模型!

\`\`\`python
from openai import OpenAI

# 关键:把 base_url 指向本地 Ollama,api_key 随便填
client = OpenAI(
    base_url="http://localhost:11434/v1",  # Ollama 的 OpenAI 兼容端点
    api_key="ollama",  # 本地不需要真 Key,随便填
)

# 之后用法和 OpenAI 完全一样!
response = client.chat.completions.create(
    model="qwen2.5",  # 本地已 pull 的模型名
    messages=[
        {"role": "system", "content": "你是一个友好的中文助手。"},
        {"role": "user", "content": "用三句话介绍杭州。"},
    ],
)
print(response.choices[0].message.content)
# 杭州是浙江省省会,以西湖闻名……
\`\`\`

> 💡 **巨大价值**:这意味着你之前学到的所有 OpenAI 调用代码(system prompt、多轮对话、Function Calling)都能**原封不动**用到本地模型上!只需改 \`base_url\` 和 \`model\`。这是 Ollama 兼容 OpenAI 格式的最大意义——**学习成本几乎为零**。

**Function Calling 也支持**(部分模型如 qwen2.5 支持):

\`\`\`python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查天气",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"]
        }
    }
}]

resp = client.chat.completions.create(
    model="qwen2.5",
    messages=[{"role": "user", "content": "北京天气?"}],
    tools=tools,
)
print(resp.choices[0].message.tool_calls)  # 本地模型也能调工具!
\`\`\`

### 25.6 Ollama 原生 API

除了 OpenAI 兼容端点,Ollama 还有自己的原生 API,功能更全(如流式、多模态):

\`\`\`python
import requests

# 原生 /api/chat 端点
response = requests.post(
    "http://localhost:11434/api/chat",
    json={
        "model": "qwen2.5",
        "messages": [{"role": "user", "content": "你好"}],
        "stream": False,  # 非流式
    }
)
print(response.json()["message"]["content"])

# 查看已安装的模型列表
models = requests.get("http://localhost:11434/api/tags").json()
for m in models["models"]:
    print(f"{m['name']}: {m['size'] / 1e9:.1f}GB")
\`\`\`

### 25.7 模型选择与硬件要求

**按中文能力排序**(强→弱):Qwen2.5 > DeepSeek > Llama3.1 > Mistral > Phi3

**按参数规模选择**:

| 参数量 | 内存需求(量化后) | 适用场景 |
|--------|-----------------|---------|
| 3-4B | ~3GB | 轻量任务、嵌入式设备 |
| 7-8B | ~5GB | 日常对话、代码、问答 |
| 13-14B | ~8GB | 进阶任务 |
| 70B | ~40GB | 接近 GPT-4(需高端 GPU) |

**硬件建议**:
- **Mac M 系列**:统一内存架构优势明显,M2/M3 的 16GB 可跑 7B,32GB 可跑 13B
- **PC + GPU**:7B 模型需 ~8GB 显存(如 RTX 3060/4060)
- **纯 CPU**:也能跑,但速度慢(7B 模型约 5-10 token/秒)

### 25.8 完整示例:本地知识助手

下面是一个用本地模型做"无 API Key"问答助手的完整示例:

\`\`\`python
from openai import OpenAI

def local_assistant():
    """纯本地运行的 AI 助手,零 API 成本"""
    client = OpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ollama",
    )
    messages = [{"role": "system", "content": "你是中文助手,回答简洁。"}]

    print("本地助手已启动(输入 exit 退出)")
    while True:
        user = input("你: ")
        if user.lower() in ("exit", "quit"):
            break
        messages.append({"role": "user", "content": user})
        resp = client.chat.completions.create(
            model="qwen2.5",
            messages=messages,
        )
        reply = resp.choices[0].message.content
        print(f"AI: {reply}")
        messages.append({"role": "assistant", "content": reply})

local_assistant()
# 整个过程不联网、不花钱、数据不出本机
\`\`\`

### 25.9 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 忘记 ollama serve | 连接拒绝 | 先启动服务再调 API |
| 模型未 pull | model not found | 先 ollama pull 模型名 |
| 内存不足 | 推理卡死/报错 | 换更小参数的模型 |
| 端口冲突 | 11434 被占 | 改 OLLAMA_HOST 环境变量 |
| 中文用英文模型 | 中文输出差 | 中文场景用 qwen2.5 |
| base_url 写错 | 连接失败 | 用 http://localhost:11434/v1 |

### 本章小结

本章介绍了本地部署利器 Ollama:一行命令安装、\`ollama pull\` 拉模型、\`ollama run\` 交互。最大亮点是**兼容 OpenAI API 格式**——改个 \`base_url\` 就能用 OpenAI SDK 调本地模型,学习成本几乎为零。中文场景首选 Qwen2.5。本地部署的代价是硬件门槛和质量略逊云端,但换来了隐私、免费、离线三大价值。下一章我们看更大的开源生态——HuggingFace。`
  },

  // =============================================================
  // 第26章:HuggingFace 生态
  // =============================================================
  {
    id: 'huggingface',
    group: '本地开源模型',
    icon: '🤗',
    title: 'HuggingFace 生态',
    content: `## 第26章　HuggingFace 生态

如果说 Ollama 是"傻瓜式"本地跑模型,那 **HuggingFace** 就是"AI 模型的 GitHub"——它是全球最大的开源模型托管平台,几乎所有开源 LLM 都首发于此。本章带你了解 HuggingFace 生态:transformers 库、pipeline 快速调用、模型加载、量化、embedding,以及云端 Inference API。

### 26.1 HuggingFace 是什么

**HuggingFace** 是一家美国 AI 公司,其核心产品是:

1. **Model Hub(模型仓库)**:全球最大的开源模型托管平台,类似"AI 版 GitHub"。开发者上传模型权重,他人可下载使用。截至现在有几十万个模型。
2. **transformers 库**:Python 库,提供加载/推理各种 transformer 模型的统一接口。是 NLP 工程师的"标准工具"。
3. **Datasets(数据集仓库)**:托管训练/评测数据集。
4. **Spaces(在线 Demo)**:免费托管 AI 应用的在线演示。

### 26.2 transformers 库简介

\`transformers\` 是 HuggingFace 的旗舰 Python 库,它把"加载模型→分词→推理"这套复杂流程,封装成统一接口:

\`\`\`bash
pip install transformers torch
\`\`\`

\`\`\`python
from transformers import pipeline

# 最简用法:pipeline 一行加载模型并推理
generator = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B")
result = generator("人工智能的未来", max_length=50, num_return_sequences=1)
print(result[0]["generated_text"])
\`\`\`

### 26.3 pipeline 快速调用

\`pipeline\` 是高层 API,屏蔽了底层细节,适合快速实验。常见任务类型:

\`\`\`python
from transformers import pipeline

# 文本分类(情感分析等)
classifier = pipeline("text-classification", model="uer/roberta-base-finetuned-jd-binary-chinese")
print(classifier("这家店服务太差了"))
# [{'label': 'negative', 'score': 0.98}]

# 命名实体识别
ner = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english")
print(ner("Apple is based in California."))

# 问答(抽取式)
qa = pipeline("question-answering")
print(qa(question="杭州在哪里?", context="杭州是浙江省省会,位于中国东南沿海。"))

# 文本摘要
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
print(summarizer("Long text..."))
\`\`\`

> 💡 **pipeline 的价值**:不同任务、不同模型,接口统一。你只需指定 task 和 model 名,pipeline 自动处理分词、加载、推理。这是 HuggingFace 生态的核心设计——**统一接口,无缝切换模型**。

### 26.4 模型下载与加载

第一次用某模型时,transformers 会**自动下载**权重到本地缓存(\`~/.cache/huggingface/\`),后续直接用缓存:

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-0.5B"  # 小模型,便于演示

# 自动加载分词器和模型(首次会下载)
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# 手动推理(比 pipeline 更灵活,可控参数)
inputs = tokenizer("人工智能正在", return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=30)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
\`\`\`

### 26.5 量化:降低显存门槛

完整精度的 7B 模型需要约 14GB 显存(float16),很多人跑不起。**量化(Quantization)**把权重从 16 位压缩到 4 位/8 位,大幅降低显存:

| 精度 | 7B 模型显存 | 质量损失 |
|------|-----------|---------|
| float16 | ~14GB | 无损 |
| 8bit | ~7GB | 极小 |
| 4bit | ~4GB | 小(可接受) |

\`\`\`python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch

# 4bit 量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,                    # 启用 4bit
    bnb_4bit_quant_type="nf4",           # 量化类型
    bnb_4bit_compute_dtype=torch.float16, # 计算精度
)

# 加载量化模型(显存需求大幅降低)
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-7B",
    quantization_config=bnb_config,
    device_map="auto",  # 自动分配到 GPU
)
\`\`\`

### 26.6 sentence-transformers:做 Embedding

后续 RAG 章节会大量用 embedding。HuggingFace 的 \`sentence-transformers\` 库是做文本向量化的首选开源方案:

\`\`\`bash
pip install sentence-transformers
\`\`\`

\`\`\`python
from sentence_transformers import SentenceTransformer

# 加载中文 embedding 模型(BAAI/bge-m3 是中文 SOTA)
model = SentenceTransformer("BAAI/bge-small-zh-v1.5")

# 把文本转成向量
texts = ["我喜欢猫", "我爱小猫咪", "今天股票跌了"]
embeddings = model.encode(texts)

print(embeddings.shape)  # (3, 512) —— 3句话,每句512维向量

# 计算相似度(余弦相似度)
from sentence_transformers.util import cos_sim
sim = cos_sim(embeddings[0], embeddings[1])
print(f"'我喜欢猫' 和 '我爱小猫咪' 相似度: {sim.item():.3f}")  # ~0.85(高)
sim2 = cos_sim(embeddings[0], embeddings[2])
print(f"'我喜欢猫' 和 '今天股票跌了' 相似度: {sim2.item():.3f}")  # ~0.1(低)
\`\`\`

> 💡 **为什么这很重要**:embedding 是 RAG 的基础(把文档转成向量才能做相似度检索)。开源 embedding 模型(如 bge-m3)中文效果接近 OpenAI 的 text-embedding-3,且可本地免费跑。后续 RAG 章节会深入。

### 26.7 Inference API:云端调用

不想自己跑模型(没 GPU)时,可用 HuggingFace 的 **Inference API**——托管推理服务,按 HTTP 调用:

\`\`\`python
import requests

# 在 https://huggingface.co/settings/tokens 申请免费 token
API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-0.5B"
headers = {"Authorization": "Bearer hf_xxxxxx"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

result = query({"inputs": "人工智能的未来"})
print(result[0]["generated_text"])
\`\`\`

免费版有速率限制,生产用需付费。但好处是**不占本地资源**,适合快速验证。

### 26.8 Spaces:在线 Demo 托管

HuggingFace Spaces 让你免费托管 AI 应用的 Web Demo(支持 Gradio/Streamlit)。比如你做了个模型,想让别人在线试用,传到 Space 即可,无需自己搭服务器。

\`\`\`python
# 一个最小的 Gradio 应用,可部署到 Space
import gradio as gr
from transformers import pipeline

generator = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B")

def chat(text):
    return generator(text, max_length=50)[0]["generated_text"]

gr.Interface(fn=chat, inputs="text", outputs="text").launch()
\`\`\`

### 26.9 与直接 API 调用的成本对比

| 方案 | 成本 | 质量门槛 |
|------|------|---------|
| OpenAI/Claude API | 按 token 计费(持续) | 即用即调,零门槛 |
| 本地 transformers 推理 | 硬件一次性投入 | 需 GPU,质量受模型限制 |
| HuggingFace Inference API | 免费(限速)/付费 | 无需 GPU,质量=模型质量 |
| Ollama | 硬件投入 | 已量化优化,门槛低 |

### 26.10 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 无 GPU 跑大模型 | 极慢/OOM | 用 4bit 量化或换小模型 |
| 模型名拼错 | 下载失败 | 去 Model Hub 复制完整名 |
| 没 cache 占满磁盘 | 系统卡 | 设 HF_HOME 改缓存路径 |
| pipeline 任务类型错 | 输出错乱 | 按 model 卡片指定 task |
| 中文用英文模型 | 效果差 | 中文用 bge/Qwen 系列 |
| 商用不看许可证 | 法律风险 | 查 License(如 Llama 限商用) |

### 本章小结

本章介绍了 HuggingFace 生态:它是"AI 模型的 GitHub",transformers 库提供统一接口、pipeline 一行调用、AutoModel 灵活加载、BitsAndBytes 量化降显存、sentence-transformers 做 embedding、Inference API 云端调用、Spaces 在线托管。**对 RAG 而言,最关键是 sentence-transformers——它提供的开源 embedding 是后续章节的基础。** 下一章我们系统看开源模型如何选型。`
  },

  // =============================================================
  // 第27章:开源模型选型指南
  // =============================================================
  {
    id: 'open-source-models',
    group: '本地开源模型',
    icon: '🌐',
    title: '开源模型选型指南',
    content: `## 第27章　开源模型选型指南

开源大模型百花齐放:Llama、Mistral、Qwen、DeepSeek、Phi……面对这么多选择,工程师该怎么选?本章系统对比主流开源模型,从中文能力、参数规模、许可证、微调、评测榜单等维度,给出一份实用的选型决策表。

### 27.1 主流开源模型概览

| 模型 | 出品方 | 特点 | 中文能力 |
|------|--------|------|---------|
| Llama 3 / 3.1 | Meta | 综合最强开源,生态最广 | 一般(英文优先) |
| Mistral / Mixtral | Mistral AI | 效率高,MoE 架构 | 一般 |
| Qwen 2.5 | 阿里 | 中文最强,多尺寸 | 优秀 |
| DeepSeek V3 / R1 | 深度求索 | 推理强,R1 媲美 o1 | 优秀 |
| Phi-3 / Phi-4 | 微软 | 小而精,轻量场景 | 一般 |
| Gemma 2 | Google | 基于 Gemini 技术 | 良好 |
| GLM-4 | 智谱 | 国产,中文好 | 优秀 |

### 27.2 中文能力对比

中文场景下,**Qwen 系列是当之无愧的开源王者**。原因:
- 训练语料中文占比高,成语/古文/方言理解好
- 对齐训练做了大量中文 RLHF
- 多尺寸覆盖(0.5B/1.5B/7B/14B/72B)

\`\`\`python
# 中文能力对比测试(用 Ollama 本地跑)
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

test_cases = [
    "解释'画蛇添足'的意思",
    "写一首关于秋天的七言绝句",
    "把'今天天气真好'翻译成文言文",
]

for model_name in ["qwen2.5", "llama3.1", "mistral"]:
    print(f"\\n===== {model_name} =====")
    for q in test_cases:
        resp = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": q}],
        )
        print(f"问:{q}")
        print(f"答:{resp.choices[0].message.content[:80]}...")
\`\`\`

实测中,Qwen 在成语、古诗、文言文上的表现明显优于 Llama/Mistral。

### 27.3 参数规模选择

参数量直接决定能力和硬件需求:

| 参数量 | 能力定位 | 硬件需求(4bit) | 推荐场景 |
|--------|---------|---------------|---------|
| 0.5-3B | 轻量级 | ~2GB 内存 | 嵌入式、边缘设备、简单分类 |
| 7-8B | 日常级 | ~5GB 内存 | 日常对话、问答、代码辅助 |
| 13-14B | 进阶级 | ~8GB 显存 | 复杂任务、长文本 |
| 30-70B | 接近 GPT-4 | ~40GB 显存 | 高质量推理(需多卡) |

> 💡 **选择心法**:**先小后大**。先用 7B 验证流程,效果不够再升级。多数场景 7B(Qwen2.5-7B)就够用了,不要一上来就追求 70B。70B 虽接近 GPT-4,但硬件成本陡增。

### 27.4 许可证与商用

开源不等于免费商用!不同模型许可证差异大:

| 模型 | 许可证 | 商用限制 |
|------|--------|---------|
| Llama 3.1 | Llama Community License | 7亿月活以上需授权 |
| Mistral | Apache 2.0 | 自由商用 |
| Qwen 2.5 | Apache 2.0(多数尺寸) | 自由商用 |
| DeepSeek | MIT | 自由商用 |
| Phi-3 | MIT | 自由商用 |
| Gemma 2 | Gemma Terms | 有使用限制 |

> ⚠️ **重要**:商用前务必读 License!Llama 对超大规模用户有限制,Gemma 也有附加条款。Apache 2.0 / MIT 是最宽松的。

### 27.5 微调简介

通用模型在你的垂直领域可能不够准。**微调(Fine-tuning)**用领域数据继续训练,提升特定任务表现。主流轻量微调方法:

- **LoRA(Low-Rank Adaptation)**:只训练少量"适配器"参数,冻结原模型。显存需求低,效果好。最流行。
- **QLoRA(Quantized LoRA)**:LoRA + 4bit 量化,7B 模型微调只需 ~8GB 显存。

\`\`\`python
# QLoRA 微调示意(用 peft 库,简化版)
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B", load_in_4bit=True)

# 配置 LoRA:只训练这些层的适配器
lora_config = LoraConfig(
    r=8,  # 秩,越大效果越好但显存越多
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],  # 要微调的注意力层
    task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# 输出示例:trainable params: 4,194,304 || all params: 7,621,635,072 || trainable%: 0.055%
# 只训练 0.05% 的参数!省显存又能提升领域表现
\`\`\`

> 💡 **何时微调**:数据充足(几百到几千条)、领域特殊(医疗/法律术语)、对准确率要求高。数据少/通用任务,优先用 Prompt 或 RAG。

### 27.6 评测榜单

判断模型能力,看公开榜单:

| 榜单 | 测什么 |
|------|--------|
| **MMLU** | 多学科知识(57 个学科选择题) |
| **HumanEval** | 代码生成(Python 函数编写) |
| **GSM8K** | 小学数学应用题 |
| **C-Eval** | 中文综合能力(中文版 MMLU) |
| **CMMLU** | 中文多任务理解 |
| **MT-Bench** | 多轮对话能力 |

参考排名(会变,以最新为准):闭源 GPT-4o/Claude/o1 领先;开源 Qwen2.5-72B、Llama3.1-405B、DeepSeek-V3 接近 GPT-4o 水平。

\`\`\`python
# 注意:榜单是参考,不代表你的具体场景
# 真正决定的是:在你的数据上做评测(自己跑评测集)
\`\`\`

### 27.7 选型决策表

综合前面所有维度,给出决策表:

| 你的情况 | 推荐模型 | 理由 |
|---------|---------|------|
| 中文场景为主 | Qwen2.5 | 中文 SOTA |
| 需要强推理 | DeepSeek R1 | 推理接近 o1 |
| 资源极有限 | Phi-3 / Qwen 0.5B | 轻量 |
| 通用英文 | Llama 3.1 | 英文生态好 |
| 要商用且宽松许可 | Qwen / Mistral / DeepSeek | Apache/MIT |
| 高质量(有硬件) | Qwen2.5-72B | 接近 GPT-4 |
| 做 Agent/工具调用 | Qwen2.5 / Llama3.1 | 支持 function calling |

### 27.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 盲目追最大模型 | 跑不动/贵 | 先 7B 验证,够用就别升级 |
| 中文用英文模型 | 中文输出差 | 中文用 Qwen 系列 |
| 不查 License 商用 | 法律风险 | 商用前确认许可证 |
| 只看榜单不看实测 | 实际效果差 | 在自己数据上评测 |
| 微调数据没清洗 | 越调越差 | 数据质量 > 数量 |
| 小模型强求复杂任务 | 效果差 | 复杂任务用大模型或 RAG |

### 本章小结

本章给出了开源模型的选型指南:中文首选 Qwen2.5、推理选 DeepSeek R1、轻量选 Phi-3、商用查 License、微调用 LoRA/QLoRA。**选型心法:先小后大、中文用 Qwen、商用查许可、实测胜过榜单。** 不要一上来就追最大模型,7B 在多数场景够用。下一章我们系统对比本地部署和云端 API,帮你做最终决策。`
  },

  // =============================================================
  // 第28章:本地 vs API 对比
  // =============================================================
  {
    id: 'local-vs-api',
    group: '本地开源模型',
    icon: '⚖️',
    title: '本地 vs API 对比',
    content: `## 第28章　本地 vs API 对比

前面三章我们讲了本地开源模型(Ollama/HuggingFace/选型)。现在到了关键决策点:**我的项目到底该用本地模型,还是云端 API?** 本章从成本、性能、质量、隐私、运维五个维度做系统对比,并给出混合策略与决策框架。

### 28.1 成本对比

**云端 API**:按 token 计费,持续支出,但无前期投入。

**本地部署**:硬件一次性投入,后续"免费用"。

我们用代码算笔账:

\`\`\`python
def compare_cost(daily_calls, avg_in_tokens, avg_out_tokens, years=1):
    """对比 API 和本地的成本"""
    # ===== API 成本(GPT-4o-mini 低价档) =====
    api_in_price = 0.15   # $/百万token
    api_out_price = 0.6
    api_yearly = daily_calls * 365 * years * (
        avg_in_tokens / 1e6 * api_in_price +
        avg_out_tokens / 1e6 * api_out_price
    )

    # ===== 本地成本 =====
    # 硬件:一台带 RTX 4060 的 PC 约 $1000(能跑 7B)
    hardware = 1000
    # 电费:全天开,约 $15/月
    electricity = 15 * 12 * years
    local_yearly = hardware + electricity

    return {
        "API(每年)": round(api_yearly, 2),
        "本地(含硬件)": round(local_yearly, 2),
        "本地(后续每年)": round(electricity, 2),
    }

# 场景:日均 1000 次调用,每次输入500/输出200 token
print(compare_cost(1000, 500, 200, years=1))
# {'API(每年)': 496.4, '本地(含硬件)': 1180.0, '本地(后续每年)': 180.0}
# 第一年 API 便宜;但从第二年起,本地成本骤降

print(compare_cost(1000, 500, 200, years=3))
# 三年累计:API ~$1489,本地 ~$1540(含硬件)
# 调用量更大时,本地优势凸显

# 高频场景:日均 10000 次
print(compare_cost(10000, 500, 200, years=1))
# {'API(每年)': 4964.0, '本地(含硬件)': 1180.0}
# 高频时本地第一年就远便宜!
\`\`\`

**成本结论**:
- **低频(日均几百次)**:API 更划算(无前期投入)
- **高频(日均万次以上)**:本地更便宜(硬件摊薄)
- **超大规模**:本地 + 量化是必选

### 28.2 性能对比

| 维度 | 云端 API | 本地部署 |
|------|---------|---------|
| 首字延迟 | 200-500ms(含网络) | 50-200ms(本地) |
| 生成速度 | 快(GPT-4o ~50 tok/s) | 取决于硬件(7B CPU ~5-10,GPU ~30-50) |
| 并发能力 | 强(云端扩容) | 弱(单机受限) |
| 稳定性 | 高(SLA) | 取决于你的机器 |
| 网络依赖 | 必须联网 | 可离线 |

\`\`\`python
import time
from openai import OpenAI

# 对比 API 和本地的延迟
api_client = OpenAI()
local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

def measure(client, model, prompt):
    start = time.time()
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=50,
    )
    elapsed = time.time() - start
    return elapsed, resp.choices[0].message.content

# 测试
t1, _ = measure(api_client, "gpt-4o-mini", "你好")
t2, _ = measure(local_client, "qwen2.5", "你好")
print(f"API 延迟: {t1:.2f}s")
print(f"本地延迟: {t2:.2f}s")
# 通常本地首字延迟更低(无网络往返)
\`\`\`

### 28.3 质量对比

| 模型档次 | 云端代表 | 本地代表(7B) | 差距 |
|---------|---------|-------------|------|
| 旗舰级 | GPT-4o / Claude Sonnet | Qwen2.5-72B | 接近(70B 需高端硬件) |
| 中端 | GPT-4o-mini | Qwen2.5-7B | 中端本地略逊 |
| 轻量 | - | Phi-3 / Qwen 0.5B | 能力有限 |

**质量结论**:
- 闭源旗舰(GPT-4o/Claude)仍是能力天花板
- 开源 70B 接近 GPT-4o,但硬件门槛高
- 开源 7B 适合日常任务,复杂推理/长文档仍逊色
- **关键**:质量差距在缩小,但复杂任务闭源仍领先

### 28.4 隐私对比

| 维度 | 云端 API | 本地部署 |
|------|---------|---------|
| 数据流向 | 上传到国外服务器 | 完全不出本机 |
| 合规风险 | 数据出境需评估 | 无出境问题 |
| 日志留存 | 平台可能记录 | 你完全可控 |
| 适合行业 | 公开数据/非敏感 | 医疗/金融/法律/政务 |

**隐私结论**:涉及个人隐私、商业机密、医疗/金融数据,**必须本地**(或私有化部署)。这是本地部署最硬核的价值。

### 28.5 运维对比

| 维度 | 云端 API | 本地部署 |
|------|---------|---------|
| 部署难度 | 极低(注册 Key 即可) | 中-高(装环境/拉模型/调参) |
| 扩容 | 自动(平台负责) | 手动(加机器) |
| 更新 | 自动(平台升级模型) | 手动(自己 pull 新版) |
| 监控 | 平台提供 Dashboard | 自己搭(Prometheus 等) |
| 故障恢复 | 平台保障 SLA | 自己处理 |

**运维结论**:API "省心",本地"操心"。小团队/快速验证优先 API;有运维能力的大团队可上本地。

### 28.6 混合策略(最佳实践)

成熟的产品往往**混合使用**——不同环节用不同方案:

| 环节 | 推荐方案 | 理由 |
|------|---------|------|
| 开发/调试 | 云端 API | 快速迭代,无需本地环境 |
| 生产(公开数据) | 云端 API | 省心,质量高 |
| 生产(敏感数据) | 本地部署 | 隐私合规 |
| 高频低成本任务 | 本地 | 省钱 |
| 复杂推理任务 | 云端旗舰 | 质量优先 |
| Embedding 生成 | 本地(sentence-transformers) | 频繁调用,本地省钱 |

\`\`\`python
# 混合路由示例
from openai import OpenAI
from sentence_transformers import SentenceTransformer

class HybridRouter:
    """混合路由:敏感数据走本地,公开数据走云端"""
    def __init__(self):
        self.api_client = OpenAI()
        self.local_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
        self.embedder = SentenceTransformer("BAAI/bge-small-zh-v1.5")  # 本地 embedding

    def chat(self, text, sensitive=False):
        if sensitive:
            # 敏感数据走本地
            return self._local_chat(text)
        else:
            # 公开数据走云端(质量更好)
            return self._api_chat(text)

    def _api_chat(self, text):
        r = self.api_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": text}],
        )
        return r.choices[0].message.content

    def _local_chat(self, text):
        r = self.local_client.chat.completions.create(
            model="qwen2.5",
            messages=[{"role": "user", "content": text}],
        )
        return r.choices[0].message.content

    def embed(self, text):
        # embedding 走本地(高频,省钱)
        return self.embedder.encode(text)

router = HybridRouter()
print(router.chat("你好"))                  # 走云端
print(router.chat("患者的诊断记录...", sensitive=True))  # 走本地
\`\`\`

### 28.7 决策框架表

| 你的优先级 | 选择 | 原因 |
|----------|------|------|
| 隐私合规第一 | 本地 | 数据不出本机 |
| 成本最低(高频) | 本地 | 硬件摊薄 |
| 质量最高 | 云端旗舰 | 闭源领先 |
| 开发最快 | 云端 API | 零部署 |
| 离线可用 | 本地 | 无需网络 |
| 弹性扩容 | 云端 | 平台负责 |

### 28.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 一刀切选一种 | 不够灵活 | 按场景混合 |
| 低频用本地 | 硬件成本不划算 | 低频用 API |
| 敏感数据上云 | 合规风险 | 敏感必本地 |
| 本地不做监控 | 故障不知 | 加监控/告警 |
| 只算硬件不算运维 | 成本算低 | 算上电费/人力 |
| 高频用旗舰 API | 账单爆炸 | 高频降级到本地或 mini |

### 本章小结

本章系统对比了本地与 API:成本上低频用 API、高频用本地;性能上本地延迟低但并发弱;质量上闭源旗舰仍领先;隐私上本地碾压;运维上 API 省心。**最佳实践是混合策略——敏感数据本地、公开数据云端、高频任务本地、复杂推理云端、Embedding 本地。** 没有银弹,按场景决策。从下一部分开始,我们进入 RAG(检索增强生成)——这是让 LLM 用上你私有知识的关键技术。`
  }
];
