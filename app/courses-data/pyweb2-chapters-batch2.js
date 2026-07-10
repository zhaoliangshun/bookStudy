// =============================================================
// Python Web 后端开发实战教程 - 第 2 批章节（RESTful API 设计 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   pyweb2-rest-principles : REST 六大约束与设计原则
//   pyweb2-rest-resources  : 资源建模与 URI 设计
//   pyweb2-rest-methods    : HTTP 方法语义与 CRUD 映射
//   pyweb2-rest-status-codes : 状态码规范使用
//   pyweb2-rest-advanced   : 版本控制、HATEOAS 与错误格式
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，REST 设计原则长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：REST 六大约束与设计原则
  // ============================================================
  {
    id: "pyweb2-rest-principles",
    group: "RESTful API 设计",
    icon: "📐",
    title: "REST 六大约束与设计原则",
    content: `# REST 六大约束与设计原则

## REST 到底是什么

REST 全称 **Representational State Transfer**（表现层状态转化），是 2000 年 Roy Fielding 在他著名的博士论文里提出的一种**网络软件架构风格**。注意这个词：架构风格（architectural style），不是协议，不是标准，而是一组设计原则。

把名字拆开理解：

- **Representational（表现层）**：资源在网络上以某种「表现形式」呈现，比如 JSON、XML、HTML。同一个「用户资源」可以表现为 JSON 也可以表现为 HTML。
- **State（状态）**：资源在某时刻的快照。用户现在的昵称、邮箱、积分，就是用户资源当前的状态。
- **Transfer（转化）**：客户端和服务器之间传递这种状态。一次 HTTP 请求，就是一次状态转化。

合起来：**客户端通过操作资源的「表现层」来改变或获取资源的「状态」，这个传递过程就是 REST**。

打个比方：你把「用户」看作一个资源，它在服务器上有自己的状态（姓名、年龄）。客户端发请求，服务器把用户当前状态用 JSON 这种表现形式「传」给你；你发个 PUT 请求改了昵称，就是让资源状态发生了「转化」。这就是 REST 的字面含义。

## 为什么要有 REST

在 REST 出现之前，Web 服务主流是 **SOAP**（Simple Object Access Protocol）和 **XML-RPC**。它们很重：

- SOAP 用 XML 包一堆信封，光头部就几十行。
- 接口设计像「远程调用函数」，比如 \`getUserInfo(id)\`、\`createOrder(orderData)\`，客户端要预先知道有哪些方法。
- 跨语言、跨平台时很折腾。

REST 的思路完全不同：**别想着「调用服务器的函数」，而是想着「操作网络上的资源」**。资源有地址（URI），用标准方法（GET/POST/PUT/DELETE）去操作它，用通用格式（JSON）表现它。这样：

- 接口统一、可预测：看到 \`/users/123\` 你就知道是「编号 123 的用户」。
- 用 HTTP 原生能力：方法、状态码、头部，不用额外造轮子。
- 松耦合：客户端不用知道服务器内部有哪些函数，只要认 URI 和方法。
- 可缓存、可分层、可扩展。

这就是为什么今天绝大多数公开 API（GitHub、Twitter、Stripe）都用 REST 风格。

## REST 的六大约束

REST 严格说有六个约束（constraints）。满足这些约束，才算「RESTful」。我们一个一个看。

### 约束 1：客户端-服务器（Client-Server）

**分离客户端和服务器的关注点**。客户端负责用户界面和交互，服务器负责数据存储和业务逻辑，两者通过统一的接口通信。

为什么要分离？

- 客户端（前端）可以独立演进，换个 App、换个网页，服务器不用动。
- 服务器可以独立优化（数据库、缓存、负载均衡），客户端无感知。
- 多端复用：同一套 API 服务 Web、iOS、Android。

违反示例：服务器直接返回一段 HTML 里面混着数据和样式，客户端没法解析出「纯数据」。这是早期 CGI 脚本的做法，不是 REST。

### 约束 2：无状态（Stateless）

**服务器不保存客户端的会话状态**。每次请求必须包含处理它所需的全部信息，服务器收到请求后不依赖「之前那次请求」留下的状态。

注意：无状态不是说服务器不能有数据。用户数据当然存在数据库里。无状态指的是「**服务器内存里不存『这次会话进行到哪一步了』这种上下文**」。

举例对比：

| 有状态（违反 REST） | 无状态（符合 REST） |
|--------------------|--------------------|
| 登录后服务器存 \`session["current_user_id"] = 42\`，后续请求靠 session 识别身份 | 登录返回一个 Token，后续请求每次都带上 \`Authorization: Bearer <token>\` |
| 分页时服务器记住「你看到第 2 页了」 | 分页参数放在 URL：\`/users?page=3\`，每次请求自带 |

无状态的好处：

- **可扩展性**：任意一台服务器都能处理任意请求，加机器就行（水平扩展）。有状态的话请求必须路由到「记住你的那台」。
- **可见性**：请求自带全部信息，方便调试、缓存、重放。
- **可靠性**：一台服务器挂了，其他服务器照样能处理请求。

无状态的代价：每次请求都带认证信息、传输体积大一点；某些场景（多步流程）实现起来稍麻烦。

但「完全无状态」有时不现实，所以实践中 REST API 常用 **Token（JWT）** 来「把状态塞到请求里」，本质还是无状态的。

### 约束 3：可缓存（Cacheable）

**响应必须明确标识是否可缓存、缓存多久**。客户端可以复用缓存，减少重复请求，提升性能、降低服务器压力。

HTTP 用 \`Cache-Control\`、\`ETag\`、\`Last-Modified\` 等头部控制缓存。REST 要求服务器在响应里说清楚「这个能不能缓存」，不能让客户端瞎猜。

| 响应类型 | 缓存策略 |
|----------|----------|
| GET /users（公开列表） | 可缓存，\`Cache-Control: max-age=60\` |
| GET /users/123/profile（个人资料） | 可短时缓存 |
| POST /orders（下单） | 不可缓存 |
| GET /users/me（当前用户，含敏感信息） | \`Cache-Control: no-store\` |

违反示例：返回了用户余额却不设缓存头，导致代理服务器误缓存了私密数据。

### 约束 4：统一接口（Uniform Interface）

这是 REST **最核心**的约束。接口要统一、可预测，核心有四条子原则：

1. **资源识别（Identification of resources）**：用 URI 标识资源，比如 \`/users/123\`。
2. **通过表现层操作资源（Manipulation of resources through representations）**：客户端拿到资源的 JSON 表现，修改后再 PUT 回去，服务器据此更新资源。客户端不用知道服务器内部怎么存。
3. **自描述消息（Self-descriptive messages）**：每个消息要说明自己是什么（\`Content-Type: application/json\`）、怎么处理（\`Cache-Control\`），服务器不用靠「上下文」猜。
4. **超媒体作为应用状态引擎（HATEOAS）**：响应里带上「下一步能干什么」的链接。客户端通过这些链接驱动流程，而不是硬编码 URL。（这条最难，后面专门讲。）

统一接口的好处：换一个 REST API，学习成本极低，因为套路都一样——名词 URI + 标准方法。

### 约束 5：分层系统（Layered System）

**客户端不需要知道它直接连的是服务器，还是中间的代理、网关、负载均衡**。每一层只和相邻层打交道。

典型分层：

\`\`\`
客户端 → CDN → 反向代理(Nginx) → API 网关 → 应用服务器 → 缓存(Redis) → 数据库
\`\`\`

客户端以为自己在和服务器说话，其实中间经过了好几层。每一层各司其职：CDN 缓存静态资源、Nginx 做负载均衡、网关做鉴权。分层让系统可扩展、可替换，但对客户端透明。

### 约束 6：按需代码（Code on Demand）——可选

服务器可以临时下发可执行代码（比如 JavaScript）让客户端执行。这是**唯一可选**的约束，绝大多数 REST API 不用它。它是为浏览器场景设计的（服务器下发 JS 丰富客户端能力）。后端 API 一般忽略这条。

## RESTful vs 非 RESTful 对比

光说约束太抽象，直接看对比。

**非 RESTful 风格（RPC 风格，把动作塞进 URL）：**

\`\`\`http
POST /getUserInfo?id=123 HTTP/1.1
Host: api.example.com

POST /createUser HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name": "Tom"}

POST /deleteUserById HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"id": 123}

POST /updateUserName HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"id": 123, "name": "Jerry"}
\`\`\`

问题：URL 里全是动词，方法全是 POST，看不出意图；接口名五花八门（getUserInfo vs queryUser vs fetchUser），客户端要记一堆；没法用缓存（POST 不可缓存）。

**RESTful 风格（资源 + 标准方法）：**

\`\`\`http
GET /users/123 HTTP/1.1
Host: api.example.com

POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name": "Tom"}

DELETE /users/123 HTTP/1.1
Host: api.example.com

PATCH /users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name": "Jerry"}
\`\`\`

一目了然：URI 是名词（users），方法表达意图（GET 取、POST 建、DELETE 删、PATCH 改）。统一、可预测、可缓存。

对比总结表：

| 维度 | RPC 风格（非 REST） | RESTful 风格 |
|------|---------------------|--------------|
| URL | 动词为主：\`/getUser\` | 名词为主：\`/users/123\` |
| HTTP 方法 | 几乎全用 POST | GET/POST/PUT/PATCH/DELETE 各司其职 |
| 语义 | URL 里看不出意图 | 方法 + URL 直接表达意图 |
| 可缓存 | 难（POST 不缓存） | GET 可缓存 |
| 学习成本 | 每个接口都要单独记 | 套路统一，举一反三 |
| 典型代表 | SOAP、gRPC | GitHub API、Stripe API |

## 资源导向思维：URI 是名词不是动词

这是 REST 和 RPC 最大的思维差异。**REST 把一切抽象成「资源」，URI 是资源的「地址」，应该是名词（通常复数），不是动词。**

为什么是名词？因为 URI 标识的是「东西」，不是「动作」。动作由 HTTP 方法表达。

| ❌ 错误（动词在 URL） | ✅ 正确（名词 + 方法） |
|----------------------|----------------------|
| POST /createUser | POST /users |
| POST /deleteUser/123 | DELETE /users/123 |
| GET /getUserList | GET /users |
| POST /updateUserName | PATCH /users/123 |
| GET /searchPosts | GET /posts?keyword=rest |

什么时候 URL 里「可以」有动词？某些「非 CRUD」的操作不好用纯名词表达，比如「激活用户」「发布文章」。这时有两种做法：

1. 把动作建模成子资源（推荐）：\`POST /users/123/activation\`（创建一个「激活」动作资源）。
2. 当作动词处理（务实）：\`POST /users/123/activate\`。算「不太纯」的 REST，但工程上能接受。

务实建议：**资源导向是原则，不是教条**。少数实在不好建模的操作，稍微变通没问题，别为了「纯 REST」把接口设计得很别扭。

## Richardson 成熟度模型（RMM）

Martin Fowler 提出的 **Richardson Maturity Model** 把 REST 的成熟度分成 4 级（0-3），衡量你的 API 有多「RESTful」。

| 级别 | 名称 | 要求 | 例子 |
|------|------|------|------|
| Level 0 | POX（Plain Old XML/HTTP） | 用 HTTP 传消息，但只有 POST，URL 是单一端点 | SOAP over HTTP：所有请求都 POST 到 \`/api\` |
| Level 1 | 资源 | 引入资源 URI，但方法还是乱用 | 多个 URI：\`/users\`、\`/orders\`，但全用 POST |
| Level 2 | HTTP 动词 | 正确使用 HTTP 方法和状态码 | GET/POST/PUT/DELETE 各司其职，用 201/404 等 |
| Level 3 | HATEOAS | 响应里带超媒体链接，驱动流程 | 返回资源同时返回「下一步」的链接 |

**Level 0 → 1**：从「一个大端点」到「多个资源 URI」。

Level 0 示例（所有操作都打到同一个 URL）：

\`\`\`http
POST /api HTTP/1.1
Content-Type: application/json

{"action": "getUser", "id": 123}

POST /api HTTP/1.1
Content-Type: application/json

{"action": "createUser", "name": "Tom"}
\`\`\`

**Level 1 → 2**：开始用对的方法和状态码。绝大多数「自称 RESTful」的 API 停在 Level 2，这已经够好了。

Level 2 示例：

\`\`\`http
GET /users/123 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 123, "name": "Tom"}

POST /users HTTP/1.1
Content-Type: application/json

{"name": "Tom"}

HTTP/1.1 201 Created
Location: /users/124
\`\`\`

**Level 2 → 3**：加上 HATEOAS。响应里带链接，客户端「跟着链接走」，不硬编码 URL。

Level 3 示例：

\`\`\`http
GET /users/123 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Tom",
  "links": {
    "self": {"href": "/users/123", "method": "GET"},
    "update": {"href": "/users/123", "method": "PATCH"},
    "delete": {"href": "/users/123", "method": "DELETE"},
    "orders": {"href": "/users/123/orders", "method": "GET"}
  }
}
\`\`\`

客户端不知道这些 URL 也行——它从响应的 links 里找「update」就能改，找「orders」就能看订单。服务器改了 URL 结构，客户端不用跟着改。

> 实践建议：**Level 2 是性价比最高的目标**。Level 3 理论很美，但工程上开销大、客户端实现复杂，真正用 HATEOAS 的公开 API 不多。除非你的场景特别需要「自发现」（比如给第三方集成的开放平台），否则做到 Level 2 就够。

## 何时该用 REST，何时不该用

REST 不是银弹。它擅长「资源 CRUD + 简单查询」场景，但有些场景别的风格更合适。

### REST 适合的场景

- **资源导向的 CRUD 业务**：用户、订单、文章这类「增删改查」为主的领域，REST 天然契合。
- **公开 API、第三方集成**：REST 简单、通用、好理解，生态丰富（HTTP 客户端、缓存、网关都支持），适合开放给外部。
- **需要缓存**：GET 可缓存，CDN、浏览器都能用上。
- **多端复用**：一套 API 服务 Web/App/小程序。

### REST 不太适合的场景

- **复杂查询、按需取字段**：比如「查用户列表，每个用户只要名字和最近 3 条订单的金额」。REST 要发好几个请求，或者返回一堆用不上的字段。这时 **GraphQL** 更合适——客户端自己声明要什么字段，一次请求拿齐。
- **高性能内部服务间通信**：REST 用 JSON 文本序列化，体积大、解析慢。内部微服务高频调用，**gRPC**（基于 HTTP/2 + Protobuf 二进制）更高效，还自带代码生成。
- **实时双向通信**：聊天、推送。REST 是请求-响应模型，用 **WebSocket** 或 SSE 更合适。
- **复杂业务流程/动作导向**：比如「下单 → 支付 → 发货 → 退款」这种流程，硬套资源 CRUD 会很别扭，RPC 风格（\`POST /orders/123/refund\`）反而清晰。

### 三者对比

| 维度 | REST | GraphQL | gRPC |
|------|------|---------|------|
| 风格 | 资源 + HTTP 方法 | 查询语言 + 单端点 | RPC over HTTP/2 |
| 传输格式 | 通常 JSON | JSON | Protobuf（二进制） |
| 取字段 | 服务端定，可能 over-fetch | 客户端声明，精准 | 服务端定 |
| 缓存 | HTTP 缓存原生支持 | 缓存复杂 | 不易缓存 |
| 适用 | 公开 API、CRUD 业务 | 复杂查询、多端聚合 | 内部高性能通信 |
| 学习成本 | 低 | 中 | 中高 |

> 务实建议：**对外用 REST，对内高频调用用 gRPC，前端复杂聚合用 GraphQL**。三者不冲突，可以共存。

## 一个最小 RESTful API 的样子

用 FastAPI 写一个最小的 RESTful 用户接口，体会一下「资源 + 方法」的感觉：

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# 内存里模拟一个用户数据库
# 实际项目用 SQLAlchemy 连数据库
users_db = {
    1: {"id": 1, "name": "Tom", "email": "tom@example.com"},
    2: {"id": 2, "name": "Jerry", "email": "jerry@example.com"},
}

# 用 Pydantic 模型约束请求体结构
# 这样 FastAPI 会自动校验请求 JSON 格式
class UserCreate(BaseModel):
    name: str
    email: str

# GET /users —— 获取用户列表（查询，安全可缓存）
@app.get("/users")
def list_users():
    # 返回列表，状态码默认 200
    return list(users_db.values())

# GET /users/{user_id} —— 获取单个用户
@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in users_db:
        # 资源不存在，返回 404
        raise HTTPException(status_code=404, detail="用户不存在")
    return users_db[user_id]

# POST /users —— 创建用户
@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    # 生成新 id（简化演示，实际用数据库自增）
    new_id = max(users_db.keys()) + 1
    new_user = {"id": new_id, **user.model_dump()}
    users_db[new_id] = new_user
    # 201 Created 表示资源创建成功
    return new_user

# DELETE /users/{user_id} —— 删除用户
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    del users_db[user_id]
    # 204 No Content 表示成功但无内容返回
    return None
\`\`\`

跑起来后，对应请求和响应：

\`\`\`http
GET /users HTTP/1.1
Host: localhost:8000

HTTP/1.1 200 OK
Content-Type: application/json

[{"id": 1, "name": "Tom", "email": "tom@example.com"},
 {"id": 2, "name": "Jerry", "email": "jerry@example.com"}]
\`\`\`

\`\`\`http
POST /users HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{"name": "Spike", "email": "spike@example.com"}

HTTP/1.1 201 Created
Content-Type: application/json

{"id": 3, "name": "Spike", "email": "spike@example.com"}
\`\`\`

你看：URI 全是 \`/users\`，靠方法区分动作，状态码语义明确。这就是 REST 的味道。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| URL 放动词 | \`POST /getUser\` | \`GET /users\` |
| 全用 POST | 增删改查都用 POST | 用对应方法 GET/POST/PUT/DELETE |
| 依赖 session | 服务器存会话状态 | 无状态，用 Token |
| 忽略缓存头 | GET 响应不设 Cache-Control | 标明是否可缓存 |
| 乱用状态码 | 出错返回 200 + body 错误 | 用 4xx/5xx |
| 把 RMM 当强制 | 强求 Level 3 HATEOAS | Level 2 性价比最高 |

## 小结

REST 不是「用 HTTP 传 JSON」这么简单，它是一套架构约束：客户端-服务器分离、无状态、可缓存、统一接口、分层系统。核心思想是**把业务抽象成资源，用标准方法操作资源，用 HTTP 原生能力表达语义**。

理解了这些约束，你设计 API 时就有了判断依据——为什么要用 \`DELETE /users/123\` 而不是 \`POST /deleteUser\`，为什么要返回 404 而不是 200+错误，为什么不该把会话状态存服务器。下一章我们专门讲怎么给资源建模、怎么设计 URI。`
  },

  // ============================================================
  // 第 2 章：资源建模与 URI 设计
  // ============================================================
  {
    id: "pyweb2-rest-resources",
    group: "RESTful API 设计",
    icon: "🗂️",
    title: "资源建模与 URI 设计",
    content: `# 资源建模与 URI 设计

REST 的核心是「资源」。这一章专门讲：怎么从业务里识别资源，怎么给资源起一个好 URI。URI 设计好了，API 的一半就成功了——它决定了接口好不好理解、好不好扩展。

## 什么是资源

**资源（Resource）是任何可以被命名的东西**。一个用户、一篇文章、一个订单、一张图片，甚至「用户列表」「搜索结果」都可以是资源。资源是 REST 里的「名词」，URI 是资源的「地址」。

关键点：资源是**概念**，不是它的表现形式。同一个「用户」资源，可以表现为 JSON，也可以表现为 XML、HTML、PNG（头像）。资源本身和它的「表现层（representation）」是两回事。

所以设计 API 第一步：**先把业务里的「名词」挑出来**，它们就是候选资源。

- 电商系统：用户、商品、订单、购物车、优惠券。
- 博客系统：文章、评论、标签、作者。
- 论坛：帖子、回复、板块、用户。

动词（创建、删除、查询、支付）不是资源，是**动作**，用 HTTP 方法表达。

## 资源识别：用名词复数

REST 社区的共识：**资源 URI 用名词、用复数**。

为什么用复数？因为 \`/users\` 自然表达「用户集合」，\`/users/123\` 是这个集合里的「编号 123 的那个」。集合 + 元素，结构清晰。单数 \`/user\` 表达「那个用户」，指代不明。

| ❌ 单数 / 动词 | ✅ 复数名词 |
|----------------|-------------|
| /user | /users |
| /user/123 | /users/123 |
| /createOrder | /orders |
| /getPosts | /posts |
| /order/list | /orders |

为什么用名词不用动词？上一章讲过：URI 标识「东西」，动作由方法表达。URL 里塞动词是 RPC 风格，不是 REST。

常见资源命名：

\`\`\`
/users            用户集合
/users/123        单个用户
/users/123/orders 该用户的订单集合
/posts            文章集合
/posts/456        单个文章
/posts/456/comments  文章的评论集合
/products         商品集合
/orders           订单集合
\`\`\`

## URI 设计规范

URI 是给人看的（开发者也是人）。好 URI 应该**自描述、稳定、可预测**。下面这些规范是社区约定俗成的最佳实践。

### 规范 1：全小写

URI 用小写字母。大写容易出问题：有些服务器大小写敏感，\`/Users\` 和 \`/users\` 可能不是同一个资源；URL 里大写还可能被代理/网关错误处理。

| ❌ 大写 | ✅ 小写 |
|---------|---------|
| /Users/123 | /users/123 |
| /UserProfiles | /user-profiles |
| /api/GetOrder | /api/orders |

### 规范 2：用连字符（-）分隔单词，不用下划线（_）

多个单词组成的资源名，用连字符 \`-\` 分隔。下划线 \`_\` 在 URL 里容易被超链接的下划线样式遮挡，可读性差；连字符是 URL 里分隔单词的事实标准（Google、GitHub 都这么用）。

| ❌ 下划线 / 驼峰 | ✅ 连字符 |
|-------------------|-----------|
| /user_profiles | /user-profiles |
| /userProfiles | /user-profiles |
| /order_items | /order-items |
| /pendingOrders | /pending-orders |

### 规范 3：用斜杠表示层级

\`/\` 表示资源的层级和包含关系。父资源在前，子资源在后。

\`\`\`
/users/123/orders/456
│      │   │      │
│      │   │      └─ 订单 456
│      │   └──────── 该用户的订单集合
│      └──────────── 用户 123
└─────────────────── 用户集合
\`\`\`

读法：「用户集合 → 123 号用户 → 他的订单集合 → 456 号订单」。层级清晰。

### 规范 4：结尾不要斜杠

\`/users\` 和 \`/users/\` 应该是同一个资源，但技术上有些服务器/框架会把它们当不同的路径。**统一不加结尾斜杠**，避免歧义和重复缓存。

| ❌ 结尾斜杠 | ✅ 无结尾斜杠 |
|-------------|---------------|
| /users/ | /users |
| /users/123/ | /users/123 |

### 规范 5：路径用名词，查询用参数

**路径里放「定位资源」的信息（id、层级），查询参数放「筛选、排序、分页」等修饰信息**。

| 信息类型 | 放哪 | 例子 |
|----------|------|------|
| 资源 id | 路径 | /users/123 |
| 父子关系 | 路径 | /users/123/orders |
| 筛选条件 | 查询参数 | /users?role=admin |
| 排序 | 查询参数 | /users?sort=-created_at |
| 分页 | 查询参数 | /users?page=2&size=20 |
| 字段选择 | 查询参数 | /users?fields=id,name |

## 子资源与关系

业务里资源往往有关联：用户有订单、文章有评论、订单有商品项。怎么在 URI 里表达这些关系？有几种做法。

### 做法 1：路径嵌套（表达从属关系）

子资源是父资源的一部分，且「脱离父资源没意义」时，用嵌套。

\`\`\`
/users/123/orders           用户 123 的订单列表
/posts/456/comments         文章 456 的评论列表
/orders/789/items           订单 789 的商品项
\`\`\`

「文章 456 的评论」——评论天然属于某篇文章，用嵌套很自然。

请求示例：

\`\`\`http
GET /users/123/orders HTTP/1.1
Host: api.example.com

HTTP/1.1 200 OK
Content-Type: application/json

[
  {"id": 1, "user_id": 123, "amount": 99.5, "status": "paid"},
  {"id": 2, "user_id": 123, "amount": 200, "status": "shipped"}
]
\`\`\`

### 做法 2：顶层资源 + 查询参数（表达松散关联）

如果子资源本身也能独立存在、独立查询，不一定要嵌套。可以用顶层 URI + 查询参数过滤。

\`\`\`
/orders?user_id=123         所有订单里筛选 user_id=123 的（等价于 /users/123/orders）
/comments?post_id=456       所有评论里筛选 post_id=456 的
\`\`\`

两种做法等价，怎么选？

- **强从属、常用**：嵌套（\`/users/123/orders\`），语义直观。
- **弱关联、多入口**：顶层 + 参数（\`/orders?user_id=123\`），更灵活，还能同时支持「按状态查所有订单」\`/orders?status=paid\`。

> 经验：**嵌套别超过 2 层**。\`/users/123/posts/456/comments/789\` 太深了，难读、难维护。深的层级拆成顶层 + 参数。

### 做法 3：多对多关系

多对多（学生-课程、文章-标签）通常有「关联表」。可以把关联本身建模成资源。

\`\`\`
/students/1/courses          学生 1 选的课
/courses/2/students          课程 2 的学生
/students/1/courses/2        学生 1 选了课程 2 这个「选课关系」
\`\`\`

\`/students/1/courses/2\` 指向「选课关系」本身，可以 DELETE 它表示「退课」。

## 查询参数 vs 路径参数

这是个高频问题：什么时候信息放路径，什么时候放查询参数？

**判断准则：这个信息是「定位资源」还是「修饰查询」？**

- 定位资源（去掉它就不知道在说哪个资源）→ **路径参数**
- 修饰查询（去掉它资源还在，只是范围变了）→ **查询参数**

| 场景 | 选择 | 例子 |
|------|------|------|
| 指定某个用户 | 路径 | /users/123 |
| 筛选管理员用户 | 查询 | /users?role=admin |
| 某用户的订单 | 路径（强从属） | /users/123/orders |
| 全部订单里按用户筛 | 查询 | /orders?user_id=123 |
| 按状态筛订单 | 查询 | /orders?status=paid |
| 排序、分页 | 查询 | /users?sort=name&page=2 |

路径参数是「必填的、定位用的」，查询参数是「可选的、过滤用的」。

反例：

\`\`\`
# ❌ 把筛选条件放路径
/users/role/admin          错：role/admin 不是定位某个用户
/orders/status/paid        错

# ✅ 改成查询参数
/users?role=admin
/orders?status=paid
\`\`\`

\`\`\`
# ❌ 把 id 放查询参数（能跑，但不规范）
/users?id=123              资源 id 应该在路径里

# ✅
/users/123
\`\`\`

## URI 设计反模式

### 反模式 1：URI 里放动词

最经典的反模式。动词属于 HTTP 方法，不属于 URI。

| ❌ 反模式 | ✅ 正确 |
|----------|---------|
| POST /createUser | POST /users |
| GET /getUser/123 | GET /users/123 |
| POST /deleteUser/123 | DELETE /users/123 |
| GET /listOrders | GET /orders |
| POST /updateOrderStatus | PATCH /orders/123 |

### 反模式 2：用文件扩展名表示格式

早期有人用 \`.json\`、\`.xml\` 后缀区分响应格式：\`/users.json\`、\`/users.xml\`。**这是反模式**，因为：

- 格式是「表现层」，不是资源本身。同一个资源 URI 应该和格式无关。
- 应该用 \`Accept\` 头协商格式（Content Negotiation）。

| ❌ 扩展名 | ✅ Accept 头协商 |
|----------|------------------|
| GET /users.json | GET /users + \`Accept: application/json\` |
| GET /users.xml | GET /users + \`Accept: application/xml\` |

FastAPI 里可以这样支持内容协商（用 \`response_class\` 或自己解析 Accept）：

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse

app = FastAPI()

# 同一个资源，根据 Accept 头返回不同格式
@app.get("/users/{user_id}")
def get_user(user_id: int, request: Request):
    user = {"id": user_id, "name": "Tom"}
    accept = request.headers.get("accept", "")
    # 根据客户端想要的格式返回不同表现层
    if "text/html" in accept:
        # 客户端要 HTML
        return HTMLResponse(f"<h1>{user['name']}</h1>")
    # 默认返回 JSON
    return JSONResponse(user)
\`\`\`

### 反模式 3：URI 里放 CRUD 动作

\`\`\`
# ❌ 把动作塞进路径
POST /users/create
POST /users/delete/123
GET /users/list

# ✅ 用 HTTP 方法表达动作
POST /users
DELETE /users/123
GET /users
\`\`\`

### 反模式 4：在 URI 里放查询参数样的东西

\`\`\`
# ❌ 把过滤条件编码进路径
/users/active              想表达「活跃用户」，但这是过滤不是定位
/orders/2023/01            想表达「2023年1月订单」，看着像层级其实是过滤

# ✅ 用查询参数
/users?status=active
/orders?year=2023&month=01
\`\`\`

注意：有些场景路径里放时间也合理，比如「按日期归档」\`/posts/2024/01/15\`，这取决于它是不是一个稳定的「定位」语义。判断标准还是：**这是定位还是过滤**。

### 反模式 5：URI 里大小写混用、驼峰命名

\`\`\`
# ❌ 驼峰 / 大小写混用
/userProfiles
/Users/123/OrderItems
/api/getOrderDetail

# ✅ 全小写 + 连字符
/user-profiles
/users/123/order-items
\`\`\`

### 反模式 6：URI 暴露技术实现

\`\`\`
# ❌ 暴露数据库表名、技术细节
/mysql_users
/api/v1/db/users/table
/users.php

# ✅ 资源名抽象，与技术无关
/users
\`\`\`

URI 应该描述「业务资源」，不是「数据库表」或「后端技术」。换数据库、换语言，URI 不该变。

## URI 版本前缀

虽然版本控制下一章详讲，这里先提一句：**API 通常在 URI 开头加版本前缀**，让版本一目了然。

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

这是最常见的做法（URI 版本）。注意 \`/api\` 前缀不是版本，是用来「区分 API 和网页路由」的命名空间。

## 一个完整的 URI 设计示例

假设设计一个博客系统的 API，资源有：用户、文章、评论、标签。好的 URI 设计：

\`\`\`
# 用户资源
GET    /users                       用户列表
POST   /users                       创建用户
GET    /users/{user_id}             获取单个用户
PATCH  /users/{user_id}             更新用户
DELETE /users/{user_id}             删除用户

# 文章资源
GET    /posts                       文章列表（支持 ?author_id=&tag=&status=）
POST   /posts                       创建文章
GET    /posts/{post_id}             获取单篇文章
PUT    /posts/{post_id}             更新整篇文章
DELETE /posts/{post_id}             删除文章

# 评论（文章的子资源）
GET    /posts/{post_id}/comments    某文章的评论列表
POST   /posts/{post_id}/comments    给某文章评论
GET    /comments/{comment_id}       单条评论（顶层访问，不强嵌套）
DELETE /comments/{comment_id}       删除评论

# 标签（多对多）
GET    /tags                        标签列表
POST   /posts/{post_id}/tags        给文章打标签
DELETE /posts/{post_id}/tags/{tag_id}  取消某标签

# 用户和文章的关系
GET    /users/{user_id}/posts       该用户的所有文章
\`\`\`

观察要点：

- 全名词复数，无动词。
- 评论既能从文章入口（\`/posts/456/comments\`）访问，也能从顶层（\`/comments/789\`）访问，灵活。
- 嵌套最多 2 层。
- 过滤、分页用查询参数。

对应的 FastAPI 骨架：

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 用户相关
@app.get("/users")
def list_users(): ...

@app.post("/users", status_code=201)
def create_user(): ...

@app.get("/users/{user_id}")
def get_user(user_id: int): ...

@app.patch("/users/{user_id}")
def update_user(user_id: int): ...

@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int): ...

# 文章相关
@app.get("/posts")
def list_posts(author_id: int = None, tag: str = None, status: str = None):
    # 查询参数过滤：/posts?author_id=1&tag=python&status=published
    ...

@app.get("/posts/{post_id}")
def get_post(post_id: int): ...

# 评论作为文章子资源
@app.get("/posts/{post_id}/comments")
def list_post_comments(post_id: int): ...

@app.post("/posts/{post_id}/comments", status_code=201)
def create_comment(post_id: int): ...

# 评论也能从顶层访问
@app.get("/comments/{comment_id}")
def get_comment(comment_id: int): ...

@app.delete("/comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int): ...

# 用户和文章的关系
@app.get("/users/{user_id}/posts")
def list_user_posts(user_id: int): ...
\`\`\`

## URI 设计检查清单

设计完 URI，用这个清单自查：

| 检查项 | 通过标准 |
|--------|----------|
| 全是名词复数？ | 没有 \`/createUser\` 这种 |
| 全小写？ | 没有大写字母 |
| 多词用连字符？ | \`/order-items\` 而非 \`/order_items\` |
| 无结尾斜杠？ | \`/users\` 而非 \`/users/\` |
| 无文件扩展名？ | \`/users\` 而非 \`/users.json\` |
| 无动词？ | 动作用 HTTP 方法表达 |
| 嵌套不超 2 层？ | 没有 \`/a/b/c/d\` |
| 过滤用查询参数？ | \`?status=active\` 而非 \`/active\` |
| 不暴露技术细节？ | 没有 \`.php\`、\`/mysql_\` |

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 单数资源名 | /user/123 | /users/123 |
| URL 放动词 | /getUser/123 | GET /users/123 |
| 下划线分隔 | /user_profiles | /user-profiles |
| 扩展名分格式 | /users.json | Accept 头协商 |
| 嵌套太深 | /u/1/p/2/c/3 | 拆成顶层 + 参数 |
| 过滤放路径 | /users/active | /users?status=active |
| 暴露技术 | /mysql_users | /users |

## 小结

URI 设计的核心原则：**用名词复数标识资源，用斜杠表达层级，用查询参数做过滤，用 HTTP 方法表达动作**。好的 URI 自描述、稳定、可预测，开发者看一眼就知道怎么用。下一章我们深入 HTTP 方法，看看每个方法到底该怎么用。`
  },

  // ============================================================
  // 第 3 章：HTTP 方法语义与 CRUD 映射
  // ============================================================
  {
    id: "pyweb2-rest-methods",
    group: "RESTful API 设计",
    icon: "🔧",
    title: "HTTP 方法语义与 CRUD 映射",
    content: `# HTTP 方法语义与 CRUD 映射

上一章我们把资源 URI 设计好了。URI 是「名词」，那「动词」从哪来？从 **HTTP 方法**来。这一章深入每个方法的语义，讲清它们怎么映射到 CRUD（Create/Read/Update/Delete），以及那些容易混淆的选择题：POST 还是 PUT？PUT 还是 PATCH？

## 五个核心 HTTP 方法

REST 里最常用的五个方法，正好对应 CRUD：

| 方法 | CRUD | 语义 | 典型 URI | 安全 | 幂等 |
|------|------|------|----------|------|------|
| GET | Read | 获取资源 | /users/123 | 是 | 是 |
| POST | Create | 创建资源 | /users | 否 | 否 |
| PUT | Update | 整体替换资源 | /users/123 | 否 | 是 |
| PATCH | Update | 部分更新资源 | /users/123 | 否 | 否* |
| DELETE | Delete | 删除资源 | /users/123 | 否 | 是 |

（\*PATCH 的幂等性有争议，下面详谈。）

记住这张表，它是 REST 方法选择的「决策表」。

## 安全性与幂等性详解

理解 HTTP 方法，必须先搞懂两个关键性质：**安全（Safe）** 和 **幂等（Idempotent）**。

### 安全（Safe）

**安全 = 不改变服务器数据**。客户端发一个安全的方法，可以放心发，不用担心「搞坏」服务器数据。

只有 GET、HEAD、OPTIONS 是安全的。POST/PUT/PATCH/DELETE 都不安全。

为什么重要？因为安全的请求可以被代理、爬虫、预取器「自动重发」而不用担心副作用。浏览器预取链接、爬虫抓页面，都只发 GET。

反面例子：把删除设计成 \`GET /deleteUser?id=1\`。爬虫一抓，用户全没了——这就是为什么「改数据用 GET」是严重设计错误。

### 幂等（Idempotent）

**幂等 = 执行一次和执行 N 次，效果一样**。

- DELETE /users/123：删一次，用户没了；再删一次，还是「没了」，结果一样。幂等。
- PUT /users/123 {name:"Tom"}：把 123 号用户替换成 Tom，发十次，结果还是 Tom。幂等。
- POST /users {name:"Tom"}：发一次创建一个 Tom，发十次创建十个 Tom。不幂等。
- GET /users/123：查一次和查十次，服务器数据没变。幂等。

为什么幂等重要？**因为网络会重试**。请求超时了，客户端不知道服务器到底处理没处理，重试一次最安全。如果操作幂等，重试无害；如果不幂等，重试可能产生重复数据。

| 方法 | 安全 | 幂等 | 说明 |
|------|------|------|------|
| GET | 是 | 是 | 只读，可随便重试 |
| POST | 否 | 否 | 创建，重试会重复 |
| PUT | 否 | 是 | 整体替换，重试安全 |
| PATCH | 否 | 否（默认） | 部分更新，重试可能有问题 |
| DELETE | 否 | 是 | 删除，重试安全 |

**DELETE 的幂等性细节**：第一次 DELETE 返回 200（删除成功），第二次 DELETE 应该返回 404（已经没了）。虽然状态码不同，但「服务器最终状态」一致（用户都不在了），所以语义上幂等。

**PATCH 的幂等性**：如果 PATCH 是「设置 name=Tom」，那幂等；如果是「name 增加 10」，那不幂等（发一次 +10，发十次 +100）。规范上 PATCH 不保证幂等，但实践中多数 PATCH 操作写成幂等的形式更安全。

## GET：查询资源

GET 用来「获取资源」，是最常用的方法。

特点：

- **安全**：不该改数据。别用 GET 做删除、修改（哪怕只是「顺手改个统计计数」也别）。
- **幂等**：查一次和查十次结果一样。
- **可缓存**：GET 响应可被浏览器/CDN 缓存。
- **无请求体**：规范上 GET 不该有 body（虽然有些服务器接受，但别这么做）。参数走查询字符串。

GET 两种典型用法：

\`\`\`http
# 1. 获取集合
GET /users?role=admin&page=2 HTTP/1.1
Host: api.example.com

HTTP/1.1 200 OK
Content-Type: application/json

[
  {"id": 1, "name": "Tom", "role": "admin"},
  {"id": 5, "name": "Lucy", "role": "admin"}
]

# 2. 获取单个资源
GET /users/123 HTTP/1.1
Host: api.example.com

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 123, "name": "Tom", "email": "tom@example.com"}
\`\`\`

GET 别传敏感数据在 URL 里！URL 会进日志、进浏览器历史、进 Referer 头。密码、Token 别放查询参数。

## POST：创建资源

POST 用来「创建资源」。把新资源的数据放在请求体里，POST 到集合 URI。

特点：

- **不安全**：会创建数据。
- **不幂等**：重试会创建多个。
- **有请求体**：新资源的数据放 body。
- **不可缓存**（一般情况）。

\`\`\`http
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name": "Tom", "email": "tom@example.com"}

HTTP/1.1 201 Created
Location: /users/124
Content-Type: application/json

{"id": 124, "name": "Tom", "email": "tom@example.com"}
\`\`\`

注意响应：**用 201 Created 而不是 200**，并在 \`Location\` 头里返回新资源的 URL。这样客户端能直接知道新资源在哪。

POST 也能用于「非创建」场景，比如「执行某个动作」（登录、搜索、触发任务）。这些场景没有「资源」好创建，用 POST 是务实选择。

\`\`\`http
# 登录（创建一个 session/token，算半个「创建」）
POST /auth/login HTTP/1.1
Content-Type: application/json

{"username": "tom", "password": "secret"}

# 搜索（查询条件太复杂放 URL 不合适，用 POST body）
POST /posts/search HTTP/1.1
Content-Type: application/json

{"keyword": "rest", "date_from": "2024-01-01", "tags": ["python"]}
\`\`\`

注意：\`POST /search\` 不算「纯 REST」（动词在 URL），但工程上复杂查询用 POST body 比塞一长串查询参数更合理。

## PUT：整体替换

PUT 用来「整体替换资源」。客户端发完整的资源表示，服务器用它**替换**原资源。

特点：

- **幂等**：发十次，资源都是你发的那份。
- **要求客户端提供完整资源**：没传的字段会被清空（因为是「替换」）。
- **通常带 id**：PUT 到具体资源 URI（\`/users/123\`），因为要指定替换哪个。

\`\`\`http
PUT /users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"id": 123, "name": "TomNew", "email": "tomnew@example.com", "age": 30}

HTTP/1.1 200 OK
{"id": 123, "name": "TomNew", "email": "tomnew@example.com", "age": 30}
\`\`\`

关键理解「替换」：如果原用户有字段 \`role: admin\`，而你 PUT 时没传 role，**PUT 会把 role 清掉**（或设为默认值），因为你是用整份新数据替换旧的。

**PUT 也能创建**：如果 \`/users/123\` 不存在，PUT 可以创建它——只要客户端能确定 id。这叫「PUT 创建」。

什么时候 PUT 创建合理？**当 id 由客户端指定**时。比如上传文件：\`PUT /files/avatar.png\`，文件名（id）由客户端定，存在就覆盖、不存在就创建，天然幂等。

\`\`\`http
# 上传文件，用 PUT（覆盖式）
PUT /files/report.pdf HTTP/1.1
Content-Type: application/pdf

<二进制文件内容>

HTTP/1.1 201 Created   # 或 200 OK（如果是覆盖）
\`\`\`

## PATCH：部分更新

PATCH 用来「部分更新资源」。只改客户端传的字段，其他字段不动。

特点：

- **只传要改的字段**：没传的保持不变（和 PUT 相反）。
- **不保证幂等**（取决于怎么用）。
- **比 PUT 更省流量**：改一个字段不用传整条记录。

\`\`\`http
PATCH /users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name": "TomNew"}   # 只改名字，其他不动

HTTP/1.1 200 OK
{"id": 123, "name": "TomNew", "email": "tom@example.com", "age": 25}
\`\`\`

对比 PUT 和 PATCH：

| 场景 | PUT（整体替换） | PATCH（部分更新） |
|------|-----------------|-------------------|
| 改用户名 | 传整条记录 {id,name,email,age} | 只传 {name} |
| 没传的字段 | 被清空/重置 | 保持不变 |
| 流量 | 大 | 小 |
| 幂等 | 是 | 不保证 |

**实际项目里 PATCH 用得比 PUT 多**，因为前端表单通常只改几个字段，传整条记录既麻烦又容易误清数据。

PATCH 有两种格式约定：

1. **JSON Merge Patch（RFC 7396）**：直接传要改的字段。简单常用。但没法表达「把这个字段设为 null」（因为 null 表示「不改」）。
2. **JSON Patch（RFC 6902）**：用一组操作指令。能精确表达增删改。

\`\`\`http
# JSON Merge Patch（简单，常用）
PATCH /users/123 HTTP/1.1
Content-Type: application/merge-patch+json

{"name": "TomNew", "age": null}   # age 设为 null 表示「删除这个字段」

# JSON Patch（精确，复杂）
PATCH /users/123 HTTP/1.1
Content-Type: application/json-patch+json

[
  {"op": "replace", "path": "/name", "value": "TomNew"},
  {"op": "remove", "path": "/age"},
  {"op": "add", "path": "/phone", "value": "13800000000"}
]
\`\`\`

多数项目用 JSON Merge Patch 就够，简单直观。

## DELETE：删除资源

DELETE 用来「删除资源」。

特点：

- **幂等**：删一次和删十次，资源都不在了。
- **通常无请求体**。
- **响应常用 204 No Content**（删完了，没东西返回）或 200（返回被删的资源）。

\`\`\`http
DELETE /users/123 HTTP/1.1
Host: api.example.com

HTTP/1.1 204 No Content
\`\`\`

DELETE 的「幂等」细节：第一次删返回 204/200，第二次再删同一个资源，返回 404（已经不存在了）也合理。最终服务器状态一致（资源没了），所以幂等。

软删除 vs 硬删除：

- **硬删除**：\`DELETE /users/123\` 真从数据库删。简单，但不可恢复。
- **软删除**：不真删，标记 \`deleted_at\` 字段。可恢复，但要查询时记得过滤已删数据。

很多生产系统用软删除，避免误删造成事故。DELETE 接口内部其实是「更新 deleted_at 字段」。

## POST vs PUT：创建资源用哪个

经典选择题：**创建资源用 POST 还是 PUT？**

**默认用 POST**，因为：

- id 通常由服务器生成（自增主键、UUID）。客户端不知道下一个 id 是几，只能 POST 到集合 \`/users\`，让服务器分配 id。
- POST 不要求幂等，符合「创建可能重复」的语义。

**用 PUT 创建的场景**：id 由客户端指定，且要求幂等。

判断流程：

\`\`\`
id 谁定？
├─ 服务器定 → POST /users（不幂等，每次创建新的）
└─ 客户端定 → PUT /users/{client_id}（幂等，重试安全）
\`\`\`

举例：

- 注册用户：邮箱、手机号是用户填的，但内部 id 服务器生成。用 POST。
- 上传文件：文件名/路径客户端定。用 PUT，重传覆盖、幂等。
- 客户端生成 UUID 做 id：用 PUT /users/{uuid}，断网重试不会创建重复。

\`\`\`http
# POST 创建（服务器定 id）
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Tom"}

HTTP/1.1 201 Created
Location: /users/124
{"id": 124, "name": "Tom"}

# PUT 创建（客户端定 id）
PUT /users/abc-123-uuid HTTP/1.1
Content-Type: application/json

{"id": "abc-123-uuid", "name": "Tom"}

HTTP/1.1 201 Created
{"id": "abc-123-uuid", "name": "Tom"}
\`\`\`

## PUT vs PATCH：整体替换 vs 部分更新

另一个经典选择题。

| 维度 | PUT | PATCH |
|------|-----|-------|
| 语义 | 整体替换 | 部分更新 |
| 传什么 | 完整资源 | 只传要改的 |
| 没传字段 | 清空/重置 | 保持不变 |
| 幂等 | 是 | 不保证 |
| 流量 | 大 | 小 |

经验：**默认用 PATCH**。前端改个昵称，传整条用户记录（PUT）既浪费又容易误清字段；只传 \`{name: "new"}\`（PATCH）更安全高效。

用 PUT 的场景：客户端真的有完整资源、想整体覆盖（比如从一份配置文件覆盖另一份）。

## 批量操作设计

单个 CRUD 好做，批量操作（批量删除、批量更新、批量创建）怎么设计？这是 REST 的弱项，没有标准答案，常见做法有几种。

### 做法 1：POST 接收 id 数组

\`\`\`http
# 批量删除
POST /users/batch-delete HTTP/1.1
Content-Type: application/json

{"ids": [1, 2, 3]}

HTTP/1.1 200 OK
{"deleted": 3, "failed": []}
\`\`\`

注意：\`POST /users/batch-delete\` 有动词，不算纯 REST，但务实。或者用 \`DELETE /users\` + body 传 id 数组（DELETE 带 body 不规范，不推荐）。

### 做法 2：用查询参数筛选 + DELETE

\`\`\`http
# 删除所有符合条件的（危险！）
DELETE /users?role=guest&inactive=true HTTP/1.1

HTTP/1.1 200 OK
{"deleted": 42}
\`\`\`

适合「按条件批量删」，但要谨慎——这很危险，最好加确认机制。

### 做法 3：批量 PATCH

\`\`\`http
# 批量更新
PATCH /users/batch HTTP/1.1
Content-Type: application/json

{
  "ids": [1, 2, 3],
  "data": {"role": "vip"}   # 把这三个用户的 role 都改成 vip
}

HTTP/1.1 200 OK
{"updated": 3}
\`\`\`

### 做法 4：返回每个操作的结果

批量操作可能部分成功部分失败，响应要能表达每个的结果：

\`\`\`http
POST /users/batch-delete HTTP/1.1
Content-Type: application/json

{"ids": [1, 2, 3, 999]}

HTTP/1.1 200 OK
{
  "deleted": [1, 2, 3],
  "failed": [{"id": 999, "reason": "不存在"}]
}
\`\`\`

> 注意：批量操作整体不幂等（部分成功部分失败，重试结果可能不同），且不符合纯 REST。工程上按需使用，做好幂等键和重试设计。

## 用 FastAPI 实现完整 CRUD

把上面所有方法串起来，实现一个完整的用户 CRUD 接口：

\`\`\`python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI(title="用户 CRUD 示例")

# 模拟数据库
users_db: dict[int, dict] = {}
next_id = 1

# 请求模型：创建时用
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None

# 请求模型：更新时用（所有字段可选，因为 PATCH 只传要改的）
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None

# 响应模型：统一输出结构
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None

# ============ GET：查询 ============

# GET /users —— 列表，支持分页和过滤
@app.get("/users", response_model=list[UserResponse])
def list_users(role: Optional[str] = None, page: int = 1, size: int = 10):
    """获取用户列表，支持按 role 过滤和分页"""
    result = list(users_db.values())
    if role:
        result = [u for u in result if u.get("role") == role]
    # 分页：跳过 (page-1)*size 条，取 size 条
    start = (page - 1) * size
    return result[start:start + size]

# GET /users/{user_id} —— 单个
@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    return users_db[user_id]

# ============ POST：创建 ============

@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    """创建用户，id 由服务器生成"""
    global next_id
    # 检查邮箱唯一性
    for u in users_db.values():
        if u["email"] == user.email:
            raise HTTPException(status_code=409, detail="邮箱已被注册")
    new_user = {"id": next_id, **user.model_dump()}
    users_db[next_id] = new_user
    next_id += 1
    return new_user

# ============ PUT：整体替换 ============

@app.put("/users/{user_id}", response_model=UserResponse)
def replace_user(user_id: int, user: UserCreate):
    """整体替换：必须传完整字段，没传的会被清空"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 保留 id，其余字段用客户端传的完整替换
    users_db[user_id] = {"id": user_id, **user.model_dump()}
    return users_db[user_id]

# ============ PATCH：部分更新 ============

@app.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate):
    """部分更新：只改传了的字段"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 只更新非 None 的字段（model_dump(exclude_unset=True) 只取客户端传了的）
    update_data = user.model_dump(exclude_unset=True)
    users_db[user_id].update(update_data)
    return users_db[user_id]

# ============ DELETE：删除 ============

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    """删除用户，幂等：不存在也算成功"""
    # 用 pop 而不是 del，避免 KeyError（让删除幂等）
    users_db.pop(user_id, None)
    return None
\`\`\`

跑几个完整交互：

\`\`\`http
# 创建
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Tom", "email": "tom@example.com", "age": 25}

HTTP/1.1 201 Created
{"id": 1, "name": "Tom", "email": "tom@example.com", "age": 25}

# 部分更新（只改名字）
PATCH /users/1 HTTP/1.1
Content-Type: application/json

{"name": "TomNew"}

HTTP/1.1 200 OK
{"id": 1, "name": "TomNew", "email": "tom@example.com", "age": 25}

# 整体替换（必须传完整字段，不传 age 会被清成 null）
PUT /users/1 HTTP/1.1
Content-Type: application/json

{"name": "TomFull", "email": "tomfull@example.com", "age": 30}

HTTP/1.1 200 OK
{"id": 1, "name": "TomFull", "email": "tomfull@example.com", "age": 30}

# 删除
DELETE /users/1 HTTP/1.1

HTTP/1.1 204 No Content
\`\`\`

注意 FastAPI 几个关键点：

- \`response_model\` 控制输出字段，避免泄露内部字段。
- \`status_code\` 设定成功状态码（201、204 等）。
- \`model_dump(exclude_unset=True)\` 只取客户端传了的字段，实现 PATCH 语义。
- \`pop(key, None)\` 让删除幂等。

## 方法选择决策树

遇到操作不知道用哪个方法？走这个决策树：

\`\`\`
是查询（不改数据）吗？
├─ 是 → GET
└─ 否 ↓
是删除吗？
├─ 是 → DELETE
└─ 否 ↓
是创建吗？
├─ id 由服务器定 → POST /users
├─ id 由客户端定 → PUT /users/{id}
└─ 否 ↓
是更新吗？
├─ 整体替换（传完整资源）→ PUT
└─ 部分更新（只改几个字段）→ PATCH
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| GET 改数据 | GET /deleteUser?id=1 | DELETE /users/1 |
| 创建用 200 | POST 成功返回 200 | 返回 201 Created |
| PATCH 当 PUT | PATCH 传完整资源 | PATCH 只传改动字段 |
| PUT 漏字段 | PUT 不传的字段以为不变 | PUT 不传会清空，用 PATCH |
| 忽略幂等 | 创建用 PUT 但不控 id | 服务器定 id 用 POST |
| 删除报错 | 删不存在的返回 500 | 返回 404 或 204 |

## 小结

HTTP 方法是 REST 的「动词」。GET 查、POST 建、PUT 整体替换、PATCH 部分更新、DELETE 删。理解**安全性**（不改数据）和**幂等性**（重试无害）是选对方法的关键。创建默认用 POST，id 客户端定才用 PUT；更新默认用 PATCH，整体覆盖才用 PUT。下一章我们看怎么用状态码准确表达请求结果。`
  },

  // ============================================================
  // 第 4 章：状态码规范使用
  // ============================================================
  {
    id: "pyweb2-rest-status-codes",
    group: "RESTful API 设计",
    icon: "✅",
    title: "状态码规范使用",
    content: `# 状态码规范使用

HTTP 状态码是响应里那三位数字，告诉客户端「请求结果怎么样」。用对状态码，客户端能用统一逻辑处理响应；用错状态码，整个 API 的语义就乱了。这一章把常用状态码掰开揉碎讲，并指出最常见的误区。

## 状态码的分类

状态码是三位数字，按第一位分 5 类：

| 分类 | 含义 | 例子 |
|------|------|------|
| 1xx | 信息性（请求已收到，继续处理） | 100 Continue |
| 2xx | 成功 | 200、201、204 |
| 3xx | 重定向（需要进一步动作） | 301、302、304 |
| 4xx | 客户端错误（你的问题） | 400、401、404 |
| 5xx | 服务器错误（我的问题） | 500、502、503 |

记忆口诀：**1 信息、2 成功、3 重定向、4 客户端错、5 服务端错**。

1xx 实际中很少见（WebSocket 升级用 101），主要掌握 2xx-5xx。

## 2xx 成功

### 200 OK

最通用的成功码。请求正常处理完，响应体里有数据。

适用：GET 查询、PUT/PATCH 更新成功后返回结果。

\`\`\`http
GET /users/123 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 123, "name": "Tom"}
\`\`\`

### 201 Created

**资源创建成功**。POST 创建、PUT 创建后，用 201 比 200 更准确，并应在 \`Location\` 头返回新资源 URL。

\`\`\`http
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Tom"}

HTTP/1.1 201 Created
Location: /users/124
Content-Type: application/json

{"id": 124, "name": "Tom"}
\`\`\`

很多 API 创建时错误地返回 200，虽然能用，但不规范。201 让客户端一眼看出「这是新建的」。

### 202 Accepted

**请求已接收，但还没处理完**。用于异步任务：服务器收到请求，放进队列，稍后处理。

\`\`\`http
POST /reports/generate HTTP/1.1
Content-Type: application/json

{"type": "monthly", "month": "2024-01"}

HTTP/1.1 202 Accepted
Content-Type: application/json

{"task_id": "task-abc-123", "status": "processing", "check_url": "/tasks/task-abc-123"}
\`\`\`

客户端可以轮询 \`check_url\` 查任务进度。导出大报表、视频转码、批量发邮件这类耗时任务用 202。

### 204 No Content

**成功但没有内容返回**。响应体为空。用于 DELETE 删除后、PUT 更新后不返回数据时。

\`\`\`http
DELETE /users/123 HTTP/1.1

HTTP/1.1 204 No Content
\`\`\`

什么时候用 200 vs 204？

- 操作后**要返回数据**（被删的资源、更新后的资源）→ 200。
- 操作后**没什么可返回**→ 204。

DELETE 用 204 最常见；也有 API 用 200 返回 \`{"deleted": true}\`，都行，关键是统一。

### 2xx 选择表

| 场景 | 状态码 |
|------|--------|
| GET 查询成功 | 200 |
| POST 创建成功 | 201 |
| PUT/PATCH 更新成功（返回结果） | 200 |
| PUT/PATCH 更新成功（不返回结果） | 204 |
| DELETE 删除成功（不返回） | 204 |
| 异步任务已接收 | 202 |

## 3xx 重定向

### 301 Moved Permanently

**永久重定向**。资源永久搬到了新地址，搜索引擎和客户端应该更新 bookmark。\`Location\` 头给新 URL。

\`\`\`http
GET /api/users/123 HTTP/1.1

HTTP/1.1 301 Moved Permanently
Location: /api/v2/users/123
\`\`\`

场景：API 升级，老地址永久跳新地址；HTTP 跳 HTTPS。

### 302 Found

**临时重定向**。资源临时在别处，下次还来老地址问。登录后跳回原页面常用 302。

\`\`\`http
POST /login HTTP/1.1

HTTP/1.1 302 Found
Location: /dashboard
\`\`\`

301 和 302 的区别：301 是「永远去新地址」，302 是「这次去新地址，下次再来老地址问」。

### 304 Not Modified

**资源没变，用缓存吧**。配合条件请求（\`If-Modified-Since\`、\`If-None-Match\`）。客户端发请求时带上「我缓存的是哪个版本」，服务器发现没变就回 304，客户端用本地缓存，省流量。

\`\`\`http
GET /users/123 HTTP/1.1
If-None-Match: "abc123"   # 我缓存的版本 ETag

HTTP/1.1 304 Not Modified
ETag: "abc123"
# 没有响应体，客户端用本地缓存
\`\`\`

### 307 / 308：保留方法的临时/永久重定向

302/301 有个历史问题：早期浏览器收到 301/302 时，会把 POST 改成 GET 再请求新地址（丢方法）。307/308 修正了这点：

| 状态码 | 持久性 | 是否保留原方法 |
|--------|--------|----------------|
| 301 | 永久 | 不保证（POST 可能变 GET） |
| 302 | 临时 | 不保证（POST 可能变 GET） |
| 307 | 临时 | 保留（POST 还是 POST） |
| 308 | 永久 | 保留（POST 还是 POST） |

新 API 推荐 307/308 替代 302/301，避免方法被偷偷改。但实际中 301/302 还是主流。

## 4xx 客户端错误

4xx 表示**客户端的请求有问题**。服务器拒绝处理，客户端得改了再来。

### 400 Bad Request

**请求格式错误**。JSON 解析失败、必填字段缺失、参数格式不对。

\`\`\`http
POST /users HTTP/1.1
Content-Type: application/json

{"name": }   # JSON 格式错误

HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": "invalid_json", "message": "JSON 解析失败"}
\`\`\`

FastAPI 会自动对 Pydantic 校验失败返回 422（见下文），但手写校验常用 400。

### 401 Unauthorized

**未认证**。你没登录，或 Token 无效。注意名字叫 Unauthorized 但实际是「未认证」（命名是 HTTP 规范的历史遗留错误）。

\`\`\`http
GET /users/me HTTP/1.1

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer

{"error": "unauthenticated", "message": "请先登录"}
\`\`\`

应配 \`WWW-Authenticate\` 头说明怎么认证。

### 403 Forbidden

**已认证但没权限**。你登录了，但想删别人的文章、想进管理员后台。

\`\`\`http
DELETE /users/123 HTTP/1.1
Authorization: Bearer <user_token>   # 普通用户的 token

HTTP/1.1 403 Forbidden
{"error": "forbidden", "message": "无权删除其他用户"}
\`\`\`

**401 vs 403 是高频考点**：

| 状态码 | 含义 | 判断 |
|--------|------|------|
| 401 | 未认证 | 「你是谁？」没搞清楚 |
| 403 | 无权限 | 「你是谁」清楚了，但「你不许干这个」 |

判断流程：先看是否认证（没登录 → 401），再看是否有权限（登录了没权限 → 403）。

### 404 Not Found

**资源不存在**。URL 写错了，或资源被删了。

\`\`\`http
GET /users/99999 HTTP/1.1

HTTP/1.1 404 Not Found
{"error": "not_found", "message": "用户不存在"}
\`\`\`

注意：404 也用于「资源存在但不给你看」的场景——为了避免泄露「这个 id 是否存在」，没权限时也可以返回 404 而不是 403（安全考虑）。

### 405 Method Not Allowed

**方法不允许**。URI 对，但这个方法不支持。比如对 \`/users\` 发 PUT。

\`\`\`http
PUT /users HTTP/1.1

HTTP/1.1 405 Method Not Allowed
Allow: GET, POST

{"error": "method_not_allowed", "message": "支持的方法: GET, POST"}
\`\`\`

应配 \`Allow\` 头说明支持哪些方法。FastAPI/Flask 自动处理这个。

### 409 Conflict

**冲突**。请求合法，但和当前状态冲突。比如邮箱已注册、并发更新冲突。

\`\`\`http
POST /users HTTP/1.1
Content-Type: application/json

{"email": "tom@example.com"}   # 邮箱已被注册

HTTP/1.1 409 Conflict
{"error": "email_taken", "message": "该邮箱已被注册"}
\`\`\`

### 422 Unprocessable Entity

**格式对但语义错**。JSON 解析没问题，但字段值不合法（年龄传 -1、邮箱格式对但不存在）。

\`\`\`http
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Tom", "age": -1, "email": "not-an-email"}

HTTP/1.1 422 Unprocessable Entity
{
  "error": "validation_error",
  "details": [
    {"field": "age", "message": "年龄必须大于 0"},
    {"field": "email", "message": "邮箱格式不正确"}
  ]
}
\`\`\`

**FastAPI 默认用 422**（而不是 400）返回 Pydantic 校验错误。这是 FastAPI 的约定，很多人会困惑「为什么校验失败是 422 不是 400」——422 更精确：格式对（是合法 JSON），但语义不对（值不合法）。

### 429 Too Many Requests

**请求太频繁**。触发了限流。应配 \`Retry-After\` 头告诉客户端多久后重试。

\`\`\`http
POST /users HTTP/1.1

HTTP/1.1 429 Too Many Requests
Retry-After: 60

{"error": "rate_limited", "message": "请求过于频繁，60 秒后重试"}
\`\`\`

### 4xx 速查表

| 状态码 | 场景 |
|--------|------|
| 400 | 请求格式错（JSON 解析失败） |
| 401 | 没登录 / Token 无效 |
| 403 | 登录了但没权限 |
| 404 | 资源不存在 |
| 405 | 方法不支持 |
| 409 | 冲突（重复创建、并发冲突） |
| 422 | 格式对但值不合法 |
| 429 | 限流 |

## 5xx 服务器错误

5xx 表示**服务器出问题了**，不是客户端的错。客户端通常只能重试或报错。

### 500 Internal Server Error

**服务器内部错误**。代码抛了未捕获异常、bug。是最「笼统」的服务器错误。

\`\`\`http
GET /users/123 HTTP/1.1

HTTP/1.1 500 Internal Server Error
{"error": "server_error", "message": "服务器内部错误，请联系管理员"}
\`\`\`

注意：500 不要把详细堆栈返回给客户端（泄露信息、不安全），只返回友好提示，详细错误记日志。

### 502 Bad Gateway

**网关收到无效响应**。反向代理（Nginx）后面的应用服务器挂了或返回了垃圾。

\`\`\`http
HTTP/1.1 502 Bad Gateway
{"error": "bad_gateway", "message": "上游服务无响应"}
\`\`\`

### 503 Service Unavailable

**服务不可用**。维护中、过载、暂时挂了。应配 \`Retry-After\`。

\`\`\`http
HTTP/1.1 503 Service Unavailable
Retry-After: 3600

{"error": "service_unavailable", "message": "系统维护中，1 小时后恢复"}
\`\`\`

### 504 Gateway Timeout

**网关等待超时**。反向代理等应用服务器响应，超时了。和 502 区别：502 是「收到坏的响应」，504 是「等半天没响应」。

\`\`\`http
HTTP/1.1 504 Gateway Timeout
{"error": "gateway_timeout", "message": "上游服务响应超时"}
\`\`\`

### 5xx 速查表

| 状态码 | 含义 | 典型原因 |
|--------|------|----------|
| 500 | 内部错误 | 代码 bug、未捕获异常 |
| 502 | 网关收到无效响应 | 上游服务挂了 |
| 503 | 服务不可用 | 维护、过载 |
| 504 | 网关超时 | 上游响应太慢 |

## 错误响应体设计

光有状态码不够，还要有响应体说明「到底哪里错了、怎么改」。一个好的错误响应体应该包含：

| 字段 | 说明 | 例子 |
|------|------|------|
| error | 错误码（机器可读） | "validation_error" |
| message | 人类可读的描述 | "邮箱格式不正确" |
| details | 详细错误（多个字段时） | [{field, message}] |
| request_id | 请求追踪 ID | "req-abc-123" |

统一格式示例：

\`\`\`http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "validation_error",
  "message": "请求参数校验失败",
  "details": [
    {"field": "email", "message": "邮箱格式不正确"},
    {"field": "age", "message": "年龄必须大于 0"}
  ],
  "request_id": "req-abc-123"
}
\`\`\`

为什么用 \`error\` 错误码（字符串）而不只是状态码？因为状态码粒度粗（422 可能是多种校验错误），\`error\` 字段让客户端精确分支处理：

\`\`\`python
# 客户端处理
if response.status_code == 422:
    if response.json()["error"] == "validation_error":
        # 显示字段级错误
        for detail in response.json()["details"]:
            show_error(detail["field"], detail["message"])
    elif response.json()["error"] == "email_taken":
        show_error("email", "该邮箱已注册")
\`\`\`

FastAPI 实现统一错误响应：

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uuid

app = FastAPI()

# 统一错误响应格式
def error_response(status_code: int, error: str, message: str, details=None):
    return JSONResponse(
        status_code=status_code,
        content={
            "error": error,
            "message": message,
            "details": details or [],
            "request_id": str(uuid.uuid4()),
        },
    )

# 拦截 FastAPI 的校验错误（默认 422），改成统一格式
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # 把 Pydantic 的错误转成我们的格式
    details = [
        {"field": ".".join(str(x) for x in err["loc"][1:]),  # 去掉开头的 "body"
         "message": err["msg"]}
        for err in exc.errors()
    ]
    return error_response(422, "validation_error", "请求参数校验失败", details)

# 拦截自定义 HTTPException，统一格式
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_map = {
        400: "bad_request",
        401: "unauthenticated",
        403: "forbidden",
        404: "not_found",
        409: "conflict",
        429: "rate_limited",
    }
    return error_response(
        exc.status_code,
        error_map.get(exc.status_code, "error"),
        str(exc.detail),
    )

# 业务里直接 raise HTTPException，格式会自动统一
@app.post("/users")
def create_user(email: str):
    if email == "taken@example.com":
        raise HTTPException(status_code=409, detail="该邮箱已被注册")
    return {"email": email}
\`\`\`

请求效果：

\`\`\`http
POST /users?email=taken@example.com HTTP/1.1

HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": "conflict",
  "message": "该邮箱已被注册",
  "details": [],
  "request_id": "req-abc-123"
}
\`\`\`

## 常见误区

### 误区 1：用 200 返回业务错误

最严重的误区：不管成功失败都返回 200，在 body 里用 \`{"success": false, "error": "..."}\` 表示错误。

\`\`\`http
# ❌ 反模式：用 200 表达错误
POST /users HTTP/1.1
Content-Type: application/json

{"email": "taken@example.com"}

HTTP/1.1 200 OK
{"success": false, "error": "邮箱已注册"}
\`\`\`

为什么错？

- 客户端必须解析 body 才知道成功失败，不能用状态码统一判断。
- 监控/网关/缓存按状态码工作，看到 200 以为成功，不会触发告警。
- HTTP 语义被破坏。

正确做法：用对应的状态码（409 Conflict）。

### 误区 2：乱用 500

把业务错误（用户不存在、邮箱重复）也返回 500。500 表示「服务器内部错误」（bug），客户端看到 500 会以为「服务器崩了」，只能联系运维。业务错误应该用 4xx。

判断：**是客户端的问题吗？是 → 4xx；是服务器的问题吗？是 → 5xx**。

| 错误 | 错误归类 | 正确码 |
|------|----------|--------|
| 邮箱已注册 | 客户端 | 409 |
| 字段格式错 | 客户端 | 422 |
| 数据库连不上 | 服务端 | 500/503 |
| 代码抛异常 | 服务端 | 500 |
| 没登录 | 客户端 | 401 |

### 误区 3：把所有 4xx 都用 400

400 是「请求格式错」，不要把「没权限」「资源不存在」都塞进 400。该用 401/403/404/409 就用，让客户端能精确处理。

### 误区 4：3xx 乱用

把 302 当 200 用（重定向到一个「错误页面」），或者用 301 跳临时地址。区分清楚永久（301/308）和临时（302/307）。

### 误区 5：5xx 暴露堆栈

500 把 Python 堆栈、数据库连接串都返回给客户端——严重安全问题。生产环境必须关掉 debug 模式，只返回友好错误，详情记日志。

## 状态码选择速查表

把常用场景汇总：

| 场景 | 状态码 |
|------|--------|
| 查询成功 | 200 |
| 创建成功 | 201 |
| 异步任务已接收 | 202 |
| 删除成功（无返回） | 204 |
| 永久跳转 | 301/308 |
| 临时跳转 | 302/307 |
| 用缓存 | 304 |
| 请求格式错 | 400 |
| 没登录 | 401 |
| 没权限 | 403 |
| 资源不存在 | 404 |
| 方法不支持 | 405 |
| 冲突 | 409 |
| 值不合法 | 422 |
| 限流 | 429 |
| 服务器 bug | 500 |
| 上游挂了 | 502 |
| 维护中 | 503 |
| 上游超时 | 504 |

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 业务错误用 200 | 200 + {success:false} | 用 4xx/5xx |
| 业务错误用 500 | 邮箱重复返回 500 | 用 409 |
| 混淆 401/403 | 没权限返回 401 | 没登录 401，没权限 403 |
| 创建用 200 | POST 创建返回 200 | 用 201 Created |
| 错误暴露堆栈 | 500 返回详细堆栈 | 只返回友好提示，详情记日志 |
| 不带 Retry-After | 429/503 不告诉多久重试 | 配 Retry-After 头 |

## 小结

状态码是 HTTP 的「结果信号」。2xx 成功、3xx 重定向、4xx 客户端错、5xx 服务端错。核心原则：**用对状态码表达语义，别用 200 包裹业务错误，别用 500 包裹业务错误，错误响应体要结构化**。下一章我们看 API 的进阶主题：版本控制、HATEOAS、分页和文档。`
  },

  // ============================================================
  // 第 5 章：版本控制、HATEOAS 与错误格式
  // ============================================================
  {
    id: "pyweb2-rest-advanced",
    group: "RESTful API 设计",
    icon: "🚀",
    title: "版本控制、HATEOAS 与错误格式",
    content: `# 版本控制、HATEOAS 与错误格式

前几章讲了 REST 的基础。这一章讲进阶主题：API 怎么版本控制、HATEOAS 是什么、错误怎么用标准格式表达、分页/过滤/排序怎么设计、API 文档怎么自动生成。这些是「让 API 专业化」的关键。

## API 版本控制策略

API 一旦发布、有用户用了，你就不能随便改它——改个字段名，所有客户端都会崩。所以 API 需要**版本控制**：新版本和旧版本并存，给客户端迁移时间。

常见的版本控制策略有三种：

### 策略 1：URI 版本（最常用）

把版本号放在 URI 路径里：

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

优点：

- **一目了然**：看 URL 就知道版本。
- **好测试**：浏览器/curl 直接访问。
- **好缓存**：不同版本 URL 不同，缓存不会串。
- **好路由**：网关/Nginx 按路径前缀路由到不同服务版本。

缺点：

- URI 理论上应该只标识「资源」，版本不是资源属性。纯 REST 主义者觉得版本不该出现在 URI 里。
- 版本号一加，URI 变长。

实践：**这是最主流的做法**。GitHub、Twitter、Stripe 都用 URI 版本。务实优先。

Nginx 按版本路由示例：

\`\`\`nginx
# 老版本路由到 v1 服务
location /api/v1/ {
    proxy_pass http://v1-service:8000;
}
# 新版本路由到 v2 服务
location /api/v2/ {
    proxy_pass http://v2-service:8000;
}
\`\`\`

### 策略 2：Header 版本

版本放在自定义请求头里：

\`\`\`http
GET /users HTTP/1.1
Host: api.example.com
X-API-Version: 2

# 或用 Accept 头协商
GET /users HTTP/1.1
Host: api.example.com
Accept: application/vnd.example.v2+json
\`\`\`

优点：

- URI 干净，只标识资源，符合 REST 纯洁性。
- 一个 URL 对应「资源」概念，版本是「表现层」维度。

缺点：

- 不直观，看 URL 不知道版本。
- 测试麻烦（要带特定头）。
- 缓存要按头区分（Vary: X-API-Version），容易出错。
- 难在浏览器地址栏直接测。

实践：少数大公司用（如 GitHub 早期用过 Accept 头版本），现在不主流。

### 策略 3：Query 版本

版本放在查询参数里：

\`\`\`
/api/users?version=2
\`\`\`

优点：URI 路径不变，加个参数就行。

缺点：

- 容易忘带参数，默认版本行为不明确。
- 缓存按 query 参数区分，有些代理处理不好。
- 不如 URI 版本显眼。

实践：不推荐，用得少。

### 三种策略对比

| 策略 | 例子 | 优点 | 缺点 | 主流度 |
|------|------|------|------|--------|
| URI 版本 | /api/v2/users | 直观、好测、好路由 | URI 变长 | ⭐⭐⭐⭐⭐ |
| Header 版本 | X-API-Version: 2 | URI 干净 | 不直观、难测 | ⭐⭐ |
| Query 版本 | ?version=2 | 简单 | 易忘、缓存乱 | ⭐ |

**推荐：URI 版本**。简单、通用、生态支持好。别为了「REST 纯洁」牺牲实用性。

FastAPI 里实现 URI 版本，可以拆成多个路由前缀：

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# v1 路由
v1 = FastAPI()

@v1.get("/users")
def list_users_v1():
    # v1 返回 name 字段
    return [{"id": 1, "name": "Tom"}]

# v2 路由：字段改了（name 拆成 first_name/last_name）
v2 = FastAPI()

@v2.get("/users")
def list_users_v2():
    # v2 返回 first_name + last_name
    return [{"id": 1, "first_name": "Tom", "last_name": "Cat"}]

# 挂载到不同前缀
app.mount("/api/v1", v1)
app.mount("/api/v2", v2)
\`\`\`

## 版本迁移与废弃策略

版本控制的目的不是「永远维护 N 个版本」，而是「给客户端时间迁移」。所以要有清晰的废弃策略。

### 何时该出新版本

- **破坏性变更（Breaking Change）**：删字段、改字段类型、改语义、改 URL 结构 → 必须出新版本。
- **非破坏性变更**：加字段、加端点、加可选参数 → 不用新版本，老客户端照常能用。

判断准则：**老客户端会不会因为这个变更而坏掉？**会 → 破坏性，要新版本；不会 → 非破坏性，直接改。

### 废弃流程

1. **发布新版本 v2**，老版本 v1 继续可用。
2. **在 v1 响应头标记废弃**：

\`\`\`http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2025 23:59:59 GMT
Link: </api/v2/users>; rel="successor-version"

{"id": 1, "name": "Tom"}
\`\`\`

- \`Deprecation\` 头：标记已废弃（RFC 8594 草案）。
- \`Sunset\` 头：说明什么时候下线。
- \`Link\` 头：指向新版本，告诉客户端迁移到哪。

3. **通知开发者**：邮件、文档、控制台告警。
4. **观察迁移率**：监控 v1 流量，等大部分迁完。
5. **下线 v1**：到 Sunset 日期，返回 410 Gone 或 426 Upgrade Required。

\`\`\`http
GET /api/v1/users HTTP/1.1

HTTP/1.1 410 Gone
{"error": "gone", "message": "v1 已下线，请使用 /api/v2/users"}
\`\`\`

### 版本维护的工程建议

- **别同时维护太多版本**：2-3 个版本上限。再多维护成本爆炸。
- **新版本尽量复用底层逻辑**：v1/v2 共享 service 层，只是 response 模型不同。
- **提前规划**：设计 v1 时就考虑「未来可能怎么变」，留扩展余地。

## HATEOAS：超媒体作为应用状态引擎

HATEOAS（Hypermedia As The Engine Of Application State）是 Richardson 成熟度模型的最高级（Level 3）。核心思想：**响应里带上「下一步能干什么」的链接，客户端跟着链接走，不硬编码 URL**。

### 没有 HATEOAS 的世界

客户端硬编码所有 URL：

\`\`\`python
import http
# 客户端代码硬编码 URL
user = http.get("https://api.example.com/users/123")
orders = http.get(f"https://api.example.com/users/{user['id']}/orders")
http.post(f"https://api.example.com/orders/{orders[0]['id']}/cancel")
\`\`\`

问题：服务器改了 URL 结构（比如 \`/orders\` 改成 \`/purchases\`），客户端全挂，必须改代码重新发版。

### 有 HATEOAS 的世界

响应里带链接：

\`\`\`http
GET /users/123 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Tom",
  "_links": {
    "self": {"href": "/users/123"},
    "orders": {"href": "/users/123/orders"},
    "update": {"href": "/users/123", "method": "PATCH"},
    "delete": {"href": "/users/123", "method": "DELETE"}
  }
}
\`\`\`

客户端「跟着链接走」：

\`\`\`python
import http
# 客户端不硬编码 URL，从响应的 _links 里找
user = http.get("https://api.example.com/users/123")
# 找「orders」链接，访问它
orders_url = user["_links"]["orders"]["href"]
orders = http.get(orders_url)
# 找「cancel」链接，访问它
cancel_url = orders[0]["_links"]["cancel"]["href"]
http.post(cancel_url)
\`\`\`

服务器改了 URL 结构，只要链接关系（rel）不变，客户端不用改。

### HATEOAS 的链接关系（rel）

链接用 \`rel\`（relation）表达「这个链接是什么关系」：

| rel | 含义 |
|-----|------|
| self | 资源自身 |
| next | 下一页 |
| prev | 上一页 |
| create | 创建子资源 |
| update | 更新本资源 |
| delete | 删除本资源 |
| orders | 关联的订单 |

### HATEOAS 的现实

HATEOAS 理论很美，但工程上：

- **实现复杂**：服务端要为每个资源算一堆链接。
- **客户端复杂**：要实现「链接发现」逻辑，而不是直接拼 URL。
- **生态弱**：前端框架、移动端 SDK 普遍不原生支持，得自己封装。
- **类型不友好**：链接是动态的，静态类型语言处理起来麻烦。

结果：**真正用 HATEOAS 的公开 API 很少**。GitHub API 早期有 HATEOAS 链接，后来也简化了。多数 API 停在 Level 2（用对方法和状态码）。

> 务实建议：除非你做开放平台、要支持「自发现」，否则**不必强求 HATEOAS**。Level 2 性价比最高。如果要加，至少在分页（next/prev 链接）这种最有价值的地方用。

### FastAPI 简单实现 HATEOAS

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 带链接的资源模型
class UserWithLinks(BaseModel):
    id: int
    name: str
    _links: dict  # 超媒体链接

@app.get("/users/{user_id}", response_model=UserWithLinks)
def get_user(user_id: int):
    user = {"id": user_id, "name": "Tom"}
    # 为资源附加相关链接
    user["_links"] = {
        "self": {"href": f"/users/{user_id}", "method": "GET"},
        "update": {"href": f"/users/{user_id}", "method": "PATCH"},
        "delete": {"href": f"/users/{user_id}", "method": "DELETE"},
        "orders": {"href": f"/users/{user_id}/orders", "method": "GET"},
    }
    return user
\`\`\`

## 统一错误响应格式：RFC 7807 Problem Details

上一章我们设计了自定义错误响应格式。其实有个标准：**RFC 7807 Problem Details for HTTP APIs**，定义了统一的错误响应结构。

### RFC 7807 的字段

| 字段 | 类型 | 说明 |
|------|------|------|
| type | URI | 错误类型的文档链接（默认 "about:blank"） |
| title | string | 错误的简短描述 |
| status | number | HTTP 状态码 |
| detail | string | 详细描述 |
| instance | URI | 具体这次错误的标识（请求 ID） |

还可以加自定义扩展字段。

### 示例

\`\`\`http
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/forbidden",
  "title": "无权操作",
  "status": 403,
  "detail": "你不能删除其他用户的文章",
  "instance": "/posts/456",
  "user_id": 123,
  "resource": "post:456"
}
\`\`\`

关键点：

- **\`Content-Type: application/problem+json\`**：专门的媒体类型，客户端一看就知道是标准错误格式。
- **\`type\` 指向文档**：客户端可以打开链接看这个错误怎么处理。
- **可扩展**：\`user_id\`、\`resource\` 是自定义字段。

### FastAPI 实现 RFC 7807

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uuid

app = FastAPI()

# RFC 7807 标准错误响应
def problem_response(status_code: int, title: str, detail: str, 
                     error_type: str = "about:blank", instance: str = "", 
                     extra: dict = None):
    body = {
        "type": f"https://api.example.com/errors/{error_type}",
        "title": title,
        "status": status_code,
        "detail": detail,
        "instance": instance or str(uuid.uuid4()),
    }
    if extra:
        body.update(extra)  # 自定义扩展字段
    return JSONResponse(
        status_code=status_code,
        content=body,
        media_type="application/problem+json",  # 标准媒体类型
    )

# 全局异常处理
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    title_map = {
        400: "请求格式错误",
        401: "未认证",
        403: "无权访问",
        404: "资源不存在",
        409: "资源冲突",
        429: "请求过于频繁",
    }
    return problem_response(
        status_code=exc.status_code,
        title=title_map.get(exc.status_code, "错误"),
        detail=str(exc.detail),
        error_type=exc.__class__.__name__.lower(),
        instance=str(request.url.path),
    )

# 业务里 raise HTTPException，自动转成 RFC 7807 格式
@app.delete("/posts/{post_id}")
def delete_post(post_id: int, current_user_id: int = 1):
    post = get_post(post_id)  # 假设
    if post["author_id"] != current_user_id:
        raise HTTPException(status_code=403, detail="你不能删除别人的文章")
    return None
\`\`\`

响应：

\`\`\`http
DELETE /posts/456 HTTP/1.1

HTTP/1.1 403 Forbidden
Content-Type: application/problem+json

{
  "type": "https://api.example.com/errors/httpexception",
  "title": "无权访问",
  "status": 403,
  "detail": "你不能删除别人的文章",
  "instance": "/posts/456"
}
\`\`\`

用 RFC 7807 的好处：标准化、客户端能通用解析、有 \`type\` 链接文档。给第三方用的开放 API 特别推荐。

## 分页设计

列表接口默认返回所有数据是不现实的（数据多、慢、占带宽）。分页是必备。常见三种分页方式：

### 方式 1：offset/limit（偏移分页）

最经典的分页：跳过 offset 条，取 limit 条。

\`\`\`http
GET /users?offset=20&limit=10 HTTP/1.1

HTTP/1.1 200 OK
{
  "data": [{"id": 21}, {"id": 22}, ...],
  "pagination": {
    "offset": 20,
    "limit": 10,
    "total": 100,
    "next_offset": 30
  }
}
\`\`\`

或用 page/size：

\`\`\`http
GET /users?page=3&size=10 HTTP/1.1

HTTP/1.1 200 OK
{
  "data": [...],
  "pagination": {
    "page": 3,
    "size": 10,
    "total": 100,
    "total_pages": 10
  }
}
\`\`\`

优点：简单直观，能直接跳到第 N 页，能算总页数。

缺点：

- **大数据量慢**：\`OFFSET 100000 LIMIT 10\` 数据库要扫 100000 行才跳过，越往后越慢。
- **数据漂移**：翻页时如果有新数据插入，offset 会错位（第二页可能重复第一页的数据）。

适合：数据量小、后台管理界面、需要跳页。

### 方式 2：cursor（游标分页）

用「上一页最后一条的标记」作游标，取它之后的数据。

\`\`\`http
GET /users?limit=10&cursor=eyJpZCI6MjB9 HTTP/1.1

HTTP/1.1 200 OK
{
  "data": [{"id": 21}, ..., {"id": 30}],
  "pagination": {
    "next_cursor": "eyJpZCI6MzB9",  # 下一页游标（通常是 base64 编码的 id）
    "has_next": true
  }
}
\`\`\`

游标通常用最后一条的 id（或 created_at + id）编码而成。

SQL 层面：\`WHERE id > 30 ORDER BY id LIMIT 10\`，走索引，飞快，不管翻到第几页都一样快。

优点：

- **性能稳定**：不管翻多深，都走索引，快。
- **无数据漂移**：游标锁定位置，新插入数据不影响。

缺点：

- **不能跳页**：只能「上一页/下一页」，没法直接跳到第 100 页。
- **不能算总数**：只能知道「还有没有下一页」。
- **游标设计要小心**：排序字段改变，游标也得变。

适合：信息流、时间线、无限滚动（社交媒体的 feed）。

### 方式 3：page/size

其实就是 offset/limit 的换算（offset = (page-1) * size），用「第几页」表达，更符合用户直觉。优缺点同 offset/limit。

### 三种分页对比

| 方式 | 例子 | 跳页 | 性能 | 数据漂移 | 适用 |
|------|------|------|------|----------|------|
| offset/limit | ?offset=20&limit=10 | 能 | 深翻慢 | 有 | 后台、小数据 |
| page/size | ?page=3&size=10 | 能 | 深翻慢 | 有 | 后台、用户直觉 |
| cursor | ?cursor=abc&limit=10 | 不能 | 稳定快 | 无 | 信息流、大数据 |

### FastAPI 分页实现

\`\`\`python
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Optional
import base64, json

app = FastAPI()

# 模拟数据
all_users = [{"id": i, "name": f"user_{i}"} for i in range(1, 1001)]

class PaginationInfo(BaseModel):
    total: int
    offset: int
    limit: int
    next_offset: Optional[int] = None

class UserListResponse(BaseModel):
    data: list
    pagination: PaginationInfo

# offset/limit 分页
@app.get("/users", response_model=UserListResponse)
def list_users(offset: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    """偏移分页：?offset=20&limit=10"""
    data = all_users[offset:offset + limit]
    total = len(all_users)
    next_offset = offset + limit if offset + limit < total else None
    return {
        "data": data,
        "pagination": {
            "total": total,
            "offset": offset,
            "limit": limit,
            "next_offset": next_offset,
        },
    }

# cursor 分页
def encode_cursor(last_id: int) -> str:
    """把最后一条 id 编码成游标"""
    return base64.b64encode(json.dumps({"id": last_id}).encode()).decode()

def decode_cursor(cursor: str) -> int:
    """从游标解出 id"""
    return json.loads(base64.b64decode(cursor)).get("id", 0)

@app.get("/users/feed")
def list_users_feed(limit: int = Query(10, ge=1, le=100), 
                    cursor: Optional[str] = None):
    """游标分页：?limit=10&cursor=eyJpZCI6MjB9"""
    # 解出游标里的 id，从它之后取
    last_id = decode_cursor(cursor) if cursor else 0
    # WHERE id > last_id ORDER BY id LIMIT limit（这里用列表模拟）
    data = [u for u in all_users if u["id"] > last_id][:limit]
    has_next = len(data) == limit
    next_cursor = encode_cursor(data[-1]["id"]) if has_next and data else None
    return {
        "data": data,
        "pagination": {
            "limit": limit,
            "next_cursor": next_cursor,
            "has_next": has_next,
        },
    }
\`\`\`

## 过滤、排序、字段选择

除了分页，列表接口还要支持过滤、排序、字段选择。

### 过滤

用查询参数过滤：

\`\`\`http
# 精确过滤
GET /users?role=admin&status=active HTTP/1.1

# 范围过滤（约定前缀）
GET /orders?created_at_gte=2024-01-01&created_at_lt=2024-02-01 HTTP/1.1

# 模糊搜索
GET /users?name_like=tom HTTP/1.1
\`\`\`

常见约定：

| 操作 | 后缀 | 例子 |
|------|------|------|
| 等于 | （无） | ?role=admin |
| 大于 | _gt | ?age_gt=18 |
| 大于等于 | _gte | ?created_at_gte=2024-01-01 |
| 小于 | _lt | ?price_lt=100 |
| 模糊匹配 | _like | ?name_like=tom |
| 包含 | _in | ?id_in=1,2,3 |

### 排序

用 \`sort\` 参数，约定：

- 升序：字段名，如 \`?sort=created_at\`。
- 降序：前缀 \`-\`，如 \`?sort=-created_at\`（按创建时间倒序）。
- 多字段：逗号分隔，如 \`?sort=-created_at,name\`（先按创建时间倒序，再按名字升序）。

\`\`\`http
GET /users?sort=-created_at,name HTTP/1.1
\`\`\`

### 字段选择

客户端只想要几个字段，用 \`fields\` 参数：

\`\`\`http
# 只要 id 和 name，省流量
GET /users?fields=id,name HTTP/1.1

HTTP/1.1 200 OK
[{"id": 1, "name": "Tom"}, {"id": 2, "name": "Jerry"}]
\`\`\`

这对移动端特别有用（省流量、省解析时间）。GraphQL 的「按需取字段」其实就是这个思路的极致版。

### FastAPI 综合 demo

\`\`\`python
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI()

all_users = [
    {"id": 1, "name": "Tom", "role": "admin", "age": 25, "created_at": "2024-01-01"},
    {"id": 2, "name": "Jerry", "role": "user", "age": 30, "created_at": "2024-01-02"},
    {"id": 3, "name": "Spike", "role": "admin", "age": 28, "created_at": "2024-01-03"},
]

@app.get("/users")
def list_users(
    role: Optional[str] = None,           # 过滤：角色
    age_gt: Optional[int] = None,         # 过滤：年龄大于
    sort: str = "id",                     # 排序：默认按 id
    fields: Optional[str] = None,         # 字段选择：逗号分隔
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    result = all_users.copy()
    
    # 过滤
    if role:
        result = [u for u in result if u["role"] == role]
    if age_gt is not None:
        result = [u for u in result if u["age"] > age_gt]
    
    # 排序：支持多字段，- 表示降序
    sort_keys = sort.split(",")
    for key in reversed(sort_keys):  # 反向排保证多字段优先级
        reverse = key.startswith("-")
        k = key.lstrip("-")
        result.sort(key=lambda u: u.get(k, 0), reverse=reverse)
    
    total = len(result)
    # 分页
    result = result[offset:offset + limit]
    
    # 字段选择
    if fields:
        keep = set(fields.split(","))
        result = [{k: v for k, v in u.items() if k in keep} for u in result]
    
    return {
        "data": result,
        "pagination": {"total": total, "offset": offset, "limit": limit},
    }
\`\`\`

测试：

\`\`\`http
# 查 admin 角色、年龄大于 26、按年龄降序、只要 id 和 name
GET /users?role=admin&age_gt=26&sort=-age&fields=id,name HTTP/1.1

HTTP/1.1 200 OK
{
  "data": [{"id": 3, "name": "Spike"}],
  "pagination": {"total": 1, "offset": 0, "limit": 10}
}
\`\`\`

## API 文档：OpenAPI/Swagger 自动生成

API 文档是 API 的「使用说明书」。手写文档容易和代码脱节，最好的办法是**从代码自动生成**。**OpenAPI**（前身叫 Swagger）是 REST API 描述的事实标准。

### OpenAPI 是什么

OpenAPI 是一个规范（specification），用 JSON/YAML 描述你的 API：有哪些端点、每个端点接受什么参数、返回什么、用什么认证。一份 OpenAPI 文件，就能：

- 自动生成交互式文档（Swagger UI），让人在线试 API。
- 自动生成客户端 SDK（各种语言）。
- 让 IDE 智能提示。
- 给 Mock 服务、测试工具用。

### FastAPI 自动生成 OpenAPI

FastAPI 基于 Pydantic 模型和类型注解，**自动生成 OpenAPI 文档**，零配置。

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="用户管理 API",
    description="一个演示用的用户 CRUD API",
    version="1.0.0",
)

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="用户名")
    email: str = Field(..., description="邮箱")
    age: int = Field(None, ge=0, le=150, description="年龄")

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int

@app.post("/users", response_model=UserResponse, status_code=201,
          summary="创建用户", tags=["用户"])
def create_user(user: UserCreate):
    """
    创建一个新用户。
    
    - **name**: 用户名，1-50 字符
    - **email**: 邮箱
    - **age**: 年龄，0-150
    """
    return {"id": 1, **user.model_dump()}
\`\`\`

启动后访问：

- \`http://localhost:8000/docs\` —— **Swagger UI**，交互式文档，能直接在网页上发请求试。
- \`http://localhost:8000/redoc\` —— **ReDoc**，更美观的只读文档。
- \`http://localhost:8000/openapi.json\` —— 原始 OpenAPI JSON，可导入其他工具。

Swagger UI 长这样：每个端点一张卡片，点开能看到参数说明、示例，点「Try it out」直接发请求。前端、测试、第三方集成都能用它快速上手。

### 写好文档的要点

OpenAPI 自动生成，但质量取决于你怎么写代码：

1. **用类型注解和 Pydantic 模型**：参数类型、返回结构自动进文档。
2. **写 docstring**：函数的 docstring 会变成端点描述。
3. **用 \`Field\` 加描述和约束**：\`Field(description="...", min_length=1)\` 让字段说明更清晰。
4. **用 \`tags\` 分组**：把相关端点归类，文档更清晰。
5. **加 \`summary\`**：端点的简短标题。
6. **设 \`response_model\`**：明确返回结构。
7. **文档化错误响应**：用 \`responses\` 参数说明可能的状态码。

\`\`\`python
@app.post("/users", response_model=UserResponse,
          responses={
              409: {"description": "邮箱已注册"},
              422: {"description": "参数校验失败"},
          })
def create_user(user: UserCreate):
    ...
\`\`\`

这样 Swagger UI 会显示这个端点可能返回 201/409/422，每个都有说明。

## 综合示例：一个规范的列表接口

把分页、过滤、排序、字段选择、文档全合起来：

\`\`\`python
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import uuid

app = FastAPI(title="博客 API", version="1.0.0")

# 模拟数据
posts_db = [
    {"id": i, "title": f"文章{i}", "status": "published" if i % 2 else "draft",
     "author_id": (i % 3) + 1, "views": i * 10, "created_at": f"2024-01-{i:02d}"}
    for i in range(1, 101)
]

class PostResponse(BaseModel):
    id: int
    title: str
    status: str
    author_id: int
    views: int
    created_at: str

@app.get("/posts", response_model=list[PostResponse],
         summary="获取文章列表", tags=["文章"])
def list_posts(
    status: Optional[str] = Query(None, description="按状态过滤: published/draft"),
    author_id: Optional[int] = Query(None, description="按作者过滤"),
    views_gte: Optional[int] = Query(None, description="阅读量大于等于"),
    sort: str = Query("-created_at", description="排序，- 表示降序，多字段逗号分隔"),
    fields: Optional[str] = Query(None, description="只返回指定字段，逗号分隔"),
    offset: int = Query(0, ge=0, description="偏移量"),
    limit: int = Query(10, ge=1, le=100, description="每页数量"),
):
    """支持过滤、排序、字段选择、分页的文章列表接口"""
    result = posts_db.copy()
    
    # 过滤
    if status:
        result = [p for p in result if p["status"] == status]
    if author_id:
        result = [p for p in result if p["author_id"] == author_id]
    if views_gte is not None:
        result = [p for p in result if p["views"] >= views_gte]
    
    total = len(result)
    
    # 排序
    for key in reversed(sort.split(",")):
        reverse = key.startswith("-")
        k = key.lstrip("-")
        result.sort(key=lambda p: p.get(k, 0), reverse=reverse)
    
    # 分页
    result = result[offset:offset + limit]
    
    # 字段选择
    if fields:
        keep = set(fields.split(","))
        result = [{k: v for k, v in p.items() if k in keep} for p in result]
    
    return result
\`\`\`

启动后 \`/docs\` 自动有完整文档，前端照着用：

\`\`\`http
# 查已发布、阅读量大于等于 50、按阅读量降序、只要 id 和 title、第 2 页
GET /posts?status=published&views_gte=50&sort=-views&fields=id,title&offset=10&limit=10 HTTP/1.1

HTTP/1.1 200 OK
[
  {"id": 99, "title": "文章99"},
  {"id": 97, "title": "文章97"},
  {"id": 95, "title": "文章95"}
]
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 版本乱放 | Query 版本易忘 | URI 版本 /api/v1/ |
| 维护太多版本 | 同时 5 个版本 | 2-3 个上限，及时废弃 |
| 大列表不分页 | 返回所有数据 | 必须分页 |
| 深翻用 offset | 第 10 万页用 offset | 用 cursor 分页 |
| 文档手写 | Markdown 手写易脱节 | 用 OpenAPI 自动生成 |
| 错误格式不统一 | 每个接口错误格式不同 | 统一用 RFC 7807 |
| 强求 HATEOAS | 全加链接成本高 | Level 2 够用，分页加链接即可 |

## 小结

这一章是 REST 进阶。版本控制首选 URI 版本（\`/api/v1/\`），简单实用；废弃要标 \`Deprecation\`/\`Sunset\` 头给客户端迁移时间。HATEOAS 理论美好但工程成本高，Level 2 是性价比之选。错误响应用 RFC 7807 标准格式（\`application/problem+json\`），专业、可解析。分页按场景选：后台用 offset/limit，信息流用 cursor。过滤、排序、字段选择用约定好的查询参数。最后，用 OpenAPI 自动生成文档——FastAPI 这点极强，写好类型注解和 docstring，文档免费来。

至此 RESTful API 设计的核心就讲完了。接下来我们会进入 WSGI/ASGI，看 Python Web 服务器是怎么把这些 API 跑起来的。`
  },
];
