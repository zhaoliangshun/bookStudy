// =============================================================
// Python Web 后端开发实战教程（全新版）- 第 5 批章节（FastAPI 核心 8 章）
// -------------------------------------------------------------
// 本批为「重点章节」，篇幅更大，覆盖 FastAPI 框架核心机制：
//   1. fastapi-intro      : FastAPI 简介与第一个应用
//   2. fastapi-routing    : 路由、路径参数与查询参数
//   3. fastapi-pydantic   : Pydantic 模型与请求体验证
//   4. fastapi-response   : 响应模型与自定义响应
//   5. fastapi-di         : 依赖注入系统详解
//   6. fastapi-middleware : 中间件与 CORS
//   7. fastapi-async      : 异步路由与后台任务
//   8. fastapi-errors     : 异常处理与错误响应
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：FastAPI 简介与第一个应用
  // ============================================================
  {
    id: "pyweb2-fastapi-intro",
    group: "FastAPI 核心",
    icon: "⚡",
    title: "FastAPI 简介与第一个应用",
    content: `
## 一句话定义

FastAPI 是一个现代、快速（高性能）的 Python Web 框架，基于标准 Python 类型提示构建 API，使用 ASGI（Asynchronous Server Gateway Interface）异步网关接口，由 Sebastián Ramírez（@tiangolo）于 2018 年创建并开源。

拆开看几个关键词：

- **现代**：诞生于 2018 年，原生支持 Python 3.6+ 的类型提示（type hints）、async/await 异步语法，没有历史包袱。
- **快速**：性能可与 NodeJS、Go 相比肩，是 Python Web 框架里最快的之一（基于 Starlette + Pydantic）。
- **类型提示**：这是 FastAPI 的灵魂。你写的函数参数类型注解，会被框架自动转换为参数校验、序列化、文档生成。
- **ASGI**：异步服务器网关接口，是 WSGI 的异步继任者，支持 WebSocket、HTTP/2、长连接。

> 一句话总结：FastAPI 让你**用写函数签名的方式写 API 契约**，框架替你完成校验、文档、序列化等苦力活。

## 二、为什么选 FastAPI

在 Flask、Django、Tornado、Sanic、aiohttp 已经林立的世界里，FastAPI 凭什么脱颖而出？核心优势有四点：

### 1. 极致性能

FastAPI 建立在两个高性能底层库之上：

- **Starlette**：ASGI 框架，负责路由、中间件、WebSocket、请求响应。本身已是 Python 中最快的 Web 工具库之一。
- **Pydantic**：数据校验库，基于 Rust 编写的核心（Pydantic v2），校验速度比 v1 快 5-50 倍。

| 框架 | 请求/秒（相对值） | 同步/异步 | 备注 |
|---|---|---|---|
| FastAPI | ~ 100% | 异步 | Starlette + Pydantic |
| Sanic | ~ 95% | 异步 | 老牌异步框架 |
| aiohttp | ~ 90% | 异步 | 服务端+客户端一体 |
| Flask | ~ 20% | 同步 | WSGI，单线程 |
| Django | ~ 15% | 同步为主 | 全栈框架，开销大 |

> 性能数字只是相对参考，真实瓶颈通常在数据库和外部 IO，不在框架本身。但 FastAPI 的异步能力让你在 IO 密集场景下能扛住更高并发。

### 2. 自动交互式文档

这是 FastAPI 最「惊艳」的特性。你定义好路由和模型后，访问 \`/docs\` 就能得到一个**可点击试用的 Swagger UI**，访问 \`/redoc\` 得到一个**结构清晰的 ReDoc 文档**。不需要写一行注释、不需要额外配置，文档从代码类型提示自动生成。

对比传统方式：

| 传统方式 | FastAPI 方式 |
|---|---|
| 写完代码再写 Swagger YAML | 代码即文档 |
| 文档和代码经常不同步 | 永远同步（同源） |
| 前端靠口口相传接口 | 直接看 /docs 试用 |
| 改接口要手动改文档 | 改代码文档自动更新 |

### 3. 类型提示驱动开发

Python 3.5 引入类型提示后，它一直是个「可选」的辅助工具。FastAPI 把它变成了**核心契约**：

\`\`\`python
# 函数签名里的类型提示，决定了参数怎么被解析、校验
async def get_user(user_id: int):  # user_id 必须是整数，字符串 "abc" 会被拒绝
    ...
\`\`\`

类型提示带来三重收益：

1. **编辑器智能提示**：VS Code / PyCharm 能自动补全、类型检查，少写 bug。
2. **运行时校验**：框架按类型自动校验请求参数，类型不符直接 422 错误。
3. **文档生成**：OpenAPI schema 直接从类型推断生成。

### 4. 开发效率与工程纪律

- **少写样板代码**：不用手写参数解析、校验、序列化，函数签名搞定一切。
- **强制契约**：输入输出都有模型约束，前后端协作不用扯皮。
- **依赖注入**：内置强大的 DI 系统，认证、数据库会话、分页逻辑都能复用。
- **标准化**：完全兼容 OpenAPI 3.0+ 和 JSON Schema，工具链生态丰富。

## 三、安装

FastAPI 本身只是个框架库，要运行起来还需要一个 ASGI 服务器。官方推荐 Uvicorn（基于 uvloop，高性能）。

\`\`\`bash
# 安装 FastAPI 和 Uvicorn（带 standard 额外依赖，包含 uvloop、httptools 等加速组件）
pip install "fastapi[standard]"
# 或者分开装
pip install fastapi
pip install "uvicorn[standard]"
\`\`\`

> 注意：\`[standard]\` 是 PEP 508 的「extras」语法，引号在 zsh 等 shell 里是必须的（方括号会被 shell 当通配符）。

验证安装：

\`\`\`bash
# 查看 FastAPI 版本
python -c "import fastapi; print(fastapi.__version__)"
# 查看 Uvicorn 版本
uvicorn --version
\`\`\`

建议使用虚拟环境隔离依赖：

\`\`\`bash
# 创建虚拟环境
python -m venv venv
# 激活（macOS/Linux）
source venv/bin/activate
# 激活（Windows PowerShell）
# venv\\Scripts\\Activate.ps1
# 安装依赖
pip install "fastapi[standard]"
\`\`\`

## 四、第一个 Hello World 应用

创建文件 \`main.py\`：

\`\`\`python
# 从 fastapi 包导入 FastAPI 类
from fastapi import FastAPI

# 创建 FastAPI 应用实例，这是整个应用的入口
# __name__ 在被 uvicorn 加载时不是必须的，但写上有利于某些工具识别
app = FastAPI(
    title="我的第一个 FastAPI",   # 显示在文档标题
    description="学习 FastAPI 的入门示例",  # 显示在文档描述
    version="0.1.0",             # API 版本号
)


# 定义一个 GET 路由，访问根路径 / 时触发
# @app.get("/") 是装饰器，把下面的函数绑定到 GET / 这个路由
@app.get("/")
# async def 表示这是一个异步协程函数，FastAPI 推荐用 async 写路由
async def root():
    # 返回一个 dict，FastAPI 会自动转成 JSON 响应
    # Content-Type 自动设为 application/json
    return {"message": "Hello, FastAPI!"}
\`\`\`

代码逐行解读：

1. \`from fastapi import FastAPI\`：FastAPI 是核心类，一个实例代表一个 Web 应用。
2. \`app = FastAPI(...)\`：实例化应用，可传 title/version 等元信息，这些会出现在自动文档里。
3. \`@app.get("/")\`：路径操作装饰器。\`get\` 是 HTTP 方法，\`"/"\` 是路径。等价于「当 GET / 请求来时，执行下面的函数」。
4. \`async def root()\`：协程函数。FastAPI 既支持 \`async def\` 也支持普通 \`def\`，会自动用线程池处理后者。
5. \`return {"message": ...}\`：返回 dict，FastAPI 用 \`json.dumps\` 序列化为 JSON 并设置正确的 Content-Type。

## 五、启动开发服务器

FastAPI 自己不运行，需要 ASGI 服务器。开发用 Uvicorn 的 \`--reload\`（文件改动自动重启）：

\`\`\`bash
# 命令格式：uvicorn <模块路径>:<应用变量名> [选项]
# main:app 表示 main.py 文件里的 app 变量
uvicorn main:app --reload
\`\`\`

常用选项：

| 选项 | 作用 | 默认值 |
|---|---|---|
| \`--reload\` | 文件改动自动重启（开发用） | 关 |
| \`--host\` | 监听地址 | 127.0.0.1 |
| \`--port\` | 监听端口 | 8000 |
| \`--workers\` | 工作进程数（生产用） | 1 |
| \`--log-level\` | 日志级别 | info |

启动成功后会看到：

\`\`\`
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
\`\`\`

用 curl 测试：

\`\`\`bash
# 访问根路径
curl http://127.0.0.1:8000/
# 输出：{"message":"Hello, FastAPI!"}

# 查看响应头
curl -i http://127.0.0.1:8000/
# HTTP/1.1 200 OK
# content-type: application/json
# ...
\`\`\`

也可以在代码里用 \`uvicorn.run\` 启动（方便 IDE 直接运行）：

\`\`\`python
# main.py
import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello"}


# 当直接 python main.py 运行时启动服务
# __name__ == "__main__" 保证只有直接运行才启动，被 import 时不启动
if __name__ == "__main__":
    # reload=True 开发期自动重启
    # 生产环境不要用 reload，应该用 --workers 多进程
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
\`\`\`

> 注意：\`uvicorn.run\` 第一个参数是字符串 \`"main:app"\` 而不是 \`app\` 对象本身。因为 reload 模式需要重新导入模块，传字符串才能让子进程重新加载。

## 六、自动交互式文档

FastAPI 内置两套文档，零配置即可用：

### 1. Swagger UI（/docs）

访问 \`http://127.0.0.1:8000/docs\`，得到一个可交互的 API 文档界面：

- 列出所有路由及其方法、路径、参数。
- 每个接口可以点 \"Try it out\" 直接发请求测试。
- 显示请求参数 schema、响应 schema、示例。
- 错误响应（422）的格式也会展示。

### 2. ReDoc（/redoc）

访问 \`http://127.0.0.1:8000/redoc\`，得到一个更适合阅读的三栏文档：

- 左侧目录，中间内容，右侧示例。
- 更适合对外分享的 API 参考文档。
- 不支持交互测试，但排版更清晰。

### 3. OpenAPI Schema（/openapi.json）

访问 \`http://127.0.0.1:8000/openapi.json\`，得到原始的 OpenAPI 3.x JSON 描述。这是文档的「源」，Swagger UI 和 ReDoc 都基于它渲染。可以用它生成前端 SDK、Postman 集合等。

关闭或定制文档：

\`\`\`python
# 生产环境可以关闭文档（避免暴露接口结构）
app = FastAPI(
    docs_url=None,       # 关闭 /docs
    redoc_url=None,      # 关闭 /redoc
    openapi_url=None,    # 关闭 /openapi.json（同时也关掉上面两个）
)

# 也可以自定义路径
app = FastAPI(
    docs_url="/my-docs",     # 文档改到 /my-docs
    openapi_url="/api/openapi.json",
)
\`\`\`

## 七、FastAPI 架构

FastAPI 不是一个从零造的框架，它站在两个巨人肩膀上：

\`\`\`
┌─────────────────────────────────────────────┐
│              你的 FastAPI 应用               │
│        （路由、依赖注入、Pydantic 模型）       │
├─────────────────────────────────────────────┤
│                  FastAPI                    │
│  （在 Starlette 之上加：类型校验、文档、DI）  │
├─────────────────────────────────────────────┤
│            Starlette（ASGI 框架）            │
│  （路由、中间件、请求响应、WebSocket、异常）  │
├─────────────────────────────────────────────┤
│             Pydantic（数据校验）              │
│        （类型校验、序列化、JSON Schema）      │
├─────────────────────────────────────────────┤
│         ASGI 服务器（Uvicorn / Hypercorn）    │
│      （网络 IO、事件循环、HTTP 解析）         │
└─────────────────────────────────────────────┘
\`\`\`

各层职责：

| 层 | 职责 | 是否可替换 |
|---|---|---|
| Uvicorn | 网络 IO、事件循环、HTTP 协议解析 | 可换 Hypercorn/Daphne |
| Starlette | ASGI 框架：路由、中间件、请求响应对象 | FastAPI 强依赖 |
| Pydantic | 数据模型校验与序列化 | FastAPI 强依赖 |
| FastAPI | 类型提示集成、依赖注入、OpenAPI 文档 | 你的应用层 |

理解这个分层很重要：

- **请求生命周期**：Uvicorn 收到 HTTP 请求 → 包装成 ASGI scope → Starlette 路由匹配 → FastAPI 解析参数（用 Pydantic 校验）→ 调用你的函数 → 返回值经 Pydantic 序列化 → Starlette 包装响应 → Uvicorn 发出。
- **报错时**：哪一层报的错，行为不同。Pydantic 校验失败返回 422，Starlette 路由没匹配返回 404，你的函数抛 HTTPException 返回你指定的状态码。

## 八、与 Flask / Django 对比

| 维度 | FastAPI | Flask | Django |
|---|---|---|---|
| 诞生年份 | 2018 | 2010 | 2005 |
| 网关接口 | ASGI（异步） | WSGI（同步） | WSGI/ASGI（3.0+） |
| 性能 | 极高 | 中 | 中低 |
| 类型提示 | 核心特性 | 可选 | 可选（DRF 较好） |
| 自动文档 | 内置 Swagger+ReDoc | 需 flask-restx | 需 DRF+drf-spectacular |
| 数据校验 | Pydantic 内置 | 手写或 marshmallow | DRF Serializer |
| ORM | 不内置（常用 SQLAlchemy） | 不内置 | 内置 Django ORM |
| 后台管理 | 无 | 无 | 内置 admin |
| 模板引擎 | 不内置（可装 Jinja2） | 不内置（常用 Jinja2） | 内置 DTL |
| 学习曲线 | 低（会 Python 类型即可） | 低 | 中高 |
| 适合场景 | API 服务、微服务、高并发 | 小型应用、原型 | 全栈网站、内容管理 |

**选型建议**：

- **做纯 API、微服务、高并发 IO**：FastAPI 首选。
- **做小型网站、快速原型、内部工具**：Flask 灵活轻量。
- **做内容管理、电商、需要后台 admin**：Django 全栈省心。
- **团队已用 Django，加 API**：DRF（Django REST Framework）。
- **需要 WebSocket、长连接**：FastAPI（ASGI 原生支持）。

## 九、多路由示例：完整的增删改查骨架

把上面学的串起来，写一个简单的用户 CRUD（暂时用列表模拟数据库）：

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="用户管理 API")

# 请求体模型：创建用户的输入
class UserCreate(BaseModel):
    username: str
    email: str

# 响应模型：对外输出（不含敏感字段）
class UserOut(BaseModel):
    id: int
    username: str
    email: str

# 用列表模拟数据库
fake_users: list[dict] = []
# 自增 ID 计数器
next_id: int = 1


# 创建用户：POST /users
@app.post("/users", response_model=UserOut, status_code=201)
async def create_user(user: UserCreate):
    global next_id
    # 构造存储对象（实际项目这里会写数据库）
    saved = {"id": next_id, "username": user.username, "email": user.email}
    fake_users.append(saved)
    next_id += 1
    # 返回值会被 response_model=UserOut 过滤
    return saved


# 查询所有用户：GET /users
@app.get("/users", response_model=list[UserOut])
async def list_users():
    return fake_users


# 查询单个用户：GET /users/{user_id}
@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int):
    # 遍历查找（实际项目用数据库查询）
    for u in fake_users:
        if u["id"] == user_id:
            return u
    # 找不到抛 404
    raise HTTPException(status_code=404, detail="用户不存在")


# 删除用户：DELETE /users/{user_id}
@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    for i, u in enumerate(fake_users):
        if u["id"] == user_id:
            fake_users.pop(i)
            # 204 No Content 不返回 body
            return
    raise HTTPException(status_code=404, detail="用户不存在")
\`\`\`

启动后访问 \`/docs\`，你能看到 4 个接口都能直接点击测试。这就是 FastAPI 的魅力：**几十行代码，一个带文档、带校验、可测试的 API 服务就跑起来了**。

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 装饰器写成 \`@app.route\` | 这是 Flask 的写法 | FastAPI 用 \`@app.get\`/\`@app.post\` 等 |
| 忘了装 uvicorn | 只装了 fastapi | 装 \`uvicorn[standard]\` |
| zsh 装包报错 \`zsh: no matches\` | 方括号被 shell 解释 | 加引号 \`"fastapi[standard]"\` |
| 改代码没生效 | 没加 \`--reload\` | 开发用 \`uvicorn main:app --reload\` |
| \`uvicorn.run\` 传对象 | reload 需要重新导入 | 传字符串 \`"main:app"\` |
| 返回非 JSON 想法 | 默认序列化为 JSON | 用 \`Response\`/\`PlainTextResponse\` |
| 文档访问 404 | 关了 \`openapi_url\` | 三套文档都依赖 openapi_url |

## 十一、设计思想

FastAPI 的核心设计哲学是：**让类型提示成为 API 契约的唯一真相来源**。传统框架里，「代码」「校验逻辑」「文档」是三份要手动同步的东西，FastAPI 把它们统一成一份——你的函数签名和 Pydantic 模型。这种「单一真相源」（Single Source of Truth）思想减少了不一致的 bug，也让开发者把精力放在业务上。

它选择站在 Starlette 和 Pydantic 肩上，而不是重新造轮子，体现了 Unix 哲学：「做一件事并做好」。FastAPI 只负责「把类型提示变成 API」这一层，其余交给专用库。这种克制的依赖组合，让它的代码量小、维护性强、升级风险低。
`,
  },

  // ============================================================
  // 第 2 章：路由、路径参数与查询参数
  // ============================================================
  {
    id: "pyweb2-fastapi-routing",
    group: "FastAPI 核心",
    icon: "🛣️",
    title: "路由、路径参数与查询参数",
    content: `
## 一、路径操作装饰器

FastAPI 把 HTTP 方法直接做成装饰器方法，每个方法对应一个 HTTP 动词：

| 装饰器 | HTTP 方法 | 典型语义 |
|---|---|---|
| \`@app.get(path)\` | GET | 查询资源，不应有副作用 |
| \`@app.post(path)\` | POST | 创建资源、提交数据 |
| \`@app.put(path)\` | PUT | 整体替换资源 |
| \`@app.patch(path)\` | PATCH | 部分更新资源 |
| \`@app.delete(path)\` | DELETE | 删除资源 |
| \`@app.options(path)\` | OPTIONS | 预检请求（CORS） |
| \`@app.head(path)\` | HEAD | 只取响应头 |
| \`@app.trace(path)\` | TRACE | 调试用，回显请求 |

基础示例：

\`\`\`python
from fastapi import FastAPI

app = FastAPI()


# GET 请求，路径是 /
@app.get("/")
async def index():
    return {"endpoint": "首页"}


# POST 请求，路径是 /items
@app.post("/items")
async def create_item():
    return {"created": True}


# DELETE 请求，路径是 /items/5
@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    return {"deleted_id": item_id}
\`\`\`

> 注意：装饰器方法的第一个参数是路径字符串，必须以 \`/\` 开头。一个路径可以注册多个方法（GET 和 POST 都注册 \`/items\` 是合法的）。

## 二、路径参数

路径里用 \`{xxx}\` 包裹的部分是路径参数，会作为函数参数传入：

\`\`\`python
# 路径 /users/{user_id} 里的 user_id 会传给函数
@app.get("/users/{user_id}")
async def get_user(user_id):
    # user_id 此时是字符串（没声明类型时）
    return {"user_id": user_id, "type": type(user_id).__name__}
\`\`\`

访问 \`/users/42\` 返回 \`{"user_id":"42","type":"str"}\`。

### 类型转换

在函数签名里声明类型，FastAPI 会自动转换并校验：

\`\`\`python
# 声明 user_id: int，传入的字符串会被转成 int
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "type": type(user_id).__name__}
\`\`\`

访问 \`/users/42\` 返回 \`{"user_id":42,"type":"int"}\`。
访问 \`/users/abc\` 返回 422 错误：

\`\`\`json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "user_id"],
      "msg": "Input should be a valid integer..."
    }
  ]
}
\`\`\`

支持的类型转换：

| 声明类型 | 输入示例 | 转换结果 |
|---|---|---|
| \`int\` | \`"42"\` | \`42\` |
| \`float\` | \`"3.14"\` | \`3.14\` |
| \`bool\` | \`"true"\`/\`"1"\`/\`"yes"\` | \`True\` |
| \`str\` | \`"hello"\` | \`"hello"\` |
| \`Path\`（来自 fastapi） | 任意字符串 | 含 \`/\` 的字符串 |
| \`enum\` | 枚举值 | 枚举成员 |

### 路径顺序很重要

路由按**声明顺序**匹配，先注册的先匹配。这会导致一个经典坑：

\`\`\`python
# ❌ 错误顺序：/users/me 会被 /users/{user_id} 先匹配，user_id="me" 转 int 失败
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}


@app.get("/users/me")
async def get_me():
    return {"user": "当前登录用户"}


# ✅ 正确顺序：固定路径放在动态参数前面
@app.get("/users/me")
async def get_me():
    return {"user": "当前登录用户"}


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
\`\`\`

**原则**：**固定路径在前，动态参数在后**。

### 包含斜杠的路径参数

默认情况下 \`{user_id}\` 不会匹配 \`/\`，即 \`/users/a/b\` 中 \`user_id\` 不会是 \`a/b\`。如果要让路径参数包含 \`/\`（比如文件路径），用 \`Path\`：

\`\`\`python
from fastapi import Path


# {file_path:path} 表示这个参数可以包含 /，匹配剩余全部路径
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}
\`\`\`

访问 \`/files/dir/sub/file.txt\`，\`file_path\` 为 \`dir/sub/file.txt\`。

## 三、查询参数

URL 里 \`?\` 后面的键值对是查询参数。函数签名里**不在路径中出现的参数**就是查询参数：

\`\`\`python
# 路径是 /items，没有 {skip} {limit}
# 所以 skip 和 limit 是查询参数
@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    # /items?skip=0&limit=10 → skip=0, limit=10
    # /items?skip=20        → skip=20, limit=10（用默认值）
    return {"skip": skip, "limit": limit}
\`\`\`

访问方式：

- \`/items\` → \`skip=0, limit=10\`（都用默认值）
- \`/items?skip=5\` → \`skip=5, limit=10\`
- \`/items?skip=5&limit=20\` → \`skip=5, limit=20\`
- \`/items?limit=20\` → \`skip=0, limit=20\`

### 必填与可选查询参数

- **有默认值**：可选。
- **无默认值**：必填。
- **默认值 None**：可选，且允许传 null。

\`\`\`python
from typing import Optional  # Python 3.9+ 可直接用 str | None


@app.get("/search")
async def search(
    q: str,                      # 必填（无默认值）
    category: str = "all",       # 可选，默认 all
    keyword: Optional[str] = None  # 可选，默认 None
):
    # /search?q=phone                → q="phone", category="all", keyword=None
    # /search?q=phone&category=tech  → keyword=None
    # /search                        → 422 错误，q 是必填
    return {"q": q, "category": category, "keyword": keyword}
\`\`\`

### bool 类型的自动转换

查询参数声明为 \`bool\` 时，FastAPI 会做宽松转换：

\`\`\`python
@app.get("/flag")
async def get_flag(active: bool = False):
    return {"active": active}
\`\`\`

| 查询字符串 | active 值 |
|---|---|
| \`?active=true\` | \`True\` |
| \`?active=False\` | \`False\` |
| \`?active=1\` | \`True\` |
| \`?active=0\` | \`False\` |
| \`?active=yes\` | \`True\` |
| \`?active=no\` | \`False\` |
| \`?active=on\` | \`True\` |
| \`?active=off\` | \`False\` |

这对前端传开关参数很友好，不用强制前端转 \`true\`/\`false\` 字符串。

### 多类型参数混合

路径参数、查询参数、请求体可以同时存在，FastAPI 按位置和类型自动识别：

\`\`\`python
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    price: float


@app.put("/items/{item_id}")
async def update_item(
    item_id: int,      # 路径参数（在路径里出现）
    q: str | None = None,  # 查询参数（不在路径里，是简单类型）
    item: Item | None = None  # 请求体（Pydantic 模型）
):
    result = {"item_id": item_id}
    if q:
        result["q"] = q
    if item:
        result["item"] = item
    return result
\`\`\`

FastAPI 的参数识别规则：

| 参数类型 | 识别依据 |
|---|---|
| 路径参数 | 在路径字符串 \`{xxx}\` 中出现 |
| 请求体 | 是 Pydantic 模型（\`BaseModel\` 子类） |
| 查询参数 | 既不在路径里，也不是 Pydantic 模型 |
| 表单字段 | 用 \`Form(...)\` 声明 |

## 四、参数验证

### 查询参数验证：Query

用 \`Query\` 给查询参数加约束：

\`\`\`python
from fastapi import Query


@app.get("/items")
async def list_items(
    # q 可选，最长 50 字符
    q: str | None = Query(default=None, max_length=50),
    # skip 必填，>= 0
    skip: int = Query(default=0, ge=0),
    # limit 在 1~100 之间
    limit: int = Query(default=10, ge=1, le=100),
):
    return {"q": q, "skip": skip, "limit": limit}
\`\`\`

\`Query\` 常用约束：

| 约束 | 适用类型 | 含义 |
|---|---|---|
| \`min_length\` | str | 最小长度 |
| \`max_length\` | str | 最大长度 |
| \`pattern\` | str | 正则匹配（v2 替代 regex） |
| \`ge\` | 数值 | 大于等于 (>=) |
| \`gt\` | 数值 | 大于 (>) |
| \`le\` | 数值 | 小于等于 (<=) |
| \`lt\` | 数值 | 小于 (<) |
| \`alias\` | 任意 | 字段别名（前端传别的名字） |
| \`deprecated\` | 任意 | 标记为已废弃（文档灰色显示） |
| \`description\` | 任意 | 文档描述 |

### 别名 alias

Python 变量不能用连字符，但前端可能传 \`from-city\`。用 alias 桥接：

\`\`\`python
@app.get("/search")
async def search(
    # Python 变量名 from_city，但前端传 from-city
    from_city: str = Query(alias="from-city"),
):
    return {"from_city": from_city}
# 访问 /search?from-city=北京 → from_city="北京"
\`\`\`

### 路径参数验证：Path

路径参数用 \`Path\`，用法和 \`Query\` 一样，但路径参数通常必填（不能有默认值）：

\`\`\`python
from fastapi import Path


@app.get("/items/{item_id}")
async def get_item(
    # item_id 必须 >= 1
    item_id: int = Path(ge=1, title="物品 ID", description="正整数"),
):
    return {"item_id": item_id}
\`\`\`

> 注意：在 Python 函数签名里，**有默认值的参数必须在没默认值的参数后面**。但 \`Path\` 用 \`...\`（Ellipsis）表示必填，可以绕过这个限制：

\`\`\`python
from fastapi import Path, Query
from typing import Annotated

# 用 Annotated 让顺序无关，FastAPI 推荐 v2 写法
@app.get("/items/{item_id}")
async def get_item(
    # Annotated 把类型和元数据（约束）分开，更清晰
    item_id: Annotated[int, Path(ge=1)],
    q: Annotated[str | None, Query(max_length=50)] = None,
):
    return {"item_id": item_id, "q": q}
\`\`\`

\`Annotated\` 是 Python 3.9+ 引入的，FastAPI 推荐用它替代 \"默认值=Query()\" 的老写法，因为类型和元数据分离，更易读，也方便复用。

## 五、查询参数枚举

用 \`Enum\` 限制查询参数只能取特定值：

\`\`\`python
from enum import Enum


# 定义枚举类，继承 str 和 Enum
class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"


@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    # model_name 是枚举成员
    if model_name is ModelName.alexnet:
        return {"model": model_name, "message": "Deep Learning FTW!"}
    return {"model": model_name, "value": model_name.value}
\`\`\`

访问 \`/models/alexnet\` 返回对应内容；访问 \`/models/foo\` 返回 422，提示可选值。文档里会自动渲染成下拉框。

## 六、APIRouter 模块化路由

项目大了以后，所有路由堆在 \`main.py\` 不现实。\`APIRouter\` 让你把路由分组到不同模块：

\`\`\`python
# routers/users.py
from fastapi import APIRouter, HTTPException

# 创建路由器，prefix 给这个路由器的所有路径加前缀
# tags 让文档里这些接口归到同一分组
router = APIRouter(
    prefix="/users",
    tags=["用户"],
    responses={404: {"description": "用户不存在"}},
)

fake_users = {1: {"id": 1, "name": "Alice"}}


# 注意这里用 @router 而不是 @app
@router.get("/")
async def list_users():
    return list(fake_users.values())


@router.get("/{user_id}")
async def get_user(user_id: int):
    if user_id not in fake_users:
        raise HTTPException(status_code=404, detail="用户不存在")
    return fake_users[user_id]
\`\`\`

在主应用里注册：

\`\`\`python
# main.py
from fastapi import FastAPI
from routers import users, items  # 假设还有 items.py

app = FastAPI()

# 把路由器挂到主应用
# include_router 会把 router 的 prefix 加到每个路径前
app.include_router(users.router)
app.include_router(items.router, prefix="/items")  # 可以再加一层前缀


@app.get("/")
async def root():
    return {"message": "首页"}
\`\`\`

最终路径：

- \`GET /users/\`（来自 users.router 的 prefix=/users + 路径 /）
- \`GET /users/{user_id}\`
- \`GET /items/...\`（来自 items.router + include_router 的 prefix）

### 路由器级依赖

\`APIRouter\` 可以挂依赖，对该路由器下所有接口生效：

\`\`\`python
from fastapi import APIRouter, Depends

# 这个路由器下所有接口都要先过 verify_token 依赖
router = APIRouter(
    prefix="/admin",
    tags=["管理后台"],
    dependencies=[Depends(verify_token)],  # 路由器级依赖
)


@router.get("/stats")
async def stats():
    # 不用在这里再写 Depends，自动执行
    return {"users": 100}
\`\`\`

### 多版本 API

用 prefix 实现版本管理：

\`\`\`python
app = FastAPI()

# v1 版本
app.include_router(users.router, prefix="/api/v1")
# v2 版本（如果有新的 users_v2.router）
app.include_router(users_v2.router, prefix="/api/v2")
\`\`\`

## 七、路由匹配的内部原理

FastAPI（Starlette）的路由底层用 **Starlette Router**，匹配算法是：

1. **按声明顺序**遍历所有路由。
2. 每个路由的路径编译成**正则表达式**（\`{user_id}\` 变成命名捕获组）。
3. 第一个匹配成功的就是目标。

这意味着：

- 顺序敏感（前面讲的固定路径放前面）。
- 性能 O(n)，路由多了会慢（几百个不用操心，几万个考虑用 trie 路由库）。
- 路径参数的类型校验在匹配**之后**做（先匹配字符串，再转 int）。

## 八、实战：带校验的分页列表接口

把本章学的整合，写一个生产级分页接口：

\`\`\`python
from fastapi import FastAPI, Query
from typing import Annotated
from enum import Enum

app = FastAPI()

# 排序字段枚举
class SortField(str, Enum):
    created_at = "created_at"
    price = "price"
    name = "name"


# 排序方向枚举
class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"


@app.get("/products")
async def list_products(
    # 关键词搜索，可选，最长 100
    keyword: Annotated[str | None, Query(max_length=100)] = None,
    # 页码，>=1，默认 1
    page: Annotated[int, Query(ge=1)] = 1,
    # 每页数量，1~100，默认 20
    page_size: Annotated[int, Query(ge=1, le=100, alias="pageSize")] = 20,
    # 排序字段
    sort_by: SortField = SortField.created_at,
    # 排序方向
    order: SortOrder = SortOrder.desc,
):
    # 计算分页偏移
    skip = (page - 1) * page_size
    return {
        "keyword": keyword,
        "page": page,
        "page_size": page_size,
        "skip": skip,
        "sort_by": sort_by.value,
        "order": order.value,
        # 实际项目这里查数据库
        "data": [],
        "total": 0,
    }
\`\`\`

访问 \`/products?keyword=phone&page=2&pageSize=20&sort_by=price&order=asc\`，参数都被解析校验。前端误传 \`page=-1\` 直接 422 拦截，根本进不到函数体。这就是类型驱动 + 验证约束的威力。

## 九、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 路由不匹配 404 | 固定路径在动态参数后 | 调整声明顺序 |
| 路径参数拿不到 \`/\` | 默认不匹配斜杠 | 用 \`{x:path}\` |
| 必填参数报 422 | 忘了给默认值 | 加 \`= None\` 或 \`= 默认值\` |
| 函数参数顺序报错 | 有默认值参数在前 | 用 \`Annotated\` 或 \`...\` |
| alias 不生效 | 用了变量名而非 alias 传参 | 前端用 alias 名字 |
| 枚举值传错 | 传了非枚举值 | 看文档可选值 |
| query 参数被当请求体 | 类型是 Pydantic 模型 | 简单类型才是 query |

## 十、设计思想

FastAPI 路由的设计精髓是「**函数签名即接口契约**」。你不需要学一套 DSL（像 Django 的 urlpatterns），也不需要写装饰器列表（像 Flask 的 \`@app.route('/', methods=['GET'])\`），路径参数、查询参数、请求体、校验规则全部用 Python 函数签名 + 类型提示表达。这种设计的好处是：

1. **低认知负担**：会写 Python 函数就会写 FastAPI 接口。
2. **类型检查友好**：mypy / Pyright 能静态检查参数类型。
3. **文档自动化**：签名是真相源，文档永远同步。

\`APIRouter\` 则体现了「**组合优于继承**」的哲学。Flask 的 Blueprint 也是类似思路，但 FastAPI 的 router 还能带 prefix、tags、dependencies、responses，把一组接口的「元信息」打包成一个可复用单元，挂载点（\`include_router\`）还能再叠加 prefix，组合性极强。
`,
  },

  // ============================================================
  // 第 3 章：Pydantic 模型与请求体验证
  // ============================================================
  {
    id: "pyweb2-fastapi-pydantic",
    group: "FastAPI 核心",
    icon: "📋",
    title: "Pydantic 模型与请求体验证",
    content: `
## 一、Pydantic 是什么

Pydantic 是 Python 最流行的数据校验库，核心思想是「**类型驱动的数据校验**」。你定义一个继承 \`BaseModel\` 的类，声明字段类型，Pydantic 就会：

1. **校验**：传入数据类型不对，报错（带详细错误位置）。
2. **转换**：能转就转（\`"42"\` → \`42\`，\`"true"\` → \`True\`）。
3. **序列化**：实例能转 dict / JSON。
4. **生成 Schema**：自动产出 JSON Schema，给 OpenAPI 用。

FastAPI 把 Pydantic 当作请求体校验、响应序列化、文档生成的统一基础设施。可以说，**没有 Pydantic 就没有 FastAPI**。

Pydantic v2（2023 年发布）用 Rust 重写了核心，比 v1 快 5-50 倍，API 也有调整。本章以 v2 为主，必要时标注与 v1 的差异。

## 二、BaseModel 定义

最简单的模型：

\`\`\`python
from pydantic import BaseModel


# 定义模型，继承 BaseModel
class User(BaseModel):
    # 字段名: 类型
    id: int
    username: str
    email: str
    is_active: bool = True  # 有默认值，可省略


# 用关键字参数创建实例
u = User(id=1, username="alice", email="a@b.com")
print(u)              # id=1 username='alice' email='a@b.com' is_active=True
print(u.username)     # alice（属性访问）
print(u.model_dump()) # {'id': 1, 'username': 'alice', ...}（v2 转 dict）
\`\`\`

字段规则：

| 声明方式 | 含义 |
|---|---|
| \`name: str\` | 必填，无默认值 |
| \`name: str = "x"\` | 可选，默认 \`"x"\` |
| \`name: str \| None = None\` | 可选，默认 \`None\` |
| \`name: Optional[str] = None\` | 同上（老写法） |

### 类型转换示例

\`\`\`python
class Item(BaseModel):
    name: str
    price: float
    quantity: int


# 传字符串数字，会被转换
item = Item(name="phone", price="399.99", quantity="5")
print(item.price)    # 399.99（float）
print(item.quantity) # 5（int）

# 类型实在转不过来才报错
try:
    Item(name="phone", price="abc", quantity=5)
except Exception as e:
    print(e.errors())  # price 字段 float_parsing 错误
\`\`\`

## 三、字段验证：Field

\`Field\` 给字段加约束和元数据：

\`\`\`python
from pydantic import BaseModel, Field


class User(BaseModel):
    # username 最长 20 字符，最少 3 字符
    username: str = Field(min_length=3, max_length=20)
    # age 在 0~150 之间
    age: int = Field(ge=0, le=150)
    # email 用正则校验
    email: str = Field(pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$")
    # score 默认 0，>= 0
    score: float = Field(default=0.0, ge=0)
    # 描述（用于文档）
    bio: str | None = Field(default=None, max_length=500, description="个人简介")
\`\`\`

\`Field\` 常用参数：

| 参数 | 适用类型 | 含义 |
|---|---|---|
| \`default\` | 任意 | 默认值 |
| \`min_length\` / \`max_length\` | str / 列表 | 长度限制 |
| \`pattern\` | str | 正则匹配（v2，替代 v1 的 regex） |
| \`ge\` / \`gt\` | 数值 | >= / > |
| \`le\` / \`lt\` | 数值 | <= / < |
| \`multiple_of\` | 数值 | 必须是某数的倍数 |
| \`alias\` | 任意 | 字段别名 |
| \`title\` / \`description\` | 任意 | 文档元信息 |
| \`examples\` | 任意 | 文档示例 |
| \`exclude\` | 任意 | 序列化时排除 |

### alias：前后端字段名不一致

数据库字段常用下划线（\`created_at\`），前端常用驼峰（\`createdAt\`）。alias 让两者解耦：

\`\`\`python
class User(BaseModel):
    # Python 用 created_at，但接收/输出时用 createdAt
    created_at: str = Field(alias="createdAt")


# 用 alias 传入
u = User(**{"createdAt": "2024-01-01"})
print(u.created_at)              # 2024-01-01
print(u.model_dump(by_alias=True))  # {'createdAt': '2024-01-01'}
\`\`\`

## 四、嵌套模型

模型可以包含模型，表达复杂结构：

\`\`\`python
from pydantic import BaseModel
from typing import List


# 地址模型
class Address(BaseModel):
    city: str
    street: str
    zip_code: str


# 用户模型，包含 Address
class User(BaseModel):
    id: int
    name: str
    address: Address       # 嵌套单个模型
    friends: List[User] = []  # 自引用嵌套（需要默认值或字符串前向引用）


# 传入嵌套 dict，Pydantic 递归校验
data = {
    "id": 1,
    "name": "Alice",
    "address": {"city": "北京", "street": "长安街", "zip_code": "100000"},
    "friends": [
        {"id": 2, "name": "Bob", "address": {"city": "上海", "street": "南京路", "zip_code": "200000"}}
    ],
}
user = User(**data)
print(user.address.city)    # 北京
print(user.friends[0].name) # Bob
\`\`\`

> 自引用模型（User 里包含 List[User]）在 v1 需要用字符串 \`"User"\` 前向引用，v2 直接支持。

### 列表与字典类型

\`\`\`python
from typing import List, Dict


class Order(BaseModel):
    # 商品列表，每个元素是 dict
    items: List[dict]
    # 商品价格映射，键 str 值 float
    prices: Dict[str, float]
    # 标签集合
    tags: set[str]  # 传 ["a","a","b"] 会去重为 {"a","b"}
\`\`\`

## 五、自定义验证器

当 \`Field\` 的约束不够用时，用验证器写自定义逻辑。

### v2：@field_validator（单字段）

\`\`\`python
from pydantic import BaseModel, field_validator


class User(BaseModel):
    username: str
    email: str
    password: str

    # @field_validator 装饰器，参数是字段名
    # 模式 mode="after" 表示在类型转换之后执行（v2 新增）
    @field_validator("username")
    @classmethod  # 必须是类方法
    def username_alphanumeric(cls, v: str) -> str:
        # v 是已经过类型转换的值
        if not v.isalnum():
            raise ValueError("用户名只能含字母和数字")
        return v  # 必须返回值（可以是转换后的）

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("邮箱必须包含 @")
        return v.lower()  # 顺便转小写

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("密码至少 8 位")
        if not any(c.isdigit() for c in v):
            raise ValueError("密码必须含数字")
        return v
\`\`\`

v2 的 \`mode\` 参数：

| mode | 时机 | 用途 |
|---|---|---|
| \`"after"\`（默认） | 类型转换后 | 校验最终值 |
| \`"before"\` | 类型转换前 | 处理原始输入（如把字符串预处理） |
| \`"wrap"\` | 包裹默认校验 | 完全自定义（可调用 handler 走默认） |

### v2：@model_validator（多字段）

跨字段校验用 \`@model_validator\`：

\`\`\`python
from pydantic import BaseModel, model_validator


class Order(BaseModel):
    quantity: int
    unit_price: float
    total_price: float

    # mode="after" 时函数收到的是已校验的模型实例
    @model_validator(mode="after")
    def check_total(self) -> "Order":
        expected = self.quantity * self.unit_price
        if abs(self.total_price - expected) > 0.01:
            raise ValueError(f"总价应为 {expected}，实际 {self.total_price}")
        return self


# 还可以用 mode="before" 处理原始 dict
class User(BaseModel):
    name: str
    name2: str | None = None

    @model_validator(mode="before")
    @classmethod
    def fill_name2(cls, data):
        # data 是原始 dict
        if isinstance(data, dict) and "name2" not in data:
            data["name2"] = data.get("name")
        return data
\`\`\`

### v1 写法（了解即可）

\`\`\`python
# v1 用 @validator，v2 已废弃但仍可用
from pydantic import BaseModel, validator


class User(BaseModel):
    username: str

    @validator("username")
    def check(cls, v):
        if not v.isalnum():
            raise ValueError("只能字母数字")
        return v
\`\`\`

## 六、请求体 Body

请求体是 HTTP 请求里 body 部分（POST/PUT/PATCH 才有）。FastAPI 把 Pydantic 模型自动识别为请求体：

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    price: float


# item 是 Pydantic 模型 → 自动作为请求体解析
@app.post("/items")
async def create_item(item: Item):
    # item 已经被校验过，是 Item 实例
    return {"name": item.name, "price_with_tax": item.price * 1.1}
\`\`\`

请求示例：

\`\`\`bash
curl -X POST http://127.0.0.1:8000/items \\
  -H "Content-Type: application/json" \\
  -d '{"name":"phone","price":399.99}'
\`\`\`

### 单个值作为请求体

默认情况下，简单类型（int/str）会被当作查询参数。如果要把它当请求体，用 \`Body\`：

\`\`\`python
from fastapi import Body


@app.post("/items/{item_id}")
async def update_item(
    item_id: int,
    # importance 是 int，默认是查询参数；用 Body() 强制作为请求体
    importance: int = Body(),
):
    return {"item_id": item_id, "importance": importance}
\`\`\`

请求体就是 \`{"importance": 5}\`，而不是 \`?importance=5\`。

### embed：让单个模型嵌在键里

默认单个 Pydantic 模型的字段会展开成请求体顶层。用 \`embed\` 强制包一层：

\`\`\`python
@app.post("/items")
async def create_item(item: Item = Body(embed=True)):
    return item
\`\`\`

| 模式 | 请求体 |
|---|---|
| 默认 | \`{"name":"x","price":1}\` |
| \`embed=True\` | \`{"item":{"name":"x","price":1}}\` |

embed 用于多个模型共存时避免字段冲突。

## 七、表单数据 Form 与文件上传

表单（\`application/x-www-form-urlencoded\`）和文件（\`multipart/form-data\`）不能用 JSON 模型接收，要用 \`Form\` 和 \`File\`：

\`\`\`python
from fastapi import FastAPI, Form, File, UploadFile

app = FastAPI()


# 用 Form 接收表单字段
@app.post("/login")
async def login(
    username: str = Form(),  # Form() 表示必填表单字段
    password: str = Form(),
):
    return {"username": username}


# 文件上传用 UploadFile（推荐，流式，省内存）
@app.post("/upload")
async def upload_file(file: UploadFile):
    # file.filename 文件名
    # file.content_type MIME 类型
    # await file.read() 读全部内容（小文件）
    contents = await file.read()
    return {
        "filename": file.filename,
        "size": len(contents),
        "content_type": file.content_type,
    }


# 表单 + 文件混合
@app.post("/profile")
async def create_profile(
    name: str = Form(),
    avatar: UploadFile = File(),
):
    return {"name": name, "avatar_name": avatar.filename}
\`\`\`

\`UploadFile\` vs \`bytes\`：

| 方式 | 内存占用 | 适用 |
|---|---|---|
| \`file: bytes = File()\` | 全部读进内存 | 小文件 |
| \`file: UploadFile\` | 流式，可分块读 | 大文件、生产环境 |

大文件分块读：

\`\`\`python
@app.post("/upload-big")
async def upload_big(file: UploadFile):
    total = 0
    # 分块读，避免一次性占内存
    while chunk := await file.read(1024 * 1024):  # 每次读 1MB
        total += len(chunk)
    return {"size": total}
\`\`\`

## 八、Pydantic v2 关键特性

### 1. 性能

核心用 Rust 重写，校验速度快 5-50 倍，序列化速度快 2-10 倍。对 FastAPI 这种每次请求都要校验的场景，整体吞吐提升明显。

### 2. API 改名

| v1 | v2 |
|---|---|
| \`.dict()\` | \`.model_dump()\` |
| \`.json()\` | \`.model_dump_json()\` |
| \`.parse_obj()\` | \`.model_validate()\` |
| \`.parse_raw()\` | \`.model_validate_json()\` |
| \`@validator\` | \`@field_validator\` |
| \`@root_validator\` | \`@model_validator\` |
| \`Config\` 内部类 | \`model_config\`（可加 \`ConfigDict\`） |
| \`regex=...\` | \`pattern=...\` |

### 3. model_config

\`\`\`python
from pydantic import BaseModel, ConfigDict


class User(BaseModel):
    # model_config 替代 v1 的 class Config
    model_config = ConfigDict(
        # 允许从 ORM 对象的字段读取（如 SQLAlchemy 模型）
        from_attributes=True,
        # 是否允许额外字段（默认 ignore 忽略，forbid 禁止，allow 允许）
        extra="forbid",
        # 是否使用字段别名填充
        populate_by_name=True,
        # 字符串自动去前后空格
        str_strip_whitespace=True,
    )

    username: str
\`\`\`

### 4. 与 ORM 集成：from_attributes

FastAPI 常和 SQLAlchemy 配合。SQLAlchemy 模型不是 Pydantic 模型，但开启 \`from_attributes=True\` 后，Pydantic 能从对象的属性读取：

\`\`\`python
from pydantic import BaseModel, ConfigDict


# SQLAlchemy 模型（伪代码）
class DBUser:  # 实际继承 Base
    id: int
    username: str
    password_hash: str


# Pydantic 输出模型
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    # 没有 password_hash，自动忽略


# 直接从 ORM 对象构造
db_user = DBUser()
user_out = UserOut.model_validate(db_user)  # 从属性读取
\`\`\`

这是 FastAPI + SQLAlchemy 的标准模式：DB 查出 ORM 对象 → \`response_model=UserOut\` 自动转换 → 输出 JSON，敏感字段被过滤。

## 九、实战：完整的用户注册接口

整合本章知识，写一个带校验的注册接口：

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator, ConfigDict

app = FastAPI()


class UserRegister(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    username: str = Field(
        min_length=3, max_length=20,
        pattern=r"^[a-zA-Z0-9_]+$",  # 只允许字母数字下划线
        description="用户名，3-20 位字母数字下划线",
    )
    email: str = Field(pattern=r"^[^@]+@[^@]+\\.[^@]+$")
    password: str = Field(min_length=8, max_length=64)
    age: int = Field(ge=13, le=120, description="必须 13 岁以上")
    invite_code: str | None = None

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("密码必须含大写字母")
        if not any(c.islower() for c in v):
            raise ValueError("密码必须含小写字母")
        if not any(c.isdigit() for c in v):
            raise ValueError("密码必须含数字")
        return v


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str


# 模拟已存在的用户名
existing = {"alice", "bob"}


@app.post("/register", response_model=UserPublic, status_code=201)
async def register(user: UserRegister):
    if user.username in existing:
        raise HTTPException(status_code=409, detail="用户名已存在")
    existing.add(user.username)
    # 实际项目：hash 密码、写库、发邮件
    return {"id": len(existing), "username": user.username, "email": user.email}
\`\`\`

测试：

\`\`\`bash
# 合法请求
curl -X POST http://127.0.0.1:8000/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"charlie","email":"c@d.com","password":"Abc12345","age":25}'
# 201 {"id":3,"username":"charlie","email":"c@d.com"}

# 密码太弱（422 自动拦截）
curl -X POST http://127.0.0.1:8000/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"d","email":"d@d.com","password":"abc","age":25}'
# 422，列出所有校验错误
\`\`\`

注意 422 响应会列出**所有**校验错误（不是只报第一个），前端可以一次性显示所有问题：

\`\`\`json
{
  "detail": [
    {"loc": ["body", "username"], "msg": "..."},
    {"loc": ["body", "password"], "msg": "..."}
  ]
}
\`\`\`

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 调 \`.dict()\` 报错 | v2 改名 | 用 \`.model_dump()\` |
| \`@validator\` 警告 | v1 装饰器 | v2 用 \`@field_validator\` |
| ORM 对象转模型失败 | 没开 from_attributes | 加 \`model_config = ConfigDict(from_attributes=True)\` |
| 嵌套自引用报错 | v1 需前向引用 | v2 直接支持，或用 \`"User"\` 字符串 |
| 额外字段被忽略 | 默认 extra=ignore | 想报错设 \`extra="forbid"\` |
| 表单用 BaseModel 收不到 | 表单不是 JSON | 用 \`Form()\` |
| 文件用 bytes 读大文件 | 内存爆 | 用 \`UploadFile\` 流式读 |
| validator 没返回值 | 报错 | 必须返回值（原值或转换后） |

## 十一、设计思想

Pydantic 的设计哲学是「**数据先验证后使用**」。在动态语言 Python 里，函数拿到的数据是什么类型常常靠注释和运气，运行时 \`TypeError\` 频发。Pydantic 把「类型契约」前置到数据入口：任何外部数据（HTTP 请求、配置文件、API 响应）进来先过模型校验，校验通过才进入业务逻辑。这让你的业务代码可以**信任**数据类型，不用到处 \`if isinstance(x, int)\`。

这种「边界校验，内部信任」的模式，和 TypeScript 的思路一脉相承：在系统边界做强校验，内部代码就能用纯类型思维写。FastAPI 把这个理念贯穿到每个请求——你的路由函数拿到的参数一定是校验过的、类型正确的，于是函数体可以专注业务，而不是防御性编程。

v2 用 Rust 重写核心，体现了 Python 生态的一个趋势：**性能关键路径用 Rust，业务逻辑用 Python**。这种混合语言策略让 Python 既保持了开发效率，又补齐了性能短板。
`,
  },

  // ============================================================
  // 第 4 章：响应模型与自定义响应
  // ============================================================
  {
    id: "pyweb2-fastapi-response",
    group: "FastAPI 核心",
    icon: "📤",
    title: "响应模型与自定义响应",
    content: `
## 一、response_model 参数：过滤输出字段

接口返回数据时，最朴素的写法是 \`return dict\`。但这有几个隐患：

1. **敏感字段泄漏**：数据库 User 有 \`password\` 字段，直接返回会暴露密码哈希。
2. **没有类型契约**：调用方不知道返回结构，IDE 没提示。
3. **文档空白**：OpenAPI 不知道响应结构，Swagger 显示不出示例。

\`response_model\` 解决这些问题：它告诉 FastAPI「这个接口返回的数据应该长成什么样」，框架会按模型**过滤、校验、序列化**返回值。

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


# 输入模型：含密码
class UserIn(BaseModel):
    username: str
    password: str
    email: str


# 输出模型：不含密码
class UserOut(BaseModel):
    username: str
    email: str


fake_db = {}


# response_model=UserOut：即使 return 含 password，也只输出 UserOut 字段
@app.post("/users", response_model=UserOut)
async def create_user(user: UserIn):
    fake_db[user.username] = user
    # 返回完整 user（含 password），但 response_model 会过滤
    return user
\`\`\`

请求传 \`{"username":"alice","password":"123","email":"a@b.com"}\`，响应只有 \`{"username":"alice","email":"a@b.com"}\`，\`password\` 被自动剔除。

| 维度 | \`return dict\` | \`response_model=Model\` |
|---|---|---|
| 敏感字段过滤 | 手动删，易漏 | 自动过滤 |
| 类型校验 | 无 | 自动校验 |
| API 文档 | 无响应结构 | 自动生成 |
| IDE 提示 | 无 | 有 |
| 前端契约 | 靠口口相传 | 靠代码 |

**结论**：任何对外接口都应声明 \`response_model\`，这是工程纪律。

## 二、返回列表：list[Model]

\`\`\`python
from typing import List


@app.get("/users", response_model=List[UserOut])
async def list_users():
    # 数据库里是 UserIn，返回时被过滤成 UserOut
    return list(fake_db.values())
\`\`\`

每个元素都会被 UserOut 过滤。即便返回 ORM 对象列表，配合 \`from_attributes=True\` 也能正确处理。

## 三、response_model_include / exclude

细粒度控制字段：

\`\`\`python
class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: str


@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    return {"id": user_id, "username": "x", "email": "x@x.com",
            "is_active": True, "created_at": "2024-01-01"}


# 只返回 id 和 username
@app.get("/users/{user_id}/brief", response_model=User,
         response_model_include={"id", "username"})
async def get_user_brief(user_id: int):
    return {"id": user_id, "username": "x", "email": "x@x.com",
            "is_active": True, "created_at": "2024-01-01"}


# 排除 created_at
@app.get("/users/{user_id}/no-meta", response_model=User,
         response_model_exclude={"created_at"})
async def get_user_no_meta(user_id: int):
    return {"id": user_id, "username": "x", "email": "x@x.com",
            "is_active": True, "created_at": "2024-01-01"}
\`\`\`

| 参数 | 作用 |
|---|---|
| \`response_model_include\` | 只保留指定字段 |
| \`response_model_exclude\` | 排除指定字段 |
| \`response_model_by_alias\` | 用 alias 输出（默认 False） |
| \`response_model_exclude_unset\` | 排除未设置（用默认值）的字段 |
| \`response_model_exclude_defaults\` | 排除等于默认值的字段 |
| \`response_model_exclude_none\` | 排除 None 字段 |

\`exclude_unset\` vs \`exclude_defaults\`：

\`\`\`python
class Item(BaseModel):
    name: str
    price: float = 0.0
    desc: str | None = None

# 构造时只传 name
item = Item(name="x")

item.model_dump()                          # {'name':'x','price':0.0,'desc':None}
item.model_dump(exclude_unset=True)        # {'name':'x'}（只含显式传的）
item.model_dump(exclude_defaults=True)     # {'name':'x'}（排除等于默认的）
item.model_dump(exclude_none=True)         # {'name':'x','price':0.0}（排除 None）
\`\`\`

\`exclude_unset\` 在 PATCH 接口很有用：前端只传想改的字段，后端只更新传了的字段。

## 四、状态码 status_code

\`\`\`python
# 装饰器参数指定成功状态码
@app.post("/items", status_code=201)  # 创建成功 201
async def create_item(item: Item):
    return item


@app.delete("/items/{item_id}", status_code=204)  # 删除成功 204 无内容
async def delete_item(item_id: int):
    return None  # 204 不应有 body
\`\`\`

常用状态码：

| 码 | 含义 | 场景 |
|---|---|---|
| 200 | OK | 默认成功 |
| 201 | Created | POST 创建资源 |
| 204 | No Content | DELETE 成功，无返回体 |
| 400 | Bad Request | 业务错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 冲突（如重复创建） |
| 422 | Unprocessable Entity | 请求体校验失败（FastAPI 自动） |
| 500 | Internal Server Error | 服务器异常 |

## 五、自定义响应类型

默认返回 dict 会被序列化成 JSON。要返回其他类型，用 \`Response\` 子类：

### JSONResponse

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.get("/custom-json")
async def custom_json():
    # 手动构造 JSONResponse，可自定义状态码和头
    return JSONResponse(
        status_code=200,
        content={"message": "自定义"},
        headers={"X-Custom-Header": "hello"},
    )
\`\`\`

### HTMLResponse

\`\`\`python
from fastapi.responses import HTMLResponse


@app.get("/page", response_class=HTMLResponse)
async def page():
    # 返回 HTML 字符串
    return "<html><body><h1>Hello</h1></body></html>"
\`\`\`

### PlainTextResponse

\`\`\`python
from fastapi.responses import PlainTextResponse


@app.get("/text", response_class=PlainTextResponse)
async def text():
    # 返回纯文本，Content-Type: text/plain
    return "纯文本内容"
\`\`\`

### 对比

| 响应类 | Content-Type | 用途 |
|---|---|---|
| 默认（dict） | application/json | JSON API |
| \`JSONResponse\` | application/json | 手动控制 |
| \`HTMLResponse\` | text/html | 渲染 HTML 页面 |
| \`PlainTextResponse\` | text/plain | 纯文本 |
| \`RedirectResponse\` | - | 重定向 |
| \`StreamingResponse\` | 可指定 | 流式 |
| \`FileResponse\` | 按文件扩展名 | 文件下载 |

## 六、流式响应 StreamingResponse

适合大文件、SSE（Server-Sent Events）、动态生成内容：

\`\`\`python
from fastapi.responses import StreamingResponse
import asyncio


@app.get("/stream")
async def stream():
    async def gen():
        # 异步生成器，逐块产出
        for i in range(5):
            await asyncio.sleep(0.5)  # 模拟耗时
            yield f"chunk {i}\\n"

    # media_type 指定 Content-Type
    return StreamingResponse(gen(), media_type="text/plain")
\`\`\`

### SSE（Server-Sent Events）

\`\`\`python
@app.get("/sse")
async def sse():
    async def event_stream():
        for i in range(10):
            # SSE 格式：data: 内容\\n\\n
            yield f"data: 消息 {i}\\n\\n"
            await asyncio.sleep(1)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",  # SSE 不缓存
            "Connection": "keep-alive",   # 长连接
        },
    )
\`\`\`

> SSE 关键：每个 \`data:\` 后必须跟 \`\\n\\n\`，浏览器才能识别为一条消息。

## 七、文件响应 FileResponse

\`\`\`python
from fastapi.responses import FileResponse
import os


@app.get("/download/{filename}")
async def download(filename: str):
    file_path = f"./uploads/{filename}"
    # 防路径穿越攻击
    base = os.path.abspath("./uploads")
    if not os.path.abspath(file_path).startswith(base):
        raise HTTPException(403, "禁止访问")

    # FileResponse 自动设置 Content-Type、Content-Length、支持断点续传
    # media_type 不传会按扩展名推断
    # filename 设置 Content-Disposition，浏览器会下载而非显示
    return FileResponse(
        path=file_path,
        filename=filename,  # 下载时的文件名
        media_type="application/octet-stream",
    )
\`\`\`

\`FileResponse\` vs \`StreamingResponse\`：

| 特性 | FileResponse | StreamingResponse |
|---|---|---|
| 自动 Content-Type | 是（按扩展名） | 否，需手动 |
| 自动 Content-Length | 是 | 否 |
| 断点续传（Range） | 是 | 否 |
| 适用 | 磁盘文件 | 自定义流、SSE |

文件下载优先用 \`FileResponse\`，它自动支持 Range 请求（断点续传、视频拖动）。

## 八、响应头与 Cookie

### 设置响应头

\`\`\`python
from fastapi import Response


@app.get("/with-headers")
async def with_headers(response: Response):
    # 通过 response 对象设置头（会合并到最终响应）
    response.headers["X-Total-Count"] = "100"
    response.headers["X-Request-ID"] = "abc123"
    return {"data": []}
\`\`\`

### 设置 Cookie

\`\`\`python
@app.post("/login")
async def login(response: Response):
    # 设置 cookie
    response.set_cookie(
        key="session_id",
        value="abc123",
        httponly=True,    # JS 不能读（防 XSS）
        secure=True,      # 只走 HTTPS
        samesite="lax",   # 防 CSRF
        max_age=3600,     # 1 小时过期
        path="/",
    )
    return {"message": "登录成功"}


@app.post("/logout")
async def logout(response: Response):
    # 删除 cookie
    response.delete_cookie(key="session_id")
    return {"message": "已登出"}
\`\`\`

Cookie 安全参数：

| 参数 | 作用 |
|---|---|
| \`httponly=True\` | JS 读不到，防 XSS 偷 cookie |
| \`secure=True\` | 只走 HTTPS |
| \`samesite="lax"/"strict"/"none"\` | 防 CSRF |
| \`max_age=秒\` | 过期时间 |
| \`domain\` | 作用域域名 |
| \`path\` | 作用路径 |

## 九、重定向 RedirectResponse

\`\`\`python
from fastapi.responses import RedirectResponse


@app.get("/old-page")
async def old_page():
    # 307 临时重定向（保留方法和 body）
    return RedirectResponse(url="/new-page", status_code=307)


@app.get("/new-page")
async def new_page():
    return {"message": "新页面"}


# 也可以 301 永久重定向（GET 为主）
@app.get("/legacy")
async def legacy():
    return RedirectResponse(url="https://example.com", status_code=301)
\`\`\`

重定向状态码：

| 码 | 含义 | 方法保留 |
|---|---|---|
| 301 | 永久重定向 | 否（POST 可能变 GET） |
| 302 | 临时重定向 | 否 |
| 307 | 临时重定向 | 是 |
| 308 | 永久重定向 | 是 |

## 十、自定义 Response 子类

需要重复用某种响应格式时，可自定义：

\`\`\`python
from fastapi.responses import Response


# 一个返回 CSV 的响应类
class CSVResponse(Response):
    media_type = "text/csv"

    def __init__(self, content: str, filename: str = "export.csv", **kwargs):
        super().__init__(
            content=content,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            **kwargs,
        )


@app.get("/export", response_class=CSVResponse)
async def export():
    csv_content = "id,name\\n1,Alice\\n2,Bob"
    return CSVResponse(content=csv_content, filename="users.csv")
\`\`\`

## 十一、实战：统一响应格式

很多团队喜欢统一响应结构（\`{code, message, data}\`）。可以用自定义响应类 + 依赖实现：

\`\`\`python
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()


class ApiResponse(JSONResponse):
    """统一响应：{"code":0,"message":"ok","data":...}"""
    def __init__(self, data=None, code: int = 0, message: str = "ok", status_code: int = 200):
        super().__init__(
            status_code=status_code,
            content={"code": code, "message": message, "data": data},
        )


class UserOut(BaseModel):
    id: int
    name: str


@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int):
    user = {"id": user_id, "name": "Alice"}
    # 用 ApiResponse 包装，但 response_model 仍生成文档
    return ApiResponse(data=user)
\`\`\`

> 注意：用了自定义 Response 后，\`response_model\` 的过滤不再生效（因为绕过了默认序列化）。要两者兼得，需要自己处理。一般推荐：保持 \`response_model\`，统一格式交给中间件或客户端封装。

## 十二、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| response_model 不生效 | 用了自定义 Response 子类 | 自己处理或用默认 JSON |
| 204 还返回了 body | status_code=204 但 return 了值 | 204 不返回内容 |
| FileResponse 中文文件名乱码 | 浏览器编码差异 | FileResponse 自动处理，别手动拼 |
| StreamingResponse 不支持断点续传 | 设计如此 | 文件用 FileResponse |
| SSE 浏览器收不到 | 缺 \`\\n\\n\` | 每条 data 后加空行 |
| Cookie 设了但读不到 | httponly 或 path 不对 | 检查参数 |
| redirect 后还执行代码 | return 漏了 | return RedirectResponse(...) |

## 十三、设计思想

响应处理的设计核心是「**输入输出契约对称**」。\`response_model\` 让输出和输入一样有类型约束，形成完整的契约闭环：请求体用 Pydantic 模型校验输入，响应模型用 Pydantic 模型规范输出，文档从两端类型自动生成。这种对称设计让 API 的「形状」完全由代码定义，前后端协作成本降到最低。

各种 Response 子类的存在，体现了「**默认简单，需要时强大**」的渐进式设计。日常返回 dict 即可（自动 JSON），需要 HTML、流、文件、重定向时再选对应类。框架不强迫你一开始就做复杂选择，但能力都备着。
`,
  },

  // ============================================================
  // 第 5 章：依赖注入系统详解
  // ============================================================
  {
    id: "pyweb2-fastapi-di",
    group: "FastAPI 核心",
    icon: "💉",
    title: "依赖注入系统详解",
    content: `
## 一、依赖注入概念

**依赖注入**（Dependency Injection, DI）是一种设计模式：把组件需要的「依赖」从外部传入，而不是组件自己创建。FastAPI 的 DI 系统让你把通用逻辑（认证、数据库会话、分页、限流）封装成「依赖」，在路由函数签名里声明需要它，框架自动调用并注入结果。

为什么需要 DI？看一个反例：

\`\`\`python
# ❌ 没有 DI：每个接口都要重复写认证和分页逻辑
@app.get("/users")
async def list_users(token: str = Header()):
    # 1. 认证逻辑（重复）
    user = verify_token(token)
    if not user:
        raise HTTPException(401)
    # 2. 分页逻辑（重复）
    skip = int(Query(default=0))
    limit = int(Query(default=10))
    # 3. 业务逻辑
    return db.query(skip, limit)


@app.get("/orders")
async def list_orders(token: str = Header()):
    user = verify_token(token)  # 又写一遍
    if not user:
        raise HTTPException(401)
    # ...
\`\`\`

用 DI 后：

\`\`\`python
# ✅ 有 DI：认证和分页封装成依赖，复用
async def verify_user(token: str = Header()):
    user = verify_token(token)
    if not user:
        raise HTTPException(401)
    return user


@app.get("/users")
async def list_users(user = Depends(verify_user)):  # 声明依赖
    return db.query()


@app.get("/orders")
async def list_orders(user = Depends(verify_user)):  # 复用
    return db.query_orders()
\`\`\`

DI 的好处：

1. **复用**：通用逻辑写一次，多处用。
2. **解耦**：业务函数不关心依赖怎么来的。
3. **可测试**：测试时可以替换依赖（mock）。
4. **可组合**：依赖可以依赖其他依赖（链式）。

## 二、Depends 基本用法

\`Depends\` 是 DI 的入口。它接收一个「依赖函数」，FastAPI 在请求时调用它，把返回值注入：

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()


# 依赖函数：可以有自己的参数（也会被解析）
def common_parameters(q: str | None = None, skip: int = 0, limit: int = 10):
    return {"q": q, "skip": skip, "limit": limit}


@app.get("/items/")
async def read_items(commons = Depends(common_parameters)):
    # commons 是 common_parameters 的返回值
    return {"message": "items", "params": commons}


@app.get("/users/")
async def read_users(commons = Depends(common_parameters)):
    return {"message": "users", "params": commons}
\`\`\`

请求 \`/items/?q=phone&skip=0&limit=5\`：

1. FastAPI 看到 \`Depends(common_parameters)\`。
2. 调用 \`common_parameters(q="phone", skip=0, limit=5)\`（参数从请求解析）。
3. 把返回值 \`{"q":"phone","skip":0,"limit":5}\` 赋给 \`commons\`。
4. 调用 \`read_items(commons=...)\`。

依赖函数的参数也支持类型提示和校验，和路由函数一样：

\`\`\`python
def common_parameters(
    q: str | None = Query(default=None, max_length=50),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
):
    return {"q": q, "skip": skip, "limit": limit}
\`\`\`

### Annotated 写法（推荐）

FastAPI 推荐用 \`Annotated\` 让依赖更清晰：

\`\`\`python
from typing import Annotated


# 用 Annotated 定义可复用的依赖类型
CommonParams = Annotated[dict, Depends(common_parameters)]


@app.get("/items/")
async def read_items(commons: CommonParams):  # 简洁
    return commons
\`\`\`

## 三、依赖嵌套（依赖链）

依赖可以依赖其他依赖，形成链：

\`\`\`python
# 依赖 1：解析 query 参数
def query_extractor(q: str | None = None):
    return q


# 依赖 2：依赖 query_extractor
def query_validator(q: str = Depends(query_extractor)):
    if q and len(q) > 50:
        raise HTTPException(400, "q 太长")
    return q


@app.get("/search")
async def search(q: str = Depends(query_validator)):
    return {"q": q}
\`\`\`

FastAPI 会按顺序解析：\`query_extractor\` → \`query_validator\` → \`search\`。中间任何一步抛异常都会中断。

## 四、类作为依赖

类也能当依赖，FastAPI 会实例化并注入：

\`\`\`python
class CommonQueryParams:
    def __init__(self, q: str | None = None, skip: int = 0, limit: int = 10):
        self.q = q
        self.skip = skip
        self.limit = limit


# Depends(CommonQueryParams) 会调用 __init__，参数从请求解析
@app.get("/items/")
async def read_items(commons: CommonQueryParams = Depends(CommonQueryParams)):
    return {"q": commons.q, "skip": commons.skip, "limit": commons.limit}


# 简写：Depends() 不传参，自动用类型注解的类
@app.get("/users/")
async def read_users(commons: CommonQueryParams = Depends()):
    return commons
\`\`\`

类依赖适合封装有状态的对象（如分页器、查询构造器）。

### 依赖的依赖（类版本）

\`\`\`python
class LoggedUser:
    def __init__(self, token: str = Header()):
        self.user = verify_token(token)  # 实际校验
        if not self.user:
            raise HTTPException(401)


class Pagination:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit


@app.get("/orders")
async def list_orders(
    user: LoggedUser = Depends(),       # 类依赖
    page: Pagination = Depends(),       # 类依赖
):
    # user 和 page 都已校验/构造好
    return {"user": user.user, "skip": page.skip}
\`\`\`

## 五、Yield 依赖（资源清理）

用 \`yield\` 的依赖可以在请求结束后执行清理（关闭连接、释放资源）：

\`\`\`python
# 数据库会话依赖
def get_db():
    db = SessionLocal()  # 创建会话
    try:
        yield db          # 把会话注入给路由
    finally:
        db.close()        # 路由执行完后，关闭会话


@app.get("/users")
async def list_users(db = Depends(get_db)):
    # db 是 yield 出来的 SessionLocal 实例
    return db.query(User).all()
\`\`\`

执行顺序：

1. 请求来 → \`get_db\` 执行到 \`yield db\`，\`db\` 注入路由。
2. 路由执行完，返回响应。
3. FastAPI 回到 \`get_db\` 的 \`finally\`，执行 \`db.close()\`。

### 多个 yield 依赖的顺序

\`\`\`python
def dep_a():
    print("A start")
    try:
        yield "a"
    finally:
        print("A cleanup")


def dep_b():
    print("B start")
    try:
        yield "b"
    finally:
        print("B cleanup")


@app.get("/")
async def root(a = Depends(dep_a), b = Depends(dep_b)):
    print("route")
    return {"a": a, "b": b}
\`\`\`

输出顺序：

\`\`\`
A start
B start
route
B cleanup  （后启动的先清理，类似栈）
A cleanup
\`\`\`

清理是**栈式**的（后启动的先清理），保证资源依赖顺序正确。

### yield 依赖捕获异常

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()  # 路由抛异常，回滚
        raise          # 重新抛出
    finally:
        db.close()
\`\`\`

## 六、全局依赖

### App 级别

\`\`\`python
# 所有接口都执行 verify_token
app = FastAPI(dependencies=[Depends(verify_token)])


@app.get("/public")  # 也会执行 verify_token
async def public():
    return {"msg": "公开但也要认证"}
\`\`\`

### Router 级别

\`\`\`python
router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(verify_admin)],  # 该 router 所有接口都要管理员权限
)


@router.get("/stats")
async def stats():
    return {"users": 100}  # 不用再写 Depends
\`\`\`

### 路径级别

\`\`\`python
# 单个接口加依赖
@app.get("/secret", dependencies=[Depends(verify_admin)])
async def secret():
    return {"data": "机密"}
\`\`\`

注意：路径级依赖如果不需要返回值，就不用在函数签名里写参数，只写 \`dependencies=[Depends(...)]\` 即可（纯校验型）。

## 七、依赖覆盖（测试时）

测试时不希望真连数据库或真发邮件，用 \`app.dependency_overrides\` 替换依赖：

\`\`\`python
# 生产代码 main.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/users")
async def list_users(db = Depends(get_db)):
    return db.query(User).all()
\`\`\`

\`\`\`python
# 测试代码 test_main.py
from fastapi.testclient import TestClient
from main import app, get_db


# 替换 get_db，返回 mock
def override_get_db():
    class FakeDB:
        def query(self, _):
            class Q:
                @staticmethod
                def all():
                    return [{"id": 1, "name": "mock"}]
            return Q()
    yield FakeDB()


# 注册覆盖
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_list_users():
    response = client.get("/users")
    assert response.json() == [{"id": 1, "name": "mock"}]


# 测试完清理
# app.dependency_overrides.clear()
\`\`\`

这是 FastAPI DI 最强大的特性之一：**业务代码完全不知道被 mock 了**，零侵入测试。

## 八、实战 1：认证依赖

JWT token 认证是经典场景：

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
import jwt  # pip install pyjwt

app = FastAPI()
SECRET = "your-secret-key"


class TokenUser(BaseModel):
    username: str
    role: str


# OAuth2 密码流依赖（FastAPI 内置 OAuth2PasswordBearer）
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# 认证依赖
async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenUser:
    """从 token 解析当前用户，失败抛 401"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        username = payload.get("sub")
        role = payload.get("role")
        if username is None:
            raise credentials_exception
        return TokenUser(username=username, role=role)
    except jwt.PyJWTError:
        raise credentials_exception


# 角色校验依赖（依赖 get_current_user）
async def get_admin_user(user: TokenUser = Depends(get_current_user)) -> TokenUser:
    if user.role != "admin":
        raise HTTPException(403, "需要管理员权限")
    return user


# 普通接口：只要登录
@app.get("/me")
async def me(user: TokenUser = Depends(get_current_user)):
    return user


# 管理接口：需要管理员
@app.get("/admin/users", dependencies=[Depends(get_admin_user)])
async def admin_users():
    return {"users": "all users list"}
\`\`\`

## 九、实战 2：分页依赖

分页逻辑复用：

\`\`\`python
from fastapi import Query
from typing import Annotated
from dataclasses import dataclass


@dataclass
class Pagination:
    skip: int
    limit: int
    page: int  # 计算属性


def get_pagination(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, alias="pageSize")] = 20,
) -> Pagination:
    return Pagination(
        skip=(page - 1) * page_size,
        limit=page_size,
        page=page,
    )


# 可复用的依赖类型别名
PaginationDep = Annotated[Pagination, Depends(get_pagination)]


@app.get("/products")
async def list_products(page: PaginationDep):
    # page.skip, page.limit 直接用
    return {"skip": page.skip, "limit": page.limit}
\`\`\`

## 十、实战 3：数据库会话依赖

SQLAlchemy 集成的标准模式：

\`\`\`python
from typing import Annotated
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi import FastAPI, Depends

# 创建引擎和会话工厂
engine = create_engine("sqlite:///./app.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# 数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 可复用类型
DbDep = Annotated[SessionLocal.__class__, Depends(get_db)]


@app.get("/users")
async def list_users(db = Depends(get_db)):
    # db 是 SQLAlchemy Session
    return db.execute("SELECT * FROM users").fetchall()


@app.post("/users")
async def create_user(name: str, db = Depends(get_db)):
    db.execute("INSERT INTO users (name) VALUES (:name)", {"name": name})
    db.commit()
    return {"created": name}
\`\`\`

## 十一、实战 4：限流依赖

\`\`\`python
import time
from collections import defaultdict


# 简单内存限流（生产用 Redis）
request_counts: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 60  # 每分钟 60 次


def rate_limiter(client_ip: str = Header(alias="X-Forwarded-For", default="unknown")):
    now = time.time()
    window = 60
    # 清理过期记录
    request_counts[client_ip] = [t for t in request_counts[client_ip] if now - t < window]
    if len(request_counts[client_ip]) >= RATE_LIMIT:
        raise HTTPException(429, "请求过于频繁")
    request_counts[client_ip].append(now)
    return client_ip


# 全局限流
app = FastAPI(dependencies=[Depends(rate_limiter)])
\`\`\`

## 十二、依赖缓存

FastAPI 在**同一个请求内**缓存依赖结果。同一个依赖被声明多次，只执行一次：

\`\`\`python
def expensive():
    print("执行昂贵操作")
    return {"data": "..."}


@app.get("/")
async def root(
    a = Depends(expensive),
    b = Depends(expensive),  # 不会重复执行，复用 a 的结果
):
    assert a is b  # True，同一个对象
    return {"a": a, "b": b}
\`\`\`

如果需要每次都重新执行（如随机数），用 \`use_cache=False\`：

\`\`\`python
def random_dep():
    return random.random()

@app.get("/")
async def root(
    a = Depends(random_dep, use_cache=False),
    b = Depends(random_dep, use_cache=False),  # 重新执行，结果不同
):
    return {"a": a, "b": b}
\`\`\`

## 十三、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 依赖没执行 | 忘了 \`Depends()\` | 类依赖也要 \`Depends()\` 或显式 \`Depends(Cls)\` |
| yield 依赖清理没跑 | 异常被吞 | 确保 yield 后代码能执行 |
| 测试时依赖没替换 | 覆盖注册时机错 | 在 TestClient 创建前注册 |
| 依赖缓存导致 bug | 同一请求复用 | 需要 fresh 用 \`use_cache=False\` |
| 全局依赖报错全部 500 | 依赖太重 | 全局依赖只放轻量校验 |
| 类依赖 \`\_\_init\_\_\` 参数识别错 | 类型没注解 | 加类型提示 |

## 十四、设计思想

FastAPI 的 DI 系统设计精髓是「**函数即依赖**」。不像 Spring 那种重型容器（XML/注解/Bean 工厂），FastAPI 的依赖就是普通函数或类，\`Depends\` 一包就能用。这种轻量设计让 DI 的门槛极低——会写函数就会用 DI。

它的「依赖缓存」和「栈式清理」体现了对请求生命周期的精准把控：一个请求内的依赖是单例（省资源），跨请求隔离（保安全）；yield 依赖的栈式清理保证了资源释放顺序与获取顺序相反，符合「后获取的先释放」的资源管理铁律。

\`app.dependency_overrides\` 是测试友好性的关键。它让测试可以**不动一行业务代码**就替换掉数据库、外部 API、邮件服务，这种零侵入可测性是工程化的重要标志。一个框架是否适合大型项目，很大程度上看它的 DI 和可测性设计。
`,
  },

  // ============================================================
  // 第 6 章：中间件与 CORS
  // ============================================================
  {
    id: "pyweb2-fastapi-middleware",
    group: "FastAPI 核心",
    icon: "🧱",
    title: "中间件与 CORS",
    content: `
## 一、中间件概念（洋葱模型）

中间件（Middleware）是「包裹」整个应用的代码层，每个请求**先经过中间件，再到路由**；响应**先经过中间件，再返回客户端」。多个中间件像洋葱一样层层包裹：

\`\`\`
请求 → [中间件1] → [中间件2] → [中间件3] → 路由函数
响应 ← [中间件1] ← [中间件2] ← [中间件3] ← 路由函数
\`\`\`

每个中间件可以在「请求前」和「响应后」做事情：

- 请求前：记录日志、认证、限流、修改请求头。
- 响应后：添加响应头、记录耗时、压缩响应。

中间件 vs 依赖：

| 维度 | 中间件 | 依赖 |
|---|---|---|
| 作用范围 | 所有请求（含 404） | 单个路由 |
| 执行时机 | 路由匹配前 | 路由匹配后 |
| 能否拒绝请求 | 能（直接返回响应） | 能（抛异常） |
| 能否修改响应 | 能 | 部分（通过 Response 对象） |
| 性能开销 | 每请求都过 | 只声明的路由 |
| 适合 | 全局横切关注点 | 路由级复用逻辑 |

## 二、@app.middleware("http") 用法

\`\`\`python
import time
from fastapi import FastAPI, Request

app = FastAPI()


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # 请求前：记录开始时间
    start = time.time()

    # call_next 把请求传给下一层（中间件或路由）
    response = await call_next(request)

    # 响应后：计算耗时，加到响应头
    duration = time.time() - start
    response.headers["X-Process-Time"] = f"{duration:.4f}"
    return response
\`\`\`

执行流程：

1. 请求进来 → 进入 \`add_process_time_header\`。
2. \`start = time.time()\` 记录开始。
3. \`await call_next(request)\` 把请求交给下一层（洋葱心）。
4. 下一层（路由）处理后返回 \`response\`。
5. 给 \`response\` 加头，返回。

### 提前返回（拦截请求）

中间件可以不调用 \`call_next\`，直接返回响应，阻断后续：

\`\`\`python
from fastapi.responses import JSONResponse


@app.middleware("http")
async def block_blacklist(request: Request, call_next):
    # IP 黑名单
    client_ip = request.client.host
    if client_ip in BLACKLIST:
        return JSONResponse(status_code=403, content={"detail": "禁止访问"})
    # 不在黑名单，继续
    return await call_next(request)
\`\`\`

## 三、中间件执行顺序

中间件按**注册顺序的逆序**执行（后注册的最外层）：

\`\`\`python
@app.middleware("http")
async def mw_a(request, call_next):
    print("A 请求前")
    resp = await call_next(request)
    print("A 响应后")
    return resp


@app.middleware("http")
async def mw_b(request, call_next):
    print("B 请求前")
    resp = await call_next(request)
    print("B 响应后")
    return resp
\`\`\`

输出：

\`\`\`
B 请求前   （后注册的先执行，最外层）
A 请求前
（路由执行）
A 响应后
B 响应后
\`\`\`

记忆口诀：**后注册的在外层**（像穿衣服，后穿的外面）。

## 四、内置中间件

### 1. CORS 中间件（最常用）

跨域资源共享（CORS）解决浏览器同源策略限制：

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com", "https://www.example.com"],
    # 或允许全部（开发用，生产别用）
    # allow_origins=["*"],
    allow_credentials=True,   # 允许带 cookie
    allow_methods=["*"],      # 允许所有方法
    allow_headers=["*"],      # 允许所有头
)
\`\`\`

CORS 参数详解：

| 参数 | 作用 | 注意 |
|---|---|---|
| \`allow_origins\` | 允许的源（协议+域名+端口） | \`["*"]\` 不能配合 \`allow_credentials=True\` |
| \`allow_credentials\` | 允许带 cookie/Authorization | 生产建议 True，但 origins 不能是 * |
| \`allow_methods\` | 允许的 HTTP 方法 | \`["*"]\` 表示全部 |
| \`allow_headers\` | 允许的请求头 | \`["*"]\` 表示全部 |
| \`expose_headers\` | 允许前端读取的响应头 | 默认只能读基本头 |
| \`max_age\` | 预检请求缓存秒数 | 减少预检请求 |

### CORS 原理

浏览器跨域请求时分两种：

**简单请求**（GET/POST + 简单头）：直接发请求，响应要有 \`Access-Control-Allow-Origin\` 才让 JS 读。

**预检请求**（PUT/DELETE 或自定义头）：浏览器先发 \`OPTIONS\` 询问服务器是否允许，服务器返回允许的策略，浏览器才发真实请求。

CORS 中间件自动处理这两种情况，你只要配策略。

### 2. GZip 中间件

压缩响应，减小传输体积：

\`\`\`python
from fastapi.middleware.gzip import GZipMiddleware

# 响应超过 1000 字节才压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)
\`\`\`

适合文本响应（JSON、HTML），已压缩的二进制（图片、视频）不会再压缩。

### 3. TrustedHost 中间件

防止 Host 头攻击：

\`\`\`python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "www.example.com", "*.example.com"],
)
\`\`\`

请求的 Host 头不在白名单，返回 400。

### 4. HTTPSRedirect 中间件

强制 HTTPS：

\`\`\`python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
\`\`\`

HTTP 请求会被 307 重定向到 HTTPS。生产环境（已上 HTTPS）才用。

### 5. Session 中间件

\`\`\`python
from starlette.middleware.sessions import SessionMiddleware

app.add_middleware(SessionMiddleware, secret_key="your-secret", max_age=3600)
\`\`\`

签名 cookie 存储 session，\`request.session\` 读写。

## 五、自定义中间件

### 1. 请求 ID 中间件（日志追踪）

\`\`\`python
import uuid
from fastapi import Request


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    # 从头读，没有就生成
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    # 存到 request.state，路由里能访问
    request.state.request_id = request_id

    response = await call_next(request)
    # 响应头也带上，方便客户端追踪
    response.headers["X-Request-ID"] = request_id
    return response


# 路由里访问
@app.get("/")
async def root(request: Request):
    rid = request.state.request_id
    return {"request_id": rid}
\`\`\`

### 2. 日志中间件

\`\`\`python
import logging
import time

logger = logging.getLogger("api")


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start = time.time()
    # 捕获异常也要记录
    try:
        response = await call_next(request)
        duration = (time.time() - start) * 1000
        logger.info(
            f"{request.method} {request.url.path} "
            f"status={response.status_code} duration={duration:.2f}ms"
        )
        return response
    except Exception as e:
        duration = (time.time() - start) * 1000
        logger.exception(
            f"{request.method} {request.url.path} "
            f"error={e} duration={duration:.2f}ms"
        )
        raise
\`\`\`

### 3. 计时中间件

\`\`\`python
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    # 慢请求告警
    if duration_ms > 1000:
        logger.warning(f"慢请求 {request.url.path} 耗时 {duration_ms:.0f}ms")
    response.headers["X-Duration"] = f"{duration_ms:.2f}"
    return response
\`\`\`

### 4. 纯 ASGI 中间件类

高性能场景用纯 ASGI 类（比 \`@app.middleware\` 快，因为它绕过 Request 对象）：

\`\`\`python
from starlette.types import ASGIApp, Receive, Scope, Send


class TimingMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.time()

        # 包装 send 函数，拦截响应头加自定义头
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # 在响应头里加 X-Duration
                headers = message.get("headers", [])
                duration = f"{(time.time() - start) * 1000:.2f}"
                headers.append((b"x-duration", duration.encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)


app.add_middleware(TimingMiddleware)
\`\`\`

## 六、中间件 vs 依赖：怎么选

| 场景 | 推荐 |
|---|---|
| 全局日志、计时、请求 ID | 中间件 |
| 认证（只对部分接口） | 依赖 |
| CORS、GZip、Session | 中间件（内置） |
| 分页、数据库会话 | 依赖 |
| 限流（全局） | 中间件 |
| 限流（按用户） | 依赖 |
| 修改响应头（全局） | 中间件 |
| 业务校验 | 依赖 |

原则：**全局横切用中间件，路由复用用依赖**。中间件性能开销更大（每个请求都过），但能处理 404 等非路由请求；依赖更精确但只对声明它的路由生效。

## 七、中间件实战：完整生产配置

\`\`\`python
import time
import uuid
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

logger = logging.getLogger("api")

# 1. TrustedHost（最先加，最外层）
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.example.com", "*.example.com"],
)

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. GZip 压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)


# 4. 请求 ID + 日志（函数中间件）
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id

    start = time.time()
    try:
        response = await call_next(request)
    except Exception as e:
        logger.exception(f"[{request_id}] {request.method} {request.url.path} error={e}")
        raise

    duration = (time.time() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{duration:.2f}ms"

    logger.info(
        f"[{request_id}] {request.method} {request.url.path} "
        f"status={response.status_code} duration={duration:.2f}ms"
    )
    return response
\`\`\`

## 八、CORS 排错指南

CORS 是前端最常遇到的报错来源。常见问题：

| 错误 | 原因 | 解决 |
|---|---|---|
| \"No 'Access-Control-Allow-Origin'\" | 没配 CORS 或 origin 不在允许列表 | 加 CORSMiddleware，配 allow_origins |
| \"Credentials flag is true, but Allow-Origin is *\" | credentials=True 时不能用 * | 列出具体 origin |
| 预检请求 OPTIONS 401 | 认证中间件拦截了 OPTIONS | CORS 中间件要在认证前，或放行 OPTIONS |
| 自定义头读不到 | 没配 expose_headers | 加 expose_headers=["X-Total-Count"] |
| cookie 跨域带不上 | credentials 没开 + cookie 域不对 | allow_credentials=True + cookie samesite=None |

调试技巧：浏览器开发者工具 Network 面板看 OPTIONS 请求的响应头，\`Access-Control-Allow-*\` 是否齐全。

## 九、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 中间件顺序混乱 | 后注册在外层 | 按需调整注册顺序 |
| 中间件里读 body 后路由读不到 | body 是流，读一次就没了 | 用 \`request.body()\` 缓存或重写 receive |
| 中间件抛异常没日志 | 没 try/except | 包 try/except 记录 |
| CORS 配了还不生效 | 中间件顺序错 | CORS 要在认证前 |
| GZip 没压缩小响应 | minimum_size 太大 | 调小 minimum_size |
| TrustedHost 拦截本地 | 开发时 localhost 不在列表 | 开发环境配 \`["*"]\` 或加 localhost |

### 读 body 的坑

中间件里读 \`request.body()\` 会消费流，路由再读就读不到了。解决：

\`\`\`python
@app.middleware("http")
async def log_body(request: Request, call_next):
    # 缓存 body
    body = await request.body()

    # 重写 receive，让路由能再读
    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    request._receive = receive

    response = await call_next(request)
    return response
\`\`\`

> 这是个 hack，生产慎用。能不读 body 就别读。

## 十、设计思想

中间件的洋葱模型是 Web 框架的通用模式（Express、Koa、Django、Spring 都有），它体现了「**横切关注点分离**」的思想：日志、认证、压缩这些和业务无关的逻辑，不应该混进路由函数。中间件让它们成为独立的「层」，可以单独开关、单独测试、单独替换。

FastAPI 的中间件来自 Starlette，提供了两个层次：\`@app.middleware("http")\` 简单易用（适合大多数场景），纯 ASGI 类高性能（适合极致优化）。这种「简单路径 + 逃生舱」的设计，让开发者按需选择复杂度，不会被框架绑死。

CORS 之所以重要，是因为它是**浏览器安全模型**的产物，不是服务端的错。理解 CORS 要从浏览器同源策略入手：浏览器为了防止恶意网站读取其他网站的数据，限制跨域 JS 请求。CORS 是服务器「主动放行」的机制。服务端不配 CORS，浏览器就拦——这不是 bug，是特性。
`,
  },

  // ============================================================
  // 第 7 章：异步路由与后台任务
  // ============================================================
  {
    id: "pyweb2-fastapi-async",
    group: "FastAPI 核心",
    icon: "⚡",
    title: "异步路由与后台任务",
    content: `
## 一、async def 路由函数

FastAPI 基于 ASGI，原生支持异步。路由函数用 \`async def\` 定义：

\`\`\`python
from fastapi import FastAPI
import asyncio

app = FastAPI()


# async def 定义异步路由
@app.get("/")
async def root():
    # await 等待异步操作
    await asyncio.sleep(0.1)  # 模拟异步 IO
    return {"message": "hello"}
\`\`\`

\`async def\` 函数是**协程**（coroutine），由事件循环调度。 \`await\` 暂停当前协程，让出 CPU 给其他协程，等异步操作完成再恢复。

\`\`\`python
# 并发执行多个异步操作
async def fetch_user(user_id: int):
    await asyncio.sleep(0.5)  # 模拟查数据库
    return {"id": user_id}


async def fetch_orders(user_id: int):
    await asyncio.sleep(0.5)  # 模拟查订单
    return [{"order_id": 1}]


@app.get("/users/{user_id}")
async def get_user_detail(user_id: int):
    # 串行：总耗时 1 秒
    user = await fetch_user(user_id)
    orders = await fetch_orders(user_id)
    return {"user": user, "orders": orders}


@app.get("/users/{user_id}/fast")
async def get_user_detail_fast(user_id: int):
    # 并发：总耗时 0.5 秒（用 asyncio.gather）
    user, orders = await asyncio.gather(
        fetch_user(user_id),
        fetch_orders(user_id),
    )
    return {"user": user, "orders": orders}
\`\`\`

\`asyncio.gather\` 是异步并发的关键——多个 IO 操作同时进行，总耗时约等于最慢的那个，而不是相加。

## 二、何时用 async、何时用同步 def

FastAPI 同时支持 \`async def\` 和普通 \`def\`：

\`\`\`python
# 异步路由
@app.get("/async")
async def async_route():
    return {"msg": "async"}


# 同步路由
@app.get("/sync")
def sync_route():
    return {"msg": "sync"}
\`\`\`

两者的区别：

| 维度 | \`async def\` | \`def\` |
|---|---|---|
| 执行环境 | 事件循环（主线程） | 线程池（独立线程） |
| 是否阻塞事件循环 | 阻塞会卡住所有请求 | 不阻塞主循环 |
| 能否 await | 能 | 不能 |
| 适合 | IO 密集（异步库） | CPU 密集 / 同步库 |
| 性能 | 异步库时高 | 一般 |

**选择原则**：

- **用了异步库**（异步数据库、httpx、aioredis）→ \`async def\`。
- **只能用同步库**（如传统 SQLAlchemy、requests）→ 普通 \`def\`，FastAPI 自动放线程池，不阻塞事件循环。
- **CPU 密集计算**（图像处理、加密）→ 普通 \`def\`，或用 \`run_in_threadpool\`。

### 错误示范：在 async 里调用同步阻塞代码

\`\`\`python
import time


# ❌ 危险：async 路由里用 time.sleep 阻塞事件循环
@app.get("/bad")
async def bad():
    time.sleep(5)  # 阻塞整个事件循环 5 秒，其他请求全卡住
    return {"msg": "done"}


# ✅ 正确 1：用 asyncio.sleep（非阻塞）
@app.get("/good-async")
async def good_async():
    await asyncio.sleep(5)  # 让出 CPU，其他请求能处理
    return {"msg": "done"}


# ✅ 正确 2：同步路由，FastAPI 放线程池
@app.get("/good-sync")
def good_sync():
    time.sleep(5)  # 在线程池，不阻塞事件循环
    return {"msg": "done"}


# ✅ 正确 3：在 async 里用 run_in_threadpool
from fastapi.concurrency import run_in_threadpool


@app.get("/good-threadpool")
async def good_threadpool():
    # 把同步阻塞函数丢到线程池
    await run_in_threadpool(time.sleep, 5)
    return {"msg": "done"}
\`\`\`

**核心铁律**：\`async def\` 函数体里**绝对不能直接调用同步阻塞代码**（time.sleep、requests.get、同步数据库查询），否则事件循环被卡住，整个服务假死。

## 三、异步数据库 / HTTP 调用

### 异步 HTTP 客户端：httpx

\`\`\`python
import httpx


@app.get("/weather")
async def weather():
    # 异步 HTTP 请求
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.weather.com/current")
        return resp.json()
\`\`\`

\`httpx.AsyncClient\` 是异步的，不会阻塞事件循环。在 async 路由里**不要用 \`requests\`**（它是同步的）。

### 异步 Redis：redis.asyncio

\`\`\`python
from redis.asyncio import Redis


redis = Redis(host="localhost", port=6379)


@app.get("/cached")
async def cached():
    # 异步读 Redis
    value = await redis.get("mykey")
    return {"value": value}
\`\`\`

### 异步数据库：SQLAlchemy 2.0 async

\`\`\`python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker


# asyncpg 驱动（PostgreSQL）
engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession)


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


@app.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    # 异步查询
    result = await db.execute("SELECT * FROM users")
    return result.fetchall()
\`\`\`

### 并发请求多个外部服务

\`\`\`python
@app.get("/aggregate")
async def aggregate():
    # 并发调用 3 个外部 API，总耗时 = max(3 个) 而非 sum
    async with httpx.AsyncClient() as client:
        user, orders, profile = await asyncio.gather(
            client.get("https://api/users/1"),
            client.get("https://api/orders/1"),
            client.get("https://api/profile/1"),
        )
    return {
        "user": user.json(),
        "orders": orders.json(),
        "profile": profile.json(),
    }
\`\`\`

## 四、BackgroundTasks（简单后台任务）

有些操作不需要在返回响应前完成（发邮件、写日志、清理缓存），可以用 \`BackgroundTasks\` 在响应后执行：

\`\`\`python
from fastapi import BackgroundTasks


def send_email(to: str, subject: str):
    # 模拟发邮件（耗时）
    import time
    time.sleep(2)
    print(f"邮件已发往 {to}: {subject}")


@app.post("/register")
async def register(email: str, background: BackgroundTasks):
    # 注册逻辑同步完成
    # 把发邮件任务加到后台，不阻塞响应
    background.add_task(send_email, email, "欢迎注册")

    # 立即返回，不等邮件发完
    return {"message": "注册成功，邮件稍后发送"}
\`\`\`

\`BackgroundTasks\` 特点：

- 在响应**返回后**执行（用户已经收到响应）。
- 同一进程内执行（重启会丢失）。
- 适合轻量、可丢失的任务。
- 按添加顺序执行（串行）。

### 异步后台任务

\`\`\`python
async def async_task(data):
    await asyncio.sleep(1)
    print(f"处理 {data}")


@app.post("/process")
async def process(data: str, background: BackgroundTasks):
    # 添加异步函数也行，FastAPI 会 await
    background.add_task(async_task, data)
    return {"status": "已接收"}
\`\`\`

### 依赖里加后台任务

\`\`\`python
def write_log(background: BackgroundTasks, request: Request):
    # 在依赖里也能加后台任务
    background.add_task(save_log, request.url.path)
    return True


@app.get("/", dependencies=[Depends(write_log)])
async def root():
    return {"msg": "ok"}
\`\`\`

## 五、async generator 流式响应

异步生成器配合 \`StreamingResponse\` 实现流式输出：

\`\`\`python
from fastapi.responses import StreamingResponse


@app.get("/stream-data")
async def stream_data():
    async def generate():
        for i in range(10):
            await asyncio.sleep(0.5)  # 模拟异步获取数据
            yield f"data: 第 {i} 条\\n\\n"

    return StreamingResponse(generate(), media_type="text/plain")
\`\`\`

### SSE（Server-Sent Events）

\`\`\`python
@app.get("/events")
async def events():
    async def event_stream():
        while True:
            # 模拟实时推送
            await asyncio.sleep(1)
            yield f"data: 时间 {time.time()}\\n\\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
\`\`\`

前端用 \`EventSource\` 接收：

\`\`\`javascript
const es = new EventSource("/events");
es.onmessage = (e) => console.log(e.data);
\`\`\`

## 六、任务队列简介

\`BackgroundTasks\` 适合轻量任务，但有局限：

- 进程重启会丢失。
- 不能分布式执行。
- 不能重试、不能调度。
- 不能监控进度。

生产环境用**任务队列**：

| 框架 | Broker | 特点 | 适合 |
|---|---|---|---|
| **Celery** | Redis/RabbitMQ | 老牌、功能全、生态成熟 | 大型项目、复杂任务 |
| **ARQ** | Redis | 原生异步、轻量 | FastAPI 项目、轻量异步 |
| **Dramatiq** | Redis/RabbitMQ | 稳定可靠、API 简洁 | 中型项目 |
| **RQ** | Redis | 简单易用 | 小型项目 |

### ARQ 示例（最适合 FastAPI）

\`\`\`python
# worker.py
from arq import create_pool
from arq.connections import RedisSettings


# 任务函数（异步）
async def send_welcome_email(ctx, email: str):
    await asyncio.sleep(2)
    print(f"欢迎邮件已发给 {email}")


# Worker 配置
class WorkerSettings:
    functions = [send_welcome_email]
    redis_settings = RedisSettings()


# 启动 worker：arq worker.WorkerSettings
\`\`\`

\`\`\`python
# main.py
from arq import create_pool


@app.post("/register")
async def register(email: str):
    # 把任务丢给队列，立即返回
    redis = await create_pool(RedisSettings)
    await redis.enqueue_job("send_welcome_email", email)
    return {"status": "已入队"}
\`\`\`

### Celery 示例

\`\`\`python
# tasks.py
from celery import Celery

celery = Celery("tasks", broker="redis://localhost:6379/0")


@celery.task
def send_email(to, subject):
    # 同步任务函数
    import time
    time.sleep(2)
    print(f"邮件发往 {to}: {subject}")
\`\`\`

\`\`\`python
# main.py
from tasks import send_email


@app.post("/register")
async def register(email: str):
    # .delay() 异步投递
    send_email.delay(email, "欢迎注册")
    return {"status": "已投递"}
\`\`\`

### 选择建议

- **轻量、可丢失、单进程** → \`BackgroundTasks\`。
- **FastAPI 项目、异步优先** → ARQ。
- **大型项目、复杂工作流、需监控** → Celery。
- **稳定可靠、不喜欢 Celery 复杂度** → Dramatiq。

## 七、常见陷阱

### 1. async 里调同步阻塞代码

最经典的坑：

\`\`\`python
# ❌ requests 是同步的，在 async 里会阻塞事件循环
@app.get("/bad")
async def bad():
    import requests
    resp = requests.get("https://slow-api.com")  # 阻塞！
    return resp.json()
\`\`\`

修复：

\`\`\`python
# ✅ 用 httpx 异步
@app.get("/good")
async def good():
    async with httpx.AsyncClient() as c:
        resp = await c.get("https://slow-api.com")
        return resp.json()


# ✅ 或用 run_in_threadpool
from fastapi.concurrency import run_in_threadpool


@app.get("/good2")
async def good2():
    resp = await run_in_threadpool(requests.get, "https://slow-api.com")
    return resp.json()
\`\`\`

### 2. 同步数据库驱动在 async 里

\`\`\`python
# ❌ psycopg2 是同步的
@app.get("/bad")
async def bad():
    conn = psycopg2.connect(...)  # 阻塞
    ...

# ✅ 用 asyncpg 或 psycopg（3.x，支持 async）
@app.get("/good")
async def good():
    conn = await asyncpg.connect(...)
    ...
\`\`\`

### 3. 混用 async 和同步依赖

\`\`\`python
# 同步依赖可以注入到 async 路由，但要注意阻塞
def sync_dep():
    time.sleep(1)  # 同步阻塞
    return "data"


@app.get("/")
async def root(d = Depends(sync_dep)):
    # sync_dep 会被 run_in_threadpool 调用（FastAPI 自动处理）
    # 但要意识到它在线程池，不要滥用
    return d
\`\`\`

FastAPI 会自动用线程池执行同步依赖，不会阻塞事件循环。但如果同步依赖里又调用了阻塞 IO，线程池会被占满。

### 4. 忘了 await

\`\`\`python
# ❌ 忘了 await，返回的是协程对象，不是结果
@app.get("/bad")
async def bad():
    result = asyncio.sleep(1)  # 没.await，返回 coroutine
    return {"msg": result}  # 序列化协程对象会报错

# ✅
@app.get("/good")
async def good():
    await asyncio.sleep(1)
    return {"msg": "done"}
\`\`\`

## 八、并发 vs 并行

异步是**并发**（concurrent），不是**并行**（parallel）：

- **并发**：一个 CPU 交替处理多个任务（事件循环）。
- **并行**：多个 CPU 同时处理多个任务（多进程）。

异步适合 IO 密集（等网络、等磁盘），不适合 CPU 密集。CPU 密集任务要并行，得用多进程：

\`\`\`python
from concurrent.futures import ProcessPoolExecutor


def cpu_heavy(n):
    # CPU 密集计算
    return sum(i * i for i in range(n))


@app.get("/compute")
async def compute():
    # 在进程池执行，不阻塞事件循环
    with ProcessPoolExecutor() as pool:
        result = await run_in_threadpool(pool.submit, cpu_heavy, 10**7)
    return {"result": result.result()}
\`\`\`

| 场景 | 推荐 |
|---|---|
| IO 密集（HTTP、DB、Redis） | async/await |
| CPU 密集（计算、加密） | 多进程 / run_in_threadpool |
| 混合 | async + 线程池/进程池 |

## 九、实战：异步聚合接口

\`\`\`python
import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()


async def fetch_json(client: httpx.AsyncClient, url: str):
    try:
        resp = await client.get(url, timeout=5)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


@app.get("/dashboard")
async def dashboard():
    # 并发获取多个数据源
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            fetch_json(client, "https://api/users/stats"),
            fetch_json(client, "https://api/orders/stats"),
            fetch_json(client, "https://api/products/stats"),
            return_exceptions=True,  # 某个失败不影响其他
        )
    return {
        "users": results[0],
        "orders": results[1],
        "products": results[2],
    }
\`\`\`

\`return_exceptions=True\` 让 gather 即使某个任务失败也返回所有结果（失败的返回异常对象），而不是整体抛错。这对聚合接口很重要——一个数据源挂了不应该影响整个仪表盘。

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| async 里 time.sleep | 阻塞事件循环 | 用 asyncio.sleep 或线程池 |
| async 里 requests | 同步阻塞 | 用 httpx.AsyncClient |
| 忘了 await | 返回协程对象 | 加 await |
| BackgroundTasks 任务丢失 | 进程重启 | 用任务队列 |
| 同步依赖阻塞线程池 | 线程池占满 | 用异步库或限制并发 |
| CPU 密集放 async | 阻塞事件循环 | 用进程池 |
| gather 一个失败全挂 | 默认行为 | return_exceptions=True |

## 十一、设计思想

异步编程的核心价值是「**用少量线程扛大量并发**」。传统同步模型一个请求占一个线程，线程切换开销大，几千并发就把线程池耗尽。异步模型用一个事件循环处理所有请求，IO 等待时让出 CPU 给其他请求，单机扛几万并发不是梦。

但异步不是银弹：

- **IO 密集才有效**：CPU 密集任务异步没用，得靠多核。
- **生态要配套**：一个同步库就能毁掉整个异步优势（事件循环被阻塞）。
- **心智负担高**：async/await 传染性强，一旦异步，调用链都得异步，错误处理也更复杂。

FastAPI 的优雅在于**双模支持**：异步路由用 \`async def\`，同步路由用 \`def\`（自动线程池）。你可以渐进式迁移——先把瓶颈接口异步化，其余保持同步，不需要一次性重写。这种务实设计让 FastAPI 既享受了异步性能，又保留了同步生态的便利。
`,
  },

  // ============================================================
  // 第 8 章：异常处理与错误响应
  // ============================================================
  {
    id: "pyweb2-fastapi-errors",
    group: "FastAPI 核心",
    icon: "❌",
    title: "异常处理与错误响应",
    content: `
## 一、HTTPException 抛出

最常用的错误处理方式是在路由里抛出 \`HTTPException\`：

\`\`\`python
from fastapi import FastAPI, HTTPException

app = FastAPI()

fake_db = {1: {"id": 1, "name": "Alice"}}


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    if user_id not in fake_db:
        # 抛出 404，detail 是错误信息
        raise HTTPException(
            status_code=404,
            detail="用户不存在",
            headers={"X-Error": "UserNotFound"},  # 可选，自定义响应头
        )
    return fake_db[user_id]
\`\`\`

访问 \`/users/999\` 返回：

\`\`\`json
{
  "detail": "用户不存在"
}
\`\`\`

状态码 404，响应头有 \`X-Error: UserNotFound\`。

### detail 的类型

\`detail\` 不只是字符串，可以是任意可 JSON 序列化的数据：

\`\`\`python
# detail 是字典
raise HTTPException(400, detail={"code": "INVALID", "field": "email"})

# detail 是列表
raise HTTPException(422, detail=[{"field": "name", "msg": "太短"}])
\`\`\`

### 常用状态码

| 码 | 含义 | 何时用 |
|---|---|---|
| 400 | Bad Request | 业务校验失败 |
| 401 | Unauthorized | 未登录 |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 冲突（重复创建） |
| 422 | Unprocessable Entity | 请求体校验失败（FastAPI 自动） |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务器异常 |

## 二、自定义异常类

业务异常可以用自定义类表达，比 \`HTTPException(status_code=...)\` 更有语义：

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


# 自定义异常类
class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name


# 注册异常处理器
@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    # 返回 JSONResponse，自定义格式
    return JSONResponse(
        status_code=418,  # I'm a teapot（幽默状态码）
        content={"code": "UNICORN_ERROR", "message": f"{exc.name} 不存在"},
    )


@app.get("/unicorns/{name}")
async def get_unicorn(name: str):
    if name == "yolo":
        raise UnicornException(name=name)  # 抛自定义异常
    return {"name": name}
\`\`\`

访问 \`/unicorns/yolo\` 返回 418 和自定义格式。

### 自定义异常的优势

| 方式 | 优点 | 缺点 |
|---|---|---|
| \`raise HTTPException(404, ...)\` | 简单直接 | 业务逻辑耦合 HTTP 码 |
| 自定义异常 + handler | 业务层不知 HTTP 存在 | 要写额外代码 |

业务层抛自定义异常（\`raise UserNotFound()\`），HTTP 层（handler）负责映射成 HTTP 响应。这种分层让业务代码可复用（不绑定 Web 框架）。

### 实战：业务异常体系

\`\`\`python
# exceptions.py
class AppException(Exception):
    """所有业务异常基类"""
    status_code: int = 400
    code: str = "APP_ERROR"
    message: str = "业务错误"

    def __init__(self, message: str | None = None, **extra):
        self.message = message or self.message
        self.extra = extra
        super().__init__(self.message)


class UserNotFound(AppException):
    status_code = 404
    code = "USER_NOT_FOUND"
    message = "用户不存在"


class PermissionDenied(AppException):
    status_code = 403
    code = "PERMISSION_DENIED"
    message = "无权限"


class ConflictError(AppException):
    status_code = 409
    code = "CONFLICT"
    message = "资源冲突"
\`\`\`

\`\`\`python
# main.py
from exceptions import AppException


# 统一处理器
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "extra": exc.extra,
        },
    )


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    if user_id not in db:
        raise UserNotFound(user_id=user_id)  # 业务层只管抛
    return db[user_id]
\`\`\`

## 三、请求验证错误处理

请求体校验失败时，FastAPI 默认返回 422：

\`\`\`json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["body", "age"],
      "msg": "Input should be a valid integer...",
      "input": "abc"
    }
  ]
}
\`\`\`

要自定义这个格式，覆盖 \`RequestValidationError\` 的处理器：

\`\`\`python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # exc.errors() 是错误列表
    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "请求参数校验失败",
            "errors": [
                {
                    "field": ".".join(str(x) for x in err["loc"]),
                    "message": err["msg"],
                    "type": err["type"],
                }
                for err in exc.errors()
            ],
        },
    )
\`\`\`

新的 422 响应：

\`\`\`json
{
  "code": "VALIDATION_ERROR",
  "message": "请求参数校验失败",
  "errors": [
    {"field": "body.age", "message": "...", "type": "int_parsing"}
  ]
}
\`\`\`

## 四、全局异常处理器

捕获所有未处理异常，避免 500 直接暴露堆栈：

\`\`\`python
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("api")

app = FastAPI()


# 捕获所有未捕获的 Exception，避免 500 把堆栈暴露给客户端
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 记录完整堆栈到日志，方便排查
    logger.exception(f"未处理异常 {request.method} {request.url.path}: {exc}")
    # 对外只返回简略信息，不泄漏内部细节
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "服务器内部错误，请稍后重试",
        },
    )


@app.get("/boom")
async def boom():
    # 故意抛未处理异常，会被全局处理器捕获
    raise RuntimeError("数据库连接失败")
\`\`\`

访问 \`/boom\` 返回 500，但不暴露 \`RuntimeError\` 堆栈，只在服务端日志里记录。

> 注意：注册 \`Exception\` 处理器要放在最后，否则会拦截前面更具体的异常处理器（如 \`HTTPException\`）。

## 五、错误响应格式统一

默认情况下，FastAPI 不同错误的响应结构不一致：

- \`HTTPException\` → \`{"detail": "..."}\`
- 校验错误 \`RequestValidationError\` → \`{"detail": [...]}\`
- 500 异常 → 默认 Starlette 格式

前端处理起来很麻烦。统一成固定结构能大幅简化前端代码：

\`\`\`json
{
  "code": "ERROR_CODE",
  "message": "人类可读消息",
  "details": {...}
}
\`\`\`

完整实现：

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import http_exception_handler

app = FastAPI()


# 统一错误响应工具函数
def error_response(code: str, message: str, status_code: int, details=None):
    return JSONResponse(
        status_code=status_code,
        content={
            "code": code,
            "message": message,
            "details": details,
        },
    )


# 1. 处理 HTTPException（覆盖默认）
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    # 把 detail 映射成统一格式
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        429: "RATE_LIMITED",
    }
    code = code_map.get(exc.status_code, "HTTP_ERROR")
    return error_response(code, str(exc.detail), exc.status_code)


# 2. 处理校验错误
@app.exception_handler(RequestValidationError)
async def custom_validation_handler(request: Request, exc: RequestValidationError):
    details = [
        {
            "field": ".".join(str(x) for x in err["loc"]),
            "message": err["msg"],
        }
        for err in exc.errors()
    ]
    return error_response("VALIDATION_ERROR", "请求参数校验失败", 422, details)


# 3. 处理所有其他异常
@app.exception_handler(Exception)
async def custom_global_handler(request: Request, exc: Exception):
    logger.exception(f"未处理异常: {exc}")
    return error_response("INTERNAL_ERROR", "服务器内部错误", 500)
\`\`\`

现在所有错误响应结构一致，前端只需一套解析逻辑。

## 六、全局错误处理中间件

除了 \`@app.exception_handler\`，还可以用中间件兜底（捕获所有异常包括中间件内部的）：

\`\`\`python
@app.middleware("http")
async def error_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        # 中间件能捕获到所有异常，包括 Starlette 内部的
        logger.exception(f"全局错误: {e}")
        return JSONResponse(
            status_code=500,
            content={"code": "INTERNAL_ERROR", "message": "服务器内部错误"},
        )
\`\`\`

中间件 vs exception_handler：

| 维度 | 中间件 | exception_handler |
|---|---|---|
| 捕获范围 | 所有异常（含中间件内） | 路由及依赖内的异常 |
| 能拿到请求体 | 能（但要缓存） | 能 |
| 推荐场景 | 兜底日志 | 业务异常映射 |

一般推荐 \`exception_handler\` 处理已知异常类型，中间件做兜底日志。

## 七、日志记录（logging 集成）

错误处理离不开日志。Python 标准库 \`logging\` 配置：

\`\`\`python
import logging

# 配置根 logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# 模块级 logger
logger = logging.getLogger("api")
logger.setLevel(logging.DEBUG)

# 文件 handler（按大小轮转）
from logging.handlers import RotatingFileHandler

file_handler = RotatingFileHandler(
    "app.log",
    maxBytes=10 * 1024 * 1024,  # 10MB
    backupCount=5,              # 保留 5 个备份
)
file_handler.setFormatter(logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
))
logger.addHandler(file_handler)
\`\`\`

日志级别：

| 级别 | 数值 | 何时用 |
|---|---|---|
| DEBUG | 10 | 调试信息 |
| INFO | 20 | 正常运行信息 |
| WARNING | 30 | 警告（不影响运行） |
| ERROR | 40 | 错误（影响某功能） |
| CRITICAL | 50 | 严重错误（系统不可用） |

在异常处理器里集成日志：

\`\`\`python
@app.exception_handler(Exception)
async def handler(request: Request, exc: Exception):
    # 记录请求上下文，方便复现
    logger.error(
        "未处理异常",
        extra={
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None,
            "exception": str(exc),
        },
        exc_info=True,  # 记录完整堆栈
    )
    return error_response("INTERNAL_ERROR", "服务器内部错误", 500)
\`\`\`

\`exc_info=True\` 让 \`logger\` 自动附加异常堆栈，比手写 \`traceback\` 方便。

## 八、结构化日志（JSON 日志）

生产环境日志通常会被收集到 ELK（Elasticsearch+Logstash+Kibana）或 Loki 等系统。**JSON 格式**的日志便于机器解析和检索：

\`\`\`python
import json
import logging


class JsonFormatter(logging.Formatter):
    """把日志输出成 JSON 格式"""
    def format(self, record: logging.LogRecord) -> str:
        # 构造日志字典
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # 合并 extra 字段
        if hasattr(record, "method"):
            log_data["method"] = record.method
        if hasattr(record, "path"):
            log_data["path"] = record.path
        # 异常信息
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data, ensure_ascii=False)


# 应用 JSON 格式
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.getLogger().handlers = [handler]
logging.getLogger().setLevel(logging.INFO)
\`\`\`

输出示例：

\`\`\`json
{"timestamp":"2024-01-01 12:00:00","level":"ERROR","logger":"api","message":"未处理异常","method":"GET","path":"/boom","exception":"Traceback..."}
\`\`\`

### 用 structlog 库（更强大）

\`\`\`bash
pip install structlog
\`\`\`

\`\`\`python
import structlog

# 配置 structlog
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),  # JSON 输出
    ],
)

logger = structlog.get_logger()

# 用关键字参数记录，自动结构化
logger.info("user_login", user_id=42, ip="1.2.3.4")
# 输出：{"event":"user_login","timestamp":"...","level":"info","user_id":42,"ip":"1.2.3.4"}
\`\`\`

\`structlog\` 比 \`logging\` 更适合结构化日志，关键字参数自动变成 JSON 字段，不用手写 extra。

## 九、实战：完整的错误处理体系

整合本章内容，一个生产级配置：

\`\`\`python
import logging
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# 配置 JSON 日志
class JsonFormatter(logging.Formatter):
    def format(self, record):
        data = {
            "ts": self.formatTime(record),
            "level": record.levelname,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            data["exc"] = self.formatException(record.exc_info)
        return json.dumps(data, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.basicConfig(handlers=[handler], level=logging.INFO)
logger = logging.getLogger("api")

app = FastAPI()


# 业务异常基类
class AppException(Exception):
    status_code = 400
    code = "APP_ERROR"
    def __init__(self, msg=None, **extra):
        self.msg = msg or "业务错误"
        self.extra = extra


class NotFound(AppException):
    status_code = 404
    code = "NOT_FOUND"


# 处理业务异常
@app.exception_handler(AppException)
async def app_handler(request: Request, exc: AppException):
    logger.warning("业务异常", extra={"code": exc.code, "path": request.url.path})
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.msg, "details": exc.extra},
    )


# 处理 HTTPException
@app.exception_handler(HTTPException)
async def http_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": "HTTP_ERROR", "message": str(exc.detail)},
    )


# 处理校验错误
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "参数校验失败",
            "details": [{"field": ".".join(map(str, e["loc"])), "msg": e["msg"]} for e in exc.errors()],
        },
    )


# 兜底
@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    logger.exception("未处理异常", extra={"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "服务器内部错误"},
    )


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    if user_id > 100:
        raise NotFound(msg="用户不存在", user_id=user_id)
    if user_id < 0:
        raise HTTPException(400, "ID 不能为负")
    return {"id": user_id}
\`\`\`

所有错误现在都有统一格式，便于前端处理和日志检索。

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| exception_handler 不生效 | 注册顺序错 | 具体类型在前，Exception 在后 |
| 500 暴露堆栈 | 没全局处理器 | 加 Exception handler |
| 校验错误格式不统一 | 用默认 422 | 覆盖 RequestValidationError |
| 日志没记录请求上下文 | 只记 msg | 用 extra 传 method/path |
| 异常被中间件吞掉 | 中间件没 re-raise | 异常处理器优先，中间件兜底 |
| raise 后还执行代码 | 误以为 raise 像 return | raise 后代码不执行 |
| HTTPException detail 是对象 | 序列化失败 | detail 用基本类型 |

## 十一、设计思想

异常处理的设计核心是「**关注点分层**」：业务层抛语义化异常（\`UserNotFound\`），不关心 HTTP 状态码；框架层（exception_handler）负责把业务异常映射成 HTTP 响应；日志层负责记录上下文供排查。这三层各司其职，业务代码不被 HTTP 细节污染，HTTP 响应不被业务异常类型绑死。

统一错误响应格式体现了「**契约一致性**」。前端拿到响应后，无论成功还是失败，都能用同一套解析逻辑：看 \`code\` 判断是否成功，取 \`message\` 展示给用户，取 \`details\` 做细粒度处理。这种一致性让前后端协作成本降到最低，也让错误监控系统能用统一规则提取错误指标。

结构化日志（JSON）是可观测性的基础。传统文本日志人读着舒服，但机器难解析；JSON 日志让 ELK/Loki 等系统能直接索引字段，按 \`level\`/\`path\`/\`code\` 过滤，快速定位问题。在云原生时代，日志是给机器看的，人看的是 dashboard，所以结构化是必须。
`,
  },
];
