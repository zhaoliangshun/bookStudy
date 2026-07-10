// Python 部署与运维教程 - 第 8 批章节 (CI/CD 持续集成)
// 主题：CI/CD 持续集成
// ES module，导出 chapters 数组

export const chapters = [
  {
    id: "deploy-cicd-intro",
    icon: "🔄",
    title: "CI/CD 概念与核心原理",
    group: "CI/CD 持续集成",
    content: `# CI/CD 概念与核心原理

## 一、什么是 CI/CD

### 1.1 一个故事讲清楚 CI/CD

先不谈定义，讲一个真实场景。假设你的团队有 5 个开发，每个人在自己分支写代码，到了周五下午大家把代码合并到 main 分支准备周一上线。结果合并时冲突一片，修完冲突一跑测试，几十个用例挂掉，大家加班到凌晨三点才把问题修完。周一上线后又发现一个隐藏 bug，紧急回滚，客户投诉。

这种"集成地狱"（Integration Hell）是早期软件开发的常态。CI/CD 就是为了消灭这种痛苦而生的。

\`\`\`
没有 CI/CD 的世界：
开发 → 开发 → 开发（一周）→ 周五合并 → 冲突 → 测试挂 → 加班修 → 上线 → 出 bug → 回滚 → 客户投诉

有 CI/CD 的世界：
开发（每次 push）→ 自动测试 → 自动构建 → 自动部署 → 持续可发布
\`\`\`

### 1.2 CI/CD 的正式定义

**CI/CD** 是一个缩写，实际包含三个概念：

| 缩写 | 全称 | 中文 | 核心动作 |
|------|------|------|----------|
| CI | Continuous Integration | 持续集成 | 代码合并 → 自动构建 → 自动测试 |
| CD | Continuous Delivery | 持续交付 | CI 之上 + 自动发布到类生产环境（随时可一键上线）|
| CD | Continuous Deployment | 持续部署 | CD 之上 + 自动部署到生产环境（无需人工点击）|

注意 **CD 有两种含义**，业界经常混用，需要根据上下文判断：

- **持续交付（Delivery）**：每次通过测试的代码都准备好可以发布，但发布动作由人决定（点一个按钮）
- **持续部署（Deployment）**：每次通过测试的代码自动部署到生产，全程无人工干预

\`\`\`
持续集成 (CI)
   ↓
持续交付 (Continuous Delivery)  ← 人工点击发布
   ↓
持续部署 (Continuous Deployment) ← 全自动发布

范围：CI < 持续交付 < 持续部署
\`\`\`

### 1.3 为什么要 CI/CD

#### 1.3.1 没有 CI/CD 的痛点

| 痛点 | 描述 | 后果 |
|------|------|------|
| 集成晚 | 大家各自开发，最后才合并 | 冲突巨大，解决冲突耗时数天 |
| 测试手动 | 测试靠人点点点 | 容易漏测，回归成本高 |
| 环境不一致 | 开发机能跑，生产跑不了 | "在我机器上没问题"经典台词 |
| 发布慢 | 手动打包、传服务器、重启 | 发布一次几个小时，容易出错 |
| 不可回滚 | 没有版本化管理 | 出问题只能紧急修代码，不能快速回退 |
| 质量不可控 | 谁都能改代码直接上线 | 一颗坏代码毁掉整个系统 |

#### 1.3.2 CI/CD 带来的价值

| 价值 | 说明 |
|------|------|
| 早集成早发现问题 | 每次 push 都集成，冲突分钟级解决 |
| 自动化测试保障 | 每次变更自动跑全量测试，回归零成本 |
| 环境一致 | Docker 镜像保证开发/测试/生产一致 |
| 发布频率提升 | 从一个月一次 → 一天几十次 |
| 快速回滚 | 镜像版本化，回滚就是切版本 |
| 可追溯 | 每次构建有编号，每次部署可追溯代码 commit |
| 解放人力 | 工程师专注写代码，部署交给机器 |

### 1.4 CI/CD 的核心原则

\`\`\`
1. 单一代码仓库（Single Source Repository）
   所有代码、配置、脚本都在一个 Git 仓库里

2. 自动化构建与测试
   任何 push / PR 都触发自动构建和测试

3. 频繁集成
   每天至少集成一次，最好每次 push 都集成

4. 在类生产环境测试
   测试环境尽量接近生产环境（用 Docker 保证一致）

5. 可见性
   构建结果、测试报告、部署状态对全员可见

6. 自动化部署
   部署过程零手动操作，全部脚本化
\`\`\`

## 二、CI 与 CD 的区别

### 2.1 CI 做什么

CI（持续集成）的核心目标是：**保证代码随时可合并、可构建、可测试通过**。

CI 阶段典型动作：

\`\`\`bash
# 1. 拉取代码
git clone repo

# 2. 安装依赖
pip install -r requirements.txt

# 3. 代码检查（lint）
flake8 .
black --check .

# 4. 单元测试
pytest tests/

# 5. 安全扫描
bandit -r .

# 6. 构建产物（打包）
python -m build

# 7. 上传构建产物（artifact）
# 把 wheel 文件保存为 artifact 供下游使用
\`\`\`

CI 的产出是：**一个经过验证、随时可部署的可执行产物**（artifact / Docker 镜像）。

### 2.2 CD 做什么

CD（持续交付/部署）的核心目标是：**把经过 CI 验证的产物，安全、快速地部署到目标环境**。

CD 阶段典型动作：

\`\`\`bash
# 1. 拿到 CI 产出的镜像
docker pull myapp:v1.2.3

# 2. 部署到测试环境
docker-compose -f docker-compose.test.yml up -d

# 3. 集成测试 / E2E 测试
pytest tests/e2e/

# 4. （持续交付）人工审批后部署到生产
# （持续部署）自动部署到生产
ssh prod-server "docker pull myapp:v1.2.3 && docker-compose up -d"

# 5. 健康检查
curl -f http://prod-server/health || rollback

# 6. 失败则自动回滚
\`\`\`

### 2.3 CI 与 CD 对比表

| 维度 | CI（持续集成） | CD（持续交付/部署） |
|------|----------------|---------------------|
| 关注点 | 代码质量、可构建 | 交付速度、可部署 |
| 触发 | 每次 push / PR | CI 通过后 / 人工审批 |
| 输入 | 源代码 | CI 产出的 artifact |
| 输出 | 可执行产物（镜像/wheel） | 运行中的服务 |
| 环境 | 临时构建环境 | 测试/预发/生产环境 |
| 风险 | 低（不影响用户） | 高（影响真实用户） |
| 人工干预 | 几乎无 | 持续交付需审批，持续部署无 |
| 失败影响 | 构建失败，开发修代码 | 服务不可用，需回滚 |
| 工具能力 | 构建、测试、缓存 | 部署、回滚、蓝绿、灰度 |

### 2.4 何时只做 CI，何时做 CI+CD

\`\`\`
项目阶段          推荐策略
─────────────────────────────────
个人项目/学习      只做 CI（自动测试）即可
小团队内部工具     CI + 持续交付（人工点发布）
中型 SaaS         CI + 持续部署（全自动）
金融/医疗等强监管  CI + 持续交付（必须人工审批）
\`\`\`

**经验法则**：先做好 CI，CI 稳定运行 1-2 个月后再上 CD。CI 是 CD 的地基，CI 不稳的 CD 就是"自动制造故障"。

## 三、流水线（Pipeline）概念

### 3.1 什么是流水线

**流水线**（Pipeline）是把软件从源代码到生产部署的整个过程，拆解成一系列**有序的阶段**（Stage），每个阶段包含若干**任务**（Job），任务按顺序或并行执行。

\`\`\`
代码 push
   │
   ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  Lint   │ → │  Test   │ → │  Build  │ → │ Deploy  │ → │ Verify  │
│  代码检查│   │  测试   │   │  构建   │   │  部署   │   │  验证   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
   1 min         3 min         2 min         1 min        1 min
                                          总耗时约 8 min
\`\`\`

### 3.2 流水线核心概念

| 概念 | 英文 | 说明 | 类比 |
|------|------|------|------|
| 流水线 | Pipeline | 整个自动化流程 | 工厂流水线 |
| 阶段 | Stage | 一组相关任务的集合 | 工序 |
| 任务 | Job | 一个具体的执行单元 | 工位 |
| 步骤 | Step | Job 内部的最小操作 | 动作 |
| 触发器 | Trigger | 什么事件启动流水线 | 开关 |
| 制品 | Artifact | 构建产生的可交付物 | 成品 |
| 缓存 | Cache | 跨次构建复用的依赖 | 仓库 |
| 执行器 | Runner / Agent | 实际执行 Job 的机器 | 工人 |

### 3.3 阶段间的关系

\`\`\`
Stage 之间是串行的，前一个 Stage 失败，后面不执行（fail-fast）

Lint (pass) → Test (pass) → Build (pass) → Deploy (pass)   ✓ 全绿
Lint (pass) → Test (FAIL) → Build (skip)  → Deploy (skip)  ✗ 失败

Stage 内部的 Job 可以并行：
         ┌→ Job: unit-test    (pass)
Test ────┼→ Job: integration  (pass)  → 全 pass 才进入 Build
         └→ Job: e2e          (FAIL)  → 失败，Build 不执行
\`\`\`

### 3.4 流水线的状态

\`\`\`
✅ success / passed    流水线全部通过，可进入下一阶段
❌ failed              某个 Job 失败，流水线终止
⏳ running / pending   正在执行或排队中
🚫 canceled            被人工取消
⚠️ warning             通过但有警告（如测试覆盖率下降）
🔁 running with retry  失败后自动重试中
\`\`\`

## 四、典型工作流

### 4.1 主干开发（Trunk-Based Development）

\`\`\`
所有开发直接提交到 main 分支（或频繁合并到 main）

  dev A ──push──→ main ──→ CI ──→ CD ──→ prod
  dev B ──push──→ main ──→ CI ──→ CD ──→ prod
  dev C ──push──→ main ──→ CI ──→ CD ──→ prod

特点：
- 简单，没有分支管理负担
- 集成频率极高（每天多次）
- 要求每次提交都很小、很完整
- 适合功能开关（Feature Flag）成熟团队
\`\`\`

### 4.2 GitHub Flow

\`\`\`
基于功能分支 + PR（Pull Request）

  main ──────────────────────────────────●──────→ prod
          \\                             ↑
           \\── feature-A ──PR──→ CI ──merge
           \\
            ── feature-B ──PR──→ CI ──(等 review)

流程：
1. 从 main 切出 feature 分支
2. 开发、提交、push
3. 创建 PR，自动触发 CI
4. CI 通过 + Code Review 通过 → 合并到 main
5. main 分支的 CI 通过 → 自动部署到生产

特点：
- 简单易懂，适合中小团队
- PR 是质量门禁（CI + 人工 review）
\`\`\`

### 4.3 Git Flow

\`\`\`
分支较多：main(生产) / develop(开发) / feature / release / hotfix

  main    ─────●─────────────●────────●──→ 生产
                \\            ↑         ↑
  develop ──────●──●──●──●──●──●──────●──→ 开发
                    ↑              ↑
  feature A ──●──●──┘              │
  feature B ──────●────────────●───┘
                              ↑
  release  ──────────────────●──→ 发布准备
  hotfix   ──────────────────────●──→ 紧急修复

特点：
- 适合有明确发布周期的产品（如 App、桌面软件）
- 对 Web 服务偏重，业界逐渐少用
\`\`\`

### 4.4 三种工作流对比

| 维度 | 主干开发 | GitHub Flow | Git Flow |
|------|----------|-------------|----------|
| 分支数 | 1 个（main） | 2 类（main + feature） | 5 类 |
| 集成频率 | 极高 | 高（每个 PR） | 中（每个 release） |
| 适合场景 | 持续部署、成熟团队 | Web 服务、中小团队 | 有版本发布的产品 |
| 学习成本 | 需 Feature Flag | 低 | 中 |
| CI/CD 依赖 | 强 | 中 | 弱 |

### 4.5 Python 项目的典型流水线

以一个 FastAPI 项目为例：

\`\`\`
push 到 main / 创建 PR
        │
        ▼
   ┌─────────┐
   │  Lint   │  flake8 + black --check + isort --check
   └────┬────┘
        │ pass
        ▼
   ┌─────────┐
   │  Test   │  pytest --cov (并行跑 unit + integration)
   └────┬────┘
        │ pass
        ▼
   ┌─────────┐
   │ Security│  bandit + safety + pip-audit
   └────┬────┘
        │ pass
        ▼
   ┌─────────┐
   │  Build  │  docker build → push to registry
   └────┬────┘
        │ pass
        ▼
   ┌─────────┐
   │ Deploy  │  部署到 staging
   └────┬────┘
        │ pass + 人工审批
        ▼
   ┌─────────┐
   │ Deploy  │  部署到 production
   └────┬────┘
        │ pass
        ▼
   ┌─────────┐
   │ Verify  │  健康检查 + 冒烟测试
   └─────────┘
\`\`\`

## 五、CI/CD 工具生态

### 5.1 主流工具对比

| 工具 | 类型 | 部署方式 | 配置文件 | 适合场景 |
|------|------|----------|----------|----------|
| GitHub Actions | SaaS | 云端 | \`.github/workflows/*.yml\` | GitHub 项目、开源 |
| GitLab CI/CD | SaaS/自建 | 云端/私有 | \`.gitlab-ci.yml\` | GitLab 项目、企业内 |
| Jenkins | 自建 | 私有服务器 | \`Jenkinsfile\` | 复杂流水线、遗留系统 |
| CircleCI | SaaS | 云端 | \`.circleci/config.yml\` | 云原生项目 |
| Travis CI | SaaS | 云端 | \`.travis.yml\` | 开源（已衰落）|
| Drone | 自建 | 私有 | \`.drone.yml\` | 容器化团队 |
| Argo CD | 自建 | K8s 内 | GitOps 声明式 | K8s GitOps 部署 |
| Tekton | 自建 | K8s 内 | YAML 声明式 | K8s 原生 CI/CD |

### 5.2 选型建议

\`\`\`
你的情况                           推荐
────────────────────────────────────────────
代码在 GitHub，想最快上手          GitHub Actions
代码在 GitLab，企业内部            GitLab CI/CD
有复杂流水线需求、大量历史项目     Jenkins
全面 K8s 化、追求 GitOps          Argo CD + Tekton
\`\`\`

本系列后续章节重点讲 **GitHub Actions** 和 **GitLab CI/CD**（最主流），**Jenkins** 作为了解。

## 六、CI/CD 的"为什么"和"怎么想"

### 6.1 为什么 CI 要频繁集成

\`\`\`
合并冲突的大小 ≈ 集成间隔的平方

  集成间隔      冲突量        解决耗时
  ─────────────────────────────────
  1 小时        1 处          1 分钟
  1 天          10 处         30 分钟
  1 周          50 处         半天
  1 个月        200 处        3 天（崩溃）

→ 集成越频繁，单次冲突越小，总成本越低
\`\`\`

### 6.2 为什么 CI 要自动化测试

\`\`\`
人工测试的问题：
- 慢：跑一遍全量测试要 2 小时
- 漏：人会忘记测某些边界
- 不可重复：每次测的步骤不完全一样
- 不可追溯：测了没测没记录

自动化测试：
- 快：并行跑 5 分钟出结果
- 全：每次跑完全部用例
- 一致：每次跑的步骤完全一样
- 可追溯：每次构建有测试报告
\`\`\`

### 6.3 为什么 CD 要环境一致

\`\`\`
"在我机器上能跑" 的根源：环境不一致

  开发机        测试环境        生产环境
  Python 3.11   Python 3.9     Python 3.10
  依赖最新      依赖半年没更新  依赖 1 年没更新
  macOS         Ubuntu 22.04   CentOS 7
  单进程        单进程          多进程 + 负载均衡

Docker 镜像解决：
  镜像 = 代码 + 依赖 + 系统库 + 配置
  开发、测试、生产用同一个镜像 → 环境完全一致
\`\`\`

### 6.4 为什么 CD 要可回滚

\`\`\`
部署失败的常见原因：
- 代码 bug 没被测试覆盖
- 配置错误
- 依赖版本冲突
- 数据库 schema 不兼容

没有快速回滚：
- 出故障 → 紧急修代码 → 重新构建 → 重新部署 → 30 分钟+ 宕机

有快速回滚：
- 出故障 → 切回上一个镜像版本 → 1 分钟恢复

→ 镜像版本化 + 一键回滚是 CD 的安全网
\`\`\`

## 七、CI/CD 成熟度模型

\`\`\`
级别 0：手动
  开发 → 手动合并 → 手动测试 → 手动打包 → 手动传服务器 → 手动重启
  （没有任何自动化）

级别 1：脚本化
  写了 deploy.sh 一键部署脚本，但还是要人手动触发
  （部分自动化，无测试保障）

级别 2：CI
  push 自动触发 lint + test，失败阻止合并
  （代码质量有保障，部署仍手动）

级别 3：持续交付
  CI 通过自动部署到 staging，生产需人工点击
  （部署自动化，上线受控）

级别 4：持续部署
  CI 通过自动部署到生产，全自动
  （全自动，需强大测试 + 监控保障）

级别 5：GitOps / 渐进式发布
  Git 是唯一真相源，自动蓝绿/金丝雀，自动回滚
  （业界顶级）
\`\`\`

大多数团队停在级别 2-3。级别 4+ 需要极强的测试文化和监控体系，不要盲目追求。

## 八、CI/CD 与 Python 项目

### 8.1 Python 项目 CI/CD 特殊性

| 特殊点 | 说明 | 应对 |
|--------|------|------|
| 解释型语言 | 无编译步骤，但需要打包 wheel | 用 \`python -m build\` |
| 依赖管理混乱 | pip / poetry / pipenv / pdm 多套 | 团队统一选一套 |
| 多版本兼容 | 常需支持 3.8 / 3.9 / 3.10 / 3.11 | 用矩阵构建 |
| 虚拟环境 | 每次构建要装依赖 | 缓存 venv / pip |
| 类型检查 | mypy 严格模式耗时 | CI 单独跑 mypy |
| 测试框架 | pytest 是事实标准 | 用 pytest + pytest-cov |

### 8.2 Python 项目 CI 最小集

\`\`\`bash
# 1. 装依赖
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 测试依赖

# 2. Lint
flake8 src tests
black --check src tests
isort --check-only src tests

# 3. 类型检查
mypy src

# 4. 测试
pytest --cov=src --cov-report=xml tests/

# 5. 安全
bandit -r src
pip-audit

# 6. 构建
python -m build  # 产出 dist/*.whl
\`\`\`

### 8.3 Python 项目 CD 最小集

\`\`\`bash
# 构建镜像
docker build -t myapp:\$GIT_SHA .

# 推送镜像
docker push myapp:\$GIT_SHA

# 部署
ssh prod "docker pull myapp:\$GIT_SHA && docker stop myapp && docker rm myapp && docker run -d --name myapp myapp:\$GIT_SHA"

# 健康检查
curl -f http://prod/health
\`\`\`

## 九、CI/CD 实施路线图

### 9.1 团队落地 CI/CD 的步骤

\`\`\`
第 1 周：建立 CI 基础
- 把代码推到 GitHub/GitLab
- 配置一个最小 CI：装依赖 + 跑 pytest
- 让 PR 必须通过 CI 才能合并

第 2-3 周：完善 CI
- 加 lint（flake8/black）
- 加类型检查（mypy）
- 加缓存加速
- 加测试覆盖率门禁

第 4 周：构建产物
- 加 Docker 镜像构建
- 推送到镜像仓库

第 5-6 周：CD 到测试环境
- 自动部署到 staging
- 加健康检查

第 7-8 周：CD 到生产
- 人工审批后部署到生产
- 加回滚机制

第 9 周以后：渐进式发布
- 蓝绿 / 金丝雀
- 自动回滚
- 监控告警集成
\`\`\`

### 9.2 不要一上来就追求全自动部署

\`\`\`
错误心态："我要上持续部署，全自动才酷"
正确心态："先让 CI 稳定，再逐步自动化部署"

  CI 不稳定 → 自动部署 = 自动制造故障
  测试不全 → 自动部署 = 自动把 bug 推给用户
  无监控 → 自动部署 = 出问题不知道
  无回滚 → 自动部署 = 出问题修不回来

→ 持续部署是 CI/CD 的终点，不是起点
\`\`\`

## 十、CI/CD 关键指标

衡量 CI/CD 健康度的核心指标：

| 指标 | 含义 | 健康值 | DORA 标准 |
|------|------|--------|-----------|
| 部署频率 | 多久部署一次 | 每天多次 | Elite: 按需多次 |
| 变更前置时间 | 从提交到上线多久 | < 1 天 | Elite: < 1 小时 |
| 变更失败率 | 部署导致故障的比例 | < 5% | Elite: 0-15% |
| 平均恢复时间 | 故障到恢复多久 | < 1 小时 | Elite: < 1 小时 |

这四个指标被称为 **DORA 四指标**（来自《Accelerate》一书的研究），是业界衡量 DevOps 成熟度的金标准。

\`\`\`
低绩效团队：     一年部署几次 / 数月上线 / 60% 失败 / 半天恢复
中绩效团队：     一月部署几次 / 一周上线 / 30% 失败 / 一天恢复
高绩效团队：     一天部署几次 / 一天上线 / 10% 失败 / 一小时恢复
精英团队：       一天部署多次 / 一小时上线 / 5% 失败 / 一小时恢复
\`\`\`

## 十一、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 混淆两个 CD | 把持续交付当持续部署 | 明确区分：交付要人工点，部署全自动 |
| CI 不稳定就上 CD | CI 经常红，直接自动部署 | 先让 CI 连续 1 个月稳定绿 |
| 测试不全就自动部署 | 只有单元测试就上生产 | 必须有集成 + E2E + 监控 |
| 没有回滚就部署 | 部署失败只能紧急改代码 | 必须有一键回滚机制 |
| 把密钥写进代码 | SECRET=xxx 硬编码 | 用 CI 的 secrets 管理 |
| CI 跑太久 | 串行跑 30 分钟 | 并行 + 缓存，控制在 10 分钟内 |
| 部署不分环境 | 直接 push 到生产 | staging 验证后再 production |
| 没有健康检查 | 部署完不验证 | 部署后必做 health check |
| 流水线藏秘密 | 失败原因不明 | 每步都有清晰日志和状态 |
| 盲目追新工具 | 看到新工具就换 | 工具服务于流程，不是反过来 |
| 分支太长不集成 | feature 开发一周才合并 | 每天合并或拆小功能 |
| 只看通过率 | 90% 通过就放行 | 看覆盖率 + 失败原因 |
| 忽视缓存 | 每次重新装依赖 | 缓存 pip / venv 加速 |
| artifact 不版本化 | 用 latest 标签 | 用 commit SHA / 语义化版本 |
| 部署无审批 | 任何人能部署生产 | 生产环境加人工审批门禁 |

## 十二、小结

本章建立了 CI/CD 的概念地基：

1. **CI/CD 是什么**：CI 保证代码可构建可测试，CD 保证可部署可交付
2. **为什么要 CI/CD**：消灭集成地狱、保障质量、提升发布频率、可快速回滚
3. **CI 与 CD 区别**：CI 关注代码质量，CD 关注交付部署
4. **流水线概念**：Stage → Job → Step 的层级结构，fail-fast 机制
5. **典型工作流**：主干开发、GitHub Flow、Git Flow 三种主流模式
6. **工具生态**：GitHub Actions / GitLab CI / Jenkins 三大主流
7. **成熟度模型**：从手动到 GitOps 的 6 个级别，循序渐进
8. **DORA 指标**：部署频率、前置时间、失败率、恢复时间

理解了概念之后，下一章我们进入 **GitHub Actions 实战**，动手写第一个 workflow 文件。
`
  },
  {
    id: "deploy-github-actions",
    icon: "🐙",
    title: "GitHub Actions 实战",
    group: "CI/CD 持续集成",
    content: `# GitHub Actions 实战

## 一、GitHub Actions 是什么

### 1.1 简介

**GitHub Actions** 是 GitHub 内置的 CI/CD 服务，2019 年正式发布。只要你的代码仓库在 GitHub 上，就能直接用，无需额外安装服务。

- **官网**：https://github.com/features/actions
- **文档**：https://docs.github.com/actions
- **市场**：https://github.com/marketplace/actions（海量现成 Action）
- **免费额度**：公开仓库无限免费；私有仓库每月 2000 分钟（免费账户）

### 1.2 核心优势

| 优势 | 说明 |
|------|------|
| 与 GitHub 深度集成 | 无需配置 webhook，push/PR 自动触发 |
| 配置即代码 | workflow 文件放在仓库里，版本化管理 |
| 海量 Action 市场 | 一行 \`uses:\` 复用别人写好的逻辑 |
| 跨平台 | Linux / macOS / Windows 都支持 |
| 自托管 Runner | 不想用云端可自己搭 |
| 矩阵构建 | 一份配置多版本/多平台并行跑 |

### 1.3 基本概念

\`\`\`
仓库                          GitHub Repository
  └─ .github/workflows/       workflow 文件目录
       ├─ ci.yml              workflow 1：持续集成
       ├─ deploy.yml          workflow 2：部署
       └─ release.yml         workflow 3：发布

workflow（工作流）            一个 .yml 文件 = 一个 workflow
  ├─ on:                      触发器（什么事件启动）
  ├─ jobs:                    多个 job
       ├─ job-lint            一个 job（一组 step）
       │   ├─ step: checkout
       │   ├─ step: setup-python
       │   └─ step: run flake8
       └─ job-test
           ├─ step: checkout
           ├─ step: setup-python
           └─ step: run pytest

job 跑在 runner（执行器）上    runner 是 GitHub 提供的虚拟机
\`\`\`

## 二、第一个 workflow

### 2.1 创建文件

在仓库根目录创建 \`.github/workflows/ci.yml\`：

\`\`\`yaml
# .github/workflows/ci.yml
name: CI  # workflow 名称（显示在 Actions 页面）

# 触发器：什么时候运行
on:
  push:
    branches: [main, develop]      # push 到这些分支触发
  pull_request:
    branches: [main]               # PR 到这些分支触发

# 任务
jobs:
  test:                            # job 名（自定义）
    runs-on: ubuntu-latest         # 在 Ubuntu 上跑
    steps:                         # 步骤
      - name: Checkout code        # 拉取代码
        uses: actions/checkout@v4  # 用现成的 Action

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'   # 装 Python 3.11

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest

      - name: Run tests
        run: pytest tests/ -v
\`\`\`

### 2.2 推送后看效果

\`\`\`bash
git add .github/workflows/ci.yml
git commit -m "add CI"
git push
\`\`\`

打开 GitHub 仓库 → Actions 标签页 → 看到 CI workflow 正在运行。

### 2.3 文件结构详解

| 字段 | 作用 | 必填 |
|------|------|------|
| \`name\` | workflow 显示名 | 否 |
| \`on\` | 触发条件 | 是 |
| \`jobs\` | 定义任务 | 是 |
| \`jobs.<id>.runs-on\` | 运行环境 | 是 |
| \`jobs.<id>.steps\` | 步骤列表 | 是 |
| \`permissions\` | 权限控制 | 否（建议加）|
| \`env\` | 全局环境变量 | 否 |
| \`concurrency\` | 并发控制 | 否 |

## 三、触发器（on）详解

### 3.1 常用触发器

\`\`\`yaml
on:
  push:                    # push 事件
    branches: [main]       # 仅这些分支
    tags: ['v*']           # 仅这些 tag
    paths:                 # 仅这些路径变更才触发
      - 'src/**'
      - 'tests/**'
      - 'requirements.txt'

  pull_request:            # PR 事件
    branches: [main]

  workflow_dispatch:       # 手动触发（网页上点按钮）
    inputs:
      environment:
        description: '部署到哪个环境'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

  schedule:                # 定时触发（cron）
    - cron: '0 2 * * *'    # 每天凌晨 2 点（UTC）

  release:
    types: [published]     # 发布 release 时

  workflow_call:           # 被其他 workflow 调用（复用）
\`\`\`

### 3.2 cron 注意事项

\`\`\`
GitHub Actions 的 cron 用 UTC 时区！

  cron: '0 2 * * *'   → UTC 02:00 = 北京时间 10:00
  cron: '0 18 * * *'  → UTC 18:00 = 北京时间次日 02:00

  字段顺序：分 时 日 月 周
  '0 2 * * *'        = 每天 02:00
  '*/30 * * * *'     = 每 30 分钟
  '0 0 * * 1'        = 每周一 00:00

注意：GitHub 的定时任务不保证准时，可能延迟几分钟到几十分钟，
不要用于精确计时场景。
\`\`\`

### 3.3 paths 过滤

\`\`\`yaml
on:
  push:
    paths:
      - 'src/**'           # src 下任何文件
      - '!src/**/*.md'     # 但不包括 md 文档
      - 'requirements.txt'
    paths-ignore:          # 这些路径变更不触发
      - 'docs/**'
      - '*.md'
\`\`\`

## 四、jobs 与 steps

### 4.1 job 间依赖

默认所有 job 并行执行。用 \`needs\` 指定顺序：

\`\`\`yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: flake8 .

  test:
    runs-on: ubuntu-latest
    needs: lint             # 等 lint 完成才跑
    steps:
      - uses: actions/checkout@v4
      - run: pytest

  build:
    needs: test             # 等 test 完成才跑
    runs-on: ubuntu-latest
    steps:
      - run: docker build .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploy"
\`\`\`

\`\`\`
执行顺序：
lint → test → build → deploy（串行）

如果 lint 失败，test/build/deploy 都不会执行（fail-fast）

也可以并行 + 汇合：
  lint ─┐
        ├→ deploy
  test ─┘

deploy:
  needs: [lint, test]   # lint 和 test 都通过才 deploy
\`\`\`

### 4.2 if 条件控制

\`\`\`yaml
jobs:
  deploy-prod:
    if: github.ref == 'refs/heads/main'   # 仅 main 分支才跑这个 job
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploy to prod"

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploy to staging"
\`\`\`

常用条件：

\`\`\`yaml
if: github.event_name == 'pull_request'      # 仅 PR 触发
if: github.actor != 'dependabot[bot]'        # 排除 bot
if: startsWith(github.ref, 'refs/tags/v')    # 仅 tag 触发
if: success()                                # 上游 job 成功
if: failure()                                # 上游 job 失败
if: always()                                 # 无论成败都跑（如发通知）
\`\`\`

### 4.3 step 详解

\`\`\`yaml
steps:
  # 1. 使用现成 Action
  - name: Checkout
    uses: actions/checkout@v4
    with:                      # 传参
      fetch-depth: 0           # 拉取完整历史

  # 2. 运行命令
  - name: Install
    run: pip install -r requirements.txt

  # 3. 多行命令
  - name: Build
    run: |
      python -m build
      twine check dist/*

  # 4. 条件执行
  - name: Notify on failure
    if: failure()
    run: echo "build failed"

  # 5. 设置环境变量
  - name: Set env
    run: echo "VERSION=1.0.0" >> \$GITHUB_ENV

  # 6. 使用 step 输出
  - name: Get SHA
    id: sha
    run: echo "short=\$(git rev-parse --short HEAD)" >> \$GITHUB_OUTPUT

  - name: Use SHA
    run: echo "Building \$\{\{ steps.sha.outputs.short \}\}"
\`\`\`

### 4.4 job 输出传递

\`\`\`yaml
jobs:
  build:
    outputs:
      version: \${{ steps.version.outputs.version }}
      image: \${{ steps.image.outputs.image }}
    steps:
      - id: version
        run: echo "version=1.2.3" >> \$GITHUB_OUTPUT
      - id: image
        run: echo "image=myapp:1.2.3" >> \$GITHUB_OUTPUT

  deploy:
    needs: build
    steps:
      - run: docker pull \${{ needs.build.outputs.image }}
\`\`\`

## 五、矩阵构建（Matrix）

### 5.1 多版本并行测试

Python 项目常需支持多版本，用矩阵一次跑完：

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
      - run: pip install -r requirements.txt
      - run: pytest
\`\`\`

\`\`\`
这个矩阵会生成 4 × 3 = 12 个并行 job：

  python 3.9  + ubuntu
  python 3.9  + macos
  python 3.9  + windows
  python 3.10 + ubuntu
  ...（共 12 个）

每个 job 在独立的 runner 上跑，互不干扰。
\`\`\`

### 5.2 矩阵排除/包含

\`\`\`yaml
strategy:
  matrix:
    python: ['3.9', '3.10', '3.11']
    os: [ubuntu-latest, macos-latest]
    exclude:
      - python: '3.9'        # 排除：3.9 不跑 macos
        os: macos-latest
    include:
      - python: '3.12'       # 额外加：3.12 只在 ubuntu
        os: ubuntu-latest
\`\`\`

### 5.3 矩阵失败策略

\`\`\`yaml
strategy:
  fail-fast: false           # 一个失败不取消其他（默认 true）
  max-parallel: 4            # 最多同时跑 4 个（节省额度）
  matrix:
    python: ['3.9', '3.10', '3.11']
\`\`\`

\`\`\`
fail-fast: true（默认）
  python 3.9 失败 → 立即取消 3.10 / 3.11 → 快速失败，省额度

fail-fast: false
  python 3.9 失败 → 3.10 / 3.11 继续跑 → 看到所有结果，但费额度

调试期建议 false，稳定期建议 true。
\`\`\`

## 六、缓存（Cache）

### 6.1 为什么需要缓存

\`\`\`
没缓存：
  每次 CI 都 pip install → 下载所有依赖 → 3-5 分钟

有缓存：
  首次：下载 + 缓存 → 5 分钟
  后续：直接用缓存 → 30 秒

→ 缓存能节省 80%+ 的构建时间
\`\`\`

### 6.2 pip 缓存

\`\`\`yaml
steps:
  - uses: actions/checkout@v4

  - uses: actions/setup-python@v5
    with:
      python-version: '3.11'

  - name: Cache pip
    uses: actions/cache@v4
    with:
      path: ~/.cache/pip              # 缓存路径
      key: \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}
      restore-keys: |
        \${{ runner.os }}-pip-

  - name: Install
    run: pip install -r requirements.txt
\`\`\`

\`\`\`
key 的设计：
  \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}

  - runner.os = Linux         → 操作系统
  - hashFiles('requirements.txt') → 依赖文件的 hash

  requirements.txt 不变 → key 相同 → 命中缓存
  requirements.txt 改了 → key 变 → 重新下载

restore-keys（兜底）：
  如果精确 key 没命中，用前缀匹配找最近的缓存
\`\`\`

### 6.3 setup-python 内置缓存

更简洁的写法（推荐）：

\`\`\`yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'                      # 自动缓存 pip
    cache-dependency-path: requirements.txt
\`\`\`

### 6.4 缓存 venv（更彻底）

\`\`\`yaml
- name: Cache venv
  uses: actions/cache@v4
  with:
    path: .venv
    key: venv-\${{ runner.os }}-\${{ matrix.python-version }}-\${{ hashFiles('requirements.txt') }}

- name: Create venv
  run: |
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
\`\`\`

### 6.5 缓存键的坑

\`\`\`
坑 1：key 太宽松
  key: pip-cache
  → 所有构建共用一个缓存 → 缓存污染

坑 2：key 太严格
  key: pip-cache-\${{ github.run_id }}
  → 每次构建 id 不同 → 永远命中不了

正确：用依赖文件 hash 作为 key
  key: pip-\${{ hashFiles('requirements*.txt') }}

坑 3：忘了 restore-keys
  → 依赖文件一改，完全 miss，重新下载
  → 加 restore-keys 兜底，至少能复用上次的缓存
\`\`\`

## 七、Secrets 与环境变量

### 7.1 Secrets（密钥）

密钥不能写进代码，用 GitHub Secrets：

\`\`\`
配置位置：仓库 Settings → Secrets and variables → Actions → New repository secret

例如配置：
  PYPI_API_TOKEN   = pypi-xxxxxxxxxxxx
  DOCKER_PASSWORD  = xxxxxx
  SSH_PRIVATE_KEY  = -----BEGIN OPENSSH...

使用：\${{ secrets.PYPI_API_TOKEN }}
\`\`\`

\`\`\`yaml
steps:
  - name: Publish to PyPI
    run: twine upload dist/*
    env:
      TWINE_USERNAME: __token__
      TWINE_PASSWORD: \${{ secrets.PYPI_API_TOKEN }}
\`\`\`

### 7.2 Secret 安全要点

\`\`\`
1. secret 不会打印到日志（GitHub 自动脱敏）
   echo \${{ secrets.XXX }}  → 日志显示 ***

2. 不要把 secret 传给 run 命令的参数（可能被进程列表看到）
   错误：run: ./deploy --token \${{ secrets.TOKEN }}
   正确：env: TOKEN: \${{ secrets.TOKEN }}
         run: ./deploy --token "\$TOKEN"

3. secret 不能在 if 条件里直接用
   错误：if: \${{ secrets.X == 'abc' }}
   → 永远是 false（secret 不在表达式上下文）

4. fork 的 PR 默认不能访问 secret
   → 防止恶意 PR 偷密钥

5. 环境（Environment）级别的 secret
   → 生产环境的 secret 只有部署到 production 环境时才暴露
\`\`\`

### 7.3 环境变量

\`\`\`yaml
env:                          # 全局环境变量（整个 workflow）
  PYTHON_VERSION: '3.11'

jobs:
  test:
    env:                      # job 级环境变量
      DB_HOST: localhost
      DB_PORT: 5432
    steps:
      - env:                  # step 级环境变量
        TEST_MODE: fast
      - run: echo \$PYTHON_VERSION
      - run: echo \$DB_HOST
\`\`\`

### 7.4 内置变量

GitHub 提供大量内置变量：

\`\`\`yaml
steps:
  - run: echo "仓库 \${{ github.repository }}"
  - run: echo "分支 \${{ github.ref }}"
  - run: echo "commit \${{ github.sha }}"
  - run: echo "触发者 \${{ github.actor }}"
  - run: echo "事件 \${{ github.event_name }}"
  - run: echo "run id \${{ github.run_id }}"
  - run: echo "runner OS \${{ runner.os }}"

# 常用场景：用 commit SHA 作为镜像 tag
- run: docker build -t myapp:\${{ github.sha }} .
\`\`\`

## 八、Artifacts（制品）

### 8.1 上传 artifact

\`\`\`yaml
steps:
  - uses: actions/checkout@v4
  - run: python -m build        # 产出 dist/*.whl

  - name: Upload artifact
    uses: actions/upload-artifact@v4
    with:
      name: python-package       # artifact 名
      path: dist/                # 要上传的路径
      retention-days: 30         # 保留 30 天
\`\`\`

### 8.2 下载 artifact

\`\`\`yaml
jobs:
  build:
    steps:
      - run: python -m build
      - uses: actions/upload-artifact@v4
        with:
          name: pkg
          path: dist/

  deploy:
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: pkg
          path: dist/
      - run: ls dist/            # 能看到 wheel 文件
\`\`\`

### 8.3 测试报告 artifact

\`\`\`yaml
- run: pytest --junitxml=test-results.xml

- uses: actions/upload-artifact@v4
  if: always()                   # 失败也上传
  with:
    name: test-results
    path: test-results.xml
\`\`\`

\`\`\`
artifact vs cache：

  artifact：构建产物，job 间传递，有保留期，可下载
  cache：依赖缓存，跨次构建复用，无保留期概念

  artifact → 给人/下游 job 用
  cache    → 给自己下次构建用
\`\`\`

## 九、完整 Python 项目 CI 配置

### 9.1 项目结构

\`\`\`
myapp/
├── .github/workflows/ci.yml
├── src/myapp/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── test_main.py
│   └── conftest.py
├── requirements.txt
├── requirements-dev.txt
└── pyproject.toml
\`\`\`

### 9.2 完整 ci.yml

\`\`\`yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  # ---------- Job 1: Lint ----------
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: pip
          cache-dependency-path: requirements-dev.txt
      - run: pip install -r requirements-dev.txt
      - run: flake8 src tests
      - run: black --check src tests
      - run: isort --check-only src tests

  # ---------- Job 2: Type Check ----------
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: pip
      - run: pip install -r requirements-dev.txt
      - run: mypy src

  # ---------- Job 3: Test (矩阵) ----------
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: pytest --cov=src --cov-report=xml --junitxml=junit.xml

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-\${{ matrix.python-version }}
          path: |
            coverage.xml
            junit.xml

  # ---------- Job 4: Security ----------
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install bandit safety pip-audit
      - run: bandit -r src -ll
      - run: safety check
      - run: pip-audit

  # ---------- Job 5: Build ----------
  build:
    needs: [lint, test, typecheck]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install build twine
      - run: python -m build
      - run: twine check dist/*
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # ---------- Job 6: Publish (仅 tag) ----------
  publish:
    needs: build
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    environment: pypi            # 需要审批的环境
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: pip install twine
      - run: twine upload dist/*
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: \${{ secrets.PYPI_API_TOKEN }}
\`\`\`

### 9.3 流水线图

\`\`\`
          ┌→ lint ─────┐
push/PR ──┤→ typecheck ─┼→ build → publish(仅 tag)
          ├→ test(矩阵)─┤
          └→ security ──┘

lint / typecheck / test / security 并行跑
全部 pass → build → publish
\`\`\`

## 十、并发控制与权限

### 10.1 并发控制

避免重复构建浪费资源：

\`\`\`yaml
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true   # 新构建开始时取消旧的
\`\`\`

\`\`\`
场景：你连续 push 3 次，前 2 次的 CI 还在跑

  不加 concurrency：3 个 CI 并行跑，浪费额度
  加 cancel-in-progress: true：第 3 次 push 时，前 2 个 CI 被取消

  group 设计：
    \${{ github.workflow }}-\${{ github.ref }}
    → 同一个 workflow + 同一个分支 → 同一组 → 互斥

  注意：deploy workflow 不要 cancel-in-progress: true！
        否则部署到一半被取消，服务会坏掉
\`\`\`

### 10.2 权限控制

\`\`\`yaml
permissions:
  contents: read        # 只读仓库代码
  packages: write       # 可推 GHCR 镜像
  pull-requests: write  # 可评论 PR
\`\`\`

\`\`\`
默认权限：
  公开仓库：read-all（只读，安全）
  私有仓库：可能继承组织配置（要检查）

最小权限原则：
  只给 workflow 实际需要的权限，避免 token 泄露后被滥用
\`\`\`

## 十一、Environment（环境）

### 11.1 创建环境

\`\`\`
仓库 Settings → Environments → New environment
  - 名称：production
  - Required reviewers：勾选，添加审批人
  - Deployment branches：selected branches，只允许 main

这样部署到 production 环境时，需要审批人手动点击 approve。
\`\`\`

### 11.2 在 workflow 中使用

\`\`\`yaml
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production      # 使用 production 环境
    steps:
      - run: ./deploy.sh
        env:
          DEPLOY_KEY: \${{ secrets.DEPLOY_KEY }}   # production 环境的 secret
\`\`\`

\`\`\`
environment 的作用：
1. 隔离 secret（dev/staging/prod 各自的 secret）
2. 审批门禁（部署前需人 approve）
3. 分支限制（只允许特定分支部署）
4. 部署记录（每次部署有日志，可追溯）
\`\`\`

## 十二、自托管 Runner

### 12.1 为什么自托管

\`\`\`
GitHub 托管 runner 的限制：
  - 不能访问内网（公司内网部署需自托管）
  - 配额有限（私有仓库 2000 分钟/月）
  - 特殊硬件需求（GPU、特殊 CPU）需自托管

自托管 runner：
  - 自己买机器，装 runner agent
  - 无配额限制
  - 可访问内网
  - 但要自己维护
\`\`\`

### 12.2 添加自托管 runner

\`\`\`bash
# 仓库 Settings → Actions → Runners → New self-hosted runner

# Linux 示例
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \\
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf actions-runner-linux-x64-2.311.0.tar.gz

# 注册到仓库
./config.sh --url https://github.com/owner/repo --token TOKEN

# 安装为服务
sudo ./svc.sh install
sudo ./svc.sh start
\`\`\`

### 12.3 使用自托管 runner

\`\`\`yaml
jobs:
  deploy-internal:
    runs-on: self-hosted          # 用自托管 runner
    steps:
      - run: ./deploy-to-internal.sh
\`\`\`

可以用 label 区分：

\`\`\`yaml
runs-on: [self-hosted, linux, gpu]   # 同时满足三个 label 的 runner
\`\`\`

## 十三、常用 Action 推荐

| Action | 用途 |
|--------|------|
| \`actions/checkout@v4\` | 拉取代码 |
| \`actions/setup-python@v5\` | 装 Python |
| \`actions/cache@v4\` | 缓存 |
| \`actions/upload-artifact@v4\` | 上传制品 |
| \`actions/download-artifact@v4\` | 下载制品 |
| \`actions/github-script@v7\` | 跑 JS 脚本操作 GitHub API |
| \`docker/build-push-action@v5\` | 构建推送镜像 |
| \`pnpm/action-setup@v3\` | 装 pnpm（前端）|
| \`actions/first-interaction@v1\` | 欢迎新贡献者 |

## 十四、调试技巧

### 14.1 开启 step 调试日志

\`\`\`
在仓库里重新启用 step debug logging：
  仓库 Settings → Secrets and variables → Actions → New repository secret
  名字：ACTIONS_STEP_DEBUG
  值：true

之后所有 step 都会输出详细调试日志。
\`\`\`

### 14.2 SSH 进 runner 调试

\`\`\`yaml
- uses: actions/checkout@v4
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  timeout-minutes: 30      # 30 分钟自动断开
\`\`\`

\`\`\`
触发后 CI 会暂停，日志里给出一个 SSH 地址，你 SSH 进去实时调试。
调试完 exit，CI 继续。

注意：会暴露 runner 上的所有信息（含 secret），调试完记得删除该 step！
\`\`\`

### 14.3 act（本地跑 workflow）

\`\`\`bash
# 安装 act（本地运行 GitHub Actions）
brew install act

# 本地跑 CI
act                           # 跑默认 workflow
act -j test                   # 只跑 test job
act --matrix python-version=3.11

# 用 Docker 模拟 runner，无需推到 GitHub 就能调试
\`\`\`

## 十五、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 缩进用 tab | YAML 用 tab 缩进 | 一律用空格（2 格）|
| secret 用在 if | \`\${{ secrets.X == 'a' }}\` | 用 env 传给 run，在 shell 里判断 |
| 缓存 key 太宽 | key: pip | key 含 hashFiles(依赖文件) |
| 忘 needs 导致并行 | 多个 job 没写 needs | 部署 job 必须 needs: build |
| 矩阵 fail-fast 误开 | 调试期开 fail-fast: true | 调试期 false，看全部结果 |
| deploy 开 cancel | deploy workflow 开 cancel-in-progress | deploy 不应被取消 |
| 用 latest tag | actions/checkout@latest | 锁定版本如 @v4 |
| secret 进命令参数 | run: cmd --token \${{ secrets.X }} | 用 env 传，命令里读 \$VAR |
| fork PR 用 secret | 直接用 secrets.X | 默认不可用，需维护者批准 |
| cron 时区错 | '0 9 * * *' 当北京时间 | GitHub 用 UTC，+8 换算 |
| 没设 permissions | 用默认权限 | 显式声明最小权限 |
| artifact 名冲突 | 矩阵 job 用同名 artifact | 名字加 \${{ matrix.x }} 区分 |
| 没 if: always() 上传报告 | 测试失败不上传 | 加 if: always() 失败也传 |
| workflow_call 没传参 | 复用 workflow 丢参数 | 用 inputs/secrets 显式声明 |
| 自托管 runner 装在内网 | 无安全隔离 | 用 label + 限制可访问范围 |

## 十六、小结

本章详解了 GitHub Actions 的核心用法：

1. **基础结构**：workflow → jobs → steps 三层
2. **触发器**：push / PR / schedule / workflow_dispatch / workflow_call
3. **job 依赖**：needs 串行，无 needs 并行
4. **矩阵构建**：一份配置多版本/多平台并行
5. **缓存**：pip / venv 缓存，key 用依赖文件 hash
6. **Secrets**：环境变量传递，绝不写进命令参数
7. **Artifacts**：job 间传递制品，有保留期
8. **Environment**：审批门禁 + secret 隔离
9. **并发控制**：cancel-in-progress 省额度（deploy 除外）
10. **权限控制**：最小权限原则
11. **调试技巧**：step debug / tmate SSH / act 本地

下一章讲 **GitLab CI/CD**，语法不同但概念相通。
`
  },
  {
    id: "deploy-gitlab-ci",
    icon: "🦊",
    title: "GitLab CI/CD 实战",
    group: "CI/CD 持续集成",
    content: `# GitLab CI/CD 实战

## 一、GitLab CI/CD 是什么

### 1.1 简介

**GitLab CI/CD** 是 GitLab 内置的 CI/CD 服务，与 GitLab 代码仓库深度集成。配置文件 \`.gitlab-ci.yml\` 放在仓库根目录，push 后自动执行。

- **官网**：https://about.gitlab.com/
- **文档**：https://docs.gitlab.com/ee/ci/
- **特点**：SaaS（gitlab.com）和自建（Self-managed）都支持
- **历史**：2015 年发布，比 GitHub Actions 早 4 年，企业内网部署首选

### 1.2 与 GitHub Actions 对比

| 维度 | GitHub Actions | GitLab CI/CD |
|------|----------------|--------------|
| 配置文件 | \`.github/workflows/*.yml\` | \`.gitlab-ci.yml\` |
| 一个仓库多个 workflow | 支持（多文件） | 一个文件多 job（或 include 拆分）|
| 触发器 | \`on:\` | 默认 push，用 \`rules\`/\`only\` 控制 |
| 任务 | \`jobs:<id>\` | 顶层每个 key 就是 job |
| 步骤 | \`steps:\` + \`uses\`/\`run\` | \`script:\`（纯 shell）|
| 复用 | \`uses: action@v4\` | \`include:\` / 模板 / 组件 |
| Runner | GitHub 托管 / 自托管 | 共享 / 私有 / 特定 |
| 矩阵 | \`strategy.matrix\` | \`parallel: matrix:\` |
| 缓存 | \`actions/cache\` | \`cache:\` 内置 |
| 制品 | upload/download-artifact | \`artifacts:\` 内置 |
| 环境 | \`environment:\` | \`environment:\` |
| 审批 | environment + reviewer | Protected environment + approval |

### 1.3 核心概念

\`\`\`
.gitlab-ci.yml          配置文件（仓库根目录）
  ├─ stages:            阶段定义（顺序）
  ├─ variables:         全局变量
  ├─ before_script:     所有 job 前执行的命令
  └─ <job-name>:        每个顶层 key 是一个 job
       stage: test      属于哪个阶段
       script:          要执行的命令
       rules:           什么时候跑

Runner                  执行 job 的机器
  ├─ Shared Runner      GitLab 提供的共享 runner
  ├─ Private Runner     自己注册的私有 runner
  └─ Specific Runner    绑定到具体项目的 runner

Pipeline                一次 push 触发的所有 job 集合
\`\`\`

## 二、第一个 .gitlab-ci.yml

### 2.1 最小配置

\`\`\`yaml
# .gitlab-ci.yml
stages:                    # 定义阶段顺序
  - test

test:                      # job 名
  stage: test              # 属于 test 阶段
  image: python:3.11       # 用 Docker 镜像
  script:                  # 要执行的命令
    - pip install pytest
    - pytest tests/
\`\`\`

push 后，GitLab 自动检测 \`.gitlab-ci.yml\`，启动 pipeline。

### 2.2 stages 与 job 的关系

\`\`\`yaml
stages:
  - lint
  - test
  - build
  - deploy

flake8:
  stage: lint
  script: flake8 .

pytest:
  stage: test
  script: pytest

build:
  stage: build
  script: python -m build

deploy:
  stage: deploy
  script: ./deploy.sh
\`\`\`

\`\`\`
执行顺序（同 stage 内的 job 并行，不同 stage 串行）：

  lint 阶段            test 阶段          build 阶段       deploy 阶段
  ┌─────────┐         ┌─────────┐        ┌─────────┐     ┌─────────┐
  │ flake8  │  pass → │ pytest  │ pass → │ build   │ →   │ deploy  │
  └─────────┘         └─────────┘        └─────────┘     └─────────┘

  flake8 失败 → pytest/build/deploy 都不执行（fail-fast）
\`\`\`

### 2.3 文件结构

| 字段 | 作用 | 位置 |
|------|------|------|
| \`stages\` | 定义阶段顺序 | 顶层 |
| \`variables\` | 全局变量 | 顶层 |
| \`before_script\` | 所有 job 前运行 | 顶层 |
| \`after_script\` | 所有 job 后运行 | 顶层 |
| \`<job>\` | 一个任务 | 顶层 |
| \`<job>.stage\` | 所属阶段 | job 内 |
| \`<job>.script\` | 执行命令 | job 内（必填）|
| \`<job>.image\` | Docker 镜像 | job 内 |
| \`<job>.rules\` | 触发条件 | job 内 |
| \`<job>.artifacts\` | 制品 | job 内 |
| \`<job>.cache\` | 缓存 | job 内 |
| \`<job>.needs\` | 跨阶段依赖 | job 内 |

## 三、Runner 概念

### 3.1 什么是 Runner

**Runner** 是实际执行 job 的机器/进程。GitLab 本身不跑 job，只是调度，把 job 分发给注册过的 Runner。

\`\`\`
┌─────────────────┐     job      ┌──────────────┐
│   GitLab        │ ──────────→  │   Runner 1   │ (Ubuntu)
│  (调度中心)      │              └──────────────┘
│                 │     job      ┌──────────────┐
│  存仓库/pipeline │ ──────────→  │   Runner 2   │ (macOS)
│                 │              └──────────────┘
└─────────────────┘     job      ┌──────────────┐
                       ──────────→│   Runner 3   │ (Windows)
                                 └──────────────┘
\`\`\`

### 3.2 Shared Runner vs Private Runner

| 类型 | 来源 | 适用 | 限制 |
|------|------|------|------|
| Shared Runner | GitLab 平台提供 | 公开项目免费 | 私有项目有配额 |
| Private Runner | 自己注册的 | 企业内网、特殊需求 | 自己维护 |
| Group Runner | 组级别注册 | 一组项目共用 | - |
| Specific Runner | 项目级别注册 | 单个项目专用 | - |

\`\`\`
gitlab.com 的免费 Shared Runner：
  - 每月 400 CI 分钟（免费账户）
  - 可能有排队
  - 不能访问你的内网

企业自建 GitLab + Private Runner：
  - 无配额限制
  - 可访问内网
  - 自己买机器维护
\`\`\`

### 3.3 注册 Private Runner

\`\`\`bash
# 1. 安装 gitlab-runner
# Linux
sudo curl -L --output /usr/local/bin/gitlab-runner \\
  https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
sudo chmod +x /usr/local/bin/gitlab-runner

# macOS
brew install gitlab-runner

# 2. 注册（从 GitLab 项目 → Settings → CI/CD → Runners 获取 token）
sudo gitlab-runner register

# 交互式输入：
#   GitLab instance URL: https://gitlab.com/
#   Registration token: <你的 token>
#   Executor: docker / shell / ssh / ...

# 3. 启动
sudo gitlab-runner start
\`\`\`

### 3.4 Executor 选择

| Executor | 说明 | 适用 |
|----------|------|------|
| \`docker\` | 每个 job 在独立 Docker 容器跑 | 最常用，隔离好 |
| \`shell\` | 直接在 runner 主机的 shell 跑 | 简单，但隔离差 |
| \`docker+machine\` | 自动扩缩容 Docker 主机 | 大规模 |
| \`kubernetes\` | 在 K8s 跑 pod | 云原生团队 |
| \`ssh\` | SSH 到远程机器跑 | 部署到固定服务器 |

\`\`\`
推荐：
  - 通用 CI：docker executor（隔离 + 干净）
  - 部署 job：shell executor（需要访问宿主机 docker/ssh）
  - 大规模：kubernetes executor

不要用 shell executor 跑不可信代码（如开源项目接受 PR）：
  → shell 直接跑在宿主机，恶意脚本能搞坏 runner
\`\`\`

## 四、Job 详解

### 4.1 script 字段

\`\`\`yaml
test:
  script:
    - pip install -r requirements.txt
    - pytest --cov=src
    - echo "测试完成"
\`\`\`

\`\`\`
script 注意事项：
  - 是字符串数组，每行一个命令
  - 任一命令返回非 0，job 失败
  - 想让命令失败不终止，加 || true
    - flake8 . || true
  - 多行用 | 或 >
    script:
      - |
        echo "line1"
        echo "line2"
\`\`\`

### 4.2 before_script / after_script

\`\`\`yaml
# 全局：所有 job 都执行
before_script:
  - echo "全局前置"
after_script:
  - echo "全局后置"

test:
  before_script:           # job 级覆盖全局
    - pip install pytest
  script:
    - pytest
  after_script:
    - echo "test 后置"
\`\`\`

### 4.3 image 与 services

\`\`\`yaml
test:
  image: python:3.11-slim         # 主镜像
  services:                        # 附属服务（linked container）
    - name: postgres:15
      alias: db
    - name: redis:7
      alias: cache
  variables:
    POSTGRES_PASSWORD: secret
    POSTGRES_DB: testdb
  script:
    - pip install pytest
    - pytest
    # 测试代码里可以用 db:5432 / cache:6379 连服务
\`\`\`

\`\`\`
services 的作用：
  类似 docker-compose，主容器 + 附属容器组成测试环境
  常见：postgres / mysql / redis / elasticsearch

  主镜像里用 alias 作为主机名访问附属服务
  如 psycopg2.connect(host='db', ...)
\`\`\`

### 4.4 needs（DAG 模式）

默认按 stage 顺序执行。用 \`needs\` 跳过 stage 限制：

\`\`\`yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script: make build

unit-test:
  stage: test
  needs: build              # 不等 test 阶段，build 一完成就跑
  script: pytest tests/unit

integration-test:
  stage: test
  needs: build
  script: pytest tests/integration

deploy:
  stage: deploy
  needs: [unit-test, integration-test]   # 两个测试都完成才部署
  script: ./deploy.sh
\`\`\`

\`\`\`
普通模式（按 stage）：
  build ──→ [所有 test 并行] ──→ deploy
  即使 build 早完成，test 也得等整个 build stage 结束

DAG 模式（用 needs）：
  build ──→ unit-test ──┐
       └──→ integration ─┴→ deploy
  build 一完成，unit/integration 立即并行启动
  → 更快，更灵活
\`\`\`

## 五、rules 与触发控制

### 5.1 rules（推荐方式）

\`\`\`yaml
test:
  script: pytest
  rules:
    # 仅 main 分支 push 触发
    - if: \$CI_COMMIT_BRANCH == "main"
      when: on_success

    # MR 触发
    - if: \$CI_PIPELINE_SOURCE == "merge_request_event"

    # 手动触发
    - if: \$CI_PIPELINE_SOURCE == "web"
      when: manual

    # tag 触发
    - if: \$CI_COMMIT_TAG

    # 其他情况不跑
    - when: never

deploy-prod:
  script: ./deploy.sh
  rules:
    - if: \$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/   # 语义化版本 tag
      when: manual                                   # 但需手动确认
\`\`\`

### 5.2 常用内置变量

\`\`\`
\$CI_COMMIT_BRANCH        当前分支
\$CI_COMMIT_TAG           当前 tag
\$CI_COMMIT_SHA           commit hash
\$CI_COMMIT_SHORT_SHA     短 hash
\$CI_PIPELINE_SOURCE      触发来源（push/merge_request_event/web/schedule...）
\$CI_PROJECT_DIR          仓库克隆到的目录
\$CI_ENVIRONMENT_NAME     环境名
\$CI_REGISTRY             内置 registry 地址
\$CI_REGISTRY_IMAGE       当前项目的镜像地址
\$CI_JOB_ID               job id
\`\`\`

### 5.3 only/except（旧语法，了解即可）

\`\`\`yaml
# 旧语法，新项目用 rules
test:
  script: pytest
  only:
    - main
    - tags
  except:
    - /^doc-/
\`\`\`

## 六、variables

### 6.1 定义变量

\`\`\`yaml
# 全局变量
variables:
  PYTHON_VERSION: "3.11"
  PIP_CACHE_DIR: "\$CI_PROJECT_DIR/.cache/pip"

test:
  variables:                # job 级变量（覆盖全局）
    TEST_MODE: "fast"
  script:
    - echo \$PYTHON_VERSION
    - echo \$TEST_MODE
\`\`\`

### 6.2 CI/CD Variables（在网页配置）

\`\`\`
项目 Settings → CI/CD → Variables → Add variable

  Key: PYPI_TOKEN
  Value: pypi-xxxxx
  Type: Variable / File
  Protected: yes          # 仅受保护分支可见
  Masked: yes             # 日志里脱敏
  Expanded: yes           # 展开 \$VAR 引用

使用：\$PYPI_TOKEN（在 script 里直接用）
\`\`\`

### 6.3 Protected 变量

\`\`\`
Protected variable：
  只在受保护分支（main/release）或受保护 tag 上可见
  普通分支/PR 看不到

用途：生产密钥只在 main 分支部署时可见，PR 流程拿不到
  → 防止恶意 PR 偷密钥

Protected branch：
  项目 Settings → Repository → Protected branches
  添加 main，只允许维护者合并
\`\`\`

## 七、cache

### 7.1 基本用法

\`\`\`yaml
variables:
  PIP_CACHE_DIR: "\$CI_PROJECT_DIR/.cache/pip"

test:
  image: python:3.11
  cache:
    key: pip-cache                            # 缓存键
    paths:
      - .cache/pip                            # 要缓存的路径
  script:
    - pip install -r requirements.txt
    - pytest
\`\`\`

\`\`\`
cache 工作原理：
  1. job 结束时，把 paths 指定的路径打包上传到 GitLab
  2. 下次同 key 的 job 启动时，下载并解压到对应路径

key 设计：
  key: pip-\$CI_COMMIT_REF_SLUG                  → 按分支隔离
  key: pip-\${CI_COMMIT_REF_SLUG}-\${hashFiles}    → 按分支+依赖文件
\`\`\`

### 7.2 缓存 key 高级用法

\`\`\`yaml
cache:
  key:
    files:
      - requirements.txt         # 这个文件的 hash 决定 key
      - requirements-dev.txt
    prefix: pip                  # key 前缀
  paths:
    - .cache/pip
\`\`\`

\`\`\`
key.files 的好处：
  requirements.txt 不变 → key 不变 → 命中缓存
  requirements.txt 改了 → key 变 → 重新下载

不用自己算 hash，GitLab 自动算
\`\`\`

### 7.3 缓存策略

\`\`\`yaml
# 只下载不上传（用别人的缓存）
cache:
  key: pip-cache
  paths: [.cache/pip]
  policy: pull               # 只拉不推

# 只上传不下载（生成缓存）
cache:
  key: pip-cache
  paths: [.cache/pip]
  policy: push               # 只推不拉

# 默认：pull-push（既拉又推）
\`\`\`

\`\`\`
场景：一个 job 装依赖生成缓存，其他 job 只用缓存

  install:
    cache:
      policy: push            # 只生成缓存
    script: pip install -r requirements.txt

  test:
    cache:
      policy: pull            # 只用缓存
    script: pytest

  lint:
    cache:
      policy: pull
    script: flake8
\`\`\`

## 八、artifacts

### 8.1 基本用法

\`\`\`yaml
build:
  script:
    - python -m build
  artifacts:
    paths:
      - dist/                 # 把 dist/ 作为制品
    expire_in: 1 week         # 保留 1 周
    name: "pkg-\$CI_COMMIT_SHORT_SHA"

deploy:
  script:
    - ls dist/                # 自动拿到上游 job 的制品
    - twine upload dist/*
\`\`\`

\`\`\`
artifacts vs cache：

  artifacts:
    - job 间传递产物（build → deploy）
    - 有保留期，过期自动删
    - 可在网页下载
    - 默认所有下游 job 自动获得

  cache:
    - 跨 pipeline 复用（这次 → 下次）
    - 无保留期，被新缓存覆盖
    - 不可在网页下载
    - 需显式声明 cache 才用
\`\`\`

### 8.2 测试报告 artifact

\`\`\`yaml
test:
  script:
    - pytest --junitxml=report.xml
  artifacts:
    when: always                  # 失败也上传
    reports:
      junit: report.xml           # GitLab 会解析并在 MR 里展示
    paths:
      - report.xml
\`\`\`

### 8.3 代码覆盖率报告

\`\`\`yaml
test:
  script:
    - pytest --cov=src --cov-report=cobertura
  coverage: '/TOTAL.*\\s+(\\d+\\%)\\s+\$/'   # 正则提取覆盖率
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
\`\`\`

## 九、environment（部署环境）

\`\`\`yaml
deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com    # 部署后可点击访问
  script:
    - ./deploy.sh staging
  only:
    - main

deploy-prod:
  stage: deploy
  environment:
    name: production
    url: https://example.com
  script:
    - ./deploy.sh production
  rules:
    - if: \$CI_COMMIT_TAG
      when: manual            # 手动触发
\`\`\`

\`\`\`
environment 的作用：
  - 在 GitLab → Deployments → Environments 看到所有环境
  - 每次部署有记录，可回滚到上一次
  - 配合 Protected Environment 可加审批门禁
  - 部署 URL 可点击直接访问

Protected Environment：
  项目 Settings → CI/CD → Protected Environments
  - 选 production
  - Allowed to deploy: 指定人员/团队
  → 只有指定的人能部署到生产
\`\`\`

## 十、include（复用配置）

### 10.1 拆分配置文件

\`\`\`yaml
# .gitlab-ci.yml（主文件）
include:
  - local: /.gitlab/lint.yml       # 本地文件
  - local: /.gitlab/test.yml
  - local: /.gitlab/deploy.yml
\`\`\`

\`\`\`
# .gitlab/lint.yml
lint:
  stage: lint
  script: flake8 .
\`\`\`

### 10.2 引用其他仓库的模板

\`\`\`yaml
include:
  - project: 'devops/ci-templates'      # 其他项目
    ref: main                            # 分支/tag
    file: '/python.yml'                  # 文件路径
\`\`\`

### 10.3 远程 URL

\`\`\`yaml
include:
  - remote: 'https://example.com/ci-template.yml'
\`\`\`

\`\`\`
include 的好处：
  - 大型项目拆分配置，便于维护
  - 团队共享 CI 模板，统一规范
  - 修改模板一处生效，所有项目更新
\`\`\`

## 十一、完整 Python 项目配置

### 11.1 项目结构

\`\`\`
myapp/
├── .gitlab-ci.yml
├── .gitlab/
│   ├── lint.yml
│   └── deploy.yml
├── src/myapp/
├── tests/
├── requirements.txt
└── requirements-dev.txt
\`\`\`

### 11.2 完整 .gitlab-ci.yml

\`\`\`yaml
stages:
  - lint
  - test
  - security
  - build
  - deploy

variables:
  PIP_CACHE_DIR: "\$CI_PROJECT_DIR/.cache/pip"
  PYTHON_IMAGE: "python:3.11-slim"

# ────────── Lint ──────────
flake8:
  stage: lint
  image: \$PYTHON_IMAGE
  cache:
    key:
      files: [requirements-dev.txt]
      prefix: pip
    paths: [.cache/pip]
    policy: pull
  script:
    - pip install flake8
    - flake8 src tests

black:
  stage: lint
  image: \$PYTHON_IMAGE
  script:
    - pip install black
    - black --check src tests

mypy:
  stage: lint
  image: \$PYTHON_IMAGE
  script:
    - pip install mypy
    - mypy src

# ────────── Test (矩阵) ──────────
test:
  stage: test
  image: python:\${PYTHON_VERSION}-sllim
  parallel:
    matrix:
      - PYTHON_VERSION: ["3.9", "3.10", "3.11", "3.12"]
  services:
    - name: postgres:15
      alias: db
    - name: redis:7
      alias: cache
  variables:
    POSTGRES_PASSWORD: secret
    POSTGRES_DB: testdb
    DATABASE_URL: "postgresql://postgres:secret@db:5432/testdb"
    REDIS_URL: "redis://cache:6379/0"
  cache:
    key:
      files: [requirements.txt, requirements-dev.txt]
      prefix: pip-\${PYTHON_VERSION}
    paths: [.cache/pip]
  script:
    - pip install -r requirements.txt -r requirements-dev.txt
    - pytest --cov=src --cov-report=xml --junitxml=report.xml
  coverage: '/TOTAL.*\\s+(\\d+\\%)\\s+\$/'
  artifacts:
    when: always
    reports:
      junit: report.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

# ────────── Security ──────────
bandit:
  stage: security
  image: \$PYTHON_IMAGE
  script:
    - pip install bandit
    - bandit -r src -ll

pip-audit:
  stage: security
  image: \$PYTHON_IMAGE
  script:
    - pip install pip-audit
    - pip-audit -r requirements.txt

# ────────── Build ──────────
build:
  stage: build
  image: \$PYTHON_IMAGE
  needs: [flake8, test]
  script:
    - pip install build twine
    - python -m build
    - twine check dist/*
  artifacts:
    paths: [dist/]
    expire_in: 1 week

build-docker:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  needs: [build]
  variables:
    IMAGE: \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA
  script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY
    - docker build -t \$IMAGE .
    - docker push \$IMAGE
    # 同时打 latest tag
    - docker tag \$IMAGE \$CI_REGISTRY_IMAGE:latest
    - docker push \$CI_REGISTRY_IMAGE:latest

# ────────── Deploy ──────────
deploy-staging:
  stage: deploy
  image: alpine:latest
  needs: [build-docker]
  environment:
    name: staging
    url: https://staging.example.com
  rules:
    - if: \$CI_COMMIT_BRANCH == "main"
  before_script:
    - apk add --no-cache openssh-client
    - eval \$(ssh-agent -s)
    - echo "\$SSH_PRIVATE_KEY" | tr -d '\\r' | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no deploy@staging "
        docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY &&
        docker pull \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA &&
        docker stop myapp || true &&
        docker rm myapp || true &&
        docker run -d --name myapp -p 80:8000 \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA
      "
    - sleep 5
    - wget -q --spider https://staging.example.com/health || exit 1

deploy-prod:
  stage: deploy
  image: alpine:latest
  needs: [deploy-staging]
  environment:
    name: production
    url: https://example.com
  rules:
    - if: \$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+\$/
      when: manual
  script:
    - echo "部署到生产"
    - ./deploy.sh production
\`\`\`

### 11.3 pipeline 可视化

\`\`\`
main 分支 push：
  lint(flake8, black, mypy 并行)
       ↓
  test(3.9/3.10/3.11/3.12 矩阵并行)
       ↓
  security(bandit, pip-audit 并行)
       ↓
  build(打包 wheel) + build-docker(构建镜像)
       ↓
  deploy-staging(自动)
       ↓ (打 tag 时)
  deploy-prod(手动)
\`\`\`

## 十二、GitLab 内置 Registry

### 12.1 启用 Container Registry

\`\`\`
GitLab 自带 Container Registry，无需额外装。

项目 → Packages & Registries → Container Registry

镜像地址格式：
  registry.gitlab.com/<group>/<project>:<tag>

内置变量：
  \$CI_REGISTRY             = registry.gitlab.com
  \$CI_REGISTRY_IMAGE       = registry.gitlab.com/group/project
  \$CI_REGISTRY_USER        = gitlab-ci-token
  \$CI_REGISTRY_PASSWORD    = \$CI_JOB_TOKEN（自动生成）
\`\`\`

### 12.2 推送镜像

\`\`\`yaml
build:
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker login -u \$CI_REGISTRY_USER -p \$CI_REGISTRY_PASSWORD \$CI_REGISTRY
    - docker build -t \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA .
    - docker push \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHORT_SHA
\`\`\`

## 十三、并行与分发

### 13.1 parallel（简单分片）

\`\`\`yaml
test:
  parallel: 5            # 拆成 5 个 job 并行
  script:
    - ./run-tests.sh \$CI_NODE_INDEX \$CI_NODE_TOTAL
\`\`\`

\`\`\`
CI_NODE_INDEX: 1, 2, 3, 4, 5（当前 job 编号）
CI_NODE_TOTAL: 5（总数）

run-tests.sh 自己根据编号分配用例：
  例如 100 个测试文件，5 个 job 各跑 20 个
\`\`\`

### 13.2 parallel matrix

\`\`\`yaml
test:
  parallel:
    matrix:
      - PYTHON: ["3.9", "3.10", "3.11"]
        OS: ["alpine", "debian"]
  image: python:\${PYTHON}-slim
  script: pytest
\`\`\`

\`\`\`
生成 3 × 2 = 6 个 job：
  python:3.9-alpine / python:3.9-debian
  python:3.10-alpine / python:3.10-debian
  python:3.11-alpine / python:3.11-debian
\`\`\`

## 十四、retry 与 timeout

\`\`\`yaml
test:
  script: pytest
  retry:
    max: 2                          # 最多重试 2 次
    when:
      - runner_system_failure        # 仅 runner 系统故障才重试
      - stuck_or_timeout_failure
  timeout: 10 minutes               # job 超时
\`\`\`

\`\`\`
retry.when 选项：
  always                  总是重试（小心，可能死循环）
  unknown_failure         未知失败
  script_failure          script 失败
  runner_system_failure   runner 系统故障（推荐）
  stuck_or_timeout_failure 卡住或超时

不要 always 重试：
  测试失败 always 重试 → 失败 2 次 → 还是失败 → 浪费 3 倍时间
  只对"环境性失败"重试（网络抖动、runner 故障）
\`\`\`

## 十五、interruptible

\`\`\`yaml
test:
  interruptible: true       # 可被新 pipeline 中断
  script: pytest

deploy:
  interruptible: false      # 不可中断（部署中途断了会坏）
  script: ./deploy.sh
\`\`\`

\`\`\`
场景：你连续 push 2 次

  旧 pipeline 还在跑 test（interruptible: true）
  新 pipeline 启动 → 旧 pipeline 的 test 被取消 → 省资源

  但旧 pipeline 的 deploy（interruptible: false）
  即使新 pipeline 启动，deploy 也继续跑完 → 避免部署中断
\`\`\`

## 十六、调试技巧

### 16.1 查看pipeline

\`\`\`
项目 → Build → Pipelines
  看每个 pipeline 的状态、job 列表、耗时

点进 job → 看日志、artifact、retry
\`\`\`

### 16.2 CI Lint

\`\`\`
项目 → CI/CD → CI Lint
  粘贴 .gitlab-ci.yml 内容 → 验证语法
  → 提前发现配置错误，不用 push 测试
\`\`\`

### 16.3 手动跑 pipeline

\`\`\`
项目 → CI/CD → Pipelines → Run pipeline
  可选分支、传入变量、手动触发
  适合调试特定场景
\`\`\`

### 16.4 job 日志调试

\`\`\`yaml
test:
  script:
    - set -x                    # 开启 shell 调试，打印每条命令
    - echo \$DEBUG_VAR
    - pytest
  variables:
    CI_DEBUG_TRACE: "true"      # 打印所有变量（注意别泄露 secret）
\`\`\`

## 十七、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| stage 名拼错 | job.stage 与 stages 不一致 | 严格对齐 |
| 忘了 image | 没 image 跑在 shell executor | 显式 image: python:3.11 |
| secret 不设 protected | 普通分支也能拿到生产密钥 | secret 设 protected + masked |
| cache policy 错 | 所有 job 都 pull-push | 生成 push，使用 pull |
| artifacts 路径错 | paths 写了不存在路径 | 路径相对于 \$CI_PROJECT_DIR |
| only/except 混用 | 新项目用旧语法 | 用 rules |
| needs 跨 stage 漂移 | 用 needs 但忘改 stage | stage 仍要正确归类 |
| retry always | 测试失败也重试 | 仅 runner_system_failure 重试 |
| deploy 不设 interruptible | 部署被新 pipeline 中断 | interruptible: false |
| services alias 错 | 连不上 db | alias 与代码连接配置一致 |
| protected env 没配 | 谁都能部署生产 | 用 protected environment |
| include 模板 ref 用 main | 模板改了所有项目受影响 | 锁定 tag 版本 |
| 矩阵变量名不一致 | image 引用 \$PYTHON 但 matrix 写 PY | 名字完全一致 |
| \$VAR 与 \${VAR} 混用 | 复杂表达式建议 \${VAR} | 简单用 \$VAR，复合用 \${VAR} |
| 忘 expire_in | artifact 占满存储 | 设 expire_in: 1 week |

## 十八、小结

本章详解了 GitLab CI/CD 的核心用法：

1. **配置结构**：stages + 顶层 job，简单直接
2. **Runner**：Shared/Private，executor 选 docker 最常用
3. **job 依赖**：默认按 stage 串行，needs 实现 DAG
4. **rules**：现代触发控制，替代 only/except
5. **variables**：全局/job 级 + 网页配置 CI/CD Variables
6. **cache**：key.files 自动算 hash，policy 控制拉推
7. **artifacts**：job 间传递，reports 展示测试报告
8. **environment**：部署环境管理 + protected 审批
9. **include**：配置复用，团队共享模板
10. **matrix**：parallel.matrix 多版本并行
11. **内置 Registry**：无需额外装镜像仓库
12. **retry/interruptible**：失败重试 + 中断控制

下一章简要介绍 **Jenkins**，作为对比了解。
`
  },
  {
    id: "deploy-jenkins",
    icon: "🧰",
    title: "Jenkins 入门",
    group: "CI/CD 持续集成",
    content: `# Jenkins 入门

## 一、Jenkins 是什么

### 1.1 简介

**Jenkins** 是历史最悠久的开源 CI/CD 工具，2004 年（前身 Hudson）发布，2011 年从 Hudson 分叉。几乎所有老牌互联网公司都有 Jenkins 的身影。

- **官网**：https://www.jenkins.io/
- **许可**：MIT
- **语言**：Java
- **特点**：插件极其丰富（1800+）、高度可定制、可自托管
- **现状**：在云原生时代被 GitHub Actions / GitLab CI 蚕食市场，但大量企业仍在用

### 1.2 为什么还要学 Jenkins

\`\`\`
云原生时代，新项目大多选 GitHub Actions / GitLab CI。
但 Jenkins 仍然重要的原因：

1. 遗留系统：很多公司已有 Jenkins 流水线，迁移成本高
2. 复杂流水线：Jenkins 的脚本能力极强，复杂逻辑好实现
3. 内网部署：纯内网环境，Jenkins 自托管可控
4. 多种 SCM：Jenkins 能对接 GitHub/GitLab/Bitbucket/SVN 等
5. 插件生态：1800+ 插件，几乎所有工具都有集成

如果你入职的公司用 Jenkins，至少要看得懂 Jenkinsfile。
新项目的话，建议优先 GitHub Actions / GitLab CI。
\`\`\`

## 二、Jenkins 架构

### 2.1 Master / Agent 架构

\`\`\`
┌─────────────────────────────────────────────┐
│            Jenkins Master                   │
│  ┌─────────────────────────────────────┐   │
│  │ Web UI（配置、看构建、装插件）         │   │
│  │ Scheduler（调度 job 到 agent）        │   │
│  │ Job 配置存储                          │   │
│  │ 插件管理                              │   │
│  └─────────────────────────────────────┘   │
└──────────┬───────────────┬─────────────────┘
           │ 分发 job      │
   ┌───────▼───────┐  ┌────▼────────┐  ┌──────────────┐
   │  Agent 1       │  │  Agent 2    │  │  Agent 3     │
   │  (Linux)       │  │  (Windows)  │  │  (macOS)     │
   │  跑 job        │  │  跑 job     │  │  跑 job      │
   └────────────────┘  └─────────────┘  └──────────────┘

Master 不跑 job，只调度
Agent 实际执行 job
\`\`\`

### 2.2 Master 职责

| 职责 | 说明 |
|------|------|
| Web UI | 配置、查看构建、管理插件 |
| 调度 | 把 job 分发给空闲 agent |
| 存储 | job 配置、构建历史、artifact |
| 安全 | 用户/权限管理 |
| 插件 | 加载和管理插件 |

### 2.3 Agent 职责

| 职责 | 说明 |
|------|------|
| 执行 job | 实际跑构建/测试/部署 |
| 上报 | 把日志、artifact 回传 master |
| 标签 | 用 label 区分（如 linux / windows / gpu）|

### 2.4 Agent 连接方式

\`\`\`
1. SSH：master 通过 SSH 连 agent（agent 开 SSH）
   优点：简单
   缺点：agent 必须有公网/内网可达

2. JNLP（Java Web Start）：agent 主动连 master
   优点：agent 可在 NAT 后
   缺点：要在 agent 跑 agent.jar

3. WebSocket：新版推荐，agent 主动连 master
   优点：穿透防火墙好
   缺点：需 Jenkins 较新版本

选择建议：
  agent 在内网可达 → SSH
  agent 在 NAT 后 / 公网 → JNLP / WebSocket
\`\`\`

## 三、安装 Jenkins

### 3.1 Docker 安装（最快体验）

\`\`\`bash
# 一行命令体验
docker run -d --name jenkins \\
  -p 8080:8080 -p 50000:50000 \\
  -v jenkins_home:/var/jenkins_home \\
  jenkins/jenkins:lts

# 查看初始密码
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
# 输出：2a8d4f...（复制）

# 浏览器打开 http://localhost:8080
# 粘贴密码 → 选 "Install suggested plugins" → 创建用户
\`\`\`

### 3.2 生产安装（Linux）

\`\`\`bash
# Ubuntu/Debian
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \\
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \\
  https://pkg.jenkins.io/debian-stable binary/" | \\
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y openjdk-17-jenkins jenkins

sudo systemctl enable jenkins
sudo systemctl start jenkins

# CentOS/RHEL
sudo wget -O /etc/yum.repos.d/jenkins.repo \\
  https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install -y jenkins java-17-openjdk
sudo systemctl enable --now jenkins
\`\`\`

\`\`\`
生产部署注意：
1. JDK 版本：Jenkins 2.421+ 需 Java 17+
2. 反向代理：前面放 Nginx 处理 HTTPS
3. 数据备份：JENKINS_HOME 定期备份
4. 插件管理：定期更新但不要无脑升
5. 资源：master 至少 4 核 8GB
\`\`\`

## 四、Jenkinsfile 与 Pipeline

### 4.1 什么是 Jenkinsfile

**Jenkinsfile** 是 Jenkins pipeline 的"配置即代码"形式，放在仓库根目录，类似 \`.gitlab-ci.yml\` / \`.github/workflows/*.yml\`。

\`\`\`
Jenkinsfile 用 Groovy DSL 写（不是 YAML！）
放在仓库根目录，Jenkins 检测到后自动跑

两种语法：
  - Declarative Pipeline（声明式，推荐）
  - Scripted Pipeline（脚本式，灵活但复杂）
\`\`\`

### 4.2 第一个 Jenkinsfile（Declarative）

\`\`\`groovy
// Jenkinsfile
pipeline {
    agent any                       // 在任意 agent 跑

    stages {
        stage('Build') {
            steps {
                sh 'echo "Building"'
                sh 'python -m build'
            }
        }
        stage('Test') {
            steps {
                sh 'pytest tests/'
            }
        }
        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }
    }
}
\`\`\`

### 4.3 Declarative Pipeline 结构

\`\`\`groovy
pipeline {
    agent { label 'linux && docker' }    // 指定 agent label

    environment {
        PYTHON_VERSION = '3.11'
        DB_PASSWORD = credentials('db-password')   // 引用 Jenkins 凭据
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(2)
        disableConcurrentBuilds()        // 禁止并发构建
    }

    triggers {
        cron('H 2 * * *')                // 每天凌晨 2 点（H 是 hash，分散负载）
    }

    parameters {
        choice(name: 'ENV', choices: ['staging', 'prod'], description: '部署环境')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Test') {
            steps {
                sh 'pytest'
            }
            post {
                always {
                    junit 'report.xml'    // 上传测试报告
                }
            }
        }
    }

    post {
        success {
            echo 'Build succeeded!'
        }
        failure {
            emailext to: 'team@example.com', subject: 'Build failed', body: '...'
        }
        always {
            cleanWs()                     // 清理工作区
        }
    }
}
\`\`\`

### 4.4 关键概念对比

| 概念 | Jenkinsfile | GitHub Actions | GitLab CI |
|------|-------------|----------------|-----------|
| 配置文件 | Jenkinsfile | workflow yml | .gitlab-ci.yml |
| 语言 | Groovy DSL | YAML | YAML |
| 任务单元 | stage/steps | job/steps | job/script |
| 执行器 | agent | runner | runner |
| 并行 | parallel | matrix | parallel.matrix |
| 触发 | triggers | on | rules |
| 凭据 | credentials() | secrets | CI/CD Variables |
| 制品 | archiveArtifacts | upload-artifact | artifacts |
| 缓存 | 无内置（插件）| actions/cache | cache |
| 复用 | shared library | composite action | include |

### 4.5 Scripted Pipeline（了解）

\`\`\`groovy
node('linux') {
    stage('Build') {
        sh 'python -m build'
    }
    stage('Test') {
        try {
            sh 'pytest'
        } catch (e) {
            currentBuild.result = 'FAILURE'
            throw e
        } finally {
            junit 'report.xml'
        }
    }
}
\`\`\`

\`\`\`
Scripted Pipeline：
  - 纯 Groovy，灵活度极高
  - 能写 if/for/try-catch
  - 但学习曲线陡，新人难懂

Declarative Pipeline：
  - 结构化 DSL，类似 YAML
  - 限制多但易读
  - 现代推荐

新项目一律用 Declarative。
\`\`\`

## 五、agent 选择

### 5.1 agent 指令

\`\`\`groovy
// 在任意 agent 跑
agent any

// 在指定 label 的 agent 跑
agent { label 'linux' }
agent { label 'linux && docker' }

// 在 docker 容器跑
agent {
    docker {
        image 'python:3.11'
        args '-v /tmp:/tmp'
    }
}

// 在 docker 中跑且用 label
agent {
    docker {
        image 'python:3.11'
        label 'docker'
    }
}

// 不在任何 agent 跑（在 master 内部）
agent none
\`\`\`

### 5.2 Docker agent（推荐）

\`\`\`groovy
pipeline {
    agent {
        docker { image 'python:3.11-slim' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'pip install pytest'
                sh 'pytest'
            }
        }
    }
}
\`\`\`

\`\`\`
Docker agent 的好处：
  - 每个 job 在干净容器跑（环境隔离）
  - 不用在 agent 装 Python（Jenkins 自己拉镜像）
  - 类似 GitHub Actions 的 image: python:3.11

  跨 stage 用不同镜像：
  pipeline {
      agent none
      stages {
          stage('Test') {
              agent { docker { image 'python:3.11' } }
              steps { sh 'pytest' }
          }
          stage('Build') {
              agent { docker { image 'node:20' } }
              steps { sh 'npm run build' }
          }
      }
  }
\`\`\`

## 六、并行与矩阵

### 6.1 parallel

\`\`\`groovy
stage('Test') {
    parallel {
        stage('Unit') {
            steps { sh 'pytest tests/unit' }
        }
        stage('Integration') {
            steps { sh 'pytest tests/integration' }
        }
        stage('E2E') {
            steps { sh 'pytest tests/e2e' }
        }
    }
}
\`\`\`

### 6.2 matrix（Jenkins 2.x+）

\`\`\`groovy
pipeline {
    agent none
    stages {
        stage('Test') {
            matrix {
                axes {
                    axis {
                        name 'PYTHON'
                        values '3.9', '3.10', '3.11'
                    }
                    axis {
                        name 'OS'
                        values 'linux', 'windows'
                    }
                }
                agent {
                    docker { image "python:\${PYTHON}-slim" }
                }
                stages {
                    stage('Test') {
                        steps {
                            sh 'pytest'
                        }
                    }
                }
            }
        }
    }
}
\`\`\`

\`\`\`
matrix 生成 3 × 2 = 6 个并行分支，类似 GitLab/GitHub 的矩阵构建。
\`\`\`

## 七、凭据管理

### 7.1 添加凭据

\`\`\`
Jenkins → Manage Jenkins → Credentials → System → Global credentials → Add

  类型：
  - Username with password
  - Secret text
  - Secret file
  - SSH Username with private key
  - Docker Host Certificate

  示例：
  ID: pypi-token
  类型: Secret text
  Secret: pypi-xxxxx
\`\`\`

### 7.2 在 Jenkinsfile 中使用

\`\`\`groovy
pipeline {
    agent any
    environment {
        // 引用凭据
        PYPI_TOKEN = credentials('pypi-token')
        // SSH key
        SSH_KEY = credentials('deploy-ssh-key')
    }
    stages {
        stage('Publish') {
            steps {
                // 用环境变量
                sh 'twine upload --password \$PYPI_TOKEN dist/*'
                // SSH key 自动注入 SSH_AUTH_SOCK
                sh 'ssh deploy@prod ./deploy.sh'
            }
        }
    }
}
\`\`\`

\`\`\`
credentials() 的行为：
  - Secret text：直接当环境变量
  - Username/Password：注入两个变量 XXX_USR / XXX_PSW
  - SSH key：自动加到 ssh-agent，可用 ssh 命令
  - Secret file：注入文件路径变量

凭据不会打印到日志（Jenkins 自动脱敏）
\`\`\`

## 八、与 GitHub Actions / GitLab CI 对比

### 8.1 配置对比

同样是"装依赖 + 跑测试"，三种工具的写法：

#### Jenkins

\`\`\`groovy
pipeline {
    agent { docker { image 'python:3.11' } }
    stages {
        stage('Test') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'pytest'
            }
        }
    }
}
\`\`\`

#### GitHub Actions

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container: python:3.11
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest
\`\`\`

#### GitLab CI

\`\`\`yaml
test:
  image: python:3.11
  script:
    - pip install -r requirements.txt
    - pytest
\`\`\`

\`\`\`
观察：
  GitLab CI 最简洁（YAML，纯 script）
  GitHub Actions 次之（YAML，steps + uses）
  Jenkins 最冗长（Groovy DSL，但功能最强）

  小项目 → GitLab CI / GitHub Actions 爽
  复杂流水线 → Jenkins 灵活
\`\`\`

### 8.2 全面对比

| 维度 | Jenkins | GitHub Actions | GitLab CI |
|------|---------|----------------|-----------|
| 部署方式 | 自托管 | SaaS（可自托管）| SaaS / 自托管 |
| 配置语言 | Groovy DSL | YAML | YAML |
| 学习曲线 | 陡 | 平缓 | 平缓 |
| 插件生态 | 1800+ 极丰富 | Action 市场丰富 | 内置 + 模板 |
| UI 美观度 | 老旧 | 现代 | 现代 |
| 内置功能 | 多（靠插件）| 中 | 多（registry/pages/review）|
| 维护成本 | 高（Java、插件升级）| 低（SaaS）| 低（SaaS）|
| 内网部署 | ★★★★★ | ★★（自托管 runner）| ★★★★★ |
| 多 SCM 支持 | GitHub/GitLab/BB/SVN | 仅 GitHub | 仅 GitLab |
| 流水线即代码 | Jenkinsfile | workflow yml | .gitlab-ci.yml |
| 矩阵 | matrix | strategy.matrix | parallel.matrix |
| 缓存 | 插件（无内置）| actions/cache | 内置 cache |
| 制品 | archiveArtifacts | upload-artifact | artifacts |
| 凭据 | credentials() | secrets | CI/CD Variables |
| 适合场景 | 复杂流水线、遗留 | GitHub 项目 | GitLab 项目 |

### 8.3 迁移建议

\`\`\`
场景 1：新项目
  代码在 GitHub → GitHub Actions
  代码在 GitLab → GitLab CI
  不推荐新项目上 Jenkins

场景 2：已有 Jenkins，要不要迁
  流水线简单 → 迁到 GitLab CI / GitHub Actions（成本 1-2 周）
  流水线复杂（依赖大量插件）→ 保持 Jenkins，新项目用其他

场景 3：纯内网，强定制
  保持 Jenkins，没有更好的选择
  或者 GitLab 自建 + GitLab CI

场景 4：K8s 全面云原生
  GitOps + Argo CD，Jenkins 逐步退场
\`\`\`

## 九、Shared Library（共享库）

Jenkins 的"复用机制"，类似 GitHub Actions 的 composite action / GitLab 的 include 模板。

\`\`\`groovy
// 共享库结构
// vars/
//   standardPipeline.groovy
// src/
//   org/devops/...

// vars/standardPipeline.groovy
def call(Map config = [:]) {
    pipeline {
        agent { label 'docker' }
        stages {
            stage('Test') {
                steps {
                    sh "pytest \${config.testDir ?: 'tests'}"
                }
            }
            stage('Build') {
                steps {
                    sh 'python -m build'
                }
            }
        }
    }
}
\`\`\`

在项目 Jenkinsfile 中引用：

\`\`\`groovy
@Library('my-shared-lib') _

standardPipeline(testDir: 'tests/unit')
\`\`\`

\`\`\`
Shared Library 的好处：
  - 团队统一流水线规范
  - 修改一处，所有项目更新
  - 用 Groovy 写复杂逻辑

缺点：
  - 学习曲线陡（要会 Groovy）
  - 调试难
  - IDE 支持差
\`\`\`

## 十、Blue Ocean 与现代 UI

\`\`\`
Jenkins 默认 UI 老旧，Blue Ocean 是现代化的 UI 插件：
  - 图形化 pipeline 视图
  - 更美观的日志展示
  - 更好的编辑体验

安装：Manage Jenkins → Plugins → Blue Ocean

但注意：Blue Ocean 已被官方宣布不再积极开发（deprecated），
推荐方向是用 "Pipeline Graph View" 插件替代。
\`\`\`

## 十一、常见插件

| 插件 | 用途 |
|------|------|
| Git Plugin | Git 集成 |
| Pipeline | 流水线核心 |
| Docker Pipeline | Docker 集成 |
| Credentials Binding | 凭据注入 |
| JUnit | 测试报告 |
| Cobertura | 覆盖率 |
| SSH Agent | SSH key 管理 |
| Email Extension | 邮件通知 |
| Slack | Slack 通知 |
| Blue Ocean | 现代 UI |
| Job DSL | 用代码创建 job |
| Configuration as Code | JCasC，用 YAML 配置 Jenkins |

\`\`\`
插件管理的坑：
  - 插件之间有依赖，升级一个可能影响其他
  - 部分插件不维护了，新版 Jenkins 不兼容
  - 升级前先备份 JENKINS_HOME
  - 生产环境插件升级要在测试 Jenkins 验证
\`\`\`

## 十二、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 用 master 跑 job | job 跑在 master 上 | agent any / label，master 只调度 |
| 插件无脑升级 | 升级后流水线挂 | 测试环境先验证 |
| JENKINS_HOME 不备份 | 服务器挂了配置全丢 | 定期备份 JENKINS_HOME |
| Scripted Pipeline 滥用 | 全用脚本式 | 新项目用 Declarative |
| 凭据写代码 | 硬编码密码 | 用 credentials() |
| agent 不隔离 | 所有 job 跑同一 agent | docker agent 隔离 |
| JDK 版本不对 | Java 8 跑新版 Jenkins | Jenkins 2.421+ 需 Java 17 |
| 不限并发 | 同时跑几百 job 压垮 | disableConcurrentBuilds |
| 不清工作区 | 磁盘塞满 | post { always { cleanWs() } } |
| Jenkins 暴露公网 | 无认证暴露 | 反代 + 强认证 + HTTPS |
| Shared Library 太复杂 | 把业务逻辑塞进去 | 只放通用模板 |
| 没有超时 | job 卡死占用 agent | options { timeout() } |
| 不用 Jenkinsfile | 在 UI 配置 job | 一律用 Jenkinsfile 即代码 |
| artifact 不清理 | 磁盘塞满 | 设保留策略 |
| 升级不读 release note | breaking change 踩坑 | 升级前读 LTS release note |

## 十三、小结

本章作为了解性章节，介绍了 Jenkins：

1. **定位**：历史悠久，遗留系统多，复杂流水线强
2. **架构**：Master 调度 + Agent 执行，类似 GitLab Runner
3. **Jenkinsfile**：Groovy DSL，Declarative（推荐）/ Scripted
4. **agent**：用 label 选，docker agent 隔离好
5. **matrix**：矩阵构建，类似其他工具
6. **credentials**：凭据管理 + credentials() 注入
7. **Shared Library**：复用机制，团队统一规范
8. **插件**：1800+，但维护是负担
9. **对比**：新项目优先 GitLab CI / GitHub Actions
10. **迁移**：简单流水线可迁，复杂流水线保持

下一章进入 **CD 实战**，构建完整的自动化部署流水线。
`
  },
  {
    id: "deploy-cd-pipeline",
    icon: "🚀",
    title: "自动化部署流水线实战",
    group: "CI/CD 持续集成",
    content: `# 自动化部署流水线实战

## 一、本章目标

本章把前面学过的 Docker、CI/CD、GitHub Actions 串起来，从零构建一条**完整的 CD 流水线**：

\`\`\`
代码 push → 自动测试 → 构建 Docker 镜像 → 推送镜像仓库
   → SSH 部署到服务器 → 健康检查 → 失败回滚
\`\`\`

完成本章后，你将拥有一套生产可用的自动化部署体系。

## 二、整体架构

### 2.1 流水线全景图

\`\`\`
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  开发者   │   │  GitHub  │   │  CI 跑在  │   │  镜像仓库 │
│  push    │ → │  仓库    │ → │ GitHub   │ → │ GHCR/Docker│
│  代码    │   │          │   │ Actions  │   │  Hub     │
└──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                   │ pull
                                                   ▼
                                          ┌──────────────┐
                                          │  生产服务器    │
                                          │  (SSH 部署)   │
                                          └──────┬───────┘
                                                 │ health check
                                                 ▼
                                          ┌──────────────┐
                                          │  健康检查 OK？ │
                                          │  Y → 完成     │
                                          │  N → 回滚     │
                                          └──────────────┘
\`\`\`

### 2.2 各阶段职责

| 阶段 | 输入 | 动作 | 输出 | 失败处理 |
|------|------|------|------|----------|
| Test | 源代码 | lint + unit test | 测试报告 | 阻止后续 |
| Build | 源代码 | docker build | Docker 镜像 | 阻止后续 |
| Push | Docker 镜像 | docker push | 仓库中的镜像 | 重试 |
| Deploy | 镜像 tag | SSH + docker run | 运行中的服务 | 触发回滚 |
| Verify | 服务 URL | curl /health | 健康状态 | 触发回滚 |
| Rollback | 上一个 tag | docker run old | 旧版本服务 | 报警人工介入 |

### 2.3 关键设计决策

\`\`\`
决策 1：用什么镜像 tag？
  ❌ latest（不可追溯，回滚困难）
  ✓ commit SHA（精确到每次提交）
  ✓ 语义化版本 v1.2.3（发布时）

决策 2：CI 怎么部署到服务器？
  方式 A：CI → SSH → 服务器（本章采用，简单）
  方式 B：服务器 pull 镜像（pull-based，需 watchtower/agent）
  方式 C：K8s + Argo CD（GitOps，进阶）

决策 3：怎么回滚？
  ✓ 记录每次部署的 tag → 失败时切回上一个 tag
  ✓ 镜像版本化是回滚的基础

决策 4：健康检查怎么设计？
  ✓ /health 端点返回 200
  ✓ 检查关键依赖（DB/Redis 连通性）
  ✓ 重试机制（服务启动需要时间）
\`\`\`

## 三、准备项目

### 3.1 项目结构

\`\`\`
myapp/
├── .github/workflows/deploy.yml      ← CD 流水线
├── src/myapp/
│   ├── __init__.py
│   └── main.py                       ← FastAPI 应用
├── tests/
│   └── test_main.py
├── Dockerfile                        ← 构建镜像
├── docker-compose.yml                ← 生产部署用
├── requirements.txt
└── README.md
\`\`\`

### 3.2 FastAPI 应用

\`\`\`python
# src/myapp/main.py
from fastapi import FastAPI
from datetime import datetime
import os
import socket

app = FastAPI(title="MyApp")

VERSION = os.getenv("APP_VERSION", "dev")
HOSTNAME = socket.gethostname()

@app.get("/")
def root():
    return {"message": "Hello", "version": VERSION}

@app.get("/health")
def health():
    """健康检查端点（部署后用这个判断服务是否正常）"""
    return {
        "status": "ok",
        "version": VERSION,
        "hostname": HOSTNAME,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/ready")
def ready():
    """就绪检查：检查依赖（DB/Redis）是否连通"""
    # 这里简化，实际应检查 DB/Redis 连接
    return {"status": "ready"}
\`\`\`

### 3.3 Dockerfile

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ---------- 运行阶段 ----------
FROM python:3.11-slim

WORKDIR /app

# 复制依赖
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:\$PATH

# 复制代码
COPY src/ ./src/

# 设置环境变量（可被运行时覆盖）
ENV APP_VERSION=unknown
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# 健康检查（Docker 层面）
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "src.myapp.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### 3.4 docker-compose.yml（生产用）

\`\`\`yaml
# docker-compose.yml
version: "3.9"

services:
  myapp:
    image: ghcr.io/\${OWNER}/myapp:\${TAG}   # 用环境变量传 tag
    container_name: myapp
    restart: unless-stopped
    ports:
      - "80:8000"
    environment:
      - APP_VERSION=\${TAG}
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
\`\`\`

### 3.5 测试

\`\`\`python
# tests/test_main.py
from fastapi.testclient import TestClient
from src.myapp.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
\`\`\`

## 四、构建 CD Workflow

### 4.1 完整 deploy.yml

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]                    # main 分支 push 触发
  workflow_dispatch:                    # 允许手动触发
    inputs:
      rollback_to:
        description: '回滚到指定 commit SHA（可选）'
        required: false

permissions:
  contents: read
  packages: write                       # 推 GHCR 镜像

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}   # owner/repo
  SSH_HOST: \${{ secrets.SSH_HOST }}
  SSH_USER: \${{ secrets.SSH_USER }}

jobs:
  # ─────────────────────────────────────────────
  # Job 1: 测试（CI 部分）
  # ─────────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: pip

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov flake8

      - name: Lint
        run: flake8 src tests

      - name: Test
        run: pytest --cov=src --cov-report=xml tests/

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage.xml

  # ─────────────────────────────────────────────
  # Job 2: 构建并推送 Docker 镜像
  # ─────────────────────────────────────────────
  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image_tag: \${{ steps.meta.outputs.tags }}
      image_digest: \${{ steps.push.outputs.digest }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        run: |
          SHORT_SHA=\$(git rev-parse --short HEAD)
          IMAGE_TAG="\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${SHORT_SHA}"
          echo "tags=\$IMAGE_TAG" >> \$GITHUB_OUTPUT
          echo "Building image: \$IMAGE_TAG"

      - name: Build and push
        id: push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha           # 用 GitHub Actions cache
          cache-to: type=gha,mode=max

  # ─────────────────────────────────────────────
  # Job 3: 部署到生产
  # ─────────────────────────────────────────────
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production             # 需要审批
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0                # 拉完整历史（回滚要找上一个 tag）

      - name: Get current and previous tags
        id: tags
        run: |
          CURRENT_TAG=\$(git rev-parse --short HEAD)
          # 找上一个成功部署的 tag（从 git tag 列表）
          PREV_TAG=\$(git tag --sort=-creatordate | head -2 | tail -1 || echo "")
          echo "current=\$CURRENT_TAG" >> \$GITHUB_OUTPUT
          echo "previous=\$PREV_TAG" >> \$GITHUB_OUTPUT
          echo "当前: \$CURRENT_TAG, 上一个: \$PREV_TAG"

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "\${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H \${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to server
        run: |
          IMAGE_TAG="\${{ needs.build-and-push.outputs.image_tag }}"
          SHORT_SHA=\$(echo "\$IMAGE_TAG" | awk -F: '{print \$2}')

          ssh \${{ secrets.SSH_USER }}@\${{ secrets.SSH_HOST }} bash -s << EOF
            set -e
            echo "=== 拉取新镜像 ==="
            echo \${{ secrets.GHCR_PAT }} | docker login ghcr.io -u \${{ github.actor }} --password-stdin
            docker pull \$IMAGE_TAG

            echo "=== 备份当前容器 ==="
            if docker ps -a --format '{{.Names}}' | grep -q myapp; then
              docker tag myapp:current myapp:backup 2>/dev/null || true
              docker rename myapp myapp-old || true
            fi

            echo "=== 启动新容器 ==="
            docker run -d \\
              --name myapp \\
              -p 80:8000 \\
              -e APP_VERSION=\$SHORT_SHA \\
              --restart unless-stopped \\
              \$IMAGE_TAG

            echo "=== 等待启动 ==="
            sleep 10
          EOF

      - name: Health check
        id: health
        run: |
          # 重试 6 次，每次间隔 10 秒
          for i in 1 2 3 4 5 6; do
            echo "尝试 \$i/6..."
            if curl -sf "http://\${{ secrets.SSH_HOST }}/health" > /dev/null; then
              echo "Health check passed!"
              echo "status=success" >> \$GITHUB_OUTPUT
              exit 0
            fi
            sleep 10
          done
          echo "Health check failed!"
          echo "status=failed" >> \$GITHUB_OUTPUT
          exit 1

  # ─────────────────────────────────────────────
  # Job 4: 回滚（部署失败时触发）
  # ─────────────────────────────────────────────
  rollback:
    needs: deploy
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "\${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H \${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Rollback to previous version
        run: |
          # 找上一个 tag 对应的镜像
          PREV_TAG=\$(git tag --sort=-creatordate | head -2 | tail -1)
          if [ -z "\$PREV_TAG" ]; then
            echo "没有上一个版本，无法回滚！需人工介入。"
            exit 1
          fi

          PREV_SHA=\$(git rev-parse --short \$PREV_TAG)
          IMAGE_TAG="ghcr.io/\${{ github.repository }}:\${PREV_SHA}"

          echo "回滚到: \$IMAGE_TAG"

          ssh \${{ secrets.SSH_USER }}@\${{ secrets.SSH_HOST }} bash -s << EOF
            set -e
            echo "=== 停止失败的新容器 ==="
            docker stop myapp || true
            docker rm myapp || true

            echo "=== 启动旧版本 ==="
            docker pull \$IMAGE_TAG
            docker run -d \\
              --name myapp \\
              -p 80:8000 \\
              -e APP_VERSION=\$PREV_SHA \\
              --restart unless-stopped \\
              \$IMAGE_TAG

            sleep 10

            echo "=== 健康检查 ==="
            curl -sf http://localhost:8000/health || exit 1
          EOF

      - name: Notify failure
        if: always()
        run: |
          echo "部署失败，已回滚到上一个版本"
          echo "请检查日志：https://github.com/\${{ github.repository }}/actions/runs/\${{ github.run_id }}"

  # ─────────────────────────────────────────────
  # Job 5: 通知
  # ─────────────────────────────────────────────
  notify:
    needs: [test, build-and-push, deploy, rollback]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Summary
        run: |
          echo "=== 部署结果 ==="
          echo "Test:        \${{ needs.test.result }}"
          echo "Build:       \${{ needs.build-and-push.result }}"
          echo "Deploy:      \${{ needs.deploy.result }}"
          echo "Rollback:    \${{ needs.rollback.result }}"

          if [ "\${{ needs.deploy.result }}" == "success" ]; then
            echo "✅ 部署成功！"
          elif [ "\${{ needs.rollback.result }}" == "success" ]; then
            echo "⚠️ 部署失败，已回滚"
          else
            echo "❌ 部署失败且回滚失败，需人工介入！"
          fi

      # 实际项目可接 Slack/钉钉/企业微信通知
      - name: Slack notify
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          slack-message: "Deploy \${{ needs.deploy.result }}: \${{ github.repository }}"
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}
\`\`\`

### 4.2 流水线执行图

\`\`\`
push to main
     │
     ▼
   test ──────────────────────────────────────┐ fail → 通知
     │ pass                                    │
     ▼                                         │
   build-and-push ────────────────────────────┤ fail → 通知
     │ pass                                    │
     ▼                                         │
   deploy (需审批) ───────────────────────────┤
     │ │                                       │
     │ ├─ success → notify(✅)                 │
     │ │                                        │
     │ └─ failure → rollback ────┐            │
     │                            │            │
     │                      rollback success   │
     │                      → notify(⚠️)       │
     │                            │            │
     │                      rollback failure   │
     │                      → notify(❌)       │
     │                                         │
     └─────────────────────────────────────────┘
\`\`\`

## 五、密钥配置清单

### 5.1 GitHub Secrets

在仓库 Settings → Secrets and variables → Actions 配置：

| Secret 名 | 用途 | 示例值 |
|-----------|------|--------|
| \`SSH_HOST\` | 生产服务器 IP | 1.2.3.4 |
| \`SSH_USER\` | SSH 用户 | deploy |
| \`SSH_PRIVATE_KEY\` | SSH 私钥 | -----BEGIN OPENSSH... |
| \`GHCR_PAT\` | GHCR 拉镜像 token | ghp_xxxxx |
| \`SLACK_WEBHOOK\` | Slack 通知 webhook | https://hooks.slack.com/... |
| \`DATABASE_URL\` | 数据库连接（如需）| postgresql://... |

### 5.2 服务器准备

\`\`\`bash
# 在生产服务器上：

# 1. 装 Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker

# 2. 创建部署用户
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy    # 加入 docker 组

# 3. 配置 SSH 公钥登录
sudo mkdir -p /home/deploy/.ssh
sudo cp /root/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# 4. 测试 SSH 登录
ssh deploy@服务器IP
\`\`\`

### 5.3 配置 GHCR

\`\`\`
GitHub Container Registry (GHCR)：
  镜像地址：ghcr.io/<owner>/<repo>:<tag>

权限：
  - 推镜像：用 GITHUB_TOKEN（CI 自动提供）
  - 拉镜像：服务器需配 PAT（Personal Access Token）

服务器配置拉镜像：
  echo "ghp_xxxxx" | docker login ghcr.io -u <username> --password-stdin

如果镜像仓库是 public，服务器不用登录就能 pull
\`\`\`

## 六、部署脚本设计要点

### 6.1 为什么用 SSH 而不是直接 docker run

\`\`\`
方案 A：CI 直接 docker run（CI 在云端，服务器在内网）
  → 云端 CI 跑 docker run 跑在自己容器里，不是生产服务器
  → 必须通过 SSH 让生产服务器自己跑

方案 B：服务器 watchtower 自动 pull
  → 简单但不可控（什么时候 pull、回滚怎么做都不灵活）

方案 C：CI SSH 到服务器执行命令（本章方案）
  → CI 控制全流程，灵活
  → 需要服务器开 SSH（安全风险，要加固）

方案 D：GitOps（Argo CD 等）
  → 服务器跑 agent，监听 Git 仓库变化
  → 最安全可控，但需 K8s（进阶）
\`\`\`

### 6.2 零停机部署

上面的方案有 1-2 秒停机（stop 旧 → start 新）。要零停机：

\`\`\`bash
# 蓝绿部署：新容器用不同端口启动，验证后切流量
ssh deploy@prod << 'EOF'
  set -e
  # 旧版本在 80 端口，新版本先用 8080 启动
  docker run -d --name myapp-new -p 8080:8000 \\
    -e APP_VERSION=NEW \$IMAGE_TAG

  # 等新版本就绪
  for i in 1 2 3 4 5; do
    curl -sf http://localhost:8080/health && break
    sleep 5
  done

  # 切流量：停旧、改端口映射、启新
  docker stop myapp || true
  docker rm myapp || true
  docker rename myapp-new myapp
  # 重新映射到 80（或用 nginx upstream 切换）
  docker run -d --name myapp -p 80:8000 --restart unless-stopped \$IMAGE_TAG
EOF
\`\`\`

\`\`\`
零停机关键：新版本先在备用端口启动并验证，通过后再切流量。
生产环境通常用 Nginx upstream + 双容器实现，比改端口更优雅。
\`\`\`

### 6.3 健康检查设计要点

\`\`\`python
# 健康检查端点要区分 liveness 和 readiness

@app.get("/health")      # liveness：进程活着吗
def health():
    return {"status": "ok"}

@app.get("/ready")       # readiness：能处理请求吗（依赖就绪吗）
def ready():
    # 检查数据库连通性
    try:
        db.execute("SELECT 1")
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not ready"})
    # 检查 Redis
    try:
        redis.ping()
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not ready"})
    return {"status": "ready"}
\`\`\`

\`\`\`
部署时健康检查策略：
  1. 用 /health 判断进程是否启动（快）
  2. 用 /ready 判断是否能服务（慢，含依赖检查）
  3. 重试：服务启动需时间，首次失败不代表真失败
  4. 超时：总等待时间别太短（30-60 秒）
  5. 失败 N 次才判定失败（避免抖动）
\`\`\`

### 6.4 回滚设计要点

\`\`\`
回滚的本质：把流量切回上一个已知正常的版本

回滚的前提：
  1. 镜像版本化（每次部署的 tag 都还在仓库里）
  2. 记录"当前线上是哪个版本"
  3. 知道"上一个正常版本是哪个"

回滚的触发：
  - 健康检查失败 → 自动回滚
  - 错误率飙升 → 监控触发回滚
  - 人工发现异常 → 手动回滚

回滚的限制（不能回滚的情况）：
  - 数据库 schema 不兼容（已执行的 migration 无法回退）
  - 配置变更（环境变量改了，旧镜像跑不了）
  → 这些情况回滚要配合数据库回滚或配置回滚
\`\`\`

## 七、部署策略对比

### 7.1 重建部署（Recreate）

\`\`\`
停旧 → 启新

  旧容器 stop → 新容器 start
  有停机时间（几秒到几十秒）

适合：个人项目、内部工具、可接受短暂停机
\`\`\`

### 7.2 滚动部署（Rolling）

\`\`\`
逐步替换，多个实例时分批切换

  实例1: old → new
  实例2: old → new
  实例3: old → new

  始终有部分实例服务，无停机
  旧新版本短暂共存

适合：多实例 + 可接受新旧短暂共存
\`\`\`

### 7.3 蓝绿部署（Blue-Green）

\`\`\`
两套环境（蓝/绿），切换流量

  蓝环境（当前线上）──── 流量
  绿环境（新版本）──── 待命

  验证绿环境 OK → 流量全切到绿 → 蓝变待命
  失败 → 流量切回蓝（秒级回滚）

  需要双倍资源
\`\`\`

### 7.4 金丝雀发布（Canary）

\`\`\`
小流量先试，逐步扩大

  100% 旧版本
  → 1% 新版本（观察）
  → 10% 新版本（观察）
  → 50% 新版本（观察）
  → 100% 新版本

  任何阶段异常 → 立即回滚（影响面小）
\`\`\`

### 7.5 四种策略对比

| 策略 | 停机 | 回滚速度 | 资源 | 复杂度 | 风险 | 适合 |
|------|------|----------|------|--------|------|------|
| 重建 | 有 | 慢 | 1x | 低 | 高 | 小项目 |
| 滚动 | 无 | 中 | 1x | 中 | 中 | 多实例 |
| 蓝绿 | 无 | 极快 | 2x | 中 | 低 | 需快速回滚 |
| 金丝雀 | 无 | 极快 | 1.1x | 高 | 极低 | 大流量、强风险控制 |

## 八、SSH 部署安全加固

### 8.1 SSH 安全清单

\`\`\`
1. 用专用的部署密钥，不要复用个人密钥
2. 私钥加密码短语（passphrase）
3. 服务器禁用密码登录（仅密钥登录）
4. 限制 SSH 来源 IP（仅 CI 的出口 IP）
5. 用 deploy 用户，不用 root
6. deploy 用户只能 docker 相关命令（用 sudoers 限制）
7. known_hosts 固定（用 ssh-keyscan，避免交互）
8. CI 里的私钥用 secret 存储，不写进代码
\`\`\`

### 8.2 限制 deploy 用户权限

\`\`\`bash
# /etc/sudoers.d/deploy
# 只允许 deploy 用户免密执行 docker 命令，其他都不行
deploy ALL=(ALL) NOPASSWD: /usr/bin/docker
\`\`\`

\`\`\`
这样即使 CI 的密钥泄露，攻击者也只能操作 docker，
不能 rm -rf / 或偷数据文件。
\`\`\`

### 8.3 服务器 SSH 加固

\`\`\`bash
# /etc/ssh/sshd_config
PermitRootLogin no               # 禁止 root SSH
PasswordAuthentication no        # 禁止密码登录
PubkeyAuthentication yes         # 仅密钥登录
AllowUsers deploy                # 仅允许 deploy 用户
AllowGroups deploy
MaxAuthTries 3                   # 最多尝试 3 次
\`\`\`

## 九、部署后监控

### 9.1 部署不是终点

\`\`\`
部署成功 ≠ 真的成功

  健康检查通过 → 容器起来了
  但业务可能还有问题：
    - 某个 API 报错率升高
    - 响应时间变长
    - 数据库连接池耗尽
    - 内存泄漏（要一段时间才暴露）

→ 部署后要持续监控关键指标
\`\`\`

### 9.2 关键监控指标

| 指标 | 工具 | 告警阈值 |
|------|------|----------|
| HTTP 5xx 错误率 | Prometheus | > 1% 持续 5 分钟 |
| 响应时间 P99 | Prometheus | > 500ms |
| CPU 使用率 | node_exporter | > 80% |
| 内存使用率 | node_exporter | > 90% |
| 容器重启次数 | docker stats | 1 分钟内 > 3 次 |
| 日志错误数 | ELK / Loki | 突增 |

### 9.3 部署后冒烟测试

\`\`\`yaml
# 在 deploy job 后加一个 smoke-test job
smoke-test:
  needs: deploy
  runs-on: ubuntu-latest
  steps:
    - name: Wait for service
      run: sleep 20

    - name: Smoke test
      run: |
        # 测核心接口
        curl -sf https://example.com/health
        curl -sf https://example.com/api/users | jq '.data | length > 0'
        curl -sf -X POST https://example.com/api/login \\
          -d '{"user":"test","pass":"test"}'

    - name: Check error rate
      run: |
        # 查 Prometheus 最近 5 分钟错误率
        RATE=\$(curl -s "http://prom:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])" | jq '.data.result[0].value[1]')
        if (( \$(echo "\$RATE > 0.01" | bc -l) )); then
          echo "错误率过高，触发回滚"
          exit 1
        fi
\`\`\`

## 十、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 用 latest tag | docker tag latest | 用 commit SHA 作 tag |
| 健康检查只查一次 | 启动即查，失败就回滚 | 重试 N 次，给启动时间 |
| 没有回滚 | 部署失败手动修 | 必须有自动回滚 job |
| SSH 用 root | ssh root@prod | 用 deploy 用户 + sudoers |
| 私钥写代码 | 私钥硬编码 | 用 CI secrets |
| 健康检查不分 liv/ready | 只用 /health | 区分 liveness / readiness |
| 部署不分环境 | 直接上生产 | staging 验证再 production |
| 部署无审批 | 任何 push 上生产 | production 加 environment 审批 |
| 回滚不验证 | 回滚后不查健康 | 回滚后必做 health check |
| 数据库迁移不兼容 | 部署带破坏性 migration | migration 要可向前兼容 |
| 部署完不监控 | 部署成功就不管 | 部署后监控错误率/延迟 |
| 并发部署冲突 | 多个 pipeline 同时部署 | concurrency 控制 |
| 容器日志不限制 | 日志写满磁盘 | logging max-size/max-file |
| 不备份就部署 | 出问题无法回退 | 部署前备份当前容器/配置 |
| SSH 不验证 host | 跳过 known_hosts | ssh-keyscan 固化指纹 |

## 十一、小结

本章从零构建了完整的 CD 流水线：

1. **整体架构**：CI 构建镜像 → 推仓库 → SSH 部署 → 健康检查 → 回滚
2. **项目准备**：FastAPI + Dockerfile + docker-compose
3. **完整 workflow**：test / build-and-push / deploy / rollback / notify 五个 job
4. **密钥管理**：SSH 密钥、GHCR token、webhook 全用 secrets
5. **零停机**：蓝绿部署，新版本备用端口先验证
6. **健康检查**：区分 liveness / readiness，重试机制
7. **回滚设计**：镜像版本化 + 记录历史 + 自动触发
8. **部署策略**：重建 / 滚动 / 蓝绿 / 金丝雀 四种对比
9. **SSH 加固**：deploy 用户 + sudoers + sshd_config
10. **部署后监控**：错误率/延迟/资源 持续观察

下一章是本系列最后一章，讲 **CI/CD 最佳实践与陷阱**。
`
  },
  {
    id: "deploy-cicd-best-practices",
    icon: "🏆",
    title: "CI/CD 最佳实践与陷阱",
    group: "CI/CD 持续集成",
    content: `# CI/CD 最佳实践与陷阱

## 一、本章定位

本章是 CI/CD 系列的收尾，把前几章散落的"经验"汇总成**可复用的最佳实践**和**必须避开的陷阱**。读完本章，你能设计出**生产级**的 CI/CD 体系。

\`\`\`
最佳实践的来源：
  - Google DORA 研究（《Accelerate》）
  - 业界头部公司实践（Netflix/Google/Amazon）
  - 大量踩坑总结

最佳实践不是教条，而是"在多数场景下被验证有效"的做法。
具体项目要结合自身情况裁剪。
\`\`\`

## 二、密钥管理最佳实践

### 2.1 密钥管理的原则

\`\`\`
1. 永远不要把密钥写进代码（包括 .env 文件提交到 git）
2. 永远不要把密钥打印到日志
3. 最小权限：每个密钥只给必要的权限
4. 最小暴露：密钥只在需要的 job/环境可见
5. 可轮换：密钥要能定期换，不能"一辈子不动"
6. 可审计：谁在什么时候用了密钥，要有记录
\`\`\`

### 2.2 密钥分级管理

| 级别 | 示例 | 存放 | 暴露范围 |
|------|------|------|----------|
| 开发用 | 测试 API key | .env.local（gitignore）| 仅本地 |
| CI 测试用 | 测试库密码 | CI secrets（非 protected）| 所有 PR |
| Staging | staging DB 密码 | CI secrets + environment: staging | 仅 staging job |
| 生产 | 生产 DB 密码 | CI secrets + protected + environment: production | 仅 main + 审批后 |

### 2.3 密钥使用的常见错误

\`\`\`yaml
# ❌ 错误 1：密钥写进命令参数（进程列表可见）
- run: ./deploy --token \${{ secrets.DEPLOY_TOKEN }}

# ✓ 正确：通过 env 传递
- run: ./deploy --token "\$DEPLOY_TOKEN"
  env:
    DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}

# ❌ 错误 2：密钥用在 if 条件（永远 false）
- if: \${{ secrets.KEY == 'abc' }}

# ✓ 正确：先用 env 取出，再在 shell 判断
- env:
    KEY: \${{ secrets.KEY }}
  if: always()        # 不能在 if 里用 secret
  run: |
    if [ "\$KEY" = "abc" ]; then echo "match"; fi

# ❌ 错误 3：密钥 echo 到日志
- run: echo \${{ secrets.KEY }}    # 即使脱敏，也风险高

# ❌ 错误 4：fork PR 用生产密钥
# → 默认就禁用，但要确认仓库设置没改
\`\`\`

### 2.4 密钥轮换

\`\`\`
密钥轮换流程：
  1. 生成新密钥
  2. 在 CI secrets 添加新密钥（NEW_KEY）
  3. 代码同时支持 OLD_KEY 和 NEW_KEY
  4. 部署，验证 NEW_KEY 可用
  5. 删除 OLD_KEY，代码只保留 NEW_KEY
  6. 部署

不要"一刀切"换密钥：
  → 一旦新密钥有问题，服务直接挂
  → 灰度切换更安全

定期轮换周期：
  - 高敏感（生产 DB）：3 个月
  - 中敏感（API token）：6 个月
  - 低敏感（webhook）：1 年
\`\`\`

### 2.5 用 Vault 等密钥管理服务

\`\`\`
CI secrets 的局限：
  - 数量多了难管理
  - 无法自动轮换
  - 无细粒度权限
  - 无审计日志

进阶：用 HashiCorp Vault / AWS Secrets Manager / Doppler
  - 集中管理所有密钥
  - 自动轮换
  - 细粒度权限（哪个服务能用哪个密钥）
  - 完整审计日志
  - 动态密钥（用完即毁）
\`\`\`

## 三、并发限制

### 3.1 为什么要限制并发

\`\`\`
没有并发控制的后果：

  场景 1：CI 浪费
    你连续 push 5 次，5 个 CI 并行跑
    → 浪费 5 倍额度，前 4 次的结果没用

  场景 2：部署冲突
    两个 PR 同时合并，两个部署并行
    → 部署互相覆盖，线上版本错乱

  场景 3：资源耗尽
    矩阵 12 个 job + 多个 PR
    → runner 被占满，其他项目排不上
\`\`\`

### 3.2 GitHub Actions 并发控制

\`\`\`yaml
# CI workflow：取消旧的，省额度
concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

# Deploy workflow：不要取消正在部署的！
concurrency:
  group: deploy-\${{ github.ref }}
  cancel-in-progress: false    # 排队，不取消
\`\`\`

\`\`\`
group 的设计：
  - ci-\${{ github.ref }}    → 同分支的 CI 互斥
  - deploy-production        → 生产部署全局互斥（一次只能部署一个）

cancel-in-progress 选择：
  CI（test/build）：true  → 旧的没意义，取消省额度
  Deploy：false            → 部署中途取消会坏，排队等
\`\`\`

### 3.3 GitLab CI 并发控制

\`\`\`yaml
# 全局：同一分支的 pipeline 互斥
workflow:
  rules:
    - if: \$CI_PIPELINE_SOURCE == "push"
      when: always

test:
  interruptible: true      # CI 可被新 pipeline 中断
  script: pytest

deploy:
  interruptible: false     # 部署不可中断
  script: ./deploy.sh
\`\`\`

### 3.4 资源配额

\`\`\`
GitHub：
  - 公开仓库：无限
  - 私有仓库：免费 2000 分钟/月，付费按额度
  - 自托管 runner：无配额

GitLab：
  - gitlab.com 免费版：400 CI 分钟/月
  - 自建：无配额，受 runner 数量限制

省额度技巧：
  1. 缓存依赖（减少安装时间）
  2. 并发限制（取消无效构建）
  3. paths 过滤（文档改动不跑 CI）
  4. 矩阵精简（不测所有组合）
  5. 失败快速返回（fail-fast）
\`\`\`

## 四、缓存策略

### 4.1 缓存的目标

\`\`\`
缓存能让 CI 时间从 5 分钟 → 1 分钟。
但缓存用错会带来"幽灵 bug"（本地能跑 CI 不能跑，或反之）。

缓存目标：
  - 缓存"不变的"（依赖包）
  - 不缓存"会变的"（代码、构建产物）
\`\`\`

### 4.2 Python 项目缓存层次

\`\`\`
层次 1：pip 下载缓存（~/.cache/pip）
  → 缓存下载的 wheel 文件
  → 命中后仍需 pip install（但不用下载）
  → 节省：下载时间

层次 2：venv 虚拟环境（.venv）
  → 缓存整个虚拟环境
  → 命中后直接用，不用 pip install
  → 节省：下载 + 安装时间
  → 但 key 要精确，否则依赖变了还用旧 venv

层次 3：Docker 层缓存
  → docker build 时复用之前的层
  → requirements.txt 不变 → 依赖层命中
  → 节省：镜像构建时间
\`\`\`

### 4.3 缓存 key 设计

\`\`\`yaml
# ✓ 好的 key：精确 + 兜底
key: pip-\${{ runner.os }}-\${{ hashFiles('requirements*.txt') }}
restore-keys: |
  pip-\${{ runner.os }}-

# ❌ 坏的 key 1：太宽
key: pip                        # 所有构建共用，污染

# ❌ 坏的 key 2：太严
key: pip-\${{ github.run_id }}  # 每次都 miss

# ❌ 坏的 key 3：缺 OS
key: pip-\${{ hashFiles('requirements.txt') }}
# → macOS 和 Linux 共用缓存，二进制不兼容
\`\`\`

### 4.4 缓存失效陷阱

\`\`\`
陷阱 1：依赖版本浮动
  requirements.txt 写 requests>=2.20
  → 每次 install 可能装不同版本
  → 但 hashFiles 只看文件内容，文件没变 key 不变
  → 缓存的是旧版本，但实际要装新版本

  解决：用 lock 文件（poetry.lock / requirements.lock）
       锁定精确版本，hash 才有意义

陷阱 2：系统依赖变化
  缓存了 .venv，但 runner 镜像升级了
  → 旧 venv 里的二进制不兼容新系统
  → 解决：key 加 runner.os + runner.arch

陷阱 3：缓存太大
  缓存 venv 几百 MB，上传/下载比重新装还慢
  → 解决：只缓存 pip 下载缓存，不缓存 venv
\`\`\`

### 4.5 Docker 构建缓存

\`\`\`dockerfile
# ❌ 错误：每次代码变，依赖层都失效
FROM python:3.11
WORKDIR /app
COPY . .                          # 代码一变，这层之后全失效
RUN pip install -r requirements.txt
CMD ["python", "main.py"]

# ✓ 正确：先 COPY 依赖文件，再装依赖，最后 COPY 代码
FROM python:3.11
WORKDIR /app
COPY requirements.txt .           # 依赖文件很少变
RUN pip install -r requirements.txt   # 这层命中率高
COPY . .                          # 代码变只影响这层之后
CMD ["python", "main.py"]
\`\`\`

\`\`\`
Docker 层缓存原则：
  把"变化少的"放前面，"变化多的"放后面
  这样前面的层能被缓存复用
\`\`\`

## 五、失败重试

### 5.1 什么该重试，什么不该

\`\`\`
该重试（环境性失败）：
  - 网络抖动（下载失败）
  - runner 故障
  - 镜像仓库超时
  - 数据库连接闪断

不该重试（确定性失败）：
  - 测试失败（代码 bug，重试还是失败）
  - lint 失败
  - 编译错误
  - 配置错误

错误做法：对所有失败都 retry
  → 测试失败 retry 2 次 → 跑 3 次都失败 → 浪费 3 倍时间
\`\`\`

### 5.2 GitHub Actions 重试

\`\`\`yaml
# GitHub Actions 没有内置 job 级 retry
# 用第三方 action 或 step 级 retry

- uses: nick-fields/retry@v3
  with:
    max_attempts: 3
    timeout_minutes: 10
    command: pip install -r requirements.txt
\`\`\`

### 5.3 GitLab CI 重试

\`\`\`yaml
test:
  script: pytest
  retry:
    max: 2
    when:
      - runner_system_failure      # 仅 runner 故障重试
      - stuck_or_timeout_failure
\`\`\`

### 5.4 重试的注意事项

\`\`\`
1. 重试要有退避（backoff）
   第 1 次立即重试，第 2 次等 10 秒，第 3 次等 30 秒
   → 给故障恢复时间

2. 重试次数要有限（2-3 次）
   无限重试 = 死循环 + 浪费资源

3. 重试要记录原因
   每次重试记日志，方便排查

4. 幂等性
   重试的命令必须是幂等的（重复执行没副作用）
   如 docker push 幂等，但 docker run 不幂等（会启多个容器）
\`\`\`

## 六、通知机制

### 6.1 为什么要通知

\`\`\`
没有通知的 CI/CD：
  - 构建失败没人知道 → bug 滞留
  - 部署成功没人确认 → 不知道上线了
  - 流水线卡住没人理 → 阻塞开发

好的通知：
  - 失败必通知（让人快速响应）
  - 成功可静默（避免噪音）
  - 关键节点通知（部署开始/完成）
  - 通知到对的人（@ 责任人，不是全员）
\`\`\`

### 6.2 通知渠道

| 渠道 | 工具 | 适合 |
|------|------|------|
| IM | Slack / 钉钉 / 企业微信 / 飞书 | 团队日常 |
| 邮件 | SMTP | 归档、跨时区 |
| 短信 | Twilio / 阿里云 | 紧急 |
| 电话 | PagerDuty / Opsgenie | 严重故障 |
| GitHub/GitLab 评论 | PR/MR 评论 | PR 状态 |

### 6.3 GitHub Actions 通知示例

\`\`\`yaml
# Slack 通知
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    slack-message: |
      \${{ github.workflow }}: \${{ job.status }}
      Repo: \${{ github.repository }}
      Run: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}
  env:
    SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}

# 钉钉通知（用 curl）
- name: Notify DingTalk
  if: failure()
  run: |
    curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=\${{ secrets.DINGTALK_TOKEN }}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "msgtype": "markdown",
        "markdown": {
          "title": "CI 失败",
          "text": "## CI 失败\\n仓库: \${{ github.repository }}\\n[查看日志](\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }})"
        }
      }'
\`\`\`

### 6.4 通知的反模式

\`\`\`
反模式 1：通知太多
  每个 job 都通知 → 群里刷屏 → 大家屏蔽 → 真的通知看不到
  → 只在关键节点通知（失败、部署完成）

反模式 2：通知到全员
  @channel @everyone → 噪音
  → 只 @ 责任人（PR 作者、on-call）

反模式 3：通知信息不全
  只说"失败了" → 还得自己点链接查
  → 通知里包含：什么失败、为什么、链接、怎么修

反模式 4：成功失败都通知
  成功通知 = 噪音
  → 默认成功静默，失败通知；关键部署成功通知
\`\`\`

## 七、蓝绿 vs 滚动 vs 金丝雀

### 7.1 三种策略详解

#### 蓝绿部署（Blue-Green）

\`\`\`
两套完全相同的环境，切换流量

       ┌─── 蓝环境（当前线上 v1）─── 流量
Nginx ─┤
       └─── 绿环境（新版本 v2）─── 待命

部署 v2：
  1. 在绿环境部署 v2
  2. 测试绿环境 OK
  3. Nginx 流量切到绿
  4. 蓝变待命（可回滚）

回滚：Nginx 流量切回蓝（秒级）
\`\`\`

#### 滚动部署（Rolling）

\`\`\`
多个实例逐步替换

  实例1(v1) 实例2(v1) 实例3(v1)  ← 初始
  实例1(v2) 实例2(v1) 实例3(v1)  ← 替换1
  实例1(v2) 实例2(v2) 实例3(v1)  ← 替换2
  实例1(v2) 实例2(v2) 实例3(v2)  ← 完成

  始终有 N-1 个实例服务，无停机
  但 v1/v2 短暂共存（要保证兼容）
\`\`\`

#### 金丝雀发布（Canary）

\`\`\`
小流量先试，逐步扩大

  100% → v1
  1%   → v2（观察 10 分钟）
  10%  → v2（观察 30 分钟）
  50%  → v2（观察 1 小时）
  100% → v2

  任何阶段异常 → 立即全回滚 v1（影响面 = 当前比例）
\`\`\`

### 7.2 三种策略对比

| 维度 | 蓝绿 | 滚动 | 金丝雀 |
|------|------|------|--------|
| 资源需求 | 2x | 1x | 1.1x |
| 停机时间 | 0 | 0 | 0 |
| 回滚速度 | 极快（切流量）| 中（重新滚动）| 极快（调比例）|
| 风险暴露 | 100%（切瞬间）| 部分（逐步）| 极小（1% 起步）|
| 新旧共存 | 否（切完才共存）| 是 | 是 |
| 复杂度 | 中 | 低 | 高 |
| 流量控制 | 全切 | 无 | 精细 |
| 适合场景 | 需快速回滚 | 多实例常规更新 | 高风险/大流量变更 |

### 7.3 选择建议

\`\`\`
你的情况                          推荐
──────────────────────────────────────────
个人项目/小流量                   重建部署（简单）
多实例，常规更新，低风险          滚动部署
需要秒级回滚能力                  蓝绿部署
高风险变更（大重构/性能改动）     金丝雀发布
大流量 + 强风险控制               金丝雀 + 自动回滚

进阶：A/B 测试
  不只是流量比例，还按用户特征分流
  （如 10% 北方用户用新版，其他用旧版）
  → 不仅是部署策略，还是产品策略
\`\`\`

### 7.4 金丝雀的自动回滚

\`\`\`
金丝雀发布的精髓：自动监控 + 自动回滚

  1% v2 → 监控 5 分钟
    错误率 < 0.1% → 继续扩到 10%
    错误率 > 1%   → 自动回滚到 v1

实现工具：
  - Argo Rollouts（K8s）
  - Flagger（K8s）
  - Spinnaker（多云）

关键指标：
  - 错误率（5xx）
  - 延迟（P99）
  - 业务指标（转化率、下单成功率）
\`\`\`

## 八、CI/CD 反模式（陷阱）

### 8.1 流水线反模式

\`\`\`
反模式 1：巨型流水线
  一个 workflow 塞 20 个 job，逻辑全混在一起
  → 拆成多个 workflow（ci.yml / deploy.yml / release.yml）
  → 用 workflow_call 复用

反模式 2：串行一切
  所有 job 串行跑，总耗时 = 各 job 之和
  → 能并行的并行（lint/test/build 互不依赖）
  → 用 needs 精确控制依赖

反模式 3：测试不足就上 CD
  只有几个单元测试就自动部署生产
  → 必须有集成测试 + E2E + 监控
  → CI 不稳定不要上 CD

反模式 4：手动步骤藏在脚本里
  "一键部署"脚本里要人输入密码/选环境
  → 真正全自动，密钥用 secrets
\`\`\`

### 8.2 部署反模式

\`\`\`
反模式 1：用 latest tag
  docker pull myapp:latest → 不知道拉的哪个版本
  → 用 commit SHA / 语义化版本

反模式 2：直接改生产文件
  SSH 到生产，vim 改配置，重启
  → 所有变更走 CI/CD，配置版本化

反模式 3：周五下午部署
  周五 18:00 部署 → 出问题没人修
  → 部署在工作日早中段，有问题有时间处理

反模式 4：没有回滚就部署
  部署失败只能紧急改代码
  → 必须有回滚机制（镜像版本化）

反模式 5：部署带破坏性 DB migration
  新版本要 DROP COLUMN，旧版本跑不了
  → migration 分多步：先加新列 → 双写 → 切读 → 删旧列
\`\`\`

### 8.3 团队反模式

\`\`\`
反模式 1：CI 失败没人修
  "CI 红了几天了，大家都无视"
  → CI 红了必须立即修，或回滚让 CI 绿
  → 设"broken build" 规则：CI 红时禁止合并新代码

反模式 2：手动绕过 CI
  "紧急修复，我直接 push 到 main 跳过 CI"
  → 任何代码都必须过 CI，紧急也要走流程（可加速）

反模式 3：生产权限太大
  所有开发都能直接登生产
  → 最小权限，生产只通过 CI/CD 接触

反模式 4：没有变更记录
  "线上什么时候改的？谁改的？不知道"
  → 每次部署有记录（commit/时间/人/环境）
\`\`\`

## 九、CI/CD 健康度自检清单

\`\`\`
CI 部分：
  [ ] push 后 5 分钟内出测试结果
  [ ] CI 缓存生效，重复构建 < 3 分钟
  [ ] 测试覆盖率有门禁（如 > 80%）
  [ ] lint / 类型检查 必过才能合并
  [ ] CI 红了 1 小时内有人修
  [ ] PR 必须过 CI + review 才能合并
  [ ] 定期清理旧 artifact / 缓存

CD 部分：
  [ ] 镜像用 commit SHA / 语义版本，不用 latest
  [ ] 部署前自动跑测试
  [ ] 部署到 staging 自动，production 需审批
  [ ] 部署后有健康检查
  [ ] 失败自动回滚
  [ ] 回滚后能验证恢复
  [ ] 部署记录可追溯（谁/何时/哪个版本）
  [ ] 生产密钥用 protected + environment

监控部分：
  [ ] 部署后监控错误率 / 延迟
  [ ] 异常自动告警
  [ ] 告警能触发自动回滚（进阶）
  [ ] 有 on-call 值班机制
\`\`\`

## 十、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 密钥进命令参数 | run: cmd --token secret | 用 env 传 |
| 密钥不分级 | 所有环境用同一密钥 | 按环境隔离 + protected |
| 不轮换密钥 | 一用几年 | 定期轮换 + 灰度切换 |
| CI 取消部署 | deploy 开 cancel-in-progress | deploy 排队不取消 |
| 缓存 key 太宽 | key: pip | key 含 hashFiles |
| 缓存 venv 太大 | 缓存几百 MB | 只缓存 pip 下载 |
| Docker 层顺序错 | COPY . . 在前 | 依赖文件在前，代码在后 |
| 重试所有失败 | 测试失败也重试 | 仅环境性失败重试 |
| 重试无退避 | 立即重试 N 次 | 指数退避 |
| 通知太多 | 每 job 都通知 | 关键节点通知 |
| 通知到全员 | @channel | @ 责任人 |
| 用 latest tag | docker:latest | 用 SHA/版本 |
| 周五部署 | 周末出问题没人修 | 工作日早中段部署 |
| 无回滚部署 | 失败手动修 | 自动回滚 |
| 破坏性 migration | 一步删旧字段 | 分步迁移 |
| CI 红了不修 | 拖几天 | 1 小时内修或回滚 |
| 手动绕过 CI | 紧急直推 main | 走流程（可加速）|
| 生产权限太大 | 全员可登生产 | 最小权限 + CI/CD 接触 |

## 十一、系列总结

至此，Python 部署与运维教程全部 8 批章节完成。回顾整个系列：

### 11.1 全系列章节回顾

\`\`\`
第 1-2 批：基础部署
  - 服务器准备、SSH、系统配置
  - Python 环境管理、虚拟环境

第 3-4 批：进程管理
  - systemd、supervisor
  - 日志管理、定时任务

第 5-6 批：容器化
  - Docker 入门与进阶
  - docker-compose 多服务编排

第 7 批：应用服务器
  - Gunicorn（WSGI）
  - Uvicorn（ASGI）

第 8 批：CI/CD（本批）
  - CI/CD 概念
  - GitHub Actions / GitLab CI / Jenkins
  - 自动化部署流水线
  - 最佳实践与陷阱
\`\`\`

### 11.2 生产部署能力树

\`\`\`
Python 后端工程师的生产能力：

基础层：
  ├─ Linux 基础（命令、文件、权限）
  ├─ Python 环境（venv/poetry/pip）
  └─ Git 版本控制

部署层：
  ├─ 进程管理（systemd/supervisor）
  ├─ 应用服务器（Gunicorn/Uvicorn）
  ├─ 反向代理（Nginx）
  └─ 容器化（Docker/Compose）

运维层：
  ├─ 日志管理（收集/轮转/分析）
  ├─ 监控告警（Prometheus/Grafana）
  ├─ 性能调优（压测/瓶颈分析）
  └─ 安全加固（防火墙/SSH/HTTPS）

CI/CD 层（本系列终点）：
  ├─ 持续集成（自动测试/构建）
  ├─ 持续部署（自动发布/回滚）
  └─ 渐进式发布（蓝绿/金丝雀）

进阶方向：
  ├─ Kubernetes（编排）
  ├─ Service Mesh（Istio）
  ├─ GitOps（Argo CD）
  ├─ 可观测性（OpenTelemetry）
  └─ 混沌工程（Chaos Mesh）
\`\`\`

### 11.3 持续学习建议

\`\`\`
1. 实践为主
   - 自己搭一个完整项目（GitHub + Actions + 服务器）
   - 经历一次完整的"开发→CI→部署→监控→回滚"

2. 阅读优秀项目
   - 看大项目的 .github/workflows/ 怎么写
   - 看 FastAPI/Django 等项目的 CI 配置

3. 关注演进
   - GitHub Actions / GitLab CI 每年都有新功能
   - K8s / GitOps 是趋势
   - 关注 DORA 报告（年度 DevOps 状态）

4. 建立自己的工具箱
   - 收集常用的 workflow 模板
   - 沉淀团队的 CI/CD 规范
   - 总结踩过的坑
\`\`\`

### 11.4 一句话总结

\`\`\`
CI/CD 的本质：
  用自动化取代手动，用流程保障质量，用版本化保证可回滚。

  不是为了"酷"，而是为了：
  - 更快地交付价值（频率）
  - 更稳地运行服务（质量）
  - 更安心地应对故障（回滚）

  最终目标：让每次发布都 boring（无聊、无惊无险）。
  Boring is good.
\`\`\`

恭喜你完成整个 Python 部署与运维教程！希望这套知识能帮你构建出可靠、高效、自动化的生产部署体系。
`
  }
];
