// =============================================================
// Python Web 后端开发实战教程（全新版）- 第 6 批章节（FastAPI 进阶 7 章）
// -------------------------------------------------------------
// 本批为「重点章节」，篇幅更大，覆盖 FastAPI 进阶机制：
//   1. fastapi-jwt       : JWT 认证完整实现
//   2. fastapi-oauth2    : OAuth2 Password Flow
//   3. fastapi-upload    : 文件上传与多文件处理
//   4. fastapi-websocket : WebSocket 实时通信
//   5. fastapi-cors      : CORS 跨域配置与原理
//   6. fastapi-db        : FastAPI + SQLAlchemy 集成
//   7. fastapi-testing   : 测试与依赖覆盖
//
// 教程定位：纯阅读型，代码示例在 content 的 markdown 代码块中展示。
// 重点讲清「为什么」和「怎么想」，框架会变，Web 原理长存。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：JWT 认证完整实现
  // ============================================================
  {
    id: "pyweb2-fastapi-jwt",
    group: "FastAPI 进阶",
    icon: "🔑",
    title: "JWT 认证完整实现",
    content: `
## 一、为什么需要认证

HTTP 是无状态协议，服务器默认不记得「上一次请求是谁发的」。所以每次请求都要自带身份凭证。常见的认证方案有三种：

| 方案 | 凭证存放 | 特点 |
|---|---|---|
| Session + Cookie | 服务端内存/Redis | 有状态，服务端要存 session |
| JWT（JSON Web Token） | 客户端 | 无状态，token 自包含信息 |
| OAuth2 | 第三方授权服务器 | 适合第三方登录（GitHub/Google） |

本章聚焦 JWT，它是目前前后端分离架构中最主流的方案。核心思想：**把用户身份信息编码成一个字符串（token），客户端每次请求带上它，服务端用密钥验证真伪**。

## 二、JWT 是什么

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间以 JSON 对象安全传递信息。这个信息是数字签名的，因此可以被信任。

### 1. JWT 的三段结构

一个 JWT 长这样：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

用 \`.\` 分成三段：**Header.Payload.Signature**。

#### Header（头部）

描述 token 类型和签名算法，是一个 JSON：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

- \`alg\`：签名算法，常用 HS256（HMAC-SHA256）、RS256（RSA-SHA256）。
- \`typ\`：固定为 \`JWT\`。

这个 JSON 被 Base64Url 编码后成为第一段。

#### Payload（载荷）

存放实际数据（称为 claims 声明），也是 JSON：

\`\`\`json
{
  "sub": "1234567890",
  "name": "John",
  "admin": true,
  "iat": 1516239022,
  "exp": 1516242622
}
\`\`\`

claims 分三类：

- **标准声明**（Registered claims）：RFC 7519 预定义的字段，建议但不强制。
  - \`iss\`（issuer）：签发者
  - \`sub\`（subject）：主题，通常是用户 ID
  - \`aud\`（audience）：接收方
  - \`exp\`（expiration）：过期时间
  - \`nbf\`（not before）：生效时间
  - \`iat\`（issued at）：签发时间
  - \`jti\`（JWT ID）：唯一标识
- **私有声明**（Private claims）：业务自定义字段，如 \`name\`、\`admin\`、\`role\`。
- **公共声明**（Public claims）：可冲突，应避免。

> ⚠️ Payload 只是 Base64 编码，**不是加密**。任何人都能解码看到内容。所以**绝对不要把密码、密钥放进 JWT**。

#### Signature（签名）

用 Header 指定的算法，对 \`编码后的Header.编码后的Payload\` 用密钥签名：

\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

签名的作用是**防篡改**。如果有人改了 Payload 里的 \`admin: true\`，但他不知道密钥，算出的签名对不上，服务端就会拒绝。

### 2. JWT 的工作流程

\`\`\`
1. 用户 POST /login {username, password}
2. 服务端验证密码，生成 JWT 返回
3. 客户端把 JWT 存到 localStorage / cookie
4. 后续请求在 Authorization 头带上：Bearer <token>
5. 服务端验证签名 + 过期时间，提取用户信息
\`\`\`

## 三、安装 PyJWT

\`\`\`bash
pip install pyjwt
# 如果要用 RS256 算法，装 cryptography
pip install "pyjwt[crypto]"
\`\`\`

## 四、PyJWT 基础：encode 与 decode

### Demo 1：生成与解析 JWT

\`\`\`python
import jwt
import datetime

# 密钥，生产环境从环境变量读取，绝不硬编码
SECRET_KEY = "my-secret-key-please-change-in-production"
ALGORITHM = "HS256"

# 1. 生成 JWT
# payload 是一个字典，存放 claims
payload = {
    "sub": "user_123",                  # sub 是标准声明，放用户唯一标识
    "name": "张三",
    "role": "admin",
    "iat": datetime.datetime.now(datetime.timezone.utc),  # 签发时间
    # exp 是过期时间，设为 1 小时后。exp 必须是时间戳（整数）
    "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
}

# jwt.encode 把 payload 编码成 token 字符串
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print(f"Token: {token}")

# 2. 解析 JWT
# jwt.decode 会验证签名和 exp，验证失败会抛异常
try:
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print(f"Decoded: {decoded}")
except jwt.ExpiredSignatureError:
    print("Token 已过期")
except jwt.InvalidTokenError:
    print("Token 无效")
\`\`\`

### Demo 2：过期时间处理

\`\`\`python
import jwt
import datetime

SECRET_KEY = "secret"

# 注意：exp 必须用 UTC 时间，且转成时间戳
now = datetime.datetime.now(datetime.timezone.utc)

# 生成一个已过期的 token（过期时间设为 1 秒前）
expired_payload = {
    "sub": "user_1",
    "exp": now - datetime.timedelta(seconds=1),  # 1 秒前过期
}
expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm="HS256")

# decode 默认会验证 exp
try:
    jwt.decode(expired_token, SECRET_KEY, algorithms=["HS256"])
except jwt.ExpiredSignatureError as e:
    print(f"捕获到过期异常: {e}")

# 如果只是想解码不验证（比如调试），可以不验证 exp
# 但生产环境绝对不要这样做
decoded_unverified = jwt.decode(
    expired_token,
    SECRET_KEY,
    algorithms=["HS256"],
    options={"verify_exp": False},  # 关闭过期验证，仅用于调试
)
print(f"不验证过期的解码: {decoded_unverified}")
\`\`\`

## 五、密码哈希（passlib bcrypt）

存密码绝不能存明文，也不能存可逆加密。必须用**哈希**——单向不可逆。

### 为什么用 bcrypt

| 哈希算法 | 是否加盐 | 是否抗暴力破解 | 推荐度 |
|---|---|---|---|
| MD5 / SHA1 | 否（需手动） | 否，太快 | ❌ 已不安全 |
| SHA256 | 否（需手动） | 否，太快 | ❌ 不适合密码 |
| bcrypt | 自动加盐 | 是，可调慢 | ✅ 推荐 |
| argon2 | 自动加盐 | 是，更现代 | ✅ 推荐 |

bcrypt 的关键特性是**自适应成本因子（cost factor）**：硬件升级后可以提高 cost 让哈希变慢，抵抗算力增长带来的暴力破解风险。

### Demo 3：passlib 哈希密码

\`\`\`bash
pip install "passlib[bcrypt]"
\`\`\`

\`\`\`python
from passlib.context import CryptContext

# CryptContext 支持多算法切换，方便未来升级
# deprecated="auto" 表示旧算法哈希自动标记为过时，验证通过后自动用新算法重新哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. 哈希密码
raw_password = "my-password-123"
hashed = pwd_context.hash(raw_password)
print(f"哈希值: {hashed}")
# bcrypt 每次哈希结果不同（因为盐随机），但都能验证通过

# 2. 验证密码
print(pwd_context.verify("my-password-123", hashed))  # True
print(pwd_context.verify("wrong-password", hashed))   # False
\`\`\`

注意 bcrypt 哈希结果自带算法、cost、盐，例如：

\`\`\`
$2b$12$SomeRandomSalt...HashedResult...
\`\`\`

- \`$2b$\`：bcrypt 算法版本
- \`12\`：cost factor（2^12 次迭代）
- 后面是盐 + 哈希

所以同一个密码每次 hash 出来不同，但都能 verify 通过。

## 六、FastAPI 实现 JWT 登录完整流程

把密码哈希和 JWT 组合起来，实现一个完整的认证系统。

### Demo 4：完整 JWT 登录

\`\`\`python
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel

# ========== 配置 ==========
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ========== 密码工具 ==========
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2PasswordBearer 用于从请求头提取 token
# tokenUrl 是获取 token 的端点，会出现在文档里
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# ========== 模拟用户数据库 ==========
# 实际项目用数据库存，这里用字典演示
fake_users_db = {
    "alice": {
        "username": "alice",
        "hashed_password": pwd_context.hash("secret123"),  # 密码是 secret123
        "role": "admin",
        "disabled": False,
    },
    "bob": {
        "username": "bob",
        "hashed_password": pwd_context.hash("secret456"),
        "role": "user",
        "disabled": True,  # 被禁用的用户
    },
}

# ========== Pydantic 模型 ==========
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    role: str
    disabled: bool


class UserInDB(User):
    hashed_password: str


# ========== 辅助函数 ==========
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码是否匹配哈希值"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    return pwd_context.hash(password)


def get_user(db: dict, username: str) -> UserInDB | None:
    """从数据库取用户，返回 UserInDB（含哈希密码）"""
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
    return None


def authenticate_user(db: dict, username: str, password: str) -> UserInDB | None:
    """认证用户：先查用户存在，再验密码"""
    user = get_user(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """生成 JWT access token"""
    # 复制 data，避免修改原始字典
    to_encode = data.copy()
    # 设置过期时间
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})  # exp 是标准声明，PyJWT 会自动校验
    # 编码生成 token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ========== 依赖：获取当前用户 ==========
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    """从 token 解析当前用户，是核心认证依赖"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},  # 告诉客户端用 Bearer 认证
    )
    try:
        # 解码 token，验证签名和过期时间
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")  # sub 存用户名
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = get_user(fake_users_db, token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """再叠加一层：只允许未禁用的用户"""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# ========== 路由 ==========

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """登录端点：验证账号密码，返回 JWT"""
    # OAuth2PasswordRequestForm 是 FastAPI 提供的表单模型
    # 自动从 application/x-www-form-urlencoded 提取 username 和 password
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 把用户名放进 sub，后续解析用
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, token_type="bearer")


@app.get("/users/me", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    """受保护端点：需要登录且未被禁用"""
    return current_user


@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """受保护端点：返回当前用户的资源"""
    return [{"item_id": "Foo", "owner": current_user.username}]
\`\`\`

### 测试流程

\`\`\`bash
# 1. 登录获取 token（注意是表单格式，不是 JSON）
curl -X POST http://127.0.0.1:8000/token \\
  -d "username=alice&password=secret123"
# 返回：{"access_token":"eyJ...","token_type":"bearer"}

# 2. 带 token 访问受保护接口
curl http://127.0.0.1:8000/users/me \\
  -H "Authorization: Bearer eyJhbGci..."
# 返回：{"username":"alice","role":"admin","disabled":false}

# 3. 不带 token 访问
curl http://127.0.0.1:8000/users/me
# 返回 401：{"detail":"Not authenticated"}
\`\`\`

## 七、当前用户依赖的层级设计

注意上面有**两层依赖**：

\`\`\`
get_current_user  →  解析 token，返回 User
    ↓
get_current_active_user  →  检查是否禁用，返回 User
\`\`\`

\`get_current_active_user\` 依赖 \`get_current_user\`，FastAPI 会自动按依赖图顺序执行。这种**依赖叠加**的好处是：

- \`get_current_user\` 只管「token 有效且用户存在」。
- \`get_current_active_user\` 加上业务规则「用户没被禁用」。
- 需要不同强度的端点可以选用不同依赖：\`/users/me\` 要 active，\`/admin/stats\` 可以再加一层 \`get_admin_user\`。

### Demo 5：基于角色的依赖

\`\`\`python
from fastapi import Depends, HTTPException, status

async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    """只允许 admin 角色通过"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，需要 admin 角色",
        )
    return current_user


# 只有 admin 能访问
@app.get("/admin/stats")
async def admin_stats(admin: Annotated[User, Depends(get_admin_user)]):
    return {"total_users": 42, "admin": admin.username}
\`\`\`

依赖链现在是：\`token → 用户 → 未禁用 → 是 admin\`，每一层职责单一。

## 八、Token 刷新机制

Access token 有效期短（如 30 分钟），过期后用户不想重新输密码。解决方案是 **refresh token**：

- **Access token**：短有效期（15-30 分钟），用于访问 API。
- **Refresh token**：长有效期（7-30 天），只用于换取新的 access token，不用于访问业务 API。

### Demo 6：Refresh Token 实现

\`\`\`python
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_refresh_token(data: dict) -> str:
    """生成 refresh token，有效期长"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})  # type 标记 token 类型
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


@app.post("/token", response_model=TokenPair)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """登录返回 access + refresh 两个 token"""
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(401, "Incorrect username or password")
    access = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh = create_refresh_token(data={"sub": user.username})
    return TokenPair(access_token=access, refresh_token=refresh, token_type="bearer")


@app.post("/token/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str):
    """用 refresh token 换取新的 access token"""
    credentials_exception = HTTPException(401, "Invalid refresh token")
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        # 必须验证 type 是 refresh，防止 access token 被拿来做 refresh
        if payload.get("type") != "refresh":
            raise credentials_exception
        username = payload.get("sub")
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    user = get_user(fake_users_db, username)
    if user is None:
        raise credentials_exception
    
    # 签发新的 access token（不续期 refresh token，refresh 用完一次可换新）
    new_access = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=new_access, token_type="bearer")
\`\`\`

### Refresh token 存储策略

| 存储位置 | 安全性 | 适用场景 |
|---|---|---|
| localStorage | 中（XSS 可窃取） | SPA 通用 |
| httpOnly Cookie | 高（JS 读不到） | 同站应用，防 XSS |
| Redis + 黑名单 | 最高（可主动失效） | 高安全要求 |

Refresh token 应该存服务端可撤销（比如存 Redis，登出时删掉），这样即使泄露也能失效。Access token 因为短命，一般不做撤销。

## 九、安全注意事项

### 1. 算法选择

| 算法 | 类型 | 适用 |
|---|---|---|
| HS256 | 对称（HMAC） | 单体应用，签发和验证是同一服务 |
| RS256 | 非对称（RSA） | 微服务，签发用私钥，验证用公钥 |
| ES256 | 非对称（ECDSA） | 同 RS256，更短更快 |

微服务架构下推荐 RS256/ES256：认证中心持私钥签发，其他服务用公钥验证，私钥不外泄。

### Demo 7：RS256 非对称签名

\`\`\`bash
# 生成 RSA 私钥
openssl genrsa -out private.pem 2048
# 从私钥导出公钥
openssl rsa -in private.pem -pubout -out public.pem
\`\`\`

\`\`\`python
import jwt
from cryptography.hazmat.primitives import serialization

# 加载私钥（签发用）
with open("private.pem", "rb") as f:
    private_key = serialization.load_pem_private_key(f.read(), password=None)

# 加载公钥（验证用）
with open("public.pem", "rb") as f:
    public_key = serialization.load_pem_public_key(f.read())

# 认证中心签发 token
token = jwt.encode({"sub": "user1"}, private_key, algorithm="RS256")

# 业务服务验证 token（只有公钥）
decoded = jwt.decode(token, public_key, algorithms=["RS256"])
\`\`\`

### 2. 密钥管理

- **绝不硬编码**密钥在代码里，用环境变量或密钥管理服务（Vault、AWS KMS）。
- 密钥要足够长（至少 32 字符随机串），用 \`openssl rand -hex 32\` 生成。
- 定期轮换密钥（key rotation），旧 token 用旧密钥验证，新 token 用新密钥。

\`\`\`python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 从环境变量读，.env 文件也支持
    secret_key: str = os.environ.get("SECRET_KEY", "")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
# 用 settings.secret_key 替代硬编码
\`\`\`

### 3. 防 JWT 攻击

| 攻击 | 原理 | 防御 |
|---|---|---|
| 算法混淆 | 把 RS256 token 改 alg 为 HS256，用公钥当 HMAC 密钥 | decode 时显式指定 \`algorithms=[...]\` |
| Token 泄露 | XSS 拿到 localStorage 的 token | 用 httpOnly cookie，或加 CSP |
| 暴力破解 | 弱密钥被离线爆破 | 密钥足够长且随机 |
| 重放攻击 | 截获 token 重复使用 | 用 HTTPS + 短有效期 + jti |
| 撤销难题 | JWT 无状态，签发后无法主动失效 | 引入黑名单（Redis）或短有效期 |

**算法混淆攻击详解**：PyJWT 在 \`algorithms\` 参数为空时会信任 token 头部的 alg。攻击者把 RS256 token 的 alg 改成 HS256，用你的公钥当 HMAC 密钥重新签名，服务端用公钥 verify 时如果接受 HS256 就会被骗。**永远显式传 \`algorithms=["HS256"]\` 或 \`["RS256"]\`**。

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| \`exp\` 不生效 | 传了 datetime 但没设 timezone | 用 \`datetime.now(timezone.utc)\` |
| token 解析报 \`InvalidSignatureError\` | 密钥不一致 | 检查 encode/decode 用同一密钥 |
| 密码 verify 总是 False | 哈希和明文传反了 | \`verify(明文, 哈希)\` 顺序别错 |
| 同密码每次 hash 不同 | bcrypt 随机盐 | 这是正常的，用 verify 不用 == |
| \`algorithms\` 不传 | 算法混淆攻击风险 | 显式指定 \`algorithms=[ALGORITHM]\` |
| token 在 localStorage 被 XSS 偷 | JS 能读 localStorage | 敏感操作加二次验证，或用 httpOnly cookie |
| refresh token 无法撤销 | JWT 无状态 | refresh token 存 Redis，登出删 |
| 401 但没带 WWW-Authenticate | 客户端不知道用什么认证 | HTTPException 的 headers 加上 |

## 十一、设计思想

JWT 的核心价值是「**无状态**」：服务端不需要存 session，token 自包含身份信息，任何节点用同一密钥都能验证。这让水平扩展变得简单——加机器不用共享 session 存储。代价是**撤销困难**：token 一旦签发，在过期前都有效，无法主动作废（除非引入有状态的黑名单）。所以 JWT 适合「短命 access token + 长命可撤销 refresh token」的组合。

密码哈希选择 bcrypt 体现了「**算力对抗**」思维：安全不是静态的，今天安全的算法明天可能被算力攻破。bcrypt 的 cost factor 让哈希成本随硬件升级而提高，把攻防节奏掌握在自己手里。这种「可调强度的防御」比固定算法更抗未来风险。

依赖叠加设计（\`get_current_user → get_current_active_user → get_admin_user\`）是 FastAPI DI 系统的精髓。每层依赖只负责一个判断，组合起来形成权限金字塔。这比在一个函数里写一堆 if 判断更清晰、更可测试、更可复用。
`,
  },

  // ============================================================
  // 第 2 章：OAuth2 Password Flow
  // ============================================================
  {
    id: "pyweb2-fastapi-oauth2",
    group: "FastAPI 进阶",
    icon: "🛡️",
    title: "OAuth2 Password Flow",
    content: `
## 一、OAuth2 是什么

OAuth2（Open Authorization 2.0）是一个授权框架标准（RFC 6749），让用户能授权第三方应用访问自己在某服务上的资源，**而不需要把密码给第三方**。

经典场景：你用「石墨文档」想导入「Google Drive」的文件。石墨不该拿到你的 Google 密码，于是用 OAuth2：你跳转到 Google 登录并授权，Google 给石墨一个 access token，石墨拿 token 访问你的文件。

### OAuth2 的四个角色

| 角色 | 说明 | 例子 |
|---|---|---|
| Resource Owner（资源所有者） | 资源的主人，通常是人 | 你 |
| Client（客户端） | 想访问资源的第三方应用 | 石墨文档 |
| Authorization Server（授权服务器） | 签发 token 的 | Google 的认证服务 |
| Resource Server（资源服务器） | 存资源的 | Google Drive API |

## 二、OAuth2 的四种授权模式

OAuth2 定义了四种 Grant Type（授权模式），适应不同场景：

| 模式 | 适用 | 安全性 |
|---|---|---|
| Authorization Code | Web 应用、有后端 | 高（最常用） |
| Implicit | 纯前端 SPA（已不推荐） | 低 |
| Password | 自家应用信任客户端 | 中 |
| Client Credentials | 服务对服务（无用户参与） | 高 |

### 1. Authorization Code（授权码模式）

最常用、最安全。流程：

\`\`\`
1. 用户点「用 Google 登录」，跳转到 Google 授权页
2. 用户在 Google 登录并同意授权
3. Google 重定向回你的网站，带一个 code（授权码）
4. 你的后端用 code + client_secret 换 access token
5. 用 access token 调 Google API
\`\`\`

关键：client_secret 只在后端使用，前端拿不到，所以安全。GitHub/Google 第三方登录都用这个模式。

### 2. Password（密码模式）

用户把账号密码直接给客户端，客户端拿去换 token：

\`\`\`
1. 用户在客户端输入用户名密码
2. 客户端把账号密码发给授权服务器
3. 服务器返回 access token
\`\`\`

**只适合客户端是自家应用**（比如你自己的 App 调你自己的 API），因为客户端能拿到用户密码。第三方应用绝不能用这个模式。

本章重点讲 Password Flow，因为它是 FastAPI 内置支持最好的，适合「自家前后端分离」项目。

### 3. Client Credentials（客户端凭证模式）

没有用户参与，服务之间互调：

\`\`\`
1. 服务 A 用自己的 client_id + client_secret 换 token
2. 用 token 调服务 B
\`\`\`

适合微服务内部调用、定时任务调 API。

## 三、fastapi.security.OAuth2PasswordBearer

FastAPI 提供了 \`OAuth2PasswordBearer\`，它做两件事：

1. **声明受保护端点需要 Bearer token**：在路由参数里 \`Depends(oauth2_scheme)\`，它会从 \`Authorization: Bearer xxx\` 头提取 token。
2. **在 OpenAPI 文档里集成登录按钮**：访问 \`/docs\` 时会有「Authorize」按钮，点击输入账号密码就能登录，后续请求自动带 token。

### Demo 1：OAuth2PasswordBearer 基础

\`\`\`python
from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()

# tokenUrl 指向「获取 token 的端点路径」
# 这个路径要和你的 /token 路由一致，文档里的 Authorize 按钮会提交到这里
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@app.get("/items/")
# 依赖 oauth2_scheme：自动从请求头提取 token
# 如果没带 token，返回 401；带了就把 token 字符串传给 token 参数
async def read_items(token: str = Depends(oauth2_scheme)):
    return {"token": token}
\`\`\`

访问 \`/docs\` 会看到右上角有「Authorize」按钮。点 \`/items/\` 的 Try it out 时，如果没登录会提示 401。

\`oauth2_scheme(token)\` 实际是个可调用对象，等价于：

\`\`\`python
def oauth2_scheme(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated", ...)
    return auth_header[7:]  # 去掉 "Bearer " 前缀，返回 token
\`\`\`

## 四、OAuth2PasswordRequestForm

用户登录时，OAuth2 规范要求用 **表单格式**（\`application/x-www-form-urlencoded\`）提交，不是 JSON。字段包括：

- \`username\`：用户名
- \`password\`：密码
- \`scope\`（可选）：权限范围
- \`grant_type\`（可选）：固定为 \`password\`
- \`client_id\` / \`client_secret\`（可选）：客户端凭证

FastAPI 提供 \`OAuth2PasswordRequestForm\` 自动解析这些字段。

### Demo 2：登录端点用表单

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

app = FastAPI()


@app.post("/token")
# OAuth2PasswordRequestForm 是个依赖，FastAPI 自动从表单提取字段
# 注意：这里用 Depends() 而不是类型注解，因为它是表单模型不是 Pydantic
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username / form_data.password / form_data.scope 都是属性
    if form_data.username != "admin" or form_data.password != "secret":
        raise HTTPException(400, "用户名或密码错误")
    # OAuth2 规范要求返回这些字段
    return {
        "access_token": "fake-token-" + form_data.username,
        "token_type": "bearer",
    }
\`\`\`

测试时要用表单格式：

\`\`\`bash
curl -X POST http://127.0.0.1:8000/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=admin&password=secret"
\`\`\`

> 为什么 OAuth2 要用表单而不是 JSON？历史原因：OAuth2 制定时（2012 年）表单是主流，且表单更接近 HTML form 提交，方便浏览器直接发起。FastAPI 遵循规范，所以登录端点用表单。

## 五、完整 OAuth2 + JWT 实现

把 OAuth2PasswordBearer、OAuth2PasswordRequestForm、JWT、密码哈希组合起来，就是生产级认证。下面是完整可运行示例。

### Demo 3：完整 OAuth2 Password + JWT

\`\`\`python
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel

# ========== 配置 ==========
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ========== 模拟数据库 ==========
fake_users_db = {}

# ========== 模型 ==========
class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    username: str
    disabled: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str


# ========== 工具函数 ==========
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ========== 依赖 ==========
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    """核心依赖：解析 token 拿到当前用户"""
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise exc
    except jwt.InvalidTokenError:
        raise exc
    
    user_data = fake_users_db.get(username)
    if not user_data:
        raise exc
    return User(username=user_data["username"], disabled=user_data["disabled"])


# ========== 路由 ==========
@app.post("/register", response_model=User)
async def register(user: UserCreate):
    """注册：把密码哈希后存库"""
    if user.username in fake_users_db:
        raise HTTPException(400, "用户名已存在")
    fake_users_db[user.username] = {
        "username": user.username,
        "hashed_password": hash_password(user.password),
        "disabled": False,
    }
    return User(username=user.username)


@app.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """登录：OAuth2 规范的 token 端点"""
    user_data = fake_users_db.get(form_data.username)
    if not user_data or not verify_password(form_data.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user_data["disabled"]:
        raise HTTPException(400, "用户已禁用")
    
    access_token = create_access_token(
        data={"sub": user_data["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=User)
async def me(current: Annotated[User, Depends(get_current_user)]):
    """受保护端点"""
    return current
\`\`\`

在 \`/docs\` 里的完整流程：

1. 先调 \`POST /register\` 注册一个用户。
2. 点右上角「Authorize」，输入用户名密码，点登录。
3. 之后所有受保护接口都能直接 Try it out，token 自动带上。

## 六、Scope 权限控制

OAuth2 的 scope 是「权限范围」概念。token 可以带 scope，声明它能做什么。比如 \`read:items\` 表示只能读，\`write:items\` 表示能写。

FastAPI 的 \`OAuth2PasswordBearer\` 支持 scopes 参数，登录时用户可以勾选要申请的权限。

### Demo 4：Scope 控制

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes

# 定义所有可能的 scope
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "read:items": "读取物品的权限",
        "write:items": "写入物品的权限",
        "read:users": "读取用户的权限",
        "admin": "管理员权限",
    },
)

app = FastAPI()


async def get_current_user(
    security_scopes: SecurityScopes,  # FastAPI 自动注入当前端点要求的 scope
    token: Annotated[str, Depends(oauth2_scheme)]
) -> dict:
    """带 scope 校验的认证依赖"""
    if security_scopes.scopes:
        # 如果端点要求 scope，认证失败时返回 403 而不是 401
        authenticate_value = f'Bearer scope="{security_scopes.scopes_str}"'
    else:
        authenticate_value = "Bearer"
    
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效凭证",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        token_scopes = payload.get("scopes", [])  # token 携带的 scope 列表
        if not username:
            raise exc
    except jwt.InvalidTokenError:
        raise exc
    
    # 校验：token 的 scope 必须包含端点要求的所有 scope
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足，缺少 scope: {scope}",
            )
    return {"username": username, "scopes": token_scopes}


@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """登录时 form_data.scope 是空格分隔的 scope 字符串"""
    # 验证账号密码...（省略）
    # 把用户申请的 scope 放进 token
    scopes = form_data.scopes  # 比如 "read:items write:items"
    token = create_access_token(data={
        "sub": form_data.username,
        "scopes": scopes.split() if scopes else [],
    })
    return {"access_token": token, "token_type": "bearer"}


# 用 Security 而不是 Depends，并指定需要的 scope
@app.get("/items/")
async def read_items(
    user: Annotated[dict, Security(get_current_user, scopes=["read:items"])]
):
    """需要 read:items scope"""
    return {"items": [1, 2, 3], "caller": user["username"]}


@app.post("/items/")
async def write_items(
    user: Annotated[dict, Security(get_current_user, scopes=["write:items"])]
):
    """需要 write:items scope"""
    return {"created": True, "caller": user["username"]}


@app.get("/admin/")
async def admin_panel(
    user: Annotated[dict, Security(get_current_user, scopes=["admin"])]
):
    """需要 admin scope"""
    return {"admin": user["username"]}
\`\`\`

关键点：

- \`SecurityScopes\` 由 FastAPI 自动注入，\`security_scopes.scopes\` 是当前端点要求的 scope 列表。
- 用 \`Security(dependency, scopes=[...])\` 而不是 \`Depends(dependency)\`，这样 FastAPI 知道端点要求哪些 scope。
- token 里的 scope 是签发时写死的，端点要求的 scope 是路由声明的，运行时校验「token scope ⊇ 端点 scope」。

在 \`/docs\` 的 Authorize 对话框里，会列出所有 scope 复选框，用户勾选后登录，token 就带这些 scope。

## 七、与第三方 OAuth（GitHub/Google）对比

| 维度 | 自建 Password Flow | 第三方 OAuth（GitHub） |
|---|---|---|
| 谁存密码 | 你的服务 | 第三方（GitHub） |
| 用户信任对象 | 你的网站 | GitHub |
| 实现复杂度 | 低（FastAPI 内置） | 中（要处理回调、code 换 token） |
| 适用场景 | 自家应用，用户是你的 | 借用第三方账号体系 |
| 安全责任 | 你要保护密码 | 第三方负责 |

### 第三方登录的本质

第三方 OAuth 用的是 **Authorization Code 模式**，流程比 Password 复杂：

\`\`\`
1. 用户点「用 GitHub 登录」
2. 跳转到 https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=user:email
3. 用户在 GitHub 登录并授权
4. GitHub 重定向回你的 /auth/callback?code=xxx
5. 你的后端用 code + client_secret 向 GitHub 换 access_token
6. 用 access_token 调 GitHub API 拿用户信息（如邮箱）
7. 在你的系统里创建/更新用户，签发你自己的 token
\`\`\`

### Demo 5：GitHub 第三方登录骨架

\`\`\`python
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse

app = FastAPI()

GITHUB_CLIENT_ID = "your-client-id"
GITHUB_CLIENT_SECRET = "your-client-secret"
REDIRECT_URI = "http://localhost:8000/auth/callback"


@app.get("/auth/github")
async def github_login():
    """跳转到 GitHub 授权页"""
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=user:email"
    )
    return RedirectResponse(url)


@app.get("/auth/callback")
async def github_callback(code: str):
    """GitHub 回调：用 code 换 token"""
    # 1. 用 code 换 access_token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(400, "GitHub 授权失败")
        
        # 2. 用 access_token 获取用户信息
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        github_user = user_resp.json()
    
    # 3. 在你的系统里处理这个用户（创建或更新）
    github_id = github_user["id"]
    email = github_user.get("email")
    # 这里应该查你的数据库，根据 github_id 找/建用户，然后签发你自己的 JWT
    # your_jwt = create_access_token({"sub": str(github_id)})
    
    return {"user": github_user["login"], "email": email}
\`\`\`

注意：第三方 OAuth 拿到的 token 是**第三方的 token**，用来调第三方 API。你的系统还是要签发**自己的 token**给前端用。第三方登录只是「免注册」手段，认证体系还是你自己的。

## 八、安全最佳实践

### 1. HTTPS 是前提

OAuth2 的 token 在网络中传输，**必须用 HTTPS**。HTTP 下 token 可被中间人截获。生产环境强制 HTTPS（用 Nginx + Let's Encrypt）。

### 2. Token 存储位置

| 位置 | XSS 风险 | CSRF 风险 | 推荐 |
|---|---|---|---|
| localStorage | 高（JS 可读） | 无 | SPA 常用，但需防 XSS |
| sessionStorage | 高 | 无 | 同上，关闭标签即失效 |
| httpOnly Cookie | 低（JS 不可读） | 高 | 需配合 SameSite |
| 内存（JS 变量） | 低 | 无 | 最安全但刷新即失效 |

最安全方案：access token 存内存（JS 变量），refresh token 存 httpOnly + SameSite=Strict 的 cookie。

### 3. Client Secret 保护

\`client_secret\` 绝不能暴露给前端。第三方登录的 code 换 token 步骤必须在后端做。如果 SPA 直接拿 code 换 token，client_secret 就泄露了。

## 九、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 登录用 JSON 提交 | OAuth2 规范要表单 | 用 \`OAuth2PasswordRequestForm\` |
| \`/docs\` Authorize 不工作 | tokenUrl 路径不对 | 和登录路由路径一致 |
| scope 校验不生效 | 用了 Depends 不是 Security | scope 要用 \`Security(dep, scopes=[...])\` |
| 401 没带 WWW-Authenticate | 忘加 headers | HTTPException 加 \`headers={"WWW-Authenticate":"Bearer"}\` |
| 第三方登录 client_secret 泄露 | 前端换 token | code 换 token 在后端做 |
| token 放 localStorage 被 XSS | JS 可读 | 加 CSP，或用 httpOnly cookie |
| scope 字符串解析错 | OAuth2 scope 是空格分隔 | \`scopes.split()\` 不是逗号 |
| Password 模式用于第三方 | 第三方拿不到用户密码 | 第三方用 Authorization Code |

## 十、设计思想

OAuth2 的设计哲学是「**最小权限原则**」：token 只带必要的 scope，\`read:items\` 的 token 不能写。这比「一个 token 走天下」更安全——即使某个 token 泄露，攻击面也有限。Scope 机制让权限从「粗粒度的角色」细化到「细粒度的操作」，符合最小权限原则。

Password Flow 之所以存在于规范中，是 OAuth2 对「信任边界」的妥协：当客户端和服务端是同一家（你自己的 App 调你自己的 API），用户信任客户端不偷密码，Password Flow 就合理。规范没有一刀切禁止，而是把决策权交给架构师——**安全是上下文相关的，没有银弹**。

FastAPI 把 OAuth2 流程封装成 \`OAuth2PasswordBearer\` + \`OAuth2PasswordRequestForm\` + \`Security\` 三件套，体现了「**约定优于配置**」。遵循规范的成本被框架吸收，开发者只写业务逻辑。同时文档自动集成 Authorize 按钮，让 API 可测试性大增。这种「规范内置 + 文档联动」是 FastAPI 体验远超 Flask 的关键。
`,
  },

  // ============================================================
  // 第 3 章：文件上传与多文件处理
  // ============================================================
  {
    id: "pyweb2-fastapi-upload",
    group: "FastAPI 进阶",
    icon: "📎",
    title: "文件上传与多文件处理",
    content: `
## 一、HTTP 文件上传原理

文件上传用的是 \`multipart/form-data\` 编码，不是普通的 JSON 或表单。

普通表单（\`application/x-www-form-urlencoded\`）把字段拼成 \`key=value&key2=value2\`，不适合传二进制（会把二进制转义，体积膨胀）。\`multipart/form-data\` 用一段随机 boundary 分隔每个字段：

\`\`\`
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="cat.jpg"
Content-Type: image/jpeg

<二进制数据>
------WebKitFormBoundary--
\`\`\`

每个 part 有自己的 headers（含字段名、文件名、MIME 类型），可以独立编码。这样二进制文件不用转义直接传，高效。

## 二、UploadFile 对象详解

FastAPI 用 \`UploadFile\` 表示上传的文件。它是对 SpooledUploadFile 的封装，核心属性和方法：

| 属性/方法 | 说明 |
|---|---|
| \`filename\` | 客户端传来的文件名（不可信，需校验） |
| \`content_type\` | MIME 类型，如 \`image/jpeg\`（不可信，需校验） |
| \`file\` | 底层文件对象（SpooledTemporaryFile） |
| \`size\` | 文件大小（字节） |
| \`await read(size)\` | 异步读取指定字节，不传 size 读全部 |
| \`await write(data)\` | 异步写入 |
| \`await seek(offset)\` | 移动指针 |
| \`await close()\` | 关闭文件 |

### SpooledTemporaryFile 的特点

\`UploadFile.file\` 是 \`SpooledTemporaryFile\`：文件小时存内存（\`BytesIO\`），超过阈值（默认 1MB）自动落到磁盘临时文件。这样小文件快、大文件不爆内存。

### Demo 1：最小上传示例

\`\`\`python
from fastapi import FastAPI, UploadFile

app = FastAPI()


@app.post("/upload/")
async def upload_file(file: UploadFile):
    """最简单的单文件上传"""
    # file.filename 是客户端传的文件名
    # file.content_type 是 MIME 类型
    # await file.read() 读取全部内容（注意是异步）
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
    }
\`\`\`

测试：

\`\`\`bash
# -F 表示 multipart/form-data，@表示上传文件
curl -X POST http://127.0.0.1:8000/upload/ \\
  -F "file=@/path/to/cat.jpg"
\`\`\`

## 三、单文件上传与保存

### Demo 2：保存到磁盘

\`\`\`python
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException

app = FastAPI()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/upload/")
async def upload_and_save(file: UploadFile):
    """上传文件并保存到磁盘"""
    # 1. 校验文件类型（content_type 不可信，但可做初步过滤）
    allowed_types = {"image/jpeg", "image/png", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(400, f"不支持的文件类型: {file.content_type}")
    
    # 2. 校验文件大小（先读出来才知道大小，或用 file.size）
    # 注意：大文件全读到内存会爆，下面会讲流式处理
    contents = await file.read()
    max_size = 5 * 1024 * 1024  # 5MB
    if len(contents) > max_size:
        raise HTTPException(400, "文件超过 5MB 限制")
    
    # 3. 构造安全的保存路径
    # 绝对不能用 file.filename 直接拼路径，会有路径遍历攻击
    # 用 Path 的 name 属性取纯文件名，去掉目录部分
    safe_name = Path(file.filename).name  # 去掉 ../../ 等路径
    save_path = UPLOAD_DIR / safe_name
    
    # 4. 写入磁盘
    # 方式一：用 file.file 直接复制（同步）
    # with open(save_path, "wb") as f:
    #     f.write(contents)
    
    # 方式二：用 shutil.copyfileobj 流式复制（更省内存）
    # 先 seek 回开头，因为上面 read() 已经把指针移到末尾
    await file.seek(0)
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    return {"filename": safe_name, "saved_to": str(save_path)}
\`\`\`

## 四、多文件上传

用 \`List[UploadFile]\` 接收多个文件。HTML 表单里多个 \`<input type="file" name="files" multiple>\` 用同一个 name。

### Demo 3：多文件上传

\`\`\`python
from typing import List
from fastapi import FastAPI, UploadFile, HTTPException

app = FastAPI()


@app.post("/uploads/")
async def upload_multiple(files: List[UploadFile]):
    """多文件上传"""
    if not files:
        raise HTTPException(400, "未提供文件")
    
    results = []
    for file in files:
        # 逐个处理
        contents = await file.read()
        results.append({
            "filename": file.filename,
            "size": len(contents),
            "content_type": file.content_type,
        })
    return {"count": len(files), "files": results}
\`\`\`

测试：

\`\`\`bash
# 多个 -F 用同一个 name
curl -X POST http://127.0.0.1:8000/uploads/ \\
  -F "files=@a.jpg" \\
  -F "files=@b.png" \\
  -F "files=@c.gif"
\`\`\`

## 五、文件类型与大小验证

\`content_type\` 是客户端传的，**可被伪造**。只信它不够，要做更严格的校验。

### Demo 4：严格的文件类型校验

\`\`\`python
import imghdr  # Python 3.11 以下可用，3.13 移除了，可用 filetype 库替代
from fastapi import FastAPI, UploadFile, HTTPException

app = FastAPI()


async def validate_image(file: UploadFile) -> bytes:
    """校验图片文件并返回内容"""
    # 第一层：校验 content_type（可被伪造，但先过滤明显错的）
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(400, f"不支持的类型: {file.content_type}")
    
    # 第二层：校验扩展名
    suffixes = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    # file.filename 可能为 None
    name = file.filename or ""
    if not any(name.lower().endswith(s) for s in suffixes):
        raise HTTPException(400, "文件扩展名不允许")
    
    # 第三层：读取文件头校验真实类型（最可靠）
    contents = await file.read()
    # imghdr.what 通过文件头判断真实图片类型
    # 返回 'jpeg' / 'png' / 'gif' / None
    real_type = imghdr.what(None, h=contents[:32])  # 只读前 32 字节就够判断
    if real_type is None:
        raise HTTPException(400, "文件不是有效的图片")
    
    # 第四层：校验大小
    max_size = 10 * 1024 * 1024  # 10MB
    if len(contents) > max_size:
        raise HTTPException(400, "图片超过 10MB")
    
    return contents


@app.post("/avatar/")
async def upload_avatar(file: UploadFile):
    contents = await validate_image(file)
    # 保存...
    return {"size": len(contents), "type": file.content_type}
\`\`\`

> Python 3.13 移除了 \`imghdr\`，可以用 \`filetype\` 库（\`pip install filetype\`）：\`filetype.guess(contents)\` 返回 MIME 类型。

## 六、流式读取大文件

\`await file.read()\` 会把整个文件读进内存。上传 1GB 文件就会占 1GB 内存，多用户并发直接 OOM。

正确做法是**分块读取**：

### Demo 5：流式处理大文件

\`\`\`python
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException

app = FastAPI()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 分块大小，64KB 一块比较平衡
CHUNK_SIZE = 64 * 1024


@app.post("/upload/large/")
async def upload_large(file: UploadFile):
    """流式上传大文件，不一次性读进内存"""
    # 先校验大小：用 file.size（FastAPI 0.100+ 支持，不读内容）
    max_size = 500 * 1024 * 1024  # 500MB
    if file.size and file.size > max_size:
        raise HTTPException(400, "文件超过 500MB")
    
    safe_name = Path(file.filename or "unnamed").name
    save_path = UPLOAD_DIR / safe_name
    
    # 分块写入，内存占用恒定为 CHUNK_SIZE
    written = 0
    with open(save_path, "wb") as f:
        # 循环读取，每次读 CHUNK_SIZE 字节
        while chunk := await file.read(CHUNK_SIZE):
            # 边写边检查大小，防止客户端谎报
            written += len(chunk)
            if written > max_size:
                # 超限了，删掉已写的部分
                f.close()
                save_path.unlink(missing_ok=True)
                raise HTTPException(400, "上传过程中超过大小限制")
            f.write(chunk)
    
    return {"filename": safe_name, "size": written}
\`\`\`

关键点：

- \`while chunk := await file.read(CHUNK_SIZE)\`：海象运算符 \`:=\`，读到的 chunk 赋值并判断是否为空。
- 内存占用恒定（一个 chunk 大小），不随文件大小增长。
- 边写边检查大小，防止客户端传到一半超过限制。

## 七、上传进度与断点续传简介

### 上传进度

HTTP/1.1 没有内置上传进度协议。前端用 \`XMLHttpRequest\` 的 \`upload.onprogress\` 事件或 \`fetch\` + \`ReadableStream\` 跟踪进度。后端无需特殊处理。

### 断点续传

大文件上传中断后想从断点继续，需要额外协议设计：

1. **分片上传**：前端把大文件切成 N 块，每块单独上传。
2. **记录进度**：服务端记录已收到的分片。
3. **断点查询**：客户端先查「哪些块已上传」，只传缺失的。
4. **合并**：所有块到齐后合并成完整文件。

常用协议有 tus（开放协议）、云厂商的 OSS Multipart Upload。FastAPI 没有内置，需自行实现或用第三方库。

## 八、安全考虑

### 1. 路径遍历攻击

如果直接用 \`file.filename\` 拼路径：

\`\`\`python
# 危险代码！
save_path = UPLOAD_DIR / file.filename  # filename 可能是 "../../etc/passwd"
\`\`\`

攻击者构造 \`filename="../../../etc/passwd"\`，就能覆盖系统文件。

**防御**：用 \`Path(filename).name\` 只取文件名部分，或生成随机文件名。

\`\`\`python
import uuid
# 生成随机文件名，完全不用客户端的 filename
ext = Path(file.filename).suffix  # 只取扩展名
safe_name = f"{uuid.uuid4().hex}{ext}"
save_path = UPLOAD_DIR / safe_name
\`\`\`

### 2. 文件类型检查

三层校验（前面 Demo 4 讲过）：扩展名 → content_type → 文件头（魔数）。文件头最可靠，因为扩展名和 content_type 都可伪造。

常见文件头（魔数）：

| 类型 | 文件头（前几字节） |
|---|---|
| JPEG | FF D8 FF |
| PNG | 89 50 4E 47 |
| GIF | 47 49 46 38 |
| PDF | 25 50 44 46 |
| ZIP | 50 4B 03 04 |

### 3. 文件名注入

文件名可能含特殊字符（空格、中文、SQL、Shell 元字符）。除了路径遍历，还要防：

- SQL 注入：文件名存数据库时用参数化查询。
- Shell 注入：如果文件名传给 subprocess，要转义。
- XSS：如果文件名会显示在网页上，要 HTML 转义。

最稳妥：**完全不用客户端文件名**，服务端生成随机名。

### 4. 上传目录权限

- 上传目录**不要有执行权限**，防止上传脚本（.py、.php）被执行。
- 如果上传目录在 web 静态目录下，配置 web 服务器不执行该目录的脚本。
- 用 CDN 或对象存储（S3、OSS）存用户上传文件，和应用服务器隔离。

### Demo 6：安全上传完整示例

\`\`\`python
import uuid
from pathlib import Path
import filetype
from fastapi import FastAPI, UploadFile, HTTPException

app = FastAPI()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
}
MAX_SIZE = 20 * 1024 * 1024  # 20MB
CHUNK_SIZE = 64 * 1024


@app.post("/upload/safe/")
async def safe_upload(file: UploadFile):
    """安全的文件上传"""
    # 1. 流式读取到临时变量，边读边检查大小
    chunks = []
    total = 0
    while chunk := await file.read(CHUNK_SIZE):
        total += len(chunk)
        if total > MAX_SIZE:
            raise HTTPException(400, "文件超过 20MB")
        chunks.append(chunk)
    contents = b"".join(chunks)
    
    # 2. 用文件头判断真实类型（不信任 content_type 和 filename）
    kind = filetype.guess(contents)
    if not kind or kind.mime not in ALLOWED_TYPES:
        raise HTTPException(400, "文件类型不允许")
    
    # 3. 用随机文件名，不用客户端的 filename
    ext = ALLOWED_TYPES[kind.mime]
    safe_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / safe_name
    
    # 4. 写入，用绝对路径确保不出 uploads 目录
    save_path = save_path.resolve()
    if not str(save_path).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(500, "路径异常")
    save_path.write_bytes(contents)
    
    return {
        "filename": safe_name,
        "original_name": file.filename,
        "size": total,
        "mime": kind.mime,
    }
\`\`\`

## 九、上传到内存 vs 磁盘 vs 对象存储

| 方案 | 速度 | 持久性 | 适用 |
|---|---|---|---|
| 内存（BytesIO） | 最快 | 进程重启即失 | 临时处理（缩略图、解析） |
| 本地磁盘 | 中 | 持久 | 单机应用、小规模 |
| 对象存储（S3/OSS） | 慢（网络） | 高可用、可扩容 | 生产、多实例 |

### Demo 7：上传到 S3

\`\`\`bash
pip install boto3 aioboto3  # aioboto3 是异步版本
\`\`\`

\`\`\`python
import aioboto3
from fastapi import FastAPI, UploadFile

app = FastAPI()

S3_CONFIG = {
    "aws_access_key_id": "xxx",
    "aws_secret_access_key": "xxx",
    "endpoint_url": "https://s3.amazonaws.com",
}
BUCKET = "my-uploads"


@app.post("/upload/s3/")
async def upload_to_s3(file: UploadFile):
    """直接流式上传到 S3，不在本地落盘"""
    session = aioboto3.Session()
    async with session.client("s3", **S3_CONFIG) as s3:
        # upload_fileobj 流式上传，不占内存
        await s3.upload_fileobj(
            file.file,                       # UploadFile 的底层文件对象
            BUCKET,                          # bucket 名
            file.filename,                   # S3 上的 key
            ExtraArgs={"ContentType": file.content_type},
        )
    return {"filename": file.filename, "location": f"s3://{BUCKET}/{file.filename}"}
\`\`\`

对象存储的优势：应用服务器无状态、天然 CDN 加速、按量付费、容量无限。

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| \`await file.read()\` 报错 | read 是协程 | 必须 \`await\` |
| 大文件 OOM | 一次性 read 全部 | 分块 \`await file.read(CHUNK)\` |
| 路径遍历 | 直接用 filename 拼路径 | \`Path(name).name\` 或随机名 |
| content_type 被伪造 | 客户端可改 | 校验文件头魔数 |
| read 后再 read 返回空 | 指针已到末尾 | \`await file.seek(0)\` 回头 |
| 多文件 name 不一致 | 前端 name 必须相同 | 统一用 \`files\` |
| 上传目录可执行 | 上传 .py 被执行 | 去掉执行权限，或用对象存储 |
| 文件名含中文报错 | 编码问题 | 用随机名或统一 UTF-8 |
| file.size 为 None | 旧版 FastAPI | 0.100+ 才有，旧版边读边算 |
| imghdr 用不了 | Python 3.13 移除 | 用 filetype 库 |

## 十一、设计思想

文件上传的安全核心是「**不信任客户端**」：文件名、扩展名、content_type 全是客户端传的，都能伪造。安全的设计假设输入全是恶意的，每一层都校验：扩展名过滤外行，content_type 过滤脚本小子，文件头魔数校验才是真防御。这种「纵深防御」比单一校验更可靠，因为任何一层被绕过，还有下层兜底。

流式处理（分块读写）体现了「**恒定内存**」原则：处理大文件时内存占用不随文件大小增长。这不仅防 OOM，还让资源消耗可预测，是高并发服务的基本素养。SpooledTemporaryFile 自动在内存和磁盘间切换，是这一原则在框架层的体现。

路径遍历防御的本质是「**输入净化**」。\`Path(name).name\` 只取文件名部分，或干脆用随机名，从根上消除目录注入。这比事后过滤 \`../\` 更可靠——因为攻击者总能构造你没想到的绕过方式，而「完全不用输入」则无懈可击。
`,
  },

  // ============================================================
  // 第 4 章：WebSocket 实时通信
  // ============================================================
  {
    id: "pyweb2-fastapi-websocket",
    group: "FastAPI 进阶",
    icon: "🔌",
    title: "WebSocket 实时通信",
    content: `
## 一、WebSocket 协议简介

传统 HTTP 是「请求-响应」模式：客户端发请求，服务端返响应，连接就关了（或 keep-alive 但仍单向）。这不适合实时场景（聊天、推送、股票行情），因为服务端无法主动推消息给客户端。

### 传统方案：HTTP 长轮询

\`\`\`
1. 客户端发请求
2. 服务端没数据时 hold 住不返回
3. 有数据了才返回
4. 客户端收到立刻再发请求（继续等）
\`\`\`

缺点：每次轮询都带完整 HTTP 头（开销大），服务端 hold 连接消耗资源，本质还是「客户端拉」。

### WebSocket：全双工长连接

WebSocket 是 RFC 6455 标准，在一条 TCP 连接上**双向通信**：

\`\`\`
1. 客户端发 HTTP Upgrade 请求（协议升级）
2. 服务端返回 101 Switching Protocols
3. 之后这条连接变成 WebSocket，双方可随时互发消息
4. 直到某方主动关闭
\`\`\`

握手后协议从 HTTP 切到 WebSocket，开销极低（帧头只有 2-14 字节）。

### HTTP 长轮询 vs WebSocket

| 维度 | HTTP 长轮询 | WebSocket |
|---|---|---|
| 通信方向 | 单向（客户端拉） | 双向 |
| 延迟 | 高（每次重新请求） | 低（连接复用） |
| 开销 | 高（HTTP 头重复） | 低（帧头小） |
| 服务端推送 | 难（只能 hold） | 原生支持 |
| 复杂度 | 低 | 中（连接管理） |
| 兼容性 | 极好 | 好（现代浏览器都支持） |

## 二、FastAPI WebSocket 端点

用 \`@app.websocket(path)\` 定义 WebSocket 端点，参数是 \`WebSocket\` 对象。

### Demo 1：最小 WebSocket

\`\`\`python
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    """最简单的 WebSocket：收到消息原样返回（echo）"""
    # 1. 接受连接（必须先 accept 才能收发）
    await ws.accept()
    # 2. 循环接收消息
    while True:
        # receive_text 阻塞等待客户端消息
        data = await ws.receive_text()
        # send_text 发送文本消息
        await ws.send_text(f"消息已收到: {data}")
\`\`\`

前端测试代码：

\`\`\`html
<script>
const ws = new WebSocket("ws://127.0.0.1:8000/ws");
ws.onopen = () => ws.send("Hello");
ws.onmessage = (e) => console.log("收到:", e.data);
ws.onclose = () => console.log("断开");
</script>
\`\`\`

## 三、接收与发送消息

WebSocket 消息有四种类型，对应不同的收发方法：

| 数据类型 | 接收方法 | 发送方法 |
|---|---|---|
| 文本 | \`receive_text()\` | \`send_text(msg)\` |
| 二进制 | \`receive_bytes()\` | \`send_bytes(data)\` |
| JSON | \`receive_json()\` | \`send_json(obj)\` |

### Demo 2：JSON 消息收发

\`\`\`python
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/ws/json")
async def ws_json(ws: WebSocket):
    await ws.accept()
    while True:
        # receive_json 自动把消息解析成 dict
        msg = await ws.receive_json()
        # 比如客户端发 {"action": "ping", "ts": 123}
        if msg.get("action") == "ping":
            await ws.send_json({"action": "pong", "ts": msg["ts"]})
        else:
            await ws.send_json({"error": "未知 action"})
\`\`\`

### 连接关闭与异常处理

客户端断开时 \`receive_*\` 会抛 \`WebSocketDisconnect\` 异常，必须捕获，否则后台报错。

\`\`\`python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


@app.websocket("/ws/safe")
async def ws_safe(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        # 客户端正常断开，清理资源
        print("客户端断开连接")
\`\`\`

## 四、连接管理器（ConnectionManager）

实际应用要管理多个客户端连接（广播、私聊）。需要一个 \`ConnectionManager\` 类统一管理。

### Demo 3：连接管理器

\`\`\`python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


class ConnectionManager:
    """管理所有活跃的 WebSocket 连接"""
    
    def __init__(self):
        # active_connections: list[WebSocket] 存所有连接
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """接受新连接并加入列表"""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """连接断开时移除"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        """广播给所有连接"""
        # 遍历所有连接发送
        # 注意：发送可能失败（连接已断），要处理
        failed = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                failed.append(connection)
        # 清理失败的连接
        for c in failed:
            self.disconnect(c)
    
    async def send_personal(self, message: str, websocket: WebSocket):
        """只发给指定连接"""
        await websocket.send_text(message)


manager = ConnectionManager()


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(ws: WebSocket, client_id: str):
    # 路径参数同样适用于 WebSocket
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            # 私聊：只回自己
            await manager.send_personal(f"你说了: {data}", ws)
            # 广播：告诉所有人
            await manager.broadcast(f"用户 {client_id} 说: {data}")
    except WebSocketDisconnect:
        manager.disconnect(ws)
        await manager.broadcast(f"用户 {client_id} 离开了")
\`\`\`

## 五、多客户端广播

广播是 WebSocket 最常见需求：一个人发消息，所有人收到。上面 \`ConnectionManager.broadcast\` 已实现。下面是一个更完整的聊天室。

## 六、JSON 消息协议设计

实时应用消息复杂，用 JSON 协议比纯文本清晰。设计一个聊天室消息协议：

\`\`\`json
// 客户端 → 服务端
{"type": "message", "content": "你好"}
{"type": "join", "room": "general"}

// 服务端 → 客户端
{"type": "message", "from": "alice", "content": "你好", "ts": 1234567890}
{"type": "system", "content": "alice 加入了房间"}
{"type": "user_list", "users": ["alice", "bob"]}
\`\`\`

用 \`type\` 字段区分消息类型，便于客户端路由处理。

## 七、实战：聊天室应用

### Demo 4：完整聊天室

\`\`\`python
import json
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

app = FastAPI()


class ChatMessage(BaseModel):
    """聊天消息模型"""
    type: str            # message / join / leave
    content: str = ""
    sender: str = ""
    room: str = "general"


class RoomManager:
    """按房间管理连接"""
    
    def __init__(self):
        # rooms: dict[room_name, dict[client_id, WebSocket]]
        self.rooms: dict[str, dict[str, WebSocket]] = {}
    
    async def join(self, room: str, client_id: str, ws: WebSocket):
        if room not in self.rooms:
            self.rooms[room] = {}
        self.rooms[room][client_id] = ws
        # 通知房间其他人
        await self.broadcast(room, {
            "type": "system",
            "content": f"{client_id} 加入了房间",
            "ts": self._now(),
        }, exclude=client_id)
    
    async def leave(self, room: str, client_id: str):
        if room in self.rooms and client_id in self.rooms[room]:
            del self.rooms[room][client_id]
            await self.broadcast(room, {
                "type": "system",
                "content": f"{client_id} 离开了房间",
                "ts": self._now(),
            })
    
    async def broadcast(self, room: str, message: dict, exclude: str | None = None):
        """广播到指定房间，可排除某人"""
        if room not in self.rooms:
            return
        failed = []
        for cid, ws in self.rooms[room].items():
            if exclude and cid == exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                failed.append(cid)
        for cid in failed:
            del self.rooms[room][cid]
    
    def get_users(self, room: str) -> list[str]:
        return list(self.rooms.get(room, {}).keys())
    
    @staticmethod
    def _now() -> int:
        return int(datetime.now(timezone.utc).timestamp())


manager = RoomManager()


@app.websocket("/chat/{room}/{client_id}")
async def chat_endpoint(ws: WebSocket, room: str, client_id: str):
    await ws.accept()
    await manager.join(room, client_id, ws)
    
    # 发送当前在线用户
    await ws.send_json({
        "type": "user_list",
        "users": manager.get_users(room),
    })
    
    try:
        while True:
            # 接收 JSON 消息
            data = await ws.receive_json()
            msg = ChatMessage(**data)
            
            if msg.type == "message":
                # 广播聊天消息
                await manager.broadcast(room, {
                    "type": "message",
                    "sender": client_id,
                    "content": msg.content,
                    "ts": manager._now(),
                })
    except WebSocketDisconnect:
        await manager.leave(room, client_id)
\`\`\`

前端配套：

\`\`\`html
<!DOCTYPE html>
<html>
<body>
<input id="msg" placeholder="输入消息">
<button onclick="send()">发送</button>
<div id="log"></div>
<script>
const ws = new WebSocket("ws://127.0.0.1:8000/chat/general/alice");
ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const div = document.getElementById("log");
    if (data.type === "message") {
        div.innerHTML += \`<p>\${data.sender}: \${data.content}</p>\`;
    } else if (data.type === "system") {
        div.innerHTML += \`<p><i>\${data.content}</i></p>\`;
    }
};
function send() {
    const input = document.getElementById("msg");
    ws.send(JSON.stringify({type: "message", content: input.value}));
    input.value = "";
}
</script>
</body>
</html>
\`\`\`

## 八、心跳检测与断线重连

### 为什么要心跳

TCP 连接断开（如客户端断网、路由器重启）时，服务端不一定立即收到 FIN 包，连接可能「假死」——服务端以为还连着，发消息却石沉大海。心跳机制定期探测，及时发现死连接。

### 心跳实现

客户端定期发 \`ping\`，服务端回 \`pong\`。超时未收到则认为断开。

### Demo 5：服务端心跳

\`\`\`python
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


@app.websocket("/ws/heartbeat")
async def ws_heartbeat(ws: WebSocket):
    await ws.accept()
    last_ping = asyncio.get_event_loop().time()
    
    async def heartbeat_check():
        """后台任务：定期检查心跳"""
        nonlocal last_ping
        while True:
            await asyncio.sleep(10)  # 每 10 秒检查
            now = asyncio.get_event_loop().time()
            if now - last_ping > 30:  # 30 秒没 ping，认为断开
                await ws.close(code=1001)  # 1001 = Going Away
                return
    
    # 启动心跳检查任务
    check_task = asyncio.create_task(heartbeat_check())
    try:
        while True:
            data = await ws.receive_json()
            if data.get("type") == "ping":
                last_ping = asyncio.get_event_loop().time()
                await ws.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    finally:
        check_task.cancel()
\`\`\`

### 前端断线重连

\`\`\`javascript
class ReconnectWebSocket {
    constructor(url) {
        this.url = url;
        this.reconnectDelay = 1000;
        this.maxDelay = 30000;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => { this.reconnectDelay = 1000; };
        this.ws.onclose = () => {
            // 指数退避重连
            setTimeout(() => this.connect(), this.reconnectDelay);
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
        };
        this.ws.onmessage = (e) => { /* 处理消息 */ };
    }
    
    sendHeartbeat() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({type: "ping"}));
        }
    }
}
const client = new ReconnectWebSocket("ws://...");
setInterval(() => client.sendHeartbeat(), 5000);  // 每 5 秒心跳
\`\`\`

指数退避（1s → 2s → 4s → 8s ... 封顶 30s）避免服务端刚恢复就被重连请求打爆。

## 九、WebSocket 与依赖注入

WebSocket 也支持 \`Depends\`，但不能用 \`OAuth2PasswordBearer\`（它从 HTTP 头取 token）。WebSocket 的认证一般在连接时通过 query 参数或子协议传 token。

### Demo 6：WebSocket 鉴权

\`\`\`python
import jwt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status

app = FastAPI()
SECRET_KEY = "secret"
ALGORITHM = "HS256"


async def ws_auth(ws: WebSocket) -> str | None:
    """从 query 参数取 token 验证"""
    token = ws.query_params.get("token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.InvalidTokenError:
        return None


@app.websocket("/ws/secure")
async def secure_ws(ws: WebSocket):
    # 鉴权：失败时用 close 拒绝（不能用 HTTP 401，因为已经升级协议了）
    username = await ws_auth(ws)
    if not username:
        # close code 4001 是自定义的「未认证」
        await ws.close(code=4001)
        return
    
    await ws.accept()
    try:
        await ws.send_text(f"欢迎 {username}")
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"{username} 说: {data}")
    except WebSocketDisconnect:
        pass
\`\`\`

前端连接时带 token：

\`\`\`javascript
const ws = new WebSocket("ws://127.0.0.1:8000/ws/secure?token=eyJ...");
\`\`\`

## 十、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 忘了 \`await ws.accept()\` | 必须先接受连接 | accept 后才能收发 |
| 没捕获 WebSocketDisconnect | 客户端断开抛异常 | \`try...except WebSocketDisconnect\` |
| 广播时连接已死 | 仍尝试 send | 发送失败时从列表移除 |
| 同步阻塞操作卡住循环 | WebSocket 是 async | 阻塞操作用 \`run_in_executor\` |
| 心跳不实现 | 假死连接堆积 | 定期 ping/pong + 超时清理 |
| 鉴权用 OAuth2PasswordBearer | WS 没 HTTP 头 | 用 query 参数传 token |
| 多 worker 不共享连接 | 进程间内存隔离 | 用 Redis pub/sub 同步 |
| 消息顺序错乱 | 并发 send | 用锁或 asyncio.Queue 串行化 |

## 十一、设计思想

WebSocket 的设计核心是「**连接生命周期管理**」。HTTP 请求是无状态的、一次性的，处理完就忘；WebSocket 是有状态的长连接，必须显式管理「连接建立 → 消息收发 → 异常断开 → 资源清理」全周期。ConnectionManager 把这种状态管理集中化，避免每个端点重复处理，是「**封装变化**」的体现——连接细节变了只改 Manager，业务代码不动。

心跳机制体现了「**故障检测的主动式设计**」。被动等待对方断开通知是不可靠的（网络中断没有通知），主动探测才能及时发现死连接。这和分布式系统的健康检查、TCP 的 keepalive 是同一思想：**不能假设连接是好的，必须持续验证**。

消息协议设计（\`type\` 字段路由）是「**自描述消息**」模式。每条消息自带类型，接收方按 type 分发处理，比固定格式更灵活、更易扩展。新增消息类型不用改协议框架，只加 handler。这是事件驱动架构的基础，也是 JSON-RPC、gRPC 等协议的共同选择。
`,
  },

  // ============================================================
  // 第 5 章：CORS 跨域配置与原理
  // ============================================================
  {
    id: "pyweb2-fastapi-cors",
    group: "FastAPI 进阶",
    icon: "🌐",
    title: "CORS 跨域配置与原理",
    content: `
## 一、同源策略是什么

浏览器有个安全机制叫**同源策略（Same-Origin Policy）**：JavaScript 脚本默认只能访问「同源」的资源。

「同源」指**协议、域名、端口**三者完全相同：

| URL A | URL B | 是否同源 | 原因 |
|---|---|---|---|
| http://a.com/page | http://a.com/other | ✅ | 同协议域名端口 |
| http://a.com | https://a.com | ❌ | 协议不同 |
| http://a.com:80 | http://a.com:8080 | ❌ | 端口不同 |
| http://a.com | http://b.com | ❌ | 域名不同 |
| http://a.com | http://api.a.com | ❌ | 子域不同 |

### 为什么要有同源策略

防止恶意网站窃取数据。假设没有同源策略：

1. 你登录了银行 \`bank.com\`，cookie 存了。
2. 你又访问恶意网站 \`evil.com\`。
3. \`evil.com\` 的 JS 用 \`fetch("https://bank.com/api/balance")\` 请求银行。
4. 浏览器自动带上 \`bank.com\` 的 cookie。
5. 银行以为是你操作，返回余额。
6. \`evil.com\` 的 JS 读到响应，偷走数据。

同源策略阻止了第 6 步：\`evil.com\` 的 JS 不能读 \`bank.com\` 的响应。

> 注意：同源策略限制的是「JS 读取响应」，不是「请求发不出」。请求实际会发出去（cookie 也带了），只是 JS 读不到响应。这就是 CORS 要解决的——**让服务端显式声明「允许哪些跨域来源读我的响应」**。

## 二、CORS 原理

CORS（Cross-Origin Resource Sharing，跨域资源共享）是 W3C 标准，用一组 HTTP 头让服务端声明跨域策略，浏览器据此决定是否让 JS 读取响应。

### 关键 HTTP 头

| 响应头 | 作用 |
|---|---|
| \`Access-Control-Allow-Origin\` | 允许的来源（\`*\` 或具体域名） |
| \`Access-Control-Allow-Methods\` | 允许的 HTTP 方法 |
| \`Access-Control-Allow-Headers\` | 允许的请求头 |
| \`Access-Control-Allow-Credentials\` | 是否允许带 cookie |
| \`Access-Control-Max-Age\` | 预检结果缓存时间 |
| \`Access-Control-Expose-Headers\` | 允许 JS 读取的响应头 |

## 三、简单请求 vs 预检请求

CORS 把跨域请求分两类，处理流程不同。

### 简单请求

满足以下条件的请求，浏览器直接发，不预检：

- 方法是 \`GET\` / \`HEAD\` / \`POST\`
- 请求头只能是这几个：\`Accept\`、\`Accept-Language\`、\`Content-Language\`、\`Content-Type\`
- \`Content-Type\` 只能是 \`text/plain\`、\`multipart/form-data\`、\`application/x-www-form-urlencoded\`
- 不含自定义头（如 \`X-Token\`）

流程：

\`\`\`
1. 浏览器发请求（带 Origin 头）
2. 服务端返回响应（带 Access-Control-Allow-Origin）
3. 浏览器检查 Allow-Origin 是否匹配 Origin
4. 匹配则让 JS 读响应，否则拦截
\`\`\`

### 预检请求

不满足简单请求条件的（如 PUT/DELETE 方法、\`Content-Type: application/json\`、自定义头），浏览器会先发一个 \`OPTIONS\` 预检请求，问服务端「我能不能发这样的请求」。

流程：

\`\`\`
1. 浏览器发 OPTIONS 预检请求（带 Origin、Access-Control-Request-Method 等）
2. 服务端返回预检响应（带 Allow-Origin、Allow-Methods、Allow-Headers、Max-Age）
3. 浏览器检查：允许则发真实请求，否则拦截
4. 真实请求同简单请求流程
\`\`\`

### 预检请求示例

前端发：

\`\`\`
DELETE /api/items/1 HTTP/1.1
Origin: http://localhost:3000
Content-Type: application/json
X-Token: abc123
\`\`\`

浏览器先发预检：

\`\`\`
OPTIONS /api/items/1 HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: Content-Type, X-Token
\`\`\`

服务端预检响应：

\`\`\`
HTTP/1.1 200
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, X-Token
Access-Control-Max-Age: 3600
\`\`\`

浏览器检查通过，才发真正的 DELETE 请求。\`Max-Age: 3600\` 表示这个预检结果缓存 1 小时，1 小时内同类请求不再预检。

> 为什么 \`application/json\` 会触发预检？因为传统表单只能发三种 Content-Type，JSON 是「非简单」的，浏览器要确认服务端能接受。

## 四、CORSMiddleware 完整配置

FastAPI 用 \`CORSMiddleware\` 处理 CORS。配置在应用启动时一次性完成。

### Demo 1：基础 CORS 配置

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    # 允许的来源列表。生产环境要写具体域名，不要用 ["*"]
    allow_origins=[
        "http://localhost:3000",       # 前端开发服务器
        "http://localhost:5173",       # Vite 默认端口
        "https://myapp.com",           # 生产域名
    ],
    # 是否允许带 cookie。allow_credentials=True 时 allow_origins 不能是 ["*"]
    allow_credentials=True,
    # 允许的 HTTP 方法
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    # 允许的请求头
    allow_headers=["*"],  # 简单起见允许所有，生产建议列具体
    # 预检结果缓存时间（秒）
    max_age=3600,
)


@app.get("/api/data")
async def get_data():
    return {"message": "跨域数据"}
\`\`\`

### 参数详解

#### allow_origins

\`\`\`python
allow_origins=["*"]              # 允许所有来源（不安全，且不能配 credentials）
allow_origins=["http://a.com"]   # 只允许 a.com
allow_origins=["http://a.com", "http://b.com"]  # 多个来源
\`\`\`

> ⚠️ \`allow_origins=["*"]\` 和 \`allow_credentials=True\` **不能同时用**。浏览器规范禁止。如果要带 cookie，必须列具体域名。

#### allow_credentials

\`\`\`python
allow_credentials=True   # 允许跨域请求带 cookie
allow_credentials=False  # 不允许（默认）
\`\`\`

设为 True 时，浏览器跨域请求会带 cookie，服务端也能 \`Set-Cookie\`。但此时 \`allow_origins\` 必须是具体域名（不能用 \`*\`），否则浏览器拒绝。

#### allow_methods

\`\`\`python
allow_methods=["*"]  # 允许所有方法
allow_methods=["GET", "POST"]  # 只允许 GET/POST
\`\`\`

#### allow_headers

\`\`\`python
allow_headers=["*"]  # 允许所有请求头
allow_headers=["Content-Type", "Authorization", "X-Token"]  # 具体列表
\`\`\`

预检请求里客户端的 \`Access-Control-Request-Headers\` 列出它想用的头，服务端用 \`allow_headers\` 回应允许哪些。

#### expose_headers

默认 JS 只能读「简单响应头」：\`Cache-Control\`、\`Content-Language\`、\`Content-Length\`、\`Content-Type\`、\`Expires\`、\`Last-Modified\`、\`Pragma\`。其他响应头（如自定义的 \`X-Total-Count\`）JS 读不到，要在 \`expose_headers\` 声明。

\`\`\`python
expose_headers=["X-Total-Count", "X-Request-Id"]
\`\`\`

### Demo 2：完整生产配置

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 从环境变量读允许的域名，逗号分隔
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # 把字符串拆成列表
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
    expose_headers=["X-Total-Count", "X-Request-Id"],
    max_age=3600,
)
\`\`\`

环境变量 \`.env\`：

\`\`\`
CORS_ORIGINS=https://myapp.com,https://www.myapp.com
\`\`\`

## 五、常见 CORS 错误与排查

### 错误 1：No 'Access-Control-Allow-Origin' header

\`\`\`
Access to fetch at 'http://api.com/data' from origin 'http://app.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header 
is present on the requested resource.
\`\`\`

**原因**：服务端没返回 \`Access-Control-Allow-Origin\` 头。

**排查**：检查 CORSMiddleware 是否正确添加，\`allow_origins\` 是否包含前端域名。

### 错误 2：allow_origins 不能是 * 当 credentials=true

\`\`\`
The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 'include'.
\`\`\`

**原因**：前端 \`fetch(url, {credentials: "include"})\` 或 axios \`withCredentials: true\`，但服务端配了 \`allow_origins=["*"]\`。

**解决**：把 \`allow_origins\` 改成具体域名列表。

### 错误 3：预检请求 OPTIONS 返回 405

\`\`\`
Method DELETE is not allowed
\`\`\`

**原因**：路由只定义了 DELETE，没处理 OPTIONS。FastAPI 的 CORSMiddleware 会自动响应 OPTIONS，但如果中间件顺序不对或路由覆盖了，可能失效。

**排查**：确保 CORSMiddleware 在路由之前添加（\`add_middleware\` 会在路由前执行）。

### 错误 4：自定义头读不到

\`\`\`
Refused to get unsafe header "X-Total-Count"
\`\`\`

**原因**：没配 \`expose_headers\`。

**解决**：

\`\`\`python
expose_headers=["X-Total-Count"]
\`\`\`

### 调试技巧

用 curl 模拟预检请求：

\`\`\`bash
# 模拟预检
curl -X OPTIONS http://127.0.0.1:8000/api/data \\
  -H "Origin: http://localhost:3000" \\
  -H "Access-Control-Request-Method: POST" \\
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \\
  -v
# 看响应头里有没有 Access-Control-Allow-* 系列
\`\`\`

## 六、与代理方案的对比

除了 CORS，另一种解决跨域的方式是**反向代理**：前端请求同源的代理服务器，代理服务器转发到后端。

### Nginx 反向代理

\`\`\`nginx
server {
    listen 80;
    server_name myapp.com;
    
    # 前端静态文件
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # API 反向代理到后端
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

前端请求 \`/api/data\`，Nginx 转发到 \`http://backend:8000/data\`。浏览器看是同源（都是 \`myapp.com\`），不触发 CORS。

### CORS vs 代理对比

| 维度 | CORS | 反向代理 |
|---|---|---|
| 部署 | 后端配中间件 | 加 Nginx |
| 灵活性 | 高（可精细控制） | 中（按路径转发） |
| 性能 | 浏览器直连后端 | 多一跳代理 |
| cookie | 需配 credentials | 同源天然支持 |
| 生产推荐 | ✅ 微服务、多前端 | ✅ 单体部署 |
| 开发期 | ✅ 前后端独立 | 中 |

**生产最佳实践**：两者结合。同站用 Nginx 代理（无跨域），跨站用 CORS。开发期前后端分离跑在不同端口，用 CORS。

### 开发期代理（Vite/Next.js）

前端开发服务器内置代理，把 API 请求转发到后端，避免开发期 CORS：

\`\`\`javascript
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
};
\`\`\`

前端请求 \`/api/data\`，Vite 转发到 \`http://localhost:8000/api/data\`，浏览器看是同源。开发期不用配 CORS，但**生产环境前后端不同域时还是需要 CORS 或 Nginx**。

## 七、CORS 的安全误区

### 误区 1：CORS 是服务端安全机制

**错**。CORS 是**浏览器**的安全机制，服务端只是声明策略。如果用 curl 或 Postman（不经过浏览器），CORS 完全不生效。所以**服务端的权限校验不能依赖 CORS**，CORS 只防「浏览器里的恶意 JS」，不防爬虫。

### 误区 2：allow_origins=["*"] 最方便

\`*\` 意味着任何网站都能跨域访问你的 API。如果 API 是公开的（如天气数据）无所谓；如果是私有 API（如用户数据），\`*\` 等于裸奔——任何恶意网站都能调你的 API（虽然读响应受限，但请求会发出，可能触发副作用如 POST 创建数据）。

### 误区 3：CORS 防止 CSRF

**不完全**。CORS 限制「JS 读响应」，但「请求发出去」不被阻止（简单请求）。CSRF 防御要用 CSRF Token 或 SameSite cookie，不能靠 CORS。

## 八、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| \`*\` + credentials 冲突 | 规范禁止 | credentials=True 时用具体域名 |
| 预检 OPTIONS 404 | 中间件没生效 | 确认 add_middleware 在路由前 |
| 自定义头读不到 | 没 expose | 配 \`expose_headers\` |
| 前端报 CORS 但 curl 正常 | curl 不检查 CORS | 用浏览器开发者工具看 Network |
| cookie 跨域不带 | credentials 没开 | 前端 \`withCredentials\` + 后端 \`allow_credentials\` |
| \`allow_methods=["*"]\` 不生效 | 某些浏览器不支持 | 列具体方法 |
| 子域跨域 | a.com 和 api.a.com 不同源 | 显式列出或用代理 |
| 生产还报 CORS | 域名没配对 | 检查 allow_origins 含生产域名 |

## 九、设计思想

CORS 体现了「**显式授权**」安全模型。同源策略是默认拒绝（deny by default），CORS 让服务端显式声明「我信任这些来源」。这种「默认拒绝 + 显式允许」比「默认允许 + 黑名单」更安全，因为漏配的来源默认是拒绝的。这和防火墙规则、IAM 策略是同一哲学。

\`allow_credentials=True\` 时禁止 \`allow_origins=["*"]\` 这个限制，体现了「**安全降级要有底线**」。方便性（\`*\`）和安全性（带 cookie）不能同时最大化，浏览器规范选择保护安全。这种「冲突时优先安全」的设计，避免了开发者无意中把带 cookie 的 API 暴露给全网。

CORS 与反向代理的取舍，反映了「**跨域问题在哪里解决**」的架构选择。CORS 在后端解决（声明头），代理在网络层解决（同源化）。前者灵活但每个后端要配，后者统一但增加网络跳。没有银弹，根据部署拓扑选择——微服务多前端用 CORS，单体应用用代理。
`,
  },

  // ============================================================
  // 第 6 章：FastAPI + SQLAlchemy 集成
  // ============================================================
  {
    id: "pyweb2-fastapi-db",
    group: "FastAPI 进阶",
    icon: "🗄️",
    title: "FastAPI + SQLAlchemy 集成",
    content: `
## 一、项目结构设计

FastAPI + SQLAlchemy 项目推荐分层结构，职责清晰：

\`\`\`
myproject/
├── app/
│   ├── __init__.py
│   ├── main.py              # 应用入口，创建 FastAPI 实例
│   ├── database.py          # 数据库引擎、会话工厂
│   ├── models.py            # SQLAlchemy ORM 模型（表结构）
│   ├── schemas.py           # Pydantic 模型（请求/响应 schema）
│   ├── crud.py              # 数据库操作函数（CRUD）
│   ├── dependencies.py      # 公共依赖（get_db 等）
│   └── routers/
│       ├── __init__.py
│       ├── users.py         # 用户相关路由
│       └── items.py         # 物品相关路由
├── alembic/                 # 数据库迁移
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
└── .env
\`\`\`

分层职责：

| 层 | 文件 | 职责 |
|---|---|---|
| 入口 | main.py | 创建 app、注册路由、中间件 |
| 数据库 | database.py | 引擎、SessionLocal、Base |
| 模型 | models.py | ORM 模型，映射表结构 |
| Schema | schemas.py | Pydantic，请求/响应数据形状 |
| CRUD | crud.py | 数据库操作，纯函数 |
| 路由 | routers/ | HTTP 端点，调用 CRUD |
| 依赖 | dependencies.py | get_db、get_current_user |

关键设计：**models 和 schemas 分离**。models 是数据库表结构（SQLAlchemy），schemas 是 API 数据形状（Pydantic）。两者不混用，因为：

- 数据库模型有安全字段（如 \`hashed_password\`），不该出现在 API 响应里。
- API 请求字段（如 \`password\`）不该存进数据库表。
- 响应可能要嵌套、裁剪、合并多个表的数据。

## 二、数据库引擎与会话依赖

### Demo 1：database.py

\`\`\`python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 数据库连接 URL
# SQLite：sqlite:///./test.db（相对路径）或 sqlite:///////abs/path（绝对路径4个斜杠）
# PostgreSQL：postgresql://user:pass@localhost:5432/dbname
# MySQL：mysql+pymysql://user:pass@localhost:3306/dbname
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# create_engine 创建引擎
# connect_args 仅 SQLite 需要，允许多线程访问
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite 专用
    # echo=True,  # 开发期打印 SQL 日志
)

# SessionLocal 是会话工厂，每次调用生成一个独立 Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# SQLAlchemy 2.0 风格：用 DeclarativeBase 作为基类
class Base(DeclarativeBase):
    """所有 ORM 模型的基类"""
    pass
\`\`\`

### Demo 2：会话依赖

\`\`\`python
# app/dependencies.py
from typing import Generator
from sqlalchemy.orm import Session
from .database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """数据库会话依赖
    
    每个请求生成一个独立的 Session，请求结束自动关闭。
    用 yield（生成器依赖）确保无论成功还是异常都关闭。
    """
    db = SessionLocal()
    try:
        # yield 之前：请求开始时执行（创建会话）
        yield db
        # yield 之后：请求结束时执行（无论成功失败）
    finally:
        db.close()
\`\`\`

为什么用 \`yield\` 而不是 \`return\`？因为 Session 必须在请求结束后关闭，\`yield\` 依赖的 finally 块保证关闭。FastAPI 自动管理 yield 依赖的生命周期。

## 三、模型定义（SQLAlchemy ORM）

### Demo 3：models.py

\`\`\`python
# app/models.py
from sqlalchemy import Integer, String, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    # SQLAlchemy 2.0 风格：用 Mapped[type] + mapped_column
    # Mapped[int] 的类型注解会被 SQLAlchemy 用来推断列类型
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # server_default 用数据库函数设默认值，created_at 自动用 CURRENT_TIMESTAMP
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # relationship 定义关联关系（不是列，是 ORM 便利）
    # back_populates 双向关联，items 是这个用户拥有的物品列表
    items: Mapped[list["Item"]] = relationship(back_populates="owner")


class Item(Base):
    """物品表"""
    __tablename__ = "items"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # ForeignKey 外键，关联 users.id
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # 反向关联，owner 是这个物品的拥有者对象
    owner: Mapped["User"] = relationship(back_populates="items")
\`\`\`

### SQLAlchemy 1.x vs 2.0 风格

\`\`\`python
# 1.x 旧风格（不推荐）
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))

# 2.0 新风格（推荐，类型提示更友好）
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
\`\`\`

2.0 风格的好处：\`Mapped[str]\` 让编辑器知道属性类型，自动补全更好；\`str | None\` 直接表达可空。

## 四、Pydantic schema（请求/响应模型分离）

### Demo 4：schemas.py

\`\`\`python
# app/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


# ========== User 相关 Schema ==========

class UserBase(BaseModel):
    """用户基础字段（创建和更新共用）"""
    username: str
    email: EmailStr  # EmailStr 自动校验邮箱格式，需 pip install pydantic[email]


class UserCreate(UserBase):
    """创建用户：基础字段 + 密码"""
    password: str  # 明文密码，服务端哈希后存库


class UserUpdate(BaseModel):
    """更新用户：所有字段可选"""
    username: str | None = None
    email: EmailStr | None = None


class User(UserBase):
    """用户响应：基础字段 + 系统字段，但不含密码"""
    id: int
    is_active: bool
    created_at: datetime
    
    # Pydantic v2 配置：允许从 ORM 对象读取属性
    model_config = ConfigDict(from_attributes=True)


# ========== Item 相关 Schema ==========

class ItemBase(BaseModel):
    title: str
    description: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class Item(ItemBase):
    id: int
    owner_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ItemWithOwner(Item):
    """带拥有者信息的物品（嵌套）"""
    owner: User
\`\`\`

### Schema 继承设计

\`\`\`
BaseModel
  ├── UserBase (username, email)        # 共用基础
  │     ├── UserCreate (+ password)     # 创建请求
  │     └── User (+ id, is_active, ...) # 响应
  └── UserUpdate (所有字段可选)          # 更新请求
\`\`\`

- \`UserBase\`：创建和更新共用的字段。
- \`UserCreate\`：继承 Base 加 password，是请求体形状。
- \`User\`：继承 Base 加系统字段（id、时间），是响应形状，**不含 password**。
- \`UserUpdate\`：独立定义，所有字段可选（PATCH 语义）。

这种设计确保 \`password\` 永远不会出现在响应里（因为 \`User\` schema 没这个字段），即使你不小心 return 了整个 ORM 对象。

## 五、CRUD 路由实现

### Demo 5：crud.py

\`\`\`python
# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas


# ========== User CRUD ==========

def get_user(db: Session, user_id: int) -> models.User | None:
    """按 ID 查用户"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> models.User | None:
    """按邮箱查用户（注册时检查是否已存在）"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[models.User]:
    """分页查用户列表"""
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """创建用户"""
    # 注意：这里 password 应该先哈希，演示用简化
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = pwd_context.hash(user.password)
    
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed,
    )
    db.add(db_user)        # 加入会话
    db.commit()            # 提交事务
    db.refresh(db_user)    # 刷新，获取数据库生成的 id
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    user = get_user(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


# ========== Item CRUD ==========

def get_items(db: Session, skip: int = 0, limit: int = 100) -> list[models.Item]:
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, owner_id: int) -> models.Item:
    db_item = models.Item(**item.model_dump(), owner_id=owner_id)
    # model_dump() 把 Pydantic 模型转 dict，** 解包传给 ORM 模型
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
\`\`\`

### Demo 6：routers/users.py

\`\`\`python
# app/routers/users.py
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..dependencies import get_db

router = APIRouter(prefix="/users", tags=["用户"])


@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Annotated[Session, Depends(get_db)]):
    """创建用户"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="邮箱已注册")
    return crud.create_user(db=db, user=user)


@router.get("/", response_model=list[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """用户列表"""
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Annotated[Session, Depends(get_db)]):
    """查单个用户"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Annotated[Session, Depends(get_db)]):
    if not crud.delete_user(db, user_id):
        raise HTTPException(404, "用户不存在")
    return {"ok": True}
\`\`\`

\`response_model=schemas.User\` 的作用：即使路由返回 ORM 对象，FastAPI 会用 \`schemas.User\` 过滤——只有 User schema 的字段才出现在响应里。\`hashed_password\` 自动被剔除。

### Demo 7：main.py

\`\`\`python
# app/main.py
from fastapi import FastAPI
from .database import engine, Base
from .routers import users, items

# 创建表（开发用。生产用 Alembic 迁移，不用 create_all）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="My API")

# 注册路由
app.include_router(users.router)
app.include_router(items.router)


@app.get("/")
def root():
    return {"message": "API 运行中"}
\`\`\`

## 六、异步 SQLAlchemy（async session）

FastAPI 是异步框架，但默认 SQLAlchemy 是同步的。同步 DB 操作会阻塞事件循环，高并发下成瓶颈。用 **SQLAlchemy 异步版** 解决。

### 安装异步驱动

\`\`\`bash
# PostgreSQL 异步驱动
pip install asyncpg
# MySQL 异步驱动
pip install aiomysql
# SQLite 异步驱动
pip install aiosqlite
\`\`\`

### Demo 8：异步 database.py

\`\`\`python
# app/database.py（异步版）
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# 注意 URL 前缀：postgresql+asyncpg://、sqlite+aiosqlite:///
ASYNC_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"

# 异步引擎
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# 异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_async_db():
    """异步会话依赖"""
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
\`\`\`

### Demo 9：异步 CRUD

\`\`\`python
# app/crud.py（异步版）
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas


async def get_user(db: AsyncSession, user_id: int) -> models.User | None:
    # SQLAlchemy 2.0 异步用 select() 风格，不用 query()
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalar_one_or_none()


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.User]:
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    return result.scalars().all()


async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    db_user = models.User(username=user.username, email=user.email)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
\`\`\`

### Demo 10：异步路由

\`\`\`python
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .. import crud, schemas
from ..database import get_async_db

router = APIRouter()


@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_async_db)]):
    user = await crud.get_user(db, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    return user
\`\`\`

### 同步 vs 异步选择

| 维度 | 同步 SQLAlchemy | 异步 SQLAlchemy |
|---|---|---|
| 写法 | \`db.query()\` | \`await db.execute(select())\` |
| 性能 | 阻塞事件循环 | 不阻塞 |
| 复杂度 | 低 | 中 |
| 生态 | 全 | 部分（部分库不支持异步） |

**建议**：IO 密集（高并发、慢查询）用异步；业务简单或迁移成本高用同步（FastAPI 会自动用线程池跑同步路由，不会完全卡死）。

## 七、数据库迁移与 Alembic 集成

\`create_all()\` 只能建表，不能改表结构（加列、改类型、删表）。生产环境表结构会演进，需要**迁移工具**记录每次变更。Alembic 是 SQLAlchemy 官方迁移工具。

### 安装与初始化

\`\`\`bash
pip install alembic
# 初始化
alembic init alembic
\`\`\`

生成结构：

\`\`\`
alembic.ini          # 配置
alembic/
├── env.py           # 迁移环境
├── script.py.mako   # 模板
└── versions/        # 迁移脚本存放
\`\`\`

### 配置 alembic.ini

\`\`\`ini
# alembic.ini
[alembic]
# 数据库 URL（和 database.py 一致）
sqlalchemy.url = sqlite:///./test.db
\`\`\`

### 配置 env.py（关键）

让 Alembic 知道你的 models 和 Base：

\`\`\`python
# alembic/env.py
from app.database import Base
from app import models  # 导入所有模型，确保 metadata 注册
target_metadata = Base.metadata
\`\`\`

### 迁移工作流

\`\`\`bash
# 1. 改完 models.py 后，自动生成迁移脚本
alembic revision --autogenerate -m "add user table"
# 会在 versions/ 生成一个 xxx_add_user_table.py

# 2. 检查生成的脚本（autogenerate 不完美，可能要手动改）

# 3. 执行迁移
alembic upgrade head

# 4. 回滚（撤销上一步）
alembic downgrade -1

# 5. 查看状态
alembic current
alembic history
\`\`\`

### 迁移脚本示例

\`\`\`python
# versions/xxx_add_user_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # 创建 users 表
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(50), unique=True),
        sa.Column("email", sa.String(100), unique=True),
    )


def downgrade():
    op.drop_table("users")
\`\`\`

### 最佳实践

1. **autogenerate 不完全可靠**：它检测不到列名改名（会看成删列+加列）、检查约束变化。生成后要人工审查。
2. **每次 model 变更立即生成迁移**：不要攒一堆改动一起迁移，增量越小越好回滚。
3. **迁移脚本要进版本控制**：迁移历史和代码同步演进。
4. **生产迁移先备份**：\`alembic upgrade\` 前备份数据库。
5. **不要删旧迁移**：即使合并了，保持线性历史。

## 八、完整项目示例整合

### Demo 11：完整应用

\`\`\`python
# app/main.py 完整版
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .database import engine, Base
from .routers import users, items


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行（生产用 Alembic，开发可用 create_all）
    Base.metadata.create_all(bind=engine)
    yield
    # 关闭时执行（清理资源）


app = FastAPI(
    title="FastAPI + SQLAlchemy 示例",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(users.router, prefix="/api")
app.include_router(items.router, prefix="/api")
\`\`\`

启动：

\`\`\`bash
uvicorn app.main:app --reload
\`\`\`

访问 \`/docs\`，可以：

1. POST /api/users/ 创建用户
2. GET /api/users/ 看列表
3. POST /api/users/{id}/items/ 给用户创建物品
4. GET /api/items/ 看所有物品

## 九、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 响应含 hashed_password | response_model 没设 | 加 \`response_model=schemas.User\` |
| \`from_attributes\` 报错 | Pydantic v2 配置 | \`model_config = ConfigDict(from_attributes=True)\` |
| SQLite 多线程报错 | check_same_thread | 加 \`connect_args={"check_same_thread": False}\` |
| 会话泄露 | 没 close | 用 \`yield\` 依赖自动关闭 |
| commit 后对象失效 | expire_on_commit | 异步设 \`expire_on_commit=False\` |
| N+1 查询 | 循环里查关联 | 用 \`selectinload\` / \`joinedload\` 预加载 |
| \`create_all\` 不建表 | 没导入 models | 在 main.py 导入 models 触发注册 |
| autogenerate 漏检测 | 改名被误判 | 人工审查迁移脚本 |
| 异步路由用同步 db | 混用 | 异步路由配异步依赖 |
| 迁移在多机不一致 | 没跑 upgrade | 部署脚本里加 \`alembic upgrade head\` |

### N+1 查询问题

\`\`\`python
# 错误：N+1 查询
users = db.query(User).all()  # 1 次查所有用户
for u in users:
    print(u.items)  # 每个用户查一次 items → N 次

# 正确：预加载
from sqlalchemy.orm import selectinload
users = db.query(User).options(selectinload(User.items)).all()  # 只 2 次
\`\`\`

\`selectinload\` 用 IN 查询一次把所有关联 items 查出来，避免循环查询。

## 十、设计思想

models 与 schemas 分离体现了「**关注点分离**」。数据库模型关心「数据怎么存」（表结构、关系、索引），API schema 关心「数据怎么传」（字段、校验、是否暴露）。把它们混在一起（比如用 ORM 模型当响应模型）会导致安全字段泄露、API 耦合数据库结构。分离后，改表结构不影响 API 契约，改 API 不必动数据库，演进更独立。

CRUD 函数层体现了「**数据访问抽象**」。路由不直接写 SQL，调 crud 函数。好处：SQL 集中可审计、可测试、可替换（换数据库只改 crud）。这种 Repository 模式的轻量版，让业务逻辑和存储细节解耦。

Alembic 迁移体现了「**演进式数据库设计**」。数据库 schema 不是一次设计定型的，会随业务演进。迁移工具记录每次变更，让 schema 变更有序、可追溯、可回滚。这比手动改表或 \`create_all\` 更可靠，是生产级项目的必需品。迁移脚本进版本控制，让数据库结构和代码同步演进，是「基础设施即代码」的体现。
`,
  },

  // ============================================================
  // 第 7 章：测试与依赖覆盖
  // ============================================================
  {
    id: "pyweb2-fastapi-testing",
    group: "FastAPI 进阶",
    icon: "🧪",
    title: "测试与依赖覆盖",
    content: `
## 一、为什么测试 API

API 是后端的核心产物，测试保证：

1. **正确性**：接口按预期工作，输入产出正确输出。
2. **回归保护**：改代码不破坏已有功能。
3. **文档作用**：测试用例就是接口的使用示例。
4. **重构信心**：有测试才敢大刀阔斧重构。

API 测试的层次：

| 层级 | 测什么 | 工具 |
|---|---|---|
| 单元测试 | 单个函数/方法 | pytest |
| 集成测试 | 多组件协作（如路由+DB） | TestClient |
| 端到端测试 | 完整请求链路 | TestClient + 真实 DB |

FastAPI 的 \`TestClient\` 让你能用 Python 直接测 HTTP 接口，不用启动真实服务器。

## 二、TestClient 详解

\`TestClient\` 基于 \`httpx\`（FastAPI 0.100+ 用 httpx 替代了 requests），能像发真实 HTTP 请求一样测应用，但不需要开端口。

### 安装

\`\`\`bash
pip install pytest httpx
# FastAPI 的 TestClient 需要 httpx
\`\`\`

### Demo 1：基础 TestClient

\`\`\`python
# app/main.py
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "hello"}


@app.get("/items/{item_id}")
async def get_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
\`\`\`

\`\`\`python
# tests/test_main.py
from fastapi.testclient import TestClient
from app.main import app

# 创建测试客户端，传入 app
client = TestClient(app)


def test_root():
    """测试根路径"""
    # client.get 发 GET 请求，返回 Response 对象
    response = client.get("/")
    # 断言状态码
    assert response.status_code == 200
    # response.json() 解析响应体
    assert response.json() == {"message": "hello"}


def test_get_item():
    """测试路径参数和查询参数"""
    response = client.get("/items/42?q=search")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42, "q": "search"}


def test_get_item_without_q():
    """q 是可选的"""
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json() == {"item_id": 1, "q": None}


def test_get_item_invalid_id():
    """item_id 必须是 int，传字符串返回 422"""
    response = client.get("/items/abc")
    assert response.status_code == 422  # Pydantic 校验失败
\`\`\`

运行：

\`\`\`bash
pytest tests/test_main.py -v
\`\`\`

### TestClient 的特点

- 不启动真实服务器，直接在内存调用 ASGI app。
- 支持所有 HTTP 方法：\`client.get/post/put/delete/patch\`。
- 支持 JSON body：\`client.post("/", json={"key": "value"})\`。
- 支持表单、文件、headers、cookies。
- 同步接口（即使路由是 async，TestClient 内部用 anyio 转同步）。

## 三、测试 GET/POST/PUT/DELETE

### Demo 2：完整 CRUD 测试

\`\`\`python
# tests/test_items.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_item():
    """POST 创建"""
    response = client.post(
        "/items/",
        json={"name": "苹果", "price": 5.5},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "苹果"
    assert data["price"] == 5.5
    assert "id" in data


def test_create_item_invalid():
    """POST 校验失败"""
    # 缺少必填字段 name
    response = client.post("/items/", json={"price": 5.5})
    assert response.status_code == 422


def test_get_item():
    """GET 单个"""
    # 先创建
    create = client.post("/items/", json={"name": "香蕉", "price": 3})
    item_id = create.json()["id"]
    # 再查
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "香蕉"


def test_get_item_not_found():
    """GET 不存在的资源返回 404"""
    response = client.get("/items/99999")
    assert response.status_code == 404


def test_update_item():
    """PUT 更新"""
    create = client.post("/items/", json={"name": "梨", "price": 2})
    item_id = create.json()["id"]
    
    response = client.put(
        f"/items/{item_id}",
        json={"name": "鸭梨", "price": 3},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "鸭梨"


def test_delete_item():
    """DELETE 删除"""
    create = client.post("/items/", json={"name": "葡萄", "price": 8})
    item_id = create.json()["id"]
    
    response = client.delete(f"/items/{item_id}")
    assert response.status_code == 200
    
    # 删完再查应该 404
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 404
\`\`\`

## 四、测试数据库（SQLite 内存）

测试不能污染开发数据库，用 **SQLite 内存数据库**：\`sqlite:///\`\`（三个斜杠，内存模式），测试结束自动消失。

### Demo 3：测试数据库配置

\`\`\`python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app import models

# SQLite 内存数据库，每个测试会话独立
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


# pytest fixture：在测试前建表，测试后删表
@pytest.fixture()
def db():
    """每个测试函数用独立的数据库会话"""
    # 测试前建表
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # 测试后删表，确保隔离
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client(db):
    """覆盖 get_db 依赖，用测试数据库"""
    # 把 get_db 替换成返回测试会话的函数
    def override_get_db():
        try:
            yield db
        finally:
            pass  # 由 db fixture 关闭
    
    app.dependency_overrides[get_db] = override_get_db
    # 创建测试客户端
    with TestClient(app) as c:
        yield c
    # 清理覆盖
    app.dependency_overrides.clear()
\`\`\`

### Demo 4：用测试数据库测 CRUD

\`\`\`python
# tests/test_users.py
from tests.conftest import client, db


def test_create_user(client):
    """用测试数据库创建用户"""
    response = client.post(
        "/users/",
        json={"username": "alice", "email": "alice@test.com", "password": "secret"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@test.com"
    # 响应不应含密码
    assert "password" not in data
    assert "hashed_password" not in data


def test_create_duplicate_email(client):
    """重复邮箱注册报错"""
    client.post("/users/", json={
        "username": "a", "email": "dup@test.com", "password": "p"
    })
    response = client.post("/users/", json={
        "username": "b", "email": "dup@test.com", "password": "p"
    })
    assert response.status_code == 400


def test_get_users(client):
    """列表查询"""
    client.post("/users/", json={
        "username": "u1", "email": "u1@t.com", "password": "p"
    })
    client.post("/users/", json={
        "username": "u2", "email": "u2@t.com", "password": "p"
    })
    response = client.get("/users/")
    assert response.status_code == 200
    assert len(response.json()) == 2
\`\`\`

## 五、app.dependency_overrides 覆盖依赖

这是 FastAPI 测试的**核心武器**。生产代码依赖 \`get_db\`（连生产库），测试时把它替换成连测试库的函数，**不改业务代码**。

### 覆盖原理

\`\`\`python
# 生产代码
def get_db():
    db = SessionLocal()  # 生产会话
    yield db
    db.close()

@app.get("/users/")
def list_users(db: Session = Depends(get_db)):  # 依赖 get_db
    return db.query(User).all()

# 测试时
def test_db():
    def override():
        db = TestSessionLocal()  # 测试会话
        yield db
        db.close()
    # 把 get_db 替换成 override
    app.dependency_overrides[get_db] = override
    # 现在 list_users 调用时，get_db 返回测试会话
\`\`\`

### Demo 5：覆盖认证依赖

测受保护端点时，不想真的走 JWT 流程，可以覆盖 \`get_current_user\`：

\`\`\`python
# tests/conftest.py 追加
from app.dependencies import get_current_user
from app.schemas import User


@pytest.fixture()
def auth_client(client):
    """已登录的测试客户端"""
    # 伪造一个用户，跳过真实认证
    fake_user = User(id=1, username="testuser", is_active=True)
    
    def override_auth():
        return fake_user
    
    app.dependency_overrides[get_current_user] = override_auth
    yield client
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture()
def anon_client(client):
    """未登录客户端（覆盖成抛异常）"""
    from fastapi import HTTPException
    
    def override_auth():
        raise HTTPException(401, "Not authenticated")
    
    app.dependency_overrides[get_current_user] = override_auth
    yield client
    app.dependency_overrides.pop(get_current_user, None)
\`\`\`

### Demo 6：测受保护端点

\`\`\`python
# tests/test_protected.py
from tests.conftest import auth_client, anon_client


def test_get_me_authenticated(auth_client):
    """已登录能访问 /me"""
    response = auth_client.get("/me")
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_get_me_unauthenticated(anon_client):
    """未登录被拒"""
    response = anon_client.get("/me")
    assert response.status_code == 401


def test_get_me_no_override(client):
    """不覆盖依赖时，需要真 token"""
    # 没有 Authorization 头，被 OAuth2PasswordBearer 拦截
    response = client.get("/me")
    assert response.status_code == 401
\`\`\`

## 六、pytest fixtures

fixture 是 pytest 的依赖注入，用于测试前置准备和后置清理。

### fixture 作用域

| scope | 生命周期 | 适用 |
|---|---|---|
| \`function\`（默认） | 每个测试函数 | 独立隔离的 DB 会话 |
| \`class\` | 每个测试类 | 共享昂贵资源 |
| \`module\` | 每个测试文件 | 共享配置 |
| \`session\` | 整个测试会话 | 全局只创建一次（如引擎） |

### Demo 7：fixture 进阶

\`\`\`python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# session 级：整个测试会话只建一次引擎
@pytest.fixture(scope="session")
def engine():
    """测试引擎，session 级复用"""
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    yield eng
    eng.dispose()


# function 级：每个测试函数建一次表
@pytest.fixture(scope="function")
def db_session(engine):
    """每个测试独立的 DB 会话"""
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


# fixture 可以依赖其他 fixture
@pytest.fixture(scope="function")
def client(db_session):
    """client 依赖 db_session"""
    def override():
        yield db_session
    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
\`\`\`

### fixture 参数化

\`\`\`python
@pytest.fixture(params=[1, 2, 100])
def user_id(request):
    """参数化 fixture，会跑 3 次"""
    return request.param

def test_get_user(client, user_id):
    # 这个测试会跑 3 次，user_id 分别是 1, 2, 100
    response = client.get(f"/users/{user_id}")
    assert response.status_code in (200, 404)
\`\`\`

## 七、测试认证端点

测认证端点有两种策略：

1. **覆盖依赖**：跳过认证，直接返回伪造用户（前面 Demo 5）。
2. **走真实流程**：先注册登录拿真 token，再带 token 测。适合测认证本身。

### Demo 8：走真实认证流程

\`\`\`python
# tests/test_auth.py
from tests.conftest import client


def test_register_and_login(client):
    """注册后能登录"""
    # 1. 注册
    response = client.post("/register", json={
        "username": "alice",
        "email": "alice@test.com",
        "password": "secret123",
    })
    assert response.status_code == 200
    
    # 2. 登录（注意是表单格式）
    response = client.post(
        "/token",
        data={"username": "alice", "password": "secret123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token
    
    # 3. 带 token 访问受保护端点
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "alice"


def test_login_wrong_password(client):
    """密码错登录失败"""
    # 先注册
    client.post("/register", json={
        "username": "bob", "email": "bob@t.com", "password": "correct"
    })
    # 用错密码登录
    response = client.post(
        "/token",
        data={"username": "bob", "password": "wrong"},
    )
    assert response.status_code == 401


def test_protected_without_token(client):
    """没 token 访问受保护端点被拒"""
    response = client.get("/users/me")
    assert response.status_code == 401


def test_protected_with_invalid_token(client):
    """无效 token 被拒"""
    response = client.get(
        "/users/me",
        headers={"Authorization": "Bearer invalidtoken123"},
    )
    assert response.status_code == 401
\`\`\`

> 注意登录请求用 \`data=\`（表单）不是 \`json=\`，因为 \`OAuth2PasswordRequestForm\` 解析表单格式。

## 八、测试 WebSocket

WebSocket 用 \`TestClient.websocket_connect\` 测试。

### Demo 9：测试 WebSocket

\`\`\`python
# tests/test_ws.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_websocket_echo():
    """测试 WebSocket echo"""
    # 用 websocket_connect 建立连接
    with client.websocket_connect("/ws") as ws:
        # 发送文本
        ws.send_text("Hello")
        # 接收响应
        data = ws.receive_text()
        assert data == "echo: Hello"


def test_websocket_json():
    """测试 JSON 消息"""
    with client.websocket_connect("/ws/json") as ws:
        ws.send_json({"action": "ping", "ts": 123})
        data = ws.receive_json()
        assert data == {"action": "pong", "ts": 123}


def test_websocket_chat():
    """测试聊天室"""
    # 模拟两个客户端
    with client.websocket_connect("/chat/room1/alice") as alice, \\
         client.websocket_connect("/chat/room1/bob") as bob:
        # bob 收到 alice 加入通知
        # alice 收到用户列表
        alice_list = alice.receive_json()
        assert alice_list["type"] == "user_list"
        
        # alice 发消息
        alice.send_json({"type": "message", "content": "你好"})
        # bob 应该收到
        msg = bob.receive_json()
        assert msg["type"] == "message"
        assert msg["content"] == "你好"
        assert msg["sender"] == "alice"
\`\`\`

### WebSocket 测试注意点

- 用 \`with\` 语句确保连接关闭，否则测试卡住。
- \`receive_*\` 是阻塞的，如果服务端不回复会一直等。设超时或确保有回复。
- 多客户端场景要按消息顺序 receive，否则消息堆积。

## 九、覆盖率测量

覆盖率（coverage）衡量测试执行了多少代码。用 \`pytest-cov\` 插件。

### 安装与使用

\`\`\`bash
pip install pytest-cov

# 运行测试并测覆盖率
pytest --cov=app --cov-report=term-missing tests/

# --cov=app 指定测 app 目录的覆盖率
# --cov-report=term-missing 在终端显示未覆盖的行
# --cov-report=html 生成 HTML 报告
\`\`\`

输出示例：

\`\`\`
---------- coverage: platform darwin, python 3.12 ----------
Name                    Stmts   Miss  Cover   Missing
-----------------------------------------------------
app/__init__.py             0      0   100%
app/main.py                15      2    87%   23-24
app/crud.py                30      0   100%
app/routers/users.py       25      3    88%   45-47
app/dependencies.py        12      0   100%
-----------------------------------------------------
TOTAL                      82      5    94%
\`\`\`

- \`Stmts\`：语句数
- \`Miss\`：未执行语句数
- \`Cover\`：覆盖率百分比
- \`Missing\`：未覆盖的行号

### Demo 10：覆盖率配置

在 \`pyproject.toml\` 或 \`setup.cfg\` 配置：

\`\`\`toml
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=app --cov-report=term-missing --cov-report=html"
testpaths = ["tests"]

[tool.coverage.run]
source = ["app"]
omit = [
    "app/tests/*",
    "app/__init__.py",
]

[tool.coverage.report]
# 低于 80% 覆盖率的文件标记为失败
fail_under = 80
# 显示未覆盖行
show_missing = true
\`\`\`

### 覆盖率目标

| 模块 | 建议覆盖率 | 说明 |
|---|---|---|
| 业务核心（crud、service） | 90%+ | 必须高覆盖 |
| 路由层 | 80%+ | 主要测 happy path 和常见错误 |
| 工具函数 | 95%+ | 纯函数易测 |
| 配置、入口 | 50%+ | 难测，可低 |
| 异常分支 | 尽量覆盖 | 防御性测试 |

> 覆盖率不是越高越好。100% 覆盖率不代表没有 bug——它只说明代码被执行过，不说明所有边界条件都测了。追求有意义的覆盖（关键路径、边界值），而非数字好看。

## 十、测试最佳实践

### 1. 测试命名

\`\`\`python
# 好：描述行为
def test_create_user_with_valid_data():
    ...

def test_create_user_with_duplicate_email_returns_400():
    ...

def test_login_with_wrong_password_returns_401():
    ...

# 差：无意义
def test_user():
    ...
def test_1():
    ...
\`\`\`

### 2. AAA 模式

每个测试遵循 Arrange-Act-Assert：

\`\`\`python
def test_create_user():
    # Arrange：准备数据
    payload = {"username": "alice", "email": "a@t.com", "password": "p"}
    
    # Act：执行操作
    response = client.post("/users/", json=payload)
    
    # Assert：验证结果
    assert response.status_code == 200
    assert response.json()["username"] == "alice"
\`\`\`

### 3. 测试隔离

每个测试独立，不依赖其他测试的执行顺序：

\`\`\`python
# 差：依赖前一个测试创建的数据
def test_a():
    client.post("/users/", json={...})

def test_b():
    # 假设 test_a 已经创建了用户（顺序依赖，脆弱）
    response = client.get("/users/")
    assert len(response.json()) == 1  # 如果 test_a 没跑就失败

# 好：每个测试自己准备数据
def test_get_users():
    # 自己创建数据
    client.post("/users/", json={...})
    response = client.get("/users/")
    assert len(response.json()) == 1
\`\`\`

用内存数据库 + function 级 fixture 确保每个测试从干净状态开始。

### 4. 测试金字塔

\`\`\`
      /  E2E  \\      少（慢、脆）
     / 集成测试 \\     中
    /  单元测试  \\    多（快、稳）
\`\`\`

多数测试应是单元测试（快、定位准），少量集成测试（测组件协作），极少数 E2E（测完整流程）。FastAPI 的 TestClient 测的是集成测试层。

## 十一、常见易错点

| 易错点 | 原因 | 解决 |
|---|---|---|
| 测试互相影响 | 共享数据库状态 | 用 function 级 fixture 隔离 |
| \`dependency_overrides\` 没清理 | 影响后续测试 | fixture 的 finally 里 clear |
| 登录测试用 JSON | OAuth2 要表单 | 用 \`data=\` 不是 \`json=\` |
| WebSocket 测试卡住 | receive 阻塞 | 确保有回复或设超时 |
| 覆盖率虚高 | 测了但没断言 | 测试要有 assert |
| 异步测试报错 | pytest 默认不支持 async | 装 \`pytest-asyncio\` |
| 测试连了生产库 | 没覆盖 get_db | 必须 dependency_overrides |
| fixture 循环依赖 | A 依赖 B 依赖 A | 拆分 fixture |
| \`TestClient\` 没用 with | lifespan 不触发 | 用 \`with TestClient(app)\` |
| 覆盖率 100% 仍有 bug | 没测边界 | 追求有意义覆盖 |

### 异步测试

如果路由是异步的且测试也要异步：

\`\`\`bash
pip install pytest-asyncio httpx
\`\`\`

\`\`\`python
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"

# tests/test_async.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_async_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
\`\`\`

\`AsyncClient\` 是异步版 TestClient，能并发发多个请求，适合压测场景。

## 十二、设计思想

\`dependency_overrides\` 是 FastAPI 测试体系的灵魂，体现了「**依赖反转用于测试**」。生产代码依赖 \`get_db\`（连生产库），测试时替换成测试库，**不改一行业务代码**。这种可替换性是依赖注入的根本价值——让组件在「生产配置」和「测试配置」间无摩擦切换。没有 DI 的框架要测数据库就得 mock 全局变量或用 monkeypatch，脆弱且易漏。

测试隔离的内存数据库体现了「**测试无副作用**」原则。测试不应污染外部状态（生产库、文件系统），否则测试间互相影响、跑顺序不同结果不同。内存 SQLite + function 级 fixture 让每个测试从干净状态开始，可并行、可重复、可独立调试。这是「确定性测试」的基础。

测试金字塔体现了「**成本效益分层**」。单元测试快而多（毫秒级），覆盖大量分支；集成测试慢而少（秒级），测组件协作；E2E 最慢最少，测端到端流程。把测试都堆在 E2E 层会导致测试套件慢到无法频繁运行，失去快速反馈价值。合理的分布让大部分 bug 在快速的单元测试就被抓住，E2E 只验证关键流程。
`,
  },
];
