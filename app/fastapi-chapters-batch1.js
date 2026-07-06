// =============================================================
// FastAPI 应用开发实战教程 - 第 1 批章节（FastAPI 入门 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-intro  : FastAPI 是什么
//   fa-install: 安装与第一个 Hello World
//   fa-asgi   : ASGI 与异步基础
//   fa-docs   : 自动文档：Swagger 与 ReDoc
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，API 会变，设计能力长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：FastAPI 是什么
  // ============================================================
  {
    id: "fa-intro",
    group: "FastAPI 入门",
    icon: "⚡",
    title: "FastAPI 是什么",
    content: `# FastAPI 是什么

## 一句话定义

FastAPI 是一个现代、快速（高性能）的 Web 框架，用于基于标准 Python 类型注解构建 Python 3.10+ 的 API。它由 Sebastián Ramírez（昵称 tiangolo）创建，于 2018 年底首次发布，短短几年就成为 Python Web 框架中增长最快的项目之一。

把这句话拆开看，有三个关键词：

- **现代**：诞生于 2018 年，充分吸收了 Python 3.6+ 的类型注解（type hints）、async/await 异步语法，以及 Pydantic、Starlette 等新一代库的设计经验。没有历史包袱。
- **快速**：一是指开发快（类型注解自动驱动校验和文档），二是指运行快（基于 Starlette，性能比肩 Node.js、Go）。
- **基于类型注解**：这是 FastAPI 的灵魂。你写的 \`def read(item_id: int):\` 不只是给 IDE 看，FastAPI 会用它做参数解析、类型转换、校验、文档生成——一份注解，多处受益。

## 为什么选择 FastAPI

在 Python 生态里做 Web API，老牌选手有 Flask、Django，新派有 FastAPI、Sanic。为什么 FastAPI 能后来居上？因为它同时解决了五个痛点：

### 1. 开发速度快

传统框架里，「定义接口」「校验参数」「写文档」是三件割裂的事。你要在路由里写一遍参数，在校验逻辑里再写一遍，文档里又抄一遍，三处一旦不同步就是 bug。

FastAPI 用类型注解把这三件事统一了。你声明一次，框架自动帮你做另外两件：

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# item_id: int 这一处声明，同时驱动了：
# 1. 从 URL 解析参数
# 2. 类型转换（字符串转 int）
# 3. 类型校验（非 int 报 422）
# 4. 文档生成（/docs 里自动显示 int 类型）
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 read_item，参数: item_id: int
def read_item(item_id: int):
    # 返回 {"item_id": item_id}
    return {"item_id": item_id}
\`\`\`

### 2. 运行性能高

FastAPI 在权威的第三方性能测试（TechEmpower）中，吞吐量比肩 Node.js（Express、Fastify）和 Go（Gin、Echo），远超 Flask、Django 等 Python 同步框架。这得益于底层 Starlette（一个 ASGI 工具集）和异步 I/O。

当然，"快"是相对的。Python 本身比 Go 慢，但 FastAPI 把"框架开销"压到了很低，让瓶颈回归到业务逻辑和 I/O 上，而不是框架本身。

### 3. 自动交互式文档

这是最让人惊艳的特性。只要写好类型注解，FastAPI 自动生成两套文档：

- \`/docs\`：Swagger UI，可以在浏览器里直接点"Try it out"测试接口，不用 Postman。
- \`/redoc\`：ReDoc，只读文档，适合对外发布 API 文档。

文档永远和代码同步，不存在"文档过期"的问题。前后端协作时，前端直接看 \`/docs\` 就知道接口长什么样。

### 4. 类型安全

Python 是动态类型语言，灵活但容易出错。FastAPI 借助 Pydantic，在请求进来时就做严格的类型校验。传错类型直接返回 422，根本进不到业务逻辑。这意味着：

- 大量低级错误（少传字段、传错类型）在入口就被拦截。
- 业务代码可以信任数据已经校验过，写起来更放心。

### 5. 异步原生

FastAPI 基于 ASGI，原生支持 \`async def\`。在 I/O 密集型场景（调数据库、调第三方 API、WebSocket），异步能显著提升并发能力。你不需要换框架，写普通 \`def\` 也能用（FastAPI 会自动放到线程池跑），异步是可选的。

## 与主流框架对比

### FastAPI vs Flask

Flask 是 Python 微框架的经典，简单灵活。但它诞生于 2010 年，设计上没有类型注解、没有异步、没有自动文档：

| 维度 | Flask | FastAPI |
|------|-------|---------|
| 类型注解 | 不依赖，可选 | 核心驱动，必用 |
| 自动校验 | 需手写或装扩展 | 内置，基于 Pydantic |
| 自动文档 | 无，需装 flask-restx 等 | 内置 Swagger + ReDoc |
| 异步支持 | 需 async-flask 或 quart | 原生 async/await |
| 性能 | 中等（同步） | 高（异步 + Starlette） |
| 学习曲线 | 平缓 | 略陡（要懂类型注解） |
| 生态成熟度 | 极成熟 | 快速成长中 |

选型建议：新项目做纯 API，首选 FastAPI；维护老项目、需要大量 Flask 扩展，继续用 Flask。

### FastAPI vs Django

Django 是"全家桶"，自带 ORM、Admin、认证、模板，适合做完整网站。Django REST Framework（DRF）补上了 API 能力，但整套体系偏重：

| 维度 | Django + DRF | FastAPI |
|------|--------------|---------|
| 定位 | 全栈框架 | 微框架（API 优先） |
| 自带组件 | ORM/Admin/Auth/模板 | 仅路由 + 校验 + 文档 |
| 异步 | Django 3.0+ 部分支持 | 原生全异步 |
| 学习成本 | 高（概念多） | 中等 |
| 适合场景 | 内容网站、管理后台 | API、微服务、实时应用 |

选型建议：做需要后台管理的网站用 Django；做纯 API 服务、微服务用 FastAPI。

### FastAPI vs Express/Koa（Node 生态）

Node.js 的 Express/Koa 也是异步、轻量。FastAPI 与之相比：

- 语言：Python（科学计算/ML 生态强）vs JavaScript（前后端同构）。
- 性能：接近，FastAPI 略逊于 Fastify，但同量级。
- 类型：FastAPI 用 Python 类型注解（运行时校验）；Node 用 TypeScript（编译时校验，运行时需额外库如 zod）。
- 文档：FastAPI 自动生成；Node 需手写或用 swagger-jsdoc。

如果你的团队同时做机器学习和 API，Python + FastAPI 是顺理成章的选择。

## 核心技术栈

FastAPI 不是从零造轮子，它站在两个优秀库的肩膀上：

- **Starlette**：提供 ASGI 路由、中间件、WebSocket、静态文件等底层能力。FastAPI 的性能和异步能力来自这里。
- **Pydantic**：提供基于类型注解的数据校验和序列化。FastAPI 的请求体校验、响应模型、文档生成都依赖它。注：自 FastAPI 0.100 起底层切换到 **Pydantic v2**，核心用 Rust 重写，性能比 v1 提升 5-50 倍，API 也做了调整（如 \`@validator\` → \`@field_validator\`、\`Config\` 内嵌类 → \`model_config\`）。新项目应直接基于 Pydantic v2 编写。

理解这一点很重要：FastAPI 本质是"Starlette + Pydantic + 一层把类型注解串起来的胶水"。所以学 FastAPI 的深处，其实是在学 Starlette 的异步模型和 Pydantic 的数据建模。

## 性能基准参考

根据 TechEmpower Framework Benchmarks（权威的 Web 框架性能测试），在 JSON 序列化等基础测试中：

- FastAPI 吞吐量约为 Flask 的 3-5 倍。
- 与 Express、Fastify（Node）、Gin（Go）处于同一量级（差距在 2 倍以内）。
- 单请求延迟低，得益于异步非阻塞 I/O。

但要注意：基准测试只反映框架开销，真实业务的瓶颈通常是数据库、网络、业务逻辑。选框架不必死磕基准数字，开发效率、可维护性往往更重要。

## 适用场景

FastAPI 特别适合以下场景：

1. **RESTful API 服务**：天然为 API 设计，路由 + 校验 + 文档一体化。
2. **微服务**：轻量、启动快、易容器化，适合拆分微服务。
3. **机器学习模型部署**：Python 生态无缝衔接，把 sklearn/torch 模型包成 API 很自然。
4. **实时应用**：原生 WebSocket 支持，适合聊天、推送、协作工具。
5. **后台任务 + API 混合**：异步 + 后台任务（BackgroundTasks）能应对简单场景。
6. **内部工具 / BFF**：快速搭一个聚合多个后端的接口层。

不太适合的场景：需要重型 Admin 后台的 CMS（用 Django）、CPU 密集型计算服务（用 Go/Rust 更合适，或 FastAPI 配合 Celery）。

## 作者与社区

FastAPI 的作者是 Sebastián Ramírez（GitHub: tiangolo），他同时也是 Typer（CLI 框架）、SQLModel（ORM）的作者。这些项目一脉相承：都用类型注解驱动功能，理念高度一致。

社区活跃度很高：GitHub star 数已超过 7 万，文档质量被广泛称赞（FastAPI 的官方文档本身就是教科书级的学习资料）。生态方面，Pydantic、SQLAlchemy、Uvicorn 等核心依赖都在积极维护。

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 定义 | 现代、高性能、基于类型注解的 Python Web 框架 |
| 作者 | Sebastián Ramírez（tiangolo） |
| 底层 | Starlette（ASGI）+ Pydantic（校验） |
| 五大优势 | 开发快、运行快、自动文档、类型安全、异步原生 |
| 对比 Flask | 同为微框架，FastAPI 多了类型/校验/文档/异步 |
| 对比 Django | Django 全家桶适合网站，FastAPI 适合 API/微服务 |
| 适用场景 | API、微服务、ML 部署、实时应用 |
| 不适用 | 重型 CMS、CPU 密集计算 |

下一章我们会动手安装 FastAPI，跑起第一个 Hello World，并理解 uvicorn 这个 ASGI 服务器扮演的角色。`
  },

  // ============================================================
  // 第 2 章：安装与第一个 Hello World
  // ============================================================
  {
    id: "fa-install",
    group: "FastAPI 入门",
    icon: "📦",
    title: "安装与第一个 Hello World",
    content: `# 安装与第一个 Hello World

## 准备 Python 环境

FastAPI 要求 Python 3.8 及以上（建议 3.12+，能用上新语法）。第一步是确认 Python 版本：

\`\`\`bash
# 查看 Python 版本
# python --version
python --version
# Python 3.11.6
\`\`\`

强烈建议用虚拟环境（venv）隔离项目依赖，避免污染系统 Python、避免不同项目依赖冲突。这是 Python 工程的基本规范：

\`\`\`bash
# 创建虚拟环境（在项目目录下）
# 以模块方式运行 venv
python -m venv .venv

# 激活虚拟环境（macOS / Linux）
# 加载配置: .venv/bin/activate
source .venv/bin/activate

# 激活虚拟环境（Windows PowerShell）
# .venv\\Scripts\\Activate.ps1
.venv\\Scripts\\Activate.ps1

# 激活后提示符会变成 (.venv) $，表示当前在虚拟环境中
\`\`\`

激活后，\`pip install\` 装的包只在 \`.venv\` 里生效，和系统隔离。退出用 \`deactivate\` 命令。

## 安装 FastAPI 与 Uvicorn

只需要两个包：

\`\`\`bash
# 安装 Python 包: fastapi "uvicorn[standard]"
pip install fastapi "uvicorn[standard]"
\`\`\`

拆开看这两个包：

- **fastapi**：框架本体，提供路由、依赖注入、校验、文档等能力。
- **uvicorn**：ASGI 服务器，负责真正监听网络端口、接收 HTTP 请求，然后转交给 FastAPI 处理。\`[standard]\` 是安装附加依赖（如 \`httptools\` 更快的 HTTP 解析器、\`websockets\`、\`uvloop\` 高性能事件循环），生产环境推荐装。

为什么要分开？因为 FastAPI 是一个 ASGI 应用，它本身不监听端口。需要外面有一个 ASGI 服务器（uvicorn / hypercorn / daphne）来跑它。这和 Flask 的 \`flask run\`、Django 的 \`runserver\` 不同——FastAPI 把"应用"和"服务器"解耦了。

验证安装：

\`\`\`bash
# 执行内联 Python 代码
python -c "import fastapi; print(fastapi.__version__)"
# 0.110.0（或你装的版本）
\`\`\`

## 第一个 FastAPI 应用

新建一个 \`main.py\`：

\`\`\`python
# main.py
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用实例，这是整个 FastAPI 应用的入口
# 参数 title 会出现在自动文档的页面标题上
# 创建 FastAPI 应用实例
app = FastAPI(title="我的第一个 FastAPI")


# 定义一个路由：当访问根路径 / 时，执行这个函数
# @app.get 是装饰器，表示用 GET 方法访问 "/" 路径
# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，参数: 
def root():
    # 返回一个 dict，FastAPI 会自动把它转成 JSON 响应
    # 返回 {"message": "Hello, FastAPI!"}
    return {"message": "Hello, FastAPI!"}
\`\`\`

逐行讲解：

1. \`from fastapi import FastAPI\`：导入 FastAPI 类。
2. \`app = FastAPI()\`：实例化应用。这个 \`app\` 对象是 ASGI 应用，所有路由都挂在它上面。
3. \`@app.get("/")\`：装饰器，注册一个 GET 路由，路径是 \`/\`。等价于"当有人用 GET 访问根路径时，调用下面的函数"。
4. \`def root():\`：路由处理函数（也叫端点 endpoint）。函数名 \`root\` 会成为 OpenAPI 文档里的 operationId。
5. \`return {"message": ...}\`：返回字典。FastAPI 自动用 \`json.dumps\` 序列化为 JSON，并设置 \`Content-Type: application/json\`。

## 启动应用

在终端运行：

\`\`\`bash
# 格式：uvicorn 模块名:应用变量名
# main.py 文件里的 app 变量，所以是 main:app
# uvicorn main:app
uvicorn main:app
\`\`\`

看到类似输出表示启动成功：

\`\`\`
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345]
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
\`\`\`

现在用浏览器或 curl 访问：

\`\`\`bash
# 发送 HTTP 请求
curl http://127.0.0.1:8000/
# {"message":"Hello, FastAPI!"}
\`\`\`

恭喜，第一个 FastAPI 接口跑起来了。

## 自动文档：最让人惊喜的特性

不要急着关掉服务，在浏览器里打开这两个地址：

- **http://127.0.0.1:8000/docs** —— Swagger UI 交互式文档
- **http://127.0.0.1:8000/redoc** —— ReDoc 只读文档

在 \`/docs\` 页面，你能看到刚才写的 \`/\` 接口，点开它，点"Try it out"→"Execute"，就能直接在浏览器里调用接口、看到返回结果。不需要 Postman、不需要写测试脚本。

这份文档是 FastAPI 根据路由和类型注解**自动生成**的，你一行文档代码都没写。随着接口增多、参数加上类型，文档会自动丰富起来。这是 FastAPI 最省心的能力之一。

## 热重载：开发模式

开发时每改一行代码就要重启服务很烦。uvicorn 提供 \`--reload\` 参数，文件一保存就自动重载：

\`\`\`bash
# uvicorn main:app --reload
uvicorn main:app --reload
\`\`\`

\`--reload\` 的原理：uvicorn 启动一个主进程（reloader）监视文件变化，一旦 \`*.py\` 改动，就重启子进程（worker）。所以你会看到两个 PID。

常用启动参数：

| 参数 | 作用 | 示例 |
|------|------|------|
| \`--reload\` | 热重载，开发用 | \`uvicorn main:app --reload\` |
| \`--host\` | 监听地址（0.0.0.0 对外） | \`--host 0.0.0.0\` |
| \`--port\` | 端口 | \`--port 8080\` |
| \`--workers\` | 进程数（生产用，不能和 reload 同用） | \`--workers 4\` |

⚠️ 注意：\`--reload\` 和 \`--workers\` 不能同时用。reload 是开发模式，workers 是生产多进程，两者逻辑冲突。

## 在代码里启动（可选）

除了命令行 \`uvicorn main:app\`，也可以在代码里启动：

\`\`\`python
# main.py
# 导入 uvicorn 模块
import uvicorn
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，参数: 
def root():
    # 返回 {"message": "Hello"}
    return {"message": "Hello"}

# 加上这段，就能直接 python main.py 启动
# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 使用 uvicorn 启动 ASGI 服务器
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
\`\`\`

这种写法方便用 IDE 直接运行调试。但生产部署通常还是用命令行 \`uvicorn\` 或 gunicorn+uvicorn worker，因为更灵活、更好管理进程。

## 常见安装问题

### 1. uvicorn: command not found

虚拟环境没激活，或没装。先 \`source .venv/bin/activate\`，再确认 \`pip list | grep uvicorn\` 有输出。

### 2. Port 8000 already in use

端口被占用。要么杀掉占用进程，要么换端口 \`--port 8001\`。查端口占用：

\`\`\`bash
# macOS / Linux
# 列出目录内容
lsof -i :8000
\`\`\`

### 3. ModuleNotFoundError: No module named 'fastapi'

要么没在虚拟环境里装（激活了再 \`pip install\`），要么文件名和包名冲突（别把文件命名为 \`fastapi.py\`）。

### 4. ImportError: cannot import name 'X'

版本太老。升级：\`pip install --upgrade fastapi uvicorn\`。FastAPI 迭代快，老版本和新版本 API 差异较大，建议跟最新稳定版。

## 推荐的项目依赖管理

小项目用 \`pip + requirements.txt\` 足够：

\`\`\`bash
# 导出当前依赖
# pip freeze > requirements.txt
pip freeze > requirements.txt

# 别人拿到项目后安装
# 安装 Python 包: -r requirements.txt
pip install -r requirements.txt
\`\`\`

中大项目推荐用 Poetry 或 uv（更快的现代包管理器），它们能锁定版本、管理虚拟环境、解决依赖冲突更省心。

---

## 本章小结

| 步骤 | 命令 / 代码 |
|------|------------|
| 建虚拟环境 | \`python -m venv .venv && source .venv/bin/activate\` |
| 安装 | \`pip install fastapi "uvicorn[standard]"\` |
| 写应用 | \`app = FastAPI()\` + \`@app.get("/")\` |
| 启动（开发） | \`uvicorn main:app --reload\` |
| 看文档 | 浏览器访问 \`/docs\`（Swagger）或 \`/redoc\` |
| 热重载 | \`--reload\`，文件改动自动重启 |

到这里你已经能跑起一个 API 了。下一章我们深入理解 ASGI——为什么 FastAPI 需要 uvicorn，同步和异步路由到底有什么区别，这是理解 FastAPI 性能的关键。`
  },

  // ============================================================
  // 第 3 章：ASGI 与异步基础
  // ============================================================
  {
    id: "fa-asgi",
    group: "FastAPI 入门",
    icon: "🔄",
    title: "ASGI 与异步基础",
    content: `# ASGI 与异步基础

## WSGI vs ASGI：从同步到异步

要理解 FastAPI 的运行机制，得先理解 Web 框架和服务器之间的"接口协议"。

Python Web 发展史上，有两个里程碑式的接口规范：

- **WSGI**（Web Server Gateway Interface，PEP 3333）：同步接口。服务器每收到一个请求，就调用一次应用函数，函数返回响应，期间是阻塞的。Flask、Django（传统模式）都基于 WSGI。代表服务器：gunicorn、uWSGI。
- **ASGI**（Asynchronous Server Gateway Interface）：异步接口。支持 async/await、长连接、WebSocket、HTTP/2。FastAPI、Starlette、Django（3.0+ 异步通道）基于 ASGI。代表服务器：uvicorn、hypercorn、daphne。

WSGI 的函数签名（同步，处理完才返回）：

\`\`\`python
# WSGI 应用：接收 environ（请求信息）和 start_response（开始响应的回调）
# 定义函数 app，参数: environ, start_response
def app(environ, start_response):
    # 调用 start_response()
    start_response("200 OK", [("Content-Type", "text/plain")])
    # 返回 [b"Hello"]
    return [b"Hello"]
\`\`\`

ASGI 的函数签名（异步，可await）：

\`\`\`python
# ASGI 应用：接收 scope（连接信息）、receive（接收请求的协程）、send（发送响应的协程）
# 定义异步函数 app，参数: scope, receive, send
async def app(scope, receive, send):
    # await send({"type": "http.response.start", "status
    await send({"type": "http.response.start", "status": 200})
    # await send({"type": "http.response.body", "body": 
    await send({"type": "http.response.body", "body": b"Hello"})
\`\`\`

关键区别：

| 维度 | WSGI | ASGI |
|------|------|------|
| 调用方式 | 同步函数 | 协程（async/await） |
| 并发模型 | 多线程 / 多进程 | 事件循环（单线程协程） |
| 长连接 | 不支持 | 支持（WebSocket、SSE、HTTP/2） |
| 阻塞影响 | 一个请求占一个线程，阻塞只影响自己 | 阻塞会卡住整个事件循环，影响所有请求 |
| 适合场景 | CPU 密集 / 传统同步代码 | I/O 密集 / 高并发长连接 |

## 为什么要异步

同步框架（Flask）处理并发靠多线程：每个请求分配一个线程，线程阻塞了不影响其他线程。但线程有成本（内存、切换开销），开几千个线程不现实。

异步框架（FastAPI）用事件循环：单线程里跑一个循环，遇到 I/O（等数据库、等 HTTP 响应）就让出 CPU 去处理别的请求，I/O 完成再回来继续。一个线程能处理成千上万个并发连接。

举个例子：一个接口要查数据库（耗时 100ms）。

- **同步（Flask + gunicorn 多线程）**：100 个并发请求需要 100 个线程，每个线程干等 100ms。
- **异步（FastAPI + uvicorn）**：一个线程发起 100 个数据库查询，等待期间处理别的请求，100ms 后一起返回。线程数少，吞吐量高。

前提是数据库驱动也支持异步（如 \`asyncpg\`、\`databases\`、SQLAlchemy 2.0 异步）。如果用同步驱动（如 \`psycopg2\`），异步框架的优势会打折。

## ASGI 服务器对比

FastAPI 本身不监听端口，需要 ASGI 服务器来跑它。主流有三个：

| 服务器 | 特点 | 适用 |
|--------|------|------|
| **uvicorn** | 最主流，基于 uvloop（高性能事件循环），FastAPI 官方推荐 | 开发 + 生产（搭配 gunicorn） |
| **hypercorn** | 支持 HTTP/2、HTTP/3，特性最全 | 需要 HTTP/2/3 时 |
| **daphne** | Django 团队开发，最早用于 Channels | Django Channels 项目 |

生产部署的黄金组合是 **gunicorn + uvicorn worker**：

\`\`\`bash
# gunicorn 管理多进程，每个进程跑一个 uvicorn worker 处理异步
# gunicorn main:app -w 4 -k uvicorn.workers.UvicornW
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
\`\`\`

gunicorn 负责进程管理（master-worker 模式、平滑重启、信号处理），uvicorn 负责单进程内的异步事件循环。各司其职。

## 同步路由 vs 异步路由

FastAPI 允许你两种路由混用：

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入 time 模块
import time

# 创建 FastAPI 应用实例
app = FastAPI()

# 同步路由：用普通 def
# 定义 GET 路由：访问 /sync 时触发
@app.get("/sync")
# 定义函数 sync_endpoint，参数: 
def sync_endpoint():
    time.sleep(1)  # 阻塞 1 秒
    # 返回 {"type": "sync"}
    return {"type": "sync"}

# 异步路由：用 async def
# 定义 GET 路由：访问 /async 时触发
@app.get("/async")
# 定义异步函数 async_endpoint，参数: 
async def async_endpoint():
    await asyncio.sleep(1)  # 异步等待 1 秒，不阻塞事件循环
    # 返回 {"type": "async"}
    return {"type": "async"}
\`\`\`

关键区别在于 FastAPI 怎么执行它们：

### 普通 def 路由

FastAPI 知道这是同步函数，会把它放到**线程池**里执行（用 \`run_in_threadpool\`）。所以即使函数里有阻塞操作（\`time.sleep\`、同步数据库调用），也只阻塞线程池里的一个线程，不会卡住事件循环。

### async def 路由

FastAPI 直接在**事件循环**里 await 这个协程。如果协程里调用了阻塞操作（\`time.sleep\`、同步 \`requests.get\`），会**卡住整个事件循环**，所有其他请求都得等它。

这是新手最容易踩的坑：把同步阻塞代码写进 async 路由，性能反而更差。

## 阻塞操作的危害：实测

看一个反面教材：

\`\`\`python
# 导入 asyncio 模块
import asyncio
# 导入 time 模块
import time
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 反面教材：async 路由里用同步阻塞 time.sleep
# 定义 GET 路由：访问 /bad 时触发
@app.get("/bad")
# 定义异步函数 bad，参数: 
async def bad():
    time.sleep(5)  # 阻塞事件循环 5 秒！
    # 返回 {"msg": "done"}
    return {"msg": "done"}

# 一个正常接口
# 定义 GET 路由：访问 /ping 时触发
@app.get("/ping")
# 定义异步函数 ping，参数: 
async def ping():
    # 返回 {"msg": "pong"}
    return {"msg": "pong"}
\`\`\`

如果你先请求 \`/bad\`，再请求 \`/ping\`，\`/ping\` 也会卡 5 秒才返回——因为事件循环被 \`/bad\` 里的 \`time.sleep\` 阻塞了，\`/ping\` 排队等着。

## 正确做法：何时用 async，何时用 def

**记住这条原则**：函数里如果有阻塞调用，要么用 \`def\`（让 FastAPI 放线程池），要么用 \`async def\` + 把阻塞调用改成异步版本。

### 场景 1：I/O 密集（数据库、HTTP、缓存）—— 用 async

\`\`\`python
import httpx  # 异步 HTTP 客户端

# 定义 GET 路由：访问 /weather 时触发
@app.get("/weather")
# 定义异步函数 get_weather，参数: 
async def get_weather():
    # 异步 HTTP 请求，等待期间不阻塞，能处理别的请求
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # 定义变量 resp，赋值为 await client.get("https://api.weather.com/now...
        resp = await client.get("https://api.weather.com/now")
        # 返回 resp.json()
        return resp.json()
\`\`\`

### 场景 2：CPU 密集（计算、压缩）—— 用 def 或 run_in_executor

\`\`\`python
# 导入 time 模块
import time

# CPU 密集用 def，FastAPI 会放线程池跑，不阻塞事件循环
# 定义 GET 路由：访问 /compute 时触发
@app.get("/compute")
# 定义函数 compute，参数: 
def compute():
    # 定义变量 total，赋值为 sum(i * i for i in range(10_000_000))
    total = sum(i * i for i in range(10_000_000))
    # 返回 {"total": total}
    return {"total": total}
\`\`\`

### 场景 3：必须用 async 但有同步阻塞代码 —— run_in_executor

如果非得在 async 路由里调用同步阻塞库（比如老数据库驱动），用 \`run_in_threadpool\` 包一层：

\`\`\`python
# 从 fastapi.concurrency 导入 run_in_threadpool
from fastapi.concurrency import run_in_threadpool

# 定义 GET 路由：访问 /legacy 时触发
@app.get("/legacy")
# 定义异步函数 legacy，参数: 
async def legacy():
    # 把同步阻塞函数丢到线程池，async 等待结果，不卡事件循环
    # 定义变量 result，赋值为 await run_in_threadpool(blocking_db_call, arg...
    result = await run_in_threadpool(blocking_db_call, arg1)
    # 返回 {"result": result}
    return {"result": result}
\`\`\`

\`run_in_threadpool\` 内部用 \`anyio.to_thread.run_sync\`，把同步函数丢到线程池执行，返回一个可 await 的对象。

## 决策流程图

写路由时按这个顺序判断：

1. 函数里有没有阻塞调用（同步 I/O、CPU 计算）？
   - 没有（或都是 async 库）→ 用 \`async def\`，享受异步红利。
   - 有，且能换成异步库 → 换库，用 \`async def\`。
   - 有，且换不了库 → 用普通 \`def\`（FastAPI 自动放线程池）。
2. 非得在 async 函数里调同步阻塞代码 → 用 \`run_in_threadpool\` 包一层。

## 一个对比实验

下面两段代码功能一样（请求 3 个外部 API），但性能天差地别：

\`\`\`python
# ❌ 串行同步：3 个请求各 1 秒，总共 3 秒
# 定义 GET 路由：访问 /serial 时触发
@app.get("/serial")
# 定义函数 serial，参数: 
def serial():
    # 导入 requests 模块
    import requests
    a = requests.get("https://api.a.com").json()  # 1s
    b = requests.get("https://api.b.com").json()  # 1s
    c = requests.get("https://api.c.com").json()  # 1s
    # 返回 {"a": a, "b": b, "c": c}
    return {"a": a, "b": b, "c": c}

# ✅ 并发异步：3 个请求同时发，总共 1 秒
# 定义 GET 路由：访问 /concurrent 时触发
@app.get("/concurrent")
# 定义异步函数 concurrent，参数: 
async def concurrent():
    # 导入 httpx 模块
    import httpx
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # asyncio.gather 并发执行多个协程
        # a, b, c = await asyncio.gather(
        a, b, c = await asyncio.gather(
            # 调用 client.get()
            client.get("https://api.a.com"),
            # 调用 client.get()
            client.get("https://api.b.com"),
            # 调用 client.get()
            client.get("https://api.c.com"),
        # )
        )
    # 返回 {"a": a.json(), "b": b.json(), "c": c.json()}
    return {"a": a.json(), "b": b.json(), "c": c.json()}
\`\`\`

这就是异步的价值：I/O 等待时间被用来处理别的请求，整体吞吐量上去了。

---

## 本章小结

| 要点 | 说明 |
|------|------|
| WSGI | 同步接口，Flask/Django 传统模式 |
| ASGI | 异步接口，支持 async/WebSocket，FastAPI 基于此 |
| 并发模型 | 同步靠多线程，异步靠事件循环 |
| uvicorn | 主流 ASGI 服务器，生产配 gunicorn |
| def 路由 | FastAPI 自动放线程池，阻塞不影响事件循环 |
| async def 路由 | 直接在事件循环跑，阻塞会卡住所有请求 |
| 阻塞代码处理 | 换异步库 / 用 def / 用 run_in_threadpool |
| 适用 async | I/O 密集（数据库、HTTP、缓存） |
| 适用 def | CPU 密集、用同步库时 |

理解了 ASGI 和同步/异步的区别，你就能避免 FastAPI 最常见的性能陷阱。下一章我们专门讲自动文档——这个让 FastAPI 在前后端协作中大放异彩的能力。`
  },

  // ============================================================
  // 第 4 章：自动文档：Swagger 与 ReDoc
  // ============================================================
  {
    id: "fa-docs",
    group: "FastAPI 入门",
    icon: "📖",
    title: "自动文档：Swagger 与 ReDoc",
    content: `# 自动文档：Swagger 与 ReDoc

## OpenAPI 规范：API 描述的"普通话"

在讲 FastAPI 的文档能力前，得先理解它背后的标准——OpenAPI。

**OpenAPI Specification（OAS）** 是描述一套 RESTful API 的标准格式（前身叫 Swagger Specification）。它用一个 JSON 或 YAML 文件，把"有哪些接口、每个接口接收什么参数、返回什么、怎么认证"全部说清楚。可以把它理解为 API 的"接口契约"。

一个最小化的 OpenAPI 文件长这样：

\`\`\`json
{
  "openapi": "3.1.0",
  "info": {
    "title": "我的 API",
    "version": "1.0.0"
  },
  "paths": {
    "/items/{item_id}": {
      "get": {
        "summary": "读取 item",
        "parameters": [
          {"name": "item_id", "in": "path", "required": true, "schema": {"type": "integer"}}
        ],
        "responses": {
          "200": {"description": "成功"}
        }
      }
    }
  }
}
\`\`\`

有了这份标准文件，下游就能做很多事：

- 渲染成可视化文档（Swagger UI、ReDoc）。
- 生成各种语言的客户端 SDK（openapi-generator）。
- 做 mock 测试、接口测试自动化。
- 前后端基于它做联调契约。

## FastAPI 如何自动生成 OpenAPI

FastAPI 之所以能自动出文档，关键在于它把"类型注解"作为单一数据源。当你写下：

\`\`\`python
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 read_item，参数: item_id: int, q: str | None = None
def read_item(item_id: int, q: str | None = None):
    # 返回 {"item_id": item_id, "q": q}
    return {"item_id": item_id, "q": q}
\`\`\`

FastAPI 在启动时会遍历所有路由，从装饰器和函数签名里提取：

- 路径和方法（\`GET /items/{item_id}\`）
- 参数（\`item_id\` 在 path 里、\`q\` 在 query 里）
- 类型（\`item_id: int\`、\`q: str | None\`）
- 是否必填（无默认值的是必填）

然后组装成一份 OpenAPI JSON，挂在 \`/openapi.json\` 路径下。访问 \`/docs\` 时，Swagger UI 前端会去拉取这份 JSON 并渲染。

所以**文档永远和代码同步**——因为它就是代码的副产品。你改了类型注解，文档立刻变；你忘了更新文档？不存在的，根本没有独立的文档要维护。

## 三个文档端点

FastAPI 默认开放三个文档相关端点：

| 路径 | 是什么 | 用途 |
|------|--------|------|
| \`/docs\` | Swagger UI | 交互式文档，可在线测试接口 |
| \`/redoc\` | ReDoc | 只读文档，排版美观，适合对外发布 |
| \`/openapi.json\` | OpenAPI JSON | 原始规范文件，给工具消费 |

### Swagger UI（/docs）

Swagger UI 是一套开源前端，把 OpenAPI JSON 渲染成可交互的网页。特点：

- **可测试**：每个接口有"Try it out"按钮，填参数、点 Execute，直接发请求看结果。调试时不用开 Postman。
- **实时反馈**：参数填错会标红，必填项会提示。
- **展示响应**：显示状态码、响应头、响应体，还有 curl 命令方便复制。

### ReDoc（/redoc）

ReDoc 是另一套开源前端，更偏"文档展示"：

- **三栏布局**：左边目录、中间接口详情、右边示例，适合长文档浏览。
- **只读**：不能在线测试，专注于阅读。
- **美观**：排版更接近正式文档，适合给前端、给客户看。

## 文档定制

默认文档够用，但生产中通常要定制。FastAPI 提供 \`FastAPI()\` 的参数和路由装饰器参数来定制。

### 应用级定制

\`\`\`python
# 创建 FastAPI 应用实例
app = FastAPI(
    # 定义变量 title，赋值为 "电商订单 API",
    title="电商订单 API",
    # 定义变量 description，赋值为 """
    description="""
# 订单服务对外接口文档。
订单服务对外接口文档。

## 功能模块
# - **订单**：创建、查询、取消
- **订单**：创建、查询、取消
# - **支付**：发起、回调
- **支付**：发起、回调

# 联系方式：api-team@company.com
联系方式：api-team@company.com
# """,
""",
    # 定义变量 version，赋值为 "2.1.0",
    version="2.1.0",
    # 关掉某个文档端点（生产可能想关 docs）
    docs_url="/my-docs",       # 默认 /docs
    redoc_url=None,            # None 表示禁用
    # 定义变量 openapi_url，赋值为 "/openapi.json"
    openapi_url="/openapi.json"
# )
)
\`\`\`

\`description\` 支持 Markdown，会被渲染到文档顶部。

### 路由级定制：tags、summary、description

\`\`\`python
# 装饰器：app.get
@app.get(
    # "/items/{item_id}",
    "/items/{item_id}",
    tags=["商品"],           # 分组标签，文档里按 tag 分类展示
    summary="查询单个商品",   # 简短一行说明
    description="根据商品 ID 查询详情。如果商品不存在返回 404。",  # 详细说明
    # 定义变量 response_description，赋值为 "商品详情对象"
    response_description="商品详情对象"
# )
)
# 定义函数 read_item，参数: item_id: int
def read_item(item_id: int):
    # 返回 {"item_id": item_id}
    return {"item_id": item_id}
\`\`\`

- **tags**：最常用，把相关接口归类。文档里会按 tag 分组显示，导航清晰。
- **summary** vs **description**：summary 是一行，description 是详细说明（也支持 Markdown）。
- **response_description**：响应的说明。

更优雅的写法：把详细说明写在 docstring 里，FastAPI 会自动用上：

\`\`\`python
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}", tags=["商品"])
# 定义函数 read_item，参数: item_id: int
def read_item(item_id: int):
    # """
    """
    # 查询单个商品详情。
    查询单个商品详情。

    # - **item_id**：商品 ID，整数
    - **item_id**：商品 ID，整数
    # - 返回：商品对象，含名称、价格、库存
    - 返回：商品对象，含名称、价格、库存

    # 商品不存在时返回 404。
    商品不存在时返回 404。
    # """
    """
    # 返回 {"item_id": item_id}
    return {"item_id": item_id}
\`\`\`

docstring 里的 Markdown 会被渲染到 description，比单独传参数整洁。

### 响应示例定制

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 name，类型: str
    name: str

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.get
@app.get(
    # "/items/{item_id}",
    "/items/{item_id}",
    # 定义变量 response_model，赋值为 Item,
    response_model=Item,
    # 定义字典 responses
    responses={
        # 字段 200，类型: {
        200: {
            # "description": "商品详情",
            "description": "商品详情",
            # "content": {
            "content": {
                # "application/json": {
                "application/json": {
                    # "example": {"id": 42, "name": "苹果手机"}
                    "example": {"id": 42, "name": "苹果手机"}
                # }
                }
            # }
            }
        # },
        },
        # 字段 404，类型: {"description": "商品不存在"}
        404: {"description": "商品不存在"}
    # }
    }
# )
)
# 定义函数 read_item，参数: item_id: int
def read_item(item_id: int):
    # 返回 {"id": item_id, "name": "苹果手机"}
    return {"id": item_id, "name": "苹果手机"}
\`\`\`

\`responses\` 参数能定制每个状态码的描述和示例，前端联调时一看就懂。

## 为什么自动文档这么重要

### 1. 前后端协作成本骤降

传统流程：后端写接口 → 写文档（Word/Confluence）→ 发前端 → 前端照着调。文档和代码经常不同步，前端调出 bug 发现是文档过期。

FastAPI 流程：后端写接口（带类型注解）→ 前端打开 \`/docs\` 直接看。文档=代码，永远同步。前端还能在 Swagger 里先 Try it out 试一下接口行为。

### 2. 降低维护成本

不用维护独立的文档系统、不用同步文档和代码、不用应付"文档和接口对不上"的工单。文档随代码版本走，git 里可追溯。

### 3. 工具链打通

OpenAPI 是标准，生态工具丰富：

- **客户端生成**：openapi-generator 能从 \`/openapi.json\` 生成 TypeScript、Python、Go、Java 等语言的客户端 SDK。前端不用手写 fetch 调用。
- **Mock 服务**：Prism、WireMock 等能基于 OpenAPI 起 mock 服务，后端没开发完前端就能联调。
- **测试**：用 schema 做契约测试，保证接口实现符合契约。

## 实战：给每个接口加文档和示例

把前面的知识串起来，写一个文档齐全的接口：

\`\`\`python
# 从 fastapi 导入 FastAPI, Path, Query
from fastapi import FastAPI, Path, Query
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI(title="图书管理 API", version="1.0.0")

# 定义 Pydantic 数据模型 Book，继承 BaseModel
class Book(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 title，类型: str
    title: str
    # 字段 author，类型: str
    author: str
    # 字段 price，类型: float
    price: float

# 装饰器：app.get
@app.get(
    # "/books/{book_id}",
    "/books/{book_id}",
    # 定义列表 tags
    tags=["图书"],
    # 定义变量 response_model，赋值为 Book,
    response_model=Book,
    # 定义变量 summary，赋值为 "查询图书详情",
    summary="查询图书详情",
    # 定义字典 responses
    responses={
        # 字段 200，类型: {"description": "图书详情", "content": {"application/json": {"example": {"id": 1, "title": "三体", "author": "刘慈欣", "price": 45.0}}}},
        200: {"description": "图书详情", "content": {"application/json": {"example": {"id": 1, "title": "三体", "author": "刘慈欣", "price": 45.0}}}},
        # 字段 404，类型: {"description": "图书不存在"}
        404: {"description": "图书不存在"}
    # }
    }
# )
)
# def get_book(
def get_book(
    # 字段 book_id，类型: int，默认值: Path(..., description="图书 ID，正整数", ge=1),
    book_id: int = Path(..., description="图书 ID，正整数", ge=1),
    # 字段 detail，类型: bool，默认值: Query(False, description="是否返回详细信息")
    detail: bool = Query(False, description="是否返回详细信息")
# ):
):
    # """
    """
    # 根据 ID 查询图书。
    根据 ID 查询图书。

    # - **book_id**：图书唯一标识
    - **book_id**：图书唯一标识
    # - **detail**：传 true 返回完整信息，false 只返回基本信息
    - **detail**：传 true 返回完整信息，false 只返回基本信息

    # 若图书不存在，返回 404。
    若图书不存在，返回 404。
    # """
    """
    # 返回 {"id": book_id, "title": "三体", "author": "刘慈欣", "price": 45.0}
    return {"id": book_id, "title": "三体", "author": "刘慈欣", "price": 45.0}
\`\`\`

打开 \`/docs\`，你会看到：图书分组下有个"查询图书详情"接口，参数有说明，响应有示例，文档里还有 Markdown 渲染的详细说明。一份代码，全套文档自动到位。

## 关闭文档（生产可选）

生产环境有时想关掉文档端点（避免暴露接口结构）：

\`\`\`python
# 创建 FastAPI 应用实例
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
\`\`\`

设为 \`None\` 就禁用对应端点。更精细的做法是按环境变量控制：

\`\`\`python
# 导入 os 模块
import os
# 创建 FastAPI 应用实例
app = FastAPI(
    # 定义变量 docs_url，赋值为 "/docs" if os.getenv("ENV") != "prod" else No...
    docs_url="/docs" if os.getenv("ENV") != "prod" else None,
    # 定义变量 redoc_url，赋值为 None
    redoc_url=None
# )
)
\`\`\`

开发环境开着方便调试，生产关掉减信息泄露。

---

## 本章小结

| 要点 | 说明 |
|------|------|
| OpenAPI | API 描述标准（JSON/YAML），前身 Swagger |
| 自动生成原理 | FastAPI 从类型注解推断，文档=代码副产品 |
| /docs | Swagger UI，交互式可测试 |
| /redoc | ReDoc，只读美观，适合发布 |
| /openapi.json | 原始 OpenAPI 规范文件 |
| 应用级定制 | title/description/version/docs_url |
| 路由级定制 | tags/summary/description/responses |
| docstring | 自动作为接口详细说明（支持 Markdown） |
| 价值 | 前后端协作成本降、文档不过期、工具链打通 |
| 生产关闭 | docs_url=None / redoc_url=None |

到这里 FastAPI 入门部分讲完了。你已经知道 FastAPI 是什么、怎么装、怎么跑、为什么异步、文档怎么来。下一批章节我们深入路由参数——路径参数、查询参数、校验，这是写接口最日常的部分。`
  }
];
