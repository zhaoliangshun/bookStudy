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

这种"类型驱动"的范式背后有一个关键认知：现代 Python（3.6+）的类型提示已经足够成熟，可以作为运行时反射的元数据来源。FastAPI 在应用启动时会用 \`inspect.signature\` 扫描每个路由函数的签名，把类型注解翻译成校验规则、OpenAPI schema、JSON Schema，再在请求到来时按这套规则解析参数。这意味着你写一次类型注解，至少在三处发挥作用：IDE 静态检查、运行时校验、API 文档生成——这就是"一次声明，多处消费"的工程价值。

### 核心特性一览

1. **高性能**：基于 Starlette（ASGI 框架）和 Pydantic（数据校验），性能与 Node.js、Go 相当，在 Python 框架里名列前茅。在权威的 TechEmpower 基准测试里，FastAPI 的 JSON 响应吞吐通常比 Flask 高一个数量级。
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

### ASGI vs WSGI：异步网关协议的本质

要理解 FastAPI 为什么"快"，必须先理解 **WSGI** 和 **ASGI** 的区别。它们都是 Python Web 应用与服务器之间的"接口协议"——服务器收到 HTTP 请求，按协议把请求交给应用，应用返回响应。

**WSGI（Web Server Gateway Interface）** 是 2003 年的 PEP 3333 标准，同步、阻塞模型。每个请求占用一个 worker（线程或进程），请求处理完才释放。Flask、Django（传统模式）都走 WSGI。典型服务器：gunicorn、uWSGI。

\`\`\`python
# WSGI 应用签名：接收 environ（请求信息）和 start_response（开始响应的回调）
def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"hello"]
\`\`\`

**ASGI（Asynchronous Server Gateway Interface）** 是 WSGI 的异步继任者，由 Django 团队 2018 年提出。原生支持 \`async/await\`，单个事件循环可以处理成千上万个并发连接，特别适合长连接（WebSocket、SSE）和 IO 密集型场景。典型服务器：uvicorn、hypercorn、daphne。

\`\`\`python
# ASGI 应用签名：异步，接收 scope（连接元信息）、receive（收消息）、send（发消息）
async def app(scope, receive, send):
    await send({"type": "http.response.start", "status": 200, "headers": []})
    await send({"type": "http.response.body", "body": b"hello"})
\`\`\`

| 维度 | WSGI | ASGI |
| --- | --- | --- |
| **同步/异步** | 同步阻塞 | 异步非阻塞 |
| **并发模型** | 多线程/多进程 | 单线程事件循环 |
| **WebSocket** | 不支持 | 原生支持 |
| **HTTP/2、SSE** | 难 | 支持 |
| **典型服务器** | gunicorn、uWSGI | uvicorn、hypercorn |
| **代表框架** | Flask、老 Django | FastAPI、Starlette、新 Django |
| **适合场景** | CPU 密集、传统 CRUD | 高并发 IO、长连接 |

**原理图解**（文字版）：
\`\`\`
WSGI:  [请求] → [Worker 线程] → [阻塞调用 DB/HTTP] → [响应] → 释放 worker
ASGI:  [请求] → [事件循环] → [await IO 时挂起，处理其他请求] → [IO 完成恢复] → [响应]
\`\`\`

ASGI 的关键不是"更快地处理单个请求"，而是"在等 IO 时不闲着"。对于博客这种读多写少、有数据库和网络调用的场景，ASGI 能显著提升并发吞吐。

### Starlette 架构剖析

FastAPI 不是从零造轮子，它构建在 **Starlette** 之上。Starlette 是一个轻量级 ASGI 框架，提供了路由、中间件、请求/响应对象、WebSocket、后台任务等基础设施。FastAPI 的角色是"在 Starlette 之上加上类型驱动的校验、文档、依赖注入"。

分层结构：
\`\`\`
HTTP 请求
   ↓
Uvicorn（ASGI 服务器，解析 HTTP 字节流）
   ↓
Starlette（ASGI 应用，路由分发、中间件链、Request/Response 对象）
   ↓
FastAPI（路由装饰器、Pydantic 校验、依赖注入、OpenAPI 生成）
   ↓
你的路由函数
\`\`\`

Starlette 提供的核心能力（FastAPI 全部继承）：
- **Routing**：基于路径模式匹配，支持动态参数。
- **Middleware**：洋葱模型，请求进入时按顺序执行，响应返回时逆序执行。
- **Request/Response**：封装 HTTP 请求和响应，支持流式响应、文件响应。
- **WebSocket**：原生 WebSocket 支持。
- **TestClient**：基于 httpx，进程内测试 ASGI 应用，无需启动服务器（本教程所有示例都用它）。
- **BackgroundTasks**：响应返回后异步执行任务（如发邮件）。

> 💡 **为什么 FastAPI 不直接实现 ASGI**：分层让 FastAPI 专注"开发者体验"层（校验、文档、DI），把底层 HTTP 处理交给成熟稳定的 Starlette。这种分工也意味着 Starlette 的性能优化（uvloop、httptools）FastAPI 直接受益。

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

### Pydantic v1 vs v2：Rust 核心带来的变革

FastAPI 0.100+ 默认用 Pydantic v2。v2 是一次"内部重写"，最显著的变化是用 **Rust** 重写了校验和序列化的核心逻辑（\`pydantic-core\`），Python 层只剩薄薄的 API 壳。这带来两个好处：性能提升 5~50 倍，错误信息更结构化。

| 维度 | Pydantic v1 | Pydantic v2 |
| --- | --- | --- |
| **核心语言** | 纯 Python | Rust（pydantic-core）+ Python 壳 |
| **校验速度** | 基准 | 快 5~50 倍 |
| **校验器** | \`@validator\` | \`@field_validator\` / \`@model_validator\` |
| **转字典** | \`.dict()\` | \`.model_dump()\`（\`.dict()\` 废弃） |
| **从字典创建** | \`.parse_obj()\` | \`.model_validate()\` |
| **配置** | 内部 \`class Config\` | \`model_config = ConfigDict(...)\` |
| **ORM 模式** | \`orm_mode=True\` | \`from_attributes=True\` |
| **错误信息** | 简单 | 结构化（含 \`type\`/\`loc\`/\`ctx\`） |
| **严格模式** | 默认宽松 | 可选 \`strict=True\` |

迁移要点：v2 大部分 API 兼容 v1，但有破坏性改动。FastAPI 通过 \`pydantic.v1\` 兼容模块让旧代码逐步迁移。新项目直接用 v2。

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

底层原理：FastAPI（其实是 Starlette）在分发请求时检查路由函数是不是协程函数（\`inspect.iscoroutinefunction\`）。如果是 \`async def\`，直接 \`await\` 它；如果是普通 \`def\`，丢给 \`anyio.to_thread.run_sync\` 在线程池里跑。线程池默认大小 40，可通过 \`anyio.to_thread.current_default_thread_limiter().total\` 调整。

### 安装

只需要两条命令：

\`\`\`bash
# 安装 FastAPI 和 ASGI 服务器
pip install fastapi uvicorn[standard]
\`\`\`

\`uvicorn[standard]\` 会装上 uvloop（高性能事件循环）、httptools（HTTP 解析器）等加速依赖。如果你只装 \`uvicorn\`（不带 standard），也能跑，只是性能差一些。

### 虚拟环境最佳实践

在真实项目里，永远不要直接往系统 Python 装包——多个项目会互相污染依赖版本。最佳实践是**每个项目一个虚拟环境**：

\`\`\`bash
# Python 3.9+ 内置 venv（推荐）
python3 -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\\Scripts\\activate         # Windows
pip install fastapi uvicorn[standard]

# 退出虚拟环境
deactivate
\`\`\`

更现代的工具链选择：
- **\`venv\`**：标准库，最通用，没有额外依赖。
- **\`uv\`**：Rust 写的超快包管理器（2024 年 Astral 出品），装包比 pip 快 10-100 倍，还能管虚拟环境和 Python 版本，强烈推荐。
- **\`poetry\`** / **\`pdm\`**：项目级依赖管理，带 \`pyproject.toml\`、lockfile，适合严肃项目。
- **\`conda\`**：适合数据科学场景（需要非 Python 依赖如 numpy 的 BLAS）。

\`\`\`bash
# 用 uv 创建虚拟环境并装包（示例）
uv venv
source .venv/bin/activate
uv pip install fastapi uvicorn[standard]
\`\`\`

把依赖固定到 \`requirements.txt\`：
\`\`\`bash
pip freeze > requirements.txt
pip install -r requirements.txt   # 别人 clone 后一键装
\`\`\`

> ⚠️ **常见陷阱**：把 \`.venv/\` 目录提交到 git 是大忌——它包含绝对路径，且体积大。一定要加到 \`.gitignore\`。

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
- \`--host 0.0.0.0\` —— 监听所有网卡（默认只监听 127.0.0.1）。
- \`--port 8000\` —— 端口（默认 8000）。
- \`--workers 4\` —— 生产环境多进程，建议设成 CPU 核数 \`\` 2~4。

访问 \`http://127.0.0.1:8000/\` 得到 \`{"msg":"hello, FastAPI"}\`。

### 自动文档：/docs 和 /redoc

FastAPI 最让人惊艳的特性之一是**开箱即用的交互式 API 文档**：

- **\`/docs\`** —— Swagger UI，可交互：每个路由都有"Try it out"按钮，直接在浏览器里发请求看响应。
- **\`/redoc\`** —— ReDoc，只读、排版更优雅，适合对外分享。
- **\`/openapi.json\`** —— OpenAPI 3.1 规范的 JSON Schema，可以被任意 OpenAPI 工具消费（生成客户端 SDK、Postman 导入等）。

这些文档的"内容"全部来自你的代码——路由路径、参数类型、Pydantic 模型、\`description\` 字段，全都自动同步，绝不会"代码和文档不一致"。

底层流程：应用启动时，FastAPI 遍历所有路由，把路径、HTTP 方法、参数（Path/Query/Header/Body）、Pydantic 模型编译成 OpenAPI schema 字典，挂在 \`app.openapi()\` 方法上。访问 \`/openapi.json\` 时序列化成 JSON 返回；\`/docs\` 和 \`/redoc\` 只是返回一个引用该 JSON 的 HTML 页面。

如果想关闭文档（生产环境安全考虑）：
\`\`\`python
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
\`\`\`

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

### 常见陷阱与最佳实践

- **陷阱 1**：在 \`async def\` 里调用同步阻塞 IO（\`requests.get\`、\`time.sleep\`），会卡住整个事件循环，所有并发优势归零。正确做法：改用 \`def\` 路由，或用 \`await run_in_threadpool(...)\`。
- **陷阱 2**：忘了加 \`--reload\`，改代码看不到效果；又或者在生产环境加了 \`--reload\`，每次改文件重启导致服务抖动。
- **陷阱 3**：把数据库密码硬编码进 \`main.py\` 提交到 git。应该用环境变量 + \`pydantic-settings\` 的 \`BaseSettings\` 读取。
- **最佳实践**：每个项目一个 \`.venv\`，依赖写进 \`requirements.txt\` 或 \`pyproject.toml\`，\`.gitignore\` 排除 \`.venv/\`、\`__pycache__/\`、\`*.db\`。
- **面试要点**：能说出 ASGI/WSGI 的区别、FastAPI 为什么快（Starlette + Pydantic v2 Rust 核心 + async）、\`def\` 路由和 \`async def\` 路由的调度差异，是考察"是否理解框架本质"的常见指标。

### 本章小结

- FastAPI 是基于类型提示的现代 Python Web 框架，由 tiangolo 创建。
- 核心特性：高性能、类型驱动、自动文档、异步、依赖注入。
- 与 Flask/Django 比：API 优先、性能更高、文档自动化，但全栈能力不如 Django。
- ASGI 是 WSGI 的异步继任者，FastAPI 建在 Starlette（ASGI 框架）之上，分层清晰。
- 技术栈：FastAPI + Uvicorn + Pydantic + SQLAlchemy + PyJWT。
- Pydantic v2 用 Rust 重写核心，比 v1 快 5~50 倍，API 更清晰。
- \`def\` 路由放线程池，\`async def\` 路由在事件循环——同步库用前者，异步库用后者。
- 安装：\`pip install fastapi uvicorn[standard]\`；启动：\`uvicorn main:app --reload\`。
- 虚拟环境每项目一个，用 \`venv\` 或 \`uv\`，依赖固定到 \`requirements.txt\`。
- 自动文档：\`/docs\`（Swagger）、\`/redoc\`、\`/openapi.json\`，由路由和模型自动生成。

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

这些装饰器本质上是 \`app.add_api_route(path, endpoint, methods=[...])\` 的语法糖。装饰器执行时会把 \`path\`、函数对象、HTTP 方法注册到 \`app.router.routes\` 列表里，并在应用启动时编译成 OpenAPI 文档。理解这一点有助于解释为什么"声明顺序决定匹配顺序"——\`routes\` 就是个有序列表。

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

### 路径转换器类型

FastAPI（继承自 Starlette）支持几种"路径转换器"，用 \`{param:type}\` 语法指定匹配模式：

| 转换器 | 匹配规则 | 示例路径 | 示例匹配 |
| --- | --- | --- | --- |
| \`str\`（默认） | 匹配任意非 \`/\` 字符串 | \`/users/{name}\` | \`/users/alice\` ✓ \`/users/alice/bob\` ✗ |
| \`int\` | 匹配整数 | \`/posts/{id:int}\` | \`/posts/42\` ✓ \`/posts/4.2\` ✗ |
| \`float\` | 匹配浮点数 | \`/scores/{v:float}\` | \`/scores/3.14\` ✓ |
| \`uuid\` | 匹配 UUID | \`/items/{uid:uuid}\` | \`/items/550e8400-...\` ✓ |
| \`path\` | 匹配**含 \`/\`** 的整段路径 | \`/files/{fpath:path}\` | \`/files/a/b/c.txt\` ✓ |

\`\`\`python
# path 转换器：匹配多级路径，常用于文件下载
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}
# /files/docs/2024/report.pdf -> file_path="docs/2024/report.pdf"
\`\`\`

**原理**：Starlette 把每个路径模式编译成正则——\`{param}\` → \`([^/]+)\`，\`{param:path}\` → \`(.*?)\`，\`{param:int}\` → \`(\\d+)\`。请求来时按 \`routes\` 列表顺序用正则匹配，第一个匹配的胜出。

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
- \`title\`：OpenAPI schema 的标题
- \`examples\`：示例值，会出现在文档里

\`...\` 是 Python 的 \`Ellipsis\`，表示"必需"——路径参数本来就是必需的，写 \`...\` 是为了配合 \`Path()\` 使用。

> ⚠️ **陷阱**：路径参数不能用 \`Query()\`，必须用 \`Path()\`。如果给路径参数写 \`ge=1\` 但不加 \`Path()\`（如 \`post_id: int = 1\`），FastAPI 会把它当成"默认值 1 的查询参数"，语义错乱。规则：**路径参数一定要用 \`Path()\` 显式声明**。

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

FastAPI 判断参数"是路径参数还是查询参数"的规则：函数参数名如果出现在路径 \`{...}\` 里，就是路径参数；否则是查询参数（除非类型是 Pydantic 模型或 \`Depends\`，那分别是请求体和依赖）。这个判断在路由注册时一次性完成，运行时直接按解析后的规则走。

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
列表约束：\`min_length\`、\`max_length\`（元素个数）。

**多值查询参数**：用 \`list\` 类型接收重复的 key：
\`\`\`python
@app.get("/posts")
def list_posts(tags: list[str] = Query([])):
    # /posts?tags=python&tags=fastapi -> tags=["python", "fastapi"]
    return {"tags": tags}
\`\`\`

**别名**：当查询参数名不是合法 Python 标识符（如 \`user-id\`）时，用 \`alias\`：
\`\`\`python
@app.get("/posts")
def list_posts(user_id: int = Query(..., alias="user-id")):
    # /posts?user-id=42 -> user_id=42
    return {"user_id": user_id}
\`\`\`

**弃用标记**：用 \`deprecated=True\` 在文档里标记参数已废弃：
\`\`\`python
old_param: str = Query(None, deprecated=True, description="已废弃，用 new_param")
\`\`\`

### 路由匹配算法与路径顺序陷阱（必踩坑）

FastAPI 按声明顺序匹配路由——路由表是个**有序列表**，请求来时从头遍历，第一个匹配的胜出。**更具体的路径必须放在更通用的路径前面**：

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

**匹配算法详解**：Starlette 把每个路径模式预编译成正则。请求到来时，按 \`routes\` 注册顺序逐个用 \`re.match\` 匹配。这是 O(n) 线性扫描——对于几百条路由没问题，但路由表上千时可以考虑用 \`starlette.routing\` 的优化（如分组）。FastAPI 不会自动按"具体程度"排序，所以**声明顺序就是匹配优先级**，开发者要自己排好。

**原理图解**：
\`\`\`
routes 注册顺序:  [/users/me, /users/{id}, /users/{id}/posts]
请求 GET /users/me
  → 尝试 routes[0] /users/me  ✅ 匹配，返回 get_me
请求 GET /users/42
  → 尝试 routes[0] /users/me  ✗
  → 尝试 routes[1] /users/{id} ✅ 匹配，user_id="42"
\`\`\`

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

**原理**：FastAPI 检测到类型是 \`Enum\` 子类时，会把所有枚举值编译进正则（如 \`admin|user|guest\`），并在 OpenAPI schema 里生成 \`enum: ["admin","user","guest"]\`。这同时实现了"路径层匹配 + 校验层兜底"。

### 路由分组与 APIRouter

当项目路由变多，全堆在 \`main.py\` 会失控。FastAPI 提供 \`APIRouter\` 做路由分组——把一组路由封装到子路由器，再统一挂载到 app：

\`\`\`python
from fastapi import APIRouter, Depends

posts_router = APIRouter(prefix="/posts", tags=["文章"])

@posts_router.get("/")
def list_posts():
    ...

@posts_router.get("/{post_id}")
def get_post(post_id: int):
    ...

@posts_router.post("/", status_code=201)
def create_post(post: PostIn):
    ...

# 在 main.py 挂载
from fastapi import FastAPI
app = FastAPI()
app.include_router(posts_router)
# 等价于注册了 /posts/、/posts/{post_id}、/posts/（POST）
\`\`\`

\`APIRouter\` 的关键参数：
- \`prefix\`：给所有路由加前缀，避免每个装饰器重复写 \`/posts\`。
- \`tags\`：在 OpenAPI 文档里把路由归到一组（Swagger UI 按 tag 分块显示）。
- \`dependencies\`：给整组路由加依赖（如强制认证），下一章详讲。
- \`responses\`：统一声明这组路由的错误响应。

\`\`\`python
# 多 router 组合的典型项目结构
app.include_router(posts_router, prefix="/posts", tags=["文章"])
app.include_router(users_router, prefix="/users", tags=["用户"])
app.include_router(auth_router, prefix="/auth", tags=["认证"])
\`\`\`

> 💡 **prefix 重复的陷阱**：如果 \`APIRouter(prefix="/posts")\` 已经设了 prefix，\`include_router(posts_router, prefix="/posts")\` 又加一次，路径会变成 \`/posts/posts/\`。规则：prefix 只在一处设，推荐在 \`include_router\` 时设，router 内部用相对路径。

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

**参数解析优先级**：FastAPI 按以下顺序判断每个参数的来源：
1. 参数名出现在路径 \`{...}\` 里 → 路径参数
2. 类型是 Pydantic \`BaseModel\` → 请求体
3. 类型是 \`Depends(...)\` → 依赖注入
4. 类型是 \`Body(...)\`、\`Form(...)\`、\`File(...)\` → 显式声明的体/表单/文件
5. 其余 → 查询参数

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

\`response_model\` 的进阶用法：
- \`response_model_exclude\`：排除指定字段（如 \`{"password"}\`）。
- \`response_model_include\`：只包含指定字段。
- \`response_model_by_alias\`：用字段别名输出（如把 \`user_id\` 输出成 \`userId\`）。
- \`response_model_exclude_none\`：跳过值为 None 的字段。

**\`status_code\`**：自定义成功响应的状态码：

\`\`\`python
@app.post("/posts", status_code=201)  # 创建成功用 201
def create_post(post: PostIn):
    ...
\`\`\`

常用状态码：

| 状态码 | 含义 | 典型场景 |
| --- | --- | --- |
| 200 | OK | GET 成功 |
| 201 | Created | POST 创建成功 |
| 204 | No Content | DELETE/PUT 成功，无响应体 |
| 400 | Bad Request | 业务错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 已认证但无权限 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 请求格式对但校验失败 |
| 500 | Internal Server Error | 服务器异常 |

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
- \`ctx\`：上下文（如约束的具体值 \`{"min_length": 8}\`），便于前端做本地化提示。
- \`url\`：指向 pydantic 错误文档的链接，方便查这个错误的语义。

这种结构化错误信息对前端非常友好，可以精准定位哪个字段出了问题。

> 💡 **自定义错误处理器**：如果想改 422 的响应格式，可以注册异常处理器：
> \`\`\`python
> from fastapi import Request
> from fastapi.responses import JSONResponse
>
> @app.exception_handler(ValueError)
> async def value_error_handler(request: Request, exc: ValueError):
>     return JSONResponse(status_code=400, content={"error": str(exc)})
> \`\`\`

### 常见陷阱与最佳实践

- **陷阱 1（路径顺序）**：\`/users/{id}\` 写在 \`/users/me\` 前面，导致访问 \`/users/me\` 时 \`id="me"\`，类型转换失败 422。**永远把静态路径放前面**。
- **陷阱 2（路径参数没用 Path）**：\`post_id: int = 1\` 会被当成默认值 1 的查询参数，而非路径参数。路径参数必须用 \`Path(...)\`。
- **陷阱 3（Optional 不加默认值）**：\`q: Optional[str]\` 不写 \`= None\`，FastAPI 会认为它必填，访问不带 \`q\` 就 422。
- **陷阱 4（prefix 重复）**：\`APIRouter(prefix="/x")\` + \`include_router(router, prefix="/x")\` → 路径变 \`/x/x/\`。
- **最佳实践**：项目超过 10 个路由就用 \`APIRouter\` 按资源拆分；给每个路由写 \`summary\` 和 \`description\`，文档自动漂亮；用 \`Enum\` 限定枚举参数，比用 \`str\` + 自己校验更规范。
- **面试要点**：能解释 FastAPI 路由匹配是"有序线性扫描 + 正则"，为什么静态路径要放前面；能说出 \`Path\`/\`Query\`/\`Body\` 三者的区别和适用场景。

### 本章小结

- 路径操作装饰器：\`@app.get/post/put/patch/delete\`，每个 HTTP 方法一个，本质是 \`add_api_route\` 的语法糖。
- 路径参数 \`{param}\`，类型注解自动转换和校验；支持 \`str\`/\`int\`/\`float\`/\`uuid\`/\`path\` 五种转换器。
- \`Path(...)\` 加约束（ge/le 等），路径参数必须用 \`Path()\` 不能用 \`Query()\`。
- 查询参数是 URL \`?\` 后的键值对，有默认值则可选，无默认值则必填，\`Query(...)\` 加约束，支持多值和别名。
- 路由匹配是有序线性扫描，静态路径必须在动态路径前面（\`/users/me\` 在 \`/users/{id}\` 前）。
- \`APIRouter\` 做路由分组，\`prefix\`/\`tags\`/\`dependencies\` 统一管理。
- 枚举参数用 \`Enum\` 限定取值，文档显示成下拉框。
- \`response_model\` 过滤响应字段，\`status_code\` 自定义状态码。
- 422 错误的 \`detail\` 是结构化数组，\`loc\`/\`type\`/\`ctx\` 精确定位和描述错误。

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

### Pydantic v2 核心改动：Rust 内核带来的变革

v2 最大的变化是把校验核心用 Rust 重写成独立的 \`pydantic-core\` 包，Python 层只保留 API 壳。这是 v2 性能暴涨的根本原因。

**架构对比**：
\`\`\`
v1:  Python 代码 → 校验逻辑（纯 Python）→ 结果
v2:  Python 代码 → Schema 构建器（Python）→ pydantic-core 校验器（Rust）→ 结果
\`\`\`

v2 在模型**类定义时**（\`__init_subclass__\`）就把字段类型、约束编译成一个 Rust 校验器对象（\`SchemaValidator\`），缓存在类上。每次 \`model_validate\` 调用时直接交给 Rust 校验器跑，全程不回 Python 解释器（除了你自定义的校验器），所以快。

| 维度 | Pydantic v1 | Pydantic v2 |
| --- | --- | --- |
| **核心语言** | 纯 Python | Rust（pydantic-core）+ Python 壳 |
| **校验速度** | 基准 | 快 5~50 倍 |
| **校验器装饰器** | \`@validator\` | \`@field_validator\` / \`@model_validator\` |
| **转字典** | \`.dict()\` | \`.model_dump()\`（\`.dict()\` 废弃但兼容） |
| **从字典创建** | \`.parse_obj()\` | \`.model_validate()\` |
| **从 JSON 创建** | \`.parse_raw()\` | \`.model_validate_json()\` |
| **配置** | 内部 \`class Config\` | \`model_config = ConfigDict(...)\` |
| **ORM 模式** | \`orm_mode=True\` | \`from_attributes=True\` |
| **错误信息** | 简单 dict | 结构化（含 \`type\`/\`loc\`/\`ctx\`/\`url\`） |
| **严格模式** | 默认宽松 | 可选 \`strict=True\`（不做隐式类型转换） |
| **可变默认值** | 要 \`Field(default_factory=...)\` | 仍要，但更智能检测 |

> 💡 **迁移提示**：v2 提供 \`pydantic.v1\` 兼容模块，旧代码可以 \`from pydantic.v1 import BaseModel\` 逐步迁移。新项目直接用 v2 API。

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
- \`model_fields\`：类属性，返回所有字段的元信息字典（v1 是 \`__fields__\`）。
- \`model_rebuild()\`：当模型有前向引用（字符串注解）时，重建校验器。

**内部实现细节**：\`model_validate\` 不是简单赋值。它把输入字典交给 Rust 校验器，校验器按每个字段的类型和约束逐个检查：类型转换（\`"1"\` → \`1\`）、约束验证（\`min_length\`）、嵌套递归、自定义校验器。任何一步失败就收集到错误列表，最后如果有错就抛 \`ValidationError\`。这就是为什么 v2 快——校验全程在 Rust 里跑，没有 Python 解释器开销。

### 字段类型系统

Pydantic 支持丰富的字段类型：

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| \`str\` | 字符串 | \`name: str\` |
| \`int\` / \`float\` | 整数 / 浮点 | \`age: int\`, \`score: float\` |
| \`bool\` | 布尔 | \`active: bool\` |
| \`list\` / \`list[int]\` | 列表（可带元素类型） | \`tags: list[str]\` |
| \`tuple\` / \`tuple[int, str]\` | 元组（定长定型） | \`point: tuple[int, int]\` |
| \`dict\` / \`dict[str, int]\` | 字典 | \`meta: dict\` |
| \`set\` | 集合（去重） | \`tags: set[str]\` |
| \`Optional[str]\` \| 可选（等价 \`str | None\`） | \`bio: Optional[str] = None\` |
| \`datetime\` / \`date\` | 日期时间（自动解析 ISO 格式） | \`created_at: datetime\` |
| \`EmailStr\` | 邮箱（需装 email-validator） | \`email: EmailStr\` |
| \`HttpUrl\` | URL（自动校验格式） | \`homepage: HttpUrl\` |
| \`UUID\` | UUID | \`id: UUID\` |
| \`Enum\` | 枚举 | \`role: Role\` |
| \`Literal\` | 字面量（限定几个值） | \`kind: Literal["a","b"]\` |
| \`Any\` | 任意类型（不校验） | \`extra: Any\` |

> 💡 \`Optional[X]\` 和 \`X | None\` 等价，都表示"可以是 X 或 None"。但**还要给默认值 None 才是真正可选**：\`bio: Optional[str] = None\`。只写 \`bio: Optional[str]\` 不给默认值，Pydantic 会要求必传 \`None\` 或 \`str\`。

**类型转换规则**（默认宽松模式）：
\`\`\`python
User(id="42", active="true", score="3.14")
# id: "42" -> 42 (int)
# active: "true" -> True (bool)
# score: "3.14" -> 3.14 (float)
\`\`\`

想关闭隐式转换，用 \`strict=True\`：
\`\`\`python
class StrictUser(BaseModel):
    model_config = ConfigDict(strict=True)
    id: int  # 传 "42" 会报错，必须传 int 42
\`\`\`

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
- 数值：\`ge\`（≥）、\`gt\`（>）、\`le\`（≤）、\`lt\`（<）、\`multiple_of\`。
- 列表/字典/集合：\`min_length\`、\`max_length\`（元素个数）。
- 通用：\`default\`（默认值）、\`default_factory\`（可变默认值的工厂函数）、\`description\`（文档说明）、\`examples\`（示例）、\`alias\`（别名）、\`exclude\`（序列化时排除）。

\`...\`（Ellipsis）表示"必填，无默认值"。也可以用 \`Field(default=...)\` 显式写。

> ⚠️ **可变默认值陷阱**：\`tags: list[str] = []\` 会让所有实例共享同一个列表（Python 经典坑）。必须用 \`default_factory\`：\`tags: list[str] = Field(default_factory=list)\`。

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

FastAPI 收到嵌套 JSON 请求体时，会递归校验每一层。嵌套可以是任意深度，也可以用 \`list[Address]\` 拿模型列表：

\`\`\`python
class Company(BaseModel):
    name: str
    employees: list[User]  # 嵌套模型列表

# 一层套一层，Pydantic 全部递归校验
company = Company(name="ACME", employees=[
    {"name": "alice", "address": {"city": "北京", "street": "x"}, "tags": []},
    {"name": "bob",   "address": {"city": "上海", "street": "y"}, "tags": ["vip"]},
])
\`\`\`

### 请求体：把 BaseModel 用作参数

在 FastAPI 路由里，把 Pydantic 模型作为参数类型，FastAPI 自动从请求体 JSON 解析：

\`\`\`python
@app.post("/users")
def create_user(user_in: UserCreate):
    # 到这里 user_in 已经是合法的 UserCreate 实例
    return user_in
\`\`\`

请求体必须是 JSON，\`Content-Type: application/json\`。FastAPI 自动校验，非法时返回 422。

**内部流程**：FastAPI 检测到参数类型是 \`BaseModel\` 子类，注册一个"请求体解析器"。请求来时读取 \`await request.json()\`，交给 \`UserCreate.model_validate\` 校验，失败就抛 \`RequestValidationError\`（FastAPI 捕获后转 422）。

### 校验错误：422 响应与错误处理机制

校验失败时，FastAPI 返回 422 + 结构化错误：

\`\`\`json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "123",
      "ctx": {"min_length": 8},
      "url": "https://errors.pydantic.dev/2.x/v/string_too_short"
    }
  ]
}
\`\`\`

\`loc\` 的第一个元素是来源：\`body\`（请求体）、\`query\`、\`path\`、\`header\`、\`cookie\`。第二个元素是字段名（嵌套字段会有第三层、第四层）。

错误字段详解：
- \`type\`：机器可读的错误码（\`string_too_short\`/\`int_parsing\`/\`greater_than_equal\` 等），前端可据此做本地化。
- \`loc\`：定位到具体字段，嵌套用数组下标（如 \`["body","users",0,"name"]\`）。
- \`msg\`：人类可读的英文说明。
- \`input\`：导致错误的原始输入值（生产环境可能要屏蔽，避免泄露敏感数据）。
- \`ctx\`：上下文（如 \`{"min_length": 8}\`），便于前端拼提示。
- \`url\`：指向 pydantic 错误文档的链接。

**自定义 422 响应格式**：注册 \`RequestValidationError\` 处理器：
\`\`\`python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"code": 422, "errors": exc.errors()},
    )
\`\`\`

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

**\`from_attributes\` 的原理**：开启后，Pydantic 校验器看到非 dict 输入时，会用 \`getattr(obj, field_name)\` 取属性，而不是 \`obj[field_name]\`。这样 ORM 对象、dataclass 实例都能直接喂给 \`model_validate\`。

### 序列化与 model_dump

\`model_dump()\` 不只是"转字典"，它支持精细控制：

\`\`\`python
user = User(id=1, name="alice", password="secret", created_at=datetime.now())

# 全量转字典
user.model_dump()
# {"id": 1, "name": "alice", "password": "secret", "created_at": datetime(...)}

# 排除敏感字段
user.model_dump(exclude={"password"})
# {"id": 1, "name": "alice", "created_at": ...}

# 只包含指定字段
user.model_dump(include={"id", "name"})

# 跳过值为 None 的字段
user.model_dump(exclude_none=True)

# 跳过默认值（只输出和默认值不同的字段）
user.model_dump(exclude_defaults=True)

# 用别名输出（如 user_id -> userId）
user.model_dump(by_alias=True)

# 转 JSON 时把 datetime 转成 ISO 字符串
user.model_dump_json()  # 自动处理 datetime/date/UUID
\`\`\`

**序列化 vs 校验**：v2 把"校验"和"序列化"分成两个独立的 Rust 模块（\`SchemaValidator\` 和 \`SchemaSerializer\`），各自编译。这意味着 \`model_dump\` 和 \`model_validate\` 性能都很高，且可以独立配置（如序列化时排除字段不影响校验）。

### 自定义校验器：@field_validator 高级用法

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

校验器返回的值会替换原值（可以做规范化，如 \`return v.strip()\`）。抛 \`ValueError\` 或 \`AssertionError\` 会转成 422 错误。

**校验多个字段**：\`@field_validator("field1", "field2")\` 同一个校验器对多个字段生效。

**校验时机**（\`mode\` 参数）：
\`\`\`python
@field_validator("age", mode="before")
@classmethod
def parse_age(cls, v):
    # mode="before"：在类型转换之前执行，拿到的是原始输入
    if isinstance(v, str) and v.endswith("岁"):
        return int(v[:-1])
    return v

@field_validator("age", mode="after")
@classmethod
def check_age(cls, v: int):
    # mode="after"：在类型转换之后执行，v 已经是 int
    if v < 0:
        raise ValueError("年龄不能为负")
    return v
\`\`\`

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

\`@model_validator(mode="before")\` 则在字段校验前对整个输入 dict 操作，常用于"字段重命名"或"条件必填"：
\`\`\`python
@model_validator(mode="before")
@classmethod
def normalize(cls, data):
    if isinstance(data, dict) and "userName" in data:
        data["username"] = data.pop("userName")
    return data
\`\`\`

### model_config 常用配置

\`\`\`python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,         # 支持从 ORM 对象属性读取
        str_strip_whitespace=True,    # 字符串自动 strip
        str_min_length=1,             # 全局字符串最小长度
        extra="forbid",               # 多余字段报错（默认 ignore 忽略）
        populate_by_name=True,        # 允许用字段名和别名都能传入
        json_schema_extra={           # 给 OpenAPI schema 加额外信息
            "examples": [{"id": 1, "name": "alice"}]
        },
    )
\`\`\`

\`extra\` 的三种模式：
- \`"ignore"\`（默认）：多余字段直接丢弃。
- \`"forbid"\`：多余字段报 422 错误，适合"严格契约"API。
- \`"allow"\`：多余字段保留在模型里（可访问）。

### 对比 dataclass 和 ORM 模型

| 维度 | Pydantic BaseModel | dataclasses.dataclass | SQLAlchemy 模型 |
| --- | --- | --- | --- |
| **校验** | 自动、运行时 | 无 | 无（靠 DB 约束） |
| **序列化** | \`model_dump()\` / JSON | 手写 | 手写 |
| **用途** | API 数据传输（DTO） | 纯数据容器 | 数据库映射 |
| **性能** | 快（Rust 内核） | 最快（标准库） | 慢（含 ORM 开销） |
| **类型提示** | 强制、驱动一切 | 可选 | 强制 |
| **不可变性** | 默认可变，可配 \`frozen\` | 默认可变，可配 \`frozen\` | 可变 |
| **继承** | 支持 | 支持 | 支持 |

经验：**Pydantic 用于 API 边界**（请求/响应），**dataclass 用于内部数据结构**，**SQLAlchemy 模型用于数据库**。三者各司其职，不要混用。

常见模式是"两个 Pydantic 模型对应一个 ORM 模型"：\`UserCreate\`（请求体）和 \`UserOut\`（响应体）对应 \`User\`（ORM）。这样密码只在 \`UserCreate\` 里出现，绝不进 \`UserOut\`，从结构上杜绝泄露。

### 常见陷阱与最佳实践

- **陷阱 1（可变默认值）**：\`tags: list = []\` 共享列表。必须 \`Field(default_factory=list)\`。
- **陷阱 2（Optional 不加默认值）**：\`bio: Optional[str]\` 不写 \`= None\`，Pydantic 会要求必传。
- **陷阱 3（v1 API 残留）**：用 \`.dict()\`/\`.parse_obj()\` 在 v2 会触发废弃警告，应换 \`model_dump()\`/\`model_validate()\`。
- **陷阱 4（密码泄露）**：路由直接 \`return user_orm\`，如果没有 \`response_model\` 或模型没排除 password，密码会进 JSON 响应。永远显式声明 \`response_model\`。
- **陷阱 5（extra 字段）**：默认 \`ignore\` 会悄悄丢弃多余字段，调试时困惑。开发期可设 \`extra="forbid"\` 暴露问题。
- **最佳实践**：请求体和响应体用不同模型（\`XxxCreate\`/\`XxxOut\`）；用 \`@field_validator\` 做规范化（strip、lower）而不只是校验；用 \`examples\` 给文档加示例。
- **面试要点**：能说出 v2 为什么快（Rust 核心 \`pydantic-core\`）、\`model_validate\` 和 \`model_dump\` 的对称性、\`@field_validator\` 的 \`mode=before/after\` 区别。

### 本章小结

- Pydantic 基于类型提示做数据校验，是 FastAPI 的核心。
- v2 用 Rust 重写核心（\`pydantic-core\`），校验/序列化各自编译，比 v1 快 5~50 倍。
- \`BaseModel\` 定义模型，\`Field(...)\` 加约束（min_length/pattern/ge 等）。
- 字段类型：str/int/float/bool/list/dict/tuple/set/Optional/datetime/EmailStr/HttpUrl/UUID/Literal/Enum。
- 嵌套模型递归校验，支持任意深度和模型列表。
- 请求体：把 BaseModel 作为参数类型，FastAPI 自动解析 JSON。
- \`response_model\` 过滤响应字段，避免泄露密码；\`from_attributes\` 支持从 ORM 对象读取。
- \`model_dump()\` 支持精细控制（exclude/include/exclude_none/by_alias）。
- v2 关键方法：\`model_dump()\`、\`model_validate()\`、\`@field_validator(mode=before/after)\`、\`@model_validator\`。
- 校验失败返回 422，\`detail\` 数组结构化描述每个错误，含 \`type\`/\`loc\`/\`ctx\`/\`url\`。

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

### ORM vs Core：SQLAlchemy 的两层架构

SQLAlchemy 分两层：**Core**（SQL 表达式层）和 **ORM**（对象关系映射层）。两者共享底层的连接池、SQL 编译器、类型系统，但 API 风格不同。

\`\`\`
SQLAlchemy
├── Core：SQL Expression Language
│   ├── 表对象 Table、列 Column
│   ├── select()/insert()/update()/delete() 表达式
│   └── 结果是 Row 对象（类似 namedtuple）
└── ORM：建立在 Core 之上
    ├── 模型类（继承 DeclarativeBase）
    ├── Session 工作单元
    └── relationship 关系导航
\`\`\`

| 维度 | Core | ORM |
| --- | --- | --- |
| **抽象层级** | SQL 表达式（贴近 SQL） | 对象关系映射（贴近 Python 对象） |
| **学习曲线** | 中（要懂 SQL） | 中高（要懂 ORM 概念） |
| **性能** | 高（接近裸 SQL） | 中（有 ORM 开销） |
| **复杂查询** | 灵活、直接 | 有时要绕，或回退 Core |
| **关系导航** | 手写 JOIN | \`user.posts\` 自动加载 |
| **适合场景** | 报表、批量、ETL | 业务 CRUD、领域模型 |

经验：FastAPI 项目里**主要用 ORM**（业务 CRUD 友好），**复杂报表/批量用 Core**（性能友好）。两者能在同一个 Session 里混用——ORM 查询底层就是 Core 的 \`select()\`。

\`\`\`python
# Core 风格：直接操作 Table
from sqlalchemy import Table, select
users = Table("users", metadata, autoload_with=engine)
stmt = select(users).where(users.c.id == 1)
row = engine.connect().execute(stmt).first()

# ORM 风格：操作模型类
stmt = select(User).where(User.id == 1)
user = db.execute(stmt).scalar_one()
\`\`\`

### SQLAlchemy 1.x vs 2.0 风格

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
- \`Mapped[int]\` 类型注解让 IDE/mypy 能推断字段类型，补全更可靠——访问 \`user.id\` 时 IDE 知道是 \`int\`，访问 \`user.name\` 知道是 \`str\`，旧风格只能猜 \`Any\`。
- \`mapped_column\` 比旧 \`Column\` 更显式地区分"映射配置"和"类型"。
- 和 FastAPI + Pydantic 的类型提示哲学一致。

2.0 的其他重要改动：

| 维度 | 1.x | 2.0 |
| --- | --- | --- |
| **查询 API** | \`db.query(User).filter(...)\` | \`db.execute(select(User).where(...))\` |
| **基类** | \`declarative_base()\` 返回类 | \`class Base(DeclarativeBase)\` |
| **字段定义** | \`Column(Integer, ...)\` | \`Mapped[int] = mapped_column(...)\` |
| **可空字段** \| \`Column(String, nullable=True)\` | \`Mapped[str | None] = mapped_column(...)\`（由 \`Optional\` 推断） |
| **结果取值** | \`query.first()\` 直接返回模型 | \`db.execute(stmt).scalar_one()\` 多一层 |
| **事务** | 隐式自动开始 | 显式 \`with engine.begin():\` 或 \`session.begin()\` |

> 💡 2.0 仍兼容 \`db.query(User)\`（叫 "legacy API"），但官方推荐用 \`select()\` 风格。新代码用 \`select()\`。

\`\`\`python
# Mapped[Optional[X]] 自动推断 nullable=True
class User(Base):
    name: Mapped[str]                    # 必填（NOT NULL）
    bio: Mapped[str | None]              # 可选（NULLABLE），mapped_column 自动 nullable=True
\`\`\`

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
- \`nullable=False\`：不允许 NULL（\`Mapped[str]\` 默认就是 NOT NULL，写不写 \`nullable=False\` 都行）。
- \`unique=True\`：唯一约束。
- \`server_default=func.now()\`：数据库层默认值（当前时间）。区别于 \`default=...\`（Python 层默认值，提交前就赋好）。
- \`index=True\`：建索引，加速查询。

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

引擎内部维护一个**连接池**：每次 \`engine.connect()\` 从池里借一个连接，用完归还。池大小默认 5（\`pool_size=5\`），溢出 10（\`max_overflow=10\`），超时 30 秒（\`pool_timeout=30\`）。生产环境高并发要调大，或用 PgBouncer 等外部连接池。

**Session（会话）**：数据库操作的"工作单元"，类似事务：

\`\`\`python
from sqlalchemy.orm import sessionmaker, Session

SessionLocal = sessionmaker(bind=engine)

with SessionLocal() as db:  # 推荐用 with 自动关闭
    user = db.query(User).first()
    # 在 with 块结束前，db 保持着连接和事务
\`\`\`

### Session 生命周期详解

Session 不是"数据库连接"，而是"工作单元"（Unit of Work）——它持有：
- **一个连接**（从池借的，空闲时归还）。
- **身份映射**（identity map）：用主键缓存已加载的对象，同一主键查两次只查一次 DB。
- **待提交队列**：\`db.add()\` 的对象先记在内存，\`db.commit()\` 时一次性 flush 成 SQL。
- **事务状态**：\`commit()\` 提交，\`rollback()\` 回滚。

**生命周期三阶段**：
\`\`\`
1. 创建 Session：从池借连接，开始隐式事务
2. 操作：add/execute/查询——SQL 可能立即发（flush）也可能延迟到 commit
3. 关闭 Session：commit/rollback 事务，归还连接到池
\`\`\`

**flush vs commit**：
- \`db.flush()\`：把待提交队列的 SQL 发到 DB，但不提交事务（可 rollback）。
- \`db.commit()\`：先 flush，再 commit 事务。一般用 \`commit\`，除非要在提交前拿到自增 id（用 \`flush\` 后 \`user.id\` 就有值了）。

**陷阱**：Session 不是线程安全的！多线程共享一个 Session 会数据错乱。FastAPI 同步路由在线程池跑，所以**每个请求必须独立 Session**（用依赖注入保证，见下文）。

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

### 连接池

\`create_engine\` 默认用 \`QueuePool\`，关键参数：

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    "postgresql://user:pass@localhost/blog",
    poolclass=QueuePool,
    pool_size=10,        # 常驻连接数
    max_overflow=20,     # 突发可额外借的连接数
    pool_timeout=30,     # 借连接超时（秒），超时抛 TimeoutError
    pool_recycle=3600,   # 连接存活时间（秒），避免 DB 端主动断开
    pool_pre_ping=True,  # 借连接前先 ping，避免拿到死连接
)
\`\`\`

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| \`pool_size\` | 5 | 常驻连接数 |
| \`max_overflow\` | 10 | 突发溢出连接数 |
| \`pool_timeout\` | 30 | 借连接等待秒数 |
| \`pool_recycle\` | -1 | 连接回收周期，建议设成小于 DB 的 \`wait_timeout\` |
| \`pool_pre_ping\` | False | 借前 ping，推荐生产开 |

> ⚠️ **常见陷阱**：MySQL 默认 \`wait_timeout=28800\`（8 小时），如果连接闲置超过这个时间，MySQL 会单方面断开，而 SQLAlchemy 池里还存着死连接，下次用就报 "MySQL server has gone away"。解决：\`pool_recycle=3600\`（1 小时回收）或 \`pool_pre_ping=True\`。

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

\`scalars()\` 从 Row 对象里取出第一列（模型实例），\`all()\` 转成 list，\`scalar_one_or_none()\` 返回唯一一条或 None（多条会抛错）。

**Update（更新）**：
\`\`\`python
with SessionLocal() as db:
    user = db.get(User, 1)
    user.name = "alice2"
    db.commit()  # 自动检测变更并 UPDATE
\`\`\`

也可以用 Core 风格批量更新（不加载对象，性能高）：
\`\`\`python
from sqlalchemy import update
db.execute(update(User).where(User.id == 1).values(name="alice2"))
db.commit()
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

> ⚠️ **陷阱**：会话没关闭会泄漏连接，池满了就卡死。用 \`yield\` 依赖能保证 \`finally\` 必执行，但如果你在路由里手动 \`SessionLocal()\` 又忘了 \`close\`，就会泄漏。规则：**永远走依赖注入拿 Session**，不要在路由里手动创建。

### 关系映射：三种类型

#### 一对多

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

#### 一对一

在一对多的基础上加 \`uselist=False\`：

\`\`\`python
class User(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # uselist=False 让 profile 返回单个对象而非列表
    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False)

class Profile(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    user: Mapped["User"] = relationship(back_populates="profile")
\`\`\`

\`unique=True\` 在 DB 层保证一对一，\`uselist=False\` 在 ORM 层让 \`user.profile\` 返回单个对象。

#### 多对多

多对多需要一张**关联表**：

\`\`\`python
from sqlalchemy import Table

# 关联表
post_tags = Table(
    "post_tags", Base.metadata,
    mapped_column("post_id", ForeignKey("posts.id"), primary_key=True),
    mapped_column("tag_id", ForeignKey("tags.id"), primary_key=True),
)

class Post(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    # secondary 指向关联表
    tags: Mapped[list["Tag"]] = relationship(secondary=post_tags, back_populates="posts")

class Tag(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    posts: Mapped[list["Post"]] = relationship(secondary=post_tags, back_populates="tags")
\`\`\`

使用：
\`\`\`python
user = db.get(User, 1)
print(user.posts)  # 自动查询并返回该用户的所有文章

post = db.get(Post, 1)
print(post.author.name)  # 自动查询并返回作者
print(post.tags)         # 多对多：返回所有标签
\`\`\`

### N+1 问题与 eager loading

**N+1 问题**：查询 N 个用户后，访问每个用户的 \`posts\` 会触发 N 次额外查询，总共 N+1 次：

\`\`\`python
users = db.execute(select(User)).scalars().all()  # 1 次查询
for u in users:
    print(u.posts)  # 每个用户 1 次查询，N 个用户 N 次！
\`\`\`

原理：\`relationship\` 默认 \`lazy="select"\`，即"访问时才查"。第一次访问 \`u.posts\` 触发一次 SQL，N 个用户就是 N 次。这在列表页是性能杀手。

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

| 加载策略 | SQL 次数 | 适合 | 备注 |
| --- | --- | --- | --- |
| \`select\`（默认） | N+1 | 单个对象访问关系 | 列表页会 N+1 |
| \`joinedload\` | 1（JOIN） | 一对一、多对一 | 一对多会重复父行，要 \`.unique()\` |
| \`selectinload\` | 2（IN） | 一对多、多对多 | 推荐，无重复行 |
| \`subqueryload\` | 2（子查询） | 一对多 | 旧版用，现在选 selectinload |
| \`raiseload\` | 报错 | 防止意外触发 lazy | 显式禁止懒加载 |

也可以在模型定义时永久指定：
\`\`\`python
posts: Mapped[list["Post"]] = relationship(back_populates="author", lazy="selectin")
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

### 常见陷阱与最佳实践

- **陷阱 1（Session 跨线程）**：Session 非线程安全，多线程共享会错乱。FastAPI 同步路由每个请求必须独立 Session（用 \`Depends(get_db)\`）。
- **陷阱 2（忘记 commit）**：\`db.add(user)\` 只是入队，不 \`commit\` 数据不会进 DB。重启进程数据就没了。
- **陷阱 3（连接泄漏）**：手动 \`SessionLocal()\` 不 \`close\`，池会耗尽。永远走依赖注入。
- **陷阱 4（N+1）**：列表接口没加 \`selectinload\`，首页可能查几十次 DB。用 SQL 日志（\`echo=True\`）排查。
- **陷阱 5（MySQL 断连）**：连接闲置超 \`wait_timeout\` 被 DB 单方面断开。设 \`pool_recycle\` 或 \`pool_pre_ping=True\`。
- **最佳实践**：生产用 PostgreSQL + 连接池；迁移用 Alembic；查询统一用 \`select()\` 风格；列表接口显式 \`selectinload\`；耗时查询加 \`echo=True\` 看 SQL 调优。
- **面试要点**：能说出 Session 和 Connection 的区别（Session 是工作单元，Connection 是底层连接）、N+1 的成因和三种解法、连接池 \`pool_pre_ping\` 的作用。

### 本章小结

- ORM 把表映射成类，SQLAlchemy 是 Python 最成熟的 ORM，分 Core 和 ORM 两层。
- 2.0 风格：\`DeclarativeBase\` + \`Mapped\` + \`mapped_column\`，全面类型注解，\`Mapped[str | None]\` 自动推断 nullable。
- 引擎 \`create_engine\` 全局一次，内含连接池；会话 \`sessionmaker\` 每请求一个，是工作单元非连接。
- Session 生命周期：创建→操作（flush/commit）→关闭（归还连接）。非线程安全。
- 连接池：\`pool_size\`/\`max_overflow\`/\`pool_recycle\`/\`pool_pre_ping\`，生产要调。
- SQLite 内存库适合测试，需配 \`StaticPool\` + \`check_same_thread=False\` 才能在 FastAPI 线程池用。
- CRUD：\`add\`/\`commit\`/\`execute(select(...))\`/\`delete\`，2.0 推荐 \`select()\` 风格。
- 在 FastAPI 用 \`yield\` 依赖管理会话，自动关闭，每请求独立。
- 关系三种：一对多（默认）、一对一（\`uselist=False\`）、多对多（\`secondary\` 关联表）。
- N+1 问题用 \`joinedload\`（一对一/多对一）/\`selectinload\`（一对多/多对多）解决。
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

DI 的价值不止"少写代码"，更重要的是**解耦**：路由只关心业务逻辑，不关心 db 怎么来、token 怎么验、参数怎么解析。这让路由可测试（替换依赖即可 mock）、可复用（同一依赖多路由共享）、可读（签名直接暴露依赖）。

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

### Depends 工作原理

理解 \`Depends\` 的内部机制，能帮你写出更合理的依赖结构。

**注册阶段**（应用启动时）：FastAPI 用 \`inspect.signature\` 扫描路由函数和每个依赖函数的签名，构建一棵"依赖树"。树的根是路由函数，子节点是它的 \`Depends\` 依赖，每个依赖的参数如果还有 \`Depends\`，继续往下展开。这棵树在路由注册时一次性构建并缓存。

**执行阶段**（请求到来时）：FastAPI 按依赖树**拓扑序**（叶子节点优先）执行：
\`\`\`
1. 解析叶子依赖（如 get_db）：调用函数，拿到返回值，缓存
2. 解析中间依赖（如 get_current_user）：先解析它的 Depends（get_db 已缓存，直接用），再解析它的查询/header 参数，最后调用函数
3. 解析根依赖（路由函数）：所有 Depends 都已就绪，注入并调用路由
4. 路由返回响应
5. 逆序清理 yield 依赖的 finally 块
\`\`\`

**原理图解**（以认证链为例）：
\`\`\`
delete_post(id, admin=Depends(get_current_admin))
    └─ get_current_admin(user=Depends(get_current_user))
           └─ get_current_user(db=Depends(get_db), token=Header)
                  ├─ get_db()        # 叶子，先执行，yield db
                  └─ token 从 Header 解析
           # 拿到 db 和 token，查 user
       # 拿到 user，检查 is_admin
# 拿到 admin，执行 delete_post 逻辑
\`\`\`

任何一步抛 \`HTTPException\` 会立即中断，FastAPI 把异常转成对应 HTTP 响应（401/403 等），后续依赖和路由都不会执行。但已 \`yield\` 的依赖的 \`finally\` 块**仍会执行**，保证资源释放。

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

嵌套依赖的实战价值：**权限分层**。普通用户接口只挂 \`get_current_user\`，管理员接口挂 \`get_current_admin\`，超级管理员再套一层。每层只做一件事，组合起来覆盖各种权限场景，且每层可独立测试。

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

**执行顺序详解**（请求生命周期）：
\`\`\`
请求进入
  → get_db 的 yield 之前代码（创建 db）
  → get_db yield db（注入路由）
  → 路由函数执行（业务逻辑）
  → 路由返回响应
  → get_db 的 yield 之后代码（finally，关闭 db）  ← 即使路由抛异常也执行
响应返回客户端
\`\`\`

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

**底层实现**：FastAPI 把 \`yield\` 依赖当成生成器函数。执行时先 \`next(gen)\` 拿到 yield 的值注入路由；路由结束后再 \`next(gen)\` 触发 yield 之后的代码。如果路由抛异常，异常会通过 \`gen.throw()\` 抛进生成器，所以 \`except\` 块能捕获到。

> ⚠️ **陷阱**：\`yield\` 依赖只能 yield 一次（不能 yield 多个值）。多个 yield 会报错。如果一个依赖要产出多个资源，返回一个包含它们的对象。

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

**类依赖 vs 函数依赖**：
| 维度 | 函数依赖 | 类依赖 |
| --- | --- | --- |
| **返回值** | 函数返回值（常是 dict） | 类实例（有属性/方法） |
| **状态** | 无状态（每次调用新建） | 可带实例状态 |
| **类型提示** | 返回类型要手动注解 | 实例类型即类，IDE 自动推断 |
| **适合** | 简单参数聚合 | 复杂参数 + 行为 |

类依赖还能用于封装"参数 + 行为"：
\`\`\`python
class Paginator:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit
    def paginate(self, query):
        return query.offset(self.skip).limit(self.limit)
    @property
    def next_skip(self):
        return self.skip + self.limit

@app.get("/posts")
def list_posts(db: Session = Depends(get_db), pager: Paginator = Depends()):
    stmt = pager.paginate(select(Post))
    return {"items": db.execute(stmt).scalars().all(), "next_skip": pager.next_skip}
\`\`\`

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

全局依赖的特点：
- 依赖的**返回值不会被注入**路由（因为路由签名没声明它）——全局依赖只用于"副作用"（校验、设置状态等）。
- 对所有路由生效，包括子 router 挂载进来的。
- 适合"全应用强制认证"、"请求日志"、"限流"等横切关注点。

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

依赖叠加：\`FastAPI(dependencies=[A])\` + \`APIRouter(dependencies=[B])\` + \`@router.get(dependencies=[C])\`，三层依赖都会执行，顺序是 A → B → C（外到内）。

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

**缓存键**是依赖的 callable 对象本身（函数 id），不是调用参数。所以同一个 \`get_db\` 函数在同一请求里只执行一次，即使不同路由的不同参数都依赖它。

**缓存范围**是单次请求，请求结束缓存清空。下次请求重新执行依赖。

### 依赖注入 vs FastAPI 中间件

FastAPI 有两套"横切"机制：**依赖注入**和**中间件**。理解它们的区别能避免用错。

**中间件**（来自 Starlette）是 ASGI 层的"洋葱模型"，包裹整个应用：
\`\`\`python
@app.middleware("http")
async def add_request_id(request, call_next):
    request_id = uuid4().hex
    response = await call_next(request)  # 调用下游（路由）
    response.headers["X-Request-ID"] = request_id
    return response
\`\`\`

中间件在**路由匹配之前**执行，能改 request 和 response，但拿不到路由的参数解析结果。

| 维度 | 依赖注入 | 中间件 |
| --- | --- | --- |
| **执行时机** | 路由匹配后、参数解析时 | 路由匹配前 |
| **能拿路由参数** | 能（path/query/body） | 不能 |
| **能改 response** | 不能（只能返回值） | 能（改 header/status/body） |
| **类型安全** | 强（类型注解驱动） | 弱（手动操作 request/response） |
| **异常处理** | 抛 HTTPException 自动转响应 | 要自己 try/except |
| **作用范围** | 单个路由（或全局依赖所有路由） | 所有请求 |
| **适合** | 认证、参数校验、DB 会话、业务前置 | 日志、CORS、限流、压缩、请求 ID |

经验：**需要路由参数 → 依赖注入**；**需要改 response 或在路由前做事 → 中间件**。比如"记录每个请求的耗时和路径"用中间件（不依赖路由参数）；"验证 token 拿 user"用依赖注入（要把 user 注入路由）。

### 实战场景

1. **数据库会话**：\`get_db\` yield 依赖，每请求一会话。
2. **当前用户**：\`get_current_user\` 从 token 解析用户，多个路由复用。
3. **权限检查**：\`get_current_admin\` 在 \`get_current_user\` 基础上检查角色。
4. **分页参数**：\`common_parameters\` 封装 skip/limit，所有列表接口复用。
5. **配置注入**：\`get_settings\` 返回全局配置对象，便于测试时替换。
6. **日志/审计**：\`get_request_id\` 生成请求 ID，贯穿日志。
7. **限流**：\`rate_limiter\` 依赖检查用户请求频率，超限抛 429。
8. **多租户**：\`get_tenant\` 从域名/header 解析租户，注入到所有业务路由。

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

# 替换认证依赖，测试时直接返回固定用户
def override_get_current_user():
    return User(id=1, name="test_user", is_admin=True)

app.dependency_overrides[get_current_user] = override_get_current_user

# 测试结束清理
app.dependency_overrides.clear()
\`\`\`

这是 DI 相比全局状态最大的工程价值——**可测试性**。Flask 要 mock \`g\` 对象、Django 要 override settings，都比这麻烦且容易漏。

### 常见陷阱与最佳实践

- **陷阱 1（循环依赖）**：A 依赖 B，B 又依赖 A，FastAPI 会检测到循环并报错。解法：重构，把共享逻辑提取到第三个依赖。
- **陷阱 2（yield 依赖里吞异常）**：\`yield\` 依赖的 \`except\` 块如果不 \`raise\`，异常被吞掉，路由以为成功了但实际失败。资源清理的 except 一定要 re-raise。
- **陷阱 3（全局依赖拿不到返回值）**：\`dependencies=[Depends(x)]\` 的返回值不注入路由，只用于副作用。要拿返回值必须在路由签名显式声明 \`x_result = Depends(x)\`。
- **陷阱 4（依赖缓存意外）**：两个路由都依赖 \`get_db\`，但在同一请求里只会执行一次。如果依赖里有"创建一次性资源"的逻辑，要注意这一点。要每次执行用 \`use_cache=False\`。
- **陷阱 5（在 async 依赖里调同步阻塞）**：\`async def\` 依赖里调 \`time.sleep\` 会卡事件循环，和路由一样的问题。
- **最佳实践**：依赖保持单一职责；资源型用 yield；权限分层用嵌套；测试用 \`dependency_overrides\` 替换；横切关注点（日志/CORS）用中间件而非依赖。
- **面试要点**：能说出 Depends 的拓扑排序执行、yield 依赖的生成器机制、依赖缓存的范围、依赖注入和中间件的适用场景区别。

### 本章小结

- DI 是"组件声明需要什么，框架负责注入"的模式，价值在解耦和可测试性。
- \`Depends(callable)\` 把函数声明为依赖，返回值注入参数。
- 工作原理：注册时构建依赖树，请求时拓扑序执行，yield 依赖逆序清理。
- 依赖可嵌套（依赖其他依赖），形成树状结构，适合权限分层。
- \`yield\` 依赖用于资源管理，请求结束自动清理，即使路由异常也执行 finally。
- 类也能当依赖（\`__init__\` 被调用），适合"参数 + 行为"封装。
- \`FastAPI(dependencies=[...])\` 全局依赖（副作用），\`APIRouter(dependencies=[...])\` 路由组依赖，可叠加。
- 同一请求中同依赖只执行一次（缓存，键是 callable），可用 \`use_cache=False\` 关闭。
- 依赖注入 vs 中间件：前者能拿路由参数、类型安全；后者能改 response、在路由前执行。
- 实战场景：DB 会话、当前用户、权限、分页、配置、限流、多租户。
- 测试用 \`app.dependency_overrides\` 替换依赖，无需 mock 全局，这是 DI 最大工程价值。

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
