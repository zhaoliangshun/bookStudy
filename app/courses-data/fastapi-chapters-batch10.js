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
app = FastAPI()

# 创建 OAuth2PasswordBearer 实例
# 参数 tokenUrl 指向"颁发 token 的端点路径"
# 它只是一个字符串，FastAPI 不会真的去检查这个路径是否存在
# 它的作用有两个：
#   1. 告诉 Swagger UI："用户该去 /token 这个地址登录"
#   2. 在 OpenAPI 文档里记录这个信息，方便客户端集成
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
from fastapi.security import OAuth2PasswordRequestForm

# 从 fastapi 导入路由装饰器和依赖注入
from fastapi import FastAPI, Depends, HTTPException

# 导入 status 方便使用状态码常量
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
    user = UserInDB(
        username=req.username,
        email=req.email,
        disabled=False,
        password=req.password,
    )
    fake_users_db[req.username] = user
    # 返回时不带密码
    return User(**user.model_dump(exclude={"password"}))

# 登录端点：颁发 token
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 查用户
    user = fake_users_db.get(form_data.username)
    # 验证用户存在 + 密码正确
    if user is None or user.password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
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
    token = "fake-token-" + secrets.token_hex(16)
    fake_tokens[token] = user.username
    # 按 OAuth2 规范返回
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

## 十五、常见错误与避坑指南

1. **401 Not authenticated**：请求头没带 \`Authorization: Bearer xxx\`，或者 Bearer 写成了 \`bearer\`（部分代理区分大小写）。
2. **Swagger Authorize 输入用户名密码没反应**：\`tokenUrl\` 拼错，或者 \`/token\` 端点没实现，或者返回的字段名不是 \`access_token\`。
3. **登录返回 422**：用了 JSON 而不是表单格式。OAuth2 登录必须用 \`application/x-www-form-urlencoded\`，curl 用 \`-d\` 而不是 \`-d @file.json\`。
4. **token 一直有效**：这个 demo 的 token 永不过期，生产环境必须用 JWT + 过期时间，下一章讲。
5. **错误信息泄露用户是否存在**：不要写"用户不存在"和"密码错误"两种 detail，统一写"用户名或密码错误"。
6. **明文存密码**：本 demo 为了简化用明文，**生产环境绝对不行**，必须用 bcrypt 哈希，下一章讲。
7. **把 token 存在 localStorage**：容易被 XSS 攻击窃取，前端推荐用 HttpOnly Cookie，第 2 章会讲。

## 十六、本章小结

- OAuth2 是授权框架，定义了四种模式，自家产品用**密码模式**。
- \`OAuth2PasswordBearer\` 是依赖项工厂，自动提取 token，让 Swagger 出现 Authorize 按钮。
- \`OAuth2PasswordRequestForm\` 解析登录表单，字段名固定为 \`username\`、\`password\`。
- \`/token\` 端点验密码、生成 token、按规范返回 \`access_token\` + \`token_type\`。
- \`get_current_user\` 把 token 反查成用户，是认证链路的核心依赖。
- 通过洋葱式依赖（\`get_current_user\` -> \`get_current_active_user\` -> \`get_current_admin\`）实现分层权限。

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
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print("生成的 JWT：", token)
# 输出类似：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...

# ---------- 解码：验证并读取 JWT ----------

# 调用 jwt.decode 验证签名 + 解码
# 参数：token、密钥、算法列表
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
    public_exponent=65537,  # 标准 RSA 公开指数
    key_size=2048,          # 2048 位足够安全
)
# 从私钥导出公钥
public_key = private_key.public_key()

# 把密钥序列化成 PEM 格式字符串（实际场景从文件读）
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
).decode()
public_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
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
        payload = jwt.decode(req.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        # refresh token 也过期了，必须重新登录
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="refresh token 已过期，请重新登录",
        )
    except JWTError:
        # token 无效
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的 refresh token",
        )
    # 检查类型：必须是 refresh token，不能用 access token 来刷新
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 类型错误",
        )
    # 签发新的 access token
    new_access = create_token(
        data={"sub": payload["sub"], "type": "access"},
        expires_delta=timedelta(minutes=30),
    )
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
    if user is None or user.hashed_password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 生成 JWT，sub 是用户名
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    # 返回符合 OAuth2 规范的格式
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

## 十一、Token 的安全存储（前端）

后端发 token 容易，前端怎么存才安全？三个选项：

| 存储位置 | XSS 风险 | CSRF 风险 | 推荐度 |
|----------|----------|-----------|--------|
| localStorage | 高（JS 能读） | 无 | 不推荐 |
| sessionStorage | 高 | 无 | 不推荐 |
| HttpOnly Cookie | 低（JS 读不到） | 高（要加 CSRF 防护） | 推荐 |

### 推荐方案：HttpOnly Cookie + Bearer 双管齐下

\`\`\`python filename="demo6_cookie_token.py"
# 把 token 放在 HttpOnly Cookie 里，防 XSS 窃取
from fastapi import FastAPI, Response, Depends, HTTPException, status
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
SECRET_KEY = "secret"
ALGORITHM = "HS256"

# 自定义依赖：从 Cookie 或 Authorization 头取 token
async def get_token_from_cookie_or_header(
    token: str = Depends(oauth2_scheme),
) -> str:
    """优先从 Authorization 头取，没有再从 Cookie 取"""
    if token:
        return token
    # 这里需要从 Request 取 Cookie，简化演示
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
    # httponly=True：JS 读不到，防 XSS
    # secure=True：只通过 HTTPS 传输（本地开发可设 False）
    # samesite="lax"：防 CSRF
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

## 十三、本章小结

- JWT 由 Header、Payload、Signature 三段组成，用 \`.\` 分隔，前两段是 Base64 编码（可解码），第三段是签名。
- JWT 是无状态的：服务端不需要存 token，验签即可拿用户信息，适合多机器部署。
- \`python-jose\` 是 FastAPI 推荐的 JWT 库，\`jwt.encode\` 编码，\`jwt.decode\` 解码验签。
- HS256 用对称密钥（简单），RS256 用公私钥（安全，适合微服务）。
- access token 短期（15 分钟 ~ 2 小时），refresh token 长期（7 天 ~ 30 天），组合实现无感刷新。
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
# schemes: 支持的算法列表，这里只用 bcrypt
# deprecated: 标记哪些算法已废弃（用于自动迁移）
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
if __name__ == "__main__":
    try:
        validate_password_strength("123")  # 太短
    except HTTPException as e:
        print(e.detail)  # 密码至少 8 位
    try:
        validate_password_strength("abcdefgh")  # 没数字
    except HTTPException as e:
        print(e.detail)  # 密码必须包含数字
    try:
        validate_password_strength("password1")  # 常见弱密码
    except HTTPException as e:
        print(e.detail)  # 密码太常见，请换一个
    # 合法密码
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
    if req.token in used_reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该重置链接已使用，请重新申请",
        )
    try:
        # 解码 token
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
    # 检查类型
    if payload.get("type") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="token 类型错误",
        )
    # 取邮箱，查用户
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
    fake_users_db[username]["hashed_password"] = pwd_context.hash(req.new_password)
    # token 加入黑名单，防止重放
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
    if req.email in email_index:
        raise HTTPException(400, "邮箱已注册")
    # 校验密码强度
    validate_password_strength(req.password)
    # 哈希密码
    hashed = pwd_context.hash(req.password)
    # 创建用户
    user = UserInDB(
        username=req.username,
        email=req.email,
        disabled=False,
        hashed_password=hashed,
    )
    fake_users_db[req.username] = user
    email_index[req.email] = req.username
    return User(**user.model_dump(exclude={"hashed_password"}))

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """登录"""
    # 查用户（支持用户名或邮箱登录）
    username = email_index.get(form_data.username, form_data.username)
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(401, "用户名或密码错误")
    # 验证密码（用 verify，不是 ==）
    if not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    # 检查账号是否激活
    if user.disabled:
        raise HTTPException(400, "账号已被禁用")
    # 哈希需要升级时自动升级
    if pwd_context.needs_update(user.hashed_password):
        user.hashed_password = pwd_context.hash(form_data.password)
    # 颁发 token
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

## 十三、本章小结

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

## 二、为什么需要授权模型

最朴素的授权是"写死在代码里"：

\`\`\`python filename="反面教材"
@app.delete("/articles/{id}")
async def delete_article(id: int, current_user: User = Depends(get_current_user)):
    if current_user.username != "alice":  # 写死 alice
        raise HTTPException(403)
    ...
\`\`\`

这有几个问题：

1. **改权限要改代码**：alice 升职了不负责删文章了，bob 接手，要改代码重新部署。
2. **没法批量管理**：100 个管理员，每个人都要 if 一次。
3. **没法动态调整**：业务说"周末临时给某个用户删文章权限"，代码改不动。

RBAC 把"用户"和"权限"中间加一层"角色"：

\`\`\`txt
用户 -> 角色 -> 权限
alice -> admin -> (delete_article, edit_article, view_article)
bob   -> editor -> (edit_article, view_article)
carol -> viewer  -> (view_article)
\`\`\`

调权限时只要改"用户-角色"或"角色-权限"的映射，代码完全不动。这就是 RBAC 的核心价值。

## 三、RBAC 三层模型

### 第一层：用户-角色（User-Role）

一个用户可以有多个角色。比如 alice 既是 admin 又是 editor。这种关系通常存数据库表：

\`\`\`txt
table: user_roles
| user_id | role |
|---------|-------|
| 1       | admin |
| 1       | editor|
| 2       | editor|
\`\`\`

### 第二层：角色-权限（Role-Permission）

每个角色有哪些权限：

\`\`\`txt
table: role_permissions
| role   | permission      |
|--------|-----------------|
| admin  | article:delete  |
| admin  | article:edit    |
| admin  | article:view    |
| editor | article:edit    |
| editor | article:view    |
| viewer | article:view    |
\`\`\`

### 第三层：权限-资源（Permission-Resource）

权限粒度可以再细：editor 能编辑所有文章，还是只能编辑自己写的？这就是"资源所有权"——下一节讲。

### 退化模型：直接用户-权限

小项目可以省去角色层，直接给用户配权限。但失去了"批量管理"的便利。除非用户极少，否则建议保留角色层。

## 四、用枚举定义角色

Python 的 \`enum\` 模块适合定义固定角色集：

\`\`\`python filename="demo1_role_enum.py"
# 用枚举定义角色
from enum import Enum

# 继承 str 和 Enum，这样 Role.ADMIN 直接等于 "admin" 字符串
# 方便存数据库和 JSON 序列化
class Role(str, Enum):
    ADMIN = "admin"      # 管理员：最高权限
    EDITOR = "editor"    # 编辑：能写能改，不能删
    VIEWER = "viewer"    # 访客：只能看

# 角色到权限的映射
# 用 set 方便做"是否包含"判断
ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {
        "article:view",
        "article:create",
        "article:edit",
        "article:delete",
        "user:manage",
    },
    Role.EDITOR: {
        "article:view",
        "article:create",
        "article:edit",
    },
    Role.VIEWER: {
        "article:view",
    },
}

# 测试
print(Role.ADMIN == "admin")  # True，因为继承了 str
print("article:delete" in ROLE_PERMISSIONS[Role.ADMIN])    # True
print("article:delete" in ROLE_PERMISSIONS[Role.EDITOR])   # False

# 工具函数：检查角色是否有某权限
def has_permission(role: Role, permission: str) -> bool:
    """检查角色是否拥有某权限"""
    return permission in ROLE_PERMISSIONS.get(role, set())

print(has_permission(Role.ADMIN, "user:manage"))   # True
print(has_permission(Role.VIEWER, "article:edit")) # False
\`\`\`

**为什么用枚举**：

- 拼写错误在编译期就能发现（\`Role.ADMNI\` 会报错）。
- IDE 自动补全。
- 类型检查器（mypy）能校验。

## 五、基于角色的权限检查依赖

### Demo 2：用 Depends 实现角色检查

\`\`\`python filename="demo2_role_check.py"
# 基于角色的权限检查
from enum import Enum
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta, timezone

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "secret"
ALGORITHM = "HS256"

# ---------- 角色定义 ----------
class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

# ---------- 数据模型 ----------
class User(BaseModel):
    username: str
    role: Role

# ---------- 假数据库 ----------
fake_users_db = {
    "alice": User(username="alice", role=Role.ADMIN),
    "bob": User(username="bob", role=Role.EDITOR),
    "carol": User(username="carol", role=Role.VIEWER),
}

# ---------- 依赖函数 ----------

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
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

# ---------- 角色检查依赖工厂 ----------

# 关键技巧：写一个"返回依赖函数"的函数
# 这样可以在路由里声明需要的角色
def require_roles(*roles: Role):
    """
    角色检查依赖工厂
    用法：Depends(require_roles(Role.ADMIN, Role.EDITOR))
    """
    # 返回的是一个真正的依赖函数
    async def check_role(current_user: User = Depends(get_current_user)) -> User:
        # 检查当前用户角色是否在允许列表里
        if current_user.role not in roles:
            # 没权限，返回 403（不是 401）
            # 401 = 没登录；403 = 登录了但没权限
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要以下角色之一：{[r.value for r in roles]}",
            )
        return current_user
    # 返回依赖函数本身
    return check_role

# ---------- 路由 ----------

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 简化：任意用户名都能登录
    user = fake_users_db.get(form_data.username)
    if user is None:
        raise HTTPException(401, "用户不存在")
    # 把角色也写进 token，避免每次查库
    token = jwt.encode(
        {
            "sub": user.username,
            "role": user.role.value,
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/articles")
# 所有登录用户都能看
async def list_articles(current_user: User = Depends(get_current_user)):
    return {"articles": ["a1", "a2"], "user": current_user.username}

@app.post("/articles")
# 只有 ADMIN 和 EDITOR 能创建
async def create_article(current_user: User = Depends(require_roles(Role.ADMIN, Role.EDITOR))):
    return {"message": f"{current_user.username} 创建了文章"}

@app.delete("/articles/{id}")
# 只有 ADMIN 能删
async def delete_article(
    id: int,
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    return {"message": f"{current_user.username} 删除了文章 {id}"}

# 测试：
# 1. alice 登录，能创建、删除文章
# 2. bob 登录，能创建，不能删除（403）
# 3. carol 登录，不能创建（403），不能删除（403）
\`\`\`

**核心技巧**：\`require_roles\` 是一个**返回函数的函数**——叫"依赖工厂"。FastAPI 看到 \`Depends(require_roles(Role.ADMIN))\` 时：

1. 先调用 \`require_roles(Role.ADMIN)\`，得到 \`check_role\` 函数。
2. 把 \`check_role\` 作为依赖注入到路由。

这样我们就能在每个路由声明"需要哪些角色"，比硬编码 if 优雅得多。

## 六、基于权限的细粒度控制

角色是粗粒度（"是管理员"），权限是细粒度（"能删文章"）。把角色换成权限检查，更灵活：

### Demo 3：基于权限的检查

\`\`\`python filename="demo3_permission_check.py"
# 基于权限的细粒度控制
from enum import Enum
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Callable

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 角色和权限 ----------
class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {"article:view", "article:create", "article:edit", "article:delete", "user:manage"},
    Role.EDITOR: {"article:view", "article:create", "article:edit"},
    Role.VIEWER: {"article:view"},
}

# ---------- 用户模型 ----------
class User(BaseModel):
    username: str
    role: Role
    # 也可以直接给用户额外权限，绕过角色（高级用法）
    extra_permissions: set[str] = set()

    def has_permission(self, permission: str) -> bool:
        """检查用户是否有某权限（角色权限 + 额外权限）"""
        # 角色自带权限
        role_perms = ROLE_PERMISSIONS.get(self.role, set())
        # 加上额外权限
        return permission in role_perms or permission in self.extra_permissions

# ---------- 假数据库 ----------
fake_users_db = {
    "alice": User(username="alice", role=Role.ADMIN),
    "bob": User(username="bob", role=Role.EDITOR),
    "carol": User(username="carol", role=Role.VIEWER),
    # 特例：carol2 是 viewer，但额外给了 create 权限
    "carol2": User(username="carol2", role=Role.VIEWER, extra_permissions={"article:create"}),
}

# ---------- 依赖 ----------
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # 简化：假设 token 就是用户名
    user = fake_users_db.get(token)
    if user is None:
        raise HTTPException(401, "未登录")
    return user

def require_permission(permission: str):
    """权限检查依赖工厂"""
    async def check_permission(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要权限：{permission}",
            )
        return current_user
    return check_permission

# ---------- 路由 ----------
@app.get("/articles")
async def list_articles(current_user: User = Depends(require_permission("article:view"))):
    return {"articles": ["a1", "a2"]}

@app.post("/articles")
async def create_article(current_user: User = Depends(require_permission("article:create"))):
    return {"message": f"{current_user.username} 创建了文章"}

@app.delete("/articles/{id}")
async def delete_article(
    id: int,
    current_user: User = Depends(require_permission("article:delete")),
):
    return {"message": f"{current_user.username} 删除了文章 {id}"}

# 测试：
# carol2 是 viewer，但有额外 create 权限
# 能 GET /articles（view 权限角色自带）
# 能 POST /articles（create 是额外权限）
# 不能 DELETE /articles/1（delete 权限没有）
\`\`\`

**权限 vs 角色怎么选**：

- 角色少（3~5 个）、权限变化少 → 用角色检查（\`require_roles\`），代码简单。
- 角色多、权限要细粒度组合 → 用权限检查（\`require_permission\`），更灵活。
- 大型项目：通常权限检查为主，角色是权限的"打包"。

## 七、用装饰器实现权限检查

依赖注入是 FastAPI 原生方式，但有些人更喜欢装饰器风格。可以用一个装饰器包裹路由函数：

### Demo 4：装饰器风格的权限检查

\`\`\`python filename="demo4_decorator.py"
# 装饰器实现权限检查
from enum import Enum
from functools import wraps
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class User(BaseModel):
    username: str
    role: Role

fake_users_db = {
    "alice": User(username="alice", role=Role.ADMIN),
    "bob": User(username="bob", role=Role.EDITOR),
}

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user = fake_users_db.get(token)
    if user is None:
        raise HTTPException(401, "未登录")
    return user

# 装饰器：检查角色
def require_role(*roles: Role):
    """
    用法：
    @app.get("/admin")
    @require_role(Role.ADMIN)
    async def admin_panel(current_user: User = Depends(get_current_user)):
        ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if current_user.role not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"需要角色：{[r.value for r in roles]}",
                )
            # 调用原函数，把 current_user 传进去
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# ---------- 路由 ----------
@app.get("/admin")
@require_role(Role.ADMIN)
async def admin_panel(current_user: User):
    return {"message": f"欢迎管理员 {current_user.username}"}

@app.get("/editor")
@require_role(Role.ADMIN, Role.EDITOR)
async def editor_panel(current_user: User):
    return {"message": f"欢迎编辑 {current_user.username}"}

# 注意：装饰器写法在 FastAPI 里不如 Depends 优雅
# 因为 FastAPI 的依赖注入系统本身就是为了这种场景设计的
# 装饰器需要手动处理参数传递，容易出错
# 推荐还是用 Depends 依赖工厂的方式
\`\`\`

**为什么推荐 Depends 而不是装饰器**：

- Depends 自动出现在 OpenAPI 文档里，Swagger UI 能正确显示 401/403。
- 装饰器需要手动处理参数，FastAPI 的依赖解析器认不出装饰后的签名。
- Depends 可以组合（链式依赖），装饰器组合起来更难懂。

装饰器方案在 Flask/Django 里常见，但在 FastAPI 里**不推荐**，列在这里主要是为了对比和过渡。

## 八、资源所有权检查

权限检查解决"能不能做某类操作"，但有时候还要检查"能不能操作**这个具体资源**"。比如：editor 能编辑文章，但只能编辑自己写的。

### Demo 5：资源所有权检查

\`\`\`python filename="demo5_resource_ownership.py"
# 资源所有权检查
from enum import Enum
from fastapi import FastAPI, Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class User(BaseModel):
    username: str
    role: Role

class Article(BaseModel):
    id: int
    title: str
    content: str
    author: str  # 文章作者用户名

fake_users_db = {
    "alice": User(username="alice", role=Role.ADMIN),
    "bob": User(username="bob", role=Role.EDITOR),
    "carol": User(username="carol", role=Role.EDITOR),
}

# 假文章库
fake_articles_db: dict[int, Article] = {
    1: Article(id=1, title="FastAPI 入门", content="...", author="bob"),
    2: Article(id=2, title="JWT 实战", content="...", author="carol"),
    3: Article(id=3, title="RBAC 设计", content="...", author="bob"),
}

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user = fake_users_db.get(token)
    if user is None:
        raise HTTPException(401, "未登录")
    return user

# 工具函数：检查用户能否编辑某篇文章
def can_edit_article(user: User, article: Article) -> bool:
    """
    能编辑文章的条件（满足任一即可）：
    1. 是管理员
    2. 是这篇文章的作者
    """
    if user.role == Role.ADMIN:
        return True
    if user.username == article.author:
        return True
    return False

@app.get("/articles/{id}")
async def get_article(
    id: int,
    current_user: User = Depends(get_current_user),
):
    # 所有人都能看
    article = fake_articles_db.get(id)
    if article is None:
        raise HTTPException(404, "文章不存在")
    return article

@app.put("/articles/{id}")
async def update_article(
    id: int,
    title: str,
    content: str,
    current_user: User = Depends(get_current_user),
):
    article = fake_articles_db.get(id)
    if article is None:
        raise HTTPException(404, "文章不存在")
    # 所有权检查
    if not can_edit_article(current_user, article):
        # 403 而不是 404
        # 注意：如果不想暴露文章是否存在，可以统一返回 404
        # 但这里业务上编辑前用户应该先看到文章，所以 403 合理
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="你只能编辑自己写的文章",
        )
    # 更新
    article.title = title
    article.content = content
    return {"message": "更新成功", "article": article}

@app.delete("/articles/{id}")
async def delete_article(
    id: int,
    current_user: User = Depends(get_current_user),
):
    article = fake_articles_db.get(id)
    if article is None:
        raise HTTPException(404, "文章不存在")
    # 只有管理员能删
    if current_user.role != Role.ADMIN:
        raise HTTPException(403, "只有管理员能删文章")
    del fake_articles_db[id]
    return {"message": "已删除"}

# 测试：
# 1. alice（admin）能改任何文章、删任何文章
# 2. bob（editor）能改 id=1, 3（自己的），不能改 id=2（carol 的），不能删任何
# 3. carol（editor）能改 id=2，不能改 id=1, 3
\`\`\`

**关键点**：

- 资源所有权检查在路由函数里做，不放在依赖里——因为依赖拿不到路径参数 \`id\`。
- 404 vs 403 的选择：如果不想暴露资源存在性，统一返回 404；如果业务上用户已经能看到资源，403 更准确。
- 高级场景：把 \`can_edit_article\` 抽成独立函数，方便单测和复用。

## 九、实战：多角色用户管理系统

把前面所有片段合起来，做一个完整的多角色管理系统：

### Demo 6：完整 RBAC 系统

\`\`\`python filename="demo6_full_rbac.py"
# 完整的多角色用户管理系统（admin / editor / viewer）
# 运行：uvicorn demo6_full_rbac:app --reload

from enum import Enum
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError

app = FastAPI(title="RBAC 完整示例")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- 配置 ----------
SECRET_KEY = "secret-key-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- 角色与权限 ----------
class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

# 角色 -> 权限集合
ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {
        "user:view", "user:create", "user:update", "user:delete",
        "article:view", "article:create", "article:edit", "article:delete",
    },
    Role.EDITOR: {
        "article:view", "article:create", "article:edit",
    },
    Role.VIEWER: {
        "article:view",
    },
}

# ---------- 数据模型 ----------
class User(BaseModel):
    username: str
    role: Role
    disabled: bool = False

class UserInDB(User):
    hashed_password: str

class Article(BaseModel):
    id: int
    title: str
    content: str
    author: str

class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: Role

class ArticleCreateRequest(BaseModel):
    title: str
    content: str

# ---------- 假数据库 ----------
fake_users_db: dict[str, UserInDB] = {
    "admin1": UserInDB(
        username="admin1",
        role=Role.ADMIN,
        hashed_password=pwd_context.hash("adminpass"),
    ),
    "editor1": UserInDB(
        username="editor1",
        role=Role.EDITOR,
        hashed_password=pwd_context.hash("editorpass"),
    ),
    "viewer1": UserInDB(
        username="viewer1",
        role=Role.VIEWER,
        hashed_password=pwd_context.hash("viewerpass"),
    ),
}

fake_articles_db: dict[int, Article] = {
    1: Article(id=1, title="第一篇", content="内容1", author="editor1"),
}
article_id_counter = 2

# ---------- JWT 工具 ----------
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---------- 依赖函数 ----------

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 token 还原用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(401, "token 已过期")
    except JWTError:
        raise credentials_exception
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return User(**user.model_dump(exclude={"hashed_password"}))

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.disabled:
        raise HTTPException(400, "账号已被禁用")
    return current_user

def require_permission(permission: str):
    """权限检查依赖工厂"""
    async def check(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        role_perms = ROLE_PERMISSIONS.get(current_user.role, set())
        if permission not in role_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要权限：{permission}",
            )
        return current_user
    return check

def require_roles(*roles: Role):
    """角色检查依赖工厂"""
    async def check(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要角色：{[r.value for r in roles]}",
            )
        return current_user
    return check

# ---------- 路由：认证 ----------

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if user is None or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    if user.disabled:
        raise HTTPException(400, "账号已被禁用")
    token = create_access_token({
        "sub": user.username,
        "role": user.role.value,
    })
    return {"access_token": token, "token_type": "bearer"}

# ---------- 路由：用户管理（admin 才能操作）----------

@app.get("/users")
async def list_users(
    current_user: User = Depends(require_permission("user:view")),
):
    """查看所有用户（需要 user:view 权限）"""
    return [
        User(**u.model_dump(exclude={"hashed_password"}))
        for u in fake_users_db.values()
    ]

@app.post("/users")
async def create_user(
    req: UserCreateRequest,
    current_user: User = Depends(require_permission("user:create")),
):
    """创建用户（需要 user:create 权限，一般只有 admin）"""
    if req.username in fake_users_db:
        raise HTTPException(400, "用户名已存在")
    user = UserInDB(
        username=req.username,
        role=req.role,
        hashed_password=pwd_context.hash(req.password),
    )
    fake_users_db[req.username] = user
    return User(**user.model_dump(exclude={"hashed_password"}))

@app.delete("/users/{username}")
async def delete_user(
    username: str,
    current_user: User = Depends(require_permission("user:delete")),
):
    """删除用户"""
    if username not in fake_users_db:
        raise HTTPException(404, "用户不存在")
    # 防止管理员删自己
    if username == current_user.username:
        raise HTTPException(400, "不能删除自己")
    del fake_users_db[username]
    return {"message": f"已删除用户 {username}"}

# ---------- 路由：文章管理 ----------

@app.get("/articles")
async def list_articles(
    current_user: User = Depends(require_permission("article:view")),
):
    """查看所有文章"""
    return list(fake_articles_db.values())

@app.post("/articles")
async def create_article(
    req: ArticleCreateRequest,
    current_user: User = Depends(require_permission("article:create")),
):
    """创建文章，作者自动设为当前用户"""
    global article_id_counter
    article = Article(
        id=article_id_counter,
        title=req.title,
        content=req.content,
        author=current_user.username,
    )
    fake_articles_db[article_id_counter] = article
    article_id_counter += 1
    return article

@app.put("/articles/{id}")
async def update_article(
    id: int,
    req: ArticleCreateRequest,
    current_user: User = Depends(get_current_active_user),
):
    """更新文章：作者本人或管理员"""
    article = fake_articles_db.get(id)
    if article is None:
        raise HTTPException(404, "文章不存在")
    # 所有权检查：admin 或作者本人
    is_admin = current_user.role == Role.ADMIN
    is_author = article.author == current_user.username
    if not (is_admin or is_author):
        raise HTTPException(403, "只能编辑自己的文章")
    article.title = req.title
    article.content = req.content
    return article

@app.delete("/articles/{id}")
async def delete_article(
    id: int,
    current_user: User = Depends(require_permission("article:delete")),
):
    """删除文章：只有 admin 有 article:delete 权限"""
    if id not in fake_articles_db:
        raise HTTPException(404, "文章不存在")
    del fake_articles_db[id]
    return {"message": f"已删除文章 {id}"}

# ---------- 路由：个人信息 ----------

@app.get("/me")
async def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# 完整测试流程：
# 1. 用 admin1/adminpass 登录，能创建用户、删除用户、删文章
# 2. 用 editor1/editorpass 登录，能创建文章、改自己的文章，不能删文章、不能管理用户
# 3. 用 viewer1/viewerpass 登录，只能看文章，不能创建/修改/删除
# 4. admin1 创建一个新 editor 用户，登录后能编辑文章
\`\`\`

## 十、常见错误与避坑指南

1. **401 和 403 混用**：401 = 没登录或 token 失效；403 = 登录了但没权限。新手常把"没权限"也返回 401，让客户端误以为要重新登录。
2. **权限检查放前端**：前端隐藏按钮只是体验优化，**权限检查必须在后端**。前端代码能被任意篡改。
3. **角色硬编码在路由里**：\`if user.role != "admin"\` 写死，改权限要改代码。用依赖工厂或权限映射表。
4. **资源所有权检查遗漏**：只检查"是否能 edit"，忘了检查"是否能 edit **这篇**"。导致 editor 能改别人的文章。
5. **角色升级漏洞**：普通用户能调 \`POST /users\` 创建管理员。创建用户的接口必须检查调用者是否有 \`user:create\` 权限。
6. **角色信息不在 token 里**：每次验权限都要查库。把 role 写进 JWT，解码即拿，性能更好（但角色变更后老 token 仍带老角色，要权衡）。
7. **权限粒度太细或太粗**：太细（\`article:edit:title\`、\`article:edit:content\` 分开）维护爆炸；太粗（\`admin\` 一个权限管所有）失去灵活性。中等粒度（\`article:edit\`）最实用。
8. **管理员删自己**：导致系统没有管理员。删用户接口要检查"不能删自己"。
9. **没区分"资源不存在"和"没权限"**：返回 403 暴露了资源存在。安全敏感场景应统一返回 404。
10. **权限检查依赖查不到资源**：依赖函数拿不到路径参数，资源所有权检查必须在路由函数里做。

## 十一、本章小结

- 认证解决"你是谁"，授权解决"你能做什么"——本章聚焦授权。
- RBAC 三层模型：用户-角色-权限，角色是用户和权限中间的"打包"层。
- 用 \`enum\` 定义角色，用 \`dict[Role, set[str]]\` 维护角色-权限映射。
- **依赖工厂**（\`require_roles\`、\`require_permission\`）是 FastAPI 实现权限检查的优雅方式。
- 装饰器方案在 FastAPI 里不推荐，依赖注入更原生、对 OpenAPI 友好。
- 资源所有权检查在路由函数里做，因为依赖拿不到路径参数。
- 401 vs 403：401 没登录，403 没权限。
- 完整系统：admin/editor/viewer 三角色，覆盖用户管理 + 文章管理 + 所有权检查。

## 十二、整批章节回顾

第 10 批 4 章串起来就是完整的认证授权体系：

1. **OAuth2 密码模式**：定义登录流程，颁发 token。
2. **JWT**：token 的格式和验签机制，无状态、可过期。
3. **密码哈希**：密码怎么存才安全，bcrypt + passlib。
4. **RBAC**：拿到用户后怎么判断权限，角色-权限-资源三层模型。

把这 4 章的代码合起来，就是一个生产可用的认证授权骨架。后续章节会在此基础上加数据库、加测试、加部署，最终搭出完整的后端服务。
`
  }
];
