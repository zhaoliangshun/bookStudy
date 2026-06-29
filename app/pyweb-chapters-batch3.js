export const chapters = [
  {
    id: "pyweb-password",
    group: "认证与安全",
    icon: "🔐",
    title: "用户注册与密码安全",
    content: `# 用户注册与密码安全

## 一、为什么密码安全如此重要

密码是用户账户的最后一道防线。在博客系统中，用户通过密码登录后才能发布文章、管理评论、修改个人资料。一旦密码泄露，攻击者就可以冒充用户执行任何操作，甚至通过"撞库"攻击进入该用户在其他平台上的账户。因此，密码的存储与校验是 Web 安全的基石，任何疏忽都可能导致灾难性的后果。

历史上发生过大量真实的密码泄露事件。2012 年 LinkedIn 泄露了 1.67 亿个账号的密码哈希，由于使用了无盐的 SHA-1，攻击者在几小时内就还原了大部分密码；2013 年 Adobe 泄露了 1.5 亿用户的加密密码，且加密方式存在严重缺陷；2019 年 Collection #1 泄露了 21 亿条账号密码记录，被广泛用于撞库攻击。这些事件反复证明：密码存储方式决定了泄露事件的影响范围。

### 1.1 密码泄露的常见途径

| 泄露途径 | 说明 | 防御手段 |
|---------|------|---------|
| SQL 注入脱库 | 攻击者通过注入拿到整张用户表 | 参数化查询、ORM |
| 备份文件泄露 | 数据库备份未加密就放在公网 | 备份加密、访问控制 |
| 内部人员窃取 | 员工直接拷贝数据库 | 最小权限、审计日志 |
| 弱哈希被破解 | 数据库虽哈希但算法太弱 | 使用 bcrypt/argon2 |
| 明文日志 | 密码被错误地写入日志 | 永不记录密码明文 |

### 1.2 密码安全的三个原则

1. **不可逆**：服务器永远不能从存储值还原出原始密码，即使用户是数据库管理员也不行。
2. **防彩虹表**：相同密码不能产生相同的存储值，避免攻击者用预计算表批量破解。
3. **慢哈希**：哈希计算必须足够慢，使暴力破解在时间上不可行，但又不能慢到影响正常登录。

## 二、密码存储的演进

### 2.1 明文存储（绝对禁止）

最糟糕的做法是把密码原样存进数据库：

\`\`\`python
# 反面教材，绝对不要这样写
users = {
    "alice": "password123",   # 明文！
    "bob": "qwerty",          # 明文！
}
\`\`\`

一旦数据库泄露，所有密码立刻暴露。任何正经系统都不应该这样做。

### 2.2 哈希存储

对密码做单向哈希，只存哈希值。登录时对输入再哈希一次，比对哈希值：

\`\`\`python
import hashlib

def hash_password(password: str) -> str:
    # 用 MD5 哈希（不安全，仅演示）
    return hashlib.md5(password.encode()).hexdigest()

def verify(password: str, stored: str) -> bool:
    return hash_password(password) == stored
\`\`\`

这比明文好，但 MD5/SHA 这类通用哈希算法有两个致命问题：一是速度极快，攻击者每秒可尝试数十亿次；二是相同密码哈希值相同，攻击者可以用彩虹表预先算好。

### 2.3 加盐哈希

为每个密码生成一个随机"盐"（salt），把盐和密码一起哈希。这样即使两个用户密码相同，由于盐不同，哈希值也不同，彩虹表失效：

\`\`\`python
import hashlib, os

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()           # 16 字节随机盐
    hashed = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 100000
    ).hex()
    return f"{salt}\${hashed}"             # 把盐和哈希一起存

def verify(password: str, stored: str) -> bool:
    salt, hashed = stored.split("$")
    new_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 100000
    ).hex()
    return new_hash == hashed
\`\`\`

虽然 PBKDF2 比裸 MD5 安全得多，但现代推荐使用专门的密码哈希算法：bcrypt 或 argon2。

## 三、哈希算法对比

| 算法 | 类型 | 安全性 | 速度 | 是否抗 GPU | 适用场景 |
|-----|------|-------|------|-----------|---------|
| MD5 | 通用哈希 | 极弱 | 极快 | 否 | 已废弃，仅校验文件 |
| SHA-1 | 通用哈希 | 弱 | 快 | 否 | 已废弃 |
| SHA-256 | 通用哈希 | 中 | 快 | 否 | 文件校验、签名 |
| PBKDF2 | 密码哈希 | 中 | 可调 | 一般 | 兼容性场景 |
| bcrypt | 密码哈希 | 强 | 慢（可调）| 较好 | 密码存储（常用）|
| argon2 | 密码哈希 | 极强 | 慢（可调）| 好 | 密码存储（推荐）|

> **关键认知**：密码哈希要"慢"，文件哈希要"快"。两者目的相反，绝不能混用。MD5 之所以不适合密码，正是因为它太快了。

bcrypt 自 1999 年提出以来一直是密码哈希的事实标准，它内置盐、计算成本可调（cost factor）、被广泛验证。argon2 是 2015 年密码哈希竞赛冠军，抗 GPU/ASIC 攻击能力更强，是新一代推荐方案。本教程使用 bcrypt，因为它生态最成熟。

## 四、passlib 库详解

\`passlib\` 是 Python 生态中最成熟的密码哈希库，统一封装了 bcrypt、argon2、PBKDF2 等多种算法，API 一致，迁移成本低。

### 4.1 安装

\`\`\`bash
# 安装 passlib 及 bcrypt 后端
pip install "passlib[bcrypt]"
\`\`\`

### 4.2 哈希与验证

\`\`\`python filename="password_utils.py"
from passlib.context import CryptContext

# 创建密码上下文，指定使用 bcrypt
# bcrypt 是经过实战检验的密码哈希算法
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",          # 自动标记旧算法为废弃
    bcrypt__rounds=12,          # cost factor，越大越慢越安全（4-31）
)

def hash_password(password: str) -> str:
    """对明文密码进行哈希，返回可存储的哈希字符串。"""
    # 返回值类似：$2b$12$xxxxx...，其中 $2b$ 表示 bcrypt，12 是 rounds
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """校验明文密码是否与存储的哈希匹配。"""
    return pwd_context.verify(plain, hashed)


# 演示
if __name__ == "__main__":
    raw = "MySecretPass123!"
    hashed = hash_password(raw)
    print(f"原始密码: {raw}")
    print(f"哈希结果: {hashed}")
    print(f"长度: {len(hashed)} 字符")
    print(f"校验正确密码: {verify_password(raw, hashed)}")
    print(f"校验错误密码: {verify_password('wrong', hashed)}")

    # 同一密码两次哈希，结果不同（因为盐不同）
    h1 = hash_password(raw)
    h2 = hash_password(raw)
    print(f"两次哈希相同吗: {h1 == h2}")  # False，盐不同
\`\`\`

注意哈希结果里已经包含了算法标识、cost 和盐，所以验证时不需要单独存盐。这也是 passlib 比手写 PBKDF2 方便的地方。

> **关于 rounds**：bcrypt 的 rounds 每增加 1，计算时间翻倍。12 是常见默认值，在普通服务器上约 250ms。如果登录延迟可接受，可以用 14；超过 16 会明显影响用户体验。

## 五、密码强度校验

光会哈希还不够，必须在注册时拒绝弱密码。\`123456\`、\`password\` 这类密码即使哈希了也很容易被字典攻击破解。

### 5.1 密码强度规则

| 规则 | 说明 | 示例 |
|-----|------|------|
| 最小长度 | 至少 8 位，建议 12 位 | \`abc\` 拒绝 |
| 包含大小写 | 强制大小写字母 | \`password\` 拒绝 |
| 包含数字 | 至少一个数字 | \`Password\` 拒绝 |
| 包含特殊字符 | 至少一个符号 | \`Password1\` 拒绝 |
| 黑名单 | 拒绝常见弱密码 | \`qwerty123\` 拒绝 |
| 不含用户名 | 密码不能包含用户名 | alice 不能用 \`alice2024\` |

### 5.2 密码强度校验器实现

\`\`\`python filename="password_strength.py"
import re
from dataclasses import dataclass

# 常见弱密码黑名单（实际项目应从外部加载更大的列表）
WEAK_PASSWORDS = {
    "password", "12345678", "qwerty123", "abc12345",
    "iloveyou1", "admin123", "letmein1", "welcome1",
}

@dataclass
class PasswordCheckResult:
    valid: bool
    errors: list[str]

def check_password_strength(password: str, username: str = "") -> PasswordCheckResult:
    """校验密码强度，返回是否通过及错误列表。"""
    errors = []

    # 1. 长度检查
    if len(password) < 8:
        errors.append("密码至少 8 位")
    if len(password) > 128:
        errors.append("密码不能超过 128 位")

    # 2. 字符类型检查
    if not re.search(r"[a-z]", password):
        errors.append("必须包含小写字母")
    if not re.search(r"[A-Z]", password):
        errors.append("必须包含大写字母")
    if not re.search(r"\d", password):
        errors.append("必须包含数字")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        errors.append("必须包含特殊字符")

    # 3. 黑名单检查
    if password.lower() in WEAK_PASSWORDS:
        errors.append("密码过于常见，请更换")

    # 4. 不能包含用户名
    if username and username.lower() in password.lower():
        errors.append("密码不能包含用户名")

    # 5. 不能是连续或重复字符
    if re.match(r"^(.)\\1{7,}$", password):
        errors.append("密码不能全是相同字符")

    return PasswordCheckResult(valid=len(errors) == 0, errors=errors)


# 演示
if __name__ == "__main__":
    test_cases = [
        ("123", "alice"),
        ("password", "alice"),
        ("Password1", "alice"),
        ("Alice2024!", "alice"),    # 包含用户名
        ("MyStr0ng@Pass", "alice"),
    ]
    for pwd, user in test_cases:
        result = check_password_strength(pwd, user)
        status = "通过" if result.valid else "失败"
        print(f"密码: {pwd:<18} 用户: {user:<6} -> {status}")
        for err in result.errors:
            print(f"    - {err}")
\`\`\`

## 六、用户注册完整流程

把密码哈希、强度校验、唯一性校验组合起来，就是一个完整的注册流程。下面以博客系统的用户注册为例。

### 6.1 数据模型与注册 API

\`\`\`python filename="register.py"
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .password_utils import hash_password, verify_password
from .password_strength import check_password_strength

router = APIRouter(prefix="/auth", tags=["认证"])

# 请求模型：注册入参
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

# 响应模型：不返回密码哈希
class UserResponse(BaseModel):
    id: int
    username: str
    email: str

# 数据库模型（简化）
class User:
    # 假设有 id, username, email, password_hash 字段
    pass

async def get_user_by_username(db: AsyncSession, username: str):
    """根据用户名查询用户，用于唯一性校验。"""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str):
    """根据邮箱查询用户，邮箱也要唯一。"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """用户注册接口。"""
    # 1. 用户名唯一性校验
    if await get_user_by_username(db, req.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已被占用",
        )

    # 2. 邮箱唯一性校验
    if await get_user_by_email(db, req.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="邮箱已被注册",
        )

    # 3. 密码强度校验（Pydantic 只校验了长度，这里做更细致检查）
    check = check_password_strength(req.password, req.username)
    if not check.valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "密码强度不足", "errors": check.errors},
        )

    # 4. 哈希密码（千万不要存明文！）
    password_hash = hash_password(req.password)

    # 5. 写入数据库
    user = User(
        username=req.username,
        email=req.email,
        password_hash=password_hash,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 6. 返回用户信息（不含密码）
    return UserResponse(id=user.id, username=user.username, email=user.email)
\`\`\`

注意几个安全细节：唯一性校验要在数据库层面加唯一索引做兜底（防止并发注册绕过应用层检查）；返回时绝不包含 \`password_hash\`；错误信息不要透露"该用户名存在"还是"该邮箱存在"以外的细节，避免被用于枚举探测。

### 6.2 注册流程时序

注册接口内部的处理顺序很重要：

1. **入参校验**（Pydantic 自动完成：长度、格式）
2. **唯一性校验**（用户名、邮箱是否已存在）
3. **密码强度校验**（大小写、数字、特殊字符、黑名单）
4. **密码哈希**（bcrypt）
5. **持久化**（写入数据库）
6. **返回**（脱敏后的用户信息）

把强度校验放在唯一性校验之后，可以避免对弱密码也查库；但也有团队为了不暴露"用户名是否存在"，会把强度校验放最前面。两种顺序各有取舍。

## 七、安全注意事项

| 风险点 | 正确做法 | 错误做法 |
|-------|---------|---------|
| 密码存储 | bcrypt/argon2 哈希 | 明文、MD5 |
| 日志记录 | 永不记录密码 | print(password) |
| 错误提示 | 模糊提示"凭据错误" | "用户名不存在" |
| 传输 | 全站 HTTPS | HTTP 明文 |
| 密码修改 | 校验旧密码 | 直接覆盖 |
| 限流 | 注册接口限流 | 无限制 |

此外，密钥、数据库连接串等敏感配置应从环境变量或密钥管理服务读取，绝不能硬编码或提交到代码仓库。\`.env\` 文件要加入 \`.gitignore\`。

## 八、小结

本章从密码泄露的危害出发，讲解了密码存储从明文到加盐哈希的演进，对比了主流哈希算法，并用 passlib 实现了 bcrypt 哈希与验证。随后实现了密码强度校验器，最后组合出一个完整的用户注册 API。下一章我们将基于这些基础，实现 JWT 登录认证。`
  },
  {
    id: "pyweb-jwt",
    group: "认证与安全",
    icon: "🎫",
    title: "JWT 认证详解",
    content: `# JWT 认证详解

## 一、认证与授权

在进入 JWT 之前，先厘清两个常被混淆的概念。

- **认证（Authentication，简称 AuthN）**：回答"你是谁"。通过用户名密码、短信验证码、指纹等方式确认用户身份。博客系统中"登录"就是认证。
- **授权（Authorization，简称 AuthZ）**：回答"你能做什么"。在确认身份之后，判断该用户是否有权限执行某操作。博客系统中"普通用户不能删除他人文章"就是授权。

认证是授权的前提：先知道你是谁，才能判断你能做什么。本章聚焦认证（如何用 JWT 证明身份），授权留到下一章 RBAC 详讲。

## 二、Session 与 Token 两种方案

Web 认证主要有两种方案：基于 Session 和基于 Token。理解它们的差异是理解 JWT 价值的前提。

### 2.1 Session 方案

服务器在内存或 Redis 中保存每个登录用户的会话状态，把会话 ID 通过 Cookie 返回给浏览器。后续请求浏览器自动带上 Cookie，服务器凭会话 ID 找到对应用户。

\`\`\`
登录请求 -> 服务器验证密码 -> 创建 Session(id=abc123) 存入 Redis
        <- 返回 Set-Cookie: session_id=abc123

后续请求 -> Cookie: session_id=abc123 -> 服务器查 Redis 找到用户
\`\`\`

### 2.2 Token 方案

服务器不保存会话状态，登录成功后签发一个自包含的 Token（内含用户信息），客户端保存 Token 并在每次请求时携带。服务器只需验证 Token 签名即可确认身份。

\`\`\`
登录请求 -> 服务器验证密码 -> 用密钥签名生成 Token
        <- 返回 { "access_token": "xxx.yyy.zzz" }

后续请求 -> Authorization: Bearer xxx.yyy.zzz -> 服务器验签得到用户
\`\`\`

### 2.3 两种方案对比

| 维度 | Session | Token(JWT) |
|-----|---------|-----------|
| 状态存储 | 服务器存 | 客户端存（无状态）|
| 扩展性 | 需共享 Session（如 Redis）| 天然支持分布式 |
| 注销 | 删除 Session 即可 | 难（Token 未过期前一直有效）|
| 续期 | 滑动过期容易 | 需刷新机制 |
| 安全性 | Cookie 易受 CSRF | 需防 XSS 偷 Token |
| 跨域 | 麻烦（Cookie 跨域限制）| 友好（Header 携带）|
| 适用场景 | 传统 Web 应用 | API、移动端、单页应用 |

JWT 的核心优势是"无状态"：服务器不需要查 Session 存储，这让水平扩展变得简单。代价是注销和续期更麻烦。对于博客系统这种前后端分离的 API，JWT 是主流选择。

## 三、JWT 的结构

JWT（JSON Web Token）由三段用点 \`.\` 连接的字符串组成：\`Header.Payload.Signature\`。

### 3.1 Header（头部）

描述 Token 的类型和签名算法：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

\`alg\` 指定签名算法，常见有 HS256（HMAC + SHA-256，对称密钥）和 RS256（RSA + SHA-256，非对称）。小型项目用 HS256 即可，微服务间验签可用 RS256。

### 3.2 Payload（负载）

存放声明（Claims），即用户信息和元数据。注意 Payload 只是 Base64 编码，**不是加密**，任何人都能解码看到内容，所以绝不能放密码等敏感信息。

\`\`\`json
{
  "sub": "user:42",
  "username": "alice",
  "role": "editor",
  "exp": 1735689600,
  "iat": 1719792000
}
\`\`\`

常用标准声明：

| 字段 | 含义 | 说明 |
|-----|------|------|
| sub | subject | 主体，通常是用户 ID |
| iat | issued at | 签发时间 |
| exp | expiration | 过期时间 |
| nbf | not before | 在此之前无效 |
| iss | issuer | 签发者 |
| aud | audience | 接收方 |

也可以加自定义声明，如 \`role\`、\`username\`。

### 3.3 Signature（签名）

用密钥对 \`base64(header).base64(payload)\` 做签名，确保 Token 未被篡改：

\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

服务器收到 Token 后重新计算签名，与 Token 中的签名比对，不一致则说明被篡改。**密钥是 JWT 安全的核心**，泄露密钥等于全部 Token 可被伪造。

### 3.4 JWT 的优缺点

| 优点 | 缺点 |
|-----|------|
| 无状态，易扩展 | 无法主动失效（未过期前一直有效）|
| 自包含，减少查库 | Payload 不加密，不能放敏感数据 |
| 跨语言、跨平台 | 续期需刷新机制 |
| 移动端友好 | Token 较长，增加请求体积 |

## 四、python-jose 生成与验证

\`python-jose\` 是 Python 中处理 JWT 的主流库，支持多种算法。

### 4.1 安装

\`\`\`bash
pip install "python-jose[cryptography]"
\`\`\`

### 4.2 生成与验证 Token

\`\`\`python filename="jwt_utils.py"
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

# 密钥：必须足够长且随机，从环境变量读取，绝不硬编码
SECRET_KEY = "change-me-to-a-long-random-string-from-env"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30   # access token 30 分钟过期

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """生成 access token。data 通常是 {"sub": user_id, ...}。"""
    to_encode = data.copy()
    # 设置过期时间
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    # 编码为 JWT 字符串
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict | None:
    """解码并验证 token，返回 payload；失败返回 None。"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # 签名错误、过期、格式错误都会抛异常
        return None


# 演示
if __name__ == "__main__":
    token = create_access_token({"sub": "user:42", "username": "alice"})
    print(f"生成的 token: {token}")
    print(f"token 段数: {len(token.split('.'))}")   # 应为 3

    payload = decode_token(token)
    print(f"解码结果: {payload}")

    # 篡改后的 token 验证失败
    tampered = token[:-5] + "xxxxx"
    print(f"篡改 token 验证: {decode_token(tampered)}")  # None
\`\`\`

> **密钥管理**：SECRET_KEY 至少 32 字符随机字符串，生产环境用 \`openssl rand -hex 32\` 生成，存到环境变量或密钥管理服务，轮换时所有 Token 失效。

## 五、OAuth2PasswordBearer 与登录流程

FastAPI 提供了 \`OAuth2PasswordBearer\`，它实现了 OAuth2 密码模式的客户端流程，自动生成 Swagger UI 的登录按钮，并从 \`Authorization: Bearer <token>\` 头提取 Token。

### 5.1 配置 OAuth2

\`\`\`python filename="oauth_config.py"
from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()

# tokenUrl 指向登录接口路径，用于 Swagger UI 跳转登录
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 模拟用户数据库
fake_users_db = {
    "alice": {
        "id": 1,
        "username": "alice",
        "hashed_password": "$2b$12$xxxx",   # 实际从 bcrypt 得到
        "role": "editor",
    }
}
\`\`\`

### 5.2 登录接口

登录接口使用 \`OAuth2PasswordRequestForm\` 作为入参，它从表单字段 \`username\` 和 \`password\` 读取数据（OAuth2 规范要求表单提交，不是 JSON）。

\`\`\`python filename="login.py"
from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    """登录接口：校验密码并签发 token。"""
    # 1. 查用户
    user = fake_users_db.get(form.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",   # 不要说"用户不存在"
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. 校验密码
    if not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. 签发 token
    access_token = create_access_token(
        data={"sub": str(user["id"]), "username": user["username"], "role": user["role"]}
    )

    # 4. 返回 OAuth2 标准格式
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
\`\`\`

注意 \`OAuth2PasswordRequestForm\` 用 \`Depends()\` 注入而非请求体，因为它从 \`application/x-www-form-urlencoded\` 表单读取。返回格式必须包含 \`access_token\` 和 \`token_type\`，这样 Swagger UI 才能正确处理。

## 六、获取当前用户依赖

定义一个依赖，从请求中提取 Token、验证、查库得到当前用户。这是后续所有受保护路由的基础。

\`\`\`python filename="current_user.py"
from typing import Annotated
from fastapi import Depends, HTTPException, status

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    """从 token 解析当前用户。受保护路由通过 Depends 使用。"""
    # 1. 解码 token
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 无效或已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. 取出用户标识
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 缺少用户信息",
        )

    # 3. 查数据库（实际项目用 user_id 查 User 表）
    user = find_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )
    return user

# 用 Annotated 定义可复用的依赖类型
CurrentUser = Annotated[dict, Depends(get_current_user)]

@router.get("/me")
async def read_current_user(current: CurrentUser):
    """受保护路由：返回当前登录用户信息。"""
    return {
        "id": current["id"],
        "username": current["username"],
        "role": current["role"],
    }

@router.get("/articles/drafts")
async def list_my_drafts(current: CurrentUser):
    """受保护路由：列出我的草稿文章。"""
    return {"drafts": [], "owner": current["username"]}
\`\`\`

\`Annotated[dict, Depends(get_current_user)]\` 是 FastAPI 推荐写法，把依赖和类型绑定成一个别名 \`CurrentUser\`，路由函数只需声明 \`current: CurrentUser\` 即可注入，简洁且可复用。

## 七、Token 刷新机制

Access Token 过期时间短（如 30 分钟）以降低泄露风险，但频繁登录体验差。常见做法是引入 Refresh Token：长期有效（如 7 天），仅用于换取新的 Access Token，不直接访问业务接口。

### 7.1 双 Token 流程

\`\`\`
登录 -> 返回 access_token(30min) + refresh_token(7d)

访问接口 -> 用 access_token

access_token 过期 -> 用 refresh_token 调 /auth/refresh -> 返回新 access_token

refresh_token 过期 -> 必须重新登录
\`\`\`

### 7.2 刷新接口实现

\`\`\`python filename="refresh.py"
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_refresh_token(data: dict) -> str:
    """生成 refresh token，过期时间较长。"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/refresh")
async def refresh_token(refresh: str = Depends(oauth2_scheme)):
    """用 refresh token 换取新的 access token。"""
    payload = decode_token(refresh)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token 无效",
        )
    # 签发新的 access token（不带 type=refresh）
    new_access = create_access_token(
        data={"sub": payload["sub"], "username": payload.get("username", "")}
    )
    return {"access_token": new_access, "token_type": "bearer"}
\`\`\`

> **Refresh Token 安全**：Refresh Token 有效期长，泄露危害更大。建议存于 HttpOnly Cookie（防 JS 读取），并在服务端维护一个白名单或黑名单，用户登出/改密时使其失效。这是 JWT 无状态性与可控注销之间的常见折中。

## 八、安全注意事项

| 风险 | 防御 |
|-----|------|
| Token 被偷（XSS）| HttpOnly Cookie 存储、CSP 防注入 |
| Token 被重放 | 短过期时间 + HTTPS |
| 密钥泄露 | 环境变量管理、定期轮换 |
| Payload 泄密 | 不放敏感信息，必要时用 JWE 加密 |
| 暴力破解登录 | 登录接口限流、失败次数锁定 |
| alg=none 攻击 | 验签时显式指定 algorithms 参数 |

特别强调 \`jwt.decode\` 必须传 \`algorithms=[ALGORITHM]\`，不能让 Token 自己声明算法，否则可能遭遇 \`alg: none\` 攻击（攻击者伪造无签名 Token）。

## 九、小结

本章讲解了认证与授权的区别，对比了 Session 与 Token 两种方案，剖析了 JWT 的三段结构，用 python-jose 实现了 Token 生成与验证，并基于 OAuth2PasswordBearer 构建了登录、获取当前用户、Token 刷新的完整流程。下一章我们将在此基础上加入角色与权限控制。`
  },
  {
    id: "pyweb-rbac",
    group: "认证与安全",
    icon: "👥",
    title: "权限与角色控制（RBAC）",
    content: `# 权限与角色控制（RBAC）

## 一、为什么需要权限控制

上一章我们实现了认证（知道你是谁），但博客系统中不同用户能做的事大不相同：普通用户只能写自己的文章；编辑可以审核任何文章；管理员可以管理用户和删除任何内容。如果只有认证没有授权，任何登录用户都能删除别人的文章，系统立刻乱套。

授权的核心问题是："这个用户能不能做这件事"。RBAC（Role-Based Access Control，基于角色的访问控制）是业界最常用的授权模型，它通过"用户—角色—权限"三层结构管理访问控制，把权限授予角色而非直接授予用户，大幅简化管理。

## 二、RBAC 模型

### 2.1 三层结构

\`\`\`
用户(User) --属于--> 角色(Role) --拥有--> 权限(Permission)

alice  --属于--> editor --拥有--> article:publish, article:edit:any
bob    --属于--> admin   --拥有--> *, user:manage
carol  --属于--> user    --拥有--> article:write, article:edit:own
\`\`\`

- **用户**：真实的人，如 alice、bob。
- **角色**：权限的集合，如 editor、admin。一个用户可拥有多个角色。
- **权限**：对某资源执行某操作的能力，如 \`article:delete:any\`。

### 2.2 RBAC 的优势

| 对比项 | 直接给用户授权 | RBAC 角色授权 |
|-------|-------------|-------------|
| 用户数量多 | 每人单独配置，难维护 | 按角色批量管理 |
| 权限变更 | 逐个用户修改 | 改角色即可 |
| 审计 | 难以看出谁有什么权限 | 角色一目了然 |
| 扩展 | 加权限要改所有人 | 加到角色即可 |

### 2.3 RBAC0 / RBAC1 / RBAC2 / RBAC3

- **RBAC0**：基础模型，用户—角色—权限。
- **RBAC1**：引入角色继承，如 \`admin\` 继承 \`editor\` 的全部权限。
- **RBAC2**：引入约束，如互斥角色（不能同时是会计和出纳）、角色数量上限。
- **RBAC3**：RBAC1 + RBAC2，最完整。

博客系统规模不大，用 RBAC0 加少量继承即可满足需求。

## 三、角色定义

博客系统定义四个角色，权限逐级递增：

\`\`\`python filename="roles.py"
from enum import Enum

class Role(str, Enum):
    """博客系统角色枚举。继承 str 便于序列化和比较。"""
    READER = "reader"     # 读者：浏览、评论
    AUTHOR = "author"     # 作者：读写自己的文章
    EDITOR = "editor"     # 编辑：审核任何文章
    ADMIN = "admin"       # 管理员：全部权限，含用户管理

# 角色继承关系：高阶角色自动拥有低阶角色的权限
ROLE_HIERARCHY: dict[Role, list[Role]] = {
    Role.READER: [],
    Role.AUTHOR: [Role.READER],
    Role.EDITOR: [Role.AUTHOR, Role.READER],
    Role.ADMIN: [Role.EDITOR, Role.AUTHOR, Role.READER],
}

# 每个角色直接拥有的权限
ROLE_PERMISSIONS: dict[Role, set[str]] = {
    Role.READER: {"article:read", "comment:write"},
    Role.AUTHOR: {"article:write", "article:edit:own", "article:delete:own"},
    Role.EDITOR: {"article:edit:any", "article:publish", "article:unpublish"},
    Role.ADMIN:  {"user:manage", "article:delete:any", "*"},
}

def get_all_permissions(role: Role) -> set[str]:
    """获取角色及其继承角色的全部权限。"""
    perms = set(ROLE_PERMISSIONS[role])
    for parent in ROLE_HIERARCHY.get(role, []):
        perms |= get_all_permissions(parent)
    return perms

def has_permission(role: Role, permission: str) -> bool:
    """判断角色是否拥有某权限，支持通配符 *。"""
    perms = get_all_permissions(role)
    return "*" in perms or permission in perms
\`\`\`

权限命名采用 \`资源:操作[:范围]\` 格式，如 \`article:edit:own\` 表示"编辑自己的文章"，\`article:edit:any\` 表示"编辑任何文章"。这种命名便于扩展和审计。

## 四、权限粒度

权限控制可以在三个粒度上实施：

| 粒度 | 说明 | 示例 |
|-----|------|------|
| 路由级 | 整个接口只允许某些角色访问 | /admin/users 仅 admin |
| 资源级 | 能否操作某个具体资源 | 只能删除自己的文章 |
| 字段级 | 同一资源不同字段可见性不同 | 普通用户看不到文章的内部状态 |

路由级最简单，用依赖声明所需角色即可；资源级需要在业务逻辑里校验资源归属；字段级最细，通常在序列化时根据角色过滤字段。博客系统主要用前两种。

## 五、角色检查依赖

基于上一章的 \`get_current_user\`，封装角色检查依赖。FastAPI 的依赖可以嵌套，角色检查依赖内部再依赖 \`CurrentUser\`。

\`\`\`python filename="role_deps.py"
from typing import Annotated
from fastapi import Depends, HTTPException, status

CurrentUser = Annotated[dict, Depends(get_current_user)]   # 上一章定义

def require_role(*allowed_roles: Role):
    """工厂函数：生成一个要求指定角色的依赖。"""
    async def role_checker(current: CurrentUser) -> dict:
        user_role = Role(current["role"])
        # 检查用户角色是否在允许列表中
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"需要 {allowed_roles} 之一的角色",
            )
        return current
    return role_checker

# 预定义常用依赖
RequireEditor = Annotated[dict, Depends(require_role(Role.EDITOR, Role.ADMIN))]
RequireAdmin = Annotated[dict, Depends(require_role(Role.ADMIN))]

@router.post("/admin/users/{user_id}/ban")
async def ban_user(user_id: int, admin: RequireAdmin):
    """管理员专属：封禁用户。"""
    return {"banned": user_id, "by": admin["username"]}

@router.post("/articles/{article_id}/publish")
async def publish_article(article_id: int, editor: RequireEditor):
    """编辑及以上：发布文章。"""
    return {"published": article_id}
\`\`\`

\`require_role\` 是一个依赖工厂，调用它返回真正的依赖函数。这样可以把所需角色作为参数传入，复用同一段校验逻辑。注意返回 403 而非 401：401 表示"未认证"，403 表示"已认证但无权限"。

## 六、资源所有权校验

路由级权限只能控制"谁能调这个接口"，但"作者只能改自己的文章"这种需求必须校验资源归属。下面是文章更新接口的所有权校验：

\`\`\`python filename="ownership.py"
async def get_article_or_404(db: AsyncSession, article_id: int):
    """根据 id 查文章，不存在则 404。"""
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return article

@router.put("/articles/{article_id}")
async def update_article(
    article_id: int,
    payload: ArticleUpdate,
    current: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """更新文章：作者只能改自己的，编辑可改任何人的。"""
    article = await get_article_or_404(db, article_id)

    # 所有权校验：不是作者且没有 article:edit:any 权限则拒绝
    is_owner = article.author_id == current["id"]
    can_edit_any = has_permission(Role(current["role"]), "article:edit:any")
    if not (is_owner or can_edit_any):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能修改自己的文章",
        )

    # 执行更新
    article.title = payload.title
    article.content = payload.content
    await db.commit()
    return {"id": article.id, "title": article.title}
\`\`\`

所有权校验的关键是"先取资源，再判归属"。注意 404 和 403 的顺序：对不存在资源的请求，如果先返回 403 会泄露"资源存在"这一信息，所以通常先确认资源是否存在（404），再做权限判断（403）。但对敏感资源，也有团队选择统一返回 404 以彻底隐藏存在性。

## 七、权限装饰器（依赖化）

Python 里常用装饰器做权限检查，但 FastAPI 推荐用依赖而非装饰器，因为依赖能被 OpenAPI 文档识别，自动在 Swagger UI 标注接口所需认证。不过对于跨路由的通用检查，可以用依赖工厂模式模拟装饰器效果：

\`\`\`python filename="permission_deps.py"
def require_permission(permission: str):
    """要求当前用户具有指定权限的依赖。"""
    async def checker(current: CurrentUser) -> dict:
        role = Role(current["role"])
        if not has_permission(role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"缺少权限: {permission}",
            )
        return current
    return checker

@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    current: Annotated[dict, Depends(require_permission("article:delete:own"))],
    db: AsyncSession = Depends(get_db),
):
    """删除文章：作者可删自己的（article:delete:own）。"""
    article = await get_article_or_404(db, article_id)
    if article.author_id != current["id"]:
        # 普通作者删别人的文章，需要 article:delete:any
        if not has_permission(Role(current["role"]), "article:delete:any"):
            raise HTTPException(403, "只能删除自己的文章")
    await db.delete(article)
    await db.commit()
    return {"deleted": article_id}
\`\`\`

这种"依赖工厂 + 业务内补充校验"的组合，既能复用通用检查，又能处理资源归属这类需要运行时数据的逻辑。

## 八、字段级权限

同一篇文章对不同角色返回不同字段。比如 \`internal_note\` 只有编辑可见，\`view_count\` 只有作者和管理员可见：

\`\`\`python filename="field_perms.py"
class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    view_count: int | None = None
    internal_note: str | None = None

def serialize_article(article, current_user: dict) -> ArticleResponse:
    """根据当前用户角色过滤字段。"""
    role = Role(current_user["role"])
    data = {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "author_id": article.author_id,
    }
    # 作者本人或管理员可看阅读量
    if article.author_id == current_user["id"] or has_permission(role, "*"):
        data["view_count"] = article.view_count
    # 编辑及以上可看内部备注
    if has_permission(role, "article:edit:any"):
        data["internal_note"] = article.internal_note
    return ArticleResponse(**data)

@router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, current: CurrentUser, db = Depends(get_db)):
    article = await get_article_or_404(db, article_id)
    return serialize_article(article, current)
\`\`\`

字段级权限实现复杂、容易遗漏，建议在序列化层统一处理，并辅以自动化测试覆盖每个角色的可见字段。

## 九、安全注意事项

| 风险 | 防御 |
|-----|------|
| 越权访问（IDOR）| 所有资源操作都校验所有权 |
| 角色篡改 | 角色字段不能由用户自行修改 |
| 权限提升 | 管理员分配要审计、二次确认 |
| 前端隐藏≠安全 | 后端必须独立校验，前端控制只是体验优化 |
| 默认拒绝 | 新接口默认无权限，显式声明所需角色 |

特别强调"前端隐藏不等于安全"：前端把按钮藏起来只是体验优化，攻击者可以直接构造请求。所有权限校验必须在后端，且每个接口都要校验，不能假设"前端不会调到"。

## 十、小结

本章从授权的需求出发，介绍了 RBAC 的三层模型与角色继承，定义了博客系统的四个角色及其权限，实现了角色检查依赖、资源所有权校验、权限依赖工厂和字段级权限控制。结合上一章的认证，博客系统已具备完整的访问控制能力。下一章我们转向全局层面的安全防护：中间件。`
  },
  {
    id: "pyweb-middleware",
    group: "认证与安全",
    icon: "🛡️",
    title: "中间件与安全防护",
    content: `# 中间件与安全防护

## 一、中间件是什么

中间件（Middleware）是位于请求和路由处理之间的一层处理逻辑。每个请求进入应用后会依次穿过所有中间件，到达路由函数处理后，响应再按相反顺序穿过中间件返回。中间件适合做与具体业务无关的横切关注点：日志、限流、CORS、安全头、压缩等。

\`\`\`
请求 -> [日志中间件] -> [限流中间件] -> [CORS中间件] -> 路由处理
响应 <- [日志中间件] <- [限流中间件] <- [CORS中间件] <- 路由处理
\`\`\`

理解中间件的关键是"洋葱模型"：请求像穿过洋葱一层层进入，响应像反向穿出。每个中间件可以在请求前、响应后各做处理。

## 二、FastAPI 中间件写法

FastAPI 基于 Starlette，中间件用 \`@app.middleware("http")\` 装饰器定义，或用 \`app.add_middleware\` 添加类中间件。

### 2.1 函数式中间件

\`\`\`python filename="middleware_basic.py"
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    """记录每个请求耗时的中间件。"""
    start = time.perf_counter()
    # call_next 把请求交给下一层（其他中间件或路由）
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    # 在响应头里加入耗时
    response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"
    return response
\`\`\`

\`call_next(request)\` 是核心：它把请求传递给后续处理链，返回最终的响应。在它之前是"请求阶段"的处理，之后是"响应阶段"的处理。

### 2.2 类式中间件

更复杂的中间件可以写成类，继承 \`BaseHTTPMiddleware\`：

\`\`\`python filename="class_middleware.py"
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIDMiddleware(BaseHTTPMiddleware):
    """为每个请求生成唯一 ID，便于日志追踪。"""
    async def dispatch(self, request, call_next):
        request_id = request.headers.get("X-Request-ID") or uuid4().hex
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# 注册
app.add_middleware(RequestIDMiddleware)
\`\`\`

## 三、CORS 跨域配置

浏览器同源策略会阻止前端从一个域名访问另一个域名的 API。CORS（跨域资源共享）是标准解决方案。前后端分离的博客系统几乎必须配置 CORS。

### 3.1 同源与跨域

同源指协议、域名、端口都相同。\`https://blog.example.com\` 调用 \`https://api.example.com\` 就是跨域（域名不同），浏览器会拦截响应，除非 API 返回正确的 CORS 头。

### 3.2 CORS 配置

\`\`\`python filename="cors.py"
from fastapi.middleware.cors import CORSMiddleware

# 允许跨域的前端域名，生产环境不要用 ["*"]
ALLOWED_ORIGINS = [
    "https://blog.example.com",
    "https://admin.blog.example.com",
    "http://localhost:3000",   # 本地开发
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,    # 允许的源
    allow_credentials=True,           # 允许携带 Cookie
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    max_age=600,                      # 预检结果缓存 10 分钟
)
\`\`\`

CORS 配置项说明：

| 配置 | 作用 | 注意 |
|-----|------|------|
| allow_origins | 允许的源 | 生产环境不要用 * |
| allow_credentials | 是否允许带 Cookie | 与 * 互斥 |
| allow_methods | 允许的 HTTP 方法 | 一般列出实际用到的 |
| allow_headers | 允许的请求头 | 含自定义头 |
| max_age | 预检缓存时间 | 减少预检请求 |

> **安全提示**：\`allow_origins=["*"]\` 配合 \`allow_credentials=True\` 是常见错误组合，浏览器会拒绝。生产环境应明确列出前端域名，避免任意源携带凭据访问。

## 四、安全响应头

通过设置一系列 HTTP 响应头，可以防御 XSS、点击劫持、MIME 嗅探等常见攻击。下面是一个安全头中间件：

\`\`\`python filename="security_headers.py"
@app.middleware("http")
async def security_headers(request: Request, call_next):
    """添加安全相关的响应头。"""
    response = await call_next(request)
    # 阻止 MIME 嗅探：浏览器按 Content-Type 解析，不猜测
    response.headers["X-Content-Type-Options"] = "nosniff"
    # 禁止被 iframe 嵌套，防点击劫持
    response.headers["X-Frame-Options"] = "DENY"
    # XSS 保护（现代浏览器已内置，但仍建议设置）
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # HTTPS 严格传输：一年内强制 HTTPS
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    # 内容安全策略：限制脚本/样式来源
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "object-src 'none'"
    )
    # 控制引用信息，防止泄露 URL 到外部
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
\`\`\`

各安全头作用对比：

| 头部 | 防御目标 | 取值示例 |
|-----|---------|---------|
| X-Content-Type-Options | MIME 嗅探 | nosniff |
| X-Frame-Options | 点击劫持 | DENY / SAMEORIGIN |
| Strict-Transport-Security | 协议降级 | max-age=31536000 |
| Content-Security-Policy | XSS、数据注入 | default-src 'self' |
| Referrer-Policy | 引用信息泄露 | strict-origin-when-cross-origin |

CSP 是最强大的防御，但配置不当会误伤功能。建议先从宽松策略开始，用浏览器 CSP 报告接口观察违规，逐步收紧。

## 五、HTTPS 重定向

生产环境必须全站 HTTPS。除了在反向代理层做重定向，也可以在应用层兜底：

\`\`\`python filename="https_redirect.py"
@app.middleware("http")
async def https_redirect(request: Request, call_next):
    """把 HTTP 请求重定向到 HTTPS。"""
    # 判断是否 HTTPS：看 X-Forwarded-Proto（反向代理场景）
    proto = request.headers.get("x-forwarded-proto", "https")
    if proto == "http":
        # 构造 HTTPS URL 并 301 永久重定向
        url = request.url.replace(scheme="https")
        return RedirectResponse(url, status_code=301)
    return await call_next(request)
\`\`\`

注意：在反向代理（Nginx）后面时，应用收到的连接是 HTTP（代理到应用的回源是 HTTP），需要信任 \`X-Forwarded-Proto\` 头。要确保只有可信代理能设置该头，否则可被伪造绕过 HTTPS。最稳妥的做法是在 Nginx 层做 HTTPS 重定向，应用层只做兜底。

## 六、限流

限流（Rate Limiting）防止接口被刷爆，是防暴力破解、爬虫、CC 攻击的基础手段。博客系统的登录、注册接口尤其需要限流。

### 6.1 用 slowapi 实现限流

\`\`\`bash
pip install slowapi
\`\`\`

\`\`\`python filename="rate_limit.py"
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# 基于客户端 IP 做限流
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# 异常处理器：限流时返回 429
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "请求过于频繁，请稍后再试"},
        headers={"Retry-After": str(exc.detail.retry_after)},
    )

# 登录接口：每个 IP 每分钟最多 5 次，防暴力破解
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    # 注意：用 slowapi 时函数第一个参数必须是 request
    ...
\`\`\`

限流策略示例：

| 接口 | 限流 | 原因 |
|-----|------|------|
| /auth/login | 5/分钟/IP | 防暴力破解 |
| /auth/register | 3/小时/IP | 防批量注册 |
| /articles GET | 60/分钟/IP | 防爬虫 |
| /articles POST | 10/分钟/用户 | 防刷帖 |

> **限流维度**：基于 IP 简单但可能误伤 NAT 后的多用户；基于用户 ID 更准但未登录接口无法用。生产环境常组合使用，并配合 Redis 做分布式计数。

## 七、请求日志中间件

记录每个请求的方法、路径、状态码、耗时，是排查问题和监控的基础。

\`\`\`python filename="request_log.py"
import logging
logger = logging.getLogger("app.request")

@app.middleware("http")
async def request_logging(request: Request, call_next):
    """记录请求日志的中间件。"""
    start = time.perf_counter()
    response = await call_next(request)
    duration = (time.perf_counter() - start) * 1000

    # 跳过健康检查等噪声路径
    if request.url.path.startswith("/health"):
        return response

    logger.info(
        "%s %s -> %d %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    return response
\`\`\`

日志中间件要注意：不要记录请求体中的敏感信息（密码、Token）；对静态资源请求可降级为 DEBUG 级别避免日志爆炸；慢请求（如超过 1 秒）应升级为 WARNING 便于发现性能问题。

## 八、GZip 压缩

对大响应体做 GZip 压缩，可显著减少传输体积，加快首屏速度。FastAPI 内置 GZip 中间件：

\`\`\`python filename="gzip.py"
from fastapi.middleware.gzip import GZipMiddleware

# minimum_size=1000 表示响应体超过 1000 字节才压缩
# 太小的响应压缩后反而更大
app.add_middleware(GZipMiddleware, minimum_size=1000)
\`\`\`

注意 GZip 压缩会消耗 CPU，且与 BREACH 攻击相关（攻击者可通过压缩大小推测加密内容）。对含敏感信息的响应可禁用压缩，或加入随机填充。

## 九、中间件顺序

中间件按添加顺序的"逆序"处理请求：后添加的中间件最先收到请求，最后收到响应。注册顺序很重要：

\`\`\`python
# 推荐顺序（后添加的先执行请求阶段）
app.add_middleware(GZipMiddleware)              # 最内层，压缩响应
app.add_middleware(SlowAPIMiddleware)           # 限流，尽早拦截
app.add_middleware(CORSMiddleware)              # CORS，预检要早处理
app.add_middleware(RequestIDMiddleware)         # 请求 ID，最外层
\`\`\`

一般原则：限流、CORS 等需要尽早拦截的放外层（后添加）；日志、压缩等处理响应的放内层（先添加）。具体顺序需结合应用特点调试。

## 十、安全注意事项

| 风险 | 防御 |
|-----|------|
| 跨域任意源 | CORS 显式列出域名 |
| XSS | CSP 头、输入转义 |
| 点击劫持 | X-Frame-Options |
| 协议降级 | HSTS、HTTPS 重定向 |
| 暴力破解 | 登录限流 |
| 敏感信息泄露 | 日志不记录密码/Token |
| 中间件顺序错误 | 限流要在业务前执行 |

中间件是全局生效的，配置错误会影响所有接口，上线前务必在测试环境验证，特别是 CSP 和 CORS。

## 十一、小结

本章讲解了中间件的洋葱模型与 FastAPI 两种写法，配置了 CORS、安全头、HTTPS 重定向、限流、请求日志、GZip 压缩等常用中间件，并讨论了中间件顺序的最佳实践。这些防护组合起来，构成博客系统的安全基座。下一章我们处理一个常被忽视但同样重要的话题：错误处理与日志。`
  },
  {
    id: "pyweb-error",
    group: "认证与安全",
    icon: "🚨",
    title: "错误处理与日志",
    content: `# 错误处理与日志

## 一、为什么错误处理很重要

API 在运行中会遇到各种异常：用户传了非法参数、数据库连接断了、第三方服务超时、代码 bug。如果这些异常直接抛给客户端，轻则返回 500 错误让用户摸不着头脑，重则泄露堆栈信息给攻击者暴露实现细节。良好的错误处理能让 API 返回一致、可读、安全的错误响应，配合日志记录帮助开发者快速定位问题。

博客系统中典型场景：用户提交的文章标题超长、查询的文章不存在、数据库写入时唯一约束冲突、Token 过期。每种情况都应返回合适的 HTTP 状态码和清晰的错误信息。

## 二、HTTPException

FastAPI 内置 \`HTTPException\` 用于主动抛出 HTTP 错误响应。抛出后 FastAPI 自动把它转成对应状态码的 JSON 响应。

\`\`\`python filename="http_exception.py"
from fastapi import HTTPException, status

@router.get("/articles/{article_id}")
async def get_article(article_id: int):
    article = find_article(article_id)
    if article is None:
        # 抛出 404，detail 会作为响应体返回
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文章不存在",
        )
    return article

@router.post("/articles")
async def create_article(payload: ArticleCreate, current: CurrentUser):
    if len(payload.title) > 200:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="标题不能超过 200 字",
        )
    ...
\`\`\`

\`status\` 模块提供了语义化的状态码常量，比直接写数字更易读：\`HTTP_404_NOT_FOUND\` 比 \`404\` 更清晰。常用状态码：

| 状态码 | 常量 | 含义 |
|-------|------|------|
| 400 | HTTP_400_BAD_REQUEST | 请求参数错误 |
| 401 | HTTP_401_UNAUTHORIZED | 未认证 |
| 403 | HTTP_403_FORBIDDEN | 无权限 |
| 404 | HTTP_404_NOT_FOUND | 资源不存在 |
| 409 | HTTP_409_CONFLICT | 冲突（如重复注册）|
| 422 | HTTP_422_UNPROCESSABLE_ENTITY | 校验失败 |
| 429 | HTTP_429_TOO_MANY_REQUESTS | 限流 |
| 500 | HTTP_500_INTERNAL_SERVER_ERROR | 服务器错误 |

## 三、自定义业务异常

\`HTTPException\` 适合简单场景，但业务异常用自定义类表达更清晰，也便于在异常处理器里统一处理。

\`\`\`python filename="business_exceptions.py"
class AppException(Exception):
    """所有业务异常的基类。"""
    status_code: int = 500
    error_code: str = "internal_error"
    message: str = "服务器内部错误"

    def __init__(self, message: str | None = None, **extra):
        self.message = message or self.message
        self.extra = extra
        super().__init__(self.message)

class NotFoundException(AppException):
    status_code = 404
    error_code = "not_found"
    message = "资源不存在"

class ConflictException(AppException):
    status_code = 409
    error_code = "conflict"
    message = "资源冲突"

class ForbiddenException(AppException):
    status_code = 403
    error_code = "forbidden"
    message = "无权访问"

class ValidationException(AppException):
    status_code = 422
    error_code = "validation_error"
    message = "参数校验失败"

# 使用：业务代码抛出语义化异常
async def get_article(article_id: int):
    article = find_article(article_id)
    if article is None:
        raise NotFoundException(f"文章 {article_id} 不存在")
    return article
\`\`\`

自定义异常带 \`error_code\` 字段，前端可以据此做不同处理（如弹出对应提示），比依赖 HTTP 状态码更精细。错误码是稳定的契约，一旦发布就不应变更。

## 四、异常处理器

用 \`@app.exception_handler\` 注册处理器，把自定义异常转成 HTTP 响应。这是统一错误格式的关键。

\`\`\`python filename="exception_handlers.py"
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """处理所有业务异常，返回统一格式。"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.extra or None,
            },
            "request_id": getattr(request.state, "request_id", None),
        },
    )

@router.get("/articles/{article_id}")
async def get_article(article_id: int):
    # 抛出 NotFoundException 会被上面的处理器捕获
    article = find_article(article_id)
    if article is None:
        raise NotFoundException(f"文章 {article_id} 不存在")
    return article
\`\`\`

统一错误响应格式示例：

\`\`\`json
{
  "error": {
    "code": "not_found",
    "message": "文章 42 不存在",
    "details": null
  },
  "request_id": "a3f8c2..."
}
\`\`\`

## 五、全局异常处理

业务异常之外，还有意料之外的 \`Exception\`（如数据库断连、空指针）。必须捕获它们，避免堆栈泄露给客户端。

\`\`\`python filename="global_handler.py"
import logging
logger = logging.getLogger("app.error")

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """兜底处理所有未捕获异常，返回 500。"""
    # 记录完整堆栈到日志，便于排查
    request_id = getattr(request.state, "request_id", None)
    logger.exception(
        "未处理异常 request_id=%s path=%s",
        request_id, request.url.path,
    )
    # 对客户端只返回模糊信息，绝不泄露堆栈
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "internal_error",
                "message": "服务器内部错误，请稍后重试",
                "request_id": request_id,
            }
        },
    )
\`\`\`

> **安全提示**：堆栈信息包含文件路径、代码行号、变量值，是攻击者的金矿。生产环境绝不能把堆栈返回给客户端，只能记到服务器日志。开发环境可考虑开启 \`debug=True\` 显示详细信息，但绝不能用于生产。

## 六、统一错误响应格式

把所有错误（包括 FastAPI 默认的校验错误、HTTPException）都统一成相同结构，前端处理逻辑就简单了。

\`\`\`python filename="unified_error.py"
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """把 Pydantic 校验错误也转成统一格式。"""
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "validation_error",
                "message": "参数校验失败",
                "details": jsonable_encoder(exc.errors()),
            },
            "request_id": getattr(request.state, "request_id", None),
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """统一 HTTPException 的格式。"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "http_error",
                "message": exc.detail,
            },
            "request_id": getattr(request.state, "request_id", None),
        },
    )
\`\`\`

这样无论什么错误，前端都收到 \`{ error: { code, message, details }, request_id }\` 结构，无需为不同错误写不同解析逻辑。

## 七、logging 模块配置

Python 标准库 \`logging\` 是日志的基础。生产环境要配置格式、级别、输出位置、轮转。

\`\`\`python filename="logging_config.py"
import logging
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        },
        # 结构化日志：键值对，便于 ELK 采集
        "json": {
            "format": '{"time":"%(asctime)s","level":"%(levelname)s",'
                      '"logger":"%(name)s","message":"%(message)s"}',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 10485760,        # 10MB 轮转
            "backupCount": 5,             # 保留 5 个历史文件
            "formatter": "json",
            "level": "INFO",
        },
    },
    "loggers": {
        "app": {"handlers": ["console", "file"], "level": "DEBUG", "propagate": False},
        "app.request": {"handlers": ["console", "file"], "level": "INFO"},
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
}

def setup_logging():
    logging.config.dictConfig(LOGGING_CONFIG)
\`\`\`

日志级别对比：

| 级别 | 数值 | 何时使用 |
|-----|------|---------|
| DEBUG | 10 | 调试细节，生产关闭 |
| INFO | 20 | 常规操作（请求、登录）|
| WARNING | 30 | 异常但可恢复（限流、降级）|
| ERROR | 40 | 错误，部分功能不可用 |
| CRITICAL | 50 | 严重错误，系统不可用 |

生产环境通常设 INFO，排查问题时临时开 DEBUG。日志级别要合理：把常规请求记成 ERROR 会让真正的错误被淹没。

## 八、结构化日志

文本日志人眼友好但机器难解析。结构化日志（JSON）便于 ELK、Loki 等系统采集检索。可用 \`structlog\` 或自定义 formatter：

\`\`\`python filename="structured_log.py"
import json, logging

class JsonFormatter(logging.Formatter):
    """把日志格式化成 JSON 行。"""
    def format(self, record):
        log = {
            "time": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log["exception"] = self.formatException(record.exc_info)
        # 附加额外字段（通过 extra 传入）
        for key in ("request_id", "user_id", "path"):
            if hasattr(record, key):
                log[key] = getattr(record, key)
        return json.dumps(log, ensure_ascii=False)

logger = logging.getLogger("app")
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)

# 使用：可附加业务字段
logger.info("文章发布成功", extra={"request_id": "abc", "user_id": 42, "path": "/articles"})
\`\`\`

结构化日志的关键是"可检索"：每个字段都是独立键，能按 \`level=ERROR AND user_id=42\` 这样的条件检索，比正则匹配文本高效得多。

## 九、请求 ID 追踪

分布式系统中一个请求可能经过多个服务，没有请求 ID 就无法串联日志。中间件生成请求 ID 并注入到所有日志：

\`\`\`python filename="request_id.py"
import uuid
from contextvars import ContextVar

# ContextVar 在异步任务间隔离，每个请求独立
request_id_var: ContextVar[str] = ContextVar("request_id", default="")

class RequestIdFilter(logging.Filter):
    """日志过滤器：把 request_id 注入到每条日志记录。"""
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """生成或复用请求 ID，贯穿整个请求链。"""
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    token = request_id_var.set(rid)        # 设置到 ContextVar
    request.state.request_id = rid
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid   # 响应也带回，便于客户端反馈
        return response
    finally:
        request_id_var.reset(token)         # 清理，避免泄漏到下一请求

# 给所有 logger 加上 RequestIdFilter
for name in ("app", "app.request", "app.error"):
    logging.getLogger(name).addFilter(RequestIdFilter())
\`\`\`

\`ContextVar\` 是 Python 3.7+ 提供的异步安全上下文变量，比 \`threading.local\` 更适合 asyncio。每个请求有独立的 \`request_id\`，即使并发也不会串。这样所有日志（包括业务代码、异常处理器、中间件）都自动带上请求 ID，排查问题时按 ID 过滤即可看到完整链路。

## 十、完整错误响应示例

综合上面所有内容，一个完整的错误处理流程：

\`\`\`python filename="error_flow.py"
@router.post("/articles")
async def create_article(payload: ArticleCreate, current: CurrentUser, db = Depends(get_db)):
    try:
        # 1. 业务校验：抛业务异常
        if payload.title == payload.content[:len(payload.title)]:
            raise ValidationException("标题不能与正文开头相同")

        # 2. 唯一性校验：抛冲突异常
        existing = await find_article_by_title(db, payload.title)
        if existing:
            raise ConflictException("同名文章已存在", title=payload.title)

        # 3. 写库：可能抛数据库异常（被全局处理器兜底）
        article = await save_article(db, payload, current["id"])
        logger.info("文章创建成功", extra={"article_id": article.id, "user_id": current["id"]})
        return article
    except AppException:
        # 业务异常向上抛，由对应处理器处理
        raise
    except Exception as e:
        # 意料外异常：记录后转成 500
        logger.exception("创建文章失败")
        raise AppException("创建文章失败，请稍后重试")
\`\`\`

客户端无论遇到什么错误，都会收到统一格式的响应，且能凭 \`request_id\` 在日志中定位完整上下文。

## 十一、安全注意事项

| 风险 | 防御 |
|-----|------|
| 堆栈泄露 | 生产环境不返回堆栈，只记日志 |
| 敏感信息入日志 | 不记录密码、Token、身份证号 |
| 错误信息泄露 | 不暴露"用户名存在"等可枚举信息 |
| 日志未轮转 | 配置 RotatingFileHandler，避免撑满磁盘 |
| 日志未采集 | 生产环境接入 ELK/Loki 集中存储 |
| 5xx 静默 | 配置告警，5xx 激增立即通知 |

日志是排查问题的眼睛，但也是泄露的源头。记录前要问：这条信息排查需要吗？会不会包含敏感数据？遵循"最小必要"原则。

## 十二、小结

本章从 HTTPException 讲到自定义业务异常，用异常处理器实现统一错误响应格式，用全局兜底处理器防止堆栈泄露，配置了 logging 的格式与轮转，引入结构化日志和请求 ID 追踪。至此，博客系统的认证安全篇完成：从密码哈希、JWT 认证、RBAC 授权，到中间件防护、错误处理与日志，构建了一套完整的安全基座。后续章节将进入业务功能的实现。`
  },
];
