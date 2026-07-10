// =============================================================
// Python 部署与运维实战教程 —— 第 1 批章节（Git 版本控制 6 章）
// -------------------------------------------------------------
// 覆盖：Git 基础概念 → 日常工作流 → 分支管理 → 高级操作
//       → 配置与别名 → 提交规范与最佳实践
// =============================================================

export const chapters = [
  {
    id: "deploy-git-basics",
    icon: "📦",
    title: "Git 基础概念与安装",
    group: "Git 版本控制",
    content: `# Git 基础概念与安装

## 一、为什么必须学会 Git

在正式动手之前，先回答一个根本问题：**为什么部署与运维教程的第一章是 Git？**

因为现代软件交付的源头就是代码仓库。无论是你独自写一个 Python 脚本，还是团队协作开发一个 Web 服务，最终上线都要经历这样一条链路：

\`\`\`text
写代码 → 提交到 Git 仓库 → 推送到远程（GitHub/GitLab）
       → CI 流水线自动测试 → 构建镜像 → 部署到服务器
\`\`\`

这条链路里，Git 是"第一道关卡"。如果你不会提交、不会回滚、不会解决冲突，后面所有的部署自动化都无从谈起。很多新手在生产环境出了事故，第一反应是"我能不能把代码改回去"——这就是版本控制要解决的核心问题。

### 1.1 一个真实的翻车场景

假设你在写一个 Flask 接口，原本运行得好好的，你改了几行代码想优化性能，结果服务直接 500 了。你慌了，想恢复到改之前的状态，但你不记得原来怎么写的，因为没备份。

\`\`\`bash
# 没有 Git 的世界：靠手动复制文件备份
cp app.py app.py.bak        # 改之前先备份（你能记得每次都做吗？）
vim app.py                  # 修改
python app.py               # 运行报错
cp app.py.bak app.py        # 恢复（但 .bak 可能已经被覆盖了）
\`\`\`

这种"复制粘贴 + 改名备份"的方式有几个致命缺陷：

- **无法回到任意历史版本**：你只有一份 .bak，改两次就丢了中间状态。
- **无法多人协作**：两个人同时改 app.py，合并时只能手动比对，极易出错。
- **无法追溯"谁在什么时候为什么改了这行"**：出问题时互相甩锅。
- **无法并行开发多个功能**：A 功能没写完，又要紧急修 B bug，代码搅在一起。

Git 就是为了彻底解决这些问题而生的。它像一台"时光机"，记录你代码的每一次改动，让你随时穿越到任何一个历史时刻。

---

## 二、版本控制是什么：从本地到分布式

版本控制（Version Control System, VCS）是一种记录文件内容变化、以便将来查阅特定版本修订情况的系统。它的发展经历了三个阶段。

### 2.1 第一代：本地版本控制（Local VCS）

最原始的方式，很多人其实自己发明过：把每次改动的文件按日期命名存起来。

\`\`\`text
我的项目/
├── app_20240101.py
├── app_20240115.py
├── app_20240201_final.py
├── app_20240201_final_真的final.py
└── app_20240201_final_真的final_不改了.py
\`\`\`

这种"人肉版本控制"的痛点显而易见。后来出现了像 RCS（Revision Control System）这样的本地版本控制工具，它通过在本地维护一个补丁文件（记录每次改动的内容）来实现版本回溯。

\`\`\`text
RCS 的工作方式：
- 在本地保存一个 ",v" 文件，记录每次 diff（差异）
- 想恢复某版本？按 diff 反向计算
- 缺点：只能本地用，无法协作
\`\`\`

### 2.2 第二代：集中式版本控制（Centralized VCS, CVCS）

代表产品：**SVN（Subversion）**、CVS、Perforce。

集中式版本控制引入了"中央服务器"的概念：所有代码历史都存在一台服务器上，开发者从服务器检出（checkout）代码到本地，改完再提交（commit）回服务器。

\`\`\`text
            ┌──────────────────┐
            │   中央 SVN 服务器   │  ← 所有版本历史都在这里
            │   (仓库 + 历史)     │
            └─────────┬────────┘
                      │ checkout / commit
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   开发者 A        开发者 B       开发者 C
   (工作副本)      (工作副本)     (工作副本)
\`\`\`

**SVN 的优点**：概念简单，权限管理集中，适合传统企业。

**SVN 的致命缺点**：

- **单点故障**：中央服务器挂了，所有人都没法提交、没法看历史。
- **必须联网**：出差没网？抱歉，连查看历史都做不到（本地只有工作副本）。
- **分支昂贵**：SVN 的分支是"整目录复制"，开一个分支占一大块空间，慢且重。
- **提交慢**：每次 commit 都要走网络到中央服务器。

今天，SVN 在新项目中已很少使用，但在一些传统行业（银行、制造业）和老代码库里依然存在。

### 2.3 第三代：分布式版本控制（Distributed VCS, DVCS）

代表产品：**Git**、Mercurial、Bazaar。

分布式版本控制的核心思想是：**每个开发者本地都有一份完整的仓库**，包括全部历史记录，不是只存"工作副本"。

\`\`\`text
   开发者 A 本地               远程仓库                  开发者 B 本地
  ┌────────────┐            ┌────────────┐            ┌────────────┐
  │ 完整仓库    │ ←─ push ──│  GitHub 等  │── pull ──→ │ 完整仓库    │
  │ (含全部历史)│ ── pull →  │  托管平台    │ ←─ push ─ │ (含全部历史)│
  └────────────┘            └────────────┘            └────────────┘
\`\`\`

**Git 的核心优势**：

- **离线可用**：提交、分支、查看历史全在本地完成，不需要网络。只有 push/pull 才联网。
- **速度快**：绝大多数操作是本地磁盘操作，毫秒级。
- **分支轻量**：Git 分支只是一个指针，创建/切换几乎零成本。
- **数据完整性**：每个提交都用 SHA-1 哈希校验，任何篡改都会被发现。
- **容灾性强**：即使远程服务器没了，任何一台开发机的本地仓库都能恢复全部历史。

### 2.4 Git 的诞生

2005 年，Linux 之父 Linus Torvalds 用了**两周**时间写出了 Git 的初版。起因是：Linux 内核团队之前用的商业版本控制工具 BitKeeper 收回了对开源社区的免费授权，Linus 一怒之下决定自己造一个。他的设计目标非常明确：

- 速度极快（处理 Linux 内核这种超大规模仓库）
- 完全分布式
- 对分支友好
- 数据完整性高

今天，Git 已经是版本控制领域的事实标准，几乎所有新项目都用 Git。GitHub、GitLab、Gitee 等平台都是基于 Git 的云托管服务。

---

## 三、Git 核心概念：四个区域

理解 Git 的关键，是搞清楚它内部的"四个区域"。很多人用 Git 很久依然迷糊，就是没把这四个区域想明白。

\`\`\`text
┌──────────────┐  git add   ┌──────────────┐  git commit  ┌──────────────┐  git push  ┌──────────────┐
│   工作区      │ ─────────→ │   暂存区      │ ──────────→ │  本地仓库     │ ────────→ │  远程仓库     │
│ Working Dir  │            │ Staging Area │             │  Local Repo  │           │ Remote Repo  │
│  你能看到的    │            │  准备提交的    │             │  已提交的历史  │           │ GitHub 等     │
│  实际文件      │ ←───────── │   快照        │ ←────────── │             │ ←──────── │             │
└──────────────┘ git restore └──────────────┘ git reset    └──────────────┘ git pull  └──────────────┘
\`\`\`

### 3.1 工作区（Working Directory）

就是你在文件管理器里看到的那个项目文件夹，里面是你正在编辑的实际文件。你用编辑器打开 \`app.py\` 改了一行，这行改动就在工作区。

### 3.2 暂存区（Staging Area / Index）

暂存区是 Git 独有的概念，也是它和 SVN 最大的区别之一。它是一个"购物车"：你在工作区改了一堆文件，但不是所有改动都想一次性提交。你把"准备提交"的改动先用 \`git add\` 放进暂存区（购物车），然后 \`git commit\` 一次性把购物车里的东西结账（提交）。

为什么要有暂存区？因为它让你能**精细控制每次提交的内容**：

\`\`\`bash
# 你同时改了 3 个文件，但只想提交其中 2 个
git add app.py utils.py      # 只把这两个加入暂存区
git commit -m "feat: 优化接口" # 只提交这两个，第三个文件改动留在工作区
\`\`\`

### 3.3 本地仓库（Local Repository / .git 目录）

执行 \`git commit\` 后，暂存区的快照就被永久写入本地仓库（也就是项目下的 \`.git\` 目录）。这里存着所有的提交历史、分支、标签。

\`\`\`bash
# 看看 .git 目录里有什么
ls -la .git

# 输出示例：
# drwxr-xr-x   HEAD
# drwxr-xr-x   branches
# -rw-r--r--   config        # 仓库级配置
# -rw-r--r--   description
# -rw-r--r--   HEAD          # 当前指向哪个分支/提交
# drwxr-xr-x   hooks         # 钩子脚本
# drwxr-xr-x   info
# drwxr-xr-x   objects       # 所有提交对象（按哈希存储）
# drwxr-xr-x   refs          # 分支/标签指针
\`\`\`

### 3.4 远程仓库（Remote Repository）

托管在 GitHub/GitLab/Gitee 等服务器上的仓库，团队协作的"中心"。本地仓库用 \`git push\` 把提交推上去，用 \`git pull\` 拉取别人的更新。

### 3.5 文件的三种状态

文件在 Git 眼里有三种状态，对应它在哪个区域：

\`\`\`text
┌─────────────────────────────────────────────────────────┐
│  状态          │ 含义                        │ 所在区域   │
├─────────────────────────────────────────────────────────┤
│  Modified（已修改）│ 改了但还没 add            │ 工作区     │
│  Staged（已暂存）  │ add 了但还没 commit       │ 暂存区     │
│  Committed（已提交）│ commit 了，进入历史       │ 本地仓库   │
└─────────────────────────────────────────────────────────┘
\`\`\`

记住这张状态转换图，你就掌握了 Git 80% 的日常操作。

---

## 四、Git 安装

### 4.1 macOS 安装

macOS 通常自带 Git（通过 Xcode Command Line Tools），但版本可能较旧。

\`\`\`bash
# 方式一：检查是否已安装
git --version
# 输出示例：git version 2.39.0

# 如果没装，触发 Xcode 命令行工具安装
xcode-select --install
# 弹出安装对话框，点"安装"，等待完成即可

# 方式二：用 Homebrew 安装最新版（推荐）
brew install git
# Homebrew 会自动下载、编译、安装最新稳定版

# 安装后验证
which git
# 输出示例：/opt/homebrew/bin/git（Apple Silicon）
#          /usr/local/bin/git（Intel Mac）

git --version
# 输出示例：git version 2.43.0
\`\`\`

### 4.2 Windows 安装

Windows 不自带 Git，需要手动安装 Git for Windows。

\`\`\`bash
# 方式一：官网下载安装包
# 访问 https://git-scm.com/download/win
# 下载 64-bit Git for Windows Setup，双击安装

# 方式二：用 winget（Windows 包管理器，Win10+ 自带）
winget install --id Git.Git -e
# winget 会自动下载并安装，全程无需点击

# 方式三：用 Scoop（开发者常用的包管理器）
scoop install git

# 验证安装（在 Git Bash 或 PowerShell 中）
git --version
# 输出示例：git version 2.43.0.windows.1
\`\`\`

安装 Git for Windows 会同时装上 **Git Bash**（一个模拟 Linux 终端的命令行，推荐使用）和 **Git GUI**（图形界面）。本教程所有命令在 Git Bash 中都能直接运行。

### 4.3 Linux 安装

\`\`\`bash
# Debian / Ubuntu
sudo apt update
sudo apt install git -y
# -y 表示自动回答 yes，省去交互确认

# CentOS / RHEL / Fedora
sudo yum install git -y      # 旧版 CentOS
sudo dnf install git -y      # Fedora / 新版 RHEL

# Arch Linux
sudo pacman -S git

# 验证
git --version
# 输出示例：git version 2.39.1
\`\`\`

### 4.4 验证安装成功

\`\`\`bash
git --version
# 能输出版本号就说明安装成功，且 git 命令已加入 PATH

# 查看 git 命令的位置
which git       # macOS/Linux
where git       # Windows PowerShell
\`\`\`

---

## 五、首次配置：告诉 Git 你是谁

安装完 Git，第一件事不是建仓库，而是配置你的身份。因为每次提交，Git 都会把"提交人"信息记到历史里。如果不配置，提交时会报错或用错身份。

### 5.1 三层配置体系

Git 的配置分三层，优先级从高到低：

\`\`\`text
┌──────────────────────────────────────────────────────────┐
│  级别       │ 文件位置                       │ 作用范围    │
├──────────────────────────────────────────────────────────┤
│  local      │ .git/config（仓库内）          │ 仅当前仓库  │  ← 优先级最高
│  global     │ ~/.gitconfig（用户主目录）      │ 当前用户    │
│  system     │ /etc/gitconfig（系统目录）      │ 整台机器    │  ← 优先级最低
└──────────────────────────────────────────────────────────┘
\`\`\`

日常最常用的是 \`global\`（一次配置，所有项目生效）。

### 5.2 配置用户名和邮箱（必做）

\`\`\`bash
# 配置全局用户名（提交记录里会显示这个名字）
git config --global user.name "张三"

# 配置全局邮箱（提交记录里会显示这个邮箱）
git config --global user.email "zhangsan@example.com"

# 注意：用户名建议用真实姓名或常用 ID
# 邮箱建议用你在 GitHub 注册的邮箱，这样提交能关联到你的 GitHub 账号
\`\`\`

### 5.3 配置默认编辑器

\`\`\`bash
# 设置默认编辑器为 vim（命令行党常用）
git config --global core.editor "vim"

# 设置为 nano（更简单，适合新手）
git config --global core.editor "nano"

# macOS 设置为 VS Code（需要先装 VS Code 并配置 code 命令）
git config --global core.editor "code --wait"
# --wait 表示等待你关闭 VS Code 窗口后再继续

# Windows 设置为 VS Code
git config --global core.editor "code --wait"
\`\`\`

### 5.4 配置默认分支名

新版本 Git 默认分支从 \`master\` 改成了 \`main\`，建议显式设置：

\`\`\`bash
# 设置 git init 时默认创建的分支名为 main
git config --global init.defaultBranch main
\`\`\`

### 5.5 查看配置

\`\`\`bash
# 查看所有配置（三层合并后的最终生效值）
git config --list
# 输出示例：
# user.name=张三
# user.email=zhangsan@example.com
# core.editor=vim
# init.defaultbranch=main

# 查看某一项配置
git config user.name
# 输出：张三

# 查看配置来自哪个文件（带来源）
git config --list --show-origin
# 输出示例：
# file:/Users/zhangsan/.gitconfig user.name=张三
# file:.git/config core.repositoryformatversion=0
\`\`\`

### 5.6 其他实用配置

\`\`\`bash
# 让 git 输出带颜色（diff、log 等更易读）
git config --global color.ui auto

# 设置 pull 时默认用 rebase 而不是 merge（保持历史线性）
git config --global pull.rebase true

# 设置 push 时默认推送到当前分支对应的远程分支
git config --global push.default current

# 设置别名（后面章节详讲，这里先体验）
git config --global alias.st status
# 之后 git st 就等于 git status
\`\`\`

---

## 六、创建第一个 Git 仓库

### 6.1 git init：把普通文件夹变成 Git 仓库

\`\`\`bash
# 1. 创建项目目录
mkdir my-first-repo
cd my-first-repo

# 2. 初始化 Git 仓库
git init
# 输出示例：
# Initialized empty Git repository in /Users/zhangsan/my-first-repo/.git/

# 3. 查看目录，会多出一个隐藏的 .git 目录
ls -la
# 输出示例：
# drwxr-xr-x   .git       ← 这就是 Git 仓库的"灵魂"
# drwxr-xr-x   ..
# drwxr-xr-x   .
\`\`\`

\`.git\` 目录是 Git 仓库的核心，里面存着所有版本数据。**千万不要手动改里面的东西**（除非你非常清楚在做什么），否则仓库会损坏。

### 6.2 git clone：克隆远程仓库

如果远程已经有了仓库（比如在 GitHub 上），你可以直接克隆一份到本地：

\`\`\`bash
# 克隆一个公开仓库（以 https 方式）
git clone https://github.com/git/git.git
# 会在当前目录创建一个 git/ 文件夹，里面是完整仓库 + 历史

# 克隆到指定目录名
git clone https://github.com/git/git.git my-git-study
# 克隆到 my-git-study 文件夹

# 用 SSH 方式克隆（免密，前提是配置了 SSH key）
git clone git@github.com:git/git.git

# 只克隆最近一次提交（大仓库省时间）
git clone --depth 1 https://github.com/git/git.git
# --depth 1 表示只拉取最近 1 次提交的历史，不拉全部

# 克隆指定分支
git clone -b main https://github.com/git/git.git
# -b 指定要克隆的分支
\`\`\`

### 6.3 git status：查看仓库状态

\`git status\` 是你最常用的命令，没有之一。它告诉你"现在工作区、暂存区是什么状态"。

\`\`\`bash
# 在刚 init 的空仓库里
git status
# 输出示例：
# On branch main
# No commits yet
# nothing to commit (create/copy files and use "add" to track)

# 创建一个文件
echo "print('hello git')" > app.py

# 再看状态
git status
# 输出示例：
# On branch main
# No commits yet
# Untracked files:          ← 未跟踪文件
#   (use "git add <file>..." to include in what will be committed)
#         app.py
# nothing added to commit but untracked files present (use "add" to track)
\`\`\`

\`git status\` 的输出会指引你下一步该做什么（提示你用 \`git add\` 跟踪文件、用 \`git commit\` 提交等），新手照着提示走就行。

### 6.4 简洁状态

\`\`\`bash
# 简洁模式，一行一个文件
git status -s
# 输出示例：
# ?? app.py
# ?? 表示未跟踪（Untracked）

# 假设 add 之后又改了，状态会更丰富：
# M  app.py    ← 已暂存的修改（staged）
#  M utils.py  ← 未暂存的修改（modified but not staged）
# ?? new.txt   ← 未跟踪
\`\`\`

状态码含义：

\`\`\`text
??  未跟踪（新文件，还没纳入 Git 管理）
A   新增（已 add 到暂存区）
M   修改（已 tracked 的文件被改了）
D   删除
R   重命名
\`\`\`

左列表示暂存区状态，右列表示工作区状态。

---

## 七、.gitignore 文件：告诉 Git 哪些文件别管

并非项目里所有文件都该被版本控制。比如 Python 的 \`__pycache__\`、虚拟环境目录、IDE 配置、密钥文件等，既没必要跟踪，还可能泄露敏感信息。\`.gitignore\` 用来声明"这些文件 Git 请忽略"。

### 7.1 创建 .gitignore

\`\`\`bash
# 在仓库根目录创建 .gitignore
touch .gitignore
vim .gitignore
\`\`\`

### 7.2 Python 项目 .gitignore 模板

\`\`\`bash
# ===== Python 字节码与缓存 =====
__pycache__/
*.py[cod]          # 匹配 .pyc .pyo .pyd
*$py.class

# ===== 虚拟环境 =====
venv/
.venv/
env/
ENV/

# ===== 分发包 =====
build/
dist/
*.egg-info/
*.egg

# ===== 测试与覆盖率 =====
.pytest_cache/
.coverage
htmlcov/
.tox/

# ===== IDE 配置 =====
.idea/             # PyCharm
.vscode/           # VS Code
*.swp              # vim 临时文件

# ===== 操作系统文件 =====
.DS_Store          # macOS
Thumbs.db          # Windows

# ===== 敏感信息（千万别提交！）=====
.env               # 环境变量（含数据库密码等）
*.pem              # SSL 证书私钥
*.key              # 各种密钥
config/local.py    # 本地配置
\`\`\`

### 7.3 .gitignore 规则语法

\`\`\`bash
# 注释以 # 开头

# 1. 忽略所有 .pyc 文件
*.pyc

# 2. 但想跟踪某个被忽略的文件，用 ! 取反
!important.pyc

# 3. 忽略整个目录
node_modules/

# 4. 忽略目录下所有内容但保留目录本身
build/*
!build/.gitkeep

# 5. 只忽略根目录下的 TODO，不忽略子目录的 TODO
/TODO

# 6. 忽略 doc 目录下的所有 .pdf
doc/**/*.pdf
\`\`\`

### 7.4 已跟踪文件无法被 ignore

\`.gitignore\` 只对"未跟踪"的文件生效。如果一个文件已经被提交进仓库，再加进 \`.gitignore\` 是没用的：

\`\`\`bash
# 错误示范：app.py 已被跟踪，加进 .gitignore 无效
echo "app.py" >> .gitignore
git status   # app.py 依然被跟踪

# 正确做法：先从仓库移除（但保留本地文件），再 ignore
git rm --cached app.py
# --cached 表示只从仓库移除，不删除工作区文件
# 之后再 echo "app.py" >> .gitignore 才生效
\`\`\`

### 7.5 推荐资源

GitHub 官方维护了一份各语言的 \`.gitignore\` 模板库：\`github/gitignore\`。新建仓库时也可以直接选模板，省去手写的麻烦。

---

## 八、第一个 Git 仓库完整实战

把前面学的串起来，走一遍完整流程：

\`\`\`bash
# 1. 创建项目并初始化
mkdir hello-git && cd hello-git
git init
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"

# 2. 创建 .gitignore
cat > .gitignore <<'EOF'
__pycache__/
*.pyc
.venv/
.env
EOF

# 3. 创建源码文件
cat > app.py <<'EOF'
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Git"))
EOF

# 4. 查看状态
git status
# 应显示 .gitignore 和 app.py 为 Untracked

# 5. 添加到暂存区
git add .gitignore app.py
# 或者 git add .（添加所有变更）

# 6. 再次查看状态
git status
# 应显示 Changes to be committed（已暂存）

# 7. 提交
git commit -m "feat: 初始化项目，添加 app.py 和 .gitignore"
# 输出示例：
# [main (root-commit) a1b2c3d] feat: 初始化项目...
#  2 files changed, 12 insertions(+)
#  create mode 100644 .gitignore
#  create mode 100644 app.py

# 8. 查看提交历史
git log
# 输出示例：
# commit a1b2c3d4e5f6... (HEAD -> main)
# Author: 张三 <zhangsan@example.com>
# Date:   Thu Jan 4 10:00:00 2024 +0800
#
#     feat: 初始化项目，添加 app.py 和 .gitignore

# 9. 继续修改文件
echo "print(greet('World'))" >> app.py

# 10. 查看差异
git diff
# 输出工作区与暂存区的差异（红色删除、绿色新增）

# 11. 提交修改
git add app.py
git commit -m "feat: 添加 World 问候"

# 12. 查看简洁历史
git log --oneline
# 输出示例：
# b2c3d4e feat: 添加 World 问候
# a1b2c3d feat: 初始化项目，添加 app.py 和 .gitignore
\`\`\`

到这里，你已经完成了"配置 → 初始化 → 跟踪 → 提交 → 查看"的完整闭环。下一章我们会把这个流程展开成日常工作流。

---

## 九、本章小结

\`\`\`text
┌─────────────────────────────────────────────────────────────┐
│  核心知识点回顾                                                │
├─────────────────────────────────────────────────────────────┤
│  1. 版本控制三阶段：本地 RCS → 集中式 SVN → 分布式 Git        │
│  2. Git 四区域：工作区 / 暂存区 / 本地仓库 / 远程仓库          │
│  3. 文件三状态：Modified / Staged / Committed                │
│  4. 安装：macOS(brew/xcode) / Windows(Git for Windows) /     │
│           Linux(apt/yum)                                      │
│  5. 首次配置：user.name / user.email / core.editor           │
│  6. 三大基础命令：git init / git clone / git status          │
│  7. .gitignore 忽略规则与"已跟踪文件需 git rm --cached"       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# 记住这个最小工作闭环：
git init              # 初始化
git add <file>        # 暂存
git commit -m "msg"   # 提交
git log               # 查看
\`\`\`

掌握这一章，你已经能用 Git 管理自己的代码历史了。下一章我们进入真正的日常工作流，学会 add/commit/push/pull 的各种细节和技巧。
`
  },

  {
    id: "deploy-git-workflow",
    icon: "🔄",
    title: "日常工作流（add/commit/push/pull）",
    group: "Git 版本控制",
    content: `# 日常工作流（add / commit / push / pull）

上一章我们走通了 Git 的最小闭环。这一章把日常使用频率最高的几个命令讲透：\`git add\`、\`git commit\`、\`git log\`、\`git push\`、\`git pull\`、\`git fetch\`、\`git remote\`、\`git diff\`。把它们练熟，你 90% 的日常协作场景都能覆盖。

## 一、git add：把改动放进"购物车"

\`git add\` 的作用是把工作区的改动放进暂存区，准备提交。它有非常多的用法。

### 1.1 暂存单个文件

\`\`\`bash
# 只暂存 app.py
git add app.py

# 查看效果
git status -s
# 输出示例：
# A  app.py      ← A 表示已暂存的新增
\`\`\`

### 1.2 暂存多个文件

\`\`\`bash
# 一次性暂存多个文件（空格分隔）
git add app.py utils.py config.py

git status -s
# A  app.py
# A  config.py
# A  utils.py
\`\`\`

### 1.3 暂存所有变更

\`\`\`bash
# 暂存工作区所有变更（新增、修改、删除）
git add .
# . 表示当前目录，最常用

# 等价写法（旧版 Git）
git add --all
# 或
git add -A

# 注意：git add . 和 git add -A 在旧版 Git 有细微差别
# Git 2.x 之后，git add . 在仓库根目录执行时与 -A 等价
\`\`\`

### 1.4 暂存整个目录

\`\`\`bash
# 暂存 src/ 目录下所有改动
git add src/

# 暂存某个子目录
git add src/api/
\`\`\`

### 1.5 用通配符暂存

\`\`\`bash
# 暂存所有 .py 文件
git add "*.py"
# 注意：通配符要加引号，防止被 shell 先展开

# 暂存所有以 test_ 开头的文件
git add "test_*"
\`\`\`

### 1.6 交互式暂存（精细控制）

这是 \`git add\` 最强大却少有人用的功能，让你"按代码块"暂存：

\`\`\`bash
# 交互式暂存
git add -p app.py
# -p 即 --patch，Git 会把改动拆成多个"代码块"逐个询问

# 输出示例：
# @@ -1,3 +1,4 @@
#  def greet(name):
# -    return "Hello"
# +    return f"Hello, {name}!"
#
# Stage this hunk [y,n,q,a,d,s,e,?]? y
# y - 暂存这个代码块
# n - 不暂存
# q - 退出
# a - 暂存这个及后面所有
# d - 不暂存这个及后面所有
# s - 把当前块拆成更小的块
# e - 手动编辑这个块
# ? - 查看帮助
\`\`\`

**应用场景**：你一次性改了 5 个功能，想把它们拆成 5 次原子提交，每次只提交一个功能相关的改动。用 \`-p\` 就能精确挑出每个 hunk。

### 1.7 撤销暂存

\`\`\`bash
# 把 app.py 从暂存区移回工作区（保留改动）
git restore --staged app.py
# Git 2.23+ 推荐写法

# 旧写法（仍可用）
git reset HEAD app.py

# 撤销所有暂存
git restore --staged .
\`\`\`

---

## 二、git commit：把暂存区快照写入历史

### 2.1 基本提交

\`\`\`bash
# -m 后跟提交信息（message）
git commit -m "feat: 添加用户登录接口"

# 提交信息有空格，用引号包住
git commit -m "fix: 修复用户名为空时的崩溃问题"
\`\`\`

### 2.2 多行提交信息

\`\`\`bash
# 用多个 -m，每段会变成一个段落
git commit -m "feat: 添加用户登录接口" \
           -m "使用 JWT 生成 token，有效期 7 天" \
           -m "Closes #123"

# 或不加 -m，会打开编辑器写多行信息
git commit
# 在编辑器里写：
# feat: 添加用户登录接口
#
# - 使用 JWT 生成 token
# - 有效期 7 天
# - 支持 refresh token
# 保存退出即可提交
\`\`\`

### 2.3 git commit -am：跳过 add 直接提交已跟踪文件

\`\`\`bash
# -a 自动暂存所有"已跟踪"文件的修改（不包括新文件！）
# -m 提交信息
git commit -am "fix: 修复密码校验逻辑"
# 等价于：git add -u && git commit -m "..."

# 注意：新文件（未跟踪）不会被 -a 自动加入，仍需先 git add
\`\`\`

### 2.4 修改上次提交（amend）

刚提交完发现信息写错了，或者漏了一个文件，不想新建一个提交，可以"修订"上次提交：

\`\`\`bash
# 场景一：只想改提交信息
git commit --amend -m "feat: 添加用户登录接口（修正版）"
# 这会用新信息替换上次提交，commit hash 会变

# 场景二：漏了文件，想补进去
git add utils.py                # 先把漏的文件 add
git commit --amend --no-edit    # --no-edit 表示不修改提交信息
# 现在 utils.py 被合并进上次提交了
\`\`\`

⚠️ **重要警告**：\`--amend\` 会改变提交的哈希。如果上次提交已经 \`push\` 到了远程，**千万不要再 amend 后强推**，否则会破坏别人的历史。amend 只适合"还没 push 的本地提交"。

### 2.5 空提交（用于触发 CI）

\`\`\`bash
# --allow-empty 允许提交一个没有任何改动的空提交
git commit --allow-empty -m "chore: 触发 CI 重新部署"
# 常用于：CI 配置改了但代码没改，需要重新跑流水线
\`\`\`

### 2.6 提交信息规范预览

良好的提交信息让历史可读、可追溯、可自动生成 changelog。本章先用简单格式，最佳实践章会详讲 Conventional Commits：

\`\`\`text
格式：<类型>: <描述>

类型：
- feat     新功能
- fix      修复 bug
- docs     文档
- style    格式（不影响代码逻辑）
- refactor 重构
- test     测试
- chore    杂务（构建、依赖等）

示例：
- feat: 添加用户注册功能
- fix: 修复登录页面 404
- docs: 更新 README 安装步骤
- refactor: 提取密码哈希为独立函数
\`\`\`

---

## 三、git log：查看提交历史

### 3.1 基本查看

\`\`\`bash
git log
# 输出示例：
# commit a1b2c3d4e5f6789012345678 (HEAD -> main, origin/main)
# Author: 张三 <zhangsan@example.com>
# Date:   Thu Jan 4 10:00:00 2024 +0800
#
#     feat: 添加用户登录接口
#
# commit 9876543210fedcba12345678
# Author: 李四 <lisi@example.com>
# Date:   Wed Jan 3 18:30:00 2024 +0800
#
#     feat: 初始化项目
\`\`\`

每条记录包含：提交哈希、作者、日期、提交信息。\`HEAD -> main\` 表示当前 HEAD 指向 main 分支。

### 3.2 一行简洁模式（最常用）

\`\`\`bash
git log --oneline
# 输出示例：
# a1b2c3d feat: 添加用户登录接口
# 9876543 feat: 初始化项目

# --oneline 是 --pretty=oneline --abbrev-commit 的简写
# 只显示短哈希 + 提交信息，一行一个，看历史最清爽
\`\`\`

### 3.3 图形化分支视图

\`\`\`bash
# 显示分支合并图
git log --oneline --graph
# 输出示例：
# * a1b2c3d feat: 添加用户登录接口
# *   9876543 Merge branch 'feature/register'
# |\\
# | * 1111111 feat: 添加注册功能
# | * 2222222 feat: 添加用户模型
# * 3333333 feat: 初始化项目

# 加上所有分支
git log --oneline --graph --all
# --all 显示所有分支（包括远程）的历史
\`\`\`

### 3.4 显示每次提交的改动

\`\`\`bash
# 显示每次提交的 diff（patch）
git log -p
# 输出会很长，每条提交后附带改动的代码块

# 只看最近 3 次提交
git log -p -3

# 只看某个文件的提交历史
git log -p app.py
\`\`\`

### 3.5 显示每次提交的统计

\`\`\`bash
# 显示每次提交改动了哪些文件、增删多少行
git log --stat
# 输出示例：
# commit a1b2c3d
#  app.py    | 10 ++++++++--
#  utils.py  |  3 +++
#  2 files changed, 11 insertions(+), 2 deletions(-)
\`\`\`

### 3.6 按条件过滤

\`\`\`bash
# 按作者过滤
git log --author="张三"

# 按提交信息关键字过滤
git log --grep="登录"

# 按时间范围
git log --since="2024-01-01" --until="2024-01-31"
git log --since="2 weeks ago"

# 查看最近 N 条
git log -5

# 查看某段时间内某作者的提交
git log --author="张三" --since="1 week ago" --oneline

# 查看某个文件的修改历史（谁改了这个文件）
git log --follow app.py
# --follow 表示即使文件被重命名也继续追踪
\`\`\`

### 3.7 自定义输出格式

\`\`\`bash
# 自定义字段，用 --pretty=format
git log --pretty=format:"%h - %an, %ar : %s"
# %h 短哈希  %an 作者名  %ar 相对时间  %s 提交信息
# 输出示例：
# a1b2c3d - 张三, 2 hours ago : feat: 添加用户登录接口
# 9876543 - 李四, 1 day ago : feat: 初始化项目

# 常用占位符：
# %H  完整哈希   %h  短哈希
# %an 作者名     %ae 作者邮箱
# %cn 提交者名   %ce 提交者邮箱
# %ad 作者日期   %ar 相对时间
# %s  提交信息   %b  提交正文
\`\`\`

---

## 四、远程仓库操作：remote / push / pull / fetch

### 4.1 git remote：管理远程地址

\`\`\`bash
# 查看已配置的远程仓库
git remote
# 输出示例：origin

# 查看远程地址（带 URL）
git remote -v
# 输出示例：
# origin  git@github.com:zhangsan/my-app.git (fetch)
# origin  git@github.com:zhangsan/my-app.git (push)

# 添加远程仓库
git remote add origin git@github.com:zhangsan/my-app.git
# origin 是远程仓库的"别名"，习惯叫 origin

# 修改远程地址
git remote set-url origin git@github.com:zhangsan/new-name.git

# 重命名远程
git remote rename origin upstream

# 删除远程
git remote remove origin
\`\`\`

### 4.2 一个仓库配多个远程（常见协作场景）

\`\`\`bash
# 你 fork 了别人的项目，本地需要同时关联"自己的 fork"和"原项目"
git remote add origin git@github.com:me/forked-repo.git      # 自己的 fork
git remote add upstream git@github.com:original/repo.git     # 原项目

git remote -v
# origin    git@github.com:me/forked-repo.git (fetch)
# upstream  git@github.com:original/repo.git (fetch)

# 从原项目拉取最新更新
git fetch upstream

# 把原项目的更新合并到自己的 main
git checkout main
git merge upstream/main

# 推送到自己的 fork
git push origin main
\`\`\`

### 4.3 git push：把本地提交推到远程

\`\`\`bash
# 首次推送：把本地 main 推到 origin，并建立跟踪关系
git push -u origin main
# -u 即 --set-upstream，之后 git push / git pull 不用再写分支名

# 之后日常推送
git push

# 推送当前分支（不管它叫什么）
git push origin HEAD
# HEAD 代表当前分支

# 推送并强制覆盖远程（危险！慎用）
git push --force origin main
# 会丢弃远程已有的提交，只用于你确定没人基于远程工作时

# 相对安全的强制推送（推荐）
git push --force-with-lease origin main
# 只有当远程分支没有别人的新提交时才强推，否则拒绝
\`\`\`

### 4.4 git pull：拉取并合并远程更新

\`\`\`bash
# 拉取远程当前分支的更新并合并到本地
git pull
# 等价于 git fetch + git merge

# 指定远程和分支
git pull origin main

# 用 rebase 方式拉取（保持线性历史，推荐）
git pull --rebase
# 等价于 git fetch + git rebase
\`\`\`

\`git pull\` 实际是两步操作合二为一：先 \`fetch\` 拿到远程的新提交，再 \`merge\` 合并到本地。它可能产生合并提交，让历史变成"网状"。

### 4.5 git fetch：只取回，不合并

\`\`\`bash
# 拉取远程所有分支的更新，但不修改本地工作区
git fetch
# 拉取后，远程分支引用（如 origin/main）会更新

# 拉取指定远程
git fetch origin

# 拉取所有远程的所有分支
git fetch --all

# 拉取后，可以查看远程有什么新东西
git log origin/main --oneline
# 看看远程 main 比本地多了哪些提交

# 再决定要不要合并
git merge origin/main
\`\`\`

### 4.6 pull vs fetch 的区别（重点）

这是面试高频题，也是新手最容易混淆的点：

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  命令        │  做了什么                          │ 是否改工作区 │
├──────────────────────────────────────────────────────────────┤
│  git fetch  │  只下载远程更新到 .git，不动分支    │    否        │
│  git pull   │  fetch + merge，直接合并到当前分支  │    是        │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`git pull\` 更方便但"不可控"——如果远程有你不想立即合并的改动，pull 会强行合并。生产环境推荐用 \`git fetch\` 先看看，再决定怎么合并。

### 4.7 推送被拒绝怎么办

\`\`\`bash
# 场景：你 push 时报错
git push
# ! [rejected]    main -> main (non-fast-forward)
# 原因：远程有你本地没有的提交（别人 push 过了）

# 解决：先拉取再推送
git pull                # 先合并远程更新
# 如有冲突，解决冲突后：
git add .
git commit              # 完成合并提交
git push                # 现在能推上去了

# 或者用 rebase 保持线性
git pull --rebase
git push
\`\`\`

---

## 五、git diff：查看差异

\`git diff\` 查看的是"两个区域/版本之间的差异"。它有几个变种，对应不同比较对象。

### 5.1 工作区 vs 暂存区

\`\`\`bash
# 查看"工作区相对暂存区"的差异（即还没 add 的改动）
git diff
# 红色 = 删除行，绿色 = 新增行

# 只看某个文件
git diff app.py
\`\`\`

### 5.2 暂存区 vs 本地仓库

\`\`\`bash
# 查看已 add 但还没 commit 的改动
git diff --staged
# 等价：git diff --cached

# 这是"即将被提交"的内容，提交前最后看一眼很有用
\`\`\`

### 5.3 工作区 vs 本地仓库

\`\`\`bash
# 查看工作区相对最近一次提交的所有改动（不管有没有 add）
git diff HEAD
# = 工作区相对暂存区 + 暂存区相对仓库
\`\`\`

### 5.4 比较两个提交

\`\`\`bash
# 比较两个提交的差异
git diff a1b2c3d 9876543
# 显示从 a1b2c3d 到 9876543 的改动

# 用 HEAD 表示当前
git diff HEAD~1 HEAD
# HEAD~1 = 上一次提交，HEAD = 当前提交
# 即"最近一次提交改了什么"

# 比较两个分支
git diff main feature
# 显示 feature 相对 main 的差异
\`\`\`

### 5.5 只看文件名（不看内容）

\`\`\`bash
# 只列出哪些文件被改了，不显示具体代码
git diff --name-only
# 输出示例：
# app.py
# utils.py

# 只看统计（增删行数）
git diff --stat
#  app.py    | 10 ++++++++--
#  utils.py  |  3 +++
\`\`\`

### 5.6 一图看懂三种 diff

\`\`\`text
         工作区          暂存区         本地仓库(HEAD)
           │               │                │
  git diff │←──── 比较─────→│                │   工作区 vs 暂存区
           │               │                │
git diff --staged          │←──── 比较 ─────→│   暂存区 vs HEAD
           │               │                │
  git diff HEAD ←─────────── ──────────────→│   工作区 vs HEAD
\`\`\`

---

## 六、完整工作流演示

把上面所有命令串起来，模拟一次真实的协作开发。

### 6.1 场景设定

- 你和同事共同开发一个 Python 项目
- 远程仓库已存在
- 你负责"用户登录"功能

### 6.2 第一次拉取项目

\`\`\`bash
# 克隆项目
git clone git@github.com:team/my-project.git
cd my-project

# 查看远程
git remote -v
# origin  git@github.com:team/my-project.git (fetch)
# origin  git@github.com:team/my-project.git (push)

# 查看分支
git branch -a
# * main
#   remotes/origin/HEAD -> origin/main
#   remotes/origin/feature/pay
\`\`\`

### 6.3 创建功能分支

\`\`\`bash
# 切到一个新分支开发（不要直接在 main 上写代码！）
git checkout -b feature/login
# -b 表示创建并切换
# 输出：Switched to a new branch 'feature/login'

# 看当前分支
git branch
# * feature/login    ← 星号表示当前所在
#   main
\`\`\`

### 6.4 编码并提交

\`\`\`bash
# 写代码（模拟）
echo "def login(): pass" > auth.py

# 看状态
git status -s
# ?? auth.py

# 暂存
git add auth.py

# 提交
git commit -m "feat: 添加登录模块骨架"

# 继续完善
cat >> auth.py <<'EOF'

def logout():
    pass
EOF

# 用 -am 快速提交（auth.py 已被跟踪）
git commit -am "feat: 添加登出函数"

# 看历史
git log --oneline
# 2222222 feat: 添加登出函数
# 1111111 feat: 添加登录模块骨架
# 0000000 (origin/main) 初始化项目
\`\`\`

### 6.5 同步远程更新

\`\`\`bash
# 开发期间，同事往 main 推了新提交，先拉取
git fetch origin
# 拿到最新引用，但工作区没变

git log origin/main --oneline
# 3333333 feat: 同事添加了用户模型   ← 远程比你拉取时多了这个
# 0000000 初始化项目

# 把同事的更新合并到当前分支
git rebase origin/main
# 把你的两个提交"挪"到同事提交之上，保持线性
\`\`\`

### 6.6 推送到远程

\`\`\`bash
# 推送功能分支（首次需要 -u）
git push -u origin feature/login
# 远程会多出一个 feature/login 分支
\`\`\`

### 6.7 发起 Pull Request

到 GitHub 网页上，从 \`feature/login\` 向 \`main\` 发起 PR，让同事 review，review 通过后合并。这部分在 GitHub 章节详讲。

### 6.8 合并后清理

\`\`\`bash
# 切回 main
git checkout main

# 拉取合并后的最新 main（PR 已合并）
git pull origin main

# 删除已合并的本地分支
git branch -d feature/login
# -d 安全删除（已合并才允许）

# 删除远程分支
git push origin --delete feature/login
\`\`\`

---

## 七、常见问题速查

### 7.1 不小心 commit 了不该提交的文件

\`\`\`bash
# 还没 push：用 reset 撤销提交（保留改动在工作区）
git reset HEAD~1
# HEAD~1 表示上一次提交，撤销它，改动回到暂存区
# 配合 --soft / --mixed / --hard 后续章节详讲

# 已经 push：用 revert 生成一个反向提交（安全）
git revert HEAD
# 不会改写历史，而是新建一个"撤销"提交
\`\`\`

### 7.2 提交信息写错了

\`\`\`bash
# 还没 push：amend
git commit --amend -m "正确的信息"

# 已 push：只能新建提交说明，或 revert 重提（不要强推改写公共历史）
\`\`\`

### 7.3 想撤销工作区的修改

\`\`\`bash
# 撤销 app.py 的未暂存修改，恢复到暂存区状态
git restore app.py
# 旧写法：git checkout -- app.py

# 撤销所有工作区修改（危险！未保存的改动会丢失）
git restore .
\`\`\`

### 7.4 拉取时有冲突

\`\`\`bash
git pull
# CONFLICT (content): Merge conflict in app.py
# Automatic merge failed; fix conflicts and then commit the result.

# 打开 app.py，找到冲突标记
# <<<<<<< HEAD
# 我的代码
# =======
# 同事的代码
# >>>>>>> origin/main

# 手动编辑保留正确内容，删掉标记
# 然后：
git add app.py
git commit          # 完成合并提交
\`\`\`

---

## 八、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  日常五件套：add → commit → pull → push → log                  │
├──────────────────────────────────────────────────────────────┤
│  git add <file>/.      暂存改动                                │
│  git add -p            交互式按块暂存                          │
│  git commit -m "msg"   提交                                    │
│  git commit -am "msg"  跳过 add 提交已跟踪文件                 │
│  git commit --amend    修订上次提交（仅限未 push）             │
│  git log --oneline --graph --all   看历史                      │
│  git push -u origin <branch>     推送并建立跟踪                │
│  git pull / git pull --rebase    拉取合并                      │
│  git fetch            只取不合并（更安全）                      │
│  git diff / --staged / HEAD      三种差异比较                  │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# 一天工作流的最小循环
git checkout -b feature/xxx   # 建分支
# ... 写代码 ...
git add .                     # 暂存
git commit -m "feat: xxx"     # 提交
git pull --rebase             # 同步远程
git push                      # 推送
# 发 PR → review → 合并
\`\`\`

把这套流程练到肌肉记忆，日常协作就游刃有余了。下一章我们进入分支与合并的深水区。
`
  },

  {
    id: "deploy-git-branch",
    icon: "🌿",
    title: "分支管理与合并",
    group: "Git 版本控制",
    content: `# 分支管理与合并

分支是 Git 最强大的特性。没有分支，多人协作和并行开发几乎不可能。这一章我们把分支的创建、切换、合并、冲突解决、rebase，以及团队常用的分支策略讲清楚。

## 一、为什么需要分支

### 1.1 没有分支的世界

想象你直接在 \`main\` 分支上开发新功能，写到一半，线上突然报了一个紧急 bug 要修。你现在的代码是"半成品"，根本跑不起来，怎么修 bug？

\`\`\`text
main 分支时间线：
  init ── 功能A(写一半) ── ??? 怎么插 bug 修复 ???
\`\`\`

- 直接改？你半成品代码会跟着上线，灾难。
- 先撤销功能 A 的代码改 bug，改完再恢复功能 A？手动撤销/恢复，极容易出错。

### 1.2 有分支的世界

分支让你能"开多条平行时间线"，互不干扰：

\`\`\`text
main:        init ──────────────────────┬── 修完 bug 合并 ──┬── 继续开发
                \\                        │                  │
feature/A:      └── 功能A(慢慢写)────────┘                  │
hotfix:                                      └── 紧急修 bug ┘
\`\`\`

- 在 \`feature/A\` 分支慢慢写功能，不影响 \`main\`
- 线上 bug 来了，从 \`main\` 切出 \`hotfix\` 分支，专心修 bug
- 修完合并回 \`main\`，发布修复版本
- 回到 \`feature/A\` 继续，必要时把 \`main\` 的修复合并进来

### 1.3 Git 分支为什么轻量

SVN 的分支是"整目录复制"，开一个分支就复制一整套文件，又慢又占空间。Git 的分支只是一个**指向某次提交的指针**（一个 40 字符的哈希值），创建分支只是写一个指针文件，几乎零成本。

\`\`\`text
Git 分支本质：
  main ──→ 提交C ──→ 提交B ──→ 提交A
            ↑
feature ────┘   （feature 只是指向提交 C 的指针）

创建分支 = 新建一个 41 字节的文件，记录指针指向哪个 commit
\`\`\`

---

## 二、分支基本操作

### 2.1 查看分支

\`\`\`bash
# 查看本地分支
git branch
# * feature/login    ← 星号表示当前所在分支
#   main
#   develop

# 查看所有分支（含远程）
git branch -a
# * feature/login
#   main
#   remotes/origin/HEAD -> origin/main
#   remotes/origin/develop
#   remotes/origin/feature/pay

# 查看每个分支最后一次提交
git branch -v
# * feature/login  a1b2c3d feat: 添加登录
#   main           9876543 初始化项目

# 查看已合并到当前分支的分支
git branch --merged

# 查看未合并的分支
git branch --no-merged
\`\`\`

### 2.2 创建分支

\`\`\`bash
# 创建分支（但不切换过去）
git branch feature/register
# 基于当前 HEAD 创建 feature/register

# 创建并切换（最常用）
git checkout -b feature/register
# -b = 创建并切换

# Git 2.23+ 推荐用 switch（语义更清晰）
git switch -c feature/register
# -c = create

# 基于远程分支创建本地分支（跟踪远程）
git checkout -b feature/login origin/feature/login
# 或
git switch -c feature/login --track origin/feature/login
\`\`\`

### 2.3 切换分支

\`\`\`bash
# 切换到 main（旧写法）
git checkout main

# 切换到 main（新写法，推荐）
git switch main

# 切换到上一个分支（来回切换很方便）
git checkout -
# 或
git switch -
\`\`\`

⚠️ 切换前请确保工作区干净（已提交或已 stash），否则未提交的改动可能"跟过来"或冲突。Git 默认会带着未提交且不冲突的改动一起切换。

### 2.4 删除分支

\`\`\`bash
# 安全删除（只有已合并的分支才能删）
git branch -d feature/login
# -d = delete（safe）
# 输出：Deleted branch feature/login (was a1b2c3d).

# 强制删除（即使没合并也删，丢失未合并的提交！）
git branch -D feature/login
# -D = --delete --force

# 删除远程分支
git push origin --delete feature/login
# 或
git push origin :feature/login   # 旧语法，把空分支推过去覆盖
\`\`\`

### 2.5 重命名分支

\`\`\`bash
# 重命名当前分支
git branch -m new-name
# -m = move/rename

# 重命名指定分支
git branch -m old-name new-name

# 重命名远程分支：先重命名本地，删除远程旧的，再推新的
git branch -m old-name new-name
git push origin :old-name          # 删除远程旧分支
git push -u origin new-name        # 推送新分支
\`\`\`

---

## 三、合并：git merge

### 3.1 快进合并（Fast-Forward）

当目标分支是源分支的直接祖先时，Git 只需把指针"快进"过去，不产生合并提交。

\`\`\`text
合并前：
  main:     A ── B
                     \\
feature:              C ── D   （feature 从 main 的 B 切出，main 没动过）

快进合并后：
  main:     A ── B ── C ── D    （main 指针直接挪到 D，没有合并提交）
\`\`\`

\`\`\`bash
# 切到 main，合并 feature
git checkout main
git merge feature/login
# 输出：Fast-forward
#  app.py | 5 +++++
#  1 file changed, 5 insertions(+)

# 强制禁用快进，保留合并提交（记录"这次合并发生过"）
git merge --no-ff feature/login
# 会生成一个 merge commit
\`\`\`

### 3.2 三方合并（Three-Way Merge）

当两个分支都有各自的新提交时，Git 需要找一个"共同祖先"，做三方合并，生成一个新的合并提交。

\`\`\`text
合并前：
  main:     A ── B ────── E        （main 在 B 之后又提交了 E）
                     \\
feature:              C ── D       （feature 也提交了 C、D）

共同祖先是 B，Git 用 B、E、D 三个点做三方合并：

合并后：
  main:     A ── B ─── E ── M      （M 是合并提交，有两个父提交 E 和 D）
                     \\      /
feature:              C ── D
\`\`\`

\`\`\`bash
git checkout main
git merge feature/login
# 输出：Merge made by the 'ort' strategy.
#  app.py | 5 +++++
#  1 file changed, 5 insertions(+)
\`\`\`

### 3.3 快进 vs 三方合并对比

\`\`\`text
┌────────────────────────────────────────────────────────────┐
│  类型       │ 触发条件              │ 是否产生合并提交        │
├────────────────────────────────────────────────────────────┤
│  快进合并   │ 目标分支没新提交       │ 否（线性历史）          │
│  三方合并   │ 两边都有新提交         │ 是（产生 merge commit） │
│  --no-ff    │ 强制                  │ 是（总是产生合并提交）   │
└────────────────────────────────────────────────────────────┘
\`\`\`

团队实践中，功能分支合并到主干常加 \`--no-ff\`，保留"这是一个功能分支"的历史痕迹，方便回溯。

---

## 四、合并冲突解决

当两个分支修改了**同一文件的同一区域**，Git 无法自动合并，就会产生冲突。

### 4.1 制造一个冲突

\`\`\`bash
# 在 main 改 app.py 第 1 行
git checkout main
echo "VERSION = '1.0.0'" > app.py
git commit -am "chore: 主线版本号 1.0.0"

# 在 feature 改同一行
git checkout feature/login
echo "VERSION = '2.0.0'" > app.py
git commit -am "chore: 分支版本号 2.0.0"

# 切回 main 合并
git checkout main
git merge feature/login
# Auto-merging app.py
# CONFLICT (content): Merge conflict in app.py
# Automatic merge failed; fix conflicts and then commit the result.
\`\`\`

### 4.2 查看冲突文件

打开 \`app.py\`，会看到冲突标记：

\`\`\`text
<<<<<<< HEAD
VERSION = '1.0.0'
=======
VERSION = '2.0.0'
>>>>>>> feature/login
\`\`\`

- \`<<<<<<< HEAD\` 到 \`=======\` 之间是"当前分支（main）"的内容
- \`=======\` 到 \`>>>>>>> feature/login\` 之间是"被合并分支"的内容

### 4.3 解决冲突

手动编辑，保留正确的内容，删掉所有冲突标记：

\`\`\`text
VERSION = '2.0.0'
\`\`\`

（这里假设我们决定用 2.0.0）

### 4.4 标记已解决并提交

\`\`\`bash
# 把解决后的文件加入暂存区
git add app.py

# 查看状态（确认所有冲突已解决）
git status
# All conflicts fixed but you are still merging.
#   (use "git commit" to conclude merge)

# 完成合并提交
git commit
# 会用默认的合并信息，也可编辑
\`\`\`

### 4.5 放弃合并

\`\`\`bash
# 觉得冲突太复杂，想放弃这次合并
git merge --abort
# 回到合并前的状态，工作区恢复
\`\`\`

### 4.6 用工具辅助解决冲突

\`\`\`bash
# 配置合并工具
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# 调用工具
git mergetool
# 会用 VS Code 的合并编辑器打开冲突文件
\`\`\`

### 4.7 减少冲突的实践

- **频繁同步**：开发期间经常 \`git fetch\` + \`rebase\` 主干，及早发现冲突
- **小步提交**：每次提交改动小，冲突范围也小
- **拆分模块**：不同人负责不同文件，物理隔离
- **沟通**：开干前说清楚要改哪些文件

---

## 五、git rebase：变基

\`rebase\` 是 Git 里最强大也最容易"翻车"的命令。理解它能让你历史管理能力上一个台阶。

### 5.1 rebase 是什么

rebase（变基）= 把一系列提交"挪到"另一个基线之上，重新生成提交。

\`\`\`text
rebase 前：
  main:     A ── B ── E
                     \\
feature:              C ── D   （feature 基于 B，但 main 已到 E）

执行 git rebase main（在 feature 分支上）：
  main:     A ── B ── E
                          \\
feature:                  C' ── D'   （C、D 被重新基于 E 生成，变成 C'、D'，哈希变了）
\`\`\`

效果：feature 的提交"接"在 main 最新提交之后，历史变成一条直线。

### 5.2 基本用法

\`\`\`bash
# 在 feature 分支上，把它的提交变基到 main 最新
git checkout feature/login
git fetch origin
git rebase origin/main

# 如果有冲突：
# 1. 解决冲突
# 2. git add <file>
# 3. git rebase --continue
# 跳过当前提交：git rebase --skip
# 放弃 rebase：git rebase --abort
\`\`\`

### 5.3 交互式 rebase：整理历史

交互式 rebase 是"历史整容师"，能改写、合并、重排、删除提交。

\`\`\`bash
# 整理最近 5 次提交
git rebase -i HEAD~5
# 会打开编辑器，列出最近 5 个提交：

# pick a1b2c3d feat: 添加登录
# pick b2c3d4e fix: 修复登录bug
# pick c3d4e5f feat: 添加注册
# pick d4e5f6g chore: 改个变量名
# pick e5f6g7h feat: 添加登出

# 把 pick 改成各种动作：
# pick   = 保留
# reword = 保留但改提交信息
# edit   = 保留但暂停，让你修改提交内容
# squash = 把这次提交合并到上一次（合并提交信息）
# fixup  = 同 squash，但丢弃这次提交信息
# drop   = 删除这次提交

# 例如把"改变量名"删掉，把"修复bug"合并到"添加登录"：
# pick   a1b2c3d feat: 添加登录
# fixup  b2c3d4e fix: 修复登录bug
# pick   c3d4e5f feat: 添加注册
# drop   d4e5f6g chore: 改个变量名
# pick   e5f6g7h feat: 添加登出

# 保存退出，Git 按指令重写历史
\`\`\`

### 5.4 rebase vs merge：选哪个

\`\`\`text
┌────────────────────────────────────────────────────────────────┐
│  对比项      │ git merge                │ git rebase            │
├────────────────────────────────────────────────────────────────┤
│  历史       │ 保留分叉，有合并提交      │ 线性，无合并提交       │
│  提交哈希   │ 不变                     │ 变（重写历史）         │
│  冲突处理   │ 一次性解决                │ 可能逐提交解决         │
│  可追溯性   │ 高（保留真实分支轨迹）    │ 低（看不出分叉过）     │
│  适用       │ 合并公共分支              │ 整理个人分支历史       │
└────────────────────────────────────────────────────────────────┘
\`\`\`

**黄金法则**：**永远不要 rebase 已经 push 到公共分支的提交**。因为 rebase 会重写历史，别人的本地会与你冲突。rebase 只用于整理"还没 push"或"只属于你个人"的提交。

### 5.5 rebase 后强制推送

\`\`\`bash
# rebase 改写了历史，普通 push 会被拒
git push origin feature/login
# ! [rejected] feature/login -> feature/login (non-fast-forward)

# 需要 force push（只对个人分支！）
git push --force-with-lease origin feature/login
# --force-with-lease 比 --force 安全：远程若被别人更新过则拒绝
\`\`\`

### 5.6 pull --rebase：日常最佳实践

\`\`\`bash
# 拉取时用 rebase 而非 merge，保持线性历史
git pull --rebase origin main

# 设为默认
git config --global pull.rebase true
\`\`\`

---

## 六、分支策略：团队怎么用分支

不同团队有不同分支模型，这里介绍三种主流策略。

### 6.1 Git Flow（传统重型）

由 Vincent Driessen 提出，适合"有明确发布周期"的传统项目（如桌面软件、企业系统）。

\`\`\`text
分支结构：
  main       ── 生产环境代码，每次合并打 tag
  develop    ── 开发主线，最新功能集成
  feature/*  ── 功能分支，从 develop 切出，合并回 develop
  release/*  ── 发布分支，从 develop 切出，测试 + 修 bug，合并回 main 和 develop
  hotfix/*   ── 紧急修复，从 main 切出，合并回 main 和 develop

时间线示例：
  main:    ──A──────────────────R──H── (tag v1.0)── (tag v1.0.1)
              \\                  /   /
  develop:    A──F1──F2──F3─────R──/
                  /    /    /   /
  feature:    F1──/ F2─/ F3─/
                       release: ──R── (测试修 bug)
                                hotfix: ──H──
\`\`\`

**优点**：结构清晰，发布可追溯。
**缺点**：分支多、流程重，对持续部署的项目太繁琐。

### 6.2 GitHub Flow（轻量现代）

GitHub 推崇的极简流程，适合"持续部署"的 Web 项目。

\`\`\`text
流程：
  1. main 分支永远可部署
  2. 从 main 切出 feature 分支
  3. 在 feature 分支提交、推送
  4. 开 Pull Request
  5. 团队 review + CI 通过
  6. 合并到 main
  7. 立即部署 main

分支结构：
  main:     ──A──M──M──M── (持续部署)
                /  /  /
  feature:  F1─/ F2/ F3/
\`\`\`

**优点**：简单、快速、适合 CI/CD。
**缺点**：没有明确的 release 分支，回滚要靠 tag 和 revert。

### 6.3 Trunk-Based Development（主干开发）

所有人直接往 main（trunk）提交，功能短分支存活时间极短（几小时到一两天）。被 Google、Facebook 等大厂广泛采用。

\`\`\`text
流程：
  - 每个人频繁往 main 提交小步改动
  - 大功能用 feature flag（开关）控制是否启用，代码先进 main 但默认关闭
  - 发布时从 main 切出 release 分支，打 tag

分支结构：
  main: ──a──b──c──d──e──f──g── (所有人直接提交)
                            \\
  release:                    r── (tag v1.0)
\`\`\`

**优点**：集成冲突最少，反馈最快，适合大团队 + 持续部署。
**缺点**：要求代码质量高、测试覆盖全、有 feature flag 基础设施。

### 6.4 三种策略对比

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  策略          │ 适合场景           │ 复杂度 │ 发布节奏        │
├──────────────────────────────────────────────────────────────┤
│  Git Flow      │ 传统软件、企业系统  │  高    │ 周期性发布      │
│  GitHub Flow   │ Web 应用、中小团队  │  低    │ 持续部署        │
│  Trunk-Based   │ 大厂、高频部署      │  中    │ 多次/天         │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### 6.5 分支命名规范

\`\`\`text
推荐前缀：
  feature/xxx   新功能
  fix/xxx       修 bug
  hotfix/xxx    紧急修复
  refactor/xxx  重构
  docs/xxx      文档
  chore/xxx     杂务
  release/x.x.x 发布

示例：
  feature/user-login
  fix/login-404
  hotfix/payment-crash
  refactor/auth-module

可加 issue 号：
  feature/USER-123-user-login
\`\`\`

---

## 七、分支实战演练

\`\`\`bash
# 1. 准备
git init branch-demo && cd branch-demo
git commit --allow-empty -m "init"

# 2. 创建并切换 feature 分支
git switch -c feature/a
echo "feature a" > a.txt
git add . && git commit -m "feat: 功能 A"

# 3. 回 main 创建另一个功能
git switch main
git switch -c feature/b
echo "feature b" > b.txt
git add . && git commit -m "feat: 功能 B"

# 4. 看 graph
git log --oneline --graph --all
# * <hash> feat: 功能 B  (feature/b)
# | * <hash> feat: 功能 A (feature/a)
# |/
# * <hash> init            (main)

# 5. 合并 feature/a 到 main（快进）
git switch main
git merge feature/a

# 6. 合并 feature/b 到 main（三方合并）
git merge feature/b

# 7. 看历史
git log --oneline --graph --all

# 8. 清理已合并分支
git branch -d feature/a feature/b
\`\`\`

---

## 八、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  分支核心命令                                                 │
├──────────────────────────────────────────────────────────────┤
│  git branch                    查看分支                       │
│  git branch <name>             创建分支                       │
│  git switch <name> / -c <name> 切换 / 创建并切换             │
│  git branch -d <name>          删除已合并分支                 │
│  git branch -D <name>          强制删除                       │
│  git merge <branch>            合并分支                       │
│  git merge --no-ff <branch>    强制产生合并提交               │
│  git rebase <base>             变基                           │
│  git rebase -i HEAD~N          交互式整理历史                 │
│  git push --force-with-lease   rebase 后安全强推              │
└──────────────────────────────────────────────────────────────┘
\`\`\`

记住两条铁律：

1. **公共分支不要 rebase**，只 merge。
2. **不要在 main 上直接写代码**，永远开分支。

下一章我们进入高级操作：stash、cherry-pick、reset、revert、reflog——这些是救火和精细控制的利器。
`
  },

  {
    id: "deploy-git-advanced",
    icon: "🎯",
    title: "高级操作（stash / cherry-pick / reset / revert）",
    group: "Git 版本控制",
    content: `# 高级操作：stash / cherry-pick / reset / revert / reflog / tag / bisect

日常五件套够你用 90% 的时间。剩下 10% 的"特殊场景"——临时切分支、挑某个提交、撤销操作、找回丢失的提交、打版本标签、二分查 bug——就靠这一章的高级命令。

## 一、git stash：临时保存未提交的工作

### 1.1 场景

你正在 \`feature/login\` 上写代码，写到一半（还没 commit），同事说"线上挂了，快来帮忙修"。你要切到 \`main\` 开 \`hotfix\` 分支，但现在工作区的半成品代码挡路——直接切分支会把改动带过去。

\`git stash\` 就是解决这个：把工作区的改动"塞进抽屉"暂存起来，让工作区变干净，切完分支干完活再拿出来。

### 1.2 基本用法

\`\`\`bash
# 把工作区 + 暂存区的改动暂存起来（工作区变干净）
git stash
# 输出示例：
# Saved working directory and index state WIP on feature/login: a1b2c3d feat: ...
# HEAD is now at a1b2c3d

# 查看暂存列表
git stash list
# stash@{0}: WIP on feature/login: a1b2c3d feat: 添加登录
# stash@{1}: WIP on main: 9876543 fix: 修复 X

# 恢复最近的 stash（并删除它）
git stash pop
# 把 stash@{0} 的改动恢复到工作区，并从列表删除

# 恢复但保留 stash
git stash apply
# 恢复 stash@{0}，但列表里仍保留它

# 恢复指定 stash
git stash apply stash@{1}
\`\`\`

### 1.3 带说明的 stash

\`\`\`bash
# 加说明，方便日后认出是什么
git stash push -m "登录页表单做到一半"

git stash list
# stash@{0}: On feature/login: 登录页表单做到一半
\`\`\`

### 1.4 stash 包含未跟踪文件

默认 stash 只暂存"已跟踪"文件的改动，新文件（untracked）不包含：

\`\`\`bash
# 包含未跟踪文件
git stash -u
# -u = --include-untracked

# 包含所有（含 .gitignore 忽略的文件）
git stash -a
# -a = --all，慎用，可能暂存大量构建产物
\`\`\`

### 1.5 删除 stash

\`\`\`bash
# 删除最近的 stash
git stash drop
# 删除指定 stash
git stash drop stash@{2}

# 清空所有 stash
git stash clear
\`\`\`

### 1.6 部分暂存

\`\`\`bash
# 交互式选择要 stash 的代码块
git stash -p
# 类似 git add -p，逐块询问
\`\`\`

### 1.7 完整流程示例

\`\`\`bash
# 1. 正在写代码
echo "半成品" >> app.py

# 2. 紧急切分支：先 stash
git stash push -m "登录半成品"

# 3. 工作区干净了，切分支修 bug
git switch main
git switch -c hotfix/crash
# ... 修 bug，提交，合并 ...

# 4. 回到 feature 继续原来的工作
git switch feature/login
git stash pop
# 半成品代码回来了

git status -s
#  M app.py
\`\`\`

---

## 二、git cherry-pick：挑选提交

### 2.1 场景

\`feature\` 分支上有一个提交修了某个 bug，但你不想把整个 feature 分支合并过来（feature 还没完成）。你只想"摘"那一个修 bug 的提交到 \`main\`。

\`\`\`bash
# 把指定提交"复制"到当前分支
git cherry-pick a1b2c3d
# a1b2c3d 是要挑的提交哈希
\`\`\`

### 2.2 基本用法

\`\`\`bash
# 切到目标分支
git switch main

# 挑一个提交
git cherry-pick a1b2c3d
# 输出：
# [main d4e5f6g] fix: 修复密码校验
#  Date: Thu Jan 4 10:00:00 2024 +0800
#  1 file changed, 3 insertions(+), 1 deletion(-)

# 挑多个提交
git cherry-pick a1b2c3d b2c3d4e c3d4e5f

# 挑一个范围（左开右闭）
git cherry-pick A..D
# 挑 B、C、D（不含 A）

# 挑一个范围（左闭右闭）
git cherry-pick A^..D
# 挑 A、B、C、D
\`\`\`

### 2.3 只挑改动不提交

\`\`\`bash
# --no-commit：把改动放进暂存区，但不自动提交
git cherry-pick --no-commit a1b2c3d
# 你可以再调整后自己 commit
\`\`\`

### 2.4 处理冲突

\`\`\`bash
git cherry-pick a1b2c3d
# error: could not apply a1b2c3d... fix: 修复密码校验
# After resolving the conflicts, mark them with 'git add <paths>'
# then run 'git cherry-pick --continue'.

# 解决冲突后
git add app.py
git cherry-pick --continue

# 放弃
git cherry-pick --abort
\`\`\`

### 2.5 cherry-pick 的注意事项

- cherry-pick 会产生**新的提交哈希**（虽然是同样的改动，但提交人/时间/父提交都变了）
- 不要 cherry-pick 已合并的提交，否则重复
- 适合"在错误分支上提交了，想挪到正确分支"或"hotfix 需要同时应用到多个 release 分支"

### 2.6 典型场景：hotfix 同步到多个版本

\`\`\`bash
# 在 main 修了个 bug，提交 hash 是 a1b2c3d
# 需要把这个修复同步到 release/1.0 和 release/2.0

git switch release/1.0
git cherry-pick a1b2c3d
git push

git switch release/2.0
git cherry-pick a1b2c3d
git push
\`\`\`

---

## 三、git reset：移动分支指针

\`reset\` 是撤销提交的核心命令，但它有三种模式，行为差别很大，是新手最容易"误删代码"的命令，必须吃透。

### 3.1 三种模式一图看懂

\`\`\`text
假设当前状态：
  工作区：有改动 W
  暂存区：有改动 S
  仓库：  HEAD 指向提交 C，上一个提交是 C-1

执行 git reset --<mode> C-1（回退到 C-1）：

┌──────────┬──────────────┬──────────────┬────────────────┐
│  模式    │ 仓库(HEAD)   │ 暂存区        │ 工作区          │
├──────────┼──────────────┼──────────────┼────────────────┤
│ --soft   │ 移到 C-1     │ 保留 S+C的改动 │ 保留 W          │
│ --mixed  │ 移到 C-1     │ 清空（变C-1态）│ 保留 W+C的改动  │  ← 默认
│ --hard   │ 移到 C-1     │ 清空          │ 清空（变C-1态） │  ← 危险！
└──────────┴──────────────┴──────────────┴────────────────┘
\`\`\`

### 3.2 --soft：只移指针，改动全保留

\`\`\`bash
# 撤销最近一次提交，但改动都在暂存区（可直接重新 commit）
git reset --soft HEAD~1
# HEAD~1 = 上一次提交

git status
# Changes to be committed:   ← 原 HEAD 的改动现在在暂存区
#   modified: app.py

# 适用：commit 信息写错了或想合并多个提交，重新组织
\`\`\`

### 3.3 --mixed（默认）：移指针 + 清暂存区，工作区改动保留

\`\`\`bash
# 撤销最近一次提交，改动回到工作区（未暂存状态）
git reset HEAD~1
# 等同 git reset --mixed HEAD~1

git status
# Changes not staged for commit:   ← 改动在工作区，未暂存
#   modified: app.py

# 适用：撤销提交，还想继续改一改再重新 add + commit
\`\`\`

### 3.4 --hard：彻底丢弃（危险）

\`\`\`bash
# 撤销最近一次提交，且丢弃所有改动（工作区 + 暂存区）
git reset --hard HEAD~1
# ⚠️ 警告：--hard 会永久删除未提交的改动，不可恢复（除非靠 reflog）！

# 把工作区完全恢复到某次提交的状态
git reset --hard a1b2c3d
# 慎用，会丢掉所有未保存的工作

# 适用：确实要丢弃所有改动，回到某个干净状态
\`\`\`

### 3.5 撤销暂存（reset 的温和用法）

\`\`\`bash
# 把 app.py 从暂存区移出（不影响工作区改动）
git reset HEAD app.py
# 这是 reset 不带 mode 的用法，仅影响暂存区

# Git 2.23+ 推荐
git restore --staged app.py
\`\`\`

### 3.6 reset 回退已 push 的提交？别这么做

\`\`\`bash
# 错误做法
git reset --hard HEAD~1
git push --force
# 如果是公共分支，会破坏别人的历史！

# 正确做法：用 revert（下一节）
\`\`\`

### 3.7 三种模式速记

\`\`\`text
--soft   : 撤销 commit，改动留暂存区     → "我只是想重新提交"
--mixed  : 撤销 commit + add，改动留工作区 → "我想重新整理"（默认）
--hard   : 撤销一切，彻底丢弃              → "我全不要了"（危险）
\`\`\`

---

## 四、git revert：用反向提交撤销

### 4.1 reset vs revert 的本质区别

\`\`\`text
git reset HEAD~1    ：把指针往回挪，"删除"最近一次提交（改写历史）
git revert <commit> ：新建一个"反向"提交，抵消指定提交的改动（不改写历史）
\`\`\`

- reset 改写历史，适合"还没 push"的本地提交
- revert 不改写历史，适合"已 push"的公共提交

### 4.2 基本用法

\`\`\`bash
# 撤销指定提交（生成一个新的反向提交）
git revert a1b2c3d
# 会打开编辑器让你确认 revert 提交信息
# 默认信息：Revert "原提交信息"

# 撤销最近一次提交
git revert HEAD

# 不打开编辑器，用默认信息
git revert --no-edit a1b2c3d
\`\`\`

### 4.3 revert 的效果

\`\`\`text
原历史：
  A ── B ── C ── D   （HEAD）

执行 git revert B：

  A ── B ── C ── D ── B'   （B' 是 B 的反向，抵消 B 的改动）
                                  ↑ HEAD

历史里 B 还在，只是它的改动被 B' 抵消了。这是"安全"的撤销。
\`\`\`

### 4.4 处理冲突

\`\`\`bash
git revert a1b2c3d
# 如果 a1b2c3d 的改动与后续提交冲突，会提示
# 解决冲突后：
git add .
git revert --continue

# 放弃
git revert --abort
\`\`\`

### 4.5 撤销一次合并提交

\`\`\`bash
# 合并提交有两个父提交，revert 需要指定保留哪一边
git revert -m 1 a1b2c3d
# -m 1 表示保留"主分支（第 1 父）"那一侧，撤销"被合并分支"带来的改动
# -m 2 则相反

# 适用：错误地合并了一个 feature 分支，想撤销这次合并
\`\`\`

### 4.6 何时用 reset，何时用 revert

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  场景                          │ 用 reset │ 用 revert         │
├──────────────────────────────────────────────────────────────┤
│  本地未 push 的提交想撤销       │   ✅     │                  │
│  已 push 到个人分支想撤销       │   ✅+force│                  │
│  已 push 到公共分支想撤销       │   ❌     │   ✅             │
│  想保留"撤销"这一动作的痕迹     │          │   ✅             │
│  生产环境回滚某次发布           │          │   ✅             │
└──────────────────────────────────────────────────────────────┘
\`\`\`

---

## 五、git reflog：找回"丢失"的提交

### 5.1 reflog 是什么

reflog（reference log）记录 HEAD 和分支指针的**所有移动历史**，包括被 reset、rebase、revert 删掉的提交。它是 Git 的"后悔药"。

\`\`\`bash
# 查看 HEAD 的移动历史
git reflog
# 输出示例：
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# d4e5f6g HEAD@{1}: commit: feat: 新功能
# 9876543 HEAD@{2}: checkout: moving from main to feature
# ...
\`\`\`

注意：reflog 是**本地**的，不会被 push。它只在你这台机器上记录。

### 5.2 救命场景：误删的提交

\`\`\`bash
# 场景：你不小心 reset --hard 删了一个提交
git reset --hard HEAD~1
# 完蛋，那个提交没了？

# 别慌，看 reflog
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# d4e5f6g HEAD@{1}: commit: feat: 新功能   ← 这就是被删的提交！

# 恢复：把分支指针移回去
git reset --hard d4e5f6g
# 提交又回来了

# 或者用 cherry-pick 把那个提交"摘"回来
git cherry-pick d4e5f6g
\`\`\`

### 5.3 误删分支的恢复

\`\`\`bash
# 不小心删了 feature 分支
git branch -D feature/login

# 从 reflog 找回
git reflog
# 找到 feature/login 最后一次的 hash，比如 a1b2c3d

# 重新建分支指向那个提交
git branch feature/login a1b2c3d
# 分支恢复了
\`\`\`

### 5.4 reflog 的保留期

\`\`\`text
- 默认 reflog 保留 90 天（可达的提交）
- 不可达的提交保留 30 天
- 超过期限会被 git gc 清理
- 所以"后悔"要趁早
\`\`\`

---

## 六、git tag：版本标签

### 6.1 tag 是什么

tag 是给某次提交打上的"书签"，常用于标记发布版本（v1.0.0、v2.1.3）。与分支不同，tag 是**固定指针**，不会随提交移动。

### 6.2 轻量标签 vs 附注标签

\`\`\`bash
# 轻量标签：只是一个指向提交的指针
git tag v1.0.0
git tag v1.0.0 a1b2c3d   # 给指定提交打标签

# 附注标签（推荐）：包含标签信息、打标签者、日期、签名
git tag -a v1.0.0 -m "发布版本 1.0.0"
# -a = annotated，-m = 标签说明

# 给历史提交打附注标签
git tag -a v0.9.0 -m "历史版本" a1b2c3d
\`\`\`

### 6.3 查看标签

\`\`\`bash
# 查看所有标签
git tag
# v0.9.0
# v1.0.0
# v1.1.0

# 按模式过滤
git tag -l "v1.*"
# v1.0.0
# v1.1.0

# 查看标签详情（附注标签）
git show v1.0.0
# 输出：标签信息 + 对应提交的 diff
\`\`\`

### 6.4 推送标签

\`\`\`bash
# 默认 push 不带标签，需单独推
git push origin v1.0.0        # 推单个标签
git push origin --tags        # 推送所有标签

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0   # 旧语法
\`\`\`

### 6.5 语义化版本（SemVer）

\`\`\`text
版本号格式：MAJOR.MINOR.PATCH  (例 2.1.3)

  MAJOR  主版本：不兼容的 API 变更（2.x.x → 3.0.0）
  MINOR  次版本：向后兼容的新功能（2.1.x → 2.2.0）
  PATCH  修订号：向后兼容的 bug 修复（2.1.3 → 2.1.4）

预发布版本：v1.0.0-alpha、v1.0.0-beta.1、v1.0.0-rc.1
\`\`\`

### 6.6 检出某个版本

\`\`\`bash
# 查看某个版本的代码（ detached HEAD 状态）
git checkout v1.0.0
# HEAD detached at v1.0.0
# 这时你不在任何分支上，只是"查看"历史快照

# 如果想基于这个版本修改，新建分支
git switch -c hotfix/v1.0.x v1.0.0
\`\`\`

---

## 七、git bisect：二分查找 bug

### 7.1 场景

代码昨天还好好的，今天突然有个 bug。你不知道是哪次提交引入的，提交历史有几十上百个。手动一个个查太慢。\`git bisect\` 用二分法快速定位"罪魁祸首"提交。

### 7.2 基本流程

\`\`\`bash
# 1. 启动 bisect
git bisect start

# 2. 标记当前（坏）版本
git bisect bad

# 3. 标记一个已知的好版本（比如 v1.0.0）
git bisect good v1.0.0
# Git 会自动 checkout 到中间的提交
# Bisecting: 5 revisions left to test after this
# [a1b2c3d] feat: 添加 X

# 4. 测试当前代码
python test.py
# 如果还是坏的
git bisect bad
# Git 继续二分到下一个中间提交

# 如果是好的
git bisect good

# 5. 重复 4，直到 Git 报告：
# a1b2c3d is the first bad commit
# 即定位到引入 bug 的提交！

# 6. 结束 bisect，回到原分支
git bisect reset
\`\`\`

### 7.3 自动化 bisect

\`\`\`bash
# 提供一个测试脚本，Git 自动二分
git bisect start HEAD v1.0.0
git bisect run python test_bug.py
# Git 自动 checkout、运行脚本、根据退出码判断好坏
# 脚本退出码 0 = good，非 0 = bad
\`\`\`

### 7.4 bisect 的效率

如果有 N 个提交需要排查，bisect 最多 \`log2(N)\` 次就能定位。100 个提交只需 7 次，1000 个提交只需 10 次。

---

## 八、其他实用高级命令

### 8.1 git blame：谁写了这行

\`\`\`bash
# 查看文件每行最后修改人和提交
git blame app.py
# 输出示例：
# a1b2c3d4 (张三 2024-01-04 10:00:00 1) def login():
# b2c3d4e5 (李四 2024-01-03 18:00:00 2)     return None

# 只看某几行
git blame -L 10,20 app.py
\`\`\`

⚠️ blame 是"最后修改人"，不一定是"原作者"。用于"找谁问这行代码"，不要用于"甩锅"。

### 8.2 git show：查看某次提交

\`\`\`bash
# 查看某次提交的详情（信息 + diff）
git show a1b2c3d

# 查看某次提交的某文件改动
git show a1b2c3d -- app.py

# 查看某个标签对应的提交
git show v1.0.0
\`\`\`

### 8.3 git clean：清理未跟踪文件

\`\`\`bash
# 预览要删的文件
git clean -n
# -n = dry run，只看不删

# 删除未跟踪文件
git clean -f
# -f = force

# 同时删除未跟踪目录
git clean -fd

# 同时删除 .gitignore 忽略的文件（如 build 产物）
git clean -fdx
# 慎用 -x，会删 .env 等被忽略的文件
\`\`\`

### 8.4 git mv：重命名/移动文件

\`\`\`bash
# 重命名（Git 会识别为重命名而非删+增）
git mv old_name.py new_name.py
git commit -m "refactor: 重命名 old_name 为 new_name"

# 等价于：mv + git add + git rm，但 git mv 一步到位
\`\`\`

---

## 九、综合实战：救火流程

\`\`\`bash
# 场景：生产环境发现严重 bug，需要快速回滚

# 1. 看最近发布打了什么 tag
git tag --sort=-creatordate | head -5
# v1.2.0
# v1.1.0
# v1.0.0

# 2. 假设 v1.2.0 是出问题的版本，v1.1.0 是上个稳定版
# 用 revert 撤销 v1.2.0 引入的提交（安全，不改写历史）
git log v1.1.0..v1.2.0 --oneline
# a1b2c3d feat: 新功能X   ← 嫌疑提交
# b2c3d4e fix: 修复Y

git revert a1b2c3d
# 生成反向提交，撤销新功能X

# 3. 推送修复
git push origin main

# 4. 打新版本标签
git tag -a v1.2.1 -m "hotfix: 回滚 v1.2.0 的问题"
git push origin v1.2.1

# 5. 部署 v1.2.1
\`\`\`

---

## 十、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  高级命令速查                                                 │
├──────────────────────────────────────────────────────────────┤
│  git stash / pop          临时存取工作区改动                  │
│  git cherry-pick <hash>   挑单个提交到当前分支                │
│  git reset --soft/mixed/hard  三种回退强度                    │
│  git revert <hash>        用反向提交撤销（公共分支安全）      │
│  git reflog               找回丢失的提交/分支                 │
│  git tag -a v1.0.0 -m ""  打附注标签                          │
│  git bisect start/bad/good  二分查 bug                       │
│  git blame <file>         查每行最后修改人                    │
│  git show <hash>          看某次提交详情                      │
│  git clean -fd            清理未跟踪文件                      │
└──────────────────────────────────────────────────────────────┘
\`\`\`

记住：

- **本地未 push** → reset
- **已 push 公共分支** → revert
- **代码"丢了"** → 先看 reflog，几乎都能找回
- **找 bug 引入点** → bisect

下一章我们讲 Git 的深度配置、别名、SSH/GPG、hooks，让你把 Git 调教得顺手。
`
  },

  {
    id: "deploy-git-config",
    icon: "⚙️",
    title: "配置与别名",
    group: "Git 版本控制",
    content: `# 配置与别名

Git 默认配置"能用"但不够"顺手"。这一章把 Git 的配置体系、常用配置项、别名、SSH 免密、GPG 签名、hooks 讲清楚，帮你打造一套高效、安全、个性化的 Git 工作环境。

## 一、配置的三层体系

第一章提过，Git 配置分三层，优先级从高到低：

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  级别     │ 文件位置                    │ 作用范围   │ 优先级 │
├──────────────────────────────────────────────────────────────┤
│  --local  │ .git/config（仓库内）        │ 仅当前仓库 │  最高  │
│  --global │ ~/.gitconfig（用户主目录）   │ 当前用户   │  中    │
│  --system │ /etc/gitconfig（系统目录）   │ 整台机器   │  最低  │
└──────────────────────────────────────────────────────────────┘
\`\`\`

读取时，低层提供默认值，高层覆盖低层。例如 \`user.name\` 在 global 设了"张三"，在某个仓库 local 设了"工作张三"，那么该仓库提交时用的是"工作张三"。

### 1.1 设置与查看

\`\`\`bash
# 设置全局配置
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"

# 设置仓库级配置（只对当前仓库生效）
git config --local user.name "公司张三"
git config --local user.email "zhangsan@company.com"

# 设置系统级配置（需 sudo，影响所有用户）
sudo git config --system core.editor vim

# 查看所有生效配置（三层合并结果）
git config --list

# 查看某一项
git config user.name

# 查看配置来源
git config --list --show-origin
\`\`\`

### 1.2 编辑配置文件

\`\`\`bash
# 直接编辑 global 配置文件
git config --global --edit
# 会用 core.editor 打开 ~/.gitconfig

# 编辑当前仓库配置
git config --local --edit
\`\`\`

\`~/.gitconfig\` 的真实样子：

\`\`\`ini
[user]
    name = 张三
    email = zhangsan@example.com
[core]
    editor = vim
    quotepath = false
[init]
    defaultBranch = main
[alias]
    st = status
    co = checkout
[pull]
    rebase = true
\`\`\`

### 1.3 删除配置项

\`\`\`bash
# 删除某项配置
git config --global --unset user.name

# 删除某个 section 下所有项
git config --global --remove-section alias
\`\`\`

---

## 二、常用配置项详解

### 2.1 用户身份

\`\`\`bash
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"
\`\`\`

建议邮箱用 GitHub 注册邮箱，提交才能关联到 GitHub 头像。公司项目可在仓库级单独配公司邮箱。

### 2.2 编辑器

\`\`\`bash
# vim（命令行）
git config --global core.editor "vim"

# VS Code（需先装 code 命令）
git config --global core.editor "code --wait"

# nano（新手友好）
git config --global core.editor "nano"

# Sublime Text
git config --global core.editor "subl -n -w"
\`\`\`

### 2.3 默认分支名

\`\`\`bash
# git init 默认创建的分支名
git config --global init.defaultBranch main
\`\`\`

旧版 Git 默认 \`master\`，新版已改 \`main\`。显式设置避免混淆。

### 2.4 中文文件名显示

默认 Git 在 status/ls-files 里会把中文文件名转义成 \`\\346\\210\\221\` 这种八进制，看不懂：

\`\`\`bash
# 关闭转义，正常显示中文
git config --global core.quotepath false
\`\`\`

### 2.5 换行符处理

不同系统换行符不同（Linux/Mac: LF，Windows: CRLF），跨平台协作容易出问题：

\`\`\`bash
# Windows：提交时转 LF，检出时转 CRLF
git config --global core.autocrlf true

# macOS/Linux：提交时转 LF，检出时不转
git config --global core.autocrlf input

# 关闭自动转换
git config --global core.autocrlf false
\`\`\`

更推荐用 \`.gitattributes\` 文件在仓库级别声明：

\`\`\`text
* text=auto
*.py text eol=lf
*.bat text eol=crlf
*.png binary
\`\`\`

### 2.6 pull 与 push 行为

\`\`\`bash
# pull 时默认用 rebase（保持线性历史）
git config --global pull.rebase true

# pull 冲突时默认行为：merge / rebase / ff-only
git config --global pull.rebase true

# push 默认推当前分支
git config --global push.default current

# 推送时自动建立跟踪关系
git config --global push.autoSetupRemote true
\`\`\`

### 2.7 颜色

\`\`\`bash
# 开启所有颜色
git config --global color.ui auto

# 自定义颜色
git config --global color.status.changed "yellow bold"
git config --global color.status.untracked "red bold"
\`\`\`

### 2.8 diff 与 merge 工具

\`\`\`bash
# 配置 VS Code 为 diff/merge 工具
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# 使用工具
git difftool
git mergetool
\`\`\`

### 2.9 其他实用项

\`\`\`bash
# 让 git 在删除分支前确认（防误删）
# （无直接配置，但 -d 已是安全删除）

# 提高长路径支持（Windows）
git config --global core.longpaths true

# 设置 commit 模板
git config --global commit.template ~/.gitmessage
# 之后 git commit 不带 -m 会用这个模板

# 记住凭证（HTTPS 免密，见 SSH 章节替代方案）
git config --global credential.helper osxkeychain   # macOS
git config --global credential.helper manager       # Windows
git config --global credential.helper store         # Linux（明文，慎用）
\`\`\`

---

## 三、git alias：命令别名

### 3.1 为什么用别名

\`git status\`、\`git checkout\`、\`git commit\` 这些命令天天敲，太长。别名能让你敲 \`git st\` 就等于 \`git status\`，省时省力。

### 3.2 设置别名

\`\`\`bash
# 基本别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.sw switch

# 之后这些等价
git st        # git status
git co main   # git checkout main
git ci -m "msg"   # git commit -m "msg"
\`\`\`

### 3.3 带参数和选项的别名

\`\`\`bash
# 别名可以包含选项
git config --global alias.lg "log --oneline --graph --all"
# 之后 git lg 就是漂亮的图形日志

# last：看最近一次提交
git config --global alias.last "log -1 HEAD"

# unstage：撤销暂存
git config --global alias.unstage "reset HEAD --"
# git unstage app.py = git reset HEAD -- app.py
\`\`\`

### 3.4 用 ! 执行外部命令

别名以 \`!\` 开头时，执行的是 shell 命令而非 git 子命令：

\`\`\`bash
# amend：修改上次提交信息
git config --global alias.amend "commit --amend --no-edit"

# 强推当前分支
git config --global alias.force "push --force-with-lease"

# 删除已合并的本地分支（除 main）
git config --global alias.cleanup "!git branch --merged | grep -v 'main$' | xargs git branch -d"

# 新建并切换分支
git config --global alias.cob "checkout -b"

# 别名里调用 git 多次
git config --global alias.pushall "!git push origin main && git push origin develop"
\`\`\`

### 3.5 推荐的别名集

\`\`\`bash
# 状态与日志
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.ll "log --pretty=format:'%C(yellow)%h%C(reset) - %C(green)(%cr)%C(reset) %C(bold)<%an>%C(reset) %s' --abbrev-commit"

# 提交相关
git config --global alias.ci "commit"
git config --global alias.ca "commit --amend"
git config --global alias.co "checkout"
git config --global alias.cob "checkout -b"

# 分支
git config --global alias.br "branch"
git config --global alias.bd "branch -d"

# 暂存
git config --global alias.aa "add --all"
git config --global alias.ap "add -p"
git config --global alias.unstage "restore --staged"

# diff
git config --global alias.d "diff"
git config --global alias.ds "diff --staged"

# 远程
git config --global alias.po "push origin"
git config --global alias.plo "pull origin"
git config --global alias.fo "fetch origin"

# 救命
git config --global alias.aliases "!git config --list --grep alias"
\`\`\`

### 3.6 别名在配置文件中的样子

编辑 \`~/.gitconfig\`：

\`\`\`ini
[alias]
    st = status -sb
    lg = log --oneline --graph --decorate --all
    ci = commit
    co = checkout
    aa = add --all
    d = diff
\`\`\`

### 3.7 查看所有别名

\`\`\`bash
git config --get-regexp alias
# 或用我们设的别名
git aliases
\`\`\`

---

## 四、SSH 密钥配置：免密推送

每次 \`git push\` 都输密码很烦。配置 SSH 密钥后，认证一次，永久免密（直到你换机器或撤销）。

### 4.1 检查是否已有密钥

\`\`\`bash
ls -al ~/.ssh
# 看是否有 id_ed25519 / id_rsa 等文件
# 有 .pub 后缀的是公钥，没后缀的是私钥

# 输出示例：
# -rw-------  id_ed25519       ← 私钥（保密！）
# -rw-r--r--  id_ed25519.pub   ← 公钥（可公开）
\`\`\`

### 4.2 生成 SSH 密钥

\`\`\`bash
# 生成 ed25519 密钥（推荐，更安全更快）
ssh-keygen -t ed25519 -C "zhangsan@example.com"
# -t 指定算法，-C 加注释（通常用邮箱）

# 一路回车使用默认值，或自定义路径/密码
# Enter file in which to save the key: 回车用默认 ~/.ssh/id_ed25519
# Enter passphrase: 可设私钥密码（更安全），也可留空（更方便）

# 旧系统不支持 ed25519 时用 RSA
ssh-keygen -t rsa -b 4096 -C "zhangsan@example.com"
# -b 4096 指定密钥长度
\`\`\`

### 4.3 启动 ssh-agent 并添加密钥

\`\`\`bash
# 启动 ssh-agent
eval "$(ssh-agent -s)"
# 输出：Agent pid 12345

# 添加私钥到 agent（macOS 用 keychain 保管密码）
ssh-add ~/.ssh/id_ed25519
# 若设了 passphrase 会要求输入一次，之后 agent 记住

# macOS 持久化到 keychain
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
\`\`\`

### 4.4 配置 ~/.ssh/config（多账号管理）

\`\`\`bash
vim ~/.ssh/config
\`\`\`

\`\`\`text
# 默认 GitHub 账号
Host github.com
    HostName github.com
    User git
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_ed25519

# 公司 GitLab 账号（用不同密钥）
Host gitlab.company.com
    HostName gitlab.company.com
    User git
    IdentityFile ~/.ssh/id_ed25519_company

# 第二个 GitHub 账号（个人项目）
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
\`\`\`

之后用 \`git clone git@github-personal:me/personal-repo.git\` 就会用个人密钥。

### 4.5 添加公钥到 GitHub

\`\`\`bash
# 复制公钥内容
cat ~/.ssh/id_ed25519.pub
# 或 macOS
pbcopy < ~/.ssh/id_ed25519.pub
# Windows（Git Bash）
clip < ~/.ssh/id_ed25519.pub
\`\`\`

到 GitHub：\`Settings → SSH and GPG keys → New SSH key\`，粘贴公钥，保存。

### 4.6 测试 SSH 连接

\`\`\`bash
ssh -T git@github.com
# 输出：
# Hi zhangsan! You've successfully authenticated, but GitHub does not provide shell access.

# 测试 GitLab
ssh -T git@gitlab.com
\`\`\`

### 4.7 把现有仓库从 HTTPS 改成 SSH

\`\`\`bash
git remote -v
# origin  https://github.com/me/repo.git (fetch)

git remote set-url origin git@github.com:me/repo.git

git remote -v
# origin  git@github.com:me/repo.git (fetch)
# 现在 push/pull 免密
\`\`\`

---

## 五、GPG 签名提交

SSH 解决"免密"，GPG 解决"身份可信"。GPG 签名能让别人验证"这个提交确实是我做的"，防止冒名。

### 5.1 为什么需要 GPG 签名

\`git config user.name\` 谁都能填，理论上你也能用别人的名字提交。GitHub 上显示的"Verified"绿色标记就是 GPG 签名验证的。

### 5.2 安装 GPG

\`\`\`bash
# macOS
brew install gnupg

# Ubuntu
sudo apt install gnupg -y

# Windows：随 Git for Windows 安装
\`\`\`

### 5.3 生成 GPG 密钥

\`\`\`bash
gpg --full-generate-key
# 依次选择：
# 密钥类型：RSA and RSA (default)
# 密钥长度：4096
# 有效期：0（永不过期）或自定义
# 真实姓名：张三
# 邮箱：zhangsan@example.com  （必须和 GitHub 邮箱一致）
# 注释：可留空

# 列出密钥
gpg --list-secret-keys --keyid-format=long
# 输出示例：
# sec   rsa4096/ABCDEF1234567890 2024-01-04 [SC]
# ABCDEF1234567890 就是密钥 ID
\`\`\`

### 5.4 导出公钥并添加到 GitHub

\`\`\`bash
# 导出公钥
gpg --armor --export ABCDEF1234567890
# 复制输出的所有内容（包含 -----BEGIN PGP PUBLIC KEY BLOCK-----）

# 到 GitHub：Settings → SSH and GPG keys → New GPG key，粘贴
\`\`\`

### 5.5 配置 Git 使用 GPG 签名

\`\`\`bash
# 告诉 Git 用哪个密钥
git config --global user.signingkey ABCDEF1234567890

# 默认所有提交都签名
git config --global commit.gpgsign true

# 默认所有 tag 都签名
git config --global tag.gpgsign true
\`\`\`

### 5.6 单次签名/不签名

\`\`\`bash
# 单次签名（未设全局签名时）
git commit -S -m "feat: 重要安全修复"

# 单次不签名（已设全局签名时）
git commit --no-gpg-sign -m "chore: 临时提交"

# 验证签名
git verify-commit HEAD
\`\`\`

### 5.7 签名验证标记

\`\`\`bash
git log --show-signature -1
# 输出包含：
# gpg: Signature made ...
# gpg: Good signature from "张三 <zhangsan@example.com>"
# Primary key fingerprint: ...
\`\`\`

GitHub 上签名过的提交会显示绿色"Verified"。

---

## 六、Git Hooks 简介

Hooks（钩子）是 Git 在特定时机自动执行的脚本，让你在提交/推送前后插入自定义检查。

### 6.1 hooks 位置

\`\`\`bash
ls .git/hooks
# 输出：一堆 .sample 文件（默认禁用的示例）
# 去掉 .sample 后缀即启用

# 例：pre-commit.sample → pre-commit（启用提交前钩子）
\`\`\`

### 6.2 常用钩子

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  钩子              │ 触发时机           │ 典型用途             │
├──────────────────────────────────────────────────────────────┤
│  pre-commit        │ commit 前          │ 代码检查、格式化     │
│  prepare-commit-msg│ 编辑提交信息前     │ 自动填模板           │
│  commit-msg        │ 提交信息写完后     │ 校验信息格式         │
│  post-commit       │ commit 后          │ 通知、发邮件         │
│  pre-push          │ push 前            │ 跑测试、阻止推送     │
│  pre-rebase        │ rebase 前          │ 防止 rebase 已推提交 │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### 6.3 pre-commit 钩子示例：阻止提交含 TODO 的代码

\`\`\`bash
# 创建 .git/hooks/pre-commit
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
# 检查暂存区文件里有没有 TODO
if git diff --cached --name-only | xargs grep -l "TODO" 2>/dev/null; then
    echo "❌ 检测到 TODO，请处理后再提交"
    exit 1   # 非 0 退出码会阻止提交
fi
exit 0
EOF

chmod +x .git/hooks/pre-commit   # 必须可执行
\`\`\`

之后提交时如果代码里有 TODO，会被拦截：

\`\`\`bash
echo "# TODO: 待实现" >> app.py
git add app.py && git commit -m "test"
# ❌ 检测到 TODO，请处理后再提交
# 提交被拒绝
\`\`\`

### 6.4 commit-msg 钩子：校验提交信息规范

\`\`\`bash
cat > .git/hooks/commit-msg <<'EOF'
#!/bin/bash
# $1 是提交信息临时文件路径
msg=$(cat "$1")
# 校验是否符合 Conventional Commits
if ! echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
    echo "❌ 提交信息不符合规范！"
    echo "格式：<类型>(<范围>): <描述>"
    echo "类型：feat|fix|docs|style|refactor|test|chore"
    exit 1
fi
exit 0
EOF

chmod +x .git/hooks/commit-msg
\`\`\`

### 6.5 pre-push 钩子：推送前跑测试

\`\`\`bash
cat > .git/hooks/pre-push <<'EOF'
#!/bin/bash
echo "🏃 推送前跑测试..."
pytest tests/
if [ $? -ne 0 ]; then
    echo "❌ 测试失败，推送被阻止"
    exit 1
fi
echo "✅ 测试通过，允许推送"
exit 0
EOF

chmod +x .git/hooks/pre-push
\`\`\`

### 6.6 hooks 的局限与工具

\`.git/hooks\` 不会被 git 跟踪，团队共享困难。常用工具：

\`\`\`bash
# husky：Node 项目常用，把 hooks 放进项目仓库
# pre-commit：Python/通用框架，配置文件管理钩子
# 在部署 CI 章节会详讲
\`\`\`

---

## 七、配置实战：新机器初始化脚本

\`\`\`bash
#!/bin/bash
# 新机器 Git 环境一键配置

echo "=== 配置用户身份 ==="
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"

echo "=== 配置编辑器与基础项 ==="
git config --global core.editor "vim"
git config --global core.quotepath false
git config --global init.defaultBranch main
git config --global color.ui auto
git config --global pull.rebase true
git config --global push.default current
git config --global push.autoSetupRemote true

echo "=== 配置别名 ==="
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.ci "commit"
git config --global alias.co "checkout"
git config --global alias.aa "add --all"
git config --global alias.d "diff"
git config --global alias.ds "diff --staged"

echo "=== 完成 ==="
git config --list
\`\`\`

把这个脚本存起来，换机器时跑一遍即可。

---

## 八、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  配置要点                                                     │
├──────────────────────────────────────────────────────────────┤
│  三层：local > global > system                                │
│  身份：user.name / user.email（邮箱与 GitHub 一致）           │
│  体验：core.editor / color.ui / core.quotepath false         │
│  行为：init.defaultBranch main / pull.rebase true             │
│  别名：alias.xx "..."  /  ! 开头执行 shell                    │
│  免密：ssh-keygen → 添加公钥到 GitHub → set-url 用 SSH        │
│  签名：gpg 密钥 → commit.gpgsign true → Verified 标记         │
│  钩子：.git/hooks/ 下脚本，pre-commit/commit-msg/pre-push     │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# 一句话总结：
# global 配置管"个人习惯"，SSH/GPG 管"身份认证"，hooks 管"流程自动化"。
\`\`\`

下一章我们讲团队协作的规范与最佳实践，让你的 Git 使用从"会"到"专业"。
`
  },

  {
    id: "deploy-git-best-practices",
    icon: "💡",
    title: "提交规范与最佳实践",
    group: "Git 版本控制",
    content: `# 提交规范与最佳实践

前面五章你学会了 Git 的所有核心操作。这一章讲"怎么用得专业"——提交规范、原子提交、分支命名、Code Review、.gitignore 最佳实践、大文件处理、子模块。这些是把个人技能转化为团队协作效率的关键。

## 一、Conventional Commits 提交规范

### 1.1 为什么需要提交规范

没有规范的提交历史长这样：

\`\`\`text
a1b2c3d update
b2c3d4e 修改
c3d4e5f fix
d4e5f6g 111
e5f6g7h 终于好了
f6g7h8i 改了点东西
\`\`\`

这样的历史：看不出改了什么、无法自动生成 changelog、无法回滚某类改动、无法过滤搜索。规范化的提交信息能解决这一切。

### 1.2 Conventional Commits 是什么

Conventional Commits（约定式提交）是一种社区规范，定义提交信息的标准格式。被 Angular、Vue、React、Electron 等大量项目采用，能配合工具自动生成版本号和 changelog。

### 1.3 提交信息格式

\`\`\`text
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
\`\`\`

完整示例：

\`\`\`text
feat(api): 添加用户登录接口

使用 JWT 生成 token，有效期 7 天。
支持 refresh token 自动续期。

Closes #123
BREAKING CHANGE: 登录接口返回结构变更，旧客户端需升级
\`\`\`

### 1.4 类型（type）详解

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  类型      │ 含义                          │ 示例                │
├──────────────────────────────────────────────────────────────┤
│  feat      │ 新功能                         │ feat: 添加搜索      │
│  fix       │ 修复 bug                       │ fix: 修复登录崩溃   │
│  docs      │ 文档变更                       │ docs: 更新 README   │
│  style     │ 格式（不影响代码逻辑）         │ style: 调整缩进     │
│  refactor  │ 重构（非新增功能也非修 bug）   │ refactor: 拆分函数  │
│  perf      │ 性能优化                       │ perf: 缓存查询结果  │
│  test      │ 测试相关                       │ test: 补充登录测试  │
│  build     │ 构建/依赖                      │ build: 升级 Django  │
│  ci        │ CI 配置                        │ ci: 添加部署任务    │
│  chore     │ 杂务（不改源码也不改测试）     │ chore: 改 .gitignore│
│  revert    │ 撤销某次提交                   │ revert: 撤销 xxx    │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### 1.5 范围（scope）可选

\`\`\`bash
# scope 表示改动影响的模块，写在括号里
feat(auth): 添加 JWT 鉴权
fix(api): 修复用户接口 500
docs(readme): 补充安装说明
refactor(utils): 提取日期处理函数
\`\`\`

### 1.6 描述（subject）

\`\`\`text
规则：
- 用祈使句、现在时："添加" 而非 "添加了"
- 首字母小写（英文）
- 结尾不加句号
- 不超过 50 字符

好：feat: 添加用户注册功能
差：feat: 我添加了一个用户注册的功能。   ← 太啰嗦、有句号、过去时
\`\`\`

### 1.7 正文（body）可选

\`\`\`text
feat: 添加用户注册功能

- 支持邮箱和手机号注册
- 密码使用 bcrypt 哈希存储
- 注册成功发送欢迎邮件
- 限制同一邮箱 1 分钟内只能注册一次

正文解释"为什么"和"做了什么"，每行不超过 72 字符。
\`\`\`

### 1.8 脚注（footer）

\`\`\`text
Closes #123                    关联 issue，合并后自动关闭 issue
Co-authored-by: 李四 <l@x.com> 标注共同作者
BREAKING CHANGE: ...           破坏性变更（必须大写）
\`\`\`

### 1.9 破坏性变更标记

两种写法：

\`\`\`text
# 方式一：脚注
feat(api): 重构用户接口
BREAKING CHANGE: 接口返回结构从 {code,msg,data} 改为 {ok,data,error}

# 方式二：类型后加 !
feat(api)!: 重构用户接口，返回结构变更
\`\`\`

工具会据此自动升主版本号（1.x.x → 2.0.0）。

### 1.10 合规与不合规对比

\`\`\`text
✅ 合规：
  feat: 添加用户登录
  fix(auth): 修复 token 过期判断
  docs: 更新部署文档
  refactor: 提取密码哈希函数
  chore(deps): 升级 Flask 到 3.0

❌ 不合规：
  update                      没类型、没描述
  修复 bug                    没类型
  feat: 我修改了一些东西       描述太空泛
  feat:添加登录               冒号后没空格
  Feat: 添加登录              类型大写
\`\`\`

### 1.11 工具支持：commitlint + commitizen

\`\`\`bash
# commitlint：校验提交信息是否符合规范（配 commit-msg hook）
npm install --save-dev @commitlint/config-conventional @commitlint/cli

# 配置
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# commitizen：交互式生成规范提交
npm install --save-dev commitizen cz-conventional-changelog
# 之后用 git cz 代替 git commit，会引导你选类型、写描述

# standard-version / release-please：自动生成版本号和 changelog
\`\`\`

---

## 二、原子提交原则

### 2.1 什么是原子提交

原子提交（Atomic Commit）= 每次提交只做"一件事"，是一个完整的、可独立理解的最小改动单元。

### 2.2 反面案例：一个提交塞太多

\`\`\`bash
# 错误：把多个无关改动塞进一次提交
git add .
git commit -m "feat: 添加登录、修复注册bug、改了README、升级依赖"
\`\`\`

问题：

- 无法单独回滚"升级依赖"而不影响"添加登录"
- review 时很难看懂这么大改动
- bisect 定位 bug 时粒度太粗
- changelog 生成混乱

### 2.3 正面案例：拆成多个原子提交

\`\`\`bash
git commit -m "feat(auth): 添加用户登录接口"
git commit -m "fix(auth): 修复注册时邮箱校验缺失"
git commit -m "docs: 更新登录接口说明"
git commit -m "chore(deps): 升级 Flask 到 3.0"
\`\`\`

每个提交都只做一件事，可以单独 review、单独 revert、单独 cherry-pick。

### 2.4 如何实现原子提交

\`\`\`bash
# 用 git add -p 按代码块暂存
git add -p
# 一次只暂存一个功能相关的改动，提交，再暂存下一个

# 用交互式 rebase 整理：把一个大提交拆成多个
git rebase -i HEAD~3
# 把 pick 改成 edit，然后 git reset HEAD^ 把提交拆开，重新分多次提交
\`\`\`

### 2.5 判断"原子"的标准

\`\`\`text
问自己几个问题：
1. 这次提交能独立运行/通过测试吗？  → 能
2. 这次提交只解决一个问题吗？       → 是
3. 提交信息能用一句话说清吗？       → 能
4. 如果要 revert 这次提交，会牵连其他功能吗？ → 不会

四个都满足，就是好的原子提交。
\`\`\`

---

## 三、分支命名规范

### 3.1 通用前缀

\`\`\`text
feature/xxx    新功能
fix/xxx        修 bug
hotfix/xxx     紧急修复（直接从主干切）
refactor/xxx   重构
docs/xxx       文档
chore/xxx      杂务
release/x.x.x  发布分支
experiment/xxx 实验性（可能不合并）
\`\`\`

### 3.2 带 issue 号

\`\`\`bash
feature/USER-123-user-login
fix/BUG-456-payment-crash
\`\`\`

关联 issue 跟踪系统，方便追溯。

### 3.3 命名规则

\`\`\`text
✅ 好：
  feature/user-login        清晰、小写、连字符分隔
  fix/login-404
  hotfix/payment-timeout

❌ 差：
  my-branch                 没意义
  fix                       太泛
  Feature/UserLogin         大小写混乱
  fix_login_404             下划线不如连字符易读
  fix-login-404-urgent-!!!  太长、特殊字符
\`\`\`

### 3.4 分支生命周期

\`\`\`text
1. 从主干切出（feature 从 develop/main）
2. 开发、提交、推送
3. 开 PR，review
4. 合并回主干
5. 删除分支（本地 + 远程）

不要让分支活太久：feature 分支建议不超过一周，长了冲突多。
\`\`\`

---

## 四、Code Review 流程

### 4.1 Code Review 的价值

- **找 bug**：第二双眼睛能发现你忽略的问题
- **知识共享**：让团队了解各模块的改动
- **质量门槛**：阻止低质量代码进主干
- **传帮带**：新人通过 review 学习老代码，老人通过 review 指导新人

### 4.2 PR（Pull Request）流程

\`\`\`text
1. 开发者在 feature 分支完成开发，自测通过
2. 推送到远程
3. 在 GitHub/GitLab 发起 PR：feature → main
4. 指定 reviewer（至少 1 人，重要改动 2+ 人）
5. CI 自动跑测试/lint/构建
6. reviewer 审查代码，留评论
7. 作者根据评论修改，推送更新
8. reviewer 批准（approve）
9. 合并（merge/squash/rebase）
10. 删除 feature 分支
\`\`\`

### 4.3 合并方式选择

\`\`\`text
┌────────────────────────────────────────────────────────────────┐
│  方式      │ 行为                          │ 历史效果            │
├────────────────────────────────────────────────────────────────┤
│  Merge     │ 产生合并提交，保留分支轨迹     │ 网状，可追溯        │
│  Squash    │ 把多个提交压成一个             │ 线性，历史干净      │
│  Rebase    │ 把提交逐个"接"到主干           │ 线性，保留每次提交  │
└────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.4 Squash 合并的建议

\`\`\`text
- 功能分支上有 5 个零碎提交（"改 bug1"、"再改"、"又改"、"格式化"、"最终版"）
- 合并时用 Squash 把它们压成 1 个干净的提交
- 主干历史只看到一次"feat: 添加用户登录"，不被噪音淹没

GitHub 上：PR 合并按钮旁选 "Squash and merge"
命令行：git merge --squash feature/login && git commit
\`\`\`

### 4.5 Review 的关注点

\`\`\`text
Review 时看什么：
1. 功能正确性：代码是否解决了它要解决的问题
2. 边界条件：空值、并发、超大输入、错误处理
3. 可读性：命名、注释、是否符合项目风格
4. 安全性：SQL 注入、XSS、密钥硬编码、权限校验
5. 性能：N+1 查询、不必要的循环、内存泄漏
6. 测试：是否补了测试、测试是否有效
7. 依赖：是否引入了不必要的第三方库

Review 评论的礼貌：
- 对事不对人："这里可能漏了空值判断" 而非 "你怎么又没判断空值"
- 给建议而非命令："考虑用 enumerate 替代 range(len(...))"
- 区分 must-fix（必须改）和 nit（小建议）
\`\`\`

### 4.6 PR 描述模板

\`\`\`text
## 改动说明
<!-- 这个 PR 做了什么，为什么 -->

## 改动类型
- [ ] 新功能
- [ ] bug 修复
- [ ] 重构
- [ ] 文档

## 自测清单
- [ ] 本地跑过测试
- [ ] 新增了对应测试
- [ ] 更新了文档

## 关联 Issue
Closes #123
\`\`\`

---

## 五、.gitignore 最佳实践

### 5.1 分层忽略

\`\`\`bash
# 项目根 .gitignore：团队共享的通用规则
# 个人 ~/.gitignore_global：你个人的私有规则（不影响团队）
git config --global core.excludesfile ~/.gitignore_global
\`\`\`

### 5.2 不要提交的东西

\`\`\`text
坚决不提交：
- 密钥/凭证：.env、*.pem、*.key、secrets.yaml
- 依赖目录：node_modules/、venv/、.venv/
- 构建产物：build/、dist/、*.pyc、__pycache__/
- IDE 配置：.idea/、.vscode/（团队统一配置除外）
- 系统文件：.DS_Store、Thumbs.db
- 大文件：视频、数据集、二进制（用 Git LFS）
- 日志：*.log、logs/
\`\`\`

### 5.3 误提交了敏感文件怎么办

\`\`\`bash
# 场景：不小心把 .env 提交了（含数据库密码）
# 第一步：立即轮换/修改所有泄露的密码！（比清历史更重要）

# 第二步：从历史里彻底清除
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: 移除误提交的 .env"

# 如果 .env 已经 push，历史里还在，用 filter-branch 或 BFG 清除：
# 用 BFG（推荐，更快）
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --hard

# 然后强制推送（需团队协调）
git push --force
\`\`\`

### 5.4 全局 .gitignore 模板

\`\`\`bash
# ~/.gitignore_global
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.log
\`\`\`

---

## 六、大文件处理：Git LFS

### 6.1 Git 管大文件的痛点

Git 设计之初是为文本代码服务的。当仓库里出现大文件（视频、模型权重、数据集、二进制安装包），会出现：

\`\`\`text
- clone/push 极慢：每个 clone 都拉全量历史，1GB 文件意味着每次 clone 多 1GB
- 仓库膨胀：二进制无法 diff，每次改都存一份完整副本
- 内存吃紧：Git 操作要把文件读进内存
\`\`\`

### 6.2 Git LFS 是什么

Git LFS（Large File Storage）把大文件的实际内容存到单独的 LFS 服务器，仓库里只保留一个轻量的"指针文件"。clone 时默认不拉大文件，需要时才按需下载。

\`\`\`text
普通 Git：仓库里存完整大文件 → 历史膨胀
Git LFS ：仓库里存指针（~130 字节）→ 大文件存 LFS 服务器，按需拉取
\`\`\`

### 6.3 安装与初始化

\`\`\`bash
# macOS
brew install git-lfs

# Ubuntu
sudo apt install git-lfs -y

# Windows：随 Git for Windows 安装

# 初始化（每台机器一次）
git lfs install
# 这会在 ~/.gitconfig 加上必要的 filter 配置
\`\`\`

### 6.4 跟踪大文件

\`\`\`bash
# 在仓库里指定哪些文件用 LFS 管理
git lfs track "*.psd"          # 所有 PSD 设计稿
git lfs track "*.mp4"          # 所有视频
git lfs track "models/*.pt"    # models 目录下的 PyTorch 模型
git lfs track "*.zip"          # 压缩包

# 这会生成/更新 .gitattributes 文件
cat .gitattributes
# *.psd filter=lfs diff=lfs merge=lfs -text
# *.mp4 filter=lfs diff=lfs merge=lfs -text

# 提交 .gitattributes（必须先提交它，再提交大文件）
git add .gitattributes
git commit -m "chore: 配置 Git LFS 跟踪规则"

# 然后正常添加大文件
git add design.psd
git commit -m "feat: 添加首页设计稿"
git push
\`\`\`

### 6.5 查看 LFS 文件

\`\`\`bash
# 查看当前用 LFS 管理的文件类型
git lfs track

# 查看仓库里实际的 LFS 对象
git lfs ls-files
\`\`\`

### 6.6 LFS 的注意事项

\`\`\`text
- GitHub 免费版 LFS 配额 1GB 存储 + 1GB/月 流量，超额要付费
- 已经提交进普通历史的大文件，转 LFS 需迁移历史（git lfs migrate）
- LFS 指针文件很小，但 clone 时若要工作区有真实内容仍需下载
\`\`\`

---

## 七、子模块：git submodule

### 7.1 什么时候需要子模块

当你的项目需要引用另一个独立 Git 仓库（比如公共组件库、第三方 SDK），又不想把它的代码直接复制进来，可以用 submodule 把它"挂载"为子仓库。

\`\`\`text
主仓库 my-app/
└── libs/
    └── common-lib/   ← 这是一个 submodule，指向另一个独立 Git 仓库
\`\`\`

### 7.2 添加子模块

\`\`\`bash
# 在当前仓库添加一个子模块
git submodule add https://github.com/team/common-lib.git libs/common-lib
# 会：
# 1. clone common-lib 到 libs/common-lib
# 2. 生成 .gitmodules 文件记录映射关系
# 3. 暂存 .gitmodules 和 libs/common-lib

git commit -m "chore: 添加 common-lib 子模块"
\`\`\`

### 7.3 克隆含子模块的仓库

\`\`\`bash
# 方式一：clone 时自动拉子模块
git clone --recurse-submodules https://github.com/me/my-app.git

# 方式二：已经 clone 了，再初始化子模块
git clone https://github.com/me/my-app.git
cd my-app
git submodule init
git submodule update
# 或一步到位
git submodule update --init --recursive
\`\`\`

### 7.4 更新子模块到最新

\`\`\`bash
# 子模块默认固定在主仓库记录的某个 commit
# 想拉取子模块远程的最新提交
cd libs/common-lib
git checkout main
git pull
cd ../..               # 回到主仓库
git add libs/common-lib
git commit -m "chore: 升级 common-lib 子模块"
\`\`\`

### 7.5 子模块的坑

\`\`\`text
- 子模块处于 "detached HEAD" 状态，要先 checkout 到分支才能正常 pull
- 忘了 --recurse-submodules clone，子模块目录是空的
- 主仓库记录的是子模块的 commit hash，不是分支
- 删除子模块较繁琐：git submodule deinit + git rm + 删 .git/modules
\`\`\`

\`\`\`bash
# 删除子模块
git submodule deinit -f libs/common-lib
git rm -f libs/common-lib
rm -rf .git/modules/libs/common-lib
git commit -m "chore: 移除 common-lib 子模块"
\`\`\`

### 7.6 替代方案

如果子模块太复杂，可以考虑：

\`\`\`text
- Git subtree：把子仓库内容直接合并进主仓库（保留历史）
- Monorepo：把所有相关项目放进一个仓库（pnpm workspace、nx 等）
- 包管理器依赖：能做成包的就发布成包，用 pip/npm 安装
\`\`\`

---

## 八、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  团队协作最佳实践速查                                          │
├──────────────────────────────────────────────────────────────┤
│  提交规范：Conventional Commits（feat/fix/docs/...）          │
│  原子提交：一次只做一件事，可独立 revert                      │
│  分支命名：feature/fix/hotfix/ + 简短描述                     │
│  Code Review：PR 流程，对事不对人                             │
│  .gitignore：分层忽略，密钥绝不入库                           │
│  大文件：Git LFS 按需拉取                                     │
│  子模块：谨慎使用，优先考虑包/monorepo                        │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# 一句话总结这一章：
# 规范让协作可预测，工具让规范可执行，习惯让团队高效。
# - 提交用规范格式
# - 改动用原子提交
# - 合并用 PR + review
# - 敏感文件绝不入库
# - 大文件交给 LFS
\`\`\`

---

## 整个 Git 系列回顾

\`\`\`text
本批 6 章覆盖的 Git 能力地图：
  1. 基础概念与安装        —— 理解四区域，装好工具，跑通 init/clone/status
  2. 日常工作流            —— add/commit/log/push/pull/diff 的各种用法
  3. 分支管理与合并        —— branch/merge/rebase，三种分支策略
  4. 高级操作              —— stash/cherry-pick/reset/revert/reflog/tag/bisect
  5. 配置与别名            —— 三层配置、别名、SSH、GPG、hooks
  6. 提交规范与最佳实践    —— Conventional Commits、原子提交、Review、LFS、子模块

掌握这套体系，你已经能胜任绝大多数项目的 Git 协作。
下一批章节将进入 GitHub/GitLab 协作平台、Linux 运维、Docker 等部署主题。
\`\`\`
`
  },

];

