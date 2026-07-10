// =============================================================
// Python Web 应用开发实战 - 第十三批章节(REST API 设计,共 4 章)
// 章节 49-52:REST 架构原则 / API 设计最佳实践 / RESTful API 实现 / API 文档与 Swagger
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十九章:REST 架构原则
  // =============================================================
  {
    id: 'rest-principles',
    group: 'REST API 设计',
    icon: '🌐',
    title: 'REST 架构原则',
    content: `## 第四十九章　REST 架构原则

### 49.1 REST 是什么

REST 全称 **Representational State Transfer**(表述性状态转移),是 Roy Fielding 在 2000 年博士论文中提出的一种网络应用软件架构风格。拆开名字看:

- **Representational(表述性)**:服务器上的资源以某种"表现形式"传递给客户端,比如 JSON、XML、HTML。资源本身(数据库里那条用户记录)是不可见的,你看到的是它的"表述"。
- **State Transfer(状态转移)**:客户端对资源的每一次操作(GET/POST/PUT/DELETE),都让资源从一个状态变到另一个状态。比如 \`PUT /users/1\` 把用户名从"老王"改成"老张",这就是一次状态转移。

> 一句话理解:**REST 把整个 Web 看成一组"资源",每个资源有一个唯一地址(URL),客户端通过 HTTP 方法操作资源,服务器返回资源当前的状态(通常是 JSON)**。

注意:REST 不是协议,也不是标准,而是一组**架构约束**。只要你设计的系统满足这些约束,就可以叫"RESTful"。

### 49.2 REST 的六个约束

Fielding 提出的 REST 有六个核心约束,满足前五个叫"RESTful",全满足叫"真正 RESTful"(实际项目很少全做到):

| 约束 | 含义 | 好处 |
| --- | --- | --- |
| 客户端-服务器 | 客户端(前端)和服务器(后端)分离,各自独立演进 | 前端换 Vue/React 不影响后端;后端换语言不影响前端 |
| 无状态(Stateless) | 每个请求必须包含处理它需要的全部信息,服务器不保存客户端会话状态 | 任意一台服务器都能处理请求,易水平扩展 |
| 可缓存(Cacheable) | 响应必须明确说明是否可缓存,缓存多久 | 减少重复请求,降低服务器压力 |
| 统一接口(Uniform Interface) | 用 URL 标识资源、用 HTTP 方法表达操作、消息自描述、HATEOAS | 接口风格统一,学习成本低 |
| 分层系统(Layered System) | 客户端看不到中间是否有代理、负载均衡、CDN | 架构灵活,可加中间层 |
| 按需代码(Code on Demand) | 服务器可临时给客户端下发可执行代码(如 JS) | 可选约束,很少用 |

> 重点理解**无状态**:它不是说"服务器不能有数据库",而是说"服务器不依赖之前的请求来理解当前请求"。这也是为什么 REST 风格里大家爱用 **JWT** 而不是 Session——JWT 把状态藏在 token 里,每次请求自带,服务器不用记。

### 49.3 一切皆资源(Resources)

REST 的核心思想:**Web 上的一切都是"资源"**。一个用户是资源,一篇文章是资源,一篇文章下的评论也是资源。每个资源用 URL 唯一标识:

\`\`\`text
/users                          # 用户集合
/users/123                      # 单个用户
/users/123/posts                 # 用户 123 的文章集合
/users/123/posts/456             # 用户 123 的某篇文章
/posts/456/comments              # 文章 456 的评论集合
\`\`\`

注意 URL 设计的几个习惯:
- **用名词,不用动词**:URL 标识"是什么",操作由 HTTP 方法表达;
- **用复数**:\`/users\` 而不是 \`/user\`,即便只表示"用户集合"也是复数;
- **层级表达从属关系**:\`/users/123/posts\` 比 \`/posts?user_id=123\` 更直观。

### 49.4 HTTP 方法表达操作

REST 用 HTTP 的几个动词表达对资源的 CRUD 操作,这是"统一接口"约束的具体体现:

| HTTP 方法 | 操作 | 语义 | 幂等 | 安全 |
| --- | --- | --- | --- | --- |
| GET | 查(Read) | 获取资源,不修改 | 是 | 是 |
| POST | 建(Create) | 新建资源 | 否 | 否 |
| PUT | 改(Update) | 替换整个资源(客户端提供完整新值) | 是 | 否 |
| PATCH | 改(Update) | 修改资源的一部分(只传要改的字段) | 否 | 否 |
| DELETE | 删(Delete) | 删除资源 | 是 | 否 |

- **幂等(Idempotent)**:同一个请求执行一次和执行 N 次,结果一样。GET/PUT/DELETE 幂等,POST 不幂等(每次 POST 都新建一条)。
- **安全(Safe)**:不会改变服务器状态。只有 GET 和 HEAD 是安全的。

> 一个常见误区:有人用 POST 干所有事(\`POST /createUser\`、\`POST /deleteUser\`),这是 RPC 风格,不是 RESTful。RESTful 用 \`POST /users\` 创建、\`DELETE /users/1\` 删除,操作语义藏在方法里。

### 49.5 状态码表达结果

服务器返回的 HTTP 状态码是 REST 表达"操作结果"的标准方式,不要偷懒全返回 200:

| 状态码 | 含义 | 何时用 |
| --- | --- | --- |
| 200 OK | 成功 | GET/PUT/PATCH 成功 |
| 201 Created | 已创建 | POST 新建成功 |
| 204 No Content | 成功但无内容 | DELETE 成功 |
| 400 Bad Request | 客户端请求错误 | 参数格式错、缺字段 |
| 401 Unauthorized | 未认证 | 没带 token 或 token 失效 |
| 403 Forbidden | 无权限 | 带了 token 但没权限 |
| 404 Not Found | 资源不存在 | \`/users/999\` 找不到 |
| 409 Conflict | 冲突 | 用户名已存在 |
| 422 Unprocessable Entity | 语义错误 | 字段类型对但业务校验不过 |
| 500 Internal Server Error | 服务器错误 | 代码抛异常 |

### 49.6 URI 设计示例

一个博客系统的 RESTful URL 设计:

\`\`\`text
# 文章资源
GET    /posts                  # 列出所有文章
POST   /posts                  # 新建文章
GET    /posts/123              # 获取某篇文章
PUT    /posts/123              # 整体更新文章
PATCH  /posts/123              # 部分更新文章
DELETE /posts/123              # 删除文章

# 文章下的评论(嵌套资源)
GET    /posts/123/comments     # 文章 123 的评论
POST   /posts/123/comments     # 给文章 123 评论

# 当前登录用户(用 me 代替 id)
GET    /me                     # 我的资料
PUT    /me                     # 修改我的资料
\`\`\`

### 49.7 RESTful vs RPC

两种 API 风格的本质区别:

| 对比点 | RESTful | RPC |
| --- | --- | --- |
| URL 风格 | \`POST /users\` | \`POST /createUser\` |
| 表达的是什么 | 资源(名词) | 动作(动词) |
| 操作在哪表达 | HTTP 方法 | URL 路径 |
| 缓存友好 | GET 可缓存 | 一般不缓存 |
| 学习成本 | 要理解资源概念 | 直观,像调函数 |
| 适合场景 | CRUD 业务、对外 API | 强动作语义(转账、编译) |

> 经验:业务 80% 是 CRUD,用 RESTful 最合适;剩下 20% 强动作语义的(比如"用户转账""触发部署")可以用 RPC 风格补,二者在一个系统里可以共存。

### 49.8 HATEOAS 超媒体

HATEOAS(Hypermedia As The Engine Of Application State)是"统一接口"里最严格的一条:服务器返回资源时,还要返回**接下来能做什么的链接**,客户端通过这些链接驱动应用状态转移,而不是硬编码 URL。

\`\`\`json
{
  "id": 123,
  "title": "REST 入门",
  "links": {
    "self":     { "href": "/posts/123" },
    "comments": { "href": "/posts/123/comments" },
    "author":   { "href": "/users/1" }
  }
}
\`\`\`

好处:客户端不用记 URL,服务器改了路由客户端自动适应。坏处:实现复杂,实际项目几乎没人做完整 HATEOAS,大多数"RESTful API"严格说只能叫"HTTP API"。

### 49.9 为什么用 REST

| 优点 | 说明 |
| --- | --- |
| 标准化 | 用现成的 HTTP 协议,不用自己造协议 |
| 通用 | 任何语言都能发 HTTP 请求,前端、移动端、第三方都通用 |
| 前端友好 | 浏览器原生支持,fetch/axios 直接调 |
| 缓存友好 | HTTP 缓存机制(GET 响应可缓存)直接可用 |
| 可见性强 | URL + 方法 + 状态码,看一眼就知道在干什么 |

### 49.10 代码示例:RESTful 博客 API

下面是一个用 Flask 实现的最小 RESTful 博客 API,严格遵守 REST 风格:

\`\`\`python
# 从 flask 导入 Flask, request, jsonify, abort
from flask import Flask, request, jsonify, abort

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 用内存列表模拟数据库
# 定义列表 posts
posts = [
    # {"id": 1, "title": "REST 入门", "content": "REST 是资源
    {"id": 1, "title": "REST 入门", "content": "REST 是资源状态转移"},
# ]
]
next_id = 2  # 下一个文章的 id


# 列出所有文章 —— GET /posts
# 定义 GET 路由：访问 /posts 时触发
@app.get("/posts")
# 定义函数 list_posts，参数: 
def list_posts():
    # 直接返回资源集合,200 OK
    # 返回 jsonify(posts), 200
    return jsonify(posts), 200


# 获取单篇文章 —— GET /posts/<id>
# 定义 GET 路由：访问 /posts/<int:post_id> 时触发
@app.get("/posts/<int:post_id>")
# 定义函数 get_post，参数: post_id
def get_post(post_id):
    # 定义变量 post，赋值为 next((p for p in posts if p["id"] == post_id)...
    post = next((p for p in posts if p["id"] == post_id), None)
    # 条件判断：如果 post is None
    if post is None:
        # 资源不存在,返回 404,并给一个错误体
        # 返回 jsonify({"error": "post not found"}), 404
        return jsonify({"error": "post not found"}), 404
    # 返回 jsonify(post), 200
    return jsonify(post), 200


# 新建文章 —— POST /posts
# 定义 POST 路由：访问 /posts 时触发
@app.post("/posts")
# 定义函数 create_post，参数: 
def create_post():
    # global next_id
    global next_id
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 参数校验:缺字段返回 400
    # 条件判断：如果 not data or not data.get("title")
    if not data or not data.get("title"):
        # 返回 jsonify({"error": "title is required"}), 400
        return jsonify({"error": "title is required"}), 400
    # 定义字典 post
    post = {
        # "id": next_id,
        "id": next_id,
        # "title": data["title"],
        "title": data["title"],
        # "content": data.get("content", ""),
        "content": data.get("content", ""),
    # }
    }
    # 调用 posts.append()
    posts.append(post)
    # next_id += 1
    next_id += 1
    # 创建成功返回 201,Location 头指向新资源
    # 定义变量 resp，赋值为 jsonify(post)
    resp = jsonify(post)
    # resp.status_code = 201
    resp.status_code = 201
    # resp.headers["Location"] = f"/posts/{post['id']}"
    resp.headers["Location"] = f"/posts/{post['id']}"
    # 返回 resp
    return resp


# 整体更新 —— PUT /posts/<id>(客户端要提供完整资源)
# 定义 PUT 路由：访问 /posts/<int:post_id> 时触发
@app.put("/posts/<int:post_id>")
# 定义函数 update_post，参数: post_id
def update_post(post_id):
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 定义变量 post，赋值为 next((p for p in posts if p["id"] == post_id)...
    post = next((p for p in posts if p["id"] == post_id), None)
    # 条件判断：如果 post is None
    if post is None:
        # 返回 jsonify({"error": "post not found"}), 404
        return jsonify({"error": "post not found"}), 404
    # PUT 要求客户端提供完整字段
    # post["title"] = data["title"]
    post["title"] = data["title"]
    # post["content"] = data["content"]
    post["content"] = data["content"]
    # 返回 jsonify(post), 200
    return jsonify(post), 200


# 部分更新 —— PATCH /posts/<id>(只改传过来的字段)
# 定义 PATCH 路由：访问 /posts/<int:post_id> 时触发
@app.patch("/posts/<int:post_id>")
# 定义函数 patch_post，参数: post_id
def patch_post(post_id):
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 定义变量 post，赋值为 next((p for p in posts if p["id"] == post_id)...
    post = next((p for p in posts if p["id"] == post_id), None)
    # 条件判断：如果 post is None
    if post is None:
        # 返回 jsonify({"error": "post not found"}), 404
        return jsonify({"error": "post not found"}), 404
    # 只更新客户端传了的字段
    # 条件判断：如果 "title" in data
    if "title" in data:
        # post["title"] = data["title"]
        post["title"] = data["title"]
    # 条件判断：如果 "content" in data
    if "content" in data:
        # post["content"] = data["content"]
        post["content"] = data["content"]
    # 返回 jsonify(post), 200
    return jsonify(post), 200


# 删除文章 —— DELETE /posts/<id>
# 定义 DELETE 路由：访问 /posts/<int:post_id> 时触发
@app.delete("/posts/<int:post_id>")
# 定义函数 delete_post，参数: post_id
def delete_post(post_id):
    # global posts
    global posts
    # 定义变量 post，赋值为 next((p for p in posts if p["id"] == post_id)...
    post = next((p for p in posts if p["id"] == post_id), None)
    # 条件判断：如果 post is None
    if post is None:
        # 返回 jsonify({"error": "post not found"}), 404
        return jsonify({"error": "post not found"}), 404
    # 定义列表 posts
    posts = [p for p in posts if p["id"] != post_id]
    # 删除成功返回 204,无内容
    # 返回 "", 204
    return "", 204


# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

> 注意上面的 \`f"/posts/{post['id']}"\`:这是 Python f-string,**花括号前没有 \`$\`**,所以不会和 JS 模板字符串冲突。在 Python 里写 f-string 就是 \`f"...{var}"\`,没有 \`$\` 符号。

### 49.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| URL 里塞动词 \`/getUser\` | 不是 REST 风格 | 用名词 \`/users\`,动作靠 HTTP 方法 |
| 全用 POST 处理增删改查 | 失去 REST 语义,无法缓存 | 该用 DELETE 就用 DELETE |
| 状态码全返回 200,靠 body 区分 | 客户端难以判断成功失败 | 用标准状态码 |
| POST 成功返回 200 | 客户端要靠经验判断是不是新建 | 返回 201 |
| DELETE 返回 200 + body | 浪费带宽,语义不清 | 返回 204 No Content |
| 用 PUT 做部分更新 | 违反 PUT 语义(整体替换) | 部分更新用 PATCH |
| 用 Session 做认证 | 破坏无状态约束 | REST 推荐用 JWT 这种无状态认证 |

> **本章小结**:REST 把 Web 看成一组资源,用 URL 标识资源、HTTP 方法表达操作、状态码表达结果。掌握六个约束(尤其无状态、统一接口),才能写出"真正的 RESTful API"。下一章讲 API 设计的最佳实践,把这套理念落到 URL、参数、响应格式上。`,
  },

  // =============================================================
  // 第五十章:API 设计最佳实践
  // =============================================================
  {
    id: 'rest-design',
    group: 'REST API 设计',
    icon: '📐',
    title: 'API 设计最佳实践',
    content: `## 第五十章　API 设计最佳实践

### 50.1 为什么 API 设计要讲究

API 一旦发布,改动成本极高:
- **前端、移动端、第三方都在用**:你改一个字段名,所有调用方都要跟着改;
- **兼容性要长期维护**:老客户端可能几年都不更新,你新版本不能让它崩;
- **API 是产品的脸**:设计混乱的 API 让人不想用,文档都救不回来。

所以 API 设计要在第一版就尽量想清楚。这一章讲的是"工程上公认好用"的一套约定。

### 50.2 URL 设计规范

**规则 1:用名词复数,不用动词。** URL 标识"是什么",操作由 HTTP 方法表达。

\`\`\`text
# ❌ 不要这样(动词 + 单数)
/getAllUsers
/createUser
/deleteUserById?id=1

# ✅ 应该这样(名词 + 复数 + HTTP 方法)
GET    /users
POST   /users
DELETE /users/1
\`\`\`

**规则 2:嵌套路由表达从属关系。**

\`\`\`text
/users/123/posts          # 用户 123 的文章
/users/123/posts/456      # 用户 123 的某篇文章
/posts/456/comments       # 文章 456 的评论
\`\`\`

但嵌套不要超过两层,否则 URL 又长又难懂:\`/users/123/posts/456/comments/789/replies/10\` 太深了,可以拆成 \`/comments/789/replies\`。

**规则 3:用小写,单词用连字符分隔。**

\`\`\`text
# ❌
/userProfiles
/user_profiles

# ✅
/user-profiles
\`\`\`

**规则 4:id 放在路径,过滤参数放 query。**

\`\`\`text
GET /users/123           # id 在路径
GET /users?status=active # 过滤在 query
\`\`\`

### 50.3 版本控制

API 一定要有版本号,因为业务演进难免有破坏性变更。常见三种做法:

| 方式 | 示例 | 优点 | 缺点 |
| --- | --- | --- | --- |
| URL 路径 | \`/v1/users\`、\`/v2/users\` | 直观,浏览器可缓存 | URL 变长 |
| Header | \`Accept: application/vnd.myapp.v2+json\` | URL 干净 | 不直观,调试麻烦 |
| Query | \`/users?version=2\` | 改动小 | 容易忘传 |

> 实际项目最常用的是 **URL 路径版本**(\`/v1/users\`),最直观,前端好调试。

\`\`\`python
# 从 flask 导入 Flask, jsonify
from flask import Flask, jsonify

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# v1:用户只返回 id 和 name
# 定义 GET 路由：访问 /v1/users/<int:user_id> 时触发
@app.get("/v1/users/<int:user_id>")
# 定义函数 get_user_v1，参数: user_id
def get_user_v1(user_id):
    # 返回 jsonify({"id": user_id, "name": "老王"})
    return jsonify({"id": user_id, "name": "老王"})

# v2:用户多了 email 字段,但保留 v1 不变(老客户端不受影响)
# 定义 GET 路由：访问 /v2/users/<int:user_id> 时触发
@app.get("/v2/users/<int:user_id>")
# 定义函数 get_user_v2，参数: user_id
def get_user_v2(user_id):
    # 返回 jsonify({"id": user_id, "name": "老王", "email": "laowang@x.com"})
    return jsonify({"id": user_id, "name": "老王", "email": "laowang@x.com"})
\`\`\`

### 50.4 分页(Page vs Cursor)

列表资源一定要分页,一次返回几千条既慢又耗内存。两种主流方式:

**方式 1:偏移分页(Page + per_page)**

\`\`\`text
GET /posts?page=1&per_page=20
\`\`\`

\`\`\`python
# 从 flask 导入 Flask, request, jsonify
from flask import Flask, request, jsonify

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
posts = [{"id": i, "title": f"文章{i}"} for i in range(1, 101)]  # 100 篇文章

# 定义 GET 路由：访问 /posts 时触发
@app.get("/posts")
# 定义函数 list_posts，参数: 
def list_posts():
    page = int(request.args.get("page", 1))         # 默认第 1 页
    # 定义变量 per_page，赋值为 int(request.args.get("per_page", 20)) # 默认每页 ...
    per_page = int(request.args.get("per_page", 20)) # 默认每页 20 条
    # 计算起始偏移
    # 定义变量 start，赋值为 (page - 1) * per_page
    start = (page - 1) * per_page
    # 定义变量 end，赋值为 start + per_page
    end = start + per_page
    # 定义变量 items，赋值为 posts[start:end]
    items = posts[start:end]
    # 返回 jsonify({
    return jsonify({
        # "data": items,
        "data": items,
        # "page": page,
        "page": page,
        # "per_page": per_page,
        "per_page": per_page,
        "total": len(posts),                          # 总数,前端用来算总页数
    # })
    })
\`\`\`

优点:简单,可以跳到任意页。缺点:数据频繁变动时偏移会"漂移"(新数据插入后翻页会重复或漏数据)。

**方式 2:游标分页(Cursor)**

\`\`\`text
GET /posts?cursor=abc123&limit=20
\`\`\`

服务器返回下一页的游标:\`{"data": [...], "next_cursor": "def456"}\`。客户端用 next_cursor 请求下一页。适合无限滚动、数据变动频繁的场景(微博、推特时间线都用游标)。

### 50.5 过滤、排序、字段选择

\`\`\`text
# 过滤:status 字段等于 published
GET /posts?status=published

# 排序:- 表示降序,created_at 降序
GET /posts?sort=-created_at

# 多字段排序:先按 created_at 降序,再按 title 升序
GET /posts?sort=-created_at,title

# 字段选择:只要 id 和 title
GET /posts?fields=id,title
\`\`\`

\`\`\`python
# 定义 GET 路由：访问 /posts 时触发
@app.get("/posts")
# 定义函数 list_posts，参数: 
def list_posts():
    # 过滤
    # 定义变量 status，赋值为 request.args.get("status")
    status = request.args.get("status")
    # 定义列表 items
    items = [p for p in posts]
    # 条件判断：如果 status
    if status:
        # 定义列表 items
        items = [p for p in items if p.get("status") == status]
    # 排序
    # 定义变量 sort，赋值为 request.args.get("sort", "-created_at")
    sort = request.args.get("sort", "-created_at")
    # 定义变量 reverse，赋值为 sort.startswith("-")
    reverse = sort.startswith("-")
    # 定义变量 key，赋值为 sort.lstrip("-")
    key = sort.lstrip("-")
    # 调用 items.sort()
    items.sort(key=lambda p: p.get(key, ""), reverse=reverse)
    # 字段选择
    # 定义变量 fields，赋值为 request.args.get("fields")
    fields = request.args.get("fields")
    # 条件判断：如果 fields
    if fields:
        # 定义变量 fields，赋值为 fields.split(",")
        fields = fields.split(",")
        # 定义列表 items
        items = [{f: p[f] for f in fields if f in p} for p in items]
    # 返回 jsonify(items)
    return jsonify(items)
\`\`\`

### 50.6 统一响应格式

业界约定一个统一的"响应信封",让所有接口长得一样,前端解析逻辑能复用:

\`\`\`json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
\`\`\`

\`\`\`python
# 定义函数 ok，参数: data, message="ok"
def ok(data, message="ok"):
    # """统一成功响应"""
    """统一成功响应"""
    # 返回 jsonify({"code": 0, "message": message, "data": data}), 200
    return jsonify({"code": 0, "message": message, "data": data}), 200

# 定义函数 fail，参数: code, message, status=400, details=None
def fail(code, message, status=400, details=None):
    # """统一错误响应"""
    """统一错误响应"""
    # 定义字典 body
    body = {"code": code, "message": message}
    # 条件判断：如果 details
    if details:
        # body["details"] = details
        body["details"] = details
    # 返回 jsonify(body), status
    return jsonify(body), status

# 定义 GET 路由：访问 /users/<int:user_id> 时触发
@app.get("/users/<int:user_id>")
# 定义函数 get_user，参数: user_id
def get_user(user_id):
    # 定义变量 user，赋值为 find_user(user_id)
    user = find_user(user_id)
    # 条件判断：如果 not user
    if not user:
        # 业务错误码 1001,HTTP 状态码 404
        # 返回 fail(1001, "用户不存在", status=404)
        return fail(1001, "用户不存在", status=404)
    # 返回 ok(user)
    return ok(user)
\`\`\`

> 注意区分两类 code:**HTTP 状态码**是协议层(404、500),**业务 code** 是业务层(0 成功、1001 用户不存在)。两者可以同时存在,前端先看 HTTP 状态码判断请求成败,再看业务 code 决定怎么处理。

### 50.7 错误响应格式

错误也要有统一格式,且要带足够信息让前端能展示和定位:

\`\`\`json
{
  "error": "validation_error",
  "code": 422,
  "message": "请求参数校验失败",
  "details": [
    {"field": "email", "issue": "邮箱格式不对"},
    {"field": "age",   "issue": "必须是正整数"}
  ]
}
\`\`\`

- **error**:机器可读的错误标识(下划线命名);
- **message**:给人看的错误描述;
- **details**:字段级错误明细,表单回显错误信息时直接用。

### 50.8 HTTP 状态码的正确使用

| 业务情况 | 状态码 |
| --- | --- |
| 列表/详情查询成功 | 200 |
| 新建成功 | 201 |
| 删除成功 | 204 |
| 参数缺失/格式错 | 400 |
| 未带 token | 401 |
| 带了 token 但没权限 | 403 |
| 资源不存在 | 404 |
| 唯一约束冲突(用户名已存在) | 409 |
| 业务校验不过(年龄为负) | 422 |
| 服务器异常 | 500 |
| 上游服务挂了 | 502 |

> 经验:**401 和 403 别混**。401 是"我不知道你是谁"(没登录),403 是"我知道你是谁但你不能干这事"(普通用户想删别人文章)。

### 50.9 完整 API 设计规范示例

把上面所有规则整合,一个规范的博客 API 长这样:

\`\`\`text
基础 URL: https://api.example.com/v1

# 文章
GET    /posts?page=1&per_page=20&status=published&sort=-created_at
POST   /posts
GET    /posts/{id}
PUT    /posts/{id}
DELETE /posts/{id}

# 评论(嵌套在文章下)
GET    /posts/{id}/comments
POST   /posts/{id}/comments

# 标签(独立资源)
GET    /tags
POST   /tags

# 当前用户(用 me 而不是硬编码 id)
GET    /me
PUT    /me
GET    /me/posts

# 认证
POST   /auth/login        {username, password} → {access_token}
POST   /auth/refresh      {refresh_token} → {access_token}
POST   /auth/logout

# 统一响应
成功:  { "code": 0, "message": "ok", "data": {...} }
失败:  { "error": "...", "code": 422, "message": "...", "details": [...] }
\`\`\`

### 50.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 没分页,\`GET /posts\` 返回全部 | 数据多时崩 | 列表接口必须分页 |
| 把所有参数塞 path \`/users/active\` | 没法组合过滤 | 过滤用 query,资源 id 用 path |
| 没有 API 版本 | 改字段会崩老客户端 | URL 加 \`/v1\` |
| 错误响应只返回 \`{"error": "失败"}\` | 前端没法定位 | 带 error 标识 + message + details |
| 401 当 403 用 | 前端误判会跳登录页 | 401 未认证,403 无权限 |
| POST 创建成功返回 200 | 前端不知道是不是新建 | 返回 201 |
| 一个接口既查又改 | 违反 HTTP 方法语义 | 查用 GET,改用 PUT/PATCH |

> **本章小结**:好的 API 设计 = 名词复数 URL + HTTP 方法表达操作 + 版本号 + 分页过滤排序 + 统一响应信封 + 正确状态码。设计时多站在"调用方"角度想:这个接口我看一眼 URL 知不知道在干啥、返回什么。下一章讲怎么用 Flask、Django REST Framework 真正实现这套设计。`,
  },

  // =============================================================
  // 第五十一章:RESTful API 实现
  // =============================================================
  {
    id: 'rest-implementation',
    group: 'REST API 设计',
    icon: '🛠️',
    title: 'RESTful API 实现',
    content: `## 第五十一章　RESTful API 实现

### 51.1 实现路径的选择

实现 RESTful API,Python 圈有三条主流路线:

| 路线 | 工具 | 适合场景 |
| --- | --- | --- |
| 原生 Flask | Flask + jsonify | 小项目,接口少 |
| Flask 扩展 | Flask-RESTful / Flask-RESTX | 中等项目,想要类封装 |
| Django 全家桶 | Django REST Framework(DRF) | 中大型项目,要序列化/认证/权限/文档全套 |

### 51.2 Flask 原生实现

Flask 自带 \`jsonify\`(把字典转 JSON 响应)和 \`request.get_json()\`(解析请求体 JSON),已经足够实现 RESTful API:

\`\`\`python
# 从 flask 导入 Flask, request, jsonify
from flask import Flask, request, jsonify

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 定义列表 users
users = [
    # {"id": 1, "name": "老王", "email": "laowang@x.com"},
    {"id": 1, "name": "老王", "email": "laowang@x.com"},
# ]
]
# 定义变量 next_id，赋值为 2
next_id = 2

# 列表
# 定义 GET 路由：访问 /api/users 时触发
@app.get("/api/users")
# 定义函数 list_users，参数: 
def list_users():
    # 返回 jsonify(users)
    return jsonify(users)

# 详情
# 定义 GET 路由：访问 /api/users/<int:user_id> 时触发
@app.get("/api/users/<int:user_id>")
# 定义函数 get_user，参数: user_id
def get_user(user_id):
    # 定义变量 user，赋值为 next((u for u in users if u["id"] == user_id)...
    user = next((u for u in users if u["id"] == user_id), None)
    # 条件判断：如果 not user
    if not user:
        # 返回 jsonify({"error": "not found"}), 404
        return jsonify({"error": "not found"}), 404
    # 返回 jsonify(user)
    return jsonify(user)

# 新建
# 定义 POST 路由：访问 /api/users 时触发
@app.post("/api/users")
# 定义函数 create_user，参数: 
def create_user():
    # global next_id
    global next_id
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 条件判断：如果 not data or not data.get("name")
    if not data or not data.get("name"):
        # 返回 jsonify({"error": "name 必填"}), 400
        return jsonify({"error": "name 必填"}), 400
    # 定义字典 user
    user = {"id": next_id, "name": data["name"], "email": data.get("email", "")}
    # 调用 users.append()
    users.append(user)
    # next_id += 1
    next_id += 1
    # 返回 jsonify(user), 201
    return jsonify(user), 201

# 更新(整体)
# 定义 PUT 路由：访问 /api/users/<int:user_id> 时触发
@app.put("/api/users/<int:user_id>")
# 定义函数 update_user，参数: user_id
def update_user(user_id):
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 定义变量 user，赋值为 next((u for u in users if u["id"] == user_id)...
    user = next((u for u in users if u["id"] == user_id), None)
    # 条件判断：如果 not user
    if not user:
        # 返回 jsonify({"error": "not found"}), 404
        return jsonify({"error": "not found"}), 404
    # user["name"] = data["name"]
    user["name"] = data["name"]
    # user["email"] = data["email"]
    user["email"] = data["email"]
    # 返回 jsonify(user)
    return jsonify(user)

# 删除
# 定义 DELETE 路由：访问 /api/users/<int:user_id> 时触发
@app.delete("/api/users/<int:user_id>")
# 定义函数 delete_user，参数: user_id
def delete_user(user_id):
    # global users
    global users
    # 定义变量 user，赋值为 next((u for u in users if u["id"] == user_id)...
    user = next((u for u in users if u["id"] == user_id), None)
    # 条件判断：如果 not user
    if not user:
        # 返回 jsonify({"error": "not found"}), 404
        return jsonify({"error": "not found"}), 404
    # 定义列表 users
    users = [u for u in users if u["id"] != user_id]
    # 返回 "", 204
    return "", 204
\`\`\`

原生 Flask 的特点:**灵活、简单、代码直观**,但每个接口都要手写参数校验、错误处理、序列化,接口一多就重复。

### 51.3 Flask-RESTful 扩展

Flask-RESTful 把"一个资源"封装成一个 \`Resource\` 类,把不同 HTTP 方法映射成类方法,代码组织更清晰:

\`\`\`bash
# 安装 Python 包: flask-restful
pip install flask-restful
\`\`\`

\`\`\`python
# 从 flask 导入 Flask, request
from flask import Flask, request
# 从 flask_restful 导入 Resource, Api, reqparse
from flask_restful import Resource, Api, reqparse

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# 定义变量 api，赋值为 Api(app)
api = Api(app)

# 定义列表 users
users = []
# 定义变量 next_id，赋值为 1
next_id = 1

# 用 reqparse 自动校验参数(类似 WTForms)
# 定义变量 parser，赋值为 reqparse.RequestParser()
parser = reqparse.RequestParser()
# 调用 parser.add_argument()
parser.add_argument("name",  type=str, required=True, help="name 必填")
# 调用 parser.add_argument()
parser.add_argument("email", type=str, default="")

# 定义类 UserList，继承 Resource
class UserList(Resource):
    # """用户集合:/api/users"""
    """用户集合:/api/users"""
    # 定义函数 get，参数: self
    def get(self):
        # 返回 users
        return users

    # 定义函数 post，参数: self
    def post(self):
        # global next_id
        global next_id
        args = parser.parse_args()  # 自动校验,失败直接返回 400
        # 定义字典 user
        user = {"id": next_id, "name": args["name"], "email": args["email"]}
        # 调用 users.append()
        users.append(user)
        # next_id += 1
        next_id += 1
        # 返回 user, 201
        return user, 201

# 定义类 User，继承 Resource
class User(Resource):
    # """单个用户:/api/users/<id>"""
    """单个用户:/api/users/<id>"""
    # 定义函数 get，参数: self, user_id
    def get(self, user_id):
        # 定义变量 user，赋值为 next((u for u in users if u["id"] == user_id)...
        user = next((u for u in users if u["id"] == user_id), None)
        # 条件判断：如果 not user
        if not user:
            # 返回 {"error": "not found"}, 404
            return {"error": "not found"}, 404
        # 返回 user
        return user

    # 定义函数 delete，参数: self, user_id
    def delete(self, user_id):
        # global users
        global users
        # 定义列表 users
        users = [u for u in users if u["id"] != user_id]
        # 返回 "", 204
        return "", 204

# 把 Resource 类注册到 URL
# 调用 api.add_resource()
api.add_resource(UserList, "/api/users")
# 调用 api.add_resource()
api.add_resource(User, "/api/users/<int:user_id>")

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

好处:同类资源的 CRUD 写在一个类里,代码集中;参数校验有专门工具。缺点:Flask-RESTful 维护力度减弱,新项目更推荐用 Flask-RESTX(它的 fork,带 Swagger 文档)。

### 51.4 Django REST Framework(DRF)简介

DRF 是 Django 生态最强大的 API 框架,封装了序列化、视图、路由、认证、权限、分页、过滤、文档全套。安装:

\`\`\`bash
# 安装 Python 包: djangorestframework
pip install djangorestframework
\`\`\`

\`settings.py\` 注册:

\`\`\`python
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    # "rest_framework",
    "rest_framework",
# ]
]
\`\`\`

DRF 的核心三件套:**Serializer(序列化)、ViewSet(视图集)、Router(路由)**。

### 51.5 DRF Serializer(序列化与反序列化)

Serializer 干两件事:
- **序列化**:把模型对象转成 JSON(响应时用);
- **反序列化**:把请求 JSON 解析、校验、转成模型对象(创建/更新时用)。

\`\`\`python
# serializers.py
# 从 rest_framework 导入 serializers
from rest_framework import serializers
# 从 .models 导入 User
from .models import User

# 定义类 UserSerializer，继承 serializers.ModelSerializer
class UserSerializer(serializers.ModelSerializer):
    # """用户序列化器:声明模型字段 + 自动校验"""
    """用户序列化器:声明模型字段 + 自动校验"""
    # 定义类 Meta
    class Meta:
        # 定义变量 model，赋值为 User
        model = User
        fields = ["id", "name", "email"]  # 只暴露这三个字段
        # 不暴露 password,即便数据库有也不传出去

    # 定义函数 validate_email，参数: self, value
    def validate_email(self, value):
        # """单个字段的自定义校验"""
        """单个字段的自定义校验"""
        # 条件判断：如果 not value.endswith("@x.com")
        if not value.endswith("@x.com"):
            # 抛出 serializers 异常
            raise serializers.ValidationError("必须是 @x.com 邮箱")
        # 返回 value
        return value

    # 定义函数 validate，参数: self, attrs
    def validate(self, attrs):
        # """多字段联合校验"""
        """多字段联合校验"""
        # 比如:邮箱不能和名字重复(演示)
        # 条件判断：如果 attrs.get("name") and attrs.get("email")
        if attrs.get("name") and attrs.get("email"):
            # 条件判断：如果 attrs["name"] in attrs["email"]
            if attrs["name"] in attrs["email"]:
                # 抛出 serializers 异常
                raise serializers.ValidationError("名字不能出现在邮箱里")
        # 返回 attrs
        return attrs
\`\`\`

### 51.6 DRF ViewSet(自动生成 CRUD)

ViewSet 把一个资源的全套 CRUD 封装成一个类,DRF 自动把方法映射到 URL:

\`\`\`python
# views.py
# 从 rest_framework 导入 viewsets
from rest_framework import viewsets
# 从 .models 导入 User
from .models import User
# 从 .serializers 导入 UserSerializer
from .serializers import UserSerializer

# 定义类 UserViewSet，继承 viewsets.ModelViewSet
class UserViewSet(viewsets.ModelViewSet):
    # """ModelViewSet 自动提供 list/create/retrieve/update/d
    """ModelViewSet 自动提供 list/create/retrieve/update/destroy 五个动作"""
    # 定义变量 queryset，赋值为 User.objects.all()
    queryset = User.objects.all()
    # 定义变量 serializer_class，赋值为 UserSerializer
    serializer_class = UserSerializer
\`\`\`

就这几行,你已经有了完整的用户 CRUD API:\`GET /users/\` 列表、\`POST /users/\` 创建、\`GET /users/{id}/\` 详情、\`PUT /users/{id}/\` 更新、\`DELETE /users/{id}/\` 删除。

### 51.7 DRF Router(自动注册路由)

Router 把 ViewSet 自动注册成 URL,不用手写一堆 \`path()\`:

\`\`\`python
# urls.py
# 从 django.urls 导入 path, include
from django.urls import path, include
# 从 rest_framework.routers 导入 DefaultRouter
from rest_framework.routers import DefaultRouter
# 从 .views 导入 UserViewSet
from .views import UserViewSet

# 定义变量 router，赋值为 DefaultRouter()
router = DefaultRouter()
router.register("users", UserViewSet)  # 自动生成 /users/ 和 /users/{id}/

# 定义列表 urlpatterns
urlpatterns = [
    # 调用 path()
    path("api/", include(router.urls)),
# ]
]
\`\`\`

### 51.8 DRF 分页、过滤、认证、权限

DRF 把这些通用能力都做成了可插拔配置,改 \`settings.py\` 就能全局生效:

\`\`\`python
# settings.py
# 定义字典 REST_FRAMEWORK
REST_FRAMEWORK = {
    # 分页:每页 20 条
    # "DEFAULT_PAGINATION_CLASS": "rest_framework.pagina
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    # "PAGE_SIZE": 20,
    "PAGE_SIZE": 20,
    # 默认认证:JWT + Session
    # "DEFAULT_AUTHENTICATION_CLASSES": [
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # "rest_framework_simplejwt.authentication.JWTAuthen
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # "rest_framework.authentication.SessionAuthenticati
        "rest_framework.authentication.SessionAuthentication",
    # ],
    ],
    # 默认权限:登录才能访问
    # "DEFAULT_PERMISSION_CLASSES": [
    "DEFAULT_PERMISSION_CLASSES": [
        # "rest_framework.permissions.IsAuthenticated",
        "rest_framework.permissions.IsAuthenticated",
    # ],
    ],
    # 过滤后端:支持 ?search=xxx
    # "DEFAULT_FILTER_BACKENDS": [
    "DEFAULT_FILTER_BACKENDS": [
        # "rest_framework.filters.SearchFilter",
        "rest_framework.filters.SearchFilter",
        # "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.OrderingFilter",
    # ],
    ],
# }
}
\`\`\`

视图里也可以单独覆盖:

\`\`\`python
# 从 rest_framework 导入 viewsets, permissions
from rest_framework import viewsets, permissions

# 定义类 PostViewSet，继承 viewsets.ModelViewSet
class PostViewSet(viewsets.ModelViewSet):
    # 定义变量 queryset，赋值为 Post.objects.all()
    queryset = Post.objects.all()
    # 定义变量 serializer_class，赋值为 PostSerializer
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # 未登录可看,登录才能改
    search_fields = ["title", "content"]   # ?search=xxx 搜这两个字段
    ordering_fields = ["created_at"]       # ?ordering=created_at 可排序
\`\`\`

### 51.9 Flask vs DRF 对比

用同一个"用户 API"对比两种实现:

| 对比点 | Flask 原生 | DRF |
| --- | --- | --- |
| 代码量 | 多(手写校验、序列化) | 少(ModelViewSet 几行搞定) |
| 序列化 | 手动 \`jsonify(dict)\` | Serializer 自动 + 校验 |
| 路由 | 手写 \`@app.get\` | Router 自动注册 |
| 分页/过滤 | 手写或找扩展 | 配置即可 |
| 认证/权限 | 手写装饰器 | 配置 + permission_classes |
| 文档 | 第三方扩展 | 自带Browsable API,可接 Swagger |
| 灵活性 | 高 | 中(框架约定多) |
| 适合场景 | 小项目、要灵活控制 | 中大项目、要全套功能 |

### 51.10 完整对比代码示例

**Flask 版本**(简洁直接,但要自己处理细节):

\`\`\`python
# 从 flask 导入 Flask, request, jsonify
from flask import Flask, request, jsonify
# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# 定义列表 users
users = []

# 定义 GET 路由：访问 /users 时触发
@app.get("/users")
# 定义函数 list_users，参数: 
def list_users():
    # 返回 jsonify(users)
    return jsonify(users)

# 定义 POST 路由：访问 /users 时触发
@app.post("/users")
# 定义函数 create_user，参数: 
def create_user():
    # 定义变量 data，赋值为 request.get_json()
    data = request.get_json()
    # 条件判断：如果 not data.get("name")
    if not data.get("name"):
        # 返回 jsonify({"error": "name 必填"}), 400
        return jsonify({"error": "name 必填"}), 400
    # 定义字典 user
    user = {"id": len(users) + 1, "name": data["name"]}
    # 调用 users.append()
    users.append(user)
    # 返回 jsonify(user), 201
    return jsonify(user), 201
\`\`\`

**DRF 版本**(代码少,功能全):

\`\`\`python
# serializers.py
# 定义类 UserSerializer，继承 serializers.ModelSerializer
class UserSerializer(serializers.ModelSerializer):
    # 定义类 Meta
    class Meta:
        # 定义变量 model，赋值为 User
        model = User
        # 定义列表 fields
        fields = ["id", "name", "email"]

# views.py
# 定义类 UserViewSet，继承 viewsets.ModelViewSet
class UserViewSet(viewsets.ModelViewSet):
    # 定义变量 queryset，赋值为 User.objects.all()
    queryset = User.objects.all()
    # 定义变量 serializer_class，赋值为 UserSerializer
    serializer_class = UserSerializer

# urls.py
# 调用 router.register()
router.register("users", UserViewSet)
# 自动得到 list/create/retrieve/update/destroy + 分页 + 过滤 + 认证
\`\`\`

### 51.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| DRF 没设 \`DEFAULT_PERMISSION_CLASSES\` | 接口裸奔,任何人可访问 | 默认 IsAuthenticated,再按需放开 |
| Serializer 暴露了 password 字段 | 密码泄露 | fields 里只写该暴露的字段 |
| 用 \`ModelViewSet\` 但不想让删 | 接口能被删数据 | 改用 \`ReadOnlyModelViewSet\` |
| 没配分页 | \`GET /users\` 返回全部 | 设 \`PAGE_SIZE\` |
| Flask 手写校验遗漏边界 | 脏数据进库 | 用 reqparse 或 marshmallow |
| POST 后没返回 201 | 前端不知道是不是新建 | 用 \`return x, 201\` |

> **本章小结**:小项目用 Flask + jsonify 直接写;中大型项目用 DRF,ModelViewSet + Router + Serializer 几行代码搞定全套 CRUD。下一章讲怎么给这些 API 加自动文档(Swagger),让前后端协作更顺。`,
  },

  // =============================================================
  // 第五十二章:API 文档与 Swagger
  // =============================================================
  {
    id: 'rest-docs',
    group: 'REST API 设计',
    icon: '📖',
    title: 'API 文档与 Swagger',
    content: `## 第五十二章　API 文档与 Swagger

### 52.1 为什么需要 API 文档

API 写完了,谁来用?
- **前端**:要知道每个接口的 URL、方法、参数、返回结构;
- **移动端**:同上,而且对字段类型更敏感;
- **第三方接入方**:合作方要看文档才知道怎么调;
- **未来的自己**:三个月后没人记得这个接口返回什么。

如果文档靠口头说、聊天记录里翻,**接口一改文档就过时**,这就是为什么需要"和代码一起维护"的文档。

### 52.2 OpenAPI 规范

**OpenAPI** 是一套描述 RESTful API 的规范(前身叫 Swagger 规范)。它定义了一个 JSON/YAML 文件格式,你把所有接口的 URL、参数、响应结构都写进去,任何工具都能读这个文件生成文档、客户端代码、Mock 服务器。

一个最小的 OpenAPI 文档长这样(YAML):

\`\`\`yaml
# openapi: 3.0.0
openapi: 3.0.0
# info 配置段
info:
  # title: 博客 API
  title: 博客 API
  # version: 1.0.0
  version: 1.0.0
# paths 配置段
paths:
  # /posts:
  /posts:
    # get 配置段
    get:
      # summary: 获取文章列表
      summary: 获取文章列表
      # parameters 配置段
      parameters:
        # 列表项: name: page
        - name: page
          # in: query
          in: query
          # schema 配置段
          schema:
            # type: integer
            type: integer
      # responses 配置段
      responses:
        # '200':
        '200':
          # description: 成功
          description: 成功
          # content 配置段
          content:
            # application/json:
            application/json:
              # schema 配置段
              schema:
                # type: array
                type: array
                # items 配置段
                items:
                  # type: object
                  type: object
\`\`\`

> 关键:**OpenAPI 是规范,Swagger 是它的工具链**。手动写 OpenAPI 文件太痛苦,实际项目都是"从代码自动生成"。

### 52.3 Swagger UI 与 ReDoc

两种最常见的 OpenAPI 文档渲染器:

| 工具 | 特点 | 适合场景 |
| --- | --- | --- |
| Swagger UI | 交互式,能直接在页面发请求测试 | 开发联调 |
| ReDoc | 只读,排版美观,三栏布局 | 对外发布文档 |

Swagger UI 长这样:左边是接口列表,点开一个接口能看到参数、响应示例,还有"Try it out"按钮直接发请求。前端联调时几乎离不开它。

### 52.4 Flask-RESTX 自动文档

Flask-RESTX 是 Flask-RESTful 的 fork,自带 Swagger UI,你只要声明接口的输入输出模型,文档自动生成:

\`\`\`bash
# 安装 Python 包: flask-restx
pip install flask-restx
\`\`\`

\`\`\`python
# 从 flask 导入 Flask
from flask import Flask
# 从 flask_restx 导入 Api, Resource, fields
from flask_restx import Api, Resource, fields

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# 定义变量 api，赋值为 Api(app, version="1.0", title="博客 API", descr...
api = Api(app, version="1.0", title="博客 API", description="博客系统接口文档")

# 定义数据模型(文档里展示的字段结构)
# 定义变量 user_model，赋值为 api.model("User", {
user_model = api.model("User", {
    # "id": fields.Integer(description="用户 ID"),
    "id": fields.Integer(description="用户 ID"),
    # "name": fields.String(required=True, description="
    "name": fields.String(required=True, description="用户名"),
    # "email": fields.String(description="邮箱"),
    "email": fields.String(description="邮箱"),
# })
})

# 定义变量 ns，赋值为 api.namespace("users", description="用户相关接口")
ns = api.namespace("users", description="用户相关接口")

# 装饰器：ns.route
@ns.route("/")
# 定义类 UserList，继承 Resource
class UserList(Resource):
    # 装饰器：ns.doc
    @ns.doc("list_users")
    @ns.marshal_list_with(user_model)  # 响应按 user_model 序列化
    # 定义函数 get，参数: self
    def get(self):
        # """获取所有用户"""
        """获取所有用户"""
        # 返回 [{"id": 1, "name": "老王", "email": "w@x.com"}]
        return [{"id": 1, "name": "老王", "email": "w@x.com"}]

    # 装饰器：ns.doc
    @ns.doc("create_user")
    @ns.expect(user_model)             # 期望请求体是 user_model
    # 装饰器：ns.marshal_with
    @ns.marshal_with(user_model, code=201)
    # 定义函数 post，参数: self
    def post(self):
        # """新建用户"""
        """新建用户"""
        # 返回 {"id": 2, "name": "小李", "email": "l@x.com"}, 201
        return {"id": 2, "name": "小李", "email": "l@x.com"}, 201

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

启动后访问 \`http://localhost:5000/\`,Swagger UI 自动出现。

### 52.5 DRF Yasg / Spectacular

Django REST Framework 配 Swagger 文档,主流两个库:

- **drf-yasg**:老牌,基于 Swagger 2.0,文档自动生成;
- **drf-spectacular**:新一代,支持 OpenAPI 3,DRF 官方推荐。

\`\`\`bash
# 安装 Python 包: drf-spectacular
pip install drf-spectacular
\`\`\`

\`settings.py\` 配置:

\`\`\`python
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    # "drf_spectacular",
    "drf_spectacular",
# ]
]

# 定义字典 REST_FRAMEWORK
REST_FRAMEWORK = {
    # ...
    # "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.A
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
# }
}

# 定义字典 SPECTACULAR_SETTINGS
SPECTACULAR_SETTINGS = {
    # "TITLE": "博客 API",
    "TITLE": "博客 API",
    # "DESCRIPTION": "博客系统接口文档",
    "DESCRIPTION": "博客系统接口文档",
    # "VERSION": "1.0.0",
    "VERSION": "1.0.0",
# }
}
\`\`\`

\`urls.py\` 暴露文档端点:

\`\`\`python
# 从 django.urls 导入 path
from django.urls import path
# 从 drf_spectacular.views 导入 SpectacularAPIView, SpectacularSwaggerView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# 定义列表 urlpatterns
urlpatterns = [
    # OpenAPI schema(JSON)
    # 调用 path()
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Swagger UI(交互式)
    # 调用 path()
    path("api/docs/", SpectacularSwaggerView.as_view(url="api/schema/"), name="swagger"),
# ]
]
\`\`\`

访问 \`/api/docs/\` 就是 Swagger UI,所有 ViewSet 的接口自动列出来。Serializer 的字段会自动反映到文档里。

### 52.6 文档定制:描述、示例、响应

光靠代码自动生成还不够,要补充"人话"描述让文档可读:

\`\`\`python
# 从 drf_spectacular.utils 导入 extend_schema, OpenApiExample
from drf_spectacular.utils import extend_schema, OpenApiExample
# 从 rest_framework 导入 serializers
from rest_framework import serializers

# 定义类 UserSerializer，继承 serializers.ModelSerializer
class UserSerializer(serializers.ModelSerializer):
    # 定义类 Meta
    class Meta:
        # 定义变量 model，赋值为 User
        model = User
        # 定义列表 fields
        fields = ["id", "name", "email"]

# 定义类 UserViewSet，继承 viewsets.ModelViewSet
class UserViewSet(viewsets.ModelViewSet):
    # 定义变量 queryset，赋值为 User.objects.all()
    queryset = User.objects.all()
    # 定义变量 serializer_class，赋值为 UserSerializer
    serializer_class = UserSerializer

    # 装饰器：extend_schema
    @extend_schema(
        summary="创建用户",                        # 接口标题
        description="注册一个新用户,邮箱必须唯一",  # 详细描述
        # 定义变量 request，赋值为 UserSerializer,
        request=UserSerializer,
        # 定义字典 responses
        responses={201: UserSerializer, 400: None}, # 标注响应
        examples=[                                    # 给个示例
            # OpenApiExample(
            OpenApiExample(
                # "成功示例",
                "成功示例",
                # 定义字典 value
                value={"id": 1, "name": "老王", "email": "w@x.com"},
                # 定义变量 response_only，赋值为 True,
                response_only=True,
            # )
            )
        # ],
        ],
    # )
    )
    # 定义函数 create，参数: self, request, *args, **kwargs
    def create(self, request, *args, **kwargs):
        # 返回 super().create(request, *args, **kwargs)
        return super().create(request, *args, **kwargs)
\`\`\`

### 52.7 其它文档格式

OpenAPI 不是唯一选择,还有几种:

| 格式 | 特点 |
| --- | --- |
| API Blueprint | Markdown 风格,可读性高,工具少 |
| RAML | YAML 风格,设计先行的团队用 |
| GraphQL Introspection | GraphQL 自带,不需要额外文档 |

实际项目 OpenAPI 是绝对主流,了解其他存在即可。

### 52.8 API 测试:Postman / Apifox

文档生成完,还要能在工具里测试接口:

- **Postman**:老牌 API 测试工具,支持环境变量、集合、自动化测试;
- **Apifox**:国产,集成接口设计、调试、Mock、自动化测试,团队协作友好;
- **curl**:命令行,简单调试够用。

\`\`\`bash
# 用 curl 测试一个用户接口
# 发送 HTTP 请求
curl -X GET http://localhost:5000/users/1

# 带 JSON 请求体创建用户
# 发送 POST 请求
curl -X POST http://localhost:5000/users \\
  # -H "Content-Type: application/json" \\
  -H "Content-Type: application/json" \\
  # -d '{"name": "老王", "email": "w@x.com"}'
  -d '{"name": "老王", "email": "w@x.com"}'
\`\`\`

> 注意:上面命令行结尾的 \`\\\` 是 shell 续行符,在 JS 模板字符串里反斜杠是转义符,所以写两个 \`\\\` 在文件里实际是一个反斜杠。

### 52.9 给 API 加 Swagger 文档的完整示例

下面是一个完整的 Flask-RESTX 项目,带 Swagger 文档:

\`\`\`python
# 从 flask 导入 Flask, request
from flask import Flask, request
# 从 flask_restx 导入 Api, Resource, fields
from flask_restx import Api, Resource, fields

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# 定义变量 api，赋值为 Api(
api = Api(
    # app,
    app,
    # 定义变量 version，赋值为 "1.0",
    version="1.0",
    # 定义变量 title，赋值为 "博客 API",
    title="博客 API",
    # 定义变量 description，赋值为 "博客系统的完整接口文档,可在线测试",
    description="博客系统的完整接口文档,可在线测试",
    doc="/docs/",  # Swagger UI 路径
# )
)

# ===== 定义模型(同时用于校验和文档)=====
# 定义变量 post_model，赋值为 api.model("Post", {
post_model = api.model("Post", {
    # "id":      fields.Integer(readOnly=True, descripti
    "id":      fields.Integer(readOnly=True, description="文章 ID"),
    # "title":   fields.String(required=True, descriptio
    "title":   fields.String(required=True, description="标题"),
    # "content": fields.String(description="正文"),
    "content": fields.String(description="正文"),
    # "status":  fields.String(default="draft", descript
    "status":  fields.String(default="draft", description="状态:draft/published"),
# })
})

# 定义列表 posts
posts = []
# 定义变量 next_id，赋值为 1
next_id = 1

# ===== 定义接口 =====
# 装饰器：api.route
@api.route("/posts")
# 定义类 PostList，继承 Resource
class PostList(Resource):
    # 装饰器：api.doc
    @api.doc("list_posts")
    # 装饰器：api.param
    @api.param("page", "页码", _default="1", type=int)
    # 定义函数 get，参数: self
    def get(self):
        # """获取文章列表"""
        """获取文章列表"""
        # 返回 posts
        return posts

    # 装饰器：api.doc
    @api.doc("create_post")
    # 装饰器：api.expect
    @api.expect(post_model)
    # 装饰器：api.marshal_with
    @api.marshal_with(post_model, code=201)
    # 定义函数 post，参数: self
    def post(self):
        # """新建文章"""
        """新建文章"""
        # global next_id
        global next_id
        # 定义变量 data，赋值为 api.payload
        data = api.payload
        # 定义字典 post
        post = {"id": next_id, "title": data["title"], "content": data.get("content", "")}
        # 调用 posts.append()
        posts.append(post)
        # next_id += 1
        next_id += 1
        # 返回 post, 201
        return post, 201

# 装饰器：api.route
@api.route("/posts/<int:post_id>")
# 装饰器：api.response
@api.response(404, "文章不存在")
# 定义类 Post，继承 Resource
class Post(Resource):
    # 装饰器：api.doc
    @api.doc("get_post")
    # 装饰器：api.marshal_with
    @api.marshal_with(post_model)
    # 定义函数 get，参数: self, post_id
    def get(self, post_id):
        # """获取单篇文章"""
        """获取单篇文章"""
        # 定义变量 post，赋值为 next((p for p in posts if p["id"] == post_id)...
        post = next((p for p in posts if p["id"] == post_id), None)
        # 条件判断：如果 not post
        if not post:
            # 调用 api.abort()
            api.abort(404, "文章不存在")
        # 返回 post
        return post

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 app.run()
    app.run(debug=True)
\`\`\`

启动后浏览器打开 \`http://localhost:5000/docs/\`,自动看到带描述、参数、示例、可在线测试的 Swagger UI。

### 52.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 没写文档,只口头沟通 | 接口一改文档就过时 | 用自动文档库,代码即文档 |
| 文档和代码脱节 | 前端按文档调却报错 | 用代码生成文档,改代码文档自动更新 |
| 文档没描述字段含义 | 前端不知道字段是干嘛的 | 给每个字段写 description |
| 没标响应状态码 | 前端不知道 4xx 长啥样 | 标全 200/400/404/500 的响应 |
| Swagger 暴露到生产 | 接口结构泄露 | 生产环境关掉 /docs/ 路径或加权限 |
| OpenAPI 版本乱 | 工具兼容性出问题 | 团队统一一个版本(3.0) |

> **本章小结**:API 文档 = OpenAPI 规范 + 自动生成工具(Flask-RESTX / drf-spectacular)+ Swagger UI 交互测试。原则:**让代码成为文档的唯一来源**,改代码文档自动更新,杜绝"文档和代码不一致"。REST API 设计这一批到此结束,下一批进入 WebSocket 与实时通信。`,
  },
];
