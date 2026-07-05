// =============================================================
// AI 应用编程教程 —— 第 4 批章节（Codex深度使用组，共 5 章）
// -------------------------------------------------------------
// 章节范围：
//   16. aiapp-codex-intro    Codex CLI 入门
//   17. aiapp-codex-install  Codex 安装与配置
//   18. aiapp-codex-usage    Codex 命令详解
//   19. aiapp-codex-agents   AGENTS.md 配置详解
//   20. aiapp-codex-workflow Codex 实战工作流
//
// 信息时效：2026-07-05。Codex CLI 是 OpenAI 2025 年开源的
// 终端 AI 编程代理，相关参数与命令以官方仓库为准：
//   https://github.com/openai/codex
// 文中涉及具体参数若与最新版本不一致，请以官方文档为准。
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   icon    : 展示用 emoji
//   group   : 分组名
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（代码块已转义）
//   code    : 可在 Node.js 沙箱运行、带详细中文注释的示例代码
// =============================================================

export const chapters = [
  {
    id: "aiapp-codex-intro",
    icon: "🔋",
    group: "Codex深度使用",
    title: "Codex CLI 入门",
    content: `
# 第16章：Codex CLI 入门

## 16.1 Codex 是什么

Codex CLI（简称 Codex）是 OpenAI 于 2025 年开源的**终端原生 AI 编程代理**。它以命令行工具的形式存在，安装后通过 \`codex\` 命令唤起，能直接在你的本机仓库里读文件、写文件、执行命令、跑测试，并把整个过程以"思考 → 行动 → 观察"的循环呈现给你确认。与 IDE 内嵌的 Copilot 类工具不同，Codex 不绑定任何编辑器，它工作的舞台是 shell——这意味着它对 Vim 用户、远程 SSH 开发者、CI 流水线、Docker 容器内的开发环境一视同仁。

理解 Codex 的关键有三点：第一，它是一个**代理（agent）**而不是一个**补全器（completer）**。补全器只回答"下一段代码应该是什么"，而代理回答"这个任务交给我，我来搞定"。第二，它**默认运行在沙箱里**，所有文件写入与命令执行都受 OpenAI 设计的沙箱机制约束，避免一次性失误就把仓库删光。第三，它**通过 AGENTS.md 接收项目规则**，类似 Cursor 的 \`.cursor/rules\` 和 Claude Code 的 \`CLAUDE.md\`，让 Codex 在动手前就了解你的技术栈、目录约定与禁区。

Codex 这个名字并非全新。早在 2021 年，OpenAI 就发布过名为 Codex 的代码大模型（即 HumanEval 论文背后的模型），它是 GitHub Copilot 早期的底层模型。2025 年重新启用的"Codex"品牌，被赋予了一个新的载体——开源 CLI 代理。所以当你看到"Codex"时，要根据上下文判断它指的是 2021 年的旧模型，还是 2025 年的 CLI 工具。本章及后续所有章节里，"Codex"默认指 2025 年的 CLI 代理。

\`\`\`text
旧 Codex（2021）  ──>  代码大模型，Copilot 早期底座，已停服
新 Codex（2025）  ──>  开源终端 AI 编程代理，OpenAI 维护
两者共享品牌名，但是完全不同的产品
\`\`\`

## 16.2 Codex 与 ChatGPT、Copilot 的关系

初学者最容易混淆"Codex 与 ChatGPT、Copilot 是不是同一种东西"。它们的底层模型可能共享，但产品形态、目标场景、交付方式差异显著。

**ChatGPT** 是 OpenAI 的对话产品，定位是通用助手。你在网页或 App 里跟它聊天，它回答你。它没有你的本地文件、不能跑你的命令、不能改你的仓库。把代码贴进去，它能解释、能改，但所有"搬运"工作要你手动做。

**GitHub Copilot** 是 IDE 内嵌的代码补全与对话工具，定位是"开发者的副驾驶"。它能感知当前打开的文件、当前光标位置，给出补全建议；Copilot Chat 还能解释选中的代码。但它的能力边界是"当前 IDE 能看到的世界"，跨仓库、跨终端、跑脚本类任务它做不了。

**Codex CLI** 是终端代理，定位是"能在你机器上动手干活的工程师"。它有 shell、有文件系统、有沙箱、有 AGENTS.md，能"从零创建一个项目""跑测试看结果""根据报错回滚重试"。它跟 ChatGPT 的差别是"有手"；跟 Copilot 的差别是"有整台机器"。

\`\`\`text
ChatGPT   ──>  能说，没手（纯对话）
Copilot   ──>  能说，能看 IDE（半自动）
Codex CLI ──>  能说，能看，能动手（全自动代理）
\`\`\`

需要说明的是，这三者并非互相替代，而是覆盖不同场景。日常写代码时，Copilot 在 IDE 里给你逐行补全最顺手；做技术调研、写文档时，ChatGPT 的对话体验最舒服；当任务复杂到"要读多个文件、要跑命令、要根据结果迭代"时，Codex 才是更合适的工具。一个成熟的 AI 编程工作流通常是三者并用。

## 16.3 Codex 的核心特性

Codex 区别于其他 AI 编程工具的核心特性有四条，理解这四条就理解了 Codex 的产品定位。

**特性一：终端原生（terminal-native）**。Codex 不是一个套了终端壳的网页工具，它从设计第一天就是为 shell 优化的。它的输入是 stdin，输出是带颜色与状态的 TUI（终端界面），它尊重你的 \`TERM\`、支持管道、可以放在 tmux 里跑。这带来一个直接好处：远程开发场景（SSH 到服务器、容器内开发、WSL）里，Codex 能用而 IDE 工具用不了。

**特性二：AGENTS.md 配置**。Codex 在动手前会先读项目里的 \`AGENTS.md\`（如果存在），把它当作"项目说明书"。你在里面写清楚技术栈、目录结构、构建命令、代码风格、禁止行为，Codex 就会在执行任务时遵守。这是让 Codex"按你团队的规矩办事"的关键机制，详见第 19 章。

**特性三：自主多步执行（agentic multi-step）**。这是 Codex 最核心的能力。给定一个任务（比如"给 user.controller.ts 加上输入校验并补单元测试"），Codex 会自己拆解成多步：先读相关文件、定位需要改的地方、写改动、跑测试、根据测试结果回滚或修正、最后给你一份总结。整个过程你能看到、能干预，但不需要你逐步指挥。

**特性四：Sandbox 沙箱**。Codex 默认在沙箱里执行命令与文件写入，沙箱外的操作需要你显式批准。沙箱有三个层级：read-only（只读，最安全）、workspace-write（可写当前工作区，默认）、danger-full-access（完全访问，慎用）。沙箱是 Codex 能够"放心让代理动手"的安全网，没有它，自主多步执行就太危险了。

\`\`\`text
终端原生      ──>  能去任何有 shell 的地方
AGENTS.md    ──>  能听懂你项目的规矩
自主多步      ──>  能把复杂任务自己拆开干完
Sandbox 沙箱  ──>  能放心让它动手
\`\`\`

## 16.4 Codex 的"自主多步"特征详解

"自主多步"四个字值得专门展开。这是代理（agent）与聊天机器人（chatbot）最本质的区别，也是 Codex 之所以叫"代理"而不是"对话工具"的原因。

传统聊天模式下，你问一句，模型答一句，结束。哪怕模型告诉你"你应该先做 A 再做 B"，A 和 B 也得你自己来。这种模式下，模型只是一个"顾问"，所有执行都在你手里。

自主多步模式下，你给出一个目标，模型自己决定下一步做什么。它会进入一个循环：

1. **思考（Thought）**：分析当前状态，决定下一步要做什么。
2. **行动（Action）**：调用一个工具——读文件、写文件、执行命令、跑测试。
3. **观察（Observation）**：拿到工具的输出，作为下一步的输入。
4. **循环**：回到第 1 步，直到任务完成或需要人工确认。

这个循环一直跑到 Codex 自己判断"任务完成"或遇到需要你批准的操作（沙箱外的写操作、有副作用的命令等）才停下。整个过程你可以全程看着，必要时用键盘打断、修改、追加指令。

举一个具体例子。你给 Codex 一个任务："给 \`src/user.ts\` 里的 \`createUser\` 函数补单元测试，覆盖邮箱为空和邮箱非法两种边界。" 一个典型的多步执行序列是：

\`\`\`text
[1] Thought  我需要先读 src/user.ts 看 createUser 的实现
    Action   read_file("src/user.ts")
[2] Thought  函数校验了邮箱格式，没有写测试文件，先看 package.json 用什么测试框架
    Action   read_file("package.json")
[3] Thought  项目用 vitest，测试目录是 test/，我写一个 test/user.test.ts
    Action   write_file("test/user.test.ts", <内容>)
[4] Thought  跑一下测试看是否通过
    Action   run_command("npx vitest run test/user.test.ts")
[5] Thought  测试通过，任务完成
    Final    报告：已创建 test/user.test.ts，3 个用例全部通过
\`\`\`

整个流程里你没有输入任何东西，但每一步 Codex 都打印出来，你能看到它的"思路"。如果第 4 步测试失败，它会回到第 1 步重新思考，自己根据报错调整测试文件，而不是把锅甩给你。这就是"自主多步"的价值：**它把"一个任务"变成"一次提交"**，中间所有"读、写、跑、改"都由代理完成。

当然，自主多步不是万能的。它对模型的规划能力、对工具调用的稳定性要求很高，一旦模型在某一步走错，整个链条就可能跑偏。这也是为什么 Codex 设计了沙箱与审批机制——让你随时能踩刹车。

## 16.5 Codex 与 Claude Code 的对比

Codex CLI 与 Anthropic 的 Claude Code 是 2025 年最受关注的两款开源终端 AI 编程代理。它们的产品形态非常像（都是终端、都是代理、都有项目规则文件），但底层模型、配置体系、安全机制有显著差异。

下表从八个维度做对比。注意：两者的具体参数、价格、模型名都在持续演进，下表信息以 2026-07-05 时点的公开资料为基准，最新数据请以官方文档为准。

| 维度 | Codex CLI | Claude Code |
| --- | --- | --- |
| 维护方 | OpenAI | Anthropic |
| 底层模型 | OpenAI 系列（如 gpt-5-codex、o 系列等，以官方文档为准） | Claude 系列（如 Claude Sonnet/Opus 4.x） |
| 安装方式 | \`npm install -g @openai/codex\` | \`npm install -g @anthropic-ai/claude-code\` |
| 项目规则文件 | AGENTS.md | CLAUDE.md |
| 全局配置 | \`~/.codex/config.toml\`（TOML） | \`~/.claude/settings.json\`（JSON） |
| 沙箱机制 | 三档（read-only / workspace-write / danger-full-access） | 内置权限提示，无显式沙箱层级 |
| 计费方式 | ChatGPT 订阅扣量 或 API Key 按 token 计费 | Claude 订阅扣量 或 API Key 按 token 计费 |
| 开源协议 | Apache 2.0（以仓库 LICENSE 为准） | 开源（以仓库 LICENSE 为准） |

两者的核心差异在三点：

**第一，模型不同。** Codex 背后是 OpenAI 的模型，Claude Code 背后是 Claude。这导致它们在长上下文表现、代码风格、推理深度上有微妙差异。OpenAI 的 o 系列推理模型在多步规划上表现稳定，而 Claude 在"读大型仓库并准确改一个函数"这类任务上口碑很好。哪个更适合你的项目，建议用你自己的内部 Benchmark 测一测（评测方法见第 6 章）。

**第二，沙箱机制不同。** Codex 提供了显式的三档沙箱，你可以明确选择"让它只读"还是"让它能写工作区"。Claude Code 更依赖"操作前征求同意"的提示机制，没有 Codex 那种系统级的写隔离。在 CI/CD、远程开发等"必须安全"的场景里，Codex 的沙箱更可控。

**第三，生态与集成。** Codex 因为背靠 OpenAI，与 ChatGPT 订阅、OpenAI API、OpenAI 的其他企业产品集成更顺；Claude Code 与 Claude 订阅、Anthropic Console 打通更顺。如果你团队已经有某一家的企业合同，那一家对应的工具通常更划算。

需要强调：**这两款工具并非二选一**。不少团队的做法是同时装上 Codex 与 Claude Code，按任务类型分流。比如"从零搭建项目"用 Codex（多步规划强），"在大型仓库里精修一个函数"用 Claude Code（长上下文稳）。具体选型策略见第 10 章。

## 16.6 Codex 适合谁

Codex 不是所有人的最优解。基于一年的社区反馈与真实使用观察，下面这几类用户最容易从 Codex 里拿到收益。

**适合人群一：终端重度用户。** 如果你日常就在 tmux 里写代码、用 Vim/Neovim 做 IDE、SSH 到远程机器干活，Codex 跟你的工作流无缝衔接，而 IDE 类工具对你反而是负担。这类用户是 Codex 的"原住民"。

**适合人群二：远程与容器化开发者。** VS Code 的远程开发套件很强，但依然有大量场景是直接 ssh 进容器或服务器干活。Codex 只要 Node.js 22+ 就能跑，落地门槛极低。

**适合人群三：CI/CD 与自动化场景。** Codex 支持 API Key 模式与 \`--full-auto\` 等参数，可以塞进 GitHub Actions、GitLab CI 里跑"自动修 lint 错误""自动补测试"等任务。这是 IDE 类工具完全做不到的场景。

**适合人群四：喜欢"把任务丢给代理干完"的人。** 如果你更愿意花 5 分钟把需求写清楚，然后让代理干 20 分钟自己干别的，回来收成果——Codex 的工作模式就是为你设计的。相反，如果你更喜欢"逐行盯着 AI 写、写一行审一行"，IDE 类工具（Cursor、Copilot）可能更顺手。

**不太适合的人群**：完全的新手（建议先用 ChatGPT/Copilot 建立直觉，再来用代理）、对终端抗拒的人（Codex 的所有交互都在 shell 里，不喜欢终端会很痛苦）、对沙箱与权限完全不理解的团队（直接 \`--full-auto\` 跑可能引发事故）。

最后给一个落地的判断方法：**装上试一周**。Codex 装机成本很低（一条 npm 命令），免费额度足够你跑十几个真实任务。一周后你会清楚知道它是否匹配你的工作流。下一章我们会详细讲安装与配置，让你最快进入实战状态。
`,
    code: `// =============================================================
// 第16章示例：Codex 自主多步执行流程模拟器
// 演示一个"补单元测试"任务在 Codex 风格的代理循环里如何展开
// =============================================================

// ---- 任务定义 ----
// 模拟用户给 Codex 的真实任务
const task = {
  goal: "为 src/user.ts 的 createUser 函数补充边界测试",
  workspace: {
    "src/user.ts": \`
export function createUser(name, email) {
  if (!name) throw new Error("name required");
  if (!email || !email.includes("@")) throw new Error("invalid email");
  return { id: Math.random().toString(36).slice(2), name, email };
}
\`,
    "package.json": \`
{ "name": "demo", "devDependencies": { "vitest": "^1.0.0" } }
\`,
  },
};

// ---- 工具集（Codex 在沙箱里能调用的工具） ----
const tools = {
  read_file(path, ws) {
    return ws[path] !== undefined ? ws[path] : "[file not found]";
  },
  write_file(path, content, ws) {
    ws[path] = content;
    return "ok";
  },
  run_command(cmd, ws) {
    // 极简模拟：跑 vitest 时返回成功
    if (cmd.startsWith("npx vitest")) {
      // 如果测试文件不存在，命令失败
      if (!ws["test/user.test.ts"]) return "FAIL: no test file";
      return "3 passed | 3 total";
    }
    return "[command executed]";
  },
};

// ---- 代理循环 ----
// 每一步包含 thought / action / observation，直到 final
function runAgent(task) {
  const ws = { ...task.workspace };
  const steps = [];

  // 步骤 1：读源文件
  steps.push({
    step: 1,
    thought: "我需要先读 src/user.ts 看 createUser 的实现",
    action: 'read_file("src/user.ts")',
    observation: tools.read_file("src/user.ts", ws),
  });

  // 步骤 2：读 package.json 确认测试框架
  steps.push({
    step: 2,
    thought: "函数校验了 name 与 email，看 package.json 用什么测试框架",
    action: 'read_file("package.json")',
    observation: tools.read_file("package.json", ws),
  });

  // 步骤 3：写测试文件
  const testContent = [
    "import { describe, it, expect } from 'vitest';",
    "import { createUser } from '../src/user';",
    "",
    "describe('createUser', () => {",
    "  it('throws when name is empty', () => {",
    "    expect(() => createUser('', 'a@b.com')).toThrow('name required');",
    "  });",
    "  it('throws when email is empty', () => {",
    "    expect(() => createUser('tom', '')).toThrow('invalid email');",
    "  });",
    "  it('throws when email has no @', () => {",
    "    expect(() => createUser('tom', 'bad')).toThrow('invalid email');",
    "  });",
    "});",
    "",
  ].join("\\n");
  steps.push({
    step: 3,
    thought: "项目用 vitest，测试目录约定是 test/，写 test/user.test.ts",
    action: 'write_file("test/user.test.ts", <3 个用例>)',
    observation: tools.write_file("test/user.test.ts", testContent, ws),
  });

  // 步骤 4：跑测试
  steps.push({
    step: 4,
    thought: "跑一下测试看是否通过",
    action: 'run_command("npx vitest run test/user.test.ts")',
    observation: tools.run_command("npx vitest run test/user.test.ts", ws),
  });

  // 步骤 5：完成
  steps.push({
    step: 5,
    thought: "测试全部通过，任务完成",
    action: "final",
    observation: "已创建 test/user.test.ts，3 个用例全部通过",
  });

  return { steps, finalWorkspace: ws };
}

// ---- 执行并打印 ----
console.log("========================================");
console.log("  Codex 自主多步执行模拟器");
console.log("  任务：" + task.goal);
console.log("========================================\\n");

const { steps, finalWorkspace } = runAgent(task);

steps.forEach((s) => {
  console.log("[" + s.step + "] Thought");
  console.log("    " + s.thought);
  console.log("    Action: " + s.action);
  console.log("    Observation: " + s.observation);
  console.log("");
});

console.log("========================================");
console.log("  最终产物");
console.log("========================================");
console.log("test/user.test.ts 内容预览：");
console.log(finalWorkspace["test/user.test.ts"]);
console.log("\\n✅ 代理循环结束：1 个目标 → 5 个步骤 → 1 次提交。");
console.log("   注意每一步都包含 Thought/Action/Observation，这正是 agentic 的核心。");
`
  },

  {
    id: "aiapp-codex-install",
    icon: "⚙️",
    group: "Codex深度使用",
    title: "Codex 安装与配置",
    content: `
# 第17章：Codex 安装与配置

## 17.1 环境要求

在动手装 Codex 之前，先确认你的环境满足要求。Codex 是一个 Node.js 应用，对 Node 版本有最低要求；同时它的工作模式依赖 shell，所以操作系统也要支持。

**操作系统**：Codex 在 macOS、Linux、Windows（含 WSL）上都可运行。官方推荐在类 Unix 环境（macOS / Linux / WSL）下使用，体验最完整。纯 Windows（PowerShell 或 cmd）下部分沙箱特性会受限，建议用 WSL2。

**Node.js 版本**：要求 Node.js **22 或更高**。这是硬性要求，低版本会直接报错。可以用 \`node -v\` 查看当前版本，低于 22 的话用 nvm 升级：

\`\`\`bash
# 用 nvm 安装并切换到 Node 22 LTS
nvm install 22
nvm use 22
node -v   # 应输出 v22.x.x
\`\`\`

**包管理器**：Codex 通过 npm 分发，因此需要 npm（随 Node 自带）。你也可以用 pnpm、yarn、bun 等替代品，但官方文档示例统一用 npm，本章也以 npm 为准。

**网络**：安装与登录需要能访问 OpenAI 服务。在国内网络环境下，通常需要走代理。可以通过环境变量让 Codex 走代理：

\`\`\`bash
# 临时设置代理（举例，按你实际代理地址填写）
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890
\`\`\`

**账号**：你需要一个可用的 OpenAI 账号——要么是 ChatGPT 订阅（Plus/Team/Pro），要么是 OpenAI API 账号（有 API Key）。前者按订阅扣量，后者按 token 计费。两种登录方式的差异见 17.3。

## 17.2 安装命令

确认环境就绪后，安装只需要一条命令：

\`\`\`bash
# 全局安装 Codex CLI
npm install -g @openai/codex
\`\`\`

安装完成后，验证是否成功：

\`\`\`bash
# 查看版本
codex --version

# 查看帮助
codex --help
\`\`\`

如果 \`codex --version\` 能输出版本号，说明安装成功。如果系统提示找不到命令，通常是 npm 全局 bin 目录没在 \`PATH\` 里。可以用 \`npm bin -g\` 查到全局 bin 路径，然后把它加进你的 shell 配置（\`~/.zshrc\` 或 \`~/.bashrc\`）：

\`\`\`bash
# 把下面这行加进 ~/.zshrc 或 ~/.bashrc（路径以实际输出为准）
export PATH="$(npm bin -g):$PATH"
\`\`\`

升级 Codex 同样简单：

\`\`\`bash
npm update -g @openai/codex
\`\`\`

Codex 迭代很快，建议每隔一两周跑一次升级。新版本通常包含模型更新、bug 修复与新的命令参数。

## 17.3 首次登录

第一次运行 \`codex\` 时，它会引导你完成登录。Codex 支持两种登录方式：**ChatGPT 账号登录**与 **API Key 登录**。

**方式一：ChatGPT 账号登录（推荐个人用户）**。运行 \`codex\` 后选择"Log in with ChatGPT"，浏览器会打开 OpenAI 授权页，确认后回到终端即登录成功。这种方式把你已订阅的 ChatGPT 套餐（Plus/Team/Pro）作为额度来源，无需单独充值 API。优点是付费路径简单、与你的 ChatGPT 共享额度池；缺点是额度受订阅套餐上限约束，且当前账号必须能正常登录 ChatGPT 网页。

**方式二：API Key 登录（推荐自动化与团队场景）**。在 OpenAI 平台 <https://platform.openai.com/api-keys> 创建一个 API Key，复制后通过环境变量或交互输入交给 Codex。这种方式按 token 计费，没有"套餐上限"概念，适合 CI/CD、批量任务、团队共享等场景。缺点是需要单独管理 API Key 与额度。

两种登录方式的对比：

| 维度 | ChatGPT 账号 | API Key |
| --- | --- | --- |
| 计费方式 | 套餐内扣量 | 按 token 计费 |
| 适用场景 | 个人日常 | 自动化、CI/CD、团队 |
| 配置门槛 | 浏览器授权即可 | 需要创建并保管 Key |
| 额度上限 | 受套餐上限约束 | 受账户余额约束 |
| 安全风险 | 低（账号体系保护） | 中（Key 泄漏即盗用） |

如果当前终端是 SSH 远程，浏览器授权会不方便，Codex 通常会给你一段 URL 让你在本地浏览器打开，授权后把回调码粘贴回终端。如果实在没法用浏览器，可以改用 API Key 方式。

登录成功后，凭证会保存在 \`~/.codex/auth.json\` 里。这个文件包含你的访问令牌，**绝对不要提交到 git，也不要分享给别人**。建议在 \`~/.codex/\` 目录设置 \`chmod 700\`，并在所有项目仓库的 \`.gitignore\` 里确认不会误提交。

## 17.4 配置文件

Codex 的配置分两个文件：\`~/.codex/config.toml\`（用户级配置）与 \`~/.codex/auth.json\`（凭证）。前者是你调 Codex 行为的主战场，后者只存登录态。

\`\`\`bash
# Codex 配置目录结构
~/.codex/
├── config.toml     # 用户级配置（TOML 格式）
├── auth.json       # 登录凭证（敏感，勿外传）
└── AGENTS.md       # 全局 AGENTS.md（可选，见第 19 章）
\`\`\`

\`config.toml\` 用 TOML 格式（注意不是 JSON）。一个典型的初始配置长这样：

\`\`\`toml
# ~/.codex/config.toml 示例
model = "gpt-5-codex"            # 默认模型（以官方文档为准）
approval_policy = "on-request"   # 审批策略
sandbox_mode = "workspace-write" # 沙箱模式
\`\`\`

下面这张表列出 \`config.toml\` 里最常用的字段。完整字段列表请以官方文档为准，这里只覆盖日常调优最关键的几项。

| 字段 | 取值 | 作用 |
| --- | --- | --- |
| \`model\` | 模型名（如 gpt-5-codex、o 系列等） | 指定默认使用的模型 |
| \`approval_policy\` | never / on-request / on-failure / untrusted | 何时征求人工批准 |
| \`sandbox_mode\` | read-only / workspace-write / danger-full-access | 沙箱安全级别 |
| \`project_doc_max_bytes\` | 整数 | AGENTS.md 等项目文档的最大读取字节数 |
| \`history\` | 整数 | 保留多少条历史对话 |
| \`mcp_servers\` | 表 | 配置 MCP 服务器（详见第 21+ 章） |

**关键提醒**：\`model\` 字段的取值会随 OpenAI 模型迭代而变化，不要把书中举例的模型名当成"永远有效"。建议定期跑 \`codex /model\` 查看当前账号可用的模型清单，或参考官方仓库 README。

## 17.5 model 与 approval_policy 配置

\`model\` 与 \`approval_policy\` 是 \`config.toml\` 里调整最频繁的两个字段，值得单独展开。

**model**。Codex 默认会选一个"通用且稳定"的模型，但你可以显式指定。选模型的思路与第 10 章一致：日常任务用中等模型（速度快、便宜），复杂任务用强推理模型（慢、贵但更稳）。差别在于 Codex 是代理，多步执行会放大单次成本——一个 10 步任务用贵的模型，总成本可能是单次的 10 倍。建议在 \`config.toml\` 里把默认模型设成性价比高的那一个，遇到难任务时用 \`codex -m <强模型>\` 临时切换。

**approval_policy**。它决定 Codex 在什么时机停下来征求你批准。四档策略详见第 18 章 18.5 节，这里先给出建议：个人开发默认 \`on-request\`（仅沙箱外操作时询问），CI/CD 用 \`never\`（配合沙箱使用），新手用 \`untrusted\`（任何写操作都问）。配置示例：

\`\`\`toml
# 个人开发推荐配置
model = "gpt-5-codex"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

# CI/CD 场景推荐配置（更激进）
# model = "gpt-5-codex"
# approval_policy = "never"
# sandbox_mode = "workspace-write"
\`\`\`

## 17.6 Sandbox 模式详解

沙箱是 Codex 安全网的基石。理解三档沙箱的边界，是用好 Codex 的前提。

**read-only（只读）**。Codex 只能读文件、不能写文件，只能执行无副作用的命令（如 \`ls\`、\`cat\`、\`git status\`）。任何写操作（编辑文件、\`git commit\`、\`npm install\`）都会被拦下并征求你批准。适合"让 Codex 解释代码""让它定位 bug 但先别改"这类调研场景。最安全，但也最不能干活。

**workspace-write（工作区可写，默认）**。Codex 可以自由读写当前工作区（你启动 \`codex\` 时所在的目录及其子目录），可以执行命令，但工作区外的写操作仍需批准。这是日常开发的默认档：Codex 能改你的代码、跑你的测试，但不能动你的系统配置、不能写家目录、不能 \`rm -rf\` 工作区外的东西。一个安全的心理预期是"它最多把当前项目搞砸，不会把整台机器搞砸"。

**danger-full-access（完全访问）**。Codex 可以做任何事，没有边界。**极度慎用**。仅在以下场景才考虑：你完全信任任务来源（比如自己写的脚本）、你在隔离的容器/虚拟机里跑、你愿意承担任何后果。绝对不要在日常开发机上对生产仓库用这个档。

三档沙箱的安全边界对比如下：

| 沙箱模式 | 读文件 | 写工作区 | 写工作区外 | 执行命令 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| read-only | ✅ | ❌（需批准） | ❌（需批准） | 仅无副作用命令 | 代码调研、定位 bug |
| workspace-write | ✅ | ✅ | ❌（需批准） | ✅（敏感命令需批准） | 日常开发（默认） |
| danger-full-access | ✅ | ✅ | ✅ | ✅ 全部 | 隔离环境、自动化脚本 |

沙箱可以通过 \`config.toml\` 全局设置，也可以通过命令行参数临时覆盖：

\`\`\`bash
# 临时用 read-only 模式跑一次（不改 config.toml）
codex --sandbox read-only "解释 src/auth.ts 里的 token 校验逻辑"

# 临时用 danger-full-access（仅在隔离容器里这么做！）
codex --sandbox danger-full-access "重装依赖并跑全部测试"
\`\`\`

注意：沙箱不是"100% 防御"。它是"在合理使用下显著降低事故概率"的工程手段。任何沙箱都可能被精心构造的命令绕过，所以**不要用 danger-full-access 跑来路不明的 prompt**。

## 17.7 CI/CD 环境 API Key 配置

CI/CD 是 Codex 的高价值场景之一——让代理在流水线里自动修 lint、补测试、生成 PR 描述。在 CI 里用 Codex 的关键，是正确配置 API Key 与无交互参数。

**第一步：把 API Key 注入 CI 环境**。在 GitHub Actions、GitLab CI、Jenkins 等平台，都建议把 API Key 存为"加密变量"或"secret"，再通过环境变量传给 Codex。以 GitHub Actions 为例：

\`\`\`yaml
# .github/workflows/codex-lint-fix.yml
name: Codex Lint Fix
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  codex:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npm install -g @openai/codex
      - name: Run Codex
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
        run: |
          codex --auto-edit --sandbox workspace-write \\
                "修复 src 目录下所有 ESLint 报错，不要改业务逻辑"
          git diff
\`\`\`

注意：\`\${{ secrets.OPENAI_API_KEY }}\` 是 GitHub Actions 的 secret 注入语法（在 JS 模板字符串里需要把 \`$\` 转义为 \`\\$\`，本例是在 YAML 文件中直接写）。在你的真实 workflow 文件里，应写成 \`\${{ secrets.OPENAI_API_KEY }}\`。

**第二步：选对参数组合**。CI 是无交互环境，必须用不依赖人工确认的参数：

\`\`\`bash
# CI 推荐参数组合
codex \\
  --auto-edit \\                      # 自动应用编辑建议
  --sandbox workspace-write \\        # 限制只能写当前仓库
  -a on-failure \\                    # 仅在失败时询问（CI 里会跳过）
  "你的任务描述"
\`\`\`

**第三步：限制成本**。CI 里跑 Codex 最容易翻车的是"模型跑嗨了，账单爆炸"。建议：

1. 在 \`config.toml\` 里用便宜模型做默认，CI 里也用同一份配置；
2. 给 CI 任务加超时（\`timeout-minutes: 10\`）；
3. 只在特定触发条件下跑（比如带 \`codex\` label 的 PR）；
4. 每周 review 一次 CI 的 OpenAI 用量，发现异常及时止损。

**第四步：日志与可观测**。CI 里 Codex 的输出一定要落盘成 artifact，方便事后排查。建议加 \`--json\` 之类的结构化输出参数（具体参数名以官方文档为准），把每一步的 thought/action/observation 都收集起来，万一代理干错了能复盘。

最后强调一条**铁律**：CI 里的 Codex 永远不要用 \`danger-full-access\`。即便任务跑不通，也比把仓库或 runner 搞崩要好。CI 是"重复执行"的环境，一次事故会被无限放大。
`,
    code: `// =============================================================
// 第17章示例：Codex 配置校验与沙箱安全检查器
// 模拟读取 ~/.codex/config.toml 与 CI 参数，给出安全建议
// =============================================================

// ---- 模拟配置文件 ----
// 真实场景下应使用 TOML 解析库（如 @iarna/toml），这里用对象演示
const userConfig = {
  model: "gpt-5-codex",
  approval_policy: "on-request",
  sandbox_mode: "workspace-write",
};

// ---- 模拟 CI 调用参数 ----
const ciArgs = {
  autoEdit: true,
  sandbox: "workspace-write",
  approval: "on-failure",
  fullAuto: false,
  timeoutMinutes: 10,
};

// ---- 沙箱安全等级 ----
// 数字越大表示越激进
const SANDBOX_LEVEL = {
  "read-only": 1,
  "workspace-write": 2,
  "danger-full-access": 3,
};

// ---- 配置校验函数 ----
function validateConfig(cfg) {
  const issues = [];

  // 1. 必填字段检查
  if (!cfg.model) issues.push("缺少 model 字段，Codex 会用默认模型，建议显式指定");
  if (!cfg.approval_policy) issues.push("缺少 approval_policy，建议设为 on-request");
  if (!cfg.sandbox_mode) issues.push("缺少 sandbox_mode，默认 workspace-write，建议显式声明");

  // 2. 合法值检查
  const validApproval = ["never", "on-request", "on-failure", "untrusted"];
  if (cfg.approval_policy && !validApproval.includes(cfg.approval_policy)) {
    issues.push("approval_policy 取值非法：" + cfg.approval_policy);
  }
  const validSandbox = ["read-only", "workspace-write", "danger-full-access"];
  if (cfg.sandbox_mode && !validSandbox.includes(cfg.sandbox_mode)) {
    issues.push("sandbox_mode 取值非法：" + cfg.sandbox_mode);
  }

  // 3. 危险组合检查
  if (cfg.sandbox_mode === "danger-full-access" && cfg.approval_policy === "never") {
    issues.push("⚠️ 危险组合：danger-full-access + never，等于完全放权，强烈不推荐");
  }

  return issues;
}

// ---- CI 安全检查 ----
function checkCI(args) {
  const risks = [];

  // 1. CI 里绝对不要用 danger-full-access
  if (args.sandbox === "danger-full-access") {
    risks.push("🚨 CI 里使用 danger-full-access，强烈建议改为 workspace-write");
  }

  // 2. --full-auto 在 CI 里风险高
  if (args.fullAuto) {
    risks.push("⚠️ --full-auto 在 CI 里风险高，建议改用 --auto-edit + 明确沙箱");
  }

  // 3. 必须有超时
  if (!args.timeoutMinutes || args.timeoutMinutes > 30) {
    risks.push("⚠️ 建议设置 timeout-minutes，且不超过 30 分钟，防止账单爆炸");
  }

  // 4. CI 里 approval 应该是 on-failure 或 never（不会真问）
  if (args.approval === "on-request" || args.approval === "untrusted") {
    risks.push("⚠️ CI 无交互，approval=on-request/untrusted 会导致代理卡住，改用 on-failure 或 never");
  }

  return risks;
}

// ---- 综合建议 ----
function generateReport(cfg, args) {
  const configIssues = validateConfig(cfg);
  const ciRisks = checkCI(args);
  const level = SANDBOX_LEVEL[cfg.sandbox_mode] || 0;

  return { configIssues, ciRisks, sandboxLevel: level };
}

// ---- 执行 ----
console.log("========================================");
console.log("  Codex 配置与 CI 安全检查");
console.log("========================================\\n");

console.log("【用户配置 ~/.codex/config.toml】");
console.log(JSON.stringify(userConfig, null, 2));
console.log("\\n【CI 调用参数】");
console.log(JSON.stringify(ciArgs, null, 2));
console.log("");

const report = generateReport(userConfig, ciArgs);

console.log("【配置校验结果】");
if (report.configIssues.length === 0) {
  console.log("  ✅ 配置无问题");
} else {
  report.configIssues.forEach((i) => console.log("  - " + i));
}

console.log("\\n【CI 安全检查】");
if (report.ciRisks.length === 0) {
  console.log("  ✅ CI 参数安全");
} else {
  report.ciRisks.forEach((r) => console.log("  - " + r));
}

console.log("\\n【沙箱等级】");
console.log("  当前：" + userConfig.sandbox_mode + "（等级 " + report.sandboxLevel + "/3）");
if (report.sandboxLevel >= 3) {
  console.log("  🚨 处于最高风险档，仅在隔离容器里使用");
} else if (report.sandboxLevel === 2) {
  console.log("  🟡 工作区可写，是日常开发推荐档");
} else {
  console.log("  🟢 只读模式，最安全");
}

console.log("\\n✅ 检查完毕。每次升级 Codex 后建议重跑此检查，避免参数漂移。");
`
  },

  {
    id: "aiapp-codex-usage",
    icon: "📜",
    group: "Codex深度使用",
    title: "Codex 命令详解",
    content: `
# 第18章：Codex 命令详解

## 18.1 交互模式

Codex 最常用的形态是交互模式（REPL）。在任意项目目录里执行 \`codex\`（不带任何参数），就会进入交互式终端界面：

\`\`\`bash
# 进入交互模式
cd ~/projects/my-app
codex
\`\`\`

进入后你会看到一个分屏界面：上半部分是 Codex 的"思考与行动"日志，下半部分是输入框。你在输入框里写任务，回车后 Codex 开始执行，整个过程实时刷新。需要中断时按 \`Ctrl+C\`，需要退出时输入 \`/quit\` 或按 \`Ctrl+D\`。

交互模式适合"多轮迭代"的任务——你给一个目标，Codex 做一部分后你看到结果，再追加指令。比如：

\`\`\`text
你：把 src/utils.js 里的所有函数加上 JSDoc 注释
[Codex 执行若干步，给出改动预览]
你：formatDate 那个函数注释里把参数格式说明白一点
[Codex 继续修改]
你：跑一遍测试确认没破坏
[Codex 跑 npx vitest run，输出结果]
\`\`\`

交互模式的好处是**上下文连续**——Codex 记得前面几轮你说过什么、改过什么，不需要你重复贴上下文。这也是日常开发最推荐的工作方式。

## 18.2 一次性模式

如果你只想让 Codex 干一件事然后退出，用一次性模式：把任务作为参数传给 \`codex\`：

\`\`\`bash
# 一次性模式：执行完即退出
codex "给 src/user.ts 的 createUser 函数补单元测试"

# 配合管道：从 stdin 读任务
echo "解释 src/auth.ts 里的 token 校验逻辑" | codex
\`\`\`

一次性模式适合"单步任务"和"脚本集成"。比如你写一个 shell 脚本，依次让 Codex 处理三个文件：

\`\`\`bash
#!/bin/bash
for f in src/a.ts src/b.ts src/c.ts; do
  codex --sandbox workspace-write "给 $f 加上 TypeScript 类型注解，不要改逻辑"
done
\`\`\`

一次性模式不会保留上下文，每次调用都是独立的。如果你需要多轮交互，请回到交互模式。

## 18.3 常用命令

进入交互模式后，以 \`/\` 开头的是 Codex 的内置命令。下面是最常用的几个，完整命令清单请用 \`/help\` 查看。

**\`/init\`**：在当前项目里初始化 \`AGENTS.md\`。Codex 会扫描你的项目结构、\`package.json\` 等，生成一份 AGENTS.md 草稿，你后续手动完善。第一次在新项目里用 Codex 强烈建议先跑一次 \`/init\`。

**\`/model\`**：查看或切换当前会话使用的模型。不带参数时列出可选模型，带参数时切换。比如 \`/model gpt-5-codex\` 切到指定模型（具体模型名以官方文档为准）。

**\`/approvals\`**：查看或切换当前审批策略。不带参数显示当前策略，带参数切换：\`/approvals on-request\`、\`/approvals never\` 等。策略含义见 18.5。

**\`/status\`**：显示当前会话状态——用了多少 token、当前模型、当前沙箱、本次会话已执行多少步。在长会话里定期看一下，避免成本失控。

**\`/diff\`**：显示 Codex 当前会话对工作区做的所有改动（一个汇总 diff）。在确认提交前必跑，看看 Codex 到底动了哪些文件。

**\`/clear\`**：清空当前会话上下文。适合"前面跑偏了，想重新开始"的场景。注意：\`/clear\` 不撤销已写入的文件改动，要回滚用 \`/undo\` 或 \`git checkout\`。

**\`/review\`**：让 Codex 自己 review 它刚才做的改动，挑潜在问题。这是"让代理自查"的快捷方式，不能替代人工 review，但能拦下大部分低级错误。

**\`/undo\`**：撤销 Codex 最近一次写操作。如果 Codex 一次会话改了好几个文件，\`/undo\` 通常逐次撤销，每按一次回退一步。

\`\`\`text
/init         生成 AGENTS.md 草稿
/model        切换模型
/approvals    切换审批策略
/status       查看会话状态（token/步数）
/diff         查看本次会话的全部改动
/clear        清空上下文（不撤销文件）
/review       让 Codex 自查改动
/undo         撤销最近一次写操作
/help         查看全部命令
/quit         退出
\`\`\`

## 18.4 命令行参数

除了内置命令，\`codex\` 命令本身还支持一系列参数，用于在启动时覆盖配置。下面是最常用的几个。

**\`-m, --model <name>\`**：指定本次会话使用的模型，覆盖 \`config.toml\` 里的 \`model\` 字段。

\`\`\`bash
codex -m gpt-5-codex "你的任务"
\`\`\`

**\`-a, --approval <policy>\`**：指定审批策略，覆盖 \`approval_policy\`。取值见 18.5。

\`\`\`bash
codex -a on-failure "跑测试，失败的话自己修"
\`\`\`

**\`--sandbox <mode>\`**：指定沙箱模式，覆盖 \`sandbox_mode\`。

\`\`\`bash
codex --sandbox read-only "解释这个项目的架构"
\`\`\`

**\`--auto-edit\`**：自动应用 Codex 的文件编辑建议，不每次询问。适合你大致信任 Codex 的判断、想加快节奏的场景。注意它不影响"沙箱外的写操作"——那些仍按审批策略处理。

**\`--full-auto\`**：完全自动模式，等于 \`--auto-edit\` + \`-a never\`。Codex 会一路跑到底，不停下来问你任何事。**风险极高**，详见 18.6。

\`\`\`bash
# 高风险：仅在隔离环境用
codex --full-auto "重写整个 src 目录，用 TypeScript"
\`\`\`

**\`--json\`**：以 JSON 格式输出每一步的 thought/action/observation，便于程序化处理（CI、日志收集等）。具体字段名以官方文档为准。

**\`--version\` / \`--help\`**：查版本与帮助。

参数可以组合使用。下面是一个典型的"个人开发快节奏"组合：

\`\`\`bash
codex --auto-edit -a on-failure --sandbox workspace-write "给 user 模块补测试"
\`\`\`

## 18.5 approval_policy 四档

审批策略决定 Codex 何时停下来等你按回车。四档从最严到最松分别是：

**\`untrusted\`**：最严。Codex 的**任何写操作或命令执行**都要先问你。适合你在试用 Codex、还不信任它的判断时；也适合让 Codex 在敏感仓库里"只动一处"的精细任务。代价是会频繁打断，节奏慢。

**\`on-request\`**：默认。Codex 在沙箱内自由操作，遇到沙箱外的写操作（写工作区外文件、执行有副作用的系统命令）才问你。日常开发推荐这一档，平衡了效率与安全。

**\`on-failure\`**：只在 Codex 自己跑失败时才问你（比如测试没过、命令报错）。沙箱内一路放行。适合"我大致信任任务，但希望出问题时能介入"的场景，比如跑测试自动修。

**\`never\`**：最松。Codex 永不停下来问你，能做什么就做什么，直到任务结束或被你 \`Ctrl+C\`。**必须配合沙箱使用**——单独用 \`never\` 等于把仓库交给代理自由发挥，事故概率很高。CI/CD 场景下通常用 \`never\` + \`workspace-write\` 组合。

四档对比：

| 策略 | 沙箱内写 | 沙箱外写 | 命令执行 | 失败时 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| untrusted | 问 | 问 | 问 | 问 | 试用、敏感仓库 |
| on-request | 自由 | 问 | 自由（敏感命令问） | 自由 | 日常开发（默认） |
| on-failure | 自由 | 问 | 自由 | 问 | 自动修测试 |
| never | 自由 | 自由 | 自由 | 自由 | CI/CD（配沙箱） |

切换策略有三种方式：在 \`config.toml\` 里设 \`approval_policy\`、用 \`-a\` 参数启动时指定、在交互模式里用 \`/approvals\` 切换。三者优先级是"命令行参数 > 交互命令 > config.toml"。

## 18.6 --full-auto 的风险与防护

\`--full-auto\` 是 Codex 里"最快但最危险"的模式。它等价于 \`--auto-edit\` + \`-a never\`，让 Codex 完全不停顿地跑到底。一旦任务描述有歧义、或 Codex 理解偏了，它会在没人看的情况下连续做错好几步。

典型翻车场景：

1. **过度修改**。你让它"优化 user 模块"，它可能顺手把整个 \`src/\` 都重写一遍，因为"看起来都能优化"。
2. **删错文件**。你让它"清理无用代码"，它可能把"看起来没用但其实在动态调用的文件"删掉。
3. **跑危险命令**。你让它"重装依赖"，它可能跑 \`rm -rf node_modules && npm install\`，在没沙箱的情况下还可能波及其他目录。
4. **成本爆炸**。无人值守的多步执行，可能跑几十甚至上百步，单次任务成本飙升到几美元甚至更多。

防护建议：

**第一，永远配沙箱**。\`--full-auto\` 必须配合 \`--sandbox workspace-write\`（或更严的 \`read-only\`）。绝对不要 \`--full-auto --sandbox danger-full-access\` 组合，那是"让代理自由搞垮机器"。

**第二，在隔离环境跑**。把 \`--full-auto\` 任务放进 Docker 容器或虚拟机里，即便代理跑飞了也只损失一个容器。

**第三，限制任务范围**。任务描述里明确边界，比如"只修改 src/user/ 目录下的文件，不要动其他目录"。Codex 对明确的边界指令通常能遵守。

**第四，设超时与成本上限**。在 CI 里用 \`timeout\` 命令包一层：

\`\`\`bash
# 最多跑 10 分钟
timeout 600 codex --full-auto --sandbox workspace-write "你的任务"
\`\`\`

**第五，事后必跑 \`/diff\` 与 \`/review\`**。即便用了 \`--full-auto\`，事后也要看 Codex 到底改了什么，发现异常立刻 \`git checkout\` 回滚。

**第六，从最严格的策略逐步放宽**。第一次跑某个任务时用 \`-a on-request\` 看一遍 Codex 的判断，确认无误后下次再升级到 \`-a on-failure\`，最后才是 \`--full-auto\`。不要一上来就 \`--full-auto\`。

## 18.7 输出查看

Codex 的输出分三种：思考日志、行动日志、观察日志。理解它们的格式有助于快速判断 Codex 在干什么。

**思考日志（Thought）**：通常以浅色或斜体显示，是 Codex 自己的"内心独白"，告诉你它下一步打算做什么、为什么。看思考日志能判断 Codex 有没有跑偏。

**行动日志（Action）**：以高亮显示，是 Codex 实际调用的工具，比如 \`read_file\`、\`write_file\`、\`run_command\`。每次行动都对应一次真实的文件或命令操作。

**观察日志（Observation）**：以普通颜色显示，是工具的返回值。比如读文件返回文件内容、跑命令返回 stdout。

长任务里这些日志会刷屏，建议用 \`tmux\` 或终端的回滚功能回看。CI 场景下用 \`--json\` 输出，事后用 \`jq\` 之类的工具过滤分析。

\`\`\`bash
# CI 里把 Codex 输出落盘成 JSON 日志
codex --json "你的任务" > codex.log.json

# 事后看 Codex 都改了哪些文件
jq '.[] | select(.type=="action" and .tool=="write_file") | .path' codex.log.json
\`\`\`

具体 JSON 字段名以官方文档为准，这里只演示思路。

## 18.8 撤销与回滚

代理会犯错，所以撤销机制很重要。Codex 提供两道防线。

**第一道：\`/undo\`**。在交互模式里，\`/undo\` 撤销 Codex 最近一次写操作。如果 Codex 改了多个文件，连续 \`/undo\` 会逐次回退。\`/undo\` 的优点是细粒度，缺点是只能回退 Codex 的写操作，对 Codex 执行的 \`git commit\` 等命令无能为力。

**第二道：\`git\`**。\`git\` 是终极兜底。在跑 Codex 前，建议先 \`git stash\` 或新建一个分支：

\`\`\`bash
# 跑 Codex 前先建分支
git checkout -b codex/experiment
codex "你的任务"

# 如果 Codex 改得太离谱，直接弃分支
git checkout main
git branch -D codex/experiment

# 如果只想回退部分，用 git checkout 恢复单个文件
git checkout HEAD -- src/user.ts
\`\`\`

养成"跑 Codex 前先 commit 或建分支"的习惯，能让你在代理翻车时从容应对。这比依赖 \`/undo\` 可靠得多——\`/undo\` 只能撤最近一次，而 \`git\` 能回到任意历史点。

## 18.9 与 git 集成

Codex 与 git 的集成是它"能干工程活"的关键。常见用法有四种。

**用法一：让 Codex 在新分支上工作**。直接在 prompt 里告诉它：

\`\`\`text
请先 git checkout -b feat/user-test，然后在新分支上补 user 模块的测试
\`\`\`

Codex 会自己执行 \`git\` 命令，把所有改动隔离在新分支上。

**用法二：让 Codex 生成 commit message**。改动完成后：

\`\`\`text
git add -A，然后帮我写 commit message，符合 Conventional Commits 规范
\`\`\`

Codex 会 \`git diff --cached\` 看改动，然后给你一段 commit message。注意：让它"写 message"和"直接 commit"是两回事。建议先让它写、你审一遍，再让它执行 \`git commit\`。

**用法三：让 Codex 处理 merge 冲突**：

\`\`\`text
当前分支有 merge 冲突，请解决 src/ 下所有冲突，保留两边的业务逻辑
\`\`\`

Codex 会读冲突文件、理解两边意图、生成解决后的版本。处理完记得跑一遍测试。

**用法四：让 Codex 写 PR 描述**：

\`\`\`text
基于当前分支相对 main 的 diff，写一份 PR 描述，包含"改了什么/为什么改/如何测试"
\`\`\`

Codex 跑 \`git diff main...HEAD\`，把 diff 喂给自己，生成结构化 PR 描述。

**重要原则**：永远不要让 Codex 直接 \`git push\` 或 \`git push --force\`，除非你完全清楚后果。代理直接 push 到共享分支是事故高发场景。建议把"是否允许 push"作为一条禁令写进 AGENTS.md（详见第 19 章）。

至此，Codex 的命令体系就讲完了。下一章我们深入 AGENTS.md——这是让 Codex 真正"懂你项目"的关键配置，掌握它之后 Codex 才会从"通用代理"变成"团队工程师"。
`,
    code: `// =============================================================
// 第18章示例：Codex 命令参数解析与审批策略模拟器
// 演示如何把命令行参数映射到运行时行为，并模拟审批流程
// =============================================================

// ---- 模拟命令行参数 ----
const argv = [
  "--auto-edit",
  "-a", "on-failure",
  "--sandbox", "workspace-write",
  "-m", "gpt-5-codex",
  "给 user 模块补单元测试",
];

// ---- 参数解析 ----
function parseArgs(argv) {
  const opts = {
    autoEdit: false,
    fullAuto: false,
    approval: "on-request",     // 默认
    sandbox: "workspace-write", // 默认
    model: null,                // null 表示用 config.toml 的默认
    task: "",
  };

  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--auto-edit") { opts.autoEdit = true; i++; }
    else if (a === "--full-auto") { opts.fullAuto = true; opts.autoEdit = true; opts.approval = "never"; i++; }
    else if (a === "-a" || a === "--approval") { opts.approval = argv[i + 1]; i += 2; }
    else if (a === "--sandbox") { opts.sandbox = argv[i + 1]; i += 2; }
    else if (a === "-m" || a === "--model") { opts.model = argv[i + 1]; i += 2; }
    else { opts.task = a; i++; }
  }
  return opts;
}

// ---- 审批策略表 ----
const POLICY = {
  untrusted:   { sandboxWrite: "ask", outsideWrite: "ask", cmd: "ask",      onFailure: "ask"  },
  "on-request":{ sandboxWrite: "free",outsideWrite: "ask", cmd: "free-ask", onFailure: "free" },
  "on-failure":{ sandboxWrite: "free",outsideWrite: "ask", cmd: "free-ask", onFailure: "ask"  },
  never:       { sandboxWrite: "free",outsideWrite: "free",cmd: "free",     onFailure: "free" },
};

// ---- 模拟一次代理执行 ----
function simulateRun(opts) {
  const policy = POLICY[opts.approval];
  const steps = [];

  // 步骤 1：读文件（无副作用，永远自由）
  steps.push({ step: 1, action: "read_file", result: "free", note: "读取始终自由" });

  // 步骤 2：写文件（沙箱内）
  const writeDecision = opts.sandbox === "workspace-write" ? policy.sandboxWrite : "ask";
  steps.push({
    step: 2,
    action: "write_file (沙箱内)",
    result: writeDecision,
    note: writeDecision === "free" ? "沙箱内自动写入" : "需人工确认",
  });

  // 步骤 3：跑测试
  steps.push({
    step: 3,
    action: "run_command: npx vitest run",
    result: policy.cmd === "free" ? "free" : (policy.cmd === "free-ask" ? "free" : "ask"),
    note: "测试命令一般自由执行",
  });

  // 步骤 4：测试失败，尝试修复（on-failure 才会问）
  steps.push({
    step: 4,
    action: "fix failing test",
    result: policy.onFailure,
    note: policy.onFailure === "ask" ? "失败时停下询问" : "失败时自动继续",
  });

  // 步骤 5：尝试 git commit（沙箱外，按策略）
  steps.push({
    step: 5,
    action: "run_command: git commit",
    result: policy.outsideWrite,
    note: policy.outsideWrite === "ask" ? "需人工确认（推荐）" : "全自动（危险）",
  });

  return steps;
}

// ---- 执行 ----
console.log("========================================");
console.log("  Codex 命令参数解析与审批模拟");
console.log("========================================\\n");

const opts = parseArgs(argv);
console.log("【解析后的参数】");
console.log(JSON.stringify(opts, null, 2));
console.log("");

console.log("【风险检查】");
if (opts.fullAuto && opts.sandbox === "danger-full-access") {
  console.log("  🚨 极度危险：--full-auto + danger-full-access，停止执行");
} else if (opts.fullAuto && opts.sandbox === "workspace-write") {
  console.log("  ⚠️ 高风险：--full-auto 建议在隔离环境使用");
} else if (opts.autoEdit) {
  console.log("  🟡 中风险：--auto-edit 加快节奏，注意 /diff 检查");
} else {
  console.log("  🟢 低风险：常规模式");
}
console.log("");

console.log("【模拟代理执行（按 " + opts.approval + " 策略）】");
console.log("-".repeat(64));
const steps = simulateRun(opts);
steps.forEach((s) => {
  const tag = s.result === "free" ? "[自由]" : s.result === "ask" ? "[询问]" : "[" + s.result + "]";
  console.log("  步骤 " + s.step + " " + tag.padEnd(8) + s.action);
  console.log("           " + s.note);
});
console.log("-".repeat(64));

console.log("\\n✅ 模拟完成。实际使用时，每一步 [询问] 都会暂停等你按回车确认。");
`
  },

  {
    id: "aiapp-codex-agents",
    icon: "📄",
    group: "Codex深度使用",
    title: "AGENTS.md 配置详解",
    content: `
# 第19章：AGENTS.md 配置详解

## 19.1 AGENTS.md 是什么

AGENTS.md 是 Codex 的**项目规则文件**——一份写给 Codex 看的"项目说明书"。当 Codex 在某个项目目录启动时，它会自动寻找并读取该目录（及其上级目录）里的 AGENTS.md，把内容作为"这个项目的约定"注入到当前会话的上下文里。Codex 在执行任务时，会参考这些约定来决定技术选型、命名风格、目录结构、禁区行为。

AGENTS.md 的角色，与 Cursor 里的 \`.cursor/rules\`、Claude Code 里的 \`CLAUDE.md\` 完全一致。它们解决的是同一个问题：**通用大模型不懂你项目的私有约定，需要一份文件告诉它**。没有 AGENTS.md，Codex 会用"训练数据里最常见的做法"——比如你明明用 vitest 它却给你写 jest 测试、你明明用 pnpm 它却跑 npm install。有了 AGENTS.md，Codex 会按你声明的规矩来。

一个常见的误解是"AGENTS.md 等于 README"。两者面向的读者完全不同：README 给人看，介绍项目是干嘛的、怎么用；AGENTS.md 给 AI 代理看，告诉它在这个项目里干活要遵守什么。AGENTS.md 里通常包含 README 里不会写的内容——比如"禁止使用 default export""测试文件必须放在源文件同目录""commit message 不许带 emoji"。这些是"给协作者的内部规矩"，恰好也是 AI 代理最容易踩坑的地方。

\`\`\`text
README      ──>  给人看：项目是什么、怎么用
AGENTS.md   ──>  给 AI 看：在这个项目里干活要守什么规矩
两者互补，不互相替代
\`\`\`

## 19.2 文件位置

Codex 在启动时会从多个位置查找 AGENTS.md，并把它们按优先级合并。理解查找顺序，是配置 AGENTS.md 的第一步。

**位置一：项目根目录**。\`<project-root>/AGENTS.md\`。这是最常用的位置，所有在这个项目里干活的 Codex 会话都会读它。99% 的场景下你只需要这一份。

**位置二：子目录**。\`<project-root>/some-dir/AGENTS.md\`。当 Codex 进入 \`some-dir\` 子目录干活时（比如你在 \`src/components/\` 下让它改代码），它会额外读这个子目录的 AGENTS.md，叠加到根目录的规则上。适合"某个子模块有特殊约定"的场景，比如 \`src/legacy/\` 目录允许用旧风格代码、其他目录必须用新风格。

**位置三：全局**。\`~/.codex/AGENTS.md\`。这是你个人的全局规则，所有项目都会读。适合放"我个人对所有项目的偏好"——比如"我习惯用 2 空格缩进""我习惯 commit message 用中文"。

**位置四：父级目录**。Codex 也会向上查找父目录的 AGENTS.md。这在 monorepo 里很有用——你可以在 monorepo 根目录放一份 AGENTS.md，所有子项目都继承它。

查找顺序（从高优先级到低优先级）：

\`\`\`text
1. 当前工作子目录的 AGENTS.md        （最具体）
2. 上级目录的 AGENTS.md               （逐级向上）
3. 项目根目录的 AGENTS.md
4. ~/.codex/AGENTS.md                 （全局，最宽泛）
\`\`\`

当多个层级的 AGENTS.md 同时存在时，Codex 会**合并**它们而不是覆盖。合并规则见 19.4。

## 19.3 推荐内容结构

一份高质量的 AGENTS.md，应该覆盖以下六个板块。每一块都不是必须的，但建议都写——少写一块，Codex 就可能在那一块上自由发挥，而它的"自由发挥"未必符合你的预期。

**板块一：项目简介**。一两句话说明这是什么项目、解决什么问题。这能帮 Codex 在执行任务时建立正确的"业务上下文"。比如"这是一个面向中小企业的内部 HR 系统，后端 Express + PostgreSQL，前端 Next.js"。

**板块二：技术栈**。明确列出语言、框架、库、运行时、包管理器。这是 Codex 最容易踩坑的地方——不写清楚它就会用"训练数据里最常见的同类工具"。比如：

\`\`\`text
- 语言：TypeScript（strict 模式）
- 后端：Node.js 22 + Express 5
- 前端：Next.js 15（App Router）
- 数据库：PostgreSQL 16 + Prisma
- 测试：Vitest
- 包管理：pnpm（不要用 npm 或 yarn）
\`\`\`

**板块三：目录结构**。给 Codex 一份"地图"，告诉它什么文件放哪里。这能避免它把测试写到 src 里、把组件放到 pages 里。比如：

\`\`\`text
src/
  app/          Next.js App Router 页面与路由
  components/   可复用 React 组件
  lib/          工具函数与业务逻辑
  server/       后端 API 路由
test/           测试文件，镜像 src/ 的结构
prisma/         Prisma schema 与 migrations
\`\`\`

**板块四：构建与测试命令**。明确告诉 Codex "怎么跑构建""怎么跑测试""怎么 lint"。这比让它猜要可靠得多。比如：

\`\`\`text
- 安装依赖：pnpm install
- 跑开发服务器：pnpm dev
- 跑测试：pnpm test
- 跑 lint：pnpm lint
- 类型检查：pnpm typecheck
- 构建：pnpm build
\`\`\`

**板块五：代码风格**。列出团队约定。这部分对 AI 代理尤其重要——AI 不会自动遵守你团队的 ESLint 配置，除非你明确告诉它。比如：

\`\`\`text
- 使用 2 空格缩进，不混用 tab
- 不使用 default export，统一用 named export
- 字符串统一用单引号
- 函数式优先，避免 class
- 所有公开函数必须有 JSDoc 注释
- 提交前必须通过 pnpm lint 与 pnpm typecheck
\`\`\`

**板块六：禁止行为**。明确告诉 Codex **不能做什么**。这部分是"事故防火墙"，能把高危操作提前拦下。比如：

\`\`\`text
- 禁止修改 prisma/migrations/ 下已存在的迁移文件
- 禁止使用 any 类型，必要时用 unknown 并收窄
- 禁止 git push 或 git push --force
- 禁止修改 .env 文件
- 禁止引入新的第三方依赖，必须先在 issue 里讨论
\`\`\`

\`\`\`text
项目简介  ──>  业务上下文
技术栈    ──>  别用错工具
目录结构  ──>  文件放对位置
构建命令  ──>  别瞎跑命令
代码风格  ──>  按团队规范写
禁止行为  ──>  别碰红线
\`\`\`

## 19.4 嵌套 AGENTS.md 的合并规则

当多个层级的 AGENTS.md 同时存在时，Codex 会合并它们。合并不是简单的"后者覆盖前者"，而是按主题叠加——具体规则会因版本而异，以官方文档为准，但大致遵循以下原则。

**原则一：具体优先于宽泛**。子目录的规则比父目录的更具体，冲突时以子目录为准。比如根目录说"使用 named export"，子目录 \`src/legacy/\` 说"允许 default export"，则在 \`src/legacy/\` 里 Codex 会允许 default export。

**原则二：禁止行为叠加**。父目录的禁止行为在子目录依然生效，除非子目录明确解除。比如根目录说"禁止引入新依赖"，子目录不能默认允许，必须显式写"本目录允许引入新依赖"才生效。

**原则三：技术栈不冲突时合并**。多个层级的"技术栈"声明如果不冲突，Codex 会把它们都记住。比如全局说"2 空格缩进"，项目说"TypeScript strict"，两者无冲突，Codex 都遵守。

实际操作中，建议**只在必要时用嵌套 AGENTS.md**。多数项目根目录一份就够了，过度嵌套会让规则难以追踪，自己也忘了哪份写了什么。

## 19.5 与全局 config.toml 的优先级

AGENTS.md 与 \`config.toml\` 是两类配置，作用维度不同：

- \`config.toml\` 控制 Codex **运行时行为**——模型、审批策略、沙箱、超时等。它是"工具该怎么跑"。
- AGENTS.md 控制 Codex **任务执行约定**——技术栈、目录结构、代码风格等。它是"在项目里该怎么干"。

两者基本不冲突，各管一摊。但当它们冲突时，优先级大致是：

\`\`\`text
命令行参数  >  交互命令（/model 等）  >  项目 AGENTS.md  >  全局 ~/.codex/AGENTS.md  >  config.toml
\`\`\`

需要特别注意：AGENTS.md **不能覆盖** \`config.toml\` 里的安全设置。比如你在 AGENTS.md 里写"本项目的沙箱模式用 danger-full-access"，Codex 不会因此把沙箱调到 danger——安全相关的设置只能通过 \`config.toml\` 或命令行参数显式调整。这是一个有意的设计：AGENTS.md 是会被 Codex 写入甚至自动生成的文件，如果它能改安全设置，就等于让代理自己给自己开后门。

\`\`\`text
config.toml   ──>  工具该怎么跑（含安全设置，AGENTS.md 改不了）
AGENTS.md     ──>  在项目里该怎么干（业务约定，Codex 会遵守）
两者分工清晰，不要混用
\`\`\`

## 19.6 实战示例：一个 Next.js 项目的 AGENTS.md

下面是一个真实可用的 AGENTS.md 示例，针对一个 Next.js + Prisma + PostgreSQL 的中等规模项目。你可以基于它改造出自己的版本。

\`\`\`markdown
# AGENTS.md

## 项目简介

这是一个面向中小企业的内部 HR 系统，包含员工档案、考勤、薪资计算三个模块。
后端用 Next.js Route Handlers，前端用 App Router，数据库 PostgreSQL。

## 技术栈

- 语言：TypeScript（strict 模式，禁止 any）
- 框架：Next.js 15（App Router，不用 Pages Router）
- 数据库：PostgreSQL 16 + Prisma 5
- 认证：NextAuth v5
- 测试：Vitest + Playwright（E2E）
- 包管理：pnpm（不要用 npm 或 yarn）
- Node.js 22+

## 目录结构

src/
  app/             Next.js App Router 页面与路由
    (auth)/        认证相关路由组
    (dashboard)/   登录后业务路由组
  components/      可复用 React 组件
    ui/            基础 UI 组件（Button、Input 等）
  lib/             工具函数与业务逻辑
  server/          后端 API 与数据访问层
    api/           Route Handlers
    db/            Prisma 查询封装
test/              单元测试，镜像 src/ 结构
e2e/               Playwright E2E 测试
prisma/
  schema.prisma    数据模型
  migrations/      迁移文件（禁止修改已存在的）

## 构建与测试命令

- 安装依赖：pnpm install
- 跑开发服务器：pnpm dev
- 跑测试：pnpm test
- 跑单个测试：pnpm test <文件路径>
- 跑 E2E：pnpm test:e2e
- Lint：pnpm lint
- 类型检查：pnpm typecheck
- 构建：pnpm build
- Prisma 生成客户端：pnpm prisma generate
- 创建新迁移：pnpm prisma migrate dev --name <迁移名>

## 代码风格

- 2 空格缩进，不混用 tab
- 字符串统一用单引号
- 不使用 default export，统一用 named export
- 函数式优先，避免 class
- 所有公开函数必须有 JSDoc 注释，标注参数与返回值
- React 组件用函数式 + hooks，不用 class component
- Prisma 查询必须封装在 src/server/db/ 下，不要在组件里直接调 Prisma
- 提交前必须通过 pnpm lint、pnpm typecheck、pnpm test

## 禁止行为

- 禁止修改 prisma/migrations/ 下已存在的迁移文件
- 禁止使用 any 类型，必要时用 unknown 并收窄
- 禁止 git push、git push --force、git reset --hard
- 禁止修改 .env、.env.local 等环境变量文件
- 禁止引入新的第三方依赖，必须先在 issue 里讨论
- 禁止在 src/app/ 里直接写数据库查询，必须走 src/server/db/
- 禁止删除已有的测试用例，只能补充或修改
\`\`\`

这份 AGENTS.md 不长（约 80 行），但覆盖了所有关键板块。把它放在项目根目录后，Codex 在这个项目里的所有任务都会遵守这些约定。

## 19.7 最佳实践清单

最后给一份 AGENTS.md 的最佳实践清单，按优先级排序。

**1. 先跑 \`/init\`，再人工完善**。新项目里第一次用 Codex，先跑 \`codex\` 进入交互模式，输入 \`/init\`，让 Codex 扫描项目结构生成草稿。草稿会覆盖 70% 的内容，你只需要补全代码风格与禁止行为两个板块。比从零写快得多。

**2. 禁止行为写得越具体越好**。"禁止修改迁移文件"比"不要乱改"有效得多。AI 代理对"具体可识别"的指令遵守度远高于"模糊善意"的指令。

**3. 用命令的真实名字**。写 \`pnpm test\` 而不是"跑测试"、写 \`pnpm prisma migrate dev\` 而不是"创建迁移"。Codex 会直接执行这些命令，写错名字它就会跑错命令。

**4. 定期更新**。技术栈升级、目录调整、新增禁令后，同步更新 AGENTS.md。一份过期的 AGENTS.md 比没有 AGENTS.md 更糟——它会让 Codex 按错误约定干活。

**5. 把 AGENTS.md 纳入代码 review**。AGENTS.md 是团队共识的载体，任何修改都应该走 PR review，不能某个人偷偷改。

**6. 不要把 AGENTS.md 写成小说**。控制在 200 行以内，超过就说明你在写文档而不是写规则。AI 代理读太长的规则文件，注意力会下降，关键条款反而容易被忽略。

**7. 测试 Codex 是否遵守**。改完 AGENTS.md 后，跑一个"违反规则的诱惑性任务"测试它——比如让它"引入 lodash 来处理数组"，看它是否遵守"禁止引入新依赖"。如果它没遵守，说明条款写得不够明确，需要加强。

**8. 全局 AGENTS.md 只放个人偏好**。\`~/.codex/AGENTS.md\` 里只写"我个人的通用偏好"，不要写项目相关的东西。项目相关的内容放项目根目录的 AGENTS.md。

\`\`\`text
/init 生成草稿  ──>  人工补全禁令与风格  ──>  定期 review  ──>  测试 Codex 是否遵守
\`\`\`

掌握 AGENTS.md 之后，Codex 就不再是一个"通用代理"，而是一个"懂你项目规矩的工程师"。下一章我们进入实战，用 5 个完整场景把前面所有知识串起来。
`,
    code: `// =============================================================
// 第19章示例：AGENTS.md 加载与规则校验器
// 模拟 Codex 启动时合并多层级 AGENTS.md，并对任务做规则检查
// =============================================================

// ---- 模拟全局 AGENTS.md（~/.codex/AGENTS.md） ----
const globalAgents = {
  indent: "2 spaces",
  quote: "single",
  exportStyle: "named",
};

// ---- 模拟项目根 AGENTS.md ----
const projectAgents = {
  stack: ["TypeScript", "Next.js 15", "Prisma 5", "PostgreSQL"],
  packageManager: "pnpm",
  testCmd: "pnpm test",
  lintCmd: "pnpm lint",
  forbidden: [
    "修改 prisma/migrations/ 下已存在的迁移文件",
    "使用 any 类型",
    "git push",
    "引入新的第三方依赖",
  ],
};

// ---- 模拟子目录 src/legacy/ AGENTS.md ----
const legacyAgents = {
  // legacy 目录允许 default export（覆盖全局 named 约定）
  exportStyle: "default-allowed",
  // legacy 目录允许 any（覆盖项目禁令）
  forbidden: ["修改 prisma/migrations/ 下已存在的迁移文件", "git push"],
};

// ---- 合并多层级 AGENTS.md ----
// 简化规则：子目录覆盖同名键，forbidden 取并集（子目录可显式移除）
function mergeAgents(...layers) {
  const merged = { forbidden: new Set() };
  for (const layer of layers) {
    for (const key of Object.keys(layer)) {
      if (key === "forbidden") {
        layer.forbidden.forEach((f) => merged.forbidden.add(f));
      } else {
        merged[key] = layer[key]; // 子目录覆盖父级
      }
    }
  }
  merged.forbidden = Array.from(merged.forbidden);
  return merged;
}

// ---- 任务规则检查 ----
function checkTask(task, agents) {
  const warnings = [];

  // 检查是否要引入新依赖
  if (/install\\s+(npm|yarn|pnpm)\\s+(-D\\s+)?[\\w@/-]+/i.test(task)) {
    if (agents.forbidden.includes("引入新的第三方依赖")) {
      warnings.push("🚫 任务可能引入新依赖，但项目禁止");
    }
  }

  // 检查是否要 git push
  if (/git\\s+push/i.test(task)) {
    if (agents.forbidden.includes("git push")) {
      warnings.push("🚫 任务包含 git push，被禁止");
    }
  }

  // 检查是否要修改 migrations
  if (/prisma\\/migrations/i.test(task)) {
    if (agents.forbidden.includes("修改 prisma/migrations/ 下已存在的迁移文件")) {
      warnings.push("🚫 任务可能修改已有迁移文件，被禁止");
    }
  }

  // 检查是否使用 any
  if (/\\bany\\b/.test(task) && agents.forbidden.includes("使用 any 类型")) {
    warnings.push("⚠️ 任务提到 any，项目禁止使用 any，请用 unknown");
  }

  return warnings;
}

// ---- 执行 ----
console.log("========================================");
console.log("  AGENTS.md 多层级合并与规则检查");
console.log("========================================\\n");

// 场景 1：在项目根目录干活
console.log("【场景 1：在项目根目录干活】");
const rootMerged = mergeAgents(globalAgents, projectAgents);
console.log("  合并后的规则：");
console.log("  - 缩进：" + rootMerged.indent);
console.log("  - 引号：" + rootMerged.quote);
console.log("  - export：" + rootMerged.exportStyle);
console.log("  - 包管理：" + rootMerged.packageManager);
console.log("  - 禁止：" + rootMerged.forbidden.join(" / "));

const task1 = "请帮我 npm install lodash，然后在 src/utils.ts 里用 any 写一个工具函数，最后 git push";
console.log("\\n  任务：" + task1);
const w1 = checkTask(task1, rootMerged);
w1.forEach((w) => console.log("  " + w));

// 场景 2：在 src/legacy/ 子目录干活
console.log("\\n【场景 2：在 src/legacy/ 子目录干活】");
const legacyMerged = mergeAgents(globalAgents, projectAgents, legacyAgents);
console.log("  合并后的规则（legacy 覆盖）：");
console.log("  - export：" + legacyMerged.exportStyle + "（legacy 允许 default）");
console.log("  - 禁止：" + legacyMerged.forbidden.join(" / "));
console.log("  （注意：any 禁令被 legacy 移除，因为 legacy 子目录显式覆盖了 forbidden）");

const task2 = "在 src/legacy/old.ts 里用 any 类型重构一段代码";
console.log("\\n  任务：" + task2);
const w2 = checkTask(task2, legacyMerged);
if (w2.length === 0) {
  console.log("  ✅ 通过规则检查（legacy 目录允许 any）");
} else {
  w2.forEach((w) => console.log("  " + w));
}

console.log("\\n✅ 演示结束。真实场景下 Codex 会在执行前做类似检查，违反禁令时主动拒绝或询问。");
`
  },

  {
    id: "aiapp-codex-workflow",
    icon: "🎬",
    group: "Codex深度使用",
    title: "Codex 实战工作流",
    content: `
# 第20章：Codex 实战工作流

前面三章我们讲了 Codex 的安装、命令与配置。本章把这些知识串起来，用 5 个完整实战场景演示 Codex 在真实工程里怎么用。每个场景包含：任务背景、prompt 模板、预期 Codex 输出、人工验收要点。

## 20.1 场景一：从零创建一个 Express API

**任务背景**。你需要快速搭一个内部用的 Express API，提供用户增删改查接口。要求 TypeScript、统一错误处理、带基本单元测试。如果手动搭，至少 1 小时；用 Codex 可以在 10 分钟内拿到能跑的脚手架。

**前置准备**。先建一个空目录并初始化 git，再启动 Codex：

\`\`\`bash
mkdir demo-express-api && cd demo-express-api
git init
codex
\`\`\`

**Prompt 模板**：

\`\`\`text
请从零创建一个 Express API 项目，要求：
1. TypeScript（strict 模式），Node.js 22+
2. 用 pnpm 作为包管理器
3. Express 5，路由放在 src/routes/，业务逻辑放在 src/services/
4. 提供 /api/users 的 GET / POST / PUT / DELETE 五个接口
5. 用 zod 做请求体校验
6. 统一错误处理中间件，错误响应格式 { error: { code, message } }
7. Vitest 单元测试，覆盖 services 层
8. 提供 README.md，说明如何安装与运行
9. 提供 .env.example，列出 PORT、NODE_ENV 等环境变量

完成后跑一遍 pnpm test 与 pnpm build 确认能通过。
\`\`\`

**预期 Codex 输出**。Codex 会按多步执行：先 \`pnpm init\` 与安装依赖，再依次创建 \`tsconfig.json\`、\`src/app.ts\`、\`src/routes/users.ts\`、\`src/services/users.ts\`、\`src/middleware/error.ts\`、\`test/users.test.ts\`、\`README.md\`、\`.env.example\`，最后跑 \`pnpm test\` 与 \`pnpm build\` 验证。一个典型的输出片段：

\`\`\`text
[1] Thought  需要先初始化项目与安装依赖
    Action   run_command: pnpm init
    Action   run_command: pnpm add express zod
    Action   run_command: pnpm add -D typescript vitest @types/express @types/node tsx
[2] Thought  创建 tsconfig.json，启用 strict
    Action   write_file("tsconfig.json", <内容>)
[3] Thought  创建错误处理中间件与路由
    Action   write_file("src/middleware/error.ts", <内容>)
    Action   write_file("src/routes/users.ts", <内容>)
    Action   write_file("src/services/users.ts", <内容>)
    Action   write_file("src/app.ts", <内容>)
[4] Thought  写单元测试
    Action   write_file("test/users.test.ts", <内容>)
[5] Thought  跑测试与构建验证
    Action   run_command: pnpm test
    Action   run_command: pnpm build
[6] Final   项目已创建，3 个测试全部通过，构建成功
\`\`\`

**人工验收要点**：
1. \`pnpm test\` 与 \`pnpm build\` 真的能通过（Codex 可能虚报）。
2. 路由文件是否真的用了 zod 校验，而不是空 import。
3. 错误中间件是否真的被挂载（\`app.use(errorHandler)\`）。
4. README 是否准确，能否照着跑起来。
5. \`tsconfig.json\` 是否真的开了 strict。

## 20.2 场景二：给现有项目加测试

**任务背景**。你接手了一个老项目，核心模块 \`src/utils/format.ts\` 有 200 行代码、十几个函数，但没有任何测试。你不敢重构，想先用 Codex 补一套单元测试，建立安全网。

**Prompt 模板**：

\`\`\`text
请为 src/utils/format.ts 里的所有导出函数补充单元测试，要求：
1. 测试文件放在 test/utils/format.test.ts，与源文件镜像
2. 用项目现有的 Vitest，不要引入新的测试框架
3. 每个函数至少覆盖：正常输入、边界输入（空/null/undefined）、异常输入
4. 不要修改源文件，只写测试
5. 测试跑通后，报告覆盖率（用 vitest --coverage）

如果某个函数的行为无法从代码推断（比如依赖外部状态），停下来问我。
\`\`\`

**预期 Codex 输出**。Codex 会先读 \`format.ts\` 与 \`package.json\`（确认测试框架），分析每个函数，再写测试文件，最后跑 \`vitest run --coverage\`。如果某个函数依赖外部状态，Codex 会在交互模式里停下问你。

\`\`\`text
[1] Thought  先读源文件了解有哪些导出函数
    Action   read_file("src/utils/format.ts")
[2] Thought  有 12 个导出函数，确认测试框架
    Action   read_file("package.json")
[3] Thought  项目用 vitest，开始写测试
    Action   write_file("test/utils/format.test.ts", <12 个 describe 块>)
[4] Thought  发现 formatCurrency 依赖 Intl.NumberFormat，跨平台行为可能不一致
    Action   ask_user: "formatCurrency 依赖 Intl，Node 22 在不同 ICU 数据下行为可能不同，是否需要 mock？"
[5] Thought  你回复"用 en-US locale 固定下来即可"，继续
    Action   edit_file("test/utils/format.test.ts", <加 locale: 'en-US'>)
[6] Thought  跑测试与覆盖率
    Action   run_command: "npx vitest run --coverage")
[7] Final   12 个函数全部覆盖，36 个用例全通过，行覆盖率 94%
\`\`\`

**人工验收要点**：
1. 覆盖率报告里每个函数的行覆盖率是否真的过 80%（不是只看总数）。
2. 边界用例是否真的覆盖了空/null/undefined，而不是只测了 happy path。
3. 测试是否真的没改源文件（\`git diff src/\` 应该为空）。
4. 跨平台相关的函数（Intl、Date、时区）是否固定了 locale/timezone。
5. 有没有"为通过而通过"的空断言（\`expect(x).toBe(x)\` 这种）。

## 20.3 场景三：批量重构遗留代码

**任务背景**。项目里 \`src/legacy/\` 目录有 20 个 JavaScript 文件，全是 5 年前写的 callback 风格代码，没有类型、没有错误处理。你想把它们统一改成 async/await + TypeScript，但工作量巨大，手动改至少 3 天。

**Prompt 模板**：

\`\`\`text
请把 src/legacy/ 目录下所有 .js 文件重构成 .ts，要求：
1. 把 callback 风格改成 async/await
2. 添加 TypeScript 类型，参数与返回值都要标注，禁止 any
3. 保留原有业务逻辑，不要"顺手优化"算法
4. 文件名保持不变，只改扩展名
5. 每改一个文件，跑一遍 pnpm typecheck 与 pnpm test，确保不破坏
6. 改完后，在 src/legacy/REFACTOR.md 里写一份重构报告，列出每个文件的改动摘要

如果某个文件的逻辑太混乱无法安全重构，跳过并在报告里说明。
\`\`\`

**预期 Codex 输出**。Codex 会逐个文件处理：读原文件、转 TS、跑 typecheck、跑 test、下一个。遇到无法安全重构的，跳过并记录。最后生成 \`REFACTOR.md\`。

\`\`\`text
[1] Thought  先列出 src/legacy/ 下所有 .js 文件
    Action   run_command: ls src/legacy/*.js
[2] Thought  共 20 个文件，从 user.js 开始
    Action   read_file("src/legacy/user.js")
    Action   write_file("src/legacy/user.ts", <async/await 版本>)
    Action   delete_file("src/legacy/user.js")
    Action   run_command: pnpm typecheck && pnpm test
[3] Thought  user.ts 通过，继续 order.js
    ...
[18] Thought  payment.js 逻辑太混乱（多处全局变量 + 隐式共享状态），跳过
    Action   skip("src/legacy/payment.js")
[19] Thought  继续剩余文件
    ...
[21] Thought  全部完成，写重构报告
    Action   write_file("src/legacy/REFACTOR.md", <报告>)
[22] Final   20 个文件，19 个成功重构，1 个跳过（payment.js）
\`\`\`

**人工验收要点**：
1. \`git diff --stat\` 看改动文件数与新增行数，确认与报告一致。
2. 跑 \`pnpm typecheck\` 与 \`pnpm test\`，确认全部通过。
3. 抽查 3~5 个文件，对比重构前后行为是否一致（重点看 callback 里的错误分支是否被正确转成 try/catch）。
4. 看 \`REFACTOR.md\` 里跳过的文件，人工 review 这些文件，决定是否手动处理。
5. 检查有没有引入 \`any\`（\`grep -r "any" src/legacy/\`）。

## 20.4 场景四：定位并修复一个 bug

**任务背景**。生产环境报错"用户在结算页点击'确认支付'后，偶发性跳回登录页"。QA 复现了几次但没规律。你拿到这个任务，需要用 Codex 帮你定位并修复。

**Prompt 模板**：

\`\`\`text
生产环境有个 bug：用户在结算页（/checkout）点"确认支付"后，偶发性跳回登录页（/login）。

请帮我定位：
1. 读 src/app/checkout/ 与 src/app/login/ 下的代码
2. 找出所有可能导致"跳回登录页"的代码路径
3. 重点检查：认证中间件、token 刷新逻辑、结算页的 API 调用错误处理
4. 给出最可能的根因假设（按概率排序），并对每个假设给出代码证据
5. 找到根因后，给出修复方案，但不要直接改代码，等我确认

已知：QA 复现概率约 10%，似乎与"用户停留结算页超过 5 分钟"相关。
\`\`\`

**预期 Codex 输出**。Codex 会读相关代码，找出多条跳转路径，结合"5 分钟"线索定位到 token 刷新逻辑里的 timeout 问题。

\`\`\`text
[1] Thought  先看结算页与登录页的代码结构
    Action   run_command: ls src/app/checkout src/app/login
    Action   read_file("src/app/checkout/page.tsx")
    Action   read_file("src/app/login/page.tsx")
[2] Thought  结算页调用 /api/checkout，看认证中间件
    Action   read_file("src/middleware.ts")
    Action   read_file("src/server/api/checkout.ts")
[3] Thought  发现认证中间件用 NextAuth，token 5 分钟过期，看 NextAuth 配置
    Action   read_file("src/lib/auth.ts")
[4] Thought  发现 session strategy 是 jwt，jwtExpires 是 5 分钟
[5] Thought  用户停留超过 5 分钟时，点击支付触发 /api/checkout，中间件检测到 jwt 过期，重定向到 /login
    Action   给出根因假设：
      假设 A（高概率）：jwtExpires=5min，用户停留超 5 分钟后 jwt 过期，被中间件重定向
        证据：src/lib/auth.ts:12 jwtExpires: 60*5
              src/middleware.ts:8 if (!session) redirect('/login')
      假设 B（低概率）：支付接口报错被全局错误处理捕获，错误处理重定向到 /login
        证据：src/server/api/checkout.ts:23 catch(e){ redirect('/login') }
[6] Final   最可能根因是假设 A。建议方案：
        1. 把 jwtExpires 调到 30 分钟（治标）
        2. 在结算页加 token 刷新逻辑，用户停留时定期刷新
        3. 在 /api/checkout 返回 401 而不是 redirect，前端拦截后弹"重新登录"对话框
      请确认要采用哪个方案，我再动手改。
\`\`\`

**人工验收要点**：
1. Codex 给出的"代码证据"是否真的存在（\`grep\` 一下确认）。
2. 是否考虑了其他可能的根因（不要被第一个假设带偏）。
3. 修复方案是否覆盖了"治标"与"治本"，而不是只改一个数字。
4. 改完后必须在测试环境复现 bug 场景（停留 5 分钟以上），确认不再跳转。
5. 改动是否引入新风险（比如把 jwtExpires 调太长会带来安全问题）。

## 20.5 场景五：写一份技术文档

**任务背景**。你做完了一个内部 SDK，但还没写文档，团队成员抱怨"不会用"。你让 Codex 帮你起草一份技术文档，省下自己写的时间。

**Prompt 模板**：

\`\`\`text
请为 src/sdk/ 下的代码写一份技术文档 docs/SDK.md，要求：
1. 先读 src/sdk/ 下所有文件，理解 SDK 的能力与 API
2. 文档结构：概述 / 快速开始 / API 参考 / 常见问题 / 版本历史
3. API 参考部分，每个导出函数都要有：签名、参数说明、返回值、示例代码、注意事项
4. 示例代码必须真实可运行（用项目里的真实类型，不要编造）
5. 快速开始部分，给出一个最小可运行的 5 行代码示例
6. 常见问题部分，预测 3~5 个用户可能遇到的问题并给出解答
7. 版本历史部分，读 CHANGELOG.md（如果存在）后整理

写完后，跑一遍 pnpm typecheck 确认示例代码里的类型没错。
\`\`\`

**预期 Codex 输出**。Codex 会读 SDK 源码、读 CHANGELOG、生成结构化文档、再用 typecheck 验证示例代码。

\`\`\`text
[1] Thought  先了解 SDK 有哪些导出
    Action   run_command: ls src/sdk/
    Action   read_file("src/sdk/index.ts")
[2] Thought  逐个读核心模块
    Action   read_file("src/sdk/client.ts")
    Action   read_file("src/sdk/types.ts")
    Action   read_file("src/sdk/errors.ts")
[3] Thought  看 CHANGELOG
    Action   read_file("CHANGELOG.md")
[4] Thought  起草文档
    Action   write_file("docs/SDK.md", <完整文档>)
[5] Thought  验证示例代码类型
    Action   run_command: pnpm typecheck
[6] Final   文档已生成，约 350 行，包含 8 个 API、5 个示例、4 个常见问题
\`\`\`

**人工验收要点**：
1. 文档里每个 API 的签名是否与代码一致（容易抄错）。
2. 示例代码是否真的能跑通（手动复制一段到 playground 试）。
3. 是否覆盖了所有公开导出（对比 \`src/sdk/index.ts\` 的 export 列表）。
4. "常见问题"是否真的常见，还是 Codex 编的（团队 review 一下）。
5. 版本历史是否与 CHANGELOG 一致。

## 20.6 五个场景的共性与经验

回顾这五个场景，可以总结出几条用 Codex 干活通用经验。

**经验一：任务描述要具体**。每个 prompt 都明确了"用什么工具""放哪个目录""覆盖什么场景""跑什么命令验证"。具体到这个程度，Codex 才不会跑偏。模糊的 prompt（比如"帮我搞一下用户模块"）几乎一定翻车。

**经验二：先读后写**。所有场景里 Codex 的第一步都是读代码、读配置，而不是直接动手。你也可以把这个习惯内置到 prompt 里——"先读 X，再开始"——能显著降低误解。

**经验三：分阶段验证**。每个场景都以"跑测试/typecheck/build"结尾。这不是装饰，是安全网。让 Codex 自己跑验证，比让你事后手动验更高效，也能让 Codex 在验证失败时自己修。

**经验四：让人工验收标准化**。每个场景都列了"人工验收要点"。把验收清单写下来，逐条核对，能避免"看着挺对就合了"的偷懒。AI 代理的输出质量参差，人工验收是质量底线。

**经验五：高风险操作让人确认**。场景一里"完成后跑测试"、场景四里"找到根因后不要直接改代码"——这些"刹车点"是 prompt 的关键。在 prompt 里明确"什么时候停下来问我"，能避免 Codex 跑飞。

\`\`\`text
具体 prompt   ──>  先读后写  ──>  分阶段验证  ──>  标准化验收  ──>  关键点刹车
\`\`\`

## 20.7 小结

到这里，Codex 深度使用组的 5 章就全部讲完了。从第 16 章的"是什么"，到第 17 章的"怎么装"，到第 18 章的"怎么用命令"，到第 19 章的"怎么配规则"，到本章的"怎么干实战"——这 5 章合起来，覆盖了从入门到能上手干真活的完整路径。

需要强调的是，Codex 仍然在快速演进——模型会更新、命令会调整、参数会增减。本组的所有具体参数都标注了"以官方文档为准"，遇到不一致时请优先信任官方仓库 <https://github.com/openai/codex>。把本组内容当作"思路与方法论"来读，把官方文档当作"具体参数表"来查，两者配合使用效果最好。

下一批章节我们将进入另一个主题。在继续之前，建议你按本章 5 个场景的顺序，在自己项目里跑一遍 Codex——哪怕只是简化版的，亲手跑过一遍，比读十遍书都管用。
`,
    code: `// =============================================================
// 第20章示例：Codex 实战工作流编排器
// 演示如何把 5 个实战场景编排成可追踪的工作流
// =============================================================

// ---- 5 个实战场景定义 ----
const scenarios = [
  {
    id: 1,
    name: "从零创建 Express API",
    prompt: "创建 Express + TS + Vitest 项目骨架",
    steps: ["pnpm init", "安装依赖", "创建 tsconfig", "创建路由", "创建测试", "跑 test+build"],
    verify: ["pnpm test 通过", "pnpm build 通过", "路由用了 zod 校验"],
    risk: "低（新项目，无历史包袱）",
  },
  {
    id: 2,
    name: "给现有项目加测试",
    prompt: "为 src/utils/format.ts 补单元测试",
    steps: ["读源文件", "确认测试框架", "写测试", "跑 coverage"],
    verify: ["覆盖率 > 80%", "边界用例齐全", "未改源文件"],
    risk: "低（只加测试，不动逻辑）",
  },
  {
    id: 3,
    name: "批量重构遗留代码",
    prompt: "把 src/legacy/ 的 .js 重构成 .ts（async/await）",
    steps: ["列文件", "逐个转换", "typecheck+test", "写 REFACTOR.md"],
    verify: ["typecheck 通过", "test 通过", "无 any", "抽查行为一致"],
    risk: "高（动业务代码，需逐文件验证）",
  },
  {
    id: 4,
    name: "定位并修复 bug",
    prompt: "结算页点击支付偶发跳回登录页",
    steps: ["读相关代码", "列出根因假设", "等用户确认", "改代码", "复现验证"],
    verify: ["假设有代码证据", "测试环境复现通过", "无新风险引入"],
    risk: "高（生产 bug，改错会扩大事故）",
  },
  {
    id: 5,
    name: "写技术文档",
    prompt: "为 src/sdk/ 写 docs/SDK.md",
    steps: ["读源码", "读 CHANGELOG", "起草文档", "typecheck 验证示例"],
    verify: ["API 签名一致", "示例可运行", "覆盖所有导出"],
    risk: "低（只写文档，不动代码）",
  },
];

// ---- 风险分级 ----
function riskLevel(s) {
  if (s.risk.startsWith("高")) return 3;
  if (s.risk.startsWith("中")) return 2;
  return 1;
}

// ---- 生成执行计划 ----
function planScenario(s) {
  return {
    name: s.name,
    totalSteps: s.steps.length,
    verifyCount: s.verify.length,
    risk: s.risk,
    riskLevel: riskLevel(s),
    needsHumanConfirm: s.steps.includes("等用户确认") || riskLevel(s) >= 3,
    recommendedApproval: riskLevel(s) >= 3 ? "on-request" : "on-failure",
    recommendedSandbox: "workspace-write",
  };
}

// ---- 执行 ----
console.log("========================================");
console.log("  Codex 实战工作流编排器");
console.log("========================================\\n");

const plans = scenarios.map(planScenario);

console.log("【场景概览】");
console.log(
  "ID".padStart(4) +
    "场景名".padEnd(28) +
    "步数".padStart(6) +
    "验收".padStart(6) +
    "风险".padStart(6) +
    "推荐策略".padStart(14)
);
console.log("-".repeat(70));
plans.forEach((p, i) => {
  console.log(
    (i + 1).toString().padStart(4) +
    p.name.padEnd(28) +
    p.totalSteps.toString().padStart(6) +
    p.verifyCount.toString().padStart(6) +
    ("⬣".repeat(p.riskLevel)).padStart(6) +
    p.recommendedApproval.padStart(14)
  );
});

console.log("\\n【高风险场景详细计划】");
plans.filter((p) => p.riskLevel >= 3).forEach((p) => {
  console.log("\\n  ▶ " + p.name);
  console.log("    风险：" + p.risk);
  console.log("    推荐审批策略：" + p.recommendedApproval + "（每步都问）");
  console.log("    推荐沙箱：" + p.recommendedSandbox);
  console.log("    需要人工确认节点：" + (p.needsHumanConfirm ? "是" : "否"));
  console.log("    关键原则：先读后写、分阶段验证、关键点刹车");
});

console.log("\\n【通用经验】");
console.log("  1. 任务描述要具体（用什么工具/放哪/覆盖什么场景/怎么验证）");
console.log("  2. 先读后写：第一步永远是读代码、读配置");
console.log("  3. 分阶段验证：每个场景都以跑 test/typecheck/build 结尾");
console.log("  4. 标准化验收：列验收清单，逐条核对");
console.log("  5. 关键点刹车：高风险操作让 Codex 停下问人");

console.log("\\n✅ 5 个场景编排完毕。Codex 深度使用组 5 章到此结束。");
`
  }
];
