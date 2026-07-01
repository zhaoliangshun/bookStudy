// =============================================================
// AI Agent 应用开发实战 - 第三批章节（OpenAI API，共 4 章）
// 第 9-12 章：SDK 安装与首次调用 / Chat Completions / 流式响应 / 参数调优
// =============================================================

export const chapters = [
  {
    id: 'openai-install',
    group: 'OpenAI API',
    icon: '📦',
    title: 'OpenAI SDK 安装与首次调用',
    content: `## OpenAI SDK 安装与首次调用

理论讲再多，不如亲手调一次 API。从本章开始，我们正式进入代码实战，用 OpenAI 官方 SDK 把第一个请求跑通。本章手把手带你完成 SDK 安装、Key 配置、第一个调用和错误处理。

### 一、openai 库安装

OpenAI 官方 Python SDK 就是 \`openai\` 这个包。1.0 版本后 API 有大改（从函数式改为客户端式），本书基于 1.x 版本讲解。

\`\`\`bash
# 激活虚拟环境后安装
pip install openai

# 建议固定版本，避免 API 变动导致代码失效
pip install "openai>=1.0"

# 验证安装成功
python -c "import openai; print(openai.__version__)"
\`\`\`

### 二、API Key 获取

API Key 是调用 OpenAI 服务的凭证，**每个 key 对应一个账号的额度**。获取步骤：

1. 注册 OpenAI 账号（openai.com）。
2. 进入平台后台，创建 API Key（形如 \`sk-xxxx\`）。
3. **充值额度**：新账号有少量免费额度，正式使用需绑定信用卡充值。
4. **妥善保管**：Key 一旦泄露会被盗刷，只放 .env，绝不硬编码、绝不提交 Git。

\`\`\`bash
# .env 文件
OPENAI_API_KEY=sk-你的真实key
\`\`\`

### 三、环境变量配置

SDK 默认读取环境变量 \`OPENAI_API_KEY\`，所以配好环境变量后代码里不用显式传 key。

\`\`\`python
# config.py —— 统一配置
import os
from dotenv import load_dotenv

load_dotenv()  # 从 .env 加载

# SDK 会自动读取这个环境变量
# 也可以在代码里显式传给客户端
\`\`\`

\`\`\`bash
# 也可以在终端临时设置（不推荐长期用，重启终端会丢）
export OPENAI_API_KEY=sk-你的key
\`\`\`

### 四、第一个调用示例

万事俱备，跑第一个请求：

\`\`\`python
# first_call.py —— OpenAI 首次调用
import os
from dotenv import load_dotenv
from openai import OpenAI

# 1. 加载环境变量（读取 .env 中的 OPENAI_API_KEY）
load_dotenv()

# 2. 创建客户端（自动用环境变量里的 key）
client = OpenAI()

# 3. 发起聊天请求
response = client.chat.completions.create(
    model="gpt-4o-mini",          # 用的模型
    messages=[                     # 消息列表
        {"role": "system", "content": "你是一个友好的助手。"},
        {"role": "user", "content": "用一句话介绍你自己"}
    ]
)

# 4. 取出回答
answer = response.choices[0].message.content
print("回答：", answer)

# 5. 查看 token 用量
print("输入token：", response.usage.prompt_tokens)
print("输出token：", response.usage.completion_tokens)
print("总token：", response.usage.total_tokens)
\`\`\`

跑通后你会看到模型回答和 token 统计，说明调用链路完全打通。

### 五、消息结构：role + content

OpenAI 的 Chat API 用 **消息列表（messages）** 描述对话，每条消息有 \`role\` 和 \`content\`：

\`\`\`python
messages = [
    {"role": "system", "content": "系统设定"},     # 可选，设定行为
    {"role": "user", "content": "用户说的"},        # 用户输入
    {"role": "assistant", "content": "模型上次答的"}, # 历史回答
    {"role": "user", "content": "用户又说的"}       # 新输入
]
\`\`\`

- **system**：设定模型行为基调（见第 6 章）。
- **user**：用户的输入。
- **assistant**：模型的历史回答，多轮对话时带上以保持上下文。

### 六、模型选择：价格 vs 性能

不同模型性能和价格差异大，按需选择：

| 模型 | 能力 | 价格（参考） | 适合 |
| --- | --- | --- | --- |
| gpt-4o | 最强，多模态 | 较贵 | 复杂 Agent、重要任务 |
| gpt-4o-mini | 性价比高 | 便宜 | 日常任务、大量调用 |
| gpt-3.5-turbo | 老牌便宜 | 最便宜 | 简单分类、预算敏感 |

\`\`\`text
原则：
- 开发调试用 mini 省钱
- 关键生产用 4o 保质量
- 大量调用算清楚成本
\`\`\`

### 七、同步 vs 异步调用

\`openai\` 库提供同步和异步两套客户端：

\`\`\`python
# 同步：简单直接，阻塞等待结果
from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(...)  # 会阻塞直到返回

# 异步：不阻塞，适合高并发、Web 服务
import asyncio
from openai import AsyncOpenAI
async_client = AsyncOpenAI()

async def call():
    response = await async_client.chat.completions.create(...)  # await 等待
    return response

asyncio.run(call())
\`\`\`

**何时用异步**：做 Web 服务（FastAPI）、批量并发调用多个请求时。普通脚本用同步即可。

### 八、错误处理

调用 API 会遇到各种错误，必须处理：

\`\`\`python
from openai import OpenAI, RateLimitError, AuthenticationError, APIError

client = OpenAI()

def safe_chat(messages):
    """带错误处理的聊天函数"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response.choices[0].message.content

    except AuthenticationError:
        # API Key 无效或过期
        return "错误：API Key 无效，请检查 .env 配置"

    except RateLimitError:
        # 调用太快或额度用完
        return "错误：请求过快或余额不足，请稍后重试"

    except APIError as e:
        # OpenAI 服务端错误
        return f"服务异常：{e}"

    except Exception as e:
        # 其他未知错误
        return f"未知错误：{e}"

print(safe_chat([{"role": "user", "content": "你好"}]))
\`\`\`

常见错误速查：

| 错误 | 原因 | 处理 |
| --- | --- | --- |
| AuthenticationError | Key 无效/过期 | 检查 .env |
| RateLimitError | 调用过快/余额不足 | 加重试、充值 |
| BadRequestError | 参数错误（如模型名写错） | 检查参数 |
| APIConnectionError | 网络问题 | 重试、检查网络 |
| APITimeoutError | 请求超时 | 设超时、重试 |

### 九、本章小结与易错点

| 易错点 | 说明 | 正确做法 |
| --- | --- | --- |
| Key 硬编码 | 泄露风险 | 用 .env 环境变量 |
| 不固定 SDK 版本 | 升级后 API 变 | requirements.txt 锁版本 |
| 不处理错误 | 程序崩溃 | try/except 捕获常见异常 |
| 全用 gpt-4o | 成本爆炸 | 调试用 mini，生产用 4o |
| 忽略 token 用量 | 超额才发现 | 每次看 usage 统计 |

> **核心结论**：调通第一个 API 请求只需三步——**配 Key、建客户端、调 create**。重点掌握消息结构、模型选择和错误处理。能在出错时优雅降级，是一个 Agent 是否"能上线"的分水岭。`,
  },
  {
    id: 'openai-chat',
    group: 'OpenAI API',
    icon: '💬',
    title: 'Chat Completions 详解',
    content: `## Chat Completions 详解

\`chat.completions.create\` 是 OpenAI 最核心的 API，几乎所有应用都绕不开它。本章把它的参数、返回结构、多轮对话、token 统计讲透，让你用起来心里有底。

### 一、Chat Completions API 完整参数

\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o-mini",         # 模型名
    messages=[...],              # 消息列表（必填）
    temperature=0.7,             # 温度，控制随机性，0-2
    max_tokens=1000,             # 最大输出 token 数
    top_p=1,                     # 核采样，0-1
    frequency_penalty=0,         # 频率惩罚，-2~2，抑制重复词
    presence_penalty=0,          # 存在惩罚，-2~2，促进新话题
    stop=None,                   # 停止序列，遇到就停
    seed=None,                   # 随机种子（可复现，3+支持）
    stream=False,                # 是否流式
    response_format=None,        # 输出格式（如 JSON 模式）
    n=1                          # 生成几条回答
)
\`\`\`

参数虽多，最常用的是 \`model\`、\`messages\`、\`temperature\`、\`max_tokens\`。其他按需调。

### 二、messages 参数详解

\`messages\` 是必填项，是一个消息列表，描述完整对话：

\`\`\`python
messages = [
    # system：设定模型行为（可选，建议放第一条）
    {"role": "system", "content": "你是旅游顾问，专门推荐国内景点。"},

    # user：用户的每次提问
    {"role": "user", "content": "推荐一个适合带孩子去的地方"},

    # assistant：模型的每次回答（多轮对话历史）
    {"role": "assistant", "content": "推荐去三亚，沙滩适合亲子..."},

    # user：用户新提问
    {"role": "user", "content": "那有什么美食"}
]
\`\`\`

**关键点**：多轮对话要把历史消息全部带上，模型才能"记住"上下文。

### 三、response 结构详解

返回的 \`response\` 对象结构：

\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}]
)

# 1. choices：生成的回答列表（n=1 时就一条）
choice = response.choices[0]
print("回答内容：", choice.message.content)        # 文本内容
print("回答角色：", choice.message.role)            # "assistant"
print("结束原因：", choice.finish_reason)          # "stop"/"length"/"tool_calls"

# 2. usage：token 用量统计
print("输入token：", response.usage.prompt_tokens)
print("输出token：", response.usage.completion_tokens)
print("总token：", response.usage.total_tokens)

# 3. 元信息
print("模型：", response.model)        # 实际用的模型
print("创建时间：", response.created)  # 时间戳
\`\`\`

\`finish_reason\` 几种值的含义：

| 值 | 含义 | 处理 |
| --- | --- | --- |
| stop | 正常结束（遇到停止符） | 完整回答 |
| length | 达到 max_tokens 被截断 | 调大 max_tokens 或分段 |
| tool_calls | 模型要调用工具 | 执行工具后继续 |
| content_filter | 触发内容过滤 | 修改输入或换模型 |

### 四、多轮对话消息构造

实现一个能"记住上下文"的聊天：

\`\`\`python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

# 用一个列表保存对话历史
history = [
    {"role": "system", "content": "你是一个友好的助手，回答简洁。"}
]

def chat(user_input):
    """多轮对话函数：把历史+新输入一起发"""
    # 1. 把用户新输入加入历史
    history.append({"role": "user", "content": user_input})

    # 2. 带上全部历史发请求
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history
    )
    answer = response.choices[0].message.content

    # 3. 把模型回答也存进历史，下次能"记住"
    history.append({"role": "assistant", "content": answer})

    return answer

# 测试多轮
print(chat("我叫张三"))           # 模型记住名字
print(chat("我叫什么？"))         # 能回答"张三"，因为有历史
\`\`\`

### 五、system / user / assistant 角色轮换

构造消息时角色顺序很重要，规范是 **system → user/assistant 交替 → 当前 user**：

\`\`\`text
✅ 正确顺序：
system → user → assistant → user → assistant → user

❌ 错误顺序（会报错）：
user → user              # 两个连续 user 不行
assistant → user → system # system 没放最前
\`\`\`

\`\`\`python
# 规范的多轮消息构造
def build_messages(history, system_prompt, user_input):
    """构造规范的消息列表"""
    messages = [{"role": "system", "content": system_prompt}]
    # history 里是 [user, assistant, user, assistant, ...] 交替
    messages.extend(history)
    # 最后加当前用户输入
    messages.append({"role": "user", "content": user_input})
    return messages
\`\`\`

### 六、token 用量统计

每次调用都会返回 \`usage\`，重点关注：

\`\`\`python
response = client.chat.completions.create(...)
usage = response.usage

# 三类 token
prompt_tokens = usage.prompt_tokens       # 输入（system+历史+用户输入）
completion_tokens = usage.completion_tokens  # 输出
total_tokens = usage.total_tokens          # 总和

# 算成本（以 gpt-4o-mini 参考价：输入$0.15/百万，输出$0.6/百万）
cost = (prompt_tokens * 0.15 + completion_tokens * 0.6) / 1_000_000
print(f"本次花费约 \${cost:.6f}")
\`\`\`

**实战建议**：在 Agent 里累计统计 token，超预算就告警或降级。

### 七、常见错误处理

\`\`\`python
from openai import OpenAI, BadRequestError, RateLimitError

client = OpenAI()

def robust_chat(messages, max_retries=3):
    """带重试的健壮调用"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
            return response.choices[0].message.content

        except BadRequestError as e:
            # 参数错误，重试没用，直接报错
            raise ValueError(f"参数错误：{e}")

        except RateLimitError:
            # 限流，等一会再试
            import time
            time.sleep(2 ** attempt)  # 指数退避：1s, 2s, 4s
            continue

    raise RuntimeError("重试多次仍失败")
\`\`\`

### 八、本章小结与易错点

| 易错点 | 说明 | 正确做法 |
| --- | --- | --- |
| 不带历史消息 | 多轮失忆 | 把 user/assistant 历史全带上 |
| 角色顺序错 | 报错 | system→交替user/assistant→当前user |
| 忽略 finish_reason | 截断没察觉 | 检查是不是 length 被截 |
| 不统计 token | 成本失控 | 累计 usage |
| 不做重试 | 限流就崩 | 指数退避重试 |

> **核心结论**：Chat Completions 是 OpenAI 最核心 API。掌握 **messages 结构、response 解析、多轮对话历史管理、token 统计** 这四件事，就能应对绝大多数对话场景。`,
  },
  {
    id: 'openai-stream',
    group: 'OpenAI API',
    icon: '🌊',
    title: '流式响应 Streaming',
    content: `## 流式响应 Streaming

你肯定体验过 ChatGPT 那种"边生成边显示"的打字机效果，这就是流式响应。流式让用户**首字延迟低**，体验远好于"等几秒一次性蹦出来"。本章讲清楚流式原理、Python 实现和异步流式。

### 一、为什么需要流式

非流式：模型把整段回答生成完才一次性返回，用户干等几秒甚至几十秒。

\`\`\`text
非流式：[生成5秒] ──▶ 一次性返回整段
用户体验：盯着空白转圈，焦虑
\`\`\`

流式：模型生成一个字就立即推送一个字，用户看到"打字机"效果。

\`\`\`text
流式：[字1][字2][字3]...实时推送
用户体验：立刻有反馈，感觉"在思考"
\`\`\`

**核心价值**：降低首字延迟，改善用户体验。即使总生成时间不变，"早看到一点"也比"等完才看到"舒服得多。

### 二、stream=True 参数

开启流式只需加 \`stream=True\`：

\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "讲个100字的故事"}],
    stream=True   # 关键：开启流式
)
# 这时 response 不再是单个对象，而是一个迭代器
\`\`\`

### 三、SSE 原理：Server-Sent Events

流式基于 **SSE（Server-Sent Events）** 协议：服务器持续推送数据块（chunk），每个 chunk 是一小段。数据以 \`data: \` 开头，最后以 \`data: [DONE]\` 结束。

\`\`\`text
data: {"choices":[{"delta":{"content":"从"}}]}
data: {"choices":[{"delta":{"content":"前"}}]}
data: {"choices":[{"delta":{"content":"有"}}]}
data: [DONE]
\`\`\`

### 四、逐 chunk 解析与拼接

每个 chunk 里的 \`delta.content\` 是一小片段，需要自己拼起来：

\`\`\`python
# 同步流式：逐块拼接
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "用50字介绍 Python"}],
    stream=True
)

full_text = ""  # 用来拼完整内容
for chunk in response:  # 遍历每个数据块
    # chunk.choices 可能为空（最后一个），要判空
    if chunk.choices and chunk.choices[0].delta.content:
        piece = chunk.choices[0].delta.content
        full_text += piece       # 拼接
        print(piece, end="", flush=True)  # 实时打印，不换行

print()  # 最后换行
print("完整内容：", full_text)
\`\`\`

**关键点**：\`delta.content\` 是增量，不是累积。每个 chunk 只有新的一小段，必须自己拼。

### 五、流式 vs 完整响应对比

| 维度 | 非流式（stream=False） | 流式（stream=True） |
| --- | --- | --- |
| 返回 | 完整对象 | 迭代器，逐块 |
| 首字延迟 | 高（等全部生成） | 低（生成即推） |
| 代码复杂度 | 简单 | 要拼接 delta |
| 获取 usage | 直接 response.usage | 要 stream_options（见下） |
| 适合场景 | 后台任务、要完整结果 | 用户交互、聊天界面 |

### 六、异步流式：AsyncOpenAI

Web 服务用异步流式，不阻塞其他请求：

\`\`\`python
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
async_client = AsyncOpenAI()

async def stream_chat(prompt):
    """异步流式：用 async for 遍历"""
    response = await async_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    full = ""
    async for chunk in response:  # 异步遍历
        if chunk.choices and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            full += piece
            print(piece, end="", flush=True)
    return full

# 运行
asyncio.run(stream_chat("讲个笑话"))
\`\`\`

### 七、流式中的 usage 统计

老版本流式默认不返回 token 用量。新版本用 \`stream_options\` 开启：

\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
    stream_options={"include_usage": True}  # 流式也返回 usage
)

# 最后一个 chunk 会带 usage
for chunk in response:
    if chunk.usage:  # 只在最后一个 chunk 有
        print("总token：", chunk.usage.total_tokens)
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
\`\`\`

### 八、实战：打字机效果

\`\`\`python
import time
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

def typewriter_chat(user_input):
    """模拟打字机效果：边生成边显示"""
    print("助手：", end="", flush=True)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": user_input}],
        stream=True
    )
    for chunk in response:
        if chunk.choices and chunk.choices[0].delta.content:
            text = chunk.choices[0].delta.content
            print(text, end="", flush=True)  # 立即输出，不缓冲
            time.sleep(0.02)  # 可选：稍微放慢，更像打字
    print()  # 换行

typewriter_chat("用三句话介绍流式响应的好处")
\`\`\`

### 九、本章小结与易错点

| 易错点 | 说明 | 正确做法 |
| --- | --- | --- |
| 不拼接 delta | 只显示最后一块 | 累加 delta.content |
| 不判 choices 空 | 最后 chunk 报错 | 加判空 if chunk.choices |
| 流式要完整结果 | 不知道何时结束 | 拼到 [DONE] 自动停 |
| 忽略 usage | 流式不统计 | 用 stream_options |
| 后台任务也用流式 | 没必要 | 后台用非流式更简单 |

> **核心结论**：流式通过 \`stream=True\` 开启，逐 chunk 接收 \`delta.content\` 并拼接。它能大幅降低首字延迟，是聊天/交互场景的标配。异步服务用 \`AsyncOpenAI + async for\`。`,
  },
  {
    id: 'openai-params',
    group: 'OpenAI API',
    icon: '🎛️',
    title: '参数调优：temperature / top_p 等',
    content: `## 参数调优：temperature / top_p 等

同样一个 prompt，为什么有时模型答得很稳，有时又"放飞自我"？秘密就在那些采样参数里。本章把 temperature、top_p、penalty 等参数讲透，让你能精确控制模型的"创造 vs 稳定"。

### 一、temperature：控制随机性

\`temperature\`（温度）控制模型输出的随机程度，范围 0-2：

- **低（0-0.3）**：输出确定、保守、聚焦。每次基本一样。
- **中（0.7 左右）**：平衡，有点变化但不离谱。
- **高（1.5-2）**：高度随机、天马行空、甚至乱说。

\`\`\`text
temperature=0：贪心，每次都选概率最高的 token → 稳定、可复现
temperature=1：按原始概率采样 → 自然、有变化
temperature=2：概率被放大，小概率词也常选 → 发散、可能胡言
\`\`\`

\`\`\`python
# 对比不同温度的输出
for temp in [0, 0.7, 1.5]:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "给'月亮'写一句比喻"}],
        temperature=temp
    )
    print(f"温度{temp}：{response.choices[0].message.content}")
# 温度0每次几乎一样；温度1.5每次都不同，可能很惊艳也可能离谱
\`\`\`

**经验**：temperature=0 用于分类/抽取等要确定的；0.7 用于对话/创作；高于 1.2 基本不推荐。

### 二、top_p：核采样

\`top_p\`（核采样/Nucleus Sampling）从概率角度限制候选词：只从**累计概率达到 p** 的词里选，p 范围 0-1。

\`\`\`text
top_p=0.1：只从概率前10%的词里选 → 非常保守
top_p=1：所有词都可能选 → 不限制
\`\`\`

**temperature vs top_p**：两者都是控制随机性，**通常只调一个，不要同时调**。OpenAI 官方建议：要么调 temperature，要么调 top_p，别两个都改。

### 三、frequency_penalty：抑制重复词

\`frequency_penalty\`（频率惩罚）范围 -2~2，**正值**会让模型**少重复已经出现过的词**。

\`\`\`text
frequency_penalty=0：正常
frequency_penalty=1：少重复用过的词 → 文本更多样
frequency_penalty=-1：鼓励重复 → 适合列表、强调
\`\`\`

适合写长文时避免"车轱辘话"。

### 四、presence_penalty：促进新话题

\`presence_penalty\`（存在惩罚）范围 -2~2，**正值**鼓励模型**引入新词、新话题**，避免一直在原地打转。

\`\`\`text
presence_penalty=1：更倾向聊新内容 → 适合开放式对话、头脑风暴
\`\`\`

**frequency vs presence 区别**：frequency 看一个词出现几次（多次就抑制），presence 只看有没有出现（出现过就抑制）。前者防"啰嗦"，后者促"新颖"。

### 五、max_tokens：限制输出长度

\`max_tokens\` 限制模型最多生成多少 token。超过就强制停止（finish_reason=length）。

\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "详细介绍Python"}],
    max_tokens=100  # 只生成约100 token，会被截断
)
# 注意：是"输出"上限，不含输入
\`\`\`

**注意**：max_tokens 是"上限"不是"目标"，模型可能提前结束。设太小会截断，设太大浪费额度上限。

### 六、seed：可复现（3+ 支持）

\`seed\` 让相同输入 + 相同 seed 产生相同输出，方便调试和复现：

\`\`\`python
# 固定 seed，结果可复现
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "随机写个数字"}],
    seed=42,            # 固定种子
    temperature=0.7     # 配合非0温度才有意义
)
# 同样 seed + temperature 下，多次调用结果基本一致
\`\`\`

注意：seed 只是"尽量"复现，不保证 100% 一致（系统状态有影响）。

### 七、stop：停止序列

\`stop\` 指定遇到某些文本就停止生成：

\`\`\`python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "写3个要点，每个以'要点：'开头"}],
    stop=["要点：", "\\n\\n"]  # 遇到这两个之一就停
)
\`\`\`

适合控制输出结构，比如"只生成第一个要点"。

### 八、参数调优建议

\`\`\`text
任务类型          推荐参数
─────────────────────────────────────
分类/抽取/JSON    temperature=0, top_p=1（要确定）
对话/问答         temperature=0.7（自然）
创意写作          temperature=0.9, top_p=0.9
头脑风暴          temperature=1.0, presence_penalty=0.5
\`\`\`

\`\`\`python
# 不同场景的参数预设
PRESETS = {
    "分类": {"temperature": 0, "max_tokens": 100},
    "对话": {"temperature": 0.7, "max_tokens": 1000},
    "创作": {"temperature": 0.9, "top_p": 0.9, "max_tokens": 2000},
    "头脑风暴": {"temperature": 1.0, "presence_penalty": 0.5, "max_tokens": 1000},
}

def chat_with_preset(user_input, preset_name):
    """按预设参数调用"""
    params = PRESETS[preset_name]
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": user_input}],
        **params
    )
    return response.choices[0].message.content
\`\`\`

### 九、本章小结与易错点

| 易错点 | 说明 | 正确做法 |
| --- | --- | --- |
| 同时调 temp 和 top_p | 效果混乱 | 只调一个 |
| 事实类用高温度 | 答案乱飘 | 事实/分类用 temperature=0 |
| 创作用温度 0 | 千篇一律 | 创作用 0.7-0.9 |
| max_tokens 设太小 | 输出被截断 | 留够余量 |
| 用 seed 期望完全一致 | 不保证100% | 只做"尽量"复现 |

> **核心结论**：采样参数是控制模型"稳定 vs 创造"的旋钮。**temperature** 最常用——事实/分类任务设 0，对话设 0.7，创作设 0.9。top_p 与 temperature 二选一。penalty 用于控制重复和新颖度。`,
  },
];
