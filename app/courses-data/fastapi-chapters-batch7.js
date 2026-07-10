// =============================================================
// Batch 7：中间件（4 章）
// 25. mw-basics   中间件基础
// 26. mw-cors     CORS 跨域中间件
// 27. mw-gzip     GZip 与内置中间件
// 28. mw-custom   自定义中间件实战
// =============================================================

export const chapters = [
  {
    id: "mw-basics",
    group: "中间件",
    icon: "🔌",
    title: "中间件基础",
    content: `
## 一、中间件是什么

中间件(Middleware)是「在请求到达路由前、响应离开路由后」执行的钩子函数。它像一层包装,套在所有路由外面,可以:

- 在请求处理**前**做事(改请求、校验、记录)。
- 在请求处理**后**做事(改响应、记录、压缩)。
- 直接短路(不进路由,直接返回响应)。

类比:中间件是高速公路的收费站,每辆车(请求)都要过,可以查车(改请求)、收费(记日志)、拦车(拒绝)。

## 二、@app.middleware("http") 装饰器

最简单的中间件写法:

\`\`\`python
# 导入 time 模块
import time
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.middleware
@app.middleware("http")
# 定义异步函数 timing_middleware，参数: request: Request, call_next
async def timing_middleware(request: Request, call_next):
    # 1. 请求前:记录开始时间
    # 定义变量 start，赋值为 time.time()
    start = time.time()

    # 2. 调用下一个中间件/路由
    # 定义变量 response，赋值为 await call_next(request)
    response = await call_next(request)

    # 3. 响应后:计算耗时,加到响应头
    # 定义变量 duration，赋值为 time.time() - start
    duration = time.time() - start
    # response.headers["X-Process-Time"] = f"{duration:.
    response.headers["X-Process-Time"] = f"{duration:.4f}s"
    # 返回 response
    return response

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，参数: 
def root():
    # 返回 {"msg": "hello"}
    return {"msg": "hello"}
\`\`\`

三个关键点:
- \`request: Request\` —— 当前请求对象。
- \`call_next(request)\` —— 调用下一层(中间件或路由),返回 Response。
- \`await\` —— 必须异步,中间件是 async 的。

\`call_next\` 是「链条」的关键:它把请求传给下一层,等待响应回来。

## 三、中间件执行顺序:洋葱模型

多个中间件构成「洋葱」,请求从外往里穿,响应从里往外穿:

\`\`\`
请求 → [中间件A 外] → [中间件B 外] → 路由 → [中间件B 内] → [中间件A 内] → 响应
\`\`\`

注册顺序决定包裹层级:**后注册的在更外层**。

\`\`\`python
# 装饰器：app.middleware
@app.middleware("http")
# 定义异步函数 mw_a，参数: request, call_next
async def mw_a(request, call_next):
    # 调用 print()
    print("A before")
    # 定义变量 response，赋值为 await call_next(request)
    response = await call_next(request)
    # 调用 print()
    print("A after")
    # 返回 response
    return response

# 装饰器：app.middleware
@app.middleware("http")
# 定义异步函数 mw_b，参数: request, call_next
async def mw_b(request, call_next):
    # 调用 print()
    print("B before")
    # 定义变量 response，赋值为 await call_next(request)
    response = await call_next(request)
    # 调用 print()
    print("B after")
    # 返回 response
    return response
\`\`\`

执行顺序(注意 mw_b 后注册,所以更外层):
\`\`\`
B before
A before
(路由执行)
A after
B after
\`\`\`

**易错**:很多人以为「先注册先执行」是全程先执行,其实只是「请求前半段」先执行。「响应后半段」是反向的(后注册的先执行 after 部分)。

## 四、request.state 共享数据

中间件之间、中间件和路由之间,可以通过 \`request.state\` 共享数据:

\`\`\`python
# 装饰器：app.middleware
@app.middleware("http")
# 定义异步函数 add_request_id，参数: request: Request, call_next
async def add_request_id(request: Request, call_next):
    # 生成请求 ID,存到 state
    # request.state.request_id = str(uuid.uuid4())
    request.state.request_id = str(uuid.uuid4())
    # 定义变量 response，赋值为 await call_next(request)
    response = await call_next(request)
    # 响应头带上
    # response.headers["X-Request-ID"] = request.state.r
    response.headers["X-Request-ID"] = request.state.request_id
    # 返回 response
    return response

# 定义 GET 路由：访问 /me 时触发
@app.get("/me")
# 定义函数 me，参数: request: Request
def me(request: Request):
    # 路由里能读到中间件设的 state
    # 返回 {"request_id": request.state.request_id}
    return {"request_id": request.state.request_id}
\`\`\`

\`request.state\` 是一个对象,可以挂任意属性,请求结束自动销毁(请求级隔离)。

## 五、中间件 vs 依赖

中间件和依赖都能做请求前/后处理,区别:

| 维度 | 中间件 | 依赖 |
|---|---|---|
| 作用范围 | 全局(所有请求) | 接口/路由/app |
| 短路 | 直接 return Response | 抛 HTTPException |
| 后处理 | call_next 后 | yield 后 |
| 取参数 | request 对象 | 函数参数 |
| 性能 | 每个请求都过 | 按需 |
| 适用 | 全局横切(日志/限流/CORS) | 局部校验(认证/分页) |

经验:**全局的用中间件,局部的用依赖**。比如限流是全局的(所有接口都要限),用中间件;认证是局部的(有些接口不要登录),用依赖。

## 六、add_middleware() 添加

除了装饰器,还能用 \`add_middleware\`:

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义异步函数 timing_middleware，参数: request: Request, call_next
async def timing_middleware(request: Request, call_next):
    # 定义变量 start，赋值为 time.time()
    start = time.time()
    # 定义变量 response，赋值为 await call_next(request)
    response = await call_next(request)
    # response.headers["X-Process-Time"] = str(time.time
    response.headers["X-Process-Time"] = str(time.time() - start)
    # 返回 response
    return response

# 用 add_middleware 添加
# 添加中间件: timing_middleware
app.add_middleware(timing_middleware)
\`\`\`

内置中间件(如 CORS)都用这种方式添加。

## 七、自定义中间件类

更规范的写法是继承 \`BaseHTTPMiddleware\`:

\`\`\`python
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 定义类 TimingMiddleware，继承 BaseHTTPMiddleware
class TimingMiddleware(BaseHTTPMiddleware):
    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 定义变量 start，赋值为 time.time()
        start = time.time()
        # 定义变量 response，赋值为 await call_next(request)
        response = await call_next(request)
        # response.headers["X-Process-Time"] = f"{time.time(
        response.headers["X-Process-Time"] = f"{time.time() - start:.4f}"
        # 返回 response
        return response

# 添加中间件: TimingMiddleware
app.add_middleware(TimingMiddleware)
\`\`\`

类中间件的好处:
- 可以带 \`__init__\` 参数(配置)。
- 逻辑封装在类里,可复用、可测试。
- 更面向对象,适合复杂中间件。

## 八、完整示例:请求计时日志中间件

\`\`\`python
# 导入 time 模块
import time
# 导入 logging 模块
import logging
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志
# 调用 logging.basicConfig()
logging.basicConfig(level=logging.INFO)
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")

# 定义类 RequestLoggingMiddleware，继承 BaseHTTPMiddleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    # """记录每个请求的方法、路径、状态码、耗时"""
    """记录每个请求的方法、路径、状态码、耗时"""

    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 1. 请求前:记录开始
        # 定义变量 start，赋值为 time.time()
        start = time.time()
        # 定义变量 method，赋值为 request.method
        method = request.method
        # 定义变量 path，赋值为 request.url.path
        path = request.url.path

        # 2. 调用下游
        # 尝试执行，捕获异常
        try:
            # 定义变量 response，赋值为 await call_next(request)
            response = await call_next(request)
            # 定义变量 status，赋值为 response.status_code
            status = response.status_code
        # 捕获 Exception 异常，赋值为 e
        except Exception as e:
            # 下游抛异常,记录错误
            # 定义变量 duration，赋值为 time.time() - start
            duration = time.time() - start
            # 调用 logger.error()
            logger.error(f"{method} {path} 500 {duration:.4f}s ERROR: {e}")
            # raise
            raise

        # 3. 响应后:记录
        # 定义变量 duration，赋值为 time.time() - start
        duration = time.time() - start
        # 调用 logger.info()
        logger.info(f"{method} {path} {status} {duration:.4f}s")

        # 4. 响应头加耗时
        # response.headers["X-Process-Time"] = f"{duration:.
        response.headers["X-Process-Time"] = f"{duration:.4f}"
        # 返回 response
        return response

# 创建 FastAPI 应用实例
app = FastAPI()
# 添加中间件: RequestLoggingMiddleware
app.add_middleware(RequestLoggingMiddleware)

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，参数: 
def root():
    # 返回 {"msg": "hello"}
    return {"msg": "hello"}

# 定义 GET 路由：访问 /slow 时触发
@app.get("/slow")
# 定义函数 slow，参数: 
def slow():
    time.sleep(0.5)  # 模拟慢请求
    # 返回 {"msg": "slow"}
    return {"msg": "slow"}
\`\`\`

访问 \`/slow\`,日志输出类似:
\`\`\`
INFO:api:GET /slow 200 0.5012s
\`\`\`

## 九、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 忘了 await call_next | 协程没等待 | 必须 await |
| 同步函数当中间件 | 报错 | 必须 async def |
| 中间件里改 request.body | 流已消费 | 改用 Body 依赖或重写流 |
| 后注册的以为是内层 | 实际更外层 | 记住洋葱模型 |
| 中间件异常不处理 | 500 | try/except 记录后再 raise |
| 中间件做认证短路 | 不调 call_next | 直接 return JSONResponse |
| request.state 属性名冲突 | 覆盖 | 加前缀如 _my_app_ |

## 十、设计思想

中间件是「横切关注点」(cross-cutting concern)的实现手段。日志、限流、CORS、压缩这些和业务无关但又必须做的事,如果塞进每个路由,代码会膨胀且难维护。中间件把它们抽出来,集中处理,业务代码保持纯净。这是 AOP(面向切面编程)思想在 Web 框架的落地。
`,
  },
  {
    id: "mw-cors",
    group: "中间件",
    icon: "🌐",
    title: "CORS 跨域中间件",
    content: `
## 一、同源策略和跨域问题

浏览器的**同源策略**:JS 脚本只能访问「同源」的资源(协议+域名+端口三者相同)。

\`http://localhost:3000\` 的前端页面,请求 \`http://localhost:8000\` 的 API,就是**跨域**(端口不同)。浏览器会拦截这种请求(准确说是拦截响应)。

这是浏览器的安全机制,防止恶意网站偷偷访问其它网站的 API。但前后端分离开发时,跨域是常态,需要后端「授权」跨域。

## 二、CORS 原理

CORS(Cross-Origin Resource Sharing)是 HTTP 头机制,服务器通过响应头告诉浏览器「我允许哪些来源跨域访问」。

### 2.1 简单请求

对于「简单请求」(GET/HEAD/POST + 简单头),浏览器直接发请求,看响应头 \`Access-Control-Allow-Origin\` 决定是否给 JS:

\`\`\`
响应头:
Access-Control-Allow-Origin: http://localhost:3000
\`\`\`

匹配则放行,不匹配则报 CORS 错误,JS 拿不到响应。

### 2.2 预检请求(Preflight)

对于「非简单请求」(自定义 Header、PUT/DELETE、Content-Type: application/json),浏览器会**先发一个 OPTIONS 请求**询问:

\`\`\`
OPTIONS /api/users
Origin: http://localhost:3000
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization, Content-Type
\`\`\`

服务器响应:
\`\`\`
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
\`\`\`

浏览器看到允许,才发真正的 PUT 请求。这个 OPTIONS 就是「预检」。

**为什么要有预检?** 因为非简单请求可能有副作用(改数据),先问一下避免误操作。

## 三、为什么前端调用 API 会跨域

开发场景:
- 前端 dev server:\`http://localhost:3000\`
- 后端 API:\`http://localhost:8000\`

端口不同 → 跨域 → 浏览器拦截 → 报 CORS 错。

解决方法:
1. **后端配 CORS**(推荐)。
2. 前端 dev server 配代理(把 API 请求转给后端,浏览器看是同源)。
3. 生产环境用 Nginx 反代,前后端同源。

## 四、CORSMiddleware 配置

FastAPI/Starlette 内置 CORS 中间件:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=[
        "http://localhost:3000",   # 前端开发地址
        "https://myapp.com",       # 生产前端
    # ],
    ],
    allow_credentials=True,        # 允许带 Cookie
    allow_methods=["*"],           # 允许所有方法
    allow_headers=["*"],           # 允许所有头
# )
)
\`\`\`

参数说明:

| 参数 | 作用 | 推荐值 |
|---|---|---|
| allow_origins | 允许的来源列表 | 明确列出,不要用 ["*"] |
| allow_methods | 允许的方法 | ["*"] 或具体 |
| allow_headers | 允许的请求头 | ["*"] 或具体 |
| allow_credentials | 允许带 Cookie | 看需求 |
| expose_headers | 允许前端读的响应头 | 自定义头要列出 |
| max_age | 预检结果缓存秒数 | 600 |

## 五、通配符 vs 指定源

\`\`\`python
# ❌ 不安全:任何来源都能跨域
# 添加中间件: CORSMiddleware, allow_origins=["*"]
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# ✅ 明确指定来源
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=["http://localhost:3000", "https://myapp.com"],
# )
)
\`\`\`

\`["*"]\` 表示「任何网站都能跨域访问你的 API」。如果你的 API 是公开的(无认证),这没问题;但如果是带认证的(有 Cookie/token),\`["*"]\` 会和 \`allow_credentials=True\` 冲突(浏览器拒绝)。

## 六、Credentials 和通配符冲突

**重要规则**:\`allow_credentials=True\` 时,\`allow_origins\` **不能是 \`["*"]\`**。

为什么?因为带凭证(Cookie)的跨域如果允许任意来源,等于任何网站都能以用户身份访问你的 API(CSRF 危险)。浏览器强制要求此时必须明确指定来源。

\`\`\`python
# ❌ 浏览器拒绝:credentials 和 * 冲突
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=["*"],
    # 定义变量 allow_credentials，赋值为 True,
    allow_credentials=True,
# )
)

# ✅ 明确来源 + credentials
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=["http://localhost:3000"],
    # 定义变量 allow_credentials，赋值为 True,
    allow_credentials=True,
# )
)
\`\`\`

## 七、allow_credentials 的作用

带 Cookie 跨域时,必须开启:

\`\`\`python
# 前端
# fetch("http://api.example.com/me", {
fetch("http://api.example.com/me", {
    credentials: "include",  # 带 Cookie 跨域
# })
})

# 后端必须
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # 必须,否则浏览器不发送 Cookie
# )
)
\`\`\`

如果用 JWT(放 Authorization Header,不用 Cookie),可以不开 credentials。

## 八、expose_headers:让前端能读自定义响应头

默认前端 JS 只能读「安全」的响应头(Content-Type、Content-Length 等)。自定义头(如 \`X-Request-ID\`)需要 expose:

\`\`\`python
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=["http://localhost:3000"],
    # 定义列表 expose_headers
    expose_headers=["X-Request-ID", "X-Total-Count"],
# )
)
\`\`\`

之后前端 \`response.headers.get("X-Request-ID")\` 才能读到。

## 九、完整示例:配置 CORS 允许前端跨域

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# CORS 配置:集中在一处,便于管理
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 1. 允许的前端来源(开发 + 生产)
    # 定义列表 allow_origins
    allow_origins=[
        "http://localhost:3000",        # 本地开发
        "http://127.0.0.1:3000",        # 本地开发(IP)
        "https://app.mycompany.com",    # 生产
    # ],
    ],
    # 2. 允许带 Cookie
    # 定义变量 allow_credentials，赋值为 True,
    allow_credentials=True,
    # 3. 允许的方法(显式比 * 清晰)
    # 定义列表 allow_methods
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    # 4. 允许的头
    # 定义列表 allow_headers
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    # 5. 暴露给前端读的响应头
    # 定义列表 expose_headers
    expose_headers=["X-Request-ID", "X-Total-Count"],
    # 6. 预检结果缓存 10 分钟(减少 OPTIONS 请求)
    # 定义变量 max_age，赋值为 600,
    max_age=600,
# )
)

# 定义 GET 路由：访问 /api/users 时触发
@app.get("/api/users")
# 定义函数 users，参数: 
def users():
    # 返回 [{"id": 1, "name": "alice"}]
    return [{"id": 1, "name": "alice"}]

# 定义 GET 路由：访问 /api/me 时触发
@app.get("/api/me")
# 定义函数 me，参数: 
def me():
    # 返回 {"name": "alice"}
    return {"name": "alice"}
\`\`\`

## 十、调试 CORS 技巧

CORS 报错信息通常很模糊(浏览器只说「CORS policy」)。调试方法:

1. **看浏览器 Network**:找 OPTIONS 请求,看它的响应头有没有 \`Access-Control-Allow-Origin\`。
2. **看报错信息**:它会指出哪个头缺失(如「No 'Access-Control-Allow-Origin' header」)。
3. **检查 Origin**:请求头 \`Origin\` 是否在 \`allow_origins\` 列表里。
4. **检查 credentials**:是否带了 Cookie 但没开 \`allow_credentials\`。

## 十一、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| allow_origins=["*"] + credentials | 浏览器拒绝 | 明确来源 |
| 开发用通配符上线忘改 | 安全风险 | 生产明确来源 |
| 前端读不到自定义响应头 | 没 expose | 加 expose_headers |
| 以为 CORS 是前端配置 | 其实是后端 | 后端加 CORSMiddleware |
| 预检 OPTIONS 404 | 没处理 OPTIONS | CORSMiddleware 自动处理,别手动 |
| Nginx 和 FastAPI 都配 CORS | 头重复 | 只在一处配 |

## 十二、设计思想

CORS 是浏览器安全策略,服务器通过响应头「授权」跨域。理解它的本质:**不是 FastAPI 拦截,而是浏览器拦截**。CORS 是「声明式」的——你声明允许谁,浏览器执行拦截。这也是为什么通配符要谨慎:你在向所有网站开放访问权。
`,
  },
  {
    id: "mw-gzip",
    group: "中间件",
    icon: "🗜️",
    title: "GZip 与内置中间件",
    content: `
## 一、GZipMiddleware 响应压缩

GZip 把响应体压缩后传输,显著减少传输量。文本类响应(JSON/HTML)压缩率高,通常能压到原来的 10%-30%。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.gzip 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()
# minimum_size=1000:小于 1000 字节不压缩(压缩小文件反而开销大)
# 添加中间件: GZipMiddleware, minimum_size=1000
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 定义 GET 路由：访问 /big 时触发
@app.get("/big")
# 定义函数 big，参数: 
def big():
    # 大 JSON 响应会被自动 GZip
    # 返回 {"data": ["item"] * 1000}
    return {"data": ["item"] * 1000}
\`\`\`

工作原理:
1. 请求带 \`Accept-Encoding: gzip\` 头。
2. 中间件压缩响应体,设 \`Content-Encoding: gzip\`。
3. 浏览器自动解压。

\`minimum_size\` 参数:小于这个大小的响应不压缩(因为压缩头本身有开销,小文件压缩反而变大)。

## 二、TrustedHostMiddleware 防 Host 头攻击

Host 头攻击:攻击者伪造 Host 头(如 \`Host: evil.com\`),如果你的代码用 Host 生成 URL(如密码重置链接),会被诱导到恶意网站。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 starlette.middleware.trustedhost 导入 TrustedHostMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()
# app.add_middleware(
app.add_middleware(
    # TrustedHostMiddleware,
    TrustedHostMiddleware,
    # 定义列表 allowed_hosts
    allowed_hosts=["example.com", "www.example.com", ".example.com"],
# )
)
\`\`\`

- 只允许这些 Host,其他的返回 400。
- \`.example.com\` 表示允许子域名。
- 开发环境可以加 \`localhost\`、\`127.0.0.1\`。

## 三、SessionMiddleware 基于 Cookie 的 Session

用 itsdangerous 签名的 Cookie Session:

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.sessions 导入 SessionMiddleware
from starlette.middleware.sessions import SessionMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()
# secret_key 用来签名,泄漏则可伪造
# 添加中间件: SessionMiddleware, secret_key="your-very-secret-key"
app.add_middleware(SessionMiddleware, secret_key="your-very-secret-key")

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login，参数: request: Request
def login(request: Request):
    request.session["user_id"] = 42  # 存到 session
    # 返回 {"msg": "登录"}
    return {"msg": "登录"}

# 定义 GET 路由：访问 /me 时触发
@app.get("/me")
# 定义函数 me，参数: request: Request
def me(request: Request):
    uid = request.session.get("user_id")  # 读 session
    # 返回 {"user_id": uid}
    return {"user_id": uid}
\`\`\`

特点:
- 数据存在 Cookie(签名后),服务端无状态。
- 用户能解码看到内容(但改不了)。
- 受 4KB 限制,别存大数据。
- secret_key 泄漏则可伪造,务必保密。

## 四、HTTPSRedirectMiddleware 强制跳转 HTTPS

把所有 HTTP 请求重定向到 HTTPS:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 starlette.middleware.httpsredirect 导入 HTTPSRedirectMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()
# 添加中间件: HTTPSRedirectMiddleware
app.add_middleware(HTTPSRedirectMiddleware)
\`\`\`

生产环境(已部署 HTTPS)开这个,确保所有流量加密。但开发环境(localhost HTTP)不要开,否则一直重定向。

## 五、自定义 BaseHTTPMiddleware 类

更清晰的中间件写法:

\`\`\`python
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request

# 定义类 MyMiddleware，继承 BaseHTTPMiddleware
class MyMiddleware(BaseHTTPMiddleware):
    # 定义函数 __init__，参数: self, app, some_config: str
    def __init__(self, app, some_config: str):
        # 调用 super()
        super().__init__(app)
        self.config = some_config  # 接收配置

    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 用 self.config 访问配置
        # request.state.config = self.config
        request.state.config = self.config
        # 定义变量 response，赋值为 await call_next(request)
        response = await call_next(request)
        # response.headers["X-Config"] = self.config
        response.headers["X-Config"] = self.config
        # 返回 response
        return response

# 创建 FastAPI 应用实例
app = FastAPI()
# add_middleware 传额外参数给 __init__
# 添加中间件: MyMiddleware, some_config="my-value"
app.add_middleware(MyMiddleware, some_config="my-value")
\`\`\`

类中间件的好处:
- \`__init__\` 接收配置,可参数化。
- 状态封装在实例。
- 可继承复用。

## 六、完整示例:启用 GZip 压缩

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.gzip 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
# 从 starlette.middleware.trustedhost 导入 TrustedHostMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 1. GZip 压缩(放最外层,压缩最终响应)
# 添加中间件: GZipMiddleware, minimum_size=1000
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 2. CORS(在 GZip 内层)
# app.add_middleware(
app.add_middleware(
    # CORSMiddleware,
    CORSMiddleware,
    # 定义列表 allow_origins
    allow_origins=["http://localhost:3000"],
    # 定义列表 allow_methods
    allow_methods=["*"],
    # 定义列表 allow_headers
    allow_headers=["*"],
# )
)

# 3. TrustedHost(最内层,先校验 Host)
# app.add_middleware(
app.add_middleware(
    # TrustedHostMiddleware,
    TrustedHostMiddleware,
    # 定义列表 allowed_hosts
    allowed_hosts=["localhost", "127.0.0.1", "myapp.com"],
# )
)

# 定义 GET 路由：访问 /big-data 时触发
@app.get("/big-data")
# 定义函数 big_data，参数: 
def big_data():
    # 这个响应会被 GZip 压缩
    # 返回 {"items": [{"id": i, "name": f"item-{i}"} for i in range(100)]}
    return {"items": [{"id": i, "name": f"item-{i}"} for i in range(100)]}
\`\`\`

**中间件顺序**:\`add_middleware\` 后加的在更外层。GZip 应该在最外层(压缩最终响应),CORS 在中间,TrustedHost 在内层(先校验 Host)。

## 七、中间件顺序的重要性

\`\`\`python
# 顺序 A:GZip 在外,压缩加过 CORS 头的响应
# 添加中间件: GZipMiddleware
app.add_middleware(GZipMiddleware)
# 添加中间件: CORSMiddleware
app.add_middleware(CORSMiddleware)
# 执行:TrustedHost → CORS 加头 → GZip 压缩

# 顺序 B:CORS 在外,先加头再压缩(效果一样,但逻辑不同)
# 添加中间件: CORSMiddleware
app.add_middleware(CORSMiddleware)
# 添加中间件: GZipMiddleware
app.add_middleware(GZipMiddleware)
\`\`\`

一般原则:
- **响应修改类**(GZip)放外层,最后处理。
- **请求校验类**(TrustedHost)放内层,先执行。
- **CORS** 居中。

但实际多数情况顺序影响不大,主要注意 GZip 别把 CORS 头也压缩没了(其实不会,头不压缩)。

## 八、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| GZip 压缩小文件 | 压缩头开销大 | 设 minimum_size |
| HTTPSRedirect 在开发开 | localhost 一直重定向 | 仅生产开 |
| SessionMiddleware secret_key 用默认 | 不安全 | 用随机长字符串 |
| TrustedHost 漏了 localhost | 本地访问 400 | 加 localhost |
| 自定义中间件忘 super().__init__ | 报错 | 调用父类初始化 |
| 中间件顺序乱 | 行为异常 | GZip 在外,校验在内 |

## 九、设计思想

内置中间件覆盖了常见需求(压缩、Session、Host 校验、HTTPS 跳转),开箱即用。理解每个中间件的职责和顺序,合理组合,能解决大部分生产级需求。不要重复造轮子——先用内置的,不够再自定义。
`,
  },
  {
    id: "mw-custom",
    group: "中间件",
    icon: "🛠️",
    title: "自定义中间件实战",
    content: `
## 一、纯函数中间件(dispatch 函数)

最轻量的写法:

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.middleware
@app.middleware("http")
# 定义异步函数 simple_mw，参数: request: Request, call_next
async def simple_mw(request: Request, call_next):
    # 请求前
    # request.state.touched = True
    request.state.touched = True
    # 调用下游
    # 定义变量 response，赋值为 await call_next(request)
    response = await call_next(request)
    # 响应后
    # response.headers["X-Custom"] = "yes"
    response.headers["X-Custom"] = "yes"
    # 返回 response
    return response
\`\`\`

适合简单、一次性的中间件。

## 二、BaseHTTPMiddleware 类中间件

适合复杂、可配置、可复用的中间件:

\`\`\`python
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request

# 定义类 RateLimitMiddleware，继承 BaseHTTPMiddleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    # 定义函数 __init__，参数: self, app, rate: int = 100
    def __init__(self, app, rate: int = 100):
        # 调用 super()
        super().__init__(app)
        self.rate = rate  # 配置:每秒允许请求数

    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 在这里实现限流逻辑
        # 条件判断：如果 self.is_rate_limited(request)
        if self.is_rate_limited(request):
            # 从 fastapi.responses 导入 JSONResponse
            from fastapi.responses import JSONResponse
            # 返回 JSONResponse(
            return JSONResponse(
                # 定义变量 status_code，赋值为 429,
                status_code=429,
                # 定义字典 content
                content={"detail": "请求过于频繁"},
            # )
            )
        # 返回 await call_next(request)
        return await call_next(request)

    # 定义函数 is_rate_limited，返回: bool
    def is_rate_limited(self, request: Request) -> bool:
        # 简化实现,实际用 Redis
        # 返回 False
        return False

# 创建 FastAPI 应用实例
app = FastAPI()
# 添加中间件: RateLimitMiddleware, rate=100
app.add_middleware(RateLimitMiddleware, rate=100)
\`\`\`

## 三、中间件做 JWT 校验

把 JWT 校验放中间件,所有接口都生效:

\`\`\`python
# 导入 jwt 模块
import jwt
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 定义变量 SECRET，赋值为 "your-secret"
SECRET = "your-secret"

# 定义类 JWTAuthMiddleware，继承 BaseHTTPMiddleware
class JWTAuthMiddleware(BaseHTTPMiddleware):
    # 不需要认证的路径
    # 定义字典 EXEMPT_PATHS
    EXEMPT_PATHS = {"/login", "/docs", "/openapi.json", "/redoc"}

    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 1. 白名单直接放行
        # 条件判断：如果 request.url.path in self.EXEMPT_PATHS
        if request.url.path in self.EXEMPT_PATHS:
            # 返回 await call_next(request)
            return await call_next(request)

        # 2. 取 Authorization 头
        # 定义变量 auth，赋值为 request.headers.get("Authorization")
        auth = request.headers.get("Authorization")
        # 条件判断：如果 not auth or not auth.startswith("Bearer ")
        if not auth or not auth.startswith("Bearer "):
            # 返回 JSONResponse(status_code=401, content={"detail": "未提供 token"})
            return JSONResponse(status_code=401, content={"detail": "未提供 token"})

        # 定义变量 token，赋值为 auth[7:]
        token = auth[7:]
        # 尝试执行，捕获异常
        try:
            # 3. 校验 token
            # 定义变量 payload，赋值为 jwt.decode(token, SECRET, algorithms=["HS256"...
            payload = jwt.decode(token, SECRET, algorithms=["HS256"])
            request.state.user = payload  # 存到 state 给路由用
        # except jwt.ExpiredSignatureError:
        except jwt.ExpiredSignatureError:
            # 返回 JSONResponse(status_code=401, content={"detail": "token 过期"})
            return JSONResponse(status_code=401, content={"detail": "token 过期"})
        # except jwt.InvalidTokenError:
        except jwt.InvalidTokenError:
            # 返回 JSONResponse(status_code=401, content={"detail": "token 无效"})
            return JSONResponse(status_code=401, content={"detail": "token 无效"})

        # 4. 放行
        # 返回 await call_next(request)
        return await call_next(request)

# 创建 FastAPI 应用实例
app = FastAPI()
# 添加中间件: JWTAuthMiddleware
app.add_middleware(JWTAuthMiddleware)

# 定义 GET 路由：访问 /me 时触发
@app.get("/me")
# 定义函数 me，参数: request: Request
def me(request: Request):
    # 路由里能用中间件存的 user
    # 返回 request.state.user
    return request.state.user
\`\`\`

**权衡**:JWT 中间件是「一刀切」(所有接口都要 token)。如果有些接口不要认证(如登录),要用白名单。更灵活的做法是用依赖(可路由级控制),见依赖章节。

## 四、中间件做限流(令牌桶)

令牌桶算法:固定速率往桶里加令牌,请求消耗令牌,没令牌就拒绝。

\`\`\`python
# 导入 time 模块
import time
# 从 collections 导入 defaultdict
from collections import defaultdict
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 定义类 TokenBucket
class TokenBucket:
    # 定义函数 __init__，参数: self, capacity: int, refill_rate: float
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity        # 桶容量
        self.refill_rate = refill_rate  # 每秒补充令牌数
        self.tokens = capacity          # 当前令牌
        # self.last_refill = time.time()
        self.last_refill = time.time()

    # 定义函数 consume，返回: bool
    def consume(self, n: int = 1) -> bool:
        # 补充令牌
        # 定义变量 now，赋值为 time.time()
        now = time.time()
        # 定义变量 elapsed，赋值为 now - self.last_refill
        elapsed = now - self.last_refill
        # self.tokens = min(self.capacity, self.tokens + ela
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        # self.last_refill = now
        self.last_refill = now
        # 消耗
        # 条件判断：如果 self.tokens >= n
        if self.tokens >= n:
            # self.tokens -= n
            self.tokens -= n
            # 返回 True
            return True
        # 返回 False
        return False

# 定义类 RateLimitMiddleware，继承 BaseHTTPMiddleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    # 定义函数 __init__，参数: self, app, capacity: int = 100, refill_rate: float...
    def __init__(self, app, capacity: int = 100, refill_rate: float = 10):
        # 调用 super()
        super().__init__(app)
        # self.capacity = capacity
        self.capacity = capacity
        # self.refill_rate = refill_rate
        self.refill_rate = refill_rate
        # self.buckets = defaultdict(lambda: TokenBucket(cap
        self.buckets = defaultdict(lambda: TokenBucket(capacity, refill_rate))

    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 按 IP 限流(实际可用 user_id)
        # 定义变量 client_ip，赋值为 request.client.host
        client_ip = request.client.host
        # 定义变量 bucket，赋值为 self.buckets[client_ip]
        bucket = self.buckets[client_ip]
        # 条件判断：如果 not bucket.consume()
        if not bucket.consume():
            # 返回 JSONResponse(
            return JSONResponse(
                # 定义变量 status_code，赋值为 429,
                status_code=429,
                # 定义字典 content
                content={"detail": "请求过于频繁"},
                # 定义字典 headers
                headers={"Retry-After": "1"},
            # )
            )
        # 返回 await call_next(request)
        return await call_next(request)

# 创建 FastAPI 应用实例
app = FastAPI()
# 每个 IP 桶容量 100,每秒补充 10 个
# 添加中间件: RateLimitMiddleware, capacity=100, refill_rate=10
app.add_middleware(RateLimitMiddleware, capacity=100, refill_rate=10)
\`\`\`

注意:这是单实例内存版,多实例部署要用 Redis 共享计数。

## 五、滑动窗口限流

另一种算法:统计时间窗口内的请求数。

\`\`\`python
# 导入 time 模块
import time
# 从 collections 导入 deque, defaultdict
from collections import deque, defaultdict
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 定义类 SlidingWindowMiddleware，继承 BaseHTTPMiddleware
class SlidingWindowMiddleware(BaseHTTPMiddleware):
    # 定义函数 __init__，参数: self, app, window: int = 60, max_requests: int = 1...
    def __init__(self, app, window: int = 60, max_requests: int = 100):
        # 调用 super()
        super().__init__(app)
        self.window = window          # 窗口大小(秒)
        # self.max_requests = max_requests
        self.max_requests = max_requests
        self.requests = defaultdict(deque)  # ip -> 时间戳队列

    # 定义异步函数 dispatch，参数: self, request, call_next
    async def dispatch(self, request, call_next):
        # 定义变量 ip，赋值为 request.client.host
        ip = request.client.host
        # 定义变量 now，赋值为 time.time()
        now = time.time()
        # 清理过期时间戳
        # 当 self.requests[ip] and now - self.requests[ip][0] > self.window 为真时循环
        while self.requests[ip] and now - self.requests[ip][0] > self.window:
            # self.requests[ip].popleft()
            self.requests[ip].popleft()
        # 检查是否超限
        # 条件判断：如果 len(self.requests[ip]) >= self.max_requests
        if len(self.requests[ip]) >= self.max_requests:
            # 从 fastapi.responses 导入 JSONResponse
            from fastapi.responses import JSONResponse
            # 返回 JSONResponse(status_code=429, content={"detail": "限流"})
            return JSONResponse(status_code=429, content={"detail": "限流"})
        # 记录本次请求
        # self.requests[ip].append(now)
        self.requests[ip].append(now)
        # 返回 await call_next(request)
        return await call_next(request)
\`\`\`

## 六、中间件做请求 ID 追踪

给每个请求分配唯一 ID,贯穿日志、响应、下游调用:

\`\`\`python
# 导入 uuid 模块
import uuid
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 定义类 RequestIDMiddleware，继承 BaseHTTPMiddleware
class RequestIDMiddleware(BaseHTTPMiddleware):
    # 定义异步函数 dispatch，参数: self, request: Request, call_next
    async def dispatch(self, request: Request, call_next):
        # 1. 优先用上游传的 ID(链路追踪),没有就生成
        # 定义变量 request_id，赋值为 request.headers.get("X-Request-ID") or str(uu...
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        # 2. 存到 state,日志和路由都能用
        # request.state.request_id = request_id
        request.state.request_id = request_id
        # 3. 调用下游
        # 定义变量 response，赋值为 await call_next(request)
        response = await call_next(request)
        # 4. 响应头带上,前端能关联
        # response.headers["X-Request-ID"] = request_id
        response.headers["X-Request-ID"] = request_id
        # 返回 response
        return response

# 创建 FastAPI 应用实例
app = FastAPI()
# 添加中间件: RequestIDMiddleware
app.add_middleware(RequestIDMiddleware)
\`\`\`

配合日志中间件,每条日志带 request_id,排查问题能串起整个请求链路。

## 七、中间件和异常处理的顺序

中间件里下游抛异常的处理:

\`\`\`python
# 定义类 SafeMiddleware，继承 BaseHTTPMiddleware
class SafeMiddleware(BaseHTTPMiddleware):
    # 定义异步函数 dispatch，参数: self, request, call_next
    async def dispatch(self, request, call_next):
        # 尝试执行，捕获异常
        try:
            # 返回 await call_next(request)
            return await call_next(request)
        # 捕获 Exception 异常，赋值为 e
        except Exception as e:
            # 记录异常
            # 调用 logger.exception()
            logger.exception("请求处理失败")
            # 返回统一错误响应
            # 返回 JSONResponse(
            return JSONResponse(
                # 定义变量 status_code，赋值为 500,
                status_code=500,
                # 定义字典 content
                content={"code": 500, "message": "服务器内部错误"},
            # )
            )
\`\`\`

**注意顺序**:异常处理中间件应该在**最外层**,这样能捕获所有下游异常。如果它在内层,外层中间件的异常抓不到。

## 八、完整示例:请求日志 + 限流中间件

\`\`\`python
# 导入 time 模块
import time
# 导入 logging 模块
import logging
# 导入 uuid 模块
import uuid
# 从 collections 导入 defaultdict, deque
from collections import defaultdict, deque
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 调用 logging.basicConfig()
logging.basicConfig(level=logging.INFO)
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")

# 1. 请求 ID 中间件(最外层,给所有请求分配 ID)
# 定义类 RequestIDMiddleware，继承 BaseHTTPMiddleware
class RequestIDMiddleware(BaseHTTPMiddleware):
    # 定义异步函数 dispatch，参数: self, request, call_next
    async def dispatch(self, request, call_next):
        # 定义变量 rid，赋值为 request.headers.get("X-Request-ID") or str(uu...
        rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        # request.state.request_id = rid
        request.state.request_id = rid
        # 定义变量 response，赋值为 await call_next(request)
        response = await call_next(request)
        # response.headers["X-Request-ID"] = rid
        response.headers["X-Request-ID"] = rid
        # 返回 response
        return response

# 2. 限流中间件
# 定义类 RateLimitMiddleware，继承 BaseHTTPMiddleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    # 定义函数 __init__，参数: self, app, window=60, max_req=100
    def __init__(self, app, window=60, max_req=100):
        # 调用 super()
        super().__init__(app)
        # self.window = window
        self.window = window
        # self.max_req = max_req
        self.max_req = max_req
        # self.req_log = defaultdict(deque)
        self.req_log = defaultdict(deque)

    # 定义异步函数 dispatch，参数: self, request, call_next
    async def dispatch(self, request, call_next):
        # 定义变量 ip，赋值为 request.client.host
        ip = request.client.host
        # 定义变量 now，赋值为 time.time()
        now = time.time()
        # 清理过期
        # 当 self.req_log[ip] and now - self.req_log[ip][0] > self.window 为真时循环
        while self.req_log[ip] and now - self.req_log[ip][0] > self.window:
            # self.req_log[ip].popleft()
            self.req_log[ip].popleft()
        # 条件判断：如果 len(self.req_log[ip]) >= self.max_req
        if len(self.req_log[ip]) >= self.max_req:
            # 定义变量 rid，赋值为 getattr(request.state, "request_id", "?")
            rid = getattr(request.state, "request_id", "?")
            # 调用 logger.warning()
            logger.warning(f"[{rid}] 限流: {ip}")
            # 返回 JSONResponse(
            return JSONResponse(
                # 定义变量 status_code，赋值为 429,
                status_code=429,
                # 定义字典 content
                content={"detail": "请求过于频繁"},
                # 定义字典 headers
                headers={"Retry-After": str(self.window)},
            # )
            )
        # self.req_log[ip].append(now)
        self.req_log[ip].append(now)
        # 返回 await call_next(request)
        return await call_next(request)

# 3. 日志中间件
# 定义类 LoggingMiddleware，继承 BaseHTTPMiddleware
class LoggingMiddleware(BaseHTTPMiddleware):
    # 定义异步函数 dispatch，参数: self, request, call_next
    async def dispatch(self, request, call_next):
        # 定义变量 rid，赋值为 getattr(request.state, "request_id", "?")
        rid = getattr(request.state, "request_id", "?")
        # 定义变量 start，赋值为 time.time()
        start = time.time()
        # 定义变量 method，赋值为 request.method
        method = request.method
        # 定义变量 path，赋值为 request.url.path
        path = request.url.path
        # 尝试执行，捕获异常
        try:
            # 定义变量 response，赋值为 await call_next(request)
            response = await call_next(request)
            # 定义变量 dur，赋值为 time.time() - start
            dur = time.time() - start
            # 调用 logger.info()
            logger.info(f"[{rid}] {method} {path} {response.status_code} {dur:.3f}s")
            # 返回 response
            return response
        # 捕获 Exception 异常，赋值为 e
        except Exception as e:
            # 定义变量 dur，赋值为 time.time() - start
            dur = time.time() - start
            # 调用 logger.error()
            logger.error(f"[{rid}] {method} {path} 500 {dur:.3f}s {e}")
            # raise
            raise

# 创建 FastAPI 应用实例
app = FastAPI()
# 添加顺序(后加的在最外层):
# 实际执行:RequestID(最外) → Logging → RateLimit → 路由
# 添加中间件: LoggingMiddleware
app.add_middleware(LoggingMiddleware)
# 添加中间件: RateLimitMiddleware, window=60, max_req=100
app.add_middleware(RateLimitMiddleware, window=60, max_req=100)
# 添加中间件: RequestIDMiddleware
app.add_middleware(RequestIDMiddleware)

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，参数: 
def root():
    # 返回 {"msg": "hello"}
    return {"msg": "hello"}

# 定义 GET 路由：访问 /error 时触发
@app.get("/error")
# 定义函数 error，参数: 
def error():
    # 抛出 ValueError 异常: "模拟错误"
    raise ValueError("模拟错误")
\`\`\`

## 九、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 限流单机内存 | 多实例失效 | 用 Redis 共享 |
| 异常处理中间件不在外层 | 漏抓 | 放最外层 |
| request.state 属性未初始化访问 | AttributeError | 用 getattr 带默认值 |
| 中间件里读 body 后下游读不到 | 流已消费 | 谨慎,或缓存重写 |
| JWT 中间件无白名单 | 登录接口也要 token | 加 EXEMPT_PATHS |
| 限流 key 用 IP | NAT 后大量用户同 IP | 用 user_id 或 API key |

## 十、设计思想

自定义中间件是实现「横切关注点」的利器。日志、限流、追踪、认证这些全局需求,放中间件最合适。但要克制——不要把所有逻辑都塞中间件,中间件应该薄而专一,只做一件事。复杂的业务逻辑(如特定接口的权限)用依赖,不要硬塞中间件。中间件多了会影响性能和可维护性,适度使用。
`,
  },
];
