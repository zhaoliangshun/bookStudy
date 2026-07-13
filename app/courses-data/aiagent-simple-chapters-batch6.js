// =============================================================
// AI 智能体开发入门教程 —— 第 6 批（实战项目 3 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：as-（aiagent-simple）
// 分组：实战项目
// =============================================================

export const chapters = [
  // ============================================================
  // 第 19 章：实战：智能客服 Agent
  // ============================================================
  {
    id: "as-practice-cs",
    group: "实战项目",
    icon: "🎧",
    title: "实战：智能客服 Agent",
    content: `# 实战：智能客服 Agent

## 一、需求分析

智能客服是 Agent 最经典的应用场景之一。我们要做的客服 Agent 要能：

1. **自动回复常见问题**：用户问"怎么退货"，Agent 直接给答案
2. **调用工具处理业务**：用户问"查询订单 12345"，调用订单查询工具
3. **复杂问题转人工**：超出能力范围时，转给真人客服

> 类比：客服 Agent 像一个前台，简单问题自己答，办不了的事呼叫后台同事。

## 二、架构设计

完整流程由四个阶段组成：

\`\`\`
用户消息
   │
   ↓
[1. 意图识别]  ← 关键词匹配
   │
   ↓
[2. 检索知识库] ← 查 FAQ
   │
   ├── 找到答案 → [3. 生成回复] → 回答用户
   │
   └── 没找到   → [4. 满意度判断] → 转人工
\`\`\`

## 三、知识库设计

知识库用最简单的 **FAQ 问答对**（key 是问题关键词，value 是答案）：

\`\`\`python
knowledge_base = {
    "退货": "登录账户 → 我的订单 → 选择订单 → 点击退货...",
    "退款": "退款会在 3-5 个工作日原路退回...",
    ...
}
\`\`\`

实际项目中可以用向量检索（RAG），这里简化演示。

## 四、转人工条件

什么情况必须转人工？三个条件任一满足：

| 条件 | 示例 |
|---|---|
| 连续失败 | 用户连续 2 次对回复不满意 |
| 用户主动要求 | "我要人工"、"转人工"、"找客服" |
| 敏感问题 | 投诉、纠纷、大额赔付等 |

## 五、完整流程图

\`\`\`
┌─────────────┐
│ 用户发消息  │
└──────┬──────┘
       ↓
┌──────────────────┐
│ 1. 意图识别       │ ← 关键词匹配（退货/查询/投诉/转人工）
└──────┬───────────┘
       ↓
┌──────────────────┐
│ 2. 检索知识库     │ ← 字符串匹配 FAQ
└──────┬───────────┘
       ↓
   找到答案？
   ├── 是 → 回答用户 → 判断是否满意 → 不满意累计 → 转人工
   └── 否 → 查订单？ → 调用工具 → 回答
                                ↓
                          否则转人工
\`\`\`

## 六、关键设计点

1. **意图识别用关键词**：够简单、够快，覆盖 80% 场景
2. **工具调用要记录**：方便后续审计和工单跟进
3. **转人工要平滑**：把对话历史也带给人工客服，避免用户重复描述
4. **失败次数要重置**：用户满意后清零，避免误判`,
    code: `# 智能客服 Agent 实战
# 实现一个能自动回答 FAQ、调用工具、必要时转人工的客服 Agent
# 核心流程：意图识别 → 检索知识库 → 生成回复 → 满意度判断

import re  # re 模块：用于正则提取订单号等结构化信息


# ===== 客服 Agent 类 =====
# 把客服能力封装成一个类，方便管理状态和工具
class CustomerServiceAgent:
    """智能客服 Agent：自动回复 + 工具调用 + 转人工"""

    def __init__(self):
        # 知识库：FAQ 问答对，key 是关键词，value 是标准答案
        # 实际项目用向量库做语义检索，这里用字典简化演示
        self.knowledge_base = {
            "退货": "登录账户 → 我的订单 → 选择订单 → 点击'申请退货' → 填写原因 → 等待审核",
            "退款": "退款会在 3-5 个工作日原路退回，可在'我的钱包'查看进度",
            "运费": "订单满 99 元包邮，未满 99 元收取 8 元运费",
            "发货": "下单后 24 小时内发货，一般 3 天内送达",
            "发票": "下单时备注发票抬头，电子发票会在发货后 1 小时内发送至邮箱",
            "修改地址": "订单未发货前可在'我的订单'修改收货地址，发货后无法修改",
            "优惠券": "优惠券在'我的优惠券'查看，下单时勾选使用，过期自动失效",
            "会员": "会员分普通/银卡/金卡三级，消费累计升级，享不同折扣",
            "售后": "售后问题请进入'我的订单 → 售后服务'提交申请",
            "登录": "忘记密码可点击'忘记密码'通过手机号重置",
        }

        # 失败计数器：连续不满意次数，达到阈值就转人工
        self.fail_count = 0
        # 转人工阈值：连续 2 次不满意就转人工
        self.max_fail = 2
        # 工单列表：记录所有转人工的工单，方便后续跟进
        self.tickets = []

    # ===== 工具：查询订单 =====
    # 参数说明：
    #   order_id: str —— 订单号
    # 返回值：str —— 订单状态描述
    def tool_query_order(self, order_id: str) -> str:
        """查询订单状态（mock）"""
        # 实际项目应查数据库，这里用 mock 数据
        mock_orders = {
            "12345": {"status": "已发货", "logistics": "顺丰 SF1234567890"},
            "67890": {"status": "待付款", "logistics": "—"},
        }
        order = mock_orders.get(order_id)
        if order:
            return f"订单 {order_id}：{order['status']}，物流单号 {order['logistics']}"
        return f"订单 {order_id} 不存在，请确认订单号"

    # ===== 工具：转人工 =====
    # 参数说明：
    #   reason: str —— 转人工原因
    #   history: list —— 对话历史
    # 返回值：str —— 转人工提示语
    def tool_transfer_human(self, reason: str, history: list) -> str:
        """转人工客服"""
        # 生成一个工单号（用 len 简化）
        ticket_id = f"T{len(self.tickets) + 1:04d}"
        # 记录工单，便于人工客服跟进
        self.tickets.append({
            "ticket_id": ticket_id,
            "reason": reason,
            "history": history,
        })
        return f"[已转人工] 工单号 {ticket_id}，原因：{reason}，请稍候..."

    # ===== 核心：处理用户消息 =====
    # 参数说明：
    #   message: str —— 用户发送的消息
    # 返回值：str —— Agent 的回复
    def handle_message(self, message: str) -> str:
        """处理用户消息的完整流程"""
        print(f"\\n👤 用户：{message}")

        # ----- 步骤 1：意图识别（关键词匹配）-----
        print("  [步骤 1] 意图识别...")
        # 用户主动要求转人工：检查关键词
        if any(kw in message for kw in ["转人工", "人工客服", "找客服", "真人"]):
            print("  → 意图：转人工")
            # 重置失败计数（用户主动转人工不算失败）
            self.fail_count = 0
            return self.tool_transfer_human("用户主动要求人工", [message])

        # 识别"投诉"等敏感问题 → 直接转人工
        if any(kw in message for kw in ["投诉", "报警", "起诉", "曝光"]):
            print("  → 意图：敏感问题，转人工")
            return self.tool_transfer_human(f"敏感问题：{message}", [message])

        # 识别订单查询意图：用正则提取订单号
        # 正则 \\d+ 匹配连续数字
        if "订单" in message or "查询" in message:
            match = re.search(r"\\d+", message)
            if match:
                order_id = match.group()
                print(f"  → 意图：查询订单 {order_id}")
                # 调用工具
                result = self.tool_query_order(order_id)
                print(f"  [调用工具] query_order({order_id})")
                return result

        # ----- 步骤 2：检索 FAQ -----
        print("  [步骤 2] 检索知识库...")
        # 遍历 FAQ，看用户消息是否包含某个关键词
        for keyword, answer in self.knowledge_base.items():
            if keyword in message:
                print(f"  → 命中 FAQ：{keyword}")
                # 找到答案，重置失败计数
                self.fail_count = 0
                return f"您好！{answer}"

        # ----- 步骤 3：找不到答案，转人工 -----
        print("  → 未找到 FAQ，转人工")
        # 累计失败次数
        self.fail_count += 1
        print(f"  [失败计数] {self.fail_count}/{self.max_fail}")
        return self.tool_transfer_human("知识库未覆盖的问题", [message])


# ===== 测试 =====
print("=" * 50)
print("智能客服 Agent 测试")
print("=" * 50)

# 创建客服 Agent 实例
agent = CustomerServiceAgent()

# 测试 1：FAQ 命中
print("\\n--- 测试 1：FAQ 命中 ---")
reply = agent.handle_message("退货怎么操作")
print(f"🤖 客服：{reply}")

# 测试 2：调用工具查询订单
print("\\n--- 测试 2：调用工具查询订单 ---")
reply = agent.handle_message("查询订单 12345")
print(f"🤖 客服：{reply}")

# 测试 3：用户投诉 → 转人工
print("\\n--- 测试 3：用户投诉转人工 ---")
reply = agent.handle_message("我要投诉你们的服务态度")
print(f"🤖 客服：{reply}")

# 测试 4：查不到答案 → 转人工
print("\\n--- 测试 4：未覆盖问题转人工 ---")
reply = agent.handle_message("请问你们公司在哪上市")
print(f"🤖 客服：{reply}")

# 测试 5：用户主动要求转人工
print("\\n--- 测试 5：用户主动要求转人工 ---")
reply = agent.handle_message("麻烦转人工")
print(f"🤖 客服：{reply}")

# 打印工单汇总
print("\\n" + "=" * 50)
print(f"本次共生成 {len(agent.tickets)} 个工单：")
for t in agent.tickets:
    print(f"  - {t['ticket_id']}：{t['reason']}")
`,
  },

  // ============================================================
  // 第 20 章：实战：自动写作 Agent
  // ============================================================
  {
    id: "as-practice-write",
    group: "实战项目",
    icon: "✍️",
    title: "实战：自动写作 Agent",
    content: `# 实战：自动写作 Agent

## 一、需求

写一篇关于指定主题的文章。Agent 要能：

1. **自主拆解任务**：把"写文章"拆成多个子步骤
2. **多步协作执行**：每步产出作为下一步输入
3. **质量自检**：每步检查，不合格就重做

> 类比：传统模板生成像填表，Agent 写作像有思路的写手——先调研、列提纲、写初稿、再润色。

## 二、写作流程

\`\`\`
主题输入
   │
   ↓
[1. research] 检索素材  ← 从 mock 数据库查相关资料
   │
   ↓
[2. outline]  生成大纲  ← 按素材组织结构
   │
   ↓
[3. draft]    写正文    ← 按大纲展开
   │
   ↓
[4. polish]   润色      ← 调整措辞、补充过渡
   │
   ↓
最终文章
\`\`\`

## 三、多步骤协作

这是前面章节学的 **Plan + Execute 模式**的应用：

| 阶段 | 输入 | 输出 |
|---|---|---|
| research | topic | materials（素材列表） |
| outline | topic + materials | outline（大纲结构） |
| draft | outline | draft（初稿） |
| polish | draft | final（最终稿） |

每一步都是独立函数，便于复用和测试。

## 四、质量控制

每个步骤都做简单检查：

- **research**：素材数量 ≥ 3 条
- **outline**：至少 3 个章节
- **draft**：每个章节都有内容
- **polish**：最终字数 ≥ 初稿字数（润色会扩充）

不合格时重新执行（这里 mock 数据稳定，主要演示思路）。

## 五、与传统模板生成的区别

| 维度 | 模板生成 | Agent 写作 |
|---|---|---|
| 流程 | 一次性填充 | 多步骤迭代 |
| 灵活性 | 固定结构 | 按主题动态调整 |
| 创意 | 无 | 有（mock 模拟创意） |
| 质量控制 | 无 | 每步检查 |
| 可解释性 | 黑盒 | 步骤清晰 |

## 六、扩展思路

- 把 mock 换成真实 LLM 调用
- research 接入搜索引擎或 RAG
- polish 加多轮迭代直到评分达标
- 多 Agent 协作：一个写作，一个审稿`,
    code: `# 自动写作 Agent 实战
# 实现 research → outline → draft → polish 四步写作流程
# 用任务分解 + 多步执行模式，每步都打印输出

import random  # random 模块：mock 数据时随机选择，模拟"创意"


# ===== 写作 Agent 类 =====
# 用任务分解模式：把"写文章"拆成 4 个子任务，依次执行
class WritingAgent:
    """自动写作 Agent：素材检索 → 大纲 → 初稿 → 润色"""

    def __init__(self):
        # mock 素材数据库：key 是主题，value 是该主题的素材列表
        # 实际项目应接 RAG 或搜索引擎
        self.material_db = {
            "Python 异步编程": [
                "asyncio 是 Python 3.4+ 引入的异步 IO 库",
                "async/await 是协程的核心语法，让异步代码看起来像同步",
                "事件循环（event loop）是异步任务的调度中心",
                "协程比线程轻量，单线程可跑成千上万个协程",
                "适合 IO 密集型任务：网络请求、数据库、文件读写",
                "aiohttp、httpx 是常用的异步 HTTP 客户端",
            ],
        }
        # 大纲模板：按"是什么→为什么→怎么做→实践"组织
        self.outline_template = [
            "一、什么是{topic}",
            "二、为什么需要{topic}",
            "三、{topic} 的核心概念",
            "四、{topic} 实战示例",
            "五、总结与最佳实践",
        ]

    # ===== 步骤 1：检索素材 =====
    # 参数说明：
    #   topic: str —— 文章主题
    # 返回值：list —— 素材字符串列表
    def research(self, topic: str) -> list:
        """从 mock 数据库检索相关素材"""
        print("\\n📖 [步骤 1] 检索素材...")
        # 从素材库查找（找不到则用通用素材）
        materials = self.material_db.get(topic, [f"关于 {topic} 的通用素材"])
        # 质量检查：素材数量 ≥ 3 条
        if len(materials) < 3:
            print("  ⚠️ 素材不足 3 条，补充通用素材")
            materials.append(f"{topic} 是一个重要的话题")
        # 打印检索到的素材
        for i, m in enumerate(materials, 1):
            print(f"  [{i}] {m}")
        return materials

    # ===== 步骤 2：生成大纲 =====
    # 参数说明：
    #   topic: str —— 文章主题
    #   materials: list —— 步骤 1 的素材
    # 返回值：list —— 大纲条目列表
    def outline(self, topic: str, materials: list) -> list:
        """根据素材生成大纲"""
        print("\\n📋 [步骤 2] 生成大纲...")
        # 用模板填充主题
        outline_items = [item.format(topic=topic) for item in self.outline_template]
        # 质量检查：至少 3 个章节
        if len(outline_items) < 3:
            print("  ⚠️ 大纲不足 3 节，补充章节")
            outline_items.append(f"六、{topic} 进阶话题")
        # 打印大纲
        for item in outline_items:
            print(f"  {item}")
        return outline_items

    # ===== 步骤 3：写正文 =====
    # 参数说明：
    #   outline_items: list —— 大纲条目
    # 返回值：str —— 初稿全文
    def draft(self, outline_items: list) -> str:
        """按大纲写正文"""
        print("\\n✍️ [步骤 3] 撰写初稿...")
        paragraphs = []
        for section in outline_items:
            # 模拟写作：用 mock 文本填充每一段
            # 实际项目应调用 LLM 生成
            body = f"本节将详细讲解{section[2:]}。"
            body += "在 Python 中，这涉及到底层 IO 模型与协程调度机制。"
            body += "通过合理设计，可以显著提升程序性能。"
            paragraphs.append(f"{section}\\n\\n{body}")
            print(f"  ✓ 完成：{section}")
        # 拼接全文
        full_draft = "\\n\\n".join(paragraphs)
        return full_draft

    # ===== 步骤 4：润色 =====
    # 参数说明：
    #   draft_text: str —— 初稿全文
    # 返回值：str —— 润色后的最终稿
    def polish(self, draft_text: str) -> str:
        """润色初稿"""
        print("\\n🎨 [步骤 4] 润色...")
        # 模拟润色：在每段开头加一句导语，结尾加总结
        polished = []
        for para in draft_text.split("\\n\\n"):
            # 在每段开头加引导语
            if para.startswith("一、"):
                polished.append(para + "\\n\\n（导语）" + para[:6] + "是本文的起点...")
            elif para.startswith("五、"):
                polished.append(para + "\\n\\n（总结）综上所述，掌握以上要点即可上手。")
            else:
                polished.append(para)
        # 质量检查：润色后字数应大于初稿
        final = "\\n\\n".join(polished)
        print(f"  初稿字数：{len(draft_text)} → 终稿字数：{len(final)}")
        return final

    # ===== 主流程：写作一篇文章 =====
    # 参数说明：
    #   topic: str —— 文章主题
    # 返回值：str —— 最终文章
    def write_article(self, topic: str) -> str:
        """完整写作流程：依次调用四个步骤"""
        print("=" * 50)
        print(f"📝 开始写作：{topic}")
        print("=" * 50)
        # 依次执行四步：上一步的输出是下一步的输入
        materials = self.research(topic)
        outline_items = self.outline(topic, materials)
        draft_text = self.draft(outline_items)
        final = self.polish(draft_text)
        print("\\n✅ 写作完成！")
        return final


# ===== 测试 =====
# 创建写作 Agent
agent = WritingAgent()

# 测试：写一篇"Python 异步编程"的文章
final_article = agent.write_article("Python 异步编程")

# 打印最终文章
print("\\n" + "=" * 50)
print("📄 最终文章")
print("=" * 50)
print(final_article)
`,
  },

  // ============================================================
  // 第 21 章：实战：数据分析 Agent
  // ============================================================
  {
    id: "as-practice-data",
    group: "实战项目",
    icon: "📊",
    title: "实战：数据分析 Agent",
    content: `# 实战：数据分析 Agent

## 一、需求

让用户用**自然语言**查询数据，Agent 自动生成 SQL、执行、分析、出报告。

例如用户问"哪个月销量最高"，Agent 要：

1. 理解问题意图
2. 生成对应的查询逻辑
3. 执行查询拿到数据
4. 计算统计值
5. 用自然语言生成报告

> 类比：传统 BI 需要用户自己写 SQL、看图表、写结论；Agent 把这串流程全自动化。

## 二、架构设计

\`\`\`
自然语言问题
   │
   ↓
[1. 理解问题]  ← 关键词匹配（最高/最低/总和/趋势）
   │
   ↓
[2. 生成查询]  ← mock SQL → query_data 工具
   │
   ↓
[3. 执行查询]  ← 在 mock 数据库上跑
   │
   ↓
[4. 计算统计]  ← 调 calculate 工具
   │
   ↓
[5. 生成报告]  ← 用模板把数据转成自然语言
\`\`\`

## 三、Text-to-SQL 概念

**Text-to-SQL** 是把自然语言转成 SQL 的技术：

| 自然语言 | SQL |
|---|---|
| 哪个月销量最高 | \`SELECT month, SUM(sales) GROUP BY month ORDER BY ... LIMIT 1\` |
| 产品 A 总销量 | \`SELECT SUM(sales) WHERE product='A'\` |

实际项目用 LLM 实现，本 demo 用关键词匹配简化。

## 四、数据可视化（文字模拟）

真正项目会生成折线图、柱状图。这里用 ASCII 文字模拟：

\`\`\`
销量趋势：
1月 ████      100
2月 ██████    150
3月 ████████  200
\`\`\`

## 五、安全：SQL 注入防护

Text-to-SQL 必须防 SQL 注入：

1. **参数化查询**：用户输入只作为参数，不拼接到 SQL
2. **白名单表/字段**：只允许查询指定表
3. **只读权限**：数据库账号只给 SELECT 权限
4. **SQL 预检查**：执行前检查是否含危险关键字（DROP、DELETE）

本 demo 用 mock 查询，不直接执行 SQL，从根本上避免注入。

## 六、扩展思路

- mock SQL → 真实 SQLite/PostgreSQL
- 关键词匹配 → LLM 生成 SQL
- 文字图表 → matplotlib 生成图片
- 报告模板 → LLM 自由生成`,
    code: `# 数据分析 Agent 实战
# 实现"自然语言提问 → 查询 → 统计 → 报告"的完整流程
# 用 mock 数据库模拟，不依赖第三方库

import re  # re 模块：用正则提取产品名、月份等


# ===== 数据分析 Agent 类 =====
class DataAnalysisAgent:
    """数据分析 Agent：自然语言查询 → 数据分析 → 报告生成"""

    def __init__(self):
        # mock 数据库：每条记录是一个产品在某月的销量
        # 实际项目用真实数据库（SQLite/PostgreSQL）
        self.sales_data = [
            {"product": "A", "month": "1月", "sales": 100},
            {"product": "A", "month": "2月", "sales": 150},
            {"product": "A", "month": "3月", "sales": 200},
            {"product": "A", "month": "4月", "sales": 180},
            {"product": "B", "month": "1月", "sales": 80},
            {"product": "B", "month": "2月", "sales": 120},
            {"product": "B", "month": "3月", "sales": 90},
            {"product": "B", "month": "4月", "sales": 110},
            {"product": "C", "month": "1月", "sales": 60},
            {"product": "C", "month": "2月", "sales": 70},
            {"product": "C", "month": "3月", "sales": 95},
            {"product": "C", "month": "4月", "sales": 130},
        ]

    # ===== 工具 1：查询数据 =====
    # 参数说明：
    #   sql_like: dict —— 模拟 SQL 的查询条件，如 {"product": "A"}
    # 返回值：list —— 匹配的数据记录列表
    def query_data(self, sql_like: dict) -> list:
        """根据条件查询数据（模拟 SQL 执行）"""
        # 遍历数据库，按条件过滤
        # 这种"应用层过滤"的方式天然防 SQL 注入
        results = []
        for row in self.sales_data:
            match = True
            for key, value in sql_like.items():
                if row.get(key) != value:
                    match = False
                    break
            if match:
                results.append(row)
        return results

    # ===== 工具 2：计算统计值 =====
    # 参数说明：
    #   data: list —— 数据记录
    #   field: str —— 要统计的字段（如 "sales"）
    #   op: str —— 统计操作（sum/avg/max/min）
    # 返回值：dict —— 统计结果
    def calculate(self, data: list, field: str, op: str) -> dict:
        """计算统计值"""
        if not data:
            return {"op": op, "value": None}
        # 提取目标字段的值列表
        values = [row[field] for row in data]
        # 根据 op 计算不同统计量
        if op == "sum":
            value = sum(values)
        elif op == "avg":
            value = sum(values) / len(values)
        elif op == "max":
            value = max(values)
        elif op == "min":
            value = min(values)
        else:
            value = None
        return {"op": op, "value": value, "count": len(values)}

    # ===== 核心：分析自然语言问题 =====
    # 参数说明：
    #   question: str —— 用户的自然语言问题
    # 返回值：str —— 分析报告
    def analyze(self, question: str) -> str:
        """完整分析流程：理解 → 查询 → 统计 → 报告"""
        print(f"\\n❓ 问题：{question}")
        report_lines = [f"问题：{question}"]

        # ----- 步骤 1：理解问题（关键词匹配）-----
        print("  [步骤 1] 理解问题...")
        # 判断是"销量最高"类问题
        if "最高" in question or "最多" in question:
            print("  → 意图：找最大值")
            # 按月份分组求总销量
            months = set(row["month"] for row in self.sales_data)
            month_sums = {}
            for m in months:
                # 调用 query_data 工具查询该月所有数据
                month_data = self.query_data({"month": m})
                # 调用 calculate 工具求和
                stat = self.calculate(month_data, "sales", "sum")
                month_sums[m] = stat["value"]
                print(f"  [查询] {m} 总销量 = {stat['value']}")
            # 找出销量最高的月份
            best_month = max(month_sums, key=month_sums.get)
            best_value = month_sums[best_month]
            # 生成报告
            report_lines.append(f"分析：按月汇总销量后，{best_month} 销量最高")
            report_lines.append(f"数据：{month_sums}")
            report_lines.append(f"结论：{best_month} 销量最高，达 {best_value} 件")

        # 判断是"总销量"类问题
        elif "总销量" in question or "总和" in question:
            print("  → 意图：求总和")
            # 提取产品名（A/B/C）
            match = re.search(r"产品\\s*([A-Z])", question)
            if match:
                product = match.group(1)
                print(f"  → 目标产品：{product}")
                # 调用 query_data 工具查询该产品数据
                product_data = self.query_data({"product": product})
                # 调用 calculate 工具求和
                stat = self.calculate(product_data, "sales", "sum")
                print(f"  [查询] 产品 {product} 共 {stat['count']} 条记录")
                print(f"  [统计] 总销量 = {stat['value']}")
                report_lines.append(f"分析：产品 {product} 共 {stat['count']} 个月数据")
                report_lines.append(f"数据：{[r['sales'] for r in product_data]}")
                report_lines.append(f"结论：产品 {product} 总销量 = {stat['value']} 件")
            else:
                # 没指定产品 → 计算全部
                all_data = self.query_data({})
                stat = self.calculate(all_data, "sales", "sum")
                report_lines.append(f"结论：全部产品总销量 = {stat['value']} 件")

        # 判断是"趋势"类问题
        elif "趋势" in question:
            print("  → 意图：分析趋势")
            # 按月汇总
            months = sorted(set(row["month"] for row in self.sales_data),
                            key=lambda x: int(x.replace("月", "")))
            month_sums = []
            for m in months:
                month_data = self.query_data({"month": m})
                stat = self.calculate(month_data, "sales", "sum")
                month_sums.append((m, stat["value"]))
                print(f"  [查询] {m} 总销量 = {stat['value']}")
            # 判断趋势走向
            values = [v for _, v in month_sums]
            if values[-1] > values[0]:
                trend = "上升"
            elif values[-1] < values[0]:
                trend = "下降"
            else:
                trend = "持平"
            # 文字可视化
            max_val = max(values)
            report_lines.append("分析：按月汇总销量，绘制趋势图")
            chart_lines = []
            for m, v in month_sums:
                bar_len = int(v / max_val * 20)
                chart_lines.append(f"  {m} {'█' * bar_len} {v}")
            report_lines.append("趋势图：\\n" + "\\n".join(chart_lines))
            report_lines.append(f"结论：销量整体呈{trend}趋势")

        else:
            report_lines.append("暂未识别该问题类型")

        # 返回完整报告
        return "\\n".join(report_lines)


# ===== 测试 =====
print("=" * 50)
print("数据分析 Agent 测试")
print("=" * 50)

# 创建 Agent 实例
agent = DataAnalysisAgent()

# 测试 1：哪个月销量最高
print("\\n--- 测试 1：哪个月销量最高 ---")
report1 = agent.analyze("哪个月销量最高")
print(f"\\n📊 报告：\\n{report1}")

# 测试 2：产品 A 的总销量
print("\\n--- 测试 2：产品 A 的总销量 ---")
report2 = agent.analyze("产品 A 的总销量")
print(f"\\n📊 报告：\\n{report2}")

# 测试 3：销量趋势如何
print("\\n--- 测试 3：销量趋势如何 ---")
report3 = agent.analyze("销量趋势如何")
print(f"\\n📊 报告：\\n{report3}")

# 打印本次分析的小结
print("\\n" + "=" * 50)
print("✅ 完成 3 个问题的分析")
print("=" * 50)
`,
  },
];
