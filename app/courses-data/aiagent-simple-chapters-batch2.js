// =============================================================
// AI 智能体开发入门教程 —— 第 2 批（构建第一个智能体 4 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：as-（aiagent-simple）
// 分组：构建第一个智能体
// =============================================================

export const chapters = [
  // ============================================================
  // 第 5 章：ReAct 模式：思考+行动
  // ============================================================
  {
    id: "as-react",
    group: "构建第一个智能体",
    icon: "🧠",
    title: "ReAct 模式：思考+行动",
    content: `# ReAct 模式：思考+行动

## 一、ReAct 是什么

**ReAct = Reasoning + Acting**（推理 + 行动），由 Yao et al. 2022 提出。

核心思想：让大模型在执行动作之前**先思考**，把"想"和"做"交替进行。

## 二、与传统 Agent 的区别

| 类型 | 流程 | 问题 |
|---|---|---|
| 传统 Agent | 直接 Action → Observation | 缺乏规划，容易乱调工具 |
| ReAct Agent | Thought → Action → Observation → Thought → ... | 先思考再行动，更可控 |

> 类比：解数学题时，先列步骤（Thought），再算每一步（Action），看结果（Observation），再决定下一步。

## 三、思考过程可视化

ReAct 把每次推理都"打印"出来，便于调试：

\`\`\`
Thought 1: 用户问北京天气，我需要查天气工具
Action 1:  调用 get_weather("北京")
Observation 1: 北京 28℃，晴
Thought 2: 已经拿到天气，可以回答用户了
Action 2:  返回最终答案
\`\`\`

## 四、流程图（文字版）

\`\`\`
         ┌───────────────┐
用户输入 │  Thought(思考) │ ← LLM 推理"下一步该做什么"
         └───────┬───────┘
                 ↓
         ┌───────────────┐
         │ Action(行动)  │ ← 调用工具/函数
         └───────┬───────┘
                 ↓
         ┌─────────────────┐
         │ Observation(观察)│ ← 工具返回结果
         └───────┬─────────┘
                 ↓
            有最终答案？
           ├ 是 → 返回
           └ 否 → 回到 Thought
\`\`\`

## 五、为什么 ReAct 这么流行

1. **可解释**：每一步思考都可见，便于调试
2. **更准确**：思考后再行动，减少无效调用
3. **可中断**：发现思考走偏可以提前终止
4. **易实现**：只需要一个 LLM + 几个工具，就能跑起来`,
    code: `# ReAct 模式演示 —— 思考 + 行动循环
# ReAct = Reasoning + Acting，让 Agent 在行动前先思考
# 核心：Thought（思考）→ Action（行动）→ Observation（观察）循环
# 这个 demo 用 mock_llm 模拟大模型的思考过程，不依赖真实 API

# ===== 模拟 LLM 的"思考"功能 =====
# 真实场景会把对话历史发给 LLM，让它返回下一步动作
# 这里用预设步骤模拟，让 demo 可以独立运行
# 参数说明：
#   task: str —— 用户提出的任务
#   step: int —— 当前是第几轮思考（0 开始）
# 返回值：dict —— 含 thought（思考内容）和 action（要执行的动作）
def mock_llm(task: str, step: int) -> dict:
    """模拟 LLM 的思考过程，返回固定的思考步骤"""
    # 预设 3 轮思考，演示 ReAct 的循环结构
    # 真实场景由 LLM 根据上下文动态生成
    steps = [
        # 第 1 轮：理解任务，决定调用天气工具
        {
            "thought": f"用户问'{task}'，我需要调用天气查询工具获取北京天气",
            "action": {"name": "get_weather", "args": {"city": "北京"}},
        },
        # 第 2 轮：工具返回了温度，但还需要湿度信息
        {
            "thought": "已拿到北京气温 28℃，再查一下湿度更完整",
            "action": {"name": "get_humidity", "args": {"city": "北京"}},
        },
        # 第 3 轮：信息齐全，可以给出最终答案
        {
            "thought": "温度和湿度都拿到了，现在可以回答用户了",
            "action": {"name": "finish", "args": {"answer": "北京今天 28℃，晴，湿度 45%"}},
        },
    ]
    # 越界时返回 finish，防止无限循环
    if step >= len(steps):
        return {"thought": "已经回答完毕", "action": {"name": "finish", "args": {"answer": "任务完成"}}}
    return steps[step]


# ===== 模拟工具：天气查询 =====
# 参数说明：
#   city: str —— 城市名
# 返回值：str —— 天气描述
def get_weather(city: str) -> str:
    """模拟查询天气"""
    return f"{city} 28℃，晴"


# ===== 模拟工具：湿度查询 =====
def get_humidity(city: str) -> str:
    """模拟查询湿度"""
    return f"{city} 湿度 45%"


# ===== ReAct Agent 类 =====
# 把 think / act / observe 三个步骤封装成类，逻辑清晰
class ReActAgent:
    """ReAct 模式的智能体"""

    def __init__(self, task: str):
        # task：用户提出的任务
        self.task = task
        # step：记录当前是第几轮思考
        self.step = 0
        # observations：保存每轮观察到的结果，供下一轮思考参考
        self.observations = []

    def think(self) -> dict:
        """思考环节：调用 LLM 决定下一步动作"""
        # 把当前任务和观察传给 LLM（这里用 mock_llm 简化）
        result = mock_llm(self.task, self.step)
        print(f"Thought {self.step + 1}: {result['thought']}")
        return result

    def act(self, action: dict) -> str:
        """行动环节：根据动作名调用对应工具"""
        name = action["name"]
        args = action["args"]
        print(f"Action {self.step + 1}: 调用 {name}({args})")
        # 根据动作名分发到不同工具
        if name == "get_weather":
            return get_weather(**args)
        elif name == "get_humidity":
            return get_humidity(**args)
        elif name == "finish":
            # finish 表示思考结束，直接返回最终答案
            return args["answer"]
        else:
            return f"未知工具: {name}"

    def observe(self, result: str) -> bool:
        """观察环节：记录结果，判断是否结束"""
        print(f"Observation {self.step + 1}: {result}")
        # 把观察结果加入历史，供下一轮思考
        self.observations.append(result)
        self.step += 1
        # 如果结果就是最终答案（包含"完成"或类似字样），结束循环
        # 这里简单用 finish 动作判定，实际可由 LLM 输出 finish 标志
        return "北京" in result and "湿度" in result

    def run(self) -> str:
        """主循环：思考 → 行动 → 观察，直到得出最终答案"""
        print(f"=== 任务：{self.task} ===")
        # 至少 3 轮思考，最多 5 轮防止死循环
        max_steps = 5
        final_answer = ""
        while self.step < max_steps:
            # 1. 思考
            thought_result = self.think()
            action = thought_result["action"]
            # 2. 行动
            result = self.act(action)
            # 3. 观察
            if action["name"] == "finish":
                # finish 动作直接拿到最终答案
                final_answer = result
                print(f"Observation {self.step + 1}: 任务完成")
                break
            done = self.observe(result)
            if done:
                final_answer = result
                break
        return final_answer


# ===== 测试 =====
agent = ReActAgent("北京今天天气怎么样")
answer = agent.run()
print()
print(f"最终答案: {answer}")
`,
  },

  // ============================================================
  // 第 6 章：让 Agent 用工具：工具调用基础
  // ============================================================
  {
    id: "as-tools",
    group: "构建第一个智能体",
    icon: "🔧",
    title: "让 Agent 用工具：工具调用基础",
    content: `# 让 Agent 用工具：工具调用基础

## 一、工具（Tool）是什么

工具是 Agent 的"手"——LLM 自己只会"想"，要靠工具去"做"。

- LLM 不擅长：精确计算、实时查询、访问外部系统
- 工具擅长：算数、查时间、读数据库、调 API

## 二、工具 = 函数 + 描述

一个完整的工具需要两部分：

\`\`\`python
{
    "name": "calculator",         # 工具名（调用时用）
    "description": "算数计算器",   # 描述（让 Agent 知道何时用）
    "func": calculator_func,      # 实际执行的函数
}
\`\`\`

> **关键点**：description 决定 Agent 会不会选这个工具，写不清楚就没人用。

## 三、工具三要素

| 要素 | 作用 | 示例 |
|---|---|---|
| name | 唯一标识，调用时用 | \`calculator\` |
| description | 告诉 Agent 这个工具能干啥 | "用于数学计算，输入表达式返回结果" |
| parameters | 参数列表及类型 | \`{"expr": "字符串表达式"}\` |

## 四、Agent 如何选工具

Agent 看到用户问题后，会拿问题去匹配每个工具的 description：

1. **关键词匹配**（简单）：问题里有"几点" → 选 get_time
2. **语义相似度**（进阶）：用向量计算问题和描述的相似度
3. **LLM 决策**（最强）：把工具列表丢给 LLM，让它决定用哪个

> 类比：工具箱里挑扳手还是螺丝刀——看你要拧螺母还是拧螺丝。

## 五、工具调用的完整流程

\`\`\`
用户问 "3+5 等于多少"
   ↓
Agent 查看工具列表 → 匹配 calculator
   ↓
调用 calculator("3+5")
   ↓
工具返回 8
   ↓
Agent 把结果回答给用户
\`\`\``,
    code: `# 工具调用基础演示 —— 让 Agent 用工具
# 演示如何把函数包装成"工具"，让 Agent 根据问题选择并调用
# 工具三要素：name（名字）、description（描述）、func（函数）

import datetime  # datetime 模块：用于获取当前时间


# ===== 工具 1：计算器 =====
# 真实场景中表达式计算要小心安全（eval 有风险），demo 用 eval 简化
# 参数说明：
#   expr: str —— 数学表达式字符串，如 "3+5"
# 返回值：str —— 计算结果
def calculator(expr: str) -> str:
    """计算数学表达式"""
    # eval 会执行字符串中的 Python 表达式
    # 生产环境应改用 ast.literal_eval 或 sympy 等安全方案
    result = eval(expr)
    return f"{expr} = {result}"


# ===== 工具 2：时间查询 =====
# 无参数，返回当前时间
# 返回值：str —— 格式化的时间字符串
def get_time() -> str:
    """返回当前时间"""
    now = datetime.datetime.now()
    # strftime 把时间对象格式化成易读字符串
    return now.strftime("现在是 %Y-%m-%d %H:%M:%S")


# ===== 工具注册表 =====
# 每个工具是含 name / description / func 三要素的字典
# Agent 通过 description 判断用哪个工具
TOOLS = [
    {
        "name": "calculator",
        "description": "用于数学计算，输入表达式返回计算结果，如 3+5",
        "func": calculator,
    },
    {
        "name": "get_time",
        "description": "查询当前时间，无需参数",
        "func": get_time,
    },
]


# ===== ToolAgent 类 =====
# 负责工具注册、选择、调用三个核心职责
class ToolAgent:
    """能使用工具的简单 Agent"""

    def __init__(self, tools: list):
        # tools：工具列表，每个含 name / description / func
        self.tools = tools

    def select_tool(self, question: str) -> dict:
        """根据问题选择工具（用关键词匹配模拟 LLM 选工具）"""
        # 真实场景会把问题和工具描述一起发给 LLM，让 LLM 输出工具名
        # 这里用关键词匹配简化演示
        if "几点" in question or "时间" in question:
            # 问题包含时间相关词 → 选 get_time
            return self.tools[1]
        if "加" in question or "+" in question or "等于" in question:
            # 问题包含计算相关词 → 选 calculator
            return self.tools[0]
        # 没匹配上时返回 None，调用方需处理
        return None

    def run(self, question: str) -> str:
        """主流程：选工具 → 执行 → 返回答案"""
        print(f"问题: {question}")
        # 1. 选工具
        tool = self.select_tool(question)
        if not tool:
            return "抱歉，我没有合适的工具回答这个问题"
        print(f"选择工具: {tool['name']}")
        # 2. 提取参数（demo 简化：从问题里抠出表达式）
        # 真实场景由 LLM 根据工具的 parameters 定义抽取参数
        if tool["name"] == "calculator":
            # 用正则从问题中提取数字和运算符
            import re
            # 匹配形如 "3+5"、"10-2" 的表达式
            match = re.search(r"(\\d+[\\+\\-\\*/]\\d+)", question)
            expr = match.group(1) if match else "0"
            print(f"提取参数: expr={expr}")
            # 3. 调用工具
            result = tool["func"](expr)
        else:
            # 时间工具无参数，直接调用
            result = tool["func"]()
        print(f"工具返回: {result}")
        return result


# ===== 测试 =====
agent = ToolAgent(TOOLS)

print("=== 测试 1：算数问题 ===")
agent.run("3+5 等于多少")

print()
print("=== 测试 2：时间问题 ===")
agent.run("现在几点了")

print()
print("=== 测试 3：无法回答的问题 ===")
agent.run("北京到上海多远")
`,
  },

  // ============================================================
  // 第 7 章：多工具选择：根据问题挑工具
  // ============================================================
  {
    id: "as-multi-tool",
    group: "构建第一个智能体",
    icon: "🎯",
    title: "多工具选择：根据问题挑工具",
    content: `# 多工具选择：根据问题挑工具

## 一、多工具场景

真实 Agent 通常挂载十几个甚至几十个工具。比如 ChatGPT 的插件系统、Claude 的工具集、Cursor 的 MCP 服务。

Agent 要做的第一件事：**从工具箱里挑对工具**。

## 二、工具选择策略

| 策略 | 原理 | 优点 | 缺点 |
|---|---|---|---|
| 关键词匹配 | 看问题里有没有工具的关键词 | 简单、快 | 不灵活，错一词就选错 |
| 语义相似度 | 用向量算问题和描述的相似度 | 容错好 | 需要向量模型 |
| LLM 决策 | 把工具列表交给 LLM 让它选 | 最聪明 | 慢、贵 |

## 三、工具注册表（Tool Registry）

把所有工具统一管理的数据结构：

\`\`\`python
registry = {
    "calculator": {"description": "...", "func": ...},
    "get_time":   {"description": "...", "func": ...},
    "get_weather": {"description": "...", "func": ...},
}
\`\`\`

好处：
1. **统一管理**：增删工具不影响 Agent 主体
2. **可发现**：Agent 启动时打印所有可用工具
3. **可扩展**：新工具只需 register，无需改代码

## 四、选错工具怎么办

Agent 不是神，也会选错。常见处理：

1. **错误捕获**：工具抛异常时记录、不要崩
2. **重试机制**：换个工具再试一次
3. **回退策略**：实在不行就老实说"我不会"

> 类比：你问朋友"今天的新闻"，他给你的却是天气——错了就纠正，重试或换人。

## 五、真实案例：ChatGPT 插件系统

ChatGPT 早期插件系统就是典型多工具场景：
- 每个插件是一个工具（机票、计算、搜索…）
- 用户提问 → GPT 决定调哪个插件
- 插件返回结果 → GPT 整合后回答用户

后来 OpenAI 改成了 Function Calling + GPTs，但思路一脉相承。`,
    code: `# 多工具选择演示 —— Agent 如何从工具箱里挑工具
# 注册 4 个工具，用关键词匹配模拟"LLM 选工具"
# 测试 4 个不同问题，验证每个都能选到正确工具

import datetime  # datetime 用于时间查询


# ===== 4 个工具函数 =====
# 每个函数对应一种能力，参数和返回值都用 str 简化

def calculator(expr: str) -> str:
    """计算数学表达式"""
    # eval 仅用于 demo，生产环境需替换为安全实现
    return f"计算结果: {expr} = {eval(expr)}"


def get_time() -> str:
    """查询当前时间"""
    return datetime.datetime.now().strftime("现在时间是 %H:%M:%S")


def get_weather(city: str) -> str:
    """模拟查询天气（不调真实 API）"""
    # 用预设数据模拟，避免依赖外部服务
    mock_data = {"北京": "28℃ 晴", "上海": "25℃ 多云", "广州": "30℃ 雨"}
    return f"{city} 今天: {mock_data.get(city, '未知城市')}"


def word_count(text: str) -> str:
    """统计单词数量"""
    # split() 默认按空白字符切分
    count = len(text.split())
    return f"共 {count} 个词"


# ===== 工具注册表 =====
# 把所有工具集中管理，便于扩展
# 每个工具有 name / description / func / keywords 四个字段
# keywords 用于关键词匹配时判断是否选这个工具
TOOL_REGISTRY = [
    {
        "name": "calculator",
        "description": "数学计算器，输入表达式返回计算结果",
        "func": calculator,
        "keywords": ["加", "减", "乘", "除", "+", "-", "*", "/", "等于", "计算"],
    },
    {
        "name": "get_time",
        "description": "查询当前时间",
        "func": get_time,
        "keywords": ["几点", "时间", "现在"],
    },
    {
        "name": "get_weather",
        "description": "查询城市天气",
        "func": get_weather,
        "keywords": ["天气", "气温", "下雨", "晴天"],
    },
    {
        "name": "word_count",
        "description": "统计文本单词数量",
        "func": word_count,
        "keywords": ["几个词", "单词数", "统计词"],
    },
]


# ===== 选工具函数 =====
# 用关键词匹配模拟 LLM 选工具的过程
# 参数说明：
#   question: str —— 用户的问题
#   tools: list —— 工具注册表
# 返回值：dict | None —— 选中的工具字典，没匹配上返回 None
def select_tool(question: str, tools: list) -> dict:
    """根据问题匹配关键词，返回最合适的工具"""
    best_tool = None       # 最匹配的工具
    best_score = 0         # 匹配的关键词数，越多越合适
    for tool in tools:
        # 统计问题里命中了几个关键词
        score = sum(1 for kw in tool["keywords"] if kw in question)
        if score > best_score:
            best_score = score
            best_tool = tool
    return best_tool


# ===== 多工具 Agent 类 =====
class MultiToolAgent:
    """能从多个工具中选合适工具的 Agent"""

    def __init__(self, registry: list):
        # registry：工具注册表
        self.registry = registry

    def run(self, question: str) -> str:
        """主流程：选工具 → 执行 → 返回答案"""
        print(f"问题: {question}")
        # 1. 选工具
        tool = select_tool(question, self.registry)
        if not tool:
            print("→ 没有匹配的工具")
            return "抱歉，我无法回答这个问题"
        print(f"→ 选择工具: {tool['name']}")
        # 2. 提取参数（demo 简化处理）
        # 真实场景由 LLM 根据工具参数定义抽取
        import re
        if tool["name"] == "calculator":
            match = re.search(r"(\\d+[\\+\\-\\*/]\\d+)", question)
            args = [match.group(1)] if match else ["0"]
        elif tool["name"] == "get_weather":
            # 简单匹配城市名
            for city in ["北京", "上海", "广州"]:
                if city in question:
                    args = [city]
                    break
            else:
                args = ["未知城市"]
        elif tool["name"] == "word_count":
            # 取引号里的内容作为待统计文本
            match = re.search(r"\\"(.+?)\\"", question)
            args = [match.group(1)] if match else [question]
        else:
            # get_time 无参数
            args = []
        # 3. 调用工具
        try:
            result = tool["func"](*args)
            print(f"→ 执行结果: {result}")
            return result
        except Exception as e:
            # 错误处理：工具执行失败时给友好提示，不让 Agent 崩
            print(f"→ 工具执行出错: {e}")
            return "工具执行失败"


# ===== 测试 4 个不同问题 =====
agent = MultiToolAgent(TOOL_REGISTRY)

print("=== 测试 1：计算问题 ===")
agent.run("3+5 等于多少")

print()
print("=== 测试 2：时间问题 ===")
agent.run("现在几点了")

print()
print("=== 测试 3：天气问题 ===")
agent.run("北京今天天气怎么样")

print()
print("=== 测试 4：单词计数 ===")
agent.run('统计这句话有几个词："hello world from agent"')
`,
  },

  // ============================================================
  // 第 8 章：给 Agent 记忆：上下文管理
  // ============================================================
  {
    id: "as-memory",
    group: "构建第一个智能体",
    icon: "💾",
    title: "给 Agent 记忆：上下文管理",
    content: `# 给 Agent 记忆：上下文管理

## 一、为什么需要记忆

人能记住刚聊过的话，但 LLM 默认是**无状态**的——每次调用都是独立请求。

如果没记忆，下面的对话就玩不转：

\`\`\`
用户：我叫张三
Agent：好的，张三
用户：我叫什么名字？
Agent：???  ← 不知道你叫啥
\`\`\`

记忆让 Agent 能引用之前的对话内容，多轮对话才连贯。

## 二、短期记忆 vs 长期记忆

| 类型 | 实现 | 容量 | 持久性 | 场景 |
|---|---|---|---|---|
| 短期记忆 | 对话历史（最近 N 轮） | 小 | 会话内 | 单次对话上下文 |
| 长期记忆 | 向量数据库 | 大 | 跨会话 | 用户偏好、历史事件 |

> 本章只讲短期记忆，长期记忆（向量库）会在 RAG 章节详细讲。

## 三、短期记忆的实现

最简单做法：把所有对话历史塞进 prompt

\`\`\`python
history = [
    {"role": "user", "content": "我叫张三"},
    {"role": "assistant", "content": "好的"},
    {"role": "user", "content": "我喜欢苹果"},
    {"role": "assistant", "content": "记下了"},
]
# 下次调用 LLM 时把 history 拼进 prompt
\`\`\`

## 四、记忆窗口（Window）

LLM 输入有 Token 上限（如 8K、32K、128K），对话太长就塞不下了。

**窗口策略**：只保留最近 N 轮对话

\`\`\`
最近 5 轮     ← 保留
─────────
更早的对话   ← 丢弃（或用摘要代替）
\`\`\`

进阶做法：**摘要压缩**——把旧对话总结成一段话，省 Token。

## 五、类比

| 人 | Agent |
|---|---|
| 短期记忆（背 7 位数字） | 对话历史 |
| 笔记本（记生日、习惯） | 向量数据库 |
| 工作记忆容量有限 | Token 窗口限制 |
| 写日记压缩记忆 | 对话摘要机制 |

## 六、本章 demo 思路

实现一个 \`Memory\` 类 + \`ConversationAgent\`：
- \`Memory\`：负责存取对话内容
- \`ConversationAgent\`：调用 LLM 时把记忆一起带上
- 用 mock 函数模拟 LLM 回复（引用记忆中的内容）`,
    code: `# 给 Agent 记忆 —— 上下文管理演示
# 演示如何让 Agent 记住之前的对话内容
# 实现 Memory 类（存取对话）+ ConversationAgent（带记忆对话）
# 用 mock_llm_response 模拟 LLM 回复，不依赖真实 API


# ===== Memory 类：负责存取对话内容 =====
# 短期记忆的实现：把对话历史保存成列表
# 真实场景会把 history 拼进 prompt 发给 LLM
class Memory:
    """简单的对话记忆类"""

    def __init__(self, max_rounds: int = 10):
        # max_rounds：最多保留几轮对话（窗口大小）
        # 超过窗口会丢弃最早的，避免 Token 超限
        self.max_rounds = max_rounds
        # history：对话历史列表，每条是 {"role": "user"/"assistant", "content": "..."}
        self.history = []
        # facts：从对话中提取的关键信息（如用户姓名、偏好）
        # 相当于"长期记忆"的简化版
        self.facts = {}

    def store(self, role: str, content: str):
        """存储一轮对话"""
        self.history.append({"role": role, "content": content})
        # 超过窗口时丢掉最早的一轮（一轮 = user + assistant）
        # 这里用 max_rounds * 2 是因为每轮有两条记录
        if len(self.history) > self.max_rounds * 2:
            self.history.pop(0)

    def store_fact(self, key: str, value: str):
        """存储关键事实（如用户姓名）"""
        self.facts[key] = value

    def recall(self, query: str = "") -> list:
        """回忆对话历史"""
        # 真实场景会按 query 做语义检索，这里简化为返回全部
        return self.history

    def summary(self) -> str:
        """返回记忆摘要，便于打印调试"""
        lines = []
        for msg in self.history:
            # 把 role 翻译成中文便于阅读
            role = "用户" if msg["role"] == "user" else "Agent"
            lines.append(f"  {role}: {msg['content']}")
        # 把 facts 也展示出来
        if self.facts:
            lines.append(f"  [已知事实]: {self.facts}")
        return "\\n".join(lines)


# ===== 模拟 LLM 回复 =====
# 真实场景会把对话历史发给 LLM，让它根据上下文回复
# 这里用规则模拟：根据记忆中的 facts 生成回复
# 参数说明：
#   user_input: str —— 用户这一轮说的话
#   memory: Memory —— Agent 的记忆对象
# 返回值：str —— 模拟的 LLM 回复
def mock_llm_response(user_input: str, memory: Memory) -> str:
    """根据用户输入和记忆生成回复（规则模拟）"""
    # 规则 1：用户在"自报家门"，存到 facts
    if "我叫" in user_input:
        # 从"我叫张三"里提取名字
        name = user_input.replace("我叫", "").replace("。", "").strip()
        memory.store_fact("name", name)
        return f"你好，{name}！我记住了。"
    # 规则 2：用户在说喜好，存到 facts
    if "我喜欢" in user_input:
        # 从"我喜欢吃苹果"里提取喜好
        like = user_input.replace("我喜欢", "").replace("吃", "").replace("。", "").strip()
        memory.store_fact("like", like)
        return f"好的，你喜欢{like}，记下了。"
    # 规则 3：用户在问自己之前说过的事 → 从 facts 里查
    if "我叫什么" in user_input or "我的名字" in user_input:
        name = memory.facts.get("name", "未知")
        like = memory.facts.get("like", "未知")
        return f"你叫{memory.facts.get('name', '张三')}，你喜欢{like}。"
    # 默认回复
    return f"我收到了：{user_input}"


# ===== 带记忆的对话 Agent =====
class ConversationAgent:
    """有记忆的对话 Agent"""

    def __init__(self):
        # 每个 Agent 拥有独立的记忆
        self.memory = Memory(max_rounds=10)

    def chat(self, user_input: str) -> str:
        """进行一轮对话"""
        # 1. 把用户输入存入记忆
        self.memory.store("user", user_input)
        # 2. 调用 LLM 生成回复（带上记忆）
        reply = mock_llm_response(user_input, self.memory)
        # 3. 把 Agent 回复也存入记忆，下一轮能看到
        self.memory.store("assistant", reply)
        return reply


# ===== 测试：3 轮对话 =====
agent = ConversationAgent()

print("=== 第 1 轮 ===")
user_msg1 = "我叫张三"
print(f"用户: {user_msg1}")
reply1 = agent.chat(user_msg1)
print(f"Agent: {reply1}")

print()
print("=== 第 2 轮 ===")
user_msg2 = "我喜欢吃苹果"
print(f"用户: {user_msg2}")
reply2 = agent.chat(user_msg2)
print(f"Agent: {reply2}")

print()
print("=== 第 3 轮：测试记忆 ===")
user_msg3 = "我叫什么名字？我喜欢什么？"
print(f"用户: {user_msg3}")
reply3 = agent.chat(user_msg3)
print(f"Agent: {reply3}")

print()
print("=== 完整记忆内容 ===")
print(agent.memory.summary())
`,
  },
];
