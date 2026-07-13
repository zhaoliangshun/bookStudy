// =============================================================
// FastAPI 应用开发实战教程 - 第 1 批章节（FastAPI 入门 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-intro  : FastAPI 是什么
//   fa-install: 安装与第一个 Hello World
//   fa-asgi   : ASGI 与异步基础
//   fa-docs   : 自动文档：Swagger 与 ReDoc
// ============================================================

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

FastAPI 是一个现代、快速（高性能）的 Web 框架，用于基于标准 Python 类型注解构建 Python 3.8+ 的 API。它由 Sebastián Ramírez（昵称 tiangolo）创建，于 2018 年 12 月首次发布，短短几年就成为 Python Web 框架中增长最快的项目之一，GitHub Star 数早已突破 7 万。

把这句话拆开看，有三个关键词：

- **现代**：诞生于 2018 年，充分吸收了 Python 3.6+ 的类型注解（type hints）、async/await 异步语法，以及 Pydantic、Starlette 等新一代库的设计经验。没有历史包袱，从第一天起就为现代 API 开发而设计。
- **快速**：一是指开发快（类型注解自动驱动校验和文档），二是指运行快（基于 Starlette，性能比肩 Node.js、Go）。"快"是全方位的快。
- **基于类型注解**：这是 FastAPI 的灵魂。你写的 \`def read(item_id: int):\` 不只是给 IDE 看，FastAPI 会用它做参数解析、类型转换、校验、文档生成——一份注解，多处受益。

## 历史与作者

FastAPI 的作者是 Sebastián Ramírez，GitHub 用户名 tiangolo，一位哥伦比亚裔开发者。在创建 FastAPI 之前，他已经在使用 Flask + Flask-RESTful、Marshmallow 等工具搭建 API。他反复遇到同样的痛点：参数校验要手写、文档要单独维护、异步支持薄弱。于是他决定"把这一切整合成一个框架"。

FastAPI 不是凭空出现的，它站在两个优秀库的肩膀上：

- **Starlette**：一个轻量级 ASGI 工具集，提供路由、中间件、WebSocket 等底层能力。FastAPI 的性能和异步能力来自这里。
- **Pydantic**：一个基于类型注解的数据校验和序列化库。FastAPI 的请求体校验、响应模型、文档生成都依赖它。

tiangolo 的设计哲学很明确：**用 Python 类型注解作为单一数据源（Single Source of Truth）**。你声明一次类型，框架自动帮你做参数解析、类型转换、校验、文档生成。这避免了传统框架里"定义接口、校验参数、写文档"三件事割裂导致的同步问题。

tiangolo 同时也是以下项目的作者，这些项目理念一脉相承：

- **Typer**：CLI 框架，用类型注解构建命令行工具。
- **SQLModel**：ORM，结合了 Pydantic 和 SQLAlchemy。
- **FastAPI-Utils**：FastAPI 的实用工具集。

FastAPI 的发展时间线：

- 2018 年 12 月：首个版本发布。
- 2019 年：社区快速增长，文档被广泛称赞。
- 2020 年：被 Microsoft、Uber、Netflix 等公司采用。
- 2022 年：FastAPI 0.95+ 引入 Lifespan 事件，替代旧的 startup/shutdown。
- 2023 年：FastAPI 0.100+ 切换到 Pydantic v2（核心用 Rust 重写，性能提升 5-50 倍）。
- 至今：GitHub Star 超过 7 万，是 Python 增长最快的 Web 框架之一。

## 为什么选择 FastAPI

在 Python 生态里做 Web API，老牌选手有 Flask、Django，新派有 FastAPI、Sanic、Litestar。为什么 FastAPI 能后来居上？因为它同时解决了五个痛点：

### 痛点 1：开发速度慢——接口、校验、文档三件事割裂

传统框架里，"定义接口""校验参数""写文档"是三件割裂的事。你要在路由里写一遍参数，在校验逻辑里再写一遍，文档里又抄一遍，三处一旦不同步就是 bug。

FastAPI 用类型注解把这三件事统一了。你声明一次，框架自动帮你做另外两件：

\`\`\`python
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例，这是整个应用的入口
app = FastAPI()

# @app.get 是装饰器，表示用 GET 方法访问 "/items/{item_id}" 路径
# item_id: int 这一处声明，同时驱动了：
#   1. 从 URL 解析参数（自动提取 item_id）
#   2. 类型转换（字符串 "5" 转成 int 5）
#   3. 类型校验（传 "abc" 会返回 422 错误）
#   4. 文档生成（/docs 里自动显示 int 类型）
@app.get("/items/{item_id}")
# 定义函数 read_item，参数 item_id 是 int 类型
def read_item(item_id: int):
    # 返回字典，FastAPI 自动转成 JSON 响应
    return {"item_id": item_id}
\`\`\`

一行 \`item_id: int\`，省掉了多少样板代码？传统 Flask 写法得自己 \`int(item_id)\`、自己 try/except、自己写文档。

### 痛点 2：运行性能低——同步框架被线程拖累

FastAPI 在权威的第三方性能测试（TechEmpower）中，吞吐量比肩 Node.js（Express、Fastify）和 Go（Gin、Echo），远超 Flask、Django 等 Python 同步框架。这得益于底层 Starlette（一个 ASGI 工具集）和异步 I/O。

当然，"快"是相对的。Python 本身比 Go 慢，但 FastAPI 把"框架开销"压到了很低，让瓶颈回归到业务逻辑和 I/O 上，而不是框架本身。

性能参考（TechEmpower JSON 序列化测试，数值为相对吞吐量）：

| 框架 | 语言 | 相对吞吐量 |
|------|------|-----------|
| FastAPI | Python | 1.0（基准）|
| Flask | Python | 0.2-0.3 |
| Django | Python | 0.15-0.25 |
| Express | Node.js | 1.0-1.2 |
| Fastify | Node.js | 1.5-2.0 |
| Gin | Go | 2.0-3.0 |

注意：基准测试只反映框架开销，真实业务的瓶颈通常是数据库、网络、业务逻辑。选框架不必死磕基准数字，开发效率、可维护性往往更重要。

### 痛点 3：文档维护痛苦——文档和代码经常不同步

这是最让人惊艳的特性。只要写好类型注解，FastAPI 自动生成两套文档：

- \`/docs\`：Swagger UI，可以在浏览器里直接点"Try it out"测试接口，不用 Postman。
- \`/redoc\`：ReDoc，只读文档，适合对外发布 API 文档。

文档永远和代码同步，不存在"文档过期"的问题。前后端协作时，前端直接看 \`/docs\` 就知道接口长什么样。这是 FastAPI 最省心的能力之一。

### 痛点 4：类型安全缺失——动态语言的低级错误难防

Python 是动态类型语言，灵活但容易出错。FastAPI 借助 Pydantic，在请求进来时就做严格的类型校验。传错类型直接返回 422，根本进不到业务逻辑。这意味着：

- 大量低级错误（少传字段、传错类型）在入口就被拦截。
- 业务代码可以信任数据已经校验过，写起来更放心。

### 痛点 5：异步支持薄弱——高并发场景力不从心

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
| 适合场景 | 传统网站、小工具 | API、微服务、ML 部署 |

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
| Admin 后台 | 内置，极强大 | 无，需自己做 |
| ORM | 内置 Django ORM | 无，搭配 SQLAlchemy/SQLModel |

选型建议：做需要后台管理的网站用 Django；做纯 API 服务、微服务用 FastAPI。

### FastAPI vs Sanic

Sanic 也是 Python 异步框架，诞生比 FastAPI 早，灵感来自 Express：

| 维度 | Sanic | FastAPI |
|------|-------|---------|
| 异步模型 | 原生 async | 原生 async |
| 类型注解 | 不依赖 | 核心驱动 |
| 自动文档 | 无内置 | 内置 Swagger + ReDoc |
| 数据校验 | 需手写或装扩展 | 内置 Pydantic |
| 性能 | 高 | 高（同量级） |
| 生态 | 较小 | 快速增长 |

选型建议：两个都能做高并发 API，但 FastAPI 的类型注解 + 自动文档 + Pydantic 校验组合让开发效率高很多。Sanic 更像"异步版 Flask"，FastAPI 更像"Python 版的现代化 API 工具链"。

### FastAPI vs Express/Koa（Node 生态）

Node.js 的 Express/Koa 也是异步、轻量。FastAPI 与之相比：

| 维度 | Express/Koa | FastAPI |
|------|-------------|---------|
| 语言 | JavaScript | Python |
| 类型 | TypeScript（编译时） | 类型注解（运行时校验） |
| 异步 | 原生 async | 原生 async |
| 自动文档 | 需 swagger-jsdoc | 内置 |
| 性能 | 高 | 高（同量级） |
| ML/科学计算生态 | 弱 | 极强（NumPy/Pandas/Torch） |
| 前后端同构 | 是（都用 JS） | 否 |

如果你的团队同时做机器学习和 API，Python + FastAPI 是顺理成章的选择。

## 核心技术栈

FastAPI 不是从零造轮子，它站在两个优秀库的肩膀上：

- **Starlette**：提供 ASGI 路由、中间件、WebSocket、静态文件等底层能力。FastAPI 的性能和异步能力来自这里。Starlette 本身就是一个可用的 ASGI 框架，FastAPI 在它之上加了类型驱动的胶水层。
- **Pydantic**：提供基于类型注解的数据校验和序列化。FastAPI 的请求体校验、响应模型、文档生成都依赖它。注：自 FastAPI 0.100 起底层切换到 **Pydantic v2**，核心用 Rust 重写，性能比 v1 提升 5-50 倍，API 也做了调整（如 \`@validator\` → \`@field_validator\`、\`Config\` 内嵌类 → \`model_config\`）。新项目应直接基于 Pydantic v2 编写。
- **Uvicorn**：ASGI 服务器，负责真正监听网络端口、接收 HTTP 请求，然后转交给 FastAPI 处理。FastAPI 本身不监听端口，需要 Uvicorn（或 Hypercorn、Daphne）来跑它。

理解这一点很重要：FastAPI 本质是"Starlette + Pydantic + 一层把类型注解串起来的胶水"。所以学 FastAPI 的深处，其实是在学 Starlette 的异步模型和 Pydantic 的数据建模。

## Demo 1：最简单的 FastAPI 应用

先来个最小可运行例子，感受一下 FastAPI 的简洁：

\`\`\`python
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
# 这个 app 对象是 ASGI 应用，所有路由都挂在它上面
app = FastAPI()

# 定义一个 GET 路由，访问根路径 "/" 时执行下面的函数
@app.get("/")
# 定义函数 root，无参数
def root():
    # 返回字典，FastAPI 自动序列化为 JSON
    return {"message": "Hello, FastAPI!"}

# 启动命令：uvicorn main:app --reload
# 然后浏览器访问 http://127.0.0.1:8000/ 即可看到返回
\`\`\`

逐行讲解：

1. \`from fastapi import FastAPI\`：导入 FastAPI 类。
2. \`app = FastAPI()\`：实例化应用。这个 \`app\` 对象是 ASGI 应用，所有路由都挂在它上面。
3. \`@app.get("/")\`：装饰器，注册一个 GET 路由，路径是 \`/\`。等价于"当有人用 GET 访问根路径时，调用下面的函数"。
4. \`def root():\`：路由处理函数（也叫端点 endpoint）。函数名 \`root\` 会成为 OpenAPI 文档里的 operationId。
5. \`return {"message": ...}\`：返回字典。FastAPI 自动用 \`json.dumps\` 序列化为 JSON，并设置 \`Content-Type: application/json\`。

## Demo 2：对比 Flask 写法，感受 FastAPI 的省心

同样一个"查询商品"接口，看 Flask 和 FastAPI 的区别：

\`\`\`python
# ============ Flask 写法 ============
# from flask import Flask, request, jsonify
# app = Flask(__name__)
#
# @app.get("/items/<item_id>")
# def read_item(item_id):
#     # 要自己 try/except 转类型
#     try:
#         item_id = int(item_id)
#     except ValueError:
#         return jsonify({"error": "item_id must be int"}), 422
#     # 要自己校验 q 是否合法
#     q = request.args.get("q")
#     if q is not None and len(q) > 100:
#         return jsonify({"error": "q too long"}), 422
#     # 要自己写文档（另外维护）
#     return jsonify({"item_id": item_id, "q": q})

# ============ FastAPI 写法 ============
# 从 fastapi 包导入 FastAPI, Query 类
from fastapi import FastAPI, Query

# 创建 FastAPI 应用实例
app = FastAPI()

# @app.get 注册 GET 路由
# item_id: int 自动解析+校验+文档
# q: str | None = None 表示可选参数，默认 None
# Query(max_length=100) 限制 q 最长 100 字符
@app.get("/items/{item_id}")
# 定义函数 read_item，参数 item_id 是 int，q 是可选 str
def read_item(item_id: int, q: str | None = Query(default=None, max_length=100)):
    # 返回字典，自动 JSON 序列化
    return {"item_id": item_id, "q": q}

# FastAPI 版本：
# - 类型转换：自动（item_id 自动转 int）
# - 类型校验：自动（传 "abc" 返回 422）
# - 长度校验：自动（Query(max_length=100)）
# - 文档生成：自动（/docs 里全有）
# - 代码量：少一半，且无样板
\`\`\`

对比下来，FastAPI 的代码量少一半，且校验、文档全自动。这就是类型注解驱动的威力。

## Demo 3：Pydantic 数据模型——类型安全的第一课

FastAPI 的类型安全主要靠 Pydantic。看一个请求体校验的例子：

\`\`\`python
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI
# 从 pydantic 包导入 BaseModel 类
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Item，继承 BaseModel
# 这个模型用于校验请求体 JSON
class Item(BaseModel):
    # 字段 name，类型 str，必填
    name: str
    # 字段 price，类型 float，必须 > 0（Field 加约束）
    price: float = Field(gt=0, description="价格必须大于 0")
    # 字段 quantity，类型 int，默认 0
    quantity: int = 0
    # 字段 tags，类型 list[str]，默认空列表
    tags: list[str] = []

# @app.post 注册 POST 路由，用于创建资源
# item: Item 表示请求体会被自动解析并校验成 Item 对象
@app.post("/items/")
# 定义函数 create_item，参数 item 是 Item 类型
def create_item(item: Item):
    # 此时 item 已经过校验，可以放心使用
    # 返回计算后的结果
    return {"name": item.name, "total": item.price * item.quantity}

# 测试：POST /items/，body 为 {"name": "苹果", "price": 5.5, "quantity": 10}
# 返回：{"name": "苹果", "total": 55.0}
#
# 测试：POST /items/，body 为 {"name": "苹果", "price": -1}
# 返回 422 错误：{"detail": [{"loc": ["body", "price"], "msg": "..."}]}
#
# price=-1 被拦截了！业务代码根本不用写 if price < 0 的判断
\`\`\`

传错类型、少传字段、约束不满足，全部在入口被拦截。业务代码可以信任数据已经校验过。

## Demo 4：异步路由——FastAPI 的性能根基

FastAPI 原生支持异步，看一个并发请求外部 API 的例子：

\`\`\`python
# 导入 asyncio 模块（异步基础设施）
import asyncio
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 异步路由：用 async def 定义
# 适合 I/O 密集场景（调数据库、调外部 API）
@app.get("/concurrent")
# 定义异步函数 concurrent，无参数
async def concurrent():
    # 模拟 3 个并发的外部 API 调用
    # asyncio.gather 并发执行多个协程，而不是串行
    # 定义异步函数 fetch，模拟一次耗时 1 秒的网络请求
    async def fetch(url: str):
        # asyncio.sleep 模拟 I/O 等待，不阻塞事件循环
        await asyncio.sleep(1)
        # 返回模拟结果
        return {"url": url, "data": "..."}

    # 3 个请求并发执行，总耗时约 1 秒（不是 3 秒）
    # 定义变量 results，赋值为 await asyncio.gather(...)
    results = await asyncio.gather(
        fetch("https://api.a.com"),
        fetch("https://api.b.com"),
        fetch("https://api.c.com"),
    )
    # 返回并发结果
    return {"results": results}

# 串行写法（错误示范）会耗时 3 秒：
#   a = await fetch("https://api.a.com")  # 1 秒
#   b = await fetch("https://api.b.com")  # 1 秒
#   c = await fetch("https://api.c.com")  # 1 秒
# 总共 3 秒。asyncio.gather 让它们并发，只需 1 秒。
\`\`\`

异步的价值：I/O 等待时间被用来处理别的请求，整体吞吐量上去了。

## Demo 5：FastAPI 的项目结构预览

一个规范的 FastAPI 项目长这样：

\`\`\`python
# 项目结构示例（注释形式展示）
# my_project/
# ├── app/
# │   ├── __init__.py          # 让 app 成为包
# │   ├── main.py              # 应用入口，创建 FastAPI 实例
# │   ├── core/
# │   │   ├── config.py        # 配置（环境变量、数据库 URL）
# │   │   └── security.py      # 安全相关（JWT、密码哈希）
# │   ├── api/
# │   │   ├── deps.py          # 依赖注入（数据库会话、当前用户）
# │   │   └── v1/
# │   │       ├── items.py     # 商品相关路由
# │   │       └── users.py     # 用户相关路由
# │   ├── models/              # SQLAlchemy ORM 模型
# │   │   └── item.py
# │   ├── schemas/             # Pydantic 模型（请求/响应）
# │   │   └── item.py
# │   ├── crud/                # 数据库操作
# │   │   └── item.py
# │   └── services/            # 业务逻辑层
# │       └── item.py
# ├── tests/                   # 测试
# ├── .env                     # 环境变量
# ├── requirements.txt         # 依赖
# └── README.md

# main.py 示例：
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI(title="我的项目")

# 从 api.v1 包导入 items 路由模块
from app.api.v1 import items

# 把 items 路由挂到 /api/v1/items 前缀下
app.include_router(items.router, prefix="/api/v1/items", tags=["商品"])
\`\`\`

这种分层结构（路由 → 业务 → 数据）让项目可维护。小项目可以全塞 main.py，大了再拆。

## 适用场景

FastAPI 特别适合以下场景：

1. **RESTful API 服务**：天然为 API 设计，路由 + 校验 + 文档一体化。
2. **微服务**：轻量、启动快、易容器化，适合拆分微服务。
3. **机器学习模型部署**：Python 生态无缝衔接，把 sklearn/torch 模型包成 API 很自然。
4. **实时应用**：原生 WebSocket 支持，适合聊天、推送、协作工具。
5. **后台任务 + API 混合**：异步 + 后台任务（BackgroundTasks）能应对简单场景。
6. **内部工具 / BFF**：快速搭一个聚合多个后端的接口层。
7. **Serverless 函数**：配合 Mangum 等适配器，可部署到 AWS Lambda、Vercel。

不太适合的场景：

- 需要重型 Admin 后台的 CMS（用 Django，自带 Admin）。
- CPU 密集型计算服务（用 Go/Rust 更合适，或 FastAPI 配合 Celery 卸载到后台）。
- 需要服务端渲染的传统网站（FastAPI 也能渲染模板，但不是强项，用 Django/Flask 更顺手）。

## 常见误区与避坑指南

### 误区 1："FastAPI 比 Flask 快，所以无脑选 FastAPI"

性能只是选型的一个维度。如果团队不熟类型注解、项目需要大量 Flask 专属扩展（如 Flask-Admin、Flask-Login），强行换 FastAPI 反而拖慢进度。选型要看团队、生态、场景综合。

### 误区 2："async def 一定比 def 快"

错。async 路由里如果写了阻塞代码（\`time.sleep\`、同步 \`requests.get\`），会卡住整个事件循环，性能反而更差。async 只在 I/O 密集且用异步库时才有红利。

### 误区 3："FastAPI 自带 ORM 和数据库"

没有。FastAPI 只负责 API 层。ORM 要自己搭配 SQLAlchemy、SQLModel、Tortoise ORM 等。这也是它"微框架"的体现——不替你做决定。

### 误区 4："自动文档就够了，不用写额外文档"

自动文档描述"接口长什么样"，但描述不了"业务流程""整体架构""使用场景"。这些还得写补充文档。自动文档是底线，不是全部。

## 学习路线图

学 FastAPI 的推荐路径：

| 阶段 | 内容 | 目标 |
|------|------|------|
| 1. 入门 | 安装、Hello World、路径/查询参数、Pydantic 模型 | 能写出可用的 CRUD 接口 |
| 2. 进阶 | 依赖注入、响应模型、校验、异常处理、中间件 | 写出规范、可维护的 API |
| 3. 数据库 | SQLAlchemy/SQLModel、异步数据库、迁移（Alembic） | 接通真实数据存储 |
| 4. 异步深入 | async/await、事件循环、并发控制、后台任务 | 发挥 FastAPI 性能优势 |
| 5. 安全 | OAuth2、JWT、密码哈希、CORS、权限控制 | 做生产级安全 API |
| 6. 测试 | TestClient、pytest、Mock、覆盖率 | 保证代码质量 |
| 7. 部署 | gunicorn+uvicorn、Docker、Nginx、CI/CD | 上生产环境 |
| 8. 高级 | WebSocket、GraphQL、微服务、性能调优 | 应对复杂场景 |

本教程按这个路线逐步展开。本批（1-4 章）是阶段 1 的前半部分，先把基础概念和工具链搭起来。

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 定义 | 现代、高性能、基于类型注解的 Python Web 框架 |
| 作者 | Sebastián Ramírez（tiangolo），2018 年发布 |
| 底层 | Starlette（ASGI）+ Pydantic（校验）+ Uvicorn（服务器）|
| 五大优势 | 开发快、运行快、自动文档、类型安全、异步原生 |
| 对比 Flask | 同为微框架，FastAPI 多了类型/校验/文档/异步 |
| 对比 Django | Django 全家桶适合网站，FastAPI 适合 API/微服务 |
| 对比 Sanic | 都异步，FastAPI 多了类型驱动+自动文档 |
| 适用场景 | API、微服务、ML 部署、实时应用、Serverless |
| 不适用 | 重型 CMS、CPU 密集计算、传统 SSR 网站 |
| 核心理念 | 类型注解作为单一数据源，一份声明多处受益 |

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

## Python 版本要求

FastAPI 要求 Python 3.8 及以上。但建议直接用 **Python 3.12+**，原因：

- 3.10+ 支持 \`str | None\` 这种联合类型语法（不用再写 \`Optional[str]\`）。
- 3.11+ 的异常处理、错误提示更友好。
- 3.12+ 性能进一步提升，且支持更现代的类型语法。
- FastAPI 0.100+ 已经放弃对 3.7 的支持，未来版本会要求更高。

第一步是确认 Python 版本：

\`\`\`bash
# 查看 Python 版本
python --version
# 期望输出：Python 3.12.x 或更高

# 如果是 Windows，可能要写 py
py --version
\`\`\`

如果版本低于 3.8，先去 [python.org](https://www.python.org/downloads/) 下载安装新版本。Mac 用户可以用 \`brew install python@3.12\`，Linux 用户用系统包管理器或 pyenv。

## 虚拟环境：Python 工程的基本规范

强烈建议用虚拟环境隔离项目依赖，避免污染系统 Python、避免不同项目依赖冲突。这是 Python 工程的基本规范，不是可选项。

为什么需要虚拟环境？举个例子：

- 项目 A 用 Django 3.x，项目 B 用 Django 4.x。装在系统 Python 里只能有一个版本，必有一个项目跑不起来。
- 你装了个全局包，结果它依赖某个老库，把系统其他工具搞崩了。
- 部署到服务器，不确定装了哪些包，复现环境困难。

虚拟环境给每个项目一个独立的 Python 环境，互不干扰。下面介绍三种主流方式。

### 方式 1：venv（Python 自带，最通用）

\`venv\` 是 Python 3.3+ 自带的虚拟环境工具，不需要额外安装：

\`\`\`bash
# 1. 创建虚拟环境（在项目目录下执行）
#    python -m venv 表示以模块方式运行 venv
#    .venv 是虚拟环境目录名（约定俗成，可改）
python -m venv .venv

# 2. 激活虚拟环境
# macOS / Linux：
source .venv/bin/activate
# Windows PowerShell：
.venv\\Scripts\\Activate.ps1
# Windows CMD：
.venv\\Scripts\\activate.bat

# 3. 激活后提示符会变成 (.venv) $，表示当前在虚拟环境中
#    此时 pip install 装的包只在 .venv 里生效

# 4. 退出虚拟环境
deactivate
\`\`\`

⚠️ Windows PowerShell 第一次执行可能报"禁止运行脚本"。解决：

\`\`\`powershell
# 以管理员身份运行 PowerShell，执行一次：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

### 方式 2：conda（数据科学 / ML 场景常用）

如果做机器学习，通常用 conda（Anaconda 或 Miniconda）。conda 既能管 Python 版本又能管包：

\`\`\`bash
# 1. 创建虚拟环境，指定 Python 版本
#    conda create -n 环境名 python=3.12
conda create -n fastapi-demo python=3.12

# 2. 激活环境
conda activate fastapi-demo

# 3. 在环境里装包（可以用 pip 也可以用 conda）
pip install fastapi "uvicorn[standard]"

# 4. 退出环境
conda deactivate

# 5. 列出所有环境
conda env list

# 6. 删除环境
conda env remove -n fastapi-demo
\`\`\`

conda 的优势：能装非 Python 的二进制依赖（如 CUDA、某些 C 库），适合 ML 场景。劣势：装包比 pip 慢、依赖解析偶尔有坑。

### 方式 3：poetry（现代 Python 项目管理）

Poetry 是现代化的 Python 包管理工具，集虚拟环境、依赖管理、打包发布于一体：

\`\`\`bash
# 1. 安装 poetry（一次性）
# macOS / Linux：
curl -sSL https://install.python-poetry.org | python3 -
# Windows PowerShell：
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

# 2. 创建新项目
poetry new fastapi-demo
# 生成结构：
# fastapi-demo/
# ├── pyproject.toml    # 项目配置和依赖
# ├── README.md
# ├── fastapi_demo/
# │   └── __init__.py
# └── tests/

# 3. 或在现有目录初始化
cd fastapi-demo
poetry init

# 4. 添加依赖
poetry add fastapi uvicorn[standard]

# 5. 进入虚拟环境 shell
poetry shell

# 6. 运行命令
poetry run uvicorn main:app --reload
\`\`\`

Poetry 的优势：\`pyproject.toml\` 是现代 Python 项目标准、有锁文件（poetry.lock）锁定版本、依赖解析更准。劣势：学习成本略高、装包偶尔比 pip 慢。

三种方式怎么选？

| 方式 | 适合场景 | 优势 | 劣势 |
|------|---------|------|------|
| venv | 通用、轻量 | 自带无需装、简单 | 不锁版本、要手动管 requirements |
| conda | ML/数据科学 | 能管 Python 版本和二进制依赖 | 慢、偶尔有解析坑 |
| poetry | 中大型项目 | 现代标准、锁文件、打包发布 | 学习成本、偶尔慢 |

新手建议：先用 venv 上手，项目大了再切 poetry。

## 安装 FastAPI 与 Uvicorn

激活虚拟环境后，安装只需要两个包：

\`\`\`bash
# 安装 FastAPI 和 Uvicorn（带 standard 附加依赖）
pip install fastapi "uvicorn[standard]"
\`\`\`

拆开看这两个包：

- **fastapi**：框架本体，提供路由、依赖注入、校验、文档等能力。
- **uvicorn**：ASGI 服务器，负责真正监听网络端口、接收 HTTP 请求，然后转交给 FastAPI 处理。\`[standard]\` 是安装附加依赖（如 \`httptools\` 更快的 HTTP 解析器、\`websockets\`、\`uvloop\` 高性能事件循环），生产环境推荐装。

为什么要分开？因为 FastAPI 是一个 ASGI 应用，它本身不监听端口。需要外面有一个 ASGI 服务器（uvicorn / hypercorn / daphne）来跑它。这和 Flask 的 \`flask run\`、Django 的 \`runserver\` 不同——FastAPI 把"应用"和"服务器"解耦了。

也可以只装最小依赖：

\`\`\`bash
# 不带 standard，只装最小依赖（开发测试够用）
pip install fastapi uvicorn
\`\`\`

验证安装：

\`\`\`bash
# 用 -c 执行内联 Python 代码
python -c "import fastapi; print(fastapi.__version__)"
# 期望输出：0.110.0 或更高

python -c "import uvicorn; print(uvicorn.__version__)"
# 期望输出：0.27.0 或更高
\`\`\`

## 第一个 FastAPI 应用

新建一个 \`main.py\` 文件：

\`\`\`python
# main.py
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例，这是整个 FastAPI 应用的入口
# 参数 title 会出现在自动文档的页面标题上
app = FastAPI(title="我的第一个 FastAPI")


# 定义一个路由：当访问根路径 / 时，执行这个函数
# @app.get 是装饰器，表示用 GET 方法访问 "/" 路径
@app.get("/")
# 定义函数 root，无参数
def root():
    # 返回一个 dict，FastAPI 会自动把它转成 JSON 响应
    return {"message": "Hello, FastAPI!"}


# 再加一个带路径参数的接口
# {item_id} 是路径参数，会自动传给函数
@app.get("/items/{item_id}")
# 定义函数 read_item，参数 item_id 是 int 类型
def read_item(item_id: int):
    # item_id 已经被自动转成 int（类型注解驱动）
    return {"item_id": item_id}


# 启动方式（终端执行）：
# uvicorn main:app --reload
# 然后浏览器访问 http://127.0.0.1:8000/
\`\`\`

逐行讲解：

1. \`from fastapi import FastAPI\`：导入 FastAPI 类。
2. \`app = FastAPI(title="...")\`：实例化应用。这个 \`app\` 对象是 ASGI 应用，所有路由都挂在它上面。\`title\` 会显示在文档页面。
3. \`@app.get("/")\`：装饰器，注册一个 GET 路由，路径是 \`/\`。等价于"当有人用 GET 访问根路径时，调用下面的函数"。
4. \`def root():\`：路由处理函数（也叫端点 endpoint）。函数名 \`root\` 会成为 OpenAPI 文档里的 operationId。
5. \`return {"message": ...}\`：返回字典。FastAPI 自动用 \`json.dumps\` 序列化为 JSON，并设置 \`Content-Type: application/json\`。
6. \`@app.get("/items/{item_id}")\`：带路径参数的路由。\`{item_id}\` 会从 URL 提取。
7. \`def read_item(item_id: int)\`：\`item_id: int\` 让 FastAPI 自动把字符串转 int，转不了返回 422。

## 启动应用

在终端运行：

\`\`\`bash
# 格式：uvicorn 模块名:应用变量名
# main.py 文件里的 app 变量，所以是 main:app
uvicorn main:app --reload
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
# 访问根路径
curl http://127.0.0.1:8000/
# {"message":"Hello, FastAPI!"}

# 访问带路径参数的接口
curl http://127.0.0.1:8000/items/42
# {"item_id":42}

# 传非 int 会自动报 422
curl http://127.0.0.1:8000/items/abc
# {"detail":[{"type":"int_parsing","loc":["path","item_id"],...}]}
\`\`\`

恭喜，第一个 FastAPI 接口跑起来了。

## 自动文档：最让人惊喜的特性

不要急着关掉服务，在浏览器里打开这两个地址：

- **http://127.0.0.1:8000/docs** —— Swagger UI 交互式文档
- **http://127.0.0.1:8000/redoc** —— ReDoc 只读文档
- **http://127.0.0.1:8000/openapi.json** —— 原始 OpenAPI JSON

在 \`/docs\` 页面，你能看到刚才写的 \`/\` 和 \`/items/{item_id}\` 接口，点开它，点"Try it out"→ 填参数 → "Execute"，就能直接在浏览器里调用接口、看到返回结果。不需要 Postman、不需要写测试脚本。

这份文档是 FastAPI 根据路由和类型注解**自动生成**的，你一行文档代码都没写。随着接口增多、参数加上类型，文档会自动丰富起来。这是 FastAPI 最省心的能力之一。

## uvicorn 启动参数详解

开发时每改一行代码就要重启服务很烦。uvicorn 提供 \`--reload\` 参数，文件一保存就自动重载。完整参数：

\`\`\`bash
# 完整启动命令示例
uvicorn main:app \\
    --reload \\              # 热重载，开发用
    --host 0.0.0.0 \\        # 监听地址，0.0.0.0 对外可访问
    --port 8000 \\           # 端口
    --workers 1 \\           # 进程数（生产用，不能和 reload 同用）
    --log-level info \\      # 日志级别
    --app-dir .              # 应用目录
\`\`\`

常用参数详解：

| 参数 | 作用 | 示例 | 说明 |
|------|------|------|------|
| \`--reload\` | 热重载，开发用 | \`uvicorn main:app --reload\` | 文件改动自动重启 |
| \`--host\` | 监听地址 | \`--host 0.0.0.0\` | 127.0.0.1 只本机访问，0.0.0.0 对外 |
| \`--port\` | 端口 | \`--port 8080\` | 默认 8000 |
| \`--workers\` | 进程数 | \`--workers 4\` | 生产用，不能和 reload 同用 |
| \`--log-level\` | 日志级别 | \`--log-level debug\` | debug/info/warning/error/critical |
| \`--app-dir\` | 应用目录 | \`--app-dir src\` | 模块查找路径 |
| \`--ssl-keyfile\` | SSL 私钥 | \`--ssl-keyfile key.pem\` | 启用 HTTPS |
| \`--ssl-certfile\` | SSL 证书 | \`--ssl-certfile cert.pem\` | 启用 HTTPS |

⚠️ 注意：\`--reload\` 和 \`--workers\` 不能同时用。reload 是开发模式（主进程监视+子进程重跑），workers 是生产多进程，两者逻辑冲突。

\`--reload\` 的原理：uvicorn 启动一个主进程（reloader）监视文件变化，一旦 \`*.py\` 改动，就重启子进程（worker）。所以你会看到两个 PID。可以指定监视目录：

\`\`\`bash
# 只监视 app 目录的变化
uvicorn main:app --reload --reload-dir app
\`\`\`

## 在代码里启动（可选）

除了命令行 \`uvicorn main:app\`，也可以在代码里启动：

\`\`\`python
# main.py
# 导入 uvicorn 模块
import uvicorn
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，无参数
def root():
    # 返回 {"message": "Hello"}
    return {"message": "Hello"}

# 加上这段，就能直接 python main.py 启动
# __name__ == "__main__" 表示直接运行此脚本（而非被 import）
if __name__ == "__main__":
    # 使用 uvicorn 启动 ASGI 服务器
    # 参数：应用、主机、端口、是否热重载
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# 然后执行：python main.py
# 这种写法方便用 IDE 直接运行调试
\`\`\`

这种写法方便用 IDE 直接运行调试（PyCharm/VSCode 点运行按钮即可）。但生产部署通常还是用命令行 \`uvicorn\` 或 gunicorn+uvicorn worker，因为更灵活、更好管理进程。

## 项目文件结构建议

小项目一个 \`main.py\` 够用。但项目一大，全塞一个文件会乱。推荐结构：

\`\`\`bash
# 推荐的项目结构
my_project/
├── app/
│   ├── __init__.py          # 让 app 成为包
│   ├── main.py              # 应用入口，创建 FastAPI 实例
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # 配置（环境变量、数据库 URL）
│   │   └── security.py      # 安全相关（JWT、密码哈希）
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # 依赖注入（数据库会话、当前用户）
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py    # 汇总所有子路由
│   │       ├── items.py     # 商品相关路由
│   │       └── users.py     # 用户相关路由
│   ├── models/              # SQLAlchemy ORM 模型
│   │   ├── __init__.py
│   │   └── item.py
│   ├── schemas/             # Pydantic 模型（请求/响应）
│   │   ├── __init__.py
│   │   └── item.py
│   ├── crud/                # 数据库操作
│   │   ├── __init__.py
│   │   └── item.py
│   └── services/            # 业务逻辑层
│       ├── __init__.py
│       └── item.py
├── tests/                   # 测试
│   ├── __init__.py
│   ├── conftest.py
│   └── test_items.py
├── .env                     # 环境变量
├── .gitignore
├── requirements.txt         # 依赖
└── README.md
\`\`\`

对应的 \`main.py\` 示例：

\`\`\`python
# app/main.py
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI
# 从当前包的 api.v1.router 模块导入 api_router
from app.api.v1.router import api_router

# 创建 FastAPI 应用实例，带元数据
app = FastAPI(
    title="我的项目 API",
    description="项目后端接口文档",
    version="1.0.0",
)

# 把所有 v1 路由挂到 /api/v1 前缀下
app.include_router(api_router, prefix="/api/v1")

# 启动：uvicorn app.main:app --reload
# 注意模块路径是 app.main，不是 main
\`\`\`

分层原则：路由层（api）只做参数接收和响应返回，业务逻辑放 services，数据库操作放 crud，数据结构放 schemas，ORM 模型放 models。这样每层职责清晰，可测试性好。

## .env 环境变量管理

生产项目不能把数据库密码、API Key 写死在代码里。标准做法是用环境变量 + \`.env\` 文件。

### 安装 python-dotenv

\`\`\`bash
# 安装 python-dotenv，用于读取 .env 文件
pip install python-dotenv
\`\`\`

### 创建 .env 文件

\`\`\`bash
# .env 文件（不要提交到 git！加到 .gitignore）
# 数据库连接字符串
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
# 应用密钥
SECRET_KEY=your-super-secret-key-change-in-production
# 调试模式
DEBUG=True
# API 版本
API_V1_PREFIX=/api/v1
\`\`\`

### 在代码里读取

\`\`\`python
# app/core/config.py
# 导入 os 模块（用于读取环境变量）
import os
# 从 dotenv 包导入 load_dotenv 函数
# load_dotenv 会把 .env 文件里的键值对加到 os.environ
from dotenv import load_dotenv

# 加载 .env 文件到环境变量
# 必须在使用 os.getenv 之前调用
load_dotenv()

# 从环境变量读取配置，带默认值
# os.getenv("KEY", "默认值")：找不到 KEY 时返回默认值
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
# 环境变量都是字符串，需要手动转 bool
# .lower() == "true" 把 "True"/"TRUE" 等统一转成小写再比较
DEBUG = os.getenv("DEBUG", "False").lower() == "true"  # 字符串转 bool
API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/api/v1")

# 使用：
# 在 main.py 里 from app.core.config import DATABASE_URL
\`\`\`

更优雅的做法是用 Pydantic Settings（FastAPI 作者推荐）：

\`\`\`python
# app/core/config.py
# 从 pydantic_settings 包导入 BaseSettings 类
# BaseSettings 是 Pydantic 提供的配置基类，字段自动从环境变量读取
from pydantic_settings import BaseSettings

# 定义配置类 Settings，继承 BaseSettings
class Settings(BaseSettings):
    # 字段都会从环境变量读取
    # 数据库连接字符串，默认用本地 SQLite
    DATABASE_URL: str = "sqlite:///./dev.db"
    # 应用密钥，用于 JWT 签名等，生产环境必须改成随机长串
    SECRET_KEY: str = "dev-secret"
    # 调试模式开关，生产环境必须为 False
    DEBUG: bool = False
    # API 路径前缀，所有 v1 接口都挂在它下面
    API_V1_PREFIX: str = "/api/v1"

    # 配置：从 .env 文件读取
    # model_config 是 Pydantic v2 的配置写法（v1 用 class Config:）
    # env_file 指定 .env 文件路径，启动时自动加载
    model_config = {"env_file": ".env"}

# 创建配置实例（全局单例）
# 实例化时 BaseSettings 会按优先级读取：环境变量 > .env 文件 > 默认值
settings = Settings()

# 使用：from app.core.config import settings
# 然后 settings.DATABASE_URL
\`\`\`

需要装 \`pip install pydantic-settings\`。这种写法的好处：类型校验、自动从 .env 读取、IDE 有提示。

⚠️ **安全提醒**：\`.env\` 文件**绝对不能**提交到 git。在 \`.gitignore\` 里加：

\`\`\`
# .gitignore
.env
.env.*
!.env.example
\`\`\`

提供一份 \`.env.example\`（不含真实密码）让团队知道要配哪些变量。

## 常见安装错误排查

### 错误 1：uvicorn: command not found

虚拟环境没激活，或没装。解决：

\`\`\`bash
# 1. 确认虚拟环境激活了（提示符有 (.venv)）
source .venv/bin/activate

# 2. 确认装了
pip list | grep uvicorn

# 3. 如果没有，重新装
pip install "uvicorn[standard]"
\`\`\`

### 错误 2：Port 8000 already in use

端口被占用。要么杀掉占用进程，要么换端口：

\`\`\`bash
# macOS / Linux：查端口占用
lsof -i :8000
# 杀进程
kill -9 <PID>

# Windows：查端口占用
netstat -ano | findstr :8000
# 杀进程
taskkill /PID <PID> /F

# 或者直接换端口
uvicorn main:app --port 8001
\`\`\`

### 错误 3：ModuleNotFoundError: No module named 'fastapi'

两种可能：

1. 没在虚拟环境里装（激活了再 \`pip install\`）。
2. 文件名和包名冲突——别把文件命名为 \`fastapi.py\` 或 \`uvicorn.py\`，会遮蔽真实包。

\`\`\`bash
# 检查当前目录有没有同名文件
ls | grep -E "fastapi|uvicorn"
# 如果有，改名！
\`\`\`

### 错误 4：ImportError: cannot import name 'X'

版本太老。升级：

\`\`\`bash
# 升级 fastapi 和 uvicorn 到最新
pip install --upgrade fastapi uvicorn
\`\`\`

FastAPI 迭代快，老版本和新版本 API 差异较大，建议跟最新稳定版。

### 错误 5：Windows 上 Activate.ps1 被禁止运行

PowerShell 默认禁止运行脚本。解决：

\`\`\`powershell
# 以管理员身份运行 PowerShell，执行一次：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

### 错误 6：pip install 很慢

国内网络访问 PyPI 慢，换镜像源：

\`\`\`bash
# 临时使用清华镜像
pip install fastapi "uvicorn[standard]" -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久设置（写入配置）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

## 用 httpie / curl / Postman 测试 API

接口跑起来后要测试。工具有很多，下面介绍三种。

### 方式 1：curl（命令行万能工具）

\`\`\`bash
# GET 请求
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/items/42

# GET 带 query 参数
curl "http://127.0.0.1:8000/items/42?q=apple"

# POST 请求（带 JSON body）
curl -X POST http://127.0.0.1:8000/items/ \\
    -H "Content-Type: application/json" \\
    -d '{"name": "苹果", "price": 5.5, "quantity": 10}'

# 带认证头
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/users/me

# 显示响应头
curl -i http://127.0.0.1:8000/

# 只看状态码
curl -o /dev/null -s -w "%{http_code}\\n" http://127.0.0.1:8000/
\`\`\`

curl 的优势：所有系统自带、脚本里好集成、无 GUI 依赖。

### 方式 2：httpie（更友好的命令行工具）

httpie 是 curl 的现代化替代品，语法更友好：

\`\`\`bash
# 安装
pip install httpie

# GET 请求（最简单）
http http://127.0.0.1:8000/
http http://127.0.0.1:8000/items/42

# 带 query 参数
http http://127.0.0.1:8000/items/42 q==apple
# == 表示 query 参数

# POST 请求（带 JSON body）
http POST http://127.0.0.1:8000/items/ name=苹果 price:=5.5 quantity:=10
# := 表示 JSON 值（数字、bool 等）

# 带认证头
http http://127.0.0.1:8000/users/me Authorization:"Bearer <token>"

# httpie 会自动美化 JSON 输出，带颜色高亮
\`\`\`

httpie 的优势：语法直观、输出自动美化、JSON 处理方便。

### 方式 3：Postman / Insomnia（GUI 工具）

GUI 工具适合复杂场景：需要保存请求历史、组织成集合、做环境切换、团队共享。

Postman 基本用法：

1. 新建 Request，选方法（GET/POST/...），填 URL。
2. Body 选 raw + JSON，填请求体。
3. Headers 加需要的请求头。
4. Send，看响应。

更省心的方案：**直接用 FastAPI 自带的 \`/docs\`（Swagger UI）**，它本身就是个在线 API 测试工具，且和代码永远同步。日常开发，\`/docs\` + curl/httpie 已经够用，Postman 是重场景才上。

## 推荐的项目依赖管理

小项目用 \`pip + requirements.txt\` 足够：

\`\`\`bash
# 导出当前依赖到 requirements.txt
pip freeze > requirements.txt

# 别人拿到项目后安装
pip install -r requirements.txt
\`\`\`

但 \`pip freeze\` 会把所有间接依赖也列出来，环境一变就容易出问题。更好的写法是手动维护关键依赖：

\`\`\`txt
# requirements.txt（手动维护关键依赖）
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
pydantic>=2.0
python-dotenv>=1.0
\`\`\`

中大项目推荐用 Poetry 或 uv（更快的现代包管理器），它们能锁定版本、管理虚拟环境、解决依赖冲突更省心：

\`\`\`bash
# uv（Rust 写的，极快的包管理器）
pip install uv
uv pip install fastapi "uvicorn[standard]"
uv pip freeze > requirements.txt
\`\`\`

## 快速测试：完整可运行 demo

把前面学的串起来，写一个稍微完整的小应用：

\`\`\`python
# main.py
# 导入 os 模块
import os
# 从 fastapi 包导入 FastAPI, Query 类
from fastapi import FastAPI, Query
# 从 pydantic 包导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例，带元数据
app = FastAPI(
    title="商品管理 API",
    description="一个简单的商品管理 demo",
    version="1.0.0",
)

# 定义 Pydantic 模型 Item，用于请求体校验
class Item(BaseModel):
    # 字段 name，类型 str，最长 50 字符
    name: str = Field(max_length=50, description="商品名称")
    # 字段 price，类型 float，必须 > 0
    price: float = Field(gt=0, description="商品价格，必须大于 0")
    # 字段 quantity，类型 int，默认 0
    quantity: int = Field(default=0, ge=0, description="库存，非负")

# 模拟数据库（内存列表）
db: list[dict] = []

# GET /：健康检查
@app.get("/", tags=["健康检查"])
# 定义函数 health，无参数
def health():
    # 返回 {"status": "ok"}
    return {"status": "ok"}

# GET /items：列出所有商品
@app.get("/items", tags=["商品"])
# 定义函数 list_items，参数 skip 和 limit 是查询参数
# skip: int = 0 表示跳过前 N 条记录，默认 0，用于分页偏移
# limit: int = Query(default=10, le=100) 表示每页最多返回 N 条
#   default=10 → 不传 limit 时默认取 10 条
#   le=100 → limit 必须 <= 100（le 是 less than or equal 的缩写）
def list_items(skip: int = 0, limit: int = Query(default=10, le=100)):
    # 返回 db 列表的分片（切片操作实现分页）
    # db[skip : skip + limit] 取从 skip 开始的 limit 条
    return db[skip : skip + limit]

# POST /items：创建商品
# status_code=201 表示创建成功时返回 201（而非默认 200），符合 RESTful 规范
@app.post("/items", tags=["商品"], status_code=201)
# 定义函数 create_item，参数 item 是 Item 类型
# FastAPI 自动把请求体 JSON 解析并校验成 Item 实例
def create_item(item: Item):
    # 定义变量 new_item，赋值为 item 的字典表示
    # item.model_dump() 是 Pydantic v2 方法，把模型转成 dict（v1 是 item.dict()）
    new_item = item.model_dump()
    # 给 new_item 加 id 字段
    # len(db) + 1 模拟自增主键（真实项目用数据库自增 ID）
    new_item["id"] = len(db) + 1
    # 添加到 db
    db.append(new_item)
    # 返回新创建的商品
    # FastAPI 自动把 dict 序列化为 JSON 响应
    return new_item

# GET /items/{item_id}：查询单个商品
@app.get("/items/{item_id}", tags=["商品"])
# 定义函数 read_item，参数 item_id 是 int
def read_item(item_id: int):
    # 遍历 db 查找
    for item in db:
        # 如果 id 匹配
        if item["id"] == item_id:
            # 返回找到的商品
            return item
    # 没找到返回 404（这里简化，实际用 HTTPException）
    return {"error": "not found"}

# 启动：uvicorn main:app --reload
# 然后：
#   1. 浏览器打开 http://127.0.0.1:8000/docs 看文档
#   2. 在 Swagger 里 POST /items 创建几个商品
#   3. GET /items 查看列表
#   4. GET /items/1 查看单个
\`\`\`

跑起来后，打开 \`/docs\`，你会看到一个完整的"商品管理 API"文档，所有接口都能在线测试。这就是 FastAPI 的魅力——几十行代码，一个可用的 API 服务 + 完整文档。

---

## 本章小结

| 步骤 | 命令 / 代码 |
|------|------------|
| 建虚拟环境 | \`python -m venv .venv && source .venv/bin/activate\` |
| 三种环境管理 | venv（通用）、conda（ML）、poetry（现代项目） |
| 安装 | \`pip install fastapi "uvicorn[standard]"\` |
| 写应用 | \`app = FastAPI()\` + \`@app.get("/")\` |
| 启动（开发） | \`uvicorn main:app --reload\` |
| 看文档 | 浏览器访问 \`/docs\`（Swagger）或 \`/redoc\` |
| 热重载 | \`--reload\`，文件改动自动重启 |
| 常用参数 | \`--host\` \`--port\` \`--workers\` \`--log-level\` |
| 环境变量 | \`.env\` + python-dotenv 或 pydantic-settings |
| 测试工具 | curl（万能）、httpie（友好）、Postman（GUI）、/docs（最省心） |
| 项目结构 | 分层：api/services/crud/models/schemas |

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

## 用餐厅比喻理解同步 vs 异步

理解 ASGI 前，先用一个餐厅比喻讲透同步和异步的区别。

### 同步餐厅（WSGI 模型）

想象一家"同步餐厅"：每个顾客进门，服务员就一对一陪着他——点菜、等厨房做菜、上菜、结账，全程陪同。一个服务员同时只能服务一桌。

- 顾客 A 点了一份牛排（要做 20 分钟）。
- 服务员 A 站在厨房门口等 20 分钟，期间啥也不干。
- 顾客 B 进门，得等服务员 B 来。服务员不够，B 就排队。

这就是同步模型：**一个请求占一个线程，线程在等 I/O 时啥也不干**。Flask + gunicorn 多线程就是这种——开很多服务员（线程），但每个服务员一次只服务一桌。

### 异步餐厅（ASGI 模型）

现在改造餐厅：服务员点完菜，把单子递给厨房，**立刻去服务下一桌**。厨房做好了，喊一声"X 桌的菜好了"，服务员再回来端菜。

- 顾客 A 点牛排（20 分钟）。
- 服务员递单子给厨房，**立刻**去服务顾客 B、C、D...
- 20 分钟后厨房喊"A 桌菜好"，服务员回来端给 A。

这就是异步模型：**一个线程（服务员）能同时处理很多请求，I/O 等待时不闲着**。FastAPI + uvicorn 就是这种——一个事件循环（一个服务员）服务成千上万个连接。

### 关键区别

| 维度 | 同步餐厅（WSGI） | 异步餐厅（ASGI） |
|------|----------------|----------------|
| 服务员数 | 多（线程池） | 少（一个事件循环） |
| 一桌等待时 | 服务员干等 | 服务员去服务别桌 |
| 并发上限 | 受线程数限制 | 受内存/文件描述符限制（很高） |
| 适合场景 | CPU 密集（菜要现做现等） | I/O 密集（等厨房、等外卖） |
| 阻塞影响 | 一个服务员卡住只影响一桌 | 服务员被卡住，全餐厅瘫痪 |

最后一点是关键：异步模型里，如果服务员"被卡住"（比如站在厨房门口死等），整个餐厅就瘫痪了。这就是为什么 async 路由里写阻塞代码危害大。

## WSGI vs ASGI：从同步到异步

Python Web 发展史上，有两个里程碑式的接口规范：

- **WSGI**（Web Server Gateway Interface，PEP 3333）：同步接口。服务器每收到一个请求，就调用一次应用函数，函数返回响应，期间是阻塞的。Flask、Django（传统模式）都基于 WSGI。代表服务器：gunicorn、uWSGI。
- **ASGI**（Asynchronous Server Gateway Interface）：异步接口。支持 async/await、长连接、WebSocket、HTTP/2。FastAPI、Starlette、Django（3.0+ 异步通道）基于 ASGI。代表服务器：uvicorn、hypercorn、daphne。

### WSGI 的函数签名（同步）

WSGI 应用是一个普通同步函数，接收 \`environ\`（请求信息字典）和 \`start_response\`（开始响应的回调）：

\`\`\`python
# WSGI 应用：接收 environ（请求信息）和 start_response（开始响应的回调）
# 定义函数 app，参数 environ 和 start_response
# environ: dict，包含请求的所有信息（方法、路径、请求头、环境变量等）
# start_response: callable，用于发送响应状态码和响应头
def app(environ, start_response):
    # 调用 start_response，传入状态码和响应头列表
    # "200 OK" 是 HTTP 状态行
    # [("Content-Type", "text/plain")] 是响应头列表，每个元素是 (name, value) 元组
    start_response("200 OK", [("Content-Type", "text/plain")])
    # 返回可迭代对象（响应体），这里是字节串列表
    # WSGI 要求响应体是 bytes 的可迭代对象，所以用 b"..." 前缀
    return [b"Hello, WSGI!"]

# 特点：
# - 同步函数，处理完才返回
# - 期间任何阻塞（time.sleep、数据库查询）都占着线程
# - 不支持长连接、WebSocket
\`\`\`

### ASGI 的函数签名（异步）

ASGI 应用是一个异步函数，接收 \`scope\`（连接信息）、\`receive\`（接收请求的协程）、\`send\`（发送响应的协程）：

\`\`\`python
# ASGI 应用：接收 scope、receive、send
# 定义异步函数 app，参数 scope、receive、send
# scope: dict，连接的元信息（协议类型、请求方法、路径、请求头等）
# receive: async callable，调用它会返回一个包含请求数据的 dict（如请求体分片）
# send: async callable，调用它发送响应消息（先发 response.start 再发 response.body）
async def app(scope, receive, send):
    # await send 发送响应起始行和头
    # 必须先发 http.response.start，再发 http.response.body
    await send({
        "type": "http.response.start",   # 消息类型：响应开始
        "status": 200,                    # 状态码
        "headers": [[b"content-type", b"text/plain"]],  # 响应头（字节串对列表）
    })
    # await send 发送响应体
    await send({
        "type": "http.response.body",     # 消息类型：响应体
        "body": b"Hello, ASGI!",          # 响应体字节串
    })

# 特点：
# - 异步函数，用 async/await
# - 期间 await I/O 时不占线程，能让出 CPU
# - 支持长连接、WebSocket、HTTP/2
\`\`\`

### WSGI vs ASGI 对比表

| 维度 | WSGI | ASGI |
|------|------|------|
| 调用方式 | 同步函数 | 协程（async/await） |
| 并发模型 | 多线程 / 多进程 | 事件循环（单线程协程） |
| 长连接 | 不支持 | 支持（WebSocket、SSE、HTTP/2） |
| 阻塞影响 | 一个请求占一个线程，阻塞只影响自己 | 阻塞会卡住整个事件循环，影响所有请求 |
| 适合场景 | CPU 密集 / 传统同步代码 | I/O 密集 / 高并发长连接 |
| 代表框架 | Flask、Django（传统） | FastAPI、Starlette、Django 3.0+ |
| 代表服务器 | gunicorn、uWSGI | uvicorn、hypercorn、daphne |

## ASGI 协议详解：scope、receive、send

ASGI 协议的核心是三个参数：\`scope\`、\`receive\`、\`send\`。理解它们就理解了 ASGI 的本质。

### scope（连接信息）

\`scope\` 是一个字典，描述这次连接的"元信息"。HTTP 请求的 scope 长这样：

\`\`\`python
# scope 示例（HTTP 请求）
# scope 是一个字典，在连接建立时就确定，整个连接期间不变
# 对 HTTP 来说，一个请求对应一个 scope；对 WebSocket 来说，整个会话共享一个 scope
scope = {
    "type": "http",              # 协议类型：http / websocket / lifespan
    # asgi 字段记录 ASGI 规范版本，服务器和应用据此判断兼容性
    "asgi": {"version": "3.0", "spec_version": "2.3"},  # ASGI 版本
    "http_version": "1.1",       # HTTP 版本（1.0 / 1.1 / 2）
    "method": "GET",             # 请求方法（GET / POST / PUT / DELETE 等）
    "scheme": "http",            # 协议（http/https），反映是否经过 TLS
    "path": "/items/42",         # 请求路径（不含 query 字符串）
    # query_string 是字节串而非字符串，需要 .decode() 转成 str 才能用
    "query_string": b"q=apple",  # query 字符串（字节串）
    # headers 是字节串对的列表，不是字典（因为一个头名可以有多个值）
    # 每个元素是 [name_bytes, value_bytes] 的二元列表
    "headers": [                 # 请求头列表（字节串对）
        [b"host", b"127.0.0.1:8000"],
        [b"user-agent", b"curl/7.81.0"],
    ],
    # client 是 [ip, port] 列表，用于日志、限流、IP 白名单
    "client": ["127.0.0.1", 54321],  # 客户端地址和端口
    # server 是 [ip, port] 列表，用于判断请求落在哪个监听地址
    "server": ["127.0.0.1", 8000],   # 服务器地址和端口
}
\`\`\`

scope 在连接建立时就确定，整个连接期间不变。对 HTTP 来说，一个请求一个 scope；对 WebSocket 来说，整个会话共享一个 scope。

### receive（接收请求）

\`receive\` 是一个异步函数，调用它来"接收"客户端发来的数据。对 HTTP 请求，调用 \`await receive()\` 拿到请求体分片：

\`\`\`python
# receive 返回的消息示例
message = await receive()
# message 长这样：
# {
#     "type": "http.request",        # 消息类型
#     "body": b'{"name": "apple"}',  # 请求体分片（字节串）
#     "more_body": False,            # 是否还有更多分片
# }

# 大请求体会分多个消息发，要循环接收：
body = b""
more = True
while more:
    # 定义变量 message，赋值为 await receive()
    message = await receive()
    # 拼接 body
    body += message.get("body", b"")
    # 更新 more
    more = message.get("more_body", False)
\`\`\`

### send（发送响应）

\`send\` 也是一个异步函数，调用它来"发送"响应给客户端。要先发 \`http.response.start\`（状态码+头），再发 \`http.response.body\`（响应体）：

\`\`\`python
# 1. 发送响应起始行和头
await send({
    "type": "http.response.start",   # 消息类型：响应开始
    "status": 200,                    # 状态码
    "headers": [                      # 响应头列表
        [b"content-type", b"application/json"],
    ],
})

# 2. 发送响应体
await send({
    "type": "http.response.body",   # 消息类型：响应体
    "body": b'{"msg": "hello"}',    # 响应体（字节串）
})
\`\`\`

### 一个完整的原生 ASGI 应用

不用 FastAPI，手写一个原生 ASGI 应用，理解底层：

\`\`\`python
# raw_asgi.py
# 定义异步函数 app，参数 scope、receive、send
# 这是一个最原生的 ASGI 应用，没有任何框架封装
async def app(scope, receive, send):
    # 只处理 http 类型
    # scope["type"] 可能是 "http" / "websocket" / "lifespan"
    if scope["type"] != "http":
        # 不是 http 就直接返回
        return

    # 从 scope 读 method 和 path
    # scope 在连接建立时就确定，整个连接期间不变
    method = scope["method"]
    path = scope["path"]

    # 接收请求体（即使不用也要消费掉）
    # body 用 bytes 拼接，因为 receive 返回的 body 是字节串
    body = b""
    # more 控制循环，表示是否还有更多分片要接收
    more = True
    while more:
        # 定义变量 message，赋值为 await receive()
        # 每次调用 receive() 拿到一段请求体消息
        message = await receive()
        # 拼接 body
        # message["body"] 是这一段的字节串，没有就用空字节串 b""
        body += message.get("body", b"")
        # 更新 more
        # message["more_body"] 为 True 表示后面还有分片，False 表示这是最后一段
        more = message.get("more_body", False)

    # 构造响应
    # 定义变量 response，赋值为 JSON 字符串
    # body.decode() 把字节串解码成 str（默认 UTF-8），以便拼进字符串
    response = f'{"method": "{method}", "path": "{path}", "body": "{body.decode()}"}'

    # 发送响应起始行和头
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [[b"content-type", b"application/json"]],
    })

    # 发送响应体
    await send({
        "type": "http.response.body",
        "body": response.encode(),  # response.encode() 把 str 编码成 bytes（默认 UTF-8）
    })

# 启动：uvicorn raw_asgi:app
\`\`\`

跑起来你会看到，一个 ASGI 应用就这么简单——接收 scope、读 receive、写 send。FastAPI 本质就是在这个基础上加了路由、校验、文档等高层能力。所以 FastAPI 是"ASGI 应用"，uvicorn 是"ASGI 服务器"——服务器接收 HTTP，转成 scope/receive/send 调用应用。

## async/await 语法基础

Python 的 async/await 是协程语法糖。理解几个核心概念：

### 协程函数和协程对象

\`\`\`python
# async def 定义的是"协程函数"
# 定义异步函数 fetch_data，无参数
async def fetch_data():
    # 返回 42
    return 42

# 调用协程函数，得到的是"协程对象"，不会立即执行
# 定义变量 coro，赋值为 fetch_data()
coro = fetch_data()
# coro 是一个协程对象，<coroutine object fetch_data at 0x...>

# 要执行协程，必须：
# 1. await 它（在另一个 async 函数里）
#    result = await coro
# 2. 用 asyncio.run()（顶层入口）
#    result = asyncio.run(coro)
# 3. 让 FastAPI 帮你 await（路由函数里 return）
\`\`\`

### await 的含义

\`await\` 表示"等这个异步操作完成，期间让出 CPU"。关键是"让出"——别的协程可以运行：

\`\`\`python
# 导入 asyncio 模块
import asyncio

# 定义异步函数 task，参数 name 和 seconds
async def task(name: str, seconds: float):
    # 打印开始
    print(f"{name} 开始")
    # asyncio.sleep 模拟 I/O 等待，await 让出 CPU
    await asyncio.sleep(seconds)
    # 打印结束
    print(f"{name} 结束")
    # 返回 name
    return name

# 串行：A 完了才 B
async def serial():
    # await task("A", 1)  # 等 1 秒
    await task("A", 1)
    # await task("B", 1)  # 再等 1 秒
    await task("B", 1)
    # 总共 2 秒

# 并发：A 和 B 同时跑
async def concurrent():
    # asyncio.gather 并发执行多个协程
    # 定义变量 results，赋值为 await asyncio.gather(...)
    results = await asyncio.gather(
        task("A", 1),
        task("B", 1),
    )
    # 总共 1 秒（A 和 B 并发）
    # 返回 results
    return results

# 运行
# asyncio.run(concurrent())
# 输出：
# A 开始
# B 开始
# A 结束
# B 结束
\`\`\`

\`await\` 不是"阻塞等"，而是"挂起当前协程，等结果回来再继续"。挂起期间事件循环去跑别的协程。

## 事件循环概念

事件循环（Event Loop）是异步的核心。可以理解为一个"无限循环"，不断检查"哪些协程准备好了"：

\`\`\`python
# 事件循环的伪代码（便于理解，非真实实现）
def event_loop():
    # 待执行的任务队列
    # ready 里是"可以立即跑"的协程（刚进来或 I/O 已就绪）
    ready = []
    # 等待中的任务（在等 I/O）
    # waiting 里是"卡在 await I/O"的协程
    waiting = []

    while True:
        # 1. 把 ready 里的任务跑一轮
        for task in ready:
            # 跑任务，直到它 await 或完成
            # run_until_await 是伪代码：跑到下一次 await 就把控制权还回来
            result = task.run_until_await()
            if task.is_waiting():
                # 任务在等 I/O，移到 waiting
                waiting.append(task)
            elif task.is_done():
                # 任务完成，回调
                # 触发 await 处的回调，让等待结果的协程继续
                task.callback()

        # 2. 检查 waiting 里哪些 I/O 完成了
        for task in waiting:
            if task.io_ready():
                # I/O 就绪，把任务移回 ready，下一轮继续跑
                ready.append(task)

        # 3. 没事干就阻塞等 I/O 事件（select/epoll）
        # 这是事件循环"休息"的时刻，操作系统会在 I/O 就绪时唤醒它
        # ...
\`\`\`

事件循环的关键：**单线程**。所有协程都在一个线程里跑，靠"挂起-恢复"实现并发。没有线程切换开销，但一个协程卡住（不 await，纯 CPU 计算），整个循环就卡住。

这就是为什么 async 路由里写阻塞代码危害大——它让事件循环卡住，所有其他请求都受影响。

## 什么时候用 async def，什么时候用 def

FastAPI 允许你两种路由混用。这是新手最容易困惑的点，讲清楚：

### 普通 def 路由

FastAPI 知道这是同步函数，会把它放到**线程池**里执行（用 \`run_in_threadpool\`）。所以即使函数里有阻塞操作（\`time.sleep\`、同步数据库调用），也只阻塞线程池里的一个线程，不会卡住事件循环。

\`\`\`python
# 同步路由：用普通 def
# 定义 GET 路由：访问 /sync 时触发
@app.get("/sync")
# 定义函数 sync_endpoint，无参数
def sync_endpoint():
    # time.sleep 阻塞 1 秒，但只占线程池一个线程
    import time
    time.sleep(1)
    # 返回 {"type": "sync"}
    return {"type": "sync"}
\`\`\`

### async def 路由

FastAPI 直接在**事件循环**里 await 这个协程。如果协程里调用了阻塞操作（\`time.sleep\`、同步 \`requests.get\`），会**卡住整个事件循环**，所有其他请求都得等它。

\`\`\`python
# 异步路由：用 async def
# 定义 GET 路由：访问 /async 时触发
@app.get("/async")
# 定义异步函数 async_endpoint，无参数
async def async_endpoint():
    # asyncio.sleep 异步等待 1 秒，不阻塞事件循环
    import asyncio
    await asyncio.sleep(1)
    # 返回 {"type": "async"}
    return {"type": "async"}
\`\`\`

### 决策流程图

写路由时按这个顺序判断：

1. 函数里有没有阻塞调用（同步 I/O、CPU 计算）？
   - 没有（或都是 async 库）→ 用 \`async def\`，享受异步红利。
   - 有，且能换成异步库 → 换库，用 \`async def\`。
   - 有，且换不了库 → 用普通 \`def\`（FastAPI 自动放线程池）。
2. 非得在 async 函数里调同步阻塞代码 → 用 \`run_in_threadpool\` 包一层。

简单记忆：**async 库用 async def，同步库用 def，别在 async def 里写阻塞代码**。

## 阻塞操作的危害：实测

看一个反面教材：

\`\`\`python
# bad_demo.py
# 导入 asyncio 模块
import asyncio
# 导入 time 模块
import time
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 反面教材：async 路由里用同步阻塞 time.sleep
# 定义 GET 路由：访问 /bad 时触发
@app.get("/bad")
# 定义异步函数 bad，无参数
async def bad():
    # time.sleep 阻塞事件循环 5 秒！整个服务器卡住
    time.sleep(5)
    # 返回 {"msg": "done"}
    return {"msg": "done"}

# 一个正常接口
# 定义 GET 路由：访问 /ping 时触发
@app.get("/ping")
# 定义异步函数 ping，无参数
async def ping():
    # 返回 {"msg": "pong"}
    return {"msg": "pong"}

# 测试：
# 1. 终端 A：curl http://127.0.0.1:8000/bad &
# 2. 终端 B：curl http://127.0.0.1:8000/ping
# /ping 也会卡 5 秒才返回！因为事件循环被 /bad 的 time.sleep 阻塞了
\`\`\`

如果你先请求 \`/bad\`，再请求 \`/ping\`，\`/ping\` 也会卡 5 秒才返回——因为事件循环被 \`/bad\` 里的 \`time.sleep\` 阻塞了，\`/ping\` 排队等着。

### 正确做法 1：换成异步库

\`\`\`python
# 导入 asyncio 模块
import asyncio
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 正确：async 路由用异步 sleep
# 定义 GET 路由：访问 /good 时触发
@app.get("/good")
# 定义异步函数 good，无参数
async def good():
    # asyncio.sleep 异步等待，不阻塞事件循环
    await asyncio.sleep(5)
    # 返回 {"msg": "done"}
    return {"msg": "done"}

# 现在 /ping 不会被 /good 影响
\`\`\`

### 正确做法 2：用 def 让 FastAPI 放线程池

\`\`\`python
# 导入 time 模块
import time
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 正确：阻塞操作用 def，FastAPI 自动放线程池
# 定义 GET 路由：访问 /good2 时触发
@app.get("/good2")
# 定义函数 good2，无参数
def good2():
    # time.sleep 阻塞，但只占线程池一个线程，不卡事件循环
    time.sleep(5)
    # 返回 {"msg": "done"}
    return {"msg": "done"}

# /ping 也不受影响
\`\`\`

### 正确做法 3：run_in_threadpool 包一层

\`\`\`python
# 从 fastapi.concurrency 导入 run_in_threadpool
from fastapi.concurrency import run_in_threadpool
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 必须用 async 但有同步阻塞代码，用 run_in_threadpool
# 定义 GET 路由：访问 /legacy 时触发
@app.get("/legacy")
# 定义异步函数 legacy，无参数
async def legacy():
    # 把同步阻塞函数丢到线程池，async 等待结果
    # 定义变量 result，赋值为 await run_in_threadpool(blocking_db_call, arg1)
    result = await run_in_threadpool(blocking_db_call, arg1)
    # 返回 {"result": result}
    return {"result": result}
\`\`\`

\`run_in_threadpool\` 内部用 \`anyio.to_thread.run_sync\`，把同步函数丢到线程池执行，返回一个可 await 的对象。

## CPU 密集型任务的陷阱

异步不适合 CPU 密集型任务。因为 CPU 计算没有 I/O 等待，不会"挂起让出 CPU"，会一直占着事件循环：

\`\`\`python
# 反面教材：async 路由里做 CPU 密集计算
# 定义 GET 路由：访问 /cpu-bad 时触发
@app.get("/cpu-bad")
# 定义异步函数 cpu_bad，无参数
async def cpu_bad():
    # 大量计算，占着事件循环 3 秒，期间所有请求卡住
    # 定义变量 total，赋值为 sum(i * i for i in range(100_000_000))
    total = sum(i * i for i in range(100_000_000))
    # 返回 {"total": total}
    return {"total": total}
\`\`\`

正确做法：CPU 密集用 \`def\`（放线程池），或用进程池（\`run_in_processpool\`），或卸载到 Celery 后台任务：

\`\`\`python
# 正确：CPU 密集用 def
# 定义 GET 路由：访问 /cpu-good 时触发
@app.get("/cpu-good")
# 定义函数 cpu_good，无参数
def cpu_good():
    # 大量计算，但只占线程池一个线程，不卡事件循环
    # 定义变量 total，赋值为 sum(i * i for i in range(100_000_000))
    total = sum(i * i for i in range(100_000_000))
    # 返回 {"total": total}
    return {"total": total}
\`\`\`

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
# -w 4 表示 4 个工作进程
# -k uvicorn.workers.UvicornWorker 表示用 uvicorn 的 worker 类
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# 为什么不直接用 uvicorn --workers 4？
# gunicorn 的进程管理更成熟：平滑重启、信号处理、worker 超时重启
# uvicorn 的 --workers 是简化版，生产环境推荐 gunicorn
\`\`\`

gunicorn 负责进程管理（master-worker 模式、平滑重启、信号处理），uvicorn 负责单进程内的异步事件循环。各司其职。

## 一个对比实验：并发 vs 串行

下面两段代码功能一样（请求 3 个外部 API），但性能天差地别：

\`\`\`python
# concurrent_demo.py
# 导入 asyncio 模块
import asyncio
# 导入 time 模块
import time
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟一个异步 HTTP 请求（实际用 httpx）
# 定义异步函数 fetch，参数 url
async def fetch(url: str):
    # asyncio.sleep 模拟网络延迟 1 秒
    await asyncio.sleep(1)
    # 返回模拟结果
    return {"url": url, "data": "..."}

# ❌ 串行异步：3 个请求各 1 秒，总共 3 秒
# 定义 GET 路由：访问 /serial 时触发
@app.get("/serial")
# 定义异步函数 serial，无参数
async def serial():
    # 记录开始时间
    start = time.time()
    # 一个个 await，串行执行
    # 定义变量 a，赋值为 await fetch("https://api.a.com")
    a = await fetch("https://api.a.com")  # 1 秒
    # 定义变量 b，赋值为 await fetch("https://api.b.com")
    b = await fetch("https://api.b.com")  # 1 秒
    # 定义变量 c，赋值为 await fetch("https://api.c.com")
    c = await fetch("https://api.c.com")  # 1 秒
    # 计算耗时
    elapsed = time.time() - start
    # 返回结果和耗时
    return {"results": [a, b, c], "elapsed": elapsed}

# ✅ 并发异步：3 个请求同时发，总共 1 秒
# 定义 GET 路由：访问 /concurrent 时触发
@app.get("/concurrent")
# 定义异步函数 concurrent，无参数
async def concurrent():
    # 记录开始时间
    start = time.time()
    # asyncio.gather 并发执行多个协程
    # 定义变量 a, b, c，赋值为 await asyncio.gather(...)
    a, b, c = await asyncio.gather(
        fetch("https://api.a.com"),
        fetch("https://api.b.com"),
        fetch("https://api.c.com"),
    )
    # 计算耗时
    elapsed = time.time() - start
    # 返回结果和耗时
    return {"results": [a, b, c], "elapsed": elapsed}

# 测试：
# curl http://127.0.0.1:8000/serial       → elapsed ≈ 3.0
# curl http://127.0.0.1:8000/concurrent   → elapsed ≈ 1.0
\`\`\`

这就是异步的价值：I/O 等待时间被用来处理别的请求，整体吞吐量上去了。但前提是用 \`asyncio.gather\` 并发——一个个 \`await\` 还是串行。

## 常见异步陷阱汇总

### 陷阱 1：async 路由里用同步阻塞库

\`\`\`python
# ❌ 错误：async 路由用 requests（同步）
# 定义 GET 路由：访问 /bad 时触发
@app.get("/bad")
# 定义异步函数 bad，无参数
async def bad():
    # requests.get 同步阻塞，卡住事件循环
    import requests
    # 定义变量 r，赋值为 requests.get("https://api.example.com")
    r = requests.get("https://api.example.com")
    # 返回 r.json()
    return r.json()

# ✅ 正确：用 httpx（异步）
# 定义 GET 路由：访问 /good 时触发
@app.get("/good")
# 定义异步函数 good，无参数
async def good():
    # httpx.AsyncClient 异步 HTTP 客户端
    import httpx
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # 定义变量 r，赋值为 await client.get("https://api.example.com")
        r = await client.get("https://api.example.com")
        # 返回 r.json()
        return r.json()
\`\`\`

### 陷阱 2：忘了 await

\`\`\`python
# ❌ 错误：忘了 await，协程没执行
# 定义异步函数 bad，无参数
async def bad():
    # asyncio.sleep 返回协程，没 await 不会执行
    asyncio.sleep(1)  # 没 await！
    # 返回 {"msg": "ok"}
    return {"msg": "ok"}

# ✅ 正确：加 await
# 定义异步函数 good，无参数
async def good():
    # await asyncio.sleep，正确等待
    await asyncio.sleep(1)
    # 返回 {"msg": "ok"}
    return {"msg": "ok"}
\`\`\`

Python 会有 RuntimeWarning: coroutine ... was never awaited，但不会报错，容易忽略。

### 陷阱 3：在 async 里用同步数据库驱动

\`\`\`python
# ❌ 错误：async 路由用 psycopg2（同步 PG 驱动）
# 定义 GET 路由：访问 /users-bad 时触发
@app.get("/users-bad")
# 定义异步函数 users_bad，无参数
async def users_bad():
    # psycopg2 同步查询，阻塞事件循环
    import psycopg2
    # conn = psycopg2.connect(...)
    conn = psycopg2.connect(DATABASE_URL)
    # cur.execute("SELECT ...")
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    # 返回 cur.fetchall()
    return cur.fetchall()

# ✅ 正确：用 asyncpg（异步 PG 驱动）
# 定义 GET 路由：访问 /users-good 时触发
@app.get("/users-good")
# 定义异步函数 users_good，无参数
async def users_good():
    # asyncpg 异步查询
    import asyncpg
    # conn = await asyncpg.connect(DATABASE_URL)
    conn = await asyncpg.connect(DATABASE_URL)
    # rows = await conn.fetch("SELECT * FROM users")
    rows = await conn.fetch("SELECT * FROM users")
    # 返回 rows
    return rows
\`\`\`

主流异步数据库驱动：

| 数据库 | 同步驱动（async 路由里别用）| 异步驱动（async 路由里用）|
|--------|---------------------------|--------------------------|
| PostgreSQL | psycopg2 | asyncpg、psycopg3（async 模式） |
| MySQL | pymysql、mysqlclient | aiomysql |
| SQLite | sqlite3 | aiosqlite |
| 通用 ORM | SQLAlchemy（同步） | SQLAlchemy 2.0（async）、SQLModel |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 餐厅比喻 | 同步=一服务员一桌干等，异步=服务员点完单去服务别桌 |
| WSGI | 同步接口，Flask/Django 传统模式 |
| ASGI | 异步接口，支持 async/WebSocket，FastAPI 基于此 |
| ASGI 三参数 | scope（连接信息）、receive（接收请求）、send（发送响应） |
| 并发模型 | 同步靠多线程，异步靠事件循环（单线程协程） |
| 事件循环 | 单线程无限循环，靠挂起-恢复实现并发 |
| uvicorn | 主流 ASGI 服务器，生产配 gunicorn |
| def 路由 | FastAPI 自动放线程池，阻塞不影响事件循环 |
| async def 路由 | 直接在事件循环跑，阻塞会卡住所有请求 |
| 阻塞代码处理 | 换异步库 / 用 def / 用 run_in_threadpool |
| CPU 密集 | 用 def 或卸载到 Celery，别用 async |
| 适用 async | I/O 密集（数据库、HTTP、缓存） |
| 适用 def | CPU 密集、用同步库时 |
| 常见陷阱 | async 里用同步库、忘 await、CPU 密集放 async |

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

有了这份标准文件，下游就能做很多事：

- 渲染成可视化文档（Swagger UI、ReDoc）。
- 生成各种语言的客户端 SDK（openapi-generator）。
- 做 mock 测试、接口测试自动化。
- 前后端基于它做联调契约。

### 一个最小化的 OpenAPI 文件

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

关键字段：

- \`openapi\`：规范版本（3.0/3.1）。
- \`info\`：API 元信息（标题、版本、描述等）。
- \`paths\`：所有接口定义，按路径分组。
- \`components\`：可复用的 schema（数据模型）。
- \`security\`：认证方式。

## FastAPI 如何自动生成 OpenAPI

FastAPI 之所以能自动出文档，关键在于它把"类型注解"作为单一数据源。当你写下：

\`\`\`python
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 read_item，参数 item_id 是 int，q 是可选 str
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

### Swagger UI（/docs）详解

Swagger UI 是一套开源前端，把 OpenAPI JSON 渲染成可交互的网页。打开 \`/docs\`，你会看到：

**顶部区域**：
- **标题**：来自 \`FastAPI(title=...)\`。
- **描述**：来自 \`FastAPI(description=...)\`，支持 Markdown。
- **版本号**：来自 \`FastAPI(version=...)\`。
- **服务器选择**：可以配置多个环境（开发/测试/生产），切换后请求发到不同地址。

**接口列表**：
- 按 **tags**（标签）分组，没标签的归到 default。
- 每个接口显示：HTTP 方法（颜色区分）、路径、summary（一句话说明）。
- 点开一个接口，展开详情。

**接口详情**（点开后）：
- **Parameters**：参数列表，分 path/query/header/cookie 四类。每个参数显示：名称、类型、是否必填、描述、默认值。
- **Try it out** 按钮：点击进入编辑模式，可以填参数。
- **Execute** 按钮：填完参数点击，直接发请求。
- **Responses**：响应区，显示：
  - 状态码（200/404/422 等）。
  - 响应头。
  - 响应体（JSON 格式化显示）。
  - curl 命令（方便复制到终端）。
  - 请求 URL（实际请求的地址）。
  - 响应时间。

**Models 区域**（页面底部）：
- 列出所有 Pydantic 模型的 schema。
- 显示字段名、类型、约束、默认值。
- 嵌套模型可展开。

### ReDoc（/redoc）对比

ReDoc 是另一套开源前端，更偏"文档展示"：

| 维度 | Swagger UI | ReDoc |
|------|-----------|-------|
| 布局 | 单栏，接口列表+详情 | 三栏：左目录、中详情、右示例 |
| 在线测试 | 支持（Try it out） | 不支持（只读） |
| 适合场景 | 开发调试 | 对外发布文档 |
| 美观度 | 实用 | 更美观，接近正式文档 |
| 性能 | 接口多时稍慢 | 较快 |
| 搜索 | 有 | 有，更强大 |

日常开发用 \`/docs\`（能测试），对外发布用 \`/redoc\`（更美观）。

## 文档定制

默认文档够用，但生产中通常要定制。FastAPI 提供 \`FastAPI()\` 的参数和路由装饰器参数来定制。

### 应用级定制：title、description、version、license

\`\`\`python
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例，带完整元数据
app = FastAPI(
    # title：文档页标题，简短
    title="电商订单 API",
    # description：详细描述，支持 Markdown
    description="""
## 订单服务对外接口文档

本服务提供订单的创建、查询、取消等能力。

### 功能模块
- **订单**：创建、查询、取消
- **支付**：发起支付、支付回调
- **物流**：发货、查询物流

### 联系方式
- 邮箱：api-team@company.com
- 钉钉：API 支持群
""",
    # version：API 版本号
    version="2.1.0",
    # terms_of_service：服务条款 URL
    terms_of_service="https://company.com/terms",
    # contact：联系人信息
    contact={
        "name": "API 团队",
        "url": "https://company.com/support",
        "email": "api-team@company.com",
    },
    # license：开源许可证（如果 API 是公开的）
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
    # openapi_tags：标签的描述和顺序（见下文）
    openapi_tags=[
        {"name": "订单", "description": "订单相关接口"},
        {"name": "支付", "description": "支付相关接口"},
    ],
    # 文档端点路径定制
    docs_url="/my-docs",       # 默认 /docs，改成 /my-docs
    redoc_url="/my-redoc",     # 默认 /redoc
    openapi_url="/my-openapi.json",  # 默认 /openapi.json
)

# description 支持 Markdown，会被渲染到文档顶部
# openapi_tags 定义标签的描述和顺序，文档里按此分组
\`\`\`

### 路由级定制：tags、summary、description

\`\`\`python
# 装饰器：app.get
@app.get(
    # 路径
    "/items/{item_id}",
    # tags：分组标签，文档里按 tag 分类展示
    tags=["商品"],
    # summary：简短一行说明（接口列表显示）
    summary="查询单个商品",
    # description：详细说明（点开后显示，支持 Markdown）
    description="根据商品 ID 查询详情。如果商品不存在返回 404。",
    # response_description：响应的说明
    response_description="商品详情对象",
    # deprecated：是否弃用（见下文）
    deprecated=False,
)
# 定义函数 read_item，参数 item_id 是 int
def read_item(item_id: int):
    # 返回 {"item_id": item_id}
    return {"item_id": item_id}
\`\`\`

- **tags**：最常用，把相关接口归类。文档里会按 tag 分组显示，导航清晰。
- **summary** vs **description**：summary 是一行（接口列表显示），description 是详细说明（点开后显示，支持 Markdown）。
- **response_description**：响应的说明（默认 "Successful Response"）。
- **deprecated**：标记接口已弃用，文档里会显示删除线+警告。

### 更优雅的写法：用 docstring

更优雅的写法：把详细说明写在 docstring 里，FastAPI 会自动用上：

\`\`\`python
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}", tags=["商品"])
# 定义函数 read_item，参数 item_id 是 int
def read_item(item_id: int):
    """
    查询单个商品详情。

    - **item_id**：商品 ID，整数
    - 返回：商品对象，含名称、价格、库存

    商品不存在时返回 404。
    """
    # 返回 {"item_id": item_id}
    return {"item_id": item_id}
\`\`\`

docstring 里的 Markdown 会被渲染到 description，比单独传参数整洁。summary 自动取 docstring 第一行。

### Markdown 支持的语法

description 和 docstring 支持 Markdown，常用语法：

\`\`\`python
# """
# 标题用 # ## ###
# 加粗用 **text**
# 斜体用 *text*
# 代码用 \`code\`
# 代码块用 \`\`\`
# 列表用 - 或 1.
# 链接用 [text](url)
# 表格用 | a | b |
# """
\`\`\`

善用 Markdown 能让文档更专业。

## 响应示例定制：examples

默认的响应示例是自动生成的，但你可以定制更真实的示例：

\`\`\`python
# 从 fastapi 包导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 包导入 BaseModel
from pydantic import BaseModel

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 price，类型 float
    price: float

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.get
@app.get(
    # 路径
    "/items/{item_id}",
    # response_model：声明响应的数据模型
    response_model=Item,
    # responses：定制每个状态码的描述和示例
    responses={
        # 200 成功响应
        200: {
            "description": "商品详情",
            "content": {
                "application/json": {
                    # example：单个示例
                    "example": {"id": 42, "name": "苹果手机", "price": 5999.0}
                }
            },
        },
        # 404 未找到
        404: {
            "description": "商品不存在",
            "content": {
                "application/json": {
                    "example": {"detail": "Item 42 not found"}
                }
            },
        },
        # 422 校验失败
        422: {
            "description": "参数校验失败",
        },
    },
)
# 定义函数 read_item，参数 item_id 是 int
def read_item(item_id: int):
    # 返回 {"id": item_id, "name": "苹果手机", "price": 5999.0}
    return {"id": item_id, "name": "苹果手机", "price": 5999.0}
\`\`\`

\`responses\` 参数能定制每个状态码的描述和示例，前端联调时一看就懂。

### 多个示例：examples

如果想给多个示例（比如"成功"和"失败"两种响应），用 \`examples\`（复数）：

\`\`\`python
# 装饰器：app.post
@app.post(
    # 路径
    "/items/",
    # responses 定制多个示例
    responses={
        201: {
            "description": "创建成功",
            "content": {
                "application/json": {
                    # examples（复数）：多个命名示例
                    "examples": {
                        "成功示例1": {
                            "summary": "正常商品",
                            "value": {"id": 1, "name": "苹果", "price": 5.5},
                        },
                        "成功示例2": {
                            "summary": "贵重商品",
                            "value": {"id": 2, "name": "手表", "price": 9999.0},
                            "description": "贵重商品需要额外审核",
                        },
                    }
                }
            },
        }
    },
)
# 定义函数 create_item，参数 item 是 Item 类型
def create_item(item: Item):
    # 返回 item
    return item
\`\`\`

Swagger UI 会有下拉框切换不同示例，方便展示各种场景。

## 弃用标记：deprecated

接口要下线但不能立刻删（兼容老客户端），用 \`deprecated=True\` 标记：

\`\`\`python
# 定义 GET 路由：访问 /old-api 时触发
@app.get(
    # 路径
    "/old-api",
    # tags 标签
    tags=["旧接口"],
    # deprecated=True 标记为已弃用
    deprecated=True,
    # summary 说明
    summary="（已弃用）旧版查询接口",
)
# 定义函数 old_api，无参数
def old_api():
    """
    ⚠️ 此接口已弃用，请使用 /new-api。

    将在 2024-12-31 下线。
    """
    # 返回 {"msg": "old api"}
    return {"msg": "old api"}

# Swagger UI 里这个接口会显示删除线 + 黄色警告图标
# 前端看到就知道别用了
\`\`\`

Swagger UI 里这个接口会显示删除线 + 黄色警告图标，前端看到就知道别用了。

## 完整实战：一个文档齐全的应用

把前面的知识串起来，写一个文档齐全的图书管理 API：

\`\`\`python
# main.py
# 从 fastapi 包导入 FastAPI, Path, Query
from fastapi import FastAPI, Path, Query
# 从 pydantic 包导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例，带完整元数据
app = FastAPI(
    title="图书管理 API",
    description="""
## 图书管理系统 API

提供图书的增删改查能力。

### 功能
- 图书 CRUD
- 按作者/分类查询

### 联系
- 邮箱：lib@company.com
""",
    version="1.0.0",
    openapi_tags=[
        {"name": "图书", "description": "图书相关接口"},
        {"name": "分类", "description": "分类相关接口"},
    ],
)

# 定义 Pydantic 数据模型 Book，继承 BaseModel
class Book(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 title，类型 str，Field 加约束和描述
    title: str = Field(min_length=1, max_length=100, description="书名")
    # 字段 author，类型 str
    author: str = Field(min_length=1, description="作者")
    # 字段 price，类型 float
    price: float = Field(gt=0, description="价格，必须大于 0")

# 装饰器：app.get
@app.get(
    # 路径
    "/books/{book_id}",
    # tags 标签
    tags=["图书"],
    # response_model 响应模型
    response_model=Book,
    # summary 一句话说明
    summary="查询图书详情",
    # responses 响应示例
    responses={
        200: {
            "description": "图书详情",
            "content": {
                "application/json": {
                    "example": {"id": 1, "title": "三体", "author": "刘慈欣", "price": 45.0}
                }
            },
        },
        404: {"description": "图书不存在"},
    },
)
# 定义函数 get_book，参数 book_id 和 detail
def get_book(
    # book_id：路径参数，int，>=1，有描述
    # Path(...) 第一个参数 ... 是 Ellipsis，表示必填（路径参数本来就必填，这里显式声明）
    # description 生成到 OpenAPI 文档的参数说明
    # ge=1 表示 book_id 必须 >= 1（ge 是 greater than or equal 的缩写）
    book_id: int = Path(..., description="图书 ID，正整数", ge=1),
    # detail：查询参数，bool，默认 False
    # Query(False, description=...) 第一个参数 False 是默认值
    # bool 类型查询参数，传 ?detail=true / ?detail=1 都会转成 True
    detail: bool = Query(False, description="是否返回详细信息"),
):
    """
    根据 ID 查询图书。

    - **book_id**：图书唯一标识
    - **detail**：传 true 返回完整信息，false 只返回基本信息

    若图书不存在，返回 404。
    """
    # 返回 {"id": book_id, "title": "三体", "author": "刘慈欣", "price": 45.0}
    return {"id": book_id, "title": "三体", "author": "刘慈欣", "price": 45.0}

# 装饰器：app.post
@app.post(
    # 路径
    "/books",
    # tags 标签
    tags=["图书"],
    # status_code 状态码
    status_code=201,
    # response_model 响应模型
    response_model=Book,
    # summary 说明
    summary="创建新图书",
    # responses 响应示例
    responses={
        201: {
            "description": "创建成功",
            "content": {
                "application/json": {
                    "example": {"id": 2, "title": "活着", "author": "余华", "price": 35.0}
                }
            },
        },
        422: {"description": "参数校验失败"},
    },
)
# 定义函数 create_book，参数 book 是 Book 类型
def create_book(book: Book):
    """
    创建一本新图书。

    - **title**：书名，1-100 字符
    - **author**：作者，非空
    - **price**：价格，大于 0
    """
    # 返回 book
    return book

# 启动：uvicorn main:app --reload
# 打开 /docs 看效果：分组、参数说明、响应示例、Markdown 文档全都有
\`\`\`

打开 \`/docs\`，你会看到：

1. 顶部"图书管理 API"标题 + Markdown 描述。
2. 按"图书""分类"分组（tags）。
3. 每个接口有 summary、参数描述、响应示例。
4. 点开有 Markdown 渲染的详细说明。
5. 可以 Try it out 测试。

一份代码，全套文档自动到位。

## 文档的安全与生产环境处理

文档很方便，但生产环境要注意安全——不想让外部看到接口结构。

### 方式 1：完全关闭文档

\`\`\`python
# 创建 FastAPI 应用实例，所有文档端点设为 None
# 把三个文档端点都设为 None，访问对应 URL 会返回 404
# 这样外部完全看不到接口结构，最安全但内部也无法访问
app = FastAPI(
    docs_url=None,        # 关闭 /docs（Swagger UI 交互文档）
    redoc_url=None,       # 关闭 /redoc（ReDoc 只读文档）
    openapi_url=None,     # 关闭 /openapi.json（原始 OpenAPI 规范文件）
)
# 适用场景：面向公网的生产 API，不需要对外暴露任何文档
\`\`\`

设为 \`None\` 就禁用对应端点。完全关闭最安全，但内部想用也用不了。

### 方式 2：按环境变量控制

\`\`\`python
# 导入 os 模块
import os
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 读取环境变量，判断是否生产环境
# os.getenv("ENV", "dev") 默认 dev
# 定义变量 is_prod，赋值为 os.getenv("ENV") == "prod"
is_prod = os.getenv("ENV") == "prod"

# 创建 FastAPI 应用实例，按环境开关文档
app = FastAPI(
    # 生产关闭 docs，开发开启
    docs_url=None if is_prod else "/docs",
    # 生产关闭 redoc，开发开启
    redoc_url=None if is_prod else "/redoc",
    # 生产关闭 openapi.json
    openapi_url=None if is_prod else "/openapi.json",
)

# 开发环境：ENV=dev uvicorn main:app → 文档可见
# 生产环境：ENV=prod uvicorn main:app → 文档关闭
\`\`\`

### 方式 3：给文档加认证

更精细的做法：文档保留，但加一层认证（Basic Auth），只有内部人员能访问：

\`\`\`python
# 导入 os 模块
import os
# 导入 secrets 模块（安全随机数）
import secrets
# 从 fastapi 包导入 FastAPI, HTTPException, Depends
# Depends 用于依赖注入，HTTPException 用于抛出 HTTP 错误
from fastapi import FastAPI, HTTPException, Depends
# 从 fastapi.security 包导入 HTTPBasic, HTTPBasicCredentials
# HTTPBasic 是 Basic Auth 方案，HTTPBasicCredentials 是解析后的凭据对象
from fastapi.security import HTTPBasic, HTTPBasicCredentials

# 创建 FastAPI 应用实例
app = FastAPI()
# 创建 HTTPBasic 实例
# security 作为依赖被注入时，会自动解析请求头的 Authorization 字段
security = HTTPBasic()

# 定义依赖函数 verify_docs，参数 credentials
# Depends(security) 表示：调用此函数前，先执行 security 依赖，把结果赋给 credentials
# FastAPI 看到 Depends 就知道这是个依赖，会自动解析并注入
def verify_docs(credentials: HTTPBasicCredentials = Depends(security)):
    # 校验用户名密码
    # 用 secrets.compare_digest 防止时序攻击
    # 时序攻击：普通 == 比较会在第一个不匹配字符就返回，攻击者通过响应时间猜测密码
    # compare_digest 无论是否匹配都比较完所有字符，时间恒定
    # 定义变量 correct_user，赋值为 secrets.compare_digest(...)
    correct_user = secrets.compare_digest(credentials.username, "admin")
    # 定义变量 correct_pass，赋值为 secrets.compare_digest(...)
    # 密码从环境变量 DOCS_PASS 读取，不写死在代码里
    correct_pass = secrets.compare_digest(credentials.password, os.getenv("DOCS_PASS", ""))
    # 如果不正确
    if not (correct_user and correct_pass):
        # 抛出 401
        # headers={"WWW-Authenticate": "Basic"} 让浏览器弹出登录框
        raise HTTPException(status_code=401, headers={"WWW-Authenticate": "Basic"})
    # 校验通过
    return True

# 用中间件或依赖保护 /docs（简化示例，实际用中间件更合适）
# 这里只是示意，实际生产用 nginx 配置 auth_basic 更简单
\`\`\`

实际生产更常见的做法：用 Nginx 在反向代理层加 Basic Auth 保护 \`/docs\`、\`/redoc\`，比在应用层做更简单高效：

\`\`\`nginx
# nginx.conf 片段
location /docs {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://127.0.0.1:8000;
}
\`\`\`

### 方式 4：自定义文档 URL

不想被人猜到 \`/docs\`，可以改路径：

\`\`\`python
# 创建 FastAPI 应用实例，改文档路径
# 把文档 URL 改成难猜的字符串，减少被扫描到的概率
app = FastAPI(
    # docs_url 改成带随机后缀的路径，避免被 /docs 直接扫到
    docs_url="/internal-docs-abc123",  # 难猜的路径
    # redoc_url 设为 None 完全关闭 ReDoc，减少暴露面
    redoc_url=None,
    # openapi.json 也改成难猜的路径，防止接口结构被直接抓取
    openapi_url="/internal-openapi-abc123.json",
)

# 安全提示：
# - 改路径不是真正的安全（security through obscurity）
# - 攻击者仍可能通过日志、前端代码、抓包拿到路径
# - 生产环境建议组合：改路径 + Nginx 认证 + IP 白名单
\`\`\`

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
- **API 网关**：Kong、AWS API Gateway 能导入 OpenAPI 自动配置路由。

## Demo：环境感知的文档配置

把生产安全整合起来，写一个完整的环境感知文档配置：

\`\`\`python
# main.py
# 导入 os 模块
import os
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 读取环境
# 定义变量 env，赋值为 os.getenv("ENV", "dev")
env = os.getenv("ENV", "dev")
# 定义变量 is_prod，赋值为 env == "prod"
is_prod = env == "prod"

# 创建 FastAPI 应用实例，按环境配置文档
app = FastAPI(
    title="我的 API",
    version="1.0.0",
    # 生产关闭文档，开发开启
    docs_url=None if is_prod else "/docs",
    redoc_url=None if is_prod else "/redoc",
    openapi_url=None if is_prod else "/openapi.json",
    # 生产不暴露详细信息
    description="生产环境" if is_prod else "开发环境，详细描述...",
)

# 健康检查接口
# 定义 GET 路由：访问 / 时触发
@app.get("/", tags=["健康检查"])
# 定义函数 health，无参数
def health():
    # 返回 {"status": "ok", "env": env}
    return {"status": "ok", "env": env}

# 启动：
# 开发：ENV=dev uvicorn main:app --reload  → /docs 可访问
# 生产：ENV=prod uvicorn main:app          → /docs 404
\`\`\`

## 常见问题与避坑

### 问题 1：文档里接口顺序乱

接口默认按定义顺序显示。想控制顺序，用 \`openapi_tags\` 定义 tags 顺序，接口按 tags 分组：

\`\`\`python
# 定义 tags 顺序
# openapi_tags 参数接收一个列表，列表里每个元素是一个字典
# 字典的 "name" 字段是标签名（要和路由装饰器里 tags 参数对应）
# 字典的 "description" 字段是标签描述，会显示在文档分组标题下方
# 列表中元素的顺序，就是文档里分组的显示顺序
app = FastAPI(
    openapi_tags=[
        # 第一个 tag 会显示在文档最上面
        {"name": "用户", "description": "用户相关"},
        # 第二个 tag 显示在中间
        {"name": "订单", "description": "订单相关"},
        # 第三个 tag 显示在最下面
        {"name": "商品", "description": "商品相关"},
    ],
)
# 文档里按 用户 → 订单 → 商品 顺序显示
# 如果路由里用了未在 openapi_tags 声明的 tag，会追加到末尾显示
\`\`\`

### 问题 2：response_model 和返回值对不上

\`response_model\` 声明的字段，返回值里没有，文档会显示但实际返回没有。反过来，返回值有的字段 response_model 没有，会被过滤掉。两者要一致。

### 问题 3：422 错误没在文档显示

默认 422（校验失败）会自动出现。如果用了 \`responses\` 参数，要自己加 422，否则会被覆盖。

### 问题 4：文档加载慢

接口特别多时，\`/openapi.json\` 会很大。可以分版本（v1/v2 路由分开），或用 \`include_in_schema=False\` 隐藏内部接口：

\`\`\`python
# 定义 GET 路由：访问 /internal 时触发
# include_in_schema=False 表示此接口不出现在 OpenAPI 文档里
# 但接口本身仍然可以正常访问，只是 /docs 里看不到
@app.get("/internal", include_in_schema=False)
# 定义函数 internal，无参数
def internal():
    # 这个接口不会出现在文档里
    # 适合内部监控、健康检查、调试接口等不需要对外暴露的端点
    # 返回 {"msg": "internal"}
    return {"msg": "internal"}
\`\`\`

### 问题 5：生产环境忘了关文档

这是常见的安全隐患。\`/docs\` 暴露接口结构，攻击者能据此构造攻击。务必在生产环境关闭，或加认证。

---

## 本章小结

| 要点 | 说明 |
|------|------|
| OpenAPI | API 描述标准（JSON/YAML），前身 Swagger |
| 自动生成原理 | FastAPI 从类型注解推断，文档=代码副产品 |
| /docs | Swagger UI，交互式可测试 |
| /redoc | ReDoc，只读美观，适合发布 |
| /openapi.json | 原始 OpenAPI 规范文件 |
| 应用级定制 | title/description/version/license/contact/docs_url |
| 路由级定制 | tags/summary/description/responses/deprecated |
| docstring | 自动作为接口详细说明（支持 Markdown） |
| examples | 单个示例；examples 多个命名示例 |
| deprecated | 标记弃用，文档显示删除线 |
| include_in_schema | False 隐藏接口不出现在文档 |
| 生产关闭 | docs_url=None / redoc_url=None / openapi_url=None |
| 生产认证 | Nginx Basic Auth / IP 白名单 / 改路径 |
| 价值 | 前后端协作成本降、文档不过期、工具链打通 |

到这里 FastAPI 入门部分讲完了。你已经知道 FastAPI 是什么、怎么装、怎么跑、为什么异步、文档怎么来。下一批章节我们深入路由参数——路径参数、查询参数、校验，这是写接口最日常的部分。`
  }
];
