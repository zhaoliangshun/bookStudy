// =============================================================
// Python Web 应用开发实战教程 - 第 1 批章节（Web 基础与 HTTP 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   web-http-basics : HTTP 协议基础
//   web-url-cookie  : URL、Cookie 与 Session
//   web-mime-content: Content-Type 与数据格式
//   web-python-stdlib: Python 标准库的 Web 工具
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：HTTP 协议基础
  // ============================================================
  {
    id: "web-http-basics",
    group: "Web 基础与 HTTP",
    icon: "🌐",
    title: "HTTP 协议基础",
    content: `# HTTP 协议基础

## 一句话定义

HTTP（HyperText Transfer Protocol，超文本传输协议）是 Web 通信的基础协议。你在浏览器里输入网址、点击链接、提交表单，背后都是浏览器（客户端）和服务器之间用 HTTP 在对话。简单说：HTTP 规定了「客户端怎么问，服务器怎么答」。

把名字拆开看：
- **HyperText（超文本）**：最早 HTTP 只用来传 HTML（超文本标记语言），现在什么都传（JSON、图片、视频）。
- **Transfer（传输）**：负责把数据从一端搬到另一端。
- **Protocol（协议）**：双方约定好的规则，谁也别想当然。

## 请求-响应模型

HTTP 是一个**请求-响应（request-response）**模型，永远是一问一答：

1. 客户端（浏览器/curl/你的 Python 程序）发一个**请求（Request）**。
2. 服务器收到请求，处理它，返回一个**响应（Response）**。
3. 连接结束，互不相欠。

这一点和「打电话」很像：你说一句，对方回一句。不像 WebSocket 那样可以「一直开着线随便聊」。

为什么这么设计？因为 HTTP 最初是为「拉取网页」设计的——用户点一下，服务器把 HTML 推过来，任务完成。这种无状态、一问一答的模型简单、可靠、易扩展，成了 Web 的基石。

## HTTP 方法（动词）

请求里必须告诉服务器「我想干嘛」，这就是 HTTP 方法（也叫动词）。常用方法如下：

| 方法 | 含义 | 典型场景 | 是否安全 | 是否幂等 |
|------|------|----------|----------|----------|
| GET | 查询资源 | 打开网页、搜索 | 是（不改数据） | 是 |
| POST | 创建资源 | 提交表单、注册 | 否 | 否 |
| PUT | 完整替换资源 | 更新整条记录 | 否 | 是 |
| DELETE | 删除资源 | 删除文章 | 否 | 是 |
| PATCH | 部分修改资源 | 改个昵称 | 否 | 否 |
| OPTIONS | 预检请求 | 浏览器跨域前问一下 | 是 | 是 |
| HEAD | 只取响应头 | 检查资源是否存在 | 是 | 是 |

理解两个关键词：
- **安全（Safe）**：不会修改服务器数据。GET 应该是安全的，所以「用 GET 删除文章」是设计错误。
- **幂等（Idempotent）**：执行一次和执行 N 次效果一样。DELETE 删一次和删十次结果都是「没了」，所以幂等；POST 创建一次和十次会生成十条记录，不幂等。

幂等性在分布式系统里特别重要：网络可能重试请求，幂等的操作重试了也不怕。

## HTTP 状态码

服务器返回响应时，用状态码告诉客户端「事情办得怎么样了」。状态码是三位数字，按第一位分类：

| 分类 | 含义 | 典型场景 |
|------|------|----------|
| 1xx | 信息性 | 请求已收到，继续处理（很少见） |
| 2xx | 成功 | 请求被正确处理了 |
| 3xx | 重定向 | 需要进一步动作才能完成 |
| 4xx | 客户端错误 | 你（客户端）搞错了 |
| 5xx | 服务器错误 | 我（服务器）出问题了 |

最常用的状态码详解：

- **200 OK**：最常见，一切正常，响应体里有你要的数据。
- **201 Created**：资源创建成功。POST 创建用户成功后返回 201 比 200 更准确。
- **204 No Content**：成功但没有内容返回。DELETE 删完通常返回 204。
- **301 Moved Permanently**：永久重定向。网站换域名了，老地址永远跳到新地址。
- **302 Found**：临时重定向。登录后跳回首页这种临时跳转。
- **304 Not Modified**：资源没变，用缓存吧。配合浏览器的缓存机制省流量。
- **400 Bad Request**：请求格式错了。JSON 解析失败、必填字段缺失。
- **401 Unauthorized**：没认证。你没登录，怎么让你访问个人中心？
- **403 Forbidden**：认证了但没权限。你是普通用户，想进管理员后台？
- **404 Not Found**：资源不存在。URL 写错了，或文章被删了。
- **422 Unprocessable Entity**：格式对但语义错。字段类型对，但值不合法（年龄传了 -1）。
- **500 Internal Server Error**：服务器内部出错。代码抛异常了，通常是 bug。
- **502 Bad Gateway**：网关收到无效响应。反向代理后面那个服务挂了。
- **503 Service Unavailable**：服务不可用。维护中或过载。

设计原则：**别把所有错误都返回 200，然后在 body 里塞个 {\"error\": true}**。正确使用状态码，客户端才能用统一逻辑处理。

## HTTP 头部（Headers）

头部是键值对，夹在请求行/状态行和正文之间，传递「关于正文」的元信息。常用头部：

**请求头（客户端发给服务器）：**
- \`Host\`：目标主机名（一个 IP 可能托管多个域名）。
- \`User-Agent\`：客户端是什么（浏览器类型、版本）。
- \`Accept\`：我想要什么格式的响应（application/json）。
- \`Content-Type\`：我的正文是什么格式。
- \`Authorization\`：认证凭证（Token、Basic 认证）。
- \`Cookie\`：带上之前服务器给我的小甜饼。

**响应头（服务器发给客户端）：**
- \`Content-Type\`：正文格式。
- \`Content-Length\`：正文多少字节。
- \`Set-Cookie\`：给你发个 Cookie。
- \`Cache-Control\`：缓存策略。
- \`Location\`：重定向到哪（配合 3xx）。

## 请求与响应的结构

一个 HTTP 请求长这样：

\`\`\`
GET /api/users?id=1 HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json

（空行，表示头部结束，下面是正文，GET 一般没正文）
\`\`\`

四部分：请求行（方法 URL 协议版本）、头部、空行、正文。

一个 HTTP 响应长这样：

\`\`\`
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 25

{"id": 1, "name": "Tom"}
\`\`\`

四部分：状态行（协议版本 状态码 原因短语）、头部、空行、正文。

那个**空行**很关键——它分隔头部和正文，告诉接收方「头部到此为止」。

## 为什么学 Web 必须先学 HTTP

你可能会问：我学 Flask/Django 直接写代码不就行了，干嘛先学 HTTP？

因为 HTTP 是所有 Web 框架的「底层语言」。框架帮你封装了 HTTP，但没替你理解它。当你遇到这些问题时，不懂 HTTP 就会两眼一抹黑：

- 接口返回 415，为什么？（Content-Type 不支持）
- 跨域请求被拦了，浏览器发的 OPTIONS 是什么？
- 文件上传怎么传？为什么要 multipart？
- 为什么 POST 创建要用 201 而不是 200？
- 服务器 502 了，到底是哪一层挂了？

框架是工具，HTTP 是本质。工具会换（Flask 换 FastAPI 换 Django），但 HTTP 二十多年没大变。把 HTTP 学透，换什么框架都快。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| GET 改数据 | 用 GET 删文章 | 改数据用 POST/PUT/DELETE |
| 状态码乱用 | 出错返回 200 + body 错误信息 | 用 4xx/5xx 状态码 |
| Content-Type 缺失 | POST JSON 不设 Content-Type | 必须设 application/json |
| 混淆 401 和 403 | 没权限返回 401 | 没登录 401，登录了没权限 403 |
| 忽略幂等性 | DELETE 不幂等 | DELETE 应幂等，重试安全 |
| 忘空行分隔 | 手写 HTTP 时头部正文没空行 | 头部和正文间必须有空行 |

下一章我们看 URL 的结构，以及 Cookie 和 Session 如何让「无状态」的 HTTP 记住你。`
  },

  // ============================================================
  // 第 2 章：URL、Cookie 与 Session
  // ============================================================
  {
    id: "web-url-cookie",
    group: "Web 基础与 HTTP",
    icon: "🍪",
    title: "URL、Cookie 与 Session",
    content: `# URL、Cookie 与 Session

## URL 的结构

URL（Uniform Resource Locator，统一资源定位符）就是你在浏览器地址栏看到的那串地址，它精确地告诉客户端「去哪、走什么协议、要什么资源」。

一个完整的 URL：

\`\`\`
https://www.example.com:443/api/users/42?role=admin&page=2#profile
\`\`\`

拆解每部分：

| 部分 | 示例 | 含义 |
|------|------|------|
| scheme（协议） | https | 用什么协议通信 |
| host（主机） | www.example.com | 服务器域名或 IP |
| port（端口） | 443 | 服务器端口（http 默认 80，https 默认 443，可省略） |
| path（路径） | /api/users/42 | 资源在服务器上的位置 |
| query（查询串） | ?role=admin&page=2 | 附加参数，键值对 |
| fragment（片段） | #profile | 页面内锚点，不发给服务器 |

注意：**fragment（#后面）不会发给服务器**，它只在浏览器端用来定位页面位置。所以服务器永远收不到 #profile。

### 路径参数 vs 查询参数

这是新手最容易混淆的。看两个 URL：

- \`/api/users/42\` —— 42 是**路径参数**，标识「哪个用户」，是资源的一部分。
- \`/api/users?role=admin\` —— role=admin 是**查询参数**，是「筛选条件」。

设计原则：
- 标识**具体资源**（第 42 号用户）用路径参数。
- **筛选/排序/分页**（只要 admin 角色的）用查询参数。
- 路径参数是「找哪个」，查询参数是「怎么挑」。

## Cookie 是什么

HTTP 是**无状态（stateless）**的——服务器处理完你的请求就忘了你是谁。这次请求和上次请求没有任何关联。这对「浏览网页」没问题，但对「登录后保持登录态」就麻烦了：你登录了，下一个请求服务器怎么知道是你？

Cookie 就是解决方案之一。它是一小段数据，由服务器通过 \`Set-Cookie\` 响应头发给浏览器，浏览器存起来，之后**每次请求自动带上**（通过 \`Cookie\` 请求头）。

流程像这样：

1. 你登录，服务器验证密码正确。
2. 服务器返回响应，带 \`Set-Cookie: session_id=abc123; HttpOnly; Path=/\`。
3. 浏览器把 cookie 存下来。
4. 你再访问任何页面，浏览器自动在请求头加 \`Cookie: session_id=abc123\`。
5. 服务器看到 session_id，就知道「哦，是刚才登录的那个人」。

Cookie 的特点：**存在客户端（浏览器）**，每次请求自动携带，有大小限制（一般 4KB），有域名隔离（example.com 的 cookie 不会发给 foo.com）。

### Cookie 的关键属性

\`\`\`
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/; Domain=example.com
\`\`\`

| 属性 | 作用 | 为什么重要 |
|------|------|------------|
| HttpOnly | JS 不能通过 document.cookie 读 | 防 XSS 偷 cookie |
| Secure | 只在 HTTPS 下发送 | 防中间人窃听 |
| SameSite | 跨站是否带 cookie（Strict/Lax/None） | 防 CSRF 攻击 |
| Max-Age | 过期秒数 | 控制生命周期 |
| Path | 哪些路径带这个 cookie | 作用范围 |
| Domain | 哪些域名带这个 cookie | 跨子域名共享 |

**安全重点**：登录态的 cookie 一定要设 HttpOnly（不然 XSS 一偷就走）和 Secure（不然 HTTP 下明文传）。

## Session 是什么

Cookie 存在浏览器端，有暴露风险。如果把登录态、用户信息都塞 cookie 里，既不安全（客户端能篡改），也放不下（4KB 限制）。

Session（会话）的思路是：**敏感数据存服务器，只给客户端一个 ID**。

流程：
1. 用户登录成功。
2. 服务器在内存/Redis 里创建一条记录：\`session_id=abc123 -> {user_id: 42, role: "admin"}\`。
3. 服务器把 \`session_id=abc123\` 通过 cookie 发给浏览器。
4. 浏览器之后每次请求带上这个 cookie。
5. 服务器用 session_id 查自己的存储，恢复出用户信息。

关键：**真正的数据在服务器**，客户端只有一把「钥匙」。

## Cookie vs Session

| 维度 | Cookie | Session |
|------|--------|---------|
| 存储位置 | 客户端（浏览器） | 服务器端 |
| 大小限制 | ~4KB | 无（看服务器存储） |
| 安全性 | 低（可被读/篡改） | 高（客户端只有 ID） |
| 生命周期 | 可设长期 | 默认随会话/可配置 |
| 实现依赖 | 浏览器原生 | 服务器自己实现 |
| 关系 | Session 依赖 cookie 传 ID | — |

一句话：**Session 通常用 Cookie 来传递 session_id**。两者不是对立的，而是配合的——cookie 负责运 ID，session 负责存数据。

## 为什么需要 Cookie/Session

因为 HTTP 无状态。无状态的优点是简单、可扩展（每个请求独立，加机器就行）；缺点是没法记住用户。

想象去一家「健忘餐厅」：你每次点菜服务员都问「您哪位？」。Cookie/Session 就是给你发个会员卡，下次一刷卡就知道你是老王、爱吃辣。

典型应用：
- 登录态保持（最常见的用途）。
- 购物车（未登录也能存商品）。
- 个性化设置（语言、主题）。
- 防重复提交（token 存 session）。

## Session 存储选择

服务器把 session 存哪？四个选项各有取舍：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 内存 | 最快 | 重启丢失、多进程不共享 | 开发调试 |
| 文件 | 简单、持久 | 慢、多机难同步 | 单机小项目 |
| Redis | 快、可共享、可过期 | 多个依赖 | 生产首选 |
| 数据库 | 持久、可审计 | 慢 | 需要长期保留 |

生产环境基本都选 Redis：读写快、天然支持过期、多台服务器共享一套 session 库，方便横向扩展。

## 代码示例：理解 Cookie 与 Session

用 Flask 演示（先不用完全看懂，重点看 cookie/session 的流转）：

\`\`\`python
from flask import Flask, request, session, redirect, url_for, make_response

app = Flask(__name__)
# session 需要密钥来加密签名（防篡改）
app.secret_key = "一个很长的随机字符串"

# 模拟用户数据库
USERS = {"tom": "123456"}

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        # 验证用户名密码
        if USERS.get(username) == password:
            # 登录成功，把用户名存进 session
            # Flask 会自动生成 session_id 并通过 cookie 发给浏览器
            session["username"] = username
            return "登录成功"
        return "用户名或密码错误", 401
    # GET 请求返回登录表单
    return '''<form method="post">
        <input name="username">
        <input name="password" type="password">
        <button>登录</button>
    </form>'''

@app.route("/profile")
def profile():
    # 从 session 取用户名（服务器端查 session 存储）
    username = session.get("username")
    if not username:
        # 没登录，跳转登录页
        return redirect(url_for("login"))
    return f"欢迎回来，{username}"

@app.route("/logout")
def logout():
    # 清除 session 里的用户信息
    session.pop("username", None)
    return "已退出"

# 手动设置 cookie 的例子
@app.route("/set-theme/<theme>")
def set_theme(theme):
    resp = make_response("主题已设置")
    # 设置 cookie，加 7 天过期
    resp.set_cookie("theme", theme, max_age=7 * 24 * 3600, httponly=True)
    return resp

@app.route("/get-theme")
def get_theme():
    # 读取请求里的 cookie
    theme = request.cookies.get("theme", "light")
    return f"当前主题: {theme}"
\`\`\`

注意 Flask 的 \`session\` 对象：你存的是 \`session["username"] = "tom"\`，但浏览器收到的 cookie 里只有一串加密的 session_id，真正的数据要么加密存在 cookie 里（Flask 默认），要么存在服务器端（配 Redis）。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| cookie 存敏感数据 | 把密码明文存 cookie | 只存 ID，数据存服务器 |
| 忘设 HttpOnly | 登录 cookie 没 HttpOnly | 敏感 cookie 必加 HttpOnly |
| session 不加密 | Flask 没设 secret_key | 必须设复杂密钥 |
| 路径参数当查询 | /users?id=42 标识资源 | 资源标识用 /users/42 |
| fragment 误用 | 以为 # 后内容服务器能收到 | fragment 不发给服务器 |
| 多机 session 不共享 | 内存 session + 多台机器 | 用 Redis 共享 session |

下一章我们看 Content-Type 这个头部怎么决定「数据是什么格式」。`
  },

  // ============================================================
  // 第 3 章：Content-Type 与数据格式
  // ============================================================
  {
    id: "web-mime-content",
    group: "Web 基础与 HTTP",
    icon: "📦",
    title: "Content-Type 与数据格式",
    content: `# Content-Type 与数据格式

## Content-Type 头的作用

HTTP 请求和响应的正文（body）可以是任意格式的字节流：可以是 JSON、可以是 HTML、可以是图片的二进制。但接收方怎么知道该按什么格式解析？

答案就是 \`Content-Type\` 这个头部。它告诉对方：「我的正文是这个格式的」。这是 MIME（Multipurpose Internet Mail Extensions）类型，最早用于邮件，后来被 HTTP 借来用。

格式是 \`类型/子类型\`，比如：
- \`text/html\` —— HTML 文本
- \`application/json\` —— JSON 数据
- \`image/png\` —— PNG 图片

没有 Content-Type，接收方只能猜，猜错就解析失败。所以**凡是带正文的请求/响应，必须设 Content-Type**。

## 常见 MIME 类型

| Content-Type | 含义 | 典型场景 |
|--------------|------|----------|
| text/html | HTML 文档 | 浏览器渲染网页 |
| text/plain | 纯文本 | 简单文本响应 |
| application/json | JSON 数据 | 现代 API 主流 |
| application/x-www-form-urlencoded | 表单数据 | HTML 表单默认 |
| multipart/form-data | 多部分表单 | 文件上传 |
| application/xml | XML 数据 | 老 SOAP 接口 |
| image/png | PNG 图片 | 静态资源 |
| application/octet-stream | 任意二进制 | 下载文件兜底 |

## JSON 格式

JSON（JavaScript Object Notation）是现代 API 的绝对主流。它用键值对和数组表示数据，轻量、易读、语言无关：

\`\`\`json
{
  "id": 1,
  "name": "Tom",
  "roles": ["admin", "editor"],
  "active": true,
  "balance": null
}
\`\`\`

JSON 的特点：
- 数据类型少：字符串、数字、布尔、null、对象、数组。
- 键必须用双引号（单引号不行）。
- 不能有注释（不能写 // 或 /* */）。
- 不能有尾逗号（最后一个元素后不能有逗号）。

为什么 API 用 JSON 而不是 XML？因为 JSON 更轻（没有冗余标签）、解析快、和 JavaScript 天然亲和（前端直接用）、人读起来也舒服。

## 表单格式 application/x-www-form-urlencoded

这是 HTML \`<form>\` 默认的提交格式。它把表单字段编码成 \`key=value\` 对，用 & 连接，特殊字符做 URL 编码：

\`\`\`
username=tom&password=123456&role=admin
\`\`\`

如果值里有特殊字符（空格、中文、&），会被百分号编码：\`name=Tom%20Lee\`。

它和 URL 查询串长得很像，区别只是放在了 body 里。简单表单用它足够，但传复杂嵌套数据（对象数组）就力不从心。

## 文件上传格式 multipart/form-data

表单要上传文件时，编码方式要改成 \`multipart/form-data\`。它用一段「边界（boundary）」字符串把各字段分开，每个部分可以有自己的 Content-Type：

\`\`\`
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryABC

------WebKitFormBoundaryABC
Content-Disposition: form-data; name="title"

我的文章
------WebKitFormBoundaryABC
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

（文件的二进制字节）
------WebKitFormBoundaryABC--
\`\`\`

为什么上传文件不用 JSON？因为 JSON 是文本格式，没法直接放二进制文件（要么 base64 编码，但会膨胀 33%）。multipart 能直接放原始字节，高效。

HTML 表单这样设置：

\`\`\`html
<form method="post" enctype="multipart/form-data">
  <input type="text" name="title">
  <input type="file" name="file">
</form>
\`\`\`

## Accept 头与内容协商

请求方用 \`Accept\` 头告诉服务器：「我想要什么格式的响应」。

\`\`\`
Accept: application/json
\`\`\`

服务器可以根据 Accept 返回不同格式——这叫**内容协商（Content Negotiation）**。同一个 URL，浏览器要 HTML 就返回 HTML，API 客户端要 JSON 就返回 JSON。

\`\`\`
# 浏览器请求
Accept: text/html
-> 返回 HTML 页面

# API 客户端请求
Accept: application/json
-> 返回 JSON 数据
\`\`\`

Accept 还能设优先级：\`Accept: application/json, text/html;q=0.9\` 表示「最想要 JSON，实在没有 HTML 也行」。

实际中很多 API 不做内容协商，固定返回 JSON（现代 API 默认 JSON），Accept 用得不多。但理解这个机制能解释为什么同一个 URL 在浏览器和 curl 里长得不一样。

## 代码示例：用 requests 发不同类型请求

\`\`\`python
import requests

# 1. 发 JSON 请求（最常用）
# 关键：json= 参数会自动设 Content-Type: application/json
response = requests.post(
    "https://api.example.com/users",
    json={"name": "Tom", "age": 25},  # 自动序列化成 JSON
)
print(response.status_code)  # 201

# 2. 发表单请求
# 模拟 HTML 表单提交，Content-Type 自动设为 application/x-www-form-urlencoded
response = requests.post(
    "https://api.example.com/login",
    data={"username": "tom", "password": "123"},  # data= 发表单
)

# 3. 上传文件
# 用 files= 参数，自动用 multipart/form-data
response = requests.post(
    "https://api.example.com/upload",
    files={"file": ("photo.jpg", open("photo.jpg", "rb"), "image/jpeg")},
    data={"title": "我的照片"},  # 同时带普通字段
)

# 4. 指定想要的响应格式
response = requests.get(
    "https://api.example.com/users/1",
    headers={"Accept": "application/json"},  # 告诉服务器我要 JSON
)
# requests 会根据响应的 Content-Type 自动解析
user = response.json()  # 如果响应是 JSON，直接解析成字典
print(user["name"])

# 5. 手动设 Content-Type（特殊场景）
response = requests.post(
    "https://api.example.com/raw",
    data="纯文本内容",  # 原始字节
    headers={"Content-Type": "text/plain"},  # 手动指定
)
\`\`\`

关键记住：**requests 的 \`json=\` 自动设 JSON，\`data=\` 发表单，\`files=\` 传文件**。别混用。

## MIME 类型的历史

MIME 最早是邮件系统用来区分附件类型的（图片、音频、视频）。HTTP 把它拿来用了，但加了自己的扩展，比如 \`application/vnd.api+json\`（JSON API 规范的厂商类型）。

老接口里你会见到 \`text/xml\`（SOAP 时代），现在基本都被 JSON 取代了。知道这段历史，看到老接口返回 XML 不会惊讶。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| POST JSON 没设 Content-Type | 不设头部直接发 | 必须设 application/json |
| 表单上传文件忘改 enctype | 默认 urlencoded | 改成 multipart/form-data |
| JSON 用单引号 | {'name': 'Tom'} | 必须双引号 |
| JSON 有尾逗号 | {"a":1,} | 去掉尾逗号 |
| JSON 有注释 | // 说明 | JSON 不允许注释 |
| 文件用 JSON 传 | base64 塞 JSON | 用 multipart 直接传二进制 |

下一章我们看 Python 标准库自带的 Web 工具，理解最底层的原理。`
  },

  // ============================================================
  // 第 4 章：Python 标准库的 Web 工具
  // ============================================================
  {
    id: "web-python-stdlib",
    group: "Web 基础与 HTTP",
    icon: "🐍",
    title: "Python 标准库的 Web 工具",
    content: `# Python 标准库的 Web 工具

## 标准库能做什么

在用 Flask、Django 这些框架之前，先看看 Python 自带的标准库能做哪些 Web 的事。标准库不强大，但能让你看清「Web 服务器本质上在做什么」，对你理解框架大有好处。

Python 标准库里和 Web 相关的几个模块：

| 模块 | 作用 | 适用 |
|------|------|------|
| http.server | 极简 HTTP 服务器 | 学习、调试 |
| urllib.request | 发 HTTP 请求 | 简单请求（生产用 requests） |
| urllib.parse | URL 解析与编码 | 工具函数，常用 |
| http.cookies | 操作 Cookie | 学习原理 |
| http.client | 底层 HTTP 客户端 | 被 urllib 封装 |

## http.server：极简 HTTP 服务器

\`http.server\` 是标准库自带的 HTTP 服务器，几行代码就能跑起来。它的核心是 \`BaseHTTPRequestHandler\`，你继承它并重写 \`do_GET\`、\`do_POST\` 等方法来处理请求。

最简单的 Hello World：

\`\`\`python
from http.server import BaseHTTPRequestHandler, HTTPServer

class MyHandler(BaseHTTPRequestHandler):
    # 处理 GET 请求
    def do_GET(self):
        # self.path 是请求的路径，比如 "/" 或 "/about"
        if self.path == "/":
            # 1. 发送响应状态行：200 OK
            self.send_response(200)
            # 2. 发送头部
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            # 3. 发送正文（必须用 wfile.write，字节类型）
            self.wfile.write("Hello, World!".encode("utf-8"))
        else:
            # 找不到路径，返回 404
            self.send_response(404)
            self.end_headers()
            self.wfile.write("Not Found".encode("utf-8"))

# 启动服务器，监听 8000 端口
server = HTTPServer(("0.0.0.0", 8000), MyHandler)
print("服务器启动在 http://localhost:8000")
server.serve_forever()
\`\`\`

运行后访问 \`http://localhost:8000\` 就能看到 Hello, World。

你看，一个 Web 服务器本质上就是：**收到请求 -> 看 path -> 设状态码和头部 -> 写正文**。所有框架（Flask/Django）底层都在做这件事，只是帮你封装得更优雅。

### 理解 BaseHTTPRequestHandler

这个类把 HTTP 协议解析好了，提供给你几个属性和方法：
- \`self.path\`：请求路径（含查询串）。
- \`self.command\`：HTTP 方法（GET/POST）。
- \`self.headers\`：请求头字典。
- \`self.rfile\`：读正文的文件对象（POST 数据从这里读）。
- \`self.wfile\`：写正文的文件对象（响应写这里）。
- \`self.send_response(code)\`：发状态码。
- \`self.send_header(k, v)\`：发响应头。
- \`self.end_headers()\`：结束头部（之后就是正文）。

### 处理 POST 请求

\`\`\`python
class MyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. 从 Content-Length 头读正文长度
        content_length = int(self.headers.get("Content-Length", 0))
        # 2. 读取正文（字节）
        body = self.rfile.read(content_length)
        # 3. 解析表单数据
        from urllib.parse import parse_qs
        # body 是 b"name=tom&age=25"，parse_qs 解析成字典
        data = parse_qs(body.decode("utf-8"))
        # data = {"name": ["tom"], "age": ["25"]}
        
        # 4. 返回响应
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(f"收到: {data}".encode("utf-8"))
\`\`\`

注意 \`parse_qs\` 返回的值是**列表**（因为表单字段可以有多个同名值），取值要 \`data["name"][0]\`。

## urllib.request：发请求

标准库发 HTTP 请求用 \`urllib.request\`。功能够用但写起来啰嗦（生产环境大家都用第三方库 requests）。

\`\`\`python
from urllib.request import urlopen, Request
from urllib.parse import urlencode

# 1. 最简单的 GET 请求
response = urlopen("https://httpbin.org/get")
# 读取正文（字节），decode 成字符串
print(response.read().decode("utf-8"))
# 状态码
print(response.status)

# 2. 带查询参数的 GET
# urlencode 把字典转成 "key=value&key2=value2"
params = urlencode({"name": "Tom", "age": 25})
url = f"https://httpbin.org/get?{params}"
response = urlopen(url)
print(response.read().decode("utf-8"))

# 3. POST 请求
# urlopen 默认只发 GET，要 POST 得用 Request 对象
data = urlencode({"name": "Tom"}).encode("utf-8")  # 编码成字节
request = Request("https://httpbin.org/post", data=data, method="POST")
request.add_header("Content-Type", "application/x-www-form-urlencoded")
response = urlopen(request)
print(response.read().decode("utf-8"))

# 4. 设请求头（比如带认证 Token）
request = Request("https://api.example.com/data")
request.add_header("Authorization", "Bearer my-token")
response = urlopen(request)
\`\`\`

对比 \`requests\` 库的写法（\`requests.post(url, json={...})\` 一行搞定），你就知道为什么生产都用 requests 了——标准库能做，但啰嗦、不友好。

## urllib.parse：URL 工具

这个模块是真正常用的工具函数，即使生产项目也会用到。

\`\`\`python
from urllib.parse import urlparse, urlencode, parse_qs, quote, unquote

# 1. 解析 URL
url = "https://example.com/api/users?role=admin&page=2#section"
parts = urlparse(url)
# parts.scheme = "https"
# parts.netloc = "example.com"
# parts.path = "/api/users"
# parts.query = "role=admin&page=2"
# parts.fragment = "section"

# 2. 解析查询串成字典
params = parse_qs(parts.query)
# {"role": ["admin"], "page": ["2"]}
# 注意值是列表（同名参数可多个）

# 3. 字典转查询串
query = urlencode({"role": "admin", "page": 2})
# "role=admin&page=2"

# 4. URL 编码（特殊字符转义）
# 比如中文、空格在 URL 里要编码
encoded = quote("Hello World & 你好")
# "Hello%20World%20%26%20%E4%BD%A0%E5%A5%BD"
decoded = unquote(encoded)
# "Hello World & 你好"
\`\`\`

**重点**：往 URL 里塞用户输入时，一定要用 \`quote\` 编码，否则中文、空格、特殊字符会让 URL 解析出错，甚至引发安全问题。

## http.cookies：操作 Cookie

标准库也能解析和生成 Cookie：

\`\`\`python
from http.cookies import SimpleCookie

# 解析请求里的 Cookie 头
c = SimpleCookie()
c.load("session_id=abc123; theme=dark")
# 像字典一样访问
session = c["session_id"].value  # "abc123"
theme = c["theme"].value  # "dark"

# 生成 Set-Cookie 响应头
c = SimpleCookie()
c["session_id"] = "abc123"
c["session_id"]["httponly"] = True
c["session_id"]["path"] = "/"
c["session_id"]["max-age"] = 3600
# 输出 Set-Cookie 头字符串
print(c.output())
# Set-Cookie: session_id=abc123; HttpOnly; Path=/; Max-Age=3600
\`\`\`

## 用 http.server 实现简单路由

标准库没有路由，得自己写。下面是个迷你路由器：

\`\`\`python
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# 路由表：路径 -> 处理函数
ROUTES = {}

def route(path):
    """装饰器：注册路由"""
    def decorator(func):
        ROUTES[path] = func
        return func
    return decorator

@route("/")
def index(handler):
    handler.send_response(200)
    handler.send_header("Content-Type", "text/html; charset=utf-8")
    handler.end_headers()
    handler.wfile.write("<h1>首页</h1>".encode("utf-8"))

@route("/api/users")
def users(handler):
    # 解析查询参数
    query = parse_qs(urlparse(handler.path).query)
    page = query.get("page", ["1"])[0]
    handler.send_response(200)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.end_headers()
    # 返回 JSON
    handler.wfile.write(f'{{"page": {page}}}'.encode("utf-8"))

class RouterHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 取路径部分（去掉查询串）
        path = urlparse(self.path).path
        # 查路由表
        handler_func = ROUTES.get(path)
        if handler_func:
            handler_func(self)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write("404 Not Found".encode("utf-8"))

server = HTTPServer(("0.0.0.0", 8000), RouterHandler)
server.serve_forever()
\`\`\`

这就是 Flask \`@app.route\` 的雏形——框架帮你把这套封装得更优雅，还加了类型转换、变量规则、错误处理。

## 为什么不用标准库做生产

标准库写 Web 能跑，但生产不用它，原因有四：

| 短板 | 说明 |
|------|------|
| 性能差 | 单线程（除非自己加 threading），并发能力弱 |
| 功能弱 | 没路由、没模板、没 ORM、没中间件、没认证 |
| 安全弱 | 没自动防 CSRF/XSS、没 cookie 签名 |
| 不规范 | 不符合 WSGI/ASGI，没法用 gunicorn 部署 |

\`http.server\` 官方文档自己都写了：「It is not recommended for production」。

## 标准库的价值

既然生产不用，为什么还要学？

因为**标准库是理解原理的最好教材**。用 \`http.server\` 你能看清：
- HTTP 服务器就是「解析请求 -> 调函数 -> 写响应」。
- 路由本质就是个字典查找。
- Cookie 就是个字符串解析。
- 查询参数就是 URL 编码。

当你用 Flask 时，\`@app.route("/users/<id>")\` 背后就是上面那个路由表的增强版。理解了底层，框架对你不再黑盒——出了问题你知道去哪查。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 正文没 encode | write("文字") | write("文字".encode()) |
| 忘设 Content-Type | 发完状态就写正文 | 先发头部再 end_headers 再写正文 |
| 用标准库上生产 | http.server 跑线上 | 用 gunicorn + 框架 |
| parse_qs 取值 | data["name"] | data["name"][0]（值是列表） |
| URL 不编码 | 拼 URL 带中文 | 用 quote/urlencode 编码 |
| 忘 end_headers | 发完 header 直接 write | 必须 end_headers 分隔头和正文 |

下一批我们将进入 WSGI 和 ASGI，理解 Python Web 服务器和框架之间的「接口约定」是怎么演进的。`
  },
];
