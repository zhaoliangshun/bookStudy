// =============================================================
// Python Web 应用开发实战教程 - 第 2 批章节（WSGI 与 ASGI 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   wsgi-concept    : WSGI 协议详解
//   asgi-concept    : ASGI 协议详解
//   server-gunicorn : Gunicorn 服务器
//   server-uvicorn  : Uvicorn 服务器
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 5 章：WSGI 协议详解
  // ============================================================
  {
    id: "wsgi-concept",
    group: "WSGI 与 ASGI",
    icon: "🔌",
    title: "WSGI 协议详解",
    content: `# WSGI 协议详解

## 一句话定义

WSGI（Web Server Gateway Interface，Web 服务器网关接口）是 Python Web 服务器和 Web 框架之间的一套接口规范。它规定了一个 Python 应用该长什么样，服务器该怎么调用它。简单说：WSGI 让「服务器」和「框架」能解耦——你换服务器不用改框架，换框架不用改服务器。

## 为什么需要 WSGI

在 WSGI 出现之前（PEP 3333，2010 年定稿），Python Web 世界很乱：每个服务器和每个框架都有自己的对接方式。你想用 Nginx + Flask？对不起，得写专门的适配。换个框架又得改一遍。

这就像每个品牌的手机用不同的充电口——服务器是充电器，框架是手机，接口不统一就得配各种转接头。

WSGI 的意义就是**统一接口**：
- 服务器只要按 WSGI 规范实现，就能跑任何 WSGI 框架（Flask、Django、Bottle……）。
- 框架只要按 WSGI 规范写，就能跑在任何 WSGI 服务器上（gunicorn、uWSGI、waitress……）。

一个标准，解开了 N×M 的组合爆炸，变成 N+M。这是 Python Web 生态能繁荣的基础。

## WSGI 应用签名

WSGI 规定一个应用必须是一个**可调用对象（callable）**，通常是函数，签名固定：

\`\`\`python
def app(environ, start_response):
    # environ: 字典，包含所有请求信息
    # start_response: 回调函数，用来发送状态码和响应头
    # 返回值: 一个可迭代对象，每个元素是响应正文的字节
    ...
\`\`\`

两个参数：
- \`environ\`：一个字典，装着请求的全部信息（方法、路径、查询串、请求头等）。
- \`start_response\`：一个回调函数，应用调用它来「告诉」服务器要返回的状态码和响应头。

返回值：一个**可迭代的字节串**。最简单的是一个列表 \`[b"hello"]\`，也可以是生成器。

## environ 字典

\`environ\` 把 HTTP 请求翻译成了一堆环境变量，常用的有：

| 键 | 含义 | 示例 |
|----|------|------|
| REQUEST_METHOD | HTTP 方法 | "GET" / "POST" |
| PATH_INFO | 请求路径 | "/api/users" |
| QUERY_STRING | 查询串 | "page=2&role=admin" |
| SERVER_NAME | 服务器主机名 | "example.com" |
| SERVER_PORT | 端口 | "8000" |
| HTTP_HOST | Host 头 | "example.com" |
| HTTP_USER_AGENT | User-Agent 头 | "Mozilla/5.0..." |
| CONTENT_TYPE | 正文类型 | "application/json" |
| CONTENT_LENGTH | 正文长度 | "128" |
| wsgi.input | 读正文的文件对象 | — |

注意请求头在 environ 里的命名规则：**HTTP\_ 加上头部名大写，横线变下划线**。比如 \`User-Agent\` 变成 \`HTTP_USER_AGENT\`。这是 CGI 时代的传统。

## start_response 回调

\`start_response\` 是服务器传给你的函数，你调用它来发送响应行和头部：

\`\`\`python
start_response(status, headers, exc_info=None)
\`\`\`

- \`status\`：字符串，格式是 \`"200 OK"\`（状态码 + 原因短语）。
- \`headers\`：列表，元素是 \`[(header_name, header_value), ...]\`。
- \`exc_info\`：错误处理用，一般不传。

调用它并不会立刻把数据发给客户端，而是「声明」了状态和头部。真正发送要等返回的可迭代对象被消费时。

## 完整的 WSGI 应用示例

\`\`\`python
def application(environ, start_response):
    # 1. 从 environ 取请求信息
    method = environ.get("REQUEST_METHOD", "GET")
    path = environ.get("PATH_INFO", "/")
    query = environ.get("QUERY_STRING", "")
    
    # 2. 根据路径处理（最简单的路由）
    if path == "/" and method == "GET":
        status = "200 OK"
        headers = [("Content-Type", "text/plain; charset=utf-8")]
        body = "Hello, WSGI!"
    elif path == "/api/time" and method == "GET":
        import datetime
        status = "200 OK"
        headers = [("Content-Type", "application/json")]
        body = '{"time": "' + datetime.datetime.now().isoformat() + '"}'
    else:
        status = "404 Not Found"
        headers = [("Content-Type", "text/plain")]
        body = "Not Found"
    
    # 3. 调用 start_response，发送状态码和头部
    start_response(status, headers)
    
    # 4. 返回可迭代的字节串（注意要 encode 成字节）
    return [body.encode("utf-8")]
\`\`\`

这就是一个完整的 WSGI 应用。你给它 environ 和 start_response，它返回字节列表。任何 WSGI 服务器都能跑它。

用 Python 自带的 wsgiref 跑起来看看：

\`\`\`python
from wsgiref.simple_server import make_server

# 把上面的 application 函数传给 make_server
server = make_server("0.0.0.0", 8000, application)
print("WSGI 应用跑在 http://localhost:8000")
server.serve_forever()
\`\`\`

访问 \`http://localhost:8000\` 看到 Hello, WSGI！这就是 Flask、Django 背后的本质——它们只是把这套封装得更优雅。

## WSGI 服务器

WSGI 应用不能自己监听端口（它只是个函数），需要专门的 WSGI 服务器来：
1. 监听端口，接收 HTTP 连接。
2. 把 HTTP 请求解析成 environ。
3. 调用你的 WSGI 应用，传入 environ 和 start_response。
4. 把应用返回的字节发给客户端。

常见的 WSGI 服务器：
- **Gunicorn**：最流行，稳定、配置简单、性能好。
- **uWSGI**：功能多但配置复杂，老项目常用。
- **waitress**：纯 Python，跨平台，Windows 友好。
- **gunicorn + uvicorn worker**：跑 ASGI 应用的组合（后面讲）。

开发时用的 \`flask run\`、\`python manage.py runserver\` 内置的是开发服务器（Werkzeug），**绝对不能用于生产**——单线程、无并发、慢。

## WSGI 中间件

中间件是「包装」应用的另一层应用。它既像服务器（调用内层应用），又像应用（被外层调用）：

\`\`\`python
class TimingMiddleware:
    """计时中间件：记录每个请求的处理时间"""
    def __init__(self, app):
        self.app = app  # 被包装的内层应用
    
    def __call__(self, environ, start_response):
        import time
        start = time.time()
        # 调用内层应用
        response = self.app(environ, start_response)
        elapsed = time.time() - start
        # 记录耗时（这里简化为打印）
        print(f"{environ['PATH_INFO']} 耗时 {elapsed:.4f}s")
        return response

# 用中间件包装应用
wrapped_app = TimingMiddleware(application)
# 现在 wrapped_app 也是一个 WSGI 应用，可以传给服务器
\`\`\`

中间件能干很多事：日志、认证、CORS、压缩、限流……Flask 的 \`before_request\`/Django 的中间件本质上都是这套机制。

## 同步模型

WSGI 是**同步（synchronous）**的：一个请求一个线程/进程，处理完才能处理下一个。当你的视图函数在等数据库查询时，这个线程就卡住了，别的请求只能排队。

为什么？因为 WSGI 设计于 2003 年（PEP 333），那时候 Python 还没有 async/await，多线程是主流的并发模型。服务器靠多进程/多线程来扛并发：
- Gunicorn 默认 pre-fork 出多个 worker 进程。
- 每个 worker 进程可以再开多线程。

## 为什么 WSGI 不支持异步和 WebSocket

这是 WSGI 最大的局限，也是 ASGI 诞生的原因：

1. **不支持 async/await**：WSGI 的 \`app(environ, start_response)\` 是同步调用，必须立刻返回响应。async 函数返回的是协程对象，不是字节列表——根本对不上 WSGI 的接口。

2. **不支持 WebSocket**：WebSocket 是「长连接」，建立后服务器和客户端可以双向持续通信。但 WSGI 模型是「请求来了 -> 处理 -> 返回 -> 结束」，一次调用对应一次响应，没法表达「持续通信」。

3. **不支持 HTTP/2**：HTTP/2 有多路复用、服务器推送，WSGI 的请求-响应模型表达不了。

正因为这些局限，Python 社区推出了 ASGI（下一章）。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘 encode | return ["hello"] | return [b"hello"] |
| status 格式错 | "200" | "200 OK" |
| headers 不是列表 | ("Content-Type", "text/plain") | [("Content-Type", "text/plain")] |
| 用开发服务器上生产 | flask run 跑线上 | 用 gunicorn 部署 |
| 请求头取值 | environ["User-Agent"] | environ["HTTP_USER_AGENT"] |
| 同步卡死 | WSGI 里跑长耗时请求阻塞线程 | 用异步框架或后台任务 |

下一章我们看 ASGI 如何用事件驱动的思路解决 WSGI 的局限。`
  },

  // ============================================================
  // 第 6 章：ASGI 协议详解
  // ============================================================
  {
    id: "asgi-concept",
    group: "WSGI 与 ASGI",
    icon: "⚡",
    title: "ASGI 协议详解",
    content: `# ASGI 协议详解

## 一句话定义

ASGI（Asynchronous Server Gateway Interface，异步服务器网关接口）是 WSGI 的异步升级版。它用「事件驱动」的模型重新定义了服务器和框架之间的接口，支持 async/await、WebSocket、HTTP/2，是现代 Python Web（FastAPI、Starlette、Django 3.0+ async）的底座。

## 为什么需要 ASGI

上一章我们看到 WSGI 有三个硬伤：不支持 async、不支持 WebSocket、不支持 HTTP/2。

随着 Web 应用变复杂（实时聊天、推送、长轮询），同步的 WSGI 模型越来越吃力。一个聊天服务器，每个连接要一直挂着等消息，WSGI 得用一整个线程一直占着——一万个连接要一万线程，内存和上下文切换开销爆炸。

异步 I/O 才是正解：一个事件循环能同时管理上万个连接，哪个有数据就处理哪个，没数据时不占 CPU。Node.js、Go、Nginx 都是这套思路。

ASGI 就是把这套异步模型标准化，给 Python Web 一个统一的异步接口规范。

## ASGI 应用签名

ASGI 应用也是一个可调用对象，但参数变了：

\`\`\`python
async def app(scope, receive, send):
    # scope: 字典，连接的「类型和元信息」
    # receive: 异步函数，用来接收对方发来的事件
    # send: 异步函数，用来发送事件给对方
    ...
\`\`\`

注意三个关键变化：
1. **async def**：ASGI 应用是协程函数，可以 await。
2. **scope 替代 environ**：装的是连接级别的信息。
3. **receive/send 替代 start_response**：用「收发事件」来表达通信，而不是「一次性返回响应」。

## scope 字典

\`scope\` 描述这次「连接」是什么。最重要的字段是 \`type\`，区分连接类型：

\`\`\`python
{
    "type": "http",          # 连接类型：http / websocket / lifespan
    "method": "GET",         # HTTP 方法（http 才有）
    "path": "/api/users",    # 请求路径
    "query_string": b"page=2",  # 查询串（字节）
    "headers": [...],        # 请求头列表（字节对）
    "client": ("1.2.3.4", 5000),  # 客户端地址
    "server": ("0.0.0.0", 8000),  # 服务器地址
    "scheme": "http",        # 协议
}
\`\`\`

三种 type：
- \`http\`：普通 HTTP 请求。
- \`websocket\`：WebSocket 连接。
- \`lifespan\`：应用启停事件（启动时初始化、关闭时清理）。

## receive 与 send：事件驱动

这是 ASGI 和 WSGI 最大的区别。WSGI 是「调一次函数拿一次响应」，ASGI 是「收发一连串事件」。

一次 HTTP 请求，服务器和应用的对话：

**服务器 -> 应用（receive 收到的事件）：**
- \`http.request\`：请求来了，带 body（可能分多次，流式）。
- \`http.disconnect\`：客户端断开了。

**应用 -> 服务器（send 发送的事件）：**
- \`http.response.start\`：响应开始，发状态码和头部。
- \`http.response.body\`：响应正文（可以分多次发，流式）。

\`\`\`python
async def app(scope, receive, send):
    # 1. 等待请求事件（receive 收请求）
    request = await receive()
    body = request.get("body", b"")  # 请求正文
    
    # 2. 发送响应开始事件：状态码 + 头部
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [[b"content-type", b"application/json"]],
    })
    
    # 3. 发送响应正文事件
    await send({
        "type": "http.response.body",
        "body": b'{"message": "Hello, ASGI!"}',
    })
\`\`\`

看出门道了吗？响应不是「一次返回」，而是「先发 start 事件，再发 body 事件」。body 还能分多次发，实现**流式响应**（边生成边发，比如大文件下载、SSE 推送）。

## 事件驱动模型

ASGI 的核心是**事件驱动（event-driven）**：
- 一切通信都是「事件」的收发。
- 收发是异步的，\`await receive()\` 挂起等待，不阻塞线程。
- 一个事件循环可以同时管理成千上万个这样的协程。

对比 WSGI：
- WSGI：请求来了 -> 同步处理（卡线程）-> 返回。
- ASGI：请求来了 -> 启动一个协程 -> 协程在 await 时让出 CPU -> 事件循环处理别的 -> 数据好了再回来。

这就是 ASGI 能扛高并发的秘密：**I/O 等待时不占资源**。

## WebSocket 支持

ASGI 天然支持 WebSocket，因为它的「收发事件」模型正好匹配 WebSocket 的「双向通信」：

\`\`\`python
async def app(scope, receive, send):
    if scope["type"] == "websocket":
        # 1. 等客户端发起 WebSocket 握手
        event = await receive()
        if event["type"] == "websocket.connect":
            # 接受连接
            await send({"type": "websocket.accept"})
        
        # 2. 循环收发消息
        while True:
            event = await receive()
            if event["type"] == "websocket.disconnect":
                break  # 客户端断开
            # 收到消息，原样回显
            message = event.get("text", "")
            await send({
                "type": "websocket.send",
                "text": f"你说了: {message}",
            })
\`\`\`

WSGI 根本没法表达这种「循环收发」——它的接口要求一次调用返回一次响应。

## ASGI 服务器

常见的 ASGI 服务器：
- **Uvicorn**：最流行，基于 uvloop（C 实现的事件循环）+ httptools，快。
- **Hypercorn**：支持 HTTP/2 和 HTTP/3，功能全。
- **Daphne**：Django Channels 用的，Django 项目常见。

## ASGI vs WSGI 对比

| 维度 | WSGI | ASGI |
|------|------|------|
| 同步/异步 | 同步 | 异步（也兼容同步） |
| 接口签名 | app(environ, start_response) | async app(scope, receive, send) |
| 通信模型 | 一次调用一次响应 | 事件收发 |
| WebSocket | 不支持 | 支持 |
| HTTP/2 | 不支持 | 支持 |
| 并发模型 | 多线程/多进程 | 事件循环 + 协程 |
| 适用场景 | 传统请求-响应 | 实时、高并发、I/O 密集 |
| 代表框架 | Flask、Django（传统） | FastAPI、Starlette、Django（async） |

选型建议：
- 纯 CRUD、I/O 不密集，WSGI（Flask）够用，简单稳定。
- 实时通信、高并发、大量 I/O 等待（调外部 API、查数据库），ASGI（FastAPI）更合适。
- ASGI 也能跑同步代码（FastAPI 把 \`def\` 视图自动放线程池），不是非此即彼。

## 代码示例：手写 ASGI 应用

一个能区分 HTTP 和 WebSocket 的完整 ASGI 应用：

\`\`\`python
async def application(scope, receive, send):
    # 根据 type 分发到不同处理函数
    if scope["type"] == "http":
        await handle_http(scope, receive, send)
    elif scope["type"] == "websocket":
        await handle_websocket(scope, receive, send)
    elif scope["type"] == "lifespan":
        await handle_lifespan(scope, receive, send)

async def handle_http(scope, receive, send):
    # 接收请求（事件）
    request = await receive()
    
    # 解析路径，做最简单的路由
    path = scope["path"]
    if path == "/":
        body = b'{"msg": "Hello ASGI"}'
    elif path == "/time":
        import datetime
        now = datetime.datetime.now().isoformat()
        body = ('{"time": "' + now + '"}').encode("utf-8")
    else:
        # 404
        await send({
            "type": "http.response.start",
            "status": 404,
            "headers": [[b"content-type", b"text/plain"]],
        })
        await send({"type": "http.response.body", "body": b"Not Found"})
        return
    
    # 发送 200 响应
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [[b"content-type", b"application/json"]],
    })
    await send({"type": "http.response.body", "body": body})

async def handle_websocket(scope, receive, send):
    # 等连接
    event = await receive()
    if event["type"] == "websocket.connect":
        await send({"type": "websocket.accept"})
    
    # 循环回显
    while True:
        event = await receive()
        if event["type"] == "websocket.disconnect":
            break
        await send({
            "type": "websocket.send",
            "text": "echo: " + event.get("text", ""),
        })

async def handle_lifespan(scope, receive, send):
    # 应用启动/关闭钩子
    while True:
        event = await receive()
        if event["type"] == "lifespan.startup":
            print("应用启动，初始化资源")
            await send({"type": "lifespan.startup.complete"})
        elif event["type"] == "lifespan.shutdown":
            print("应用关闭，清理资源")
            await send({"type": "lifespan.shutdown.complete"})
            break
\`\`\`

用 Uvicorn 跑：\`uvicorn main:application\`。看，这就是 FastAPI \`@app.get\` 背后的本质——它把这套事件收发封装成了你熟悉的路由装饰器。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘 await | send({...}) | await send({...}) |
| 同步阻塞 | 视图里 time.sleep(10) | 用 asyncio.sleep 等异步版 |
| 误用 environ | scope["REQUEST_METHOD"] | scope["method"] |
| query_string 当字符串 | scope["query_string"] | 它是字节，要 decode |
| 混用同步库 | async 视图里用 requests | 用 httpx 等异步库 |
| 忘发 response.start | 直接发 body | 先 start 再 body |

下一章我们看 Gunicorn 这个老牌 WSGI 服务器怎么部署应用。`
  },

  // ============================================================
  // 第 7 章：Gunicorn 服务器
  // ============================================================
  {
    id: "server-gunicorn",
    group: "WSGI 与 ASGI",
    icon: "🚀",
    title: "Gunicorn 服务器",
    content: `# Gunicorn 服务器

## 一句话定义

Gunicorn（Green Unicorn，绿色独角兽）是 Python 最流行的 WSGI HTTP 服务器。它基于 **pre-fork worker** 模型：启动时先 fork 出多个工作进程（worker），每个进程独立处理请求，靠多进程来扛并发。稳定、简单、配置少，是 Python Web 部署的事实标准。

## 为什么需要 Gunicorn

上一章说过，Flask/Django 自带的是开发服务器，不能上生产。原因：
- 单线程，并发能力差。
- 没有进程管理（崩了不会自动重启）。
- 没有优雅停机。
- 性能差。

Gunicorn 解决了这些：
- **多进程**：pre-fork 多个 worker，并行处理。
- **进程管理**：worker 挂了自动重启。
- **优雅停机**：收到信号后等处理完再退出。
- **性能好**：用 C 扩展解析 HTTP，吞吐量高。

## 安装与启动

\`\`\`bash
# 安装
pip install gunicorn

# 启动（假设你的应用在 main.py 的 app 变量里）
gunicorn main:app

# 常用启动参数
gunicorn main:app \\
  --bind 0.0.0.0:8000 \\      # 绑定地址和端口
  --workers 4 \\                # worker 进程数
  --timeout 30 \\               # 请求超时秒数
  --log-level info              # 日志级别
\`\`\`

注意 \`main:app\` 的格式：\`模块名:应用变量名\`。Gunicorn 会 import \`main\` 模块，取其中的 \`app\` 对象（必须是 WSGI 应用）。

## pre-fork worker 模型

Gunicorn 的核心是 pre-fork（预派生）模型：

1. **主进程（master）**：启动时不处理请求，只负责管理 worker。
2. **fork worker**：主进程 fork 出 N 个 worker 子进程。
3. **worker 干活**：每个 worker 独立处理请求。
4. **主进程监督**：worker 崩了，主进程立刻 fork 新的补上。

为什么叫 pre-fork？因为 worker 在请求**到来之前**就 fork 好了，请求一来就有现成的 worker 处理，不用临时 fork（减少延迟）。

好处：
- 多进程绕开了 Python GIL，真正并行。
- worker 之间隔离，一个崩了不影响别的。
- 主进程是「看门狗」，保证高可用。

## worker 类型

Gunicorn 支持不同类型的 worker，适配不同场景：

| worker 类型 | 模型 | 适用 | 安装 |
|-------------|------|------|------|
| sync（默认） | 同步，一个请求一个 | 普通 WSGI 应用 | 自带 |
| gevent | 协程，事件循环 | I/O 密集 WSGI | pip install gevent |
| eventlet | 协程，类似 gevent | I/O 密集 WSGI | pip install eventlet |
| uvicorn.workers.UvicornWorker | 异步 | ASGI 应用（FastAPI） | pip install uvicorn |

\`\`\`bash
# 同步 worker（默认，跑 Flask/Django）
gunicorn main:app --workers 4

# 用 gevent（协程，扛更多并发连接）
gunicorn main:app --workers 4 --worker-class gevent --worker-connections 1000

# 跑 ASGI 应用（FastAPI）—— 用 UvicornWorker
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
\`\`\`

## worker 数量怎么定

经典公式：\`workers = 2 * CPU核数 + 1\`

\`\`\`bash
# 4 核机器
gunicorn main:app --workers 9
\`\`\`

为什么是这个数？因为 sync worker 是「一个 worker 同时处理一个请求」，worker 数 = 并发数。CPU 密集型任务，worker 多了反而争抢 CPU；I/O 密集型，worker 等待多，可以稍多。2*CPU+1 是个平衡的经验值。

Gunicorn 还提供了快捷写法：

\`\`\`bash
# 让 Gunicorn 自己算（等于 2*CPU+1）
gunicorn main:app --workers $(python -c "import multiprocessing; print(multiprocessing.cpu_count() * 2 + 1)")
\`\`\`

注意：worker 不是越多越好。每个 worker 是独立进程，占内存，多了反而内存吃紧、上下文切换频繁。一般不超过几十个。

## 常用参数详解

\`\`\`bash
gunicorn main:app \\
  --bind 0.0.0.0:8000 \\
  --workers 4 \\
  --worker-class sync \\
  --worker-connections 1000 \\
  --timeout 30 \\
  --graceful-timeout 30 \\
  --keep-alive 2 \\
  --preload \\
  --log-level info \\
  --access-logfile - \\
  --error-logfile -
\`\`\`

| 参数 | 含义 | 典型值 |
|------|------|--------|
| --bind (-b) | 监听地址:端口 | 0.0.0.0:8000 |
| --workers (-w) | worker 进程数 | 2*CPU+1 |
| --worker-class (-k) | worker 类型 | sync / gevent / uvicorn... |
| --worker-connections | 每个 worker 的连接数（gevent 用） | 1000 |
| --threads | 每个 worker 的线程数 | 1（sync） |
| --timeout (-t) | 请求处理超时（秒） | 30 |
| --graceful-timeout | 优雅停机等待时间 | 30 |
| --keep-alive | keep-alive 超时 | 2 |
| --preload | 启动时预加载应用 | 减少 worker 内存 |
| --log-level | 日志级别 | info |
| --access-logfile | 访问日志文件（- 是 stdout） | - |

## --preload 预加载

默认每个 worker 各自 import 你的应用，加载一份代码到内存。如果应用初始化很重（加载模型、连数据库），N 个 worker 就加载 N 次。

\`--preload\` 让主进程先加载应用，再 fork worker。fork 是写时复制（COW），worker 共享主进程的内存页，直到写才复制。

好处：
- **省内存**：共享代码，N 个 worker 不用 N 份。
- **省启动时间**：只加载一次。

注意：如果应用里有连接池（数据库连接），preload 后 fork 会导致 worker 共享同一个连接池——这会出问题。所以用 preload 时要确保 fork 后重新初始化连接。

## --timeout 超时

\`--timeout 30\` 表示 worker 处理一个请求超过 30 秒就被主进程杀掉重启。

这能防止一个卡死的请求拖垮整个 worker。但注意：
- 超时太短，长耗时任务（如大文件处理、报表生成）会被误杀。
- 长耗时任务应该放后台（Celery），不该在 Web worker 里同步跑。

\`\`\`bash
# 有长耗时接口，适当调大
gunicorn main:app --timeout 120
\`\`\`

## --graceful-timeout 优雅停机

发 \`kill\` 或 \`kill -HUP\`（reload）时，Gunicorn 不会立刻杀 worker，而是：
1. 停止给 worker 派新请求。
2. 等正在处理的请求完成（最多等 graceful-timeout 秒）。
3. 超时还没完成才强杀。

这保证部署更新时不会中断正在处理的请求。

## 配置文件

参数多了，写成配置文件更清晰。创建 \`gunicorn.conf.py\`：

\`\`\`python
# gunicorn.conf.py —— Gunicorn 配置文件

# 绑定地址
bind = "0.0.0.0:8000"

# worker 数量
workers = 4

# worker 类型（ASGI 应用用 uvicorn worker）
worker_class = "sync"

# 每个 worker 的线程数（sync worker 用）
threads = 2

# 请求超时
timeout = 30

# 优雅停机超时
graceful_timeout = 30

# keep-alive
keepalive = 2

# 预加载应用（省内存）
preload_app = True

# 日志
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 进程名（方便 ps 查看）
proc_name = "myapp"

# 优雅停机时是否重用端口（配合 systemd）
reuse_addr = True
\`\`\`

启动时指定配置文件：

\`\`\`bash
gunicorn main:app --config gunicorn.conf.py
\`\`\`

## 部署示例：Flask + Gunicorn

\`\`\`python
# main.py —— Flask 应用
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({"msg": "Hello from Gunicorn + Flask"})

@app.route("/health")
def health():
    # 健康检查接口，给负载均衡探活用
    return jsonify({"status": "ok"})
\`\`\`

\`\`\`bash
# 安装
pip install flask gunicorn

# 启动（4 个 worker）
gunicorn main:app --workers 4 --bind 0.0.0.0:8000

# 后台运行 + 日志
gunicorn main:app --workers 4 --bind 0.0.0.0:8000 --daemon --access-logfile access.log --error-logfile error.log
\`\`\`

## 生产部署组合

实际生产很少让 Gunicorn 直接对外，前面一般有 Nginx：

\`\`\`
用户 -> Nginx (80/443) -> Gunicorn (8000) -> Flask 应用
\`\`\`

Nginx 负责：
- TLS 终止（HTTPS 解密）。
- 静态文件服务（CSS/JS/图片）。
- 负载均衡（多个 Gunicorn 实例）。
- 缓冲慢客户端。

Gunicorn 负责：
- 跑 Python 应用。
- 多 worker 并发。

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 用开发服务器上生产 | flask run 跑线上 | 用 gunicorn 部署 |
| worker 太多 | 设几十上百个 | 2*CPU+1，一般不超过几十 |
| 长任务阻塞 | 视图里跑长耗时任务 | 用 Celery 后台跑 |
| preload + 连接池 | preload 后共享连接池 | fork 后重新建连接 |
| timeout 太短 | 默认 30 秒杀长任务 | 调大或移到后台 |
| 忘 graceful-timeout | 部署时中断请求 | 设优雅停机 |

下一章我们看 Uvicorn，ASGI 应用的部署选择。`
  },

  // ============================================================
  // 第 8 章：Uvicorn 服务器
  // ============================================================
  {
    id: "server-uvicorn",
    group: "WSGI 与 ASGI",
    icon: "⚡",
    title: "Uvicorn 服务器",
    content: `# Uvicorn 服务器

## 一句话定义

Uvicorn 是一个基于 uvloop（C 实现的 asyncio 事件循环）和 httptools（C 实现的 HTTP 解析器）的 ASGI 服务器。它专为异步 Python Web 应用设计，是 FastAPI、Starlette 等 ASGI 框架的默认部署选择，速度快、轻量。

## Uvicorn 是什么

上一章的 Gunicorn 是 WSGI 服务器（虽然也能跑 ASGI worker）。Uvicorn 是专门的 ASGI 服务器，原生支持 async/await。

它的快来自两个底层库：
- **uvloop**：把 Python 标准库的 asyncio 事件循环用 Cython/C 重写，性能接近 Node.js、Go。Mac/Linux 上自动启用（Windows 不支持 uvloop，回退到标准 asyncio）。
- **httptools**：用 C 写的 HTTP 解析器（来自 Node.js 的 http-parser），解析 HTTP 请求比纯 Python 快得多。

\`\`\`
请求进来
  -> httptools 解析 HTTP（C，快）
  -> uvloop 事件循环调度（C，快）
  -> 调用你的 ASGI 应用（async）
  -> 响应发回
\`\`\`

## 安装与启动

\`\`\`bash
# 安装（带 uvloop 等高性能依赖）
pip install uvicorn[standard]

# 基本启动（假设应用在 main.py 的 app 变量）
uvicorn main:app

# 常用参数
uvicorn main:app \\
  --host 0.0.0.0 \\        # 绑定地址
  --port 8000 \\           # 端口
  --reload \\               # 热重载（开发用）
  --workers 4 \\            # worker 进程数（生产用）
  --log-level info          # 日志级别
\`\`\`

启动后你会看到：

\`\`\`
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
\`\`\`

## --reload 热重载

开发时最有用的功能：代码改了自动重启。

\`\`\`bash
# 开发模式：热重载
uvicorn main:app --reload
\`\`\`

改了 Python 文件保存，Uvicorn 自动重新加载，刷新浏览器就看到改动。不用手动停启。

注意：\`--reload\` **只用于开发**，生产别开（有性能开销，且单进程）。它和 \`--workers\` 互斥（reload 时强制单 worker）。

## --workers 多 worker

生产环境要开多 worker 来利用多核：

\`\`\`bash
# 生产模式：4 个 worker
uvicorn main:app --workers 4 --host 0.0.0.0 --port 8000
\`\`\`

Uvicorn 的多 worker 也是 pre-fork 模型（类似 Gunicorn）。但 Uvicorn 自己的进程管理功能比 Gunicorn 弱一些——这也是为什么生产常用「Gunicorn + Uvicorn Worker」组合。

## --host / --port 绑定

\`\`\`bash
# 只本机访问
uvicorn main:app --host 127.0.0.1 --port 8000

# 对外开放
uvicorn main:app --host 0.0.0.0 --port 80
\`\`\`

生产环境一般 Uvicorn 监听本地端口（如 8000），前面放 Nginx 监听 80/443 转发。

## --log-level 日志级别

\`\`\`bash
uvicorn main:app --log-level debug   # 最详细（开发调优）
uvicorn main:app --log-level info    # 默认（生产常用）
uvicorn main:app --log-level warning # 只警告以上
uvicorn main:app --log-level error   # 只错误
\`\`\`

debug 级别会打印每个请求详情，方便排查；info 会打印启动信息和每个请求的访问日志；生产一般用 info 或 warning。

## uvloop 为什么快

标准库的 asyncio 事件循环是用纯 Python 写的，每次事件回调要走 Python 解释器。uvloop 用 Cython 重写了事件循环，关键路径编译成 C，绕开解释器开销。

性能对比（基准测试，仅供参考）：
- 纯 asyncio：1x
- uvloop：2-4x（接近 Node.js、Go）

但 uvloop 只在 Mac/Linux 可用（依赖 libuv）。Windows 上 Uvicorn 自动回退到标准 asyncio，性能没那么夸张。

\`\`\`bash
# 检查是否启用了 uvloop
uvicorn main:app --log-level debug
# 启动日志里会看到 "Uvicorn running on ..." 和 loop 类型
\`\`\`

## Uvicorn vs Gunicorn

两者不是完全竞争关系，而是互补：

| 维度 | Uvicorn | Gunicorn |
|------|---------|----------|
| 定位 | ASGI 服务器 | WSGI 服务器（也能跑 ASGI worker） |
| 异步原生 | 是 | 否（靠 worker-class） |
| 进程管理 | 弱 | 强（成熟的 master-worker） |
| 热重载 | 有（--reload） | 无 |
| 适合 | 开发、轻量生产 | 重型生产部署 |

## 生产部署组合：Gunicorn + Uvicorn Worker

生产环境最佳实践是**用 Gunicorn 管进程，用 Uvicorn 跑 ASGI**：

\`\`\`bash
# Gunicorn 做进程管理，worker 类型用 Uvicorn
gunicorn main:app \\
  --workers 4 \\
  --worker-class uvicorn.workers.UvicornWorker \\
  --bind 0.0.0.0:8000 \\
  --timeout 120
\`\`\`

这样组合的好处：
- Gunicorn 成熟的 master-worker 进程管理（崩溃重启、信号处理、优雅停机）。
- Uvicorn 的异步能力（每个 worker 是一个 ASGI 事件循环）。
- 一套配置文件管所有。

FastAPI 官方推荐的就是这套组合。

## 配置示例

Uvicorn 的配置可以放配置文件里：

\`\`\`python
# uvicorn_config.py 或在代码里用 uvicorn.run() 传参
\`\`\`

更常见的是直接在代码里启动（适合容器化）：

\`\`\`python
# main.py
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def index():
    return {"msg": "Hello"}

# 直接运行这个文件就启动
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,        # 开发热重载
        log_level="info",
        # workers=4,        # reload 时不能用 workers
    )
\`\`\`

\`\`\`bash
# 然后
python main.py
# 或者
uvicorn main:app --reload
\`\`\`

## 部署示例：FastAPI + Uvicorn

\`\`\`python
# main.py —— FastAPI 应用
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def index():
    return {"msg": "Hello from Uvicorn + FastAPI"}

@app.get("/async")
async def async_demo():
    # 异步视图，能发挥 ASGI 优势
    import asyncio
    await asyncio.sleep(0.1)  # 模拟 I/O 等待
    return {"msg": "异步处理完成"}
\`\`\`

开发：

\`\`\`bash
pip install fastapi uvicorn[standard]
uvicorn main:app --reload
# 访问 http://localhost:8000
# 自动文档 http://localhost:8000/docs
\`\`\`

生产：

\`\`\`bash
pip install gunicorn uvicorn[standard] fastapi
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 生产开 reload | --reload 跑线上 | 生产关 reload，用 --workers |
| 同步阻塞异步 | async 视图里 time.sleep | 用 asyncio.sleep |
| Windows 期待 uvloop | Windows 上找 uvloop | Windows 自动回退标准 asyncio |
| 单 worker 扛高并发 | 生产只开 1 个 | 用 --workers 或 Gunicorn 多进程 |
| reload + workers 同用 | --reload --workers 4 | 二者互斥，二选一 |
| Uvicorn 直接对外 | Uvicorn 监听 80 | 前面放 Nginx 处理 TLS |

下一批我们进入 Flask，从零开始写第一个 Web 应用。`
  },
];
