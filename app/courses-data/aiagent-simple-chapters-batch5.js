// =============================================================
// AI 智能体开发入门教程 —— 第 5 批（Agent 编排与协作 3 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：as-（aiagent-simple）
// 分组：Agent 编排与协作
// =============================================================

export const chapters = [
  // ============================================================
  // 第 16 章：任务分解
  // ============================================================
  {
    id: "as-decompose",
    group: "Agent 编排与协作",
    icon: "🧩",
    title: "任务分解：拆大任务为小任务",
    content: `# 任务分解：拆大任务为小任务

## 一、为什么需要任务分解

复杂任务 LLM 一次做不好——上下文长、步骤多、容易跑偏。把大任务拆成多个小任务，每个小任务交给一次 LLM 调用，效果会显著提升。

> 类比：让一个人一口气盖一栋房子，他做不好。但拆成「设计 → 地基 → 主体 → 装修」，每步专注一件事，就能做好。

## 二、分解原则

好的子任务应满足三点：

| 原则 | 含义 |
|---|---|
| **独立** | 子任务之间尽量不互相依赖，能并行或顺序执行 |
| **可验证** | 每个子任务有明确的「完成标准」，能判断对错 |
| **可组合** | 子任务的结果能拼成最终答案 |

## 三、盖房子类比

\`\`\`
盖房子
├── 设计（图纸）
├── 地基（钢筋水泥）
├── 主体（砌墙封顶）
└── 装修（水电油漆）
\`\`\`

每一步都是独立工种，可验收，前后能拼接。

## 四、Plan-and-Execute 模式

经典的两阶段模式：

1. **Plan（规划）**：让 LLM 把大任务拆成子任务列表
2. **Execute（执行）**：逐个执行子任务，必要时还能 Replan（重新规划）

\`\`\`
用户输入 → [Planner] → 子任务列表 → [Executor] → 最终答案
\`\`\`

## 五、任务树（Task Tree）

子任务还可以再拆，形成树状结构：

\`\`\`
写文章
├── 调研主题
│   ├── 搜资料
│   └── 整理要点
├── 写大纲
├── 写正文
│   ├── 第一节
│   ├── 第二节
│   └── 第三节
└── 校对
\`\`\`

## 六、分解粒度

- **太粗**：子任务太大，LLM 一次还是做不好
- **太细**：子任务太多，调度和拼接开销大，效率低
- **合适**：每个子任务 LLM 能高质量完成，且结果容易拼接

> 经验：先按「人能做到一次做完」的粒度拆，再根据效果调整。`,
    code: `# 任务分解演示 —— 把大任务拆成可执行的子任务树
# 演示 Plan-and-Execute 模式：先规划，再递归执行
# 核心思想：复杂任务 LLM 一次做不好，拆成小任务逐个完成再拼接

# ===== 1. 任务类 =====
# Task 表示一个任务节点，可包含子任务，形成任务树
class Task:
    """任务节点：包含 id、描述、状态和子任务列表"""

    def __init__(self, task_id: str, description: str):
        # 任务唯一标识，用于打印和追踪
        self.id = task_id
        # 任务描述：告诉执行者要做什么
        self.description = description
        # 状态：pending（待执行）/ done（已完成）
        self.status = "pending"
        # 子任务列表：空表示叶子任务，非空表示还需要再分解
        self.subtasks = []

    # 添加子任务，便于链式构建任务树
    def add_subtask(self, subtask):
        self.subtasks.append(subtask)
        return subtask


# ===== 2. 任务分解器 =====
# TaskDecomposer 负责把大任务拆成子任务（Plan 阶段）
class TaskDecomposer:
    """任务分解器：调用 LLM 把大任务拆成子任务"""

    # 模拟 LLM 的规划能力
    # 真实项目里这里会调用 GPT-4 / Claude 等，输入任务描述，输出子任务列表
    # 参数说明：
    #   task_desc: str —— 大任务的描述
    # 返回值：list[str] —— 子任务描述列表
    def mock_llm_plan(self, task_desc: str) -> list:
        """模拟 LLM 规划：根据任务描述返回子任务列表"""
        # 这里用固定映射模拟 LLM 的"拆任务"能力
        # 真实场景：prompt = f"请把以下任务拆成 3-5 个子任务：{task_desc}"
        plan_map = {
            "写一篇关于 Python 的文章": [
                "调研 Python 的核心特点",  # 子任务 1：先调研
                "撰写文章大纲",            # 子任务 2：列大纲
                "根据大纲写正文",          # 子任务 3：写正文
                "校对和润色",              # 子任务 4：校对
            ],
        }
        return plan_map.get(task_desc, ["直接执行任务"])

    # 分解任务：把大任务拆成子任务节点
    # 参数说明：
    #   task: Task —— 待分解的任务
    # 返回值：Task —— 带子任务的根任务
    def decompose(self, task: Task) -> Task:
        """把大任务拆成子任务，挂到 task.subtasks"""
        # 调用 LLM（这里是 mock）拿到子任务描述列表
        sub_descs = self.mock_llm_plan(task.description)
        print(f"[分解] 任务 '{task.description}' 拆成 {len(sub_descs)} 个子任务")
        # 为每个子任务描述创建 Task 节点
        for i, desc in enumerate(sub_descs):
            sub_id = f"{task.id}.{i + 1}"  # 子任务 id 用 1.1 / 1.2 ... 的层级
            sub_task = Task(sub_id, desc)
            task.add_subtask(sub_task)
        return task


# ===== 3. 任务执行器 =====
# TaskExecutor 负责递归执行任务树（Execute 阶段）
class TaskExecutor:
    """任务执行器：递归执行任务树"""

    # 执行单个叶子任务
    # 参数说明：
    #   task: Task —— 叶子任务（没有子任务）
    def execute(self, task: Task):
        """执行单个任务（这里用 mock 输出模拟）"""
        # 真实场景：这里会调用 LLM 完成任务，比如生成大纲、写正文等
        print(f"  [执行] {task.id} {task.description} ... 完成")
        task.status = "done"  # 标记完成

    # 递归执行任务树：先执行子任务，再标记父任务完成
    # 参数说明：
    #   task: Task —— 任务树的根
    def run(self, task: Task):
        """递归执行任务树"""
        # 缩进显示层级关系，让输出更直观
        indent = "  " * task.id.count(".")
        print(f"{indent}▶ 开始任务 {task.id}: {task.description}")
        # 递归：有子任务就先执行子任务
        if task.subtasks:
            for sub in task.subtasks:
                self.run(sub)
        # 没有子任务，直接执行当前任务
        else:
            self.execute(task)
        # 父任务在所有子任务完成后才标记完成
        task.status = "done"
        print(f"{indent}✔ 完成任务 {task.id}")


# ===== 4. 测试：分解并执行一个写作任务 =====
print("=== 1. 创建大任务 ===")
# 创建根任务：写一篇关于 Python 的文章
root_task = Task("1", "写一篇关于 Python 的文章")
print(f"根任务: {root_task.id} {root_task.description}")

print()
print("=== 2. 分解任务（Plan）===")
# 实例化分解器，调用 decompose 拆任务
decomposer = TaskDecomposer()
decomposer.decompose(root_task)

print()
print("=== 3. 打印任务树 ===")
# 递归打印任务树结构，直观展示分解结果
def print_tree(task: Task, indent: str = ""):
    """递归打印任务树"""
    # 用 ◉ 表示任务节点，后面跟 id 和描述
    print(f"{indent}◉ {task.id} {task.description} [{task.status}]")
    for sub in task.subtasks:
        # 子任务缩进 2 个空格
        print_tree(sub, indent + "  ")

print_tree(root_task)

print()
print("=== 4. 执行任务树（Execute）===")
# 实例化执行器，递归执行整个任务树
executor = TaskExecutor()
executor.run(root_task)

print()
print("=== 5. 执行后的任务树 ===")
# 再次打印，确认所有任务状态都变成 done
print_tree(root_task)
`,
  },

  // ============================================================
  // 第 17 章：多 Agent 协作
  // ============================================================
  {
    id: "as-multi-agent",
    group: "Agent 编排与协作",
    icon: "👥",
    title: "多 Agent 协作：写作团队",
    content: `# 多 Agent 协作：写作团队

## 一、单 Agent 的局限

让一个 Agent 同时担任「写手 + 编辑 + 审稿」角色，效果差：
- 角色混乱，prompt 写不清
- 上下文越长越容易跑偏
- 无法并行，效率低

## 二、多 Agent 协作

不同 Agent 担任不同角色，分工明确，各自有专门的 prompt 和工具。

> 类比：报社里有记者（采访写稿）、编辑（润色修改）、校对（查错别字）、主编（终审决策），各司其职。

## 三、常见协作模式

### 1. 串行（Pipeline）

\`\`\`
Writer → Editor → Reviewer
\`\`\`

上一个的输出作为下一个的输入，最简单也最常用。

### 2. 并行

\`\`\`
┌── Agent A ──┐
│             ├── 合并
└── Agent B ──┘
\`\`\`

多个 Agent 同时工作，结果再合并。适合独立子任务。

### 3. 讨论（Discussion）

\`\`\`
Agent A ↔ Agent B（多轮对话）
\`\`\`

两个 Agent 反复交流，直到达成共识。适合需要辩论/评审的场景。

### 4. 监督者（Supervisor）

\`\`\`
        Supervisor
       /    |    \\
   Worker  Worker  Worker
\`\`\`

Manager Agent 负责调度，把任务分发给合适的 Worker Agent。

## 四、通信机制

Agent 之间传消息的方式：

| 方式 | 说明 |
|---|---|
| **直接传消息** | A 的输出直接作为 B 的输入（最简单） |
| **共享黑板** | 多个 Agent 读写同一个共享存储 |
| **消息队列** | 异步通信，解耦 Agent |

> 本 demo 用最简单的直接传消息方式。

## 五、串行写作团队流程

\`\`\`
topic
  ↓
[Writer]  写初稿
  ↓
[Editor]  润色修改
  ↓
[Reviewer] 审核通过 / 打回
  ↓
final article
\`\`\`

每个 Agent 拿到上一步的成果，做自己的工作再传给下一步。`,
    code: `# 多 Agent 协作演示 —— 串行写作团队
# 三个 Agent 角色协作完成一篇文章：Writer → Editor → Reviewer
# 演示最简单也最常用的串行（Pipeline）协作模式

# ===== 1. Agent 基类 =====
# 所有 Agent 都有 name 和 role，并能处理消息（process）
class Agent:
    """Agent 基类：定义统一的接口"""

    def __init__(self, name: str, role: str):
        # Agent 名字，便于日志区分
        self.name = name
        # Agent 角色描述：决定它的职责和思考方式
        self.role = role

    # 处理消息：子类必须实现
    # 参数说明：
    #   message: str —— 上一个 Agent 传来的消息
    # 返回值：str —— 处理后的消息
    def process(self, message: str) -> str:
        """处理消息（子类实现）"""
        raise NotImplementedError


# ===== 2. 三个角色 Agent =====
# 写手 Agent：根据主题生成文章初稿
class WriterAgent(Agent):
    """写手：根据主题写初稿"""

    def __init__(self):
        super().__init__(name="Writer", role="写手")

    # 模拟 LLM 写作
    # 这里用固定模板代替真实 LLM 调用
    def process(self, message: str) -> str:
        # message 是用户给的主题，如 "AI 简介"
        # 真实场景：prompt = f"请就以下主题写一篇 500 字文章：{message}"
        # LLM 会根据 prompt 生成文章
        draft = f"《{message}》\\n\\nAI 是计算机科学的分支，研究让机器模拟人类智能。"
        draft += "它包括机器学习、深度学习、自然语言处理等方向。"
        draft += "近年来大模型发展很快，AI 应用越来越广。"
        print(f"[{self.name}] 生成初稿（{len(draft)} 字）")
        return draft


# 编辑 Agent：对初稿进行润色修改
class EditorAgent(Agent):
    """编辑：润色初稿，让文章更通顺"""

    def __init__(self):
        super().__init__(name="Editor", role="编辑")

    def process(self, message: str) -> str:
        # message 是 Writer 传来的初稿
        # 真实场景：prompt = f"请润色以下文章：\\n{message}"
        # 这里用简单替换模拟润色效果
        edited = message.replace("AI 是", "人工智能（AI）是")
        edited = edited.replace("大模型", "大语言模型")
        edited += "\\n\\n（编辑注：已补充术语全称）"
        print(f"[{self.name}] 润色完成（{len(edited)} 字）")
        return edited


# 审稿 Agent：审核文章是否合格
class ReviewerAgent(Agent):
    """审稿：审核文章质量"""

    def __init__(self):
        super().__init__(name="Reviewer", role="审稿")

    def process(self, message: str) -> str:
        # message 是 Editor 润色后的文章
        # 真实场景：prompt = f"请审核以下文章，指出问题或确认通过：\\n{message}"
        # 这里用字数判断模拟审核逻辑
        if len(message) > 50:
            verdict = "✅ 审核通过：内容完整，术语规范"
        else:
            verdict = "❌ 审核不通过：内容过短"
        print(f"[{self.name}] 审核完成：{verdict}")
        # 返回审核结果和最终文章
        return f"{message}\\n\\n--- 审稿意见 ---\\n{verdict}"


# ===== 3. 写作团队 =====
# WritingTeam 把多个 Agent 串起来，协作完成写作任务
class WritingTeam:
    """写作团队：串行协作（Writer → Editor → Reviewer）"""

    def __init__(self):
        # 组建团队：实例化三个角色 Agent
        self.writer = WriterAgent()
        self.editor = EditorAgent()
        self.reviewer = ReviewerAgent()
        # 记录团队成员，便于按顺序调用
        self.pipeline = [self.writer, self.editor, self.reviewer]

    # 串行执行：消息依次经过每个 Agent
    # 参数说明：
    #   topic: str —— 用户给的主题
    # 返回值：str —— 最终成果（含审稿意见）
    def run(self, topic: str) -> str:
        """串行协作：每个 Agent 处理后再交给下一个"""
        print(f"\\n===== 写作任务：{topic} =====")
        # 初始消息就是用户给的主题
        message = topic
        # 依次让每个 Agent 处理
        for agent in self.pipeline:
            print(f"\\n--- {agent.role} {agent.name} 工作中 ---")
            # 上一个 Agent 的输出作为下一个的输入
            message = agent.process(message)
        # 最终返回最后一个 Agent 的输出
        return message


# ===== 4. 测试 =====
# 创建写作团队
team = WritingTeam()
# 让团队写一篇"AI 简介"的文章
# 串行流程：Writer 写初稿 → Editor 润色 → Reviewer 审核
final_article = team.run("AI 简介")

print()
print("===== 最终成果 =====")
print(final_article)
`,
  },

  // ============================================================
  // 第 18 章：Agent 状态机
  // ============================================================
  {
    id: "as-state",
    group: "Agent 编排与协作",
    icon: "🔀",
    title: "Agent 状态机：流程控制",
    content: `# Agent 状态机：流程控制

## 一、为什么需要状态管理

复杂 Agent 的工作流不是「一问一答」，而是多步骤、多分支的对话：
- 用户可能随时切换话题
- 需要收集多个信息才能继续
- 不同阶段要执行不同动作

用一堆 \`if-else\` 堆出来很快就会乱，难以维护。

## 二、状态机（State Machine）

状态机由三个元素组成：

| 元素 | 说明 |
|---|---|
| **States（状态）** | Agent 当前所处的阶段 |
| **Transitions（转移）** | 从一个状态到另一个状态的规则 |
| **Actions（动作）** | 在某状态下要执行的操作 |

## 三、客服 Agent 状态机示例

\`\`\`
WAITING → ASKING → SEARCHING → ANSWERING → DONE
\`\`\`

- 用户说话 → 进入 WAITING
- 需要信息 → 转到 ASKING（提问）
- 收到信息 → 转到 SEARCHING（查库）
- 查到结果 → 转到 ANSWERING（回答）
- 完成对话 → 转到 DONE

## 四、红绿灯类比

\`\`\`
红灯 → 绿灯 → 黄灯 → 红灯（循环）
\`\`\`

状态机的好处是**当前状态决定下一步**——绿灯只会变黄灯，不会突然变红灯。

## 五、与 if-else 的区别

\`\`\`python
# if-else 写法：逻辑分散，难以追踪
if step == 1 and has_order_id:
    do_search()
    step = 2
elif step == 2 and search_done:
    do_answer()
    step = 3
# ... 一堆嵌套条件
\`\`\`

\`\`\`python
# 状态机写法：清晰、可维护
state = TRANSITION[(state, input)]
action = ACTIONS[state]
action()
\`\`\`

状态机把「状态」「转移」「动作」分离，每个状态只关心自己要做的事。

## 六、状态机适用场景

- 客服对话（多轮收集信息）
- 订单流程（待支付 → 已支付 → 已发货 → 已签收）
- 游戏角色（待机 → 移动 → 攻击 → 受伤）
- 表单填写（每一步一个状态）

> 复杂的多轮交互 Agent，几乎都需要状态管理。`,
    code: `# Agent 状态机演示 —— 客服对话流程控制
# 用状态机管理多轮对话：WAITING → ASKING → SEARCHING → ANSWERING → DONE
# 演示状态、转移、动作三要素的协作

# ===== 1. 通用状态机 =====
# StateMachine 是通用类，可复用于任何状态机场景
class StateMachine:
    """状态机：管理状态和转移"""

    def __init__(self, states: set, transitions: dict, initial_state: str):
        # 所有合法状态集合，如 {"WAITING", "ASKING", ...}
        self.states = states
        # 转移表：{(当前状态, 输入): 下一状态}
        # 例如 {("WAITING", "user_msg"): "ASKING"}
        self.transitions = transitions
        # 当前状态：状态机启动后处于哪个状态
        self.current_state = initial_state

    # 根据输入转移状态
    # 参数说明：
    #   input_signal: str —— 输入信号（如用户消息类型）
    # 返回值：str —— 转移后的新状态；无法转移则返回 None
    def transition(self, input_signal: str) -> str:
        """根据输入信号从当前状态转移到下一状态"""
        # 用 (当前状态, 输入) 作为 key 查转移表
        key = (self.current_state, input_signal)
        if key in self.transitions:
            # 找到转移规则，更新当前状态
            old_state = self.current_state
            self.current_state = self.transitions[key]
            print(f"  [转移] {old_state} --{input_signal}--> {self.current_state}")
            return self.current_state
        # 没有匹配的转移规则：输入在当前状态下非法
        print(f"  [转移失败] 状态 {self.current_state} 无法处理输入 '{input_signal}'")
        return None

    # 判断是否处于某状态
    def is_state(self, state: str) -> bool:
        return self.current_state == state


# ===== 2. 客服 Agent（基于状态机）=====
# CustomerServiceAgent 把状态机和业务逻辑结合
class CustomerServiceAgent:
    """客服 Agent：用状态机管理多轮对话"""

    # 状态常量，便于引用
    WAITING = "WAITING"          # 等待用户发话
    ASKING = "ASKING"            # 询问用户信息
    SEARCHING = "SEARCHING"      # 查询数据库
    ANSWERING = "ANSWERING"      # 回答用户
    DONE = "DONE"                # 对话结束

    def __init__(self):
        # 定义状态集合
        states = {
            self.WAITING, self.ASKING, self.SEARCHING,
            self.ANSWERING, self.DONE,
        }
        # 定义转移表：每个状态在特定输入下转到哪个状态
        transitions = {
            # 用户发话 → 从等待进入询问阶段
            (self.WAITING, "user_msg"): self.ASKING,
            # 用户提供了订单号 → 进入查询阶段
            (self.ASKING, "order_id"): self.SEARCHING,
            # 查询完成 → 进入回答阶段
            (self.SEARCHING, "found"): self.ANSWERING,
            (self.SEARCHING, "not_found"): self.ANSWERING,
            # 回答完毕 → 对话结束
            (self.ANSWERING, "finish"): self.DONE,
        }
        # 创建内部状态机，初始状态为 WAITING
        self.sm = StateMachine(states, transitions, self.WAITING)
        # 模拟订单数据库
        self.orders_db = {"12345": "您的订单已发货，预计明天送达"}
        # 初始化上次查询结果（SEARCHING 状态写入，ANSWERING 状态读取）
        self.last_result = None

    # 每个状态对应的动作
    # 参数说明：
    #   context: dict —— 上下文信息（如用户消息、订单号）
    # 返回值：str —— Agent 给用户的回复
    def act(self, context: dict) -> str:
        """根据当前状态执行对应动作"""
        state = self.sm.current_state
        if state == self.WAITING:
            return "您好，请问需要什么帮助？"
        elif state == self.ASKING:
            return "请问您的订单号是多少？"
        elif state == self.SEARCHING:
            # 查数据库
            order_id = context.get("order_id", "")
            self.last_result = self.orders_db.get(order_id, "未找到该订单")
            return "正在为您查询..."
        elif state == self.ANSWERING:
            return f"查询结果：{self.last_result}"
        elif state == self.DONE:
            return "感谢咨询，再见！"
        return "..."

    # 处理用户输入：转移状态 + 执行动作
    # 参数说明：
    #   user_input: str —— 用户输入的文本
    #   context: dict —— 额外上下文
    # 返回值：str —— Agent 回复
    def handle(self, user_input: str, context: dict = None) -> str:
        """处理用户输入：先转移状态，再执行动作"""
        if context is None:
            context = {}
        # 根据用户输入判断输入信号（真实项目用 NLU 意图识别）
        if "订单" in user_input:
            signal = "user_msg"
        elif user_input.isdigit():
            # 输入是纯数字 → 当作订单号
            signal = "order_id"
            context["order_id"] = user_input
        elif user_input == "好的":
            signal = "finish"
        else:
            signal = "user_msg"

        # 1. 状态转移
        new_state = self.sm.transition(signal)
        # 2. 模拟查询（SEARCHING 状态自动转移到 ANSWERING）
        if self.sm.is_state(self.SEARCHING):
            # 查到结果后自动转到 ANSWERING
            result = "found" if context.get("order_id") in self.orders_db else "not_found"
            self.sm.transition(result)
        # 3. 执行动作
        reply = self.act(context)
        return reply


# ===== 3. 测试：模拟一次客服对话 =====
print("=== 模拟客服对话 ===\\n")
# 创建客服 Agent
agent = CustomerServiceAgent()

# 对话轮次：(用户输入, 说明)
turns = [
    ("我要查询订单", "用户提需求"),    # WAITING → ASKING
    ("12345", "用户提供订单号"),       # ASKING → SEARCHING → ANSWERING
    ("好的", "用户确认收到"),          # ANSWERING → DONE
]

# 依次处理每一轮对话
for user_input, desc in turns:
    print(f"用户: {user_input}    （{desc}）")
    # Agent 处理用户输入，返回回复
    reply = agent.handle(user_input)
    print(f"客服: {reply}")
    print(f"  当前状态: {agent.sm.current_state}")
    print()

print("=== 对话结束 ===")
print(f"最终状态: {agent.sm.current_state}")
`,
  },
];
