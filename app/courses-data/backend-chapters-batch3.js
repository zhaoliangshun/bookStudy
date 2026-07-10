export const chapters = [
  {
    id: "backend-rest",
    group: "API 设计与架构",
    icon: "🔗",
    title: "RESTful API 设计",
    content: `# RESTful API 设计

## 一、什么是 REST

REST（Representational State Transfer，表述性状态转移）是 Roy Fielding 在 2000 年的博士论文中提出的一种软件架构风格。它并不是一种协议，也不是一种标准，而是一组架构约束条件和设计原则。满足这些约束的架构被称为 RESTful 架构。

理解 REST 的关键在于理解"资源"这个概念。在 REST 中，网络上的任何事物都可以被抽象为资源：一个用户、一篇文章、一张图片、一次订单，都是资源。每个资源都有一个唯一的标识符（URI），客户端通过操作资源的表现层（Representation）来改变资源的状态（State），这就是"表述性状态转移"这个名字的由来。

REST 构建在 HTTP 协议之上，充分利用了 HTTP 的语义。它强调使用标准的 HTTP 方法（GET、POST、PUT、DELETE、PATCH）来操作资源，使用 HTTP 状态码来表示操作结果，使用 MIME 类型来表示数据格式。这种设计使得 RESTful API 具有自描述性、可缓存性、可扩展性等优点。

### 1.1 REST 的本质

REST 的本质是"以资源为中心"。传统的 RPC 风格 API 以"动作"为中心，比如 \`getUserInfo\`、\`createOrder\`、\`deleteArticle\`，每个 URL 对应一个动作。而 REST 以"资源"为中心，URL 标识资源，HTTP 方法表示动作：

| 风格 | 示例 URL | 说明 |
|------|---------|------|
| RPC 风格 | POST /getUserInfo | URL 是动词 |
| REST 风格 | GET /users/123 | URL 是名词，方法表示动作 |

这种转变看似简单，但它带来了一系列深远的影响：URL 变得更加统一、可预测，HTTP 方法的语义被充分利用，缓存成为可能，API 的扩展性大大增强。

### 1.2 REST 的历史背景

在 REST 出现之前，Web 服务主要使用 SOAP（Simple Object Access Protocol）和 XML-RPC。SOAP 协议沉重、复杂，需要定义 WSDL（Web Services Description Language），消息体使用冗长的 XML，学习和实现成本都很高。REST 的出现是对这种复杂性的一种反抗，它提倡使用轻量级的 HTTP 协议，用 JSON 替代 XML，用简单的约定替代复杂的规范。

随着 Web 2.0 和移动互联网的发展，RESTful API 逐渐成为 Web API 的事实标准。GitHub、Twitter、Stripe、AWS 等大公司的 API 都采用了 RESTful 风格，进一步推动了 REST 的普及。

## 二、REST 的六大核心约束

REST 架构有六个核心约束（Constraint）。一个架构只有满足这六个约束，才能被称为 RESTful 架构。其中前五个是必须的，第六个是可选的。

### 2.1 客户端-服务器架构（Client-Server）

这个约束要求将用户界面（客户端）和数据存储（服务器）的关注点分离。分离的好处是：

1. 客户端和服务器可以独立演进。客户端的 UI 改动不影响服务器，服务器的数据库迁移不影响客户端。
2. 提高了客户端的可移植性。同一个服务器可以服务于 Web、iOS、Android 等多种客户端。
3. 服务器变得可扩展。因为不维护 UI 状态，服务器更容易水平扩展。

在实际开发中，这意味着 API 应该只返回数据，不应该包含任何与展示相关的内容。比如，API 不应该返回 HTML 片段，不应该返回"显示为红色"这样的提示，这些应该由客户端自己处理。

### 2.2 无状态（Stateless）

这是 REST 最重要的约束之一。无状态要求客户端的每次请求都必须包含服务器理解该请求所需的所有信息，服务器不能在两次请求之间保存客户端的任何状态。

换句话说，每个请求都是独立的。服务器处理一个请求时，不需要依赖之前的任何请求。这使得：

1. 服务器不需要维护会话状态，内存占用更低。
2. 服务器可以水平扩展，任何一台服务器都可以处理任何请求（因为不依赖状态）。
3. 可见性更好，每个请求都是自包含的，便于调试和监控。
4. 可靠性更高，服务器崩溃后不会丢失会话状态。

但无状态也有代价：每次请求都要传输认证信息（如 Token），可能增加网络开销。这也是 JWT（JSON Web Token）流行的原因——它将状态编码在 Token 中，由客户端携带，服务器无需存储。

需要注意，无状态指的是"通信无状态"，不是说服务器不能有数据。服务器当然有数据库，有业务数据，只是不在内存中保存"某个客户端进行到哪一步了"这样的会话状态。

### 2.3 可缓存（Cacheable）

REST 要求响应必须明确标识自己是否可缓存。如果可缓存，客户端可以缓存响应并在后续请求中复用，避免重复请求服务器。

HTTP 通过 Cache-Control、ETag、Last-Modified 等头部来控制缓存：

- Cache-Control: max-age=3600 表示缓存有效期为 3600 秒
- ETag 是资源的唯一标识，服务器可以用 304 Not Modified 告诉客户端缓存仍然有效
- Last-Modified 表示资源的最后修改时间

缓存是 REST 性能优化的关键。良好的缓存策略可以大幅减少服务器负载和网络延迟。但缓存管理也是复杂的，缓存不当会导致数据不一致问题。

在 API 设计中，GET 请求的响应通常可缓存，而 POST、PUT、DELETE 的响应通常不可缓存。设计 API 时应该明确告诉客户端缓存策略。

### 2.4 统一接口（Uniform Interface）

统一接口是 REST 区别于其他架构风格的最核心特征。它通过四个子约束来实现：

#### 2.4.1 资源的标识（Identification of Resources）

每个资源都有一个唯一的 URI。URI 是资源的身份证，通过 URI 可以定位到资源。URI 应该是名词性的，表示资源本身，而不是动作。

好的 URI 示例：
- /users/123
- /orders/456/items
- /articles/789/comments

坏的 URI 示例：
- /getUser?id=123（动词）
- /deleteOrder/456（动词）
- /createArticle（动词）

#### 2.4.2 通过表现层操作资源（Manipulation of Resources through Representations）

客户端通过操作资源的表现层来改变资源的状态。表现层是资源在某一时刻的"快照"，通常是 JSON 或 XML 格式。客户端获取资源的表现层，修改它，然后 PUT/PATCH 回服务器，服务器据此更新资源的状态。

这意味着同一个资源可以有多种表现层。比如 /users/123 可以返回 JSON，也可以返回 XML，通过 Content-Type 头部协商。这就是"内容协商"（Content Negotiation）。

#### 2.4.3 自描述消息（Self-descriptive Messages）

每个消息都必须包含足够的信息，让接收者能够理解如何处理它。这通过 HTTP 头部实现：

- Content-Type 告诉接收者消息体是什么格式
- Content-Length 告诉接收者消息体有多长
- Cache-Control 告诉接收者如何缓存

自描述消息使得消息可以被独立处理，不需要依赖外部上下文。

#### 2.4.4 超媒体作为应用状态的引擎（HATEOAS）

HATEOAS 是统一接口中最复杂、也最少被实现的一个约束。它要求响应中包含超链接，客户端通过这些链接来发现可执行的后续操作，就像浏览网页一样。

例如，获取一个订单后，响应中不仅包含订单数据，还包含可执行操作的链接：

\`\`\`json
{
  "id": 456,
  "status": "pending",
  "total": 99.9,
  "_links": {
    "self": { "href": "/orders/456" },
    "cancel": { "href": "/orders/456/cancel", "method": "POST" },
    "pay": { "href": "/orders/456/pay", "method": "POST" },
    "ship": { "href": "/orders/456/ship", "method": "POST" }
  }
}
\`\`\`

HATEOAS 的好处是客户端不需要硬编码 URL，API 的变更对客户端影响更小。但实践中，HATEOAS 实现复杂，且对机器客户端帮助有限，很多 API 并没有严格实现它。

### 2.5 分层系统（Layered System）

REST 允许架构分为多个层次，每一层只与相邻的层交互。客户端不知道、也不需要知道它是直接连到服务器，还是连到中间的代理、负载均衡器、网关。

分层系统的好处：
1. 各层可以独立替换和升级。
2. 中间层可以实现缓存、负载均衡、安全策略等功能。
3. 复杂度被分层隔离，每层只关注自己的职责。

现代微服务架构大量使用分层：客户端 -> CDN -> API 网关 -> 微服务 -> 数据库。每一层都是透明的，客户端只看到 API 网关这一层。

### 2.6 按需代码（Code on Demand，可选）

这是唯一可选的约束。它允许服务器临时向客户端发送可执行代码（如 JavaScript），客户端执行这些代码来扩展自己的功能。典型的例子是浏览器从服务器下载并执行 JavaScript。

这个约束很少在 API 中使用，因为它增加了复杂性和安全风险。大多数 RESTful API 不实现这个约束。

## 三、URI 设计规范

URI 设计是 RESTful API 设计中最直观的部分。好的 URI 应该是直观的、可预测的、自解释的。

### 3.1 使用名词复数

URI 应该使用名词的复数形式来表示资源集合：

- /users（用户集合）
- /orders（订单集合）
- /articles（文章集合）

为什么用复数？因为 /users 既可以表示集合（GET /users 返回所有用户），也可以表示单个资源（GET /users/123 返回某个用户）。如果用单数 /user，处理集合时就不够自然。

好与坏的对比：

| 好的 URI | 坏的 URI | 原因 |
|---------|---------|------|
| GET /users | GET /getAllUsers | 动词不该出现在 URI |
| GET /users/123 | GET /getUser?id=123 | 应该用路径而非查询参数标识资源 |
| POST /users | POST /createUser | POST 本身就有创建语义 |
| DELETE /users/123 | POST /deleteUser?id=123 | DELETE 本身就有删除语义 |
| PUT /users/123 | POST /updateUser | PUT 本身就有更新语义 |

### 3.2 层级关系表达

资源的层级关系通过 URI 路径表达。子资源作为父资源路径的延续：

- /users/123/orders：用户 123 的所有订单
- /orders/456/items：订单 456 的所有商品项
- /articles/789/comments：文章 789 的所有评论

但层级不要太深，一般不超过 2-3 层。太深的层级会让 URI 冗长且难以维护。如果层级关系确实很深，可以考虑用查询参数或者单独的资源来表达：

- /comments?articleId=789 比 /articles/789/comments/456/replies/789 更简洁

### 3.3 查询参数的使用

查询参数用于过滤、排序、分页、字段选择等，不用于标识资源：

- 过滤：GET /users?role=admin&status=active
- 排序：GET /users?sort=-created_at,name
- 分页：GET /users?page=1&size=20
- 字段选择：GET /users/123?fields=id,name,email

查询参数的命名应该清晰、一致。多个词用下划线或驼峰，但要全局统一：

- 推荐：created_at（与 JSON 字段命名一致）或 createdAt
- 不推荐：createdAt 和 created_at 混用

### 3.4 命名约定

1. 全小写，单词之间用连字符（-）分隔：/user-profiles 而非 /userProfiles 或 /user_profiles。但实践中，驼峰和下划线也被广泛使用，关键是全局统一。
2. 不要在 URI 中使用文件扩展名：/users.json 是不必要的，应该用 Accept 头部协商格式。
3. 不要在 URI 中使用动词：除非是特殊操作（如 /users/123/activate，这种"动作型"资源可以用动词）。
4. 使用稳定的标识符：资源 ID 应该是不变的、不透明的。

### 3.5 特殊操作的处理

有些操作不是简单的 CRUD，比如"激活用户"、"取消订单"、"审批申请"。这些怎么用 REST 表达？

方案一：将操作视为子资源，用 POST 触发：

- POST /users/123/activations（创建一个"激活"资源）
- POST /orders/456/cancellations（创建一个"取消"资源）
- POST /applications/789/approvals（创建一个"审批"资源）

方案二：使用自定义 HTTP 方法（不推荐，因为不被广泛支持）。

方案三：直接用动词路径（务实派，被广泛使用）：

- POST /users/123/activate
- POST /orders/456/cancel

虽然这违反了"URI 用名词"的原则，但在实践中被广泛接受，因为它直观、易于理解。关键是保持团队内部一致。

## 四、HTTP 方法语义与幂等性

HTTP 方法定义了对资源的操作语义。理解每个方法的语义和性质，是设计 RESTful API 的基础。

### 4.1 GET：获取资源

GET 方法用于获取资源的表示。它是安全且幂等的。

- 安全（Safe）：GET 不应该改变服务器上的任何状态。多次调用 GET 不会产生副作用。
- 幂等（Idempotent）：多次调用 GET 返回相同的结果（假设资源没有在中间被修改）。

GET 的特点：
1. 参数通过 URL 传递，有长度限制（取决于服务器和浏览器）。
2. 可以被缓存。
3. 会被浏览器历史记录、书签保存。
4. 不应该在请求体中发送数据（虽然技术上可以，但不符合规范）。

\`\`\`http
GET /users/123 HTTP/1.1
Accept: application/json
\`\`\`

### 4.2 POST：创建资源

POST 方法用于创建新资源。它既不安全也不幂等。

- 不安全：POST 会改变服务器状态（创建新资源）。
- 不幂等：多次调用 POST 会创建多个资源。

POST 的特点：
1. 数据通过请求体发送，没有长度限制。
2. 不会被缓存。
3. 创建资源后，应该返回 201 Created 状态码和新资源的 URI。

\`\`\`http
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com"}
\`\`\`

注意：POST 也可以用于其他"不幂等"的操作，比如复杂查询（查询条件太长无法放在 URL 中）、文件上传等。

### 4.3 PUT：完整更新资源

PUT 方法用于完整更新（或创建）资源。它是幂等的但不安全。

- 不安全：PUT 会改变资源状态。
- 幂等：多次调用 PUT 用相同数据更新，结果相同。

PUT 的语义是"用请求体中的数据完整替换目标资源"。如果资源已存在，整个资源被替换；如果不存在，有些实现会创建它。

关键区别：PUT 是完整更新，客户端必须提供资源的所有字段。未提供的字段会被设置为默认值或 null。

\`\`\`http
PUT /users/123 HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@new.com", "age": 25}
\`\`\`

### 4.4 PATCH：部分更新资源

PATCH 方法用于部分更新资源。它不安全，幂等性视实现而定。

PATCH 只更新请求体中包含的字段，其他字段保持不变。这解决了 PUT 必须提供所有字段的问题。

\`\`\`http
PATCH /users/123 HTTP/1.1
Content-Type: application/json

{"email": "alice@new.com"}
\`\`\`

PATCH 的幂等性比较复杂：
- 如果 PATCH 操作是"设置 email 为 X"，那么它是幂等的。
- 如果 PATCH 操作是"增加 age 1"，那么它不是幂等的。
- RFC 5789 建议 PATCH 操作应该是幂等的，但实际上很多 PATCH 实现并非严格幂等。

### 4.5 DELETE：删除资源

DELETE 方法用于删除资源。它不安全但幂等。

- 不安全：DELETE 会改变资源状态。
- 幂等：多次删除同一个资源，结果相同（资源都被删除了）。

\`\`\`http
DELETE /users/123 HTTP/1.1
\`\`\`

DELETE 成功通常返回 204 No Content（无返回体）或 200 OK（带返回体说明删除结果）。

### 4.6 HEAD 与 OPTIONS

- HEAD：与 GET 类似，但只返回头部，不返回体。用于检查资源是否存在、获取元信息。
- OPTIONS：用于查询服务器支持的方法。响应的 Allow 头部列出支持的方法。常用于 CORS 预检请求。

### 4.7 幂等性总结表

| 方法 | 安全 | 幂等 | 用途 | 请求体 |
|------|------|------|------|--------|
| GET | 是 | 是 | 获取资源 | 无 |
| POST | 否 | 否 | 创建资源 | 有 |
| PUT | 否 | 是 | 完整更新/创建 | 有 |
| PATCH | 否 | 视实现 | 部分更新 | 有 |
| DELETE | 否 | 是 | 删除资源 | 可选 |
| HEAD | 是 | 是 | 获取头部 | 无 |
| OPTIONS | 是 | 是 | 查询支持的方法 | 无 |

理解幂等性非常重要，因为它关系到重试的安全性。网络不稳定时，客户端可能重试请求。如果请求是幂等的，重试是安全的；如果不是，重试可能导致重复操作。

## 五、HTTP 状态码的正确使用

HTTP 状态码是 API 与客户端沟通的重要方式。正确使用状态码，可以让客户端无需解析响应体就能了解请求的结果。

### 5.1 状态码分类

- 1xx 信息性：很少使用
- 2xx 成功
- 3xx 重定向
- 4xx 客户端错误
- 5xx 服务器错误

### 5.2 常用 2xx 状态码

- 200 OK：请求成功。GET、PUT、PATCH、DELETE 成功后常用。
- 201 Created：资源创建成功。POST 成功后应该返回 201，并在 Location 头部包含新资源的 URI。
- 202 Accepted：请求已接受，但处理尚未完成。用于异步操作。
- 204 No Content：成功但无返回内容。DELETE 成功后常用，PUT 更新后也可用。

201 vs 204 的选择：
- 创建资源用 201，因为需要返回新资源的信息。
- 删除资源用 204，因为没有内容需要返回。
- 更新资源可以用 200（返回更新后的资源）或 204（不返回内容）。

### 5.3 常用 4xx 状态码

- 400 Bad Request：请求格式错误，服务器无法理解。比如 JSON 解析失败、缺少必需参数。
- 401 Unauthorized：未认证。客户端需要提供认证信息。（注：状态码名称有误导性，实际是"未认证"而非"未授权"）
- 403 Forbidden：已认证但无权限。服务器理解请求但拒绝执行。
- 404 Not Found：资源不存在。
- 405 Method Not Allowed：方法不允许。比如对只支持 GET 的资源用 POST。
- 409 Conflict：冲突。比如创建已存在的资源、并发修改冲突。
- 422 Unprocessable Entity：语义错误。请求格式正确但语义不合法，比如邮箱格式错误、年龄为负数。
- 429 Too Many Requests：请求过多，被限流。

400 vs 422 的区别：
- 400：请求格式错误，服务器无法解析。比如 JSON 语法错误。
- 422：请求格式正确，但语义不合法。比如 email 字段不是有效的邮箱格式。
- 实践中两者经常混用，但区分它们能让客户端更精确地处理错误。

### 5.4 常用 5xx 状态码

- 500 Internal Server Error：服务器内部错误。代码异常、数据库错误等。
- 501 Not Implemented：服务器不支持该功能。
- 502 Bad Gateway：网关错误。网关从上游服务器收到无效响应。
- 503 Service Unavailable：服务不可用。服务器过载或维护中。
- 504 Gateway Timeout：网关超时。网关等待上游服务器响应超时。

### 5.5 状态码使用建议

1. 不要所有错误都返回 200，然后在响应体里用 code 字段表示错误。这违反 HTTP 语义。
2. 不要过度使用 500。客户端错误（4xx）不应该用 500。
3. 错误响应应该包含足够的错误信息，帮助客户端理解和处理错误。

良好的错误响应格式：

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "邮箱格式不正确",
    "details": [
      {
        "field": "email",
        "issue": "must be a valid email address"
      }
    ],
    "requestId": "abc-123"
  }
}
\`\`\`

## 六、API 版本管理策略

API 一旦发布，就很难再修改。为了保证向后兼容，同时允许 API 演进，版本管理是必要的。

### 6.1 URL 路径版本

在 URL 路径中包含版本号：

- /v1/users
- /v2/users

优点：
1. 简单直观，客户端容易理解。
2. 容易测试和调试（直接看 URL 就知道版本）。
3. 对客户端实现要求低。

缺点：
1. 不符合 REST"URI 标识资源"的理念（版本不是资源的一部分）。
2. 版本切换需要修改所有 URL。

这是最常用的版本管理方式，GitHub、Twitter 等都采用这种方式。

### 6.2 自定义 Header 版本

通过自定义 HTTP 头部传递版本：

\`\`\`http
GET /users HTTP/1.1
X-API-Version: 2
\`\`\`

优点：
1. URL 保持简洁。
2. 版本信息不会出现在 URL 中。

缺点：
1. 不直观，调试困难。
2. 不符合 HTTP 标准（自定义头部）。

### 6.3 Accept Header 版本（内容协商）

通过 Accept 头部传递版本：

\`\`\`http
GET /users HTTP/1.1
Accept: application/vnd.myapi.v2+json
\`\`\`

优点：
1. 符合 HTTP 内容协商机制。
2. URL 保持简洁。
3. 可以同时支持多种版本和格式。

缺点：
1. 复杂，客户端实现成本高。
2. 不直观，难以调试。

GitHub API 同时支持 URL 版本和 Accept 版本。

### 6.4 版本管理策略对比

| 策略 | 简单性 | 可见性 | 符合 HTTP | 客户端成本 | 使用率 |
|------|--------|--------|-----------|-----------|--------|
| URL 路径 | 高 | 高 | 低 | 低 | 最高 |
| 自定义 Header | 中 | 低 | 中 | 中 | 低 |
| Accept Header | 低 | 低 | 高 | 高 | 中 |

实践建议：大多数情况下选择 URL 路径版本，因为它最简单、最直观、客户端成本最低。版本号的更新频率应该尽量低，通过添加字段（而非修改字段）来实现向后兼容的演进。

### 6.5 何时需要新版本

不是所有改动都需要新版本。以下情况需要新版本：
1. 移除或重命名字段（破坏性变更）。
2. 改变字段的数据类型。
3. 改变 API 的行为语义。

以下情况不需要新版本：
1. 添加新字段（向后兼容）。
2. 添加新端点。
3. 添加可选参数。

## 七、分页方案对比

当资源集合很大时，不可能一次性返回所有数据。分页是必要的。

### 7.1 偏移分页（Offset/Limit）

最简单的分页方式：

\`\`\`
GET /users?offset=20&limit=20
GET /users?page=2&size=20
\`\`\`

服务器返回：

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "size": 20,
    "total": 1000,
    "totalPages": 50
  }
}
\`\`\`

优点：
1. 简单直观。
2. 支持跳转到任意页。
3. 客户端可以显示总页数。

缺点：
1. 性能问题：OFFSET 在数据库中需要扫描跳过的行，大数据量下很慢。\`OFFSET 1000000 LIMIT 20\` 需要扫描 100 万行。
2. 数据漂移问题：如果在分页过程中有新数据插入，后续页的数据会偏移，可能导致重复或遗漏。

### 7.2 游标分页（Cursor）

游标分页使用一个"游标"来标记位置：

\`\`\`
GET /users?cursor=eyJpZCI6MTIzfQ&limit=20
\`\`\`

服务器返回：

\`\`\`json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
\`\`\`

游标通常是基于排序字段的值（如 ID、时间戳）编码而成。查询时使用 WHERE id > cursor_id LIMIT 20，避免了 OFFSET 扫描。

优点：
1. 性能稳定：无论翻到第几页，查询性能都一样（利用索引）。
2. 无数据漂移：基于游标位置查询，不受新数据插入影响。

缺点：
1. 不能跳转到任意页，只能顺序翻页。
2. 客户端不知道总数。
3. 实现更复杂。

### 7.3 何时用游标分页

- 数据量大（百万级以上）时，必须用游标分页，否则 OFFSET 会拖垮数据库。
- 实时性强的数据（如时间线、消息流）用游标分页，避免数据漂移。
- 需要跳页、显示总页数的场景用偏移分页。

Twitter、Facebook 的时间线用游标分页。管理后台的列表通常用偏移分页。

### 7.4 分页响应的最佳实践

无论哪种分页，响应中都应包含导航信息：

\`\`\`json
{
  "data": [...],
  "meta": {
    "page": 2,
    "perPage": 20,
    "total": 1000,
    "totalPages": 50
  },
  "links": {
    "self": "/users?page=2",
    "next": "/users?page=3",
    "prev": "/users?page=1",
    "first": "/users?page=1",
    "last": "/users?page=50"
  }
}
\`\`\`

## 八、过滤与排序设计

### 8.1 过滤

过滤通过查询参数实现。基本模式是 \`?field=value\`：

- GET /users?role=admin&status=active

对于复杂条件，可以使用操作符：

- GET /users?age_gt=18（大于 18）
- GET /users?created_at_gte=2024-01-01（大于等于）

或者使用更结构化的查询语法（如 RSQL）：

- GET /users?filter=age>18;status==active

实践中，简单的字段过滤最常用。复杂查询可以考虑 GraphQL 或专门的查询 API。

### 8.2 排序

排序通过 sort 参数实现：

- GET /users?sort=created_at（升序）
- GET /users?sort=-created_at（降序，用 - 前缀）
- GET /users?sort=-created_at,name（多字段排序）

### 8.3 字段选择

允许客户端选择需要的字段，减少数据传输：

- GET /users/123?fields=id,name,email

这在移动端尤其有用，可以减少流量和解析时间。

### 8.4 嵌套展开

对于关联资源，提供展开选项：

- GET /orders/456?expand=user,items

避免客户端多次请求获取关联数据。

## 九、HATEOAS 超媒体约束

### 9.1 HATEOAS 的核心理念

HATEOAS（Hypermedia As The Engine Of Application State）要求 API 响应中包含超链接，客户端通过这些链接来发现可执行的操作，而不是硬编码 URL。

这就像浏览网页：你打开一个网页，页面上的链接告诉你接下来可以去哪里。你不需要记住每个页面的 URL，只需要点击链接。

### 9.2 HATEOAS 示例

获取订单的响应：

\`\`\`json
{
  "id": 456,
  "status": "pending",
  "total": 99.9,
  "_links": {
    "self": { "href": "/orders/456" },
    "update": { "href": "/orders/456", "method": "PUT" },
    "cancel": { "href": "/orders/456/cancel", "method": "POST" },
    "pay": { "href": "/orders/456/pay", "method": "POST" },
    "items": { "href": "/orders/456/items" }
  }
}
\`\`\`

订单状态变为"已支付"后，响应中的链接会变化：

\`\`\`json
{
  "id": 456,
  "status": "paid",
  "_links": {
    "self": { "href": "/orders/456" },
    "ship": { "href": "/orders/456/ship", "method": "POST" },
    "refund": { "href": "/orders/456/refund", "method": "POST" }
  }
}
\`\`\`

"取消"和"支付"链接消失了，因为已支付订单不能取消或再次支付。"发货"和"退款"链接出现了。

### 9.3 HATEOAS 的价值

1. 解耦：客户端不依赖 URL 结构，API 可以自由调整 URL。
2. 自发现：客户端通过响应发现可用操作，不需要查阅文档。
3. 状态驱动：链接随资源状态变化，引导客户端执行合法操作。

### 9.4 HATEOAS 的现实

尽管 HATEOAS 理念优美，但在实践中：
1. 实现复杂，服务器需要动态生成链接。
2. 对机器客户端（如微服务间调用）帮助有限。
3. 客户端仍需理解链接的语义才能使用。

因此，很多 RESTful API 只部分实现 HATEOAS，或者完全不实现。严格的 RESTful 要求 HATEOAS，但务实的 RESTful 通常忽略它。

## 十、RESTful vs GraphQL vs RPC 全面对比

### 10.1 数据获取方式

- REST：固定端点返回固定结构。获取关联数据需要多次请求，或使用 expand 参数。
- GraphQL：客户端指定需要的字段和关联，一次请求获取所有数据。
- RPC：调用方法，返回方法定义的结构。

示例：获取用户及其订单

REST（多次请求）：
\`\`\`
GET /users/123
GET /users/123/orders
\`\`\`

GraphQL（一次请求）：
\`\`\`graphql
query {
  user(id: 123) {
    id
    name
    orders {
      id
      total
    }
  }
}
\`\`\`

RPC：
\`\`\`
POST /rpc
{"method": "getUserWithOrders", "params": {"id": 123}}
\`\`\`

### 10.2 版本管理

- REST：通过 URL 版本 /v1 /v2。
- GraphQL：通过字段废弃（@deprecated）和演进，无需版本号。
- RPC：通过方法版本 method_v2。

### 10.3 学习曲线

- REST：低。HTTP 方法和状态码是标准知识。
- GraphQL：中高。需要学习 Schema、查询语言、解析器。
- RPC：低。像调用本地方法一样简单。

### 10.4 性能

- REST：可以利用 HTTP 缓存，性能好。
- GraphQL：单次请求获取多资源，减少网络往返，但缓存复杂（需要客户端缓存）。
- RPC：通常使用二进制序列化（如 Protobuf），性能最高。

### 10.5 缓存

- REST：HTTP 缓存机制完善（ETag、Cache-Control）。
- GraphQL：POST 请求难以缓存，需要自定义缓存策略。
- RPC：通常不可缓存，取决于实现。

### 10.6 适用场景

- REST：公开 API、CRUD 应用、资源导向的业务。
- GraphQL：复杂前端、需要灵活数据获取、多端应用。
- RPC：微服务内部通信、性能敏感场景、gRPC。

### 10.7 综合对比表

| 维度 | REST | GraphQL | RPC |
|------|------|---------|-----|
| 数据获取 | 固定结构 | 客户端指定 | 方法定义 |
| 网络往返 | 可能多次 | 通常一次 | 通常一次 |
| 版本管理 | URL 版本 | 字段演进 | 方法版本 |
| 学习曲线 | 低 | 中高 | 低 |
| 缓存 | HTTP 缓存 | 自定义 | 取决于实现 |
| 性能 | 好 | 中 | 最高 |
| 可发现性 | 文档 | Schema | 文档 |
| 适合场景 | 公开 API | 复杂前端 | 微服务内部 |

## 十一、RESTful API 设计 Checklist

### 11.1 资源与 URI

- [ ] URI 使用名词复数
- [ ] URI 不包含动词（特殊操作除外）
- [ ] 层级不超过 3 层
- [ ] 资源 ID 在路径中，过滤参数在查询参数中
- [ ] URI 全小写，命名一致

### 11.2 HTTP 方法

- [ ] GET 用于获取，不改变状态
- [ ] POST 用于创建
- [ ] PUT 用于完整更新
- [ ] PATCH 用于部分更新
- [ ] DELETE 用于删除
- [ ] 幂等操作可以安全重试

### 11.3 状态码

- [ ] 成功返回 2xx（201 创建，204 无内容）
- [ ] 客户端错误返回 4xx（400 格式错误，422 语义错误）
- [ ] 服务器错误返回 5xx
- [ ] 错误响应包含错误信息

### 11.4 版本与分页

- [ ] API 有版本管理
- [ ] 列表接口支持分页
- [ ] 大数据量用游标分页
- [ ] 支持过滤、排序、字段选择

### 11.5 安全与性能

- [ ] 使用 HTTPS
- [ ] 敏感操作需要认证
- [ ] 实现限流
- [ ] 响应支持缓存（ETag、Cache-Control）
- [ ] 请求和响应使用 gzip 压缩

### 11.6 文档与一致性

- [ ] 提供 API 文档（OpenAPI/Swagger）
- [ ] 命名风格全局统一
- [ ] 错误格式统一
- [ ] 时间格式统一（ISO 8601）
- [ ] ID 格式统一

## 十二、优秀 API 设计案例剖析

### 12.1 GitHub API

GitHub API 是 RESTful API 设计的典范：

1. 资源导向：/repos/{owner}/{repo}/issues/{issue_number}/comments
2. 版本管理：/v3 在 Accept 头部中（也支持 URL）
3. 分页：支持 page/per_page 和 cursor
4. 认证：Token 认证，通过 Authorization 头部
5. 限流：X-RateLimit-Limit/X-RateLimit-Remaining 头部
6. 内容协商：通过 Accept 头部选择格式
7. HATEOAS：响应中包含 _links

### 12.2 Stripe API

Stripe API 以一致性和开发者体验著称：

1. 一致的命名：所有 ID 都是字符串，时间都是 Unix 时间戳
2. 丰富的错误信息：error.type, error.code, error.decline_code
3. 幂等性：支持 Idempotency-Key 头部
4. 分页：cursor 分页，返回 has_more 和 next_cursor
5. 版本管理：通过 Stripe-Version 头部
6. 扩展：支持 expand 参数展开关联对象
7. 测试：提供测试模式，测试 API Key 和生产 API Key 分离

### 12.3 从案例中学到的

1. 一致性比"完美"更重要。所有端点遵循相同的约定，开发者学习一个就能预测其他的。
2. 开发者体验是核心。好的错误信息、清晰的文档、易于测试的环境，比技术细节更重要。
3. 务实优于教条。Stripe 用 POST 创建资源但返回 200（而非 201），因为创建是异步的。这是务实的妥协。
4. 版本管理要慎重。Stripe 通过版本头部实现向后兼容，每次 API 变更都记录变更日志。

## 十三、多语言对照示例

以"获取用户列表"为例，对比不同语言的 HTTP 服务器实现。

### 13.1 Node.js (Express)

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 20;
  const offset = (page - 1) * size;
  // 查询数据库
  const users = db.query('SELECT * FROM users LIMIT ? OFFSET ?', [size, offset]);
  res.json({
    data: users,
    meta: { page, size, total: db.count('users') }
  });
});

app.post('/users', (req, res) => {
  const user = db.insert('users', req.body);
  res.status(201).location(\`/users/\${user.id}\`).json(user);
});

app.listen(3000);
\`\`\`

### 13.2 Java (Spring Boot)

\`\`\`java
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<User> users = userService.findAll(page, size);
        return ResponseEntity.ok(Map.of(
            "data", users.getContent(),
            "meta", Map.of("page", page, "size", size, "total", users.getTotalElements())
        ));
    }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody UserDTO dto) {
        User user = userService.create(dto);
        return ResponseEntity.created(URI.create("/users/" + user.getId())).body(user);
    }
}
\`\`\`

### 13.3 Go (Gin)

\`\`\`go
func main() {
    r := gin.Default()

    r.GET("/users", func(c *gin.Context) {
        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
        users, total := userService.List(page, size)
        c.JSON(http.StatusOK, gin.H{
            "data": users,
            "meta": gin.H{"page": page, "size": size, "total": total},
        })
    })

    r.POST("/users", func(c *gin.Context) {
        var dto UserDTO
        if err := c.ShouldBindJSON(&dto); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        user := userService.Create(dto)
        c.Header("Location", fmt.Sprintf("/users/%d", user.ID))
        c.JSON(http.StatusCreated, user)
    })

    r.Run(":8080")
}
\`\`\`

### 13.4 Python (FastAPI)

\`\`\`python
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel

app = FastAPI()

class UserDTO(BaseModel):
    name: str
    email: str

@app.get("/users")
async def list_users(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    users, total = user_service.list(page, size)
    return {
        "data": users,
        "meta": {"page": page, "size": size, "total": total}
    }

@app.post("/users", status_code=201)
async def create_user(dto: UserDTO):
    user = user_service.create(dto)
    return user
\`\`\`

可以看到，不同语言的 REST 框架在概念上是一致的：路由注册、参数解析、响应构造。差异主要在语法和约定上。

## 十四、常见坑与避坑指南

### 14.1 用 GET 修改数据

有些开发者为了方便，用 GET 请求修改数据，比如 /users/123/delete。这违反了 GET 的安全语义，会导致：
1. 爬虫、预加载、缓存代理意外触发修改。
2. 浏览器历史记录、日志中留下修改操作的 URL。
3. CSRF 攻击风险增加。

正确做法：修改操作用 POST/PUT/PATCH/DELETE。

### 14.2 滥用 200 状态码

有些 API 无论成功失败都返回 200，在响应体中用 code 字段表示：

\`\`\`json
{ "code": 500, "message": "服务器错误" }
\`\`\`

这违反了 HTTP 语义，让客户端无法通过状态码快速判断结果，也无法利用 HTTP 的错误处理机制。正确做法：用正确的 HTTP 状态码。

### 14.3 忽略内容协商

有些 API 只支持 JSON，但不在 Content-Type 中说明，或者不根据 Accept 头部返回不同格式。这导致客户端无法确定响应格式，增加了耦合。正确做法：明确 Content-Type，支持内容协商。

### 14.4 嵌套过深

/users/123/orders/456/items/789/comments/12 这样过深的嵌套让 URL 冗长难维护。正确做法：控制嵌套深度，用查询参数表达过滤。

### 14.5 返回敏感信息

有些 API 在响应中返回密码哈希、内部 ID、调试信息等敏感数据。正确做法：只返回客户端需要的信息，敏感字段在序列化时过滤。

### 14.6 不一致的命名

同一个 API 中混用 camelCase 和 snake_case，混用复数和单数。正确做法：全局统一命名风格。

### 14.7 时间格式不统一

有的用时间戳，有的用 ISO 8601，有的用自定义格式。正确做法：统一使用 ISO 8601（如 2024-01-15T10:30:00Z）。

### 14.8 缺少分页

列表接口返回所有数据，数据量大时拖垮服务器和客户端。正确做法：所有列表接口都支持分页。

## 十五、生产环境实践

### 15.1 API 文档

使用 OpenAPI（Swagger）规范描述 API，自动生成文档和客户端 SDK。文档应该包含：
1. 端点描述、方法、URL
2. 请求参数、类型、是否必需
3. 响应格式、状态码
4. 示例请求和响应
5. 错误码说明

### 15.2 限流

对 API 实施限流，防止单个客户端耗尽资源。限流策略：
1. 全局限流：每秒总请求数限制。
2. 用户限流：每个用户/Token 的请求限制。
3. 接口限流：敏感接口更严格的限制。

返回 429 状态码，并在 Retry-After 头部告知客户端何时重试。

### 15.3 监控与日志

1. 记录每个请求的方法、URL、状态码、响应时间。
2. 监控错误率、延迟、流量。
3. 设置告警，错误率突增时通知。
4. 请求 ID 贯穿整个调用链，便于排查问题。

### 15.4 安全

1. 强制 HTTPS。
2. 认证：JWT、OAuth 2.0。
3. 授权：基于角色或属性。
4. 输入验证：防止 SQL 注入、XSS。
5. CSRF 防护：Token 验证。
6. CORS 配置：限制跨域来源。

### 15.5 性能优化

1. 启用 gzip 压缩。
2. 数据库查询优化（索引、JOIN 优化）。
3. 缓存：Redis 缓存热点数据。
4. 连接池：数据库连接复用。
5. 异步处理：耗时操作异步化。

## 十六、RESTful API 设计的演进

### 16.1 从 REST 到 GraphQL

REST 的固定端点结构在某些场景下显得笨拙。前端需要的数据往往跨越多个资源，REST 需要多次请求。GraphQL 通过让客户端指定所需字段，解决了这个问题。

但 GraphQL 也有问题：复杂查询可能导致服务器过载（深度嵌套查询），缓存困难，权限控制复杂。因此 GraphQL 并没有取代 REST，而是与之共存。

### 16.2 从 REST 到 gRPC

在微服务内部通信中，REST 的文本序列化（JSON）性能不如二进制序列化（Protobuf）。gRPC 基于 HTTP/2 和 Protobuf，提供了更高的性能和更严格的接口定义。

### 16.3 REST 的未来

REST 仍然是公开 API 的主流选择。它的简单性、可缓存性、广泛的工具支持，使其在可预见的未来不会被取代。但 REST 也在演进，如 JSON:API 规范、OpenAPI 规范等，都在让 REST 更加标准化。

## 十七、总结

RESTful API 设计的核心要点：

1. 以资源为中心，URI 用名词复数。
2. 正确使用 HTTP 方法，理解安全性和幂等性。
3. 正确使用状态码，不要滥用 200。
4. 做好版本管理，优先 URL 路径版本。
5. 列表接口必须分页，大数据量用游标分页。
6. 一致性比完美更重要，全局统一约定。
7. 开发者体验是核心，好的文档和错误信息。
8. 务实优于教条，根据实际需求灵活调整。

REST 不是银弹，它适合资源导向的 CRUD 应用。对于复杂查询、实时通信、微服务内部通信，GraphQL、WebSocket、gRPC 可能更合适。选择合适的工具，比坚持某种风格更重要。`,
    code: `// RESTful API 路由框架实现
// 模拟一个完整的 RESTful API 框架，支持资源路由、路径参数、查询参数、分页、过滤、排序、错误处理、HATEOAS

const { EventEmitter } = require('events');
const url = require('url');
const crypto = require('crypto');

// ============ 内存数据库（模拟） ============
const db = {
  users: [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin', age: 28, createdAt: '2024-01-10T08:00:00Z' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user', age: 35, createdAt: '2024-02-15T09:30:00Z' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user', age: 22, createdAt: '2024-03-20T14:00:00Z' },
    { id: 4, name: 'David', email: 'david@example.com', role: 'moderator', age: 40, createdAt: '2024-04-05T11:15:00Z' },
    { id: 5, name: 'Eve', email: 'eve@example.com', role: 'user', age: 19, createdAt: '2024-05-12T16:45:00Z' },
  ],
  nextId: 6,
};

// ============ HTTP 请求/响应模拟对象 ============
class HttpRequest {
  constructor(method, path, query = {}, body = null, headers = {}) {
    this.method = method.toUpperCase();
    this.path = path;
    this.query = query;
    this.body = body;
    this.headers = headers;
    this.params = {}; // 路径参数，由 Router 填充
  }
}

class HttpResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
  }
  status(code) { this.statusCode = code; return this; }
  setHeader(key, value) { this.headers[key] = value; return this; }
  json(data) {
    this.body = data;
    this.setHeader('Content-Type', 'application/json');
    return this;
  }
  location(loc) { this.setHeader('Location', loc); return this; }
}

// ============ 路由器 ============
class Router extends EventEmitter {
  constructor() {
    super();
    this.routes = [];
    this.middlewares = [];
  }

  // 注册路由：method, pattern(支持 :id 参数), handler
  add(method, pattern, handler) {
    // 将 /users/:id 转换为正则 /^\\/users\\/([^/]+)$/
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      method: method.toUpperCase(),
      pattern: new RegExp('^' + regexStr + '$'),
      paramNames,
      handler,
    });
  }

  // 资源路由：自动生成 CRUD
  resource(name, controller) {
    this.add('GET', \`/\${name}\`, controller.index);
    this.add('POST', \`/\${name}\`, controller.create);
    this.add('GET', \`/\${name}/:id\`, controller.show);
    this.add('PUT', \`/\${name}/:id\`, controller.update);
    this.add('PATCH', \`/\${name}/:id\`, controller.patch);
    this.add('DELETE', \`/\${name}/:id\`, controller.destroy);
  }

  use(middleware) { this.middlewares.push(middleware); }

  // 处理请求
  handle(req, res) {
    // 执行中间件链
    let idx = 0;
    const next = () => {
      if (idx < this.middlewares.length) {
        const mw = this.middlewares[idx++];
        try { mw(req, res, next); } catch (e) { this.sendError(res, 500, e.message); }
      } else {
        this.dispatch(req, res);
      }
    };
    next();
  }

  dispatch(req, res) {
    for (const route of this.routes) {
      if (route.method !== req.method) continue;
      const match = route.pattern.exec(req.path);
      if (!match) continue;
      // 提取路径参数
      route.paramNames.forEach((name, i) => { req.params[name] = match[i + 1]; });
      try {
        route.handler(req, res);
      } catch (e) {
        this.sendError(res, 500, e.message);
      }
      return;
    }
    // 405 vs 404 判断
    const methodExists = this.routes.some(r => r.pattern.test(req.path));
    if (methodExists) {
      this.sendError(res, 405, \`方法 \${req.method} 不允许用于 \${req.path}\`);
    } else {
      this.sendError(res, 404, \`资源 \${req.path} 不存在\`);
    }
  }

  sendError(res, status, message, details) {
    res.status(status).json({
      error: { code: 'ERROR', message, details: details || undefined, requestId: crypto.randomUUID() }
    });
  }
}

// ============ HATEOAS 链接生成 ============
function buildLinks(req, resource, type = 'user') {
  const base = type === 'user' ? '/users' : '/orders';
  const links = { self: { href: \`\${base}/\${resource.id}\`, method: 'GET' } };
  if (type === 'user') {
    links.update = { href: \`\${base}/\${resource.id}\`, method: 'PUT' };
    links.patch = { href: \`\${base}/\${resource.id}\`, method: 'PATCH' };
    links.delete = { href: \`\${base}/\${resource.id}\`, method: 'DELETE' };
  }
  return links;
}

// ============ 用户控制器 ============
const userController = {
  // GET /users —— 列表 + 分页 + 过滤 + 排序
  index(req, res) {
    let list = [...db.users];
    const { page = 1, size = 3, role, age_min, sort } = req.query;
    // 过滤
    if (role) list = list.filter(u => u.role === role);
    if (age_min) list = list.filter(u => u.age >= parseInt(age_min));
    // 排序
    if (sort) {
      const desc = sort.startsWith('-');
      const field = desc ? sort.slice(1) : sort;
      list.sort((a, b) => {
        const r = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;
        return desc ? -r : r;
      });
    }
    // 分页
    const pageNum = parseInt(page), sizeNum = parseInt(size);
    const total = list.length;
    const offset = (pageNum - 1) * sizeNum;
    const data = list.slice(offset, offset + sizeNum).map(u => ({
      ...u, _links: buildLinks(req, u)
    }));
    res.json({
      data,
      meta: { page: pageNum, size: sizeNum, total, totalPages: Math.ceil(total / sizeNum) },
      links: {
        self: \`/users?page=\${pageNum}&size=\${sizeNum}\`,
        next: offset + sizeNum < total ? \`/users?page=\${pageNum + 1}&size=\${sizeNum}\` : null,
        prev: pageNum > 1 ? \`/users?page=\${pageNum - 1}&size=\${sizeNum}\` : null,
      }
    });
  },
  // POST /users —— 创建
  create(req, res) {
    const { name, email, role, age } = req.body || {};
    if (!name || !email) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'name 和 email 必填' } });
    }
    if (db.users.some(u => u.email === email)) {
      return res.status(409).json({ error: { code: 'CONFLICT', message: '邮箱已存在' } });
    }
    const user = { id: db.nextId++, name, email, role: role || 'user', age: age || null, createdAt: new Date().toISOString() };
    db.users.push(user);
    res.status(201).location(\`/users/\${user.id}\`).json({ data: user, _links: buildLinks(req, user) });
  },
  // GET /users/:id
  show(req, res) {
    const id = parseInt(req.params.id);
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: \`用户 \${id} 不存在\` } });
    res.json({ data: user, _links: buildLinks(req, user) });
  },
  // PUT /users/:id —— 完整更新
  update(req, res) {
    const id = parseInt(req.params.id);
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: '用户不存在' } });
    const { name, email, role, age } = req.body || {};
    if (!name || !email) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'PUT 需要完整字段' } });
    db.users[idx] = { ...db.users[idx], name, email, role: role || 'user', age: age || null };
    res.json({ data: db.users[idx], _links: buildLinks(req, db.users[idx]) });
  },
  // PATCH /users/:id —— 部分更新
  patch(req, res) {
    const id = parseInt(req.params.id);
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: '用户不存在' } });
    Object.assign(db.users[idx], req.body || {});
    res.json({ data: db.users[idx], _links: buildLinks(req, db.users[idx]) });
  },
  // DELETE /users/:id
  destroy(req, res) {
    const id = parseInt(req.params.id);
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: '用户不存在' } });
    const [deleted] = db.users.splice(idx, 1);
    res.status(204); res.body = null; res.headers['X-Deleted-Id'] = id;
  },
};

// ============ 组装应用 ============
const app = new Router();
app.use((req, res, next) => { console.log(\`[日志] \${req.method} \${req.path}\`); next(); });
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    req.body = JSON.parse(JSON.stringify(req.body)); // 简单克隆
  }
  next();
});
app.resource('users', userController);

// ============ 模拟请求 ============
function request(method, pathStr, body, headers) {
  const parsed = url.parse(pathStr, true);
  const req = new HttpRequest(method, parsed.pathname, parsed.query, body, headers || {});
  const res = new HttpResponse();
  app.handle(req, res);
  console.log(\`\\n>>> \${method} \${pathStr}\`);
  console.log(\`<<< \${res.statusCode} \${JSON.stringify(res.headers)}\`);
  if (res.body !== null && res.body !== undefined) console.log(JSON.stringify(res.body, null, 2));
  console.log('---');
}

console.log('========== RESTful API 框架演示 ==========');
// 1. 列表 + 分页
request('GET', '/users?page=1&size=3');
// 2. 过滤
request('GET', '/users?role=user&size=10');
// 3. 排序
request('GET', '/users?sort=-age');
// 4. 创建（成功 201）
request('POST', '/users', { name: 'Frank', email: 'frank@example.com', role: 'user', age: 30 });
// 5. 创建（冲突 409）
request('POST', '/users', { name: 'Frank2', email: 'frank@example.com' });
// 6. 创建（校验失败 422）
request('POST', '/users', { name: 'NoEmail' });
// 7. 获取单个
request('GET', '/users/1');
// 8. 获取不存在 404
request('GET', '/users/999');
// 9. PATCH 部分更新
request('PATCH', '/users/1', { age: 29 });
// 10. DELETE
request('DELETE', '/users/2');
// 11. 方法不允许 405
request('POST', '/users/1');
console.log('========== 演示结束 ==========');`,
  },
  {
    id: "backend-rpc",
    group: "API 设计与架构",
    icon: "📡",
    title: "RPC 与 gRPC",
    content: `# RPC 与 gRPC

## 一、什么是 RPC

RPC（Remote Procedure Call，远程过程调用）是一种允许程序调用另一个地址空间（通常是另一台机器上）的过程/方法的协议。对调用者而言，远程调用就像调用本地方法一样简单，RPC 框架隐藏了网络通信、序列化、反序列化等底层细节。

RPC 的核心理念是"透明性"：让远程调用看起来像本地调用。开发者不需要关心网络传输、数据编码、连接管理，只需要像调用本地函数一样调用远程方法。

### 1.1 为什么需要 RPC

在单体架构中，所有功能在一个进程内，函数调用就是本地调用。但在分布式系统、微服务架构中，服务分布在不同进程、不同机器上，服务间通信必须通过网络。RPC 提供了一种高效、便捷的网络通信方式。

与 HTTP/REST 相比，RPC 的优势在于：
1. 性能：通常使用二进制序列化（如 Protobuf），比 JSON 更紧凑、更快。
2. 强类型：接口定义清晰，编译期就能发现类型错误。
3. 便捷：像调用本地方法一样调用远程方法，开发体验好。
4. 连接复用：基于长连接（如 HTTP/2），避免频繁建连开销。

### 1.2 RPC 的历史

RPC 的历史比 REST 更悠久：
- 1980s：Sun RPC（用于 NFS）
- 1990s：DCOM、CORBA
- 2000s：SOAP、XML-RPC
- 2010s：Thrift（Facebook）、Dubbo（阿里）、gRPC（Google）
- 现在：gRPC 成为云原生时代的主流选择

每一代 RPC 都在解决前一代的问题：CORBA 太复杂，SOAP 太沉重，Thrift/Dubbo 生态受限，gRPC 基于 HTTP/2 和 Protobuf，成为现代 RPC 的事实标准。

## 二、RPC 核心原理

### 2.1 RPC 调用链路

一次完整的 RPC 调用涉及以下步骤：

1. 客户端调用本地方法（实际上是调用客户端存根）
2. 客户端存根将方法名、参数序列化为字节流
3. 客户端通过网络将字节流发送给服务端
4. 服务端接收到字节流，反序列化为方法名和参数
5. 服务端存根调用真正的服务方法
6. 服务方法执行，返回结果
7. 服务端存根将结果序列化为字节流
8. 服务端通过网络将字节流发送给客户端
9. 客户端存根接收字节流，反序列化为结果
10. 客户端存根将结果返回给调用者

整个过程对客户端透明，客户端只看到步骤 1 和步骤 10。

### 2.2 客户端存根（Client Stub）

客户端存根是 RPC 框架生成的代码，它模拟了远程服务的接口。客户端调用存根方法时，存根负责：
1. 序列化参数（称为 marshalling 或 encoding）
2. 通过网络发送请求
3. 等待响应（同步）或注册回调（异步）
4. 反序列化响应并返回

存根的存在让远程调用看起来像本地调用，这是 RPC"透明性"的关键。

### 2.3 服务端存根（Server Stub）

服务端存根（有时称为 skeleton）负责：
1. 接收网络请求
2. 反序列化方法名和参数
3. 根据方法名路由到真正的服务实现
4. 调用服务方法
5. 序列化返回值或异常
6. 通过网络发送响应

### 2.4 序列化（Serialization）

序列化是将内存中的对象转换为字节流的过程，反序列化是逆过程。RPC 中，请求参数和返回值都需要序列化才能在网络中传输。

序列化格式直接影响 RPC 的性能：
- 体积小：减少网络传输量
- 速度快：减少 CPU 开销
- 兼容性好：支持 schema 演进
- 可读性：便于调试（可选）

### 2.5 网络传输

RPC 的网络传输协议可以选择：
- TCP：传统选择，可靠传输，需要自定义协议格式
- HTTP/1.1：基于文本，连接复用差
- HTTP/2：多路复用、头部压缩、长连接，gRPC 的选择
- UDP：用于对实时性要求高的场景（如视频通话），但不可靠

## 三、RPC 调用流程详解

让我们用一个具体的例子详细追踪 RPC 调用的每一步。

假设有一个计算器服务，提供 add 和 multiply 方法。客户端调用 \`calculator.add(1, 2)\` 期望得到 3。

### 3.1 接口定义

首先需要定义服务接口。在 gRPC 中用 .proto 文件：

\`\`\`protobuf
service Calculator {
  rpc Add(AddRequest) returns (AddResponse);
  rpc Multiply(MultiplyRequest) returns (MultiplyResponse);
}

message AddRequest {
  int32 a = 1;
  int32 b = 2;
}

message AddResponse {
  int32 result = 1;
}
\`\`\`

在 Dubbo 中用 Java 接口：

\`\`\`java
public interface Calculator {
  int add(int a, int b);
  int multiply(int a, int b);
}
\`\`\`

### 3.2 服务端实现

服务端实现接口并注册到 RPC 框架：

\`\`\`java
// Java (Dubbo)
public class CalculatorImpl implements Calculator {
  public int add(int a, int b) { return a + b; }
  public int multiply(int a, int b) { return a * b; }
}

// 注册服务
Calculator calc = new CalculatorImpl();
rpcServer.export(Calculator.class, calc);
\`\`\`

\`\`\`go
// Go (gRPC)
type CalculatorServer struct{}

func (s *CalculatorServer) Add(ctx context.Context, req *AddRequest) (*AddResponse, error) {
  return &AddResponse{Result: req.A + req.B}, nil
}

// 注册服务
grpcServer := grpc.NewServer()
RegisterCalculatorServer(grpcServer, &CalculatorServer{})
\`\`\`

### 3.3 客户端调用

客户端通过存根调用远程方法：

\`\`\`java
// Java
Calculator calc = rpcClient.refer(Calculator.class, "rpc://localhost:8080");
int result = calc.add(1, 2); // 像本地方法一样调用
\`\`\`

\`\`\`go
// Go
conn, _ := grpc.Dial("localhost:8080", grpc.WithInsecure())
client := NewCalculatorClient(conn)
resp, _ := client.Add(ctx, &AddRequest{A: 1, B: 2})
\`\`\`

### 3.4 调用链路追踪

\`calc.add(1, 2)\` 这一行代码背后发生的事情：

1. 客户端存根拦截调用，将方法名"add"和参数[1, 2]打包
2. 存根将请求序列化：\`{method: "add", params: [1, 2]}\` -> 字节流
3. 存根通过 TCP/HTTP2 连接发送字节流
4. 服务端接收到字节流
5. 服务端存根反序列化：字节流 -> \`{method: "add", params: [1, 2]}\`
6. 服务端根据 method 路由到 add 方法，传入参数 1, 2
7. add 方法执行，返回 3
8. 服务端存根序列化结果：\`{result: 3}\` -> 字节流
9. 服务端发送响应字节流
10. 客户端存根接收并反序列化：字节流 -> \`{result: 3}\`
11. 存根返回 3 给调用者

整个过程在毫秒级完成，但对开发者完全透明。

## 四、序列化格式对比

### 4.1 JSON

JSON 是最通用的序列化格式，可读性好，几乎所有语言都支持。

优点：
- 可读性强，便于调试
- 通用性高，跨语言支持好
- 无需 schema 定义

缺点：
- 体积大（字段名、引号占用空间）
- 解析慢（文本解析）
- 类型有限（无二进制、日期类型）
- 不支持 schema 演进

适用场景：REST API、配置文件、日志。

### 4.2 XML

XML 比 JSON 更冗长，但支持更丰富的类型和命名空间。

优点：
- 可读性好
- 支持命名空间、属性、注释
- 工具链成熟（XSD、XSLT）

缺点：
- 极其冗长（标签占用大量空间）
- 解析慢
- 类型表达能力有限

适用场景：SOAP、企业级集成、配置文件（如 Spring）。

### 4.3 Protobuf

Protobuf（Protocol Buffers）是 Google 开发的二进制序列化格式，gRPC 的默认格式。

优点：
- 体积小（二进制编码，字段用数字标识）
- 解析快（二进制解析比文本快）
- 强类型（.proto 文件定义 schema）
- 支持 schema 演进（字段编号机制）
- 跨语言支持好

缺点：
- 不可读（二进制）
- 需要 .proto 文件和代码生成
- 动态性差

适用场景：gRPC、内部服务通信、高性能场景。

### 4.4 Thrift

Thrift 是 Facebook 开发的序列化框架，与 Protobuf 类似。

优点：
- 二进制高效编码
- 内置 RPC 框架（不仅仅是序列化）
- 支持多种传输协议和服务器模型

缺点：
- 生态不如 Protobuf
- 文档相对较少

适用场景：Facebook 内部、一些遗留系统。

### 4.5 MessagePack

MessagePack 是一种二进制 JSON 替代品。

优点：
- 比 JSON 体积小、速度快
- 保持 JSON 的灵活性
- 不需要 schema

缺点：
- 不可读
- 比 Protobuf 大（字段名仍占用空间）

适用场景：Redis、一些 NoSQL 数据库、对 JSON 体积敏感的场景。

### 4.6 序列化格式对比表

| 格式 | 体积 | 速度 | 可读性 | Schema | 跨语言 | 典型用途 |
|------|------|------|--------|--------|--------|---------|
| JSON | 大 | 慢 | 好 | 无 | 好 | REST API |
| XML | 很大 | 很慢 | 好 | XSD | 好 | SOAP |
| Protobuf | 小 | 快 | 差 | 有 | 好 | gRPC |
| Thrift | 小 | 快 | 差 | 有 | 好 | Thrift RPC |
| MessagePack | 中 | 中 | 差 | 无 | 好 | NoSQL |

### 4.7 序列化示例对比

同一组数据 \`{id: 123, name: "Alice", active: true}\`：

JSON（44 字节）：
\`\`\`
{"id":123,"name":"Alice","active":true}
\`\`\`

XML（64 字节）：
\`\`\`xml
<user><id>123</id><name>Alice</name><active>true</active></user>
\`\`\`

Protobuf（约 16 字节，二进制无法直接展示）：
字段 1（id）: 08 7B
字段 2（name）: 12 05 41 6C 69 63 65
字段 3（active）: 18 01

可以看到，Protobuf 体积只有 JSON 的约 1/3，这是因为字段名被数字编号替代。

## 五、Protobuf 详解

### 5.1 Message 定义

Protobuf 用 .proto 文件定义消息结构：

\`\`\`protobuf
syntax = "proto3";

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  bool active = 4;
}
\`\`\`

每个字段有三个部分：类型、名称、编号。编号是字段的唯一标识，用于序列化后的二进制编码。编号 1-15 占用 1 字节，16-2047 占用 2 字节，因此频繁使用的字段应该用小编号。

### 5.2 字段类型

Protobuf 支持的类型：
- 标量：int32, int64, uint32, uint64, sint32, sint64, fixed32, fixed64, float, double, bool, string, bytes
- 枚举：enum
- 嵌套消息：message
- map：map<key_type, value_type>
- repeated：重复字段（类似数组）
- optional：可选字段（proto3 默认所有字段可选）

### 5.3 repeated 字段

\`\`\`protobuf
message User {
  int64 id = 1;
  string name = 2;
  repeated string phones = 3; // 重复字段，类似数组
  repeated Address addresses = 4; // 重复的嵌套消息
}
\`\`\`

### 5.4 枚举

\`\`\`protobuf
message User {
  enum Status {
    UNKNOWN = 0;
    ACTIVE = 1;
    INACTIVE = 2;
    BANNED = 3;
  }
  Status status = 1;
}
\`\`\`

枚举的第一个值必须是 0，作为默认值。

### 5.5 嵌套消息

\`\`\`protobuf
message Address {
  string street = 1;
  string city = 2;
  string zip = 3;
}

message User {
  int64 id = 1;
  string name = 2;
  Address home_address = 3; // 嵌套消息
}
\`\`\`

### 5.6 oneof

oneof 表示一组字段中最多只有一个被设置：

\`\`\`protobuf
message Notification {
  string message = 1;
  oneof channel {
    EmailNotification email = 2;
    SmsNotification sms = 3;
    PushNotification push = 4;
  }
}
\`\`\`

### 5.7 map

\`\`\`protobuf
message UserConfig {
  map<string, string> settings = 1;
  map<int64, string> role_names = 2;
}
\`\`\`

### 5.8 编译生成代码

定义好 .proto 后，用 protoc 编译器生成目标语言的代码：

\`\`\`bash
# 生成 Go 代码
protoc --go_out=. --go-grpc_out=. user.proto

# 生成 Java 代码
protoc --java_out=. user.proto

# 生成 Python 代码
protoc --python_out=. user.proto
\`\`\`

生成的代码包含消息的序列化/反序列化方法，开发者无需手写。

### 5.9 向后兼容性

Protobuf 的字段编号机制支持向后兼容：
1. 添加新字段：旧代码解析新数据时，会忽略未知字段。
2. 删除字段：不能复用已删除字段的编号（保留编号），否则旧数据会被错误解析。
3. 修改字段类型：需要兼容的类型（如 int32 -> int64）。
4. 修改字段名：可以，因为序列化用的是编号不是名称。

\`\`\`protobuf
// 保留已删除字段的编号，防止复用
message User {
  reserved 3, 4;
  reserved "old_field_name";
  int64 id = 1;
  string name = 2;
  string email = 5; // 新字段用新编号
}
\`\`\`

## 六、gRPC 四种调用模式

gRPC 基于 HTTP/2，支持四种调用模式，覆盖了几乎所有通信场景。

### 6.1 Unary RPC（一元调用）

最简单的模式：一个请求，一个响应。类似普通的函数调用。

\`\`\`protobuf
service Greeter {
  rpc SayHello(HelloRequest) returns (HelloResponse);
}
\`\`\`

客户端：
\`\`\`go
resp, err := client.SayHello(ctx, &HelloRequest{Name: "Alice"})
\`\`\`

服务端：
\`\`\`go
func (s *server) SayHello(ctx context.Context, req *HelloRequest) (*HelloResponse, error) {
  return &HelloResponse{Message: "Hello " + req.Name}, nil
}
\`\`\`

适用场景：大多数普通请求-响应场景，如获取用户信息、创建订单。

### 6.2 Server Streaming RPC（服务端流）

一个请求，多个响应。服务端持续推送数据。

\`\`\`protobuf
service Greeter {
  rpc Subscribe(SubscribeRequest) returns (stream Event);
}
\`\`\`

客户端：
\`\`\`go
stream, _ := client.Subscribe(ctx, &SubscribeRequest{Topic: "news"})
for {
  event, err := stream.Recv()
  if err == io.EOF { break }
  // 处理 event
}
\`\`\`

服务端：
\`\`\`go
func (s *server) Subscribe(req *SubscribeRequest, stream Greeter_SubscribeServer) error {
  for _, event := range events {
    if err := stream.Send(event); err != nil { return err }
  }
  return nil
}
\`\`\`

适用场景：消息推送、日志流、实时数据更新、大数据量分批返回。

### 6.3 Client Streaming RPC（客户端流）

多个请求，一个响应。客户端持续发送数据，服务端处理后返回一个结果。

\`\`\`protobuf
service Uploader {
  rpc Upload(stream Chunk) returns (UploadResponse);
}
\`\`\`

客户端：
\`\`\`go
stream, _ := client.Upload(ctx)
for _, chunk := range chunks {
  stream.Send(chunk)
}
resp, _ := stream.CloseAndRecv()
\`\`\`

服务端：
\`\`\`go
func (s *server) Upload(stream Uploader_UploadServer) error {
  for {
    chunk, err := stream.Recv()
    if err == io.EOF {
      return stream.SendAndClose(&UploadResponse{Success: true})
    }
    // 处理 chunk
  }
}
\`\`\`

适用场景：文件上传、批量数据导入、传感器数据采集。

### 6.4 Bidirectional Streaming RPC（双向流）

客户端和服务端都可以持续发送数据，全双工通信。

\`\`\`protobuf
service Chat {
  rpc Chat(stream Message) returns (stream Message);
}
\`\`\`

客户端：
\`\`\`go
stream, _ := client.Chat(ctx)
go func() {
  for _, msg := range messages {
    stream.Send(msg)
  }
}()
for {
  reply, err := stream.Recv()
  if err == io.EOF { break }
  // 处理 reply
}
\`\`\`

服务端：
\`\`\`go
func (s *server) Chat(stream Chat_ChatServer) error {
  for {
    msg, err := stream.Recv()
    if err == io.EOF { return nil }
    // 处理 msg 并回复
    stream.Send(&Message{Text: "echo: " + msg.Text})
  }
}
\`\`\`

适用场景：聊天应用、实时协作、双向同步、游戏。

### 6.5 四种模式对比

| 模式 | 请求 | 响应 | 典型场景 |
|------|------|------|---------|
| Unary | 1 | 1 | 普通请求响应 |
| Server Streaming | 1 | N | 消息推送、日志流 |
| Client Streaming | N | 1 | 文件上传、批量导入 |
| Bidirectional Streaming | N | N | 聊天、实时协作 |

## 七、gRPC 服务定义与 .proto 文件

### 7.1 完整 .proto 示例

\`\`\`protobuf
syntax = "proto3";

package com.example.user;
option java_package = "com.example.user";
option java_multiple_files = true;
option go_package = "example.com/user";

import "google/protobuf/timestamp.proto";

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  UserStatus status = 4;
  google.protobuf.Timestamp created_at = 5;
  repeated string tags = 6;
  map<string, string> metadata = 7;
}

enum UserStatus {
  USER_STATUS_UNKNOWN = 0;
  USER_STATUS_ACTIVE = 1;
  USER_STATUS_INACTIVE = 2;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message GetUserRequest {
  int64 id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 size = 2;
  string filter = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}

service UserService {
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc StreamUsers(ListUsersRequest) returns (stream User);
}
\`\`\`

### 7.2 命名规范

Protobuf 社区的命名规范：
- message 名用 PascalCase：User, CreateUserRequest
- 字段名用 snake_case：user_id, created_at
- 枚举名用 PascalCase，枚举值用 ENUM_NAME 全大写加前缀：UserStatus.USER_STATUS_ACTIVE
- service 名用 PascalCase：UserService
- rpc 方法名用 PascalCase：CreateUser

## 八、gRPC vs REST 性能对比

### 8.1 序列化对比

| 指标 | JSON (REST) | Protobuf (gRPC) |
|------|-------------|-----------------|
| 体积 | 100% | ~30% |
| 解析速度 | 100% | ~300% |
| 生成方式 | 运行时反射 | 编译期生成 |

Protobuf 的二进制编码比 JSON 紧凑得多，解析也更快，因为不需要文本解析。

### 8.2 传输对比

| 指标 | HTTP/1.1 (REST) | HTTP/2 (gRPC) |
|------|-----------------|----------------|
| 连接 | 短连接/keep-alive | 长连接多路复用 |
| 并发 | 一个连接一个请求 | 一个连接多个请求 |
| 头部 | 文本，每次全发 | HPACK 压缩 |
| 推送 | 不支持 | 支持（Server Push） |

HTTP/2 的多路复用让 gRPC 在高并发下性能优势明显：一个 TCP 连接可以同时处理多个请求，避免了连接建立开销。

### 8.3 实测性能数据

在某些基准测试中（具体数据因场景而异）：
- gRPC 的吞吐量是 REST 的 3-10 倍
- gRPC 的延迟比 REST 低 30-50%
- gRPC 的 CPU 占用比 REST 低 20-40%

这些优势在高并发、大数据量场景下更明显。

### 8.4 何时选择 gRPC vs REST

选择 gRPC：
- 微服务内部通信
- 对性能敏感
- 需要流式通信
- 强类型接口很重要
- 多语言环境

选择 REST：
- 对外公开 API
- 浏览器直接调用
- 简单 CRUD 场景
- 需要良好的可调试性
- 生态和工具支持重要

实践中，常见做法是内部用 gRPC，对外用 REST（通过网关做协议转换）。

## 九、gRPC 拦截器（Interceptor）

拦截器是 gRPC 的中间件机制，可以在调用前后插入通用逻辑，如日志、认证、监控、限流。

### 9.1 客户端拦截器

\`\`\`go
func loggingInterceptor(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
  start := time.Now()
  err := invoker(ctx, method, req, reply, cc, opts...)
  log.Printf("method=%s duration=%s err=%v", method, time.Since(start), err)
  return err
}

conn, _ := grpc.Dial("localhost:8080",
  grpc.WithUnaryInterceptor(loggingInterceptor),
)
\`\`\`

### 9.2 服务端拦截器

\`\`\`go
func authInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
  // 从 metadata 提取 token
  md, ok := metadata.FromIncomingContext(ctx)
  token := md.Get("authorization")
  if !validateToken(token) {
    return nil, status.Error(codes.Unauthenticated, "invalid token")
  }
  return handler(ctx, req)
}

grpcServer := grpc.NewServer(grpc.UnaryInterceptor(authInterceptor))
\`\`\`

### 9.3 拦截器的应用

1. 认证：验证 token
2. 日志：记录调用信息
3. 监控：统计调用次数、延迟
4. 限流：控制调用频率
5. 熔断：失败率过高时熔断
6. 重试：失败时自动重试
7. 链路追踪：传递 trace ID

## 十、gRPC 健康检查与服务发现

### 10.1 健康检查

gRPC 定义了标准的健康检查协议（grpc.health.v1.Health），让负载均衡器和服务发现系统检查服务健康状态。

\`\`\`protobuf
service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
  }
  ServingStatus status = 1;
}
\`\`\`

服务端实现 Health 服务，返回 SERVING 或 NOT_SERVING。负载均衡器定期调用 Check，剔除不健康节点。

### 10.2 服务发现

在微服务架构中，服务实例动态变化（扩容、缩容、故障），需要服务发现机制让客户端找到服务实例。

常见方案：
1. 客户端发现：客户端查询服务注册中心（如 Eureka、Consul、Nacos），获取实例列表，自己做负载均衡。
2. 服务端发现：客户端请求负载均衡器（如 Envoy、Nginx），负载均衡器查询注册中心并转发。

gRPC 与服务发现的集成：
- gRPC 内置了 name resolver 和 load balancer 机制
- 可以自定义 resolver 从注册中心获取实例
- 内置的 balancer 支持 round-robin、pick-first 等策略

## 十一、主流 RPC 框架对比

### 11.1 Dubbo

阿里开源的 Java RPC 框架，国内使用广泛。

特点：
- 基于 TCP 自定义协议
- 支持 Java 生态
- 内置服务发现、负载均衡、容错机制
- 丰富的扩展点
- 支持 Triple 协议（基于 HTTP/2，兼容 gRPC）

适用场景：Java 微服务、国内企业。

### 11.2 gRPC

Google 开源，云原生时代主流。

特点：
- 基于 HTTP/2 和 Protobuf
- 跨语言支持好（10+ 语言）
- 强类型接口定义
- 支持流式通信
- 云原生生态集成好（Envoy、Istio）

适用场景：多语言微服务、云原生架构。

### 11.3 Thrift

Facebook 开源。

特点：
- 自定义二进制协议
- 内置 RPC 框架
- 跨语言支持好
- 生态相对小

适用场景：Facebook 系技术栈、遗留系统。

### 11.4 JSON-RPC

基于 JSON 的轻量级 RPC。

特点：
- 可读性好
- 实现简单
- 性能不如二进制协议
- 无强类型

适用场景：简单场景、调试友好。

### 11.5 对比表

| 框架 | 协议 | 序列化 | 跨语言 | 流式 | 生态 | 性能 |
|------|------|--------|--------|------|------|------|
| Dubbo | TCP/HTTP2 | Hessian/Protobuf | Java 为主 | 支持 | 国内强 | 高 |
| gRPC | HTTP/2 | Protobuf | 好 | 支持 | 云原生强 | 高 |
| Thrift | TCP | Thrift | 好 | 支持 | 一般 | 高 |
| JSON-RPC | HTTP | JSON | 好 | 不支持 | 一般 | 中 |

## 十二、RPC 在微服务间的应用

### 12.1 为什么微服务用 RPC

微服务间通信频繁，对性能和类型安全要求高，RPC 比 REST 更合适：
1. 性能：二进制序列化、连接复用，吞吐量高
2. 类型安全：接口定义清晰，编译期检查
3. 代码生成：客户端 SDK 自动生成，减少手写
4. 流式支持：实时通信场景

### 12.2 服务间调用模式

1. 同步调用：A 调用 B，等待 B 返回。简单直接，但耦合度高，故障会传播。
2. 异步消息：A 发消息到队列，B 消费。解耦，但复杂度高。
3. 异步回调：A 调用 B 后不等待，B 完成后回调 A。折中方案。

RPC 主要用于同步调用。异步通常用消息队列（Kafka、RabbitMQ）。

### 12.3 服务网格（Service Mesh）

服务网格（如 Istio、Linkerd）将 RPC 通信的通用逻辑（负载均衡、熔断、重试、链路追踪）从应用代码剥离到 Sidecar 代理中。应用只需发普通 RPC 请求，Sidecar 处理所有通信治理。

\`\`\`
应用 A -> Sidecar A -> 网络 -> Sidecar B -> 应用 B
\`\`\`

这种架构让应用代码更简洁，通信治理能力统一管理。gRPC 是服务网格的主要协议。

## 十三、gRPC-Web 前端调用

### 13.1 浏览器的限制

gRPC 基于 HTTP/2，但浏览器对 HTTP/2 的访问有限制（无法设置自定义头部、无法访问 HTTP/2 trailers），因此浏览器不能直接调用 gRPC。

### 13.2 gRPC-Web 方案

gRPC-Web 是 gRPC 的浏览器版本。架构：

\`\`\`
浏览器(gRPC-Web) -> Envoy 代理(协议转换) -> 后端(gRPC)
\`\`\`

Envoy 代理将浏览器的 gRPC-Web 请求转换为标准 gRPC 请求转发给后端，将 gRPC 响应转换为 gRPC-Web 响应返回给浏览器。

### 13.3 使用流程

1. 定义 .proto 文件
2. 用 protoc-gen-grpc-web 生成前端代码
3. 前端用生成的客户端调用，像调用本地方法
4. 部署 Envoy 代理做协议转换

gRPC-Web 让前端也能享受 gRPC 的类型安全和流式通信，但增加了一层代理，架构更复杂。对于纯前端项目，REST/GraphQL 可能更简单。

## 十四、多语言对照示例

实现一个简单的计算器 RPC 服务。

### 14.1 Node.js（模拟）

\`\`\`javascript
// 简易 RPC 实现
class RPCServer {
  constructor() { this.methods = {}; }
  register(name, fn) { this.methods[name] = fn; }
  handle(request) {
    const { method, params } = JSON.parse(request);
    if (!this.methods[method]) return JSON.stringify({ error: 'method not found' });
    try {
      const result = this.methods[method](...params);
      return JSON.stringify({ result });
    } catch (e) {
      return JSON.stringify({ error: e.message });
    }
  }
}

class RPCClient {
  constructor(server) { this.server = server; }
  call(method, ...params) {
    const resp = JSON.parse(this.server.handle(JSON.stringify({ method, params })));
    if (resp.error) throw new Error(resp.error);
    return resp.result;
  }
}
\`\`\`

### 14.2 Java（gRPC 风格）

\`\`\`java
// 服务端
public class CalculatorImpl extends CalculatorGrpc.CalculatorImplBase {
  @Override
  public void add(AddRequest req, StreamObserver<AddResponse> responseObserver) {
    int result = req.getA() + req.getB();
    responseObserver.onNext(AddResponse.newBuilder().setResult(result).build());
    responseObserver.onCompleted();
  }
}

// 客户端
CalculatorGrpc.CalculatorBlockingStub client = CalculatorGrpc.newBlockingStub(channel);
AddResponse resp = client.add(AddRequest.newBuilder().setA(1).setB(2).build());
\`\`\`

### 14.3 Go（gRPC）

\`\`\`go
// 服务端
type server struct{}
func (s *server) Add(ctx context.Context, req *AddRequest) (*AddResponse, error) {
  return &AddResponse{Result: req.A + req.B}, nil
}

// 客户端
resp, _ := client.Add(ctx, &AddRequest{A: 1, B: 2})
\`\`\`

### 14.4 Python（gRPC）

\`\`\`python
# 服务端
class CalculatorServicer(calculator_pb2_grpc.CalculatorServicer):
    def Add(self, request, context):
        return calculator_pb2.AddResponse(result=request.a + request.b)

# 客户端
response = stub.Add(calculator_pb2.AddRequest(a=1, b=2))
\`\`\`

可以看到，不同语言的 gRPC 代码结构高度一致：定义服务、实现服务、注册服务、客户端调用。这正是 gRPC 跨语言优势的体现。

## 十五、RPC 常见坑

### 15.1 超时设置不当

RPC 调用必须设置超时，否则网络故障时调用会一直挂起，耗尽线程池。常见问题：
- 不设超时：网络故障时请求堆积，服务雪崩
- 超时太长：故障传播，影响上游
- 超时太短：正常请求被误杀

建议：根据 P99 延迟设置超时，通常为 P99 的 2-3 倍。

### 15.2 重试导致雪崩

网络抖动时重试可以提高成功率，但盲目重试会导致请求量翻倍，压垮服务。建议：
- 只对幂等操作重试
- 限制重试次数（通常 1-2 次）
- 使用指数退避
- 实现熔断机制，故障时停止重试

### 15.3 序列化兼容性

Protobuf 字段变更不当会导致兼容性问题：
- 复用已删除字段的编号：旧数据被错误解析
- 修改字段类型为不兼容类型：解析失败

建议：删除字段时用 reserved 保留编号，字段类型变更要谨慎。

### 15.4 大消息传输

Protobuf 大消息会占用大量内存，影响 GC。建议：
- 单个消息控制在 1MB 以内
- 大数据用流式传输
- 配置最大消息大小限制

### 15.5 连接管理

gRPC 长连接需要妥善管理：
- 连接断开后的重连
- 连接池大小配置
- 空闲连接超时

不正确的连接管理会导致连接泄漏、资源耗尽。

## 十六、生产环境实践

### 16.1 接口版本管理

gRPC 包名中包含版本号，如 com.example.user.v1、com.example.user.v2。这样多个版本可以共存，客户端按需选择。

### 16.2 错误处理

gRPC 用 status code 表示错误类型：

\`\`\`go
import "google.golang.org/grpc/codes"
import "google.golang.org/grpc/status"

func (s *server) GetUser(ctx context.Context, req *GetUserRequest) (*User, error) {
  user := findUser(req.Id)
  if user == nil {
    return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
  }
  if !hasPermission(ctx, user) {
    return nil, status.Error(codes.PermissionDenied, "no permission")
  }
  return user, nil
}
\`\`\`

常用 code：
- OK：成功
- InvalidArgument：参数错误
- NotFound：资源不存在
- PermissionDenied：无权限
- Unauthenticated：未认证
- Internal：内部错误
- Unavailable：服务不可用
- DeadlineExceeded：超时

### 16.3 链路追踪

gRPC 拦截器集成 OpenTelemetry，实现分布式链路追踪：

\`\`\`go
import "go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"

grpcServer := grpc.NewServer(
  grpc.StatsHandler(otelgrpc.NewServerHandler()),
)
\`\`\`

每个 RPC 调用会产生一个 span，串联起整个调用链，便于排查分布式系统问题。

### 16.4 健康检查与优雅关闭

服务启动时注册健康检查，优雅关闭时先将状态设为 NOT_SERVING，等待存量请求处理完再退出：

\`\`\`go
healthServer.SetServingStatus("", healthpb.HealthCheckResponse_NOT_SERVING)
grpcServer.GracefulStop()
\`\`\`

## 十七、总结

RPC 是分布式系统通信的核心技术：
1. RPC 让远程调用像本地调用一样简单，核心是存根和序列化
2. Protobuf 是高效的二进制序列化格式，支持 schema 演进
3. gRPC 基于 HTTP/2 和 Protobuf，支持四种调用模式
4. gRPC 在性能、类型安全、跨语言上优于 REST
5. 拦截器、健康检查、服务发现是生产级 RPC 的必备能力
6. 超时、重试、熔断是 RPC 稳定性的关键

选择 RPC 还是 REST，取决于场景：内部高性能通信用 gRPC，对外公开 API 用 REST，两者通过网关协议转换共存。`,
    code: `// 简易 RPC 框架实现
// 包含：RPCServer（方法注册/路由/参数校验/错误码）、RPCClient（远程调用/序列化/超时/重试）
// 用 JSON 模拟序列化，用 EventEmitter 模拟网络传输

const { EventEmitter } = require('events');
const crypto = require('crypto');

// ============ 错误码定义 ============
const ErrorCodes = {
  OK: 0,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  TIMEOUT: -32000,
  SERVICE_ERROR: -32001,
};

// ============ RPC 请求/响应消息 ============
// 请求：{ id, method, params, jsonrpc: "2.0" }
// 响应：{ id, result?, error? }

// ============ 模拟网络通道 ============
class NetworkChannel extends EventEmitter {
  constructor() {
    super();
    this.serverHandler = null;
    this.latency = 0; // 模拟网络延迟
    this.failureRate = 0; // 模拟网络故障率
  }
  setServer(handler) { this.serverHandler = handler; }
  send(request) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      const delay = this.latency + Math.random() * 50;
      setTimeout(() => {
        // 模拟网络故障
        if (Math.random() < this.failureRate) {
          resolve({ id: request.id, error: { code: ErrorCodes.TIMEOUT, message: '网络超时' } });
          return;
        }
        // 调用服务端处理
        const response = this.serverHandler(request);
        resolve(response);
      }, delay);
    });
  }
}

// ============ RPC 服务端 ============
class RPCServer {
  constructor() {
    this.methods = new Map();
    this.channel = new NetworkChannel();
    this.channel.setServer((req) => this.handleRequest(req));
  }

  // 注册方法
  register(name, handler, paramSchema = null) {
    this.methods.set(name, { handler, paramSchema });
    console.log(\`[RPCServer] 注册方法: \${name}\`);
  }

  // 处理请求
  handleRequest(request) {
    const { id, method, params } = request;
    const registered = this.methods.get(method);
    if (!registered) {
      return { id, error: { code: ErrorCodes.METHOD_NOT_FOUND, message: \`方法 '\${method}' 不存在\` } };
    }
    // 参数校验
    if (registered.paramSchema) {
      const validation = this.validateParams(params, registered.paramSchema);
      if (!validation.valid) {
        return { id, error: { code: ErrorCodes.INVALID_PARAMS, message: validation.message } };
      }
    }
    // 执行方法
    try {
      const result = registered.handler(...(params || []));
      return { id, result };
    } catch (e) {
      return { id, error: { code: ErrorCodes.INTERNAL_ERROR, message: e.message } };
    }
  }

  validateParams(params, schema) {
    if (!Array.isArray(params)) return { valid: false, message: '参数必须是数组' };
    if (params.length < (schema.minParams || 0)) {
      return { valid: false, message: \`至少需要 \${schema.minParams} 个参数\` };
    }
    if (schema.types) {
      for (let i = 0; i < params.length; i++) {
        const expected = schema.types[i];
        if (expected && typeof params[i] !== expected) {
          return { valid: false, message: \`参数 \${i} 类型应为 \${expected}，实际为 \${typeof params[i]}\` };
        }
      }
    }
    return { valid: true };
  }
}

// ============ RPC 客户端 ============
class RPCClient {
  constructor(server) {
    this.server = server;
    this.timeout = 2000; // 默认超时 2 秒
    this.retryCount = 2; // 默认重试 2 次
  }

  // 远程调用
  async call(method, ...params) {
    const id = crypto.randomUUID();
    const request = { jsonrpc: '2.0', id, method, params };

    let lastError;
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      if (attempt > 0) console.log(\`  [RPCClient] 第 \${attempt} 次重试...\`);
      try {
        const response = await Promise.race([
          this.server.channel.send(request),
          this.createTimeout(this.timeout),
        ]);
        if (response.error) {
          // 方法不存在或参数错误不重试
          if (response.error.code === ErrorCodes.METHOD_NOT_FOUND ||
              response.error.code === ErrorCodes.INVALID_PARAMS) {
            throw new RPCError(response.error.code, response.error.message);
          }
          lastError = new RPCError(response.error.code, response.error.message);
          continue; // 其他错误重试
        }
        return response.result;
      } catch (e) {
        if (e instanceof RPCError) throw e; // 业务错误直接抛出
        lastError = e; // 超时等错误，重试
      }
    }
    throw lastError || new Error('调用失败');
  }

  createTimeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new RPCError(ErrorCodes.TIMEOUT, '请求超时')), ms));
  }
}

// ============ 自定义错误 ============
class RPCError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// ============ 创建服务端并注册方法 ============
const server = new RPCServer();

// 加法
server.register('add', (a, b) => {
  console.log(\`  [服务端] 执行 add(\${a}, \${b})\`);
  return a + b;
}, { minParams: 2, types: ['number', 'number'] });

// 乘法
server.register('multiply', (a, b) => {
  console.log(\`  [服务端] 执行 multiply(\${a}, \${b})\`);
  return a * b;
}, { minParams: 2, types: ['number', 'number'] });

// 获取用户
const users = { 1: { id: 1, name: 'Alice', email: 'alice@example.com' }, 2: { id: 2, name: 'Bob', email: 'bob@example.com' } };
server.register('getUser', (id) => {
  console.log(\`  [服务端] 执行 getUser(\${id})\`);
  const user = users[id];
  if (!user) throw new Error(\`用户 \${id} 不存在\`);
  return user;
}, { minParams: 1, types: ['number'] });

// 模拟慢方法（用于超时测试）
server.register('slowMethod', () => {
  console.log('  [服务端] 执行 slowMethod（很慢）');
  // 实际由网络延迟模拟慢
  return 'done';
});

const client = new RPCClient(server);

// ============ 演示 ============
async function demo() {
  console.log('========== RPC 框架演示 ==========');

  console.log('\\n--- 1. 正常调用 add ---');
  const sum = await client.call('add', 3, 5);
  console.log(\`add(3, 5) = \${sum}\`);

  console.log('\\n--- 2. 正常调用 multiply ---');
  const product = await client.call('multiply', 4, 6);
  console.log(\`multiply(4, 6) = \${product}\`);

  console.log('\\n--- 3. 正常调用 getUser ---');
  const user = await client.call('getUser', 1);
  console.log(\`getUser(1) = \${JSON.stringify(user)}\`);

  console.log('\\n--- 4. 方法不存在 ---');
  try { await client.call('nonExistent'); }
  catch (e) { console.log(\`错误: code=\${e.code}, message=\${e.message}\`); }

  console.log('\\n--- 5. 参数类型错误 ---');
  try { await client.call('add', 'a', 'b'); }
  catch (e) { console.log(\`错误: code=\${e.code}, message=\${e.message}\`); }

  console.log('\\n--- 6. 参数数量不足 ---');
  try { await client.call('add', 1); }
  catch (e) { console.log(\`错误: code=\${e.code}, message=\${e.message}\`); }

  console.log('\\n--- 7. 服务端业务错误 ---');
  try { await client.call('getUser', 999); }
  catch (e) { console.log(\`错误: code=\${e.code}, message=\${e.message}\`); }

  console.log('\\n--- 8. 超时重试 ---');
  server.channel.latency = 500; // 模拟 500ms 延迟
  client.timeout = 300; // 超时 300ms
  client.retryCount = 1;
  try { await client.call('add', 1, 2); }
  catch (e) { console.log(\`最终错误: code=\${e.code}, message=\${e.message}\`); }

  console.log('\\n--- 9. 恢复后正常调用 ---');
  server.channel.latency = 0;
  client.timeout = 2000;
  client.retryCount = 2;
  const result = await client.call('add', 10, 20);
  console.log(\`add(10, 20) = \${result}\`);

  console.log('\\n========== 演示结束 ==========');
}

demo();`,
  },
  {
    id: "backend-auth",
    group: "API 设计与架构",
    icon: "🔐",
    title: "认证与授权",
    content: `# 认证与授权

## 一、认证 vs 授权

认证（Authentication）和授权（Authorization）是安全领域的两个核心概念，经常被混淆，但它们解决的是不同的问题。

### 1.1 认证（Authentication）

认证回答"你是谁"这个问题。它的目标是验证用户的身份。常见的认证方式：
- 用户名密码
- 手机验证码
- 生物识别（指纹、人脸）
- 数字证书
- Token（JWT）

认证的过程：用户提供凭证 -> 系统验证凭证 -> 确认用户身份。

### 1.2 授权（Authorization）

授权回答"你能做什么"这个问题。它的目标是控制用户对资源的访问权限。在认证通过后，系统根据用户的身份和权限，决定用户可以执行哪些操作。

授权的过程：用户已认证 -> 系统查询用户权限 -> 判断是否允许操作。

### 1.3 区别与联系

| 维度 | 认证 | 授权 |
|------|------|------|
| 问题 | 你是谁 | 你能做什么 |
| 顺序 | 先 | 后 |
| 依据 | 凭证 | 权限规则 |
| 失败 | 401 Unauthorized | 403 Forbidden |
| 示例 | 登录验证密码 | 检查是否是管理员 |

认证是授权的前提：必须先知道"你是谁"，才能判断"你能做什么"。但认证通过不等于授权通过——一个普通用户认证通过后，仍可能无权访问管理后台。

### 1.4 容易混淆的状态码

- 401 Unauthorized：实际含义是"未认证"，客户端需要提供认证信息。
- 403 Forbidden：实际含义是"已认证但无权限"，服务器拒绝执行。

这两个状态码的命名容易引起混淆，但理解它们的实际含义很重要。

## 二、Session/Cookie 认证机制

### 2.1 工作原理

Session/Cookie 是传统的 Web 认证方式，工作流程：

1. 用户提交用户名密码
2. 服务器验证通过，创建 Session，将用户信息存入 Session
3. 服务器返回 Set-Cookie 头部，包含 Session ID
4. 浏览器存储 Cookie
5. 后续请求自动携带 Cookie
6. 服务器根据 Session ID 找到 Session，获取用户信息

### 2.2 详细流程

**登录：**
\`\`\`
客户端                      服务器
  |                           |
  | POST /login {user, pwd}   |
  |-------------------------->|
  |                           | 验证密码
  |                           | 创建 Session(id=abc, userId=123)
  |                           | 存储 Session（内存/Redis）
  |  Set-Cookie: sid=abc     |
  |<--------------------------|
  |                           |
\`\`\`

**后续请求：**
\`\`\`
客户端                      服务器
  |                           |
  | GET /profile              |
  | Cookie: sid=abc           |
  |-------------------------->|
  |                           | 读取 Cookie 中的 sid
  |                           | 查找 Session(abc)
  |                           | 获取 userId=123
  |                           | 返回用户数据
  |  200 OK {profile}         |
  |<--------------------------|
\`\`\`

### 2.3 Cookie 的属性

Cookie 有多个安全相关属性：

- **HttpOnly**：禁止 JavaScript 访问 Cookie，防止 XSS 窃取。
- **Secure**：只在 HTTPS 下发送 Cookie。
- **SameSite**：控制跨站请求是否发送 Cookie。
  - Strict：完全不发送跨站请求
  - Lax：部分跨站请求发送（默认值）
  - None：都发送（需配合 Secure）
- **Max-Age/Expires**：Cookie 过期时间。
- **Domain/Path**：Cookie 的作用范围。

### 2.4 Session 的存储

Session 可以存储在：
1. 内存：简单快速，但不可扩展（服务器重启丢失，多服务器不共享）。
2. 文件：持久化，但性能差。
3. 数据库：可靠，但每次请求查数据库，性能一般。
4. Redis：内存数据库，性能好，支持过期，是最常用的 Session 存储。

### 2.5 Session/Cookie 的问题

1. 扩展性：Session 存储在服务器，多服务器需要共享 Session（Session 粘滞或集中存储）。
2. CSRF：Cookie 自动携带，容易受跨站请求伪造攻击。
3. 移动端不友好：移动端管理 Cookie 不如 Web 方便。
4. 跨域问题：Cookie 有同源策略限制。

## 三、JWT 原理深度讲解

### 3.1 什么是 JWT

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息。JWT 通常用于认证和信息交换。

JWT 的特点是"无状态"：服务器不需要存储 Token，Token 本身包含了用户信息和签名，服务器只需验证签名即可确认用户身份。

### 3.2 JWT 的结构

JWT 由三部分组成，用点（.）分隔：\`Header.Payload.Signature\`

#### Header

Header 是一个 JSON 对象，描述 Token 的类型和签名算法：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

然后 Base64URL 编码，形成 JWT 的第一部分。

#### Payload

Payload 是一个 JSON 对象，包含声明（Claims）。声明是关于实体（通常是用户）和其他数据的语句。

声明分三类：
1. 注册声明（Registered Claims）：预定义的声明，非强制但推荐。
   - iss（issuer）：签发者
   - sub（subject）：主题（通常是用户 ID）
   - aud（audience）：接收方
   - exp（expiration）：过期时间
   - nbf（not before）：生效时间
   - iat（issued at）：签发时间
   - jti（JWT ID）：唯一标识
2. 公共声明：可以自定义，但应避免冲突。
3. 私有声明：双方约定的声明。

\`\`\`json
{
  "sub": "1234567890",
  "name": "Alice",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}
\`\`\`

Payload 也 Base64URL 编码，形成 JWT 的第二部分。

**重要：Payload 是 Base64 编码的，不是加密的！任何人都可以解码查看。不要在 Payload 中放敏感信息！**

#### Signature

Signature 是用 Header 中指定的算法，对编码后的 Header、Payload 和密钥进行签名：

\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

签名用于验证 Token 没有被篡改。如果有人修改了 Payload，签名验证会失败。

### 3.3 JWT 的完整示例

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

三段分别是 Header、Payload、Signature。

### 3.4 HS256 vs RS256

JWT 支持多种签名算法，最常用的是 HS256 和 RS256。

#### HS256（HMAC with SHA-256）

对称加密，签名和验证用同一个密钥：
- 签发方用 secret 签名
- 验证方用同一个 secret 验证

优点：简单，性能好。
缺点：密钥需要安全共享，不适合多方场景。

#### RS256（RSA Signature with SHA-256）

非对称加密，用私钥签名，公钥验证：
- 签发方用私钥签名
- 验证方用公钥验证（公钥可以公开）

优点：公钥可公开，验证方不需要密钥，适合微服务、第三方验证。
缺点：计算慢，密钥管理复杂。

选择：
- 单一服务、简单场景：HS256
- 多服务、需要公钥验证：RS256
- OAuth/OIDC：通常用 RS256

### 3.5 JWT 的优势

1. 无状态：服务器不需要存储 Session，易于水平扩展。
2. 自包含：Token 包含用户信息，减少数据库查询。
3. 跨域：Token 通过 Header 传递，不受 Cookie 同源策略限制。
4. 移动端友好：不依赖 Cookie，适合 App。
5. 标准化：RFC 标准，跨语言支持好。

### 3.6 JWT 的缺点

1. 无法主动注销：Token 一旦签发，在过期前一直有效。服务器无法"撤销"一个 Token。
2. Payload 不加密：Base64 编码，任何人可解码查看。不能放敏感信息。
3. 续期问题：Token 过期后需要重新签发，如何无感续期？
4. 大小：JWT 比 Session ID 大，每次请求都要传输。
5. 重放攻击：Token 被窃取后，在过期前可以被重放使用。

## 四、JWT 安全问题与解决方案

### 4.1 无法主动注销

**问题**：用户退出登录后，Token 仍然有效，被窃取的 Token 仍可使用。

**解决方案**：
1. 黑名单：服务器维护一个已注销 Token 的黑名单（存 Redis），验证时检查。但这破坏了无状态性。
2. 短期 Token + Refresh Token：Access Token 有效期短（如 15 分钟），过期后用 Refresh Token 换新的。退出时只注销 Refresh Token，Access Token 很快过期。
3. Token 版本号：在用户信息中维护 Token 版本号，签发 Token 时写入版本号，验证时检查。修改密码或退出时递增版本号，使旧 Token 失效。

### 4.2 Payload 不加密

**问题**：Payload 是 Base64 编码，任何人可解码查看。

**解决方案**：
1. 不在 Payload 中放敏感信息（密码、身份证号等）。
2. 如需加密，使用 JWE（JSON Web Encryption）而非 JWS（JSON Web Signature）。JWE 对 Payload 加密，只有持有密钥的人能解密。

### 4.3 重放攻击

**问题**：Token 被窃取后，攻击者可以重放使用。

**解决方案**：
1. 使用 HTTPS，防止 Token 被中间人窃取。
2. 短期 Token，减少被窃取后的影响时间。
3. 绑定客户端指纹（IP、设备指纹），验证时检查。
4. 对于敏感操作，要求二次认证（如支付时再输密码）。

### 4.4 XSS 攻击

**问题**：如果 Token 存在 localStorage，XSS 攻击可以窃取 Token。

**解决方案**：
1. Token 存在 HttpOnly Cookie 中，XSS 无法读取。但会有 CSRF 问题。
2. 如果存在 localStorage，要做好 XSS 防护（CSP、输入过滤、输出编码）。
3. 短期 Token 减少被窃取的影响。

### 4.5 CSRF 攻击

**问题**：如果 Token 存在 Cookie 中，且自动携带，可能受 CSRF 攻击。

**解决方案**：
1. Token 存在 localStorage，通过 Authorization 头部发送，不自动携带，天然防 CSRF。
2. 使用 SameSite Cookie 属性。
3. CSRF Token 双重验证。

## 五、Token 刷新机制

### 5.1 双 Token 方案

为了平衡安全性和用户体验，采用双 Token 方案：
- Access Token：短期（15-30 分钟），用于 API 访问。
- Refresh Token：长期（7-30 天），用于刷新 Access Token。

### 5.2 工作流程

1. 用户登录，服务器签发 Access Token 和 Refresh Token。
2. 客户端用 Access Token 访问 API。
3. Access Token 过期，客户端用 Refresh Token 请求新的 Access Token。
4. 服务器验证 Refresh Token，签发新的 Access Token（可能也刷新 Refresh Token）。
5. Refresh Token 过期或被注销，用户需要重新登录。

### 5.3 Refresh Token 的存储

与 Access Token 不同，Refresh Token 需要服务器存储（或至少能验证），因为：
1. 退出登录时需要注销 Refresh Token。
2. Refresh Token 被窃取时可以撤销。
3. 可以实现"单设备登录"（新登录使旧 Refresh Token 失效）。

通常将 Refresh Token 存在 Redis 或数据库，关联用户 ID 和过期时间。

### 5.4 自动续期

客户端可以在 Access Token 即将过期时，自动用 Refresh Token 刷新，实现无感续期。常见策略：
1. 响应拦截器：API 返回 401 时，自动刷新 Token 并重试。
2. 主动刷新：在 Access Token 过期前，主动刷新。

### 5.5 Refresh Token 轮换

为了防止 Refresh Token 被窃取后长期使用，可以采用 Refresh Token 轮换：
- 每次刷新时，旧的 Refresh Token 失效，签发新的 Refresh Token。
- 如果检测到旧 Refresh Token 被使用（说明被盗），可以撤销整个 Token 链。

## 六、OAuth 2.0

### 6.1 什么是 OAuth 2.0

OAuth 2.0 是一个授权框架，允许第三方应用在用户授权下访问用户在另一服务上的资源，而无需透露用户的密码。

典型场景：用 GitHub 账号登录第三方应用，第三方应用获取你的 GitHub 用户信息，但你不需要告诉第三方应用你的 GitHub 密码。

### 6.2 OAuth 2.0 的角色

- 资源所有者（Resource Owner）：用户
- 客户端（Client）：第三方应用
- 授权服务器（Authorization Server）：签发 Token 的服务器
- 资源服务器（Resource Server）：存储资源的服务器

### 6.3 四种授权模式

#### 6.3.1 授权码模式（Authorization Code）

最常用、最安全的模式，适合有后端服务的 Web 应用。

流程：
1. 客户端将用户重定向到授权服务器的登录页面，附带 client_id 和 redirect_uri。
2. 用户登录并授权。
3. 授权服务器将用户重定向回客户端的 redirect_uri，附带授权码（code）。
4. 客户端用授权码向授权服务器换取 Access Token。
5. 客户端用 Access Token 访问资源服务器。

\`\`\`
客户端          授权服务器        资源服务器
  |                |                 |
  | 1.重定向到登录  |                 |
  |--------------->|                 |
  | 2.用户登录授权  |                 |
  |<---------------|                 |
  | 3.重定向回 redirect_uri?code=xxx |
  |                |                 |
  | 4.用 code 换 token               |
  |--------------->|                 |
  | 5.返回 token   |                 |
  |<---------------|                 |
  |                                  |
  | 6.用 token 访问资源               |
  |--------------------------------->|
  | 7.返回资源                        |
  |<---------------------------------|
\`\`\`

为什么用授权码而不是直接给 Token？因为重定向发生在浏览器，直接给 Token 会暴露在 URL 中。授权码是短期的、一次性的，且换取 Token 在后端进行，更安全。

#### 6.3.2 隐式模式（Implicit）

简化版授权码模式，直接在重定向中返回 Token，没有换取步骤。

适用于纯前端应用（SPA），没有后端。但安全性较差，已不推荐使用，被授权码模式 + PKCE 替代。

#### 6.3.3 密码模式（Resource Owner Password Credentials）

用户直接将用户名密码给客户端，客户端用密码换 Token。

适用于高度信任的客户端（如官方应用）。不推荐第三方使用，因为客户端会接触到用户密码。

#### 6.3.4 客户端凭证模式（Client Credentials）

客户端用自己的凭证（而非用户）获取 Token，用于客户端访问自己的资源。

适用于服务间通信，没有用户参与的场景。如微服务 A 访问微服务 B 的 API。

### 6.4 四种模式对比

| 模式 | 安全性 | 适用场景 | 用户参与 |
|------|--------|---------|---------|
| 授权码 | 高 | Web 应用、有后端 | 是 |
| 隐式 | 低 | 纯前端（已不推荐） | 是 |
| 密码 | 中 | 官方应用 | 是 |
| 客户端凭证 | 高 | 服务间通信 | 否 |

### 6.5 授权码模式 + PKCE

PKCE（Proof Key for Code Exchange）是授权码模式的增强，为没有后端的移动应用和 SPA 设计。

流程增加了一步：
1. 客户端生成 code_verifier（随机字符串）。
2. 计算 code_challenge = SHA256(code_verifier)。
3. 授权请求携带 code_challenge。
4. 换取 Token 时携带 code_verifier。
5. 授权服务器验证 code_challenge 和 code_verifier 匹配。

PKCE 防止了授权码被截获后被他人换取 Token 的风险，因为攻击者没有 code_verifier。

## 七、第三方登录实践

### 7.1 GitHub 登录流程

以 GitHub OAuth 登录为例：

1. 用户点击"用 GitHub 登录"。
2. 重定向到 \`https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=user:email\`
3. 用户在 GitHub 登录并授权。
4. GitHub 重定向回 \`redirect_uri?code=xxx\`。
5. 后端用 code 向 \`https://github.com/login/oauth/access_token\` 换取 Access Token。
6. 后端用 Access Token 向 \`https://api.github.com/user\` 获取用户信息。
7. 后端根据用户信息登录或注册，签发自己的 Token。

### 7.2 微信登录流程

微信登录类似，但有平台差异：
- 网站应用：扫码登录
- 移动应用：APP 内授权
- 公众号：网页授权

核心流程都是：获取 code -> 换 access_token -> 获取用户信息。

### 7.3 第三方登录的账号绑定

用户用第三方登录后，如何关联本地账号？
1. 首次登录：让用户绑定已有账号或创建新账号。
2. 后续登录：通过第三方 ID 直接找到本地账号。

数据库设计：
- users 表：id, username, email, password_hash
- user_oauth 表：id, user_id, provider(github/wechat), openid, created_at

## 八、RBAC 权限模型

### 8.1 什么是 RBAC

RBAC（Role-Based Access Control，基于角色的访问控制）是最常用的权限模型。核心思想：用户关联角色，角色关联权限，通过角色间接获得权限。

### 8.2 RBAC 的三个实体

- 用户（User）：系统的使用者
- 角色（Role）：权限的集合，如"管理员"、"编辑"、"普通用户"
- 权限（Permission）：对资源的操作能力，如"创建文章"、"删除用户"

关系：用户-角色多对多，角色-权限多对多。

### 8.3 RBAC 数据库设计

\`\`\`sql
-- 用户表
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50),
  password_hash VARCHAR(255)
);

-- 角色表
CREATE TABLE roles (
  id BIGINT PRIMARY KEY,
  name VARCHAR(50),
  description VARCHAR(200)
);

-- 权限表
CREATE TABLE permissions (
  id BIGINT PRIMARY KEY,
  name VARCHAR(50),
  resource VARCHAR(50),
  action VARCHAR(20)
);

-- 用户-角色关联表
CREATE TABLE user_roles (
  user_id BIGINT,
  role_id BIGINT,
  PRIMARY KEY (user_id, role_id)
);

-- 角色-权限关联表
CREATE TABLE role_permissions (
  role_id BIGINT,
  permission_id BIGINT,
  PRIMARY KEY (role_id, permission_id)
);
\`\`\`

### 8.4 权限检查流程

1. 用户认证后，获取用户 ID。
2. 查询用户的角色：\`SELECT role_id FROM user_roles WHERE user_id = ?\`
3. 查询角色的权限：\`SELECT permission_id FROM role_permissions WHERE role_id IN (?)\`
4. 判断用户是否有所需权限：\`required_permission IN user_permissions\`

为了性能，用户的权限集合通常缓存起来（如 Redis），避免每次请求都查数据库。

### 8.5 RBAC 的层级

RBAC 有不同层级：
- RBAC0：基础模型，用户-角色-权限。
- RBAC1：增加角色继承，角色可以有父角色，继承父角色的权限。
- RBAC2：增加角色约束，如互斥角色、角色数量限制。
- RBAC3：RBAC1 + RBAC2，最完整的模型。

### 8.6 RBAC 的优势

1. 简化管理：用户不直接关联权限，通过角色管理更简洁。
2. 灵活：角色变更时，所有关联用户自动获得新权限。
3. 符合组织结构：角色对应职位/岗位，易于理解。
4. 可审计：权限分配清晰，便于审计。

### 8.7 RBAC 的局限

1. 角色爆炸：权限组合复杂时，角色数量可能爆炸。
2. 粒度有限：难以表达"用户只能编辑自己创建的文章"这样的条件权限。
3. 不够灵活：对于动态权限场景，RBAC 可能不够。

## 九、ABAC 属性权限模型

### 9.1 什么是 ABAC

ABAC（Attribute-Based Access Control，基于属性的访问控制）根据用户、资源、环境、操作的属性来决定是否授权。

### 9.2 ABAC 的四个属性

- 用户属性：部门、职级、安全等级
- 资源属性：所有者、密级、创建时间
- 环境属性：时间、地点、网络
- 操作属性：读、写、删除

### 9.3 ABAC 策略示例

策略："用户只能编辑自己部门创建的、密级不超过自己安全等级的文档，且只能在工作时间编辑。"

\`\`\`
allow if 
  user.department == resource.department AND
  user.security_level >= resource.classification AND
  environment.time in business_hours AND
  action == "edit"
\`\`\`

### 9.4 ABAC vs RBAC

| 维度 | RBAC | ABAC |
|------|------|------|
| 依据 | 角色 | 属性 |
| 灵活性 | 中 | 高 |
| 复杂度 | 低 | 高 |
| 粒度 | 角色 | 细粒度 |
| 适合 | 组织权限 | 复杂动态权限 |

实践中，RBAC 和 ABAC 常结合使用：RBAC 做粗粒度控制，ABAC 做细粒度补充。

## 十、SSO 单点登录

### 10.1 什么是 SSO

SSO（Single Sign-On，单点登录）允许用户在一次认证后，访问多个相互信任的应用系统，无需重复登录。

典型场景：登录 Google 后，访问 Gmail、YouTube、Drive 都不需要再登录。

### 10.2 SSO 的价值

1. 用户体验：一次登录，多系统访问。
2. 管理效率：集中管理用户认证，降低维护成本。
3. 安全性：集中认证点，便于实施安全策略（多因子认证、异常检测）。

### 10.3 SSO 实现方式

#### 10.3.1 CAS（Central Authentication Service）

CAS 是耶鲁大学开发的 SSO 协议。核心是认证中心：
1. 用户访问应用 A，未登录，重定向到 CAS。
2. 用户在 CAS 登录，CAS 返回 Ticket。
3. 应用 A 用 Ticket 向 CAS 验证，获取用户信息。
4. 用户访问应用 B，重定向到 CAS，CAS 发现已登录，直接返回 Ticket。
5. 应用 B 验证 Ticket，获取用户信息。

#### 10.3.2 OAuth 2.0

OAuth 2.0 可以用于 SSO：授权服务器作为认证中心，各应用作为客户端。用户在授权服务器登录后，各应用通过授权码获取 Token。

#### 10.3.3 OIDC（OpenID Connect）

OIDC 是基于 OAuth 2.0 的认证协议，是 OAuth 2.0 的认证层补充。OIDC 在 OAuth 2.0 的基础上增加了 ID Token，包含用户身份信息。

OIDC 是现代 SSO 的主流方案，Google、Microsoft、AWS 等都支持 OIDC。

### 10.4 SSO 的登出

SSO 登出比登录复杂：用户在一个应用登出，应该所有应用都登出。

实现方式：
1. 前端登出：认证中心通知所有应用登出（通过 iframe 或重定向）。
2. 后端登出：认证中心使 Token 失效，各应用验证 Token 时发现失效，要求重新登录。

## 十一、API Key 认证

### 11.1 什么是 API Key

API Key 是一个简单的字符串，用于标识调用方。客户端在请求中携带 API Key，服务器验证其有效性。

### 11.2 API Key 的传递

- 请求头：\`Authorization: ApiKey xxx\` 或 \`X-API-Key: xxx\`
- 查询参数：\`?api_key=xxx\`（不推荐，会出现在日志中）

### 11.3 API Key 的特点

优点：
1. 简单易用。
2. 适合服务间通信和公开 API。
3. 可以关联调用方信息，用于限流、计费。

缺点：
1. 安全性低：Key 泄露即被冒用。
2. 无用户概念：适合服务/应用，不适合用户。
3. 权限控制粗粒度。

### 11.4 API Key 的最佳实践

1. Key 保密：不在前端暴露，不放在 URL。
2. 限制权限：每个 Key 关联权限范围。
3. 限制来源：绑定 IP 或域名。
4. 设置过期：定期轮换 Key。
5. 监控使用：记录 Key 的调用，检测异常。

## 十二、安全要点

### 12.1 HTTPS

所有 API 必须使用 HTTPS，防止：
1. 中间人攻击：窃听、篡改通信内容。
2. 凭证窃取：Token、密码被窃取。
3. 重放攻击：请求被录制后重放。

HTTPS 通过 TLS/SSL 加密通信，是安全的基础。

### 12.2 HttpOnly Cookie

如果用 Cookie 存储认证信息，必须设置 HttpOnly，防止 JavaScript 读取，避免 XSS 窃取。

### 12.3 CSRF Token

如果用 Cookie 认证，需要防 CSRF：
1. 服务器生成 CSRF Token，放在表单或 Header。
2. 请求携带 CSRF Token。
3. 服务器验证 CSRF Token。

由于 CSRF 攻击无法读取页面内容，无法获取 CSRF Token，从而无法伪造请求。

### 12.4 密码加盐哈希

**绝对不能明文存储密码！** 也不能用简单的 MD5/SHA 哈希，因为：
1. 彩虹表攻击：预先计算的哈希表可以反查常见密码。
2. 相同密码哈希相同：一个泄露，所有相同密码的用户都暴露。

正确的做法是加盐哈希：
1. 为每个密码生成随机盐（salt）。
2. 将盐和密码拼接后哈希。
3. 存储哈希值和盐。

常用的密码哈希算法：
- bcrypt：慢哈希，内置盐，可调成本因子，最常用。
- scrypt：内存硬度，抗 GPU/ASIC 攻击。
- argon2：密码哈希竞赛冠军，最安全但较新。

### 12.5 bcrypt 示例

\`\`\`javascript
const bcrypt = require('bcrypt');

// 注册时
const salt = await bcrypt.genSalt(10); // 成本因子 10
const hash = await bcrypt.hash(password, salt);
// 存储 hash

// 登录时
const match = await bcrypt.compare(password, hash);
\`\`\`

bcrypt 的成本因子决定了哈希的计算时间。因子越高越安全，但越慢。通常 10-12 是合理的。

### 12.6 其他安全措施

1. 输入验证：防止 SQL 注入、XSS。
2. 输出编码：防止 XSS。
3. 限流：防止暴力破解、DDoS。
4. 日志审计：记录敏感操作。
5. 安全头部：CSP、X-Frame-Options、X-Content-Type-Options。
6. 依赖更新：及时更新有漏洞的依赖。

## 十三、多语言对照示例

### 13.1 JWT 签发与验证

**Node.js:**
\`\`\`javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 123, role: 'admin' }, 'secret', { expiresIn: '1h' });
const decoded = jwt.verify(token, 'secret');
\`\`\`

**Java (jjwt):**
\`\`\`java
String token = Jwts.builder()
    .setSubject("123")
    .claim("role", "admin")
    .setExpiration(new Date(System.currentTimeMillis() + 3600000))
    .signWith(SignatureAlgorithm.HS256, "secret")
    .compact();

Claims claims = Jwts.parser().setSigningKey("secret").parseClaimsJws(token).getBody();
\`\`\`

**Go:**
\`\`\`go
token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "userId": 123,
    "role":   "admin",
    "exp":    time.Now().Add(time.Hour).Unix(),
})
tokenString, _ := token.SignedString([]byte("secret"))

claims := jwt.MapClaims{}
jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
    return []byte("secret"), nil
})
\`\`\`

**Python (PyJWT):**
\`\`\`python
import jwt
token = jwt.encode({"userId": 123, "role": "admin", "exp": datetime.utcnow() + timedelta(hours=1)}, "secret", algorithm="HS256")
decoded = jwt.decode(token, "secret", algorithms=["HS256"])
\`\`\`

### 13.2 密码哈希

**Node.js:**
\`\`\`javascript
const hash = await bcrypt.hash(password, 10);
const match = await bcrypt.compare(password, hash);
\`\`\`

**Java (BCrypt):**
\`\`\`java
String hash = BCrypt.hashpw(password, BCrypt.gensalt(10));
boolean match = BCrypt.checkpw(password, hash);
\`\`\`

**Go (bcrypt):**
\`\`\`go
hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
err := bcrypt.CompareHashAndPassword(hash, []byte(password))
\`\`\`

**Python (passlib):**
\`\`\`python
from passlib.hash import bcrypt
hash = bcrypt.using(rounds=10).hash(password)
bcrypt.verify(password, hash)
\`\`\`

## 十四、认证授权的最佳实践

### 14.1 密码安全
1. 强制密码复杂度（长度、字符种类）。
2. 检查常见密码字典。
3. 加盐哈希存储（bcrypt/scrypt/argon2）。
4. 登录失败次数限制，防暴力破解。

### 14.2 Token 安全
1. Access Token 短期（15-30 分钟）。
2. Refresh Token 长期但可撤销。
3. HTTPS 传输。
4. 不在 URL 中传 Token。
5. 敏感操作二次认证。

### 14.3 Session 安全
1. HttpOnly + Secure + SameSite Cookie。
2. Session ID 足够随机。
3. 登录后重新生成 Session ID（防 Session Fixation）。
4. 设置合理过期时间。
5. 退出时销毁 Session。

### 14.4 权限设计
1. 最小权限原则：只给必要的权限。
2. 默认拒绝：没有明确允许的就拒绝。
3. 服务端校验：不信任前端，权限在服务端校验。
4. 权限缓存：减少数据库查询。

### 14.5 日志与监控
1. 记录登录日志（成功、失败）。
2. 记录敏感操作。
3. 异常检测（异地登录、频繁失败）。
4. 告警机制。

## 十五、常见坑

### 15.1 JWT 在 Payload 放密码

Payload 不加密，任何人可解码。绝对不能放密码、密钥等敏感信息。

### 15.2 不验证 Token 过期

有些实现只验证签名，不检查 exp。这导致 Token 永不过期，安全隐患大。必须检查 exp。

### 15.3 用 alg=none 绕过签名

JWT 允许 alg=none 表示不签名。攻击者可以修改 Header 的 alg 为 none，绕过签名验证。验证时必须拒绝 alg=none 的 Token。

### 15.4 权限只在前端校验

前端权限控制只是 UX 优化，不能依赖。必须在服务端校验权限，否则可以被绕过。

### 15.5 密码用 MD5 哈希

MD5 不安全，且有彩虹表。必须用 bcrypt/scrypt/argon2 等专用密码哈希算法。

### 15.6 Token 存 localStorage 不做 XSS 防护

localStorage 可被 XSS 读取。如果存 localStorage，必须做好 XSS 防护。

## 十六、总结

认证与授权是安全的基石：
1. 认证解决"你是谁"，授权解决"你能做什么"。
2. Session/Cookie 适合传统 Web，JWT 适合 API 和移动端。
3. JWT 无状态，但无法主动注销，需要配合黑名单或短期+刷新方案。
4. OAuth 2.0 是第三方授权的标准，授权码模式最安全。
5. RBAC 是主流权限模型，ABAC 提供更细粒度控制。
6. SSO 提升体验，CAS/OAuth/OIDC 是主流实现。
7. 安全要点：HTTPS、密码加盐哈希、防 CSRF/XSS、最小权限原则。

安全是一个系统工程，没有银弹。每个环节都要做好，一个环节的疏漏可能导致整个系统被攻破。`,
    code: `// JWT 完整流程 + Refresh Token + RBAC 权限检查
// 用 crypto 实现 Base64URL + HMAC-SHA256，不依赖外部库

const crypto = require('crypto');

// ============ Base64URL 编解码 ============
function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
}
function base64UrlDecode(input) {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

// ============ JWT 实现 ============
function sign(payload, secret, options = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + (options.expiresIn || 3600), // 默认 1 小时
  };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const data = \`\${headerEncoded}.\${payloadEncoded}\`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest();
  const sigEncoded = base64UrlEncode(signature);
  return \`\${data}.\${sigEncoded}\`;
}

function verify(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token 格式错误');
  const [headerEncoded, payloadEncoded, sigEncoded] = parts;
  // 拒绝 alg=none
  const header = JSON.parse(base64UrlDecode(headerEncoded).toString());
  if (header.alg === 'none' || !header.alg) throw new Error('不安全的算法');
  // 验证签名（防篡改）
  const data = \`\${headerEncoded}.\${payloadEncoded}\`;
  const expectedSig = base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest());
  if (sigEncoded !== expectedSig) throw new Error('签名校验失败');
  // 解析 payload
  const payload = JSON.parse(base64UrlDecode(payloadEncoded).toString());
  // 检查过期
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('Token 已过期');
  return payload;
}

// ============ Refresh Token 存储（模拟 Redis） ============
const refreshStore = new Map(); // token -> { userId, exp }
function saveRefreshToken(userId, token, ttl) {
  refreshStore.set(token, { userId, exp: Date.now() + ttl * 1000 });
}
function validateRefreshToken(token) {
  const rec = refreshStore.get(token);
  if (!rec) return null;
  if (Date.now() > rec.exp) { refreshStore.delete(token); return null; }
  return rec.userId;
}
function revokeRefreshToken(token) { refreshStore.delete(token); }

// ============ RBAC 权限系统 ============
const users = {
  1: { id: 1, username: 'admin', passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'), roles: ['admin'] },
  2: { id: 2, username: 'editor', passwordHash: crypto.createHash('sha256').update('editor123').digest('hex'), roles: ['editor'] },
  3: { id: 3, username: 'user', passwordHash: crypto.createHash('sha256').update('user123').digest('hex'), roles: ['user'] },
};
// 角色 -> 权限映射
const rolePermissions = {
  admin: ['user:read', 'user:write', 'user:delete', 'article:read', 'article:write', 'article:delete'],
  editor: ['user:read', 'article:read', 'article:write'],
  user: ['article:read'],
};
function getUserPermissions(userId) {
  const user = users[userId];
  if (!user) return [];
  const perms = new Set();
  user.roles.forEach(r => (rolePermissions[r] || []).forEach(p => perms.add(p)));
  return [...perms];
}
function checkPermission(userId, permission) {
  return getUserPermissions(userId).includes(permission);
}

const SECRET = 'my-secret-key-2024';
function login(username, password) {
  const user = Object.values(users).find(u => u.username === username);
  if (!user) return { error: '用户不存在' };
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== user.passwordHash) return { error: '密码错误' };
  const accessToken = sign({ sub: user.id, username: user.username, roles: user.roles }, SECRET, { expiresIn: 2 });
  const refreshToken = crypto.randomUUID();
  saveRefreshToken(user.id, refreshToken, 7 * 24 * 3600);
  return { accessToken, refreshToken, user: { id: user.id, username: user.username, roles: user.roles } };
}
function authenticate(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try { return verify(authHeader.slice(7), SECRET); } catch { return null; }
}

console.log('========== 认证授权演示 ==========');
// 1. 登录
console.log('\\n--- 1. 管理员登录 ---');
const loginResult = login('admin', 'admin123');
console.log('登录结果:', JSON.stringify(loginResult.user));
console.log('Access Token:', loginResult.accessToken.slice(0, 40) + '...');
// 2. 验证 Token
console.log('\\n--- 2. 验证 Token ---');
const payload = verify(loginResult.accessToken, SECRET);
console.log('Payload:', JSON.stringify(payload));
// 3. 篡改检测
console.log('\\n--- 3. 篡改检测 ---');
const tampered = loginResult.accessToken.slice(0, -5) + 'XXXXX';
try { verify(tampered, SECRET); } catch (e) { console.log('篡改检测:', e.message); }
// 4. 过期检测
console.log('\\n--- 4. 过期检测 ---');
const expiredToken = sign({ sub: 1 }, SECRET, { expiresIn: -10 });
try { verify(expiredToken, SECRET); } catch (e) { console.log('过期检测:', e.message); }
// 5. RBAC 权限检查
console.log('\\n--- 5. RBAC 权限检查 ---');
['admin', 'editor', 'user'].forEach(u => {
  const uid = Object.values(users).find(x => x.username === u).id;
  console.log(\`\${u} 权限: \${getUserPermissions(uid).join(', ')}\`);
});
// 6. 鉴权场景
console.log('\\n--- 6. 鉴权场景 ---');
const authHeader = 'Bearer ' + loginResult.accessToken;
const authPayload = authenticate(authHeader);
if (authPayload) {
  console.log(\`认证通过，用户: \${authPayload.username}\`);
  console.log(\`user:delete 权限: \${checkPermission(authPayload.sub, 'user:delete')}\`);
  console.log(\`article:write 权限: \${checkPermission(authPayload.sub, 'article:write')}\`);
}
// 7. 普通用户无权限
console.log('\\n--- 7. 普通用户权限受限 ---');
const userLogin = login('user', 'user123');
const userAuth = authenticate('Bearer ' + userLogin.accessToken);
console.log(\`普通用户 article:write 权限: \${checkPermission(userAuth.sub, 'article:write')}\`);
// 8. Refresh Token
console.log('\\n--- 8. Refresh Token 刷新 ---');
const newAccess = sign({ sub: 1, username: 'admin', roles: ['admin'] }, SECRET, { expiresIn: 2 });
console.log('新 Access Token 生成成功');
console.log('Refresh Token 验证:', validateRefreshToken(loginResult.refreshToken) ? '有效' : '无效');
revokeRefreshToken(loginResult.refreshToken);
console.log('注销后 Refresh Token 验证:', validateRefreshToken(loginResult.refreshToken) ? '有效' : '无效');
// 9. 错误密码
console.log('\\n--- 9. 错误密码 ---');
console.log('错误登录:', login('admin', 'wrong'));
// 10. 无 Token
console.log('\\n--- 10. 无 Token 请求 ---');
console.log('无 Token 认证:', authenticate(null));
console.log('\\n========== 演示结束 ==========');`,
  },
  {
    id: "backend-gateway",
    group: "API 设计与架构",
    icon: "🚪",
    title: "API 网关",
    content: `# API 网关

## 一、什么是 API 网关

API 网关（API Gateway）是微服务架构中的一个关键组件，它作为所有客户端请求的统一入口，将请求路由到后端的各个微服务，并在这一过程中提供一系列横切关注点的处理能力，如认证、限流、熔断、日志、协议转换等。

可以把 API 网关理解为微服务架构的"前台"或"门卫"。客户端不需要直接与每个微服务打交道，只需要与网关通信，由网关负责将请求分发到正确的服务，并将响应返回给客户端。

### 1.1 API 网关的定义

API 网关是一个服务器，是系统的唯一入口。从面向对象设计的角度看，它与外观模式（Facade Pattern）类似。API 网关封装了内部系统的架构，并对外提供统一的 API。

API 网关的核心职责：
1. **请求路由**：根据请求的 URL、方法、头部等，将请求转发到对应的后端服务。
2. **认证授权**：统一处理身份认证和权限校验，后端服务无需重复实现。
3. **限流熔断**：保护后端服务免受过载冲击，实现流量控制。
4. **协议转换**：将外部 HTTP/REST 请求转换为内部 gRPC/Thrift 调用。
5. **请求聚合**：将多个后端服务的响应聚合成一个响应返回给客户端。
6. **日志监控**：统一记录请求日志、收集监控指标。
7. **响应转换**：对响应数据进行过滤、转换、加密。

### 1.2 API 网关的演进

API 网关的演进与微服务架构的发展密切相关：

**第一阶段：单体架构**
在单体架构中，所有功能在一个应用内，没有网关的概念。客户端直接访问应用服务器，应用内部处理所有逻辑。

**第二阶段：早期微服务**
微服务化后，客户端需要直接调用多个服务，面临复杂的问题：客户端需要知道每个服务的地址、跨域问题、认证重复实现等。这时出现了简单的反向代理（如 Nginx）做请求分发。

**第三阶段：API 网关**
随着微服务数量增加，简单的反向代理不够用了。需要更强大的功能：动态路由、认证、限流、监控等。专门的 API 网关产品出现，如 Kong、APISIX、Spring Cloud Gateway。

**第四阶段：服务网格**
服务网格（Service Mesh）将通信治理能力下沉到 Sidecar，API 网关与服务网格融合，形成统一的流量治理体系。

### 1.3 为什么需要 API 网关

在微服务架构中，如果没有 API 网关，客户端直接调用各个微服务，会面临一系列问题：

1. **客户端复杂度高**：客户端需要知道每个服务的地址、调用方式，服务变更时客户端也要改。
2. **跨域问题**：不同服务的域名不同，浏览器跨域请求复杂。
3. **认证重复**：每个服务都要实现认证逻辑，代码重复。
4. **安全暴露**：内部服务直接暴露给外部，安全风险大。
5. **无法统一治理**：限流、熔断、监控需要每个服务各自实现。

API 网关通过统一入口解决这些问题：
- 客户端只与网关通信，降低客户端复杂度。
- 网关统一处理跨域、认证、限流等横切关注点。
- 内部服务不直接暴露，由网关做安全屏障。
- 统一的治理能力，便于运维管理。

## 二、API 网关的核心职责

### 2.1 统一路由

路由是 API 网关最基础的功能。网关根据请求的 URL 路径、HTTP 方法、头部等条件，将请求转发到对应的后端服务。

路由可以是静态的（配置文件定义）或动态的（服务注册中心动态发现）。现代网关通常支持动态路由，与服务注册发现集成，自动感知服务实例的变化。

路由规则示例：
- /api/users/* -> user-service
- /api/orders/* -> order-service
- /api/products/* -> product-service
- /api/users/*/orders -> order-service（跨服务路由）

路由还可以基于更多条件：
- 请求头：X-Mobile: true -> mobile-api-service（灰度发布）
- 查询参数：?version=v2 -> new-version-service（AB 测试）
- 请求体：根据请求内容路由（较少用）

### 2.2 认证授权

API 网关可以统一处理认证授权，后端服务无需重复实现：

1. 网关验证请求中的 Token（JWT、Session）。
2. 验证通过，将用户信息（userId、roles）通过请求头传递给后端服务。
3. 验证失败，直接返回 401/403，不转发到后端。

这样后端服务只需信任网关传递的用户信息，无需自己验证 Token，简化了开发。但要注意：内部服务之间应该有额外的安全机制（如 mTLS），防止绕过网关直接访问。

### 2.3 限流

限流是保护后端服务的重要手段。网关层限流可以在请求到达后端之前就拦截，更有效。

限流策略：
1. **全局限流**：限制系统总 QPS，防止整体过载。
2. **接口限流**：限制单个接口的 QPS，防止单接口拖垮系统。
3. **用户限流**：限制单用户的 QPS，防止恶意用户。
4. **IP 限流**：限制单 IP 的 QPS，防止 DDoS。

限流算法：
- **计数器**：简单计数，固定时间窗口内限制请求数。
- **滑动窗口**：更平滑的计数，避免窗口边界突刺。
- **漏桶**：请求像水滴一样漏出，控制处理速率。
- **令牌桶**：以固定速率产生令牌，请求消耗令牌，允许突发。

### 2.4 熔断

熔断器（Circuit Breaker）防止故障扩散。当后端服务故障率过高时，熔断器"跳闸"，直接返回错误，不再调用故障服务，给服务恢复的时间。

熔断器三态：
- **关闭（Closed）**：正常请求。统计失败率。
- **打开（Open）**：失败率超阈值，直接拒绝请求，不调用后端。
- **半开（Half-Open）**：超时后尝试少量请求，成功则关闭熔断器，失败则重新打开。

### 2.5 日志监控

API 网关是所有请求的必经之路，是日志监控的最佳位置：

1. **访问日志**：记录每个请求的方法、URL、状态码、响应时间、客户端 IP。
2. **指标收集**：QPS、延迟分位数、错误率、流量等。
3. **链路追踪**：生成请求 ID，传递到后端服务，串联调用链。
4. **告警**：错误率突增、延迟飙升时告警。

### 2.6 协议转换

外部客户端通常使用 HTTP/REST，而内部微服务可能使用 gRPC、Thrift 等高效协议。API 网关可以做协议转换：

- HTTP/REST -> gRPC：外部 REST 请求转为内部 gRPC 调用。
- HTTP/REST -> WebSocket：REST 请求转为 WebSocket 消息。
- HTTP/1.1 -> HTTP/2：协议升级。

协议转换让内部服务可以用高效的协议，而对外提供通用的 REST API。

### 2.7 请求聚合

客户端（尤其是移动端）可能需要多个服务的数据。如果不聚合，客户端要发多次请求。API 网关可以聚合多个后端服务的响应：

\`\`\`
客户端 -> 网关 -> 用户服务（获取用户信息）
              -> 订单服务（获取订单列表）
              -> 商品服务（获取商品详情）
       <- 聚合后的响应
\`\`\`

请求聚合减少了客户端的请求次数，降低了网络延迟，提升了用户体验。但要注意聚合逻辑不要过于复杂，否则网关成为性能瓶颈。

### 2.8 响应转换

网关可以对后端服务的响应进行转换：
1. **字段过滤**：根据客户端需求只返回部分字段。
2. **格式转换**：XML 转 JSON，时间戳转 ISO 8601。
3. **数据脱敏**：隐藏敏感字段（如手机号中间四位）。
4. **加密签名**：对响应数据签名，防篡改。

## 三、为什么需要 API 网关

### 3.1 客户端复杂度问题

没有网关时，移动端 App 获取首页数据可能需要：
1. 调用用户服务获取用户信息
2. 调用推荐服务获取推荐列表
3. 调用消息服务获取未读消息数
4. 调用配置服务获取功能开关

4 次请求，4 次网络往返，延迟高，耗电多。

有网关后，App 只需调用一次网关接口，网关内部并行调用 4 个服务，聚合成一个响应返回。1 次请求，延迟低，体验好。

### 3.2 统一治理问题

微服务架构中，限流、熔断、认证、日志等横切关注点，如果每个服务各自实现：
1. 代码重复，维护成本高。
2. 策略不一致，难以统一管理。
3. 新增服务要重新实现。

网关统一实现这些能力，新服务只需注册到网关，自动获得限流、认证等能力，无需重复开发。

### 3.3 安全问题

内部服务直接暴露给外部：
1. 攻击面大，每个服务都是攻击目标。
2. 内部服务可能用低效协议，不适合直接对外。
3. 内部服务变更影响外部客户端。

网关作为唯一入口，收敛了攻击面，隐藏了内部架构，保护了内部服务。

### 3.4 服务演进问题

微服务演进时，可能拆分、合并、重命名。如果没有网关，每次变更都影响客户端。

有网关后，内部服务变更只需调整网关路由，对外 API 保持不变，客户端无感知。

## 四、网关模式

### 4.1 集中式网关

所有请求通过一个集中式网关。这是最常见的模式。

架构：
\`\`\`
客户端 -> API 网关 -> 微服务1, 微服务2, 微服务3...
\`\`\`

优点：
1. 简单直观。
2. 统一治理。
3. 适合大多数场景。

缺点：
1. 单点风险（需要高可用部署）。
2. 可能成为性能瓶颈。
3. 网关故障影响全局。

### 4.2 微服务网关（Sidecar 模式）

每个微服务旁部署一个 Sidecar 代理，服务间通信通过 Sidecar。

架构：
\`\`\`
微服务1 <-> Sidecar1 <-> Sidecar2 <-> 微服务2
\`\`\`

这就是服务网格（Service Mesh）的模式。Istio、Linkerd 是代表。

优点：
1. 去中心化，无单点。
2. 服务间通信也获得治理能力。
3. 语言无关。

缺点：
1. 复杂度高。
2. 资源消耗大（每个服务一个 Sidecar）。
3. 运维复杂。

### 4.3 混合模式

实践中常混合使用：
- 对外用集中式 API 网关（处理外部请求）。
- 内部用服务网格（处理服务间通信）。

这样兼顾了对外统一入口和内部通信治理。

## 五、网关 vs 负载均衡器 vs 反向代理

这三个概念容易混淆，它们有重叠但侧重点不同。

### 5.1 负载均衡器（Load Balancer）

负载均衡器将请求分发到多个服务器，主要目标是提高可用性和吞吐量。

工作在传输层（L4）或应用层（L7）：
- L4 负载均衡：基于 IP、端口分发，如 LVS、HAProxy。
- L7 负载均衡：基于 HTTP 头部、URL 分发，如 Nginx。

负载均衡器关注"分发"，不关心业务逻辑。

### 5.2 反向代理（Reverse Proxy）

反向代理代表客户端向服务器请求，主要目标是隐藏服务器、提供缓存、SSL 终结等。

Nginx 是最常用的反向代理。反向代理关注"代理"，可以做负载均衡，但不一定有业务逻辑。

### 5.3 API 网关

API 网关在反向代理基础上，增加了丰富的业务治理能力：认证、限流、熔断、协议转换、请求聚合等。

API 网关关注"治理"，是反向代理的超集。

### 5.4 对比表

| 能力 | 负载均衡器 | 反向代理 | API 网关 |
|------|-----------|---------|---------|
| 请求分发 | 是 | 是 | 是 |
| SSL 终结 | 部分 | 是 | 是 |
| 缓存 | 否 | 是 | 是 |
| 认证 | 否 | 部分 | 是 |
| 限流 | 否 | 部分 | 是 |
| 熔断 | 否 | 否 | 是 |
| 协议转换 | 否 | 否 | 是 |
| 请求聚合 | 否 | 否 | 是 |
| 动态路由 | 部分 | 部分 | 是 |

简单理解：负载均衡器 < 反向代理 < API 网关。Nginx 既是负载均衡器也是反向代理，通过 Lua 扩展可以具备网关能力。

## 六、网关核心功能实现原理

### 6.1 路由转发

路由转发的核心是路由表和匹配算法：

1. **路由表**：存储路由规则，包括匹配条件和目标服务。
2. **匹配**：请求到达时，按优先级匹配路由规则。
3. **转发**：将请求转发到目标服务实例。

匹配算法：
- 精确匹配：/api/users 精确匹配。
- 前缀匹配：/api/users/* 匹配 /api/users/123。
- 正则匹配：/api/users/\\d+ 匹配数字 ID。
- 变量提取：从 /api/users/:id 提取 id。

转发时需要考虑：
- 负载均衡：多个实例选哪个（轮询、随机、一致性哈希）。
- 连接池：复用连接，避免频繁建连。
- 超时：设置转发超时，防止长时间挂起。
- 重试：失败时重试（注意幂等性）。

### 6.2 请求过滤

请求过滤是中间件机制，请求在路由前后经过一系列过滤器：

\`\`\`
请求 -> 日志过滤器 -> 认证过滤器 -> 限流过滤器 -> 路由转发 -> 响应过滤器 -> 响应
\`\`\`

过滤器分为前置（Pre）和后置（Post）：
- 前置过滤器：在路由前执行，如认证、限流、请求改写。
- 后置过滤器：在路由后执行，如响应转换、日志记录。

过滤器可以链式组合，每个过滤器决定是否继续传递请求。

### 6.3 响应聚合

响应聚合需要并发调用多个后端服务，合并结果：

\`\`\`javascript
async function aggregate(req) {
  const [user, orders, messages] = await Promise.all([
    callUserService(req.userId),
    callOrderService(req.userId),
    callMessageService(req.userId),
  ]);
  return { user, orders, messages };
}
\`\`\`

聚合的挑战：
1. 错误处理：某个服务失败时，是整体失败还是返回部分数据？
2. 超时控制：等待最慢的服务还是设置独立超时？
3. 数据合并：如何处理冲突和依赖关系？

### 6.4 协议转换

协议转换将 HTTP/REST 请求转为内部协议（如 gRPC）：

1. 解析 HTTP 请求：URL 参数、请求体、头部。
2. 构造内部协议请求：如 gRPC 请求消息。
3. 调用内部服务，获取响应。
4. 将内部响应转为 HTTP 响应：如 gRPC 响应转 JSON。

协议转换让内部服务可以用高效的协议，对外提供通用 API。但转换逻辑可能复杂，尤其是流式通信的转换。

## 七、主流网关产品对比

### 7.1 Kong

Kong 是基于 OpenResty（Nginx + Lua）的开源 API 网关，由 Mashape 开发。

特点：
1. 高性能：基于 Nginx，性能卓越。
2. 插件机制：丰富的官方和第三方插件。
3. 数据库支持：PostgreSQL、Cassandra 存储配置。
4. 动态路由：无需重启即可更新路由。
5. 多协议：HTTP、HTTPS、WebSocket、gRPC、TCP。

架构：
- OpenResty 作为核心，处理请求。
- 数据库存储路由、插件配置。
- Admin API 管理配置。
- 插件提供认证、限流等功能。

适用场景：需要丰富插件、高性能、多协议支持的场景。

### 7.2 APISIX

APISIX 是基于 OpenResty 和 etcd 的云原生 API 网关，由 Apache 孵化。

特点：
1. 动态路由：基于 etcd 配置中心，实时生效。
2. 无数据库：用 etcd 存储配置，无数据库依赖。
3. 插件热加载：插件可动态启停，无需重启。
4. 高性能：基于 Nginx，性能优秀。
5. 多协议：HTTP、gRPC、WebSocket、Dubbo、MQTT。

与 Kong 的区别：
- APISIX 用 etcd，Kong 用数据库。
- APISIX 插件热加载，Kong 需要重启。
- APISIX 更云原生，Kong 更成熟。

适用场景：云原生架构、需要动态配置、Kubernetes 环境。

### 7.3 Spring Cloud Gateway

Spring Cloud Gateway 是 Spring 官方的 API 网关，基于 Spring WebFlux。

特点：
1. Java 生态：与 Spring Boot 无缝集成。
2. 响应式：基于 WebFlux，非阻塞，性能好。
3. 过滤器：丰富的过滤器，易于扩展。
4. 服务发现：集成 Eureka、Nacos 等注册中心。
5. 限流：基于 Redis 的令牌桶限流。

适用场景：Java 技术栈、Spring Cloud 微服务。

### 7.4 Zuul

Zuul 是 Netflix 开发的 API 网关，Spring Cloud 早期集成。

特点：
1. 基于 Servlet（Zuul 1）或异步（Zuul 2）。
2. 过滤器机制。
3. 与 Netflix OSS 集成。

现状：Zuul 1 已停止维护，Spring Cloud 推荐 Spring Cloud Gateway。Zuul 2 未被 Spring 集成，使用较少。

### 7.5 Nginx + Lua

Nginx 通过 Lua 脚本扩展，可以实现网关功能。

特点：
1. 极高性能：Nginx 本身就是高性能服务器。
2. 灵活：Lua 脚本实现任意逻辑。
3. 成熟：Nginx 久经考验。

缺点：
1. 开发复杂：Lua 开发门槛高。
2. 功能需自建：没有现成的认证、限流插件。
3. 动态性差：配置变更需 reload。

适用场景：对性能极致要求、有 Lua 开发能力。

### 7.6 对比表

| 网关 | 语言 | 架构 | 插件 | 性能 | 生态 | 动态路由 |
|------|------|------|------|------|------|---------|
| Kong | Lua | OpenResty | 丰富 | 高 | 好 | 是 |
| APISIX | Lua | OpenResty+etcd | 丰富 | 高 | 好 | 是（实时）|
| Spring Cloud Gateway | Java | WebFlux | 中 | 中 | Spring 强 | 是 |
| Zuul | Java | Servlet | 中 | 中 | 弱 | 是 |
| Nginx+Lua | Lua | Nginx | 自建 | 极高 | 一般 | 弱 |

## 八、Kong 架构与插件机制

### 8.1 Kong 架构

Kong 的架构：
- **数据平面**：OpenResty 处理请求，执行插件。
- **控制平面**：Admin API 管理配置，存储到数据库。
- **数据库**：PostgreSQL 或 Cassandra，存储路由、消费者、插件配置。

请求流程：
1. 客户端请求到达 Kong。
2. Kong 查询路由，匹配目标服务。
3. 执行前置插件（认证、限流等）。
4. 转发请求到上游服务。
5. 接收上游响应。
6. 执行后置插件（日志、转换等）。
7. 返回响应给客户端。

### 8.2 Kong 插件

Kong 的强大在于插件机制。常用插件：

**认证类：**
- JWT：JWT Token 认证。
- OAuth2.0：OAuth 2.0 授权。
- Key Auth：API Key 认证。
- Basic Auth：HTTP Basic 认证。

**安全类：**
- CORS：跨域资源共享。
- ACL：访问控制列表。
- IP Restriction：IP 黑白名单。

**流量控制类：**
- Rate Limiting：限流。
- Proxy Cache：代理缓存。
- Request Termination：请求终止。

**可观测性类：**
- Logging：日志记录（File、HTTP、TCP、Kafka）。
- Prometheus：Prometheus 指标。
- Zipkin：分布式追踪。

插件可以全局启用，也可以针对特定路由/消费者启用，灵活组合。

### 8.3 Kong 配置示例

\`\`\`bash
# 添加服务
curl -X POST http://localhost:8001/services \\
  -d "name=user-service" \\
  -d "url=http://user-service:8080"

# 添加路由
curl -X POST http://localhost:8001/services/user-service/routes \\
  -d "paths[]=/api/users"

# 启用 JWT 插件
curl -X POST http://localhost:8001/routes/{route_id}/plugins \\
  -d "name=jwt"

# 启用限流插件
curl -X POST http://localhost:8001/routes/{route_id}/plugins \\
  -d "name=rate-limiting" \\
  -d "config.minute=100"
\`\`\`

## 九、APISIX 动态路由

### 9.1 APISIX 架构

APISIX 的架构：
- **数据平面**：OpenResty 处理请求。
- **控制平面**：APISIX Admin API。
- **配置中心**：etcd 存储配置，监听变更实时推送。

与 Kong 的关键区别：APISIX 用 etcd 而非数据库，配置变更通过 etcd watch 实时推送，无需查询数据库，性能更好。

### 9.2 动态路由

APISIX 支持丰富的路由匹配条件：
- 路径（精确、前缀、正则）
- HTTP 方法
- 请求头
- 查询参数
- 请求体
- 优先级

\`\`\`json
{
  "uri": "/api/users/*",
  "methods": ["GET", "POST"],
  "hosts": ["api.example.com"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "user-service-1:8080": 1,
      "user-service-2:8080": 1
    }
  },
  "plugins": {
    "jwt-auth": {},
    "limit-req": { "rate": 100, "burst": 50 }
  }
}
\`\`\`

### 9.3 灰度发布

APISIX 通过路由条件实现灰度发布：

\`\`\`json
// 新版本路由（只匹配特定用户）
{
  "uri": "/api/users/*",
  "vars": [["http_x_user_id", "==", "test_user"]],
  "upstream": { "nodes": { "user-service-v2:8080": 1 } }
}
\`\`\`

这样只有 test_user 的请求路由到新版本，其他用户仍用旧版本。

## 十、网关与服务注册发现集成

### 10.1 静态路由 vs 动态路由

**静态路由**：路由配置中写死服务实例地址。
- 优点：简单。
- 缺点：实例变更需手动更新配置。

**动态路由**：网关从服务注册中心获取实例列表。
- 优点：自动感知实例变化。
- 缺点：依赖注册中心。

### 10.2 与注册中心集成

网关与服务注册中心（Eureka、Consul、Nacos）集成：
1. 网关启动时连接注册中心。
2. 订阅服务变更通知。
3. 维护服务实例列表的本地缓存。
4. 路由时从本地缓存选择实例。

Spring Cloud Gateway 集成 Eureka：

\`\`\`yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service  # lb:// 表示从注册中心获取
          predicates:
            - Path=/api/users/**
\`\`\`

### 10.3 健康检查

网关定期对服务实例做健康检查：
1. 主动检查：定期调用健康检查接口。
2. 被动检查：根据请求失败率判断。

不健康实例从负载均衡池中剔除，恢复后重新加入。

## 十一、网关高可用

### 11.1 单点风险

网关是所有请求的入口，是单点风险源。网关故障 = 系统故障。

### 11.2 多节点部署

部署多个网关实例，通过负载均衡器分发请求：

\`\`\`
客户端 -> 负载均衡器（如 SLB） -> 网关1, 网关2, 网关3
\`\`\`

网关实例无状态，可以水平扩展。负载均衡器做健康检查，剔除故障实例。

### 11.3 Keepalived + VIP

对于自建部署，用 Keepalived 实现 VIP（虚拟 IP）高可用：

\`\`\`
VIP (192.168.1.100)
  |- 主节点 (Keepalived Master) -> 网关1
  |- 备节点 (Keepalived Backup) -> 网关2
\`\`\`

主节点故障，VIP 自动漂移到备节点，客户端无感知。

### 11.4 云厂商 SLB

云环境下用云厂商的负载均衡服务（如 AWS ALB、阿里云 SLB），自带高可用能力，无需自建 Keepalived。

### 11.5 多可用区部署

在多个可用区部署网关，避免单可用区故障导致网关不可用：

\`\`\`
SLB -> 可用区A（网关1, 网关2）, 可用区B（网关3, 网关4）
\`\`\`

## 十二、网关最佳实践

### 12.1 灰度发布

灰度发布（金丝雀发布）逐步将流量切到新版本，降低发布风险。

实现方式：
1. **基于用户**：指定用户（如内部员工）先体验新版本。
2. **基于比例**：按比例（如 5%、10%、50%、100%）逐步切换。
3. **基于地域**：先在某些地区上线，再全量。

网关通过路由规则实现灰度：
\`\`\`json
// 5% 流量到新版本
{
  "uri": "/api/*",
  "upstream": { "nodes": { "v1:8080": 95, "v2:8080": 5 } }
}
\`\`\`

### 12.2 AB 测试

AB 测试对比不同版本的效果。网关根据用户特征路由到不同版本：

\`\`\`json
// 用户 ID 奇数用 A 版本，偶数用 B 版本
{
  "uri": "/api/recommend",
  "vars": [["http_x_user_id", "regex", "[0-9]*[13579]$"]],
  "upstream": { "nodes": { "recommend-a:8080": 1 } }
}
\`\`\`

### 12.3 协议转换

网关将外部 REST 转为内部 gRPC：

\`\`\`
客户端(HTTP/REST) -> 网关(协议转换) -> 微服务(gRPC)
\`\`\`

Spring Cloud Gateway 配置：

\`\`\`yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-grpc
          uri: grpc://user-service:9090
          predicates:
            - Path=/api/users/**
          filters:
            - GRPCConverter
\`\`\`

### 12.4 请求日志审计

网关记录所有请求的详细日志，用于审计和排查：

\`\`\`json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "abc-123",
  "method": "POST",
  "path": "/api/users",
  "headers": { "Authorization": "Bearer ***" },
  "clientIp": "1.2.3.4",
  "userId": 123,
  "status": 201,
  "duration": 45,
  "upstream": "user-service"
}
\`\`\`

日志可以输出到文件、Kafka、ELK 等，便于检索和分析。

## 十三、多语言对照示例

### 13.1 Node.js 网关（简化）

\`\`\`javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// 认证中间件
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!verifyToken(token)) return res.status(401).json({ error: '未认证' });
  next();
});

// 限流中间件
app.use(rateLimit({ windowMs: 60000, max: 100 }));

// 路由转发
app.use('/api/users', createProxyMiddleware({ target: 'http://user-service:8080', changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://order-service:8080', changeOrigin: true }));

app.listen(8080);
\`\`\`

### 13.2 Java (Spring Cloud Gateway)

\`\`\`java
@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r.path("/api/users/**")
                .filters(f -> f.filter(jwtAuthFilter()).filter(rateLimitFilter()))
                .uri("lb://user-service"))
            .route("order-service", r -> r.path("/api/orders/**")
                .uri("lb://order-service"))
            .build();
    }
}
\`\`\`

### 13.3 Go (自定义网关)

\`\`\`go
func main() {
    proxy := httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "http", Host: "user-service:8080"})
    handler := func(w http.ResponseWriter, r *http.Request) {
        // 认证
        if !verifyToken(r.Header.Get("Authorization")) {
            http.Error(w, "Unauthorized", 401)
            return
        }
        // 限流
        if !rateLimit(r.RemoteAddr) {
            http.Error(w, "Too Many Requests", 429)
            return
        }
        proxy.ServeHTTP(w, r)
    }
    http.HandleFunc("/api/users/", handler)
    http.ListenAndServe(":8080", nil)
}
\`\`\`

### 13.4 Python (网关中间件)

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
import httpx

app = FastAPI()

@app.middleware("http")
async def gateway_middleware(request: Request, call_next):
    # 认证
    token = request.headers.get("Authorization")
    if not verify_token(token):
        raise HTTPException(status_code=401)
    # 限流
    if not rate_limit(request.client.host):
        raise HTTPException(status_code=429)
    return await call_next(request)

@app.api_route("/api/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(path: str, request: Request):
    async with httpx.AsyncClient() as client:
        resp = await client.request(request.method, f"http://user-service:8080/users/{path}")
        return resp.json()
\`\`\`

## 十四、网关常见坑

### 14.1 网关成为单点

网关是唯一入口，故障影响全局。必须做高可用部署（多节点 + 负载均衡），并设置合理的健康检查。

### 14.2 网关成为性能瓶颈

所有请求经过网关，网关性能影响全局。网关应轻量，避免重逻辑。复杂业务逻辑放后端服务。监控网关性能，及时扩容。

### 14.3 业务逻辑下沉

有时为了方便，把业务逻辑写在网关（如复杂的请求聚合、数据转换）。这让网关变得臃肿，难以维护。网关应只做通用治理，业务逻辑放后端。

### 14.4 配置不一致

多节点部署时，配置不一致导致行为不一致。用集中配置中心（etcd、Nacos）管理配置，确保所有节点一致。

### 14.5 超时设置不当

网关超时应短于客户端超时，长于后端处理时间。设置不当会导致：
- 网关超时长于客户端：客户端已超时，网关还在等。
- 网关超时短于后端：正常请求被网关误杀。

### 14.6 忽略网关自身的安全

网关本身也需要安全防护：管理接口加密、Admin API 鉴权、防止直接访问后端绕过网关。

## 十五、生产环境实践

### 15.1 网关部署架构

典型生产部署：
\`\`\`
CDN -> WAF -> SLB -> 网关集群 -> 微服务集群
\`\`\`

每层职责：
- CDN：静态资源缓存、就近访问。
- WAF：Web 应用防火墙，防 SQL 注入、XSS。
- SLB：负载均衡，高可用。
- 网关集群：路由、认证、限流等。

### 15.2 配置管理

1. 配置版本化：配置存 Git，变更走 PR 审核。
2. 灰度发布：新配置先在部分节点生效，验证后全量。
3. 回滚能力：配置出问题能快速回滚。
4. 配置审计：记录配置变更历史。

### 15.3 监控告警

网关监控指标：
1. QPS：请求量。
2. 延迟：P50、P95、P99 响应时间。
3. 错误率：4xx、5xx 比例。
4. 上游健康：后端服务的状态。
5. 资源使用：CPU、内存、连接数。

告警规则：
- 错误率 > 5%
- P99 延迟 > 1s
- 上游不健康实例 > 30%
- 网关 CPU > 80%

### 15.4 容量规划

根据流量规划网关容量：
1. 评估峰值 QPS。
2. 单网关承载能力（压测得出）。
3. 网关实例数 = 峰值 QPS / 单实例 QPS * 冗余系数（1.5-2）。

预留冗余应对突发流量。

## 十六、网关与服务网格的融合

### 16.1 服务网格的入口

服务网格（如 Istio）管理服务间通信，但对外入口仍需要 API 网关。Istio 提供了 Ingress Gateway 作为入口：

\`\`\`
外部请求 -> Istio Ingress Gateway -> 服务网格内部
\`\`\`

Istio Ingress Gateway 本质是 Envoy 代理，具备网关能力，同时与服务网格集成，享受网格的流量治理能力。

### 16.2 网关与网格的分工

- API 网关：对外入口，处理外部请求，认证、限流、协议转换。
- 服务网格：内部通信，服务间调用的负载均衡、熔断、追踪。

两者互补：网关治理南北向流量（外部到内部），网格治理东西向流量（内部到内部）。

### 16.3 统一控制面

新一代网关（如 APISIX）与服务网格融合，统一控制面管理网关和网格的路由规则，减少配置碎片化。

## 十七、API 网关的选型

### 17.1 选型考虑因素

1. **性能**：能否满足 QPS 需求。
2. **功能**：是否有所需的插件/功能。
3. **语言生态**：是否与团队技术栈匹配。
4. **运维成本**：部署、配置、监控的复杂度。
5. **社区活跃度**：问题能否及时解决。
6. **云原生**：是否支持 Kubernetes、容器化。

### 17.2 选型建议

- **通用场景、需要丰富功能**：Kong 或 APISIX。
- **Java 技术栈、Spring Cloud**：Spring Cloud Gateway。
- **云原生、Kubernetes**：APISIX 或 Istio Ingress Gateway。
- **极致性能、有 Lua 能力**：Nginx + Lua。
- **轻量级、简单需求**：Nginx 反向代理。

### 17.3 避免的陷阱

1. 不要为了用网关而用网关。小项目可能不需要网关。
2. 不要让网关承担过多业务逻辑。
3. 不要忽视网关的高可用。
4. 不要忽视网关的监控。

## 十八、总结

API 网关是微服务架构的关键组件：
1. 作为统一入口，解决客户端复杂度、统一治理、安全问题。
2. 核心职责：路由、认证、限流、熔断、日志、协议转换、请求聚合。
3. 主流产品：Kong、APISIX、Spring Cloud Gateway，各有特点。
4. 网关需要高可用部署，避免单点。
5. 网关应轻量，避免业务逻辑下沉。
6. 网关与服务网格互补，分别治理南北向和东西向流量。

API 网关不是银弹，它增加了架构复杂度。在微服务数量较少时，简单的反向代理可能就够。当微服务增多、治理需求增强时，API 网关的价值才会充分体现。`,
    code: `// 简易 API 网关实现
// 包含：路由表、中间件链（日志/鉴权/限流/CORS/请求改写）、请求聚合、协议转换模拟、统一错误处理

const crypto = require('crypto');

// ============ 模拟后端微服务 ============
const backendServices = {
  'user-service': {
    getUser: (id) => ({ id, name: 'Alice', email: 'alice@example.com', age: 28 }),
    listUsers: () => [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
  },
  'order-service': {
    getOrders: (userId) => [
      { id: 101, userId, total: 99.9, status: 'paid' },
      { id: 102, userId, total: 45.0, status: 'pending' },
    ],
    getOrder: (id) => ({ id, total: 99.9, status: 'paid', items: ['book', 'pen'] }),
  },
  'product-service': {
    getProducts: () => [{ id: 1, name: 'Book', price: 30 }, { id: 2, name: 'Pen', price: 5 }],
  },
};

// 模拟调用后端服务
function callBackend(service, method, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const svc = backendServices[service];
      if (!svc) return reject(new Error(\`服务 \${service} 不存在\`));
      if (!svc[method]) return reject(new Error(\`方法 \${service}.\${method} 不存在\`));
      try { resolve(svc[method](...args)); }
      catch (e) { reject(e); }
    }, 10 + Math.random() * 30); // 模拟网络延迟
  });
}

// ============ 网关请求/响应对象 ============
class GatewayRequest {
  constructor(method, path, headers = {}, body = null, query = {}) {
    this.method = method;
    this.path = path;
    this.headers = headers;
    this.body = body;
    this.query = query;
    this.params = {};
    this.userId = null;
    this.requestId = crypto.randomUUID();
    this.startTime = Date.now();
  }
}
class GatewayResponse {
  constructor() { this.statusCode = 200; this.headers = {}; this.body = null; }
  status(c) { this.statusCode = c; return this; }
  json(d) { this.body = d; this.headers['Content-Type'] = 'application/json'; return this; }
}

// ============ API 网关 ============
class APIGateway {
  constructor() {
    this.routes = [];
    this.middlewares = [];
    this.errorHandlers = [];
  }

  // 注册路由
  addRoute(pattern, target, options = {}) {
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, n) => { paramNames.push(n); return '([^/]+)'; });
    this.routes.push({
      pattern: new RegExp('^' + regexStr + '$'),
      paramNames,
      target, // { service, method } 或聚合函数
      options,
    });
  }

  // 添加中间件
  use(middleware) { this.middlewares.push(middleware); }

  // 路由匹配
  match(path) {
    for (const route of this.routes) {
      const m = route.pattern.exec(path);
      if (m) {
        const params = {};
        route.paramNames.forEach((n, i) => { params[n] = m[i + 1]; });
        return { route, params };
      }
    }
    return null;
  }

  // 处理请求
  async handle(req) {
    const res = new GatewayResponse();
    let idx = 0;
    const next = async () => {
      if (idx < this.middlewares.length) {
        const mw = this.middlewares[idx++];
        try { await mw(req, res, next); }
        catch (e) { this.handleError(e, req, res); }
      } else {
        await this.dispatch(req, res);
      }
    };
    await next();
    return res;
  }

  async dispatch(req, res) {
    const match = this.match(req.path);
    if (!match) { return res.status(404).json({ error: { code: 'NOT_FOUND', message: \`路由 \${req.path} 不存在\` } }); }
    Object.assign(req.params, match.params);
    const { route } = match;
    try {
      if (typeof route.target === 'function') {
        // 聚合路由
        const result = await route.target(req);
        res.json({ data: result, _meta: { requestId: req.requestId, duration: Date.now() - req.startTime } });
      } else {
        // 普通路由：协议转换 HTTP -> 服务调用
        const { service, method } = route.target;
        const args = this.extractArgs(req, route.options);
        const result = await callBackend(service, method, ...args);
        res.json({ data: result, _meta: { requestId: req.requestId, duration: Date.now() - req.startTime, service } });
      }
    } catch (e) {
      res.status(500).json({ error: { code: 'UPSTREAM_ERROR', message: e.message, requestId: req.requestId } });
    }
  }

  extractArgs(req, options) {
    const args = [];
    if (options.params) {
      options.params.forEach(p => args.push(req.params[p] !== undefined ? isNaN(req.params[p]) ? req.params[p] : Number(req.params[p]) : undefined));
    }
    return args;
  }

  handleError(err, req, res) {
    if (res.statusCode === 200) res.status(500);
    res.json({ error: { code: 'GATEWAY_ERROR', message: err.message, requestId: req.requestId } });
  }
}

// ============ 中间件 ============
// 1. 日志中间件
const loggingMiddleware = async (req, res, next) => {
  console.log(\`[网关日志] \${req.method} \${req.path} requestId=\${req.requestId}\`);
  await next();
  console.log(\`[网关日志] 响应 \${res.statusCode} 耗时=\${Date.now() - req.startTime}ms\`);
};

// 2. 认证中间件
const authMiddleware = async (req, res, next) => {
  const auth = req.headers['Authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '缺少认证 Token' } });
  }
  // 模拟验证 Token
  const token = auth.slice(7);
  if (token === 'invalid') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Token 无效' } });
  }
  req.userId = token === 'admin-token' ? 1 : 2;
  req.headers['X-User-Id'] = req.userId; // 传递给后端
  await next();
};

// 3. 限流中间件（令牌桶）
const rateLimitMiddleware = (() => {
  const buckets = new Map();
  return async (req, res, next) => {
    const key = req.userId || req.headers['X-Client-IP'] || 'anon';
    if (!buckets.has(key)) buckets.set(key, { tokens: 5, last: Date.now() });
    const bucket = buckets.get(key);
    const now = Date.now();
    const elapsed = (now - bucket.last) / 1000;
    bucket.tokens = Math.min(5, bucket.tokens + elapsed * 1); // 1 token/sec
    bucket.last = now;
    if (bucket.tokens < 1) {
      return res.status(429).json({ error: { code: 'RATE_LIMITED', message: '请求过于频繁' } });
    }
    bucket.tokens -= 1;
    await next();
  };
})();

// 4. CORS 中间件
const corsMiddleware = async (req, res, next) => {
  res.headers['Access-Control-Allow-Origin'] = '*';
  res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  res.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
  if (req.method === 'OPTIONS') { res.status(204); return; }
  await next();
};

// 5. 请求改写中间件（路径前缀重写）
const rewriteMiddleware = async (req, res, next) => {
  req.path = req.path.replace(/^\\/api/, ''); // /api/users -> /users
  await next();
};

// ============ 组装网关 ============
const gateway = new APIGateway();
gateway.use(corsMiddleware);
gateway.use(loggingMiddleware);
gateway.use(authMiddleware);
gateway.use(rateLimitMiddleware);
gateway.use(rewriteMiddleware);

// 路由注册
gateway.addRoute('/users/:id', { service: 'user-service', method: 'getUser' }, { params: ['id'] });
gateway.addRoute('/users', { service: 'user-service', method: 'listUsers' });
gateway.addRoute('/orders', { service: 'order-service', method: 'getOrders' });
gateway.addRoute('/orders/:id', { service: 'order-service', method: 'getOrder' }, { params: ['id'] });
gateway.addRoute('/products', { service: 'product-service', method: 'getProducts' });

// 聚合路由：用户主页（同时获取用户信息、订单、商品）
gateway.addRoute('/homepage/:id', async (req) => {
  console.log(\`  [聚合] 并发获取用户 \${req.params.id} 的主页数据...\`);
  const [user, orders, products] = await Promise.all([
    callBackend('user-service', 'getUser', Number(req.params.id)),
    callBackend('order-service', 'getOrders', Number(req.params.id)),
    callBackend('product-service', 'getProducts'),
  ]);
  return { user, orders, recommendedProducts: products };
});

// 协议转换模拟：REST -> "gRPC"（实际调用 backendServices）
gateway.addRoute('/grpc/users/:id', { service: 'user-service', method: 'getUser' }, { params: ['id'] });

// ============ 模拟请求 ============
async function sendRequest(method, path, headers = {}, body = null, query = {}) {
  const req = new GatewayRequest(method, path, headers, body, query);
  const res = await gateway.handle(req);
  console.log(\`\\n>>> \${method} \${path}\`);
  console.log(\`<<< \${res.statusCode} \${JSON.stringify(res.headers)}\`);
  if (res.body) console.log(JSON.stringify(res.body, null, 2));
  console.log('---');
  return res;
}

async function demo() {
  console.log('========== API 网关演示 ==========');
  const auth = { 'Authorization': 'Bearer admin-token' };
  // 1. 正常请求
  await sendRequest('GET', '/api/users/1', auth);
  // 2. 列表
  await sendRequest('GET', '/api/users', auth);
  // 3. 无认证
  await sendRequest('GET', '/api/users/1');
  // 4. 无效 Token
  await sendRequest('GET', '/api/users/1', { 'Authorization': 'Bearer invalid' });
  // 5. 请求聚合
  await sendRequest('GET', '/api/homepage/1', auth);
  // 6. 协议转换
  await sendRequest('GET', '/api/grpc/users/1', auth);
  // 7. 不存在的路由
  await sendRequest('GET', '/api/nonexistent', auth);
  // 8. CORS 预检
  await sendRequest('OPTIONS', '/api/users');
  console.log('========== 演示结束 ==========');
}
demo();`,
  },
  {
    id: "backend-idempotent",
    group: "API 设计与架构",
    icon: "🔁",
    title: "接口幂等性设计",
    content: `# 接口幂等性设计

## 一、什么是幂等性

幂等性（Idempotency）是分布式系统中的一个重要概念。一个操作是幂等的，意味着执行一次和执行多次，对系统产生的效果是相同的。

数学定义：f(f(x)) = f(x)。即对一个操作重复执行，结果与执行一次相同。

### 1.1 幂等性的直观理解

考虑以下操作：
- "设置用户名为 Alice"：执行一次和执行十次，结果都是用户名被设为 Alice。这是幂等的。
- "账户余额增加 100"：执行一次余额 +100，执行十次余额 +1000。这不是幂等的。
- "删除 ID 为 123 的用户"：执行一次删除用户 123，执行十次用户 123 仍然被删除（后续删除无效）。这是幂等的。

幂等性的核心是"重复执行不产生额外副作用"。

### 1.2 为什么需要幂等性

在分布式系统中，网络通信不可靠，请求可能丢失、超时、重复。为了保证可靠性，系统通常采用重试机制。但如果操作不幂等，重试会导致重复操作，产生错误结果。

需要幂等性的场景：
1. **网络重传**：网络不稳定，请求可能被重复发送。
2. **用户重复点击**：用户 impatient，多次点击提交按钮。
3. **消息队列重试**：消息消费失败后，MQ 会重新投递。
4. **超时重试**：请求超时后，客户端不知道是否成功，重试。
5. **故障恢复**：系统崩溃恢复后，重新执行未完成的操作。

如果没有幂等性，这些场景会导致：
- 支付接口被重复调用，用户被多次扣款。
- 订单创建接口被重复调用，生成多个相同订单。
- 消息被重复消费，数据被重复处理。

### 1.3 幂等性的价值

1. **可靠性**：允许安全重试，提高系统可靠性。
2. **一致性**：避免重复操作导致的数据不一致。
3. **简化客户端**：客户端不需要担心重复请求的后果。
4. **容错性**：网络故障时可以放心重试。

幂等性是分布式系统"Exactly-Once"语义的基础。真正的 Exactly-Once 很难实现，通常通过"At-Least-Once + 幂等"来近似实现：消息至少投递一次，但幂等保证重复投递不会产生副作用。

## 二、HTTP 方法的幂等性

HTTP 规范定义了各方法的幂等性，理解这些是 API 设计的基础。

### 2.1 GET（幂等）

GET 用于获取资源，不修改服务器状态。多次调用 GET 返回相同结果（假设资源未变）。GET 是幂等的。

\`\`\`
GET /users/123  -- 获取用户，不改变状态，幂等
\`\`\`

### 2.2 POST（不幂等）

POST 用于创建资源。每次调用创建一个新资源，多次调用创建多个资源。POST 不幂等。

\`\`\`
POST /users  -- 每次调用创建一个新用户，不幂等
\`\`\`

### 2.3 PUT（幂等）

PUT 用于完整更新资源。用相同的数据多次调用 PUT，结果相同（资源被设为相同状态）。PUT 是幂等的。

\`\`\`
PUT /users/123  -- 用相同数据更新，多次调用结果相同，幂等
\`\`\`

### 2.4 DELETE（幂等）

DELETE 用于删除资源。删除一次后，资源不存在；再次删除，资源仍然不存在（返回 404 或 204）。DELETE 是幂等的。

\`\`\`
DELETE /users/123  -- 删除用户，多次调用结果相同（用户都被删除），幂等
\`\`\`

### 2.5 PATCH（视实现）

PATCH 用于部分更新。如果 PATCH 是"设置字段为 X"，则幂等；如果是"字段值增加 1"，则不幂等。PATCH 的幂等性取决于实现。

### 2.6 幂等性总结表

| 方法 | 幂等 | 安全 | 说明 |
|------|------|------|------|
| GET | 是 | 是 | 获取资源 |
| POST | 否 | 否 | 创建资源 |
| PUT | 是 | 否 | 完整更新 |
| DELETE | 是 | 否 | 删除资源 |
| PATCH | 视实现 | 否 | 部分更新 |
| HEAD | 是 | 是 | 获取头部 |
| OPTIONS | 是 | 是 | 查询支持方法 |

### 2.7 为什么 POST 不幂等是问题

POST 是最常用的写操作方法，但它不幂等。在网络重试场景下，POST 重复调用会产生问题：

\`\`\`
用户点击"提交订单" -> POST /orders -> 网络超时
用户再次点击"提交订单" -> POST /orders -> 成功
结果：创建了两个相同订单
\`\`\`

因此，POST 接口特别需要做幂等性设计。

## 三、需要幂等性的典型场景

### 3.1 支付接口

**问题**：用户支付时，点击"支付"按钮后网络超时。用户不知道是否支付成功，再次点击。如果支付接口不幂等，用户会被扣款两次。

**后果**：用户资金损失，投诉，信任度下降。

**幂等方案**：
1. 前端生成唯一支付请求 ID。
2. 后端用请求 ID 去重，相同 ID 只处理一次。
3. 重复请求返回第一次的结果。

### 3.2 订单创建

**问题**：用户下单时，提交订单后网络超时。客户端重试，创建两个相同订单。

**后果**：库存被多扣，用户困惑，运营需要处理重复订单。

**幂等方案**：
1. 创建订单前，先获取唯一 Token。
2. 提交订单时携带 Token。
3. 后端校验 Token，相同 Token 只创建一个订单。

### 3.3 消息消费

**问题**：消息队列（如 Kafka）保证 At-Least-Once 投递，消息可能被重复消费。如果消费逻辑不幂等，重复消费会导致数据错误。

**后果**：数据重复、状态错误。

**幂等方案**：
1. 消息携带唯一 ID。
2. 消费时记录已处理的消息 ID。
3. 重复消息跳过处理。

### 3.4 状态更新

**问题**：更新订单状态为"已发货"，网络超时后重试。如果状态机不幂等，可能将"已签收"误改为"已发货"。

**后果**：状态回退，业务逻辑错误。

**幂等方案**：
1. 状态机校验：只允许特定状态转换。
2. "已签收"状态不允许回到"已发货"。
3. 重复请求检查状态，已发货则不重复操作。

### 3.5 库存扣减

**问题**：扣减库存接口被重复调用，库存被多扣。

**后果**：库存数据错误，超卖或少卖。

**幂等方案**：
1. 用请求 ID 去重。
2. 或用乐观锁，记录已扣减的请求。

## 四、幂等性实现方案详解

### 4.1 唯一索引法

利用数据库的唯一索引保证幂等性。

**原理**：为业务关键字段建立唯一索引，重复插入时数据库报错，捕获错误返回已存在。

**示例**：订单创建，用 (user_id, business_id) 建唯一索引。

\`\`\`sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  business_id VARCHAR(64),  -- 业务唯一标识
  amount DECIMAL(10,2),
  status VARCHAR(20),
  UNIQUE KEY uk_user_business (user_id, business_id)
);

-- 插入时，重复插入会报唯一索引冲突
INSERT INTO orders (id, user_id, business_id, amount, status)
VALUES (?, ?, ?, ?, 'pending');
-- 冲突时捕获异常，查询已有订单返回
\`\`\`

**优点**：
1. 简单可靠，数据库保证。
2. 不需要额外组件。

**缺点**：
1. 只适用于插入操作，不适用于更新。
2. 唯一索引冲突会影响性能。
3. 需要设计合适的唯一键。

**适用场景**：创建订单、创建用户等插入操作。

### 4.2 Token 机制

客户端先获取 Token，请求时携带 Token，后端校验并消费 Token。

**流程**：
1. 客户端请求 GET /api/token，获取唯一 Token。
2. 客户端提交请求 POST /api/orders，携带 Token。
3. 后端校验 Token：
   - Token 有效且未使用：执行业务，标记 Token 已使用。
   - Token 已使用：返回第一次的结果。
   - Token 无效：拒绝请求。

**Token 存储**：Token 存在 Redis，设置过期时间。

\`\`\`javascript
// 获取 Token
function getToken() {
  const token = uuid();
  redis.setex(\`token:\${token}\`, 600, 'valid'); // 10分钟过期
  return token;
}

// 校验并消费 Token
function consumeToken(token) {
  // 原子操作：删除成功说明 Token 之前存在
  const deleted = redis.del(\`token:\${token}\`);
  if (deleted === 1) return true;  // Token 有效，首次使用
  return false; // Token 无效或已使用
}
\`\`\`

**优点**：
1. 通用，适用于各种操作。
2. 前端控制，灵活。

**缺点**：
1. 需要额外获取 Token 的请求。
2. Token 管理增加复杂度。
3. 需要存储 Token 的组件（Redis）。

**适用场景**：表单提交、支付、订单创建。

### 4.3 乐观锁（版本号）

用版本号控制并发更新，同时实现幂等。

**原理**：更新时检查版本号，版本号匹配才更新，同时递增版本号。重复请求因版本号已变而失败。

\`\`\`sql
-- 更新时带版本号条件
UPDATE orders 
SET status = 'paid', version = version + 1
WHERE id = 123 AND version = 5;

-- 如果返回影响行数 0，说明版本不匹配（已被更新过或版本不对）
\`\`\`

**优点**：
1. 无需额外组件。
2. 同时解决并发和幂等问题。

**缺点**：
1. 需要表有版本号字段。
2. 只适用于更新操作。
3. 需要客户端知道当前版本号。

**适用场景**：状态更新、数据修改。

### 4.4 状态机校验

利用业务状态的有限性，通过状态机校验保证幂等。

**原理**：定义合法的状态转换，更新时检查当前状态是否允许转换。重复请求因状态已变而不允许再次转换。

\`\`\`javascript
// 订单状态机
const transitions = {
  'pending': ['paid', 'cancelled'],
  'paid': ['shipped', 'refunded'],
  'shipped': ['delivered'],
  'delivered': [],
  'cancelled': [],
  'refunded': [],
};

function transition(currentStatus, targetStatus) {
  const allowed = transitions[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(\`不允许从 \${currentStatus} 转换到 \${targetStatus}\`);
  }
  return targetStatus;
}
\`\`\`

**示例**：订单从 pending 付费到 paid。
- 第一次请求：pending -> paid，成功。
- 重复请求：已是 paid，不允许 pending -> paid 转换，幂等返回。

**优点**：
1. 业务语义清晰。
2. 防止非法状态转换。

**缺点**：
1. 只适用于有状态的业务。
2. 状态机设计要准确。

**适用场景**：订单状态流转、审批流程。

### 4.5 防重表（分布式锁）

用防重表或分布式锁保证同一请求只处理一次。

**原理**：处理请求前，先在防重表插入记录（或获取分布式锁）。插入成功（获锁成功）才处理，否则说明已处理过。

\`\`\`sql
-- 防重表
CREATE TABLE idempotent_records (
  request_id VARCHAR(64) PRIMARY KEY,
  status VARCHAR(20),  -- processing, done
  result TEXT,         -- 处理结果（JSON）
  created_at TIMESTAMP
);

-- 处理前插入
INSERT INTO idempotent_records (request_id, status) VALUES (?, 'processing');
-- 冲突说明已处理或正在处理

-- 处理完成后更新
UPDATE idempotent_records SET status = 'done', result = ? WHERE request_id = ?;
\`\`\`

或用 Redis 分布式锁：

\`\`\`javascript
// 用 Redis 实现分布式锁
async function processWithLock(requestId, handler) {
  const lockKey = \`lock:\${requestId}\`;
  // 尝试获取锁
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 30);
  if (!acquired) {
    // 锁已被占用，说明正在处理或已处理
    return getResultFromStore(requestId);
  }
  try {
    const result = await handler();
    saveResult(requestId, result);
    return result;
  } finally {
    await redis.del(lockKey);
  }
}
\`\`\`

**优点**：
1. 通用性强。
2. 可以存储处理结果，重复请求直接返回。

**缺点**：
1. 需要额外存储。
2. 分布式锁有复杂性问题（锁超时、死锁）。

**适用场景**：各种需要幂等的操作，特别是耗时操作。

### 4.6 请求指纹

用业务字段生成请求指纹（哈希），用指纹去重。

**原理**：将请求的关键业务字段拼接，计算哈希作为指纹。相同指纹的请求视为重复。

\`\`\`javascript
function generateFingerprint(request) {
  const data = \`\${request.userId}:\${request.productId}:\${request.amount}\`;
  return crypto.createHash('md5').update(data).digest('hex');
}

// 处理时检查指纹
async function processRequest(request) {
  const fingerprint = generateFingerprint(request);
  const existing = await redis.get(\`fp:\${fingerprint}\`);
  if (existing) return JSON.parse(existing); // 返回已有结果
  
  const result = await doBusiness(request);
  await redis.setex(\`fp:\${fingerprint}\`, 3600, JSON.stringify(result));
  return result;
}
\`\`\`

**优点**：
1. 客户端无需额外操作。
2. 基于业务语义去重。

**缺点**：
1. 指纹设计要准确，否则误判。
2. 相同业务的不同合法请求可能被误去重。
3. 时间窗口内有效，超时后可能重复。

**适用场景**：支付、转账等有明确业务标识的操作。

## 五、各方案对比与适用场景

### 5.1 方案对比表

| 方案 | 复杂度 | 适用操作 | 额外组件 | 可靠性 | 典型场景 |
|------|--------|---------|---------|--------|---------|
| 唯一索引 | 低 | 插入 | 无 | 高 | 创建订单 |
| Token | 中 | 所有 | Redis | 高 | 表单提交 |
| 乐观锁 | 低 | 更新 | 无 | 中 | 状态更新 |
| 状态机 | 中 | 状态更新 | 无 | 高 | 订单流转 |
| 防重表/锁 | 高 | 所有 | Redis/DB | 高 | 支付 |
| 请求指纹 | 中 | 所有 | Redis | 中 | 转账 |

### 5.2 选择建议

1. **创建操作**：唯一索引 或 Token。
2. **更新操作**：乐观锁 或 状态机。
3. **复杂操作**：防重表 + 分布式锁。
4. **支付/转账**：请求指纹 + 防重表。
5. **简单场景**：优先用数据库原生能力（唯一索引、乐观锁）。

### 5.3 组合使用

实际中常组合多种方案：
- 创建订单：Token + 唯一索引。
- 支付：请求指纹 + 防重表 + 状态机。
- 消息消费：消息 ID 去重 + 状态机。

## 六、幂等性的副作用

### 6.1 性能开销

幂等性检查通常需要额外存储查询：
- Token 校验：查 Redis。
- 防重表：查数据库。
- 唯一索引：索引维护开销。

这些开销在高并发下不可忽视。优化：
- 用 Redis 等内存存储，减少延迟。
- 异步清理过期记录。
- 合理设置过期时间。

### 6.2 复杂度增加

幂等性引入额外逻辑：
- Token 管理。
- 防重记录维护。
- 结果缓存和返回。

增加了代码复杂度和维护成本。需要权衡：不是所有接口都需要幂等，只在关键接口实现。

### 6.3 数据一致性

幂等性处理涉及多步操作，可能有一致性问题：
- Token 消费成功，但业务处理失败：Token 已消费，业务未完成。
- 防重记录插入成功，但业务处理失败：记录存在，业务未完成。

需要事务或补偿机制保证一致性。常见做法：
- 业务失败时回滚幂等记录（但可能与并发冲突）。
- 或记录失败状态，允许重试（用新 Token）。

### 6.4 过期与清理

幂等记录不能永久存储，需要过期清理：
- Redis 设置 TTL，自动过期。
- 数据库定期清理过期记录。

过期时间设置要合理：
- 太短：重试可能发生在过期后，失效。
- 太长：占用存储。

通常设置为业务超时的 2-3 倍。

## 七、幂等性设计原则

### 7.1 前端 + 后端双层防护

幂等性不应只靠前端或后端，应双层防护：

**前端**：
1. 按钮防抖：点击后禁用按钮，防止重复点击。
2. Loading 状态：提交时显示 Loading，避免用户误以为没提交。
3. 请求取消：新请求发出时取消上一个未完成的请求。

**后端**：
1. 幂等 Token：即使前端失效，后端仍能去重。
2. 唯一约束：数据库层兜底。

前端防抖提升体验，后端幂等保证安全。不能只靠前端，因为前端可以被绕过（直接调 API）。

### 7.2 幂等键的设计

幂等键是标识请求唯一性的关键。好的幂等键：
1. **全局唯一**：不同请求不会生成相同键。
2. **确定生成**：相同请求（业务语义相同）生成相同键。
3. **客户端生成**：避免服务端生成的不一致。

幂等键的来源：
- 客户端生成的 UUID：每次操作一个 UUID，适合 Token 机制。
- 业务字段组合：如 userId + orderId + action，适合指纹机制。
- 请求 ID：HTTP 请求头 X-Request-Id。

### 7.3 幂等结果的返回

重复请求应该返回什么？两种做法：
1. **返回第一次的结果**：客户端能获得完整数据，体验好。但需要存储结果，占空间。
2. **返回幂等提示**：告诉客户端"已处理"，不返回数据。简单，但客户端可能需要再次查询。

通常支付、订单等关键操作返回第一次的结果，普通操作返回幂等提示。

### 7.4 幂等的时间窗口

幂等不是永久的，有时间窗口：
- 短期幂等：防止几秒到几分钟内的重复请求。
- 长期幂等：防止几小时到几天的重复。

短期幂等用 Redis（TTL）。长期幂等用数据库（持久化）。

### 7.5 幂等与并发

幂等性还要考虑并发：
- 两个相同请求同时到达，如何保证只处理一次？
- 分布式锁：第一个请求获锁处理，第二个等待或直接返回。
- 数据库唯一索引：第一个插入成功，第二个冲突。

并发控制是幂等性的难点，需要原子操作保证。

## 八、支付场景完整幂等方案

### 8.1 场景描述

用户支付订单：
1. 用户点击"支付"。
2. 前端调用支付接口。
3. 网络超时，用户再次点击。
4. 必须保证只扣款一次。

### 8.2 方案设计

**前端**：
1. 支付按钮点击后立即禁用，显示 Loading。
2. 生成唯一支付请求 ID（paymentRequestId）。
3. 重试时使用相同的 paymentRequestId。

**后端**：
1. 接收支付请求，带 paymentRequestId。
2. 用防重表检查 paymentRequestId：
   - 已存在且完成：返回已有结果。
   - 已存在且处理中：返回"处理中"。
   - 不存在：插入记录，开始处理。
3. 处理支付：调用支付渠道。
4. 更新记录状态和结果。
5. 返回结果。

**数据库设计**：

\`\`\`sql
CREATE TABLE payment_requests (
  payment_request_id VARCHAR(64) PRIMARY KEY,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'processing',  -- processing, success, failed
  result TEXT,  -- 支付结果 JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

**处理流程**：

\`\`\`javascript
async function pay(paymentRequestId, orderId, userId, amount) {
  // 1. 插入防重记录（原子操作）
  try {
    await db.insert('payment_requests', {
      payment_request_id: paymentRequestId,
      order_id: orderId, user_id: userId, amount,
      status: 'processing',
    });
  } catch (e) {
    if (e.code === 'DUPLICATE_KEY') {
      // 已有记录，查询状态
      const record = await db.find('payment_requests', { payment_request_id: paymentRequestId });
      if (record.status === 'success') return JSON.parse(record.result);
      if (record.status === 'processing') return { code: 'PROCESSING', message: '支付处理中' };
      if (record.status === 'failed') throw new Error('上次支付失败，请重试');
    }
    throw e;
  }
  
  // 2. 调用支付渠道
  try {
    const result = await paymentGateway.charge(orderId, amount);
    // 3. 更新记录为成功
    await db.update('payment_requests', 
      { status: 'success', result: JSON.stringify(result) },
      { payment_request_id: paymentRequestId }
    );
    return result;
  } catch (e) {
    // 4. 更新记录为失败
    await db.update('payment_requests',
      { status: 'failed', result: JSON.stringify({ error: e.message }) },
      { payment_request_id: paymentRequestId }
    );
    throw e;
  }
}
\`\`\`

### 8.3 异常处理

1. **插入成功但支付渠道调用前崩溃**：记录状态为 processing，重启后需要扫描 processing 记录，查询支付渠道确认状态。
2. **支付成功但更新记录前崩溃**：支付已成功，记录还是 processing。重启后查询支付渠道，发现成功，更新记录。
3. **支付渠道返回不确定（超时）**：记录 processing，定时任务查询支付渠道确认。

关键：processing 状态的记录需要定时任务兜底，查询支付渠道确认最终状态。

## 九、订单场景完整幂等方案

### 9.1 场景描述

用户下单：
1. 用户选择商品，点击"提交订单"。
2. 前端调用创建订单接口。
3. 网络超时，重试。
4. 必须只创建一个订单。

### 9.2 方案设计

采用 Token + 唯一索引：

**前端**：
1. 进入下单页，请求 GET /api/order/token 获取 Token。
2. 提交订单时携带 Token。

**后端**：
1. 生成 Token，存 Redis（5 分钟过期）。
2. 创建订单时校验 Token：
   - Token 有效：消费 Token，创建订单。
   - Token 无效/已用：拒绝或返回已有订单。
3. 订单表用 (user_id, token) 建唯一索引，兜底防重。

\`\`\`javascript
// 获取 Token
app.get('/api/order/token', auth, async (req, res) => {
  const token = uuid();
  await redis.setex(\`order:token:\${req.userId}:\${token}\`, 300, 'valid');
  res.json({ token });
});

// 创建订单
app.post('/api/orders', auth, async (req, res) => {
  const { token, items, address } = req.body;
  // 校验 Token
  const tokenKey = \`order:token:\${req.userId}:\${token}\`;
  const valid = await redis.del(tokenKey); // 原子消费
  if (valid !== 1) {
    // Token 无效，可能重复请求，查询是否已有订单
    const existing = await db.query('SELECT * FROM orders WHERE user_id=? AND token=?', [req.userId, token]);
    if (existing) return res.json(existing);
    return res.status(400).json({ error: 'Token 无效' });
  }
  // 创建订单
  try {
    const order = await createOrder(req.userId, items, address, token);
    res.status(201).json(order);
  } catch (e) {
    // 唯一索引冲突说明订单已存在
    if (e.code === 'DUPLICATE_KEY') {
      const existing = await db.query('SELECT * FROM orders WHERE user_id=? AND token=?', [req.userId, token]);
      return res.json(existing);
    }
    throw e;
  }
});
\`\`\`

## 十、消息消费幂等方案

### 10.1 场景描述

Kafka 消费者处理订单消息，更新库存。消息可能重复投递，必须保证库存不被重复扣减。

### 10.2 方案设计

用消息 ID 去重 + 状态机：

\`\`\`javascript
async function consumeMessage(message) {
  const messageId = message.id;
  // 1. 检查是否已处理
  const processed = await redis.get(\`msg:processed:\${messageId}\`);
  if (processed) {
    console.log('消息已处理，跳过');
    return;
  }
  // 2. 检查订单状态（状态机校验）
  const order = await db.find('orders', { id: message.orderId });
  if (order.stock_deducted) {
    // 已扣减库存，标记消息已处理
    await redis.setex(\`msg:processed:\${messageId}\`, 86400, '1');
    return;
  }
  // 3. 扣减库存（乐观锁）
  const updated = await db.update('orders',
    { stock_deducted: true, version: order.version + 1 },
    { id: message.orderId, version: order.version }
  );
  if (updated === 0) {
    // 版本不匹配，说明并发更新，跳过（其他消费者已处理）
    return;
  }
  // 4. 标记消息已处理
  await redis.setex(\`msg:processed:\${messageId}\`, 86400, '1');
}
\`\`\`

## 十一、多语言对照示例

### 11.1 Token 机制（Node.js）

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

async function getToken(userId) {
  const token = crypto.randomUUID();
  await client.set(\`token:\${userId}:\${token}\`, 'valid', { EX: 300 });
  return token;
}

async function createOrder(userId, token, orderData) {
  const consumed = await client.del(\`token:\${userId}:\${token}\`);
  if (!consumed) throw new Error('Token 无效或已使用');
  return await db.insert('orders', { ...orderData, user_id: userId, token });
}
\`\`\`

### 11.2 Token 机制（Java）

\`\`\`java
@RestController
public class OrderController {
    @Autowired
    private StringRedisTemplate redis;
    
    @GetMapping("/api/order/token")
    public String getToken(@AuthenticationPrincipal User user) {
        String token = UUID.randomUUID().toString();
        redis.opsForValue().set("token:" + user.getId() + ":" + token, "valid", 5, TimeUnit.MINUTES);
        return token;
    }
    
    @PostMapping("/api/orders")
    public Order createOrder(@AuthenticationPrincipal User user, @RequestBody OrderDTO dto) {
        String key = "token:" + user.getId() + ":" + dto.getToken();
        Boolean consumed = redis.delete(key);
        if (!Boolean.TRUE.equals(consumed)) {
            throw new BadRequestException("Token 无效");
        }
        return orderService.create(user.getId(), dto);
    }
}
\`\`\`

### 11.3 Token 机制（Go）

\`\`\`go
func getToken(userID int64) (string, error) {
    token := uuid.New().String()
    key := fmt.Sprintf("token:%d:%s", userID, token)
    err := redis.Set(ctx, key, "valid", 5*time.Minute).Err()
    return token, err
}

func createOrder(userID int64, token string, dto OrderDTO) (*Order, error) {
    key := fmt.Sprintf("token:%d:%s", userID, token)
    deleted, err := redis.Del(ctx, key).Result()
    if err != nil || deleted == 0 {
        return nil, errors.New("token 无效")
    }
    return orderService.Create(userID, dto)
}
\`\`\`

### 11.4 乐观锁（Python）

\`\`\`python
def update_order_status(order_id, target_status, expected_version):
    result = db.execute(
        "UPDATE orders SET status = %s, version = version + 1 "
        "WHERE id = %s AND version = %s",
        (target_status, order_id, expected_version)
    )
    if result.rowcount == 0:
        raise IdempotentError("版本不匹配，可能已更新")
\`\`\`

## 十二、常见坑

### 12.1 幂等键选择不当

用时间戳作为幂等键，每次请求时间不同，无法去重。应该用业务 ID 或客户端生成的 UUID。

### 12.2 幂等检查与业务操作非原子

\`\`\`javascript
// 错误：检查和操作分离
const exists = await checkExists(requestId);
if (exists) return existingResult;
// 并发请求可能在这里插入
await doBusiness();
await saveResult(requestId, result);
\`\`\`

正确：用原子操作（唯一索引、Redis SETNX、分布式锁）。

### 12.3 忽略并发

两个相同请求同时到达，都通过了幂等检查，都执行了业务。必须用锁或原子操作防止并发。

### 12.4 幂等结果未缓存

重复请求时，业务已执行但结果未缓存，只能重新查询或重新执行。应该在幂等记录中存储结果。

### 12.5 过期时间太短

幂等记录过期后，重试请求被视为新请求，重复执行。过期时间应长于业务可能的超时和重试周期。

### 12.6 只做前端防抖

前端防抖只是 UX 优化，可以被绕过。必须后端做幂等兜底。

### 12.7 幂等导致死锁

分布式锁使用不当，处理失败未释放锁，导致后续请求永远等待。需要锁超时和异常释放。

## 十三、生产环境实践

### 13.1 幂等键的传递

通过 HTTP 头部传递幂等键：
\`\`\`
X-Idempotency-Key: abc-123-def
\`\`\`

Stripe 等支付平台使用 Idempotency-Key 头部。后端读取该头部作为幂等键。

### 13.2 幂等记录的存储

1. **Redis**：短期幂等，TTL 自动过期，性能好。
2. **数据库**：长期幂等，持久化，可查询。
3. **混合**：Redis 做短期快速去重，数据库做长期持久化。

### 13.3 监控与告警

监控幂等相关指标：
1. 重复请求率：被幂等拦截的请求比例。
2. 幂等检查失败：可能并发问题或存储故障。
3. processing 状态积压：可能处理失败未更新。

### 13.4 定时任务兜底

对于 processing 状态的记录，定时任务查询最终状态：

\`\`\`javascript
// 每分钟扫描超时的 processing 记录
async function reconcilePayments() {
  const records = await db.query(
    'SELECT * FROM payment_requests WHERE status = ? AND updated_at < ?',
    ['processing', minutesAgo(5)]
  );
  for (const record of records) {
    const status = await paymentGateway.queryStatus(record.order_id);
    await db.update('payment_requests',
      { status: status.state, result: JSON.stringify(status) },
      { payment_request_id: record.payment_request_id }
    );
  }
}
\`\`\`

## 十四、幂等性测试

### 14.1 测试要点

1. **重复请求**：相同请求发送多次，验证只处理一次。
2. **并发请求**：相同请求并发发送，验证只处理一次。
3. **超时重试**：模拟超时后重试，验证幂等。
4. **崩溃恢复**：处理中崩溃，恢复后重试，验证幂等。
5. **过期后重试**：幂等记录过期后重试，验证行为。

### 14.2 测试示例

\`\`\`javascript
describe('支付接口幂等性', () => {
  it('相同 paymentRequestId 只扣款一次', async () => {
    const requestId = 'test-123';
    const result1 = await pay(requestId, orderId, 100);
    const result2 = await pay(requestId, orderId, 100);
    expect(result1).toEqual(result2);
    expect(paymentGateway.chargeCalls).toBe(1);
  });
  
  it('并发请求只处理一次', async () => {
    const requestId = 'test-456';
    const [r1, r2] = await Promise.all([
      pay(requestId, orderId, 100),
      pay(requestId, orderId, 100),
    ]);
    expect(paymentGateway.chargeCalls).toBe(1);
  });
});
\`\`\`

## 十五、幂等性与分布式事务

幂等性是分布式事务的基础。Saga、TCC 等分布式事务模式都依赖幂等性：

### 15.1 Saga 模式

Saga 将长事务拆分为一系列短事务，每个短事务有补偿操作。补偿操作必须幂等，因为可能被重试。

\`\`\`
T1 (扣款) -> T2 (扣库存) -> T3 (创建发货单)
补偿：C3 -> C2 -> C1
\`\`\`

如果 T2 失败，执行 C1（退款）。C1 必须幂等，因为可能被重试。

### 15.2 TCC 模式

TCC（Try-Confirm-Cancel）的 Confirm 和 Cancel 操作必须幂等：
- Confirm：确认执行，可能被重复调用。
- Cancel：取消执行，可能被重复调用。

\`\`\`javascript
// Try：预留资源
async function tryPayment(orderId, amount) { ... }
// Confirm：确认扣款（幂等）
async function confirmPayment(orderId) {
  const record = await findRecord(orderId);
  if (record.confirmed) return; // 已确认，幂等返回
  await doConfirm(orderId);
  await markConfirmed(orderId);
}
// Cancel：取消扣款（幂等）
async function cancelPayment(orderId) {
  const record = await findRecord(orderId);
  if (record.cancelled) return; // 已取消，幂等返回
  await doCancel(orderId);
  await markCancelled(orderId);
}
\`\`\`

## 十六、总结

幂等性是分布式系统可靠性的基石：
1. 幂等性保证重复执行不产生额外副作用，是安全重试的基础。
2. HTTP 方法中 GET/PUT/DELETE 幂等，POST 不幂等，POST 接口需特别设计。
3. 实现方案：唯一索引、Token、乐观锁、状态机、防重表、请求指纹，各有适用场景。
4. 前端防抖 + 后端幂等双层防护，不能只靠前端。
5. 幂等键设计要全局唯一、确定生成。
6. 注意并发控制、原子操作、结果缓存、过期清理。
7. 幂等性是分布式事务（Saga、TCC）的基础。

幂等性增加了系统复杂度，但对于支付、订单等关键业务是必须的。设计时权衡复杂度与可靠性，选择合适的方案。`,
    code: `// 多种幂等方案实现
// 包含：TokenManager（token 生成+消费+防重）、OptimisticLock（版本号更新）、
//       StateMachine（状态流转校验）、IdempotentStore（请求指纹去重）

const crypto = require('crypto');

// ============ Token 管理器（Token 机制） ============
class TokenManager {
  constructor() {
    this.tokens = new Map(); // token -> { userId, status, result, exp }
  }
  // 生成 Token
  generate(userId, ttl = 300000) {
    const token = crypto.randomUUID();
    this.tokens.set(token, { userId, status: 'valid', result: null, exp: Date.now() + ttl });
    return token;
  }
  // 消费 Token（原子操作模拟）
  consume(token) {
    const record = this.tokens.get(token);
    if (!record) return { ok: false, reason: 'Token 不存在' };
    if (Date.now() > record.exp) { this.tokens.delete(token); return { ok: false, reason: 'Token 已过期' }; }
    if (record.status === 'consumed') return { ok: false, reason: 'Token 已使用', result: record.result };
    record.status = 'consumed';
    return { ok: true, record };
  }
  // 保存结果
  saveResult(token, result) {
    const record = this.tokens.get(token);
    if (record) record.result = result;
  }
  // 获取已有结果
  getResult(token) {
    const record = this.tokens.get(token);
    return record ? record.result : null;
  }
}

// ============ 乐观锁 ============
class OptimisticLock {
  constructor() {
    this.data = new Map(); // id -> { ..., version }
  }
  set(id, value) { this.data.set(id, { ...value, version: 0 }); }
  // 带版本号更新
  update(id, changes, expectedVersion) {
    const record = this.data.get(id);
    if (!record) return { ok: false, reason: '记录不存在' };
    if (record.version !== expectedVersion) {
      return { ok: false, reason: \`版本不匹配（期望 \${expectedVersion}，实际 \${record.version}）\`, currentVersion: record.version };
    }
    Object.assign(record, changes, { version: record.version + 1 });
    return { ok: true, record };
  }
  get(id) { return this.data.get(id); }
}

// ============ 状态机 ============
class StateMachine {
  constructor(transitions) {
    this.transitions = transitions; // { from: [to1, to2] }
  }
  canTransition(from, to) {
    return (this.transitions[from] || []).includes(to);
  }
  transition(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) return { ok: true, reason: '状态相同（幂等）', status: currentStatus };
    if (!this.canTransition(currentStatus, targetStatus)) {
      return { ok: false, reason: \`不允许从 \${currentStatus} 转换到 \${targetStatus}\` };
    }
    return { ok: true, reason: '状态转换成功', status: targetStatus };
  }
}

// ============ 请求指纹去重存储 ============
class IdempotentStore {
  constructor() { this.records = new Map(); } // fingerprint -> { result, exp }
  static fingerprint(data) {
    const str = JSON.stringify(data);
    return crypto.createHash('md5').update(str).digest('hex');
  }
  check(fingerprint) {
    const record = this.records.get(fingerprint);
    if (!record) return { exists: false };
    if (Date.now() > record.exp) { this.records.delete(fingerprint); return { exists: false }; }
    return { exists: true, result: record.result };
  }
  save(fingerprint, result, ttl = 3600000) {
    this.records.set(fingerprint, { result, exp: Date.now() + ttl });
  }
}

// ============ 模拟支付服务 ============
class PaymentService {
  constructor() {
    this.tokenManager = new TokenManager();
    this.idempotentStore = new IdempotentStore();
    this.chargeCallCount = 0;
  }
  // 获取支付 Token
  getPaymentToken(userId) {
    return this.tokenManager.generate(userId);
  }
  // 支付（幂等）
  pay(paymentToken, orderId, userId, amount) {
    console.log(\`  [支付] 收到请求: orderId=\${orderId}, amount=\${amount}\`);
    // 1. Token 校验
    const consumeResult = this.tokenManager.consume(paymentToken);
    if (!consumeResult.ok) {
      if (consumeResult.reason === 'Token 已使用') {
        console.log('  [支付] Token 已使用，返回已有结果');
        return { code: 'OK', message: '已支付（幂等返回）', data: consumeResult.result };
      }
      console.log(\`  [支付] Token 校验失败: \${consumeResult.reason}\`);
      return { code: 'FAIL', message: consumeResult.reason };
    }
    // 2. 执行支付
    this.chargeCallCount++;
    console.log(\`  [支付] 调用支付渠道（第 \${this.chargeCallCount} 次）...\`);
    const result = { paymentId: crypto.randomUUID(), orderId, amount, status: 'success', paidAt: new Date().toISOString() };
    // 3. 保存结果
    this.tokenManager.saveResult(paymentToken, result);
    return { code: 'OK', message: '支付成功', data: result };
  }
}

// ============ 模拟订单服务 ============
class OrderService {
  constructor() {
    this.lock = new OptimisticLock();
    this.stateMachine = new StateMachine({
      'pending': ['paid', 'cancelled'],
      'paid': ['shipped', 'refunded'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'refunded': [],
    });
    this.orders = new Map();
    this.nextId = 1;
  }
  createOrder(userId, product, amount) {
    const id = this.nextId++;
    const order = { id, userId, product, amount, status: 'pending', createdAt: new Date().toISOString() };
    this.orders.set(id, order);
    this.lock.set(id, order);
    return order;
  }
  // 幂等更新状态
  updateStatus(orderId, targetStatus, expectedVersion) {
    console.log(\`  [订单] 更新订单 \${orderId} 状态为 \${targetStatus}\`);
    const order = this.orders.get(orderId);
    if (!order) return { code: 'FAIL', message: '订单不存在' };
    // 1. 状态机校验
    const smResult = this.stateMachine.transition(order.status, targetStatus);
    if (!smResult.ok) {
      console.log(\`  [订单] 状态机校验失败: \${smResult.reason}\`);
      return { code: 'FAIL', message: smResult.reason };
    }
    if (smResult.reason === '状态相同（幂等）') {
      return { code: 'OK', message: '状态已是目标状态（幂等）', data: order };
    }
    // 2. 乐观锁更新
    const lockResult = this.lock.update(orderId, { status: targetStatus }, expectedVersion);
    if (!lockResult.ok) {
      console.log(\`  [订单] 乐观锁更新失败: \${lockResult.reason}\`);
      return { code: 'FAIL', message: lockResult.reason };
    }
    Object.assign(order, lockResult.record);
    return { code: 'OK', message: '状态更新成功', data: order };
  }
  getOrder(id) { return this.orders.get(id); }
}

// ============ 演示 ============
console.log('========== 幂等性方案演示 ==========');

// --- 1. Token 机制：支付幂等 ---
console.log('\\n=== 1. 支付接口幂等（Token 机制）===');
const payment = new PaymentService();
const userId = 1;
const token = payment.getPaymentToken(userId);
console.log(\`获取支付 Token: \${token.slice(0, 8)}...\`);
// 模拟重复提交
const orderId = 1001;
const r1 = payment.pay(token, orderId, userId, 99.9);
console.log('第一次支付:', r1.message);
const r2 = payment.pay(token, orderId, userId, 99.9); // 重复
console.log('第二次支付（重复）:', r2.message);
console.log(\`支付渠道实际调用次数: \${payment.chargeCallCount}（应为 1）\`);

// --- 2. 乐观锁：状态更新幂等 ---
console.log('\\n=== 2. 订单状态更新（乐观锁 + 状态机）===');
const orderSvc = new OrderService();
const order = orderSvc.createOrder(userId, 'Book', 30);
console.log(\`创建订单: id=\${order.id}, status=\${order.status}, version=\${order.lock ? '' : 0}\`);
const version = orderSvc.lock.get(order.id).version;
// 正常更新
const u1 = orderSvc.updateStatus(order.id, 'paid', version);
console.log('更新为 paid:', u1.message, '| 当前状态:', orderSvc.getOrder(order.id).status);
// 重复更新（用旧版本号）
const u2 = orderSvc.updateStatus(order.id, 'paid', version);
console.log('重复更新（旧版本号）:', u2.message);
// 非法状态转换
const u3 = orderSvc.updateStatus(order.id, 'pending', version + 1);
console.log('非法转换 paid->pending:', u3.message);

// --- 3. 请求指纹：转账幂等 ---
console.log('\\n=== 3. 转账接口（请求指纹去重）===');
const transferStore = new IdempotentStore();
function transfer(fromId, toId, amount) {
  const fp = IdempotentStore.fingerprint({ fromId, toId, amount, action: 'transfer' });
  console.log(\`  [转账] \${fromId} -> \${toId}, amount=\${amount}, fp=\${fp.slice(0, 8)}\`);
  const existing = transferStore.check(fp);
  if (existing.exists) {
    console.log('  [转账] 已处理过，返回已有结果');
    return existing.result;
  }
  const result = { transferId: crypto.randomUUID(), fromId, toId, amount, status: 'success' };
  transferStore.save(fp, result);
  return result;
}
const t1 = transfer(1, 2, 100);
console.log('第一次转账:', t1.status);
const t2 = transfer(1, 2, 100); // 相同参数，重复
console.log('第二次转账（相同参数）:', t2.status, '| 是否同一结果:', t1.transferId === t2.transferId);
const t3 = transfer(1, 2, 200); // 不同金额，新请求
console.log('第三次转账（不同金额）:', t3.status, '| 是否新结果:', t1.transferId !== t3.transferId);

// --- 4. 消息消费幂等 ---
console.log('\\n=== 4. 消息消费幂等 ===');
const msgStore = new IdempotentStore();
const messages = [
  { id: 'msg-001', orderId: 1001, action: 'ship' },
  { id: 'msg-001', orderId: 1001, action: 'ship' }, // 重复消息
  { id: 'msg-002', orderId: 1001, action: 'deliver' },
];
let processedCount = 0;
for (const msg of messages) {
  const fp = IdempotentStore.fingerprint({ msgId: msg.id });
  const check = msgStore.check(fp);
  if (check.exists) {
    console.log(\`  [消费] 消息 \${msg.id} 已处理，跳过\`);
    continue;
  }
  console.log(\`  [消费] 处理消息 \${msg.id}: \${msg.action}\`);
  msgStore.save(fp, { processed: true });
  processedCount++;
}
console.log(\`实际处理消息数: \${processedCount}（应为 2，1 条重复被跳过）\`);

console.log('\\n========== 演示结束 ==========');`,
  },
];
