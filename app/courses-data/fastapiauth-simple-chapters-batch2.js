// =============================================================
// FastAPI 认证授权简化版 —— 第 2 批（实战与企业级 6 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：fas-（fastapiauth-simple）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 7 章：OAuth2PasswordBearer
  // ============================================================
  {
    id: "fas-oauth2",
    group: "实战与企业级",
    icon: "🔑",
    title: "OAuth2PasswordBearer 工作原理",
    content: `# OAuth2PasswordBearer 工作原理

## 一、它是什么

\`OAuth2PasswordBearer\` 是 FastAPI 提供的工具，用于从请求头提取 Token。

它做的事很简单：**从 \`Authorization: Bearer xxx\` 头里取出 Token**。

\`\`\`python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.get("/me")
def me(token: str = Depends(oauth2_scheme)):
    # token 就是从 Header 取出的 JWT
    return {"token": token}
\`\`\`

## 二、请求格式

客户端必须这样发请求：

\`\`\`
GET /me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
\`\`\`

如果没有 Token 或格式不对，FastAPI 自动返回 401。

## 三、tokenUrl 的作用

\`tokenUrl="login"\` 只是告诉 Swagger 文档「登录接口是 /login」，方便在文档里测试登录。

不影响实际逻辑，纯粹是给 Swagger UI 用的。

## 四、配合 Depends 使用

\`oauth2_scheme\` 本身就是一个可依赖的函数：

\`\`\`python
# 链式依赖
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    return payload

@app.get("/me")
def me(user = Depends(get_current_user)):
    return user
\`\`\`

## 五、Swagger UI 联动

用了 \`OAuth2PasswordBearer\`，Swagger 文档会出现「Authorize」按钮：

1. 点 Authorize
2. 输入账号密码（走 \`tokenUrl\` 指定的接口）
3. 拿到 Token 后，后续请求自动带上 \`Authorization\` 头

这就是为什么用 \`OAuth2PasswordBearer\` 而不是自己写 Header 解析。`,
    code: `# OAuth2PasswordBearer 工作原理演示
# 本脚本用纯 Python 模拟 FastAPI 中 OAuth2PasswordBearer 的内部行为
# 目标：理解它如何从 HTTP 请求头 Authorization 中提取 Bearer Token
# 不依赖 FastAPI，直接运行即可看到完整流程

# ===== 模拟 OAuth2PasswordBearer 的核心逻辑 =====
# FastAPI 中真正的实现位于 fastapi.security.oauth2 模块
# 它本质上是一个"可调用对象"（实现了 __call__ 方法的类实例）
# 因此可以被 Depends() 当作依赖来使用
class OAuth2PasswordBearer:
    """简化版 OAuth2PasswordBearer，演示原理

    真实版本会自动抛出 HTTPException(401) 并设置 WWW-Authenticate 头
    这里用 PermissionError 模拟，便于在纯 Python 环境中观察
    """

    # token_url 参数对应真实场景里的 tokenUrl="login"
    # 它不会影响 Token 校验逻辑，只是告诉 Swagger UI：
    # "用户登录获取 Token 的接口地址是 /login"
    # 这样 Swagger 文档页面的"Authorize"按钮才知道点击后该把账号密码提交到哪里
    def __init__(self, token_url: str):
        # 保存 tokenUrl，后续 Swagger UI 渲染时会读取这个属性
        self.token_url = token_url
        # 这个字段会被 Swagger 用来显示登录接口

    # 实现 __call__ 让实例变成"可调用对象"
    # FastAPI 在执行依赖时会调用 oauth2_scheme(authorization=...)，
    # 真实版本中 authorization 由 Starlette 的 Request 对象提供
    # 这里通过参数显式传入，便于离线演示
    def __call__(self, authorization: str = "") -> str:
        """从 Authorization 头提取 Token

        参数:
            authorization: HTTP 请求头 Authorization 的值，形如 "Bearer xxx"
        返回:
            提取出的 Token 字符串
        异常:
            PermissionError: 当缺少头部或格式错误时抛出（真实场景为 HTTPException 401）
        """
        # 第一步：检查请求头是否存在
        # 没有 Authorization 头意味着客户端未携带凭据，应直接拒绝
        if not authorization:
            # 没有 Authorization 头，返回 401
            # 真实 FastAPI 会自动返回 401 + WWW-Authenticate: Bearer
            print("[OAuth2] 缺少 Authorization 头 → 401")
            raise PermissionError("未提供认证信息")

        # 第二步：解析 "Bearer xxx" 格式
        # OAuth2 规范要求使用 Bearer 方案，即 "Bearer <token>" 这种固定写法
        # split(" ", 1) 表示最多切一次，避免 Token 本身含空格被错误切分
        parts = authorization.split(" ", 1)
        # 校验切分后正好是两部分，且第一部分（方案名）忽略大小写后必须是 bearer
        # 用 lower() 是为了兼容 "bearer"、"BEARER"、"Bearer" 等写法
        if len(parts) != 2 or parts[0].lower() != "bearer":
            print(f"[OAuth2] 格式错误: {authorization} → 401")
            raise PermissionError("认证格式错误，应为 'Bearer <token>'")

        # 第三步：取出 Token 并返回
        # parts[1] 就是真正的 Token 字符串（通常是 JWT）
        token = parts[1]
        # 打印时只显示前 20 个字符，避免日志过长，也避免泄露完整 Token
        print(f"[OAuth2] 提取到 Token: {token[:20]}...")
        return token


# 创建实例（相当于 oauth2_scheme）
# 在 FastAPI 项目中通常会写成 oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
# 然后在路由里通过 Depends(oauth2_scheme) 注入
oauth2_scheme = OAuth2PasswordBearer(token_url="login")
# 打印实例信息，验证 tokenUrl 已被正确保存
print(f"OAuth2 实例: tokenUrl={oauth2_scheme.token_url}")
# 强调 tokenUrl 的作用仅限于文档显示，不参与实际 Token 校验
print("(tokenUrl 只用于 Swagger 文档显示登录接口)")
print()

# ===== 测试不同请求场景 =====
# 通过几个典型用例展示 oauth2_scheme 的行为
# 每个用例用 try/except 捕获 PermissionError，模拟 401 响应

print("=== 1. 正常请求 ===")
# 模拟客户端发送标准 Bearer Token
# "eyJhbGciOiJIUzI1NiJ9" 是真实 JWT header 段 base64 编码后的样子
try:
    token = oauth2_scheme(authorization="Bearer eyJhbGciOiJIUzI1NiJ9.xxx.yyy")
    print(f"返回 Token: {token}")
except PermissionError as e:
    print(f"失败: {e}")

print()
print("=== 2. 缺少 Authorization 头 ===")
# 模拟客户端未带任何认证信息（如未登录直接访问受保护接口）
try:
    token = oauth2_scheme(authorization="")
    print(f"返回 Token: {token}")
except PermissionError as e:
    print(f"失败: {e}")

print()
print("=== 3. 格式错误（不是 Bearer 开头）===")
# 模拟使用了其他认证方案（如 Basic），但服务器只接受 Bearer
try:
    token = oauth2_scheme(authorization="Basic xxx")
    print(f"返回 Token: {token}")
except PermissionError as e:
    print(f"失败: {e}")

print()
print("=== 4. 配合依赖链（模拟 get_current_user）===")
# 真实场景中，oauth2_scheme 通常作为 get_current_user 的子依赖
# 形成依赖链：路由 → get_current_user → oauth2_scheme
# FastAPI 会按依赖顺序依次解析，最终把 Token 解析出的用户对象传给路由

# 模拟 JWT 校验
# 真实场景用 jose.jwt.decode 解码并验证签名、过期时间
# 这里只做简单判断：以 "eyJ" 开头视为合法 JWT（因为 JWT header 段 base64 后通常以此开头）
def decode_token(token: str) -> dict:
    """简化版 JWT 解码

    参数:
        token: 从请求头提取出的 Token 字符串
    返回:
        解码后的 payload 字典；非法 Token 返回 None
    """
    if token.startswith("eyJ"):
        # 模拟解码出的用户信息
        # sub（subject）是 JWT 标准声明，通常存用户唯一标识
        return {"sub": "1", "username": "alice", "role": "admin"}
    return None

# 模拟 Depends
# FastAPI 中 Depends(func) 不是立即调用 func，而是返回一个"依赖标记"
# 框架在处理请求时再真正执行该依赖，并把结果注入到函数参数
# 这里只是返回一个字典占位，保持函数签名可读，不会真正被使用
# 注意：Depends 必须在 get_current_user 之前定义！
# 因为 Python 的默认参数值在 def 语句执行时就会立即求值，
# 而不是在函数调用时才求值。如果把 Depends 写在下面，
# 执行到 def get_current_user(token=Depends(...)) 时会报 NameError。
def Depends(func):
    return {"__dep__": func}

# get_current_user 是认证核心依赖
# 真实签名是 def get_current_user(token: str = Depends(oauth2_scheme))
# 这里为了能在纯 Python 中调用，把默认值改为通过参数显式传入
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """从 Token 解析用户

    参数:
        token: 由 oauth2_scheme 提取出的 Token
    返回:
        解析出的用户信息字典
    异常:
        Token 解码失败时抛 PermissionError（真实场景为 HTTPException 401）
    """
    payload = decode_token(token)
    # 解码失败说明 Token 非法或被篡改，必须拒绝
    if not payload:
        raise PermissionError("Token 无效")
    return payload

# 测试完整链路
# 模拟一次真实请求：客户端带 Authorization 头访问 /me 接口
print("请求: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.xxx.yyy")
# 第一步：oauth2_scheme 从请求头提取 Token
token = oauth2_scheme(authorization="Bearer eyJhbGciOiJIUzI1NiJ9.xxx.yyy")
# 第二步：get_current_user 用 Token 解析出用户对象
user = get_current_user(token)
# 第三步：路由函数拿到 user，返回给客户端
print(f"当前用户: {user}")
`,
  },

  // ============================================================
  // 第 8 章：登录接口实现
  // ============================================================
  {
    id: "fas-login",
    group: "实战与企业级",
    icon: "🚪",
    title: "登录接口（Login）实现",
    content: `# 登录接口（Login）实现

## 一、登录接口做什么

1. 接收用户名 + 密码
2. 查数据库，验证密码
3. 验证通过 → 返回 JWT Token
4. 验证失败 → 返回 401

## 二、完整代码结构

\`\`\`python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
import datetime

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = "your-secret"
ALGORITHM = "HS256"

# 1. 用户数据库（实际用数据库）
fake_users = {
    "alice": {
        "username": "alice",
        "hashed_password": "...",  # 哈希后的密码
        "role": "admin",
    }
}

# 2. 登录接口
@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # 查用户
    user = fake_users.get(form.username)
    if not user:
        raise HTTPException(401, "用户名或密码错误")
    # 验证密码
    if not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(401, "用户名或密码错误")
    # 生成 Token
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

## 三、OAuth2PasswordRequestForm

FastAPI 提供的表单类，自动解析 \`application/x-www-form-urlencoded\` 格式：

- \`form.username\`：用户名
- \`form.password\`：密码

这是 OAuth2 标准要求登录用表单格式，不是 JSON。

## 四、返回格式

登录接口必须返回这个格式：

\`\`\`json
{
  "access_token": "eyJxxx...",
  "token_type": "bearer"
}
\`\`\`

这样 Swagger UI 才能自动识别并保存 Token。

## 五、安全注意

1. **错误信息模糊**：「用户名或密码错误」，不要说「用户不存在」
2. **密码哈希验证**：用 \`verify_password\`，不要对比明文
3. **HTTPS**：登录请求必须走 HTTPS，否则密码明文传输`,
    code: `# 登录接口实现演示
# 本脚本用纯 Python 模拟 FastAPI 登录接口的完整流程
# 涵盖：用户查询、密码校验、JWT 生成、标准返回格式
# 不依赖 FastAPI，可直接运行观察登录过程

import datetime
# datetime 用于计算 Token 过期时间戳
import secrets
# secrets 用于生成随机 Token（真实场景用 jose.jwt.encode 生成带签名的 JWT）

# ===== 配置 =====
# SECRET_KEY 是 JWT 签名密钥，生产环境必须从环境变量读取
# 一旦泄露，攻击者可以伪造任意 Token，等同于拿到 root 权限
SECRET_KEY = "my-secret-key"
# ALGORITHM 是 JWT 签名算法，HS256 是最常用的对称签名算法
# HmacSHA256：服务端用同一个密钥签名和验签
ALGORITHM = "HS256"

# ===== 模拟用户数据库 =====
# 实际项目密码应该是哈希值，这里简化用明文
# 真实场景用 passlib.hash.bcrypt 或 argon2 存储密码哈希
# 永远不要存明文密码，即使数据库泄露也不能直接拿到密码
users_db = {
    "alice": {"username": "alice", "password": "123456", "role": "admin"},
    "bob": {"username": "bob", "password": "654321", "role": "user"},
}

# ===== 模拟 JWT 生成（简化版）=====
# 真实场景用 jose.jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
# 这里只生成随机字符串占位，但保留 payload 的构造逻辑，便于理解
def create_access_token(data: dict, expires_minutes: int = 30) -> str:
    """生成 JWT Token（简化版，实际用 python-jose）

    参数:
        data: 要写入 JWT payload 的业务数据，如 {"sub": "alice", "role": "admin"}
        expires_minutes: Token 有效期（分钟），默认 30 分钟
    返回:
        生成的 Token 字符串
    """
    # 复制一份数据，避免修改原字典（防御式编程）
    payload = data.copy()
    # 写入 exp（expiration time）声明：Token 过期时间戳
    # JWT 标准规定 exp 是从 1970-01-01 起的秒数
    # 短过期时间能降低 Token 泄露带来的风险
    payload["exp"] = int((datetime.datetime.now(datetime.timezone.utc) +
                          datetime.timedelta(minutes=expires_minutes)).timestamp())
    # 实际：jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    # 简化：用 secrets 生成一个假 token
    # token_urlsafe 返回 URL 安全的 base64 字符串（无特殊字符，可直接放 Header）
    token = secrets.token_urlsafe(32)
    print(f"  [生成 Token] payload={payload}")
    print(f"  [生成 Token] token={token[:30]}...")
    return token

# ===== 模拟密码验证 =====
# 真实场景用 passlib.context.CryptContext.verify
# passlib 会自动处理盐值、哈希算法识别等细节
def verify_password(plain: str, hashed: str) -> bool:
    """验证密码（简化版，实际用 passlib）

    参数:
        plain: 用户提交的明文密码
        hashed: 数据库存储的密码哈希
    返回:
        密码是否匹配
    """
    # 简化版直接对比字符串，真实场景用 bcrypt/argon2 哈希比对
    # 注意：bcrypt 比对函数会自动处理盐值，不需要手动比较
    return plain == hashed

# ===== 模拟 OAuth2PasswordRequestForm =====
# FastAPI 提供的表单类，自动解析 application/x-www-form-urlencoded 请求体
# OAuth2 规范要求登录接口用表单格式而非 JSON，这是历史原因
# 字段：username、password（还有可选的 scope、grant_type 等）
class OAuth2PasswordRequestForm:
    """模拟 FastAPI 的表单解析"""
    # 构造时直接传入用户名密码，模拟 FastAPI 自动解析表单后的对象
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

# ===== 登录接口 =====
# 真实场景用 @app.post("/login") 装饰，参数 form 通过 Depends() 自动注入
# 返回值会被 FastAPI 序列化为 JSON 响应
def login(form: OAuth2PasswordRequestForm) -> dict:
    """登录接口逻辑

    参数:
        form: 包含 username、password 的表单对象
    返回:
        成功：{"access_token": ..., "token_type": "bearer"}
        失败：{"error": ..., "status": 401}（真实场景直接 raise HTTPException）
    """
    # 打印日志时密码用 * 遮蔽，避免明文出现在日志中（安全实践）
    print(f"[登录] 用户名: {form.username}, 密码: {'*' * len(form.password)}")

    # 1. 查用户
    # 真实场景查数据库：SELECT * FROM users WHERE username = ?
    # 这里用字典模拟，O(1) 查找
    user = users_db.get(form.username)
    if not user:
        # 用户不存在时返回 401
        # 注意：错误信息写"用户名或密码错误"而不是"用户不存在"
        # 这是为了防止攻击者通过枚举用户名探测系统中有哪些账号
        print("[登录] 用户不存在 → 401")
        return {"error": "用户名或密码错误", "status": 401}

    # 2. 验证密码
    # 真实场景用 passlib 的 verify 方法，自动处理哈希比对
    if not verify_password(form.password, user["password"]):
        # 密码错误同样返回"用户名或密码错误"，与用户不存在时返回相同信息
        # 这就是"模糊错误信息"原则，避免泄露系统内部状态
        print("[登录] 密码错误 → 401")
        return {"error": "用户名或密码错误", "status": 401}

    # 3. 生成 Token
    # 验证通过，把用户关键信息写入 JWT payload
    # sub（subject）是 JWT 标准声明，通常存用户唯一标识（用户名或 ID）
    # role 是业务字段，用于后续 RBAC 权限检查
    print("[登录] 验证通过，生成 Token")
    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
    })

    # 4. 返回标准格式
    # OAuth2 规范要求返回 {"access_token": ..., "token_type": "bearer"}
    # 字段名不能改，否则 Swagger UI 无法识别并自动保存 Token
    return {
        "access_token": token,
        "token_type": "bearer",
    }

# ===== 测试 =====
# 用三个用例覆盖登录接口的典型场景

print("=== 1. 正常登录 ===")
# alice 用正确账号密码登录，应返回 Token
result = login(OAuth2PasswordRequestForm("alice", "123456"))
print(f"返回: {result}")

print()
print("=== 2. 密码错误 ===")
# alice 输错密码，应返回 401
result = login(OAuth2PasswordRequestForm("alice", "wrong"))
print(f"返回: {result}")

print()
print("=== 3. 用户不存在 ===")
# 用不存在的用户名登录，应返回 401
# 错误信息与"密码错误"一致，防止枚举用户名攻击
result = login(OAuth2PasswordRequestForm("unknown", "123456"))
print(f"返回: {result}")

print()
print("✅ 返回格式必须是 {access_token, token_type}，Swagger 才能识别")
`,
  },

  // ============================================================
  // 第 9 章：get_current_user 实现
  // ============================================================
  {
    id: "fas-current-user",
    group: "实战与企业级",
    icon: "👤",
    title: "get_current_user 实现原理",
    content: `# get_current_user 实现原理

## 一、它做什么

\`get_current_user\` 是认证的**核心依赖**——从请求的 Token 解析出当前用户。

所有需要登录的接口都依赖它：

\`\`\`python
@app.get("/me")
def me(user = Depends(get_current_user)):
    return user  # user 就是当前登录用户
\`\`\`

## 二、实现步骤

1. 从请求头取 Token（\`oauth2_scheme\`）
2. 解码 JWT，拿到 payload
3. 从 payload 取用户标识（通常是 \`sub\`）
4. 查数据库，返回用户对象
5. 任何一步失败，抛 401

## 三、完整代码

\`\`\`python
from fastapi import HTTPException, status
from jose import jwt, JWTError

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # 1. 解码 JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Token 无效")

    # 2. 取用户标识
    username = payload.get("sub")
    if username is None:
        raise HTTPException(401, "Token 无效")

    # 3. 查数据库
    user = get_user_from_db(username)
    if user is None:
        raise HTTPException(401, "用户不存在")

    return user
\`\`\`

## 四、错误处理

所有失败情况都返回 401，但错误信息可以区分：

| 情况 | 错误信息 |
|---|---|
| Token 缺失 | \`oauth2_scheme\` 自动返回 401 |
| Token 签名错误 | "无法验证凭据" |
| Token 过期 | "Token 已过期" |
| 用户不存在 | "用户不存在" |

## 五、为什么用 Depends 而不是中间件

| 方式 | 优点 | 缺点 |
|---|---|---|
| Depends | 按需使用，灵活 | 每个接口要手动加 |
| 中间件 | 全局生效 | 所有接口都强制认证 |

有些接口（如 \`/login\`、\`/docs\`）不需要认证，用 Depends 更合适。`,
    code: `# get_current_user 实现演示
# 本脚本模拟从 Token 解析当前用户的完整流程
# 涵盖：Token 提取、JWT 解码、用户标识校验、数据库查询、错误处理
# 不依赖 FastAPI，可直接运行观察每一步的行为

import datetime
# datetime 仅用于辅助说明 Token 过期时间概念，本脚本简化处理不实际使用
import secrets
# secrets 用于生成随机字符串作为模拟 Token

# ===== 配置 =====
# SECRET_KEY 是 JWT 签名密钥，真实场景必须保密
SECRET_KEY = "my-secret-key"

# ===== 模拟用户数据库 =====
# 真实场景查询数据库，这里用字典模拟
# 字典 key 是 username，value 是用户信息
users_db = {
    "alice": {"username": "alice", "role": "admin", "id": 1},
    "bob": {"username": "bob", "role": "user", "id": 2},
}

# ===== 模拟 JWT 生成与校验 =====
# 真实场景用 jose.jwt.encode/decode，这里用字典映射模拟
# 用一个简单的字典模拟 token -> payload 的映射
# 这样不需要真实密钥也能演示 Token 的签发与校验流程
token_store = {}

def create_token(payload: dict) -> str:
    """生成 Token（简化版）

    参数:
        payload: 要写入 Token 的业务数据，如 {"sub": "alice", "role": "admin"}
    返回:
        生成的 Token 字符串
    """
    # 生成 16 字节的 URL 安全随机字符串作为 Token
    # 真实 JWT 是 base64 编码的三段式字符串（header.payload.signature）
    token = secrets.token_urlsafe(16)
    # 把 token 和 payload 的映射存起来，校验时查这个字典
    # 真实 JWT 是无状态的，校验时直接解码 Token 本身即可，不需要存储
    token_store[token] = payload
    return token

def decode_token(token: str) -> dict | None:
    """校验 Token（简化版）

    参数:
        token: 待校验的 Token 字符串
    返回:
        解码出的 payload 字典；Token 不存在或无效返回 None
    """
    # 真实场景：jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    # 会校验签名、过期时间等，失败抛 JWTError
    # 这里简化为查字典，Token 不存在即视为无效
    return token_store.get(token)

# ===== 模拟 OAuth2PasswordBearer =====
# 这一步对应真实场景的 oauth2_scheme 依赖
# 它负责从 HTTP 请求头 Authorization 中提取 Bearer Token
def extract_token(authorization: str) -> str:
    """从 Authorization 头提取 Token

    参数:
        authorization: HTTP Authorization 头的值，形如 "Bearer xxx"
    返回:
        提取出的 Token 字符串
    异常:
        PermissionError: 当缺少 Token 或格式错误时抛出
    """
    # 校验头部存在且以 "Bearer " 开头
    # startswith 比 split 更严格：必须以 "Bearer " 开头（注意空格）
    if not authorization or not authorization.startswith("Bearer "):
        raise PermissionError("401: 缺少 Token")
    # 去掉 "Bearer " 前缀，剩下就是 Token
    # replace 只会替换第一次出现的 "Bearer "（因为前面已保证以此开头）
    return authorization.replace("Bearer ", "")

# ===== get_current_user 核心实现 =====
# 这是认证的核心依赖，所有需要登录的接口都依赖它
# 它的返回值（用户对象）会被注入到路由函数的参数中
def get_current_user(authorization: str) -> dict:
    """从请求头解析当前用户

    参数:
        authorization: HTTP Authorization 头的值
    返回:
        解析出的用户信息字典
    异常:
        PermissionError: Token 无效、过期、用户不存在等情况抛出
    """
    print(f"[get_current_user] 处理请求")

    # 1. 提取 Token
    # 第一步：从 Authorization 头取出 Bearer 后面的 Token 字符串
    # 失败意味着客户端没按规范携带 Token，直接拒绝
    try:
        token = extract_token(authorization)
        # 只打印前 20 个字符，避免日志泄露完整 Token
        print(f"  1. 提取 Token: {token[:20]}...")
    except PermissionError as e:
        print(f"  1. 失败: {e}")
        # 重新抛出，让调用方知道是 401 错误
        raise

    # 2. 解码 JWT
    # 第二步：用密钥解码 Token，拿到 payload
    # 真实场景会校验签名、过期时间，任一不满足都返回 None
    payload = decode_token(token)
    if not payload:
        # Token 无效可能是：被篡改、签名错误、已过期、被撤销
        # 真实场景会区分这些情况，返回不同错误信息
        print(f"  2. Token 无效或已过期 → 401")
        raise PermissionError("401: Token 无效")

    print(f"  2. 解码 payload: {payload}")

    # 3. 取用户标识
    # 第三步：从 payload 中取 sub（subject）字段
    # sub 是 JWT 标准声明，通常存用户唯一标识
    # 没有 sub 说明 Token 内容不合法，必须拒绝
    username = payload.get("sub")
    if not username:
        print(f"  3. Token 中无用户标识 → 401")
        raise PermissionError("401: Token 无效")

    print(f"  3. 用户标识: {username}")

    # 4. 查数据库
    # 第四步：用 username 查数据库，确认用户仍然存在
    # 这一步很重要：用户可能已被删除或禁用，但 Token 还没过期
    # 每次都查库能保证用户状态实时生效
    user = users_db.get(username)
    if not user:
        # Token 有效但用户不存在，可能是用户被删除后旧 Token 仍在使用
        print(f"  4. 用户不存在 → 401")
        raise PermissionError("401: 用户不存在")

    print(f"  4. 查到用户: {user}")

    # 5. 返回用户对象
    # 返回的用户对象会被 FastAPI 注入到路由函数的参数
    # 路由函数可以直接用 user["username"]、user["role"] 等字段
    return user

# ===== 测试 =====
# 用四个用例覆盖 get_current_user 的常见场景
# 每个用例用 try/except 捕获 PermissionError，模拟 401 响应

print("=== 1. 正常请求 ===")
# 先模拟登录拿 Token
# 真实场景：客户端先调 /login 拿到 Token，再带 Token 访问 /me
token = create_token({"sub": "alice", "role": "admin"})
# 模拟客户端把 Token 放进 Authorization 头
user = get_current_user(f"Bearer {token}")
print(f"返回: {user}")

print()
print("=== 2. 缺少 Authorization 头 ===")
# 模拟客户端未带认证信息直接访问受保护接口
try:
    user = get_current_user("")
except PermissionError as e:
    print(f"失败: {e}")

print()
print("=== 3. 无效 Token ===")
# 模拟客户端伪造了一个 Token（不在 token_store 中）
# 真实场景：Token 签名错误或被篡改
try:
    user = get_current_user("Bearer invalid-token")
except PermissionError as e:
    print(f"失败: {e}")

print()
print("=== 4. Token 格式错误 ===")
# 模拟客户端用了 Basic 认证方案，但服务器只接受 Bearer
try:
    user = get_current_user("Basic xxx")
except PermissionError as e:
    print(f"失败: {e}")

print()
print("✅ get_current_user 是认证核心，所有需要登录的接口都依赖它")
`,
  },

  // ============================================================
  // 第 10 章：RBAC 角色权限控制
  // ============================================================
  {
    id: "fas-rbac",
    group: "实战与企业级",
    icon: "👥",
    title: "RBAC 角色权限控制",
    content: `# RBAC 角色权限控制

## 一、RBAC 是什么

**RBAC（Role-Based Access Control）** 基于角色的访问控制。

核心思想：**用户 → 角色 → 权限**，不直接给用户配权限，而是通过角色间接配置。

\`\`\`
用户 alice → 角色 admin → 权限 [读, 写, 删]
用户 bob   → 角色 user  → 权限 [读]
\`\`\`

## 二、为什么用 RBAC

- **好管理**：批量授权，改角色权限就行
- **清晰**：一眼看出谁能干什么
- **可扩展**：加新角色不影响现有用户

## 三、在 FastAPI 里实现

最简单的方式：在 \`get_current_user\` 基础上再加一层角色检查。

\`\`\`python
from fastapi import HTTPException

def require_role(role: str):
    """生成一个检查角色的依赖"""
    def checker(user = Depends(get_current_user)):
        if user["role"] != role:
            raise HTTPException(403, "权限不足")
        return user
    return checker

# 使用
@app.get("/admin/users")
def list_users(admin = Depends(require_role("admin"))):
    return {"users": []}
\`\`\`

## 四、多角色支持

\`\`\`python
def require_roles(*roles):
    def checker(user = Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, "权限不足")
        return user
    return checker

@app.delete("/users/{id}")
def delete_user(user = Depends(require_roles("admin", "superadmin"))):
    ...
\`\`\`

## 五、更细粒度的权限

角色是粗粒度，权限是细粒度：

\`\`\`python
# 用户对象里加 permissions 字段
user = {
    "username": "alice",
    "role": "editor",
    "permissions": ["post:read", "post:write", "post:delete"]
}

def require_permission(perm: str):
    def checker(user = Depends(get_current_user)):
        if perm not in user["permissions"]:
            raise HTTPException(403, "无此权限")
        return user
    return checker
\`\`\`

## 六、RBAC vs ABAC

| 模型 | 基于什么 | 例子 |
|---|---|---|
| RBAC | 角色 | admin 能删用户 |
| ABAC \| 属性 | 作者本人能删自己的文章 |`,
    code: `# RBAC 角色权限控制演示
# 本脚本完整演示角色（粗粒度）+ 权限（细粒度）的检查流程
# 涵盖：用户数据结构、角色检查工厂、权限检查工厂、模拟接口调用
# 不依赖 FastAPI，可直接运行观察 RBAC 的判定过程

# ===== 模拟数据库 =====
# 每个用户记录包含：id、username、role（角色）、permissions（权限列表）
# role 是粗粒度分类：admin、user、editor 等
# permissions 是细粒度权限：如 "user:read" 表示查看用户权限
# 把权限直接挂在用户上，是为了演示方便；真实场景权限通过角色映射而来
users_db = {
    "alice": {"id": 1, "username": "alice", "role": "admin",
              "permissions": ["user:read", "user:write", "user:delete"]},
    "bob": {"id": 2, "username": "bob", "role": "user",
            "permissions": ["user:read"]},
    "carol": {"id": 3, "username": "carol", "role": "editor",
              "permissions": ["user:read", "user:write"]},
}

# ===== 模拟 get_current_user =====
# 真实场景这个函数从 Token 解析出当前用户
# 这里简化：直接用 username 模拟从 Token 解析用户
def get_current_user(username: str) -> dict:
    """简化版：直接用 username 模拟从 Token 解析用户

    参数:
        username: 用户名（模拟从 Token 解出的 sub 字段）
    返回:
        用户信息字典
    异常:
        PermissionError: 用户不存在时抛出（对应 401）
    """
    user = users_db.get(username)
    if not user:
        # 用户不存在说明 Token 里的 sub 字段无效
        raise PermissionError("401: 用户不存在")
    return user

# ===== 方式 1：角色检查（粗粒度）=====
# 这是一种"工厂模式"：require_role 是个高阶函数
# 调用 require_role("admin") 返回一个检查器 checker
# checker 接收 user 参数，判断角色是否符合要求
# 这样设计的好处：把"需要什么角色"和"实际检查"解耦
def require_role(role: str):
    """生成角色检查依赖

    参数:
        role: 需要的角色名，如 "admin"
    返回:
        checker 函数，接收 user 字典，校验角色是否匹配
    """
    # 内部函数形成闭包，捕获外层的 role 变量
    def checker(user: dict) -> dict:
        # 比对用户的角色和要求的角色
        # 不匹配抛 403（权限不足），区别于 401（未认证）
        # 401：不知道你是谁；403：知道你是谁，但你没权限
        if user["role"] != role:
            print(f"  [角色检查] 需要 {role}，实际 {user['role']} → 403")
            raise PermissionError(f"403: 需要 {role} 角色")
        print(f"  [角色检查] {user['username']} 是 {role} → 通过")
        return user
    return checker

# ===== 方式 2：权限检查（细粒度）=====
# 权限比角色更细：一个角色可能有多个权限
# 比如 editor 角色有 user:read 和 user:write，但没有 user:delete
def require_permission(perm: str):
    """生成权限检查依赖

    参数:
        perm: 需要的权限标识，如 "user:write"
    返回:
        checker 函数，接收 user 字典，校验权限是否包含
    """
    def checker(user: dict) -> dict:
        # 用 in 判断权限列表中是否包含目标权限
        # 权限命名约定："资源:操作"，如 "user:delete"、"post:write"
        if perm not in user["permissions"]:
            print(f"  [权限检查] 需要 {perm}，用户只有 {user['permissions']} → 403")
            raise PermissionError(f"403: 需要 {perm} 权限")
        print(f"  [权限检查] {user['username']} 有 {perm} → 通过")
        return user
    return checker

# ===== 模拟接口 =====
# 每个接口对应一个真实场景的路由函数
# 参数 user 通过 Depends 注入（这里手动传入）

def list_users(user: dict) -> dict:
    """所有登录用户都能访问

    参数:
        user: 当前登录用户（已经通过 get_current_user 注入）
    返回:
        用户列表响应
    """
    # 这里没做角色/权限检查，意味着只要登录就能访问
    print(f"  [接口] {user['username']} 查看用户列表")
    # 返回所有用户的用户名
    return {"users": list(users_db.keys())}

def delete_user(user: dict) -> dict:
    """只有 admin 能删除用户

    参数:
        user: 当前登录用户（需要先通过 require_role("admin") 检查）
    返回:
        删除结果
    """
    # 注意：调用方在传入 user 前已经经过角色检查
    print(f"  [接口] {user['username']} 删除用户")
    return {"deleted": True}

def edit_user(user: dict) -> dict:
    """有 user:write 权限就能编辑

    参数:
        user: 当前登录用户（需要先通过 require_permission("user:write") 检查）
    返回:
        编辑结果
    """
    print(f"  [接口] {user['username']} 编辑用户")
    return {"edited": True}

# ===== 测试 =====
# 用五个用例展示角色检查和权限检查的不同结果

print("=== 1. alice (admin) 删除用户 ===")
# alice 是 admin，应通过 require_role("admin") 检查
user = get_current_user("alice")
try:
    # 真实场景：delete_user(user = Depends(require_role("admin")))
    # 这里手动调用：先 require_role("admin") 生成 checker，再用 user 调用
    delete_user(require_role("admin")(user))
except PermissionError as e:
    print(f"  失败: {e}")

print()
print("=== 2. bob (user) 删除用户 ===")
# bob 是普通用户，不是 admin，应被拒绝（403）
user = get_current_user("bob")
try:
    delete_user(require_role("admin")(user))
except PermissionError as e:
    print(f"  失败: {e}")

print()
print("=== 3. carol (editor) 编辑用户（权限检查）===")
# carol 有 user:write 权限，应通过 require_permission("user:write") 检查
user = get_current_user("carol")
try:
    edit_user(require_permission("user:write")(user))
except PermissionError as e:
    print(f"  失败: {e}")

print()
print("=== 4. bob (user) 编辑用户（权限检查）===")
# bob 只有 user:read，没有 user:write，应被拒绝（403）
user = get_current_user("bob")
try:
    edit_user(require_permission("user:write")(user))
except PermissionError as e:
    print(f"  失败: {e}")

print()
print("=== 5. bob (user) 查看用户（所有人都能）===")
# list_users 不做角色/权限检查，只要登录就能访问
user = get_current_user("bob")
list_users(user)

print()
print("✅ RBAC: 用户 → 角色 → 权限，层级清晰，易于管理")
`,
  },

  // ============================================================
  // 第 11 章：Access + Refresh Token
  // ============================================================
  {
    id: "fas-refresh-token",
    group: "实战与企业级",
    icon: "🔄",
    title: "Access + Refresh Token 双 Token",
    content: `# Access + Refresh Token 双 Token 机制

## 一、为什么需要两个 Token

**Access Token** 短期有效（如 30 分钟），用于访问 API。
**Refresh Token** 长期有效（如 7 天），用于换取新的 Access Token。

| Token | 有效期 | 用途 |
|---|---|---|
| Access Token | 短（15-30 分钟） | 调用 API |
| Refresh Token | 长（7-30 天） | 换取新 Access Token |

## 二、为什么这么设计

**问题**：如果 Access Token 被盗，黑客能一直用直到过期。

**解决**：让 Access Token 很快过期（30 分钟），用 Refresh Token 续期。即使 Access Token 泄露，最多用 30 分钟。

**为什么 Refresh Token 更安全**：

1. Refresh Token 只在 \`/refresh\` 接口用，不频繁传输
2. Refresh Token 可以服务端存储，能主动撤销
3. Access Token 每次请求都传，泄露风险高，所以短命

## 三、完整流程

\`\`\`
1. 登录 → 返回 access_token (30分钟) + refresh_token (7天)
2. 客户端用 access_token 调 API
3. access_token 过期 → 客户端用 refresh_token 调 /refresh
4. /refresh 验证 refresh_token → 返回新的 access_token
5. 重复 2-4，直到 refresh_token 也过期 → 重新登录
\`\`\`

## 四、代码实现

\`\`\`python
@app.post("/login")
def login(form = Depends()):
    # 验证账号密码...
    return {
        "access_token": create_access_token(data),      # 30 分钟
        "refresh_token": create_refresh_token(data),    # 7 天
        "token_type": "bearer"
    }

@app.post("/refresh")
def refresh(refresh_token: str):
    # 校验 refresh_token
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(401, "无效的 refresh token")
    # 生成新的 access_token
    new_access = create_access_token({"sub": payload["sub"]})
    return {"access_token": new_access, "token_type": "bearer"}
\`\`\`

## 五、关键区别

在 payload 里加 \`type\` 字段区分两种 Token：

\`\`\`python
access_token payload: {"sub": "1", "type": "access", "exp": ...}
refresh_token payload: {"sub": "1", "type": "refresh", "exp": ...}
\`\`\`

防止拿 refresh_token 当 access_token 用。`,
    code: `# Access + Refresh Token 双 Token 机制演示
# 本脚本完整模拟登录、访问、刷新、过期、类型校验全流程
# 涵盖：双 Token 生成、类型区分、过期校验、刷新流程
# 不依赖 FastAPI，可直接运行观察双 Token 的工作机制

import datetime
# datetime 用于计算 Token 过期时间
import secrets
# secrets 用于生成 URL 安全的随机 Token 字符串

# ===== 配置 =====
# Access Token 有效期：30 分钟（短）
# 短有效期的目的是降低 Token 泄露后的风险窗口
ACCESS_TOKEN_EXPIRE_MINUTES = 30   # Access Token 30 分钟
# Refresh Token 有效期：7 天（长）
# 长有效期让用户不必频繁重新登录，提升体验
# 7 天是常见配置，也有用 14 天或 30 天的
REFRESH_TOKEN_EXPIRE_DAYS = 7      # Refresh Token 7 天

# ===== 模拟 Token 存储（实际用 JWT）=====
# 真实场景用 JWT：Token 本身就包含 payload，无状态、不需要存储
# 这里用字典模拟 token -> payload 的映射，便于演示
# token -> {user_id, type, expire}
token_store = {}

def create_token(user_id: int, token_type: str) -> str:
    """生成 Token（简化版，实际用 JWT）

    参数:
        user_id: 用户 ID，写入 payload 用于后续查用户
        token_type: Token 类型，"access" 或 "refresh"
    返回:
        生成的 Token 字符串
    """
    # 根据 Token 类型计算不同的过期时间
    # access 短命（30 分钟）：调用 API 时用，频繁传输，泄露风险高
    # refresh 长命（7 天）：只在 /refresh 接口用，传输少，相对安全
    if token_type == "access":
        # Access Token：分钟级过期
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    else:
        # Refresh Token：天级过期
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # 生成 16 字节 URL 安全随机字符串作为 Token
    # 真实 JWT 是 "header.payload.signature" 三段式，自带 payload
    token = secrets.token_urlsafe(16)
    # 把 Token 元信息存起来，校验时查这个字典
    # type 字段是关键：用来区分 access 和 refresh，防止混用
    token_store[token] = {
        "user_id": user_id,
        "type": token_type,
        "expire": expire.timestamp(),
    }
    return token

def verify_token(token: str, expected_type: str) -> dict | None:
    """校验 Token，检查类型和过期

    参数:
        token: 待校验的 Token 字符串
        expected_type: 期望的 Token 类型（"access" 或 "refresh"）
    返回:
        校验通过返回 Token 元信息字典；失败返回 None
    """
    # 第一步：Token 是否存在
    # 不存在说明 Token 是伪造的或已从存储中清除
    data = token_store.get(token)
    if not data:
        return None
    # 第二步：Token 类型是否匹配
    # 防止拿 refresh_token 当 access_token 用（反之亦然）
    # 这是双 Token 机制的重要安全措施
    if data["type"] != expected_type:
        print(f"  [校验] 类型错误: 期望 {expected_type}, 实际 {data['type']}")
        return None
    # 第三步：Token 是否过期
    # 用当前时间戳和 expire 比较
    # 真实 JWT 库会自动校验 exp 字段，过期抛 ExpiredSignatureError
    if datetime.datetime.now(datetime.timezone.utc).timestamp() > data["expire"]:
        print(f"  [校验] Token 已过期")
        return None
    return data

# ===== 模拟数据库 =====
# 用字典模拟用户表，key 是用户 ID
users_db = {1: {"id": 1, "username": "alice", "role": "admin"}}

# ===== 1. 登录接口 =====
# 登录成功后同时返回 access_token 和 refresh_token
# 客户端需要分别保存这两个 Token
def login(username: str, password: str) -> dict:
    """登录，返回双 Token

    参数:
        username: 用户名
        password: 密码
    返回:
        包含 access_token、refresh_token、token_type 的字典
    """
    print(f"[登录] {username}")
    # 简化：假设密码正确，不做校验
    # 用 next + 生成器表达式查找用户，找不到返回 None
    # 真实场景查数据库
    user = next((u for u in users_db.values() if u["username"] == username), None)
    if not user:
        return {"error": "用户不存在"}

    # 同时生成 access 和 refresh 两个 Token
    # access 用于日常 API 调用
    access = create_token(user["id"], "access")
    # refresh 用于换取新的 access Token
    refresh = create_token(user["id"], "refresh")

    print(f"  生成 access_token (30分钟): {access[:20]}...")
    print(f"  生成 refresh_token (7天)  : {refresh[:20]}...")

    # 返回标准格式：包含两个 Token
    # token_type 字段表示使用 Bearer 方案
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
    }

# ===== 2. 访问接口（用 access_token）=====
# 业务接口只接受 access_token，不接受 refresh_token
def get_profile(access_token: str) -> dict:
    """需要 access_token 的接口

    参数:
        access_token: 客户端传来的 access_token
    返回:
        用户信息或错误信息
    """
    print(f"[访问接口] /profile")
    # 校验 Token，期望类型为 access
    # 如果传 refresh_token 会因类型不匹配被拒绝
    data = verify_token(access_token, "access")
    if not data:
        # 校验失败：可能 Token 无效、过期或类型错误
        return {"error": "401: access_token 无效或过期"}

    # 用 user_id 查数据库拿到用户信息
    user = users_db[data["user_id"]]
    print(f"  当前用户: {user['username']}")
    return {"user": user}

# ===== 3. 刷新接口（用 refresh_token 换新 access_token）=====
# 当 access_token 过期时，客户端调这个接口换新的
# 不需要重新输入密码，只要 refresh_token 还有效
def refresh_token(refresh_tok: str) -> dict:
    """用 refresh_token 换新的 access_token

    参数:
        refresh_tok: 客户端传来的 refresh_token
    返回:
        包含新 access_token 的字典，或错误信息
    """
    print(f"[刷新接口] /refresh")
    # 校验 Token，期望类型为 refresh
    # 如果传 access_token 会因类型不匹配被拒绝
    data = verify_token(refresh_tok, "refresh")
    if not data:
        # refresh_token 也过期了，用户必须重新登录
        return {"error": "401: refresh_token 无效或过期"}

    # 用 refresh_token 中的 user_id 生成新的 access_token
    # 注意：不生成新的 refresh_token，沿用旧的
    # 一些实现会在刷新时同时轮换 refresh_token，进一步提升安全性
    new_access = create_token(data["user_id"], "access")
    print(f"  生成新的 access_token: {new_access[:20]}...")
    return {"access_token": new_access, "token_type": "bearer"}

# ===== 完整流程演示 =====
# 模拟真实使用场景：登录 → 访问 → 过期 → 刷新 → 再访问 → 误用

print("=== 1. 登录 ===")
# 第一步：用户登录，拿到双 Token
tokens = login("alice", "123456")
access = tokens["access_token"]
refresh = tokens["refresh_token"]

print()
print("=== 2. 用 access_token 访问接口 ===")
# 第二步：用 access_token 调用业务接口，应成功
result = get_profile(access)

print()
print("=== 3. 模拟 access_token 过期（手动删除）===")
# 第三步：模拟 access_token 过期
# 真实场景等 30 分钟自动过期，这里手动删除存储以模拟
del token_store[access]
result = get_profile(access)  # 会失败

print()
print("=== 4. 用 refresh_token 换新的 access_token ===")
# 第四步：access_token 失效后，用 refresh_token 换新的
new_tokens = refresh_token(refresh)
new_access = new_tokens["access_token"]

print()
print("=== 5. 用新 access_token 访问接口 ===")
# 第五步：用新拿到的 access_token 访问，应成功
result = get_profile(new_access)

print()
print("=== 6. 错误：用 refresh_token 当 access_token ===")
# 第六步：演示类型校验的作用
# 客户端误把 refresh_token 当 access_token 用，应被拒绝
# verify_token 会检测出类型不匹配，返回 None
result = get_profile(refresh)  # 类型不匹配

print()
print("✅ 双 Token: access 短命勤用，refresh 长命少用，安全 + 体验双赢")
`,
  },

  // ============================================================
  // 第 12 章：JWT 黑名单与 Logout
  // ============================================================
  {
    id: "fas-blacklist",
    group: "实战与企业级",
    icon: "🚫",
    title: "JWT 黑名单、Logout、多设备登录",
    content: `# JWT 黑名单、Logout、多设备登录

## 一、JWT 的注销难题

JWT 是无状态的，**一旦签发就无法撤销**——即使用户点「退出登录」，Token 在过期前依然有效。

如果 Token 被盗，用户改了密码也没用，旧 Token 照样能用。

## 二、解决方案：黑名单

服务端维护一个「已撤销 Token 列表」，每次校验时检查是否在黑名单里。

\`\`\`python
# 黑名单（实际用 Redis）
blacklist = set()

def logout(token: str):
    """登出：把 Token 加入黑名单"""
    blacklist.add(token)

def get_current_user(token: str = Depends(oauth2_scheme)):
    # 先检查黑名单
    if token in blacklist:
        raise HTTPException(401, "Token 已撤销")
    # 再正常校验
    payload = jwt.decode(token, ...)
    return user
\`\`\`

## 三、优化：存 Token ID 而非整个 Token

JWT payload 里加一个 \`jti\`（JWT ID），黑名单存 ID 即可：

\`\`\`python
def create_token(data: dict):
    payload = {
        "sub": data["sub"],
        "jti": str(uuid.uuid4()),  # 唯一 ID
        "exp": ...
    }
    return jwt.encode(payload, ...)

# 黑名单存 jti
blacklist = set()

def is_revoked(jti: str) -> bool:
    return jti in blacklist
\`\`\`

## 四、用 Redis 自动清理

黑名单不能无限增长。用 Redis 的过期时间，让黑名单条目在 Token 原本过期时自动删除：

\`\`\`python
import redis
r = redis.Redis()

def revoke_token(jti: str, expire_seconds: int):
    """加入黑名单，过期自动清理"""
    r.setex(f"blacklist:{jti}", expire_seconds, "1")

def is_revoked(jti: str) -> bool:
    return r.exists(f"blacklist:{jti}")
\`\`\`

## 五、多设备登录管理

给每个 Token 加 \`device_id\`，就能管理多设备：

\`\`\`python
def login(username, password, device_id):
    token = create_token({
        "sub": username,
        "device": device_id,  # 设备标识
    })
    return token

# 查询用户所有在线设备
def list_devices(user):
    return r.smembers(f"user_devices:{user.id}")

# 踢掉某个设备
def revoke_device(user, device_id):
    # 把该设备的所有 Token 加入黑名单
    tokens = r.smembers(f"device_tokens:{user.id}:{device_id}")
    for jti in tokens:
        revoke_token(jti, ...)
\`\`\`

## 六、改密码后全局失效

用户改密码时，把该用户所有 Token 都加入黑名单：

\`\`\`python
def change_password(user, new_password):
    # 1. 更新密码
    update_password(user, new_password)
    # 2. 撤销该用户所有 Token
    tokens = r.smembers(f"user_tokens:{user.id}")
    for jti in tokens:
        revoke_token(jti, ...)
\`\`\`

## 七、三种方案对比

| 方案 | 优点 | 缺点 |
|---|---|---|
| 短期 Token + 不撤销 | 简单，完全无状态 | 无法主动登出 |
| 黑名单 | 能登出 | 要存储，破坏无状态 |
| Token 版本号 \| 改密码全失效 | 每次要查库 |`,
    code: `# JWT 黑名单与 Logout 演示
# 本脚本模拟完整的登出、黑名单、多设备管理流程
# 涵盖：Token 生成（带 jti 和 device）、黑名单校验、登出、全局撤销
# 不依赖 FastAPI，可直接运行观察黑名单机制的工作过程

import secrets
# secrets 用于生成 Token 唯一 ID（jti）和 Token 字符串本身
import time
# time 用于获取当前时间戳，计算 Token 过期时间

# ===== 配置 =====
# Token 有效期 1 小时（3600 秒）
# 黑名单中的条目理论上只需要保留到 Token 原本过期时间，之后自动清理
TOKEN_EXPIRE = 3600  # Token 有效期 1 小时

# ===== 模拟存储 =====
# 真实场景用 Redis：高性能、支持自动过期（TTL）
# 这里用 Python 字典和集合模拟

# Token 主存储：token -> {user_id, jti, device, expire}
# 每个 Token 关联一个唯一的 jti（JWT ID），用于黑名单索引
token_store = {}
# 黑名单：存 jti（不存完整 Token，节省空间）
# 校验时只查 jti 是否在集合中即可，O(1) 复杂度
blacklist = set()
# 用户在线设备映射：user_id -> set of jti
# 用于多设备管理：查询用户所有在线 Token、批量撤销等
user_tokens = {}

# ===== 1. 生成 Token（带 jti 和 device）=====
# 比基础版本多了两个字段：jti（唯一 ID）和 device（设备标识）
# jti 是 JWT 标准声明，全称 JWT ID，用于唯一标识一个 Token
# device 用于多设备管理：web、mobile、desktop 等
def create_token(user_id: int, device: str = "web") -> str:
    """生成 Token，包含唯一 ID 和设备标识

    参数:
        user_id: 用户 ID
        device: 设备标识，默认 "web"
    返回:
        生成的 Token 字符串
    """
    # 生成 Token 唯一 ID（jti）
    # token_hex(8) 返回 16 个十六进制字符（8 字节）
    # jti 的作用：黑名单存 jti 而不是完整 Token，节省内存
    jti = secrets.token_hex(8)  # Token 唯一 ID
    # 生成 Token 字符串本身
    token = secrets.token_urlsafe(16)
    # 存储 Token 元信息
    token_store[token] = {
        "user_id": user_id,
        "jti": jti,
        "device": device,
        # 过期时间戳 = 当前时间 + 有效期
        "expire": time.time() + TOKEN_EXPIRE,
    }
    # 记录用户的所有 Token（用于多设备管理）
    # setdefault：如果 user_id 不在字典中，先初始化为空集合
    # 这样后续可以用 user_tokens[user_id] 直接访问，不会 KeyError
    user_tokens.setdefault(user_id, set()).add(jti)
    print(f"  [生成 Token] device={device}, jti={jti[:12]}...")
    return token

# ===== 2. 校验 Token（含黑名单检查）=====
# 比基础版本多了一步：检查 jti 是否在黑名单中
# 这一步让 JWT 也能被主动撤销，弥补了 JWT 无状态的缺陷
def verify_token(token: str) -> dict | None:
    """校验 Token，检查黑名单

    参数:
        token: 待校验的 Token 字符串
    返回:
        校验通过返回 Token 元信息字典；失败返回 None
    """
    # 第一步：Token 是否存在
    data = token_store.get(token)
    if not data:
        print("  [校验] Token 不存在")
        return None
    # 第二步：Token 是否过期
    if time.time() > data["expire"]:
        print("  [校验] Token 已过期")
        return None
    # 第三步：Token 是否已被撤销（在黑名单中）
    # 这是黑名单机制的核心：检查 jti 是否在 blacklist 集合中
    # 即使 Token 本身没过期，只要 jti 在黑名单里就视为无效
    if data["jti"] in blacklist:
        print(f"  [校验] Token 已被撤销（在黑名单中）")
        return None
    return data

# ===== 3. 登出（加入黑名单）=====
# 登出的本质：把当前 Token 的 jti 加入黑名单
# 之后该 Token 即使没过期也无法再使用
def logout(token: str):
    """登出：把 Token 加入黑名单

    参数:
        token: 要撤销的 Token 字符串
    """
    data = token_store.get(token)
    if not data:
        # Token 不存在，无需撤销
        return
    # 把 jti 加入黑名单集合
    blacklist.add(data["jti"])
    # 同时从用户的在线 Token 集合中移除
    # discard 不会抛 KeyError（不同于 remove），更安全
    user_tokens.get(data["user_id"], set()).discard(data["jti"])
    print(f"  [登出] jti={data['jti'][:12]}... 已加入黑名单")

# ===== 4. 撤销用户所有 Token（改密码/全设备登出）=====
# 用户改密码或主动"全设备登出"时调用
# 把该用户所有在线 Token 的 jti 都加入黑名单
def revoke_all_tokens(user_id: int):
    """撤销某用户的所有 Token

    参数:
        user_id: 要撤销所有 Token 的用户 ID
    """
    # 复制一份 jti 集合，避免修改迭代中的集合
    # .copy() 防止在迭代时修改集合导致 RuntimeError
    jtis = user_tokens.get(user_id, set()).copy()
    # 把每个 jti 都加入黑名单
    for jti in jtis:
        blacklist.add(jti)
    # 清空用户的在线 Token 集合
    user_tokens[user_id] = set()
    print(f"  [全局撤销] 用户 {user_id} 的 {len(jtis)} 个 Token 已全部撤销")

# ===== 模拟用户 =====
users_db = {1: {"id": 1, "username": "alice"}}

# ===== 完整流程演示 =====
# 模拟多设备登录、单设备登出、改密码全设备登出

print("=== 1. alice 在多个设备登录 ===")
# 演示多设备登录场景
print("Web 端登录:")
# 第一个设备：web 端
web_token = create_token(1, "web")
print("手机端登录:")
# 第二个设备：手机端
mobile_token = create_token(1, "mobile")
# 查看用户在线 Token 数量
print(f"  当前在线 Token 数: {len(user_tokens[1])}")

print()
print("=== 2. 用 web_token 访问 ===")
# 用 web 端 Token 访问，应成功
data = verify_token(web_token)
if data:
    print(f"  访问成功: 用户 {data['user_id']}, 设备 {data['device']}")

print()
print("=== 3. web 端登出 ===")
# 用户在 web 端点退出登录
logout(web_token)

print()
print("=== 4. 再用 web_token 访问 ===")
# 用已登出的 Token 访问，应失败（在黑名单中）
data = verify_token(web_token)
if not data:
    print("  访问失败: Token 已撤销")

print()
print("=== 5. 手机端仍可访问 ===")
# 手机端 Token 没被撤销，仍能正常使用
# 这就是多设备管理的价值：单设备登出不影响其他设备
data = verify_token(mobile_token)
if data:
    print(f"  访问成功: 用户 {data['user_id']}, 设备 {data['device']}")

print()
print("=== 6. 改密码：撤销所有 Token ===")
# 演示改密码场景：所有设备都会被踢下线
print("alice 修改了密码")
revoke_all_tokens(1)

print()
print("=== 7. 手机端也被踢下线 ===")
# 改密码后，手机端 Token 也被加入黑名单
data = verify_token(mobile_token)
if not data:
    print("  访问失败: Token 已撤销")

print()
print(f"  黑名单大小: {len(blacklist)}")
# 说明：黑名单不能无限增长
# 真实项目用 Redis 的 TTL（生存时间）机制：
# 加入黑名单时设置过期时间为 Token 原本过期时间
# Token 过期后黑名单条目自动删除，无需手动清理
print("  (实际项目用 Redis，Token 原过期时间到了自动清理黑名单)")

print()
print("✅ 黑名单让 JWT 也能主动撤销，多设备管理用 device 标识")
`,
  },
];
