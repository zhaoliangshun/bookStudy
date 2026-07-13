// =============================================================
// AI 智能体开发入门教程 —— 第 3 批（Function Calling 实战 4 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：as-（aiagent-simple）
// 分组：Function Calling 实战
// =============================================================

export const chapters = [
  // ============================================================
  // 第 9 章：Function Calling 原理
  // ============================================================
  {
    id: "as-fc",
    group: "Function Calling 实战",
    icon: "📞",
    title: "Function Calling 原理",
    content: `# Function Calling 原理

## 一、Function Calling 是什么

**Function Calling（函数调用）** 是让 LLM 输出**结构化的函数调用请求**的机制——LLM 不直接回答用户，而是说："请帮我调用这个函数，参数如下"。

> 类比：你问客服"明天北京天气？"——客服不会自己上天看，而是呼叫"天气查询部门"，拿到结果后再回复你。

## 二、与传统正则解析的区别

在没有 Function Calling 的年代，人们用**正则表达式**从 LLM 的自然语言回复里抠参数：

\`\`\`
LLM 回复："北京今天的天气是晴"
正则：r"(.+?)今天的天气是(.+?)" → city="北京", weather="晴"
\`\`\`

问题很多：

| 问题 | 正则解析 | Function Calling |
|---|---|---|
| 可靠性 | 易漏匹配、错匹配 | 结构化输出，稳定 |
| 参数类型 | 全是字符串 | 支持 number/boolean 等 |
| 多函数 | 难以区分 | 显式 name 字段 |
| 扩展性 | 改正则易出 bug | 加工具即可 |

## 三、OpenAI Function Calling 格式

OpenAI 的 Function Calling 返回这种结构：

\`\`\`json
{
  "name": "get_weather",
  "arguments": {
    "city": "北京"
  }
}
\`\`\`

- \`name\`：要调用的函数名
- \`arguments\`：参数字典（JSON 字符串）

## 四、完整工作流程

\`\`\`
1. 用户提问："北京天气怎么样？"
2. LLM 决定调用哪个函数 → 输出 {name:"get_weather", arguments:{city:"北京"}}
3. 应用层执行函数 → 调用真实 get_weather("北京") → "晴，25°C"
4. 把结果送回 LLM → LLM 拿到结果后生成最终回复
5. LLM 回复："北京今天晴，气温 25°C"
\`\`\`

> 关键：LLM 自己**不能**调函数，它只是"建议"调哪个。真正执行函数的是你的应用层代码。

## 五、文字流程图

\`\`\`
用户 ──┐
       ↓
   [LLM 决策] ──→ 输出函数调用 (name + arguments)
       │
       ↓
   [应用执行函数] ──→ 得到真实结果
       │
       ↓
   [LLM 二次回复] ──→ 把结果说成人话
       │
       ↓
   最终答案 → 用户
\`\`\`

> 一句话总结：Function Calling 让 LLM 从"聊天机器人"升级成"能驱动外部工具的 Agent"。`,
    code: `# Function Calling 原理演示
# 用 mock 函数模拟 LLM 的函数调用决策，演示完整 FC 流程
# 真实场景中，LLM 的决策由 OpenAI/通义千问等 API 完成
# 这里用关键词匹配模拟，帮助理解 FC 的工作机制

import json  # json 用于把 arguments 字典转成 JSON 字符串，模拟 OpenAI 返回格式

# ===== 定义 2 个真实工具函数 =====
# 工具 1：查询天气
# 参数说明：
#   city: str —— 城市名
# 返回值：str —— 天气描述
def get_weather(city: str) -> str:
    """模拟天气查询工具"""
    # 真实项目应调天气 API（如和风天气、OpenWeatherMap）
    # 这里用预设数据演示
    weather_db = {"北京": "晴，25°C", "上海": "多云，28°C", "广州": "雨，30°C"}
    return weather_db.get(city, f"{city}：暂无数据")

# 工具 2：简单计算器
# 参数说明：
#   a: float —— 第一个数
#   b: float —— 第二个数
#   op: str —— 操作符，支持 add/sub/mul/div
# 返回值：float —— 计算结果
def calculate(a: float, b: float, op: str) -> float:
    """模拟计算器工具"""
    if op == "add":
        return a + b
    if op == "sub":
        return a - b
    if op == "mul":
        return a * b
    if op == "div":
        return a / b if b != 0 else float("inf")
    raise ValueError(f"不支持的操作: {op}")

# ===== mock LLM：模拟 LLM 的函数调用决策 =====
# 真实 LLM 通过模型推理决定调哪个函数，这里用关键词匹配近似
# 参数说明：
#   question: str —— 用户的提问
#   tools: list —— 可用工具列表（含 name 和参数提取规则）
# 返回值：dict —— 模拟 OpenAI 的 FC 输出 {"name": ..., "arguments": {...}}
def mock_llm_with_fc(question: str, tools: list) -> dict:
    """用关键词匹配模拟 LLM 的函数调用决策"""
    print(f"  [LLM 决策] 分析用户问题: {question}")
    # 遍历所有工具，看哪个的关键词能匹配上用户问题
    for tool in tools:
        # 关键词列表，任一命中即视为选中该工具
        for kw in tool["keywords"]:
            if kw in question:
                print(f"  [LLM 决策] 命中关键词 '{kw}' → 选择工具: {tool['name']}")
                # 用工具自带的参数提取函数抽取参数
                # 真实 LLM 是基于语义理解生成参数，这里简化为规则提取
                args = tool["extract_args"](question)
                # 返回标准 FC 格式
                fc_result = {"name": tool["name"], "arguments": args}
                print(f"  [LLM 输出] {json.dumps(fc_result, ensure_ascii=False)}")
                return fc_result
    # 没有匹配的工具，返回 None 表示 LLM 决定不调用任何函数
    print("  [LLM 决策] 没有合适的工具，直接回复")
    return None

# ===== FunctionCallingAgent：封装完整 FC 流程 =====
# 这个类把"决策 → 执行 → 二次回复"流程封装成一个 Agent
class FunctionCallingAgent:
    """一个最小可用的 FC Agent"""

    def __init__(self, tools: list):
        # tools 是工具描述列表，每个含 name、func、keywords、extract_args
        self.tools = tools
        # 用字典方便按 name 查找真实函数
        self.tool_map = {t["name"]: t["func"] for t in tools}

    def run(self, question: str) -> str:
        """处理用户问题，返回最终回复"""
        print(f"\\n用户提问: {question}")
        # 第 1 步：LLM 决定调哪个函数
        print("步骤 1: LLM 决策")
        fc = mock_llm_with_fc(question, self.tools)
        if fc is None:
            # LLM 不调函数，直接给个万能回复
            return "抱歉，我无法处理这个问题。"

        # 第 2 步：应用层执行函数
        print("步骤 2: 执行函数")
        func = self.tool_map[fc["name"]]
        # **arguments 把字典展开成关键字参数
        result = func(**fc["arguments"])
        print(f"  [执行] {fc['name']}({fc['arguments']}) → {result}")

        # 第 3 步：LLM 二次回复（用 mock 函数把结果说成人话）
        print("步骤 3: LLM 二次回复")
        final = mock_llm_final_answer(question, fc["name"], result)
        print(f"  [最终回复] {final}")
        return final


# mock LLM 二次回复：根据函数执行结果生成自然语言回复
# 参数说明：
#   question: str —— 用户原问题
#   tool_name: str —— 调用的工具名
#   result: any —— 工具执行结果
# 返回值：str —— 自然语言回复
def mock_llm_final_answer(question: str, tool_name: str, result) -> str:
    """模拟 LLM 根据函数结果生成最终回复"""
    if tool_name == "get_weather":
        return f"查询结果：{result}"
    if tool_name == "calculate":
        return f"计算结果是 {result}"
    return str(result)


# ===== 工具描述表 =====
# 每个工具包含：name、func、keywords（触发关键词）、extract_args（参数提取函数）
tools = [
    {
        "name": "get_weather",
        "func": get_weather,
        "keywords": ["天气", "气温"],
        "extract_args": lambda q: {"city": "北京" if "北京" in q else
                                   "上海" if "上海" in q else
                                   "广州" if "广州" in q else "未知"},
    },
    {
        "name": "calculate",
        "func": calculate,
        "keywords": ["加", "减", "乘", "除", "计算"],
        "extract_args": lambda q: {"a": 3.0, "b": 5.0,
                                   "op": "add" if "加" in q else "mul"},
    },
]

# ===== 演示完整 FC 流程 =====
agent = FunctionCallingAgent(tools)

print("=== 场景 1：查天气 ===")
agent.run("北京天气怎么样？")

print()
print("=== 场景 2：做计算 ===")
agent.run("帮我计算 3 加 5")

print()
print("=== 场景 3：无匹配工具 ===")
agent.run("今天晚饭吃什么？")

print()
print("✅ 完整 FC 流程：决策 → 执行 → 二次回复")
`,
  },

  // ============================================================
  // 第 10 章：定义工具 Schema：参数校验
  // ============================================================
  {
    id: "as-schema",
    group: "Function Calling 实战",
    icon: "📋",
    title: "定义工具 Schema：参数校验",
    content: `# 定义工具 Schema：参数校验

## 一、工具 Schema 是什么

**工具 Schema** 是用 **JSON Schema** 描述函数参数的规范——告诉 LLM：

- 函数叫什么名字
- 函数做什么用
- 接受哪些参数、什么类型、是否必填

> 类比：餐厅菜单——菜名（name）、菜描述（description）、可选规格（parameters）。

## 二、Schema 的核心字段

\`\`\`json
{
  "name": "get_weather",
  "description": "查询指定城市的天气",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "城市名，如 北京、上海"
      }
    },
    "required": ["city"]
  }
}
\`\`\`

| 字段 | 作用 |
|---|---|
| \`name\` | 函数名（LLM 用来选择调用谁） |
| \`description\` | 函数说明（关键！LLM 据此判断是否匹配） |
| \`parameters.type\` | 固定为 \`object\` |
| \`parameters.properties\` | 每个参数的类型、描述 |
| \`parameters.required\` | 哪些参数是必填 |

## 三、为什么需要 Schema

1. **让 LLM 知道传什么参数**：没有 Schema，LLM 不知道函数要什么
2. **约束 LLM 输出**：明确类型，避免 LLM 瞎传字符串
3. **便于校验**：应用层可在执行前验证参数合法性
4. **自动生成文档**：OpenAI Swagger 等工具能直接读 Schema

## 四、参数校验三类

| 校验类型 | 示例 | 作用 |
|---|---|---|
| 必填检查 | \`required: ["city"]\` | 缺参数就拒绝 |
| 类型检查 | \`type: "string/number/boolean"\` | 防止传错类型 |
| 范围检查 | \`minimum: 0\`、\`enum: [...]\` | 限定取值范围 |

## 五、真实 OpenAI 工具定义示例

\`\`\`python
tools = [
    {
        "type": "function",
        "function": {
            "name": "send_email",
            "description": "发送邮件给指定收件人",
            "parameters": {
                "type": "object",
                "properties": {
                    "to": {"type": "string", "description": "收件人邮箱"},
                    "subject": {"type": "string", "description": "邮件主题"},
                    "body": {"type": "string", "description": "邮件正文"}
                },
                "required": ["to", "subject", "body"]
            }
        }
    }
]

# 调用 OpenAI 时把 tools 传进去
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "给 boss@x.com 发请假邮件"}],
    tools=tools,
)
\`\`\`

> 一句话总结：Schema 是 LLM 与外部世界沟通的"接口契约"，写清楚了 LLM 才能可靠地调用。`,
    code: `# 定义工具 Schema：参数校验演示
# 用 JSON Schema 风格描述工具，并实现参数校验
# 真实场景中 OpenAI / 通义千问等都会按这个 Schema 来生成参数
# 这里手动实现校验逻辑，帮助理解 LLM 输出后应用层应做什么

import json  # json 用于格式化打印 Schema 和参数

# ===== 定义 2 个工具的完整 Schema =====
# Schema 用 JSON Schema 风格描述函数的参数结构
# 每个 Schema 包含 name、description、parameters 三部分
tool_schemas = [
    {
        "name": "get_weather",
        "description": "查询指定城市的天气",
        "parameters": {
            "type": "object",  # 顶层必须是 object
            "properties": {
                "city": {
                    "type": "string",  # 类型约束
                    "description": "城市名，如 北京、上海",
                },
                "days": {
                    "type": "number",
                    "description": "查询未来几天",
                    "minimum": 1,        # 最小值
                    "maximum": 7,         # 最大值
                },
            },
            "required": ["city"],  # city 必填，days 可选
        },
    },
    {
        "name": "send_email",
        "description": "发送邮件给指定收件人",
        "parameters": {
            "type": "object",
            "properties": {
                "to": {
                    "type": "string",
                    "description": "收件人邮箱地址",
                },
                "subject": {
                    "type": "string",
                    "description": "邮件主题",
                },
                "body": {
                    "type": "string",
                    "description": "邮件正文",
                },
                "urgent": {
                    "type": "boolean",
                    "description": "是否紧急",
                },
            },
            "required": ["to", "subject", "body"],  # 三个字段必填
        },
    },
]

# ===== 参数校验函数 =====
# 根据 Schema 校验 LLM 输出的参数是否合法
# 参数说明：
#   args: dict —— LLM 传来的参数字典
#   schema: dict —— 工具的 Schema（含 parameters）
# 返回值：tuple[bool, list] —— (是否通过, 错误信息列表)
def validate_arguments(args: dict, schema: dict) -> tuple:
    """校验参数是否符合 Schema 定义"""
    errors = []  # 收集所有错误信息
    params = schema["parameters"]
    properties = params.get("properties", {})
    required = params.get("required", [])

    # 1. 检查必填字段
    # 遍历 required 列表，看 args 里是否都齐全
    for field in required:
        if field not in args:
            errors.append(f"缺少必填字段: {field}")
        elif args[field] is None:
            errors.append(f"必填字段为 None: {field}")

    # 2. 检查类型
    # JSON Schema 类型与 Python 类型的映射
    type_map = {
        "string": str,
        "number": (int, float),  # number 兼容 int 和 float
        "integer": int,
        "boolean": bool,
    }
    for field, value in args.items():
        # 跳过 Schema 中没定义的字段（额外字段可视为警告）
        if field not in properties:
            errors.append(f"未知字段: {field}")
            continue
        expected_type = properties[field].get("type")
        if expected_type in type_map:
            # 注意：bool 是 int 的子类，要特殊处理
            # isinstance(True, int) 返回 True，会误判
            if expected_type == "number" and isinstance(value, bool):
                errors.append(f"字段 {field}: 期望 number，实际 boolean")
                continue
            if not isinstance(value, type_map[expected_type]):
                actual = type(value).__name__
                errors.append(f"字段 {field}: 期望 {expected_type}，实际 {actual}")

    # 3. 检查范围（minimum / maximum）
    for field, value in args.items():
        if field not in properties:
            continue
        spec = properties[field]
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            continue  # 非数值类型跳过
        if "minimum" in spec and value < spec["minimum"]:
            errors.append(f"字段 {field}: {value} 小于最小值 {spec['minimum']}")
        if "maximum" in spec and value > spec["maximum"]:
            errors.append(f"字段 {field}: {value} 大于最大值 {spec['maximum']}")

    # 返回校验结果（布尔值 + 错误列表）
    return (len(errors) == 0, errors)


# ===== 测试 3 个用例 =====
# 用真实场景验证校验逻辑

# 工具名到 Schema 的映射，方便按名字查找
schema_map = {t["name"]: t for t in tool_schemas}

print("=== 用例 1：合法参数（应通过）===")
# 模拟 LLM 输出：传了 city 和 days，类型正确，范围合法
args1 = {"city": "北京", "days": 3}
ok, errs = validate_arguments(args1, schema_map["get_weather"])
print(f"参数: {json.dumps(args1, ensure_ascii=False)}")
print(f"校验结果: {'通过 ✅' if ok else '失败 ❌'}")
if errs:
    for e in errs:
        print(f"  - {e}")

print()
print("=== 用例 2：缺少必填字段（应报错）===")
# 模拟 LLM 漏传 to 字段
args2 = {"subject": "请假", "body": "我明天请假"}
ok, errs = validate_arguments(args2, schema_map["send_email"])
print(f"参数: {json.dumps(args2, ensure_ascii=False)}")
print(f"校验结果: {'通过 ✅' if ok else '失败 ❌'}")
for e in errs:
    print(f"  - {e}")

print()
print("=== 用例 3：类型错误（应报错）===")
# 模拟 LLM 把 urgent 传成字符串 "true" 而不是布尔值
args3 = {"to": "boss@x.com", "subject": "请假",
         "body": "我请假", "urgent": "true"}
ok, errs = validate_arguments(args3, schema_map["send_email"])
print(f"参数: {json.dumps(args3, ensure_ascii=False)}")
print(f"校验结果: {'通过 ✅' if ok else '失败 ❌'}")
for e in errs:
    print(f"  - {e}")

print()
print("=== 打印完整 Schema（演示用）===")
# 展示 Schema 长什么样，便于对照
print(json.dumps(tool_schemas[1], ensure_ascii=False, indent=2))

print()
print("✅ Schema + 校验 = Function Calling 的安全网")
# 总结：校验通过后才执行工具，能避免 LLM 幻觉导致崩溃
`,
  },

  // ============================================================
  // 第 11 章：多轮工具调用：查数据库
  // ============================================================
  {
    id: "as-fc-multi",
    group: "Function Calling 实战",
    icon: "🔄",
    title: "多轮工具调用：查数据库",
    content: `# 多轮工具调用：查数据库

## 一、多轮调用场景

真实任务往往需要**连续调多个函数**——一个函数的结果是下一个函数的输入。

典型场景：

\`\`\`
查用户 → 拿到 order_id → 查订单 → 拿到 shipping_id → 查物流
\`\`\`

> 类比：办身份证——先去派出所取号 → 拍照 → 交费 → 拿证，每一步都得等上一步结果。

## 二、为什么单轮 FC 不够用

单轮 Function Calling 只能调一个函数就返回。但实际业务里：

- 一个用户问题需要 3-5 步才能解决
- 中间步骤的结果决定下一步调什么函数
- LLM 需要根据中间结果"思考"下一步

**Agent 模式**就是为此而生——循环调用 LLM + 工具，直到拿到最终答案。

## 三、链式调用的关键点

| 关键点 | 说明 |
|---|---|
| 状态管理 | 记录中间结果，避免重复调用 |
| 终止条件 | 拿到最终答案 / 步数耗尽 / LLM 不再要求调函数 |
| 错误处理 | 中间任一步失败要能恢复或退出 |
| 上下文累积 | 把中间结果加入对话历史，让 LLM 知道现状 |

## 四、状态管理示意

\`\`\`
step 1: get_user(1)         → {user_id:1, latest_order_id:100}
step 2: get_order(100)      → {order_id:100, status:"已发货", shipping_id:"S7"}
step 3: get_shipping("S7")  → {status:"运输中", location:"上海中转站"}
最终答案：用户 1 的最新订单已发货，物流在上海中转站
\`\`\`

每一步的输出都喂给下一步作为输入。

## 五、终止条件设计

\`\`\`
循环开始：
  LLM 决策 → 调函数 → 拿结果 → 加入历史
  │
  ├─ LLM 说"已有最终答案" → 退出，返回
  ├─ 步数 > max_steps    → 退出，报"步数耗尽"
  └─ LLM 不再调函数      → 退出，返回最后回复
\`\`\`

> 一句话总结：多轮调用 = 循环（决策 → 执行 → 反馈），直到任务完成或步数耗尽。`,
    code: `# 多轮工具调用：查数据库演示
# 模拟一个客服 Agent：查用户 → 查订单 → 查物流
# 演示链式调用、状态管理、终止条件
# 真实场景中每一步的决策由 LLM 完成，这里用规则模拟

# ===== mock 三个数据库 =====
# 用字典模拟数据库表，方便按 ID 查找
# 真实项目应查 MySQL / PostgreSQL / Redis
users_db = {
    1: {"user_id": 1, "name": "Alice", "latest_order_id": 100},
    2: {"user_id": 2, "name": "Bob", "latest_order_id": 200},
}

orders_db = {
    100: {"order_id": 100, "user_id": 1, "product": "手机",
          "shipping_id": "S7", "status": "已发货"},
    200: {"order_id": 200, "user_id": 2, "product": "耳机",
          "shipping_id": "S8", "status": "已签收"},
}

shipping_db = {
    "S7": {"shipping_id": "S7", "carrier": "顺丰",
           "location": "上海中转站", "eta": "明天送达"},
    "S8": {"shipping_id": "S8", "carrier": "京东",
           "location": "已签收", "eta": "已完成"},
}

# ===== 定义 3 个工具函数 =====
# 工具 1：根据 user_id 查用户
def get_user(user_id: int) -> dict:
    """查询用户信息"""
    user = users_db.get(user_id)
    if user:
        # 返回简化的用户信息
        return {"user_id": user["user_id"], "name": user["name"],
                "latest_order_id": user["latest_order_id"]}
    return {"error": f"用户 {user_id} 不存在"}

# 工具 2：根据 order_id 查订单
def get_order(order_id: int) -> dict:
    """查询订单详情"""
    order = orders_db.get(order_id)
    if order:
        return {"order_id": order["order_id"], "product": order["product"],
                "shipping_id": order["shipping_id"],
                "status": order["status"]}
    return {"error": f"订单 {order_id} 不存在"}

# 工具 3：根据 shipping_id 查物流
def get_shipping(shipping_id: str) -> dict:
    """查询物流信息"""
    shipping = shipping_db.get(shipping_id)
    if shipping:
        return {"shipping_id": shipping["shipping_id"],
                "carrier": shipping["carrier"],
                "location": shipping["location"], "eta": shipping["eta"]}
    return {"error": f"物流单 {shipping_id} 不存在"}


# ===== MultiStepAgent：多步调用 Agent =====
# 核心能力：循环调用工具，前一步结果作为后一步输入
class MultiStepAgent:
    """多步工具调用 Agent"""

    def __init__(self, max_steps: int = 5):
        # max_steps 限制最大调用步数，防止死循环
        self.max_steps = max_steps
        # state 记录中间状态，避免重复调用同一函数
        self.state = {}

    # 决策函数：根据当前状态决定下一步调哪个工具
    # 用规则模拟 LLM 的决策逻辑
    def _decide_next(self, question: str) -> dict:
        """根据当前 state 决定下一步调什么工具"""
        # 阶段 1：还没查用户 → 先查用户
        if "user" not in self.state:
            # 从问题里提取 user_id（实际由 LLM 完成）
            # 简化：固定查 user_id=1
            return {"name": "get_user", "arguments": {"user_id": 1}}

        # 阶段 2：已查用户，但没查订单 → 查最新订单
        if "user" in self.state and "order" not in self.state:
            order_id = self.state["user"]["latest_order_id"]
            return {"name": "get_order", "arguments": {"order_id": order_id}}

        # 阶段 3：已查订单，但没查物流 → 查物流
        if "order" in self.state and "shipping" not in self.state:
            sid = self.state["order"]["shipping_id"]
            return {"name": "get_shipping", "arguments": {"shipping_id": sid}}

        # 阶段 4：所有信息都齐了 → 任务完成
        return None  # 返回 None 表示无需再调

    # 工具执行：按 name 查找对应函数并调用
    def _execute(self, fc: dict) -> dict:
        """执行工具调用"""
        # 工具名 → 函数的映射表
        tool_map = {
            "get_user": get_user,
            "get_order": get_order,
            "get_shipping": get_shipping,
        }
        func = tool_map[fc["name"]]
        # **arguments 把字典展开成关键字参数
        return func(**fc["arguments"])

    # 主流程：处理用户问题
    def run(self, question: str) -> str:
        """循环调用工具直到拿到最终答案"""
        print(f"用户问题: {question}")
        print(f"最大步数: {self.max_steps}")
        print()

        # 循环：决策 → 执行 → 记录状态
        for step in range(1, self.max_steps + 1):
            print(f"--- 第 {step} 步 ---")
            # 1. 决策
            fc = self._decide_next(question)
            if fc is None:
                # 没有下一步可调，说明任务完成
                print("  [决策] 所有信息已齐全，结束循环")
                break

            # 2. 执行
            print(f"  [调用] {fc['name']}({fc['arguments']})")
            result = self._execute(fc)
            print(f"  [结果] {result}")

            # 3. 记录状态
            # 用工具名作为状态 key，避免重复调用
            state_key = fc["name"].replace("get_", "")  # get_user → user
            self.state[state_key] = result

        else:
            # for 循环正常走完没 break，说明步数耗尽
            print("  ⚠️ 步数耗尽，强制终止")
            return "抱歉，未能完成任务"

        # 生成最终汇总
        return self._summarize()

    # 汇总最终答案
    def _summarize(self) -> str:
        """把所有中间结果汇总成自然语言"""
        u = self.state.get("user", {})
        o = self.state.get("order", {})
        s = self.state.get("shipping", {})
        # 拼接一段人话
        msg = (f"用户 {u.get('name', '?')} (ID={u.get('user_id', '?')}) "
               f"的最新订单是 {o.get('product', '?')} "
               f"(订单号 {o.get('order_id', '?')})，"
               f"状态：{o.get('status', '?')}。"
               f"物流：{s.get('carrier', '?')}，"
               f"当前位置：{s.get('location', '?')}，"
               f"预计：{s.get('eta', '?')}")
        return msg


# ===== 演示 =====
print("=== 多轮工具调用：查用户的订单物流 ===")
agent = MultiStepAgent(max_steps=5)
final = agent.run("查 user_id=1 的用户的最新订单物流")

print()
print("=== 最终答案 ===")
print(final)

print()
print("=== Agent 内部状态 ===")
# 打印 state，展示中间结果如何累积
import json
print(json.dumps(agent.state, ensure_ascii=False, indent=2))

print()
print("✅ 三步链式调用完成：get_user → get_order → get_shipping")
# 关键点：
# 1. 状态管理：state 记录中间结果
# 2. 终止条件：拿到所有信息后退出
# 3. 步数限制：max_steps 防死循环
`,
  },

  // ============================================================
  // 第 12 章：错误处理与重试
  // ============================================================
  {
    id: "as-fc-error",
    group: "Function Calling 实战",
    icon: "🛡️",
    title: "错误处理与重试",
    content: `# 错误处理与重试

## 一、工具调用可能失败

工具不是 100% 可靠，常见失败原因：

| 错误类型 | 例子 | 处理建议 |
|---|---|---|
| 网络错误 | API 超时、连接拒绝 | 重试 |
| 参数错误 | 类型不对、缺字段 | 不重试，直接报错 |
| 业务错误 | "用户不存在" | 看场景，可降级 |
| 超时 | 调用 30 秒还没返回 | 重试或降级 |

## 二、三种错误处理策略

### 1. 重试（Retry）

失败了就再试一次，最多 N 次。

\`\`\`
调用 → 失败 → 等 1 秒 → 再调 → 失败 → 等 2 秒 → 再调 → 成功 ✅
\`\`\`

### 2. 降级（Fallback）

主工具失败，换备用方案。

\`\`\`
主推荐系统挂了 → 降级到"热门推荐"
主支付通道挂了 → 降级到"备用通道"
\`\`\`

### 3. 报错给用户

实在不行就老实告诉用户："系统繁忙，请稍后重试"。

> 千万别让 Agent 卡死或返回乱七八糟的内容。

## 三、指数退避（Exponential Backoff）

重试时**不要立刻重试**——可能服务器还在过载。每次失败后等更久：

\`\`\`
第 1 次失败 → 等 1 秒
第 2 次失败 → 等 2 秒
第 3 次失败 → 等 4 秒
第 4 次失败 → 放弃
\`\`\`

公式：\`delay = base_delay * (2 ** retry_count)\`

> 类比：电梯故障按按钮，按一次没用就等等再按，越等越久。这能给服务器喘息时间。

## 四、超时控制

调用工具前设定超时，避免 Agent 卡死：

\`\`\`python
import signal
def call_with_timeout(func, args, timeout=5):
    # 5 秒没返回就抛 TimeoutError
    ...
\`\`\`

> 真实场景用 \`asyncio.wait_for\` 或 \`concurrent.futures\` 控制超时。

## 五、类比：外卖 App 下单失败

\`\`\`
你点"下单" → 失败
   ↓
App 自动重试 1 次（指数退避）
   ↓
还失败 → 切到备用支付通道（降级）
   ↓
还失败 → 弹窗"网络异常，请稍后重试"（报错给用户）
\`\`\`

Agent 的工具调用错误处理逻辑完全一样。

> 一句话总结：错误处理 = 重试 + 退避 + 降级 + 报错，让 Agent 在异常情况下也能优雅退出。`,
    code: `# 错误处理与重试演示
# 实现：随机失败的工具 + 指数退避重试 + 自动恢复的 Agent
# 核心思想：工具会失败，Agent 要能自动恢复或优雅退出

import random  # random 用于模拟随机失败
import time    # time 用于 sleep 实现退避延迟

# ===== flaky_tool：模拟不稳定的工具 =====
# flaky = "不稳定的"，指会随机失败的工具
# 用 random 控制成功率，模拟真实 API 偶发故障
def flaky_tool(x: int, success_rate: float = 0.4) -> int:
    """一个会随机失败的工具（模拟网络抖动）"""
    # random.random() 返回 [0, 1) 的随机数
    # 小于 success_rate 才成功，否则抛异常
    if random.random() < success_rate:
        return x * 2  # 成功：返回 x 的两倍
    # 失败：模拟网络错误
    raise ConnectionError("网络错误：连接超时")


# ===== retry_tool：带指数退避的重试函数 =====
# 任何工具失败都通过这个函数重试
# 参数说明：
#   tool: callable —— 要调用的工具函数
#   args: dict —— 工具参数（关键字参数）
#   max_retries: int —— 最大重试次数（不含首次）
#   delay: float —— 初始延迟（秒），每次失败翻倍
# 返回值：工具的返回值
# 抛出：所有重试都失败后抛最后一个异常
def retry_tool(tool, args: dict, max_retries: int = 3,
               delay: float = 0.1) -> tuple:
    """带指数退避的重试机制
    返回 (result, attempts) —— 结果和实际尝试次数
    """
    last_error = None  # 记录最后一次错误
    # 总尝试次数 = 首次 + max_retries 次重试
    for attempt in range(1, max_retries + 2):
        # range(1, max_retries+2) 包含首次调用
        # 例如 max_retries=3 → attempt 取 1, 2, 3, 4
        try:
            # 尝试调用工具
            result = tool(**args)
            # 成功：返回结果和实际尝试次数
            return result, attempt
        except Exception as e:
            # 失败：记录错误
            last_error = e
            print(f"    第 {attempt} 次尝试失败: {e}")
            # 如果还有重试机会，就 sleep 后再试
            if attempt <= max_retries:
                # 指数退避：每次延迟翻倍
                # delay * (2 ** (attempt-1)) → 0.1, 0.2, 0.4, 0.8...
                wait = delay * (2 ** (attempt - 1))
                print(f"    等待 {wait:.2f}s 后重试...")
                time.sleep(wait)
    # 所有重试都失败，抛出最后一个异常
    raise last_error


# ===== RobustAgent：自动重试的 Agent =====
# 包装 retry_tool，让 Agent 调用工具时自动重试
class RobustAgent:
    """带错误恢复能力的 Agent"""

    def __init__(self, max_retries: int = 3):
        # max_retries 是每个工具的最大重试次数
        self.max_retries = max_retries
        # 统计：累计调用次数和成功次数
        self.call_count = 0
        self.success_count = 0

    def call_tool(self, tool, args: dict) -> dict:
        """调用工具，自动重试"""
        self.call_count += 1
        print(f"  Agent 调用 {tool.__name__}({args})")
        try:
            # 用 retry_tool 包装调用
            result, attempts = retry_tool(
                tool, args, max_retries=self.max_retries
            )
            # 成功
            self.success_count += 1
            print(f"  ✅ 成功 (尝试 {attempts} 次): {result}")
            return {"ok": True, "result": result, "attempts": attempts}
        except Exception as e:
            # 全部重试失败
            print(f"  ❌ 最终失败: {e}")
            return {"ok": False, "error": str(e), "attempts": self.max_retries + 1}


# ===== 测试：调用 flaky_tool 10 次，统计成功率 =====
print("=== 测试：调用 flaky_tool 10 次 ===")
# 用固定随机种子让结果可复现（演示用）
random.seed(42)

agent = RobustAgent(max_retries=3)
# 记录每次调用的尝试次数
results = []

for i in range(10):
    print(f"\\n--- 第 {i + 1} 次调用 ---")
    # 每次调用传不同的 x
    res = agent.call_tool(flaky_tool, {"x": i, "success_rate": 0.4})
    results.append(res)

# ===== 统计输出 =====
print()
print("=== 统计结果 ===")
# 成功率
total = len(results)
successes = sum(1 for r in results if r["ok"])
print(f"总调用数: {total}")
print(f"成功数: {successes}")
print(f"失败数: {total - successes}")
# 成功率 = 成功数 / 总数
print(f"成功率: {successes / total * 100:.1f}%")

# 重试次数统计
# attempts=1 表示一次就成功，没重试
attempts_list = [r.get("attempts", 0) for r in results if r["ok"]]
if attempts_list:
    avg_attempts = sum(attempts_list) / len(attempts_list)
    print(f"平均尝试次数（成功调用）: {avg_attempts:.2f}")
    print(f"最多尝试次数: {max(attempts_list)}")

# 重试效果对比
print()
print("=== 对比：有无重试的效果 ===")
# 不用重试：单次调用直接看结果
random.seed(42)  # 用同样的种子保证可比
no_retry_success = 0
for i in range(10):
    try:
        flaky_tool(i, success_rate=0.4)
        no_retry_success += 1
    except Exception:
        pass
print(f"不重试的成功率: {no_retry_success}/10 = "
      f"{no_retry_success * 10}%")
print(f"重试 3 次的成功率: {successes}/10 = "
      f"{successes * 10}%")
# 重试显著提升成功率
print()
print("✅ 指数退避重试能显著提升工具调用成功率")
# 总结：
# 1. 工具会失败 → Agent 必须能重试
# 2. 指数退避 → 避免雪崩
# 3. 重试次数有上限 → 防死循环
# 4. 全部失败 → 优雅降级或报错
`,
  },
];
