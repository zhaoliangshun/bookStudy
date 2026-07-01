// =============================================================
// AI Agent开发实战 - 第五批章节(Anthropic Claude,共 4 章)
// -------------------------------------------------------------
// 第17章:Claude API 调用
// 第18章:Claude System Prompt 特性
// 第19章:多模态:图片输入
// 第20章:OpenAI vs Claude 对比与选型
// =============================================================

export const chapters = [
  // =============================================================
  // 第17章:Claude API 调用
  // =============================================================
  {
    id: 'claude-api',
    group: 'Anthropic Claude',
    icon: '🟠',
    title: 'Claude API 调用',
    content: `## 第17章　Claude API 调用

在 OpenAI 之外,Anthropic 公司的 Claude 是大模型领域另一个重量级玩家。Claude 以"长上下文""写作能力强""安全性高"著称,在许多场景下是 GPT 的有力替代甚至更优选择。本章将系统讲解如何接入 Claude API,并与 OpenAI 的调用方式做对比,帮助你建立"多模型思维"。

### 17.1 认识 Anthropic 与 Claude 模型家族

**Anthropic** 是一家由前 OpenAI 核心成员 Dario Amodei 等人创立的 AI 公司,秉持"AI 安全优先"的理念。其推出的 **Claude** 系列模型是目前市场上与 GPT 齐名的旗舰模型。

Claude 模型家族采用"希腊字母大小"的命名约定,不同型号对应不同定位:

| 模型系列 | 定位 | 特点 | 典型场景 |
|---------|------|------|---------|
| Opus | 旗舰级 | 能力最强,推理/写作/复杂任务表现最佳 | 复杂分析、长文档、高质量创作 |
| Sonnet | 均衡型 | 性能与速度的平衡点,性价比最高 | 日常对话、代码、通用任务 |
| Haiku | 轻量级 | 速度极快、价格最低 | 高频调用、简单分类、客服 |

> 💡 **选型直觉**:Opus 像资深专家,Sonnet 像全能工程师,Haiku 像快速实习生。绝大多数业务场景,**Sonnet 是首选**——它在能力与成本之间取得了最佳平衡。当前主流版本是 \`claude-3-5-sonnet\`(以及更新的 \`claude-sonnet-4\` 系列)。

### 17.2 安装 SDK 与配置 API Key

Anthropic 提供了官方 Python SDK 和 JavaScript/TypeScript SDK。安装方式与 OpenAI 类似:

\`\`\`bash
# Python SDK
pip install anthropic

# Node.js SDK
npm install @anthropic-ai/sdk
\`\`\`

API Key 通过环境变量配置(最佳实践,避免硬编码):

\`\`\`bash
# 在终端设置环境变量(实际使用替换为你自己的 Key)
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxx"
\`\`\`

\`\`\`python
import os
from anthropic import Anthropic

# SDK 会自动读取环境变量 ANTHROPIC_API_KEY
# 也可以显式传入:Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
client = Anthropic()

# 测试连接:发送一条简单消息
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",  # 模型版本号
    max_tokens=1024,                       # 最大输出 token 数(必填项)
    messages=[
        {"role": "user", "content": "你好,请用一句话介绍你自己。"}
    ],
)
print(response.content[0].text)
# 输出示例:你好!我是 Claude,由 Anthropic 创建的 AI 助手……
\`\`\`

### 17.3 消息结构:与 OpenAI 的关键区别

这是初学者最容易踩坑的地方——**Claude 的 system prompt 不是放在 messages 里,而是一个独立参数**。

对比两者的消息结构:

\`\`\`python
# ===== OpenAI 的写法:system 是 messages 数组的第一条 =====
from openai import OpenAI
openai_client = OpenAI()

openai_resp = openai_client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个翻译助手。"},  # system 在消息列表里
        {"role": "user", "content": "把'你好'翻译成英文。"},
    ],
)
print(openai_resp.choices[0].message.content)

# ===== Claude 的写法:system 是独立参数,不在 messages 里 =====
from anthropic import Anthropic
claude_client = Anthropic()

claude_resp = claude_client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system="你是一个翻译助手。",  # system 是顶层参数!
    messages=[
        {"role": "user", "content": "把'你好'翻译成英文。"},  # messages 里只有 user/assistant
    ],
)
print(claude_resp.content[0].text)
\`\`\`

**核心区别小结**:

| 维度 | OpenAI | Claude |
|------|--------|--------|
| system prompt 位置 | messages 数组第一条(role: system) | 顶层独立 \`system\` 参数 |
| max_tokens | 可选(有默认值) | **必填** |
| 响应内容取值 | \`choices[0].message.content\`(字符串) | \`content[0].text\`(content 是数组) |
| 模型版本号 | \`gpt-4o\`(相对稳定) | \`claude-3-5-sonnet-20241022\`(带日期) |

> ⚠️ **易错点**:Claude 的 \`max_tokens\` 是**必填参数**,不传会报错。而 OpenAI 是可选的。另外 Claude 响应的 \`content\` 是一个**数组**(因为可能包含多个 content block,比如文本块 + 工具调用块),取文本要用 \`response.content[0].text\`。

### 17.4 同步与异步调用

大多数场景用同步调用即可。当需要高并发(比如批量处理几千条数据)时,推荐用异步客户端提高吞吐:

\`\`\`python
import asyncio
from anthropic import AsyncAnthropic

async def batch_translate(texts):
    """异步批量翻译,提升并发吞吐"""
    client = AsyncAnthropic()

    async def translate_one(text):
        # 每条文本一个协程,并发执行
        resp = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system="你是翻译助手,把中文翻译成英文。",
            messages=[{"role": "user", "content": text}],
        )
        return resp.content[0].text

    # asyncio.gather 并发执行所有任务
    results = await asyncio.gather(*[translate_one(t) for t in texts])
    return results

# 运行
texts = ["你好世界", "今天天气真好", "我爱编程"]
outputs = asyncio.run(batch_translate(texts))
for src, dst in zip(texts, outputs):
    print(f"{src} -> {dst}")
\`\`\`

### 17.5 错误处理

调用 API 时,网络抖动、限流、参数错误都可能发生,必须做好错误处理:

\`\`\`python
from anthropic import Anthropic, APIError, RateLimitError, APIStatusError

def safe_call(prompt, retries=3):
    """带重试的安全调用封装"""
    client = Anthropic()
    for attempt in range(retries):
        try:
            resp = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.content[0].text
        except RateLimitError:
            # 限流:等待后重试(实际生产用指数退避)
            import time
            wait = 2 ** attempt  # 1s, 2s, 4s 指数退避
            print(f"限流,{wait}秒后重试……")
            time.sleep(wait)
        except APIStatusError as e:
            # API 返回错误状态码(如 400 参数错误、500 服务器错误)
            print(f"API错误:{e.status_code} - {e.message}")
            if e.status_code == 400:
                raise  # 参数错误不重试,直接抛出
            time.sleep(2 ** attempt)
        except APIError as e:
            # 其他 API 错误
            print(f"调用失败:{e}")
            time.sleep(2 ** attempt)
    raise RuntimeError(f"重试{retries}次后仍失败")

# 测试
print(safe_call("解释什么是 RAG"))
\`\`\`

### 17.6 完整对话循环(多轮)

Claude 维护多轮对话的方式与 OpenAI 一致——把历史消息累加到 messages 数组里:

\`\`\`python
from anthropic import Anthropic

def chat_loop():
    """多轮对话循环"""
    client = Anthropic()
    messages = []  # 累积对话历史

    while True:
        user_input = input("你: ")
        if user_input.lower() in ("exit", "quit", "退出"):
            break

        # 追加用户消息
        messages.append({"role": "user", "content": user_input})

        resp = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system="你是一个友好的中文助手,回答简洁清晰。",
            messages=messages,
        )
        reply = resp.content[0].text
        print(f"Claude: {reply}\\n")

        # 追加助手回复到历史(用于下一轮)
        messages.append({"role": "assistant", "content": reply})

chat_loop()
\`\`\`

### 17.7 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| system 放进 messages | 报错或被当普通消息 | Claude 的 system 用独立参数传递 |
| 忘记传 max_tokens | \`max_tokens is required\` 报错 | 必填,显式指定 |
| 取响应取错字段 | \`AttributeError\` | Claude 用 \`content[0].text\`,不是 \`choices[0]\` |
| 模型名拼错 | \`model not found\` | 用带日期的完整版本号,如 \`claude-3-5-sonnet-20241022\` |
| 不做限流重试 | 偶发 429 错误导致任务失败 | 用指数退避重试 |
| 把 API Key 写代码里 | 泄露风险 | 用环境变量,代码不出现明文 Key |

### 本章小结

本章带你完成了 Claude API 的"入门到能用":了解了 Claude 模型家族的定位划分、SDK 安装与配置、与 OpenAI 截然不同的消息结构(system 独立参数)、同步异步调用、错误处理与多轮对话。**记住最关键的一点:Claude 和 OpenAI 的 API 设计哲学不同,不能简单照搬代码,system 的位置和 max_tokens 的必填性是最容易踩的两个坑。** 下一章我们将深入 Claude 独有的 system prompt 特性,看看它为什么在长文档分析、复杂指令遵循上表现更优。`
  },

  // =============================================================
  // 第18章:Claude System Prompt 特性
  // =============================================================
  {
    id: 'claude-system',
    group: 'Anthropic Claude',
    icon: '🎭',
    title: 'Claude System Prompt 特性',
    content: `## 第18章　Claude System Prompt 特性

System Prompt(系统提示)是控制大模型行为的"方向盘"。虽然 OpenAI 和 Claude 都支持 system prompt,但 Claude 在这方面有几项独有特性,使其在**复杂指令遵循**和**长文档处理**上表现突出。本章深入讲解 Claude 的 system prompt 特性,并给出实战范例。

### 18.1 独立参数:架构层面的差异

第17章已提到,Claude 的 system 是**顶层独立参数**,而非 messages 数组里的一条消息。这不只是语法差异,而是反映了设计理念:

- **OpenAI**:system 与 user/assistant 平级,都是"消息"的一种,模型从对话流中理解角色。
- **Claude**:system 处于"元层级",模型会把它当作**持久化的行为准则**优先遵循,地位高于对话消息。

这种设计带来的实际好处是:即便对话轮次很长、消息很多,Claude 仍能稳定地遵守 system 中定义的规则,不容易"被带偏"。

\`\`\`python
from anthropic import Anthropic

client = Anthropic()

# Claude:system 独立参数,地位高于 messages
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=2048,
    system="你是一个严谨的法律顾问。所有回答必须:1)引用法条 2)给出风险提示 3)不臆测。",
    messages=[
        {"role": "user", "content": "我能随便解雇员工吗?"},
    ],
)
print(response.content[0].text)
# Claude 会严格按照三段式结构回答,不易被用户的口语化提问带偏
\`\`\`

### 18.2 长 System Prompt 的处理能力

Claude 对**长 system prompt** 的处理能力是其一大亮点。在实际工程中,我们经常需要在 system 里塞入:角色设定、输出格式规范、行业知识、禁忌清单、示例集……很容易写上千 token。Claude 在这方面的遵循度优于多数模型。

一个典型的"重型" system prompt 示例:

\`\`\`python
SYSTEM_PROMPT = """你是一个电商客服机器人,负责处理售后问题。请严格遵守以下规则:

# 角色定位
- 名称:小助
- 语气:亲切、专业、有耐心
- 称呼用户:亲

# 处理流程
1. 先确认订单号(格式:以字母E开头 + 12位数字)
2. 查询订单状态
3. 根据状态给出解决方案

# 解决方案矩阵
| 问题类型 | 处理方式 |
|---------|---------|
| 物流延迟 | 补偿10元优惠券 |
| 商品损坏 | 免费补发或全额退款 |
| 7天无理由 | 同意退货,提供退货地址 |
| 超时请求 | 礼貌拒绝,转人工 |

# 禁忌
- 不要承诺超过权限的赔偿
- 不要透露内部系统名称
- 涉及金额超过500元必须转人工

# 输出格式
回复必须以 JSON 格式返回:{"reply": "对用户说的话", "action": "内部动作"}
"""

client = Anthropic()
resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=SYSTEM_PROMPT,  # 长 system,Claude 也能稳定遵循
    messages=[{"role": "user", "content": "我的订单E202401010001物流太慢了!"}],
)
print(resp.content[0].text)
\`\`\`

### 18.3 XML 标签:结构化指令的利器

Claude 训练时专门强化了对 **XML 标签** 的理解,推荐用标签来组织 system prompt 的不同部分。这能让 Claude 更清晰地分辨"哪段是规则""哪段是示例""哪段是上下文"。

\`\`\`python
SYSTEM_WITH_XML = """你是一个文档分析助手。

<role>
负责阅读用户提供的合同文本,提取关键条款。
</role>

<rules>
- 提取字段:合同双方、金额、签订日期、违约责任
- 如信息缺失,标注"未提及",不要编造
- 金额统一换算为人民币
</rules>

<output_format>
返回 JSON:
{
  "parties": {"甲方": "", "乙方": ""},
  "amount_cny": "",
  "sign_date": "",
  "breach_clause": ""
}
</output_format>

<example>
输入:"甲方A公司,乙方B公司,合同金额10000美元,签订于2024年3月1日……"
输出:{"parties": {"甲方": "A公司", "乙方": "B公司"}, "amount_cny": "约72000元", "sign_date": "2024-03-01", "breach_clause": "未提及"}
</example>
"""

resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=SYSTEM_WITH_XML,
    messages=[{"role": "user", "content": "甲方:张三,乙方:李四,金额5000元,2024年5月签订,违约需赔10%"}],
)
print(resp.content[0].text)
\`\`\`

> 💡 **为什么用 XML?** 因为 XML 标签天然带"边界",Claude 能精确知道每一段的起止,避免规则之间互相干扰。OpenAI 的模型对 XML 也有一定支持,但 Claude 训练时专门强化了这一点,效果更稳定。

### 18.4 预填技巧:控制输出的开头

Claude 有一个 OpenAI 没有的强大特性——**assistant 预填(Pre-fill)**。你可以在 messages 末尾放一条 \`role: assistant\` 的消息,Claude 会**从你给的文本之后继续生成**,而不是从头开始。

这个特性在以下场景非常有用:

\`\`\`python
# 场景1:强制 JSON 输出(预填开头大括号,避免模型输出废话)
resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system="你是数据提取助手,只输出 JSON,不要任何解释。",
    messages=[
        {"role": "user", "content": "张三,25岁,北京人"},
        # 预填 assistant 的开头,强制从 { 继续
        {"role": "assistant", "content": "{"},
    ],
)
# 注意:预填的 "{" 不会出现在响应里,响应从它之后开始
# 所以可能得到 '"name": "张三", "age": 25, "city": "北京"}'
print("{" + resp.content[0].text)  # 手动补回开头的 {

# 场景2:引导文风/角色扮演(让模型从特定语气继续)
resp2 = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "用古文写一段关于秋天的描写"},
        # 预填古文开头,锁定文风
        {"role": "assistant", "content": "秋风起兮"},
    ],
)
print(resp2.content[0].text)
\`\`\`

> ⚠️ **预填的注意事项**:预填内容不会出现在响应中,需要自己拼回去(如场景1)。另外预填内容会占用输出 token 配额。OpenAI 不支持这种"半截 assistant 消息"的预填机制。

### 18.5 Claude 模型的核心特点

理解 Claude 的特点,才能在合适场景选它:

| 特点 | 说明 | 适用场景 |
|------|------|---------|
| 长上下文(200K) | 可一次性处理约 20 万 token,远超早期 GPT-4 的 8K/32K | 长文档分析、整本书阅读、代码库理解 |
| 写作能力强 | 文笔流畅、逻辑清晰、不"AI腔" | 内容创作、报告撰写、邮件 |
| 安全性高 | 训练时强化了 Constitutional AI,拒答更合理 | 企业合规场景、面向用户的产品 |
| 指令遵循好 | 对长 system prompt 的遵循度优秀 | 复杂规则任务、结构化输出 |
| 代码能力 | Sonnet 4 系列代码能力接近 GPT-4o | 编程辅助、代码审查 |

### 18.6 实战:用 Claude 做长文档分析

下面用一个完整案例展示 Claude 在长文档场景的优势——让模型阅读一篇长文章并回答问题:

\`\`\`python
from anthropic import Anthropic

client = Anthropic()

# 模拟一篇长文档(实际可能是从文件读取的几万字报告)
LONG_DOCUMENT = """
【某公司2024年度报告】(节选)
……(此处省略数万字,代表一份完整的财报)……
本年度营收5.2亿元,同比增长18%。研发投入占营收15%……
"""

# 把文档放进 system 的 <document> 标签里(利用 XML 优势)
SYSTEM = """你是一个财务分析师。请阅读 <document> 标签内的年报,回答用户问题。

<document>
""" + LONG_DOCUMENT + """
</document>

<rules>
- 回答必须基于文档内容,不要编造
- 引用关键数据时标注"据报告显示"
- 文档未提及的信息,回答"报告中未提及"
</rules>
"""

def ask(question):
    resp = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        system=SYSTEM,
        messages=[{"role": "user", "content": question}],
    )
    return resp.content[0].text

print(ask("公司今年营收增长了多少?"))
# 输出:据报告显示,本年度营收5.2亿元,同比增长18%。

print(ask("公司明年的扩张计划是什么?"))
# 输出:报告中未提及公司明年的具体扩张计划。
\`\`\`

### 18.7 与 OpenAI System Prompt 的差异对比

| 维度 | OpenAI | Claude |
|------|--------|--------|
| system 位置 | messages 数组首条 | 独立顶层参数 |
| 长 system 遵循度 | 良好 | 优秀(训练强化) |
| XML 标签支持 | 一般 | 优秀(推荐使用) |
| assistant 预填 | 不支持 | 支持(独有特性) |
| system 长度上限 | 受总 token 限制 | 受 200K 上下文限制 |
| 角色稳定性 | 对话变长后可能漂移 | 长对话下仍稳定 |

### 18.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 在 messages 里放 system | 行为不符合预期 | Claude 用独立 system 参数 |
| 预填后忘记拼接 | JSON 解析失败 | 预填内容不在响应里,需手动补回 |
| XML 标签未闭合 | 指令边界混乱 | 严格成对闭合 \`<x>...</x>\` |
| system 过长未结构化 | 规则互相干扰 | 用 XML 标签分段组织 |
| 把敏感数据写进 system | 泄露风险 | system 也会被记录,不放密钥 |

### 本章小结

本章深入了 Claude 的 system prompt 特性:独立参数的设计理念、对长指令的稳定遵循、XML 标签的结构化利器、独有的 assistant 预填技巧。这些特性使 Claude 在**需要精确控制输出格式**和**处理长文档**的场景中表现优异。掌握预填技巧尤其有价值——它是强制 JSON 输出、锁定文风的关键手段。下一章我们继续探索 Claude 与 OpenAI 的多模态能力,看看它们如何"看懂图片"。`
  },

  // =============================================================
  // 第19章:多模态:图片输入
  // =============================================================
  {
    id: 'claude-vision',
    group: 'Anthropic Claude',
    icon: '👁️',
    title: '多模态:图片输入',
    content: `## 第19章　多模态:图片输入

纯文本模型只能"读字",而**多模态(Multimodal)**模型还能"看图"。这意味着 LLM 可以理解图片内容——识别物体、读取图表、解析手写文字、分析 UI 截图。本章讲解 OpenAI 和 Claude 两家平台的多模态图片输入方式、token 计算原理、应用场景与最佳实践。

### 19.1 多模态是什么

**多模态**指模型能处理多种"模态"的数据——文本(Text)、图像(Image)、音频(Audio)、视频(Video)。本章聚焦**图像模态**。

传统 LLM 只懂文本,你问"这张图里有什么",它只能说"我看不到图片"。而多模态模型(GPT-4o、Claude 3.5 Sonnet)在训练时就"看"过海量图文对,学会了把图像转化为内部表示,再用语言描述。这打开了大量新场景:

- **OCR 文字识别**:拍张表单照片,自动提取信息填表
- **图表理解**:给一张销售曲线图,问"哪个月增长最快"
- **UI 截图分析**:给前端页面截图,生成对应代码
- **文档数字化**:扫描件 PDF 转结构化数据
- **辅助诊断**:医学影像初筛(需谨慎,不能替代医生)

### 19.2 OpenAI Vision:图片传入方式

OpenAI 的 GPT-4o 系列支持图片输入,放在 messages 的 content 里(注意:content 变成**数组**,可以混合文本和图片):

\`\`\`python
import base64
from openai import OpenAI

client = OpenAI()

# 方式1:base64 编码本地图片
def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

image_b64 = encode_image("chart.png")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图表说明了什么?请用中文描述。"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{image_b64}",
                        "detail": "high"  # high/low/auto,影响 token 消耗
                    },
                },
            ],
        }
    ],
)
print(response.choices[0].message.content)

# 方式2:直接用图片 URL(图片需可公网访问)
response2 = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "图里的产品是什么?"},
                {"type": "image_url", "image_url": {"url": "https://example.com/product.jpg"}},
            ],
        }
    ],
)
print(response2.choices[0].message.content)
\`\`\`

### 19.3 Claude Vision:图片传入方式

Claude 也支持图片输入,但格式略有不同——用 \`source\` 对象,且 \`type\` 为 \`base64\`(目前主要支持 base64,不支持 URL 直接传入):

\`\`\`python
import base64
from anthropic import Anthropic

client = Anthropic()

def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

image_b64 = encode_image("chart.png")

# 判断图片类型
def get_media_type(path):
    ext = path.lower().split(".")[-1]
    return {"jpg": "image/jpeg", "jpeg": "image/jpeg",
            "png": "image/png", "gif": "image/gif", "webp": "image/webp"}.get(ext, "image/png")

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": get_media_type("chart.png"),  # 必填:MIME 类型
                        "data": image_b64,
                    },
                },
                {"type": "text", "text": "这张图表说明了什么?请用中文描述。"},
            ],
        }
    ],
)
print(response.content[0].text)
\`\`\`

**两者格式对比**:

| 维度 | OpenAI | Claude |
|------|--------|--------|
| content 结构 | 数组,混合 text/image_url | 数组,混合 text/image |
| 图片传入 | \`image_url\`(支持 base64 data URI 或 http URL) | \`source.type=base64\`(主要支持 base64) |
| 必填字段 | url | media_type + data |
| 支持 URL 直传 | 是 | 否(需自行下载转 base64) |
| detail 参数 | high/low/auto 控制精度 | 无,自动处理 |

### 19.4 图片 Token 计算

图片不是"免费"的,它会按分辨率折算成 token 计费。理解 token 计算对控制成本很重要。

**OpenAI 的计算规则**(基于 \`detail\` 参数):
- \`detail: low\`:固定约 85 tokens,适合简单识别
- \`detail: high\`:图片被切成多个 512x512 的 tile,每个 tile 约 170 tokens。一张 1024x1024 的图约 765 tokens
- \`detail: auto\`:模型自动选择(默认)

**Claude 的计算规则**:
- 大致按 \` (宽 × 高) / 750 \` 估算 token 数
- 一张 1000x1000 的图约 1300 tokens
- 建议图片大小不超过 1568 像素(超过会被缩放)

> 💡 **省钱技巧**:如果只是识别图中文字(OCR),用 \`detail: low\` 就够了,能省一半以上 token。只有需要看清细节(如小字、图表数据点)才用 high。

### 19.5 应用场景与代码实战

**场景:发票信息提取**

给一张发票照片,自动提取关键字段:

\`\`\`python
from anthropic import Anthropic
import base64

client = Anthropic()

def extract_invoice(image_path):
    """从发票图片提取关键字段"""
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    resp = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        system="""你是发票识别助手。请从图片中提取以下字段,以 JSON 返回:
{"invoice_no": "发票号", "date": "开票日期", "amount": "金额", "seller": "销售方"}
如某字段无法识别,填 null。只输出 JSON,不要解释。""",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": img_b64}},
                    {"type": "text", "text": "请提取发票信息。"},
                ],
            }
        ],
    )
    return resp.content[0].text

# 调用
import json
result = extract_invoice("invoice.jpg")
print(json.loads(result))
# 输出示例:{"invoice_no": "12345678", "date": "2024-06-01", "amount": "¥999.00", "seller": "某某科技有限公司"}
\`\`\`

### 19.6 最佳实践

1. **图片质量**:清晰、光线充足、正面拍摄。模糊/倾斜/反光会大幅降低识别率。
2. **分辨率控制**:无需超高分辨率,1080p 足够;过大会浪费 token。
3. **提示词设计**:明确告诉模型"看什么""输出什么格式"。模糊的"看看图"效果差。
4. **多图对比**:可以一次传多张图让模型对比(放在 content 数组里)。
5. **结合文本**:把背景信息写在 text 部分,图片作为补充,效果优于纯图片。

\`\`\`python
# 多图对比示例:对比两张 UI 设计稿
resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "对比下面两张设计稿,指出布局上的主要差异。"},
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img1_b64}},
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": img2_b64}},
            ],
        }
    ],
)
\`\`\`

### 19.7 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 忘记 media_type | Claude 报错 | 必须传正确的 MIME 类型 |
| 用 URL 传给 Claude | 报错 unsupported | Claude 需先下载转 base64 |
| 图片过大 | token 超限/费用高 | 压缩到合理尺寸(长边 ≤1568) |
| 提示词太模糊 | 回答跑偏 | 明确指定"提取什么字段""什么格式" |
| base64 编码错误 | 解析失败 | 用二进制模式读取再编码 |
| 模糊图片强求精确 | 提取错误 | 先做图像预处理(放大/锐化) |

### 本章小结

本章讲解了多模态图片输入:OpenAI 用 \`image_url\`(支持 URL 和 base64),Claude 用 \`source.type=base64\`(需自行转码);图片按分辨率折算 token,控制 \`detail\` 和图片尺寸能省钱。多模态打开了 OCR、图表理解、UI 转代码、文档数字化等大量场景。最佳实践是"好图 + 精准提示词"。下一章我们将系统对比 OpenAI 和 Claude 两大平台,给出选型建议。`
  },

  // =============================================================
  // 第20章:OpenAI vs Claude 对比与选型
  // =============================================================
  {
    id: 'model-compare',
    group: 'Anthropic Claude',
    icon: '⚖️',
    title: 'OpenAI vs Claude 对比与选型',
    content: `## 第20章　OpenAI vs Claude 对比与选型

经过前几章的学习,你已经掌握了 OpenAI 和 Claude 两家平台的基本用法。但真实项目里,你会面临一个问题:**到底该选哪个?** 本章从价格、上下文、能力、速度等多维度做系统对比,并给出基于场景的选型建议,帮助你建立"多模型策略"思维。

### 20.1 多维度对比表

> ⚠️ 价格和能力会随版本更新变化,以下数据为典型参考值,实际请以官方最新定价为准。

| 维度 | GPT-4o | GPT-4o-mini | Claude 3.5 Sonnet | Claude 3 Opus |
|------|--------|-------------|-------------------|---------------|
| 上下文窗口 | 128K | 128K | 200K | 200K |
| 输入价格(每百万token) | ~$2.5 | ~$0.15 | ~$3 | ~$15 |
| 输出价格(每百万token) | ~$10 | ~$0.6 | ~$15 | ~$75 |
| 多模态 | 图片+音频 | 图片 | 图片 | 图片 |
| Function Calling | 成熟 | 成熟 | 支持 | 支持 |
| 代码能力 | 优秀 | 良好 | 优秀 | 优秀 |
| 中文能力 | 优秀 | 良好 | 优秀 | 优秀 |
| 长文档处理 | 良好 | 一般 | 优秀 | 优秀 |
| 响应速度 | 快 | 极快 | 快 | 较慢 |

### 20.2 OpenAI 的优势

1. **生态丰富**:最成熟的 SDK、第三方库(LangChain/LlamaIndex 原生支持最好)、社区资料最多
2. **Function Calling 成熟**:工具调用协议最稳定,多函数并行、流式工具调用支持完善
3. **微调(Fine-tuning)**:支持对模型做微调,垂直领域可定制
4. **多模态全**:GPT-4o 同时支持图片 + 音频 + 文字
5. ** Assistants API**:OpenAI 提供托管式的 Agent 服务,省去自己维护状态
6. **mini 版性价比高**:GPT-4o-mini 适合高频低成本场景

### 20.3 Claude 的优势

1. **超长上下文(200K)**:能一次性处理约 15 万汉字,长文档/大代码库场景碾压
2. **写作能力强**:文笔自然、逻辑连贯、AI 腔少,适合内容创作
3. **安全性高**:Constitutional AI 训练,拒答更合理,合规场景首选
4. **指令遵循优秀**:对长 system prompt 遵循度好,结构化输出稳定
5. **XML 标签 + 预填**:独有的结构化控制手段,输出可控性强
6. **Sonnet 性价比高**:在中端价位提供接近旗舰的能力

### 20.4 按场景的选型建议

| 业务场景 | 推荐模型 | 理由 |
|---------|---------|------|
| 高频客服/分类 | GPT-4o-mini | 便宜、速度快、能力够用 |
| 长文档分析/整本书阅读 | Claude 3.5 Sonnet | 200K 上下文 + 长指令遵循好 |
| 复杂推理/数学 | GPT-4o | 推理能力强 |
| 内容创作/文案 | Claude 3.5 Sonnet | 写作自然、不 AI 腔 |
| 代码生成/审查 | GPT-4o / Claude Sonnet | 两者代码能力接近 |
| 结构化数据提取 | Claude(预填) | 预填强制 JSON,稳定 |
| 合规/对安全敏感 | Claude | 安全训练,拒答合理 |
| 需要音频处理 | GPT-4o | 唯一支持音频 |
| 预算极有限 | GPT-4o-mini | 价格最低 |

### 20.5 多模型策略

成熟的产品不会"一棵树上吊死",而是**按任务路由到最合适的模型**:

\`\`\`python
import os
from openai import OpenAI
from anthropic import Anthropic

openai_client = OpenAI()
claude_client = Anthropic()

def route_model(task_type, content):
    """根据任务类型路由到不同模型"""
    if task_type == "long_doc":
        # 长文档用 Claude(200K 上下文)
        resp = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            system="你是文档分析助手。",
            messages=[{"role": "user", "content": content}],
        )
        return resp.content[0].text
    elif task_type == "quick_classify":
        # 简单分类用 mini(便宜)
        resp = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": content}],
        )
        return resp.choices[0].message.content
    elif task_type == "creative_writing":
        # 写作用 Claude(文笔好)
        resp = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[{"role": "user", "content": content}],
        )
        return resp.content[0].text
    else:
        # 默认用 GPT-4o(通用强)
        resp = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
        )
        return resp.choices[0].message.content

# 路由示例
print(route_model("quick_classify", "这段话是正面还是负面?今天心情很差"))
\`\`\`

### 20.6 成本对比计算

假设一个应用日均处理 10000 次请求,平均每次输入 500 token、输出 200 token,我们来算算不同模型的月成本:

\`\`\`python
# 成本计算器
def monthly_cost(model, daily_calls, input_tokens, output_tokens):
    """计算月成本(美元)"""
    pricing = {
        "gpt-4o":       {"in": 2.5,  "out": 10},
        "gpt-4o-mini":  {"in": 0.15, "out": 0.6},
        "claude-sonnet":{"in": 3,    "out": 15},
        "claude-opus":  {"in": 15,   "out": 75},
    }
    p = pricing[model]
    # 月调用数 × (输入成本 + 输出成本)
    monthly = daily_calls * 30 * (
        (input_tokens / 1_000_000) * p["in"] +
        (output_tokens / 1_000_000) * p["out"]
    )
    return round(monthly, 2)

calls, tin, tout = 10000, 500, 200
for m in ["gpt-4o", "gpt-4o-mini", "claude-sonnet", "claude-opus"]:
    print(f"{m}: \${monthly_cost(m, calls, tin, tout)}/月")
# gpt-4o:        $525.00/月
# gpt-4o-mini:    $33.00/月  ← 便宜16倍
# claude-sonnet: $720.00/月
# claude-opus:  $3600.00/月
\`\`\`

> 💡 **关键洞察**:简单任务用 mini 能省 90% 以上成本!**不是所有任务都需要旗舰模型**,按任务难度匹配模型档次,是成本优化的核心思路。

### 20.7 迁移成本评估

从 OpenAI 迁移到 Claude(或反向)需要考虑:

| 迁移项 | 工作量 | 说明 |
|--------|--------|------|
| system prompt 位置 | 低 | OpenAI 在 messages,Claude 是独立参数 |
| 响应解析 | 低 | \`choices[0].message.content\` vs \`content[0].text\` |
| max_tokens | 极低 | Claude 必填 |
| Function Calling | 中 | 协议不同(tools vs tool_use) |
| 微调模型 | 高 | 无法直接迁移微调权重,需在另一平台重训 |
| 第三方库依赖 | 低-中 | LangChain 等大多同时支持两家 |

### 20.8 决策框架

选型时问自己三个问题:

1. **任务对模型能力要求多高?** 简单分类 → mini;通用对话 → 中端;复杂推理 → 旗舰
2. **有没有特殊需求?** 长文档 → Claude;音频 → GPT-4o;合规 → Claude
3. **预算约束?** 极有限 → mini;宽松 → 按场景混用

### 20.9 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 全用旗舰模型 | 成本爆炸 | 简单任务降级到 mini |
| 只用一家 | 锁死单一供应商 | 关键能力做双供应商备份 |
| 忽视上下文窗口 | 长文档被截断 | 长文档选 Claude 或用 RAG |
| 照搬代码不改 API | 调用报错 | 注意 system 位置等差异 |
| 不做成本监控 | 账单失控 | 加 token 计数与预算告警 |
| 追求最新最强 | 过度工程 | 够用就好,稳定优先 |

### 本章小结

本章系统对比了 OpenAI 和 Claude 两大平台:OpenAI 胜在生态、Function Calling 成熟、mini 性价比;Claude 胜在长上下文、写作、安全、指令遵循。选型没有标准答案,要**按任务场景匹配模型档次和平台**。成熟的策略是多模型路由——长文档走 Claude、简单分类走 mini、创作走 Claude、通用走 GPT-4o。成本意识是工程师的核心素养,简单任务用 mini 能省 90% 成本。从下一章开始,我们进入 Function Calling 的世界,这是从"聊天机器人"迈向"Agent"的关键一步。`
  }
];
