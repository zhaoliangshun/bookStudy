// =============================================================
// FastAPI 应用开发实战教程 - 第 7 批章节（中间件 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-middleware-basic  : 中间件基础
//   fa-cors              : CORS 跨域中间件
//   fa-gzip-middleware   : GZip 与内置中间件
//   fa-custom-middleware : 自定义中间件实战
// ============================================================

export const chapters = [
  {
    id: "fa-middleware-basic",
    group: "中间件",
    icon: "🔧",
    title: "中间件基础",
    content: `
## 一、中间件是什么

中间件(Middleware)是「在请求到达路由前、响应离开路由后」执行的钩子函数。它像一层透明包装,套在所有路由外面,可以:

- 在请求处理**前**做事(改请求头、校验 token、记录开始时间)。
- 在请求处理**后**做事(改响应头、记录耗时、压缩响应体)。
- 直接短路(不进路由,直接返回响应,比如拒绝非法请求)。

类比:中间件是高速公路的收费站,每辆车(请求)都要过,可以查车(改请求)、收费(记日志)、拦车(拒绝放行)。收费站不只一个,从入口到出口要经过一串,每个都能拦你。

## 二、洋葱模型:理解中间件的执行原理

多个中间件构成「洋葱」,请求从外往里穿,响应从里往外穿。这是理解中间件最核心的模型:

\`\`\`
请求进来 → [中间件A 请求前] → [中间件B 请求前] → 路由处理 → [中间件B 响应后] → [中间件A 响应后] → 响应出去
\`\`\`

画成洋葱:
\`\`\`
         ┌─── 中间件A (最外层) ───┐
         │  ┌─── 中间件B ───┐    │
请求 →   │  │   ┌─ 路由 ─┐  │    │   → 响应
         │  │   └────────┘  │    │
         │  └───────────────┘    │
         └────────────────────────┘
\`\`\`

关键点:
- **请求阶段**:从外到内,先注册的先执行「请求前」逻辑。
- **响应阶段**:从内到外,后注册的先执行「响应后」逻辑。
- \`call_next\` 是「链条」的连接点,调用它等于「进入下一层」。

## 三、@app.middleware("http") 装饰器写法

最简单的中间件写法,用装饰器注册:

\`\`\`python
# 导入 time 模块,用于计算耗时
import time
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 用 @app.middleware("http") 装饰器注册中间件
# 装饰器:app.middleware("http") 表示注册一个 HTTP 中间件
@app.middleware("http")
# 定义异步函数 timing_middleware,参数: request 和 call_next
# request: 当前请求对象,包含头、体、URL 等
# call_next: 调用下一层(中间件或路由)的函数
async def timing_middleware(request: Request, call_next):
    # 1. 请求前:记录开始时间
    start = time.time()

    # 2. 调用下一层,等待响应回来
    # call_next 是 async 函数,必须 await
    response = await call_next(request)

    # 3. 响应后:计算耗时,加到响应头
    duration = time.time() - start
    # 把耗时写到响应头,前端能看到
    response.headers["X-Process-Time"] = f"{duration:.4f}s"

    # 4. 返回响应,继续往外传
    return response

# 定义一个普通路由,访问 / 时触发
@app.get("/")
def root():
    return {"msg": "hello"}

# 定义一个慢路由,访问 /slow 时触发
@app.get("/slow")
def slow():
    # 模拟耗时操作
    time.sleep(0.5)
    return {"msg": "slow"}
\`\`\`

访问 \`/\` 后,响应头里会有 \`X-Process-Time: 0.0023s\`。访问 \`/slow\` 则是 \`0.5012s\` 左右。

三个关键点必须记住:
- \`request: Request\` —— 当前请求对象,可以读头、URL、查询参数。
- \`call_next(request)\` —— 调用下一层,返回 Response 对象。
- \`await\` —— 中间件必须是 \`async def\`,call_next 必须 await。

## 四、BaseHTTPMiddleware 类写法

更规范的写法是继承 \`BaseHTTPMiddleware\` 类,适合复杂、可配置的中间件:

\`\`\`python
# 导入 time 模块
import time
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware 基类
from starlette.middleware.base import BaseHTTPMiddleware
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义中间件类,继承 BaseHTTPMiddleware
class TimingMiddleware(BaseHTTPMiddleware):
    """记录每个请求的耗时,写到响应头"""

    # __init__ 可以接收配置参数
    # app 是 ASGI 应用(框架自动传),header_name 是自定义配置
    def __init__(self, app, header_name: str = "X-Process-Time"):
        # 必须调用父类的 __init__,传入 app
        super().__init__(app)
        # 保存配置,后续 dispatch 里能用
        self.header_name = header_name

    # dispatch 是核心方法,每个请求都会调用
    # 参数: self, request, call_next
    async def dispatch(self, request: Request, call_next):
        # 请求前:记录开始时间
        start = time.time()

        # 调用下一层,等待响应
        response = await call_next(request)

        # 响应后:计算耗时,写响应头
        duration = time.time() - start
        # 用 self.header_name 访问配置
        response.headers[self.header_name] = f"{duration:.4f}s"

        # 返回响应
        return response

# 用 add_middleware 添加,可以传配置参数
# 添加中间件: TimingMiddleware, header_name="X-Timing"
app.add_middleware(TimingMiddleware, header_name="X-Timing")

@app.get("/")
def root():
    return {"msg": "hello"}
\`\`\`

类中间件的好处:
- \`__init__\` 接收配置,可参数化(比如 header 名字、限流阈值)。
- 逻辑封装在类里,可复用、可测试、可继承。
- 更面向对象,适合复杂中间件。

## 五、中间件执行顺序:后进先出

注册顺序决定包裹层级:**后注册的在更外层**。这是最容易搞错的点。

### Demo 1:验证执行顺序

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 中间件 A:先注册
@app.middleware("http")
async def mw_a(request: Request, call_next):
    print("A before")  # 请求前执行
    response = await call_next(request)  # 调用下一层
    print("A after")   # 响应后执行
    return response

# 中间件 B:后注册,所以在更外层
@app.middleware("http")
async def mw_b(request: Request, call_next):
    print("B before")  # B 在外层,请求先到 B
    response = await call_next(request)
    print("B after")   # 响应后,B 后执行
    return response

@app.get("/")
def root():
    print("路由执行")
    return {"msg": "ok"}
\`\`\`

访问 \`/\` 时,控制台输出:
\`\`\`
B before
A before
路由执行
A after
B after
\`\`\`

为什么是 B 先?因为 B 后注册,被包在更外层。请求从外往里穿,先碰 B。

**记忆口诀**:「后注册的在外层,请求先过;先注册的在内层,响应先回」。

### Demo 2:用 add_middleware 的顺序

\`\`\`python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class FirstMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print("First before")
        response = await call_next(request)
        print("First after")
        return response

class SecondMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print("Second before")
        response = await call_next(request)
        print("Second after")
        return response

# 先加 First,后加 Second
# Second 后加,所以更外层,请求先过 Second
app.add_middleware(FirstMiddleware)
app.add_middleware(SecondMiddleware)

@app.get("/")
def root():
    return {"msg": "ok"}
\`\`\`

执行顺序:\`Second before → First before → 路由 → First after → Second after\`。

## 六、call_next 的作用

\`call_next\` 是中间件链条的连接点。调用它等于「把请求传给下一层,等响应回来」。

\`\`\`python
@app.middleware("http")
async def example(request: Request, call_next):
    # call_next 之前:请求阶段(还没进路由)
    print("请求进来")

    # 调用 call_next:进入下一层,最终到路由
    # response 是路由返回的响应(经过内层中间件处理后)
    response = await call_next(request)

    # call_next 之后:响应阶段(路由已执行完)
    print("响应出去")

    # 可以修改 response 再返回
    response.headers["X-Custom"] = "yes"
    return response
\`\`\`

如果不调用 \`call_next\`,就是「短路」——请求不会进路由:

\`\`\`python
from fastapi.responses import JSONResponse

@app.middleware("http")
async def block_middleware(request: Request, call_next):
    # 不调用 call_next,直接返回响应 = 短路
    # 路由根本不会执行
    return JSONResponse(
        status_code=403,
        content={"detail": "维护中,暂停服务"}
    )
\`\`\`

短路的应用场景:维护模式、IP 黑名单、限流拒绝。

## 七、request.state 共享数据

中间件之间、中间件和路由之间,可以通过 \`request.state\` 共享数据:

\`\`\`python
# 导入 uuid 模块,生成唯一 ID
import uuid
from fastapi import FastAPI, Request

app = FastAPI()

# 中间件:给每个请求分配唯一 ID
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # 生成唯一 ID,存到 request.state
    request.state.request_id = str(uuid.uuid4())[:8]

    # 调用下游
    response = await call_next(request)

    # 响应头带上 ID,前端能关联
    response.headers["X-Request-ID"] = request.state.request_id
    return response

# 路由里能读到中间件设的 state
@app.get("/me")
def me(request: Request):
    # request.state.request_id 是中间件设的
    return {"request_id": request.state.request_id}

@app.get("/log")
def log(request: Request):
    # 多个路由都能用
    print(f"请求 {request.state.request_id} 访问了 /log")
    return {"request_id": request.state.request_id}
\`\`\`

\`request.state\` 是一个对象,可以挂任意属性,请求结束自动销毁(请求级隔离,不会串)。

**注意**:读 state 时如果属性不存在会抛 \`AttributeError\`,用 \`getattr\` 更安全:

\`\`\`python
rid = getattr(request.state, "request_id", "unknown")
\`\`\`

## 八、中间件 vs 依赖的区别

中间件和依赖都能做请求前/后处理,但定位不同:

| 维度 | 中间件 | 依赖 |
|---|---|---|
| 作用范围 | 全局(所有请求) | 接口/路由/app 级 |
| 短路方式 | 直接 return Response | 抛 HTTPException |
| 后处理 | call_next 之后 | yield 之后 |
| 取参数 | request 对象 | 函数参数 |
| 性能影响 | 每个请求都过 | 按需执行 |
| 适用场景 | 全局横切(日志/限流/CORS) | 局部校验(认证/分页) |

经验:**全局的用中间件,局部的用依赖**。比如限流是全局的(所有接口都要限),用中间件;认证是局部的(有些接口不要登录),用依赖。

### Demo 3:中间件和依赖的对比

\`\`\`python
from fastapi import FastAPI, Request, Depends, HTTPException

app = FastAPI()

# 中间件:全局,所有请求都过
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    print(f"中间件: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# 依赖:局部,只有用 Depends 的路由才执行
def verify_token(token: str = ""):
    if token != "secret":
        raise HTTPException(status_code=401, detail="无效 token")
    return {"user": "alice"}

# 这个路由有认证(用依赖)
@app.get("/secure")
def secure(user: dict = Depends(verify_token)):
    return user

# 这个路由没认证(不用依赖)
@app.get("/public")
def public():
    return {"msg": "公开接口"}
\`\`\`

访问 \`/public\`:中间件执行,依赖不执行。
访问 \`/secure\`:中间件执行,依赖也执行。

## 九、中间件能做什么、不能做什么

**能做**:
- 记录请求日志(方法、路径、状态码、耗时)。
- 修改请求头/响应头(加 X-Request-ID、X-Process-Time)。
- 限流、熔断(超过阈值直接返回 429)。
- CORS 跨域处理(加 Access-Control-* 头)。
- GZip 压缩响应体。
- 请求 ID 追踪(分布式链路追踪基础)。
- IP 黑名单/白名单。

**不能做(或很难做)**:
- 读请求体后让路由再读(流已消费,需要重写,见下文)。
- 精确控制哪些路由生效(中间件是全局的,要靠路径判断)。
- 访问路由的依赖注入结果(中间件在路由之前,拿不到)。
- 修改路由返回的具体内容(只能改响应头/状态码,改体很麻烦)。

### Demo 4:中间件读请求体的陷阱

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.middleware("http")
async def read_body_middleware(request: Request, call_next):
    # ❌ 危险:这里读了 body,路由里就读不到了!
    # body = await request.body()  # 流被消费

    # ✅ 如果必须读,要重写流
    body = await request.body()
    # 把 body 重新塞回去,下游还能读
    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}
    # 用新的 receive 替换原来的
    request._receive = receive

    response = await call_next(request)
    return response

@app.post("/data")
async def data(request: Request):
    # 如果中间件没重写流,这里读不到 body
    body = await request.body()
    return {"received": body.decode()}
\`\`\`

**避坑**:中间件里读 body 要非常小心,能不读就不读。需要校验请求体的,用依赖或路由里做。

## 十、实战:完整的请求日志中间件

把前面学的组合起来,做一个生产可用的请求日志中间件:

\`\`\`python
# 导入 time 模块,计算耗时
import time
# 导入 logging 模块,记录日志
import logging
# 导入 uuid 模块,生成请求 ID
import uuid
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志:级别 INFO,格式包含时间
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
# 创建 logger 实例
logger = logging.getLogger("api")

# 定义请求日志中间件类
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """记录每个请求的方法、路径、状态码、耗时、请求ID"""

    # 不记录日志的路径(健康检查等)
    SKIP_PATHS = {"/health", "/favicon.ico"}

    async def dispatch(self, request: Request, call_next):
        # 跳过健康检查,减少日志噪音
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        # 1. 请求前:生成请求 ID,记录开始时间
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        # 存到 state,路由和日志都能用
        request.state.request_id = request_id

        start = time.time()
        method = request.method      # GET/POST/...
        path = request.url.path      # /api/users
        client_ip = request.client.host if request.client else "?"

        # 2. 调用下游,捕获异常
        try:
            response = await call_next(request)
            status = response.status_code
        except Exception as e:
            # 下游抛异常,记录错误并重新抛出
            duration = time.time() - start
            logger.error(
                f"[{request_id}] {method} {path} 500 {duration:.4f}s "
                f"ERROR: {type(e).__name__}: {e}"
            )
            raise

        # 3. 响应后:记录日志
        duration = time.time() - start
        # 根据状态码选日志级别
        if status >= 500:
            logger.error(f"[{request_id}] {method} {path} {status} {duration:.4f}s")
        elif status >= 400:
            logger.warning(f"[{request_id}] {method} {path} {status} {duration:.4f}s")
        else:
            logger.info(f"[{request_id}] {method} {path} {status} {duration:.4f}s")

        # 4. 响应头加请求 ID 和耗时
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{duration:.4f}s"

        return response

# 创建应用
app = FastAPI()
# 添加中间件
app.add_middleware(RequestLoggingMiddleware)

# 测试路由
@app.get("/")
def root():
    return {"msg": "hello"}

@app.get("/slow")
def slow():
    # 模拟慢请求
    time.sleep(0.5)
    return {"msg": "slow"}

@app.get("/error")
def error():
    # 模拟错误
    raise ValueError("模拟服务器错误")

@app.get("/health")
def health():
    # 健康检查,不记日志
    return {"status": "ok"}
\`\`\`

访问 \`/slow\`,日志输出类似:
\`\`\`
2024-01-01 12:00:00 [INFO] api: [a1b2c3d4] GET /slow 200 0.5012s
\`\`\`

访问 \`/error\`,日志输出:
\`\`\`
2024-01-01 12:00:01 [ERROR] api: [e5f6g7h8] GET /error 500 0.0023s ERROR: ValueError: 模拟服务器错误
\`\`\`

## 十一、常见错误和避坑指南

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 忘了 \`await call_next\` | 协程没等待,报错 | 必须 \`await\` |
| 同步函数当中间件 | 报错,\`call_next\` 是 async | 必须 \`async def\` |
| 中间件里读 \`request.body\` | 流已消费,路由读不到 | 重写 \`_receive\` 或避免读 |
| 以为先注册先全程执行 | 只是请求前半段先,响应后半段反的 | 记住洋葱模型 |
| 中间件异常不处理 | 直接 500,日志丢失 | try/except 记录后再 raise |
| 中间件做认证短路后不 return | 继续走 call_next | 短路要直接 return Response |
| \`request.state\` 属性名冲突 | 覆盖别人的值 | 加前缀,如 \`_my_app_\` |
| 读 \`request.state\` 不存在属性 | \`AttributeError\` | 用 \`getattr(state, "x", default)\` |
| 类中间件忘 \`super().__init__\` | 报错 | 必须调用父类初始化 |
| 中间件顺序乱 | 异常抓不到、压缩错位 | 异常处理最外,压缩次外,校验内 |

### Demo 5:中间件短路实现维护模式

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 维护模式开关(实际从配置文件读)
MAINTENANCE_MODE = True

@app.middleware("http")
async def maintenance_middleware(request: Request, call_next):
    # 维护模式开启时,除了 /maintenance 都拒绝
    if MAINTENANCE_MODE and request.url.path != "/maintenance":
        return JSONResponse(
            status_code=503,
            content={"detail": "系统维护中,请稍后再试"},
            headers={"Retry-After": "3600"}  # 1小时后重试
        )
    # 非维护模式或访问 /maintenance,正常放行
    return await call_next(request)

@app.get("/")
def root():
    return {"msg": "正常服务"}

@app.get("/maintenance")
def maintenance():
    return {"status": "维护中", "msg": "请稍后访问"}
\`\`\`

维护模式开启时,访问 \`/\` 返回 503;访问 \`/maintenance\` 返回维护信息。关闭后一切正常。

## 十二、设计思想

中间件是「横切关注点」(cross-cutting concern)的实现手段。日志、限流、CORS、压缩这些和业务无关但又必须做的事,如果塞进每个路由,代码会膨胀且难维护。中间件把它们抽出来,集中处理,业务代码保持纯净。

这是 AOP(面向切面编程)思想在 Web 框架的落地:把「和业务正交」的关注点(日志、安全、性能)用切面(中间件)统一处理,而不是侵入每个业务函数。

理解中间件的关键是「洋葱模型」和「call_next 是链条」。想清楚请求从外到内、响应从内到外的流向,就能写出正确的中间件。
`,
  },
  {
    id: "fa-cors",
    group: "中间件",
    icon: "🌐",
    title: "CORS 跨域中间件",
    content: `
## 一、同源策略和跨域问题

浏览器的**同源策略**:JS 脚本只能访问「同源」的资源。同源 = 协议 + 域名 + 端口三者完全相同。

\`http://localhost:3000\` 的前端页面,请求 \`http://localhost:8000\` 的 API,就是**跨域**(端口不同)。浏览器会拦截这种请求(准确说是拦截响应,不拦截请求发送)。

对比:

| URL A | URL B | 是否同源 | 原因 |
|---|---|---|---|
| http://a.com/page | http://a.com/api | ✅ 同源 | 协议域名端口都同 |
| http://a.com:80 | http://b.com:80 | ❌ 跨域 | 域名不同 |
| http://a.com | https://a.com | ❌ 跨域 | 协议不同 |
| http://a.com:3000 | http://a.com:8000 | ❌ 跨域 | 端口不同 |

这是浏览器的安全机制,防止恶意网站偷偷访问其它网站的 API(比如你登录了银行,恶意网站 JS 不能调银行 API)。但前后端分离开发时,跨域是常态,需要后端「授权」跨域。

## 二、CORS 原理

CORS(Cross-Origin Resource Sharing)是 HTTP 头机制,服务器通过响应头告诉浏览器「我允许哪些来源跨域访问」。

### 2.1 简单请求

对于「简单请求」(GET/HEAD/POST + 简单头如 Content-Type: text/plain/form-urlencoded),浏览器直接发请求,看响应头决定是否给 JS:

\`\`\`
请求:
GET /api/users HTTP/1.1
Origin: http://localhost:3000

响应:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
\`\`\`

匹配则放行,JS 拿到响应;不匹配则报 CORS 错误,JS 拿不到响应。

### 2.2 预检请求(Preflight)

对于「非简单请求」(自定义 Header 如 Authorization、PUT/DELETE 方法、Content-Type: application/json),浏览器会**先发一个 OPTIONS 请求**询问:

\`\`\`
OPTIONS /api/users HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization, Content-Type
\`\`\`

服务器响应:
\`\`\`
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 600
\`\`\`

浏览器看到允许,才发真正的 PUT 请求。这个 OPTIONS 就是「预检」。

**为什么要有预检?** 因为非简单请求可能有副作用(改数据),先问一下避免误操作。预检结果会被浏览器缓存(\`Access-Control-Max-Age\`),不会每次都发。

## 三、为什么前端调用 API 会跨域

开发场景:
- 前端 dev server(Vite/Webpack):\`http://localhost:3000\`
- 后端 API(FastAPI):\`http://localhost:8000\`

端口不同 → 跨域 → 浏览器拦截 → 报 CORS 错。

解决方法:
1. **后端配 CORS**(推荐,最简单)。
2. 前端 dev server 配代理(把 API 请求转给后端,浏览器看是同源)。
3. 生产环境用 Nginx 反代,前后端同源。

## 四、CORSMiddleware 配置详解

FastAPI/Starlette 内置 CORS 中间件,用 \`add_middleware\` 添加:

### Demo 1:最简 CORS 配置

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware
# CORSMiddleware:处理跨域请求,自动添加 Access-Control-* 响应头
from fastapi.middleware.cors import CORSMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 添加 CORS 中间件
# add_middleware 第一个参数是中间件类,后续参数是配置
app.add_middleware(
    CORSMiddleware,
    # allow_origins:允许跨域的前端来源列表
    # 必须包含协议+域名+端口,缺一不可
    # ["*"] 表示允许任何来源(不安全,生产不推荐)
    allow_origins=[
        "http://localhost:3000",   # 前端开发地址(React 默认端口)
    ],
    # allow_methods:允许的 HTTP 方法
    # ["*"] 表示允许所有标准方法(GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS)
    allow_methods=["*"],
    # allow_headers:允许的请求头
    # ["*"] 表示允许所有请求头(Authorization、Content-Type 等)
    allow_headers=["*"],
)

@app.get("/api/users")
def users():
    return [{"id": 1, "name": "alice"}]
\`\`\`

### Demo 2:完整 CORS 配置

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 完整的 CORS 配置,生产级
app.add_middleware(
    CORSMiddleware,
    # 1. allow_origins:允许的前端来源列表
    #    必须明确列出,不要用 ["*"](尤其是带 credentials 时)
    allow_origins=[
        "http://localhost:3000",        # 本地开发
        "http://127.0.0.1:3000",        # 本地开发(IP 访问)
        "http://dev.mycompany.com",     # 测试环境
        "https://app.mycompany.com",    # 生产环境
    ],
    # 2. allow_credentials:是否允许带 Cookie 跨域
    #    True 时 allow_origins 不能是 ["*"]
    allow_credentials=True,
    # 3. allow_methods:允许的 HTTP 方法
    #    显式列出比 ["*"] 更清晰、更安全
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # 4. allow_headers:允许的请求头
    #    前端用到的自定义头都要列
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    # 5. expose_headers:暴露给前端 JS 能读的响应头
    #    默认前端只能读"安全"头,自定义头要 expose
    expose_headers=["X-Request-ID", "X-Total-Count", "X-Process-Time"],
    # 6. max_age:预检结果缓存秒数
    #    缓存期内不重复发 OPTIONS,减少请求
    max_age=600,
)

@app.get("/api/users")
def users():
    return [{"id": 1, "name": "alice"}]
\`\`\`

参数说明:

| 参数 | 作用 | 推荐值 |
|---|---|---|
| \`allow_origins\` | 允许的来源列表 | 明确列出,不用 \`["*"]\` |
| \`allow_methods\` | 允许的方法 | 显式列出或 \`["*"]\` |
| \`allow_headers\` | 允许的请求头 | 显式列出或 \`["*"]\` |
| \`allow_credentials\` | 允许带 Cookie | 看需求,JWT 可不开 |
| \`expose_headers\` | 前端能读的响应头 | 自定义头要列出 |
| \`max_age\` | 预检缓存秒数 | 600(10分钟) |
| \`allow_origin_regex\` | 来源正则匹配 | 子域名通配时用 |

## 五、allow_origins、allow_methods、allow_headers

### 5.1 allow_origins:通配符 vs 指定源

\`\`\`python
# ❌ 不安全:任何网站都能跨域访问
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# ✅ 明确指定来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
)
\`\`\`

\`["*"]\` 表示「任何网站都能跨域访问你的 API」。如果你的 API 是公开的(无认证),这没问题;但如果是带认证的(有 Cookie/token),\`["*"]\` 会和 \`allow_credentials=True\` 冲突(浏览器拒绝)。

### 5.2 allow_origin_regex:正则匹配子域名

当来源很多(比如所有子域名),用正则更方便:

### Demo 3:allow_origin_regex 用法

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 用正则匹配所有子域名
# https://*.mycompany.com 都允许
app.add_middleware(
    CORSMiddleware,
    # allow_origin_regex:用正则匹配来源,适合子域名多的场景
    # 比一个个列 allow_origins 方便
    # 正则:匹配 https://任意.mycompany.com
    # r"..." 是原始字符串,反斜杠不转义
    # \\. 匹配真正的点号(正则里 . 匹配任意字符,要转义)
    allow_origin_regex=r"https://.*\\.mycompany\\.com",
    # allow_credentials=True:允许带 Cookie 跨域
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data")
def data():
    return {"msg": "ok"}
\`\`\`

这样 \`https://app.mycompany.com\`、\`https://admin.mycompany.com\`、\`https://test.mycompany.com\` 都允许,但 \`https://evil.com\` 不允许。

### 5.3 allow_methods 和 allow_headers

\`\`\`python
# 显式列出更安全
allow_methods=["GET", "POST", "PUT", "DELETE"]  # 不允许 TRACE/CONNECT

# ["*"] 也行,表示允许所有标准方法
allow_methods=["*"]

# allow_headers 同理
allow_headers=["Authorization", "Content-Type"]  # 只允许这两个
allow_headers=["*"]  # 允许所有头
\`\`\`

## 六、allow_credentials 的作用和冲突

带 Cookie 跨域时,必须开启 \`allow_credentials=True\`:

\`\`\`python
# 前端 JS
# fetch("http://api.example.com/me", {
#     credentials: "include",  # 带 Cookie 跨域
# })

# 后端必须
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # 必须,否则浏览器不发送 Cookie
)
\`\`\`

**重要规则**:\`allow_credentials=True\` 时,\`allow_origins\` **不能是 \`["*"]\`**。

### Demo 4:credentials 和通配符冲突演示

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ❌ 浏览器拒绝:credentials 和 * 冲突
# 前端 fetch 带 credentials 会报错:
# "The value of the 'Access-Control-Allow-Origin' header in the response
#  must not be the wildcard '*' when the request's credentials mode is 'include'"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # 通配符
    allow_credentials=True,       # 又要带 Cookie → 冲突!
)

# ✅ 正确:明确来源 + credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 明确来源
    allow_credentials=True,                   # 允许带 Cookie
)
\`\`\`

为什么?因为带凭证(Cookie)的跨域如果允许任意来源,等于任何网站都能以用户身份访问你的 API(CSRF 危险)。浏览器强制要求此时必须明确指定来源。

如果用 JWT(放 Authorization Header,不用 Cookie),可以不开 credentials。

## 七、expose_headers:让前端读自定义响应头

默认前端 JS 只能读「安全」的响应头(Content-Type、Content-Length 等)。自定义头(如 \`X-Request-ID\`)需要 expose:

\`\`\`python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    # 暴露这些头给前端 JS 读
    expose_headers=["X-Request-ID", "X-Total-Count"],
)
\`\`\`

之后前端 \`response.headers.get("X-Request-ID")\` 才能读到。否则返回 \`null\`。

## 八、常见跨域错误排查

CORS 报错信息通常很模糊(浏览器只说「CORS policy」)。排查方法:

1. **看浏览器 Network**:找 OPTIONS 请求(预检),看它的响应头有没有 \`Access-Control-Allow-Origin\`。
2. **看报错信息**:它会指出哪个头缺失。
3. **检查 Origin**:请求头 \`Origin\` 是否在 \`allow_origins\` 列表里。
4. **检查 credentials**:是否带了 Cookie 但没开 \`allow_credentials\`。
5. **检查方法/头**:预检请求的 \`Access-Control-Request-Method\` 是否在 \`allow_methods\` 里。

### Demo 5:CORS 调试中间件

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 先不加 CORS,测试报错
# 然后逐步加配置,看效果

# 调试用:打印请求的 Origin 和方法,方便排查
@app.middleware("http")
async def cors_debug_middleware(request: Request, call_next):
    # 打印 Origin 头(跨域请求会带)
    # Origin 标识请求来源,浏览器跨域请求自动加上
    origin = request.headers.get("origin", "无")
    print(f"请求方法: {request.method}, Origin: {origin}")

    # 调用下游,拿到响应
    response = await call_next(request)

    # 打印响应头里的 CORS 相关头,看配没配对
    # 字典推导式:筛选出 key 包含 "access-control" 的响应头
    # .lower() 统一转小写,做大小写不敏感匹配
    cors_headers = {
        k: v for k, v in response.headers.items()
        if "access-control" in k.lower()
    }
    print(f"CORS 响应头: {cors_headers}")
    return response

# 正式配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)

@app.get("/api/data")
def get_data():
    return {"msg": "跨域数据"}

@app.put("/api/data")
def put_data():
    return {"msg": "更新成功"}
\`\`\`

前端测试代码(放在 \`http://localhost:3000\`):
\`\`\`javascript
// 简单请求
fetch("http://localhost:8000/api/data")
  .then(r => r.json())
  .then(d => console.log(d));

// 非简单请求(触发预检)
fetch("http://localhost:8000/api/data", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "alice" })
})
  .then(r => r.json())
  .then(d => console.log(d));
\`\`\`

## 九、开发环境 vs 生产环境的 CORS 配置

### Demo 6:前后端分离完整示例

\`\`\`python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 从环境变量读配置,区分环境
ENV = os.getenv("APP_ENV", "development")

# 根据环境配不同的来源
if ENV == "development":
    # 开发环境:宽松,方便调试
    origins = [
        "http://localhost:3000",    # React dev server
        "http://localhost:5173",    # Vite dev server
        "http://localhost:8080",    # Vue dev server
        "http://127.0.0.1:3000",
    ]
else:
    # 生产环境:严格,只允许正式域名
    origins = [
        "https://app.mycompany.com",
        "https://www.mycompany.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID", "X-Total-Count"],
    max_age=600,
)

# 业务接口
@app.get("/api/products")
def list_products():
    return [
        {"id": 1, "name": "手机", "price": 2999},
        {"id": 2, "name": "电脑", "price": 5999},
    ]

@app.post("/api/products")
def create_product():
    return {"id": 3, "msg": "创建成功"}

@app.get("/api/products/{pid}")
def get_product(pid: int):
    return {"id": pid, "name": "商品", "price": 100}

# 模拟登录,设置 Cookie
# 从 fastapi 导入 Response(用于设置 Cookie)
from fastapi import Response

@app.post("/api/login")
def login(response: Response):
    # set_cookie 方法用于在响应里设置 Set-Cookie 头
    response.set_cookie(
        key="session_id",      # Cookie 的名字
        value="abc123",        # Cookie 的值
        httponly=True,         # HttpOnly:JS 读不到,防 XSS 偷 Cookie
        samesite="none",       # SameSite=None:跨域带 Cookie 必须设 none
        # samesite=none 时,secure 必须为 True,否则浏览器拒绝
        secure=True,           # Secure:只走 HTTPS,生产环境必须开启
    )
    return {"msg": "登录成功"}

@app.get("/api/me")
def me():
    return {"user": "alice"}
\`\`\`

生产环境注意:
- \`allow_origins\` 必须是正式域名,不用 \`["*"]\`。
- Cookie 要设 \`samesite="none"\` + \`secure=True\`(需 HTTPS)。
- 不要在 Nginx 和 FastAPI 都配 CORS(响应头重复,浏览器报错)。

## 十、CORS 和 Nginx 的冲突

如果 Nginx 反代已经加了 CORS 头,FastAPI 再加,响应头会重复:

\`\`\`
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Origin: http://localhost:3000  ← 重复!
\`\`\`

浏览器报错:\"The 'Access-Control-Allow-Origin' header contains multiple values\"。

解决:**只在一处配 CORS**。要么 Nginx 配,要么 FastAPI 配,不要都配。

## 十一、常见错误和避坑指南

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| \`allow_origins=["*"]\` + \`credentials\` | 浏览器拒绝 | 明确来源 |
| 开发用通配符上线忘改 | 安全风险 | 用环境变量区分 |
| 前端读不到自定义响应头 | 没 \`expose\` | 加 \`expose_headers\` |
| 以为 CORS 是前端配置 | 其实是后端 | 后端加 CORSMiddleware |
| 预检 OPTIONS 404 | 没处理 OPTIONS | CORSMiddleware 自动处理,别手动 |
| Nginx 和 FastAPI 都配 CORS | 头重复 | 只在一处配 |
| \`samesite\` 没设 \`none\` | 跨域 Cookie 不发送 | 跨域带 Cookie 要 \`none\`+\`secure\` |
| 正则转义错误 | 匹配不到 | 点号要双反斜杠转义 |
| 生产用 HTTP 设 Cookie | 浏览器拒绝 | \`secure=True\` 需 HTTPS |
| 预检不缓存 | 每次都 OPTIONS | 设 \`max_age=600\` |

## 十二、设计思想

CORS 是浏览器安全策略,服务器通过响应头「授权」跨域。理解它的本质:**不是 FastAPI 拦截,而是浏览器拦截**。CORS 是「声明式」的——你声明允许谁,浏览器执行拦截。这也是为什么通配符要谨慎:你在向所有网站开放访问权。

CORS 的设计体现了「最小权限」原则:默认拒绝,显式允许。配置 CORS 时,问自己「这个来源真的需要访问吗?」,而不是「图方便用 *\`」。安全配置的核心是「明确」——明确来源、明确方法、明确头,不偷懒用通配符。
`,
  },
  {
    id: "fa-gzip-middleware",
    group: "中间件",
    icon: "📦",
    title: "GZip 与内置中间件",
    content: `
## 一、GZipMiddleware 响应压缩

GZip 把响应体压缩后传输,显著减少传输量。文本类响应(JSON/HTML)压缩率高,通常能压到原来的 10%-30%。对于大 JSON 响应,效果尤其明显。

### Demo 1:GZip 压缩示例

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.gzip 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 添加 GZip 中间件
# minimum_size=1000:小于 1000 字节的响应不压缩
# 因为压缩小文件反而可能变大(压缩头有开销)
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/big")
def big():
    # 大 JSON 响应会被自动 GZip 压缩
    # 原始大小约 10KB,压缩后约 500 字节
    return {"data": ["item"] * 1000}

@app.get("/small")
def small():
    # 小响应不压缩(小于 minimum_size)
    return {"msg": "hi"}

@app.get("/list")
def list_items():
    # 返回 1000 个对象,压缩效果显著
    return [{"id": i, "name": f"item-{i}", "value": i * 10} for i in range(1000)]
\`\`\`

工作原理:
1. 请求带 \`Accept-Encoding: gzip\` 头(浏览器默认带)。
2. 中间件检查响应体大小,超过 \`minimum_size\` 才压缩。
3. 压缩响应体,设 \`Content-Encoding: gzip\` 头。
4. 浏览器看到头,自动解压。

\`minimum_size\` 参数:小于这个大小的响应不压缩(因为压缩头本身有开销,小文件压缩反而变大)。推荐 500-1000。

### 验证压缩效果

用 curl 测试:
\`\`\`bash
# 带 Accept-Encoding: gzip,看响应大小
curl -H "Accept-Encoding: gzip" http://localhost:8000/big -o /dev/null -w "大小: %{size_download} 字节"

# 不带 gzip 头,看原始大小
curl http://localhost:8000/big -o /dev/null -w "大小: %{size_download} 字节"
\`\`\`

对比两个大小,能看出压缩效果。

## 二、TrustedHostMiddleware 信任主机

Host 头攻击:攻击者伪造 Host 头(如 \`Host: evil.com\`),如果你的代码用 Host 生成 URL(如密码重置链接),会被诱导到恶意网站。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 starlette.middleware.trustedhost 导入 TrustedHostMiddleware
# TrustedHostMiddleware:校验请求头里的 Host 字段,防止 Host 头攻击
from starlette.middleware.trustedhost import TrustedHostMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 添加 TrustedHost 中间件
# 只允许这些 Host,其他的返回 400 Bad Request
app.add_middleware(
    TrustedHostMiddleware,
    # allowed_hosts:允许访问的 Host 白名单
    # 不在列表里的 Host 会被拒绝,返回 400
    allowed_hosts=[
        "example.com",           # 主域名(精确匹配)
        "www.example.com",       # www 子域(精确匹配)
        ".example.com",          # 所有子域名(. 开头表示通配子域)
        # .example.com 能匹配 api.example.com、admin.example.com 等
        "localhost",             # 开发环境(本机访问)
        "127.0.0.1",             # 开发环境(IP 访问)
    ],
)

@app.get("/")
def root():
    return {"msg": "ok"}
\`\`\`

- 只允许这些 Host,其他的返回 400。
- \`.example.com\` 表示允许所有子域名(\`api.example.com\`、\`admin.example.com\`)。
- 开发环境要加 \`localhost\`、\`127.0.0.1\`,否则本地访问 400。

**为什么需要**:如果不校验 Host,攻击者可以构造 \`Host: evil.com\` 的请求,你的代码如果用 \`request.url\` 生成链接(如重置密码邮件里的链接),会指向恶意网站。

## 三、HTTPSRedirectMiddleware 强制 HTTPS

把所有 HTTP 请求重定向(308)到 HTTPS:

### Demo 2:强制 HTTPS 跳转

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 starlette.middleware.httpsredirect 导入 HTTPSRedirectMiddleware
# HTTPSRedirectMiddleware:把所有 HTTP 请求永久重定向(308)到 HTTPS
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 添加 HTTPS 重定向中间件
# 强制 HTTPS:所有 HTTP 请求 308 跳转到 HTTPS
# 308 是永久重定向,保留原请求方法和 body
app.add_middleware(HTTPSRedirectMiddleware)

@app.get("/")
def root():
    return {"msg": "已加密访问"}

# 访问 http://example.com/ 会跳转到 https://example.com/
\`\`\`

生产环境(已部署 HTTPS)开这个,确保所有流量加密。但**开发环境(localhost HTTP)不要开**,否则一直重定向报错。

## 四、SessionMiddleware 基于 Cookie 的 Session

用 itsdangerous 签名的 Cookie Session,无需服务端存储:

### Demo 3:Session 中间件使用

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request, Response
# 从 starlette.middleware.sessions 导入 SessionMiddleware
# SessionMiddleware:用 itsdangerous 签名的 Cookie Session,无需服务端存储
from starlette.middleware.sessions import SessionMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# secret_key 用来签名 Cookie,泄漏则可伪造
# 生产环境用随机长字符串,不要硬编码
# 建议用 os.getenv("SESSION_SECRET") 从环境变量读
app.add_middleware(SessionMiddleware, secret_key="your-very-secret-key-change-me")

# 登录:往 session 存数据
@app.post("/login")
def login(request: Request):
    # request.session 是一个 dict-like 对象
    # 存到 session(会签名后写到 Cookie)
    # 数据经 itsdangerous 签名后序列化到 Cookie,下次请求自动校验签名
    request.session["user_id"] = 42
    request.session["username"] = "alice"
    return {"msg": "登录成功"}

# 读 session
@app.get("/me")
def me(request: Request):
    # .get(key, default) 读 session,不存在返回默认值
    uid = request.session.get("user_id")      # 读 session,不存在返回 None
    name = request.session.get("username")    # 读 session
    if uid is None:
        return {"msg": "未登录"}
    return {"user_id": uid, "username": name}

# 登出:清空 session
@app.post("/logout")
def logout(request: Request):
    # clear() 清空所有 session 数据
    # 会删除 Cookie 里的 session 内容
    request.session.clear()
    return {"msg": "已登出"}

# 访问计数:演示 session 存储
@app.get("/visit")
def visit(request: Request):
    # 读当前访问次数,默认 0
    count = request.session.get("visit_count", 0)
    # 加 1 后存回 session
    request.session["visit_count"] = count + 1
    return {"visit_count": count + 1}
\`\`\`

特点:
- 数据存在 Cookie(签名后),服务端无状态。
- 用户能解码看到内容(但改不了,签名校验失败会丢弃)。
- 受 4KB 限制,别存大数据(别存整个用户对象,只存 user_id)。
- \`secret_key\` 泄漏则可伪造,务必保密(用环境变量)。

**Session vs JWT**:
- Session(Cookie):服务端签名,浏览器自动带,适合传统 Web。
- JWT(Authorization Header):无状态,适合 API、移动端。

## 五、WSGIMiddleware 代理 WSGI 应用

FastAPI 是 ASGI 框架,但有些老应用是 WSGI(如 Flask、Django)。\`WSGIMiddleware\` 可以把 WSGI 应用挂到 FastAPI 下:

### Demo 4:FastAPI 中挂载 Flask 应用

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.wsgi 导入 WSGIMiddleware
# WSGIMiddleware:把 WSGI 应用(如 Flask/Django)包装成 ASGI,挂到 FastAPI 下
from fastapi.middleware.wsgi import WSGIMiddleware

# 假设有个 Flask 应用(需要 pip install flask)
# 实际运行需要安装 Flask
try:
    # 尝试导入 Flask,没装会抛 ImportError
    from flask import Flask as FlaskApp

    # 创建 Flask 应用
    # __name__ 是当前模块名,Flask 用它定位静态文件和模板
    flask_app = FlaskApp(__name__)

    # 用 @flask_app.route 装饰器注册 Flask 路由
    @flask_app.route("/flask/hello")
    def flask_hello():
        return "Hello from Flask!"

    @flask_app.route("/flask/time")
    def flask_time():
        import time
        return {"time": time.time()}
except ImportError:
    # 没装 Flask 就跳过,flask_app 设为 None
    flask_app = None

# 创建 FastAPI 应用
app = FastAPI()

# FastAPI 自己的路由
@app.get("/api/data")
def fastapi_data():
    return {"source": "FastAPI", "msg": "hello"}

# 把 Flask 挂到 /flask 路径下
# app.mount(path, app):把另一个应用挂到指定路径前缀下
# WSGIMiddleware(flask_app) 把 Flask(WSGI) 转成 ASGI,让 FastAPI 能调用
if flask_app:
    app.mount("/flask", WSGIMiddleware(flask_app))
    # 访问 /flask/hello 会走 Flask
    # 访问 /api/data 会走 FastAPI
\`\`\`

应用场景:迁移老项目时,FastAPI 做主应用,把老的 Flask/Django 应用挂进来,逐步迁移。

## 六、中间件的组合顺序

多个中间件的顺序很重要。**后注册的在更外层**(回顾上一章的洋葱模型)。

### Demo 5:中间件顺序对比

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.gzip 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
# 从 starlette.middleware.trustedhost 导入 TrustedHostMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
# 从 starlette.middleware.httpsredirect 导入 HTTPSRedirectMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 正确顺序(后加的更外层):
# 执行流:请求 → GZip(外) → CORS → TrustedHost(内) → 路由

# 1. 先加 TrustedHost(最内层,最先执行校验)
# 先注册的在内层,请求最后到达这层(但校验类要放内层,早点拒绝非法请求)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "myapp.com"],
)

# 2. 再加 CORS(中间层)
# 中间注册的在中间层,处理跨域头
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. 最后加 GZip(最外层,最后处理响应)
# 最后注册的在最外层,请求最先经过,响应最后处理(压缩最终响应)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 实际执行顺序:
# 请求 → GZip(外层进入) → CORS → TrustedHost → 路由
# 响应 → TrustedHost → CORS → GZip(外层出去,压缩最终响应)
\`\`\`

顺序原则:
- **请求校验类**(TrustedHost、认证)放内层,先执行,早点拒绝非法请求。
- **响应修改类**(GZip)放外层,最后处理,压缩最终响应。
- **CORS** 居中。

为什么 GZip 要在最外层?因为 GZip 压缩的是「最终响应」,如果它在内层,外层中间件加的头不会被压缩(其实头本来就不压缩,但逻辑上 GZip 应该是最后一步)。

## 七、实战:生产环境中间件组合

### Demo 6:生产级中间件配置

\`\`\`python
import os
import time
import logging
import uuid
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

app = FastAPI()

ENV = os.getenv("APP_ENV", "development")
IS_PROD = ENV == "production"

# === 中间件配置(从内到外依次添加)===

# 1. TrustedHost:校验 Host(最内层,先执行)
if IS_PROD:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["myapp.com", ".myapp.com"],
    )
else:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"],  # 开发环境允许所有
    )

# 2. Session:Cookie 会话
# SessionMiddleware 用 itsdangerous 签名 Cookie 存储 session 数据
app.add_middleware(
    SessionMiddleware,
    # secret_key:签名密钥,从环境变量读,开发用默认值
    secret_key=os.getenv("SESSION_SECRET", "dev-secret-change-in-prod"),
    # max_age:Session 过期时间(秒),14 天 = 14*24*3600
    max_age=14 * 24 * 3600,  # 14 天过期
    # same_site:SameSite 策略,防 CSRF
    # "lax":大部分跨域不带 Cookie,顶部导航带(默认推荐)
    same_site="lax",
    # https_only:生产环境只走 HTTPS(secure 属性)
    # 开发环境 False(HTTP 能用),生产 True(只 HTTPS)
    https_only=IS_PROD,       # 生产环境只走 HTTPS
)

# 3. CORS:跨域
if IS_PROD:
    origins = ["https://myapp.com", "https://www.myapp.com"]
else:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID", "X-Process-Time"],
    max_age=600,
)

# 4. 请求日志(自定义)
# 日志中间件:记录每个请求的方法、路径、状态码、耗时
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 生成 8 位短 UUID 作为请求 ID
        request_id = str(uuid.uuid4())[:8]
        # 存到 state,路由和其他中间件都能用
        request.state.request_id = request_id
        # 记录开始时间,用于计算耗时
        start = time.time()
        try:
            # 调用下游,拿到响应
            response = await call_next(request)
            # 计算耗时(秒)
            dur = time.time() - start
            # 记录 INFO 日志:请求ID、方法、路径、状态码、耗时
            logger.info(f"[{request_id}] {request.method} {request.url.path} {response.status_code} {dur:.3f}s")
            # 响应头加请求 ID,前端能关联
            response.headers["X-Request-ID"] = request_id
            # 响应头加耗时,方便排查慢请求
            response.headers["X-Process-Time"] = f"{dur:.4f}s"
            return response
        except Exception as e:
            # 下游抛异常,记录错误日志
            dur = time.time() - start
            logger.error(f"[{request_id}] {request.method} {request.url.path} 500 {dur:.3f}s {e}")
            # 重新抛出,让外层异常处理器处理
            raise

app.add_middleware(LoggingMiddleware)

# 5. HTTPS 跳转(生产环境)
if IS_PROD:
    app.add_middleware(HTTPSRedirectMiddleware)

# 6. GZip 压缩(最外层,最后处理响应)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# === 业务路由 ===
@app.get("/api/products")
def list_products():
    return [{"id": i, "name": f"商品{i}"} for i in range(100)]

@app.get("/api/health")
def health():
    return {"status": "ok", "env": ENV}
\`\`\`

执行顺序(请求从外到内):
\`\`\`
请求 → GZip → HTTPSRedirect → Logging → CORS → Session → TrustedHost → 路由
\`\`\`

## 八、GZip 的注意事项

### 8.1 压缩对 CPU 的影响

GZip 压缩消耗 CPU。高并发场景,如果每个响应都压缩,可能成为瓶颈。应对:
- \`minimum_size\` 设大一点(如 5000),只压缩大响应。
- 用 Nginx 压缩,而不是应用层压缩(Nginx 更高效)。
- 对已经压缩的格式(JPEG/PNG/MP4)不压缩(没效果还浪费 CPU)。

### 8.2 流式响应的压缩

\`\`\`python
from fastapi.responses import StreamingResponse

@app.get("/stream")
def stream():
    def generate():
        for i in range(100):
            yield f"data {i}\\n"
    # 流式响应 GZip 也能压缩,但效果可能不如整体压缩
    return StreamingResponse(generate(), media_type="text/plain")
\`\`\`

## 九、常见错误和避坑指南

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| GZip 压缩小文件 | 压缩头开销大,反而变大 | 设 \`minimum_size=1000\` |
| HTTPSRedirect 在开发开 | localhost 一直重定向 | 仅生产开 |
| SessionMiddleware \`secret_key\` 用默认 | 不安全,可伪造 | 用随机长字符串,环境变量 |
| TrustedHost 漏了 localhost | 本地访问 400 | 加 \`localhost\`、\`127.0.0.1\` |
| 中间件顺序乱 | GZip 在内层,压缩异常 | GZip 在最外层 |
| Session 存大数据 | 超 4KB Cookie 截断 | 只存 user_id,数据查库 |
| GZip 压缩二进制 | 没效果,浪费 CPU | 图片/视频不压 |
| 多个 \`secret_key\` | 重启后旧 Session 失效 | \`secret_key\` 固定,不要换 |
| WSGIMiddleware 性能 | WSGI 是同步,阻塞事件循环 | 尽量迁移到 ASGI |

## 十、内置中间件一览

| 中间件 | 作用 | 来源 |
|---|---|---|
| \`GZipMiddleware\` | GZip 压缩响应 | \`fastapi.middleware.gzip\` |
| \`CORSMiddleware\` | CORS 跨域 | \`fastapi.middleware.cors\` |
| \`TrustedHostMiddleware\` | 校验 Host 头 | \`starlette.middleware.trustedhost\` |
| \`HTTPSRedirectMiddleware\` | 强制 HTTPS | \`starlette.middleware.httpsredirect\` |
| \`SessionMiddleware\` | Cookie Session | \`starlette.middleware.sessions\` |
| \`WSGIMiddleware\` | 代理 WSGI 应用 | \`fastapi.middleware.wsgi\` |
| \`BaseHTTPMiddleware\` | 自定义中间件基类 | \`starlette.middleware.base\` |

注意:FastAPI 的中间件大多来自 Starlette,FastAPI 只是重新导出了常用的几个。

## 十一、设计思想

内置中间件覆盖了常见需求(压缩、Session、Host 校验、HTTPS 跳转、WSGI 代理),开箱即用。理解每个中间件的职责和顺序,合理组合,能解决大部分生产级需求。

不要重复造轮子——先用内置的,不够再自定义。配置时用环境变量区分环境,开发宽松、生产严格。中间件组合的核心是「顺序」:校验在内层(早点拒绝),修改在外层(最后处理)。想清楚洋葱模型,顺序就不会错。
`,
  },
  {
    id: "fa-custom-middleware",
    group: "中间件",
    icon: "🛠️",
    title: "自定义中间件实战",
    content: `
## 一、自定义中间件的两种写法对比

FastAPI/Starlette 提供两种写自定义中间件的方式:

### 1.1 BaseHTTPMiddleware 类(推荐,易用)

继承 \`BaseHTTPMiddleware\`,实现 \`dispatch\` 方法:

\`\`\`python
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI, Request

class MyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 请求前
        response = await call_next(request)
        # 响应后
        return response
\`\`\`

优点:简单易用,能 \`await call_next\`,能 try/except 捕获下游异常。
缺点:性能略低(内部用 anyio 跨任务传数据,有开销)。

### 1.2 纯 ASGI 中间件(性能更高)

实现 \`__call__\` 方法,直接操作 ASGI 接口:

\`\`\`python
from fastapi import FastAPI

class MyASGIMiddleware:
    def __init__(self, app):
        self.app = app  # 下游 ASGI 应用

    async def __call__(self, scope, receive, send):
        # scope: 请求元信息(类型、头、路径)
        # receive: 接收请求体的函数
        # send: 发送响应的函数

        # 请求前:可以改 scope
        await self.app(scope, receive, send)
        # 响应后:没法直接改(已发送)
\`\`\`

优点:性能最高(无 BaseHTTPMiddleware 的开销)。
缺点:写法复杂,不能直接 await response,改响应要包装 send。

### 对比

| 维度 | BaseHTTPMiddleware | 纯 ASGI |
|---|---|---|
| 易用性 | ⭐⭐⭐⭐⭐ 简单 | ⭐⭐ 复杂 |
| 性能 | ⭐⭐⭐ 略有开销 | ⭐⭐⭐⭐⭐ 最高 |
| 改响应 | 直接改 response | 包装 send |
| 捕获异常 | try/except | 难 |
| 适用 | 大多数场景 | 超高并发、简单中间件 |

经验:**先用 BaseHTTPMiddleware,性能不够再优化成纯 ASGI**。99% 的场景 BaseHTTPMiddleware 够用。

## 二、纯 ASGI 中间件(性能更高)

### Demo 1:纯 ASGI 中间件写法

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义纯 ASGI 中间件类
class TimingASGIMiddleware:
    """纯 ASGI 计时中间件,性能最高"""

    def __init__(self, app):
        # app 是下游 ASGI 应用
        self.app = app

    async def __call__(self, scope, receive, send):
        # scope 是字典,包含请求元信息
        # 只处理 HTTP 请求(lifespan、websocket 不处理)
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # 请求前:记录开始时间
        import time
        start = time.time()

        # 包装 send 函数,在响应头发送时加自定义头
        async def send_wrapper(message):
            # message 类型:http.response.start(响应头)或 http.response.body(响应体)
            if message["type"] == "http.response.start":
                # 响应头阶段:加自定义头
                headers = message.get("headers", [])
                duration = time.time() - start
                # headers 是字节列表 [(b"key", b"value"), ...]
                headers.append((b"x-process-time", f"{duration:.4f}s".encode()))
                message["headers"] = headers
            await send(message)

        # 调用下游应用,用包装后的 send
        await self.app(scope, receive, send_wrapper)

# 添加中间件
app.add_middleware(TimingASGIMiddleware)

@app.get("/")
def root():
    return {"msg": "hello"}
\`\`\`

为什么纯 ASGI 性能高?因为 \`BaseHTTPMiddleware\` 内部要把 ASGI 流转成 \`Request\` 对象,还要用 anyio 在不同任务间传数据,有开销。纯 ASGI 直接操作原始接口,无转换开销。

## 三、请求耗时统计中间件

### Demo 2:详细的耗时统计

\`\`\`python
# 导入 time 模块
import time
# 导入 logging 模块
import logging
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("timing")

# 定义耗时统计中间件
class TimingMiddleware(BaseHTTPMiddleware):
    """统计每个请求的耗时,按慢请求分级报警"""

    def __init__(self, app, slow_threshold: float = 1.0):
        super().__init__(app)
        # 慢请求阈值(秒),超过就警告
        self.slow_threshold = slow_threshold

    async def dispatch(self, request: Request, call_next):
        # 记录开始时间
        start = time.time()

        # 调用下游
        response = await call_next(request)

        # 计算耗时
        duration = time.time() - start
        method = request.method
        path = request.url.path

        # 写响应头
        response.headers["X-Process-Time"] = f"{duration:.4f}s"

        # 按耗时分级记录日志
        if duration > self.slow_threshold:
            # 慢请求:警告级别
            logger.warning(f"慢请求 {method} {path} {duration:.4f}s (阈值 {self.slow_threshold}s)")
        elif duration > 0.5:
            # 较慢:info 级别
            logger.info(f"较慢 {method} {path} {duration:.4f}s")
        else:
            # 正常:debug 级别(生产不输出)
            logger.debug(f"正常 {method} {path} {duration:.4f}s")

        return response

app = FastAPI()
# 慢请求阈值 1 秒
app.add_middleware(TimingMiddleware, slow_threshold=1.0)

@app.get("/")
def root():
    return {"msg": "快"}

@app.get("/medium")
def medium():
    time.sleep(0.6)  # 0.6 秒,较慢
    return {"msg": "中等"}

@app.get("/slow")
def slow():
    time.sleep(1.5)  # 1.5 秒,慢请求
    return {"msg": "慢"}
\`\`\`

## 四、请求 ID 注入中间件

给每个请求分配唯一 ID,贯穿日志、响应、下游调用,用于分布式追踪:

### Demo 3:请求 ID 中间件

\`\`\`python
# 导入 uuid 模块
import uuid
# 导入 logging 模块
import logging
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志,格式带 request_id
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(request_id)s] %(message)s"
)
logger = logging.getLogger("api")

# 用 Filter 把 request_id 注入日志记录
class RequestIdFilter(logging.Filter):
    def filter(self, record):
        # 从上下文取 request_id,没有就显示 "-"
        record.request_id = getattr(record, "request_id", "-")
        return True

logger.addFilter(RequestIdFilter())

# 请求 ID 中间件
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. 优先用上游传的 ID(链路追踪场景),没有就生成
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]

        # 2. 存到 state,路由和日志都能用
        request.state.request_id = request_id

        # 3. 调用下游
        response = await call_next(request)

        # 4. 响应头带上 ID,前端能关联
        response.headers["X-Request-ID"] = request_id
        return response

app = FastAPI()
app.add_middleware(RequestIDMiddleware)

@app.get("/")
def root(request: Request):
    # 路由里能拿到 request_id
    rid = request.state.request_id
    logger.info("处理根路径", extra={"request_id": rid})
    return {"request_id": rid}

@app.get("/error")
def error(request: Request):
    rid = request.state.request_id
    logger.error("发生错误", extra={"request_id": rid})
    raise ValueError("模拟错误")
\`\`\`

配合日志中间件,每条日志带 request_id,排查问题能串起整个请求链路。在分布式系统中,request_id 还可以传给下游服务(放在 HTTP 头里),实现全链路追踪。

## 五、限流中间件(令牌桶)

令牌桶算法:固定速率往桶里加令牌,请求消耗令牌,没令牌就拒绝。

### Demo 4:令牌桶限流中间件

\`\`\`python
# 导入 time 模块
import time
# 从 collections 导入 defaultdict
from collections import defaultdict
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 令牌桶类
class TokenBucket:
    """令牌桶:固定速率补充令牌,请求消耗令牌"""

    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity        # 桶容量(最多存多少令牌)
        self.refill_rate = refill_rate  # 每秒补充多少令牌
        self.tokens = capacity          # 当前令牌数,初始满
        self.last_refill = time.time()  # 上次补充时间

    def consume(self, n: int = 1) -> bool:
        """消耗 n 个令牌,返回是否成功"""
        # 1. 补充令牌(按时间差计算)
        now = time.time()
        elapsed = now - self.last_refill
        # 补充量 = 时间差 * 速率,不超过容量
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

        # 2. 消耗令牌
        if self.tokens >= n:
            self.tokens -= n
            return True
        return False

# 限流中间件
class RateLimitMiddleware(BaseHTTPMiddleware):
    """按 IP 限流,每个 IP 一个令牌桶"""

    def __init__(self, app, capacity: int = 100, refill_rate: float = 10):
        super().__init__(app)
        self.capacity = capacity        # 桶容量
        self.refill_rate = refill_rate  # 补充速率
        # 每个 IP 一个桶(defaultdict 自动创建)
        self.buckets = defaultdict(
            lambda: TokenBucket(capacity, refill_rate)
        )

    async def dispatch(self, request: Request, call_next):
        # 获取客户端 IP(实际可用 user_id 或 API key)
        client_ip = request.client.host if request.client else "unknown"
        bucket = self.buckets[client_ip]

        # 尝试消耗令牌
        if not bucket.consume():
            # 限流:返回 429
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "请求过于频繁,请稍后再试",
                    "retry_after": "1秒"
                },
                headers={
                    "Retry-After": "1",
                    "X-RateLimit-Limit": str(self.capacity),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # 放行,响应头带剩余令牌数
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.capacity)
        response.headers["X-RateLimit-Remaining"] = str(int(bucket.tokens))
        return response

app = FastAPI()
# 每个IP:桶容量100,每秒补充10个
app.add_middleware(RateLimitMiddleware, capacity=100, refill_rate=10)

@app.get("/")
def root():
    return {"msg": "ok"}

@app.get("/data")
def data():
    return {"data": "some data"}
\`\`\`

注意:这是单实例内存版,多实例部署要用 Redis 共享计数,否则每个实例独立限流,总阈值是 N 倍。

## 六、请求体大小限制

防止客户端发超大请求体(如上传几个 GB 的文件)拖垮服务器:

### Demo 5:请求体大小限制中间件

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 请求体大小限制中间件
class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """限制请求体大小,超过则拒绝"""

    def __init__(self, app, max_size: int = 1024 * 1024):
        super().__init__(app)
        # max_size 单位字节,默认 1MB
        self.max_size = max_size

    async def dispatch(self, request: Request, call_next):
        # 1. 检查 Content-Length 头(如果有)
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                if size > self.max_size:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": f"请求体过大({size}字节),最大允许 {self.max_size} 字节"
                        },
                    )
            except ValueError:
                pass  # Content-Length 不是数字,跳过

        # 2. 对于 chunked 传输(没有 Content-Length),需要在接收时检查
        # 这里简化处理,只检查 Content-Length
        # 完整实现需要包装 receive 函数,统计 body 大小

        # 放行
        response = await call_next(request)
        return response

app = FastAPI()
# 限制请求体最大 1MB
app.add_middleware(BodySizeLimitMiddleware, max_size=1024 * 1024)

@app.post("/upload")
async def upload(request: Request):
    body = await request.body()
    return {"size": len(body)}
\`\`\`

更严格的实现(检查实际 body 大小,防 chunked 绕过):

\`\`\`python
# 严格检查实际 body 大小的中间件
# 防止客户端用 chunked 传输绕过 Content-Length 检查
class StrictBodySizeMiddleware(BaseHTTPMiddleware):
    """严格检查实际 body 大小"""

    def __init__(self, app, max_size: int = 1024 * 1024):
        super().__init__(app)
        # max_size 单位字节,默认 1MB(1024*1024)
        self.max_size = max_size

    async def dispatch(self, request: Request, call_next):
        received = 0  # 已接收字节数,累加统计

        # 包装 receive 函数,统计 body 大小
        # ASGI 的 receive 函数返回 message 字典
        # 通过替换 request._receive,在下读取 body 时自动统计
        async def receive_wrapper():
            # nonlocal 声明修改外层变量 received
            nonlocal received
            # 调用原始 receive,拿到消息
            message = await request.receive()
            # http.request 类型消息包含请求体数据
            if message["type"] == "http.request":
                # body 是字节串,可能分多次到达(more_body=True)
                body = message.get("body", b"")
                received += len(body)
                # 超限,直接中断,抛异常
                if received > self.max_size:
                    raise ValueError("请求体过大")
            return message

        # 替换 request 的 receive 函数为包装版
        # 下游调用 request.body() 时会走我们的包装函数
        request._receive = receive_wrapper

        try:
            # 调用下游,如果 body 超限会抛 ValueError
            return await call_next(request)
        except ValueError as e:
            # 捕获超限异常,返回 413 Payload Too Large
            return JSONResponse(
                status_code=413,
                content={"detail": str(e)},
            )

app.add_middleware(StrictBodySizeMiddleware, max_size=1024 * 1024)
\`\`\`

## 七、中间件的测试方法

测试中间件有两种方式:用 \`TestClient\` 端到端测试,或直接测试中间件类。

### Demo 6:中间件测试

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 定义要测试的中间件
class HeaderMiddleware(BaseHTTPMiddleware):
    """给响应加自定义头的中间件"""

    def __init__(self, app, header_name: str, header_value: str):
        super().__init__(app)
        self.header_name = header_name
        self.header_value = header_value

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers[self.header_name] = self.header_value
        return response

# 创建应用
app = FastAPI()
app.add_middleware(HeaderMiddleware, header_name="X-Test", header_value="yes")

@app.get("/")
def root():
    return {"msg": "hello"}

# === 测试 ===

# 测试 1:验证响应头被正确添加
def test_header_added():
    client = TestClient(app)
    response = client.get("/")
    # 验证状态码
    assert response.status_code == 200
    # 验证自定义头
    assert response.headers["X-Test"] == "yes"
    # 验证响应体
    assert response.json() == {"msg": "hello"}

# 测试 2:验证所有路由都有头
def test_all_routes_have_header():
    client = TestClient(app)

    @app.get("/other")
    def other():
        return {"msg": "other"}

    response = client.get("/other")
    assert response.headers["X-Test"] == "yes"

# 测试 3:验证短路逻辑
class BlockMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.url.path == "/blocked":
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=403, content={"detail": "禁止访问"})
        return await call_next(request)

app2 = FastAPI()
app2.add_middleware(BlockMiddleware)

@app2.get("/blocked")
def blocked():
    return {"msg": "不应该看到"}

@app2.get("/ok")
def ok():
    return {"msg": "正常"}

def test_block():
    client = TestClient(app2)
    # 被拦截的路由
    r1 = client.get("/blocked")
    assert r1.status_code == 403
    assert r1.json() == {"detail": "禁止访问"}

    # 正常路由
    r2 = client.get("/ok")
    assert r2.status_code == 200
    assert r2.json() == {"msg": "正常"}

# 运行测试
if __name__ == "__main__":
    test_header_added()
    test_all_routes_have_header()
    test_block()
    print("所有测试通过!")
\`\`\`

测试要点:
- 用 \`TestClient\` 发请求,检查响应头、状态码、响应体。
- 测短路:验证被拦截时返回正确状态码。
- 测放行:验证正常路由不受影响。
- 测顺序:多中间件时,验证执行顺序符合预期。

## 八、实战:API 网关中间件组合

把前面学的组合起来,做一个 API 网关风格的中间件栈:

### Demo 7:API 网关中间件组合

\`\`\`python
# 导入必要模块
import time
import uuid
import logging
from collections import defaultdict, deque
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("gateway")

# === 1. 请求 ID 中间件(最外层,给所有请求分配 ID)===
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # 生成或复用请求 ID
        rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        request.state.request_id = rid
        # 调用下游
        response = await call_next(request)
        # 响应头带 ID
        response.headers["X-Request-ID"] = rid
        return response

# === 2. 限流中间件(令牌桶)===
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, capacity=100, refill_rate=10):
        super().__init__(app)
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.buckets = defaultdict(lambda: TokenBucket(capacity, refill_rate))

    async def dispatch(self, request, call_next):
        ip = request.client.host if request.client else "?"
        bucket = self.buckets[ip]
        if not bucket.consume():
            rid = getattr(request.state, "request_id", "?")
            logger.warning(f"[{rid}] 限流: {ip}")
            return JSONResponse(
                status_code=429,
                content={"detail": "请求过于频繁"},
                headers={"Retry-After": "1"},
            )
        return await call_next(request)

# 令牌桶类
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()

    def consume(self, n=1):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        if self.tokens >= n:
            self.tokens -= n
            return True
        return False

# === 3. 请求体大小限制 ===
class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_size=1024 * 1024):
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request, call_next):
        cl = request.headers.get("content-length")
        if cl:
            try:
                if int(cl) > self.max_size:
                    return JSONResponse(
                        status_code=413,
                        content={"detail": "请求体过大"},
                    )
            except ValueError:
                pass
        return await call_next(request)

# === 4. 日志中间件 ===
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = getattr(request.state, "request_id", "?")
        start = time.time()
        method = request.method
        path = request.url.path
        try:
            response = await call_next(request)
            dur = time.time() - start
            # 按状态码分级
            if response.status_code >= 500:
                logger.error(f"[{rid}] {method} {path} {response.status_code} {dur:.3f}s")
            elif response.status_code >= 400:
                logger.warning(f"[{rid}] {method} {path} {response.status_code} {dur:.3f}s")
            else:
                logger.info(f"[{rid}] {method} {path} {response.status_code} {dur:.3f}s")
            response.headers["X-Process-Time"] = f"{dur:.4f}s"
            return response
        except Exception as e:
            dur = time.time() - start
            logger.error(f"[{rid}] {method} {path} 500 {dur:.3f}s {e}")
            raise

# === 5. 异常处理中间件(最外层,捕获所有异常)===
class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            rid = getattr(request.state, "request_id", "?")
            logger.error(f"[{rid}] 未捕获异常: {type(e).__name__}: {e}")
            return JSONResponse(
                status_code=500,
                content={"detail": "服务器内部错误", "request_id": rid},
            )

# === 创建应用,组合中间件 ===
app = FastAPI()

# 添加顺序(后加的在最外层):
# 执行流:请求 → ErrorHandler → RequestID → Logging → BodyLimit → RateLimit → 路由
app.add_middleware(RateLimitMiddleware, capacity=100, refill_rate=10)
app.add_middleware(BodySizeLimitMiddleware, max_size=1024 * 1024)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(ErrorHandlerMiddleware)  # 最外层,捕获所有异常

# === 业务路由 ===
@app.get("/")
def root():
    return {"msg": "hello"}

@app.get("/error")
def error():
    # 模拟未捕获异常,会被 ErrorHandler 捕获
    raise ValueError("模拟错误")

@app.post("/data")
async def data(request: Request):
    body = await request.body()
    return {"size": len(body)}

@app.get("/slow")
def slow():
    time.sleep(1)
    return {"msg": "slow"}
\`\`\`

这个网关组合实现了:
- **请求 ID**:每个请求有唯一标识,贯穿日志。
- **限流**:每个 IP 100 请求/秒,超限返回 429。
- **请求体限制**:最大 1MB,超限返回 413。
- **日志**:记录每个请求的方法、路径、状态码、耗时。
- **异常处理**:未捕获异常返回 500,不暴露堆栈。

## 九、常见错误和避坑指南

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 限流单机内存 | 多实例失效 | 用 Redis 共享计数 |
| 异常处理中间件不在外层 | 漏抓异常 | 放最外层(最后添加) |
| \`request.state\` 属性未初始化访问 | \`AttributeError\` | 用 \`getattr(state, "x", default)\` |
| 中间件里读 body 后下游读不到 | 流已消费 | 重写 \`_receive\` 或避免读 |
| JWT 中间件无白名单 | 登录接口也要 token | 加 \`EXEMPT_PATHS\` |
| 限流 key 用 IP | NAT 后大量用户同 IP | 用 user_id 或 API key |
| 纯 ASGI 中间件忘判断 \`scope["type"]\` | lifespan 请求报错 | 只处理 \`http\` 类型 |
| \`BaseHTTPMiddleware\` 嵌套太深 | 性能下降 | 关键路径用纯 ASGI |
| 中间件里 \`time.sleep()\` | 阻塞事件循环 | 用 \`asyncio.sleep()\` |
| 测试没覆盖短路逻辑 | 上线后才发现拦截了正常请求 | 测拦截 + 测放行 |

## 十、中间件 vs 依赖:什么时候用什么

| 场景 | 用中间件 | 用依赖 |
|---|---|---|
| 全局日志 | ✅ | ❌ |
| 全局限流 | ✅ | ❌ |
| CORS | ✅ | ❌ |
| GZip 压缩 | ✅ | ❌ |
| 请求 ID 注入 | ✅ | ❌ |
| 认证(部分接口) | ❌(要白名单) | ✅(按需) |
| 权限校验 | ❌ | ✅ |
| 参数分页 | ❌ | ✅ |
| 数据库连接 | ❌ | ✅ |

核心原则:**全局的用中间件,局部的用依赖**。中间件是「一刀切」,依赖是「按需用」。

## 十一、设计思想

自定义中间件是实现「横切关注点」的利器。日志、限流、追踪、认证这些全局需求,放中间件最合适。但要克制——不要把所有逻辑都塞中间件,中间件应该**薄而专一**,只做一件事(单一职责原则)。

复杂的业务逻辑(如特定接口的权限)用依赖,不要硬塞中间件。中间件多了会影响性能和可维护性,适度使用。组合中间件时,想清楚洋葱模型:异常处理最外层(捕获所有),日志次外层(记录所有),限流内层(早点拒绝)。

中间件的测试很重要——它是全局的,一个 bug 会影响所有请求。用 \`TestClient\` 端到端测试,覆盖「放行」「短路」「异常」三种场景。生产前务必测透。
`,
  },
];
