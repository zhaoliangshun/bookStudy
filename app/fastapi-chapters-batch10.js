// =============================================================
// FastAPI 应用开发实战教程 - 第 10 批章节（认证与安全篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   37. auth-oauth2     : OAuth2 与密码模式
//   38. auth-jwt        : JWT 认证
//   39. auth-password   : 密码哈希与安全
//   40. auth-permission : 权限控制与 RBAC
//
// 技术栈：FastAPI 0.110+ / python-jose / passlib[bcrypt] / OAuth2
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"认证与安全"
// =============================================================

export const chapters = [
  // =========================================================
  // 第三十七章：OAuth2 与密码模式
  // =========================================================
  {
    id: "auth-oauth2",
    group: "认证与安全",
    icon: "🔑",
    title: "OAuth2 与密码模式",
    content: `

# OAuth2 与密码模式

## 一、先分清两个词：认证 vs 授权

很多人把"认证"和"授权"混着用，但它们回答的是两个不同的问题：

| 概念 | 英文 | 回答的问题 | 例子 |
|------|------|------------|------|
| 认证 | Authentication | **你是谁？** | 用账号密码登录，证明你是 alice |
| 授权 | Authorization | **你能做什么？** | alice 是不是管理员？能删文章吗？ |

记忆口诀：**AuthN 知道你是谁，AuthZ 决定你能干啥**（N=Who，Z=Zenith/许可）。

一个完整的安全链路是先认证（验明身份）再授权（检查权限）。本章先讲认证（怎么登录拿 token），下一章讲 JWT（token 长什么样），再讲密码哈希，最后讲授权（RBAC 权限）。

## 二、为什么不能每次请求都传账号密码

最原始的认证是 HTTP Basic Auth：每个请求的请求头都带 \`Authorization: Basic <base64(user:pass)>\`。这有两个致命问题：

1. **每次都传密码**：密码在网络/日志/缓存里到处留痕，泄露风险极高。
2. **无法撤销**：密码改了，但已发出的请求"已经认证过"——其实没法主动让某个会话失效。

更好的做法是：**登录一次，换一个临时凭证（token），之后请求都带 token**。token 有过期时间，能随时撤销，密码只在登录那一次传输。这就是 token 认证的核心思想。

\`\`\`txt filename="Token 认证流程"
1. 客户端 POST /login {username, password}      ← 只这一次传密码
2. 服务端校验密码正确，签发一个 token
3. 客户端把 token 存起来（localStorage / cookie）
4. 后续请求都带 Header: Authorization: Bearer <token>
5. 服务端验证 token 合法 → 认为你是登录用户
6. token 过期或被吊销 → 重新登录
\`\`\`

## 三、OAuth2 是什么

**OAuth2** 是一个**授权框架**（RFC 6749），定义了一套"让第三方应用代表用户访问资源"的标准流程。比如"用微信登录某 App"，那个 App 不需要你的微信密码，而是通过微信拿到一个 token 来访问你的微信资料。

OAuth2 定义了四种"授权模式"（Grant Type），对应不同场景：

| 模式 | 场景 | 谁持有密码 |
|------|------|------------|
| Authorization Code | 第三方 App 登录（最常用） | 用户在浏览器登录，App 拿 code 换 token |
| Implicit | 已废弃，单页应用历史方案 | — |
| Resource Owner Password | 用户高度信任的应用（自家 App） | 应用直接拿用户名密码 |
| Client Credentials | 机器对机器（服务间调用） | 客户端自己的凭证 |

> **注意**：OAuth2PasswordBearer 这个"密码模式"，只适合**你自己的第一方应用**（前后端都是你自己的），用户信任你的前端把账号密码交给它。第三方应用绝不该用这个模式。

## 四、OAuth2PasswordBearer：FastAPI 的认证入口

FastAPI 内置了 \`OAuth2PasswordBearer\`，它做两件事：

1. 声明"客户端怎么提交 token"——约定走 \`Authorization: Bearer <token>\` 请求头。
2. 提供一个**依赖**，从请求头里把 token 取出来；取不到就返回 401。

\`\`\`python filename="OAuth2 配置"
from fastapi.security import OAuth2PasswordBearer

# tokenUrl：客户端获取 token 的登录接口路径（用于 OpenAPI 文档的"Authorize"按钮跳转）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@app.get("/me")
def read_me(token: str = Depends(oauth2_scheme)):
    # oauth2_scheme 这个依赖会从请求头取出 token 字符串
    # 取不到（没带 Authorization 头）→ 自动返回 401
    return {"token": token}   # 此刻只是拿到了 token，还没验证它合不合法
\`\`\`

\`tokenUrl\` 不是真的路由定义，只是给 Swagger UI 的"Authorize"按钮指路：点它，会弹出登录框，提交到这个 URL 换 token。真正的 \`/auth/login\` 路由还得你自己写。

## 五、OAuth2PasswordRequestForm：标准登录表单

OAuth2 规范规定，密码模式的登录请求用 **表单格式**（\`application/x-www-form-urlencoded\`），字段是 \`username\`、\`password\`、可选 \`scope\`。FastAPI 提供了 \`OAuth2PasswordRequestForm\` 帮你解析：

\`\`\`python filename="登录路由"
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["认证"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username / form.password 自动从表单解析
    # 1. 查用户
    user = fake_users_db.get(form.username)
    if not user:
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    # 2. 验密码（下一章详细讲哈希校验）
    if not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    # 3. 签发 token（下一章详细讲 JWT）
    access_token = create_access_token({"sub": user.username})
    # 4. 返回标准格式：access_token + token_type
    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

> 注意返回格式是 OAuth2 规范要求的：\`{"access_token": "...", "token_type": "bearer"}\`。Swagger UI 拿到后会自动在后续请求头加上 \`Authorization: Bearer <token>\`。

**为什么用表单而不是 JSON？** 这是 OAuth2 规范的历史决定（2012 年）。好处是和标准一致，Swagger UI 能直接测试。坏处是和 RESTful JSON 风格不一致。如果你想用 JSON 登录，可以自定义一个 Pydantic 模型替代 \`OAuth2PasswordRequestForm\`，但会失去 Swagger 自动测试的便利。

## 六、为什么不用 Basic Auth

| 维度 | Basic Auth | Bearer Token (OAuth2) |
|------|------------|----------------------|
| 每次传密码？ | 是 | 否，只传 token |
| 撤销 | 难（改密码才能让所有人失效） | 易（token 加黑名单或等过期） |
| 有效期 | 永久（等于密码有效期） | 短期（如 30 分钟） |
| 暴露面 | 密码在每次请求出现 | token 在每次请求出现，但密码只在登录 |
| HTTPS 必需 | 必须（base64 不是加密） | 必须 |

结论：**Basic Auth 只用于内部/调试接口**，面向用户的 API 一律用 Bearer Token。

## 七、JWT vs Session 对比

拿到 token 后，服务端怎么知道它合法？两种思路：

| 方案 | 服务端存什么 | 验证方式 | 优点 | 缺点 |
|------|--------------|----------|------|------|
| Session（有状态） | 内存/Redis 存 \`{token: user_id}\` | 查表 | 能立即吊销 | 多实例要共享 session 存储 |
| JWT（无状态） | 不存，token 自带签名 | 验签名 | 无状态、易扩展 | 吊销难（要黑名单） |

\`\`\`txt filename="Session 验证"
请求带 token → 服务端查 Redis {token: user_id} → 命中则认证通过
↑ 必须每台服务器都能访问同一个 Redis
\`\`\`

\`\`\`txt filename="JWT 验证"
请求带 JWT → 服务端用密钥验签 → 验签通过则信任 payload 里的 user_id
↑ 不查任何存储，签名保证了 token 不能伪造
\`\`\`

FastAPI 教程默认用 JWT（配合 OAuth2），因为无状态、易扩展。代价是"主动吊销"难做——解决方案是维护一个 token 黑名单（Redis），或用短期 access token + 长期 refresh token 模式（下一章讲）。

## 八、token 存哪里：前端 localStorage vs Cookie

| 存储方式 | JS 能读到吗 | 自动带请求？ | 防 CSRF？ | 防 XSS？ |
|----------|-------------|--------------|-----------|----------|
| localStorage | 能 | 否（要手动加 header） | 天然防 CSRF | XSS 能偷 |
| HttpOnly Cookie | 不能 | 是（浏览器自动带） | 需配 CSRF token | XSS 偷不到 |

主流选择：
- **localStorage + Bearer header**：最简单，SPA 常用。要严防 XSS（CSP、转义输出）。
- **HttpOnly Cookie + SameSite**：浏览器自动带，防 XSS 偷 token，但要防 CSRF（用 SameSite=Strict 或 CSRF token）。

两种都能用，没有绝对优劣，看你更怕 XSS 还是 CSRF。

## 九、完整 OAuth2 登录骨架

\`\`\`python filename="完整登录骨架"
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 假用户库（实际用数据库 + 哈希密码）
fake_users_db = {
    "alice": {"username": "alice", "hashed_password": "...", "disabled": False},
}

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form.username, form.password)
    if not user:
        # 注意：不要区分"用户不存在"和"密码错"，防枚举
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    if user["disabled"]:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

# 受保护接口：依赖 oauth2_scheme 取 token
@app.get("/me")
def me(token: str = Depends(oauth2_scheme)):
    # 这里只拿到了 token 字符串，下一步要解码验证（下一章 JWT）
    return {"token_received": token[:10] + "..."}
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| \`tokenUrl\` 写错 | Swagger 登录跳转 404 | 写成实际登录路由路径 |
| 登录用 JSON 而非表单 | \`OAuth2PasswordRequestForm\` 解析失败 | 用表单或自定义模型 |
| 区分"用户不存在/密码错" | 可枚举用户名 | 统一返回"用户名或密码错误" |
| 忘了 \`token_type: bearer\` | Swagger 不会自动带 Bearer 前缀 | 返回标准格式 |
| HTTP 明文传 token | token 被中间人截获 | 全站 HTTPS |
| 用密码模式做第三方登录 | 安全事故 | 第三方用 Authorization Code |
| token 永不过期 | 泄露后永久有效 | 设短期过期 + refresh token |

## 十一、小结

OAuth2 是授权框架，密码模式适合自家应用。\`OAuth2PasswordBearer\` 是 FastAPI 的认证入口，约定用 \`Authorization: Bearer <token>\` 头传 token。登录用表单格式，返回标准 \`{access_token, token_type}\`。但本章的 token 还只是个"占位字符串"，没讲它怎么生成和验证——下一章我们用 JWT 让 token 自带防伪签名。
`
  },

  // =========================================================
  // 第三十八章：JWT 认证
  // =========================================================
  {
    id: "auth-jwt",
    group: "认证与安全",
    icon: "🔐",
    title: "JWT 认证",
    content: `

# JWT 认证

## 一、JWT 是什么

**JWT（JSON Web Token）** 是一种紧凑的、自包含的 token 格式（RFC 7519）。它把一段 JSON 数据加上签名，编码成一个字符串，服务端只要持有密钥就能验证它没被篡改。

"自包含"是 JWT 最大的特点：token 自己就携带了"我是谁、什么时候过期"等信息，服务端**不需要查数据库或缓存**就能完成验证。这叫**无状态认证**——服务端不存 session，token 即凭证。

\`\`\`txt filename="JWT 长这样"
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsImV4cCI6MTczNTAwMDAwMH0.K7gNU1sP...
└────────── header ─────────┘ └──────── payload ────────┘ └── 签名 ──┘
\`\`\`

## 二、JWT 的三部分

JWT 由三段用 \`.\` 连接的 Base64URL 字符串组成：

\`\`\`txt filename="JWT 结构"
┌─────────────┬─────────────────────┬─────────────┐
│   header    │       payload       │  signature  │
├─────────────┼─────────────────────┼─────────────┤
│ 算法和类型  │ 实际数据（claims）  │ 防伪签名     │
│ {"alg":     │ {"sub":"alice",     │ HMACSHA256(  │
│  "HS256",   │  "exp":1735000000,  │  base64(header)+  │
│  "typ":"JWT"│  "role":"admin"}    │  "."+base64(payload)│
│ }           │                     │  , SECRET)   │
└─────────────┴─────────────────────┴─────────────┘
\`\`\`

- **header**：声明用的什么算法（\`alg\`）和 token 类型（\`typ: JWT\`）。
- **payload**：实际数据，每一项叫一个 **claim**（声明）。标准 claim 有 \`sub\`（主体，用户标识）、\`exp\`（过期时间）、\`iat\`（签发时间）、\`nbf\`（生效时间）、\`iss\`（签发者）等，你也可以放自定义字段如 \`role\`。
- **signature**：用密钥对 \`header.payload\` 算出的签名。**这是防伪的关键**——没有密钥就伪造不出合法签名。

> **重要认知**：JWT 的 payload 只是 Base64 编码，**不是加密**！任何人都能解码看到 payload 内容。所以**绝不要在 JWT 里放密码、身份证号等敏感信息**。签名只保证"不能篡改"，不保证"不能读取"。要加密内容得用 JWE，或干脆只放 user_id 这种不敏感的标识。

## 三、用 python-jose 创建和验证 token

\`\`\`bash filename="安装"
pip install "python-jose[cryptography]"
\`\`\`

\`\`\`python filename="jwt_utils.py - 创建和验证"
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

# 密钥：生产环境从环境变量读，绝不能硬编码、绝不能进 Git
SECRET_KEY = "CHANGE_ME_TO_A_LONG_RANDOM_STRING"
ALGORITHM = "HS256"          # HS256 = HMAC + SHA-256，对称加密
ACCESS_TOKEN_EXPIRE_MINUTES = 30   # access token 30 分钟过期

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """用 data 里的 claims 签发一个 JWT。"""
    to_encode = data.copy()   # 不要改原始 data
    # 1. 设置过期时间（exp claim）
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})   # exp 是标准 claim，验证时会自动检查
    # 2. 编码签名
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """验证签名并解码 payload。签名错或过期会抛 JWTError。"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # 签名不对 / 已过期 / 格式错 都会到这里
        return None
\`\`\`

### HS256 对称加密 vs RS256 非对称

- **HS256**：签发和验证用同一个密钥（对称）。简单，适合单体应用。
- **RS256/ES256**：私钥签发，公钥验证（非对称）。适合"认证服务签发，多个业务服务验证"的微服务架构——业务服务只持公钥，签不了 token 但能验。

## 四、HS256 对称加密的密钥管理

\`\`\`txt filename="密钥安全"
❌ 把 SECRET_KEY 写在代码里提交 Git
❌ 用 "secret" / "123456" 这种弱密钥
✅ 生成随机长密钥：openssl rand -hex 32
✅ 放环境变量 / 密钥管理服务（Vault、AWS Secrets Manager）
✅ 不同环境（开发/测试/生产）用不同密钥
\`\`\`

\`\`\`python filename="从环境变量读密钥"
import os
SECRET_KEY = os.environ["JWT_SECRET_KEY"]   # 没设就崩，强制配置
ALGORITHM = "HS256"
\`\`\`

## 五、get_current_user 依赖：解码 token 查用户

把"从请求头取 token → 解码 → 查用户"封装成一个依赖，所有受保护路由都依赖它：

\`\`\`python filename="认证依赖"
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 凭据异常：WWW-Authenticate 头告诉客户端用 Bearer
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="无法验证凭据",
    headers={"WWW-Authenticate": "Bearer"},   # 浏览器看到会触发登录框
)

def get_current_user(
    token: str = Depends(oauth2_scheme),   # 取 token
    db: Session = Depends(get_db),          # 取数据库
) -> User:
    # 1. 解码 token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    # 2. 取出 subject（用户标识，约定用 sub claim）
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    # 3. 查用户（token 合法但用户可能已被删除）
    user = db.execute(select(User).where(User.name == username)).scalar_one_or_none()
    if user is None:
        raise credentials_exception
    if user.disabled:
        raise HTTPException(status_code=403, detail="用户已被禁用")
    return user
\`\`\`

\`\`\`python filename="受保护路由"
@app.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    # 依赖链：oauth2_scheme → decode → 查库 → 返回 user
    # 走到这里，current_user 一定是已认证的有效用户
    return current_user

@app.get("/admin")
def admin_only(current_user: User = Depends(get_current_user)):
    # 这里只认证了身份，没检查权限——下一章讲 RBAC
    return {"msg": f"hello {current_user.name}"}
\`\`\`

## 六、token 过期时间设置

\`\`\`python filename="过期时间策略"
# access token：短期，如 15~30 分钟
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# refresh token：长期，如 7 天，用来换新的 access token
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(sub: str):
    return jwt.encode(
        {"sub": sub, "exp": datetime.now(timezone.utc) + timedelta(minutes=30), "type": "access"},
        SECRET_KEY, algorithm=ALGORITHM,
    )

def create_refresh_token(sub: str):
    return jwt.encode(
        {"sub": sub, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"},
        SECRET_KEY, algorithm=ALGORITHM,
    )
\`\`\`

| token 类型 | 有效期 | 用途 | 存储 |
|------------|--------|------|------|
| access token | 短（30 分钟） | 访问 API | 内存 / localStorage |
| refresh token | 长（7 天） | 换新的 access token | HttpOnly Cookie（更安全） |

## 七、Refresh Token 刷新流程

access token 短期过期会逼用户频繁登录，体验差。refresh token 解决这个问题：

\`\`\`txt filename="Refresh 流程"
1. 登录 → 拿到 access_token (30min) + refresh_token (7day)
2. access_token 过期 → 调 /auth/refresh 用 refresh_token 换新的 access_token
3. refresh_token 也过期 → 必须重新登录
4. 用户登出 → 把 refresh_token 加黑名单（吊销）
\`\`\`

\`\`\`python filename="刷新接口"
@router.post("/refresh")
def refresh(refresh_token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "refresh token 无效")
    # 检查是否在黑名单（登出过的）
    if is_token_revoked(refresh_token):
        raise HTTPException(401, "token 已吊销")
    username = payload["sub"]
    new_access = create_access_token(username)
    return {"access_token": new_access, "token_type": "bearer"}
\`\`\`

## 八、JWT 的"无法主动吊销"难题

因为 JWT 无状态、不查库，一旦签发就有效到过期。要主动吊销，常见方案：

\`\`\`txt filename="吊销方案对比"
方案 A：黑名单（Redis 存已吊销的 token id）
  → 每次验证多查一次 Redis，"无状态"优势打折
方案 B：短期 access token（15 分钟）
  → 不吊销也最多 15 分钟自动失效，损失可控
方案 C：版本号（user.token_version，改密码就 +1，token 里存 version）
  → 验证时比对 user.token_version，不符则失效
\`\`\`

实际项目通常组合：**短期 access token + 改密码时 bump token version + refresh token 黑名单**。

\`\`\`python filename="token version 方案"
# User 模型加一列
token_version: Mapped[int] = mapped_column(default=0)

# 签发时带上 version
def create_access_token(user: User):
    return jwt.encode(
        {"sub": user.name, "ver": user.token_version, "exp": ...},
        SECRET_KEY, algorithm=ALGORITHM,
    )

# 验证时比对
def get_current_user(token=Depends(oauth2_scheme), db=Depends(get_db)):
    payload = decode_token(token)
    user = ...  # 查库
    if user.token_version != payload.get("ver"):
        raise HTTPException(401, "token 已失效（请重新登录）")
    return user

# 改密码时
def change_password(user, ...):
    ...
    user.token_version += 1   # ★ 让所有旧 token 失效
    db.commit()
\`\`\`

> 这个方案让 JWT "看起来有状态"了（要查库比对 version），但只在关键操作时需要严格校验，普通请求可放宽。是性能与安全的折中。

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| payload 放密码 | token 被解码泄露密码 | 只放 user_id/sub 等不敏感字段 |
| 密钥硬编码进 Git | 密钥泄露，任何人能伪造 token | 环境变量 / 密钥管理服务 |
| \`exp\` 用本地时区 | 跨时区验证时间错乱 | 一律用 UTC（\`datetime.now(timezone.utc)\`） |
| 没设 \`exp\` | token 永不过期 | 必须设过期时间 |
| 不验签名直接解码 | 攻击者伪造 token | 用 \`jwt.decode\` 验签，不手动解 payload |
| \`alg\` 接受 \`none\` | 攻击者伪造无签名 token | \`algorithms=[ALGORITHM]\` 显式限定 |
| token 不吊销 | 改密码后旧 token 仍可用 | 用 token version 方案 |
| access token 过期太久 | 泄露风险大 | access 短期（15~30 分）+ refresh 长期 |

## 十、小结

JWT = header.payload.signature，签名保证不可篡改（但不加密，别放敏感信息）。用 python-jose 签发和验证，HS256 对称加密适合单体应用。\`get_current_user\` 依赖串起"取 token → 解码 → 查用户"链路。短期 access token + 长期 refresh token 平衡安全与体验。改密码时 bump token version 让旧 token 失效。下一章我们深入密码本身的哈希存储。
`
  },

  // =========================================================
  // 第三十九章：密码哈希与安全
  // =========================================================
  {
    id: "auth-password",
    group: "认证与安全",
    icon: "🔒",
    title: "密码哈希与安全",
    content: `

# 密码哈希与安全

## 一、为什么不能明文存密码

听起来是废话，但历史上无数大公司栽过跟头：明文存密码 = 把用户密码直接写在数据库里。一旦数据库被脱库（SQL 注入、备份泄露、内鬼），所有用户的密码瞬间曝光。而很多人多个网站用同一个密码——一个站泄露，用户的邮箱、网银全部沦陷。

\`\`\`txt filename="明文存储的灾难"
泄露 users 表 → 看到 alice 的密码是 "P@ssw0rd"
→ 攻击者拿这个密码去试 alice 的邮箱、支付宝、网银...
→ 因为 60% 的人跨站复用密码
\`\`\`

正确做法：**只存密码的哈希，不存明文**。用户登录时，把输入的密码同样哈希，比对哈希值。即便数据库泄露，攻击者也拿不到原始密码。

## 二、哈希 vs 加密：方向相反的两件事

| 操作 | 可逆吗 | 用途 | 例子 |
|------|--------|------|------|
| 加密（Encryption） | 可逆（用密钥解密） | 保护需要还原的数据 | AES 加密通信内容 |
| 哈希（Hash） | 不可逆 | 校验完整性、存密码 | bcrypt(密码) → 哈希值 |

**密码必须用哈希，不能用加密**。因为：
- 加密意味着你能解密回明文——意味着泄露密钥就能还原所有密码。
- 哈希不可逆——数据库里没有"明文"，连你自己都不知道用户原始密码。

\`\`\`txt filename="登录验证流程"
注册：hash_password("P@ssw0rd") → "$2b$12$..."  存进 db
登录：用户输入 "P@ssw0rd"
      hash 后 → "$2b$12$..."
      和 db 里的比对 → 一致则通过
↑ 全程不存明文，验证靠"同输入产生同输出"
\`\`\`

## 三、为什么 MD5/SHA 不能用来存密码

通用哈希（MD5、SHA-256）设计目标是**快**——文件校验、签名要快。但存密码要**慢**——慢到攻击者每秒只能试几次，暴力破解成本高到不可行。

\`\`\`txt filename="速度对比（单核每秒可算次数，量级近似）"
MD5        : ~10 亿次/秒   ← 攻击者爽歪歪
SHA-256    : ~5 亿次/秒    ← 还是太快
bcrypt     : ~100 次/秒    ← 暴力破解不现实
argon2     : ~50 次/秒     ← 现代推荐
\`\`\`

而且通用哈希不加"盐"（salt），相同密码哈希值相同，攻击者用**彩虹表**（预计算的"密码→哈希"对照表）能瞬间反查常见密码。bcrypt/argon2 内置盐，每次哈希结果都不同，彩虹表失效。

| 算法 | 类型 | 速度 | 加盐 | 抗 GPU | 适用 |
|------|------|------|------|--------|------|
| MD5 | 通用哈希 | 极快 | 手动 | 否 | 已废弃，仅文件校验 |
| SHA-256 | 通用哈希 | 快 | 手动 | 否 | 文件/签名 |
| PBKDF2 | 密码哈希 | 可调 | 内置 | 一般 | 兼容老系统 |
| bcrypt | 密码哈希 | 慢可调 | 内置 | 较好 | 密码存储（常用） |
| argon2 | 密码哈希 | 慢可调 | 内置 | 好 | 密码存储（推荐） |

> **关键认知**：密码哈希要"慢"，文件哈希要"快"。两者目的相反，绝不能混用。

## 四、bcrypt：加盐哈希的工业标准

**bcrypt** 是专为密码设计的哈希算法，特点：
- **内置盐**：每次哈希自动生成随机盐，无需自己管。
- **可调成本因子（cost factor）**：\`rounds\` 越大越慢，随硬件升级调大。
- **哈希值自带盐和算法信息**：一个字符串里包含了版本、cost、盐、哈希，验证时自动解析。

\`\`\`txt filename="bcrypt 哈希值结构"
$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 ↑  ↑  ↑____________________↑↑_______________________________↑
版本 cost    22 字符盐(Base64)        31 字符哈希
\`\`\`

- \`$2b$\`：bcrypt 版本（\`2a\`、\`2b\`、\`2y\` 都是 bcrypt 变体，\`2b\` 是修复后的标准）。
- \`12\`：成本因子，2^12 = 4096 轮。每加 1，时间翻倍。
- 后面是盐和哈希，拼在一起存。

**好处**：你不用单独存盐！哈希值本身就含盐，验证时 bcrypt 自动提取出来用。

## 五、passlib：Python 密码哈希的瑞士军刀

直接用 \`bcrypt\` 库也行，但 \`passlib\` 封装得更友好，且支持多算法切换。FastAPI 官方教程就用 passlib。

\`\`\`bash filename="安装"
pip install "passlib[bcrypt]"   # passlib + bcrypt 后端
\`\`\`

\`\`\`python filename="pwd_utils.py - 哈希与验证"
from passlib.context import CryptContext

# CryptContext 支持多算法，deprecated 标记老算法即将弃用
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """把明文密码哈希。每次结果不同（盐随机）。"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """校验明文密码是否和已存的哈希匹配。"""
    return pwd_context.verify(plain, hashed)
\`\`\`

\`\`\`python filename="行为演示"
>>> hash_password("secret")
'$2b$12$abc...xyz'   # 每次调用结果都不同（盐随机）
>>> hash_password("secret")
'$2b$12$def...uvw'   # 又不同
>>> verify_password("secret", '$2b$12$abc...xyz')
True    # 但 verify 仍能正确校验（盐从哈希里提取）
>>> verify_password("wrong", '$2b$12$abc...xyz')
False
\`\`\`

### passlib[bcrypt] vs 直接 bcrypt

| 维度 | passlib[bcrypt] | 直接 bcrypt |
|------|-----------------|--------------| 
| API | 简洁（hash/verify） | 略底层 |
| 多算法切换 | 改一行 schemes | 要换库 |
| 自动加盐 | 是 | 是 |
| 性能 | 略有封装开销 | 极致 |
| 推荐 | 多数项目用它 | 极致性能场景 |

## 六、密码强度校验

哈希只能保证"密码不泄露"，挡不住用户用 \`123456\` 这种弱密码。要在注册时做强度校验：

\`\`\`python filename="password_validator.py"
import re

def validate_password_strength(password: str) -> None:
    """校验密码强度，不达标抛 ValueError。"""
    if len(password) < 8:
        raise ValueError("密码至少 8 位")
    if not re.search(r"[A-Z]", password):
        raise ValueError("密码需包含大写字母")
    if not re.search(r"[a-z]", password):
        raise ValueError("密码需包含小写字母")
    if not re.search(r"\d", password):
        raise ValueError("密码需包含数字")
    if not re.search(r"[!@#$%^&*]", password):
        raise ValueError("密码需包含特殊字符")
    # 常见弱密码黑名单
    if password.lower() in {"password", "12345678", "qwerty"}:
        raise ValueError("密码过于常见")

# 在 Pydantic 模型里用 field_validator 集成
from pydantic import BaseModel, field_validator

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def check_strength(cls, v: str) -> str:
        validate_password_strength(v)
        return v
\`\`\`

> 也可以用 \`zxcvbn\`（Dropbox 出品）做更智能的强度评估，它考虑"密码是否是常见词组合"而不仅是字符种类。

## 七、完整注册 + 登录密码处理

\`\`\`python filename="auth.py - 注册与登录"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. 查重：邮箱不能重复
    if db.execute(select(User).where(User.email == user_in.email)).scalar_one_or_none():
        raise HTTPException(400, "邮箱已被注册")
    # 2. 创建用户，密码哈希后存
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),   # ★ 哈希
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.name == form.username)).scalar_one_or_none()
    # ★ 不要区分"用户不存在"和"密码错"，防枚举
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "用户名或密码错误")
    # 校验通过，签发 token
    token = create_access_token({"sub": user.name})
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

## 八、Timing Attack 与常量时间比较

\`verify_password\` 看似简单，但如果你自己实现"字符串比较"会掉进 **timing attack（时序攻击）** 陷阱：

\`\`\`python filename="错误：非常量时间比较"
def bad_verify(plain, hashed):
    computed = hash_password(plain)   # 假设固定盐
    # ❌ == 比较是短路：第一个字符不同就立刻返回 False
    # 攻击者通过比较耗时反推"前几位对不对"，逐字符猜出密码
    return computed == hashed
\`\`\`

攻击原理：\`==\` 比较字符串时，遇到第一个不同的字符就返回，耗时和"前缀匹配长度"成正比。攻击者反复尝试，通过响应时间差异逐字节猜出正确密码。

\`\`\`python filename="正确：常量时间比较"
import hmac

def good_verify(plain, hashed):
    computed = hash_with_fixed_salt(plain, hashed)
    # ✅ compare_digest 无论是否相等，比较时间恒定
    return hmac.compare_digest(computed, hashed)
\`\`\`

好消息：passlib 的 \`verify\` 和 bcrypt 内部已经用了常量时间比较，**你不用自己实现**。但如果你手写任何"比对敏感值"的逻辑，务必用 \`hmac.compare_digest\`，不要用 \`==\`。

## 九、密码重置流程（邮件 token）

用户忘了密码怎么办？不能"找回原密码"（你根本没存），而是"重置"：

\`\`\`txt filename="密码重置流程"
1. 用户在 /forgot-password 输入邮箱
2. 服务端生成一次性 reset_token（短期，如 15 分钟）
3. 发邮件：https://app.com/reset?token=xxx
4. 用户点链接 → /reset-password 提交新密码 + token
5. 服务端验 token → 改密码（哈希）→ 让所有旧 token 失效
\`\`\`

\`\`\`python filename="重置 token 实现"
def create_password_reset_token(email: str) -> str:
    """生成短期密码重置 token。"""
    return jwt.encode(
        {"sub": email, "type": "reset", "exp": datetime.now(timezone.utc) + timedelta(minutes=15)},
        SECRET_KEY, algorithm=ALGORITHM,
    )

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "reset":
        raise HTTPException(400, "重置链接无效或已过期")
    email = payload["sub"]
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        raise HTTPException(404, "用户不存在")
    # 校验新密码强度
    validate_password_strength(new_password)
    # 改密码
    user.hashed_password = hash_password(new_password)
    user.token_version += 1   # 让旧 access/refresh token 全部失效
    db.commit()
    return {"msg": "密码已重置，请用新密码登录"}
\`\`\`

**安全细节**：
- 重置邮件不提示"邮箱是否存在"（防枚举），统一显示"如果邮箱存在，重置链接已发送"。
- token 一次性使用，重置后即失效。
- 改密码后 bump token version，旧设备 token 全部失效。

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 明文存密码 | 脱库即裸奔 | bcrypt/argon2 哈希存储 |
| 用 MD5/SHA 存密码 | 彩虹表 + 暴力破解 | 用 bcrypt/argon2 |
| 自己拼盐 | 盐重复或太短 | 用 bcrypt 内置盐 |
| cost 因子太低（4） | 暴力破解变快 | 用 12+，随硬件升级调 |
| 登录区分"用户不存在/密码错" | 可枚举用户名 | 统一"用户名或密码错误" |
| 用 \`==\` 比对密码哈希 | timing attack | 用 \`hmac.compare_digest\` 或 passlib.verify |
| 重置邮件提示邮箱存在 | 枚举用户 | 统一提示 |
| 改密码不吊销旧 token | 旧设备仍可登录 | bump token_version |
| 密码不校验强度 | 弱密码泛滥 | 注册时校验长度/种类 |

## 十一、小结

密码必须用 bcrypt/argon2 这类"慢+加盐"的专门算法哈希存储，绝不明文、绝不用 MD5/SHA。passlib 简化了使用。注册时校验密码强度，登录时不区分用户名错误和密码错误防枚举。任何敏感值比对都用常量时间比较。密码重置走邮件 token 一次性流程，改密码后吊销旧 token。至此认证的"身份验证"部分完成，下一章讲"授权"——认证通过后，他到底能干什么。
`
  },

  // =========================================================
  // 第四十章：权限控制与 RBAC
  // =========================================================
  {
    id: "auth-permission",
    group: "认证与安全",
    icon: "🛡️",
    title: "权限控制与 RBAC",
    content: `

# 权限控制与 RBAC

## 一、从"你是谁"到"你能做什么"

认证（Authentication）回答"你是谁"，授权（Authorization）回答"你能做什么"。一个用户登录成功了，不代表他能为所欲为——alice 是普通用户，就不该能删别人的文章；只有 admin 才行。

权限控制的本质是：**在每个受保护的操作前，检查当前用户是否拥有所需权限**。怎么组织这套检查，就有不同的模型。本章讲最主流的 **RBAC（Role-Based Access Control，基于角色的访问控制）**。

\`\`\`txt filename="权限模型演进"
无权限：所有登录用户都能做所有事              ← 危险
ACL（访问控制列表）：每个资源直接列谁能访问    → 资源多时难维护
RBAC（基于角色）：用户→角色→权限，解耦        → 主流
ABAC（基于属性）：按属性动态判断              → 复杂场景
\`\`\`

## 二、RBAC：用户 → 角色 → 权限

RBAC 的核心是引入"角色"这一层，让权限和用户解耦：

\`\`\`txt filename="RBAC 三层关系"
用户(User)     角色(Role)      权限(Permission)
alice      →   admin       →   user:delete, post:publish, ...
bob        →   editor      →   post:publish, post:edit, ...
carol      →   user        →   post:create(自己的)

不直接给用户授予权限，而是授予角色。
角色变了，所有该角色用户的权限同步变化。
换岗只要改用户的角色，不用逐条改权限。
\`\`\`

为什么中间要有"角色"这一层？
- 一个系统可能有 1 万个用户、几百个操作。直接给每个用户配几百个权限 = 100 万条记录，维护噩梦。
- 引入角色（通常 5~10 个）后，用户只关联角色，权限关联角色，记录数降到几万。

## 三、角色定义与数据模型

\`\`\`python filename="roles.py - 角色常量"
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"       # 管理员：全部权限
    EDITOR = "editor"     # 编辑：发布/编辑所有文章
    USER = "user"         # 普通用户：只能操作自己的资源
    GUEST = "guest"       # 访客：只读
\`\`\`

\`\`\`python filename="models.py - User 加 role 字段"
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    hashed_password: Mapped[str] = mapped_column()
    role: Mapped[str] = mapped_column(default="user")   # 角色，字符串便于扩展
    disabled: Mapped[bool] = mapped_column(default=False)
\`\`\`

> 实际复杂系统会拆成 \`user_roles\`（多对多）+ \`role_permissions\`（多对多）+ \`permissions\` 三张表。这里简化为单字段 \`role\`，足够讲清机制。

## 四、权限校验依赖：RequiresRole

把"检查角色"封装成依赖，路由声明需要什么角色，依赖自动校验：

\`\`\`python filename="dependencies.py - 角色校验"
from fastapi import Depends, HTTPException, status

def require_role(required_role: Role):
    """工厂函数：生成一个检查指定角色的依赖。"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # 角色优先级：admin > editor > user > guest
        role_priority = {Role.GUEST: 0, Role.USER: 1, Role.EDITOR: 2, Role.ADMIN: 3}
        user_priority = role_priority.get(Role(current_user.role), -1)
        required_priority = role_priority[required_role]
        if user_priority < required_priority:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要 {required_role.value} 及以上权限",
            )
        return current_user
    return role_checker

# 便捷别名
require_admin = require_role(Role.ADMIN)
require_editor = require_role(Role.EDITOR)
\`\`\`

\`\`\`python filename="路由里用角色依赖"
@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    # 只有 admin 能删用户
    ...

@router.post("/posts/publish")
def publish_post(post_id: int, current_user: User = Depends(require_editor)):
    # editor 及以上能发布
    ...
\`\`\`

> 注意是 \`403 Forbidden\`（认证了但没权限）而不是 \`401 Unauthorized\`（没认证）。401 是"不知道你是谁"，403 是"知道你是谁但你不能干这个"。

## 五、依赖链：token → user → role check

FastAPI 的依赖可以层层嵌套，权限校验天然适合这种链式结构：

\`\`\`txt filename="依赖链"
oauth2_scheme (取 token)
   ↓
decode_token (验签解码)
   ↓
get_current_user (查库取用户)
   ↓
require_role (检查角色) ← 失败就 403
   ↓
路由函数 (执行业务)
\`\`\`

\`\`\`python filename="依赖链示意"
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "token 无效")
    user = db.get(User, ...)
    if not user:
        raise HTTPException(401, "用户不存在")
    return user

def require_role(role: Role):
    def checker(user: User = Depends(get_current_user)) -> User:   # ★ 依赖 get_current_user
        if user.role != role.value:
            raise HTTPException(403, "权限不足")
        return user
    return checker

@router.get("/admin/dashboard")
def admin_dashboard(admin: User = Depends(require_admin)):
    # require_admin → require_role(ADMIN) → checker → get_current_user → oauth2_scheme
    # 整条链任何一环失败都会抛对应异常
    return {"msg": "欢迎管理员"}
\`\`\`

FastAPI 会自动解析依赖图，不会重复执行——如果多个依赖都依赖 \`get_current_user\`，一次请求里它只执行一次并缓存结果。

## 六、OAuth2 Scopes：细粒度权限范围

OAuth2 还提供了 **scopes（权限范围）** 机制，比角色更细粒度。一个 token 可以声明它"拥有哪些 scope"——比如 \`read:posts\`、\`write:posts\`、\`admin:users\`。

\`\`\`txt filename="Role vs Scope"
Role：用户级别的属性（alice 是 admin），相对粗
Scope：token 级别的属性（这个 token 只能读文章），更细
↑ 同一个用户可以签发不同 scope 的 token：
  - 给第三方 App 的 token 只有 read scope
  - 自己用的 token 有 full scope
\`\`\`

FastAPI 用 \`Security\` 函数声明需要的 scope：

\`\`\`python filename="scopes 实现"
from fastapi import Security
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

# 在 OAuth2PasswordBearer 里声明本应用支持的所有 scopes（给 Swagger 展示）
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    scopes={
        "read:posts": "读取文章",
        "write:posts": "写入文章",
        "admin:users": "用户管理（管理员）",
    },
)

def get_current_user(
    security_scopes: SecurityScopes,    # 自动注入：本路由声明的 scopes
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "token 无效", headers={"WWW-Authenticate": "Bearer"})
    # 取出 token 里声明的 scopes
    token_scopes = payload.get("scopes", [])
    # 校验：token 必须包含路由要求的所有 scope
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(403, f"缺少权限：{scope}")
    user = db.execute(select(User).where(User.name == payload.get("sub"))).scalar_one_or_none()
    return user

def require_scopes(*scopes):
    def checker(user: User = Security(get_current_user, scopes=list(scopes))):
        return user
    return checker

# 用法：声明这个接口需要 read:posts scope
@router.get("/posts/")
def list_posts(_: User = Depends(require_scopes("read:posts"))):
    ...
\`\`\`

签发带 scope 的 token：

\`\`\`python filename="登录时按需签发 scope"
@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form.username, form.password, db)
    if not user:
        raise HTTPException(400, "用户名或密码错误")
    # 客户端可以请求特定 scope，服务端按用户角色授权
    requested_scopes = form.scopes  # OAuth2PasswordRequestForm 自带 scopes 字段
    granted = grant_scopes(user, requested_scopes)   # admin 可以拿 admin:users，普通用户只能拿 read/write
    token = create_access_token({"sub": user.name, "scopes": granted})
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

## 七、资源所有权校验

光有角色/scope 不够，还要校验"资源是不是你的"。比如 alice 编辑文章，得确保这文章是她自己的（或她是 editor/admin）：

\`\`\`python filename="资源所有权校验"
@router.put("/posts/{post_id}")
def update_post(
    post_id: int,
    post_in: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(404, "文章不存在")
    # 所有权校验：只能改自己的；editor/admin 可以改任何人的
    if post.author_id != current_user.id and current_user.role not in ("editor", "admin"):
        raise HTTPException(403, "只能修改自己的文章")
    # 更新逻辑...
    return post
\`\`\`

\`\`\`txt filename="权限决策矩阵"
操作        普通用户     编辑        管理员
查看文章     公开/自己的  全部        全部
改自己文章   ✅          ✅          ✅
改别人文章   ❌ 403      ✅          ✅
删任何文章   ❌ 403      ❌ 403      ✅
\`\`\`

## 八、完整 RBAC 权限系统示例

\`\`\`python filename="完整 RBAC 速览"
# 1. 角色枚举
class Role(str, Enum):
    ADMIN = "admin"; EDITOR = "editor"; USER = "user"

# 2. 权限矩阵：角色 → 能做的操作
PERMISSIONS = {
    Role.ADMIN: {"user:delete", "post:publish", "post:edit:any", "post:delete:any", "post:edit:own"},
    Role.EDITOR: {"post:publish", "post:edit:any", "post:edit:own"},
    Role.USER: {"post:edit:own", "post:delete:own"},
}

def user_can(user: User, permission: str) -> bool:
    """检查用户是否拥有某权限。"""
    return permission in PERMISSIONS.get(Role(user.role), set())

# 3. 依赖封装
def require_permission(permission: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if not user_can(user, permission):
            raise HTTPException(403, f"缺少权限：{permission}")
        return user
    return checker

# 4. 路由声明权限
@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    post = db.get(Post, post_id)
    # 资源所有权：能删自己的，或拥有删任何文章的权限
    if post.author_id == user.id:
        if not user_can(user, "post:delete:own"):
            raise HTTPException(403, "无权删除")
    else:
        if not user_can(user, "post:delete:any"):
            raise HTTPException(403, "只能删除自己的文章")
    db.delete(post)
    db.commit()
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 权限校验放前端 | 改请求绕过校验 | 所有校验必须在后端 |
| 用 401 代替 403 | 已登录用户困惑 | 认证失败 401，权限不足 403 |
| 不校验资源所有权 | alice 改 bob 的文章 | 查资源 author_id 比对 |
| 角色/scope 硬编码字符串 | 拼写错难发现 | 用枚举或常量 |
| 越权 IDOR（直接用 URL 的 id） | \`/posts/{id}\` 不校验归属 | 校验资源属于当前用户 |
| 管理员接口没单独权限校验 | 普通用户能调 | 加 \`require_admin\` 依赖 |
| 改角色后旧 token 仍带旧权限 | 权限不同步 | token 里只放 user_id，权限实时查库；或改角色时 bump token version |
| 水平越权 vs 垂直越权混 | alice 看 bob（水平）/ user 调 admin（垂直） | 两种都防 |

## 十、小结

RBAC 用"用户→角色→权限"三层解耦权限管理。FastAPI 用依赖链（\`oauth2_scheme → get_current_user → require_role\`）优雅实现：路由声明需要什么角色，依赖自动校验。需要更细粒度时用 OAuth2 scopes（token 级权限范围）。所有受保护资源除了查角色，还要校验资源所有权（防 IDOR 水平越权）。至此认证安全篇完整闭环：登录→JWT→密码哈希→权限控制。下一章我们进入异步编程，挖掘 FastAPI 的高性能潜力。
`
  },
];
