// =============================================================
// Python Web 后端开发教程 —— 第一批章节（基础入门篇，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. pyweb-overview   — Python Web 开发全景：从 CGI 到 ASGI
//   2. pyweb-env        — 环境搭建与第一个 FastAPI 应用
//   3. pyweb-routing    — 路由与请求响应
//   4. pyweb-pydantic   — Pydantic v2 数据验证
//   5. pyweb-di         — 依赖注入系统
//
// 技术栈：Python 3.11+ / FastAPI 0.110+ / Pydantic v2 / SQLAlchemy 2.0 / Uvicorn
// 教程围绕"博客系统 API"项目展开，强调现代写法（async/await、Pydantic v2、Annotated）。
//
// 格式约定：
//   - content 为 Markdown 模板字符串
//   - content 内三反引号统一转义为 \`\`\`
//   - content 内联反引号统一转义为 \`
//   - 代码块用 \`\`\`python / \`\`\`bash / \`\`\`txt 等标注，可带 filename 属性
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Python Web 开发全景：从 CGI 到 ASGI
  // =========================================================
  {
    id: "pyweb-overview",
    group: "基础入门",
    icon: "🌐",
    title: "Python Web 开发全景：从 CGI 到 ASGI",
    content: `

# Python Web 开发全景：从 CGI 到 ASGI

## 一、Web 后端到底在做什么

当你在浏览器地址栏输入一个网址、按下回车，到页面渲染出来，中间发生的事情可以粗略地拆成两段：**前端**负责把服务器返回的 HTML/CSS/JS 渲染成你看到的界面，**后端**负责接收请求、执行业务逻辑、读写数据、再把结果组装成响应返回。

如果把一个 Web 应用比作一家餐厅：前端是菜单、点餐界面和装修，后端就是后厨——接单、备料、烹饪、出餐，还要管库存、算账、保证卫生。顾客（浏览器）只关心菜品（响应），看不见后厨的忙碌，但后厨的效率直接决定了上菜速度。

一个 Python Web 后端程序的核心职责可以归纳为五件事：

1. **接收请求**——监听 HTTP 端口，解析请求行、请求头、请求体，把它变成程序里好处理的数据结构。
2. **路由分发**——根据 URL 和 HTTP 方法，把请求交给对应的处理函数（俗称"视图"或"路由处理器"）。
3. **业务处理**——校验参数、鉴权、执行业务规则、读写数据库或调用其他服务。
4. **构造响应**——把业务结果序列化成 JSON/HTML/纯文本，设置状态码和响应头。
5. **运行托管**——在一个能持续运行、处理并发连接的进程中把这些能力对外暴露。

本教程要讲的 FastAPI，就是一个帮你把前四件事做到极致的现代 Web 框架；而第五件事，则交给 ASGI 服务器（如 Uvicorn）来完成。

### 后端开发要面对的核心矛盾

后端开发本质上是在约束下做权衡。你永远在权衡这些矛盾：

- **性能 vs 一致性**：缓存能提升性能，但会引入数据不一致。
- **简单 vs 灵活**：单体简单但难扩展，微服务灵活但复杂。
- **同步 vs 异步**：同步代码直观易调试，异步代码吞吐高但心智负担重。
- **开发速度 vs 质量**：赶进度可能埋下技术债。

没有银弹，只有适合当前场景的选择。FastAPI 之所以流行，正是因为它在"开发速度"和"性能"之间找到了一个非常甜的平衡点。

---

## 二、Python Web 的演化史：CGI → WSGI → ASGI

理解 Python Web 的演化史，能帮你搞清楚为什么 FastAPI 长成现在这个样子。这段历史可以分成三个时代。

### 2.1 上古时代：CGI

**CGI（Common Gateway Interface，通用网关接口）** 是 1993 年定义的协议，也是最早让 Web 服务器执行外部程序的标准。它的模型非常朴素：每来一个请求，Web 服务器就 fork 一个新进程，把请求信息通过环境变量和标准输入传给程序，程序把响应写到标准输出，进程结束，服务器把结果返回给浏览器。

\`\`\`txt filename="CGI 工作模型"
浏览器 → HTTP 请求 → Apache/Nginx → fork 进程执行 hello.py → 标准输出 → 返回响应
                                          ↓
                                    进程结束（每次请求都重启 Python 解释器）
\`\`\`

一个最朴素的 CGI 脚本长这样：

\`\`\`python filename="hello.cgi"
#!/usr/bin/env python3
# CGI 脚本：先输出响应头，再输出空行，最后输出正文
print("Content-Type: text/html")
print()  # 头与正文之间必须有一个空行
print("<h1>Hello, CGI!</h1>")
\`\`\`

CGI 的致命问题是**每个请求都要启动一个新进程**，而 Python 解释器启动本身就很慢（要加载解释器、导入模块），高并发下完全扛不住。于是后来出现了 **FastCGI** 和 **mod_python**——前者用常驻进程处理多个请求，后者把 Python 嵌入 Apache 进程。但这些都只是工程优化，没有解决"如何让 Python Web 应用和 Web 服务器之间有一个统一接口"的根本问题。

### 2.2 中古时代：WSGI

**WSGI（Web Server Gateway Interface）** 是 2003 年由 PEP 333 提出的规范（Python 3 由 PEP 3333 更新）。它定义了一个极其简单的同步接口：Web 应用就是一个可调用对象（函数或类），接收两个参数——环境字典 \`environ\` 和一个 \`start_response\` 回调——返回一个可迭代的响应体。

\`\`\`python filename="wsgi_app.py"
# 一个最朴素的 WSGI 应用
def application(environ, start_response):
    # environ 是包含请求信息的字典（PATH_METHOD、PATH_INFO、QUERY_STRING 等）
    # start_response 是用来发送响应状态和头的回调
    status = "200 OK"
    headers = [("Content-Type", "text/plain")]
    start_response(status, headers)
    # 返回值是一个字节串的可迭代对象
    return [b"Hello, WSGI!"]
\`\`\`

WSGI 的伟大之处在于**统一了应用与服务器之间的接口**。从此以后，Python Web 应用和 Web 服务器可以自由组合：你可以把同一个 Flask 应用跑在 Gunicorn 上，也可以跑在 uWSGI 上，还可以用 mod_wsgi 挂到 Apache 上。Django、Flask、Bottle、Pyramid 都遵循 WSGI 规范，整个生态因此繁荣了十几年。

但 WSGI 有一个根本局限：**它是同步的**。WSGI 假设应用在处理一个请求时是阻塞的——调用 \`start_response\` 然后返回响应体，整个过程是一次性的同步调用。这种模型在处理传统 CRUD（增删改查）请求时没问题，但在面对需要大量 I/O 等待的场景（如长连接、WebSocket、调用多个外部 API）时，同步阻塞会让服务器线程被占住，吞吐量上不去。

### 2.3 现代时代：ASGI

**ASGI（Asynchronous Server Gateway Interface）** 是 2018 年由 Django 团队发起的规范，目的是把 WSGI 的同步模型升级为异步模型，同时保持向后兼容。ASGI 应用是一个 **async 可调用对象**，接收 \`scope\`、\`receive\`、\`send\` 三个参数，通过异步消息传递来处理请求和响应。

\`\`\`python filename="asgi_app.py"
# 一个最朴素的 ASGI 应用
async def application(scope, receive, send):
    # scope 是连接的元信息（type、method、path 等）
    if scope["type"] != "http":
        return
    # send 用来异步发送响应消息
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [(b"content-type", b"text/plain")],
    })
    await send({
        "type": "http.response.body",
        "body": b"Hello, ASGI!",
    })
\`\`\`

ASGI 的关键突破是**原生支持异步**——一个事件循环线程可以同时处理成千上万个并发连接，遇到 I/O 等待就切到别的请求，不浪费 CPU。这让它不仅能处理普通 HTTP 请求，还能处理 WebSocket、HTTP/2、长轮询等需要持续连接的场景。

FastAPI 正是基于 ASGI 构建的框架。它把 ASGI 的底层细节封装起来，让你用 \`@app.get()\` 这种直观的装饰器写路由，用 \`async def\` 写异步处理函数，底层的事件循环和消息分发都由 Uvicorn 等 ASGI 服务器负责。

### 三代协议对比

| 协议 | 年代 | 调用模型 | 并发模型 | 代表框架 | 代表服务器 |
|------|------|----------|----------|----------|------------|
| CGI | 1993 | 每请求一进程 | 多进程 | 原始 CGI 脚本 | Apache mod_cgi |
| WSGI | 2003 | 同步可调用对象 | 多线程/多进程 | Django、Flask | Gunicorn、uWSGI |
| ASGI | 2018 | 异步可调用对象 | 单线程事件循环 | FastAPI、Sanic、Litestar | Uvicorn、Daphne、Hypercorn |

---

## 三、同步 vs 异步：为什么这件事很重要

理解同步和异步的区别，是理解 FastAPI 价值的关键。我们用一个具体场景来说明。

假设你的博客后端要处理一个请求：从数据库查文章列表，同时还要调用一个第三方"内容审核 API"检查敏感词，最后返回结果。这两个操作都是 I/O 操作——查数据库要等数据库响应，调审核 API 要等对方服务器响应。

**同步模型**下，处理流程是串行的：

\`\`\`txt filename="同步模型时间线"
[查数据库 50ms] → [等待] → [调审核 API 200ms] → [等待] → [组装响应]
总耗时 ≈ 250ms，期间这个工作线程被占住，不能服务别的请求
\`\`\`

**异步模型**下，处理流程是并发的：

\`\`\`txt filename="异步模型时间线"
[发起查数据库] ─┐
                 ├─ 事件循环同时等待两个 I/O
[发起调审核 API]┘
        ↓
[数据库结果回来] → [审核结果回来] → [组装响应]
总耗时 ≈ max(50, 200) = 200ms，期间事件循环还能服务其他请求
\`\`\`

在 I/O 密集型场景下（Web 后端绝大多数都是 I/O 密集型），异步模型的吞吐量可以比同步模型高出一个数量级。这就是为什么 Node.js、Go、Python(asyncio) 都在拥抱异步。

但异步不是银弹。它的代价是：

- **心智负担**：你需要时刻区分同步函数和异步函数，忘记 \`await\` 是最常见的 bug。
- **生态分裂**：早期 Python 的异步生态不完善，asyncio 的数据库驱动、HTTP 客户端都要单独的异步版本。现在 SQLAlchemy 2.0、HTTPX、Redis 客户端都已经支持异步，这个问题大大缓解。
- **CPU 密集型任务反而要小心**：如果你的路由里有大量 CPU 计算（如图像处理、加密），异步事件循环会被阻塞，反而要用 \`run_in_executor\` 把它丢到线程池。

FastAPI 同时支持同步和异步路由——你可以用 \`def\` 写同步路由（会自动放到线程池），也可以用 \`async def\` 写异步路由。这给了你充分的灵活性。

---

## 四、主流 Python Web 框架对比

Python 的 Web 框架生态非常丰富，下面是几个最主流的框架对比。

| 框架 | 类型 | 异步支持 | 自动文档 | ORM | 定位 | 适合场景 |
|------|------|----------|----------|-----|------|----------|
| **Django** | 全功能 | 部分（3.1+） | 需插件 | 内置 ORM | "全家桶" | 内容站、CMS、后台系统 |
| **Flask** | 微框架 | 不原生 | 需插件 | 无 | "小而美" | 小型 API、原型、学习 |
| **FastAPI** | 现代 | 原生 ASGI | 内置 | 无（推荐 SQLAlchemy） | "现代 API 优先" | API 服务、微服务、实时应用 |
| **Sanic** | 现代异步 | 原生 | 无 | 无 | "类 Flask 异步" | 高并发 API |
| **Tornado** | 现代异步 | 原生 | 无 | 无 | "长连接专长" | WebSocket、长轮询 |
| **Litestar** | 现代异步 | 原生 ASGI | 内置 | 无 | "FastAPI 竞品" | 现代异步 API |

### 4.1 Django：全功能大而全

Django 从 2005 年诞生起就主打"全家桶"——自带 ORM、模板引擎、表单、Admin 后台、认证系统、缓存框架、信号机制，几乎一个标准 Web 应用需要的东西它都内置了。它的设计哲学是"Django Way"：按它的约定来，开发速度极快。

\`\`\`python filename="Django 风格示例"
# Django 的视图：函数风格，request 是一个对象
from django.http import JsonResponse
from .models import Post

def post_list(request):
    # 用内置 ORM 查询
    posts = Post.objects.all()[:10]
    return JsonResponse({"posts": list(posts.values("id", "title"))})
\`\`\`

Django 适合的场景是：内容管理、后台系统、电商后台——需要快速搭起一个"有后台、有数据库、有认证"的完整站点。它的缺点是体量大、异步支持不彻底（直到 4.x 才逐步支持异步视图）、对纯 API 开发有点"重"。

### 4.2 Flask：轻量灵活

Flask 从 2010 年诞生起就主打"微框架"——核心只提供路由和请求响应，其他能力（数据库、认证、表单）都通过扩展接入。它的设计哲学是"给你最小内核，剩下自己拼"。

\`\`\`python filename="Flask 风格示例"
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/posts/<int:post_id>")
def get_post(post_id):
    return jsonify({"id": post_id, "title": "Hello Flask"})
\`\`\`

Flask 适合的场景是：小型 API、学习 Web 原理、快速原型。它的问题是不原生支持异步（虽然 2.0 后加了 \`async\` 视图支持，但底层仍是 WSGI）、没有类型驱动的自动文档。

### 4.3 FastAPI：现代异步 + 类型驱动

FastAPI 由 Sebastián Ramírez 于 2018 年创建，基于 Starlette（ASGI 工具包）和 Pydantic（数据验证库）。它的核心创新是**用 Python 类型注解驱动一切**——你给参数加类型注解，框架就自动帮你做参数校验、序列化、文档生成。

\`\`\`python filename="FastAPI 风格示例"
from fastapi import FastAPI

app = FastAPI()

@app.get("/posts/{post_id}")
async def get_post(post_id: int):  # 类型注解告诉框架：post_id 必须是 int
    # 框架自动校验 post_id 是不是整数，不是就返回 422
    return {"id": post_id, "title": "Hello FastAPI"}
\`\`\`

FastAPI 适合的场景是：现代 API 服务、微服务、实时应用（WebSocket）、需要高质量自动文档的团队项目。

---

## 五、为什么选 FastAPI

在 2024-2026 年的技术选型中，FastAPI 已经成为 Python Web 后端的事实标准之一。它有四个核心优势：

### 5.1 性能：与 Node.js/Go 同级

FastAPI 跑在 ASGI 事件循环上，单进程就能处理高并发 I/O。在权威的 TechEmpower 基准测试中，FastAPI 的吞吐量在 Python 框架里名列前茅，与 Express.js（Node.js）、Gin（Go）处于同一量级，远超同步的 Flask/Django。

| 框架 | 语言 | 典型 RPS（请求/秒） | 备注 |
|------|------|---------------------|------|
| Express.js | Node.js | ~50000 | 事件循环 |
| Gin | Go | ~60000 | goroutine |
| FastAPI | Python | ~30000 | ASGI + asyncio |
| Flask | Python | ~2000 | 同步 WSGI |
| Django | Python | ~1500 | 同步 WSGI |

（注：实际数字因测试场景而异，这里只看量级关系，重点是 FastAPI 比 Flask/Django 高一个数量级。）

### 5.2 自动文档：写代码即写文档

FastAPI 基于 OpenAPI 3.1 规范，根据你的路由和 Pydantic 模型自动生成两套交互式文档：

- **Swagger UI**（\`/docs\`）：可视化、可点击试用的 API 文档，前端同学直接在这里发请求测试。
- **ReDoc**（\`/redoc\`）：更适合阅读的文档样式，适合对外发布。

这意味着你**不用单独维护一份 API 文档**——代码改了，文档自动跟着改，永远不会过时。这是 FastAPI 对团队协作最大的价值。

### 5.3 类型安全：Pydantic v2 驱动

FastAPI 把 Pydantic 作为数据验证的核心。你在 Pydantic 模型里定义字段类型和约束，框架就自动：

- 校验请求体、查询参数、路径参数、Cookie、Header
- 把数据转换成正确的 Python 类型
- 生成对应的 OpenAPI Schema
- 在响应时按模型过滤字段（避免泄露内部字段）

Pydantic v2 用 Rust 重写了核心（pydantic-core），校验速度比 v1 快 5-50 倍，让"类型安全"不再以性能为代价。

### 5.4 异步原生：面向未来

FastAPI 从第一行代码就是异步的。它天然支持 \`async def\` 路由、WebSocket、后台任务、流式响应。这意味着当你未来要加 WebSocket 推送（比如博客新评论实时通知）、要调外部 API、要接入异步数据库，都不用换框架。

### 5.5 与 Node.js / Go 的横向对比

| 维度 | FastAPI (Python) | Express (Node.js) | Gin (Go) |
|------|------------------|-------------------|----------|
| 性能 | 高（异步） | 高 | 极高 |
| 开发速度 | 极快（类型+文档） | 快 | 中等 |
| 类型安全 | 强（Pydantic） | 弱（需 TS+运行时校验） | 强（编译期） |
| 自动文档 | 内置 | 需 Swagger 工具 | 需插件 |
| 生态（AI/数据） | 极强 | 中等 | 弱 |
| 学习曲线 | 低（Python 基础即可） | 低 | 中等 |
| 部署 | 简单 | 简单 | 单二进制最简 |

FastAPI 的独特优势在于**它背靠 Python 的 AI/数据科学生态**——如果你要做"调用大模型 API 的后端"、"处理数据的 API"、"机器学习模型推理服务"，FastAPI 几乎是唯一顺手的现代选择。

---

## 六、FastAPI 的适用场景

FastAPI 不是万能的，它在以下场景表现最好：

1. **RESTful API 服务**——这是它的主场，路由 + Pydantic + 自动文档的组合无敌。
2. **微服务后端**——轻量、启动快、易容器化，适合拆分式架构。
3. **AI/数据应用后端**——和 Pandas、NumPy、transformers、LangChain 等库无缝集成。
4. **实时应用**——WebSocket、SSE、流式响应都原生支持。
5. **需要高质量文档的团队项目**——自动文档让前后端协作效率翻倍。

它不太适合的场景：

- **需要完整 Admin 后台的传统站点**——这种情况 Django 更划算。
- **CPU 密集型计算服务**——异步框架的优势发挥不出来，反而要小心事件循环阻塞。
- **对启动速度极其敏感的 Serverless 场景**——Python 冷启动比 Go 慢，需要权衡。

---

## 七、本教程的博客系统项目

从下一章开始，我们会围绕一个"博客系统 API"项目展开。这个项目会贯穿全部 20 章，从一个最简单的 hello world，逐步演变成一个有用户认证、文章管理、评论系统、数据库持久化、缓存、测试、部署的完整后端。

博客系统涉及的核心领域模型：

| 模型 | 说明 | 涉及能力 |
|------|------|----------|
| User（用户） | 注册、登录、发文、评论 | 认证、权限 |
| Post（文章） | 标题、正文、作者、标签 | CRUD、分页、关联 |
| Comment（评论） | 内容、文章、作者、父评论 | 嵌套数据、树形结构 |
| Tag（标签） | 名称、文章数 | 多对多关系 |

本批 5 章是"基础入门篇"，目标是让你能独立写出一个带参数校验、自动文档、依赖注入的 FastAPI 应用。我们会用内存数据（Python 列表/字典）模拟数据库，把焦点放在框架本身。从第 6 章开始的进阶篇才会真正接数据库。

---

## 八、小结

- Python Web 经历了 **CGI（每请求一进程）→ WSGI（同步统一接口）→ ASGI（异步统一接口）** 三代演化。
- **同步模型**简单直观，但 I/O 等待会占住线程；**异步模型**通过事件循环让一个线程处理大量并发，吞吐量更高。
- 主流框架里，**Django** 全功能、**Flask** 轻量、**FastAPI** 现代异步，定位不同。
- **FastAPI** 的四大优势：性能高、自动文档、类型安全（Pydantic v2）、异步原生。
- 本教程围绕**博客系统 API** 展开，前 15 章用博客示例讲原理，后 5 章是完整实战项目。

下一章我们会动手搭建 Python 开发环境，跑起第一个 FastAPI 应用，并打开那让人惊艳的自动文档页面。
`
  },

  // =========================================================
  // 第二章：环境搭建与第一个 FastAPI 应用
  // =========================================================
  {
    id: "pyweb-env",
    group: "基础入门",
    icon: "📦",
    title: "环境搭建与第一个 FastAPI 应用",
    content: `

# 环境搭建与第一个 FastAPI 应用

## 一、为什么环境隔离如此重要

在动手写代码之前，先聊一个看似 boring 但极其重要的话题：**虚拟环境**。

Python 的包是全局安装的——如果你直接 \`pip install fastapi\`，它会被装到系统的 Python 解释器里。这会带来三个麻烦：

1. **版本冲突**：项目 A 要 FastAPI 0.110，项目 B 要 FastAPI 0.95，全局只能装一个。
2. **污染系统**：你装了一堆包，搞不清哪些是系统自带的、哪些是你装的，卸载时心惊胆战。
3. **不可复现**：换台机器，你的项目跑不起来，因为依赖没装齐。

虚拟环境（virtual environment）就是解决这个问题的标准方案：**为每个项目创建一个独立的 Python 环境**，里面有自己独立的解释器副本和包目录，互不干扰。

这一章我们会从零搭一个 FastAPI 项目，包含：创建虚拟环境、安装依赖、写第一个 hello world、启动服务、看自动文档、规划项目结构。

---

## 二、虚拟环境：venv 的标准用法

Python 3.3 以后，标准库自带了 \`venv\` 模块，不需要再装 \`virtualenv\`。创建虚拟环境就一条命令：

\`\`\`bash filename="Terminal"
# 进入项目目录
mkdir blog-api && cd blog-api

# 创建虚拟环境（在当前目录下生成 .venv 文件夹）
python3 -m venv .venv
\`\`\`

这条命令会做三件事：在 \`.venv/\` 目录下复制一份 Python 解释器、生成一份独立的 \`site-packages\` 目录、生成一个 \`activate\` 脚本。

激活虚拟环境：

\`\`\`bash filename="Terminal"
# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1
\`\`\`

激活后，你的终端提示符前面会出现 \`(.venv)\`，并且 \`which python\` 会指向 \`.venv/bin/python\` 而不是系统 Python。从此你 \`pip install\` 的所有包都只装在这个虚拟环境里，删掉 \`.venv\` 文件夹就彻底清理干净。

退出虚拟环境用 \`deactivate\` 命令。

### 一个常见坑：不要把 .venv 提交到 git

\`.venv/\` 目录体积大、平台相关、可重建，绝对不应该提交到版本库。在项目根目录建一个 \`.gitignore\`：

\`\`\`txt filename=".gitignore"
.venv/
__pycache__/
*.pyc
.env
\`\`\`

---

## 三、安装 FastAPI 与 Uvicorn

虚拟环境激活后，安装 FastAPI 和 ASGI 服务器 Uvicorn：

\`\`\`bash filename="Terminal"
# 激活虚拟环境后执行
pip install "fastapi[standard]" uvicorn[standard]
\`\`\`

这里有两个细节：

1. **\`fastapi[standard]\`**：方括号里的 \`standard\` 是一个"额外依赖组"，会一并装上 \`pydantic\`、\`pydantic-settings\`、\`httpx\`（测试用）、\`python-multipart\`（表单/文件上传用）等配套包。生产项目通常直接装 standard。
2. **\`uvicorn[standard]\`**：会装上 \`uvloop\`（C 实现的高性能事件循环）、\`httptools\`（C 实现的 HTTP 解析器），让性能再上一个台阶。

验证安装成功：

\`\`\`bash filename="Terminal"
python -c "import fastapi; print(fastapi.__version__)"
# 输出类似：0.115.0

python -c "import pydantic; print(pydantic.VERSION)"
# 输出类似：2.9.0
\`\`\`

---

## 四、依赖管理：requirements.txt 与现代工具

### 4.1 最朴素的 requirements.txt

最简单的依赖管理方式是 \`requirements.txt\`：把所有依赖写在一个文本文件里，一行一个。

\`\`\`txt filename="requirements.txt"
fastapi[standard]>=0.110.0
uvicorn[standard]>=0.27.0
\`\`\`

安装时用 \`pip install -r requirements.txt\`。

要锁定精确版本（保证团队所有人环境一致），用 \`pip freeze\`：

\`\`\`bash filename="Terminal"
pip freeze > requirements.lock
\`\`\`

\`requirements.lock\` 会列出所有依赖（包括间接依赖）的精确版本，团队其他成员用 \`pip install -r requirements.lock\` 就能装出一模一样的环境。

### 4.2 现代工具：poetry 与 uv

\`requirements.txt\` 够用，但不够现代。两个更先进的工具是 **Poetry** 和 **uv**。

**Poetry** 用一个 \`pyproject.toml\` 文件管理项目，自带虚拟环境管理和打包发布能力：

\`\`\`bash filename="Terminal"
# 安装 poetry
pip install poetry

# 在项目目录初始化
poetry init

# 加依赖
poetry add fastapi uvicorn[standard]

# 装依赖（自动创建虚拟环境）
poetry install
\`\`\`

**uv** 是 Astral 公司（ruff 的作者）用 Rust 写的 Python 包管理器，2024 年起爆火。它的特点是**极快**——比 pip 快 10-100 倍：

\`\`\`bash filename="Terminal"
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建项目（含虚拟环境）
uv init blog-api && cd blog-api

# 加依赖
uv add fastapi uvicorn[standard]

# 运行
uv run uvicorn main:app --reload
\`\`\`

本教程为照顾最广的读者，示例统一用 \`venv\` + \`pip\`，但你完全可以在自己的项目里用 \`uv\` 或 \`poetry\`——它们管理出来的虚拟环境，跑 FastAPI 是完全一样的。

### 工具对比

| 工具 | 速度 | 学习成本 | 锁文件 | 适用场景 |
|------|------|----------|--------|----------|
| pip + venv | 慢 | 极低 | requirements.lock | 学习、小项目 |
| Poetry | 中 | 中 | poetry.lock | 中大型项目、要发布包 |
| uv | 极快 | 低 | uv.lock | 新项目、追求速度 |

---

## 五、第一个 FastAPI 应用：Hello World

万事俱备，开始写第一个 FastAPI 应用。在项目根目录创建 \`main.py\`：

\`\`\`python filename="main.py"
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例，title 会显示在自动文档页面的标题
app = FastAPI(title="博客系统 API", version="0.1.0")

# 用装饰器注册路由：当 GET / 请求进来时，执行下面的函数
@app.get("/")
# async def 表示这是一个异步函数，可以用 await
async def root():
    # 返回一个字典，FastAPI 会自动把它序列化成 JSON
    return {"message": "Hello, FastAPI!", "version": "0.1.0"}

# 再加一个博客欢迎页路由
@app.get("/blog/welcome")
async def blog_welcome():
    return {
        "title": "我的技术博客",
        "description": "用 FastAPI 构建的博客系统",
        "posts_count": 0,
    }
\`\`\`

这段代码做了几件事：

1. \`from fastapi import FastAPI\` 导入框架核心类。
2. \`app = FastAPI(title=..., version=...)\` 创建应用实例，\`title\` 和 \`version\` 会出现在自动文档里。
3. \`@app.get("/")\` 是装饰器，告诉框架"当收到 GET /\` 请求时，执行下面的函数"。这是 FastAPI 最核心的路由注册方式。
4. \`async def root()\` 是异步处理函数，返回一个字典。
5. FastAPI 自动把返回的字典序列化成 JSON 响应，并设置 \`Content-Type: application/json\`。

注意：FastAPI 同时支持 \`def\` 和 \`async def\`。如果你写 \`def\`（同步函数），框架会自动把它放到线程池里执行，避免阻塞事件循环。如果你的函数里没有 \`await\`（比如纯计算或调用同步库），写 \`def\` 反而更安全。本教程为统一风格，示例默认用 \`async def\`，但会在涉及同步库时切回 \`def\`。

---

## 六、用 Uvicorn 启动应用

FastAPI 本身只是个 ASGI 应用，需要一个 ASGI 服务器来运行它。最常用的是 **Uvicorn**。

\`\`\`bash filename="Terminal"
# 最基本的启动命令
uvicorn main:app

# 加 --reload 开启热重载（开发时用）
uvicorn main:app --reload

# 指定 host 和 port
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

\`main:app\` 的含义是：从 \`main.py\` 文件里找到名为 \`app\` 的 ASGI 应用实例。

启动后会看到类似输出：

\`\`\`txt filename="Terminal"
INFO:     Will watch for changes in these directories: ['/Users/you/blog-api']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
\`\`\`

现在打开浏览器：

- 访问 \`http://127.0.0.1:8000/\` → 看到 \`{"message":"Hello, FastAPI!","version":"0.1.0"}\`
- 访问 \`http://127.0.0.1:8000/blog/welcome\` → 看到博客欢迎信息

**\`--reload\` 的作用**：开启后，Uvicorn 会监听项目目录下的 \`.py\` 文件变化，一保存就自动重启服务。开发时强烈建议开，能省去无数手动重启。但生产环境绝对不要开（有性能开销）。

### 用代码启动：__main__ 写法

除了命令行，你也可以在 \`main.py\` 末尾加一段，让文件可以直接 \`python main.py\` 运行：

\`\`\`python filename="main.py (末尾追加)"
# 这一段让 main.py 可以直接用 python main.py 运行
if __name__ == "__main__":
    import uvicorn
    # 相当于执行 uvicorn main:app --reload
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
\`\`\`

然后直接：

\`\`\`bash filename="Terminal"
python main.py
\`\`\`

效果和 \`uvicorn\` 命令完全一样。这种方式适合 IDE 里点"运行"按钮调试。

---

## 七、自动文档：FastAPI 的杀手锏

FastAPI 最让人惊艳的特性之一，就是**零配置自动生成交互式 API 文档**。启动服务后，浏览器访问：

- **\`http://127.0.0.1:8000/docs\`** —— Swagger UI 风格的交互式文档
- **\`http://127.0.0.1:8000/redoc\`** —— ReDoc 风格的阅读型文档
- **\`http://127.0.0.1:8000/openapi.json\`** —— 原始 OpenAPI 3.1 Schema JSON

### 7.1 Swagger UI（/docs）

打开 \`/docs\`，你会看到一个整齐的接口列表，每个接口显示：HTTP 方法、路径、简要说明。点开任意一个接口，能看到：

- **参数说明**：路径参数、查询参数、请求体的类型和是否必填。
- **试运行**：填入参数，点 "Execute" 就能直接发请求，看真实响应。
- **响应示例**：根据返回模型自动生成示例 JSON。

对于博客系统，前端同学不用问后端"这个接口怎么调"，直接在 \`/docs\` 里点两下就清楚了。

### 7.2 ReDoc（/redoc）

\`/redoc\` 是更适合阅读的版本，三栏布局：左边目录、中间正文、右边示例。适合对外发布的 API 文档。

### 7.3 OpenAPI 是什么

**OpenAPI**（原名 Swagger Specification）是一个描述 RESTful API 的规范，本质是一个 JSON/YAML 文件，定义了"这个 API 有哪些接口、每个接口接受什么参数、返回什么结构"。

FastAPI 根据你的路由装饰器、函数签名、Pydantic 模型，**自动生成**这个 OpenAPI 文件（\`/openapi.json\`），然后用 Swagger UI 和 ReDoc 这两个前端渲染它。你写的代码就是文档的源头，永远不会过时。

### 7.4 给路由加文档

你可以在装饰器和函数签名里加描述，让文档更丰富：

\`\`\`python filename="main.py (扩展)"
from fastapi import FastAPI

app = FastAPI(
    title="博客系统 API",
    description="一个用 FastAPI 构建的博客系统后端，包含文章、评论、用户。",
    version="0.1.0",
)

@app.get(
    "/blog/welcome",
    summary="博客欢迎页",            # 显示在接口列表的标题
    description="返回博客的基本信息，无需认证。",  # 详细描述
    tags=["博客"],                  # 在文档里分组
)
async def blog_welcome():
    """
    这里写的内容也会出现在文档里（作为 description 的补充）。
    支持 Markdown。
    """
    return {"title": "我的技术博客", "posts_count": 0}
\`\`\`

刷新 \`/docs\`，你会看到接口被分到了"博客"分组下，有标题、有描述、有文档字符串。这就是"代码即文档"的体验。

---

## 八、项目目录结构规范

一个规范的 FastAPI 项目，目录结构通常长这样：

\`\`\`txt filename="推荐项目结构"
blog-api/
├── .venv/                  # 虚拟环境（不提交）
├── .gitignore
├── requirements.txt        # 依赖列表
├── README.md
├── main.py                 # 入口：创建 app，注册路由（小项目用）
└── app/                    # 大项目把代码拆到 app 包里
    ├── __init__.py
    ├── main.py             # 应用工厂：create_app()
    ├── config.py           # 配置（数据库 URL、密钥等）
    ├── dependencies.py     # 公共依赖（数据库会话、当前用户）
    ├── models/             # SQLAlchemy 数据模型
    │   ├── __init__.py
    │   ├── user.py
    │   └── post.py
    ├── schemas/            # Pydantic 数据模型（请求/响应 schema）
    │   ├── __init__.py
    │   ├── user.py
    │   └── post.py
    ├── routers/            # 路由模块（按业务拆分）
    │   ├── __init__.py
    │   ├── users.py
    │   ├── posts.py
    │   └── comments.py
    ├── services/           # 业务逻辑层
    │   └── post_service.py
    └── tests/              # 测试
        └── test_posts.py
\`\`\`

这个结构的核心思想是**按职责分层**：

- **routers**：只负责接收请求、调用 service、返回响应，不写业务逻辑。
- **services**：业务逻辑层，处理具体规则（如"发文前要审核"）。
- **models**：数据库表结构定义（SQLAlchemy）。
- **schemas**：API 数据结构定义（Pydantic），负责校验和序列化。

本教程前 5 章用单文件 \`main.py\` 讲解，从第 6 章开始会逐步拆成这个结构。

### 一个稍完整的 main.py 示例

把前面学的串起来，写一个稍微完整点的 \`main.py\`，包含应用信息、文档配置、两个路由：

\`\`\`python filename="main.py"
from fastapi import FastAPI

# 创建应用实例，并配置文档元信息
app = FastAPI(
    title="博客系统 API",
    description=""""
    ## 博客系统 API 文档

    本 API 提供博客系统的后端能力，包括：
    - 文章管理（CRUD）
    - 评论系统
    - 用户认证

    所有接口返回 JSON 格式数据。
    """,
    version="0.1.0",
    docs_url="/docs",      # Swagger UI 路径，默认就是 /docs
    redoc_url="/redoc",    # ReDoc 路径，默认就是 /redoc
)


@app.get("/", tags=["默认"], summary="健康检查")
async def health_check():
    """服务健康检查接口，返回服务状态。"""
    return {"status": "ok", "service": "blog-api"}


@app.get("/blog/welcome", tags=["博客"], summary="博客欢迎页")
async def blog_welcome():
    """返回博客的基本介绍信息。"""
    return {
        "title": "我的技术博客",
        "description": "记录后端开发与系统设计的思考",
        "posts_count": 0,
        "tags": ["Python", "FastAPI", "后端"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
\`\`\`

启动后访问 \`/docs\`，你会看到一个分类清晰、描述完整的 API 文档——而这只是几行代码的成果。

---

## 九、常见启动问题排查

| 现象 | 原因 | 解决 |
|------|------|------|
| \`ModuleNotFoundError: No module named 'fastapi'\` | 没激活虚拟环境，或没装 | 激活 \`.venv\` 后重装 |
| \`Address already in use\` | 8000 端口被占 | 换端口 \`--port 8001\`，或杀掉占用进程 |
| \`Cannot find module main\` | 不在 \`main.py\` 所在目录 | \`cd\` 到项目根目录再启动 |
| 修改代码后没生效 | 没开 \`--reload\` | 加 \`--reload\`，或手动重启 |
| \`/docs\` 404 | 关闭了文档 | 检查 \`docs_url\` 是否被设为 \`None\` |

---

## 十、小结

- **虚拟环境**用 \`python -m venv .venv\` 创建，\`source .venv/bin/activate\` 激活，是 Python 项目的标准做法。
- 安装 \`fastapi[standard]\` 和 \`uvicorn[standard]\`，前者是框架，后者是 ASGI 服务器。
- 依赖管理可用 \`requirements.txt\`（朴素）、**Poetry**（成熟）、**uv**（极快）。
- 第一个 FastAPI 应用就三步：\`app = FastAPI()\`、\`@app.get(...)\`、\`uvicorn main:app --reload\`。
- 自动文档开箱即用：\`/docs\`（Swagger UI，可试运行）、\`/redoc\`（阅读型）、\`/openapi.json\`（原始 Schema）。
- 项目结构按 **routers / services / models / schemas** 分层，小项目用单 \`main.py\` 即可。

下一章我们会深入路由系统，学习路径参数、查询参数、请求体、响应模型、文件上传等核心能力，并写出博客系统的第一组 CRUD 接口。
`
  },

  // =========================================================
  // 第三章：路由与请求响应
  // =========================================================
  {
    id: "pyweb-routing",
    group: "基础入门",
    icon: "🛣️",
    title: "路由与请求响应",
    content: `

# 路由与请求响应

## 一、路由：把 URL 映射到函数

Web 框架最核心的能力就是**路由**——根据请求的 HTTP 方法和 URL 路径，找到对应的处理函数。FastAPI 用装饰器风格注册路由，每个 HTTP 方法对应一个装饰器：

| 装饰器 | HTTP 方法 | 典型语义 |
|--------|-----------|----------|
| \`@app.get()\` | GET | 查询资源 |
| \`@app.post()\` | POST | 创建资源 |
| \`@app.put()\` | PUT | 全量更新资源 |
| \`@app.patch()\` | PATCH | 部分更新资源 |
| \`@app.delete()\` | DELETE | 删除资源 |

RESTful 风格的博客系统接口大概长这样：

| 方法 | 路径 | 语义 |
|------|------|------|
| GET | \`/posts\` | 获取文章列表 |
| POST | \`/posts\` | 创建文章 |
| GET | \`/posts/{post_id}\` | 获取单篇文章 |
| PUT | \`/posts/{post_id}\` | 更新文章 |
| DELETE | \`/posts/{post_id}\` | 删除文章 |

这一章我们会把这些接口一个个写出来，过程中学习路径参数、查询参数、请求体、响应模型、文件上传等核心概念。

---

## 二、路径参数

路径参数是 URL 路径里用花括号包裹的部分，比如 \`/posts/{post_id}\` 里的 \`post_id\`。FastAPI 会把它作为关键字参数传给处理函数。

\`\`\`python filename="path_params.py"
from fastapi import FastAPI

app = FastAPI()

# 模拟数据库：用列表存文章
POSTS = [
    {"id": 1, "title": "FastAPI 入门", "content": "第一篇"},
    {"id": 2, "title": "Pydantic 详解", "content": "第二篇"},
]

@app.get("/posts/{post_id}")
async def get_post(post_id: int):  # 类型注解：post_id 必须是 int
    # 遍历查找对应文章
    for post in POSTS:
        if post["id"] == post_id:
            return post
    # 找不到返回 404
    # 这里先用普通 dict，后面会学 HTTPException 抛 404
    return {"error": "文章不存在"}
\`\`\`

注意函数签名里的 \`post_id: int\`——这个类型注解非常关键。FastAPI 会：

1. **自动校验**：如果用户访问 \`/posts/abc\`，\`abc\` 不是整数，FastAPI 自动返回 422 错误，告诉你"post_id 不是有效的整数"。
2. **自动转换**：访问 \`/posts/1\`，字符串 \`"1"\` 会被自动转成整数 \`1\`。
3. **写进文档**：\`/docs\` 里会显示 post_id 是 integer 类型、必填。

### 路径参数的顺序很重要

FastAPI 按注册顺序匹配路由。如果有两个路径 \`/posts/me\` 和 \`/posts/{post_id}\`，必须把 \`/posts/me\` 写在前面：

\`\`\`python filename="route_order.py"
@app.get("/posts/me")          # ✅ 先注册具体路径
async def get_my_posts():
    return {"message": "这是当前用户的文章"}

@app.get("/posts/{post_id}")   # 再注册带参数的路径
async def get_post(post_id: int):
    return {"id": post_id}
\`\`\`

如果顺序反了，访问 \`/posts/me\` 会被 \`/posts/{post_id}\` 匹配，然后 \`me\` 转不成 int 报 422。

### 枚举型路径参数

如果路径参数只能取几个固定值，可以用 \`Enum\` 约束：

\`\`\`python filename="enum_path.py"
from enum import Enum
from fastapi import FastAPI

app = FastAPI()

class Tag(str, Enum):
    python = "python"
    fastapi = "fastapi"
    database = "database"

@app.get("/posts/by-tag/{tag}")
async def get_posts_by_tag(tag: Tag):
    # tag 是 Tag 枚举，文档里会显示可选值
    return {"tag": tag, "value": tag.value}
\`\`\`

访问 \`/posts/by-tag/python\` 正常，访问 \`/posts/by-tag/java\` 会返回 422 提示"java 不是有效枚举值"。

---

## 三、查询参数

URL 里 \`?\` 后面的部分是查询参数，格式 \`?key1=value1&key2=value2\`。FastAPI 把"不是路径参数的函数参数"自动当作查询参数。

\`\`\`python filename="query_params.py"
from fastapi import FastAPI

app = FastAPI()

POSTS = [{"id": i, "title": f"文章{i}"} for i in range(1, 21)]  # 20 篇文章

@app.get("/posts")
async def list_posts(
    skip: int = 0,        # 查询参数，有默认值，可不传
    limit: int = 10,      # 查询参数，有默认值
):
    # 分页：跳过 skip 篇，取 limit 篇
    return POSTS[skip : skip + limit]
\`\`\`

- 访问 \`/posts\` → \`skip=0, limit=10\`，返回前 10 篇
- 访问 \`/posts?skip=10\` → 返回第 11-20 篇
- 访问 \`/posts?skip=5&limit=5\` → 返回第 6-10 篇

### 必填 vs 可选查询参数

参数有没有默认值，决定了它必不必须传：

\`\`\`python filename="optional_query.py"
from typing import Optional  # Python 3.10+ 也可直接用 X | None

@app.get("/search")
async def search(
    keyword: str,                    # 没默认值 → 必填
    tag: Optional[str] = None,       # 默认 None → 可选
    page: int = 1,                   # 默认 1 → 可选
):
    result = {"keyword": keyword, "page": page}
    if tag is not None:
        result["tag"] = tag
    return result
\`\`\`

访问 \`/search?keyword=fastapi\` 正常；访问 \`/search\` 会报 422 提示"keyword 是必填参数"。

### 查询参数校验：Query

如果要对查询参数做更细的约束（最小值、最大值、正则），用 \`Query\`：

\`\`\`python filename="query_validation.py"
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/posts")
async def list_posts(
    skip: int = Query(0, ge=0, description="跳过多少条，不能为负"),
    limit: int = Query(10, ge=1, le=100, description="每页条数，1-100"),
    keyword: str | None = Query(None, min_length=2, max_length=50, description="搜索关键词"),
):
    return {"skip": skip, "limit": limit, "keyword": keyword}
\`\`\`

\`ge=0\` 表示大于等于 0（greater than or equal），\`le=100\` 表示小于等于 100。访问 \`/posts?skip=-1\` 会返回 422 提示"skip 必须大于等于 0"。这些约束会自动出现在 \`/docs\` 里。

---

## 四、请求体：Pydantic BaseModel

GET 请求的参数都在 URL 里，但创建资源（POST）时数据要放在请求体里。FastAPI 用 **Pydantic BaseModel** 描述请求体结构。

\`\`\`python filename="request_body.py"
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

# 定义请求体模型：创建文章的入参
class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="文章标题")
    content: str = Field(..., min_length=1, description="正文")
    tags: list[str] = Field(default_factory=list, description="标签列表")

@app.post("/posts")
async def create_post(post: PostCreate):  # 类型注解告诉框架：post 是请求体
    # post 已经是 PostCreate 实例，字段都校验过了
    new_post = {"id": 999, **post.model_dump()}
    return new_post
\`\`\`

函数签名里 \`post: PostCreate\` 这个类型注解告诉 FastAPI："把请求体 JSON 解析成 PostCreate 模型"。如果客户端发的 JSON 缺字段或类型不对，FastAPI 自动返回 422 并详细说明哪里错了。

客户端请求示例：

\`\`\`bash filename="用 curl 发请求"
curl -X POST http://127.0.0.1:8000/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"我的第一篇博客","content":"Hello","tags":["python"]}'
\`\`\`

\`Field(..., ...)\` 里的 \`...\` 表示"必填"（无默认值），后面是约束。下一章会详细讲 Pydantic。

---

## 五、响应模型：response_model

默认情况下，FastAPI 把你 \`return\` 的字典原样返回。但这有个问题：如果你想返回文章但不希望泄露 \`internal_notes\` 这种内部字段，手动删很麻烦。

**\`response_model\`** 就是解决这个问题的：你告诉框架"这个接口的响应结构是这样的"，框架会**按模型过滤**，多出来的字段不返回。

\`\`\`python filename="response_model.py"
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 响应模型：对外暴露的文章结构（不含内部字段）
class PostOut(BaseModel):
    id: int
    title: str
    content: str
    tags: list[str] = []

@app.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: int):
    # 内部数据可能有很多字段，包括不想暴露的
    post = {
        "id": post_id,
        "title": "FastAPI 教程",
        "content": "内容...",
        "tags": ["python"],
        "internal_notes": "这是内部备注，不该返回给客户端",
        "author_password_hash": "xxxxx",  # 绝对不能泄露
    }
    # return 字典，但 response_model=PostOut 会自动只保留 PostOut 的字段
    return post
\`\`\`

实际返回给客户端的只有 \`id\`、\`title\`、\`content\`、\`tags\` 四个字段，\`internal_notes\` 和 \`author_password_hash\` 被自动过滤掉。这就是 \`response_model\` 的核心价值：**用模型当响应的白名单**。

\`response_model\` 还有几个配套参数：

\`\`\`python filename="response_model_options.py"
@app.get(
    "/posts/{post_id}",
    response_model=PostOut,
    response_model_exclude_unset=True,    # 不返回未显式设置的字段
    response_model_exclude_none=True,     # 不返回值为 None 的字段
    status_code=200,                       # 显式指定状态码
)
async def get_post(post_id: int):
    ...
\`\`\`

---

## 六、状态码

每个 HTTP 响应都带一个状态码，FastAPI 默认 GET/PUT/DELETE 返回 200，POST 返回 200（创建也可用 201）。你可以显式指定：

\`\`\`python filename="status_code.py"
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreate):
    return {"id": 1, **post.model_dump()}
\`\`\`

\`status\` 模块里列出了所有标准状态码常量，比直接写 \`201\` 更清晰。

常用状态码：

| 码 | 含义 | 使用场景 |
|----|------|----------|
| 200 | OK | 查询成功 |
| 201 | Created | 创建资源成功 |
| 204 | No Content | 删除成功（无响应体） |
| 400 | Bad Request | 请求格式错误 |
| 401 | Unauthorized | 未登录 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 参数校验失败（FastAPI 自动返回） |
| 500 | Internal Server Error | 服务器内部错误 |

### 抛 HTTP 异常

返回 404/403 不能靠 \`return\`，要用 \`HTTPException\`：

\`\`\`python filename="http_exception.py"
from fastapi import FastAPI, HTTPException

app = FastAPI()

POSTS = [{"id": 1, "title": "Hello"}]

@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    for post in POSTS:
        if post["id"] == post_id:
            return post
    # 找不到 → 抛 404 异常，FastAPI 会把它转成 404 响应
    raise HTTPException(
        status_code=404,
        detail="文章不存在",  # detail 会作为响应体的 detail 字段
    )
    # 响应体：{"detail": "文章不存在"}
\`\`\`

\`raise\` 而不是 \`return\`——这是 FastAPI 推荐的"用异常表达错误"风格。

---

## 七、完整的博客文章 CRUD

把前面的知识串起来，写一个完整的博客文章增删改查（用内存列表模拟数据库）：

\`\`\`python filename="blog_crud.py"
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="博客系统 API")

# ---------- 数据模型 ----------
class PostCreate(BaseModel):
    """创建文章的请求体"""
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    tags: list[str] = []

class PostUpdate(BaseModel):
    """更新文章的请求体（字段都可选）"""
    title: str | None = Field(None, min_length=1, max_length=100)
    content: str | None = None
    tags: list[str] | None = None

class PostOut(BaseModel):
    """文章的响应模型"""
    id: int
    title: str
    content: str
    tags: list[str] = []

# ---------- 内存数据库 ----------
POSTS: list[dict] = []
_next_id = 1

# ---------- 路由 ----------
@app.get("/posts", response_model=list[PostOut], tags=["文章"])
async def list_posts(skip: int = 0, limit: int = 10):
    """获取文章列表，支持分页"""
    return POSTS[skip : skip + limit]

@app.post("/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED, tags=["文章"])
async def create_post(post: PostCreate):
    """创建文章"""
    global _next_id
    new_post = {"id": _next_id, **post.model_dump()}
    POSTS.append(new_post)
    _next_id += 1
    return new_post

@app.get("/posts/{post_id}", response_model=PostOut, tags=["文章"])
async def get_post(post_id: int):
    """获取单篇文章"""
    for post in POSTS:
        if post["id"] == post_id:
            return post
    raise HTTPException(status_code=404, detail="文章不存在")

@app.put("/posts/{post_id}", response_model=PostOut, tags=["文章"])
async def update_post(post_id: int, post: PostUpdate):
    """全量更新文章"""
    for i, p in enumerate(POSTS):
        if p["id"] == post_id:
            # 只更新客户端传了的字段
            updated = {**p, **post.model_dump(exclude_unset=True)}
            POSTS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="文章不存在")

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["文章"])
async def delete_post(post_id: int):
    """删除文章"""
    for i, p in enumerate(POSTS):
        if p["id"] == post_id:
            POSTS.pop(i)
            return  # 204 不返回响应体
    raise HTTPException(status_code=404, detail="文章不存在")
\`\`\`

注意几个细节：

1. \`response_model=list[PostOut]\` —— 响应是 PostOut 的列表。
2. \`model_dump(exclude_unset=True)\` —— 只取客户端显式传了的字段，实现"部分更新"。
3. DELETE 用 \`204\` 状态码，函数不返回内容。
4. \`tags=["文章"]\` 让接口在 \`/docs\` 里归到"文章"分组。

启动后打开 \`/docs\`，你会看到一组完整的文章 CRUD 接口，可以直接在浏览器里点 "Try it out" 测试。

---

## 八、表单数据与文件上传

### 8.1 表单数据

有些场景（如传统登录表单）客户端发的是 \`application/x-www-form-urlencoded\` 而不是 JSON。这时用 \`Form\`：

\`\`\`python filename="form_data.py"
from fastapi import FastAPI, Form

app = FastAPI()

@app.post("/login")
async def login(
    username: str = Form(..., description="用户名"),
    password: str = Form(..., min_length=6, description="密码"),
):
    # 这里简化校验，实际要查数据库 + 加密比对
    if username == "admin" and password == "123456":
        return {"message": "登录成功", "user": username}
    return {"message": "用户名或密码错误"}
\`\`\`

注意：\`Form\` 和 \`Body\`(Pydantic) 不能在同一个接口里混用——要么全是表单，要么全是 JSON。

### 8.2 文件上传

文件上传用 \`UploadFile\`（推荐，流式处理大文件）或 \`File\`（一次性读到内存）。博客系统要上传文章封面图：

\`\`\`python filename="file_upload.py"
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/posts/{post_id}/cover")
async def upload_cover(
    post_id: int,
    file: UploadFile = File(..., description="文章封面图片"),
):
    # 校验文件类型
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, detail="只支持 JPG/PNG/WebP 格式")

    # 校验文件大小（读前 5MB 判断）
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, detail="图片不能超过 5MB")

    # 保存到本地
    save_path = UPLOAD_DIR / f"post_{post_id}_{file.filename}"
    save_path.write_bytes(contents)

    return {
        "post_id": post_id,
        "filename": file.filename,
        "size": len(contents),
        "content_type": file.content_type,
        "url": f"/uploads/{save_path.name}",
    }
\`\`\`

\`UploadFile\` 有这些属性/方法：

| 属性/方法 | 说明 |
|-----------|------|
| \`file.filename\` | 原始文件名 |
| \`file.content_type\` | MIME 类型（如 image/png） |
| \`await file.read()\` | 异步读取全部内容（注意内存） |
| \`await file.write(data)\` | 异步写入数据 |
| \`file.file\` | 底层 SpooledTemporaryFile（可传给 shutil） |

大文件推荐用 \`shutil.copyfileobj(file.file, dst)\` 流式拷贝，避免一次性读进内存。

---

## 九、Header 与 Cookie 参数

### 9.1 Header 参数

\`\`\`python filename="header_params.py"
from fastapi import FastAPI, Header

app = FastAPI()

@app.get("/headers")
async def read_headers(
    user_agent: str | None = Header(None, description="浏览器 UA"),
    x_token: str | None = Header(None, alias="X-Token"),  # 自定义 header 名
):
    return {"user_agent": user_agent, "x_token": x_token}
\`\`\`

注意：HTTP Header 名不区分大小写，但习惯用 \`-\` 分隔（如 \`X-Token\`）。FastAPI 的参数名是 Python 标识符（用下划线 \`x_token\`），它会自动匹配 \`X-Token\` 这个 header；如果对不上，用 \`alias="X-Token"\` 显式指定。

### 9.2 Cookie 参数

\`\`\`python filename="cookie_params.py"
from fastapi import FastAPI, Cookie

app = FastAPI()

@app.get("/profile")
async def read_profile(
    session_id: str | None = Cookie(None, description="会话 ID Cookie"),
):
    if not session_id:
        return {"message": "未登录"}
    return {"session_id": session_id, "user": "admin"}
\`\`\`

Header 和 Cookie 都用 \`Header(...)\` / \`Cookie(...)\` 包装，加默认值表示可选。

---

## 十、APIRouter：拆分路由

当接口多了，全堆在 \`main.py\` 里会很乱。FastAPI 提供 \`APIRouter\` 让你按模块拆分路由，再挂到 app 上：

\`\`\`python filename="routers/posts.py"
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/posts", tags=["文章"])

class PostCreate(BaseModel):
    title: str
    content: str

@router.get("/")
async def list_posts():
    return [{"id": 1, "title": "Hello"}]

@router.get("/{post_id}")
async def get_post(post_id: int):
    return {"id": post_id}

@router.post("/", status_code=201)
async def create_post(post: PostCreate):
    return {"id": 999, **post.model_dump()}
\`\`\`

然后在 \`main.py\` 里注册：

\`\`\`python filename="main.py"
from fastapi import FastAPI
from routers import posts

app = FastAPI(title="博客系统 API")

# 把 posts 路由模块挂载到 app
app.include_router(posts.router)

# 还可以挂载更多模块
# app.include_router(users.router)
# app.include_router(comments.router)
\`\`\`

\`prefix="/posts"\` 让模块内所有路径自动加上 \`/posts\` 前缀，\`tags=["文章"]\` 让文档自动分组。这是中大型项目的标准组织方式。

---

## 十一、小结

- **路径参数**用 \`{param}\` 标记，类型注解决定校验和转换；注意具体路径要注册在带参数路径前面。
- **查询参数**是 URL \`?\` 后的部分，有默认值即可选；用 \`Query()\` 加约束（\`ge\`/\`le\`/\`min_length\`）。
- **请求体**用 Pydantic \`BaseModel\` 描述，类型注解告诉框架解析。
- **响应模型** \`response_model\` 是白名单，过滤掉不该暴露的字段。
- **状态码**用 \`status_code\` 指定，错误用 \`raise HTTPException(...)\`。
- **表单**用 \`Form()\`，**文件上传**用 \`UploadFile\`，**Header/Cookie** 用 \`Header()/Cookie()\`。
- 用 **APIRouter** 按模块拆分路由，\`app.include_router()\` 挂载。

下一章深入 Pydantic v2，学习字段约束、嵌套模型、自定义验证器，把博客系统的数据校验做到工业级。
`
  },

  // =========================================================
  // 第四章：Pydantic v2 数据验证
  // =========================================================
  {
    id: "pyweb-pydantic",
    group: "基础入门",
    icon: "📐",
    title: "Pydantic v2 数据验证",
    content: `

# Pydantic v2 数据验证

## 一、Pydantic 是什么，为什么 FastAPI 离不开它

**Pydantic** 是 Python 最流行的数据验证库。它的核心思想是：**你用类型注解定义一个类的字段，它就自动帮你校验数据、转换类型、序列化结果**。

FastAPI 把 Pydantic 用在三个地方：

1. **请求体校验**：客户端发的 JSON 解析成 BaseModel，字段类型不对就 422。
2. **响应序列化**：返回时按 response_model 过滤并序列化。
3. **文档生成**：根据模型定义自动生成 OpenAPI Schema。

Pydantic v2 在 2023 年发布，用 Rust 重写了核心（\`pydantic-core\`），校验速度比 v1 快 5-50 倍，同时修了不少 v1 的设计缺陷。FastAPI 0.100+ 全面支持 v2，本教程基于 v2 写法。

### v1 vs v2 关键差异

| 方面 | v1 | v2 |
|------|----|----|
| 校验核心 | Python 实现 | Rust（pydantic-core） |
| 配置类 | \`class Config:\` 内部类 | \`model_config = ConfigDict(...)\` |
| 自定义校验 | \`@validator\` | \`@field_validator\` / \`@model_validator\` |
| 序列化 | \`.dict()\` / \`.json()\` | \`.model_dump()\` / \`.model_dump_json()\` |
| ORM 模式 | \`Config.orm_mode = True\` | \`ConfigDict(from_attributes=True)\` |
| 解析 | \`.parse_obj()\` | \`.model_validate()\` |
| 字段定义 | \`Field(...)\` | \`Field(...)\`（同，但约束更全） |

如果你看到老教程里写 \`.dict()\`、\`@validator\`、\`class Config:\`，那是 v1 写法，本教程一律用 v2。

---

## 二、BaseModel 基础

定义一个模型就两步：继承 \`BaseModel\`，用类型注解声明字段。

\`\`\`python filename="basic_model.py"
from pydantic import BaseModel

class Post(BaseModel):
    id: int
    title: str
    content: str
    published: bool = False  # 有默认值 → 可选
\`\`\`

创建实例时，Pydantic 自动校验和转换：

\`\`\`python filename="basic_model_usage.py"
# 正确：字符串 "1" 会被转成 int 1
p = Post(id="1", title="Hello", content="正文")
print(p.id, type(p.id))  # 1 <class 'int'>
print(p.published)        # False（用了默认值）

# 错误：title 不是 str 会抛 ValidationError
try:
    Post(id=1, title=123, content="x")
except Exception as e:
    print(e.errors())  # 详细错误信息
\`\`\`

\`ValidationError\` 会列出每个出错字段的"位置、类型、原因"，前端拿到就能定位问题。

---

## 三、字段类型

Pydantic 支持丰富的字段类型，常用的有：

| 类型 | 说明 | 示例 |
|------|------|------|
| \`str\` / \`int\` / \`float\` / \`bool\` | 基础类型 | \`title: str\` |
| \`EmailStr\` | 邮箱（自动校验格式） | \`email: EmailStr\` |
| \`HttpUrl\` | URL（自动校验） | \`avatar: HttpUrl\` |
| \`datetime\` / \`date\` / \`time\` | 时间（支持 ISO 8601） | \`created_at: datetime\` |
| \`UUID\` | UUID | \`post_id: UUID\` |
| \`list[str]\` / \`list[int]\` | 列表 | \`tags: list[str]\` |
| \`dict[str, int]\` | 字典 | \`meta: dict[str, int]\` |
| \`Optional[str]\` / \`str \| None\` | 可空 | \`subtitle: str \| None\` |
| \`Literal["a", "b"]\` | 枚举值 | \`status: Literal["draft", "published"]\` |
| \`Enum\` | 枚举类 | \`status: PostStatus\` |

\`EmailStr\` 需要额外装 \`pip install email-validator\`（\`fastapi[standard]\` 已含）。博客系统的文章模型：

\`\`\`python filename="blog_types.py"
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, HttpUrl

class Post(BaseModel):
    id: int
    title: str
    content: str
    status: Literal["draft", "published", "archived"] = "draft"
    tags: list[str] = []
    cover_url: HttpUrl | None = None       # 封面图 URL
    created_at: datetime                   # ISO 8601 字符串会自动解析
    updated_at: datetime | None = None
\`\`\`

---

## 四、Field 约束

\`Field()\` 给字段加约束和元信息。第一个参数是默认值（\`...\` 表示必填，\`None\` 表示可空默认 None）。

\`\`\`python filename="field_constraints.py"
from pydantic import BaseModel, Field

class PostCreate(BaseModel):
    # ... 表示必填；min_length/max_length 约束字符串长度
    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="文章标题，1-100 字符",
        examples=["我的第一篇博客"],
    )
    # 字符串正则约束
    slug: str = Field(
        ...,
        pattern=r"^[a-z0-9-]+$",  # 只允许小写字母、数字、横线
        description="URL 友好的别名",
    )
    # 数值约束
    reading_time: int = Field(
        default=1,
        ge=1,           # 大于等于 1
        le=600,         # 小于等于 600（分钟）
        description="预计阅读时长（分钟）",
    )
    # 列表约束
    tags: list[str] = Field(
        default_factory=list,
        max_length=10,  # 最多 10 个标签
        description="文章标签",
    )
\`\`\`

常用约束：

| 类型 | 约束 | 说明 |
|------|------|------|
| 字符串 | \`min_length\` / \`max_length\` | 长度范围 |
| 字符串 | \`pattern\` | 正则匹配（v2 用 \`pattern\`，v1 是 \`regex\`） |
| 数值 | \`ge\` / \`gt\` / \`le\` / \`lt\` | ≥ / > / ≤ / < |
| 数值 | \`multiple_of\` | 必须是某数的倍数 |
| 列表 | \`max_length\` / \`min_length\` | 元素个数 |
| 通用 | \`default\` / \`default_factory\` | 默认值 / 默认值工厂 |
| 通用 | \`description\` / \`examples\` | 文档元信息 |
| 通用 | \`alias\` | 字段别名（用于和外部字段名映射） |

---

## 五、嵌套模型

模型可以嵌套，表达复杂结构。博客系统的评论嵌套：

\`\`\`python filename="nested_models.py"
from datetime import datetime
from pydantic import BaseModel

class Author(BaseModel):
    id: int
    name: str
    avatar: str | None = None

class Comment(BaseModel):
    id: int
    content: str
    author: Author            # 嵌套作者模型
    created_at: datetime
    replies: list["Comment"] = []  # 自引用：回复也是评论（递归嵌套）

# 解析时自动递归校验整个树
comment = Comment.model_validate({
    "id": 1,
    "content": "写得好！",
    "author": {"id": 10, "name": "张三"},
    "created_at": "2026-06-29T10:00:00",
    "replies": [
        {
            "id": 2,
            "content": "谢谢",
            "author": {"id": 1, "name": "作者"},
            "created_at": "2026-06-29T11:00:00",
            "replies": [],
        }
    ],
})
\`\`\`

自引用（\`list["Comment"]\`）要用字符串引号包裹，因为定义时 \`Comment\` 还没创建完。Pydantic v2 用 \`model_rebuild()\` 处理复杂自引用，绝大多数情况会自动处理。

---

## 六、模型继承

模型可以继承，复用字段定义。博客系统的"创建"和"更新"文章：

\`\`\`python filename="inheritance.py"
from pydantic import BaseModel, Field

# 基类：文章公共字段
class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    tags: list[str] = []

# 创建：继承 PostBase，没有 id（服务端生成）
class PostCreate(PostBase):
    pass

# 更新：字段都可选（用于 PATCH 部分更新）
class PostUpdate(PostBase):
    title: str | None = Field(None, min_length=1, max_length=100)
    content: str | None = None
    tags: list[str] | None = None

# 输出：继承 PostBase，加上服务端字段
class PostOut(PostBase):
    id: int
    author_id: int
\`\`\`

这样三个模型共享 \`title/content/tags\` 的约束定义，改一处全改，避免重复。

---

## 七、自定义验证器

内置约束不够用时，用验证器写自定义规则。v2 提供两种：\`field_validator\`（字段级）和 \`model_validator\`（模型级）。

### 7.1 field_validator：字段级

校验单个字段。比如标题不能包含敏感词：

\`\`\`python filename="field_validator.py"
from pydantic import BaseModel, field_validator

SENSITIVE_WORDS = ["广告", "垃圾"]

class PostCreate(BaseModel):
    title: str
    content: str

    @field_validator("title")
    @classmethod
    def title_must_be_clean(cls, v: str) -> str:
        # v 是已经被基础类型校验过的值
        for word in SENSITIVE_WORDS:
            if word in v:
                raise ValueError(f"标题包含敏感词: {word}")
        return v  # 必须返回处理后的值

    @field_validator("content")
    @classmethod
    def normalize_content(cls, v: str) -> str:
        # 也可以在验证器里做转换，不只是校验
        return v.strip()  # 去掉首尾空白
\`\`\`

注意 v2 的写法：\`@field_validator("字段名")\` + \`@classmethod\`，函数接收值、返回值。抛 \`ValueError\` 会自动变成校验错误。

### 7.2 model_validator：模型级

校验涉及多个字段的规则。比如"结束时间必须晚于开始时间"：

\`\`\`python filename="model_validator.py"
from datetime import datetime
from pydantic import BaseModel, model_validator

class Event(BaseModel):
    start_at: datetime
    end_at: datetime

    @model_validator(mode="after")
    def check_time_range(self) -> "Event":
        # mode="after" 表示字段都校验完后执行
        if self.end_at <= self.start_at:
            raise ValueError("结束时间必须晚于开始时间")
        return self  # 必须返回 self
\`\`\`

\`model_validator\` 有三种 mode：

| mode | 执行时机 | 输入 |
|------|----------|------|
| \`before\` | 字段类型转换前 | 原始输入数据（dict） |
| \`after\` | 字段都校验完后 | 模型实例 self |
| \`wrap\` | 包裹默认校验 | 手动调用下一步 |

博客文章示例：发布状态下必须有封面图：

\`\`\`python filename="model_validator_blog.py"
from pydantic import BaseModel, model_validator

class PostCreate(BaseModel):
    title: str
    content: str
    status: str = "draft"
    cover_url: str | None = None

    @model_validator(mode="after")
    def published_requires_cover(self):
        if self.status == "published" and not self.cover_url:
            raise ValueError("发布状态下必须上传封面图")
        return self
\`\`\`

---

## 八、ConfigDict：模型配置

v2 用 \`model_config = ConfigDict(...)\` 配置模型行为（替代 v1 的 \`class Config:\`）：

\`\`\`python filename="config_dict.py"
from pydantic import BaseModel, ConfigDict

class Post(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,        # 允许从 ORM 对象读属性（原 orm_mode）
        populate_by_name=True,       # 既允许字段名也允许 alias
        str_strip_whitespace=True,   # 自动 strip 字符串
        str_max_length=1000,         # 全局字符串最大长度
        extra="forbid",              # 多传字段就报错（默认 ignore）
    )

    id: int
    title: str
\`\`\`

常用配置：

| 配置 | 默认 | 说明 |
|------|------|------|
| \`from_attributes\` | False | 允许 \`Post.model_validate(orm_obj)\` 从对象属性读 |
| \`populate_by_name\` | False | 既允许字段名也允许 alias 填充 |
| \`str_strip_whitespace\` | False | 自动去除字符串首尾空白 |
| \`extra\` | \`"ignore"\` | 多余字段：忽略 / \`"forbid"\`报错 / \`"allow"\`保留 |
| \`str_max_length\` | None | 全局字符串长度上限 |
| \`frozen\` | False | 模型不可变（hashable，可当字典 key） |

---

## 九、序列化：model_dump

v2 用 \`model_dump()\` 替代 v1 的 \`.dict()\`：

\`\`\`python filename="serialization.py"
from pydantic import BaseModel

class Post(BaseModel):
    id: int
    title: str
    content: str
    internal_note: str = "机密"

p = Post(id=1, title="Hello", content="正文")

# 全量序列化成 dict
p.model_dump()
# {'id': 1, 'title': 'Hello', 'content': '正文', 'internal_note': '机密'}

# 排除某些字段
p.model_dump(exclude={"internal_note"})
# {'id': 1, 'title': 'Hello', 'content': '正文'}

# 只包含某些字段
p.model_dump(include={"id", "title"})
# {'id': 1, 'title': 'Hello'}

# 排除值为 None 的字段
p.model_dump(exclude_none=True)

# 排除未显式设置默认值的字段
p.model_dump(exclude_unset=True)

# 序列化成 JSON 字符串
p.model_dump_json()
# '{"id":1,"title":"Hello","content":"正文","internal_note":"机密"}'
\`\`\`

FastAPI 在响应时内部就是用 \`model_dump()\` 把模型转成 JSON 的。

---

## 十、ORM 模式：from_attributes

实际项目里数据来自数据库（SQLAlchemy 模型），响应要转成 Pydantic 模型。\`from_attributes=True\` 让 Pydantic 能直接从对象属性读：

\`\`\`python filename="orm_mode.py"
from pydantic import BaseModel, ConfigDict

# 响应模型
class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    content: str

# 假装这是 SQLAlchemy 的 ORM 对象（有同名属性）
class FakeOrmPost:
    def __init__(self, id, title, content, secret):
        self.id = id
        self.title = title
        self.content = content
        self.secret = secret  # 这个字段 PostOut 没有，会被自动忽略

orm_post = FakeOrmPost(1, "Hello", "正文", "不该泄露")

# 从 ORM 对象转成 Pydantic 模型
post = PostOut.model_validate(orm_post)
print(post)  # id=1 title='Hello' content='正文'
\`\`\`

在 FastAPI 路由里，你从数据库查出 ORM 对象，直接 \`return\`，\`response_model=PostOut\` 会自动调 \`model_validate\` 转换。这是 FastAPI + SQLAlchemy 的标准玩法，第 6 章会详细讲。

---

## 十一、完整 demo：用户注册 Schema

把本章学的串起来，写一个用户注册的完整 Schema：

\`\`\`python filename="user_register_schema.py"
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator, ConfigDict

class UserRegister(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z0-9_]+$",  # 只允许字母数字下划线
        description="用户名，3-20 字符",
    )
    email: EmailStr = Field(..., description="邮箱")
    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="密码，8-64 字符",
    )
    password_confirm: str = Field(..., description="确认密码")
    nickname: str = Field(..., min_length=1, max_length=30)
    bio: str | None = Field(None, max_length=200, description="个人简介")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """检查密码强度：必须含字母和数字"""
        if not (any(c.isalpha() for c in v) and any(c.isdigit() for c in v)):
            raise ValueError("密码必须同时包含字母和数字")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        """两次密码必须一致"""
        if self.password != self.password_confirm:
            raise ValueError("两次输入的密码不一致")
        return self


# 在 FastAPI 里用
from fastapi import FastAPI

app = FastAPI()

@app.post("/register")
async def register(user: UserRegister):
    # 走到这里，所有校验都已经通过
    # 实际要存数据库（密码要先 hash）
    return {
        "username": user.username,
        "email": user.email,
        "nickname": user.nickname,
    }
\`\`\`

这个例子综合运用了：\`Field\` 约束、\`pattern\` 正则、\`field_validator\` 字段级校验、\`model_validator\` 模型级校验、\`ConfigDict\` 配置。一个注册接口的入参校验，全部声明式搞定，不用写一行 if-else。

---

## 十二、小结

- **Pydantic v2** 用 Rust 重写核心，校验快、API 清晰；v1 的 \`.dict()\`/\`@validator\`/\`class Config:\` 在 v2 改名为 \`.model_dump()\`/\`@field_validator\`/\`model_config\`。
- **字段类型**丰富，\`EmailStr\`/\`HttpUrl\`/\`datetime\`/\`Literal\` 开箱即用。
- **Field 约束**：\`min_length\`/\`max_length\`/\`ge\`/\`le\`/\`pattern\` 等，声明式校验。
- **嵌套模型**用类型注解组合，支持自引用递归。
- **field_validator** 校验单字段，**model_validator** 校验跨字段规则（\`mode="after"\` 最常用）。
- **ConfigDict** 配置模型行为，\`from_attributes=True\` 让模型能从 ORM 对象读属性。
- **model_dump()** 序列化，支持 \`exclude\`/\`include\`/\`exclude_none\` 等过滤。

下一章学 FastAPI 的依赖注入系统——把数据库会话、当前用户、权限检查这些公共逻辑抽成可复用的依赖。
`
  },

  // =========================================================
  // 第五章：依赖注入系统
  // =========================================================
  {
    id: "pyweb-di",
    group: "基础入门",
    icon: "🔌",
    title: "依赖注入系统",
    content: `

# 依赖注入系统

## 一、什么是依赖注入，为什么需要它

**依赖注入（Dependency Injection，简称 DI）** 是一种设计模式：把组件需要的"依赖"从外部传入，而不是在组件内部自己创建。听起来抽象，看个具体场景。

博客系统里，几乎每个接口都要做这几件事：

1. **解析分页参数**（skip/limit）
2. **拿到数据库会话**（查文章、查用户都要）
3. **识别当前登录用户**（发文、评论需要）
4. **检查权限**（只有作者能改自己的文章）

如果每个接口都把这些逻辑抄一遍，代码会重复得可怕，改一处要改十处。依赖注入就是解决这个问题的：**把这些公共逻辑封装成"依赖"，让框架自动注入到需要的路由里**。

FastAPI 的依赖注入系统是它最被低估的特性之一。它的核心函数是 \`Depends()\`，能注入函数、能注入类、能注入 yield、能嵌套、能缓存——非常强大。

---

## 二、Depends 基础

最简单的依赖：一个普通函数，被 \`Depends()\` 包装后注入到路由参数里。

\`\`\`python filename="basic_depends.py"
from fastapi import FastAPI, Depends

app = FastAPI()

# 定义一个依赖：解析分页参数
def common_pagination(skip: int = 0, limit: int = 10):
    """公共分页依赖：返回分页参数字典"""
    return {"skip": skip, "limit": limit}

@app.get("/posts")
# 依赖注入：pagination 的值由 common_pagination 的返回值提供
async def list_posts(pagination: dict = Depends(common_pagination)):
    # pagination 已经是 {"skip": 0, "limit": 10}
    return {"pagination": pagination, "items": []}

@app.get("/comments")
# 另一个接口复用同一个依赖
async def list_comments(pagination: dict = Depends(common_pagination)):
    return {"pagination": pagination, "items": []}
\`\`\`

这里发生了什么：

1. FastAPI 看到 \`pagination: dict = Depends(common_pagination)\`，知道 \`pagination\` 的值要由 \`common_pagination\` 函数提供。
2. FastAPI 调用 \`common_pagination\`，**自动把它需要的参数（skip/limit）从请求里解析出来**。
3. \`common_pagination\` 的返回值赋给 \`pagination\`。
4. 路由函数拿到 \`pagination\` 执行业务。

关键洞察：**依赖函数自己也可以有参数，FastAPI 会递归地解析这些参数**。这意味着分页参数的解析逻辑只在 \`common_pagination\` 里写一次，所有用它的接口都自动获得一致的解析行为。

### 为什么不直接写 skip/limit

对比两种写法，表面等价：

\`\`\`python filename="compare.py"
# 写法 A：每个接口自己声明分页参数
@app.get("/posts")
async def list_posts(skip: int = 0, limit: int = 10):
    ...

# 写法 B：用依赖
@app.get("/posts")
async def list_posts(pagination: dict = Depends(common_pagination)):
    ...
\`\`\`

写法 B 的好处：

- **DRY**：分页逻辑（含校验、默认值、文档描述）集中在一处。
- **可组合**：依赖可以嵌套，分页依赖可以再依赖"当前用户"依赖。
- **可测试**：测试时可以替换依赖（用 \`app.dependency_overrides\`）。
- **可复用**：同一个依赖能用在几十个接口上。

---

## 三、依赖嵌套

依赖可以依赖别的依赖，形成树状结构。FastAPI 会按依赖图自动解析。

\`\`\`python filename="nested_depends.py"
from fastapi import FastAPI, Depends, Header, HTTPException

app = FastAPI()

# 依赖 1：从 Header 提取 token
def get_token(x_token: str = Header(..., alias="X-Token")):
    if not x_token:
        raise HTTPException(401, "缺少 token")
    return x_token

# 依赖 2：根据 token 查当前用户（依赖 get_token）
def get_current_user(token: str = Depends(get_token)):
    # 实际要查数据库/解 JWT，这里简化
    if token == "secret-admin-token":
        return {"id": 1, "username": "admin", "role": "admin"}
    raise HTTPException(401, "无效 token")

# 依赖 3：检查是否管理员（依赖 get_current_user）
def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "需要管理员权限")
    return user

@app.delete("/posts/{post_id}")
# 注入 require_admin：它会自动级联解析 get_current_user → get_token
async def delete_post(post_id: int, admin: dict = Depends(require_admin)):
    return {"deleted": post_id, "by": admin["username"]}
\`\`\`

调用 \`DELETE /posts/1\` 时，FastAPI 的解析顺序：

1. 解析 \`require_admin\` → 发现它需要 \`get_current_user\`
2. 解析 \`get_current_user\` → 发现它需要 \`get_token\`
3. 解析 \`get_token\` → 从 Header 读 \`X-Token\`
4. 如果任一环节抛异常，直接返回错误，不进路由

这种"按需组合"的依赖树，让你能把鉴权逻辑拆成原子小块，按接口需要灵活组合。

---

## 四、yield 依赖：资源清理

有些依赖要管理资源（数据库连接、文件句柄、锁），用完要释放。普通 \`return\` 依赖没法做清理，**\`yield\` 依赖**专门解决这个问题。

\`\`\`python filename="yield_depends.py"
from fastapi import FastAPI, Depends

app = FastAPI()

# yield 依赖：yield 之前是"获取资源"，yield 之后是"清理资源"
def get_db():
    print("→ 打开数据库连接")
    db = {"connection": "open"}  # 假装是数据库会话
    try:
        yield db  # 把 db 注入给路由
        print("← 路由执行完毕，准备清理")
    finally:
        print("✗ 关闭数据库连接")
        db["connection"] = "closed"

@app.get("/posts")
async def list_posts(db = Depends(get_db)):
    # db 是 yield 出来的那个对象
    print(f"  路由里用 db: {db}")
    return {"db_state": db["connection"]}
\`\`\`

请求处理顺序：

1. 进入 \`get_db\`，执行到 \`yield db\`，把 db 交给路由。
2. 路由执行业务逻辑。
3. 路由返回后，\`get_db\` 从 \`yield\` 处继续执行 \`finally\`，清理资源。

如果路由抛了异常，\`finally\` 也会执行——资源不会泄漏。这是数据库会话的标准写法（第 6 章会用 SQLAlchemy 的真实会话）。

### yield 依赖能捕获异常

\`yield\` 依赖还可以捕获路由里的异常：

\`\`\`python filename="yield_catch.py"
def get_db():
    db = open_connection()
    try:
        yield db
    except Exception:
        # 路由里抛异常时，会从 yield 处抛出
        db.rollback()
        raise  # 继续抛出，让 FastAPI 处理
    else:
        # 路由正常返回，提交事务
        db.commit()
    finally:
        db.close()
\`\`\`

这是"请求级事务"的标准模式：一个请求一个事务，成功提交、失败回滚。

---

## 五、类作为依赖

任何可调用对象都能当依赖，类的 \`__init__\` 也可以：

\`\`\`python filename="class_depends.py"
from fastapi import FastAPI, Depends, Query

app = FastAPI()

# 类作为依赖：FastAPI 会调 MyClass(...)，参数从请求解析
class Pagination:
    def __init__(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1, le=100),
    ):
        self.skip = skip
        self.limit = limit

    def slice(self, items: list):
        """辅助方法：直接对列表切片"""
        return items[self.skip : self.skip + self.limit]

@app.get("/posts")
async def list_posts(page: Pagination = Depends(Pagination)):
    all_posts = [{"id": i} for i in range(1, 50)]
    # page 是 Pagination 实例，可以调它的方法
    return {"total": len(all_posts), "items": page.slice(all_posts)}
\`\`\`

类依赖的好处：可以带方法（如 \`page.slice()\`），比返回字典更好用。注意 \`Depends(Pagination)\` 里写的是类本身。

---

## 六、全局依赖

有些依赖要应用到所有接口（如全局鉴权、日志）。可以挂到整个 app 或 router 上：

\`\`\`python filename="global_depends.py"
from fastapi import FastAPI, Depends, Header, HTTPException

# 全局依赖：校验 token
def verify_token(x_token: str = Header(..., alias="X-Token")):
    if x_token != "secret":
        raise HTTPException(401, "无效 token")

# 挂到 app：所有路由都会执行这个依赖
app = FastAPI(dependencies=[Depends(verify_token)])

@app.get("/posts")
async def list_posts():
    return [{"id": 1}]  # 走到这里说明 token 已校验通过

@app.get("/users")
async def list_users():
    return [{"id": 1}]
\`\`\`

也可以挂到 APIRouter：

\`\`\`python filename="router_depends.py"
from fastapi import APIRouter, Depends

# 这个 router 下所有接口都要先过 verify_token
admin_router = APIRouter(
    prefix="/admin",
    tags=["管理后台"],
    dependencies=[Depends(verify_token)],
)

@admin_router.get("/stats")
async def admin_stats():
    return {"users": 100, "posts": 50}
\`\`\`

全局依赖的特点：**它的返回值不会作为参数注入路由**（因为不知道注入给谁），只用来执行副作用（鉴权、日志）。

---

## 七、依赖缓存

默认情况下，**同一个请求里，同一个依赖只执行一次**，结果会被缓存复用。

\`\`\`python filename="cache_depends.py"
counter = 0

def get_user():
    global counter
    counter += 1
    print(f"get_user 被调用，counter={counter}")
    return {"id": 1, "name": "admin"}

@app.get("/profile")
async def profile(
    user1 = Depends(get_user),
    user2 = Depends(get_user),  # 同一依赖，会用缓存
):
    # user1 和 user2 是同一个对象
    return {"same": user1 is user2}  # True
\`\`\`

上面虽然 \`get_user\` 被声明两次，但只执行一次，\`user1 is user2\` 为 \`True\`。

要禁用缓存（每次都重新执行），用 \`use_cache=False\`：

\`\`\`python filename="no_cache.py"
user = Depends(get_user, use_cache=False)
\`\`\`

缓存的典型价值：\`get_db\` 在一个请求里被多个依赖调用，但只开一个连接；\`get_current_user\` 只查一次数据库，后续都用缓存结果。

---

## 八、Annotated 写法（Python 3.9+ 推荐）

前面所有示例用的都是 \`param = Depends(...)\` 默认值写法。Python 3.9+ 引入了 \`Annotated\` 类型，FastAPI 推荐用 **Annotated 写法**，更清晰、可复用：

\`\`\`python filename="annotated.py"
from typing import Annotated
from fastapi import FastAPI, Depends, Query

app = FastAPI()

# Annotated 写法：把依赖信息放进类型注解
def common_pagination(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    return {"skip": skip, "limit": limit}

# 定义一个带依赖的类型别名，可复用
PaginationDep = Annotated[dict, Depends(common_pagination)]

@app.get("/posts")
async def list_posts(pagination: PaginationDep):  # 直接用类型别名
    return pagination

@app.get("/comments")
async def list_comments(pagination: PaginationDep):  # 复用
    return pagination
\`\`\`

对比两种写法：

\`\`\`python filename="compare_annotated.py"
# 旧写法：默认值放 Depends
async def list_posts(pagination: dict = Depends(common_pagination)):
    ...

# 新写法：Annotated 把依赖放进类型
PaginationDep = Annotated[dict, Depends(common_pagination)]
async def list_posts(pagination: PaginationDep):
    ...
\`\`\`

Annotated 写法的好处：

1. **类型即文档**：\`pagination: PaginationDep\` 一眼能看出这是个分页依赖。
2. **可复用**：定义一次 \`PaginationDep\`，到处用，改一处全改。
3. **不占默认值位置**：参数可以有真正的默认值。
4. **IDE 友好**：类型检查器能更好理解。

本教程后续示例统一用 Annotated 写法，这是 FastAPI 官方在 0.95+ 推荐的现代风格。

### Annotated 组合

Annotated 可以叠加多个元信息：

\`\`\`python filename="annotated_combine.py"
from typing import Annotated
from fastapi import Depends, Query

# 把 Query 约束和 Depends 依赖都放进 Annotated
def get_pagination(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    return skip, limit

PageParams = Annotated[tuple[int, int], Depends(get_pagination)]

@app.get("/posts")
async def list_posts(params: PageParams):
    skip, limit = params
    return {"skip": skip, "limit": limit}
\`\`\`

---

## 九、完整 demo：博客系统的公共依赖

把本章学的串起来，写博客系统常用的几个依赖：

\`\`\`python filename="blog_dependencies.py"
from typing import Annotated
from fastapi import FastAPI, Depends, Header, HTTPException, Query, status

app = FastAPI()

# ---------- 依赖 1：分页参数 ----------
class PageParams:
    """分页参数依赖（类形式）"""
    def __init__(
        self,
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=100, description="每页条数"),
    ):
        self.skip = skip
        self.limit = limit

# Annotated 类型别名
PageParamsDep = Annotated[PageParams, Depends(PageParams)]


# ---------- 依赖 2：数据库会话（yield 依赖） ----------
def get_db():
    """模拟数据库会话，请求结束自动关闭"""
    print("  [DB] 打开连接")
    db = {"session_id": "abc-123"}
    try:
        yield db
    finally:
        print("  [DB] 关闭连接")

DbDep = Annotated[dict, Depends(get_db)]


# ---------- 依赖 3：当前用户（嵌套依赖） ----------
def get_current_user(
    db: DbDep,  # 依赖数据库会话
    x_token: str = Header(..., alias="X-Token"),
):
    """根据 token 解析当前用户"""
    if x_token == "admin-token":
        return {"id": 1, "username": "admin", "role": "admin"}
    if x_token == "user-token":
        return {"id": 2, "username": "alice", "role": "user"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效 token",
        headers={"WWW-Authenticate": "Bearer"},
    )

CurrentUser = Annotated[dict, Depends(get_current_user)]


# ---------- 依赖 4：管理员权限（依赖当前用户） ----------
def require_admin(user: CurrentUser):
    """要求当前用户是管理员"""
    if user["role"] != "admin":
        raise HTTPException(403, "需要管理员权限")
    return user

AdminUser = Annotated[dict, Depends(require_admin)]


# ---------- 路由：组合使用 ----------
@app.get("/posts")
async def list_posts(page: PageParamsDep, db: DbDep):
    """公开接口：分页 + 数据库"""
    print(f"  查询 skip={page.skip} limit={page.limit}, db={db['session_id']}")
    return {"skip": page.skip, "limit": page.limit, "items": []}

@app.get("/me")
async def get_me(user: CurrentUser):
    """需要登录：注入当前用户"""
    return user

@app.delete("/posts/{post_id}")
async def delete_post(post_id: int, admin: AdminUser):
    """需要管理员：注入管理员用户"""
    return {"deleted": post_id, "by": admin["username"]}
\`\`\`

这个 demo 综合运用了：

- **类依赖**（\`PageParams\`）
- **yield 依赖**（\`get_db\` 资源清理）
- **依赖嵌套**（\`get_current_user\` 依赖 \`get_db\`；\`require_admin\` 依赖 \`get_current_user\`）
- **Annotated 类型别名**（\`PageParamsDep\`/\`DbDep\`/\`CurrentUser\`/\`AdminUser\`）
- **依赖缓存**（一个请求里 \`get_db\` 只执行一次，\`CurrentUser\` 和 \`AdminUser\` 共用同一个 user）

调用示例：

\`\`\`bash filename="测试接口"
# 公开接口，带分页
curl "http://127.0.0.1:8000/posts?skip=0&limit=5"

# 普通用户接口
curl -H "X-Token: user-token" http://127.0.0.1:8000/me

# 管理员接口
curl -X DELETE -H "X-Token: admin-token" http://127.0.0.1:8000/posts/1

# 非管理员调管理员接口 → 403
curl -X DELETE -H "X-Token: user-token" http://127.0.0.1:8000/posts/1
\`\`\`

---

## 十、依赖覆盖：方便测试

测试时，你可能不想真的连数据库、不想真的解 JWT。FastAPI 提供 \`app.dependency_overrides\` 替换依赖：

\`\`\`python filename="test_override.py"
from fastapi.testclient import TestClient

# 假的数据库会话，测试用
def fake_db():
    yield {"session_id": "fake-test-db"}

# 假的当前用户
def fake_user():
    return {"id": 99, "username": "tester", "role": "admin"}

# 替换依赖
app.dependency_overrides[get_db] = fake_db
app.dependency_overrides[get_current_user] = fake_user

client = TestClient(app)

def test_delete_post():
    # 不需要真实 token，依赖已被替换
    resp = client.delete("/posts/1")
    assert resp.status_code == 200

# 测试完清理
app.dependency_overrides.clear()
\`\`\`

\`dependency_overrides[原依赖] = 替换依赖\` 是单元测试的金钥匙，让你能隔离数据库、第三方服务，只测业务逻辑。

---

## 十一、依赖注入的设计哲学

FastAPI 的 DI 系统体现了几个好的设计原则：

| 原则 | 体现 |
|------|------|
| **单一职责** | 每个依赖只做一件事（分页/鉴权/会话） |
| **组合优于继承** | 用依赖嵌套组合能力，不用深层继承链 |
| **声明式** | 函数签名声明依赖，框架自动解析 |
| **可测试** | 依赖可替换，业务逻辑可隔离测试 |
| **渐进式** | 简单接口不用依赖，复杂接口才用，不强制 |

这种风格让代码组织非常清晰：路由函数只写"业务编排"，所有横切关注点（鉴权、参数、会话、日志）都抽成依赖。当接口多了之后，这种分层会让维护成本远低于"路由里堆逻辑"的写法。

---

## 十二、小结

- **Depends** 是 FastAPI 依赖注入的核心，把公共逻辑封装成依赖，框架自动解析和注入。
- **依赖可嵌套**：依赖能依赖别的依赖，形成树状结构，按需组合鉴权、会话等能力。
- **yield 依赖**管理资源生命周期：yield 前获取、yield 后清理，是数据库会话的标准写法。
- **全局依赖**挂到 app/router，做全局鉴权、日志，返回值不注入路由。
- **类依赖**带方法更好用，\`Depends(MyClass)\` 注入实例。
- **依赖缓存**：同请求同依赖只执行一次，\`use_cache=False\` 可禁用。
- **Annotated 写法**是现代推荐风格：\`Annotated[T, Depends(dep)]\`，可定义类型别名复用。
- **dependency_overrides** 让测试时替换依赖成为可能，是单元测试的利器。

至此，基础入门篇 5 章全部完成。你已经掌握了 FastAPI 的全貌、环境搭建、路由与请求响应、Pydantic v2 数据验证、依赖注入系统——具备了进入进阶篇（数据库、认证、测试、部署）的全部前置知识。下一批章节我们会接入真实数据库，把博客系统从"内存版"升级到"持久化版"。
`
  }
];
