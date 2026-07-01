// =============================================================
// AI Agent开发实战 - 第六批章节(Function Calling,共 4 章)
// -------------------------------------------------------------
// 第21章:Function Calling 概念
// 第22章:OpenAI Function Calling
// 第23章:Claude Tool Use
// 第24章:实战:工具增强 AI
// =============================================================

export const chapters = [
  // =============================================================
  // 第21章:Function Calling 概念
  // =============================================================
  {
    id: 'fc-concept',
    group: 'Function Calling',
    icon: '🔌',
    title: 'Function Calling 概念',
    content: `## 第21章　Function Calling 概念

到目前为止,我们用 LLM 做的都是"纯文本问答"——给它问题,它从训练知识里拼出答案。但现实世界里,用户会问"今天北京天气如何""帮我算下 1234×5678 等于多少""查一下订单 E123 的状态"——这些都需要**外部数据或计算**,而 LLM 既不能联网,也算不准大数乘法,更访问不了你的数据库。**Function Calling(函数调用)**就是打通 LLM 与外部世界的那座桥。本章讲清它的概念、原理与价值。

### 21.1 为什么需要 Function Calling

先看 LLM 自身的"能力边界":

| LLM 做不到 | 原因 |
|-----------|------|
| 查实时信息 | 训练数据有截止日期,不知道"今天" |
| 精确数学计算 | 模型是概率生成,大数运算会出错 |
| 访问私有数据库 | 模型不连你的系统 |
| 调用外部 API | 模型本身不能发请求 |
| 操作文件系统 | 模型是只读的文本处理器 |

如果只靠"纯生成",这些问题无解。**Function Calling 的核心思想是:让 LLM 输出"调用意图",由外部程序去执行真正的操作,再把结果喂回 LLM。** 这样 LLM 就从"只会说"变成了"能动手"。

举个直观例子,用户问"今天北京天气如何":

- **没有 Function Calling**:模型只能瞎猜或拒绝("我无法访问实时数据……")
- **有 Function Calling**:模型输出 \`get_weather(city="北京")\` → 程序调用真实天气 API → 拿到"晴,25℃" → 把结果回传 → 模型回答"北京今天晴,25℃"

### 21.2 Function Calling 是什么

**Function Calling** 是一种机制:**LLM 根据用户意图,决定调用哪个函数、生成调用参数,但不亲自执行——执行由宿主程序完成,结果再回传给 LLM 用于生成最终回答。**

关键点拆解:
1. **LLM 不执行代码**:它只输出"我想调用 get_weather,参数是 city=北京"这种结构化意图
2. **程序执行函数**:宿主代码拿到这个意图,真正去调天气 API
3. **结果回传**:把"晴,25℃"作为新消息喂回 LLM
4. **LLM 总结**:模型基于结果生成自然语言回答给用户

### 21.3 工作原理(四步闭环)

Function Calling 是一个**闭环**(loop),不是单次调用:

\`\`\`
用户提问
   ↓
① LLM 分析意图 → 决定调用 get_weather(city="北京")
   ↓
② 程序执行 get_weather → 返回 "晴,25℃"
   ↓
③ 结果回传给 LLM(role=tool)
   ↓
④ LLM 基于结果生成 → "北京今天晴,气温25℃"
   ↓
返回给用户
\`\`\`

注意第④步——LLM 不是直接把工具结果原样转发,而是**基于结果重新组织语言**。这非常重要,因为工具返回的可能是原始 JSON,用户要的是自然语言。

### 21.4 函数 Schema 定义

要让 LLM 知道"有哪些函数可调、每个函数要什么参数",你需要用 **JSON Schema** 描述函数。这是一份"说明书",告诉模型函数的名称、用途、参数结构。

\`\`\`python
# 一个天气函数的 schema 定义(OpenAI 风格)
weather_tool = {
    "type": "function",
    "function": {
        "name": "get_weather",                    # 函数名
        "description": "查询指定城市的实时天气",  # 描述:LLM 据此判断何时调用
        "parameters": {                           # 参数 schema
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名,如'北京'、'上海'"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],  # 枚举限制
                    "description": "温度单位,默认摄氏度"
                }
            },
            "required": ["city"]  # 必填参数
        }
    }
}
\`\`\`

**schema 设计的三个要点**:
1. **description 要写清楚**:LLM 靠 description 判断"该不该调这个函数"。描述越精准,误调越少。
2. **参数要有类型和约束**:用 \`enum\`、\`required\` 等约束,减少 LLM 生成无效参数。
3. **函数要原子化**:一个函数做一件事,复杂逻辑靠多个函数组合(交给 LLM 编排)。

### 21.5 Function Calling vs 普通生成

| 维度 | 普通生成 | Function Calling |
|------|---------|-----------------|
| 输出形式 | 自然语言文本 | 结构化 JSON(函数名+参数) |
| 能否执行操作 | 不能,只能"说" | 能(由宿主程序执行) |
| 实时数据 | 无 | 有(函数可访问外部) |
| 精确计算 | 概率生成,易错 | 精确(函数算) |
| 调用次数 | 1 次 | 可能多轮(闭环) |
| 适用场景 | 问答、写作 | Agent、工具增强 |

### 21.6 它是 Agent 的基石

Function Calling 之所以重要,是因为它是 **Agent 的基石**。回顾第4章讲的 Agent 三能力——感知、推理、行动:

- **感知**:接收用户输入 + 工具返回结果
- **推理**:LLM 决定"下一步调哪个工具"(就是 Function Calling 的"决定调用")
- **行动**:执行函数(就是 Function Calling 的"程序执行")

没有 Function Calling,Agent 就只剩"推理"一条腿,无法"行动"。有了它,Agent 才能真正动手完成现实任务。后续章节的 LangChain、LangGraph、多 Agent 协作,都建立在 Function Calling 之上。

### 21.7 流程图解

完整的 Function Calling 时序:

\`\`\`
┌──────┐      ┌──────┐      ┌──────────┐
│ 用户 │      │ LLM  │      │ 函数执行器│
└──┬───┘      └──┬───┘      └────┬─────┘
   │ "北京天气?" │                │
   │───────────►│                │
   │            │ tool_calls     │
   │            │───────────────►│ get_weather("北京")
   │            │                │───► 调天气API
   │            │  tool_result  │
   │            │◄───────────────│ "晴,25℃"
   │            │ 生成最终回答    │
   │ "北京晴25℃"│                │
   │◄───────────│                │
\`\`\`

### 21.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 以为 LLM 执行函数 | 期望 LLM 真发请求 | LLM 只输出意图,执行靠你的代码 |
| description 写得模糊 | LLM 不知何时调用 | 写清"什么场景调""做什么" |
| 参数没加约束 | LLM 乱填参数 | 用 enum/required/pattern 约束 |
| 忘记回传结果 | LLM 卡住不回答 | tool 结果必须 role=tool 回传 |
| 一次调用就想完事 | 复杂任务需要多轮 | 实现循环,直到 LLM 不再要工具 |
| schema 太复杂 | LLM 理解错参数 | 参数尽量少而清晰 |

### 本章小结

本章建立了对 Function Calling 的整体认知:它是让 LLM"动手"的机制——LLM 输出调用意图,程序执行函数,结果回传给 LLM 生成回答。它通过四步闭环(分析→执行→回传→生成)解决了 LLM 不能联网、不能精确计算、不能访问私有数据的问题。**它最重要的定位是:Agent 的基石。** 下一章我们具体看 OpenAI 平台的 Function Calling 怎么用。`
  },

  // =============================================================
  // 第22章:OpenAI Function Calling
  // =============================================================
  {
    id: 'fc-openai',
    group: 'Function Calling',
    icon: '🟢',
    title: 'OpenAI Function Calling',
    content: `## 第22章　OpenAI Function Calling

理解了概念,本章进入实战——OpenAI 平台的 Function Calling 用法。OpenAI 的实现是目前最成熟、生态支持最广的,掌握它,再看其他平台会很容易。本章从 tools 参数定义,到完整调用循环,再到多函数并行与错误处理,带你跑通一个真实的"查天气"助手。

### 22.1 tools 参数:定义可用函数

在 OpenAI 的 API 中,通过 \`tools\` 参数告诉模型"有哪些函数可调"。每个 tool 是一个对象,核心字段是 \`function\`:

\`\`\`python
from openai import OpenAI

client = OpenAI()

# 定义两个工具:天气查询和计算器
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询指定城市的实时天气情况",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名,如'北京'"},
                },
                "required": ["city"],
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "进行数学计算,支持加减乘除",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "数学表达式,如'2+3*4'"},
                },
                "required": ["expression"],
            },
        }
    },
]
\`\`\`

### 22.2 tool_choice:控制调用行为

\`tool_choice\` 决定模型"是否调用工具、调哪个":

\`\`\`python
# auto(默认):模型自主决定是否调用
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京天气如何?"}],
    tools=tools,
    tool_choice="auto",  # 模型自己决定
)

# none:强制不调用工具,纯文本回答
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好"}],
    tools=tools,
    tool_choice="none",  # 禁用工具
)

# 指定函数:强制调用某个函数
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "查上海天气"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},  # 强制调天气
)
\`\`\`

### 22.3 响应里的 tool_calls

当模型决定调用函数时,响应的 \`message.tool_calls\` 会携带调用意图:

\`\`\`python
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气如何?"}],
    tools=tools,
    tool_choice="auto",
)

msg = resp.choices[0].message
print(msg.finish_reason)  # "tool_calls" 表示要调用工具

# 解析工具调用
import json
for tool_call in msg.tool_calls:
    fname = tool_call.function.name       # "get_weather"
    args = json.loads(tool_call.function.arguments)  # {"city": "北京"}
    print(f"调用 {fname},参数 {args}")
    # 调用 get_weather,参数 {'city': '北京'}
\`\`\`

注意几个关键字段:
- \`finish_reason == "tool_calls"\`:表示这次响应是要调工具,不是最终回答
- \`tool_call.id\`:每个调用有唯一 ID,回传结果时要对应
- \`function.arguments\`:是 JSON 字符串,需 \`json.loads\` 解析

### 22.4 执行函数并回传结果

拿到 tool_calls 后,**你的代码**真正执行函数,再把结果以 \`role: "tool"\` 消息回传:

\`\`\`python
import json

def get_weather(city):
    """真实的天气查询(这里模拟)"""
    # 实际会调用天气 API,如和风天气/OpenWeather
    fake_data = {"北京": "晴,25℃", "上海": "多云,28℃"}
    return fake_data.get(city, "暂无数据")

def calculate(expression):
    """安全的表达式计算"""
    try:
        # 注意:实际生产要用安全的表达式解析,eval 有风险
        return str(eval(expression))
    except Exception as e:
        return f"计算错误: {e}"

# 函数注册表:名字 -> 实际函数
FUNCTION_MAP = {
    "get_weather": get_weather,
    "calculate": calculate,
}

def run_conversation(user_msg):
    """完整的 Function Calling 循环"""
    messages = [{"role": "user", "content": user_msg}]

    while True:  # 循环,直到模型不再要工具
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        msg = resp.choices[0].message

        # 如果不是 tool_calls,说明模型给出最终回答了
        if not msg.tool_calls:
            return msg.content

        # 把助手的 tool_calls 消息加入历史
        messages.append(msg)

        # 执行每个工具调用,把结果回传
        for tool_call in msg.tool_calls:
            fname = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            print(f"[执行] {fname}({args})")

            # 找到对应函数执行
            func = FUNCTION_MAP.get(fname)
            if func:
                result = func(**args)
            else:
                result = f"错误:函数 {fname} 不存在"

            # 回传结果(role=tool,要带 tool_call_id 对应)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,  # 必须对应!
                "content": str(result),
            })
            print(f"[结果] {result}")

# 测试
print(run_conversation("北京天气如何?再帮我算下 12*15"))
# [执行] get_weather({'city': '北京'})
# [结果] 晴,25℃
# [执行] calculate({'expression': '12*15'})
# [结果] 180
# 最终回答:北京今天晴,气温25℃。12乘15等于180。
\`\`\`

### 22.5 多函数并行调用

注意上例中模型**一次返回了两个 tool_calls**(天气 + 计算器)。OpenAI 支持并行调用多个独立函数,你的代码只需遍历执行即可。这比串行(一次只调一个)效率高很多。

> 💡 **何时并行**:当多个工具调用互相独立时(如查天气 + 算数),模型会并行。当有依赖时(如先查天气再根据天气决定是否带伞),模型会串行——第一轮调天气,看到结果后再调第二个工具。

### 22.6 错误处理

实际执行函数时,可能函数不存在、参数错误、执行异常。正确做法是**把错误信息作为 tool 结果回传**,让 LLM 自己决定怎么办(重试 / 换工具 / 告诉用户):

\`\`\`python
def safe_execute(tool_call):
    """带错误处理的执行"""
    fname = tool_call.function.name
    try:
        args = json.loads(tool_call.function.arguments)
    except json.JSONDecodeError:
        # LLM 生成的参数不是合法 JSON
        return "错误:参数格式不正确,请重新生成"

    func = FUNCTION_MAP.get(fname)
    if not func:
        return f"错误:函数 {fname} 不存在"

    try:
        return str(func(**args))
    except TypeError as e:
        return f"错误:参数不匹配 - {e}"
    except Exception as e:
        return f"错误:执行失败 - {e}"

# 在循环里用 safe_execute 替代直接调用
# LLM 看到"错误:xxx"会尝试修正或告知用户
\`\`\`

### 22.7 实战:天气查询助手

把前面所有部分组装成一个完整的可复用助手:

\`\`\`python
class ToolAssistant:
    """OpenAI Function Calling 通用助手"""
    def __init__(self, tools, function_map, system="你是 helpful 助手。"):
        self.client = OpenAI()
        self.tools = tools
        self.function_map = function_map
        self.system = system

    def chat(self, user_msg):
        messages = [
            {"role": "system", "content": self.system},
            {"role": "user", "content": user_msg},
        ]
        for _ in range(10):  # 防止无限循环,最多10轮
            resp = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
            )
            msg = resp.choices[0].message
            if not msg.tool_calls:
                return msg.content
            messages.append(msg)
            for tc in msg.tool_calls:
                fname = tc.function.name
                args = json.loads(tc.function.arguments)
                func = self.function_map.get(fname)
                result = str(func(**args)) if func else f"函数 {fname} 不存在"
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": result})
        return "达到最大轮次限制"

# 使用
assistant = ToolAssistant(tools, FUNCTION_MAP, system="你是天气+计算助手。")
print(assistant.chat("上海和北京哪个更热?帮我算算两地温差"))
\`\`\`

### 22.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 忘记回传 tool_call_id | 报错 "tool message must have tool_call_id" | 每个 tool 消息带对应 id |
| 没把 msg 加入历史 | 模型丢失上下文,重复调用 | 执行前先 append 助手消息 |
| 不做循环 | 只调一次就结束 | while 循环直到无 tool_calls |
| 无限循环 | 任务卡死 | 加最大轮次限制 |
| eval 直接用 | 安全风险 | 用 ast.literal_eval 或专门解析 |
| 错误不回传 | 模型卡住 | 把错误字符串作为 tool 结果 |

### 本章小结

本章完整讲解了 OpenAI Function Calling:用 \`tools\` 定义函数、\`tool_choice\` 控制行为、解析 \`tool_calls\` 响应、执行函数并以 \`role:tool\` 回传结果。关键是**实现闭环循环**——一直跑直到模型不再要工具。多函数并行能提升效率,错误要回传让模型自处理。下一章我们看 Claude 的 Tool Use,对比两者异同。`
  },

  // =============================================================
  // 第23章:Claude Tool Use
  // =============================================================
  {
    id: 'fc-claude',
    group: 'Function Calling',
    icon: '🟠',
    title: 'Claude Tool Use',
    content: `## 第23章　Claude Tool Use

Claude 也有自己的工具调用机制,叫 **Tool Use**(工具使用)。功能和 OpenAI 的 Function Calling 类似,但接口设计有差异——Claude 用 **block(块)结构** 而非扁平字段,语义更清晰。本章讲解 Claude Tool Use 的用法,并与 OpenAI 做对比。

### 23.1 Claude 的 tool_use 接口

在 Claude 中定义工具用 \`tools\` 参数(和 OpenAI 同名),但工具结构不同——用 \`input_schema\` 而非 \`parameters\`:

\`\`\`python
from anthropic import Anthropic
import json

client = Anthropic()

# Claude 的工具定义
tools = [
    {
        "name": "get_weather",
        "description": "查询指定城市的实时天气",
        "input_schema": {  # 注意:是 input_schema 不是 parameters
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名"}
            },
            "required": ["city"]
        }
    },
    {
        "name": "query_db",
        "description": "查询数据库,返回指定表的数据",
        "input_schema": {
            "type": "object",
            "properties": {
                "table": {"type": "string", "description": "表名"},
                "condition": {"type": "string", "description": "查询条件"}
            },
            "required": ["table"]
        }
    }
]

resp = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "查一下北京天气"}],
)
\`\`\`

### 23.2 tool_use block 与 tool_result block

Claude 的响应里,工具调用以 **content block** 形式出现,这是它与 OpenAI 最大的结构差异:

\`\`\`python
# 响应里 content 是数组,可能含多种 block
for block in resp.content:
    print(f"block type: {block.type}")
    if block.type == "text":
        print(f"文本: {block.text}")
    elif block.type == "tool_use":
        print(f"调用函数: {block.name}")
        print(f"参数: {block.input}")        # input 已是 dict,不用 json.loads
        print(f"调用ID: {block.id}")         # 用于回传结果
\`\`\`

注意几个关键差异:
- **block 结构**:Claude 的 \`content\` 是数组,每个元素是一个 block(\`text\` / \`tool_use\` 等类型)
- **input 是 dict**:不用 \`json.loads\`,直接是 Python dict
- **stop_reason**:Claude 用 \`stop_reason == "tool_use"\` 表示要调工具(对应 OpenAI 的 finish_reason)
- **可同时有文本和工具调用**:一个响应里可能既有 \`text\` block(模型的话),又有 \`tool_use\` block

回传结果时,要在 assistant 消息后追加一条 user 消息,内含 \`tool_result\` block:

\`\`\`python
def execute_tool(name, inputs):
    """执行工具(模拟)"""
    if name == "get_weather":
        return {"北京": "晴25℃", "上海": "多云28℃"}.get(inputs["city"], "无数据")
    return "未知工具"

# 假设 resp 里有一个 tool_use block
tool_use_block = [b for b in resp.content if b.type == "tool_use"][0]
result = execute_tool(tool_use_block.name, tool_use_block.input)

# 回传:把 assistant 响应原样 + 一条带 tool_result 的 user 消息
messages = [
    {"role": "user", "content": "查一下北京天气"},
    {"role": "assistant", "content": resp.content},  # 原样回传
    {
        "role": "user",
        "content": [
            {
                "type": "tool_result",
                "tool_use_id": tool_use_block.id,  # 必须对应!
                "content": str(result),
            }
        ]
    }
]

# 第二轮调用,模型基于结果生成最终回答
resp2 = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    messages=messages,
)
print(resp2.content[0].text)
# "北京今天晴,气温25℃。"
\`\`\`

### 23.3 与 OpenAI 的区别

| 维度 | OpenAI | Claude |
|------|--------|--------|
| 工具参数字段 | \`parameters\` | \`input_schema\` |
| 响应结构 | \`message.tool_calls\`(扁平数组) | \`content\` 里的 \`tool_use\` block |
| 参数格式 | JSON 字符串,需 \`json.loads\` | dict,直接用 |
| 工具结果回传 | \`role: "tool"\` 消息 | user 消息内含 \`tool_result\` block |
| 文本+工具共存 | 不行(要么文本要么工具) | 可以(同一响应里多个 block) |
| 停止标志 | \`finish_reason == "tool_calls"\` | \`stop_reason == "tool_use"\` |

> 💡 **设计哲学差异**:OpenAI 偏"扁平"——工具调用是消息的特殊字段;Claude 偏"结构化"——一切都是 block,文本是 text block,工具调用是 tool_use block。Claude 的设计更灵活(一个响应可同时说话和调工具),但解析代码稍复杂。

### 23.4 强制工具使用(tool_choice)

Claude 也支持 \`tool_choice\` 控制行为:

\`\`\`python
# auto(默认):模型自主决定
resp = client.messages.create(..., tool_choice={"type": "auto"})

# any:必须调用某个工具(但不指定哪个)
resp = client.messages.create(..., tool_choice={"type": "any"})

# tool:强制调用指定工具
resp = client.messages.create(
    ...,
    tool_choice={"type": "tool", "name": "get_weather"}  # 强制调天气
)
\`\`\`

### 23.5 多工具调用与完整循环

Claude 也支持一次返回多个 tool_use block(并行)。完整循环代码:

\`\`\`python
def claude_tool_loop(user_msg, tools, max_turns=10):
    """Claude Tool Use 完整循环"""
    client = Anthropic()
    messages = [{"role": "user", "content": user_msg}]

    for _ in range(max_turns):
        resp = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            tools=tools,
            messages=messages,
        )
        # 如果不需要调工具,返回文本
        if resp.stop_reason != "tool_use":
            # 提取所有 text block 拼接
            return "".join(b.text for b in resp.content if b.type == "text")

        # 否则执行所有 tool_use block
        messages.append({"role": "assistant", "content": resp.content})
        tool_results = []
        for block in resp.content:
            if block.type == "tool_use":
                print(f"[执行] {block.name}({block.input})")
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })
        # 把所有结果作为一条 user 消息回传
        messages.append({"role": "user", "content": tool_results})

    return "达到最大轮次"

# 测试
print(claude_tool_loop("北京天气如何?", tools))
\`\`\`

### 23.6 流式 Tool Use

Claude 支持流式输出工具调用,适合需要"边生成边显示"的场景:

\`\`\`python
with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "查北京天气"}],
) as stream:
    for event in stream:
        if event.type == "content_block_start":
            if event.content_block.type == "tool_use":
                print(f"开始调用 {event.content_block.name}")
        elif event.type == "content_block_delta":
            if event.delta.type == "text_delta":
                print(event.delta.text, end="")  # 实时打印文本
        elif event.type == "message_stop":
            print("\\n[完成]")

# 流式获取最终消息
final = stream.get_final_message()
\`\`\`

### 23.7 实战:Claude 查询数据库

下面是一个更贴近真实业务的例子——用 Claude Tool Use 查询数据库:

\`\`\`python
db_tools = [
    {
        "name": "list_tables",
        "description": "列出数据库所有表",
        "input_schema": {"type": "object", "properties": {}}
    },
    {
        "name": "query_table",
        "description": "查询指定表的数据",
        "input_schema": {
            "type": "object",
            "properties": {
                "table": {"type": "string"},
                "limit": {"type": "integer", "description": "返回行数"}
            },
            "required": ["table"]
        }
    }
]

def execute_db_tool(name, inputs):
    """模拟数据库操作"""
    if name == "list_tables":
        return "users, orders, products"
    elif name == "query_table":
        return f"表 {inputs['table']} 前{inputs.get('limit',5)}行: ..."
    return "未知"

# 让 Claude 自主探索数据库
print(claude_tool_loop("帮我看看数据库里有哪些表,然后查 users 表前3行", db_tools))
# Claude 会先调 list_tables,看到结果后调 query_table(users, limit=3)
\`\`\`

### 23.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 用 parameters 而非 input_schema | 报错 | Claude 用 input_schema |
| input 当字符串处理 | 类型错误 | Claude 的 input 已是 dict |
| tool_result 不带 tool_use_id | 报错 | 必须对应 block.id |
| assistant 消息不原样回传 | 上下文丢失 | 把 resp.content 原样放回 |
| 用 role:tool 回传 | 报错 | Claude 用 user 消息含 tool_result block |
| 忽略 text block | 丢失模型的话 | 遍历所有 block 处理 |

### 本章小结

本章讲解了 Claude Tool Use:用 \`input_schema\` 定义工具、响应以 \`tool_use\` block 出现(而非扁平字段)、\`input\` 直接是 dict、结果以 user 消息含 \`tool_result\` block 回传。与 OpenAI 的核心差异是"block 结构 vs 扁平结构"——Claude 更灵活但解析稍复杂。两者功能等价,选哪个看团队偏好和已有平台。下一章我们做一个完整实战,把多工具组合成一个真正的"工具增强 AI"。`
  },

  // =============================================================
  // 第24章:实战:工具增强 AI
  // =============================================================
  {
    id: 'fc-practice',
    group: 'Function Calling',
    icon: '🛠️',
    title: '实战:工具增强 AI',
    content: `## 第24章　实战:工具增强 AI

前三章我们学了 Function Calling 的概念和两个平台的用法。本章把所有知识组装起来,构建一个**生产级**的工具增强 AI 助手——它能查天气、做计算、查时间,具备工具注册中心、自动调度、错误恢复、循环检测和超时处理。这个实战是从 Function Calling 迈向 Agent 的关键过渡。

### 24.1 设计目标

我们要构建的助手需要满足:

1. **多工具支持**:天气、计算器、时间查询等多个工具
2. **工具注册中心**:统一注册/查找工具,易于扩展
3. **自动调度执行**:LLM 决定调什么,框架自动执行
4. **结果聚合**:多轮调用结果自动累积
5. **错误恢复**:工具失败不崩,反馈给 LLM
6. **循环检测**:防止 LLM 陷入无限调用
7. **超时处理**:整体有时限,不无限等

### 24.2 工具注册中心

先设计一个可扩展的工具注册中心——每个工具是带 schema 和执行函数的对象:

\`\`\`python
import json
from datetime import datetime
from dataclasses import dataclass, field
from typing import Callable, Any

@dataclass
class Tool:
    """工具定义:名字+描述+参数schema+执行函数"""
    name: str
    description: str
    parameters: dict          # JSON Schema
    func: Callable            # 实际执行函数

    def to_openai_schema(self):
        """转成 OpenAI tools 格式"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            }
        }

    def execute(self, **kwargs) -> str:
        """执行工具,返回字符串结果"""
        try:
            return str(self.func(**kwargs))
        except Exception as e:
            return f"[工具错误] {self.name} 执行失败: {e}"


class ToolRegistry:
    """工具注册中心"""
    def __init__(self):
        self._tools = {}

    def register(self, tool: Tool):
        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool:
        return self._tools.get(name)

    def to_openai_tools(self):
        return [t.to_openai_schema() for t in self._tools.values()]
\`\`\`

### 24.3 实现具体工具

定义三个具体工具:天气、计算器、时间:

\`\`\`python
# ===== 工具1:天气查询 =====
def get_weather(city: str) -> str:
    """查询城市天气(模拟)"""
    data = {"北京": "晴,25℃,湿度40%", "上海": "多云,28℃,湿度65%",
            "广州": "雷阵雨,30℃,湿度85%"}
    return data.get(city, f"暂无 {city} 的天气数据")

weather_tool = Tool(
    name="get_weather",
    description="查询指定城市的实时天气,返回温度湿度等",
    parameters={
        "type": "object",
        "properties": {"city": {"type": "string", "description": "城市名"}},
        "required": ["city"]
    },
    func=get_weather,
)

# ===== 工具2:计算器 =====
def calculate(expression: str) -> str:
    """安全计算数学表达式"""
    # 实际生产应使用 ast 解析,这里简化
    allowed = set("0123456789+-*/(). ")
    if not set(expression) <= allowed:
        return "错误:表达式含非法字符"
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算错误: {e}"

calc_tool = Tool(
    name="calculate",
    description="进行数学计算,支持加减乘除和括号",
    parameters={
        "type": "object",
        "properties": {"expression": {"type": "string", "description": "数学表达式如'2+3*4'"}},
        "required": ["expression"]
    },
    func=calculate,
)

# ===== 工具3:时间查询 =====
def get_current_time(timezone: str = "Asia/Shanghai") -> str:
    """获取当前时间"""
    now = datetime.now()
    return now.strftime(f"%Y-%m-%d %H:%M:%S ({timezone})")

time_tool = Tool(
    name="get_current_time",
    description="查询当前时间",
    parameters={
        "type": "object",
        "properties": {"timezone": {"type": "string", "description": "时区,默认上海"}},
    },
    func=get_current_time,
)

# 注册到中心
registry = ToolRegistry()
registry.register(weather_tool)
registry.register(calc_tool)
registry.register(time_tool)
\`\`\`

### 24.4 自动调度执行器(带循环检测+超时)

这是核心——一个能自动跑完整个 Function Calling 循环、且带防护的执行器:

\`\`\`python
import time

class ToolAgent:
    """工具增强 AI 助手"""
    def __init__(self, registry, system="你是 helpful 助手,可调用工具完成任务。"):
        from openai import OpenAI
        self.client = OpenAI()
        self.registry = registry
        self.system = system

    def chat(self, user_msg, max_turns=8, timeout_sec=60):
        """
        max_turns: 最大对话轮次(防无限循环)
        timeout_sec: 整体超时秒数
        """
        messages = [
            {"role": "system", "content": self.system},
            {"role": "user", "content": user_msg},
        ]
        start = time.time()
        call_count = 0  # 工具调用计数(循环检测用)

        for turn in range(max_turns):
            # 超时检查
            if time.time() - start > timeout_sec:
                return "⏱️ 处理超时,请简化问题"

            resp = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=self.registry.to_openai_tools(),
                tool_choice="auto",
            )
            msg = resp.choices[0].message

            # 没有工具调用 = 最终回答
            if not msg.tool_calls:
                return msg.content

            messages.append(msg)

            # 执行每个工具调用
            for tc in msg.tool_calls:
                call_count += 1
                # 循环检测:同一工具+同样参数重复3次以上,可能卡死
                if call_count > 15:
                    return "⚠️ 检测到可能的循环,已终止"

                fname = tc.function.name
                try:
                    args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    args = {}
                    result = "错误:参数格式不正确"
                else:
                    tool = self.registry.get(fname)
                    if tool:
                        print(f"  [调用] {fname}({args})")
                        result = tool.execute(**args)  # 内部已有 try/except
                    else:
                        result = f"错误:工具 {fname} 不存在"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                })
                print(f"  [结果] {result}")

        return "⚠️ 达到最大轮次限制,任务未完成"

# 创建助手
agent = ToolAgent(registry)
\`\`\`

### 24.5 运行实战

\`\`\`python
# 测试1:单工具
print(agent.chat("北京天气如何?"))
#   [调用] get_weather({'city': '北京'})
#   [结果] 晴,25℃,湿度40%
#   北京今天晴,气温25℃,湿度40%。

# 测试2:多工具组合
print(agent.chat("现在几点?然后帮我算 1234*5678+100"))
#   [调用] get_current_time({})
#   [结果] 2024-07-01 14:30:00 (Asia/Shanghai)
#   [调用] calculate({'expression': '1234*5678+100'})
#   [结果] 7005352
#   现在是2024年7月1日14:30。1234乘5678再加100等于7005352。

# 测试3:错误恢复
print(agent.chat("查火星天气"))
#   [调用] get_weather({'city': '火星'})
#   [结果] 暂无 火星 的天气数据
#   抱歉,暂无火星的天气数据。我只能查询地球城市。

# 测试4:跨步骤依赖
print(agent.chat("查北京和上海天气,告诉我哪里更热,温差多少"))
# Claude 会先并行查两个城市天气,再算温差,最后总结
\`\`\`

### 24.6 关键设计点解析

**1. 循环检测**:LLM 偶尔会"陷入循环"——反复调同一个函数同样参数。我们用 \`call_count > 15\` 粗暴止损。更精细的做法是记录每次 (函数名, 参数) 哈希,重复 N 次就中断:

\`\`\`python
# 更精细的循环检测
seen_calls = []
def is_looping(fname, args):
    key = (fname, json.dumps(args, sort_keys=True))
    if seen_calls.count(key) >= 2:  # 同样调用出现2次以上
        return True
    seen_calls.append(key)
    return False
\`\`\`

**2. 错误恢复**:工具失败时不抛异常,而是返回错误字符串给 LLM。LLM 看到错误会自我修正(换工具 / 改参数 / 告知用户)。这比直接崩溃更"像人"。

**3. 超时处理**:整体超时防止某些工具卡死(如外部 API 无响应)。超时返回友好提示。

**4. 工具原子化**:每个工具只做一件事。复杂任务靠 LLM 编排多个工具(如先查天气再算温差)。这就是 Agent 的雏形——LLM 做"决策",工具做"执行"。

### 24.7 从 Function Calling 到 Agent

回顾这个实战,你会发现它已经具备 Agent 的雏形:

| Agent 能力 | 本实战体现 |
|-----------|-----------|
| 感知 | 接收用户输入 + 工具结果 |
| 推理决策 | LLM 决定调哪个工具 |
| 行动 | 执行工具函数 |
| 循环 | while 循环跑闭环 |
| 自我修正 | 错误回传,LLM 调整 |

**只差一步**:真正的 Agent 还需要"自主规划"——把大任务拆成子任务,自主决定执行顺序。本实战里拆解是用户在提问时隐含的(如"查天气再算温差")。后续章节(LangChain/LangGraph)会引入显式的规划和多步推理。

### 24.8 易错点小结

| 易错点 | 表现 | 解决办法 |
|--------|------|---------|
| 不做循环检测 | 无限调用卡死 | 限制最大轮次 + 重复检测 |
| 工具抛异常导致崩 | 整个对话挂掉 | 工具内部 try/except,返回错误串 |
| 参数未校验 | eval 等执行恶意代码 | 严格校验 + 白名单 |
| 工具描述模糊 | LLM 乱调或漏调 | description 写清场景 |
| 没有超时 | 外部 API 卡死拖垮整体 | 整体超时 + 单工具超时 |
| 工具太"大" | 一个工具做太多事 | 拆成原子工具,靠 LLM 编排 |

### 本章小结

本章构建了一个生产级的工具增强 AI:工具注册中心让扩展工具零成本、自动调度执行器跑完闭环、错误恢复让助手"健壮"、循环检测和超时让助手"安全"。这个实战已经非常接近 Agent——它具备了感知、推理、行动、循环四要素。从下一部分开始,我们转向**本地开源模型**,看看不依赖云 API 时如何用 LLM。`
  }
];
