// =============================================================
// Batch 8：异常处理（4 章）
// 29. exc-http    HTTPException
// 30. exc-custom  自定义异常与处理器
// 31. exc-handler 全局异常处理
// 32. exc-practice 异常处理最佳实践
// =============================================================

export const chapters = [
  {
    id: "exc-http",
    group: "异常处理",
    icon: "⚠️",
    title: "HTTPException",
    content: `
## 一、HTTPException 主动抛出 HTTP 错误

业务逻辑里,资源不存在、权限不够、参数错误,都需要返回对应 HTTP 错误码。FastAPI 提供 \`HTTPException\` 来主动抛出 HTTP 错误:

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 定义字典 items
    items = {1: "apple", 2: "banana"}
    # 条件判断：如果 item_id not in items
    if item_id not in items:
        # 抛出 404 错误
        # 抛出 HTTPException 异常: status_code=404, detail="商品不存在"
        raise HTTPException(status_code=404, detail="商品不存在")
    # 返回 {"item": items[item_id]}
    return {"item": items[item_id]}
\`\`\`

请求不存在的 \`/items/99\`,响应:
\`\`\`json
{
  "detail": "商品不存在"
}
\`\`\`
状态码 404。

## 二、status_code 和 detail

\`HTTPException\` 两个核心参数:

- **status_code**:HTTP 状态码(404/403/400 等)。
- **detail**:错误详情,可以是字符串、dict、list,会被序列化为 JSON。

\`\`\`python
# 字符串详情
# 抛出 HTTPException 异常: 404, "商品不存在"
raise HTTPException(404, "商品不存在")

# dict 详情(更丰富的错误信息)
# 抛出 HTTPException 异常: 404, detail={"error": "not_found", "item_id": 99}
raise HTTPException(404, detail={"error": "not_found", "item_id": 99})

# list 详情
# 抛出 HTTPException 异常: 400, detail=["字段 A 错误", "字段 B 错误"]
raise HTTPException(400, detail=["字段 A 错误", "字段 B 错误"])
\`\`\`

响应体会被包在 \`detail\` 字段里:
\`\`\`json
{"detail": {"error": "not_found", "item_id": 99}}
\`\`\`

## 三、常用错误码

| 码 | 名称 | 何时用 |
|---|---|---|
| 400 | Bad Request | 请求格式/业务逻辑错误 |
| 401 | Unauthorized | 未登录 |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突(重复创建) |
| 422 | Unprocessable Entity | 字段校验失败 |
| 429 | Too Many Requests | 限流 |

FastAPI 默认的 422(请求体校验失败)也是用类似机制,只是自动触发。

## 四、raise HTTPException 后 FastAPI 自动返回

\`raise HTTPException\` 后,FastAPI 会:
1. 中断当前函数执行(像普通异常一样)。
2. 捕获这个异常,转成 JSON 响应。
3. 状态码用 status_code,响应体 \`{"detail": ...}\`。

这意味着你**不需要 try/except** 处理它,直接 raise 就行,FastAPI 接管后续。

\`\`\`python
# 定义 GET 路由：访问 /users/{uid} 时触发
@app.get("/users/{uid}")
# 定义函数 get_user，参数: uid: int
def get_user(uid: int):
    # 定义变量 user，赋值为 db.find(uid)
    user = db.find(uid)
    # 条件判断：如果 not user
    if not user:
        # raise 后函数直接结束,不会执行后面的 return
        # 抛出 HTTPException 异常: 404, "用户不存在"
        raise HTTPException(404, "用户不存在")
    # 只有 user 存在才会到这
    # 返回 user
    return user
\`\`\`

## 五、headers 参数

有些状态码需要特定响应头。最典型的是 401,要带 \`WWW-Authenticate\` 头告诉客户端怎么认证:

\`\`\`python
# 定义 GET 路由：访问 /secure 时触发
@app.get("/secure")
# 定义函数 secure，参数: token: str
def secure(token: str):
    # 条件判断：如果 token != "valid"
    if token != "valid":
        # 抛出 HTTPException 异常
        raise HTTPException(
            # 定义变量 status_code，赋值为 401,
            status_code=401,
            # 定义变量 detail，赋值为 "无效的认证凭证",
            detail="无效的认证凭证",
            # 定义字典 headers
            headers={"WWW-Authenticate": "Bearer"},
        # )
        )
    # 返回 {"msg": "ok"}
    return {"msg": "ok"}
\`\`\`

\`WWW-Authenticate: Bearer\` 告诉客户端「用 Bearer token 认证」。这是 HTTP 规范要求的,有些客户端(如浏览器原生认证弹窗)会读这个头。

## 六、和普通 Exception 的区别

\`\`\`python
# HTTPException:FastAPI 专门处理,转成 JSON 错误响应
# 抛出 HTTPException 异常: 404, "不存在"
raise HTTPException(404, "不存在")
# → 404 {"detail": "不存在"}

# 普通 Exception:FastAPI 不专门处理,默认转成 500
# 抛出 ValueError 异常: "不存在"
raise ValueError("不存在")
# → 500 {"detail": "Internal Server Error"}
\`\`\`

区别:
- **HTTPException**:带状态码,被 FastAPI 的默认 HTTPException 处理器捕获,返回对应状态码。
- **普通 Exception**:不带状态码,默认 500,且 detail 是通用 "Internal Server Error"(不暴露具体信息,安全)。

所以:**业务错误用 HTTPException,意外错误(BUG)才用普通 Exception**。

## 七、HTTPException 不被全局处理器捕获(除非显式)

重要细节:\`HTTPException\` 和它的子类 \`StarletteHTTPException\` **有默认处理器**,如果你注册了 \`@app.exception_handler(Exception)\`(捕获所有),它**不会**捕获 HTTPException。

这是因为 FastAPI 内部对 HTTPException 有专门的处理器,优先级高于通用 Exception 处理器。这样设计是为了让你能放心 raise HTTPException,不用担心被通用兜底改写。

如果想让自定义处理器处理 HTTPException,要显式注册:
\`\`\`python
# 装饰器：app.exception_handler
@app.exception_handler(HTTPException)
# 定义异步函数 custom_http_exc_handler，参数: request, exc
async def custom_http_exc_handler(request, exc):
    # 返回 JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
\`\`\`

## 八、完整示例:资源不存在抛 404

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 模拟数据库
# 字段 db，类型: dict[int, Item]，默认值: {
db: dict[int, Item] = {
    # 字段 1，类型: Item(id，默认值: 1, name="苹果", price=5.0),
    1: Item(id=1, name="苹果", price=5.0),
    # 字段 2，类型: Item(id，默认值: 2, name="香蕉", price=3.0),
    2: Item(id=2, name="香蕉", price=3.0),
# }
}

# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}", response_model=Item)
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 1. 查不到抛 404
    # 定义变量 item，赋值为 db.get(item_id)
    item = db.get(item_id)
    # 条件判断：如果 not item
    if not item:
        # 抛出 HTTPException 异常
        raise HTTPException(
            # 定义变量 status_code，赋值为 404,
            status_code=404,
            # 定义变量 detail，赋值为 f"商品 {item_id} 不存在",
            detail=f"商品 {item_id} 不存在",
        # )
        )
    # 返回 item
    return item

# 定义 POST 路由：访问 /items 时触发
@app.post("/items", response_model=Item, status_code=201)
# 定义函数 create_item，参数: item: Item
def create_item(item: Item):
    # 2. 已存在抛 409 冲突
    # 条件判断：如果 item.id in db
    if item.id in db:
        # 抛出 HTTPException 异常
        raise HTTPException(
            # 定义变量 status_code，赋值为 409,
            status_code=409,
            # 定义字典 detail
            detail={"error": "conflict", "reason": f"商品 {item.id} 已存在"},
        # )
        )
    # db[item.id] = item
    db[item.id] = item
    # 返回 item
    return item

# 定义 DELETE 路由：访问 /items/{item_id} 时触发
@app.delete("/items/{item_id}", status_code=204)
# 定义函数 delete_item，参数: item_id: int
def delete_item(item_id: int):
    # 3. 不存在抛 404
    # 条件判断：如果 item_id not in db
    if item_id not in db:
        # 抛出 HTTPException 异常: 404, f"商品 {item_id} 不存在"
        raise HTTPException(404, f"商品 {item_id} 不存在")
    # del db[item_id]
    del db[item_id]
    # 返回 None
    return None
\`\`\`

## 九、HTTPException 的传播

HTTPException 可以在依赖、子函数里 raise,会向上传播:

\`\`\`python
# 定义函数 get_item_or_404，参数: item_id: int
def get_item_or_404(item_id: int):
    # 定义变量 item，赋值为 db.get(item_id)
    item = db.get(item_id)
    # 条件判断：如果 not item
    if not item:
        # 抛出 HTTPException 异常: 404, "不存在"
        raise HTTPException(404, "不存在")
    # 返回 item
    return item

# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 子函数抛的 HTTPException 会传播到这里,被 FastAPI 捕获
    # 定义变量 item，赋值为 get_item_or_404(item_id)
    item = get_item_or_404(item_id)
    # 返回 item
    return item
\`\`\`

这种「辅助函数抛异常」模式很常用,避免每个路由都写 if-raise。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 用普通 Exception 替代 HTTPException | 变成 500 | 业务错误用 HTTPException |
| 忘了 raise,只 return HTTPException | 不生效 | 必须 raise |
| detail 用裸 dict | 会被包在 detail 里 | 知道这是 FastAPI 行为 |
| 401 忘带 WWW-Authenticate | 不规范 | 加 headers |
| 用 HTTPException 传 500 | 500 应该是意外,不该主动 | 500 留给未捕获异常 |
| status_code 用非标准码 | 客户端不认 | 用标准 HTTP 码 |

## 十一、设计思想

HTTPException 是「业务错误」的标准表达方式。它把「这是用户的问题(4xx)」和「这是服务器的 BUG(5xx)」区分开。raise HTTPException 是声明式的——你不返回错误,而是抛出错误,让框架统一处理。这符合「错误是流程的一部分」的理念,比 return error dict 更清晰。
`,
  },
  {
    id: "exc-custom",
    group: "异常处理",
    icon: "🎨",
    title: "自定义异常与处理器",
    content: `
## 一、为什么用自定义异常

\`HTTPException\` 通用,但有时不够:

1. **业务语义**:抛 \`BusinessError\` 比 \`HTTPException(400)\` 更能表达「这是业务规则违反」。
2. **携带上下文**:异常类可以带自定义属性(错误码、关联资源 ID 等)。
3. **统一格式**:多个业务异常可以由一个处理器统一格式化。
4. **类型清晰**:\`raise UnicornException()\` 比裸数字有类型语义。

FastAPI 支持自定义异常 + 处理器,实现业务级错误处理。

## 二、自定义异常类

继承 \`Exception\`:

\`\`\`python
# 定义类 UnicornException，继承 Exception
class UnicornException(Exception):
    # 定义函数 __init__，参数: self, name: str
    def __init__(self, name: str):
        # self.name = name
        self.name = name
        # 调用父类初始化(可选,但推荐)
        # 调用 super()
        super().__init__(f"独角兽 {name} 不存在")
\`\`\`

异常类就是普通 Python 类,可以带任意属性。这些属性在处理器里能用。

## 三、@app.exception_handler 注册处理器

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义类 UnicornException，继承 Exception
class UnicornException(Exception):
    # 定义函数 __init__，参数: self, name: str
    def __init__(self, name: str):
        # self.name = name
        self.name = name

# 注册处理器:捕获 UnicornException 时执行
# 装饰器：app.exception_handler
@app.exception_handler(UnicornException)
# 定义异步函数 unicorn_exception_handler，参数: request: Request, exc: UnicornException
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    # exc 是抛出的异常实例,能访问其属性
    # 返回 JSONResponse(
    return JSONResponse(
        status_code=418,  # I'm a teapot(示例用,实际按业务选码)
        # 定义字典 content
        content={"msg": f"哎呀,{exc.name} 出问题了"},
    # )
    )

# 定义 GET 路由：访问 /unicorns/{name} 时触发
@app.get("/unicorns/{name}")
# 定义函数 get_unicorn，参数: name: str
def get_unicorn(name: str):
    # 条件判断：如果 name == "yolo"
    if name == "yolo":
        # 抛出自定义异常,处理器会接管
        # 抛出 UnicornException 异常: name=name
        raise UnicornException(name=name)
    # 返回 {"name": name}
    return {"name": name}
\`\`\`

请求 \`/unicorns/yolo\`:
- 抛 \`UnicornException(name="yolo")\`。
- FastAPI 捕获,找到注册的处理器。
- 执行 \`unicorn_exception_handler\`,返回 418 \`{"msg":"哎呀,yolo 出问题了"}\`。

## 四、处理器签名

\`\`\`python
# 定义异步函数 handler，返回: Response
async def handler(request: Request, exc: SomeException) -> Response:
    # ...
    ...
\`\`\`

- \`request: Request\` —— 当前请求,可以拿 URL、method 等。
- \`exc: SomeException\` —— 被捕获的异常实例。
- 返回 \`Response\`(通常 \`JSONResponse\`)。

注意是 \`async def\`,即使你的异常处理器是同步逻辑也要 async。

## 五、异常类带自定义属性

更实用的例子:异常带错误码和上下文。

\`\`\`python
# 定义类 BusinessError，继承 Exception
class BusinessError(Exception):
    # """业务异常基类"""
    """业务异常基类"""
    # 定义函数 __init__，参数: self, code: int, message: str, details: dict | Non...
    def __init__(self, code: int, message: str, details: dict | None = None):
        self.code = code          # 业务错误码
        self.message = message    # 错误信息
        self.details = details    # 上下文详情
        # 调用 super()
        super().__init__(message)

# 具体业务异常
# 定义类 InsufficientBalanceError，继承 BusinessError
class InsufficientBalanceError(BusinessError):
    # 定义函数 __init__，参数: self, user_id: int, needed: float, balance: float
    def __init__(self, user_id: int, needed: float, balance: float):
        # 调用 super()
        super().__init__(
            # 定义变量 code，赋值为 4001,
            code=4001,
            # 定义变量 message，赋值为 "余额不足",
            message="余额不足",
            # 定义字典 details
            details={
                # "user_id": user_id,
                "user_id": user_id,
                # "needed": needed,
                "needed": needed,
                # "balance": balance,
                "balance": balance,
            # },
            },
        # )
        )

# 装饰器：app.exception_handler
@app.exception_handler(BusinessError)
# 定义异步函数 business_error_handler，参数: request: Request, exc: BusinessError
async def business_error_handler(request: Request, exc: BusinessError):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 400,
        status_code=400,
        # 定义字典 content
        content={
            # "code": exc.code,
            "code": exc.code,
            # "message": exc.message,
            "message": exc.message,
            # "details": exc.details,
            "details": exc.details,
        # },
        },
    # )
    )

# 定义 POST 路由：访问 /transfer 时触发
@app.post("/transfer")
# 定义函数 transfer，参数: amount: float, user_id: int = 1
def transfer(amount: float, user_id: int = 1):
    balance = 100.0  # 假设查出来的余额
    # 条件判断：如果 amount > balance
    if amount > balance:
        # 抛出 InsufficientBalanceError 异常
        raise InsufficientBalanceError(
            # 定义变量 user_id，赋值为 user_id, needed=amount, balance=balance
            user_id=user_id, needed=amount, balance=balance
        # )
        )
    # 返回 {"msg": "转账成功"}
    return {"msg": "转账成功"}
\`\`\`

请求 \`/transfer?amount=200\`,响应:
\`\`\`json
{
  "code": 4001,
  "message": "余额不足",
  "details": {"user_id": 1, "needed": 200.0, "balance": 100.0}
}
\`\`\`

## 六、多个异常处理器

可以注册多个:

\`\`\`python
# 定义类 NotFoundError，继承 Exception
class NotFoundError(Exception): ...
# 定义类 PermissionError，继承 Exception
class PermissionError(Exception): ...
# 定义类 BusinessError，继承 Exception
class BusinessError(Exception): ...

# 装饰器：app.exception_handler
@app.exception_handler(NotFoundError)
# 定义异步函数 not_found_handler，参数: request, exc
async def not_found_handler(request, exc):
    # 返回 JSONResponse(404, {"code": 4040, "message": str(exc)})
    return JSONResponse(404, {"code": 4040, "message": str(exc)})

# 装饰器：app.exception_handler
@app.exception_handler(PermissionError)
# 定义异步函数 permission_handler，参数: request, exc
async def permission_handler(request, exc):
    # 返回 JSONResponse(403, {"code": 4030, "message": str(exc)})
    return JSONResponse(403, {"code": 4030, "message": str(exc)})

# 装饰器：app.exception_handler
@app.exception_handler(BusinessError)
# 定义异步函数 business_handler，参数: request, exc
async def business_handler(request, exc):
    # 返回 JSONResponse(400, {"code": 4000, "message": str(exc)})
    return JSONResponse(400, {"code": 4000, "message": str(exc)})
\`\`\`

每种异常有自己的处理器,各司其职。

## 七、异常继承:子类先匹配

如果异常有继承关系,**子类的处理器优先**:

\`\`\`python
# 定义类 BusinessError，继承 Exception
class BusinessError(Exception): ...
# 定义类 PaymentError，继承 BusinessError
class PaymentError(BusinessError): ...

# 父类处理器
# 装饰器：app.exception_handler
@app.exception_handler(BusinessError)
# 定义异步函数 business_handler，参数: request, exc
async def business_handler(request, exc):
    # 返回 JSONResponse(400, {"msg": "业务错误"})
    return JSONResponse(400, {"msg": "业务错误"})

# 子类处理器(优先匹配)
# 装饰器：app.exception_handler
@app.exception_handler(PaymentError)
# 定义异步函数 payment_handler，参数: request, exc
async def payment_handler(request, exc):
    # 返回 JSONResponse(402, {"msg": "支付错误"})
    return JSONResponse(402, {"msg": "支付错误"})

# 抛 PaymentError 会走 payment_handler(402)
# 抛其它 BusinessError 子类(没单独注册)走 business_handler(400)
\`\`\`

FastAPI 按「最具体类型优先」匹配。利用这点,可以建异常层次,父类兜底,子类特殊处理。

## 八、为什么用自定义异常

| 维度 | HTTPException | 自定义异常 |
|---|---|---|
| 语义 | 通用 HTTP 错误 | 业务语义清晰 |
| 上下文 | 只有 detail | 任意属性 |
| 统一格式 | 难(各自拼 detail) | 处理器统一 |
| 类型 | 一种类型 | 多种业务类型 |
| 测试 | 难(要检查 status_code 和 detail) | 易(检查异常类型) |

**适用场景**:
- 中大型项目,业务错误多且需要分类 → 自定义异常。
- 小项目,错误简单 → HTTPException 够用。
- 需要统一错误响应格式 → 自定义异常 + 处理器。

## 九、完整示例:业务异常 UnicornException

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 1. 自定义异常层次
# 定义类 AppError，继承 Exception
class AppError(Exception):
    # """应用异常基类"""
    """应用异常基类"""
    # 定义函数 __init__，参数: self, message: str, code: int = 5000
    def __init__(self, message: str, code: int = 5000):
        # self.message = message
        self.message = message
        # self.code = code
        self.code = code
        # 调用 super()
        super().__init__(message)

# 定义类 UnicornException，继承 AppError
class UnicornException(AppError):
    # """独角兽相关错误"""
    """独角兽相关错误"""
    # 定义函数 __init__，参数: self, name: str
    def __init__(self, name: str):
        # 调用 super()
        super().__init__(message=f"独角兽 {name} 不存在", code=4001)
        # self.name = name
        self.name = name

# 2. 统一处理器(处理基类,子类也能被匹配)
# 装饰器：app.exception_handler
@app.exception_handler(AppError)
# 定义异步函数 app_error_handler，参数: request: Request, exc: AppError
async def app_error_handler(request: Request, exc: AppError):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 400,
        status_code=400,
        # 定义字典 content
        content={
            # "code": exc.code,
            "code": exc.code,
            # "message": exc.message,
            "message": exc.message,
            # "path": str(request.url.path),
            "path": str(request.url.path),
        # },
        },
    # )
    )

# 3. 子类专属处理器(优先级高于父类)
# 装饰器：app.exception_handler
@app.exception_handler(UnicornException)
# 定义异步函数 unicorn_handler，参数: request: Request, exc: UnicornException
async def unicorn_handler(request: Request, exc: UnicornException):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 404,
        status_code=404,
        # 定义字典 content
        content={
            # "code": exc.code,
            "code": exc.code,
            # "message": exc.message,
            "message": exc.message,
            "name": exc.name,  # 子类特有属性
        # },
        },
    # )
    )

# 4. 路由
# 定义 GET 路由：访问 /unicorns/{name} 时触发
@app.get("/unicorns/{name}")
# 定义函数 get_unicorn，参数: name: str
def get_unicorn(name: str):
    # 条件判断：如果 name == "missing"
    if name == "missing":
        # 抛出 UnicornException 异常: name=name
        raise UnicornException(name=name)
    # 返回 {"name": name}
    return {"name": name}

# 定义 GET 路由：访问 /error 时触发
@app.get("/error")
# 定义函数 error，参数: 
def error():
    # 抛出 AppError 异常: "通用错误", code=5001
    raise AppError("通用错误", code=5001)
\`\`\`

- \`/unicorns/missing\` → 404,走 \`unicorn_handler\`(带 name 字段)。
- \`/error\` → 400,走 \`app_error_handler\`(基类兜底)。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 处理器忘了 async | 报错 | 必须 async def |
| 处理器返回非 Response | 报错 | 返回 JSONResponse 等 |
| 异常类不调 super().__init__ | traceback 缺信息 | 调用父类初始化 |
| 子类处理器注册顺序在父类后 | 不影响(按类型匹配) | 不用担心顺序 |
| 异常被 HTTPException 处理器抢走 | 不会,自定义异常不是 HTTPException | 放心 |
| 处理器抛异常 | 二次错误,变 500 | 处理器内部别抛 |

## 十一、设计思想

自定义异常体现「业务语言化」:错误不再是裸的数字码,而是有类型、有语义、有上下文的对象。这让代码自文档化,也让错误处理可扩展(加新错误只需加新异常类)。配合处理器,把「抛异常」和「生成响应」解耦——业务代码只管抛,响应格式由处理器统一管。这是大型项目错误处理的标准模式。
`,
  },
  {
    id: "exc-handler",
    group: "异常处理",
    icon: "🚨",
    title: "全局异常处理",
    content: `
## 一、覆盖默认错误格式

FastAPI 默认的 404 响应是 \`{"detail":"Not Found"}\`,422 校验错误是 \`{"detail":[...]}\`。但生产 API 通常需要统一格式,比如:
\`\`\`json
{"code": 404, "message": "Not Found"}
\`\`\`

这就需要覆盖默认处理器。

## 二、@app.exception_handler(StarletteHTTPException)

FastAPI 的 HTTP 错误(404/500 等由 Starlette 抛的)用的是 \`StarletteHTTPException\`。覆盖它:

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.exception_handler
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 custom_http_handler，参数: request: Request, exc: StarletteHTTPException
async def custom_http_handler(request: Request, exc: StarletteHTTPException):
    # 统一格式:{code, message}
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 exc.status_code,
        status_code=exc.status_code,
        # 定义字典 content
        content={
            # "code": exc.status_code,
            "code": exc.status_code,
            # "message": exc.detail,
            "message": exc.detail,
        # },
        },
    # )
    )

# 现在 404 会返回 {"code": 404, "message": "Not Found"}
\`\`\`

注意:\`fastapi.HTTPException\` 是 \`StarletteHTTPException\` 的子类,所以这个处理器也会捕获 FastAPI 的 HTTPException。

## 三、处理 422 校验错误

请求体校验失败时,FastAPI 抛 \`RequestValidationError\`:

\`\`\`python
# 从 fastapi.exceptions 导入 RequestValidationError
from fastapi.exceptions import RequestValidationError
# 从 fastapi.encoders 导入 jsonable_encoder
from fastapi.encoders import jsonable_encoder

# 装饰器：app.exception_handler
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_handler，参数: request: Request, exc: RequestValidationError
async def validation_handler(request: Request, exc: RequestValidationError):
    # exc.errors() 是错误列表
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 422,
        status_code=422,
        # 定义字典 content
        content={
            # "code": 422,
            "code": 422,
            # "message": "请求参数校验失败",
            "message": "请求参数校验失败",
            # "errors": jsonable_encoder(exc.errors()),
            "errors": jsonable_encoder(exc.errors()),
        # },
        },
    # )
    )
\`\`\`

默认的 422 响应是 \`{"detail": [...]}\`,这里改成自定义格式 \`{"code":422,"message":...,"errors":[...]}\`。

## 四、自定义 422 错误格式

\`exc.errors()\` 返回的列表每个元素类似:
\`\`\`python
# [
[
    # {
    {
        "loc": ["body", "name"],      # 错误位置
        "msg": "field required",       # 错误信息
        # "type": "value_error.missing", # 错误类型
        "type": "value_error.missing", # 错误类型
    # }
    }
# ]
]
\`\`\`

可以重新格式化更友好:

\`\`\`python
# 装饰器：app.exception_handler
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_handler，参数: request, exc
async def validation_handler(request, exc):
    # 转成 {field: message} 形式,前端好用
    # 定义字典 formatted
    formatted = {}
    # 遍历 exc.errors()，取 err
    for err in exc.errors():
        # loc 是 ["body", "name"] 这种,取最后一个字段名
        # 定义变量 field，赋值为 ".".join(str(x) for x in err["loc"][1:])
        field = ".".join(str(x) for x in err["loc"][1:])
        # formatted[field] = err["msg"]
        formatted[field] = err["msg"]
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 422,
        status_code=422,
        # 定义字典 content
        content={
            # "code": 422,
            "code": 422,
            # "message": "参数错误",
            "message": "参数错误",
            # "fields": formatted,
            "fields": formatted,
        # },
        },
    # )
    )
\`\`\`

响应示例:
\`\`\`json
{
  "code": 422,
  "message": "参数错误",
  "fields": {"name": "field required", "price": "value is not a valid float"}
}
\`\`\`

## 五、兜底所有未捕获异常:@app.exception_handler(Exception)

\`@app.exception_handler(Exception)\` 捕获所有未处理的异常(不含 HTTPException,因为后者有专门处理器):

\`\`\`python
# 导入 logging 模块
import logging
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")

# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_exception_handler，参数: request: Request, exc: Exception
async def global_exception_handler(request: Request, exc: Exception):
    # 1. 记录完整堆栈(生产环境必须)
    # 调用 logger.exception()
    logger.exception(f"未处理异常: {request.url.path}")
    # 2. 返回通用错误,不暴露堆栈(安全)
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 500,
        status_code=500,
        # 定义字典 content
        content={
            # "code": 500,
            "code": 500,
            # "message": "服务器内部错误",
            "message": "服务器内部错误",
        # },
        },
    # )
    )

# 定义 GET 路由：访问 /error 时触发
@app.get("/error")
# 定义函数 error，参数: 
def error():
    # 这个异常会被全局处理器捕获
    # 定义变量 x，赋值为 1 / 0
    x = 1 / 0
    # 返回 {"x": x}
    return {"x": x}
\`\`\`

## 六、为什么兜底:避免 500 暴露堆栈

不兜底的后果:
- 默认 500 响应可能含堆栈信息(开发模式),泄漏内部实现。
- 客户端看到原始错误,不知如何处理。
- 日志没记录,排查困难。

兜底后:
- 返回统一格式,客户端友好。
- 堆栈记到日志(服务器侧),可排查。
- 不泄漏内部细节。

## 七、生产环境错误日志

生产环境,全局处理器应该:
1. **记录完整堆栈**(logger.exception 自动带堆栈)。
2. **记录请求上下文**(URL、method、参数、用户 ID)。
3. **关联 request_id**(如果有追踪中间件)。
4. **告警**(发 Sentry/邮件)。

\`\`\`python
# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 定义变量 rid，赋值为 getattr(request.state, "request_id", "unknown...
    rid = getattr(request.state, "request_id", "unknown")
    # logger.exception(
    logger.exception(
        # f"[{rid}] 未处理异常 path={request.url.path} method={re
        f"[{rid}] 未处理异常 path={request.url.path} method={request.method}"
    # )
    )
    # 这里可以集成 Sentry: sentry_sdk.capture_exception(exc)
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 500,
        status_code=500,
        # 定义字典 content
        content={
            # "code": 500,
            "code": 500,
            # "message": "服务器内部错误",
            "message": "服务器内部错误",
            "request_id": rid,  # 给客户端,方便反馈排查
        # },
        },
    # )
    )
\`\`\`

## 八、处理器注册顺序

多个处理器注册顺序不影响匹配(按异常类型匹配,不是按注册顺序)。但有一个隐含规则:**最具体的类型优先**。

\`\`\`python
# 定义类 AppError，继承 Exception
class AppError(Exception): ...
# 定义类 SubError，继承 AppError
class SubError(AppError): ...

# 注册顺序无所谓
# 装饰器：app.exception_handler
@app.exception_handler(AppError)
# 定义异步函数 app_handler，参数: request, exc
async def app_handler(request, exc): ...

# 装饰器：app.exception_handler
@app.exception_handler(SubError)
# 定义异步函数 sub_handler，参数: request, exc
async def sub_handler(request, exc): ...

# 抛 SubError → 走 sub_handler(更具体)
# 抛 AppError(非 SubError)→ 走 app_handler
\`\`\`

## 九、完整示例:统一错误格式处理器

\`\`\`python
# 导入 logging 模块
import logging
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 fastapi.exceptions 导入 RequestValidationError
from fastapi.exceptions import RequestValidationError
# 从 fastapi.encoders 导入 jsonable_encoder
from fastapi.encoders import jsonable_encoder
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# 调用 logging.basicConfig()
logging.basicConfig(level=logging.INFO)
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")

# 创建 FastAPI 应用实例
app = FastAPI()

# 1. 覆盖 HTTP 错误(404/403 等)
# 装饰器：app.exception_handler
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 http_exception_handler，参数: request: Request, exc: StarletteHTTPException
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 exc.status_code,
        status_code=exc.status_code,
        # 定义字典 content
        content={
            # "code": exc.status_code,
            "code": exc.status_code,
            # "message": exc.detail,
            "message": exc.detail,
            # "path": str(request.url.path),
            "path": str(request.url.path),
        # },
        },
    # )
    )

# 2. 覆盖 422 校验错误
# 装饰器：app.exception_handler
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_handler，参数: request: Request, exc: RequestValidationError
async def validation_handler(request: Request, exc: RequestValidationError):
    # 定义字典 fields
    fields = {}
    # 遍历 exc.errors()，取 err
    for err in exc.errors():
        # 定义变量 loc，赋值为 err["loc"]
        loc = err["loc"]
        # body 的字段从 loc[1] 开始,path/query 从 loc[0] 开始
        # 定义变量 field，赋值为 ".".join(str(x) for x in loc[1:]) if loc[0] =...
        field = ".".join(str(x) for x in loc[1:]) if loc[0] == "body" else loc[0]
        # fields[field] = err["msg"]
        fields[field] = err["msg"]
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 422,
        status_code=422,
        # 定义字典 content
        content={
            # "code": 422,
            "code": 422,
            # "message": "参数校验失败",
            "message": "参数校验失败",
            # "fields": fields,
            "fields": fields,
        # },
        },
    # )
    )

# 3. 兜底所有未处理异常
# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 调用 logger.exception()
    logger.exception(f"未处理异常: {request.url.path}")
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 500,
        status_code=500,
        # 定义字典 content
        content={
            # "code": 500,
            "code": 500,
            # "message": "服务器内部错误",
            "message": "服务器内部错误",
        # },
        },
    # )
    )

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 root，参数: 
def root():
    # 返回 {"msg": "ok"}
    return {"msg": "ok"}

# 定义 GET 路由：访问 /notfound 时触发
@app.get("/notfound")
# 定义函数 notfound，参数: 
def notfound():
    # 这会触发 404(因为路由存在,演示用 HTTPException)
    # 从 fastapi 导入 HTTPException
    from fastapi import HTTPException
    # 抛出 HTTPException 异常: 404, "资源不存在"
    raise HTTPException(404, "资源不存在")

# 定义 GET 路由：访问 /error 时触发
@app.get("/error")
# 定义函数 error，参数: 
def error():
    x = 1 / 0  # 触发全局处理器
    # 返回 x
    return x
\`\`\`

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 覆盖 HTTPException 用错类 | 应该用 StarletteHTTPException | import 正确的类 |
| 全局处理器暴露堆栈 | 安全风险 | 只记日志,响应不暴露 |
| 处理器里抛异常 | 二次 500 | 处理器内部 try/except |
| 忘记记日志 | 排查困难 | logger.exception |
| 422 格式不友好 | 前端难用 | 重格式化 |
| Exception 处理器捕获 HTTPException | 不会(后者有专门处理器) | 知道这个行为 |

## 十一、设计思想

全局异常处理是「防御性编程」的体现。无论代码怎么写 BUG,API 都应该返回一致的、不泄漏的、有日志的错误响应。这是生产级服务的基本要求。FastAPI 的异常处理器机制让你能集中控制错误响应格式,不用在每个路由里写 try/except。理解 \"HTTP 错误用 HTTPException,业务错误用自定义异常,意外错误用全局兜底\" 这个三层模型,错误处理就清晰了。
`,
  },
  {
    id: "exc-practice",
    group: "异常处理",
    icon: "🛡️",
    title: "异常处理最佳实践",
    content: `
## 一、异常分层

一个成熟的 API 应用,异常应该分三层:

1. **校验异常**(422/400):请求参数格式、字段校验失败。FastAPI 自动处理。
2. **业务异常**(4xx):业务规则违反(余额不足、权限不够、资源不存在)。自定义异常。
3. **系统异常**(5xx):数据库连接失败、第三方服务超时、代码 BUG。兜底处理。

每层职责清晰,不混淆。

\`\`\`python
# 校验异常:Pydantic 模型自动触发,不用手写
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 字段 name，类型: str
    name: str
    age: int  # 传非 int 自动 422

# 业务异常:自定义
# 定义类 InsufficientBalanceError，继承 Exception
class InsufficientBalanceError(Exception): ...

# 系统异常:意外,全局兜底
# @app.exception_handler(Exception)
\`\`\`

## 二、统一错误响应格式

生产 API 应有统一格式,前端按固定结构解析:

\`\`\`json
{
  "code": 4001,
  "message": "余额不足",
  "details": {"user_id": 1, "needed": 100, "balance": 50},
  "request_id": "abc123"
}
\`\`\`

字段约定:
- **code**:业务错误码(数字,有体系),区别于 HTTP status_code。
- **message**:用户可读信息(中文)。
- **details**:可选,上下文数据。
- **request_id**:请求 ID,排查用。

实现统一处理器:

\`\`\`python
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 定义异步函数 unified_error_response，参数: status_code: int, code: int, message: str, request...
async def unified_error_response(status_code: int, code: int, message: str, request: Request, details=None):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 status_code,
        status_code=status_code,
        # 定义字典 content
        content={
            # "code": code,
            "code": code,
            # "message": message,
            "message": message,
            # "details": details,
            "details": details,
            # "request_id": getattr(request.state, "request_id",
            "request_id": getattr(request.state, "request_id", None),
        # },
        },
    # )
    )
\`\`\`

## 三、错误码体系设计

错误码要有体系,不要随手编。常见方案:

\`\`\`
1xxxx - 用户相关(10001 用户不存在,10002 密码错误)
2xxxx - 订单相关(20001 订单不存在,20002 库存不足)
3xxxx - 支付相关(30001 余额不足,30002 支付超时)
4xxxx - 权限相关(40001 未登录,40002 无权限)
5xxxx - 系统相关(50001 数据库错误,50002 第三方服务错误)
\`\`\`

规律:前两位是模块,后三位是具体错误。这样看码就知道哪个模块出问题。

\`\`\`python
# 定义类 ErrorCode
class ErrorCode:
    # 用户模块 1xxxx
    # 定义变量 USER_NOT_FOUND，赋值为 10001
    USER_NOT_FOUND = 10001
    # 定义变量 USER_PASSWORD_WRONG，赋值为 10002
    USER_PASSWORD_WRONG = 10002
    # 订单模块 2xxxx
    # 定义变量 ORDER_NOT_FOUND，赋值为 20001
    ORDER_NOT_FOUND = 20001
    # 定义变量 ORDER_INSUFFICIENT_STOCK，赋值为 20002
    ORDER_INSUFFICIENT_STOCK = 20002
    # 权限模块 4xxxx
    # 定义变量 AUTH_NOT_LOGIN，赋值为 40001
    AUTH_NOT_LOGIN = 40001
    # 定义变量 AUTH_NO_PERMISSION，赋值为 40002
    AUTH_NO_PERMISSION = 40002
\`\`\`

用常量而非裸数字,集中管理。

## 四、日志记录异常堆栈

生产环境,**所有 5xx 必须记完整堆栈**:

\`\`\`python
# 导入 logging 模块
import logging
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")

# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # logger.exception 会自动带堆栈(等价于 logger.error + exc_info=True)
    # logger.exception(
    logger.exception(
        # f"未处理异常 path={request.url.path} "
        f"未处理异常 path={request.url.path} "
        # f"method={request.method} "
        f"method={request.method} "
        # f"query={dict(request.query_params)}"
        f"query={dict(request.query_params)}"
    # )
    )
    # 返回 JSONResponse(status_code=500, content={"code": 5000, "message": "服务器错误"})
    return JSONResponse(status_code=500, content={"code": 5000, "message": "服务器错误"})
\`\`\`

注意:\`logger.exception\` 只能在 except 块里用(或异常处理器里,因为此时还在异常上下文)。它自动附带堆栈,比 \`logger.error(str(exc))\` 信息全。

## 五、不要吞异常(裸 except)

反模式:

\`\`\`python
# ❌ 吞异常,BUG 永远不暴露
# 尝试执行，捕获异常
try:
    # 调用 do_something()
    do_something()
# 捕获所有异常
except:
    pass  # 静默忽略

# ❌ 只记 message,丢堆栈
# 尝试执行，捕获异常
try:
    # 调用 do_something()
    do_something()
# 捕获 Exception 异常，赋值为 e
except Exception as e:
    logger.error(str(e))  # 没堆栈,难排查

# ✅ 记完整堆栈
# 尝试执行，捕获异常
try:
    # 调用 do_something()
    do_something()
# 捕获 Exception 异常，赋值为 e
except Exception as e:
    logger.exception("do_something 失败")  # 带堆栈
    raise  # 重新抛出,让上层处理
\`\`\`

「吞异常」是 BUG 的温床——错误被掩盖,系统带病运行,出问题时无从排查。

## 六、异常和状态码映射

业务异常应该映射到合适的 HTTP 状态码:

| 业务场景 | 异常 | HTTP 码 |
|---|---|---|
| 资源不存在 | NotFoundError | 404 |
| 未登录 | UnauthorizedError | 401 |
| 无权限 | ForbiddenError | 403 |
| 参数语义错(如余额不足) | BusinessError | 400 |
| 资源冲突(重复创建) | ConflictError | 409 |
| 限流 | RateLimitError | 429 |
| 上游服务错 | UpstreamError | 502 |
| 服务不可用 | ServiceUnavailableError | 503 |

在处理器里映射:

\`\`\`python
# 定义类 BusinessError，继承 Exception
class BusinessError(Exception):
    # 定义函数 __init__，参数: self, code: int, message: str, http_status: int = ...
    def __init__(self, code: int, message: str, http_status: int = 400):
        # self.code = code
        self.code = code
        # self.message = message
        self.message = message
        # self.http_status = http_status
        self.http_status = http_status

# 装饰器：app.exception_handler
@app.exception_handler(BusinessError)
# 定义异步函数 business_handler，参数: request, exc
async def business_handler(request, exc):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 exc.http_status,
        status_code=exc.http_status,
        # 定义字典 content
        content={"code": exc.code, "message": exc.message},
    # )
    )

# 使用时指定合适的 http_status
# 抛出 BusinessError 异常: code=4001, message="余额不足", http_status=400
raise BusinessError(code=4001, message="余额不足", http_status=400)
# 抛出 BusinessError 异常: code=4040, message="订单不存在", http_status=404
raise BusinessError(code=4040, message="订单不存在", http_status=404)
\`\`\`

## 七、API 错误响应标准 RFC 7807

RFC 7807(Problem Details for HTTP APIs)是 API 错误响应的标准格式:

\`\`\`json
{
  "type": "https://example.com/errors/insufficient-balance",
  "title": "余额不足",
  "status": 400,
  "detail": "您的余额为 50,需要 100",
  "instance": "/transfer"
}
\`\`\`

字段:
- **type**:错误类型文档 URI。
- **title**:简短标题。
- **status**:HTTP 状态码。
- **detail**:详细说明。
- **instance**:出错的具体 URI。

可以扩展自定义字段:

\`\`\`python
# 装饰器：app.exception_handler
@app.exception_handler(BusinessError)
# 定义异步函数 handler，参数: request, exc
async def handler(request, exc):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 exc.http_status,
        status_code=exc.http_status,
        # 定义字典 content
        content={
            # "type": f"https://api.example.com/errors/{exc.code
            "type": f"https://api.example.com/errors/{exc.code}",
            # "title": exc.message,
            "title": exc.message,
            # "status": exc.http_status,
            "status": exc.http_status,
            # "detail": str(exc),
            "detail": str(exc),
            # "instance": str(request.url.path),
            "instance": str(request.url.path),
            # 扩展字段
            # "code": exc.code,
            "code": exc.code,
            # "request_id": getattr(request.state, "request_id",
            "request_id": getattr(request.state, "request_id", None),
        # },
        },
    # )
    )
\`\`\`

遵循 RFC 7807 让 API 更标准、可互操作。

## 八、监控异常(Sentry)

生产环境要监控异常,Sentry 是主流选择:

\`\`\`python
# 导入 sentry_sdk 模块
import sentry_sdk
# 从 sentry_sdk.integrations.starlette 导入 StarletteIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
# 从 sentry_sdk.integrations.fastapi 导入 FastApiIntegration
from sentry_sdk.integrations.fastapi import FastApiIntegration

# sentry_sdk.init(
sentry_sdk.init(
    # 定义变量 dsn，赋值为 "https://xxx@sentry.io/123",
    dsn="https://xxx@sentry.io/123",
    # 定义列表 integrations
    integrations=[
        # 调用 StarletteIntegration()
        StarletteIntegration(),
        # 调用 FastApiIntegration()
        FastApiIntegration(),
    # ],
    ],
    traces_sample_rate=0.1,  # 10% 采样
# )
)

# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 上报到 Sentry
    # 调用 sentry_sdk.capture_exception()
    sentry_sdk.capture_exception(exc)
    # 调用 logger.exception()
    logger.exception("未处理异常")
    # 返回 JSONResponse(status_code=500, content={"code": 5000, "message": "服务器错误"})
    return JSONResponse(status_code=500, content={"code": 5000, "message": "服务器错误"})
\`\`\`

Sentry 自动收集堆栈、请求上下文、用户信息,异常发生时实时告警。

## 九、完整示例:完整异常处理体系

\`\`\`python
# 导入 logging 模块
import logging
# 导入 sentry_sdk 模块
import sentry_sdk
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 fastapi.exceptions 导入 RequestValidationError
from fastapi.exceptions import RequestValidationError
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# 1. 错误码定义
# 定义类 ErrorCode
class ErrorCode:
    # 定义变量 USER_NOT_FOUND，赋值为 10001
    USER_NOT_FOUND = 10001
    # 定义变量 USER_INSUFFICIENT_BALANCE，赋值为 10002
    USER_INSUFFICIENT_BALANCE = 10002
    # 定义变量 ORDER_NOT_FOUND，赋值为 20001
    ORDER_NOT_FOUND = 20001
    # 定义变量 ORDER_CONFLICT，赋值为 20002
    ORDER_CONFLICT = 20002
    # 定义变量 AUTH_NOT_LOGIN，赋值为 40001
    AUTH_NOT_LOGIN = 40001
    # 定义变量 AUTH_NO_PERMISSION，赋值为 40002
    AUTH_NO_PERMISSION = 40002
    # 定义变量 SYSTEM_ERROR，赋值为 50000
    SYSTEM_ERROR = 50000

# 2. 异常层次
# 定义类 AppError，继承 Exception
class AppError(Exception):
    # """应用异常基类"""
    """应用异常基类"""
    # 定义函数 __init__，参数: self, code: int, message: str, http_status: int = ...
    def __init__(self, code: int, message: str, http_status: int = 400, details=None):
        # self.code = code
        self.code = code
        # self.message = message
        self.message = message
        # self.http_status = http_status
        self.http_status = http_status
        # self.details = details
        self.details = details
        # 调用 super()
        super().__init__(message)

# 定义类 BusinessError，继承 AppError
class BusinessError(AppError):
    # """业务异常"""
    """业务异常"""
    # 空操作占位
    pass

# 定义类 SystemError，继承 AppError
class SystemError(AppError):
    # """系统异常"""
    """系统异常"""
    # 定义函数 __init__，参数: self, message="服务器内部错误"
    def __init__(self, message="服务器内部错误"):
        # 调用 super()
        super().__init__(
            # 定义变量 code，赋值为 ErrorCode.SYSTEM_ERROR,
            code=ErrorCode.SYSTEM_ERROR,
            # 定义变量 message，赋值为 message,
            message=message,
            # 定义变量 http_status，赋值为 500,
            http_status=500,
        # )
        )

# 3. FastAPI 应用
# 创建 FastAPI 应用实例
app = FastAPI()
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")

# 4. 统一响应构造
# 定义函数 make_error_response，参数: status: int, code: int, message: str, request: Req...
def make_error_response(status: int, code: int, message: str, request: Request, details=None):
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 status,
        status_code=status,
        # 定义字典 content
        content={
            # "code": code,
            "code": code,
            # "message": message,
            "message": message,
            # "details": details,
            "details": details,
            # "request_id": getattr(request.state, "request_id",
            "request_id": getattr(request.state, "request_id", None),
        # },
        },
    # )
    )

# 5. HTTP 异常处理器(覆盖默认)
# 装饰器：app.exception_handler
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 http_handler，参数: request: Request, exc: StarletteHTTPException
async def http_handler(request: Request, exc: StarletteHTTPException):
    # 返回 make_error_response(
    return make_error_response(
        # 定义变量 status，赋值为 exc.status_code,
        status=exc.status_code,
        code=exc.status_code * 10,  # HTTP 错误码用 status*10
        # 定义变量 message，赋值为 str(exc.detail),
        message=str(exc.detail),
        # 定义变量 request，赋值为 request,
        request=request,
    # )
    )

# 6. 422 校验异常
# 装饰器：app.exception_handler
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_handler，参数: request: Request, exc: RequestValidationError
async def validation_handler(request: Request, exc: RequestValidationError):
    # 定义字典 fields
    fields = {}
    # 遍历 exc.errors()，取 err
    for err in exc.errors():
        # 定义变量 loc，赋值为 err["loc"]
        loc = err["loc"]
        # 定义变量 field，赋值为 ".".join(str(x) for x in loc[1:]) if loc[0] =...
        field = ".".join(str(x) for x in loc[1:]) if loc[0] == "body" else str(loc[0])
        # fields[field] = err["msg"]
        fields[field] = err["msg"]
    # 返回 make_error_response(
    return make_error_response(
        # 定义变量 status，赋值为 422,
        status=422,
        # 定义变量 code，赋值为 4220,
        code=4220,
        # 定义变量 message，赋值为 "参数校验失败",
        message="参数校验失败",
        # 定义变量 request，赋值为 request,
        request=request,
        # 定义变量 details，赋值为 fields,
        details=fields,
    # )
    )

# 7. 应用异常(业务)
# 装饰器：app.exception_handler
@app.exception_handler(AppError)
# 定义异步函数 app_handler，参数: request: Request, exc: AppError
async def app_handler(request: Request, exc: AppError):
    # 返回 make_error_response(
    return make_error_response(
        # 定义变量 status，赋值为 exc.http_status,
        status=exc.http_status,
        # 定义变量 code，赋值为 exc.code,
        code=exc.code,
        # 定义变量 message，赋值为 exc.message,
        message=exc.message,
        # 定义变量 request，赋值为 request,
        request=request,
        # 定义变量 details，赋值为 exc.details,
        details=exc.details,
    # )
    )

# 8. 兜底(未处理异常)
# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 调用 logger.exception()
    logger.exception(f"未处理异常: {request.url.path}")
    # 调用 sentry_sdk.capture_exception()
    sentry_sdk.capture_exception(exc)
    # 返回 make_error_response(
    return make_error_response(
        # 定义变量 status，赋值为 500,
        status=500,
        # 定义变量 code，赋值为 ErrorCode.SYSTEM_ERROR,
        code=ErrorCode.SYSTEM_ERROR,
        # 定义变量 message，赋值为 "服务器内部错误",
        message="服务器内部错误",
        # 定义变量 request，赋值为 request,
        request=request,
    # )
    )

# 9. 路由示例
# 定义 GET 路由：访问 /users/{uid} 时触发
@app.get("/users/{uid}")
# 定义函数 get_user，参数: uid: int
def get_user(uid: int):
    # 条件判断：如果 uid > 100
    if uid > 100:
        # 抛出 BusinessError 异常
        raise BusinessError(
            # 定义变量 code，赋值为 ErrorCode.USER_NOT_FOUND,
            code=ErrorCode.USER_NOT_FOUND,
            # 定义变量 message，赋值为 f"用户 {uid} 不存在",
            message=f"用户 {uid} 不存在",
            # 定义变量 http_status，赋值为 404,
            http_status=404,
        # )
        )
    # 返回 {"id": uid, "name": "alice"}
    return {"id": uid, "name": "alice"}

# 定义 POST 路由：访问 /transfer 时触发
@app.post("/transfer")
# 定义函数 transfer，参数: amount: float
def transfer(amount: float):
    # 定义变量 balance，赋值为 50
    balance = 50
    # 条件判断：如果 amount > balance
    if amount > balance:
        # 抛出 BusinessError 异常
        raise BusinessError(
            # 定义变量 code，赋值为 ErrorCode.USER_INSUFFICIENT_BALANCE,
            code=ErrorCode.USER_INSUFFICIENT_BALANCE,
            # 定义变量 message，赋值为 "余额不足",
            message="余额不足",
            # 定义变量 http_status，赋值为 400,
            http_status=400,
            # 定义字典 details
            details={"needed": amount, "balance": balance},
        # )
        )
    # 返回 {"msg": "转账成功"}
    return {"msg": "转账成功"}

# 定义 GET 路由：访问 /crash 时触发
@app.get("/crash")
# 定义函数 crash，参数: 
def crash():
    return {"x": 1 / 0}  # 触发全局兜底
\`\`\`

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 错误码随手编 | 无体系难维护 | 设计错误码体系 |
| 裸 except 吞异常 | BUG 掩盖 | 必须 raise |
| 不记堆栈只记 message | 排查难 | logger.exception |
| 生产暴露堆栈给客户端 | 安全风险 | 只响应通用信息 |
| 业务异常用 500 | 语义错 | 4xx 用对应码 |
| 不集成监控 | 出问题不知道 | 接 Sentry |
| 异常处理器抛异常 | 二次 500 | 处理器内 try/except |

## 十一、设计思想

异常处理是「工程成熟度」的体现。新手只关心「能跑」,老手关心「出错时还能优雅地失败」。完整的异常体系包含:分层(校验/业务/系统)、统一格式、错误码体系、日志记录、监控告警、安全(不泄漏)。这些不是「锦上添花」,而是「生产可用」的底线。FastAPI 提供了机制(异常处理器),但实践要靠设计。把异常处理想清楚,API 的健壮性和可维护性就上了一个台阶。
`,
  },
];
