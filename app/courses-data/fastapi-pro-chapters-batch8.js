// =============================================================
// FastAPI 现代开发全书 - 第 8 批章节（认证与安全 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fp-oauth2            : OAuth2 与密码认证
//   fp-jwt               : JWT Token 认证
//   fp-rbac              : RBAC 权限模型
//   fp-apikey-security   : API Key 与安全最佳实践
// ============================================================

export const chapters = [
  // ============================================================
  // 第 27 章：OAuth2 与密码认证
  // ============================================================
  {
    id: "fp-oauth2",
    group: "认证与安全",
    icon: "🔐",
    title: "OAuth2 与密码认证",
    content: `# OAuth2 与密码认证

## 从"谁是你"说起

Web 应用几乎都需要回答三个问题：

1. **你是谁？**（认证 Authentication）
2. **你能干什么？**（授权 Authorization）
3. **你怎么证明你是你？**（凭证 Credential）

本章我们聚焦第 1 和第 3 个问题，第 2 个留给下一章的 RBAC。

最早的 Web 应用用 session + cookie 解决这三个问题：用户登录后服务器存一份 session，发个 cookie 给浏览器，后续请求带 cookie 就能识别身份。这套方案叫**有状态认证**——服务器必须记住每个用户的 session。

但现代应用早就不是"浏览器 + 单体服务器"的形态了：

- **多端**：Web、iOS、Android、小程序，cookie 在移动端不好用。
- **微服务**：10 个服务都要知道"你是谁"，session 共享很麻烦。
- **开放 API**：第三方应用要代表用户访问数据，cookie 完全不适用。

于是 **OAuth2** 出现了。它是一套**授权框架**（RFC 6749），定义了几种"如何让用户授权第三方应用访问自己数据"的标准流程。FastAPI 内置了 OAuth2 支持，本章我们从原理到实现完整讲一遍。

## OAuth2 是什么

OAuth2 解决的核心问题是：**让用户 A 授权应用 B 访问 A 在服务 C 上的数据，而不需要 A 把密码告诉 B**。

举例：你（A）用微信登录某个第三方应用（B），第三方应用需要拿到你的微信头像和昵称（C 上的数据）。你肯定不想把微信密码给第三方，于是 OAuth2 出场：

1. 第三方应用跳转到微信授权页。
2. 你在微信页面登录并点"同意"。
3. 微信回调第三方应用，给一个"授权码"。
4. 第三方应用用授权码换"访问令牌"。
5. 第三方应用拿令牌调微信 API 拿用户信息。

整个过程中第三方应用永远不知道你的微信密码，只能拿到你授权范围内的数据。这就是 OAuth2 的精髓。

### OAuth2 的四种授权模式

RFC 6749 定义了四种"授权流程"（Grant Type），对应不同场景：

1. **Authorization Code（授权码）**：最常用，适合有后端的 Web 应用。流程是上面那个例子。
2. **Implicit（隐式）**：早期给纯前端 SPA 用的，现在已被淘汰，推荐用 Authorization Code + PKCE 替代。
3. **Resource Owner Password Credentials（密码凭证）**：用户直接把账号密码给应用，应用拿去换 token。**只在应用与服务完全信任时用**，比如第一方应用。
4. **Client Credentials（客户端凭证）**：服务对服务，没有用户参与。比如后端微服务之间互相调用。

FastAPI 教程里大量使用的是**第三种**（Password Flow），因为它的教学例子是"自己写的 FastAPI 应用 + 自己的用户数据库"——应用和服务是同一方，可以信任。但生产环境如果是第三方接入，必须用 Authorization Code。

### Password 流程详解

本章我们详细讲 Password 流程，因为它最适合作为入门：

\`\`\`text
1. 用户在前端输入用户名和密码
2. 前端 POST /token，请求体里带 username + password
3. 服务器验证用户名密码
4. 服务器返回 access_token
5. 后续请求前端在 Header 里带 Authorization: Bearer <token>
6. 服务器验证 token，识别用户身份
\`\`\`

这个流程的关键点是：

- **用户名密码只在登录时传一次**，之后用 token。
- **token 有时效**（如 30 分钟），过期要重新登录或刷新。
- **token 是无状态的**——服务器不存 token，只存签名密钥。

为什么用 token 而不是 session？因为 token 是无状态的，任何服务只要知道密钥就能验证，特别适合微服务和多端。

## Demo 1：OAuth2PasswordBearer 的基本用法

FastAPI 提供了 \`OAuth2PasswordBearer\`，它做了两件事：

1. **作为依赖**：从请求头 \`Authorization: Bearer xxx\` 解析 token。
2. **生成 Swagger 登录页**：\`/docs\` 页面右上角会出现"Authorize"按钮。

\`\`\`python
# 文件：oauth_basic.py

from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer

# tokenUrl 是登录端点的路径
# FastAPI 用它生成 OpenAPI 文档，前端 Swagger 据此知道去哪登录
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()


# 用 Depends 注入 oauth2_scheme
# FastAPI 会自动从 Authorization header 解析 token
# 如果没带 token，会返回 401
@app.get("/me")
def read_me(token: str = Depends(oauth2_scheme)):
    # 此处 token 是从 header 解出的字符串
    # 真实项目要验证 token 是否有效（下一章讲 JWT）
    return {"token_received": token[:20] + "..."}


# 启动后访问 /docs，点 Authorize 按钮，输入用户名密码
# Swagger 会先 POST /token 拿 token，再带 token 访问其他接口
\`\`\`

注意 \`OAuth2PasswordBearer\` **本身不验证 token**——它只是从 header 取出 token 字符串。验证逻辑要你自己写（下一章用 JWT）。

\`tokenUrl="token"\` 是个相对路径，FastAPI 在文档里会显示成 \`/token\`。Swagger 的 Authorize 按钮会 POST 到这个 URL，所以你必须实现一个 \`/token\` 端点。

## Demo 2：OAuth2PasswordRequestForm 登录表单

登录端点 \`/token\` 接收的不是 JSON，而是 **表单格式**（\`application/x-www-form-urlencoded\`）。这是 OAuth2 规范要求的标准格式。FastAPI 提供 \`OAuth2PasswordRequestForm\` 帮你解析。

\`\`\`python
# 文件：oauth_login.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# 模拟用户数据库（真实项目用数据库）
fake_users_db = {
    "alice": {
        "username": "alice",
        # 注意：这是哈希后的密码，不是明文
        # 哈希值对应明文 "secret123"
        "hashed_password": "fakehash_secret123",
        "disabled": False,
    }
}


class Token(BaseModel):
    access_token: str
    token_type: str


# 关键：OAuth2PasswordRequestForm 是个表单依赖
# FastAPI 会自动从 form-data 解析 username 和 password
@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username 和 form_data.password 是表单字段
    user = fake_users_db.get(form_data.username)
    if not user:
        # 用户不存在
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},  # OAuth2 要求返回这个 header
        )

    # 验证密码（这里用 fake hash，真实项目用 passlib）
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 生成 token（这里用假 token，下一章用 JWT）
    access_token = f"fake_token_for_{user['username']}"

    # 返回标准 OAuth2 响应
    # 必须有 access_token 和 token_type 两个字段
    return {"access_token": access_token, "token_type": "bearer"}


def verify_password(plain: str, hashed: str) -> bool:
    # 简化版，真实项目用 passlib 的 pwd_context.verify
    return hashed == f"fakehash_{plain}"


# 测试登录：
# curl -X POST http://localhost:8000/token \\
#   -d "username=alice&password=secret123"
# 返回：{"access_token": "fake_token_for_alice", "token_type": "bearer"}
\`\`\`

为什么用表单而不是 JSON？因为 OAuth2 规范是这么定的。RFC 6749 第 4.3.2 节明确要求 \`application/x-www-form-urlencoded\`。这是历史原因——OAuth2 设计之初考虑的是浏览器场景。

\`WWW-Authenticate: Bearer\` 这个响应头是规范要求，告诉客户端"这是 Bearer token 认证"。

## Demo 3：用 passlib + bcrypt 哈希密码

**绝对不能存明文密码**。一旦数据库泄露，所有用户密码全部暴露。正确做法是**哈希**——单向函数把密码变成不可逆的字符串。

为什么不能自己写哈希？比如 \`hashlib.md5(password)\`？因为：

1. **MD5/SHA 太快**：现代 GPU 每秒能算几亿次 MD5，攻击者用字典暴力破解分分钟。
2. **没有加盐**：相同密码哈希值一样，攻击者可以查彩虹表反推。

正确做法是用 **bcrypt / argon2** 这类"慢哈希"算法。它们：

- 内置盐（每次哈希结果都不同）
- 计算慢（毫秒级，破解成本极高）
- 可调成本因子（硬件变快后可以调高）

Python 生态里 \`passlib\` 是密码哈希的标准库。

\`\`\`python
# 文件：password_hash.py

# passlib 是密码哈希库，支持多种算法
from passlib.context import CryptContext

# CryptContext 配置：指定算法和参数
# bcrypt 是业界标准，OpenBSD 在 1997 年发明的
# deprecated="auto" 表示老哈希会自动升级
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(plain_password: str) -> str:
    """把明文密码哈希成不可逆字符串"""
    # pwd_context.hash 内部会：
    # 1. 生成随机盐
    # 2. 用 bcrypt 算法迭代计算
    # 3. 返回格式：$2b$12$<salt><hash>
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码是否匹配"""
    # pwd_context.verify 内部会：
    # 1. 从 hashed_password 提取盐和参数
    # 2. 用相同参数哈希 plain_password
    # 3. 比较两个哈希值
    return pwd_context.verify(plain_password, hashed_password)


# === 演示 ===
if __name__ == "__main__":
    # 哈希同一个密码两次，结果不同（因为盐随机）
    h1 = hash_password("mypassword")
    h2 = hash_password("mypassword")
    print(f"hash1: {h1}")
    print(f"hash2: {h2}")
    print(f"两次相同？{h1 == h2}")  # False，但都能验证通过

    # 验证
    print(f"正确密码验证：{verify_password('mypassword', h1)}")  # True
    print(f"错误密码验证：{verify_password('wrong', h1)}")       # False
\`\`\`

bcrypt 的输出格式 \`$2b$12$...\` 解读：

- \`$2b$\`：算法标识，2b 是 bcrypt 的版本。
- \`12\`：成本因子，2^12 次迭代。可以调高到 13、14，但每次 +1 时间翻倍。
- 后面 22 字符是盐，31 字符是哈希值。

### 安装依赖

\`\`\`bash
# passlib 是哈希库
# bcrypt 是底层算法实现
pip install "passlib[bcrypt]"
\`\`\`

注意：\`passlib[bcrypt]\` 会自动装 \`bcrypt\`。如果只装 \`passlib\` 不装 \`bcrypt\`，运行时会报错。

## Demo 4：完整的登录流程（含用户模型）

把前面所有零件组装成一个完整的应用：

\`\`\`python
# 文件：full_oauth.py

from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel

app = FastAPI(title="OAuth2 密码认证示例")

# === 1. 配置 ===
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 假的密钥，真实项目从环境变量读
SECRET_KEY = "my-secret-key-change-in-production"


# === 2. 用户模型 ===
class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: bool = False


class UserInDB(User):
    hashed_password: str


# 模拟数据库
fake_users_db = {
    "alice": UserInDB(
        username="alice",
        email="alice@example.com",
        disabled=False,
        hashed_password=pwd_context.hash("secret123"),
    ),
    "bob": UserInDB(
        username="bob",
        email="bob@example.com",
        disabled=True,  # 被禁用的用户
        hashed_password=pwd_context.hash("bobpass"),
    ),
}


# === 3. Token 模型 ===
class Token(BaseModel):
    access_token: str
    token_type: str


# === 4. 辅助函数 ===
def get_user(db, username: str) -> Optional[UserInDB]:
    """从数据库查用户"""
    if username in db:
        return db[username]
    return None


def authenticate_user(db, username: str, password: str) -> Optional[UserInDB]:
    """验证用户名密码，返回用户或 None"""
    user = get_user(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# === 5. 登录端点 ===
@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 1. 验证用户
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. 检查用户是否被禁用
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is disabled",
        )

    # 3. 生成 token（简化版，下一章用 JWT）
    access_token = f"{SECRET_KEY}:{user.username}"

    # 4. 返回标准 OAuth2 响应
    return {"access_token": access_token, "token_type": "bearer"}


# === 6. 用户身份依赖 ===
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 token 解析出当前用户"""
    # 简化版：直接拆 token
    # 真实项目用 JWT 解码（下一章讲）
    try:
        secret, username = token.split(":", 1)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if secret != SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user(fake_users_db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """确保用户是激活的"""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# === 7. 业务路由 ===
@app.get("/users/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """需要登录才能访问"""
    return current_user


@app.get("/users/me/items")
def read_own_items(current_user: User = Depends(get_current_active_user)):
    """需要登录才能访问"""
    return [{"item_id": "1", "owner": current_user.username}]
\`\`\`

注意几个设计点：

1. **依赖链**：\`get_current_active_user\` 依赖 \`get_current_user\`，后者依赖 \`oauth2_scheme\`。FastAPI 自动按依赖顺序执行。
2. **分层依赖**：\`get_current_user\` 只验身份，\`get_current_active_user\` 额外检查是否激活。需要"必须激活"的路由用后者，普通登录的路由用前者。
3. **错误响应**：所有认证失败返回 401，并带 \`WWW-Authenticate: Bearer\` header，这是规范要求。

## Demo 5：用 curl 完整测试登录流程

\`\`\`bash
# 1. 不带 token 访问受保护接口 → 401
curl http://localhost:8000/users/me
# {"detail":"Not authenticated"}

# 2. 登录拿 token
curl -X POST http://localhost:8000/token \\
  -d "username=alice&password=secret123"
# {"access_token":"my-secret-key-change-in-production:alice","token_type":"bearer"}

# 3. 带错误 token → 401
curl -H "Authorization: Bearer wrong_token" http://localhost:8000/users/me
# {"detail":"Invalid token"}

# 4. 带正确 token → 200
curl -H "Authorization: Bearer my-secret-key-change-in-production:alice" \\
  http://localhost:8000/users/me
# {"username":"alice","email":"alice@example.com","disabled":false}

# 5. 用被禁用的 bob 登录 → 403
curl -X POST http://localhost:8000/token \\
  -d "username=bob&password=bobpass"
# {"detail":"User is disabled"}
\`\`\`

注意 token 的传递格式：\`Authorization: Bearer <token>\`。"Bearer" 是固定的，告诉服务器用的是 Bearer token 方案。

## Demo 6：在 Swagger UI 中测试

FastAPI 自动把 OAuth2 集成到 Swagger 文档里：

1. 启动应用，访问 \`/docs\`。
2. 右上角看到 **Authorize** 按钮（🔒 图标）。
3. 点击，输入用户名 \`alice\`、密码 \`secret123\`。
4. Swagger 自动 POST \`/token\` 拿 token。
5. 之后点任何受保护接口的 "Try it out"，Swagger 自动带 token。

这是 FastAPI 的杀手锏——前端开发者打开 Swagger 就能登录测试，不需要 Postman 配环境变量。

要让 Swagger 正确显示，必须：

- 用 \`OAuth2PasswordBearer\` 作为依赖。
- 实现 \`/token\` 端点，返回 \`{"access_token": ..., "token_type": "bearer"}\`。
- 用 \`OAuth2PasswordRequestForm\` 接收登录表单。

## OAuth2 的安全注意事项

### 1. HTTPS 是必须的

OAuth2 流程传输用户名密码和 token，**必须用 HTTPS**。HTTP 下整个流量是明文，攻击者可以抓包拿到密码。

开发期可以用 HTTP，但生产环境必须 HTTPS。后面会讲怎么强制 HTTPS。

### 2. token 的存储位置

前端拿到 token 后存哪里？

- **localStorage**：方便，但 XSS 攻击能读到。
- **sessionStorage**：同 localStorage，关闭浏览器就清空。
- **HttpOnly Cookie**：XSS 读不到，但容易被 CSRF。

业界共识：**HttpOnly + SameSite=Strict 的 Cookie 最安全**，但要小心 CSRF。

### 3. 不要自己实现 OAuth2 Provider

本章我们实现了"用 OAuth2 的 Password Flow 做认证"，但这只是"借用了 OAuth2 的格式"。如果你要做真正的 OAuth2 Provider（让第三方应用接入），用专门的库：

- **Authlib**：Python 生态最全的 OAuth/OIDC 库。
- **Authenticating**：FastAPI 作者推荐的认证库。
- **Keycloak**：开源的 IAM 平台。

自实现 OAuth2 Provider 容易出安全漏洞，除非有充分理由，否则用现成方案。

### 4. 限流是必须的

登录端点必须限流，否则会被暴力破解。一个简单策略：每个 IP 每分钟最多尝试 5 次登录。下下章讲 slowapi 时实现。

## 本章小结

- OAuth2 是授权框架，解决"让第三方代表用户访问数据"的问题。
- 四种流程：Authorization Code（最常用）、Implicit（已淘汰）、Password（信任场景）、Client Credentials（服务对服务）。
- FastAPI 用 \`OAuth2PasswordBearer\` 接收 token，\`OAuth2PasswordRequestForm\` 接收登录表单。
- 密码必须用 bcrypt 哈希，绝不能存明文或用 MD5。
- 完整流程：登录拿 token → 后续请求带 \`Authorization: Bearer <token>\`。

本章的 token 是"假的"——只是把用户名拼在字符串里。下一章我们用 JWT 让 token 自带签名和过期时间。
`
  },

  // ============================================================
  // 第 28 章：JWT Token 认证
  // ============================================================
  {
    id: "fp-jwt",
    group: "认证与安全",
    icon: "🎫",
    title: "JWT Token 认证",
    content: `# JWT Token 认证

## 上一章的痛点

上一章我们实现了完整的登录流程，但 token 是假的——只是 \`"密钥:用户名"\` 拼接。这种 token 有三个致命问题：

1. **没有过期机制**：一旦签发永不失效，泄露后无法处理。
2. **没有签名**：攻击者可以伪造 \`"密钥:admin"\` 冒充管理员。
3. **没有信息**：除了用户名啥都没有，每次还要查数据库拿其他信息。

工业级的 token 需要解决这些问题，而 **JWT（JSON Web Token）** 就是标准答案。

## JWT 是什么

JWT 是一种紧凑的、自包含的 token 格式，RFC 7519 定义。它把信息编码成一个字符串，可以用签名保证不可篡改。

JWT 长这样：

\`\`\`text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpXqzZ5pX8JXb3Hk3wK9kD8E
\`\`\`

三个部分用 \`.\` 分隔：

### Header（头部）

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

Base64URL 编码后：\`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\`

- \`alg\`：签名算法，常用 HS256（HMAC + SHA-256）或 RS256（RSA + SHA-256）。
- \`typ\`：固定 JWT。

### Payload（载荷）

\`\`\`json
{
  "sub": "1234567890",
  "name": "Alice",
  "iat": 1516239022,
  "exp": 1516242622
}
\`\`\`

Base64URL 编码后：\`eyJzdWIiOi...IiwiaWF0IjoxNTE2MjM5MDIyfQ\`

这是真正存数据的地方。RFC 定义了几个标准字段（claim）：

- \`iss\`：签发者（issuer）
- \`sub\`：主题（subject），通常放用户 ID
- \`aud\`：接收方（audience）
- \`exp\`：过期时间（expiration），Unix 时间戳
- \`nbf\`：生效时间（not before）
- \`iat\`：签发时间（issued at）
- \`jti\`：JWT 唯一 ID，用于撤销

你可以加自定义字段：\`username\`、\`role\`、\`email\` 等。

### Signature（签名）

\`\`\`text
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
\`\`\`

签名 = 用密钥对 \`header.payload\` 做 HMAC。验证时重新算一次，对比是否一致。

**关键点：签名保证不可篡改，但不保证不可读**。Payload 只是 Base64 编码，不是加密。任何人都能解开看内容。所以**绝不在 JWT 里放敏感信息**（密码、密钥、身份证号）。

### JWT 的优势

1. **自包含**：token 自带用户信息，不用每次查数据库。
2. **签名**：用密钥签名，攻击者无法伪造。
3. **过期**：\`exp\` 字段强制过期，比永久 token 安全。
4. **跨服务**：任何能验签的服务都能用，适合微服务。
5. **标准**：RFC 协议，多语言支持。

### JWT 的劣势

1. **撤销困难**：token 一旦签发，在过期前都有效。要"撤销"得维护黑名单（违背无状态初衷）。
2. **续期复杂**：过期了要重新登录或用 refresh token。
3. **体积大**：比简单 session ID 大几倍。
4. **不能放敏感信息**：payload 是公开的。

## Demo 1：用 jose 库编码/解码 JWT

Python 有几个 JWT 库：\`PyJWT\`、\`python-jose\`、\`authlib\`。FastAPI 官方文档用 \`python-jose\`，我们也用它。

\`\`\`bash
pip install "python-jose[cryptography]"
\`\`\`

\`\`\`python
# 文件：jwt_basic.py

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

# 密钥——必须保密，生产环境从环境变量读
SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"


def create_token(data: dict, expires_minutes: int = 30) -> str:
    """生成 JWT"""
    # 复制 data，避免修改原字典
    to_encode = data.copy()

    # 加过期时间
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({
        "exp": expire,  # 过期时间
        "iat": datetime.now(timezone.utc),  # 签发时间
    })

    # 编码：返回字符串
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """解码 JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # 过期、签名错误、格式错误都会抛 JWTError
        print(f"JWT decode failed: {e}")
        return None


# === 演示 ===
if __name__ == "__main__":
    # 生成 token
    token = create_token({"sub": "123", "username": "alice", "role": "admin"})
    print(f"Token: {token}")
    print(f"Token 长度: {len(token)}")

    # 解码
    payload = decode_token(token)
    print(f"Payload: {payload}")

    # 模拟篡改：改最后一个字符
    tampered = token[:-1] + ("a" if token[-1] != "a" else "b")
    print(f"篡改后解码: {decode_token(tampered)}")  # None，签名不匹配

    # 测试过期：生成 1 秒过期的 token
    short_token = create_token({"sub": "123"}, expires_minutes=-1/60)  # 1 秒前过期
    import time
    time.sleep(0.1)
    print(f"过期 token 解码: {decode_token(short_token)}")  # None
\`\`\`

要点：

1. \`jwt.encode\` 接收字典、密钥、算法，返回字符串。
2. \`jwt.decode\` 自动验签 + 检查 \`exp\`，过期会抛 \`ExpiredSignatureError\`。
3. \`algorithms\` 必须传列表，防止算法混淆攻击。
4. 密钥要足够长（至少 32 字符），可以用 \`openssl rand -hex 32\` 生成。

## Demo 2：生成 access_token

把 JWT 集成到上一章的登录流程：

\`\`\`python
# 文件：jwt_login.py

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

app = FastAPI(title="JWT 认证示例")

# === 配置 ===
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # 示例，生产从环境变量读
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# === 模型 ===
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


# 模拟数据库
fake_users_db = {
    "alice": UserInDB(
        username="alice",
        email="alice@example.com",
        disabled=False,
        hashed_password=pwd_context.hash("secret123"),
    ),
}


# === JWT 工具 ===
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """生成 access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# === 认证函数 ===
def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = fake_users_db.get(username)
    if not user:
        return None
    if not pwd_context.verify(password, user.hashed_password):
        return None
    return user


# === 登录端点 ===
@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 关键：生成 JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},  # sub 是标准字段，放用户唯一标识
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

注意 \`sub\` 字段——RFC 7519 规定它是"主题"，JWT 习惯放用户 ID 或用户名。

## Demo 3：从 token 解析用户身份

\`\`\`python
# 文件：jwt_auth.py（续上）

# === 解析 token 拿用户 ===
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 token 解析当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. 解码 JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # 2. 取出 sub 字段（用户名）
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        # 解码失败（签名错、过期、格式错）都抛 401
        raise credentials_exception

    # 3. 根据用户名查数据库
    user = fake_users_db.get(token_data.username)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# === 业务路由 ===
@app.get("/users/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@app.get("/users/me/profile")
def read_profile(current_user: User = Depends(get_current_active_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "login_at": datetime.now(timezone.utc),
    }
\`\`\`

整个流程：

1. 客户端带 \`Authorization: Bearer <jwt>\` 请求。
2. \`oauth2_scheme\` 从 header 取出 token 字符串。
3. \`get_current_user\` 解码 JWT，拿到 \`sub\`（用户名）。
4. 用用户名查数据库，返回 User 对象。
5. 路由函数拿到 current_user，执行业务。

为什么 JWT 解码后还要查数据库？因为 JWT 里只有用户名，业务需要完整的 User 对象。如果你想完全无状态，可以把 User 信息都放 JWT 里——但这样改用户信息后 token 里还是旧的，要权衡。

## Demo 4：token 过期处理

\`\`\`python
# 文件：token_expiry.py

from datetime import datetime, timedelta, timezone
from jose import jwt, ExpiredSignatureError, JWTError

SECRET_KEY = "test-secret"
ALGORITHM = "HS256"


# 生成已过期的 token
def make_expired_token():
    payload = {
        "sub": "alice",
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1),  # 1 秒前过期
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# 生成未过期的 token
def make_valid_token():
    payload = {
        "sub": "alice",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# 测试
expired = make_expired_token()
valid = make_valid_token()

# 1. 过期 token：抛 ExpiredSignatureError
try:
    jwt.decode(expired, SECRET_KEY, algorithms=[ALGORITHM])
except ExpiredSignatureError:
    print("Token 已过期")  # 走这里

# 2. 有效 token：正常解码
payload = jwt.decode(valid, SECRET_KEY, algorithms=[ALGORITHM])
print(f"Token 有效，sub={payload['sub']}")  # alice


# === FastAPI 里处理过期 ===
from fastapi import HTTPException, status

def decode_or_raise(token: str) -> dict:
    """解码 token，失败抛对应 HTTP 异常"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        # token 过期
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        # 签名错误、格式错误等
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
\`\`\`

前端拿到 401 + \`"Token expired"\` 后，应该：

1. 清掉本地 token。
2. 跳转登录页。
3. 或者用 refresh token 自动续期（下面讲）。

## Demo 5：Refresh Token 机制

access token 短期有效（30 分钟），过期后让用户重新登录体验差。**Refresh token** 是解决方案：

- access token：短期（30 分钟），用于 API 调用。
- refresh token：长期（7 天），只能用来换 access token，不能直接访问 API。

\`\`\`python
# 文件：refresh_token.py

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 分钟
REFRESH_TOKEN_EXPIRE_DAYS = 7      # 7 天

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshRequest(BaseModel):
    refresh_token: str


def create_access_token(sub: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": sub, "exp": expire, "type": "access"},
                      SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(sub: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": sub, "exp": expire, "type": "refresh"},
                      SECRET_KEY, algorithm=ALGORITHM)


# 模拟用户
fake_users_db = {"alice": {"password": "secret"}}


@app.post("/token", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(401, "Incorrect username or password")

    # 同时返回 access_token 和 refresh_token
    return TokenResponse(
        access_token=create_access_token(form_data.username),
        refresh_token=create_refresh_token(form_data.username),
        token_type="bearer",
    )


@app.post("/token/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshRequest):
    """用 refresh token 换新的 access token"""
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid refresh token")

    # 1. 必须是 refresh 类型
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Not a refresh token")

    # 2. refresh token 也要检查是否被撤销（这里简化）
    # 真实项目要在数据库存 refresh token 的 jti，撤销就删掉

    username = payload["sub"]
    # 3. 生成新的 access token
    # 注意：refresh token 可以滚动更新（也换新的），也可以不换
    # 滚动更新：每次刷新都重置 7 天 → 更安全（旧的失效）
    # 不滚动：refresh token 一直用到 7 天后过期 → 体验好
    return TokenResponse(
        access_token=create_access_token(username),
        refresh_token=create_refresh_token(username),  # 滚动更新
        token_type="bearer",
    )


@app.get("/protected")
def protected(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(401, "Wrong token type")
    return {"user": payload["sub"]}
\`\`\`

注意 token 类型的 \`type\` 字段——防止 access token 被"误用"为 refresh token。

### Refresh Token 的安全考量

1. **refresh token 必须存在数据库**：每个用户一份，可以撤销（用户改密码后旧 token 全部失效）。
2. **绝对不要把 refresh token 存 localStorage**：用 HttpOnly Cookie，前端 JS 读不到。
3. **检测重放**：如果同一个 refresh token 被使用两次，说明被攻击者截获，立即撤销所有 token。
4. **绑定设备**：refresh token 绑定设备指纹，换设备要重新登录。

## Demo 6：依赖注入保护路由

JWT 集成到 FastAPI 后，保护路由就像加个 \`Depends\` 一样简单：

\`\`\`python
# 文件：protected_routes.py

from fastapi import FastAPI, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel

app = FastAPI()


# 假设这是上一节定义好的依赖
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    # 解码 JWT，返回用户字典
    ...


def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("disabled"):
        raise HTTPException(400, "Inactive user")
    return current_user


# 1. 公开路由：不需要认证
@app.get("/public")
def public():
    return {"message": "所有人都能看"}


# 2. 普通认证路由：登录用户都能访问
@app.get("/me")
def me(current_user: dict = Depends(get_current_active_user)):
    return {"user": current_user["username"]}


# 3. 高级认证路由：需要特定权限（下一章 RBAC 详讲）
def get_admin_user(current_user: dict = Depends(get_current_active_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return current_user


@app.get("/admin")
def admin_only(current_user: dict = Depends(get_admin_user)):
    return {"message": f"Hello admin {current_user['username']}"}


# 4. 在路由组上批量加认证
from fastapi import APIRouter

admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_admin_user)],  # 这个路由组所有路由都要 admin
)


@admin_router.get("/users")
def list_users():
    return [{"username": "alice"}, {"username": "bob"}]


@admin_router.delete("/users/{user_id}")
def delete_user(user_id: int):
    return {"deleted": user_id}


app.include_router(admin_router)


# 5. 可选认证：登录也行不登录也行
from fastapi.security import OAuth2PasswordBearer
from fastapi import Security

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def get_current_user_optional(
    token: str = Security(oauth2_scheme_optional),
) -> dict:
    if token is None:
        return None  # 没登录也行
    # 有 token 就解析
    ...


@app.get("/feed")
def feed(user: dict = Depends(get_current_user_optional)):
    if user:
        return {"message": f"Hi {user['username']}, personalized feed"}
    return {"message": "Public feed"}
\`\`\`

关键技巧：

- \`auto_error=False\`：让 OAuth2 不自动报 401，由你决定怎么处理。
- \`Security(oauth2_scheme_optional)\`：和 Depends 等价，但 Swagger 文档会显示为可选。
- \`APIRouter(dependencies=[...])\`：给整个路由组加依赖，不用每个路由都写。

## Demo 7：完整的认证中间件

把 JWT 认证做成中间件，所有路由自动生效：

\`\`\`python
# 文件：auth_middleware.py

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

SECRET_KEY = "your-secret"
ALGORITHM = "HS256"

# 不需要认证的路径
PUBLIC_PATHS = {"/", "/token", "/register", "/docs", "/openapi.json", "/redoc"}


class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. 公开路径直接放行
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        # 2. 取 Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 3. 解码 JWT
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            # 4. 把用户信息存到 request.state，路由可以读
            request.state.user = payload
        except JWTError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid token: {e}"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 5. 继续处理请求
        return await call_next(request)


# 注册中间件
app.add_middleware(JWTAuthMiddleware)


# 路由里读取 request.state.user
@app.get("/me")
def me(request: Request):
    user = request.state.user
    return {"username": user.get("sub")}


# 公开路由
@app.get("/")
def root():
    return {"message": "Welcome"}


@app.post("/token")
def login():
    # 简化：直接签发 token
    token = jwt.encode({"sub": "alice"}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

中间件 vs 依赖，怎么选？

- **中间件**：所有路由统一处理，不漏认证。但粒度粗，难做"可选认证"。
- **依赖**：每个路由显式声明，灵活控制。但容易忘加。

经验：**核心认证用中间件兜底，业务路由用依赖精细控制**。两者结合最稳。

## JWT 的常见陷阱

### 陷阱 1：算法混淆攻击

\`\`\`python
# 错误：decode 不指定 algorithms
payload = jwt.decode(token, public_key)  # 不安全！

# 攻击者把 header 的 alg 改成 "none"，签名部分为空，就能伪造 token
\`\`\`

正确做法：永远指定 \`algorithms=["HS256"]\`。

### 陷阱 2：密钥太弱

\`\`\`python
# 错误：密钥太短
SECRET_KEY = "secret"

# 正确：至少 32 字符随机串
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
# 生成方法：openssl rand -hex 32
\`\`\`

### 陷阱 3：在 JWT 里放敏感信息

\`\`\`python
# 错误：放了密码
payload = {"sub": "alice", "password": "secret123"}  # payload 是 Base64，能解开！

# 正确：只放非敏感信息
payload = {"sub": "alice", "role": "user"}
\`\`\`

### 陷阱 4：不处理 token 撤销

JWT 设计是无状态的，签发后无法撤销。但用户改密码、登出时必须让旧 token 失效。解决方案：

- 维护一个"黑名单"（Redis），存撤销的 token jti。
- 检查 token 时除了验签还要查黑名单。
- 这破坏了无状态，但安全需要。

### 陷阱 5：refresh token 不轮换

如果 refresh token 一直不换，泄露后 7 天都能用。最佳实践：**每次刷新都发新的 refresh token，旧的立即失效**。这叫"refresh token rotation"。

## 本章小结

- JWT 由 header.payload.signature 三部分组成，签名保证不可篡改。
- 用 \`python-jose\` 库 \`jwt.encode\` / \`jwt.decode\` 编解码。
- \`exp\` 字段强制过期，\`sub\` 放用户标识，\`iat\` 签发时间。
- access token 短期（30 分钟），refresh token 长期（7 天）+ 轮换。
- 依赖注入保护路由：\`Depends(get_current_user)\` 一行搞定。
- 永远指定 \`algorithms\`，密钥足够长，不放敏感信息。

下一章我们扩展到权限模型——怎么让某些接口只允许 admin 访问？怎么检查"你只能改自己的文章"？这就是 RBAC。
`
  },

  // ============================================================
  // 第 29 章：RBAC 权限模型
  // ============================================================
  {
    id: "fp-rbac",
    group: "认证与安全",
    icon: "🛡️",
    title: "RBAC 权限模型",
    content: `# RBAC 权限模型

## 从"你是谁"到"你能干什么"

上一章我们解决了认证——确认用户身份。但光知道"你是 alice"还不够，还要知道"alice 能不能删别人文章"。这就是**授权**（Authorization）。

授权有几大流派：

1. **ACL（Access Control List）**：每个资源维护一份"谁能访问"的列表。简单但难管理。
2. **DAC（Discretionary Access Control）**：资源所有者决定谁能访问。像 Linux 文件权限。
3. **MAC（Mandatory Access Control）**：系统强制策略，用户不能改。像军方密级。
4. **RBAC（Role-Based Access Control）**：基于角色的访问控制。最主流。
5. **ABAC（Attribute-Based Access Control）**：基于属性（用户、资源、环境）的细粒度控制。

本章我们聚焦 **RBAC**——绝大多数 Web 应用的首选。它的核心思想是：**用户关联角色，角色关联权限，权限决定能否访问资源**。

\`\`\`text
用户 ──┐
       ├── 角色 ──┤
用户 ──┘          ├── 权限 ──→ 资源
                  │
角色 ─────────────┘
\`\`\`

### 为什么不直接给用户分配权限？

设想你有 1000 个用户、50 个权限。如果直接给用户分配权限，每个用户要分配 50 个布尔值，管理 5 万条关系。改一个权限要更新 1000 个用户。

引入"角色"层后：定义 5 个角色（admin、editor、author、reader、guest），每个角色关联几个权限，用户只要分配一个角色。改权限只改角色，自动对所有该角色用户生效。

类比公司管理：员工不直接对接 HR、财务、IT，而是通过"部门"——员工属于部门，部门有 HR 服务。

## RBAC 的三个核心概念

### 1. User（用户）

系统的使用者。每个用户有一个或多个角色。

### 2. Role（角色）

权限的集合。例如 \`admin\`、\`editor\`、\`author\`。

### 3. Permission（权限）

对资源的具体操作。例如 \`post:create\`、\`post:delete\`、\`user:read\`。

权限通常用"资源:操作"格式命名，便于扩展。

### 关系示例

\`\`\`text
角色 admin:   [user:read, user:write, user:delete, post:*]
角色 editor:  [post:read, post:write, post:delete]
角色 author:  [post:read, post:write]  # 只能改自己的
角色 reader:  [post:read]

用户 alice:   [admin]
用户 bob:     [author]
用户 carol:   [reader]
\`\`\`

\`*\` 是通配符，\`post:*\` 表示对 post 资源的所有权限。

## Demo 1：定义角色与权限

\`\`\`python
# 文件：rbac_definitions.py

# 角色到权限的映射
# 这是配置，可以放数据库、配置文件、代码里
ROLE_PERMISSIONS = {
    "admin": {
        "user:read", "user:write", "user:delete",
        "post:read", "post:write", "post:delete",
        "system:config",
    },
    "editor": {
        "post:read", "post:write", "post:delete",
    },
    "author": {
        "post:read", "post:write",  # 只能改自己的（业务逻辑里检查）
    },
    "reader": {
        "post:read",
    },
}


# 用户到角色的映射（实际从数据库读）
USER_ROLES = {
    "alice": ["admin"],
    "bob": ["author"],
    "carol": ["reader"],
    "dave": ["editor", "author"],  # 多角色：合并权限
}


def get_user_permissions(username: str) -> set:
    """获取用户的所有权限（合并所有角色）"""
    roles = USER_ROLES.get(username, [])
    permissions = set()
    for role in roles:
        permissions.update(ROLE_PERMISSIONS.get(role, set()))
    return permissions


def has_permission(username: str, permission: str) -> bool:
    """检查用户是否有某权限"""
    user_perms = get_user_permissions(username)

    # 1. 精确匹配
    if permission in user_perms:
        return True

    # 2. 通配符匹配：post:write 匹配 post:*
    resource, action = permission.split(":", 1)
    if f"{resource}:*" in user_perms:
        return True

    # 3. 超级通配：*:* 表示所有权限
    if "*:*" in user_perms:
        return True

    return False


# === 测试 ===
if __name__ == "__main__":
    print(has_permission("alice", "user:delete"))  # True，admin
    print(has_permission("bob", "post:write"))     # True，author
    print(has_permission("bob", "post:delete"))    # False，author 不能删
    print(has_permission("carol", "post:write"))   # False，reader 只读
    print(has_permission("dave", "post:delete"))   # True，dave 是 editor
\`\`\`

要点：

1. **多角色合并**：一个用户可以有多个角色，权限是并集。
2. **通配符**：\`post:*\` 表示 post 资源的所有权限。
3. **权限是集合**：用 set 自动去重，提升查询性能。

## Demo 2：权限校验依赖

把权限检查封装成 FastAPI 依赖，路由声明需要的权限即可：

\`\`\`python
# 文件：rbac_dependency.py

from fastapi import FastAPI, Depends, HTTPException, status, Request
from typing import List, Callable
from functools import partial

app = FastAPI()

# 从上一节导入
from rbac_definitions import has_permission, get_user_permissions


# 假设这是上一章的 JWT 认证依赖
def get_current_user(request: Request) -> dict:
    """从 request.state 拿用户信息（中间件已解析 JWT）"""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


def require_permission(permission: str):
    """
    生成一个权限检查依赖
    用法：def route(..., user = Depends(require_permission("post:write")))
    """
    def permission_checker(current_user: dict = Depends(get_current_user)) -> dict:
        username = current_user.get("sub")
        if not has_permission(username, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required: {permission}",
            )
        return current_user
    return permission_checker


def require_any_permission(*permissions: str):
    """需要任意一个权限"""
    def checker(current_user: dict = Depends(get_current_user)) -> dict:
        username = current_user.get("sub")
        user_perms = get_user_permissions(username)
        # 检查是否有任意一个权限（含通配）
        for perm in permissions:
            resource, action = perm.split(":", 1)
            if (perm in user_perms
                or f"{resource}:*" in user_perms
                or "*:*" in user_perms):
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied. Required any of: {permissions}",
        )
    return checker


def require_all_permissions(*permissions: str):
    """需要所有权限"""
    def checker(current_user: dict = Depends(get_current_user)) -> dict:
        username = current_user.get("sub")
        for perm in permissions:
            if not has_permission(username, perm):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied. Required: {perm}",
                )
        return current_user
    return checker


# === 使用 ===
@app.get("/posts")
def list_posts(user: dict = Depends(require_permission("post:read"))):
    return [{"id": 1, "title": "Hello"}]


@app.post("/posts")
def create_post(user: dict = Depends(require_permission("post:write"))):
    return {"id": 2, "created_by": user["sub"]}


@app.delete("/posts/{post_id}")
def delete_post(post_id: int, user: dict = Depends(require_permission("post:delete"))):
    return {"deleted": post_id, "by": user["sub"]}


@app.post("/admin/config")
def update_config(user: dict = Depends(require_permission("system:config"))):
    return {"updated": True}
\`\`\`

设计要点：

1. **工厂函数**：\`require_permission("xxx")\` 返回一个依赖函数，每次调用生成新的依赖。这样不同路由能声明不同权限。
2. **错误码**：401（未认证）vs 403（已认证但无权限）。认证用 401，授权用 403，区分清楚。
3. **任意/全部**：提供 \`require_any_permission\` 和 \`require_all_permissions\`，应对不同业务。

## Demo 3：用装饰器组合权限（更优雅）

依赖写法每次要写 \`Depends(require_permission("xxx"))\`，略繁琐。可以包一层装饰器：

\`\`\`python
# 文件：rbac_decorator.py

from fastapi import FastAPI, Depends, HTTPException, status
from typing import Callable
from functools import wraps

app = FastAPI()


def get_current_user():
    # 占位，实际是 JWT 解析
    return {"sub": "alice", "roles": ["admin"]}


def needs_permission(permission: str):
    """权限装饰器"""
    def decorator(func: Callable):
        # 用 FastAPI 的依赖注入
        # 关键：把权限检查作为依赖加到路由
        # 这里用 dependencies 参数，不污染函数签名
        @wraps(func)
        async def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            # 这里需要访问权限系统，简化：
            username = current_user["sub"]
            # 假设 has_permission 已定义
            from rbac_definitions import has_permission
            if not has_permission(username, permission):
                raise HTTPException(403, f"Need permission: {permission}")
            # 把 current_user 注入到 kwargs，路由函数能拿到
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator


# 用法
@app.get("/posts")
@needs_permission("post:read")
async def list_posts(current_user: dict = None):
    return {"user": current_user["sub"]}


# 但装饰器写法在 FastAPI 里有坑：参数签名丢失
# 推荐还是用 Depends
\`\`\`

**装饰器写法的坑**：FastAPI 靠函数签名解析参数和生成文档，装饰器会破坏签名。除非用 \`functools.wraps\` + 手动同步签名，否则不推荐。

**最佳实践还是用 Depends**——FastAPI 的设计哲学就是"声明式依赖"。

## Demo 4：资源所有权检查

光有权限还不够。author 有 \`post:write\` 权限，但只能改自己的文章，不能改别人的。这叫**资源所有权检查**。

\`\`\`python
# 文件：ownership_check.py

from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel

app = FastAPI()


# 模拟数据库
fake_posts_db = {
    1: {"id": 1, "title": "Alice's post", "author": "alice"},
    2: {"id": 2, "title": "Bob's post", "author": "bob"},
    3: {"id": 3, "title": "Carol's post", "author": "carol"},
}


def get_current_user() -> dict:
    # 占位
    return {"sub": "bob", "roles": ["author"]}


def get_post_or_404(post_id: int) -> dict:
    """通用：根据 id 拿文章，找不到 404"""
    post = fake_posts_db.get(post_id)
    if not post:
        raise HTTPException(404, "Post not found")
    return post


def can_edit_post(current_user: dict, post: dict) -> bool:
    """检查用户能否编辑这篇文章"""
    # 1. admin 和 editor 能编辑任何文章
    roles = current_user.get("roles", [])
    if "admin" in roles or "editor" in roles:
        return True

    # 2. author 只能编辑自己的文章
    if "author" in roles:
        return post["author"] == current_user["sub"]

    # 3. 其他角色不能编辑
    return False


@app.put("/posts/{post_id}")
def update_post(
    post_id: int,
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    # 1. 先拿文章
    post = get_post_or_404(post_id)

    # 2. 检查所有权
    if not can_edit_post(current_user, post):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own posts",
        )

    # 3. 执行更新
    post["title"] = payload.get("title", post["title"])
    return post


@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: dict = Depends(get_current_user),
):
    post = get_post_or_404(post_id)

    # 删除策略：admin 可以删任何，author 只能删自己
    if not can_edit_post(current_user, post):
        raise HTTPException(403, "Cannot delete others' posts")

    del fake_posts_db[post_id]
    return {"deleted": post_id}
\`\`\`

所有权检查的常见模式：

1. **资源有 owner 字段**：直接比较 \`resource.owner == current_user.id\`。
2. **角色覆盖所有权**：admin 角色忽略所有权限制，能改任何资源。
3. **联合所有权**：资源有多个 owner（如团队项目），任一 owner 都能改。

把所有权检查抽成函数（\`can_edit_post\`），便于复用和测试。

## Demo 5：多角色用户

实际项目里一个用户经常有多个角色：既是 editor 又是 author。设计时要考虑：

\`\`\`python
# 文件：multi_role.py

from pydantic import BaseModel
from typing import List
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()


class User(BaseModel):
    username: str
    roles: List[str]  # 多角色


# 用户表
users_db = {
    "alice": User(username="alice", roles=["admin"]),
    "bob": User(username="bob", roles=["author", "editor"]),  # 双角色
    "carol": User(username="carol", roles=["reader"]),
}


def get_current_user() -> User:
    # 占位
    return users_db["bob"]


def has_role(current_user: User, required_roles: List[str]) -> bool:
    """检查用户是否有任意一个要求的角色"""
    return any(role in current_user.roles for role in required_roles)


def require_roles(*roles: str):
    """要求用户至少有其中一个角色"""
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if not has_role(current_user, list(roles)):
            raise HTTPException(
                status_code=403,
                detail=f"Required roles: {roles}",
            )
        return current_user
    return checker


# 用法
@app.get("/admin/dashboard")
def admin_dashboard(user: User = Depends(require_roles("admin"))):
    return {"message": f"Hello admin {user.username}"}


@app.post("/editor/review/{post_id}")
def review_post(
    post_id: int,
    user: User = Depends(require_roles("editor", "admin")),  # editor 或 admin 都行
):
    return {"reviewing": post_id, "by": user.username}


@app.get("/author/posts")
def my_posts(user: User = Depends(require_roles("author", "editor", "admin"))):
    """author、editor、admin 都能访问"""
    return {"user": user.username, "roles": user.roles}
\`\`\`

多角色的几种设计：

1. **角色互斥**：admin 和普通用户互斥，不能同时有。适合权限严格的系统。
2. **角色叠加**：可以同时有多个角色，权限取并集。最灵活，主流方案。
3. **主角色 + 副角色**：一个主角色决定主要权限，副角色补充。

## Demo 6：权限缓存

每次请求都重新计算用户权限很浪费。可以加缓存：

\`\`\`python
# 文件：permission_cache.py

import time
from typing import Dict, Set
from fastapi import FastAPI, Depends, HTTPException, Request
from functools import lru_cache

app = FastAPI()


# === 方案 1：内存缓存（单进程） ===
# lru_cache 是最简单的缓存，自动 LRU 淘汰
# 适合用户数不多的场景
@lru_cache(maxsize=1024)
def get_user_permissions_cached(username: str) -> frozenset:
    """获取用户权限（带缓存）
    
    用 frozenset 因为 lru_cache 要求参数可哈希
    返回 frozenset 也便于比较
    """
    # 模拟从数据库查
    print(f"Cache miss: querying DB for {username}")
    permissions = query_permissions_from_db(username)
    return frozenset(permissions)


def query_permissions_from_db(username: str) -> Set[str]:
    """模拟数据库查询"""
    # 真实项目查 user_role 表 + role_permission 表
    if username == "alice":
        return {"post:read", "post:write", "user:read"}
    return {"post:read"}


# === 方案 2：带 TTL 的缓存（生产推荐） ===
class TTLCache:
    """带过期时间的缓存"""
    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self._cache: Dict[str, tuple] = {}  # key -> (value, expire_at)

    def get(self, key: str):
        if key in self._cache:
            value, expire_at = self._cache[key]
            if time.time() < expire_at:
                return value
            else:
                del self._cache[key]  # 过期了，删掉
        return None

    def set(self, key: str, value):
        self._cache[key] = (value, time.time() + self.ttl)

    def invalidate(self, key: str):
        """主动失效（用户改权限后调用）"""
        if key in self._cache:
            del self._cache[key]


permission_cache = TTLCache(ttl_seconds=300)  # 5 分钟


def get_user_permissions_with_ttl(username: str) -> Set[str]:
    cached = permission_cache.get(username)
    if cached is not None:
        return cached

    permissions = query_permissions_from_db(username)
    permission_cache.set(username, permissions)
    return permissions


# === 方案 3：Redis 缓存（多进程/多实例） ===
# 生产环境多实例时，内存缓存不共享，要用 Redis
async def get_user_permissions_redis(username: str) -> Set[str]:
    """从 Redis 拿权限，没有就查 DB 并写回 Redis"""
    import redis.asyncio as redis
    
    r = redis.from_url("redis://localhost:6379/0")
    cache_key = f"perms:{username}"
    
    # 1. 先查 Redis
    cached = await r.smembers(cache_key)
    if cached:
        return cached
    
    # 2. 没有就查 DB
    permissions = query_permissions_from_db(username)
    
    # 3. 写回 Redis，5 分钟过期
    if permissions:
        await r.sadd(cache_key, *permissions)
        await r.expire(cache_key, 300)
    
    return permissions


# === 缓存失效策略 ===
# 当用户角色变更时，必须立即清缓存，否则权限还是旧的
def on_user_role_changed(username: str):
    """用户角色变更时调用"""
    # 1. 失效权限缓存
    permission_cache.invalidate(username)
    
    # 2. 如果用 Redis：DEL perms:{username}
    # 3. 如果 token 里存了角色，旧 token 还能用——这是 JWT 的固有缺陷
    #    解决：缩短 token 过期时间，或维护 token 撤销列表


# === 使用 ===
@app.get("/posts")
def list_posts(request: Request):
    username = request.state.user["sub"]
    perms = get_user_permissions_with_ttl(username)
    if "post:read" not in perms:
        raise HTTPException(403, "No permission")
    return {"posts": []}
\`\`\`

缓存策略的关键点：

1. **TTL 必须有**：避免数据不一致，5 分钟是经验值。
2. **主动失效**：用户改权限后必须立即清缓存，不能等 TTL。
3. **多实例共享**：用 Redis 而不是内存，所有 worker 看到同一份缓存。
4. **token 内权限 vs 缓存权限**：如果权限放 JWT 里，改权限后旧 token 还能用。最安全是把角色放数据库，每次请求查（带缓存）。

## Demo 7：完整的 RBAC 应用

把前面所有知识点整合：

\`\`\`python
# 文件：rbac_full_app.py

from typing import List, Optional
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

app = FastAPI(title="RBAC 完整示例")

# === 配置 ===
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# === 角色权限定义 ===
ROLE_PERMISSIONS = {
    "admin": {"user:read", "user:write", "user:delete", "post:*", "system:config"},
    "editor": {"post:read", "post:write", "post:delete", "post:publish"},
    "author": {"post:read", "post:write"},  # 只能改自己的
    "reader": {"post:read"},
}


# === 用户数据 ===
class User(BaseModel):
    username: str
    email: Optional[str] = None
    roles: List[str] = []
    disabled: bool = False


class UserInDB(User):
    hashed_password: str


# 模拟数据库
users_db = {
    "alice": UserInDB(
        username="alice", email="alice@e.com",
        roles=["admin"],
        hashed_password=pwd_context.hash("admin123"),
    ),
    "bob": UserInDB(
        username="bob", email="bob@e.com",
        roles=["author"],
        hashed_password=pwd_context.hash("author123"),
    ),
    "carol": UserInDB(
        username="carol", email="carol@e.com",
        roles=["editor", "author"],  # 双角色
        hashed_password=pwd_context.hash("editor123"),
    ),
}

# 文章数据
posts_db = {
    1: {"id": 1, "title": "Alice's Post", "author": "alice", "published": True},
    2: {"id": 2, "title": "Bob's Post", "author": "bob", "published": False},
    3: {"id": 3, "title": "Carol's Post", "author": "carol", "published": True},
}


# === 权限工具 ===
def get_user_permissions(user: User) -> set:
    """合并用户所有角色的权限"""
    perms = set()
    for role in user.roles:
        perms.update(ROLE_PERMISSIONS.get(role, set()))
    return perms


def has_permission(user: User, permission: str) -> bool:
    perms = get_user_permissions(user)
    if permission in perms:
        return True
    resource, action = permission.split(":", 1)
    if f"{resource}:*" in perms:
        return True
    if "*:*" in perms:
        return True
    return False


def require_permission(permission: str):
    """权限检查依赖"""
    def checker(current_user: User = Depends(get_current_active_user)) -> User:
        if not has_permission(current_user, permission):
            raise HTTPException(403, f"Permission denied. Required: {permission}")
        return current_user
    return checker


# === 认证 ===
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = users_db.get(username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(401, "Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    # 把 roles 也放进 token，避免每次查 DB
    # 注意：roles 变更后旧 token 仍有效——权衡
    access_token = create_access_token({
        "sub": user.username,
        "roles": user.roles,
    })
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exc = HTTPException(401, "Could not validate credentials",
                                    headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise credentials_exc
        roles = payload.get("roles", [])
    except JWTError:
        raise credentials_exc
    user = users_db.get(username)
    if not user:
        raise credentials_exc
    # 用 token 里的 roles 覆盖（避免每次查 DB）
    # 但要注意：DB 里 roles 变更后 token 内的还是旧的
    return User(username=user.username, email=user.email,
                roles=roles, disabled=user.disabled)


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.disabled:
        raise HTTPException(400, "Inactive user")
    return current_user


# === 资源所有权检查 ===
def can_edit_post(user: User, post: dict) -> bool:
    if has_permission(user, "post:delete"):  # admin/editor
        return True
    return post["author"] == user.username  # author 只能改自己的


# === 路由 ===
@app.get("/posts")
def list_posts(user: User = Depends(require_permission("post:read"))):
    return list(posts_db.values())


@app.post("/posts")
def create_post(payload: dict, user: User = Depends(require_permission("post:write"))):
    new_id = max(posts_db.keys()) + 1
    post = {"id": new_id, "title": payload["title"], "author": user.username, "published": False}
    posts_db[new_id] = post
    return post


@app.put("/posts/{post_id}")
def update_post(post_id: int, payload: dict, user: User = Depends(require_permission("post:write"))):
    post = posts_db.get(post_id)
    if not post:
        raise HTTPException(404, "Not found")
    if not can_edit_post(user, post):
        raise HTTPException(403, "Can only edit your own posts")
    post["title"] = payload.get("title", post["title"])
    return post


@app.delete("/posts/{post_id}")
def delete_post(post_id: int, user: User = Depends(require_permission("post:delete"))):
    post = posts_db.get(post_id)
    if not post:
        raise HTTPException(404, "Not found")
    if not can_edit_post(user, post):
        raise HTTPException(403, "Can only delete your own posts")
    del posts_db[post_id]
    return {"deleted": post_id}


@app.post("/posts/{post_id}/publish")
def publish_post(post_id: int, user: User = Depends(require_permission("post:publish"))):
    """只有 editor 能发布"""
    post = posts_db.get(post_id)
    if not post:
        raise HTTPException(404, "Not found")
    post["published"] = True
    return post


@app.get("/admin/users")
def list_users(user: User = Depends(require_permission("user:read"))):
    """只有 admin 能访问"""
    return [{"username": u.username, "roles": u.roles} for u in users_db.values()]


@app.post("/admin/config")
def update_config(payload: dict, user: User = Depends(require_permission("system:config"))):
    """只有 admin 能改系统配置"""
    return {"updated": True, "by": user.username}
\`\`\`

## RBAC 设计的几个原则

### 1. 权限粒度要适中

- 太粗：\`can_edit\` 一个权限管所有资源 → 一个用户能编辑所有表，权限失控。
- 太细：每个字段一个权限 → 权限爆炸，管理成本高。
- 适中：按"资源:操作"分，如 \`post:write\`、\`user:delete\`。

### 2. 角色不要太多

5-10 个角色最合适。超过 20 个就难管理，考虑引入"角色继承"（admin 继承 editor 的所有权限）。

### 3. 权限要可观测

每个 API 调用都记录：谁、什么时候、用什么权限、访问什么。出问题能追溯。

### 4. 默认拒绝

宁可漏授权（用户报错再加），不可默认放行。新加路由忘记加权限检查是重大安全隐患。建议用中间件统一兜底。

### 5. 测试要覆盖权限

写测试时一定要测：

- 没有 token → 401
- 有 token 但没权限 → 403
- 有权限但不是资源所有者 → 403
- 有权限且是所有者 → 200

## 本章小结

- RBAC = 用户 → 角色 → 权限 → 资源，主流授权模型。
- 权限命名用"资源:操作"格式，支持 \`*\` 通配。
- 用 \`require_permission("xxx")\` 工厂函数生成依赖，路由声明所需权限。
- 资源所有权检查：admin/editor 全局权限，author 只能改自己的。
- 多角色用户：权限取并集。
- 权限缓存：内存/Redis 都行，关键是 TTL + 主动失效。

下一章讲 API Key 认证和安全最佳实践——速率限制、HTTPS、CORS、安全检查清单。
`
  },

  // ============================================================
  // 第 30 章：API Key 与安全最佳实践
  // ============================================================
  {
    id: "fp-apikey-security",
    group: "认证与安全",
    icon: "🔑",
    title: "API Key 与安全最佳实践",
    content: `# API Key 与安全最佳实践

## 不止 OAuth2：API Key 的场景

前三章我们讲了 OAuth2 + JWT + RBAC，这套方案非常适合"用户登录 + 调 API"的场景。但有些场景不适合：

1. **服务对服务**：你的后端调 GitHub API，没有"用户"概念，用一个长期 key 就行。
2. **脚本/CLI**：\`pip install\` 时配的 PyPI token，没有交互登录。
3. **Webhook 回调**：第三方回调你的接口，用一个共享 secret 验签。
4. **简单内部 API**：内部微服务之间，搞 OAuth2 太重。

这些场景下，**API Key** 是更轻量的方案。它就是一个字符串，放在 header 或 query 里，服务器验证即可。

### API Key vs JWT

| 维度 | API Key | JWT |
|------|---------|-----|
| 复杂度 | 极简，一个字符串 | 编码 + 签名 |
| 自包含 | 否，要查 DB | 是，自带用户信息 |
| 过期 | 难（要存 DB） | 易（exp 字段） |
| 撤销 | 易（删 DB） | 难（要黑名单） |
| 多端 | 难（要分发 key） | 易（用户登录拿 token） |
| 适合场景 | 服务对服务 | 用户认证 |

经验：**用户用 JWT，服务用 API Key**。

### API Key 的设计要点

1. **足够长**：至少 32 字节随机串，防暴力破解。
2. **可前缀**：\`ak_live_xxxx\` 这种格式，便于识别和搜索。
3. **可撤销**：每个 key 存 DB，删除即撤销。
4. **可限制**：限制 key 的权限范围、IP、调用频率。
5. **可审计**：记录每个 key 调用了什么。

## Demo 1：API Key 的生成与存储

\`\`\`python
# 文件：apikey_gen.py

import secrets
import hashlib
from datetime import datetime
from typing import Optional

# API Key 的标准生成方式
def generate_api_key(prefix: str = "ak") -> str:
    """生成 API Key
    
    格式：{prefix}_{random}
    例：ak_live_abc123def456
    """
    random_part = secrets.token_urlsafe(32)  # 43 字符的 URL 安全随机串
    return f"{prefix}_{random_part}"


# 存储时只存哈希，不存明文
# 这样即使 DB 泄露，攻击者也拿不到原始 key
def hash_api_key(api_key: str) -> str:
    """哈希 API Key 用于存储"""
    return hashlib.sha256(api_key.encode()).hexdigest()


# === 模拟 API Key 表 ===
# 真实项目用数据库
api_keys_db = {
    # key_hash → key 信息
    hash_api_key("ak_live_test12345678901234567890"): {
        "id": 1,
        "name": "Production Backend",
        "permissions": ["read:users", "read:posts"],
        "created_at": datetime(2026, 1, 1),
        "last_used": None,
        "expires_at": datetime(2026, 12, 31),
        "is_active": True,
        "allowed_ips": ["192.168.1.0/24"],  # IP 白名单
    },
}


def validate_api_key(api_key: str, client_ip: str = None) -> Optional[dict]:
    """验证 API Key"""
    key_hash = hash_api_key(api_key)
    key_info = api_keys_db.get(key_hash)

    if not key_info:
        return None  # 不存在

    if not key_info["is_active"]:
        return None  # 已禁用

    if key_info["expires_at"] and datetime.utcnow() > key_info["expires_at"]:
        return None  # 已过期

    # IP 白名单检查
    if client_ip and key_info.get("allowed_ips"):
        import ipaddress
        allowed = False
        for cidr in key_info["allowed_ips"]:
            if ipaddress.ip_address(client_ip) in ipaddress.ip_network(cidr):
                allowed = True
                break
        if not allowed:
            return None

    # 更新 last_used（异步任务里做更好）
    key_info["last_used"] = datetime.utcnow()

    return key_info


# === 生成示例 ===
if __name__ == "__main__":
    key = generate_api_key("ak_live")
    print(f"明文 key: {key}")
    print(f"存储哈希: {hash_api_key(key)}")
    print(f"明文长度: {len(key)}")
\`\`\`

要点：

1. **\`secrets.token_urlsafe\`**：用 \`secrets\` 模块而非 \`random\`，前者是密码学安全的。
2. **存哈希不存明文**：跟密码一样，DB 泄露后攻击者也用不了。
3. **前缀便于识别**：\`ak_live_xxx\` vs \`ak_test_xxx\`，运维看到 key 前缀就知道环境。
4. **IP 白名单**：进一步限制 key 只能在指定 IP 用，泄露了别处也用不了。

## Demo 2：三种传递方式（Header / Query / Cookie）

API Key 怎么传给服务器？FastAPI 都支持：

\`\`\`python
# 文件：apikey_transport.py

from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import APIKeyHeader, APIKeyQuery, APIKeyCookie
from typing import Optional

app = FastAPI()

# === 1. Header 传递（推荐） ===
# 客户端：GET /api/data -H "X-API-Key: ak_live_xxx"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# === 2. Query 传递（不推荐，会出现在日志里） ===
# 客户端：GET /api/data?api_key=ak_live_xxx
api_key_query = APIKeyQuery(name="api_key", auto_error=False)

# === 3. Cookie 传递（适合浏览器场景） ===
# 客户端：浏览器自动带 cookie
api_key_cookie = APIKeyCookie(name="api_key", auto_error=False)


# === 验证逻辑（三种来源都支持） ===
async def get_api_key(
    header_key: Optional[str] = Security(api_key_header),
    query_key: Optional[str] = Security(api_key_query),
    cookie_key: Optional[str] = Security(api_key_cookie),
):
    """从三个地方找 API Key，找到任一个就验证"""
    api_key = header_key or query_key or cookie_key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key missing. Provide via X-API-Key header, api_key query, or cookie.",
        )

    # 验证 key（简化版，实际调 validate_api_key）
    key_info = validate_api_key_simplified(api_key)
    if not key_info:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key",
        )
    return key_info


def validate_api_key_simplified(key: str):
    """简化版验证"""
    # 演示用，真实项目查 DB
    if key == "ak_live_test12345678901234567890":
        return {"name": "test", "permissions": ["read:users"]}
    return None


# === 路由 ===
@app.get("/api/data")
async def get_data(api_key_info: dict = Depends(get_api_key)):
    return {"data": "secret", "key_name": api_key_info["name"]}
\`\`\`

三种传递方式的对比：

| 方式 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| Header | 不进日志、不被 referer 泄露 | 需要客户端能设 header | 服务端、SDK |
| Query | 简单，curl 一行就能测 | 进 access log、被 referer 泄露 | 仅开发测试 |
| Cookie | 浏览器自动带 | 跨域要配 CORS | 浏览器 |

**生产环境一律用 Header**：Query 会让 key 出现在 Nginx/CDN 的访问日志里，cookie 在跨域 API 场景下麻烦。

## Demo 3：完整的 API Key 认证应用

\`\`\`python
# 文件：apikey_app.py

from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Security, Request
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

app = FastAPI(title="API Key 认证示例")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


# === 模型 ===
class APIKeyInfo(BaseModel):
    id: int
    name: str
    permissions: List[str]
    is_active: bool
    created_at: datetime
    last_used: Optional[datetime] = None


# === 模拟数据库 ===
api_keys_store = {
    "ak_live_abc123": APIKeyInfo(
        id=1, name="backend-prod",
        permissions=["read:users", "write:users", "read:posts"],
        is_active=True, created_at=datetime(2026, 1, 1),
    ),
    "ak_live_def456": APIKeyInfo(
        id=2, name="analytics-readonly",
        permissions=["read:users", "read:posts"],
        is_active=True, created_at=datetime(2026, 1, 1),
    ),
    "ak_test_disabled": APIKeyInfo(
        id=3, name="old-key",
        permissions=["read:users"],
        is_active=False, created_at=datetime(2025, 1, 1),  # 已禁用
    ),
}


def get_api_key_info(api_key: str = Security(api_key_header)) -> APIKeyInfo:
    """验证 API Key 并返回 key 信息"""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key required. Pass it in X-API-Key header.",
        )

    key_info = api_keys_store.get(api_key)
    if not key_info:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key",
        )

    if not key_info.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API Key is disabled",
        )

    return key_info


def require_permission(permission: str):
    """权限检查依赖"""
    def checker(key_info: APIKeyInfo = Depends(get_api_key_info)) -> APIKeyInfo:
        if permission not in key_info.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"API Key lacks permission: {permission}",
            )
        return key_info
    return checker


# === 路由 ===
@app.get("/users")
def list_users(key_info: APIKeyInfo = Depends(require_permission("read:users"))):
    return [{"id": 1, "name": "alice"}, {"id": 2, "name": "bob"}]


@app.post("/users")
def create_user(payload: dict, key_info: APIKeyInfo = Depends(require_permission("write:users"))):
    return {"created": payload, "by_key": key_info.name}


@app.get("/posts")
def list_posts(key_info: APIKeyInfo = Depends(require_permission("read:posts"))):
    return [{"id": 1, "title": "Hello"}]


@app.get("/health")
def health():
    """公开端点，不需要 key"""
    return {"status": "ok"}


# === Key 管理端点（管理员才能用） ===
import secrets

admin_master_key = "admin_master_secret"

def get_admin_key(api_key: str = Security(api_key_header)) -> str:
    if api_key != admin_master_key:
        raise HTTPException(403, "Admin access required")
    return api_key


@app.post("/admin/keys", response_model=APIKeyInfo)
def create_api_key(
    payload: dict,
    admin_key: str = Depends(get_admin_key),
):
    """生成新的 API Key"""
    new_key = f"ak_live_{secrets.token_urlsafe(24)}"
    key_info = APIKeyInfo(
        id=len(api_keys_store) + 1,
        name=payload["name"],
        permissions=payload.get("permissions", []),
        is_active=True,
        created_at=datetime.utcnow(),
    )
    api_keys_store[new_key] = key_info
    # 注意：返回时把生成的明文 key 也带上（一次性展示）
    return {**key_info.dict(), "key": new_key}


@app.delete("/admin/keys/{key_name}")
def revoke_api_key(key_name: str, admin_key: str = Depends(get_admin_key)):
    """撤销 API Key"""
    for key, info in api_keys_store.items():
        if info.name == key_name:
            info.is_active = False
            return {"revoked": key_name}
    raise HTTPException(404, "Key not found")
\`\`\`

注意点：

1. **key 创建时一次性显示明文**：之后只存哈希，用户忘了只能重新生成。
2. **公开端点不加依赖**：\`/health\` 不要 key，方便监控。
3. **管理端点单独鉴权**：用 master admin key，与普通 API key 分开。

## Demo 4：速率限制（slowapi）

不论 OAuth2 还是 API Key，**必须限流**。否则一个用户能 DDoS 你的服务，或者暴力破解密码。

\`slowapi\` 是 FastAPI 生态最流行的限流库：

\`\`\`bash
pip install slowapi
\`\`\`

\`\`\`python
# 文件：rate_limit.py

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# === 创建 limiter ===
# key_func 决定按什么维度限流
# get_remote_address：按客户端 IP
# 也可以改成按用户 ID（需要从 token 解析）
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

# 必须的两步：注册 limiter 状态 + 中间件
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# 错误处理：超过限流时返回 429
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"},
    )


# === 限流装饰器 ===
# "5/minute" 表示每分钟最多 5 次
# 限流维度由 key_func 决定（这里是 IP）
@app.get("/expensive")
@limiter.limit("5/minute")
async def expensive_op(request: Request):  # 注意必须有 request 参数
    return {"result": "expensive data"}


# 多级限流：同时应用多个限制
@app.post("/login")
@limiter.limit("10/minute")  # 每分钟 10 次（防暴力破解）
@limiter.limit("100/hour")   # 每小时 100 次
async def login(request: Request):
    return {"token": "xxx"}


# 动态限流：根据用户类型决定限流
def get_user_key(request: Request) -> str:
    """自定义 key：登录用户按 ID，未登录按 IP"""
    user = getattr(request.state, "user", None)
    if user:
        return f"user:{user['sub']}"
    return f"ip:{get_remote_address(request)}"


user_limiter = Limiter(key_func=get_user_key)


@app.get("/api/data")
@user_limiter.limit("100/hour")
async def api_data(request: Request):
    return {"data": "..."}


# 高级：按用户等级限流
def dynamic_limit(request: Request) -> str:
    """VIP 用户 1000/小时，普通用户 100/小时"""
    user = getattr(request.state, "user", {})
    if user.get("tier") == "vip":
        return "1000/hour"
    return "100/hour"


@app.get("/api/premium")
@user_limiter.limit(dynamic_limit)
async def premium_data(request: Request):
    return {"data": "premium"}
\`\`\`

限流策略的选择：

- **登录端点**：\`10/minute\` 防暴力破解。
- **公开 API**：按 IP，\`60/minute\` 防爬虫。
- **付费 API**：按用户，免费版 \`100/hour\`，付费版 \`10000/hour\`。
- **写操作**：\`10/minute\`，比读严格。

\`slowapi\` 默认用内存存储计数，单进程够用。多进程/多实例要用 Redis：

\`\`\`python
from slowapi import Limiter
from slowapi.util import get_remote_address
from limits.storage import RedisStorage

# 用 Redis 存储，多进程共享计数
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379/0",
)
\`\`\`

## Demo 5：HTTPS 强制

生产环境必须 HTTPS。下面三种方法让 FastAPI 强制 HTTPS：

\`\`\`python
# 文件：force_https.py

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()


# === 方法 1：HTTP 重定向到 HTTPS ===
# 部署两层：HTTP(80) → 重定向到 HTTPS(443)
# 这是 Nginx 层做的，FastAPI 不用关心

# === 方法 2：中间件强制 HTTPS ===
class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """如果请求是 HTTP，重定向到 HTTPS"""
    async def dispatch(self, request: Request, call_next):
        # 检查 X-Forwarded-Proto（Nginx 等代理设置的）
        # 不要用 request.url.scheme，因为代理后面的 scheme 永远是 http
        if request.headers.get("x-forwarded-proto", "http") == "http":
            # 重定向到 HTTPS 版本
            https_url = request.url.replace(scheme="https")
            return RedirectResponse(https_url, status_code=301)
        return await call_next(request)


# app.add_middleware(HTTPSRedirectMiddleware)
# 注意：这个中间件要放在所有代理之后，否则会无限重定向


# === 方法 3：HSTS Header ===
# 告诉浏览器"以后永远用 HTTPS 访问这个站"
class HSTSMiddleware(BaseHTTPMiddleware):
    """添加 HSTS header"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # max-age=31536000：1 年
        # includeSubDomains：包括子域名
        # preload：允许进入浏览器的 HSTS 预加载列表
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        return response


app.add_middleware(HSTSMiddleware)


@app.get("/")
def root():
    return {"message": "Use HTTPS!"}
\`\`\`

实际上 HTTPS 通常在反向代理层（Nginx、Caddy、Cloudflare）处理，FastAPI 应用只收 HTTP。但应用要：

1. **信任 \`X-Forwarded-Proto\`**：FastAPI 用 \`ProxyHeadersMiddleware\` 处理。
2. **设置 HSTS**：即使代理终止了 HTTPS，应用也要加 HSTS header。
3. **强制 HTTPS**：如果代理错误地透传了 HTTP 请求，应用要重定向。

部署时这样配 Nginx：

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;
    # HTTP 永久重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # 关键：把真实协议传给后端
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

## Demo 6：CORS 安全配置

**CORS（Cross-Origin Resource Sharing）** 是浏览器的安全机制：默认情况下 JavaScript 不能跨域请求 API。

如果你的前端在 \`a.com\`，API 在 \`b.com\`，浏览器会拦截。要 API 主动声明"我允许 a.com 访问"才行。

\`\`\`python
# 文件：cors_config.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# === CORS 配置 ===
app.add_middleware(
    CORSMiddleware,
    # allow_origins：允许哪些域名访问
    # 生产环境必须明确列出，不要用 ["*"]
    allow_origins=[
        "https://app.example.com",     # 主站
        "https://admin.example.com",   # 后台
        "http://localhost:3000",       # 开发环境
    ],
    # allow_credentials：是否允许带 cookie
    # 如果用 cookie 认证，必须 True
    # 注意：True 时 allow_origins 不能用 "*"
    allow_credentials=True,
    # allow_methods：允许的 HTTP 方法
    # ["*"] 表示所有，足够
    allow_methods=["*"],
    # allow_headers：允许的请求头
    # ["*"] 表示所有
    allow_headers=["*"],
    # max_age：预检请求缓存时间（秒）
    # 浏览器在这段时间内不再发 OPTIONS
    max_age=3600,
)


@app.get("/api/data")
def get_data():
    # 浏览器跨域请求时，CORSMiddleware 会自动加 Access-Control-Allow-Origin header
    return {"data": "hello"}


# === 错误示例 ===
# 千万别这样配！
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,  # 这是矛盾的！浏览器会拒绝
# )

# 如果要允许任意域名 + cookie：
# 没办法。CORS 规范禁止 allow_origins=* 同时 allow_credentials=True
# 必须明确列出域名
\`\`\`

### CORS 的工作原理

1. **简单请求**：GET/POST + 简单 header，浏览器直接发，看响应有没有 \`Access-Control-Allow-Origin\`。
2. **预检请求**：PUT/DELETE 或带自定义 header，浏览器先发 OPTIONS，问"我能发吗？"。
3. **预检响应**：服务器返回允许的方法、header、是否带 cookie。
4. **正式请求**：预检通过后浏览器才发真实请求。

\`max_age=3600\` 让浏览器缓存预检结果 1 小时，减少 OPTIONS 请求。

### CORS 安全注意事项

1. **不要 allow_origins=["*"]**：这是"允许任何网站访问你的 API"，相当于没有 CORS 防护。
2. **allow_credentials=True 时更要严格**：意味着任意网站能带用户 cookie 访问你的 API，allow_origins 必须明确。
3. **不要把内部 API 暴露给公网**：内部 API 用 IP 白名单或 VPN，不靠 CORS。
4. **CORS 不是认证**：CORS 只防浏览器跨站，curl/Postman 完全不受 CORS 限制。CORS 是保护用户，不是保护 API。

## 安全检查清单

部署 FastAPI 前过一遍这个清单：

### 认证与授权

- [ ] 所有敏感端点都有认证（JWT/OAuth2/API Key）。
- [ ] 密码用 bcrypt/argon2 哈希，绝不存明文。
- [ ] JWT 密钥足够长（≥32 字符），从环境变量读。
- [ ] JWT 设置合理过期时间（access 30 分钟，refresh 7 天）。
- [ ] 敏感操作有权限检查（RBAC）。
- [ ] 资源操作检查所有权（user 只能改自己的）。

### 传输安全

- [ ] 生产环境强制 HTTPS（Nginx 重定向 + HSTS）。
- [ ] TLS 用 1.2+，禁用旧版本。
- [ ] 证书自动续期（Let's Encrypt + certbot）。

### 输入校验

- [ ] 所有请求体用 Pydantic 模型校验。
- [ ] 路径参数和查询参数有类型约束。
- [ ] SQL 用 ORM 或参数化查询，绝不字符串拼接（防 SQL 注入）。
- [ ] 文件上传限制大小和扩展名。
- [ ] HTML 输出转义（防 XSS）。

### 限流与防护

- [ ] 登录端点限流（10/min）。
- [ ] API 整体限流（按用户或 IP）。
- [ ] 大文件/慢请求有超时。
- [ ] 用 CDN/Cloudflare 防 DDoS。

### 错误处理

- [ ] 生产环境关闭 debug 模式（不要暴露堆栈）。
- [ ] 错误信息不泄露内部细节（不返回 SQL、文件路径）。
- [ ] 500 错误记录日志，返回通用错误消息。

### 配置安全

- [ ] 密钥、密码、token 从环境变量读，不进 Git。
- [ ] \`.env\` 文件加到 \`.gitignore\`。
- [ ] 不同环境用不同密钥（dev/staging/prod）。
- [ ] 数据库连接用最小权限账号。

### 日志审计

- [ ] 记录所有登录尝试（成功 + 失败）。
- [ ] 记录敏感操作（删用户、改权限）。
- [ ] 日志不包含密码、token 等敏感信息。
- [ ] 日志集中存储，定期审计。

### 依赖管理

- [ ] 定期 \`pip-audit\` 检查依赖漏洞。
- [ ] 锁定依赖版本（\`requirements.txt\` 或 \`pyproject.toml\`）。
- [ ] 关注 CVE，及时升级。

## 一个生产就绪的安全配置示例

\`\`\`python
# 文件：secure_app.py

import os
import logging
from datetime import timedelta

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# === 环境配置 ===
ENV = os.getenv("APP_ENV", "dev")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-key")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# === 日志配置 ===
logging.basicConfig(
    level=logging.INFO if ENV == "prod" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# === FastAPI 应用 ===
app = FastAPI(
    title="My Secure API",
    docs_url="/docs" if ENV != "prod" else None,  # 生产环境关文档
    redoc_url="/redoc" if ENV != "prod" else None,
    openapi_url="/openapi.json" if ENV != "prod" else None,
)


# === 1. 限流 ===
limiter = Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379/0")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


# === 2. Trusted Host（防 Host header 注入） ===
if ENV == "prod":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=ALLOWED_HOSTS,
    )


# === 3. CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
    max_age=3600,
)


# === 4. Gzip 压缩 ===
app.add_middleware(GZipMiddleware, minimum_size=1000)


# === 异常处理 ===
@app.exception_handler(RateLimitExceeded)
async def rate_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(429, {"detail": "Too many requests"})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 生产环境不暴露堆栈
    logger.exception(f"Unhandled error: {exc}")
    if ENV == "prod":
        return JSONResponse(500, {"detail": "Internal server error"})
    return JSONResponse(500, {"detail": str(exc)})


# === 健康检查（公开） ===
@app.get("/health")
async def health():
    return {"status": "ok", "env": ENV}


# === 受保护端点 ===
@app.get("/api/data")
@limiter.limit("100/hour")
async def get_data(request: Request):
    return {"data": "protected"}
\`\`\`

几个关键设计：

1. **生产环境关闭文档**：\`/docs\`、\`/redoc\`、\`/openapi.json\` 都不暴露，避免泄露 API 结构。
2. **TrustedHostMiddleware**：防止 Host header 注入攻击。
3. **GZip 压缩**：减少传输体积，移动端尤其受益。
4. **全局异常处理**：兜底所有未捕获异常，生产环境返回通用错误。
5. **限流用 Redis**：多进程共享计数。

## 本章小结

- API Key 适合服务对服务、脚本、Webhook 等无用户场景。
- API Key 生成用 \`secrets.token_urlsafe\`，存储只存哈希。
- 三种传递方式：Header（推荐）、Query（不推荐）、Cookie。
- \`slowapi\` 是 FastAPI 限流首选，支持多级、动态限流。
- 生产环境必须 HTTPS + HSTS + CORS 严格配置。
- 部署前过一遍安全清单：认证、传输、输入、限流、错误、配置、日志、依赖。

至此认证与安全 4 章结束。下一批进入异步编程——async/await 原理、异步客户端、后台任务、定时任务。
`
  }
];
