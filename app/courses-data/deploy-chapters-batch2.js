export const chapters = [
  {
    id: "deploy-github-basics",
    icon: "🐙",
    title: "GitHub 基础与协作流程",
    group: "GitHub 与 GitLab",
    content: `# GitHub 基础与协作流程

## 一、GitHub 是什么

### 1.1 GitHub 简介

GitHub 是全球最大的代码托管平台，基于 Git 版本控制系统构建，为开发者提供云端代码仓库、协作开发、项目管理等一站式服务。

\`\`\`text
GitHub 核心能力：
- 代码托管（Git 仓库云端备份）
- 协作开发（Pull Request、Code Review）
- 项目管理（Issues、Projects、Wiki）
- 持续集成（GitHub Actions）
- 静态站点（GitHub Pages）
- 包管理（GitHub Packages）
\`\`\`

GitHub 于 2018 年被微软收购，目前拥有超过 1 亿开发者用户和 4 亿+ 仓库。

### 1.2 GitHub 与 Git 的区别

很多新手容易混淆 Git 和 GitHub，它们是两个不同的概念：

\`\`\`text
Git：
- 一个分布式版本控制系统软件
- 安装在本地，命令行工具
- 管理代码的版本历史
- 离线可用

GitHub：
- 一个基于 Git 的云托管平台
- 网站服务 + Web 界面
- 提供协作、社交、项目管理功能
- 必须联网使用
\`\`\`

类比理解：Git 是录影机，GitHub 是 YouTube。你可以用录影机录制视频（Git），但只有上传到 YouTube（GitHub）才能与他人分享、协作。

### 1.3 注册 GitHub 账号

#### 步骤一：访问官网

打开浏览器访问 https://github.com ，点击右上角 \`\`\`Sign up\`\`\` 按钮。

\`\`\`text
界面描述：
┌─────────────────────────────────────────┐
│  GitHub                          Sign up │
├─────────────────────────────────────────┤
│                                         │
│    Build and ship software on a single, │
│    collaborative platform              │
│                                         │
│    [邮箱地址___________]                │
│            [Continue]                   │
└─────────────────────────────────────────┘
\`\`\`

#### 步骤二：填写注册信息

按顺序填写：

\`\`\`text
1. Email（邮箱）：使用常用邮箱，如 Gmail、QQ 邮箱
2. Password（密码）：至少 15 位，或 8 位含数字和字母
3. Username（用户名）：英文，建议与博客/社交账号一致
4. 邮箱验证：接收 GitHub 验证码邮件并输入
\`\`\`

#### 步骤三：选择免费计划

\`\`\`text
Free（免费版）功能：
- 无限公开/私有仓库
- 无限协作者（私有仓库）
- 2000 分钟/月 GitHub Actions
- 500MB GitHub Packages 存储
- GitHub Pages 支持

Pro（$4/月）额外功能：
- 高级代码审查工具
- 3000 分钟/月 Actions
- 1GB Packages 存储
\`\`\`

#### 步骤四：配置 SSH Key

注册完成后，建议配置 SSH Key 以便免密推送代码：

\`\`\`bash
# 1. 检查本地是否已有 SSH Key
ls -al ~/.ssh
# 列出 ~/.ssh 目录内容，查看是否有 id_rsa.pub 或 id_ed25519.pub

# 2. 生成新的 SSH Key（推荐 ed25519 算法）
ssh-keygen -t ed25519 -C "your_email@example.com"
# -t 指定算法类型，-C 添加注释（通常用邮箱）
# 一路回车即可，默认保存在 ~/.ssh/id_ed25519

# 3. 启动 ssh-agent 并添加私钥
eval "\$(ssh-agent -s)"
# 启动 SSH 代理进程
ssh-add ~/.ssh/id_ed25519
# 将私钥添加到代理，避免每次输入密码

# 4. 复制公钥内容到剪贴板
pbcopy < ~/.ssh/id_ed25519.pub
# macOS 使用 pbcopy，Linux 用 xclip，Windows 用 clip
\`\`\`

#### 步骤五：在 GitHub 添加 SSH Key

\`\`\`text
界面操作路径：
1. 点击右上角头像 → Settings
2. 左侧菜单选择 SSH and GPG keys
3. 点击 New SSH key 按钮
4. Title 填写：MacBook Pro（标识设备）
5. Key 粘贴：刚才复制的公钥内容
6. 点击 Add SSH key

验证 SSH 连接：
\`\`\`

\`\`\`bash
# 测试 SSH 连接是否配置成功
ssh -T git@github.com
# 输出：Hi username! You've successfully authenticated...
\`\`\`

---

## 二、创建仓库（Repository）

### 2.1 仓库类型选择

\`\`\`text
Public（公开）：
- 任何人可见
- 免费无限创建
- 适合开源项目
- 接受社区贡献

Private（私有）：
- 仅自己和受邀者可见
- 免费也无限创建
- 适合商业项目
- 保护代码资产
\`\`\`

### 2.2 创建新仓库

点击 GitHub 首页右上角 \`\`\`+\`\`\` 图标，选择 \`\`\`New repository\`\`\`。

\`\`\`text
创建仓库界面：
┌─────────────────────────────────────────────┐
│ Create a new repository                     │
├─────────────────────────────────────────────┤
│ Owner: [your-username ▼]                   │
│ Repository name: [my-python-project______]  │
│ Description: [Python 学习项目（可选）____] │
│                                             │
│ ☐ Public   ☐ Private                       │
│                                             │
│ ☑ Add a README file                         │
│ ☑ Add .gitignore                            │
│    [Python ▼]                               │
│ ☑ Choose a license                          │
│    [MIT License ▼]                          │
│                                             │
│           [Create repository]               │
└─────────────────────────────────────────────┘
\`\`\`

### 2.3 README 文件

README 是项目的"门面"，是访客看到的第一份文档：

\`\`\`markdown
# My Python Project

一个用于学习 Python 的实战项目，包含 Web 开发、数据分析、自动化脚本等模块。

## 功能特性

- ✅ Flask Web 应用
- ✅ 数据爬取与分析
- ✅ 定时任务调度
- ✅ 命令行工具

## 安装

\`\`\`bash
# 克隆仓库
git clone https://github.com/username/my-python-project.git
cd my-python-project

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# 安装依赖
pip install -r requirements.txt
\`\`\`

## 使用方法

\`\`\`bash
# 启动 Web 服务
python app.py

# 访问 http://localhost:5000
\`\`\`

## 项目结构

\`\`\`
my-python-project/
├── app.py              # Flask 主应用
├── requirements.txt    # 依赖清单
├── README.md           # 项目说明
├── LICENSE             # MIT 许可证
├── .gitignore          # Git 忽略规则
└── src/                # 源码目录
    ├── __init__.py
    ├── crawler/        # 爬虫模块
    └── utils/          # 工具模块
\`\`\`

## 贡献指南

欢迎提交 Issue 和 Pull Request。请先阅读 CONTRIBUTING.md。

## 许可证

MIT License - 详见 [LICENSE](LICENSE)
\`\`\`

### 2.4 .gitignore 文件

\`\`\`bash
# Python 项目 .gitignore 模板

# 字节码文件
__pycache__/
*.py[cod]
*$py.class

# 虚拟环境
venv/
env/
.venv/

# 分发包
build/
dist/
*.egg-info/
*.egg

# 测试与覆盖率
.pytest_cache/
htmlcov/
.coverage
.tox/

# IDE 配置
.idea/
.vscode/
*.swp

# 环境变量
.env
.env.local

# 数据库
*.db
*.sqlite3

# 日志
*.log
logs/
\`\`\`

### 2.5 License 选择

\`\`\`text
常见开源许可证对比：

MIT License：
- 最宽松，几乎可任意使用
- 只需保留版权声明
- 适合个人项目、希望被广泛使用

Apache License 2.0：
- 类似 MIT，但包含专利授权
- 适合企业级项目
- 修改需标注变更

GPL v3：
- 强传染性，衍生作品必须开源
- 适合坚守开源理念的项目
- 商业使用需谨慎

BSD License：
- 类似 MIT，三条款版本
- 适合学术项目

推荐：
- 个人项目 → MIT
- 团队/公司 → Apache 2.0
- 坚守开源 → GPL v3
\`\`\`

---

## 三、Clone 与 Fork 的区别

### 3.1 Clone（克隆）

将远程仓库完整下载到本地，包括所有历史提交：

\`\`\`bash
# 克隆自己的仓库
git clone https://github.com/username/my-project.git
# 在当前目录创建 my-project 文件夹

# 克隆到指定目录
git clone https://github.com/username/my-project.git my-folder
# 克隆到 my-folder 目录

# 使用 SSH 协议克隆（推荐，免密）
git clone git@github.com:username/my-project.git

# 只克隆最新提交（节省时间，适合大仓库）
git clone --depth 1 https://github.com/username/my-project.git

# 克隆指定分支
git clone -b develop https://github.com/username/my-project.git
\`\`\`

### 3.2 Fork（派生）

将他人的仓库"复制"一份到自己账号下，成为自己的仓库：

\`\`\`text
Fork 操作界面：
1. 进入他人仓库页面，如 https://github.com/other-user/awesome-project
2. 点击右上角 Fork 按钮
3. 选择 Owner（自己或组织）
4. 点击 Create fork
5. 完成！你将获得 username/awesome-project 仓库
\`\`\`

### 3.3 对比表

\`\`\`text
┌──────────┬─────────────────────┬─────────────────────┐
│   对比项  │      Clone          │       Fork          │
├──────────┼─────────────────────┼─────────────────────┤
│  操作位置 │ 本地                │ GitHub 服务器         │
│  权限要求 │ 公开仓库无需权限     │ 公开仓库无需权限     │
│  产生仓库 │ 本地一份             │ 自己账号下一份远程仓库 │
│  推送权限 │ 只有原作者能推送     │ 可推送到自己 Fork 的  │
│  典型场景 │ 克隆自己的项目       │ 参与他人的开源项目     │
│  与原仓库│ 直接关联             │ 通过 upstream 关联    │
└──────────┴─────────────────────┴─────────────────────┘
\`\`\`

### 3.4 Fork 后的工作流

\`\`\`bash
# 1. Fork 他人仓库后，克隆自己账号下的 Fork 到本地
git clone git@github.com:your-username/awesome-project.git
cd awesome-project

# 2. 添加上游仓库（原仓库），用于同步更新
git remote add upstream git@github.com:original-author/awesome-project.git

# 3. 查看远程仓库配置
git remote -v
# 输出：
# origin    git@github.com:your-username/awesome-project.git (fetch)
# origin    git@github.com:your-username/awesome-project.git (push)
# upstream  git@github.com:original-author/awesome-project.git (fetch)
# upstream  git@github.com:original-author/awesome-project.git (push)

# 4. 同步上游仓库的最新更新
git fetch upstream          # 拉取上游更新
git checkout main           # 切换到主分支
git merge upstream/main     # 合并上游主分支
git push origin main        # 推送到自己的 Fork

# 5. 开发新功能前，创建功能分支
git checkout -b feature/add-login
\`\`\`

---

## 四、Push 推送到 GitHub

### 4.1 首次推送本地项目到 GitHub

如果你本地已有项目，想推送到新建的空 GitHub 仓库：

\`\`\`bash
# 1. 在 GitHub 创建空仓库（不要勾选 README、.gitignore、license）
# 假设仓库地址：https://github.com/username/my-project.git

# 2. 进入本地项目目录
cd /path/to/my-project

# 3. 初始化 Git 仓库（如果尚未初始化）
git init
# 输出：Initialized empty Git repository in /path/to/my-project/.git/

# 4. 添加文件到暂存区
git add .
# . 表示添加所有文件，也可指定文件：git add README.md app.py

# 5. 提交到本地仓库
git commit -m "feat: 初始化项目结构"
# -m 指定提交信息，建议遵循 Conventional Commits 规范

# 6. 设置主分支名为 main（GitHub 默认）
git branch -M main
# -M 强制重命名当前分支为 main

# 7. 关联远程仓库
git remote add origin git@github.com:username/my-project.git
# origin 是远程仓库的别名，可自定义

# 8. 首次推送到远程，并设置上游跟踪
git push -u origin main
# -u 等同于 --set-upstream，后续可直接 git push
\`\`\`

### 4.2 日常推送工作流

\`\`\`bash
# 1. 查看文件修改状态
git status
# 显示：modified: app.py, untracked: utils.py

# 2. 查看具体修改内容
git diff
# 显示未暂存的修改差异

# 3. 暂存修改
git add app.py utils.py
# 或全部暂存：git add -A

# 4. 提交修改
git commit -m "feat: 添加用户登录功能

- 新增 login 视图函数
- 添加 JWT token 鉴权
- 完善单元测试"

# 5. 推送到远程
git push
# 已设置上游，无需指定 origin main

# 6. 拉取远程更新（团队协作时推荐先 pull 再 push）
git pull
# 等同于 git fetch + git merge
\`\`\`

### 4.3 推送常见问题

#### 问题一：推送被拒绝（non-fast-forward）

\`\`\`bash
# 错误信息：
# ! [rejected] main -> main (non-fast-forward)

# 原因：远程有你本地没有的提交

# 解决方案一：先拉取合并
git pull origin main
# 如有冲突，解决后：
git add .
git commit -m "merge: 合并远程更新"
git push

# 解决方案二：rebase（保持线性历史）
git pull --rebase origin main
git push
\`\`\`

#### 问题二：权限拒绝（Permission denied）

\`\`\`bash
# 错误信息：
# Permission denied (publickey)

# 排查步骤：
# 1. 检查 SSH Key 是否配置
ssh -T git@github.com

# 2. 检查远程地址是否使用 SSH
git remote -v
# 如果是 https 地址，改为 ssh：
git remote set-url origin git@github.com:username/repo.git

# 3. 检查公钥是否添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制内容到 GitHub Settings → SSH keys
\`\`\`

---

## 五、Pull Request 流程详解

### 5.1 什么是 Pull Request

Pull Request（PR，拉取请求）是 GitHub 的核心协作机制，用于通知团队：\`\`\`我修改了代码，请审查并合并\`\`\`。

\`\`\`text
PR 工作流：
1. 在功能分支开发新功能/修复 Bug
2. 推送分支到远程仓库
3. 在 GitHub 创建 PR（源分支 → 目标分支）
4. 团队成员审查代码
5. 通过审查后合并到目标分支
6. 删除功能分支（可选）
\`\`\`

### 5.2 创建 PR 完整流程

#### 步骤一：创建功能分支

\`\`\`bash
# 从 main 分支创建并切换到功能分支
git checkout main
git pull origin main                    # 确保最新
git checkout -b feature/user-profile    # 创建并切换
# 分支命名规范：feature/xxx, bugfix/xxx, hotfix/xxx
\`\`\`

#### 步骤二：开发并提交

\`\`\`bash
# 编写代码后提交
git add .
git commit -m "feat: 添加用户资料页面"

# 可多次提交
git commit -m "feat: 添加头像上传功能"
git commit -m "style: 优化页面样式"

# 推送功能分支到远程
git push -u origin feature/user-profile
\`\`\`

#### 步骤三：在 GitHub 创建 PR

\`\`\`text
推送后，访问仓库页面，GitHub 会显示提示：
┌─────────────────────────────────────────┐
│ feature/user-profile had recent pushes  │
│        [Compare & pull request]         │
└─────────────────────────────────────────┘

点击 "Compare & pull request" 进入创建页面：

┌─────────────────────────────────────────────┐
│ Open a pull request                        │
├─────────────────────────────────────────────┤
│ Base: [main ▼]  ←  Compare: [feature/user-profile ▼] │
│                                             │
│ Title: [feat: 添加用户资料页面_____________] │
│                                             │
│ Leave a comment...                          │
│ ┌─────────────────────────────────────────┐ │
│ │ ## 本次修改内容                          │ │
│ │                                         │ │
│ │ - 新增用户资料页面路由                   │ │
│ │ - 添加头像上传功能                       │ │
│ │ - 优化页面样式                           │ │
│ │                                         │ │
│ │ ## 测试情况                              │ │
│ │ - [x] 单元测试通过                       │ │
│ │ - [x] 手动测试通过                       │ │
│ │                                         │ │
│ │ ## 关联 Issue                            │ │
│ │ Closes #42                              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Reviewers: [@zhangsan ▼]                   │
│ Assignees: [@yourself ▼]                   │
│ Labels: [enhancement ▼]                    │
│                                             │
│           [Create pull request]             │
└─────────────────────────────────────────────┘
\`\`\`

#### 步骤四：等待审查

\`\`\`text
PR 创建后页面：
┌─────────────────────────────────────────────┐
│ feat: 添加用户资料页面 · #15  [Open]        │
├─────────────────────────────────────────────┤
│ 📁 Files changed  (+128  −15)               │
│                                             │
│ ✅ Checks  CI 全部通过                       │
│                                             │
│ 💬 Conversation                             │
│   @zhangsan: 整体不错，建议修改以下几处...   │
│                                             │
│           [Merge pull request]              │
└─────────────────────────────────────────────┘
\`\`\`

#### 步骤五：合并 PR

审查通过后，有三种合并方式：

\`\`\`text
1. Create a merge commit（默认）
   - 保留所有提交历史
   - 创建一个合并提交
   - 适合大多数场景

2. Squash and merge
   - 将多个提交压缩为一个
   - 历史更整洁
   - 适合功能分支提交较多

3. Rebase and merge
   - 将提交"嫁接"到目标分支
   - 无合并提交，历史线性
   - 适合要求线性历史的项目
\`\`\`

### 5.3 PR 模板示例

在仓库根目录创建 \`\`\`.github/PULL_REQUEST_TEMPLATE.md\`\`\`：

\`\`\`markdown
## 修改说明

<!-- 简要描述本次修改的内容和目的 -->

## 修改类型

请勾选适用的选项：

- [ ] 新功能（feature）
- [ ] Bug 修复（bugfix）
- [ ] 重构（refactor）
- [ ] 文档更新（docs）
- [ ] 性能优化（performance）
- [ ] 测试相关（test）
- [ ] 其他（other）

## 关联 Issue

<!-- 例如：Closes #123, Fixes #456 -->

## 测试情况

- [ ] 已通过单元测试
- [ ] 已通过集成测试
- [ ] 已手动测试

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 不引入新的警告
\`\`\`

---

## 六、Code Review（代码审查）

### 6.1 为什么要做 Code Review

\`\`\`text
Code Review 的价值：
- 发现潜在 Bug 和安全漏洞
- 提升代码质量与可维护性
- 知识共享，团队互相学习
- 保持代码风格统一
- 防止"巴士因子"过低（关键人离职风险）
\`\`\`

### 6.2 审查界面操作

在 PR 页面点击 \`\`\`Files changed\`\`\` 标签进入审查视图：

\`\`\`text
代码审查界面：
┌─────────────────────────────────────────────┐
│ Files changed  128 additions, 15 deletions  │
├─────────────────────────────────────────────┤
│ app.py                                       │
│ @@ -10,6 +10,15 @@ def home():              │
│   return render_template('home.html')       │
│                                              │
│ +@app.route('/profile')           [💬评论]   │
│ +def profile():                               │
│ +    user = get_current_user()               │
│ +    return render_template(                 │
│ +        'profile.html',                     │
│ +        user=user                           │
│ +    )                                       │
│                                              │
│ @@ -25,8 +34,12 @@                           │
│ -def old_login():                            │
│ +def login():                      [💬评论]   │
│                                              │
├─────────────────────────────────────────────┤
│ [Review changes]                             │
│   ☐ Comment    ☐ Approve    ☐ Request changes│
└─────────────────────────────────────────────┘

操作说明：
- 鼠标悬停在行号上，出现 + 号可添加行内评论
- 滚动到底部选择审查结论：
  - Comment：仅评论，不表态
  - Approve：批准，可合并
  - Request changes：要求修改，不可合并
\`\`\`

### 6.3 审查评论的最佳实践

#### ❌ 不好的评论

\`\`\`text
- "这里写错了"
- "你为什么这样写？"
- "代码很乱"
\`\`\`

#### ✅ 好的评论

\`\`\`text
- "建议使用 with 语句打开文件，避免忘记关闭：
  with open('data.txt') as f:
      data = f.read()"

- "这里的变量名 'x' 含义不明确，建议改为 'user_count'"

- "此处 SQL 拼接存在注入风险，建议使用参数化查询：
  cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))"
\`\`\`

### 6.4 审查清单

\`\`\`text
功能层面：
- [ ] 是否实现了预期功能
- [ ] 边界条件是否处理
- [ ] 异常情况是否考虑
- [ ] 是否有安全漏洞

代码层面：
- [ ] 命名是否清晰有意义
- [ ] 函数/类是否职责单一
- [ ] 是否有重复代码
- [ ] 复杂逻辑是否有注释

测试层面：
- [ ] 是否有单元测试
- [ ] 测试是否覆盖关键路径
- [ ] 测试是否可独立运行

性能层面：
- [ ] 是否有明显的性能问题
- [ ] 数据库查询是否高效
- [ ] 是否有内存泄漏风险
\`\`\`

---

## 七、Issues 与项目管理

### 7.1 什么是 Issues

Issues 是 GitHub 的任务追踪系统，用于记录：

\`\`\`text
- Bug 报告
- 功能请求
- 任务待办
- 问题讨论
- 项目规划
\`\`\`

### 7.2 创建 Issue

点击仓库 \`\`\`Issues\`\`\` 标签 → \`\`\`New issue\`\`\`：

\`\`\`text
Issue 创建界面：
┌─────────────────────────────────────────────┐
│ Open a new issue                            │
├─────────────────────────────────────────────┤
│ Title: [Bug: 用户登录后跳转到错误页面_______] │
│                                             │
│ Leave a comment...                          │
│ ┌─────────────────────────────────────────┐ │
│ │ ## Bug 描述                              │ │
│ │                                         │ │
│ │ 用户登录成功后，页面跳转到 /home 而非   │ │
│ │ 预期的 /dashboard。                       │ │
│ │                                         │ │
│ │ ## 复现步骤                              │ │
│ │                                         │ │
│ │ 1. 访问 /login                           │ │
│ │ 2. 输入用户名密码                         │ │
│ │ 3. 点击登录按钮                           │ │
│ │ 4. 观察跳转地址                           │ │
│ │                                         │ │
│ │ ## 期望行为                              │ │
│ │ 跳转到 /dashboard                        │ │
│ │                                         │ │
│ │ ## 实际行为                              │ │
│ │ 跳转到 /home                             │ │
│ │                                         │ │
│ │ ## 环境                                  │ │
│ │ - OS: macOS 13.0                         │ │
│ │ - Browser: Chrome 120                    │ │
│ │ - Version: v1.2.3                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Labels: [bug ▼] [priority/high ▼]          │
│ Assignees: [@lisi ▼]                       │
│ Milestone: [v1.3 ▼]                        │
│                                             │
│           [Submit new issue]                │
└─────────────────────────────────────────────┘
\`\`\`

### 7.3 Issue Labels（标签）

\`\`\`text
GitHub 默认标签：

类型标签：
- bug          🐛 Bug 问题（红色）
- enhancement  ✨ 功能增强（蓝色）
- feature      🌟 新功能请求

状态标签：
- duplicate    重复 Issue（紫色）
- invalid      无效 Issue（黄色）
- wontfix      不会修复（白色）
- stale        长期未活动（灰色）

优先级标签（可自定义）：
- priority/low      低优先级
- priority/medium   中优先级
- priority/high     高优先级
- priority/critical 紧急

复杂度标签（可自定义）：
- good first issue  适合新手
- help wanted       欢迎贡献
- difficulty/easy   简单
- difficulty/hard   困难
\`\`\`

### 7.4 Issue 模板

在 \`\`\`.github/ISSUE_TEMPLATE/\`\`\` 目录创建模板：

\`\`\`yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug 报告
description: 报告一个 Bug 帮助我们改进
labels: ["bug"]
body:
  - type: textarea
    id: description
    attributes:
      label: Bug 描述
      description: 清晰描述 Bug 是什么
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: 复现步骤
      description: 详细步骤让我们能复现
      placeholder: |
        1. 打开 '...'
        2. 点击 '...'
        3. 看到 '...'
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 期望行为
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: 实际行为
    validations:
      required: true

  - type: dropdown
    id: os
    attributes:
      label: 操作系统
      options:
        - macOS
        - Windows
        - Linux
    validations:
      required: true
\`\`\`

### 7.5 关联 Issue 与 PR

\`\`\`text
在 PR 描述中写：

Closes #42        # 合并 PR 时自动关闭 Issue #42
Fixes #42         # 同 Closes
Resolves #42      # 同 Closes
Related to #42    # 仅关联，不自动关闭

在提交信息中写：
git commit -m "fix: 修复登录跳转问题，Closes #42"
\`\`\`

---

## 八、GitHub Pages 简介

### 8.1 什么是 GitHub Pages

GitHub Pages 是 GitHub 提供的静态网站托管服务，可免费部署个人博客、项目文档、作品集等。

\`\`\`text
GitHub Pages 特点：
- 免费托管静态网站
- 自定义域名支持
- 自动 HTTPS
- 每仓库 1GB 空间
- 每月 100GB 流量
- 支持 Jekyll、Hugo 等静态生成器
\`\`\`

### 8.2 创建个人站点

\`\`\`bash
# 1. 创建名为 username.github.io 的仓库
# username 替换为你的 GitHub 用户名
# 例如：zhangsan.github.io

# 2. 克隆仓库
git clone https://github.com/username/username.github.io.git
cd username.github.io

# 3. 创建 index.html
echo "<h1>Hello GitHub Pages</h1>" > index.html

# 4. 提交并推送
git add index.html
git commit -m "feat: 初始化个人站点"
git push origin main

# 5. 访问 https://username.github.io
\`\`\`

### 8.3 为项目创建文档站点

\`\`\`text
项目仓库 Settings → Pages：
┌─────────────────────────────────────────┐
│ GitHub Pages                            │
├─────────────────────────────────────────┤
│ Source:                                  │
│  ○ Deploy from a branch                 │
│  ● GitHub Actions                       │
│                                         │
│ Branch: [main ▼] / [root ▼]            │
│                                         │
│ Your site is live at                    │
│ https://username.github.io/repo-name/   │
└─────────────────────────────────────────┘
\`\`\`

### 8.4 使用 Jekyll 创建博客

\`\`\`bash
# 安装 Jekyll（需要 Ruby）
gem install jekyll bundler

# 创建博客
jekyll new my-blog
cd my-blog

# 本地预览
bundle exec jekyll serve
# 访问 http://localhost:4000

# 推送到 GitHub
git init
git add .
git commit -m "feat: 初始化 Jekyll 博客"
git remote add origin git@github.com:username/username.github.io.git
git push -u origin main
\`\`\`

\`\`\`yaml
# _config.yml Jekyll 配置示例
title: 我的博客
description: 记录技术学习与生活
author: 张三
url: https://username.github.io

theme: minima

permalink: /:year/:month/:day/:title/

markdown: kramdown
highlighter: rouge

plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-sitemap

exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
\`\`\`

---

## 九、本章小结

### 9.1 知识点回顾

\`\`\`text
1. GitHub 是基于 Git 的云托管平台，需注册账号并配置 SSH Key
2. 创建仓库时可选 public/private，建议添加 README、.gitignore、license
3. Clone 是下载到本地，Fork 是复制到自己账号下
4. Push 推送流程：add → commit → push
5. Pull Request 是核心协作机制：feature 分支开发 → 推送 → 创建 PR → 审查 → 合并
6. Code Review 提升代码质量，包括评论、approve、request changes
7. Issues 用于追踪 Bug、任务、讨论
8. GitHub Pages 可免费托管静态站点
\`\`\`

### 9.2 推荐工作流

\`\`\`text
日常开发循环：
1. git checkout main && git pull          # 同步主分支
2. git checkout -b feature/xxx            # 创建功能分支
3. 编码 → git add → git commit            # 多次提交
4. git push -u origin feature/xxx         # 推送
5. GitHub 创建 PR                          # 发起审查
6. 团队 Code Review                        # 审查讨论
7. 修改后 push（自动更新 PR）              # 持续改进
8. 审查通过 → 合并                         # 集成
9. 删除本地/远程功能分支                   # 清理
10. git checkout main && git pull         # 同步更新
\`\`\`

### 9.3 下一章预告

下一章将介绍 GitHub 进阶功能，包括 GitHub Actions 自动化、Releases 版本管理、Projects 项目看板、组织与团队管理、GitHub CLI 命令行工具、API 自动化等高级特性。
`
  },
  {
    id: "deploy-github-advanced",
    icon: "🚀",
    title: "GitHub 进阶功能",
    group: "GitHub 与 GitLab",
    content: `# GitHub 进阶功能

## 一、GitHub Actions 简介（CI/CD）

### 1.1 什么是 GitHub Actions

GitHub Actions 是 GitHub 内置的持续集成/持续部署（CI/CD）服务，可以在代码推送、PR 创建等事件触发时自动执行构建、测试、部署等任务。

\`\`\`text
Actions 核心概念：
- Workflow（工作流）：自动化流程，定义在 .github/workflows/*.yml
- Event（事件）：触发 Workflow 的动作，如 push、pull_request
- Job（作业）：一个 Workflow 包含多个 Job，并行执行
- Step（步骤）：一个 Job 包含多个 Step，串行执行
- Action（动作）：可复用的 Step 单元，类似函数
- Runner（执行器）：运行 Job 的服务器，GitHub 提供或自托管
\`\`\`

### 1.2 第一个 Workflow

在仓库创建 \`\`\`.github/workflows/ci.yml\`\`\`：

\`\`\`yaml
# .github/workflows/ci.yml
name: Python CI  # Workflow 名称

# 触发条件
on:
  push:
    branches: [main, develop]      # main/develop 分支推送时触发
  pull_request:
    branches: [main]               # PR 到 main 时触发

# 全局环境变量
env:
  PYTHON_VERSION: "3.11"
  POETRY_VERSION: "1.7.1"

# 作业定义
jobs:
  test:
    name: 运行测试  # Job 显示名称
    runs-on: ubuntu-latest  # 运行环境：ubuntu/windows/macos

    # 矩阵策略：在多个 Python 版本并行测试
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11", "3.12"]

    steps:
      # 步骤1：检出代码
      - name: 检出代码
        uses: actions/checkout@v4  # 使用官方 Action
        # uses 引用现成 Action，v4 是版本

      # 步骤2：安装 Python
      - name: 设置 Python \${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: \${{ matrix.python-version }}
          # \${{ }} 是表达式语法，引用矩阵变量

      # 步骤3：缓存 pip 依赖
      - name: 缓存 pip 依赖
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}
          # 根据操作系统和 requirements.txt 哈希生成缓存键

      # 步骤4：安装依赖
      - name: 安装依赖
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov
        # run 执行 shell 命令，| 表示多行

      # 步骤5：运行测试
      - name: 运行测试
        run: |
          pytest tests/ --cov=src --cov-report=xml
        # 运行 pytest 并生成覆盖率报告

      # 步骤6：上传覆盖率
      - name: 上传覆盖率报告
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          fail_ci_if_error: false
\`\`\`

### 1.3 Actions 界面查看

\`\`\`text
仓库页面 → Actions 标签：
┌─────────────────────────────────────────────┐
│ Actions                                     │
├─────────────────────────────────────────────┤
│ Workflows                                   │
│ 🟢 Python CI              最近运行 ✓        │
│                                             │
│ Recent runs                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ ✓ Python CI  #42  main  3 minutes ago   │ │
│ │   feat: 添加登录功能                     │ │
│ ├─────────────────────────────────────────┤ │
│ │ ✓ Python CI  #41  PR#15  10 minutes ago │ │
│ │   feat: 添加用户资料                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
\`\`\`

### 1.4 自动部署到服务器

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - "v*"  # 推送 v 开头的 tag 时触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    # 只在 main 分支的 tag 触发
    if: startsWith(github.ref, 'refs/tags/v')

    steps:
      - uses: actions/checkout@v4

      - name: 设置 Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: 构建项目
        run: |
          pip install build
          python -m build

      - name: 通过 SSH 部署到服务器
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          # secrets 在仓库 Settings → Secrets 中配置
          script: |
            cd /opt/myapp
            git pull origin main
            source venv/bin/activate
            pip install -r requirements.txt
            python manage.py migrate
            sudo systemctl restart gunicorn
\`\`\`

### 1.5 Secrets 配置

\`\`\`text
仓库 Settings → Secrets and variables → Actions：
┌─────────────────────────────────────────┐
│ Actions secrets                         │
├─────────────────────────────────────────┤
│ Name                    Value           │
│ SERVER_HOST             ***             │
│ SERVER_USER             ***             │
│ SSH_PRIVATE_KEY         ***             │
│ DATABASE_URL            ***             │
│                                         │
│         [New repository secret]         │
└─────────────────────────────────────────┘

注意：
- Secrets 加密存储，创建后不可查看
- 在 Workflow 中通过 \${{ secrets.NAME }} 引用
- 不会出现在日志中，自动打码
\`\`\`

### 1.6 常用 Actions 市场

访问 https://github.com/marketplace?type=actions 查找现成 Action：

\`\`\`text
热门 Actions：
- actions/checkout          检出代码
- actions/setup-python      安装 Python
- actions/cache             缓存依赖
- actions/upload-artifact   上传产物
- actions/download-artifact 下载产物
- peaceiris/actions-gh-pages 部署到 Pages
- softprops/action-gh-release 创建 Release
- codecov/codecov-action    上传覆盖率
- peter-evans/create-pull-request 自动创建 PR
\`\`\`

---

## 二、GitHub Releases 与版本管理

### 2.1 什么是 Release

Release 是 GitHub 提供的版本发布功能，用于标记重要的发布节点，附加二进制文件和发布说明。

\`\`\`text
Release vs Tag：
- Tag：Git 的标签，标记某个提交
- Release：基于 Tag 的发布，包含说明、附件

关系：先打 Tag，再基于 Tag 创建 Release
\`\`\`

### 2.2 创建 Tag

\`\`\`bash
# 1. 提交最终代码
git add .
git commit -m "release: v1.0.0"

# 2. 推送到远程
git push origin main

# 3. 创建轻量 Tag
git tag v1.0.0

# 4. 创建带注释的 Tag（推荐）
git tag -a v1.0.0 -m "发布版本 1.0.0

特性：
- 用户登录注册
- 文章管理

修复：
- 修复登录跳转 Bug"

# 5. 推送 Tag 到远程
git push origin v1.0.0
# 推送所有 Tag：git push origin --tags
\`\`\`

### 2.3 在 GitHub 创建 Release

\`\`\`text
仓库页面 → Releases → Draft a new release：
┌─────────────────────────────────────────────┐
│ Releases                                    │
├─────────────────────────────────────────────┤
│ Choose a tag: [v1.0.0 ▼]  [New tag]        │
│ Release title: [v1.0.0 - 首个正式版本]      │
│                                             │
│ Describe this release                       │
│ ┌─────────────────────────────────────────┐ │
│ │ ## 🎉 庆祝首个正式版本发布                │ │
│ │                                         │ │
│ │ ### ✨ 新增特性                          │ │
│ │ - 用户登录注册功能                       │ │
│ │ - 文章 CRUD 管理                         │ │
│ │ - Markdown 渲染支持                      │ │
│ │                                         │ │
│ │ ### 🐛 Bug 修复                          │ │
│ │ - 修复登录后跳转错误 (#42)               │ │
│ │ - 修复移动端样式错位 (#45)               │ │
│ │                                         │ │
│ │ ### 📚 文档                              │ │
│ │ - 完善安装文档                           │ │
│ │ - 添加 API 参考                          │ │
│ │                                         │ │
│ │ ### ⚠️ 破坏性变更                        │ │
│ │ - API 路由前缀改为 /api/v1/              │ │
│ │                                         │ │
│ │ **完整变更日志**: 对比 v0.9.0...v1.0.0  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Attach binaries by dropping files here      │
│ [拖拽文件上传，如安装包]                     │
│                                             │
│ ☑ Set as the latest release                 │
│ ☐ Set as a pre-release                      │
│ ☐ Save as draft                             │
│                                             │
│       [Publish release]                     │
└─────────────────────────────────────────────┘
\`\`\`

### 2.4 自动生成 Release Notes

GitHub 支持基于 PR 自动生成 Release Notes：

\`\`\`text
仓库 Settings → General → Releases：
┌─────────────────────────────────────────┐
│ Releases                                │
├─────────────────────────────────────────┤
│ ☑ Automatically generated release notes│
│                                         │
│ Release notes configuration:            │
│ .github/release.yml                     │
└─────────────────────────────────────────┘
\`\`\`

\`\`\`yaml
# .github/release.yml
changelog:
  exclude:
    labels:
      - ignore-for-release
    authors:
      - dependabot
  categories:
    - title: 🚀 新特性
      labels:
        - enhancement
        - feature
    - title: 🐛 Bug 修复
      labels:
        - bug
        - fix
    - title: 📚 文档
      labels:
        - documentation
    - title: 🔧 维护
      labels:
        - chore
        - refactor
    - title: 其他变更
      labels:
        - "*"
\`\`\`

### 2.5 使用 GitHub Action 自动发布

\`\`\`yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整历史，用于生成 changelog

      - name: 创建 GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true  # 自动生成 notes
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
\`\`\`

### 2.6 语义化版本号

\`\`\`text
语义化版本号格式：MAJOR.MINOR.PATCH

例如：v1.2.3

- MAJOR（主版本号）：1
  不兼容的 API 修改时递增

- MINOR（次版本号）：2
  向下兼容的新功能时递增

- PATCH（修订号）：3
  向下兼容的问题修复时递增

预发布版本：v1.0.0-alpha, v1.0.0-beta.1, v1.0.0-rc.1
构建元数据：v1.0.0+20260101

示例演进：
v0.1.0 → v0.2.0（新功能）→ v0.2.1（修 Bug）
      → v1.0.0（破坏性变更）→ v1.1.0（新功能）
\`\`\`

---

## 三、GitHub Wiki 与文档

### 3.1 什么是 Wiki

Wiki 是 GitHub 内置的文档系统，适合存放项目文档、教程、设计文档等长篇内容。

\`\`\`text
Wiki 特点：
- 独立的 Git 仓库（仓库.wiki.git）
- 支持 Markdown
- 支持侧边栏导航
- 支持页面历史
- 可本地克隆编辑
\`\`\`

### 3.2 创建 Wiki 页面

\`\`\`text
仓库页面 → Wiki → Create the first page：
┌─────────────────────────────────────────────┐
│ Create new page                            │
├─────────────────────────────────────────────┤
│ Page title: [Home_______________________]   │
│                                             │
│ Edit mode: [✏️ Write ▼]                     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ # 项目文档首页                           │ │
│ │                                         │ │
│ │ 欢迎使用本项目！这里提供完整文档。       │ │
│ │                                         │ │
│ │ ## 快速开始                             │ │
│ │                                         │ │
│ │ - [安装指南](Installation)              │ │
│ │ - [使用教程](Usage)                     │ │
│ │ - [API 参考](API)                       │ │
│ │                                         │ │
│ │ ## 常见问题                             │ │
│ │                                         │ │
│ │ 详见 [FAQ](FAQ)                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Message: [创建首页_______________]          │
│           [Save page]                       │
└─────────────────────────────────────────────┘
\`\`\`

### 3.3 Wiki 侧边栏与页脚

\`\`\`text
Wiki 页面右侧 → "Footer" / "Sidebar"：

创建 _Sidebar.md：
┌─────────────────────┐
│ 导航                 │
│ - [首页](Home)      │
│ - [安装](Install)   │
│ - [使用](Usage)     │
│ - [API](API)        │
│ - [FAQ](FAQ)        │
└─────────────────────┘

创建 _Footer.md：
┌─────────────────────┐
│ © 2026 项目团队     │
│ [License](LICENSE)  │
└─────────────────────┘
\`\`\`

### 3.4 本地编辑 Wiki

\`\`\`bash
# 克隆 Wiki 仓库（注意 .wiki 后缀）
git clone https://github.com/username/repo.wiki.git
cd repo.wiki

# 编辑页面
echo "# 安装指南" > Installation.md
echo "# 使用教程" > Usage.md

# 提交并推送
git add .
git commit -m "docs: 添加安装和使用文档"
git push origin master
\`\`\`

---

## 四、GitHub Projects（看板）

### 4.1 什么是 GitHub Projects

GitHub Projects 是项目管理工具，提供看板视图，可关联 Issues、PR、笔记等。

\`\`\`text
Projects 特点：
- 看板视图（Kanban）
- 表格视图（Table）
- 路线图视图（Roadmap）
- 自定义字段
- 多视图切换
- 跨仓库关联
\`\`\`

### 4.2 创建 Project

\`\`\`text
个人/组织页面 → Projects → New project：
┌─────────────────────────────────────────────┐
│ Create a new project                       │
├─────────────────────────────────────────────┤
│ 选择模板：                                  │
│ ○ Team planning     团队规划                │
│ ○ Bug tracker       Bug 追踪               │
│ ○ Feature roadmap   功能路线图              │
│ ○ Blank             空白                   │
│                                             │
│ Project name: [Q1 2026 开发计划__________]  │
│                                             │
│           [Create project]                 │
└─────────────────────────────────────────────┘
\`\`\`

### 4.3 看板视图使用

\`\`\`text
看板界面：
┌──────┬──────┬──────┬──────┬──────┐
│ 待办  │ 进行中│ 审查中│ 已完成│ 已归档│
├──────┼──────┼──────┼──────┼──────┤
│ 📋   │ 📋   │ 📋   │ 📋   │ 📋   │
│ Bug1 │ 登录  │ PR#15│ 发布  │ Bug  │
│      │ 功能  │      │ v1.0 │      │
│ 📋   │ 📋   │      │      │      │
│ 文档 │ 测试  │      │      │      │
└──────┴──────┴──────┴──────┴──────┘

操作：
- 拖拽卡片在不同列间移动
- 点击卡片查看详情
- + 号添加新 Issue/草稿
\`\`\`

### 4.4 自定义字段

\`\`\`text
Project → + 号 → New field：

字段类型：
- Text      文本
- Number    数字
- Date      日期
- Single select 单选（如优先级）
- Iteration 迭代周期
- Labels    标签

示例字段：
- 优先级：P0 / P1 / P2 / P3
- 负责人：选择团队成员
- 开始日期：date
- 截止日期：date
- 工作量：XS/S/M/L/XL
- 类型：Bug/Feature/Task
\`\`\`

### 4.5 自动化工作流

\`\`\`text
Project → Workflows：

内置自动化：
1. Item added to project
   → 设置默认 Status = 待办

2. Pull request merged
   → 设置 Status = 已完成

3. Issue closed
   → 设置 Status = 已完成

4. Item reopened
   → 设置 Status = 进行中

自定义 Workflow 示例：
当 Issue 被添加到项目时：
- 自动设置 Status = 待办
- 自动设置优先级 = P2
- 自动设置创建日期 = 今天
\`\`\`

---

## 五、组织与团队管理

### 5.1 创建组织

\`\`\`text
GitHub 右上角 + → New organization：

选择方案：
- Free          免费（基础功能）
- Team          $4/人/月（高级功能）
- Enterprise    联系销售（企业级）

组织信息：
- Organization name: my-team
- Contact email: admin@myteam.com

组织优势：
- 共享仓库所有权
- 团队成员分组管理
- 统一权限控制
- 组织级项目/Secrets
\`\`\`

### 5.2 创建团队

\`\`\`text
组织页面 → Teams → New team：
┌─────────────────────────────────────────┐
│ Create a team                           │
├─────────────────────────────────────────┤
│ Team name: [前端组]                     │
│ Description: [负责前端开发]              │
│ Team visibility:                        │
│  ○ Visible  所有人可见                   │
│  ● Secret   仅成员可见                   │
│                                         │
│           [Create team]                 │
└─────────────────────────────────────────┘
\`\`\`

### 5.3 仓库权限管理

\`\`\`text
仓库 Settings → Collaborators and teams：

权限级别：
- Read       只读（拉取代码）
- Triage     管理 Issue/PR（无法推送）
- Write      读写（可推送、合并 PR）
- Maintain   维护（管理仓库设置，不可改危险项）
- Admin      管理员（完全控制）

团队 → 仓库授权示例：
┌────────────────────┬──────────┐
│ Team               │ Role     │
├────────────────────┼──────────┤
│ @myteam/frontend   │ Write    │
│ @myteam/backend    │ Write    │
│ @myteam/devops     │ Admin    │
│ @myteam/interns    │ Read     │
└────────────────────┴──────────┘
\`\`\`

---

## 六、GitHub CLI（gh 命令）

### 6.1 安装 GitHub CLI

\`\`\`bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Windows
winget install GitHub.cli

# 验证安装
gh --version
# gh version 2.40.1
\`\`\`

### 6.2 登录认证

\`\`\`bash
# 通过浏览器登录（推荐）
gh auth login
# 选择 GitHub.com → HTTPS/SSH → 浏览器登录

# 验证登录状态
gh auth status
# 输出：Logged in to github.com as username

# 退出登录
gh auth logout
\`\`\`

### 6.3 仓库操作

\`\`\`bash
# 创建新仓库
gh repo create my-project --public --clone
# --public 公开，--private 私有，--clone 创建后克隆

# 克隆仓库
gh repo clone username/repo-name

# 在浏览器中打开当前仓库
gh repo view --web

# 查看仓库信息
gh repo view username/repo-name

# Fork 仓库
gh repo fork owner/repo --clone
\`\`\`

### 6.4 PR 操作

\`\`\`bash
# 创建 PR
gh pr create --title "feat: 添加登录功能" --body "实现用户登录" --base main --head feature/login
# --base 目标分支，--head 源分支

# 列出所有 PR
gh pr list

# 查看指定 PR
gh pr view 15
gh pr view 15 --web  # 在浏览器中打开

# 检查 PR 状态
gh pr checks 15
# 显示 CI 检查结果

# 合并 PR
gh pr merge 15 --squash --delete-branch
# --squash 压缩合并，--delete-branch 删除分支

# 检出 PR 到本地
gh pr checkout 15
\`\`\`

### 6.5 Issue 操作

\`\`\`bash
# 创建 Issue
gh issue create --title "Bug: 登录失败" --body "描述..." --label bug --assignee @me

# 列出 Issue
gh issue list
gh issue list --state open --label bug

# 查看 Issue
gh issue view 42
gh issue view 42 --web

# 关闭 Issue
gh issue close 42

# 重新打开 Issue
gh issue reopen 42
\`\`\`

### 6.6 Release 操作

\`\`\`bash
# 创建 Release
gh release create v1.0.0 ./dist/* --title "v1.0.0" --notes "首个正式版本"
# ./dist/* 上传附件

# 列出所有 Release
gh release list

# 下载 Release 资产
gh release download v1.0.0
gh release download v1.0.0 --pattern '*.tar.gz'

# 删除 Release
gh release delete v1.0.0
\`\`\`

### 6.7 Workflow 操作

\`\`\`bash
# 列出所有 Workflow
gh workflow list

# 查看 Workflow 运行历史
gh run list
gh run list --workflow=ci.yml --limit 5

# 查看运行详情
gh run view 12345678

# 重新运行失败的 Workflow
gh run rerun 12345678 --failed
# --failed 只重新运行失败的 Job

# 实时查看运行日志
gh run watch 12345678

# 取消运行中的 Workflow
gh run cancel 12345678
\`\`\`

### 6.8 实用技巧

\`\`\`bash
# 一键创建 PR（自动检测当前分支）
gh pr create --fill
# --fill 自动用最后提交信息填充标题和内容

# 在 PR 中查看 diff
gh pr diff 15

# 查看 PR 评论
gh pr view 15 --comments

# 列出自己的 PR
gh pr list --author @me --state all

# 创建 Gist 分享代码
gh gist create script.py --public --desc "Python 脚本示例"
\`\`\`

---

## 七、GitHub API 与自动化

### 7.1 REST API 概览

\`\`\`text
GitHub REST API v3：
- 基础 URL: https://api.github.com
- 认证方式: Token / App
- 速率限制: 认证用户 5000 请求/小时
- 返回格式: JSON
\`\`\`

### 7.2 创建 Personal Access Token

\`\`\`text
头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)：
┌─────────────────────────────────────────┐
│ Personal access tokens                  │
├─────────────────────────────────────────┤
│ Note: [CI 自动化脚本]                   │
│ Expiration: [90 days ▼]                 │
│                                         │
│ Scopes:                                 │
│ ☑ repo      完全仓库访问                │
│ ☑ workflow  编辑 Workflows             │
│ ☑ read:org  读取组织信息                │
│ ☑ gist      创建 Gist                   │
│                                         │
│           [Generate token]              │
└─────────────────────────────────────────┘

注意：Token 只在创建时显示一次，请立即保存
\`\`\`

### 7.3 使用 curl 调用 API

\`\`\`bash
# 设置 Token 环境变量
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# 获取用户信息
curl -H "Authorization: token \$GITHUB_TOKEN" \\
     -H "Accept: application/vnd.github.v3+json" \\
     https://api.github.com/user

# 列出仓库
curl -H "Authorization: token \$GITHUB_TOKEN" \\
     https://api.github.com/user/repos?per_page=100

# 创建 Issue
curl -X POST \\
     -H "Authorization: token \$GITHUB_TOKEN" \\
     -H "Accept: application/vnd.github.v3+json" \\
     https://api.github.com/repos/username/repo/issues \\
     -d '{"title": "API 创建的 Issue", "body": "通过 API 创建"}'

# 获取 PR 列表
curl -H "Authorization: token \$GITHUB_TOKEN" \\
     "https://api.github.com/repos/username/repo/pulls?state=open"
\`\`\`

### 7.4 使用 Python 调用 API

\`\`\`bash
# 安装 PyGithub 库
pip install PyGithub
\`\`\`

\`\`\`python
from github import Github
import os

# 使用 Token 认证
token = os.environ.get('GITHUB_TOKEN')
g = Github(token)

# 获取用户对象
user = g.get_user()
print(f"当前用户: {user.login}")

# 获取仓库
repo = g.get_repo("username/my-project")
print(f"仓库: {repo.full_name}")
print(f"Stars: {repo.stargazers_count}")

# 创建 Issue
repo.create_issue(
    title="通过 API 创建的 Issue",
    body="这是通过 PyGithub 创建的测试 Issue",
    labels=["bug", "help wanted"]
)

# 列出最近的 PR
pulls = repo.get_pulls(state='open', sort='created', direction='desc')
for pr in pulls[:5]:
    print(f"#{pr.number}: {pr.title} (by {pr.user.login})")

# 创建 Release
repo.create_git_release(
    tag="v1.1.0",
    name="v1.1.0 - 新版本",
    message="发布新版本",
    draft=False,
    prerelease=False
)

# 自动化：批量给 Issue 添加标签
issues = repo.get_issues(state='open')
for issue in issues:
    if 'bug' not in [l.name for l in issue.labels]:
        if 'error' in issue.body.lower():
            issue.add_to_labels('bug')
            print(f"Issue #{issue.number} 已标记为 bug")
\`\`\`

### 7.5 使用 GitHub Webhooks

\`\`\`text
Webhooks：当仓库发生事件时，GitHub 主动向你的服务器发送 HTTP 请求

配置：仓库 Settings → Webhooks → Add webhook
┌─────────────────────────────────────────┐
│ Webhook                                 │
├─────────────────────────────────────────┤
│ Payload URL: https://api.example.com/gh │
│ Content type: [application/json ▼]      │
│ Secret: [xxxxxxx]                       │
│                                         │
│ Which events:                           │
│  ● Just the push event                  │
│  ○ Send me everything                   │
│  ○ Let me select individual events      │
│    ☑ Pushes                             │
│    ☑ Pull requests                      │
│    ☑ Issues                             │
│                                         │
│           [Add webhook]                 │
└─────────────────────────────────────────┘
\`\`\`

\`\`\`python
# Flask 接收 Webhook 示例
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "your-secret"

def verify_signature(payload, signature):
    expected = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.route('/gh', methods=['POST'])
def webhook():
    payload = request.get_data()
    signature = request.headers.get('X-Hub-Signature-256', '')
    
    if not verify_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.headers.get('X-GitHub-Event', '')
    data = request.json
    
    if event == 'push':
        print(f"推送事件: {data['ref']}")
        for commit in data['commits']:
            print(f"  - {commit['message']}")
    elif event == 'pull_request':
        action = data['action']
        pr = data['pull_request']
        print(f"PR {action}: #{pr['number']} {pr['title']}")
    elif event == 'issues':
        issue = data['issue']
        print(f"Issue: #{issue['number']} {issue['title']}")
    
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(port=5000)
\`\`\`

---

## 八、保护分支与规则

### 8.1 分支保护的重要性

\`\`\`text
不保护的风险：
- 任何人可直接 push 到 main 分支
- 未经审查的代码被合并
- 误操作覆盖历史
- 强制推送破坏协作

保护分支的好处：
- 强制 Code Review
- 强制 CI 通过
- 防止误删除
- 保持历史稳定
\`\`\`

### 8.2 配置分支保护规则

\`\`\`text
仓库 Settings → Branches → Add branch protection rule：
┌─────────────────────────────────────────────┐
│ Branch protection rule                     │
├─────────────────────────────────────────────┤
│ Branch name pattern: [main]                │
│                                             │
│ ☑ Require a pull request before merging    │
│   Required approvals: [2]                  │
│   ☐ Dismiss stale pull request approvals   │
│   ☐ Require review from Code Owners        │
│                                             │
│ ☑ Require status checks to pass            │
│   ☑ Require branches to be up to date      │
│   Status checks: CI / Test / Lint          │
│                                             │
│ ☑ Require conversation resolution          │
│                                             │
│ ☑ Require signed commits                   │
│                                             │
│ ☑ Require linear history                   │
│                                             │
│ ☐ Include administrators                   │
│                                             │
│ ☐ Restrict who can push to matching        │
│   branches                                 │
│                                             │
│           [Create]                          │
└─────────────────────────────────────────────┘
\`\`\`

### 8.3 各选项说明

\`\`\`text
Require a pull request before merging
  → 必须通过 PR 合并，禁止直接 push
  Required approvals: 2
  → 至少 2 人 approve 才能合并

Require status checks to pass
  → CI 必须通过才能合并
  Require branches to be up to date
  → 合并前必须与目标分支同步

Require conversation resolution
  → PR 中所有讨论必须解决

Require signed commits
  → 提交必须 GPG 签名

Require linear history
  → 禁止 merge commit，保持线性历史

Include administrators
  → 管理员也受规则约束
\`\`\`

### 8.4 使用 gh CLI 配置

\`\`\`bash
# 启用 main 分支保护
gh api \\
  --method PUT \\
  -H "Accept: application/vnd.github+json" \\
  /repos/username/repo/branches/main/protection \\
  -f 'required_status_checks[strict]=true' \\
  -f 'required_status_checks[contexts][]=CI' \\
  -f 'required_pull_request_reviews[required_approving_review_count]=2' \\
  -f 'enforce_admins=false' \\
  -f 'restrictions='
\`\`\`

### 8.5 Tag 保护规则

\`\`\`text
仓库 Settings → Tags → Add rule：

Tag pattern: v*
→ 匹配 v 开头的 Tag，如 v1.0.0

Restrict who can create matching tags:
- @myteam/release-managers

效果：只有 release-managers 团队可创建 v* 标签
\`\`\`

---

## 九、本章小结

### 9.1 知识点回顾

\`\`\`text
1. GitHub Actions 实现 CI/CD，配置在 .github/workflows/*.yml
2. Releases 基于发布版本，可附加二进制和说明
3. Wiki 用于项目文档，支持本地克隆编辑
4. Projects 提供看板视图，关联 Issues 和 PR
5. 组织和团队实现权限分层管理
6. GitHub CLI（gh）支持命令行操作
7. REST API 与 Webhooks 实现自动化集成
8. 分支保护规则确保代码质量
\`\`\`

### 9.2 进阶建议

\`\`\`text
- 学习编写自定义 Action
- 掌握矩阵构建、缓存优化
- 探索 GitHub Apps 开发
- 研究自动依赖更新（Dependabot）
- 实践 GitOps 工作流
\`\`\`

### 9.3 下一章预告

下一章将介绍 GitLab 与自托管 Git 服务，对比 GitLab 与 GitHub 的差异，讲解 GitLab CE/EE 安装、Merge Request 流程、GitLab CI/CD、Runner 配置以及私有部署的优势。
`
  },
  {
    id: "deploy-gitlab-basics",
    icon: "🦊",
    title: "GitLab 与自托管 Git 服务",
    group: "GitHub 与 GitLab",
    content: `# GitLab 与自托管 Git 服务

## 一、GitLab vs GitHub 对比

### 1.1 GitLab 简介

GitLab 是一个完整的 DevOps 平台，提供从代码管理到 CI/CD、安全扫描、监控的端到端解决方案。与 GitHub 不同，GitLab 既提供 SaaS 服务，也支持完全自托管。

\`\`\`text
GitLab 核心能力：
- Git 代码托管
- Merge Request 协作
- 内置 CI/CD（无需第三方）
- 容器 registry
- 安全扫描
- 项目管理
- Wiki 文档
- 监控告警
\`\`\`

### 1.2 GitHub vs GitLab 详细对比

\`\`\`text
┌─────────────────┬────────────────────┬────────────────────┐
│ 对比项          │ GitHub             │ GitLab             │
├─────────────────┼────────────────────┼────────────────────┤
│ 部署方式        │ SaaS 为主          │ SaaS + 自托管       │
│ CI/CD           │ Actions（外挂式）  │ 内置一体化          │
│ 私有仓库        │ 免费               │ 免费                │
│ Runner          │ 自带 + 自托管       │ 自托管为主          │
│ 容器 Registry   │ Packages           │ 内置 Registry       │
│ 安全扫描        │ 高级版功能          │ 内置（部分免费）    │
│ Wiki            │ 基础               │ 更强大              │
│ 项目管理        │ Projects           │ Issues/Milestones   │
│ 私有部署        │ 不支持             │ 支持（CE 免费）     │
│ 价格            │ 免费起步           │ CE 完全免费         │
│ 用户量          │ 1 亿+              │ 数千万              │
│ 国内访问        │ 较慢               │ 自托管无延迟        │
└─────────────────┴────────────────────┴────────────────────┘
\`\`\`

### 1.3 选型建议

\`\`\`text
选择 GitHub 的场景：
- 开源项目，希望获得更多曝光
- 个人项目，使用免费 Actions
- 团队已熟练 GitHub 工作流
- 需要借助 GitHub 生态

选择 GitLab 的场景：
- 企业内部代码，需要私有部署
- 重视数据安全和合规
- 一体化 DevOps 平台需求
- 国内访问要求快速
- 大规模 CI/CD 需求
- 容器化开发流程
\`\`\`

---

## 二、GitLab SaaS vs 自托管

### 2.1 GitLab SaaS（gitlab.com）

\`\`\`text
GitLab SaaS 特点：
- 访问 https://gitlab.com 注册使用
- 无需部署运维
- 免费层支持私有仓库
- 数据存储在 GitLab 服务器（境外）
- 国内访问可能较慢

免费层功能：
- 无限私有仓库
- 400 分钟/月 CI
- 5GB 存储
- 基础 Issue 管理
\`\`\`

### 2.2 自托管 GitLab

\`\`\`text
自托管优势：
- 数据完全自主可控
- 国内访问零延迟
- 可定制集成内网系统
- 不受第三方策略限制
- 无用户数限制

自托管劣势：
- 需要服务器资源（推荐 4GB+ 内存）
- 需运维人员维护
- 升级需自行操作
- 硬件故障需自行恢复
\`\`\`

### 2.3 GitLab CE/EE 版本

\`\`\`text
GitLab 版本对比：

CE（Community Edition）社区版：
- 完全免费开源
- 核心代码托管功能
- CI/CD 基础功能
- 适合中小团队

EE（Enterprise Edition）企业版：
- 需要 License
- 高级 CI/CD 功能
- 高级安全扫描
- 合规与审计
- 优先技术支持

推荐：
- 个人/小团队 → CE
- 中大型企业 → EE（付费功能值得）
- 测试评估 → CE（功能足够）
\`\`\`

---

## 三、GitLab CE/EE 安装（Docker 方式）

### 3.1 准备工作

\`\`\`bash
# 服务器最低配置建议：
# CPU: 4 核
# 内存: 4GB（推荐 8GB+）
# 硬盘: 50GB+ SSD
# 系统: Ubuntu 22.04 LTS

# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Docker（如未安装）
curl -fsSL https://get.docker.com | sudo sh

# 3. 启动 Docker 并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 4. 验证 Docker
sudo docker --version
# Docker version 24.0.7

# 5. 安装 Docker Compose
sudo apt install docker-compose-plugin
# 或：sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
\`\`\`

### 3.2 使用 Docker Compose 部署

\`\`\`bash
# 1. 创建数据目录
sudo mkdir -p /opt/gitlab/{config,data,logs}
cd /opt/gitlab

# 2. 创建 docker-compose.yml
sudo cat > docker-compose.yml << 'EOF'
version: '3.6'

services:
  gitlab:
    image: 'gitlab/gitlab-ce:latest'
    container_name: gitlab
    restart: always
    hostname: 'gitlab.example.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        # 外部访问地址
        external_url 'http://gitlab.example.com'
        
        # 时区
        gitlab_rails['time_zone'] = 'Asia/Shanghai'
        
        # SSH 端口
        gitlab_rails['gitlab_shell_ssh_port'] = 2222
        
        # 邮件配置（可选）
        gitlab_rails['smtp_enable'] = true
        gitlab_rails['smtp_address'] = "smtp.example.com"
        gitlab_rails['smtp_port'] = 587
        gitlab_rails['smtp_user_name'] = "noreply@example.com"
        gitlab_rails['smtp_password'] = "your-password"
        gitlab_rails['smtp_domain'] = "example.com"
        gitlab_rails['smtp_authentication'] = "login"
        gitlab_rails['smtp_enable_starttls_auto'] = true
        gitlab_rails['smtp_tls'] = false
        
        # 备份配置
        gitlab_rails['backup_keep_time'] = 604800  # 7 天
        
        # 关闭内置 Prometheus（节省资源）
        prometheus_monitoring['enable'] = false
        
        # 关闭内置 Grafana
        grafana['enable'] = false
    ports:
      - '80:80'      # HTTP
      - '443:443'    # HTTPS
      - '2222:22'    # SSH
    volumes:
      - './config:/etc/gitlab'
      - './logs:/var/log/gitlab'
      - './data:/var/opt/gitlab'
    shm_size: '256m'
EOF

# 3. 启动 GitLab
sudo docker-compose up -d
# -d 后台运行

# 4. 查看启动日志
sudo docker logs -f gitlab
# 启动需要几分钟，看到 "gitlab Reconfigured!" 表示成功
\`\`\`

### 3.3 首次登录配置

\`\`\`bash
# 1. 获取初始 root 密码
sudo docker exec gitlab cat /etc/gitlab/initial_root_password
# 输出示例：
# # WARNING: This value is valid only in the following conditions...
# Password: AbCdEfGh1234567890...

# 2. 访问 GitLab
# 浏览器打开 http://服务器IP
# 用户名：root
# 密码：上面获取的密码
\`\`\`

\`\`\`text
首次登录界面：
┌─────────────────────────────────────────┐
│ GitLab                                  │
├─────────────────────────────────────────┤
│                                         │
│    Sign in                               │
│                                         │
│    Username or email                    │
│    [root_________________________]      │
│                                         │
│    Password                             │
│    [_____________________________]      │
│                                         │
│              [Sign in]                  │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

### 3.4 修改密码与基础设置

\`\`\`text
登录后操作：
1. 右上角头像 → Preferences → Password
   修改 root 密码为强密码

2. Admin Area（小扳手图标）→ Settings → General
   - 修改站点名称
   - 关闭注册（私用）：Sign-up restrictions → 取消 Sign-up enabled
   - 限制登录方式

3. 创建普通用户
   Admin Area → Users → New user
\`\`\`

### 3.5 配置 HTTPS

\`\`\`bash
# 1. 准备 SSL 证书
sudo mkdir -p /opt/gitlab/config/ssl
sudo cp /path/to/cert.pem /opt/gitlab/config/ssl/gitlab.example.com.crt
sudo cp /path/to/key.pem /opt/gitlab/config/ssl/gitlab.example.com.key
sudo chmod 600 /opt/gitlab/config/ssl/*

# 2. 修改 docker-compose.yml
# external_url 'https://gitlab.example.com'
# 添加：
# nginx['redirect_http_to_https'] = true
# nginx['ssl_certificate'] = "/etc/gitlab/ssl/gitlab.example.com.crt"
# nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/gitlab.example.com.key"

# 3. 重启 GitLab
sudo docker-compose restart
\`\`\`

### 3.6 升级 GitLab

\`\`\`bash
# 1. 备份（重要！）
sudo docker exec gitlab gitlab-backup create

# 2. 拉取新版本镜像
sudo docker pull gitlab/gitlab-ce:latest

# 3. 停止并删除旧容器
sudo docker-compose down

# 4. 启动新容器
sudo docker-compose up -d

# 5. 查看升级日志
sudo docker logs -f gitlab
\`\`\`

---

## 四、仓库管理

### 4.1 创建项目

\`\`\`text
GitLab 顶部 + → New project：
┌─────────────────────────────────────────────┐
│ New project                                │
├─────────────────────────────────────────────┤
│ ○ Create blank project    创建空白项目      │
│ ○ Create from template    从模板创建        │
│ ○ Import project          导入项目          │
│                                            │
│ 选择 Create blank project:                 │
│                                            │
│ Project name: [my-python-app]              │
│ Project URL: [namespace ▼]/[my-python-app] │
│ Visibility Level:                          │
│   ○ Public   公开                          │
│   ○ Internal 内部（登录可见）              │
│  ● Private  私有                           │
│                                            │
│ ☐ Initialize repository with a README      │
│ ☐ Enable Static Application Security Test  │
│                                            │
│           [Create project]                 │
└─────────────────────────────────────────────┘
\`\`\`

### 4.2 仓库可见性级别

\`\`\`text
Public（公开）：
- 任何人可见
- 无需登录即可访问
- 适合开源项目

Internal（内部）：
- 登录用户可见
- 适合公司内部项目
- 默认级别

Private（私有）：
- 仅成员可见
- 需显式授权
- 适合敏感项目
\`\`\`

### 4.3 添加成员

\`\`\`text
项目 → Manage → Members：
┌─────────────────────────────────────────────┐
│ Add new member                             │
├─────────────────────────────────────────────┤
│ GitLab user or email address:              │
│ [@zhangsan _______________________]        │
│                                            │
│ Select a role:                             │
│   ○ Guest          访客（只读）             │
│   ○ Reporter       报告者（管理 Issue）    │
│  ● Developer       开发者（可推送）         │
│   ○ Maintainer     维护者（合并 MR）       │
│   ○ Owner          所有者（完全控制）       │
│                                            │
│ Access expiration date: [可选]              │
│                                            │
│           [Invite]                         │
└─────────────────────────────────────────────┘
\`\`\`

### 4.4 SSH Key 配置

\`\`\`bash
# 1. 生成 SSH Key（如已生成可跳过）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 查看公钥
cat ~/.ssh/id_ed25519.pub
# 复制输出内容

# 3. 在 GitLab 添加 SSH Key
# 头像 → Preferences → SSH Keys → Add new key
# 粘贴公钥，Title 填写设备名

# 4. 测试连接（替换为你自己的域名）
ssh -T git@gitlab.example.com -p 2222
# 输出：Welcome to GitLab, @username!
\`\`\`

### 4.5 推送本地项目

\`\`\`bash
# 1. 关联远程仓库
cd /path/to/local-project
git remote add origin git@gitlab.example.com:username/my-python-app.git

# 2. 推送
git branch -M main
git push -u origin main
\`\`\`

---

## 五、Merge Request 流程

### 5.1 MR 与 PR 的区别

\`\`\`text
GitLab Merge Request (MR) ≈ GitHub Pull Request (PR)

差异：
- MR 集成更深入的 CI/CD 状态
- MR 支持更细粒度的批准规则
- MR 支持 WIP（Work In Progress）标记
- MR 支持 Draft 状态
- MR 内置冲突解决工具
\`\`\`

### 5.2 创建 Merge Request

\`\`\`bash
# 1. 创建功能分支
git checkout -b feature/payment

# 2. 开发并提交
git add .
git commit -m "feat: 添加支付模块"
git push -u origin feature/payment
\`\`\`

\`\`\`text
推送后 GitLab 会显示提示：
┌─────────────────────────────────────────┐
│ You just pushed a new branch            │
│                                         │
│ [Create merge request]                  │
└─────────────────────────────────────────┘

点击进入创建页面：
┌─────────────────────────────────────────────┐
│ New Merge Request                          │
├─────────────────────────────────────────────┤
│ Source branch: [feature/payment ▼]         │
│ Target branch:  [main ▼]                   │
│                                            │
│ Title: [Draft: feat: 添加支付模块]         │
│                                            │
│ Description:                               │
│ ┌────────────────────────────────────────┐ │
│ │ ## 修改说明                             │ │
│ │ - 新增支付宝/微信支付接口                │ │
│ │ - 添加订单状态机                        │ │
│ │ - 支付回调处理                          │ │
│ │                                        │ │
│ │ ## 测试情况                             │ │
│ │ - [x] 单元测试                          │ │
│ │ - [x] 集成测试                          │ │
│ │                                        │ │
│ │ Closes #28                             │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Assignee:       [@lisi ▼]                 │
│ Reviewer:       [@wangwu ▼]               │
│ Milestone:      [v2.0 ▼]                  │
│ Labels:         [feature ▼]               │
│                                            │
│ ☑ Squash commits when merge request is     │
│   accepted.                                │
│ ☑ Delete source branch when merge          │
│   request is accepted.                     │
│                                            │
│           [Create merge request]           │
└─────────────────────────────────────────────┘
\`\`\`

### 5.3 MR 状态与审查

\`\`\`text
MR 页面布局：
┌─────────────────────────────────────────────┐
│ Draft: feat: 添加支付模块 !12  [Open]      │
├─────────────────────────────────────────────┤
│ 📝 Discussion | 💬 Changes | 📊 Pipelines  │
├─────────────────────────────────────────────┤
│ ✅ CI/CD Pipeline #456 passed              │
│ ✅ 3 approvals received                    │
│ ✅ No conflicts with target branch         │
│                                            │
│ Reviewers:                                 │
│ @lisi ✅ approved 2 hours ago              │
│ @wangwu ✅ approved 1 hour ago             │
│                                            │
│ [Mark as ready] [Merge] [Close]            │
└─────────────────────────────────────────────┘

Draft 状态：标题以 "Draft:" 开头表示工作进度中，无法合并
点击 "Mark as ready" 后变为正式 MR，可合并
\`\`\`

### 5.4 代码审查

\`\`\`text
MR → Changes 标签：
┌─────────────────────────────────────────────┐
│ Changes                                     │
├─────────────────────────────────────────────┤
│ src/payment.py                              │
│ @@ -5,6 +5,20 @@ def create_order():        │
│   return Order(status='pending')            │
│                                             │
│ +def process_payment(order, method):       │
│ +    """处理支付"""                          │
│ +    if method == 'alipay':          [💬]   │
│ +        return AlipayGateway().pay(order)  │
│ +    elif method == 'wechat':               │
│ +        return WechatGateway().pay(order)  │
│ +    else:                                  │
│ +        raise ValueError('Unsupported')   │
│                                             │
│ 评论框示例：                                 │
│ @zhangsan: 建议使用策略模式，避免 if/elif    │
│                                            │
│ [Start a review] [Add comment now]         │
│                                            │
│ [Submit review]                            │
│   ○ Comment                                │
│   ○ Approve                                │
│   ● Request changes                        │
└─────────────────────────────────────────────┘
\`\`\`

### 5.5 MR 模板

在仓库根目录创建 \`.gitlab/merge_request_templates/Default.md\`：

\`\`\`markdown
## 修改说明

<!-- 描述本次修改目的 -->

## 修改类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档
- [ ] 其他

## 测试

- [ ] 单元测试
- [ ] 集成测试
- [ ] 手动测试

## 关联 Issue

Closes #

## 检查清单

- [ ] 代码符合规范
- [ ] 添加了测试
- [ ] 更新了文档
- [ ] 无控制台警告
\`\`\`

---

## 六、GitLab CI/CD（.gitlab-ci.yml）

### 6.1 GitLab CI/CD 概念

\`\`\`text
核心概念：
- Pipeline（流水线）：完整的 CI/CD 流程
- Stage（阶段）：Pipeline 的分组，串行执行
- Job（作业）：Stage 内的具体任务，并行执行
- Runner：执行 Job 的服务器
- .gitlab-ci.yml：Pipeline 配置文件
\`\`\`

### 6.2 基础 .gitlab-ci.yml

\`\`\`yaml
# .gitlab-ci.yml
# 定义阶段，按顺序执行
stages:
  - test        # 测试阶段
  - build       # 构建阶段
  - deploy      # 部署阶段

# 全局变量
variables:
  PYTHON_VERSION: "3.11"
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

# 缓存配置
cache:
  paths:
    - .cache/pip
    - venv/

# 测试任务
test:
  stage: test
  image: python:3.11-slim  # 使用 Python 镜像
  before_script:
    - python -m venv venv
    - source venv/bin/activate
    - pip install -r requirements.txt
    - pip install pytest pytest-cov
  script:
    - pytest tests/ --cov=src --cov-report=term --cov-report=xml
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
  coverage: '/TOTAL.*\\s+(\\d+\\%)\\s+$/'
  # 从输出中提取覆盖率数字

# 代码风格检查
lint:
  stage: test
  image: python:3.11-slim
  before_script:
    - pip install flake8 black isort
  script:
    - flake8 src/ --max-line-length=100
    - black --check src/
    - isort --check-only src/
  allow_failure: true  # 允许失败，不阻塞流水线

# 构建任务
build:
  stage: build
  image: python:3.11-slim
  script:
    - pip install build
    - python -m build
  artifacts:
    paths:
      - dist/  # 上传构建产物
    expire_in: 1 week  # 1 周后过期

# 部署任务
deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
    - mkdir -p ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" >> ~/.ssh/known_hosts
  script:
    - ssh $SERVER_USER@$SERVER_HOST "cd /opt/app && git pull && pip install -r requirements.txt && systemctl restart app"
  environment:
    name: production
    url: https://app.example.com
  only:
    - main  # 只在 main 分支触发
\`\`\`

### 6.3 Pipeline 界面

\`\`\`text
项目 → CI/CD → Pipelines：
┌─────────────────────────────────────────────┐
│ Pipelines                                   │
├─────────────────────────────────────────────┤
│ #456  main  ✓ passed  2 minutes ago         │
│ ┌─────────┬─────────┬─────────┐             │
│ │  test   │  build  │ deploy  │             │
│ │  ✓ ✓    │   ✓     │   ✓     │             │
│ └─────────┴─────────┴─────────┘             │
│                                             │
│ #455  develop  ✓ passed  10 minutes ago     │
│ ┌─────────┬─────────┐                       │
│ │  test   │  build  │                       │
│ │  ✓ ✓    │   ✓     │                       │
│ └─────────┴─────────┘                       │
└─────────────────────────────────────────────┘
\`\`\`

### 6.4 高级用法：多环境部署

\`\`\`yaml
# .gitlab-ci.yml 多环境配置
stages:
  - test
  - build
  - deploy

# 模板任务（不执行，被继承）
.deploy_template:
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
  script:
    - ssh $SERVER_USER@$SERVER_HOST "cd /opt/app && git pull && ./deploy.sh"
  only:
    refs:
      - $BRANCH_NAME

# 部署到开发环境
deploy_dev:
  extends: .deploy_template
  stage: deploy
  environment:
    name: dev
    url: https://dev.app.example.com
  variables:
    BRANCH_NAME: develop
    SERVER_HOST: $DEV_SERVER_HOST
    SERVER_USER: $DEV_SERVER_USER
  only:
    - develop

# 部署到测试环境
deploy_staging:
  extends: .deploy_template
  stage: deploy
  environment:
    name: staging
    url: https://staging.app.example.com
  variables:
    BRANCH_NAME: main
    SERVER_HOST: $STAGING_SERVER_HOST
    SERVER_USER: $STAGING_SERVER_USER
  only:
    - main
  when: manual  # 手动触发

# 部署到生产环境
deploy_prod:
  extends: .deploy_template
  stage: deploy
  environment:
    name: production
    url: https://app.example.com
  variables:
    BRANCH_NAME: tags
    SERVER_HOST: $PROD_SERVER_HOST
    SERVER_USER: $PROD_SERVER_USER
  only:
    - tags
  when: manual
  needs:
    - deploy_staging  # 必须先完成 staging 部署
\`\`\`

### 6.5 CI/CD 变量配置

\`\`\`text
项目 → Settings → CI/CD → Variables：
┌─────────────────────────────────────────────┐
│ Variables                                  │
├─────────────────────────────────────────────┤
│ Key                       Value    Protected│
│ SSH_PRIVATE_KEY          ***       ☑        │
│ DEV_SERVER_HOST          ***       ☑        │
│ DEV_SERVER_USER          deploy    ☐        │
│ DATABASE_PASSWORD        ***       ☑        │
│ API_KEY                  ***       ☑        │
│                                            │
│           [Add variable]                   │
└─────────────────────────────────────────────┘

变量属性：
- Masked：日志中显示为 [MASKED]，保护敏感信息
- Protected：仅在受保护分支/Tag 中可用
- Expanded：支持 $VAR 形式展开
\`\`\`

---

## 七、GitLab Runner

### 7.1 什么是 Runner

\`\`\`text
GitLab Runner 是执行 CI/CD Job 的执行器：
- 接收 GitLab 的 Job 任务
- 在指定环境执行
- 返回结果和日志

Runner 类型：
- Shared Runner  共享（全平台可用）
- Group Runner   组级（组内可用）
- Specific Runner 项目专属
\`\`\`

### 7.2 安装 Runner

\`\`\`bash
# 方式一：直接安装（Ubuntu/Debian）
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner

# 方式二：Docker 安装
docker run -d --name gitlab-runner --restart always \\
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  gitlab/gitlab-runner:latest

# 验证安装
gitlab-runner --version
# Version: 16.5.0
\`\`\`

### 7.3 注册 Runner

\`\`\`bash
# 1. 获取注册 Token
# 项目 → Settings → CI/CD → Runners → New project runner
# 复制 Registration Token

# 2. 注册 Runner
sudo gitlab-runner register

# 交互式输入：
# Enter the GitLab instance URL:
# → https://gitlab.example.com
# Enter the registration token:
# → 粘贴 Token
# Enter a description for the runner:
# → my-runner-01
# Enter tags for the runner (comma-separated):
# → python,linux,docker
# Enter the executor: ssh, docker+machine, docker, ...
# → docker
# Default Docker image:
# → python:3.11-slim
\`\`\`

### 7.4 Runner 配置文件

\`\`\`bash
# 查看配置
sudo cat /etc/gitlab-runner/config.toml

# 配置示例：
# [[runners]]
#   name = "my-runner-01"
#   url = "https://gitlab.example.com"
#   token = "xxxxx"
#   executor = "docker"
#   [runners.custom_build_dir]
#   [runners.cache]
#     [runners.cache.s3]
#     [runners.cache.gcs]
#     [runners.cache.azure]
#   [runners.docker]
#     tls_verify = false
#     image = "python:3.11-slim"
#     privileged = false
#     disable_entrypoint_overwrite = false
#     oom_kill_disable = false
#     disable_cache = false
#     volumes = ["/cache"]
#     shm_size = 0
#     network_mode = "host"
\`\`\`

### 7.5 Runner 管理

\`\`\`bash
# 启动 Runner
sudo gitlab-runner start

# 停止 Runner
sudo gitlab-runner stop

# 重启 Runner
sudo gitlab-runner restart

# 查看状态
sudo gitlab-runner status
# Runtime platform: arch=amd64 os=linux revision=... version=...
# gitlab-runner: Service is running!

# 查看运行中的 Job
sudo gitlab-runner verify

# 注销 Runner
sudo gitlab-runner unregister --name my-runner-01
\`\`\`

### 7.6 使用 Tags 路由 Job

\`\`\`yaml
# .gitlab-ci.yml 使用 tags 选择 Runner
deploy:
  stage: deploy
  tags:
    - linux       # 必须在带 linux tag 的 Runner 执行
    - production  # 且带 production tag
  script:
    - echo "Deploying to production"
\`\`\`

---

## 八、私有部署优势

### 8.1 数据安全与合规

\`\`\`text
私有部署的核心优势：

1. 数据主权
   - 代码不离开企业内网
   - 完全掌控数据存储位置
   - 满足数据本地化要求

2. 访问控制
   - 集成企业 SSO/LDAP
   - 内网访问限制
   - 详细审计日志

3. 合规要求
   - 满足等保 2.0 三级要求
   - 满足 GDPR 数据保护
   - 行业监管要求（金融/医疗）

4. 网络性能
   - 内网访问零延迟
   - 大文件传输不受公网限制
   - 国内访问稳定
\`\`\`

### 8.2 集成企业系统

\`\`\`bash
# 集成 LDAP/AD
# /etc/gitlab/gitlab.rb 添加：
gitlab_rails['ldap_enabled'] = true
gitlab_rails['ldap_servers'] = {
  'main' => {
    'label' => 'LDAP',
    'host' =>  'ldap.example.com',
    'port' => 389,
    'uid' => 'uid',
    'method' => 'plain',
    'bind_dn' => 'CN=gitlab,OU=Service,DC=example,DC=com',
    'password' => 'ldap-password',
    'active_directory' => false,
    'allow_username_or_email_login' => true,
    'block_auto_created_users' => false,
    'base' => 'DC=example,DC=com',
    'user_filter' => ''
  }
}

# 应用配置
sudo gitlab-ctl reconfigure
\`\`\`

### 8.3 备份与恢复

\`\`\`bash
# 1. 创建备份
sudo docker exec gitlab gitlab-backup create
# 备份文件：/var/opt/gitlab/backups/1700000000_2026_01_01_gitlab_backup.tar

# 2. 备份配置（重要，包含密钥）
sudo tar -czf gitlab-config-backup.tar.gz /opt/gitlab/config

# 3. 自动备份脚本
sudo cat > /opt/gitlab/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/gitlab"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# 创建备份
docker exec gitlab gitlab-backup create BACKUP=$DATE

# 复制配置
tar -czf $BACKUP_DIR/config-$DATE.tar.gz -C /opt/gitlab config

# 保留最近 7 天
find $BACKUP_DIR -name "*.tar" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# 同步到远程（可选）
rsync -avz $BACKUP_DIR/ backup@remote:/backup/gitlab/
EOF

# 添加定时任务（每天凌晨 2 点备份）
sudo crontab -e
# 添加：0 2 * * * /opt/gitlab/backup.sh
\`\`\`

### 8.4 恢复备份

\`\`\`bash
# 1. 停止数据服务
sudo docker exec gitlab gitlab-ctl stop unicorn
sudo docker exec gitlab gitlab-ctl stop sidekiq

# 2. 恢复备份
sudo docker exec -it gitlab gitlab-backup restore BACKUP=1700000000_2026_01_01

# 3. 恢复配置
sudo tar -xzf gitlab-config-backup.tar.gz -C /

# 4. 重启 GitLab
sudo docker exec gitlab gitlab-ctl restart

# 5. 检查
sudo docker exec gitlab gitlab-rake gitlab:check SANITIZE=true
\`\`\`

### 8.5 监控告警

\`\`\`bash
# 启用内置 Prometheus（如关闭过）
# /etc/gitlab/gitlab.rb:
# prometheus_monitoring['enable'] = true

# 查看监控
sudo docker exec gitlab gitlab-ctl status prometheus

# 集成外部 Prometheus + Grafana
# 在 Grafana 导入 GitLab Dashboard
# 模板 ID: 5774（GitLab Overview）

# 告警规则示例（Prometheus）：
# alert: GitlabHighCPU
#   expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
#   for: 5m
#   labels:
#     severity: warning
#   annotations:
#     summary: "GitLab CPU 使用率高"
\`\`\`

---

## 九、本章小结

### 9.1 知识点回顾

\`\`\`text
1. GitLab 是一体化 DevOps 平台，支持 SaaS 与自托管
2. CE 版本完全免费开源，适合中小团队
3. Docker Compose 是推荐的部署方式
4. Merge Request 流程与 PR 类似但集成更深
5. .gitlab-ci.yml 定义 Pipeline，分 stages 执行
6. GitLab Runner 执行 Job，支持多种 executor
7. 私有部署优势：数据安全、网络性能、合规要求
8. 备份恢复与监控是运维核心
\`\`\`

### 9.2 推荐实践

\`\`\`text
- 生产环境使用 EE 试用后再决定是否购买
- Runner 使用 Docker executor，隔离性好
- 配置 CI/CD 变量时勾选 Masked 和 Protected
- 定期备份并演练恢复流程
- 监控 CPU/内存/磁盘，及时扩容
\`\`\`

### 9.3 下一章预告

下一章将介绍团队协作流程与规范，包括 Fork & Pull 模式与 Shared Repository 模式对比、分支策略选型、PR/MR 模板、CONTRIBUTING.md、CODEOWNERS 自动审查、发布流程与开源项目协作实战。
`
  },
  {
    id: "deploy-collaboration",
    icon: "🤝",
    title: "团队协作流程与规范",
    group: "GitHub 与 GitLab",
    content: `# 团队协作流程与规范

## 一、Fork & Pull 模式 vs Shared Repository 模式

### 1.1 Fork & Pull 模式

\`\`\`text
Fork & Pull 工作流：
1. 贡献者 Fork 原仓库到自己账号
2. Clone 自己的 Fork 到本地
3. 创建功能分支开发
4. Push 到自己的 Fork
5. 向原仓库发起 Pull Request
6. 原仓库维护者审查并合并

适用场景：
- 开源项目（贡献者众多且无直接推送权限）
- 公开项目（任何人可参与）
- 大型社区项目（如 Linux Kernel）
\`\`\`

#### Fork & Pull 完整流程

\`\`\`bash
# 1. Fork 仓库（在 GitHub/GitLab 网页操作）

# 2. 克隆自己的 Fork
git clone git@github.com:your-username/awesome-project.git
cd awesome-project

# 3. 添加上游仓库
git remote add upstream git@github.com:original-author/awesome-project.git

# 4. 同步上游最新代码
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 5. 创建功能分支
git checkout -b feature/add-search

# 6. 开发并提交
git add .
git commit -m "feat: 添加搜索功能"
git push -u origin feature/add-search

# 7. 在 GitHub 创建 PR：your-username/awesome-project → original-author/awesome-project
\`\`\`

### 1.2 Shared Repository 模式

\`\`\`text
Shared Repository 工作流：
1. 所有开发者都有仓库的推送权限
2. 直接克隆主仓库
3. 创建功能分支（不直接在 main 开发）
4. 推送功能分支到主仓库
5. 发起 PR 合并到 main

适用场景：
- 团队内部项目
- 公司私有项目
- 核心团队人数不多
\`\`\`

#### Shared Repository 完整流程

\`\`\`bash
# 1. 直接克隆主仓库
git clone git@github.com:company-team/my-project.git
cd my-project

# 2. 创建功能分支
git checkout -b feature/user-auth

# 3. 开发并提交
git add .
git commit -m "feat: 添加用户认证"
git push -u origin feature/user-auth

# 4. 在 GitHub 创建 PR：feature/user-auth → main
# 5. 团队成员审查后合并
\`\`\`

### 1.3 两种模式对比

\`\`\`text
┌──────────────┬────────────────────┬────────────────────┐
│ 对比项        │ Fork & Pull        │ Shared Repository  │
├──────────────┼────────────────────┼────────────────────┤
│ 仓库数量      │ 每人一份 Fork       │ 只有一个主仓库       │
│ 推送权限      │ 仅自己的 Fork       │ 主仓库功能分支       │
│ 适用规模      │ 大型社区           │ 小型团队             │
│ 上游同步      │ 需要手动同步        │ 不需要               │
│ 入门门槛      │ 较高               │ 较低                 │
│ 权限管理      │ 简单（无需授权）    │ 复杂（需分配权限）    │
│ 典型项目      │ Linux、Kubernetes  │ 公司内部项目         │
└──────────────┴────────────────────┴────────────────────┘
\`\`\`

### 1.4 选型建议

\`\`\`text
选择 Fork & Pull 当：
- 项目是开源的
- 贡献者来自不同组织
- 不想给所有人推送权限
- 期望接受外部贡献

选择 Shared Repository 当：
- 项目是私有/内部的
- 团队成员稳定
- 希望简化协作流程
- 需要更紧密的协作
\`\`\`

---

## 二、团队分支策略选型

### 2.1 主流分支策略

#### 2.1.1 GitHub Flow（轻量）

\`\`\`text
分支结构：
- main     主分支（始终可部署）
- feature/* 功能分支

流程：
1. 从 main 创建 feature 分支
2. 开发并提交
3. 创建 PR 到 main
4. 审查通过后合并
5. 部署 main

优点：简单、适合持续部署
缺点：缺乏发布管理
\`\`\`

#### 2.1.2 Git Flow（重型）

\`\`\`text
分支结构：
- main      生产环境
- develop   开发主线
- feature/* 功能开发
- release/* 发布准备
- hotfix/*  紧急修复

流程：
1. develop 分支开发
2. feature 分支开发具体功能
3. 合并到 develop
4. 创建 release 分支准备发布
5. 测试通过后合并到 main 和 develop
6. 生产 Bug 用 hotfix 修复

优点：严格的发布管理
缺点：复杂，适合有明确发布周期的项目
\`\`\`

#### 2.1.3 GitLab Flow（环境驱动）

\`\`\`text
分支结构：
- main           主分支
- feature/*      功能分支
- pre-production 预发布环境
- production     生产环境

流程：
1. feature 合并到 main
2. main 合并到 pre-production
3. pre-production 合并到 production

优点：环境与分支对应清晰
缺点：需维护多个环境分支
\`\`\`

#### 2.1.4 Trunk-Based Development（主干开发）

\`\`\`text
分支结构：
- main     主干（所有人提交）
- short-lived feature  短生命周期分支

流程：
1. 创建短分支（<1 天）
2. 频繁 rebase main
3. 快速合并到 main
4. 通过 Feature Flag 控制功能可见性

优点：极致的持续集成
缺点：要求高度自动化测试
\`\`\`

### 2.2 策略对比

\`\`\`text
┌──────────────────┬──────────┬──────────┬──────────┐
│ 策略              │ 复杂度    │ 适用规模  │ 发布频率  │
├──────────────────┼──────────┼──────────┼──────────┤
│ GitHub Flow      │ ★        │ 小团队    │ 高        │
│ Git Flow         │ ★★★★    │ 中大型    │ 低        │
│ GitLab Flow      │ ★★★     │ 中大型    │ 中        │
│ Trunk-Based      │ ★★      │ 任何      │ 极高      │
└──────────────────┴──────────┴──────────┴──────────┘
\`\`\`

### 2.3 分支命名规范

\`\`\`bash
# 推荐的分支命名约定：

# 功能分支
feature/user-login
feature/payment-integration
feature/JIRA-123-add-export

# Bug 修复
bugfix/login-redirect
bugfix/ISSUE-456-memory-leak

# 紧急修复
hotfix/security-patch
hotfix/v1.2.3-crash

# 发布分支
release/v1.0.0
release/v2.0-beta

# 杂项
chore/update-deps
docs/api-reference
refactor/auth-module
\`\`\`

---

## 三、PR/MR 模板

### 3.1 GitHub PR 模板

创建 \`.github/PULL_REQUEST_TEMPLATE.md\`：

\`\`\`markdown
## 修改说明

<!-- 简要说明本次修改的目的和内容 -->

## 修改类型

请勾选适用项：

- [ ] 🚀 新功能（feature）
- [ ] 🐛 Bug 修复（bugfix）
- [ ] ♻️ 重构（refactor）
- [ ] 📚 文档（docs）
- [ ] ⚡ 性能优化（performance）
- [ ] 🧪 测试（test）
- [ ] 🔧 构建/CI（chore）

## 关联 Issue

<!-- 例如：Closes #123 -->

## 测试情况

- [ ] 已添加/更新单元测试
- [ ] 已通过本地测试
- [ ] 已更新相关文档

## 截图/录屏

<!-- 如有 UI 改动，请附截图 -->

## 检查清单

- [ ] 代码遵循项目编码规范
- [ ] 已自测通过
- [ ] 已添加必要的注释
- [ ] 提交信息符合 Conventional Commits
- [ ] 不引入新的警告
- [ ] 已更新 CHANGELOG（如适用）

## 备注

<!-- 任何需要审查者注意的事项 -->
\`\`\`

### 3.2 GitLab MR 模板

创建 \`.gitlab/merge_request_templates/Default.md\`：

\`\`\`markdown
## 修改说明

<!-- 描述本次修改 -->

## 修改类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档
- [ ] 性能优化
- [ ] 其他

## 测试

- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过
- [ ] E2E 测试通过

## 关联 Issue

Closes #

## Breaking Changes

<!-- 如有破坏性变更，请说明 -->

## 部署注意

<!-- 是否需要数据库迁移、配置变更等 -->

## 检查清单

- [ ] 代码审查自检完成
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息清晰
- [ ] 分支已与目标分支同步
\`\`\`

### 3.3 多模板配置

\`\`\`text
GitHub 支持多个 PR 模板：
.github/
├── PULL_REQUEST_TEMPLATE.md          # 默认模板
├── PULL_REQUEST_TEMPLATE/
│   ├── feature.md                    # 功能模板
│   ├── bugfix.md                     # 修复模板
│   └── release.md                    # 发布模板

URL 参数指定模板：
https://github.com/owner/repo/compare/main...feature?template=feature.md
\`\`\`

---

## 四、CONTRIBUTING.md 与代码规范

### 4.1 CONTRIBUTING.md 贡献指南

在仓库根目录创建 \`CONTRIBUTING.md\`：

\`\`\`markdown
# 贡献指南

感谢您对本项目的关注！欢迎提交 Issue 和 Pull Request。

## 行为准则

参与本项目需遵守 [行为准则](CODE_OF_CONDUCT.md)，请保持友善和尊重。

## 如何贡献

### 报告 Bug

1. 在 Issues 中搜索是否已有相同问题
2. 如无，创建新 Issue，使用 Bug 报告模板
3. 详细描述复现步骤、期望行为、实际行为

### 提交功能建议

1. 先在 Issues 中提出建议，讨论可行性
2. 获得维护者认可后开始开发
3. 开发完成后提交 PR

### 提交代码

#### 开发环境准备

\`\`\`bash
# Fork 仓库并克隆
git clone https://github.com/your-username/my-project.git
cd my-project

# 添加上游
git remote add upstream https://github.com/original/my-project.git

# 安装开发依赖
pip install -r requirements-dev.txt
pre-commit install
\`\`\`

#### 开发流程

1. **同步主分支**
   \`\`\`bash
   git checkout main
   git pull upstream main
   \`\`\`

2. **创建功能分支**
   \`\`\`bash
   git checkout -b feature/your-feature
   \`\`\`

3. **编写代码**
   - 遵循 PEP 8 规范
   - 添加类型注解
   - 编写单元测试

4. **提交代码**
   \`\`\`bash
   git add .
   git commit -m "feat: 添加 XX 功能"
   \`\`\`

5. **推送并创建 PR**
   \`\`\`bash
   git push origin feature/your-feature
   # 在 GitHub 创建 PR
   \`\`\`

## 代码规范

### Python 代码

- 遵循 [PEP 8](https://peps.python.org/pep-0008/)
- 使用 [Black](https://github.com/psf/black) 格式化
- 使用 [isort](https://pycqa.github.io/isort/) 排序 import
- 使用 [flake8](https://flake8.pycqa.org/) 检查
- 使用 [mypy](http://mypy-lang.org/) 类型检查

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

类型：
- feat:     新功能
- fix:      Bug 修复
- docs:     文档
- style:    代码格式
- refactor: 重构
- test:     测试
- chore:    构建/工具

示例：
\`\`\`
feat(auth): 添加 JWT 鉴权

- 实现 token 生成与验证
- 添加中间件
- 完善单元测试

Closes #42
\`\`\`

## 测试要求

- 新功能必须添加单元测试
- 测试覆盖率不低于 80%
- 所有测试必须通过：\`pytest tests/\`
- 提交前运行：\`pre-commit run --all-files\`

## PR 审查

- 至少需要 1 名维护者审查通过
- CI 必须全部通过
- 必须解决所有讨论
- 与主分支无冲突

## 行为准则

请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解详细规范。
\`\`\`

### 4.2 代码规范自动化

#### Pre-commit 配置

\`\`\`yaml
# .pre-commit-config.yaml
repos:
  # 代码格式化
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace    # 去除行尾空格
      - id: end-of-file-fixer      # 文件末尾换行
      - id: check-yaml             # 检查 YAML 语法
      - id: check-added-large-files
        args: ['--maxkb=500']      # 检查大文件
      - id: check-merge-conflict   # 检查合并冲突标记

  # Python 格式化
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3.11
        args: ['--line-length=100']

  # import 排序
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: ['--profile=black']

  # 代码检查
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        args: ['--max-line-length=100', '--extend-ignore=E203']

  # 类型检查
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]

  # 提交信息检查
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v3.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]
\`\`\`

\`\`\`bash
# 安装 pre-commit
pip install pre-commit

# 安装 git hooks
pre-commit install
pre-commit install --hook-type commit-msg

# 手动运行检查
pre-commit run --all-files
\`\`\`

#### EditorConfig

\`\`\`ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.{yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
\`\`\`

---

## 五、CODEOWNERS 自动审查

### 5.1 什么是 CODEOWNERS

CODEOWNERS 文件定义了"谁拥有哪些代码"，当对应代码被修改时，自动请求这些人审查。

\`\`\`text
CODEOWNERS 价值：
- 自动分配审查者
- 确保关键代码被专家审查
- 明确代码所有权
- 强制审查（配合分支保护）
\`\`\`

### 5.2 CODEOWNERS 语法

\`\`\`text
# CODEOWNERS 文件位置：
# GitHub: .github/CODEOWNERS 或 CODEOWNERS
# GitLab: CODEOWNERS（根目录或 docs/）

# 语法：pattern  owner1 owner2 @team

# 默认所有者（兜底）
*                           @maintainer1 @maintainer2

# 按目录分配
/src/auth/                  @auth-team
/src/payment/               @finance-team @john
/src/frontend/              @frontend-team

# 按文件类型分配
*.py                        @python-expert
*.tsx                       @react-expert
*.sql                       @dba-team

# 按具体文件
/package.json               @tech-lead
/README.md                  @docs-team @tech-lead
/LICENSE                    @legal-team

# 通配符
/docs/**/*.md               @docs-team
# ** 匹配任意层级的目录

# 排除（GitLab 支持）
/^src/test/                 @qa-team
# 以 ^ 开头表示正则匹配
\`\`\`

### 5.3 完整示例

\`\`\`text
# .github/CODEOWNERS

# 默认所有者
*                           @tech-lead

# 核心模块
/src/core/                  @core-team @tech-lead
/src/auth/                  @auth-team @security-team
/src/database/              @dba-team

# 前端
/src/frontend/              @frontend-team
*.tsx                       @frontend-team
*.css                       @frontend-team

# 后端 API
/src/api/                   @backend-team
/src/services/              @backend-team

# 测试
/tests/                     @qa-team
*.test.js                   @qa-team

# 文档
/docs/                      @docs-team
README.md                   @docs-team @tech-lead
CHANGELOG.md                @release-manager

# 配置文件
/.github/                   @devops-team
Dockerfile                  @devops-team
docker-compose.yml          @devops-team
*.yml                       @devops-team

# 安全相关
/SECURITY.md                @security-team
**/auth/**                  @security-team
**/password*                @security-team
\`\`\`

### 5.4 配合分支保护

\`\`\`text
GitHub 仓库 Settings → Branches → Edit rule：

☑ Require reviews before merging
☑ Require review from Code Owners
   → 当 CODEOWNERS 文件中的代码被修改时，必须由对应 Owner 审查

效果：
- 修改 /src/auth/ 的 PR 会自动请求 @auth-team 审查
- 在 @auth-team 审查前，PR 无法合并
- 即使其他人都 approve，Code Owner 仍可阻止
\`\`\`

### 5.5 GitLab CODEOWNERS

\`\`\`text
GitLab 支持更灵活的 CODEOWNERS：

# CODEOWNERS（GitLab）
[Core][2]  src/core/        @core-team
[Auth][2]  src/auth/        @auth-team
[Docs][1]  docs/            @docs-team

# [Name][required_approvals] 语法：
# [Core] 分组名
# [2]  需要 2 个 approve
\`\`\`

---

## 六、团队 Wiki 与知识库

### 6.1 GitHub Wiki 团队用法

\`\`\`text
推荐的 Wiki 结构：
Home                    # 首页（项目概览）
├── Quick-Start        # 快速开始
├── Architecture       # 架构设计
├── Development        # 开发指南
│   ├── Setup         # 环境搭建
│   ├── Coding-Standards  # 编码规范
│   └── Testing       # 测试指南
├── Deployment         # 部署文档
│   ├── Staging       # 测试环境
│   └── Production    # 生产环境
├── API                # API 文档
├── Troubleshooting    # 故障排查
├── FAQ                # 常见问题
└── _Sidebar           # 侧边栏导航
\`\`\`

### 6.2 GitLab Wiki 高级用法

\`\`\`text
GitLab Wiki 支持：
- Markdown / RDoc / AsciiDoc
- 历史版本
- 上传图片
- 页面层级（目录）

GitLab Wiki 与仓库分离：
- 独立的 Git 仓库：project.wiki.git
- 可克隆本地编辑
- 支持自定义首页
\`\`\`

\`\`\`bash
# 克隆 GitLab Wiki
git clone git@gitlab.example.com:team/project.wiki.git
cd project.wiki

# 创建结构化文档
mkdir -p dev api deploy
echo "# 开发指南" > dev/Home.md
echo "# API 文档" > api/Home.md

# 推送
git add .
git commit -m "docs: 完善 Wiki 结构"
git push origin master
\`\`\`

### 6.3 集成外部文档系统

\`\`\`text
推荐方案：

1. MkDocs + Material 主题
   - 仓库内 docs/ 目录
   - GitHub Pages/GitLab Pages 部署
   - 自动构建

2. Docusaurus
   - React 驱动
   - 适合大型文档站

3. Sphinx
   - Python 项目标准
   - 支持 reStructuredText

4. Notion / Confluence
   - 适合非技术文档
   - 团队知识库
\`\`\`

#### MkDocs 示例

\`\`\`yaml
# mkdocs.yml
site_name: 我的项目文档
site_url: https://docs.example.com
repo_url: https://github.com/team/project
repo_name: team/project

theme:
  name: material
  language: zh
  features:
    - navigation.tabs
    - navigation.sections
    - search.suggest
    - content.code.copy
  palette:
    - scheme: default
      toggle:
        icon: material/brightness-7
        name: 切换暗色
    - scheme: slate
      toggle:
        icon: material/brightness-4
        name: 切换亮色

nav:
  - 首页: index.md
  - 快速开始: quick-start.md
  - 开发指南:
    - 环境搭建: dev/setup.md
    - 编码规范: dev/standards.md
    - 测试指南: dev/testing.md
  - 部署:
    - 测试环境: deploy/staging.md
    - 生产环境: deploy/production.md
  - API:
    - 概述: api/overview.md
    - 认证: api/auth.md
    - 用户: api/users.md

plugins:
  - search:
      lang:
        - en
        - ja
  - git-revision-date-localized:
      type: date

markdown_extensions:
  - admonition
  - codehilite
  - toc:
      permalink: true
  - pymdownx.superfences
  - pymdownx.tabbed:
      alternate_style: true
\`\`\`

---

## 七、发布流程（Release Notes、Changelog）

### 7.1 版本发布流程

\`\`\`text
标准发布流程：

1. 准备发布
   - 创建 release/v1.2.0 分支
   - 更新版本号、CHANGELOG
   - 冻结新功能开发

2. 测试验证
   - 完整测试
   - 性能测试
   - 兼容性测试

3. 发布候选（RC）
   - v1.2.0-rc.1
   - 内部/社区试用
   - 收集反馈

4. 正式发布
   - 合并到 main
   - 打 Tag v1.2.0
   - 创建 Release
   - 公告

5. 发布后
   - 监控告警
   - 热修复（如需）
   - 复盘
\`\`\`

### 7.2 CHANGELOG 维护

\`\`\`markdown
# CHANGELOG.md

本项目遵循 [Semantic Versioning](https://semver.org/)。
本文件格式基于 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### Added
- 待发布的特性...

## [1.2.0] - 2026-06-15

### Added
- 用户资料页支持头像上传 (#123)
- 新增邮件通知功能 (#145)
- API 支持批量操作 (#156)

### Changed
- 重构认证模块，性能提升 30% (#130)
- API 响应格式统一为 {code, message, data} (#140)

### Deprecated
- 旧的 /api/v1/login 接口将在 2.0 移除

### Removed
- 移除已废弃的 legacy 模块 (#150)

### Fixed
- 修复登录后跳转错误 (#142)
- 修复时区显示问题 (#148)

### Security
- 修复 SQL 注入漏洞 (CVE-2026-1234)

## [1.1.0] - 2026-04-10

### Added
- 基础用户管理
- 文章 CRUD

### Fixed
- 修复注册邮箱校验

## [1.0.0] - 2026-01-01

### Added
- 项目首次发布
- 用户登录注册
\`\`\`

### 7.3 自动生成 CHANGELOG

#### 方案一：standard-version

\`\`\`bash
# 安装
npm install --save-dev standard-version

# 配置 package.json
# {
#   "scripts": {
#     "release": "standard-version"
#   }
# }

# 生成版本
npm run release -- --release-as 1.2.0
# 自动：
# 1. 更新版本号
# 2. 生成 CHANGELOG
# 3. 提交并打 Tag
\`\`\`

#### 方案二：conventional-changelog

\`\`\`bash
# 安装
npm install -g conventional-changelog-cli

# 生成 CHANGELOG
conventional-changelog -p angular -i CHANGELOG.md -s

# 首次生成全部历史
conventional-changelog -p angular -i CHANGELOG.md -s -r 0
\`\`\`

### 7.4 Release Notes 自动化

\`\`\`yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 生成 Release Notes
        id: changelog
        uses: mikepenz/release-changelog-builder-action@v4
        with:
          configuration: |
            {
              "categories": [
                { "title": "🚀 新特性", "labels": ["feature", "enhancement"] },
                { "title": "🐛 Bug 修复", "labels": ["bug", "fix"] },
                { "title": "📚 文档", "labels": ["documentation"] },
                { "title": "🔧 其他", "labels": ["chore", "refactor"] }
              ],
              "template": "## changes\\n\\n{{#categories}}{{#if entries}}### {{title}}\\n\\n{{#entries}}- {{#if breakingChange}}💥 **BREAKING** {{/if}}{{message}} ({{#if author}}@{{author}} {{/if}}[#{{number}}]({{link}}))\\n{{/entries}}\\n{{/if}}{{/categories}}"
            }
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: 创建 Release
        uses: softprops/action-gh-release@v1
        with:
          body: \${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
\`\`\`

---

## 八、开源项目协作实战

### 8.1 开源项目必备文件

\`\`\`text
开源项目根目录必备文件：

├── LICENSE                 许可证
├── README.md               项目说明
├── CONTRIBUTING.md         贡献指南
├── CODE_OF_CONDUCT.md      行为准则
├── CHANGELOG.md            变更日志
├── SECURITY.md             安全政策
├── SUPPORT.md              支持渠道
├── .github/
│   ├── CODEOWNERS          代码所有者
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── config.yml      # 禁用空白 Issue
│   ├── FUNDING.yml         # 赞助
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
└── docs/                   文档目录
\`\`\`

### 8.2 LICENSE 文件

\`\`\`text
MIT License 示例：

MIT License

Copyright (c) 2026 张三

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
\`\`\`

### 8.3 CODE_OF_CONDUCT.md

\`\`\`markdown
# 贡献者公约

## 我们的承诺

为了营造一个开放和友好的环境，我们作为贡献者和维护者承诺：参与我们项目的每个人都不会受到骚扰，无论年龄、体型、可见或不可见的残疾、族裔、性征、性别认同与表达、经验水平、教育、社会经济地位、国籍、个人外貌、种族、种姓、肤色、宗教信仰或性取向如何。

我们承诺以促进开放、包容、多样化、健康社区的方式行动和互动。

## 我们的准则

正面行为示例：
- 对他人展示同理心和善意
- 尊重不同意见和观点
- 给予建设性反馈
- 接受反馈， gracefully
- 承担责任并向受影响者道歉
- 关注的不仅是个人，更是整个社区

不可接受的行为：
- 使用性化语言或图像
- 钓鱼、辱骂或贬损性评论
- 公开或私下骚扰
- 未经许可发布他人私人信息
- 其他不道德或不专业的行为

## 执行职责

社区领导者负责澄清和执行我们的行为标准...

违反者将受到警告、临时封禁或永久封禁。

## 联系方式

如需报告违规行为，请联系：conduct@example.com
\`\`\`

### 8.4 SECURITY.md

\`\`\`markdown
# 安全政策

## 报告漏洞

如果您发现安全漏洞，请按以下方式报告：

1. **不要**在公开 Issue 中报告
2. 发送邮件至：security@example.com
3. 描述漏洞细节和复现步骤
4. 我们会在 48 小时内响应

## 支持的版本

| 版本   | 支持状态   |
|--------|----------|
| 1.2.x  | ✅ 支持    |
| 1.1.x  | ⚠️ 安全修复 |
| < 1.1  | ❌ 不支持   |

## 漏洞披露政策

- 我们遵循负责任的披露
- 修复后会在 Release Notes 中说明
- 致谢报告者（如同意）

## 安全最佳实践

- 始终使用最新版本
- 不要在代码中硬编码密钥
- 定期更新依赖
- 启用 2FA
\`\`\`

### 8.5 处理社区贡献

#### 完整流程示例

\`\`\`text
场景：外部贡献者提交了 PR

1. 收到 PR 通知
   - 检查 PR 模板填写是否完整
   - 检查关联的 Issue

2. 初步检查
   - CI 是否通过
   - 是否有测试
   - 代码风格是否符合

3. 代码审查
   - 仔细阅读代码
   - 留下建设性评论
   - 必要时使用 Request changes

4. 沟通
   - 友善、专业
   - 解释修改原因
   - 提供改进建议

5. 合并
   - 测试通过 + 审查通过
   - 选择合适的合并方式
   - 感谢贡献者

6. 后续
   - 更新 CHANGELOG
   - 在 Release Notes 中致谢
   - 关注后续 Issue
\`\`\`

#### 审查评论模板

\`\`\`text
友好回复模板：

✅ 通过审查：
"感谢贡献！代码质量很高，测试完善。已 approve，可以合并。"

🔄 要求修改：
"感谢提交 PR！整体思路很好，有几点建议：
1. 第 15 行建议提取为常量，便于维护
2. 第 28 行缺少异常处理
3. 测试用例建议补充边界条件
期待你的更新！"

❌ 拒绝（罕见）：
"感谢你的时间！经过讨论，这个功能与项目方向不太契合。
建议先在 Discussions 中讨论需求，再行开发。"
\`\`\`

### 8.6 维护者最佳实践

\`\`\`text
开源维护者守则：

1. 及时响应
   - Issue 24 小时内回复
   - PR 3 天内开始审查
   - 即使忙碌也告知预计时间

2. 友善包容
   - 新手问题耐心解答
   - 不嘲笑低质量 PR
   - 鼓励而非批评

3. 文档完善
   - 维护 CONTRIBUTING.md
   - 更新 README
   - 记录决策过程

4. 自动化
   - CI/CD 自动测试
   - 自动 Issue 模板
   - Dependabot 依赖更新

5. 版本管理
   - 遵循语义化版本
   - 维护 CHANGELOG
   - 及时发布 Release

6. 社区建设
   - 感谢贡献者
   - 公布 Roadmap
   - 举办社区活动
\`\`\`

---

## 九、本章小结

### 9.1 知识点回顾

\`\`\`text
1. Fork & Pull 适合开源协作，Shared Repository 适合团队内部
2. 主流分支策略：GitHub Flow（轻量）、Git Flow（重型）、GitLab Flow（环境驱动）、Trunk-Based（主干）
3. PR/MR 模板规范提交内容，提升审查效率
4. CONTRIBUTING.md 是贡献者的指南
5. CODEOWNERS 实现代码所有权自动审查
6. Wiki 与知识库沉淀团队知识
7. 发布流程包括版本管理、CHANGELOG、Release Notes 自动化
8. 开源项目必备文件：LICENSE、README、CONTRIBUTING、CODE_OF_CONDUCT、SECURITY
\`\`\`

### 9.2 团队协作黄金法则

\`\`\`text
1. 小步快跑：频繁提交，小粒度 PR
2. 早沟通：开发前先讨论方案
3. 多审查：至少 1-2 人 Code Review
4. 写测试：CI 通过才能合并
5. 留文档：决策、变更都要记录
6. 守承诺：按时交付，提前预警
7. 尊重他人：友善沟通，建设性反馈
8. 持续改进：定期复盘流程
\`\`\`

### 9.3 全册总结

\`\`\`text
通过本批 4 章的学习，我们掌握了：

第一章 GitHub 基础与协作流程
- 账号注册、SSH 配置
- 仓库创建与管理
- Clone 与 Fork
- Push 推送与 Pull Request
- Code Review 与 Issues
- GitHub Pages

第二章 GitHub 进阶功能
- GitHub Actions CI/CD
- Releases 版本管理
- Wiki 文档系统
- Projects 项目看板
- 组织与团队管理
- GitHub CLI 命令行
- API 与 Webhooks 自动化
- 分支保护规则

第三章 GitLab 与自托管 Git 服务
- GitLab vs GitHub 对比
- CE/EE 安装部署（Docker）
- Merge Request 流程
- GitLab CI/CD 配置
- GitLab Runner 管理
- 私有部署优势与运维

第四章 团队协作流程与规范
- Fork & Pull vs Shared Repository
- 分支策略选型
- PR/MR 模板规范
- CONTRIBUTING 与代码规范
- CODEOWNERS 自动审查
- 团队 Wiki 知识库
- 发布流程与 Changelog
- 开源项目协作实战

掌握这些内容后，你将能够熟练运用 GitHub/GitLab 进行团队协作，
无论是参与开源项目还是企业内部开发，都能游刃有余。
\`\`\`
`
  }
];
