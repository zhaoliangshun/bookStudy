// =============================================================
// Python 设计思想与架构教程 - 第 7 批章节(RESTful API 设计)
// =============================================================

export const chapters = [
  {
    id: "pyarch-rest-intro",
    icon: "🌐",
    title: "RESTful API 基础",
    group: "RESTful API 设计",
    content: `# RESTful API 基础

## 一、什么是 REST

REST 的全称是 **Representational State Transfer**(表征性状态转移),由 Roy Fielding 在 2000 年的博士论文《Architectural Styles and the Design of Network-based Software Architectures》中首次提出。Roy Fielding 是 HTTP 1.0 和 HTTP 1.1 规范的主要作者之一,REST 本质上是对「Web 本身应该如何设计」的一次系统性总结。

要真正理解 REST,先要摆脱「REST = 用 HTTP 调接口」这种粗浅印象。REST 是一种**架构风格**(Architectural Style),而不是协议、不是标准、更不是框架。它是一组约束条件,任何满足这些约束的分布式系统都可以被称为 RESTful。

用一句话概括:

> REST 是一种基于资源、通过表征进行状态转移、统一接口、无状态的分布式系统架构风格。

### 1.1 三个核心关键词

- **资源(Resource)**:系统中一切值得被命名、被操作的事物都是资源。一个用户、一篇文章、一张图片、一次订单,都是资源。
- **表征(Representation)**:资源在某一时刻的状态,以一种具体的格式(JSON、XML、HTML)呈现给客户端。客户端操作的不是资源本身,而是资源的表征。
- **状态转移(State Transfer)**:客户端通过操作资源的表征,使资源的状态发生变化,这就是「状态转移」。

这三者构成了 REST 字面意义上的全部含义:**用表征(Representation)来触发资源的状态转移(State Transfer)**。

### 1.2 REST 不是什么

很多初学者对 REST 有误解,下面这些「REST 不是」很重要:

- REST 不是「URL 用名词 + HTTP 动词」这种表面规则,这只是统一接口约束的副产品
- REST 不是「返回 JSON」的 API,返回 XML 也可以是 RESTful
- REST 不是「CRUD 接口」,CRUD 只是 HTTP 方法对资源操作的常见映射
- REST 不是协议,没有 RFC 规定你必须怎么做
- REST 不等于 HTTP,但 HTTP 是目前实现 REST 最主流的协议

理解这一点,你才能跳出「形式 REST」的陷阱,真正按约束去思考。

## 二、REST 的六大约束

REST 由六个架构约束组成。满足这六个约束(其中一个是可选的),才能称为 RESTful。

### 2.1 客户端-服务器分离(Client-Server Separation)

**约束内容**:客户端和服务器在职责上严格分离。客户端负责用户界面和交互状态,服务器负责数据存储和业务逻辑,二者通过统一接口通信。

**为什么这样设计**:

- 客户端和服务器可以独立演化、独立部署
- 客户端不关心数据怎么存,服务器不关心数据怎么显示
- 多个客户端(Web、iOS、Android、CLI)可以共用同一套服务器

**反面例子**:早期 JSP/ASP 直接在服务端渲染 HTML,客户端逻辑和服务器逻辑深度耦合,前端要改一个按钮颜色都要重新部署后端。这就是违反了客户端-服务器分离。

### 2.2 无状态(Stateless)

**约束内容**:服务器不保存客户端的会话状态。客户端的每一次请求都必须包含服务器处理该请求所需的**全部信息**(认证 token、参数、上下文)。服务器处理任何请求都是独立的。

**为什么这样设计**:

- **可扩展性**:任何一台服务器都能处理任何请求,负载均衡不需要 sticky session
- **可靠性**:某台服务器宕机,其他服务器立刻接手,无需迁移会话
- **可见性**:请求自包含,日志和调试更简单

**反面例子**:传统 Session 模式,服务器内存里存 \`session_id → 用户对象\`,客户端只发一个 cookie。如果用户被路由到另一台服务器,session 就丢了。这就是有状态。

**注意**:无状态不等于「不能有数据存储」。数据库里的数据是资源的状态,不是会话状态。无状态约束针对的是「会话状态」,不是「资源状态」。

### 2.3 可缓存(Cacheable)

**约束内容**:响应必须明确标识自己是否可缓存、缓存多久。客户端可以复用缓存,减少服务器压力和网络延迟。

**为什么这样设计**:

- 减少网络往返,降低延迟
- 减少服务器负载
- 提升用户体验

**实现方式**:通过 HTTP 头如 \`Cache-Control\`、\`ETag\`、\`Last-Modified\`、\`Expires\` 来控制。

\`\`\`http
HTTP/1.1 200 OK
Cache-Control: max-age=3600
ETag: "abc123"
Content-Type: application/json

{"id": 42, "name": "Alice"}
\`\`\`

**反面例子**:API 响应不带任何缓存头,客户端不知道能不能缓存,只能每次都重新请求。

### 2.4 统一接口(Uniform Interface)

**约束内容**:所有资源都通过统一的接口访问,接口由四个子约束组成:

1. **资源标识(Identification of Resources)**:每个资源有唯一的 URI,如 \`/users/42\`
2. **通过表征操作资源(Manipulation of Resources through Representations)**:客户端通过操作资源的表征(JSON/XML)来修改资源,服务器收到表征后执行实际操作
3. **自描述消息(Self-descriptive Messages)**:每个消息必须包含足够信息让接收方理解如何处理(如 \`Content-Type: application/json\`)
4. **超媒体作为应用状态引擎(HATEOAS)**:响应中包含指向下一步操作的链接,客户端不需要硬编码 URL

**为什么这样设计**:

- 接口统一,降低学习成本
- 客户端和服务器解耦,各自演化
- 中间件(代理、网关)能理解消息,做缓存、路由、转换

**这是 REST 最核心的约束,也是最容易违反的约束**。大多数自称 RESTful 的 API 实际上只满足了前三个子约束,违反了 HATEOAS。

### 2.5 分层系统(Layered System)

**约束内容**:客户端无法、也不需要知道它是直接连到服务器,还是经过了代理、网关、负载均衡、CDN。每一层只和相邻层交互。

**为什么这样设计**:

- 中间层可以做负载均衡、缓存、安全过滤、协议转换
- 每一层独立扩展和替换
- 整体架构更灵活

**例子**:客户端访问 \`api.example.com\`,实际上请求经过了 CDN → 负载均衡 → API 网关 → 应用服务器 → 数据库。客户端只看到 \`api.example.com\`。

### 2.6 按需代码(Code on Demand,可选)

**约束内容**:服务器可以临时向客户端发送可执行代码(如 JavaScript),客户端执行这些代码扩展自己的能力。

**为什么是可选的**:这是 REST 唯一可选的约束。大多数 RESTful API 不使用它。Web 浏览器执行服务器下发的 JavaScript 是这个约束的典型实现。

### 2.7 六大约束速查表

| 约束 | 是否必选 | 核心思想 | 违反后果 |
|------|---------|---------|---------|
| 客户端-服务器分离 | 必选 | 职责解耦 | 难以多端复用 |
| 无状态 | 必选 | 请求自包含 | 难以水平扩展 |
| 可缓存 | 必选 | 减少重复请求 | 性能差、服务器压力大 |
| 统一接口 | 必选 | 接口一致 | 客户端服务器强耦合 |
| 分层系统 | 必选 | 隐藏架构层次 | 中间件无法介入 |
| 按需代码 | 可选 | 服务器下发代码 | (无影响) |

## 三、REST vs RPC vs SOAP vs GraphQL

Web API 设计领域有四大主流风格:REST、RPC、SOAP、GraphQL。理解它们的差异,你才能在合适场景选择合适的方案。

### 3.1 四者核心特征对比

| 维度 | REST | RPC | SOAP | GraphQL |
|------|------|-----|------|---------|
| 核心思想 | 资源 + 表征 | 调用远程过程 | XML 消息协议 | 图查询语言 |
| 接口风格 | 名词 URI + HTTP 方法 | 动词 URI(\`/getUser\`) | WSDL 描述 + XML | 单一端点 + 查询语句 |
| 数据格式 | JSON/XML/任意 | JSON/Protobuf/任意 | XML | JSON |
| 状态 | 无状态 | 通常无状态 | 可有状态 | 无状态 |
| 学习曲线 | 中 | 低 | 高 | 中高 |
| 性能 | 中 | 高(二进制) | 低(XML 解析慢) | 中 |
| 适用场景 | 公开 API、资源型业务 | 内部微服务、性能敏感 | 企业级、金融、强契约 | 复杂前端、聚合数据 |
| 典型代表 | GitHub API、Stripe | gRPC、Apache Thrift | 银行接口、传统企业 | Facebook、GitHub v4 |

### 3.2 直观对比:同一需求四种写法

需求:获取 id=42 的用户信息。

**REST 风格**:

\`\`\`http
GET /users/42 HTTP/1.1
Accept: application/json
\`\`\`

**RPC 风格**:

\`\`\`http
POST /getUser HTTP/1.1
Content-Type: application/json

{"id": 42}
\`\`\`

**SOAP 风格**:

\`\`\`xml
POST /UserService HTTP/1.1
Content-Type: text/xml

<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUser xmlns="http://example.com/user">
      <id>42</id>
    </getUser>
  </soap:Body>
</soap:Envelope>
\`\`\`

**GraphQL 风格**:

\`\`\`http
POST /graphql HTTP/1.1
Content-Type: application/json

{"query": "{ user(id: 42) { id name email } }"}
\`\`\`

### 3.3 何时选 REST

- 公开 API,需要被大量第三方调用
- 业务以「资源」为核心(CRUD 居多)
- 需要 HTTP 缓存、CDN 加速
- 团队对 HTTP 协议本身比较熟悉
- 不想引入 GraphQL/Protobuf 等额外技术栈

### 3.4 何时选其他

- **RPC**:内部微服务之间调用,性能敏感,字段稳定。gRPC + Protobuf 是现代主流。
- **SOAP**:强契约、强类型、事务性、企业级集成(如银行)。现代新项目很少选 SOAP。
- **GraphQL**:前端需要灵活字段选择、聚合多个数据源、移动端想减少请求数。

## 四、资源(Resource)的概念

REST 的核心是资源。理解资源,是理解 REST 的前提。

### 4.1 一切皆资源

在 REST 的世界里,**一切值得被命名的事物都是资源**:

- 实体:用户、文章、订单、商品
- 集合:用户列表、文章列表
- 子资源:用户的订单、文章的评论
- 操作:发邮件、生成报表(可以建模为资源,如 \`/email-sends\`)
- 文件:图片、PDF

### 4.2 资源用名词表示

资源用**名词**命名,而不是动词。因为资源是「事物」,不是「动作」。

**好的资源命名**:

- \`/users\`(用户集合)
- \`/users/42\`(具体用户)
- \`/orders/1001/items\`(订单 1001 的商品项集合)

**坏的资源命名**:

- \`/getUsers\`(动词)
- \`/createOrder\`(动词)
- \`/deleteUser?id=42\`(动词 + 查询参数)

### 4.3 资源标识

每个资源必须有**唯一标识**,通常是 URI 中的 id 部分:

- \`/users/42\` — 42 是用户 id
- \`/articles/abc-def-123\` — abc-def-123 是文章 slug
- \`/orgs/acme/repos/api\` — 多层级标识

资源标识应该是**稳定的**,不应该因为资源内部状态变化而变化。

### 4.4 资源 vs 数据库表

资源≠数据库表。资源是**业务概念**,表是**存储结构**。一个资源可能映射多张表,一张表也可能映射多个资源。

例如 \`/users/42/profile\` 和 \`/users/42/settings\` 都来自 \`users\` 表,但语义上是两个不同的资源。

## 五、表征(Representation)

### 5.1 什么是表征

资源本身是一个抽象概念(如「id 为 42 的用户」),客户端无法直接操作抽象概念。服务器把资源的状态用某种格式(JSON、XML、HTML)序列化后发给客户端,这个序列化后的数据就叫**表征**。

\`\`\`json
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com"
}
\`\`\`

这就是「id 为 42 的用户」资源的一个 JSON 表征。

### 5.2 同一资源多种表征

同一资源可以有多种表征:

- \`application/json\` — 程序处理
- \`text/html\` — 浏览器渲染
- \`application/xml\` — 老系统对接
- \`image/png\` — 用户头像(如果资源是图片)

### 5.3 内容协商(Content Negotiation)

客户端通过 \`Accept\` 头告诉服务器想要哪种格式,服务器根据 \`Accept\` 返回对应表征。这就是**内容协商**。

\`\`\`http
GET /users/42 HTTP/1.1
Accept: application/xml
\`\`\`

服务器响应:

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/xml

<user>
  <id>42</id>
  <name>Alice</name>
</user>
\`\`\`

现代 API 主要用 JSON,但内容协商机制让 API 可以同时支持多种格式,客户端按需选择。

## 六、状态转移(State Transfer)

### 6.1 状态转移的本质

「状态转移」听起来抽象,其实就是:客户端通过 HTTP 方法对资源表征进行操作,导致资源状态发生变化。

举例:

- \`GET /users/42\` — 获取当前状态(不转移)
- \`POST /users\` — 创建新资源(从无到有,状态转移)
- \`PUT /users/42\` — 完整替换(状态转移)
- \`PATCH /users/42\` — 部分更新(状态转移)
- \`DELETE /users/42\` — 删除(状态转移)

### 6.2 应用状态 vs 资源状态

REST 区分两种状态:

- **资源状态**:资源本身的数据(用户名、邮箱)。存在服务器数据库里。
- **应用状态**:客户端当前处于哪个页面、登录与否、浏览到哪一步。存在客户端。

REST 约束:**应用状态由客户端管理,资源状态由服务器管理**。客户端每次请求带上必要信息(如 token),服务器不存应用状态。

这就是「无状态」约束的本质:服务器不存应用状态,但可以存资源状态。

## 七、Richardson 成熟度模型

Leonard Richardson 提出了一个衡量 API 「RESTful 程度」的模型,分四级:

### 7.1 Level 0:HTTP 协议(POX)

只用 HTTP 作传输,所有操作都通过 POST 到单一端点,本质是 RPC over HTTP。

\`\`\`http
POST /api HTTP/1.1

{"method": "getUser", "params": {"id": 42}}
\`\`\`

### 7.2 Level 1:资源

引入资源概念,不同资源用不同 URI,但只用 POST。

\`\`\`http
POST /users/42 HTTP/1.1

{"action": "get"}
\`\`\`

### 7.3 Level 2:HTTP 方法 + 状态码

正确使用 HTTP 方法(GET/POST/PUT/PATCH/DELETE)和状态码(200/201/204/4xx/5xx)。**绝大多数自称 RESTful 的 API 停在这一级**。

\`\`\`http
GET /users/42 HTTP/1.1

HTTP/1.1 200 OK
\`\`\`

### 7.4 Level 3:HATEOAS

响应中包含超媒体链接,客户端通过链接发现下一步操作。这是 REST 的最终形态。

\`\`\`json
{
  "id": 42,
  "name": "Alice",
  "_links": {
    "self": {"href": "/users/42"},
    "orders": {"href": "/users/42/orders"},
    "edit": {"href": "/users/42", "method": "PUT"}
  }
}
\`\`\`

### 7.5 成熟度模型速查表

| 级别 | 特征 | 是否真 RESTful |
|------|------|---------------|
| Level 0 | 单端点 + POST | 否(RPC) |
| Level 1 | 资源 URI | 否 |
| Level 2 | 正确 HTTP 方法 + 状态码 | 实用 RESTful |
| Level 3 | HATEOAS 超媒体 | 严格 RESTful |

> **实践建议**:Level 2 是性价比最高的目标。Level 3 在内部 API、强契约场景下价值有限,在开放 API、长期演化场景下才真正发挥价值。

## 八、Python 实战:FastAPI 第一个 RESTful API

### 8.1 安装 FastAPI

\`\`\`bash
pip install fastapi uvicorn[standard]
\`\`\`

### 8.2 Hello World

\`\`\`python
# main.py
from fastapi import FastAPI

app = FastAPI(title="My RESTful API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Hello, RESTful World"}
\`\`\`

启动:

\`\`\`bash
uvicorn main:app --reload --port 8000
\`\`\`

访问 \`http://localhost:8000\`,返回:

\`\`\`json
{"message": "Hello, RESTful World"}
\`\`\`

### 8.3 资源 CRUD 雏形

下面是一个「文章」资源的完整 CRUD 雏形,展示了 RESTful 的基本形态:

\`\`\`python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Article(BaseModel):
    id: int
    title: str
    content: str

# 内存存储(演示用,真实场景用数据库)
articles: dict[int, Article] = {}
next_id = 1

@app.get("/articles", response_model=List[Article])
def list_articles():
    """获取文章列表 — GET 集合"""
    return list(articles.values())

@app.get("/articles/{article_id}", response_model=Article)
def get_article(article_id: int):
    """获取单篇文章 — GET 单资源"""
    if article_id not in articles:
        raise HTTPException(status_code=404, detail="Article not found")
    return articles[article_id]

@app.post("/articles", response_model=Article, status_code=status.HTTP_201_CREATED)
def create_article(article: Article):
    """创建文章 — POST 集合,返回 201"""
    global next_id
    article.id = next_id
    next_id += 1
    articles[article.id] = article
    return article

@app.put("/articles/{article_id}", response_model=Article)
def replace_article(article_id: int, article: Article):
    """完整替换 — PUT 单资源"""
    if article_id not in articles:
        raise HTTPException(status_code=404, detail="Article not found")
    article.id = article_id
    articles[article_id] = article
    return article

@app.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int):
    """删除 — DELETE 单资源,返回 204 无内容"""
    if article_id not in articles:
        raise HTTPException(status_code=404, detail="Article not found")
    del articles[article_id]
    return None
\`\`\`

### 8.4 验证 API

\`\`\`bash
# 创建
curl -X POST http://localhost:8000/articles \\
  -H "Content-Type: application/json" \\
  -d '{"id": 0, "title": "First", "content": "Hello"}'

# 列表
curl http://localhost:8000/articles

# 单个
curl http://localhost:8000/articles/1

# 替换
curl -X PUT http://localhost:8000/articles/1 \\
  -H "Content-Type: application/json" \\
  -d '{"id": 1, "title": "Updated", "content": "New content"}'

# 删除
curl -X DELETE http://localhost:8000/articles/1
\`\`\`

### 8.5 FastAPI 自动文档

FastAPI 自带 OpenAPI 文档,访问:

- \`http://localhost:8000/docs\` — Swagger UI
- \`http://localhost:8000/redoc\` — ReDoc

这是 FastAPI 相比 Flask 的巨大优势:**类型注解 → 自动文档**,极大降低 API 维护成本。

## 九、RESTful 的「形」与「神」

### 9.1 形式 RESTful vs 真正 RESTful

很多 API 表面上「URL 用名词、用 HTTP 方法、返回 JSON」,但实际上是 RPC over HTTP:

- 没有正确使用状态码(出错返回 200 + \`{"error": true}\`)
- 没有缓存头
- 没有内容协商
- 没有 HATEOAS
- 一个端点干多件事(\`POST /users?action=delete\`)

这就是**形式 RESTful**:看起来像 REST,本质还是 RPC。

### 9.2 务实建议

不要为了 REST 而 REST。在工程实践中:

- Level 2 是务实目标
- 内部 API 偏 RPC 风格(gRPC)更高效
- 开放 API 偏 REST 风格更通用
- HATEOAS 视场景选择,不强求

REST 是工具,不是目的。目的是**让 API 简洁、可演化、可缓存、可扩展**。

## 十、易错点小结

| 易错点 | 错误示例 | 正确做法 | 影响 |
|--------|---------|---------|------|
| 把 REST 等同于「返回 JSON」 | 返回 JSON 但 URL 全是动词 | 理解六大约束,统一接口是核心 | 误判 API 风格 |
| 资源用动词 | \`/getUserList\` | \`/users\`(名词复数) | 违反统一接口 |
| 一个端点干多件事 | \`POST /users?action=delete\` | \`DELETE /users/42\` | 违反 HTTP 语义 |
| 错误返回 200 | 出错返回 \`200 {"error": true}\` | 返回对应 4xx/5xx | 客户端误判 |
| 无状态被误解 | 认为 REST 不能用数据库 | 数据库是资源状态,允许 | 设计偏差 |
| 把 HATEOAS 当必须 | 强行加 \`_links\` | Level 2 也算实用 RESTful | 过度设计 |
| 忽略缓存头 | 不设 \`Cache-Control\` | 显式声明可缓存性 | 性能差 |
| 资源等于表 | 一个 API 对应一张表 | 资源是业务概念 | API 耦合存储 |
| 把应用状态放服务器 | session 存登录态 | token 由客户端持有 | 难以水平扩展 |
| Level 越高越好 | 强上 Level 3 | Level 2 务实,Level 3 看场景 | 增加无谓复杂度 |

## 十一、本章小结

这一章我们建立了对 REST 的整体认知:

- REST 是架构风格,不是协议,由六大约束定义
- 资源、表征、状态转移是三个核心概念
- Richardson 成熟度模型衡量 RESTful 程度
- FastAPI 是 Python 实现 RESTful API 的现代首选
- 实践中 Level 2 是性价比最高的目标

下一章我们会深入 URI 与资源设计,讲清楚「好 URL 长什么样」「路径参数 vs 查询参数怎么分」「分页/过滤/排序怎么设计」。
`,
  },
  {
    id: "pyarch-rest-uri",
    icon: "🔗",
    title: "URI 与资源设计",
    group: "RESTful API 设计",
    content: `# URI 与资源设计

## 一、URI 设计总原则

URI 是资源的「身份证」。一个好的 URI 应该让人一眼看出「这是什么资源」,而不用看文档。RESTful API 的 URI 设计有四条总原则:

1. **用名词,不用动词** — URI 标识资源,动作由 HTTP 方法表达
2. **用复数,不用单数** — 集合用复数,统一惯例
3. **用层级表达关系** — \`/users/42/orders\` 表达「用户 42 的订单」
4. **可预测、稳定** — URI 一旦发布就不要随意变更

URI 是契约,改动 URI 就是破坏契约。所以 URI 设计要在第一版就想清楚。

## 二、好的 URI vs 坏的 URI

### 2.1 对比表

| 场景 | 坏的 URI | 好的 URI | 原因 |
|------|---------|---------|------|
| 获取用户列表 | \`/getUsers\` | \`GET /users\` | 动词由方法表达 |
| 获取单个用户 | \`/user?id=42\` | \`GET /users/42\` | 资源用路径标识 |
| 创建订单 | \`/createOrder\` | \`POST /orders\` | 名词 + 方法 |
| 删除文章 | \`/deleteArticle/5\` | \`DELETE /articles/5\` | 动词由方法表达 |
| 用户订单 | \`/orders?user_id=42\` | \`/users/42/orders\` | 层级表达关系 |
| 登录 | \`/login\` | \`POST /sessions\` 或 \`POST /auth/login\` | 登录建模为创建会话 |
| 搜索 | \`/search?q=foo\` | \`GET /articles?q=foo\` | 搜索是筛选资源 |
| 上传文件 | \`/uploadFile\` | \`POST /files\` | 文件是资源 |

### 2.2 为什么不用动词

URI 标识的是**资源**(事物),不是**动作**。动词应该由 HTTP 方法表达:

- \`GET /users/42\` 而不是 \`/getUser/42\`
- \`DELETE /users/42\` 而不是 \`/deleteUser/42\`

如果 URI 里出现动词,通常说明你在用 RPC 风格,不是 REST。

### 2.3 例外:动作型资源

某些操作很难用 CRUD 建模,比如「重置密码」「发送邮件」「审批」。这时可以引入**动作型资源**(action-style resource),作为对 REST 的实用妥协:

- \`POST /users/42/password-resets\`(创建一次密码重置)
- \`POST /email-sends\`(创建一次邮件发送)
- \`POST /orders/1001/cancellations\`(创建一次取消)

核心思路:**把「动作」建模为「创建一个事件资源」**。这样仍然符合「用名词」的原则。

## 三、路径参数 vs 查询参数

### 3.1 区分原则

| 类型 | 作用 | 示例 | 何时使用 |
|------|------|------|---------|
| 路径参数 | 标识具体资源 | \`/users/42\` | 定位「哪一个」 |
| 查询参数 | 筛选/排序/分页/字段 | \`/users?role=admin\` | 描述「什么样的」 |

**口诀**:**路径定位,查询筛选**。

### 3.2 路径参数详解

路径参数用于定位**唯一资源**或**子资源**:

\`\`\`
/users/42            → id 为 42 的用户
/users/42/orders     → 用户 42 的订单集合
/users/42/orders/1001 → 用户 42 的订单 1001
\`\`\`

路径参数通常是 id,也可以是 slug、UUID、自然键:

\`\`\`
/articles/how-to-design-rest
/orgs/acme/repos/api
\`\`\`

### 3.3 查询参数详解

查询参数用于**对集合做筛选、排序、分页、字段选择**:

\`\`\`
/users?role=admin              → 筛选
/users?sort=-created_at        → 排序(- 表示降序)
/users?page=2&limit=20         → 分页
/users?fields=id,name,email    → 字段选择
\`\`\`

### 3.4 不要用查询参数定位资源

**反例**:

\`\`\`
GET /users?id=42          ❌ 应该用 /users/42
GET /orders?order_id=1001 ❌ 应该用 /orders/1001
\`\`\`

查询参数定位资源的坏处:

- 路径失去层级语义,缓存命中差
- URI 不唯一,同一资源多种写法
- 与 REST「资源有唯一 URI」原则冲突

## 四、子资源表达关系

### 4.1 层级 URI

REST 用**层级 URI**表达资源之间的关系:

\`\`\`
/users/42/orders           → 用户 42 的订单集合
/users/42/orders/1001      → 用户 42 的订单 1001
/orgs/acme/repos/api/issues → acme 组织 api 仓库的 issues
\`\`\`

层级 URI 的语义是「属于」「包含」。读起来像「用户的订单」「订单的商品」。

### 4.2 嵌套层级控制

层级**不要超过 2 层**。否则:

- URI 冗长难记
- 难以缓存(层级深,变化多)
- 客户端构造 URL 困难

**反例**(层级过深):

\`\`\`
/users/42/orders/1001/items/5/comments/8 ❌
\`\`\`

**改法**:用顶层资源 + 查询参数:

\`\`\`
/comments?order_item_id=5    ✓
/orders/1001/items/5         ✓ (2 层)
\`\`\`

### 4.3 何时用子资源 vs 顶层资源

| 场景 | 选择 | 示例 |
|------|------|------|
| 强依赖父资源 | 子资源 | \`/users/42/orders\`(订单只在用户上下文有意义) |
| 弱依赖,可独立访问 | 顶层 | \`/orders/1001\`(订单可独立查) |
| 多对多关系 | 顶层 + 查询 | \`/articles?tag=python\` |
| 顶层资源 + 反查 | 顶层 + 筛选 | \`/orders?user_id=42\` |

实务中,**订单既能用 \`/users/42/orders\` 也能用 \`/orders?user_id=42\`**。前者强调「这是这个用户的订单」,后者强调「筛选订单」。两者并存也合理。

## 五、命名规范

### 5.1 字母与大小写

- **全小写**:URI 中路径部分统一小写(\`/Users\` ❌,\`/users\` ✓)
- **不用驼峰**:驼峰在 URL 里看起来别扭,且大小写敏感问题多
- **用连字符(kebab-case)分隔单词**:\`/user-profiles\` ✓, \`/userProfiles\` ❌, \`/user_profiles\` △(下划线也可,但社区惯例用连字符)

### 5.2 单词选择

- 用**业务领域词**,而不是技术词(\`/users\` 不是 \`/user_entities\`)
- 用**全拼**,不用缩写(\`/users\` 不是 \`/usr\`)
- 例外:广泛接受的缩写可以(\`/api\`、\`/url\`、\`/id\`)

### 5.3 复数 vs 单数

社区惯例是**全用复数**:

- \`/users\` ✓
- \`/user\` ✗

为什么用复数?

- 集合是复数语义(\`/users\` = 多个用户)
- 单数资源也用复数(\`/users/42\` = users 集合中 id=42 的那个)
- 全用复数,规则统一,客户端不用记哪个是单数哪个是复数

**例外**:某些固定概念用单数更自然,如 \`/me\`(当前用户)、\`/search\`、\`/health\`。这些不是「集合」,是「单数概念」。

### 5.4 文件扩展名

**不要**在 URI 里加文件扩展名:

- \`/users.json\` ❌
- \`/users/42.xml\` ❌

格式由 \`Accept\` 头决定,不是 URI。URI 应该是格式无关的。

### 5.5 末尾斜杠

**不要**在 URI 末尾加斜杠,且要统一:

- \`/users\` ✓
- \`/users/\` ❌(末尾斜杠)

虽然技术上 \`/users\` 和 \`/users/\` 是不同 URI,但实务上应统一不带末尾斜杠,避免歧义和缓存分裂。

### 5.6 命名规范速查

| 规范 | 推荐 | 不推荐 |
|------|------|--------|
| 大小写 | 全小写 | 驼峰、大写 |
| 分隔符 | 连字符 - | 下划线 _、空格 |
| 单复数 | 复数 | 单数(集合) |
| 扩展名 | 不加 | .json、.xml |
| 末尾斜杠 | 不加 | / |
| 缩写 | 全拼 | 缩写(除 api/url/id) |

## 六、Python 实战:FastAPI 路由设计

### 6.1 基础路由

\`\`\`python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

class Order(BaseModel):
    id: int
    user_id: int
    amount: float
    status: str

# 内存存储
users: dict[int, User] = {}
orders: dict[int, Order] = {}
\`\`\`

### 6.2 用户资源路由

\`\`\`python
@app.get("/users", response_model=List[User])
def list_users(role: Optional[str] = None, sort: str = "-created_at"):
    """用户列表 — 支持按 role 筛选、按 created_at 排序"""
    result = list(users.values())
    if role:
        result = [u for u in result if u.role == role]
    reverse = sort.startswith("-")
    key = sort.lstrip("-")
    result.sort(key=lambda u: getattr(u, key), reverse=reverse)
    return result

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    if user_id not in users:
        raise HTTPException(404, "User not found")
    return users[user_id]

@app.post("/users", response_model=User, status_code=201)
def create_user(user: User):
    users[user.id] = user
    return user
\`\`\`

### 6.3 子资源:用户订单

\`\`\`python
@app.get("/users/{user_id}/orders", response_model=List[Order])
def list_user_orders(user_id: int, status: Optional[str] = None):
    """用户 42 的订单 — 子资源"""
    if user_id not in users:
        raise HTTPException(404, "User not found")
    result = [o for o in orders.values() if o.user_id == user_id]
    if status:
        result = [o for o in result if o.status == status]
    return result
\`\`\`

### 6.4 顶层资源也能查订单

\`\`\`python
@app.get("/orders", response_model=List[Order])
def list_orders(user_id: Optional[int] = None, status: Optional[str] = None):
    """订单列表 — 支持按 user_id 筛选"""
    result = list(orders.values())
    if user_id:
        result = [o for o in result if o.user_id == user_id]
    if status:
        result = [o for o in result if o.status == status]
    return result

@app.get("/orders/{order_id}", response_model=Order)
def get_order(order_id: int):
    if order_id not in orders:
        raise HTTPException(404, "Order not found")
    return orders[order_id]
\`\`\`

## 七、分页设计

集合资源可能很大,必须分页。分页有两种主流方案:**offset/limit** 和 **cursor-based**。

### 7.1 offset/limit 分页

最简单直观的分页方式:

\`\`\`
GET /users?offset=20&limit=10   → 跳过 20 条,取 10 条
GET /users?page=3&limit=10      → 第 3 页,每页 10 条
\`\`\`

**优点**:

- 简单直观
- 支持「跳到第 N 页」
- 客户端易实现

**缺点**:

- 数据变动时分页不稳(新增数据导致位移)
- 大 offset 性能差(\`OFFSET 100000\` 要扫描 100000 行)

### 7.2 cursor-based 分页

用「上一页最后一条的标识」作为游标:

\`\`\`
GET /users?limit=10                          → 第一页
GET /users?limit=10&cursor=eyJpZCI6IDEwfQ==  → 第二页,游标是 id=10
\`\`\`

服务器实现:

\`\`\`python
import base64, json

@app.get("/users")
def list_users(limit: int = 10, cursor: Optional[str] = None):
    if cursor:
        payload = json.loads(base64.b64decode(cursor))
        last_id = payload["id"]
        result = [u for u in users.values() if u.id > last_id][:limit]
    else:
        result = sorted(users.values(), key=lambda u: u.id)[:limit]
    
    # 生成下一页游标
    next_cursor = None
    if len(result) == limit:
        last = result[-1]
        next_cursor = base64.b64encode(json.dumps({"id": last.id}).encode()).decode()
    
    return {
        "data": result,
        "paging": {"next_cursor": next_cursor}
    }
\`\`\`

**优点**:

- 数据变动时分页稳定(不会重复或漏数据)
- 大数据集性能稳定(不用 OFFSET)
- 适合无限滚动场景

**缺点**:

- 不能「跳到第 N 页」,只能上一页/下一页
- 实现稍复杂

### 7.3 两种分页对比

| 维度 | offset/limit | cursor-based |
|------|--------------|--------------|
| 实现复杂度 | 低 | 中 |
| 跳页 | 支持 | 不支持 |
| 数据稳定性 | 不稳(变动时重复/漏) | 稳 |
| 大数据集性能 | 差(OFFSET 慢) | 好 |
| 适用场景 | 后台管理、数据稳定 | 信息流、社交、无限滚动 |

### 7.4 分页响应规范

分页响应应该包含足够信息让客户端决定下一页:

\`\`\`json
{
  "data": [...],
  "paging": {
    "page": 3,
    "limit": 10,
    "total": 142,
    "total_pages": 15,
    "has_next": true
  }
}
\`\`\`

cursor 版:

\`\`\`json
{
  "data": [...],
  "paging": {
    "next_cursor": "eyJpZCI6IDEwfQ==",
    "has_next": true
  }
}
\`\`\`

## 八、过滤、排序、字段选择

### 8.1 过滤(filtering)

用查询参数做精确筛选:

\`\`\`
GET /users?role=admin&status=active
GET /orders?status=paid&min_amount=100&max_amount=1000
GET /articles?tag=python&tag=rest    → 同字段多值
\`\`\`

**范围筛选**约定前缀:

- \`min_\` / \`max_\`:\`?min_price=100&max_price=500\`
- \`gt\` / \`lt\` / \`gte\` / \`lte\`:\`?created_at_gte=2024-01-01\`

**多值筛选**重复参数或逗号分隔:

- \`?tag=python&tag=rest\`(重复,主流)
- \`?tag=python,rest\`(逗号分隔)

### 8.2 排序(sorting)

用 \`sort\` 参数,字段名前缀 \`-\` 表示降序:

\`\`\`
GET /users?sort=created_at            → 升序
GET /users?sort=-created_at           → 降序
GET /users?sort=-created_at,name      → 多字段:先按 created_at 降序,再按 name 升序
\`\`\`

### 8.3 字段选择(field selection)

允许客户端选择返回哪些字段,减少传输量:

\`\`\`
GET /users/42?fields=id,name,email
GET /users?fields=id,name
\`\`\`

服务器实现:

\`\`\`python
@app.get("/users/{user_id}")
def get_user(user_id: int, fields: Optional[str] = None):
    user = users.get(user_id)
    if not user:
        raise HTTPException(404)
    if fields:
        field_set = set(fields.split(","))
        return {k: v for k, v in user.dict().items() if k in field_set}
    return user
\`\`\`

字段选择在移动端、低带宽场景很有用,但会增加服务器逻辑复杂度,按需引入。

### 8.4 查询参数速查

| 操作 | 参数 | 示例 |
|------|------|------|
| 精确筛选 | 字段名 | \`?role=admin\` |
| 范围筛选 | min_/max_ | \`?min_price=100\` |
| 多值筛选 | 重复字段 | \`?tag=py&tag=rest\` |
| 排序 | sort | \`?sort=-created_at\` |
| 多字段排序 | sort 逗号 | \`?sort=-created_at,name\` |
| 分页(offset) | offset/limit | \`?offset=20&limit=10\` |
| 分页(page) | page/limit | \`?page=2&limit=20\` |
| 分页(cursor) | cursor/limit | \`?cursor=xxx&limit=10\` |
| 字段选择 | fields | \`?fields=id,name\` |

## 九、URI 设计的常见陷阱

### 9.1 在 URI 里放动词

\`\`\`
POST /users/42/delete   ❌
DELETE /users/42        ✓
\`\`\`

### 9.2 在 URI 里编码业务状态

\`\`\`
GET /users/42/active-orders    ❌ (active 是状态,会变)
GET /users/42/orders?status=active  ✓ (状态用查询参数)
\`\`\`

URI 应该是稳定的,业务状态会变化,不该固化在 URI 里。

### 9.3 URI 里带版本号时位置混乱

\`\`\`
/api/v1/users/42        ✓ (版本在路径前缀)
/users/42/v1            ❌ (版本不应该跟在资源后)
/users/v1/42            ❌ (版本不应该在资源中间)
\`\`\`

### 9.4 用 query 参数定位资源

\`\`\`
GET /users?id=42        ❌
GET /users/42           ✓
\`\`\`

### 9.5 嵌套过深

\`\`\`
/users/42/orders/1001/items/5/comments/8/likes  ❌
/comments?item_id=5  ✓
\`\`\`

### 9.6 大小写混用

\`\`\`
/Users/42              ❌
/users/42              ✓
\`\`\`

## 十、URI 设计完整示例

一个电商系统的 URI 设计示例:

\`\`\`
# 商品
GET    /products                      → 商品列表
GET    /products/{product_id}         → 商品详情
POST   /products                      → 创建商品
PUT    /products/{product_id}         → 更新商品
DELETE /products/{product_id}         → 删除商品

# 商品分类
GET    /categories
GET    /categories/{category_id}/products  → 分类下的商品

# 用户
GET    /users
GET    /users/{user_id}
POST   /users
PUT    /users/{user_id}

# 用户地址(子资源)
GET    /users/{user_id}/addresses
POST   /users/{user_id}/addresses
DELETE /users/{user_id}/addresses/{address_id}

# 订单
GET    /orders
GET    /orders/{order_id}
POST   /orders
PUT    /orders/{order_id}

# 订单操作(动作型资源)
POST   /orders/{order_id}/cancellations   → 取消订单
POST   /orders/{order_id}/payments        → 发起支付
POST   /orders/{order_id}/refunds         → 申请退款

# 购物车
GET    /users/{user_id}/cart
POST   /users/{user_id}/cart/items
PUT    /users/{user_id}/cart/items/{item_id}
DELETE /users/{user_id}/cart/items/{item_id}

# 搜索
GET    /products/search?q=keyword         → 搜索(或直接 /products?q=keyword)

# 当前用户
GET    /me                                → 当前登录用户
PUT    /me                                → 更新当前用户
\`\`\`

## 十一、易错点小结

| 易错点 | 错误示例 | 正确做法 | 影响 |
|--------|---------|---------|------|
| URI 用动词 | \`/getUser\` | \`GET /users\` | RPC 风格,非 REST |
| 用 query 定位资源 | \`/users?id=42\` | \`/users/42\` | URI 不唯一 |
| 嵌套层级过深 | \`/a/b/c/d/e/f\` | 不超过 2 层 | URI 难维护 |
| 大小写混用 | \`/Users/42\` | 全小写 | 大小写敏感问题 |
| 末尾带斜杠 | \`/users/\` | 不带 | URI 不一致 |
| 用文件扩展名 | \`/users.json\` | 用 Accept 头 | 格式耦合 URI |
| 单复数混用 | \`/user/42/orders\` | 全复数 | 规则不统一 |
| URI 编码业务状态 | \`/users/42/active-orders\` | 状态用 query | URI 不稳定 |
| 强行 REST 化动作 | \`/deleteOrder\` | \`/orders/{id}/cancellations\` | 不自然 |
| 大 offset 分页 | \`?offset=100000\` | cursor 分页 | 性能差 |

## 十二、本章小结

URI 是 REST 的门面,设计好 URI 是设计好 API 的一半。这一章我们讲了:

- URI 用名词、复数、层级表达关系
- 路径参数定位资源,查询参数筛选集合
- 嵌套不超过 2 层
- 命名规范:小写、连字符、复数
- 分页 offset/limit vs cursor,按场景选
- 过滤/排序/字段选择的统一约定
- 动作型资源作为实用妥协

下一章我们深入 HTTP 方法与状态码,讲清楚 GET/POST/PUT/PATCH/DELETE 的语义边界,以及 2xx/3xx/4xx/5xx 的正确使用。
`,
  },
  {
    id: "pyarch-rest-methods-status",
    icon: "📋",
    title: "HTTP 方法与状态码",
    group: "RESTful API 设计",
    content: `# HTTP 方法与状态码

## 一、HTTP 方法语义回顾

HTTP 方法(也叫「动词」)定义了**对资源的操作类型**。RESTful API 之所以用 HTTP 方法表达动作,是因为 HTTP 方法自带**语义约束**(安全、幂等),客户端、服务器、中间件都能据此优化。

### 1.1 五个核心方法

| 方法 | 语义 | 是否安全 | 是否幂等 | 典型用途 |
|------|------|---------|---------|---------|
| GET | 获取资源表征 | 是 | 是 | 读操作 |
| POST | 创建资源 / 触发动作 | 否 | 否 | 创建、复杂操作 |
| PUT | 完整替换资源 | 否 | 是 | 整体更新 |
| PATCH | 部分更新资源 | 否 | 否(理论上) | 部分字段更新 |
| DELETE | 删除资源 | 否 | 是 | 删除 |

### 1.2 「安全」与「幂等」的含义

**安全(Safe)**:调用该方法不会改变服务器上的资源状态。GET 必须安全(只读),POST/PUT/PATCH/DELETE 不安全。

**幂等(Idempotent)**:多次调用产生相同结果。PUT/DELETE 幂等(再删一次还是删了),POST 不幂等(再 POST 一次创建第二个资源)。

理解幂等的工程价值:

- 网络抖动客户端重试时,幂等方法可以放心重试
- 中间件可以做幂等去重
- 客户端实现简化(不用担心重复操作)

## 二、GET 方法

### 2.1 语义

GET 用于**获取资源的表征**。GET 必须**安全**(只读)和**幂等**。

\`\`\`http
GET /users/42 HTTP/1.1
Accept: application/json
\`\`\`

### 2.2 GET 的约束

- **不能有请求体**:GET 请求不应该带 body(虽然技术上可以发,但代理、CDN 可能丢弃)
- **参数必须在 URL**:\`?role=admin&page=2\`
- **URL 长度有限**:浏览器/服务器对 URL 长度有限制(通常 2KB-8KB),不要在 GET 里传大参数
- **可缓存**:GET 响应可被 CDN、浏览器缓存
- **可被收藏/分享**:URL 完整描述请求

### 2.3 GET 的常见误用

**误用 1**:用 GET 修改数据

\`\`\`http
GET /users/42/activate  ❌
\`\`\`

修改数据违反「安全」约束。应该用 POST:

\`\`\`http
POST /users/42/activations  ✓
\`\`\`

**误用 2**:用 GET 传敏感信息

\`\`\`http
GET /users?password=abc123  ❌
\`\`\`

URL 会被日志、浏览器历史、Referer 头记录,密码不该出现在 URL。

**误用 3**:用 GET 传大量参数

\`\`\`http
GET /search?ids=1,2,3,...,1000  ❌ (URL 过长)
\`\`\`

改用 POST + body:

\`\`\`http
POST /articles/batch
Content-Type: application/json

{"ids": [1, 2, 3, ..., 1000]}
\`\`\`

## 三、POST 方法

### 3.1 语义

POST 用于**创建资源**或**触发非幂等动作**。POST 不安全、不幂等。

\`\`\`http
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com"}
\`\`\`

### 3.2 POST 创建资源的两种语义

**服务器决定 id**(主流):

\`\`\`http
POST /users
{"name": "Alice"}

→ 201 Created
Location: /users/42
{"id": 42, "name": "Alice"}
\`\`\`

**客户端决定 id**(少见,通常用 PUT):

\`\`\`http
POST /users
{"id": 42, "name": "Alice"}   → 不推荐,该用 PUT /users/42
\`\`\`

### 3.3 POST 触发动作

POST 也用于触发非幂等动作,如:

\`\`\`http
POST /orders/1001/payments     → 发起支付(每次创建新支付记录)
POST /email-sends              → 发送邮件(每次都发)
\`\`\`

### 3.4 POST 响应

- 创建成功:**201 Created** + \`Location\` 头指向新资源
- 触发动作成功:**200 OK** 或 **202 Accepted**(异步)
- 错误:对应 4xx/5xx

\`\`\`http
HTTP/1.1 201 Created
Location: /users/42
Content-Type: application/json

{"id": 42, "name": "Alice"}
\`\`\`

## 四、PUT 方法

### 4.1 语义

PUT 用于**完整替换资源**。如果资源不存在,可以创建(客户端提供 id)。PUT 幂等。

\`\`\`http
PUT /users/42 HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com", "role": "admin"}
\`\`\`

### 4.2 PUT 的「完整替换」语义

PUT 的核心是**完整替换**:客户端提供的表征就是新资源的完整状态。**没传的字段会被清空**(或设为默认值)。

举例,原用户:

\`\`\`json
{"id": 42, "name": "Alice", "email": "a@x.com", "role": "user"}
\`\`\`

PUT 请求:

\`\`\`http
PUT /users/42
{"id": 42, "name": "Bob"}
\`\`\`

PUT 后(完整替换):

\`\`\`json
{"id": 42, "name": "Bob", "email": null, "role": null}
\`\`\`

注意 \`email\` 和 \`role\` 被清空了!这就是「完整替换」的语义。如果想保留,应该用 PATCH。

### 4.3 PUT 创建(upsert)

如果资源不存在,PUT 可以创建:

\`\`\`http
PUT /users/42
{"name": "Alice"}

→ 201 Created (如果原本不存在)
→ 200 OK (如果原本存在,被替换)
\`\`\`

这种「存在则更新,不存在则创建」叫 **upsert**,适合客户端提供 id 的场景。

### 4.4 PUT 幂等的工程价值

PUT 幂等,客户端可以放心重试:

- 网络抖动,客户端重发 PUT,结果还是一样
- 中间件可以缓存 PUT 响应
- 客户端不用查重

### 4.5 POST vs PUT 的核心区别

| 维度 | POST | PUT |
|------|------|-----|
| 谁决定 id | 服务器 | 客户端 |
| 目标 URI | 集合(\`/users\`) | 具体资源(\`/users/42\`) |
| 幂等 | 否 | 是 |
| 语义 | 创建 / 触发动作 | 完整替换 / upsert |
| 响应码 | 201 Created | 200 OK 或 201 Created |

**口诀**:**「服务器定 id 用 POST,客户端定 id 用 PUT」**。

## 五、PATCH 方法

### 5.1 语义

PATCH 用于**部分更新资源**。只修改客户端提供的字段,其他字段保留。

\`\`\`http
PATCH /users/42 HTTP/1.1
Content-Type: application/json

{"role": "admin"}
\`\`\`

PATCH 后:

\`\`\`json
{"id": 42, "name": "Alice", "email": "a@x.com", "role": "admin"}
\`\`\`

注意 \`name\` 和 \`email\` 保留不变。这就是「部分更新」。

### 5.2 PATCH 不幂等的微妙之处

PATCH 在理论上**不幂等**。考虑:

\`\`\`http
PATCH /users/42
{"score": 10}   → 设置 score = 10
\`\`\`

第一次:score 从 0 变 10。
第二次:score 已经是 10,再 PATCH 还是 10。
看起来幂等?再看一个例子:

\`\`\`http
PATCH /users/42
{"score": 5, "version": 1}  → 递增语义(实际场景)
\`\`\`

不,标准 PATCH 不是递增语义。但有些 PATCH 操作(如 JSON Patch 的 \`add\` 操作)不幂等:

\`\`\`http
PATCH /users/42
Content-Type: application/json-patch+json

[{"op": "add", "path": "/tags/-", "value": "new"}]
\`\`\`

每次执行都会在 \`tags\` 数组末尾加一个 \`new\`,多次执行会加多个。这就是不幂等。

实务中,如果 PATCH 用「合并 JSON」语义,通常是幂等的。但要严格按 RFC,PATCH 标注为「不保证幂等」。

### 5.3 PATCH 的两种格式

**1. JSON Merge Patch(RFC 7396)**

最常见,简单合并 JSON:

\`\`\`http
PATCH /users/42
Content-Type: application/merge-patch+json

{"role": "admin", "email": null}
\`\`\`

\`null\` 表示删除该字段。

**2. JSON Patch(RFC 6902)**

操作序列,更强大:

\`\`\`http
PATCH /users/42
Content-Type: application/json-patch+json

[
  {"op": "replace", "path": "/role", "value": "admin"},
  {"op": "add", "path": "/tags/-", "value": "vip"},
  {"op": "remove", "path": "/temp"}
]
\`\`\`

支持 \`replace\`、\`add\`、\`remove\`、\`move\`、\`copy\`、\`test\` 六种操作。

### 5.4 PUT vs PATCH 对比

| 维度 | PUT | PATCH |
|------|-----|-------|
| 语义 | 完整替换 | 部分更新 |
| 幂等 | 是 | 否(理论) |
| 不传的字段 | 被清空 | 保留 |
| 客户端需提供 | 全部字段 | 仅修改的字段 |
| 标准 | RFC 7231 | RFC 5789 |
| 适用场景 | 整体替换、upsert | 改几个字段 |

**口诀**:**「全换用 PUT,微调用 PATCH」**。

## 六、DELETE 方法

### 6.1 语义

DELETE 用于**删除资源**。DELETE 幂等(再删一次还是删了)。

\`\`\`http
DELETE /users/42 HTTP/1.1
\`\`\`

### 6.2 DELETE 响应

- 删除成功:**204 No Content**(无返回体)或 **200 OK**(返回被删资源)
- 资源不存在:**404 Not Found** 或 **204**(幂等考虑,删了就是删了)

主流做法:**资源存在返回 204,资源不存在返回 404**。但如果强调幂等,可以始终返回 204。

### 6.3 软删除 vs 硬删除

RESTful API 通常不暴露软删除/硬删除的区别,但实现上常见:

- **软删除**:标记 \`deleted_at\`,实际不删(可恢复)
- **硬删除**:物理删除

软删除后,GET 该资源应该返回 404(对客户端而言,它已经「不存在」)。

## 七、其他方法

### 7.1 HEAD

HEAD 等同于 GET,但只返回头,不返回 body。用于:

- 检查资源是否存在(200 vs 404)
- 检查资源是否更新(\`ETag\`、\`Last-Modified\`)

\`\`\`http
HEAD /users/42
→ 200 OK(无 body)
\`\`\`

### 7.2 OPTIONS

OPTIONS 用于查询资源支持哪些方法,主要服务 CORS 预检:

\`\`\`http
OPTIONS /users/42
→ 200 OK
Allow: GET, PUT, PATCH, DELETE
\`\`\`

### 7.3 TRACE / CONNECT

TRACE 用于诊断,CONNECT 用于代理隧道。日常 API 开发几乎不用。

## 八、状态码使用规范

HTTP 状态码是响应的关键部分。RESTful API 必须正确使用状态码,客户端才能正确处理。

### 8.1 状态码分类

| 范围 | 类别 | 含义 |
|------|------|------|
| 1xx | 信息 | 请求已接收,继续处理(少用) |
| 2xx | 成功 | 请求被成功处理 |
| 3xx | 重定向 | 需要进一步操作 |
| 4xx | 客户端错误 | 请求有误,客户端负责 |
| 5xx | 服务器错误 | 服务器故障,服务器负责 |

### 8.2 2xx 成功

| 码 | 名称 | 何时用 |
|----|------|--------|
| 200 OK | 通用成功 | GET 成功、PUT/PATCH 成功、DELETE 返回内容 |
| 201 Created | 创建成功 | POST 创建成功、PUT upsert 创建 |
| 202 Accepted | 已接受,异步处理 | 异步任务接收,如导出报表 |
| 204 No Content | 成功无内容 | DELETE 成功、PUT 不返回内容 |

**202 Accepted 的典型场景**:

\`\`\`http
POST /reports/exports
→ 202 Accepted
Location: /reports/exports/abc123/status
\`\`\`

客户端轮询 \`/reports/exports/abc123/status\` 查询进度。

### 8.3 3xx 重定向

| 码 | 名称 | 何时用 |
|----|------|--------|
| 301 Moved Permanently | 永久重定向 | 资源 URI 永久变更,客户端缓存新地址 |
| 302 Found | 临时重定向 | 临时变更,客户端继续用旧地址 |
| 304 Not Modified | 未修改 | 缓存有效,客户端用本地缓存 |

**304 与缓存**:

客户端发:

\`\`\`http
GET /users/42
If-None-Match: "abc123"
\`\`\`

服务器检查 ETag 未变:

\`\`\`http
HTTP/1.1 304 Not Modified
ETag: "abc123"
\`\`\`

客户端用本地缓存,省流量。

### 8.4 4xx 客户端错误

| 码 | 名称 | 何时用 |
|----|------|--------|
| 400 Bad Request | 请求格式错误 | JSON 解析失败、参数缺失 |
| 401 Unauthorized | 未认证 | 没有 token 或 token 无效(应叫 Unauthenticated) |
| 403 Forbidden | 无权限 | 已认证但无权访问该资源 |
| 404 Not Found | 资源不存在 | 资源 id 不存在 |
| 405 Method Not Allowed | 方法不允许 | 资源存在但不支持该方法(如 POST /users/42) |
| 409 Conflict | 冲突 | 唯一约束冲突、并发冲突 |
| 410 Gone | 永久消失 | 资源被永久删除(比 404 更明确) |
| 422 Unprocessable Entity | 语义错误 | 格式对但语义错(如 email 格式对但已被占用) |
| 429 Too Many Requests | 限流 | 触发速率限制 |

**401 vs 403 的区别**(高频面试题):

- **401**:你是谁?— 未认证,没登录或 token 无效
- **403**:你能干这个吗?— 已认证但没权限

例:

- 未带 token 访问 \`/admin\` → 401
- 带了普通用户 token 访问 \`/admin\` → 403

**400 vs 422 的区别**:

- **400**:请求格式错(JSON 不合法、缺必填字段)
- **422**:格式对但语义错(email 不符合规则、字段值非法)

实务中很多 API 把 422 的情况也用 400,但严格区分更专业。

### 8.5 5xx 服务器错误

| 码 | 名称 | 何时用 |
|----|------|--------|
| 500 Internal Server Error | 服务器内部错误 | 未捕获异常、bug |
| 501 Not Implemented | 未实现 | 服务器不支持该功能 |
| 502 Bad Gateway | 网关错误 | 上游服务返回无效响应 |
| 503 Service Unavailable | 服务不可用 | 维护中、过载 |
| 504 Gateway Timeout | 网关超时 | 上游服务超时 |

5xx 是**服务器**的锅,客户端可以重试(对幂等方法)。

## 九、错误响应体设计

只返回状态码不够,还需要**结构化错误响应体**,告诉客户端错在哪、怎么改。

### 9.1 推荐结构

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数校验失败",
    "details": [
      {"field": "email", "issue": "邮箱格式不正确"},
      {"field": "age", "issue": "必须大于 0"}
    ],
    "request_id": "req-abc-123"
  }
}
\`\`\`

字段说明:

- \`code\`:机器可读的错误码(大写下划线),客户端据此分支处理
- \`message\`:人类可读的错误描述
- \`details\`:详细错误列表,尤其用于校验错误
- \`request_id\`:请求追踪 id,便于排查问题

### 9.2 错误码设计

错误码应该**稳定、有层级、机器可读**:

\`\`\`
VALIDATION_ERROR              → 校验错误
VALIDATION_REQUIRED_FIELD     → 必填字段缺失
VALIDATION_INVALID_FORMAT     → 格式错误
RESOURCE_NOT_FOUND            → 资源不存在
AUTH_INVALID_TOKEN            → token 无效
AUTH_PERMISSION_DENIED        → 无权限
RATE_LIMIT_EXCEEDED           → 限流
\`\`\`

### 9.3 不要把 500 当业务错误

**反例**:

\`\`\`http
HTTP/1.1 500 Internal Server Error

{"error": {"code": "USER_NOT_FOUND"}}
\`\`\`

500 表示**服务器异常**,应该是未捕获的 bug。用户不存在是客户端错误,应该用 404:

\`\`\`http
HTTP/1.1 404 Not Found

{"error": {"code": "USER_NOT_FOUND", "message": "用户不存在"}}
\`\`\`

### 9.4 错误响应的不同形态

**简单错误**:

\`\`\`json
{"error": {"code": "NOT_FOUND", "message": "用户不存在"}}
\`\`\`

**校验错误(详细)**:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数校验失败",
    "details": [
      {"field": "email", "code": "INVALID_FORMAT", "message": "邮箱格式不正确"},
      {"field": "age", "code": "OUT_OF_RANGE", "message": "年龄必须在 1-120"}
    ]
  }
}
\`\`\`

**限流错误(带重试信息)**:

\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000000

{"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "请 60 秒后重试"}}
\`\`\`

## 十、Python 实战:FastAPI 文章 CRUD

下面用 FastAPI 实现完整的文章 CRUD,正确使用方法和状态码。

### 10.1 模型与存储

\`\`\`python
from fastapi import FastAPI, HTTPException, status, Response
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="Articles API", version="1.0.0")

class ArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    tags: List[str] = []

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    """用于 PATCH,所有字段可选"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class Article(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime

# 内存存储
articles: dict[int, Article] = {}
next_id = 1
\`\`\`

### 10.2 GET 列表与单个

\`\`\`python
@app.get("/articles", response_model=List[Article])
def list_articles(tag: Optional[str] = None, limit: int = 20):
    """文章列表 — 200 OK"""
    result = list(articles.values())
    if tag:
        result = [a for a in result if tag in a.tags]
    return result[:limit]

@app.get("/articles/{article_id}", response_model=Article)
def get_article(article_id: int):
    """文章详情 — 200 或 404"""
    article = articles.get(article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ARTICLE_NOT_FOUND", "message": "文章不存在"}}
        )
    return article
\`\`\`

### 10.3 POST 创建

\`\`\`python
@app.post(
    "/articles",
    response_model=Article,
    status_code=status.HTTP_201_CREATED,
    response_headers={"Location": "/articles/{id}"}
)
def create_article(payload: ArticleCreate, response: Response):
    """创建文章 — 201 Created + Location 头"""
    global next_id
    now = datetime.utcnow()
    article = Article(
        id=next_id,
        title=payload.title,
        content=payload.content,
        tags=payload.tags,
        created_at=now,
        updated_at=now,
    )
    articles[article.id] = article
    next_id += 1
    response.headers["Location"] = f"/articles/{article.id}"
    return article
\`\`\`

### 10.4 PUT 完整替换

\`\`\`python
@app.put("/articles/{article_id}", response_model=Article)
def replace_article(article_id: int, payload: ArticleBase):
    """完整替换 — 200 或 404"""
    if article_id not in articles:
        raise HTTPException(404, detail={"error": {"code": "ARTICLE_NOT_FOUND"}})
    existing = articles[article_id]
    # 完整替换:用新数据覆盖,保留 id 和 created_at
    replaced = Article(
        id=existing.id,
        title=payload.title,
        content=payload.content,
        tags=payload.tags,
        created_at=existing.created_at,
        updated_at=datetime.utcnow(),
    )
    articles[article_id] = replaced
    return replaced
\`\`\`

### 10.5 PATCH 部分更新

\`\`\`python
@app.patch("/articles/{article_id}", response_model=Article)
def update_article(article_id: int, payload: ArticleUpdate):
    """部分更新 — 200 或 404"""
    if article_id not in articles:
        raise HTTPException(404, detail={"error": {"code": "ARTICLE_NOT_FOUND"}})
    article = articles[article_id]
    # 只更新客户端提供的字段
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(article, key, value)
    article.updated_at = datetime.utcnow()
    articles[article_id] = article
    return article
\`\`\`

注意 \`exclude_unset=True\`,只取客户端实际传的字段,这是 PATCH 的关键。

### 10.6 DELETE 删除

\`\`\`python
@app.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int):
    """删除 — 204 或 404"""
    if article_id not in articles:
        raise HTTPException(404, detail={"error": {"code": "ARTICLE_NOT_FOUND"}})
    del articles[article_id]
    return None
\`\`\`

### 10.7 测试请求

\`\`\`bash
# 创建
curl -X POST http://localhost:8000/articles \\
  -H "Content-Type: application/json" \\
  -d '{"title": "REST 入门", "content": "...", "tags": ["rest", "web"]}'
# → 201,Location: /articles/1

# 列表
curl http://localhost:8000/articles
# → 200

# 单个
curl http://localhost:8000/articles/1
# → 200

# 不存在
curl http://localhost:8000/articles/999
# → 404

# 完整替换
curl -X PUT http://localhost:8000/articles/1 \\
  -H "Content-Type: application/json" \\
  -d '{"title": "REST 进阶", "content": "新内容", "tags": ["rest"]}'

# 部分更新
curl -X PATCH http://localhost:8000/articles/1 \\
  -H "Content-Type: application/json" \\
  -d '{"title": "REST 高级"}'

# 删除
curl -X DELETE http://localhost:8000/articles/1
# → 204
\`\`\`

## 十一、方法与状态码完整对照

| 操作 | 方法 | 成功码 | 失败码 |
|------|------|--------|--------|
| 列表 | GET | 200 | 4xx/5xx |
| 单个 | GET | 200 | 404 |
| 创建 | POST | 201 | 400/409/422 |
| 完整替换 | PUT | 200/201 | 400/404/422 |
| 部分更新 | PATCH | 200 | 400/404/409/422 |
| 删除 | DELETE | 204/200 | 404 |
| 异步任务 | POST | 202 | 4xx |
| 缓存命中 | GET | 304 | - |

## 十二、易错点小结

| 易错点 | 错误示例 | 正确做法 | 影响 |
|--------|---------|---------|------|
| GET 修改数据 | \`GET /users/42/activate\` | \`POST /users/42/activations\` | 违反安全约束 |
| 用 POST 做查询 | \`POST /users/search\` | \`GET /users?q=...\` | 不能缓存、不能分享 |
| PUT 漏字段被清空 | PUT 只传 name,email 没了 | 想保留用 PATCH | 数据丢失 |
| POST 不返回 Location | 创建后没 Location 头 | 加 \`Location: /users/42\` | 客户端不知道新资源 URI |
| 401 当 403 用 | 没权限返回 401 | 401 未认证,403 无权限 | 客户端误判 |
| 业务错误返回 500 | 用户不存在返回 500 | 返回 404 | 客户端误判服务器故障 |
| DELETE 返回 200 + body | 删除返回被删资源 | 主流返回 204 | 不一致 |
| PATCH 用 PUT 实现 | PUT 只改一个字段其他清空 | 用 PATCH + exclude_unset | 数据丢失 |
| 创建返回 200 而非 201 | POST 成功返回 200 | 返回 201 Created | 不规范 |
| 不返回错误码 | 错误只返回 message | 加 \`code\` 字段 | 客户端难处理 |
| 422 当 400 用 | 校验错返回 400 | 严格区分 400(格式)/422(语义) | 错误处理不精细 |
| 缓存场景不用 304 | 总是返回 200 + body | 配合 ETag 返回 304 | 浪费流量 |

## 十三、本章小结

HTTP 方法和状态码是 RESTful API 的「语法」。这一章我们讲了:

- GET/POST/PUT/PATCH/DELETE 的语义边界
- 安全与幂等的工程价值
- POST vs PUT:谁定 id 用谁
- PUT vs PATCH:全换 vs 微调
- 2xx/3xx/4xx/5xx 的正确使用
- 错误响应体的结构化设计
- FastAPI 实现完整文章 CRUD

下一章我们讲 API 版本控制:为什么版本控制、四种版本策略、何时升级主版本、如何弃用旧版本。
`,
  },
  {
    id: "pyarch-rest-versioning",
    icon: "🔢",
    title: "API 版本控制",
    group: "RESTful API 设计",
    content: `# API 版本控制

## 一、为什么要版本控制

### 1.1 API 是契约

API 一旦发布,就成了**契约**。无数客户端(自己的前端、第三方应用、移动端)依赖这个契约工作。任何对契约的破坏性变更,都会导致客户端崩溃。

**破坏性变更(breaking change)举例**:

- 删除字段(原本有 \`email\`,新版本没了)
- 改变字段语义(\`status: "active"\` 原本是字符串,新版本变成数字 1)
- 改变字段类型(\`created_at\` 从字符串变时间戳)
- 改变 URL 结构(\`/users/42\` 变成 \`/user/42\`)
- 改变认证方式

### 1.2 没有版本控制的后果

假设你的 API 直接破坏性变更,不做版本控制:

- 第三方客户端调用失败,业务中断
- 移动端旧版本 app 全部崩溃(用户不会立刻升级)
- 自己的前端如果没同步更新也崩
- 你的邮箱被客户投诉塞满

**真实案例**:Twitter、GitHub、Stripe 都因为破坏性变更引发过客户端大规模故障。所以主流 API 都有版本控制。

### 1.3 版本控制的目标

- **新功能不影响旧客户端**:旧客户端继续用旧版本,不受影响
- **平滑迁移**:给客户端足够时间迁移到新版本
- **可控弃用**:旧版本有明确的生命周期,过期下线

## 二、版本控制策略

主流有四种版本控制策略。

### 2.1 URI 版本(最常见)

把版本号放在 URI 路径里:

\`\`\`
GET /v1/users/42
GET /v2/users/42
\`\`\`

**优点**:

- **可见性强**:版本在 URL 里,一目了然
- **缓存友好**:URL 不同,CDN/浏览器缓存独立
- **客户端简单**:改 URL 就行
- **路由清晰**:网关、代理容易路由

**缺点**:

- **RESTful 纯度低**:URI 应该标识资源,版本不是资源属性,把版本放 URI 违反「URI 是资源标识」原则
- **版本迁移痛苦**:客户端要从 \`/v1/\` 改到 \`/v2/\`,所有 URL 都得改

**适用**:绝大多数公开 API(GitHub、Stripe、Twitter 都用 URI 版本)。

### 2.2 查询参数版本

把版本放在查询参数:

\`\`\`
GET /users/42?version=1
GET /users/42?version=2
\`\`\`

**优点**:

- 客户端容易默认值(不传 = 最新版或默认版)
- URI 主体不变

**缺点**:

- **可见性差**:版本藏在 query 里,不显眼
- **缓存麻烦**:默认缓存可能忽略 query,导致 v1/v2 缓存混淆
- **容易遗漏**:客户端调用时容易忘记带 version

**适用**:小范围 API、内部 API。

### 2.3 自定义头版本

用自定义 HTTP 头:

\`\`\`http
GET /users/42 HTTP/1.1
X-API-Version: 1
\`\`\`

**优点**:

- URI 干净,版本与资源解耦
- 不影响 URL 缓存

**缺点**:

- **可见性最差**:打开浏览器看不到头
- **客户端复杂**:要设置头,不能直接 curl
- **HATEOAS 不友好**:链接里没法带版本
- **代理可能丢头**:某些代理会清理未知头

**适用**:对 URI 纯度要求高、客户端可控的场景。

### 2.4 Accept 头版本(内容协商)

用 \`Accept\` 头的 vendor media type 表达版本:

\`\`\`http
GET /users/42 HTTP/1.1
Accept: application/vnd.myapp.v1+json
\`\`\`

v2:

\`\`\`http
GET /users/42 HTTP/1.1
Accept: application/vnd.myapp.v2+json
\`\`\`

**优点**:

- **RESTful 纯度最高**:版本是表征格式的一部分,符合 REST 表征协商理念
- URI 干净
- 可与内容协商无缝结合

**缺点**:

- **可见性差**:头不直观
- **客户端复杂**:\`Accept\` 头格式难记
- **缓存复杂**:缓存键要包含 Accept
- **调试麻烦**:curl 命令长

**适用**:对 RESTful 纯度要求高的 API(GitHub v3 部分用此方案)。

### 2.5 四种策略对比

| 策略 | 可见性 | 缓存友好 | 客户端复杂度 | RESTful 纯度 | 主流度 |
|------|--------|---------|-------------|-------------|--------|
| URI 版本 | 高 | 高 | 低 | 低 | ⭐⭐⭐⭐⭐ |
| 查询参数 | 中 | 中 | 低 | 中 | ⭐⭐ |
| 自定义头 | 低 | 高 | 中 | 中 | ⭐⭐ |
| Accept 头 | 低 | 中 | 高 | 高 | ⭐⭐ |

**务实建议**:99% 的项目用 **URI 版本**。简单、可见、客户端友好。RESTful 纯度是学术问题,工程上是性价比问题。

## 三、版本号语义

### 3.1 主版本 vs 子版本

API 版本通常只用**主版本号**(\`v1\`、\`v2\`),不像软件包那样有 \`v1.2.3\`。原因:

- 主版本号表达「契约版本」,客户端只关心契约是否变
- 子版本(\`v1.1\`)对客户端无意义,因为子版本兼容(非破坏性变更)

### 3.2 何时升主版本

**升主版本的信号**(破坏性变更):

- 删除字段
- 改变字段类型或语义
- 改变 URL 结构
- 改变认证方式
- 改变错误响应格式

**不升主版本的变更**(非破坏性):

- 新增字段(可选字段,旧客户端忽略)
- 新增端点
- 新增可选查询参数
- 改善错误消息文本

**核心原则**:**只要旧客户端还能正常工作,就不升主版本**。

### 3.3 非破坏性变更的兼容性原则

新增字段是安全的,因为:

- 旧客户端忽略未知字段(JSON 解析器默认行为)
- 新客户端可以用新字段

但要注意:

- 新增的**必填**字段是破坏性的(旧客户端不会传)
- 改变字段的**取值范围**可能破坏(如原本 \`status\` 只能是 \`active\`/\`inactive\`,新版本加了 \`banned\`,旧客户端可能不识别)

## 四、弃用策略

不能一发布新版本就立刻删除旧版本,要给客户端迁移时间。

### 4.1 弃用流程

1. **发布新版本**(\`v2\`),旧版本(\`v1\`)继续工作
2. **标记弃用**:在 \`v1\` 的响应头加 \`Deprecation\` 头,文档标记弃用
3. **告知客户端**:邮件、文档、博客、API 响应头
4. **维护期**:通常 6-12 个月,根据业务调整
5. **下线**:维护期结束,\`v1\` 返回 410 Gone 或 426 Upgrade Required

### 4.2 弃用响应头

\`\`\`http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 31 Dec 2025 23:59:59 GMT
Link: </v2/users/42>; rel="successor-version"
\`\`\`

- \`Deprecation: true\` — 标记弃用
- \`Sunset\` — 计划下线时间
- \`Link: rel="successor-version"\` — 指向新版本

### 4.3 下线后的响应

\`\`\`http
HTTP/1.1 410 Gone
Content-Type: application/json

{"error": {"code": "VERSION_RETIRED", "message": "v1 已下线,请迁移到 v2"}}
\`\`\`

或:

\`\`\`http
HTTP/1.1 426 Upgrade Required
Upgrade: v2
\`\`\`

### 4.4 弃用周期建议

| API 类型 | 建议维护期 |
|---------|-----------|
| 内部 API(自己团队) | 1-3 个月 |
| 公开 API(第三方) | 6-12 个月 |
| 企业级 API(关键业务) | 12-24 个月 |
| 政府金融 API | 可能要 5 年+ |

## 五、Python 实战:FastAPI 多版本路由

### 5.1 用 APIRouter 分版本

FastAPI 推荐用 \`APIRouter\` 组织路由,每个版本一个 router:

\`\`\`python
from fastapi import FastAPI, APIRouter, HTTPException, status, Response
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Versioned API")

# ============ v1 ============
v1_router = APIRouter(prefix="/v1", tags=["v1"])

class UserV1(BaseModel):
    id: int
    name: str
    email: str

@v1_router.get("/users/{user_id}", response_model=UserV1)
def get_user_v1(user_id: int):
    # v1: 返回 name 字段
    return {"id": user_id, "name": "Alice", "email": "alice@x.com"}

@v1_router.get("/users", response_model=List[UserV1])
def list_users_v1():
    return [{"id": 1, "name": "Alice", "email": "a@x.com"}]

# ============ v2 ============
v2_router = APIRouter(prefix="/v2", tags=["v2"])

class UserV2(BaseModel):
    """v2:把 name 拆成 first_name 和 last_name"""
    id: int
    first_name: str
    last_name: str
    email: str
    avatar_url: Optional[str] = None  # v2 新增字段

@v2_router.get("/users/{user_id}", response_model=UserV2)
def get_user_v2(user_id: int, response: Response):
    response.headers["X-API-Version"] = "v2"
    return {
        "id": user_id,
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@x.com",
        "avatar_url": "https://example.com/a.png"
    }

@v2_router.get("/users", response_model=List[UserV2])
def list_users_v2():
    return [{"id": 1, "first_name": "Alice", "last_name": "Smith", "email": "a@x.com"}]

# 注册路由
app.include_router(v1_router)
app.include_router(v2_router)
\`\`\`

### 5.2 v1 标记弃用

给 v1 加弃用头:

\`\`\`python
from fastapi import Request

@app.middleware("http")
async def deprecation_header(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/v1"):
        response.headers["Deprecation"] = "true"
        response.headers["Sunset"] = "Wed, 31 Dec 2025 23:59:59 GMT"
        response.headers["Link"] = '</v2/users>; rel="successor-version"'
    return response
\`\`\`

### 5.3 v1 下线(模拟)

下线日到了,v1 直接返回 410:

\`\`\`python
V1_RETIRED = False  # 设为 True 时下线

@app.middleware("http")
async def retire_v1(request: Request, call_next):
    if V1_RETIRED and request.url.path.startswith("/v1"):
        return Response(
            content='{"error": {"code": "VERSION_RETIRED", "message": "v1 已下线,请用 v2"}}',
            status_code=410,
            media_type="application/json"
        )
    return await call_next(request)
\`\`\`

### 5.4 测试两个版本

\`\`\`bash
# v1
curl http://localhost:8000/v1/users/1
# → 200 + Deprecation 头
{"id": 1, "name": "Alice", "email": "alice@x.com"}

# v2
curl http://localhost:8000/v2/users/1
# → 200
{"id": 1, "first_name": "Alice", "last_name": "Smith", "email": "alice@x.com", "avatar_url": "..."}
\`\`\`

## 六、字段演进示例

### 6.1 v1 → v2 字段拆分

v1 用户:

\`\`\`json
{"id": 1, "name": "Alice Smith", "email": "alice@x.com"}
\`\`\`

v2 把 \`name\` 拆成 \`first_name\` 和 \`last_name\`:

\`\`\`json
{"id": 1, "first_name": "Alice", "last_name": "Smith", "email": "alice@x.com"}
\`\`\`

这是破坏性变更(\`name\` 字段没了,旧客户端解析失败),所以升 v2。

### 6.2 v1 → v2 字段类型变更

v1 \`created_at\` 是字符串:

\`\`\`json
{"id": 1, "created_at": "2024-01-01T00:00:00Z"}
\`\`\`

v2 改成时间戳(数字):

\`\`\`json
{"id": 1, "created_at": 1704067200}
\`\`\`

类型变了,旧客户端按字符串解析会崩,破坏性变更,升 v2。

### 6.3 非破坏性变更(不升版本)

v1 用户:

\`\`\`json
{"id": 1, "name": "Alice", "email": "alice@x.com"}
\`\`\`

新增 \`avatar_url\` 字段(可选):

\`\`\`json
{"id": 1, "name": "Alice", "email": "alice@x.com", "avatar_url": "https://..."}
\`\`\`

旧客户端忽略 \`avatar_url\`,不受影响。**不升版本**。

## 七、版本控制的最佳实践

### 7.1 版本号放 URI 前缀

\`\`\`
/v1/users/42     ✓
/users/v1/42     ✗
/users/42/v1     ✗
\`\`\`

版本号在最前面,所有资源共享。

### 7.2 不要无限维护旧版本

旧版本维护成本高(代码、文档、测试、服务器)。建议:

- 同时维护不超过 2 个版本(当前 + 上一个)
- 旧版本明确下线时间
- 下线前充分通知

### 7.3 文档明确版本

每个版本的文档独立、稳定:

- \`/docs/v1\`
- \`/docs/v2\`

不要把 v1 和 v2 混在一篇文档里讲,容易混淆。

### 7.4 版本与功能解耦

版本是**契约版本**,不是「功能版本」。不要把 v1 = 基础功能、v2 = 高级功能这种思维。新功能应该在当前版本里加(只要不破坏契约)。

### 7.5 监控旧版本使用

监控每个版本的调用量,当下线前还有大量调用时,要主动联系客户端迁移:

\`\`\`
v1 调用量: 10万/天 (90%)
v2 调用量: 1万/天 (10%)
\`\`\`

这个数据下线 v1 风险大,要继续推动迁移。

## 八、版本控制的常见陷阱

### 8.1 不做版本控制

「我们 API 还小,不需要版本控制」。等业务长大了,改不动了。

### 8.2 每个小改动都升版本

「改了字段名,升 v2」。非破坏性变更不需要升版本,频繁升版本会让客户端疲惫。

### 8.3 升版本但旧版本无限维护

「v2 出来了,v1 还在跑」,5 年后还在维护 v1,代码膨胀。

### 8.4 版本号语义混乱

「v1.0、v1.1、v1.2、v2.0」,子版本对客户端无意义,只升主版本。

### 8.5 旧版本不通知就下线

「今天我们下线 v1」,客户端直接 410,业务中断。

### 8.6 v2 兼容性差

「v2 字段全改了」,客户端迁移成本巨大,干脆不迁移。v2 设计要尽量平滑,提供迁移指南。

## 九、版本控制决策流程

\`\`\`
变更是否破坏契约?
├── 否 → 不升版本,在当前版本加(确保向后兼容)
└── 是 → 升主版本
        ├── 发布新版本
        ├── 旧版本标记 Deprecation
        ├── 设定下线时间(6-12 月)
        ├── 提供迁移文档
        ├── 监控旧版本调用量
        └── 下线日 → 旧版本返回 410
\`\`\`

## 十、版本控制完整示例

### 10.1 v1(简单用户)

\`\`\`python
# v1/users.py
class UserV1(BaseModel):
    id: int
    name: str           # 单一 name 字段
    email: str

@v1_router.get("/users/{user_id}", response_model=UserV1)
def get_user_v1(user_id: int):
    return {"id": user_id, "name": "Alice Smith", "email": "alice@x.com"}
\`\`\`

### 10.2 v2(字段拆分 + 新增)

\`\`\`python
# v2/users.py
class UserV2(BaseModel):
    id: int
    first_name: str     # 拆分
    last_name: str      # 拆分
    email: str
    avatar_url: Optional[str] = None  # 新增(可选)

@v2_router.get("/users/{user_id}", response_model=UserV2)
def get_user_v2(user_id: int):
    return {
        "id": user_id,
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@x.com",
        "avatar_url": "https://example.com/a.png"
    }
\`\`\`

### 10.3 迁移指南(文档)

\`\`\`markdown
# v1 → v2 迁移指南

## 字段变更
- \`name\` 字段被移除,改用 \`first_name\` + \`last_name\`
  - v1: \`{"name": "Alice Smith"}\`
  - v2: \`{"first_name": "Alice", "last_name": "Smith"}\`
  - 迁移:\`first_name, last_name = name.split(" ", 1)\`

## 新增字段
- \`avatar_url\`(可选,可忽略)

## URL 变更
- \`/v1/users/{id}\` → \`/v2/users/{id}\`

## 时间线
- 2024-01-01:v2 发布,v1 标记弃用
- 2024-12-31:v1 下线,返回 410
\`\`\`

## 十一、版本控制策略选择决策树

\`\`\`
你的 API 是?
├── 公开 API(第三方调用) → URI 版本(/v1/)
├── 内部 API(团队内)
│   ├── 客户端可控 → URI 版本 或 自定义头
│   └── 客户端不可控 → URI 版本
├── 移动端 API
│   └── URI 版本(移动端升级慢,版本要长期维护)
├── 微服务内部
│   └── 用 gRPC,版本在 Protobuf 里管
└── 对 RESTful 纯度有洁癖 → Accept 头
\`\`\`

## 十二、易错点小结

| 易错点 | 错误示例 | 正确做法 | 影响 |
|--------|---------|---------|------|
| 不做版本控制 | 直接破坏性改字段 | 升主版本 | 客户端崩溃 |
| 频繁升版本 | 改个字段名升 v2 | 非破坏性变更不升 | 客户端疲惫 |
| 旧版本无限维护 | v1 跑了 5 年 | 设定下线时间 | 维护成本爆炸 |
| 子版本号 | v1.1、v1.2 | 只用主版本 v1、v2 | 子版本对客户端无意义 |
| 升级不通知 | 默默下线 v1 | 邮件 + 文档 + 响应头 | 客户端中断 |
| 版本号位置乱 | /users/v1/42 | /v1/users/42 | 路由混乱 |
| v2 不兼容 v1 数据 | v2 用不同 id 体系 | 数据兼容,只是表征变 | 迁移困难 |
| 不监控旧版本用量 | 直接下线 | 下线前监控调用量 | 风险大 |
| 弃用头缺失 | 旧版本不标 Deprecation | 加 Deprecation + Sunset | 客户端不知道要迁移 |
| 升版本但契约不清晰 | v2 文档模糊 | 明确迁移指南 | 客户端难迁移 |

## 十三、本章小结

版本控制是 API 长期演化的保障。这一章我们讲了:

- API 是契约,破坏性变更需要版本控制
- 四种策略:URI 版本(主流)、查询参数、自定义头、Accept 头
- 只在破坏性变更时升主版本
- 弃用流程:发布新版 → 标记弃用 → 维护期 → 下线
- FastAPI 用 APIRouter 分版本
- 字段演进的破坏性 vs 非破坏性判断

下一章我们讲 HATEOAS 与超媒体,这是 REST 的最高境界,也是最具争议的特性。
`,
  },
  {
    id: "pyarch-rest-hateoas",
    icon: "🧭",
    title: "HATEOAS 与超媒体",
    group: "RESTful API 设计",
    content: `# HATEOAS 与超媒体

## 一、HATEOAS 是什么

HATEOAS 全称 **Hypermedia As The Engine Of Application State**(超媒体作为应用状态的引擎),是 REST 统一接口约束的第四个子约束,也是最难实现、最具争议的一个。

### 1.1 一句话定义

> HATEOAS:API 响应中包含指向**下一步操作**的超链接,客户端通过这些链接驱动应用状态变化,而不需要硬编码 URL。

### 1.2 直觉理解

想象你在浏览网页:

1. 你访问 \`example.com\`,看到首页有「登录」「注册」两个链接
2. 你点「登录」,跳到登录页,登录页有「提交」按钮
3. 提交后跳到个人主页,有「订单」「设置」「退出」等链接
4. 你点「订单」,看到订单列表,每条订单有「详情」「取消」「再次购买」链接

注意:**你全程不需要记住任何 URL**。每一步,服务器都告诉你「下一步能干什么、对应的链接是什么」。你只需要「点链接」。

这就是 HATEOAS 的直觉:**响应里包含可执行的下一步链接,客户端跟着链接走**。

### 1.3 对比:无 HATEOAS vs 有 HATEOAS

**无 HATEOAS**(Level 2):

\`\`\`http
GET /orders/1001

→ 200 OK
{
  "id": 1001,
  "status": "pending",
  "amount": 100.00
}
\`\`\`

客户端要做什么?客户端必须**硬编码**:

- 想支付?客户端得知道 \`POST /orders/1001/payments\`
- 想取消?客户端得知道 \`POST /orders/1001/cancellations\`
- 想看详情?客户端得知道 \`GET /orders/1001/items\`

这些 URL 全部写死在客户端代码里。一旦服务器改 URL,客户端就崩。

**有 HATEOAS**(Level 3):

\`\`\`http
GET /orders/1001

→ 200 OK
{
  "id": 1001,
  "status": "pending",
  "amount": 100.00,
  "_links": {
    "self": {"href": "/orders/1001"},
    "pay": {"href": "/orders/1001/payments", "method": "POST"},
    "cancel": {"href": "/orders/1001/cancellations", "method": "POST"},
    "items": {"href": "/orders/1001/items", "method": "GET"}
  }
}
\`\`\`

客户端不需要硬编码 URL,只需要:

- 看 \`status\` 是 \`pending\`,可以支付/取消
- \`_links\` 里给出了对应的 URL
- 客户端「点链接」就行

服务器改了 URL(如从 \`/orders/1001/payments\` 改成 \`/payments?order_id=1001\`),只要响应里的 \`_links\` 也跟着改,客户端无需更新。

## 二、HATEOAS 的价值

### 2.1 解耦客户端与服务器 URL

最大价值。客户端只记**入口 URL**(如 \`/api\`),其他所有 URL 都从响应里动态获取。服务器可以自由调整 URL 结构,客户端无感知。

### 2.2 自描述 API

响应里不仅有数据,还有「能干什么」。客户端打开响应就能理解整个状态机,不需要翻文档。

### 2.3 状态驱动的可用操作

不同状态下,可用的操作不同。HATEOAS 通过 \`_links\` 自然表达:

- 订单 \`pending\`:有 \`pay\`、\`cancel\` 链接
- 订单 \`paid\`:有 \`ship\` 链接(没有 \`pay\`)
- 订单 \`shipped\`:有 \`track\` 链接(没有 \`pay\`、\`cancel\`)
- 订单 \`delivered\`:有 \`return\` 链接

客户端不用判断状态,\`_links\` 里有啥就能干啥。

### 2.4 演化友好

新增功能 = 新增链接,旧客户端忽略未知链接即可,完全兼容。

## 三、HATEOAS 的例子

### 3.1 订单详情(状态:pending)

\`\`\`http
GET /orders/1001

→ 200 OK
{
  "id": 1001,
  "status": "pending",
  "amount": 100.00,
  "_links": {
    "self": {"href": "/orders/1001"},
    "pay": {"href": "/orders/1001/payments", "method": "POST"},
    "cancel": {"href": "/orders/1001/cancellations", "method": "POST"},
    "items": {"href": "/orders/1001/items"}
  }
}
\`\`\`

### 3.2 订单详情(状态:paid)

\`\`\`http
GET /orders/1001

→ 200 OK
{
  "id": 1001,
  "status": "paid",
  "amount": 100.00,
  "_links": {
    "self": {"href": "/orders/1001"},
    "ship": {"href": "/orders/1001/shipments", "method": "POST"},
    "items": {"href": "/orders/1001/items"},
    "invoice": {"href": "/orders/1001/invoice"}
  }
}
\`\`\`

注意 \`pay\` 和 \`cancel\` 没了,因为订单已支付,不能重复支付或取消。

### 3.3 订单详情(状态:delivered)

\`\`\`http
GET /orders/1001

→ 200 OK
{
  "id": 1001,
  "status": "delivered",
  "amount": 100.00,
  "_links": {
    "self": {"href": "/orders/1001"},
    "return": {"href": "/orders/1001/returns", "method": "POST"},
    "review": {"href": "/orders/1001/reviews", "method": "POST"},
    "invoice": {"href": "/orders/1001/invoice"}
  }
}
\`\`\`

### 3.4 列表分页链接

\`\`\`http
GET /orders

→ 200 OK
{
  "data": [...],
  "_links": {
    "self": {"href": "/orders?page=2"},
    "first": {"href": "/orders?page=1"},
    "prev": {"href": "/orders?page=1"},
    "next": {"href": "/orders?page=3"},
    "last": {"href": "/orders?page=10"}
  }
}
\`\`\`

客户端不用构造分页 URL,直接用 \`_links\` 里的链接。

## 四、HATEOAS 难以普及的原因

虽然 HATEOAS 理论上很美,但实际工程中普及率很低。原因:

### 4.1 客户端配合难

HATEOAS 要求客户端**动态发现链接**,而不是硬编码。但:

- 大多数客户端框架假设「URL 是固定的」
- 客户端代码要变成「读响应里的链接 → 调用」,逻辑复杂
- 客户端开发要改变思维习惯,学习成本高

### 4.2 服务器实现复杂

服务器要:

- 为每个响应计算可用链接(基于状态、权限)
- 维护链接关系(rel)的语义
- 处理链接的版本、协议、域名

实现一个完整的 HATEOAS API 比普通 API 复杂得多。

### 4.3 工具链支持弱

- Swagger/OpenAPI 主要描述静态 URL,对动态链接支持弱
- 客户端代码生成器假设 URL 固定
- 测试工具假设 URL 固定

### 4.4 性能开销

每个响应都要带 \`_links\`,响应体变大,带宽增加。对移动端、低带宽场景不友好。

### 4.5 文档还是得写

虽然 HATEOAS 自描述,但客户端还是需要知道:

- 有哪些 \`rel\`(链接关系)?
- 每个 \`rel\` 的语义是什么?
- 调用链接需要什么参数?

这些还是要文档。所以 HATEOAS 没有完全消灭文档。

### 4.6 现实选择

大多数 API 选择 **Level 2**(正确用 HTTP 方法和状态码),不上 HATEOAS。原因:

- 收益(解耦)不如成本(复杂度)
- 客户端不愿意配合
- 文档 + SDK 已经能解决问题

HATEOAS 在以下场景有真实价值:

- **长期演化的开放 API**(如支付、电商,URL 频繁调整)
- **Web 框架自动渲染**(如 Spring HATEOAS + HAL 浏览器)
- **真正的「自发现」需求**(如 IoT 设备动态发现 API)

## 五、超媒体格式

HATEOAS 的链接怎么放进响应?有几种标准化的超媒体格式。

### 5.1 HAL(Hypertext Application Language)

最流行的超媒体格式。用 \`_links\` 和 \`_embedded\` 字段:

\`\`\`json
{
  "id": 1001,
  "status": "pending",
  "amount": 100.00,
  "_links": {
    "self": {"href": "/orders/1001"},
    "pay": {"href": "/orders/1001/payments"},
    "cancel": {"href": "/orders/1001/cancellations"}
  },
  "_embedded": {
    "items": [
      {"id": 1, "name": "Book", "_links": {"self": {"href": "/items/1"}}}
    ]
  }
}
\`\`\`

特点:

- 简单,易理解
- 广泛支持(Spring HATEOAS、HAL Browser)
- MIME 类型:\`application/hal+json\`

### 5.2 JSON-LD(JSON for Linked Data)

W3C 标准,用 \`@context\` 和 \`@id\` 表达链接:

\`\`\`json
{
  "@context": "https://schema.org/Order",
  "@id": "/orders/1001",
  "status": "pending",
  "amount": 100.00,
  "customer": {"@id": "/users/42"}
}
\`\`\`

特点:

- 语义网背景,适合关联数据
- 复杂度高
- MIME 类型:\`application/ld+json\`

### 5.3 Siren

结构更丰富,带 \`actions\`(明确表达可执行的操作):

\`\`\`json
{
  "class": ["order"],
  "properties": {"id": 1001, "status": "pending", "amount": 100.00},
  "entities": [...],
  "actions": [
    {
      "name": "pay",
      "method": "POST",
      "href": "/orders/1001/payments",
      "fields": [{"name": "payment_method", "type": "text"}]
    }
  ],
  "links": [
    {"rel": ["self"], "href": "/orders/1001"}
  ]
}
\`\`\`

特点:

- 表达力最强(actions 含字段定义)
- 复杂度最高
- 适合需要客户端动态表单的场景

### 5.4 Collection+JSON

专为集合资源设计:

\`\`\`json
{
  "collection": {
    "version": "1.0",
    "href": "/orders",
    "items": [
      {"href": "/orders/1001", "data": [...]}
    ],
    "queries": [
      {"rel": "search", "href": "/orders/search", "prompt": "搜索订单"}
    ]
  }
}
\`\`\`

特点:

- 集合表达强
- 支持查询模板

### 5.5 格式对比

| 格式 | 复杂度 | 表达力 | 主流度 | 适用 |
|------|--------|--------|--------|------|
| HAL | 低 | 中 | ⭐⭐⭐⭐⭐ | 通用 |
| JSON-LD | 高 | 高 | ⭐⭐⭐ | 语义网、关联数据 |
| Siren | 高 | 高 | ⭐⭐ | 需要动态表单 |
| Collection+JSON | 中 | 中 | ⭐⭐ | 集合资源 |

**务实建议**:用 HAL。简单、够用、支持广。

## 六、Python 实战:FastAPI 实现 HATEOAS

### 6.1 基础模型

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

app = FastAPI()

class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class Link(BaseModel):
    href: str
    method: str = "GET"

class Order(BaseModel):
    id: int
    status: OrderStatus
    amount: float
    _links: Dict[str, Link] = {}
\`\`\`

### 6.2 链接生成器

\`\`\`python
from typing import Dict
def build_order_links(order: dict) -> Dict[str, Any]:
    """根据订单状态生成可用链接"""
    links = {
        "self": {"href": f"/orders/{order['id']}", "method": "GET"}
    }
    status = order["status"]
    
    if status == OrderStatus.pending:
        links["pay"] = {"href": f"/orders/{order['id']}/payments", "method": "POST"}
        links["cancel"] = {"href": f"/orders/{order['id']}/cancellations", "method": "POST"}
    elif status == OrderStatus.paid:
        links["ship"] = {"href": f"/orders/{order['id']}/shipments", "method": "POST"}
        links["invoice"] = {"href": f"/orders/{order['id']}/invoice", "method": "GET"}
    elif status == OrderStatus.shipped:
        links["track"] = {"href": f"/orders/{order['id']}/tracking", "method": "GET"}
    elif status == OrderStatus.delivered:
        links["return"] = {"href": f"/orders/{order['id']}/returns", "method": "POST"}
        links["review"] = {"href": f"/orders/{order['id']}/reviews", "method": "POST"}
        links["invoice"] = {"href": f"/orders/{order['id']}/invoice", "method": "GET"}
    
    links["items"] = {"href": f"/orders/{order['id']}/items", "method": "GET"}
    return links
\`\`\`

### 6.3 订单存储与路由

\`\`\`python
orders: dict[int, dict] = {
    1: {"id": 1, "status": OrderStatus.pending, "amount": 100.00},
    2: {"id": 2, "status": OrderStatus.paid, "amount": 200.00},
    3: {"id": 3, "status": OrderStatus.delivered, "amount": 50.00},
}

@app.get("/orders/{order_id}")
def get_order(order_id: int):
    order = orders.get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    order_copy = dict(order)
    order_copy["_links"] = build_order_links(order)
    return order_copy

@app.get("/orders")
def list_orders(page: int = 1, limit: int = 10):
    items = list(orders.values())
    start = (page - 1) * limit
    end = start + limit
    page_items = items[start:end]
    
    # 列表的链接
    links = {
        "self": {"href": f"/orders?page={page}&limit={limit}", "method": "GET"},
        "first": {"href": f"/orders?page=1&limit={limit}", "method": "GET"},
        "last": {"href": f"/orders?page={(len(items) + limit - 1) // limit}&limit={limit}", "method": "GET"},
    }
    if page > 1:
        links["prev"] = {"href": f"/orders?page={page-1}&limit={limit}", "method": "GET"}
    if end < len(items):
        links["next"] = {"href": f"/orders?page={page+1}&limit={limit}", "method": "GET"}
    
    # 每个订单也带链接
    for item in page_items:
        item["_links"] = build_order_links(item)
    
    return {"data": page_items, "_links": links}
\`\`\`

### 6.4 状态转移端点

\`\`\`python
@app.post("/orders/{order_id}/payments")
def pay_order(order_id: int):
    order = orders.get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    if order["status"] != OrderStatus.pending:
        raise HTTPException(409, f"Cannot pay order in status {order['status']}")
    order["status"] = OrderStatus.paid
    return {"message": "Paid", "_links": build_order_links(order)}

@app.post("/orders/{order_id}/cancellations")
def cancel_order(order_id: int):
    order = orders.get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    if order["status"] not in (OrderStatus.pending,):
        raise HTTPException(409, f"Cannot cancel order in status {order['status']}")
    order["status"] = OrderStatus.cancelled
    return {"message": "Cancelled", "_links": build_order_links(order)}
\`\`\`

### 6.5 测试响应

\`\`\`bash
# 获取 pending 订单
curl http://localhost:8000/orders/1
\`\`\`

响应:

\`\`\`json
{
  "id": 1,
  "status": "pending",
  "amount": 100.0,
  "_links": {
    "self": {"href": "/orders/1", "method": "GET"},
    "pay": {"href": "/orders/1/payments", "method": "POST"},
    "cancel": {"href": "/orders/1/cancellations", "method": "POST"},
    "items": {"href": "/orders/1/items", "method": "GET"}
  }
}
\`\`\`

支付后:

\`\`\`bash
curl -X POST http://localhost:8000/orders/1/payments
\`\`\`

响应:

\`\`\`json
{
  "message": "Paid",
  "_links": {
    "self": {"href": "/orders/1", "method": "GET"},
    "ship": {"href": "/orders/1/shipments", "method": "POST"},
    "invoice": {"href": "/orders/1/invoice", "method": "GET"},
    "items": {"href": "/orders/1/items", "method": "GET"}
  }
}
\`\`\`

注意 \`pay\` 和 \`cancel\` 没了,新增了 \`ship\` 和 \`invoice\`。

## 七、HATEOAS 与 Richardson Level 3

### 7.1 Level 3 = HATEOAS

Richardson 成熟度模型的 Level 3 就是 HATEOAS。达到 Level 3 才是「严格意义上的 RESTful」。

### 7.2 Level 2 vs Level 3

| 维度 | Level 2 | Level 3 |
|------|---------|---------|
| URL | 客户端硬编码 | 服务器动态返回 |
| 状态机 | 客户端判断 | 服务器通过 links 表达 |
| 演化 | 改 URL 客户端崩 | 改 URL 客户端无感 |
| 复杂度 | 低 | 高 |
| 客户端 | 简单 | 复杂(动态发现) |
| 普及度 | 高 | 低 |

### 7.3 何时上 Level 3

考虑上 HATEOAS 的场景:

- **开放 API,长期演化**:URL 可能频繁调整,客户端无法及时更新
- **状态机复杂的业务**:订单、工作流、审批,可用操作随状态变化
- **Web 浏览器式客户端**:客户端就是浏览器,自然适合超媒体
- **IoT / 设备发现**:设备无法预先知道 API 结构,需要动态发现

不需要 HATEOAS 的场景:

- **内部 API,客户端可控**:URL 变了直接改客户端
- **简单 CRUD**:操作固定,没状态机
- **性能敏感**:响应体要小
- **移动端低带宽**:每字节都贵

## 八、HATEOAS 的常见误解

### 8.1 「HATEOAS = 加 _links 字段」

不对。HATEOAS 的核心是**客户端通过链接驱动状态**,而不是简单加字段。如果客户端还是硬编码 URL,只是响应里多了 \`_links\` 装饰,那是「假 HATEOAS」。

### 8.2 「HATEOAS 让 API 自文档化」

部分对。HATEOAS 让客户端知道「下一步能干啥」,但客户端还是要知道 \`rel\` 的语义、参数的含义,这些还是要文档。

### 8.3 「HATEOAS 必须用 HAL」

不对。HAL 只是一种格式,JSON-LD、Siren、Collection+JSON 都可以。甚至可以自定义格式。

### 8.4 「HATEOAS 让客户端零代码」

不对。客户端还是要写「读链接、调链接、处理响应」的逻辑。只是不用硬编码 URL。

## 九、HATEOAS 设计要点

### 9.1 链接关系(rel)的标准化

\`rel\` 应该用标准化词汇(IANA 注册的 link relations):

- \`self\` — 资源本身
- \`next\` / \`prev\` / \`first\` / \`last\` — 分页
- \`edit\` — 编辑
- \`delete\` — 删除
- \`collection\` — 所属集合

自定义 rel 用前缀避免冲突:\`myapp:pay\`、\`myapp:cancel\`。

### 9.2 链接要包含 method

有些链接是 GET,有些是 POST/PUT/DELETE。\`_links\` 应该明确 \`method\`,否则客户端不知道怎么调:

\`\`\`json
{
  "pay": {"href": "/orders/1001/payments", "method": "POST"}
}
\`\`\`

### 9.3 状态相关链接

链接应该**根据资源当前状态生成**:

- pending 订单:有 \`pay\` 链接
- paid 订单:没有 \`pay\` 链接(因为不能重复支付)

客户端看 \`_links\` 里有什么,就知道能干什么。

### 9.4 权限相关链接

链接还应该**根据当前用户权限生成**:

- 普通用户:看不到 \`delete\` 链接
- 管理员:有 \`delete\` 链接

这样客户端不用判断权限,服务器通过链接表达「你能干啥」。

### 9.5 入口点(Entry Point)

HATEOAS 需要一个**入口点**,客户端从这里开始,然后跟着链接走:

\`\`\`http
GET /api

→ 200 OK
{
  "_links": {
    "self": {"href": "/api"},
    "users": {"href": "/users"},
    "orders": {"href": "/orders"},
    "products": {"href": "/products"},
    "auth": {"href": "/auth/login"}
  }
}
\`\`\`

客户端只记 \`/api\`,其他都从这里发现。

## 十、易错点小结

| 易错点 | 错误示例 | 正确做法 | 影响 |
|--------|---------|---------|------|
| 假 HATEOAS | 加了 _links 但客户端还硬编码 URL | 客户端动态读链接 | 失去 HATEOAS 价值 |
| 链接不包含 method | 只有 href,客户端不知用 GET 还是 POST | 加 \`method\` 字段 | 客户端无法调用 |
| 状态无关链接 | 任何状态都有 pay 链接 | 状态变化时链接也变 | 客户端误操作 |
| 权限无关链接 | 普通用户也看到 delete 链接 | 链接根据权限生成 | 安全问题 |
| 没有入口点 | 客户端要硬编码所有 URL | 提供 \`/api\` 入口 | 客户端无法动态发现 |
| rel 不规范 | 自定义 rel 不加前缀 | 用 IANA 标准 或 \`myapp:xxx\` | rel 冲突 |
| 强行 HATEOAS | 内部 API 也上 HATEOAS | 内部 API 用 Level 2 即可 | 过度设计 |
| 链接用绝对 URL | \`https://api.example.com/orders/1\` | 用相对路径 \`/orders/1\` | 跨环境难复用 |
| 列表不带分页链接 | 列表响应没有 next/prev | 加分页链接 | 客户端要自己拼 URL |
| 链接里的参数不可见 | POST 链接没说需要什么 body | 用 Siren 的 fields 描述 | 客户端不知道怎么调 |

## 十一、本章小结

HATEOAS 是 REST 的最高境界,也是最具争议的特性。这一章我们讲了:

- HATEOAS:响应里包含下一步操作的链接,客户端动态发现
- 价值:解耦客户端与服务器 URL、状态驱动、演化友好
- 难点:客户端配合难、服务器实现复杂、工具链支持弱
- 超媒体格式:HAL(主流)、JSON-LD、Siren、Collection+JSON
- FastAPI 实现订单 HATEOAS,链接随状态变化
- Level 3 = HATEOAS,但 Level 2 是务实目标

下一章我们讲 RESTful 认证与安全,涵盖 JWT、OAuth 2.0、CORS、限流等核心话题。
`,
  },
  {
    id: "pyarch-rest-auth-security",
    icon: "🔐",
    title: "RESTful 认证与安全",
    group: "RESTful API 设计",
    content: `# RESTful 认证与安全

## 一、认证 vs 授权

两个概念经常被混淆,必须先分清:

### 1.1 定义

- **认证(Authentication,AuthN)**:你是谁?验证身份的过程。如登录、token 校验。
- **授权(Authorization,AuthZ)**:你能干啥?验证权限的过程。如「这个用户能访问这个资源吗?」

### 1.2 类比

- 进大楼刷工牌 = 认证(你是谁)
- 进大楼后,某个房间只允许特定人进 = 授权(你能进哪)

### 1.3 流程

\`\`\`
客户端 → [输入凭证] → 服务器认证(AuthN)→ 服务器授权(AuthZ)→ 返回资源或 403
\`\`\`

认证失败 → 401 Unauthorized(实际应叫 Unauthenticated)
授权失败 → 403 Forbidden

## 二、认证方式

### 2.1 Basic Auth

最简单的 HTTP 认证,客户端在 \`Authorization\` 头放 \`Base64(username:password)\`:

\`\`\`http
GET /users/42 HTTP/1.1
Authorization: Basic YWxpY2U6cGFzc3dvcmQ=
\`\`\`

\`YWxpY2U6cGFzc3dvcmQ=\` 是 \`alice:password\` 的 Base64。

**优点**:

- 极简,所有 HTTP 客户端都支持
- 无状态

**缺点**:

- **每次请求都传密码**:中间人攻击风险
- **Base64 不加密**:只是编码,HTTPS 下才安全
- **无法主动失效**:改密码才能失效所有会话
- **密码明文存储风险**:服务器要校验密码

**适用**:

- 内部 API、调试
- 不推荐生产环境(除非加 HTTPS + 强密码策略)

### 2.2 Session/Cookie(传统 Web)

服务器创建 session,客户端用 cookie 携带 session id:

\`\`\`http
# 登录
POST /login
{"username": "alice", "password": "..."}

→ 200 OK
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict
\`\`\`

后续请求:

\`\`\`http
GET /users/42 HTTP/1.1
Cookie: session_id=abc123
\`\`\`

**优点**:

- 浏览器原生支持,体验好
- 服务器可主动失效 session
- 适合传统 Web 应用

**缺点**:

- **有状态**:服务器要存 session,水平扩展需 sticky session 或共享 session 存储
- **CSRF 风险**:cookie 自动发送,易被 CSRF 攻击
- **跨域麻烦**:cookie 跨域需要 CORS + SameSite 配置
- **移动端不友好**:移动端管理 cookie 复杂

**适用**:传统 Web 应用(服务器渲染页面)。

### 2.3 Token / JWT(无状态)

客户端登录后获得 token,后续请求在 \`Authorization\` 头携带:

\`\`\`http
POST /auth/login
{"username": "alice", "password": "..."}

→ 200 OK
{"access_token": "eyJhbGciOi...", "token_type": "bearer"}
\`\`\`

后续:

\`\`\`http
GET /users/42 HTTP/1.1
Authorization: Bearer eyJhbGciOi...
\`\`\`

**优点**:

- **无状态**:服务器不存 token,token 自包含
- **跨域友好**:token 在头里,不依赖 cookie
- **移动端友好**:简单存 token 即可
- **可跨服务**:微服务之间共用 token

**缺点**:

- **无法主动失效**:token 颁发后到过期前都有效(除非黑名单)
- **续签复杂**:需要 refresh token 机制
- **token 大**:比 session_id 大得多
- **存储责任在客户端**:客户端要安全存 token

**适用**:现代 API、SPA、移动端、微服务。

### 2.4 OAuth 2.0(第三方授权)

用于「让第三方应用访问用户数据,但不交出密码」:

\`\`\`
用户 → 第三方应用 → 用户授权 → 服务器颁发 access token → 第三方用 token 访问
\`\`\`

例如「用 GitHub 登录」、「授权某 app 访问你的 Google 通讯录」。

**优点**:

- 不暴露密码给第三方
- 细粒度权限(scope)
- 可随时撤销授权

**缺点**:

- 协议复杂
- 多种流程(authorization code、implicit、password、client credentials)

**适用**:第三方授权、SSO、开放平台。

### 2.5 API Key

简单的长字符串,在请求头或查询参数携带:

\`\`\`http
GET /users/42 HTTP/1.1
X-API-Key: abc123xyz
\`\`\`

或:

\`\`\`http
GET /users/42?api_key=abc123xyz
\`\`\`

**优点**:

- 极简
- 适合服务间调用、开发者 API

**缺点**:

- **无法细粒度授权**:一个 key 通常对应一个账号全部权限
- **泄露风险大**:key 一泄露,全权限被窃
- **难以撤销**:撤销 key 影响所有调用

**适用**:开发者 API、内部服务、低敏感场景。

### 2.6 五种方式对比

| 方式 | 状态 | 安全性 | 复杂度 | 适用场景 |
|------|------|--------|--------|---------|
| Basic Auth | 无状态 | 低 | 低 | 内部、调试 |
| Session/Cookie | 有状态 | 中 | 中 | 传统 Web |
| Token/JWT | 无状态 | 中高 | 中 | 现代 API、SPA、移动 |
| OAuth 2.0 | 无状态 | 高 | 高 | 第三方授权、SSO |
| API Key | 无状态 | 低 | 低 | 开发者 API、内部 |

## 三、JWT 详解

JWT(JSON Web Token)是现代 API 最常用的 token 格式。

### 3.1 三段结构

JWT 由三部分组成,用 \`.\` 分隔:

\`\`\`
Header.Payload.Signature
\`\`\`

**Header**:声明 token 类型和签名算法

\`\`\`json
{"alg": "HS256", "typ": "JWT"}
\`\`\`

Base64URL 编码后:\`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\`

**Payload**:声明(claims),如用户 id、过期时间

\`\`\`json
{"sub": "42", "name": "Alice", "role": "admin", "exp": 1700000000}
\`\`\`

Base64URL 编码后:\`eyJzdWIiOiI0MiIsIm5hbWUiOiJBbGljZSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0\`

**Signature**:签名,防止 token 被篡改

\`\`\`
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
\`\`\`

完整 JWT:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBbGljZSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### 3.2 标准 Claims

JWT 标准 claims(RFC 7519):

| Claim | 含义 |
|-------|------|
| \`iss\` | issuer,签发方 |
| \`sub\` | subject,主体(通常是用户 id) |
| \`aud\` | audience,接收方 |
| \`exp\` | expiration time,过期时间 |
| \`nbf\` | not before,生效时间 |
| \`iat\` | issued at,签发时间 |
| \`jti\` | JWT ID,唯一标识 |

### 3.3 JWT 优点

- **无状态**:服务器不存 token,token 自包含用户信息
- **跨域**:token 在头里,不依赖 cookie
- **跨服务**:微服务共用同一密钥即可校验
- **移动端友好**:简单存取

### 3.4 JWT 缺点

- **无法主动失效**:颁发后到 \`exp\` 前都有效,要失效需黑名单(又变有状态了)
- **续签复杂**:token 过期后要重新颁发,体验差,需要 refresh token
- **payload 不加密**:Base64 编码,不是加密,不要放敏感信息
- **token 大**:比 session_id 大得多,每请求都传,带宽开销
- **重放攻击**:token 被窃取,在有效期内可被滥用

### 3.5 access token + refresh token 模式

为解决「JWT 无法主动失效」和「续签复杂」,引入双 token:

- **access token**:短期(15 分钟-1 小时),用于 API 访问
- **refresh token**:长期(7-30 天),用于换取新的 access token

流程:

\`\`\`
1. 登录 → 颁发 access token (短期) + refresh token (长期)
2. 客户端用 access token 调 API
3. access token 过期 → 客户端用 refresh token 换新的 access token
4. refresh token 过期或被撤销 → 用户重新登录
\`\`\`

优势:

- access token 短期,即使泄露损失小
- refresh token 可在服务器存(可撤销),平衡无状态与可控性
- 用户体验好(7 天内不用重新登录)

### 3.6 JWT 安全要点

- **用 HTTPS**:JWT 在传输中必须加密,否则 token 被窃听
- **不在 payload 放敏感信息**:Base64 不是加密,任何人可解码
- **设置短 \`exp\`**:access token 15 分钟-1 小时
- **强密钥**:HS256 密钥至少 256 位,不要用弱密钥
- **算法白名单**:服务器只允许指定算法,防止 alg=none 攻击
- **存 refresh token 黑名单**:可主动失效

## 四、OAuth 2.0 流程

OAuth 2.0 定义了四种授权流程(grant type),不同场景用不同流程。

### 4.1 授权码模式(Authorization Code)— 最常用

适合「有后端的 Web 应用」:

\`\`\`
1. 用户点「用 GitHub 登录」
   → 重定向到 GitHub 授权页
   https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=user:email

2. 用户在 GitHub 点「授权」
   → GitHub 重定向回应用,带 code
   https://myapp.com/callback?code=abc123

3. 应用后端用 code 换 access token
   POST https://github.com/login/oauth/access_token
   {"client_id": "xxx", "client_secret": "yyy", "code": "abc123"}
   → {"access_token": "xxx", "token_type": "bearer"}

4. 应用用 access token 调 GitHub API
   GET https://api.github.com/user
   Authorization: Bearer xxx
\`\`\`

**为什么用 code 换 token**:code 是短期的、一次性的,通过后端换取 token,避免 token 直接走浏览器(易泄露)。

### 4.2 客户端模式(Client Credentials)

适合「服务间调用」,无用户参与:

\`\`\`
POST /oauth/token
Authorization: Basic base64(client_id:client_secret)
{"grant_type": "client_credentials"}

→ {"access_token": "xxx", "expires_in": 3600}
\`\`\`

服务器 A 调服务器 B,直接用 client_id + client_secret 换 token。

### 4.3 密码模式(Password)— 已废弃

用户直接给应用密码,应用换 token:

\`\`\`
POST /oauth/token
{"grant_type": "password", "username": "alice", "password": "..."}

→ {"access_token": "xxx"}
\`\`\`

**已废弃**:OAuth 2.1 移除了密码模式,因为应用接触用户密码,不安全。

### 4.4 三种流程对比

| 流程 | 用户参与 | 客户端类型 | 安全性 | 适用 |
|------|---------|-----------|--------|------|
| 授权码 | 是 | Web、移动 | 高 | 第三方登录 |
| 客户端模式 | 否 | 服务间 | 中 | 微服务调用 |
| 密码模式(废弃) | 是 | 受信应用 | 低 | 已废弃 |

## 五、CORS 跨域

### 5.1 同源策略

浏览器有**同源策略**:JS 默认不能跨域请求(协议、域名、端口任一不同即跨域)。

\`http://localhost:3000\` 调 \`http://localhost:8000\` 是跨域(端口不同)。

### 5.2 CORS 机制

CORS(Cross-Origin Resource Sharing)是浏览器与服务器的协议,允许服务器显式声明「允许哪些跨域请求」。

### 5.3 简单请求 vs 预检请求

**简单请求**(GET/POST + 简单头)直接发送,服务器响应带 \`Access-Control-Allow-Origin\`。

**预检请求**(PUT/DELETE/自定义头)先发 OPTIONS:

\`\`\`http
OPTIONS /users HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
\`\`\`

服务器响应:

\`\`\`http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
\`\`\`

预检通过,浏览器才发真实请求。

### 5.4 关键 CORS 头

| 头 | 作用 |
|----|------|
| \`Access-Control-Allow-Origin\` | 允许的源(\`*\` 或具体域名) |
| \`Access-Control-Allow-Methods\` | 允许的方法 |
| \`Access-Control-Allow-Headers\` | 允许的请求头 |
| \`Access-Control-Allow-Credentials\` | 是否允许带 cookie |
| \`Access-Control-Max-Age\` | 预检结果缓存时间 |

**注意**:\`Access-Control-Allow-Origin: *\` 和 \`Access-Control-Allow-Credentials: true\` 不能同时用。带 cookie 必须指定具体域名。

## 六、安全要点

### 6.1 HTTPS 强制

所有 API 必须走 HTTPS。HTTP 下的 token、密码、敏感数据都可被中间人窃听。

- 服务器只开 443,不开 80
- HTTP 请求 301 重定向到 HTTPS
- 用 HSTS 头强制浏览器走 HTTPS:\`Strict-Transport-Security: max-age=31536000\`

### 6.2 速率限制(Rate Limiting)

防止暴力破解、爬虫、DoS。常见策略:

- **IP 限流**:每个 IP 每分钟 100 次
- **用户限流**:每个用户每分钟 60 次
- **接口限流**:登录接口每 IP 每小时 10 次(防爆破)

响应头:

\`\`\`http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
\`\`\`

超限:

\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
\`\`\`

### 6.3 输入校验

**永远不信任客户端输入**。所有输入必须校验:

- 类型校验(整数、字符串、日期)
- 长度校验(防超长字符串攻击)
- 范围校验(数值范围、日期范围)
- 格式校验(email、URL、UUID)

FastAPI 用 Pydantic 自动校验,省心。

### 6.4 SQL 注入防护

**反例**(字符串拼接):

\`\`\`python
@app.get("/users/{name}")
def get_user(name: str):
    sql = f"SELECT * FROM users WHERE name = '{name}'"  # 危险!
    return db.execute(sql)
\`\`\`

客户端传 \`'; DROP TABLE users; --\`,SQL 注入。

**正例**(参数化查询):

\`\`\`python
@app.get("/users/{name}")
def get_user(name: str):
    sql = "SELECT * FROM users WHERE name = ?"
    return db.execute(sql, (name,))
\`\`\`

ORM(SQLAlchemy)默认参数化,基本免疫 SQL 注入。

### 6.5 CSRF 防护(Cookie 模式)

如果用 cookie 认证,要防 CSRF(跨站请求伪造):

- **SameSite cookie**:\`SameSite=Strict\` 或 \`Lax\`,阻止跨站 cookie
- **CSRF token**:服务器发 token,客户端表单带上,服务器校验
- **校验 Referer/Origin**:只接受同源请求

Token 模式(API 用 \`Authorization\` 头)天然免疫 CSRF,因为浏览器不会自动加 \`Authorization\` 头。

### 6.6 其他安全实践

- **密码哈希**:用 bcrypt/argon2,不用 MD5/SHA1
- **日志脱敏**:不日志记录密码、token
- **错误信息**:不暴露内部细节(如堆栈)给客户端
- **依赖更新**:定期更新依赖,修补 CVE
- **审计日志**:敏感操作记录审计日志

## 七、Python 实战:完整 JWT 认证

### 7.1 安装依赖

\`\`\`bash
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart slowapi
\`\`\`

### 7.2 配置与工具

\`\`\`python
from fastapi import FastAPI, HTTPException, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Optional, List
from datetime import datetime, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from enum import Enum

# 配置
SECRET_KEY = "your-secret-key-change-in-production-at-least-32-chars"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Secure API")

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 限流器
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
\`\`\`

### 7.3 用户与权限模型

\`\`\`python
from enum import Enum
class Role(str, Enum):
    admin = "admin"
    user = "user"

class User(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: Role
    hashed_password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: Role

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

# 内存存储
users_db: dict[str, User] = {
    "alice": User(
        id=1, username="alice", email="alice@x.com",
        role=Role.admin,
        hashed_password=pwd_context.hash("secret123")
    ),
    "bob": User(
        id=2, username="bob", email="bob@x.com",
        role=Role.user,
        hashed_password=pwd_context.hash("secret456")
    ),
}
\`\`\`

### 7.4 JWT 工具函数

\`\`\`python
from typing import Optional
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """校验 JWT,返回 payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def authenticate_user(username: str, password: str) -> Optional[User]:
    """用户名密码认证"""
    user = users_db.get(username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user
\`\`\`

### 7.5 依赖注入:认证与授权

\`\`\`python
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """认证依赖:校验 token,返回当前用户"""
    payload = verify_token(token)
    username = payload.get("sub")
    if not username or username not in users_db:
        raise HTTPException(401, "Invalid token")
    return users_db[username]

def require_role(*roles: Role):
    """授权依赖:要求特定角色"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(403, "Permission denied")
        return current_user
    return role_checker
\`\`\`

### 7.6 登录端点(带限流)

\`\`\`python
@app.post("/auth/login", response_model=Token)
@limiter.limit("5/minute")  # 登录接口限流:每 IP 每分钟 5 次
def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    """登录 → 颁发 JWT"""
    user = authenticate_user(form.username, form.password)
    if not user:
        raise HTTPException(401, "用户名或密码错误")
    token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
\`\`\`

### 7.7 受保护端点

\`\`\`python
@app.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户 — 任意已认证用户"""
    return current_user

@app.get("/admin/users", response_model=List[UserOut])
def list_users(current_user: User = Depends(require_role(Role.admin))):
    """列出所有用户 — 仅 admin"""
    return list(users_db.values())

@app.delete("/admin/users/{username}")
def delete_user(
    username: str,
    current_user: User = Depends(require_role(Role.admin))
):
    """删除用户 — 仅 admin"""
    if username not in users_db:
        raise HTTPException(404, "用户不存在")
    if username == current_user.username:
        raise HTTPException(400, "不能删除自己")
    del users_db[username]
    return {"message": f"用户 {username} 已删除"}
\`\`\`

### 7.8 CORS 中间件

\`\`\`python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
\`\`\`

注意:

- \`allow_origins\` 指定具体域名,不用 \`*\`(配合 credentials 必须具体)
- \`allow_credentials=True\` 允许 cookie
- \`allow_methods\` 明确列出
- \`allow_headers\` 明确列出

### 7.9 全局限流

\`\`\`python
@app.get("/users/{user_id}")
@limiter.limit("60/minute")  # 每用户每分钟 60 次
def get_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """获取用户 — 限流 60/分钟"""
    user = users_db.get(...)
    if not user:
        raise HTTPException(404, "用户不存在")
    return user
\`\`\`

### 7.10 测试完整流程

\`\`\`bash
# 1. 登录
curl -X POST http://localhost:8000/auth/login \\
  -d "username=alice&password=secret123"
# → {"access_token": "eyJ...", "token_type": "bearer", "expires_in": 1800}

# 2. 不带 token 访问受保护端点
curl http://localhost:8000/me
# → 401 Unauthorized

# 3. 带 token 访问
curl http://localhost:8000/me \\
  -H "Authorization: Bearer eyJ..."
# → {"id": 1, "username": "alice", ...}

# 4. 普通用户访问 admin 端点
# 用 bob 登录,然后:
curl http://localhost:8000/admin/users \\
  -H "Authorization: Bearer <bob_token>"
# → 403 Forbidden

# 5. admin 访问
curl http://localhost:8000/admin/users \\
  -H "Authorization: Bearer <alice_token>"
# → 200,用户列表

# 6. 限流测试(连续 6 次登录)
for i in 1..6; do
  curl -X POST http://localhost:8000/auth/login -d "username=alice&password=wrong"
done
# 第 6 次 → 429 Too Many Requests
\`\`\`

## 八、认证流程完整图

\`\`\`
1. 客户端 → POST /auth/login (username + password)
2. 服务器 → 校验密码,生成 JWT
3. 服务器 → 返回 {access_token, token_type, expires_in}
4. 客户端 → 存储 token(localStorage / memory)
5. 客户端 → 每请求带 Authorization: Bearer <token>
6. 服务器 → 校验 token (签名 + exp)
7. 服务器 → 取出 sub (用户 id) → 加载用户
8. 服务器 → 授权检查 (role)
9. 服务器 → 返回资源 或 401 / 403
\`\`\`

## 九、refresh token 实现要点

### 9.1 颁发双 token

\`\`\`python
@app.post("/auth/login")
def login(...):
    user = authenticate_user(...)
    if not user:
        raise HTTPException(401)
    return {
        "access_token": create_access_token({"sub": user.username}, timedelta(minutes=30)),
        "refresh_token": create_refresh_token({"sub": user.username}, timedelta(days=7)),
        "token_type": "bearer",
    }
\`\`\`

### 9.2 刷新端点

\`\`\`python
@app.post("/auth/refresh")
def refresh(refresh_token: str):
    """用 refresh token 换新 access token"""
    payload = verify_token(refresh_token)
    if not is_valid_refresh_token(refresh_token):
        raise HTTPException(401, "Invalid refresh token")
    return {
        "access_token": create_access_token({"sub": payload["sub"]}, timedelta(minutes=30)),
    }
\`\`\`

### 9.3 撤销 refresh token

refresh token 应该在服务器存(数据库或 Redis),可主动撤销:

\`\`\`python
@app.post("/auth/logout")
def logout(refresh_token: str, current_user = Depends(get_current_user)):
    """登出 → 撤销 refresh token"""
    revoke_refresh_token(refresh_token)
    return {"message": "已登出"}
\`\`\`

access token 短期(30 分钟),即使没撤销,过期就失效。refresh token 长期但可撤销,平衡了无状态和可控性。

## 十、安全检查清单

| 项目 | 检查点 |
|------|--------|
| HTTPS | 全站强制 HTTPS |
| 认证 | token 而非 cookie(移动/API) |
| 授权 | 角色权限检查 |
| 密码 | bcrypt/argon2 哈希 |
| 限流 | 登录接口 + API 接口 |
| CORS | 具体域名,不滥用 * |
| 输入校验 | Pydantic 自动校验 |
| SQL 防注入 | 参数化查询 / ORM |
| 错误处理 | 不泄露内部细节 |
| 日志 | 脱敏记录,不记密码 token |
| 依赖 | 定期更新,修 CVE |
| CSRF | token 模式天然免疫,cookie 模式要防 |
| JWT | 短 exp,强密钥,算法白名单 |
| refresh token | 服务器存,可撤销 |

## 十一、易错点小结

| 易错点 | 错误示例 | 正确做法 | 影响 |
|--------|---------|---------|------|
| HTTP 传 token | 用 HTTP 而非 HTTPS | 强制 HTTPS | token 被窃听 |
| 401 当 403 | 无权限返回 401 | 401 未认证,403 无权限 | 客户端误判 |
| Basic Auth 用于生产 | 公开 API 用 Basic Auth | 用 JWT 或 OAuth | 密码泄露风险 |
| payload 放密码 | JWT payload 存密码 | Base64 可解码,不放敏感信息 | 信息泄露 |
| JWT alg=none | 不校验算法 | 算法白名单 | token 伪造 |
| 弱密钥 | JWT 密钥用 "secret" | 至少 256 位随机 | 密钥爆破 |
| CORS 设 * | allow_origins=["*"] + credentials | 具体域名 | 跨域攻击 |
| 不限流 | 登录接口不限流 | 5-10 次/分钟 | 暴力破解 |
| 字符串拼 SQL | f"SELECT ... {name}" | 参数化查询 | SQL 注入 |
| cookie 不设 SameSite | Set-Cookie 不带 SameSite | SameSite=Lax/Strict | CSRF |
| access token 长期 | access token 7 天 | 30 分钟 + refresh token | token 泄露损失大 |
| 不校验 token 过期 | 不校验 exp | 严格校验 exp | 永久 token |
| 错误暴露堆栈 | 500 返回堆栈 | 通用错误信息 + 日志 | 信息泄露 |
| 密码明文存 | 数据库存明文密码 | bcrypt 哈希 | 数据库泄露灾难 |

## 十二、本章小结

认证与安全是 API 的生命线。这一章我们讲了:

- 认证(AuthN)vs 授权(AuthZ)的区别
- 五种认证方式:Basic Auth、Session/Cookie、Token/JWT、OAuth 2.0、API Key
- JWT 三段结构与 access/refresh token 模式
- OAuth 2.0 三种流程:授权码、客户端、密码(废弃)
- CORS 跨域机制与预检请求
- 安全要点:HTTPS、限流、输入校验、SQL 防注入、CSRF
- FastAPI 完整实现:JWT + 角色 + CORS + 限流

至此,RESTful API 设计的六章全部讲完。从 REST 基础 → URI 设计 → HTTP 方法状态码 → 版本控制 → HATEOAS → 认证安全,你应该已经具备设计一个生产级 RESTful API 的完整知识。
`,
  },
];

