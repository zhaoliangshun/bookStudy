// =============================================================
// FastAPI 博客系统教程 —— 第一批章节（FastAPI 基础部分，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. blog-intro      — FastAPI 简介与环境搭建
//   2. blog-routing    — 路由、路径参数与查询参数
//   3. blog-pydantic   — Pydantic 数据模型与请求体校验
//   4. blog-database   — SQLAlchemy 数据库集成
//   5. blog-dependency — 依赖注入系统
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（FastAPI 基础）
//   content : Markdown 格式的详细讲解（中文，4000+ 字）
//   code    : 可真实运行的 Python 代码（用 TestClient 进程内调用 FastAPI）
//
// 运行环境说明：
//   - 沙箱为 macOS 上的 python3（3.9.6）
//   - 已安装 fastapi 0.109.0、pydantic 2.13.4、sqlalchemy 2.0.25、
//     passlib、bcrypt、PyJWT 2.13.0、httpx 0.25.2
//   - 每章 code 用 fastapi.testclient.TestClient 在进程内发起请求，
//     无需启动 uvicorn 服务器，打印真实 HTTP 状态码和响应体
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：FastAPI 简介与环境搭建
  // =========================================================
  {
    id: "blog-intro",
    title: "FastAPI 简介与环境搭建",
    icon: "🚀",
    group: "FastAPI 基础",
    content: `## 什么是 FastAPI

**FastAPI** 是一个现代、快速（高性能）的 Python Web 框架，基于标准的 Python 类型提示（type hints）来构建 API。它由 **Sebastián Ramírez**（昵称 tiangolo）于 2018 年创建并开源，短短几年就成为 Python 后端生态里最炙手可热的框架之一。GitHub Star 数已经超过 70k，被微软、Uber、Netflix 等大厂在内部使用。

FastAPI 的核心理念可以用一句话概括：**用 Python 的类型注解做一切**——参数校验、文档生成、序列化、依赖注入，全部由类型提示驱动，开发者只需要写"看起来像普通 Python 函数"的代码，框架自动帮你处理掉那些繁琐的 Web 样板逻辑。

### 核心特性一览

1. **高性能**：基于 Starlette（ASGI 框架）和 Pydantic（数据校验），性能与 Node.js、Go 相当，在 Python 框架里名列前茅。
2. **类型提示驱动**：用 \`def get_user(user_id: int):\` 这样的类型注解，FastAPI 自动做参数解析、类型转换、校验。
3. **自动生成 OpenAPI 文档**：开箱即用地生成 Swagger UI（\`/docs\`）和 ReDoc（\`/redoc\`），前端/客户端可以直接对着文档调试，无需手写。
4. **原生异步支持**：\`async def\` 路由可以直接用 \`await\`，适合 IO 密集型场景（数据库、HTTP 调用）。
5. **依赖注入系统**：内置强大的 DI 容器，用 \`Depends()\` 声明依赖，自动注入，便于复用和测试。
6. **安全规范**：自动处理 OAuth2、JWT、API Key 等认证方案，几行代码就能搭出符合规范的认证流。

### 与 Flask / Django 对比

| 维度 | FastAPI | Flask | Django |
| --- | --- | --- | --- |
| **诞生年份** | 2018 | 2010 | 2005 |
| **定位** | API 优先、异步 | 微框架、全栈可拼 | 全栈、电池齐全 |
| **性能** | 高（与 Node/Go 接近） | 中（同步为主） | 中低（ORM 重） |
| **异步支持** | 原生 \`async def\` | 2.0+ 支持，生态弱 | 3.1+ 支持，仍不主流 |
| **类型提示** | 强制、驱动一切 | 可选、装饰器风格 | 可选、Django REST framework 才用 |
| **API 文档** | 自动生成 Swagger/ReDoc | 需 Flask-RESTX 等扩展 | 需 drf-yasg 等扩展 |
| **ORM** | 不绑定（常用 SQLAlchemy） | 不绑定 | 内置 Django ORM |
| **学习曲线** | 低（懂 Python 类型即可） | 低 | 中高（要学 ORM/Admin/Signal） |
| **适合场景** | 微服务、API 网关、高并发 IO | 小到中型 Web、原型 | 内容站点、后台管理、大型单体 |

> 💡 **选型建议**：纯 API 服务、对性能敏感、想要自动文档——选 FastAPI；要做全栈网页、模板渲染——Flask 或 Django；要做大型内容/电商后台——Django。

### 为什么选 FastAPI 搭博客

你可能会问，搭个博客这种小项目，用 Flask 几十行就搞定了，为什么要用 FastAPI？原因有三：

1. **API 优先**：现代博客通常是"后端 API + 前端 SPA（React/Vue）+ 可能还有移动端"的结构。FastAPI 天生为 API 设计，前后端分离非常自然。
2. **自动文档省心**：写完路由，\`/docs\` 自动就有可交互的 Swagger UI，前端联调时直接对着文档发请求，省去维护 Markdown 接口文档的麻烦。
3. **类型安全**：用 Pydantic 模型定义请求体和响应体，非法请求在进入业务逻辑前就被拦截，返回清晰的 422 错误。后期重构时类型注解也是天然的"契约"，IDE 跳转、补全更可靠。

### 技术栈介绍

本系列教程会用到的技术栈：

- **FastAPI**：Web 框架本体，路由、校验、文档、DI。
- **Uvicorn**：ASGI 服务器，负责把 HTTP 请求转发给 FastAPI。生产环境常用 \`uvicorn[standard]\`（含 uvloop、httptools 加速）。
- **Pydantic**：数据校验库，FastAPI 的核心引擎。v2 用 Rust 重写内核，性能比 v1 快 5-50 倍。
- **SQLAlchemy**：Python 最成熟的 ORM，2.0 版本全面采用类型注解风格（\`Mapped\`/\`mapped_column\`）。
- **PyJWT**：生成和校验 JWT token，做无状态认证。

### 同步路由 vs 异步路由

FastAPI 一个独特之处是**同时支持** \`def\` 和 \`async def\` 两种路由：

\`\`\`python
# 同步路由：FastAPI 会把它放到线程池跑，不阻塞事件循环
@app.get("/sync")
def list_posts_sync():
    return db.query(Post).all()

# 异步路由：直接在事件循环里跑，可以 await
@app.get("/async")
async def list_posts_async():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://api.example.com/data")
        return r.json()
\`\`\`

**何时用哪个**：
- 用了 \`await\`（异步库如 asyncpg、httpx.AsyncClient、motor）→ 必须 \`async def\`。
- 用了同步库（如普通 SQLAlchemy、requests）→ 用 \`def\`，FastAPI 自动放线程池，避免阻塞事件循环。
- **陷阱**：不要在 \`async def\` 里直接调用同步阻塞代码（如 \`requests.get\`），会卡住整个事件循环！同步代码就用 \`def\`，或者用 \`await run_in_threadpool(...)\` 包一层。

### 安装

只需要两条命令：

\`\`\`bash
# 安装 FastAPI 和 ASGI 服务器
pip install fastapi uvicorn[standard]
\`\`\`

\`uvicorn[standard]\` 会装上 uvloop（高性能事件循环）、httptools（HTTP 解析器）等加速依赖。如果你只装 \`uvicorn\`（不带 standard），也能跑，只是性能差一些。

### 第一个 Hello World

创建 \`main.py\`：

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"msg": "hello, FastAPI"}
\`\`\`

启动服务：

\`\`\`bash
uvicorn main:app --reload
\`\`\`

命令拆解：
- \`main:app\` —— \`main\` 是文件名（\`main.py\`），\`app\` 是变量名（\`app = FastAPI()\`）。
- \`--reload\` —— 开发模式热重载，改文件自动重启服务，生产环境不要加。

访问 \`http://127.0.0.1:8000/\` 得到 \`{"msg":"hello, FastAPI"}\`。

### 自动文档：/docs 和 /redoc

FastAPI 最让人惊艳的特性之一是**开箱即用的交互式 API 文档**：

- **\`/docs\`** —— Swagger UI，可交互：每个路由都有"Try it out"按钮，直接在浏览器里发请求看响应。
- **\`/redoc\`** —— ReDoc，只读、排版更优雅，适合对外分享。
- **\`/openapi.json\`** —— OpenAPI 3.1 规范的 JSON Schema，可以被任意 OpenAPI 工具消费（生成客户端 SDK、Postman 导入等）。

这些文档的"内容"全部来自你的代码——路由路径、参数类型、Pydantic 模型、\`description\` 字段，全都自动同步，绝不会"代码和文档不一致"。

### 本系列博客项目结构预览

随着章节推进，我们会逐步搭出这样的结构：

\`\`\`
blog/
├── main.py              # 入口，创建 app，挂载路由
├── models.py            # SQLAlchemy 模型（User、Post）
├── schemas.py           # Pydantic 模型（请求体、响应体）
├── database.py          # 引擎、会话、get_db 依赖
├── deps.py              # 通用依赖（认证、分页）
├── routers/             # 路由模块
│   ├── posts.py
│   ├── users.py
│   └── auth.py
└── requirements.txt
\`\`\`

### 本章小结

- FastAPI 是基于类型提示的现代 Python Web 框架，由 tiangolo 创建。
- 核心特性：高性能、类型驱动、自动文档、异步、依赖注入。
- 与 Flask/Django 比：API 优先、性能更高、文档自动化，但全栈能力不如 Django。
- 技术栈：FastAPI + Uvicorn + Pydantic + SQLAlchemy + PyJWT。
- \`def\` 路由放线程池，\`async def\` 路由在事件循环——同步库用前者，异步库用后者。
- 安装：\`pip install fastapi uvicorn[standard]\`；启动：\`uvicorn main:app --reload\`。
- 自动文档：\`/docs\`（Swagger）、\`/redoc\`、\`/openapi.json\`。

下面的代码用 TestClient 在进程内真实跑 FastAPI，无需启动 uvicorn，打印每个请求的状态码和响应体，让你直观看到 FastAPI 的行为。`,
    code: `# ============================================================
# 第一章：FastAPI 简介与环境搭建
# 用 TestClient 在进程内发起 HTTP 请求，无需启动 uvicorn 服务器
# ============================================================

from fastapi import FastAPI
from fastapi.testclient import TestClient

# 创建应用实例（相当于 Flask 的 app = Flask(__name__)）
# title/description/version 会写入自动生成的 OpenAPI 文档
app = FastAPI(
    title="Blog API",
    description="一个用 FastAPI 搭建的博客系统示例",
    version="0.1.0",
)

# ---------- 路由 1：根路径 ----------
@app.get("/")
def root():
    """首页：返回简单的欢迎信息"""
    return {"msg": "hello, FastAPI", "framework": "FastAPI"}

# ---------- 路由 2：健康检查 ----------
# /health 常用于容器编排（K8s liveness/readiness probe）
@app.get("/health")
def health():
    return {"status": "ok"}

# ---------- 路由 3：路径参数 + 查询参数 ----------
# {item_id} 是路径参数，类型注解 int 让 FastAPI 自动校验和转换
# q 是查询参数，有默认值 "" 表示可选
@app.get("/items/{item_id}")
def get_item(item_id: int, q: str = ""):
    return {"item_id": item_id, "q": q}

# ---------- 路由 4：POST 路由演示 ----------
@app.post("/echo")
def echo(payload: dict):
    # 简单回显请求体（实际项目用 Pydantic 模型校验，后面章节详讲）
    return {"received": payload}

# 用 TestClient 包装 app，就可以像 requests 一样调用
client = TestClient(app)

print("===== 1. 测试根路由 =====")
r = client.get("/")
print(f"GET /         -> {r.status_code} {r.json()}")

print("\\n===== 2. 测试健康检查 =====")
r = client.get("/health")
print(f"GET /health   -> {r.status_code} {r.json()}")

print("\\n===== 3. 路径参数自动类型转换 =====")
r = client.get("/items/42")
print(f"GET /items/42 -> {r.status_code} {r.json()}")

print("\\n===== 4. 路径参数 + 查询参数 =====")
r = client.get("/items/42?q=fastapi")
print(f"GET /items/42?q=fastapi -> {r.status_code} {r.json()}")

print("\\n===== 5. 路径参数类型校验失败（传非数字）=====")
r = client.get("/items/abc")
print(f"GET /items/abc -> {r.status_code}")  # 422
print(f"  校验错误详情: {r.json()}")

print("\\n===== 6. POST 请求体 =====")
r = client.post("/echo", json={"hello": "world", "n": 123})
print(f"POST /echo    -> {r.status_code} {r.json()}")

print("\\n===== 7. 自动生成的 OpenAPI 文档 =====")
r = client.get("/openapi.json")
schema = r.json()
print(f"GET /openapi.json -> {r.status_code}")
print(f"  标题: {schema['info']['title']}")
print(f"  版本: {schema['info']['version']}")
print(f"  路径: {list(schema['paths'].keys())}")

print("\\n===== 8. Swagger UI / ReDoc =====")
r1 = client.get("/docs")
r2 = client.get("/redoc")
print(f"GET /docs  -> {r1.status_code} (Swagger UI HTML 页面)")
print(f"GET /redoc -> {r2.status_code} (ReDoc HTML 页面)")
`,
  },

  // =========================================================
  // 第二章：路由、路径参数与查询参数
  // =========================================================
  {
    id: "blog-routing",
    title: "路由、路径参数与查询参数",
    icon: "🛣️",
    group: "FastAPI 基础",
    content: `## 路径操作装饰器

FastAPI 用装饰器把函数注册成路由，每个 HTTP 方法对应一个装饰器：

| 装饰器 | HTTP 方法 | 用途 |
| --- | --- | --- |
| \`@app.get(path)\` | GET | 读取资源（幂等） |
| \`@app.post(path)\` | POST | 创建资源 |
| \`@app.put(path)\` | PUT | 整体更新资源（幂等） |
| \`@app.patch(path)\` | PATCH | 部分更新资源 |
| \`@app.delete(path)\` | DELETE | 删除资源 |
| \`@app.options(path)\` | OPTIONS | CORS 预检、查询支持的方法 |
| \`@app.head(path)\` | HEAD | 只返回头，不返回体 |

\`\`\`python
@app.get("/posts")
def list_posts():
    return [...]

@app.post("/posts")
def create_post():
    return {"id": 1}

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    return {"deleted": post_id}
\`\`\`

> 💡 **对比 Flask**：Flask 用 \`@app.route("/posts", methods=["GET", "POST"])\` 把多个方法合在一个装饰器，FastAPI 拆成独立的 \`@app.get\`/\`@app.post\`，可读性更好，且类型注解能更精确地反映每个方法的语义。

### 路径参数

用 \`{param}\` 在路径里占位，函数参数同名即可接收：

\`\`\`python
@app.get("/users/{user_id}")
def get_user(user_id):
    return {"user_id": user_id}  # user_id 是字符串
\`\`\`

**类型自动转换**：给参数加类型注解，FastAPI 会自动转换和校验：

\`\`\`python
@app.get("/users/{user_id}")
def get_user(user_id: int):  # 注解 int
    return {"user_id": user_id}  # user_id 已经是 int

# 访问 /users/42  -> {"user_id": 42}
# 访问 /users/abc -> 422 校验错误（不是合法 int）
\`\`\`

### 路径参数校验：Path

用 \`Path(...)\` 给路径参数加约束：

\`\`\`python
from fastapi import Path

@app.get("/posts/{post_id}")
def get_post(
    post_id: int = Path(..., ge=1, le=999, description="文章 ID"),
):
    ...
\`\`\`

常用约束：
- \`ge\`（greater than or equal）：最小值（含）
- \`gt\`：最小值（不含）
- \`le\`：最大值（含）
- \`lt\`：最大值（不含）
- \`description\`：写入文档的说明

\`...\` 是 Python 的 \`Ellipsis\`，表示"必需"——路径参数本来就是必需的，写 \`...\` 是为了配合 \`Path()\` 使用。

### 查询参数

URL 里 \`?\` 后面的 \`key=value\` 是查询参数，用 \`&\` 分隔。函数参数里**不在路径里**的参数就是查询参数：

\`\`\`python
@app.get("/posts")
def list_posts(skip: int = 0, limit: int = 10):
    # 访问 /posts?skip=0&limit=5 -> skip=0, limit=5
    # 访问 /posts               -> skip=0, limit=10（用默认值）
    return {"skip": skip, "limit": limit}
\`\`\`

**可选参数**：用 \`Optional\` 或默认值 \`None\`：

\`\`\`python
from typing import Optional

@app.get("/posts")
def list_posts(q: Optional[str] = None):
    # /posts     -> q=None
    # /posts?q=x -> q="x"
    if q:
        return {"filter": q}
    return {"all": True}
\`\`\`

> ⚠️ **必填查询参数**：如果不给默认值，就是必填。访问时不传会 422：
> \`\`\`python
> @app.get("/search")
> def search(keyword: str):  # 必填
>     ...
> # /search        -> 422
> # /search?q=fast -> ok
> \`\`\`

### 查询参数校验：Query

用 \`Query(...)\` 约束查询参数：

\`\`\`python
from fastapi import Query

@app.get("/posts")
def list_posts(
    skip: int = Query(0, ge=0, description="跳过多少条"),
    limit: int = Query(10, ge=1, le=100, description="每页多少条"),
    q: str = Query(None, min_length=2, max_length=50),
):
    ...
\`\`\`

字符串约束：\`min_length\`、\`max_length\`、\`pattern\`（正则）。
数值约束：\`ge\`、\`gt\`、\`le\`、\`lt\`。

### 路径顺序陷阱（必踩坑）

FastAPI 按声明顺序匹配路由。**更具体的路径必须放在更通用的路径前面**：

\`\`\`python
# ❌ 错误顺序：/users/me 会被 /users/{user_id} 抢先匹配，user_id="me"
@app.get("/users/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}

@app.get("/users/me")
def get_me():
    return {"me": True}

# ✅ 正确顺序：/users/me 在前
@app.get("/users/me")
def get_me():
    return {"me": True}

@app.get("/users/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}
\`\`\`

> 经验：静态路径永远写在动态路径前面。

### 枚举路径参数

用 \`Enum\` 限定路径参数取值：

\`\`\`python
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    user = "user"
    guest = "guest"

@app.get("/users/role/{role}")
def users_by_role(role: Role):
    return {"role": role, "value": role.value}
\`\`\`

访问 \`/users/role/admin\` 正常；访问 \`/users/role/superuser\` 会 422，提示合法值是 admin/user/guest。文档里也会显示成下拉框。

### 请求体初探

GET 请求一般不带请求体，POST/PUT/PATCH 才带。FastAPI 把请求体交给 Pydantic 模型处理（下一章详讲）：

\`\`\`python
from pydantic import BaseModel

class PostIn(BaseModel):
    title: str
    body: str

@app.post("/posts")
def create_post(post: PostIn):
    return {"created": post}
\`\`\`

函数参数 \`post: PostIn\` 是 Pydantic 模型类型，FastAPI 自动从请求体 JSON 解析并校验。

### 响应模型与状态码

**\`response_model\`**：声明响应的形状，FastAPI 会过滤掉模型外的字段（避免泄露敏感字段如密码）：

\`\`\`python
class PostOut(BaseModel):
    id: int
    title: str
    # 注意没有 body 字段——会被自动过滤

@app.get("/posts/{id}", response_model=PostOut)
def get_post(id: int):
    # 即使返回了带 body 的字典，response_model 也会把 body 过滤掉
    return {"id": 1, "title": "hi", "body": "secret"}
\`\`\`

**\`status_code\`**：自定义成功响应的状态码：

\`\`\`python
@app.post("/posts", status_code=201)  # 创建成功用 201
def create_post(post: PostIn):
    ...
\`\`\`

常用状态码：200 OK、201 Created、204 No Content、400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found、422 Unprocessable Entity、500 Internal Server Error。

### 422 校验错误结构

FastAPI 校验失败时返回 422，\`detail\` 是数组，每项描述一个错误：

\`\`\`json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "post_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "abc",
      "url": "https://errors.pydantic.dev/..."
    }
  ]
}
\`\`\`

- \`type\`：错误类型（如 \`int_parsing\`、\`greater_than_equal\`、\`string_too_short\`）。
- \`loc\`：错误位置，\`["path", "post_id"]\` 表示路径参数 \`post_id\`，\`["query", "limit"]\` 表示查询参数 \`limit\`，\`["body", "email"]\` 表示请求体 \`email\` 字段。
- \`msg\`：人类可读的错误说明。
- \`input\`：导致错误的原始输入值。

这种结构化错误信息对前端非常友好，可以精准定位哪个字段出了问题。

### 本章小结

- 路径操作装饰器：\`@app.get/post/put/patch/delete\`，每个 HTTP 方法一个。
- 路径参数 \`{param}\`，类型注解自动转换和校验，\`Path(...)\` 加约束。
- 查询参数是 URL \`?\` 后的键值对，有默认值则可选，无默认值则必填，\`Query(...)\` 加约束。
- 路径顺序：静态路径必须在动态路径前面（\`/users/me\` 在 \`/users/{id}\` 前）。
- 枚举参数用 \`Enum\` 限定取值。
- \`response_model\` 过滤响应字段，\`status_code\` 自定义状态码。
- 422 错误的 \`detail\` 是结构化数组，\`loc\` 精确定位错误位置。

下面的代码演示一个博客文章列表 API，覆盖路径参数、查询参数、校验错误。`,
    code: `# ============================================================
# 第二章：路由、路径参数与查询参数
# 演示博客文章列表 API：GET /posts 和 GET /posts/{post_id}
# ============================================================

from fastapi import FastAPI, Path, Query, HTTPException
from fastapi.testclient import TestClient

app = FastAPI(title="Blog Routing Demo")

# 模拟数据库：文章列表
POSTS = [
    {"id": 1, "title": "FastAPI 入门", "author": "alice"},
    {"id": 2, "title": "Pydantic 详解", "author": "bob"},
    {"id": 3, "title": "SQLAlchemy 集成", "author": "alice"},
    {"id": 4, "title": "依赖注入系统", "author": "carol"},
    {"id": 5, "title": "JWT 认证实战", "author": "bob"},
]

# ---------- GET /posts：查询参数（分页）----------
# skip/limit 都是查询参数，类型为 int，有默认值
# Query(...) 给查询参数加约束：limit 必须在 1~100 之间
@app.get("/posts")
def list_posts(
    skip: int = Query(0, ge=0, description="跳过多少条"),
    limit: int = Query(10, ge=1, le=100, description="最多返回多少条"),
):
    return {"skip": skip, "limit": limit, "total": len(POSTS), "items": POSTS[skip:skip+limit]}

# ---------- GET /posts/{post_id}：路径参数 + 校验 ----------
# Path(ge=1, le=999) 约束路径参数取值范围
@app.get("/posts/{post_id}")
def get_post(
    post_id: int = Path(..., ge=1, le=999, description="文章 ID"),
):
    for p in POSTS:
        if p["id"] == post_id:
            return p
    # 找不到时手动抛 404
    raise HTTPException(status_code=404, detail=f"post {post_id} not found")

client = TestClient(app)

print("===== 1. 正常分页查询 =====")
r = client.get("/posts?skip=0&limit=2")
print(f"GET /posts?skip=0&limit=2 -> {r.status_code}")
data = r.json()
print(f"  total={data['total']}, 返回 {len(data['items'])} 篇:")
for p in data["items"]:
    print(f"    - #{p['id']} {p['title']} (by {p['author']})")

print("\\n===== 2. 翻页（skip=2, limit=2）=====")
r = client.get("/posts?skip=2&limit=2")
print(f"GET /posts?skip=2&limit=2 -> {r.status_code}")
for p in r.json()["items"]:
    print(f"    - #{p['id']} {p['title']}")

print("\\n===== 3. 路径参数：找到文章 =====")
r = client.get("/posts/1")
print(f"GET /posts/1 -> {r.status_code} {r.json()}")

print("\\n===== 4. 路径参数：文章不存在（404）=====")
r = client.get("/posts/999")
print(f"GET /posts/999 -> {r.status_code} {r.json()}")

print("\\n===== 5. 路径参数校验失败：超出范围（422）=====")
r = client.get("/posts/0")  # 0 < ge=1
print(f"GET /posts/0 -> {r.status_code}")
print(f"  detail: {r.json()['detail']}")

print("\\n===== 6. 路径参数类型错误（422）=====")
r = client.get("/posts/abc")
print(f"GET /posts/abc -> {r.status_code}")
detail = r.json()["detail"]
print(f"  校验错误位置: {detail[0]['loc']}")
print(f"  错误类型: {detail[0]['type']}")
print(f"  错误信息: {detail[0]['msg']}")

print("\\n===== 7. 查询参数校验失败：limit 超出上限（422）=====")
r = client.get("/posts?limit=200")  # 200 > le=100
print(f"GET /posts?limit=200 -> {r.status_code}")
print(f"  detail: {r.json()['detail'][0]['msg']}")

print("\\n===== 8. 默认参数（不传任何查询参数）=====")
r = client.get("/posts")
print(f"GET /posts -> {r.status_code}")
data = r.json()
print(f"  使用默认 skip={data['skip']}, limit={data['limit']}")
print(f"  返回 {len(data['items'])} 篇文章")
`,
  },

  // =========================================================
  // 第三章：Pydantic 数据模型与请求体校验
  // =========================================================
  {
    id: "blog-pydantic",
    title: "Pydantic 数据模型与请求体校验",
    icon: "📋",
    group: "FastAPI 基础",
    content: `## Pydantic 是什么

**Pydantic** 是 Python 的数据校验库，基于 Python 的类型提示（type hints）来定义数据模型，并在运行时自动校验数据。它是 FastAPI 的核心引擎——FastAPI 的请求体校验、响应序列化、自动文档，底层全部由 Pydantic 驱动。

Pydantic v2（2023 年发布）用 Rust 重写了核心校验逻辑，性能比 v1 快 5~50 倍，同时 API 更清晰。本教程用 Pydantic 2.13.x。

一句话理解 Pydantic：**你用类型注解定义"数据长什么样"，Pydantic 负责校验"传入的数据是否符合"，不符合就报错，符合就给你一个带类型保证的对象**。

### BaseModel 基础

所有模型继承 \`BaseModel\`：

\`\`\`python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    active: bool = True  # 有默认值，可选

# 从字典创建（校验 + 转换）
user = User(id="1", name="alice", email="a@x.com")
# id 被自动从字符串 "1" 转成 int 1
print(user.id, type(user.id))  # 1 <class 'int'>
print(user.active)  # True（用默认值）

# 转回字典
print(user.model_dump())  # {"id": 1, "name": "alice", "email": "a@x.com", "active": True}

# 转 JSON 字符串
print(user.model_dump_json())  # '{"id":1,"name":"alice","email":"a@x.com","active":true}'
\`\`\`

Pydantic v2 的关键方法：
- \`model_dump()\`：转字典（v1 是 \`.dict()\`，已废弃）。
- \`model_dump_json()\`：转 JSON 字符串。
- \`model_validate(dict)\`：从字典创建并校验（v1 是 \`.parse_obj()\`）。
- \`model_validate_json(str)\`：从 JSON 字符串创建并校验。

### 字段类型

Pydantic 支持丰富的字段类型：

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| \`str\` | 字符串 | \`name: str\` |
| \`int\` / \`float\` | 整数 / 浮点 | \`age: int\`, \`score: float\` |
| \`bool\` | 布尔 | \`active: bool\` |
| \`list\` / \`list[int]\` | 列表（可带元素类型） | \`tags: list[str]\` |
| \`dict\` / \`dict[str, int]\` | 字典 | \`meta: dict\` |
| \`Optional[str]\` | 可选（等价 \`str | None\`） | \`bio: Optional[str] = None\` |
| \`datetime\` | 日期时间（自动解析 ISO 格式） | \`created_at: datetime\` |
| \`EmailStr\` | 邮箱（需装 email-validator） | \`email: EmailStr\` |
| \`HttpUrl\` | URL（自动校验格式） | \`homepage: HttpUrl\` |
| \`UUID\` | UUID | \`id: UUID\` |

> 💡 \`Optional[X]\` 和 \`X | None\` 等价，都表示"可以是 X 或 None"。但**还要给默认值 None 才是真正可选**：\`bio: Optional[str] = None\`。

### 字段约束：Field

用 \`Field(...)\` 给字段加约束：

\`\`\`python
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z][a-zA-Z0-9_]*$",
        description="用户名：3-20 字符，字母开头",
    )
    age: int = Field(ge=0, le=150, description="年龄 0-150")
    score: float = Field(gt=0, lt=100, description="分数 0-100（不含）")
\`\`\`

常用约束：
- 字符串：\`min_length\`、\`max_length\`、\`pattern\`（正则）。
- 数值：\`ge\`（≥）、\`gt\`（>）、\`le\`（≤）、\`lt\`（<）。
- 列表：\`min_length\`、\`max_length\`（元素个数）。
- 通用：\`default\`（默认值）、\`description\`（文档说明）、\`examples\`（示例）。

\`...\`（Ellipsis）表示"必填，无默认值"。也可以用 \`Field(default=...)\` 显式写。

### 嵌套模型

模型可以包含另一个模型：

\`\`\`python
class Address(BaseModel):
    city: str
    street: str

class User(BaseModel):
    name: str
    address: Address  # 嵌套模型
    tags: list[str]   # 列表

# 嵌套数据一次性传入
user = User(name="alice", address={"city": "北京", "street": "长安街"}, tags=["vip", "active"])
print(user.address.city)  # 北京
\`\`\`

FastAPI 收到嵌套 JSON 请求体时，会递归校验每一层。

### 请求体：把 BaseModel 用作参数

在 FastAPI 路由里，把 Pydantic 模型作为参数类型，FastAPI 自动从请求体 JSON 解析：

\`\`\`python
@app.post("/users")
def create_user(user_in: UserCreate):
    # 到这里 user_in 已经是合法的 UserCreate 实例
    return user_in
\`\`\`

请求体必须是 JSON，\`Content-Type: application/json\`。FastAPI 自动校验，非法时返回 422。

### 校验错误：422 响应

校验失败时，FastAPI 返回 422 + 结构化错误：

\`\`\`json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "123",
      "ctx": {"min_length": 8}
    }
  ]
}
\`\`\`

\`loc\` 的第一个元素是来源：\`body\`（请求体）、\`query\`、\`path\`、\`header\`、\`cookie\`。第二个元素是字段名（嵌套字段会有第三层、第四层）。

### 响应模型 response_model

\`response_model\` 声明响应的形状，FastAPI 会**自动过滤**掉模型外的字段。这是避免泄露敏感字段（如密码）的关键：

\`\`\`python
class UserCreate(BaseModel):
    username: str
    password: str  # 敏感

class UserOut(BaseModel):
    username: str
    # 注意没有 password

@app.post("/users", response_model=UserOut)
def create_user(user_in: UserCreate):
    # 即使返回 user_in（含 password），response_model=UserOut 也会过滤掉 password
    return user_in
\`\`\`

> ⚠️ **常见陷阱**：如果直接返回 ORM 对象，且模型用 \`from_attributes=True\`（v1 叫 \`orm_mode=True\`），FastAPI 才能从 ORM 对象的属性读取。否则要手动转字典。

### Pydantic v2 特性

- **性能**：核心用 Rust 重写，比 v1 快 5~50 倍。
- **\`model_config\`**：用类配置替代 v1 的 \`Config\` 内部类：
  \`\`\`python
  class User(BaseModel):
      model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)
  \`\`\`
- **\`model_validate\`**：替代 v1 的 \`parse_obj\`。
- **\`model_dump\`**：替代 v1 的 \`dict\`。
- **\`@field_validator\`**：替代 v1 的 \`@validator\`，更清晰的语义。

### 自定义校验器：@field_validator

用 \`@field_validator\` 自定义校验逻辑：

\`\`\`python
from pydantic import BaseModel, field_validator

class UserCreate(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def password_must_have_letter(cls, v: str) -> str:
        if v.isdigit():
            raise ValueError("密码不能是纯数字")
        return v
\`\`\`

校验器返回的值会替换原值（可以做规范化，如 \`return v.strip()\`）。抛 \`ValueError\` 会转成 422 错误。

还有 \`@model_validator(mode="after")\` 做跨字段校验：

\`\`\`python
from pydantic import model_validator

class ChangePassword(BaseModel):
    new_password: str
    confirm: str

    @model_validator(mode="after")
    def check_match(self):
        if self.new_password != self.confirm:
            raise ValueError("两次密码不一致")
        return self
\`\`\`

### 对比 dataclass 和 ORM 模型

| 维度 | Pydantic BaseModel | dataclasses.dataclass | SQLAlchemy 模型 |
| --- | --- | --- | --- |
| **校验** | 自动、运行时 | 无 | 无（靠 DB 约束） |
| **序列化** | \`model_dump()\` / JSON | 手写 | 手写 |
| **用途** | API 数据传输（DTO） | 纯数据容器 | 数据库映射 |
| **性能** | 快（Rust 内核） | 最快（标准库） | 慢（含 ORM 开销） |
| **类型提示** | 强制、驱动一切 | 可选 | 强制 |

经验：**Pydantic 用于 API 边界**（请求/响应），**dataclass 用于内部数据结构**，**SQLAlchemy 模型用于数据库**。三者各司其职，不要混用。

### 本章小结

- Pydantic 基于类型提示做数据校验，是 FastAPI 的核心。
- \`BaseModel\` 定义模型，\`Field(...)\` 加约束（min_length/pattern/ge 等）。
- 字段类型：str/int/float/bool/list/dict/Optional/datetime/EmailStr/HttpUrl。
- 嵌套模型递归校验。
- 请求体：把 BaseModel 作为参数类型，FastAPI 自动解析 JSON。
- \`response_model\` 过滤响应字段，避免泄露密码。
- v2 关键方法：\`model_dump()\`、\`model_validate()\`、\`@field_validator\`。
- 校验失败返回 422，\`detail\` 数组结构化描述每个错误。

下面的代码演示用户注册接口，含请求体校验、响应模型过滤、自定义校验器。`,
    code: `# ============================================================
# 第三章：Pydantic 数据模型与请求体校验
# 演示用户注册：UserCreate 请求体 + UserOut 响应模型
# ============================================================

from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title="Pydantic Demo")

# 模拟用户存储
USERS = []

# ---------- 请求体模型：用户注册 ----------
class UserCreate(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z][a-zA-Z0-9_]*$",
        description="用户名：3-20 字符，字母开头，只能含字母数字下划线",
    )
    email: str = Field(
        ...,
        pattern=r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        description="邮箱地址",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="密码：至少 8 位",
    )
    age: int = Field(ge=0, le=150, description="年龄 0-150")

    # 自定义校验器：密码不能是纯数字
    @field_validator("password")
    @classmethod
    def password_must_have_letter(cls, v):
        if v.isdigit():
            raise ValueError("密码不能是纯数字")
        return v

# ---------- 响应模型：用户输出（不含密码）----------
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    age: int

# ---------- POST /users：注册接口 ----------
@app.post("/users", response_model=UserOut, status_code=201)
def create_user(user_in: UserCreate):
    user = UserOut(
        id=len(USERS) + 1,
        username=user_in.username,
        email=user_in.email,
        age=user_in.age,
    )
    USERS.append(user)
    return user

@app.get("/users", response_model=list[UserOut])
def list_users():
    return USERS

client = TestClient(app)

print("===== 1. 合法注册请求（201）=====")
r = client.post("/users", json={
    "username": "alice",
    "email": "alice@example.com",
    "password": "secret123",
    "age": 25,
})
print(f"POST /users (合法) -> {r.status_code}")
print(f"  响应体（注意没有 password 字段）: {r.json()}")

print("\\n===== 2. 列出所有用户 =====")
r = client.get("/users")
print(f"GET /users -> {r.status_code} {r.json()}")

print("\\n===== 3. 密码太短（422）=====")
r = client.post("/users", json={
    "username": "bob",
    "email": "bob@example.com",
    "password": "123",
    "age": 30,
})
print(f"POST /users (密码太短) -> {r.status_code}")
print(f"  detail: {r.json()['detail'][0]['msg']}")

print("\\n===== 4. 用户名格式不合法（422）=====")
r = client.post("/users", json={
    "username": "123abc",  # 数字开头，违反 pattern
    "email": "x@example.com",
    "password": "goodpass1",
    "age": 20,
})
print(f"POST /users (用户名格式错) -> {r.status_code}")
print(f"  detail: {r.json()['detail'][0]['msg']}")

print("\\n===== 5. 邮箱格式不合法（422）=====")
r = client.post("/users", json={
    "username": "carol",
    "email": "not-an-email",
    "password": "goodpass1",
    "age": 20,
})
print(f"POST /users (邮箱格式错) -> {r.status_code}")
print(f"  detail: {r.json()['detail'][0]['msg']}")

print("\\n===== 6. 密码是纯数字（自定义校验器，422）=====")
r = client.post("/users", json={
    "username": "dave",
    "email": "dave@example.com",
    "password": "12345678",  # 8 位但纯数字
    "age": 20,
})
print(f"POST /users (纯数字密码) -> {r.status_code}")
print(f"  detail: {r.json()['detail'][0]['msg']}")

print("\\n===== 7. 缺少字段（422）=====")
r = client.post("/users", json={"username": "eve", "email": "eve@example.com"})
print(f"POST /users (缺字段) -> {r.status_code}")
print(f"  完整校验错误:")
for err in r.json()["detail"]:
    print(f"    位置 {err['loc']} -> {err['msg']}")
`,
  },

  // =========================================================
  // 第四章：SQLAlchemy 数据库集成
  // =========================================================
  {
    id: "blog-database",
    title: "SQLAlchemy 数据库集成",
    icon: "🗄️",
    group: "FastAPI 基础",
    content: `## ORM 概念

**ORM（Object-Relational Mapping，对象关系映射）** 把数据库表映射成 Python 类，把行映射成对象，让你用操作 Python 对象的方式操作数据库，不用手写 SQL。

\`\`\`python
# 不用 ORM：手写 SQL
cursor.execute("SELECT id, name FROM users WHERE id = ?", (1,))
row = cursor.fetchone()

# 用 ORM：操作 Python 对象
user = db.query(User).filter(User.id == 1).first()
print(user.name)
\`\`\`

ORM 的好处：
- **抽象掉 SQL 方言**：同一套代码可在 SQLite/MySQL/PostgreSQL 间切换。
- **类型安全**：字段名拼错会在 Python 层报错，不会到 DB 才发现。
- **防 SQL 注入**：参数自动转义。
- **关系导航**：\`user.posts\` 自动加载关联文章。

代价：性能比裸 SQL 略低（有 ORM 开销），复杂查询写起来可能更绕。但 95% 的业务场景，ORM 的开发效率收益远大于性能损失。

### SQLAlchemy 2.0 风格

SQLAlchemy 2.0 是一次重大升级，全面采用类型注解风格（和 FastAPI 哲学一致）：

\`\`\`python
# 旧风格（1.x）：declarative_base + Column
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))

# 新风格（2.0）：DeclarativeBase + Mapped + mapped_column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
\`\`\`

新风格的好处：
- \`Mapped[int]\` 类型注解让 IDE/mypy 能推断字段类型，补全更可靠。
- \`mapped_column\` 比旧 \`Column\` 更显式地区分"映射配置"和"类型"。
- 和 FastAPI + Pydantic 的类型提示哲学一致。

### 模型定义

一个完整的模型示例：

\`\`\`python
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    # 关系：一个用户有多篇文章
    posts: Mapped[list["Post"]] = relationship(back_populates="author")
\`\`\`

关键组件：
- \`__tablename__\`：表名。
- \`mapped_column(Integer, primary_key=True)\`：主键。
- \`String(50)\`：类型 + 长度。
- \`nullable=False\`：不允许 NULL。
- \`unique=True\`：唯一约束。
- \`server_default=func.now()\`：数据库层默认值（当前时间）。

### 引擎与会话

**Engine（引擎）**：数据库连接的工厂，全局创建一次：

\`\`\`python
from sqlalchemy import create_engine

# SQLite 文件库
engine = create_engine("sqlite:///blog.db")

# SQLite 内存库（适合测试，进程结束即销毁）
engine = create_engine("sqlite://")

# PostgreSQL
engine = create_engine("postgresql://user:pass@localhost/blog")

# MySQL
engine = create_engine("mysql+pymysql://user:pass@localhost/blog")
\`\`\`

URL 格式：\`方言+驱动://用户:密码@主机/数据库名\`。

**Session（会话）**：数据库操作的"工作单元"，类似事务：

\`\`\`python
from sqlalchemy.orm import sessionmaker, Session

SessionLocal = sessionmaker(bind=engine)

with SessionLocal() as db:  # 推荐用 with 自动关闭
    user = db.query(User).first()
    # 在 with 块结束前，db 保持着连接和事务
\`\`\`

### SQLite 内存库

\`sqlite://\` 或 \`sqlite:///:memory:\` 创建内存数据库，**进程结束即销毁**，非常适合 demo 和测试：

\`\`\`python
engine = create_engine("sqlite://")
\`\`\`

> ⚠️ **陷阱**：SQLite 内存库默认**每个连接独立**——主线程创建的表，另一个线程看不到。FastAPI 的 \`def\` 路由（同步路由）会在线程池跑，导致"表找不到"错误。解决：用 \`StaticPool\` 共享单连接：
> \`\`\`python
> from sqlalchemy.pool import StaticPool
> engine = create_engine(
>     "sqlite://",
>     connect_args={"check_same_thread": False},
>     poolclass=StaticPool,
> )
> \`\`\`
> \`check_same_thread=False\` 允许跨线程使用连接，\`StaticPool\` 让所有线程共用同一个连接。生产环境用文件库或 PostgreSQL 不需要这个。

### CRUD 操作

**Create（创建）**：
\`\`\`python
with SessionLocal() as db:
    user = User(name="alice", email="a@x.com")
    db.add(user)        # 加入会话
    db.commit()         # 提交事务
    db.refresh(user)    # 刷新，获取自增 id
    print(user.id)      # 提交后才有 id
\`\`\`

**Read（查询）**：
\`\`\`python
# 2.0 风格：select() 语句
from sqlalchemy import select

with SessionLocal() as db:
    # 查所有
    users = db.execute(select(User)).scalars().all()

    # 按主键查
    user = db.get(User, 1)

    # 条件查询
    stmt = select(User).where(User.name == "alice")
    user = db.execute(stmt).scalar_one_or_none()

    # 排序 + 限制
    stmt = select(User).order_by(User.id.desc()).limit(10)
    users = db.execute(stmt).scalars().all()
\`\`\`

**Update（更新）**：
\`\`\`python
with SessionLocal() as db:
    user = db.get(User, 1)
    user.name = "alice2"
    db.commit()  # 自动检测变更并 UPDATE
\`\`\`

**Delete（删除）**：
\`\`\`python
with SessionLocal() as db:
    user = db.get(User, 1)
    db.delete(user)
    db.commit()
\`\`\`

### 在 FastAPI 中用依赖注入管理会话

最佳实践：用 \`yield\` 依赖，每个请求一个会话，请求结束自动关闭：

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.execute(select(User)).scalars().all()
\`\`\`

这样每个请求独立会话，互不干扰，且无需手动关闭。下一章会详讲依赖注入。

### 关系：一对多

User 和 Post 是典型的一对多关系（一个用户多篇文章）：

\`\`\`python
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped["User"] = relationship(back_populates="posts")
\`\`\`

- \`ForeignKey("users.id")\`：外键，指向 users 表的 id。
- \`relationship(back_populates="posts")\`：ORM 层的关系导航，\`user.posts\` 自动返回该用户的所有文章，\`post.author\` 自动返回作者。
- \`back_populates\` 是双向绑定：两边互相指向对方。

使用：
\`\`\`python
user = db.get(User, 1)
print(user.posts)  # 自动查询并返回该用户的所有文章

post = db.get(Post, 1)
print(post.author.name)  # 自动查询并返回作者
\`\`\`

### N+1 问题与 eager loading

**N+1 问题**：查询 N 个用户后，访问每个用户的 \`posts\` 会触发 N 次额外查询，总共 N+1 次：

\`\`\`python
users = db.execute(select(User)).scalars().all()  # 1 次查询
for u in users:
    print(u.posts)  # 每个用户 1 次查询，N 个用户 N 次！
\`\`\`

**解决：eager loading**，用 \`joinedload\` 或 \`selectinload\` 一次性加载：

\`\`\`python
from sqlalchemy.orm import joinedload, selectinload

# JOIN 加载：一次 SQL 拿到用户和文章
stmt = select(User).options(joinedload(User.posts))
users = db.execute(stmt).unique().scalars().all()

# SELECT IN 加载：两次 SQL，先查用户，再 IN 查文章（适合一对多）
stmt = select(User).options(selectinload(User.posts))
users = db.execute(stmt).scalars().all()
\`\`\`

经验：一对一用 \`joinedload\`，一对多用 \`selectinload\`（JOIN 一对多会重复父行）。

### Alembic 迁移工具简介

生产环境的表结构会演进（加字段、改类型），手改表结构很危险。**Alembic** 是 SQLAlchemy 的迁移工具，类似 Django 的 migrations：

\`\`\`bash
pip install alembic
alembic init alembic          # 初始化
alembic revision --autogenerate -m "add users table"  # 自动生成迁移
alembic upgrade head          # 应用迁移
alembic downgrade -1          # 回滚一步
\`\`\`

它对比模型和数据库的差异，生成迁移脚本，让表结构变更可追踪、可回滚。本系列暂不深入，生产项目必用。

### 本章小结

- ORM 把表映射成类，SQLAlchemy 是 Python 最成熟的 ORM。
- 2.0 风格：\`DeclarativeBase\` + \`Mapped\` + \`mapped_column\`，全面类型注解。
- 引擎 \`create_engine\` 全局一次，会话 \`sessionmaker\` 每请求一个。
- SQLite 内存库适合测试，需配 \`StaticPool\` + \`check_same_thread=False\` 才能在 FastAPI 线程池用。
- CRUD：\`add\`/\`commit\`/\`execute(select(...))\`/\`delete\`。
- 在 FastAPI 用 \`yield\` 依赖管理会话，自动关闭。
- 一对多关系：\`ForeignKey\` + \`relationship(back_populates=...)\`。
- N+1 问题用 \`joinedload\`/\`selectinload\` 解决。
- 生产用 Alembic 管理表结构迁移。

下面的代码用 SQLite 内存库定义 User/Post 一对多模型，建表、插数据、查询关联。`,
    code: `# ============================================================
# 第四章：SQLAlchemy 数据库集成
# 用 SQLite 内存库，定义 User/Post 一对多关系
# ============================================================

from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import Integer, String, ForeignKey, create_engine, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship, Session, sessionmaker
)
from sqlalchemy.pool import StaticPool

# ---------- 1. 定义模型基类（SQLAlchemy 2.0 风格）----------
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120))
    # 一对多：一个用户有多篇文章
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(String(2000), default="")
    # 外键：指向 users.id
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped["User"] = relationship(back_populates="posts")

# ---------- 2. 创建引擎和会话 ----------
# sqlite 内存库默认每个连接独立，TestClient 在线程池跑路由会看不到表
# 用 StaticPool 共享单连接 + check_same_thread=False 跨线程使用
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)
SessionLocal = sessionmaker(bind=engine)

# 创建所有表
Base.metadata.create_all(engine)

# ---------- 3. 初始化一些数据 ----------
with SessionLocal() as db:
    alice = User(name="Alice", email="alice@example.com", posts=[
        Post(title="FastAPI 入门", body="FastAPI 是一个现代的 Python Web 框架..."),
        Post(title="Pydantic 详解", body="Pydantic 用类型提示做数据校验..."),
    ])
    bob = User(name="Bob", email="bob@example.com", posts=[
        Post(title="SQLAlchemy 2.0", body="SQLAlchemy 2.0 用 Mapped 类型注解..."),
    ])
    db.add_all([alice, bob])
    db.commit()

# ---------- 4. FastAPI 应用 ----------
app = FastAPI(title="DB Demo")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/posts")
def list_posts(db: Session = Depends(get_db)):
    # 查询所有文章，关联作者信息
    stmt = select(Post).join(User)
    posts = db.execute(stmt).scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "body": p.body,
            "author": p.author.name,
        }
        for p in posts
    ]

@app.get("/users/{user_id}/posts")
def list_user_posts(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return [{"id": p.id, "title": p.title} for p in user.posts]

client = TestClient(app)

print("===== 1. 查询所有文章（含作者名）=====")
r = client.get("/posts")
print(f"GET /posts -> {r.status_code}")
for p in r.json():
    print(f"  #{p['id']} 《{p['title']}》 —— by {p['author']}")

print("\\n===== 2. 查询某用户的文章列表 =====")
r = client.get("/users/1/posts")
print(f"GET /users/1/posts -> {r.status_code}")
print(f"  Alice 的文章: {r.json()}")

print("\\n===== 3. 查询不存在的用户（404）=====")
r = client.get("/users/999/posts")
print(f"GET /users/999/posts -> {r.status_code} {r.json()}")

# 关闭引擎
engine.dispose()
`,
  },

  // =========================================================
  // 第五章：依赖注入系统
  // =========================================================
  {
    id: "blog-dependency",
    title: "依赖注入系统",
    icon: "🔌",
    group: "FastAPI 基础",
    content: `## 什么是依赖注入

**依赖注入（Dependency Injection，DI）** 是一种设计模式：把"组件需要的东西"从外部传进来，而不是组件自己创建。FastAPI 内置了非常优雅的 DI 系统，用函数参数 + \`Depends()\` 声明依赖，框架自动调用并注入返回值。

一句话理解：**"我需要 X，但我不管 X 怎么来的"**——路由声明依赖，FastAPI 负责解析依赖、调用、注入、清理。

\`\`\`python
# 不用 DI：每个路由都自己创建 db、解析参数、查用户
@app.get("/posts")
def list_posts():
    db = SessionLocal()
    try:
        skip = int(request.query_params.get("skip", 0))
        # ... 业务逻辑
    finally:
        db.close()

# 用 DI：声明依赖，框架自动注入
@app.get("/posts")
def list_posts(db: Session = Depends(get_db), params: dict = Depends(common_parameters)):
    # db 和 params 都被自动注入，无需关心怎么来的
    ...
\`\`\`

### Depends 基础

\`Depends(callable)\` 把一个函数声明为依赖，FastAPI 在请求时调用 \`callable\`，把返回值注入参数：

\`\`\`python
from fastapi import Depends, FastAPI

app = FastAPI()

def common_parameters(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/posts")
def list_posts(params: dict = Depends(common_parameters)):
    return params  # params 是 common_parameters() 的返回值

@app.get("/users")
def list_users(params: dict = Depends(common_parameters)):
    return params  # 同一个依赖，多个路由复用
\`\`\`

**关键点**：依赖函数的参数（\`skip\`/\`limit\`）本身也会被 FastAPI 当成"查询参数"解析——依赖可以有自己的参数，层层递归。

### 依赖嵌套

依赖可以依赖其他依赖，形成树状结构：

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(db: Session = Depends(get_db), token: str = Header(...)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(401, "invalid token")
    return user

def get_current_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(403, "admin only")
    return user

@app.delete("/posts/{id}")
def delete_post(id: int, admin: User = Depends(get_current_admin)):
    # 链式依赖：get_current_admin -> get_current_user -> get_db
    # FastAPI 按顺序解析，自动注入最终结果
    ...
\`\`\`

FastAPI 会按依赖树拓扑序解析：\`get_db\` → \`get_current_user\` → \`get_current_admin\`，任何一步抛异常都会中断并返回对应错误。

### yield 依赖：资源管理

普通依赖用 \`return\`，资源型依赖用 \`yield\`——\`yield\` 之后的代码在请求结束时执行，用于清理：

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db  # 把 db 注入路由
    finally:
        db.close()  # 请求结束后自动执行
\`\`\`

\`yield\` 依赖的特点：
- \`yield\` 之前的代码：请求开始时执行（如打开连接）。
- \`yield\` 出去的值：注入到路由。
- \`yield\` 之后的代码：请求结束后执行（如关闭连接），即使路由抛异常也会执行。

适合：数据库会话、文件句柄、事务提交/回滚、分布式锁等资源管理。

\`\`\`python
def get_db_with_transaction():
    db = SessionLocal()
    try:
        yield db
        db.commit()  # 路由没异常才提交
    except Exception:
        db.rollback()  # 有异常回滚
        raise
    finally:
        db.close()
\`\`\`

### 类作为依赖

任何 callable 都能当依赖，包括类（\`__init__\` 会被调用）：

\`\`\`python
class CommonParams:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

@app.get("/posts")
def list_posts(params: CommonParams = Depends()):
    # 注意：Depends() 不传参，类型注解 CommonParams 自动作为依赖
    return {"skip": params.skip, "limit": params.limit}
\`\`\`

类依赖的好处：返回的是对象，可以带方法，比字典更有类型保障。

### 全局依赖

在 \`FastAPI()\` 或 \`APIRouter()\` 上加 \`dependencies\`，对该应用/路由下所有路由生效：

\`\`\`python
# 全应用强制认证
def verify_token(token: str = Header(...)):
    if token != "secret":
        raise HTTPException(401, "invalid token")

app = FastAPI(dependencies=[Depends(verify_token)])

@app.get("/posts")  # 自动应用 verify_token
def list_posts():
    ...

@app.get("/users")  # 也自动应用
def list_users():
    ...
\`\`\`

### 路由组依赖

用 \`APIRouter\` 给一组路由加依赖，比全局更细粒度：

\`\`\`python
from fastapi import APIRouter

admin_router = APIRouter(dependencies=[Depends(get_current_admin)])

@admin_router.delete("/posts/{id}")  # 自动应用 admin 依赖
def delete_post(id: int):
    ...

@admin_router.delete("/users/{id}")  # 也应用
def delete_user(id: int):
    ...

app.include_router(admin_router, prefix="/admin")
\`\`\`

### 依赖缓存

**同一请求中，同一个依赖只执行一次**——即使多个参数都依赖它，也只调用一次，返回值被缓存：

\`\`\`python
def get_db():
    print("creating db session")  # 只打印一次
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items")
def list_items(db1: Session = Depends(get_db), db2: Session = Depends(get_db)):
    # db1 和 db2 是同一个对象！
    assert db1 is db2  # True
    ...
\`\`\`

这避免了重复创建数据库会话。如果确实要每次重新调用，用 \`use_cache=False\`：\`Depends(get_db, use_cache=False)\`。

### 实战场景

1. **数据库会话**：\`get_db\` yield 依赖，每请求一会话。
2. **当前用户**：\`get_current_user\` 从 token 解析用户，多个路由复用。
3. **权限检查**：\`get_current_admin\` 在 \`get_current_user\` 基础上检查角色。
4. **分页参数**：\`common_parameters\` 封装 skip/limit，所有列表接口复用。
5. **配置注入**：\`get_settings\` 返回全局配置对象，便于测试时替换。
6. **日志/审计**：\`get_request_id\` 生成请求 ID，贯穿日志。

### 与 Flask 的 g 对象、Django middleware 对比

| 维度 | FastAPI Depends | Flask g 对象 | Django middleware |
| --- | --- | --- | --- |
| **机制** | 函数参数注入 | 全局上下文 | 包裹请求 |
| **类型安全** | 强（带类型注解） | 弱（运行时属性） | 弱 |
| **复用** | 显式 \`Depends(x)\` | 隐式 \`g.attr\` | 装饰器/类 |
| **测试** | 替换依赖即可 | mock g | 复杂 |
| **可读性** | 函数签名一目了然 | 要进函数体才知道用了啥 | 要看 middleware 配置 |

FastAPI DI 的最大优势是**显式且可测**——路由签名直接告诉你它需要什么，测试时用 \`app.dependency_overrides\` 替换依赖即可，无需 mock 全局状态：

\`\`\`python
# 测试时替换 get_db
def override_get_db():
    yield TestSessionLocal()

app.dependency_overrides[get_db] = override_get_db
\`\`\`

### 本章小结

- DI 是"组件声明需要什么，框架负责注入"的模式。
- \`Depends(callable)\` 把函数声明为依赖，返回值注入参数。
- 依赖可嵌套（依赖其他依赖），形成树状结构。
- \`yield\` 依赖用于资源管理，请求结束自动清理。
- 类也能当依赖（\`__init__\` 被调用）。
- \`FastAPI(dependencies=[...])\` 全局依赖，\`APIRouter(dependencies=[...])\` 路由组依赖。
- 同一请求中同依赖只执行一次（缓存），可用 \`use_cache=False\` 关闭。
- 实战场景：DB 会话、当前用户、权限、分页、配置。
- 测试用 \`app.dependency_overrides\` 替换依赖，无需 mock 全局。

下面的代码演示三个依赖：\`get_db\`（yield 资源管理）、\`common_parameters\`（分页）、\`get_current_user\`（token 认证），并组合使用。`,
    code: `# ============================================================
# 第五章：依赖注入系统
# 演示 get_db / common_parameters / get_current_user 三个依赖
# ============================================================

from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.testclient import TestClient
from sqlalchemy import Integer, String, create_engine, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, Session, sessionmaker
)
from sqlalchemy.pool import StaticPool

# ---------- 数据库部分 ----------
class Base(DeclarativeBase):
    pass

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(50))

# sqlite 内存库 + StaticPool 共享单连接，让 TestClient 线程池能访问到表
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(engine)

# 预置数据
with SessionLocal() as db:
    db.add_all([
        Post(title=f"文章 {i}", author="alice" if i % 2 == 0 else "bob")
        for i in range(1, 11)
    ])
    db.commit()

# ---------- 依赖 1：数据库会话（yield 依赖，请求结束自动关闭）----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- 依赖 2：分页参数 ----------
# 把 skip/limit 两个查询参数封装成一个依赖，多个路由复用
def common_parameters(skip: int = Query(0, ge=0), limit: int = Query(5, ge=1, le=50)):
    return {"skip": skip, "limit": limit}

# ---------- 依赖 3：当前用户（从 header 读 token）----------
# 真实项目里 token 是 JWT，这里简化为 "user:alice" 格式
def get_current_user(token: str = Header(..., description="认证 token，格式 user:<name>")):
    if not token.startswith("user:"):
        raise HTTPException(status_code=401, detail="invalid token format, expected 'user:<name>'")
    username = token[5:]
    if not username:
        raise HTTPException(status_code=401, detail="token missing username")
    return {"username": username}

# ---------- 应用 ----------
app = FastAPI(title="Dependency Demo")

@app.get("/posts")
def list_posts(
    db: Session = Depends(get_db),
    params: dict = Depends(common_parameters),
):
    """列出文章：用了 db 依赖 + 分页依赖"""
    stmt = select(Post).offset(params["skip"]).limit(params["limit"])
    posts = db.execute(stmt).scalars().all()
    return {
        "skip": params["skip"],
        "limit": params["limit"],
        "items": [{"id": p.id, "title": p.title, "author": p.author} for p in posts],
    }

@app.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    """需要认证的接口：用 get_current_user 依赖"""
    return {"user": current_user}

@app.get("/my-posts")
def my_posts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    params: dict = Depends(common_parameters),
):
    """组合三个依赖：db + 认证 + 分页"""
    stmt = (
        select(Post)
        .where(Post.author == current_user["username"])
        .offset(params["skip"])
        .limit(params["limit"])
    )
    posts = db.execute(stmt).scalars().all()
    return {
        "user": current_user["username"],
        "items": [{"id": p.id, "title": p.title} for p in posts],
    }

client = TestClient(app)

print("===== 1. 分页查询文章（默认 limit=5）=====")
r = client.get("/posts")
print(f"GET /posts -> {r.status_code}")
data = r.json()
print(f"  skip={data['skip']}, limit={data['limit']}, 返回 {len(data['items'])} 篇")

print("\\n===== 2. 自定义分页 =====")
r = client.get("/posts?skip=2&limit=3")
print(f"GET /posts?skip=2&limit=3 -> {r.status_code}")
for p in r.json()["items"]:
    print(f"  - #{p['id']} 《{p['title']}》(by {p['author']})")

# 注意：token 是必需 header，缺失会返回 422（FastAPI 参数校验），
# 而不是 401——因为校验在依赖函数体执行之前发生
print("\\n===== 3. 未带 token 访问受保护接口（422，必需 header 缺失）=====")
r = client.get("/me")
print(f"GET /me (无 token) -> {r.status_code} {r.json()}")

print("\\n===== 4. 带合法 token =====")
r = client.get("/me", headers={"token": "user:alice"})
print(f"GET /me (token=user:alice) -> {r.status_code} {r.json()}")

print("\\n===== 5. 非法 token 格式（401，依赖内抛出）=====")
r = client.get("/me", headers={"token": "badtoken"})
print(f"GET /me (token=badtoken) -> {r.status_code} {r.json()}")

print("\\n===== 6. 组合依赖：查 alice 的文章 =====")
r = client.get("/my-posts?limit=10", headers={"token": "user:alice"})
print(f"GET /my-posts (alice) -> {r.status_code}")
for p in r.json()["items"]:
    print(f"  - #{p['id']} 《{p['title']}》")

print("\\n===== 7. 组合依赖：查 bob 的文章 =====")
r = client.get("/my-posts?limit=10", headers={"token": "user:bob"})
print(f"GET /my-posts (bob) -> {r.status_code}")
for p in r.json()["items"]:
    print(f"  - #{p['id']} 《{p['title']}》")

engine.dispose()
`,
  },
];
