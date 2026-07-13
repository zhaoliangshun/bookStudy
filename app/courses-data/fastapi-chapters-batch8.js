// =============================================================
// FastAPI 应用开发实战教程 - 第 8 批章节（异常处理 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-http-exception    : HTTPException
//   fa-custom-exception  : 自定义异常与处理器
//   fa-global-exception  : 全局异常处理
//   fa-exception-best    : 异常处理最佳实践
// ============================================================

export const chapters = [
  {
    id: "fa-http-exception",
    group: "异常处理",
    icon: "⚠️",
    title: "HTTPException",
    content: `
## 一、为什么需要 HTTPException

写 API 最常见的场景是:客户端请求一个不存在的资源、权限不够、参数非法。如果这些情况你只是 \`return {"error": "xxx"}\`,状态码还是 200,客户端无法靠状态码判断成败,这违反了 HTTP 语义。

HTTP 协议规定了丰富的状态码:404 表示资源不存在、403 表示无权限、401 表示未认证、422 表示参数校验失败、500 表示服务器内部错误。FastAPI 提供 \`HTTPException\` 让你「主动抛出」一个带正确状态码的 HTTP 错误响应。

\`HTTPException\` 的核心思想是:它不是普通异常,而是一个「会被 FastAPI 自动捕获并转成 HTTP 响应」的特殊异常。你 raise 它,FastAPI 拦截后生成一个 JSON 响应,状态码就是你指定的,响应体默认是 \`{"detail": ...}\`。

类比:\`return\` 是「正常交付货物」,而 \`raise HTTPException\` 是「打一张标准格式的拒收单」。两者都会结束请求,但后者带着标准错误信息。

## 二、HTTPException 基本用法

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
# HTTPException 是 FastAPI 提供的「HTTP 异常专用类」
# 它会被 FastAPI 内置的异常处理器捕获,自动转成带状态码的 JSON 响应
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟数据库:用字典存放商品
# 定义变量 items_db，赋值为 {1: {"name": "苹果", "price": 5}, 2: {"name": "香蕉", "price": 3}}
items_db = {1: {"name": "苹果", "price": 5}, 2: {"name": "香蕉", "price": 3}}

# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
# item_id: int 表示路径参数会被自动转成 int 类型,非数字会触发 422
def get_item(item_id: int):
    # 判断 item_id 是否在数据库中
    if item_id not in items_db:
        # 资源不存在,抛出 404 异常
        # 抛出 HTTPException 异常: status_code=404, detail="商品不存在"
        # status_code:HTTP 状态码,404 表示资源不存在
        # detail:错误详情,会被 JSON 序列化后放在响应体 {"detail": ...} 中
        # raise 而非 return:raise 会中断函数执行,FastAPI 拦截后生成响应
        raise HTTPException(status_code=404, detail="商品不存在")
    # 正常情况:返回商品数据
    # 只有 raise 未触发时,这里才会执行
    return {"item": items_db[item_id]}
\`\`\`

请求 \`/items/99\` 时,响应如下,状态码为 404:

\`\`\`json
{
  "detail": "商品不存在"
}
\`\`\`

注意:这里用的是 \`raise\` 而不是 \`return\`。raise 之后函数立即中断,后续代码不会执行。FastAPI 内部有一个异常处理器专门捕获 \`HTTPException\`,把它转成响应。

避坑:\`HTTPException\` 不是从 \`Exception\` 直接继承的,它继承自 Starlette 的 \`HTTPException\`。这意味着你自己写的 \`exception_handler(Exception)\` 默认不会捕获它(后面章节详解)。

## 三、status_code 和 detail 参数

\`HTTPException\` 有两个核心参数:

- **status_code**:HTTP 状态码,整数。常用 400(请求错误)、401(未认证)、403(无权限)、404(不存在)、409(冲突)、422(校验失败)、500(服务器错误)。
- **detail**:错误详情。可以是字符串、字典、列表,会被 JSON 序列化后放在响应体的 \`detail\` 字段里。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 字符串详情:最简单的用法
# 抛出 HTTPException 异常: status_code=404, detail="商品不存在"
raise HTTPException(404, "商品不存在")

# 字典详情:携带结构化错误信息
# 抛出 HTTPException 异常: status_code=400, detail={"field": "username", "msg": "长度必须 6-20"}
raise HTTPException(
    status_code=400,
    detail={"field": "username", "msg": "长度必须 6-20"}
)

# 列表详情:多个错误一次性返回
# 抛出 HTTPException 异常: status_code=422, detail=[{"field": "name", "msg": "必填"}, {"field": "age", "msg": "必须正整数"}]
raise HTTPException(
    status_code=422,
    detail=[
        {"field": "name", "msg": "必填"},
        {"field": "age", "msg": "必须正整数"}
    ]
)
\`\`\`

为什么 detail 支持任意 JSON 可序列化类型?因为不同业务对错误信息的需求不同。简单接口用字符串够了,复杂表单需要返回每个字段的错误。支持结构化数据让你灵活选择。

避坑:detail 里的数据必须是 JSON 可序列化的。如果传了一个 datetime 对象、自定义类、或 SQLAlchemy 模型实例,会报序列化错误。需要先转成字典或字符串。

## 四、headers 参数

\`HTTPException\` 还有一个 \`headers\` 参数,用来给错误响应附加 HTTP 头。最典型的场景是 401 未认证时返回 \`WWW-Authenticate\` 头,告诉客户端该用什么认证方式。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /secure 时触发
@app.get("/secure")
# 定义函数 secure_endpoint，参数: token: str
def secure_endpoint(token: str):
    # 如果 token 为空或不等于预期值
    if token != "secret123":
        # 401 未认证,通过 headers 告诉客户端使用 Bearer 认证
        # 抛出 HTTPException 异常: status_code=401, detail="未认证", headers={"WWW-Authenticate": "Bearer"}
        raise HTTPException(
            status_code=401,
            detail="未认证",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # 认证通过
    return {"message": "欢迎进入安全区"}
\`\`\`

响应头会包含 \`WWW-Authenticate: Bearer\`,客户端(比如浏览器或前端框架)看到这个头就知道要用 Bearer Token 方式重新认证。

为什么 headers 参数有用?HTTP 规范里,某些状态码「应该」带特定头。401 就该带 \`WWW-Authenticate\`,429 限流就该带 \`Retry-After\`。用 headers 参数能让你符合规范。

\`\`\`python
# 限流场景:429 配合 Retry-After 头
# 抛出 HTTPException 异常: status_code=429, detail="请求过于频繁", headers={"Retry-After": "60"}
raise HTTPException(
    status_code=429,
    detail="请求过于频繁,请 60 秒后重试",
    headers={"Retry-After": "60"}
)
\`\`\`

## 五、在路由中抛出 HTTPException

最常见的用法:在路由函数内部根据业务条件抛出。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟用户表
# 定义变量 users_db，赋值为 {"alice": {"age": 20, "balance": 100}, "bob": {"age": 17, "balance": 50}}
users_db = {"alice": {"age": 20, "balance": 100}, "bob": {"age": 17, "balance": 50}}

# 定义 POST 路由：访问 /users/{username}/withdraw 时触发
@app.post("/users/{username}/withdraw")
# 定义函数 withdraw，参数: username: str, amount: int
def withdraw(username: str, amount: int):
    # 1. 用户不存在 -> 404
    if username not in users_db:
        # 抛出 HTTPException 异常: status_code=404, detail="用户不存在"
        raise HTTPException(status_code=404, detail="用户不存在")
    # 取出用户
    user = users_db[username]
    # 2. 未成年人禁止提现 -> 403
    if user["age"] < 18:
        # 抛出 HTTPException 异常: status_code=403, detail="未成年人禁止提现"
        raise HTTPException(status_code=403, detail="未成年人禁止提现")
    # 3. 余额不足 -> 400
    if amount > user["balance"]:
        # 抛出 HTTPException 异常: status_code=400, detail="余额不足"
        raise HTTPException(status_code=400, detail="余额不足")
    # 4. 扣减余额
    user["balance"] -= amount
    # 返回成功结果
    return {"username": username, "remaining": user["balance"]}
\`\`\`

这种「层层校验,不满足就 raise」的写法叫「卫语句」(guard clause)。它的好处是:每个校验条件独立、清晰,不需要嵌套 if-else。读到哪一行就知道什么情况会报什么错。

## 六、在依赖中抛出 HTTPException

依赖注入(Dependency)里也能抛 \`HTTPException\`,这是做权限校验的经典位置。把鉴权逻辑抽成依赖,多个路由复用。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException, Depends, Header
# Depends:声明依赖注入,FastAPI 会自动调用依赖函数并注入返回值
# Header:从请求头读取参数,自动做类型转换和必填校验
from fastapi import FastAPI, HTTPException, Depends, Header

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟 token -> 用户 的映射
# 定义变量 valid_tokens，赋值为 {"token-abc": {"username": "alice", "role": "admin"}, "token-xyz": {"username": "bob", "role": "user"}}
valid_tokens = {
    "token-abc": {"username": "alice", "role": "admin"},
    "token-xyz": {"username": "bob", "role": "user"}
}

# 定义函数 get_current_user，参数: authorization: str = Header(...)
# Header(...):从 Authorization 请求头读取,... 表示必填(不存在则 422)
# 函数名会自动转成 header 名: get_current_user -> get-current-user
# 这里用参数名 authorization,对应请求头 Authorization(大小写不敏感)
def get_current_user(authorization: str = Header(...)):
    # 校验 Authorization 头是否存在且格式正确
    # Bearer 认证格式:"Bearer <token>",前 7 个字符是 "Bearer "
    if not authorization.startswith("Bearer "):
        # 格式错误 -> 401
        # 抛出 HTTPException 异常: status_code=401, detail="认证格式错误,应为 Bearer <token>"
        raise HTTPException(status_code=401, detail="认证格式错误,应为 Bearer <token>")
    # 提取 token 部分
    # authorization[7:] 切片,跳过 "Bearer "(7 个字符),取后面的 token
    token = authorization[7:]
    # 校验 token 是否有效
    if token not in valid_tokens:
        # 无效 token -> 401
        # 抛出 HTTPException 异常: status_code=401, detail="token 无效"
        raise HTTPException(status_code=401, detail="token 无效")
    # 返回当前用户信息
    # 返回值会被注入到依赖此函数的路由参数中
    return valid_tokens[token]

# 定义函数 require_admin，参数: user: dict = Depends(get_current_user)
# Depends(get_current_user):声明依赖,FastAPI 会先执行 get_current_user
# get_current_user 的返回值(user)会作为参数注入
# 这形成「依赖链」:require_admin 依赖 get_current_user
def require_admin(user: dict = Depends(get_current_user)):
    # 校验角色是否为 admin
    if user["role"] != "admin":
        # 非管理员 -> 403
        # 抛出 HTTPException 异常: status_code=403, detail="需要管理员权限"
        # 403 表示「认证了但无权限」,区别于 401「未认证」
        raise HTTPException(status_code=403, detail="需要管理员权限")
    # 返回用户
    return user

# 定义 DELETE 路由：访问 /users/{username} 时触发,依赖 require_admin
@app.delete("/users/{username}")
# 定义函数 delete_user，参数: username: str, admin: dict = Depends(require_admin)
# admin 参数:FastAPI 自动执行依赖链 require_admin -> get_current_user
# 任何一环 raise,整个请求中断,FastAPI 返回对应错误响应
def delete_user(username: str, admin: dict = Depends(require_admin)):
    # 只有管理员能执行删除
    # 能走到这里说明依赖链全部通过(token 有效 + 角色是 admin)
    return {"deleted": username, "by": admin["username"]}
\`\`\`

在依赖里抛异常的好处:路由函数只关心核心业务,鉴权逻辑完全解耦。\`require_admin\` 依赖 \`get_current_user\`,形成依赖链。任何一环 raise,整个请求中断,FastAPI 自动返回对应错误。

怎么想:把「谁能访问」和「做什么」分开。依赖负责「能不能做」,路由负责「做什么」。这样权限规则变化时只改依赖,不影响业务路由。

## 七、HTTPException 的响应格式

默认情况下,HTTPException 的响应体是 \`{"detail": <你的 detail>}\`。FastAPI 文档里(/docs)也会根据这个格式展示错误响应。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /demo 时触发
@app.get("/demo")
# 定义函数 demo
def demo():
    # 抛出带字典 detail 的异常
    # 抛出 HTTPException 异常: status_code=418, detail={"reason": "我是茶壶", "hint": "别用茶壶煮咖啡"}
    raise HTTPException(
        status_code=418,
        detail={"reason": "我是茶壶", "hint": "别用茶壶煮咖啡"}
    )
\`\`\`

响应体:
\`\`\`json
{
  "detail": {
    "reason": "我是茶壶",
    "hint": "别用茶壶煮咖啡"
  }
}
\`\`\`

如果你不满意默认的 \`{"detail": ...}\` 格式,想统一成 \`{"code": ..., "message": ..., "data": null}\`,那就需要自定义异常处理器(下一章讲)。HTTPException 本身无法改变这个外层结构。

## 八、常见状态码的使用场景

选对状态码是 API 设计的基本功。下面是 FastAPI 项目里最常用的状态码及适用场景:

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 400 | 请求错误 | 参数格式对但语义错(如 amount 为负数) |
| 401 | 未认证 | 没带 token 或 token 无效 |
| 403 | 无权限 | 认证了但角色不够 |
| 404 | 不存在 | 资源找不到 |
| 409 | 冲突 | 唯一约束冲突、状态不允许操作 |
| 422 | 校验失败 | FastAPI 自动参数校验失败(类型、必填等) |
| 429 | 限流 | 请求频率超限 |
| 500 | 服务器错误 | 代码 bug、数据库挂了 |

怎么想:先区分「客户端的问题」(4xx)还是「服务端的问题」(5xx)。4xx 里再细分:认证问题(401/403)、资源问题(404/409)、参数问题(400/422)。选错状态码会让客户端误判,比如把 404 写成 400,客户端的缓存逻辑就会失效。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟已存在的用户名集合
# 定义变量 existing_names，赋值为 {"alice", "bob"}
existing_names = {"alice", "bob"}

# 定义 POST 路由：访问 /register 时触发
@app.post("/register")
# 定义函数 register，参数: username: str
def register(username: str):
    # 400:参数语义错误(用户名为空字符串虽类型对但非法)
    if not username:
        # 抛出 HTTPException 异常: status_code=400, detail="用户名不能为空"
        raise HTTPException(status_code=400, detail="用户名不能为空")
    # 409:用户名已被占用,资源冲突
    if username in existing_names:
        # 抛出 HTTPException 异常: status_code=409, detail="用户名已存在"
        raise HTTPException(status_code=409, detail="用户名已存在")
    # 注册成功
    existing_names.add(username)
    # 返回结果
    return {"username": username, "registered": True}
\`\`\`

## 九、实战:资源不存在(404) + 权限不足(403) + 验证失败(422)

综合演示三种最常见的错误场景,模拟一个文章管理系统。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException, Depends, Header
from fastapi import FastAPI, HTTPException, Depends, Header
# 从 typing 导入 Optional
from typing import Optional

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟文章数据库:每个文章有 id, title, content, owner
# 定义变量 articles_db，赋值为 {1: {"id": 1, "title": "FastAPI 入门", "content": "...", "owner": "alice"}}
articles_db = {
    1: {"id": 1, "title": "FastAPI 入门", "content": "...", "owner": "alice"},
    2: {"id": 2, "title": "异常处理", "content": "...", "owner": "bob"}
}
# 自增 ID 计数器
next_id = 3

# 简单鉴权依赖:从 header 读用户名
# 定义函数 get_current_user，参数: x_user: Optional[str] = Header(None)
def get_current_user(x_user: Optional[str] = Header(None)):
    # 没带 x-user 头 -> 401 未认证
    if not x_user:
        # 抛出 HTTPException 异常: status_code=401, detail="请先登录"
        raise HTTPException(status_code=401, detail="请先登录")
    # 返回用户名
    return x_user

# GET /articles/{article_id}:获取文章,可能 404
# 定义 GET 路由：访问 /articles/{article_id} 时触发
@app.get("/articles/{article_id}")
# 定义函数 get_article，参数: article_id: int, user: str = Depends(get_current_user)
def get_article(article_id: int, user: str = Depends(get_current_user)):
    # 文章不存在 -> 404
    if article_id not in articles_db:
        # 抛出 HTTPException 异常: status_code=404, detail=f"文章 {article_id} 不存在"
        raise HTTPException(status_code=404, detail=f"文章 {article_id} 不存在")
    # 返回文章
    return articles_db[article_id]

# PUT /articles/{article_id}:编辑文章,可能 404 或 403
# 定义 PUT 路由：访问 /articles/{article_id} 时触发
@app.put("/articles/{article_id}")
# 定义函数 update_article，参数: article_id: int, title: str, user: str = Depends(get_current_user)
def update_article(article_id: int, title: str, user: str = Depends(get_current_user)):
    # 1. 文章不存在 -> 404
    if article_id not in articles_db:
        # 抛出 HTTPException 异常: status_code=404, detail="文章不存在"
        raise HTTPException(status_code=404, detail="文章不存在")
    # 取出文章
    article = articles_db[article_id]
    # 2. 不是作者 -> 403 无权限
    if article["owner"] != user:
        # 抛出 HTTPException 异常: status_code=403, detail="只能编辑自己的文章"
        raise HTTPException(status_code=403, detail="只能编辑自己的文章")
    # 修改标题
    article["title"] = title
    # 返回更新后的文章
    return article

# POST /articles:创建文章,422 由 FastAPI 自动触发
# 定义 POST 路由：访问 /articles 时触发
@app.post("/articles")
# 定义函数 create_article，参数: title: str, content: str, user: str = Depends(get_current_user)
def create_article(title: str, content: str, user: str = Depends(get_current_user)):
    # 声明使用全局 next_id
    global next_id
    # title 和 content 是必填的 str,如果不传或类型不对,FastAPI 自动返回 422
    # 这里不需要手动 raise,框架帮你做了
    # 创建新文章
    # 定义变量 new_article，赋值为 {"id": next_id, "title": title, "content": content, "owner": user}
    new_article = {"id": next_id, "title": title, "content": content, "owner": user}
    # 存入数据库
    articles_db[next_id] = new_article
    # id 自增
    next_id += 1
    # 返回新文章
    return new_article
\`\`\`

测试要点:
- \`GET /articles/99\` 带 \`X-User: alice\` 头 -> 404
- \`PUT /articles/1\` 带 \`X-User: bob\` 头 -> 403(只能编辑自己的)
- \`POST /articles\` 不传 \`title\` 参数 -> 422(FastAPI 自动校验)
- 不带 \`X-User\` 头 -> 401

注意 422 和其他状态码的区别:404/403/401 是你「主动 raise」的,而 422 是 FastAPI 在参数进入你的函数之前自动触发的。你甚至不用写任何校验代码,只要声明了类型,\`title: str\` 必填,不传就 422。

## 十、常见错误与避坑指南

**错误 1:return 一个错误响应而不是 raise HTTPException**

\`\`\`python
# 错误写法:状态码还是 200,客户端误以为成功
# 定义函数 bad_example
def bad_example():
    if True:
        return {"error": "出错了"}  # 状态码 200,错误!
\`\`\`

正确做法是 raise HTTPException,让状态码正确反映错误。

**错误 2:detail 里放不可序列化的对象**

\`\`\`python
# 导入 datetime 模块
import datetime
# 错误:datetime 对象不能直接 JSON 序列化
# 抛出 HTTPException 异常: status_code=400, detail=datetime.datetime.now()  # 会报错
raise HTTPException(400, detail=datetime.datetime.now())  # 报错!
\`\`\`

正确:转成字符串 \`detail=str(datetime.datetime.now())\` 或用 ISO 格式。

**错误 3:在异步函数里忘了 raise 而是 return 异常对象**

\`\`\`python
# 错误:return 一个异常对象不会触发 FastAPI 的异常处理
# 定义函数 wrong
def wrong():
    if True:
        return HTTPException(404, "不存在")  # 不会生效,会返回一个异常对象的 JSON
\`\`\`

必须用 \`raise\`,不能用 \`return\`。

**错误 4:用 500 代替业务错误**

业务错误(如余额不足)应该用 4xx,不要用 500。500 表示「服务器出 bug 了」,运维看到 500 会告警。余额不足是客户端的问题,不该触发告警。

## 十一、设计思想

\`HTTPException\` 的设计体现了「用 HTTP 语义表达业务错误」的思想。状态码是 HTTP 协议的语言,客户端、网关、监控系统都认。你尊重状态码,整个系统就能协同工作;你滥用 200 包错误,所有协作方都要特殊处理。

但 \`HTTPException\` 也有局限:它的响应格式固定为 \`{"detail": ...}\`,且它「混入了 HTTP 概念」(状态码、headers)。当业务逻辑变复杂,你需要统一的错误码体系、统一的响应格式时,就需要自定义异常——这是下一章的主题。

记住原则:简单的、和 HTTP 强相关的错误用 \`HTTPException\`;复杂的、有业务语义的错误用自定义异常。两者配合,才能撑起一个生产级 API 的错误处理体系。
`,
  },
  {
    id: "fa-custom-exception",
    group: "异常处理",
    icon: "🎨",
    title: "自定义异常与处理器",
    content: `
## 一、为什么需要自定义异常

\`HTTPException\` 够用吗?简单场景够用,但生产项目会遇到这些问题:

1. **响应格式不统一**:HTTPException 返回 \`{"detail": ...}\`,但你团队规范要求 \`{"code": 1001, "message": "...", "data": null}\`。
2. **业务异常混入 HTTP 概念**:业务层(如 service)里直接 raise HTTPException(404) 把 HTTP 状态码硬编码进业务逻辑,业务层不该知道 HTTP 的存在。
3. **缺少错误码**:HTTP 状态码只有几十个,无法表达「余额不足」「库存不足」「积分不够」这种细粒度业务错误。

自定义异常 + 异常处理器解决了这些问题:业务层 raise 纯业务异常(如 \`InsufficientBalanceError\`),表现层(FastAPI 异常处理器)负责把它转成 HTTP 响应。这就是「分层」的思想——业务不碰 HTTP,HTTP 不碰业务。

## 二、自定义异常类继承 Exception

自定义异常就是普通的 Python 异常类,继承 \`Exception\` 即可。

\`\`\`python
# 定义类 UnicornException，继承 Exception
class UnicornException(Exception):
    # """独角兽异常:演示用"""
    """独角兽异常:演示用"""
    # 定义函数 __init__，参数: self, name: str
    def __init__(self, name: str):
        # 保存名字
        self.name = name
        # 调用父类构造
        super().__init__(name)
\`\`\`

怎么想:自定义异常首先是 Python 异常,继承 Exception 让它能被 raise、被 try/except 捕获。你在里面加什么属性,决定了它能携带多少信息。

## 三、@app.exception_handler() 注册处理器

定义了异常类还不够,你需要告诉 FastAPI:「遇到这个异常时,怎么转成响应」。这就是 \`@app.exception_handler()\` 的作用。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
# Request:请求对象,处理器里可用于读取 URL、method 等信息(用于日志)
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
# JSONResponse:显式构造响应,可自定义状态码和内容(普通 dict 返回会是 200)
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 1. 自定义异常类
# 定义类 UnicornException，继承 Exception
# 继承 Exception 让它可以被 raise、被 try/except 捕获
# 不继承 HTTPException,因为它不是「HTTP 概念的异常」,而是业务异常
class UnicornException(Exception):
    # """独角兽异常"""
    """独角兽异常"""
    # 定义函数 __init__，参数: self, name: str
    def __init__(self, name: str):
        # 把 name 存为实例属性,处理器里能通过 exc.name 访问
        self.name = name
        # 调用父类 __init__,name 作为异常的字符串表示
        # 这样 str(exc) 会返回 name,方便日志记录
        super().__init__(name)

# 2. 注册异常处理器:装饰器参数是异常类
# 装饰器：app.exception_handler(UnicornException)
# @app.exception_handler(异常类):告诉 FastAPI 遇到这个异常时用下面的函数处理
# 参数必须是「类」本身,不是字符串、不是实例
@app.exception_handler(UnicornException)
# 定义异步函数 unicorn_exception_handler，参数: request: Request, exc: UnicornException
# 处理器签名固定:必须是 async def,两个参数 request 和 exc
# request:当前请求对象,可读 URL、method、headers 等
# exc:抛出的异常实例,可读它的属性(这里读 exc.name)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    # 返回 JSONResponse,状态码 418,内容自定义
    # 返回 JSONResponse
    # 状态码 418 是 "I'm a teapot"(RFC 2324),这里用作演示,实际业务用 4xx/5xx
    return JSONResponse(
        # 定义变量 status_code，赋值为 418
        status_code=418,
        # 定义变量 content，赋值为 {"message": f"这只独角兽 {exc.name} 不存在"}
        # content 是响应体,会被 JSON 序列化
        # exc.name 是异常实例的属性,处理器能访问异常携带的数据
        content={"message": f"这只独角兽 {exc.name} 不存在"}
    )

# 3. 在路由里 raise 自定义异常
# 定义 GET 路由：访问 /unicorns/{name} 时触发
@app.get("/unicorns/{name}")
# 定义函数 read_unicorn，参数: name: str
def read_unicorn(name: str):
    # 如果名字是 yolo
    if name == "yolo":
        # 抛出自定义异常
        # 抛出 UnicornException 异常: name=name
        # raise 后函数立即中断,FastAPI 拦截异常并调用注册的处理器
        raise UnicornException(name=name)
    # 正常返回
    return {"name": name}
\`\`\`

访问 \`/unicorns/yolo\` 时,响应:
\`\`\`json
{"message": "这只独角兽 yolo 不存在"}
\`\`\`

状态码 418。

处理器函数签名固定:\`async def handler(request: Request, exc: 异常类)\`。\`request\` 是当前请求对象(可以拿 URL、method 等用于日志),\`exc\` 是抛出的异常实例(可以读它的属性)。

为什么处理器返回的是 \`JSONResponse\` 而不是 dict?因为异常处理器需要完全控制响应:状态码、headers、body。返回 dict 会用默认 200,而错误响应需要自定义状态码。

## 四、自定义异常的响应格式

自定义异常最大的价值:你能完全控制响应格式。下面演示统一成 \`{"code": ..., "message": ..., "data": null}\` 格式。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 自定义业务异常基类:带错误码和 HTTP 状态码
# 定义类 BusinessError，继承 Exception
# BusinessError 是所有业务异常的基类,携带业务错误码和 HTTP 状态码
class BusinessError(Exception):
    # """业务异常基类"""
    """业务异常基类"""
    # 定义函数 __init__，参数: self, code: int, message: str, http_status: int = 400
    def __init__(self, code: int, message: str, http_status: int = 400):
        self.code = code          # 业务错误码(如 10001,用于前端区分错误类型)
        self.message = message    # 错误信息(给用户看的提示)
        self.http_status = http_status  # 对应的 HTTP 状态码(如 400/404/403)
        # 调用父类 __init__,message 作为异常的字符串表示
        super().__init__(message)

# 注册处理器:统一返回 {code, message, data} 格式
# 装饰器：app.exception_handler(BusinessError)
@app.exception_handler(BusinessError)
# 定义异步函数 business_error_handler，参数: request: Request, exc: BusinessError
async def business_error_handler(request: Request, exc: BusinessError):
    # 返回 JSONResponse
    return JSONResponse(
        # 用异常里的 http_status
        status_code=exc.http_status,
        # 统一格式
        content={
            "code": exc.code,
            "message": exc.message,
            "data": None
        }
    )

# 使用:在路由里 raise
# 定义 GET 路由：访问 /pay 时触发
@app.get("/pay")
# 定义函数 pay，参数: amount: int
def pay(amount: int):
    # 余额不足示例
    if amount > 1000:
        # 抛出 BusinessError 异常: code=10001, message="余额不足", http_status=400
        raise BusinessError(code=10001, message="余额不足", http_status=400)
    # 成功
    return {"message": "支付成功"}
\`\`\`

访问 \`/pay?amount=2000\`,响应:
\`\`\`json
{
  "code": 10001,
  "message": "余额不足",
  "data": null
}
\`\`\`

这种设计的好处:业务层只 raise \`BusinessError\`,完全不知道 HTTP 的存在。表现层的处理器负责翻译成 HTTP 响应。业务和 HTTP 解耦。

## 五、RequestValidationError 处理器

FastAPI 参数校验失败时,默认返回 422,格式是 \`{"detail": [...], "body": ...}\`。很多时候我们想统一这个格式。FastAPI 提供了 \`RequestValidationError\` 让你自定义。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 fastapi.exceptions 导入 RequestValidationError
from fastapi.exceptions import RequestValidationError

# 创建 FastAPI 应用实例
app = FastAPI()

# 自定义参数校验错误的响应格式
# 装饰器：app.exception_handler(RequestValidationError)
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_exception_handler，参数: request: Request, exc: RequestValidationError
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # exc.errors() 返回所有校验错误的列表
    # 每个错误包含 loc(出错位置)、msg(错误信息)、type(错误类型)
    # 定义变量 errors，赋值为 exc.errors()
    errors = exc.errors()
    # 返回统一格式:把默认的 {detail: [...]} 改成 {code, message, errors, data}
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": "参数校验失败",
            "errors": errors,
            "data": None
        }
    )

# 测试路由:age 必须是 >= 0 的整数
# 定义 GET 路由：访问 /users 时触发
@app.get("/users")
# 定义函数 get_users，参数: age: int
def get_users(age: int):
    # age 必须是整数,不传或传非整数会触发 RequestValidationError
    return {"age": age}
\`\`\`

访问 \`/users?age=abc\`,响应变成你定义的格式:
\`\`\`json
{
  "code": 422,
  "message": "参数校验失败",
  "errors": [{"loc": ["query", "age"], "msg": "value is not a valid integer", "type": "type_error.integer"}],
  "data": null
}
\`\`\`

为什么重写这个?因为前端通常需要统一的错误格式来做通用处理。默认格式和你的业务错误格式不一致,前端要写两套解析逻辑。统一后,前端只认 \`{code, message}\`。

## 六、自定义异常携带额外数据

异常可以携带任意额外数据,处理器读取后放进响应。这让错误信息更丰富。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 自定义异常:携带额外字段
# 定义类 OrderError，继承 Exception
# OrderError 携带订单号、错误原因、建议操作,让错误响应更有指导性
class OrderError(Exception):
    # """订单异常"""
    """订单异常"""
    # 定义函数 __init__，参数: self, order_id: int, reason: str, suggestion: str
    def __init__(self, order_id: int, reason: str, suggestion: str):
        self.order_id = order_id       # 订单号(方便定位具体订单)
        self.reason = reason           # 错误原因(如"订单已发货")
        self.suggestion = suggestion   # 建议操作(如"请联系客服拦截")
        # 调用父类 __init__,reason 作为异常的字符串表示
        super().__init__(reason)

# 处理器:读取异常的额外字段,放进响应
# 装饰器：app.exception_handler(OrderError)
@app.exception_handler(OrderError)
# 定义异步函数 order_error_handler，参数: request: Request, exc: OrderError
async def order_error_handler(request: Request, exc: OrderError):
    # 返回 JSONResponse
    return JSONResponse(
        status_code=400,
        content={
            "order_id": exc.order_id,
            "reason": exc.reason,
            "suggestion": exc.suggestion
        }
    )

# 使用
# 定义 GET 路由：访问 /orders/{order_id}/cancel 时触发
@app.get("/orders/{order_id}/cancel")
# 定义函数 cancel_order，参数: order_id: int
def cancel_order(order_id: int):
    # 模拟:订单已发货不能取消
    # 抛出 OrderError 异常: order_id=order_id, reason="订单已发货", suggestion="请联系客服拦截"
    raise OrderError(order_id=order_id, reason="订单已发货", suggestion="请联系客服拦截")
\`\`\`

响应:
\`\`\`json
{
  "order_id": 123,
  "reason": "订单已发货",
  "suggestion": "请联系客服拦截"
}
\`\`\`

携带额外数据让错误响应更有「指导性」——不仅告诉用户错了,还告诉用户怎么办。这是好的 API 设计的体现。

## 七、多个异常处理器的优先级

可以注册多个异常处理器,每个对应不同异常类。FastAPI 按异常类的「具体程度」匹配:最具体的类优先。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 基类
# 定义类 AppError，继承 Exception
class AppError(Exception):
    # """应用异常基类"""
    """应用异常基类"""
    pass

# 子类 1
# 定义类 NotFoundError，继承 AppError
class NotFoundError(AppError):
    # """资源不存在"""
    """资源不存在"""
    pass

# 子类 2
# 定义类 PermissionError_，继承 AppError
class PermissionError_(AppError):
    # """权限不足"""
    """权限不足"""
    pass

# 处理器 1:处理基类(兜底)
# 装饰器：app.exception_handler(AppError)
@app.exception_handler(AppError)
# 定义异步函数 app_error_handler，参数: request: Request, exc: AppError
async def app_error_handler(request: Request, exc: AppError):
    # 返回 JSONResponse
    return JSONResponse(status_code=400, content={"message": "应用错误"})

# 处理器 2:处理 NotFoundError(更具体,优先匹配)
# 装饰器：app.exception_handler(NotFoundError)
@app.exception_handler(NotFoundError)
# 定义异步函数 not_found_handler，参数: request: Request, exc: NotFoundError
async def not_found_handler(request: Request, exc: NotFoundError):
    # 返回 JSONResponse
    return JSONResponse(status_code=404, content={"message": "资源不存在"})

# 处理器 3:处理 PermissionError_
# 装饰器：app.exception_handler(PermissionError_)
@app.exception_handler(PermissionError_)
# 定义异步函数 permission_handler，参数: request: Request, exc: PermissionError_
async def permission_handler(request: Request, exc: PermissionError_):
    # 返回 JSONResponse
    return JSONResponse(status_code=403, content={"message": "权限不足"})

# 测试
# 定义 GET 路由：访问 /test/{kind} 时触发
@app.get("/test/{kind}")
# 定义函数 test，参数: kind: str
def test(kind: str):
    if kind == "notfound":
        # 抛出 NotFoundError 异常
        raise NotFoundError()
    if kind == "permission":
        # 抛出 PermissionError_ 异常
        raise PermissionError_()
    # 其他抛基类
    raise AppError()
\`\`\`

规则:raise \`NotFoundError\` 时,匹配 \`NotFoundError\` 的处理器(最具体),而不是 \`AppError\` 的。这和 Python 的异常处理一致——except 子句也是从具体到通用。

避坑:如果你只注册了基类的处理器,子类异常也会被基类处理器捕获。这未必是你想要的,因为子类可能需要不同的状态码。

## 八、实战:业务异常体系设计

设计一个完整的业务异常体系:\`BusinessError\`(基类) -> \`NotFoundError\`、\`PermissionError\`、\`ConflictError\`(子类)。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# ============ 异常体系定义 ============

# 基类:所有业务异常的父类
# 定义类 BusinessError，继承 Exception
class BusinessError(Exception):
    # """业务异常基类"""
    """业务异常基类"""
    # 定义函数 __init__，参数: self, code: int, message: str, http_status: int = 400
    def __init__(self, code: int, message: str, http_status: int = 400):
        self.code = code
        self.message = message
        self.http_status = http_status
        super().__init__(message)

# 资源不存在
# 定义类 NotFoundError，继承 BusinessError
class NotFoundError(BusinessError):
    # 定义函数 __init__，参数: self, resource: str, resource_id
    def __init__(self, resource: str, resource_id):
        # 调用父类:code=10001, message=具体信息, http_status=404
        super().__init__(
            code=10001,
            message=f"{resource} {resource_id} 不存在",
            http_status=404
        )

# 权限不足
# 定义类 PermissionError_，继承 BusinessError
class PermissionError_(BusinessError):
    # 定义函数 __init__，参数: self, action: str
    def __init__(self, action: str):
        super().__init__(
            code=10002,
            message=f"无权限执行 {action}",
            http_status=403
        )

# 资源冲突
# 定义类 ConflictError，继承 BusinessError
class ConflictError(BusinessError):
    # 定义函数 __init__，参数: self, message: str
    def __init__(self, message: str):
        super().__init__(
            code=10003,
            message=message,
            http_status=409
        )

# ============ 异常处理器 ============

# 统一处理器:捕获所有 BusinessError(子类也会进来)
# 装饰器：app.exception_handler(BusinessError)
@app.exception_handler(BusinessError)
# 定义异步函数 business_error_handler，参数: request: Request, exc: BusinessError
async def business_error_handler(request: Request, exc: BusinessError):
    # 返回统一格式
    return JSONResponse(
        status_code=exc.http_status,
        content={
            "code": exc.code,
            "message": exc.message,
            "data": None
        }
    )

# ============ 路由使用 ============

# 模拟用户表
# 定义变量 users，赋值为 {1: {"name": "alice"}, 2: {"name": "bob"}}
users = {1: {"name": "alice"}, 2: {"name": "bob"}}

# 获取用户:可能 NotFoundError
# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    if user_id not in users:
        # 抛出 NotFoundError 异常: resource="用户", resource_id=user_id
        raise NotFoundError("用户", user_id)
    return users[user_id]

# 删除用户:可能 NotFoundError 或 PermissionError_
# 定义 DELETE 路由：访问 /users/{user_id} 时触发
@app.delete("/users/{user_id}")
# 定义函数 delete_user，参数: user_id: int, role: str
def delete_user(user_id: int, role: str):
    # 1. 先检查权限
    if role != "admin":
        # 抛出 PermissionError_ 异常: action="删除用户"
        raise PermissionError_("删除用户")
    # 2. 再检查资源
    if user_id not in users:
        # 抛出 NotFoundError 异常: resource="用户", resource_id=user_id
        raise NotFoundError("用户", user_id)
    # 删除
    del users[user_id]
    return {"deleted": user_id}
\`\`\`

这个体系的设计要点:
- **基类携带 code/message/http_status**:子类只需在 __init__ 里填具体值,处理器只写一个(捕获基类)。
- **子类语义化**:\`NotFoundError("用户", 1)\` 比 \`BusinessError(10001, "用户 1 不存在", 404)\` 更易读。
- **处理器统一**:一个 \`business_error_handler\` 处理所有业务异常,响应格式统一。

怎么想:异常体系要反映业务语义。先列出业务里有哪些类别的错误(不存在、无权限、冲突、参数错),每类一个异常类。错误码用数字分段(10000 段是用户,20000 段是订单),方便定位。

## 九、常见错误与避坑指南

**错误 1:注册处理器时异常类写错**

\`@app.exception_handler(BusinessError)\` 传的是「类」本身,不是字符串、不是实例。如果传错,处理器不会生效,异常会变成 500。

**错误 2:处理器忘记返回 JSONResponse**

处理器必须返回一个 Response 对象(通常是 JSONResponse)。如果返回 dict,FastAPI 不会自动包装,会报错。

**错误 3:异常处理器里又 raise 了同样异常**

\`\`\`python
# 装饰器：app.exception_handler(BusinessError)
@app.exception_handler(BusinessError)
async def handler(request, exc):
    raise BusinessError(...)  # 死循环!处理器里又抛同样异常
\`\`\`

这会导致无限递归。处理器里只能返回响应,不能再 raise 被处理的那个异常。

**错误 4:自定义异常和 HTTPException 混用导致处理器冲突**

如果你既 raise HTTPException 又 raise 自定义异常,要注意:HTTPException 有自己的内置处理器。你的 \`exception_handler(Exception)\` 不会捕获 HTTPException(因为它的继承链特殊)。两者各管各的,不会冲突,但你要清楚哪个异常走哪个处理器。

## 十、设计思想

自定义异常的核心价值是「解耦」:业务逻辑 raise 语义化的业务异常,表现层用处理器把它翻译成 HTTP 响应。这样业务代码不依赖 FastAPI,可以被复用(比如同一个 service 被 Web 和 CLI 调用)。

设计异常体系时,要想清楚三件事:有哪些错误类别(决定异常类的层次)、每个错误带什么信息(决定异常类的属性)、错误怎么呈现给客户端(决定处理器的响应格式)。这三者想清楚,异常体系就立住了。

下一章我们讲「全局异常处理」——当异常没被任何自定义处理器捕获时,怎么兜底,保证不把 500 错误的堆栈直接暴露给用户。
`,
  },
  {
    id: "fa-global-exception",
    group: "异常处理",
    icon: "🌍",
    title: "全局异常处理",
    content: `
## 一、为什么需要全局异常处理

上一章我们为「已知异常」(自定义业务异常、RequestValidationError)注册了处理器。但生产环境总会有「未知异常」:数据库连接断了、第三方接口超时、代码里一个 None.title() 的 bug。这些异常没有被任何处理器捕获,默认行为是 FastAPI 返回 500,并把错误堆栈暴露在响应里。

这有两个严重问题:
1. **安全问题**:堆栈信息暴露了代码结构、文件路径、依赖版本,是攻击者的情报。
2. **体验问题**:用户看到一个原始的 Python 报错,完全不知道怎么办。

全局异常处理就是给所有「漏网之鱼」兜底:注册一个 \`exception_handler(Exception)\`,捕获所有未处理异常,返回统一的友好错误响应,同时把详细错误记录到日志(而不是响应体)。

## 二、捕获所有未处理异常

注册 \`exception_handler(Exception)\` 可以捕获所有未被更具体处理器匹配的异常。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 全局兜底处理器:捕获所有未处理异常
# 注册 exception_handler(Exception) 能捕获所有未被更具体处理器匹配的异常
# 装饰器：app.exception_handler(Exception)
# Exception 是所有 Python 异常的基类,注册它能捕获所有未处理的异常
# 但注意:HTTPException、RequestValidationError 有内置处理器,优先级更高
@app.exception_handler(Exception)
# 定义异步函数 global_exception_handler，参数: request: Request, exc: Exception
async def global_exception_handler(request: Request, exc: Exception):
    # 返回统一的友好错误响应,不暴露堆栈
    # 注意:绝对不能把 str(exc) 或 traceback 返回给用户
    # 堆栈会暴露文件路径、代码结构、依赖版本,是安全漏洞
    # 攻击者能从堆栈里推断出:你用的框架版本、数据库类型、文件路径
    # 进而有针对性地发起攻击(如利用已知漏洞)
    return JSONResponse(
        status_code=500,
        # 500 是「服务器内部错误」,表示「不是客户端的锅,是服务端出 bug 了」
        # 实际的错误详情应该记到日志,而不是响应体
        content={
            "code": 50000,  # 业务错误码,50000 段表示系统错误
            "message": "服务器内部错误,请稍后重试",  # 给用户的友好提示
            "data": None
        }
    )

# 故意制造一个未处理异常的路由
# 定义 GET 路由：访问 /bug 时触发
@app.get("/bug")
# 定义函数 trigger_bug
def trigger_bug():
    # None 没有 .upper() 方法,会抛 AttributeError
    # 定义变量 name，赋值为 None
    name = None
    # 这行会抛异常
    # AttributeError: 'NoneType' object has no attribute 'upper'
    # 这个异常没有专用处理器,被 Exception 兜底捕获
    return {"upper": name.upper()}
\`\`\`

访问 \`/bug\`,响应:
\`\`\`json
{
  "code": 50000,
  "message": "服务器内部错误,请稍后重试",
  "data": null
}
\`\`\`

用户看不到堆栈,只看到友好提示。真实的错误你需要记到日志里(下面讲)。

## 三、exception_handler(Exception) 的注意事项

注册 \`exception_handler(Exception)\` 有一个重要陷阱:它可能会「过度捕获」,把本该由其他处理器处理的异常也拦走。

关键规则:FastAPI 的异常处理器匹配,对于 \`Exception\` 这个基类,行为和子类匹配不同。当你注册了 \`exception_handler(Exception)\`,以下异常「不会」被它捕获:

- \`HTTPException\`:FastAPI 为它内置了专用处理器,优先级高于 \`Exception\`。
- \`RequestValidationError\`:同样有内置处理器。
- 你自定义的、注册了专用处理器的异常:会优先匹配具体的。

但有些 Starlette 内部异常、或你的自定义异常如果「没注册」专用处理器,就会被 \`Exception\` 兜底。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 全局兜底
# 装饰器：app.exception_handler(Exception)
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 兜底:返回 500
    return JSONResponse(status_code=500, content={"message": "服务器错误"})

# HTTPException 仍然走自己的处理器,不被 Exception 拦截
# 定义 GET 路由：访问 /http-err 时触发
@app.get("/http-err")
# 定义函数 http_err
def http_err():
    # 这个会被 HTTPException 内置处理器处理,返回 {"detail": "..."}
    # 抛出 HTTPException 异常: status_code=404, detail="not found"
    raise HTTPException(status_code=404, detail="not found")

# 普通异常走兜底
# 定义 GET 路由：访问 /generic-err 时触发
@app.get("/generic-err")
# 定义函数 generic_err
def generic_err():
    # 这个没有专用处理器,被 Exception 兜底
    # 抛出 ValueError 异常: "something wrong"
    raise ValueError("something wrong")
\`\`\`

避坑:如果你发现注册了 \`exception_handler(Exception)\` 后,某些自定义异常不走了,可能是被兜底拦走了。解决:为那个异常注册更具体的处理器。

## 四、StarletteHTTPException 处理器

FastAPI 的 \`HTTPException\` 继承自 Starlette 的 \`HTTPException\`。有时你需要重写它的响应格式(比如把 \`{"detail": ...}\` 改成 \`{"code", "message"}\`)。这时要捕获 Starlette 的 \`HTTPException\`。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 重写 Starlette HTTPException 的响应格式
# 装饰器：app.exception_handler(StarletteHTTPException)
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 starlette_http_handler，参数: request: Request, exc: StarletteHTTPException
async def starlette_http_handler(request: Request, exc: StarletteHTTPException):
    # exc.status_code:状态码; exc.detail:详情
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.detail,
            "data": None
        }
    )

# 测试:404 路由(访问不存在的路径也会走这里)
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 抛出 HTTPException 异常: status_code=404, detail="商品不存在"
    raise HTTPException(status_code=404, detail="商品不存在")
\`\`\`

访问 \`/items/1\`,响应:
\`\`\`json
{"code": 404, "message": "商品不存在", "data": null}
\`\`\`

为什么是 StarletteHTTPException 而不是 fastapi 的 HTTPException?因为 FastAPI 的 HTTPException 继承自 Starlette 的,注册父类的处理器能覆盖所有 HTTP 异常(包括 FastAPI 自己 raise 的和 Starlette 内部 raise 的,比如 404 路由找不到)。

## 五、ResponseError 处理器

有时你想对 \`HTTPException\` 做更细的控制——比如 404 和 500 用不同格式。可以在处理器里判断状态码。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 按 HTTP 状态码分类处理
# 装饰器：app.exception_handler(StarletteHTTPException)
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 smart_http_handler，参数: request: Request, exc: StarletteHTTPException
async def smart_http_handler(request: Request, exc: StarletteHTTPException):
    # 404:资源不存在(访问不存在的路径也会触发)
    if exc.status_code == 404:
        # 返回 JSONResponse
        # request.url.path 是请求路径,放进消息方便用户定位
        return JSONResponse(
            status_code=404,
            content={"code": 404, "message": f"路径 {request.url.path} 不存在", "data": None}
        )
    # 405:方法不允许(如对只支持 GET 的路由发 POST)
    if exc.status_code == 405:
        # 返回 JSONResponse
        return JSONResponse(
            status_code=405,
            content={"code": 405, "message": "请求方法不被允许", "data": None}
        )
    # 其他 HTTP 异常:通用格式
    # exc.detail 是异常携带的详情(如 HTTPException 的 detail 参数)
    # 返回 JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail, "data": None}
    )

# 测试:访问不存在的路由会触发 404
# 定义 GET 路由：访问 /known 时触发
@app.get("/known")
# 定义函数 known
def known():
    return {"hello": "world"}
\`\`\`

访问 \`/unknown\`(不存在的路径),会返回 \`{"code": 404, "message": "路径 /unknown 不存在"}\`。

这种按状态码分支的做法,让错误响应更贴合场景。

## 六、日志记录异常

全局处理器不仅要返回友好响应,还要把真实错误记到日志,方便排查。否则用户报了错,你却没有任何记录。

\`\`\`python
# 导入 logging 模块
import logging
# 导入 traceback 模块
import traceback
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 配置日志
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")
# 调用 logging.basicConfig
logging.basicConfig(level=logging.INFO)

# 创建 FastAPI 应用实例
app = FastAPI()

# 全局处理器:记日志 + 返回友好响应
# 装饰器：app.exception_handler(Exception)
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 1. 记录完整堆栈到日志(只给开发者看)
    # 定义变量 tb，赋值为 traceback.format_exc()
    tb = traceback.format_exc()
    # 记录 ERROR 日志:包含请求 URL、方法、异常信息、堆栈
    logger.error(f"未处理异常 | URL: {request.url} | 方法: {request.method} | 异常: {exc}\\n{tb}")
    # 2. 返回友好响应给用户(不含堆栈)
    return JSONResponse(
        status_code=500,
        content={
            "code": 50000,
            "message": "服务器内部错误,请稍后重试",
            "data": None
        }
    )

# 触发异常的路由
# 定义 GET 路由：访问 /crash 时触发
@app.get("/crash")
# 定义函数 crash
def crash():
    # 制造一个 KeyError
    # 定义变量 d，赋值为 {}
    d = {}
    # 访问不存在的 key
    return d["missing"]
\`\`\`

访问 \`/crash\` 后,服务器日志会打印:
\`\`\`
未处理异常 | URL: http://.../crash | 方法: GET | 异常: 'missing'
Traceback (most recent call last):
  File "...", line ..., in crash
    return d["missing"]
KeyError: 'missing'
\`\`\`

而用户只看到 \`{"code": 50000, "message": "服务器内部错误"}\`。

怎么想:日志是给开发者的,响应是给用户的,两者要分开。日志越详细越好(含堆栈、请求信息),响应越简洁越好(不含敏感信息)。

## 七、生产环境 vs 开发环境的异常处理策略

开发时你希望看到详细错误(快速定位 bug),生产时你希望隐藏错误(安全)。用环境变量切换策略。

\`\`\`python
# 导入 os 模块
import os
# 导入 logging 模块
import logging
# 导入 traceback 模块
import traceback
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 读取环境变量:开发环境为 "dev",生产为 "prod"
# 定义变量 ENV，赋值为 os.getenv("APP_ENV", "dev")
ENV = os.getenv("APP_ENV", "dev")
# 配置日志
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")
# 调用 logging.basicConfig
logging.basicConfig(level=logging.INFO)

# 创建 FastAPI 应用实例,开发环境开启文档,生产可关闭
app = FastAPI()

# 全局处理器:根据环境返回不同详细程度
# 装饰器：app.exception_handler(Exception)
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 记录日志(不管什么环境都要记)
    # 定义变量 tb，赋值为 traceback.format_exc()
    tb = traceback.format_exc()
    # 记录日志
    logger.error(f"异常: {exc}\\n{tb}")
    # 开发环境:返回详细错误,方便调试
    if ENV == "dev":
        # 返回 JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "code": 50000,
                "message": str(exc),
                "traceback": tb,
                "url": str(request.url)
            }
        )
    # 生产环境:返回友好提示,不暴露任何细节
    # 返回 JSONResponse
    return JSONResponse(
        status_code=500,
        content={
            "code": 50000,
            "message": "服务器内部错误,请联系客服",
            "data": None
        }
    )

# 触发异常
# 定义 GET 路由：访问 /test 时触发
@app.get("/test")
# 定义函数 test
def test():
    # 抛出 RuntimeError 异常: "故意出错"
    raise RuntimeError("故意出错")
\`\`\`

开发环境(\`APP_ENV=dev\`)响应含堆栈和 URL,生产环境(\`APP_ENV=prod\`)只有友好提示。

## 八、实战:统一错误响应格式 + 异常日志上报

综合前面所有内容,实现一个完整的全局异常处理:统一格式 + 日志 + 区分环境。

\`\`\`python
# 导入 os 模块
import os
# 导入 logging 模块
import logging
# 导入 traceback 模块
import traceback
# 导入 time 模块
import time
# 导入 uuid 模块
import uuid
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 fastapi.exceptions 导入 RequestValidationError
from fastapi.exceptions import RequestValidationError
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# ============ 配置 ============
# 定义变量 ENV，赋值为 os.getenv("APP_ENV", "dev")
ENV = os.getenv("APP_ENV", "dev")
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")
# 调用 logging.basicConfig
logging.basicConfig(level=logging.INFO)

# 创建 FastAPI 应用实例
app = FastAPI()

# ============ 统一响应构造函数 ============
# 定义函数 make_error_response，参数: status: int, code: int, message: str, request: Request, exc: Exception = None
# 统一构造错误响应:生成 trace_id、记日志、按环境返回不同详细程度
# 这个函数是所有异常处理器的「公共出口」,保证响应格式统一
def make_error_response(status: int, code: int, message: str, request: Request, exc: Exception = None):
    # 生成错误追踪 ID,方便用户报错时定位
    # trace_id 是 8 位短 UUID,用户报错时提供这个 ID,能在日志里快速定位
    # 为什么用 UUID 而不是自增 ID?因为 UUID 全局唯一,分布式系统不会冲突
    # 为什么截断成 8 位?完整的 UUID 太长(36 字符),8 位足够区分且易读
    # 定义变量 trace_id，赋值为 str(uuid.uuid4())[:8]
    trace_id = str(uuid.uuid4())[:8]
    # 如果有异常,记日志
    if exc:
        # traceback.format_exc() 获取完整堆栈字符串
        # 定义变量 tb，赋值为 traceback.format_exc()
        # format_exc() 返回当前异常的完整堆栈文本,包含文件路径、行号、调用链
        tb = traceback.format_exc()
        # 记录 ERROR 日志
        # 日志含 trace_id、请求方法、URL、错误码、消息、异常对象、堆栈
        # trace_id 是关联线索:用户报错时提供 ID,开发者用它在日志里搜索
        logger.error(f"[{trace_id}] {request.method} {request.url} | {code}:{message} | {exc}\\n{tb}")
    # 开发环境多返回 trace_id 和堆栈,方便调试
    # ENV 从环境变量读取,"dev" 是开发环境,"prod" 是生产环境
    if ENV == "dev" and exc:
        # 返回 JSONResponse
        # 开发环境直接返回堆栈,前端能看到完整错误,方便调试
        return JSONResponse(
            status_code=status,
            content={"code": code, "message": message, "trace_id": trace_id, "traceback": tb, "data": None}
        )
    # 返回 JSONResponse
    # 生产环境不返回堆栈,只返回 trace_id 让用户报错时提供
    # 这样既不暴露技术细节,又能通过 trace_id 定位问题
    return JSONResponse(
        status_code=status,
        content={"code": code, "message": message, "trace_id": trace_id, "data": None}
    )

# ============ 异常处理器 ============

# 1. Starlette HTTPException:统一 HTTP 异常格式
# 装饰器：app.exception_handler(StarletteHTTPException)
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 http_exception_handler，参数: request: Request, exc: StarletteHTTPException
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # 返回 make_error_response
    return make_error_response(
        status=exc.status_code,
        code=exc.status_code,
        message=str(exc.detail),
        request=request
    )

# 2. 参数校验异常:统一 422 格式
# 装饰器：app.exception_handler(RequestValidationError)
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_handler，参数: request: Request, exc: RequestValidationError
async def validation_handler(request: Request, exc: RequestValidationError):
    # 定义变量 errors，赋值为 exc.errors()
    errors = exc.errors()
    # 返回 JSONResponse
    return JSONResponse(
        status_code=422,
        content={"code": 422, "message": "参数校验失败", "errors": errors, "data": None}
    )

# 3. 全局兜底:所有未处理异常
# 装饰器：app.exception_handler(Exception)
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 返回 make_error_response
    return make_error_response(
        status=500,
        code=50000,
        message="服务器内部错误" if ENV == "prod" else str(exc),
        request=request,
        exc=exc
    )

# ============ 测试路由 ============
# 定义 GET 路由：访问 /http-err 时触发
@app.get("/http-err")
# 定义函数 http_err
def http_err():
    # 抛出 HTTPException 异常: status_code=404, detail="不存在"
    raise HTTPException(status_code=404, detail="不存在")

# 定义 GET 路由：访问 /validate 时触发
@app.get("/validate")
# 定义函数 validate，参数: age: int
def validate(age: int):
    return {"age": age}

# 定义 GET 路由：访问 /crash 时触发
@app.get("/crash")
# 定义函数 crash
def crash():
    # 定义变量 d，赋值为 {}
    d = {}
    # 触发 KeyError
    return d["x"]
\`\`\`

测试:
- \`/http-err\` -> \`{"code": 404, "message": "不存在", "trace_id": "a1b2c3d4", "data": null}\`
- \`/validate?age=abc\` -> \`{"code": 422, "message": "参数校验失败", "errors": [...], "data": null}\`
- \`/crash\` -> \`{"code": 50000, "message": "...", "trace_id": "...", "data": null}\`,同时日志里有完整堆栈。

trace_id 是亮点:用户报错时告诉你 trace_id,你拿它在日志里一搜就能定位到那次请求的完整堆栈。

## 九、常见错误与避坑指南

**错误 1:exception_handler(Exception) 拦截了所有,导致 404 也变成 500**

如果你注册了 \`exception_handler(Exception)\` 但没有注册 \`StarletteHTTPException\` 处理器,大部分 HTTP 异常仍走内置处理器(因为优先级)。但为保险,两个都注册,顺序无所谓。

**错误 2:日志里没记请求体**

光记堆栈不够,有时是请求参数触发的 bug。建议在全局处理器里读取并记录 request body(注意 body 只能读一次,需要中间件缓存,这是进阶话题)。

**错误 3:生产环境返回了堆栈**

\`traceback.format_exc()\` 的结果绝对不能出现在生产环境的响应里。上面的例子用 ENV 判断,生产环境只返回 message。

**错误 4:全局处理器里做了耗时操作**

处理器是请求链路的一部分,如果处理器里做同步慢操作(如发邮件),会阻塞响应。耗时操作应丢到后台任务(BackgroundTasks)或消息队列。

## 十、设计思想

全局异常处理的本质是「防御性编程」的最后一道防线。你不可能预见所有异常,但你可以保证「无论发生什么,用户都看不到堆栈,都能得到一个可读的错误响应,且错误被记录」。

三个层次缺一不可:
1. **具体异常处理器**:处理已知的业务异常、校验异常(精细控制)。
2. **HTTP 异常处理器**:统一 HTTPException 的格式(覆盖框架默认行为)。
3. **全局兜底处理器**:处理所有未知异常(安全 + 日志)。

下一章我们讲异常处理的「最佳实践」,把前面三章的知识整合成一个完整的生产级体系。
`,
  },
  {
    id: "fa-exception-best",
    group: "异常处理",
    icon: "💎",
    title: "异常处理最佳实践",
    content: `
## 一、异常处理的分层设计

生产级项目的异常处理应该分层,每层职责不同:

1. **校验层**:参数校验(FastAPI 自动 + Pydantic)。错误用 422,由 RequestValidationError 处理。
2. **业务层**:业务规则校验(余额够不够、状态对不对)。用自定义业务异常,不碰 HTTP。
3. **表现层**:异常处理器,把业务异常翻译成 HTTP 响应。
4. **兜底层**:全局 Exception 处理器,捕获漏网之鱼。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 pydantic 导入 BaseModel, field_validator
from pydantic import BaseModel, field_validator

# 创建 FastAPI 应用实例
app = FastAPI()

# ============ 校验层:Pydantic 模型 ============
# 定义类 TransferRequest，继承 BaseModel
class TransferRequest(BaseModel):
    # 定义变量 from_user，赋值为 str
    from_user: str
    # 定义变量 to_user，赋值为 str
    to_user: str
    # 定义变量 amount，赋值为 float
    amount: float

    # Pydantic 校验:金额必须为正
    # field_validator("amount") 装饰器:对 amount 字段做自定义校验
    # 装饰器：field_validator("amount")
    @field_validator("amount")
    # 定义函数 amount_positive，参数: v
    # @classmethod:类方法装饰器,Pydantic v2 要求 validator 用类方法
    @classmethod
    def amount_positive(cls, v):
        # v 是待校验的值,如果校验不通过抛 ValueError
        if v <= 0:
            # 抛出 ValueError 异常: "金额必须大于 0"
            # Pydantic 会把 ValueError 转成 ValidationError(422)
            raise ValueError("金额必须大于 0")
        # 校验通过,返回值(必须返回,否则字段变成 None)
        return v

# ============ 业务层:自定义异常 + service ============
# 定义类 InsufficientBalanceError，继承 Exception
# 业务异常:余额不足,携带用户、需要金额、实际余额三个信息
class InsufficientBalanceError(Exception):
    # """余额不足"""
    """余额不足"""
    # 定义函数 __init__，参数: self, user: str, needed: float, balance: float
    def __init__(self, user: str, needed: float, balance: float):
        self.user = user            # 用户名
        self.needed = needed        # 需要的金额
        self.balance = balance      # 实际余额
        # 调用父类 __init__,传入描述信息
        super().__init__(f"{user} 余额不足:需要 {needed},实际 {balance}")

# 业务逻辑:执行转账(纯业务,不碰 HTTP)
# 这个函数不知道 FastAPI 的存在,可以被 Web、CLI、测试复用
# 定义函数 do_transfer，参数: req: TransferRequest
def do_transfer(req: TransferRequest):
    # 模拟数据库
    # 定义变量 balances，赋值为 {"alice": 100, "bob": 50}
    balances = {"alice": 100, "bob": 50}
    # 业务校验:余额是否足够
    # 先检查用户是否存在,再检查余额
    if req.from_user not in balances or balances[req.from_user] < req.amount:
        # 抛出 InsufficientBalanceError 异常: user=req.from_user, needed=req.amount, balance=balances.get(req.from_user, 0)
        # balances.get(user, 0):用户不存在时返回 0,避免 KeyError
        raise InsufficientBalanceError(
            user=req.from_user,
            needed=req.amount,
            balance=balances.get(req.from_user, 0)
        )
    # 执行转账:扣减转出方余额
    balances[req.from_user] -= req.amount
    # 增加接收方余额(不存在则初始化为 0 再加)
    balances[req.to_user] = balances.get(req.to_user, 0) + req.amount
    # 返回结果
    return {"from": req.from_user, "to": req.to_user, "amount": req.amount}

# ============ 表现层:处理器 + 路由 ============
# 装饰器：app.exception_handler(InsufficientBalanceError)
@app.exception_handler(InsufficientBalanceError)
# 定义异步函数 balance_handler，参数: request: Request, exc: InsufficientBalanceError
async def balance_handler(request: Request, exc: InsufficientBalanceError):
    # 返回 JSONResponse
    return JSONResponse(
        status_code=400,
        content={"code": 10002, "message": "余额不足", "detail": {"user": exc.user, "needed": exc.needed, "balance": exc.balance}}
    )

# 定义 POST 路由：访问 /transfer 时触发
@app.post("/transfer")
# 定义函数 transfer，参数: req: TransferRequest
def transfer(req: TransferRequest):
    # 调用业务层,异常由处理器捕获
    # 定义变量 result，赋值为 do_transfer(req)
    result = do_transfer(req)
    return result
\`\`\`

注意:\`do_transfer\` 是纯业务函数,它 raise 的是业务异常,不知道 HTTP 的存在。它可以被 Web 路由调用,也可以被 CLI 脚本调用,复用性强。

## 二、什么时候用 HTTPException vs 自定义异常

这是新手最困惑的问题。原则:

- **HTTPException**:用在「和 HTTP 强相关」的简单场景,如路由里直接判断资源不存在、快速原型。优点是简单直接,缺点是业务层耦合了 HTTP。
- **自定义异常**:用在「有业务语义」的场景,如余额不足、库存不够。优点是业务解耦、可扩展(错误码、额外数据),缺点是要写异常类 + 处理器,代码量多。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 场景 1:简单的 CRUD,用 HTTPException 足够
# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 定义变量 items，赋值为 {1: "a"}
    items = {1: "a"}
    if item_id not in items:
        # 简单场景:HTTPException 直接搞定
        # 抛出 HTTPException 异常: status_code=404, detail="不存在"
        raise HTTPException(status_code=404, detail="不存在")
    return items[item_id]

# 场景 2:复杂业务逻辑,用自定义异常
# 业务异常
# 定义类 PaymentError，继承 Exception
class PaymentError(Exception):
    # 定义函数 __init__，参数: self, code: int, message: str
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(message)

# 路由
# 定义 POST 路由：访问 /pay 时触发
@app.post("/pay")
# 定义函数 pay，参数: amount: float
def pay(amount: float):
    # 复杂业务:调用支付服务,可能多种错误
    try:
        # 模拟调用支付网关
        if amount > 10000:
            # 抛出 PaymentError 异常: code=20001, message="单笔限额"
            raise PaymentError(20001, "单笔限额")
    except PaymentError:
        # 这里重新 raise,让处理器处理
        raise
    return {"paid": amount}
\`\`\`

怎么想:问自己「这个错误是 HTTP 层的,还是业务层的?」。\`/items/99\` 不存在是 HTTP 层(404 天然对应),用 HTTPException。余额不足是业务层(HTTP 状态码表达不了「余额不足」这个语义),用自定义异常 + 错误码。

## 三、异常信息的国际化

如果 API 服务多语言用户,错误信息需要国际化。做法:错误码不变,根据请求的 \`Accept-Language\` 返回不同语言的 message。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request, Header
from fastapi import FastAPI, Request, Header
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 typing 导入 Optional
from typing import Optional

# 创建 FastAPI 应用实例
app = FastAPI()

# 错误信息多语言字典:code -> {lang -> message}
# 定义变量 MESSAGES，赋值为 {10001: {"zh": "用户不存在", "en": "User not found"}, 10002: {"zh": "余额不足", "en": "Insufficient balance"}}
MESSAGES = {
    10001: {"zh": "用户不存在", "en": "User not found"},
    10002: {"zh": "余额不足", "en": "Insufficient balance"}
}

# 自定义异常:只带 code,不固定 message
# 定义类 I18nError，继承 Exception
class I18nError(Exception):
    # 定义函数 __init__，参数: self, code: int
    def __init__(self, code: int):
        self.code = code
        super().__init__(str(code))

# 处理器:根据 Accept-Language 返回对应语言
# 装饰器：app.exception_handler(I18nError)
@app.exception_handler(I18nError)
# 定义异步函数 i18n_handler，参数: request: Request, exc: I18nError
async def i18n_handler(request: Request, exc: I18nError):
    # 从请求头读语言,默认中文
    # Accept-Language 是 HTTP 标准头,浏览器根据用户语言设置自动发送
    # 定义变量 lang，赋值为 request.headers.get("Accept-Language", "zh")
    lang = request.headers.get("Accept-Language", "zh")
    # 简化:只要头里含 en 就用英文
    # 实际 Accept-Language 可能是 "en-US,en;q=0.9,zh-CN;q=0.8"
    if "en" in lang:
        lang = "en"
    else:
        lang = "zh"
    # 取对应语言的 message
    # MESSAGES.get(exc.code, {}):先按 code 取语言字典,code 不存在返回空字典
    # .get(lang, "未知错误"):再按语言取消息,语言不存在返回默认值
    # 定义变量 message，赋值为 MESSAGES.get(exc.code, {}).get(lang, "未知错误")
    message = MESSAGES.get(exc.code, {}).get(lang, "未知错误")
    # 返回 JSONResponse
    return JSONResponse(
        status_code=400,
        content={"code": exc.code, "message": message, "data": None}
    )

# 使用
# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    if user_id == 99:
        # 抛出 I18nError 异常: code=10001
        raise I18nError(10001)
    return {"user_id": user_id}
\`\`\`

带 \`Accept-Language: en\` 请求 \`/users/99\`,返回 \`{"message": "User not found"}\`;带 \`zh\` 则返回中文。

怎么想:错误码是「不变的」,语言是「变的」。把不变的放代码里(code),把变的放配置或字典里(message)。这是国际化的通用思路。

## 四、异常与错误码体系

错误码是异常处理的「骨架」。好的错误码体系让排错、监控、文档都方便。设计原则:

- **分段**:不同模块用不同号段(用户 10xxx,订单 20xxx,支付 30xxx)。
- **层级**:前缀区分错误类别(1xxxx 业务错误,4xxxx 认证错误,5xxxx 系统错误)。
- **唯一**:每个错误一个码,不要复用。

\`\`\`python
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 错误码定义:集中管理,用类做枚举
# 定义类 ErrorCode
class ErrorCode:
    # ===== 用户模块 10xxx =====
    # 定义变量 USER_NOT_FOUND，赋值为 10001
    USER_NOT_FOUND = 10001
    # 定义变量 USER_DISABLED，赋值为 10002
    USER_DISABLED = 10002
    # ===== 订单模块 20xxx =====
    # 定义变量 ORDER_NOT_FOUND，赋值为 20001
    ORDER_NOT_FOUND = 20001
    # 定义变量 ORDER_PAID，赋值为 20002
    ORDER_PAID = 20002      # 订单已支付,不能重复
    # ===== 认证模块 40xxx =====
    # 定义变量 AUTH_NOT_LOGIN，赋值为 40001
    AUTH_NOT_LOGIN = 40001
    # 定义变量 AUTH_NO_PERMISSION，赋值为 40002
    AUTH_NO_PERMISSION = 40002
    # ===== 系统模块 50xxx =====
    # 定义变量 SYSTEM_ERROR，赋值为 50000
    SYSTEM_ERROR = 50000

# 异常基类:携带错误码
# 定义类 AppError，继承 Exception
class AppError(Exception):
    # 定义函数 __init__，参数: self, code: int, message: str, http_status: int = 400
    def __init__(self, code: int, message: str, http_status: int = 400):
        self.code = code
        self.message = message
        self.http_status = http_status
        super().__init__(message)

# 统一处理器
# 装饰器：app.exception_handler(AppError)
@app.exception_handler(AppError)
# 定义异步函数 app_error_handler，参数: request: Request, exc: AppError
async def app_error_handler(request: Request, exc: AppError):
    # 返回 JSONResponse
    return JSONResponse(
        status_code=exc.http_status,
        content={"code": exc.code, "message": exc.message, "data": None}
    )

# 使用:错误码作为常量引用,不硬编码数字
# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    if user_id == 99:
        # 用常量,不用裸数字 10001
        # 抛出 AppError 异常: code=ErrorCode.USER_NOT_FOUND, message="用户不存在", http_status=404
        raise AppError(ErrorCode.USER_NOT_FOUND, "用户不存在", 404)
    return {"user_id": user_id}
\`\`\`

为什么用类而不是字典?类属性有 IDE 补全,写错会报错(属性不存在),比字典的字符串 key 安全。

## 五、异常的安全考虑

异常处理的一个关键安全原则:**不要把内部信息泄露给客户端**。以下信息绝对不能出现在响应里:

- Python 堆栈(traceback)
- 数据库错误细节(如 SQL 语句、表名)
- 文件路径
- 内部 IP、端口
- 第三方 API 的密钥

\`\`\`python
# 导入 os 模块
import os
# 导入 logging 模块
import logging
# 导入 traceback 模块
import traceback
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")
# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟数据库查询出错
# 定义 GET 路由：访问 /db-query 时触发
@app.get("/db-query")
# 定义函数 db_query
def db_query():
    # 模拟:SQL 语句出错
    try:
        # 模拟执行 SQL 出错
        # 这个错误信息含数据库类型(Oracle)、表名(USERS)、文件路径(/app/db.py)
        # 如果直接返回给用户,会暴露系统架构,是安全隐患
        # 抛出 Exception 异常: "ORA-00942: table USERS does not exist at /app/db.py:42"
        raise Exception("ORA-00942: table USERS does not exist at /app/db.py:42")
    except Exception as e:
        # 记录完整错误到日志(含堆栈,给开发者排查用)
        logger.error(f"数据库错误: {e}\\n{traceback.format_exc()}")
        # 返回给用户的:脱敏的友好信息(不含任何技术细节)
        # 返回 JSONResponse
        return JSONResponse(
            status_code=500,
            content={"code": 50000, "message": "服务暂时不可用,请稍后重试", "data": None}
        )
\`\`\`

如果直接把 \`str(e)\` 返回给用户,用户会看到 \`ORA-00942: table USERS does not exist at /app/db.py:42\`——暴露了数据库类型(Oracle)、表名、文件路径。这是严重的安全隐患。

安全原则:响应里只放「对用户有用且无安全风险」的信息(如 trace_id、友好提示)。所有技术细节只进日志。

## 六、异常的测试

异常处理也是代码,必须测试。用 \`TestClient\` 测试异常是否返回正确的状态码和格式。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /items/{item_id} 时触发
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    if item_id == 99:
        # 抛出 HTTPException 异常: status_code=404, detail="不存在"
        raise HTTPException(status_code=404, detail="不存在")
    return {"item_id": item_id}

# 创建测试客户端
# TestClient 模拟 HTTP 请求,不需要真正启动服务器
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试 1:正常请求
# 定义函数 test_normal
def test_normal():
    # 定义变量 r，赋值为 client.get("/items/1")
    r = client.get("/items/1")
    # 断言状态码 200(请求成功)
    assert r.status_code == 200
    # 断言响应体等于预期 JSON
    assert r.json() == {"item_id": 1}

# 测试 2:资源不存在
# 定义函数 test_not_found
def test_not_found():
    # 定义变量 r，赋值为 client.get("/items/99")
    r = client.get("/items/99")
    # 断言状态码 404(资源不存在)
    assert r.status_code == 404
    # 断言 detail 字段等于"不存在"(HTTPException 的默认响应格式)
    assert r.json() == {"detail": "不存在"}

# 测试 3:参数类型错误(422)
# 定义函数 test_validation_error
def test_validation_error():
    # 定义变量 r，赋值为 client.get("/items/abc")
    # item_id 声明为 int,传 "abc" 会触发 FastAPI 自动校验失败
    r = client.get("/items/abc")
    # 断言状态码 422(参数校验失败,FastAPI 自动返回)
    assert r.status_code == 422

# 运行测试
# 调用 test_normal()
test_normal()
# 调用 test_not_found()
test_not_found()
# 调用 test_validation_error()
test_validation_error()
# 打印提示
print("所有测试通过")
\`\`\`

测试要点:
- **正常路径**:确认成功返回 200 + 正确数据。
- **异常路径**:确认每种异常返回正确的状态码和格式。
- **边界**:如参数类型错(422)、权限不足(403)。

怎么想:异常处理的测试要覆盖「错误场景」,不只是「成功场景」。每个 raise 的地方都要有对应的测试,确保它真的被触发、真的返回了预期格式。

## 七、异常处理反模式

以下是要避免的反模式:

**反模式 1:裸 except 吞掉所有异常**

\`\`\`python
# 错误:吞掉异常,问题被掩盖
# 定义函数 bad
def bad():
    try:
        do_something()
    except:  # 裸 except,连 KeyboardInterrupt 都吞
        pass  # 啥也不做,bug 永远找不到
\`\`\`

正确:捕获具体异常,至少记日志。

**反模式 2:用异常控制流程**

\`\`\`python
# 错误:用异常代替 if 判断
# 定义函数 bad
def bad():
    try:
        user = users[id]
    except KeyError:
        # 用异常处理「不存在」,性能差且不清晰
        user = None
\`\`\`

正确:\`user = users.get(id)\` 用 dict.get,不用异常控制正常流程。

**反模式 3:异常信息过于模糊**

\`\`\`python
# 错误:用户看到这个完全不知道哪里错了
# 抛出 HTTPException 异常: status_code=400, detail="错误"
raise HTTPException(400, "错误")
\`\`\`

正确:\`detail="用户名长度必须 6-20 个字符"\`,具体到字段和规则。

**反模式 4:500 当业务错误用**

\`\`\`python
# 错误:余额不足是客户端问题,不该 500
# 抛出 HTTPException 异常: status_code=500, detail="余额不足"
raise HTTPException(500, "余额不足")  # 会触发运维告警!
\`\`\`

正确:用 4xx。500 是「服务器 bug」,业务错误是「客户端请求不对」。

## 八、实战:完整的异常处理体系

整合所有最佳实践:错误码 + 统一响应 + 日志 + 测试。

\`\`\`python
# 导入 os 模块
import os
# 导入 logging 模块
import logging
# 导入 traceback 模块
import traceback
# 导入 uuid 模块
import uuid
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 fastapi.exceptions 导入 RequestValidationError
from fastapi.exceptions import RequestValidationError
# 从 starlette.exceptions 导入 HTTPException as StarletteHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# ============ 1. 配置 ============
# 定义变量 ENV，赋值为 os.getenv("APP_ENV", "dev")
ENV = os.getenv("APP_ENV", "dev")
# 定义变量 logger，赋值为 logging.getLogger("api")
logger = logging.getLogger("api")
# 调用 logging.basicConfig
logging.basicConfig(level=logging.INFO)

# ============ 2. 错误码体系 ============
# 定义类 ErrorCode
class ErrorCode:
    # 用户模块
    # 定义变量 USER_NOT_FOUND，赋值为 10001
    USER_NOT_FOUND = 10001
    # 定义变量 USER_INSUFFICIENT_BALANCE，赋值为 10002
    USER_INSUFFICIENT_BALANCE = 10002
    # 订单模块
    # 定义变量 ORDER_NOT_FOUND，赋值为 20001
    ORDER_NOT_FOUND = 20001
    # 定义变量 ORDER_CONFLICT，赋值为 20002
    ORDER_CONFLICT = 20002
    # 认证模块
    # 定义变量 AUTH_NOT_LOGIN，赋值为 40001
    AUTH_NOT_LOGIN = 40001
    # 定义变量 AUTH_NO_PERMISSION，赋值为 40002
    AUTH_NO_PERMISSION = 40002
    # 系统
    # 定义变量 SYSTEM_ERROR，赋值为 50000
    SYSTEM_ERROR = 50000

# ============ 3. 异常层次 ============
# 应用异常基类
# 定义类 AppError，继承 Exception
# AppError 携带错误码、消息、HTTP 状态码、可选详情
class AppError(Exception):
    # """应用异常基类"""
    """应用异常基类"""
    # 定义函数 __init__，参数: self, code: int, message: str, http_status: int = 400, details=None
    def __init__(self, code: int, message: str, http_status: int = 400, details=None):
        self.code = code              # 业务错误码(如 10001)
        self.message = message        # 错误消息(给用户看)
        self.http_status = http_status  # 对应的 HTTP 状态码(如 404)
        self.details = details        # 额外详情(可选,如余额信息)
        # 调用父类 __init__,message 作为异常的字符串表示
        super().__init__(message)

# 业务异常
# 定义类 BusinessError，继承 AppError
# BusinessError 是业务错误的基类(余额不足、订单冲突等)
class BusinessError(AppError):
    # """业务异常"""
    """业务异常"""
    pass  # 直接继承,不需要额外实现

# 系统异常
# 定义 class SystemError_，继承 AppError
# SystemError_ 表示服务器内部错误(500),用于包装未知异常
# 加下划线后缀避免和 Python 内置 SystemError 冲突
class SystemError_(AppError):
    # 定义函数 __init__，参数: self, message="服务器内部错误"
    def __init__(self, message="服务器内部错误"):
        # 调用父类,固定 code 和 http_status
        super().__init__(
            code=ErrorCode.SYSTEM_ERROR,  # 50000
            message=message,
            http_status=500
        )

# ============ 4. FastAPI 应用 ============
# 创建 FastAPI 应用实例
app = FastAPI()

# ============ 5. 统一响应构造 ============
# 定义函数 make_error_response，参数: status: int, code: int, message: str, request: Request, exc: Exception = None, details=None
# 统一构造错误响应:trace_id + 日志 + 环境区分 + 可选详情
def make_error_response(status: int, code: int, message: str, request: Request, exc: Exception = None, details=None):
    # 生成 trace_id:8 位短 UUID,用于日志追踪
    # 定义变量 trace_id，赋值为 str(uuid.uuid4())[:8]
    trace_id = str(uuid.uuid4())[:8]
    # 有异常就记日志(记完整堆栈,只给开发者看)
    if exc:
        # traceback.format_exc() 获取完整堆栈字符串
        # 定义变量 tb，赋值为 traceback.format_exc()
        tb = traceback.format_exc()
        # 记录 ERROR 日志:trace_id、方法、URL、错误码、消息、异常、堆栈
        logger.error(f"[{trace_id}] {request.method} {request.url} | {code}:{message} | {exc}\\n{tb}")
    # 构造响应体:统一格式 {code, message, trace_id, data}
    # 定义变量 body，赋值为 {"code": code, "message": message, "trace_id": trace_id, "data": None}
    body = {"code": code, "message": message, "trace_id": trace_id, "data": None}
    # 有额外详情就加上(如余额不足时返回当前余额和需要金额)
    if details:
        body["details"] = details
    # 开发环境附加堆栈,方便本地调试
    if ENV == "dev" and exc:
        body["traceback"] = tb
    # 返回 JSONResponse
    return JSONResponse(status_code=status, content=body)

# ============ 6. 异常处理器 ============
# 6.1 业务异常
# 装饰器：app.exception_handler(AppError)
@app.exception_handler(AppError)
# 定义异步函数 app_error_handler，参数: request: Request, exc: AppError
async def app_error_handler(request: Request, exc: AppError):
    # 返回 make_error_response
    return make_error_response(
        status=exc.http_status,
        code=exc.code,
        message=exc.message,
        request=request,
        exc=exc,
        details=exc.details
    )

# 6.2 Starlette HTTP 异常(统一 404 等格式)
# 装饰器：app.exception_handler(StarletteHTTPException)
@app.exception_handler(StarletteHTTPException)
# 定义异步函数 http_handler，参数: request: Request, exc: StarletteHTTPException
async def http_handler(request: Request, exc: StarletteHTTPException):
    # 返回 make_error_response
    return make_error_response(
        status=exc.status_code,
        code=exc.status_code,
        message=str(exc.detail),
        request=request
    )

# 6.3 参数校验异常
# 装饰器：app.exception_handler(RequestValidationError)
@app.exception_handler(RequestValidationError)
# 定义异步函数 validation_handler，参数: request: Request, exc: RequestValidationError
async def validation_handler(request: Request, exc: RequestValidationError):
    # 定义变量 errors，赋值为 exc.errors()
    errors = exc.errors()
    # 返回 JSONResponse
    return JSONResponse(
        status_code=422,
        content={"code": 422, "message": "参数校验失败", "errors": errors, "trace_id": str(uuid.uuid4())[:8], "data": None}
    )

# 6.4 全局兜底
# 装饰器：app.exception_handler(Exception)
@app.exception_handler(Exception)
# 定义异步函数 global_handler，参数: request: Request, exc: Exception
async def global_handler(request: Request, exc: Exception):
    # 返回 make_error_response
    return make_error_response(
        status=500,
        code=ErrorCode.SYSTEM_ERROR,
        message="服务器内部错误" if ENV == "prod" else str(exc),
        request=request,
        exc=exc
    )

# ============ 7. 路由 ============
# 模拟数据
# 定义变量 users_db，赋值为 {1: {"name": "alice", "balance": 100}, 2: {"name": "bob", "balance": 50}}
users_db = {1: {"name": "alice", "balance": 100}, 2: {"name": "bob", "balance": 50}}

# 获取用户:可能 404
# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    if user_id not in users_db:
        # 抛出 BusinessError 异常: code=ErrorCode.USER_NOT_FOUND, message="用户不存在", http_status=404
        raise BusinessError(ErrorCode.USER_NOT_FOUND, "用户不存在", 404)
    return users_db[user_id]

# 扣款:可能余额不足
# 定义 POST 路由：访问 /users/{user_id}/deduct 时触发
@app.post("/users/{user_id}/deduct")
# 定义函数 deduct，参数: user_id: int, amount: float
def deduct(user_id: int, amount: float):
    if user_id not in users_db:
        # 抛出 BusinessError 异常
        raise BusinessError(ErrorCode.USER_NOT_FOUND, "用户不存在", 404)
    # 取出用户
    user = users_db[user_id]
    if amount > user["balance"]:
        # 余额不足,带额外详情
        # 抛出 BusinessError 异常: code=ErrorCode.USER_INSUFFICIENT_BALANCE, message="余额不足", http_status=400, details={"balance": user["balance"], "needed": amount}
        raise BusinessError(
            ErrorCode.USER_INSUFFICIENT_BALANCE,
            "余额不足",
            400,
            details={"balance": user["balance"], "needed": amount}
        )
    # 扣款
    user["balance"] -= amount
    return user

# 故意崩溃:测试全局兜底
# 定义 GET 路由：访问 /crash 时触发
@app.get("/crash")
# 定义函数 crash
def crash():
    # 定义变量 d，赋值为 {}
    d = {}
    # 触发 KeyError
    return d["x"]

# ============ 8. 测试 ============
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试正常
# 定义函数 test_get_user_ok
def test_get_user_ok():
    # 定义变量 r，赋值为 client.get("/users/1")
    r = client.get("/users/1")
    # 断言状态码为 200(成功)
    assert r.status_code == 200
    # 打印
    print("test_get_user_ok 通过")

# 测试 404 业务异常
# 定义函数 test_user_not_found
def test_user_not_found():
    # 定义变量 r，赋值为 client.get("/users/99")
    r = client.get("/users/99")
    # 断言状态码 404(用户不存在)
    assert r.status_code == 404
    # 断言响应体里的 code 等于 USER_NOT_FOUND(10001)
    assert r.json()["code"] == ErrorCode.USER_NOT_FOUND
    # 打印
    print("test_user_not_found 通过")

# 测试余额不足(带 details)
# 定义函数 test_insufficient_balance
def test_insufficient_balance():
    # 定义变量 r，赋值为 client.post("/users/1/deduct?amount=999")
    # alice 余额 100,扣 999 会触发余额不足
    r = client.post("/users/1/deduct?amount=999")
    # 断言状态码 400(客户端错误)
    assert r.status_code == 400
    # 断言错误码等于 USER_INSUFFICIENT_BALANCE(10002)
    assert r.json()["code"] == ErrorCode.USER_INSUFFICIENT_BALANCE
    # 断言响应体里有 details 字段(携带余额和需要金额)
    assert "details" in r.json()
    # 打印
    print("test_insufficient_balance 通过")

# 测试全局兜底
# 定义函数 test_crash
def test_crash():
    # 定义变量 r，赋值为 client.get("/crash")
    r = client.get("/crash")
    # 断言状态码 500(服务器内部错误)
    assert r.status_code == 500
    # 断言错误码等于 SYSTEM_ERROR(50000)
    assert r.json()["code"] == ErrorCode.SYSTEM_ERROR
    # 打印
    print("test_crash 通过")

# 运行所有测试
# 调用 test_get_user_ok()
test_get_user_ok()
# 调用 test_user_not_found()
test_user_not_found()
# 调用 test_insufficient_balance()
test_insufficient_balance()
# 调用 test_crash()
test_crash()
# 打印
print("===== 所有测试通过 =====")
\`\`\`

这个体系涵盖了:错误码集中定义、异常分层、统一响应格式、日志记录、trace_id 追踪、环境区分、测试覆盖。这是一个可以直接用于生产的异常处理骨架。

## 九、设计思想

异常处理是「工程成熟度」的体现。新手只关心「能跑」,老手关心「出错时还能优雅地失败」。完整的异常体系包含:分层(校验/业务/系统)、统一格式、错误码体系、日志记录、监控告警、安全(不泄漏)。这些不是「锦上添花」,而是「生产可用」的底线。

记住三条原则:
1. **业务不碰 HTTP**:业务层 raise 纯业务异常,表现层负责翻译。解耦才能复用。
2. **响应对用户友好,日志对开发者详细**:两者各司其职,不能混为一谈。
3. **永远有兜底**:无论代码怎么写,总会有预料之外的异常。全局 Exception 处理器是最后一道防线,保证「永不暴露堆栈给用户」。

FastAPI 提供了机制(异常处理器),但实践要靠设计。把异常处理想清楚,API 的健壮性和可维护性就上了一个台阶。
`,
  },
];
