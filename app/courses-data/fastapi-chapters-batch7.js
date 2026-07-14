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

### 生活类比:小区门口的保安亭

把你的 FastAPI 应用想象成一个小区,路由是小区里的一栋栋楼(业务功能),而中间件就是**小区门口的保安亭**:

- **请求前**:每辆车(请求)进小区前,保安要先检查(查证、登记、计时)——这是中间件的「请求前」阶段。
- **放行进入**:保安检查通过,抬杆放行,车开进去找楼——这是 \`call_next\` 调用,进入路由。
- **请求后**:车出来时,保安可能再登记一下离开时间——这是中间件的「响应后」阶段。
- **短路拦截**:如果车证不全,保安直接不让进,车掉头走——这是中间件「短路」返回 Response,不进路由。

小区可以有**多个保安亭**(多个中间件),从大门到楼栋要经过一串,每个都能拦你。这就是「洋葱模型」。

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

### 生活类比:穿衣服的顺序

洋葱模型就像**穿衣服**:你穿衣服是「内→外」(先穿内衣,再穿毛衣,最后穿外套),脱衣服是「外→内」(先脱外套,再脱毛衣,最后脱内衣)。

- 中间件注册顺序 = 穿衣顺序(先注册的在内衣,后注册的在外套)。
- 请求进来 = 别人看你,先看到外套(后注册的),最后看到内衣(先注册的)。
- 响应出去 = 你脱衣服给出去,先给外套,最后给内衣(顺序反过来了)。

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
# 先注册的中间件位于「洋葱」的内层,请求后到达、响应先返回
@app.middleware("http")
async def mw_a(request: Request, call_next):
    # 请求阶段(还未进入路由):此处位于内层,因此后执行
    print("A before")  # 请求前执行
    # call_next 把请求传给下一层(此处是路由),阻塞等待响应返回
    # 由于 A 在内层,call_next 实际是直接进入路由
    response = await call_next(request)  # 调用下一层
    # 响应阶段(路由已执行完):此处位于内层,因此先执行
    print("A after")   # 响应后执行
    return response

# 中间件 B:后注册,所以在更外层
# 后注册的中间件被包在更外层,请求先经过它,响应最后经过它
@app.middleware("http")
async def mw_b(request: Request, call_next):
    # 请求阶段(还未进入路由):此处位于外层,因此先执行
    print("B before")  # B 在外层,请求先到 B
    # call_next 把请求传给下一层(此处是 mw_a),阻塞等待响应返回
    response = await call_next(request)
    # 响应阶段(路由已执行完):此处位于外层,因此后执行
    print("B after")   # 响应后,B 后执行
    return response

@app.get("/")
def root():
    # 路由函数:位于洋葱最内层,在所有中间件的「请求前」之后执行
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

### Demo 3:三层中间件叠加验证(新增)

用三层中间件把「洋葱模型」看得更清楚,每层都加日志和响应头,最后看响应头顺序:

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建应用
app = FastAPI()

# 中间件 1:先注册(最内层)
# 先注册 = 内层 = 请求后到、响应先回
@app.middleware("http")
async def inner_mw(request: Request, call_next):
    # 请求阶段:内层后执行
    print("[内层] 请求前")
    # 调用下游(下一层是路由)
    response = await call_next(request)
    # 响应阶段:内层先执行
    print("[内层] 响应后")
    # 在响应头里追加标记,用 , 分隔避免覆盖
    # response.headers["X-Order"] 已存在时,直接赋值会覆盖
    # 这里用追加方式记录执行顺序
    response.headers["X-Order"] = response.headers.get("X-Order", "") + " inner-out"
    return response

# 中间件 2:第二个注册(中间层)
@app.middleware("http")
async def middle_mw(request: Request, call_next):
    print("[中层] 请求前")
    response = await call_next(request)
    print("[中层] 响应后")
    # 中层在响应阶段比内层后执行,所以追加在 inner-out 后面
    response.headers["X-Order"] = response.headers.get("X-Order", "") + " middle-out"
    return response

# 中间件 3:最后注册(最外层)
# 最后注册 = 外层 = 请求先到、响应最后回
@app.middleware("http")
async def outer_mw(request: Request, call_next):
    print("[外层] 请求前")
    response = await call_next(request)
    print("[外层] 响应后")
    # 外层在响应阶段最后执行,所以追加在最末
    response.headers["X-Order"] = response.headers.get("X-Order", "") + " outer-out"
    return response

@app.get("/")
def root():
    print("[路由] 执行")
    return {"msg": "ok"}
\`\`\`

访问 \`/\` 后:
- 控制台输出顺序:\`[外层] 请求前 → [中层] 请求前 → [内层] 请求前 → [路由] 执行 → [内层] 响应后 → [中层] 响应后 → [外层] 响应后\`
- 响应头 \`X-Order\` 值为:\`inner-out middle-out outer-out\`(响应阶段从内到外)

这清楚展示了「请求从外到内、响应从内到外」的洋葱流向。

### Demo 4:修改请求头和响应头(新增)

演示中间件「请求前改请求头、响应后改响应头」的双向修改能力:

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def header_modifier(request: Request, call_next):
    # === 请求前:修改请求头 ===
    # 注意:request.headers 是不可变对象(类似 Mapping),不能直接改
    # 要改请求头,需要改底层的 scope["headers"]
    # scope 是 ASGI 的请求元信息字典,headers 是 [(b"key", b"value"), ...] 列表

    # 拿到原始 headers 列表(字节列表)
    headers = dict(request.scope["headers"])
    # 加一个自定义请求头,标记「经过中间件」
    # key 和 value 都必须是 bytes
    headers[b"x-from-middleware"] = b"yes"
    # 转回列表(ASGI 规范要求 headers 是 list of tuples)
    request.scope["headers"] = list(headers.items())

    # === 调用下游 ===
    response = await call_next(request)

    # === 响应后:修改响应头 ===
    # response.headers 是可变的,可以直接赋值
    response.headers["X-Processed-By"] = "header-modifier"
    response.headers["X-Request-Method"] = request.method
    return response

@app.get("/")
def root(request: Request):
    # 路由里能读到中间件加的请求头
    # request.headers.get 大小写不敏感
    from_mw = request.headers.get("x-from-middleware", "no")
    return {"msg": "hello", "from_middleware": from_mw}
\`\`\`

访问 \`/\` 后:
- 响应体:\`{"msg": "hello", "from_middleware": "yes"}\`(说明请求头被中间件改了,路由能读到)。
- 响应头包含 \`X-Processed-By: header-modifier\` 和 \`X-Request-Method: GET\`(说明响应头被中间件加了)。

### Demo 5:条件性放行/拦截(新增)

演示中间件根据请求特征决定放行还是短路:

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse(用于构造短路响应)
from fastapi.responses import JSONResponse

app = FastAPI()

# 简单的 API Key 校验中间件(演示条件放行)
@app.middleware("http")
async def api_key_middleware(request: Request, call_next):
    # 健康检查接口放行,不校验
    if request.url.path == "/health":
        return await call_next(request)

    # 读请求头里的 X-API-Key
    api_key = request.headers.get("X-API-Key", "")
    # 校验 API Key(实际从配置/数据库读)
    if api_key != "secret-123":
        # 短路:直接返回 401,不进路由
        return JSONResponse(
            status_code=401,
            content={"detail": "无效的 API Key"},
            headers={"WWW-Authenticate": "ApiKey"},
        )

    # 校验通过,放行
    return await call_next(request)

@app.get("/health")
def health():
    # 不需要 API Key
    return {"status": "ok"}

@app.get("/data")
def data():
    # 需要 API Key
    return {"data": "secret"}
\`\`\`

测试:
- \`curl http://localhost:8000/health\` → 200(放行)
- \`curl http://localhost:8000/data\` → 401(缺 API Key)
- \`curl -H "X-API-Key: secret-123" http://localhost:8000/data\` → 200(校验通过)

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

### Demo 6:中间件和依赖的对比

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

### Demo 7:中间件读请求体的陷阱

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
| 直接改 \`request.headers\` | headers 是只读的 | 改 \`scope["headers"]\` |
| 中间件里 \`time.sleep()\` | 阻塞事件循环 | 用 \`asyncio.sleep()\` |

### Demo 8:中间件短路实现维护模式

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

## 十二、动手实验

### 实验 1:观察洋葱模型的响应头顺序

**目标**:验证多层中间件「响应阶段从内到外」的执行顺序。

**步骤**:
1. 写 3 个中间件(内、中、外),每个在响应阶段往 \`X-Order\` 头追加自己的名字。
2. 访问任意路由,用浏览器或 curl 看 \`X-Order\` 头的值。
3. 验证顺序是不是 \`inner → middle → outer\`。

**预期结果**:响应头 \`X-Order: inner-out middle-out outer-out\`。

**思考**:如果把注册顺序反过来,\`X-Order\` 会变成什么?

### 实验 2:实现一个简单的 IP 黑名单

**目标**:用中间件实现 IP 黑名单,被列出的 IP 直接返回 403。

**步骤**:
1. 维护一个 \`BLACKLIST = {"1.2.3.4"}\` 集合。
2. 写中间件,从 \`request.client.host\` 拿 IP,在黑名单里就返回 403。
3. 用 curl 测试(可以改 \`BLACKLIST\` 加上 \`127.0.0.1\` 验证)。

**参考代码**:
\`\`\`python
BLACKLIST = {"1.2.3.4", "5.6.7.8"}

@app.middleware("http")
async def blacklist_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else ""
    if client_ip in BLACKLIST:
        return JSONResponse(status_code=403, content={"detail": f"IP {client_ip} 已被封禁"})
    return await call_next(request)
\`\`\`

### 实验 3:验证中间件里读 body 的陷阱

**目标**:理解「中间件读 body 后路由读不到」的坑。

**步骤**:
1. 写一个中间件,\`await request.body()\` 读 body 但**不重写流**。
2. 写一个 POST 路由,也读 body。
3. 用 curl POST 数据,看路由是否报错或读到空 body。
4. 再改成「读 body + 重写 \`_receive\`」,验证路由能正常读到。

**思考**:为什么 \`request.body()\` 只能读一次?(提示:底层是流,消费完就没了。)

### 实验 4:对比中间件和依赖的执行

**目标**:理解中间件(全局)和依赖(局部)的区别。

**步骤**:
1. 写一个日志中间件,打印 \`中间件执行\`。
2. 写一个认证依赖,打印 \`依赖执行\`。
3. 写两个路由:\`/public\`(不用依赖)和 \`/secure\`(用依赖)。
4. 分别访问两个路由,观察控制台输出。

**预期**:
- 访问 \`/public\`:只打印 \`中间件执行\`。
- 访问 \`/secure\`:打印 \`中间件执行\` + \`依赖执行\`。

## 十三、设计思想

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

### 生活类比:跨小区访问需要门禁卡

把每个「源」(协议+域名+端口)想象成一个**小区**:

- **同源**:同一个小区里,你从 A 栋去 B 栋,自由进出,没人拦——浏览器允许同源访问。
- **跨域**:从甲小区去乙小区,门禁卡不通用,被保安拦——浏览器拦截跨域请求。
- **CORS**:乙小区物业发一张「授权门禁卡」(响应头 \`Access-Control-Allow-Origin\`),告诉保安「甲小区的人可以进」——服务器声明允许谁跨域。

关键点:CORS 是**乙小区(后端)授权**,不是甲小区(前端)自己说了算。前端没法绕过,必须后端配合。

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

### 生活类比:预检 = 提前打电话确认

- **简单请求**(GET):像去朋友家借东西,直接敲门,朋友给了就给,不给就不给——风险小,先做了再说。
- **非简单请求**(PUT/DELETE):像去朋友家搬家具,先打个电话问「我能搬吗?」(OPTIONS 预检),朋友说「可以,搬哪件都行」(\`Access-Control-Allow-Methods\`),你才真去搬——风险大,先问再做。
- **预检缓存**(\`max_age\`):朋友说「这周内不用再问,直接来搬」——下次不用打电话,直接搬。

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
# CORSMiddleware 会自动处理 OPTIONS 预检请求,无需手写路由
app.add_middleware(
    CORSMiddleware,
    # 1. allow_origins:允许的前端来源列表
    #    必须明确列出,不要用 ["*"](尤其是带 credentials 时)
    #    每项必须包含 协议+域名+端口 三要素,缺一不可
    allow_origins=[
        "http://localhost:3000",        # 本地开发
        "http://127.0.0.1:3000",        # 本地开发(IP 访问)
        # 注意:localhost 和 127.0.0.1 浏览器视为不同源,需分别列出
        "http://dev.mycompany.com",     # 测试环境
        "https://app.mycompany.com",    # 生产环境
        # 注意:http 和 https 也是不同源,生产环境必须用 https
    ],
    # 2. allow_credentials:是否允许带 Cookie 跨域
    #    True 时 allow_origins 不能是 ["*"](浏览器安全限制)
    #    如果用 JWT(放 Authorization 头)而非 Cookie,可以设为 False
    allow_credentials=True,
    # 3. allow_methods:允许的 HTTP 方法
    #    显式列出比 ["*"] 更清晰、更安全
    #    OPTIONS 必须列出:预检请求就是 OPTIONS 方法
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # 4. allow_headers:允许的请求头
    #    前端用到的自定义头都要列,否则预检会失败
    #    Authorization:JWT token 常用
    #    Content-Type:JSON 请求必须(application/json 是非简单请求)
    #    X-Request-ID:自定义链路追踪头
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    # 5. expose_headers:暴露给前端 JS 能读的响应头
    #    默认前端只能读"安全"头(Content-Type、Content-Length 等)
    #    自定义头必须 expose,前端 response.headers.get() 才能读到
    expose_headers=["X-Request-ID", "X-Total-Count", "X-Process-Time"],
    # 6. max_age:预检结果缓存秒数
    #    缓存期内浏览器不重复发 OPTIONS,减少请求
    #    600 秒=10 分钟,生产环境可适当调大(如 3600)
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

### Demo 4:通配符和 credentials 冲突复现(新增)

亲手复现这个经典错误,加深理解:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ❌ 错误配置:通配符 + credentials
# 这段代码不会报错(FastAPI 不校验),但前端调用会失败
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # 通配符
    allow_credentials=True,       # 又要带 Cookie → 冲突!
)

@app.get("/api/me")
def me():
    return {"user": "alice"}
\`\`\`

前端测试代码(放 \`http://localhost:3000\`):
\`\`\`javascript
// 带 Cookie 跨域请求
fetch("http://localhost:8000/api/me", {
    credentials: "include"  // 关键:带 Cookie
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error("CORS 错误:", e));
\`\`\`

**浏览器报错**:
\`\`\`
Access to fetch at 'http://localhost:8000/api/me' from origin 'http://localhost:3000'
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin'
header in the response must not be the wildcard '*' when the request's credentials
mode is 'include'.
\`\`\`

**修复**:把 \`["*"]\` 改成明确来源:
\`\`\`python
# ✅ 正确:明确来源 + credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 明确来源
    allow_credentials=True,                   # 允许带 Cookie
)
\`\`\`

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

### Demo 5:credentials 和通配符冲突演示

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

### Demo 6:CORS 调试中间件

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

### Demo 7:前后端分离完整示例

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

### Demo 8:生产环境完整 CORS 配置(新增,推荐模板)

这是一个可直接用于生产环境的完整配置模板,从环境变量读所有配置:

\`\`\`python
# 导入 os 模块,读环境变量
import os
# 导入 json 模块,解析环境变量里的 JSON 列表
import json
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.cors 导入 CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

# 创建应用
app = FastAPI()

# === 从环境变量读 CORS 配置 ===
# 这样无需改代码就能切换环境

# APP_ENV:环境标识(development / staging / production)
ENV = os.getenv("APP_ENV", "development")

# CORS_ORIGINS:允许的来源,JSON 数组格式
# 示例:CORS_ORIGINS='["https://app.com", "https://www.app.com"]'
# 开发环境默认值:本地几个常见端口
default_origins = (
    '["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]'
    if ENV == "development"
    else '["https://app.mycompany.com"]'
)
origins = json.loads(os.getenv("CORS_ORIGINS", default_origins))

# CORS_ALLOW_CREDENTIALS:是否允许带 Cookie
# JWT 模式可以 False,Cookie 模式必须 True
allow_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"

# CORS_MAX_AGE:预检缓存秒数,生产可调大(如 86400 = 1 天)
max_age = int(os.getenv("CORS_MAX_AGE", "600"))

# === 添加 CORS 中间件 ===
app.add_middleware(
    CORSMiddleware,
    # 来源列表:从环境变量读,生产环境必须是 https 正式域名
    allow_origins=origins,
    # 凭证:Cookie 模式必须 True;且 True 时 origins 不能是 ["*"]
    allow_credentials=allow_credentials,
    # 方法:显式列出,比 ["*"] 更安全
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # 头:列出前端实际会发的自定义头
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Trace-ID"],
    # 暴露给前端 JS 能读的响应头
    expose_headers=["X-Request-ID", "X-Total-Count", "X-Process-Time"],
    # 预检缓存:减少 OPTIONS 请求
    max_age=max_age,
)

# 启动时打印配置,方便确认
print(f"[CORS] ENV={ENV}")
print(f"[CORS] allow_origins={origins}")
print(f"[CORS] allow_credentials={allow_credentials}")
print(f"[CORS] max_age={max_age}")

# === 业务路由 ===
@app.get("/api/health")
def health():
    return {"status": "ok", "env": ENV}

@app.get("/api/users")
def list_users():
    return [{"id": 1, "name": "alice"}, {"id": 2, "name": "bob"}]
\`\`\`

部署时用环境变量覆盖:
\`\`\`bash
# 生产环境启动
APP_ENV=production \\
CORS_ORIGINS='["https://app.mycompany.com", "https://www.mycompany.com"]' \\
CORS_ALLOW_CREDENTIALS=true \\
CORS_MAX_AGE=86400 \\
uvicorn main:app --host 0.0.0.0 --port 8000
\`\`\`

## 十、CORS 和 Nginx 的冲突

如果 Nginx 反代已经加了 CORS 头,FastAPI 再加,响应头会重复:

\`\`\`
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Origin: http://localhost:3000  ← 重复!
\`\`\`

浏览器报错:"The 'Access-Control-Allow-Origin' header contains multiple values"。

解决:**只在一处配 CORS**。要么 Nginx 配,要么 FastAPI 配,不要都配。

### Demo 9:Nginx 反代 + CORS 的两种方案(新增)

**方案 A:Nginx 配 CORS,FastAPI 不配**(推荐,性能更好)

Nginx 配置:
\`\`\`nginx
server {
    listen 80;
    server_name api.mycompany.com;

    # CORS 配置在 Nginx
    location /api/ {
        # 允许的来源
        add_header Access-Control-Allow-Origin "https://app.mycompany.com" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        add_header Access-Control-Max-Age "600" always;

        # 处理 OPTIONS 预检请求,直接返回 204
        if ($request_method = OPTIONS) {
            return 204;
        }

        # 反代到 FastAPI
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

FastAPI 代码**不加** CORSMiddleware:
\`\`\`python
# FastAPI 不配 CORS(Nginx 已配)
app = FastAPI()

@app.get("/api/data")
def data():
    return {"msg": "ok"}
\`\`\`

**方案 B:FastAPI 配 CORS,Nginx 不配**(适合 FastAPI 直接对外)

Nginx 配置(只反代,不加 CORS 头):
\`\`\`nginx
server {
    listen 80;
    server_name api.mycompany.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        # 透传 Origin 头给 FastAPI
        proxy_set_header Origin $http_origin;
    }
}
\`\`\`

FastAPI 配 CORS(见 Demo 8)。

**选择建议**:
- 单体 FastAPI 直接对外 → 方案 B(FastAPI 配)。
- Nginx 前置反代 + 多后端 → 方案 A(Nginx 配,统一管理)。
- **绝不要两边都配**,否则响应头重复,浏览器报错。

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
| \`localhost\` 和 \`127.0.0.1\` 混用 | 浏览器视为不同源 | 都列出来 |
| http 和 https 混用 | 不同源 | 生产环境必须 https |
| 端口漏写 | 不匹配 | 必须带端口(非默认端口时) |
| CORS 配置加在路由之后 | 不生效 | 中间件要在路由定义前 add |

## 十二、动手实验

### 实验 1:复现 CORS 错误并修复

**目标**:亲手触发一次 CORS 错误,再用后端配置修复。

**步骤**:
1. 写一个**不带** CORS 的 FastAPI 应用,跑在 8000 端口。
2. 写一个简单 HTML 页面(放 3000 端口,用 \`python -m http.server 3000\`),用 \`fetch\` 调 8000 的 API。
3. 用浏览器打开 \`http://localhost:3000\`,看控制台报 CORS 错误。
4. 在 FastAPI 加 \`CORSMiddleware\`,allow_origins 设 \`["http://localhost:3000"]\`。
5. 刷新页面,验证请求成功。

**预期**:第 3 步报「CORS policy」错;第 5 步正常返回数据。

### 实验 2:观察预检请求

**目标**:看到浏览器发出的 OPTIONS 预检请求。

**步骤**:
1. FastAPI 配好 CORS(allow_methods 包含 PUT)。
2. 前端发一个 PUT 请求(带 \`Content-Type: application/json\`),这会触发预检。
3. 打开浏览器 DevTools → Network,找 OPTIONS 请求。
4. 看 OPTIONS 请求头(\`Origin\`、\`Access-Control-Request-Method\`)和响应头(\`Access-Control-Allow-*\`)。

**思考**:为什么 GET 请求没有 OPTIONS 预检?(提示:GET 是简单请求。)

### 实验 3:测试 credentials 冲突

**目标**:验证 \`["*"]\` + \`credentials=True\` 会失败。

**步骤**:
1. FastAPI 配 \`allow_origins=["*"]\` + \`allow_credentials=True\`。
2. 前端用 \`fetch(url, {credentials: "include"})\` 调用。
3. 看浏览器报错。
4. 把 \`allow_origins\` 改成 \`["http://localhost:3000"]\`,再试。

**预期**:第 3 步报 wildcard 错;第 4 步成功。

### 实验 4:测试 expose_headers

**目标**:理解前端读不到未 expose 的响应头。

**步骤**:
1. FastAPI 配 CORS,**不设** \`expose_headers\`。
2. 写一个路由,响应头加 \`X-Custom-Header: hello\`。
3. 前端 \`fetch\` 后用 \`response.headers.get("X-Custom-Header")\` 读。
4. 看 console 打印的是 \`null\`(读不到)。
5. 加上 \`expose_headers=["X-Custom-Header"]\`,再试,能读到 \`hello\`。

**预期**:第 4 步 \`null\`;第 5 步 \`hello\`。

## 十三、设计思想

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

### 生活类比:压缩行李箱

把响应传输想象成**寄快递**:

- **不压缩**:你把蓬松的羽绒服直接塞箱子里寄,箱子很大,运费贵(响应体大,占带宽)。
- **GZip 压缩**:用真空袋把羽绒服抽气压缩,箱子小多了,运费便宜(响应体小,传输快)。
- **浏览器解压**:快递到了,你打开真空袋,羽绒服恢复原状(浏览器收到 gzip 数据,自动解压,内容不变)。
- **minimum_size**:只压大件(响应 > 1000 字节才压),小件(一根笔)不值得压——真空袋本身有成本,小东西压完可能更大。

关键:GZip 是「传输时压缩」,不是「存储时压缩」。服务器存的是原始数据,传输时压一下,到了浏览器再解压。

### Demo 1:GZip 压缩示例

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.middleware.gzip 导入 GZipMiddleware
# GZipMiddleware:自动压缩响应体,减少网络传输量
from fastapi.middleware.gzip import GZipMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()

# 添加 GZip 中间件
# minimum_size=1000:小于 1000 字节的响应不压缩
# 为什么不压小文件?因为 GZip 压缩头本身有几十字节开销
# 小文件压缩后体积可能不降反升,且浪费 CPU
# 推荐值 500~1000,根据实际响应大小调整
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/big")
def big():
    # 大 JSON 响应会被自动 GZip 压缩
    # ["item"] * 1000 是 Python 列表乘法,生成 1000 个 "item" 元素的列表
    # 原始大小约 10KB,压缩后约 500 字节(压缩率约 95%)
    # 文本类数据(重复字符多)压缩率极高,二进制数据(图片/视频)几乎不压缩
    return {"data": ["item"] * 1000}

@app.get("/small")
def small():
    # 小响应不压缩(小于 minimum_size)
    # 响应体仅 14 字节,小于 1000 字节阈值,GZip 中间件直接跳过
    return {"msg": "hi"}

@app.get("/list")
def list_items():
    # 返回 1000 个对象,压缩效果显著
    # 列表推导式:[表达式 for 变量 in 可迭代对象]
    # 生成 [{"id": 0, "name": "item-0", "value": 0}, ..., {"id": 999, ...}]
    # f"item-{i}" 是 f-string 格式化,把 i 的值嵌入字符串
    # 原始约 30KB,压缩后约 3KB
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

### Demo 2:对比不同内容的压缩率(新增)

不同类型的内容压缩率差异巨大,这个 demo 直观展示:

\`\`\`python
# 导入 FastAPI
from fastapi import FastAPI
# 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware
# 导入 random,生成随机数据
import random
import string

app = FastAPI()
# 阈值设小一点(100),方便小响应也压缩
app.add_middleware(GZipMiddleware, minimum_size=100)

# 1. 高度重复的文本(压缩率极高)
@app.get("/repeat")
def repeat_text():
    # "a" * 5000 生成 5000 个 a,高度重复
    # GZip 对重复内容压缩率可达 99%
    # 原始 5KB,压缩后可能只有几十字节
    return {"text": "a" * 5000}

# 2. 随机字符串(压缩率低)
@app.get("/random")
def random_text():
    # 随机字符几乎无法压缩(信息熵高)
    # ''.join(...) 拼接 5000 个随机字母
    # random.choices 从字母表随机选 5000 个
    # 原始 5KB,压缩后可能还是 4KB+(几乎不压)
    chars = ''.join(random.choices(string.ascii_letters, k=5000))
    return {"text": chars}

# 3. 结构化 JSON(压缩率中等)
@app.get("/structured")
def structured():
    # 结构化 JSON:有重复的 key 名,但 value 不同
    # 列表推导式生成 100 个用户对象
    # 原始约 3KB,压缩后约 1KB(压缩率约 60%)
    return [
        {"id": i, "name": f"user-{i}", "email": f"user-{i}@example.com", "age": 20 + i % 50}
        for i in range(100)
    ]

# 4. 二进制数据(图片,几乎不压缩)
@app.get("/binary")
def binary():
    # 模拟已压缩的二进制(如 JPEG)
    # bytes(random.randbytes(5000)) 生成 5000 字节随机二进制
    # 已经压缩过的数据再压 GZip 几乎没效果
    return {"data": random.randbytes(5000).hex()}
\`\`\`

用 curl 测试对比(带 gzip vs 不带):
\`\`\`bash
# 重复文本:压缩率 ~99%
curl -s -H "Accept-Encoding: gzip" http://localhost:8000/repeat -o /dev/null -w "%{size_download}\n"
curl -s http://localhost:8000/repeat -o /dev/null -w "%{size_download}\n"

# 随机文本:压缩率 ~5%
curl -s -H "Accept-Encoding: gzip" http://localhost:8000/random -o /dev/null -w "%{size_download}\n"
curl -s http://localhost:8000/random -o /dev/null -w "%{size_download}\n"
\`\`\`

**结论**:
- 重复度越高,压缩率越高(文本 > JSON > 随机数据)。
- 已压缩的二进制(JPEG/PNG/MP4)几乎不压缩,别浪费 CPU。
- 纯文本 API 响应(JSON)通常压缩率 60%-90%,值得开 GZip。

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

### Demo 3:强制 HTTPS 跳转

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

### Demo 4:Session 中间件使用

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

### Demo 5:FastAPI 中挂载 Flask 应用

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

### Demo 6:中间件顺序对比

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

### Demo 7:中间件顺序错误演示(新增)

这个 demo 演示「顺序错了会出什么问题」:

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()

# ❌ 错误顺序:日志中间件在 GZip 内层
# 这会导致日志记录的耗时是「压缩前」的,而非「压缩后」的完整耗时

# 日志中间件(先注册 = 内层)
@app.middleware("http")
async def logging_mw(request: Request, call_next):
    import time
    start = time.time()
    # 调用下游(可能是路由或其他中间件)
    response = await call_next(request)
    dur = time.time() - start
    # 注意:这里的 dur 不包含 GZip 压缩时间(因为 GZip 在外层)
    print(f"[日志] {request.method} {request.url.path} {response.status_code} {dur:.4f}s")
    return response

# GZip 后注册(外层)
app.add_middleware(GZipMiddleware, minimum_size=100)

@app.get("/big")
def big():
    return {"data": ["item"] * 1000}
\`\`\`

执行顺序:\`请求 → GZip(外) → 日志(内) → 路由 → 日志(响应) → GZip(响应,压缩)\`。

**问题**:日志记录的 \`dur\` 不包含 GZip 压缩时间。如果 GZip 压缩耗时 50ms,日志显示 100ms,但实际客户端等了 150ms。

**修复**:把日志放外层(后注册):
\`\`\`python
# ✅ 正确顺序:日志在 GZip 外层
# 先注册 GZip(内层)
app.add_middleware(GZipMiddleware, minimum_size=100)

# 后注册日志(外层)
@app.middleware("http")
async def logging_mw(request: Request, call_next):
    import time
    start = time.time()
    response = await call_next(request)  # 这里的 call_next 包含 GZip
    dur = time.time() - start
    # 这里的 dur 包含了 GZip 压缩时间,更准确
    print(f"[日志] {request.method} {request.url.path} {response.status_code} {dur:.4f}s")
    return response
\`\`\`

**经验**:想记录「客户端真实等待时间」,日志要在最外层(最后注册)。

## 七、实战:生产环境中间件组合

### Demo 8:生产级中间件配置

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

### Demo 9:自定义响应头中间件(新增)

结合 GZip,演示一个「给所有响应加版本头」的中间件:

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware
# 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# 自定义中间件:给所有响应加版本和构建信息
class VersionHeaderMiddleware(BaseHTTPMiddleware):
    """在每个响应头里加上 API 版本和构建时间"""

    def __init__(self, app, version: str = "1.0.0", build_time: str = "2024-01-01"):
        super().__init__(app)
        # 版本号,实际从配置或环境变量读
        self.version = version
        # 构建时间,实际在 CI/CD 时注入
        self.build_time = build_time

    async def dispatch(self, request: Request, call_next):
        # 调用下游拿响应
        response = await call_next(request)
        # 加版本头,方便前端/运维确认后端版本
        response.headers["X-API-Version"] = self.version
        response.headers["X-Build-Time"] = self.build_time
        # 加一个幂等 ID(每次请求不同),用于排查
        import uuid
        response.headers["X-Request-ID"] = str(uuid.uuid4())[:8]
        return response

# 中间件顺序(后加的在外层):
# 1. 先加 VersionHeader(内层)
app.add_middleware(VersionHeaderMiddleware, version="2.1.3", build_time="2024-06-15")
# 2. 再加 GZip(外层,最后压缩)
app.add_middleware(GZipMiddleware, minimum_size=100)

@app.get("/")
def root():
    return {"msg": "hello"}

@app.get("/big")
def big():
    return {"data": list(range(1000))}
\`\`\`

访问任意接口,响应头会有:
\`\`\`
X-API-Version: 2.1.3
X-Build-Time: 2024-06-15
X-Request-ID: a1b2c3d4
Content-Encoding: gzip  # 大响应才有
\`\`\`

**应用场景**:前端看到 \`X-API-Version\` 知道后端版本,出问题时能快速定位是哪个版本引入的 bug。

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
| GZip 压缩已压缩数据 | 浪费 CPU,体积不降 | 对 JPEG/PNG 跳过 |
| 日志在 GZip 内层 | 耗时不准 | 日志放外层 |
| TrustedHost 用 \`["*"]\` 上线 | 安全风险 | 生产明确列出 |

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

## 十一、动手实验

### 实验 1:测量 GZip 压缩效果

**目标**:量化 GZip 对不同内容的压缩率。

**步骤**:
1. 写 4 个路由,分别返回:重复文本、随机文本、结构化 JSON、大二进制。
2. 用 curl 分别测带 gzip 和不带 gzip 的响应大小。
3. 计算压缩率 = (原始 - 压缩) / 原始 × 100%。
4. 填表对比。

**预期结果**:
| 内容类型 | 原始大小 | 压缩后 | 压缩率 |
|---|---|---|---|
| 重复文本("a"*5000) | ~5KB | ~50B | ~99% |
| 随机文本 | ~5KB | ~5KB | ~5% |
| 结构化 JSON(100用户) | ~3KB | ~1KB | ~65% |
| 随机二进制 | ~5KB | ~5KB | ~0% |

### 实验 2:验证中间件顺序对日志耗时的影响

**目标**:理解「日志在 GZip 内层 vs 外层」对耗时记录的差异。

**步骤**:
1. 写一个日志中间件,记录 \`start\` 和 \`end\` 之间的耗时。
2. 场景 A:日志先注册(内层),GZip 后注册(外层)。访问大响应,看日志记录的耗时。
3. 场景 B:GZip 先注册(内层),日志后注册(外层)。访问同样响应,看耗时。
4. 对比两个耗时,差异就是 GZip 压缩时间。

**思考**:哪个耗时更接近客户端真实等待时间?(答:外层日志。)

### 实验 3:TrustedHost 拒绝非法 Host

**目标**:验证 TrustedHostMiddleware 能拒绝伪造的 Host。

**步骤**:
1. 配置 \`allowed_hosts=["localhost", "127.0.0.1"]\`。
2. 用 curl 正常访问:\`curl http://localhost:8000/\`,应返回 200。
3. 用 curl 伪造 Host:\`curl -H "Host: evil.com" http://localhost:8000/\`,应返回 400。
4. 加 \`example.com\` 到 allowed_hosts,再用伪造 Host 试,验证通过。

**预期**:第 3 步返回 400 Bad Request;第 4 步返回 200。

### 实验 4:Session 跨请求保持

**目标**:验证 SessionMiddleware 能跨请求保持状态。

**步骤**:
1. 配置 SessionMiddleware。
2. 写 \`/visit\` 路由,每次访问把 \`visit_count\` 加 1 并返回。
3. 用 curl 带 Cookie jar 访问多次:
   \`\`\`bash
   curl -c cookies.txt http://localhost:8000/visit  # 第 1 次,存 cookie
   curl -b cookies.txt http://localhost:8000/visit  # 第 2 次,带 cookie
   curl -b cookies.txt http://localhost:8000/visit  # 第 3 次
   \`\`\`
4. 观察返回的 \`visit_count\` 是否递增(1, 2, 3)。

**预期**:\`visit_count\` 递增,说明 session 跨请求保持了。

## 十二、设计思想

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

### 生活类比:自定义安检通道

把自定义中间件想象成**机场的安检通道**:

- **BaseHTTPMiddleware**(类写法):像标准的安检通道,有固定的流程框架(登机牌 → 行李过机 → 金属探测),你只需在框架里填具体规则。简单易用,但流程固定,灵活性一般。
- **纯 ASGI 中间件**:像自己从零搭一个安检通道,从传送带到 X 光机都自己装。性能最高(没有框架开销),但要自己处理所有细节(改响应要包装 \`send\` 函数)。

选择建议:99% 场景用 BaseHTTPMiddleware(够用且简单),只有超高并发或特殊需求才用纯 ASGI。

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
# 纯 ASGI 中间件不继承任何基类,直接实现 __call__ 协议
# 性能最高,因为不经过 BaseHTTPMiddleware 的 Request 对象转换开销
class TimingASGIMiddleware:
    """纯 ASGI 计时中间件,性能最高"""

    def __init__(self, app):
        # app 是下游 ASGI 应用(FastAPI 会自动传入被包装的应用)
        # 中间件链:外层中间件.__call__ → 内层中间件.__call__ → ... → 路由
        self.app = app

    # __call__ 是 ASGI 协议的核心方法
    # ASGI 应用必须是可调用对象,接收三个参数
    async def __call__(self, scope, receive, send):
        # scope 是字典,包含请求元信息
        # scope["type"] 可能值:"http"(HTTP请求)、"websocket"(WS连接)、"lifespan"(应用生命周期)
        # 只处理 HTTP 请求(lifespan、websocket 不处理)
        if scope["type"] != "http":
            # 非 HTTP 请求直接透传给下游,不做任何处理
            await self.app(scope, receive, send)
            return

        # 请求前:记录开始时间
        import time
        start = time.time()

        # 包装 send 函数,在响应头发送时加自定义头
        # 为什么包装 send?因为纯 ASGI 中间件拿不到 Response 对象
        # 只能通过拦截 send 函数来修改响应
        async def send_wrapper(message):
            # ASGI 协议中,响应通过两个消息发送:
            # message 类型:http.response.start(响应头,含状态码和 headers)
            #             http.response.body(响应体,二进制数据)
            if message["type"] == "http.response.start":
                # 响应头阶段:加自定义头
                # headers 是字节列表 [(b"key", b"value"), ...]
                # 注意:ASGI 规范要求 header 的 key 和 value 都是 bytes,不是 str
                headers = message.get("headers", [])
                duration = time.time() - start
                # b"x-process-time" 是 bytes 字面量
                # f"{duration:.4f}s".encode() 把 str 转 bytes(默认 UTF-8)
                headers.append((b"x-process-time", f"{duration:.4f}s".encode()))
                message["headers"] = headers
            # 调用原始 send,把修改后的消息发出去
            await send(message)

        # 调用下游应用,用包装后的 send 替换原始 send
        # 下游应用调用 send 时,实际执行的是我们的 send_wrapper
        await self.app(scope, receive, send_wrapper)

# 添加中间件
# add_middleware 会把当前 app 包进 TimingASGIMiddleware,形成新的 app
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

### Demo 3:慢请求告警中间件(新增,生产可用)

这个中间件在慢请求时不仅记日志,还模拟发送告警(实际可对接钉钉/企业微信):

\`\`\`python
# 导入 time
import time
# 导入 logging
import logging
# 导入 collections.deque,用于滑动窗口统计
from collections import deque
# 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alert")

# 慢请求告警中间件
class SlowRequestAlertMiddleware(BaseHTTPMiddleware):
    """慢请求告警:超过阈值记日志,并触发告警(模拟)"""

    def __init__(self, app, threshold: float = 2.0, window_size: int = 60):
        super().__init__(app)
        # threshold:慢请求阈值(秒),超过就告警
        self.threshold = threshold
        # window_size:统计窗口(秒),用于检测慢请求突增
        self.window_size = window_size
        # recent_slow:最近 window_size 秒内的慢请求时间戳队列
        # deque maxlen=None 表示无上限,我们手动清理
        self.recent_slow = deque()

    async def dispatch(self, request: Request, call_next):
        start = time.time()
        try:
            response = await call_next(request)
        except Exception:
            # 异常也统计耗时
            dur = time.time() - start
            if dur > self.threshold:
                self._check_alert(request, dur)
            raise

        dur = time.time() - start
        # 慢请求判断
        if dur > self.threshold:
            # 记录慢请求日志
            logger.warning(
                f"慢请求 {request.method} {request.url.path} 耗时 {dur:.3f}s "
                f"(阈值 {self.threshold}s)"
            )
            # 触发告警检查
            self._check_alert(request, dur)

        # 响应头加耗时
        response.headers["X-Process-Time"] = f"{dur:.4f}s"
        return response

    def _check_alert(self, request: Request, dur: float):
        """检查是否需要触发告警(慢请求突增)"""
        now = time.time()
        # 把当前慢请求时间戳加入队列
        self.recent_slow.append(now)
        # 清理过期的(超过 window_size 秒的)
        # while 循环从左(旧)往右清理,直到第一个在窗口内
        while self.recent_slow and self.recent_slow[0] < now - self.window_size:
            self.recent_slow.popleft()

        # 如果窗口内慢请求超过 5 次,触发告警
        if len(self.recent_slow) >= 5:
            # 实际这里调用钉钉/企业微信/邮件 webhook
            # 这里用 logger.error 模拟
            logger.error(
                f"告警!最近 {self.window_size}s 内有 {len(self.recent_slow)} 次慢请求"
                f"(>{self.threshold}s),可能存在性能问题"
            )
            # 清空队列,避免重复告警(实际可用冷却时间)
            self.recent_slow.clear()

app = FastAPI()
# 阈值 1 秒,窗口 60 秒
app.add_middleware(SlowRequestAlertMiddleware, threshold=1.0, window_size=60)

@app.get("/fast")
def fast():
    return {"msg": "快"}

@app.get("/slow")
def slow():
    # 模拟慢请求
    time.sleep(1.2)
    return {"msg": "慢"}
\`\`\`

连续访问 \`/slow\` 5 次以上,会触发告警日志:\`告警!最近 60s 内有 5 次慢请求\`。

## 四、请求 ID 注入中间件

给每个请求分配唯一 ID,贯穿日志、响应、下游调用,用于分布式追踪:

### Demo 4:请求 ID 中间件

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

## 五、结构化日志中间件(新增)

生产环境通常用 JSON 格式日志,方便 ELK/Loki 等日志系统解析:

### Demo 5:结构化 JSON 日志中间件

\`\`\`python
# 导入 time
import time
# 导入 uuid
import uuid
# 导入 json
import json
# 导入 logging
import logging
# 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 自定义 JSON 格式的日志 Formatter
class JsonFormatter(logging.Formatter):
    """把日志记录格式化成 JSON,方便日志系统解析"""

    def format(self, record):
        # 构造日志字典
        log_data = {
            # 时间戳(ISO 格式)
            "timestamp": self.formatTime(record),
            # 日志级别
            "level": record.levelname,
            # 日志消息
            "message": record.getMessage(),
            # logger 名字
            "logger": record.name,
        }
        # 如果有 request_id(extra 注入的),加上
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        # 如果有 method/path/duration(自定义字段),加上
        for field in ("method", "path", "status", "duration", "client_ip"):
            if hasattr(record, field):
                log_data[field] = getattr(record, field)
        # 转成 JSON 字符串
        return json.dumps(log_data, ensure_ascii=False)

# 配置 logger
logger = logging.getLogger("api")
logger.setLevel(logging.INFO)
# 创建 handler 并设置 JSON formatter
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)

# 结构化日志中间件
class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """记录结构化 JSON 日志,方便 ELK/Loki 采集"""

    # 不记日志的路径
    SKIP_PATHS = {"/health", "/favicon.ico", "/metrics"}

    async def dispatch(self, request: Request, call_next):
        # 跳过健康检查
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        # 请求前:生成 request_id,记录开始时间
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start = time.time()
        # 拿请求信息
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        try:
            response = await call_next(request)
            status = response.status_code
        except Exception as e:
            # 异常:记 error 日志
            duration = time.time() - start
            logger.error(
                "请求异常",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "status": 500,
                    "duration": round(duration, 4),
                    "client_ip": client_ip,
                }
            )
            raise

        # 正常:按状态码分级
        duration = time.time() - start
        extra = {
            "request_id": request_id,
            "method": method,
            "path": path,
            "status": status,
            "duration": round(duration, 4),
            "client_ip": client_ip,
        }
        if status >= 500:
            logger.error("服务器错误", extra=extra)
        elif status >= 400:
            logger.warning("客户端错误", extra=extra)
        else:
            logger.info("请求完成", extra=extra)

        # 响应头加 request_id 和耗时
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{duration:.4f}s"
        return response

app = FastAPI()
app.add_middleware(StructuredLoggingMiddleware)

@app.get("/")
def root():
    return {"msg": "hello"}

@app.get("/error")
def error():
    raise ValueError("模拟错误")

@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

日志输出示例(JSON 格式):
\`\`\`
{"timestamp": "2024-06-15 12:00:00", "level": "INFO", "message": "请求完成", "logger": "api", "request_id": "a1b2c3d4", "method": "GET", "path": "/", "status": 200, "duration": 0.0023, "client_ip": "127.0.0.1"}
{"timestamp": "2024-06-15 12:00:01", "level": "ERROR", "message": "请求异常", "logger": "api", "request_id": "e5f6g7h8", "method": "GET", "path": "/error", "status": 500, "duration": 0.0015, "client_ip": "127.0.0.1"}
\`\`\`

这种 JSON 日志能直接被 ELK(Elasticsearch + Logstash + Kibana)或 Loki + Grafana 解析,按 request_id 搜索,按耗时排序,按状态码过滤,排查问题极方便。

## 六、限流中间件(令牌桶)

令牌桶算法:固定速率往桶里加令牌,请求消耗令牌,没令牌就拒绝。

### Demo 6:令牌桶限流中间件

\`\`\`python
# 导入 time 模块
import time
# 从 collections 导入 defaultdict
# defaultdict:访问不存在的 key 时自动调用工厂函数创建默认值
# 这里用 lambda 创建新的 TokenBucket,省去手动初始化
from collections import defaultdict
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.middleware.base 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 令牌桶类
# 令牌桶算法:固定速率往桶里加令牌,请求消耗令牌,没令牌就拒绝
# 相比固定窗口计数器,令牌桶能应对突发流量(桶里有存量的令牌)
class TokenBucket:
    """令牌桶:固定速率补充令牌,请求消耗令牌"""

    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity        # 桶容量(最多存多少令牌)
        # capacity 决定能应对多大突发流量
        # 例如 capacity=100,允许瞬间 100 个并发请求
        self.refill_rate = refill_rate  # 每秒补充多少令牌
        # refill_rate 决定长期平均速率
        # 例如 refill_rate=10,长期平均每秒最多 10 个请求
        self.tokens = capacity          # 当前令牌数,初始满
        self.last_refill = time.time()  # 上次补充时间

    def consume(self, n: int = 1) -> bool:
        """消耗 n 个令牌,返回是否成功"""
        # 1. 补充令牌(按时间差计算)
        # 这种「惰性补充」不需要后台线程,只在 consume 时计算
        now = time.time()
        elapsed = now - self.last_refill  # 距上次补充的秒数
        # 补充量 = 时间差 * 速率,不超过容量
        # min() 确保令牌数不超过桶容量(防止溢出)
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

        # 2. 消耗令牌
        if self.tokens >= n:
            self.tokens -= n
            return True   # 令牌足够,放行
        return False      # 令牌不足,拒绝

# 限流中间件
class RateLimitMiddleware(BaseHTTPMiddleware):
    """按 IP 限流,每个 IP 一个令牌桶"""

    def __init__(self, app, capacity: int = 100, refill_rate: float = 10):
        super().__init__(app)
        self.capacity = capacity        # 桶容量
        self.refill_rate = refill_rate  # 补充速率
        # 每个 IP 一个桶(defaultdict 自动创建)
        # defaultdict 访问不存在的 key 时,自动调用 lambda 创建新桶
        # 这样第一次访问的 IP 也会得到一个满桶令牌
        self.buckets = defaultdict(
            lambda: TokenBucket(capacity, refill_rate)
        )

    async def dispatch(self, request: Request, call_next):
        # 获取客户端 IP(实际可用 user_id 或 API key)
        # request.client 是 Client 对象,host 是 IP 地址
        # 注意:NAT/代理后,多个用户可能共享同一 IP,此时用 IP 限流不准确
        client_ip = request.client.host if request.client else "unknown"
        bucket = self.buckets[client_ip]

        # 尝试消耗令牌
        if not bucket.consume():
            # 限流:返回 429 Too Many Requests
            # 429 是 HTTP 标准的限流状态码
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "请求过于频繁,请稍后再试",
                    "retry_after": "1秒"
                },
                headers={
                    # Retry-After 告诉客户端多久后重试(秒)
                    "Retry-After": "1",
                    # X-RateLimit-* 是非标准头,给前端展示限流信息
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
# 含义:允许瞬间 100 个突发请求,长期平均每秒 10 个
app.add_middleware(RateLimitMiddleware, capacity=100, refill_rate=10)

@app.get("/")
def root():
    return {"msg": "ok"}

@app.get("/data")
def data():
    return {"data": "some data"}
\`\`\`

注意:这是单实例内存版,多实例部署要用 Redis 共享计数,否则每个实例独立限流,总阈值是 N 倍。

## 七、IP 白名单中间件(新增)

只允许白名单内的 IP 访问,适用于内网 API、管理后台:

### Demo 7:IP 白名单中间件

\`\`\`python
# 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 JSONResponse
from fastapi.responses import JSONResponse
# 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
# 导入 ipaddress,做 IP 段匹配
import ipaddress

# IP 白名单中间件
class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """IP 白名单:只允许指定 IP/网段访问"""

    def __init__(self, app, allowed_ips: list, allowed_cidrs: list = None):
        super().__init__(app)
        # allowed_ips:精确匹配的 IP 列表,如 ["127.0.0.1", "192.168.1.100"]
        self.allowed_ips = set(allowed_ips)
        # allowed_cidrs:允许的网段列表,如 ["10.0.0.0/8", "172.16.0.0/12"]
        # ipaddress.ip_network 把字符串转成网络对象,用于判断 IP 是否在网段内
        self.allowed_cidrs = [
            ipaddress.ip_network(cidr) for cidr in (allowed_cidrs or [])
        ]

    async def dispatch(self, request: Request, call_next):
        # 拿客户端 IP
        # request.client 是 Client 对象,host 是 IP 字符串
        client_ip = request.client.host if request.client else ""

        # 健康检查放行(避免监控被拦)
        if request.url.path == "/health":
            return await call_next(request)

        # 检查是否在白名单
        if not self._is_allowed(client_ip):
            # 不在白名单,返回 403
            return JSONResponse(
                status_code=403,
                content={"detail": f"IP {client_ip} 不在白名单"},
            )

        # 放行
        return await call_next(request)

    def _is_allowed(self, ip: str) -> bool:
        """检查 IP 是否在白名单"""
        # 1. 精确匹配
        if ip in self.allowed_ips:
            return True
        # 2. 网段匹配
        try:
            # ipaddress.ip_address 把字符串转成 IP 对象
            ip_obj = ipaddress.ip_address(ip)
            # 遍历所有允许的网段,看 IP 是否在某个网段内
            for cidr in self.allowed_cidrs:
                # in 操作符判断 IP 是否在网段内
                if ip_obj in cidr:
                    return True
        except ValueError:
            # IP 格式非法(不是有效 IPv4/IPv6)
            return False
        return False

app = FastAPI()
# 配置白名单:允许 127.0.0.1 和 192.168.0.0/16 网段
app.add_middleware(
    IPWhitelistMiddleware,
    # 精确 IP:本机回环
    allowed_ips=["127.0.0.1", "::1"],
    # 网段:192.168.x.x 内网都允许
    allowed_cidrs=["192.168.0.0/16", "10.0.0.0/8"],
)

@app.get("/")
def root():
    return {"msg": "你通过了白名单"}

@app.get("/health")
def health():
    # 健康检查不受白名单限制
    return {"status": "ok"}

@app.get("/admin")
def admin():
    # 管理接口,只有白名单 IP 能访问
    return {"msg": "管理后台"}
\`\`\`

测试:
- 本机访问(\`127.0.0.1\`):放行。
- 局域网访问(\`192.168.1.x\`):放行。
- 外网访问(\`8.8.8.8\`):返回 403。

**应用场景**:
- 内网管理后台:只允许公司内网访问。
- 监控接口:只允许 Prometheus 服务器访问 \`/metrics\`。
- 灰度发布:只允许测试 IP 访问新版本。

## 八、请求体大小限制

防止客户端发超大请求体(如上传几个 GB 的文件)拖垮服务器:

### Demo 8:请求体大小限制中间件

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

## 九、中间件的测试方法

测试中间件有两种方式:用 \`TestClient\` 端到端测试,或直接测试中间件类。

### Demo 9:中间件测试

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

## 十、多中间件叠加验证(新增)

把前面学的多个中间件组合起来,验证它们按预期顺序执行:

### Demo 10:中间件叠加执行验证

\`\`\`python
# 导入 time
import time
# 导入 uuid
import uuid
# 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 JSONResponse
from fastapi.responses import JSONResponse
# 导入 BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# 1. 请求 ID 中间件(最外层,最后注册)
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # 生成 request_id
        rid = str(uuid.uuid4())[:8]
        request.state.request_id = rid
        print(f"[RequestID] 请求前,rid={rid}")
        response = await call_next(request)
        print(f"[RequestID] 响应后")
        response.headers["X-Request-ID"] = rid
        return response

# 2. 日志中间件(中间层)
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = getattr(request.state, "request_id", "?")
        start = time.time()
        print(f"[Logging] 请求前,rid={rid}")
        response = await call_next(request)
        dur = time.time() - start
        print(f"[Logging] 响应后,耗时={dur:.4f}s")
        response.headers["X-Process-Time"] = f"{dur:.4f}s"
        return response

# 3. 限流中间件(最内层,最先注册)
class SimpleRateLimitMiddleware(BaseHTTPMiddleware):
    """简单的内存限流,演示用"""
    def __init__(self, app, max_requests=100):
        super().__init__(app)
        self.max_requests = max_requests
        self.request_counts = {}  # ip -> count
        self.window_start = time.time()

    async def dispatch(self, request, call_next):
        print("[RateLimit] 请求前")
        # 简化限流:每 60 秒重置
        now = time.time()
        if now - self.window_start > 60:
            self.request_counts.clear()
            self.window_start = now
        ip = request.client.host if request.client else "?"
        self.request_counts[ip] = self.request_counts.get(ip, 0) + 1
        if self.request_counts[ip] > self.max_requests:
            print("[RateLimit] 拦截(超限)")
            return JSONResponse(status_code=429, content={"detail": "限流"})
        response = await call_next(request)
        print("[RateLimit] 响应后")
        return response

# === 创建应用,组合中间件 ===
app = FastAPI()

# 添加顺序(后加的在外层):
# 1. 先加 RateLimit(最内层)
app.add_middleware(SimpleRateLimitMiddleware, max_requests=100)
# 2. 再加 Logging(中间层)
app.add_middleware(LoggingMiddleware)
# 3. 最后加 RequestID(最外层)
app.add_middleware(RequestIDMiddleware)

# 执行流:
# 请求 → RequestID(外) → Logging → RateLimit(内) → 路由
# 响应 → RateLimit → Logging → RequestID(外) → 客户端

@app.get("/")
def root():
    print("[路由] 执行")
    return {"msg": "ok"}
\`\`\`

访问 \`/\` 后,控制台输出顺序:
\`\`\`
[RequestID] 请求前,rid=a1b2c3d4
[Logging] 请求前,rid=a1b2c3d4
[RateLimit] 请求前
[路由] 执行
[RateLimit] 响应后
[Logging] 响应后,耗时=0.0023s
[RequestID] 响应后
\`\`\`

响应头会有:
- \`X-Request-ID: a1b2c3d4\`(RequestID 中间件加的)
- \`X-Process-Time: 0.0023s\`(Logging 中间件加的)

**验证点**:
1. \`request_id\` 能从 RequestID 中间件传到 Logging 中间件(通过 \`request.state\`)。
2. 日志的耗时包含 RateLimit 和路由的执行时间(因为 Logging 在 RateLimit 外层)。
3. 请求前顺序:外→内;响应后顺序:内→外。

## 十一、实战:API 网关中间件组合

把前面学的组合起来,做一个 API 网关风格的中间件栈:

### Demo 11:API 网关中间件组合

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
        rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        request.state.request_id = rid
        response = await call_next(request)
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

## 十二、常见错误和避坑指南

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
| IP 白名单用 \`==\` 匹配网段 | 无法匹配网段 | 用 \`ipaddress\` 模块 |
| 令牌桶不清理过期 IP | 内存泄漏 | 定期清理不活跃 IP |
| 慢请求告警无冷却 | 重复告警刷屏 | 加冷却时间或清空队列 |

## 十三、中间件 vs 依赖:什么时候用什么

| 场景 | 用中间件 | 用依赖 |
|---|---|---|
| 全局日志 | ✅ | ❌ |
| 全局限流 | ✅ | ❌ |
| CORS | ✅ | ❌ |
| GZip 压缩 | ✅ | ❌ |
| 请求 ID 注入 | ✅ | ❌ |
| IP 白名单 | ✅ | ❌ |
| 认证(部分接口) | ❌(要白名单) | ✅(按需) |
| 权限校验 | ❌ | ✅ |
| 参数分页 | ❌ | ✅ |
| 数据库连接 | ❌ | ✅ |

核心原则:**全局的用中间件,局部的用依赖**。中间件是「一刀切」,依赖是「按需用」。

## 十四、动手实验

### 实验 1:实现 IP 黑名单中间件

**目标**:用中间件实现 IP 黑名单,被列出的 IP 直接返回 403。

**步骤**:
1. 维护一个 \`BLACKLIST = {"1.2.3.4"}\` 集合。
2. 写中间件,从 \`request.client.host\` 拿 IP,在黑名单里就返回 403。
3. 用 curl 测试(可以改 \`BLACKLIST\` 加上 \`127.0.0.1\` 验证)。

**参考代码**:
\`\`\`python
BLACKLIST = {"1.2.3.4", "5.6.7.8"}

@app.middleware("http")
async def blacklist_mw(request: Request, call_next):
    ip = request.client.host if request.client else ""
    if ip in BLACKLIST:
        return JSONResponse(status_code=403, content={"detail": f"IP {ip} 已被封禁"})
    return await call_next(request)
\`\`\`

### 实验 2:实现请求计时中间件

**目标**:记录每个请求的耗时,慢请求(>1s)打印警告。

**步骤**:
1. 写中间件,记录 \`start\` 和 \`end\` 时间。
2. 耗时 > 1s 用 \`logger.warning\`,否则 \`logger.info\`。
3. 写两个路由:\`/fast\`(立即返回)和 \`/slow\`(sleep 1.5s)。
4. 访问两个路由,看日志级别差异。

**预期**:\`/fast\` 打印 INFO,\`/slow\` 打印 WARNING。

### 实验 3:实现 IP 白名单中间件

**目标**:只允许白名单 IP 访问,其他返回 403。

**步骤**:
1. 写中间件,允许 \`127.0.0.1\` 和 \`192.168.0.0/16\` 网段。
2. 用 \`ipaddress\` 模块做网段匹配。
3. 用 curl 本机访问(应通过)。
4. 想办法模拟外网访问(如改 \`allowed_ips\` 排除 \`127.0.0.1\`),验证返回 403。

**思考**:为什么健康检查接口要放行?(提示:监控探针可能来自非白名单 IP。)

### 实验 4:验证多中间件叠加顺序

**目标**:验证多个中间件的执行顺序符合洋葱模型。

**步骤**:
1. 写 3 个中间件(A、B、C),每个在请求前和响应后打印日志。
2. 按 A → B → C 顺序注册(A 先,C 后)。
3. 访问任意路由,看控制台输出顺序。
4. 验证:请求前 C→B→A,响应后 A→B→C。

**预期输出**:
\`\`\`
C before
B before
A before
路由执行
A after
B after
C after
\`\`\`

### 实验 5:测试中间件短路

**目标**:验证中间件短路时不进路由。

**步骤**:
1. 写一个中间件,路径为 \`/blocked\` 时返回 403。
2. 写 \`/blocked\` 路由,里面打印 \`"路由执行"\`。
3. 访问 \`/blocked\`,看是否返回 403 且控制台**没有**打印 \`"路由执行"\`。

**预期**:返回 403,控制台无 \`"路由执行"\`(说明路由没执行)。

## 十五、设计思想

自定义中间件是实现「横切关注点」的利器。日志、限流、追踪、认证这些全局需求,放中间件最合适。但要克制——不要把所有逻辑都塞中间件,中间件应该**薄而专一**,只做一件事(单一职责原则)。

复杂的业务逻辑(如特定接口的权限)用依赖,不要硬塞中间件。中间件多了会影响性能和可维护性,适度使用。组合中间件时,想清楚洋葱模型:异常处理最外层(捕获所有),日志次外层(记录所有),限流内层(早点拒绝)。

中间件的测试很重要——它是全局的,一个 bug 会影响所有请求。用 \`TestClient\` 端到端测试,覆盖「放行」「短路」「异常」三种场景。生产前务必测透。
`,
  },
];

