// =============================================================
// FastAPI 全栈实战 - 第 3 批章节（用户认证系统 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ff-password:      密码哈希与安全
//   ff-jwt:           JWT 令牌原理
//   ff-register:      注册接口实现
//   ff-login:         登录与令牌签发
//   ff-current-user:  当前用户依赖
// =============================================================

export const chapters = [
  // ============================================================
  // 第 11 章：密码哈希与安全
  // ============================================================
  {
    id: "ff-password",
    group: "用户认证系统",
    icon: "🔒",
    title: "密码哈希与安全",
    content: `# 密码哈希与安全

## 一、为什么不能存明文密码

如果数据库被攻破（SQL 注入、备份泄漏、内部作恶），所有用户密码就裸奔了。而**用户喜欢复用密码**——拿到一个网站的密码，就能去试 Gmail、银行、支付宝。

\`\`\`
❌ 数据库里存明文：password = "alice123456"
   → 数据库泄漏 = 用户所有账号沦陷

✅ 数据库存哈希：password_hash = "$2b$12$abc..."
   → 拿到哈希也推不出原密码
\`\`\`

## 二、什么是哈希

**哈希（hash）** 是把任意长度输入变成固定长度输出的单向函数。好的哈希函数有这些特性：

1. **单向**：从 hash 推不出原输入
2. **确定性**：同一输入永远得到同一输出
3. **雪崩**：输入差一个字符，输出完全不同
4. **抗碰撞**：找不到两个不同输入得到相同输出

\`\`\`python
import hashlib

# MD5（已不安全，仅演示）
hashlib.md5(b"password").hexdigest()
# '5f4dcc3b5aa765d61d8327deb882cf99'

# SHA-256（强度高，但不适合密码）
hashlib.sha256(b"password").hexdigest()
# '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
\`\`\`

**为什么 SHA-256 不适合密码？** 太快了！GPU 每秒能算几亿次，暴力破解太容易。

## 三、bcrypt：专门为密码设计的哈希

\`\`\`bash
pip install bcrypt
\`\`\`

bcrypt 的设计目标就是**慢**——慢到暴力破解不可行，但又慢得用户能接受（约 100ms）。

### 3.1 关键特性：盐（salt）

\`\`\`python
import bcrypt

# 同一密码，两次哈希结果不同
h1 = bcrypt.hashpw(b"password123", bcrypt.gensalt())
h2 = bcrypt.hashpw(b"password123", bcrypt.gensalt())
print(h1)  # b'$2b$12$L9f...';
print(h2)  # b'$2b$12$X3a...'  ← 完全不同
# 但都能验证通过：
bcrypt.checkpw(b"password123", h1)  # True
bcrypt.checkpw(b"password123", h2)  # True
\`\`\`

**盐** 是一段随机字符串，哈希时混入密码。同一密码每次哈希结果不同，防止"彩虹表攻击"（预先算好的密码-哈希对照表）。

bcrypt 把盐直接编码进哈希结果里，不用单独存。

### 3.2 关键特性：cost factor（计算成本）

哈希结果里的 \`$2b$12\` 中的 \`12\` 是 cost factor，表示 2^12 = 4096 轮迭代。

\`\`\`
$2b$12$N9qo8uLOickgx2ZMRZoMy...
 │  │
 │  └─ cost factor（4-31，越大越慢越安全）
 └──── 算法版本（2b 是最新）
\`\`\`

cost factor 每加 1，耗时翻倍。12 是当前推荐值（约 100ms）。CPU 升级后可以调高。

## 四、Demo：密码哈希完整流程

\`\`\`python
# Demo：密码哈希与验证
import bcrypt
import time

# ===== 1. 哈希密码 =====
password = b"alice123456"

# bcrypt.hashpw 接收 bytes，返回 bytes
# gensalt(rounds=12) 生成盐，12 是 cost factor
print("=== 哈希密码 ===")
start = time.time()
password_hash = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))
elapsed = (time.time() - start) * 1000
print(f"密码：{password.decode()}")
print(f"哈希：{password_hash.decode()}")
print(f"耗时：{elapsed:.0f}ms")

# ===== 2. 同一密码哈希两次，结果不同（盐不同）=====
print("\\n=== 盐的作用 ===")
h1 = bcrypt.hashpw(password, bcrypt.gensalt())
h2 = bcrypt.hashpw(password, bcrypt.gensalt())
print(f"哈希 1：{h1.decode()}")
print(f"哈希 2：{h2.decode()}")
print(f"是否相同：{h1 == h2}")  # False

# 但都能验证通过
print(f"哈希 1 验证：{bcrypt.checkpw(password, h1)}")  # True
print(f"哈希 2 验证：{bcrypt.checkpw(password, h2)}")  # True

# ===== 3. 验证密码 =====
print("\\n=== 验证密码 ===")
# 正确密码
print(f"验证 'alice123456'：{bcrypt.checkpw(b'alice123456', password_hash)}")
# 错误密码
print(f"验证 'wrong'：{bcrypt.checkpw(b'wrong', password_hash)}")

# ===== 4. cost factor 对比 =====
print("\\n=== cost factor 对耗时的影响 ===")
for rounds in [4, 8, 12, 14]:
    start = time.time()
    bcrypt.hashpw(password, bcrypt.gensalt(rounds=rounds))
    elapsed = (time.time() - start) * 1000
    print(f"  rounds={rounds:2d}: {elapsed:7.1f}ms")

# ===== 5. 安全：用常量时间比较防时序攻击 =====
# 直接用 == 比较会有时序攻击风险（比较快慢能反推字符）
# bcrypt.checkpw 内部已经用常量时间比较，安全
print("\\n=== 防时序攻击 ===")
print("bcrypt.checkpw 内部使用常量时间比较，防止时序攻击")
print("不要用 == 比较！")

# ===== 6. 密码强度建议 =====
print("\\n=== 密码强度检查示例 ===")
def check_password_strength(password: str) -> list[str]:
    """简单的密码强度检查，返回问题列表。"""
    problems = []
    if len(password) < 8:
        problems.append("密码至少 8 位")
    if not any(c.isupper() for c in password):
        problems.append("建议包含大写字母")
    if not any(c.islower() for c in password):
        problems.append("建议包含小写字母")
    if not any(c.isdigit() for c in password):
        problems.append("建议包含数字")
    return problems

for pwd in ["123", "password", "Password1"]:
    problems = check_password_strength(pwd)
    if problems:
        print(f"  '{pwd}': {problems}")
    else:
        print(f"  '{pwd}': ✅ 强度足够")
\`\`\`

## 五、封装 password 工具模块

在项目里我们封装一个 \`security.py\`：

\`\`\`python
# 文件：backend/app/security.py
import bcrypt

def hash_password(plain_password: str) -> str:
    """把明文密码哈希成可存储的字符串。"""
    # bcrypt 需要 bytes，str → bytes 用 .encode()
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # 存数据库时用 str，方便序列化
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码是否与哈希匹配。"""
    pwd_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    # checkpw 返回 bool
    return bcrypt.checkpw(pwd_bytes, hash_bytes)
\`\`\`

## 六、常见错误

### 6.1 字符串与 bytes 混淆

\`\`\`python
# ❌ 错误：bcrypt 要 bytes，传 str 报错
bcrypt.hashpw("password", bcrypt.gensalt())  # TypeError

# ✅ 正确：encode 成 bytes
bcrypt.hashpw("password".encode(), bcrypt.gensalt())
\`\`\`

### 6.2 哈希后修改密码字段类型

数据库里 \`password_hash\` 字段必须是 \`VARCHAR(255)\`——bcrypt 哈希结果约 60 字符，留点余量。

### 6.3 用 SHA-256 / MD5 存密码

这些算法太快，不抗暴力破解。**必须用 bcrypt / argon2 / scrypt 这类慢哈希**。

## 七、本章小结

- 永远不存明文密码，存哈希
- bcrypt 是密码哈希的事实标准：慢、加盐、抗暴力破解
- 同一密码每次哈希结果不同（盐不同）
- \`hashpw\` 哈希，\`checkpw\` 验证
- 下章我们学习 JWT，用来标识"已登录用户"`,
  },

  // ============================================================
  // 第 12 章：JWT 令牌原理
  // ============================================================
  {
    id: "ff-jwt",
    group: "用户认证系统",
    icon: "🎫",
    title: "JWT 令牌原理",
    content: `# JWT 令牌原理

## 一、为什么需要 JWT

用户登录后，服务器怎么知道"这个请求是 alice 发的"？

| 方案 | 做法 | 缺点 |
|------|------|------|
| 每次传账号密码 | 每个请求都带 username/password | 密码频繁传输，风险大 |
| Session ID | 服务端存 session，客户端存 cookie | 服务端有状态，难水平扩展 |
| **JWT** | 服务端签发 token，客户端携带 token | 无状态，扩展性好（推荐） |

**JWT（JSON Web Token）** 是一种紧凑的、自包含的令牌格式，广泛用于现代 Web 认证。

## 二、JWT 的结构

JWT 长这样（三段，用 . 分隔）：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzAwMDAwMDAwfQ.signature
└─────────── Header ─────────┘ └──────── Payload ────────┘ └─ Signature ─┘
\`\`\`

每段都是 Base64URL 编码的 JSON。

### 2.1 Header（头部）

\`\`\`json
{
  "alg": "HS256",   // 签名算法
  "typ": "JWT"      // 类型
}
\`\`\`

### 2.2 Payload（载荷）

存放声明（claims），就是你想传的数据：

\`\`\`json
{
  "sub": "1",                  // subject：用户 id（约定俗成）
  "exp": 1700000000,           // expiration：过期时间（Unix 时间戳）
  "iat": 1699900000,           // issued at：签发时间
  "username": "alice"          // 自定义字段
}
\`\`\`

⚠️ **Payload 是 Base64 编码，不是加密！** 不要放密码、信用卡号等敏感信息。

### 2.3 Signature（签名）

\`\`\`
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret_key
)
\`\`\`

签名用服务器私钥计算，**只有持有私钥的人才能签发合法 token**。客户端改了 payload，签名就对不上。

## 三、JWT 的认证流程

\`\`\`
1. 用户登录
   POST /auth/login {username, password}
        ↓
2. 服务器校验密码 → 生成 JWT → 返回
   ← {token: "eyJhbGc..."}
        ↓
3. 客户端存 token（localStorage / cookie）
        ↓
4. 后续请求带 token
   GET /boards
   Authorization: Bearer eyJhbGc...
        ↓
5. 服务器验签 → 解析 user_id → 注入 current_user
\`\`\`

**核心优势：无状态**。服务器不用存 session，任何一台服务器只要持有 secret_key 都能验签。

## 四、安装与使用

\`\`\`bash
pip install python-jose[cryptography]
\`\`\`

\`\`\`python
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

# 服务器私钥（生产环境用 openssl rand -hex 32 生成）
SECRET_KEY = "dev-secret-key-change-me"
ALGORITHM = "HS256"

# ===== 1. 创建 token =====
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """生成 JWT。data 是要编码的 payload。"""
    # 复制一份，避免修改原 dict
    to_encode = data.copy()
    # 设置过期时间
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=60)
    )
    to_encode.update({"exp": expire})  # exp 是标准声明
    # 编码成 JWT 字符串
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ===== 2. 解码 token =====
def decode_access_token(token: str):
    """解码 JWT，返回 payload。token 无效抛 JWTError。"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(f"token 无效：{e}")
        return None
\`\`\`

## 五、Demo：JWT 完整流程

\`\`\`python
# Demo：JWT 签发、验证、过期、篡改检测
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import time

SECRET_KEY = "dev-secret-key-change-me"
ALGORITHM = "HS256"

# ===== 1. 签发 token =====
print("=== 1. 签发 token ===")
payload = {
    "sub": "1",              # 用户 id
    "username": "alice",
    "role": "admin",
}
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print(f"  token: {token[:50]}...")

# ===== 2. 解码 token =====
print("\\n=== 2. 解码 token ===")
decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
print(f"  payload: {decoded}")

# ===== 3. 带过期时间的 token =====
print("\\n=== 3. 带过期时间的 token ===")
payload_with_exp = {
    "sub": "1",
    "exp": datetime.now(timezone.utc) + timedelta(seconds=2),  # 2 秒后过期
}
short_token = jwt.encode(payload_with_exp, SECRET_KEY, algorithm=ALGORITHM)
print(f"  立即解码：{jwt.decode(short_token, SECRET_KEY, algorithms=[ALGORITHM])}")

print("  等待 3 秒...")
time.sleep(3)
try:
    jwt.decode(short_token, SECRET_KEY, algorithms=[ALGORITHM])
except JWTError as e:
    print(f"  过期后解码失败：{e}")

# ===== 4. 签名验证：用错误密钥验签 =====
print("\\n=== 4. 错误密钥验签 ===")
try:
    jwt.decode(token, "wrong-secret", algorithms=[ALGORITHM])
except JWTError as e:
    print(f"  验签失败：{e}")

# ===== 5. 篡改 payload 检测 =====
print("\\n=== 5. 篡改 payload 检测 ===")
# 模拟攻击者改了 payload（把 sub 改成 2，伪装成另一个用户）
parts = token.split(".")
import base64
import json

# 解码 payload（Base64URL）
def b64url_decode(s):
    # 补齐 padding
    s += "=" * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

original_payload = json.loads(b64url_decode(parts[1]))
print(f"  原 payload: {original_payload}")

# 篡改：把 sub 从 "1" 改成 "2"
tampered_payload = original_payload.copy()
tampered_payload["sub"] = "2"

# 重新编码（但攻击者没有 secret_key，无法重算签名）
tampered_b64 = base64.urlsafe_b64encode(
    json.dumps(tampered_payload).encode()
).decode().rstrip("=")
tampered_token = parts[0] + "." + tampered_b64 + "." + parts[2]

try:
    jwt.decode(tampered_token, SECRET_KEY, algorithms=[ALGORITHM])
    print("  ❌ 篡改成功！这不应该发生")
except JWTError as e:
    print(f"  ✅ 篡改被检测到：{e}")

# ===== 6. 标准声明字段 =====
print("\\n=== 6. JWT 标准声明字段 ===")
print("""
iss (issuer)            签发者
sub (subject)           主题（通常放 user_id）
aud (audience)          接收方
exp (expiration time)   过期时间
nbf (not before)        生效时间
iat (issued at)         签发时间
jti (JWT ID)            唯一标识（防重放）
""")
\`\`\`

运行这个 demo，重点理解：

1. **签名防篡改**：改了 payload，签名就对不上
2. **过期时间**：\`exp\` 字段会被自动校验
3. **密钥保密**：SECRET_KEY 泄漏 = 任何人都能伪造 token

## 六、JWT 的优缺点

### 优点

| 优点 | 说明 |
|------|------|
| 无状态 | 服务器不用存 session，水平扩展友好 |
| 自包含 | token 里有用户信息，不用每次查库 |
| 跨域 | 不依赖 cookie，天然支持跨域 |
| 标准化 | RFC 7519，所有语言都有库 |

### 缺点

| 缺点 | 应对 |
|------|------|
| 无法主动失效 | token 签发后无法撤回，靠短过期时间 + refresh token |
| 大小较大 | 比 session id 大几倍 |
| Payload 不加密 | 不能放敏感数据 |
| 重放攻击 | 用 jti + 服务端黑名单 |

## 七、Access Token vs Refresh Token

生产环境通常用双 token 机制：

| Token 类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 短（15 分钟~1 小时） | 访问 API |
| Refresh Token | 长（7 天~30 天） | 换取新的 Access Token |

流程：

\`\`\`
1. 登录 → 返回 access_token + refresh_token
2. 用 access_token 访问 API
3. access_token 过期 → 用 refresh_token 换新的 access_token
4. refresh_token 过期 → 重新登录
\`\`\`

这样既保证安全性（access token 短命），又保证用户体验（不用频繁登录）。

本教程为简化只用 access token，生产环境建议实现 refresh token。

## 八、安全注意事项

1. **SECRET_KEY 必须保密**：用 \`openssl rand -hex 32\` 生成，放 \`.env\`
2. **HTTPS 是必须的**：HTTP 下 token 会被中间人窃取
3. **不要存敏感信息**：Payload 是 Base64，等于明文
4. **设置短过期时间**：access token 不超过 1 小时
5. **前端存储位置**：
   - localStorage：易受 XSS 攻击
   - httpOnly cookie：防 XSS，但需 CSRF 防护
   - 本教程用 localStorage，生产建议 httpOnly cookie

## 九、本章小结

- JWT 是无状态的认证令牌：Header.Payload.Signature
- 签名用 secret_key 计算，防篡改
- \`python-jose\` 是 Python 主流 JWT 库
- 下章我们把密码哈希 + JWT 组合起来，实现注册接口`,
  },

  // ============================================================
  // 第 13 章：注册接口实现
  // ============================================================
  {
    id: "ff-register",
    group: "用户认证系统",
    icon: "📝",
    title: "注册接口实现",
    content: `# 注册接口实现

## 一、注册接口的需求

用户注册的完整流程：

\`\`\`
1. 客户端 POST /auth/register
   {email, username, password}

2. 服务器校验：
   - 邮箱格式对不对
   - 用户名是否已存在
   - 密码强度够不够

3. 密码哈希 → 存数据库

4. 返回用户信息（不含密码！）
\`\`\`

## 二、定义 Pydantic Schema

先定义请求和响应的数据结构：

\`\`\`python
# 文件：backend/app/schemas.py
from pydantic import BaseModel, EmailStr, Field

# 注册请求
class UserCreate(BaseModel):
    email: EmailStr                      # EmailStr 自动校验邮箱格式
    username: str = Field(
        min_length=3, max_length=20,
        pattern="^[a-zA-Z0-9_]+$",       # 只允许字母数字下划线
    )
    password: str = Field(
        min_length=8, max_length=100,
        description="密码至少 8 位",
    )

# 用户响应（绝不能包含 password_hash）
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    avatar: str | None = None
    # 用 model_config 启用 ORM 模式（Pydantic v2）
    model_config = {
        "from_attributes": True,   # 允许从 ORM 对象读属性
    }
\`\`\`

⚠️ **EmailStr 需要额外安装**：\`pip install email-validator\`

## 三、定义 User 模型

\`\`\`python
# 文件：backend/app/models.py
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    avatar: Mapped[str | None] = mapped_column(String(500), default=None)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    boards: Mapped[list["Board"]] = relationship(back_populates="owner")
\`\`\`

注意：
- \`unique=True\`：邮箱、用户名唯一，数据库层保证
- \`index=True\`：加索引，查询快
- \`password_hash\` 字段名提醒你**只存哈希，不存明文**

## 四、实现注册路由

\`\`\`python
# 文件：backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
from app.security import hash_password

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # 1. 检查邮箱是否已存在
    exists = db.scalar(
        select(User).where(User.email == payload.email)
    )
    if exists:
        raise HTTPException(400, "该邮箱已被注册")

    # 2. 检查用户名是否已存在
    exists = db.scalar(
        select(User).where(User.username == payload.username)
    )
    if exists:
        raise HTTPException(400, "该用户名已被占用")

    # 3. 哈希密码
    password_hash = hash_password(payload.password)

    # 4. 创建用户
    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=password_hash,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 5. 返回（response_model 自动过滤掉 password_hash）
    return user
\`\`\`

## 五、Demo：完整的注册流程

\`\`\`python
# Demo：注册接口完整流程（用 TestClient 测试）
from fastapi import FastAPI, HTTPException, Depends
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)
import bcrypt

# ===== 1. 基础设施 =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

# ===== 2. User 模型 =====
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)

Base.metadata.create_all(engine)

# ===== 3. 密码工具 =====
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

# ===== 4. Schemas =====
class UserCreate(BaseModel):
    email: str = Field(pattern=r"^[^@]+@[^@]+\\.[^@]+$")  # 简单邮箱校验
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=100)

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# ===== 5. 依赖 + 路由 =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # 邮箱查重
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(400, "该邮箱已被注册")
    # 用户名查重
    if db.scalar(select(User).where(User.username == payload.username)):
        raise HTTPException(400, "该用户名已被占用")

    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ===== 6. 测试 =====
client = TestClient(app)

print("=== 1. 正常注册 ===")
r = client.post("/auth/register", json={
    "email": "alice@example.com",
    "username": "alice",
    "password": "alice12345",
})
print(f"  状态码：{r.status_code}")
print(f"  响应：{r.json()}")
# 注意：响应里没有 password_hash，被 response_model 过滤了

print("\\n=== 2. 重复邮箱 ===")
r = client.post("/auth/register", json={
    "email": "alice@example.com",
    "username": "alice2",
    "password": "alice12345",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 3. 重复用户名 ===")
r = client.post("/auth/register", json={
    "email": "bob@example.com",
    "username": "alice",
    "password": "bob123456",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 4. 邮箱格式错误 ===")
r = client.post("/auth/register", json={
    "email": "not-an-email",
    "username": "bob",
    "password": "bob123456",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 5. 密码太短 ===")
r = client.post("/auth/register", json={
    "email": "bob@example.com",
    "username": "bob",
    "password": "123",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 6. 用户名含非法字符 ===")
r = client.post("/auth/register", json={
    "email": "bob@example.com",
    "username": "bob!!",
    "password": "bob123456",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail'][0]['msg']}")

print("\\n=== 7. 验证密码已哈希 ===")
with SessionLocal() as db:
    user = db.scalar(select(User).where(User.username == "alice"))
    print(f"  数据库存的：{user.password_hash[:30]}...")
    print(f"  是 bcrypt 哈希：{user.password_hash.startswith('$2b$')}")
    print(f"  验证密码 alice12345：{verify_password('alice12345', user.password_hash)}")
\`\`\`

运行这个 demo，重点理解：

### 6.1 \`response_model\` 的安全作用

\`\`\`python
@app.post("/register", response_model=UserResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return user  # user 有 password_hash 字段
\`\`\`

虽然返回的 \`user\` 对象有 \`password_hash\`，但 \`UserResponse\` 没这个字段，**FastAPI 自动过滤掉**。这是防泄漏的最后一道防线。

### 6.2 唯一性校验的双重保障

\`\`\`python
# 数据库层：unique=True 兜底
email: Mapped[str] = mapped_column(String(255), unique=True)

# 应用层：先查再插，给出友好错误
if db.scalar(select(User).where(User.email == payload.email)):
    raise HTTPException(400, "该邮箱已被注册")
\`\`\`

数据库的 unique 约束是兜底——即使应用层有 bug 漏检，数据库也会拒绝插入。但应用层先查能给出更友好的错误信息（"该邮箱已被注册" vs "IntegrityError"）。

### 6.3 \`from_attributes=True\`（ORM 模式）

\`\`\`python
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
\`\`\`

让 Pydantic 能从 ORM 对象读属性：

\`\`\`python
user = db.get(User, 1)
response = UserResponse.model_validate(user)  # 直接从 ORM 对象创建
\`\`\`

没有这个配置，Pydantic 只能从 dict 创建，需要手动 \`user.model_dump()\`。

## 七、本章小结

- 注册接口 = 校验 + 查重 + 哈希 + 入库 + 返回
- \`EmailStr\` 自动校验邮箱格式
- \`response_model\` 过滤敏感字段
- \`from_attributes=True\` 让 Pydantic 直接读 ORM 对象
- 下章实现登录接口，签发 JWT`,
  },

  // ============================================================
  // 第 14 章：登录与令牌签发
  // ============================================================
  {
    id: "ff-login",
    group: "用户认证系统",
    icon: "🔑",
    title: "登录与令牌签发",
    content: `# 登录与令牌签发

## 一、登录接口的需求

\`\`\`
1. 客户端 POST /auth/login
   {username 或 email, password}

2. 服务器查询用户
3. 校验密码（bcrypt.checkpw）
4. 签发 JWT
5. 返回 {access_token, token_type, user}
\`\`\`

## 二、OAuth2PasswordBearer：FastAPI 的认证方案

FastAPI 提供了 \`OAuth2PasswordBearer\`，自动从 \`Authorization: Bearer xxx\` 头取 token：

\`\`\`python
from fastapi.security import OAuth2PasswordBearer

# tokenUrl 是获取 token 的接口路径（用于 OpenAPI 文档的"Authorize"按钮）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@app.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    # token 自动从 Authorization 头解析
    return {"token": token}
\`\`\`

请求没带 token 时，FastAPI 返回 401：

\`\`\`json
{"detail": "Not authenticated"}
\`\`\`

## 三、OAuth2PasswordRequestForm：标准登录表单

OAuth2 规范的登录接口用表单格式（不是 JSON）：

\`\`\`
POST /auth/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=alice&password=alice12345
\`\`\`

FastAPI 提供 \`OAuth2PasswordRequestForm\` 自动解析：

\`\`\`python
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username, form.password 已自动解析
    ...
\`\`\`

⚠️ 需要 \`python-multipart\` 包：\`pip install python-multipart\`

## 四、实现登录接口

\`\`\`python
# 文件：backend/app/routers/auth.py（追加登录路由）
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import TokenResponse, UserResponse
from app.security import verify_password

router = APIRouter(prefix="/auth", tags=["认证"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """生成 JWT。"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

@router.post("/login", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # 1. 查用户（支持用户名或邮箱登录）
    user = db.scalar(
        select(User).where(
            or_(
                User.username == form.username,
                User.email == form.username,
            )
        )
    )

    # 2. 用户不存在 → 401
    # 注意：不要区分"用户不存在"和"密码错误"，否则能枚举用户
    if not user:
        raise HTTPException(401, "用户名或密码错误")

    # 3. 校验密码
    if not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "用户名或密码错误")

    # 4. 检查用户是否启用
    if not user.is_active:
        raise HTTPException(403, "账号已被禁用")

    # 5. 签发 token
    access_token = create_access_token(
        data={"sub": str(user.id)}  # sub 是 JWT 标准声明，放 user_id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
\`\`\`

## 五、Demo：登录完整流程

\`\`\`python
# Demo：登录接口 + token 签发 + token 验证
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, String, select, or_
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import bcrypt

# ===== 基础设施 =====
SECRET_KEY = "demo-secret-key"
ALGORITHM = "HS256"

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)

Base.metadata.create_all(engine)

# 密码工具
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt(rounds=10)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

# JWT 工具
def create_access_token(data: dict, expires_minutes: int = 60) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# Schemas
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# 依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ===== App =====
app = FastAPI()

@app.post("/auth/register", response_model=UserResponse)
def register(email: str, username: str, password: str, db: Session = Depends(get_db)):
    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 支持用户名或邮箱登录
    user = db.scalar(
        select(User).where(
            or_(User.username == form.username, User.email == form.username)
        )
    )
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "用户名或密码错误")
    if not user.is_active:
        raise HTTPException(403, "账号已被禁用")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

# ===== 测试 =====
client = TestClient(app)

# 先注册
print("=== 注册 ===")
client.post("/auth/register", params={
    "email": "alice@example.com",
    "username": "alice",
    "password": "alice12345",
})

# 登录
print("\\n=== 用用户名登录 ===")
r = client.post("/auth/login", data={
    "username": "alice",
    "password": "alice12345",
})
print(f"  状态码：{r.status_code}")
token_data = r.json()
print(f"  token: {token_data['access_token'][:30]}...")
print(f"  user: {token_data['user']}")

print("\\n=== 用邮箱登录 ===")
r = client.post("/auth/login", data={
    "username": "alice@example.com",
    "password": "alice12345",
})
print(f"  状态码：{r.status_code}")

print("\\n=== 密码错误 ===")
r = client.post("/auth/login", data={
    "username": "alice",
    "password": "wrong",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 用户不存在 ===")
r = client.post("/auth/login", data={
    "username": "ghost",
    "password": "whatever",
})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")
# 注意：错误信息与"密码错误"一致，防止用户枚举

print("\\n=== 验证 token ===")
payload = decode_token(token_data["access_token"])
print(f"  payload: {payload}")
print(f"  user_id (sub): {payload['sub']}")

print("\\n=== 不带 token 访问受保护接口 ===")
# 模拟一个受保护接口（下章详细实现）
@app.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "无效 token")
    return {"user_id": payload["sub"]}

r = client.get("/me")  # 不带 token
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 带正确 token 访问 ===")
r = client.get("/me", headers={"Authorization": f"Bearer {token_data['access_token']}"})
print(f"  状态码：{r.status_code}, 响应：{r.json()}")

print("\\n=== 带无效 token 访问 ===")
r = client.get("/me", headers={"Authorization": "Bearer invalid.token.here"})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")
\`\`\`

运行这个 demo，重点理解：

### 5.1 登录用表单格式

\`\`\`python
# 注意：登录接口用 data= 而不是 json=
client.post("/auth/login", data={"username": "alice", "password": "..."})
\`\`\`

因为 OAuth2 规范要求登录用 \`application/x-www-form-urlencoded\`。FastAPI 的 \`OAuth2PasswordRequestForm\` 自动解析这种格式。

### 5.2 错误信息不区分用户/密码

\`\`\`python
if not user or not verify_password(form.password, user.password_hash):
    raise HTTPException(401, "用户名或密码错误")  # 统一错误
\`\`\`

如果区分"用户不存在"和"密码错误"，攻击者能枚举出哪些邮箱注册过。

### 5.3 token 携带方式

\`\`\`python
# 请求头格式：Authorization: Bearer <token>
r = client.get("/me", headers={"Authorization": f"Bearer {token}"})
\`\`\`

前端用 \`fetch\` 时同样设置这个头。

## 六、TokenResponse 设计

返回给前端的 token 数据结构：

\`\`\`python
class TokenResponse(BaseModel):
    access_token: str          # JWT 字符串
    token_type: str = "bearer" # token 类型，OAuth2 标准
    user: UserResponse         # 当前用户信息（方便前端直接用）
\`\`\`

返回 \`user\` 是体验优化：前端登录后立即有用户信息，不用再发一次 \`/me\` 请求。

## 七、本章小结

- 登录接口用 \`OAuth2PasswordRequestForm\` 接收表单
- 密码校验用 \`verify_password\`，错误信息不区分用户/密码
- 签发 JWT，\`sub\` 字段放 user_id
- \`OAuth2PasswordBearer\` 自动从 Authorization 头取 token
- 下章实现"当前用户"依赖，让受保护接口自动拿到 user 对象`,
  },

  // ============================================================
  // 第 15 章：当前用户依赖
  // ============================================================
  {
    id: "ff-current-user",
    group: "用户认证系统",
    icon: "👤",
    title: "当前用户依赖",
    content: `# 当前用户依赖

## 一、目标：声明即获得

我们想要这样的代码：

\`\`\`python
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    # current_user 已经是 User 对象，无需手动解析 token
    return current_user

@app.post("/boards")
def create_board(
    payload: BoardCreate,
    current_user: User = Depends(get_current_user),  # 强制登录
    db: Session = Depends(get_db),
):
    board = Board(owner=current_user, **payload.model_dump())
    db.add(board)
    db.commit()
    return board
\`\`\`

路由函数只关心业务，不关心认证细节。这就是依赖注入的威力。

## 二、实现 get_current_user

\`\`\`python
# 文件：backend/app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),    # 自动取 Authorization 头
    db: Session = Depends(get_db),          # 自动拿数据库会话
) -> User:
    """从 token 解析当前用户。token 无效或用户不存在则 401。"""

    # 1. 解码 token
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
        )
        # sub 是 user_id（字符串形式，因为 JWT 标准要求）
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(401, "token 缺少 sub 字段")
    except JWTError:
        raise HTTPException(401, "token 无效或已过期")

    # 2. 查询用户
    user = db.get(User, int(user_id_str))
    if user is None:
        raise HTTPException(401, "用户不存在")
    if not user.is_active:
        raise HTTPException(403, "账号已被禁用")

    return user
\`\`\`

注意 \`get_current_user\` 自己也用了 \`Depends\`——**依赖可以嵌套**。FastAPI 会自动级联解析：

\`\`\`
路由函数
  └─ Depends(get_current_user)
       ├─ Depends(oauth2_scheme)  → 取 token
       └─ Depends(get_db)          → 取 session
\`\`\`

## 三、Demo：完整的认证体系

\`\`\`python
# Demo：完整的认证体系（注册→登录→受保护接口）
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    sessionmaker, Session,
)
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import bcrypt

# ===== 配置 =====
SECRET_KEY = "demo-secret"
ALGORITHM = "HS256"

# ===== 基础设施 =====
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

# ===== 模型 =====
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
    is_admin: Mapped[bool] = mapped_column(default=False)

Base.metadata.create_all(engine)

# ===== 工具函数 =====
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt(rounds=10)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(data: dict, minutes: int = 60) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ===== Schemas =====
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)

class BoardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    color: str = Field(default="blue", pattern="^(blue|green|red|yellow)$")

class BoardResponse(BaseModel):
    id: int
    title: str
    color: str
    owner_id: int
    model_config = ConfigDict(from_attributes=True)

# ===== 依赖 =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """核心依赖：从 token 解析当前用户。"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "token 缺少 sub")
    except JWTError:
        raise HTTPException(401, "token 无效")

    user = db.get(User, int(user_id))
    if not user:
        raise HTTPException(401, "用户不存在")
    if not user.is_active:
        raise HTTPException(403, "账号已禁用")
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """权限依赖：要求当前用户是管理员。"""
    if not current_user.is_admin:
        raise HTTPException(403, "需要管理员权限")
    return current_user

# ===== Board 模型（简化版，用于演示受保护接口）=====
class Board(Base):
    __tablename__ = "boards"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    color: Mapped[str] = mapped_column(String(20), default="blue")
    owner_id: Mapped[int] = mapped_column(String(255))  # 简化：直接存 owner_id 数字

Base.metadata.create_all(engine)

# ===== 路由 =====
app = FastAPI()

@app.post("/auth/register", response_model=UserResponse)
def register(email: str, username: str, password: str, db: Session = Depends(get_db)):
    user = User(
        email=email, username=username,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == form.username))
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "用户名或密码错误")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """受保护接口：返回当前用户信息。"""
    return current_user

@app.post("/boards", response_model=BoardResponse, status_code=201)
def create_board(
    payload: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """受保护接口：创建看板，自动绑定当前用户。"""
    board = Board(
        title=payload.title,
        color=payload.color,
        owner_id=current_user.id,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@app.get("/admin/users", response_model=list[UserResponse])
def list_users(
    admin: User = Depends(get_current_admin),  # 管理员权限
    db: Session = Depends(get_db),
):
    """管理员接口：列出所有用户。"""
    return db.scalars(select(User)).all()

# ===== 测试 =====
client = TestClient(app)

# 注册 + 登录
client.post("/auth/register", params={
    "email": "alice@example.com",
    "username": "alice",
    "password": "alice12345",
})
r = client.post("/auth/login", data={"username": "alice", "password": "alice12345"})
alice_token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {alice_token}"}

print("=== 1. 不带 token 访问 /me ===")
r = client.get("/me")
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 2. 带 token 访问 /me ===")
r = client.get("/me", headers=headers)
print(f"  状态码：{r.status_code}, 用户：{r.json()}")

print("\\n=== 3. 创建看板（自动绑定 owner）===")
r = client.post("/boards", json={"title": "工作", "color": "green"}, headers=headers)
print(f"  状态码：{r.status_code}, 看板：{r.json()}")
# owner_id 自动是 alice 的 id，不用客户端传

print("\\n=== 4. 不带 token 创建看板 ===")
r = client.post("/boards", json={"title": "测试"})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 5. 管理员接口（普通用户访问）===")
r = client.get("/admin/users", headers=headers)
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 6. 用篡改 token 访问（修改 sub）===")
# 签发一个 sub=999（不存在的用户）的 token
fake_token = create_access_token({"sub": "999"})
r = client.get("/me", headers={"Authorization": f"Bearer {fake_token}"})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")

print("\\n=== 7. 用过期 token 访问 ===")
expired_token = create_access_token({"sub": "1"}, minutes=-1)  # 已过期
r = client.get("/me", headers={"Authorization": f"Bearer {expired_token}"})
print(f"  状态码：{r.status_code}, 错误：{r.json()['detail']}")
\`\`\`

运行这个 demo，重点理解：

### 7.1 依赖级联

\`\`\`python
@app.post("/boards")
def create_board(
    payload: BoardCreate,                                # 请求体
    current_user: User = Depends(get_current_user),     # 自动认证
    db: Session = Depends(get_db),                       # 自动拿 db
):
\`\`\`

路由函数只写业务逻辑，认证、数据库、参数解析全部由框架处理。

### 7.2 权限分层

\`\`\`python
# 普通登录
def get_current_user(token=Depends(oauth2_scheme), db=Depends(get_db)):
    ...

# 管理员权限（依赖 get_current_user）
def get_current_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "需要管理员权限")
    return current_user
\`\`\`

依赖可以叠加，权限分层清晰。

### 7.3 错误码规范

| 状态码 | 含义 | 何时用 |
|--------|------|-------|
| 401 | Unauthorized | 未登录、token 无效、token 过期 |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 请求体校验失败 |

**401 vs 403 的区别**：
- 401：你是谁？（没登录）
- 403：你能干这个吗？（登录了但权限不够）

## 四、完整的认证流程图

\`\`\`
┌──────────┐  POST /auth/register    ┌──────────┐
│  前端     │ ──────────────────────→ │  后端     │
│          │  {email,username,password} │          │
│          │ ←────────────────────── │          │
│          │  {id, email, username}  │          │
└──────────┘                          └──────────┘

┌──────────┐  POST /auth/login        ┌──────────┐
│  前端     │ ──────────────────────→ │  后端     │
│          │  form: username,password │          │
│          │                          │  验证密码  │
│          │                          │  签发 JWT  │
│          │ ←────────────────────── │          │
│          │  {access_token, user}   │          │
│  存 token │                          └──────────┘
│  到本地   │
└────┬─────┘
     │
     │  GET /me  (Authorization: Bearer xxx)
     ↓
┌──────────┐                          ┌──────────┐
│  前端     │ ──────────────────────→ │  后端     │
│          │                          │          │
│          │                          │  解析 token│
│          │                          │  查用户    │
│          │                          │  注入 user │
│          │ ←────────────────────── │          │
│          │  {id, email, username}  │          │
└──────────┘                          └──────────┘
\`\`\`

## 五、本章小结

- \`get_current_user\` 是认证的核心依赖：token → user
- 依赖可嵌套：\`get_current_admin\` 依赖 \`get_current_user\`
- 401 vs 403：未登录 vs 无权限
- 至此，用户认证系统完整了
- 下章开始实现看板核心 CRUD`,
  },
];
