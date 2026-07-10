// =============================================================
// Python Web 后端开发教程 - 第 1 批章节（HTTP 基础 6 章）
// -------------------------------------------------------------
// 本批包含 6 章（group 均为 "HTTP 基础"）：
//   pyweb2-http-protocol        : HTTP 协议全解
//   pyweb2-https-security       : HTTPS 与加密基础
//   pyweb2-cookie-session       : Cookie、Session 与 Token
//   pyweb2-http-evolution       : HTTP/1.1 vs HTTP/2 vs HTTP/3
//   pyweb2-content-negotiation  : 内容协商与 MIME 类型
//   pyweb2-python-http-stdlib   : Python HTTP 标准库实战
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，HTTP 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：HTTP 协议全解
  // ============================================================
  {
    id: "pyweb2-http-protocol",
    group: "HTTP 基础",
    icon: "🌐",
    title: "HTTP 协议全解",
    content: `# HTTP 协议全解

## 一、HTTP 是什么

HTTP（HyperText Transfer Protocol，超文本传输协议）是 Web 通信的基础协议。你在浏览器里输入网址、点击链接、提交表单，背后都是浏览器（客户端）和服务器之间用 HTTP 在对话。一句话：**HTTP 规定了「客户端怎么问，服务器怎么答」**。

把名字拆开看：

- **HyperText（超文本）**：最早 HTTP 只用来传 HTML（超文本标记语言），现在什么都传——JSON、图片、视频、二进制流。
- **Transfer（传输）**：负责把数据从一端搬到另一端，本身不关心数据是什么。
- **Protocol（协议）**：双方约定好的规则，谁也别想当然。

### 生活比喻：点餐

把 HTTP 想象成去餐厅点餐：

| HTTP 概念 | 餐厅场景 |
| --- | --- |
| 客户端（Client） | 你（顾客） |
| 服务器（Server） | 餐厅服务员 + 厨房 |
| 请求（Request） | 你喊：「来一份宫保鸡丁，不要花生」 |
| 响应（Response） | 服务员端上来的菜（或「卖完了」的回复） |
| 方法（Method） | 「来一份」=GET，「加一份」=POST，「换成」=PUT |
| 状态码（Status Code） | 200=上菜了，404=没这道菜，500=厨房着火了 |
| 头部（Header） | 「打包带走」「加辣」这类附加说明 |
| 主体（Body） | 实际端上来的那盘菜 |

### HTTP 的核心特征

1. **客户端-服务器模型**：永远是一方主动发起，另一方应答。
2. **基于 TCP（HTTP/3 改用 QUIC/UDP）**：可靠传输，不丢包。
3. **无状态（Stateless）**：服务器不记得你上一次来过（详见下文）。
4. **文本协议（HTTP/1.x）**：请求/响应的起始行和头部都是纯文本，可读性强；HTTP/2 之后改成二进制分帧，但语义不变。
5. **可扩展**：头部字段可以自定义，新增功能靠加头实现（比如 Authorization、Cookie 都是后加的）。

## 二、请求-响应模型

HTTP 是一个**请求-响应（request-response）**模型，永远一问一答：

1. 客户端（浏览器 / curl / 你的 Python 程序）发一个**请求（Request）**。
2. 服务器收到请求，处理它，返回一个**响应（Response）**。
3. 一次交互结束，互不相欠。

### 一个 HTTP 请求长什么样

下面是一个最朴素的 HTTP/1.1 请求（明文）：

\`\`\`http
POST /api/login HTTP/1.1
Host: www.example.com
Content-Type: application/json
Content-Length: 46

{"username": "tom", "password": "123456"}
\`\`\`

逐行解读：

- 第 1 行是**请求行（Request Line）**：方法 \`POST\` + 路径 \`/api/login\` + 协议版本 \`HTTP/1.1\`。
- 接下来几行是**请求头（Headers）**，每行一个 \`名字: 值\`。
- 空一行（这个空行很重要，用来分隔头部和主体）。
- 最后是**请求主体（Body）**，这里是一段 JSON。

### 一个 HTTP 响应长什么样

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 38

{"code": 0, "msg": "登录成功", "token": "..."}
\`\`\`

- 第 1 行是**状态行（Status Line）**：协议版本 + 状态码 \`200\` + 状态短语 \`OK\`。
- 之后是**响应头**。
- 空一行。
- 最后是**响应主体**。

### 用 Python 把请求/响应打出来

下面这个 demo 用标准库手动发一个请求，并把「发出去的原始字节」和「收到的原始字节」都打印出来，帮你建立直观感受：

\`\`\`python
import http.client

# 建立到主机的 TCP 连接（HTTP 默认端口 80）
conn = http.client.HTTPConnection("httpbin.org", 80, timeout=10)

# 发送一个 GET 请求；putrequest/putheader/endheaders 是底层 API，
# 能让我们看清「请求是怎么一行行拼出来的」
conn.putrequest("GET", "/get?name=tom")  # 请求行：方法 + 路径
conn.putheader("Host", "httpbin.org")     # 请求头：Host 必填
conn.putheader("User-Agent", "my-demo/1.0")
conn.endheaders()  # 结束头部，发送空行（其实还会自动补一个空行）

# 拿到响应对象
resp = conn.getresponse()
print("状态码：", resp.status)        # 200
print("状态短语：", resp.reason)      # OK
print("响应头：")
for k, v in resp.getheaders():
    print(f"  {k}: {v}")

# 读取响应主体（bytes），按指定的字符集解码成字符串
body = resp.read().decode("utf-8")
print("响应主体：", body)
conn.close()
\`\`\`

## 三、无状态性

HTTP 本身是**无状态（stateless）**的：服务器处理完一个请求就忘了你是谁，下一个请求对服务器来说是全新的。

这听起来很反人类——「我都登录了，怎么刷新又要登录？」原因是无状态让服务器实现简单、容易扩展（任何一台机器都能处理任何请求，不用同步状态）。为了在无状态之上模拟「记住你」的效果，发明了 Cookie / Session / Token（第 3 章详讲）。

### 生活比喻：健忘的酒保

无状态就像一个健忘的酒保：你每次点酒他都不记得你昨天来过。解决办法是你每次都亮一下会员卡（Cookie），他看到卡号去查账本（Session）或验一下你手里的代金券（Token）。

### demo：用 Cookie 在「无状态」之上保持登录

\`\`\`python
import requests

# 第一次登录，服务器通过 Set-Cookie 给我们一个会话标识
login_resp = requests.post(
    "https://httpbin.org/cookies/set",
    params={"sid": "abc123"},   # 服务器会把它写进 Cookie
)
print("登录后拿到的 Cookie：", login_resp.cookies.get_dict())

# 用 requests.Session 自动维护 Cookie，
# 后续请求会自动带上上一步收到的 Cookie，服务器就能「认出」我们
sess = requests.Session()
sess.cookies.update(login_resp.cookies.get_dict())

# 再发一个请求，看服务器是否回显我们带上的 Cookie
check = sess.get("https://httpbin.org/cookies")
print("服务器看到的 Cookie：", check.json())
\`\`\`

## 四、HTTP 方法详解

方法（Method，也叫动词）告诉服务器「我对这个资源想干什么」。注意：HTTP 方法是**语义约定**，服务器是否真的按语义实现，取决于后端代码。

| 方法 | 语义 | 是否安全 | 是否幂等 | 典型用途 |
| --- | --- | --- | --- | --- |
| GET | 获取资源 | ✅ | ✅ | 打开网页、查询 |
| POST | 创建资源 / 提交数据 | ❌ | ❌ | 提交表单、登录 |
| PUT | 用请求体整体替换资源 | ❌ | ✅ | 更新整条记录 |
| DELETE | 删除资源 | ❌ | ✅ | 删除一条记录 |
| PATCH | 局部修改资源 | ❌ | ❌ | 改个字段 |
| HEAD | 只取响应头，不要 body | ✅ | ✅ | 探测大小/是否存在 |
| OPTIONS | 询问服务器支持哪些方法 | ✅ | ✅ | CORS 预检 |

> **安全（safe）**：不改变服务器状态（只读）。**幂等（idempotent）**：同一个请求重复发 N 次，效果和发 1 次一样。

### 4.1 GET

GET 用来「获取」资源，参数一般放在 URL 的查询串里，**不应该有请求体**，也不应该改变服务器状态。

\`\`\`bash
# curl 演示：获取一个 JSON
curl "https://httpbin.org/get?name=tom&age=18"
\`\`\`

\`\`\`python
import requests

# GET 请求，参数用 params 自动拼到 URL 上
r = requests.get(
    "https://httpbin.org/get",
    params={"name": "tom", "age": 18},  # 会被拼成 ?name=tom&age=18
)
print(r.json()["args"])  # 服务器回显我们传的参数
\`\`\`

> 注意：GET 参数会出现在浏览器历史、服务器日志、Referer 头里，所以**绝不要用 GET 传密码**。

### 4.2 POST

POST 用来「提交」数据，通常用于创建资源或触发一个动作。数据放在**请求体**里，可以有多种格式（见第 5 章）。

\`\`\`bash
# 提交 JSON
curl -X POST https://httpbin.org/post \\
  -H "Content-Type: application/json" \\
  -d '{"name":"tom","age":18}'
\`\`\`

\`\`\`python
import requests

# 提交 JSON：requests 会自动设置 Content-Type: application/json
r = requests.post(
    "https://httpbin.org/post",
    json={"name": "tom", "age": 18},
)
print(r.json()["json"])  # 服务器回显收到的 JSON

# 提交表单（application/x-www-form-urlencoded）
r2 = requests.post(
    "https://httpbin.org/post",
    data={"username": "tom", "password": "123456"},
)
print(r2.json()["form"])
\`\`\`

### 4.3 PUT

PUT 用请求体**整体替换**目标资源。如果资源不存在就创建，存在就用新内容覆盖。强调「整体」。语义上 PUT 是幂等的——你拿同一份内容 PUT 10 次，结果一样。

\`\`\`python
import requests

# 用 PUT 更新用户「整体」信息
r = requests.put(
    "https://httpbin.org/put",
    json={"id": 1, "name": "Tom New", "age": 20},
)
print(r.status_code, r.json()["data"])
\`\`\`

### 4.4 DELETE

DELETE 删除指定资源，幂等（删一次和删十次，资源都不存在了）。

\`\`\`python
import requests

r = requests.delete("https://httpbin.org/delete", params={"id": 1})
print(r.status_code)  # 通常是 200 或 204
\`\`\`

### 4.5 PATCH

PATCH 做**局部更新**，只传需要改的字段。和 PUT 的区别：PUT 要传整条记录，PATCH 只传 diff。

\`\`\`python
import requests

# 只改 age 字段，其他不动
r = requests.patch(
    "https://httpbin.org/patch",
    json={"age": 21},
)
print(r.json()["data"])
\`\`\`

### 4.6 HEAD

HEAD 和 GET 一样，但**服务器只返回响应头，不返回 body**。常用来：检查资源是否存在、获取 Content-Length 看文件多大、看 Last-Modified 判断是否更新。

\`\`\`bash
# 只看头部，不下载文件本体
curl -I https://www.example.com/
\`\`\`

\`\`\`python
import requests

r = requests.head("https://www.example.com/")
print(r.headers.get("Content-Type"))   # text/html
print(r.headers.get("Content-Length")) # 页面字节数
print(len(r.content))                  # 0：HEAD 没有 body
\`\`\`

### 4.7 OPTIONS

OPTIONS 询问服务器「对这个资源支持哪些方法」，是 CORS（跨域）预检请求的主角。

\`\`\`python
import requests

r = requests.options("https://httpbin.org/anything")
allow = r.headers.get("Allow")  # 可能是 GET,POST,PUT,...
print("服务器支持的方法：", allow)
\`\`\`

## 五、HTTP 状态码

状态码（Status Code）是服务器对这次请求处理结果的「三位数总结」。第一位表示类别：

| 类别 | 含义 | 典型 |
| --- | --- | --- |
| 1xx | 信息性（请求已收到，继续处理） | 100 Continue |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301, 302, 304 Not Modified |
| 4xx | 客户端错误（你写错了） | 400, 401, 403, 404, 429 |
| 5xx | 服务器错误（服务端炸了） | 500, 502, 503, 504 |

### 常用状态码速查表

| 码 | 名称 | 什么时候用 |
| --- | --- | --- |
| 200 | OK | 一切正常，返回内容 |
| 201 | Created | POST 创建资源成功，常配合 Location 头 |
| 204 | No Content | 成功但无内容返回（如 DELETE 之后） |
| 301 | Moved Permanently | 永久重定向，浏览器会缓存 |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 协商缓存命中，用本地缓存 |
| 400 | Bad Request | 请求格式错（参数不全、JSON 解析失败） |
| 401 | Unauthorized | 没登录 / 没带凭证 |
| 403 | Forbidden | 登录了但没权限 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 路径对但方法不对（如对只读资源用 DELETE） |
| 409 | Conflict | 冲突（如重复创建） |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务器代码抛异常 |
| 502 | Bad Gateway | 网关后面服务挂了 |
| 503 | Service Unavailable | 服务不可用（维护中、过载） |
| 504 | Gateway Timeout | 网关后面服务超时 |

### demo：观察不同状态码

\`\`\`python
import requests

# httpbin 提供了 /status/{code} 端点，会返回指定状态码
for code in [200, 301, 404, 500]:
    # 301 默认会被 requests 自动跟随重定向，这里禁用以观察原始状态码
    r = requests.get(f"https://httpbin.org/status/{code}",
                     allow_redirects=False)
    print(f"请求 {code} -> 实际状态码 {r.status_code}, 短语 {r.reason}")
\`\`\`

### 状态码选型建议（写后端时）

- 创建资源成功 → 201（并返回新资源或 Location 头）。
- 删除/更新成功但不想返回内容 → 204。
- 客户端参数错 → 400，并在 body 里说明哪里错。
- 没登录 → 401；登录了但没权限 → 403（这俩别混）。
- 服务器自己异常 → 500，**不要**把堆栈暴露给用户。

## 六、HTTP Header 详解

头部（Header）是键值对，给请求/响应附加「元信息」。按用途大致分四类：

### 6.1 通用头（请求和响应都能用）

| 头 | 作用 |
| --- | --- |
| Cache-Control | 缓存策略（max-age、no-cache、no-store） |
| Connection | keep-alive / close，是否复用连接 |
| Date | 报文产生的时间 |

### 6.2 请求头

| 头 | 作用 |
| --- | --- |
| Host | 目标主机（HTTP/1.1 必填，一台服务器靠它区分虚拟主机） |
| User-Agent | 客户端标识（浏览器/爬虫） |
| Accept | 想要什么响应格式（内容协商，第 5 章） |
| Accept-Encoding | 能接受的压缩算法（gzip, br） |
| Accept-Language | 想要的语言（zh-CN, en） |
| Authorization | 认证凭证（Bearer xxx、Basic xxx） |
| Cookie | 携带的 Cookie |
| Referer | 从哪个页面跳来的 |
| Content-Type | 请求体的格式 |
| Content-Length | 请求体字节数 |

### 6.3 响应头

| 头 | 作用 |
| --- | --- |
| Server | 服务器软件标识（如 nginx） |
| Set-Cookie | 给客户端种 Cookie（可多个） |
| Location | 重定向目标（配合 3xx / 201） |
| WWW-Authenticate | 401 时告诉客户端怎么认证 |
| Content-Type | 响应体格式 |
| Content-Length | 响应体字节数 |
| Content-Encoding | 响应体用的压缩 |

### 6.4 实体头（描述 body）

Content-Type、Content-Length、Content-Encoding、Last-Modified、ETag 都算。

### demo：用 curl -v 看完整头部交互

\`\`\`bash
# -v 显示详细交互（> 是发出的，< 是收到的）
curl -v https://httpbin.org/get -H "X-My-Header: hello"
\`\`\`

输出会包含：

\`\`\`
> GET /get HTTP/2
> Host: httpbin.org
> User-Agent: curl/8.x
> Accept: */*
> X-My-Header: hello          <- 我们自定义的头
>
< HTTP/2 200
< content-type: application/json
< content-length: 350
\`\`\`

### demo：用 Python 自定义请求头并读取响应头

\`\`\`python
import requests

# 自定义请求头（注意：User-Agent 一些站点会拦默认的 python-requests）
headers = {
    "User-Agent": "Mozilla/5.0 (my-demo)",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "X-Trace-Id": "req-0001",   # 自定义头常用于链路追踪
}
r = requests.get("https://httpbin.org/headers", headers=headers)

# 服务器回显它收到的请求头
print("服务器收到的：", r.json()["headers"])

# 读取响应头
print("响应 Content-Type：", r.headers["Content-Type"])
print("响应 Server：", r.headers.get("Server", "未知"))
\`\`\`

## 七、HTTP Body 与内容协商

**Body（主体）** 是请求/响应真正承载的数据。HEAD/GET/DELETE 通常没 body，POST/PUT/PATCH 通常有。

Body 的格式由 **Content-Type** 头声明（详见第 5 章）。常见格式：

| Content-Type | 用途 | 示例 |
| --- | --- | --- |
| application/json | 现代 API | {"a":1} |
| application/x-www-form-urlencoded | 表单 | a=1&b=2 |
| multipart/form-data | 上传文件 | 多段二进制 |
| text/html | 网页 | <html>...</html> |
| text/plain | 纯文本 | hello |
| application/octet-stream | 任意二进制 | 文件流 |

**内容协商（Content Negotiation）**：客户端用 Accept* 系列头告诉服务器「我想要什么」，服务器尽量满足。第 5 章会专门讲，这里先看个例子。

\`\`\`python
import requests

# 告诉服务器：我最想要 JSON
r = requests.get(
    "https://httpbin.org/anything",
    headers={"Accept": "application/json"},
)
print(r.headers["Content-Type"])  # application/json
\`\`\`

## 八、用 curl 和 Python requests 演示

把前面散落的命令汇总，方便对照练习。

### curl 常用姿势

\`\`\`bash
# GET + 查询参数
curl "https://httpbin.org/get?a=1&b=2"

# POST JSON（-d 默认 Content-Type 是 form，要手动 -H）
curl -X POST https://httpbin.org/post \\
  -H "Content-Type: application/json" \\
  -d '{"name":"tom"}'

# 带认证头
curl -H "Authorization: Bearer abc123" https://httpbin.org/bearer

# 上传文件
curl -F "file=@photo.png" https://httpbin.org/post

# 下载文件并显示进度
curl -O https://example.com/bigfile.zip

# 只看响应头
curl -I https://example.com

# 跟随重定向
curl -L https://httpbin.org/redirect/3

# 设置超时
curl --max-time 10 https://example.com

# 保存响应头到文件
curl -D headers.txt -o body.json https://httpbin.org/get
\`\`\`

### requests 常用姿势

\`\`\`python
import requests

sess = requests.Session()  # 复用连接 + 共享 Cookie

# GET
r = sess.get("https://httpbin.org/get", params={"a": 1}, timeout=10)

# POST JSON
r = sess.post("https://httpbin.org/post", json={"a": 1})

# 上传文件
with open("photo.png", "rb") as f:
    r = sess.post("https://httpbin.org/post", files={"file": f})

# 流式下载大文件（避免一次性占内存）
r = sess.get("https://example.com/bigfile.zip", stream=True)
with open("bigfile.zip", "wb") as f:
    for chunk in r.iter_content(chunk_size=8192):
        f.write(chunk)

# 带超时 + 重试
from requests.adapters import HTTPAdapter
sess.mount("https://", HTTPAdapter(max_retries=3))
\`\`\`

## 九、HTTP/1.1 持久连接与管道化

### 短连接 vs 持久连接

- **HTTP/1.0 默认短连接**：每个请求建一次 TCP 连接，用完就断。一个网页有 20 张图，就要建 20 次 TCP（每次都要三次握手 + 慢启动），很贵。
- **HTTP/1.1 默认持久连接（keep-alive）**：TCP 连接建立后不关，多个请求复用。用 \`Connection: keep-alive\` 显式声明，\`Connection: close\` 关闭。

### 生活比喻

短连接像每次打车都要重新叫车、重新谈价；持久连接像包了一辆车，跑完一趟不换车，下趟接着用。

### demo：观察 keep-alive

\`\`\`python
import requests

sess = requests.Session()  # Session 默认复用连接
for i in range(3):
    r = sess.get("https://httpbin.org/get")
    # 同一个连接发 3 个请求，省去重复握手
    print(f"第 {i+1} 个请求完成，状态 {r.status_code}")
\`\`\`

### 管道化（Pipelining）

HTTP/1.1 还支持**管道化**：在持久连接上，客户端可以不等响应就连续发多个请求，服务器按顺序返回。但实际中很少用，因为：

1. 要求服务器严格按序响应，一个慢请求会阻塞后面（队头阻塞）。
2. 中间代理支持不一致，容易出问题。

所以管道化基本被废弃，真正解决问题的是 HTTP/2 的多路复用（第 4 章）。

### 队头阻塞（Head-of-Line Blocking）

HTTP/1.1 即使开 keep-alive，同一个连接上请求也是**串行响应**的——前面的没返回，后面的就得等。浏览器为了缓解，会对同一域名开 6 个并发连接，但这是治标不治本。HTTP/2 用二进制分帧 + 多路复用真正解决。

## 十、小结与心智模型

把这一章浓缩成一句话：**HTTP 是一个「客户端发请求（方法+URL+头+体）→ 服务器回响应（状态码+头+体）」的无状态、可扩展的请求-响应协议**。

记住这张全景图：

\`\`\`
请求 = 请求行 + 请求头 + 空行 + 请求体
响应 = 状态行 + 响应头 + 空行 + 响应体
\`\`\`

后续章节都建立在这个模型之上：HTTPS 给它加密，Cookie/Token 给它加状态，HTTP/2 给它提速，内容协商决定它的 body 长什么样，标准库让你用 Python 操控它。`,
  },

  // ============================================================
  // 第 2 章：HTTPS 与加密基础
  // ============================================================
  {
    id: "pyweb2-https-security",
    group: "HTTP 基础",
    icon: "🔒",
    title: "HTTPS 与加密基础",
    content: `# HTTPS 与加密基础

## 一、为什么需要 HTTPS

HTTP 是明文传输的：你在咖啡店连 WiFi，输入的密码、看的页面，理论上路由器、运营商、中间任何人都能看到甚至篡改。HTTPS = HTTP over TLS/SSL，在 HTTP 和 TCP 之间加一层**加密隧道**，解决三个问题：

1. **机密性（Confidentiality）**：数据被加密，第三方看不懂。
2. **完整性（Integrity）**：数据被改了能被发现（MAC/AEAD）。
3. **身份认证（Authentication）**：确认你连的真是 example.com，不是钓鱼站点。

### 生活比喻：寄明信片 vs 密封信

- HTTP 像寄明信片：邮递员、分拣员都能看到内容。
- HTTPS 像把信装进带火漆印的信封：内容看不到，火漆印被破坏就知道被拆过，火漆上的纹章能证明是哪家寄的。

## 二、对称加密 vs 非对称加密

要理解 TLS，先搞清两种加密。

### 对称加密

加密和解密用**同一把密钥**。代表算法：AES、ChaCha20。

- 优点：速度快，适合加密大量数据。
- 缺点：密钥怎么安全地告诉对方？密钥泄露就全完了。

### 非对称加密

有一对密钥：**公钥（public key）** 和 **私钥（private key）**。公钥加密只能私钥解密，私钥签名可被公钥验证。代表算法：RSA、ECC。

- 公钥加密 → 私钥解密：用于保密。
- 私钥签名 → 公钥验证：用于认证。
- 优点：公钥可以随便发，不用怕泄露。
- 缺点：慢，不适合加密大量数据。

### TLS 怎么配合用

TLS 用「**非对称加密协商出一个对称密钥，之后用对称加密传数据**」——既安全又快。这就是握手的核心目的。

| 类型 | 密钥 | 速度 | 用途 |
| --- | --- | --- | --- |
| 对称 | 一把共享密钥 | 快 | 加密业务数据 |
| 非对称 | 公钥/私钥对 | 慢 | 协商对称密钥、签名 |

### demo：用 Python 体验两种加密

\`\`\`python
# 对称加密：用 cryptography 库的 AES（需要 pip install cryptography）
from cryptography.fernet import Fernet

# 生成一把对称密钥（这把密钥双方都要持有）
key = Fernet.generate_key()
cipher = Fernet(key)

# 加密解密都用同一把 key
ct = cipher.encrypt(b"hello world")   # 密文
pt = cipher.decrypt(ct)               # 解回明文
print("对称解密结果：", pt)            # b"hello world"
\`\`\`

\`\`\`python
# 非对称加密：RSA
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# 生成公私钥对（私钥自己留着，公钥可以公开）
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# 用公钥加密，只有私钥能解
msg = b"secret"
ct = public_key.encrypt(
    msg,
    padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),
                 algorithm=hashes.SHA256(), label=None),
)
pt = private_key.decrypt(
    ct,
    padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),
                 algorithm=hashes.SHA256(), label=None),
)
print("非对称解密结果：", pt)
\`\`\`

## 三、TLS 握手过程（简化版）

HTTPS 比 HTTP 多一次 TLS 握手，发生在 TCP 三次握手之后、HTTP 通信之前。TLS 1.2 典型流程：

\`\`\`
Client                                          Server
  |                                                |
  | ---- ClientHello ----------------------------> |  告诉服务器：我支持的 TLS 版本、
  |       (版本, 随机数1, 支持的加密套件)           |       加密套件、一个随机数
  |                                                |
  | <--- ServerHello ---------------------------- |  服务器选定：用哪个版本/套件、
  |       (版本, 随机数2, 选定的加密套件)           |       再给一个随机数
  | <--- Certificate ---------------------------- |  服务器发证书（含公钥）
  | <--- ServerHelloDone ------------------------ |
  |                                                |
  |  生成 pre-master，用服务器公钥加密              |
  | ---- ClientKeyExchange ---------------------> |  发送加密后的 pre-master
  | ---- ChangeCipherSpec ---------------------> |  「我要开始用加密了」
  | ---- Finished -----------------------------> |  加密的握手摘要（验证没被篡改）
  |                                                |
  | <--- ChangeCipherSpec ------------------------ |
  | <--- Finished -------------------------------- |
  |                                                |
  | ===== 双方用三个随机数算出对称密钥，开始加密通信 ===== |
\`\`\`

关键点：

1. 双方各出随机数，客户端再生成 pre-master，三者凑出**对称密钥**——谁都不能单方面决定。
2. pre-master 用服务器证书里的公钥加密，只有持私钥的服务器能解开。
3. Finished 消息是对整个握手的摘要加密，任何中间篡改都会让摘要对不上。

> TLS 1.3 简化到 1 个 RTT（甚至 0-RTT），并废弃了 RSA 密钥交换（只用 ECDHE，保证前向安全）。

## 四、证书体系

### CA（证书颁发机构）

浏览器凭什么信服务器给的公钥？因为公钥被**CA**签名了。CA 是受信任的第三方，它的公钥预装在操作系统/浏览器里（根证书）。证书链：根 CA → 中间 CA → 你的服务器证书。

### 证书里有什么

- 域名（CN / SAN）
- 公钥
- 颁发者（Issuer）
- 有效期
- CA 的签名

### 自签名证书

自己生成公私钥，自己给自己签名。浏览器不认（因为不在信任链里），会报警告。仅适合内网/开发环境。

\`\`\`bash
# 用 openssl 生成自签名证书（有效期 365 天）
openssl req -x509 -newkey rsa:2048 -nodes \\
  -keyout server.key -out server.crt -days 365 \\
  -subj "/CN=localhost"
\`\`\`

### demo：Python 起一个 HTTPS 服务（自签名）

\`\`\`python
# 用标准库起 HTTPS 服务，需要证书和私钥文件
import http.server, ssl

# 创建一个简单的 Handler
handler = http.server.SimpleHTTPRequestHandler

# 用 ssl 把 HTTP 服务包成 HTTPS
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain(certfile="server.crt", keyfile="server.key")

httpd = http.server.HTTPServer(("0.0.0.0", 8443), handler)
httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
print("HTTPS 服务在 https://localhost:8443")
httpd.serve_forever()
\`\`\`

访问时浏览器会警告，因为自签名证书不在信任链。点「继续访问」即可（开发环境）。

### Let's Encrypt：免费自动签证书

生产环境用 Let's Encrypt 免费签发正规证书，配合 certbot 自动续期：

\`\`\`bash
# 安装 certbot 后（以 nginx 为例）
sudo certbot --nginx -d example.com -d www.example.com
# 它会自动改 nginx 配置 + 申请证书 + 设置定时续期
\`\`\`

## 五、Python 中使用 HTTPS

### requests 默认验证证书

\`\`\`python
import requests

# 默认 verify=True，会校验证书和主机名
r = requests.get("https://www.example.com/")
print(r.status_code)  # 200

# 自签名/内网证书：指定 CA 文件
r = requests.get("https://localhost:8443/", verify="server.crt")

# 关闭验证（仅调试用！生产绝对不要，等于裸奔）
# requests.get("https://localhost:8443/", verify=False)
\`\`\`

> \`verify=False\` 会让 HTTPS 退回到「加密但不认证」，中间人仍可能得手。永远只在调试时用，且要明白风险。

### ssl 模块：手动控制 TLS

\`\`\`python
import ssl, socket

# 创建客户端 TLS 上下文
ctx = ssl.create_default_context()  # 默认会校验证书和主机名

# 用 TLS 包装一个原始 socket，连接 HTTPS 服务
raw = socket.create_connection(("www.example.com", 443))
ssock = ctx.wrap_socket(raw, server_hostname="www.example.com")

# 握手完成后，看一下协商出的协议和加密套件
print("协议版本：", ssock.version())        # TLSv1.3
print("加密套件：", ssock.cipher())        # 套件名、强度等

# 在加密通道上发一个 HTTP 请求
ssock.sendall(b"GET / HTTP/1.1\\r\\nHost: www.example.com\\r\\n\\r\\n")
data = ssock.recv(4096)
print(data[:200])  # HTTP 响应开头
ssock.close()
\`\`\`

### demo：导出服务器证书并查看

\`\`\`python
import ssl

# 拿到服务器证书（DER 字节）
cert_der = ssl.get_server_certificate(("www.example.com", 443))
print(cert_der[:200])  # PEM 格式证书文本
\`\`\`

## 六、常见安全问题

### 中间人攻击（MITM）

攻击者夹在客户端和服务器之间，冒充服务器和你通信，再冒充你和服务器通信。HTTPS 通过**证书校验**防 MITM：攻击者拿不到对应域名的合法私钥，伪造的证书通不过校验。

\`\`\`bash
# 抓包工具（mitmproxy/Charles）原理就是中间人：
# 它给你一个它自己签的证书，再和真正的服务器走 HTTPS。
# 如果你信任了它的根证书，就能解密；不信任就会报错。
\`\`\`

### 降级攻击

攻击者逼迫双方降级到弱算法/旧版本。TLS 用 **downgrade protection**（在 Finished 里带版本信息）和弃用旧版本来防御。TLS 1.3 直接不支持弱套件。

### demo：观察证书校验失败的报错

\`\`\`python
import requests

# 故意用一个域名访问另一个域名的证书（或访问过期证书）
try:
    requests.get("https://expired.badssl.com/", timeout=5)
except requests.exceptions.SSLError as e:
    print("证书校验失败：", e)
\`\`\`

## 七、HSTS、CSP 等安全头

光有 HTTPS 还不够，浏览器要「记得」用 HTTPS，否则可能被降级回 HTTP。这些靠**安全响应头**实现。

| 头 | 作用 |
| --- | --- |
| Strict-Transport-Security (HSTS) | 强制浏览器后续只用 HTTPS 访问该站点 |
| Content-Security-Policy (CSP) | 限制页面能加载哪些资源，防 XSS |
| X-Content-Type-Options | nosniff，禁止浏览器猜 MIME |
| X-Frame-Options | 防被 iframe 嵌套（防点击劫持） |
| Referrer-Policy | 控制 Referer 泄露 |

### HSTS 详解

\`\`\`http
Strict-Transport-Security: max-age=31536000; includeSubDomains
\`\`\`

- max-age：浏览器记住「只用 HTTPS」的秒数（这里一年）。
- includeSubDomains：子域名也强制。

注意：第一次访问仍是 HTTP，存在被劫持窗口。要彻底解决需申请加入浏览器的 HSTS Preload List。

### CSP 详解

\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
\`\`\`

- default-src 'self'：默认只允许加载本站资源。
- script-src：脚本额外允许 cdn.example.com。
- 防 XSS：注入的恶意脚本域不在白名单，浏览器拒执行。

### demo：在 Flask 里设置安全头

\`\`\`python
from flask import Flask

app = Flask(__name__)

@app.after_request
def set_security_headers(resp):
    # 每个响应都加上安全头
    resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Content-Security-Policy"] = "default-src 'self'"
    return resp

@app.route("/")
def index():
    return "hello secure"
\`\`\`

## 八、小结

| 知识点 | 一句话 |
| --- | --- |
| HTTPS | HTTP + TLS，加密+认证+防篡改 |
| 对称加密 | 一把密钥，快，用于业务数据 |
| 非对称加密 | 公私钥对，慢，用于协商密钥/签名 |
| 证书 | CA 给公钥背书，浏览器信 CA |
| HSTS | 强制浏览器走 HTTPS |
| CSP | 限制资源来源，防 XSS |

核心心智模型：**TLS 握手用非对称加密安全地协商出对称密钥 → 之后用对称密钥加密所有 HTTP 数据 → 证书保证公钥可信**。`,
  },

  // ============================================================
  // 第 3 章：Cookie、Session 与 Token
  // ============================================================
  {
    id: "pyweb2-cookie-session",
    group: "HTTP 基础",
    icon: "🍪",
    title: "Cookie、Session 与 Token",
    content: `# Cookie、Session 与 Token

HTTP 无状态，但业务需要「记住用户」（登录态、购物车、偏好）。这一章讲清三种主流方案：Cookie、Session、Token，以及它们的取舍。

## 一、Cookie 机制详解

Cookie 是**服务器发给浏览器、由浏览器保存、后续请求自动带回**的小数据。它解决了「客户端怎么存状态」的问题。

### 工作流程

1. 服务器在响应里用 \`Set-Cookie\` 头下发 Cookie。
2. 浏览器按规则保存（域名、路径、有效期等）。
3. 之后访问**同域同路径**时，浏览器自动在 \`Cookie\` 请求头里带上。

\`\`\`http
# 响应：服务器种 Cookie
HTTP/1.1 200 OK
Set-Cookie: sid=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: lang=zh-CN; Max-Age=86400

# 后续请求：浏览器自动带回
GET /profile HTTP/1.1
Cookie: sid=abc123; lang=zh-CN
\`\`\`

### Cookie 的关键属性

| 属性 | 作用 | 示例 |
| --- | --- | --- |
| Name=Value | 键值对 | sid=abc123 |
| Domain | 哪些域名可见 | Domain=example.com（含子域） |
| Path | 哪些路径可见 | Path=/order |
| Expires / Max-Age | 过期时间 | Max-Age=3600（1 小时） |
| HttpOnly | JS 读不到（防 XSS 偷 Cookie） | HttpOnly |
| Secure | 只走 HTTPS | Secure |
| SameSite | 跨站发送策略 | Strict / Lax / None |

### 生活比喻

Cookie 像餐厅给你的「会员卡」：卡上写着卡号（sid）、只能在某分店用（Domain/Path）、有效期一年（Max-Age）、不能复印（HttpOnly 防偷）、只能走正门（Secure）、跨店不能用（SameSite）。

### SameSite 三种值

| 值 | 行为 |
| --- | --- |
| Strict | 完全不跨站发送（最严，但体验差：从百度点进你站，Cookie 不带） |
| Lax | 顶层导航的 GET 会带（默认值，平衡安全和体验） |
| None | 跨站也带（必须同时 Secure，否则被拒） |

### demo：用 Python 手动构造 Set-Cookie

\`\`\`python
from http.cookies import SimpleCookie

# SimpleCookie 可以方便地构造/解析 Cookie 字符串
c = SimpleCookie()
c["sid"] = "abc123"
c["sid"]["path"] = "/"
c["sid"]["httponly"] = True
c["sid"]["secure"] = True
c["sid"]["samesite"] = "Lax"
c["sid"]["max-age"] = 3600

# 输出形如 Set-Cookie 头的内容
for morsel in c.values():
    print(morsel.OutputString())
    # sid=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
\`\`\`

### demo：用 http.cookiejar 管理客户端 Cookie

\`\`\`python
import http.cookiejar, urllib.request

# 创建一个 CookieJar，用来保存 Cookie
jar = http.cookiejar.CookieJar()
# 给 opener 装上 HTTPCookieProcessor，它会自动处理 Set-Cookie 和回带
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

# 第一次请求：服务器 Set-Cookie，jar 会自动保存
opener.open("https://httpbin.org/cookies/set?sid=abc123")
print("保存的 Cookie：", [c.name + "=" + c.value for c in jar])

# 第二次请求：opener 自动把 Cookie 带回去
resp = opener.open("https://httpbin.org/cookies")
print("服务器回显：", resp.read().decode())
\`\`\`

## 二、Session 原理

Cookie 把状态存在**客户端**有风险（被篡改、被偷）。Session 反过来：**状态存在服务器**，客户端只持有一个不透明的 Session ID。

### 工作流程

1. 用户登录，服务器创建一个 Session 对象（存用户信息），分配一个随机 Session ID。
2. 把 Session ID 通过 Cookie 下发给浏览器。
3. 后续请求浏览器带回 Session ID，服务器用它查到对应 Session，恢复用户上下文。
4. 用户登出，服务器删除该 Session。

### 生活比喻

Session 像酒店房卡：卡上只有房间号（Session ID），你的行李（状态）在房间里（服务器）。卡丢了补一张，行李还在；但卡被偷了，别人能进你房间——所以 Session ID 要够随机、够长。

### demo：用字典模拟服务端 Session 存储

\`\`\`python
import secrets, time

# 模拟服务端的 Session 存储（生产用 Redis 等共享存储）
SESSIONS = {}
SESSION_TTL = 3600  # 1 小时过期

def create_session(user_id):
    # 用 secrets 生成不可猜测的随机 ID（不要用 random！）
    sid = secrets.token_urlsafe(32)
    SESSIONS[sid] = {
        "user_id": user_id,
        "login_at": time.time(),
    }
    return sid

def get_session(sid):
    if not sid:
        return None
    s = SESSIONS.get(sid)
    if not s:
        return None
    # 检查是否过期
    if time.time() - s["login_at"] > SESSION_TTL:
        SESSIONS.pop(sid, None)
        return None
    return s

def destroy_session(sid):
    SESSIONS.pop(sid, None)

# 使用
sid = create_session(1001)
print("创建 session：", sid)
print("读取：", get_session(sid))
destroy_session(sid)
\`\`\`

### Session 的存储位置

| 存储 | 适用场景 | 特点 |
| --- | --- | --- |
| 内存（进程内） | 单机小应用 | 重启丢失，多机不同步 |
| Redis / Memcached | 多机部署主流 | 快、可共享、可设过期 |
| 数据库 | 需要持久化 | 慢，一般不用 |
| 签名 Cookie（Cookie Session） | 无服务端存储 | 数据在客户端，签名防篡改 |

### 多机 Session 问题

部署多台服务器时，请求可能落到不同机器，内存 Session 不通用。解决：

1. **Session 共享**：统一存 Redis（最常用）。
2. **会话粘性（Sticky Session）**：负载均衡把同一用户固定打到同一台（简单但故障时丢 Session）。
3. **JWT/Token**：干脆无服务端存储（见下文）。

## 三、Token 机制（JWT）

Token 把「凭证」直接发给客户端，服务器**不存状态**，每次靠验证 Token 的签名来确认身份。最常见的是 **JWT（JSON Web Token）**。

### JWT 结构

JWT 由三段用 \`.\` 连接：\`Header.Payload.Signature\`

- **Header**：算法和类型，如 \`{"alg":"HS256","typ":"JWT"}\`，Base64URL 编码。
- **Payload**：声明（claims），如用户 ID、过期时间。**注意：Payload 只编码不加密，别放密码！**
- **Signature**：对前两段的签名，用服务器的密钥算出，防篡改。

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoxMDAxLCJleHAiOjE3MDB9.s7fK...
\`\`\`

### 工作流程

1. 用户登录成功，服务器签发 JWT 给客户端。
2. 客户端把 JWT 存起来（localStorage 或 Cookie）。
3. 后续请求把 JWT 放在 \`Authorization: Bearer <token>\` 头里。
4. 服务器用密钥验证签名 + 检查过期，通过则信任 Payload 里的用户信息。

### demo：签发和验证 JWT（PyJWT 库）

\`\`\`python
# pip install pyjwt
import jwt, time

SECRET = "change-me-to-a-long-random-secret"  # 服务器私钥，绝对不能泄露

def issue_token(user_id):
    # payload 里放业务需要的声明 + 过期时间
    payload = {
        "user_id": user_id,
        "iat": int(time.time()),          # 签发时间
        "exp": int(time.time()) + 3600,   # 过期时间（1 小时）
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token):
    try:
        # 验证签名 + 自动检查 exp 过期
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token 已过期")
        return None
    except jwt.InvalidTokenError:
        print("Token 无效")
        return None

# 使用
token = issue_token(1001)
print("签发：", token)
print("验证：", verify_token(token))
\`\`\`

### JWT 的优缺点

| 优点 | 缺点 |
| --- | --- |
| 无状态，服务端不存，易扩展 | 签发后无法主动失效（除非维护黑名单） |
| 自包含，跨服务方便 | Payload 不加密，不能放敏感数据 |
| 天然适合移动端/前后端分离 | 续期麻烦（常用 access + refresh token 方案） |
| 跨域友好（放 header 即可） | 密钥泄露后果严重 |

## 四、Cookie vs Session vs Token 对比

| 维度 | Cookie | Session | Token/JWT |
| --- | --- | --- | --- |
| 状态存储 | 客户端 | 服务端 | 客户端（签名防篡改） |
| 服务端是否存 | 否（如果只当存储） | 是 | 否 |
| 跨域 | 受同源策略限制 | 同 Cookie | 友好（放 header） |
| 失效控制 | 改 Cookie 即可 | 删服务端记录 | 难（需黑名单） |
| 安全 | 注意 HttpOnly/Secure | Session ID 防泄露 | 签名密钥防泄露 |
| 移动端 | 不便 | 不便 | 友好 |
| 典型场景 | 存偏好、追踪 | 传统 Web 登录 | API、前后端分离、移动端 |

> 实际中常组合用：**Cookie 传 Session ID** 或 **Cookie 传 JWT**。Cookie 是载体，Session/Token 是机制。

## 五、跨域 Cookie 问题

### 同源策略

浏览器规定：脚本默认只能访问**同源**（协议+域名+端口都相同）的资源。跨域请求默认**不携带 Cookie**，即使带也需要双方配置。

### 跨域带 Cookie 的条件

1. 前端请求设置 \`credentials: 'include'\`（fetch）或 \`withCredentials: true\`（XHR）。
2. 后端响应头 \`Access-Control-Allow-Credentials: true\`。
3. \`Access-Control-Allow-Origin\` **不能是 \`\*\`**，必须是具体域名。
4. Cookie 的 \`SameSite=None; Secure\`（跨站必须）。

### demo：Flask 处理跨域带 Cookie

\`\`\`python
from flask import Flask, request, make_response

app = Flask(__name__)

@app.after_request
def cors(resp):
    # 允许前端跨域并带 Cookie：Origin 必须写具体值，不能 *
    origin = request.headers.get("Origin", "")
    resp.headers["Access-Control-Allow-Origin"] = origin
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    # 允许前端带回 Cookie 所需的头
    resp.headers["Vary"] = "Origin"
    return resp

@app.route("/login", methods=["POST"])
def login():
    resp = make_response("ok")
    # 跨站 Cookie：SameSite=None 必须配 Secure
    resp.set_cookie("sid", "abc123", samesite="None", secure=True, httponly=True)
    return resp

@app.route("/me")
def me():
    sid = request.cookies.get("sid")
    return {"sid": sid}
\`\`\`

\`\`\`javascript
// 前端 fetch 必须显式带凭证
fetch("https://api.example.com/login", {
  method: "POST",
  credentials: "include",  // 关键：跨域也要带 Cookie
});
\`\`\`

## 六、综合 demo：一个最小登录流程

下面用 Flask 实现一个完整的小登录（Session 版），把概念串起来：

\`\`\`python
from flask import Flask, request, session, redirect, jsonify
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # session 加密用，必须设
USERS = {"tom": "123456"}  # 演示用，生产要存哈希

@app.route("/login", methods=["POST"])
def login():
    u = request.json.get("username")
    p = request.json.get("password")
    if USERS.get(u) == p:
        # Flask session 默认用签名 Cookie，把 user 存进去
        session["user"] = u
        return {"msg": "登录成功"}
    return {"msg": "用户名或密码错"}, 401

@app.route("/me")
def me():
    # 中间件式：检查 session
    if "user" not in session:
        return {"msg": "未登录"}, 401
    return {"user": session["user"]}

@app.route("/logout")
def logout():
    session.pop("user", None)
    return {"msg": "已登出"}

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

## 七、小结

- **Cookie** 是客户端存储和传输状态的载体，靠各种属性保安全。
- **Session** 把状态放服务器，客户端只拿 ID，更安全但要服务端存储。
- **Token/JWT** 无服务端存储，适合分布式和移动端，但失效控制弱。
- 选型：传统 Web 用 Session+Cookie；前后端分离/API 用 JWT；偏好数据用 Cookie。
- 跨域带 Cookie 需要 \`credentials\` + \`Allow-Credentials\` + 具体 Origin + \`SameSite=None;Secure\`。`,
  },

  // ============================================================
  // 第 4 章：HTTP/1.1 vs HTTP/2 vs HTTP/3
  // ============================================================
  {
    id: "pyweb2-http-evolution",
    group: "HTTP 基础",
    icon: "📈",
    title: "HTTP/1.1 vs HTTP/2 vs HTTP/3",
    content: `# HTTP/1.1 vs HTTP/2 vs HTTP/3

HTTP 协议一路演进，核心动力是**更快、更省资源、更稳**。这一章把三个版本的差异讲透，并告诉你怎么用上。

## 一、演进概览

| 版本 | 年份 | 关键特性 | 传输层 |
| --- | --- | --- | --- |
| HTTP/0.9 | 1991 | 只 GET，无头，纯文本 | TCP |
| HTTP/1.0 | 1996 | 加头、状态码、多种 Content-Type | TCP（短连接为主） |
| HTTP/1.1 | 1997 | 持久连接、Host 头、管道化、分块传输 | TCP |
| HTTP/2 | 2015 | 二进制分帧、多路复用、头部压缩、服务端推送 | TCP |
| HTTP/3 | 2022 | QUIC（UDP）、0-RTT、连接迁移 | UDP |

### HTTP/0.9 → 1.0

- 0.9 极简：只有 \`GET /index.html\`，响应直接是 HTML，没有状态码、没有头。
- 1.0 引入请求/响应头、状态码、多种 Content-Type，Web 才真正「丰富」起来。但默认短连接，性能差。

### HTTP/1.1（至今最普遍）

关键改进：

1. **持久连接（keep-alive）默认开启**：复用 TCP，省握手。
2. **Host 头必填**：一台服务器能托管多个域名（虚拟主机）。
3. **管道化（pipelining）**：允许连续发请求（但实际很少用，见第 1 章）。
4. **分块传输（Transfer-Encoding: chunked）**：不知道总长度也能边算边发。
5. **范围请求（Range）**：断点续传。

但 HTTP/1.1 的根本毛病是**队头阻塞（HOL blocking）**：同一连接上请求必须按序响应，一个慢请求卡住后面所有。浏览器只能靠「同域开 6 个连接」缓解。

## 二、HTTP/2 特性

HTTP/2 把 HTTP 语义保留，但传输格式从文本改成**二进制分帧**，带来质变。

### 2.1 二进制分帧

HTTP/2 把每个请求/响应拆成一个个**帧（frame）**，每个帧带一个**流 ID（stream id）** 标识属于哪个请求。多个流的帧可以交错发送，接收端再按流 ID 重组。

### 2.2 多路复用（Multiplexing）

**一个 TCP 连接上可以同时跑多个请求/响应，互不阻塞。** 这是 HTTP/2 最大的改进——彻底解决 HTTP 层的队头阻塞。

### 生活比喻

- HTTP/1.1 持久连接像**单车道**：一辆车慢，后面全堵。
- HTTP/2 多路复用像**多车道高速**：多辆车并排跑，互不影响。

### 2.3 头部压缩（HPACK）

HTTP/1.1 每个请求都重复带一堆头（User-Agent、Cookie 可能很大）。HTTP/2 用 **HPACK** 算法：维护一张静态表 + 动态表，重复的头只发索引，体积大幅缩小。

### 2.4 服务端推送（Server Push）

服务器可以「主动」把客户端还没要的资源推过来。比如请求 index.html 时，服务器顺手把 style.css、app.js 推过来，省去客户端再请求的往返。

> 注意：Server Push 在实践中效果一般（客户端可能已缓存），Chrome 后来移除了对它的支持，HTTP/3 也不再强调。了解即可。

### demo：观察 HTTP/2 多路复用

\`\`\`python
# 用 httpx 走 HTTP/2，并发多个请求复用同一连接
# pip install httpx[http2]
import httpx, asyncio

async def main():
    # http2=True 启用 HTTP/2（需要 h2 库）
    async with httpx.AsyncClient(http2=True) as client:
        # 在同一个连接上并发 5 个请求
        urls = [f"https://httpbin.org/anything?i={i}" for i in range(5)]
        results = await asyncio.gather(*[client.get(u) for u in urls])
        for r in results:
            # httpx 的 response 可查看用的协议版本
            print(r.url, "协议:", r.http_version)

asyncio.run(main())
# 输出里 http_version 会是 "HTTP/2"
\`\`\`

## 三、HTTP/3 与 QUIC

### 为什么要有 HTTP/3

HTTP/2 解决了 HTTP 层的队头阻塞，但**TCP 层还有**：一个 TCP 包丢了，TCP 要等重传，整条连接上所有 HTTP/2 流都被阻塞。Google 实测发现这很影响弱网体验，于是搞了 **QUIC**，HTTP/3 跑在 QUIC 上。

### QUIC 是什么

QUIC（Quick UDP Internet Connections）是**基于 UDP** 的可靠传输协议，把 TLS 1.3 握手和传输合并：

1. **基于 UDP**：避开 TCP 的队头阻塞——每个 QUIC 流独立重传，丢一个包不阻塞别的流。
2. **集成 TLS 1.3**：握手和加密合并，1-RTT 建连，甚至 0-RTT 恢复。
3. **连接迁移**：手机从 WiFi 切 4G，IP 变了，QUIC 靠 Connection ID 仍能保持连接不断（TCP 做不到）。

### HTTP/3 的收益

- 首次连接 1-RTT（TLS 1.3），恢复连接 0-RTT，首屏更快。
- 弱网下丢包不再全连接阻塞。
- 网络切换不断连。

### demo：检测站点是否支持 HTTP/3

\`\`\`bash
# curl 较新版本支持 --http3
curl -I --http3 https://www.cloudflare.com/

# 看 alt-svc 头：服务器用它宣告支持 HTTP/3
curl -sI https://www.google.com/ | grep -i alt-svc
# 形如: alt-svc: h3=":443"; ma=86400
\`\`\`

\`\`\`python
# Python 里 HTTP/3 支持还不成熟，目前主流还是 HTTP/2
# 可以先用 httpx 看协议版本
import httpx
r = httpx.get("https://www.cloudflare.com/", http2=True)
print(r.http_version)  # 多数大站能拿到 HTTP/2，HTTP/3 需专门库
\`\`\`

## 四、各版本对比表

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
| --- | --- | --- | --- |
| 传输层 | TCP | TCP | UDP（QUIC） |
| 报文格式 | 文本 | 二进制分帧 | 二进制分帧 |
| 多路复用 | ❌ | ✅ | ✅ |
| 队头阻塞 | HTTP 层 + TCP 层 | 仅 TCP 层 | 无 |
| 头部压缩 | ❌ | HPACK | QPACK |
| 加密 | 可选（HTTPS） | 实际要求 TLS | 强制 TLS 1.3 |
| 建连 RTT | 2（TCP）+ 2（TLS） | 同 1.1 | 1（甚至 0） |
| 连接迁移 | ❌ | ❌ | ✅ |
| 服务端推送 | ❌ | ✅（已弱化） | 不强调 |

## 五、如何升级到 HTTP/2

升级 HTTP/2 不用改业务代码——它是传输层的事，由 Web 服务器/反代完成。客户端（浏览器）和服务器在 TLS 握手时通过 **ALPN** 协商是否用 HTTP/2。

### Nginx 配置示例

\`\`\`nginx
server {
    listen 443 ssl http2;          # 关键：加 http2
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 推荐开启 ALPN（Nginx + OpenSSL 1.0.2+ 默认支持）
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:8000;   # 反代到你的 Python 后端
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
\`\`\`

改完 \`nginx -t\` 测试 + \`nginx -s reload\`。验证：

\`\`\`bash
curl -I --http2 https://example.com/
# 状态行会显示 HTTP/2 200
\`\`\`

> 你的 Python 后端（Flask/Django/FastAPI）通常只跑 HTTP/1.1，对外 HTTP/2 由前面的 Nginx/CDN 负责。这是常见的「前端 HTTP/2，后端 HTTP/1.1」架构。

## 六、Python 中的 HTTP/2 支持

Python 标准库目前只支持 HTTP/1.1，要 HTTP/2 需第三方库。

### httpx（推荐）

\`\`\`python
# pip install httpx[http2]
import httpx

# 同步
with httpx.Client(http2=True) as c:
    r = c.get("https://httpbin.org/get")
    print(r.http_version)  # HTTP/2

# 异步
import asyncio
async def main():
    async with httpx.AsyncClient(http2=True) as c:
        r = await c.get("https://httpbin.org/get")
        print(r.http_version)
asyncio.run(main())
\`\`\`

### hyper（底层）

\`\`\`python
# pip install hyper
from hyper import HTTP20Connection

# 直接发起 HTTP/2 请求
conn = HTTP20Connection("httpbin.org", secure=True)
conn.request("GET", "/get")
resp = conn.getresponse()
print(resp.status)
print(resp.read().decode())
\`\`\`

### 服务端 HTTP/2

Python 服务端原生 HTTP/2 支持有限，一般靠 Nginx 反代。也有 hypercorn、granian 等 ASGI 服务器支持 HTTP/2。

## 七、实战注意点

1. **HTTP/2 不需要域名分片**：HTTP/1.1 时代为绕开 6 连接限制，把图片分散到 img1/img2 域名；HTTP/2 一个连接就够，分片反而有害（多连接多开销）。
2. **合并小资源不再总是对的**：HTTP/1.1 鼓励合并文件减少请求数；HTTP/2 多路复用后，小文件独立缓存更好。
3. **HTTP/3 需要客户端 + 服务器 + 网络都支持**：很多企业防火墙对 UDP 不友好，HTTP/3 可能被拦，会回退到 HTTP/2。
4. **不要为了「新」而新**：先确保 TLS、HTTP/2 配好，收益已很大；HTTP/3 视场景再上。

## 八、HTTP/2 进阶：二进制分帧细节

理解 HTTP/2 的「快」，必须看懂帧（Frame）和流（Stream）。

### 帧（Frame）

HTTP/2 通信的最小单位。每个帧有 9 字节的帧头：

- 3 字节：帧长度（payload 字节数）。
- 1 字节：帧类型（DATA、HEADERS、PRIORITY、RST_STREAM、SETTINGS、PING、GOAWAY 等）。
- 1 字节：标志位（如 END_STREAM 表示流结束、END_HEADERS 表示头部帧发完）。
- 4 字节：流 ID（标识属于哪个请求/响应；客户端发起的流 ID 为奇数，服务器推送的为偶数）。

之后才是 payload。一个 HTTP 请求/响应被拆成多个帧，比如一个请求 = HEADERS 帧 + DATA 帧（可能多个）。

### 流（Stream）

流是同一请求/响应在连接内的「虚拟通道」，靠流 ID 区分。多个流的帧可以在同一 TCP 连接上交错传输：

\`\`\`
连接上字节的实际顺序（示意）：
[HEADERS stream=1][HEADERS stream=3][DATA stream=1][DATA stream=3][DATA stream=1]...
\`\`\`

接收端按流 ID 把帧重新拼成各自的请求/响应。这就是**多路复用**的本质——一个连接并行多个流，互不等待。

### 流的优先级

HTTP/2 早期用「流依赖树 + 权重」表达优先级（HTML 比图片重要等）。HTTP/2 后来引入更简单的 \`PRIORITY_UPDATE\` 帧。优先级只是「建议」，服务器可自行决定调度。

### demo：观察帧类型（概念性）

\`\`\`bash
# 用 nghttp 工具可以看 HTTP/2 的帧级交互
nghttp -v https://httpbin.org/get
# 输出里能看到 [HEADERS]、[DATA] 等帧，以及 stream id
\`\`\`

## 九、HPACK 头部压缩细节

HTTP/1.1 每个请求都把 User-Agent、Accept、Cookie 等头部原样发一遍，重复且浪费。HTTP/2 的 HPACK 把体积压到原来的几分之一。

### HPACK 三件套

1. **静态表**：预定义 61 个常见头（如 \`2: :method GET\`、\`4: :path /\`），发索引即可。
2. **动态表**：双方维护一个共享的、按需增长的表，把本次出现的头存进去，下次发索引。
3. **Huffman 编码**：对字符串值再做哈夫曼压缩。

### 伪头（pseudo-header）

HTTP/2 把请求行拆成伪头，前缀 \`:\`：

\`\`\`
:method: GET
:path: /get
:scheme: https
:authority: httpbin.org   # 相当于 HTTP/1.1 的 Host
\`\`\`

伪头和普通头一起被 HPACK 压缩。

### 举例：压缩效果

假设 Cookie 头有 500 字节，连续 10 个请求都带它：

- HTTP/1.1：10 × 500 = 5000 字节，每次都传。
- HTTP/2：第一次 500 字节存进动态表，后续 9 次只发索引（几字节），总计 ~600 字节。

## 十、HTTP/3 与 QUIC 深入

### 0-RTT 是怎么做到的

TLS 1.3 支持会话恢复：客户端记住之前握手得到的密钥材料（PSK），下次连接时在第一个包里就带上加密的应用数据，服务器验证 PSK 后直接处理，免去一个 RTT。QUIC 把这能力发挥到极致——首包就能带业务数据。

> 0-RTT 有重放攻击风险（攻击者重放第一个包）。所以 0-RTT 只能用于幂等请求（如 GET），不能用于会改状态的 POST。

### 连接迁移

TCP 用四元组（源 IP、源端口、目的 IP、目的端口）标识连接。手机从 WiFi 切到 4G，源 IP 变了，TCP 连接直接断，得重建。QUIC 用 **Connection ID** 标识连接，IP 变了只要 CID 不变，连接继续——视频通话、长连接不受影响。

### QUIC 流级独立重传

HTTP/2 在 TCP 上，TCP 丢一个包，所有流都得等重传（TCP 层队头阻塞）。QUIC 每个流独立编号、独立确认，丢的包只影响对应流，别的流继续跑。

### demo：用 curl 看 QUIC/HTTP/3 握手

\`\`\`bash
# 较新 curl 带 --http3，并加 -v 看握手
curl -v --http3 https://www.cloudflare.com/ 2>&1 | head -40
# 能看到 "HTTP/3 200" 以及 QUIC 相关日志
\`\`\`

## 十一、可观测性：怎么看用的哪个版本

### 浏览器开发者工具

打开 Network 面板，看请求的 Protocol 列：\`h2\` = HTTP/2，\`h3\` = HTTP/3，\`http/1.1\` = HTTP/1.1。

### 命令行

\`\`\`bash
# curl -I 看状态行里的协议版本
curl -I --http2 https://example.com/   # HTTP/2 200
curl -I --http3 https://www.cloudflare.com/  # HTTP/3 200

# curl -V 看编译时是否支持 http2/http3
curl -V
\`\`\`

### demo：Python 里检测并比较

\`\`\`python
import httpx

# 同一站点，对比开/关 HTTP/2 的协议版本
for http2 in (False, True):
    r = httpx.get("https://www.cloudflare.com/", http2=http2)
    print(f"http2={http2} -> {r.http_version}")
\`\`\`

## 十二、选型与迁移建议

| 你的场景 | 建议 |
| --- | --- |
| 个人小站 / API | 上 HTTPS + Nginx 开 http2，立刻收益 |
| 大流量站点 | 在 HTTP/2 基础上评估 HTTP/3（CDN 通常已支持） |
| 移动端弱网 | HTTP/3 收益明显（0-RTT、抗丢包、连接迁移） |
| 企业内网 | 注意 UDP/QUIC 是否被防火墙放行 |
| 实时音视频 | QUIC/HTTP/3 是未来方向 |

迁移步骤（典型）：

1. 全站 HTTPS（HTTP/2 的前置条件）。
2. Nginx/CDN 开启 HTTP/2，验证 \`h2\`。
3. 评估 HTTP/3：确认 CDN、客户端支持，灰度上线。
4. 持续监控 TTFB、首屏、重传率等指标。

## 十三、小结

- HTTP/1.1：文本协议，持久连接，但有队头阻塞。
- HTTP/2：二进制分帧 + 多路复用，解决 HTTP 层队头阻塞，头部压缩省流量。
- HTTP/3：基于 QUIC/UDP，解决 TCP 层队头阻塞，建连更快，支持连接迁移。
- 升级通常无需改业务代码，由 Nginx/CDN 在传输层完成。
- Python 用 httpx 体验 HTTP/2，服务端靠 ASGI 服务器或反代。`,
  },

  // ============================================================
  // 第 5 章：内容协商与 MIME 类型
  // ============================================================
  {
    id: "pyweb2-content-negotiation",
    group: "HTTP 基础",
    icon: "📦",
    title: "内容协商与 MIME 类型",
    content: `# 内容协商与 MIME 类型

同一个资源（比如「用户 tom 的信息」）可能有多种表示形式：JSON、XML、HTML、不同语言、不同编码。客户端想要什么、服务器给什么，靠**内容协商（Content Negotiation）** 决定。这一章讲清 MIME、内容协商机制和字符编码。

## 一、MIME 类型体系

### MIME 是什么

MIME（Multipurpose Internet Mail Extensions）原本是邮件里用来标识附件类型的，HTTP 借过来表示**资源的类型**，体现在 \`Content-Type\` 头里。格式：\`类型/子类型\`，如 \`text/html\`、\`application/json\`。

### 常见 MIME 类型表

| MIME | 含义 | 常见扩展名 |
| --- | --- | --- |
| text/html | HTML 网页 | .html |
| text/plain | 纯文本 | .txt |
| text/css | 样式表 | .css |
| text/javascript | JS 脚本 | .js |
| application/json | JSON 数据 | .json |
| application/xml | XML | .xml |
| application/x-www-form-urlencoded | 表单键值对 | - |
| multipart/form-data | 多段（上传文件） | - |
| application/octet-stream | 任意二进制流 | .bin |
| image/png | PNG 图片 | .png |
| image/jpeg | JPEG 图片 | .jpg |
| image/gif | GIF | .gif |
| audio/mpeg | MP3 音频 | .mp3 |
| video/mp4 | MP4 视频 | .mp4 |
| application/pdf | PDF | .pdf |
| application/zip | ZIP 压缩包 | .zip |

### MIME 的两级结构

- **类型（type）**：大类，如 text、image、application。
- **子类型（subtype）**：具体格式，如 html、json。
- 还可带**参数**：\`text/html; charset=utf-8\`，\`charset\` 指定字符编码。

### 生活比喻

MIME 像快递单上的「物品类别」栏：写「书」还是「电子产品」决定海关怎么处理。\`Content-Type\` 就是 HTTP 包裹上的这个标签，浏览器/服务器据此决定怎么解析。

### 为什么 MIME 重要

浏览器靠 Content-Type 决定怎么渲染：

- 服务器把一段 HTML 用 \`Content-Type: text/plain\` 发出，浏览器会当纯文本显示源码，而不是渲染页面。
- 把 JS 用 \`text/plain\` 发出，浏览器不会执行。
- 攻击者上传 .html 内容但伪装成图片 MIME，浏览器若「嗅探」错就会执行恶意脚本——所以有 \`X-Content-Type-Options: nosniff\` 禁止嗅探。

## 二、Content-Type、Accept 等头

### Content-Type

声明**本端发出 body 的格式**。请求和响应都能用。

\`\`\`http
# 请求：告诉服务器我发的是 JSON
POST /api HTTP/1.1
Content-Type: application/json

{"a":1}
\`\`\`

\`\`\`http
# 响应：告诉客户端我返回的是 HTML
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<html>...</html>
\`\`\`

### Accept 系列（客户端表达偏好）

| 头 | 含义 | 示例 |
| --- | --- | --- |
| Accept | 想要的响应格式 | Accept: application/json |
| Accept-Encoding | 能接受的压缩 | Accept-Encoding: gzip, br |
| Accept-Language | 想要的语言 | Accept-Language: zh-CN,zh;q=0.9 |
| Accept-Charset | 能接受的字符集 | Accept-Charset: utf-8 |

### Accept 的质量因子（q）

Accept 可以带 \`q\`（0~1）表示偏好程度：

\`\`\`http
Accept: application/json;q=0.9, text/html;q=0.8, */*;q=0.1
\`\`\`

含义：最想要 JSON（0.9），其次 HTML（0.8），其他都行（0.1）。

## 三、内容协商机制

服务器怎么根据客户端偏好选响应格式？有两种机制：

### 3.1 服务端驱动协商（主流）

客户端用 Accept* 头表达偏好，服务器按规则选一个格式返回。这是绝大多数 API 的做法。

### demo：Flask 根据 Accept 返回不同格式

\`\`\`python
from flask import Flask, request, jsonify, Response

app = Flask(__name__)

DATA = {"name": "tom", "age": 18}

@app.route("/user")
def user():
    accept = request.headers.get("Accept", "")
    # 简单的内容协商：按 Accept 决定返回 JSON 还是 XML 还是 HTML
    if "application/json" in accept:
        return jsonify(DATA)  # Flask 会设 Content-Type: application/json
    elif "application/xml" in accept:
        xml = f"<user><name>{DATA['name']}</name><age>{DATA['age']}</age></user>"
        return Response(xml, mimetype="application/xml")
    elif "text/html" in accept:
        html = f"<p>{DATA['name']}, {DATA['age']}</p>"
        return Response(html, mimetype="text/html")
    # 默认 JSON
    return jsonify(DATA)
\`\`\`

测试：

\`\`\`bash
curl -H "Accept: application/json" https://localhost/user
curl -H "Accept: application/xml"  https://localhost/user
curl -H "Accept: text/html"        https://localhost/user
\`\`\`

### 3.2 服务端协商的选型逻辑

1. 解析 Accept，按 q 值降序排。
2. 对每个媒体类型，看服务器能否提供。
3. 选第一个能提供的；都不行 → 返回 406 Not Acceptable。

### demo：实现一个像样的协商函数

\`\`\`python
def parse_accept(accept):
    # 把 "application/json;q=0.9, text/html;q=0.8" 解析成排序后的列表
    items = []
    for part in accept.split(","):
        part = part.strip()
        if not part:
            continue
        if ";q=" in part:
            media, q = part.split(";q=", 1)
            items.append((media.strip(), float(q)))
        else:
            items.append((part, 1.0))
    # 按 q 从高到低排序
    items.sort(key=lambda x: x[1], reverse=True)
    return [m for m, _ in items]

def negotiate(accept, supported):
    # supported 是服务器支持的格式列表
    prefs = parse_accept(accept or "")
    for media in prefs:
        if media in supported:
            return media
        if media == "*/*":     # 通配：返回第一个支持的
            return supported[0]
    return None  # 协商失败

print(negotiate("application/json;q=0.9, text/html;q=0.8",
                ["text/html", "application/json"]))  # application/json
\`\`\`

### 3.3 代理驱动 / 客户端驱动协商

服务器返回一个格式列表（如 300 Multiple Choices），让客户端自己选。少见，了解即可。

## 四、字符编码与 charset

### 字符编码是什么

计算机只存数字，字符要映射成数字才能存。**字符集（charset）** 定义「字符→数字」的映射，**编码（encoding）** 定义「数字→字节」的存储方式。日常混着用，说「UTF-8」既指字符集又指编码。

### 常见编码

| 编码 | 特点 |
| --- | --- |
| ASCII | 1 字节，只能表示英文字符 |
| ISO-8859-1（Latin-1） | 1 字节，西欧语言 |
| GBK | 中文，2 字节，国内老系统 |
| GB2312 | GBK 子集 |
| UTF-8 | 变长 1-4 字节，兼容 ASCII，**全球通用** |
| UTF-16 | 定长 2 字节为主 |

### 为什么 UTF-8 是主流

- 兼容 ASCII（英文 1 字节，省空间）。
- 全球通用，一个编码搞定所有语言。
- 无字节序问题（UTF-16 有 BOM 麻烦）。

### charset 在 HTTP 里怎么指定

响应头：

\`\`\`http
Content-Type: text/html; charset=utf-8
\`\`\`

或在 HTML 里：

\`\`\`html
<meta charset="utf-8">
\`\`\`

### 乱码怎么来的

字节流用 A 编码写入，用 B 编码解读，就乱码。比如服务端用 GBK 写、客户端按 UTF-8 读，中文全变问号。

### demo：编码转换

\`\`\`python
# 字符串 <-> 字节，必须指定编码
s = "你好"
b_utf8 = s.encode("utf-8")   # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
b_gbk  = s.encode("gbk")     # b'\\xc4\\xe3\\xba\\xc3'

# 解码必须用对应编码，否则乱码或报错
print(b_utf8.decode("utf-8"))   # 你好
# print(b_utf8.decode("gbk"))   # 乱码：锟斤拷之类的
# print(b_gbk.decode("utf-8"))  # 直接 UnicodeDecodeError

# 错误解码「救活」：先按错误编码解成字符串，再按正确编码编码
# 这是处理乱码的常用技巧
\`\`\`

### demo：处理请求体的编码

\`\`\`python
# 服务器收到表单时，要按正确的编码解析
from urllib.parse import parse_qs

# 假设客户端用 UTF-8 编码发送
raw = "name=张三".encode("utf-8")
# parse_qs 默认按 UTF-8 解码
result = parse_qs(raw.decode("utf-8"))
print(result)  # {'name': ['张三']}
\`\`\`

## 五、Base64 编码与二进制传输

有些场景只能传文本（JSON 字段、URL 参数、邮件），但要传二进制（图片、加密数据）。**Base64** 把任意字节编码成 64 个可打印字符（A-Za-z0-9+/），用 = 补齐。

### Base64 特点

- 把 3 字节编成 4 字符，体积变大 ~33%。
- 不是加密！只是编码，任何人能解。
- URL 安全版本用 \`-\` 替 \`+\`、\`_\` 替 \`/\`，去掉 padding。

### demo：Base64 编解码

\`\`\`python
import base64

# 编码二进制数据
data = b"\\x00\\x01\\x02 hello"   # 含不可打印字节
b64 = base64.b64encode(data)      # b'AAECIGhlbGxv'
print(b64)

# 解码回原始字节
origin = base64.b64decode(b64)
print(origin == data)  # True

# URL 安全版本（用于 URL/JWT）
url_safe = base64.urlsafe_b64encode(data)
print(url_safe)
\`\`\`

### 实战场景

1. **Data URL**：小图片直接嵌进 HTML/CSS：\`<img src="data:image/png;base64,....">\`。
2. **JWT**：Header 和 Payload 用 Base64URL 编码。
3. **HTTP Basic Auth**：\`Authorization: Basic <base64(user:pass)>\`。
4. **JSON 里放二进制**：图片转 base64 字符串放进 JSON。

### demo：HTTP Basic Auth

\`\`\`python
import requests, base64

creds = base64.b64encode(b"tom:123456").decode()
r = requests.get(
    "https://httpbin.org/basic-auth/tom/123456",
    headers={"Authorization": f"Basic {creds}"},
)
print(r.status_code, r.json())
\`\`\`

## 六、处理不同 Content-Type 的请求（综合 demo）

服务器要能根据请求的 Content-Type 用不同方式解析 body。

\`\`\`python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/echo", methods=["POST"])
def echo():
    ct = request.headers.get("Content-Type", "")
    if "application/json" in ct:
        # JSON：Flask 已自动解析到 request.json
        return jsonify({"type": "json", "data": request.json})
    elif "application/x-www-form-urlencoded" in ct:
        # 表单：request.form
        return jsonify({"type": "form", "data": dict(request.form)})
    elif "multipart/form-data" in ct:
        # 文件上传：request.files
        files = {f: v.filename for f, v in request.files.items()}
        return jsonify({"type": "multipart", "files": files})
    elif "text/plain" in ct:
        # 纯文本：request.data 是原始字节
        return jsonify({"type": "text", "data": request.data.decode()})
    else:
        # 其他：拿原始字节
        return jsonify({"type": "raw", "data": request.data.decode(errors="replace")})

# 测试：
# curl -X POST localhost:5000/echo -H "Content-Type: application/json" -d '{"a":1}'
# curl -X POST localhost:5000/echo -d "a=1&b=2"
# curl -X POST localhost:5000/echo -H "Content-Type: text/plain" -d "hello"
# curl -X POST localhost:5000/echo -F "file=@photo.png"
\`\`\`

## 七、小结

| 知识点 | 一句话 |
| --- | --- |
| MIME | 标识资源类型，体现在 Content-Type |
| 内容协商 | 客户端用 Accept* 表达偏好，服务器选格式 |
| q 因子 | Accept 里表达偏好强度 |
| charset | 字符编码，UTF-8 是主流 |
| Base64 | 二进制→文本，便于在文本信道传输 |
| 406 | 服务器无法满足 Accept 时的状态码 |

核心心智模型：**Content-Type 标「我发的是什么」，Accept 标「我想要什么」，内容协商在两者间匹配**。`,
  },

  // ============================================================
  // 第 6 章：Python HTTP 标准库实战
  // ============================================================
  {
    id: "pyweb2-python-http-stdlib",
    group: "HTTP 基础",
    icon: "🐍",
    title: "Python HTTP 标准库实战",
    content: `# Python HTTP 标准库实战

装不了第三方库？环境受限？Python 标准库自带一套完整的 HTTP 工具，足够日常抓接口、搭小服务、解析 URL。这一章把 \`http.client\`、\`urllib.request\`、\`urllib.parse\`、\`http.server\` 讲透，每个配多个可运行 demo。

## 一、http.client：底层 HTTP 客户端

\`http.client\` 是标准库里**最底层**的 HTTP 客户端，直接面向 HTTP 协议（请求行、头部、body）。它比 \`urllib\` 更原始，但更可控。\`urllib.request\` 其实就是基于它实现的。

### 1.1 发 GET 请求

\`\`\`python
import http.client

# HTTPConnection 走明文 HTTP；要 HTTPS 用 HTTPSConnection
conn = http.client.HTTPSConnection("httpbin.org", timeout=10)

# request(方法, 路径, body=None, headers={})
conn.request("GET", "/get?name=tom", headers={"Accept": "application/json"})

resp = conn.getresponse()
print("状态：", resp.status, resp.reason)         # 200 OK
print("头：", dict(resp.getheaders()))
print("体：", resp.read().decode("utf-8"))

conn.close()  # 用完关闭，或用 with 语法（Python 3.12+ 支持）
\`\`\`

逐行说明：

- \`HTTPConnection(主host, 端口, timeout)\`：建立到目标主机的连接对象（还没发请求）。
- \`conn.request(方法, 路径, body, headers)\`：构造并发送一个完整 HTTP 请求。路径要带查询串。
- \`conn.getresponse()\`：阻塞直到收到响应头，返回一个响应对象。
- \`resp.read()\`：读取响应体，返回 bytes；只能读一次。

### 1.2 发 POST 请求（JSON）

\`\`\`python
import http.client, json

conn = http.client.HTTPSConnection("httpbin.org")

# 构造请求体
payload = json.dumps({"name": "tom", "age": 18}).encode("utf-8")
headers = {
    "Content-Type": "application/json",
    "Content-Length": str(len(payload)),  # http.client 要手动给长度
}

conn.request("POST", "/post", body=payload, headers=headers)
resp = conn.getresponse()
print(resp.status)
print(resp.read().decode())
conn.close()
\`\`\`

> 注意：\`http.client\` 不会自动加 \`Content-Length\`，要手动算；也不会自动编 JSON，要自己 dumps。这是它「底层」的体现。

### 1.3 with 语法 + 复用连接

\`\`\`python
import http
# 复用连接发多个请求，省去重复握手
with http.client.HTTPSConnection("httpbin.org") as conn:
    for i in range(3):
        conn.request("GET", f"/get?i={i}")
        resp = conn.getresponse()
        print(i, resp.status)
        resp.read()  # 必须读完，才能发下一个
\`\`\`

### 1.4 处理重定向

\`http.client\` 默认**不跟随**重定向，需要手动处理：

\`\`\`python
import http.client

def fetch(url_path, host="httpbin.org"):
    conn = http.client.HTTPSConnection(host)
    conn.request("GET", url_path)
    resp = conn.getresponse()
    if resp.status in (301, 302, 303, 307, 308):
        # 重定向：取 Location 头，递归再请求
        location = resp.getheader("Location")
        print("重定向到：", location)
        resp.read()
        conn.close()
        # 简化处理：只取 path 部分（实际要解析完整 URL）
        return fetch(location, host)
    body = resp.read().decode()
    conn.close()
    return resp.status, body

print(fetch("/redirect/2"))
\`\`\`

## 二、urllib.request：高级 API

\`urllib.request\` 是标准库的「高级」HTTP 客户端，自动处理重定向、Cookie、编码，API 更友好。可以理解为「穷人版 requests」。

### 2.1 简单 GET

\`\`\`python
from urllib.request import urlopen

# urlopen 直接返回一个「类文件」响应对象
with urlopen("https://httpbin.org/get?name=tom", timeout=10) as resp:
    print("状态：", resp.status)           # 200
    print("头：", dict(resp.getheaders()))
    print("体：", resp.read().decode())

# 默认会自动跟随重定向
with urlopen("https://httpbin.org/redirect/2") as resp:
    print("最终状态：", resp.status)        # 200
\`\`\`

### 2.2 自定义请求（加头、改方法）

\`\`\`python
from urllib.request import Request, urlopen

# 用 Request 对象封装请求
req = Request(
    "https://httpbin.org/get",
    headers={
        "User-Agent": "my-demo/1.0",   # 默认 UA 是 Python-urllib，常被拦
        "Accept": "application/json",
    },
)
with urlopen(req) as resp:
    print(resp.read().decode())
\`\`\`

### 2.3 POST JSON / 表单

\`\`\`python
from urllib.request import Request, urlopen
import json

# POST JSON
data = json.dumps({"name": "tom"}).encode("utf-8")
req = Request("https://httpbin.org/post", data=data,
              headers={"Content-Type": "application/json"})
with urlopen(req) as resp:
    print(resp.read().decode())

# POST 表单（用 urllib.parse.urlencode 编码）
from urllib.parse import urlencode
form = urlencode({"name": "tom", "age": 18}).encode()
req = Request("https://httpbin.org/post", data=form)  # 默认 Content-Type: application/x-www-form-urlencoded
with urlopen(req) as resp:
    print(resp.read().decode())
\`\`\`

### 2.4 处理异常

\`\`\`python
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

try:
    with urlopen("https://httpbin.org/status/404", timeout=5) as resp:
        print(resp.read().decode())
except HTTPError as e:
    # HTTPError：服务器返回了 4xx/5xx
    print("HTTP 错误：", e.code, e.reason)
    print("响应体：", e.read().decode())
except URLError as e:
    # URLError：连不上（DNS、超时、网络）
    print("URL 错误：", e.reason)
except Exception as e:
    print("其他错误：", e)
\`\`\`

> \`urlopen\` 对 4xx/5xx 会抛 \`HTTPError\`，这和 requests 不同（requests 只对网络错抛异常）。注意捕获。

### 2.5 超时与重试

\`\`\`python
import time
from urllib.request import urlopen
from urllib.error import URLError

def fetch_with_retry(url, retries=3, timeout=5):
    for i in range(retries):
        try:
            with urlopen(url, timeout=timeout) as resp:
                return resp.read().decode()
        except URLError as e:
            print(f"第 {i+1} 次失败：{e.reason}")
            time.sleep(1)  # 退避
    raise RuntimeError("重试耗尽")

print(fetch_with_retry("https://httpbin.org/get"))
\`\`\`

## 三、urllib.parse：URL 解析与编码

\`urllib.parse\` 处理 URL 的拆解、拼接、编码，是写爬虫/API 客户端的必备工具。

### 3.1 拆解 URL

\`\`\`python
from urllib.parse import urlparse

# urlparse 把 URL 拆成 6 部分
r = urlparse("https://user:pass@www.example.com:8443/path/to/page?q=1&lang=zh#section")
print("scheme :", r.scheme)   # https
print("netloc  :", r.netloc)  # user:pass@www.example.com:8443
print("host    :", r.hostname) # www.example.com
print("port    :", r.port)     # 8443
print("path    :", r.path)     # /path/to/page
print("query   :", r.query)    # q=1&lang=zh
print("fragment:", r.fragment) # section
\`\`\`

### 3.2 拼接 URL

\`\`\`python
from urllib.parse import urlunparse, urljoin

# urlunparse：把 6 部分拼回 URL
parts = ("https", "www.example.com", "/path", "", "q=1", "")
print(urlunparse(parts))  # https://www.example.com/path?q=1

# urljoin：相对路径拼接成绝对 URL（爬虫必备）
print(urljoin("https://www.example.com/a/b/c.html", "../d.html"))
# https://www.example.com/a/d.html
print(urljoin("https://www.example.com/a/b/", "c.html"))
# https://www.example.com/a/b/c.html
\`\`\`

### 3.3 解析查询串

\`\`\`python
from urllib.parse import parse_qs, parse_qsl

# parse_qs：返回字典，值是列表（一个 key 可能有多个值）
qs = "name=tom&age=18&hobby=coding&hobby=music"
print(parse_qs(qs))
# {'name': ['tom'], 'age': ['18'], 'hobby': ['coding', 'music']}

# parse_qsl：返回列表 of 元组
print(parse_qsl(qs))
# [('name', 'tom'), ('age', '18'), ('hobby', 'coding'), ('hobby', 'music')]
\`\`\`

### 3.4 编码查询串

\`\`\`python
from urllib.parse import urlencode

# urlencode：字典/元组列表 -> 查询串（自动 URL 编码）
print(urlencode({"name": "张三", "age": 18}))
# name=%E5%BC%A0%E4%B8%89&age=18

# 中文被百分号编码，避免乱码和 URL 注入
print(urlencode({"q": "a&b=c"}))   # q=a%26b%3Dc  & 和 = 被编码，安全

# doseq=True：处理值为列表的情况
print(urlencode({"hobby": ["coding", "music"]}, doseq=True))
# hobby=coding&hobby=music
\`\`\`

### 3.5 quote / unquote

\`\`\`python
from urllib.parse import quote, quote_plus, unquote

# quote：对字符串做百分号编码（默认 / 不编码）
print(quote("你好/世界"))     # %E4%BD%A0%E5%A5%BD/%E4%B8%96%E7%95%8C
print(quote("你好/世界", safe=""))  # 全编码，连 / 也编

# quote_plus：用 + 替代空格（表单风格）
print(quote_plus("a b/c"))   # a+b%2Fc

# unquote：解码
print(unquote("%E4%BD%A0%E5%A5%BD"))  # 你好
\`\`\`

> 编码路径用 \`quote\`（保留 \`/\`），编码表单用 \`urlencode\`/\`quote_plus\`。别混。

## 四、http.server：简单 HTTP 服务器

\`http.server\` 是标准库自带的 HTTP 服务器，适合本地调试、写小工具、教学演示。**不要用于生产**（单线程、性能差、无安全加固）。

### 4.1 最简静态服务器

\`\`\`bash
# 命令行一行起服务，把当前目录当静态站点
python -m http.server 8000
# 访问 http://localhost:8000/ 就能浏览当前目录文件
\`\`\`

### 4.2 自定义 Handler（GET）

\`\`\`python
from http.server import BaseHTTPRequestHandler, HTTPServer

class MyHandler(BaseHTTPRequestHandler):
    # 处理 GET 请求：重写 do_GET
    def do_GET(self):
        # 根据路径返回不同内容
        if self.path == "/hello":
            body = "hello world".encode("utf-8")
            self.send_response(200)                       # 状态行
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()                            # 结束头部（空行）
            self.wfile.write(body)                        # 写 body
        else:
            self.send_error(404, "Not Found")            # 自动生成 404 响应

# 起服务：监听 8000，用 MyHandler 处理请求
server = HTTPServer(("0.0.0.0", 8000), MyHandler)
print("服务在 http://localhost:8000")
server.serve_forever()
\`\`\`

逐段说明：

- \`BaseHTTPRequestHandler\` 是基类，你重写 \`do_GET/do_POST/...\` 来处理对应方法。
- \`self.path\` 是请求路径（含查询串）。
- \`self.send_response(状态码)\` 发状态行。
- \`send_header\` 发头，\`end_headers\` 发空行结束头部。
- \`self.wfile\` 是一个可写的类文件对象，往里写就是响应 body。

### 4.3 处理 POST + 解析 body

\`\`\`python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import parse_qs

class MyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 先读 Content-Length，再读对应字节的 body
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)  # 原始字节

        ct = self.headers.get("Content-Type", "")
        if "application/json" in ct:
            data = json.loads(raw)
        elif "application/x-www-form-urlencoded" in ct:
            data = parse_qs(raw.decode("utf-8"))
        else:
            data = raw.decode("utf-8", errors="replace")

        # 把收到的数据回显回去
        body = json.dumps({"received": data}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

server = HTTPServer(("0.0.0.0", 8000), MyHandler)
server.serve_forever()
\`\`\`

测试：

\`\`\`bash
curl -X POST localhost:8000 -H "Content-Type: application/json" -d '{"a":1}'
# {"received": {"a": 1}}
\`\`\`

### 4.4 多线程处理（默认单线程的坑）

默认 \`HTTPServer\` 是单线程：一个请求没处理完，下一个就卡住。换成 \`ThreadingHTTPServer\` 即可并发：

\`\`\`python
from http.server import BaseHTTPRequestHandler
from http.server import ThreadingHTTPServer  # 关键：多线程版

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"ok"
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

# 多线程：每个请求一个线程，互不阻塞
server = ThreadingHTTPServer(("0.0.0.0", 8000), Handler)
server.serve_forever()
\`\`\`

## 五、综合实战

### 5.1 用标准库下载文件（带进度）

\`\`\`python
from urllib.request import urlopen

def download(url, save_path):
    with urlopen(url) as resp:
        total = int(resp.getheader("Content-Length") or 0)
        downloaded = 0
        with open(save_path, "wb") as f:
            while True:
                # 分块读，避免大文件占内存
                chunk = resp.read(8192)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                if total:
                    percent = downloaded * 100 // total
                    print(f"\\r{percent}% ({downloaded}/{total})", end="")
        print("\\n下载完成")

download("https://httpbin.org/bytes/102400", "test.bin")
\`\`\`

### 5.2 解析 URL 并拼接请求

\`\`\`python
from urllib.parse import urlparse, urlencode, urlunparse
from urllib.request import urlopen

def api_get(base, **params):
    # 1. 解析 base URL
    r = urlparse(base)
    # 2. 把参数编码成查询串
    query = urlencode(params)
    # 3. 拼回完整 URL（替换 query 部分）
    full = urlunparse((r.scheme, r.netloc, r.path, r.params, query, r.fragment))
    print("请求 URL：", full)
    with urlopen(full, timeout=10) as resp:
        return resp.read().decode()

print(api_get("https://httpbin.org/get", name="tom", age=18))
\`\`\`

### 5.3 搭一个最小 API 服务器

\`\`\`python
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
import json

# 模拟数据
USERS = {1: {"id": 1, "name": "tom"}, 2: {"id": 2, "name": "jerry"}}

class APIHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        # 路由：/users/<id>
        if parsed.path.startswith("/users/"):
            try:
                uid = int(parsed.path.split("/")[-1])
            except ValueError:
                return self._send_json(400, {"error": "无效的 ID"})
            user = USERS.get(uid)
            if user:
                self._send_json(200, user)
            else:
                self._send_json(404, {"error": "用户不存在"})
        else:
            self._send_json(404, {"error": "未知路由"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/users":
            length = int(self.headers.get("Content-Length", 0))
            try:
                data = json.loads(self.rfile.read(length))
            except json.JSONDecodeError:
                return self._send_json(400, {"error": "JSON 格式错"})
            new_id = max(USERS) + 1
            USERS[new_id] = {"id": new_id, "name": data.get("name", "")}
            self._send_json(201, USERS[new_id])
        else:
            self._send_json(404, {"error": "未知路由"})

    # 静默日志（默认会打印每个请求到 stderr）
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(("0.0.0.0", 8000), APIHandler)
print("API 服务在 http://localhost:8000")
server.serve_forever()
\`\`\`

测试：

\`\`\`bash
# 查询
curl localhost:8000/users/1
# 创建
curl -X POST localhost:8000/users -H "Content-Type: application/json" -d '{"name":"anna"}'
\`\`\`

## 六、标准库 vs requests/httpx 何时用哪个

| 场景 | 推荐 |
| --- | --- |
| 不能装第三方库（受限环境） | 标准库 urllib |
| 日常写脚本/爬虫 | requests（API 友好） |
| 需要 HTTP/2、异步 | httpx |
| 极致性能 | httpx 异步 / aiohttp |
| 本地快速起静态服务 | python -m http.server |
| 写小 API/教学 | http.server 自定义 Handler |
| 生产 Web 服务 | 用框架（Flask/FastAPI/Django）+ Gunicorn |

## 七、小结

- \`http.client\`：最底层，手动管头部和长度，适合学协议。
- \`urllib.request\`：高级 API，自动重定向，但 4xx/5xx 抛异常要注意。
- \`urllib.parse\`：URL 拆解/拼接/编码的瑞士军刀，必记 \`urlparse/urljoin/urlencode/quote\`。
- \`http.server\`：教学/调试用，生产别用；要并发用 \`ThreadingHTTPServer\`。
- 标准库够用但不够爽，生产优先 requests/httpx + 框架。`,
  },
];
