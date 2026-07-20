// =============================================================
// FastAPI 认证授权简化版 —— 第 1 批（认证基础 6 章）
// -------------------------------------------------------------
// 只讲干货，简单易懂。每章直击核心，代码简短明了。
// ID 前缀：fas-（fastapiauth-simple）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：认证授权快速入门
  // ============================================================
  {
    id: "fas-intro",
    group: "认证基础",
    icon: "🎯",
    title: "认证授权快速入门",
    content: `# 认证授权快速入门

## 一、两个核心概念

- **认证（Authentication）**：你是谁？→ 验证身份（账号密码、Token）
- **授权（Authorization）**：你能干什么？→ 检查权限（管理员？普通用户？）

> 简记：**认证 = 查身份证，授权 = 查门禁卡权限**

## 二、HTTP 的无状态问题

HTTP 协议是**无状态**的——每个请求都是独立的，服务器记不住「上一个请求是谁发的」。

所以需要一种机制让每次请求都「自带身份信息」。常见方案：

| 方案 | 存储位置 | 特点 |
|---|---|---|
| Cookie + Session | 服务端 Session 存储 | 老方案，服务端要存状态 |
| JWT Token | 客户端携带 | 现代方案，服务端无状态 |
| API Key | 请求头/参数 | 简单，适合服务间调用 |

## 三、为什么选 JWT

JWT（JSON Web Token）是当前最流行的认证方案，因为：

1. **无状态**：服务端不用存 Session，扩展性好
2. **自包含**：Token 内部就有用户信息，不用查库
3. **跨域友好**：放 Header 里就能传，不受 Cookie 跨域限制
4. **广泛支持**：Python、Java、Go、JS 都有库

## 四、FastAPI 认证全家桶

FastAPI 做认证授权常用这套组合：

| 组件 | 作用 |
|---|---|
| \`python-jose\` | 生成和校验 JWT |
| \`passlib\` / \`pwdlib\` | 密码哈希（不能明文存密码） |
| \`Depends\` | 依赖注入，复用认证逻辑 |
| \`OAuth2PasswordBearer\` | 标准 OAuth2 密码模式 |

下面几章会逐个讲清楚。`,
    code: `# 认证授权快速入门 —— 理解认证 vs 授权
# 这个 demo 演示认证和授权的区别
# 认证（Authentication）：确认"你是谁"，对应登录账号密码校验
# 授权（Authorization）：确认"你能做什么"，对应权限检查

# 模拟用户数据库
# 实际项目中应存在数据库（如 MySQL、PostgreSQL），这里用字典简化演示
# 字典的 key 是用户名，value 是用户信息（含密码和角色）
# 注意：真实场景中密码必须哈希存储，绝不能明文保存（详见后续章节）
users_db = {
    "alice": {"password": "123456", "role": "admin"},  # alice 是管理员
    "bob": {"password": "654321", "role": "user"},     # bob 是普通用户
}

# ===== 认证：验证身份（你是谁）=====
# 认证函数：根据用户名和密码验证身份
# 参数说明：
#   username: str —— 用户输入的用户名
#   password: str —— 用户输入的明文密码（实际项目应使用 HTTPS 传输）
# 返回值：dict | None —— 验证成功返回用户信息字典，失败返回 None
def authenticate(username: str, password: str) -> dict | None:
    """验证账号密码，返回用户信息或 None"""
    # 从数据库中按用户名查找用户
    # 用 .get() 而不是 users_db[username]，避免用户不存在时抛 KeyError
    user = users_db.get(username)
    # 双重判断：用户存在 且 密码匹配
    # 注意这里用 == 直接对比明文，仅为演示；生产环境必须用 pwd_context.verify()
    if user and user["password"] == password:
        # 认证通过：打印日志并返回用户信息
        # f-string 是 Python 3.6+ 的字符串格式化语法
        print(f"[认证通过] {username} 是 {user['role']}")
        return user
    # 认证失败：不区分"用户不存在"和"密码错误"，避免被枚举用户名
    print(f"[认证失败] 用户名或密码错误")
    return None

# ===== 授权：检查权限（你能干什么）=====
# 授权函数：检查已登录用户是否有权限执行某操作
# 参数说明：
#   user: dict —— 已认证用户的信息（含 role 字段）
#   action: str —— 要执行的操作名称，如 "查看"、"删除"
# 返回值：bool —— True 表示有权限，False 表示无权限
def authorize(user: dict, action: str) -> bool:
    """检查用户是否有权限执行某操作"""
    # 管理员能做所有事：基于角色的访问控制（RBAC）
    # role 为 "admin" 时直接放行所有操作
    if user["role"] == "admin":
        print(f"[授权通过] admin 可以 {action}")
        return True
    # 普通用户只能查看：权限最小化原则
    # 只允许 "查看" 操作，其他操作（如删除）被拒绝
    if action == "查看":
        print(f"[授权通过] user 可以 {action}")
        return True
    # 既不是管理员，操作又不是允许的，则拒绝
    print(f"[授权拒绝] user 不能 {action}")
    return False

# ===== 测试 =====
# 通过具体用例验证认证和授权逻辑是否正确
print("=== 测试 alice（管理员）===")
# 调用认证函数，验证 alice 的账号密码
alice = authenticate("alice", "123456")
# 只有认证成功（返回非 None）才进行授权检查
if alice:
    authorize(alice, "查看")  # 管理员查看：通过
    authorize(alice, "删除")  # 管理员删除：通过（admin 拥有全部权限）

print()  # 打印空行，分隔不同测试用例的输出
print("=== 测试 bob（普通用户）===")
# 测试普通用户的认证和授权
bob = authenticate("bob", "654321")
if bob:
    authorize(bob, "查看")  # 普通用户查看：通过
    authorize(bob, "删除")  # 普通用户删除：拒绝（user 只能查看）

print()
print("=== 测试错误密码 ===")
# 测试认证失败的场景：密码错误应返回 None
# 这是安全测试的基本用例，确保错误密码不会被误判为通过
authenticate("alice", "wrong")
`,
  },

  // ============================================================
  // 第 2 章：Cookie 与 Session
  // ============================================================
  {
    id: "fas-cookie-session",
    group: "认证基础",
    icon: "🍪",
    title: "Cookie 与 Session 原理",
    content: `# Cookie 与 Session 原理

## 一、Cookie 是什么

Cookie 是**浏览器存储的小段数据**，每次请求自动带给服务器。

- 服务器通过 \`Set-Cookie\` 响应头下发
- 浏览器后续请求自动在 \`Cookie\` 请求头带上
- 有过期时间、域名限制

## 二、Session 是什么

Session 是**服务端存储的用户状态**，用 Cookie 里的 session_id 关联。

流程：

\`\`\`
1. 用户登录 → 服务器创建 Session，存用户信息
2. 服务器返回 Set-Cookie: session_id=abc123
3. 浏览器后续请求自动带 Cookie: session_id=abc123
4. 服务器用 session_id 查 Session 存储，拿到用户信息
\`\`\`

## 三、Session 的问题

1. **服务端有状态**：多台服务器要共享 Session（Redis）
2. **扩展麻烦**：服务器重启 Session 丢失
3. **跨域困难**：Cookie 有跨域限制

## 四、对比 JWT

| 维度 | Session | JWT |
|---|---|---|
| 状态 | 服务端有状态 | 服务端无状态 |
| 存储 | 服务端（Redis/内存） | 客户端（Cookie/Header） |
| 扩展性 | 差（要共享 Session） | 好（自包含） |
| 撤销 | 简单（删 Session 即可） | 难（需要黑名单） |
| 大小 | session_id 很小 | JWT 较大（含 payload） |

> 现代微服务、前后端分离项目多用 JWT，传统单体项目仍可用 Session。`,
    code: `# Cookie 与 Session 原理演示
# 模拟 Session 机制的完整流程
# Session 是服务端存储用户状态的方案：用户登录后，服务端生成一个 session_id，
# 并以 Cookie 形式返回浏览器；浏览器后续请求自动带这个 session_id，服务端据此识别用户。

import time    # time 模块：用于获取时间戳，判断 Session 是否过期
import secrets  # secrets 模块：用于生成密码学安全的随机字符串，作为 session_id

# 模拟服务端 Session 存储
# 实际项目中通常存到 Redis 等内存数据库，便于多台服务器共享
# 这里用字典模拟：key 是 session_id，value 是该会话的用户信息
session_store = {}

# 模拟用户数据库
# 用户登录时，根据 username 查到对应的 user_id 和 role
users_db = {
    "alice": {"password": "123456", "user_id": 1, "role": "admin"},
}

# ===== 创建 Session =====
# 登录成功后调用此函数，为用户创建一个会话
# 参数说明：
#   username: str —— 已通过密码验证的用户名
# 返回值：str —— 生成的 session_id，应通过 Set-Cookie 头返回给浏览器
def create_session(username: str) -> str:
    """登录成功后创建 Session，返回 session_id"""
    # 生成随机 session_id（实际用 secrets.token_urlsafe）
    # secrets.token_urlsafe(16) 生成 16 字节随机数的 URL 安全 Base64 编码
    # 必须用密码学安全的随机源，不能用 random，否则 session_id 可被预测
    session_id = secrets.token_urlsafe(16)
    # 服务端存储 Session 数据
    # 把用户的关键信息存起来，后续请求时直接读取，无需重新查数据库
    session_store[session_id] = {
        "user_id": users_db[username]["user_id"],  # 用户唯一 ID
        "username": username,                       # 用户名（方便日志显示）
        "role": users_db[username]["role"],         # 角色（用于授权判断）
        "created_at": time.time(),                  # 创建时间戳，用于过期判断
    }
    print(f"[创建 Session] session_id={session_id}")
    print(f"[Session 存储] {session_store[session_id]}")
    return session_id

# ===== 从 Session 获取用户 =====
# 每次请求到来时调用此函数，根据 session_id 查找用户
# 参数说明：
#   session_id: str —— 从请求的 Cookie 头中取出的 session_id
# 返回值：dict | None —— 找到返回 Session 信息，找不到或已过期返回 None
def get_user_from_session(session_id: str) -> dict | None:
    """请求来时，用 session_id 查用户"""
    # 用 .get() 查找 session_id，避免不存在时抛 KeyError
    session = session_store.get(session_id)
    if not session:
        # session_id 无效：可能被篡改、已登出、或服务器重启导致丢失
        print("[Session 查询] 无效的 session_id")
        return None
    # 检查是否过期（假设 30 分钟）
    # 1800 秒 = 30 分钟，超过则视为过期，需重新登录
    # 过期机制防止会话长期有效带来的安全风险
    if time.time() - session["created_at"] > 1800:
        print("[Session 查询] Session 已过期")
        # 过期后主动删除，释放服务端内存
        del session_store[session_id]
        return None
    print(f"[Session 查询] 找到用户: {session['username']}")
    return session

# ===== 销毁 Session（登出）=====
# 用户点击"退出登录"时调用
# 参数说明：
#   session_id: str —— 要销毁的 session_id
def destroy_session(session_id: str):
    """登出时删除 Session"""
    # 先判断存在再删除，避免 KeyError
    # 删除后该 session_id 即失效，后续请求会被当作未登录处理
    if session_id in session_store:
        del session_store[session_id]
        print(f"[销毁 Session] {session_id} 已删除")

# ===== 模拟完整流程 =====
# 演示用户从登录到登出的完整生命周期
print("=== 1. 用户登录 ===")
# 模拟用户提交账号密码并通过认证后，创建 Session
sid = create_session("alice")
# 实际场景：服务器返回 Set-Cookie: session_id=xxx
# 浏览器收到后会自动保存这个 Cookie，并在后续请求中带上

print()
print("=== 2. 后续请求（带 session_id）===")
# 模拟浏览器后续请求时带上 session_id
# 服务端通过 session_id 找到对应用户信息，无需用户再次输入账号密码
user = get_user_from_session(sid)
if user:
    print(f"  当前用户: {user['username']}, 角色: {user['role']}")

print()
print("=== 3. 登出 ===")
# 用户主动登出，删除服务端的 Session
destroy_session(sid)

print()
print("=== 4. 登出后再请求 ===")
# 登出后再用同一个 session_id 请求，应返回 None
# 这模拟了"会话失效"的场景，确保退出登录后立即无法访问受保护资源
user = get_user_from_session(sid)  # 已经失效
`,
  },

  // ============================================================
  // 第 3 章：JWT 结构详解
  // ============================================================
  {
    id: "fas-jwt",
    group: "认证基础",
    icon: "📦",
    title: "JWT 结构详解",
    content: `# JWT 结构详解

## 一、JWT 长什么样

一个 JWT 由三部分组成，用 \`.\` 分隔：

\`\`\`
xxxxx.yyyyy.zzzzz
Header.Payload.Signature
\`\`\`

## 二、三部分详解

### 1. Header（头部）

声明 Token 类型和签名算法：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

### 2. Payload（载荷）

存放实际数据（claims），比如用户 ID、角色、过期时间：

\`\`\`json
{
  "sub": "1",           // subject: 用户 ID
  "username": "alice",  // 自定义字段
  "role": "admin",      // 自定义字段
  "exp": 1700000000,    // expiration: 过期时间
  "iat": 1699900000     // issued at: 签发时间
}
\`\`\`

> **重要**：Payload 只是 Base64 编码，**不是加密**！不要放密码等敏感信息。

### 3. Signature（签名）

用密钥对 Header + Payload 签名，防止篡改：

\`\`\`
HMACSHA256(
  base64(header) + "." + base64(payload),
  secret_key
)
\`\`\`

## 三、JWT 验证原理

服务器收到 Token 后：

1. 拆出三部分
2. 用**自己的密钥**重新算签名
3. 对比签名是否一致 → 不一致说明被篡改
4. 检查 \`exp\` 是否过期

## 四、标准 Claims

| 字段 | 含义 |
|---|---|
| \`sub\` | subject（通常是用户 ID） |
| \`exp\` | 过期时间（时间戳） |
| \`iat\` | 签发时间 |
| \`nbf\` | 生效时间（在此之前无效） |
| \`iss\` | 签发者 |
| \`aud\` \| 接收方 |`,
    code: `# JWT 结构详解 —— 手动拆解一个 JWT
# 演示 JWT 的三部分结构和 Base64 编码
# JWT 由 Header.Payload.Signature 三部分组成，用 . 分隔
# 这个 demo 手动构造一个 JWT，帮助理解其内部结构和编码方式

import base64   # base64 模块：提供 Base64 编码解码，JWT 用的是 URL 安全变体
import json     # json 模块：用于 Python 字典与 JSON 字符串互转
import hmac     # hmac 模块：用于生成基于密钥的消息认证码（签名）
import hashlib  # hashlib 模块：提供 SHA256 等哈希算法

# ===== 1. 构造 Header =====
# Header 声明 Token 的类型和签名算法
# alg 指定签名算法（HS256 = HMAC + SHA256）
# typ 固定为 "JWT"，表示这是一个 JSON Web Token
header = {"alg": "HS256", "typ": "JWT"}
# 把字典转成紧凑的 JSON 字符串（无空格），再编码为字节
# separators=(",", ":") 去掉默认的空格，保证编码结果与标准 JWT 一致
# .encode() 把 str 转成 bytes，因为 base64 编码需要字节输入
header_json = json.dumps(header, separators=(",", ":")).encode()
# Base64URL 编码（去掉 = 填充）
# urlsafe_b64encode 用 - 和 _ 替换标准 Base64 的 + 和 /，避免 URL 解析问题
# rstrip(b"=") 去掉末尾的 = 填充符，JWT 标准要求不带填充
# .decode() 把 bytes 转回 str，方便后续字符串拼接
header_b64 = base64.urlsafe_b64encode(header_json).rstrip(b"=").decode()
print(f"Header        : {header}")
print(f"Header Base64 : {header_b64}")

print()

# ===== 2. 构造 Payload =====
# Payload 是 JWT 的核心数据，存放 claims（声明）
# sub: subject，通常是用户 ID（标准 claim）
# username/role: 自定义字段，按业务需要添加
# exp: expiration，过期时间戳（标准 claim），到期后 Token 失效
payload = {
    "sub": "1",
    "username": "alice",
    "role": "admin",
    "exp": 1700000000,
}
# 与 Header 一样：转 JSON → 字节 → Base64URL 编码 → 去填充 → 转字符串
payload_json = json.dumps(payload, separators=(",", ":")).encode()
payload_b64 = base64.urlsafe_b64encode(payload_json).rstrip(b"=").decode()
print(f"Payload       : {payload}")
print(f"Payload Base64: {payload_b64}")

print()

# ===== 3. 生成签名 =====
# 签名的作用：防止 Token 被篡改
# 只有持有 secret 的人才能生成正确签名，验证时也是用同一个 secret
# 注意：SECRET_KEY 必须保密，泄露后任何人都能伪造 Token
secret = "my-secret-key"
# 签名的输入是 "header_b64.payload_b64" 这串字符串的字节形式
# 这就是为什么 Header 和 Payload 改了任何一点，签名都对不上
message = f"{header_b64}.{payload_b64}".encode()
# 用 HMAC-SHA256 算签名：hmac.new(密钥, 消息, 哈希算法)
# 返回 32 字节的二进制摘要
signature = hmac.new(secret.encode(), message, hashlib.sha256).digest()
# 签名也要 Base64URL 编码后才能拼进 JWT
sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()
print(f"Signature     : {sig_b64}")

print()

# ===== 4. 拼成完整 JWT =====
# 三部分用 . 拼接，得到最终的 JWT 字符串
# 这个 Token 就可以放在 Authorization 头里发给服务端
jwt_token = f"{header_b64}.{payload_b64}.{sig_b64}"
print(f"完整 JWT      : {jwt_token}")

print()
print("=== 验证：拆解 JWT ===")
# 拆开三部分：用 . 作为分隔符切分字符串
# split(".") 返回列表，正好三个元素
parts = jwt_token.split(".")
print(f"第 1 部分 (Header)    : {parts[0]}")
print(f"第 2 部分 (Payload)   : {parts[1]}")
print(f"第 3 部分 (Signature) : {parts[2]}")

# 解码 Payload 看内容（证明 Payload 不是加密的！）
# 这个函数把 Base64URL 字符串还原成原始字典
# 参数说明：
#   s: str —— Base64URL 编码的字符串（可能去掉了 = 填充）
# 返回值：dict —— 解码后的字典
def decode_base64(s: str) -> dict:
    """解码 Base64URL（补回填充）"""
    # Base64 编码后长度应为 4 的倍数，不足的用 = 填充
    # JWT 标准去掉了 =，这里需要补回来才能用标准库解码
    # 4 - len(s) % 4 计算需要补几个 =（结果为 4 时表示正好整除，不需要补）
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    # 先 Base64URL 解码得到 JSON 字节，再 loads 解析成 Python 字典
    return json.loads(base64.urlsafe_b64decode(s))

# 解码 Payload 部分，证明任何人都能看到里面的内容
decoded_payload = decode_base64(parts[1])
print(f"\\n解码 Payload: {decoded_payload}")
# 重要安全提示：Payload 只是 Base64 编码，不是加密
# 任何人拿到 Token 都能解码看到内容，所以绝对不能放密码等敏感信息
print("⚠️  Payload 不加密！不要存敏感信息！")
`,
  },

  // ============================================================
  // 第 4 章：python-jose 实战
  // ============================================================
  {
    id: "fas-jose",
    group: "认证基础",
    icon: "🔧",
    title: "python-jose 生成与校验 JWT",
    content: `# python-jose 生成与校验 JWT

## 一、python-jose 简介

\`python-jose\` 是 Python 里常用的 JWT 库，支持多种算法（HS256、RS256 等）。

安装：

\`\`\`bash
pip install python-jose[cryptography]
\`\`\`

## 二、核心 API

| 函数 | 作用 |
|---|---|
| \`jwt.encode(payload, key, algorithm)\` | 生成 JWT |
| \`jwt.decode(token, key, algorithms)\` | 校验并解码 JWT |

## 三、生成 JWT

\`\`\`python
from jose import jwt, JWTError
import datetime

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

# 构造 payload
payload = {
    "sub": "1",                    # 用户 ID
    "username": "alice",
    "role": "admin",
    "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
}
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
\`\`\`

## 四、校验 JWT

\`\`\`python
try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print(payload)  # {'sub': '1', 'username': 'alice', ...}
except JWTError:
    print("Token 无效或过期")
\`\`\`

## 五、过期自动校验

\`jwt.decode\` 会自动检查 \`exp\` 字段，过期会抛 \`JWTError\`。

## 六、HS256 vs RS256

| 算法 | 密钥 | 场景 |
|---|---|---|
| HS256 | 对称密钥（双方共享） | 单体应用 |
| RS256 \| 公钥/私钥（私钥签名，公钥验签） | 微服务、第三方验证 |`,
    code: `# python-jose 实战 —— 生成与校验 JWT
# 注意：完整运行需安装 python-jose：pip install "python-jose[cryptography]"
# 如果未安装，本脚本会自动回退到内置的 HMAC-SHA256 简化实现，保证可运行
# python-jose 封装了 JWT 的生成和校验逻辑，比手动构造方便得多

import datetime                  # datetime 用于计算 Token 的过期时间
import json                      # json 用于序列化 payload
import hmac                      # hmac 用于计算签名
import hashlib                   # hashlib 提供 SHA256 算法
import base64                    # base64 用于 Base64URL 编解码
import time                      # time 用于过期时间戳比较

# ===== 兼容层：尝试导入 python-jose，失败则用内置实现 =====
# 这样无论环境是否安装 jose，都能完整演示 JWT 生成与校验流程
# 真实项目建议安装 python-jose，它的实现更完整、支持更多算法
try:
    from jose import jwt, JWTError  # jwt 模块负责编解码；JWTError 是校验失败时的异常
    print("[环境] 检测到 python-jose 已安装，使用完整库")
except ImportError:
    print("[环境] python-jose 未安装，使用内置 HMAC-SHA256 简化实现")
    print("       如需完整功能请运行: pip install \\"python-jose[cryptography]\\"")

    # 自定义异常，与 python-jose 的 JWTError 保持一致
    # 这样后续的 except JWTError 代码无需修改即可正常工作
    class JWTError(Exception):
        """JWT 校验异常基类（与 python-jose 保持一致）"""
        pass

    # 内置的 jwt 模块（仅支持 HS256，足够 demo 使用）
    # 实现了 encode（生成）和 decode（校验）两个核心方法
    class _JWT:
        """简化版 JWT 实现，仅支持 HS256 算法"""

        @staticmethod
        def _b64url_encode(data: bytes) -> str:
            """Base64URL 编码（去掉 = 填充）"""
            # urlsafe_b64encode 用 - 和 _ 替换 + 和 /，避免 URL 解析问题
            # rstrip(b"=") 去掉末尾填充符，符合 JWT 标准
            return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

        @staticmethod
        def _b64url_decode(s: str) -> bytes:
            """Base64URL 解码（补回 = 填充）"""
            # JWT 标准去掉了 = 填充，解码前需补回
            # 4 - len(s) % 4 计算需要补几个 =（结果为 4 表示正好整除，无需补）
            padding = 4 - len(s) % 4
            if padding != 4:
                s += "=" * padding
            return base64.urlsafe_b64decode(s)

        @staticmethod
        def encode(payload: dict, key: str, algorithm: str = "HS256") -> str:
            """生成 JWT Token"""
            # 1. 构造 Header
            header = {"alg": algorithm, "typ": "JWT"}
            header_b64 = _JWT._b64url_encode(
                json.dumps(header, separators=(",", ":")).encode())
            # 2. 构造 Payload（处理 datetime 类型的 exp/iat）
            payload = dict(payload)
            # datetime 对象需要转成时间戳，JWT 标准要求 exp/iat 是数字
            if "exp" in payload and hasattr(payload["exp"], "timestamp"):
                payload["exp"] = int(payload["exp"].timestamp())
            if "iat" in payload and hasattr(payload["iat"], "timestamp"):
                payload["iat"] = int(payload["iat"].timestamp())
            payload_b64 = _JWT._b64url_encode(
                json.dumps(payload, separators=(",", ":")).encode())
            # 3. 计算签名（HMAC-SHA256）
            signing_input = f"{header_b64}.{payload_b64}"
            sig = hmac.new(key.encode(), signing_input.encode(),
                           hashlib.sha256).digest()
            sig_b64 = _JWT._b64url_encode(sig)
            # 4. 拼成完整 JWT
            return f"{header_b64}.{payload_b64}.{sig_b64}"

        @staticmethod
        def decode(token: str, key: str, algorithms: list = None,
                   options: dict = None) -> dict:
            """校验并解码 JWT Token"""
            if algorithms is None or "HS256" not in algorithms:
                raise JWTError("algorithms 必须包含 HS256")
            parts = token.split(".")
            if len(parts) != 3:
                raise JWTError("Token 格式错误")
            header_b64, payload_b64, sig_b64 = parts
            # 验签：用密钥重新计算签名，对比是否一致
            signing_input = f"{header_b64}.{payload_b64}"
            expected_sig = hmac.new(key.encode(), signing_input.encode(),
                                    hashlib.sha256).digest()
            expected_sig_b64 = _JWT._b64url_encode(expected_sig)
            # 用 compare_digest 防止时序攻击
            if not hmac.compare_digest(sig_b64, expected_sig_b64):
                raise JWTError("签名验证失败")
            # 解码 payload
            payload = json.loads(_JWT._b64url_decode(payload_b64))
            # 检查 exp 过期时间
            if "exp" in payload and time.time() > payload["exp"]:
                raise JWTError("Token 已过期")
            return payload

    # 创建 jwt 模块对象，让 jwt.encode / jwt.decode 可正常调用
    jwt = _JWT()

# ===== 配置 =====
# SECRET_KEY 是签名密钥，必须保密且足够复杂
# 生产环境应从环境变量读取，绝不硬编码在代码里
SECRET_KEY = "my-secret-key-请改成随机字符串"
# ALGORITHM 指定签名算法，HS256 = HMAC + SHA256，对称加密
# 对称意味着签名和验签用同一个密钥
ALGORITHM = "HS256"

# ===== 1. 生成 JWT =====
# 此函数封装"生成访问令牌"的通用逻辑
# 参数说明：
#   data: dict —— 要写入 Token 的业务数据，如 {"sub": "1", "username": "alice"}
#   expires_minutes: int —— Token 有效期（分钟），默认 30 分钟
# 返回值：str —— 编码后的 JWT 字符串
def create_access_token(data: dict, expires_minutes: int = 30) -> str:
    """生成 JWT Token"""
    # 复制一份，避免修改原数据
    # 直接修改入参字典会污染调用方数据，是常见 bug 来源
    to_encode = data.copy()
    # 添加过期时间
    # datetime.now(timezone.utc) 获取 UTC 时间，避免时区问题
    # timedelta(minutes=...) 增加指定分钟数，得到未来某个时刻
    # exp 字段是 JWT 标准 claim，jwt.decode 会自动检查是否过期
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=expires_minutes)
    to_encode["exp"] = expire
    # 编码成 JWT
    # jwt.encode 内部会：转 JSON → Base64URL → 计算签名 → 用 . 拼接
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

# ===== 2. 校验 JWT =====
# 此函数封装"校验并解析 Token"的逻辑
# 参数说明：
#   token: str —— 客户端传来的 JWT 字符串
# 返回值：dict | None —— 校验成功返回 payload 字典，失败返回 None
def decode_token(token: str) -> dict | None:
    """校验 JWT，返回 payload 或 None"""
    try:
        # jwt.decode 会做三件事：
        # 1. 用 SECRET_KEY 重新算签名，对比是否一致（防篡改）
        # 2. 检查 exp 字段，过期则抛异常
        # 3. 解码 Payload 返回字典
        # algorithms 必须传列表，防止算法混淆攻击
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # 捕获所有 JWT 校验错误：签名错误、过期、格式错误等
        # 返回 None 而不是抛异常，让调用方用 if 简单判断
        print(f"[校验失败] {e}")
        return None

# ===== 测试 =====
print("=== 1. 生成 Token ===")
# 生成一个正常的 Token，包含用户业务信息
token = create_access_token({"sub": "1", "username": "alice", "role": "admin"})
# Token 通常很长，这里只显示前 50 个字符方便观察
print(f"Token: {token[:50]}...")

print()
print("=== 2. 校验 Token ===")
# 校验刚生成的合法 Token，应成功返回 payload
payload = decode_token(token)
if payload:
    print(f"用户 ID : {payload['sub']}")
    print(f"用户名  : {payload['username']}")
    print(f"角色    : {payload['role']}")
    print(f"过期时间: {payload['exp']}")

print()
print("=== 3. 篡改 Token（改一下内容）===")
# 故意改一个字符
# 把 Token 最后 5 个字符替换成 "XXXXX"，模拟攻击者篡改
tampered = token[:-5] + "XXXXX"
# 校验篡改后的 Token：因签名不匹配会失败
# 这证明了 JWT 的防篡改能力
result = decode_token(tampered)  # 会失败：签名不匹配

print()
print("=== 4. 过期 Token ===")
# 生成一个已过期的 Token
# expires_minutes=-1 让过期时间设为 1 分钟前，Token 一生成就已过期
expired_token = create_access_token({"sub": "1"}, expires_minutes=-1)
# 校验已过期的 Token：会因 exp 检查失败
result = decode_token(expired_token)  # 会失败：过期

print()
print("=== 5. 错误密钥 ===")
# 用错误的密钥校验合法 Token，验证密钥隔离性
# 不同服务用不同密钥，即使 Token 格式正确也无法通过校验
try:
    payload = jwt.decode(token, "wrong-key", algorithms=[ALGORITHM])
except JWTError as e:
    # 签名验证失败：因为是用正确密钥签的，错密钥无法匹配
    print(f"[错误密钥校验失败] {e}")
`,
  },

  // ============================================================
  // 第 5 章：密码哈希
  // ============================================================
  {
    id: "fas-password",
    group: "认证基础",
    icon: "🔒",
    title: "密码哈希（passlib / pwdlib）",
    content: `# 密码哈希（passlib / pwdlib）

## 一、为什么不能明文存密码

数据库一旦泄露，明文密码直接暴露。用户习惯在多个网站用同一个密码，一处泄露处处泄露。

**必须哈希存储**——不可逆，即使拿到哈希值也算不出原密码。

## 二、哈希 vs 加密

| 操作 | 可逆吗 | 用途 |
|---|---|---|
| 哈希（hash） | 不可逆 | 存密码 |
| 加密（encrypt） | 可逆（用密钥解密） | 传输敏感数据 |

## 三、bcrypt 算法

\`bcrypt\` 是专门为密码设计的哈希算法：

1. **自带盐值（salt）**：每次哈希结果不同，防彩虹表
2. **可调慢速**：\`rounds\` 参数让哈希变慢，抗暴力破解
3. **结果包含算法和盐**：一个字符串里全有，方便存储

## 四、passlib 用法

\`\`\`bash
pip install passlib[bcrypt]
\`\`\`

\`\`\`python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 哈希密码
hashed = pwd_context.hash("mypassword")

# 验证密码
pwd_context.verify("mypassword", hashed)  # True
pwd_context.verify("wrong", hashed)       # False
\`\`\`

## 五、pwdlib（新一代）

\`pwdlib\` 是更轻量的替代品，FastAPI 官方文档已推荐：

\`\`\`bash
pip install pwdlib[bcrypt]
\`\`\`

\`\`\`python
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
hashed = password_hash.hash("mypassword")
password_hash.verify("mypassword", hashed)  # True
\`\`\`

## 六、关键原则

1. **只哈希密码**，不加密（加密能解出来，哈希不能）
2. **永远不要自己写哈希算法**，用成熟的 bcrypt
3. **不要用 MD5/SHA1**，太快，容易被暴力破解
4. **登录时用 verify 对比**，不要 hash 后对比字符串`,
    code: `# 密码哈希演示 —— 对比明文存储 vs 哈希存储
# 演示 passlib 和 pwdlib 两种用法
# 核心思想：密码不能明文存数据库，必须用单向哈希（如 bcrypt）保存
# 哈希不可逆，即使数据库泄露，攻击者也还原不出原密码

# ===== 方案 1：passlib（经典，需要 pip install passlib[bcrypt]）=====
# 用 try/except 包裹，避免没装库时整个脚本崩溃
# 这是演示代码的常见写法，生产环境应在依赖管理里明确声明
try:
    from passlib.context import CryptContext  # CryptContext 是 passlib 的核心类

    # 创建密码哈希上下文
    # schemes=["bcrypt"] 指定使用 bcrypt 算法
    # deprecated="auto" 表示旧算法自动标记为弃用，便于将来切换算法
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # 哈希密码函数
    # 参数说明：
    #   password: str —— 用户输入的明文密码
    # 返回值：str —— bcrypt 哈希字符串，可直接存数据库
    def hash_password_passlib(password: str) -> str:
        """用 passlib 哈希密码"""
        # hash() 内部会：生成随机盐 → 计算哈希 → 拼成标准格式
        return pwd_context.hash(password)

    # 验证密码函数
    # 参数说明：
    #   password: str —— 用户登录时输入的明文密码
    #   hashed: str —— 数据库里存的哈希值
    # 返回值：bool —— True 密码正确，False 密码错误
    def verify_password_passlib(password: str, hashed: str) -> bool:
        """用 passlib 验证密码"""
        # verify() 会从 hashed 中取出盐和算法，重新计算并对比
        # 不能用 == 直接对比两个哈希字符串，因为同一密码每次哈希结果不同
        return pwd_context.verify(password, hashed)

    print("=== passlib 演示 ===")
    # 演示哈希和验证流程
    hashed1 = hash_password_passlib("mypassword")
    print(f"哈希结果: {hashed1}")
    # 验证正确密码：应返回 True
    print(f"验证正确密码: {verify_password_passlib('mypassword', hashed1)}")
    # 验证错误密码：应返回 False
    print(f"验证错误密码: {verify_password_passlib('wrong', hashed1)}")

    # 证明每次哈希结果不同（自带随机盐）
    # 盐（salt）是随机字符串，与密码混合后再哈希
    # 同一密码因盐不同，哈希结果不同，防止彩虹表攻击
    hashed2 = hash_password_passlib("mypassword")
    print(f"再次哈希同一密码: {hashed2}")
    # 两次哈希字符串不同，但都能通过 verify 验证
    print(f"两次哈希结果相同吗: {hashed1 == hashed2}")  # False
    print(f"但都能验证通过: {verify_password_passlib('mypassword', hashed2)}")

except ImportError:
    # 没装 passlib 时给出友好提示，而不是抛异常中断
    print("[跳过 passlib 演示] 未安装 passlib，请运行: pip install passlib[bcrypt]")

print()

# ===== 方案 2：pwdlib（新一代，需要 pip install pwdlib[bcrypt]）=====
# pwdlib 是 FastAPI 官方推荐的新库，比 passlib 更轻量
# 同样用 try/except 包裹，保证未安装时也能继续运行
try:
    from pwdlib import PasswordHash  # PasswordHash 是 pwdlib 的主类

    # 使用推荐的默认配置创建哈希器
    # .recommended() 会自动选择当前最安全的算法和参数
    password_hasher = PasswordHash.recommended()

    print("=== pwdlib 演示 ===")
    # 哈希密码：与 passlib 用法类似
    hashed = password_hasher.hash("mypassword")
    print(f"哈希结果: {hashed}")
    # 验证密码：正确返回 True，错误返回 False
    print(f"验证正确密码: {password_hasher.verify('mypassword', hashed)}")
    print(f"验证错误密码: {password_hasher.verify('wrong', hashed)}")

except ImportError:
    # 同样给出安装提示
    print("[跳过 pwdlib 演示] 未安装 pwdlib，请运行: pip install pwdlib[bcrypt]")

print()

# ===== 对比：为什么不能明文存密码 =====
print("=== 明文存储的危险 ===")
# 模拟数据库泄露
# 假设这是被拖库后的明文密码表，密码一目了然
bad_db = {"alice": "123456", "bob": "password123"}
print(f"明文存储的数据库: {bad_db}")
print("⚠️  数据库一泄露，密码直接暴露！")
# 危害：用户常在多网站复用密码，一处泄露处处被攻破

# 对比：哈希存储的数据库
# 即使拖库，看到的也只是无法逆推的哈希字符串
good_db = {
    "alice": "$2b$12$XXXXX...",  # 哈希值
    "bob": "$2b$12$YYYYY...",
}
print(f"哈希存储的数据库: {good_db}")
print("✅ 数据库泄露也拿不到原密码")
# $2b$ 前缀是 bcrypt 标识，12 是计算轮数（成本因子）
`,
  },

  // ============================================================
  // 第 6 章：Depends 依赖注入
  // ============================================================
  {
    id: "fas-depends",
    group: "认证基础",
    icon: "💉",
    title: "FastAPI Depends 依赖注入",
    content: `# FastAPI Depends 依赖注入

## 一、Depends 是什么

\`Depends\` 是 FastAPI 的**依赖注入**机制——把公共逻辑抽出来复用。

> 类比：你做菜要「洗菜、切菜、炒菜」，每次都写一遍太烦。把「洗菜、切菜」抽成函数，每次调用就行。

## 二、基本用法

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 定义依赖
def get_db():
    db = "数据库连接"
    return db

# 使用依赖
@app.get("/items")
def list_items(db = Depends(get_db)):
    return {"db": db}
\`\`\`

FastAPI 会自动调用 \`get_db()\`，把结果传给 \`db\` 参数。

## 三、为什么认证要用 Depends

认证逻辑（解析 Token、查用户）在多个接口都要用，用 Depends 复用最合适：

\`\`\`python
# 认证依赖
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 解析 token，返回用户
    return user

# 多个接口复用
@app.get("/users/me")
def read_user(user = Depends(get_current_user)):
    return user

@app.get("/profile")
def read_profile(user = Depends(get_current_user)):
    return {"profile": user}
\`\`\`

## 四、依赖嵌套

依赖可以嵌套调用：

\`\`\`python
def get_token(authorization: str = Header()):
    return authorization

def get_current_user(token: str = Depends(get_token)):
    user = decode_token(token)
    return user

def get_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(403)
    return user
\`\`\`

## 五、Depends 的好处

1. **复用代码**：认证逻辑写一次，处处可用
2. **测试方便**：测试时可以替换依赖（mock）
3. **自动文档**：FastAPI 会把依赖显示在 Swagger 文档
4. **层级清晰**：依赖可以嵌套，逻辑分明`,
    code: `# FastAPI Depends 依赖注入演示
# 用纯 Python 模拟 FastAPI 的 Depends 机制
# Depends 的核心思想：把公共逻辑（如认证）抽成函数，接口通过声明依赖自动复用
# 这样接口代码保持简洁，认证逻辑只维护一份

# 模拟数据库
# 存放已注册用户的信息，key 是用户名
fake_users = {"alice": {"id": 1, "username": "alice", "role": "admin"}}

# ===== 模拟 Depends 装饰器 =====
# 真实的 FastAPI Depends 复杂得多，这里用极简版演示其原理
# 参数说明：
#   func: 一个函数 —— 要作为依赖的函数
# 返回值：dict —— 一个标记字典，记录被依赖的函数
def Depends(func):
    """标记一个依赖（简化版，仅用于演示原理）"""
    # 返回一个特殊标记，后续 resolve_dependency 会识别并处理
    return {"__dependency__": func}

# 解析依赖：递归地把 Depends 标记替换成实际调用结果
# 参数说明：
#   dep —— 参数的默认值，可能是普通值或 Depends 标记
# 返回值：解析后的实际值
def resolve_dependency(dep):
    """解析依赖：如果是 Depends 标记的，就调用对应函数"""
    # 判断是否是 Depends 标记的字典
    if isinstance(dep, dict) and "__dependency__" in dep:
        # 递归解析依赖的依赖
        # 比如 get_current_user 依赖 get_token，要先解析 get_token
        func = dep["__dependency__"]
        # 获取函数参数，递归解析
        # inspect 模块可以拿到函数的签名信息
        import inspect
        sig = inspect.signature(func)
        kwargs = {}
        # 遍历函数的每个参数，看它的默认值是不是 Depends
        for name, param in sig.parameters.items():
            if param.default != inspect.Parameter.empty:
                # 递归解析每个参数的依赖
                kwargs[name] = resolve_dependency(param.default)
        # 用解析出的参数调用函数，得到依赖结果
        return func(**kwargs)
    # 不是 Depends 标记，原样返回（普通默认值）
    return dep

# ===== 定义依赖链 =====
# 这一层层依赖构成完整的认证流程
# 参数说明：
#   authorization: str —— 模拟请求头里的 Authorization 字段
# 返回值：str —— 提取出的纯 token 字符串
def get_token(authorization: str = "Bearer fake-token-alice") -> str:
    """从请求头获取 token"""
    print(f"  [依赖] get_token: {authorization}")
    # 去掉 "Bearer " 前缀，得到纯 token
    # OAuth2 标准格式：Authorization: Bearer <token>
    return authorization.replace("Bearer ", "")

# 第二层依赖：根据 token 解析出用户对象
# 参数说明：
#   token: str —— 由 get_token 提供（Depends 自动注入）
# 返回值：dict —— 用户信息字典
def get_current_user(token: str = Depends(get_token)) -> dict:
    """从 token 解析用户"""
    print(f"  [依赖] get_current_user: 解析 {token}")
    # 模拟从 token 解出 username
    # 实际项目这里会调用 jwt.decode 解析 Token，再查数据库
    username = "alice"  # 假设从 token 解出来
    user = fake_users.get(username)
    if not user:
        # 用户不存在：实际项目应抛 HTTPException(401)
        raise ValueError("用户不存在")
    return user

# 第三层依赖：在已登录基础上，进一步要求管理员权限
# 参数说明：
#   user: dict —— 由 get_current_user 提供
# 返回值：dict —— 通过权限检查的用户
def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    """要求管理员权限"""
    print(f"  [依赖] get_admin_user: 检查 {user['username']} 的权限")
    # 检查角色是否为 admin，不是则拒绝访问
    if user["role"] != "admin":
        # 实际项目应抛 HTTPException(403)
        raise PermissionError("需要管理员权限")
    return user

# ===== 模拟接口调用 =====
# 模拟 FastAPI 收到请求后调用路由函数的过程
# 参数说明：
#   handler —— 路由处理函数（带 Depends 默认值的函数）
# 返回值：函数的执行结果
def call_route(handler):
    """模拟 FastAPI 调用路由"""
    import inspect
    sig = inspect.signature(handler)
    kwargs = {}
    # 遍历路由函数的参数，解析每个 Depends 依赖
    for name, param in sig.parameters.items():
        kwargs[name] = resolve_dependency(param.default)
    # 用解析好的参数调用路由函数
    return handler(**kwargs)

# ===== 测试 =====
print("=== 1. 普通接口（需要登录）===")
# 这个接口只需要登录，不需要特定角色
# user 参数通过 Depends(get_current_user) 自动注入
def read_profile(user: dict = Depends(get_current_user)):
    return f"个人资料: {user['username']}"

# 调用接口：Depends 会自动完成"取 token → 解析用户"的全过程
result = call_route(read_profile)
print(f"返回: {result}")

print()
print("=== 2. 管理员接口（需要 admin 权限）===")
# 这个接口要求管理员权限，依赖链更深：get_admin_user → get_current_user → get_token
def delete_user(admin: dict = Depends(get_admin_user)):
    return f"管理员 {admin['username']} 删除了用户"

# 调用接口：Depends 会递归解析整条依赖链
result = call_route(delete_user)
print(f"返回: {result}")

print()
print("✅ Depends 让认证逻辑层层复用，接口代码保持简洁")
# 优势总结：
# 1. 认证逻辑写一次，多个接口复用
# 2. 依赖可嵌套，形成清晰的逻辑层级
# 3. 测试时可替换依赖（mock），无需真实数据库
`,
  },
];
