// =============================================================
// AI 智能体开发入门教程简化版 —— 第 1 批（智能体入门基础 4 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：as-（aiagent-simple）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：什么是 AI 智能体
  // ============================================================
  {
    id: "as-intro",
    group: "智能体入门基础",
    icon: "🤖",
    title: "什么是 AI 智能体",
    content: `# 什么是 AI 智能体

## 一、从恒温器说起

想象一个**恒温器**（thermostat）：你设定 25℃，它会一直盯着室温，高了就开空调，低了就开暖气。

恒温器就是一个最朴素的"智能体"——它能**自己感知环境、自己决定、自己行动**，而不是等人来按开关。

> **Agent（智能体）= 能自主感知环境并采取行动以达成目标的系统**

## 二、传统程序 vs Agent

**传统程序**：写死的 if-else 逻辑，输入相同 → 输出相同，不会自己变通。

\`\`\`python
# 传统程序：固定逻辑
def control(temp):
    if temp > 26:
        return "开空调"
    elif temp < 22:
        return "开暖气"
    else:
        return "保持"
\`\`\`

**Agent**：有目标，能根据环境**自主决策**。同样是 25℃，如果在夏天它可能"开空调降温"，在冬天它可能"保持"，因为它会结合上下文判断。

## 三、Agent 三要素

任何 Agent 都有这三个核心环节：

| 要素 | 英文 | 做什么 | 例子 |
|---|---|---|---|
| 感知 | Perceive | 获取环境信息 | 读温度、看用户输入 |
| 决策 | Decide | 选择下一步动作 | 温度高 → 降温 |
| 行动 | Act | 执行决策影响环境 | 开空调 |

\`\`\`
环境 ──感知──> [决策] ──行动──> 环境 ──感知──> [决策] ...
\`\`\`

## 四、传统程序 vs Agent 对比

| 维度 | 传统程序 | Agent |
|---|---|---|
| 输入 | 固定格式 | 多模态、非结构化 |
| 逻辑 | if-else 写死 | 动态决策（规则/LLM） |
| 输出 | 唯一确定 | 可能多样 |
| 适应性 | 改代码才能变 | 自主适应环境 |

## 五、AI Agent 的核心：LLM 当大脑

传统 Agent 的决策靠**人工写的规则**，规则一多就难维护。

**AI Agent** 用 **LLM（大语言模型）当大脑**做决策：

- 输入自然语言，理解意图
- 根据上下文动态决定动作
- 能处理规则没枚举到的情况

\`\`\`
感知（用户输入）→ LLM 决策（生成动作）→ 行动（调用工具）→ 观察 → 再决策
\`\`\`

## 六、典型应用场景

| 场景 | Agent 做什么 |
|---|---|
| 客服 | 理解用户问题 → 查知识库 → 回答/转人工 |
| 写作助手 | 理解需求 → 检索资料 → 生成文章 |
| 数据分析 | 读数据 → 自动选图表 → 写报告 |
| 代码助手 | 读需求 → 写代码 → 跑测试 → 修 bug |

> 后面章节会从最简单的规则 Agent 开始，逐步搭出真正的 AI Agent。`,
    code: `# 什么是 AI 智能体 —— 最简单的 Agent 概念模型
# 用恒温器场景演示 Agent 的三要素：感知、决策、行动
# 这个 SimpleAgent 不依赖任何第三方库，纯标准库即可运行

import random  # random 模块：用于生成随机室温，模拟环境变化

# ===== 定义最简单的 Agent =====
# Agent 类包含三要素：perceive（感知）、decide（决策）、act（行动）
# 目标：把室温维持在 22~26℃ 的舒适区间
class SimpleAgent:
    """最简单的 Agent：温度控制器"""

    def __init__(self, target_low: int = 22, target_high: int = 26):
        """初始化 Agent，设置舒适温度区间"""
        # target_low/target_high 定义了"舒适区间"
        # 低于 target_low 要升温，高于 target_high 要降温
        self.target_low = target_low   # 舒适温度下限
        self.target_high = target_high  # 舒适温度上限
        self.current_temp = 24.0        # 当前室温，初始设为 24℃
        self.action = "保持"            # 记录上一次执行的动作

    def perceive(self) -> float:
        """感知：读取当前室温"""
        # 实际场景中这里会调用温度传感器 API
        # 这里用 self.current_temp 模拟传感器读数
        # 返回当前感知到的温度
        return self.current_temp

    def decide(self, temp: float) -> str:
        """决策：根据温度决定动作"""
        # 决策规则：温度高降温，温度低升温，否则保持
        # 这是最简单的"规则驱动"决策，后续章节会换成 LLM 决策
        if temp > self.target_high:
            return "开空调降温"  # 太热：开空调
        elif temp < self.target_low:
            return "开暖气升温"  # 太冷：开暖气
        else:
            return "保持"        # 舒适：什么都不做

    def act(self, action: str):
        """行动：执行决策，影响环境（改变室温）"""
        # 行动会反过来影响环境温度
        # 开空调 → 温度下降；开暖气 → 温度上升；保持 → 温度受外界影响漂移
        if action == "开空调降温":
            self.current_temp -= 1.5  # 降温 1.5℃
        elif action == "开暖气升温":
            self.current_temp += 1.5  # 升温 1.5℃
        else:
            # 保持时，室温随机漂移（模拟环境影响）
            self.current_temp += random.uniform(-0.5, 0.5)
        self.action = action  # 记录本次动作

    def step(self) -> dict:
        """执行一步完整循环：感知 → 决策 → 行动"""
        # 这是 Agent 的核心循环，把三要素串起来
        temp = self.perceive()         # 1. 感知
        action = self.decide(temp)     # 2. 决策
        self.act(action)               # 3. 行动
        # 返回这一步的状态，方便观察
        return {"温度": round(temp, 1), "动作": action}

# ===== 模拟运行 5 个时间步 =====
print("=== SimpleAgent 温度控制器演示 ===")
print(f"目标区间: 22℃ ~ 26℃\\n")

agent = SimpleAgent(target_low=22, target_high=26)  # 创建 Agent 实例

# 模拟 5 个时间步的运行过程
for i in range(1, 6):
    # 执行一步循环
    state = agent.step()
    # 打印这一步的感知-决策-行动结果
    print(f"步骤 {i}: 感知到 {state['温度']}℃ → 决策: {state['动作']}")

print("\\n=== 运行结束 ===")
print("可以看到 Agent 会持续感知温度并自主决定开关空调/暖气")
print("这就是 Agent 的核心思想：自主感知 → 决策 → 行动")
`,
  },

  // ============================================================
  // 第 2 章：Agent 核心循环
  // ============================================================
  {
    id: "as-loop",
    group: "智能体入门基础",
    icon: "🔄",
    title: "Agent 核心循环：感知-决策-行动",
    content: `# Agent 核心循环：感知-决策-行动

## 一、Agent Loop 是什么

Agent 不是"调一次就结束"的函数，而是一个**持续运行的循环**：

\`\`\`
感知环境 → 决策 → 行动 → 观察结果 → 再决策 → 再行动 → ...
\`\`\`

这个循环叫 **Agent Loop**（智能体循环），是所有 Agent 的运行骨架。

## 二、用开车类比

想象你在开车：

| 步骤 | 开车场景 | Agent 对应 |
|---|---|---|
| 看路 | 看前方路况、后视镜 | perceive（感知） |
| 决定 | 刹车？变道？加速？ | decide（决策） |
| 操作 | 转方向盘、踩油门 | act（行动） |
| 再看路 | 观察操作后的新路况 | observe（观察） |

开车不可能"看一眼就闭眼开到底"，必须**不断看 → 决定 → 操作 → 再看**。Agent 也是如此。

## 三、循环终止条件

Agent 不能无限循环，必须要有停止条件，常见的有三种：

1. **任务完成**：目标已达成（如房间已扫干净）
2. **达到最大步数**：防止死循环（如 max_steps=10）
3. **出错**：环境异常或决策失败

## 四、状态（State）的概念

Agent 需要**记住中间结果**，这叫状态。比如扫地机器人要记住"已扫过哪些区域"。

状态决定下一步决策：

\`\`\`python
state = {
    "current_room": "客厅",
    "cleaned_rooms": ["卧室"],
    "dirt_detected": True,
}
# 决策时结合状态：客厅脏 → 扫客厅
\`\`\`

## 五、Agent Loop 流程图

\`\`\`
          ┌─────────────┐
          │   开始任务    │
          └──────┬──────┘
                 ▼
        ┌────────────────┐
        │  感知 perceive  │ <──────┐
        └───────┬────────┘        │
                ▼                 │
        ┌────────────────┐        │
        │  决策 decide    │        │
        └───────┬────────┘        │
                ▼                 │
        ┌────────────────┐        │
        │  行动 act       │        │
        └───────┬────────┘        │
                ▼                 │
        ┌────────────────┐        │
        │  观察结果       │ ───────┘
        └───────┬────────┘
                ▼
        ┌────────────────┐
        │ 终止条件判断    │
        └───────┬────────┘
           完成/出错 → 退出
\`\`\`

## 六、为什么必须循环

- **环境会变化**：扫完客厅，卧室又脏了
- **行动有反馈**：上一步动作的后果要观察才知道
- **任务多步骤**：复杂任务一次决策做不完

> 下一章我们会写第一个真正能跑的规则驱动 Agent。`,
    code: `# Agent 核心循环 —— 感知-决策-行动循环演示
# 用扫地机器人场景演示完整的 Agent Loop
# 包含：感知、决策、行动、观察、状态、终止条件

import random  # random 模块：用于模拟房间脏污的随机变化

# ===== AgentLoop 类：完整的智能体循环 =====
# 模拟一个扫地机器人 Agent，目标：把所有房间打扫干净
class AgentLoop:
    """扫地机器人 Agent：演示完整的感知-决策-行动循环"""

    def __init__(self, rooms: list, max_steps: int = 8):
        """初始化 Agent 状态"""
        # rooms 是房间列表，每个房间有名字和脏污状态
        # 用字典存每个房间是否脏：True=脏，False=干净
        self.rooms = {name: True for name in rooms}  # 初始所有房间都是脏的
        self.current_room = rooms[0]  # Agent 当前所在房间，从第一个开始
        self.max_steps = max_steps    # 最大循环步数，防止死循环
        self.step_count = 0           # 已执行的步数
        self.state_log = []          # 记录每步状态，方便观察

    def perceive(self) -> dict:
        """感知：读取当前房间的脏污状态"""
        # 返回当前房间是否脏
        # 实际场景这里会调用传感器（如摄像头、灰尘检测）
        return {
            "room": self.current_room,
            "is_dirty": self.rooms[self.current_room],
        }

    def decide(self, perception: dict) -> str:
        """决策：根据感知结果决定动作"""
        # 决策规则：
        # 1. 当前房间脏 → 扫地
        # 2. 当前房间干净 → 移动到下一个房间
        if perception["is_dirty"]:
            return "扫地"  # 当前房间脏，扫地
        else:
            return "移动"  # 当前房间干净，去下一个房间

    def act(self, action: str) -> str:
        """行动：执行决策，返回观察结果"""
        # 执行动作并影响环境
        if action == "扫地":
            self.rooms[self.current_room] = False  # 扫完变干净
            observation = f"已清扫 {self.current_room}"
        else:
            # 移动到下一个脏房间
            # 找出还没扫的房间
            dirty_rooms = [r for r, dirty in self.rooms.items() if dirty]
            if dirty_rooms:
                self.current_room = dirty_rooms[0]  # 移动到下一个脏房间
                observation = f"移动到 {self.current_room}"
            else:
                observation = "所有房间都干净了"  # 没有脏房间了
        self.step_count += 1  # 步数 +1
        return observation

    def is_done(self) -> bool:
        """终止条件判断：是否该停止循环"""
        # 三种终止条件：
        # 1. 所有房间都干净了（任务完成）
        # 2. 步数超过 max_steps（防止死循环）
        all_clean = not any(self.rooms.values())  # any() 返回是否有脏房间
        if all_clean:
            return True  # 任务完成
        if self.step_count >= self.max_steps:
            return True  # 达到最大步数
        return False  # 继续循环

    def run(self):
        """运行完整的 Agent Loop"""
        # 这就是 Agent 的主循环：感知 → 决策 → 行动 → 观察 → 判断终止
        print("=== 扫地机器人 Agent 启动 ===")
        print(f"房间列表: {list(self.rooms.keys())}")
        print(f"最大步数: {self.max_steps}\\n")

        # 循环直到终止条件满足
        while not self.is_done():
            step = self.step_count + 1  # 显示用的步数（从 1 开始）
            print(f"--- 步骤 {step} ---")

            # 1. 感知
            perception = self.perceive()
            print(f"  [感知] 当前房间: {perception['room']}, 脏: {perception['is_dirty']}")

            # 2. 决策
            action = self.decide(perception)
            print(f"  [决策] 动作: {action}")

            # 3. 行动 + 观察
            observation = self.act(action)
            print(f"  [行动] {observation}")

            # 4. 记录状态变化
            self.state_log.append({
                "step": step,
                "room": perception["room"],
                "action": action,
            })

        # 循环结束，打印终止原因
        print(f"\\n=== 循环结束 ===")
        if not any(self.rooms.values()):
            print("终止原因: 所有房间已打扫干净（任务完成）")
        else:
            print(f"终止原因: 达到最大步数 {self.max_steps}")
        print(f"房间状态: {self.rooms}")

# ===== 运行扫地机器人 Agent =====
# 创建 3 个房间，限制最多 8 步
agent = AgentLoop(rooms=["客厅", "卧室", "厨房"], max_steps=8)
agent.run()
`,
  },

  // ============================================================
  // 第 3 章：第一个 Agent
  // ============================================================
  {
    id: "as-first",
    group: "智能体入门基础",
    icon: "🌡️",
    title: "第一个 Agent：规则驱动的温度报警器",
    content: `# 第一个 Agent：规则驱动的温度报警器

## 一、规则驱动 Agent（Rule-based Agent）

最简单的 Agent 是**规则驱动**的：决策逻辑用 **if-else 写死**，但已经有完整的三要素。

\`\`\`python
# 规则驱动决策
def decide(temp):
    if temp < 22: return "开暖气"
    if temp > 26: return "开空调"
    return "保持"
\`\`\`

## 二、规则 Agent 的三要素

| 要素 | 规则 Agent 怎么做 |
|---|---|
| 感知 | 调用传感器读温度 |
| 决策 | 跑 if-else 规则 |
| 行动 | 开暖气/空调/保持 |

它有完整的循环，只是决策逻辑是固定的。

## 三、与智能 Agent 的区别

| 维度 | 规则 Agent | 智能 Agent（LLM） |
|---|---|---|
| 决策来源 | 人工写的规则 | LLM 动态生成 |
| 灵活性 | 死板 | 灵活 |
| 可解释性 | 强（规则透明） | 弱（黑盒） |
| 维护成本 | 规则一多就难维护 | 改 prompt 即可 |
| 新情况处理 | 不能（规则没写就懵） | 能（LLM 自己想） |

## 四、适合用规则 Agent 的场景

- **规则明确**：温度报警、库存预警
- **变化少**：业务逻辑稳定
- **要求可解释**：金融、医疗等需要审计的场景
- **性能敏感**：LLM 太慢，规则即时返回

## 五、规则 Agent 的缺点

1. **无法处理规则外的情况**：没写的就不会
2. **规则一多就打架**：规则冲突难调和
3. **无法理解上下文**：只看输入数据
4. **无法学习**：不会从经验中改进

> 规则 Agent 适合做"守门员"，处理确定的事；不确定的事交给 LLM Agent。

## 六、本章 Demo

实现一个完整的 TemperatureAgent：

- 感知：随机生成室温（18~32℃）
- 决策：<22℃ 开暖气，>26℃ 开空调，其他保持
- 行动：执行升温/降温/保持，影响下一步温度
- 循环 10 步，用文字字符画温度变化曲线`,
    code: `# 第一个 Agent —— 规则驱动的温度报警器
# 实现完整的感知-决策-行动循环，并用文字字符画温度曲线
# 这是规则驱动 Agent 的典型例子：决策逻辑用 if-else 写死

import random  # random 模块：用于生成随机室温

# ===== TemperatureAgent 类：规则驱动的温度控制 Agent =====
class TemperatureAgent:
    """温度报警器 Agent：基于 if-else 规则做决策"""

    def __init__(self, initial_temp: float = 24.0):
        """初始化 Agent"""
        # current_temp 记录当前室温，是 Agent 的状态
        # history 记录每步温度，用于画曲线
        self.current_temp = initial_temp  # 初始室温 24℃
        self.history = [initial_temp]     # 历史温度列表，第一步是初始值
        self.actions = []                # 历史动作列表

    def perceive(self) -> float:
        """感知：读取当前室温"""
        # 实际项目会调用温度传感器 API
        # 这里直接返回 self.current_temp（已被行动步骤更新过）
        return round(self.current_temp, 1)

    def decide(self, temp: float) -> str:
        """决策：根据温度跑 if-else 规则"""
        # 规则驱动决策的核心：
        # - 温度低于 22℃：太冷，开暖气
        # - 温度高于 26℃：太热，开空调
        # - 其他情况：保持
        if temp < 22:
            return "开暖气"  # 升温
        elif temp > 26:
            return "开空调"  # 降温
        else:
            return "保持"    # 舒适区间，不动

    def act(self, action: str):
        """行动：执行决策，影响下一步温度"""
        # 行动会改变环境温度，下一步感知会读到新值
        if action == "开暖气":
            self.current_temp += random.uniform(1.0, 2.0)  # 升温 1~2℃
        elif action == "开空调":
            self.current_temp -= random.uniform(1.0, 2.0)  # 降温 1~2℃
        else:
            # 保持时室温受外界影响随机漂移 -0.5~+0.5℃
            self.current_temp += random.uniform(-0.5, 0.5)
        # 限制温度在合理范围 [15, 35] 内，避免漂得太离谱
        self.current_temp = max(15.0, min(35.0, self.current_temp))

    def step(self):
        """执行一步完整循环"""
        # 感知 → 决策 → 行动
        temp = self.perceive()
        action = self.decide(temp)
        self.act(action)
        # 记录这一步的温度和动作，用于后续画曲线
        self.history.append(round(self.current_temp, 1))
        self.actions.append(action)
        # 返回这一步的快照
        return temp, action

    def print_curve(self):
        """用文字字符画温度变化曲线"""
        # 把每步温度映射成字符位置，直观展示温度走势
        # 温度范围 15~35℃，对应 20 个字符宽度
        print("\\n=== 温度变化曲线 ===")
        print("温度刻度: 15℃" + " " * 18 + "25℃" + " " * 18 + "35℃")
        for i, temp in enumerate(self.history):
            # 把温度映射到 0~40 的位置（每 0.5℃ 一格）
            pos = int((temp - 15) * 2)
            pos = max(0, min(40, pos))  # 限制在画布内
            # 用 * 标记温度位置，前面用空格填充
            # 同时标注舒适区间 [22, 26] 的位置
            bar = " " * pos + "*"
            # 标注这一步的动作
            action = self.actions[i - 1] if i > 0 else "初始"
            print(f"步骤{i:2d} {temp:5.1f}℃ |{bar:<41} | {action}")


# ===== 运行 Agent 10 步 =====
print("=== 规则驱动温度报警器 Agent ===")
print("决策规则: <22℃ 开暖气, >26℃ 开空调, 其他保持")
print("舒适区间: 22℃ ~ 26℃\\n")

# 创建 Agent，初始温度 24℃（舒适区间内）
agent = TemperatureAgent(initial_temp=24.0)

# 循环 10 步，打印每步的感知-决策-行动
for i in range(1, 11):
    print(f"=== 步骤 {i} ===")
    temp, action = agent.step()
    # 显示这一步的详细状态
    print(f"  感知温度: {temp}℃")
    print(f"  决策动作: {action}")
    print(f"  行动后温度: {agent.current_temp:.1f}℃")

# 画温度变化曲线
agent.print_curve()
print("\\n可以看到 Agent 会自主把温度维持在 22~26℃ 舒适区间内")
print("这就是规则驱动 Agent 的能力：固定规则 + 完整循环")
`,
  },

  // ============================================================
  // 第 4 章：何时该用 Agent
  // ============================================================
  {
    id: "as-when",
    group: "智能体入门基础",
    icon: "⚖️",
    title: "何时该用 Agent：Agent vs 传统代码",
    content: `# 何时该用 Agent：Agent vs 传统代码

## 一、Agent 不是万能的

很多人一听 Agent 就觉得高级，什么都要用 Agent。但**不是所有任务都该用 Agent**——

> 反例：算 \`1+1\` 用 Agent 是过度设计，直接 \`return 2\` 就行。

## 二、决策矩阵：什么任务该用 Agent

| 任务类型 | 是否用 Agent | 原因 |
|---|---|---|
| 算 1+1 | ❌ 不用 | 确定性任务，规则明确 |
| 数据校验 | ❌ 不用 | 规则固定，性能要求高 |
| 客服问答 | ✅ 用 | 开放式，需要理解意图 |
| 写文章/写代码 | ✅ 用 | 创造性任务，规则难枚举 |
| 数据分析报告 | ✅ 用 | 需要灵活选择图表和角度 |
| 安全关键系统 | ❌ 不用 | Agent 不可预测，不能赌 |
| 实时控制（刹车）| ❌ 不用 | 性能敏感，必须确定性 |

## 三、适合用 Agent 的特征

✅ **开放式问题**：答案不唯一，如"帮我写个文案"
✅ **需要灵活决策**：规则难穷举，如用户意图识别
✅ **多步骤任务**：需要拆解、规划、循环
✅ **涉及自然语言**：理解用户输入是核心

## 四、不适合用 Agent 的特征

❌ **确定性任务**：输入相同输出必须相同
❌ **性能敏感**：Agent 比普通函数慢 100~1000 倍
❌ **安全关键**：Agent 输出不可预测，可能致命
❌ **规则简单明确**：if-else 就能搞定，别上 Agent

## 五、反例与正例

**反例（不该用 Agent）**：
- 计算订单总价 → 直接 \`sum()\`
- 校验邮箱格式 → 直接正则
- 排序数组 → 直接 \`sorted()\`

**正例（该用 Agent）**：
- "帮我分析这份销售数据并给出建议"
- "根据用户描述定位 bug"
- "写一篇关于 XX 的科普文章"

## 六、5 个问题判断是否该用 Agent

回答下面 5 个问题，3 个以上"是"就该用 Agent：

1. ❓ 任务可以用一句话描述，但实现要很多步骤吗？
2. ❓ 输入是自然语言或非结构化数据吗？
3. ❓ 不同情况需要不同的处理逻辑吗？
4. ❓ 无法预先列举所有可能情况吗？
5. ❓ 对延迟不敏感（可以等几秒）吗？

\`\`\`
任务类型 → 5 个问题 → ≥3 个"是" → 用 Agent
                  → <3 个"是" → 用传统代码
\`\`\`

> 选对工具比用新工具更重要。Agent 是解决问题的工具，不是炫技的标签。`,
    code: `# 何时该用 Agent —— 传统代码 vs Agent 实现对比
# 同一个任务用两种方式实现，对比差异
# 任务：根据用户输入文本选择处理方式
# - 传统方式：if-elif 链，规则固定
# - Agent 方式：规则匹配 + 模拟 LLM 决策，更灵活

import random  # random 模块：用于模拟 LLM 的不确定性

# ===== 传统实现：if-elif 链处理 =====
# 特点：规则固定，写死所有分支，新增意图要改代码
# 参数说明：
#   user_input: str —— 用户输入的文本
# 返回值：str —— 处理结果
def traditional_handle(user_input: str) -> str:
    """传统实现：用 if-elif 链匹配关键词"""
    # 把输入转小写，便于匹配
    text = user_input.lower()
    # 按关键词硬匹配，只能识别预设的几种说法
    if "你好" in text or "hello" in text:
        return "你好，我是客服机器人"  # 问候意图
    elif "天气" in text:
        return "今天天气晴朗"          # 天气查询
    elif "退货" in text or "退款" in text:
        return "已为您发起退货流程"    # 退货意图
    else:
        # 规则外的输入全部走到这里
        return "抱歉，我没理解您的意思"

# ===== Agent 实现：规则匹配 + 模拟 LLM 决策 =====
# 特点：先匹配规则，规则不中再让"LLM"动态决策
# 这里的 LLM 是模拟的，真实场景会调用 OpenAI/Claude API
def simulate_llm_decide(user_input: str) -> str:
    """模拟 LLM 决策：实际项目这里会调 LLM API"""
    # 真实场景：把用户输入发给 LLM，让它返回意图和回复
    # 这里用关键词 + 随机模拟 LLM 的"理解能力"
    text = user_input.lower()
    # LLM 能识别更多变体（如同义词、近义词）
    if "嗨" in text or "哈喽" in text or "hi" in text:
        return "你好呀，有什么可以帮您？"  # 识别更多问候说法
    elif "温度" in text or "多少度" in text:
        return "当前室温 24℃，体感舒适"  # 识别"温度"相关变体
    elif "退" in text and ("货" in text or "钱" in text):
        return "好的，已为您提交退款申请"  # 识别退货的多种表达
    elif "thanks" in text or "谢" in text:
        return "不客气，很高兴帮到您"    # 识别感谢
    else:
        # LLM 还能"编"一个看似合理的回复
        # 这是 Agent 比传统代码灵活的地方：不会说"没理解"
        return f"我理解您说的是关于『{user_input}』的问题，正在为您处理"

# Agent 的处理函数：先规则，后 LLM
# 参数说明：
#   user_input: str —— 用户输入
# 返回值：str —— 处理结果
def agent_handle(user_input: str) -> str:
    """Agent 实现：规则匹配 + LLM 兜底"""
    text = user_input.lower()
    # 第一层：先走快速规则（命中就直接返回，省 LLM 调用）
    if "你好" in text or "hello" in text:
        return "你好，我是客服 Agent"
    # 第二层：规则没命中，交给 LLM 决策
    # 这里的"LLM"能处理规则外的输入，体现 Agent 的灵活性
    return simulate_llm_decide(user_input)

# ===== 对比测试：3 个测试用例 =====
# 测试用例覆盖：规则内、规则边缘、规则外三种情况
test_cases = [
    "你好，在吗？",            # 规则内：两种方式都能处理
    "今天多少度啊？",          # 规则边缘：传统懵，Agent 懂
    "我想把昨天买的那个东西退了",  # 规则外：传统懵，Agent 编
]

print("=== 传统代码 vs Agent 对比测试 ===\\n")
for i, case in enumerate(test_cases, 1):
    print(f"--- 测试用例 {i} ---")
    print(f"用户输入: {case}")
    # 传统方式处理
    trad_result = traditional_handle(case)
    print(f"传统代码: {trad_result}")
    # Agent 方式处理
    agent_result = agent_handle(case)
    print(f"Agent    : {agent_result}")
    print()  # 空行分隔

print("=== 总结 ===")
print("传统代码: 快、确定、但只能处理预设规则内的输入")
print("Agent    : 慢一点、但能处理规则外的灵活输入")
print("决策原则: 任务开放/灵活 → 用 Agent；任务确定/性能敏感 → 用传统代码")
`,
  },
];
