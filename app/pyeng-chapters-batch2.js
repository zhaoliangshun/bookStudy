// =============================================================
// Python 工程化教程 - 第 2 批章节(配置文件)
// -------------------------------------------------------------
// 本批共 5 章,group 均为 "配置文件":
//   1. pyeng-config-intro    — 为什么需要配置文件
//   2. pyeng-config-ini      — INI 配置(configparser)
//   3. pyeng-config-yaml     — YAML 配置(PyYAML)
//   4. pyeng-config-toml     — TOML 配置(tomllib/tomli)
//   5. pyeng-config-compare  — 配置方案对比与最佳实践
//
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// content 开始/结束反引号不转义。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:为什么需要配置文件
  // =========================================================
  {
    id: "pyeng-config-intro",
    icon: "🗂️",
    title: "为什么需要配置文件",
    group: "配置文件",
    content: `# 为什么需要配置文件

## 一、从一个真实的灾难说起

### 1.1 把数据库密码硬编码到 Git 里发生了什么

2015 年,某创业公司一位初级工程师把生产环境的数据库密码直接写进了 Python 源文件,然后提交到了 GitHub 公共仓库。短短 4 小时内,自动化扫描机器人就抓到了这个凭据,攻击者清空了整个生产数据库,并勒索 2 个比特币。公司停业一周,损失超过百万。

这不是个案。每年都有大量公司因为"把会变的值硬编码到代码里"而出事。问题的根源不是"程序员粗心",而是**没有把"配置"从"代码"中分离出来**。

### 1.2 什么是硬编码

硬编码(Hardcoding)就是把本该可配置的值(数据库地址、API 密钥、超时时间、特性开关等)直接写死在源代码里。

看下面这段"反模式"代码:

\`\`\`python
# anti-pattern.py —— 硬编码的典型反面教材
import pymysql

def get_connection():
    # 全部写死,改一个字符都要重新发版
    return pymysql.connect(
        host="192.168.1.100",
        port=3306,
        user="prod_user",
        password="S3cretP@ss!2024",
        database="orders_db",
    )

def call_payment_api(order_id):
    # API 密钥写死,一旦泄漏全公司遭殃
    import requests
    resp = requests.post(
        "https://api.payment.com/v2/charge",
        headers={"Authorization": "Bearer sk_live_abc123xyz"},
        json={"order_id": order_id},
        timeout=30,  # 超时也写死
    )
    return resp.json()
\`\`\`

这段代码看起来"能跑",但暗藏五颗地雷:

| 地雷编号 | 问题 | 后果 |
|----------|------|------|
| 1 | 数据库地址写死 | 换台机器要改代码、重新发版 |
| 2 | 数据库密码写死 | 密码进 Git 历史,泄漏即灾难 |
| 3 | API 密钥写死 | 密钥泄漏,账单被刷爆 |
| 4 | 超时时间写死 | 网络抖动想调到 60 秒必须发版 |
| 5 | 所有环境共用一份代码 | 开发/测试/生产混用,事故频发 |

### 1.3 改一个值就要重新部署

硬编码最直接的成本是**部署成本**。假设你的服务已经上线,现在生产数据库要从 \`localhost\` 迁移到 \`db-cluster.internal\`,你需要:

1. 修改源代码里的 \`host="localhost"\` → \`host="db-cluster.internal"\`
2. 本地跑一遍测试
3. 提交代码、走 Code Review
4. CI/CD 流水线跑完(10~30 分钟)
5. 构建新镜像、推到镜像仓库
6. 滚动重启 K8s Pod
7. 灰度验证、全量发布

整个过程**至少 1 小时**,数据库迁移窗口期就白白浪费了。如果只是改一行配置,本应是**秒级生效**的事。

## 二、配置的本质:分离"会变的"和"不变的"

### 2.1 代码 vs 配置

软件由两部分组成:**逻辑**和**数据**。配置就是一种特殊的"数据"——它在不同环境、不同时间、不同客户那里会变,但代码逻辑是稳定的。

| 类型 | 例子 | 是否会变 | 放在哪 |
|------|------|----------|--------|
| 逻辑 | "订单金额 = 单价 × 数量 - 优惠" | 基本不变 | 代码 |
| 配置 | 数据库地址、API 密钥、超时时间 | 经常变 | 配置文件/环境变量 |
| 业务数据 | 用户、订单记录 | 持续变化 | 数据库 |

**配置的本质**:把"会变的"从"不变的"代码里抽离出来,让代码逻辑保持稳定,让可变值可以独立修改、独立部署、独立管理。

### 2.2 什么样的值应该作为配置

一个简单的判断标准:**这个值在不同环境(dev/test/staging/prod)下会不一样吗?** 如果会,就该是配置。

典型的配置项:

\`\`\`text
# 基础设施类
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379/0
KAFKA_BROKERS=kafka1:9092,kafka2:9092

# 第三方服务类
STRIPE_API_KEY=sk_live_xxx
SENDGRID_API_KEY=SG.xxx
AWS_ACCESS_KEY_ID=AKIAxxx

# 运行参数类
LOG_LEVEL=INFO
HTTP_TIMEOUT=30
MAX_CONNECTIONS=100
RATE_LIMIT_PER_MIN=60

# 业务开关类
FEATURE_NEW_CHECKOUT_ENABLED=true
FEATURE_DARK_MODE_ENABLED=false
AB_TEST_VARIANT=b

# 多环境差异类
ENVIRONMENT=production
DEBUG=false
\`\`\`

### 2.3 什么样的值不应该作为配置

反过来,**业务规则的核心逻辑**不该作为配置。比如:

\`\`\`python
# 反例:把业务规则过度配置化
config = {
    "discount_rule": "lambda price, qty: price * qty * 0.9 if qty > 10 else price * qty",
    # 不要把代码逻辑塞进配置,这会让系统无法维护
}

# 正例:逻辑留在代码,参数留在配置
DISCOUNT_THRESHOLD = config.getint("discount", "threshold")  # 10
DISCOUNT_RATE = config.getfloat("discount", "rate")          # 0.9

def calculate_price(price, qty):
    if qty > DISCOUNT_THRESHOLD:
        return price * qty * DISCOUNT_RATE
    return price * qty
\`\`\`

**经验法则**:配置是"值",不是"逻辑"。如果你的配置项需要写 \`lambda\` 或条件分支,说明你把代码塞进了配置,这通常是个坏味道。

## 三、配置的五大层次

工业级应用的配置通常分五个层次,**优先级从低到高**,后者覆盖前者。

### 3.1 层次总览

\`\`\`text
┌─────────────────────────────────────────────┐
│ ① 代码内默认值                                │  ← 最稳定,作为兜底
│   DEFAULT_TIMEOUT = 30                       │
├─────────────────────────────────────────────┤
│ ② 配置文件 (yaml/toml/ini)                   │  ← 项目级,覆盖默认
│   config.yaml: timeout: 60                   │
├─────────────────────────────────────────────┤
│ ③ 环境变量                                    │  ← 部署级,覆盖配置文件
│   export TIMEOUT=90                          │
├─────────────────────────────────────────────┤
│ ④ 命令行参数                                  │  ← 临时级,覆盖环境变量
│   python app.py --timeout=120                │
├─────────────────────────────────────────────┤
│ ⑤ 远程配置中心 (Apollo/Nacos/Consul)         │  ← 运行时动态
│   运行时拉取,无需重启                          │
└─────────────────────────────────────────────┘
\`\`\`

### 3.2 第一层:代码内默认值

这是最稳定的一层,作为"兜底"。即使没有任何外部配置,程序也能跑起来。

\`\`\`python
# defaults.py
class Defaults:
    DB_HOST = "localhost"
    DB_PORT = 5432
    DB_USER = "postgres"
    DB_PASSWORD = ""           # 默认空,强制从环境变量读取
    DB_NAME = "app_db"
    LOG_LEVEL = "INFO"
    HTTP_TIMEOUT = 30
    MAX_CONNECTIONS = 10
\`\`\`

**关键原则**:默认值要"安全"。开发环境的默认值绝不能是生产环境的密码。敏感信息(密码、密钥)的默认值应该为空,强制走环境变量。

### 3.3 第二层:配置文件

项目根目录放一份 \`config.yaml\` / \`config.toml\` / \`config.ini\`,覆盖代码默认值。

\`\`\`yaml
# config.yaml
database:
  host: db.internal
  port: 5432
  user: app_user
  password: \${DB_PASSWORD}   # 引用环境变量,不写死
  name: app_db

logging:
  level: DEBUG

http:
  timeout: 60
  max_connections: 50
\`\`\`

### 3.4 第三层:环境变量

部署到容器/K8s 时,通过环境变量覆盖配置文件。这是 **Twelve-Factor App** 推荐的方式。

\`\`\`bash
# 容器启动时注入
docker run -e DB_HOST=prod-db.internal -e LOG_LEVEL=WARNING my-app

# K8s ConfigMap/Secret
env:
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: db_host
\`\`\`

### 3.5 第四层:命令行参数

临时调试时通过命令行覆盖,优先级最高(仅次于配置中心)。

\`\`\`bash
python app.py --log-level=DEBUG --http-timeout=120
\`\`\`

### 3.6 第五层:远程配置中心

大型分布式系统使用 Apollo、Nacos、Consul、etcd 等配置中心,**运行时动态拉取**,无需重启服务。

\`\`\`python
# 伪代码:从 Apollo 拉取配置
from apollo_client import ApolloClient

client = ApolloClient(app_id="my-app", config_server="http://apollo.internal")
client.start()  # 后台线程持续监听配置变更

# 配置变更时回调
def on_config_change(event):
    print(f"配置变更: {event.key} = {event.new_value}")
    # 热更新连接池大小、限流阈值等

client.add_change_listener(on_config_change)
\`\`\`

### 3.7 层次优先级对照表

| 层次 | 来源 | 修改成本 | 生效速度 | 适用场景 |
|------|------|----------|----------|----------|
| ① 代码默认值 | 源码常量 | 高(改代码+发版) | 重启后 | 兜底值 |
| ② 配置文件 | yaml/toml/ini | 中(改文件+重启) | 重启后 | 项目级配置 |
| ③ 环境变量 | OS/Docker/K8s | 低(改 env) | 重启后 | 部署差异化 |
| ④ 命令行参数 | CLI | 极低 | 启动时 | 临时调试 |
| ⑤ 配置中心 | Apollo/Nacos | 极低(改 UI) | 实时 | 动态调优 |

## 四、The Twelve-Fator App 的配置原则

### 4.1 什么是 Twelve-Factor App

2011 年,Heroku 联合创始人 Adam Wiggins 总结了 12 条现代 SaaS 应用的工程原则,称为 **The Twelve-Factor App**。其中第三条专门讲配置:

> **III. Config**:Store config in the environment.
> 配置应该存储在环境中,而不是代码里。

### 4.2 严格环境变量派的核心主张

Twelve-Factor 派认为:

1. **代码和配置严格分离**:代码可以进 Git,配置绝不能进 Git。
2. **配置走环境变量**:不依赖任何配置文件,所有可变值通过 \`ENV\` 注入。
3. **同一份镜像跑所有环境**:开发、测试、生产用同一个 Docker 镜像,只是 env 不同。

\`\`\`dockerfile
# Dockerfile —— 同一份镜像跑所有环境
FROM python:3.12-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
# 镜像里没有任何环境相关配置,全部靠运行时 env 注入
\`\`\`

\`\`\`bash
# 启动时通过 env 区分环境
docker run -e ENVIRONMENT=prod -e DB_URL=... my-app:latest
docker run -e ENVIRONMENT=dev  -e DB_URL=... my-app:latest
\`\`\`

### 4.3 严格环境变量派的局限

但纯环境变量也有不足:

| 问题 | 说明 |
|------|------|
| 不支持复杂结构 | 环境变量是扁平的字符串,无法表达嵌套对象/列表 |
| 不便版本化 | 环境变量散落在 K8s YAML/CI 配置里,没有统一版本 |
| 类型缺失 | 所有值都是字符串,要自己转 int/bool/list |
| 难以审计 | 谁改了哪个环境变量?何时改的?很难追溯 |
| 不适合复杂配置 | 微服务的路由规则、限流策略等很难用 env 表达 |

### 4.4 折中派:配置文件 + 环境变量

工业界普遍采用折中方案:

- **非敏感的结构化配置** → 配置文件(yaml/toml)
- **敏感信息(密码、密钥)** → 环境变量 + Secret Manager
- **环境差异(开发/生产)** → 配置文件分环境 + env 选择

\`\`\`text
project/
├── config/
│   ├── base.yaml          # 公共配置
│   ├── development.yaml   # 开发覆盖
│   ├── staging.yaml       # 预发覆盖
│   └── production.yaml    # 生产覆盖
├── .env.example           # 环境变量模板(进 Git)
└── .env                   # 本地环境变量(不进 Git)
\`\`\`

## 五、配置文件格式之争

### 5.1 五大主流格式

| 格式 | 诞生年份 | 主要推动者 | Python 支持 | 典型场景 |
|------|----------|------------|-------------|----------|
| INI | 1980s | Windows | 标准库 configparser | 简单两段配置、Git 配置 |
| JSON | 2001 | Douglas Crockford | 标准库 json | API 数据交换、package.json |
| YAML | 2001 | Clark Evans | PyYAML | K8s/Docker/GitHub Actions |
| TOML | 2013 | Tom Preston-Werner | tomllib(3.11+)/tomli | pyproject.toml |
| 环境变量 | 1970s | Unix | os.environ | 部署配置、敏感信息 |

### 5.2 各格式速览

**INI**:最古老,简单直观,但只支持两层、值都是字符串。

\`\`\`ini
[database]
host = localhost
port = 5432
\`\`\`

**JSON**:Web 时代标准,机器友好,但不支持注释,人写累。

\`\`\`json
{
  "database": {
    "host": "localhost",
    "port": 5432
  }
}
\`\`\`

**YAML**:缩进表达层级,人类友好,但缩进敏感、规范复杂。

\`\`\`yaml
database:
  host: localhost
  port: 5432
\`\`\`

**TOML**:类型明确、规范简单,Python 官方推荐,但生态较新。

\`\`\`toml
[database]
host = "localhost"
port = 5432
\`\`\`

**环境变量**:扁平字符串,部署友好,但不适合复杂结构。

\`\`\`bash
DB_HOST=localhost
DB_PORT=5432
\`\`\`

### 5.3 选择决策速查

\`\`\`text
是不是 Python 项目元数据(pyproject)?
├─ 是 → TOML
└─ 否 → 配置复杂吗?
         ├─ 简单两段 → INI
         ├─ 复杂嵌套,需要注释 → YAML 或 TOML
         │   ├─ 团队熟悉 YAML → YAML
         │   └─ 想要类型安全 → TOML
         └─ 跨语言 API → JSON
\`\`\`

## 六、配置管理常见反模式

### 6.1 反模式一:配置文件进 Git

\`\`\`text
# .gitignore 错误示范
!config/production.yaml   # 把生产配置提交到 Git
\`\`\`

**正确做法**:\`config/production.yaml\` 进 Git,但**敏感值用占位符**,真实值从环境变量注入。

\`\`\`yaml
# config/production.yaml(进 Git)
database:
  host: prod-db.internal
  password: \${DB_PASSWORD}   # 占位符,真值在环境变量
\`\`\`

### 6.2 反模式二:多环境配置散落各处

\`\`\`text
# 反模式:开发环境配置散落在 5 个地方
- 代码常量
- config.yaml
- docker-compose.yml 的 environment 段
- K8s ConfigMap
- CI/CD 变量
\`\`\`

**正确做法**:建立"单一配置源"(Single Source of Truth),其他地方只引用,不重复定义。

### 6.3 反模式三:配置不校验

\`\`\`python
# 反模式:直接用,出错运行时才暴露
port = int(os.environ["PORT"])   # 如果 PORT="abc" 会崩
\`\`\`

**正确做法**:用 pydantic 校验配置,启动时就把错误暴露出来。

\`\`\`python
from pydantic import BaseModel, Field, ValidationError

class AppConfig(BaseModel):
    port: int = Field(ge=1, le=65535)   # 1~65535

try:
    config = AppConfig(port=os.environ.get("PORT", 8000))
except ValidationError as e:
    print(f"配置错误: {e}")
    sys.exit(1)
\`\`\`

### 6.4 反模式四:配置无版本

测试环境用 v1 配置,生产环境用 v2 配置,出 bug 时找不到对应配置版本。

**正确做法**:配置文件随代码一起进 Git,版本号一致;远程配置中心也要有版本管理。

## 七、配置安全红线

### 7.1 三条铁律

1. **密码、密钥、Token 绝不进 Git**。一旦提交,即使删除也能从历史里翻出来。
2. **生产环境的密钥不进开发环境**。开发同学不该看到生产数据库密码。
3. **密钥要有轮换机制**。定期更换,泄漏后能快速作废。

### 7.2 敏感信息管理工具

| 工具 | 类型 | 适用场景 |
|------|------|----------|
| AWS Secrets Manager | 云服务 | AWS 生态 |
| HashiCorp Vault | 自建 | 跨云统一密钥管理 |
| Docker Secrets | 容器原生 | Docker Swarm |
| K8s Secrets + Sealed Secrets | K8s 原生 | K8s 部署 |
| SOPS | 开源 | 加密配置文件进 Git |
| Doppler | SaaS | 一站式密钥管理 |

### 7.3 检测密钥泄漏

用工具扫描代码,防止密钥意外提交:

\`\`\`bash
# pre-commit 钩子
pip install pre-commit detect-secrets

# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
\`\`\`

GitHub 也提供 **Secret Scanning** 功能,推送代码时自动检测已知格式的密钥并告警。

## 八、一个完整案例:配置改造

### 8.1 改造前

\`\`\`python
# app.py —— 反模式
import pymysql
import requests

DB_HOST = "192.168.1.100"
DB_PORT = 3306
DB_USER = "prod_user"
DB_PASSWORD = "S3cretP@ss!"
API_KEY = "sk_live_abc123"
TIMEOUT = 30

def main():
    conn = pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER,
                           password=DB_PASSWORD, database="orders")
    # ...
\`\`\`

### 8.2 改造后

\`\`\`yaml
# config/base.yaml
database:
  host: localhost
  port: 5432
  user: postgres
  name: orders

http:
  timeout: 30
\`\`\`

\`\`\`python
# app.py —— 改造后
import os
import yaml
from pydantic import BaseModel

class DatabaseConfig(BaseModel):
    host: str
    port: int = 5432
    user: str
    password: str   # 从环境变量注入
    name: str

class AppConfig(BaseModel):
    database: DatabaseConfig
    api_key: str
    http_timeout: int = 30

def load_config():
    with open("config/base.yaml") as f:
        data = yaml.safe_load(f)
    # 环境变量覆盖敏感值
    data["database"]["password"] = os.environ["DB_PASSWORD"]
    data["api_key"] = os.environ["API_KEY"]
    return AppConfig(**data)  # 启动时校验

def main():
    config = load_config()  # 校验失败立即退出,不会带病启动
    # ...
\`\`\`

### 8.3 改造收益对照

| 指标 | 改造前 | 改造后 |
|------|--------|--------|
| 改数据库地址耗时 | 1 小时(改码+发版) | 1 分钟(改 yaml+重启) |
| 密钥泄漏风险 | 极高(进 Git) | 极低(走环境变量) |
| 配置错误发现时机 | 运行时 | 启动时(pydantic 校验) |
| 多环境复用代码 | 不能 | 能 |
| 配置可审计性 | 无(Git diff 看代码) | 强(配置变更独立追踪) |

## 九、本章小结

### 9.1 核心要点

1. **配置的本质**是把"会变的"从"不变的"代码里分离出来。
2. **配置有五个层次**,优先级:代码默认 < 配置文件 < 环境变量 < 命令行 < 配置中心。
3. **Twelve-Factor 推荐环境变量**,但工业界普遍采用"配置文件 + 环境变量"折中方案。
4. **五大格式各有优劣**:INI 简单、JSON 通用、YAML 灵活、TOML 类型安全、env 部署友好。
5. **安全红线**:密钥绝不进 Git,生产密钥不进开发环境,密钥要能轮换。

### 9.2 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 把密码写进配置文件 | \`password: abc123\` | \`password: \${DB_PASSWORD}\` |
| 配置文件进 Git 包含密钥 | 直接提交生产 yaml | 占位符 + .gitignore 真值 |
| 多环境共用一份配置 | 改代码切环境 | 分环境 yaml + env 选择 |
| 配置不校验 | 启动后运行时才崩 | pydantic 启动时校验 |
| 把逻辑塞进配置 | \`"rule": "lambda x: ..."\` | 逻辑留代码,值进配置 |
| 默认值是生产密码 | \`DEFAULT_PASS = "prod123"\` | 默认值留空,强制 env |
| 同一配置散落多处 | yaml + docker-compose + CI 各写一份 | 单一配置源 + 引用 |
| 配置无版本 | 远程配置改了不留痕 | 配置中心开版本管理 |

### 9.3 后续章节预告

接下来的四章会逐一深入 INI、YAML、TOML 三种主流配置文件格式,讲解它们的语法、Python 库用法、优缺点和最佳实践,最后用一章做横向对比和决策建议。`,
  },

  // =========================================================
  // 第二章:INI 配置(configparser)
  // =========================================================
  {
    id: "pyeng-config-ini",
    icon: "📄",
    title: "INI 配置(configparser)",
    group: "配置文件",
    content: `# INI 配置(configparser)

## 一、INI 格式简介

### 1.1 INI 的历史

INI 文件起源于 1980 年代的 Windows 系统,文件名通常是 \`program.ini\`(INI = INItialization)。早期 Windows 大量用 INI 存储配置,后来注册表和 XML 取代了它,但 INI 因其**简单直观**的格式被保留下来,在开源世界依然广泛使用。

### 1.2 典型应用场景

| 场景 | 例子 |
|------|------|
| Git 配置 | \`.git/config\`、\`~/.gitconfig\` |
| Mercurial 配置 | \`.hgrc\` |
| Python 项目元数据(旧) | \`setup.cfg\` |
| pytest 配置 | \`pytest.ini\` |
| mypy 配置 | \`.mypy.ini\` |
| Windows 启动文件 | \`boot.ini\`、\`win.ini\` |
| 桌面应用 | 各种 .ini 配置 |

### 1.3 INI 格式示例

\`\`\`ini
# config.ini —— 一个典型的 INI 配置文件
; 也可以用分号注释
[database]
host = localhost
port = 5432
user = postgres
password = secret
database = app_db

[logging]
level = INFO
format = %(asctime)s - %(name)s - %(levelname)s - %(message)s
file = /var/log/app.log

[features]
enable_signup = true
enable_dark_mode = false
max_upload_size = 10485760
\`\`\`

## 二、INI 文件格式语法详解

### 2.1 段(section)

INI 用方括号包裹的字符串表示"段",段下面到下一个段之前的所有键值对都属于该段。

\`\`\`ini
[server]
host = 0.0.0.0
port = 8080

[client]
timeout = 30
retry = 3
\`\`\`

- 段名区分大小写(取决于解析器,Python configparser 默认不区分)
- 段名必须独占一行
- 段名不能包含 \`[\` 和 \`]\`

### 2.2 键值对(key = value)

\`\`\`ini
key = value
\`\`\`

- 等号 \`=\` 两侧的空格会被忽略
- 键名**不区分大小写**(configparser 默认会把键名转小写)
- 值都是**字符串**(后面会讲怎么转换类型)
- 等号可以用 \`:\` 代替

\`\`\`ini
# 下面两种写法等价
host = localhost
host : localhost
\`\`\`

### 2.3 注释

INI 支持两种注释符号:\`#\` 和 \`;\`。

\`\`\`ini
# 这是注释
; 这也是注释
host = localhost  # 行内注释(configparser 默认不支持,需开启)
\`\`\`

**坑点**:configparser 默认不支持行内注释,必须开启 \`inline_comment_prefixes\`:

\`\`\`python
config = configparser.ConfigParser(inline_comment_prefixes=("#", ";"))
\`\`\`

### 2.4 值的引号

INI 的值都是字符串,引号会被**当作值的一部分**保留,而不是用来"去引号"。

\`\`\`ini
name = "Alice"
\`\`\`

configparser 读取后,值是 \`"Alice"\`(带引号),不是 \`Alice\`。这点和 JSON/YAML 完全不同,新手很容易踩坑。

如果想去掉引号,需要自己处理:

\`\`\`python
name = config["user"]["name"].strip('"').strip("'")
\`\`\`

### 2.5 多行值

如果值很长(比如 SQL 语句、证书),可以用**缩进续行**实现多行。

\`\`\`ini
[query]
sql = SELECT *
      FROM users
      WHERE age > 18
      ORDER BY name

[certificate]
pem = -----BEGIN CERTIFICATE-----
      MIIDazCCAlOgAwIBAgIUW8r2yQ==
      -----END CERTIFICATE-----
\`\`\`

**规则**:续行必须比 \`key =\` 缩进更多(任何空格数都行)。

### 2.6 类型(都是字符串)

INI 的所有值都是字符串,即使你写 \`port = 5432\`,读取出来也是 \`"5432"\`(字符串)。

\`\`\`python
import configparser

config = configparser.ConfigParser()
config.read("config.ini")

port = config["database"]["port"]
print(port)            # "5432"
print(type(port))      # <class 'str'>
print(port + 1)        # TypeError: can only concatenate str
\`\`\`

要用整数必须显式转换:

\`\`\`python
port = config.getint("database", "port")  # 5432,int 类型
\`\`\`

### 2.7 默认段 DEFAULT

INI 有一个特殊的 \`DEFAULT\` 段,所有其他段都会继承它的键。

\`\`\`ini
[DEFAULT]
timeout = 30
retry = 3

[server_a]
host = a.internal

[server_b]
host = b.internal
\`\`\`

\`server_a\` 和 \`server_b\` 都自动拥有 \`timeout = 30\` 和 \`retry = 3\`。

\`\`\`python
config["server_a"]["timeout"]   # "30",继承自 DEFAULT
config["server_b"]["retry"]     # "3",继承自 DEFAULT
\`\`\`

### 2.8 变量插值(interpolation)

configparser 支持**变量插值**——在一个值里引用另一个值,使用 \`%(key)s\` 语法。

\`\`\`ini
[paths]
base = /opt/app
log = %(base)s/logs
data = %(base)s/data
tmp = %(base)s/tmp
\`\`\`

\`\`\`python
config["paths"]["log"]   # "/opt/app/logs"
config["paths"]["data"]  # "/opt/app/data"
\`\`\`

configparser 内置两种插值风格:
- \`BasicInterpolation\`(默认):\`%(key)s\` 语法
- \`ExtendedInterpolation\`:\`\${section:key}\` 语法,可跨段引用

\`\`\`python
config = configparser.ConfigParser(
    interpolation=configparser.ExtendedInterpolation()
)
\`\`\`

\`\`\`ini
[common]
base = /opt/app

[paths]
log = \${common:base}/logs   # 跨段引用
\`\`\`

## 三、Python configparser 模块详解

### 3.1 创建 ConfigParser 对象

\`\`\`python
import configparser

# 默认配置
config = configparser.ConfigParser()

# 常用可选参数
config = configparser.ConfigParser(
    delimiters=("=", ":"),                  # 键值分隔符
    comment_prefixes=("#", ";"),             # 行首注释符
    inline_comment_prefixes=("#",),          # 行内注释符(默认不开)
    strict=True,                             # 严格模式,重复键报错
    empty_lines_in_values=False,             # 值中是否允许空行
    default_section="DEFAULT",               # 默认段名
    interpolation=configparser.BasicInterpolation(),
)
\`\`\`

### 3.2 读取配置文件

\`\`\`python
# 读取单个文件
config.read("config.ini")

# 读取多个文件(后面的覆盖前面,适合做"默认 + 覆盖")
config.read(["config/default.ini", "config/local.ini"])

# 检查是否读取成功(read 返回实际成功读取的文件列表)
files = config.read("not_exist.ini")
if not files:
    print("配置文件不存在!")
\`\`\`

**注意**:\`read()\` 不会抛 FileNotFoundError,文件不存在时静默返回空列表。如果要严格检查,用 \`read_file()\`:

\`\`\`python
with open("config.ini") as f:
    config.read_file(f)   # 文件不存在会抛异常
\`\`\`

### 3.3 从字符串读取

\`\`\`python
from io import StringIO

config_string = """
[server]
host = localhost
port = 8080
"""

config = configparser.ConfigParser()
config.read_file(StringIO(config_string))
\`\`\`

### 3.4 访问配置值

#### 字典风格(推荐)

\`\`\`python
config["server"]["host"]                # "localhost"
config["server"]["port"]                # "8080"(字符串)
config["server"].get("port", "8080")    # 带默认值
\`\`\`

#### 方法风格

\`\`\`python
config.get("server", "host")                       # 字符串
config.get("server", "host", fallback="0.0.0.0")   # 带默认值
config.getint("server", "port")                    # int
config.getfloat("server", "timeout")               # float
config.getboolean("server", "enabled")             # bool
\`\`\`

### 3.5 类型转换方法

configparser 提供四个类型转换方法:

| 方法 | 返回类型 | 接受的值(以 boolean 为例) |
|------|----------|----------------------------|
| \`getint()\` | int | "1", "2", "-3" |
| \`getfloat()\` | float | "1.5", "3.14", "2" |
| \`getboolean()\` | bool | "yes"/"no", "on"/"off", "true"/"false", "1"/"0"(大小写不敏感) |
| \`get()\` | str | 任意字符串 |

\`\`\`python
config.getboolean("features", "enable_signup")
# 接受: yes/no, on/off, true/false, 1/0(不区分大小写)
# 其他值抛 ValueError
\`\`\`

**坑点**:\`getboolean\` 不接受 \`"True"\`/ \`"False"\` 之外的大小写混合,也不接受 \`"y"\`/ \`"n"\`。如果配置里写 \`enable = Y\`,会抛异常。

### 3.6 默认值 fallback

\`\`\`python
# 方法 1:fallback 参数
host = config.get("server", "host", fallback="0.0.0.0")

# 方法 2:dict.get
host = config["server"].get("host", "0.0.0.0")

# 方法 3:DEFAULT 段
[DEFAULT]
host = 0.0.0.0

# 方法 4:setdefault
config["server"]["host"] = config["server"].get("host", "0.0.0.0")
\`\`\`

### 3.7 检查段和键

\`\`\`python
# 检查段是否存在
"server" in config               # True

# 检查键是否存在
"host" in config["server"]       # True

# 列出所有段(不含 DEFAULT)
config.sections()                # ['server', 'client']

# 列出某段所有键
list(config["server"].keys())    # ['host', 'port']

# 列出某段所有键值对
list(config["server"].items())
\`\`\`

### 3.8 修改和写入

\`\`\`python
# 修改值
config["server"]["host"] = "0.0.0.0"
config["server"]["port"] = "9090"   # 注意必须是字符串

# 新增段
config["new_section"] = {
    "key1": "value1",
    "key2": "value2",
}

# 删除段或键
config.remove_option("server", "port")
config.remove_section("new_section")

# 写入文件
with open("config.ini", "w") as f:
    config.write(f)
\`\`\`

写入后的格式:

\`\`\`ini
[server]
host = 0.0.0.0

[new_section]
key1 = value1
key2 = value2
\`\`\`

## 四、完整实战:用户管理系统配置

### 4.1 配置文件

\`\`\`ini
# config.ini
[DEFAULT]
retry = 3
timeout = 30

[database]
host = db.internal
port = 5432
user = app_user
password = secret
database = users
pool_size = 10
max_overflow = 20

[redis]
host = cache.internal
port = 6379
db = 0
password = cache_secret

[logging]
level = INFO
format = %(asctime)s [%(levelname)s] %(name)s: %(message)s
file = /var/log/app/app.log
max_size = 104857600
backup_count = 10

[features]
enable_signup = true
enable_oauth = false
max_upload_size = 52428800

[oauth]
google_client_id = xxx.apps.googleusercontent.com
google_client_secret = google_secret
github_client_id = Iv1.xxxxx
github_client_secret = github_secret
\`\`\`

### 4.2 读取代码

\`\`\`python
import configparser
from pathlib import Path

class Config:
    def __init__(self, path="config.ini"):
        self.config = configparser.ConfigParser(
            interpolation=configparser.ExtendedInterpolation()
        )
        files = self.config.read(path)
        if not files:
            raise FileNotFoundError(f"配置文件 {path} 不存在")

    @property
    def db(self):
        return DatabaseConfig(self.config)

    @property
    def redis(self):
        return RedisConfig(self.config)

    @property
    def log(self):
        return LogConfig(self.config)


class DatabaseConfig:
    def __init__(self, config):
        section = config["database"]
        self.host = section["host"]
        self.port = section.getint("port")
        self.user = section["user"]
        self.password = section["password"]
        self.database = section["database"]
        self.pool_size = section.getint("pool_size")
        self.max_overflow = section.getint("max_overflow")
        self.retry = section.getint("retry", fallback=3)   # 继承自 DEFAULT
        self.timeout = section.getint("timeout", fallback=30)

    @property
    def url(self):
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"


class RedisConfig:
    def __init__(self, config):
        section = config["redis"]
        self.host = section["host"]
        self.port = section.getint("port")
        self.db = section.getint("db")
        self.password = section["password"]


class LogConfig:
    def __init__(self, config):
        section = config["logging"]
        self.level = section["level"]
        self.format = section["format"]
        self.file = section["file"]
        self.max_size = section.getint("max_size")
        self.backup_count = section.getint("backup_count")


# 使用
config = Config()
print(config.db.url)
# postgresql://app_user:secret@db.internal:5432/users

print(config.db.retry)        # 3(继承 DEFAULT)
print(config.log.level)       # INFO
\`\`\`

### 4.3 多环境配置

\`\`\`python
import os
import configparser

def load_config(env=None):
    env = env or os.environ.get("APP_ENV", "development")
    config = configparser.ConfigParser()
    # 先读默认,再读环境特定(后者覆盖前者)
    config.read([
        "config/default.ini",
        f"config/{env}.ini",
        "config/local.ini",   # 本地覆盖,不进 Git
    ])
    return config

# 通过环境变量切换
config = load_config("production")
\`\`\`

## 五、INI 的优点与缺点

### 5.1 优点

| 优点 | 说明 |
|------|------|
| 简单直观 | 一眼就能看懂,学习成本几乎为零 |
| 标准库支持 | 不用装第三方包,\`import configparser\` 即可 |
| 人类友好 | 比 JSON 易读,比 YAML 简单 |
| 注释支持 | 原生支持 \`#\` 和 \`;\` 注释 |
| Git 友好 | 文本格式,便于 diff |
| 历史悠久 | 大量工具(Git、pytest、mypy)用 INI |

### 5.2 缺点

| 缺点 | 说明 |
|------|------|
| 只支持两层 | 段 + 键值对,无法表达更深的嵌套 |
| 值都是字符串 | 必须手动 \`getint/getfloat/getboolean\` |
| 无数组 | 不能写 \`hosts = [a, b, c]\`,只能用逗号分隔字符串 |
| 无原生日期类型 | 日期只能当字符串存 |
| 表达力有限 | 复杂配置(微服务路由、限流规则)力不从心 |
| 规范不统一 | 不同解析器行为有差异(注释、引号、大小写) |

### 5.3 INI 的能力边界

\`\`\`text
能表达:
  ✓ 二层结构(section.key = value)
  ✓ 字符串值
  ✓ 多行字符串(缩进续行)
  ✓ 默认值(DEFAULT 段)
  ✓ 变量插值(%(key)s 或 \${section:key})
  ✓ 注释

不能表达:
  ✗ 三层及更深嵌套
  ✗ 数组/列表
  ✗ 嵌套对象
  ✗ 类型(int/float/bool/date 都要手动转)
  ✗ 复杂结构(比如 K8s Deployment 那种深度嵌套)
\`\`\`

## 六、configparser 常用方法速查

### 6.1 读取相关

| 方法 | 说明 | 示例 |
|------|------|------|
| \`read(filenames)\` | 读取文件,返回成功读取的列表 | \`config.read("a.ini")\` |
| \`read_file(f)\` | 从文件对象读取 | \`config.read_file(open("a.ini"))\` |
| \`read_string(s)\` | 从字符串读取 | \`config.read_string("[s]\\nk=v")\` |
| \`read_dict(d)\` | 从字典读取 | \`config.read_dict({"s": {"k": "v"}})\` |
| \`sections()\` | 列出所有段(不含 DEFAULT) | \`['s1', 's2']\` |
| \`has_section(s)\` | 段是否存在 | \`config.has_section("s")\` |
| \`has_option(s, k)\` | 键是否存在 | \`config.has_option("s", "k")\` |
| \`options(s)\` | 列出段的所有键 | \`['k1', 'k2']\` |
| \`items(s)\` | 列出段的所有键值对 | \`[('k1', 'v1'), ('k2', 'v2')]\` |
| \`get(s, k)\` | 获取字符串值 | \`config.get("s", "k")\` |
| \`getint(s, k)\` | 获取 int 值 | \`config.getint("s", "k")\` |
| \`getfloat(s, k)\` | 获取 float 值 | \`config.getfloat("s", "k")\` |
| \`getboolean(s, k)\` | 获取 bool 值 | \`config.getboolean("s", "k")\` |

### 6.2 修改相关

| 方法 | 说明 |
|------|------|
| \`add_section(s)\` | 新增段 |
| \`remove_section(s)\` | 删除段(返回 bool) |
| \`remove_option(s, k)\` | 删除键 |
| \`set(s, k, v)\` | 设置值(必须先有段) |
| \`write(f)\` | 写入文件 |

### 6.3 高级用法

\`\`\`python
# 1. 保留键名大小写(默认会转小写)
class CaseSensitiveParser(configparser.ConfigParser):
    def optionxform(self, optionstr):
        return optionstr   # 不转换

config = CaseSensitiveParser()
# 现在 MyKey 和 mykey 是不同的键

# 2. 自定义分隔符
config = configparser.ConfigParser(delimiters=("=",))  # 只允许 =

# 3. 启用行内注释
config = configparser.ConfigParser(inline_comment_prefixes=("#", ";"))

# 4. 禁用插值(避免 % 被特殊处理)
config = configparser.ConfigParser(interpolation=None)
# 写日志格式字符串 %(message)s 时很有用
\`\`\`

## 七、INI 与其他格式对照

### 7.1 同一份配置的多种写法

**INI 版**:

\`\`\`ini
[database]
host = localhost
port = 5432
users = alice,bob,charlie
\`\`\`

**YAML 版**:

\`\`\`yaml
database:
  host: localhost
  port: 5432
  users:
    - alice
    - bob
    - charlie
\`\`\`

**TOML 版**:

\`\`\`toml
[database]
host = "localhost"
port = 5432
users = ["alice", "bob", "charlie"]
\`\`\`

**JSON 版**:

\`\`\`json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "users": ["alice", "bob", "charlie"]
  }
}
\`\`\`

注意 INI 的 \`users\` 只能用逗号分隔的字符串,要自己 \`split(",")\` 转列表,而 YAML/TOML/JSON 都原生支持数组。

### 7.2 INI vs 其他格式

| 维度 | INI | YAML | TOML | JSON |
|------|-----|------|------|------|
| 嵌套层级 | 2 层 | 任意 | 任意 | 任意 |
| 数组 | 字符串模拟 | 原生 | 原生 | 原生 |
| 类型 | 全是字符串 | 丰富 | 丰富 | 丰富 |
| 注释 | 支持 | 支持 | 支持 | 不支持 |
| Python 标准库 | 是 | 否 | 是(3.11+) | 是 |
| 适合复杂配置 | 否 | 是 | 是 | 一般 |

## 八、INI 配置最佳实践

### 8.1 文件组织

\`\`\`text
config/
├── default.ini         # 默认配置(进 Git)
├── development.ini     # 开发环境(进 Git)
├── staging.ini         # 预发环境(进 Git)
├── production.ini      # 生产环境(进 Git,不含敏感值)
└── local.ini           # 本地覆盖(不进 Git,在 .gitignore)
\`\`\`

### 8.2 命名规范

- 段名用小写 + 下划线:\`[database]\`、\`[redis_cache]\`
- 键名用小写 + 下划线:\`max_retry_count\`
- 布尔值用 \`true\`/\`false\` 而不是 \`yes\`/\`no\`(更通用)
- 数值不要加引号:\`port = 5432\`(虽然都是字符串,但视觉上区分类型)

### 8.3 注释规范

\`\`\`ini
[database]
# 数据库主机地址,生产环境通过环境变量覆盖
host = localhost

# 端口号,范围 1-65535
port = 5432

# 连接池大小,建议 10-50
pool_size = 10
\`\`\`

### 8.4 校验配置

configparser 本身不校验类型和范围。建议封装一层:

\`\`\`python
class ConfigValidator:
    def __init__(self, config):
        self.config = config

    def get_int_in_range(self, section, key, min_val, max_val, default=None):
        val = self.config.getint(section, key, fallback=default)
        if not min_val <= val <= max_val:
            raise ValueError(
                f"{section}.{key} 必须在 {min_val}-{max_val} 之间,实际值 {val}"
            )
        return val

validator = ConfigValidator(config)
port = validator.get_int_in_range("database", "port", 1, 65535, 5432)
\`\`\`

## 九、常见错误排查

### 9.1 NoSectionError

\`\`\`python
config.get("not_exist", "key")
# configparser.NoSectionError: No section: 'not_exist'
\`\`\`

**原因**:段不存在。
**解决**:用 \`config.has_section()\` 检查,或用 \`fallback\` 提供默认值。

### 9.2 NoOptionError

\`\`\`python
config.get("database", "not_exist")
# configparser.NoOptionError: No option 'not_exist' in section: 'database'
\`\`\`

**原因**:键不存在。
**解决**:用 \`fallback\` 参数或 \`in\` 检查。

### 9.3 DuplicateOptionError

\`\`\`python
# config.ini
[server]
host = a
host = b   # 重复
\`\`\`

\`\`\`python
config.read("config.ini")
# configparser.DuplicateOptionError: While reading ... section 'server' option 'host' ...
\`\`\`

**原因**:\`strict=True\` 模式下不允许重复键。
**解决**:修复配置文件,或设 \`strict=False\`(不推荐)。

### 9.4 ValueError: 字符串转 int 失败

\`\`\`ini
[server]
port = abc
\`\`\`

\`\`\`python
config.getint("server", "port")
# ValueError: invalid literal for int() with base 10: 'abc'
\`\`\`

**原因**:值不是合法数字。
**解决**:校验配置文件内容。

### 9.5 getboolean 失败

\`\`\`ini
[features]
enable = Y
\`\`\`

\`\`\`python
config.getboolean("features", "enable")
# ValueError: Not a boolean: Y
\`\`\`

**原因**:\`getboolean\` 只接受 \`yes/no\`、\`on/off\`、\`true/false\`、\`1/0\`(不区分大小写)。
**解决**:配置文件改用 \`true\`/\`false\`,或自己写转换:

\`\`\`python
val = config["features"]["enable"].lower() in ("y", "yes", "true", "1")
\`\`\`

### 9.6 插值报错

\`\`\`ini
[logging]
format = %(asctime)s - %(message)s
\`\`\`

\`\`\`python
config["logging"]["format"]
# configparser.InterpolationSyntaxError: '%' must be followed by '%' or '('
\`\`\`

**原因**:configparser 默认会把 \`%\` 当插值符号。
**解决**:禁用插值,或转义为 \`%%\`:

\`\`\`python
# 方法 1:禁用插值
config = configparser.ConfigParser(interpolation=None)

# 方法 2:配置文件里写 %%
format = %%(asctime)s - %%(message)s
\`\`\`

## 十、本章小结

### 10.1 核心要点

1. **INI 格式简单**:段 + 键值对 + 注释,适合简单两段配置。
2. **Python 标准库 configparser**:开箱即用,无需第三方依赖。
3. **值都是字符串**:用 \`getint/getfloat/getboolean\` 转类型。
4. **支持插值**:\`%(key)s\` 或 \`\${section:key}\` 引用其他值。
5. **能力有限**:只能两层,无数组,不适合复杂配置。

### 10.2 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 值带引号 | \`name = "Alice"\` 期望得到 \`Alice\` | 实际得到 \`"Alice"\`(带引号),要自己 strip |
| 布尔值 | 写 \`enable = Y\` | 用 \`true\`/\`false\`/\`yes\`/\`no\`/\`1\`/\`0\` |
| 行内注释 | \`host = x # 注释\` 期望被忽略 | 默认不支持,需开 \`inline_comment_prefixes\` |
| 插值冲突 | 日志格式含 \`%s\` 报错 | 用 \`interpolation=None\` 或写 \`%%\` |
| 多环境配置 | 所有 env 写一个文件 | 分环境文件 + 多次 \`read()\` |
| 整数运算 | \`config['db']['port'] + 1\` | 用 \`getint()\` 转换 |
| 默认值缺失 | 直接 \`config['s']['k']\` 报 NoOptionError | 用 \`fallback\` 或 \`in\` 检查 |
| 键大小写 | 期望 \`Host\` 和 \`host\` 不同 | 默认全部转小写,要保留需重写 \`optionxform\` |
| 重复键 | 同一段内重复写同名键 | \`strict=True\` 会报错,删除重复项 |
| 数组模拟 | \`users = a,b,c\` 直接当数组用 | 要 \`split(",")\` 并 strip 空格 |

### 10.3 何时该用 INI

- 配置只有两层(section + key)
- 不需要数组、嵌套对象
- 项目想避免第三方依赖(只用标准库)
- 配置工具本身用 INI(pytest、mypy、git)

### 10.4 何时该换其他格式

- 配置有三层及以上嵌套 → YAML 或 TOML
- 需要数组/列表 → YAML 或 TOML
- 需要严格的类型校验 → TOML + pydantic
- 项目是现代 Python 包 → TOML(pyproject.toml)`,
  },

  // =========================================================
  // 第三章:YAML 配置(PyYAML)
  // =========================================================
  {
    id: "pyeng-config-yaml",
    icon: "📦",
    title: "YAML 配置(PyYAML)",
    group: "配置文件",
    content: `# YAML 配置(PyYAML)

## 一、YAML 格式简介

### 1.1 YAML 是什么

YAML(YAML Ain't Markup Language,递归缩写)是 2001 年由 Clark Evans、Ingy döt Net 和 Oren Ben-Kiki 共同设计的"人类友好"的数据序列化格式。它的设计目标是:

- **人类可读**:让人能直接读写,而不是为机器优化
- **表达力强**:支持嵌套、列表、混合结构
- **跨语言**:Python、Go、Java、JavaScript 都有成熟实现

### 1.2 YAML 的统治领域

YAML 在以下领域是事实标准:

| 领域 | 用途 |
|------|------|
| Kubernetes | 所有 K8s 资源对象(deployment.yaml、service.yaml) |
| Docker Compose | docker-compose.yml |
| GitHub Actions | .github/workflows/*.yml |
| GitLab CI/CD | .gitlab-ci.yml |
| Ansible | playbook.yml |
| Spring Boot | application.yml |
| Hugo/Jekyll | 站点配置 |
| OpenAPI | API 文档 |
| CI/CD 工具 | CircleCI、TravisCI、Drone |

如果你做云原生、DevOps、CI/CD,几乎不可能不接触 YAML。

### 1.3 YAML 示例

\`\`\`yaml
# app.yaml —— 一个完整的 Web 应用配置
app:
  name: user-service
  version: 2.1.0
  debug: false

server:
  host: 0.0.0.0
  port: 8080
  workers: 4
  timeout: 30

database:
  primary:
    host: db-master.internal
    port: 5432
    user: app
    password: \${DB_PASSWORD}
    pool_size: 20
  replica:
    - host: db-replica-1.internal
      port: 5432
    - host: db-replica-2.internal
      port: 5432

features:
  - name: new_checkout
    enabled: true
    rollout: 50%
  - name: dark_mode
    enabled: false

logging:
  level: INFO
  handlers:
    - type: file
      path: /var/log/app.log
      max_size: 100MB
    - type: stdout
\`\`\`

同样这份配置,如果用 JSON 写,会多一堆引号和花括号,可读性差很多。如果用 INI,根本表达不了这种深度嵌套。

## 二、YAML 语法详解

### 2.1 缩进表示层级(核心规则)

YAML 用**缩进**表示层级关系,**必须用空格,不能用 Tab**。

\`\`\`yaml
# 正确:用空格缩进
server:
  host: 0.0.0.0
  port: 8080
  ssl:
    enabled: true
    cert: /path/to/cert.pem

# 错误:用 Tab 缩进(YAML 不允许)
server:
\thost: 0.0.0.0   # 报错!
\`\`\`

**缩进规则**:
- 同级元素必须缩进相同空格数
- 缩进空格数不限(1、2、4 都行),但要一致
- 推荐用 **2 个空格**(社区主流)

### 2.2 key: value(冒号后有空格)

\`\`\`yaml
# 正确:冒号后有空格
host: localhost

# 错误:冒号后无空格(YAML 会把它当一个字符串 "host:localhost")
host:localhost
\`\`\`

这是 YAML 新手最常见的错误。冒号 + 空格才是分隔符,光冒号不行。

### 2.3 列表(- item)

\`\`\`yaml
# 行内写法
fruits:
  - apple
  - banana
  - cherry

# 缩进式写法(推荐)
fruits:
  - apple
  - banana
  - cherry

# 行内数组写法(类似 JSON)
fruits: [apple, banana, cherry]
\`\`\`

### 2.4 字典(对象)

\`\`\`yaml
# 多行写法
user:
  name: Alice
  age: 30
  email: alice@example.com

# 行内写法(类似 JSON)
user: {name: Alice, age: 30, email: alice@example.com}
\`\`\`

### 2.5 字典和列表嵌套

YAML 强大的地方在于任意嵌套:

\`\`\`yaml
servers:
  - name: web-1
    host: 10.0.0.1
    roles:
      - web
      - cache
    metadata:
      region: us-east-1
      az: a
  - name: web-2
    host: 10.0.0.2
    roles:
      - web
    metadata:
      region: us-east-1
      az: b
\`\`\`

对应 JSON:

\`\`\`json
{
  "servers": [
    {
      "name": "web-1",
      "host": "10.0.0.1",
      "roles": ["web", "cache"],
      "metadata": {"region": "us-east-1", "az": "a"}
    },
    {
      "name": "web-2",
      "host": "10.0.0.2",
      "roles": ["web"],
      "metadata": {"region": "us-east-1", "az": "b"}
    }
  ]
}
\`\`\`

### 2.6 多行字符串(| 和 >)

YAML 有两种多行字符串语法:

\`\`\`yaml
# | 保留换行(literal)
description: |
  这是第一行
  这是第二行
  这是第三行

# > 折叠换行(folded,空行变换行,单换行变空格)
summary: >
  这是一段很长的文字,
  YAML 会把换行折叠成空格,
  最终变成一行。
\`\`\`

读取结果:

\`\`\`python
{
    "description": "这是第一行\\n这是第二行\\n这是第三行\\n",
    "summary": "这是一段很长的文字, YAML 会把换行折叠成空格, 最终变成一行。\\n",
}
\`\`\`

变体:\`|-\` 和 \`>-\` 去掉末尾换行符,\`|+\` 和 \`>+\` 保留末尾空行。

\`\`\`yaml
text_strip: |-    # 末尾换行被去掉
  line1
  line2

text_keep: |+      # 末尾所有空行保留
  line1
  line2
\`\`\`

### 2.7 字符串引号

YAML 字符串通常不需要引号,但有些场景必须加:

\`\`\`yaml
# 不需要引号
host: localhost
port: 8080       # 数字
enabled: true    # 布尔

# 必须加引号的情况
version: "1.0"   # 想要字符串 "1.0" 而不是数字 1.0
answer: "yes"    # 想要字符串 "yes" 而不是布尔 True
date: "2024-01-01"  # 想要字符串而不是日期
path: "/usr/bin" # 以 / 开头有时需要引号
contains: "key: value"  # 包含特殊字符
\`\`\`

**坑点**:YAML 会把 \`yes\`、\`no\`、\`on\`、\`off\`、\`true\`、\`false\` 解析成布尔值。如果你想当字符串,必须加引号:

\`\`\`yaml
# 反例
gender: yes   # 解析成 True!
version: 1.0  # 解析成浮点数 1.0!

# 正例
gender: "yes"
version: "1.0"
\`\`\`

### 2.8 注释

YAML 用 \`#\` 注释,不支持多行注释,也不支持行内注释(实际上是支持的,但容易出错)。

\`\`\`yaml
# 这是整行注释
server:
  host: localhost  # 这是行内注释(可以,但要小心)
  port: 8080
\`\`\`

### 2.9 锚点与引用(& 和 *)

YAML 支持"锚点"和"引用",类似编程语言的变量。

\`\`\`yaml
# 定义锚点
defaults: &defaults
  timeout: 30
  retry: 3
  encoding: utf-8

# 引用锚点
development:
  <<: *defaults    # 合并 defaults 的所有键
  database: dev_db

production:
  <<: *defaults
  database: prod_db
  retry: 5         # 覆盖 defaults 的 retry
\`\`\`

读取结果:

\`\`\`python
{
    "development": {"timeout": 30, "retry": 3, "encoding": "utf-8", "database": "dev_db"},
    "production": {"timeout": 30, "retry": 5, "encoding": "utf-8", "database": "prod_db"},
}
\`\`\`

- \`&name\` 定义锚点
- \`*name\` 引用锚点(完整复制)
- \`<<: *name\` 合并锚点(把锚点的键合并到当前 map)

### 2.10 类型推断

YAML 会自动推断类型:

| 字面量 | 推断类型 | Python 类型 |
|--------|----------|-------------|
| \`42\` | 整数 | int |
| \`3.14\` | 浮点 | float |
| \`true\` / \`yes\` / \`on\` | 布尔 | bool |
| \`false\` / \`no\` / \`off\` | 布尔 | bool |
| \`null\` / \`~\` | 空 | None |
| \`2024-01-01\` | 日期 | datetime.date |
| \`2024-01-01T10:00:00\` | 时间 | datetime.datetime |
| \`hello\` | 字符串 | str |
| \`"1.0"\` | 字符串(引号强制) | str |

**坑点**:\`yes\`/\`no\`/\`on\`/\`off\` 被解析成布尔,曾经导致 GitHub Actions 不少 bug——分支名 \`on\` 被识别成布尔值。

## 三、PyYAML 模块详解

### 3.1 安装

\`\`\`bash
pip install pyyaml
\`\`\`

### 3.2 读取 yaml.safe_load()

\`\`\`python
import yaml

# 从字符串读取
config = yaml.safe_load("""
server:
  host: localhost
  port: 8080
""")
print(config)
# {'server': {'host': 'localhost', 'port': 8080}}

# 从文件读取
with open("config.yaml") as f:
    config = yaml.safe_load(f)
\`\`\`

### 3.3 safe_load vs load(极其重要)

PyYAML 提供两个加载函数:

| 函数 | 安全性 | 说明 |
|------|--------|------|
| \`yaml.safe_load()\` | 安全 | 只解析基本类型(dict/list/str/int...) |
| \`yaml.load(f, Loader=yaml.SafeLoader)\` | 安全 | 等价于 safe_load |
| \`yaml.load(f)\` | 危险 | **可执行任意 Python 代码!** |
| \`yaml.unsafe_load()\` | 危险 | 同上,显式声明 |

**绝对不要用 \`yaml.load()\` 不带 Loader**,这是严重的安全漏洞:

\`\`\`yaml
# evil.yaml —— 恶意 YAML
!!python/object/apply:os.system ["rm -rf /"]
\`\`\`

\`\`\`python
# 危险!会真的执行 rm -rf /
config = yaml.load(open("evil.yaml"))

# 安全(只解析基本类型)
config = yaml.safe_load(open("evil.yaml"))
# yaml.constructor.ConstructorError: could not determine a constructor for the tag 'tag:yaml.org,2002:python/object/apply:os.system'
\`\`\`

**结论**:**永远用 \`safe_load\`,永远不用 \`load\`**。

### 3.4 写入 yaml.safe_dump()

\`\`\`python
import yaml

config = {
    "server": {
        "host": "localhost",
        "port": 8080,
    },
    "features": ["signup", "login"],
}

# 写入字符串
yaml_str = yaml.safe_dump(config, default_flow_style=False, allow_unicode=True)
print(yaml_str)
# features:
# - login
# - signup
# server:
#   host: localhost
#   port: 8080

# 写入文件
with open("output.yaml", "w") as f:
    yaml.safe_dump(config, f, allow_unicode=True)
\`\`\`

常用参数:

| 参数 | 说明 | 默认值 |
|------|------|--------|
| \`default_flow_style\` | False 用块状(缩进式),True 用流式(JSON 风格) | False(Python 5.1+) |
| \`allow_unicode\` | 允许输出 Unicode(中文不转义) | False |
| \`sort_keys\` | 是否按键名排序 | True |
| \`indent\` | 缩进空格数 | 2 |
| \`width\` | 每行最大宽度 | 80 |

### 3.5 多文档支持(---)

YAML 支持一个文件里多个文档,用 \`---\` 分隔:

\`\`\`yaml
# multi.yaml
---
name: doc1
value: 1
---
name: doc2
value: 2
---
name: doc3
value: 3
\`\`\`

\`\`\`python
# safe_load_all 返回生成器
with open("multi.yaml") as f:
    for doc in yaml.safe_load_all(f):
        print(doc)
# {'name': 'doc1', 'value': 1}
# {'name': 'doc2', 'value': 2}
# {'name': 'doc3', 'value': 3}

# 写入多文档
docs = [{"a": 1}, {"b": 2}, {"c": 3}]
with open("multi.yaml", "w") as f:
    yaml.safe_dump_all(docs, f)
\`\`\`

### 3.6 自定义 Python 对象(谨慎)

PyYAML 可以序列化 Python 对象,但**有安全风险,不推荐用于配置**:

\`\`\`python
# 不推荐:序列化任意对象
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

user = User("Alice", 30)

# 写入(unsafe)
yaml.dump(user, default_flow_style=False)
# !!python/object:__main__.User
# age: 30
# name: Alice

# 读取(unsafe,执行任意代码)
user = yaml.unsafe_load(...)
\`\`\`

**正确做法**:YAML 只存基本类型(dict/list/str),Python 代码自己构造对象:

\`\`\`python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# YAML 只存数据
data = yaml.safe_load("name: Alice\\nage: 30")
user = User(**data)   # 用数据构造对象
\`\`\`

## 四、完整实战:Web 应用配置

### 4.1 配置文件

\`\`\`yaml
# config/app.yaml
app:
  name: user-service
  version: 2.1.0
  env: production

server:
  host: 0.0.0.0
  port: 8080
  workers: 4
  timeout: 30
  ssl:
    enabled: true
    cert: /etc/ssl/cert.pem
    key: /etc/ssl/key.pem

database:
  primary:
    host: db-master.internal
    port: 5432
    user: app_user
    password: \${DB_PASSWORD}
    pool_size: 20
    max_overflow: 10
  replica:
    - host: db-replica-1.internal
      port: 5432
    - host: db-replica-2.internal
      port: 5432
  slow_query_threshold: 1.0   # 秒

redis:
  host: cache.internal
  port: 6379
  db: 0
  password: \${REDIS_PASSWORD}
  pool_size: 50

features:
  - name: new_checkout
    enabled: true
    rollout_percentage: 50
  - name: dark_mode
    enabled: false
  - name: ai_recommendation
    enabled: true
    config:
      model: gpt-4
      temperature: 0.7

logging:
  level: INFO
  format: "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
  handlers:
    - type: file
      path: /var/log/app/app.log
      max_size: 100MB
      backup_count: 10
    - type: stdout
      level: WARNING
    - type: sentry
      dsn: \${SENTRY_DSN}

rate_limit:
  global:
    requests_per_minute: 1000
  per_user:
    requests_per_minute: 60
    burst: 10

cors:
  allowed_origins:
    - https://example.com
    - https://app.example.com
  allowed_methods: [GET, POST, PUT, DELETE]
  allowed_headers: [Content-Type, Authorization]
\`\`\`

### 4.2 读取代码

\`\`\`python
import os
import yaml
from dataclasses import dataclass
from typing import List

@dataclass
class ServerConfig:
    host: str
    port: int
    workers: int
    timeout: int
    ssl_enabled: bool
    ssl_cert: str
    ssl_key: str

@dataclass
class DatabaseConfig:
    primary_host: str
    primary_port: int
    primary_user: str
    primary_password: str
    pool_size: int
    replica_hosts: List[str]
    slow_query_threshold: float

    @property
    def primary_url(self):
        return f"postgresql://{self.primary_user}:{self.primary_password}@{self.primary_host}:{self.primary_port}/app"

@dataclass
class AppConfig:
    server: ServerConfig
    database: DatabaseConfig
    raw: dict   # 原始 dict,用于动态访问

def load_config(path="config/app.yaml"):
    with open(path) as f:
        raw = yaml.safe_load(f)

    # 用环境变量替换占位符 \${VAR}
    raw = _interpolate_env(raw)

    server_raw = raw["server"]
    server = ServerConfig(
        host=server_raw["host"],
        port=server_raw["port"],
        workers=server_raw["workers"],
        timeout=server_raw["timeout"],
        ssl_enabled=server_raw["ssl"]["enabled"],
        ssl_cert=server_raw["ssl"]["cert"],
        ssl_key=server_raw["ssl"]["key"],
    )

    db_raw = raw["database"]
    database = DatabaseConfig(
        primary_host=db_raw["primary"]["host"],
        primary_port=db_raw["primary"]["port"],
        primary_user=db_raw["primary"]["user"],
        primary_password=db_raw["primary"]["password"],
        pool_size=db_raw["primary"]["pool_size"],
        replica_hosts=[r["host"] for r in db_raw["replica"]],
        slow_query_threshold=db_raw["slow_query_threshold"],
    )

    return AppConfig(server=server, database=database, raw=raw)

def _interpolate_env(value):
    """递归把 \${VAR} 替换成环境变量"""
    if isinstance(value, str):
        # 简化版,生产环境用更完整的实现
        import re
        def replace(match):
            var = match.group(1)
            return os.environ.get(var, match.group(0))
        return re.sub(r"\\$\\{(\\w+)\\}", replace, value)
    elif isinstance(value, dict):
        return {k: _interpolate_env(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [_interpolate_env(v) for v in value]
    return value

# 使用
config = load_config()
print(config.server.host)              # 0.0.0.0
print(config.database.primary_url)     # postgresql://app_user:***@db-master.internal:5432/app
print(config.database.replica_hosts)   # ['db-replica-1.internal', 'db-replica-2.internal']
\`\`\`

### 4.3 用 pydantic 校验

更现代的做法是用 pydantic 校验:

\`\`\`python
from pydantic import BaseModel, Field
import yaml

class SSLConfig(BaseModel):
    enabled: bool = False
    cert: str = ""
    key: str = ""

class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = Field(8080, ge=1, le=65535)
    workers: int = Field(4, ge=1, le=100)
    timeout: int = Field(30, ge=1, le=300)
    ssl: SSLConfig = SSLConfig()

class AppConfig(BaseModel):
    server: ServerConfig
    database: dict
    redis: dict

with open("config/app.yaml") as f:
    raw = yaml.safe_load(f)

try:
    config = AppConfig(**raw)   # 启动时校验
except Exception as e:
    print(f"配置错误: {e}")
    exit(1)

print(config.server.port)   # 8080
\`\`\`

## 五、YAML 的优点与缺点

### 5.1 优点

| 优点 | 说明 |
|------|------|
| 人类友好 | 缩进 + 简洁语法,可读性极高 |
| 表达力强 | 支持任意深度嵌套、列表、混合结构 |
| 多行字符串 | \`|\` 和 \`>\` 处理长文本优雅 |
| 锚点引用 | 减少重复,DRY |
| 注释 | 原生支持 \`#\` |
| 生态丰富 | K8s、Docker、CI/CD 几乎都用 YAML |
| 类型推断 | 自动识别 int/float/bool/null |

### 5.2 缺点

| 缺点 | 说明 |
|------|------|
| 缩进敏感 | Tab 和空格混用、缩进错一个就崩 |
| 规范复杂 | YAML 1.2 规范 80+ 页,完整实现罕见 |
| 安全风险 | \`yaml.load()\` 可执行代码(已废弃但仍有代码用) |
| 隐式类型 | \`yes\`/\`no\`/\`on\`/\`off\` 被解析成布尔,反直觉 |
| 大文件难维护 | 几千行的 K8s YAML 很难阅读 |
| 解析器差异 | PyYAML、ruamel.yaml、js-yaml 行为不完全一致 |

### 5.3 YAML 的"复杂度陷阱"

YAML 看起来简单,实际规范极其复杂。完整 YAML 实现罕见,大部分解析器只实现了核心子集。

\`\`\`text
YAML 规范页数:    80+ 页
JSON 规范页数:    ~10 页
TOML 规范页数:    ~30 页
\`\`\`

复杂规范导致:
- 不同解析器行为不一致
- 边缘 case 多(锚点、引用、流式、块式混用)
- 安全漏洞历史多(包括 Kubernetes CVE)

## 六、YAML 缩进规则与常见错误

### 6.1 缩进规则速查

| 规则 | 说明 |
|------|------|
| 必须用空格 | Tab 字符不允许 |
| 同级相同缩进 | 同一层的元素缩进必须一致 |
| 缩进数不限 | 1/2/4 个空格都行,但要全局一致 |
| 列表项缩进 | \`-\` 与父级缩进对齐或更深 |
| 推荐缩进 | 2 个空格(社区主流) |

### 6.2 常见缩进错误

**错误 1:Tab 和空格混用**

\`\`\`yaml
server:
\thost: localhost  # Tab,报错
  port: 8080
\`\`\`

**错误 2:同层级缩进不一致**

\`\`\`yaml
server:
   host: localhost   # 3 个空格
  port: 8080         # 2 个空格,报错
\`\`\`

**错误 3:列表项缩进错误**

\`\`\`yaml
# 错误:list 项与 key 同级
fruits:
- apple
- banana

# 正确(Python PyYAML 接受,但有些解析器要求缩进)
fruits:
  - apple
  - banana
\`\`\`

**错误 4:冒号后无空格**

\`\`\`yaml
# 错误
host:localhost

# 正确
host: localhost
\`\`\`

**错误 5:布尔值被误识别**

\`\`\`yaml
# 期望字符串,实际是布尔
gender: yes     # True!
answer: no      # False!
switch: on      # True!

# 正确(加引号)
gender: "yes"
answer: "no"
switch: "on"
\`\`\`

## 七、PyYAML 常用 API 速查

### 7.1 加载相关

| 函数 | 说明 | 安全性 |
|------|------|--------|
| \`yaml.safe_load(stream)\` | 安全加载单个文档 | 安全 |
| \`yaml.safe_load_all(stream)\` | 安全加载多文档 | 安全 |
| \`yaml.load(stream, Loader)\` | 用指定 Loader 加载 | 取决于 Loader |
| \`yaml.unsafe_load(stream)\` | 不安全加载(可执行代码) | 危险 |
| \`yaml.full_load(stream)\` | 比 unsafe 略安全,但仍有风险 | 谨慎 |

### 7.2 写入相关

| 函数 | 说明 |
|------|------|
| \`yaml.safe_dump(data, stream)\` | 安全写入 |
| \`yaml.safe_dump_all(docs, stream)\` | 写入多文档 |
| \`yaml.dump(data, stream, Dumper)\` | 用指定 Dumper |

### 7.3 Loader 选项

\`\`\`python
# 安全(只解析基本类型)
yaml.load(f, Loader=yaml.SafeLoader)

# 全功能(含 Python 对象,危险)
yaml.load(f, Loader=yaml.FullLoader)   # Python 3.7+ 默认
yaml.load(f, Loader=yaml.UnsafeLoader) # 完全不安全

# 推荐始终用 SafeLoader
\`\`\`

## 八、ruamel.yaml:更现代的替代

PyYAML 是最流行的库,但有一些局限:
- 只支持 YAML 1.1(规范旧)
- 读写会丢失注释和格式
- 不保留锚点

\`ruamel.yaml\` 是更现代的替代:

\`\`\`bash
pip install ruamel.yaml
\`\`\`

\`\`\`python
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True    # 保留引号
yaml.indent(mapping=2, sequence=4, offset=2)

# 读取(保留注释和格式)
with open("config.yaml") as f:
    data = yaml.load(f)

# 修改
data["server"]["port"] = 9090

# 写入(保留原格式)
with open("config.yaml", "w") as f:
    yaml.dump(data, f)
\`\`\`

ruamel.yaml 适合需要"修改原文件但保留注释"的场景(比如 CI 工具自动修改版本号)。

## 九、YAML 工程化实践

### 9.1 多环境配置

\`\`\`text
config/
├── base.yaml           # 公共配置
├── development.yaml    # 开发覆盖
├── staging.yaml        # 预发覆盖
├── production.yaml     # 生产覆盖
└── local.yaml          # 本地覆盖(不进 Git)
\`\`\`

\`\`\`python
import os
import yaml

def deep_merge(base, override):
    """深度合并两个 dict"""
    result = base.copy()
    for k, v in override.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = deep_merge(result[k], v)
        else:
            result[k] = v
    return result

def load_config(env=None):
    env = env or os.environ.get("APP_ENV", "development")
    config = {}
    for path in ["config/base.yaml", f"config/{env}.yaml", "config/local.yaml"]:
        try:
            with open(path) as f:
                override = yaml.safe_load(f) or {}
                config = deep_merge(config, override)
        except FileNotFoundError:
            continue
    return config
\`\`\`

### 9.2 配置校验

\`\`\`python
from pydantic import BaseModel, Field, ValidationError
import yaml

class ServerConfig(BaseModel):
    host: str
    port: int = Field(ge=1, le=65535)
    workers: int = Field(ge=1, le=100)

class AppConfig(BaseModel):
    server: ServerConfig
    database: dict
    redis: dict

try:
    config = AppConfig(**yaml.safe_load(open("config.yaml")))
except ValidationError as e:
    print(f"配置校验失败:\\n{e}")
    exit(1)
\`\`\`

### 9.3 用 yq 处理 YAML

类似 \`jq\` 处理 JSON,\`yq\` 是处理 YAML 的命令行工具:

\`\`\`bash
# 读取 server.port
yq '.server.port' config.yaml

# 修改并写回
yq -i '.server.port = 9090' config.yaml

# 转成 JSON
yq -o=json '.' config.yaml > config.json
\`\`\`

## 十、本章小结

### 10.1 核心要点

1. **YAML 人类友好**:缩进 + 简洁语法,适合复杂嵌套配置。
2. **缩进是灵魂**:必须空格,不能 Tab,同层级一致。
3. **永远用 \`safe_load\`**:\`yaml.load()\` 可执行代码,严重安全风险。
4. **隐式类型陷阱**:\`yes\`/\`no\`/\`on\`/\`off\` 会被解析成布尔,字符串要加引号。
5. **生态统治云原生**:K8s、Docker、CI/CD 都用 YAML,必学。

### 10.2 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 用 Tab 缩进 | 编辑器默认 Tab | 配置编辑器"用空格替换 Tab" |
| 冒号后无空格 | \`host:localhost\` | \`host: localhost\` |
| 布尔被误识别 | \`gender: yes\` | \`gender: "yes"\` |
| 用了 yaml.load | \`yaml.load(f)\` | \`yaml.safe_load(f)\` |
| 数字变字符串 | \`version: 1.0\` 期望 "1.0" | \`version: "1.0"\` |
| 多行字符串 | 用 \\\\n 转义 | 用 \`|\` 或 \`>\` |
| 锚点合并 | \`*defaults\` 当成合并 | 合并用 \`<<: *defaults\` |
| 文件不存在 | \`safe_load(open(path))\` 报错 | 用 \`try/except FileNotFoundError\` |
| 中文乱码 | dump 后中文变 \\uXXXX | 加 \`allow_unicode=True\` |
| 键顺序变化 | dump 后键被排序 | 设 \`sort_keys=False\` |

### 10.3 何时该用 YAML

- 配置复杂,有多层嵌套
- 需要列表/数组
- 团队熟悉 YAML(K8s/Docker 用户)
- 需要多行字符串(日志格式、SQL、证书)
- 配置文件需要注释

### 10.4 何时该换其他格式

- 配置极简(两段键值对)→ INI
- Python 项目元数据 → TOML(pyproject.toml)
- 需要严格类型安全 → TOML
- 跨语言 API 数据交换 → JSON
- 团队对缩进深恶痛绝 → TOML`,
  },

  // =========================================================
  // 第四章:TOML 配置(tomllib/tomli)
  // =========================================================
  {
    id: "pyeng-config-toml",
    icon: "🎯",
    title: "TOML 配置(tomllib/tomli)",
    group: "配置文件",
    content: `# TOML 配置(tomllib/tomli)

## 一、TOML 格式简介

### 1.1 TOML 的诞生

TOML(Tom's Obvious, Minimal Language)由 GitHub 联合创始人 **Tom Preston-Werner** 在 2013 年创建。目标是做"明显且最小化"的配置语言,结合 INI 的简单和 YAML 的表达力,同时**类型明确**、**规范简单**。

设计哲学:
- **类型明确**:\`5432\` 是 int,\`"5432"\` 是 str,\`true\` 是 bool,不会有 YAML 那种隐式类型陷阱
- **规范简单**:规范约 30 页,远小于 YAML 的 80+ 页
- **人类友好**:注释、多行字符串、清晰的语法
- **机器友好**:解析规则明确,无歧义

### 1.2 TOML 的崛起:pyproject.toml

TOML 在 Python 生态的爆发源于 **PEP 518**(2016),它定义了 \`pyproject.toml\` 作为 Python 项目的标准配置文件,取代混乱的 \`setup.py\`。

\`\`\`text
2013  TOML 0.1 发布
2016  PEP 518 引入 pyproject.toml
2019  PEP 621 标准化项目元数据格式
2021  PEP 632 弃用 distutils,推 pyproject.toml
2023  Python 3.11 内置 tomllib
2024  pyproject.toml 成为 Python 项目事实标准
\`\`\`

如今几乎所有现代 Python 工具都支持 \`pyproject.toml\`:

| 工具 | 用途 |
|------|------|
| poetry | 依赖管理 |
| pip (PEP 517) | 构建 |
| black | 格式化 |
| ruff | lint + format |
| mypy | 类型检查 |
| pytest | 测试 |
| coverage | 覆盖率 |
| setuptools | 打包 |

### 1.3 TOML 示例

\`\`\`toml
# pyproject.toml —— 一个完整的 Python 项目配置
[project]
name = "user-service"
version = "2.1.0"
description = "User management microservice"
authors = [{name = "Alice", email = "alice@example.com"}]
license = {text = "MIT"}
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.100.0",
    "pydantic>=2.0",
    "sqlalchemy>=2.0",
    "redis>=5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "ruff>=0.1",
    "mypy>=1.0",
]

[project.scripts]
user-cli = "user_service.cli:main"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=user_service"

[tool.mypy]
strict = true
\`\`\`

## 二、TOML 语法详解

### 2.1 基本语法:key = value

\`\`\`toml
# 字符串
title = "TOML Example"

# 数字
port = 8080
pi = 3.14
negative = -42

# 布尔
debug = true
production = false

# 日期
date = 2024-01-01
datetime = 2024-01-01T10:00:00Z
\`\`\`

注意:\`key\` 必须是裸键(字母数字下划线短横线)或带引号的键。

### 2.2 注释

\`\`\`toml
# 整行注释
port = 8080  # 行内注释(支持,和 YAML 不同)
# 也可以多个注释
\`\`\`

### 2.3 字符串

TOML 支持四种字符串:

\`\`\`toml
# 1. 基本字符串(双引号,支持转义)
path = "C:\\\\Users\\\\Alice"
quote = "He said \\"hello\\""

# 2. 字面字符串(单引号,不转义)
regex = 'C:\\Users\\Alice'   # 反斜杠是字面值
path2 = 'C:\\Users\\Alice'

# 3. 多行基本字符串(三个双引号,支持转义)
description = """
这是第一行
这是第二行
"""

# 4. 多行字面字符串(三个单引号,不转义)
regex_multiline = '''
\\d{4}-\\d{2}-\\d{2}   # 字面值,反斜杠不转义
'''
\`\`\`

### 2.4 数字

\`\`\`toml
int = 42
negative = -17
float = 3.14
scientific = 1e10
hex = 0xDEADBEEF
octal = 0o755
binary = 0b101010
underscores = 1_000_000   # 下划线分隔,提高可读性
\`\`\`

### 2.5 布尔

\`\`\`toml
true_value = true
false_value = false
# 必须是小写,true/True/TRUE 不一样
\`\`\`

### 2.6 日期时间

TOML 原生支持日期类型,这是 INI/YAML 不具备的优势。

\`\`\`toml
date = 2024-01-15              # 仅日期
time = 07:32:00                # 仅时间
datetime = 2024-01-15T07:32:00Z       # UTC 时间
datetime_local = 2024-01-15T07:32:00  # 本地时间(无时区)
datetime_offset = 2024-01-15T07:32:00+08:00  # 带时区偏移
\`\`\`

### 2.7 数组

\`\`\`toml
# 行内数组
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "two", 3.0, true]   # 类型可以混合,但不推荐

# 多行数组(尾随逗号允许)
servers = [
    "web-1",
    "web-2",
    "web-3",
]

# 嵌套数组
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
\`\`\`

### 2.8 表(table)

表用方括号包裹的键名声明,类似 INI 的段,但可以嵌套。

\`\`\`toml
# 顶层表
[server]
host = "localhost"
port = 8080

# 嵌套表(用点表示层级)
[server.ssl]
enabled = true
cert = "/path/to/cert"

[server.timeout]
read = 30
write = 30
\`\`\`

等价于 JSON:

\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": {
      "enabled": true,
      "cert": "/path/to/cert"
    },
    "timeout": {
      "read": 30,
      "write": 30
    }
  }
}
\`\`\`

### 2.9 内联表

类似 JSON 的对象写法,适合小型表:

\`\`\`toml
# 内联表
server = {host = "localhost", port = 8080}

# 等价于
[server]
host = "localhost"
port = 8080
\`\`\`

### 2.10 数组表([[array]])

数组表是 TOML 表达"对象数组"的方式,用双方括号声明:

\`\`\`toml
# 定义一个 servers 数组,每个元素是一个表
[[servers]]
name = "web-1"
host = "10.0.0.1"
port = 80

[[servers]]
name = "web-2"
host = "10.0.0.2"
port = 80

[[servers]]
name = "db-1"
host = "10.0.0.3"
port = 5432
\`\`\`

等价于 JSON:

\`\`\`json
{
  "servers": [
    {"name": "web-1", "host": "10.0.0.1", "port": 80},
    {"name": "web-2", "host": "10.0.0.2", "port": 80},
    {"name": "db-1", "host": "10.0.0.3", "port": 5432}
  ]
}
\`\`\`

数组表非常适合描述"多个同类资源"的配置,比如多个数据库连接、多个 webhook 等。

### 2.11 点号键(dotted keys)

\`\`\`toml
# 点号键自动创建嵌套表
server.host = "localhost"
server.port = 8080

# 等价于
[server]
host = "localhost"
port = 8080
\`\`\`

## 三、Python 的 TOML 支持

### 3.1 Python 3.11+ 内置 tomllib

从 Python 3.11 开始,标准库内置了 \`tomllib\`,**只读**:

\`\`\`python
import tomllib

with open("pyproject.toml", "rb") as f:   # 注意:必须用二进制模式 "rb"
    data = tomllib.load(f)

print(data["project"]["name"])
# user-service

# 从字符串读取
data = tomllib.loads('''
[project]
name = "test"
version = "1.0"
''')
\`\`\`

**注意**:\`tomllib.load()\` 接受**二进制文件对象**(必须 \`"rb"\` 模式打开),不是文本模式。这是和 JSON/yaml 不同的地方。

### 3.2 Python 3.10 及以下:tomli

3.10 及以下需要安装第三方库 \`tomli\`(读)和 \`tomli-w\`(写):

\`\`\`bash
pip install tomli tomli-w
\`\`\`

\`\`\`python
import tomli
import tomli_w

# 读取
with open("pyproject.toml", "rb") as f:
    data = tomli.load(f)

# 写入
data = {
    "project": {
        "name": "my-package",
        "version": "1.0.0",
    }
}
with open("pyproject.toml", "wb") as f:   # 写也是二进制
    tomli_w.dump(data, f)

# 字符串读写
text = tomli_w.dumps(data)
data = tomli.loads(text)
\`\`\`

### 3.3 兼容写法(推荐)

为了同时支持 3.11+ 和 3.10-,可以用 try/except:

\`\`\`python
try:
    import tomllib   # Python 3.11+
except ModuleNotFoundError:
    import tomli as tomllib   # pip install tomli

with open("pyproject.toml", "rb") as f:
    data = tomllib.load(f)
\`\`\`

这样代码在两个版本下都能跑。

### 3.4 tomllib 的特点

- **只读**:不能 dump,要写必须用 \`tomli-w\` 或其他库
- **二进制模式**:必须 \`open(path, "rb")\`,因为 TOML 规范要求 UTF-8 编码
- **返回 dict**:解析结果是普通 Python dict,可用 \`data["a"]["b"]\` 访问
- **类型自动转换**:\`8080\` 是 int,\`true\` 是 bool,\`2024-01-01\` 是 datetime.date

\`\`\`python
import tomllib

data = tomllib.loads("""
str = "hello"
int = 42
float = 3.14
bool = true
date = 2024-01-01
list = [1, 2, 3]
""")

print(type(data["str"]))    # <class 'str'>
print(type(data["int"]))    # <class 'int'>
print(type(data["bool"]))   # <class 'bool'>
print(type(data["date"]))   # <class 'datetime.date'>
print(type(data["list"]))   # <class 'list'>
\`\`\`

## 四、pyproject.toml 详解

### 4.1 PEP 518 与 pyproject.toml 的由来

在 \`pyproject.toml\` 出现前,Python 项目的配置散落在多个地方:

\`\`\`text
setup.py      # 项目元数据 + 构建逻辑(可执行,危险)
setup.cfg     # 静态配置
requirements.txt   # 依赖
MANIFEST.in   # 打包文件清单
.flake8       # lint 配置
mypy.ini      # 类型检查配置
pytest.ini    # 测试配置
\`\`\`

PEP 518 引入 \`pyproject.toml\` 作为**统一配置入口**,所有工具的配置都集中在这里。

### 4.2 pyproject.toml 结构

\`\`\`toml
# pyproject.toml
[build-system]      # 构建系统配置(PEP 518)
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]           # 项目元数据(PEP 621)
name = "user-service"
version = "2.1.0"
description = "User management microservice"
readme = "README.md"
requires-python = ">=3.11"
license = {text = "MIT"}
authors = [
    {name = "Alice", email = "alice@example.com"}
]
keywords = ["user", "service", "fastapi"]
classifiers = [
    "Development Status :: 5 - Production/Stable",
    "Programming Language :: Python :: 3.11",
]
dependencies = [
    "fastapi>=0.100.0",
    "pydantic>=2.0",
    "sqlalchemy>=2.0",
    "redis>=5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "ruff>=0.1",
    "mypy>=1.0",
]
postgres = ["psycopg[binary]>=3.1"]
mysql = ["pymysql>=1.1"]

[project.scripts]
user-cli = "user_service.cli:main"

[project.urls]
Homepage = "https://github.com/example/user-service"
Documentation = "https://user-service.readthedocs.io"
Repository = "https://github.com/example/user-service"

# 工具配置
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"

[tool.black]
line-length = 100
target-version = ["py311"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=user_service --cov-report=term-missing"
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
]

[tool.mypy]
strict = true
plugins = ["pydantic.mypy"]

[tool.coverage.run]
source = ["user_service"]
omit = ["*/tests/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
]
\`\`\`

### 4.3 [build-system] 段

声明构建系统:

\`\`\`toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]   # 构建依赖
build-backend = "setuptools.build_meta"    # 构建后端
\`\`\`

常见 build-backend:
- \`setuptools.build_meta\`:传统选择
- \`hatchling.build\`:现代选择(Hatch)
- \`poetry.core.masonry.api\`:Poetry
- \`flit_core.buildapi\`:Flit(纯 Python 包)

### 4.4 [project] 段(PEP 621)

项目元数据的标准格式:

\`\`\`toml
[project]
name = "my-package"        # 必填,包名
version = "1.0.0"          # 版本
dynamic = ["version"]      # 动态字段(从其他地方读)
description = "..."
readme = "README.md"       # README 路径
requires-python = ">=3.11" # Python 版本要求
license = {text = "MIT"}   # 或 license = "MIT"(PEP 639)
authors = [{name = "...", email = "..."}]
maintainers = [{name = "...", email = "..."}]
keywords = ["..."]
classifiers = ["..."]
dependencies = ["..."]
\`\`\`

### 4.5 [tool.*] 段

每个工具的配置都在 \`[tool.<tool-name>]\` 下,避免冲突。这是 \`pyproject.toml\` 的设计精髓——**统一入口,各工具自治**。

## 五、完整实战:Web 项目配置

### 5.1 项目结构

\`\`\`text
user-service/
├── pyproject.toml       # 项目元数据 + 工具配置
├── config/
│   ├── base.toml        # 应用基础配置
│   ├── development.toml # 开发环境
│   └── production.toml  # 生产环境
└── src/
    └── user_service/
        ├── __init__.py
        ├── config.py    # 配置加载逻辑
        └── main.py
\`\`\`

### 5.2 应用配置文件

\`\`\`toml
# config/base.toml
[app]
name = "user-service"
version = "2.1.0"
debug = false

[server]
host = "0.0.0.0"
port = 8080
workers = 4
timeout = 30

[server.ssl]
enabled = false
cert = ""
key = ""

[database]
host = "localhost"
port = 5432
user = "postgres"
password = ""   # 从环境变量注入
name = "app_db"
pool_size = 20
max_overflow = 10
slow_query_threshold = 1.0

[[database.replicas]]
host = "replica-1.internal"
port = 5432

[[database.replicas]]
host = "replica-2.internal"
port = 5432

[redis]
host = "localhost"
port = 6379
db = 0
password = ""
pool_size = 50

[logging]
level = "INFO"
format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"

[[logging.handlers]]
type = "file"
path = "/var/log/app/app.log"
max_size = "100MB"
backup_count = 10

[[logging.handlers]]
type = "stdout"
level = "WARNING"

[features.new_checkout]
enabled = true
rollout_percentage = 50

[features.dark_mode]
enabled = false

[features.ai_recommendation]
enabled = true
model = "gpt-4"
temperature = 0.7

[rate_limit.global]
requests_per_minute = 1000

[rate_limit.per_user]
requests_per_minute = 60
burst = 10

[cors]
allowed_origins = ["https://example.com", "https://app.example.com"]
allowed_methods = ["GET", "POST", "PUT", "DELETE"]
allowed_headers = ["Content-Type", "Authorization"]
\`\`\`

### 5.3 读取代码

\`\`\`python
# src/user_service/config.py
import os
import tomllib
from dataclasses import dataclass, field
from typing import List
from pathlib import Path

try:
    import tomllib   # Python 3.11+
except ModuleNotFoundError:
    import tomli as tomllib


@dataclass
class SSLConfig:
    enabled: bool = False
    cert: str = ""
    key: str = ""

@dataclass
class ServerConfig:
    host: str = "0.0.0.0"
    port: int = 8080
    workers: int = 4
    timeout: int = 30
    ssl: SSLConfig = field(default_factory=SSLConfig)

@dataclass
class ReplicaConfig:
    host: str
    port: int = 5432

@dataclass
class DatabaseConfig:
    host: str
    port: int
    user: str
    password: str
    name: str
    pool_size: int = 20
    max_overflow: int = 10
    slow_query_threshold: float = 1.0
    replicas: List[ReplicaConfig] = field(default_factory=list)

    @property
    def url(self):
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

@dataclass
class AppConfig:
    server: ServerConfig
    database: DatabaseConfig
    raw: dict

def load_config(env=None):
    env = env or os.environ.get("APP_ENV", "development")
    config_dir = Path(__file__).parent.parent.parent / "config"

    config = {}
    # 加载基础配置
    with open(config_dir / "base.toml", "rb") as f:
        config = _deep_merge(config, tomllib.load(f))
    # 加载环境特定配置(覆盖)
    env_file = config_dir / f"{env}.toml"
    if env_file.exists():
        with open(env_file, "rb") as f:
            config = _deep_merge(config, tomllib.load(f))

    # 从环境变量注入敏感值
    config["database"]["password"] = os.environ.get("DB_PASSWORD", "")
    config["redis"]["password"] = os.environ.get("REDIS_PASSWORD", "")

    # 构造 dataclass
    server_raw = config["server"]
    server = ServerConfig(
        host=server_raw["host"],
        port=server_raw["port"],
        workers=server_raw["workers"],
        timeout=server_raw["timeout"],
        ssl=SSLConfig(**server_raw.get("ssl", {})),
    )

    db_raw = config["database"]
    database = DatabaseConfig(
        host=db_raw["host"],
        port=db_raw["port"],
        user=db_raw["user"],
        password=db_raw["password"],
        name=db_raw["name"],
        pool_size=db_raw.get("pool_size", 20),
        max_overflow=db_raw.get("max_overflow", 10),
        slow_query_threshold=db_raw.get("slow_query_threshold", 1.0),
        replicas=[ReplicaConfig(**r) for r in db_raw.get("replicas", [])],
    )

    return AppConfig(server=server, database=database, raw=config)

def _deep_merge(base, override):
    result = base.copy()
    for k, v in override.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = _deep_merge(result[k], v)
        else:
            result[k] = v
    return result
\`\`\`

### 5.4 使用

\`\`\`python
config = load_config()
print(config.server.host)             # 0.0.0.0
print(config.server.ssl.enabled)      # False
print(config.database.url)            # postgresql://postgres:@localhost:5432/app_db
print(config.database.replicas[0].host)  # replica-1.internal
print(config.raw["features"]["new_checkout"]["enabled"])  # True
\`\`\`

## 六、TOML 的优点与缺点

### 6.1 优点

| 优点 | 说明 |
|------|------|
| 类型明确 | \`8080\` 一定是 int,\`"8080"\` 一定是 str,无歧义 |
| 规范简单 | 30 页规范,远小于 YAML |
| 注释原生支持 | \`#\` 注释,行内注释也支持 |
| 多行字符串 | \`"""\`\` 和 \`'''\`\` 两种风格 |
| 日期原生支持 | \`2024-01-01\` 直接是 datetime.date |
| 数组表优雅 | \`[[servers]]\` 描述对象数组很清晰 |
| Python 官方推荐 | pyproject.toml 是标准 |
| 标准库支持 | Python 3.11+ 内置 tomllib |
| 安全 | 没有 YAML 那种代码执行风险 |

### 6.2 缺点

| 缺点 | 说明 |
|------|------|
| 嵌套深时啰嗦 | 深层嵌套要写多个 \`[a.b.c.d]\` 段 |
| 生态较新 | 比 YAML 用得少,K8s/Docker 还不用 TOML |
| 标准库只读 | tomllib 不能写,要装 tomli-w |
| 部分工具未支持 | 一些老工具仍用 INI |
| 多行字符串对齐 | 三个引号后的内容默认含换行,要处理 |

### 6.3 TOML vs YAML 嵌套对比

**TOML 嵌套**:

\`\`\`toml
[server.ssl.cert]
path = "/etc/ssl/cert.pem"
expires = 2024-12-31

[server.ssl.key]
path = "/etc/ssl/key.pem"
\`\`\`

**YAML 嵌套**:

\`\`\`yaml
server:
  ssl:
    cert:
      path: /etc/ssl/cert.pem
      expires: 2024-12-31
    key:
      path: /etc/ssl/key.pem
\`\`\`

YAML 在表达深层嵌套时更紧凑,TOML 要写多个 \`[a.b.c]\` 段,看起来分散。

## 七、TOML 类型系统速查

### 7.1 类型对照表

| TOML 写法 | 类型 | Python 类型 | 示例 |
|-----------|------|-------------|------|
| \`"hello"\` | string | str | \`"hello"\` |
| \`'hello'\` | string (字面) | str | \`"hello"\` |
| \`42\` | integer | int | 42 |
| \`-17\` | integer | int | -17 |
| \`0xFF\` | integer (hex) | int | 255 |
| \`0o755\` | integer (octal) | int | 493 |
| \`0b1010\` | integer (binary) | int | 10 |
| \`3.14\` | float | float | 3.14 |
| \`1e10\` | float | float | 1e10 |
| \`true\` / \`false\` | boolean | bool | True/False |
| \`2024-01-01\` | date | datetime.date | date(2024, 1, 1) |
| \`07:32:00\` | time | datetime.time | time(7, 32) |
| \`2024-01-01T10:00:00Z\` | datetime | datetime.datetime | datetime(2024, 1, 1, 10, 0, tzinfo=UTC) |
| \`[1, 2, 3]\` | array | list | [1, 2, 3] |
| \`{a = 1}\` | inline table | dict | {"a": 1} |
| \`[section]\` | table | dict | {...} |
| \`[[array]]\` | array of tables | list of dict | [{...}, {...}] |

### 7.2 类型严格性

TOML 的类型是**显式且严格**的:

\`\`\`toml
# 字符串和数字不同
str_port = "8080"   # str
int_port = 8080     # int

# 布尔只有小写
true_value = true   # bool
string_value = "true"   # str(字符串)

# 数字下划线只是分隔符
big_num = 1_000_000   # 1000000, int
\`\`\`

这点和 YAML 完全不同。YAML 的 \`8080\` 是 int,\`"8080"\` 是 str,但 \`yes\` 是 bool 不是 str,容易踩坑。TOML 不会有这种"意外推断"。

## 八、tomllib 常用 API

### 8.1 读取

\`\`\`python
import tomllib

# 从文件读取(必须二进制模式)
with open("config.toml", "rb") as f:
    data = tomllib.load(f)

# 从字符串读取
data = tomllib.loads('key = "value"')
\`\`\`

### 8.2 tomllib 的局限

\`\`\`python
# tomllib 不能写
tomllib.dump(...)   # AttributeError: module 'tomllib' has no attribute 'dump'
tomllib.dumps(...)  # AttributeError

# 要写必须用 tomli-w
import tomli_w
with open("output.toml", "wb") as f:
    tomli_w.dump(data, f)
\`\`\`

### 8.3 tomli-w 写入

\`\`\`python
import tomli_w

data = {
    "project": {
        "name": "test",
        "version": "1.0",
        "dependencies": ["fastapi", "pydantic"],
    },
    "tool": {
        "pytest": {
            "testpaths": ["tests"],
        }
    }
}

# 写入文件(必须二进制模式)
with open("pyproject.toml", "wb") as f:
    tomli_w.dump(data, f)

# 转成字符串
text = tomli_w.dumps(data)
\`\`\`

写入结果:

\`\`\`toml
[project]
name = "test"
version = "1.0"
dependencies = [
    "fastapi",
    "pydantic",
]

[tool.pytest]
testpaths = [
    "tests",
]
\`\`\`

## 九、TOML 工程化实践

### 9.1 多环境配置

\`\`\`text
config/
├── base.toml          # 公共配置
├── development.toml   # 开发覆盖
├── staging.toml       # 预发覆盖
├── production.toml    # 生产覆盖
└── local.toml         # 本地覆盖(不进 Git)
\`\`\`

\`\`\`python
import os
import tomllib
from pathlib import Path

def load_config(env=None):
    env = env or os.environ.get("APP_ENV", "development")
    config_dir = Path("config")
    config = {}

    for path in [
        config_dir / "base.toml",
        config_dir / f"{env}.toml",
        config_dir / "local.toml",
    ]:
        if path.exists():
            with open(path, "rb") as f:
                override = tomllib.load(f)
                config = _deep_merge(config, override)

    return config
\`\`\`

### 9.2 用 pydantic 校验

\`\`\`python
from pydantic import BaseModel, Field
import tomllib

class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = Field(8080, ge=1, le=65535)
    workers: int = Field(4, ge=1, le=100)

class AppConfig(BaseModel):
    server: ServerConfig
    database: dict

with open("config/base.toml", "rb") as f:
    raw = tomllib.load(f)

try:
    config = AppConfig(**raw)
except Exception as e:
    print(f"配置校验失败: {e}")
    exit(1)
\`\`\`

### 9.3 动态版本号

\`\`pyproject.toml\` 支持动态字段,版本号可以从源码读取:

\`\`\`toml
# pyproject.toml
[project]
name = "my-package"
dynamic = ["version"]   # 声明 version 是动态的

[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}

# 或从文件读
# version = {file = "VERSION"}
\`\`\`

\`\`\`python
# src/my_package/__init__.py
__version__ = "1.2.3"
\`\`\`

### 9.4 工具配置集中化

\`\`pyproject.toml\` 把所有工具配置集中,便于管理:

\`\`\`toml
[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I"]

[tool.black]
line-length = 100

[tool.mypy]
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.coverage.run]
source = ["src"]
\`\`\`

这样项目根目录不再需要 \`.flake8\`、\`mypy.ini\`、\`pytest.ini\`、\`.coveragerc\` 等一堆文件。

## 十、TOML 常见错误排查

### 10.1 表声明顺序错误

\`\`\`toml
# 错误:在 [a.b] 后再写 [a] 的键
[a.b]
x = 1

[a]
y = 2   # 错误!a 已经有子表 b,不能再加键
\`\`\`

\`\`\`python
tomllib.loads(text)
# tomllib.TOMLDecodeError: Cannot overwrite a parent section
\`\`\`

**正确**:

\`\`\`toml
[a]
y = 2

[a.b]
x = 1
\`\`\`

### 10.2 数组表混用普通表

\`\`\`toml
# 错误:既用 [[servers]] 又用 [servers]
[[servers]]
name = "web-1"

[servers]   # 错误!servers 已经是数组,不能再当普通表
name = "web-2"
\`\`\`

### 10.3 字符串引号错误

\`\`\`toml
# 错误:基本字符串里未转义引号
quote = "He said "hello""   # 解析错误

# 正确
quote = "He said \\"hello\\""
quote = 'He said "hello"'   # 用单引号字面字符串
\`\`\`

### 10.4 二进制模式错误

\`\`\`python
# 错误:用文本模式打开
with open("config.toml", "r") as f:
    tomllib.load(f)
# TypeError: File must be opened in binary mode

# 正确:二进制模式
with open("config.toml", "rb") as f:
    tomllib.load(f)
\`\`\`

### 10.5 多行字符串意外换行

\`\`\`toml
text = """
line1
line2
"""
# 实际值是 "\\nline1\\nline2\\n",开头有换行

# 想去掉开头换行
text = """\\
line1
line2
"""
# 用 \\\\(行尾反斜杠)去掉换行
\`\`\`

## 十一、本章小结

### 11.1 核心要点

1. **TOML 类型明确**:不会出现 YAML 那种 \`yes\` 被识别成布尔的坑。
2. **Python 3.11+ 内置 tomllib**:标准库支持,只读。
3. **pyproject.toml 是标准**:所有现代 Python 工具的统一配置入口。
4. **数组表 \`[[x]]\`**:优雅表达对象数组。
5. **二进制模式读取**:\`open(path, "rb")\`,这是和 JSON/YAML 不同的地方。

### 11.2 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 文本模式打开 | \`open("a.toml", "r")\` | \`open("a.toml", "rb")\` |
| 表声明顺序 | \`[a.b]\` 在 \`[a]\` 后 | \`[a]\` 在前,\`[a.b]\` 在后 |
| 数组表混用 | \`[[s]]\` + \`[s]\` | 数组表只能用 \`[[s]]\` |
| 字符串引号 | \`"He said "x""\` | 转义或换单引号 |
| 布尔大小写 | \`True\` / \`TRUE\` | 必须 \`true\` / \`false\`(小写) |
| 多行字符串开头 | 直接 \`"""\` | 用 \`"""\\\` 去掉开头换行 |
| 用 tomllib 写 | \`tomllib.dump()\` | 用 \`tomli_w.dump()\` |
| 嵌套表写法 | \`[a.b.c]\` + 在 \`[a.b]\` 加键 | 子表先声明,父表后不能再加键 |
| 日期格式 | \`"2024-01-01"\`(字符串) | \`2024-01-01\`(原生 date) |
| 浮点数与整数 | \`3.0\` 期望 int | \`3.0\` 是 float,要 int 写 \`3\` |

### 11.3 何时该用 TOML

- Python 项目元数据 → pyproject.toml(标准)
- 配置需要严格类型 → TOML
- 想避免 YAML 的隐式类型陷阱 → TOML
- 团队对缩进敏感 → TOML(用方括号,不靠缩进)

### 11.4 何时该换其他格式

- K8s/Docker 配置 → YAML(生态要求)
- 简单两段配置 → INI
- 跨语言 API → JSON
- 大型分布式动态配置 → 配置中心`,
  },

  // =========================================================
  // 第五章:配置方案对比与最佳实践
  // =========================================================
  {
    id: "pyeng-config-compare",
    icon: "⚖️",
    title: "配置方案对比与最佳实践",
    group: "配置文件",
    content: `# 配置方案对比与最佳实践

## 一、五大配置方案横向对比

经过前四章的学习,我们已经了解了 INI、YAML、TOML 三种主流配置文件格式,加上 JSON 和环境变量,共五种方案。本章做横向对比,并给出工程化最佳实践。

### 1.1 五大方案速览

| 方案 | 诞生年份 | 主要场景 | Python 支持 | 备注 |
|------|----------|----------|-------------|------|
| INI | 1980s | 简单两段配置 | 标准库 configparser | 历史悠久,简单 |
| JSON | 2001 | API 数据交换 | 标准库 json | 通用,但不支持注释 |
| YAML | 2001 | 复杂配置(K8s/CI) | PyYAML/ruamel.yaml | 表达力强,缩进敏感 |
| TOML | 2013 | Python 项目配置 | tomllib(3.11+)/tomli | 类型明确,Python 官方推荐 |
| 环境变量 | 1970s | 部署配置、敏感信息 | os.environ | Twelve-Factor 推荐 |

### 1.2 详细对比表

| 维度 | INI | JSON | YAML | TOML | 环境变量 |
|------|-----|------|------|------|----------|
| **复杂度** | 极简 | 简单 | 中等 | 中等 | 极简 |
| **可读性** | 高 | 中(无注释) | 高 | 高 | 低(扁平) |
| **类型支持** | 字符串 | 丰富 | 丰富(隐式) | 丰富(显式) | 字符串 |
| **嵌套层级** | 2 层 | 任意 | 任意 | 任意 | 1 层 |
| **数组支持** | 模拟 | 原生 | 原生 | 原生 | 模拟 |
| **注释支持** | 是 | 否 | 是 | 是 | 否 |
| **多行字符串** | 是(缩进) | 是(\\\\n) | 是(\\\`|\\\` 和 \\\`>\\\`) | 是(""") | 否 |
| **日期类型** | 否 | 否 | 是(隐式) | 是(显式) | 否 |
| **Python 标准库** | 是 | 是 | 否 | 是(3.11+) | 是 |
| **安全风险** | 低 | 低 | 高(load 可执行) | 低 | 低 |
| **学习曲线** | 极低 | 极低 | 中(缩进坑多) | 低 | 极低 |
| **典型场景** | Git/pytest 配置 | API 数据 | K8s/Docker | pyproject.toml | Docker/K8s 部署 |
| **社区活跃度** | 维护中 | 极活跃 | 极活跃 | 上升中 | 极活跃 |

### 1.3 同一份配置的五种写法

**配置需求**:

\`\`\`text
- 服务监听 0.0.0.0:8080
- 数据库连接 localhost:5432,用户 app,密码 secret
- 启用新结算功能,灰度 50%
- 日志级别 INFO
\`\`\`

**INI 版**:

\`\`\`ini
[server]
host = 0.0.0.0
port = 8080

[database]
host = localhost
port = 5432
user = app
password = secret

[features]
new_checkout = true
rollout_percentage = 50

[logging]
level = INFO
\`\`\`

**JSON 版**:

\`\`\`json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8080
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "app",
    "password": "secret"
  },
  "features": {
    "new_checkout": true,
    "rollout_percentage": 50
  },
  "logging": {
    "level": "INFO"
  }
}
\`\`\`

**YAML 版**:

\`\`\`yaml
server:
  host: 0.0.0.0
  port: 8080

database:
  host: localhost
  port: 5432
  user: app
  password: secret

features:
  new_checkout: true
  rollout_percentage: 50

logging:
  level: INFO
\`\`\`

**TOML 版**:

\`\`\`toml
[server]
host = "0.0.0.0"
port = 8080

[database]
host = "localhost"
port = 5432
user = "app"
password = "secret"

[features]
new_checkout = true
rollout_percentage = 50

[logging]
level = "INFO"
\`\`\`

**环境变量版**:

\`\`\`bash
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=app
DB_PASSWORD=secret
FEATURE_NEW_CHECKOUT=true
FEATURE_ROLLOUT_PERCENTAGE=50
LOG_LEVEL=INFO
\`\`\`

观察:
- **JSON** 最啰嗦,引号和花括号最多
- **YAML** 最简洁,但缩进必须小心
- **TOML** 和 **INI** 类似,但类型更明确
- **环境变量** 扁平,复杂结构难表达

## 二、选择决策树

### 2.1 决策流程

\`\`\`text
是否是 Python 项目元数据(包名/依赖/构建)?
├─ 是 → TOML(pyproject.toml,PEP 621 标准)
└─ 否 → 配置是否需要嵌套?
         │
         ├─ 否(只有两层 key=value)→ INI
         │
         └─ 是(需要深层嵌套)→ 配置场景是什么?
              │
              ├─ K8s/Docker/CI/CD → YAML(生态要求)
              │
              ├─ 跨语言 API 数据交换 → JSON
              │
              └─ 通用应用配置 →
                   │
                   ├─ 团队熟悉 YAML → YAML
                   │
                   └─ 想要类型安全 → TOML

部署/敏感信息 → 始终用环境变量(无论上面选了什么)
\`\`\`

### 2.2 场景决策表

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| Python 项目元数据 | TOML(pyproject.toml) | PEP 621 标准 |
| 简单两段配置(Git/pytest) | INI | 工具支持,简单 |
| 复杂应用配置(嵌套) | YAML 或 TOML | 表达力强 |
| K8s/Docker/CI/CD | YAML | 生态要求 |
| 跨语言 API | JSON | 通用 |
| 部署配置(敏感信息) | 环境变量 | 安全,12-Factor |
| 大型分布式系统 | 配置中心(Apollo/Nacos) | 动态、集中管理 |
| 老项目维护 | 沿用原格式 | 不要为改而改 |

### 2.3 不要为改而改

如果你的项目已经在用 INI 且工作正常,**不要**为了"现代化"硬改成 TOML。配置格式的迁移成本包括:

- 所有读取代码要重写
- CI/CD 流水线要调整
- 文档要重写
- 团队要重新学习

**只有在新项目或重构时,才考虑用更现代的格式**。

## 三、配置管理最佳实践

### 3.1 配置与代码分离

**反模式**:配置写死在代码里。

\`\`\`python
# 反模式
DB_HOST = "localhost"
DB_PORT = 5432

def connect():
    return pymysql.connect(host=DB_HOST, port=DB_PORT)
\`\`\`

**正确做法**:配置文件 + 加载逻辑分离。

\`\`\`text
project/
├── config/
│   └── app.yaml      # 配置(可变)
├── src/
│   └── app/
│       ├── config.py  # 加载逻辑(不变)
│       └── main.py
\`\`\`

### 3.2 敏感信息用环境变量,不进 Git

**反模式**:把数据库密码、API 密钥写进配置文件并提交到 Git。

\`\`\`yaml
# config/production.yaml(进 Git)
database:
  password: S3cretP@ss!   # 灾难!
\`\`\`

**正确做法**:配置文件用占位符,真实值从环境变量注入。

\`\`\`yaml
# config/production.yaml(进 Git)
database:
  password: \${DB_PASSWORD}   # 占位符
\`\`\`

\`\`\`bash
# .env(不进 Git,在 .gitignore)
DB_PASSWORD=S3cretP@ss!
\`\`\`

### 3.3 提供默认值

**反模式**:配置缺失直接崩溃。

\`\`\`python
port = int(os.environ["PORT"])   # 缺失抛 KeyError
\`\`\`

**正确做法**:提供安全默认值。

\`\`\`python
port = int(os.environ.get("PORT", "8000"))   # 默认 8000
\`\`\`

**关键原则**:默认值要"安全"——开发环境的默认值绝不能是生产环境的密码。敏感字段的默认值应该是空,强制走环境变量。

### 3.4 配置校验

**反模式**:启动时不校验,运行时才暴露错误。

\`\`\`python
port = os.environ.get("PORT")   # 字符串,没校验
# 几小时后,某处 port + 1 报错
\`\`\`

**正确做法**:启动时用 pydantic 校验,失败立即退出。

\`\`\`python
from pydantic import BaseModel, Field, ValidationError
import sys

class AppConfig(BaseModel):
    port: int = Field(ge=1, le=65535, default=8000)
    debug: bool = False
    database_url: str

try:
    config = AppConfig(
        port=os.environ.get("PORT", 8000),
        debug=os.environ.get("DEBUG", "false").lower() == "true",
        database_url=os.environ["DATABASE_URL"],
    )
except ValidationError as e:
    print(f"配置错误:\\n{e}")
    sys.exit(1)
\`\`\`

### 3.5 配置版本化

**反模式**:配置文件散落各处,无版本追踪。

\`\`\`text
- /etc/app/config.yaml(运维手改)
- docker-compose.yml 的 environment 段
- K8s ConfigMap
- CI 变量
\`\`\`

**正确做法**:配置随代码进 Git,远程配置中心开版本管理。

\`\`\`text
# 配置变更走 Code Review
git commit -m "bump db pool_size from 20 to 50"
\`\`\`

### 3.6 多环境配置

**反模式**:为每个环境维护一份独立代码。

\`\`\`text
src_dev/    # 开发环境代码
src_prod/   # 生产环境代码
\`\`\`

**正确做法**:同一份代码,多份配置。

\`\`\`text
config/
├── base.yaml          # 公共
├── development.yaml   # 开发覆盖
├── staging.yaml       # 预发覆盖
├── production.yaml    # 生产覆盖
└── local.yaml         # 本地覆盖(.gitignore)
\`\`\`

\`\`\`python
def load_config(env):
    config = load("base.yaml")
    config = merge(config, load(f"{env}.yaml"))
    config = merge(config, load("local.yaml"))   # 可选
    return config
\`\`\`

## 四、pydantic-settings:现代配置管理方案

### 4.1 pydantic-settings 简介

\`pydantic-settings\` 是 Pydantic 官方的配置管理库,基于 Pydantic v2,能从环境变量、配置文件、命令行等多种来源加载配置,并自动校验类型和约束。

\`\`\`bash
pip install pydantic-settings
\`\`\`

### 4.2 基础用法:从环境变量加载

\`\`\`python
from pydantic_settings import BaseSettings, SettingsConfigDict

class AppConfig(BaseSettings):
    # 字段定义
    app_name: str = "my-app"
    debug: bool = False
    port: int = 8000
    database_url: str
    api_key: str

    # 配置:从 .env 文件读取,大小写不敏感
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# 自动从环境变量 + .env 文件加载
config = AppConfig()
print(config.port)         # 8000
print(config.database_url) # postgresql://...
\`\`\`

\`\`\`bash
# .env
APP_NAME=user-service
DEBUG=false
PORT=8080
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=sk_live_xxx
\`\`\`

### 4.3 嵌套配置

\`\`\`python
from pydantic import BaseModel
from pydantic_settings import BaseSettings

class DatabaseConfig(BaseModel):
    host: str = "localhost"
    port: int = 5432
    user: str
    password: str
    name: str

class RedisConfig(BaseModel):
    host: str = "localhost"
    port: int = 6379
    password: str = ""

class AppConfig(BaseSettings):
    app_name: str = "my-app"
    database: DatabaseConfig
    redis: RedisConfig = RedisConfig(host="localhost", port=6379, password="")

# 环境变量用 __ 嵌套
# DATABASE__HOST=db.internal
# DATABASE__PORT=5432
# DATABASE__USER=app
# DATABASE__PASSWORD=secret
# DATABASE__NAME=app_db
\`\`\`

### 4.4 从 YAML 加载

\`\`\`python
import yaml
from pydantic_settings import BaseSettings
from pydantic import BaseModel

class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8080

class AppConfig(BaseModel):
    server: ServerConfig
    database: dict

# 从 YAML 加载并校验
with open("config.yaml") as f:
    raw = yaml.safe_load(f)

config = AppConfig(**raw)   # 启动时校验,失败立即报错
\`\`\`

### 4.5 多来源组合

\`\`\`python
from pydantic_settings import BaseSettings, SettingsConfigDict, PydanticBaseSettingsSource, YamlConfigSettingsSource

class AppConfig(BaseSettings):
    app_name: str
    port: int = 8000
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        yaml_file="config.yaml",
    )

    @classmethod
    def settings_customise_sources(cls, settings_cls, init_settings, env_settings, dotenv_settings, file_secret_settings):
        # 优先级:命令行 > 环境变量 > .env > YAML > 默认值
        return (init_settings, env_settings, dotenv_settings, YamlConfigSettingsSource(settings_cls))

config = AppConfig()
\`\`\`

## 五、配置反模式 vs 正确做法

| 反模式 | 后果 | 正确做法 |
|--------|------|----------|
| 密码写进配置文件并进 Git | 密钥泄漏,被勒索 | 占位符 + 环境变量 + .gitignore |
| 所有环境共用一份配置 | 测试影响生产 | 分环境配置文件 |
| 配置不校验 | 运行时崩溃 | pydantic 启动时校验 |
| 默认值是生产密码 | 误用导致事故 | 默认值留空,强制 env |
| 同一配置散落多处 | 配置漂移 | 单一配置源 + 引用 |
| 把逻辑塞进配置 | 系统无法维护 | 逻辑留代码,值进配置 |
| 配置文件无注释 | 接手者看不懂 | 每个配置项加注释 |
| 配置无版本 | 出 bug 找不到原因 | 配置进 Git,带版本号 |
| 用 yaml.load() | 可执行任意代码 | 永远用 yaml.safe_load() |
| 硬编码默认值在多处 | 修改遗漏 | 集中在 Defaults 类 |

## 六、配置安全最佳实践

### 6.1 三层防御

1. **代码层**:pre-commit 钩子扫描密钥(detect-secrets、gitleaks)
2. **仓库层**:GitHub Secret Scanning、GitLab Secret Detection
3. **运行时**:密钥走 Secret Manager,不进文件系统

### 6.2 密钥轮换

\`\`\`text
# 反模式:一个密钥用 3 年
API_KEY=sk_live_abc123

# 正确:定期轮换,新旧密钥并存一段时间
# 当前密钥
API_KEY=sk_live_new456
# 旧密钥(过渡期保留,用于平滑切换)
API_KEY_PREVIOUS=sk_live_abc123
\`\`\`

### 6.3 最小权限

\`\`\`text
# 反模式:用一个超级管理员账号连数据库
DATABASE_URL=postgresql://admin:super_secret@db/app

# 正确:每个服务用独立账号,只授予必要权限
DATABASE_URL=postgresql://user_service:limited_pass@db/user_service_db
# user_service 账号只有 user_service_db 的读写权限
\`\`\`

## 七、配置中心:大型系统的选择

### 7.1 何时需要配置中心

| 信号 | 说明 |
|------|------|
| 服务数 > 50 | 配置散落,难以管理 |
| 配置变更频繁 | 每天改配置,频繁重启影响业务 |
| 需要动态生效 | 限流阈值、灰度比例要实时调整 |
| 多团队协作 | 配置需要审批、审计、回滚 |
| 跨环境同步 | 开发配置要同步到测试 |

### 7.2 主流配置中心

| 工具 | 出品方 | 特点 |
|------|--------|------|
| Apollo | 携程 | 中文友好,功能完整,Java 生态强 |
| Nacos | 阿里 | 注册中心 + 配置中心一体 |
| Consul | HashiCorp | 服务发现 + 配置 + 健康检查 |
| etcd | CNCF | K8s 底层用,轻量 KV |
| Spring Cloud Config | VMware | Spring 生态原生 |
| AWS AppConfig | AWS | AWS 原生 |

### 7.3 配置中心使用示例(Apollo)

\`\`\`python
from apollo_client import ApolloClient

client = ApolloClient(
    app_id="user-service",
    config_server="http://apollo.internal:8080",
    cluster="production",
    namespace="application",
)

# 启动时拉取配置
config = client.get_config()
print(config["db.host"])

# 监听配置变更(热更新)
def on_change(event):
    print(f"配置 {event.key} 从 {event.old_value} 变更为 {event.new_value}")
    # 热更新连接池、限流阈值等

client.add_change_listener(on_change)
\`\`\`

## 八、配置文档化

### 8.1 配置文件示例文档

每个配置文件都应该有配套文档,说明每个字段的含义、类型、范围、默认值。

\`\`\`markdown
# config/app.yaml 配置说明

## server
- host: 服务监听地址,默认 0.0.0.0
- port: 服务监听端口,1-65535,默认 8080
- workers: worker 进程数,1-100,默认 4
- timeout: 请求超时(秒),1-300,默认 30

## database
- host: 数据库地址
- port: 数据库端口,默认 5432
- user: 数据库用户名
- password: 数据库密码(从环境变量 DB_PASSWORD 读取)
- pool_size: 连接池大小,建议 10-50
\`\`\`

### 8.2 配置模板 .env.example

提交一个 \`.env.example\` 到 Git,列出所有需要的环境变量,但不写真实值:

\`\`\`bash
# .env.example(进 Git)
APP_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=           # 必填,从 Secret Manager 获取
API_KEY=               # 必填,从密钥管理服务获取
LOG_LEVEL=INFO
\`\`\`

新人接手项目时,\`cp .env.example .env\` 然后填值即可。

## 九、配置迁移策略

### 9.1 何时该迁移配置格式

| 信号 | 建议迁移到 |
|------|------------|
| INI 配置超过 200 行 | YAML 或 TOML |
| 用字符串模拟数组,split 代码遍布 | YAML 或 TOML |
| 配置有多层嵌套需求 | YAML 或 TOML |
| 新 Python 项目 | TOML(pyproject.toml) |
| K8s/Docker 部署 | YAML + 环境变量 |

### 9.2 迁移步骤

1. **新增新格式配置文件**,与旧格式并存
2. **配置加载层抽象接口**,支持新旧两种格式
3. **逐个迁移调用方**,先迁移非核心模块
4. **灰度切换**,新旧格式同时运行,验证一致性
5. **删除旧格式**,清理代码

\`\`\`python
# 抽象层示例
class ConfigLoader:
    def load(self, path):
        if path.endswith(".ini"):
            return self._load_ini(path)
        elif path.endswith(".yaml"):
            return self._load_yaml(path)
        elif path.endswith(".toml"):
            return self._load_toml(path)

# 迁移期:两种格式都能用
loader = ConfigLoader()
config = loader.load("config/app.yaml")   # 新格式
# 或
config = loader.load("config/app.ini")    # 旧格式
\`\`\`

## 十、本章小结

### 10.1 核心要点

1. **五大方案各有优劣**:INI 简单、JSON 通用、YAML 灵活、TOML 类型安全、env 部署友好。
2. **按场景选择**:Python 项目用 TOML,K8s/Docker 用 YAML,简单两段用 INI,API 用 JSON,敏感信息用环境变量。
3. **最佳实践**:配置与代码分离、敏感信息走环境变量、提供默认值、用 pydantic 校验、多环境配置、版本化。
4. **pydantic-settings** 是 Python 现代配置管理的首选。
5. **大型系统用配置中心**:Apollo/Nacos/Consul 实现动态配置。

### 10.2 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 密码进 Git | 写死在配置文件 | 占位符 + 环境变量 |
| 配置不校验 | 直接用字符串 | pydantic 启动校验 |
| 多环境共用代码 | 复制代码改值 | 同代码 + 多配置 |
| 配置散落多处 | yaml + compose + CI 各写 | 单一配置源 + 引用 |
| 用 yaml.load | 危险,可执行代码 | 用 yaml.safe_load |
| 默认值不安全 | 默认是生产密码 | 默认空,强制 env |
| 配置无注释 | 接手者看不懂 | 每项配注释 + 文档 |
| 用超级账号 | 权限过大风险高 | 最小权限账号 |
| 密钥不轮换 | 一个密钥用几年 | 定期轮换 + 过渡期 |
| 把逻辑塞进配置 | lambda 进配置 | 逻辑留代码 |

### 10.3 全系列总结

本系列《Python 工程化实战教程 - 配置文件篇》共五章:

1. **第 1 章**:为什么需要配置文件 —— 建立配置思维
2. **第 2 章**:INI 配置 —— 简单两段场景的标准选择
3. **第 3 章**:YAML 配置 —— 复杂嵌套和云原生场景的统治者
4. **第 4 章**:TOML 配置 —— Python 项目元数据的现代标准
5. **第 5 章**:横向对比与最佳实践 —— 工程化决策框架

掌握这五章,你已经具备:
- 选择合适配置格式的能力
- 工业级配置管理的能力
- 配置安全与最佳实践的意识
- 用 pydantic + 配置文件构建现代配置系统的能力

**记住**:工具会变,工程化思维长存。配置管理的核心不是某个库或某个格式,而是"分离变化、安全第一、校验兜底"的思维。`,
  },
];
