// =============================================================
// FastAPI 现代开发全书 - 第 6 批章节
// -------------------------------------------------------------
// 分组：中间件与异常
// 本批包含 3 章：
//   fp-middleware-basic:    中间件机制与内置中间件
//   fp-middleware-custom:   自定义中间件
//   fp-exception-handling:  异常处理体系
// =============================================================

export const chapters = [
  {
    id: "fp-middleware-basic",
    group: "中间件与异常",
    icon: "🧅",
    title: "中间件机制与内置中间件",
    content: `# 中间件机制与内置中间件

中间件（Middleware）是 Web 框架中一个极其重要的概念。如果说路由函数是"处理请求的核心逻辑"，那么中间件就是"包裹在核心逻辑外面的洋葱皮"——每一层中间件都能在请求到达路由之前、以及响应离开路由之后，做统一处理。FastAPI 的中间件能力继承自 Starlette，提供了 CORS、GZip、TrustedHost、HTTPSRedirect、Session 等开箱即用的内置中间件。本章会从"洋葱模型"讲起，讲透中间件的机制和所有内置中间件的用法。

## 一、中间件是什么：洋葱模型

理解中间件最直观的方式是"洋葱模型"。想象一个洋葱，每一层皮是一个中间件，最中间的"芯"是路由函数。请求从外向里穿透每一层中间件，到达路由后，响应再从里向外穿透每一层中间件返回。

\`\`\`text
请求 ->
  [中间件 A] -> [中间件 B] -> [中间件 C] -> [路由函数]
  <- [中间件 A] <- [中间件 B] <- [中间件 C] <- 响应
  <-
\`\`\`

每一层中间件可以在"请求进入时"做事（如记录日志、校验头），也可以在"响应离开时"做事（如添加头、压缩数据）。这种"前后夹击"的能力，让中间件非常适合做**横切关注点**（cross-cutting concerns）——那些和业务逻辑无关、但每个请求都需要的事：日志、鉴权、CORS、压缩、限流等。

### Demo 1: 用文字图理解中间件执行顺序

\`\`\`text
假设有三个中间件：A、B、C（按注册顺序）

请求到达时：
  A 收到请求
    A 调用 call_next -> B 收到请求
      B 调用 call_next -> C 收到请求
        C 调用 call_next -> 路由函数执行
        C 收到响应
      B 收到响应
    A 收到响应
  A 返回响应给客户端

关键点：
1. 请求阶段：A -> B -> C -> 路由（先进先出）
2. 响应阶段：路由 -> C -> B -> A（后进先出，像栈）
3. 最先注册的中间件最外层，最后注册的最内层
\`\`\`

## 二、@app.middleware("http") 语法与 call_next

FastAPI 提供了 \`@app.middleware("http")\` 装饰器来注册中间件。每个中间件是一个异步函数，接收 \`Request\` 对象，通过 \`call_next\` 把请求传给下一层。

### Demo 2: 第一个中间件

\`\`\`python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 注册一个 HTTP 中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    请求日志中间件
    - request: 当前请求对象，包含头、URL、方法等
    - call_next: 调用下一层（中间件或路由）的函数
    """
    # ---- 请求阶段：这里在路由之前执行 ----
    start_time = time.time()
    print(f"[请求] {request.method} {request.url.path}")

    # 调用下一层，拿到响应
    response = await call_next(request)

    # ---- 响应阶段：这里在路由之后执行 ----
    duration = time.time() - start_time
    print(f"[响应] {request.method} {request.url.path} 耗时 {duration:.4f}s")

    # 可以修改响应头
    response.headers["X-Process-Time"] = f"{duration:.4f}"

    # 必须返回响应
    return response

@app.get("/")
def root():
    return {"message": "Hello"}

@app.get("/slow")
async def slow():
    import asyncio
    await asyncio.sleep(1)
    return {"message": "slow"}

# 访问 / 时控制台输出：
# [请求] GET /
# [响应] GET / 耗时 0.0023s
# 响应头里会有 X-Process-Time: 0.0023
\`\`\`

\`call_next(request)\` 是中间件的核心——它把请求"传递"给下一层（可能是另一个中间件，也可能是最终的路由函数）。在 \`call_next\` 之前的代码是"请求前处理"，之后的代码是"响应后处理"。

## 三、请求前/响应后处理：中间件的两面性

中间件的威力在于它能在"请求前"和"响应后"各做一件事。这种"前后夹击"让中间件非常适合做统计、转换、注入等操作。

### Demo 3: 请求 ID 注入中间件

\`\`\`python
from fastapi import FastAPI, Request
import uuid

app = FastAPI()

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """为每个请求生成唯一 ID，注入请求头和响应头"""
    # 请求前：从请求头读 X-Request-ID，没有则生成一个
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    # 把 request_id 放进 request.state，路由函数可以访问
    request.state.request_id = request_id

    # 调用下一层
    response = await call_next(request)

    # 响应后：在响应头加上 X-Request-ID，方便客户端追踪
    response.headers["X-Request-ID"] = request_id

    return response

@app.get("/trace")
def trace(request: Request):
    # 路由函数可以从 request.state 拿到中间件注入的数据
    return {"request_id": request.state.request_id}

# 测试：
# curl http://127.0.0.1:8000/trace
# 响应头：X-Request-ID: <uuid>
# 响应体：{"request_id":"<uuid>"}
#
# curl -H "X-Request-ID: my-trace-001" http://127.0.0.1:8000/trace
# 响应头：X-Request-ID: my-trace-001
# 响应体：{"request_id":"my-trace-001"}
\`\`\`

\`request.state\` 是 FastAPI 提供的"请求级存储"——中间件和路由之间共享数据的桥梁。你可以把它当成一个"每个请求独立的命名空间"。

## 四、CORS 中间件详解

CORS（Cross-Origin Resource Sharing，跨域资源共享）是前端开发中最常遇到的中间件。浏览器有同源策略：默认情况下，\`https://a.com\` 的 JS 不能访问 \`https://b.com\` 的 API。CORS 中间件通过设置响应头，告诉浏览器"允许哪些来源跨域访问"。

### Demo 4: CORS 中间件配置

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    # allow_origins: 允许跨域的来源列表
    # - ["https://www.example.com"] 只允许这个域名
    # - ["*"] 允许所有域名（开发环境用，生产不推荐）
    # - ["https://app.example.com", "https://admin.example.com"] 多个域名
    allow_origins=[
        "http://localhost:3000",      # 前端开发服务器
        "https://app.example.com",    # 生产前端
    ],
    # allow_credentials: 是否允许携带 Cookie
    # True 时 allow_origins 不能是 ["*"]，必须明确指定域名
    allow_credentials=True,
    # allow_methods: 允许的 HTTP 方法
    # ["*"] 表示所有方法（GET/POST/PUT/DELETE 等）
    allow_methods=["*"],
    # allow_headers: 允许的请求头
    # ["*"] 表示所有头（Authorization、Content-Type 等）
    allow_headers=["*"],
    # expose_headers: 允许前端 JS 读取的响应头
    # 默认前端只能读基本头，自定义头要在这里声明
    expose_headers=["X-Request-ID", "X-Total-Count"],
    # max_age: 预检请求缓存时间（秒）
    # 浏览器会缓存预检结果，减少 OPTIONS 请求
    max_age=600,
)

@app.get("/api/data")
def get_data():
    return {"data": "Hello from API"}

# 前端 http://localhost:3000 可以跨域访问 /api/data
# 前端 http://evil.com 访问会被浏览器拦截（因为不在 allow_origins 里）
\`\`\`

CORS 的工作原理：
1. 前端发请求时，浏览器自动检查是否跨域。
2. 如果跨域且需要预检（非简单请求），浏览器先发 OPTIONS 请求。
3. CORS 中间件响应 OPTIONS，告诉浏览器允许的来源/方法/头。
4. 浏览器确认后，才发真正的请求。
5. CORS 中间件在实际响应里也加上 \`Access-Control-Allow-Origin\` 头。

## 五、GZip 中间件

GZip 中间件自动压缩响应体，减少网络传输量。适合返回大量 JSON 或 HTML 的接口。

### Demo 5: GZip 中间件

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()

# 添加 GZip 中间件
# minimum_size: 响应体小于此字节数不压缩（压缩太小没意义，反而增加开销）
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/big-data")
def big_data():
    # 返回一个较大的 JSON，会被自动 GZip 压缩
    return {"items": [{"id": i, "name": f"item-{i}"} for i in range(1000)]}
    # 原始大小约 30KB，GZip 后约 3KB，节省 90% 带宽

# 测试（需要加 Accept-Encoding: gzip 头，浏览器和 httpx 默认会加）：
# curl -H "Accept-Encoding: gzip" http://127.0.0.1:8000/big-data --compressed
# 响应头：Content-Encoding: gzip
# 响应体：压缩后的数据
\`\`\`

GZip 中间件只在客户端发送 \`Accept-Encoding: gzip\` 头时才压缩（浏览器默认发送）。如果响应体小于 \`minimum_size\`，不压缩——因为压缩小数据反而可能变大（GZip 有头部开销）。

## 六、TrustedHost 中间件

TrustedHost 中间件防止 HTTP Host 头攻击——只允许指定的 Host 头通过，其他返回 400。

### Demo 6: TrustedHost 中间件

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# 只允许这些 Host 头
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "www.example.com", "localhost"],
)

@app.get("/")
def root():
    return {"host": "allowed"}

# 测试：
# curl -H "Host: example.com" http://127.0.0.1:8000/   -> 200 OK
# curl -H "Host: evil.com" http://127.0.0.1:8000/       -> 400 Bad Request
# curl -H "Host: localhost" http://127.0.0.1:8000/      -> 200 OK
\`\`\`

为什么要防 Host 头攻击？攻击者可以伪造 Host 头（如 \`Host: evil.com\`），如果你的代码用 \`request.url.hostname\` 生成密码重置链接，就会生成 \`https://evil.com/reset?token=xxx\`，导致 token 泄漏。TrustedHost 中间件从源头拒绝非法 Host。

\`allowed_hosts\` 支持 \`["*"]\`（允许所有），但这等于没防护。生产环境必须明确列出你的域名。

## 七、HTTPSRedirect 中间件

HTTPSRedirect 中间件把所有 HTTP 请求重定向到 HTTPS，强制加密通信。

### Demo 7: HTTPSRedirect 中间件

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()

# 所有 HTTP 请求会被重定向到 HTTPS
app.add_middleware(HTTPSRedirectMiddleware)

@app.get("/")
def root():
    return {"message": "You are using HTTPS"}

# 测试：
# curl http://example.com/ -> 307 重定向到 https://example.com/
# curl https://example.com/ -> 200 OK
#
# 注意：本地开发时通常用 HTTP，不要开这个中间件
# 这个中间件适合部署在反向代理（如 Nginx）后面，
# Nginx 做 SSL 终止，但传递原始协议信息给 FastAPI
\`\`\`

如果反向代理（Nginx/CloudFlare）负责 SSL 证书，FastAPI 收到的是 HTTP 请求。为了让 HTTPSRedirect 正确工作，反向代理需要设置 \`X-Forwarded-Proto: https\` 头，FastAPI 会据此判断原始协议。

## 八、SessionMiddleware

SessionMiddleware 提供基于 Cookie 的会话管理。它用签名 Cookie 存储会话数据（不是服务端存储），数据加密签名后存在客户端 Cookie 里。

### Demo 8: SessionMiddleware 实现登录状态

\`\`\`python
from fastapi import FastAPI, Request, Response
from fastapi.middleware.sessions import SessionMiddleware

app = FastAPI()

# 添加 Session 中间件
# secret_key: 签名密钥，必须保密！泄露后攻击者可伪造会话
app.add_middleware(SessionMiddleware, secret_key="your-super-secret-key-change-in-prod")

@app.post("/login")
async def login(request: Request):
    """登录：把用户信息存入 session"""
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    # 模拟校验
    if username == "admin" and password == "123456":
        # request.session 是一个类字典对象
        # 写入的数据会被签名后存在 Cookie 里
        request.session["user"] = {"username": "admin", "role": "admin"}
        return {"message": "登录成功"}
    return {"message": "用户名或密码错误"}

@app.get("/me")
def me(request: Request):
    """读取 session 里的用户信息"""
    user = request.session.get("user")
    if user:
        return {"logged_in": True, "user": user}
    return {"logged_in": False}

@app.post("/logout")
def logout(request: Request):
    """登出：清除 session"""
    request.session.clear()
    return {"message": "已登出"}

# 测试流程：
# 1. curl -X POST http://127.0.0.1:8000/login -H "Content-Type: application/json" -d '{"username":"admin","password":"123456"}' -c cookies.txt
#    -> {"message":"登录成功"}，同时 Cookie 里存了 session 数据
# 2. curl http://127.0.0.1:8000/me -b cookies.txt
#    -> {"logged_in":true,"user":{"username":"admin","role":"admin"}}
# 3. curl -X POST http://127.0.0.1:8000/logout -b cookies.txt
#    -> {"message":"已登出"}
# 4. curl http://127.0.0.1:8000/me -b cookies.txt
#    -> {"logged_in":false}
\`\`\`

SessionMiddleware 的原理：
- \`request.session\` 是一个 \`SessionStorage\` 对象，本质是字典。
- 响应时，中间件把 session 数据序列化、用 \`secret_key\` 签名，编码成 Cookie 值。
- 下次请求时，中间件从 Cookie 读取、验签、反序列化回 \`request.session\`。
- 因为有签名，客户端无法篡改 session 数据（改了验签失败）。
- 但数据是明文编码的（Base64），不要存敏感信息（如密码）。如果要加密，需要自己加。

## 九、中间件执行顺序的实战

### Demo 9: 多个中间件的执行顺序

\`\`\`python
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def middleware_a(request: Request, call_next):
    print("[A] 请求前")
    response = await call_next(request)
    print("[A] 响应后")
    return response

@app.middleware("http")
async def middleware_b(request: Request, call_next):
    print("[B] 请求前")
    response = await call_next(request)
    print("[B] 响应后")
    return response

@app.middleware("http")
async def middleware_c(request: Request, call_next):
    print("[C] 请求前")
    response = await call_next(request)
    print("[C] 响应后")
    return response

@app.get("/")
def root():
    print("[路由] 执行中")
    return {"ok": True}

# 访问 / 时控制台输出：
# [C] 请求前
# [B] 请求前
# [A] 请求前
# [路由] 执行中
# [A] 响应后
# [B] 响应后
# [C] 响应后

# 注意：@app.middleware 注册的顺序和执行顺序是"反"的！
# 后注册的中间件在外层（先执行请求前，后执行响应后）
# 这是因为 Starlette 内部用"洋葱"模型，后添加的包裹在外面
#
# 如果用 app.add_middleware，执行顺序也是"后添加的在外层"
# 所以要注意注册顺序：越基础的中间件（如错误处理）越晚加（越外层）
\`\`\`

这个"反序"特性容易踩坑。如果你想让某个中间件"最先处理请求"，就要最后注册它。

## 十、中间件 vs 依赖：什么时候用哪个

中间件和依赖注入都能做"请求前处理"，怎么选？

| 维度 | 中间件 | 依赖注入 |
|------|--------|---------|
| 作用范围 | 所有请求 | 声明了依赖的路由 |
| 能否修改响应 | 能（改头、改状态码、改体） | 不能（只能在路由前做事） |
| 能否短路请求 | 能（直接返回响应，不调 call_next） | 能（抛异常） |
| 性能开销 | 每个请求都经过 | 只对声明了的路由 |
| 典型场景 | CORS、日志、压缩、限流 | 鉴权、参数校验、分页 |

**经验法则**：
- 如果是"所有请求都要做"的事 → 中间件。
- 如果是"部分路由需要"的事 → 依赖。
- 如果需要"修改响应" → 中间件（依赖做不到）。
- 如果需要"按路由定制" → 依赖（中间件不区分路由）。

## 十一、本章小结

- **中间件**：洋葱模型，每层中间件在请求前和响应后各做处理，适合横切关注点。
- **\`@app.middleware("http")\`**：注册中间件的装饰器，函数接收 \`request\` 和 \`call_next\`。
- **\`call_next(request)\`**：把请求传给下一层，返回响应。之前是"请求前"，之后是"响应后"。
- **CORS**：解决浏览器跨域，配置 \`allow_origins\`、\`allow_methods\`、\`allow_headers\`。
- **GZip**：自动压缩响应体，\`minimum_size\` 控制压缩阈值。
- **TrustedHost**：防止 Host 头攻击，只允许指定 Host。
- **HTTPSRedirect**：强制 HTTPS，配合反向代理的 \`X-Forwarded-Proto\` 使用。
- **SessionMiddleware**：基于签名 Cookie 的会话管理，\`request.session\` 读写会话数据。
- **执行顺序**：后注册的中间件在外层（先处理请求前，后处理响应后）。
- **中间件 vs 依赖**：全局处理用中间件，按路由定制用依赖。

下一章我们学习如何自己写中间件——包括纯 ASGI 中间件、BaseHTTPMiddleware 类、以及限流/日志/耗时统计等实战。
`
  },

  {
    id: "fp-middleware-custom",
    group: "中间件与异常",
    icon: "🔧",
    title: "自定义中间件",
    content: `# 自定义中间件

上一章我们学了内置中间件的用法。但真实项目中，内置中间件往往不够用——你需要自己写中间件来做限流、日志、耗时统计等定制化操作。FastAPI（更准确地说是 Starlette）提供了两种写自定义中间件的方式：纯 ASGI 中间件和 \`BaseHTTPMiddleware\` 类。本章会讲透这两种写法的区别、执行顺序的细节，并通过限流、日志、耗时统计三个实战让你掌握自定义中间件的开发。

## 一、两种自定义中间件的写法

Starlette 提供两种写中间件的方式：

1. **纯 ASGI 中间件**：直接实现 ASGI 协议（\`async def __call__(self, scope, receive, send)\`），性能最高，但写法底层、不直观。
2. **\`BaseHTTPMiddleware\` 类**：继承 \`BaseHTTPMiddleware\`，重写 \`async def dispatch()\`，写法高层、直观，但性能略低（多一层包装）。

**选择建议**：
- 大多数情况下用 \`BaseHTTPMiddleware\`——足够快，且代码易读。
- 对性能有极致要求（如每秒上万请求）时，用纯 ASGI。

## 二、纯 ASGI 中间件写法

纯 ASGI 中间件直接操作 ASGI 协议的三要素：\`scope\`（请求元信息）、\`receive\`（接收请求体）、\`send\`（发送响应）。

### Demo 1: 纯 ASGI 中间件

\`\`\`python
from fastapi import FastAPI
from starlette.types import ASGIApp, Receive, Scope, Send

app = FastAPI()

class SimpleASGIMiddleware:
    """
    纯 ASGI 中间件：直接实现 __call__(scope, receive, send)
    """
    def __init__(self, app: ASGIApp):
        # app 是下一层 ASGI 应用（可能是路由，也可能是下一个中间件）
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        # scope 是一个字典，包含请求的元信息
        # scope["type"] 可能是 "http"、"websocket"、"lifespan"
        if scope["type"] != "http":
            # 非 HTTP 请求（如 lifespan 启动事件），直接放行
            await self.app(scope, receive, send)
            return

        # ---- 请求前处理 ----
        path = scope.get("path", "")
        method = scope.get("method", "")
        print(f"[ASGI] {method} {path}")

        # ---- 调用下一层 ----
        await self.app(scope, receive, send)

        # ---- 响应后处理 ----
        # 注意：纯 ASGI 里无法直接拿到响应对象
        # 如果要修改响应，需要包装 send 函数（较复杂）

# 注册中间件：add_middleware 会自动实例化并包裹
app.add_middleware(SimpleASGIMiddleware)

@app.get("/")
def root():
    return {"message": "Hello"}

# 访问 / 时控制台输出：
# [ASGI] GET /
\`\`\`

纯 ASGI 中间件的难点在于"修改响应"——你需要包装 \`send\` 函数，拦截每一次 \`send\` 调用来修改响应头或响应体。这很繁琐，所以 \`BaseHTTPMiddleware\` 应运而生。

### Demo 2: 纯 ASGI 中间件修改响应头

\`\`\`python
from fastapi import FastAPI
from starlette.types import ASGIApp, Receive, Scope, Send

app = FastAPI()

class AddHeaderASGIMiddleware:
    """用纯 ASGI 给响应加自定义头"""
    def __init__(self, app: ASGIApp, header_name: str, header_value: str):
        self.app = app
        self.header_name = header_name
        self.header_value = header_value

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # 包装 send 函数：拦截响应头消息，注入自定义头
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # http.response.start 包含状态码和响应头
                headers = message.get("headers", [])
                # 添加自定义头（headers 是 list of [bytes, bytes]）
                headers.append([self.header_name.encode(), self.header_value.encode()])
                message["headers"] = headers
            await send(message)

        # 用 send_wrapper 替代原始 send
        await self.app(scope, receive, send_wrapper)

app.add_middleware(AddHeaderASGIMiddleware, header_name="X-Custom", header_value="from-ASGI")

@app.get("/")
def root():
    return {"ok": True}
# 响应头会有 X-Custom: from-ASGI
\`\`\`

可以看到，纯 ASGI 修改响应头需要手动解析 \`message["type"]\`、操作 \`bytes\` 格式的 headers——容易出错。\`BaseHTTPMiddleware\` 把这些都封装好了。

## 三、BaseHTTPMiddleware 类写法

\`BaseHTTPMiddleware\` 是 Starlette 提供的基类，它把 ASGI 细节封装起来，你只需要重写 \`dispatch\` 方法，操作高层 \`Request\` 和 \`Response\` 对象。

### Demo 3: BaseHTTPMiddleware 基础

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class AddHeaderMiddleware(BaseHTTPMiddleware):
    """
    继承 BaseHTTPMiddleware，重写 dispatch
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # 请求前处理
        print(f"[BaseHTTP] {request.method} {request.url.path}")

        # 调用下一层，拿到 Response 对象
        response = await call_next(request)

        # 响应后处理：直接改 response.headers，比纯 ASGI 简单太多
        response.headers["X-Custom"] = "from-BaseHTTPMiddleware"

        return response

app.add_middleware(AddHeaderMiddleware)

@app.get("/")
def root():
    return {"ok": True}
# 响应头有 X-Custom: from-BaseHTTPMiddleware
\`\`\`

对比纯 ASGI，\`BaseHTTPMiddleware\` 的优势：
- \`request\` 是高层 \`Request\` 对象，有 \`.method\`、\`.url\`、\`.headers\` 等属性。
- \`call_next(request)\` 直接返回 \`Response\` 对象，可以直接改 \`.headers\`、\`.status_code\`。
- 不需要处理 \`bytes\`、\`message["type"]\` 这些底层细节。

## 四、中间件执行顺序详解

### Demo 4: 验证中间件执行顺序

\`\`\`python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class MW1(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print("[MW1] before")
        response = await call_next(request)
        print("[MW1] after")
        return response

class MW2(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print("[MW2] before")
        response = await call_next(request)
        print("[MW2] after")
        return response

class MW3(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print("[MW3] before")
        response = await call_next(request)
        print("[MW3] after")
        return response

# 注册顺序：MW1 -> MW2 -> MW3
app.add_middleware(MW1)
app.add_middleware(MW2)
app.add_middleware(MW3)

@app.get("/")
def root():
    print("[route]")
    return {"ok": True}

# 访问 / 时输出：
# [MW3] before
# [MW2] before
# [MW1] before
# [route]
# [MW1] after
# [MW2] after
# [MW3] after

# 解释：
# add_middleware 是"后注册在外层"
# MW3 最后注册 -> 最外层 -> 请求最先到，响应最后出
# MW1 最先注册 -> 最内层 -> 请求最后到，响应最先出
#
# 如果用列表理解（外->内）：
# MW3(请求) -> MW2(请求) -> MW1(请求) -> 路由
# 路由 -> MW1(响应) -> MW2(响应) -> MW3(响应)
\`\`\`

**记忆口诀**：\`add_middleware\` 像往栈里压入——后压入的在栈顶（外层），先执行请求前处理。

## 五、限流中间件实战

限流（Rate Limiting）是防止 API 被滥用的关键手段。下面实现一个基于"内存计数器"的简单限流中间件。

### Demo 5: 滑动窗口限流中间件

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time

app = FastAPI()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    简单限流中间件：每个 IP 在时间窗口内最多 N 次请求
    """
    def __init__(self, app, max_requests: int = 10, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # requests: {ip: [timestamp1, timestamp2, ...]}
        self.requests = defaultdict(list)

    async def dispatch(self, request, call_next):
        # 获取客户端 IP
        client_ip = request.client.host if request.client else "unknown"

        # 清理过期的请求记录
        now = time.time()
        self.requests[client_ip] = [
            ts for ts in self.requests[client_ip]
            if now - ts < self.window_seconds
        ]

        # 检查是否超限
        if len(self.requests[client_ip]) >= self.max_requests:
            # 返回 429 Too Many Requests
            return JSONResponse(
                status_code=429,
                content={"detail": "请求过于频繁，请稍后再试"},
                headers={
                    "Retry-After": str(self.window_seconds),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # 记录本次请求
        self.requests[client_ip].append(now)

        # 计算剩余次数
        remaining = self.max_requests - len(self.requests[client_ip])

        # 调用下一层
        response = await call_next(request)

        # 在响应头加限流信息
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response

app.add_middleware(RateLimitMiddleware, max_requests=5, window_seconds=10)

@app.get("/api")
def api():
    return {"data": "success"}

# 测试：连续请求 6 次
# 前 5 次：200 OK，响应头有 X-RateLimit-Remaining: 4,3,2,1,0
# 第 6 次：429 {"detail":"请求过于频繁，请稍后再试"}
# 等 10 秒后重置，又可以请求
\`\`\`

注意：这个限流是"单进程内存版"，多 worker 部署时每个 worker 独立计数。生产环境应该用 Redis 做分布式限流。

## 六、请求日志中间件实战

### Demo 6: 结构化请求日志中间件

\`\`\`python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
import logging

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

class RequestLogMiddleware(BaseHTTPMiddleware):
    """
    结构化请求日志中间件
    记录：方法、路径、状态码、耗时、客户端 IP、UA
    """
    async def dispatch(self, request, call_next):
        # 请求前：收集请求信息
        start_time = time.time()
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "-"
        user_agent = request.headers.get("User-Agent", "-")

        try:
            # 调用下一层
            response = await call_next(request)
            status_code = response.status_code

            # 记录日志
            duration_ms = (time.time() - start_time) * 1000
            log_data = {
                "method": method,
                "path": path,
                "status": status_code,
                "duration_ms": round(duration_ms, 2),
                "ip": client_ip,
                "ua": user_agent[:50],  # 截断过长的 UA
            }
            # 用 INFO 记录成功请求，WARNING 记录 4xx，ERROR 记录 5xx
            if status_code >= 500:
                logger.error(json.dumps(log_data))
            elif status_code >= 400:
                logger.warning(json.dumps(log_data))
            else:
                logger.info(json.dumps(log_data))

            return response

        except Exception as e:
            # 中间件本身出错也要记录
            duration_ms = (time.time() - start_time) * 1000
            logger.error(json.dumps({
                "method": method,
                "path": path,
                "status": 500,
                "duration_ms": round(duration_ms, 2),
                "ip": client_ip,
                "error": str(e),
            }))
            raise

app.add_middleware(RequestLogMiddleware)

@app.get("/ok")
def ok():
    return {"ok": True}

@app.get("/error")
def error():
    from fastapi import HTTPException
    raise HTTPException(500, "internal error")

@app.get("/notfound")
def notfound():
    from fastapi import HTTPException
    raise HTTPException(404, "not found")

# 日志输出示例：
# {"method":"GET","path":"/ok","status":200,"duration_ms":1.23,"ip":"127.0.0.1","ua":"curl/8.0"}
# {"method":"GET","path":"/notfound","status":404,"duration_ms":0.89,"ip":"127.0.0.1","ua":"curl/8.0"}
# {"method":"GET","path":"/error","status":500,"duration_ms":1.45,"ip":"127.0.0.1","ua":"curl/8.0"}
\`\`\`

结构化日志（JSON 格式）的好处：方便 ELK（Elasticsearch + Logstash + Kibana）等日志系统收集和分析。每条日志是一个 JSON 对象，可以直接被解析和索引。

## 七、请求耗时统计中间件

### Demo 7: 慢请求检测中间件

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

app = FastAPI()

class SlowRequestMiddleware(BaseHTTPMiddleware):
    """
    慢请求检测中间件
    超过阈值的请求会被记录，便于优化
    """
    def __init__(self, app, threshold_ms: float = 500):
        super().__init__(app)
        self.threshold_ms = threshold_ms

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start) * 1000

        # 慢请求加标记头
        if duration_ms > self.threshold_ms:
            response.headers["X-Slow-Request"] = f"{duration_ms:.0f}ms"
            print(f"[SLOW] {request.method} {request.url.path} 耗时 {duration_ms:.0f}ms (阈值 {self.threshold_ms}ms)")

        # 所有响应都加耗时头
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        return response

app.add_middleware(SlowRequestMiddleware, threshold_ms=300)

@app.get("/fast")
def fast():
    return {"speed": "fast"}

@app.get("/slow")
async def slow():
    import asyncio
    await asyncio.sleep(0.5)  # 500ms，超过阈值
    return {"speed": "slow"}

@app.get("/very-slow")
async def very_slow():
    import asyncio
    await asyncio.sleep(1)  # 1000ms，远超阈值
    return {"speed": "very slow"}

# 测试：
# curl http://127.0.0.1:8000/fast       -> 头 X-Response-Time: 1.23ms
# curl http://127.0.0.1:8000/slow       -> 头 X-Response-Time: 502.xxms, X-Slow-Request: 502ms
# curl http://127.0.0.1:8000/very-slow  -> 头 X-Response-Time: 1003.xxms, X-Slow-Request: 1003ms
# 控制台会打印 SLOW 警告
\`\`\`

## 八、BaseHTTPMiddleware 的注意事项

使用 \`BaseHTTPMiddleware\` 时有几个需要注意的点：

1. **响应体只能读一次**：\`call_next\` 返回的 \`Response\`，其 body 是流式的，读一次就空了。如果要修改 body，需要用 \`Response\` 的 \`body\` 属性重新设置。

2. **不要在中间件里读请求体**：\`request.json()\` / \`request.body()\` 会消费请求流，路由函数就读不到了。如果必须读，需要自己缓存。

3. **异常处理**：中间件里的 \`try/except\` 能捕获路由抛出的异常，但 FastAPI 的异常处理器会在中间件之前处理 \`HTTPException\`。

### Demo 8: 在中间件里修改响应体

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import json

app = FastAPI()

class WrapResponseMiddleware(BaseHTTPMiddleware):
    """把所有响应包装成统一格式 {"code": 200, "data": ...}"""
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # 只包装 JSON 响应
        if "application/json" in response.headers.get("content-type", ""):
            # 读取响应体（注意：这会让 body 流被消费）
            body_bytes = b""
            async for chunk in response.body_iterator:
                body_bytes += chunk

            # 解析原始 JSON
            original = json.loads(body_bytes)

            # 包装成统一格式
            wrapped = {
                "code": response.status_code,
                "data": original,
                "path": request.url.path,
            }

            # 创建新响应
            new_response = JSONResponse(content=wrapped, status_code=response.status_code)
            # 保留原响应的部分头
            for key, value in response.headers.items():
                if key.lower() not in ("content-length", "content-type", "transfer-encoding"):
                    new_response.headers[key] = value
            return new_response

        return response

app.add_middleware(WrapResponseMiddleware)

@app.get("/users")
def users():
    return [{"id": 1, "name": "Alice"}]

# 不加中间件的响应：[{"id":1,"name":"Alice"}]
# 加中间件的响应：{"code":200,"data":[{"id":1,"name":"Alice"}],"path":"/users"}
\`\`\`

注意：修改响应体是一个相对"重"的操作，因为要完整读取、解析、重新序列化。对性能敏感的接口慎用。

## 九、本章小结

- **两种写法**：纯 ASGI 中间件（高性能、底层）和 \`BaseHTTPMiddleware\`（易用、高层）。大多数场景用后者。
- **纯 ASGI**：实现 \`__call__(scope, receive, send)\`，修改响应需要包装 \`send\` 函数。
- **\`BaseHTTPMiddleware\`**：重写 \`async def dispatch(request, call_next)\`，直接操作 \`Request\`/\`Response\` 对象。
- **执行顺序**：\`add_middleware\` 后注册的在外层（先处理请求前，后处理响应后）。
- **限流中间件**：基于 IP + 时间窗口的计数器，超限返回 429。
- **日志中间件**：记录方法/路径/状态码/耗时/IP/UA，结构化 JSON 便于分析。
- **耗时统计**：计算请求耗时，超阈值标记慢请求。
- **注意事项**：响应体只能读一次；不要在中间件读请求体；修改 body 需重建响应。

下一章我们学习 FastAPI 的异常处理体系——如何自定义异常、注册处理器、统一错误格式。
`
  },

  {
    id: "fp-exception-handling",
    group: "中间件与异常",
    icon: "🚨",
    title: "异常处理体系",
    content: `# 异常处理体系

在任何 Web 应用中，异常处理都是不可忽视的环节。一个没有良好异常处理的应用，一旦出错就会返回难看的 500 错误页，甚至把内部堆栈泄露给用户——这既影响体验，又存在安全隐患。FastAPI 提供了一套完整的异常处理体系：从内置的 \`HTTPException\`，到自定义异常类，到全局异常处理器，让你能对每一种错误做出优雅的响应。本章会讲透这套体系，并教你建立统一的错误响应格式。

## 一、HTTPException 基本用法

\`HTTPException\` 是 FastAPI 内置的异常类，用来在路由中主动抛出 HTTP 错误。它是你日常开发中最常用的异常。

### Demo 1: HTTPException 基础

\`\`\`python
from fastapi import FastAPI, HTTPException

app = FastAPI()

# 模拟用户数据库
users_db = {1: {"id": 1, "name": "Alice"}, 2: {"id": 2, "name": "Bob"}}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    user = users_db.get(user_id)
    if not user:
        # 抛出 404 异常
        # status_code: HTTP 状态码
        # detail: 错误详情，会出现在响应 JSON 的 detail 字段
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

# 测试：
# curl http://127.0.0.1:8000/users/1
# -> 200 {"id":1,"name":"Alice"}
#
# curl http://127.0.0.1:8000/users/999
# -> 404 {"detail":"用户不存在"}
\`\`\`

\`HTTPException\` 被抛出后，FastAPI 会自动捕获它，并用 \`status_code\` 和 \`detail\` 生成一个 JSON 响应。响应格式固定为 \`{"detail": "..."}\`。

### Demo 2: HTTPException 带自定义头

\`\`\`python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/download/{file_id}")
def download(file_id: str):
    if file_id != "valid-file":
        # headers 参数可以添加自定义响应头
        raise HTTPException(
            status_code=404,
            detail="文件不存在",
            headers={"X-Error-Code": "FILE_NOT_FOUND"},
        )
    return {"file": file_id, "content": "..."}

# 测试：
# curl -i http://127.0.0.1:8000/download/invalid
# HTTP/1.1 404 Not Found
# content-type: application/json
# x-error-code: FILE_NOT_FOUND
#
# {"detail":"文件不存在"}
\`\`\`

\`headers\` 参数常用于添加错误码、重试提示等信息，方便客户端程序化处理错误。

## 二、自定义异常类

除了 \`HTTPException\`，你还可以定义自己的异常类。配合异常处理器（下一节讲），自定义异常能实现更灵活的错误处理。

### Demo 3: 自定义业务异常

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 自定义异常类：继承 Exception
class BusinessError(Exception):
    """业务逻辑错误"""
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code          # 业务错误码，如 "USER_NOT_FOUND"
        self.message = message    # 错误消息
        self.status_code = status_code

class RateLimitExceeded(Exception):
    """限流异常"""
    def __init__(self, retry_after: int):
        self.retry_after = retry_after

# 注册异常处理器：把自定义异常转成 HTTP 响应
@app.exception_handler(BusinessError)
async def business_error_handler(request: Request, exc: BusinessError):
    """处理 BusinessError，返回统一格式"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "code": exc.code,
            "message": exc.message,
            "path": str(request.url),
        },
    )

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """处理限流异常，加 Retry-After 头"""
    return JSONResponse(
        status_code=429,
        content={"error": True, "code": "RATE_LIMIT", "message": "请求过于频繁"},
        headers={"Retry-After": str(exc.retry_after)},
    )

# 在路由里抛出自定义异常
@app.get("/orders/{order_id}")
def get_order(order_id: str):
    if not order_id.startswith("ORD"):
        # 抛业务异常，会被 business_error_handler 处理
        raise BusinessError(code="INVALID_ORDER_ID", message="订单号必须以 ORD 开头")
    return {"order_id": order_id}

@app.get("/api/data")
def get_data():
    # 模拟触发限流
    raise RateLimitExceeded(retry_after=60)

# 测试：
# curl http://127.0.0.1:8000/orders/123
# -> 400 {"error":true,"code":"INVALID_ORDER_ID","message":"订单号必须以 ORD 开头","path":"http://127.0.0.1:8000/orders/123"}
#
# curl http://127.0.0.1:8000/api/data
# -> 429 {"error":true,"code":"RATE_LIMIT","message":"请求过于频繁"}
#    响应头有 Retry-After: 60
\`\`\`

自定义异常的优势：
- **语义清晰**：\`BusinessError\` 比 \`HTTPException(400)\` 更能表达"业务逻辑错误"。
- **统一格式**：每个异常类有自己的处理器，保证错误响应格式一致。
- **可扩展**：异常类可以携带任意字段（如 \`code\`、\`retry_after\`），处理器负责转成响应。

## 三、@app.exception_handler() 注册处理器

\`@app.exception_handler(SomeException)\` 用来注册异常处理器。它装饰一个函数，该函数接收 \`request\` 和 \`exc\` 两个参数，返回一个 \`Response\`。

### Demo 4: 异常处理器的优先级

\`\`\`python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

# 处理 HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    print(f"[handler] HTTPException: {exc.status_code}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "code": f"HTTP_{exc.status_code}", "message": exc.detail},
    )

# 处理自定义异常
class NotFoundError(Exception):
    pass

@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    print(f"[handler] NotFoundError")
    return JSONResponse(
        status_code=404,
        content={"error": True, "code": "NOT_FOUND", "message": str(exc)},
    )

# 处理所有其他异常（兜底）
@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    print(f"[handler] 兜底异常: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": True, "code": "INTERNAL_ERROR", "message": "服务器内部错误"},
    )

@app.get("/http-error")
def http_error():
    raise HTTPException(status_code=403, detail="forbidden")

@app.get("/not-found")
def not_found():
    raise NotFoundError("资源不存在")

@app.get("/crash")
def crash():
    # 未捕获的异常，会被 global_handler 兜住
    x = 1 / 0
    return {"x": x}

# 测试：
# curl http://127.0.0.1:8000/http-error
# -> 403 {"error":true,"code":"HTTP_403","message":"forbidden"}
#
# curl http://127.0.0.1:8000/not-found
# -> 404 {"error":true,"code":"NOT_FOUND","message":"资源不存在"}
#
# curl http://127.0.0.1:8000/crash
# -> 500 {"error":true,"code":"INTERNAL_ERROR","message":"服务器内部错误"}
\`\`\`

异常处理器的匹配规则：**FastAPI 会找最具体的异常类型**。\`NotFoundError\` 匹配 \`NotFoundError\` 处理器，\`ZeroDivisionError\` 匹配 \`Exception\` 兜底处理器，\`HTTPException\` 匹配 \`HTTPException\` 处理器。

## 四、RequestValidationError 处理

当请求参数校验失败（如类型错误、必填缺失），FastAPI 会抛出 \`RequestValidationError\`。默认的 422 响应格式比较冗长，你可以自定义它。

### Demo 5: 自定义校验错误响应

\`\`\`python
from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

app = FastAPI()

# 默认的 422 响应格式（FastAPI 内置）：
# {
#   "detail": [
#     {
#       "type": "int_parsing",
#       "loc": ["query", "page"],
#       "msg": "Input should be a valid integer",
#       "input": "abc"
#     }
#   ]
# }

# 自定义校验错误处理器：简化格式
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """把 422 错误简化成更友好的格式"""
    errors = []
    for err in exc.errors():
        # err 格式: {"type": "...", "loc": ["query","page"], "msg": "...", "input": ...}
        location = ".".join(str(loc) for loc in err["loc"])  # 如 "query.page"
        errors.append({
            "field": location,
            "message": err["msg"],
            "received": err.get("input"),
        })

    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "code": "VALIDATION_ERROR",
            "message": "请求参数校验失败",
            "errors": errors,
        },
    )

# 测试路由
class UserCreate(BaseModel):
    name: str
    age: int

@app.post("/users")
def create_user(user: UserCreate):
    return user

@app.get("/search")
def search(q: str = Query(..., min_length=2)):
    return {"q": q}

# 测试：
# curl -X POST http://127.0.0.1:8000/users -H "Content-Type: application/json" -d '{"name":"Alice","age":"abc"}'
# -> 422
# {
#   "error": true,
#   "code": "VALIDATION_ERROR",
#   "message": "请求参数校验失败",
#   "errors": [
#     {"field":"body.age","message":"Input should be a valid integer","received":"abc"}
#   ]
# }
#
# curl http://127.0.0.1:8000/search?q=a
# -> 422
# {
#   "error": true,
#   "code": "VALIDATION_ERROR",
#   "message": "请求参数校验失败",
#   "errors": [
#     {"field":"query.q","message":"String should have at least 2 characters","received":"a"}
#   ]
# }
\`\`\`

自定义校验错误响应的价值：前端可以根据 \`field\` 精确定位哪个参数错了，在表单对应位置显示错误——比默认的 \`loc: ["query", "q"]\` 更易用。

## 五、全局兜底异常处理器

线上环境最怕的就是"未捕获异常"导致 500 + 堆栈泄露。全局兜底处理器能确保所有异常都被妥善处理，绝不把堆栈暴露给客户端。

### Demo 6: 全局兜底处理器（含日志记录）

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
import traceback
import time

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger("errors")

# 全局兜底处理器：捕获所有未被其他处理器匹配的异常
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """兜底处理所有异常"""
    # 记录完整堆栈到日志（服务端可见）
    error_id = str(int(time.time() * 1000))  # 用时间戳当错误 ID
    logger.error(
        f"[{error_id}] Unhandled exception: {type(exc).__name__}: {exc}\\n"
        f"Path: {request.method} {request.url}\\n"
        f"Traceback:\\n{traceback.format_exc()}"
    )

    # 返回给客户端的错误响应（不含堆栈！）
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "code": "INTERNAL_ERROR",
            "message": "服务器内部错误，请联系管理员",
            "error_id": error_id,  # 客户端报错时提供此 ID，便于排查
        },
    )

@app.get("/divide")
def divide(a: int, b: int):
    return {"result": a / b}  # b=0 时会抛 ZeroDivisionError

@app.get("/db")
def db_query():
    # 模拟数据库连接失败
    raise ConnectionError("数据库连接超时")

# 测试：
# curl "http://127.0.0.1:8000/divide?a=1&b=0"
# -> 500
# {
#   "error": true,
#   "code": "INTERNAL_ERROR",
#   "message": "服务器内部错误，请联系管理员",
#   "error_id": "1783912345678"
# }
#
# 服务端日志（客户端看不到）：
# [1783912345678] Unhandled exception: ZeroDivisionError: division by zero
# Path: GET http://127.0.0.1:8000/divide?a=1&b=0
# Traceback:
#   File "...", line XX, in divide
#     return {"result": a / b}
# ZeroDivisionError: division by zero
\`\`\`

关键设计点：
- **\`error_id\`**：给每个错误分配唯一 ID，客户端报错时提供 ID，运维通过 ID 查日志——避免"我这边报错了，但说不清是什么错"的窘境。
- **堆栈只记日志，不返回客户端**：堆栈包含文件路径、代码行号等敏感信息，泄露给客户端是安全隐患。
- **\`ConnectionError\` 也被兜住**：因为 \`Exception\` 是所有异常的基类，任何未被专门处理的异常都会落到这里。

## 六、统一错误响应格式

一个成熟的项目应该有统一的错误响应格式，让前端能一致地处理错误。下面是一个完整的统一错误处理方案。

### Demo 7: 完整的统一错误响应体系

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import Any, Optional
import logging

app = FastAPI()
logger = logging.getLogger("app")

# 统一错误响应模型
class ErrorResponse(BaseModel):
    """所有错误的统一响应格式"""
    error: bool = True
    code: str                    # 错误码，如 "USER_NOT_FOUND"
    message: str                 # 人类可读的消息
    details: Optional[Any] = None  # 额外详情（如字段级校验错误）
    path: Optional[str] = None   # 请求路径

# 业务异常基类
class AppException(Exception):
    """所有业务异常的基类"""
    def __init__(self, code: str, message: str, status_code: int = 400, details=None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

# 具体业务异常
class UserNotFoundError(AppException):
    def __init__(self, user_id: int):
        super().__init__(
            code="USER_NOT_FOUND",
            message=f"用户 {user_id} 不存在",
            status_code=404,
        )

class PermissionDeniedError(AppException):
    def __init__(self, action: str):
        super().__init__(
            code="PERMISSION_DENIED",
            message=f"无权执行操作: {action}",
            status_code=403,
        )

class InvalidInputError(AppException):
    def __init__(self, field: str, reason: str):
        super().__init__(
            code="INVALID_INPUT",
            message="输入参数有误",
            status_code=400,
            details=[{"field": field, "reason": reason}],
        )

# 注册异常处理器

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """处理所有业务异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            code=exc.code,
            message=exc.message,
            details=exc.details,
            path=str(request.url.path),
        ).model_dump(),
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """把 HTTPException 也转成统一格式"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            code=f"HTTP_{exc.status_code}",
            message=str(exc.detail),
            path=str(request.url.path),
        ).model_dump(),
    )

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """校验错误转统一格式"""
    errors = []
    for err in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
        })
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            code="VALIDATION_ERROR",
            message="请求参数校验失败",
            details=errors,
            path=str(request.url.path),
        ).model_dump(),
    )

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    """兜底处理器"""
    logger.error(f"Unhandled: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code="INTERNAL_ERROR",
            message="服务器内部错误",
            path=str(request.url.path),
        ).model_dump(),
    )

# 路由
@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id > 100:
        raise UserNotFoundError(user_id)
    return {"id": user_id, "name": "Alice"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    raise PermissionDeniedError("delete user")

@app.get("/check")
def check(age: int):
    if age < 0:
        raise InvalidInputError("age", "年龄不能为负数")
    return {"age": age}

# 所有错误响应格式统一：
# {
#   "error": true,
#   "code": "USER_NOT_FOUND",
#   "message": "用户 999 不存在",
#   "details": null,
#   "path": "/users/999"
# }
\`\`\`

这个体系的精髓：
1. **一个基类 \`AppException\`**：所有业务异常继承它，保证有统一的 \`code\`/\`message\`/\`status_code\` 字段。
2. **一个响应模型 \`ErrorResponse\`**：所有错误响应都用这个模型，格式绝对一致。
3. **四个处理器**：分别处理业务异常、HTTP 异常、校验异常、兜底异常。
4. **前端只需一套逻辑**：所有错误都是 \`{error, code, message, details}\`，前端根据 \`code\` 决定如何提示用户。

## 七、异常处理最佳实践

### Demo 8: 最佳实践对比

\`\`\`python
# ============ 错误做法 ============

@app.get("/bad/{user_id}")
def bad_get_user(user_id: int):
    try:
        # 把所有异常都 catch 成 500
        user = db.get(user_id)
        return user
    except Exception:
        # 坏：吞掉了异常类型信息，前端无法区分错误
        raise HTTPException(status_code=500, detail="出错了")

@app.get("/bad2/{user_id}")
def bad2_get_user(user_id: int):
    user = db.get(user_id)
    if not user:
        # 坏：用 200 返回错误信息，违反 HTTP 语义
        return {"error": True, "message": "用户不存在"}
    return user

# ============ 正确做法 ============

@app.get("/good/{user_id}")
def good_get_user(user_id: int):
    user = db.get(user_id)
    if not user:
        # 好：用正确的状态码 + 业务异常
        raise UserNotFoundError(user_id)  # 404
    return user

@app.get("/good2/{user_id}")
def good2_get_user(user_id: int):
    try:
        user = db.get(user_id)
    except ConnectionError:
        # 好：数据库故障应该返回 503，不是 500
        raise HTTPException(status_code=503, detail="服务暂时不可用")
    if not user:
        raise UserNotFoundError(user_id)
    return user
\`\`\`

### 最佳实践总结

1. **不要用 200 返回错误**：HTTP 状态码就是用来表示成功/失败的，200 表示成功，4xx/5xx 表示失败。用 200 + \`{error: true}\` 是反模式，破坏了 HTTP 语义。
2. **用正确的状态码**：404 表示不存在，403 表示无权限，400 表示参数错，503 表示服务不可用。不要所有错误都 500。
3. **不要吞异常**：\`except Exception: pass\` 是大忌——错误被吞掉，问题永远不被发现。
4. **不要泄露堆栈**：堆栈给开发者看，不给用户看。用全局处理器兜底，返回友好消息。
5. **统一错误格式**：所有错误响应遵循同一格式，前端处理简单。
6. **用业务异常类**：\`UserNotFoundError\` 比 \`HTTPException(404)\` 更有语义，代码更可读。
7. **记录错误 ID**：给每个 500 错误分配 ID，方便用户报错时定位日志。

## 八、异常处理与中间件的关系

异常处理器和中间件都能"拦截错误"，但它们的工作层次不同：

\`\`\`text
请求 -> 中间件(外层) -> 中间件(内层) -> 路由函数
                                           |
                                      抛出异常
                                           |
响应 <- 中间件(内层) <- 异常处理器 <- 中间件(外层)
\`\`\`

- **异常处理器**在中间件链的"内部"——路由抛出的异常先被异常处理器捕获，转成响应后，再经过中间件返回。
- **中间件**在异常处理器的外层——如果中间件的 \`call_next\` 抛异常，异常处理器已经处理过了，中间件拿到的是正常的 \`Response\`。

但有一种情况例外：**中间件自己抛异常**（如 \`call_next\` 之前的代码出错），这时异常处理器可能捕获不到（取决于中间件实现）。

### Demo 9: 异常处理器 vs 中间件

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

@app.exception_handler(HTTPException)
async def http_handler(request: Request, exc: HTTPException):
    print("[异常处理器] 捕获 HTTPException")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

class MyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print("[中间件] 请求前")
        try:
            response = await call_next(request)
            print("[中间件] 响应后")
            return response
        except Exception as e:
            print(f"[中间件] 捕获到异常: {e}")
            return JSONResponse(status_code=500, content={"detail": "中间件兜底"})

app.add_middleware(MyMiddleware)

@app.get("/error")
def error_route():
    print("[路由] 抛出 HTTPException")
    raise HTTPException(status_code=404, detail="not found")

# 执行顺序：
# [中间件] 请求前
# [路由] 抛出 HTTPException
# [异常处理器] 捕获 HTTPException  <- 异常处理器先处理
# [中间件] 响应后                   <- 中间件拿到的是处理后的正常响应
#
# 响应：404 {"detail":"not found"}
\`\`\`

## 九、本章小结

- **\`HTTPException\`**：FastAPI 内置异常，\`raise HTTPException(status_code=404, detail="...")\` 主动抛出 HTTP 错误。
- **自定义异常类**：继承 \`Exception\`，携带业务语义（如 \`UserNotFoundError\`），比 \`HTTPException\` 更有表达力。
- **\`@app.exception_handler(SomeException)\`**：注册异常处理器，函数接收 \`request\` 和 \`exc\`，返回 \`Response\`。
- **\`RequestValidationError\`**：请求参数校验失败时抛出，可自定义 422 响应格式。
- **全局兜底处理器**：\`@app.exception_handler(Exception)\` 捕获所有未处理异常，返回友好消息，堆栈记日志。
- **统一错误格式**：用 \`ErrorResponse\` 模型保证所有错误响应一致（\`{error, code, message, details}\`）。
- **最佳实践**：不用 200 返回错误；用正确状态码；不吞异常；不泄露堆栈；用业务异常类。
- **异常处理器 vs 中间件**：异常处理器在中间件内部，路由异常先被处理器处理，中间件拿到的是正常响应。

至此，中间件与异常处理的三个核心主题——内置中间件、自定义中间件、异常处理体系——已经讲完。下一批章节我们将进入数据库集成，学习 FastAPI 如何搭配 SQLAlchemy、Tortoise ORM 等做数据持久化。
`
  }
];
