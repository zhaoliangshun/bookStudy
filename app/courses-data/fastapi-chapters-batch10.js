// =============================================================
// FastAPI 应用开发实战教程 - 第 10 批章节（认证与安全 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-oauth2       : OAuth2 与密码模式
//   fa-jwt          : JWT 认证
//   fa-password-hash: 密码哈希与安全
//   fa-rbac         : 权限控制与 RBAC
// ============================================================

export const chapters = [
  // =========================================================
  // 第一章：OAuth2 与密码模式
  // =========================================================
  {
    id: "fa-oauth2",
    group: "认证与安全",
    icon: "🔐",
    title: "OAuth2 与密码模式",
    content: `

# OAuth2 与密码模式

## 一、开篇：为什么需要 OAuth2

到目前为止，我们的 FastAPI 应用里所有接口都是"裸奔"的——任何人只要知道 URL，就能调用。但真实业务里，查订单必须先登录、删文章必须是作者本人、看后台数据必须是管理员。这一批章节要解决的核心问题就是：**怎么知道调用接口的人是谁，以及他能不能做这件事**。

OAuth2 是这一系列技术的"协议起点"。FastAPI 内置的认证工具（\`OAuth2PasswordBearer\`、\`OAuth2PasswordRequestForm\`）都是基于 OAuth2 规范实现的。理解 OAuth2 的设计思路，后面学 JWT、密码哈希、RBAC 才能融会贯通。

这一章我们不急着写代码，先把"为什么"想清楚，再一步步把 OAuth2 密码模式从零搭起来。

## 一·五、生活类比：OAuth2 像用微信登录第三方应用

**类比场景**：你下载了一个新的记账 App"小猪记账"，不想重新注册账号，于是点了"用微信登录"。

\`\`\`txt filename="微信登录第三方应用流程"
┌──────────┐      ┌──────────┐      ┌──────────┐
│ 小猪记账  │      │  微信     │      │  用户    │
│ (第三方)  │      │ (授权方)  │      │          │
└─────┬────┘      └─────┬────┘      └─────┬────┘
      │  1. 跳转到微信授权页                │
      │ ──────────────────────────────────► │
      │                  2. 用户点"同意授权" │
      │ ◄────────────────────────────────── │
      │  3. 微信给小猪记账发一个临时凭证      │
      │ ◄──────────                          │
      │  4. 小猪记账用凭证换 access_token    │
      │ ──────────►                          │
      │  5. 用 token 调微信接口拿头像/昵称   │
      │ ──────────►                          │
      │ ◄──────────  返回用户信息             │
\`\`\`

**核心思想对应到 OAuth2**：

| 生活场景 | OAuth2 术语 | 说明 |
|----------|-------------|------|
| 小猪记账 | Client（客户端） | 想要拿用户信息的第三方应用 |
| 微信 | Authorization Server（授权服务器） | 持有用户账号、能颁发令牌的服务 |
| 用户 | Resource Owner（资源所有者） | 拥有头像/昵称的人 |
| 微信用户信息接口 | Resource Server（资源服务器） | 提供资源的接口 |
| 临时凭证 | Authorization Code（授权码） | 一次性、短时间有效的中间凭证 |
| 最终令牌 | access_token | 调资源接口要带的"通行证" |

**密码模式的不同**：上面的微信登录是"授权码模式"（最安全，因为第三方永远拿不到用户的微信密码）。而本章讲的"密码模式"相当于：**小猪记账是你自己开的公司，你直接把微信账号密码给它**——只有"前后端都是自己写的"才适用。

**再换个类比**：密码模式像酒店入住。你前台报身份证号 + 房卡密码（账号密码），前台核实后给你一张房卡（token）。之后你进房间、用健身房、吃自助餐都只刷房卡，不用再报身份证。房卡丢了能挂失，过期了能续住——这就是 token 相对密码的优势。

## 二、先分清两个词：认证 vs 授权

很多人把"认证"和"授权"混着用，但它们回答的是两个不同的问题：

| 概念 | 英文 | 回答的问题 | 例子 |
|------|------|------------|------|
| 认证 | Authentication | **你是谁？** | 用账号密码登录，证明你是 alice |
| 授权 | Authorization | **你能做什么？** | alice 是不是管理员？能删文章吗？ |

记忆口诀：**AuthN 知道你是谁，AuthZ 决定你能干啥**（N=Who，Z=Zenith/许可）。

一个完整的安全链路是先认证（验明身份）再授权（检查权限）。本章先讲认证（怎么登录拿 token），下一章讲 JWT（token 长什么样），再讲密码哈希，最后讲授权（RBAC 权限）。

## 三、为什么不能每次请求都传账号密码

最原始的认证是 HTTP Basic Auth：每个请求的请求头都带 \`Authorization: Basic <base64(user:pass)>\`。这有两个致命问题：

1. **每次都传密码**：密码在网络/日志/缓存里到处留痕，泄露风险极高。
2. **无法撤销**：密码改了，但已发出的请求"已经认证过"——其实没法主动让某个会话失效。

更好的思路是：**登录一次，换一个临时令牌（token），之后请求只带 token**。token 有过期时间，可以随时撤销，密码只在登录那一次传输。这就是 OAuth2 密码模式的核心思想。

## 四、OAuth2 是什么

OAuth2（Open Authorization 2.0）是一个**授权框架**，定义了一套"如何让用户把有限权限安全地交给第三方应用"的流程。最早是为了解决"用 GitHub 账号登录第三方网站"这种场景：你不想把 GitHub 密码告诉第三方，但又想让第三方能拿到你的头像和邮箱。

OAuth2 定义了**四种授权模式**（Grant Type），适配不同场景：

| 模式 | 中文名 | 适用场景 | 是否需要后端 |
|------|--------|----------|--------------|
| Authorization Code | 授权码模式 | 第三方登录（GitHub/Google 登录） | 是，最安全 |
| Implicit | 简化模式 | 纯前端 SPA（已不推荐） | 否 |
| Password | 密码模式 | 自家应用（前后端都是自己写的） | 是 |
| Client Credentials | 客户端模式 | 服务对服务（机器对机器） | 是 |

**重点说明**：OAuth2 密码模式（Password Grant）在 OAuth2.1 里被标记为不推荐用于第三方，原因是它要求客户端直接拿到用户密码。但**如果你做的是自家产品（前端和后端都是自己的），密码模式依然是最简单实用的选择**。FastAPI 官方教程也是以密码模式为例。本章和后续章节都基于密码模式。

## 五、OAuth2 密码模式的工作流程

用一个时序图说清楚：

\`\`\`txt filename="OAuth2 密码模式流程"
┌────────┐          ┌──────────┐         ┌──────────┐
│ 前端    │          │ FastAPI   │         │ 数据库    │
│ (用户)  │          │ (后端)    │         │           │
└───┬────┘          └────┬─────┘         └────┬─────┘
    │   1. POST /token       │                   │
    │   body: username+password                  │
    │─────────────────────►│                   │
    │                      │  2. 查用户、验密码  │
    │                      │──────────────────►│
    │                      │  3. 返回用户记录    │
    │                      │◄──────────────────│
    │                      │                   │
    │                      │  4. 生成 token     │
    │                      │  (后续章节用 JWT)   │
    │  5. 返回 access_token │                   │
    │◄─────────────────────│                   │
    │                      │                   │
    │  6. GET /me           │                   │
    │  Header: Authorization: Bearer <token>   │
    │─────────────────────►│                   │
    │                      │  7. 解析 token     │
    │                      │     查回用户       │
    │                      │──────────────────►│
    │                      │  8. 返回用户信息    │
    │                      │◄──────────────────│
    │  9. 返回当前用户       │                   │
    │◄─────────────────────│                   │
\`\`\`

关键点：**密码只在第 1 步传输一次**，之后所有请求都用 token。token 可以随时失效，可以带过期时间，比直接传密码安全得多。

## 六、FastAPI 里的 OAuth2PasswordBearer

FastAPI 提供了 \`OAuth2PasswordBearer\` 类，它本质上是一个**依赖项工厂**：把它作为依赖注入到路由，FastAPI 会自动从请求头 \`Authorization: Bearer xxx\` 里提取 token，并在 Swagger UI 里显示"Authorize"按钮。

### Demo 1：最小可用的 OAuth2 骨架

先看一个最简单的例子，理解 \`OAuth2PasswordBearer\` 长什么样、怎么用：

\`\`\`python filename="demo1_oauth2_skeleton.py"
# 从 fastapi.security 模块导入 OAuth2PasswordBearer 类
# 这个类封装了"从请求头提取 Bearer token"的逻辑
from fastapi.security import OAuth2PasswordBearer

# 从 fastapi 导入 FastAPI 应用类和 Depends 依赖注入工具
from fastapi import FastAPI, Depends

# 创建 FastAPI 应用实例
# FastAPI() 不传参数会用默认配置
# 实例化后 app 就是一个 ASGI 应用，可以挂载路由
app = FastAPI()

# 创建 OAuth2PasswordBearer 实例
# 参数 tokenUrl 指向"颁发 token 的端点路径"
# 它只是一个字符串，FastAPI 不会真的去检查这个路径是否存在
# 它的作用有两个：
#   1. 告诉 Swagger UI："用户该去 /token 这个地址登录"
#   2. 在 OpenAPI 文档里记录这个信息，方便客户端集成
# 实例化后，oauth2_scheme 是一个可调用对象
# 作为依赖时，它会自动从请求头 Authorization: Bearer xxx 提取 token
# 如果请求头没有 Authorization，FastAPI 直接返回 401
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 定义一个路由 /me，依赖 oauth2_scheme
# oauth2_scheme 作为依赖，会自动从请求头提取 token
# 如果请求头没有 Authorization，FastAPI 直接返回 401
# 如果有，token 字符串会被注入到下面的 token 参数
@app.get("/me")
# 参数 token: str = Depends(oauth2_scheme)
# 这一行做了三件事：
#   1. 声明这个路由需要 OAuth2 认证
#   2. 把 token 字符串注入到 token 变量
#   3. Swagger UI 自动出现 Authorize 按钮
async def read_me(token: str = Depends(oauth2_scheme)):
    # 此刻 token 是请求头里 Bearer 后面那串字符串
    # 我们还不知道这串字符串代表哪个用户，下一节再处理
    # 这里只是原样返回，证明 token 被正确提取
    return {"token": token}

# 启动：uvicorn demo1_oauth2_skeleton:app --reload
# 测试：打开 http://127.0.0.1:8000/docs
# 你会看到右上角出现 "Authorize" 按钮
# 直接访问 /me 会返回 401，因为没带 token
\`\`\`

运行后访问 \`/docs\`，你会看到 Swagger UI 右上角多了一个 **Authorize** 按钮——这就是 \`OAuth2PasswordBearer\` 的魔法。点开后它要求你输入 token，但此时我们还不能登录，因为 \`/token\` 端点还没实现。

## 七、tokenUrl 到底是什么

很多人对 \`tokenUrl="token"\` 困惑：它是个路径？是个函数？为什么写错了还能跑？

**真相**：\`tokenUrl\` 只是一个**字符串提示**，告诉客户端"你应该去这个 URL 换 token"。FastAPI 不会因为 \`tokenUrl\` 拼错而报错，但：

- Swagger UI 的 Authorize 按钮会跳到这个 URL 去登录，拼错了就登录不了。
- OpenAPI 文档里会记录这个 URL，第三方客户端集成时会用它。

所以 \`tokenUrl\` **必须和你实际实现的 /token 端点路径一致**，否则 Swagger 登录会失败。

## 八、OAuth2PasswordRequestForm：登录表单

OAuth2 规范要求：登录端点（\`/token\`）接收的不是 JSON，而是 **表单格式**（\`application/x-www-form-urlencoded\`），字段名固定为 \`username\`、\`password\`。FastAPI 提供了 \`OAuth2PasswordRequestForm\` 来解析这个表单。

\`\`\`python filename="demo2_login_form.py"
# 从 fastapi.security 导入 OAuth2PasswordRequestForm
# 这是一个表单模型，专门用于解析登录请求
# 它继承自 pydantic.BaseModel，但用 Form 字段而不是 Body 字段
from fastapi.security import OAuth2PasswordRequestForm

# 从 fastapi 导入路由装饰器和依赖注入
from fastapi import FastAPI, Depends, HTTPException

# 导入 status 方便使用状态码常量
# status.HTTP_401_UNAUTHORIZED 比 401 更可读
from fastapi import status

app = FastAPI()

# 定义 /token 端点，方法必须是 POST
# 参数 form_data 用 Depends 注入 OAuth2PasswordRequestForm
# FastAPI 会自动从请求体解析表单字段
@app.post("/token")
# form_data: OAuth2PasswordRequestForm = Depends()
# 注意这里用 Depends() 不传参数，相当于 Depends(OAuth2PasswordRequestForm)
# 因为 OAuth2PasswordRequestForm 本身是个可调用对象（类）
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username: 用户名（表单字段 username）
    # form_data.password: 密码（表单字段 password）
    # form_data.scope: 可选的权限范围（空格分隔字符串）
    # form_data.grant_type: 授权类型，密码模式下应该是 "password"
    # form_data.client_id / client_secret: 客户端凭证（密码模式一般不用）

    # 这里只是演示表单解析，不做真实校验
    # 真实场景：去数据库查用户、用 passlib 验证密码（下一章讲）
    if form_data.username == "alice" and form_data.password == "secret":
        # 校验通过，生成 token
        # 真实场景这里用 JWT 编码（下一章讲）
        token = "fake-token-for-" + form_data.username
        # OAuth2 规范要求返回 JSON，字段名固定
        return {
            "access_token": token,  # token 字符串
            "token_type": "bearer"  # token 类型，固定为 bearer
        }

    # 校验失败，返回 401
    # www-authenticate 头是 OAuth2 规范要求的，提示客户端用 Bearer 认证
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="用户名或密码错误",
        headers={"WWW-Authenticate": "Bearer"},
    )

# 测试：
# curl -X POST http://127.0.0.1:8000/token \\
#   -d "username=alice&password=secret"
# 返回：{"access_token":"fake-token-for-alice","token_type":"bearer"}
\`\`\`

注意：返回的 JSON 字段名 \`access_token\` 和 \`token_type\` 是 OAuth2 规范**强制要求**的，写错客户端就解析不了。

## 九、避坑：表单字段名是固定的

新手常犯的错：

| 错误写法 | 为什么不行 |
|----------|------------|
| 用 JSON 传 \`{"user":"alice"}\` | OAuth2 要求表单格式，且字段名是 \`username\` |
| 把字段名写成 \`user\`、\`pwd\` | \`OAuth2PasswordRequestForm\` 只认 \`username\`、\`password\` |
| 在 \`/token\` 里用 \`Body\` 接收 | 应该用 \`OAuth2PasswordRequestForm\`，否则 Swagger 登录页对不上 |

如果你坚持想用 JSON 登录，可以自定义一个 Pydantic 模型，但这样 Swagger UI 的 Authorize 按钮就不会自动调用你的登录接口——失去 \`OAuth2PasswordRequestForm\` 的便利。所以**除非有特殊原因，老老实实用表单**。

## 十、/token 端点完整实现

把前面两节合起来，加上一个假的"用户数据库"，写一个能跑的完整 /token：

\`\`\`python filename="demo3_token_endpoint.py"
# 导入 OAuth2 相关工具
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# 导入 FastAPI 核心组件
from fastapi import FastAPI, Depends, HTTPException, status

app = FastAPI()

# 创建 OAuth2 依赖，tokenUrl 指向 /token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 假的用户数据库：用户名 -> 用户信息
# 真实场景应该用数据库，这里用字典演示
fake_users_db = {
    "alice": {
        "username": "alice",
        # 注意：真实场景密码必须是哈希值，绝不能存明文（下一章讲）
        "password": "secret",
        "disabled": False,
    },
    "bob": {
        "username": "bob",
        "password": "hunter2",
        "disabled": True,  # 这个账号被禁用了
    },
}

# 定义 /token 端点
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 第一步：从数据库查用户
    user = fake_users_db.get(form_data.username)

    # 第二步：检查用户是否存在
    if user is None:
        # 用户不存在，返回 401
        # 注意：出于安全考虑，不要明确说"用户不存在"
        # 否则攻击者能通过错误信息枚举出哪些用户名存在
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 第三步：检查密码（这里用明文比对，仅演示）
    # 真实场景必须用 passlib 验证哈希（下一章讲）
    if user["password"] != form_data.password:
        # 密码错，返回 401，错误信息和用户不存在时一样
        # 这样攻击者无法区分"用户不存在"和"密码错误"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 第四步：检查账号是否被禁用
    if user["disabled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号已被禁用",
        )

    # 第五步：生成 token
    # 这里用最简单的拼接，真实场景用 JWT（下一章讲）
    access_token = "fake-token-" + user["username"]

    # 第六步：按 OAuth2 规范返回
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

# 测试：
# 1. 正常登录：curl -X POST .../token -d "username=alice&password=secret"
#    返回：{"access_token":"fake-token-alice","token_type":"bearer"}
# 2. 错误密码：curl -X POST .../token -d "username=alice&password=wrong"
#    返回 401：{"detail":"用户名或密码错误"}
# 3. 禁用账号：curl -X POST .../token -d "username=bob&password=hunter2"
#    返回 400：{"detail":"账号已被禁用"}
\`\`\`

## 十一、get_current_user：从 token 还原用户

拿到 token 之后，每个受保护的路由都需要"从 token 反查出当前用户"。这个逻辑在每个路由里都要用，所以抽成一个**依赖函数** \`get_current_user\`。

### Demo 4：完整的 get_current_user 实现

\`\`\`python filename="demo4_get_current_user.py"
# 导入 OAuth2 工具
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# 导入 FastAPI 组件
from fastapi import FastAPI, Depends, HTTPException, status
# 导入 Pydantic 用于定义用户模型
from pydantic import BaseModel

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 定义用户模型（响应用）
class User(BaseModel):
    username: str
    disabled: bool = False

# 假用户库
fake_users_db = {
    "alice": {"username": "alice", "password": "secret", "disabled": False},
    "bob": {"username": "bob", "password": "hunter2", "disabled": True},
}

# 反向索引：token -> username
# 真实场景 token 是 JWT，能直接解码出用户名，不需要这个表
fake_tokens = {
    "fake-token-alice": "alice",
    "fake-token-bob": "bob",
}

# 定义 get_current_user 依赖
# 这是整个认证体系的核心：token -> user 的转换
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 第一步：根据 token 查用户名
    # 真实场景这里用 JWT 解码（下一章讲）
    username = fake_tokens.get(token)

    # 第二步：token 无效
    if username is None:
        # token 查不到对应用户，说明 token 是伪造的或已失效
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 第三步：根据用户名查用户
    user_dict = fake_users_db.get(username)
    if user_dict is None:
        # token 有效但用户已被删除
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 第四步：返回 User 模型实例
    return User(**user_dict)

# 定义 /me 端点：返回当前登录用户
@app.get("/me")
# current_user: User = Depends(get_current_user)
# 这一行完成了完整的认证链路：
#   1. oauth2_scheme 从请求头提取 token
#   2. get_current_user 把 token 转成 user
#   3. current_user 拿到 user 对象
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

# 测试：
# 1. 不带 token：curl http://127.0.0.1:8000/me
#    返回 401：{"detail":"Not authenticated"}
# 2. 带正确 token：
#    curl -H "Authorization: Bearer fake-token-alice" http://127.0.0.1:8000/me
#    返回：{"username":"alice","disabled":false}
# 3. 带错误 token：
#    curl -H "Authorization: Bearer fake-token-nope" http://127.0.0.1:8000/me
#    返回 401：{"detail":"无效的认证凭据"}
\`\`\`

## 十二、依赖注入的妙处

注意上面 \`get_current_user\` **本身也依赖 \`oauth2_scheme\`**。FastAPI 会自动构建依赖链：

\`\`\`txt
/me 路由
  └── get_current_user
        └── oauth2_scheme (提取 token)
\`\`\`

调用顺序是从里到外：先 \`oauth2_scheme\` 提取 token，再 \`get_current_user\` 用 token 查用户，最后路由函数拿到 \`current_user\`。这种**组合式依赖**是 FastAPI 认证系统的精髓——你只需要写一次 \`get_current_user\`，所有受保护的路由都 \`Depends(get_current_user)\` 即可。

## 十三、区分"已登录"和"已激活"

有时候用户登录了，但账号被禁用，我们还想拦截。可以再加一层依赖 \`get_current_active_user\`：

\`\`\`python filename="demo5_active_user.py"
# 在前一个 demo 基础上追加这段代码

# 定义 get_current_active_user 依赖
# 它依赖 get_current_user，再加一层"是否激活"检查
async def get_current_active_user(
    current_user: User = Depends(get_current_user),
):
    # 如果账号被禁用，返回 400
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号已被禁用，无法操作",
        )
    # 通过检查，返回当前用户
    return current_user

# 受保护的路由用 get_current_active_user
@app.get("/me")
async def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# 只有管理员能访问的路由，可以再加一层
# 这里只是示意，真正的 RBAC 下一批章节讲
async def get_current_admin(
    current_user: User = Depends(get_current_active_user),
):
    if current_user.username != "alice":  # 演示用，alice 是管理员
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return current_user

@app.get("/admin")
async def admin_only(current_user: User = Depends(get_current_admin)):
    return {"message": f"欢迎管理员 {current_user.username}"}

# 这种"洋葱式"依赖链让权限检查非常清晰：
# oauth2_scheme -> get_current_user -> get_current_active_user -> get_current_admin
# 每一层只做一件事，组合起来就能实现复杂权限
\`\`\`

## 十四、实战：完整的 OAuth2 密码模式登录流程

把前面所有片段拼起来，加一个注册端点，做一个能跑的完整 demo：

\`\`\`python filename="demo6_full_oauth2.py"
# 完整的 OAuth2 密码模式示例
# 运行：uvicorn demo6_full_oauth2:app --reload
# 测试：打开 http://127.0.0.1:8000/docs

# 导入类型注解用的 Optional
from typing import Optional
# 导入 OAuth2 工具
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# 导入 FastAPI 核心组件
from fastapi import FastAPI, Depends, HTTPException, status
# 导入 Pydantic 模型基类
from pydantic import BaseModel

# 创建应用
app = FastAPI(title="OAuth2 密码模式完整示例")

# 创建 OAuth2 依赖
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 数据模型 ----------

# 用户响应模型
class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: bool = False

# 用户入库模型（包含密码）
class UserInDB(User):
    password: str

# 注册请求模型
class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

# ---------- 假数据库 ----------

# 用户表：用户名 -> UserInDB
fake_users_db: dict[str, UserInDB] = {
    "alice": UserInDB(
        username="alice",
        email="alice@example.com",
        disabled=False,
        password="secret",
    ),
}

# token -> 用户名 的反向索引
# 真实场景用 JWT，token 自带用户信息，不需要这个表
fake_tokens: dict[str, str] = {}

# ---------- 依赖函数 ----------

# 从 token 还原当前用户
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # 根据 token 查用户名
    username = fake_tokens.get(token)
    if username is None:
        # token 无效
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 查用户
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 返回时不带密码
    return User(**user.model_dump(exclude={"password"}))

# 确保账号已激活
async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号已被禁用",
        )
    return current_user

# ---------- 路由 ----------

# 注册端点：创建新用户
@app.post("/register", response_model=User)
async def register(req: RegisterRequest):
    # 检查用户名是否已存在
    if req.username in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在",
        )
    # 创建用户（密码明文存储，仅演示！真实场景必须哈希）
    # UserInDB 继承自 User，多了 password 字段（入库用）
    user = UserInDB(
        username=req.username,
        email=req.email,
        disabled=False,  # 新用户默认激活
        password=req.password,  # 真实场景：pwd_context.hash(req.password)
    )
    # 存入"数据库"（字典模拟）
    fake_users_db[req.username] = user
    # 返回时不带密码
    # model_dump(exclude={"password"}) 把 UserInDB 转成字典并排除 password 字段
    # 再用 User(**...) 构造，确保响应里不泄露密码
    return User(**user.model_dump(exclude={"password"}))

# 登录端点：颁发 token
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 查用户：从假数据库按用户名查
    user = fake_users_db.get(form_data.username)
    # 验证用户存在 + 密码正确
    # 用 or 合并判断，错误信息统一，防止攻击者区分"用户不存在"和"密码错误"
    if user is None or user.password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            # WWW-Authenticate 头是 OAuth2 规范要求，提示客户端用 Bearer 认证
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 检查账号是否激活
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号已被禁用",
        )
    # 生成 token（伪 token，真实场景用 JWT）
    import secrets
    # secrets.token_hex(16) 生成 32 字符的随机十六进制字符串，确保 token 不可预测
    token = "fake-token-" + secrets.token_hex(16)
    # 存入反向索引表：token -> username，后续 get_current_user 用它反查用户
    fake_tokens[token] = user.username
    # 按 OAuth2 规范返回
    # access_token 和 token_type 是规范要求的固定字段名，不能改
    return {"access_token": token, "token_type": "bearer"}

# 获取当前用户
@app.get("/me", response_model=User)
async def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# 受保护的业务接口
@app.get("/orders")
async def list_orders(current_user: User = Depends(get_current_active_user)):
    return {
        "user": current_user.username,
        "orders": [
            {"id": 1, "item": "FastAPI 实战"},
            {"id": 2, "item": "Python 进阶"},
        ],
    }

# 完整测试流程：
# 1. 注册：curl -X POST .../register -H "Content-Type: application/json" \\
#    -d '{"username":"bob","password":"pw","email":"b@e.com"}'
# 2. 登录：curl -X POST .../token -d "username=bob&password=pw"
#    拿到 access_token
# 3. 访问 /me：curl -H "Authorization: Bearer <token>" .../me
# 4. 访问 /orders：curl -H "Authorization: Bearer <token>" .../orders
\`\`\`

## 十四·一、进阶：OAuth2PasswordBearer 完整实现（带 scopes 权限范围）

OAuth2 规范里有个 \`scopes\` 概念：token 可以携带"权限范围"，限制它只能做某些事。比如登录时申请 \`read:articles write:articles\`，token 就只能读写文章，不能删用户。FastAPI 的 \`OAuth2PasswordBearer\` 原生支持 scopes。

### Demo 7：带 scopes 的 OAuth2PasswordBearer 完整实现

\`\`\`python filename="demo7_oauth2_scopes.py"
# 带 scopes（权限范围）的 OAuth2 完整实现
# 运行：uvicorn demo7_oauth2_scopes:app --reload

from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Security
# Security 和 Depends 用法几乎一样，区别：
#   Security 能声明 scopes，Depends 不能
#   当依赖需要 scopes 检查时必须用 Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
# SecurityScopes 是 FastAPI 用来传递"当前路由需要哪些 scopes"的容器
from pydantic import BaseModel

app = FastAPI(title="OAuth2 Scopes 示例")

# 创建带 scopes 定义的 OAuth2PasswordBearer
# scopes 参数是一个 dict，key 是 scope 名，value 是描述（Swagger 显示用）
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "read:articles": "读取文章的权限",
        "write:articles": "写入/修改文章的权限",
        "delete:articles": "删除文章的权限",
        "admin": "管理员权限（包含所有权限）",
    },
)

# ---------- 假数据库 ----------
fake_users_db = {
    "alice": {
        "username": "alice",
        "password": "secret",  # 真实场景必须哈希
        "scopes": ["admin"],  # alice 是管理员
    },
    "bob": {
        "username": "bob",
        "password": "hunter2",
        "scopes": ["read:articles", "write:articles"],  # bob 只能读写
    },
    "carol": {
        "username": "carol",
        "password": "pass3",
        "scopes": ["read:articles"],  # carol 只能读
    },
}

# token -> (username, scopes) 反向索引
# 真实场景用 JWT，scopes 写在 payload 里
fake_tokens: dict[str, dict] = {}

# ---------- 数据模型 ----------
class User(BaseModel):
    username: str
    scopes: list[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str

# ---------- 登录端点 ----------
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """登录端点：支持 scope 参数"""
    # 查用户
    user = fake_users_db.get(form_data.username)
    if user is None or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 解析 form_data.scope：客户端通过 scope 字段申请权限
    # form_data.scope 是空格分隔的字符串，如 "read:articles write:articles"
    # split() 按空格切分成列表
    requested_scopes = form_data.scopes.split() if form_data.scopes else []
    # 用户实际拥有的权限
    user_scopes = user["scopes"]
    # admin scope 包含所有权限
    if "admin" in user_scopes:
        # 管理员：申请什么给什么
        granted_scopes = requested_scopes if requested_scopes else ["admin"]
    else:
        # 普通用户：只能拿到"申请的 ∩ 拥有的"
        # 交集运算：set(requested) & set(user_scopes)
        granted_scopes = list(set(requested_scopes) & set(user_scopes))
    # 生成 token（伪 token，真实场景用 JWT + scopes 在 payload 里）
    import secrets
    token = "fake-token-" + secrets.token_hex(16)
    # 存 token -> {username, scopes}
    fake_tokens[token] = {
        "username": user["username"],
        "scopes": granted_scopes,
    }
    return {"access_token": token, "token_type": "bearer"}

# ---------- get_current_user（带 scopes 检查）----------
async def get_current_user(
    # SecurityScopes 由 FastAPI 自动注入，包含当前路由声明的 scopes
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme),
) -> User:
    """从 token 还原用户，并检查 scopes"""
    # token 无效
    if token not in fake_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token_data = fake_tokens[token]
    username = token_data["username"]
    token_scopes = token_data["scopes"]
    # 查用户
    user_dict = fake_users_db.get(username)
    if user_dict is None:
        raise HTTPException(401, "用户不存在")
    # 检查 token 的 scopes 是否覆盖路由需要的 scopes
    # security_scopes.scopes 是当前路由声明的必需 scopes
    if security_scopes.scopes:
        # 检查每个必需的 scope 是否在 token 的 scopes 里
        for scope in security_scopes.scopes:
            if scope not in token_scopes:
                # 缺少权限，返回 403
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"缺少权限：{scope}",
                    headers={"WWW-Authenticate": f'Bearer scope="{security_scopes.scope_str}"'},
                )
    return User(username=username, scopes=token_scopes)

# ---------- 依赖工厂：声明需要的 scopes ----------
def require_scopes(*scopes: str):
    """声明路由需要的 scopes
    用法：Depends(require_scopes("read:articles"))
    """
    async def check(
        # Security 而不是 Depends：这样才能用 scopes 参数
        current_user: User = Security(get_current_user, scopes=list(scopes)),
    ) -> User:
        return current_user
    return check

# ---------- 路由 ----------
@app.get("/articles")
# 需要 read:articles scope
async def list_articles(current_user: User = Depends(require_scopes("read:articles"))):
    return {"articles": ["a1", "a2"], "viewed_by": current_user.username}

@app.post("/articles")
# 需要 write:articles scope
async def create_article(current_user: User = Depends(require_scopes("write:articles"))):
    return {"message": f"{current_user.username} 创建了文章"}

@app.delete("/articles/{id}")
# 需要 delete:articles scope
async def delete_article(
    id: int,
    current_user: User = Depends(require_scopes("delete:articles")),
):
    return {"message": f"{current_user.username} 删除了文章 {id}"}

# 测试流程：
# 1. alice 登录申请所有 scope：
#    curl -X POST .../token -d "username=alice&password=secret&scope=read:articles write:articles delete:articles"
# 2. bob 登录只申请 read：
#    curl -X POST .../token -d "username=bob&password=hunter2&scope=read:articles"
#    bob 拿到的 token 只能调 GET /articles
# 3. bob 想申请 delete：scope=delete:articles
#    但 bob 没有 delete 权限，granted_scopes 会是空列表（交集为空）
# 4. carol 想申请 write：scope=write:articles
#    carol 只有 read，交集为空，token 没有 write 权限
\`\`\`

**scopes vs RBAC 怎么选**：

- scopes 是 OAuth2 标准里的"细粒度权限"，适合"客户端申请权限"场景（如第三方应用）。
- RBAC 是"角色-权限"模型，适合"内部用户管理"场景。
- 两者可以结合：用户有角色（RBAC），角色决定能申请哪些 scopes。

## 十四·二、自定义认证异常处理器

默认的 401 响应只有 \`{"detail": "..."}\`，业务里常常需要统一错误格式（如带错误码 \`{"code": 401, "msg": "..."}\`）。FastAPI 允许注册异常处理器来自定义响应。

### Demo 8：自定义认证错误响应

\`\`\`python filename="demo8_custom_exception.py"
# 自定义认证错误的响应格式
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.exceptions import HTTPException as FastAPIHTTPException

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
# auto_error=False：token 缺失时不自动抛 401
# 这样我们能在依赖里自定义错误处理

# 自定义异常类
class AuthError(Exception):
    """认证异常"""
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

# 注册 AuthError 的异常处理器
# FastAPI 遇到 AuthError 时会调用这个函数
@app.exception_handler(AuthError)
async def auth_error_handler(request: Request, exc: AuthError):
    """统一处理认证异常，返回自定义格式"""
    # 返回 JSONResponse 而不是抛 HTTPException
    # 这样能完全控制响应体格式
    return JSONResponse(
        status_code=exc.code,
        content={
            "code": exc.code,        # 业务错误码
            "msg": exc.message,      # 错误消息
            "path": str(request.url), # 哪个接口出错
        },
    )

# 自定义依赖：从 token 还原用户
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """从 token 还原用户，错误用 AuthError 抛"""
    # token 缺失
    if not token:
        # 抛自定义异常，会被 auth_error_handler 处理
        raise AuthError(401, "未提供认证 token")
    # token 无效（这里简化演示，真实场景用 JWT 解码）
    if token != "valid-token":
        raise AuthError(401, "token 无效或已过期")
    # 返回假用户
    return {"username": "alice"}

# 路由：用自定义依赖
@app.get("/me")
async def read_me(current_user: dict = Depends(get_current_user)):
    return current_user

# 路由：演示 403 权限不足
@app.get("/admin")
async def admin_panel(current_user: dict = Depends(get_current_user)):
    if current_user["username"] != "admin":
        # 用自定义异常返回 403
        raise AuthError(403, "需要管理员权限")
    return {"message": "欢迎管理员"}

# 测试：
# 1. 不带 token：curl http://127.0.0.1:8000/me
#    返回：{"code":401,"msg":"未提供认证 token","path":"http://127.0.0.1:8000/me"}
# 2. 错误 token：curl -H "Authorization: Bearer wrong" .../me
#    返回：{"code":401,"msg":"token 无效或已过期","path":"..."}
# 3. 正确 token 但访问 /admin：
#    curl -H "Authorization: Bearer valid-token" .../admin
#    返回：{"code":403,"msg":"需要管理员权限","path":"..."}
\`\`\`

**好处**：所有认证错误都走统一的 \`auth_error_handler\`，前端只要识别 \`code\` 字段就能统一处理（弹登录框、显示错误提示等）。

## 十五、常见错误与避坑指南

1. **401 Not authenticated**：请求头没带 \`Authorization: Bearer xxx\`，或者 Bearer 写成了 \`bearer\`（部分代理区分大小写）。
2. **Swagger Authorize 输入用户名密码没反应**：\`tokenUrl\` 拼错，或者 \`/token\` 端点没实现，或者返回的字段名不是 \`access_token\`。
3. **登录返回 422**：用了 JSON 而不是表单格式。OAuth2 登录必须用 \`application/x-www-form-urlencoded\`，curl 用 \`-d\` 而不是 \`-d @file.json\`。
4. **token 一直有效**：这个 demo 的 token 永不过期，生产环境必须用 JWT + 过期时间，下一章讲。
5. **错误信息泄露用户是否存在**：不要写"用户不存在"和"密码错误"两种 detail，统一写"用户名或密码错误"。
6. **明文存密码**：本 demo 为了简化用明文，**生产环境绝对不行**，必须用 bcrypt 哈希，下一章讲。
7. **把 token 存在 localStorage**：容易被 XSS 攻击窃取，前端推荐用 HttpOnly Cookie，第 2 章会讲。
8. **tokenUrl 路径大小写不一致**：\`tokenUrl="Token"\` 但实际路由是 \`@app.post("/token")\`，导致 Swagger 登录失败。路径必须完全一致。
9. **OAuth2PasswordRequestForm 忘记 Depends**：写成 \`async def login(form_data: OAuth2PasswordRequestForm)\`，会报"missing required parameter"。必须 \`form_data: OAuth2PasswordRequestForm = Depends()\`。
10. **auto_error 配置不当**：\`OAuth2PasswordBearer(auto_error=False)\` 但依赖里没手动检查 None，导致 \`None\` 被当成 token 处理，逻辑错误。
11. **scopes 写法错误**：\`scope=read:articles,write:articles\`（逗号分隔）是错的，应该是空格分隔：\`scope="read:articles write:articles"\`。
12. **CORS 没配 credentials**：前端跨域请求带 Cookie 时，CORS 中间件必须 \`allow_credentials=True\`，否则 Cookie 不会被发送。

## 十六、动手实验

### 实验 1：体验 OAuth2 完整流程

**目标**：在 Swagger UI 里完整走一遍 OAuth2 登录。

**步骤**：

1. 把 Demo 6（\`demo6_full_oauth2.py\`）保存到本地，运行 \`uvicorn demo6_full_oauth2:app --reload\`。
2. 打开 \`http://127.0.0.1:8000/docs\`，注意右上角的 **Authorize** 按钮。
3. 不点 Authorize，直接调 \`GET /me\`，观察返回的 401 错误。
4. 先调 \`POST /register\` 注册一个新用户（如 username=test, password=test1234）。
5. 点 **Authorize** 按钮，输入 username=test, password=test1234，点登录。
6. 再调 \`GET /me\`，观察返回的用户信息（这次应该成功，因为 Swagger 自动带上了 token）。
7. 调 \`GET /orders\`，观察返回的订单数据。
8. 思考：为什么第 3 步失败，第 6 步成功？token 是怎么传递的？

### 实验 2：用 curl 模拟前端调用

**目标**：理解 token 在请求头里的传递方式。

**步骤**：

1. 用 curl 登录：\`curl -X POST http://127.0.0.1:8000/token -d "username=test&password=test1234"\`
2. 复制返回的 \`access_token\` 值。
3. 不带 token 访问：\`curl http://127.0.0.1:8000/me\`，观察 401。
4. 带错误 token 访问：\`curl -H "Authorization: Bearer wrong-token" http://127.0.0.1:8000/me\`，观察 401。
5. 带正确 token 访问：\`curl -H "Authorization: Bearer <你的 token>" http://127.0.0.1:8000/me\`，观察成功返回。
6. 故意拼错 \`Bearer\`（写成 \`bearer\`），观察是否还能成功（部分服务器区分大小写）。

### 实验 3：扩展 demo 加入 scopes

**目标**：理解 OAuth2 scopes 的权限控制。

**步骤**：

1. 基于 Demo 7，添加一个新用户 \`dave\`，scopes 为 \`["read:articles"]\`。
2. 用 dave 登录，申请 \`scope=read:articles write:articles\`。
3. 观察 dave 拿到的 token 实际有哪些 scopes（应该是只 read，因为交集）。
4. 用这个 token 调 \`POST /articles\`（需要 write:articles），观察 403。
5. 思考：如果 alice（admin）登录时只申请 \`scope=read:articles\`，她的 token 能调 \`DELETE /articles/1\` 吗？为什么？

## 十七、本章小结

- OAuth2 是授权框架，定义了四种模式，自家产品用**密码模式**。
- \`OAuth2PasswordBearer\` 是依赖项工厂，自动提取 token，让 Swagger 出现 Authorize 按钮。
- \`OAuth2PasswordRequestForm\` 解析登录表单，字段名固定为 \`username\`、\`password\`。
- \`/token\` 端点验密码、生成 token、按规范返回 \`access_token\` + \`token_type\`。
- \`get_current_user\` 把 token 反查成用户，是认证链路的核心依赖。
- 通过洋葱式依赖（\`get_current_user\` -> \`get_current_active_user\` -> \`get_current_admin\`）实现分层权限。
- **scopes** 是 OAuth2 的细粒度权限，token 携带权限范围，限制能调哪些接口。

下一章我们把这个"假 token"换成真正的 JWT，让 token 自带用户信息、能设过期时间、不需要在服务端存 token 表。
`
  },

  // =========================================================
  // 第二章：JWT 认证
  // =========================================================
  {
    id: "fa-jwt",
    group: "认证与安全",
    icon: "🔑",
    title: "JWT 认证",
    content: `

# JWT 认证

## 一、为什么需要 JWT

上一章我们实现了 OAuth2 密码模式，但 token 是"假的"——服务端用一个字典 \`fake_tokens = {token: username}\` 来记录哪个 token 对应哪个用户。这有个严重问题：**服务端必须存所有 token**，一旦重启就全失效，多机器部署时还得共享这个表。

更好的方案是让 token **自己携带用户信息**，服务端不需要存任何 token，每次只要"验签 + 解码"就能拿到用户。这正是 **JWT（JSON Web Token）** 的设计目标。

JWT 是一种**自包含的、可验证的 token 格式**，把用户信息编码进字符串里，并用密钥签名防止伪造。这一章我们从结构、原理到代码完整讲透 JWT。

## 一·五、生活类比：JWT 像加密的入场手环

**类比场景**：你去音乐节，入场时工作人员核验你的身份证（账号密码），然后给你一条**电子手环**。

\`\`\`txt filename="电子手环里的信息"
┌─────────────────────────────────────┐
│  手环编号: #A001                     │ ← Header（手环类型）
│  持有人: 张三                        │ ← Payload（用户信息）
│  权限: VIP区+普通区                  │ ← Payload（权限范围）
│  有效期: 2026-07-13 18:00~23:00     │ ← Payload（exp 过期时间）
│  签发: 音乐节组委会                  │ ← Payload（iss 签发者）
│  防伪水印: ████████                  │ ← Signature（签名防伪造）
└─────────────────────────────────────┘
\`\`\`

**手环的几个特点对应 JWT**：

| 手环特点 | JWT 对应 | 说明 |
|----------|----------|------|
| 手环上印着你的名字 | Payload 的 \`sub\` | 不用查系统就知道你是谁 |
| 有有效期，到点失效 | Payload 的 \`exp\` | 过了 23:00 手环失效，要重新买票（重新登录） |
| 有防伪水印 | Signature | 别人仿造不出合法手环，因为水印需要组委会的私章 |
| 入场只查手环不查身份证 | 验签不查密码 | 你不用每次进区域都掏身份证 |
| 手环丢了不能"远程作废" | JWT 难以撤销 | 这是 JWT 的缺点，要靠黑名单机制补救 |
| 手环上的信息谁都能看 | Payload 可解码 | 所以不能在手环上印身份证号（不能在 Payload 放密码） |

**再换个类比**：JWT 像一张"自带签名的身份证"。普通身份证要去公安局系统查才能验证真伪；JWT 身份证自带防伪签名，任何人只要知道组委会的公钥（验签密钥）就能自己验证真假，不用联网查。

**和 Session 的对比**：Session 像酒店前台存包——你拿到一个号码牌（sessionId），每次要东西就报号码，前台查记录。JWT 像自带信息的房卡——卡里直接写着你住哪个房间，刷一下就知道，不用查前台。

## 二、JWT 长什么样

一个真实的 JWT 大概是这样：

\`\`\`txt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsImV4cCI6MTcwMDAwMDAwMH0.K7gN1xVlmZW3pX4...
\`\`\`

注意它由**三段**组成，用 \`.\` 分隔：

\`\`\`txt
Header.Payload.Signature
\`\`\`

每一段都是 Base64URL 编码的 JSON。我们逐段拆开看。

## 三、JWT 三段结构详解

### 第一段：Header（头部）

Header 是一个 JSON 对象，描述 token 的元信息：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

- \`alg\`：签名算法，常见值 \`HS256\`（HMAC + SHA-256）、\`RS256\`（RSA + SHA-256）。
- \`typ\`：固定为 \`JWT\`，表示这是一个 JWT。

这段 JSON 经过 Base64URL 编码，得到 JWT 的第一段。

### 第二段：Payload（载荷）

Payload 是真正存放数据的地方，是一个 JSON 对象：

\`\`\`json
{
  "sub": "alice",
  "exp": 1700000000,
  "iat": 1699900000,
  "role": "admin"
}
\`\`\`

JWT 规范定义了一些**标准声明**（registered claims），建议但不强制使用：

| 字段 | 含义 | 示例 |
|------|------|------|
| \`sub\` | subject，主体（一般是用户 ID） | "alice" |
| \`exp\` | expiration time，过期时间（Unix 时间戳） | 1700000000 |
| \`iat\` | issued at，签发时间 | 1699900000 |
| \`nbf\` | not before，在此时间之前无效 | 1699900000 |
| \`iss\` | issuer，签发者 | "my-app" |
| \`aud\` | audience，接收方 | "my-frontend" |

你也可以放**自定义声明**，比如 \`role\`、\`email\`、\`company_id\`。

**重要警告**：Payload 只是 Base64 编码，**不是加密**！任何人拿到 token 都能解码看到 Payload。所以**绝不能在 Payload 里放密码、密钥、身份证号等敏感信息**。Signature 只保证 token 不被篡改，不保证机密性。如果需要加密，要用 JWE（JSON Web Encryption），不在本章范围。

### 第三段：Signature（签名）

Signature 是用密钥对 \`Header.Payload\` 计算的签名，作用是**防篡改**：

\`\`\`txt
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret_key
)
\`\`\`

服务端收到 token 时，用同样的密钥重新计算签名，如果和 token 里的签名一致，说明内容没被篡改。

## 四、JWT vs Session 对比

| 维度 | Session（服务端存储） | JWT（客户端存储） |
|------|---------------------|-------------------|
| 状态 | 有状态：服务端存 session 表 | 无状态：token 自带信息 |
| 扩展性 | 多机器要共享 session（Redis） | 任何机器都能验签 |
| 撤销 | 删 session 即可立即失效 | 难，需要黑名单机制 |
| 大小 | sessionId 很短 | JWT 较长（几百字节到 KB） |
| 安全性 | sessionId 不含信息 | JWT 可被解码看 Payload |
| 跨域 | 需要配置 cookie 跨域 | 放 Header 即可跨域 |

**选择建议**：

- 需要随时撤销 token、单点登出 → 用 Session。
- 微服务、多机器、不想维护 session 存储 → 用 JWT。
- 大多数中等规模 Web 应用：JWT + 短过期时间 + Refresh Token 是主流方案（本章后面讲）。

## 五、python-jose 库

Python 生态里 JWT 库主要有两个：\`pyjwt\` 和 \`python-jose\`。FastAPI 官方教程用 \`python-jose\`，因为它功能更全（支持 JWS、JWE、多种算法）。安装：

\`\`\`bash filename="安装依赖"
# 安装 python-jose，附带 cryptography 后端（用于 RS256 等算法）
pip install "python-jose[cryptography]"
\`\`\`

## 六、JWT 编码与解码

### Demo 1：JWT 的编码与解码

先从一个最简单的例子，理解 JWT 怎么生成、怎么验证：

\`\`\`python filename="demo1_jwt_basic.py"
# 从 jose 导入 jwt 模块
from jose import jwt, JWTError

# 定义密钥：HS256 算法需要一串密钥字符串
# 生产环境必须用强随机密钥，不能用 "secret"
# 可以用 python -c "import secrets; print(secrets.token_hex(32))" 生成
SECRET_KEY = "secret-key-change-me-in-production"

# 定义签名算法
ALGORITHM = "HS256"

# ---------- 编码：生成 JWT ----------

# 定义 Payload：要放进 token 的数据
payload = {
    "sub": "alice",          # subject：用户标识
    "role": "admin",         # 自定义声明：角色
    "exp": 9999999999,       # expiration：过期时间（Unix 时间戳）
}

# 调用 jwt.encode 生成 token
# 参数：payload、密钥、算法
# 返回值：三段式字符串（Header.Payload.Signature）
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print("生成的 JWT：", token)
# 输出类似：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...

# ---------- 解码：验证并读取 JWT ----------

# 调用 jwt.decode 验证签名 + 解码
# 参数：token、密钥、算法列表
# 注意：algorithms 必须传列表，即使只有一个算法
# 为什么必须传 algorithms？防止"算法混淆攻击"
#   如果不指定，攻击者可以把 alg 改成 none，绕过验签
# jwt.decode 会自动检查 exp 是否过期，过期会抛 ExpiredSignatureError
decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
print("解码出的 Payload：", decoded)
# 输出：{'sub': 'alice', 'role': 'admin', 'exp': 9999999999}

# ---------- 篡改验证 ----------

# 模拟攻击者篡改：改 Payload 的 sub 字段
# 攻击者没有密钥，重新签出来的签名和服务端不一致
tampered_payload = {"sub": "admin", "role": "admin", "exp": 9999999999}
# 攻击者用错误的密钥签名
fake_token = jwt.encode(tampered_payload, "wrong-key", algorithm=ALGORITHM)
try:
    # 服务端用正确密钥解码，签名不匹配，抛异常
    jwt.decode(fake_token, SECRET_KEY, algorithms=[ALGORITHM])
except JWTError as e:
    print("签名验证失败：", e)
    # 输出：Signature verification failed
\`\`\`

关键点：**只要密钥不泄露，攻击者就无法伪造合法 token**。这就是 JWT 安全性的核心。

## 七、HS256 vs RS256

JWT 支持很多签名算法，最常用的两种：

| 算法 | 密钥类型 | 适用场景 | 优缺点 |
|------|----------|----------|--------|
| HS256 | 对称密钥（一个字符串） | 单体应用、内部服务 | 简单，但签发方和验证方共享密钥，泄露风险大 |
| RS256 | 非对称密钥（公钥+私钥） | 微服务、第三方签发 | 私钥签发，公钥验证；公钥可公开，更安全 |

### Demo 2：用 RS256 算法签发和验证 JWT

\`\`\`python filename="demo2_rs256.py"
# 演示 RS256：用 RSA 私钥签发，公钥验证
from jose import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# 第一步：生成 RSA 密钥对
# 生产环境密钥应该是固定加载的，不要每次启动都生成
# 这里为了演示，运行时生成
private_key = rsa.generate_private_key(
    public_exponent=65537,  # 标准 RSA 公开指数（费马素数，加密快）
    key_size=2048,          # 2048 位足够安全，1024 位已不安全
)
# 从私钥导出公钥
# RSA 是非对称算法：私钥能推出公钥，公钥不能推出私钥
public_key = private_key.public_key()

# 把密钥序列化成 PEM 格式字符串（实际场景从文件读）
# PEM 是 Base64 编码的密钥格式，带 -----BEGIN ...----- 头尾
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,        # PEM 格式（文本，方便存储）
    format=serialization.PrivateFormat.PKCS8,   # PKCS8 是通用私钥格式
    encryption_algorithm=serialization.NoEncryption(),  # 不加密（生产可加密）
).decode()
public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,  # 公钥标准格式
).decode()

# 第二步：用私钥签发 JWT
payload = {"sub": "alice", "role": "admin", "exp": 9999999999}
# 算法指定 RS256
token = jwt.encode(payload, private_pem, algorithm="RS256")
print("RS256 签发的 token：", token[:50] + "...")

# 第三步：用公钥验证
# 注意：验证方只需要公钥，不需要私钥
# 这意味着多个服务可以共享公钥来验证 token，但只有签发服务有私钥
decoded = jwt.decode(token, public_pem, algorithms=["RS256"])
print("RS256 验证通过：", decoded)

# 第四步：模拟其他服务用同一公钥验证
# 微服务架构里，签发服务（认证中心）拿私钥
# 业务服务只拿公钥，用来验证 token 但不能签发
# 这样即使某个业务服务被攻破，攻击者也伪造不了 token
\`\`\`

**怎么选**：单体应用用 HS256 就够了；微服务架构、需要第三方验证 token，用 RS256。

## 八、Token 过期时间管理

JWT 的 \`exp\` 声明控制过期时间。\`python-jose\` 解码时会自动检查 \`exp\`，过期会抛 \`ExpiredSignatureError\`。

### Demo 3：带过期时间的 JWT

\`\`\`python filename="demo3_expiry.py"
# 演示 token 过期时间
from jose import jwt, ExpiredSignatureError
# datetime 模块用于处理时间
from datetime import datetime, timedelta, timezone

SECRET_KEY = "secret-key-change-me"
ALGORITHM = "HS256"

# 当前时间（带时区，UTC）
now = datetime.now(timezone.utc)

# 场景一：1 小时后过期（正常使用）
payload = {
    "sub": "alice",
    "iat": now,                              # 签发时间
    "exp": now + timedelta(hours=1),         # 过期时间：1 小时后
}
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
# 立即解码：能成功
decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
print("未过期，解码成功：", decoded["sub"])

# 场景二：1 秒后过期
payload2 = {
    "sub": "bob",
    "iat": now,
    "exp": now + timedelta(seconds=1),       # 1 秒后过期
}
token2 = jwt.encode(payload2, SECRET_KEY, algorithm=ALGORITHM)
# 等 2 秒，让 token 过期
import time
time.sleep(2)
# 再解码：抛 ExpiredSignatureError
try:
    jwt.decode(token2, SECRET_KEY, algorithms=[ALGORITHM])
except ExpiredSignatureError:
    print("token 已过期，拒绝访问")

# 场景三：过期时间设成过去（直接无效）
payload3 = {"sub": "eve", "exp": now - timedelta(hours=1)}
token3 = jwt.encode(payload3, SECRET_KEY, algorithm=ALGORITHM)
try:
    jwt.decode(token3, SECRET_KEY, algorithms=[ALGORITHM])
except ExpiredSignatureError:
    print("签发时就已经过期，直接无效")
\`\`\`

**过期时间怎么定**：

- 短期 access token：15 分钟 ~ 2 小时，过期需要重新登录或刷新。
- 长期 refresh token：7 天 ~ 30 天，只用于换新 access token。
- 不要设 100 年那种"永久 token"，等于没过期。

## 九、Token 刷新机制

如果 access token 过期了，每次让用户重新输密码登录，体验很差。Refresh Token 机制：登录时发两个 token，access token 短期、refresh token 长期；access token 过期后，前端用 refresh token 换新的 access token，用户无感知。

### Demo 4：双 Token 机制

\`\`\`python filename="demo4_refresh_token.py"
# 完整的 access + refresh token 机制
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "secret-key-change-me"
ALGORITHM = "HS256"

# 假用户库
fake_users_db = {
    "alice": {"username": "alice", "password": "secret"},
}

# 时间工具函数
def create_token(data: dict, expires_delta: timedelta) -> str:
    """生成 JWT 的工具函数"""
    # 复制一份数据，避免修改原字典
    to_encode = data.copy()
    # 计算过期时间
    expire = datetime.now(timezone.utc) + expires_delta
    # 写入 exp 声明
    to_encode.update({"exp": expire})
    # 编码返回
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 登录端点：同时颁发 access 和 refresh token
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 验证用户
    user = fake_users_db.get(form_data.username)
    if user is None or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    # 生成 access token：30 分钟过期
    access_token = create_token(
        data={"sub": user["username"], "type": "access"},
        expires_delta=timedelta(minutes=30),
    )
    # 生成 refresh token：7 天过期
    # refresh token 只用来换 access token，不放业务信息
    refresh_token = create_token(
        data={"sub": user["username"], "type": "refresh"},
        expires_delta=timedelta(days=7),
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

# 刷新端点：用 refresh token 换新 access token
class RefreshRequest(BaseModel):
    refresh_token: str

@app.post("/refresh")
async def refresh_token(req: RefreshRequest):
    try:
        # 解码 refresh token
        # jwt.decode 自动验签 + 检查 exp，过期或签名错都会抛异常
        payload = jwt.decode(req.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        # refresh token 也过期了，必须重新登录
        # 此时用户需要回到 /token 端点重新输密码
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="refresh token 已过期，请重新登录",
        )
    except JWTError:
        # token 无效（签名错误、格式错误、被篡改等）
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的 refresh token",
        )
    # 检查类型：必须是 refresh token，不能用 access token 来刷新
    # 这一步防止用户拿 access token 来换新 access token（绕过刷新机制）
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 类型错误",
        )
    # 签发新的 access token
    # 从 refresh token 取 sub（用户名），写入新 access token
    # type 设为 "access"，标记这是访问令牌
    new_access = create_token(
        data={"sub": payload["sub"], "type": "access"},
        expires_delta=timedelta(minutes=30),
    )
    # 只返回新的 access_token，refresh_token 不刷新（让旧的继续用到过期）
    return {"access_token": new_access, "token_type": "bearer"}

# 测试流程：
# 1. 登录拿到 access_token 和 refresh_token
# 2. 用 access_token 访问业务接口
# 3. access_token 过期后，POST /refresh 拿新 access_token
# 4. refresh_token 也过期了，重新登录
\`\`\`

注意 \`type\` 字段：access token 和 refresh token 内部都标记了类型，防止用 access token 去刷新（即使 access token 还没过期）。

## 十、JWT 在 FastAPI 里的完整集成

把 JWT 接入 \`get_current_user\`，替换掉上一章的"假 token 表"：

### Demo 5：JWT + FastAPI 完整认证系统

\`\`\`python filename="demo5_jwt_fastapi.py"
# 完整的 JWT + FastAPI 认证系统
# 运行：uvicorn demo5_jwt_fastapi:app --reload

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import jwt, JWTError, ExpiredSignatureError

app = FastAPI(title="JWT 认证示例")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 配置 ----------
# 密钥：生产环境从环境变量读取
SECRET_KEY = "secret-key-change-me-in-production-please"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ---------- 数据模型 ----------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: bool = False

class UserInDB(User):
    hashed_password: str

# ---------- 假数据库 ----------
fake_users_db = {
    "alice": UserInDB(
        username="alice",
        email="alice@example.com",
        disabled=False,
        # 这里用伪哈希，真实场景用 passlib（下一章讲）
        hashed_password="secret",
    ),
}

# ---------- JWT 工具函数 ----------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """生成 JWT access token"""
    # 复制数据，避免污染原字典
    to_encode = data.copy()
    # 计算过期时间
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # 默认 15 分钟
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    # 写入 exp
    to_encode.update({"exp": expire})
    # 编码返回
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---------- 依赖函数 ----------

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 JWT token 还原当前用户"""
    # 定义认证失败异常（复用，减少重复代码）
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 解码 JWT
        # jwt.decode 会自动验签 + 检查 exp
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # 从 payload 取出 sub（用户名）
        username: str = payload.get("sub")
        if username is None:
            # token 里没有 sub，无效
            raise credentials_exception
        # 用 TokenData 模型校验
        token_data = TokenData(username=username)
    except ExpiredSignatureError:
        # token 过期
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 已过期，请重新登录",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        # 其他 JWT 错误（签名错误、格式错误等）
        raise credentials_exception

    # 根据 username 查用户
    user = fake_users_db.get(token_data.username)
    if user is None:
        # token 有效但用户已被删除
        raise credentials_exception
    # 返回时不带密码
    return User(**user.model_dump(exclude={"hashed_password"}))

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """确保账号已激活"""
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号已被禁用",
        )
    return current_user

# ---------- 路由 ----------

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """登录端点：验证密码，颁发 JWT"""
    # 查用户
    user = fake_users_db.get(form_data.username)
    # 验证用户和密码（这里用明文比对，仅演示，真实用 passlib）
    # or 短路：user is None 时不再判断密码，避免 None.attribute 报错
    if user is None or user.hashed_password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 生成 JWT，sub 是用户名（JWT 标准声明，表示 token 主体）
    # expires_delta 设过期时间，到点后 jwt.decode 自动抛 ExpiredSignatureError
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    # 返回符合 OAuth2 规范的格式
    # response_model=Token 会自动校验返回值结构
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=User)
async def read_me(current_user: User = Depends(get_current_active_user)):
    """获取当前用户"""
    return current_user

@app.get("/orders")
async def list_orders(current_user: User = Depends(get_current_active_user)):
    """受保护的业务接口"""
    return {"user": current_user.username, "orders": [{"id": 1}]}

# 完整测试：
# 1. 登录：curl -X POST .../token -d "username=alice&password=secret"
#    返回 JWT 格式的 access_token
# 2. 解码 JWT（在 jwt.io 粘贴看 payload）：能看到 sub: "alice", exp: ...
# 3. 访问 /me：curl -H "Authorization: Bearer <jwt>" .../me
# 4. 等 30 分钟后访问，会返回 401 "token 已过期"
\`\`\`

这个 demo 和上一章的 OAuth2 demo 看起来差不多，但核心区别是：**服务端不需要 \`fake_tokens\` 表了**。token 自带用户信息，验签就能拿到用户名。多机器部署时，所有机器用同一个 \`SECRET_KEY\` 即可，不需要共享存储。

## 十·一、JWT 完整认证流程：生成 / 验证 / 刷新一站式 Demo

把前面的零散知识点串起来，做一个完整的"登录-访问-刷新-登出"全流程 demo，包含黑名单机制。

### Demo 6：JWT 全流程（含黑名单登出）

\`\`\`python filename="demo6_jwt_full_flow.py"
# JWT 全流程：登录 / 验证 / 刷新 / 登出（带黑名单）
# 运行：uvicorn demo6_jwt_full_flow:app --reload

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import jwt, JWTError, ExpiredSignatureError

app = FastAPI(title="JWT 全流程示例")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 配置 ----------
SECRET_KEY = "secret-key-change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30   # access token 30 分钟过期
REFRESH_TOKEN_EXPIRE_DAYS = 7      # refresh token 7 天过期

# ---------- 数据模型 ----------
class User(BaseModel):
    username: str
    role: str = "user"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # access token 剩余秒数，前端用来定时刷新

class RefreshRequest(BaseModel):
    refresh_token: str

# ---------- 假数据库 ----------
fake_users_db = {
    "alice": {"username": "alice", "password": "secret", "role": "admin"},
    "bob": {"username": "bob", "password": "hunter2", "role": "user"},
}

# ---------- 黑名单（用于登出）----------
# JWT 是无状态的，签发后无法主动失效
# 要支持"登出立即失效"，需要服务端维护一个黑名单
# 黑名单记录"已撤销的 token"，每次验签时检查是否在黑名单
# 生产环境用 Redis 存黑名单，自动过期（避免无限增长）
blacklisted_tokens: set[str] = set()

# ---------- JWT 工具函数 ----------
def create_token(data: dict, token_type: str, expires_delta: timedelta) -> str:
    """生成 JWT 的通用工具函数
    参数：
        data: 业务数据（如 sub, role）
        token_type: "access" 或 "refresh"，防混淆
        expires_delta: 过期时间增量
    """
    to_encode = data.copy()
    # 写入标准声明
    now = datetime.now(timezone.utc)
    to_encode.update({
        "iat": now,                       # 签发时间
        "exp": now + expires_delta,       # 过期时间
        "type": token_type,               # token 类型
        "jti": f"{token_type}-{now.timestamp()}",  # JWT ID，用于黑名单定位
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """解码 JWT，统一处理异常
    返回：payload dict
    异常：抛 HTTPException
    """
    try:
        # jwt.decode 自动验签 + 检查 exp
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 无效",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ---------- 依赖函数 ----------
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 access token 还原用户"""
    # 检查黑名单：登出过的 token 即使没过期也拒绝
    if token in blacklisted_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 已被撤销，请重新登录",
        )
    # 解码
    payload = decode_token(token)
    # 检查类型：必须是 access token
    # 防止用 refresh token 直接调业务接口
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 类型错误，请用 access token",
        )
    username = payload.get("sub")
    user_dict = fake_users_db.get(username)
    if user_dict is None:
        raise HTTPException(401, "用户不存在")
    return User(username=user_dict["username"], role=user_dict["role"])

# ---------- 路由：登录 ----------
@app.post("/token", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """登录：颁发 access + refresh token"""
    user = fake_users_db.get(form_data.username)
    if user is None or user["password"] != form_data.password:
        raise HTTPException(401, "用户名或密码错误")
    # 生成 access token：30 分钟过期
    access_token = create_token(
        data={"sub": user["username"], "role": user["role"]},
        token_type="access",
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    # 生成 refresh token：7 天过期
    refresh_token = create_token(
        data={"sub": user["username"]},
        token_type="refresh",
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

# ---------- 路由：刷新 ----------
@app.post("/refresh")
async def refresh_token(req: RefreshRequest):
    """用 refresh token 换新的 access token"""
    # 检查黑名单
    if req.refresh_token in blacklisted_tokens:
        raise HTTPException(401, "refresh token 已被撤销")
    # 解码
    payload = decode_token(req.refresh_token)
    # 检查类型
    if payload.get("type") != "refresh":
        raise HTTPException(401, "token 类型错误，请用 refresh token")
    username = payload.get("sub")
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(401, "用户不存在")
    # 签发新 access token
    new_access = create_token(
        data={"sub": user["username"], "role": user["role"]},
        token_type="access",
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": new_access,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }

# ---------- 路由：登出 ----------
@app.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """登出：把 token 加入黑名单"""
    # 验证 token 有效（无效会抛 401）
    decode_token(token)
    # 加入黑名单
    # 生产环境：存 Redis，key=token, value=1, TTL=剩余过期时间
    # 这样 token 过期后自动从黑名单移除，避免无限增长
    blacklisted_tokens.add(token)
    return {"message": "已登出"}

# ---------- 路由：业务接口 ----------
@app.get("/me")
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user

# 完整测试流程：
# 1. 登录：POST /token -d "username=alice&password=secret"
#    返回 {access_token, refresh_token, expires_in: 1800}
# 2. 访问 /me：GET /me -H "Authorization: Bearer <access>"
# 3. 登出：POST /logout -H "Authorization: Bearer <access>"
# 4. 再访问 /me：返回 401 "token 已被撤销"
# 5. 刷新：POST /refresh {"refresh_token": "<refresh>"}
#    拿到新的 access_token，能继续访问
# 6. 等 7 天 refresh 过期，需要重新登录
\`\`\`

**关键设计点**：

- **type 字段**：access 和 refresh token 内部都标记类型，防止混用。
- **jti（JWT ID）**：每个 token 有唯一 ID，黑名单用 jti 精确定位。
- **黑名单**：登出时把 token 加入黑名单，验签时检查。生产环境用 Redis + TTL 自动清理。
- **expires_in**：返回 access token 的剩余秒数，前端据此定时刷新（如到期前 5 分钟自动刷新）。

## 十一、Token 的安全存储（前端）

后端发 token 容易，前端怎么存才安全？三个选项：

| 存储位置 | XSS 风险 | CSRF 风险 | 推荐度 |
|----------|----------|-----------|--------|
| localStorage | 高（JS 能读） | 无 | 不推荐 |
| sessionStorage | 高 | 无 | 不推荐 |
| HttpOnly Cookie | 低（JS 读不到） | 高（要加 CSRF 防护） | 推荐 |

### 推荐方案：HttpOnly Cookie + Bearer 双管齐下

\`\`\`python filename="demo7_cookie_token.py"
# 把 token 放在 HttpOnly Cookie 里，防 XSS 窃取
from fastapi import FastAPI, Response, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from datetime import datetime, timedelta, timezone

app = FastAPI()

# CORS 配置：必须带 allow_credentials=True，Cookie 才能跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端地址
    allow_credentials=True,                   # 允许带 Cookie
    allow_methods=["*"],
    allow_headers=["*"],
)

# auto_error=False：token 缺失时不自动报错，让我们自己处理
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
SECRET_KEY = "secret"
ALGORITHM = "HS256"

# 自定义依赖：从 Cookie 或 Authorization 头取 token
async def get_token_from_cookie_or_header(
    request: Request,
    token: str = Depends(oauth2_scheme),
) -> str:
    """优先从 Authorization 头取，没有再从 Cookie 取"""
    if token:
        # 优先用 Authorization 头的 token（兼容移动端）
        return token
    # 从 Cookie 取
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        # Cookie 里存的是 "bearer xxx"，去掉前缀
        if cookie_token.startswith("bearer "):
            return cookie_token[7:]
        return cookie_token
    # 都没有，返回 401
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="未登录",
    )

@app.post("/token")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    # 验证用户（略）
    if form_data.username != "alice" or form_data.password != "secret":
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    # 生成 token
    token = jwt.encode(
        {"sub": form_data.username, "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    # 把 token 写进 HttpOnly Cookie
    # httponly=True：JS 读不到，防 XSS 窃取
    #   XSS 攻击者能执行 JS，但读不到 HttpOnly Cookie
    # secure=True：只通过 HTTPS 传输（本地开发可设 False）
    #   生产环境必须 True，否则 token 会被中间人截获
    # samesite="lax"：防 CSRF
    #   lax：跨站 GET 请求带 Cookie，POST 不带（够用）
    #   strict：任何跨站请求都不带（最安全，但影响体验）
    #   none：都带（需要 secure=True，不推荐）
    response.set_cookie(
        key="access_token",
        value=f"bearer {token}",
        httponly=True,
        secure=False,  # 生产环境改 True
        samesite="lax",
    )
    return {"message": "登录成功"}

@app.get("/me")
async def me(token: str = Depends(get_token_from_cookie_or_header)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return {"user": payload["sub"]}

@app.post("/logout")
async def logout(response: Response):
    # 删除 Cookie：设置空值 + 立即过期
    response.delete_cookie("access_token")
    return {"message": "已登出"}
\`\`\`

## 十二、常见错误与避坑指南

1. **密钥泄露**：把 \`SECRET_KEY\` 硬编码到代码里提交到 Git，是灾难。用环境变量 \`os.environ["SECRET_KEY"]\`，或用 \`pydantic-settings\` 从 \`.env\` 读。
2. **算法不指定**：\`jwt.decode\` 必须传 \`algorithms=[...]\`。如果不传，旧版本会默认允许 \`none\` 算法（不验签），是著名漏洞。
3. **Payload 放敏感信息**：JWT Payload 可被任何人 Base64 解码看到，绝不能放密码、密钥、身份证号。
4. **过期时间太长**：access token 设 100 年等于没过期，被盗就一直能用。建议 15 分钟 ~ 2 小时。
5. **没有刷新机制**：access token 太短，用户频繁被踢出登录。加 refresh token 解决。
6. **refresh token 不能撤销**：JWT 天然无状态，refresh token 一旦签发就有效到期。要支持"登出立即失效"，需要服务端维护黑名单（Redis 记录已撤销的 token）。
7. **多服务密钥不一致**：微服务里各服务 SECRET_KEY 必须一致（HS256）或共享公钥（RS256），否则验签失败。
8. **时区问题**：\`exp\` 是 Unix 时间戳，必须用 UTC 时间计算，不要用本地时区。\`datetime.now(timezone.utc)\` 是正确写法。
9. **token 在 URL 里**：不要把 token 放 query string（会进日志、被 Referer 泄露），必须放 \`Authorization\` 头或 Cookie。
10. **access token 和 refresh token 混用**：没有 \`type\` 字段区分，用户能用 refresh token 直接调业务接口。必须加类型检查。
11. **黑名单无限增长**：登出的 token 都进黑名单，但过期后没清理，内存爆炸。生产环境用 Redis + TTL，让黑名单条目自动过期。
12. **签名算法被降级**：服务端用 RS256，但 \`algorithms=["HS256", "RS256"]\` 同时允许 HS256。攻击者可能用公钥当 HS256 密钥伪造 token。只允许你实际使用的算法。
13. **依赖 jwt 库版本差异**：\`pyjwt\` 和 \`python-jose\` API 略有不同（如 \`algorithms\` 参数）。换库时要测试。
14. **JWT 太大**：Payload 放太多自定义字段，token 变成几 KB，每个请求都带，浪费带宽。Payload 只放必要信息（sub, role, exp）。

## 十三、动手实验

### 实验 1：解码 JWT 看内部结构

**目标**：直观理解 JWT 的三段结构。

**步骤**：

1. 运行 Demo 1（\`demo1_jwt_basic.py\`），复制生成的 token。
2. 打开浏览器访问 \`https://jwt.io\`。
3. 把 token 粘贴进去，观察右侧解码出的 Header 和 Payload。
4. 修改 Payload 里的 \`sub\` 字段（如改成 \`admin\`），观察签名验证是否失败（应该失败，因为你没有密钥重新签名）。
5. 在签名验证框输入正确的密钥 \`secret-key-change-me-in-production\`，观察验证是否通过。
6. 思考：为什么修改 Payload 后签名验证失败？这说明 JWT 的什么特性？

### 实验 2：体验 token 过期

**目标**：理解 \`exp\` 的作用。

**步骤**：

1. 修改 Demo 5 的 \`ACCESS_TOKEN_EXPIRE_MINUTES = 0.1\`（6 秒过期，方便测试）。
2. 启动服务，登录拿 token。
3. 立即用 token 访问 \`/me\`，观察成功。
4. 等 7 秒，再用同一个 token 访问 \`/me\`，观察 401 "token 已过期"。
5. 思考：如果不传 \`exp\`，token 会过期吗？（不会，永久有效，这是安全隐患）。

### 实验 3：实现 token 刷新前端逻辑

**目标**：理解 access + refresh 双 token 机制。

**步骤**：

1. 运行 Demo 6（\`demo6_jwt_full_flow.py\`）。
2. 用 curl 登录，记录 \`access_token\`、\`refresh_token\`、\`expires_in\`。
3. 用 access_token 访问 \`/me\`，成功。
4. 调 \`/logout\` 登出 access_token。
5. 再用 access_token 访问 \`/me\`，观察 401 "token 已被撤销"。
6. 用 refresh_token 调 \`/refresh\`，拿到新的 access_token。
7. 用新 access_token 访问 \`/me\`，成功。
8. 思考：为什么登出 access_token 后还能用 refresh_token 刷新？（因为黑名单只存了 access_token，refresh token 仍有效。生产环境登出时应该把 refresh token 也加黑名单。）

### 实验 4：构造一个伪造 token

**目标**：理解 JWT 签名的防伪造原理。

**步骤**：

1. 运行 Demo 5，登录拿一个合法 token。
2. 把 token 粘贴到 jwt.io，修改 \`sub\` 为 \`admin\`。
3. 不输入密钥，直接复制修改后的 token（签名不对）。
4. 用这个伪造 token 访问 \`/me\`：\`curl -H "Authorization: Bearer <伪造 token>" http://127.0.0.1:8000/me\`。
5. 观察返回 401 "无法验证凭据"。
6. 思考：如果攻击者知道了你的 SECRET_KEY，会发生什么？（能伪造任意用户的 token，所以密钥必须保密。）

## 十四、本章小结

- JWT 由 Header、Payload、Signature 三段组成，用 \`.\` 分隔，前两段是 Base64 编码（可解码），第三段是签名。
- JWT 是无状态的：服务端不需要存 token，验签即可拿用户信息，适合多机器部署。
- \`python-jose\` 是 FastAPI 推荐的 JWT 库，\`jwt.encode\` 编码，\`jwt.decode\` 解码验签。
- HS256 用对称密钥（简单），RS256 用公私钥（安全，适合微服务）。
- access token 短期（15 分钟 ~ 2 小时），refresh token 长期（7 天 ~ 30 天），组合实现无感刷新。
- 黑名单机制让 JWT 支持"登出立即失效"，生产环境用 Redis + TTL。
- 前端存储 token 推荐 HttpOnly Cookie，防 XSS。

下一章我们解决最后一个安全短板：密码怎么存。当前 demo 里密码还是明文比对，生产环境必须用 bcrypt 哈希。
`
  },

  // =========================================================
  // 第三章：密码哈希与安全
  // =========================================================
  {
    id: "fa-password-hash",
    group: "认证与安全",
    icon: "🔒",
    title: "密码哈希与安全",
    content: `

# 密码哈希与安全

## 一、为什么密码必须哈希

前两章的 demo 里，用户密码都是明文存的——\`fake_users_db["alice"]["password"] = "secret"\`。这在生产环境是**绝对不行**的。原因有两条：

1. **数据库泄露 = 全员密码泄露**：一旦数据库被脱库（SQL 注入、备份泄露、内鬼），所有用户密码就暴露了。而大量用户在多个网站用同一个密码，一个站泄露等于多个站沦陷。
2. **法律合规**：国内外数据安全法规（如 GDPR、个人信息保护法）都要求密码必须加密存储。明文存密码一旦出事，公司要承担法律责任。

正确做法是**哈希（Hash）**：把密码经过单向函数变成一串乱码，存这串乱码；登录时把用户输入的密码也哈希一下，对比两个哈希值。哈希是单向的，即使拿到哈希值也反推不出原密码。

这一章我们完整讲清楚密码哈希的演进、原理、最佳实践，并在最后实战一个完整的注册+登录+重置密码 API。

## 一·五、生活类比：密码哈希像单程票和绞肉机

**类比一：单程票**

密码哈希就像一张"单程票"——你把密码放进去，出来一串乱码；但你没法从乱码反推回密码。

\`\`\`txt filename="哈希的单向性"
明文密码 "alice123"
        │
        ▼
   ┌─────────┐
   │ 哈希函数 │  ← 单向，不可逆
   └─────────┘
        │
        ▼
哈希值 "$2b$12$N9qo8uLOickgx2Z..."
        │
        ▼  ❌ 想反推？不可能！
明文密码 ???  ← 拿不回来了
\`\`\`

**类比二：绞肉机**

bcrypt 哈希像一台"绞肉机"：

| 绞肉机特点 | bcrypt 对应 | 说明 |
|------------|-------------|------|
| 牛肉进去变成肉馅，肉馅变不回牛肉 | 单向哈希 | 不可逆 |
| 每次绞出的肉馅形状不同（随机刀路） | 随机 salt | 同样密码每次哈希结果不同 |
| 绞肉机很慢（一刀一刀切） | 故意慢（cost factor） | 防暴力破解 |
| 不同绞肉机型号速度不同 | cost 可调 | 硬件升级时调高 cost |
| 肉馅里混着调料（salt） | salt 嵌入哈希 | 不需要单独存 salt |

**类比三：保险箱与钥匙**

- **明文存密码** = 把钱直接放桌上，谁进屋都能拿。
- **MD5 哈希** = 把钱放进普通保险箱，但万能钥匙满大街都有（彩虹表）。
- **加盐 MD5** = 保险箱加了个性化锁，但锁太简单，撬锁很快（GPU 暴力）。
- **bcrypt** = 重型保险箱，锁极复杂，撬一次要 400ms（cost=12），撬 1 亿个密码要 127 年。

**为什么"慢"是好事**：

\`\`\`txt filename="慢哈希的暴力破解成本"
密码：alice123（8 位字母+数字）

MD5 哈希（快，每秒 10 亿次）：
  暴力破解 8 位密码：约 70 亿种组合 → 7 秒搞定

bcrypt 哈希（慢，cost=12，每次 400ms）：
  暴力破解 8 位密码：70 亿种组合 × 0.4 秒 = 28 亿秒 ≈ 89 年
\`\`\`

慢就是安全——对合法用户来说登录多等 0.4 秒无所谓，对攻击者来说 89 年就是绝望。

## 二、密码存储的历史演进

### 阶段 1：明文存储（最差）

\`\`\`txt
db.users.password = "alice123"
\`\`\`

数据库一泄露，密码直接可见。已经被淘汰 20 年了，但偶尔还能在新闻里看到"某网站明文存密码"的丑闻。

### 阶段 2：MD5 哈希（曾经流行，现已不安全）

\`\`\`txt
db.users.password = "5f4dcc3b5aa765d61d8327deb882cf99"  # MD5("password")
\`\`\`

MD5 是单向哈希函数，看似安全，但有三个致命问题：

1. **彩虹表攻击**：MD5 太流行，有人把所有常见密码的 MD5 值预先算好建成表（彩虹表），拿到哈希反查一下就出原密码。
2. **MD5 算法太快**：现代 GPU 每秒能算几十亿次 MD5，暴力破解非常容易。
3. **没有盐**：相同密码哈希值相同，攻击者一看哈希值就知道哪些用户用了同一个密码。

### 阶段 3：加盐 MD5 / SHA（仍不够）

\`\`\`txt
db.users.password = MD5(salt + "alice123")
db.users.salt = "随机字符串"
\`\`\`

加 salt 解决了"相同密码哈希相同"的问题，但 MD5/SHA 算得太快，暴力破解仍然可行。**任何设计为"快速"的哈希函数都不适合存密码**。

### 阶段 4：bcrypt / argon2 / scrypt（现代标准）

\`\`\`txt
db.users.password = "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
\`\`\`

这些算法专门为密码存储设计，特点：

- **故意慢**：每次计算耗时几百毫秒，暴力破解成本极高。
- **内置 salt**：salt 嵌入哈希结果，不需要单独存。
- **可调 cost factor**：硬件变快时，调高 cost factor 保持慢速。

**当前推荐**：bcrypt（最成熟，本章主讲）、argon2（更新更安全，但依赖复杂）、scrypt。

## 三、bcrypt 哈希原理

bcrypt 的哈希结果长这样：

\`\`\`txt
$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
\`\`\`

拆开看：

\`\`\`txt
$2b$      $12$        N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
算法      cost        salt（22 字符） + 哈希值（31 字符）
\`\`\`

- **算法标识**：\`$2b$\` 表示 bcrypt 算法版本（还有 \`$2a$\`、\`$2y$\`，区别是历史遗留 bug 处理方式）。
- **cost factor**：\`12\` 表示 2^12 = 4096 轮迭代。cost 越高越慢越安全，每加 1 翻倍。
- **salt + 哈希**：salt 和哈希结果编码在同一串里，验证时自动取出。

**为什么 cost factor 重要**：cost=10 大约 100ms，cost=12 大约 400ms，cost=14 大约 1.6s。硬件升级后，把 cost 调高，老哈希也跟着变慢。bcrypt 验证时会读哈希里的 cost，所以**即使你后来调高了全局 cost，老哈希仍按老 cost 验证**——这就是为什么 bcrypt 把 cost 嵌入哈希里。

## 四、passlib vs 直接用 bcrypt 库

Python 里 bcrypt 哈希有两种用法：

| 方案 | 安装 | 优点 | 缺点 |
|------|------|------|------|
| 直接用 \`bcrypt\` 库 | \`pip install bcrypt\` | 直接、底层 | API 略繁琐 |
| 用 \`passlib\` | \`pip install "passlib[bcrypt]"\` | API 简洁、可切换算法 | 多一层依赖 |

FastAPI 官方教程用 \`passlib\`，本章也用它。但要注意：**passlib 1.7.x 不支持 bcrypt 4.x**，安装时要锁版本：

\`\`\`bash filename="安装依赖"
# 推荐：passlib 1.7 + bcrypt 4.x 兼容方案
pip install "passlib[bcrypt]" "bcrypt>=4.0.0"
# 如果遇到 bcrypt 版本冲突，降级 bcrypt
pip install "bcrypt<4.0.0"
\`\`\`

## 五、passlib 基础用法

### Demo 1：哈希密码和验证密码

\`\`\`python filename="demo1_passlib_basic.py"
# 演示 passlib 的基础用法
# 从 passlib.context 导入 CryptContext
# CryptContext 是密码哈希的上下文，支持多算法切换
from passlib.context import CryptContext

# 创建 CryptContext 实例
# CryptContext 是密码哈希的"上下文"，封装了多算法切换
# schemes: 支持的算法列表，这里只用 bcrypt
#   可以配多个：schemes=["bcrypt", "argon2"]，方便迁移
# deprecated: 标记哪些算法已废弃（用于自动迁移）
#   "auto" 表示 schemes 里除第一个外的都标记为废弃
#   废弃算法能 verify 但不会用于新 hash
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- 哈希密码 ----------

# 原始密码（用户注册时输入的）
plain_password = "my-secret-123"

# 调用 hash 方法生成哈希
# 注意：每次调用 hash 结果都不同！因为 bcrypt 每次用随机 salt
hashed_1 = pwd_context.hash(plain_password)
hashed_2 = pwd_context.hash(plain_password)
print("哈希 1：", hashed_1)
print("哈希 2：", hashed_2)
# 两个哈希值不同，但都能验证同一个密码

# ---------- 验证密码 ----------

# 调用 verify 方法验证
# 参数：用户输入的明文密码、数据库存的哈希
# 返回 bool
print("正确密码验证：", pwd_context.verify(plain_password, hashed_1))  # True
print("错误密码验证：", pwd_context.verify("wrong", hashed_1))         # False

# ---------- 验证两个不同哈希 ----------

# 即使 hash 结果不同，verify 都能识别
print("用 hashed_2 验证：", pwd_context.verify(plain_password, hashed_2))  # True

# 关键认知：
# 1. 同一密码每次 hash 出来都不同（因为 salt 随机）
# 2. 但 verify 都能正确识别
# 3. 所以不要用 "==" 比较 hash，必须用 verify
\`\`\`

**重要**：很多人误以为"两次哈希结果不同就是 bug"，其实不是。bcrypt 每次 hash 用随机 salt，结果必然不同。验证时 passlib 会从哈希里提取 salt 和 cost，正确计算后比对。

## 六、不要用 == 比较哈希

新手最容易犯的错：

\`\`\`python filename="demo2_wrong_compare.py"
# ❌ 错误：用 == 比较哈希
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 用户注册时哈希
stored_hash = pwd_context.hash("my-password")
# 假设存进数据库

# 用户登录时再哈希一次
input_hash = pwd_context.hash("my-password")

# ❌ 错误比较：因为 salt 随机，两次 hash 必然不同
if input_hash == stored_hash:
    print("登录成功")  # 永远不会执行！
else:
    print("登录失败")  # 总是这里

# ✅ 正确：用 verify
if pwd_context.verify("my-password", stored_hash):
    print("登录成功")  # 正确执行
\`\`\`

记住：**永远用 \`verify\`，永远不要用 \`==\` 比较密码哈希**。

## 七、密码强度校验

哈希只是防"泄露后破解"，密码本身太弱（如 123456）还是会被暴力破解。注册时应该校验密码强度。

### Demo 2：密码强度校验器

\`\`\`python filename="demo3_password_strength.py"
# 密码强度校验
import re
from fastapi import HTTPException, status

def validate_password_strength(password: str) -> None:
    """
    校验密码强度
    校验失败抛 HTTPException
    """
    # 规则 1：长度至少 8
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码至少 8 位",
        )
    # 规则 2：长度最多 128（防 DoS，bcrypt 有 72 字节限制）
    if len(password) > 128:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码不能超过 128 位",
        )
    # 规则 3：至少包含一个字母
    if not re.search(r"[a-zA-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码必须包含字母",
        )
    # 规则 4：至少包含一个数字
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码必须包含数字",
        )
    # 规则 5：禁止常见弱密码
    weak_passwords = {
        "password", "12345678", "qwerty123",
        "abc12345", "iloveyou1", "admin123",
    }
    if password.lower() in weak_passwords:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码太常见，请换一个",
        )

# 测试
# if __name__ == "__main__" 确保只在直接运行时执行，被导入时不执行
if __name__ == "__main__":
    # 测试用例 1：密码太短（少于 8 位）
    try:
        validate_password_strength("123")  # 太短
    except HTTPException as e:
        print(e.detail)  # 密码至少 8 位
    # 测试用例 2：密码没数字（只有字母）
    try:
        validate_password_strength("abcdefgh")  # 没数字
    except HTTPException as e:
        print(e.detail)  # 密码必须包含数字
    # 测试用例 3：常见弱密码（在黑名单里）
    try:
        validate_password_strength("password1")  # 常见弱密码
    except HTTPException as e:
        print(e.detail)  # 密码太常见，请换一个
    # 测试用例 4：合法密码（长度够、有字母有数字、不在黑名单）
    # 不抛异常就是通过
    validate_password_strength("MyStr0ngP@ss")
    print("密码强度 OK")
\`\`\`

**关于 bcrypt 72 字节限制**：bcrypt 算法只处理密码的前 72 字节，超过部分被忽略。所以"超长密码"不会更安全。如果业务要求超长密码支持，可以先 SHA-256 一次再 bcrypt（但这是另一个话题，本章不展开）。

## 八、密码重置流程

用户忘记密码是常见场景。完整流程：

\`\`\`txt
1. 用户提交邮箱到 /password/forgot
2. 服务端生成一次性 reset token（JWT，5 分钟过期）
3. 服务端发邮件，链接形如 https://app.com/reset?token=xxx
4. 用户点击链接，前端拿 token 调 /password/reset
5. 服务端验证 token，更新密码哈希
\`\`\`

### Demo 3：密码重置 API

\`\`\`python filename="demo4_password_reset.py"
# 完整的密码重置流程
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError
import secrets

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "secret-key"
ALGORITHM = "HS256"

# ---------- 数据模型 ----------
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ---------- 假数据库 ----------
fake_users_db = {
    "alice": {
        "username": "alice",
        "email": "alice@example.com",
        "hashed_password": pwd_context.hash("old-password"),
    },
}

# 邮箱 -> 用户名的索引，方便按邮箱查用户
email_index = {u["email"]: username for username, u in fake_users_db.items()}

# 已使用的 reset token 黑名单（防重放）
used_reset_tokens: set[str] = set()

# ---------- 工具函数 ----------

def create_reset_token(email: str) -> str:
    """生成密码重置 token（JWT，5 分钟过期）"""
    payload = {
        "sub": email,
        "type": "reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        # 随机 jti 防重放
        "jti": secrets.token_hex(8),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def send_reset_email(to_email: str, token: str) -> None:
    """模拟发邮件（真实场景用 SMTP 或邮件服务）"""
    reset_link = f"https://app.com/reset?token={token}"
    print(f"[模拟邮件] 发送到 {to_email}")
    print(f"[模拟邮件] 点击重置：{reset_link}")

# ---------- 路由 ----------

@app.post("/password/forgot")
async def forgot_password(req: ForgotPasswordRequest):
    """发起密码重置"""
    # 查用户
    username = email_index.get(req.email)
    # 安全考虑：即使用户不存在也返回相同响应
    # 否则攻击者能通过响应枚举出哪些邮箱注册了
    if username:
        # 生成 reset token
        token = create_reset_token(req.email)
        # 发邮件
        send_reset_email(req.email, token)
    # 统一返回"已发送"
    return {"message": "如果该邮箱已注册，重置链接已发送"}

@app.post("/password/reset")
async def reset_password(req: ResetPasswordRequest):
    """执行密码重置"""
    # 检查 token 是否已被使用过
    # used_reset_tokens 是黑名单集合，用过的 token 进黑名单
    # 防止重放攻击：攻击者截获 token 后反复重置密码
    if req.token in used_reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该重置链接已使用，请重新申请",
        )
    try:
        # 解码 token
        # jwt.decode 自动验签 + 检查 exp
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="重置链接已过期，请重新申请",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的重置链接",
        )
    # 检查类型：必须是 reset token，不能用 access token 来重置密码
    if payload.get("type") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="token 类型错误",
        )
    # 取邮箱，查用户
    # sub 存的是邮箱（创建 reset token 时写入的）
    email = payload["sub"]
    username = email_index.get(email)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户不存在",
        )
    # 校验新密码强度（用前面的 validate_password_strength，略）
    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码至少 8 位",
        )
    # 更新密码哈希
    # pwd_context.hash 自动加 salt + bcrypt 计算
    fake_users_db[username]["hashed_password"] = pwd_context.hash(req.new_password)
    # token 加入黑名单，防止重放
    # 即使 token 还没过期，用过的也不能再用
    used_reset_tokens.add(req.token)
    return {"message": "密码已重置，请用新密码登录"}

# 测试流程：
# 1. POST /password/forgot {"email":"alice@example.com"}
#    控制台打印出模拟邮件，里面有 token
# 2. POST /password/reset {"token":"<拿到的 token>","new_password":"newpass123"}
# 3. 用 newpass123 登录
\`\`\`

**关键设计点**：

- reset token 用 JWT，自带过期时间，不需要服务端存。
- jti（JWT ID）+ 黑名单防重放：用过的 token 进黑名单，即使没过期也不能再用。
- /password/forgot 不管邮箱是否存在都返回同样响应，防止枚举攻击。

## 九、哈希算法升级与迁移

bcrypt 的 cost factor 不是一成不变的。硬件升级后，老的 cost=10 不够安全，想升到 cost=14。但已有用户的哈希都是 cost=10 的，怎么办？

### Demo 4：哈希算法无缝迁移

\`\`\`python filename="demo5_hash_migration.py"
# 演示哈希算法迁移
from passlib.context import CryptContext

# 关键：用 CryptContext 的 deprecated 参数
# schemes 里的算法是"当前使用的"
# deprecated 里的算法"已废弃但能验证"
pwd_context = CryptContext(
    schemes=["bcrypt"],         # 当前用 bcrypt
    deprecated="auto",          # 自动标记老算法
    bcrypt__rounds=12,          # 新哈希用 cost=12
)

# 假设老数据库里有 cost=10 的哈希
old_hash = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

# 用户登录时
def verify_and_upgrade(password: str, stored_hash: str) -> bool:
    """验证密码，如果通过且哈希需要升级，自动重新哈希"""
    # 验证密码
    if not pwd_context.verify(password, stored_hash):
        return False
    # 检查哈希是否需要升级
    # needs_update 返回 True 表示哈希用了 deprecated 算法或 cost 太低
    if pwd_context.needs_update(stored_hash):
        # 用新算法重新哈希
        new_hash = pwd_context.hash(password)
        print(f"哈希已升级：{stored_hash[:20]}... -> {new_hash[:20]}...")
        # 实际场景：UPDATE users SET password = new_hash WHERE id = ...
    return True

# 测试
# 假设 old_hash 是 "old-password" 的 cost=10 哈希
# （这里 old_hash 是假的，实际 verify 会返回 False）
verify_and_upgrade("old-password", old_hash)
\`\`\`

**迁移策略**：用户下次登录时，验证成功后检查 \`needs_update\`，如果需要升级就重新哈希并更新数据库。这样不需要一次性重算所有用户密码（也不可能，因为我们没有原密码）。

## 十、实战：用户注册 + 登录 + 密码重置完整 API

把前面所有片段合起来，做一个能跑的完整 API：

### Demo 5：完整密码安全系统

\`\`\`python filename="demo6_full_password_system.py"
# 完整的注册 + 登录 + 密码重置 API
# 运行：uvicorn demo6_full_password_system:app --reload

import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError

app = FastAPI(title="密码安全完整示例")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 配置 ----------
SECRET_KEY = "secret-key-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
RESET_TOKEN_EXPIRE_MINUTES = 5

# 创建密码上下文，bcrypt，cost=12
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

# ---------- 数据模型 ----------
class User(BaseModel):
    username: str
    email: EmailStr
    disabled: bool = False

class UserInDB(User):
    hashed_password: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ---------- 假数据库 ----------
fake_users_db: dict[str, UserInDB] = {}
email_index: dict[str, str] = {}
used_reset_tokens: set[str] = set()

# ---------- 工具函数 ----------

def validate_password_strength(password: str) -> None:
    """密码强度校验"""
    if len(password) < 8:
        raise HTTPException(400, "密码至少 8 位")
    if len(password) > 128:
        raise HTTPException(400, "密码不能超过 128 位")
    if not re.search(r"[a-zA-Z]", password):
        raise HTTPException(400, "密码必须包含字母")
    if not re.search(r"\d", password):
        raise HTTPException(400, "密码必须包含数字")

def create_access_token(data: dict) -> str:
    """生成 access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_reset_token(email: str) -> str:
    """生成 reset token"""
    payload = {
        "sub": email,
        "type": "reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
        "jti": secrets.token_hex(8),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 token 还原当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None or payload.get("type") != "access":
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(401, "token 已过期")
    except JWTError:
        raise credentials_exception
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return User(**user.model_dump(exclude={"hashed_password"}))

# ---------- 路由 ----------

@app.post("/register", response_model=User)
async def register(req: RegisterRequest):
    """注册"""
    # 检查用户名是否已存在
    if req.username in fake_users_db:
        raise HTTPException(400, "用户名已存在")
    # 检查邮箱是否已注册
    # email_index 是 邮箱->用户名 的反向索引，方便按邮箱查
    if req.email in email_index:
        raise HTTPException(400, "邮箱已注册")
    # 校验密码强度（长度、字母+数字、禁用弱密码）
    validate_password_strength(req.password)
    # 哈希密码：pwd_context.hash 自动加 salt + bcrypt 计算
    # 每次 hash 结果不同（salt 随机），但 verify 都能识别
    hashed = pwd_context.hash(req.password)
    # 创建用户：UserInDB 是入库模型，包含 hashed_password
    user = UserInDB(
        username=req.username,
        email=req.email,
        disabled=False,  # 新用户默认激活
        hashed_password=hashed,
    )
    # 存入用户表
    fake_users_db[req.username] = user
    # 维护邮箱索引（方便按邮箱查用户）
    email_index[req.email] = req.username
    # 返回 User（不含 hashed_password），防止密码泄露
    return User(**user.model_dump(exclude={"hashed_password"}))

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """登录"""
    # 查用户（支持用户名或邮箱登录）
    # email_index.get(form_data.username, form_data.username)：
    #   先按邮箱查用户名，查不到就当用户名用
    #   这样用户输入邮箱或用户名都能登录
    username = email_index.get(form_data.username, form_data.username)
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(401, "用户名或密码错误")
    # 验证密码（用 verify，不是 ==）
    # verify(明文, 哈希)：内部从哈希提取 salt + cost，重新计算后比对
    if not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    # 检查账号是否激活
    if user.disabled:
        raise HTTPException(400, "账号已被禁用")
    # 哈希需要升级时自动升级
    # needs_update 检查哈希是否用了老算法或低 cost（如 cost=10 想升到 12）
    # 登录时用户输了原密码，正好可以重新哈希（其他时候拿不到原密码）
    if pwd_context.needs_update(user.hashed_password):
        user.hashed_password = pwd_context.hash(form_data.password)
    # 颁发 token
    # sub 是 JWT 标准声明，存用户名，get_current_user 用它反查用户
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/password/forgot")
async def forgot_password(req: ForgotPasswordRequest):
    """发起密码重置"""
    username = email_index.get(req.email)
    if username:
        token = create_reset_token(req.email)
        # 真实场景发邮件，这里打印
        print(f"[重置链接] https://app.com/reset?token={token}")
    return {"message": "如果该邮箱已注册，重置链接已发送"}

@app.post("/password/reset")
async def reset_password(req: ResetPasswordRequest):
    """执行密码重置"""
    if req.token in used_reset_tokens:
        raise HTTPException(400, "该重置链接已使用")
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(400, "重置链接已过期")
    except JWTError:
        raise HTTPException(400, "无效的重置链接")
    if payload.get("type") != "reset":
        raise HTTPException(400, "token 类型错误")
    email = payload["sub"]
    username = email_index.get(email)
    if username is None:
        raise HTTPException(400, "用户不存在")
    validate_password_strength(req.new_password)
    fake_users_db[username].hashed_password = pwd_context.hash(req.new_password)
    used_reset_tokens.add(req.token)
    return {"message": "密码已重置"}

@app.get("/me", response_model=User)
async def read_me(current_user: User = Depends(get_current_user)):
    """获取当前用户"""
    return current_user

@app.post("/password/change")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
):
    """已登录用户修改密码"""
    user = fake_users_db[current_user.username]
    if not pwd_context.verify(old_password, user.hashed_password):
        raise HTTPException(400, "原密码错误")
    validate_password_strength(new_password)
    user.hashed_password = pwd_context.hash(new_password)
    return {"message": "密码已修改"}

# 完整测试流程：
# 1. 注册：POST /register {"username":"alice","email":"a@e.com","password":"Strong1pass"}
# 2. 登录：POST /token -d "username=alice&password=Strong1pass"
# 3. 访问 /me：GET /me -H "Authorization: Bearer <jwt>"
# 4. 忘记密码：POST /password/forgot {"email":"a@e.com"}
#    控制台看到重置链接
# 5. 重置密码：POST /password/reset {"token":"<链接里的>","new_password":"NewPass123"}
# 6. 用新密码登录
# 7. 登录后改密码：POST /password/change?old_password=NewPass123&new_password=Another456
\`\`\`

## 十·一、bcrypt 哈希结构可视化与 salt 解析

理解 bcrypt 哈希字符串的内部结构，对排查问题很有帮助。

### Demo 7：解析 bcrypt 哈希，观察 salt 和 cost

\`\`\`python filename="demo7_bcrypt_anatomy.py"
# 解析 bcrypt 哈希字符串的内部结构
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 生成一个哈希
password = "my-password"
hashed = pwd_context.hash(password)
print(f"原始密码：{password}")
print(f"bcrypt 哈希：{hashed}")
print()

# bcrypt 哈希结构：$2b$12$<22字符salt><31字符哈希值>
# 用 $ 分隔
parts = hashed.split("$")
print("=== bcrypt 哈希结构解析 ===")
print(f"第 1 段（空）：'{parts[0]}'")
print(f"第 2 段（算法版本）：'{parts[1]}'")  # 2b
print(f"第 3 段（cost factor）：'{parts[3]}'")  # 12 → 2^12=4096 轮迭代
print(f"第 4 段（salt+哈希）：'{parts[3]}'")
print(f"  - 前 22 字符（salt）：'{parts[3][:22]}'")
print(f"  - 后 31 字符（哈希值）：'{parts[3][22:]}'")
print()

# 演示 salt 的随机性
print("=== 同一密码哈希 3 次，观察 salt 变化 ===")
for i in range(3):
    h = pwd_context.hash(password)
    salt = h.split("$")[3][:22]
    print(f"第 {i+1} 次：salt={salt}, 全哈希={h[:30]}...")
print()
print("结论：salt 每次不同，所以哈希结果不同。")
print("      但 verify 时 passlib 会从哈希里提取 salt，重新计算后比对。")
print()

# 演示 cost factor 对性能的影响
import time
print("=== cost factor 对耗时的影响 ===")
for cost in [10, 12, 14]:
    # 创建指定 cost 的 CryptContext
    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=cost)
    # 计时
    start = time.time()
    h = ctx.hash("test-password")
    elapsed = time.time() - start
    print(f"cost={cost}：耗时 {elapsed*1000:.0f}ms（2^{cost}={2**cost} 轮）")

# 输出类似：
# cost=10：耗时 ~100ms（2^10=1024 轮）
# cost=12：耗时 ~400ms（2^12=4096 轮）
# cost=14：耗时 ~1600ms（2^14=16384 轮）
\`\`\`

**关键认知**：

- cost 每加 1，耗时翻倍。所以从 12 升到 14，耗时从 400ms 变成 1.6s。
- 选 cost 的原则：用户体验能接受的上限。一般 100ms~500ms 为佳，对应 cost 10~12。
- 硬件升级后调高 cost，老哈希通过 \`needs_update\` 自动迁移（详见 Demo 4）。

## 十·二、passlib + bcrypt 完整安全配置 Demo

把密码哈希集成到 FastAPI 注册和登录里，做一个完整的密码安全模块。

### Demo 8：FastAPI 注册登录完整密码安全模块

\`\`\`python filename="demo8_passlib_fastapi.py"
# passlib + bcrypt + FastAPI 完整密码安全模块
# 运行：uvicorn demo8_passlib_fastapi:app --reload

import re
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError

app = FastAPI(title="密码安全模块示例")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 配置 ----------
SECRET_KEY = "secret-key-change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 密码上下文配置
# schemes=["bcrypt"]：只用 bcrypt
# deprecated="auto"：自动标记老算法为废弃（用于迁移）
# bcrypt__rounds=12：cost=12，约 400ms
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

# ---------- 数据模型 ----------
class User(BaseModel):
    """用户响应模型（不含密码）"""
    username: str
    email: EmailStr
    disabled: bool = False

class UserInDB(User):
    """入库模型（含哈希密码）"""
    hashed_password: str

class RegisterRequest(BaseModel):
    """注册请求"""
    username: str
    email: EmailStr
    password: str

class Token(BaseModel):
    """登录响应"""
    access_token: str
    token_type: str
    expires_in: int  # 剩余秒数

# ---------- 假数据库 ----------
fake_users_db: dict[str, UserInDB] = {}

# ---------- 工具函数 ----------

def validate_password_strength(password: str) -> None:
    """密码强度校验
    规则：
    1. 长度 8-128
    2. 至少一个字母 + 一个数字
    3. 不在弱密码黑名单
    """
    if len(password) < 8:
        raise HTTPException(400, "密码至少 8 位")
    if len(password) > 128:
        raise HTTPException(400, "密码不能超过 128 位")
    if not re.search(r"[a-zA-Z]", password):
        raise HTTPException(400, "密码必须包含字母")
    if not re.search(r"\d", password):
        raise HTTPException(400, "密码必须包含数字")
    # 弱密码黑名单
    weak_passwords = {"password123", "12345678", "qwerty123", "admin123"}
    if password.lower() in weak_passwords:
        raise HTTPException(400, "密码太常见，请换一个")

def hash_password(password: str) -> str:
    """哈希密码（注册时用）
    pwd_context.hash 内部做了：
    1. 生成随机 salt（22 字符）
    2. 用 salt + cost=12 做 bcrypt 计算
    3. 拼成 $2b$12$<salt><hash> 格式返回
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码（登录时用）
    pwd_context.verify 内部做了：
    1. 从 hashed_password 提取 salt 和 cost
    2. 用同样的 salt + cost 对 plain_password 做 bcrypt 计算
    3. 比对计算结果和 hashed_password 末尾的哈希值
    返回 True/False
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """生成 JWT"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 token 还原用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 解码 JWT，自动验签 + 检查 exp
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None or payload.get("type") != "access":
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(401, "token 已过期")
    except JWTError:
        raise credentials_exception
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    # 返回 User（不含 hashed_password），防止密码泄露
    return User(**user.model_dump(exclude={"hashed_password"}))

# ---------- 路由 ----------
@app.post("/register", response_model=User)
async def register(req: RegisterRequest):
    """注册：哈希密码后存库"""
    if req.username in fake_users_db:
        raise HTTPException(400, "用户名已存在")
    # 校验密码强度
    validate_password_strength(req.password)
    # 哈希密码（关键步骤）
    hashed = hash_password(req.password)
    user = UserInDB(
        username=req.username,
        email=req.email,
        disabled=False,
        hashed_password=hashed,
    )
    fake_users_db[req.username] = user
    return User(**user.model_dump(exclude={"hashed_password"}))

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """登录：验证密码后颁发 token"""
    user = fake_users_db.get(form_data.username)
    if user is None:
        raise HTTPException(401, "用户名或密码错误")
    # 验证密码（关键步骤：用 verify 而不是 ==）
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    if user.disabled:
        raise HTTPException(400, "账号已被禁用")
    # 哈希需要升级时自动升级
    if pwd_context.needs_update(user.hashed_password):
        user.hashed_password = hash_password(form_data.password)
    access_token = create_access_token({"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }

@app.get("/me", response_model=User)
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user

# 测试流程：
# 1. 注册：POST /register {"username":"alice","email":"a@e.com","password":"Strong1pass"}
# 2. 登录：POST /token -d "username=alice&password=Strong1pass"
# 3. 访问 /me：GET /me -H "Authorization: Bearer <jwt>"
\`\`\`

**模块化设计要点**：

- \`hash_password\` 和 \`verify_password\` 封装成独立函数，方便复用和测试。
- 密码强度校验 \`validate_password_strength\` 独立成函数，注册和重置密码都能用。
- 哈希升级 \`needs_update\` 检查放在登录时，因为只有登录时才有原密码。

## 十一、密码安全最佳实践清单

1. **永远哈希存储**：bcrypt / argon2 / scrypt，绝不明文、MD5、SHA。
2. **永远用 verify 比对**：不要用 \`==\` 比较密码哈希。
3. **cost factor 至少 12**：现代硬件建议 12~14，定期评估调高。
4. **校验密码强度**：长度 8+、字母+数字、禁用常见弱密码。
5. **登录错误信息要模糊**：不要区分"用户不存在"和"密码错误"。
6. **登录限流**：同一 IP/账号 5 次失败后冷却 5 分钟，防暴力破解。
7. **密码重置用一次性 token**：JWT + 短过期 + 黑名单。
8. **支持密码迁移**：用 \`needs_update\` 在登录时自动升级老哈希。
9. **不要限死密码字符集**：允许任何 Unicode，包括空格、表情。
10. **不要在前端哈希**：HTTPS 已经保证传输安全，前端哈希反而给人"可以不传输原密码"的错误安全感。

## 十二、常见错误与避坑指南

1. **bcrypt 版本冲突**：\`passlib\` 1.7.x 与 \`bcrypt\` 4.x 不兼容，会报 \`AttributeError: module 'bcrypt' has no attribute '__about__'\`。降级 bcrypt 到 3.x 或锁 passlib 版本。
2. **密码含中文报错**：bcrypt 要求密码是 bytes，中文要先编码。passlib 自动处理，但如果直接调 \`bcrypt\` 库要 \`password.encode("utf-8")\`。
3. **密码超过 72 字节被截断**：bcrypt 只取前 72 字节。\`"a" * 100\` 和 \`"a" * 80\` 的哈希验证都通过。如果业务需要超长密码，先 SHA-256 再 bcrypt。
4. **哈希存数据库字段太短**：bcrypt 哈希 60 字符，数据库字段至少 \`VARCHAR(72)\`，建议 \`VARCHAR(255)\` 留余量。
5. **reset token 不过期**：忘记给 reset JWT 加 \`exp\`，token 永久有效，是安全隐患。
6. **reset token 能重放**：用过的 token 没进黑名单，攻击者截获后能反复重置。
7. **登录失败次数不限**：没有限流，暴力破解。\`slowapi\` 库可以做 FastAPI 限流。
8. **改密码后旧 token 还有效**：JWT 无状态，改密码不会让旧 token 失效。要支持"改密码立即踢下线"，需要维护 token 黑名单或 token 版本号。
9. **用 == 比较哈希**：因为 salt 随机，两次 hash 结果必然不同，永远返回 False。必须用 \`verify\`。
10. **cost 设太高**：cost=20 单次哈希要 100 秒，登录卡死。一般 cost=10~14，对应 100ms~1.6s。
11. **明文密码进日志**：\`print(form_data.password)\` 把密码打到日志里，泄露。日志里绝不能出现密码字段。
12. **改密码后没让旧 token 失效**：用户改了密码，但旧 token 还能用。需要 token 版本号机制：用户表加 \`token_version\` 字段，JWT 里写 \`ver\`，验签时比对。

## 十三、动手实验

### 实验 1：观察 bcrypt 哈希的随机性

**目标**：理解 salt 的作用。

**步骤**：

1. 运行 Demo 1（\`demo1_passlib_basic.py\`），观察同一密码的两次哈希结果。
2. 确认两次结果不同（因为 salt 随机）。
3. 用 \`pwd_context.verify\` 验证两个不同哈希都能识别同一密码。
4. 思考：如果两个用户用了同一个密码，数据库里的哈希值相同吗？（不同，因为 salt 不同。这是 bcrypt 的安全特性。）

### 实验 2：体验 cost factor 对性能的影响

**目标**：理解"慢哈希"的防暴力破解原理。

**步骤**：

1. 运行 Demo 7（\`demo7_bcrypt_anatomy.py\`），观察 cost=10/12/14 的耗时。
2. 思考：cost=10 是 100ms，cost=14 是 1.6s。对用户来说多等 1.5 秒能接受吗？
3. 对攻击者来说：cost=10 暴力破解 8 位密码要 22 年，cost=14 要 350 年。差多少倍？
4. 把 \`bcrypt__rounds\` 改成 20，观察耗时（约 100 秒）。思考：为什么不能无限调高？

### 实验 3：完整密码重置流程

**目标**：跑通注册 → 忘记密码 → 重置 → 登录的全流程。

**步骤**：

1. 运行 Demo 5（\`demo6_full_password_system.py\`）。
2. 注册用户 alice，密码 Strong1pass。
3. 调 \`POST /password/forgot\`，控制台看到重置链接。
4. 复制链接里的 token，调 \`POST /password/reset\` 改成 NewPass123。
5. 用 NewPass123 登录，成功。
6. 再用原密码 Strong1pass 登录，失败。
7. 思考：为什么用过的 reset token 不能再用？（防重放攻击，用 jti + 黑名单实现。）

### 实验 4：测试密码强度校验

**目标**：理解密码强度规则。

**步骤**：

1. 基于 Demo 5，尝试注册以下密码，观察哪些被拒：
   - \`123\`（太短）
   - \`abcdefgh\`（没数字）
   - \`password1\`（在弱密码黑名单）
   - \`Strong1pass\`（合法）
2. 思考：为什么不允许纯数字密码？（容易被生日、手机号暴力破解。）
3. 扩展 \`validate_password_strength\`，加规则"必须包含特殊字符"，测试效果。

## 十四、本章小结

- 密码必须哈希存储，bcrypt / argon2 / scrypt 是现代标准，MD5/SHA 不适合。
- bcrypt 内置 salt 和 cost factor，哈希结果每次不同，必须用 \`verify\` 比对。
- passlib 是 FastAPI 推荐的密码哈希库，API 简洁，支持算法迁移。
- 密码强度校验：长度 8+、字母+数字、禁用常见弱密码。
- 密码重置：JWT reset token + 短过期 + 黑名单防重放。
- 哈希升级：用 \`needs_update\` 在登录时无缝迁移。
- 完整流程：注册 → 登录 → 改密 → 忘记密码 → 重置，全部走哈希 + JWT。

下一章我们解决最后一个问题：用户登录后，怎么控制他**能做什么**——这就是 RBAC（基于角色的访问控制）。
`
  },

  // =========================================================
  // 第四章：权限控制与 RBAC
  // =========================================================
  {
    id: "fa-rbac",
    group: "认证与安全",
    icon: "👥",
    title: "权限控制与 RBAC",
    content: `

# 权限控制与 RBAC

## 一、认证 vs 授权：再强调一次

前三章解决的是"认证"（Authentication）：知道调用接口的人是 alice 还是 bob。但真实业务里，光知道是谁还不够，还要判断**他能不能做这件事**。这就是"授权"（Authorization）。

举个具体例子：用户 alice 登录后调 \`DELETE /articles/123\`，服务端要做两件事：

1. **认证**：token 有效，是 alice。
2. **授权**：alice 是不是这篇文章的作者？或者 alice 是不是管理员？

第 2 步就是本章的主题。本章我们学 **RBAC（Role-Based Access Control，基于角色的访问控制）**——业界最主流的授权模型。

## 生活类比：RBAC 像公司组织架构

\`\`\`txt filename="把 RBAC 想象成一家公司"
┌─────────────────────────────────────────────────────┐
│  公司（FastAPI 应用）                                 │
│                                                       │
│  员工（User）──→ 职位（Role）──→ 权限（Permission）    │
│                                                       │
│  张三 ──→ 部门经理 ──→ [审批报销, 查看报表, 请假]       │
│  李四 ──→ 普通员工 ──→ [请假]                          │
│  王五 ──→ 财务总监 ──→ [审批报销, 查看报表, 发工资]     │
│  赵六 ──→ 管理员   ──→ [* 全部权限]                    │
│                                                       │
│  核心思想：不直接给员工分配权限，而是通过"职位"间接授权   │
│  好处：员工换岗位只需改 Role，不用逐条改 Permission     │
└─────────────────────────────────────────────────────┘
\`\`\`

- **用户（User）**：张三、李四——对应系统里的 alice、bob。
- **角色（Role）**：部门经理、普通员工——对应 admin、user、editor。
- **权限（Permission）**：审批报销、查看报表——对应 \`article:write\`、\`article:delete\`。
- **分配关系**：张三是部门经理 → 张三自动拥有部门经理的所有权限。
- **好处**：李四升职了，只需把他的 Role 从"普通员工"改成"部门经理"，权限自动跟着变，不用一条条改。

这比"直接给每个用户分配每条权限"灵活太多了。想象一家 1000 人的公司，如果逐人分配权限，HR 要疯；但如果有角色，只需要维护几个角色，新人入职选个角色就行。

## 二、为什么需要授权模型

### 2.1 朴素方案：if-else 硬编码

最直觉的写法是在每个接口里写 if-else：

\`\`\`python filename="demo0_naive_auth.py"
"""朴素方案：每个接口里硬编码权限检查——千万别这么做！"""

from fastapi import FastAPI, HTTPException

app = FastAPI()

# 模拟当前用户（实际从 token 解析）
current_user = {"username": "alice", "role": "user"}

@app.delete("/articles/{article_id}")
async def delete_article(article_id: int):
    """删除文章接口"""
    # ❌ 硬编码：admin 才能删
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员能删除")
    return {"msg": f"文章 {article_id} 已删除"}

@app.post("/articles/")
async def create_article():
    """创建文章接口"""
    # ❌ 又写一遍：user 和 editor 都能创建
    if current_user["role"] not in ("admin", "editor", "user"):
        raise HTTPException(status_code=403, detail="无权创建")
    return {"msg": "文章已创建"}

@app.get("/finance/report")
async def finance_report():
    """财务报表接口"""
    # ❌ 再写一遍：只有 admin 和 finance 能看
    if current_user["role"] not in ("admin", "finance"):
        raise HTTPException(status_code=403, detail="无权查看财务")
    return {"data": "财务报表数据"}
\`\`\`

**问题**：

1. **重复代码**：每个接口都写一遍 if-else，100 个接口写 100 遍。
2. **难维护**：要给 user 加"删除文章"权限，得找到所有相关接口逐个改。
3. **容易漏**：新写的接口忘记加权限检查，直接裸奔。
4. **无法审计**：想知道"user 角色到底有哪些权限"，只能全局搜索代码。

### 2.2 RBAC 方案：角色-权限映射表

RBAC 的核心是建一张**角色→权限**映射表，接口只声明"我需要什么权限"，由依赖注入自动检查：

\`\`\`python filename="demo0_rbac_concept.py"
"""RBAC 方案：接口声明所需权限，依赖注入自动检查"""

from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# 第 1 步：定义权限→角色的映射表（集中管理）
ROLE_PERMISSIONS = {
    "admin":   {"*"},                              # admin 拥有全部权限
    "editor":  {"article:read", "article:write"},  # editor 能读写文章
    "user":    {"article:read"},                   # user 只能读
    "finance": {"article:read", "finance:read"},   # finance 能读文章+财务
}

# 第 2 步：定义依赖注入工厂，传入所需权限
def require_permission(permission: str):
    """权限检查依赖工厂：返回一个依赖函数"""
    def checker(user: dict = Depends(get_current_user)):
        # 获取该角色的所有权限
        user_perms = ROLE_PERMISSIONS.get(user["role"], set())
        # admin 有通配符 *，直接放行
        if "*" in user_perms or permission in user_perms:
            return user  # 检查通过，返回用户
        raise HTTPException(status_code=403, detail=f"需要权限: {permission}")
    return checker

# 第 3 步：接口只需声明所需权限，不再写 if-else
@app.delete("/articles/{article_id}")
async def delete_article(article_id: int, user=Depends(require_permission("article:delete"))):
    return {"msg": f"文章 {article_id} 已删除"}  # 权限检查由依赖注入完成

@app.get("/finance/report")
async def finance_report(user=Depends(require_permission("finance:read"))):
    return {"data": "财务报表数据"}
\`\`\`

**好处**：

1. **集中管理**：权限映射在一张表里，改一处全局生效。
2. **声明式**：接口只说"我要 article:delete 权限"，不关心怎么检查。
3. **可审计**：看 \`ROLE_PERMISSIONS\` 就知道每个角色有什么权限。
4. **不遗漏**：每个接口必须声明权限依赖，否则框架层面就不放行。

## 三、RBAC 三层模型

### 3.1 经典 RBAC 三层架构

\`\`\`txt filename="RBAC 三层模型"
    ┌──────────┐      ┌──────────┐      ┌──────────────┐
    │  用户层   │      │  角色层   │      │   权限层      │
    │  User    │      │  Role    │      │  Permission  │
    │          │      │          │      │              │
    │  alice   │─────→│  admin   │─────→│ article:*    │
    │  bob     │─────→│  editor  │─────→│ article:read │
    │  charlie │─────→│  user    │      │ article:write│
    │          │      │          │      │ finance:read │
    └──────────┘      └──────────┘      └──────────────┘

    第 1 层：用户↔角色  （alice 是 admin，bob 是 editor）
    第 2 层：角色↔权限  （admin 有 article:*，editor 有 article:read+write）
    第 3 层：权限↔接口  （DELETE /articles/ 需要 article:delete 权限）
\`\`\`

### 3.2 三层的关系

- **用户→角色**：多对多。一个用户可以有多个角色（既是 editor 又是 finance），一个角色可以分配给多个用户。
- **角色→权限**：多对多。一个角色有多种权限，一种权限可以属于多个角色。
- **权限→接口**：一对多。一个接口只需要一种权限，但同一种权限可以保护多个接口。

### 3.3 为什么是三层而不是两层

两层（用户→权限）的问题：100 个用户 × 20 种权限 = 2000 条分配记录，维护噩梦。

三层（用户→角色→权限）的优势：100 个用户 × 3 个角色 + 3 个角色 × 20 种权限 = 360 条记录，大幅减少。而且角色变动时只改角色→权限映射，用户无感知。

## 四、用枚举定义角色

### Demo 1：枚举 + 角色权限映射表

\`\`\`python filename="demo1_role_enum.py"
"""Demo 1：用枚举定义角色，建立角色-权限映射表"""

from enum import Enum          # Python 内置枚举类
from fastapi import FastAPI    # FastAPI 框架

app = FastAPI()

# ─── 第 1 步：用 Enum 定义所有角色 ───
class Role(str, Enum):
    """角色枚举，继承 str + Enum，方便 JSON 序列化"""
    ADMIN   = "admin"    # 管理员：拥有全部权限
    EDITOR  = "editor"   # 编辑：能读写文章
    USER    = "user"     # 普通用户：只能读
    FINANCE = "finance"  # 财务：能读文章 + 看财务报表

# ─── 第 2 步：定义所有权限常量 ───
class Permission:
    """权限常量类，格式：资源:操作"""
    ARTICLE_READ   = "article:read"      # 读文章
    ARTICLE_WRITE  = "article:write"     # 写文章
    ARTICLE_DELETE = "article:delete"    # 删文章
    FINANCE_READ   = "finance:read"      # 看财务
    USER_MANAGE    = "user:manage"       # 管理用户

# ─── 第 3 步：建立角色→权限映射表 ───
ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {
        Permission.ARTICLE_READ,
        Permission.ARTICLE_WRITE,
        Permission.ARTICLE_DELETE,
        Permission.FINANCE_READ,
        Permission.USER_MANAGE,
    },
    Role.EDITOR: {
        Permission.ARTICLE_READ,
        Permission.ARTICLE_WRITE,
    },
    Role.USER: {
        Permission.ARTICLE_READ,
    },
    Role.FINANCE: {
        Permission.ARTICLE_READ,
        Permission.FINANCE_READ,
    },
}

# ─── 第 4 步：定义用户模型 ───
users_db = {
    "alice":   {"username": "alice",   "role": Role.ADMIN},    # alice 是管理员
    "bob":     {"username": "bob",     "role": Role.EDITOR},   # bob 是编辑
    "charlie": {"username": "charlie", "role": Role.USER},     # charlie 是普通用户
    "dave":    {"username": "dave",    "role": Role.FINANCE},  # dave 是财务
}

def get_user_permissions(role: Role) -> set[str]:
    """根据角色获取权限集合"""
    return ROLE_PERMISSIONS.get(role, set())  # 找不到角色返回空集（无权限）

# ─── 第 5 步：测试 ───
@app.get("/debug/permissions/{username}")
async def show_permissions(username: str):
    """调试接口：查看某用户的角色和权限"""
    user = users_db.get(username)
    if not user:
        return {"error": "用户不存在"}
    role = user["role"]                           # 取出角色
    perms = get_user_permissions(role)            # 查权限表
    return {
        "username": username,
        "role": role.value,                       # .value 取枚举的字符串值
        "permissions": sorted(perms),             # 排序方便查看
        "perm_count": len(perms),
    }

# 启动后访问：
#   /debug/permissions/alice   → role=admin, 5 个权限
#   /debug/permissions/bob     → role=editor, 2 个权限
#   /debug/permissions/charlie → role=user, 1 个权限
\`\`\`

**运行效果**：

\`\`\`bash
# 启动
uvicorn demo1_role_enum:app --reload

# 查看 alice（admin）的权限
curl http://127.0.0.1:8000/debug/permissions/alice
# {"username":"alice","role":"admin","permissions":["article:delete","article:read","article:write","finance:read","user:manage"],"perm_count":5}

# 查看 charlie（user）的权限
curl http://127.0.0.1:8000/debug/permissions/charlie
# {"username":"charlie","role":"user","permissions":["article:read"],"perm_count":1}
\`\`\`

## 五、基于角色的权限检查依赖

### Demo 2：角色级权限检查（完整可运行）

这个 demo 展示如何用 FastAPI 依赖注入实现**角色级**权限检查——某些接口只允许特定角色访问。

\`\`\`python filename="demo2_role_check.py"
"""Demo 2：基于角色的权限检查依赖——完整可运行示例"""

from enum import Enum
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext

app = FastAPI(title="RBAC 角色级权限检查")

# ─── 配置 ───
SECRET_KEY = "your-secret-key-here"  # 实际从环境变量读
ALGORITHM = "HS256"                  # JWT 签名算法
ACCESS_TOKEN_EXPIRE_MINUTES = 30     # token 有效期 30 分钟

# ─── 密码哈希工具 ───
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ─── 角色枚举 ───
class Role(str, Enum):
    ADMIN  = "admin"    # 管理员
    EDITOR = "editor"   # 编辑
    USER   = "user"     # 普通用户

# ─── 模拟数据库 ───
fake_users_db = {
    "alice": {
        "username": "alice",
        "hashed_password": pwd_context.hash("alice123"),  # 哈希密码
        "role": Role.ADMIN,                                # alice 是管理员
    },
    "bob": {
        "username": "bob",
        "hashed_password": pwd_context.hash("bob123"),    # 哈希密码
        "role": Role.EDITOR,                               # bob 是编辑
    },
    "charlie": {
        "username": "charlie",
        "hashed_password": pwd_context.hash("charlie123"),# 哈希密码
        "role": Role.USER,                                 # charlie 是普通用户
    },
}

# ─── Token 生成 ───
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """生成 JWT access token"""
    to_encode = data.copy()                              # 复制数据，避免修改原字典
    expire = datetime.utcnow() + (                       # 计算过期时间
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})                    # 写入 exp 声明
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)  # 签名生成 token

# ─── 登录接口 ───
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 密码模式登录，返回 JWT token"""
    user = fake_users_db.get(form_data.username)         # 查用户
    if not user or not pwd_context.verify(               # 验证密码
        form_data.password, user["hashed_password"]
    ):
        raise HTTPException(                             # 用户不存在或密码错
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )
    # token 里写入用户名和角色
    token = create_access_token({
        "sub": user["username"],                         # sub：主体（用户名）
        "role": user["role"].value,                      # role：角色
    })
    return {"access_token": token, "token_type": "bearer"}

# ─── 从 token 解析当前用户 ───
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """依赖：从 token 解析用户信息"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # 解码 token
        username: str = payload.get("sub")               # 取用户名
        role_str: str = payload.get("role")              # 取角色
        if username is None or role_str is None:         # 缺字段则拒绝
            raise credentials_exception
    except JWTError:                                     # 解码失败（篡改/过期）
        raise credentials_exception
    user = fake_users_db.get(username)                   # 查用户是否存在
    if user is None:
        raise credentials_exception
    return user                                          # 返回用户对象

# ─── 核心：角色检查依赖工厂 ───
def require_role(required_roles: list[Role]):
    """
    角色检查依赖工厂
    用法：Depends(require_role([Role.ADMIN, Role.EDITOR]))
    含义：只有 ADMIN 或 EDITOR 角色才能通过
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user["role"]                 # 取当前用户角色
        if user_role not in required_roles:              # 不在允许列表里
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,   # 403：有身份但没权限
                detail=f"需要角色: {[r.value for r in required_roles]}，"
                       f"当前角色: {user_role.value}",
            )
        return current_user                              # 检查通过，返回用户
    return role_checker

# ─── 接口：所有登录用户可访问 ───
@app.get("/articles/")
async def list_articles(current_user: dict = Depends(get_current_user)):
    """所有登录用户都能看文章列表"""
    return {
        "msg": f"你好 {current_user['username']}，这是文章列表",
        "your_role": current_user["role"].value,
    }

# ─── 接口：只有 ADMIN 和 EDITOR 能写 ───
@app.post("/articles/")
async def create_article(
    current_user: dict = Depends(require_role([Role.ADMIN, Role.EDITOR]))
):
    """只有管理员和编辑能创建文章"""
    return {
        "msg": f"{current_user['username']} 创建了一篇文章",
        "role": current_user["role"].value,
    }

# ─── 接口：只有 ADMIN 能删 ───
@app.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    current_user: dict = Depends(require_role([Role.ADMIN]))
):
    """只有管理员能删除文章"""
    return {
        "msg": f"管理员 {current_user['username']} 删除了文章 {article_id}",
    }

# ─── 接口：只有 ADMIN 能管理用户 ───
@app.post("/admin/users/")
async def create_user(
    current_user: dict = Depends(require_role([Role.ADMIN]))
):
    """只有管理员能创建用户"""
    return {"msg": f"管理员 {current_user['username']} 创建了新用户"}
\`\`\`

**测试流程**：

\`\`\`bash
# 1. 用 alice（admin）登录拿 token
curl -X POST http://127.0.0.1:8000/token \
  -d "username=alice&password=alice123" | jq .
# {"access_token":"eyJ...","token_type":"bearer"}

# 2. 用 token 创建文章（admin 可以）
curl -X POST http://127.0.0.1:8000/articles/ \
  -H "Authorization: Bearer eyJ..."
# {"msg":"alice 创建了一篇文章","role":"admin"}

# 3. 用 charlie（user）登录
curl -X POST http://127.0.0.1:8000/token \
  -d "username=charlie&password=charlie123" | jq .token

# 4. charlie 尝试创建文章（403）
curl -X POST http://127.0.0.1:8000/articles/ \
  -H "Authorization: Bearer eyJ..."
# {"detail":"需要角色: ['admin', 'editor']，当前角色: user"}

# 5. charlie 可以看文章列表（200）
curl http://127.0.0.1:8000/articles/ \
  -H "Authorization: Bearer eyJ..."
# {"msg":"你好 charlie，这是文章列表","your_role":"user"}
\`\`\`

## 六、基于权限的细粒度控制

### 6.1 角色级 vs 权限级

角色级检查（Demo 2）有个问题：如果要让 editor 也能删文章，得改接口的 \`require_role\` 参数。更好的做法是接口声明**需要什么权限**，而不是**需要什么角色**——这样改角色权限映射表就行，接口代码不用动。

\`\`\`txt filename="角色级 vs 权限级"
角色级：接口说"我要 admin 角色"      → 改角色权限要改接口代码 ❌
权限级：接口说"我要 article:delete 权限" → 改角色权限只改映射表 ✅
\`\`\`

### Demo 3：权限级细粒度控制

\`\`\`python filename="demo3_permission_check.py"
"""Demo 3：基于权限的细粒度控制——接口声明所需权限，角色映射表自动检查"""

from enum import Enum
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

app = FastAPI(title="RBAC 权限级控制")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ─── 角色 & 权限定义 ───
class Role(str, Enum):
    ADMIN  = "admin"
    EDITOR = "editor"
    USER   = "user"

class Permission:
    ARTICLE_READ   = "article:read"
    ARTICLE_WRITE  = "article:write"
    ARTICLE_DELETE = "article:delete"
    USER_MANAGE    = "user:manage"
    SYSTEM_CONFIG  = "system:config"

# ─── 角色→权限映射表（改这里就能调整权限，接口代码不用动）───
ROLE_PERMISSIONS = {
    Role.ADMIN: {
        Permission.ARTICLE_READ,
        Permission.ARTICLE_WRITE,
        Permission.ARTICLE_DELETE,
        Permission.USER_MANAGE,
        Permission.SYSTEM_CONFIG,
    },
    Role.EDITOR: {
        Permission.ARTICLE_READ,
        Permission.ARTICLE_WRITE,
        # editor 没有 DELETE 权限
    },
    Role.USER: {
        Permission.ARTICLE_READ,
        # user 只有读权限
    },
}

# ─── 模拟用户 ───
fake_users_db = {
    "alice":   {"username": "alice",   "role": Role.ADMIN},
    "bob":     {"username": "bob",     "role": Role.EDITOR},
    "charlie": {"username": "charlie", "role": Role.USER},
}

# ─── 模拟 token 解析（简化版，实际用 JWT）───
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """从 token 解析用户（这里简化，直接返回 alice）"""
    # 实际项目中这里解码 JWT，这里简化演示
    return fake_users_db["alice"]

# ─── 核心：权限检查依赖工厂 ───
def require_permission(required_perm: str):
    """
    权限检查依赖工厂
    用法：Depends(require_permission(Permission.ARTICLE_DELETE))
    逻辑：检查当前用户的角色是否拥有所需权限
    """
    def permission_checker(current_user: dict = Depends(get_current_user)):
        # 第 1 步：取出用户角色
        role = current_user["role"]
        # 第 2 步：查角色→权限映射表，获取该角色的所有权限
        user_perms = ROLE_PERMISSIONS.get(role, set())
        # 第 3 步：检查所需权限是否在权限集合里
        if required_perm not in user_perms:
            # 不在 → 403 Forbidden
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足：需要 '{required_perm}'，"
                       f"你的角色 '{role.value}' 只有 {sorted(user_perms)}",
            )
        # 在 → 检查通过，返回用户
        return current_user
    return permission_checker

# ─── 接口声明所需权限，不关心角色 ───
@app.get("/articles/")
async def list_articles(user=Depends(require_permission(Permission.ARTICLE_READ))):
    """读文章：需要 article:read 权限"""
    return {"msg": "文章列表", "accessed_by": user["username"]}

@app.post("/articles/")
async def create_article(user=Depends(require_permission(Permission.ARTICLE_WRITE))):
    """写文章：需要 article:write 权限"""
    return {"msg": "文章已创建", "created_by": user["username"]}

@app.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    user=Depends(require_permission(Permission.ARTICLE_DELETE))
):
    """删文章：需要 article:delete 权限"""
    return {"msg": f"文章 {article_id} 已删除", "deleted_by": user["username"]}

@app.post("/admin/users/")
async def manage_user(user=Depends(require_permission(Permission.USER_MANAGE))):
    """管理用户：需要 user:manage 权限"""
    return {"msg": "用户管理操作", "operated_by": user["username"]}

@app.put("/system/config/")
async def update_config(user=Depends(require_permission(Permission.SYSTEM_CONFIG))):
    """系统配置：需要 system:config 权限"""
    return {"msg": "系统配置已更新", "updated_by": user["username"]}
\`\`\`

**灵活之处**：如果现在要让 editor 也能删文章，**只需改映射表**，不用改任何接口代码：

\`\`\`python
# 改前：editor 没有 DELETE 权限
Role.EDITOR: {Permission.ARTICLE_READ, Permission.ARTICLE_WRITE}

# 改后：给 editor 加上 DELETE 权限——接口代码一行都不用改！
Role.EDITOR: {Permission.ARTICLE_READ, Permission.ARTICLE_WRITE, Permission.ARTICLE_DELETE}
\`\`\`

## 七、用 SecurityScopes 实现 OAuth2 scopes 检查

### 7.1 什么是 SecurityScopes

FastAPI 内置了 \`SecurityScopes\` 类，专门用于 OAuth2 的 scopes 机制。scopes 是一种细粒度权限，写在 token 里，前端请求 token 时可以声明"我要哪些 scopes"。

\`\`\`txt filename="SecurityScopes 工作流程"
前端登录时声明 scopes → 服务端把 scopes 写进 token → 接口用 SecurityScopes 检查

1. 前端：POST /token  body: scope="read write"
2. 服务端：JWT payload 里写入 "scopes": ["read", "write"]
3. 接口：security_scopes = SecurityScopes(scopes=["write"])
   → 自动检查 token 里的 scopes 是否包含 "write"
\`\`\`

### Demo 4：SecurityScopes + OAuth2 scopes 完整实现

\`\`\`python filename="demo4_security_scopes.py"
"""Demo 4：用 SecurityScopes 实现 OAuth2 scopes 级别的权限控制"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from jose import jwt, JWTError
from passlib.context import CryptContext

app = FastAPI(title="SecurityScopes 示例")

# ─── 配置 ───
SECRET_KEY = "demo-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 注意：OAuth2PasswordBearer 的 scopes 参数定义了所有可用 scope
# FastAPI 会用这些信息生成 /docs 的授权页面
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "read":    "读取权限",      # read scope
        "write":   "写入权限",      # write scope
        "delete":  "删除权限",      # delete scope
        "admin":   "管理员权限",    # admin scope
    },
)

# ─── 模拟数据库 ───
fake_users_db = {
    "alice": {
        "username": "alice",
        "hashed_password": pwd_context.hash("alice123"),
        "scopes": ["read", "write", "delete", "admin"],  # alice 有全部 scope
    },
    "bob": {
        "username": "bob",
        "hashed_password": pwd_context.hash("bob123"),
        "scopes": ["read", "write"],                      # bob 只有读写
    },
    "charlie": {
        "username": "charlie",
        "hashed_password": pwd_context.hash("charlie123"),
        "scopes": ["read"],                               # charlie 只能读
    },
}

# ─── Token 生成（写入 scopes）───
def create_access_token(data: dict, scopes: list[str], expires_delta: Optional[timedelta] = None):
    """生成带 scopes 的 JWT token"""
    to_encode = data.copy()
    to_encode["scopes"] = scopes                          # 把 scopes 写进 JWT payload
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire                             # 写入过期时间
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ─── 登录接口（支持 scope 参数）───
@app.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 登录接口
    前端可以在 body 里传 scope="read write" 来声明需要的权限
    form_data.scopes 是一个 list[str]，由空格分割的 scope 字符串解析而来
    """
    user = fake_users_db.get(form_data.username)         # 查用户
    if not user or not pwd_context.verify(
        form_data.password, user["hashed_password"]
    ):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 检查请求的 scopes 是否超出用户拥有的 scopes
    requested_scopes = form_data.scopes                   # 前端请求的 scope 列表
    user_scopes = user["scopes"]                          # 用户实际拥有的 scope 列表
    for scope in requested_scopes:
        if scope not in user_scopes:                      # 请求了没有的权限
            raise HTTPException(
                status_code=403,
                detail=f"用户没有 scope: {scope}",
            )

    # 生成 token，写入用户拥有的 scopes（取请求 scopes 和用户 scopes 的交集）
    granted_scopes = list(set(requested_scopes) & set(user_scopes))
    token = create_access_token(
        data={"sub": user["username"]},
        scopes=granted_scopes,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "scopes": granted_scopes,                         # 返回实际授予的 scopes
    }

# ─── 核心：用 SecurityScopes 检查权限 ───
def get_current_user(
    security_scopes: SecurityScopes,                      # FastAPI 自动注入
    token: str = Depends(oauth2_scheme),
) -> dict:
    """
    依赖：解析 token 并检查 SecurityScopes
    security_scopes.scopes 是接口声明的所需 scope 列表
    """
    if security_scopes.scopes:
        # 如果接口声明了需要 scope，认证头要加 Bearer
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")                # 取用户名
        token_scopes: list = payload.get("scopes", [])    # 取 token 里的 scopes
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception

    # 核心：检查 token 的 scopes 是否覆盖接口要求的 scopes
    for scope in security_scopes.scopes:                  # 遍历接口要求的每个 scope
        if scope not in token_scopes:                     # token 里没有这个 scope
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足：需要 scope '{scope}'",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user

# ─── 接口：需要 read scope ───
@app.get("/articles/")
async def list_articles(
    user: dict = Security(get_current_user, scopes=["read"])  # 声明需要 read scope
):
    """读文章需要 read scope"""
    return {"msg": "文章列表", "user": user["username"]}

# ─── 接口：需要 write scope ───
@app.post("/articles/")
async def create_article(
    user: dict = Security(get_current_user, scopes=["write"]) # 声明需要 write scope
):
    """写文章需要 write scope"""
    return {"msg": "文章已创建", "user": user["username"]}

# ─── 接口：需要 delete scope ───
@app.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    user: dict = Security(get_current_user, scopes=["delete"]) # 声明需要 delete scope
):
    """删文章需要 delete scope"""
    return {"msg": f"文章 {article_id} 已删除", "user": user["username"]}

# ─── 接口：需要 admin scope ───
@app.post("/admin/reset/")
async def reset_system(
    user: dict = Security(get_current_user, scopes=["admin"]) # 声明需要 admin scope
):
    """重置系统需要 admin scope"""
    return {"msg": "系统已重置", "user": user["username"]}
\`\`\`

**测试**：

\`\`\`bash
# 1. charlie 登录，只请求 read scope
curl -X POST http://127.0.0.1:8000/token \
  -d "username=charlie&password=charlie123&scope=read"
# {"access_token":"eyJ...","token_type":"bearer","scopes":["read"]}

# 2. charlie 读文章（有 read scope → 200）
curl http://127.0.0.1:8000/articles/ -H "Authorization: Bearer eyJ..."
# {"msg":"文章列表","user":"charlie"}

# 3. charlie 尝试写文章（没有 write scope → 403）
curl -X POST http://127.0.0.1:8000/articles/ -H "Authorization: Bearer eyJ..."
# {"detail":"权限不足：需要 scope 'write'"}

# 4. bob 登录，请求 read + write scope
curl -X POST http://127.0.0.1:8000/token \
  -d "username=bob&password=bob123&scope=read write"
# {"access_token":"eyJ...","scopes":["read","write"]}

# 5. bob 写文章（有 write scope → 200）
curl -X POST http://127.0.0.1:8000/articles/ -H "Authorization: Bearer eyJ..."
# {"msg":"文章已创建","user":"bob"}
\`\`\`

## 八、资源所有权检查

### 8.1 为什么光有角色/权限还不够

RBAC 解决的是"类权限"（article:delete），但有些场景需要**资源级**控制：

- alice 能删自己的文章，但不能删 bob 的文章。
- alice 是 admin → 能删任何人的文章。
- bob 是 editor → 能删自己的文章，不能删别人的。

这需要**资源所有权检查**——不只是查角色权限，还要查"这个资源是不是你的"。

\`\`\`txt filename="资源所有权检查逻辑"
用户请求 DELETE /articles/123
  │
  ├─ 第 1 步：认证（token 有效？）
  ├─ 第 2 步：角色权限（有 article:delete 权限？）
  └─ 第 3 步：资源所有权（文章 123 是不是你写的？或者你是 admin？）
      │
      ├─ 是你写的 → 允许删除
      ├─ 你是 admin → 允许删除（管理员特权）
      └─ 不是你写的 + 不是 admin → 403
\`\`\`

### Demo 5：资源所有权检查

\`\`\`python filename="demo5_ownership_check.py"
"""Demo 5：资源所有权检查——用户只能操作自己的资源，admin 可以操作所有"""

from enum import Enum
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

app = FastAPI(title="资源所有权检查")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Role(str, Enum):
    ADMIN  = "admin"
    EDITOR = "editor"
    USER   = "user"

# ─── 模拟文章数据库 ───
articles_db = {
    1: {"id": 1, "title": "FastAPI 入门",   "author": "alice",   "content": "..."},
    2: {"id": 2, "title": "JWT 详解",       "author": "bob",     "content": "..."},
    3: {"id": 3, "title": "密码哈希",       "author": "charlie", "content": "..."},
}

# ─── 模拟用户 ───
users_db = {
    "alice":   {"username": "alice",   "role": Role.ADMIN},
    "bob":     {"username": "bob",     "role": Role.EDITOR},
    "charlie": {"username": "charlie", "role": Role.USER},
}

# ─── 模拟获取当前用户 ───
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """简化版：从 token 获取用户（实际用 JWT 解码）"""
    return users_db["bob"]  # 模拟返回 bob

# ─── 资源所有权检查函数 ───
def check_article_ownership(article_id: int, user: dict, require_admin: bool = False):
    """
    检查用户是否有权操作指定文章
    - 文章作者是自己 → 允许
    - 用户是 admin → 允许（管理员特权）
    - 否则 → 403
    """
    article = articles_db.get(article_id)                # 查文章是否存在
    if not article:
        raise HTTPException(status_code=404, detail=f"文章 {article_id} 不存在")

    is_owner = article["author"] == user["username"]    # 是不是作者
    is_admin = user["role"] == Role.ADMIN               # 是不是管理员

    if is_owner:                                        # 是作者 → 放行
        return article
    if is_admin and not require_admin:                  # 是管理员且不需要 admin 专属 → 放行
        return article
    # 既不是作者也不是管理员 → 拒绝
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"无权操作文章 {article_id}：你不是作者（{article['author']}），也不是管理员",
    )

# ─── 接口：修改自己的文章 ───
@app.put("/articles/{article_id}")
async def update_article(
    article_id: int,
    user: dict = Depends(get_current_user),
):
    """修改文章：作者本人或管理员可以"""
    article = check_article_ownership(article_id, user)  # 所有权检查
    return {
        "msg": "文章已更新",
        "title": article["title"],
        "updated_by": user["username"],
    }

# ─── 接口：删除自己的文章 ───
@app.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    user: dict = Depends(get_current_user),
):
    """删除文章：作者本人或管理员可以"""
    article = check_article_ownership(article_id, user)  # 所有权检查
    del articles_db[article_id]                          # 从数据库删除
    return {
        "msg": f"文章 {article_id} 已删除",
        "deleted_by": user["username"],
    }

# ─── 接口：查看文章详情（所有登录用户可看）───
@app.get("/articles/{article_id}")
async def get_article(
    article_id: int,
    user: dict = Depends(get_current_user),
):
    """查看文章：所有登录用户都能看"""
    article = articles_db.get(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    return article
\`\`\`

**测试场景**（当前模拟用户是 bob）：

\`\`\`bash
# bob 修改自己的文章 2（作者是 bob）→ 200 ✅
curl -X PUT http://127.0.0.1:8000/articles/2 -H "Authorization: Bearer token"
# {"msg":"文章已更新","title":"JWT 详解","updated_by":"bob"}

# bob 修改 alice 的文章 1（作者是 alice，bob 不是 admin）→ 403 ❌
curl -X PUT http://127.0.0.1:8000/articles/1 -H "Authorization: Bearer token"
# {"detail":"无权操作文章 1：你不是作者（alice），也不是管理员"}

# bob 删除自己的文章 2 → 200 ✅
curl -X DELETE http://127.0.0.1:8000/articles/2 -H "Authorization: Bearer token"
# {"msg":"文章 2 已删除","deleted_by":"bob"}
\`\`\`

## 九、实战：多角色用户管理系统

### Demo 6：完整的 RBAC + 所有权检查系统

这个 demo 把前面学的**角色枚举 + 权限映射 + 依赖工厂 + 所有权检查**全部整合，实现一个生产可用的权限系统骨架。

\`\`\`python filename="demo6_full_rbac_system.py"
"""Demo 6：完整的 RBAC 系统——角色 + 权限 + 所有权 + JWT 认证"""

from enum import Enum
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

app = FastAPI(title="完整 RBAC 系统")

# ═══ 配置 ═══
SECRET_KEY = "production-secret-key-from-env"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ═══ 第 1 层：角色 & 权限定义 ═══
class Role(str, Enum):
    """系统角色枚举"""
    ADMIN  = "admin"    # 管理员：全部权限 + 可管理用户
    EDITOR = "editor"   # 编辑：读写文章 + 删自己的文章
    USER   = "user"     # 普通用户：只读 + 写自己的文章

class Permission:
    """权限常量，格式：资源:操作"""
    ARTICLE_READ   = "article:read"
    ARTICLE_WRITE  = "article:write"
    ARTICLE_DELETE = "article:delete"
    USER_READ      = "user:read"
    USER_MANAGE    = "user:manage"

# ═══ 第 2 层：角色→权限映射表 ═══
ROLE_PERMISSIONS = {
    Role.ADMIN: {
        Permission.ARTICLE_READ, Permission.ARTICLE_WRITE, Permission.ARTICLE_DELETE,
        Permission.USER_READ, Permission.USER_MANAGE,
    },
    Role.EDITOR: {
        Permission.ARTICLE_READ, Permission.ARTICLE_WRITE, Permission.ARTICLE_DELETE,
    },
    Role.USER: {
        Permission.ARTICLE_READ, Permission.ARTICLE_WRITE,
    },
}

# ═══ 第 3 层：数据模型 ═══
class User(BaseModel):
    username: str
    role: Role

class Article(BaseModel):
    id: int
    title: str
    author: str
    content: str = ""

# ═══ 模拟数据库 ═══
users_db = {
    "alice":   {"username": "alice",   "role": Role.ADMIN,  "hashed_password": pwd_context.hash("alice123")},
    "bob":     {"username": "bob",     "role": Role.EDITOR, "hashed_password": pwd_context.hash("bob123")},
    "charlie": {"username": "charlie", "role": Role.USER,   "hashed_password": pwd_context.hash("charlie123")},
}

articles_db = {
    1: {"id": 1, "title": "FastAPI 入门", "author": "bob",     "content": "FastAPI 很好用..."},
    2: {"id": 2, "title": "JWT 详解",     "author": "charlie", "content": "JWT 是..."},
    3: {"id": 3, "title": "RBAC 实战",    "author": "alice",   "content": "RBAC 三层..."},
}

# ═══ Token 工具 ═══
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """生成 JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """解码 JWT token，返回 payload"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="token 无效或过期")

# ═══ 认证依赖 ═══
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """依赖：从 token 解析当前用户"""
    payload = decode_token(token)                    # 解码 token
    username = payload.get("sub")                    # 取用户名
    user = users_db.get(username)                    # 查数据库
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user

# ═══ 权限检查依赖工厂 ═══
def require_permission(perm: str):
    """权限检查依赖工厂：检查用户角色是否拥有所需权限"""
    def checker(user: dict = Depends(get_current_user)):
        user_perms = ROLE_PERMISSIONS.get(user["role"], set())
        if perm not in user_perms:
            raise HTTPException(
                status_code=403,
                detail=f"权限不足：需要 '{perm}'，你的角色 '{user['role'].value}' 没有此权限",
            )
        return user
    return checker

# ═══ 所有权检查 ═══
def get_article_or_404(article_id: int) -> dict:
    """获取文章，不存在则 404"""
    article = articles_db.get(article_id)
    if not article:
        raise HTTPException(status_code=404, detail=f"文章 {article_id} 不存在")
    return article

def check_ownership(article: dict, user: dict) -> bool:
    """检查用户是否是文章作者或管理员"""
    return article["author"] == user["username"] or user["role"] == Role.ADMIN

# ═══ 登录接口 ═══
@app.post("/token")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 密码模式登录"""
    user = users_db.get(form.username)
    if not user or not pwd_context.verify(form.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token({
        "sub": user["username"],
        "role": user["role"].value,
    })
    return {"access_token": token, "token_type": "bearer"}

# ═══ 文章接口 ═══
@app.get("/articles/")
async def list_articles(user=Depends(require_permission(Permission.ARTICLE_READ))):
    """文章列表：需要 article:read 权限"""
    return {"articles": list(articles_db.values()), "viewed_by": user["username"]}

@app.get("/articles/{article_id}")
async def get_article(
    article_id: int,
    user=Depends(require_permission(Permission.ARTICLE_READ)),
):
    """文章详情：需要 article:read 权限"""
    return get_article_or_404(article_id)

@app.post("/articles/")
async def create_article(
    title: str,
    content: str,
    user=Depends(require_permission(Permission.ARTICLE_WRITE)),
):
    """创建文章：需要 article:write 权限"""
    new_id = max(articles_db.keys()) + 1
    article = {"id": new_id, "title": title, "author": user["username"], "content": content}
    articles_db[new_id] = article
    return {"msg": "文章已创建", "article": article}

@app.put("/articles/{article_id}")
async def update_article(
    article_id: int,
    title: Optional[str] = None,
    content: Optional[str] = None,
    user=Depends(require_permission(Permission.ARTICLE_WRITE)),
):
    """修改文章：需要 article:write 权限 + 所有权检查"""
    article = get_article_or_404(article_id)
    if not check_ownership(article, user):
        raise HTTPException(status_code=403, detail="只能修改自己的文章")
    if title:   article["title"] = title
    if content: article["content"] = content
    return {"msg": "文章已更新", "article": article}

@app.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    user=Depends(require_permission(Permission.ARTICLE_DELETE)),
):
    """删除文章：需要 article:delete 权限 + 所有权检查"""
    article = get_article_or_404(article_id)
    if not check_ownership(article, user):
        raise HTTPException(status_code=403, detail="只能删除自己的文章")
    del articles_db[article_id]
    return {"msg": f"文章 {article_id} 已删除", "deleted_by": user["username"]}

# ═══ 用户管理接口 ═══
@app.get("/admin/users/")
async def list_users(user=Depends(require_permission(Permission.USER_READ))):
    """用户列表：需要 user:read 权限"""
    return {"users": [{"username": u["username"], "role": u["role"].value} for u in users_db.values()]}

@app.put("/admin/users/{username}/role")
async def change_user_role(
    username: str,
    new_role: Role,
    user=Depends(require_permission(Permission.USER_MANAGE)),
):
    """修改用户角色：需要 user:manage 权限"""
    if username not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    old_role = users_db[username]["role"]
    users_db[username]["role"] = new_role
    return {"msg": "角色已更新", "username": username, "old_role": old_role.value, "new_role": new_role.value}
\`\`\`

**完整测试流程**：

\`\`\`bash
# ═══ 1. 登录获取 token ═══
# alice (admin) 登录
ALICE_TOKEN=$(curl -s -X POST http://127.0.0.1:8000/token \
  -d "username=alice&password=alice123" | jq -r .access_token)

# charlie (user) 登录
CHARLIE_TOKEN=$(curl -s -X POST http://127.0.0.1:8000/token \
  -d "username=charlie&password=charlie123" | jq -r .access_token)

# ═══ 2. 权限测试 ═══
# charlie 读文章列表 → 200 ✅（有 article:read）
curl http://127.0.0.1:8000/articles/ -H "Authorization: Bearer $CHARLIE_TOKEN"

# charlie 创建文章 → 200 ✅（有 article:write）
curl -X POST "http://127.0.0.1:8000/articles/?title=我的文章&content=内容" \
  -H "Authorization: Bearer $CHARLIE_TOKEN"

# charlie 删除别人的文章 → 403 ❌（有 article:delete 权限但不是作者）
curl -X DELETE http://127.0.0.1:8000/articles/1 -H "Authorization: Bearer $CHARLIE_TOKEN"

# alice 删除任何文章 → 200 ✅（admin 有权限 + 所有权豁免）
curl -X DELETE http://127.0.0.1:8000/articles/2 -H "Authorization: Bearer $ALICE_TOKEN"

# ═══ 3. 用户管理测试 ═══
# charlie 查看用户列表 → 403 ❌（没有 user:read）
curl http://127.0.0.1:8000/admin/users/ -H "Authorization: Bearer $CHARLIE_TOKEN"

# alice 查看用户列表 → 200 ✅（admin 有 user:read）
curl http://127.0.0.1:8000/admin/users/ -H "Authorization: Bearer $ALICE_TOKEN"

# alice 修改 charlie 的角色为 editor → 200 ✅
curl -X PUT "http://127.0.0.1:8000/admin/users/charlie/role?new_role=editor" \
  -H "Authorization: Bearer $ALICE_TOKEN"
\`\`\`

## 十、常见错误与避坑指南

1. **角色用字符串而不是枚举**：\`role = "admin"\` 容易拼错（\`"Admin"\`、\`"ADMIN"\`），用 \`Enum\` 可以避免拼写错误，还能享受 IDE 自动补全。
2. **权限检查写在路由函数里**：\`if user.role != "admin": raise ...\` 散落在各处，难维护。应该用依赖工厂 \`Depends(require_permission(...))\` 集中管理。
3. **401 和 403 混用**：401 = 没登录（token 缺失/过期/无效），403 = 登录了但没权限。客户端处理逻辑不同：401 跳登录页，403 显示"无权限"提示。
4. **角色写进 token 后不可更改**：JWT 是无状态的，改了数据库里的角色，旧 token 里的角色还是旧的。要么等 token 过期，要么加 token 版本号机制。
5. **权限映射表写死在代码里**：小项目可以，大项目应该存数据库，支持动态增删角色和权限。可以用 \`role_permissions\` 表。
6. **admin 用通配符 \`*\` 但忘记在检查逻辑里处理**：\`if "*" in user_perms\` 要写在权限检查的前面，否则 admin 也会被拦。
7. **资源所有权检查忘记加**：只有 \`require_permission("article:delete")\` 但没查作者，导致 bob 能删 alice 的文章。必须在路由里加 \`check_ownership\`。
8. **依赖工厂参数传错**：\`Depends(require_permission)\` 少了括号调用，传进去的是函数对象而不是闭包。正确写法：\`Depends(require_permission(Permission.ARTICLE_DELETE))\`。
9. **SecurityScopes 和 RBAC 混用**：SecurityScopes 是 OAuth2 scopes 机制，RBAC 是角色权限模型。两者可以共存但不要混淆：scopes 控制"token 有哪些权限"，RBAC 控制"用户角色有哪些权限"。
10. **多角色用户处理不当**：用户同时是 editor 和 finance，如果 \`role\` 字段只存一个值，就会丢权限。应该用 \`roles: list[Role]\`，权限取所有角色的并集。
11. **权限粒度太粗或太细**：太粗（只有 "read" 和 "write"）不够灵活；太细（\`article:read:title\`、\`article:read:content\`）维护成本高。推荐"资源:操作"两级。
12. **忘记给 /docs 加权限保护**：生产环境应该关掉 /docs 或加 admin 权限保护，否则接口结构泄露。

## 十一、动手实验

### 实验 1：体验角色级 vs 权限级控制的区别

**目标**：理解角色级和权限级控制的差异。

**步骤**：

1. 复制 Demo 2（角色级）和 Demo 3（权限级），分别启动。
2. 在 Demo 2 里，给 editor 加"删除文章"权限 → 需要改接口的 \`require_role\` 参数。
3. 在 Demo 3 里，给 editor 加"删除文章"权限 → 只需改 \`ROLE_PERMISSIONS\` 映射表。
4. 思考：为什么权限级比角色级更灵活？（接口代码不用改，权限调整集中在一处。）

### 实验 2：测试资源所有权检查

**目标**：理解所有权检查的必要性。

**步骤**：

1. 启动 Demo 5，用 bob 的 token（editor 角色）登录。
2. bob 修改自己的文章 2 → 成功。
3. bob 修改 alice 的文章 1 → 403。
4. 改用 alice 的 token（admin 角色），修改文章 2 → 成功（admin 豁免所有权检查）。
5. 思考：如果没有所有权检查，editor 能删所有人的文章吗？（能，只要有 \`article:delete\` 权限。）

### 实验 3：用 SecurityScopes 实现 scope 降级

**目标**：理解 OAuth2 scopes 的细粒度控制。

**步骤**：

1. 启动 Demo 4，用 alice 登录，只请求 \`scope=read\`。
2. 用这个 token 尝试写文章 → 403（token 没有 write scope）。
3. 重新登录，请求 \`scope=read write\`。
4. 用新 token 写文章 → 200。
5. 思考：为什么同一用户的不同 token 有不同权限？（scopes 在登录时声明，写进 token，接口检查 token 的 scopes。）

### 实验 4：实现多角色用户

**目标**：扩展系统支持用户拥有多个角色。

**步骤**：

1. 把 User 模型的 \`role: Role\` 改成 \`roles: list[Role]\`。
2. 修改 \`get_user_permissions\` 函数：遍历所有角色，取权限的并集。
3. 测试：一个用户同时是 editor 和 finance，应该同时拥有两个角色的权限。
4. 思考：多角色如何影响所有权检查？（不影响，所有权检查只看 username，不看角色。）

## 十二、本章小结

- 认证解决"你是谁"，授权解决"你能做什么"——本章聚焦授权。
- RBAC 三层模型：用户-角色-权限，角色是用户和权限中间的"打包"层。
- 用 \`enum\` 定义角色，用 \`dict[Role, set[str]]\` 维护角色-权限映射。
- **依赖工厂**（\`require_role\`、\`require_permission\`）是 FastAPI 实现权限检查的优雅方式。
- 权限级比角色级更灵活：改权限只需改映射表，不用改接口代码。
- \`SecurityScopes\` 是 FastAPI 内置的 OAuth2 scopes 机制，适合 token 级别的细粒度权限。
- 资源所有权检查在路由函数里做，因为依赖拿不到路径参数。
- 401 vs 403：401 没登录（token 缺失/过期），403 登录了但没权限。
- 完整系统：admin/editor/user 三角色，覆盖用户管理 + 文章管理 + 所有权检查。

## 十三、整批章节回顾

第 10 批 4 章串起来就是完整的认证授权体系：

1. **OAuth2 密码模式**：定义登录流程，颁发 token。
2. **JWT**：token 的格式和验签机制，无状态、可过期。
3. **密码哈希**：密码怎么存才安全，bcrypt + passlib。
4. **RBAC**：拿到用户后怎么判断权限，角色-权限-资源三层模型。

把这 4 章的代码合起来，就是一个生产可用的认证授权骨架。后续章节会在此基础上加数据库、加测试、加部署，最终搭出完整的后端服务。
`
  }
];
