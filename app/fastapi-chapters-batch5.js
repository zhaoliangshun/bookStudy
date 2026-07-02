// =============================================================
// Batch 5：响应处理（4 章）
// 17. resp-model   响应模型 response_model
// 18. resp-status  状态码与 Header
// 19. resp-cookie  Cookie 与 Session
// 20. resp-stream  流式响应与文件下载
// =============================================================

export const chapters = [
  {
    id: "resp-model",
    group: "响应处理",
    icon: "📤",
    title: "响应模型 response_model",
    content: `
## 一、为什么需要响应模型

接口返回数据时,最朴素的写法是直接 \`return dict\` 或 \`return user\`。但这样有几个隐患:

1. **敏感字段泄漏**:数据库 User 表有 \`password\` 字段,直接返回 user 对象会把密码哈希也暴露给前端。
2. **没有类型契约**:调用方不知道返回结构里有哪些字段、什么类型,IDE 没有提示。
3. **API 文档空白**:OpenAPI 文档不知道响应结构,Swagger UI 显示不出示例。
4. **多余字段返回**:数据库模型字段多,前端只需要其中几个,全返回浪费带宽。

\`response_model\` 就是为解决这些问题设计的:它告诉 FastAPI「这个接口返回的数据应该长成什么样」,框架会按这个模型去**过滤、校验、序列化**实际返回值。

## 二、response_model 的核心作用

声明 \`response_model=SomeModel\` 后,FastAPI 会做三件事:

1. **过滤字段**:把返回值里多余的字段剔除,只保留模型定义的字段。这是防泄漏的核心机制。
2. **校验类型**:返回值会被模型重新校验,类型不对会报错(开发期就能发现)。
3. **生成文档**:OpenAPI schema 自动记录响应结构,Swagger UI 显示示例。

注意:**过滤是按字段名匹配,不是按对象类型**。返回的 dict、ORM 对象、Pydantic 实例都行,只要字段名能对上。

## 三、基础用法:UserOut 不返回 password

最经典的场景:接收 UserIn(含密码),处理后返回 UserOut(不含密码)。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 输入模型:包含密码(创建用户需要)
# 定义 Pydantic 数据模型 UserIn，继承 BaseModel
class UserIn(BaseModel):
    # 字段 username，类型: str
    username: str
    password: str  # 前端传过来,我们要存,但不能返回
    # 字段 email，类型: str
    email: str

# 输出模型:不含密码,对外安全
# 定义 Pydantic 数据模型 UserOut，继承 BaseModel
class UserOut(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 没有 password 字段 —— response_model 会自动把它过滤掉

# 模拟数据库
# 定义字典 fake_db
fake_db = {}

# response_model=UserOut:即使函数 return 了完整 dict,FastAPI 也只输出 UserOut 的字段
# 定义 POST 路由：访问 /users 时触发
@app.post("/users", response_model=UserOut)
# 定义函数 create_user，参数: user: UserIn
def create_user(user: UserIn):
    # 实际项目这里会 hash 密码再存
    # fake_db[user.username] = user
    fake_db[user.username] = user
    # 返回的是 UserIn 的所有字段(含 password),但 response_model 会过滤
    # 返回 user
    return user
\`\`\`

请求 \`POST /users\` 传 \`{"username":"alice","password":"123456","email":"a@b.com"}\`,响应只有:
\`\`\`
{"username":"alice","email":"a@b.com"}
\`\`\`
\`password\` 被自动剔除了。这就是 response_model 的过滤作用。

## 四、为什么不用 dict 直接返回

对比两种写法:

| 维度 | \`return dict\` | \`response_model=Model\` |
|---|---|---|
| 敏感字段过滤 | 手动删字段,容易漏 | 自动过滤,安全 |
| 类型校验 | 无,返回啥是啥 | 自动校验 |
| API 文档 | 没有响应结构 | 自动生成 |
| IDE 提示 | 无 | 有类型提示 |
| 字段顺序 | 不稳定 | 按模型定义 |
| 前端契约 | 靠口口相传 | 靠代码 |

**结论**:任何对外接口都应该声明 response_model,这是工程纪律,不是可选项。

## 五、返回列表:List[Model]

返回多个对象时用 \`List[Model]\`:

\`\`\`python
# 从 typing 导入 List
from typing import List

# 定义 GET 路由：访问 /users 时触发
@app.get("/users", response_model=List[UserOut])
# 定义函数 list_users，参数: 
def list_users():
    # 数据库里是 UserIn 列表,但返回时会被过滤成 UserOut
    # 返回 list(fake_db.values())
    return list(fake_db.values())
\`\`\`

每个元素都会被 UserOut 过滤一遍。即便数据库返回的是 ORM 对象列表,也能正确处理。

## 六、响应模型和输入模型分离

**核心原则**:输入模型和输出模型应该分开设计,不要图省事用同一个。

为什么?

- **输入需要 password**:创建用户时,前端要传密码。
- **输出不能有 password**:返回用户信息时,绝不能把密码哈希吐出去。
- **字段约束不同**:输入的 email 可能宽松(允许空字符串),输出的 email 可能要求已验证。
- **字段集不同**:输入有 \`captcha\`(验证码),输出不需要。

一个典型的用户资源会有这几个模型:

\`\`\`python
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # """创建用户的输入"""
    """创建用户的输入"""
    # 字段 username，类型: str
    username: str
    # 字段 password，类型: str
    password: str
    # 字段 email，类型: str
    email: str

# 定义 Pydantic 数据模型 UserUpdate，继承 BaseModel
class UserUpdate(BaseModel):
    # """更新用户的输入,所有字段可选"""
    """更新用户的输入,所有字段可选"""
    # 字段 username，类型: str | None，默认值: None
    username: str | None = None
    # 字段 email，类型: str | None，默认值: None
    email: str | None = None
    # 不允许通过更新接口改密码

# 定义 Pydantic 数据模型 UserOut，继承 BaseModel
class UserOut(BaseModel):
    # """对外输出"""
    """对外输出"""
    # 字段 id，类型: int
    id: int
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 字段 is_active，类型: bool
    is_active: bool

# 定义 Pydantic 数据模型 UserInDB，继承 BaseModel
class UserInDB(BaseModel):
    # """内部使用,含密码哈希"""
    """内部使用,含密码哈希"""
    # 字段 id，类型: int
    id: int
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 字段 hashed_password，类型: str
    hashed_password: str
    # 字段 is_active，类型: bool
    is_active: bool
\`\`\`

这种「同一资源的多视角模型」是 FastAPI 推荐的实践,清晰且安全。

## 七、response_model_include / exclude 精细控制

如果不想为每种情况都建模型,可以用 include/exclude 临时控制返回字段:

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 字段 is_admin，类型: bool
    is_admin: bool

# 只返回 id 和 username
# 定义 GET 路由：访问 /users/{uid} 时触发
@app.get("/users/{uid}", response_model=User, response_model_include={"id", "username"})
# 定义函数 get_user，参数: uid: int
def get_user(uid: int):
    # 返回 users[uid]
    return users[uid]

# 排除 is_admin
# 定义 GET 路由：访问 /users/{uid}/public 时触发
@app.get("/users/{uid}/public", response_model=User, response_model_exclude={"is_admin"})
# 定义函数 get_public_user，参数: uid: int
def get_public_user(uid: int):
    # 返回 users[uid]
    return users[uid]
\`\`\`

- \`response_model_include\`:只保留这些字段(集合)。
- \`response_model_exclude\`:排除这些字段。
- 参数是 set 类型,如 \`{"id", "username"}\`。

**适用场景**:临时调整、不想建一堆模型。但**长期维护的项目还是建议建独立模型**,因为 include/exclude 写在路由上,散落各处,难统一管理。

## 八、response_model_exclude_unset 处理默认值

Pydantic 模型字段可以有默认值。如果用户没传某字段,返回时是否要带上默认值?

\`\`\`python
# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str
    description: str | None = None  # 可选,默认 None
    # 字段 price，类型: float
    price: float
    tax: float = 0.1               # 默认 0.1

# 定义 POST 路由：访问 /items 时触发
@app.post("/items", response_model=Item, response_model_exclude_unset=True)
# 定义函数 create，参数: item: Item
def create(item: Item):
    # 返回 item
    return item
\`\`\`

- 不加 \`response_model_exclude_unset\`:返回所有字段(含默认值)。用户只传 \`{"name":"x","price":1}\`,返回 \`{"name":"x","description":null,"price":1,"tax":0.1}\`。
- 加 \`response_model_exclude_unset=True\`:只返回用户**显式设置**的字段。同样的输入返回 \`{"name":"x","price":1}\`,省略 description 和 tax。

类似还有:
- \`response_model_exclude_defaults=True\`:排除等于默认值的字段。
- \`response_model_exclude_none=True\`:排除值为 None 的字段。

PATCH 接口常用 exclude_unset,这样前端只更新了哪些字段就返回哪些,清晰。

## 九、response_model 的执行时机

理解 response_model 在请求生命周期里的位置很重要:

1. 请求进来,Pydantic 校验输入(用 UserIn)。
2. 路由函数执行,返回任意对象(dict/ORM/model)。
3. **response_model 生效**:把返回值用 UserOut 校验+过滤。
4. 序列化为 JSON 响应。

这意味着:**路由函数返回什么类型都行**,只要字段能对上。返回 ORM 对象(SQLAlchemy model)、dict、Pydantic 实例都可以,FastAPI 都会用 response_model 统一处理。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 忘了 response_model | 敏感字段泄漏 | 任何对外接口都声明 |
| 输入输出共用模型 | password 被返回 | 分离 UserIn/UserOut |
| response_model 字段名对不上返回值 | 字段丢失或为 None | 确保返回对象有对应字段 |
| 用 return dict 跳过模型 | 失去过滤和文档 | 始终走 response_model |
| 误以为 response_model 会改输入 | 它只影响输出 | 输入校验另靠请求体模型 |
| List 忘了 List[] | 文档显示成单对象 | 用 \`List[UserOut]\` |
| include/exclude 滥用 | 散落难维护 | 优先建独立模型 |
| exclude_unset 用错场景 | GET 列表不该用 | 仅用于 PATCH 这类部分更新 |

## 十一、设计思想

response_model 体现了一个核心理念:**输出契约显式化**。前端拿到的数据形状由代码定义,而不是由后端随手 return 的内容决定。这让 API 变得可预测、可文档化、可演化。这也是 FastAPI 相比 Flask 的一大优势 —— Flask 默认没有这种机制,要靠 marshmallow 等额外库。
`,
  },
  {
    id: "resp-status",
    group: "响应处理",
    icon: "🚦",
    title: "状态码与 Header",
    content: `
## 一、HTTP 状态码分类

HTTP 响应状态码是三位数字,第一位表示类别:

| 类别 | 含义 | 典型 |
|---|---|---|
| 1xx | 信息性(很少用) | 100 Continue |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301, 302, 304 Not Modified |
| 4xx | 客户端错误 | 400, 401, 403, 404, 422 |
| 5xx | 服务端错误 | 500, 502, 503 |

REST API 设计中,正确使用状态码很重要,它是 HTTP 协议层面的「语义」。

## 二、FastAPI 默认状态码

- GET 接口默认 200。
- POST 接口默认也是 200(不是 201!)。

很多新手以为 POST 自动返回 201,其实不是。FastAPI 默认所有接口都 200。要返回 201 需要显式声明。

## 三、status_code 参数指定状态码

在路由装饰器上传 \`status_code\`:

\`\`\`python
# 从 fastapi 导入 FastAPI, status
from fastapi import FastAPI, status

# 创建 FastAPI 应用实例
app = FastAPI()

# 创建资源返回 201 Created
# 定义 POST 路由：访问 /items 时触发
@app.post("/items", status_code=status.HTTP_201_CREATED)
# 定义函数 create_item，参数: item: dict
def create_item(item: dict):
    # 返回 item
    return item

# 删除资源返回 204 No Content(无响应体)
# 定义 DELETE 路由：访问 /items/{item_id} 时触发
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
# 定义函数 delete_item，参数: item_id: int
def delete_item(item_id: int):
    # 删除逻辑
    return None  # 204 通常没有响应体
\`\`\`

\`status\` 模块提供语义化常量:
- \`status.HTTP_200_OK\` = 200
- \`status.HTTP_201_CREATED\` = 201
- \`status.HTTP_204_NO_CONTENT\` = 204
- \`status.HTTP_400_BAD_REQUEST\` = 400
- \`status.HTTP_404_NOT_FOUND\` = 404

用常量而非裸数字,可读性好。但裸数字 \`status_code=201\` 也合法。

## 四、常用状态码语义

| 码 | 名称 | 何时用 |
|---|---|---|
| 200 | OK | 通用成功,GET/PUT/PATCH |
| 201 | Created | POST 创建资源成功 |
| 202 | Accepted | 异步任务已接收,处理中 |
| 204 | No Content | 删除成功,无内容返回 |
| 301 | Moved Permanently | 资源永久搬家 |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 缓存有效,客户端用本地副本 |
| 400 | Bad Request | 请求格式错误 |
| 401 | Unauthorized | 未登录(其实该叫 Unauthenticated) |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突(如重复创建) |
| 422 | Unprocessable Entity | 语义校验失败(FastAPI 默认校验错误码) |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务器内部错误 |

**注意区分 401 和 403**:401 是「不知道你是谁」(没带 token),403 是「知道你是谁但不让你干」(权限不够)。

## 五、Response 对象设置 Header

有时候需要在响应里加自定义 Header,比如 \`Location\`(新资源 URL)、\`X-Request-Id\`(请求追踪)。

### 5.1 注入 Response 参数

\`\`\`python
# 从 fastapi 导入 FastAPI, Response
from fastapi import FastAPI, Response

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /items 时触发
@app.post("/items", status_code=201)
# 定义函数 create_item，参数: item: dict, response: Response
def create_item(item: dict, response: Response):
    # 定义变量 new_id，赋值为 42
    new_id = 42
    # 设置 Location 头,指向新创建的资源
    # response.headers["Location"] = f"/items/{new_id}"
    response.headers["Location"] = f"/items/{new_id}"
    # 自定义头(非标准头习惯加 X- 前缀)
    # response.headers["X-Custom-Header"] = "hello"
    response.headers["X-Custom-Header"] = "hello"
    # 返回 {"id": new_id, **item}
    return {"id": new_id, **item}
\`\`\`

注入 \`Response\` 对象后,设置它的 \`headers\` 字典,FastAPI 会把这些 Header 合并到最终响应里。这种方式不影响返回值。

### 5.2 直接返回 Response 对象

也可以构造一个完整的 Response 对象 return:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /custom 时触发
@app.get("/custom")
# 定义函数 custom，参数: 
def custom():
    # 返回 JSONResponse(
    return JSONResponse(
        # 定义变量 status_code，赋值为 200,
        status_code=200,
        # 定义字典 content
        content={"msg": "ok"},
        # 定义字典 headers
        headers={
            # "X-Custom-Header": "value",
            "X-Custom-Header": "value",
            # "Cache-Control": "no-store",
            "Cache-Control": "no-store",
        # },
        },
    # )
    )
\`\`\`

这种方式完全控制响应,但会跳过 response_model 过滤(因为返回的是 Response 对象,不走 Pydantic 流程)。

## 六、设置 Cookie

通过 Response 对象设置 Cookie:

\`\`\`python
# 从 fastapi 导入 FastAPI, Response
from fastapi import FastAPI, Response

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login，参数: response: Response
def login(response: Response):
    # 设置 Cookie
    # response.set_cookie(
    response.set_cookie(
        # 定义变量 key，赋值为 "session_id",
        key="session_id",
        # 定义变量 value，赋值为 "abc123",
        value="abc123",
        httponly=True,   # JS 不能读,防 XSS
        secure=True,     # 只走 HTTPS
        samesite="lax",  # 防 CSRF
        max_age=3600,    # 1 小时后过期(秒)
    # )
    )
    # 返回 {"msg": "登录成功"}
    return {"msg": "登录成功"}
\`\`\`

详见下一章 Cookie 与 Session。

## 七、content_type 设置

返回非 JSON 内容时要指定 content_type:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 PlainTextResponse, HTMLResponse
from fastapi.responses import PlainTextResponse, HTMLResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /text 时触发
@app.get("/text", response_class=PlainTextResponse)
# 定义函数 text，参数: 
def text():
    # 返回 "纯文本内容"
    return "纯文本内容"

# 定义 GET 路由：访问 /html 时触发
@app.get("/html", response_class=HTMLResponse)
# 定义函数 html，参数: 
def html():
    # 返回 "<h1>标题</h1><p>HTML 内容</p>"
    return "<h1>标题</h1><p>HTML 内容</p>"
\`\`\`

\`response_class\` 参数指定响应类,FastAPI 会用它来序列化返回值。

## 八、RedirectResponse 重定向

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 RedirectResponse
from fastapi.responses import RedirectResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /old 时触发
@app.get("/old")
# 定义函数 old，参数: 
def old():
    # 临时重定向(307)
    # 返回 RedirectResponse(url="/new")
    return RedirectResponse(url="/new")

# 定义 GET 路由：访问 /old2 时触发
@app.get("/old2")
# 定义函数 old2，参数: 
def old2():
    # 永久重定向(301)
    # 返回 RedirectResponse(url="/new", status_code=301)
    return RedirectResponse(url="/new", status_code=301)
\`\`\`

- 默认状态码 307(Temporary Redirect),保留原请求方法。
- 301(Moved Permanently)是永久重定向,但老浏览器可能把 POST 改成 GET。
- 308(Permanent Redirect)是 301 的修正版,保留方法。

## 九、完整示例:创建资源返回 201 + Location

REST 规范里,创建资源应该返回 201 状态码和 Location 头指向新资源:

\`\`\`python
# 从 fastapi 导入 FastAPI, Response, status
from fastapi import FastAPI, Response, status
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 ItemIn，继承 BaseModel
class ItemIn(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 定义 Pydantic 数据模型 ItemOut，继承 BaseModel
class ItemOut(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 定义字典 db
db = {}
# 定义变量 next_id，赋值为 1
next_id = 1

# 装饰器：app.post
@app.post(
    # "/items",
    "/items",
    # 定义变量 response_model，赋值为 ItemOut,
    response_model=ItemOut,
    # 定义变量 status_code，赋值为 status.HTTP_201_CREATED,
    status_code=status.HTTP_201_CREATED,
# )
)
# 定义函数 create_item，参数: item: ItemIn, response: Response
def create_item(item: ItemIn, response: Response):
    # global next_id
    global next_id
    # 1. 存储新资源
    # 定义变量 saved，赋值为 ItemOut(id=next_id, **item.model_dump())
    saved = ItemOut(id=next_id, **item.model_dump())
    # db[next_id] = saved
    db[next_id] = saved
    # 定义变量 new_id，赋值为 next_id
    new_id = next_id
    # next_id += 1
    next_id += 1
    # 2. 设置 Location 头,指向刚创建的资源
    # response.headers["Location"] = f"/items/{new_id}"
    response.headers["Location"] = f"/items/{new_id}"
    # 3. 返回资源表示(会被 response_model 过滤)
    # 返回 saved
    return saved

# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}", response_model=ItemOut)
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 返回 db[item_id]
    return db[item_id]
\`\`\`

请求 \`POST /items\` body \`{"name":"书","price":9.9}\`,响应:
- 状态码 201
- Header: \`Location: /items/1\`
- Body: \`{"id":1,"name":"书","price":9.9}\`

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 以为 POST 自动 201 | FastAPI 默认 200 | 显式 status_code=201 |
| 204 还 return body | 204 不能有响应体 | 直接 return None |
| 401 和 403 混用 | 401 未登录,403 无权限 | 按语义区分 |
| 用裸数字 200 等 | 可读性差 | 用 status.HTTP_200_OK |
| 设置 Header 后 return Response | 重复设置 | 二选一 |
| RedirectResponse 改方法 | 301 可能 POST→GET | 用 307/308 保留方法 |
| response_class 和 response_model 冲突 | 自定义 Response 跳过过滤 | 注意取舍 |

## 十一、设计思想

HTTP 状态码是协议级别的「语义层」。用好状态码,API 才是 RESTful 的、可被代理/缓存/监控正确理解的。返回 200 + \`{"code": 404}\` 这种「假成功」是国内常见反模式,失去了 HTTP 语义,CDN 无法缓存、监控无法告警、代理无法处理。FastAPI 鼓励用真实的 HTTP 状态码。
`,
  },
  {
    id: "resp-cookie",
    group: "响应处理",
    icon: "🍪",
    title: "Cookie 与 Session",
    content: `
## 一、Cookie 原理

Cookie 是**浏览器存储的小段数据**,由服务器通过 \`Set-Cookie\` 响应头设置,之后浏览器每次请求同一域名都会自动带上 Cookie(在 \`Cookie\` 请求头里)。

特点:
- **大小限制**:约 4KB,只适合存少量数据。
- **域名绑定**:foo.com 的 Cookie 不会被发送到 bar.com。
- **自动携带**:同源请求自动带上,无需前端代码处理。
- **可设过期**:会话 Cookie(浏览器关了就没)或持久 Cookie(到过期时间)。

Cookie 是 HTTP 协议层面的机制,是「无状态 HTTP」变「有状态会话」的关键。

## 二、设置 Cookie

\`\`\`python
# 从 fastapi 导入 FastAPI, Response
from fastapi import FastAPI, Response

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login，参数: response: Response
def login(response: Response):
    # 通过 Response 对象设置 Cookie
    # response.set_cookie(
    response.set_cookie(
        key="user_id",        # Cookie 名
        value="42",           # Cookie 值
        max_age=3600,         # 过期时间(秒),3600=1 小时
        httponly=True,        # JS 读不到,防 XSS 偷 Cookie
        secure=True,          # 只走 HTTPS 传输
        samesite="lax",       # 跨站策略,防 CSRF
    # )
    )
    # 返回 {"msg": "登录成功"}
    return {"msg": "登录成功"}
\`\`\`

浏览器响应头会出现:
\`\`\`
Set-Cookie: user_id=42; Max-Age=3600; HttpOnly; Secure; SameSite=Lax
\`\`\`

之后浏览器对该域名的请求会带:
\`\`\`
Cookie: user_id=42
\`\`\`

## 三、读取 Cookie

用 \`Cookie()\` 声明 Cookie 参数:

\`\`\`python
# 从 fastapi 导入 FastAPI, Cookie
from fastapi import FastAPI, Cookie

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /me 时触发
@app.get("/me")
# 定义函数 me，参数: user_id: str | None = Cookie(default=None)
def me(user_id: str | None = Cookie(default=None)):
    # 条件判断：如果 user_id is None
    if user_id is None:
        # 返回 {"msg": "未登录"}
        return {"msg": "未登录"}
    # 返回 {"user_id": user_id}
    return {"user_id": user_id}
\`\`\`

- \`Cookie(default=None)\` 表示没传时为 None。
- 参数名 \`user_id\` 会自动对应 Cookie 名 \`user_id\`。
- 也可以指定别名:\`Cookie(alias="user_id")\`。

## 四、Cookie 属性详解

\`set_cookie\` 的关键参数:

| 属性 | 作用 | 推荐值 |
|---|---|---|
| key | Cookie 名 | 业务相关 |
| value | Cookie 值 | 短字符串 |
| max_age | 存活秒数 | 视场景 |
| expires | 绝对过期时间(datetime) | 二选一,优先 max_age |
| httponly | JS 不可读 | True(防 XSS) |
| secure | 仅 HTTPS | 生产 True |
| samesite | 跨站策略 | lax/strict/none |
| domain | 作用域域名 | 通常不设 |
| path | 作用路径 | 通常 / |

### 4.1 samesite 三种值

- **strict**:完全不允许跨站携带。最安全但体验差(从别的网站点链接过来也不带 Cookie,要重新登录)。
- **lax**:导航到目标站点的 GET 请求允许带,其他跨站不带。**默认值,推荐**。
- **none**:任意跨站都带。**必须配合 secure=True**,否则浏览器拒绝。第三方 Cookie 场景用,但现代浏览器逐渐默认禁用。

### 4.2 httponly 和 secure 必开

- **httponly=True**:\`document.cookie\` 读不到,防止 XSS 攻击偷 Cookie。会话 Cookie 必开。
- **secure=True**:只在 HTTPS 上传输,防止中间人窃听。生产环境必开。

## 五、删除 Cookie

\`\`\`python
# 定义 POST 路由：访问 /logout 时触发
@app.post("/logout")
# 定义函数 logout，参数: response: Response
def logout(response: Response):
    # 调用 response.delete_cookie()
    response.delete_cookie(key="user_id")
    # 返回 {"msg": "已退出"}
    return {"msg": "已退出"}
\`\`\`

\`delete_cookie\` 实际上是设置一个立即过期的同名 Cookie,让浏览器把它删掉。

**注意**:删除时要和设置时的属性(domain/path/secure 等)一致,否则删不掉。

## 六、Session 基于 Cookie 实现

Session 是「服务器端会话」的抽象,核心思路:

1. 服务器生成一个随机 \`session_id\`。
2. 把 \`session_id\` 通过 Cookie 发给浏览器。
3. 浏览器后续请求带上这个 Cookie。
4. 服务器用 \`session_id\` 在自己的存储里(内存/Redis/数据库)查到对应的会话数据。

**Cookie 存的是 ID,Session 数据在服务器**。这是 Cookie 和 Session 的本质区别:Cookie 在客户端,Session 在服务端。

## 七、fastapi-sessions / Starlette SessionMiddleware

Starlette 自带 \`SessionMiddleware\`,基于 Cookie 实现,用 \`itsdangerous\` 签名防篡改:

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 starlette.middleware.sessions 导入 SessionMiddleware
from starlette.middleware.sessions import SessionMiddleware

# 创建 FastAPI 应用实例
app = FastAPI()
# secret_key 用来签名,泄漏则可被伪造,务必保密
# 添加中间件: SessionMiddleware, secret_key="your-secret-key-change-me"
app.add_middleware(SessionMiddleware, secret_key="your-secret-key-change-me")

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login，参数: request: Request
def login(request: Request):
    # 把用户信息存到 session(实际存在签名后的 Cookie 里)
    # request.session["user_id"] = 42
    request.session["user_id"] = 42
    # request.session["role"] = "admin"
    request.session["role"] = "admin"
    # 返回 {"msg": "登录成功"}
    return {"msg": "登录成功"}

# 定义 GET 路由：访问 /me 时触发
@app.get("/me")
# 定义函数 me，参数: request: Request
def me(request: Request):
    # 定义变量 user_id，赋值为 request.session.get("user_id")
    user_id = request.session.get("user_id")
    # 条件判断：如果 user_id is None
    if user_id is None:
        # 返回 {"msg": "未登录"}
        return {"msg": "未登录"}
    # 返回 {"user_id": user_id, "role": request.session.get("role")}
    return {"user_id": user_id, "role": request.session.get("role")}

# 定义 POST 路由：访问 /logout 时触发
@app.post("/logout")
# 定义函数 logout，参数: request: Request
def logout(request: Request):
    # 调用 request.session.clear()
    request.session.clear()
    # 返回 {"msg": "已退出"}
    return {"msg": "已退出"}
\`\`\`

- \`request.session\` 是字典-like 对象。
- 数据存在 Cookie 里(签名后),不是服务器存储。所以**不适合存大量数据**(受 4KB 限制)。
- 用户能解码看到内容(但改不了,签名会失败),所以别存敏感数据。

## 八、JWT vs Session 对比

| 维度 | Session(Cookie) | JWT |
|---|---|---|
| 存储位置 | 服务端 | 客户端 |
| 状态 | 有状态(服务端要存) | 无状态 |
| 撤销 | 删服务端记录即可 | 难(只能等过期或换密钥) |
| 扩展性 | 多实例要共享 session 存储 | 天然分布式友好 |
| 大小 | Cookie 小(只存 ID) | token 较大(含 payload) |
| 安全 | 服务端可控 | 客户端持有,要注意存放 |
| 移动端 | Cookie 处理麻烦 | token 放 Header 方便 |
| 适用 | 传统 Web(浏览器) | API、移动端、SSO |

**选择建议**:
- 浏览器 Web 应用 → Session(自动 Cookie,httponly 安全)。
- 移动端 / SPA / 跨服务 → JWT。
- 高安全要求(随时能踢人下线) → Session(服务端可立即撤销)。

## 九、CSRF 防护

Cookie 自动携带的特性带来 CSRF(跨站请求伪造)风险:用户在 a.com 登录后,访问恶意网站 evil.com,evil.com 发起对 a.com 的请求,浏览器会自动带上 a.com 的 Cookie,导致「以用户身份」执行操作。

防护手段:
1. **samesite=lax/strict**:浏览器限制跨站 Cookie 携带,从源头防。**现代浏览器默认 lax**。
2. **CSRF Token**:服务端发一个随机 token,前端表单带上,服务端校验。
3. **SameSite + 二次校验**:要求请求头里带自定义 Header(如 \`X-CSRF-Token\`),跨站 form 提交无法自定义 Header。

**API 用 JWT(放 Authorization Header)天然无 CSRF**,因为 Header 不会自动跨站携带。

## 十、完整示例:登录设置 Cookie

\`\`\`python
# 从 fastapi 导入 FastAPI, Response, Cookie, HTTPException
from fastapi import FastAPI, Response, Cookie, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟用户库
# 定义字典 USERS
USERS = {"alice": {"id": 1, "password": "123456", "role": "admin"}}

# 定义 Pydantic 数据模型 LoginIn，继承 BaseModel
class LoginIn(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 password，类型: str
    password: str

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login，参数: data: LoginIn, response: Response
def login(data: LoginIn, response: Response):
    # 定义变量 user，赋值为 USERS.get(data.username)
    user = USERS.get(data.username)
    # 1. 校验账号密码
    # 条件判断：如果 not user or user["password"] != data.password
    if not user or user["password"] != data.password:
        # 抛出 HTTPException 异常: status_code=401, detail="账号或密码错误"
        raise HTTPException(status_code=401, detail="账号或密码错误")
    # 2. 设置会话 Cookie(实际项目存 session_id,这里简化)
    # response.set_cookie(
    response.set_cookie(
        # 定义变量 key，赋值为 "session_id",
        key="session_id",
        # 定义变量 value，赋值为 f"session-{user['id']}",
        value=f"session-{user['id']}",
        # 定义变量 max_age，赋值为 3600,
        max_age=3600,
        # 定义变量 httponly，赋值为 True,
        httponly=True,
        secure=False,      # 开发环境,生产要 True
        # 定义变量 samesite，赋值为 "lax",
        samesite="lax",
    # )
    )
    # 返回 {"msg": "登录成功", "user_id": user["id"]}
    return {"msg": "登录成功", "user_id": user["id"]}

# 定义 GET 路由：访问 /me 时触发
@app.get("/me")
# 定义函数 me，参数: session_id: str | None = Cookie(default=None)
def me(session_id: str | None = Cookie(default=None)):
    # 3. 校验 Cookie
    # 条件判断：如果 not session_id or not session_id.startswith("session-")
    if not session_id or not session_id.startswith("session-"):
        # 抛出 HTTPException 异常: status_code=401, detail="未登录"
        raise HTTPException(status_code=401, detail="未登录")
    # 定义变量 user_id，赋值为 int(session_id.split("-")[1])
    user_id = int(session_id.split("-")[1])
    # 返回 {"user_id": user_id, "role": USERS[[u for u in USERS if USERS[u]["id"]==user_id][0]]["role"]}
    return {"user_id": user_id, "role": USERS[[u for u in USERS if USERS[u]["id"]==user_id][0]]["role"]}

# 定义 POST 路由：访问 /logout 时触发
@app.post("/logout")
# 定义函数 logout，参数: response: Response
def logout(response: Response):
    # 调用 response.delete_cookie()
    response.delete_cookie("session_id")
    # 返回 {"msg": "已退出"}
    return {"msg": "已退出"}
\`\`\`

## 十一、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| Cookie 存敏感数据 | 客户端可见(除非 httponly 但仍是客户端) | 服务端存,只发 ID |
| 不设 httponly | XSS 可偷 Cookie | 必开 httponly |
| 不设 secure | 中间人可窃听 | 生产必开 secure |
| samesite=none 不配 secure | 浏览器拒绝 | none 必配 secure |
| Session 存大量数据 | Cookie 超限截断 | 服务端 Session 存储 |
| JWT 存 Cookie 还前端读 | 失去 httponly 保护 | 二选一,理清场景 |
| 删 Cookie 属性不一致 | 删不掉 | domain/path 要对齐 |
| 以为 Cookie 跨域可用 | 同源策略 | 跨域用 JWT 或 CORS |

## 十二、设计思想

Cookie 和 Session 是 Web 有状态化的基石。理解它们的本质:Cookie 是客户端存储 + 自动携带,Session 是服务端存储 + ID 映射。JWT 的兴起让 API 走向无状态化,但浏览器场景里 Session 仍有一席之地。选择技术要看场景,不要盲从。
`,
  },
  {
    id: "resp-stream",
    group: "响应处理",
    icon: "🌊",
    title: "流式响应与文件下载",
    content: `
## 一、为什么需要流式响应

普通响应是一次性把整个响应体生成好再发送。问题:

1. **大文件占内存**:1GB 文件全读进内存再 return,内存爆炸。
2. **实时数据延迟**:AI 流式回答、日志推送,要边生成边发,不能等全部完成。
3. **长任务反馈**:导出大报表,边算边吐,用户看到进度。

流式响应解决这些:**数据分块产出,边产边发**,不一次性占用内存,客户端能渐进式收到数据。

## 二、StreamingResponse 流式响应

\`StreamingResponse\` 接收一个**迭代器**(生成器/列表),逐块产出内容:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /stream 时触发
@app.get("/stream")
# 定义函数 stream，参数: 
def stream():
    # 生成器函数:逐块产出
    # 定义函数 gen，参数: 
    def gen():
        # 遍历 range(5)，取 i
        for i in range(5):
            # yield 一块数据
            # 生成值: f"chunk-{i}\\n"
            yield f"chunk-{i}\\n"
    # media_type 决定 Content-Type
    # 返回 StreamingResponse(gen(), media_type="text/plain")
    return StreamingResponse(gen(), media_type="text/plain")
\`\`\`

- \`gen()\` 是生成器,每次 \`yield\` 产出一块。
- FastAPI 会把每块立即 flush 给客户端,不等所有块产出。
- \`media_type\` 设置 \`Content-Type\` 头。

## 三、大文件下载(分块传输)

直接 \`return file\` 会把整个文件读进内存。用流式响应分块读取:

\`\`\`python
# 定义 GET 路由：访问 /download/{filename} 时触发
@app.get("/download/{filename}")
# 定义函数 download，参数: filename: str
def download(filename: str):
    # 定义函数 iterfile，参数: 
    def iterfile():
        # 8KB 一块读取,避免一次性读全文件
        # 使用上下文管理器 open(f"/data/{filename}", "rb")，赋值为 f
        with open(f"/data/{filename}", "rb") as f:
            while chunk := f.read(8192):  # 海象运算符,3.8+
                # 生成值: chunk
                yield chunk
    # 返回 StreamingResponse(iterfile(), media_type="application/octet-stream")
    return StreamingResponse(iterfile(), media_type="application/octet-stream")
\`\`\`

- \`f.read(8192)\` 每次读 8KB。
- \`:=\` 海象运算符:赋值同时判断,空字节时停止。
- 内存占用恒定(只有一块在内存),适合大文件。

## 四、FileResponse 直接返回文件

\`FileResponse\` 专门处理文件,自动设置 content-type、支持断点续传:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 FileResponse
from fastapi.responses import FileResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /file/{filename} 时触发
@app.get("/file/{filename}")
# 定义函数 get_file，参数: filename: str
def get_file(filename: str):
    # FileResponse 自动处理:
    # 1. 设置 Content-Type(根据扩展名)
    # 2. 设置 Content-Length
    # 3. 支持 Range 请求(断点续传)
    # 4. 流式读取,不占内存
    # 返回 FileResponse(
    return FileResponse(
        # 定义变量 path，赋值为 f"/data/{filename}",
        path=f"/data/{filename}",
        filename=filename,        # 触发浏览器下载(而不是预览)
        media_type="application/pdf",  # 可选,不传会自动推断
    # )
    )
\`\`\`

- \`filename\` 参数设置 \`Content-Disposition: attachment\`,浏览器会下载而不是预览。
- 不传 \`filename\` 则默认 inline(浏览器尝试预览)。
- FileResponse 是文件下载的**首选**,功能比 StreamingResponse 全(自动 Range 支持)。

## 五、Content-Disposition 控制下载文件名

\`\`\`
Content-Disposition: attachment; filename="report.pdf"
\`\`\`

- \`attachment\`:浏览器下载(弹出保存对话框)。
- \`inline\`:浏览器内联显示(能预览就预览)。
- \`filename\`:建议的保存文件名。

中文文件名要用 RFC 5987 编码:
\`\`\`
Content-Disposition: attachment; filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf
\`\`\`

FileResponse 的 \`filename\` 参数会自动处理这个编码。

## 六、各类 Response 对比

| Response 类 | 用途 | Content-Type |
|---|---|---|
| JSONResponse | 默认,返回 JSON | application/json |
| HTMLResponse | 返回 HTML | text/html |
| PlainTextResponse | 纯文本 | text/plain |
| RedirectResponse | 重定向 | - |
| StreamingResponse | 流式(生成器) | 自定义 |
| FileResponse | 文件下载 | 按扩展名 |
| Response | 原始(自定义) | 自定义 |

## 七、自定义 Response

最底层的 \`Response\` 直接构造:

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 Response
from fastapi.responses import Response

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /xml 时触发
@app.get("/xml")
# 定义函数 xml，参数: 
def xml():
    # 定义变量 content，赋值为 "<book><title>Python</title></book>"
    content = "<book><title>Python</title></book>"
    # 返回 Response(content=content, media_type="application/xml")
    return Response(content=content, media_type="application/xml")
\`\`\`

返回 XML、CSV、图片等非 JSON 内容时用。

## 八、SSE(Server-Sent Events)流式推送

SSE 是服务器单向推送(服务器→客户端),用 \`text/event-stream\`:

\`\`\`python
# 导入 asyncio 模块
import asyncio
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /sse 时触发
@app.get("/sse")
# 定义异步函数 sse，参数: 
async def sse():
    # 定义异步函数 event_stream，参数: 
    async def event_stream():
        # 遍历 range(5)，取 i
        for i in range(5):
            # SSE 格式:每条消息以 "data: " 开头,\\n\\n 结尾
            # 生成值: f"data: 消息 {i}\\n\\n"
            yield f"data: 消息 {i}\\n\\n"
            await asyncio.sleep(1)  # 模拟异步等待
    # 返回 StreamingResponse(event_stream(), media_type="text/event-stream")
    return StreamingResponse(event_stream(), media_type="text/event-stream")
\`\`\`

- 前端用 \`EventSource\` API 接收。
- 适合服务器推送(通知、实时更新),比 WebSocket 简单(单向即可)。
- 注意是 async 生成器,要 \`yield\` + \`await\`。

## 九、Range 请求(断点续传)

下载大文件中断后,客户端可以用 Range 头请求剩余部分。FileResponse 自动支持:

\`\`\`
GET /file/big.zip
Range: bytes=1048576-  # 从 1MB 处开始

响应:
HTTP/1.1 206 Partial Content
Content-Range: bytes 1048576-10485759/10485760
Content-Length: 9437184
\`\`\`

- 状态码 206(Partial Content)表示部分内容。
- FileResponse 自动处理这些,无需手动写。
- 流媒体、下载工具(迅雷/IDM)靠这个实现多线程断点续传。

如果手动实现 Range 支持很复杂,所以文件下载**优先用 FileResponse**。

## 十、完整示例:文件下载接口

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 fastapi.responses 导入 FileResponse, StreamingResponse
from fastapi.responses import FileResponse, StreamingResponse
# 导入 os 模块
import os

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义变量 DATA_DIR，赋值为 "/data"
DATA_DIR = "/data"

# 定义 GET 路由：访问 /download/{filename} 时触发
@app.get("/download/{filename}")
# 定义函数 download，参数: filename: str
def download(filename: str):
    # 定义变量 filepath，赋值为 os.path.join(DATA_DIR, filename)
    filepath = os.path.join(DATA_DIR, filename)
    # 1. 校验文件存在
    # 条件判断：如果 not os.path.exists(filepath)
    if not os.path.exists(filepath):
        # 抛出 HTTPException 异常: status_code=404, detail="文件不存在"
        raise HTTPException(status_code=404, detail="文件不存在")
    # 2. 防止路径穿越(如 ../../etc/passwd)
    # 条件判断：如果 not os.path.abspath(filepath).startswith(os.path.abspath(DATA_DIR))
    if not os.path.abspath(filepath).startswith(os.path.abspath(DATA_DIR)):
        # 抛出 HTTPException 异常: status_code=403, detail="禁止访问"
        raise HTTPException(status_code=403, detail="禁止访问")
    # 3. 用 FileResponse 返回
    # filename 参数触发下载并设置建议文件名
    # 返回 FileResponse(
    return FileResponse(
        # 定义变量 path，赋值为 filepath,
        path=filepath,
        # 定义变量 filename，赋值为 filename,
        filename=filename,
    # )
    )

# 流式版本(自定义控制更多)
# 定义 GET 路由：访问 /stream/{filename} 时触发
@app.get("/stream/{filename}")
# 定义函数 stream，参数: filename: str
def stream(filename: str):
    # 定义变量 filepath，赋值为 os.path.join(DATA_DIR, filename)
    filepath = os.path.join(DATA_DIR, filename)
    # 条件判断：如果 not os.path.exists(filepath)
    if not os.path.exists(filepath):
        # 抛出 HTTPException 异常: status_code=404, detail="文件不存在"
        raise HTTPException(status_code=404, detail="文件不存在")

    # 定义函数 iterfile，参数: 
    def iterfile():
        # 使用上下文管理器 open(filepath, "rb")，赋值为 f
        with open(filepath, "rb") as f:
            # 当 chunk := f.read(8192) 为真时循环
            while chunk := f.read(8192):
                # 生成值: chunk
                yield chunk

    # 返回 StreamingResponse(
    return StreamingResponse(
        # 调用 iterfile()
        iterfile(),
        # 定义变量 media_type，赋值为 "application/octet-stream",
        media_type="application/octet-stream",
        # 定义字典 headers
        headers={
            # 手动设置下载文件名
            # "Content-Disposition": f'attachment; filename="{fi
            "Content-Disposition": f'attachment; filename="{filename}"',
        # },
        },
    # )
    )
\`\`\`

**关键点**:
- 路径校验防穿越(\`os.path.abspath\` 检查)。
- FileResponse 自动 Range,StreamingResponse 不自动。
- 大文件用 StreamingResponse 控制块大小。

## 十一、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 大文件直接 return bytes | 内存爆炸 | 用 StreamingResponse/FileResponse |
| 忘了 media_type | 浏览器当文件下载或乱码 | 显式指定 |
| 中文文件名不编码 | 部分浏览器乱码 | 用 FileResponse 自动编码 |
| StreamingResponse 不支持 Range | 断点续传失效 | 文件用 FileResponse |
| 同步生成器在 async 路由 | 阻塞事件循环 | 用 async 生成器或 run_in_threadpool |
| SSE 忘了 \\n\\n | 浏览器收不到消息 | 每条 data 后空行 |
| 不校验文件路径 | 路径穿越漏洞 | abspath + startswith |

## 十二、设计思想

流式响应是处理「大」和「实时」的关键。理解它的核心:**数据不需要全部就绪才能发送**,边产边发。FileResponse 是文件下载的最佳实践(自动 Range),StreamingResponse 适合自定义流(SSE、动态生成)。选择响应类型要看场景:JSON 数据用默认,文件用 FileResponse,自定义流用 StreamingResponse。
`,
  },
];
