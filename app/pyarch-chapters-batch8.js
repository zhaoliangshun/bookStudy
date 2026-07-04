// =============================================================
// Python 设计思想与架构教程 - 第 8 批章节(微服务架构 + 消息队列)
// =============================================================

export const chapters = [
  {
    id: "pyarch-microservices-intro",
    icon: "🔮",
    title: "微服务架构概览",
    group: "微服务架构",
    content: `# 微服务架构概览

## 一、什么是微服务

微服务(Microservices)是一种架构风格,其核心思想是:**将单一应用程序拆分为一组小的服务,每个服务独立运行、独立部署,服务之间通过轻量级机制通信**。

> 用一句话概括:**「一个大系统,拆成若干小服务,各跑各的,各部署各的,通过 API 协作」**。

每个微服务:
- 围绕**业务能力**构建
- 由**小团队**独立维护
- 用**独立进程**运行
- 拥有**独立的数据存储**
- 通过**网络调用**协作(HTTP/gRPC/消息)

### 1.1 微服务的典型形态

\`\`\`
                          ┌──────────────┐
                          │   客户端     │
                          │ Web/App/小程序│
                          └──────┬───────┘
                                 │
                          ┌──────▼───────┐
                          │  API 网关    │
                          │ (Gateway)    │
                          └──┬───┬───┬───┘
                             │   │   │
              ┌──────────────┘   │   └──────────────┐
              │                  │                  │
       ┌──────▼─────┐    ┌──────▼─────┐    ┌───────▼────┐
       │ user-service│   │ post-service│   │comment-svc │
       │  :8001      │   │  :8002      │   │  :8003     │
       │  user DB    │   │  post DB    │   │ comment DB │
       └─────────────┘   └─────────────┘   └────────────┘
\`\`\`

每个服务都有自己的端口、进程、数据库,互不干涉。

### 1.2 微服务最简骨架

\`\`\`python
# user-service/main.py
from fastapi import FastAPI

app = FastAPI(title="User Service")

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "张三", "email": "zhangsan@example.com"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "user-service"}
\`\`\`

\`\`\`python
# post-service/main.py
from fastapi import FastAPI

app = FastAPI(title="Post Service")

@app.get("/posts/{post_id}")
def get_post(post_id: int):
    return {"id": post_id, "title": "我的第一篇", "author_id": 1}

@app.get("/health")
def health():
    return {"status": "ok", "service": "post-service"}
\`\`\`

两个服务互不知道对方存在,各自跑在 8001/8002,通过 HTTP 调用协作。

## 二、微服务的历史演进

### 2.1 单体时代(2000 年前)

\`\`\`
┌─────────────────────────────────────────┐
│            单体应用 (Monolith)           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 用户 │ │ 文章 │ │ 评论 │ │ 订单 │    │
│  ├──────┤ ├──────┤ ├──────┤ ├──────┤    │
│  │ 用户 │ │ 文章 │ │ 评论 │ │ 订单 │    │
│  │ 模块 │ │ 模块 │ │ 模块 │ │ 模块 │    │
│  └──────┘ └──────┘ └──────┘ └──────┘    │
│           共享同一个数据库                │
│           打成一个 war/jar 部署           │
└─────────────────────────────────────────┘
\`\`\`

特点:所有功能在一个进程里,方法调用即可,简单直接。但**代码量一上来就臃肿**,改一处要重新部署整个应用。

### 2.2 SOA 时代(2000-2010)

面向服务架构(Service-Oriented Architecture),用 ESB(企业服务总线)把多个服务串起来。

\`\`\`
   ┌──────────┐   ┌──────────┐
   │ Service A│   │ Service B│
   └────┬─────┘   └────┬─────┘
        │              │
        └──────┬───────┘
               │
        ┌──────▼──────┐
        │     ESB     │  ← 重量级总线
        │(企业服务总线)│
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ Service C   │
        └─────────────┘
\`\`\`

ESB 太重,通常用 SOAP/XML,性能差、实现复杂,逐渐被淘汰。

### 2.3 微服务时代(2014 至今)

2014 年 Martin Fowler 和 James Lewis 发表《Microservices》一文,正式定义「微服务」:

> 微服务是小型自治服务,协同工作,围绕业务能力构建,可独立部署。

代表技术:Spring Cloud(Java)、Go kit(Go)、Nameko(Python)、Istio(服务网格)。

\`\`\`
单体 → SOA → 微服务 → 服务网格(Service Mesh)
\`\`\`

演进的本质是「**解耦粒度越来越细**」。

## 三、微服务核心特征

### 3.1 单一职责(Single Responsibility)

每个服务只做一件事,且做好。比如:

- user-service:只管用户注册/登录/资料
- post-service:只管文章 CRUD
- comment-service:只管评论
- notification-service:只管发邮件/短信

不要把「用户管理」和「文章管理」塞进同一个服务。

### 3.2 独立部署(Independent Deployment)

每个服务可以**单独发布**,不影响其他服务:

\`\`\`bash
# 单独部署 user-service
docker build -t user-service:v1.2 ./user-service
docker run -d -p 8001:8000 user-service:v1.2

# 单独部署 post-service
docker build -t post-service:v2.0 ./post-service
docker run -d -p 8002:8000 post-service:v2.0
\`\`\`

团队 A 改 user-service 上线,完全不用动 post-service,这是单体做不到的。

### 3.3 去中心化数据(Decentralized Data)

这是微服务**最硬核**的一条:每个服务**有自己的数据库**,不允许跨服务访问别的服务的数据库。

\`\`\`
单体(共享数据库):
┌─────────────────────────────┐
│  用户模块 │ 文章模块 │ 评论模块│
│      └──────┬───────┘       │
│         ┌────▼────┐         │
│         │  Big DB │         │
│         └─────────┘         │
└─────────────────────────────┘

微服务(独立数据库):
┌──────────┐  ┌──────────┐  ┌──────────┐
│user-svc  │  │post-svc  │  │comment-svc│
│ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐  │
│ │UserDB│ │  │ │PostDB│ │  │ │ComDB │  │
│ └──────┘ │  │ └──────┘ │  │ └──────┘  │
└──────────┘  └──────────┘  └──────────┘
\`\`\`

为什么这么硬?因为**数据库共享 = 物理耦合**。一旦两个服务读写同一张表,改表结构会同时影响两个服务,就退化成单体了。

### 3.4 轻量级通信(Lightweight Communication)

服务间不用 ESB,而是用:

- HTTP/REST(JSON)
- gRPC(Protocol Buffers)
- 消息队列(异步解耦)

\`\`\`python
# 服务间 HTTP 调用
import httpx

async def get_user(user_id: int):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"http://user-service:8001/users/{user_id}")
        return resp.json()
\`\`\`

### 3.5 技术多样性(Polyglot)

不同服务可以用不同语言、不同数据库:

| 服务       | 语言   | 数据库      | 理由                |
|------------|--------|-------------|---------------------|
| user-svc   | Python | PostgreSQL  | 事务强一致          |
| search-svc | Go     | Elasticsearch| 高并发搜索         |
| rec-svc    | Python | Redis       | 推荐算法用 Python 方便|
| log-svc    | Rust   | ClickHouse  | 高吞吐写日志        |

这是单体做不到的——单体里所有模块共享同一套技术栈。

## 四、单体 vs 微服务对比

| 维度        | 单体架构                | 微服务架构                   |
|-------------|-------------------------|------------------------------|
| 部署        | 一个包,整体部署        | 多个服务,独立部署           |
| 扩展        | 整体复制,无法按需      | 按服务单独扩展(如只扩 post)|
| 团队协作    | 一群人改同一份代码      | 一个团队一个服务             |
| 代码复杂度  | 单仓库代码量巨大        | 每个服务小而清晰             |
| 系统复杂度  | 低(进程内调用)        | 高(网络、分布式)           |
| 数据一致性  | 一个事务搞定            | 需要分布式事务/saga          |
| 调试        | 本地起一个进程即可      | 需要起多个服务,链路追踪     |
| 性能        | 进程内调用,极快        | 网络调用,有延迟             |
| 技术栈      | 统一                    | 可多样化                     |
| 上手难度    | 低                      | 高                           |
| 适合阶段    | 早期、小团队            | 成熟期、大团队               |

**一句话总结**:单体简单粗暴,微服务灵活但复杂。

## 五、何时该用微服务,何时不该用

### 5.1 康威定律(Conway's Law)

> 任何设计系统的组织,其产出的系统结构会等同于该组织的沟通结构。

\`\`\`
团队结构 → 决定 → 系统结构

3 个团队 → 3 个微服务(自然划分)
1 个团队 → 1 个单体(强行拆微服务是自虐)
\`\`\`

如果你只有 3 个开发,拆 10 个微服务,运维会拖死你。

### 5.2 该用微服务的信号

- 团队规模 > 10 人,且分多个小组
- 业务边界清晰(用户、订单、商品明显独立)
- 单体发布一次要协调多个团队
- 部分模块需要单独扩展(如秒杀模块)
- 不同模块用不同技术栈更合适

### 5.3 不该用微服务的信号

- 团队 < 5 人
- 业务还在快速变化,边界不清
- 没有 DevOps / K8s 运维能力
- 流量不大,单体扛得住
- 老板说「我们要用微服务因为很潮」← 这是坑

### 5.4 决策清单

\`\`\`
□ 团队规模 > 10 人?
□ 业务边界清晰?
□ 有 CI/CD 自动化部署能力?
□ 有容器化(K8s)运维能力?
□ 有监控/链路追踪基础设施?
□ 单体已经成为发布瓶颈?

≥ 4 个「是」→ 考虑微服务
< 4 个「是」→ 用模块化单体
\`\`\`

## 六、微服务的代价

### 6.1 分布式复杂度

\`\`\`
单体:user = get_user(id)  # 进程内调用,0.1ms
微服务:user = await http.get(...)  # 网络调用,5-50ms
\`\`\`

网络不可靠,要处理超时、重试、熔断、降级。一个看似简单的「查用户」,变成了一堆分布式问题。

### 6.2 数据一致性

单体里扣库存 + 下订单是一个数据库事务:

\`\`\`python
# 单体事务
with db.transaction():
    deduct_stock(item_id)
    create_order(user_id)
\`\`\`

微服务里库存和订单是两个服务的两个数据库,没有跨库事务,要用 **Saga 模式** 或 **最终一致性**:

\`\`\`python
# 微服务 saga(简化)
order = create_order(user_id)        # 订单服务
try:
    deduct_stock(item_id)            # 库存服务
except TimeoutError:
    cancel_order(order.id)           # 补偿事务
\`\`\`

### 6.3 运维成本

单体部署 1 个进程,微服务部署 N 个进程 + N 个数据库 + 网关 + 注册中心 + 配置中心 + 链路追踪 + 监控……

\`\`\`
单体运维:1 个 Docker 容器
微服务运维:10 个容器 + K8s + Prometheus + Jaeger + ELK + ...
\`\`\`

运维成本是单体数倍。

## 七、Python 微服务生态

### 7.1 技术选型

| 组件        | Python 选项                     |
|-------------|---------------------------------|
| Web 框架    | FastAPI / Flask / Nameko        |
| RPC 框架    | grpcio / thrift                 |
| 消息队列    | pika(RabbitMQ)/ confluent-kafka|
| 服务发现    | consul / etcd / Nacos           |
| 配置中心    | Nacos / Apollo / Consul KV      |
| 链路追踪    | OpenTelemetry / Jaeger          |
| 容器化      | Docker                          |
| 编排        | Kubernetes / Docker Compose     |
| 监控        | Prometheus + Grafana            |

### 7.2 FastAPI 做微服务的优势

- 异步原生支持(async/await),适合 IO 密集的服务间调用
- 自动生成 OpenAPI 文档,方便服务间契约
- Pydantic 数据校验,接口契约清晰
- 性能在 Python Web 框架里名列前茅

### 7.3 一个最小微服务示例

\`\`\`python
# user-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="User Service", version="1.0.0")

class User(BaseModel):
    id: int
    name: str
    email: str

# 模拟数据库
USERS = {
    1: User(id=1, name="张三", email="zhangsan@example.com"),
    2: User(id=2, name="李四", email="lisi@example.com"),
}

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    if user_id not in USERS:
        raise HTTPException(status_code=404, detail="User not found")
    return USERS[user_id]

@app.get("/health")
def health():
    return {"status": "ok", "service": "user-service", "version": "1.0.0"}
\`\`\`

\`\`\`bash
# 启动
uvicorn main:app --host 0.0.0.0 --port 8001
\`\`\`

## 八、实战:把单体博客拆成微服务

### 8.1 单体博客结构

\`\`\`
blog-monolith/
├── main.py            # 入口,所有路由
├── models.py          # 所有 ORM 模型
├── services.py        # 所有业务逻辑
└── templates/         # 所有页面
\`\`\`

\`\`\`python
# 单体 main.py(伪代码)
@app.get("/users/{id}")
def get_user(id): ...

@app.get("/posts/{id}")
def get_post(id): ...

@app.get("/posts/{id}/comments")
def get_comments(id): ...
\`\`\`

所有功能在一个进程,共享一个数据库。

### 8.2 拆分思路

按业务能力拆:
- **用户域**:注册、登录、资料 → user-service
- **文章域**:发文章、改文章、列表 → post-service
- **评论域**:评论、回复 → comment-service

### 8.3 拆分后的目录

\`\`\`
blog-microservices/
├── user-service/
│   ├── main.py
│   ├── models.py       # 只 User 模型
│   ├── Dockerfile
│   └── requirements.txt
├── post-service/
│   ├── main.py
│   ├── models.py       # 只 Post 模型
│   ├── Dockerfile
│   └── requirements.txt
├── comment-service/
│   ├── main.py
│   ├── models.py       # 只 Comment 模型
│   ├── Dockerfile
│   └── requirements.txt
├── gateway/            # API 网关
│   └── main.py
└── docker-compose.yml
\`\`\`

### 8.4 docker-compose 编排

\`\`\`yaml
# docker-compose.yml
version: "3.9"
services:
  user-service:
    build: ./user-service
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@user-db:5432/users
    depends_on:
      - user-db

  user-db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: users

  post-service:
    build: ./post-service
    ports:
      - "8002:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@post-db:5432/posts
    depends_on:
      - post-db

  post-db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: posts

  comment-service:
    build: ./comment-service
    ports:
      - "8003:8000"

  gateway:
    build: ./gateway
    ports:
      - "8000:8000"
    depends_on:
      - user-service
      - post-service
      - comment-service
\`\`\`

\`\`\`bash
docker-compose up -d
\`\`\`

### 8.5 服务间调用

post-service 显示文章时,需要作者信息(作者存在 user-service):

\`\`\`python
# post-service/main.py
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()

async def get_user(user_id: int):
    """通过 HTTP 调用 user-service 获取作者信息。"""
    async with httpx.AsyncClient(timeout=3.0) as client:
        try:
            resp = await client.get(f"http://user-service:8000/users/{user_id}")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError:
            # 降级:作者信息获取失败时返回默认值
            return {"id": user_id, "name": "未知作者", "email": ""}

@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    post = POSTS.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # 跨服务调用获取作者
    author = await get_user(post["author_id"])
    return {
        "id": post["id"],
        "title": post["title"],
        "content": post["content"],
        "author": author,
    }
\`\`\`

## 九、微服务的部署形态演进

### 9.1 物理机部署

每个服务跑在一台机器上,简单但难扩展。

### 9.2 虚拟机部署

每个服务一个虚拟机,资源隔离,但启动慢。

### 9.3 容器化部署(Docker)

每个服务一个容器,轻量、秒级启动。

\`\`\`dockerfile
# user-service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### 9.4 容器编排(Kubernetes)

K8s 管理容器的生命周期、扩缩容、滚动发布、服务发现。

\`\`\`yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:v1.0.0
        ports:
        - containerPort: 8000
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
\`\`\`

### 9.5 服务网格(Service Mesh)

Istio/Linkerd 把通信、熔断、链路追踪下沉到 sidecar,业务代码不感知。

\`\`\`
┌─────────────────────────────────┐
│           Pod                    │
│  ┌──────────┐    ┌──────────┐    │
│  │ 业务容器 │◄──►│ Sidecar  │    │
│  │ (FastAPI)│    │ (Envoy)  │    │
│  └──────────┘    └────┬─────┘    │
└───────────────────────┼─────────┘
                        │
                   所有流量经 Sidecar
                   (熔断/重试/追踪)
\`\`\`

## 十、易错点小结

| 易错点                                    | 后果                        | 正确做法                              |
|-------------------------------------------|-----------------------------|---------------------------------------|
| 服务间共享数据库                          | 表结构变更影响多个服务      | 每服务独立数据库,通过 API 交互       |
| 拆得太细(纳米服务)                      | 服务数量爆炸,运维噩梦      | 按业务能力拆,一个服务一个清晰职责   |
| 服务间强耦合(同步调用链太长)            | 一处慢全链路慢              | 异步解耦,引入消息队列                |
| 没有服务发现,IP 写死                     | 实例迁移后调用失败          | 用注册中心(Consul/Nacos)            |
| 没有熔断/降级                            | 雪崩效应,整个系统挂        | 加熔断器(如 circuitbreaker)         |
| 跨服务 JOIN 查询                          | 性能差,违反去中心化        | 数据冗余或聚合查询                    |
| 没有链路追踪                             | 出问题查不到哪个服务挂      | 上 OpenTelemetry + Jaeger            |
| 一个数据库事务跨多个服务                 | 数据不一致                  | 用 Saga / 最终一致性                  |
| 团队小却硬上微服务                       | 运维拖死团队                | 用模块化单体,等团队大了再拆          |
| 没有契约管理,接口随意改                 | 调用方频繁报错              | 用 OpenAPI/gRPC 契约 + 版本管理       |
| 没有健康检查                             | K8s 把流量打到挂的实例      | 暴露 /health 端点 + liveness/readiness|
| 服务版本不兼容直接上线                   | 调用方崩溃                  | 灰度发布 + 向后兼容 + 版本号          |

---

## 本讲小结

微服务不是银弹,它**用复杂度换灵活性**。核心一句话:**「小服务、独立部署、独立数据、轻量通信」**。

记住三件事:
1. **不是所有项目都该上微服务**——团队小、业务简单,单体更香。
2. **去中心化数据是底线**——共享数据库就退化成单体了。
3. **运维能力是前提**——没有 CI/CD、监控、链路追踪,微服务是灾难。

下一章我们深入「服务间通信」,讲清楚 HTTP/gRPC/消息队列这些协作机制。
`,
  },
  {
    id: "pyarch-service-communication",
    icon: "📡",
    title: "服务间通信",
    group: "微服务架构",
    content: `# 服务间通信

## 一、为什么服务间通信是个大问题

单体里调用另一个模块:

\`\`\`python
# 单体:直接方法调用
user = user_service.get_user(user_id)  # 0.01ms,几乎免费
\`\`\`

微服务里:

\`\`\`python
# 微服务:网络调用
user = await httpx.get(f"http://user-service/users/{user_id}")  # 5-50ms
\`\`\`

**网络是不可靠的**:会超时、会丢包、会乱序、服务会挂。所以微服务通信不是「换个调用方式」这么简单,而是一整套分布式系统设计问题。

## 二、同步通信 vs 异步通信

### 2.1 同步通信

调用方**阻塞等待**响应:

\`\`\`
调用方 ──请求──► 服务方
调用方 ◄──响应── 服务方
(调用方一直等,期间干不了别的)
\`\`\`

代表:HTTP/REST、gRPC、Thrift。

**优点**:简单直接,立即知道结果。
**缺点**:调用方被阻塞,服务方挂了调用方也受影响。

### 2.2 异步通信

调用方**发完就走**,不等待响应:

\`\`\`
调用方 ──发消息──► 队列 ──► 服务方
调用方 立即返回
(服务方慢慢处理,处理完再通知)
\`\`\`

代表:消息队列(RabbitMQ/Kafka)、事件总线。

**优点**:解耦、削峰、调用方不被阻塞。
**缺点**:不立即知道结果,需要回调或轮询。

### 2.3 对比

| 维度        | 同步通信                | 异步通信                  |
|-------------|-------------------------|---------------------------|
| 响应方式    | 阻塞等待                | 发完即返回                |
| 耦合度      | 高(必须知道对方地址)  | 低(只管发消息)          |
| 性能        | 低(等待网络)          | 高(立即返回)            |
| 可用性      | 低(对方挂自己也挂)    | 高(队列缓冲)            |
| 一致性      | 强(立即知道结果)      | 最终(异步处理)          |
| 调试        | 容易(一条链路)        | 难(要追消息)            |
| 适用场景    | 查询、需要立即结果      | 通知、任务、解耦          |

## 三、同步通信:HTTP/REST

### 3.1 REST 风格

REST(Representational State Transfer)用 HTTP 方法表达意图:

| 方法    | 语义         | 示例                          |
|---------|--------------|-------------------------------|
| GET     | 查询         | GET /users/1                  |
| POST    | 创建         | POST /users                   |
| PUT     | 全量更新     | PUT /users/1                  |
| PATCH   | 部分更新     | PATCH /users/1                |
| DELETE  | 删除         | DELETE /users/1               |

### 3.2 Python HTTP 客户端

\`\`\`python
# requests(同步,简单)
import requests

resp = requests.get("http://user-service:8001/users/1", timeout=3.0)
if resp.status_code == 200:
    user = resp.json()
\`\`\`

\`\`\`python
# httpx(异步,推荐用于 FastAPI)
import httpx

async def get_user(user_id: int):
    async with httpx.AsyncClient(timeout=3.0) as client:
        resp = await client.get(f"http://user-service:8001/users/{user_id}")
        resp.raise_for_status()
        return resp.json()
\`\`\`

### 3.3 REST 的优缺点

**优点**:
- 通用,所有语言都支持 HTTP
- 可读性好,JSON 人能读
- 浏览器/curl 直接调
- 调试方便

**缺点**:
- 文本协议(JSON),性能不如二进制
- 没有强类型契约,容易写错字段
- 多次往返:取一个用户和他的 10 篇文章要 11 次请求

## 四、同步通信:gRPC

### 4.1 gRPC 是什么

gRPC 是 Google 开源的高性能 RPC 框架:
- 基于 **HTTP/2**(多路复用、头部压缩)
- 用 **Protocol Buffers**(protobuf)做序列化(二进制,比 JSON 小快)
- 支持双向流式通信
- 跨语言(用 .proto 定义,自动生成各语言客户端)

### 4.2 Protocol Buffers

用 .proto 文件定义接口契约:

\`\`\`protobuf
// user.proto
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
}

message GetUserRequest {
  int32 user_id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}
\`\`\`

### 4.3 生成 Python 代码

\`\`\`bash
# 安装工具
pip install grpcio grpcio-tools

# 生成 user_pb2.py 和 user_pb2_grpc.py
python -m grpc_tools.protoc \\
    --proto_path=. \\
    --python_out=. \\
    --grpc_python_out=. \\
    user.proto
\`\`\`

### 4.4 实现 gRPC 服务端

\`\`\`python
# user_grpc_server.py
import grpc
from concurrent import futures
import user_pb2
import user_pb2_grpc

class UserServiceServicer(user_pb2_grpc.UserServiceServicer):
    def GetUser(self, request, context):
        user_id = request.user_id
        # 模拟查数据库
        if user_id == 1:
            return user_pb2.User(id=1, name="张三", email="zhangsan@example.com")
        else:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("User not found")
            return user_pb2.User()

    def ListUsers(self, request, context):
        users = [
            user_pb2.User(id=1, name="张三", email="zhangsan@example.com"),
            user_pb2.User(id=2, name="李四", email="lisi@example.com"),
        ]
        return user_pb2.ListUsersResponse(users=users, total=len(users))

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    user_pb2_grpc.add_UserServiceServicer_to_server(UserServiceServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("gRPC server listening on :50051")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
\`\`\`

### 4.5 实现 gRPC 客户端

\`\`\`python
# user_grpc_client.py
import grpc
import user_pb2
import user_pb2_grpc

def get_user(user_id: int):
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = user_pb2_grpc.UserServiceStub(channel)
        try:
            response = stub.GetUser(user_pb2.GetUserRequest(user_id=user_id), timeout=3.0)
            print(f"User: {response.id} - {response.name} - {response.email}")
            return response
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.NOT_FOUND:
                print(f"User {user_id} not found")
            else:
                print(f"gRPC error: {e.code()} - {e.details()}")

if __name__ == "__main__":
    get_user(1)
\`\`\`

### 4.6 gRPC 四种调用模式

| 模式                | 说明                       | 适用场景                |
|---------------------|----------------------------|-------------------------|
| 一元调用 (Unary)    | 请求-响应,类似 HTTP       | 普通查询                |
| 服务端流 (Server)   | 客户端一请求,服务端多响应 | 大数据分块、实时推送    |
| 客户端流 (Client)   | 客户端多请求,服务端一响应 | 批量上传、聚合          |
| 双向流 (Bi-stream)  | 双方互发                   | 聊天、实时协作          |

\`\`\`protobuf
// 服务端流
rpc StreamLogs(LogRequest) returns (stream LogEntry);

// 客户端流
rpc UploadChunks(stream Chunk) returns (UploadResponse);

// 双向流
rpc Chat(stream Message) returns (stream Message);
\`\`\`

### 4.7 gRPC vs REST

| 维度       | REST                 | gRPC                    |
|------------|----------------------|-------------------------|
| 协议       | HTTP/1.1             | HTTP/2                  |
| 序列化     | JSON(文本)         | Protobuf(二进制)      |
| 性能       | 中                   | 高(快 5-10 倍)        |
| 契约       | OpenAPI(可选)      | .proto(强制)           |
| 流式       | 不支持(需 WebSocket)| 原生支持                |
| 浏览器支持 | 原生                 | 需要 gRPC-Web 代理      |
| 可读性     | 高(JSON 能读)      | 低(二进制)            |
| 适用场景   | 对外 API、Web        | 内部服务间高性能调用    |

## 五、异步通信:消息队列

### 5.1 消息队列通信模式

\`\`\`
生产者 ──发消息──► [ 队列 ] ──► 消费者
                     │
                     └─ 持久化存储,消费者挂了不丢

生产者不关心谁消费,消费者不关心谁生产
\`\`\`

### 5.2 何时用消息队列

- **不需要立即结果**:下单后发邮件,可以异步
- **削峰填谷**:秒杀时积压订单慢慢处理
- **解耦**:订单服务不关心有多少下游服务
- **广播**:配置变更通知所有服务

(消息队列的详细内容见第 5-8 章)

## 六、服务调用模式

### 6.1 请求-响应(Request-Response)

最常见的同步模式:

\`\`\`
A ──请求──► B
A ◄──响应── B
\`\`\`

用于查询、需要立即结果的场景。

\`\`\`python
user = await client.get(f"http://user-svc/users/{id}")  # 请求-响应
\`\`\`

### 6.2 通知(Notification / Fire-and-Forget)

发完就忘,不等响应:

\`\`\`
A ──消息──► [队列] ──► B
A 立即返回
\`\`\`

用于日志、监控、事件通知。

\`\`\`python
# 发布消息后立即返回
channel.basic_publish(exchange="", routing_key="logs", body="user logged in")
return {"status": "ok"}  # 不等日志服务处理
\`\`\`

### 6.3 请求-异步响应(Request-Async Response)

发请求时带个回调地址,服务方处理完异步回调:

\`\`\`
A ──请求(带回调 ID)──► B
A 立即返回
                       B 处理中...
A ◄──回调(带 ID)────── B
\`\`\`

用于耗时操作(如视频转码、AI 推理)。

\`\`\`python
# 提交转码任务,带回调
task_id = submit_transcode(video_url, callback_url="http://a-svc/callback")
return {"task_id": task_id}  # 立即返回

# B 处理完后回调 A
@app.post("/callback")
def callback(payload):
    if payload["task_id"] == task_id:
        save_result(payload["result_url"])
\`\`\`

## 七、服务发现

### 7.1 为什么需要服务发现

单体里 IP 写死没问题(就一个进程)。微服务里:
- 服务实例可能动态扩缩容(从 3 个变 10 个)
- 实例可能挂掉重启(IP 变化)
- K8s 里 Pod IP 是动态的

\`\`\`
❌ 错误:把 IP 写死
client.get("http://10.0.0.5:8001/users/1")

✅ 正确:用服务名
client.get("http://user-service/users/1")
                  ↑
          服务发现解析为某个实例 IP
\`\`\`

### 7.2 客户端发现(Client-Side Discovery)

客户端**自己**查询注册中心,拿到所有实例,自己负载均衡:

\`\`\`
客户端 ──查询──► 注册中心
客户端 ◄──实例列表── 注册中心
客户端 ──选一个──► 实例 A
\`\`\`

代表:Netflix Eureka + Ribbon。

\`\`\`python
import httpx
import random

async def get_instances(service_name: str):
    """从注册中心查询实例列表。"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"http://consul:8500/v1/health/service/{service_name}")
        return [inst["Service"]["Address"] for inst in resp.json()]

async def call_service(service_name: str, path: str):
    instances = await get_instances(service_name)
    target = random.choice(instances)  # 客户端负载均衡
    async with httpx.AsyncClient() as client:
        return await client.get(f"http://{target}{path}")
\`\`\`

### 7.3 服务端发现(Server-Side Discovery)

客户端**只调一个固定地址**(网关/负载均衡器),由它去查询注册中心并转发:

\`\`\`
客户端 ──► 负载均衡器 ──查询──► 注册中心
                            └─选实例──► 实例 B
\`\`\`

代表:K8s Service、Nginx + Consul、Envoy。

\`\`\`python
# 客户端只调一个地址
client.get("http://user-service/users/1")  # K8s Service 负责转发
\`\`\`

### 7.4 客户端 vs 服务端发现

| 维度      | 客户端发现           | 服务端发现             |
|-----------|----------------------|------------------------|
| 客户端复杂度 | 高(要负载均衡)    | 低(只调一个地址)    |
| 语言耦合  | 高(每语言实现一套) | 低(网关统一处理)    |
| 性能      | 高(少一跳)        | 中(多一跳)          |
| 代表      | Eureka + Ribbon      | K8s Service            |

## 八、负载均衡

### 8.1 客户端负载均衡

客户端从注册中心拿到实例列表,自己选一个调用:

\`\`\`python
# 轮询
class RoundRobin:
    def __init__(self):
        self.counter = 0
    def pick(self, instances):
        target = instances[self.counter % len(instances)]
        self.counter += 1
        return target

# 随机
target = random.choice(instances)

# 加权随机(按实例性能)
target = random.choices(instances, weights=[3, 1, 1])[0]
\`\`\`

### 8.2 服务端负载均衡

用一个中间层(LB/网关)统一转发:

\`\`\`
客户端 ──► [ Nginx/LB ] ──► 实例 A / B / C
\`\`\`

Nginx 配置:

\`\`\`nginx
upstream user_service {
    server 10.0.0.1:8001;
    server 10.0.0.2:8001;
    server 10.0.0.3:8001;
}

server {
    location /users/ {
        proxy_pass http://user_service;
    }
}
\`\`\`

### 8.3 负载均衡算法

| 算法         | 说明                       | 适用         |
|--------------|----------------------------|--------------|
| 轮询         | 依次分配                   | 实例性能一致 |
| 加权轮询     | 按权重分配                 | 性能不一     |
| 随机         | 随机选                     | 简单场景     |
| 最少连接     | 选当前连接数最少的         | 长连接       |
| 一致性哈希   | 同一 key 固定到同一实例    | 缓存、会话   |
| IP 哈希      | 同一 IP 固定到同一实例     | 会话保持     |

## 九、Python 实战:user-service 调用 post-service

### 9.1 HTTP 版本

\`\`\`python
# user-service 调用 post-service 获取用户文章列表
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()

POST_SERVICE_URL = "http://post-service:8000"

@app.get("/users/{user_id}/posts")
async def get_user_posts(user_id: int):
    # 先查用户(本地)
    user = USERS.get(user_id)
    if not user:
        raise HTTPException(404, "User not found")

    # 再调 post-service 查文章(远程)
    async with httpx.AsyncClient(timeout=3.0) as client:
        try:
            resp = await client.get(f"{POST_SERVICE_URL}/posts", params={"author_id": user_id})
            resp.raise_for_status()
            posts = resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(502, f"Post service error: {e.response.status_code}")
        except httpx.RequestError:
            # 降级:post-service 挂了,返回空列表
            posts = []

    return {
        "user": user,
        "posts": posts,
    }
\`\`\`

### 9.2 gRPC 版本

\`\`\`protobuf
// post.proto
syntax = "proto3";
package post;

service PostService {
  rpc ListPostsByAuthor (ListPostsRequest) returns (ListPostsResponse);
}

message ListPostsRequest {
  int32 author_id = 1;
}

message Post {
  int32 id = 1;
  string title = 2;
  string content = 3;
  int32 author_id = 4;
}

message ListPostsResponse {
  repeated Post posts = 1;
}
\`\`\`

\`\`\`python
# user-service 用 gRPC 调 post-service
import grpc
import post_pb2
import post_pb2_grpc
from fastapi import FastAPI

app = FastAPI()

def get_user_posts_grpc(author_id: int):
    with grpc.insecure_channel("post-service:50051") as channel:
        stub = post_pb2_grpc.PostServiceStub(channel)
        try:
            response = stub.ListPostsByAuthor(
                post_pb2.ListPostsRequest(author_id=author_id),
                timeout=3.0,
            )
            return [
                {"id": p.id, "title": p.title, "content": p.content}
                for p in response.posts
            ]
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.UNAVAILABLE:
                return []  # 降级
            raise

@app.get("/users/{user_id}/posts")
def get_user_posts(user_id: int):
    user = USERS.get(user_id)
    posts = get_user_posts_grpc(user_id)
    return {"user": user, "posts": posts}
\`\`\`

gRPC 版本比 HTTP 版本快 5-10 倍,适合高频内部调用。

## 十、通信可靠性:重试、超时、熔断、舱壁

### 10.1 超时(Timeout)

调用必须设超时,否则服务方挂了调用方会无限等:

\`\`\`python
# ❌ 错误:没超时
resp = httpx.get("http://post-service/posts")

# ✅ 正确:设超时
resp = httpx.get("http://post-service/posts", timeout=3.0)
\`\`\`

### 10.2 重试(Retry)

网络抖动时重试几次:

\`\`\`python
import httpx
import time

def call_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            resp = httpx.get(url, timeout=3.0)
            resp.raise_for_status()
            return resp.json()
        except (httpx.HTTPError, httpx.TimeoutException):
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # 指数退避:1s, 2s, 4s
\`\`\`

**注意**:重试要带**幂等性**——GET 可以重试,POST/PUT 要小心重复创建。

### 10.3 熔断(Circuit Breaker)

当服务方连续失败到一定次数,**熔断器打开**,后续请求直接失败,不再调用:

\`\`\`
   闭合(Closed)──失败率>阈值──► 打开(Open)
      ▲                              │
      │                              │ 经过冷却时间
      │                              ▼
      └──────── 半开(Half-Open)◄──┘
                     │
                  试探请求成功 → 闭合
                  试探请求失败 → 打开
\`\`\`

\`\`\`python
# 简化版熔断器
import time

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=30):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.last_failure_time = None
        self.state = "closed"  # closed / open / half_open

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half_open"
            else:
                raise Exception("Circuit breaker is open")

        try:
            result = func(*args, **kwargs)
            if self.state == "half_open":
                self.state = "closed"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            raise

breaker = CircuitBreaker()

@app.get("/posts/{id}")
def get_post(id: int):
    return breaker.call(lambda: get_post_from_post_service(id))
\`\`\`

### 10.4 舱壁(Bulkhead)

隔离资源,防止一个服务拖垮整个系统:

\`\`\`
┌─────────────────────────────────────┐
│            调用方进程                 │
│  ┌──────────┐  ┌──────────┐         │
│  │ 线程池 A  │  │ 线程池 B  │        │
│  │ (调 post)│  │ (调 user)│        │
│  └────┬─────┘  └────┬─────┘         │
│       │              │              │
│  post 挂了只影响池 A,user 不受影响   │
└─────────────────────────────────────┘
\`\`\`

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

post_pool = ThreadPoolExecutor(max_workers=10)
user_pool = ThreadPoolExecutor(max_workers=10)

def call_post_service():
    return post_pool.submit(lambda: httpx.get("http://post-service/posts").json())

def call_user_service():
    return user_pool.submit(lambda: httpx.get("http://user-service/users").json())
\`\`\`

### 10.5 降级(Fallback)

服务方不可用时返回兜底数据:

\`\`\`python
async def get_user(user_id):
    try:
        return await httpx.get(f"http://user-service/users/{user_id}", timeout=2.0)
    except httpx.RequestError:
        # 降级:返回缓存或默认值
        return {"id": user_id, "name": "未知用户", "email": ""}
\`\`\`

## 十一、易错点小结

| 易错点                          | 后果                       | 正确做法                            |
|---------------------------------|----------------------------|-------------------------------------|
| 不设超时                        | 线程耗尽,雪崩             | 所有调用设 timeout                  |
| 无限重试                        | 雪上加霜                   | 限制重试次数 + 指数退避             |
| 重试非幂等操作                  | 数据重复                   | POST 改用幂等 token,或转 PUT       |
| 没有熔断                        | 故障扩散                   | 加 CircuitBreaker                   |
| 同步调用链太长                  | 延迟累加,可用性下降       | 改异步消息                          |
| 服务发现用 IP 写死              | 实例迁移后失败             | 用服务名 + 注册中心                 |
| gRPC 不用契约文件               | 接口漂移                   | 用 .proto + 自动生成                |
| 不区分查询和命令                | 重试导致重复创建           | 查询可重试,命令要幂等              |
| 没有降级                        | 依赖服务挂自己也挂         | 兜底返回缓存/默认值                 |
| 连接不复用                      | 每次握手开销大             | 用连接池(httpx.AsyncClient 复用)   |
| 不处理网络分区                  | 脑裂,数据不一致           | 加超时 + 熔断 + 心跳                |

---

## 本讲小结

服务间通信是微服务的「血管系统」。核心要点:

1. **同步用 HTTP/gRPC,异步用消息队列**——根据是否需要立即结果选择。
2. **gRPC 适合内部高频调用,REST 适合对外 API**。
3. **服务发现是必须的**——动态实例不能写死 IP。
4. **可靠性四件套:超时 + 重试 + 熔断 + 降级**——任何一个缺了都会雪崩。

下一章讲 API 网关与服务发现的具体实现。
`,
  },
  {
    id: "pyarch-api-gateway",
    icon: "🚪",
    title: "API 网关与服务发现",
    group: "微服务架构",
    content: `# API 网关与服务发现

## 一、API 网关是什么

API 网关(API Gateway)是微服务系统的**统一入口**,所有外部请求先到网关,网关再转发到具体服务。

\`\`\`
                       客户端(Web/App/小程序)
                              │
                              ▼
                       ┌─────────────┐
                       │  API 网关   │
                       │  (Gateway)  │
                       └──┬──┬──┬──┬─┘
                          │  │  │  │
                  ┌───────┘  │  │  └───────┐
                  ▼          ▼  ▼          ▼
            user-service  post comment  order-svc
\`\`\`

没有网关时,客户端要记住 N 个服务地址,每个服务都要自己处理认证、限流、日志:

\`\`\`
客户端 ──► user-service (认证、限流、日志)
客户端 ──► post-service (认证、限流、日志)  ← 重复
客户端 ──► order-service (认证、限流、日志) ← 重复
\`\`\`

有网关后,这些横切关注点统一在网关处理:

\`\`\`
客户端 ──► 网关 (统一认证、限流、日志、路由)
              ├──► user-service (只管业务)
              ├──► post-service (只管业务)
              └──► order-service (只管业务)
\`\`\`

## 二、网关的职责

### 2.1 路由转发

根据 URL 路径把请求转发到对应服务:

| 请求路径             | 转发到          |
|----------------------|-----------------|
| /api/users/*         | user-service    |
| /api/posts/*         | post-service    |
| /api/comments/*      | comment-service |
| /api/orders/*        | order-service   |

### 2.2 认证授权

网关统一校验 Token,服务方不用每个都校验:

\`\`\`
客户端 ──带 Token──► 网关 ──校验通过──► user-service(直接信任)
                  └─校验失败─► 401
\`\`\`

### 2.3 限流熔断

防止单个服务被打爆:

\`\`\`
user-service: 限流 1000 QPS
post-service: 限流 500 QPS
\`\`\`

### 2.4 日志监控

所有请求经过网关,统一记录访问日志、指标:

\`\`\`
[2026-07-04 10:00:01] GET /api/users/1 200 12ms user-service
[2026-07-04 10:00:02] POST /api/posts 201 45ms post-service
\`\`\`

### 2.5 响应聚合(BFF 模式)

一个客户端请求,网关聚合多个服务的结果:

\`\`\`
客户端 ──GET /api/home──► 网关
                          ├──► user-service(用户信息)
                          ├──► post-service(推荐文章)
                          └──► notif-service(未读消息)
                          ◄── 聚合后一次返回
\`\`\`

这就是 **BFF(Backend for Frontend)** 模式,为前端定制的聚合层。

### 2.6 协议转换

外部用 REST,内部用 gRPC,网关做转换:

\`\`\`
客户端 ──HTTP/JSON──► 网关 ──gRPC/Protobuf──► 内部服务
\`\`\`

### 2.7 其他职责

- **请求/响应转换**:字段重命名、格式转换
- **缓存**:热点数据缓存
- **灰度发布**:按用户 ID 路由到新版本
- **CORS**:跨域处理
- **压缩**:Gzip/Brotli

## 三、网关的实现

### 3.1 Nginx

最经典的反向代理,配置简单,性能极高:

\`\`\`nginx
# nginx.conf
upstream user_service {
    server user-service:8001;
}

upstream post_service {
    server post-service:8002;
}

server {
    listen 80;

    location /api/users/ {
        proxy_pass http://user_service/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /api/posts/ {
        proxy_pass http://post_service/;
    }
}
\`\`\`

优点:性能极高,配置简单。
缺点:动态路由、限流、认证需要写 Lua 或额外插件。

### 3.2 Kong

基于 Nginx + OpenResty,插件丰富:

\`\`\`yaml
# Kong 配置( declarative )
_format_version: "3.0"
services:
  - name: user-service
    url: http://user-service:8001
    routes:
      - name: user-route
        paths: ["/api/users"]
    plugins:
      - name: key-auth        # 认证
      - name: rate-limiting   # 限流
        config:
          minute: 1000
\`\`\`

优点:插件生态丰富(JWT、OAuth、限流、日志)。
缺点:依赖 PostgreSQL/ Cassandra 存配置。

### 3.3 Traefik

云原生网关,自动发现 K8s/Docker 服务:

\`\`\`yaml
# docker-compose.yml
services:
  traefik:
    image: traefik:v3.0
    command:
      - --providers.docker=true
      - --entrypoints.web.address=:80
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

  user-service:
    image: user-service:v1
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.user.rule=PathPrefix(\`/api/users\`)"
      - "traefik.http.services.user.loadbalancer.server.port=8000"
\`\`\`

优点:自动服务发现,配置即代码。
缺点:高级功能文档不如 Kong。

### 3.4 APISIX

国人开源,基于 Nginx + etcd,动态配置:

\`\`\`bash
# 用 APISIX admin API 配置路由
curl http://127.0.0.1:9180/apisix/admin/routes/1 \\
  -H 'X-API-KEY: xxx' -X PUT -d '
{
  "uri": "/api/users/*",
  "upstream": {
    "type": "roundrobin",
    "nodes": {"user-service:8001": 1}
  },
  "plugins": {
    "jwt-auth": {},
    "limit-req": {"rate": 1000, "burst": 100}
  }
}'
\`\`\`

### 3.5 自研网关

用 FastAPI/Go 自己写,灵活但工作量大。下面会演示一个简易版。

### 3.6 网关对比

| 网关    | 语言    | 优点                   | 缺点                |
|---------|---------|------------------------|---------------------|
| Nginx   | C       | 性能极高,稳定         | 动态配置弱          |
| Kong    | Lua     | 插件丰富               | 依赖 DB             |
| Traefik | Go      | 云原生,自动发现       | 高级功能少          |
| APISIX  | Lua     | 动态配置,国内生态好   | 文档偏技术          |
| 自研    | Python/Go| 完全定制              | 工作量大,要自己维护|

## 四、服务发现详解

### 4.1 为什么需要服务发现

微服务实例是动态的:
- K8s Pod 每次重启 IP 变化
- 自动扩缩容,实例数变化
- 实例可能挂掉

如果客户端写死 IP:

\`\`\`python
# ❌ 实例挂了或 IP 变了就调不通
client.get("http://10.0.0.5:8001/users/1")
\`\`\`

服务发现的核心:**用服务名代替 IP,运行时动态解析**。

### 4.2 客户端发现

客户端自己查注册中心:

\`\`\`
1. user-service 启动 → 注册到 Consul
2. 客户端要调 user-service
3. 客户端 ──查询──► Consul
4. 客户端 ◄──[10.0.0.1, 10.0.0.2]── Consul
5. 客户端选 10.0.0.1 调用
\`\`\`

### 4.3 服务端发现

中间有个负载均衡层,客户端只调 LB:

\`\`\`
1. user-service 启动 → 注册到 Consul
2. 客户端 ──► LB(如 K8s Service)
3. LB ──查询──► Consul(或自己维护实例列表)
4. LB ──转发──► 10.0.0.1
\`\`\`

K8s 的 Service 就是这种模式:

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 80
    targetPort: 8000
\`\`\`

\`\`\`python
# 客户端直接用服务名
client.get("http://user-service/users/1")  # K8s 自动解析
\`\`\`

## 五、注册中心

### 5.1 Consul

HashiCorp 出品,功能最全:

- 服务注册
- 健康检查
- KV 存储
- 多数据中心

\`\`\`python
# 服务注册到 Consul
import consul
import socket

c = consul.Consul(host="consul", port=8500)

service_id = f"user-service-{socket.gethostname()}"
c.agent.service.register(
    name="user-service",
    service_id=service_id,
    address=socket.gethostbyname(socket.gethostname()),
    port=8001,
    check=consul.Check.http("http://localhost:8001/health", interval="10s"),
)
\`\`\`

\`\`\`python
# 客户端查询
import consul
import random

c = consul.Consul(host="consul", port=8500)

def get_service_address(name: str):
    _, services = c.health.service(name, passing=True)
    instances = [
        f"http://{s['Service']['Address']}:{s['Service']['Port']}"
        for s in services
    ]
    return random.choice(instances)  # 客户端负载均衡

target = get_service_address("user-service")
\`\`\`

### 5.2 etcd

分布式 KV 存储,K8s 底层用它:

\`\`\`bash
# 服务注册(用 etcdctl)
etcdctl put /services/user-service/instance1 "10.0.0.1:8001"
etcdctl put /services/user-service/instance2 "10.0.0.2:8001"

# 查询
etcdctl get /services/user-service/ --prefix
\`\`\`

### 5.3 Eureka

Netflix 出品,Java 生态常用,现已进入维护模式。

### 5.4 Zookeeper

Apache 老牌协调服务,强一致性,但 API 复杂。

### 5.5 Nacos

阿里开源,注册中心 + 配置中心一体:

\`\`\`python
# Nacos Python SDK(社区版)
import nacos

client = nacos.NacosClient("nacos:8848", namespace="public")
client.add_naming_instance("user-service", "10.0.0.1", 8001)
\`\`\`

### 5.6 注册中心对比

| 注册中心 | 一致性  | 健康检查 | 多数据中心 | 适用场景       |
|----------|---------|----------|------------|----------------|
| Consul   | CP      | 支持     | 支持       | 通用,推荐      |
| etcd     | CP      | 需自实现 | 支持       | K8s 底层       |
| Eureka   | AP      | 支持     | 弱         | Java 老项目    |
| Zookeeper| CP      | 支持     | 弱         | 强一致场景     |
| Nacos    | AP/CP切换| 支持    | 支持       | 国内微服务     |

> CP = 一致性优先,AP = 可用性优先。注册中心一般推荐 AP(可用性更重要,允许短暂不一致)。

## 六、健康检查与心跳

### 6.1 健康检查方式

注册中心定期检查服务实例是否健康:

- **HTTP 检查**:GET /health,200 为健康
- **TCP 检查**:能否建立 TCP 连接
- **脚本检查**:执行脚本,退出码 0 为健康

### 6.2 服务端实现健康端点

\`\`\`python
from fastapi import FastAPI
import psutil

app = FastAPI()

@app.get("/health")
def health():
    """健康检查端点。"""
    return {
        "status": "ok",
        "service": "user-service",
        "version": "1.0.0",
    }

@app.get("/health/ready")
def readiness():
    """就绪检查:依赖是否就绪。"""
    # 检查数据库连接
    try:
        db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(503, "Database not ready")
\`\`\`

### 6.3 心跳机制

服务定期向注册中心发心跳,超时未收到则剔除:

\`\`\`python
import threading
import time
import requests

def heartbeat():
    while True:
        try:
            requests.put("http://consul:8500/v1/agent/service/check/user-service")
        except Exception:
            pass
        time.sleep(10)

threading.Thread(target=heartbeat, daemon=True).start()
\`\`\`

### 6.4 K8s 的探针

\`\`\`yaml
livenessProbe:        # 存活探针:挂了就重启
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:       # 就绪探针:不就绪就不接流量
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
\`\`\`

## 七、Python 实战:简易 API 网关

### 7.1 用 FastAPI 实现网关

需求:
- /api/users/* 转发到 user-service(8001)
- /api/posts/* 转发到 post-service(8002)
- 统一 JWT 认证
- 限流(每 IP 每分钟 100 次)

\`\`\`python
# gateway/main.py
import httpx
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
import jwt
import time
from collections import defaultdict

app = FastAPI(title="API Gateway")

# 路由表
ROUTES = {
    "/api/users": "http://user-service:8001",
    "/api/posts": "http://post-service:8002",
    "/api/comments": "http://comment-service:8003",
}

# JWT 密钥
JWT_SECRET = "your-secret-key"

# 简易限流:{ip: [timestamp, ...]}
RATE_LIMIT = 100  # 每分钟 100 次
request_log = defaultdict(list)

def verify_token(request: Request):
    """统一 JWT 认证。"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")

def rate_limit(request: Request):
    """简易限流。"""
    client_ip = request.client.host
    now = time.time()
    # 清理 1 分钟前的记录
    request_log[client_ip] = [t for t in request_log[client_ip] if now - t < 60]
    if len(request_log[client_ip]) >= RATE_LIMIT:
        raise HTTPException(429, "Too many requests")
    request_log[client_ip].append(now)

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway(path: str, request: Request):
    # 1. 限流
    rate_limit(request)

    # 2. 认证(health 端点免认证)
    if not path.startswith("health"):
        user = verify_token(request)
        request.state.user = user

    # 3. 路由匹配
    full_path = f"/{path}"
    target_url = None
    for prefix, base in ROUTES.items():
        if full_path.startswith(prefix):
            # 去掉网关前缀,如 /api/users/1 -> /users/1
            inner_path = full_path[len("/api"):]
            target_url = base + inner_path
            break

    if not target_url:
        raise HTTPException(404, "Route not found")

    # 4. 转发请求
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    # 把用户信息透传给下游
    if hasattr(request.state, "user"):
        headers["X-User-Id"] = str(request.state.user.get("user_id", ""))

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.request(
                request.method,
                target_url,
                content=body,
                headers=headers,
                params=request.query_params,
            )
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=dict(resp.headers),
                media_type=resp.headers.get("content-type"),
            )
        except httpx.RequestError:
            raise HTTPException(503, "Service unavailable")

@app.get("/health")
def health():
    return {"status": "ok", "service": "gateway"}
\`\`\`

### 7.2 测试网关

\`\`\`bash
# 健康检查
curl http://gateway:8000/health
# {"status":"ok","service":"gateway"}

# 获取 Token(假设有 auth-service)
TOKEN=\$(curl -s -X POST http://gateway:8000/api/auth/login \\
  -d '{"username":"admin","password":"xxx"}' | jq -r .token)

# 调用 user-service(经网关)
curl -H "Authorization: Bearer \$TOKEN" http://gateway:8000/api/users/1
# 网关转发到 http://user-service:8001/users/1

# 调用 post-service(经网关)
curl -H "Authorization: Bearer \$TOKEN" http://gateway:8000/api/posts/1
# 网关转发到 http://post-service:8002/posts/1
\`\`\`

## 八、网关的聚合查询(BFF)

### 8.1 场景

首页要显示:用户信息 + 推荐文章 + 未读消息。客户端要发 3 个请求:

\`\`\`
GET /api/users/me
GET /api/posts/recommend
GET /api/notifications/unread
\`\`\`

用 BFF 聚合成一个请求:

\`\`\`
GET /api/home → 一次返回所有数据
\`\`\`

### 8.2 实现

\`\`\`python
import httpx
import asyncio
from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/api/home")
async def home(request: Request):
    user_id = request.headers.get("X-User-Id", "1")

    # 并发调用 3 个服务
    async with httpx.AsyncClient(timeout=5.0) as client:
        user_task = client.get(f"http://user-service:8001/users/{user_id}")
        posts_task = client.get("http://post-service:8002/posts/recommend")
        notif_task = client.get(f"http://notif-service:8004/notifications/unread?user_id={user_id}")

        results = await asyncio.gather(
            user_task, posts_task, notif_task,
            return_exceptions=True,
        )

    def safe_json(resp, default):
        if isinstance(resp, Exception):
            return default
        try:
            return resp.json()
        except Exception:
            return default

    return {
        "user": safe_json(results[0], {"name": "未知"}),
        "posts": safe_json(results[1], []),
        "notifications": safe_json(results[2], []),
    }
\`\`\`

用 \`asyncio.gather\` 并发调用,3 个服务同时跑,总耗时 ≈ 最慢的那个,而不是三者之和。

## 九、服务注册到 Consul 的完整示例

### 9.1 user-service 启动时注册

\`\`\`python
# user-service/main.py
import consul
import socket
import atexit
from fastapi import FastAPI

app = FastAPI()
c = consul.Consul(host="consul", port=8500)
SERVICE_ID = f"user-service-{socket.gethostname()}"

@app.on_event("startup")
def register():
    c.agent.service.register(
        name="user-service",
        service_id=SERVICE_ID,
        address=socket.gethostbyname(socket.gethostname()),
        port=8001,
        check=consul.Check.http(
            "http://localhost:8001/health",
            interval="10s",
            timeout="5s",
            deregister="30s",
        ),
    )

@app.on_event("shutdown")
def deregister():
    c.agent.service.deregister(SERVICE_ID)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "张三"}
\`\`\`

### 9.2 网关动态发现服务

\`\`\`python
# gateway 用 Consul 查询实例,而不是写死 URL
import consul
import random
import httpx
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
c = consul.Consul(host="consul", port=8500)

def get_service_url(name: str) -> str:
    """从 Consul 查询健康实例。"""
    _, services = c.health.service(name, passing=True)
    if not services:
        raise HTTPException(503, f"No healthy instance for {name}")
    instance = random.choice(services)
    addr = instance["Service"]["Address"]
    port = instance["Service"]["Port"]
    return f"http://{addr}:{port}"

@app.get("/api/users/{user_id}")
async def proxy_user(user_id: int):
    url = get_service_url("user-service") + f"/users/{user_id}"
    async with httpx.AsyncClient(timeout=3.0) as client:
        resp = await client.get(url)
        return resp.json()
\`\`\`

## 十、网关的高可用

### 10.1 网关本身也要高可用

网关是单点,挂了整个系统就挂了。要多实例部署:

\`\`\`
                  客户端
                    │
              ┌─────▼─────┐
              │   LB      │  (如 AWS ALB / Keepalived VIP)
              └─┬───┬───┬─┘
                │   │   │
         ┌──────┘   │   └──────┐
         ▼          ▼          ▼
     Gateway1   Gateway2   Gateway3
         │          │          │
         └────┬─────┴──────────┘
              ▼
          后端服务
\`\`\`

### 10.2 K8s 部署多实例

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
spec:
  replicas: 3              # 3 个实例
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: gateway:v1.0.0
        ports:
        - containerPort: 8000
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: gateway
spec:
  type: LoadBalancer
  selector:
    app: gateway
  ports:
  - port: 80
    targetPort: 8000
\`\`\`

## 十一、易错点小结

| 易错点                          | 后果                      | 正确做法                            |
|---------------------------------|---------------------------|-------------------------------------|
| 网关单点部署                    | 网关挂全系统挂            | 多实例 + LB                         |
| 网关不做认证,服务方各自认证    | 重复 + 不一致             | 网关统一认证,服务方信任网关        |
| 路由表写死,新服务要重启网关    | 运维麻烦                  | 动态路由(从注册中心读取)          |
| 网关聚合查询用串行              | 延迟累加                  | 用 asyncio.gather 并发              |
| 健康检查不区分 liveness/ready   | 启动期就被打流量          | 拆分两个探针                        |
| 注册中心用 CP,网络分区时剔除健康实例 | 误杀    | 注册中心用 AP(如 Eureka/Consul AP模式) |
| 限流只限 IP                      | NAT 后误伤                | 结合 用户 ID + IP                   |
| 网关缓存导致数据不一致          | 用户看到旧数据            | 短 TTL + 主动失效                   |
| 网关转发不带原始 IP             | 服务方拿不到真实 IP       | 加 X-Forwarded-For / X-Real-IP      |
| 没有灰度能力                    | 新版本一发全量            | 网关按 header/用户 路由灰度         |

---

## 本讲小结

API 网关是微服务的「前台」,服务发现是「通讯录」。要点:

1. **网关统一处理:路由、认证、限流、日志、聚合**——服务方只管业务。
2. **服务发现让 IP 动态化**——客户端用服务名,不用 IP。
3. **注册中心选 AP 优于 CP**——可用性比强一致更重要。
4. **健康检查拆 liveness / readiness**——启动期、运行期不同语义。

下一章我们理性看待微服务的代价,讲清楚边界划分。
`,
  },
  {
    id: "pyarch-microservices-tradeoffs",
    icon: "⚖️",
    title: "微服务权衡与边界",
    group: "微服务架构",
    content: `# 微服务权衡与边界

## 一、微服务的优点回顾

在深入缺点前,先承认微服务的真实价值:

### 1.1 独立部署

\`\`\`
单体:改一行代码 → 重新打包整个应用 → 全量发布 → 所有模块受影响
微服务:改 user-service → 只发 user-service → 其他服务不动
\`\`\`

发布频率从「一月一次」变成「一天多次」,迭代速度指数级提升。

### 1.2 技术多样性

不同服务用最合适的技术:

\`\`\`
user-service   → Python(FastAPI)+ PostgreSQL
search-service → Go + Elasticsearch
rec-service    → Python(科学计算)+ Redis
log-service    → Rust + ClickHouse
\`\`\`

### 1.3 团队自治

每个团队拥有自己的服务,内部决策不用跨团队协调:

\`\`\`
用户团队 → 负责 user-service(技术选型、发布节奏自己定)
内容团队 → 负责 post-service(同上)
\`\`\`

### 1.4 弹性扩展

按需扩缩容,只为瓶颈服务买单:

\`\`\`
秒杀时:order-service 扩到 50 个实例,user-service 保持 3 个
平时:order-service 缩到 3 个实例
\`\`\`

单体只能整体复制,浪费资源。

### 1.5 故障隔离

\`\`\`
单体:评论模块内存泄漏 → 整个应用挂 → 用户登录都不行
微服务:comment-service 挂 → 文章查看正常 → 只是评论不显示
\`\`\`

## 二、微服务缺点的深度剖析

### 2.1 分布式事务难

#### 问题

单体里一个事务搞定:

\`\`\`python
# 单体:扣库存 + 创建订单,一个事务
with db.transaction():
    stock = Stock.get(item_id)
    stock.count -= 1
    stock.save()
    Order.create(user_id=user_id, item_id=item_id)
\`\`\`

微服务里库存和订单是两个服务的两个数据库,**没有跨库事务**:

\`\`\`python
# 微服务:扣库存和创建订单是两个独立操作
# 1. 调库存服务扣库存
stock_result = await call_stock_service("deduct", item_id)
# 2. 调订单服务创建订单
order_result = await call_order_service("create", user_id, item_id)

# 如果第 2 步失败,第 1 步已经扣了库存,怎么办?
\`\`\`

#### 解决方案 1:Saga 模式

把长事务拆成一系列本地事务,每步都有**补偿操作**:

\`\`\`
创建订单 → 扣库存 → 扣款 → 发货
   │         │        │       │
   ▼         ▼        ▼       ▼
取消订单  回滚库存  退款    撤回发货
(补偿)   (补偿)   (补偿)  (补偿)

任意一步失败,反向执行已成功步骤的补偿
\`\`\`

\`\`\`python
# Saga 协调器(简化)
async def place_order_saga(user_id, item_id):
    # 步骤 1:创建订单(状态:待支付)
    order = await order_service.create(user_id, item_id, status="pending")

    try:
        # 步骤 2:扣库存
        await stock_service.deduct(item_id)
    except Exception:
        # 补偿:取消订单
        await order_service.cancel(order.id)
        raise

    try:
        # 步骤 3:扣款
        await payment_service.charge(user_id, order.amount)
    except Exception:
        # 补偿:回滚库存 + 取消订单
        await stock_service.restore(item_id)
        await order_service.cancel(order.id)
        raise

    # 全部成功,订单状态改为已支付
    await order_service.update_status(order.id, "paid")
    return order
\`\`\`

#### 解决方案 2:TCC(Try-Confirm-Cancel)

\`\`\`
Try    → 预留资源(冻结库存)
Confirm → 确认提交(扣减冻结的库存)
Cancel  → 取消预留(解冻库存)
\`\`\`

#### 解决方案 3:最终一致性 + 事件驱动

\`\`\`
下单 → 发"订单已创建"事件 → 库存服务消费并扣库存
如果扣库存失败 → 发"扣库存失败"事件 → 订单服务消费并取消订单
\`\`\`

不强求立即一致,但保证最终一致。

### 2.2 调试困难

单体里一个堆栈跟踪就能定位问题。微服务里一个请求可能跨 5 个服务:

\`\`\`
客户端 → 网关 → order-service → stock-service → payment-service
              → notif-service
\`\`\`

报错了,要查哪个服务?堆栈分散在 N 个日志里。

**解决:链路追踪(OpenTelemetry + Jaeger)**

\`\`\`
给每个请求分配 trace_id,跨服务透传
Jaeger 上能看到完整调用链:每个服务耗时多少、哪一步报错
\`\`\`

\`\`\`python
# OpenTelemetry 自动注入 trace_id
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)  # 自动埋点

@app.get("/orders/{id}")
async def get_order(id: int):
    # 调 stock-service 时,trace_id 自动透传到 HTTP header
    stock = await httpx.get(f"http://stock-service/stock/{id}")
    return {"order": ..., "stock": stock.json()}
\`\`\`

### 2.3 数据查询难

单体里跨模块 JOIN 很简单:

\`\`\`sql
-- 单体:一条 SQL 查用户和他的文章
SELECT u.name, p.title
FROM users u
JOIN posts p ON p.author_id = u.id
WHERE u.id = 1;
\`\`\`

微服务里 user 和 post 在不同数据库,**不能 JOIN**。三种解法:

#### 解法 1:多次查询 + 应用层组装

\`\`\`python
async def get_user_with_posts(user_id):
    user = await user_service.get(user_id)        # 一次请求
    posts = await post_service.list_by_author(user_id)  # 又一次请求
    return {**user, "posts": posts}
\`\`\`

#### 解法 2:数据冗余

post-service 里冗余存 author_name:

\`\`\`python
# post-service 的 Post 模型
class Post:
    id: int
    title: str
    author_id: int
    author_name: str  # 冗余字段,用户改名时同步更新
\`\`\`

#### 解法 3:CQRS + 数据同步

\`\`\`
写:正常写各自的数据库
读:用一个专门的"查询库",通过 CDC(变更数据捕获)从各库同步过来
\`\`\`

### 2.4 运维复杂

| 维度        | 单体              | 微服务                    |
|-------------|-------------------|---------------------------|
| 部署        | 1 个包            | N 个服务 + N 个数据库     |
| 监控        | 1 个进程          | N 个进程 + 链路追踪       |
| 日志        | 一个文件          | N 个日志要聚合(ELK)     |
| 配置        | 一个配置文件      | 配置中心(Nacos/Apollo)  |
| CI/CD       | 一条流水线        | N 条流水线                |
| 排障        | 看堆栈            | 看链路 + 看日志 + 看监控  |

\`\`\`
单体运维:1 人够了
微服务运维:需要专门的 DevOps/SRE 团队
\`\`\`

## 三、服务边界划分

### 3.1 为什么边界最重要

> 「微服务最难的不是技术,而是划边界。」——Sam Newman

边界划错了:
- 划太粗 → 退化为单体
- 划太细 → 纳米服务,服务数量爆炸
- 划错位置 → 服务间强耦合,改一处要动多个服务

### 3.2 领域驱动设计(DDD)的限界上下文

DDD 把业务划分为多个**限界上下文(Bounded Context)**,每个上下文就是一个微服务的天然边界。

#### 示例:电商系统

\`\`\`
┌─────────────────────────────────────────────────┐
│                  电商业务域                       │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │用户上下文│ │商品上下文│ │订单上下文│         │
│  │          │ │          │ │          │         │
│  │ User     │ │ Product  │ │ Order    │         │
│  │ Address  │ │ Category │ │ OrderItem│         │
│  │ Profile  │ │ Inventory│ │ Payment  │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │物流上下文│ │促销上下文│ │评论上下文│         │
│  │ Shipment │ │ Coupon   │ │ Review   │         │
│  │ Tracking │ │ Activity │ │ Comment  │         │
│  └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘
\`\`\`

每个上下文:
- 有自己的领域模型(User 在用户上下文是「账户」,在订单上下文是「收货人」)
- 有自己的数据库
- 通过上下文映射(Context Map)定义与其他上下文的集成方式

### 3.3 按业务能力划分

问自己:**这块业务能不能独立运营?**

\`\`\`
"用户管理" → 能独立运营(注册、登录、资料)→ 一个服务
"订单管理" → 能独立运营(下单、支付、查询)→ 一个服务
"日志打印" → 不能独立运营(依附于其他业务)→ 不该独立成服务
\`\`\`

### 3.4 按子域划分

DDD 把领域分为:
- **核心域(Core Domain)**:业务核心竞争力,投入最多
- **支撑域(Supporting Subdomain)**:辅助核心,但必要
- **通用域(General Subdomain)**:通用功能(如认证、通知),可买现成

\`\`\`
电商系统:
- 核心域:商品推荐、促销引擎 → 自己重点开发
- 支撑域:库存管理 → 自己开发但简化
- 通用域:认证、邮件通知 → 用现成服务
\`\`\`

### 3.5 划分原则

1. **高内聚低耦合**:一个服务内的功能紧密相关,服务间依赖少
2. **单一职责**:一个服务只做一件事
3. **独立可部署**:边界要能独立发布
4. **数据自治**:服务独占其数据
5. **团队对齐**:一个服务一个团队(康威定律)

### 3.6 划分反例

\`\`\`
❌ 按技术划分
user-controller-service / user-service-service / user-repo-service
→ 一个用户操作要跨 3 个服务,荒谬

✅ 按业务划分
user-service(包含 controller + service + repo)
→ 一个服务搞定用户相关所有事
\`\`\`

## 四、微服务反模式

### 4.1 分布式单体(Distributed Monolith)

拆了微服务,但服务之间强耦合:

\`\`\`
order-service 直接读 stock-service 的数据库
order-service 和 stock-service 必须同时发布才能运行
order-service 调 stock-service 用了 10 个字段,改一个就要协调
\`\`\`

看似微服务,实际是「通过网络调用的单体」,有微服务的所有缺点(慢、复杂),没有优点(独立部署)。

### 4.2 纳米服务(Nanoservice)

服务拆得太细,每个服务只做极小的事:

\`\`\`
❌ 拆出:
- user-create-service(只管创建用户)
- user-query-service(只管查询用户)
- user-update-service(只管更新用户)
- user-delete-service(只管删除用户)
\`\`\`

运维成本爆炸,网络开销巨大。一个用户操作要调 4 个服务。

### 4.3 共享数据库

\`\`\`
❌ user-service 和 post-service 共用一个数据库
user-service 直接读 posts 表
\`\`\`

数据库成了隐式耦合,改 posts 表结构要同时改两个服务。**去中心化数据原则被破坏**。

### 4.4 共享代码库陷阱

\`\`\`
❌ 所有服务共享一个 common-lib
common-lib 改了一行 → 所有服务都要重新发布
\`\`\`

把单体改成了「编译期耦合的微服务」。共享代码要克制,只共享稳定的东西(如 DTO、协议)。

### 4.5 同步调用链过长

\`\`\`
A → B → C → D → E → F
\`\`\`

一链 6 个同步调用,延迟累加,任何一环挂全链挂。应改异步消息。

## 五、何时该用微服务(决策清单)

\`\`\`
□ 团队规模 > 10 人,且能分成 3+ 个独立小组?
□ 业务边界清晰(用户/订单/商品明显独立)?
□ 单体已经成为发布瓶颈(多团队抢着发版)?
□ 有 CI/CD 自动化部署能力(每次提交自动部署)?
□ 有容器化(K8s)运维能力?
□ 有监控、日志、链路追踪基础设施?
□ 部分模块需要独立扩展(如秒杀模块)?
□ 团队接受分布式复杂度(最终一致性等)?

≥ 5 个「是」→ 上微服务
3-4 个「是」→ 模块化单体
< 3 个「是」→ 老老实实单体
\`\`\`

## 六、模块化单体(Modular Monolith)

### 6.1 什么是模块化单体

折中方案:**单进程部署,但代码按模块严格分割**,每个模块有自己的数据表。

\`\`\`
blog-app/
├── modules/
│   ├── user/
│   │   ├── __init__.py
│   │   ├── routes.py      # 用户相关路由
│   │   ├── service.py     # 用户业务逻辑
│   │   ├── models.py      # User ORM 模型
│   │   └── repository.py  # 用户数据访问
│   ├── post/
│   │   ├── routes.py
│   │   ├── service.py
│   │   ├── models.py      # Post ORM 模型
│   │   └── repository.py
│   └── comment/
│       ├── routes.py
│       ├── service.py
│       ├── models.py
│       └── repository.py
└── main.py                # 入口,聚合所有模块
\`\`\`

### 6.2 模块间通信

模块间不直接访问对方数据库,通过 service 接口:

\`\`\`python
# modules/post/service.py
from modules.user.service import UserService

class PostService:
    def __init__(self, user_service: UserService):
        self.user_service = user_service

    def get_post_with_author(self, post_id: int):
        post = self.repository.get(post_id)
        author = self.user_service.get_user(post.author_id)  # 走接口,不直接读 user 表
        return {**post.__dict__, "author": author}
\`\`\`

### 6.3 模块化单体的好处

- 单进程部署,简单
- 模块间通过接口调用,边界清晰
- 哪天要拆微服务,直接把模块抽出来成服务即可
- 适合中小团队

### 6.4 单体 → 模块化单体 → 微服务的演进

\`\`\`
阶段 1:乱糟糟单体(代码乱放)
  ↓ 重构,划分模块边界
阶段 2:模块化单体(边界清晰,单进程)
  ↓ 团队大了,发布成瓶颈
阶段 3:微服务(把模块拆成独立服务)
\`\`\`

**不要跳过阶段 2**!从乱糟糟单体直接上微服务,会得到「分布式乱糟糟单体」。

## 七、微服务的拆分时机

### 7.1 信号 1:发布协调痛苦

\`\`\`
A 团队改了 user 模块,想上线
B 团队改了 post 模块,还在测试
C 团队的 order 模块依赖 user 模块,要一起测
→ 一次发布要协调 3 个团队,半月才能上线
\`\`\`

就该把 user / post / order 拆开。

### 7.2 信号 2:模块负载差异大

\`\`\`
post-service QPS 10000
user-service QPS 100
但单体只能一起扩展,post 模块要扩 10 个实例,user 也跟着扩 10 个,浪费
\`\`\`

### 7.3 信号 3:团队职责不清

\`\`\`
一个代码仓库,3 个团队都在改
互相踩脚,代码冲突频繁
没人对哪块代码负责
\`\`\`

### 7.4 信号 4:技术栈冲突

\`\`\`
推荐算法团队想用 Python + PyTorch
搜索团队想用 Go + Elasticsearch
但单体只能选一个语言
\`\`\`

## 八、微服务的拆分方法

### 8.1 绞杀者模式(Strangler Fig)

不一次性拆完,逐步把单体功能抽到新服务:

\`\`\`
阶段 1:单体跑着,新增 user-service,网关把 /users 路由到新服务,其他还走单体
阶段 2:再抽出 post-service
阶段 3:最后单体只剩 comment,也抽出来,单体下线
\`\`\`

\`\`\`
         ┌─ /users ──► user-service(新)
网关 ─────┤
         ├─ /posts ──► post-service(新)
         │
         └─ 其他 ────► 老单体(逐步缩小)
\`\`\`

### 8.2 按数据库边界拆

先拆数据库,再拆服务:

\`\`\`
1. 把 user 表从大库迁到独立 user_db
2. user-service 改连 user_db
3. 其他服务通过 API 调 user-service,不再直连 user 表
\`\`\`

## 九、易错点小结

| 易错点                              | 后果                      | 正确做法                            |
|-------------------------------------|---------------------------|-------------------------------------|
| 服务间共享数据库                    | 退化为单体                | 每服务独立数据库                    |
| 拆得太细(纳米服务)                | 运维爆炸                  | 按业务能力拆,粒度适中              |
| 同步调用链过长                      | 延迟高,可用性差          | 改异步消息                          |
| 跨服务事务用 2PC                    | 性能差,锁死              | 用 Saga / 最终一致性                |
| 边界按技术分层划                    | 强耦合                    | 按业务能力 / 限界上下文划           |
| 共享 common-lib 频繁改              | 编译期耦合                | 只共享稳定契约,业务代码不共享      |
| 跨服务 JOIN                         | 性能差                    | 数据冗余或聚合查询                  |
| 没有链路追踪                        | 出问题查不到              | 上 OpenTelemetry                    |
| 直接从单体跳微服务                  | 分布式乱糟糟单体          | 先模块化单体,再拆                  |
| 团队小硬上微服务                   | 运维拖死                  | 用模块化单体                        |
| 新服务上线不做灰度                  | 全量出问题                | 灰度发布 + 可回滚                   |
| 服务边界跟着组织架构走但组织不变    | 边界僵化                  | 组织 + 架构一起调整(逆康威)       |

---

## 本讲小结

微服务的本质是**用复杂度换灵活性**。要点:

1. **边界比技术更重要**——用 DDD 限界上下文划边界。
2. **去中心化数据是底线**——共享数据库就退化成单体。
3. **分布式事务用 Saga,不用 2PC**——最终一致性是常态。
4. **模块化单体是好折中**——团队不够大时,先模块化,再拆。
5. **不要为微服务而微服务**——满足决策清单才上。

至此,微服务架构部分结束。下一批章节进入消息队列,讲清楚异步通信的核心机制。
`,
  },
  {
    id: "pyarch-mq-intro",
    icon: "📬",
    title: "消息队列基础",
    group: "消息队列",
    content: `# 消息队列基础

## 一、什么是消息队列

消息队列(Message Queue,MQ)是一种**进程间异步通信的中间件**。生产者把消息发到队列,消费者从队列取消息处理。

\`\`\`
生产者(Producer)──发消息──► [ 队列 Queue ] ──取消息──► 消费者(Consumer)
                                       │
                                       └─ 持久化存储,消费者挂了也不丢
\`\`\`

> 用一句话概括:**「生产者发完就走,消费者慢慢处理,中间有个队列缓冲」**。

### 1.1 生活类比

消息队列就像**邮局**:
- 寄信人(生产者)把信投进邮筒,不用等收信人
- 邮局(队列)暂存信件
- 邮递员(消费者)按节奏取信派送
- 寄信人和收信人互不认识,通过邮局解耦

### 1.2 何时需要消息队列

\`\`\`
场景 1:下单后要发邮件、发短信、记日志、加积分
  ❌ 同步:用户等所有操作做完才返回,慢
  ✅ 异步:下单后发消息,各服务异步处理,立即返回

场景 2:秒杀,瞬时 10w 请求
  ❌ 直接打数据库:数据库挂
  ✅ 先入队列,慢慢处理:削峰

场景 3:订单服务要通知库存、物流、积分服务
  ❌ 同步调用 3 个服务:耦合 + 慢
  ✅ 发一条消息,各服务订阅:解耦
\`\`\`

## 二、消息队列核心概念

### 2.1 角色

| 角色              | 说明                       |
|-------------------|----------------------------|
| Producer 生产者   | 发消息的一方               |
| Consumer 消费者   | 收消息的一方               |
| Broker 代理       | 消息队列服务器             |
| Queue 队列        | 存消息的容器(FIFO)       |
| Topic 主题        | 消息分类(Kafka 用)       |
| Exchange 交换机   | RabbitMQ 的路由器          |

### 2.2 消息(Message)

一条消息通常包含:

\`\`\`python
message = {
    "id": "msg-uuid-1234",          # 唯一 ID(用于幂等)
    "timestamp": "2026-07-04T10:00:00",
    "topic": "order.created",       # 主题
    "payload": {                    # 业务数据
        "order_id": 10086,
        "user_id": 1,
        "amount": 99.9,
    },
    "headers": {                    # 元数据
        "source": "order-service",
        "version": "1.0",
    },
}
\`\`\`

### 2.3 队列 vs 主题

- **队列(Queue)**:点对点,一条消息只被一个消费者消费
- **主题(Topic)**:发布订阅,一条消息被所有订阅者消费

\`\`\`
队列(P2P):
  Producer ──► [Queue] ──► Consumer A (拿到)
                          └─ Consumer B (拿不到,已被 A 消费)

主题(Pub/Sub):
  Producer ──► [Topic] ──► Subscriber A (拿到)
                          └─ Subscriber B (也拿到)
\`\`\`

### 2.4 持久化(Persistence)

消息写到磁盘,即使 Broker 重启也不丢:

\`\`\`
非持久化:消息在内存,Broker 挂了消息丢
持久化:消息写盘,Broker 重启后还能消费
\`\`\`

### 2.5 确认(ACK)

消费者收到消息处理后,向 Broker 发 ACK 确认:

\`\`\`
1. Broker 把消息推给 Consumer
2. Consumer 处理消息
3. Consumer 处理完发 ACK
4. Broker 收到 ACK 才删除消息
   ↑ 没 ACK 的消息会被重新投递(防丢)
\`\`\`

### 2.6 重试与死信

处理失败的消息:
- 重试若干次
- 还失败 → 进死信队列(DLQ,Dead Letter Queue)
- 人工处理 DLQ 里的消息

\`\`\`
消息 → 消费失败 → 重试 1 → 重试 2 → 重试 3 → DLQ
\`\`\`

## 三、为什么需要消息队列

### 3.1 解耦

生产者不需要知道有多少个消费者:

\`\`\`
❌ 同步调用:
order-service 直接调 stock-service / ship-service / points-service
新增一个 service 要改 order-service 代码

✅ 消息队列:
order-service 发"订单已创建"消息
stock/ship/points 各自订阅
新增 log-service 也订阅,order-service 不用改
\`\`\`

### 3.2 异步

快速响应,后台处理:

\`\`\`
❌ 同步:用户注册 → 写库 → 发邮件 → 发短信 → 返回(2s)
✅ 异步:用户注册 → 写库 → 发消息 → 返回(100ms)
                  ↓
              邮件/短信服务异步消费
\`\`\`

### 3.3 削峰

突发流量缓冲:

\`\`\`
秒杀场景:
  瞬时 10w 请求 → 直接打数据库 → 数据库挂
  瞬时 10w 请求 → 先入队列 → 消费者按 1000/s 消费 → 数据库稳

\`\`\`
             10w 请求/秒
                │
        ┌───────▼───────┐
        │     Queue     │  ← 缓冲
        └───────┬───────┘
                │ 1000 请求/秒(平滑)
                ▼
            数据库
\`\`\`

### 3.4 可靠

消息持久化 + ACK 机制,保证不丢:

\`\`\`
1. 生产者确认:Broker 收到消息后回 ACK,生产者没收到就重发
2. 持久化:消息写盘
3. 消费者手动 ACK:处理完才 ACK,没 ACK 的会重投
\`\`\`

## 四、同步调用 vs 异步消息对比

| 维度        | 同步调用              | 异步消息                  |
|-------------|-----------------------|---------------------------|
| 响应方式    | 阻塞等待              | 立即返回                  |
| 耦合度      | 高(知道对方地址)    | 低(只管发消息)          |
| 性能        | 低(等待)            | 高(立即返回)            |
| 可用性      | 低(对方挂自己也挂)  | 高(队列缓冲)            |
| 一致性      | 强(立即知道结果)    | 最终(异步处理)          |
| 调试        | 容易(一条链)        | 难(要追消息)            |
| 顺序性      | 调用顺序 = 执行顺序  | 不保证(除非单分区)      |
| 错误处理    | 立即知道,立即处理   | 通过重试 + DLQ            |
| 适用场景    | 查询、需立即结果     | 通知、任务、解耦、削峰    |

## 五、常见消息队列对比

### 5.1 主流 MQ 对比表

| MQ            | 语言   | 吞吐       | 延迟    | 顺序性     | 重放   | 适用场景              |
|---------------|--------|------------|---------|------------|--------|-----------------------|
| RabbitMQ      | Erlang | 万级/秒    | 微秒级  | 队列内有序 | 不支持 | 业务消息、任务队列    |
| Kafka         | Scala  | 百万级/秒  | 毫秒级  | 分区内有序 | 支持   | 日志、流处理、大数据  |
| RocketMQ      | Java   | 十万级/秒  | 毫秒级  | 分区内有序 | 支持   | 电商、金融事务消息    |
| Pulsar        | Java   | 百万级/秒  | 毫秒级  | 分区内有序 | 支持   | 流处理、多租户        |
| Redis Streams | C      | 万级/秒    | 微秒级  | 弱         | 支持   | 轻量、嵌入式          |
| ActiveMQ      | Java   | 千级/秒    | 毫秒级  | 弱         | 不支持 | 老项目兼容            |

### 5.2 怎么选

\`\`\`
□ 需要高吞吐 + 日志/流处理? → Kafka
□ 需要复杂路由 + 业务消息? → RabbitMQ
□ 需要事务消息 + 电商场景? → RocketMQ
□ 需要多租户 + 流处理? → Pulsar
□ 已经用 Redis,轻量场景? → Redis Streams
□ 老项目兼容 JMS? → ActiveMQ(不推荐新项目)
\`\`\`

### 5.3 各 MQ 的设计哲学

- **RabbitMQ**:可靠 + 灵活路由(AMQP 协议),适合业务消息
- **Kafka**:高吞吐 + 日志流(append-only log),适合大数据
- **RocketMQ**:Kafka 思路 + 事务消息,适合电商
- **Pulsar**:计算存储分离 + 多租户,云原生

## 六、消息模型

### 6.1 点对点(P2P)

一条消息只被一个消费者消费:

\`\`\`
Producer ──► [Queue] ──► Consumer A (消费)
                    └──► Consumer B (拿不到)

多个消费者竞争消费(Work Queue 模式)
\`\`\`

\`\`\`python
# 伪代码:任务队列
# 多个 worker 竞争消费,一个任务只被一个 worker 处理
def worker():
    while True:
        msg = queue.consume()
        process(msg)
        queue.ack(msg)
\`\`\`

适用:任务分发、削峰。

### 6.2 发布订阅(Pub/Sub)

一条消息被所有订阅者消费:

\`\`\`
Producer ──► [Topic] ──► Subscriber A (消费)
                    └──► Subscriber B (也消费)
                    └──► Subscriber C (也消费)

每个订阅者独立消费,互不影响
\`\`\`

适用:事件通知、广播。

### 6.3 Kafka 的 Consumer Group 模型

Kafka 用 Consumer Group 同时支持两种模式:

\`\`\`
Topic: order.created(3 个分区 P0/P1/P2)

Consumer Group A:
  - Consumer 1 ← P0
  - Consumer 2 ← P1
  - Consumer 3 ← P2
  → 一条消息只被 Group A 里一个消费者消费(P2P)

Consumer Group B:
  - Consumer 4 ← P0, P1, P2
  → Group B 也消费所有消息(独立于 A,等于 Pub/Sub)
\`\`\`

同一个 Group 内是 P2P(负载均衡),不同 Group 之间是 Pub/Sub。

## 七、消息可靠性

### 7.1 三段保证(消息不丢)

\`\`\`
生产者 ──发消息──► Broker ──推消息──► 消费者
   ①                ②                  ③

① 生产者确认:Broker 收到后回 ack,生产者没收到就重发
② 持久化:消息写盘,Broker 重启不丢
③ 消费者手动 ack:处理完才 ack,没 ack 的会重投
\`\`\`

### 7.2 生产者确认(伪代码)

\`\`\`python
# RabbitMQ confirm mode
channel.confirm_delivery()

try:
    channel.basic_publish(
        exchange="",
        routing_key="orders",
        body=message,
        mandatory=True,            # 找不到队列时返回
        properties=pika.BasicProperties(delivery_mode=2),  # 持久化
    )
    channel.waitForConfirms(timeout=5.0)  # 等 Broker 确认
    print("消息已确认")
except Exception:
    # 重发或记日志
    print("消息发送失败,重试...")
\`\`\`

### 7.3 持久化

\`\`\`python
# 队列持久化
channel.queue_declare(queue="orders", durable=True)

# 消息持久化
channel.basic_publish(
    exchange="",
    routing_key="orders",
    body=message,
    properties=pika.BasicProperties(delivery_mode=2),  # 2 = persistent
)
\`\`\`

### 7.4 消费者手动 ACK

\`\`\`python
# 消费者关闭自动 ack
channel.basic_consume(
    queue="orders",
    on_message_callback=callback,
    auto_ack=False,  # 手动 ack
)

def callback(ch, method, properties, body):
    try:
        process_order(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)  # 处理成功才 ack
    except Exception as e:
        # 处理失败,nack 并决定是否重投
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        # requeue=False → 进死信队列
\`\`\`

### 7.5 死信队列(DLQ)

处理失败的消息进 DLQ,人工干预:

\`\`\`
正常队列 ──消费失败 3 次──► 死信队列(DLQ)
                            │
                            └─ 人工查看,修复后重新投递
\`\`\`

\`\`\`python
# RabbitMQ:通过 x-dead-letter-exchange 参数声明
channel.queue_declare(
    queue="orders",
    durable=True,
    arguments={
        "x-dead-letter-exchange": "orders.dlx",  # 死信交换机
        "x-dead-letter-routing-key": "orders.dead",
    }
)
\`\`\`

## 八、消息的常见问题

### 8.1 消息丢失

三段都可能丢:
- 生产者 → Broker:网络丢包 → 用生产者确认
- Broker 自身:宕机 → 持久化 + 集群
- Broker → 消费者:消费方挂了没 ack → 手动 ack + 重投

### 8.2 消息重复

网络问题导致 Broker 重投,或生产者重发:

\`\`\`
生产者发消息 → Broker 收到 → 网络抖动,生产者没收到 ack
生产者重发 → Broker 收到两次 → 消费者收到两条相同消息
\`\`\`

**对策:幂等消费**——用消息唯一 ID 去重。

\`\`\`python
def consume(msg):
    msg_id = msg["id"]
    if redis.set(f"processed:{msg_id}", "1", nx=True, ex=86400):
        # 第一次处理
        process(msg)
    else:
        # 已处理过,跳过
        print("重复消息,跳过")
\`\`\`

### 8.3 消息顺序

多消费者并发消费时,顺序不保证:

\`\`\`
消息 1, 2, 3 进队列
Consumer A 拿到 1
Consumer B 拿到 2
Consumer B 先处理完 → 顺序变成 2, 1, 3
\`\`\`

**对策:单分区/单队列串行消费**(牺牲并发换顺序)。

### 8.4 消息积压

生产速度 > 消费速度,队列堆积:

**对策**:
- 增加消费者数量
- 批量消费(一次取多条)
- 优化消费逻辑(减少 IO)

\`\`\`python
# 批量消费
msgs = consumer.poll(max_records=100)  # 一次取 100 条
for msg in msgs:
    process(msg)
\`\`\`

### 8.5 消息过期

旧消息占用空间:

**对策**:TTL + DLQ。

\`\`\`python
# RabbitMQ:消息 TTL
channel.basic_publish(
    exchange="",
    routing_key="orders",
    body=message,
    properties=pika.BasicProperties(
        delivery_mode=2,
        expiration="60000",  # 60 秒后过期
    ),
)
\`\`\`

## 九、Python 通用概念演示(伪代码)

### 9.1 生产者抽象

\`\`\`python
from abc import ABC, abstractmethod

class MessageProducer(ABC):
    @abstractmethod
    def send(self, topic: str, message: dict) -> str:
        """发送消息,返回消息 ID。"""
        ...

class RabbitMQProducer(MessageProducer):
    def send(self, topic: str, message: dict) -> str:
        # 用 pika 发到 RabbitMQ
        ...

class KafkaProducer(MessageProducer):
    def send(self, topic: str, message: dict) -> str:
        # 用 kafka-python 发到 Kafka
        ...
\`\`\`

### 9.2 消费者抽象

\`\`\`python
class MessageConsumer(ABC):
    @abstractmethod
    def consume(self, topic: str, handler: callable):
        """订阅主题,处理消息。"""
        ...

class RabbitMQConsumer(MessageConsumer):
    def consume(self, topic: str, handler: callable):
        channel.basic_consume(queue=topic, on_message_callback=handler)
        channel.start_consuming()
\`\`\`

### 9.3 一个通用的消息处理框架

\`\`\`python
import json
import redis

r = redis.Redis(host="redis", port=6379)

def idempotent_handler(handler):
    """装饰器:幂等消费(基于消息 ID 去重)。"""
    def wrapper(ch, method, properties, body):
        msg = json.loads(body)
        msg_id = msg.get("id")
        if not msg_id:
            handler(msg)
            ch.basic_ack(method.delivery_tag)
            return

        # 用 Redis SET NX 去重
        if r.set(f"msg:processed:{msg_id}", "1", nx=True, ex=86400):
            try:
                handler(msg)
                ch.basic_ack(method.delivery_tag)
            except Exception as e:
                # 处理失败,删除标记以便重试
                r.delete(f"msg:processed:{msg_id}")
                ch.basic_nack(method.delivery_tag, requeue=True)
        else:
            # 重复消息,直接 ack 丢弃
            ch.basic_ack(method.delivery_tag)

    return wrapper

@idempotent_handler
def process_order(msg):
    print(f"Processing order {msg['payload']['order_id']}")
    # 业务逻辑...
\`\`\`

## 十、消息队列的部署形态

### 10.1 单机

\`\`\`
1 个 Broker,适合开发测试
\`\`\`

### 10.2 集群

\`\`\`
多个 Broker 组成集群,数据分片 + 副本
  Broker1 (P0 leader, P1 replica)
  Broker2 (P1 leader, P2 replica)
  Broker3 (P2 leader, P0 replica)
\`\`\`

### 10.3 主从复制

\`\`\`
Master(读写) → 同步 → Slave(只读,故障时切换)
\`\`\`

## 十一、易错点小结

| 易错点                          | 后果                  | 正确做法                            |
|---------------------------------|-----------------------|-------------------------------------|
| 不开持久化                      | Broker 重启消息丢     | durable=True + delivery_mode=2      |
| 自动 ack(auto_ack=True)        | 处理失败消息丢        | 手动 ack,处理完再 ack              |
| 不做幂等                        | 重复消费,数据错      | 唯一 ID + Redis 去重                |
| 不设 TTL                        | 积压消息占满磁盘      | 设消息 TTL + DLQ                    |
| 消费者串行处理,吞吐低          | 积压                  | 多消费者并发,批量消费              |
| 需要顺序却多分区                | 顺序乱                | 单分区 / 按 key 路由到同分区        |
| 生产者不开 confirm              | 发送失败不知道        | 开 confirm mode                     |
| 用消息队列做 RPC                | 滥用,延迟高          | 用真正的 RPC(gRPC)                |
| Broker 单点部署                 | 挂了全瘫              | 集群 + 副本                         |
| 消费失败不进 DLQ 直接丢弃       | 数据丢失              | 失败消息进 DLQ,人工处理            |
| 大消息塞队列                    | Broker 内存爆         | 大消息存对象存储,队列只放引用      |

---

## 本讲小结

消息队列是分布式系统的「缓冲器」。核心要点:

1. **四大价值:解耦、异步、削峰、可靠**。
2. **两种模型:P2P(任务分发)+ Pub/Sub(广播)**。
3. **可靠性三段:生产者确认 + 持久化 + 消费者手动 ack**。
4. **常见问题:丢失(三段保证)、重复(幂等)、顺序(单分区)、积压(扩消费者)**。

选型口诀:**业务消息选 RabbitMQ,大数据流选 Kafka,电商事务选 RocketMQ**。

下两章我们分别实战 RabbitMQ 和 Kafka。
`,
  },
  {
    id: "pyarch-rabbitmq",
    icon: "🐰",
    title: "RabbitMQ 实战",
    group: "消息队列",
    content: `# RabbitMQ 实战

## 一、RabbitMQ 简介

RabbitMQ 是用 **Erlang** 编写的消息队列,基于 **AMQP 0-9-1 协议**,2007 年发布,是最成熟的开源 MQ 之一。

### 1.1 特点

- **稳定可靠**:Erlang 天生适合高并发,电信级稳定性
- **灵活路由**:四种 Exchange 类型,路由能力强大
- **协议丰富**:支持 AMQP、STOMP、MQTT
- **管理完善**:自带 Web 管理界面
- **插件生态**:延时消息、 shovel、federation 等

### 1.2 适用场景

- 业务消息(订单、支付)
- 任务队列(异步任务)
- 日志收集(轻量级)
- RPC 回调

### 1.3 快速启动

\`\`\`bash
# Docker 启动(带管理界面)
docker run -d --name rabbitmq \\
  -p 5672:5672 \\
  -p 15672:15672 \\
  -e RABBITMQ_DEFAULT_USER=admin \\
  -e RABBITMQ_DEFAULT_PASS=admin \\
  rabbitmq:3-management

# 5672:AMQP 端口
# 15672:管理界面(http://localhost:15672,admin/admin)
\`\`\`

### 1.4 Python 客户端

\`\`\`bash
pip install pika
\`\`\`

## 二、RabbitMQ 核心模型

### 2.1 模型概览

\`\`\`
Producer ──发消息──► Exchange ──路由──► Queue ──消费──► Consumer
                        │
                        └─ 通过 Binding 和 Routing Key 决定路由到哪个 Queue
\`\`\`

### 2.2 四个核心概念

| 概念      | 说明                                |
|-----------|-------------------------------------|
| Producer  | 生产者,发消息                      |
| Exchange  | 交换机,接收消息并路由              |
| Queue     | 队列,存储消息                      |
| Binding   | 绑定,Exchange 和 Queue 的关联规则 |

### 2.3 Exchange 四种类型

#### Direct(直连)

按 **Routing Key 完全匹配**路由:

\`\`\`
Exchange(direct)
  ├─ routing_key="info"    → Queue(info)
  ├─ routing_key="error"   → Queue(error)
  └─ routing_key="warning" → Queue(warning)

消息 routing_key="error" → 只进 Queue(error)
\`\`\`

适用:精确路由,如按日志级别分发。

#### Fanout(扇出)

**广播**:消息发到所有绑定的 Queue,忽略 Routing Key:

\`\`\`
Exchange(fanout)
  ├─ → Queue A
  ├─ → Queue B
  └─ → Queue C

一条消息 → A、B、C 都收到
\`\`\`

适用:广播通知,如配置变更。

#### Topic(主题)

按 **Routing Key 模式匹配**:

\`\`\`
Exchange(topic)
  ├─ routing_key="order.*"      → Queue(订单相关)
  ├─ routing_key="order.paid"   → Queue(已支付)
  └─ routing_key="user.#"       → Queue(用户所有)

* 匹配一个词
# 匹配零或多个词
\`\`\`

适用:按主题分类订阅。

#### Headers(头部)

按 **消息 header** 匹配,忽略 Routing Key:

\`\`\`
Exchange(headers)
  绑定时指定 arguments={"format": "json", "x-match": "all"}

消息 header 满足条件才路由
\`\`\`

适用:复杂条件路由,用得少。

### 2.4 四种 Exchange 对比

| 类型    | 路由依据        | 灵活性 | 性能 | 典型场景       |
|---------|-----------------|--------|------|----------------|
| direct  | Routing Key 完全匹配 | 中 | 高   | 按级别分发     |
| fanout  | 忽略,广播       | 低     | 最高 | 广播通知       |
| topic   | Routing Key 模式匹配 | 高 | 中   | 主题订阅       |
| headers | 消息 header      | 高     | 低   | 复杂条件(少用)|

## 三、Python 实战(pika 库)

### 3.1 最简生产者

\`\`\`python
# producer.py
import pika

# 1. 建立连接
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host="localhost", port=5672,
                              credentials=pika.PlainCredentials("admin", "admin"))
)
channel = connection.channel()

# 2. 声明队列(durable=True 持久化)
channel.queue_declare(queue="hello", durable=True)

# 3. 发送消息
channel.basic_publish(
    exchange="",
    routing_key="hello",
    body="Hello RabbitMQ!",
    properties=pika.BasicProperties(delivery_mode=2),  # 持久化
)

print(" [x] Sent 'Hello RabbitMQ!'")
connection.close()
\`\`\`

### 3.2 最简消费者

\`\`\`python
# consumer.py
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host="localhost", port=5672,
                              credentials=pika.PlainCredentials("admin", "admin"))
)
channel = connection.channel()

channel.queue_declare(queue="hello", durable=True)

def callback(ch, method, properties, body):
    print(f" [x] Received {body}")
    ch.basic_ack(delivery_tag=method.delivery_tag)  # 手动 ack

channel.basic_consume(queue="hello", on_message_callback=callback, auto_ack=False)

print(" [*] Waiting for messages. To exit press CTRL+C")
channel.start_consuming()
\`\`\`

## 四、Work Queue(任务分发)

### 4.1 场景

多个 worker 竞争消费,一个任务只被一个 worker 处理:

\`\`\`
Producer ──► [task_queue] ──► Worker 1
                       └──► Worker 2
                       └──► Worker 3
\`\`\`

### 4.2 生产者

\`\`\`python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="task_queue", durable=True)

message = " ".join(sys.argv[1:]) or "Hello World!"
channel.basic_publish(
    exchange="",
    routing_key="task_queue",
    body=message,
    properties=pika.BasicProperties(delivery_mode=2),
)
print(f" [x] Sent '{message}'")
connection.close()
\`\`\`

### 4.3 消费者

\`\`\`python
import pika
import time

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="task_queue", durable=True)

# 公平分发:一个 worker 一次只处理一条,处理完才拿下一条
channel.basic_qos(prefetch_count=1)

def callback(ch, method, properties, body):
    print(f" [x] Received {body}")
    time.sleep(body.count(b"."))  # 模拟耗时(点数 = 秒数)
    print(" [x] Done")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue="task_queue", on_message_callback=callback, auto_ack=False)

print(" [*] Waiting for tasks")
channel.start_consuming()
\`\`\`

**关键:\`prefetch_count=1\`** 让 RabbitMQ 不要一次给一个 worker 推太多,实现公平分发。

## 五、Pub/Sub(fanout 广播)

### 5.1 场景

一条消息广播给所有订阅者:

\`\`\`
Producer ──► Exchange(fanout) ──► Queue A ──► Consumer A
                            └──► Queue B ──► Consumer B
\`\`\`

### 5.2 生产者

\`\`\`python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

# 声明 fanout 交换机
channel.exchange_declare(exchange="logs", exchange_type="fanout")

message = "info: Hello, all subscribers!"
channel.basic_publish(
    exchange="logs",
    routing_key="",  # fanout 忽略 routing_key
    body=message,
)
print(f" [x] Sent '{message}'")
connection.close()
\`\`\`

### 5.3 消费者

\`\`\`python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.exchange_declare(exchange="logs", exchange_type="fanout")

# 临时队列:RabbitMQ 随机生成队列名,断开连接自动删除
result = channel.queue_declare(queue="", exclusive=True)
queue_name = result.method.queue

# 绑定队列到交换机
channel.queue_bind(exchange="logs", queue=queue_name)

print(f" [*] Waiting for logs on {queue_name}")

def callback(ch, method, properties, body):
    print(f" [x] {body}")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
channel.start_consuming()
\`\`\`

每个消费者启动时创建一个临时队列绑定到 logs 交换机,生产者发消息时所有消费者都收到。

## 六、Topic(路由匹配)

### 6.1 场景

按主题模式订阅:

\`\`\`
routing_key 格式:用 . 分隔,如 "kern.critical"
  * 匹配一个词
  # 匹配零或多个词
\`\`\`

### 6.2 生产者

\`\`\`python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.exchange_declare(exchange="topic_logs", exchange_type="topic")

routing_key = sys.argv[1] if len(sys.argv) > 1 else "anonymous.info"
message = " ".join(sys.argv[2:]) or "Hello World!"

channel.basic_publish(
    exchange="topic_logs",
    routing_key=routing_key,
    body=message,
)
print(f" [x] Sent {routing_key}:{message}")
connection.close()
\`\`\`

### 6.3 消费者

\`\`\`python
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.exchange_declare(exchange="topic_logs", exchange_type="topic")

result = channel.queue_declare(queue="", exclusive=True)
queue_name = result.method.queue

# 绑定键(可多个)
binding_keys = sys.argv[1:] if len(sys.argv) > 1 else ["#"]
for binding_key in binding_keys:
    channel.queue_bind(exchange="topic_logs", queue=queue_name, routing_key=binding_key)

print(f" [*] Waiting for logs. Bindings: {binding_keys}")

def callback(ch, method, properties, body):
    print(f" [x] {method.routing_key}:{body}")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
channel.start_consuming()
\`\`\`

\`\`\`bash
# 启动一个消费者订阅所有 kern 相关
python consumer.py "kern.*"

# 启动一个消费者订阅所有 critical
python consumer.py "*.critical"

# 启动一个消费者订阅所有
python consumer.py "#"

# 生产者发消息
python producer.py "kern.critical" "A critical kernel error"
python producer.py "auth.info" "User logged in"
\`\`\`

## 七、RPC 模式(回调队列)

### 7.1 场景

用 RabbitMQ 实现 RPC:客户端发请求,服务端处理后通过回调队列返回结果。

\`\`\`
Client ──► [rpc_queue] ──► Server
Client ◄──[callback_queue]◄── Server
\`\`\`

### 7.2 服务端

\`\`\`python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="rpc_queue")

def fib(n):
    """计算斐波那契。"""
    if n == 0: return 0
    if n == 1: return 1
    return fib(n-1) + fib(n-2)

def on_request(ch, method, props, body):
    n = int(body)
    print(f" [.] fib({n})")
    response = fib(n)

    # 把结果发到回调队列
    ch.basic_publish(
        exchange="",
        routing_key=props.reply_to,  # 客户端指定的回调队列
        properties=pika.BasicProperties(correlation_id=props.correlation_id),
        body=str(response),
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue="rpc_queue", on_message_callback=on_request, auto_ack=False)

print(" [x] Awaiting RPC requests")
channel.start_consuming()
\`\`\`

### 7.3 客户端

\`\`\`python
import pika
import uuid

class FibonacciClient:
    def __init__(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
        self.channel = self.connection.channel()
        # 临时回调队列
        result = self.channel.queue_declare(queue="", exclusive=True)
        self.callback_queue = result.method.queue
        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True,
        )
        self.response = None
        self.corr_id = None

    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = body

    def call(self, n):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(
            exchange="",
            routing_key="rpc_queue",
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=self.corr_id,
            ),
            body=str(n),
        )
        # 等待结果
        while self.response is None:
            self.connection.process_data_events()
        return int(self.response)

client = FibonacciClient()
print(f" [x] Requesting fib(30)")
response = client.call(30)
print(f" [.] Got {response}")
\`\`\`

**关键**:\`correlation_id\` 用来匹配请求和响应,避免串号。

## 八、消息可靠性

### 8.1 持久化

队列和消息都要持久化:

\`\`\`python
# 队列持久化
channel.queue_declare(queue="orders", durable=True)

# 消息持久化
channel.basic_publish(
    exchange="",
    routing_key="orders",
    body=message,
    properties=pika.BasicProperties(delivery_mode=2),  # 2 = persistent
)
\`\`\`

### 8.2 生产者确认(confirm mode)

\`\`\`python
channel.confirm_delivery()

try:
    channel.basic_publish(
        exchange="",
        routing_key="orders",
        body=message,
        mandatory=True,  # 找不到队列时返回(不静默丢弃)
        properties=pika.BasicProperties(delivery_mode=2),
    )
    channel.waitForConfirms(timeout=5.0)
    print("Broker 已确认收到")
except Exception:
    print("发送失败,重试")
\`\`\`

### 8.3 消费者手动 ACK

\`\`\`python
def callback(ch, method, properties, body):
    try:
        process(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        # nack 并重新入队(或进死信)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

channel.basic_consume(queue="orders", on_message_callback=callback, auto_ack=False)
\`\`\`

### 8.4 死信队列(DLQ)

\`\`\`python
# 1. 声明死信交换机和队列
channel.exchange_declare("orders.dlx", exchange_type="direct")
channel.queue_declare("orders.dead", durable=True)
channel.queue_bind("orders.dead", "orders.dlx", routing_key="orders.dead")

# 2. 声明正常队列,指定死信交换机
channel.queue_declare(
    queue="orders",
    durable=True,
    arguments={
        "x-dead-letter-exchange": "orders.dlx",
        "x-dead-letter-routing-key": "orders.dead",
        "x-message-ttl": 60000,  # 消息 60s 未消费 → 死信
    },
)
\`\`\`

触发死信的条件:
1. 消息被 reject/nack 且 requeue=false
2. 消息 TTL 过期
3. 队列长度超限

## 九、实战:日志系统(direct + topic)

### 9.1 需求

按日志级别路由:
- error → 存盘 + 报警
- warning → 存盘
- info → 显示

### 9.2 实现(direct)

\`\`\`python
# log_producer.py
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.exchange_declare(exchange="direct_logs", exchange_type="direct")

severity = sys.argv[1] if len(sys.argv) > 1 else "info"
message = " ".join(sys.argv[2:]) or "Hello"

channel.basic_publish(
    exchange="direct_logs",
    routing_key=severity,
    body=message,
)
print(f" [x] Sent {severity}:{message}")
connection.close()
\`\`\`

\`\`\`python
# log_consumer.py
import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.exchange_declare(exchange="direct_logs", exchange_type="direct")

result = channel.queue_declare(queue="", exclusive=True)
queue_name = result.method.queue

severities = sys.argv[1:] or ["info"]
for sev in severities:
    channel.queue_bind(exchange="direct_logs", queue=queue_name, routing_key=sev)

print(f" [*] Waiting for logs: {severities}")

def callback(ch, method, properties, body):
    print(f" [x] {method.routing_key}:{body}")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
channel.start_consuming()
\`\`\`

\`\`\`bash
# 启动一个只收 error 的消费者
python log_consumer.py error

# 启动一个收 error + warning 的消费者
python log_consumer.py error warning

# 生产者发不同级别日志
python log_producer.py error "DB connection failed"
python log_producer.py warning "Disk usage 80%"
python log_producer.py info "User logged in"
\`\`\`

### 9.3 topic 版本(更灵活)

\`\`\`python
# 用 topic 交换机,routing_key 用 "facility.level" 格式
# 如 "kern.critical" "auth.info" "payment.error"

channel.exchange_declare(exchange="topic_logs", exchange_type="topic")

# 订阅所有 critical
channel.queue_bind(exchange="topic_logs", queue=q, routing_key="*.critical")

# 订阅 kern 下所有级别
channel.queue_bind(exchange="topic_logs", queue=q, routing_key="kern.*")

# 订阅所有
channel.queue_bind(exchange="topic_logs", queue=q, routing_key="#")
\`\`\`

## 十、实战:任务队列(削峰)

### 10.1 场景

秒杀场景:瞬时 10w 请求,数据库扛不住。先入队列,消费者按节奏处理。

### 10.2 生产者(秒杀入口)

\`\`\`python
# seckill_producer.py
import pika
import json
import uuid

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="seckill_orders", durable=True)

def submit_seckill(user_id: int, item_id: int):
    """秒杀请求入队,立即返回。"""
    order = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "item_id": item_id,
        "timestamp": "2026-07-04T10:00:00",
    }
    channel.basic_publish(
        exchange="",
        routing_key="seckill_orders",
        body=json.dumps(order),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    return {"status": "queued", "order_id": order["id"]}

# 模拟 1000 个秒杀请求
for i in range(1000):
    submit_seckill(user_id=i, item_id=10086)

print("1000 个秒杀请求已入队")
connection.close()
\`\`\`

### 10.3 消费者(订单处理 worker)

\`\`\`python
# seckill_worker.py
import pika
import json
import time

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="seckill_orders", durable=True)
channel.basic_qos(prefetch_count=1)  # 一次只处理一条

def process_order(order):
    """模拟下单处理:扣库存 + 创建订单。"""
    print(f"Processing order {order['id']} for user {order['user_id']}")
    time.sleep(0.1)  # 模拟数据库操作
    # 假设 80% 成功
    return True

def callback(ch, method, properties, body):
    try:
        order = json.loads(body)
        success = process_order(order)
        if success:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"Error: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

channel.basic_consume(queue="seckill_orders", on_message_callback=callback, auto_ack=False)

print(" [*] Seckill worker waiting for orders")
channel.start_consuming()
\`\`\`

启动多个 worker 并行消费,实现削峰。

## 十一、实战:完整订单异步处理

### 11.1 需求

用户下单后,系统要:
1. 扣库存
2. 发邮件通知
3. 加积分
4. 记日志

如果同步调用 4 个服务,用户要等很久。改异步:下单后发一条消息,4 个服务各自消费。

\`\`\`
order-service ──发"order.created"──► [topic exchange] ──► stock-queue ──► 扣库存
                                          ├─► email-queue ──► 发邮件
                                          ├─► points-queue ──► 加积分
                                          └─► log-queue ────► 记日志
\`\`\`

### 11.2 订单服务(生产者)

\`\`\`python
# order_service.py
import pika
import json
import uuid
from fastapi import FastAPI

app = FastAPI()

connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()

# 声明 topic 交换机
channel.exchange_declare(exchange="order_events", exchange_type="topic")

@app.post("/orders")
def create_order(user_id: int, item_id: int, amount: float):
    """创建订单,发事件。"""
    order_id = str(uuid.uuid4())
    event = {
        "id": str(uuid.uuid4()),
        "type": "order.created",
        "timestamp": "2026-07-04T10:00:00",
        "payload": {
            "order_id": order_id,
            "user_id": user_id,
            "item_id": item_id,
            "amount": amount,
        },
    }
    channel.basic_publish(
        exchange="order_events",
        routing_key="order.created",
        body=json.dumps(event),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    return {"order_id": order_id, "status": "created"}
\`\`\`

### 11.3 库存服务(消费者)

\`\`\`python
# stock_service.py
import pika
import json

connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()

channel.exchange_declare(exchange="order_events", exchange_type="topic")
channel.queue_declare(queue="stock_queue", durable=True)
channel.queue_bind(exchange="order_events", queue="stock_queue", routing_key="order.created")

def callback(ch, method, properties, body):
    event = json.loads(body)
    order = event["payload"]
    print(f"[stock] 扣减库存:order={order['order_id']}, item={order['item_id']}")
    # 扣库存逻辑...
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue="stock_queue", on_message_callback=callback, auto_ack=False)
print("[stock] Waiting for order events")
channel.start_consuming()
\`\`\`

### 11.4 邮件 / 积分 / 日志服务

结构相同,只是 queue 名和 callback 不同:

\`\`\`python
# email_service.py(结构同上,改 queue 和 binding)
channel.queue_declare(queue="email_queue", durable=True)
channel.queue_bind(exchange="order_events", queue="email_queue", routing_key="order.created")

def callback(ch, method, properties, body):
    event = json.loads(body)
    order = event["payload"]
    print(f"[email] 发邮件给用户 {order['user_id']}:订单 {order['order_id']} 已创建")
    ch.basic_ack(delivery_tag=method.delivery_tag)

# points_service.py
channel.queue_declare(queue="points_queue", durable=True)
channel.queue_bind(exchange="order_events", queue="points_queue", routing_key="order.created")

def callback(ch, method, properties, body):
    event = json.loads(body)
    order = event["payload"]
    points = int(order["amount"] * 10)
    print(f"[points] 给用户 {order['user_id']} 加 {points} 积分")
    ch.basic_ack(delivery_tag=method.delivery_tag)

# log_service.py
channel.queue_declare(queue="log_queue", durable=True)
channel.queue_bind(exchange="order_events", queue="log_queue", routing_key="order.created")

def callback(ch, method, properties, body):
    event = json.loads(body)
    print(f"[log] {event['timestamp']} order {event['payload']['order_id']} created")
    ch.basic_ack(delivery_tag=method.delivery_tag)
\`\`\`

### 11.5 启动

\`\`\`bash
# 4 个终端分别启动 4 个消费者
python stock_service.py
python email_service.py
python points_service.py
python log_service.py

# 创建订单
curl -X POST "http://localhost:8000/orders?user_id=1&item_id=10086&amount=99.9"
# 立即返回 {"order_id":"...","status":"created"}

# 4 个消费者各自收到事件并处理:
# [stock] 扣减库存:order=xxx, item=10086
# [email] 发邮件给用户 1:订单 xxx 已创建
# [points] 给用户 1 加 999 积分
# [log] 2026-07-04T10:00:00 order xxx created
\`\`\`

**关键**:order-service 只管发消息,不知道有 4 个下游服务。新增第 5 个服务只需再订阅,order-service 不用改——这就是**解耦**。

## 十二、易错点小结

| 易错点                          | 后果                  | 正确做法                            |
|---------------------------------|-----------------------|-------------------------------------|
| 队列不声明 durable              | Broker 重启队列消失   | durable=True                        |
| 消息不设 delivery_mode=2        | 重启丢消息            | 显式持久化                          |
| auto_ack=True                   | 处理失败消息丢        | 手动 ack                            |
| 不设 prefetch_count             | 一个 worker 堆积,其他闲 | prefetch_count=1 公平分发        |
| Exchange 类型选错               | 路由不符合预期        | 理解 direct/fanout/topic 区别      |
| 忘记 queue_bind                 | 消息丢失(没队列接收)| 先 bind 再 publish                  |
| routing_key 拼写错误            | 消息进错队列          | 用常量定义 routing key             |
| mandatory=False 不处理 return   | 消息静默丢弃          | mandatory=True + ReturnCallback    |
| 大消息塞队列                    | Broker 内存爆         | 大消息走对象存储,队列放引用       |
| RPC 不用 correlation_id         | 响应串号              | 每个请求生成唯一 ID 匹配           |
| 死信队列没配                    | 失败消息丢失          | 配 x-dead-letter-exchange           |
| 消费者不幂等                    | 重投导致重复处理      | 唯一 ID + Redis 去重                |

---

## 本讲小结

RabbitMQ 是「业务消息之王」。核心要点:

1. **四大 Exchange:direct(精确)/ fanout(广播)/ topic(模式)/ headers(少用)**。
2. **可靠性三件套:持久化 + 生产者确认 + 消费者手动 ack**。
3. **prefetch_count=1 实现公平分发的 Work Queue**。
4. **死信队列处理失败消息,避免丢失**。
5. **解耦:生产者发消息到 exchange,多个消费者各自订阅 queue**。

下一章我们看高吞吐的 Kafka,理解它的「日志流」哲学。
`,
  },
  {
    id: "pyarch-kafka",
    icon: "🦅",
    title: "Kafka 实战",
    group: "消息队列",
    content: `# Kafka 实战

## 一、Kafka 简介

Kafka 最初由 **LinkedIn** 开发,2011 年开源,现在是 Apache 顶级项目。它是一个**分布式流平台**,设计目标:**高吞吐、低延迟、可水平扩展、消息可重放**。

### 1.1 Kafka 的定位

\`\`\`
RabbitMQ:消息队列(发完就删)
Kafka:   事件日志(消息存下来,可重放,像数据库)
\`\`\`

Kafka 的核心思想是**「把消息当成不可变日志」**:生产者 append 写入,消费者按 offset 读取,消息不会因消费而删除,可保留几天甚至永久。

### 1.2 典型场景

- **日志收集**:微服务日志统一写 Kafka,再消费到 ES/HDFS
- **事件溯源**:所有状态变更作为事件存档,可重放重建状态
- **流处理**:Kafka Streams / Flink 实时计算
- **消息解耦**:微服务间异步通信(类似 RabbitMQ)
- **CDC(变更数据捕获)**:数据库 binlog → Kafka → 下游同步
- **指标采集**:监控指标聚合

### 1.3 快速启动

\`\`\`bash
# Docker Compose 启动单节点 Kafka(KRaft 模式,无需 Zookeeper)
docker run -d --name kafka \\
  -p 9092:9092 \\
  -e KAFKA_NODE_ID=1 \\
  -e KAFKA_PROCESS_ROLES=broker,controller \\
  -e KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \\
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \\
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \\
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \\
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \\
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \\
  -e CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk \\
  confluentinc/cp-kafka:7.5.0
\`\`\`

### 1.4 Python 客户端

\`\`\`bash
pip install kafka-python  # 纯 Python,简单
# 或
pip install confluent-kafka  # 基于 librdkafka,高性能
\`\`\`

## 二、Kafka 核心概念

### 2.1 整体架构

\`\`\`
Producer ──► Broker ──► Topic(Partition) ──► Consumer Group
              │
              ├─ Broker1: Topic-A P0(leader), P1(replica)
              ├─ Broker2: Topic-A P1(leader), P2(replica)
              └─ Broker3: Topic-A P2(leader), P0(replica)
\`\`\`

### 2.2 核心概念

| 概念              | 说明                                |
|-------------------|-------------------------------------|
| Producer 生产者   | 发消息的一方                        |
| Consumer 消费者   | 收消息的一方                        |
| Broker 代理       | Kafka 服务器节点                    |
| Topic 主题        | 消息分类,类似数据库表              |
| Partition 分区    | Topic 的并行单元,有序日志          |
| Offset 偏移量     | 消费者在分区中的位置                |
| Consumer Group    | 消费者组,组内分摊分区              |
| Replica 副本      | 分区的拷贝,保证高可用              |
| Leader/Follower   | 副本角色,leader 读写,follower 同步|

### 2.3 Topic 与 Partition

一个 Topic 分成多个 Partition,每个 Partition 是一个**有序、不可变、append-only** 的日志:

\`\`\`
Topic: user-events(3 个分区)

Partition 0: [msg0] [msg3] [msg6] [msg9] ...
Partition 1: [msg1] [msg4] [msg7] [msg10] ...
Partition 2: [msg2] [msg5] [msg8] [msg11] ...

每个分区内有序,跨分区不保证顺序
\`\`\`

**分区的作用**:
- **并行**:多分区可被多消费者并行消费
- **扩展**:数据分散到多 Broker
- **有序**:单分区内消息有序

### 2.4 Offset

每个分区里的消息有一个**递增的 offset**,消费者按 offset 读取:

\`\`\`
Partition 0: [0] [1] [2] [3] [4] [5] [6]
                              ↑
                         消费者当前位置(offset=4)
\`\`\`

消费者**自己保存 offset**(不靠 Broker),可以从任意位置开始消费——这是 Kafka 可重放的基础。

### 2.5 Consumer Group

\`\`\`
Topic: order.created(3 个分区 P0/P1/P2)

Consumer Group "order-processors":
  Consumer A ← P0, P1
  Consumer B ← P2
  → 一条消息只被组内一个消费者消费(负载均衡)

Consumer Group "order-analytics":
  Consumer C ← P0, P1, P2
  → 独立消费所有消息(类似 Pub/Sub)
\`\`\`

**规则**:一个分区在同一时刻只被组内一个消费者消费。

- 同组多消费者 → 分区负载均衡(P2P)
- 不同组 → 各自独立消费(Pub/Sub)

## 三、Kafka vs RabbitMQ 对比

| 维度      | RabbitMQ              | Kafka                     |
|-----------|-----------------------|---------------------------|
| 设计哲学  | 消息队列(发完即删) | 事件日志(可重放)        |
| 吞吐      | 万级/秒               | 百万级/秒                 |
| 延迟      | 微秒级                | 毫秒级                    |
| 顺序性    | 队列内有序            | 分区内有序                |
| 消息保留  | 消费后删除            | 按时间/大小保留           |
| 消息重放  | 不支持                | 支持(改 offset)         |
| 路由      | Exchange 灵活路由     | 按 key 分区               |
| 适用场景  | 业务消息、任务队列    | 日志、流处理、事件溯源    |
| 复杂度    | 中                    | 高                        |

**选型口诀**:
- 需要灵活路由 + 业务消息 → RabbitMQ
- 需要高吞吐 + 日志/流 + 重放 → Kafka

## 四、Kafka 核心特性

### 4.1 持久化日志(可重放)

消息不像 RabbitMQ 那样消费即删除,而是**按配置保留**(如 7 天)。消费者可以:

\`\`\`python
# 从最早开始消费(重放历史)
consumer.seek_to_beginning()

# 从指定 offset 开始
consumer.seek(partition, offset=100)

# 跳到最新
consumer.seek_to_end()
\`\`\`

这让 Kafka 能做 RabbitMQ 做不到的事:**事件溯源**、**数据回放**、**新消费者补消费历史**。

### 4.2 分区有序

\`\`\`python
# 按用户 ID 分区 → 同一用户的事件进同一分区 → 保持顺序
producer.send("user-events", key=str(user_id), value=event)
\`\`\`

\`\`\`
user_id=1  → hash(1) % 3 = P0 → [e1, e3, e5]  (有序)
user_id=2  → hash(2) % 3 = P1 → [e2, e4]      (有序)
user_id=3  → hash(3) % 3 = P2 → [e6]          (有序)
\`\`\`

### 4.3 消费者组负载均衡

\`\`\`
3 个分区 + 3 个消费者 → 每人 1 个分区,完美并行
3 个分区 + 1 个消费者 → 1 人消费 3 个分区
3 个分区 + 5 个消费者 → 3 人干活,2 人闲置(分区数 < 消费者数)
\`\`\`

**经验**:消费者数 ≤ 分区数,否则浪费。

### 4.4 高吞吐的秘密

\`\`\`
1. 顺序写盘:append-only,磁盘顺序写接近内存速度
2. 零拷贝(sendfile):数据直接从内核态到网卡,不经用户态
3. 批量发送:生产者批量攒消息再发,减少网络往返
4. 压缩:snappy/lz4/gzip 压缩减少网络流量
5. 分区并行:多分区分布在多 Broker
\`\`\`

## 五、Python 实战

### 5.1 生产者

\`\`\`python
from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    key_serializer=lambda k: str(k).encode("utf-8"),
    acks="all",            # 等所有副本确认
    retries=3,             # 失败重试
    linger_ms=10,          # 攒 10ms 再批量发
    compression_type="lz4",
)

# 发送消息(指定 key,同 key 进同分区)
future = producer.send("order-events", key=1, value={"order_id": 1001, "amount": 99.9})
result = future.get(timeout=10)  # 同步等待确认
print(f"Sent to partition {result.partition}, offset {result.offset}")

producer.flush()
producer.close()
\`\`\`

### 5.2 消费者

\`\`\`python
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    "order-events",
    bootstrap_servers=["localhost:9092"],
    group_id="order-processors",     # 消费者组
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    key_deserializer=lambda k: k.decode("utf-8") if k else None,
    enable_auto_commit=False,         # 手动提交 offset
    auto_offset_reset="earliest",     # 没 offset 时从最早开始
    max_poll_records=100,             # 一次最多取 100 条
)

for message in consumer:
    print(f"topic={message.topic}, partition={message.partition}, "
          f"offset={message.offset}, key={message.key}, value={message.value}")
    # 处理消息...
    consumer.commit()  # 手动提交 offset
\`\`\`

### 5.3 分区策略

\`\`\`python
# 1. 指定 key → hash(key) % partition_count
producer.send("events", key="user-123", value=event)

# 2. 直接指定 partition
producer.send("events", partition=0, value=event)

# 3. 都不指定 → 轮询(round-robin)
producer.send("events", value=event)

# 4. 自定义分区器
class UserPartitioner:
    def __call__(self, key, all_partitions, available):
        # 按 user_id 范围分区
        user_id = int(key)
        return all_partitions[user_id % len(all_partitions)]
\`\`\`

## 六、应用场景

### 6.1 日志收集

\`\`\`
微服务1 ─┐
微服务2 ─┼─► Kafka(logs topic) ─► Logstash ─► Elasticsearch ─► Kibana
微服务3 ─┘
\`\`\`

每个服务把日志写 Kafka,Logstash/Filebeat 消费后写入 ES,Kibana 展示。Kafka 在中间起缓冲作用。

### 6.2 事件溯源

\`\`\`
所有状态变更作为事件存 Kafka:
- user.created
- user.email_changed
- user.logged_in

需要重建状态时:从头消费所有事件,回放得到当前状态
\`\`\`

### 6.3 流处理

\`\`\`
用户行为 → Kafka → Kafka Streams/Flink → 实时统计 → Kafka → 仪表盘

例:每 5 分钟统计 PV/UV,实时算出热门商品
\`\`\`

### 6.4 CDC(变更数据捕获)

\`\`\`
MySQL binlog → Debezium → Kafka → 下游(缓存/搜索/数仓)

数据库一行变更 → 自动同步到 Redis / Elasticsearch / Hive
\`\`\`

## 七、实战:用户行为日志收集

### 7.1 架构

\`\`\`
Web 端 ─┐
App 端 ─┼─► Kafka(user-actions) ─┬─► Consumer Group A(实时分析)
小程序 ─┘                         ├─► Consumer Group B(存 HDFS)
                                  └─► Consumer Group C(报警)
\`\`\`

### 7.2 多生产者(Web 服务)

\`\`\`python
# web_service.py(每个服务实例都是生产者)
from kafka import KafkaProducer
import json
import uuid
import time

producer = KafkaProducer(
    bootstrap_servers=["kafka:9092"],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    acks="all",
)

def track_action(user_id: int, action: str, page: str):
    event = {
        "event_id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,         # click / view / scroll
        "page": page,
        "timestamp": int(time.time() * 1000),
    }
    # 按 user_id 分区,保证同用户事件顺序
    producer.send("user-actions", key=user_id, value=event)

# 模拟用户行为
track_action(user_id=1, action="view", page="/home")
track_action(user_id=1, action="click", page="/home")
track_action(user_id=2, action="view", page="/product/100")
\`\`\`

### 7.3 消费者组 A(实时分析)

\`\`\`python
# analytics_consumer.py
from kafka import KafkaConsumer
import json
from collections import defaultdict

consumer = KafkaConsumer(
    "user-actions",
    bootstrap_servers=["kafka:9092"],
    group_id="analytics-group",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
    enable_auto_commit=False,
)

page_views = defaultdict(int)

for message in consumer:
    event = message.value
    if event["action"] == "view":
        page_views[event["page"]] += 1
        print(f"[analytics] {event['page']} 累计访问 {page_views[event['page']]} 次")
    consumer.commit()
\`\`\`

### 7.4 消费者组 B(存档到 HDFS/对象存储)

\`\`\`python
# archive_consumer.py
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    "user-actions",
    bootstrap_servers=["kafka:9092"],
    group_id="archive-group",   # 不同 group,独立消费
    value_deserializer=lambda m: json.decode(m) if False else m,  # 原始字节
    auto_offset_reset="earliest",
    enable_auto_commit=False,
)

batch = []
for message in consumer:
    batch.append(message.value)
    if len(batch) >= 1000:
        # 攒够 1000 条,写入 HDFS/S3
        save_to_hdfs(batch)
        batch = []
    consumer.commit()
\`\`\`

### 7.5 消费者组 C(异常报警)

\`\`\`python
# alert_consumer.py
consumer = KafkaConsumer(
    "user-actions",
    bootstrap_servers=["kafka:9092"],
    group_id="alert-group",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
)

user_action_count = defaultdict(int)

for message in consumer:
    event = message.value
    user_action_count[event["user_id"]] += 1
    # 单用户 1 分钟内操作超过 1000 次 → 可疑
    if user_action_count[event["user_id"]] > 1000:
        send_alert(f"用户 {event['user_id']} 异常高频操作")
    consumer.commit()
\`\`\`

**关键**:三个消费者组各自独立消费所有消息,互不影响。新增消费者组不需要改生产者——这就是 Kafka 的解耦能力。

## 八、Kafka 的高可用

### 8.1 副本机制

\`\`\`
Topic: order-events, partitions=3, replication-factor=3

Broker1: P0(leader), P1(follower), P2(follower)
Broker2: P0(follower), P1(leader), P2(follower)
Broker3: P0(follower), P1(follower), P2(leader)

leader 挂了 → follower 选举为新 leader
\`\`\`

### 8.2 acks 级别

\`\`\`python
producer = KafkaProducer(acks="0")  # 不等确认,最快但可能丢
producer = KafkaProducer(acks="1")  # leader 确认(默认)
producer = KafkaProducer(acks="all")  # 所有副本确认,最安全
\`\`\`

| acks | 含义               | 可靠性 | 性能 |
|------|--------------------|--------|-----------|
| 0    | 不等确认           | 低     | 最高      |
| 1    | leader 确认        | 中     | 高        |
| all  | 所有 ISR 副本确认  | 高     | 中        |

**金融场景用 all,日志场景用 1**。

## 九、Offset 管理

### 9.1 自动提交(简单但可能重复)

\`\`\`python
consumer = KafkaConsumer(
    enable_auto_commit=True,
    auto_commit_interval_ms=5000,  # 每 5s 自动提交
)
\`\`\`

风险:处理完消息但还没提交就挂了,重启后重复消费。

### 9.2 手动提交(推荐)

\`\`\`python
consumer = KafkaConsumer(enable_auto_commit=False)

for message in consumer:
    process(message.value)
    consumer.commit()  # 处理完再提交
\`\`\`

### 9.3 重放消息

\`\`\`python
# 从头开始消费(重新处理所有历史消息)
consumer = KafkaConsumer(
    "user-actions",
    group_id="replay-group",       # 用新 group,无历史 offset
    auto_offset_reset="earliest",
)

# 或 seek 到指定位置
consumer.seek(partition=0, offset=1000)
\`\`\`

## 十、易错点小结

| 易错点                          | 后果                  | 正确做法                            |
|---------------------------------|-----------------------|-------------------------------------|
| 分区数太少                      | 并行度低,吞吐上不去  | 按预期消费者数设分区                |
| 消费者数 > 分区数               | 多余消费者闲置        | 消费者数 ≤ 分区数                   |
| 不设 key                        | 同业务消息乱序        | 按 user_id/order_id 设 key          |
| auto_offset_reset 配错          | 新 group 漏消息       | 用 earliest 从头消费                |
| 自动提交 + 处理慢                | 重复消费              | 手动提交,处理完再 commit           |
| acks=0 用在重要消息             | 丢消息                | 重要消息 acks=all                   |
| 消费者处理失败不处理            | 卡住或丢              | 失败记录到 DLQ,继续消费            |
| 单分区消息过多                  | 该分区成为瓶颈        | 重新分区或换 key 策略               |
| 不限消息大小                    | Broker 拒收           | 限制消息 < 1MB,大消息走对象存储    |
| 副本数 < 2                      | 单点故障              | replication.factor ≥ 3              |
| 消费者组 ID 滥用                | 消费错乱              | 一个用途一个 group_id               |
| 不监控 lag                      | 积压才发现            | 监控 consumer lag                   |

---

## 本讲小结

Kafka 是「日志流之王」。核心要点:

1. **核心模型:Topic → Partition(有序日志)→ Consumer Group(负载均衡)**。
2. **可重放**:消息不因消费删除,可从任意 offset 重新消费。
3. **高吞吐**:顺序写盘 + 零拷贝 + 批量 + 分区并行。
4. **同组 P2P,跨组 Pub/Sub**:用 Consumer Group 灵活组合。
5. **分区数决定并行度上限**:消费者数 ≤ 分区数。

**Kafka 适合大数据场景,RabbitMQ 适合业务消息场景**。
`,
  },
  {
    id: "pyarch-mq-patterns",
    icon: "🎯",
    title: "消息队列应用模式",
    group: "消息队列",
    content: `# 消息队列应用模式

## 一、经典消息模式总结

消息队列在前面的章节里我们零零散散见过很多用法,本章把**经典应用模式**系统总结,让你遇到新场景能快速对号入座。

### 1.1 异步处理

**场景**:下单后要发邮件、发短信、记日志,用户不需要等这些做完。

\`\`\`
❌ 同步:
用户 ──► 下单 ──► 写库 ──► 发邮件 ──► 发短信 ──► 记日志 ──► 返回(2s)

✅ 异步:
用户 ──► 下单 ──► 写库 ──► 发消息 ──► 返回(100ms)
                          ↓
                  邮件/短信/日志服务异步消费
\`\`\`

\`\`\`python
@app.post("/orders")
def create_order(...):
    order = save_order(...)
    # 发消息,不等下游
    producer.send("order.created", value=order)
    return order  # 立即返回
\`\`\`

**收益**:用户响应时间从 2s 降到 100ms。

### 1.2 应用解耦

**场景**:订单服务要通知库存、物流、积分服务。同步调用导致强耦合。

\`\`\`
❌ 同步:
order-service ──调──► stock-service
              ──调──► logistics-service
              ──调──► points-service
新增 service 要改 order-service

✅ 解耦:
order-service ──发消息──► [order.created]
                            ├─► stock-service 消费
                            ├─► logistics-service 消费
                            └─► points-service 消费
新增 service 只需订阅,order-service 不用改
\`\`\`

**收益**:上下游解耦,新增下游零改动。

### 1.3 流量削峰

**场景**:秒杀,瞬时 10w 请求,数据库扛不住。

\`\`\`
10w 请求/秒 ──► [Queue 缓冲] ──► 消费者 1000/秒 ──► 数据库
\`\`\`

\`\`\`python
@app.post("/seckill")
def seckill(user_id, item_id):
    # 不直接下单,先入队
    queue.send("seckill_requests", value={"user_id": user_id, "item_id": item_id})
    return {"status": "排队中"}  # 立即返回

# 消费者按数据库能承受的节奏处理
def seckill_worker():
    while True:
        msg = queue.consume("seckill_requests")
        try_place_order(msg)
\`\`\`

**收益**:数据库压力从 10w/秒 降到 1000/秒,稳定。

### 1.4 广播通知

**场景**:配置中心变更,要通知所有服务实例刷新配置。

\`\`\`
config-service ──发"config.changed"──► [fanout/topic]
                                          ├─► user-service 实例1
                                          ├─► user-service 实例2
                                          └─► post-service 实例1
\`\`\`

\`\`\`python
# 配置中心发布变更
def publish_config_change(key, value):
    producer.send("config.events", value={"key": key, "value": value})

# 各服务订阅
def consume_config():
    for msg in consumer:
        config = msg.value
        refresh_local_config(config["key"], config["value"])
\`\`\`

### 1.5 任务分发(Work Queue)

**场景**:有一批耗时任务,多个 worker 竞争消费。

\`\`\`
Producer ──► [task_queue] ──► Worker 1(处理)
                       ├─► Worker 2(处理)
                       └─► Worker 3(处理)
一个任务只被一个 worker 处理
\`\`\`

见第 6 章 RabbitMQ Work Queue。

### 1.6 日志收集(ELK 中的 K)

**场景**:微服务日志统一收集,送 ES 分析。

\`\`\`
微服务1 ─┐
微服务2 ─┼─► Kafka(logs) ─► Logstash ─► Elasticsearch ─► Kibana
微服务3 ─┘
\`\`\`

Kafka 在中间起**缓冲 + 解耦**作用,Logstash 按自己节奏消费,不会压垮微服务。

### 1.7 事件驱动架构(EDA)

**场景**:系统通过事件协作,而非直接调用。

\`\`\`
order-service ──"order.created"──► [bus]
                                     ├─► stock-service 扣库存
                                     ├─► email-service 发邮件
                                     └─► analytics-service 统计

每个服务响应事件,产生新事件:
stock-service 扣完库存 ──"stock.deducted"──► [bus]
                                              └─► order-service 更新订单状态
\`\`\`

EDA 的核心:**服务不调服务,服务响应事件**。这是微服务最高级的解耦形态。

### 1.8 数据同步

**场景**:数据库变更要同步到缓存、搜索引擎、数仓。

\`\`\`
MySQL ──binlog(CDC)──► Kafka ─┬─► Redis(缓存同步)
                               ├─► Elasticsearch(搜索同步)
                               └─► Hive(数仓同步)
\`\`\`

用 Debezium 监听 MySQL binlog,变更写 Kafka,下游各自消费同步。

### 1.9 八大模式速查表

| 模式        | 典型场景         | 关键词     |
|-------------|------------------|------------|
| 异步处理    | 下单后发邮件     | 快速响应   |
| 应用解耦    | 订单通知多服务   | 零改动扩展 |
| 流量削峰    | 秒杀             | 缓冲       |
| 广播通知    | 配置变更         | 一发多收   |
| 任务分发    | 批量任务         | 竞争消费   |
| 日志收集    | ELK              | 缓冲 + 聚合|
| 事件驱动    | 微服务协作       | 事件总线   |
| 数据同步    | CDC              | binlog     |

## 二、消息队列的常见问题与对策

### 2.1 消息丢失

\`\`\`
生产者 ──①──► Broker ──②──► 消费者

① 生产者 → Broker 丢失:网络丢包
   对策:生产者确认(confirm / acks=all)
② Broker 自身丢失:宕机
   对策:持久化 + 副本
③ Broker → 消费者丢失:消费者处理时挂了
   对策:手动 ack,处理完才确认
\`\`\`

### 2.2 消息重复

\`\`\`
原因:网络抖动导致重发,或消费者 ack 丢失被重投
对策:幂等消费
\`\`\`

**幂等实现:唯一 ID + 去重表**

\`\`\`python
import redis

r = redis.Redis(host="redis")

def idempotent_consume(msg):
    msg_id = msg["id"]
    # SET NX:只在 key 不存在时设置
    if r.set(f"processed:{msg_id}", "1", nx=True, ex=86400):
        # 第一次,执行业务
        process(msg)
    else:
        # 重复消息,跳过
        log("duplicate message, skip")
\`\`\`

**幂等实现:数据库唯一约束**

\`\`\`python
def process_payment(msg):
    try:
        db.execute(
            "INSERT INTO payments (id, order_id, amount) VALUES (?, ?, ?)",
            (msg["id"], msg["order_id"], msg["amount"])
        )
    except DuplicateKeyError:
        log("duplicate, skip")
\`\`\`

### 2.3 消息顺序

\`\`\`
多消费者并发 → 顺序乱

对策:单分区/单队列串行消费(牺牲并发换顺序)
\`\`\`

\`\`\`python
# Kafka:按业务 key 分区,同 key 进同分区,单消费者消费保序
producer.send("orders", key=str(order_id), value=event)
\`\`\`

### 2.4 消息积压

\`\`\`
原因:生产 > 消费
对策:
1. 扩消费者数量(前提:分区数足够)
2. 批量消费(一次取多条)
3. 优化消费逻辑(减少 IO、异步化)
4. 紧急扩容:新 topic + 多倍消费者
\`\`\`

### 2.5 消息过期

\`\`\`
原因:消息有 TTL,积压时大量消息过期
对策:监控积压 + 合理设 TTL + DLQ 兜底
\`\`\`

### 2.6 问题对策速查表

| 问题     | 原因             | 对策                          |
|----------|------------------|-------------------------------|
| 丢失     | 三段都可能       | 确认 + 持久化 + 手动 ack      |
| 重复     | 网络重发         | 幂等消费(唯一 ID + 去重)   |
| 顺序乱   | 并发消费         | 单分区串行                    |
| 积压     | 生产 > 消费      | 扩消费者 + 批量 + 优化逻辑    |
| 过期     | TTL + 积压       | 监控 + 合理 TTL + DLQ         |

## 三、幂等性设计

### 3.1 为什么幂等这么重要

分布式系统中,**消息至少投递一次**(at-least-once)是常态,意味着消费者**一定会收到重复消息**。如果不做幂等,重复消费会导致:

- 重复扣款
- 重复发货
- 重复发邮件

### 3.2 幂等的三种实现

#### 方案 1:唯一 ID + Redis 去重

\`\`\`python
import redis
import json

r = redis.Redis()

def consume(msg):
    msg_id = msg["id"]
    # 用 SET NX 原子操作去重
    if r.set(f"msg:{msg_id}", "1", nx=True, ex=86400):
        process(msg)
        ack()
    else:
        # 重复,直接 ack 丢弃
        ack()
\`\`\`

#### 方案 2:数据库唯一约束

\`\`\`python
def process_order(msg):
    # 用消息 ID 作为订单操作日志主键,重复插入会报错
    try:
        db.execute(
            "INSERT INTO order_operations (id, order_id, op_type) VALUES (?, ?, ?)",
            (msg["id"], msg["order_id"], msg["op_type"])
        )
    except UniqueViolation:
        return  # 重复,跳过
\`\`\`

#### 方案 3:状态机检查

\`\`\`python
def process_payment(msg):
    order = db.get_order(msg["order_id"])
    # 只有"待支付"状态才能扣款,已支付的不会重复扣
    if order.status == "pending_payment":
        charge(order)
        order.status = "paid"
        order.save()
\`\`\`

### 3.3 幂等设计原则

1. **每条消息有全局唯一 ID**
2. **业务操作前检查是否已处理**
3. **用数据库事务保证「检查 + 处理」原子**
4. **去重记录设合理 TTL**(避免无限增长)

## 四、Python 综合实战:电商订单全流程

### 4.1 业务场景

用户下单后,系统要:
1. 扣库存
2. 扣款
3. 发邮件
4. 加积分
5. 记日志
6. 通知物流

用消息队列把所有环节解耦。

### 4.2 架构

\`\`\`
order-service ──"order.created"──► [topic exchange / Kafka topic]
                                       ├─► stock-queue ──► stock-service
                                       ├─► payment-queue ──► payment-service
                                       ├─► email-queue ──► email-service
                                       ├─► points-queue ──► points-service
                                       ├─► log-queue ──► log-service
                                       └─► ship-queue ──► ship-service

每个服务消费完产生新事件:
stock-service ──"stock.deducted"──► [bus] ──► order-service(更新状态)
payment-service ──"payment.success"──► [bus] ──► order-service
\`\`\`

### 4.3 完整代码框架(FastAPI + RabbitMQ)

#### order-service(生产者 + 事件消费者)

\`\`\`python
# order_service.py
import pika, json, uuid
from fastapi import FastAPI

app = FastAPI()

conn = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
ch = conn.channel()
ch.exchange_declare("order_events", exchange_type="topic")

@app.post("/orders")
def create_order(user_id: int, item_id: int, amount: float):
    order_id = str(uuid.uuid4())
    event = {
        "id": str(uuid.uuid4()),
        "type": "order.created",
        "payload": {"order_id": order_id, "user_id": user_id,
                    "item_id": item_id, "amount": amount},
    }
    ch.basic_publish(
        exchange="order_events",
        routing_key="order.created",
        body=json.dumps(event),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    return {"order_id": order_id, "status": "pending"}

# 消费下游事件,更新订单状态
def on_event(ch, method, props, body):
    event = json.loads(body)
    if event["type"] == "stock.deducted":
        update_order_status(event["payload"]["order_id"], "stock_ok")
    elif event["type"] == "payment.success":
        update_order_status(event["payload"]["order_id"], "paid")
    elif event["type"] == "payment.failed":
        update_order_status(event["payload"]["order_id"], "cancelled")
    ch.basic_ack(method.delivery_tag)

ch.queue_declare("order_status_queue", durable=True)
ch.queue_bind("order_status_queue", "order_events", routing_key="stock.*")
ch.queue_bind("order_status_queue", "order_events", routing_key="payment.*")
\`\`\`

#### stock-service(幂等消费)

\`\`\`python
# stock_service.py
import pika, json, redis

r = redis.Redis(host="redis")

def callback(ch, method, props, body):
    event = json.loads(body)
    msg_id = event["id"]

    # 幂等:用 Redis 去重
    if not r.set(f"msg:{msg_id}", "1", nx=True, ex=86400):
        ch.basic_ack(method.delivery_tag)
        return  # 重复,跳过

    try:
        order = event["payload"]
        deduct_stock(order["item_id"])

        # 发"扣库存成功"事件
        ch.basic_publish(
            exchange="order_events",
            routing_key="stock.deducted",
            body=json.dumps({
                "id": str(uuid.uuid4()),
                "type": "stock.deducted",
                "payload": {"order_id": order["order_id"]},
            }),
        )
        ch.basic_ack(method.delivery_tag)
    except OutOfStock:
        # 发"扣库存失败"事件
        ch.basic_publish(
            exchange="order_events",
            routing_key="stock.failed",
            body=json.dumps({...}),
        )
        ch.basic_ack(method.delivery_tag)
\`\`\`

#### payment-service / email-service / points-service

结构类似,各自订阅 \`order.created\`,处理完发自己的事件。

### 4.4 异常处理

\`\`\`
扣库存失败:
  stock-service 发 "stock.failed"
  order-service 收到 → 订单状态改为 "cancelled"
  email-service 收到 → 发"下单失败"邮件

扣款失败:
  payment-service 发 "payment.failed"
  order-service 收到 → 订单取消
  stock-service 收到 → 回滚库存(补偿)
\`\`\`

这就是 **Saga 模式** 的事件驱动版本:每个服务消费事件,产生新事件,失败时产生补偿事件。

### 4.5 监控

\`\`\`
监控指标:
- 各队列消息积压数(queue depth)
- 消费者处理延迟(p99)
- 消费失败率
- DLQ 消息数

工具:Prometheus + Grafana,RabbitMQ 自带 Management UI
\`\`\`

## 五、本书总结:从 SOLID 到微服务的设计思想回顾

### 5.1 设计思想的演进

\`\`\`
SOLID(单一职责、开闭、里氏替换、接口隔离、依赖倒置)
  ↓ 应用到
设计模式(创建型、结构型、行为型 23 种)
  ↓ 组织成
架构模式(分层、MVC、DDD、六边形)
  ↓ 扩展到
分布式架构(微服务、消息队列、事件驱动)
\`\`\`

### 5.2 核心思想一脉相承

| 思想       | 在代码层               | 在架构层                  |
|------------|------------------------|---------------------------|
| 单一职责   | 一个类一个职责(SRP)  | 一个服务一个业务能力      |
| 开闭原则   | 扩展开放,修改关闭     | 新增服务不改老服务(解耦)|
| 依赖倒置   | 依赖抽象不依赖具体     | 依赖契约(API/MQ)不依赖实现|
| 接口隔离   | 接口小而专             | 服务接口小而专            |
| 里氏替换   | 子类能替父类           | 服务实例可替换(多实例)  |

### 5.3 解耦是永恒主题

\`\`\`
代码层:高内聚低耦合 → 模块清晰
架构层:服务解耦 → 独立部署、独立演进
通信层:消息队列解耦 → 生产者消费者互不感知
\`\`\`

### 5.4 复杂度守恒

\`\`\`
没有银弹。复杂度不会消失,只会转移:
- 单体复杂度在代码
- 微服务复杂度在网络
- 消息队列复杂度在最终一致性

选哪个,取决于你能承受哪种复杂度。
\`\`\`

### 5.5 给读者的建议

1. **先把单体写好**:不會写单体的人,微服务只会更糟。
2. **理解为什么再学怎么做**:知其然更要知其所以然。
3. **从经典模式学起**:23 种设计模式是基本功。
4. **架构服务于业务**:别为架构而架构。
5. **保持学习**:技术一直在演进,设计思想相对稳定。

## 六、易错点小结

| 易错点                          | 后果                  | 正确做法                            |
|---------------------------------|-----------------------|-------------------------------------|
| 用消息队列做所有事              | 滥用,简单问题复杂化  | 需要立即结果用 RPC,异步用 MQ       |
| 不做幂等                        | 重复扣款/发货         | 唯一 ID + 去重                      |
| 消费失败直接丢                  | 数据丢失              | DLQ + 告警                          |
| 同步调用链太长不改异步          | 延迟高,可用性差      | 用 MQ 解耦                          |
| 一个 topic/queue 装所有消息     | 难管理,难路由        | 按业务域分 topic                    |
| 消息体太大                      | Broker 内存爆         | 大消息走对象存储,MQ 放引用         |
| 不监控积压                      | 问题暴露晚            | 监控 queue depth + 报警             |
| 事件驱动滥用                    | 调试噩梦              | 关键链路用同步,辅助用异步          |
| Saga 补偿失败不处理             | 数据不一致            | 补偿也要重试 + DLQ + 人工           |
| 不区分命令和事件                | 概念混乱              | 命令是请求,事件是已发生的事实      |

---

## 本讲小结 & 全书结语

本章是消息队列部分的总结,也是全书的最后一章。

**消息队列的核心价值**:解耦、异步、削峰、可靠。

**八大应用模式**:异步处理、应用解耦、流量削峰、广播通知、任务分发、日志收集、事件驱动、数据同步。

**四大常见问题**:丢失(三段保证)、重复(幂等)、顺序(单分区)、积压(扩消费者)。

**设计思想的升华**:
- 代码层:SOLID + 设计模式 → 写出可维护的代码
- 架构层:分层 + DDD → 划清服务边界
- 分布式层:微服务 + 消息队列 → 实现可扩展的系统

复杂度守恒,没有银弹。**理解设计思想,比记住框架 API 重要 100 倍**。

感谢你读完这本《Python 设计思想与架构实战教程》。希望这些思想能伴随你的整个工程生涯。
`,
  },
];