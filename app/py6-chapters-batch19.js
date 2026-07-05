export const chapters = [
  {
    id: "py6-cryptography",
    group: "跨领域与工程化",
    icon: "🔐",
    title: "加密与安全（hashlib/hmac/secrets）",
    content: `## 加密与安全（hashlib/hmac/secrets）

### 一、加密 vs 哈希：先理清概念

很多初学者把"加密"和"哈希"混为一谈，实际上它们属于不同范畴：

- **加密（Encryption）**：双向的，能加密就能解密，需要密钥。用于保护机密数据（如通信内容、磁盘文件）。Python 标准库不提供对称/非对称加密，需借助 \`cryptography\` 或 \`pycryptodome\` 等三方库。
- **哈希（Hash）**：单向的，输入任意长度产出固定长度摘要，不可逆。用于完整性校验、密码存储、数字签名。
- **消息认证码（MAC）**：带密钥的哈希，既验证完整性又验证来源。HMAC 是最常用的 MAC 构造。
- **随机数**：安全场景必须用密码学安全的随机数源（\`secrets\`），不能用 \`random\`。

> 💡 **避坑提示**：\`random\` 模块是 Mersenne Twister 伪随机，可预测；生成 token、密钥、盐值必须用 \`secrets\`。

### 二、hashlib 基础

\`\`\`python
import hashlib

# 方式一：一次性哈希
h = hashlib.sha256(b"hello").hexdigest()

# 方式二：分块更新（适合大文件）
h = hashlib.sha256()
h.update(b"hello")
h.update(b" world")
print(h.hexdigest())  # 与上面结果相同
\`\`\`

\`hashlib\` 支持 md5、sha1、sha224、sha256、sha384、sha512、blake2b、blake2s、sha3_256 等。Python 3.10+ 默认禁用弱哈希的 \`usedforsecurity=False\` 选项可用于绕过 FIPS 限制。

### 三、哈希算法对比

| 算法 | 输出长度 | 安全性 | 速度 | 典型用途 |
|------|----------|--------|------|----------|
| MD5 | 128 bit | 已破解，可碰撞 | 极快 | 文件校验（非安全） |
| SHA-1 | 160 bit | 已破解 | 快 | 历史遗留，不推荐 |
| SHA-256 | 256 bit | 安全 | 中 | 通用安全哈希 |
| SHA-512 | 512 bit | 安全 | 中 | 高安全场景 |
| BLAKE2 | 可变 | 安全 | 极快 | 现代替代 SHA-2 |
| SHA-3 | 224-512 | 安全 | 慢 | 抗长度扩展攻击 |

> ⚠️ **常见错误**：用 MD5/SHA1 存密码。这两个算法已被攻破（碰撞攻击），绝不用于安全场景。

### 四、密码存储：加盐 + 慢哈希

直接哈希密码有两大问题：
1. **彩虹表攻击**：相同密码哈希值相同，攻击者预先算好表即可反查。
2. **速度太快**：GPU 每秒可算数十亿次 SHA256，暴力破解容易。

解决方案：**加盐（Salt）+ 慢哈希（PBKDF2/scrypt/bcrypt/argon2）**。

\`\`\`python
import hashlib, secrets, hmac

def hash_password(password, iterations=100_000):
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"{iterations}\${salt.hex()}\${dk.hex()}"

def verify_password(password, stored):
    iters, salt_hex, dk_hex = stored.split("$")
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(),
                              bytes.fromhex(salt_hex), int(iters))
    return hmac.compare_digest(dk.hex(), dk_hex)
\`\`\`

\`hmac.compare_digest\` 是**常数时间比较**，防止计时攻击。绝不要用 \`==\` 比较密码哈希。

### 五、HMAC 消息认证码

HMAC = Hash(key + Hash(key + message))，用于验证消息**既未被篡改，也来自持有密钥的人**。

\`\`\`python
import hmac, hashlib

secret = b"api-secret"
msg = b"amount=100&to=alice"
sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()
\`\`\`

典型应用：API 签名（如 AWS Signature V4、GitHub Webhook）、JWT 签名、CSRF token。

### 六、secrets 安全随机数

\`\`\`python
import secrets
secrets.token_bytes(16)        # 16 字节随机二进制
secrets.token_hex(16)          # 32 字符十六进制
secrets.token_urlsafe(16)      # URL 安全的 base64
secrets.choice("ABCDEF")       # 安全选择
secrets.randbelow(10**6)       # 0 到 999999
\`\`\`

### 七、业务场景

- **用户密码存储**：PBKDF2/scrypt + 随机盐 + 迭代 10w+ 次
- **文件完整性校验**：SHA-256，发布包附带哈希值
- **API 请求签名**：HMAC-SHA256，防篡改+防重放（加 nonce+timestamp）
- **会话 token / 重置密码链接**：\`secrets.token_urlsafe(32)\`
- **CSRF 防护**：\`secrets.token_hex(32)\` 写入 cookie + 表单
- **加密密钥生成**：\`secrets.token_bytes(32)\` 生成 256 位密钥

### 八、原理深入

**PBKDF2 为什么慢才安全**：通过迭代 \`H(H(H(...H(password, salt)...)))\` 把单次哈希放大 N 倍。合法用户每次登录多花 100ms 可接受，但攻击者暴力破解每秒只能算 1w 次（vs SHA256 的 10 亿次），抵御能力提升 10 万倍。

**HMAC 为什么不能直接 hash(key+msg)**：直接拼接存在**长度扩展攻击**风险。MD5/SHA-1/SHA-2 基于迭代 Merkle–Damgård 结构，攻击者已知 \`H(key||msg)\` 可推算 \`H(key||msg||padding||extension)\` 而不知道 key。HMAC 用嵌套哈希结构避免了此问题。

**常数时间比较原理**：普通 \`==\` 在第一个不匹配字节就返回，攻击者通过测量响应时间逐字节猜出哈希。\`compare_digest\` 始终遍历全部字节，时间与输入无关。

### 九、最佳实践

1. 密码哈希优先用 \`argon2\`（密码学竞赛冠军），其次 \`scrypt\`、\`bcrypt\`，最后 \`pbkdf2_hmac\`
2. 盐值每个用户独立，至少 16 字节，存于哈希结果中
3. 迭代次数随硬件升级逐年提升（每年 +20% 左右）
4. API 签名务必加 timestamp + nonce 防重放
5. 任何 \`==\` 比较密钥/哈希的地方都换成 \`hmac.compare_digest\`
6. 密钥用 \`secrets\` 生成，绝不硬编码，用环境变量/KMS 管理
7. MD5 仅用于非安全场景的文件指纹（如缓存 key）`,
    code: `# 加密与安全演示：hashlib / hmac / secrets
import hashlib
import hmac
import secrets

print("=== 加密与安全演示 ===\\n")

print("--- 1. 哈希算法对比 ---")
data = "Hello, Python 安全".encode("utf-8")
for algo in ["md5", "sha1", "sha256", "sha512"]:
    h = hashlib.new(algo)
    h.update(data)
    print(f"  {algo:8s} 长度={len(h.hexdigest())*4:4d}bit  值={h.hexdigest()[:24]}...")

print("\\n--- 2. 大文件分块哈希 ---")
def chunks_hash(chunks, algo="sha256"):
    h = hashlib.new(algo)
    for chunk in chunks:
        h.update(chunk)
    return h.hexdigest()

parts = [b"chunk1-", b"chunk2-", b"chunk3"]
print(f"  分块哈希: {chunks_hash(parts)}")
print(f"  整体哈希: {hashlib.sha256(b'chunk1-chunk2-chunk3').hexdigest()}")
print("  两者相同，证明 update 可分块累积")

print("\\n--- 3. 密码哈希：加盐 + PBKDF2 ---")
def hash_password(password, salt=None, iterations=100000):
    if salt is None:
        salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return salt.hex() + "$" + dk.hex()

def verify_password(password, stored):
    salt_hex, dk_hex = stored.split("$")
    salt = bytes.fromhex(salt_hex)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return hmac.compare_digest(dk.hex(), dk_hex)

stored = hash_password("P@ssw0rd")
print(f"  存储值: {stored[:40]}... (salt$hash)")
print(f"  正确密码验证: {verify_password('P@ssw0rd', stored)}")
print(f"  错误密码验证: {verify_password('wrong', stored)}")

print("\\n--- 4. HMAC 消息认证码 ---")
secret = b"my-api-secret"
message = b"transfer=100&to=alice"
sig = hmac.new(secret, message, hashlib.sha256).hexdigest()
print(f"  消息: {message.decode()}")
print(f"  签名: {sig}")
def verify_api(msg, signature, key):
    expected = hmac.new(key, msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
print(f"  签名验证: {verify_api(message, sig, secret)}")
print(f"  篡改验证: {verify_api(b'transfer=999&to=alice', sig, secret)}")

print("\\n--- 5. secrets 安全随机数 ---")
print(f"  随机字节: {secrets.token_bytes(8).hex()}")
print(f"  随机URL: {secrets.token_urlsafe(16)}")
print(f"  随机数字: {secrets.randbelow(1000000):06d}")
print(f"  随机选择: {secrets.choice(['A', 'B', 'C', 'D'])}")

print("\\n--- 6. 常见错误演示 ---")
bad = hashlib.md5(b"password123").hexdigest()
print(f"  MD5 存密码(不安全): {bad}")
print("  MD5 已被破解，绝不可用于密码存储")
print("  正确做法: PBKDF2/scrypt/bcrypt/argon2 + 随机盐")

print("\\n--- 7. 业务场景速查 ---")
tips = [
    "密码存储 -> pbkdf2_hmac + 16字节盐 + 10万次迭代",
    "文件校验 -> sha256，发布附带 .sha256 文件",
    "API 签名 -> HMAC-SHA256 + timestamp + nonce 防重放",
    "会话 token -> secrets.token_urlsafe(32)",
    "CSRF token -> secrets.token_hex(32)",
    "密钥生成 -> secrets.token_bytes(32) 提供 256bit",
    "比较哈希 -> hmac.compare_digest 防计时攻击",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== 加密与安全演示结束 ===")`
  },
  {
    id: "py6-ssl-tls",
    group: "跨领域与工程化",
    icon: "🛡️",
    title: "SSL/TLS 与 HTTPS",
    content: `## SSL/TLS 与 HTTPS

### 一、SSL 与 TLS 的关系

- **SSL（Secure Sockets Layer）**：网景公司 1995 年推出，已彻底淘汰（SSLv2/v3 均有严重漏洞）。
- **TLS（Transport Layer Security）**：SSL 的继任者，1999 年起标准化。TLS 1.0 ≈ SSL 3.1，当前主流是 TLS 1.2 / TLS 1.3。
- 现在说"SSL 证书"实际指 TLS 证书，是历史习惯叫法。

TLS 在传输层之上为应用层提供三类保证：
1. **机密性**：对称加密保护数据内容
2. **完整性**：MAC/AEAD 防篡改
3. **身份认证**：证书 + CA 信任链验证服务端身份

### 二、TLS 握手流程（TLS 1.2）

\`\`\`
Client                                          Server
  | --- ClientHello (随机数, 支持的密码套件) --->  |
  | <-- ServerHello (选定套件, 随机数) ----------  |
  | <-- Certificate (服务端证书链) --------------  |
  | <-- ServerKeyExchange (DH 参数) -------------  |
  | <-- ServerHelloDone -----------------------  |
  | --- ClientKeyExchange (DH 公开部分) -------->  |
  | --- ChangeCipherSpec + Finished ----------->  |
  | <-- ChangeCipherSpec + Finished -----------  |
  | ====== 对称加密通信开始 =================== |
\`\`\`

TLS 1.3 简化为 1-RTT 握手，并支持 0-RTT 恢复，安全性更高（强制前向保密、移除弱算法）。

### 三、Python ssl 标准库

\`\`\`python
import ssl, socket

# 客户端：默认严格校验
ctx = ssl.create_default_context()
sock = socket.create_connection(("example.com", 443), timeout=10)
ssock = ctx.wrap_socket(sock, server_hostname="example.com")
cert = ssock.getpeercert()
print(cert["subject"], ssock.version())
ssock.close()
\`\`\`

\`create_default_context()\` 默认：
- \`verify_mode = CERT_REQUIRED\`（强制校验证书）
- \`check_hostname = True\`（校验 SNI 主机名）
- 加载系统 CA 信任库

### 四、SSLContext 关键配置

| 属性 | 含义 | 推荐值 |
|------|------|--------|
| \`protocol\` | 协议 | PROTOCOL_TLS_CLIENT/SERVER |
| \`minimum_version\` | 最低版本 | TLSv1_2 |
| \`verify_mode\` | 证书校验 | CERT_REQUIRED |
| \`check_hostname\` | 主机名校验 | True |
| \`load_default_certs()\` | 加载系统 CA | 自动 |
| \`load_verify_locations(cafile=)\` | 指定 CA | 内网 CA |
| \`load_cert_chain(cert, key)\` | 服务端/客户端证书 | 双向 TLS |

### 五、自签名证书与服务端

\`\`\`bash
# 生成自签名证书（仅测试用）
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem \\
    -days 365 -nodes -subj "/CN=localhost"
\`\`\`

\`\`\`python
# 服务端
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain("cert.pem", "key.pem")

srv = socket.socket()
srv.bind(("0.0.0.0", 8443))
srv.listen(5)
while True:
    conn, addr = srv.accept()
    sconn = ctx.wrap_socket(conn, server_side=True)
    # 处理 sconn ...
\`\`\`

### 六、常见 SSL 错误

| 错误 | 原因 | 解决 |
|------|------|------|
| \`SSLCertVerificationError\` | 自签名/过期/域名不符 | 用合法证书或测试时跳过 |
| \`SSL: WRONG_VERSION_NUMBER\` | 对方不是 HTTPS | 检查端口/协议 |
| \`CERTIFICATE_VERIFY_FAILED\` | 缺 CA 或链不完整 | 安装 certifi 或补全证书链 |
| \`HANDSHAKE_FAILURE\` | 无共同密码套件 | 升级 Python/openssl |
| \`UNSAFE_LEGACY_RENEGOTIATION\` | 老服务端要求重协商 | 配置 \`Options\` |

### 七、业务场景

- **HTTPS 客户端**：所有对外 API 调用必须 TLS
- **mTLS 双向认证**：微服务间零信任，客户端也持证书
- **WebSocket Secure (wss)**：长连接加密
- **数据库 TLS**：MySQL/PostgreSQL 强制加密连接
- **邮件 TLS**：SMTPS/IMAPS
- **内网服务**：自建 CA 签发，避免公网证书费用

### 八、原理深入

**前向保密（Forward Secrecy）**：使用临时 DH/ECDH 密钥交换，每次握手生成独立会话密钥。即使服务端长期私钥日后泄露，已录制流量也无法解密。TLS 1.3 强制 (EC)DHE，移除了不提供前向保密的 RSA 密钥交换。

**证书信任链**：服务端证书由中间 CA 签发，中间 CA 由根 CA 签发。客户端只信任预装的根 CA，验证时逐级校验签名直到根。若服务端未发送中间证书，部分客户端会中断验证 → \`CERTIFICATE_VERIFY_FAILED\`，需在服务端配置完整证书链（cert + intermediate 拼接）。

**SNI（Server Name Indication）**：一个 IP 上多个域名共用 443 时，客户端在 ClientHello 中带上目标主机名，服务端据此选择对应证书。Python 必须传 \`server_hostname\` 参数，否则 SNI 不发送，可能拿回默认证书导致校验失败。

### 九、最佳实践

1. 始终用 \`create_default_context()\`，不要手动构造降级
2. 生产环境绝不设置 \`verify_mode=CERT_NONE\`（即使测试也用环境隔离）
3. 及时更新 \`certifi\` 与系统 CA 包（Let's Encrypt 根证书 2024 已轮换）
4. 服务端最低 TLS 1.2，优先 1.3，禁用 SSLv3/TLS 1.0/1.1
5. 用 Let's Encrypt + certbot 自动续期，避免证书过期事故
6. 内网服务自建 CA，证书分发用配置管理工具
7. 性能敏感场景开启 session resumption / 0-RTT
8. 客户端加超时：\`socket.create_connection(timeout=)\` + \`ssock.settimeout()\``,
    code: `# SSL/TLS 与 HTTPS 演示
import ssl

print("=== SSL/TLS 与 HTTPS 演示 ===\\n")

print("--- 1. SSL Context 创建 ---")
ctx = ssl.create_default_context()
print(f"  协议: {ctx.protocol}")
print(f"  最低版本: {ctx.minimum_version}")
print(f"  最高版本: {ctx.maximum_version}")
print(f"  验证模式: {ctx.verify_mode}")
print(f"  检查主机名: {ctx.check_hostname}")

print("\\n--- 2. 证书校验选项 ---")
print(f"  默认 verify_mode = CERT_REQUIRED ({ssl.CERT_REQUIRED})")
insecure = ssl.create_default_context()
insecure.check_hostname = False
insecure.verify_mode = ssl.CERT_NONE
print(f"  跳过校验 verify_mode = CERT_NONE ({ssl.CERT_NONE})")
print("  警告: 生产环境绝不能这样配置")

print("\\n--- 3. 密码套件 ---")
ciphers = ctx.get_ciphers()
print(f"  密码套件数量: {len(ciphers)}")
for c in ciphers[:3]:
    print(f"  - {c['name']} (协议: {c['protocol']})")

print("\\n--- 4. TLS 握手流程 ---")
steps = [
    "ClientHello: 客户端发送支持的密码套件与随机数",
    "ServerHello: 服务端选定密码套件与随机数",
    "Certificate: 服务端发送证书链",
    "KeyExchange: 双方交换密钥生成参数(ECDHE)",
    "ChangeCipherSpec: 切换到加密通信",
    "Finished: 双方校验握手摘要",
]
for i, s in enumerate(steps, 1):
    print(f"  {i}. {s}")

print("\\n--- 5. HTTPS 客户端模板 ---")
template = '''import ssl, socket
ctx = ssl.create_default_context()
sock = socket.create_connection(("example.com", 443), timeout=10)
ssock = ctx.wrap_socket(sock, server_hostname="example.com")
cert = ssock.getpeercert()
print("证书主体:", cert["subject"])
print("TLS版本:", ssock.version())
ssock.close()
'''
print(template)

print("--- 6. 自签名证书生成 ---")
cert_info = '''
openssl 生成自签名证书（终端执行）：
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

Python 服务端加载：
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain("cert.pem", "key.pem")
'''
print(cert_info)

print("--- 7. 常见 SSL 错误 ---")
errors = [
    ("SSLCertVerificationError", "证书验证失败(自签名/过期/域名不符)"),
    ("SSL: WRONG_VERSION_NUMBER", "对方不是 HTTPS 服务"),
    ("CERTIFICATE_VERIFY_FAILED", "缺少 CA 证书或链不完整"),
    ("SSLV3_ALERT_HANDSHAKE_FAILURE", "客户端与服务端无共同密码套件"),
]
for name, desc in errors:
    print(f"  {name}")
    print(f"    -> {desc}")

print("\\n--- 8. 安全建议 ---")
tips = [
    "始终用 create_default_context()，不要手动降级",
    "生产环境绝不设置 verify_mode=CERT_NONE",
    "及时更新 certifi 与系统 CA 证书包",
    "服务端优先 TLS 1.3，禁用 SSLv3/TLS 1.0",
    "用 let's encrypt + certbot 自动续期",
    "SNI: wrap_socket 必须传 server_hostname",
    "性能: 开启 session resumption 减少 RTT",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== SSL/TLS 演示结束 ===")`
  },
  {
    id: "py6-jwt-oauth",
    group: "跨领域与工程化",
    icon: "🎫",
    title: "JWT 与 OAuth 认证",
    content: `## JWT 与 OAuth 认证

### 一、认证 vs 授权

- **认证（Authentication, AuthN）**：你是谁？验证身份（账号密码、生物识别）。
- **授权（Authorization, AuthZ）**：你能做什么？赋予权限（角色、ACL、scope）。

JWT 主要用于**状态less令牌传递**，OAuth 2.0 是**授权框架**，两者常配合使用。

### 二、JWT 结构

JWT 由三段 Base64URL 编码的字符串组成，用 \`.\` 分隔：

\`\`\`
header.payload.signature
\`\`\`

- **Header**：\`{"alg": "HS256", "typ": "JWT"}\`，声明算法与类型
- **Payload**：声明（Claims），如 \`sub\`（主体）、\`exp\`（过期）、\`iat\`（签发时间）、\`iss\`（签发者）、自定义字段
- **Signature**：\`HMAC(base64url(header) + "." + base64url(payload), secret)\`

> ⚠️ JWT **只签名不加密**，payload 任何人都能解码看到内容，**不要放密码等敏感信息**。需要加密时用 JWE（JSON Web Encryption）。

### 三、JWT 用标准库手写实现

JWT 本质就是 \`base64url + HMAC\`，无需三方库也能实现 HS256：

\`\`\`python
import base64, json, hmac, hashlib, time

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def jwt_encode(payload, secret):
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url(json.dumps(header, separators=(",", ":")).encode())
    p = b64url(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(secret.encode(), f"{h}.{p}".encode(),
                   hashlib.sha256).digest()
    return f"{h}.{p}.{b64url(sig)}"
\`\`\`

校验时务必用 \`hmac.compare_digest\` 防计时攻击，并检查 \`exp\` 过期时间。

### 四、JWT 算法对比

| 算法 | 类型 | 密钥 | 适用场景 |
|------|------|------|----------|
| HS256 | HMAC + SHA256 | 对称密钥 | 单一签发方/校验方 |
| RS256 | RSA 签名 | 公私钥对 | 签发方持私钥，多方校验 |
| ES256 | ECDSA 椭圆曲线 | 公私钥对 | 现代，更短更快 |
| PS256 | RSA-PSS | 公私钥对 | 高安全 |
| none | 无签名 | - | **绝对禁用** |

> 💡 **避坑**：历史上 JWT 库曾因允许 \`alg: none\` 导致认证绕过。校验时必须固定算法白名单，不要相信 header 里的 \`alg\`。

### 五、OAuth 2.0 四种授权模式

| 模式 | 适用 | 流程简述 |
|------|------|---------|
| 授权码（Authorization Code） | Web 应用、有后端 | 重定向拿 code，后端换 token（最常用） |
| 简化（Implicit） | SPA 纯前端（已过时） | 直接返回 token，不安全 |
| 密码（Password） | 自家应用 | 用户名密码换 token，仅高度信任客户端 |
| 客户端凭证（Client Credentials） | M2M 机器到机器 | client_id + client_secret 直接换 token |

### 六、授权码模式详细流程

\`\`\`
用户 -> 客户端: 点击"用 GitHub 登录"
客户端 -> 授权服务器: 重定向 /authorize?client_id&redirect_uri&scope&state
授权服务器 -> 用户: 显示授权确认页
用户 -> 授权服务器: 同意
授权服务器 -> 客户端: 重定向 redirect_uri?code=xxx&state=xxx
客户端 -> 授权服务器: POST /token (code + client_secret)
授权服务器 -> 客户端: access_token + refresh_token
客户端 -> 资源服务器: GET /api + Authorization: Bearer <token>
\`\`\`

\`state\` 参数防 CSRF，\`PKCE\`（Proof Key for Code Exchange）为公开客户端（SPA/移动端）保护 code 不被截获。

### 七、业务场景

- **SSO 单点登录**：CAS / Keycloak，一个 token 多系统通用
- **API 网关认证**：网关验签 JWT，下游服务信任 claims
- **微服务调用**：服务间 mTLS + JWT 双重保护
- **第三方登录**：GitHub/Google OAuth，免注册
- **移动端 API**：access_token 短期，refresh_token 续期
- **机器调用**：M2M 用 client_credentials，无用户参与

### 八、原理深入

**为什么 access_token 短期 + refresh_token 长期**：access_token 一旦泄露攻击窗口有限（15min）。refresh_token 只与授权服务器交互一次（换新 access_token），且可被吊销，泄露风险面小。这是在"无状态"和"可控撤销"之间的折中。

**JWT 无状态的代价**：无法主动撤销未过期的 token。解决方案：
1. **黑名单**：把吊销的 jti 存 Redis，每次校验查一次（部分破坏无状态）
2. **短期 + 刷新**：access_token 15min，过期后必须用 refresh_token（可吊销）
3. **版本号**：用户登出/改密时 bump 用户 token_version，旧 token 失效

**OAuth 与 OpenID Connect**：OAuth 2.0 本身只是授权框架，不直接做认证。OIDC 在 OAuth 之上加 \`id_token\`（JWT 格式）提供认证信息，是当前 SSO 事实标准。

### 九、JWT vs Session 对比

| 维度 | Session（服务端存储） | JWT（无状态） |
|------|---------------------|---------------|
| 存储 | Redis/内存 | 客户端 |
| 扩展性 | 需共享存储 | 天然分布式 |
| 撤销 | 删除即失效 | 需黑名单 |
| 性能 | 每次查存储 | 只验签 |
| 大小 | 短（sid） | 长（含 payload） |
| 安全 | 防 CSRF | 防 XSS（存储处） |

### 十、最佳实践

1. access_token 短期（15min~1h），refresh_token 长期（7~30 天）可吊销
2. 密钥足够长（>= 256bit），跨服务用 RS256，密钥用 KMS 管理
3. 校验时固定算法白名单，禁止 \`alg: none\`
4. payload 不放敏感数据，只放 sub/role 等最小必要信息
5. 授权码模式必带 \`state\`，公开客户端必带 PKCE
6. redirect_uri 严格白名单，防开放重定向
7. scope 最小化，按需授权
8. refresh_token 一次性使用（旋转），泄露可检测`,
    code: `# JWT 与 OAuth 认证演示
import hmac
import hashlib
import base64
import json
import time

print("=== JWT 与 OAuth 认证演示 ===\\n")

print("--- 1. JWT 结构 ---")
print("  JWT = header.payload.signature")
print("  三部分均用 Base64URL 编码，用 . 分隔")
print("  header:    算法与类型 {alg, typ}")
print("  payload:   声明 claims (sub, exp, iat, 自定义)")
print("  signature: HMAC(base64url(header)+'.'+base64url(payload), secret)")

def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def b64url_decode(s):
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def jwt_encode(payload, secret):
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url_encode(json.dumps(header, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
    p = b64url_encode(json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
    signing_input = (h + "." + p).encode()
    sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return f"{h}.{p}.{b64url_encode(sig)}"

def jwt_decode(token, secret):
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("JWT 必须有 3 段")
    h, p, s = parts
    signing_input = (h + "." + p).encode()
    expected = b64url_encode(hmac.new(secret.encode(), signing_input, hashlib.sha256).digest())
    if not hmac.compare_digest(expected, s):
        raise ValueError("签名校验失败")
    payload = json.loads(b64url_decode(p))
    if "exp" in payload and payload["exp"] < time.time():
        raise ValueError("token 已过期")
    return payload

print("\\n--- 2. 签发 JWT ---")
secret = "super-secret-key-256bit-aaaa-bbbb"
payload = {
    "sub": "user_1001",
    "name": "张三",
    "role": "admin",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600,
}
token = jwt_encode(payload, secret)
print(f"  Payload: {payload}")
print(f"  Token: {token}")

print("\\n--- 3. 校验 JWT ---")
decoded = jwt_decode(token, secret)
print(f"  解析结果: {decoded}")
try:
    jwt_decode(token, "wrong-secret")
except ValueError as e:
    print(f"  错误密钥: {e}")

print("\\n--- 4. 过期检测 ---")
expired_payload = {"sub": "u1", "exp": int(time.time()) - 10}
expired_token = jwt_encode(expired_payload, secret)
try:
    jwt_decode(expired_token, secret)
except ValueError as e:
    print(f"  过期token: {e}")

print("\\n--- 5. OAuth 2.0 授权码模式流程 ---")
flow = [
    "用户 -> 客户端: 点击用 GitHub 登录",
    "客户端 -> 授权服务器: 重定向 /authorize (client_id, redirect_uri, scope, state)",
    "授权服务器 -> 用户: 展示授权确认页",
    "用户 -> 授权服务器: 同意授权",
    "授权服务器 -> 客户端: 重定向 redirect_uri?code=xxx&state=xxx",
    "客户端 -> 授权服务器: POST /token (code, client_id, client_secret)",
    "授权服务器 -> 客户端: 返回 access_token + refresh_token",
    "客户端 -> 资源服务器: GET /api + Authorization: Bearer access_token",
]
for i, step in enumerate(flow, 1):
    print(f"  {i}. {step}")

print("\\n--- 6. 客户端凭证模式 ---")
cc_flow = [
    "客户端 -> 授权服务器: POST /token (grant_type=client_credentials, client_id, client_secret)",
    "授权服务器 -> 客户端: 返回 access_token",
    "适用场景: 机器到机器(M2M)调用，无用户参与",
]
for s in cc_flow:
    print(f"  {s}")

print("\\n--- 7. JWT vs Session 对比 ---")
compare = [
    ("存储位置", "服务端内存/Redis", "客户端(cookie/storage)"),
    ("扩展性", "需共享 session 存储", "无状态，易水平扩展"),
    ("撤销", "删除即失效", "需黑名单或短 exp"),
    ("性能", "每次查存储", "只需验签"),
    ("安全", "防 CSRF", "防 XSS 存储"),
]
print(f"  {'项目':<10} {'Session':<24} {'JWT':<24}")
for a, b, c in compare:
    print(f"  {a:<10} {b:<24} {c:<24}")

print("\\n--- 8. 安全建议 ---")
tips = [
    "密钥足够长(>=256bit)，绝不硬编码进源码",
    "exp 必须设置且短期(15min-1h)，配合 refresh_token",
    "不要在 payload 放敏感信息(JWT 只签名不加密)",
    "用 HS256 对称或 RS256 非对称，跨服务用 RS256",
    "state 参数防 CSRF，PKCE 防 code 截获",
    "校验时固定算法白名单，禁止 alg=none",
    "refresh_token 一次性使用(旋转)，泄露可检测",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== JWT/OAuth 演示结束 ===")`
  },
  {
    id: "py6-i18n",
    group: "跨领域与工程化",
    icon: "🌍",
    title: "国际化与 gettext",
    content: `## 国际化与 gettext

### 一、i18n、l10n、m17n

- **i18n（internationalization）**：国际化，首尾 i 和 n 之间 18 个字母。让代码**支持**多语言的能力设计。
- **l10n（localization）**：本地化，把界面**翻译**为特定语言/地区。
- **m17n（multilingualization）**：多语言化，同时支持多语言切换。

i18n 是骨架，l10n 是填肉。先 i18n 设计好，再逐语言 l10n。

### 二、gettext 工作流

GNU gettext 是事实标准，流程：

1. 源码中用 \`_("Hello")\` 标记待翻译字符串
2. \`xgettext\` 扫描源码，提取所有 \`_()\` 调用到 \`messages.pot\`（模板）
3. 翻译员复制为 \`zh_CN.po\`，填入 \`msgstr\`
4. \`msgfmt\` 把 \`.po\` 编译为 \`.mo\` 二进制
5. 运行时 \`gettext.translation()\` 加载 \`.mo\`，\`_()\` 返回译文

目录结构约定：

\`\`\`
locales/
  zh_CN/LC_MESSAGES/messages.mo
  en_US/LC_MESSAGES/messages.mo
  ja_JP/LC_MESSAGES/messages.mo
\`\`\`

### 三、Python gettext 标准库

\`\`\`python
import gettext

t = gettext.translation("messages", localedir="locales",
                        languages=["zh_CN"], fallback=True)
_ = t.gettext
print(_("Welcome"))        # 译文
print(_("Hello, %s!") % "Alice")
\`\`\`

\`fallback=True\` 找不到 \`.mo\` 时返回原文，避免 \`MissingTranslationError\`。

### 四、.po 文件格式

\`\`\`
msgid "Welcome"
msgstr "欢迎"

msgid "Hello, {name}!"
msgstr "你好，{name}！"

msgid "You have {n} message"
msgid_plural "You have {n} messages"
msgstr[0] "你有 {n} 条消息"
msgstr[1] "你有 {n} 条消息"
\`\`\`

- \`msgid\`：源字符串（通常是英文）
- \`msgstr\`：译文
- 复数用 \`msgid_plural\` + \`msgstr[0/1/...]\`，不同语言复数规则不同

### 五、.mo 二进制结构

\`.mo\` 是 \`.po\` 的编译产物，为运行时快速查找优化：

- 魔数 \`0x950412de\`（标识字节序）
- 版本号、字符串数量
- 原文表偏移、译文表偏移、哈希表偏移
- 原文/译文按字典序排列，二分查找 O(log n)
- 可选哈希表加速 O(1)

### 六、复数规则

不同语言复数形式差异巨大：

| 语言 | 复数形式 | 规则 |
|------|---------|------|
| 中文/日文 | 1 种 | 永远单数 |
| 英文/法文 | 2 种 | n==1 ? single : plural |
| 俄文 | 3 种 | n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 ? 1 : 2 |
| 阿拉伯文 | 6 种 | 极复杂 |

Python 用 \`ngettext(singular, plural, n)\` 处理，规则写在 \`.po\` 头部 \`Plural-Forms\` 字段。

### 七、babel 库

\`babel\` 是 Python 国际化增强库，提供：

- \`pybabel extract\` 提取（比 xgettext 更懂 Python，支持 Jinja2）
- \`pybabel init/update/compile\` 管理 .po/.mo
- 日期/时间/数字/货币本地化格式（\`format_date\`、\`format_currency\`）
- 地区数据（\`Locale("zh_CN")\`）

\`\`\`python
from babel.dates import format_date
from babel.numbers import format_currency
import datetime
format_date(datetime.date.today(), locale="zh_CN")  # 2024年1月1日
format_currency(1234.5, "CNY", locale="zh_CN")       # ¥1,234.50
\`\`\`

### 八、业务场景

- **多语言网站**：SaaS、跨境电商、文档站
- **桌面应用**：PyQt/PySide 通过 Qt 自身的 tr() 或 gettext
- **CLI 工具**：错误提示本地化
- **游戏**：剧情/菜单多语言
- **SaaS 后台**：用户偏好语言 + 时区

### 九、原理深入

**为什么用 \`_\` 作为翻译函数名**：简短易读，源自 C 语言 gettext 约定。\`_\` 是合法标识符，可在模块顶部 \`_ = gettext.gettext\` 注入。Python 还内置 \`gettext\` 在 \`__builtins__\` 安装 \`_\` 的能力，但显式注入更可控。

**为什么 .mo 编译为二进制**：运行时每次 \`_()\` 调用都要查表，二进制 + 二分查找比解析文本 .po 快几个数量级。Python \`GNUTranslations\` 启动时一次性加载 .mo 到内存 dict，查表 O(1)。

**上下文标记 pgettext**：同一个英文词在不同语境译文不同（如 "Open" 在菜单是"打开"，在状态是"开放"）。GNU 2.2+ 引入 \`pgettext("菜单", "Open")\` 区分。Python 3.8+ \`gettext.pgettext\` 支持。

### 十、gettext vs 自实现字典

| 维度 | gettext | 自实现 |
|------|---------|--------|
| 标准化 | GNU/i18n 标准 | 自定义 |
| 工具链 | xgettext/msgfmt/babel | 无 |
| 复数 | ngettext 内置规则 | 手写 |
| 性能 | .mo 二分/哈希 | dict O(1) |
| 学习成本 | 中 | 低 |
| 团队协作 | 翻译员友好（.po 工具丰富） | 程序员负担 |

### 十一、最佳实践

1. 尽早 i18n，后期改造代价大（要包所有字符串）
2. 源码用 \`_()\` 包裹所有面向用户字符串
3. 不要拼接：\`"Hello " + name\` 应改为 \`_("Hello, {name}!").format(name=name)\`
4. 复数用 \`ngettext\`，别用 \`if n == 1\` 自己判断
5. .mo 进程启动加载一次缓存，避免每请求 IO
6. 语言切换：重设 locale + 重载 translations，或重启进程
7. 用 babel 管理翻译，配合 CI 检查未翻译条目
8. 时区/日期/数字格式用 babel，不要手写
9. 上下文标记区分同形词
10. RTL 语言（阿拉伯文/希伯来文）注意 UI 布局翻转`,
    code: `# 国际化与 gettext 演示
import gettext
import struct

print("=== 国际化与 gettext 演示 ===\\n")

print("--- 1. gettext 工作原理 ---")
print("  1) 源码用 _('Hello') 标记待翻译字符串")
print("  2) xgettext 扫描源码生成 .po (Portable Object)")
print("  3) msgfmt 将 .po 编译为 .mo (Machine Object) 二进制")
print("  4) 运行时 gettext.GNUTranslations 加载 .mo 提供 _()")

print("\\n--- 2. 模拟翻译字典(.po 思想) ---")
translations = {
    "Welcome": "欢迎",
    "Hello, {name}!": "你好，{name}！",
    "You have {n} messages": "你有 {n} 条消息",
    "Logout": "退出登录",
    "Settings": "设置",
}

def _(msgid, **kwargs):
    text = translations.get(msgid, msgid)
    return text.format(**kwargs) if kwargs else text

print(f"  _('Welcome') = {_('Welcome')}")
print(f"  _('Logout') = {_('Logout')}")
print(f"  _('Hello, {{name}}!', name='张三') = {_('Hello, {name}!', name='张三')}")
print(f"  _('You have {{n}} messages', n=5) = {_('You have {n} messages', n=5)}")

print("\\n--- 3. GNU .mo 二进制结构 ---")
print("  魔数: 0x950412de (小端) / 0xde120495 (大端反向)")
print("  字段: version, msg_count, orig_offset, trans_offset, hash_offset")
print("  原文表与译文表各 N 条 (length, offset) 对")
print("  字符串区按字典序排列，二分查找定位")

print("\\n--- 4. 模拟 .mo 魔数解析 ---")
def detect_mo(data):
    magic = data[:4]
    if magic == b"\\xde\\x12\\x04\\x95":
        return "little-endian .mo"
    if magic == b"\\x95\\x04\\x12\\xde":
        return "big-endian .mo"
    return "非 .mo 文件"

fake_mo = b"\\xde\\x12\\x04\\x95" + b"\\x00" * 20
print(f"  解析结果: {detect_mo(fake_mo)}")
print(f"  普通 json: {detect_mo(b'{}')}")

print("\\n--- 5. gettext 标准库 API ---")
api_demo = '''import gettext
# 加载翻译(找到 locales/zh_CN/LC_MESSAGES/messages.mo)
t = gettext.translation("messages", localedir="locales", languages=["zh_CN"])
_ = t.gettext
print(_("Welcome"))

# 找不到时回退 NullTranslations(直接返回原文)
t = gettext.NullTranslations()
_ = t.gettext
print(_("Welcome"))  # 输出 Welcome
'''
print(api_demo)

print("--- 6. .po 文件示例 ---")
po_sample = '''msgid "Welcome"
msgstr "欢迎"

msgid "Hello, {name}!"
msgstr "你好，{name}！"

# 复数形式
msgid "You have {n} message"
msgid_plural "You have {n} messages"
msgstr[0] "你有 {n} 条消息"
msgstr[1] "你有 {n} 条消息"
'''
print(po_sample)

print("--- 7. 复数处理 ngettext ---")
def ngettext(singular, plural, n):
    # 中文不区分单复数，英文区分
    return singular if n == 1 else plural
for n in [0, 1, 5]:
    msg = ngettext("1 message", "{n} messages", n).format(n=n)
    print(f"  n={n}: {msg}")

print("\\n--- 8. 业务场景与避坑 ---")
tips = [
    "业务: 多语言网站/App、SaaS 国际化、跨境电商",
    "源码用 _() 包裹，便于 xgettext 自动提取",
    "复数形式用 ngettext，不同语言规则不同(阿拉伯语有6种)",
    ".mo 进程启动时加载一次缓存，避免每请求 IO",
    "避免字符串拼接: 'Hello ' + name 破坏翻译提取",
    "babel 库: 提取/编译 .po 更强，支持日期/数字本地化",
    "上下文标记: pgettext('菜单|Open', 'Open') 区分同形词",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n--- 9. gettext vs 自实现字典 ---")
print(f"  {'特性':<12} {'gettext':<22} {'自实现':<22}")
rows = [
    ("标准化", "GNU/i18n 标准", "自定义"),
    ("复数", "ngettext 内置规则", "需手写"),
    ("工具链", "xgettext/msgfmt", "无"),
    ("性能", ".mo 二分查找", "dict O(1) 更快"),
    ("学习成本", "中", "低"),
]
for a, b, c in rows:
    print(f"  {a:<12} {b:<22} {c:<22}")

print("\\n=== i18n 演示结束 ===")`
  },
  {
    id: "py6-pyinstaller",
    group: "跨领域与工程化",
    icon: "📦",
    title: "PyInstaller 打包发布",
    content: `## PyInstaller 打包发布

### 一、为什么需要打包

Python 程序依赖解释器和大量三方库，用户机器未必安装。打包工具把"解释器 + 依赖 + 源码"封装成单个可执行文件或目录，让最终用户**免安装 Python 即可运行**。

典型场景：桌面 GUI 应用、内部工具分发给非技术用户、商业软件发布。

### 二、PyInstaller 工作原理

\`\`\`
入口脚本 main.py
    ↓ 静态分析 import 图（ModuleGraph）
收集依赖 .py + C 扩展 .so/.dll + 数据文件
    ↓ 打包
PYZ 归档（类 zip，存字节码）+ 引导脚本 bootloader
    ↓ 嵌入
Python 解释器 + 标准库
    ↓ 生成
dist/myapp（onedir 目录）或 dist/myapp.exe（onefile 单文件）
\`\`\`

\`bootloader\` 是 C 编写的启动器，负责：
- onefile 模式：解压 PYZ 到 \`sys._MEIPASS\` 临时目录
- 初始化 Python 解释器
- 设置 \`sys.path\` 指向内嵌模块
- 执行入口脚本

### 三、--onefile vs --onedir

| 维度 | --onefile | --onedir |
|------|-----------|----------|
| 产物 | 单个 .exe/.bin | 目录 + 可执行文件 |
| 启动速度 | 慢（每次解压到临时目录） | 快（直接加载） |
| 体积 | 较大（含解压器） | 较小 |
| 更新 | 替换单文件 | 替换整个目录 |
| 调试 | 困难 | 容易（可见所有文件） |
| 杀毒误报 | 高 | 中 |

> 💡 **建议**：内部工具/开发期用 onedir（启动快、易调试）；正式发布用 onefile（用户友好）。

### 四、命令行用法

\`\`\`bash
# 基础打包
pyinstaller main.py

# 单文件 + 无控制台 + 图标
pyinstaller --onefile --noconsole --icon=app.ico main.py

# 指定名称 + 排除模块 + 添加数据
pyinstaller --name MyApp \\
    --exclude-module tkinter \\
    --exclude-module unittest \\
    --add-data "assets:assets" \\
    main.py

# 生成 spec 文件后编辑
pyi-makespec main.py        # 生成 main.spec
pyinstaller main.spec       # 用 spec 打包
\`\`\`

### 五、.spec 配置文件

\`\`\`python
# app.spec
block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=['/src'],
    binaries=[],                          # 额外 .so/.dll
    datas=[('assets/*.png', 'assets')],   # 资源文件 (src, dest)
    hiddenimports=['yaml'],               # 隐式导入
    hookspath=[],                         # 自定义 hooks
    excludes=['tkinter', 'unittest'],
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data)
exe = EXE(pyz, a.scripts, a.binaries, a.datas,
          name='MyApp', console=False, icon='app.ico')
\`\`\`

.spec 文件应**提交到 git**，是打包配置的真相来源。命令行参数适合一次性使用，复杂配置必须用 spec。

### 六、隐式导入问题

PyInstaller 通过静态分析 \`import\` 语句收集依赖，但以下情况会漏：

- \`importlib.import_module(name)\`：动态 import
- 插件机制：\`pkgutil.iter_modules\` 加载
- C 扩展间接依赖：\`.so\` 内部 dlopen 其他库
- 延迟导入：函数内部 import

解决方案：
1. \`--hidden-import=yaml\` 显式声明
2. spec 文件 \`hiddenimports=['yaml', 'pkg.sub']\`
3. **hooks**：\`hooks/hook-yaml.py\` 自动收集，PyInstaller 内置大量 hook
4. \`--collect-all=pkg\` 一次性收集某包所有子模块 + 数据

### 七、资源文件路径处理

打包后 \`__file__\` 路径变化，硬编码相对路径会失效：

\`\`\`python
import sys, os
def resource_path(rel):
    """获取打包后资源绝对路径"""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)

icon = resource_path("assets/icon.png")
\`\`\`

- onefile：\`sys._MEIPASS\` 是临时解压目录
- onedir：用 \`__file__\` 所在目录
- 开发模式（未打包）：\`__file__\` 即可

### 八、业务场景

- **桌面应用分发**：PyQt/Tkinter 应用给非技术用户
- **内部工具**：CI 脚本、运维工具
- **商业软件**：配合数字签名 + 许可证
- **跨平台**：Windows/macOS/Linux 分别打包（不能交叉编译）
- **游戏**：Pygame 应用打包

### 九、原理深入

**bootloader 如何工作**：onefile 模式下，启动器先把自己内嵌的 PYZ 解压到 \`/tmp/_MEIxxxxxx\` 临时目录，设置 \`sys._MEIPASS\` 指向它，然后初始化 Python 解释器并执行入口脚本。程序退出时清理临时目录。所以 onefile 启动慢（解压 IO），且首次运行可能触发杀毒扫描。

**ModuleGraph 静态分析的局限**：PyInstaller 用 AST 解析 \`import\` 语句构建依赖图，但无法处理运行时才确定的导入。这就是为什么动态加载的包必须用 \`hiddenimports\` 显式声明。

**为什么杀毒误报**：PyInstaller bootloader 用了类似加壳器的技术（自解压 + 内存加载 PE），与病毒行为相似。解决方案：
1. 用 onedir 而非 onefile
2. 数字签名（Windows signtool / macOS codesign）
3. 提交到杀毒厂商白名单
4. 用 Nuitka/PyOxidizer 替代

### 十、最佳实践

1. 用 .spec 文件管理配置，提交 git
2. CI 矩阵构建：GitHub Actions 在 win/mac/linux 分别打包
3. \`--clean\` 清理缓存避免旧产物污染
4. 数字签名：Windows EV 证书、 macOS Developer ID
5. 资源用 \`datas\` 收集，运行时 \`sys._MEIPASS\` 定位
6. 体积优化：\`--exclude-module\` 排除未用大模块（tkinter、unittest）
7. UPX 压缩：\`--upx-dir\` 进一步缩小（注意部分杀毒更敏感）
8. 版本号嵌入：\`--version-file\` 写入文件属性
9. 测试打包后的程序（开发环境正常 ≠ 打包后正常）
10. 自动化：每次 release tag 触发 CI 打包上传 GitHub Release`,
    code: `# PyInstaller 打包发布演示
import sys
import os
import zipfile
import io

print("=== PyInstaller 打包发布演示 ===\\n")

print("--- 1. PyInstaller 工作原理 ---")
print("  1) 静态分析入口脚本(import 图)")
print("  2) 收集所有依赖模块(.py/.so/.dll)")
print("  3) 收集数据文件、资源、证书")
print("  4) 打包为 PYZ(zip-like) + 引导脚本")
print("  5) 嵌入 Python 解释器与标准库")
print("  6) 生成可执行文件 + 临时解压目录")

print("\\n--- 2. 打包模式对比 ---")
print(f"  {'模式':<12} {'--onefile':<24} {'--onedir':<24}")
rows = [
    ("产物", "单个 .exe/.bin", "目录 + 可执行"),
    ("启动速度", "慢(需解压到临时目录)", "快(直接加载)"),
    ("体积", "较大(含解压器)", "较小"),
    ("更新", "替换单个文件", "替换整个目录"),
    ("调试", "困难", "容易(可见文件)"),
]
for a, b, c in rows:
    print(f"  {a:<12} {b:<24} {c:<24}")

print("\\n--- 3. 模拟依赖分析 ---")
def analyze_imports(entry):
    """模拟 ModuleGraph 静态分析"""
    graph = {
        "main.py": ["ui", "utils", "config"],
        "ui": ["PyQt5", "utils"],
        "utils": ["json", "hashlib"],
        "config": ["yaml"],
        "PyQt5": ["PyQt5.QtCore", "PyQt5.QtWidgets"],
    }
    visited = set()
    queue = [entry]
    while queue:
        mod = queue.pop(0)
        if mod in visited:
            continue
        visited.add(mod)
        for dep in graph.get(mod, []):
            if dep not in visited:
                queue.append(dep)
    return visited

deps = analyze_imports("main.py")
print(f"  入口: main.py")
print(f"  分析得到 {len(deps)} 个模块:")
for d in sorted(deps):
    print(f"    - {d}")

print("\\n--- 4. .spec 文件示例 ---")
spec = '''# app.spec - PyInstaller 配置文件
# 由 pyi-makespec 生成，可手动编辑
block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=['/src'],
    binaries=[],
    datas=[('assets/*.png', 'assets')],
    hiddenimports=['yaml'],
    hookspath=[],
    runtime_hooks=[],
    excludes=['tkinter', 'unittest'],
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(pyz, a.scripts, a.binaries, a.zipfiles, a.datas,
          name='MyApp', console=False, icon='app.ico')
'''
print(spec)

print("--- 5. 模拟 PYZ 打包(类 zip) ---")
buf = io.BytesIO()
with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("main.py", "print('hello')")
    zf.writestr("utils.py", "def f(): pass")
    zf.writestr("config.json", '{"debug": false}')
size = buf.tell()
buf.seek(0)
with zipfile.ZipFile(buf) as zf:
    names = zf.namelist()
print(f"  PYZ 包大小: {size} bytes")
print(f"  包含模块: {names}")

print("\\n--- 6. 隐式导入处理 ---")
hidden = [
    "动态 import: importlib.import_module(name)",
    "插件机制: pkgutil.iter_modules",
    "C 扩展依赖: .so/.dll 显式声明",
    "解决方案: --hidden-import=yaml 或在 spec 写 hiddenimports",
    "hooks 目录: hooks/hook-yaml.py 自动收集",
]
for h in hidden:
    print(f"  - {h}")

print("\\n--- 7. 资源文件路径处理 ---")
print("  打包后 __file__ 路径变化，需用 sys._MEIPASS")
path_code = '''def resource_path(rel):
    """获取打包后资源绝对路径"""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)

# onefile 模式: sys._MEIPASS 是临时解压目录
# onedir 模式: 用 __file__ 所在目录
icon = resource_path("assets/icon.png")
'''
print(path_code)

print("--- 8. 常见问题 ---")
issues = [
    ("杀毒误报", "onefile 单 exe 易被误报，用 onedir 或签名"),
    ("体积过大", "排除 unused: --exclude-module tkinter"),
    ("缺少模块", "hiddenimports 添加隐式导入"),
    ("资源找不到", "用 sys._MEIPASS 定位"),
    ("启动慢", "onefile 需解压，改 onedir"),
    ("跨平台", "必须在目标平台打包(Windows 上打不了 Linux)"),
]
for name, desc in issues:
    print(f"  {name}: {desc}")

print("\\n--- 9. 最佳实践 ---")
best = [
    "用 spec 文件管理配置，提交到 git",
    "CI 自动打包: GitHub Actions 矩阵构建",
    "用 --clean 清理缓存避免旧产物污染",
    "数字签名: Windows signtool / macOS codesign",
    "资源用 datas 收集，运行时 sys._MEIPASS 定位",
    "体积优化: --exclude + UPX 压缩",
]
for i, b in enumerate(best, 1):
    print(f"  {i}. {b}")

print("\\n=== PyInstaller 演示结束 ===")`
  },
  {
    id: "py6-pyoxidizer",
    group: "跨领域与工程化",
    icon: "🔒",
    title: "PyOxidizer 与 Nuitka 打包",
    content: `## PyOxidizer 与 Nuitka 打包

### 一、为什么需要更高级的打包工具

PyInstaller 虽成熟易用，但有三个痛点：

1. **启动慢**：onefile 每次解压到临时目录
2. **代码可被解包反编译**：PYZ 是 zip，用 \`pyinstxtractor\` 即可提取源码
3. **性能无提升**：仍是解释执行

PyOxidizer 和 Nuitka 分别从"嵌入"和"编译"两个方向解决这些问题。

### 二、PyOxidizer：Rust 嵌入 Python

由 Mozilla 工程师 Gregory Szorc 开发，用 Rust 编写 \`pyembed\` crate 嵌入 CPython：

- 把 Python 字节码作为**资源**嵌入二进制，而非 zip 文件
- 启动时直接从内存读取，无需解压临时目录
- 单文件、启动快、资源防篡改（嵌入二进制段）

**工作原理**：

\`\`\`
Python 源码 → 字节码 → 序列化资源 → 嵌入 Rust 二进制 .rodata 段
                                    ↓
                启动时 pyembed crate 直接内存映射读取
                                    ↓
                CPython 解释器执行（无需文件 IO）
\`\`\`

### 三、Nuitka：源码编译为 C

Nuitka 把 Python 源码翻译为 C 代码，再用 gcc/clang 编译为机器码：

- 部分热点代码**加速 5-30%**（不是全部，CPython 内置调用仍走 CPython）
- **防反编译**：源码以 C 形式编译进二进制，难以还原
- 完整打包：附带解释器 + 标准库

**工作原理**：

\`\`\`
Python 源码 → AST → C 源码 → gcc/clang → 机器码 .o → 链接 → 可执行
                ↓
        调用 CPython C API 实现语义
\`\`\`

### 四、三种打包工具对比

| 特性 | PyInstaller | PyOxidizer | Nuitka |
|------|-------------|------------|--------|
| 原理 | zip + 引导 | Rust 嵌入 | 编译为 C |
| 启动速度 | 慢 (onefile) | 快 | 快 |
| 运行性能 | 原速 | 原速 | 提升 5-30% |
| 体积 | 中 | 中 | 大（含 C） |
| 代码保护 | 弱（可解包） | 中 | 强（编译） |
| 跨平台构建 | 本地 | 本地 | 本地 |
| 依赖 | Python + zip | Rust + Python | C 编译器 |
| 调试难度 | 低 | 中 | 高 |
| 学习曲线 | 平缓 | 陡（Starlark 配置） | 中 |
| 成熟度 | 高 | 中 | 中 |

### 五、PyOxidizer 配置（pyoxidizer.bzl）

用 Starlark（Bazel 的方言）编写：

\`\`\`python
def make_exe():
    dist = default_python_distribution()
    config = dist.make_python_interpreter_config()
    config.run_module = "myapp"
    exe = dist.to_python_executable(name="myapp", config=config)
    exe.add_python_resources(exe.pip_install(["requests", "pyqt5"]))
    return exe

register_target("exe", make_exe)
resolve_targets()
\`\`\`

构建命令：\`pyoxidizer build\` 或 \`pyoxidizer run\`。

### 六、Nuitka 命令

\`\`\`bash
# 单文件可执行
nuitka --onefile --enable-plugin=qt-plugins main.py

# 目录形式（启动更快）
nuitka --standalone --follow-imports main.py

# 编译为模块（防反编译核心逻辑）
nuitka --module --include-package=myapp myapp/

# 性能优化
nuitka --lto=yes --jobs=4 main.py
\`\`\`

### 七、业务场景选型

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| 开源工具分发 | PyInstaller | 易用、社区成熟 |
| 商业桌面应用 | Nuitka | 防破解 + 性能 |
| 嵌入式/启动敏感 | PyOxidizer | 启动快、资源嵌入 |
| 游戏/图形应用 | Nuitka + onedir | 性能 + 调试 |
| CI 自动构建 | PyInstaller | 工具链成熟 |
| 代码保护要求高 | Nuitka --module | 编译核心模块 |
| 混合方案 | Nuitka + PyInstaller | Nuitka 编译核心 + PyInstaller 打包外壳 |

### 八、原理深入

**PyOxidizer 为什么启动快**：传统 PyInstaller onefile 启动时要：解压 zip → 写临时文件 → 加载。PyOxidizer 把字节码作为 Rust 二进制的 \`.rodata\` 段，启动时**内存映射（mmap）**直接读取，零拷贝、零 IO。首次启动可快 5-10 倍。

**Nuitka 为什么能加速**：CPython 解释执行有大量开销（字节码分发、栈操作、对象引用计数）。Nuitka 把这部分编译为原生机器码，省去解释循环。但调用 CPython C API（如 \`list.append\`）仍是 CPython 实现，所以加速有限。真正性能瓶颈在 NumPy/C 扩展时，Nuitka 加速可忽略。

**Nuitka 的局限**：
- \`eval()\` / \`exec()\` 动态执行：仍走 CPython 解释器
- 极度依赖反射的库（如某些 ORM）：可能编译报错
- 编译时间长：大项目数十分钟，CI 需缓存

### 九、避坑提示

1. **PyOxidizer 学习曲线陡**：需懂 Rust/Starlark，文档不如 PyInstaller 丰富
2. **Nuitka 编译慢**：大项目 CI 需缓存编译产物
3. **Nuitka 动态特性**：\`eval\` 反射、元类黑魔法可能不支持
4. **跨平台**：必须在目标平台构建（无交叉编译，除非用 Docker + 多平台）
5. **C 扩展**：三方 C 扩展仍需对应平台预编译 wheel
6. **体积**：Nuitka 体积最大（含 C 代码 + 编译器产物），用 UPX 压缩
7. **杀毒误报**：数字签名是最有效解法
8. **调试困难**：Nuitka 编译后栈跟踪可能不直观，开发期用 \`--debug\`

### 十、最佳实践

1. **评估需求**：开源/内部工具优先 PyInstaller
2. **商业保护**：Nuitka 编译核心算法模块
3. **启动极致**：PyOxidizer 用于常驻/频繁启动场景
4. **混合策略**：Nuitka 编译性能/安全关键模块 + PyInstaller 打包外壳
5. **CI 矩阵**：win/mac/linux 三平台分别构建，缓存编译产物
6. **数字签名**：商业产品必须签名，否则 SmartScreen/Gatekeeper 拦截
7. **测试打包版**：开发环境正常 ≠ 打包后正常，必须实测
8. **版本管理**：固定 PyInstaller/Nuitka 版本，避免破坏性更新`,
    code: `# PyOxidizer 与 Nuitka 打包演示
import sys
import os
import time

print("=== PyOxidizer 与 Nuitka 打包演示 ===\\n")

print("--- 1. PyOxidizer 概述 ---")
print("  由 Rust 编写，用 pyembed crate 嵌入 Python 解释器")
print("  核心思想: 把 Python 字节码作为资源嵌入二进制")
print("  优势: 单文件、启动快、无需解压临时目录")
print("  适合: 高性能桌面应用、嵌入式场景")

print("\\n--- 2. Nuitka 概述 ---")
print("  把 Python 源码编译为 C 代码，再用 gcc/clang 编译")
print("  核心思想: 源码到 C 翻译，部分加速 + 完整打包")
print("  优势: 性能提升(5-30%)、防反编译、单文件")
print("  适合: 商业软件保护、CPU 密集场景")

print("\\n--- 3. 三种打包工具原理对比 ---")
print(f"  {'特性':<16} {'PyInstaller':<16} {'PyOxidizer':<16} {'Nuitka':<16}")
rows = [
    ("原理", "zip+引导", "Rust嵌入", "编译为C"),
    ("启动速度", "慢(onefile)", "快", "快"),
    ("运行性能", "原速", "原速", "提升5-30%"),
    ("体积", "中", "中", "大(含C)"),
    ("代码保护", "弱(可解包)", "中", "强(编译)"),
    ("依赖", "Python+zip", "Rust+Python", "C编译器"),
    ("调试难度", "低", "中", "高"),
]
for a, b, c, d in rows:
    print(f"  {a:<16} {b:<16} {c:<16} {d:<16}")

print("\\n--- 4. PyOxidizer 配置文件 ---")
pyoxidizer = '''# pyoxidizer.bzl - PyOxidizer 配置(Rust Starlark 语法)
def make_exe():
    dist = default_python_distribution()
    python_config = dist.make_python_interpreter_config()
    python_config.run_module = "myapp"
    exe = dist.to_python_executable(
        name="myapp",
        config=python_config,
    )
    exe.add_python_resources(exe.pip_install(["requests", "pyqt5"]))
    return exe

register_target("exe", make_exe)
resolve_targets()
'''
print(pyoxidizer)

print("--- 5. Nuitka 命令示例 ---")
nuitka = '''# 编译为单文件可执行
nuitka --onefile --enable-plugin=qt-plugins main.py

# 编译为目录(启动更快)
nuitka --standalone --follow-imports main.py

# 商业功能: 编译模块防反编译
nuitka --module --include-package=myapp myapp/

# 加速(实验性)
nuitka --lto=yes --jobs=4 main.py
'''
print(nuitka)

print("--- 6. 模拟打包后体积对比 ---")
base_size = 12
scenarios = [
    ("PyInstaller onefile", base_size + 35, "含解释器+解压器"),
    ("PyInstaller onedir", base_size + 30, "目录形式"),
    ("PyOxidizer", base_size + 28, "Rust嵌入+资源压缩"),
    ("Nuitka onefile", base_size + 50, "编译为C,体积最大"),
    ("Nuitka standalone", base_size + 45, "目录+C优化"),
]
print(f"  {'工具':<24} {'体积(MB)':<12} {'说明'}")
for name, size, desc in scenarios:
    bar = "#" * int(size / 3)
    print(f"  {name:<24} {size:<12} {bar} {desc}")

print("\\n--- 7. 启动时间模拟对比 ---")
def simulate_startup(name, delay):
    start = time.time()
    time.sleep(delay)
    elapsed = (time.time() - start) * 1000
    print(f"  {name:<24} 启动耗时: {elapsed:.0f}ms")

simulate_startup("PyInstaller onefile", 0.05)
simulate_startup("PyInstaller onedir", 0.02)
simulate_startup("PyOxidizer", 0.01)
simulate_startup("Nuitka onefile", 0.03)

print("\\n--- 8. 业务场景 ---")
scenarios = [
    ("开源工具分发", "PyInstaller(易用)"),
    ("商业桌面应用", "Nuitka(防破解+性能)"),
    ("嵌入式/启动敏感", "PyOxidizer(快)"),
    ("游戏/图形应用", "Nuitka + onedir"),
    ("CI 自动构建", "PyInstaller(成熟)"),
    ("代码保护要求高", "Nuitka --module 编译核心模块"),
]
for s, t in scenarios:
    print(f"  {s}: {t}")

print("\\n--- 9. 避坑提示 ---")
tips = [
    "PyOxidizer 学习曲线陡，需懂 Rust/Starlark 配置",
    "Nuitka 编译慢(大项目数十分钟)，CI 需缓存",
    "Nuitka 部分动态特性(eval 反射)可能不支持",
    "跨平台必须在目标平台构建(无交叉编译)",
    "三方 C 扩展仍需对应平台预编译",
    "体积优化: --exclude-module + UPX(PyInstaller)",
    "杀毒误报: 数字签名是最有效解法",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n--- 10. 选择建议 ---")
print("  小项目/快速分发 -> PyInstaller")
print("  商业/防破解 -> Nuitka")
print("  启动极致优化 -> PyOxidizer")
print("  混合方案: Nuitka 编译核心 + PyInstaller 打包外壳")

print("\\n=== PyOxidizer/Nuitka 演示结束 ===")`
  },
  {
    id: "py6-ffi-interop",
    group: "跨领域与工程化",
    icon: "🔌",
    title: "多语言互操作（ctypes/SIP/PyO3）",
    content: `## 多语言互操作（ctypes/SIP/PyO3）

### 一、为什么需要 FFI

Python 开发效率高，但性能不如 C/C++/Rust。FFI（Foreign Function Interface）让 Python 调用其他语言编写的库，实现：

- **复用成熟 C 库**：OpenSSL、zlib、libxml2、FFmpeg
- **性能关键路径**：把热点用 C/Rust 重写
- **访问硬件/系统 API**：libc、Win32、ioctls
- **跨语言团队协作**：核心算法用 Rust，业务用 Python

### 二、FFI 方案全景

| 方案 | 目标语言 | 特点 | 安装 |
|------|---------|------|------|
| ctypes | C | 标准库，无需编译，手动声明签名 | 内置 |
| cffi | C | 更 Pythonic，API/ABI 双模式 | pip install cffi |
| SIP | C++ | PyQt/PySide 绑定生成器 | pip install sip |
| PyO3 | Rust | Rust<->Python 双向调用 | cargo |
| pybind11 | C++ | Header-only，现代 C++ 绑定 | pip install pybind11 |
| Cython | C/C++ | Python 超集，可编译加速 | pip install cython |
| nanobind | C++ | pybind11 继任者，更小更快 | pip install nanobind |

### 三、ctypes 调用 C 库

\`\`\`python
import ctypes, ctypes.util

# 加载 libc
libc = ctypes.CDLL(ctypes.util.find_library("c"))

# 声明函数签名（不声明会用默认类型，可能段错误）
libc.strlen.argtypes = [ctypes.c_char_p]
libc.strlen.restype = ctypes.c_size_t

print(libc.strlen(b"hello"))  # 5
\`\`\`

ctypes 类型映射：

| ctypes | C | Python |
|--------|---|--------|
| c_int | int | int |
| c_double | double | float |
| c_char_p | char* | bytes |
| c_wchar_p | wchar_t* | str |
| c_void_p | void* | int/None |
| POINTER(c_int) | int* | int 指针 |

### 四、ctypes 高级：回调与结构体

\`\`\`python
# 回调函数：C 的 qsort 需要比较函数
CMPFUNC = ctypes.CFUNCTYPE(c_int, POINTER(c_int), POINTER(c_int))

def cmp(a, b):
    return a[0] - b[0]

arr = (c_int * 5)(5, 3, 1, 4, 2)
libc.qsort(arr, 5, sizeof(c_int), CMPFUNC(cmp))
print(list(arr))  # [1, 2, 3, 4, 5]
\`\`\`

### 五、cffi vs ctypes

\`\`\`python
from cffi import FFI
ffi = FFI()
ffi.cdef("size_t strlen(const char *s);")
C = ffi.dlopen(None)
print(C.strlen(b"hello"))  # 5
\`\`\`

| 特性 | ctypes | cffi |
|------|--------|------|
| 安装 | 标准库 | pip install |
| 签名声明 | 运行时手动 argtypes | 静态 cdef 字符串 |
| 性能 | 中 | API 模式接近原生 |
| C 宏/内联 | 不支持 | 部分支持 |
| ABI 稳定性 | 依赖平台 ABI | API 模式编译时确定 |
| 可读性 | 较差 | 接近 C 声明 |

cffi 适合**大量 C 函数声明**场景（如 pikepdf、cryptography 库内部用 cffi）；ctypes 适合**少量调用**或零依赖部署。

### 六、PyO3：Rust 与 Python 互操作

\`\`\`rust
// Cargo.toml: pyo3 = {version="0.20", features=["extension-module"]}
use pyo3::prelude::*;

#[pyfunction]
fn fib(n: u64) -> u64 {
    if n < 2 { return n; }
    let (mut a, mut b) = (0, 1);
    for _ in 0..n { let t = a + b; a = b; b = t; }
    a
}

#[pymodule]
fn myrust(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(fib, m)?)?;
    Ok(())
}
\`\`\`

\`\`\`python
import myrust
print(myrust.fib(50))  # 极快
\`\`\`

PyO3 优势：Rust 内存安全 + 零成本抽象，适合**性能 + 安全双重要求**场景，如密码学、解析器。知名项目：\`cryptography\` 库部分模块、\`polars\`、\`pydantic-core\`。

### 七、pybind11：C++ 与 Python

\`\`\`cpp
// example.cpp
#include <pybind11/pybind11.h>
namespace py = pybind11;

int add(int a, int b) { return a + b; }

PYBIND11_MODULE(example, m) {
    m.def("add", &add, "Add two numbers");
    m.def("mul", [](int a, int b){ return a * b; });
}
\`\`\`

编译命令：

\`\`\`bash
c++ -O3 -shared -std=c++17 -fPIC \\
    $(python3 -m pybind11 --includes) \\
    example.cpp -o example$(python3-config --extension-suffix)
\`\`\`

pybind11 适合**复用 C++ 库**（OpenCV、PyTorch 内部用 pybind11）。支持 STL 自动转换、面向对象、异常映射、Python GIL 管理。

### 八、SIP：PyQt 的秘密

SIP 是为 PyQt/PySide 设计的绑定生成器，从 .sip 描述文件生成 C++ 包装代码：

\`\`\`
// qt.sip
class QPushButton {
public:
    QPushButton(const QString &text);
    void setText(const QString &text);
};
\`\`\`

业务层很少直接用 SIP，但理解它有助于排查 PyQt 问题。

### 九、业务场景与选型

| 场景 | 推荐方案 |
|------|----------|
| 复用 C 库（openssl/zlib） | ctypes/cffi |
| 复用 C++ 库（OpenCV） | pybind11 |
| Qt 桌面应用 | SIP（PyQt） |
| 高性能计算 | Cython/Numba |
| Rust 安全性需求 | PyO3 |
| 零编译部署 | ctypes |
| 自动绑定生成 | cffi API / nanobind |

### 十、原理深入

**GIL 与 FFI**：ctypes 调用 C 函数时默认**持有 GIL**，C 函数中不能回调 Python（会死锁）。长时间运行的 C 任务应：
- C 侧用 \`PyEval_SaveThread\` 释放 GIL
- 或 Python 侧用 \`asyncio.to_thread\` / \`run_in_executor\` 包装

**ABI vs API**：
- ABI（Application Binary Interface）：直接调用编译好的 .so/.dll，依赖平台二进制兼容。ctypes/cffi ABI 模式属于此类，无需编译但平台敏感。
- API（Application Programming Interface）：根据 C 头文件编译包装代码，编译时确定类型。cffi API 模式、pybind11、PyO3 属于此类，需编译但更稳定。

**内存所有权**：跨语言内存管理是 FFI 最大坑。原则：**谁分配谁释放**。C 用 \`malloc\` 分配的内存，Python 不能直接 \`free\`，必须导出对应的释放函数或用 \`ffi.release()\`。

### 十一、避坑提示

1. ctypes 必须正确设 \`argtypes\`/\`restype\`，否则段错误
2. 字符串：C \`char*\` 用 \`c_char_p\`，传 bytes 而非 str
3. 内存管理：C 分配的内存 Python 不能直接 free，需导出释放函数
4. 跨平台：libc 名字不同（Linux \`libc.so.6\` / Windows \`msvcrt.dll\` / macOS libSystem）
5. GIL：长任务 C 调用要释放 GIL，否则阻塞事件循环
6. 结构体对齐：不同编译器默认 padding 不同，跨平台需 \`_pack_\`
7. 异常：C 错误需通过 errno/返回值手动检查，不会自动抛 Python 异常
8. 回调：CFUNCTYPE 创建的回调被 GC 后再调用会崩溃，需保持引用

### 十二、最佳实践

1. 少量调用用 ctypes，大量声明用 cffi
2. 复用 C++ 库用 pybind11/nanobind
3. 性能 + 安全用 PyO3
4. 统一在**一个 wrapper 模块**封装 FFI 调用，业务层不直接碰 ctypes
5. 用 \`__del__\` 或上下文管理器管理 C 资源生命周期
6. 写集成测试覆盖边界情况（NULL、空数组、超长字符串）
7. 文档化内存所有权约定
8. 性能基准测试：FFI 调用有微秒级开销，别在紧密循环里频繁调用`,
    code: `# 多语言互操作演示: ctypes / cffi / SIP / PyO3 / pybind11
import ctypes
import ctypes.util
import math

print("=== 多语言互操作演示 ===\\n")

print("--- 1. FFI 方案全景 ---")
print(f"  {'方案':<12} {'目标语言':<14} {'特点'}")
rows = [
    ("ctypes", "C", "标准库，无需编译，手动声明签名"),
    ("cffi", "C", "更Pythonic，API/ABI两种模式"),
    ("SIP", "C++", "PyQt/PySide 绑定生成器"),
    ("PyO3", "Rust", "Rust<->Python 双向调用"),
    ("pybind11", "C++", "Header-only，现代C++绑定"),
    ("Cython", "C/C++", "Python超集，可编译加速"),
]
for a, b, c in rows:
    print(f"  {a:<12} {b:<14} {c}")

print("\\n--- 2. ctypes 调用 libc ---")
libc_path = ctypes.util.find_library("c")
print(f"  libc 路径: {libc_path}")
libc = ctypes.CDLL(libc_path)

libc.strlen.argtypes = [ctypes.c_char_p]
libc.strlen.restype = ctypes.c_size_t
s = b"Hello, ctypes!"
print(f"  strlen('Hello, ctypes!') = {libc.strlen(s)}")

libc.abs.argtypes = [ctypes.c_int]
libc.abs.restype = ctypes.c_int
print(f"  abs(-42) = {libc.abs(-42)}")

libc.atoi.argtypes = [ctypes.c_char_p]
libc.atoi.restype = ctypes.c_int
print(f"  atoi('12345') = {libc.atoi(b'12345')}")

print("\\n--- 3. ctypes 调用数学函数 ---")
try:
    libc.sqrt.argtypes = [ctypes.c_double]
    libc.sqrt.restype = ctypes.c_double
    print(f"  sqrt(2.0) = {libc.sqrt(2.0):.6f}")
    libc.sin.argtypes = [ctypes.c_double]
    libc.sin.restype = ctypes.c_double
    print(f"  sin(pi/2) = {libc.sin(math.pi/2):.6f}")
except (AttributeError, OSError) as e:
    print(f"  数学函数不可用: {e}")

print("\\n--- 4. ctypes 定义回调函数 ---")
CMPFUNC = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int))

qsort_code = '''# C 的 qsort 需要回调比较函数
libc.qsort.argtypes = [
    ctypes.c_void_p,         # 数组指针
    ctypes.c_size_t,         # 元素个数
    ctypes.c_size_t,         # 元素大小
    CMPFUNC,                 # 比较回调
]

arr = (ctypes.c_int * 5)(5, 3, 1, 4, 2)
def cmp(a, b):
    return a[0] - b[0]
libc.qsort(arr, 5, ctypes.sizeof(ctypes.c_int), CMPFUNC(cmp))
print(list(arr))  # [1, 2, 3, 4, 5]
'''
print(qsort_code)
arr = [5, 3, 1, 4, 2]
print(f"  模拟 qsort 结果(sorted): {sorted(arr)}")

print("--- 5. cffi vs ctypes ---")
print(f"  {'特性':<16} {'ctypes':<24} {'cffi'}")
rows = [
    ("安装", "标准库内置", "pip install cffi"),
    ("签名声明", "运行时手动设 argtypes", "静态字符串声明"),
    ("性能", "中", "API模式接近原生"),
    ("C宏/内联", "不支持", "部分支持"),
    ("ABI稳定性", "依赖平台ABI", "API模式编译时确定"),
]
for a, b, c in rows:
    print(f"  {a:<16} {b:<24} {c}")

print("\\n--- 6. cffi 示例(伪代码) ---")
cffi_code = '''from cffi import FFI
ffi = FFI()
ffi.cdef("size_t strlen(const char *s);")
C = ffi.dlopen(None)
print(C.strlen(b"hello"))  # 5
'''
print(cffi_code)

print("--- 7. PyO3 (Rust <-> Python) ---")
pyo3_code = '''// Cargo.toml
// [lib] crate-type = ["cdylib"]
// [dependencies] pyo3 = {version="0.20", features=["extension-module"]}

use pyo3::prelude::*;

#[pyfunction]
fn fib(n: u64) -> u64 {
    if n < 2 { return n; }
    let (mut a, mut b) = (0, 1);
    for _ in 0..n { let t = a + b; a = b; b = t; }
    a
}

#[pymodule]
fn myrust(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(fib, m)?)?;
    Ok(())
}
# Python: import myrust; print(myrust.fib(50))
'''
print(pyo3_code)

print("--- 8. pybind11 (C++ <-> Python) ---")
pybind11_code = '''// example.cpp
#include <pybind11/pybind11.h>
namespace py = pybind11;

int add(int a, int b) { return a + b; }

PYBIND11_MODULE(example, m) {
    m.def("add", &add, "A function which adds two numbers");
}
# 编译: c++ -O3 -shared -std=c++17 -fPIC $(python3 -m pybind11 --includes)
#       example.cpp -o example$(python3-config --extension-suffix)
# Python: import example; print(example.add(2, 3))
'''
print(pybind11_code)

print("--- 9. 业务场景与选型 ---")
scenarios = [
    ("复用 C 库(openssl/zlib)", "ctypes/cffi"),
    ("复用 C++ 库(OpenCV)", "pybind11"),
    ("Qt 桌面应用", "SIP(PyQt)"),
    ("高性能计算", "Cython/Numba"),
    ("Rust 安全性需求", "PyO3"),
    ("零编译部署", "ctypes"),
]
for s, t in scenarios:
    print(f"  {s}: {t}")

print("\\n--- 10. 避坑提示 ---")
tips = [
    "ctypes 必须正确设 argtypes/restype，否则段错误",
    "GIL: ctypes 调用 C 时默认持 GIL，长任务用 PyEval_SaveThread",
    "内存管理: 谁分配谁释放，C 分配的内存 Python 不能直接 free",
    "跨平台: libc 名字不同(linux libc.so.6 / Windows msvcrt.dll)",
    "字符串: C char* 用 c_char_p，传 bytes 而非 str",
    "结构体对齐: ctypes 默认按 C 对齐，注意 padding",
    "异常: C 错误需通过 errno/返回值手动检查",
    "回调: CFUNCTYPE 创建的回调需保持引用，否则 GC 后崩溃",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== FFI 互操作演示结束 ===")`
  },
  {
    id: "py6-subprocess-advanced",
    group: "跨领域与工程化",
    icon: "⚙️",
    title: "subprocess 进阶与管道",
    content: `## subprocess 进阶与管道

### 一、为什么用 subprocess

Python 调用外部命令的场景无处不在：执行 ffmpeg 转码、git 操作、调用 shell 工具、CI 脚本拼接。Python 提供了多种方式，但**官方只推荐 \`subprocess\`**。

| 方式 | 推荐度 | 问题 |
|------|--------|------|
| \`os.system\` | ❌ 过时 | 只返回退出码，无法捕获输出，shell 注入风险 |
| \`os.popen\` | ❌ 过时 | 已被 subprocess 取代 |
| \`commands\` | ❌ Python3 移除 | - |
| \`subprocess\` | ✅ 官方推荐 | 功能完整、安全、灵活 |

### 二、subprocess.run 基础

\`\`\`python
import subprocess

# 基础调用
result = subprocess.run(["ls", "-l"], capture_output=True, text=True)
print(result.returncode)  # 退出码
print(result.stdout)       # 标准输出
print(result.stderr)       # 标准错误

# 失败抛异常
subprocess.run(["false"], check=True)  # CalledProcessError

# 超时
subprocess.run(["sleep", "10"], timeout=5)  # TimeoutExpired
\`\`\`

\`run()\` 是 Python 3.5+ 的高层 API，覆盖 90% 场景。参数：

- \`capture_output=True\`：等价于 \`stdout=PIPE, stderr=PIPE\`
- \`text=True\`（或 \`universal_newlines=True\`）：返回 str 而非 bytes
- \`check=True\`：非零退出码抛 \`CalledProcessError\`
- \`timeout=\`：超时抛 \`TimeoutExpired\` 并 kill 子进程
- \`input=\`：传入 stdin 字符串
- \`cwd=\`：工作目录
- \`env=\`：环境变量（默认继承）

### 三、subprocess vs os.system

| 特性 | os.system | subprocess |
|------|-----------|------------|
| 返回值 | 退出码 int | CompletedProcess 对象 |
| 输出捕获 | 需重定向文件 | capture_output 参数 |
| 超时 | 不支持 | timeout 参数 |
| 安全 | shell 注入风险 | 可避免 shell=True |
| 管道 | 困难 | Popen 灵活拼接 |
| 错误处理 | 弱 | check/异常 |
| 推荐度 | 已过时 | 官方推荐 |

### 四、Popen 与管道

\`run()\` 是阻塞的，需要**流式读输出**或**拼接管道**时用 \`Popen\`：

\`\`\`python
# 模拟 ls | grep
p1 = subprocess.Popen(["ls"], stdout=subprocess.PIPE)
p2 = subprocess.Popen(["grep", "py"], stdin=p1.stdout, stdout=subprocess.PIPE)
p1.stdout.close()  # 关键：允许 p1 收到 SIGPIPE
output = p2.communicate()[0]
\`\`\`

\`p1.stdout.close()\` 容易漏：如果 p2 比 p1 先退出，p1 写 stdout 会收到 SIGPIPE 而终止；不关闭则 p1 会一直写，可能阻塞。

### 五、异步实时输出

\`\`\`python
proc = subprocess.Popen(
    ["python", "-u", "long.py"],
    stdout=subprocess.PIPE, text=True, bufsize=1
)
for line in proc.stdout:
    print(line.strip())
proc.wait()
\`\`\`

- \`-u\` 或 \`PYTHONUNBUFFERED=1\`：禁用子进程缓冲，否则行不会实时输出
- \`bufsize=1\`：行缓冲
- 大输出**不要用 \`capture_output\`**，会全量缓存到内存

### 六、shell=True 的安全风险

\`\`\`python
# 危险！命令注入
user_input = "file.txt; rm -rf /"
subprocess.run(f"cat {user_input}", shell=True)  # 灾难

# 安全：列表形式，不经过 shell
subprocess.run(["cat", "file.txt; rm -rf /"])  # 当成文件名，安全
\`\`\`

\`shell=True\` 把字符串交给 \`/bin/sh -c\` 解析，会处理 \`;\` \`|\` \`$\` \`\\\`\` 等元字符。**绝不要把用户输入拼进 shell 字符串**。必须用 shell 时，用 \`shlex.quote\` 转义。

### 七、asyncio.subprocess

\`\`\`python
import asyncio

async def run_many():
    procs = []
    for i in range(10):
        p = await asyncio.create_subprocess_exec(
            "python", "task.py", str(i),
            stdout=asyncio.subprocess.PIPE
        )
        procs.append(p)
    # 并发等待
    results = await asyncio.gather(*[p.communicate() for p in procs])
\`\`\`

异步 subprocess 适合**大量并发外部命令**场景，如批量调用 API、并行构建。

### 八、业务场景

- **ffmpeg 转码**：\`subprocess.run + 超时\`，大文件流式读进度
- **CI 脚本拼接**：\`Popen\` 实现 \`cmd1 | grep | wc\`
- **执行 SQL 工具**：\`subprocess + stdin\` 传 SQL
- **启动守护进程**：\`Popen + start_new_session=True\` 脱离父进程
- **并行任务**：\`asyncio.subprocess\` 并发
- **调用 git/npm/docker**：\`subprocess + check=True\`
- **抓取系统信息**：\`uname\`、\`df\`、\`ps\`

### 九、原理深入

**fork/exec 与 subprocess**：Unix 下 \`subprocess\` 通过 \`fork()\` 创建子进程，\`exec()\` 加载新程序。Windows 下用 \`CreateProcess\`。Python 帮你处理了跨平台差异。

**为什么 capture_output 会死锁**：\`run()\` 内部用 \`communicate()\` 同时读 stdout/stderr，避免死锁。如果自己用 \`Popen\` + \`proc.stdout.read()\`，子进程 stderr 缓冲区写满后会阻塞，父进程又只读 stdout 不读 stderr → 死锁。**始终用 \`communicate()\`** 或开线程分别读。

**timeout 的实现**：\`timeout\` 用定时器触发 \`SIGKILL\`（Unix）/ \`TerminateProcess\`（Windows）。但只 kill 直接子进程，**孙子进程可能残留**。彻底清理用 \`start_new_session=True\`（Unix）创建进程组，kill 时用 \`os.killpg\`。

### 十、避坑提示

1. \`shell=True\` 是命令注入主因，能不用就不用
2. 大输出别用 \`capture_output\`，用 \`PIPE\` 流式读
3. Windows 下 path 含空格需列表形式而非字符串
4. \`timeout\` 仅 kill 主进程，子进程可能残留，用 \`process_group\`（Python 3.7+）
5. buffering：加 \`-u\` 或 \`PYTHONUNBUFFERED=1\` 避免输出延迟
6. 死锁：同时读 stdout/stderr 用 \`communicate()\`，勿自己读
7. 退出码：\`check=True\` 失败抛 \`CalledProcessError\`
8. 编码：\`text=True\` + \`encoding="utf-8"\` 显式指定，避免 Windows GBK 乱码
9. 环境变量：\`env={**os.environ, "KEY": "val"}\` 而非 \`env={"KEY": "val"}\`（会丢失 PATH）

### 十一、最佳实践

1. 永远用列表形式传参，避免 \`shell=True\`
2. 必须用 shell 时用 \`shlex.quote\` 转义用户输入
3. 用 \`check=True\` 让失败显式抛异常
4. 始终设 \`timeout\`，防止子进程挂死
5. 大输出用 \`Popen\` + \`communicate()\` 或流式读
6. 跨平台：用 \`shutil.which\` 找命令路径，避免硬编码
7. Windows 杀进程组：\`subprocess.run(..., creationflags=CREATE_NEW_PROCESS_GROUP)\`
8. Unix 杀进程组：\`start_new_session=True\` + \`os.killpg\`
9. 异步并发用 \`asyncio.subprocess\`，不要在 asyncio 里调阻塞的 \`run()\`
10. 日志：记录命令、参数、退出码、耗时，便于排查`,
    code: `# subprocess 进阶与管道演示
import subprocess
import sys
import os
import asyncio

print("=== subprocess 进阶与管道演示 ===\\n")

print("--- 1. subprocess vs os.system ---")
print(f"  {'特性':<16} {'os.system':<22} {'subprocess'}")
rows = [
    ("返回值", "退出码(int)", "CompletedProcess对象"),
    ("输出捕获", "需重定向文件", "capture_output参数"),
    ("超时", "不支持", "timeout参数"),
    ("安全", "shell注入风险", "可避免 shell=True"),
    ("管道", "困难", "Popen 灵活拼接"),
    ("推荐度", "已过时", "官方推荐"),
]
for a, b, c in rows:
    print(f"  {a:<16} {b:<22} {c}")

print("\\n--- 2. subprocess.run 基础 ---")
result = subprocess.run(
    [sys.executable, "-c", "print('hello from child')"],
    capture_output=True, text=True
)
print(f"  返回码: {result.returncode}")
print(f"  stdout: {result.stdout.strip()}")
print(f"  stderr: {result.stderr.strip()}")

print("\\n--- 3. capture_output 捕获输出 ---")
result = subprocess.run(
    [sys.executable, "-c", "import sys; print('to stdout'); print('to stderr', file=sys.stderr)"],
    capture_output=True, text=True
)
print(f"  stdout: {result.stdout.strip()}")
print(f"  stderr: {result.stderr.strip()}")

print("\\n--- 4. 超时与终止 ---")
try:
    result = subprocess.run(
        [sys.executable, "-c", "import time; time.sleep(5)"],
        timeout=1
    )
except subprocess.TimeoutExpired as e:
    print(f"  超时触发: {e}")
    print("  子进程会被自动 kill")

print("\\n--- 5. 管道拼接(模拟 ls | grep) ---")
p1 = subprocess.Popen(
    [sys.executable, "-c", "print('apple'); print('banana'); print('cherry')"],
    stdout=subprocess.PIPE, text=True
)
p2 = subprocess.Popen(
    [sys.executable, "-c", "import sys; [print(l.strip().upper()) for l in sys.stdin if 'a' in l]"],
    stdin=p1.stdout, stdout=subprocess.PIPE, text=True
)
p1.stdout.close()
output = p2.communicate()[0]
print(output.strip())

print("--- 6. stdin 输入传递 ---")
result = subprocess.run(
    [sys.executable, "-c", "import sys; data=sys.stdin.read(); print(f'收到:{len(data)}字符')"],
    input="Hello subprocess!", capture_output=True, text=True
)
print(f"  {result.stdout.strip()}")

print("\\n--- 7. shell=True 安全风险 ---")
danger = '''# 用户输入未过滤
user_input = "file.txt; rm -rf /"
subprocess.run(f"cat {user_input}", shell=True)  # 灾难!

# 安全做法: 用列表形式，不用 shell
subprocess.run(["cat", "file.txt; rm -rf /"])  # 当成文件名,安全
'''
print(danger)

print("--- 8. Popen 异步交互 ---")
proc = subprocess.Popen(
    [sys.executable, "-u", "-c",
     "for i in range(3): print(f'line {i}', flush=True); import time; time.sleep(0.1)"],
    stdout=subprocess.PIPE, text=True, bufsize=1
)
print("  实时输出:")
for line in proc.stdout:
    print(f"    {line.strip()}")
proc.wait()

print("\\n--- 9. 异步 subprocess (asyncio) ---")
async def run_async():
    proc = await asyncio.create_subprocess_exec(
        sys.executable, "-c", "print('async child')",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    print(f"  异步 stdout: {stdout.decode().strip()}")
    print(f"  异步返回码: {proc.returncode}")

asyncio.run(run_async())

print("\\n--- 10. 业务场景 ---")
scenarios = [
    ("调用 ffmpeg 转码", "subprocess.run + 超时"),
    ("CI 脚本拼接", "Popen 管道 | grep | wc"),
    ("执行 SQL 工具", "subprocess + stdin 传 SQL"),
    ("启动守护进程", "Popen + start_new_session"),
    ("并行任务", "asyncio.subprocess 并发"),
    ("调用 git/npm", "subprocess + check=True"),
]
for s, t in scenarios:
    print(f"  {s}: {t}")

print("\\n--- 11. 避坑提示 ---")
tips = [
    "shell=True 是命令注入主因，能不用就不用",
    "大输出别用 capture_output，会占内存，用 PIPE 流式读",
    "Windows 下 path 含空格需列表形式而非字符串",
    "timeout 仅 kill 主进程，子进程可能残留，用 process_group",
    "buffering: 加 -u 或 flush=True 避免输出延迟",
    "死锁: 同时读 stdout/stderr 用 communicate()，勿自己读",
    "退出码: check=True 失败抛 CalledProcessError",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== subprocess 演示结束 ===")`
  },
  {
    id: "py6-ctypes-struct",
    group: "跨领域与工程化",
    icon: "🏗️",
    title: "ctypes 与 C 结构体交互",
    content: `## ctypes 与 C 结构体交互

### 一、二进制数据交互的场景

Python 处理文本/JSON 很方便，但遇到**二进制协议**就需要直接操作字节：

- 网络协议：DNS、MQTT、TCP/UDP 包头
- 文件格式：BMP、PCAP、SQLite、WAV
- 硬件驱动：USB 描述符、串口帧
- 游戏/图形：OpenGL 顶点缓冲、纹理
- 跨语言 IPC：共享内存中的结构体

Python 标准库提供两套工具：
- \`struct\`：轻量打包/解包，适合一次性处理
- \`ctypes\`：完整 C 兼容层，可定义结构体、调用函数

### 二、struct 标准库

\`\`\`python
import struct

# 打包：H(unsigned short) B(unsigned char) B
header = struct.pack("<HBB", 0x1234, 8, 1)
# 解包
fields = struct.unpack("<HBB", header)

# 浮点
struct.pack("<f", 3.14)
struct.pack("<d", 3.14)  # double
\`\`\`

**格式字符**：

| 字符 | C 类型 | 大小 |
|------|--------|------|
| \`x\` | pad | 1 |
| \`c\` | char | 1 |
| \`b/B\` | signed/unsigned char | 1 |
| \`h/H\` | short/unsigned short | 2 |
| \`i/I\` | int/unsigned int | 4 |
| \`l/L\` | long/unsigned long | 4/8 |
| \`q/Q\` | long long | 8 |
| \`f\` | float | 4 |
| \`d\` | double | 8 |
| \`s\` | char[] | N |
| \`p\` | Pascal string | N |

**字节序前缀**：

| 前缀 | 字节序 | 对齐 |
|------|--------|------|
| \`@\` | 本机 | 本机对齐（默认） |
| \`=\` | 本机 | 无对齐 |
| \`<\` | 小端 | 无对齐 |
| \`>\` | 大端 | 无对齐 |
| \`!\` | 网络（大端） | 无对齐 |

> 💡 **避坑**：跨平台二进制协议**永远显式指定 \`<\` 或 \`>\`**，别用默认 \`@\`（本机对齐可能不同）。

### 三、ctypes.Structure

\`\`\`python
import ctypes

class Point(ctypes.Structure):
    _fields_ = [
        ("x", ctypes.c_int),
        ("y", ctypes.c_int),
    ]

p = Point(10, 20)
print(p.x, p.y)                       # 字段直接访问
print(ctypes.sizeof(Point))           # 8 字节
print(ctypes.addressof(p))            # 内存地址
\`\`\`

ctypes.Structure 是真正的 C 结构体内存布局，可：
- 直接传给 C 函数
- 用 \`string_at\` / \`memmove\` 操作内存
- 用 \`from_buffer_copy\` 从 bytes 构造

### 四、嵌套结构体与数组

\`\`\`python
class Triangle(ctypes.Structure):
    _fields_ = [
        ("points", Point * 3),          # 数组
        ("color", ctypes.c_uint32),
    ]

class Line(ctypes.Structure):
    _fields_ = [
        ("start", Point),               # 嵌套结构体
        ("end", Point),
    ]
\`\`\`

注意 \`Point * 3\` 是**类型**而非实例，定义数组类型；\`Point\` 直接当字段是嵌套结构体。

### 五、字节对齐 _pack_

C 编译器默认按成员类型对齐（如 uint32 对齐 4 字节），不同平台/编译器可能不同：

\`\`\`python
class Default(ctypes.Structure):
    _fields_ = [("a", c_uint8), ("b", c_uint32)]
# sizeof = 8 (a 后填充 3 字节)

class Packed(ctypes.Structure):
    _pack_ = 1                          # 1 字节对齐
    _fields_ = [("a", c_uint8), ("b", c_uint32)]
# sizeof = 5 (无填充)
\`\`\`

跨平台二进制协议**必须显式 \`_pack_ = 1\`**，避免对齐差异导致解析错误。

### 六、Union 联合体

\`\`\`python
class IntBytes(ctypes.Union):
    _fields_ = [
        ("i", ctypes.c_uint32),
        ("b", ctypes.c_ubyte * 4),
    ]

u = IntBytes()
u.i = 0x44332211
print(list(u.b))  # [0x11, 0x22, 0x33, 0x44] 小端
\`\`\`

Union 所有成员共享同一片内存，常用于：
- 观察字节序
- 类型双关（type punning）
- 硬件寄存器不同位域解读

### 七、ctypes vs struct

| 特性 | ctypes | struct |
|------|--------|--------|
| 定位 | C 兼容/FFI | 二进制打包 |
| 用法 | 类定义字段 | 格式串+元组 |
| 对齐控制 | \`_pack_\` | \`@/=<>!\` |
| 可变修改 | 字段直接赋值 | 需重新 pack |
| 性能 | 中 | 高（纯 C 实现） |
| 内存视图 | 支持地址操作 | 仅 bytes |
| 适用 | 频繁修改/调用 C | 一次性协议解析 |

经验：
- **协议解析**（DNS/TCP 包）：\`struct.unpack\` 简洁高效
- **频繁修改字段** 或 **传给 C 函数**：\`ctypes.Structure\`
- **混合**：ctypes 定义结构，用 \`string_at\` 转 bytes，再用 struct 解析

### 八、结构体与 bytes 互转

\`\`\`python
import struct, ctypes

# ctypes -> bytes
p = Point(0x1234, 0x5678)
raw = bytes(ctypes.string_at(ctypes.addressof(p), ctypes.sizeof(p)))

# bytes -> struct 解包
x, y = struct.unpack("<ii", raw)

# struct -> ctypes
data = struct.pack("<ii", 0xAABB, 0xCCDD)
p2 = Point.from_buffer_copy(data)
\`\`\`

### 九、业务场景

| 场景 | 工具 |
|------|------|
| DNS/MQTT 协议解析 | struct.pack/unpack |
| BMP/PCAP 文件头 | ctypes.Structure 映射 |
| TCP/UDP 包构造 | struct + 字节序 |
| USB 描述符/串口帧 | ctypes + Union |
| OpenGL 顶点缓冲 | ctypes 数组 |
| 跨语言 IPC | 结构体二进制 + 共享内存 |
| Modbus/CAN 总线 | struct + 位运算 |

### 十、原理深入

**C 结构体内存布局规则**：
1. 第一个成员在 offset 0
2. 每个成员按其类型对齐（如 uint32 对齐 4 字节边界）
3. 结构体总大小是其最大对齐倍数
4. \`#pragma pack(N)\` 限制最大对齐为 N

例如 \`struct {uint8 a; uint32 b;}\`：
- a 在 offset 0
- b 需对齐 4 → offset 4，offset 1-3 填充
- 总大小 8（4 的倍数）

**字节序（Endianness）**：
- 小端（Little Endian）：低位字节存低地址，x86/ARM 默认
- 大端（Big Endian）：高位字节存低地址，网络字节序、PowerPC
- \`0x12345678\` 小端：\`78 56 34 12\`，大端：\`12 34 56 78\`

**Union 共享内存原理**：Union 的所有成员共享同一片起始内存，大小等于最大成员。修改任一成员，其他成员"看到"的是同一片字节的不同解读。这让你能以整数写入、以字节数组读出，实现类型双关。

### 十一、避坑提示

1. x64 上指针是 8 字节，用 \`c_size_t\` 而非 \`c_int\`
2. 跨平台字节序：用 \`<\` \`>\` 显式指定，别用 \`@\` 默认
3. 结构体对齐：不同编译器默认不同，跨平台需 \`_pack_\`
4. 位域：ctypes 支持 \`_fields_\` 中 \`(name, type, bits)\`
5. 字符串：\`c_char_p\` 是指针，\`c_char * N\` 是固定数组
6. 嵌套数组：\`Point * 3\` 注意是类型不是实例
7. \`from_buffer_copy\` 内存对齐需一致
8. \`string_at\` 读越界会段错误，确保长度正确
9. 大端机器上写文件，小端机器读 → 全错（必须显式字节序）

### 十二、最佳实践

1. 跨平台二进制协议：\`_pack_ = 1\` + 显式 \`<\`/\`>\`
2. 频繁修改字段用 \`ctypes.Structure\`，一次性解析用 \`struct\`
3. 定义 \`__repr__\` 便于调试
4. 写单元测试覆盖边界（NULL、空数组、超长字符串）
5. 用 \`memoryview\` 零拷贝操作大缓冲区
6. 网络协议用 \`!\`（网络字节序）一致性最好
7. 文件格式解析先 \`mmap\` 再 \`from_buffer\`，零拷贝高效
8. 复杂协议考虑用 \`construct\` 库（声明式二进制解析）`,
    code: `# ctypes 与 C 结构体交互演示
import ctypes
import struct

print("=== ctypes 与 C 结构体交互演示 ===\\n")

print("--- 1. struct 标准库: 二进制打包 ---")
header = struct.pack("<HBB", 0x1234, 8, 1)
print(f"  打包 <HBB(0x1234,8,1): {header.hex()} 长度={len(header)}")
unpacked = struct.unpack("<HBB", header)
print(f"  解包: {unpacked}")

float_bin = struct.pack("<f", 3.14)
print(f"  打包 <f(3.14): {float_bin.hex()}")
print(f"  解包: {struct.unpack('<f', float_bin)[0]}")

print("\\n--- 2. 字节序对比 ---")
val = 0x12345678
print(f"  原值: 0x{val:08X}")
print(f"  小端 <I: {struct.pack('<I', val).hex()}")
print(f"  大端 >I: {struct.pack('>I', val).hex()}")
print(f"  网络 !I: {struct.pack('!I', val).hex()}")

print("\\n--- 3. struct.calcsize 与对齐 ---")
print(f"  '<HHI' 大小: {struct.calcsize('<HHI')} (无对齐填充)")
print(f"  'HHI' 大小:  {struct.calcsize('HHI')}  (默认对齐可能有填充)")
print(f"  '<3s' 大小:  {struct.calcsize('<3s')}  (3字节字符串)")

print("\\n--- 4. ctypes.Structure 定义结构体 ---")
class Point(ctypes.Structure):
    _fields_ = [
        ("x", ctypes.c_int),
        ("y", ctypes.c_int),
    ]

p = Point(10, 20)
print(f"  Point(x={p.x}, y={p.y})")
print(f"  sizeof(Point) = {ctypes.sizeof(Point)} bytes")
print(f"  内存: {bytes(ctypes.string_at(ctypes.addressof(p), ctypes.sizeof(Point))).hex()}")
p.x = 100
print(f"  修改后: Point(x={p.x}, y={p.y})")

print("\\n--- 5. 嵌套结构体与数组 ---")
class Triangle(ctypes.Structure):
    _fields_ = [
        ("points", Point * 3),
        ("color", ctypes.c_int),
    ]

t = Triangle()
t.points[0] = Point(0, 0)
t.points[1] = Point(3, 0)
t.points[2] = Point(0, 4)
t.color = 0xFF0000
print(f"  三角形顶点:")
for i, pt in enumerate(t.points):
    print(f"    [{i}] ({pt.x}, {pt.y})")
print(f"  颜色: 0x{t.color:06X}")
print(f"  sizeof(Triangle) = {ctypes.sizeof(Triangle)} bytes")

print("\\n--- 6. 字节对齐 _pack_ ---")
class Packed(ctypes.Structure):
    _pack_ = 1
    _fields_ = [
        ("a", ctypes.c_uint8),
        ("b", ctypes.c_uint32),
    ]

class Default(ctypes.Structure):
    _fields_ = [
        ("a", ctypes.c_uint8),
        ("b", ctypes.c_uint32),
    ]

print(f"  默认对齐 sizeof = {ctypes.sizeof(Default)} (8字节,3字节填充)")
print(f"  _pack_=1 sizeof = {ctypes.sizeof(Packed)} (5字节,无填充)")

print("\\n--- 7. 结构体与 struct 互转 ---")
p = Point(0x1234, 0x5678)
raw = bytes(ctypes.string_at(ctypes.addressof(p), ctypes.sizeof(p)))
print(f"  ctypes -> bytes: {raw.hex()}")
x, y = struct.unpack("<ii", raw)
print(f"  bytes -> struct: x=0x{x:X}, y=0x{y:X}")
data = struct.pack("<ii", 0xAABB, 0xCCDD)
p2 = Point.from_buffer_copy(data)
print(f"  struct -> ctypes: Point(x=0x{p2.x:X}, y=0x{p2.y:X})")

print("\\n--- 8. 联合体 Union ---")
class IntBytes(ctypes.Union):
    _fields_ = [
        ("i", ctypes.c_uint32),
        ("b", ctypes.c_ubyte * 4),
    ]

u = IntBytes()
u.i = 0x44332211
print(f"  整数 0x{u.i:08X} 的字节:")
print(f"    b[0]=0x{u.b[0]:02X} b[1]=0x{u.b[1]:02X} b[2]=0x{u.b[2]:02X} b[3]=0x{u.b[3]:02X}")
print("  联合体共享内存，可观察字节序")

print("\\n--- 9. 业务场景 ---")
scenarios = [
    ("二进制协议(MQTT/DNS)", "struct.pack/unpack"),
    ("文件格式(BMP/PCAP)", "ctypes.Structure 映射"),
    ("网络通信(TCP/UDP包)", "struct + 字节序"),
    ("硬件驱动(USB/串口)", "ctypes + Union"),
    ("游戏(顶点/材质)", "ctypes 数组 + OpenGL"),
    ("跨语言 IPC", "结构体二进制 + 共享内存"),
]
for s, t in scenarios:
    print(f"  {s}: {t}")

print("\\n--- 10. ctypes vs struct 对比 ---")
print(f"  {'特性':<16} {'ctypes':<24} {'struct'}")
rows = [
    ("定位", "C 兼容/FFI", "二进制打包"),
    ("用法", "类定义字段", "格式串+元组"),
    ("对齐控制", "_pack_", "@/=<>!"),
    ("可变修改", "字段直接赋值", "需重新 pack"),
    ("性能", "中", "高(纯C实现)"),
    ("内存视图", "支持地址操作", "仅 bytes"),
]
for a, b, c in rows:
    print(f"  {a:<16} {b:<24} {c}")

print("\\n--- 11. 避坑提示 ---")
tips = [
    "x64 上指针是 8 字节，用 c_size_t 而非 c_int",
    "跨平台字节序: 用 < > 显式指定，别用 @ 默认",
    "结构体对齐: 不同编译器默认不同，跨平台需 _pack_",
    "位域: ctypes 支持 _fields_ 中 (name, type, bits)",
    "字符串: c_char_p 是指针，c_char*N 是固定数组",
    "嵌套数组: Point * 3 注意是类型不是实例",
    "from_buffer_copy 内存对齐需一致",
]
for i, t in enumerate(tips, 1):
    print(f"  {i}. {t}")

print("\\n=== ctypes/struct 演示结束 ===")`
  },
  {
    id: "py6-async-arch",
    group: "跨领域与工程化",
    icon: "🏛️",
    title: "异步架构设计模式",
    content: `## 异步架构设计模式

### 一、同步架构 vs 异步架构

| 特性 | 同步（多线程） | 异步（asyncio） |
|------|---------------|-----------------|
| 并发单位 | 线程/进程 | 协程 |
| 切换成本 | 高（内核调度） | 低（用户态） |
| 内存占用 | MB 级/线程 | KB 级/协程 |
| 数量上限 | 千级 | 十万级 |
| IO 阻塞 | 线程阻塞 | 让出事件循环 |
| 共享状态 | 需加锁 | 单线程无需锁 |
| 调试 | 易 | 难（栈不直观） |
| CPU 密集 | 友好 | 不友好（需进程池） |

经验法则：
- **IO 密集**（网络/磁盘/数据库）→ asyncio
- **CPU 密集**（计算/加密/图像处理）→ multiprocessing
- **混合负载** → asyncio + 进程池（\`run_in_executor\`）

### 二、事件循环模式（Event Loop）

事件循环是 asyncio 的心脏：单线程不断轮询就绪任务，依次执行。

\`\`\`python
import asyncio

async def task(name, delay):
    await asyncio.sleep(delay)
    return name

async def main():
    # 并发执行，总耗时取最长（0.3s），而非累加（0.6s）
    results = await asyncio.gather(
        task("A", 0.3), task("B", 0.1), task("C", 0.2)
    )
\`\`\`

事件循环的本质是**单线程 + 任务队列 + IO 多路复用**（epoll/kqueue/IOCP）。协程遇到 \`await\` 让出控制权，循环调度其他就绪协程。

### 三、生产者-消费者模式

\`\`\`python
import asyncio

async def producer(queue, pid):
    for i in range(10):
        await queue.put(f"item-{pid}-{i}")
        await asyncio.sleep(0.1)
    await queue.put(None)  # 结束信号

async def consumer(queue, cid):
    while True:
        item = await queue.get()
        if item is None:
            break
        await process(item)
        queue.task_done()

async def main():
    q = asyncio.Queue(maxsize=5)  # 背压
    producers = [asyncio.create_task(producer(q, i)) for i in range(2)]
    consumers = [asyncio.create_task(consumer(q, i)) for i in range(3)]
    await asyncio.gather(*producers)
    await q.join()
\`\`\`

\`asyncio.Queue\` 自带异步阻塞，\`maxsize\` 提供**背压**（backpressure）防止生产者压垮消费者。

### 四、Reactor 反应器模式

\`\`\`python
class Reactor:
    def __init__(self):
        self.handlers = {}

    def register(self, event, handler):
        self.handlers[event] = handler

    def run(self, events):
        for event, data in events:
            handler = self.handlers.get(event)
            if handler:
                handler(data)
\`\`\`

Reactor 是**单线程事件分发器**：注册事件处理器，循环等待事件，派发给对应 handler。Linux 的 epoll、Nginx、Node.js、Redis 都是 Reactor 模式。asyncio 本质上就是一个 Reactor。

### 五、Actor 模型

\`\`\`python
class Actor:
    def __init__(self, name):
        self.name = name
        self.mailbox = asyncio.Queue()
        self.state = 0

    async def run(self):
        while True:
            msg = await self.mailbox.get()
            if msg[0] == "stop":
                break
            self.handle(msg)

    async def tell(self, msg):
        await self.mailbox.put(msg)
\`\`\`

Actor 模型特征：
- 每个 Actor 有独立状态，**不共享内存**
- 只能通过**异步消息**通信
- 消息按顺序处理
- 失败隔离（一个 Actor 崩溃不影响其他）

适合：游戏服务器（每个玩家一个 Actor）、分布式系统（Erlang/Akka）。Python 可用 \`pyactor\` 或自实现。

### 六、异步流水线（Pipeline）

\`\`\`python
async def stage(name, in_q, out_q, transform):
    while True:
        item = await in_q.get()
        if item is None:
            await out_q.put(None)
            break
        await out_q.put(transform(item))

async def main():
    q1, q2, q3 = asyncio.Queue(), asyncio.Queue(), asyncio.Queue()
    asyncio.create_task(stage("upper", q1, q2, str.upper))
    asyncio.create_task(stage("suffix", q2, q3, lambda x: x + "!"))
    asyncio.create_task(stage("log", q3, asyncio.Queue(), print))
    for w in ["hello", "world"]:
        await q1.put(w)
\`\`\`

流水线模式适合**流处理**：每个阶段并发执行，整体吞吐量提升。Elixir/Erlang 的 GenStage、Apache Flink、Kafka Streams 都用此模式。

### 七、限流器（Semaphore）

\`\`\`python
sem = asyncio.Semaphore(10)  # 最多 10 并发

async def fetch(url):
    async with sem:
        return await http_get(url)

await asyncio.gather(*[fetch(u) for u in urls])
\`\`\`

限流场景：
- 爬虫：避免触发反爬
- API 调用：尊重速率限制
- 数据库连接池
- 文件句柄

### 八、业务场景

| 场景 | 模式 | 理由 |
|------|------|------|
| IM 聊天服务器 | Event Loop + WebSocket | 百万连接 |
| 推送系统 | Event Loop + SSE | 长连接 |
| 流处理 | Pipeline | 多阶段并发 |
| 爬虫 | Semaphore + gather | 限速并发 |
| API 网关 | Reactor | 转发聚合 |
| 游戏服务器 | Actor | 玩家状态隔离 |
| 消息队列消费者 | 生产者-消费者 | 削峰填谷 |

### 九、原理深入

**协程为什么轻量**：线程切换需陷入内核（保存寄存器、TLB 刷新），约 1-10μs；协程切换在用户态保存/恢复栈帧，约 0.1μs。线程栈默认 8MB，协程栈按需增长（几 KB）。

**GIL 与 asyncio**：CPython 的 GIL 同一时刻只允许一个线程执行 Python 字节码。asyncio 单线程运行，GIL 对其无影响。但 CPU 密集任务即使 async 也卡住事件循环，必须用 \`asyncio.to_thread\`（Python 3.9+）或 \`run_in_executor\` 丢到线程池，或用多进程。

**背压（Backpressure）**：当生产者速度 > 消费者速度，无界队列会内存爆炸。\`asyncio.Queue(maxsize=N)\` 满了后 \`put\` 会阻塞，把背压传导给生产者。这是反应式编程的核心概念，避免系统在负载下崩溃。

**async/await 的本质**：\`async def\` 定义协程函数，调用返回协程对象（不立即执行）。\`await\` 把控制权还给事件循环，等待 Future 完成。事件循环驱动协程执行到下一个 \`await\` 或结束。

### 十、避坑提示

1. \`async\` 函数必须 \`await\`，否则只创建协程不执行（常见 bug）
2. 阻塞调用（\`time.sleep\`/\`requests.get\`）会卡死事件循环
3. 用 \`asyncio.to_thread\`/\`run_in_executor\` 跑阻塞任务
4. \`CancelledError\` 需正确处理，清理资源（如关闭连接）
5. 调试：\`asyncio.get_event_loop().set_debug(True)\`，或 \`PYTHONASYNCIODEBUG=1\`
6. GIL 对 asyncio 无影响（单线程），CPU 密集用多进程
7. 背压：\`Queue\` 设 \`maxsize\` 防止生产者压垮消费者
8. 不要在 async 函数里用 \`threading.Lock\`，用 \`asyncio.Lock\`
9. \`asyncio.run()\` 不要在已有事件循环里调用（会报错）
10. 任务异常不 await 会被吞，用 \`asyncio.gather(return_exceptions=True)\` 收集

### 十一、架构选型

- **IO 密集**（网络/磁盘）→ asyncio
- **CPU 密集**（计算）→ multiprocessing
- **混合负载** → asyncio + 进程池
- **简单脚本** → 同步即可，别为异步而异步
- **高并发长连接**（IM/推送）→ asyncio + uvloop（Linux 性能 2-4x）
- **分布式系统** → Actor 框架（如 \`pyactor\`）或消息队列

### 十二、最佳实践

1. 入口用 \`asyncio.run(main())\`，自动管理事件循环
2. 用 \`asyncio.gather\` 并发，\`asyncio.wait\` 控制更细
3. 长任务支持取消：定期检查 \`asyncio.current_task().cancelling()\`
4. 超时用 \`asyncio.wait_for\`，避免永远等待
5. 资源用 \`async with\`（连接池、锁）
6. 第三方库选 async 版本：\`httpx\` 替代 \`requests\`，\`aiomysql\` 替代 \`pymysql\`
7. uvloop（Linux）替代默认循环，性能提升 2-4 倍
8. 监控事件循环延迟：\`loop.time()\` 卡顿 > 100ms 报警
9. 测试用 \`pytest-asyncio\`
10. 生产用 \`uvicorn\`/\`hypercorn\` 等 ASGI 服务器`,
    code: `# 异步架构设计模式演示
import asyncio
import time

print("=== 异步架构设计模式演示 ===\\n")

print("--- 1. 同步 vs 异步架构 ---")
print(f"  {'特性':<16} {'同步(多线程)':<20} {'异步(asyncio)'}")
rows = [
    ("并发单位", "线程/进程", "协程"),
    ("切换成本", "高(内核调度)", "低(用户态)"),
    ("内存占用", "MB级/线程", "KB级/协程"),
    ("数量上限", "千级", "十万级"),
    ("IO阻塞", "线程阻塞", "让出事件循环"),
    ("共享状态", "需加锁", "单线程无需锁"),
    ("调试", "易", "难(栈不直观)"),
]
for a, b, c in rows:
    print(f"  {a:<16} {b:<20} {c}")

print("\\n--- 2. 事件循环模式(Event Loop) ---")
async def task(name, delay):
    await asyncio.sleep(delay)
    print(f"    [{name}] 完成, 耗时 {delay}s")
    return name

async def event_loop_demo():
    print("  并发执行 3 个任务:")
    start = time.time()
    results = await asyncio.gather(
        task("A", 0.3),
        task("B", 0.1),
        task("C", 0.2),
    )
    elapsed = time.time() - start
    print(f"  总耗时 {elapsed:.2f}s (并发,非 0.6s)")
    print(f"  结果顺序: {results}")

asyncio.run(event_loop_demo())

print("\\n--- 3. 生产者-消费者模式 ---")
async def producer(queue, pid):
    for i in range(3):
        item = f"P{pid}-{i}"
        await asyncio.sleep(0.05)
        await queue.put(item)
        print(f"    [生产者{pid}] 产出 {item}")
    await queue.put(None)

async def consumer(queue, cid):
    while True:
        item = await queue.get()
        if item is None:
            queue.task_done()
            break
        print(f"    [消费者{cid}] 处理 {item}")
        await asyncio.sleep(0.08)
        queue.task_done()

async def pc_demo():
    queue = asyncio.Queue(maxsize=5)
    producers = [asyncio.create_task(producer(queue, i)) for i in range(2)]
    consumers = [asyncio.create_task(consumer(queue, i)) for i in range(2)]
    await asyncio.gather(*producers)
    await queue.join()
    for c in consumers:
        c.cancel()

asyncio.run(pc_demo())

print("\\n--- 4. Reactor 反应器模式 ---")
class Reactor:
    """单线程事件分发器"""
    def __init__(self):
        self.handlers = {}
    def register(self, event, handler):
        self.handlers[event] = handler
    def run(self, events):
        for event, data in events:
            handler = self.handlers.get(event)
            if handler:
                print(f"    [Reactor] 派发 {event} -> {data}")
                handler(data)

def on_connect(addr): print(f"    -> 处理连接 {addr}")
def on_data(data): print(f"    -> 处理数据 {data}")
def on_close(conn): print(f"    -> 关闭连接 {conn}")

reactor = Reactor()
reactor.register("connect", on_connect)
reactor.register("data", on_data)
reactor.register("close", on_close)
events = [("connect", "1.2.3.4:5555"), ("data", "hello"), ("close", "conn1")]
reactor.run(events)

print("\\n--- 5. Actor 模型概念 ---")
class Actor:
    """Actor: 通过消息通信,各自独立状态"""
    def __init__(self, name):
        self.name = name
        self.mailbox = asyncio.Queue()
        self.state = 0
    async def run(self):
        while True:
            msg = await self.mailbox.get()
            if msg[0] == "stop":
                break
            self.handle(msg)
    def handle(self, msg):
        action, payload = msg
        if action == "add":
            self.state += payload
            print(f"    [{self.name}] state={self.state}")
        elif action == "get":
            print(f"    [{self.name}] report state={self.state}")
    async def tell(self, msg):
        await self.mailbox.put(msg)

async def actor_demo():
    a1 = Actor("A1")
    a2 = Actor("A2")
    runners = [asyncio.create_task(a1.run()), asyncio.create_task(a2.run())]
    await a1.tell(("add", 10))
    await a1.tell(("add", 5))
    await a1.tell(("get", None))
    await a2.tell(("add", 100))
    await a2.tell(("get", None))
    await a1.tell(("stop", None))
    await a2.tell(("stop", None))
    await asyncio.gather(*runners)

asyncio.run(actor_demo())

print("\\n--- 6. 异步流水线(Pipeline) ---")
async def stage(name, in_q, out_q, transform):
    while True:
        item = await in_q.get()
        if item is None:
            await out_q.put(None)
            break
        result = transform(item)
        print(f"    [{name}] {item} -> {result}")
        await out_q.put(result)

async def pipeline_demo():
    q1, q2, q3 = asyncio.Queue(), asyncio.Queue(), asyncio.Queue()
    s1 = asyncio.create_task(stage("ToUpper", q1, q2, lambda x: x.upper()))
    s2 = asyncio.create_task(stage("AddSuffix", q2, q3, lambda x: x + "!"))
    s3 = asyncio.create_task(stage("Log", q3, asyncio.Queue(), lambda x: f"<{x}>"))
    for w in ["hello", "world", "async"]:
        await q1.put(w)
    await q1.put(None)
    await asyncio.gather(s1, s2, s3)

asyncio.run(pipeline_demo())

print("\\n--- 7. 限流器(Semaphore) ---")
async def limited_task(sem, i):
    async with sem:
        print(f"    [任务{i}] 开始")
        await asyncio.sleep(0.1)
        print(f"    [任务{i}] 完成")

async def semaphore_demo():
    # 最多 3 个并发, 其余排队等待
    sem = asyncio.Semaphore(3)
    tasks = [asyncio.create_task(limited_task(sem, i)) for i in range(8)]
    await asyncio.gather(*tasks)
    print("  8 个任务, 并发上限 3, 全部完成")

asyncio.run(semaphore_demo())

print("\\n--- 8. 超时与取消 ---")
async def slow_task(name, delay):
    try:
        await asyncio.sleep(delay)
        return f"{name} 完成"
    except asyncio.CancelledError:
        return f"{name} 被取消"

async def timeout_demo():
    try:
        # wait_for 在超时后自动取消任务
        result = await asyncio.wait_for(slow_task("慢任务", 5), timeout=0.3)
        print(f"  结果: {result}")
    except asyncio.TimeoutError:
        print("  触发超时(0.3s), 任务已被取消")

asyncio.run(timeout_demo())

print("\\n--- 9. as_completed(按完成顺序处理) ---")
async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name}:{delay}s"

async def as_completed_demo():
    # 3 个任务, 延迟不同, 按完成顺序输出
    tasks = [fetch(f"T{i}", d) for i, d in enumerate([0.3, 0.1, 0.2], 1)]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"  最先完成: {result}")

asyncio.run(as_completed_demo())

print("\\n--- 10. 最佳实践总结 ---")
tips = [
    "入口用 asyncio.run(), 自动管理事件循环",
    "IO 密集用 asyncio, CPU 密集用 multiprocessing",
    "阻塞调用用 asyncio.to_thread() 包装, 避免卡死循环",
    "Queue 设 maxsize 实现背压, 防止内存爆炸",
    "Semaphore 限制并发数, 避免压垮下游服务",
    "wait_for() 加超时, 避免永久等待",
    "gather(return_exceptions=True) 收集异常, 防止吞错",
    "选 async 版库: httpx 替代 requests, aiomysql 替代 pymysql",
]
for i, tip in enumerate(tips, 1):
    print(f"  {i}. {tip}")

print("\\n=== 异步架构演示结束 ===")`,
  }
];
