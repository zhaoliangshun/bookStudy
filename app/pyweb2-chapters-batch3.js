// =============================================================
// Python Web 后端开发实战教程（全新版）—— 第 3 批章节（WSGI 与 ASGI 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   pyweb2-wsgi        : WSGI 规范详解
//   pyweb2-asgi        : ASGI 规范详解
//   pyweb2-servers     : Uvicorn、Gunicorn 与服务器对比
//   pyweb2-async-python: Python async/await 与事件循环
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：WSGI 规范详解
  // ============================================================
  {
    id: "pyweb2-wsgi",
    group: "WSGI 与 ASGI",
    icon: "🔌",
    title: "WSGI 规范详解",
    content: `# WSGI 规范详解

## 一句话定义

WSGI（Web Server Gateway Interface，Web 服务器网关接口）是 Python Web 应用与 Web 服务器之间的**同步**通信标准，2003 年由 PEP 3333 定义。它规定了一个极其简单的调用约定：服务器怎么把 HTTP 请求交给应用，应用怎么把响应交回服务器。

一句话理解：**WSGI 是一座桥，桥这边是服务器（Gunicorn、uWSGI），桥那边是应用（Flask、Django），桥的图纸就是 WSGI 规范。**

为什么要这座桥？因为如果没有它，每个 Web 框架都得自己写一遍「怎么从 socket 读 HTTP、怎么解析报文、怎么把响应写回 socket」。有了 WSGI，框架只管业务逻辑，服务器只管网络 IO，两者通过 WSGI 接口对接，任意组合。Flask 应用可以跑在 Gunicorn 上，也可以跑在 uWSGI 上，不用改一行代码。

## 同步模型：一个请求一个线程/进程

WSGI 从出生那天起就是**同步**的。这里的同步指的是：处理一个请求的过程中，应用函数会**阻塞**，直到响应生成完毕才返回。如果应用里要查数据库、调外部 API，当前线程就干等着。

于是 WSGI 服务器普遍采用「**一个请求一个线程/进程**」的并发模型来同时处理多个请求：

- 来了 10 个请求，就分配 10 个线程（或进程）分别处理。
- 每个线程内部是阻塞的，但线程之间互不影响，宏观上看起来是「并发」。
- 线程/进程数量决定了能同时处理多少请求，超过的请求就排队。

这种模型的好处是**心智简单**：写应用时不用关心并发，每个请求就像独占一个 Python 解释器。坏处是**资源开销大**：每个线程默认占 8MB 栈空间（Linux），1000 个并发就要 8GB 内存；线程切换也有内核开销。对于 IO 密集型场景（等数据库、等外部 API），线程大部分时间在阻塞，极其浪费。

打个比方：WSGI 同步模型像银行柜台，一个客户配一个柜员。客户填表的时候柜员只能干等。客户多了就得多开柜台（线程），但柜员贵、大堂也装不下太多柜台。

## WSGI 应用接口

WSGI 规范的核心是一个**可调用对象**（函数、类、或实现了 \`__call__\` 的实例），签名固定为：

\`\`\`python
def app(environ, start_response):
    ...
\`\`\`

两个参数：
- \`environ\`：一个字典，包含本次请求的所有信息（HTTP 头、路径、方法、查询字符串、服务器变量等）。注意：WSGI 把 HTTP 请求头都改了名，比如 \`Host\` 变成 \`HTTP_HOST\`，\`Content-Type\` 变成 \`CONTENT_TYPE\`。
- \`start_response\`：一个回调函数，应用调它来「声明响应状态和响应头」。签名是 \`start_response(status, response_headers, exc_info=None)\`。

返回值：一个**可迭代的字节串**（通常是列表，每个元素是 bytes）。WSGI 之所以要求「可迭代」而不是「单个 bytes」，是为了支持流式响应——可以一块一块地 yield 出去，不必把整个响应体攒在内存里。

下面拆开看 environ 里都有什么。假设请求是 \`GET /hello?name=tom HTTP/1.1\`，带 \`Host: localhost\`：

\`\`\`python
environ = {
    "REQUEST_METHOD": "GET",        # HTTP 方法
    "PATH_INFO": "/hello",          # URL 路径（去掉查询串）
    "QUERY_STRING": "name=tom",     # 查询字符串（? 后面那一坨，未解析）
    "SERVER_NAME": "localhost",     # 服务器名
    "SERVER_PORT": "8000",          # 端口
    "SERVER_PROTOCOL": "HTTP/1.1",  # 协议版本
    "HTTP_HOST": "localhost",       # 请求头 Host（头名加 HTTP_ 前缀，全大写）
    "wsgi.version": (1, 0),         # WSGI 版本
    "wsgi.url_scheme": "http",      # http 还是 https
    "wsgi.input": <file-like>,      # 请求体（POST 数据从这读）
    "wsgi.errors": <file-like>,     # 错误输出流（写日志用）
    "wsgi.multithread": True,       # 服务器是否多线程
    "wsgi.multiprocess": True,      # 服务器是否多进程
    "wsgi.run_once": False,         # 是否只调用一次（CGI 兼容）
}
\`\`\`

注意几个坑：
- \`PATH_INFO\` 是 URL 解码**前**的原始路径还是解码后的？规范说是解码后的（百分号已还原），但仍是 Latin-1 编码的字节，处理中文路径要再 decode 一次。
- \`QUERY_STRING\` 是原始字符串，没帮你切分，要自己用 \`urllib.parse.parse_qs\` 解析。
- 自定义请求头 \`X-My-Header\` 会变成 \`HTTP_X_MY_HEADER\`（横杠变下划线）。

\`start_response\` 的用法：

\`\`\`python
# status 是字符串："200 OK" / "404 Not Found"
# response_headers 是 [(header_name, header_value), ...] 列表
start_response("200 OK", [
    ("Content-Type", "text/plain; charset=utf-8"),
    ("Content-Length", "5"),
])
\`\`\`

返回的 body 必须是 bytes 列表（或可迭代对象）：

\`\`\`python
return [b"hello"]   # ✅ 列表里是 bytes
return ["hello"]    # ❌ str 不行，必须是 bytes
return b"hello"     # ❌ 直接返回 bytes 也不规范，应是可迭代
\`\`\`

## WSGI 服务器

WSGI 应用自己不会监听端口、不会解析 HTTP，这些脏活累活交给 **WSGI 服务器**。服务器负责：监听 socket、接收 TCP 连接、解析 HTTP 报文、构造 \`environ\`、调用应用、把应用的返回值写成 HTTP 响应发回去。

主流 WSGI 服务器：

| 服务器 | 特点 | 典型场景 |
|--------|------|----------|
| **Gunicorn** | 纯 Python，预派生 worker，配置简单，最流行 | 部署 Flask/Django 的首选 |
| **uWSGI** | C 编写，功能极多（缓存、队列、多协议），配置项上百个 | 需要整合多种协议、追求极致性能 |
| **mod_wsgi** | Apache 模块，应用常驻 Apache 进程内 | 老项目、必须用 Apache 的环境 |
| **Waitress** | 纯 Python，跨平台，无 C 依赖 | Windows 部署、开发环境 |
| **Gevent** | 基于 greenlet 协程，monkey patch 后兼容同步代码 | 大量长连接、IO 密集 |

以 Gunicorn 为例，启动一个 Flask 应用：

\`\`\`bash
# 安装
pip install gunicorn flask

# 启动：gunicorn 模块名:应用对象
# 假设 app.py 里有 app = Flask(__name__)
gunicorn app:app -b 0.0.0.0:8000 -w 4
# -w 4 表示开 4 个 worker 进程
# -b 绑定地址
\`\`\`

Gunicorn 会预派生 4 个子进程，每个进程独立处理请求，主进程负责监控、重启挂掉的 worker。

uWSGI 启动示例：

\`\`\`bash
# 安装
pip install uwsgi

# 启动
uwsgi --http :8000 --wsgi-file app.py --callable app --processes 4 --threads 2
# --http 监听 HTTP
# --wsgi-file 指定应用文件
# --callable 指定 WSGI 应用对象名（默认 application）
# --processes 进程数 --threads 每进程线程数
\`\`\`

mod_wsgi 用 Apache 配置：

\`\`\`apache
# /etc/apache2/sites-available/myapp.conf
LoadModule wsgi_module modules/mod_wsgi.so

<VirtualHost *:80>
    ServerName myapp.com
    WSGIDaemonProcess myapp python-path=/path/to/project
    WSGIProcessGroup myapp
    WSGIScriptAlias / /path/to/project/app.wsgi
</VirtualHost>
\`\`\`

## 手写一个 WSGI 应用

不依赖任何框架，纯手写一个 WSGI 应用。这能让你彻底理解 WSGI 到底是怎么工作的。下面这个应用实现：访问 \`/\` 返回欢迎页，访问 \`/hello?name=xxx\` 返回问候，访问其他路径返回 404。

\`\`\`python
# app.py —— 纯 WSGI 应用，不依赖 Flask/Django
# 用 Python 自带的 wsgiref 服务器即可运行：
#   python app.py
# 然后浏览器访问 http://localhost:8000

# 导入 wsgiref 的简单服务器（仅用于开发，生产用 Gunicorn）
from wsgiref.simple_server import make_server

# 导入 parse_qs 用于解析查询字符串
from urllib.parse import parse_qs

# 定义 WSGI 应用：必须叫 app(environ, start_response)
def app(environ, start_response):
    # environ 是字典，包含请求的所有信息
    # start_response 是回调，用来声明响应状态和头

    # 1. 取出请求方法和路径
    # PATH_INFO 是 URL 路径（不含查询串），如 "/hello"
    method = environ.get("REQUEST_METHOD", "GET")
    path = environ.get("PATH_INFO", "/")

    # 2. 解析查询字符串
    # QUERY_STRING 是原始串如 "name=tom"，parse_qs 把它变成 {"name": ["tom"]}
    # 字典的值是列表，因为同名参数可以出现多次
    qs = parse_qs(environ.get("QUERY_STRING", ""))
    name = qs.get("name", ["world"])[0]  # 取第一个，默认 "world"

    # 3. 路由分发
    if path == "/" and method == "GET":
        # 首页
        status = "200 OK"
        body_text = "<h1>欢迎来到纯 WSGI 应用</h1><p>试试 /hello?name=你的名字</p>"
    elif path == "/hello" and method == "GET":
        # 问候接口
        status = "200 OK"
        body_text = f"<h1>你好, {name}!</h1>"
    elif path == "/info" and method == "GET":
        # 展示一些 environ 信息，方便调试
        status = "200 OK"
        body_text = f"<pre>method={method}\\npath={path}\\nHTTP_HOST={environ.get('HTTP_HOST')}</pre>"
    else:
        # 404
        status = "404 Not Found"
        body_text = f"<h1>404</h1><p>路径 {path} 不存在</p>"

    # 4. 把文本编码成 bytes（WSGI 要求 body 是 bytes）
    body_bytes = body_text.encode("utf-8")

    # 5. 声明响应头
    headers = [
        # Content-Type 必须写明 charset，否则中文乱码
        ("Content-Type", "text/html; charset=utf-8"),
        # Content-Length 告诉客户端 body 多长，方便连接复用
        ("Content-Length", str(len(body_bytes))),
    ]

    # 6. 调用 start_response，把状态和头交给服务器
    start_response(status, headers)

    # 7. 返回 body —— 必须是可迭代的 bytes
    # 用列表包一层，因为 WSGI 要求「可迭代」
    return [body_bytes]


# 主入口：用 wsgiref 起一个开发服务器
if __name__ == "__main__":
    # make_server(主机, 端口, 应用对象)
    # 返回一个服务器对象
    server = make_server("0.0.0.0", 8000, app)
    print("服务启动: http://localhost:8000")
    # serve_forever 阻塞主线程，持续接受连接
    server.serve_forever()
\`\`\`

运行后访问：
- \`http://localhost:8000/\` → 欢迎页
- \`http://localhost:8000/hello?name=Tom\` → 你好, Tom!
- \`http://localhost:8000/info\` → 看到环境变量
- \`http://localhost:8000/xxx\` → 404

再来一个支持 POST 的 demo，演示怎么从 \`wsgi.input\` 读请求体：

\`\`\`python
# app_post.py —— 演示 WSGI 读取 POST 请求体
from wsgiref.simple_server import make_server

def app(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET")

    if method == "POST":
        # 读取请求体的步骤：
        # 1. 从 CONTENT_LENGTH 拿到字节数
        content_length = int(environ.get("CONTENT_LENGTH") or 0)
        # 2. 从 wsgi.input 读指定字节数
        #    wsgi.input 是类文件对象，read(n) 读 n 字节
        raw_body = environ["wsgi.input"].read(content_length)
        # 3. 解码 + 解析（假设是表单）
        from urllib.parse import parse_qs
        body_text = raw_body.decode("utf-8")
        form = parse_qs(body_text)
        username = form.get("username", [""])[0]
        reply = f"收到 POST，username={username}"
    else:
        # GET 返回一个表单
        reply = '''<form method="post">
            <input name="username" placeholder="用户名">
            <button>提交</button>
        </form>'''

    body = reply.encode("utf-8")
    start_response("200 OK", [
        ("Content-Type", "text/html; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ])
    return [body]

if __name__ == "__main__":
    make_server("0.0.0.0", 8000, app).serve_forever()
\`\`\`

## WSGI 中间件机制

WSGI 的「中间件」是一种特殊的对象：它**既是服务器又是应用**——对真正的服务器来说它是应用，对真正的应用来说它是服务器。它在中间转发请求/响应，顺便做点横切逻辑（日志、鉴权、压缩、限流）。

中间件的形态：

\`\`\`python
class Middleware:
    def __init__(self, app):
        # app 是被包裹的「内层应用」
        self.app = app

    def __call__(self, environ, start_response):
        # 在调用内层应用之前做事
        print(f"[log] {environ['REQUEST_METHOD']} {environ['PATH_INFO']}")

        # 调用内层应用，转发 environ 和 start_response
        # 这里也可以包装 start_response 来篡改响应头
        response = self.app(environ, start_response)

        # 在返回之前做事（比如统计耗时）
        return response
\`\`\`

实战：写一个计时中间件 + 一个鉴权中间件，层层包裹最内层的业务应用。

\`\`\`python
# middleware_demo.py —— WSGI 中间件演示
import time
from wsgiref.simple_server import make_server

# ---------- 最内层业务应用 ----------
def business_app(environ, start_response):
    path = environ.get("PATH_INFO", "/")
    body = f"业务处理：你访问了 {path}".encode("utf-8")
    start_response("200 OK", [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ])
    return [body]

# ---------- 计时中间件 ----------
class TimingMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        t0 = time.time()
        # 直接转发，不做改动
        response = self.app(environ, start_response)
        elapsed = (time.time() - t0) * 1000
        print(f"[timing] 耗时 {elapsed:.2f}ms")
        return response

# ---------- 鉴权中间件 ----------
class AuthMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        # 检查 Authorization 头（WSGI 里叫 HTTP_AUTHORIZATION）
        auth = environ.get("HTTP_AUTHORIZATION", "")
        if auth != "Bearer secret-token":
            # 鉴权失败：自己构造 401 响应，不调用内层 app
            body = b'{"error": "unauthorized"}'
            start_response("401 Unauthorized", [
                ("Content-Type", "application/json"),
                ("Content-Length", str(len(body))),
            ])
            return [body]
        # 鉴权通过：转发给内层
        return self.app(environ, start_response)

# ---------- 组装：像洋葱一样一层层包 ----------
# 执行顺序：Timing → Auth → business
# 即：计时包在最外层，鉴权在内层，业务在最里
app = TimingMiddleware(AuthMiddleware(business_app))

if __name__ == "__main__":
    make_server("0.0.0.0", 8000, app).serve_forever()
\`\`\`

测试：

\`\`\`bash
# 不带 token → 401
curl http://localhost:8000/anything
# {"error": "unauthorized"}

# 带 token → 业务响应
curl -H "Authorization: Bearer secret-token" http://localhost:8000/anything
# 业务处理：你访问了 /anything
# 服务端日志：[timing] 耗时 0.12ms
\`\`\`

Flask 里你用的 \`@app.before_request\`、Django 的中间件 \`MiddlewareMixin\`，底层都是这个套路——只是框架帮你把洋葱模型封装得更优雅了。

再演示一个**响应改写中间件**——把内层应用的响应体全部转大写。这要求中间件不能直接转发 \`start_response\`，得自己接管：

\`\`\`python
class UpperCaseMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        # 我们要改 body，但 body 是 app 返回的迭代器
        # start_response 还是要让内层 app 调用，原样转发
        # 但我们记录内层设的 status 和 headers，方便改 Content-Length
        captured = {}

        def custom_start_response(status, headers, exc_info=None):
            captured["status"] = status
            captured["headers"] = list(headers)
            # 不立即调真正的 start_response，等拿到改完的 body 再调

        # 调内层 app，拿到原始响应体
        original_body_iter = self.app(environ, custom_start_response)

        # 把迭代器读出来、拼接、转大写
        original_body = b"".join(original_body_iter)
        new_body = original_body.upper()

        # 修正 Content-Length
        new_headers = [
            (k, v) for (k, v) in captured["headers"]
            if k.lower() != "content-length"
        ]
        new_headers.append(("Content-Length", str(len(new_body))))

        # 现在才调真正的 start_response
        start_response(captured["status"], new_headers)
        return [new_body]
\`\`\`

这种「接管 start_response」的技巧在压缩中间件（gzip）、CORS 中间件（加 \`Access-Control-*\` 头）里很常见。

## WSGI 的局限性

WSGI 设计于 2003 年，那时的 Web 还是一问一答的 HTTP/1.0。今天的 Web 已经远超它的能力范围：

| 局限 | 说明 | 影响 |
|------|------|------|
| **不支持 WebSocket** | WebSocket 是双向长连接，WSGI 是请求-响应一次性，根本没法表达「服务器主动推消息」 | 聊天室、实时通知做不了 |
| **不支持长连接/SSE** | Server-Sent Events 需要服务器持续往一个连接推数据，WSGI 一次响应就结束了 | 流式推送做不了 |
| **同步阻塞** | 一个请求占一个线程，IO 等待时线程空转 | 高并发 IO 密集场景资源浪费严重 |
| **不支持 HTTP/2** | HTTP/2 多路复用、服务器推送等特性，WSGI 的同步模型无法表达 | 无法享受新协议红利 |
| **无法优雅处理慢客户端** | 慢客户端会一直占着线程 | 容易被慢速攻击拖垮 |

Django 早期为了支持 WebSocket，搞了个 \`channels\` 项目，本质上是在 WSGI 之外又加了一套异步协议——这套协议后来就被规范化成了 ASGI。所以 ASGI 不是凭空发明的，是被 WebSocket 倒逼出来的。

## WSGI 应用结构速查

\`\`\`python
# 标准 WSGI 应用骨架
def application(environ, start_response):
    # 1. 从 environ 读请求信息
    method = environ["REQUEST_METHOD"]
    path = environ["PATH_INFO"]
    # POST body:
    # length = int(environ.get("CONTENT_LENGTH", 0))
    # body = environ["wsgi.input"].read(length)

    # 2. 业务逻辑
    response_body = b"hello"

    # 3. 调用 start_response 声明状态和头
    start_response("200 OK", [
        ("Content-Type", "text/plain"),
        ("Content-Length", str(len(response_body))),
    ])

    # 4. 返回可迭代的 bytes
    return [response_body]
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 返回 str | \`return ["hello"]\` | \`return [b"hello"]\`（必须 bytes） |
| 忘了 Content-Length | 不写头部 | 长连接下必须有，否则连接无法复用 |
| 中文字符串直接返回 | \`return ["中文"]\` | \`return ["中文".encode("utf-8")]\` |
| Content-Type 无 charset | \`text/html\` | \`text/html; charset=utf-8\` |
| 中间件改了 body 没改 Content-Length | 篡改 body 后不更新长度 | 重新计算并覆盖 Content-Length |
| 用 wsgiref 上生产 | 开发服务器扛并发 1 | 生产用 Gunicorn/uWSGI |
| 在 WSGI 里写长连接 | while True 死循环 | 用 ASGI |

## 小结

WSGI 是 Python Web 的奠基性规范，它的同步、请求-响应模型简单可靠，Flask/Django 至今仍是它的忠实用户。理解 WSGI 就理解了 Python Web 的底层运行方式：服务器构造 environ、调应用、收响应。

但同步模型在 WebSocket、HTTP/2、高并发 IO 面前力不从心，于是有了下一章的 ASGI——它把同步调用改成异步消息流，让 Python 也能玩转长连接和协程。`
  },

  // ============================================================
  // 第 2 章：ASGI 规范详解
  // ============================================================
  {
    id: "pyweb2-asgi",
    group: "WSGI 与 ASGI",
    icon: "⚡",
    title: "ASGI 规范详解",
    content: `# ASGI 规范详解

## 一句话定义

ASGI（Asynchronous Server Gateway Interface，异步服务器网关接口）是 WSGI 的异步继任者，由 Django Channels 团队在 2017 年发起，现为独立规范。它在保持 WSGI「服务器与应用解耦」思想的同时，把同步调用模型改成了**异步消息流**模型，从而原生支持 WebSocket、HTTP/2、长连接、SSE 等现代 Web 特性。

一句话理解：**WSGI 是「打电话——你说一句我回一句就挂」；ASGI 是「开了一个群聊频道，双方随时可以互发消息，频道一直开着」。**

为什么需要 ASGI？因为 WSGI 的 \`def app(environ, start_response)\` 是一次性的：调用一次、返回一次、结束。这种模型表达不了「连接开着，服务器随时推消息给客户端」这种语义。ASGI 把「连接」抽象成一个长期存在的对象，应用和服务器在连接的生命周期内通过消息（message）持续通信。

## 异步模型：事件循环 + 协程

ASGI 的核心是 Python 的 \`asyncio\`——基于**事件循环（event loop）**和**协程（coroutine）**的异步 IO 模型。

事件循环的工作原理（极度简化）：
1. 维护一个「就绪任务队列」和一个「等待中的 IO 列表」。
2. 循环：从就绪队列取一个任务跑，跑到它\`await\`（让出控制权）。
3. 检查哪些 IO 就绪了，把对应的任务重新放回就绪队列。
4. 周而复始。

关键点：当一个协程\`await\`一个 IO 操作时，它**不阻塞线程**，而是把控制权交回事件循环，循环去跑别的协程。等 IO 完成再回来继续。这样**单线程**就能同时处理成千上万个连接——因为大部分时间协程都在 await，CPU 实际在跑别的协程。

打个比方：WSGI 同步模型像银行柜台，柜员（线程）等客户填表时干等。ASGI 异步模型像一个服务员管多桌：A 桌点了菜，服务员把单子递厨房（发起 IO），不等菜好就跑去 B 桌点单；厨房菜好了通知服务员（IO 就绪），服务员再把菜端给 A 桌。一个服务员能管很多桌，因为他大部分时间在跑来跑去，而不是死等某一桌。

代价是：异步代码必须全程 async，一旦中间有个同步阻塞操作（比如 \`time.sleep(1)\` 或同步的数据库驱动），整个事件循环就卡住了，所有协程都动不了。

## ASGI 应用接口

ASGI 应用是一个**异步可调用对象**，签名是：

\`\`\`python
async def app(scope, receive, send):
    ...
\`\`\`

三个参数：
- \`scope\`：一个字典，描述这个**连接**的元信息（连接类型、HTTP 版本、路径、头、客户端地址等）。注意是「连接级」的，不是「请求级」的——一个 WebSocket 连接可能持续很久，scope 在连接建立时确定后就不再变。
- \`receive\`：一个**异步函数**，调用它返回下一条入站消息（awaitable）。应用用它在连接生命周期内接收服务器发来的数据（HTTP body 块、WebSocket 消息等）。
- \`send\`：一个**异步函数**，调用它发送出站消息（响应头、响应体、WebSocket 推送等）。

注意全都是 \`async\`：\`receive()\` 和 \`send()\` 都是协程，必须 \`await\`。

scope 的典型内容（HTTP 请求）：

\`\`\`python
scope = {
    "type": "http",                 # 连接类型：http / websocket / lifespan
    "asgi": {"version": "3.0"},     # ASGI 版本
    "http_version": "1.1",          # HTTP 版本
    "method": "GET",                # 方法
    "scheme": "http",               # http / https
    "path": "/hello",               # 路径
    "query_string": b"name=tom",    # 查询串（bytes，未解析）
    "headers": [                    # 请求头列表，每项是 (bytes, bytes)
        (b"host", b"localhost:8000"),
        (b"user-agent", b"curl/8.0"),
    ],
    "client": ("127.0.0.1", 54321), # 客户端地址 (host, port)
    "server": ("127.0.0.1", 8000),  # 服务器地址
    "root_path": "",                # 反向代理前缀
}
\`\`\`

对比 WSGI 的 environ：
- ASGI 的 headers 是**原始小写**的字节对，不加工；WSGI 把头名大写加 \`HTTP_\` 前缀。
- ASGI 的 \`query_string\` 是 **bytes**；WSGI 是 str。
- ASGI 区分连接类型（\`type\` 字段），WSGI 只有 HTTP。

ASGI 消息（message）是一个字典，有 \`type\` 字段表示消息种类。

**HTTP 请求的入站消息**（receive 收到的）：
- \`{"type": "http.request", "body": b"...", "more_body": False}\` —— 请求体（可能分多块，\`more_body=True\` 表示后面还有）
- \`{"type": "http.disconnect"}\` —— 客户端断开了

**HTTP 响应的出站消息**（send 发的）：
- \`{"type": "http.response.start", "status": 200, "headers": [...]}\` —— 响应头（必须先发这个）
- \`{"type": "http.response.body", "body": b"...", "more_body": False}\` —— 响应体（可分块）

**WebSocket 的消息**更丰富：
- 入站：\`websocket.connect\`、\`websocket.receive\`、\`websocket.disconnect\`
- 出站：\`websocket.accept\`、\`websocket.send\`、\`websocket.close\`

## ASGI vs WSGI 对比表格

| 维度 | WSGI | ASGI |
|------|------|------|
| **同步/异步** | 同步阻塞 | 异步非阻塞 |
| **应用签名** | \`def app(environ, start_response)\` | \`async def app(scope, receive, send)\` |
| **请求表示** | environ 字典 | scope 字典 + 消息流 |
| **调用模型** | 一次调用返回响应 | 连接生命周期内多次收发消息 |
| **并发模型** | 多线程/多进程 | 单线程事件循环 + 协程 |
| **WebSocket** | ❌ 不支持 | ✅ 原生支持 |
| **HTTP/2** | ❌ 不支持 | ✅ 支持 |
| **SSE 长连接** | ❌ 不支持 | ✅ 支持 |
| **典型服务器** | Gunicorn、uWSGI | Uvicorn、Daphne、Hypercorn |
| **典型框架** | Flask、Django（传统） | FastAPI、Starlette、Django（async） |
| **内存开销** | 每请求一个线程，~MB 级 | 每请求一个协程，~KB 级 |
| **适合场景** | CPU 密集、传统 CRUD | IO 密集、实时、高并发 |
| **心智复杂度** | 简单 | 较高（异步传染、调试难） |
| **生态成熟度** | 极成熟 | 成熟中（异步数据库驱动还在补齐） |

注意：ASGI 不是 WSGI 的「升级版替代」，而是补充。两者会长期共存——CPU 密集、传统 CRUD 用 WSGI 更省心；实时、高并发 IO 用 ASGI 更高效。FastAPI 同时支持两种模式（推荐 ASGI），Django 3.0+ 也支持 ASGI 但很多内部组件仍是同步的。

## 手写一个 ASGI 应用

不依赖任何框架，纯手写一个 ASGI 应用。下面这个应用实现：
- HTTP \`GET /\` 返回欢迎页
- HTTP \`GET /hello?name=xxx\` 返回问候
- HTTP \`GET /slow\` 模拟慢响应（async sleep）
- WebSocket \`/ws\` 回声每个收到的消息

\`\`\`python
# app.py —— 纯 ASGI 应用，不依赖 FastAPI/Starlette
# 用 uvicorn 运行：
#   pip install uvicorn
#   uvicorn app:app --reload
# 然后访问 http://localhost:8000

import asyncio  # 异步标准库，sleep、gather 等都在这

# ASGI 应用必须是 async def，签名 (scope, receive, send)
async def app(scope, receive, send):
    # scope["type"] 区分连接类型：http / websocket / lifespan
    conn_type = scope["type"]

    if conn_type == "http":
        # 走 HTTP 处理流程
        await handle_http(scope, receive, send)
    elif conn_type == "websocket":
        # 走 WebSocket 处理流程
        await handle_websocket(scope, receive, send)
    elif conn_type == "lifespan":
        # 生命周期事件（启动/关闭），这里忽略
        await handle_lifespan(scope, receive, send)


# ---------- HTTP 处理 ----------
async def handle_http(scope, receive, send):
    method = scope["method"]
    path = scope["path"]

    # 1. 必须先读取客户端发来的请求体消息
    #    即使是 GET 没有体，也要消费掉 http.request 消息
    #    否则有些客户端会卡在等待
    body = b""
    more_body = True
    while more_body:
        # await receive() 拿到下一条入站消息
        message = await receive()
        if message["type"] == "http.request":
            body += message.get("body", b"")
            more_body = message.get("more_body", False)
        elif message["type"] == "http.disconnect":
            # 客户端断了，直接返回
            return

    # 2. 路由
    if path == "/" and method == "GET":
        status = 200
        text = "<h1>欢迎来到纯 ASGI 应用</h1>"
    elif path == "/hello" and method == "GET":
        # 解析查询串（scope["query_string"] 是 bytes）
        from urllib.parse import parse_qs
        qs = parse_qs(scope["query_string"].decode("latin-1"))
        name = qs.get("name", ["world"])[0]
        status = 200
        text = f"<h1>你好, {name}!</h1>"
    elif path == "/slow" and method == "GET":
        # 模拟慢响应：异步 sleep 2 秒
        # 注意：用 asyncio.sleep 不是 time.sleep！
        # time.sleep 会阻塞整个事件循环
        await asyncio.sleep(2)
        status = 200
        text = "<h1>等了你 2 秒</h1>"
    else:
        status = 404
        text = f"<h1>404</h1><p>{path} 不存在</p>"

    body_bytes = text.encode("utf-8")

    # 3. 发送响应头（http.response.start）
    #    headers 必须是 [(bytes, bytes), ...]
    await send({
        "type": "http.response.start",
        "status": status,
        "headers": [
            (b"content-type", b"text/html; charset=utf-8"),
            (b"content-length", str(len(body_bytes)).encode("latin-1")),
        ],
    })

    # 4. 发送响应体（http.response.body）
    #    more_body=False 表示这是最后一块，发完连接结束
    await send({
        "type": "http.response.body",
        "body": body_bytes,
        "more_body": False,
    })


# ---------- WebSocket 处理 ----------
async def handle_websocket(scope, receive, send):
    # WebSocket 流程：connect → accept → (receive/send) 循环 → disconnect

    # 1. 等待客户端发起连接
    message = await receive()
    if message["type"] != "websocket.connect":
        return

    # 2. 接受连接（必须发 accept，否则连接建立不了）
    await send({"type": "websocket.accept"})

    # 3. 循环接收消息并回声
    while True:
        message = await receive()
        msg_type = message["type"]

        if msg_type == "websocket.receive":
            # 收到消息：{"text": "..."} 或 {"bytes": b"..."}
            text = message.get("text", "")
            # 回声：把消息原样发回去
            await send({
                "type": "websocket.send",
                "text": f"echo: {text}",
            })
        elif msg_type == "websocket.disconnect":
            # 客户端断开，退出循环
            # disconnect 消息带 code：{"type": "websocket.disconnect", "code": 1000}
            break

    # 4. （可选）主动关闭
    # await send({"type": "websocket.close", "code": 1000})


# ---------- Lifespan 处理（启动/关闭事件）----------
async def handle_lifespan(scope, receive, send):
    while True:
        message = await receive()
        if message["type"] == "lifespan.startup":
            # 启动事件：可以在这里初始化数据库连接池等
            print("[lifespan] 应用启动")
            await send({"type": "lifespan.startup.complete"})
        elif message["type"] == "lifespan.shutdown":
            # 关闭事件：可以在这里清理资源
            print("[lifespan] 应用关闭")
            await send({"type": "lifespan.shutdown.complete"})
            break
\`\`\`

测试 HTTP：

\`\`\`bash
# 启动
uvicorn app:app --reload

# 测试
curl http://localhost:8000/
curl "http://localhost:8000/hello?name=Tom"

# 测试慢响应（注意：异步 sleep 不会阻塞其他请求）
time curl http://localhost:8000/slow
# 同时另开终端再 curl，会发现不阻塞——这就是异步的好处
\`\`\`

测试 WebSocket（用 Python 客户端）：

\`\`\`python
# ws_client.py —— 测试 WebSocket
# pip install websockets
import asyncio
import websockets

async def main():
    # 连接 WebSocket
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        # 发 3 条消息
        for i in range(3):
            await ws.send(f"消息 {i}")
            reply = await ws.recv()
            print(f"收到: {reply}")

asyncio.run(main())
# 输出：
# 收到: echo: 消息 0
# 收到: echo: 消息 1
# 收到: echo: 消息 2
\`\`\`

## ASGI 服务器

ASGI 服务器负责把 TCP/HTTP 字节流翻译成 ASGI 消息，再翻译回去。主流的有：

| 服务器 | 特点 | 典型场景 |
|--------|------|----------|
| **Uvicorn** | 基于 uvloop + httptools，速度最快，最流行 | FastAPI 默认推荐，开发+生产都行 |
| **Daphne** | Django Channels 团队出品，最早实现 ASGI | Django Channels 项目 |
| **Hypercorn** | 支持 HTTP/2、HTTP/3，可同时跑 WSGI/ASGI | 需要 HTTP/2 或 QUIC |

启动对比：

\`\`\`bash
# Uvicorn（最常用）
pip install uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
# --reload 开发热重载
# --workers 4 多进程

# Daphne
pip install daphne
daphne app:app -b 0.0.0.0 -p 8000

# Hypercorn
pip install hypercorn
hypercorn app:app -b 0.0.0.0:8000
# 支持 HTTP/2：
# hypercorn app:app -b 0.0.0.0:8443 --certfile cert.pem --keyfile key.pem
\`\`\`

Uvicorn 之所以快，是因为它用了两个 C 扩展：
- **uvloop**：用 libuv（Node.js 的 IO 引擎）替代 asyncio 默认的事件循环，性能提升 2-4 倍。
- **httptools**：用 Node.js 的 http-parser 解析 HTTP，比纯 Python 快得多。

在 Windows 上 uvloop 不可用（libuv 对 Windows 支持有限），Uvicorn 会自动回退到标准 asyncio 循环。

## ASGI 如何支持 WebSocket 和 HTTP/2

**WebSocket 支持的原理**：

WSGI 不支持 WebSocket 是因为它的接口「调一次返回一次」表达不了「双向持续通信」。ASGI 的设计天然支持：一个 WebSocket 连接对应一个 \`scope\`，应用在一个 \`while True\` 循环里反复 \`await receive()\` 接收消息、\`await send()\` 发送消息，连接就一直开着。

而 ASGI 服务器底层把 WebSocket 的帧协议（opcode：text/binary/ping/pong/close）翻译成 ASGI 的 \`websocket.receive\` / \`websocket.send\` 消息，应用完全不用碰字节级细节。

**HTTP/2 支持的原理**：

HTTP/2 有「多路复用」——一个 TCP 连接上并行跑多个请求/响应，每个请求是一个「流（stream）」。WSGI 的「一个请求一个线程」模型对不上：你没法在一个线程里同时处理同一个连接上的多个流。

ASGI 的处理方式：每个 HTTP/2 流当作一个独立的 ASGI 连接（独立的 scope/receive/send），服务器内部协调它们共享同一个 TCP 连接。应用代码不用关心多路复用，照常写 \`async def app\` 就行。

服务器推送（Server Push，HTTP/2 特性）也表达得自然——应用可以提前 send 一个 \`http.response.push\` 消息，让服务器主动给客户端推资源。

## ASGI 中间件

ASGI 也有中间件机制，原理和 WSGI 类似——「洋葱模型」，只是函数都是 async：

\`\`\`python
# asgi_middleware.py —— ASGI 中间件演示
import time

class TimingMiddleware:
    def __init__(self, app):
        self.app = app

    # 中间件本身也是 ASGI 应用：async def __call__(scope, receive, send)
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            # 非 HTTP（如 websocket）直接转发，不计时
            await self.app(scope, receive, send)
            return

        t0 = time.time()
        # 直接转发，应用自己会调 send 发响应
        await self.app(scope, receive, send)
        elapsed = (time.time() - t0) * 1000
        print(f"[timing] {scope['path']} 耗时 {elapsed:.2f}ms")


# 包装内层应用
async def inner_app(scope, receive, send):
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [(b"content-type", b"text/plain")],
    })
    await send({
        "type": "http.response.body",
        "body": b"hello",
    })

app = TimingMiddleware(inner_app)
# 启动：uvicorn asgi_middleware:app
\`\`\`

如果想改写响应（比如加 CORS 头），需要拦截 send：

\`\`\`python
class CORSMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # 包装 send，在 http.response.start 时塞入 CORS 头
        async def custom_send(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", b"*"))
                headers.append((b"access-control-allow-methods", b"GET, POST"))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, custom_send)
\`\`\`

Starlette 的 \`CORSMiddleware\`、FastAPI 的中间件机制，底层就是这套。

## ASGI 三种连接类型汇总

\`\`\`python
async def app(scope, receive, send):
    t = scope["type"]
    if t == "http":
        # 短连接：request → response
        ...
    elif t == "websocket":
        # 长连接：connect → accept → receive/send 循环 → close
        ...
    elif t == "lifespan":
        # 应用生命周期：startup → ... → shutdown
        ...
\`\`\`

| 类型 | scope["type"] | 用途 |
|------|---------------|------|
| HTTP | \`"http"\` | 普通 HTTP 请求 |
| WebSocket | \`"websocket"\` | 双向长连接 |
| Lifespan | \`"lifespan"\` | 应用启动/关闭钩子 |

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 忘了 await | \`send({...})\` | \`await send({...})\` |
| 用 time.sleep | \`time.sleep(1)\` 阻塞循环 | \`await asyncio.sleep(1)\` |
| 同步数据库驱动 | \`pymysql\` 拖慢循环 | 用 \`aiomysql\` / \`asyncpg\` |
| 不消费请求体 | GET 直接忽略 receive | 至少收一次 \`http.request\` |
| WebSocket 没 accept | 直接 send | 必须先 send \`websocket.accept\` |
| scope 当请求级 | 每次请求重读 scope | scope 是连接级的，建连时定 |
| headers 用 str | \`("host", "x")\` | 必须 \`[(b"host", b"x")]\` bytes |
| query_string 当 str | \`scope["query_string"]\` 直接 split | 是 bytes，先 decode |

## 小结

ASGI 是 Python Web 迈向异步时代的钥匙。它通过「连接生命周期 + 消息流」的模型，把 WSGI 表达不了的 WebSocket、HTTP/2、SSE 全部纳入麾下，又借助 asyncio 让单线程扛住成千上万的并发连接。

但异步的代价是「传染性」——一旦 async，全栈都得 async，数据库驱动、HTTP 客户端都得换成异步版本，调试也更难。下一章我们看 ASGI 服务器（Uvicorn、Gunicorn）怎么把这些跑起来，以及生产部署的最佳实践。`
  },

  // ============================================================
  // 第 3 章：Uvicorn、Gunicorn 与服务器对比
  // ============================================================
  {
    id: "pyweb2-servers",
    group: "WSGI 与 ASGI",
    icon: "🖥️",
    title: "Uvicorn、Gunicorn 与服务器对比",
    content: `# Uvicorn、Gunicorn 与服务器对比

## 为什么要服务器

你写的 \`async def app(scope, receive, send)\` 或 \`def app(environ, start_response)\` 只是一个 Python 对象，它自己不会监听端口、不会接受 TCP 连接、不会解析 HTTP。生产环境需要一个**服务器**来干这些事，把网络字节流翻译成调用你应用的参数。

服务器要做的事：
1. 监听端口，接受 TCP 连接。
2. 解析 HTTP 报文（请求行、头、体）。
3. 构造 \`environ\`（WSGI）或 \`scope\` + 消息流（ASGI）。
4. 调用你的应用。
5. 把应用的返回值/发出的消息写成 HTTP 响应发回客户端。
6. 处理并发（多进程/多线程/协程）、信号、优雅重启、日志。

开发时图省事，可以直接用框架自带的服务器（Flask 的 \`flask run\`、FastAPI 的 \`uvicorn\`）。但这些「开发服务器」通常单进程、无并发保护，**绝对不能上生产**。

## Uvicorn 详解

Uvicorn 是目前最流行的 ASGI 服务器，FastAPI 官方推荐。它的特点：

- 基于 **uvloop**（libuv 的 Python 绑定，Node.js 同款 IO 引擎）替代 asyncio 默认循环，性能 2-4 倍提升。
- 基于 **httptools**（C 编写的 HTTP 解析器）解析 HTTP，远快于纯 Python。
- 支持热重载（\`--reload\`）、多 worker（\`--workers\`）、Unix socket、SSL/TLS。
- 同时支持 ASGI 和 WSGI（WSGI 应用会被包成一个线程池里跑的适配器）。

安装：

\`\`\`bash
# 基础版
pip install uvicorn

# 推荐装「标准版」，带 uvloop + httptools 等加速
pip install "uvicorn[standard]"

# 带 WebSocket 支持
pip install "uvicorn[standard]" websockets
\`\`\`

常用命令行参数：

\`\`\`bash
uvicorn app:app \\
    --host 0.0.0.0 \\         # 监听地址，默认 127.0.0.1
    --port 8000 \\            # 端口，默认 8000
    --workers 4 \\            # worker 进程数，默认 1
    --reload \\               # 代码变更自动重启（开发用）
    --reload-dir src \\       # 监听哪个目录
    --log-level info \\       # 日志级别：debug/info/warning/error/critical
    --access-log \\           # 打印访问日志
    --loop uvloop \\          # 事件循环：auto/asyncio/uvloop
    --http httptools \\       # HTTP 解析器：auto/h11/httptools
    --ws websockets \\        # WebSocket 实现：auto/websockets/wsproto
    --lifespan on \\          # lifespan 协议：auto/on/off
    --no-access-log \\        # 关闭访问日志
    --proxy-headers \\        # 信任 X-Forwarded-* 头（在反代后面必加）
    --forwarded-allow-ips '*'  # 允许哪些 IP 的 forwarded 头
    --ssl-keyfile key.pem \\  # SSL 私钥
    --ssl-certfile cert.pem   # SSL 证书
\`\`\`

用配置文件（\`uvicorn_config.py\`）：

\`\`\`python
# uvicorn_config.py
app = "app:app"
host = "0.0.0.0"
port = 8000
workers = 4
log_level = "info"
access_log = True
proxy_headers = True
forwarded_allow_ips = "*"
# 启动：uvicorn uvicorn_config:app --reload 不会读这个
# 正确方式：用 uvicorn.run() 或命令行 --config
\`\`\`

更常见的是用 \`pyproject.toml\` 或者直接在代码里起：

\`\`\`python
# main.py —— 程序化启动 Uvicorn
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,        # 开发用
        workers=1,          # reload 模式下必须 1
        log_level="info",
    )
# 运行：python main.py
\`\`\`

注意：\`reload=True\` 和 \`workers>1\` 不能同时用。开发用 reload 单进程，生产用多进程无 reload。

## Gunicorn 详解

Gunicorn（Green Unicorn）是老牌的 WSGI 服务器，纯 Python 编写，预派生（pre-fork）worker 模型。它的设计哲学：**主进程负责管理，worker 进程负责干活**。

### 预派生模型

启动时主进程先 fork 出 N 个 worker 子进程，每个 worker 独立处理请求。好处：
- worker 之间内存隔离，一个崩了不影响其他。
- 主进程监控 worker，挂了自动拉起新的。
- 充分利用多核（每个 worker 一个进程，GIL 各自独立）。

Gunicorn 的 worker 类型有多种（\`--worker-class\` 或 \`-k\`）：

| worker 类 | 模型 | 适用 |
|-----------|------|------|
| \`sync\`（默认） | 同步，每请求一线程 | WSGI 传统应用 |
| \`threads\` | 多线程 | WSGI，IO 密集 |
| \`gthread\` | 线程 + 异步 | WSGI，混合 |
| \`gevent\` | greenlet 协程 | WSGI，IO 密集，配合 monkey patch |
| \`eventlet\` | 类 gevent | 同上 |
| \`uvicorn.workers.UvicornWorker\` | ASGI 异步 | **跑 ASGI 应用** |
| \`tornado\` | 基于 Tornado | Tornado 应用 |

### 常用参数

\`\`\`bash
gunicorn app:app \\
    --bind 0.0.0.0:8000 \\       # 绑定，可多个：-b :8000 -b /tmp/sock
    --workers 4 \\               # worker 数，推荐 2*CPU+1
    --worker-class sync \\       # worker 类型
    --threads 2 \\               # 每 worker 线程数（sync 类忽略）
    --worker-connections 1000 \\ # gevent/eventlet 的并发连接数
    --timeout 30 \\              # worker 处理一个请求的最长时间
    --graceful-timeout 30 \\     # 优雅关闭等待时间
    --keep-alive 2 \\            # HTTP keep-alive 秒数
    --max-requests 1000 \\       # worker 处理多少请求后重启（防内存泄漏）
    --max-requests-jitter 50 \\  # 加随机抖动，避免同时重启
    --preload \\                 # 主进程先加载应用，worker 共享内存（省内存）
    --reload \\                  # 开发热重载
    --daemon \\                  # 后台运行
    --access-logfile - \\        # 访问日志（- 表示 stdout）
    --error-logfile - \\         # 错误日志
    --log-level info \\          # 日志级别
    --name myapp \\              # 进程名（ps 里看到）
    --user www-data \\           # 运行用户
    --group www-data \\          # 运行组
    --pid /tmp/gunicorn.pid      # PID 文件位置
\`\`\`

### 配置文件

Gunicorn 支持用 Python 文件配置（\`gunicorn.conf.py\`）：

\`\`\`python
# gunicorn.conf.py —— Gunicorn 配置文件
import multiprocessing

# 绑定地址
bind = ["0.0.0.0:8000"]

# worker 数：经典公式 2 * CPU + 1
workers = multiprocessing.cpu_count() * 2 + 1

# worker 类型：跑 ASGI 用 UvicornWorker
worker_class = "uvicorn.workers.UvicornWorker"

# 每 worker 线程数（sync 类用）
threads = 2

# 请求超时
timeout = 30

# 防内存泄漏：处理 1000 请求后重启
max_requests = 1000
max_requests_jitter = 50

# 预加载应用（省内存，但启动慢、reload 不支持）
preload_app = True

# 日志
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 进程名
proc_name = "myapp"

# 优雅重启用
graceful_timeout = 30

# 启动：gunicorn -c gunicorn.conf.py app:app
\`\`\`

## Gunicorn + Uvicorn worker 组合（生产推荐）

FastAPI 官方文档明确推荐的生产部署方式是 **Gunicorn + UvicornWorker**：

\`\`\`bash
# 安装
pip install gunicorn uvicorn[standard] fastapi

# 启动
gunicorn app:app \\
    -w 4 \\
    -k uvicorn.workers.UvicornWorker \\
    -b 0.0.0.0:8000
\`\`\`

为什么是 Gunicorn 包 Uvicorn，而不是直接用 Uvicorn 多 worker？

| 维度 | 纯 Uvicorn --workers | Gunicorn + UvicornWorker |
|------|---------------------|--------------------------|
| **进程管理** | 简单的 spawn，能力有限 | 成熟的主从模型 |
| **优雅重启** | 支持，但更原始 | \`SIGHUP\` 平滑重启 worker |
| **worker 监控** | 弱 | 强（心跳、超时 kill） |
| **预派生** | 无 | \`--preload\` 共享内存 |
| **配置成熟度** | 较简单 | 选项丰富、久经考验 |
| **生态** | 新 | 老牌，运维熟悉 |

简单说：**Uvicorn 单进程性能强、ASGI 实现好；Gunicorn 进程管理强、运维经验足。两者结合 = 各取所长。**

Gunicorn 主进程负责 fork、监控、重启 worker；每个 worker 内部跑 Uvicorn 的 ASGI 实现（uvloop + httptools）。主进程本身不处理 HTTP，只管理。

注意：Gunicorn 主进程是同步的，但因为它只管理不干活，影响不大。

### 完整生产配置示例

\`\`\`python
# gunicorn.conf.py —— FastAPI 生产配置
import multiprocessing

# 绑定（生产通常走 Unix socket + Nginx 反代）
bind = ["unix:/tmp/gunicorn.sock"]
# 或 bind = ["0.0.0.0:8000"]

# worker 数：IO 密集可以多些，CPU 密集按核心数
workers = multiprocessing.cpu_count() * 2 + 1

# ASGI worker
worker_class = "uvicorn.workers.UvicornWorker"

# 超时：长任务调大，或用后台任务
timeout = 60

# 防内存泄漏
max_requests = 1000
max_requests_jitter = 50

# 优雅关闭
graceful_timeout = 30

# keep-alive
keepalive = 5

# 日志
accesslog = "/var/log/myapp/access.log"
errorlog = "/var/log/myapp/error.log"
loglevel = "info"

# 运行用户
user = "www-data"
group = "www-data"

# 启动：
# gunicorn -c gunicorn.conf.py app:app --daemon --pid /tmp/gunicorn.pid
\`\`\`

## uWSGI、Daphne、Hypercorn 对比

| 服务器 | 协议 | 语言 | HTTP/2 | 特点 | 适用 |
|--------|------|------|--------|------|------|
| **Gunicorn** | WSGI/ASGI | Python | ❌ | 老牌稳定，进程管理强 | WSGI 应用，或 + UvicornWorker 跑 ASGI |
| **Uvicorn** | ASGI/WSGI | Python+C | ❌（HTTP/1.1）| 速度最快，FastAPI 默认 | ASGI 应用，开发+生产 |
| **uWSGI** | WSGI | C | ❌ | 功能巨多（缓存、队列、多协议）| 复杂部署、需要多种协议 |
| **Daphne** | ASGI | Python | ❌ | Django Channels 出品 | Django Channels 项目 |
| **Hypercorn** | ASGI/WSGI | Python | ✅ HTTP/2、HTTP/3 | 支持 QUIC | 需要 HTTP/2、HTTP/3 |
| **Waitress** | WSGI | Python | ❌ | 跨平台，无 C 依赖 | Windows 部署 |
| **Meinheld** | WSGI | C | ❌ | 速度快，greenlet | 高性能 WSGI |

选型建议：
- **FastAPI 应用**：Gunicorn + UvicornWorker（生产）或纯 Uvicorn（开发）。
- **Flask/Django 传统**：Gunicorn（sync 或 gevent worker）或 uWSGI。
- **Django Channels（WebSocket）**：Daphne 或 Uvicorn。
- **需要 HTTP/2**：Hypercorn。
- **Windows**：Waitress（uvloop 在 Windows 不可用）。

### uWSGI 配置示例

\`\`\`ini
# uwsgi.ini —— uWSGI 配置
[uwsgi]
# 应用
module = app:app
# 监听
http = :8000
# 或 socket = /tmp/uwsgi.sock（配 Nginx）
# 进程
processes = 4
threads = 2
# 主进程
master = true
# 防内存泄漏
max-requests = 1000
# 守护进程
daemonize = /var/log/uwsgi.log
pidfile = /tmp/uwsgi.pid
# 启动：uwsgi --ini uwsgi.ini
\`\`\`

### Hypercorn 启用 HTTP/2

\`\`\`bash
# 安装
pip install hypercorn

# 启用 HTTP/2（必须 TLS）
hypercorn app:app \\
    -b 0.0.0.0:8443 \\
    --certfile cert.pem \\
    --keyfile key.pem \\
    --workers 4

# HTTP/3（QUIC，实验性）
hypercorn app:app -b 0.0.0.0:8443 --quic --certfile cert.pem --keyfile key.pem
\`\`\`

## worker 数量调优

worker 数量是最常被问的调优参数。**没有银弹**，要看应用类型。

### 经验公式

- **CPU 密集**（重计算、无 IO）：worker 数 = CPU 核心数（再多也用不上，反而增加切换开销）。
- **IO 密集**（查 DB、调 API）：worker 数 = CPU 核心数 × (1 + 等待时间/计算时间)。一般 2-4 倍核心数。
- **Gunicorn 经验值**：\`workers = 2 * cpu_count + 1\`。这是保守的通用值。

\`\`\`python
# 推算公式
import multiprocessing
cpu = multiprocessing.cpu_count()
# 通用
workers = cpu * 2 + 1
# CPU 密集
workers_cpu_bound = cpu
# IO 密集（ASGI 异步可以少一些）
workers_io_bound_async = cpu  # 异步单 worker 也能扛很多并发
\`\`\`

### 内存考量

每个 worker 都是独立进程，会复制一份应用内存。比如应用加载后占 200MB：
- 4 worker = 800MB+
- 16 worker = 3.2GB

用 \`--preload\` 让主进程先加载应用，worker fork 出来共享只读内存，能省一大笔。但 \`preload\` 有坑：
- 应用启动慢会拖累整体启动。
- 数据库连接池在 fork 时会被复制，需要在 fork 后重新建连。
- \`--reload\` 不兼容 preload。

### 异步应用的特殊性

ASGI 应用单 worker 就能扛几千并发（协程开销小）。worker 数主要看 CPU 利用率，不是并发数。比如 4 核机器跑 FastAPI，开 4 个 worker 通常够用，每个 worker 内部跑几千协程。

对比 WSGI：4 核机器跑 Flask 同步，要扛 1000 并发可能要开 20+ worker（每 worker 几十个线程），内存吃紧。

### 实际调优方法

1. **压测**：用 \`wrk\` / \`locust\` 压测，看 QPS 和延迟。
   \`\`\`bash
   # wrk 压测：10 线程、100 并发、30 秒
   wrk -t10 -c100 -d30s http://localhost:8000/
   \`\`\`
2. **监控**：看 CPU、内存、worker 队列长度。CPU 跑满了加 worker 没用，先优化代码；CPU 没满但响应慢，说明在等 IO，加 worker 或换异步。
3. **不要过度**：worker 数过多反而互相争抢 CPU，性能下降。

## 进程管理、信号处理、优雅重启

### 信号

Gunicorn/Uvicorn 主进程支持的信号：

| 信号 | 作用 |
|------|------|
| \`SIGTERM\` / \`SIGINT\` | 优雅停止：通知 worker 处理完当前请求后退出 |
| \`SIGHUP\` | 重新加载配置 + 重启所有 worker |
| \`SIGUSR1\` | 重新打开日志文件（日志切割用） |
| \`SIGUSR2\` | 升级二进制（在线升级 Gunicorn 本身） |
| \`SIGWINCH\` | 优雅停止 worker（保留主进程） |

### 优雅重启

优雅重启（zero-downtime reload）的核心：**老 worker 继续处理完手头请求，新 worker 同时启动接新请求**。

Gunicorn 的 \`SIGHUP\`：

\`\`\`bash
# 启动
gunicorn -c gunicorn.conf.py app:app --pid /tmp/gunicorn.pid

# 优雅重启（更新代码后）
kill -HUP \$(cat /tmp/gunicorn.pid)

# 老的 worker 会处理完当前请求后退出，新的 worker 用新代码启动
\`\`\`

Uvicorn 多 worker 也支持类似机制（\`SIGTERM\` 优雅停止）：

\`\`\`bash
# 启动
uvicorn app:app --workers 4 --pid /tmp/uvicorn.pid &

# 优雅停止
kill -TERM \$(cat /tmp/uvicorn.pid)
\`\`\`

### 日志切割

日志文件越来越大，要切割。常见做法：

\`\`\`bash
# logrotate 配置 /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    # 切割后给 Gunicorn 发 USR1，让它重新打开日志文件
    postrotate
        kill -USR1 \$(cat /tmp/gunicorn.pid)
    endscript
}
\`\`\`

\`SIGUSR1\` 让 Gunicorn 重新打开日志文件句柄，这样切完日志它写到新文件而不是老 inode。

### systemd 管理

生产推荐用 systemd 管理进程，自动启动、崩溃重启、日志收集：

\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Python Web App
After=network.target

[Service]
Type=notify
# Type=notify 要求应用通过 sd_notify 通知 systemd 启动完成
# Gunicorn 0.20+ 支持，加 --bind sdnotify
User=www-data
Group=www-data
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/venv/bin/gunicorn \\
    -c gunicorn.conf.py \\
    --pid /tmp/gunicorn.pid \\
    app:app
ExecReload=/bin/kill -HUP $MAINPID
KillSignal=SIGQUIT
TimeoutStopSec=30
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target

# 操作：
# systemctl start myapp
# systemctl reload myapp   # 优雅重启
# systemctl status myapp
# journalctl -u myapp -f   # 看日志
\`\`\`

## 实际部署示例命令

### 开发环境

\`\`\`bash
# FastAPI 开发
uvicorn app:app --reload --port 8000

# Flask 开发
flask run --debug --port 5000
# 或
python -m flask run
\`\`\`

### 生产环境（Gunicorn + UvicornWorker）

\`\`\`bash
# 直接启动
gunicorn app:app \\
    -w 4 \\
    -k uvicorn.workers.UvicornWorker \\
    -b 0.0.0.0:8000 \\
    --access-logfile - \\
    --error-logfile -

# 用配置文件
gunicorn -c gunicorn.conf.py app:app
\`\`\`

### Nginx 反代 + Gunicorn

生产标配：Nginx 在前处理 TLS、静态文件、负载均衡，Gunicorn 在后跑应用。

\`\`\`nginx
# /etc/nginx/conf.d/myapp.conf
upstream myapp_backend {
    # Gunicorn 监听 Unix socket
    server unix:/tmp/gunicorn.sock;
    # 或 TCP：server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name myapp.com;
    # HTTP 跳 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name myapp.com;

    ssl_certificate     /etc/ssl/myapp.crt;
    ssl_certificate_key /etc/ssl/myapp.key;

    # 静态文件直接 Nginx 处理
    location /static/ {
        alias /opt/myapp/static/;
        expires 30d;
    }

    # 动态请求转给 Gunicorn
    location / {
        proxy_pass http://myapp_backend;
        # 传递客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # 超时
        proxy_read_timeout 60s;
    }
}
\`\`\`

\`\`\`bash
# Gunicorn 配置（监听 socket，信任反代头）
# gunicorn.conf.py
bind = ["unix:/tmp/gunicorn.sock"]
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
# 信任 Nginx 传来的 X-Forwarded-*
forwarded_allow_ips = "*"
proxy_headers = True
\`\`\`

### Docker 部署

\`\`\`dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# 先装依赖（利用 Docker 缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再拷代码
COPY . .

# 非 root 用户
RUN useradd -m appuser
USER appuser

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "app:app", \\
     "-w", "4", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", \\
     "--error-logfile", "-"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
    restart: unless-stopped
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
\`\`\`

\`\`\`bash
# 启动
docker compose up -d

# 查看日志
docker compose logs -f web

# 优雅重启（重新构建后）
docker compose up -d --no-deps --build web
\`\`\`

### Worker 数快速检查命令

\`\`\`bash
# 看 worker 进程
ps aux | grep gunicorn
# 应该看到 1 个主进程 + N 个 worker 进程

# 看每个 worker 的 CPU、内存
top -p $(pgrep -d, -f gunicorn)

# 实时连接数
ss -s
# 或
netstat -an | grep :8000 | wc -l
\`\`\`

## 各服务器启动命令速查

\`\`\`bash
# Uvicorn（ASGI，开发）
uvicorn app:app --reload

# Uvicorn（ASGI，生产，多 worker）
uvicorn app:app --workers 4 --host 0.0.0.0 --port 8000

# Gunicorn + sync（WSGI）
gunicorn app:app -w 4 -b 0.0.0.0:8000

# Gunicorn + UvicornWorker（ASGI，生产推荐）
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# Gunicorn + gevent（WSGI，高并发 IO）
gunicorn app:app -w 4 -k gevent --worker-connections 1000

# uWSGI
uwsgi --ini uwsgi.ini

# Daphne（Django Channels）
daphne -b 0.0.0.0 -p 8000 myproject.asgi:application

# Hypercorn（HTTP/2）
hypercorn app:app -b 0.0.0.0:8443 --certfile cert.pem --keyfile key.pem
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 开发服务器上生产 | \`flask run\` / \`uvicorn --reload\` | 用 Gunicorn 多 worker |
| worker 数照搬 | 一律开 16 个 | 按 CPU/IO 类型算，4 核机器 4-9 个 |
| 不设超时 | 默认 30s 可能不够 | 长任务调大或异步化 |
| 不防内存泄漏 | 不设 max-requests | 设 max-requests + jitter |
| 反代后不传头 | Nginx 不设 X-Forwarded-* | 加 proxy_set_header |
| 用 reload 上生产 | \`--reload\` 开着 | 生产关 reload |
| preload + 数据库连接 | preload 后连接被 fork | fork 后重连或不用 preload |
| WebSocket 没 Upgrade 头 | Nginx 不转发 Upgrade | 加 proxy_set_header Upgrade |
| 用 SIGKILL 停 | \`kill -9\` | 用 SIGTERM/SIGQUIT 优雅停 |
| 日志不切割 | 日志文件无限增长 | logrotate + SIGUSR1 |

## 小结

生产部署 Python Web 应用的黄金组合是 **Gunicorn + UvicornWorker**（ASGI）或 **Gunicorn sync/gthread**（WSGI），前面挂 Nginx 处理 TLS 和静态资源，用 systemd 或 Docker 管理进程。worker 数要按应用类型调，CPU 密集按核数、IO 密集可以多些或换异步。优雅重启用 SIGHUP，日志切割用 SIGUSR1，绝对不要用 SIGKILL。

下一章我们深入 Python 的 async/await 和事件循环——这是 ASGI 一切异步能力的根基。`
  },

  // ============================================================
  // 第 4 章：Python async/await 与事件循环
  // ============================================================
  {
    id: "pyweb2-async-python",
    group: "WSGI 与 ASGI",
    icon: "🔄",
    title: "Python async/await 与事件循环",
    content: `# Python async/await 与事件循环

## 为什么需要异步

在讲语法之前，先想清楚「为什么」。考虑这个场景：你的 Web 应用要处理一个请求，这个请求需要：
1. 查数据库（耗时 50ms，期间 CPU 闲着）
2. 调外部 API（耗时 100ms，期间 CPU 闲着）
3. 拼装结果返回

同步代码：

\`\`\`python
def handle():
    db_result = query_db()     # 阻塞 50ms
    api_result = call_api()    # 阻塞 100ms
    return combine(db_result, api_result)
# 总耗时 150ms，期间 CPU 大部分时间空转
\`\`\`

如果有 100 个并发请求，同步模型需要 100 个线程，每个线程都在等 IO，内存浪费严重。

异步思路：当一个请求在等数据库时，**让出 CPU**去处理别的请求，等数据库回来再继续。这样单线程就能并发处理很多请求。

\`\`\`python
async def handle():
    db_result = await query_db()   # 等 IO 时让出 CPU
    api_result = await call_api()  # 等 IO 时让出 CPU
    return combine(db_result, api_result)
# 总耗时仍是 150ms（顺序 await），但单线程能同时处理几千个这样的请求
\`\`\`

关键区别：\`await\` 不是「阻塞等」，而是「告诉事件循环：我要等这个 IO，你先去忙别的，好了叫我」。

## async/await 语法详解

Python 3.5 引入 \`async\` / \`await\` 两个关键字，让异步代码写得像同步代码一样直观。

### 定义协程

\`\`\`python
# 用 async def 定义的函数叫「协程函数」
async def fetch_data():
    print("开始")
    await asyncio.sleep(1)   # 模拟 IO，await 让出控制权
    print("结束")
    return 42

# 调用它不会立即执行，而是返回一个「协程对象」
coro = fetch_data()
print(type(coro))  # <class 'coroutine'>
# 必须用 await 或事件循环驱动它才会执行
\`\`\`

注意：直接调用 \`fetch_data()\` **不会执行**函数体，只是创建协程对象。这是新手最常踩的坑——「我的协程怎么没跑？」。

### await 的含义

\`await\` 做两件事：
1. 暂停当前协程，把控制权交回事件循环。
2. 等待的「可等待对象」（awaitable）完成后，恢复当前协程，拿到结果。

可等待对象有三种：
- **协程**（coroutine）：\`async def\` 的返回值。
- **Task**：用 \`asyncio.create_task\` 包过的协程，会被事件循环调度。
- **Future**：低层对象，表示「将来会有结果」，一般不直接用。

\`\`\`python
async def main():
    # 1. await 协程
    result = await fetch_data()
    print(result)  # 42

    # 2. await Task
    task = asyncio.create_task(fetch_data())
    result = await task
    print(result)  # 42
\`\`\`

### 错误示范：忘了 await

\`\`\`python
async def bad():
    # 忘了 await！fetch_data() 返回协程对象但没执行
    result = fetch_data()
    print(result)  # <coroutine object fetch_data at 0x...>
    # Python 会 warning: coroutine 'fetch_data' was never awaited
\`\`\`

Python 3.8+ 会发出 \`RuntimeWarning: coroutine '...' was never awaited\`。这种 bug 很隐蔽——代码不报错，但逻辑没执行。

## 事件循环（asyncio）原理

事件循环（event loop）是异步的发动机。它的核心是个 \`while True\` 循环：

\`\`\`python
# 事件循环伪代码
def run_loop():
    while True:
        # 1. 看哪些 IO 就绪了（用 selector/select 查）
        ready = selector.select(timeout=0)
        # 2. 把就绪的回调加入就绪队列
        # 3. 跑就绪队列里的所有任务，跑到它们 await（让出）
        for task in ready_queue:
            task.run_until_yield()
        # 4. 重复
\`\`\`

每个协程在 \`await\` 一个 IO 时，会把自己「挂起」，注册一个「IO 完成时的回调」给事件循环。事件循环检测到 IO 完成，就把对应的协程放回就绪队列继续跑。

Python 标准库的 \`asyncio\` 提供了事件循环实现。常用的入口：

\`\`\`python
import asyncio

# 方式 1：asyncio.run（推荐，Python 3.7+）
async def main():
    print("hello")
asyncio.run(main())
# asyncio.run 会：创建新事件循环 → 跑 main() → 关闭循环

# 方式 2：手动管理（旧代码常见）
loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(main())
finally:
    loop.close()
\`\`\`

\`asyncio.run\` 是推荐的现代写法，它会自动清理资源、设置为主线程的循环。**不要在已有事件循环里调 asyncio.run**（会报错），比如在 ASGI 应用里——那里已经在循环中了。

### 协程的执行流程图解

\`\`\`
事件循环 ──> main() ──await fetch_data()──> fetch_data() ──await sleep(1)──> [挂起，等定时器]
   ↑                                                                              │
   │                                                                              │ 1 秒后定时器就绪
   │                                                                              ↓
   └─────────────── 继续跑别的协程 <─────── 事件循环检测到就绪，恢复 fetch_data <──┘
                                          fetch_data return 42
                                          恢复 main()，拿到 42
\`\`\`

## 协程 vs 线程 vs 进程对比

| 维度 | 协程（asyncio） | 线程（threading） | 进程（multiprocessing） |
|------|----------------|------------------|------------------------|
| **调度** | 用户态，事件循环调度 | 内核调度 | 内核调度 |
| **切换开销** | 极小（~纳秒，仅保存寄存器） | 中（~微秒，内核切换） | 大（~毫秒，复制页表） |
| **内存** | ~KB（栈可配） | ~MB（默认 8MB 栈） | ~MB+（独立地址空间） |
| **并发数** | 单线程上万协程 | 几百到几千 | 几十到几百 |
| **CPU 利用** | 单核（除非多进程） | 多核（受 GIL 限制） | 多核 |
| **通信** | 共享内存（同线程） | 共享内存（要加锁） | IPC（管道、队列） |
| **GIL** | 不影响（单线程） | 受限（同一刻只一个线程跑 Python） | 不影响（独立进程） |
| **适合** | IO 密集、高并发 | IO 密集、需要阻塞调用 | CPU 密集 |
| **心智** | 异步传染，调试难 | 加锁、竞态 | 进程间通信复杂 |
| **Python 库支持** | 异步库（asyncpg、aiomysql） | 全部库 | 全部库 |

关键认识：
- **协程不是并行**，是并发。单线程内的协程是交替跑，不是同时跑。要真并行用多进程。
- **GIL 让多线程无法真并行 Python 字节码**，但 IO 操作会释放 GIL，所以多线程对 IO 密集仍有效。
- **协程的优势是高并发 IO**，不是 CPU 计算。CPU 密集用协程没意义（甚至更慢）。

打个比方：
- **进程** = 多个独立厨房，互不干扰，但开厨房贵、食材要分开买。
- **线程** = 一个厨房多个厨师，共享食材但容易抢（加锁），CPU 只能一个厨师同时切菜（GIL）。
- **协程** = 一个厨师在多个炉子间切换，等水烧开时去切菜。一个厨师能管很多炉子，但只有一双手。

## asyncio 常用 API

### asyncio.run —— 启动循环

\`\`\`python
import asyncio

async def main():
    print("running")

# 顶层入口，跑完关闭循环
asyncio.run(main())
\`\`\`

### asyncio.create_task —— 并发调度

\`\`\`python
async def fetch(url):
    await asyncio.sleep(1)
    return f"data from {url}"

async def main():
    # 串行：总耗时 2 秒
    r1 = await fetch("a")  # 1 秒
    r2 = await fetch("b")  # 1 秒

    # 并发：总耗时 1 秒
    # create_task 立即把协程包装成 Task 并调度
    t1 = asyncio.create_task(fetch("a"))
    t2 = asyncio.create_task(fetch("b"))
    r1 = await t1  # 等 t1 完成
    r2 = await t2  # 此时 t2 早已完成，立即返回
    print(r1, r2)  # 1 秒后同时拿到
\`\`\`

注意：\`create_task\` 一调用就开始调度，不等 \`await\`。如果你创建了 Task 但忘了 await，它仍会跑（只要循环还在），结果可能丢失——叫「fire and forget」。

### asyncio.gather —— 并发跑多个并等全部完成

\`\`\`python
async def main():
    # gather 同时启动多个协程，等全部完成，按顺序返回结果列表
    results = await asyncio.gather(
        fetch("a"),
        fetch("b"),
        fetch("c"),
    )
    print(results)  # ['data from a', 'data from b', 'data from c']
    # 即使 b 先完成，结果顺序也是按传入顺序

    # 异常处理：默认任一抛异常，gather 就抛
    # return_exceptions=True 让异常作为结果返回，不中断其他
    results = await asyncio.gather(
        fetch("a"),
        fetch_error(),  # 抛异常
        return_exceptions=True,
    )
    print(results)  # ['data from a', SomeException(...)]
\`\`\`

\`gather\` vs 串行 \`await\`：gather 是「同时跑、等最慢的」，串行是「一个接一个」。IO 密集场景一定要用 gather。

### asyncio.wait —— 等待条件满足

\`\`\`python
async def main():
    tasks = [asyncio.create_task(fetch(f"u{i}")) for i in range(5)]

    # 等全部完成
    done, pending = await asyncio.wait(tasks)
    # done 是完成的 Task 集合，pending 是未完成的

    # 等任意一个完成就返回
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    # 取消未完成的
    for t in pending:
        t.cancel()

    # 等任意一个完成（推荐用 wait_for 或 as_completed）
\`\`\`

\`wait\` 比 \`gather\` 灵活但更底层，返回的是 Task 集合，要自己取 result。

### asyncio.as_completed —— 谁先完成先处理谁

\`\`\`python
async def main():
    tasks = [fetch(f"u{i}") for i in range(5)]
    # as_completed 返回一个迭代器，谁先完成先 yield 谁
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"完成: {result}")
    # 输出顺序按完成时间，不是传入顺序
\`\`\`

适合场景：爬虫抓多个页面，谁先回来先处理。

### asyncio.wait_for —— 超时控制

\`\`\`python
async def slow():
    await asyncio.sleep(10)
    return "done"

async def main():
    try:
        # 最多等 2 秒
        result = await asyncio.wait_for(slow(), timeout=2)
    except asyncio.TimeoutError:
        print("超时")  # 会打印，slow 被自动取消
\`\`\`

### asyncio.sleep —— 异步 sleep

\`\`\`python
await asyncio.sleep(1)   # ✅ 异步等待，让出 CPU
time.sleep(1)            # ❌ 阻塞整个事件循环，所有协程都卡住
\`\`\`

这是最经典的对比例子。\`time.sleep\` 在异步代码里是灾难——它阻塞整个线程，事件循环没法切换。

### asyncio.Queue —— 协程间通信

\`\`\`python
import asyncio
async def producer(q):
    for i in range(5):
        await asyncio.sleep(0.5)
        await q.put(i)  # 队列满会等待
        print(f"生产 {i}")

async def consumer(q):
    while True:
        item = await q.get()  # 队列空会等待
        print(f"消费 {item}")
        if item == 4:
            break

async def main():
    q = asyncio.Queue(maxsize=3)  # 限制队列大小
    await asyncio.gather(producer(q), consumer(q))

asyncio.run(main())
\`\`\`

### asyncio.Lock / Event / Semaphore —— 异步同步原语

\`\`\`python
import asyncio
# Lock：互斥
lock = asyncio.Lock()
async def critical():
    async with lock:
        # 同一时刻只有一个协程能进这里
        await update_shared_state()

# Semaphore：限制并发数
sem = asyncio.Semaphore(10)  # 最多 10 个并发
async def fetch_limited(url):
    async with sem:
        return await fetch(url)

# Event：等信号
event = asyncio.Event()
async def waiter():
    await event.wait()  # 等 set()
    print("收到信号")
async def setter():
    await asyncio.sleep(1)
    event.set()
\`\`\`

### 完整示例：并发抓取多个 URL

\`\`\`python
import asyncio
import time

async def fetch(url, delay):
    await asyncio.sleep(delay)  # 模拟网络延迟
    return f"{url} 的数据（耗时 {delay}s）"

async def main():
    urls = [
        ("a.com", 1),
        ("b.com", 2),
        ("c.com", 3),
    ]

    t0 = time.time()

    # 串行：1+2+3=6 秒
    # for url, delay in urls:
    #     print(await fetch(url, delay))

    # 并发：max(1,2,3)=3 秒
    tasks = [fetch(url, delay) for url, delay in urls]
    results = await asyncio.gather(*tasks)
    for r in results:
        print(r)

    print(f"总耗时 {time.time()-t0:.2f}s")  # 3 秒

asyncio.run(main())
\`\`\`

## 异步 HTTP 客户端（httpx、aiohttp）

异步 Web 应用里调外部 API 必须用异步 HTTP 客户端，否则会阻塞事件循环。

### httpx（推荐，同步异步都支持）

\`\`\`bash
pip install httpx
\`\`\`

\`\`\`python
import asyncio
import httpx

async def fetch_json(url):
    # async with 自动管理连接池
    async with httpx.AsyncClient() as client:
        # await client.get 返回 Response
        resp = await client.get(url, timeout=10)
        # raise_for_status 检查状态码，非 2xx 抛异常
        resp.raise_for_status()
        return resp.json()

async def main():
    # 单个请求
    data = await fetch_json("https://api.github.com/users/torvalds")
    print(data["name"])

    # 并发多个请求
    urls = [
        "https://api.github.com/users/torvalds",
        "https://api.github.com/users/gvanrossum",
        "https://api.github.com/users/yyx990803",
    ]
    async with httpx.AsyncClient() as client:
        # 用 gather 并发
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        for r in responses:
            print(r.json()["name"])

asyncio.run(main())
\`\`\`

httpx 优势：
- 同步用 \`httpx.Client\`，异步用 \`httpx.AsyncClient\`，API 几乎一样。
- 支持 HTTP/2（\`http2=True\`）。
- 与 requests 接口接近，迁移成本低。

### aiohttp（老牌，纯异步）

\`\`\`bash
pip install aiohttp
\`\`\`

\`\`\`python
import asyncio
import aiohttp

async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            # await resp.json() 异步解析 JSON
            return await resp.json()

async def main():
    data = await fetch("https://api.github.com/users/torvalds")
    print(data["name"])

asyncio.run(main())
\`\`\`

aiohttp 优势：
- 性能略高，生态成熟。
- 既能做客户端，也能做服务器（\`aiohttp.web\`）。

httpx vs aiohttp：新项目推荐 httpx，API 更现代、文档更好、同步异步一致。aiohttp 适合需要其服务器功能或追求极致性能的场景。

### 在 FastAPI 里用 httpx 调外部 API

\`\`\`python
# app.py —— FastAPI + httpx
from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/weather/{city}")
async def get_weather(city: str):
    # 注意：必须 async def，httpx 调用必须 await
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.weather.com/v1/{city}",
            timeout=10,
        )
        return resp.json()

# 如果用同步的 requests 库：
# @app.get("/weather/{city}")
# def get_weather(city: str):  # 同步 def，FastAPI 会丢到线程池
#     resp = requests.get(...)  # 阻塞，但在独立线程里
#     return resp.json()
# FastAPI 对同步 def 会自动用线程池跑，但不如 async 高效
\`\`\`

## 异步数据库（SQLAlchemy async、databases、asyncpg）

数据库是 Web 应用最大的 IO 来源，必须异步化。

### asyncpg（PostgreSQL 原生异步驱动）

\`\`\`bash
pip install asyncpg
\`\`\`

\`\`\`python
import asyncio
import asyncpg

async def main():
    # 建立连接
    conn = await asyncpg.connect(
        "postgresql://user:pass@localhost/db",
    )
    try:
        # 执行查询，await 等结果
        rows = await conn.fetch("SELECT id, name FROM users LIMIT 10")
        for row in rows:
            # row 像字典，但用 . 访问
            print(row["id"], row["name"])

        # 参数化查询（防注入）
        user = await conn.fetchrow(
            "SELECT * FROM users WHERE id = $1", 42
        )

        # 插入
        await conn.execute(
            "INSERT INTO users(name) VALUES ($1)", "tom"
        )
    finally:
        await conn.close()

asyncio.run(main())
\`\`\`

asyncpg 是最快的 PostgreSQL 异步驱动，但 API 偏底层，没有 ORM。

### SQLAlchemy 2.0 async（推荐 ORM）

\`\`\`bash
pip install "sqlalchemy[asyncio]" asyncpg
\`\`\`

\`\`\`python
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import select

Base = declarative_base()

# 定义模型，和同步版本一样
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

async def main():
    # 异步引擎，注意驱动是 asyncpg
    engine = create_async_engine(
        "postgresql+asyncpg://user:pass@localhost/db",
        echo=True,
    )

    # 建表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 异步 Session
    async with AsyncSession(engine) as session:
        # 插入
        session.add(User(name="tom"))
        await session.commit()  # 必须 await

        # 查询
        result = await session.execute(
            select(User).where(User.name == "tom")
        )
        user = result.scalar_one()
        print(user.id, user.name)

    await engine.dispose()  # 关闭连接池

asyncio.run(main())
\`\`\`

### databases（更轻量的选择）

\`\`\`bash
pip install databases asyncpg
\`\`\`

\`\`\`python
import asyncio
import databases

database = databases.Database(
    "postgresql://user:pass@localhost/db"
)

async def main():
    await database.connect()

    # 查询
    rows = await database.fetch_all("SELECT * FROM users")
    for row in rows:
        print(row["id"], row["name"])

    # 插入，返回自增 ID
    query = "INSERT INTO users(name) VALUES (:name) RETURNING id"
    user_id = await database.execute(query, values={"name": "tom"})
    print(user_id)

    await database.disconnect()

asyncio.run(main())
\`\`\`

选型建议：
- **FastAPI + 复杂模型**：SQLAlchemy 2.0 async，功能全、生态成熟。
- **追求极致性能 + 简单查询**：asyncpg，最快但要手写 SQL。
- **轻量 + 不想用大 ORM**：databases，API 简洁。

### 连接池

异步数据库一定要用连接池，不要每次请求新建连接（建连很贵）：

\`\`\`python
# 全局引擎，应用启动时建，关闭时销毁
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db",
    pool_size=20,        # 连接池大小
    max_overflow=10,     # 超出 pool_size 还能开的临时连接
    pool_pre_ping=True,  # 用前 ping，避免拿到死连接
    pool_recycle=3600,   # 1 小时回收，避免数据库侧超时
)
\`\`\`

FastAPI 里把 engine 挂在 lifespan：

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动：建连接池
    app.state.engine = create_async_engine(...)
    yield
    # 关闭：释放
    await app.state.engine.dispose()

app = FastAPI(lifespan=lifespan)
\`\`\`

## 常见陷阱

### 1. 阻塞事件循环

最大的坑。一旦在协程里写了阻塞调用，整个事件循环卡住，所有协程都动不了。

\`\`\`python
async def bad():
    # ❌ 这些都会阻塞事件循环
    time.sleep(1)              # 阻塞 sleep
    requests.get(url)          # 同步 HTTP
    open("big.txt").read()     # 同步文件读
    pymysql.connect(...)       # 同步 DB
    json.loads(huge_string)    # CPU 密集也会阻塞（虽然不阻塞 IO，但占用循环）

async def good():
    # ✅ 异步版本
    await asyncio.sleep(1)
    async with httpx.AsyncClient() as c:
        await c.get(url)
    await asyncio.to_thread(lambda: open("big.txt").read())  # 丢线程池
\`\`\`

如果必须用同步阻塞库，用 \`asyncio.to_thread\`（Python 3.9+）或 \`loop.run_in_executor\` 丢到线程池：

\`\`\`python
import asyncio
import requests

async def fetch_sync(url):
    # 把同步阻塞函数丢到线程池跑
    # asyncio.to_thread 返回一个可 await 的对象
    return await asyncio.to_thread(requests.get, url)
# 这样不会阻塞事件循环，但占了一个线程
\`\`\`

### 2. 未 await 的协程

\`\`\`python
async def fetch():
    await asyncio.sleep(1)
    return "data"

async def main():
    fetch()  # ❌ 创建了协程对象但没 await，没执行
    # Warning: coroutine 'fetch' was never awaited
    # 正确：
    data = await fetch()
\`\`\`

### 3. 在 async 里创建大量 Task 但不限制并发

\`\`\`python
async def fetch(url):
    await asyncio.sleep(1)

async def bad():
    urls = [...] * 10000
    # ❌ 一次性创建 10000 个 Task，可能耗尽内存/连接
    tasks = [asyncio.create_task(fetch(u)) for u in urls]
    await asyncio.gather(*tasks)

async def good():
    urls = [...] * 10000
    sem = asyncio.Semaphore(100)  # 限制并发 100
    async def limited(u):
        async with sem:
            return await fetch(u)
    tasks = [asyncio.create_task(limited(u)) for u in urls]
    await asyncio.gather(*tasks)
\`\`\`

### 4. 在 async 里用同步锁

\`\`\`python
import asyncio
import threading

lock = threading.Lock()  # ❌ 同步锁
async def bad():
    with lock:  # 阻塞事件循环
        ...

# 正确：
lock = asyncio.Lock()  # ✅ 异步锁
async def good():
    async with lock:
        ...
\`\`\`

### 5. asyncio.run 嵌套

\`\`\`python
async def main():
    asyncio.run(other())  # ❌ RuntimeError: already running event loop

# 正确：直接 await
async def main():
    await other()
\`\`\`

\`asyncio.run\` 只能在没有运行中循环时调用（一般是程序最顶层）。在 ASGI 应用、Jupyter 里都已经在循环中，不能再调。

### 6. 捕获异常丢失上下文

\`\`\`python
async def fetch():
    raise ValueError("boom")

async def main():
    try:
        await fetch()
    except Exception:
        # ❌ 不打印 traceback，调试困难
        pass

    # 正确：
    try:
        await fetch()
    except Exception:
        import traceback
        traceback.print_exc()
        # 或 logging.exception("xxx")
\`\`\`

### 7. create_task 引用的变量逃逸

\`\`\`python
async def bad():
    for i in range(5):
        # ❌ 闭包陷阱：所有 task 看到的 i 都是 4
        asyncio.create_task(do_something(i))

async def good():
    for i in range(5):
        # 默认参数捕获当前值
        asyncio.create_task(do_something(i=i))
\`\`\`

### 8. 取消协程不处理 CancelledError

\`\`\`python
async def worker():
    try:
        await long_running()
    except asyncio.CancelledError:
        # 收到取消信号，清理资源
        cleanup()
        raise  # 必须 re-raise，否则取消被吞
\`\`\`

\`asyncio.wait_for\` 超时、\`task.cancel()\` 都会抛 \`CancelledError\`，要正确处理，否则协程「假取消」。

## 协程调试技巧

\`\`\`python
import asyncio
import logging

# 1. 开 debug 模式：慢回调、未消费异常都会报警
asyncio.run(main(), debug=True)

# 2. 日志级别
logging.basicConfig(level=logging.DEBUG)

# 3. 让事件循环跑慢回调报警（默认 100ms）
loop = asyncio.get_event_loop()
loop.slow_callback_duration = 0.1  # 超过 100ms 的回调打 warning

# 4. 用 aiohttp 的访问日志看耗时
\`\`\`

Python 3.12+ 还有 \`asyncio.TaskGroup\`，比 gather 更安全（任一异常会自动取消其他）：

\`\`\`python
async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch("a"))
        t2 = tg.create_task(fetch("b"))
    # 退出 with 块时所有 task 已完成
    # 任一抛异常，其他自动取消，整体抛 ExceptionGroup
    print(t1.result(), t2.result())
\`\`\`

## 速查表：常用 API

\`\`\`python
import asyncio

# 启动
asyncio.run(main())                         # 顶层入口

# 创建任务（并发）
task = asyncio.create_task(coro)            # 立即调度
result = await task                         # 等完成

# 并发等待
results = await asyncio.gather(*coros)      # 全部完成，按顺序返回
results = await asyncio.gather(*coros, return_exceptions=True)  # 异常作为结果

# 条件等待
done, pending = await asyncio.wait(tasks)   # 全部完成
done, pending = await asyncio.wait(tasks, return_when=FIRST_COMPLETED)

# 超时
result = await asyncio.wait_for(coro, timeout=5)  # 超时抛 TimeoutError

# 顺序处理（谁先完成先处理）
for coro in asyncio.as_completed(coros):
    result = await coro

# sleep
await asyncio.sleep(1)                      # 异步等待

# 队列
q = asyncio.Queue(maxsize=10)
await q.put(item); item = await q.get()

# 同步原语
lock = asyncio.Lock()
event = asyncio.Event()
sem = asyncio.Semaphore(10)

# 线程池（跑同步阻塞代码）
result = await asyncio.to_thread(blocking_fn, arg1, arg2)

# TaskGroup（Python 3.11+，推荐）
async with asyncio.TaskGroup() as tg:
    t1 = tg.create_task(coro1)
    t2 = tg.create_task(coro2)
\`\`\`

## 易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| 阻塞事件循环 | \`time.sleep\` / \`requests.get\` | \`asyncio.sleep\` / \`httpx\` |
| 忘了 await | \`fetch()\` 不 await | \`await fetch()\` |
| 同步锁 | \`threading.Lock\` | \`asyncio.Lock\` |
| 同步 DB 驱动 | \`pymysql\` | \`asyncpg\` / \`aiomysql\` |
| 嵌套 asyncio.run | 在协程里调 run | 直接 await |
| 不限并发 | 一次创建 10000 Task | 用 Semaphore 限制 |
| 吞掉 CancelledError | except 后不 raise | 清理后 re-raise |
| create_task 闭包 | for i: create_task(lambda: use(i)) | 用默认参数捕获 |
| 调试不打印 traceback | except: pass | logging.exception |
| 不用连接池 | 每次请求 new 连接 | 全局引擎 + 池 |

## 小结

Python 的 \`async/await\` 让异步代码写得像同步代码一样直观，事件循环在背后调度协程——单线程就能扛成千上万的并发 IO。但异步的「传染性」意味着全栈都得 async：HTTP 客户端用 httpx、数据库用 asyncpg/SQLAlchemy async、锁用 asyncio.Lock，一处阻塞全盘皆卡。

记住核心原则：
- **IO 密集 + 高并发** → 异步（ASGI、asyncio）
- **CPU 密集** → 多进程（multiprocessing）
- **传统 CRUD 不想折腾** → 同步（WSGI、Flask）

掌握 async/await 是理解 ASGI、写出高性能 FastAPI 应用的根基。下一批章节我们会进入 ORM 与 SQLAlchemy，看看数据持久化层怎么和 Web 应用配合。`
  }
];
