// =============================================================
// FastAPI 现代开发全书 - 第 1 批章节
// -------------------------------------------------------------
// 分组：开篇导读
// 本批包含 4 章：
//   fp-intro:             FastAPI 全景认知：它解决了什么问题
//   fp-install:           环境搭建与第一个应用
//   fp-asgi:              ASGI vs WSGI：理解异步 Web 的基石
//   fp-project-structure: 项目结构与开发工具链
// =============================================================

export const chapters = [
  {
    id: "fp-intro",
    group: "开篇导读",
    icon: "🌍",
    title: "FastAPI 全景认知：它解决了什么问题",
    content: `# FastAPI 全景认知：它解决了什么问题

在正式动手写代码之前，我们必须先从"上帝视角"看清 FastAPI 究竟是什么、它从哪里来、它要到哪里去。很多初学者会犯一个共同的错误：把 FastAPI 仅仅当成"另一个写接口的工具"，照着官方文档抄几个 Hello World，然后匆匆投入业务开发。这种做法会让你错失 FastAPI 真正的设计哲学——**类型注解驱动开发**。本章的目标，就是帮你建立一个完整、清晰、不浮于表面的 FastAPI 认知框架。

## 一、FastAPI 到底是什么

FastAPI 是一个现代、快速（高性能）的 Python Web 框架，由 Sebastián Ramírez（GitHub 用户 tiangolo）于 2018 年底创建并开源。它基于 Python 的标准类型注解（type hints）来构建 Web API，具备以下核心特征：

1. **快**：性能上与 NodeJS、Go 处于同一梯队，远超传统 Python 框架。
2. **快**：开发速度快，类型注解自动完成数据校验、序列化、文档生成。
3. **少**：代码重复少，几乎不需要手写校验逻辑和转换逻辑。
4. **标准**：完全兼容 OpenAPI（原 Swagger）和 JSON Schema 标准。
5. **现代**：原生支持 async/await 异步编程。

注意，"快"在这里出现了两次，它们指的是两件不同的事：第一是**运行时性能快**，第二是**开发效率快**。FastAPI 的成功之处在于它同时把这两件事都做好了，而不是在两者之间做妥协。

## 二、FastAPI 不是什么

要准确理解一个工具，弄清楚它"不是什么"同样重要：

- **FastAPI 不是 Django**：Django 是"全家桶"框架，自带 ORM、Admin、模板引擎、Session、缓存等一切；FastAPI 只关注 Web 层（路由、请求、响应），数据库、模板、认证都需要你自己组合。
- **FastAPI 不是 Flask**：Flask 是一个"微框架"，灵活但缺少类型约束和自动文档；FastAPI 借鉴了 Flask 的路由风格，但内核完全不同（基于 ASGI、强类型）。
- **FastAPI 不是 ORM**：它不负责数据库操作，需要搭配 SQLAlchemy、Tortoise ORM 等使用。
- **FastAPI 不是全能框架**：它专注 API 后端，不适合做服务端渲染（SSR）的网页应用。

一句话总结：**FastAPI 是一个"瘦而强"的 API 框架**——它本身很薄，但通过类型注解把数据校验、文档、序列化这三件最繁琐的事自动化了。

## 三、与主流框架的横向对比

下面这张对比表可以帮助你直观理解 FastAPI 在生态中的位置。

\`\`\`text
+------------+----------+------------+----------+----------+-----------+
| 框架       | 异步支持 | 类型注解   | 自动文档 | 内置 ORM | 定位       |
+------------+----------+------------+----------+----------+-----------+
| Flask      | 弱       | 不强制     | 无       | 无       | 微框架     |
| Django     | 部分     | 不强制     | Admin    | 有       | 全家桶     |
| Express    | 强       | TS 可选    | 无       | 无       | Node 框架  |
| FastAPI    | 原生     | 强制       | 有       | 无       | API 框架   |
+------------+----------+------------+----------+----------+-----------+
\`\`\`

可以看到，FastAPI 的"独特配方"是：**原生异步 + 强制类型注解 + 自动文档**。这三者组合在一起，构成了它区别于所有其他框架的核心竞争力。

## 四、类型注解驱动开发的理念

这是 FastAPI 最核心的设计哲学，值得反复强调。

传统框架的开发流程通常是：定义路由 → 手动取参 → 手动校验 → 手动转换类型 → 手动序列化响应 → 手动写文档。每一步都需要写代码，每一步都可能出 bug。

FastAPI 的开发流程则是：**只写类型注解，剩下的事框架全包了**。你声明了参数的类型，FastAPI 就会自动完成：参数解析、类型转换、数据校验、错误处理、文档生成、IDE 提示。这就是"类型即文档、类型即校验、类型即接口"的威力。

来看一个对比例子。

### Demo 1: Flask 风格的手动校验

\`\`\`python
# 传统 Flask 风格：每一件事都要手写
from flask import Flask, request, jsonify, abort

app = Flask(__name__)

@app.route("/items/<item_id>")
def get_item(item_id):
    # 第 1 步：手动把字符串转 int，失败要自己处理
    try:
        item_id = int(item_id)
    except ValueError:
        # 第 2 步：手动返回 422 错误
        abort(422, description="item_id 必须是整数")

    # 第 3 步：手动从 query string 取参数
    name = request.args.get("name")
    if not name:
        # 第 4 步：手动校验必填
        abort(400, description="name 是必填项")
    if len(name) > 50:
        # 第 5 步：手动校验长度
        abort(400, description="name 长度不能超过 50")

    # 第 6 步：手动组装响应
    return jsonify({"item_id": item_id, "name": name})

# 问题：6 步全是模板代码，没有任何复用，文档还要另外写
\`\`\`

### Demo 2: FastAPI 的类型注解写法

\`\`\`python
# FastAPI 风格：声明类型，框架自动完成所有事
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: int, name: str = Query(..., max_length=50)):
    # item_id: int   -> 自动解析、自动校验整数、失败自动 422
    # name: str = Query(..., max_length=50)
    #   -> ... 表示必填，max_length=50 表示最长 50
    #   -> 校验失败自动返回清晰的错误信息
    # 响应也自动序列化为 JSON
    return {"item_id": item_id, "name": name}

# 这就是"类型即校验、类型即文档"——5 行代码替代了上面 20+ 行
\`\`\`

### Demo 3: 自动生成的文档是"实时同步"的

\`\`\`python
# 同样是上面这段代码，启动后访问：
#   http://127.0.0.1:8000/docs      -> Swagger UI 交互式文档
#   http://127.0.0.1:8000/redoc     -> ReDoc 文档（更美观）
#   http://127.0.0.1:8000/openapi.json  -> 原始 OpenAPI 规范
#
# 文档内容直接来自你的类型注解，永远和代码同步，不会"文档过时"
\`\`\`

## 五、技术栈：Starlette + Pydantic

FastAPI 之所以能既快又优雅，是因为它站在两个优秀库的肩膀上。理解这两个底层组件，是理解 FastAPI 的关键。

### 1. Starlette：异步 Web 服务工具包

Starlette 是一个轻量级的 ASGI 框架/工具包，提供了路由、中间件、WebSocket、静态文件、CORS 等基础能力。FastAPI 的应用对象 \`FastAPI()\` 本质上就是一个 Starlette 子类。所有与 HTTP 协议、异步 IO、中间件链相关的能力，都来自 Starlette。

### 2. Pydantic：数据校验与建模库

Pydantic 是一个基于类型注解的数据校验库。它让你用类的方式声明数据结构（称为"模型"），并在运行时自动校验输入数据是否符合模型定义。FastAPI 用 Pydantic 来处理请求体、响应模型、查询参数校验等所有"数据形状"问题。

\`\`\`python
# Demo 4: Pydantic 模型初体验
from pydantic import BaseModel

# 定义一个用户模型：声明字段 + 类型
class User(BaseModel):
    id: int            # id 必须是整数
    name: str          # name 必须是字符串
    age: int | None = None  # age 可选，默认 None（Python 3.10+ 联合类型语法）

# 传入字典构造模型，Pydantic 会自动校验和转换
u = User(id="42", name="Alice", age=30)
# 注意 id 传的是字符串 "42"，但 Pydantic 会自动转成 int 42
print(u.id)    # 42（int 类型）
print(u.name)  # Alice
print(u.age)   # 30

# 传入非法数据会抛出 ValidationError，错误信息极其详细
# User(id="abc", name="Bob")  -> 报错：id 不是合法整数
\`\`\`

### 3. FastAPI = Starlette + Pydantic + 类型注解胶水

FastAPI 的工作可以概括为：用类型注解作为"胶水"，把 Starlette 的 HTTP 处理能力和 Pydantic 的数据校验能力粘合在一起。当你写下 \`item_id: int\` 这个注解时，FastAPI 在背后做的事是：

- 识别出 \`item_id\` 是路径参数（因为路径中有 \`{item_id}\`）
- 调用 Pydantic 把字符串转成 int 并校验
- 把校验后的值传给你的函数
- 函数返回值再用 Pydantic 序列化成 JSON 响应

## 六、适用场景与不适用场景

### 适合 FastAPI 的场景

1. **RESTful API 后端**：这是 FastAPI 的主战场，效率极高。
2. **微服务**：轻量、快、易部署，天然适合拆分服务。
3. **机器学习模型部署**：Python 生态 + 异步 IO，部署推理服务很顺手。
4. **实时通信**：WebSocket、SSE 等长连接场景。
5. **数据中台/BFF**：高并发、强类型契约。
6. **内部工具与后台 API**：自动文档让前后端协作成本极低。

### 不太适合的场景

1. **服务端渲染的传统网站**：FastAPI 不擅长 HTML 模板渲染，需要 SSR 的话用 Django 更省心。
2. **CMS 内容管理系统**：Django 自带 Admin 和 ORM，这类场景更合适。
3. **需要"零代码"快速搭后台**：FastAPI 仍需写代码，比不上 Django Admin 开箱即用。
4. **对生态成熟度要求极高的传统企业项目**：Django 生态更庞大。

## 七、Demo 5: 一个完整的"微型"FastAPI 应用

下面这个例子把前面讲的所有理念串起来，包含了路径参数、查询参数、请求体模型、自动文档。这是你理解 FastAPI 全貌的"最小完整单元"。

\`\`\`python
# app.py —— 一个微型但完整的 FastAPI 应用
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

app = FastAPI(title="入门示例", version="1.0.0")

# 1. 定义请求体模型（Pydantic）
#    类型注解声明了字段形状，FastAPI 据此自动校验
class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="商品名")
    price: float = Field(..., gt=0, description="价格，必须大于 0")
    tags: list[str] = Field(default_factory=list, description="标签列表")

# 2. 内存存储，演示用（真实项目用数据库）
fake_db: dict[int, ItemCreate] = {}
next_id = 1

# 3. 根路由：最简单的 GET
@app.get("/")
def root():
    # 返回字典，FastAPI 自动转 JSON
    return {"status": "ok", "service": "demo"}

# 4. 创建商品：POST + 请求体
@app.post("/items")
def create_item(item: ItemCreate):
    # item 已经被 Pydantic 校验过，可以直接信任
    global next_id
    fake_db[next_id] = item
    result = {"id": next_id, **item.model_dump()}
    next_id += 1
    return result

# 5. 查询商品列表：GET + 路径参数 + 查询参数 + 校验
@app.get("/items/{item_id}")
def get_item(item_id: int, q: str | None = Query(default=None, max_length=20)):
    # item_id: int     -> 路径参数，自动转 int
    # q: str | None    -> 查询参数，可选，最长 20
    if item_id not in fake_db:
        return {"error": "not found"}
    item = fake_db[item_id]
    response = {"id": item_id, "item": item}
    if q:
        response["q"] = q
    return response

# 启动：uvicorn app:app --reload
# 然后访问 http://127.0.0.1:8000/docs 看自动文档
\`\`\`

## 八、本章小结

- FastAPI 是一个**瘦而强**的 API 框架，专注于 Web 层，不做"全家桶"。
- 它的核心竞争力是**类型注解驱动**：声明类型，框架自动完成校验、文档、序列化。
- 它建立在 **Starlette（异步 HTTP）+ Pydantic（数据校验）** 之上。
- 它适合 API 后端、微服务、ML 部署，不适合 SSR 网页和 CMS。
- 理解 FastAPI 的关键是抓住"类型即契约"这一设计哲学。

下一章我们会动手搭建开发环境，并跑通第一个真实可运行的 FastAPI 应用，把这里的理念落到代码上。
`
  },

  {
    id: "fp-install",
    group: "开篇导读",
    icon: "⚙️",
    title: "环境搭建与第一个应用",
    content: `# 环境搭建与第一个应用

理论讲得再多，不如亲手把环境搭起来、把第一个应用跑起来。本章会带你从零开始：选择 Python 版本 → 创建虚拟环境 → 安装 FastAPI → 编写 Hello World → 启动服务 → 访问自动文档。每一步都会讲清楚"为什么这么做"，而不是机械地敲命令。

## 一、Python 版本的选择

FastAPI 对 Python 版本有一定要求，但非常宽松。官方推荐 **Python 3.8 及以上**，本书强烈建议使用 **Python 3.11 或 3.12**，理由如下：

1. **性能**：从 3.11 起，CPython 引入了"专项优化（specializing adaptive interpreter）"，纯 Python 代码平均提速 10%~60%。
2. **语法特性**：3.10+ 支持联合类型语法 \`X | Y\`，3.11+ 增加了 \`ExceptionGroup\`，3.12 增强了类型系统，这些都能让 FastAPI 代码更优雅。
3. **生态兼容**：FastAPI、Pydantic v2、Starlette 的新特性往往只在新版本上发挥最佳效果。

### Demo 1: 检查并安装 Python 版本

\`\`\`bash
# 查看当前 Python 版本
python3 --version
# 输出示例：Python 3.12.2

# 如果版本过低，用 pyenv 安装指定版本（推荐方式）
# 安装 pyenv（macOS）：brew install pyenv
# 然后安装 Python 3.12
pyenv install 3.12.2

# 在项目目录下固定版本
cd /your/project
pyenv local 3.12.2
# 这会生成一个 .python-version 文件，记录本地使用的版本
\`\`\`

## 二、虚拟环境：为什么必须用，怎么用

Python 的全局环境就像一个公共工作台，所有人共用一套依赖。一旦你在全局装了 \`requests==2.28\`，另一个项目要 \`requests==2.31\`，就互相打架。虚拟环境（venv）就是给每个项目一个独立的工作台，互不干扰。

### Demo 2: 创建并激活虚拟环境

\`\`\`bash
# 在项目根目录创建虚拟环境（名为 .venv，约定俗成）
python3 -m venv .venv

# 激活虚拟环境（macOS / Linux）
source .venv/bin/activate
# 激活后命令行提示符前会出现 (.venv) 标记

# 激活虚拟环境（Windows PowerShell）
# .venv\\Scripts\\Activate.ps1

# 激活虚拟环境（Windows CMD）
# .venv\\Scripts\\activate.bat

# 验证：which python 应指向 .venv 内部
which python
# 输出示例：/your/project/.venv/bin/python

# 退出虚拟环境
deactivate
\`\`\`

**强烈建议**：把 \`.venv/\` 加入 \`.gitignore\`，永远不要把虚拟环境提交到版本库。

## 三、安装 FastAPI

### Demo 3: 安装 fastapi[standard]

\`\`\`bash
# 确保已激活虚拟环境
source .venv/bin/activate

# pip 升级（首次激活建议先升级 pip）
pip install --upgrade pip

# 安装 FastAPI 的"标准套件"
# [standard] 是一个 extras，会一并安装：
#   - uvicorn[standard]：ASGI 服务器，带 C 加速（httptools、uvloop）
#   - httpx：用于测试的 HTTP 客户端
#   - jinja2：模板引擎（可选功能）
#   - python-multipart：表单/文件上传支持
#   - email-validator：邮箱字段校验
#   - pydantic-settings：基于 Pydantic 的配置管理
pip install "fastapi[standard]"

# 验证安装
python -c "import fastapi; print(fastapi.__version__)"
# 输出示例：0.111.0
\`\`\`

为什么要用 \`[standard]\` 这个 extras？因为裸装 \`pip install fastapi\` 只会装框架本体，不会装 uvicorn 等运行时依赖。新手最常踩的坑就是：装了 fastapi，但启动时 \`uvicorn: command not found\`。用 \`[standard]\` 一次装齐，省心。

## 四、第一个 Hello World

### Demo 4: 最简 Hello World

\`\`\`python
# main.py
# 导入 FastAPI 主类，它是整个框架的入口
from fastapi import FastAPI

# 创建应用实例
# 这个 app 对象是 ASGI 应用，所有路由都注册到它上面
# 参数 title/version 等会出现在自动文档页面
app = FastAPI(
    title="我的第一个 FastAPI",
    description="从零开始的入门示例",
    version="0.1.0",
)

# 定义根路由：当 GET / 被请求时，执行下面的函数
# @app.get 是装饰器，"/" 是路径
@app.get("/")
def hello():
    # 返回一个字典
    # FastAPI 自动把它序列化为 JSON 响应
    # Content-Type 自动设为 application/json
    return {"message": "Hello, FastAPI!"}

# 至此，一个可运行的 API 就写完了
# 启动命令在下一节讲解
\`\`\`

### Demo 5: 启动应用

\`\`\`bash
# 命令格式：uvicorn <模块>:<变量名> [选项]
# main:app 表示 main.py 文件里的 app 变量
uvicorn main:app --reload

# --reload 是开发模式热重载（详见后文）
# 启动成功后会看到类似输出：
#   INFO:     Will watch for changes in these directories: ['/your/project']
#   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
#   INFO:     Started reloader process [12345] using WatchFiles
#   INFO:     Started server process [12346]
#   INFO:     Waiting for application startup.
#   INFO:     Application startup complete.

# 测试访问（新开一个终端）
curl http://127.0.0.1:8000/
# 输出：{"message":"Hello, FastAPI!"}
\`\`\`

## 五、uvicorn 启动参数详解

uvicorn 是一个 ASGI 服务器，负责接收 HTTP 请求、调用你的 FastAPI 应用、返回响应。理解它的参数对排查问题很重要。

### Demo 6: 常用启动参数

\`\`\`bash
# 监听地址和端口
# --host 0.0.0.0 表示监听所有网卡（局域网可访问）
# --port 9000 自定义端口（默认 8000）
uvicorn main:app --host 0.0.0.0 --port 9000

# 开发模式：热重载
uvicorn main:app --reload

# 生产模式：多 worker（结合 gunicorn，详见 ASGI 章节）
# 通常写成 gunicorn 启动 uvicorn worker
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 指定日志级别（debug/info/warning/error/critical）
uvicorn main:app --log-level debug

# 禁用访问日志（生产环境减少日志量）
uvicorn main:app --access-log false

# 启用 HTTPS（开发用自签证书）
uvicorn main:app --ssl-keyfile key.pem --ssl-certfile cert.pem

# 帮助文档：查看所有参数
uvicorn --help
\`\`\`

各参数含义速查：

| 参数 | 作用 | 常用值 |
|------|------|--------|
| --host | 监听地址 | 127.0.0.1 / 0.0.0.0 |
| --port | 监听端口 | 8000 |
| --reload | 热重载（开发用） | 无值 |
| --workers | worker 进程数 | 1/2/4 |
| --log-level | 日志级别 | info/debug |
| --ssl-keyfile/certfile | HTTPS 证书 | 文件路径 |

## 六、--reload 热重载的原理

\`\`\`bash
# 当你加上 --reload 时，uvicorn 会做这些事：
# 1. 启动一个"主进程"（reloader），负责监视文件变化
# 2. 主进程 fork 出一个"子进程"运行真正的 ASGI 应用
# 3. 当 .py 文件被修改保存，主进程检测到变化，杀掉旧子进程
# 4. 主进程重新 fork 一个新子进程，加载最新代码
#
# 所以你会看到两个进程：
#   - Started reloader process [PID 12345]   <- 主进程（监听文件）
#   - Started server process [PID 12346]     <- 子进程（处理请求）
\`\`\`

**注意**：\`--reload\` 仅供开发使用，生产环境**绝对不能**开。原因有二：1) 监视文件本身有开销；2) 主子进程模型在多 worker 下会变得复杂且不稳定。

## 七、访问自动文档

FastAPI 最让人惊艳的功能之一，就是**自动生成交互式 API 文档**。你不用写一行额外代码，启动应用后直接访问：

### Demo 7: 三种文档端点

\`\`\`bash
# 1. Swagger UI —— 交互式文档，可直接在浏览器里"试调用"
#    地址：http://127.0.0.1:8000/docs
#    特点：可以填参数、点按钮发请求、看响应
#    适合：开发联调、前端同事试用接口

# 2. ReDoc —— 阅读型文档，排版更美观
#    地址：http://127.0.0.1:8000/redoc
#    特点：更适合阅读和分享，但不支持在线试调用
#    适合：对外发布 API 文档

# 3. OpenAPI JSON —— 原始规范
#    地址：http://127.0.0.1:8000/openapi.json
#    特点：返回一个 JSON，符合 OpenAPI 3.x 规范
#    适合：用代码生成器生成客户端 SDK
\`\`\`

### 自定义文档路径或禁用

\`\`\`python
# main.py
from fastapi import FastAPI

# 通过参数自定义文档路径，或直接禁用
app = FastAPI(
    title="My API",
    docs_url="/my-docs",          # 自定义 Swagger 路径
    redoc_url=None,                # 禁用 ReDoc（设为 None）
    openapi_url="/spec/openapi.json",  # 自定义 OpenAPI 路径
)

# 生产环境如果不想暴露文档，可以：
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
# 这样三个端点都不可访问，安全性更好
\`\`\`

## 八、完整最小项目结构

到本章结束，你的项目目录应该长这样：

\`\`\`text
my-fastapi-project/
├── .venv/                 # 虚拟环境（不提交 git）
├── .gitignore             # 忽略 .venv/ 等
├── main.py                # 应用入口
└── requirements.txt       # 依赖清单（下一章细讲）
\`\`\`

### .gitignore 推荐内容

\`\`\`text
# Python
__pycache__/
*.pyc
.venv/
.env

# IDE
.vscode/
.idea/

# 系统
.DS_Store
\`\`\`

## 九、常见问题与排错

1. **\`uvicorn: command not found\`**：你没装 \`fastapi[standard]\` 或没激活虚拟环境。
2. **端口被占用**：换端口 \`--port 8001\`，或杀掉占用进程。
3. **修改代码没生效**：确认启动时带了 \`--reload\`；某些大改动可能需要手动重启。
4. **浏览器访问 /docs 是 404**：你在创建 \`FastAPI()\` 时把 \`docs_url\` 设为了 None。

## 十、本章小结

- 用 \`python3 -m venv .venv\` 创建虚拟环境，永远在虚拟环境里装依赖。
- 安装用 \`pip install "fastapi[standard]"\`，一次装齐框架 + 服务器 + 工具。
- 写 \`app = FastAPI()\` + \`@app.get(...)\` + 返回字典，就是一个完整 API。
- 用 \`uvicorn main:app --reload\` 启动开发服务，理解主子进程的热重载机制。
- 访问 \`/docs\` 看自动文档，这是 FastAPI 的招牌功能。

下一章我们会深入 ASGI 与 WSGI 的区别——这是理解 FastAPI 异步能力的底层基石，也是面试常考题。
`
  },

  {
    id: "fp-asgi",
    group: "开篇导读",
    icon: "⚡",
    title: "ASGI vs WSGI：理解异步 Web 的基石",
    content: `# ASGI vs WSGI：理解异步 Web 的基石

很多初学者写了几个月 FastAPI，依然说不清 ASGI 和 WSGI 的区别，只知道"FastAPI 是异步的，Flask 是同步的"。这种模糊认知会让你在面对性能问题、并发问题、长连接问题时一头雾水。本章会从协议层面讲透 WSGI 与 ASGI 的本质区别，用一个"餐厅服务员"的比喻帮你建立直觉，并解释清楚 uvicorn、gunicorn、daphne 这几个工具的关系。

## 一、WSGI 是什么：同步 Web 的协议

WSGI（Web Server Gateway Interface）是 Python 在 2003 年（PEP 333）提出的 Web 服务器与应用框架之间的标准接口。它的核心特征是**同步阻塞**：一个请求到来，服务器调用应用函数，函数返回响应，整个过程中这个工作线程被"占住"，直到响应完成。

### WSGI 的接口形态

\`\`\`python
# Demo 1: 一个最朴素的 WSGI 应用
def wsgi_app(environ, start_response):
    # environ 是一个 dict，包含所有请求信息
    #   environ["REQUEST_METHOD"] -> "GET"
    #   environ["PATH_INFO"]      -> "/items/42"
    #   environ["QUERY_STRING"]   -> "q=hello"
    # start_response 是一个回调，用来发送状态码和响应头
    status = "200 OK"
    headers = [("Content-Type", "text/plain")]
    start_response(status, headers)

    # 返回值是字节流的可迭代对象（这里返回单元素列表）
    return [b"Hello, WSGI!"]

# 运行方式（用内置 wsgiref 演示，仅用于教学）
# from wsgiref.simple_server import make_server
# server = make_server("", 8000, wsgi_app)
# server.serve_forever()
\`\`\`

注意几个关键点：
- 接口是**普通函数**，没有 \`async\`。
- 处理过程中，线程被独占——如果函数里调用了 \`time.sleep(5)\`，这个线程就阻塞 5 秒。
- WSGI 服务器（如 gunicorn、uWSGI）通常用"多进程 + 多线程"模型来处理并发。

## 二、WSGI 的局限：为什么需要 ASGI

WSGI 设计于 2003 年，那时 Web 应用主要是"请求-响应"模式。但现代 Web 出现了新需求：

1. **长连接 / WebSocket**：客户端连上后保持连接，服务器可主动推送消息。WSGI 的"一次请求一次响应"模型无法表达。
2. **HTTP/2、SSE**：多个流复用一个连接，WSGI 没有概念。
3. **高并发 IO 密集型场景**：调用外部 API、查数据库时，线程阻塞 = 资源浪费。

asyncio 在 Python 3.4（2014 年）引入后，社区需要一个**异步版本的 WSGI**，于是有了 ASGI。

## 三、ASGI 是什么：异步 Web 的协议

ASGI（Asynchronous Server Gateway Interface）是 WSGI 的异步版本，由 Django Channels 团队在 2017 年提出。它的核心特征是**异步非阻塞**：用 \`async def\` 定义应用，用 \`await\` 等待 IO，单个事件循环可以处理成千上万的并发连接。

### ASGI 的接口形态

\`\`\`python
# Demo 2: 一个最朴素的 ASGI 应用
async def asgi_app(scope, receive, send):
    # scope 是一个 dict，描述本次"连接"的元信息
    #   scope["type"]    -> "http" / "websocket" / "lifespan"
    #   scope["method"]  -> "GET" / "POST" ...
    #   scope["path"]    -> "/items/42"
    #
    # receive 是一个 awaitable，调用它接收客户端发来的事件
    #   event = await receive()
    #   event["type"] 可能是 "http.request" / "websocket.connect" ...
    #
    # send 是一个 awaitable，调用它向客户端发送事件
    #   await send({"type": "http.response.start", "status": 200, ...})
    #   await send({"type": "http.response.body", "body": b"..."})

    # 接收请求体（这里简化处理）
    await receive()

    # 发送响应头
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [(b"content-type", b"text/plain")],
    })

    # 发送响应体
    await send({
        "type": "http.response.body",
        "body": b"Hello, ASGI!",
    })

# 运行方式：uvicorn asgi_app:asgi_app
# 注意：这里把函数本身作为应用对象传入
\`\`\`

ASGI 的几个关键不同：
- 应用是 \`async def\`，可以用 \`await\`。
- 接口不是"一次调用返回响应"，而是**事件驱动**：\`receive\` 拿事件、\`send\` 发事件，可以多次往返（这是 WebSocket 的基础）。
- \`scope["type"]\` 区分了 \`http\`、\`websocket\`、\`lifespan\` 三种协议——ASGI 天然支持 WebSocket，WSGI 不行。

## 四、餐厅服务员比喻：直观理解两者区别

把 Web 服务器想象成一家餐厅，每个请求是一位客人，工作线程/协程是服务员。

### WSGI 餐厅（同步）

\`\`\`text
1. 客人进门点餐（请求到达）
2. 服务员 A 接待，记下菜单
3. 服务员 A 走到后厨，等菜做好（阻塞）
   -> 在这期间，服务员 A 不能接待其他客人
4. 菜好了，服务员 A 端菜给客人
5. 客人吃完离开，服务员 A 重新回到门口
\`\`\`

要让餐厅同时接待 100 位客人，就必须雇 100 个服务员（100 个线程）。线程是很贵的资源——每个线程默认占用几 MB 内存，且线程切换有内核开销。

### ASGI 餐厅（异步）

\`\`\`text
1. 客人进门点餐（请求到达）
2. 服务员 A 接待，记下菜单，递给后厨
3. 服务员 A 不等菜，立刻回到门口接待下一位客人（await 让出执行权）
4. 后厨菜做好了，通过"叫号器"通知（事件循环唤醒）
5. 任意空闲服务员去端菜给对应客人
\`\`\`

在 ASGI 餐厅里，**1 个服务员可以同时服务 100 位客人**——只要"等菜"的时间（IO 等待）足够多。这就是为什么异步 IO 在 IO 密集型场景下吞吐量远高于同步多线程。

## 五、uvicorn / gunicorn / daphne 的关系

这三个名字新手最容易混淆。理清它们的关键是分清"协议"和"实现"。

### 三者定位

\`\`\`text
WSGI 服务器实现：gunicorn、uWSGI、waitress
ASGI 服务器实现：uvicorn、daphne、hypercorn
\`\`\`

- **uvicorn**：最流行的 ASGI 服务器，基于 uvloop（libuv 的 Python 绑定），性能极高。FastAPI 官方推荐。
- **daphne**：Django Channels 团队开发的 ASGI 服务器，Django 项目用得多。
- **hypercorn**：另一个 ASGI 服务器，支持 HTTP/2 和 HTTP/3。
- **gunicorn**：老牌 WSGI 服务器，**但可以通过 worker 类加载 uvicorn**，从而运行 ASGI 应用。

### Demo 3: gunicorn + uvicorn worker 的生产部署

\`\`\`bash
# 生产环境推荐：gunicorn 作为进程管理器 + uvicorn worker 处理请求
# gunicorn main:app             <- 应用入口
# -w 4                          <- 4 个 worker 进程（一般 = CPU 核数 * 2 + 1）
# -k uvicorn.workers.UvicornWorker  <- 使用 uvicorn 的 worker 类（让 gunicorn 能跑 ASGI）
# -b 0.0.0.0:8000               <- 监听地址
# --timeout 120                 <- worker 超时时间
gunicorn main:app \\
    -w 4 \\
    -k uvicorn.workers.UvicornWorker \\
    -b 0.0.0.0:8000 \\
    --timeout 120

# 为什么不直接用 uvicorn --workers 4？
# 因为 gunicorn 的进程管理更成熟：
#   - worker 崩溃会自动重启
#   - 优雅重启（reload worker）
#   - 信号处理更完善
# uvicorn 自己的多 worker 模式仍在演进，生产上 gunicorn 更稳
\`\`\`

### Demo 4: 对比同步与异步的处理能力

\`\`\`python
# sync_vs_async.py —— 直观对比同步与异步的吞吐差异
import asyncio
import time
from fastapi import FastAPI

app = FastAPI()

# 同步路由：用 time.sleep 模拟 IO（会阻塞整个线程）
@app.get("/sync")
def sync_route():
    time.sleep(1)   # 阻塞 1 秒
    return {"mode": "sync"}

# 异步路由：用 asyncio.sleep 模拟 IO（让出事件循环）
@app.get("/async")
async def async_route():
    await asyncio.sleep(1)   # 让出 1 秒，期间可处理其他请求
    return {"mode": "async"}

# 压测对比（用 httpx 并发 100 个请求）：
#   curl http://127.0.0.1:8000/sync    x 100 并发 -> 约 100 秒（串行）
#   curl http://127.0.0.1:8000/async   x 100 并发 -> 约 1 秒（并发）
#
# 关键结论：
#   - 在异步框架里，同步阻塞调用（time.sleep、requests.get）会毁掉并发优势
#   - 必须用 await + 异步库（asyncio.sleep、httpx.AsyncClient、asyncpg）
\`\`\`

## 六、为什么 FastAPI 必须运行在 ASGI 上

FastAPI 的应用对象 \`app = FastAPI()\` 本质是一个 ASGI 应用（它继承自 Starlette 的 \`Starlette\` 类，而 Starlette 是 ASGI 应用）。如果你把它放进 WSGI 服务器（如纯 gunicorn sync worker），它会直接报错或行为异常。

### Demo 5: 错误示范与正确示范

\`\`\`python
# 错误：用 WSGI 服务器跑 ASGI 应用
# gunicorn main:app -w 4 -b 0.0.0.0:8000   <- 默认是 sync worker（WSGI）
# 会报错：TypeError: __call__() missing 1 required positional argument: 'send'
# 因为 WSGI 协议签名是 (environ, start_response)，ASGI 是 (scope, receive, send)

# 正确：指定 UvicornWorker
# gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 正确：直接用 uvicorn
# uvicorn main:app --host 0.0.0.0 --port 8000
\`\`\`

## 七、FastAPI 中同步路由 vs 异步路由的取舍

很多人误以为"FastAPI 是异步的，所以所有路由都得用 \`async def\`"。这是个**常见误区**。FastAPI 对同步和异步路由都支持，但选择有讲究：

\`\`\`python
# Demo 6: 同步与异步路由的选择策略
from fastapi import FastAPI
import time
import asyncio
import requests  # 同步 HTTP 客户端
import httpx      # 异步 HTTP 客户端

app = FastAPI()

# 情况 A：纯 CPU 计算（无 IO），用同步 def
@app.get("/cpu")
def cpu_task():
    total = sum(i * i for i in range(10_000_000))
    return {"total": total}
# 同步 def 会被 FastAPI 丢到线程池执行，不阻塞事件循环

# 情况 B：异步 IO，必须用 async def + await
@app.get("/io-async")
async def io_async():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://httpbin.org/delay/1")
    return {"status": r.status_code}
# 正确：用 async + 异步库

# 情况 C：误用！在 async def 里调用同步阻塞函数
@app.get("/bad")
async def bad_task():
    # 致命错误：requests.get 是同步阻塞，但它现在跑在事件循环线程里
    # 期间整个服务器无法处理其他请求
    r = requests.get("https://httpbin.org/delay/1")
    return {"status": r.status_code}
# 解决：要么改成 def（让 FastAPI 丢线程池），要么换成 httpx + await

# 情况 D：同步 IO，用 def（让 FastAPI 自动放到线程池）
@app.get("/io-sync")
def io_sync():
    r = requests.get("https://httpbin.org/delay/1")
    return {"status": r.status_code}
# 这样写没问题，但并发能力不如 async + httpx
\`\`\`

**选择规则总结**：
- 路由里有 \`await\`（用了异步库）→ 必须 \`async def\`。
- 路由里只有同步阻塞调用（\`requests\`、\`time.sleep\`、同步 ORM）→ 用 \`def\`，FastAPI 会自动放线程池。
- 路由里是纯 CPU 计算 → 用 \`def\`。
- 切记：**不要在 \`async def\` 里直接调用同步阻塞函数**，这会卡住事件循环。

## 八、从 WSGI 迁移到 ASGI 的注意事项

如果你从 Flask/Django 迁移过来，要特别留意这些"坑"：

1. **依赖库要换"异步版"**：\`requests\` → \`httpx\`，\`psycopg2\` → \`asyncpg\` / \`psycopg\`，\`redis-py\` 同步版 → 异步版。
2. **全局变量要小心**：多个协程共享同一事件循环，全局可变状态需用锁保护。
3. **背景任务**：用 \`BackgroundTasks\` 或 \`asyncio.create_task\`，不要直接 \`threading.Thread\`。
4. **同步代码兼容**：必要时用 \`asyncio.to_thread\` 把同步函数包成异步。

## 九、本章小结

- **WSGI = 同步协议**，接口是 \`(environ, start_response)\`，靠多线程处理并发。
- **ASGI = 异步协议**，接口是 \`(scope, receive, send)\`，靠事件循环处理并发，原生支持 WebSocket。
- **服务员比喻**：WSGI 一个服务员服务一位客人；ASGI 一个服务员同时服务很多客人。
- **uvicorn 是 ASGI 服务器，gunicorn 是 WSGI 服务器但可加载 uvicorn worker**，生产部署常用 \`gunicorn -k uvicorn.workers.UvicornWorker\`。
- FastAPI 必须跑在 ASGI 服务器上；选择 \`async def\` 还是 \`def\` 取决于你用的是异步库还是同步库。
- 切忌在 \`async def\` 中调用同步阻塞函数，否则会卡住整个事件循环。

理解了 ASGI，你就掌握了 FastAPI 异步能力的"地基"。下一章我们聊聊如何组织一个真实项目的目录结构、依赖管理和工具链配置。
`
  },

  {
    id: "fp-project-structure",
    group: "开篇导读",
    icon: "📁",
    title: "项目结构与开发工具链",
    content: `# 项目结构与开发工具链

当你的项目从"一个 main.py 文件"长大到"十几个模块 + 几十个路由"时，目录组织就成了一个绕不开的问题。良好的项目结构能让代码易读、易维护、易扩展；糟糕的结构会让每一次改动都像在拆炸弹。本章会讨论单文件 vs 多文件、推荐目录结构、依赖管理（requirements.txt 与 pyproject.toml）、环境变量管理、以及 IDE 配置。

## 一、单文件 vs 多文件项目

### 单文件项目

\`\`\`python
# main.py —— 单文件，所有代码挤在一起
from fastapi import FastAPI
app = FastAPI()

@app.get("/users")
def list_users(): ...

@app.post("/users")
def create_user(): ...

@app.get("/orders")
def list_orders(): ...

@app.post("/orders")
def create_order(): ...
\`\`\`

**适用场景**：5 个以内路由的玩具项目、技术验证（PoC）、教学示例。

**优点**：直观，所有东西在一个文件里，跳转方便。

**缺点**：一旦超过 10 个路由，文件变得冗长难读；无法分组测试；多人协作冲突频繁。

### 多文件项目

当项目长大，应该按"职责"拆分模块。下面是推荐的目录结构。

## 二、推荐目录结构

\`\`\`text
my-fastapi-project/
├── app/                        # 应用主包
│   ├── __init__.py             # 让 app 成为可导入的包
│   ├── main.py                 # 应用入口：创建 FastAPI、注册路由
│   ├── core/                   # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py           # 配置项（从环境变量读取）
│   │   └── security.py         # 安全相关（密码哈希、JWT）
│   ├── api/                    # 路由层（按版本/模块分）
│   │   ├── __init__.py
│   │   ├── deps.py             # 依赖项（数据库会话、当前用户）
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py       # 汇总各模块路由
│   │       ├── users.py        # 用户相关路由
│   │       └── orders.py       # 订单相关路由
│   ├── models/                 # 数据库模型（SQLAlchemy 等）
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── order.py
│   ├── schemas/                # Pydantic 模型（请求/响应）
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── order.py
│   ├── services/               # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── order_service.py
│   ├── db/                     # 数据库连接
│   │   ├── __init__.py
│   │   ├── base.py             # Base、engine、SessionLocal
│   │   └── init_db.py          # 初始化数据
│   └── utils/                  # 工具函数
│       ├── __init__.py
│       └── pagination.py
├── tests/                      # 测试
│   ├── __init__.py
│   ├── conftest.py
│   └── test_users.py
├── .env                        # 环境变量（不提交 git）
├── .env.example                # 环境变量模板（提交 git）
├── .gitignore
├── pyproject.toml              # 项目元数据 + 依赖
├── requirements.txt            # 锁定依赖（可选）
└── README.md
\`\`\`

这种分层遵循"关注点分离"原则：路由层只负责接收请求和返回响应，业务逻辑在 \`services/\`，数据形状在 \`schemas/\`，数据持久化在 \`models/\` 和 \`db/\`。

### Demo 1: main.py 入口的写法

\`\`\`python
# app/main.py
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.config import settings

# 创建应用，配置项来自 settings
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
)

# 注册路由：所有 v1 接口都挂在 /api/v1 前缀下
app.include_router(api_router, prefix="/api/v1")

# 健康检查路由
@app.get("/health")
def health_check():
    return {"status": "healthy"}
\`\`\`

### Demo 2: 路由汇总

\`\`\`python
# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import users, orders

# 创建一个聚合路由器
api_router = APIRouter()

# 把各模块的子路由器挂进来
# 每个模块内部也用 APIRouter 组织，prefix 是模块自身的路径前缀
api_router.include_router(users.router, prefix="/users", tags=["用户"])
api_router.include_router(orders.router, prefix="/orders", tags=["订单"])

# 最终 URL 形态：
#   /api/v1/users/...
#   /api/v1/orders/...
\`\`\`

### Demo 3: 单个模块的路由器

\`\`\`python
# app/api/v1/users.py
from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import create_user as svc_create_user
from app.api.deps import get_db

# 每个模块创建自己的路由器
router = APIRouter()

@router.post("/", response_model=UserOut)
def create_user(user_in: UserCreate, db = Depends(get_db)):
    # 路由层只做"接收 + 转发"，业务逻辑放 service
    return svc_create_user(db, user_in)

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db = Depends(get_db)):
    ...
\`\`\`

## 三、依赖管理：requirements.txt vs pyproject.toml

### requirements.txt

这是最传统的方式，一行一个依赖。

\`\`\`text
# requirements.txt
fastapi[standard]>=0.110,<0.112
sqlalchemy>=2.0,<3.0
asyncpg>=0.29
pydantic-settings>=2.0
python-jose[cryptography]>=3.3
passlib[bcrypt]>=1.7.4
\`\`\`

**安装**：\`pip install -r requirements.txt\`

**优点**：简单直接，所有 Python 工具链都支持。

**缺点**：不直接记录开发依赖与生产依赖的区分；不记录项目元数据（名称、版本、入口）。

### pyproject.toml（推荐）

\`pyproject.toml\` 是 PEP 518/621 定义的项目元数据标准，现代工具链（poetry、pdm、hatch、uv）都围绕它构建。

### Demo 4: 一个完整的 pyproject.toml

\`\`\`toml
# pyproject.toml
[project]
name = "my-fastapi-project"
version = "0.1.0"
description = "A modern FastAPI application"
requires-python = ">=3.11"
dependencies = [
    "fastapi[standard]>=0.110,<0.112",
    "sqlalchemy>=2.0,<3.0",
    "asyncpg>=0.29",
    "pydantic-settings>=2.0",
    "python-jose[cryptography]>=3.3",
    "passlib[bcrypt]>=1.7.4",
]

# 可选依赖（开发用），通过 pip install ".[dev]" 安装
[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.23",
    "httpx>=0.27",
    "ruff>=0.4",
    "mypy>=1.10",
]

# ruff 配置（lint + format）
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]

# mypy 配置（类型检查）
[tool.mypy]
python_version = "3.11"
strict = true

# pytest 配置
[tool.pytest.ini_options]
asyncio_mode = "auto"
\`\`\`

**安装**：

\`\`\`bash
# 方式 1：用 pip 安装（包含开发依赖）
pip install ".[dev]"

# 方式 2：用 uv（极快的现代工具）
uv pip install ".[dev]"

# 方式 3：用 poetry
poetry install
\`\`\`

pyproject.toml 的优势在于：**一个文件搞定元数据、依赖、工具配置**，避免了 \`setup.py\` + \`requirements.txt\` + \`setup.cfg\` 的散乱。

## 四、环境变量管理：.env + pydantic-settings

硬编码配置（数据库密码、API Key）是大忌。正确做法是用环境变量 + \`.env\` 文件。

### Demo 5: 用 pydantic-settings 管理配置

\`\`\`python
# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

# BaseSettings 会自动从环境变量读取字段（大小写不敏感）
class Settings(BaseSettings):
    # 项目基础
    PROJECT_NAME: str = "My FastAPI"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    # 数据库
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/db"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # 配置 model_config：从 .env 文件读取
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# 单例：整个应用共用一个 settings 对象
settings = Settings()
\`\`\`

\`\`\`bash
# .env（不提交 git）
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:123456@localhost:5432/myapp
SECRET_KEY=super-secret-key-only-for-dev
ACCESS_TOKEN_EXPIRE_MINUTES=120
\`\`\`

\`\`\`bash
# .env.example（提交 git，作为模板）
DEBUG=true
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=60
\`\`\`

\`\`\`text
# .gitignore 必须包含
.env
\`\`\`

**核心安全原则**：\`.env\` 永远不提交；\`.env.example\` 提供模板；生产环境用真正的环境变量（不要用 .env 文件）。

## 五、IDE 配置：VS Code + Pylance

VS Code 配合 Pylance 扩展是 FastAPI 开发的黄金组合。良好的配置能让类型提示、跳转、自动补全发挥到极致。

### Demo 6: VS Code 工作区配置

\`\`\`json
// .vscode/settings.json
{
    // 指定 Python 解释器为虚拟环境
    "python.defaultInterpreterPath": "\${workspaceFolder}/.venv/bin/python",
    // 启用类型检查（Pylance）
    "python.analysis.typeCheckingMode": "basic",
    // 包含 app 包，让 Pylance 能正确解析 import
    "python.analysis.extraPaths": ["\${workspaceFolder}"],
    // 保存时格式化
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.fixAll.ruff": "explicit",
            "source.organizeImports.ruff": "explicit"
        }
    }
}
\`\`\`

\`\`\`json
// .vscode/launch.json —— 调试配置
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI Debug",
            "type": "debugpy",
            "request": "launch",
            "module": "uvicorn",
            // 关键：把 --reload 关掉，调试器自己管理重启
            "args": ["app.main:app", "--host", "127.0.0.1", "--port", "8000"],
            "jinja": true,
            "justMyCode": true
        }
    ]
}
\`\`\`

这样配置后，按 F5 就能在 VS Code 里启动调试，断点、变量监视、调用栈一应俱全——比 \`print\` 大法高效百倍。

## 六、工具链一览：lint / format / type-check / test

一个成熟的项目应该有以下工具：

\`\`\`text
ruff      -> lint + format（替代 flake8 + isort + black，速度极快）
mypy      -> 静态类型检查
pytest    -> 单元测试
httpx     -> 测试中的 HTTP 客户端
pre-commit-> git 提交前自动跑工具
\`\`\`

### Demo 7: 一个最小测试示例

\`\`\`python
# tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

# TestClient 是 FastAPI 提供的测试客户端
# 它在内存里"启动"应用，不需要真的监听端口
client = TestClient(app)

def test_health_check():
    # 像普通 HTTP 请求一样调用
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

# 运行：pytest tests/test_health.py -v
\`\`\`

\`\`\`yaml
# .pre-commit-config.yaml —— 提交前自动检查
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
\`\`\`

\`\`\`bash
# 安装 pre-commit 钩子
pip install pre-commit
pre-commit install
# 之后每次 git commit 都会自动跑 ruff 和 mypy
\`\`\`

## 七、本批章节总览与下一步

到这里，"开篇导读"分组的 4 章就结束了。我们来回顾一下你已经掌握的东西：

1. **fp-intro**：FastAPI 是什么、不是什么，类型注解驱动开发的理念，Starlette + Pydantic 技术栈。
2. **fp-install**：虚拟环境、依赖安装、Hello World、uvicorn 启动参数、--reload 原理、自动文档。
3. **fp-asgi**：WSGI vs ASGI 的协议差异，餐厅服务员比喻，uvicorn/gunicorn/daphne 关系，async def 与 def 的选择。
4. **fp-project-structure**（本章）：目录结构、依赖管理（pyproject.toml）、环境变量、IDE 配置、工具链。

接下来的"路由与请求"分组，我们会正式开始深入 FastAPI 的核心 API：路径参数、查询参数、请求体、表单与文件上传。这些都是你每天都会用到的东西，掌握好它们是写出健壮 API 的基础。

## 八、本章小结

- 单文件适合玩具项目，真实项目要按 \`app/\` 分层：\`api\` / \`schemas\` / \`models\` / \`services\` / \`db\` / \`core\`。
- 用 \`APIRouter\` 组织路由，按模块拆分，最后在 \`main.py\` 里汇总。
- 优先用 \`pyproject.toml\` 管理依赖和工具配置，它比 \`requirements.txt\` 更现代。
- 配置用 \`pydantic-settings\` 从 \`.env\` 读取，\`.env\` 不提交、\`.env.example\` 提交。
- VS Code + Pylance + ruff + mypy 是高效的开发工具链，配好调试配置事半功倍。
- 用 \`TestClient\` 写测试，\`pre-commit\` 在提交前自动跑检查。
`
  }
];
