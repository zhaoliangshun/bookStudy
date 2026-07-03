// =============================================================
// Python 网络编程教程（pynet）—— 第三批章节（HTTPS + WebSocket，共 5 章）
// -------------------------------------------------------------
// 本批讲解 HTTPS/TLS 加密通信与 WebSocket 实时通信。
// 包含以下章节：
//   HTTPS 组：
//     1. py-https-tls — HTTPS 与 TLS/SSL 原理
//     2. py-https-ssl — ssl 模块实战
//   WebSocket 组：
//     3. py-ws-basics  — WebSocket 协议基础
//     4. py-ws-client  — WebSocket 客户端实现
//     5. py-ws-server  — WebSocket 服务器实现
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束（非常重要！）：
//   - 用 python3 直接运行，5 秒超时，超时会被 kill
//   - 仅使用 Python 标准库
//   - 通过 print 输出结果
//   - 网络代码必须在 5 秒内完成，不能永久阻塞
// =============================================================

export const chapters = [

  // ============================================================
  // 第 1 章：HTTPS 与 TLS/SSL 原理
  // ============================================================
  {
    id: "py-https-tls",
    group: "HTTPS",
    icon: "🔒",
    title: "HTTPS 与 TLS/SSL 原理",
    content: `## 一、为什么这一章重要

当你打开网银、登录邮箱、调用支付接口，背后几乎全是 HTTPS。HTTPS 是互联网安全的基石——没有它，密码、Cookie、转账指令全在网络上裸奔，任何中间节点（路由器、运营商、咖啡店 Wi-Fi）都能窃听甚至篡改。**理解 HTTPS，就是理解现代 Web 安全的起点**。

很多人对 HTTPS 的认知停留在"HTTP 加个锁"，但面试官一追问"TLS 握手有几步""为什么用混合加密""证书链怎么验证"就答不上来。这一章会把 HTTPS 的来龙去脉讲透：TLS 在协议栈里的位置、握手流程、加密算法选型、证书机制，让你既能在面试中讲清楚，也能在线上遇到证书报错时知道排查方向。

### 二、HTTPS = HTTP + TLS/SSL

HTTPS 不是新协议，而是**把 HTTP 套进 TLS 加密隧道**。在协议栈里，TLS 插在 TCP 和 HTTP 之间：

\`\`\`
┌──────────────────────────────┐
│  应用层：HTTP（明文请求/响应） │
├──────────────────────────────┤
│  安全层：TLS / SSL（加密/认证）│   ← HTTPS 在这里加密
├──────────────────────────────┤
│  传输层：TCP（可靠字节流）     │
├──────────────────────────────┤
│  网络层：IP（路由转发）        │
└──────────────────────────────┘
\`\`\`

- **端口**：HTTP 默认 80，HTTPS 默认 443。
- **本质**：应用层完全不感知 TLS——HTTP 报文原封不动交给 TLS，TLS 加密后交给 TCP。对 HTTP 来说，TLS 是透明的。

所以"HTTPS"里的"S"就是 Secure，靠的就是中间这层 TLS。

### 三、TLS vs SSL：名字与历史

很多人混用 TLS 和 SSL，它们其实是同一条技术线的不同版本：

| 协议 | 年份 | 状态 | 说明 |
|------|------|------|------|
| SSL 1.0 | 1994 | 未发布 | 存在严重漏洞，从未公开 |
| SSL 2.0 | 1995 | 已废弃 | 2011 年起禁用 |
| SSL 3.0 | 1996 | 已废弃 | POODLE 攻击，2015 年禁用 |
| TLS 1.0 | 1999 | 已弃用 | 与 SSL 3.0 接近，2020 年起主流浏览器禁用 |
| TLS 1.1 | 2006 | 已弃用 | 同上，2020 年起禁用 |
| TLS 1.2 | 2008 | 当前主流 | 广泛部署，支持 AEAD 加密 |
| TLS 1.3 | 2018 | 最新 | 简化握手为 1-RTT，支持 0-RTT，移除弱算法 |

\`TLS\` 是 \`SSL\` 的继任者。从 TLS 1.0 起，IETF 接手了 Netscape 的 SSL 规范并改名。如今说"SSL 证书"其实是历史习惯，证书本身是 X.509 格式，与具体协议版本无关；新部署一律用 TLS 1.2/1.3。

**TLS 1.3 的关键改进**：
- 握手从 2-RTT 压缩到 1-RTT，重连可 0-RTT（数据随握手一起发）。
- 强制使用前向安全（PFS）的密钥交换（ECDHE）。
- 移除了 RSA 密钥交换、CBC 模式、MD5/SHA1 等不安全算法。
- 加密了大部分握手报文（连证书都加密传输）。

### 四、HTTPS 的三大安全目标

TLS 要解决三个问题，缺一不可：

#### 4.1 机密性（Confidentiality）—— 加密

让中间人看不到内容。用对称加密（AES/ChaCha20）加密应用数据，密钥只在通信双方手里，第三方拿到密文也解不开。

#### 4.2 完整性（Integrity）—— 防篡改

让中间人改了能被发现。每个记录带 MAC（消息认证码）或用 AEAD 模式（AES-GCM、ChaCha20-Poly1305），改一个比特校验就过不了。早期 TLS 1.2 用 MAC-then-Encrypt，有漏洞；TLS 1.3 强制 AEAD，完整性内置在加密里。

#### 4.3 身份认证（Authentication）—— 防冒充

让客户端确认连的是真服务器，不是钓鱼网站。靠**数字证书**：服务器出示由可信 CA 签名的证书，客户端用预装的 CA 根证书验证签名。这一步是 HTTPS 防"中间人攻击（MITM）"的关键。

三个目标合起来才安全：只加密不认证，中间人可以冒充服务器跟你加密通信，你以为是银行其实是骗子。

### 五、TLS 握手流程详解（TLS 1.2）

TLS 1.2 握手需要 2 个 RTT，流程如下：

\`\`\`
Client                                          Server
  |                                               |
  | ---- ClientHello ----------------------------> |  ①
  |   (支持的 TLS 版本、加密套件列表、客户端随机数)   |
  |                                               |
  | <--------------------------- ServerHello ---- |  ②
  |   (选定版本、选定加密套件、服务器随机数)          |
  | <----------------------------- Certificate -- |  ③ 服务器证书
  | <----------------------- ServerKeyExchange -- |  ④ 密钥交换参数
  | <---------------------- ServerHelloDone ---- |  ⑤
  |                                               |
  | ---- ClientKeyExchange ---------------------> |  ⑥ 客户端密钥交换参数
  | ---- ChangeCipherSpec ----------------------> |  ⑦ 切换到加密
  | ---- Finished (加密) -----------------------> |  ⑧ 验证握手完整
  |                                               |
  | <----------------------- ChangeCipherSpec -- |  ⑨ 服务器切换加密
  | <----------------------- Finished (加密) ---- |  ⑩
  |                                               |
  | <====== 后续应用数据用对称密钥加密传输 =======> |
\`\`\`

逐个解释：

1. **ClientHello**：客户端告诉服务器"我支持哪些版本、哪些加密套件、我的随机数 ClientRandom"。
2. **ServerHello**：服务器选定一个版本和加密套件，给出 ServerRandom。
3. **Certificate**：服务器把 X.509 证书链发给客户端。
4. **ServerKeyExchange**：密钥交换参数（如 DH/ECDHE 的公钥参数）。
5. **ServerHelloDone**：服务器说"我说完了"。
6. **ClientKeyExchange**：客户端给出自己的密钥交换参数。
7. **ChangeCipherSpec**：客户端通知"接下来发的内容都加密"。
8. **Finished**：客户端发的加密验证报文，包含整个握手的摘要，确保没被篡改。
9-10. 服务器同样切换加密并验证。

握手后，双方用 ClientRandom + ServerRandom + 密钥交换算出的 PreMaster，派生出对称会话密钥，之后用对称加密通信。

#### TLS 1.3 简化握手

TLS 1.3 把上面压缩到 1-RTT：ClientHello 直接带上密钥交换参数（KeyShare），服务器 ServerHello 也带 KeyShare，一轮往返就能算出密钥，Certificate 等都在加密后发送。

### 六、对称加密 vs 非对称加密

TLS 用**混合加密**——两种加密各取所长：

| 类型 | 算法 | 速度 | 用途 | 密钥关系 |
|------|------|------|------|----------|
| 非对称 | RSA、ECDHE、ECDSA | 慢（千倍级） | 握手、密钥交换、签名 | 公钥/私钥一对 |
| 对称 | AES、ChaCha20 | 快 | 应用数据传输 | 单一密钥 |

**为什么混合？** 非对称加密慢，不适合加密大量数据；但能安全地在公开信道协商出共享密钥。对称加密快，适合大数据，但双方要先有同一把密钥。所以 TLS 用非对称加密"安全地交换一把对称密钥"，再用对称密钥加密后续数据。

\`\`\`
握手阶段：非对称加密协商出对称密钥 K
传输阶段：用 K 对称加密所有 HTTP 报文
\`\`\`

**前向安全（PFS）**：如果用 RSA 密钥交换，服务器私钥一旦泄露，过去所有录制的流量都能被解密。改用 ECDHE（临时密钥交换），每次握手生成临时密钥，私钥泄露也解不开历史流量。TLS 1.3 强制 ECDHE，彻底杜绝这一风险。

### 七、数字证书与 CA 链

证书是身份认证的核心。问题是：客户端怎么相信服务器出示的证书是真的？

#### 7.1 证书的内容

X.509 证书包含：
- **主体（Subject）**：证书归属者，如 \`CN=www.example.com\`。
- **公钥**：服务器的公钥。
- **颁发者（Issuer）**：谁签发的这个证书。
- **有效期**：notBefore / notAfter。
- **签名**：CA 用私钥对证书内容的签名。

#### 7.2 CA 与信任链

CA（Certificate Authority，证书颁发机构）是受信任的第三方。操作系统/浏览器预装了一批根 CA 证书。验证链路：

\`\`\`
根 CA（自签名，预装在系统里）
   │ 签发
   ▼
中间 CA
   │ 签发
   ▼
网站证书（www.example.com）
\`\`\`

客户端验证时：用中间 CA 的公钥验证网站证书签名 → 用根 CA 的公钥验证中间 CA 证书签名 → 根 CA 是预装的，信任。这就是"证书链"。

#### 7.3 常见 CA 与证书类型

- **根 CA**：DigiCert、GlobalSign、Let's Encrypt（免费）。
- **DV（域名验证）**：只验证域名所有权，便宜，几分钟发。
- **OV（组织验证）**：验证公司身份，证书里含公司名。
- **EV（扩展验证）**：严格审查，浏览器曾显示绿色公司名。

### 八、加密套件（Cipher Suite）

加密套件是一组算法的组合，命名格式（TLS 1.2）：

\`\`\`
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
     │      │         │       │    │
     │      │         │       │    └─ PRF/哈希算法
     │      │         │       └────── 加密模式（AEAD）
     │      │         └────────────── 对称加密算法 + 密钥长度
     │      └────────────────────── 身份认证算法
     └─────────────────────────── 密钥交换算法
\`\`\`

TLS 1.3 简化了命名，如 \`TLS_AES_256_GCM_SHA384\`——因为密钥交换固定 ECDHE、认证固定证书，名字里不再写。

| 算法类别 | TLS 1.2 常见 | TLS 1.3 |
|----------|-------------|---------|
| 密钥交换 | ECDHE、RSA（已弱） | 仅 ECDHE |
| 认证 | RSA、ECDSA | RSA、ECDSA |
| 对称加密 | AES-CBC、AES-GCM、ChaCha20 | 仅 AEAD（AES-GCM、ChaCha20-Poly1305） |
| 哈希 | SHA256、SHA384 | SHA256、SHA384 |

### 九、HTTPS 端口与部署

- 端口 443 是 HTTPS 标准。
- 部署：服务器申请证书 → 配置到 Web 服务器（Nginx \`ssl_certificate\`）→ 监听 443。
- **HSTS**：响应头 \`Strict-Transport-Security: max-age=31536000\` 强制浏览器后续一律走 HTTPS，防降级攻击。
- **证书续期**：Let's Encrypt 证书 90 天过期，用 certbot 自动续期。

### 十、常见陷阱与排查

1. **证书过期**：浏览器报 \`NET::ERR_CERT_DATE_INVALID\`。及时续期。
2. **证书链不全**：少了中间证书，部分客户端报错。Nginx 要把中间证书拼到证书文件里。
3. **SNI 没配**：一个 IP 多域名时，服务器不知道该返回哪张证书。客户端 ClientHello 带 SNI（Server Name Indication）指明域名。
4. **协议版本不支持**：禁了 TLSv1.0 后，老客户端连不上。看 Nginx \`ssl_protocols\`。
5. **混合内容**：HTTPS 页面里引用 HTTP 资源，浏览器拦截。所有资源都要 HTTPS。
6. **自签证书**：测试用，浏览器报警。生产必须用受信 CA 签发的证书。

### 十一、面试要点

**Q1：HTTPS 和 HTTP 的区别？**
A：HTTPS = HTTP + TLS。HTTP 明文传输，端口 80；HTTPS 在 TCP 和 HTTP 之间加 TLS 加密层，端口 443。TLS 提供机密性（加密）、完整性（MAC/AEAD）、身份认证（证书）三大保障。

**Q2：TLS 握手过程？**
A：TLS 1.2：ClientHello（版本/套件/随机数）→ ServerHello（选定套件/随机数）→ Certificate（服务器证书）→ ServerKeyExchange → ServerHelloDone → ClientKeyExchange → ChangeCipherSpec → Finished（加密验证）→ 服务器同样切换。2-RTT。TLS 1.3 简化为 1-RTT，握手报文加密，强制 ECDHE 实现前向安全。

**Q3：为什么用混合加密？**
A：非对称加密慢但能安全协商密钥，对称加密快但需预先共享密钥。TLS 用非对称加密（ECDHE）在公开信道协商出对称会话密钥，再用对称密钥（AES/ChaCha20）加密应用数据，兼顾安全和性能。

**Q4：什么是前向安全？**
A：即使服务器长期私钥泄露，过去录制的流量也无法被解密。靠 ECDHE 临时密钥交换实现——每次握手生成一次性临时密钥，握手后丢弃。TLS 1.3 强制 ECDHE。

**Q5：浏览器如何验证证书？**
A：检查证书由受信 CA 签发（用预装根证书逐级验证签名链）、域名匹配（CN/SAN）、未过期、未被吊销（CRL/OCSP）。任一不过就报警。

### 十二、小结

- HTTPS = HTTP + TLS，TLS 在 TCP 和 HTTP 之间提供加密/认证。
- SSL 已废弃，现用 TLS 1.2（主流）/ 1.3（最新，1-RTT、强制前向安全）。
- TLS 三目标：机密性、完整性、身份认证。
- 混合加密：非对称协商密钥，对称加密数据。
- 证书链：根 CA → 中间 CA → 网站证书，靠签名逐级验证。
- 下一章用 Python 的 ssl 模块实战 TLS 编程。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第 1 章代码：HTTPS 与 TLS/SSL 原理演示
# ------------------------------------------------------------
# 演示内容（不真正握手，只做 ssl 模块自检与证书生成/解析）：
#   1. 查看 OpenSSL 版本与支持的 TLS 协议版本
#   2. 创建服务器/客户端 SSLContext，查看支持的加密套件
#   3. 用 subprocess 调 openssl 生成自签名证书
#   4. 解析证书字段（subject/issuer/有效期/版本）
# ============================================================
import ssl
import subprocess
import tempfile
import os

print("=" * 60)
print("1. OpenSSL 版本与协议支持")
print("=" * 60)
# ssl.OPENSSL_VERSION 显示当前 Python 链接的 OpenSSL/LibreSSL 版本
print("OPENSSL_VERSION :", ssl.OPENSSL_VERSION)
# ssl.HAS_TLSvN 表示是否支持某个 TLS 版本（编译期决定）
print("支持 TLS 1.2    :", ssl.HAS_TLSv1_2)
print("支持 TLS 1.3    :", ssl.HAS_TLSv1_3)

print("\\n" + "=" * 60)
print("2. SSLContext 与加密套件")
print("=" * 60)
# PROTOCOL_TLS_SERVER：用于服务器端，会自动选合适的协议版本
server_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
print("服务器 context 最低版本:", server_ctx.minimum_version)
print("服务器 context 最高版本:", server_ctx.maximum_version)

# PROTOCOL_TLS_CLIENT：用于客户端
client_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
# get_ciphers() 返回当前 context 允许的加密套件列表
ciphers = client_ctx.get_ciphers()
print("客户端 context 允许的加密套件数量:", len(ciphers))
print("前 3 个套件示例:")
for c in ciphers[:3]:
    print("  - %-40s 协议:%s" % (c["name"], c["protocol"]))

print("\\n" + "=" * 60)
print("3. 用 openssl 生成自签名证书")
print("=" * 60)
# 在临时目录生成 cert.pem + key.pem，避免污染当前目录
tmpdir = tempfile.mkdtemp(prefix="pynet_https_")
cert_path = os.path.join(tmpdir, "cert.pem")
key_path = os.path.join(tmpdir, "key.pem")
# openssl req -x509 生成自签名 X.509 证书
#   -newkey rsa:2048  生成 2048 位 RSA 新密钥
#   -nodes            不加密私钥（无密码）
#   -days 1           有效期 1 天
#   -subj /CN=localhost  证书主体（这里用 localhost）
cmd = [
    "openssl", "req", "-x509", "-newkey", "rsa:2048",
    "-keyout", key_path, "-out", cert_path,
    "-days", "1", "-nodes", "-subj", "/CN=localhost",
]
try:
    ret = subprocess.run(cmd, capture_output=True, timeout=5)
    if ret.returncode == 0:
        print("证书生成成功！")
        print("  cert.pem 大小:", os.path.getsize(cert_path), "bytes")
        print("  key.pem  大小:", os.path.getsize(key_path), "bytes")
    else:
        print("openssl 生成失败:", ret.stderr.decode()[:200])
        raise SystemExit(0)
except FileNotFoundError:
    print("系统未安装 openssl，跳过证书生成部分")
    raise SystemExit(0)

print("\\n" + "=" * 60)
print("4. 解析证书字段")
print("=" * 60)
# ssl._ssl._test_decode_cert 是标准库提供的证书解析工具（无需网络/握手）
# 返回一个字典，包含 subject/issuer/notAfter/version 等字段
try:
    cert_info = ssl._ssl._test_decode_cert(cert_path)
    print("subject (主体)  :", cert_info.get("subject"))
    print("issuer  (颁发者):", cert_info.get("issuer"))
    print("notAfter(过期)  :", cert_info.get("notAfter"))
    print("notBefore(生效):", cert_info.get("notBefore"))
    print("version (版本)  : X.509 v%d" % cert_info.get("version", 0))
    # 证书里的公钥算法
    print("subjectAltName  :", cert_info.get("subjectAltName", "(无)"))
except Exception as e:
    print("解析证书出错:", e)

# 再用 openssl x509 命令行验证一次（展示另一种解析途径）
print("\\n--- 用 openssl x509 命令解析 ---")
out = subprocess.run(
    ["openssl", "x509", "-in", cert_path, "-noout",
     "-subject", "-issuer", "-dates", "-serial"],
    capture_output=True, timeout=5
).stdout.decode()
print(out, end="")

print("=" * 60)
print("小结：ssl 模块能查看 OpenSSL 能力、配置 SSLContext、解析证书；")
print("真正握手要靠下一章的 wrap_socket + 证书加载。")
print("=" * 60)`,
  },

  // ============================================================
  // 第 2 章：ssl 模块实战
  // ============================================================
  {
    id: "py-https-ssl",
    group: "HTTPS",
    icon: "🛡️",
    title: "ssl 模块实战",
    content: `## 一、为什么这一章重要

上一章讲了 TLS 原理，这一章用 Python 标准库的 \`ssl\` 模块把原理跑起来。**ssl 模块是 Python 加密通信的入口**——它封装了 OpenSSL，让你能用几行代码给 socket 套上 TLS。

工作中你未必手写 SSL socket（多数时候用 requests、httpx，它们内部用 ssl），但理解 ssl 模块能让你：
- 排查证书报错（\`ssl.SSLCertVerificationError\` 到底验了什么）。
- 写需要双向 TLS（mTLS）的内部服务认证。
- 做需要自定义 CA 的 IoT、内网通信。
- 理解 requests 的 \`verify=False\`、\`cert=\` 参数背后在干嘛。

### 二、SSLContext：SSL 上下文

\`SSLContext\` 是 ssl 模块的核心对象，**管理证书、协议、加密套件等所有 SSL 配置**。推荐先建 context，再用 context 包装 socket，而不是直接用已废弃的 \`ssl.wrap_socket\`。

\`\`\`python
import ssl

# 服务器端 context
server_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
server_ctx.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

# 客户端 context
client_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
client_ctx.load_verify_locations(cafile="ca.pem")  # 加载受信 CA
\`\`\`

两个常用协议常量：

| 常量 | 用途 | 默认行为 |
|------|------|----------|
| \`PROTOCOL_TLS_SERVER\` | 服务器端 | 需加载证书；不验证对端 |
| \`PROTOCOL_TLS_CLIENT\` | 客户端 | 默认 CERT_REQUIRED + 验证主机名 |

### 三、服务器端 context

服务器要出示证书，所以必须加载证书链：

\`\`\`python
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# load_cert_chain：加载证书 + 私钥
# certfile 是证书（可含中间证书链），keyfile 是私钥
ctx.load_cert_chain("cert.pem", "key.pem")
# 可选：限制协议版本（推荐只开 1.2/1.3）
ctx.minimum_version = ssl.TLSVersion.TLSv1_2
# 可选：限制加密套件
ctx.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20")
\`\`\`

### 四、客户端 context 与证书验证

客户端要验证服务器证书，三个验证模式：

| 模式 | 行为 | 用途 |
|------|------|------|
| \`CERT_NONE\` | 不验证 | 仅测试（不安全） |
| \`CERT_OPTIONAL\` | 有证书才验证，没有也行 | 很少用 |
| \`CERT_REQUIRED\` | 必须有且验证通过 | 生产默认 |

\`\`\`python
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
# 方式一：加载特定 CA 文件
ctx.load_verify_locations(cafile="my_ca.pem")
# 方式二：加载系统预装的受信 CA（验证公网证书时用）
ctx.load_default_certs()
# 默认就是 CERT_REQUIRED + check_hostname=True
\`\`\`

\`PROTOCOL_TLS_CLIENT\` 默认 \`verify_mode=CERT_REQUIRED\` 且 \`check_hostname=True\`，最严格。这也是为什么自签证书默认连不上——CA 不在受信列表里。

### 五、包装 socket：wrap_socket

把普通 TCP socket 升级成 SSL socket：

\`\`\`python
# 服务器端
raw_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
raw_sock.bind(("0.0.0.0", 443))
raw_sock.listen(5)
conn, addr = raw_sock.accept()
# server_side=True 表示这是服务器端
ssl_sock = server_ctx.wrap_socket(conn, server_side=True)
# 之后 ssl_sock 就和普通 socket 一样用 recv/sendall

# 客户端
raw_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
raw_sock.connect(("example.com", 443))
# server_hostname 是 SNI，告诉服务器要访问哪个域名
ssl_sock = client_ctx.wrap_socket(raw_sock, server_hostname="example.com")
\`\`\`

#### SNI（Server Name Indication）

\`server_hostname\` 参数就是 SNI。一个 IP 托管多个 HTTPS 域名时，服务器在握手前不知道该返回哪张证书，客户端必须在 ClientHello 里通过 SNI 指明域名，服务器据此选对应证书。**客户端 wrap_socket 几乎总要带 \`server_hostname\`**，否则主机名验证也会失败。

### 六、SSLSocket 的常用方法

包装后的 \`SSLSocket\` 除了继承 socket 方法，还有：

| 方法 | 作用 |
|------|------|
| \`getpeercert()\` | 获取对端证书（dict），需验证模式非 CERT_NONE |
| \`version()\` | 协商出的 TLS 版本，如 \`TLSv1.3\` |
| \`cipher()\` | 协商出的加密套件，返回 (name, version, bits) |
| \`get_channel_binding("tls-unique")\` | 通道绑定（高级安全） |
| \`compression()\` | 协商的压缩算法（一般 None） |

\`\`\`python
print(ssl_sock.version())        # TLSv1.3
print(ssl_sock.cipher())         # ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256)
print(ssl_sock.getpeercert())    # {'subject': ((('commonName','x.com'),),), ...}
\`\`\`

### 七、自签名证书的处理

测试内网或本地时常用自签证书。客户端默认会拒绝（CA 不受信）。三种处理：

1. **关闭验证（仅测试）**：\`ctx.check_hostname = False\` + \`ctx.verify_mode = ssl.CERT_NONE\`。
2. **加载自签 CA**：把自签证书当 CA 加载：\`ctx.load_verify_locations(cafile="self.pem")\`，然后正常验证。
3. **生产**：用受信 CA（如 Let's Encrypt）签发证书。

\`\`\`python
# 测试时关闭验证（仅本地！生产别这么做）
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
\`\`\`

### 八、HTTPS 客户端：urllib + ssl context

标准库 \`urllib.request\` 可以传 SSL context：

\`\`\`python
import urllib.request
ctx = ssl.create_default_context()        # 默认严格验证
# ctx.check_hostname = False              # 测试时关
# ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://example.com")
resp = urllib.request.urlopen(req, context=ctx)
print(resp.read().decode()[:200])
\`\`\`

\`ssl.create_default_context()\` 一行创建严格验证的客户端 context（加载系统 CA、CERT_REQUIRED、check_hostname），是日常首选。

### 九、安全检查清单

- 证书是否过期（\`notAfter\`）。
- 主机名是否匹配证书的 CN/SAN（\`check_hostname=True\` 自动做）。
- 证书是否由受信 CA 签发（验证链）。
- 证书是否被吊销（OCSP/CRL，标准库不自动做，需第三方）。
- 协议版本是否够新（禁用 TLS 1.0/1.1）。
- 加密套件是否够强（禁用 RC4/3DES/CBC）。

### 十、双向 TLS（mTLS）

普通 HTTPS 只验证服务器。mTLS 让服务器也验证客户端证书，用于内部服务强认证：

\`\`\`python
# 服务器端额外要求客户端证书
server_ctx.verify_mode = ssl.CERT_REQUIRED
server_ctx.load_verify_locations(cafile="client_ca.pem")

# 客户端出示自己的证书
client_ctx.load_cert_chain("client_cert.pem", "client_key.pem")
\`\`\`

### 十一、面试要点

**Q1：ssl.SSLContext 的作用？为什么不用 wrap_socket？**
A：SSLContext 集中管理证书、协议、加密套件等配置，可复用。旧的 \`ssl.wrap_socket\` 每次调用都要重新加载配置，效率低且已废弃。正确做法：建一个 context，多次 wrap_socket 复用。

**Q2：客户端如何验证服务器证书？**
A：\`PROTOCOL_TLS_CLIENT\` 默认 \`CERT_REQUIRED\` + \`check_hostname=True\`：加载系统/指定 CA，用 CA 公钥验证证书签名链，比对证书 CN/SAN 与连接的主机名，检查有效期。任一失败抛 \`SSLCertVerificationError\`。

**Q3：自签证书怎么连？**
A：测试可关验证（CERT_NONE + check_hostname=False）；正规做法是把自签证书作为 CA 加载（load_verify_locations），然后正常验证。生产应用受信 CA 签发的证书。

**Q4：SNI 是什么？为什么客户端要带 server_hostname？**
A：SNI 让客户端在 ClientHello 里告知目标域名，使一个 IP 多域名的服务器能选对证书。Python 客户端 wrap_socket 时传 server_hostname 既设 SNI 又触发主机名验证，几乎必传。

### 十一补、会话恢复与性能优化

完整 TLS 握手要 2 个 RTT（TLS 1.2）或 1 个 RTT（TLS 1.3），对短连接和高延迟链路开销明显。**会话恢复（Session Resumption）** 让重连跳过完整握手，省一个 RTT，是 TLS 性能优化的关键。

两种恢复机制：

| 机制 | 原理 | Python 支持 |
|------|------|-------------|
| Session ID | 服务器给客户端一个会话 ID，重连时带 ID，服务器查缓存恢复 | \`SSLSession\`（部分版本） |
| Session Ticket | 服务器把会话用密钥加密成 ticket 发给客户端，重连带回 | TLS 1.3 内建 |

TLS 1.3 还支持 **0-RTT**：客户端重连时把应用数据随 ClientHello 一起发，服务器秒回。但有**重放攻击风险**，只适合幂等请求。

\`\`\`python
# 客户端复用 session（概念示例）
ctx = ssl.create_default_context()
# 第一次握手后，session 缓存在 context 里
sock1 = ctx.wrap_socket(raw1, server_hostname="x.com")
session = sock1.session     # 取出会话对象
# 第二次连接复用
ctx2 = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ctx2.session = session      # 设置会话，重连走恢复流程
sock2 = ctx2.wrap_socket(raw2, server_hostname="x.com")
\`\`\`

#### 常见报错与排查

\`\`\`
ssl.SSLCertVerificationError:
  [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed:
  unable to get local issuer certificate (_ssl.c:xxxx)
\`\`\`

这是最常见错误，含义是**证书链找不到签发的 CA**。排查方向：

1. **缺中间证书**：服务器只发了网站证书没发中间证书。Nginx \`ssl_certificate\` 要把中间证书拼在网站证书后面。
2. **系统 CA 库过旧**：客户端系统没装最新 CA。macOS 用 \`Install Certificates.command\`，Linux 装 \`ca-certificates\`。
3. **自签证书**：CA 不受信。测试用 \`CERT_NONE\`，或把自签证书加入受信。
4. **主机名不匹配**：证书是 \`a.com\` 你连 \`b.com\`。检查证书 SAN 是否覆盖访问的域名。
5. **证书过期**：\`notAfter\` 已过。续期证书。

\`\`\`python
# 捕获并打印详细验证错误
try:
    ssl_sock = ctx.wrap_socket(raw, server_hostname="x.com")
except ssl.SSLCertVerificationError as e:
    print("验证失败:", e.verify_message)   # 具体原因
    print("证书码:", e.verify_code)
\`\`\`

#### 性能要点

- **连接复用**：HTTPS 长连接（Keep-Alive）复用 TLS 会话，避免反复握手。HTTP/2 + 连接复用是性能标配。
- **OCSP Stapling**：服务器把证书吊销状态（OCSP 响应）随握手一起发给客户端，省去客户端单独查询 OCSP 的一轮 RTT。Nginx 配 \`ssl_stapling on\`。
- **禁用弱套件**：\`ctx.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20")\` 只留强套件，既安全又避免协商到慢算法。
- **会话缓存**：服务器侧开 session cache（Nginx \`ssl_session_cache shared:SSL:10m\`），重连秒恢复。

### 十二、小结

- SSLContext 管理所有 SSL 配置，先建 context 再 wrap_socket。
- 服务器 context 加载证书；客户端 context 加载 CA 做验证。
- 三种验证模式：CERT_NONE（不验）、CERT_OPTIONAL、CERT_REQUIRED（默认）。
- wrap_socket 后的 SSLSocket 可查 version()/cipher()/getpeercert()。
- 自签证书测试时关验证，生产用受信 CA。
- 下一章进入 WebSocket，看实时双向通信协议。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第 2 章代码：ssl 模块实战（SSL echo 服务器 + 客户端）
# ------------------------------------------------------------
# 演示内容：
#   1. 用 openssl 生成自签名证书（cert.pem + key.pem 到临时目录）
#   2. 在子线程启动 SSL TCP echo 服务器
#   3. 主线程用 SSL 客户端连接，演示加密通信
#   4. 打印协商的 TLS 版本、加密套件、对端证书
# 若 openssl 不可用，则降级为只演示 SSLContext 配置（不真正握手）
# ============================================================
import ssl
import socket
import threading
import subprocess
import tempfile
import os
import time

# ---------- 第 1 步：生成自签名证书 ----------
tmpdir = tempfile.mkdtemp(prefix="pynet_ssl_")
cert_path = os.path.join(tmpdir, "cert.pem")
key_path = os.path.join(tmpdir, "key.pem")
cmd = ["openssl", "req", "-x509", "-newkey", "rsa:2048",
       "-keyout", key_path, "-out", cert_path, "-days", "1", "-nodes",
       "-subj", "/CN=localhost"]
try:
    ret = subprocess.run(cmd, capture_output=True, timeout=5)
    have_cert = (ret.returncode == 0)
except FileNotFoundError:
    have_cert = False

if not have_cert:
    # 降级路径：openssl 不可用，只演示 SSLContext 配置
    print("[降级] openssl 不可用，仅演示 SSLContext 配置")
    sctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    print("服务器 context 创建成功，协议范围:", sctx.minimum_version, "~", sctx.maximum_version)
    cctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    print("客户端 context 默认验证模式:", cctx.verify_mode == ssl.CERT_REQUIRED)
    print("客户端 context 默认校验主机名:", cctx.check_hostname)
    print("（无证书文件，跳过真实握手演示）")
    raise SystemExit(0)

print("证书已生成: %s" % cert_path)

# ---------- 第 2 步：SSL echo 服务器（子线程） ----------
def ssl_echo_server(cert, key, ready_evt):
    # 服务器 context：加载证书
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(cert, key)
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))   # 端口 0 让系统分配
    srv.listen(1)
    srv.settimeout(3.0)          # 防止永久阻塞
    ready_evt.port = srv.getsockname()[1]
    ready_evt.set()              # 通知主线程可以连接了
    try:
        conn, addr = srv.accept()
        try:
            # server_side=True 包装成 SSL socket
            ssock = ctx.wrap_socket(conn, server_side=True)
            try:
                # echo 循环：收到什么回什么，收到 "bye" 结束
                while True:
                    data = ssock.recv(1024)
                    if not data or data.strip() == b"bye":
                        ssock.sendall(b"goodbye")
                        break
                    ssock.sendall(b"SSL-ECHO>" + data)
            finally:
                ssock.close()
        except ssl.SSLError as e:
            print("[SERVER] SSL 错误:", e)
    except socket.timeout:
        print("[SERVER] 等待连接超时")
    finally:
        srv.close()

ready = threading.Event()
t = threading.Thread(target=ssl_echo_server, args=(cert_path, key_path, ready),
                     daemon=True)
t.start()
ready.wait(3.0)
server_port = ready.port
time.sleep(0.1)  # 确保服务器进入 accept

print("=" * 60)
print("SSL echo 服务器已就绪：127.0.0.1:%d" % server_port)
print("=" * 60)

# ---------- 第 3 步：SSL 客户端（主线程） ----------
# 客户端 context：自签证书，关闭验证（仅本地测试！）
client_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
client_ctx.check_hostname = False          # 自签证书不验证主机名
client_ctx.verify_mode = ssl.CERT_NONE     # 不验证证书链（测试用）

raw = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
raw.settimeout(3.0)
raw.connect(("127.0.0.1", server_port))
# wrap_socket 时带 server_hostname 设置 SNI
ssl_sock = client_ctx.wrap_socket(raw, server_hostname="localhost")

# 打印协商结果
print("协商 TLS 版本  :", ssl_sock.version())
print("协商加密套件   :", ssl_sock.cipher()[0])
print("加密强度(位)   :", ssl_sock.cipher()[2])
# 因为 CERT_NONE，getpeercert() 返回空字典
print("对端证书(CERT_NONE 下为空):", ssl_sock.getpeercert())

# 加密通信演示
print("\\n--- 加密通信 ---")
for msg in ["Hello SSL", "加密通道测试", "bye"]:
    ssl_sock.sendall(msg.encode("utf-8"))
    resp = ssl_sock.recv(1024)
    print("发送:%-16s -> 收到:%s" % (msg, resp.decode("utf-8")))

ssl_sock.close()
t.join(2.0)

print("\\n" + "=" * 60)
print("小结：")
print("  1. SSLContext(PROTOCOL_TLS_SERVER) + load_cert_chain 建服务器")
print("  2. SSLContext(PROTOCOL_TLS_CLIENT) + CERT_NONE 处理自签证书")
print("  3. wrap_socket(server_hostname=...) 设置 SNI 并升级为加密 socket")
print("  4. version()/cipher()/getpeercert() 查看协商结果")
print("  5. 生产环境应使用受信 CA 签发的证书，并保持 CERT_REQUIRED")
print("=" * 60)`,
  },

  // ============================================================
  // 第 3 章：WebSocket 协议基础
  // ============================================================
  {
    id: "py-ws-basics",
    group: "WebSocket",
    icon: "📊",
    title: "WebSocket 协议基础",
    content: `## 一、为什么这一章重要

HTTP 是一问一答的——客户端发请求，服务器回响应，连接就结束。这种模型对"看网页"够用，但对**实时场景**很别扭：聊天室的消息要即时推送、股票行情要持续更新、在线协作要同步编辑。用 HTTP 模拟实时，只能让客户端不停地"轮询"（每隔几秒问一次"有新消息吗"），既浪费带宽又有延迟。

**WebSocket** 就是为解决这个问题而生的全双工、持久化通信协议（RFC 6455）。它在一条 TCP 连接上让服务器能**主动推送**数据给客户端，延迟低、开销小。这一章讲清 WebSocket 的协议设计：连接怎么建立、帧怎么编码、握手怎么算。理解了这些，下一章手写客户端、服务器就水到渠成。

### 二、WebSocket vs HTTP

| 维度 | HTTP | WebSocket |
|------|------|-----------|
| 通信模型 | 请求-响应（单向） | 全双工（双向） |
| 连接生命周期 | 短连接（默认） | 持久长连接 |
| 谁能主动发 | 客户端 | 双方都能 |
| 协议头开销 | 每次请求带完整头 | 握手后帧头很小（2-14 字节） |
| 端口 | 80 / 443 | 复用 80 / 443 |
| 协议前缀 | http:// / https:// | ws:// / wss:// |

WebSocket 不是凭空起的新连接，而是**借 HTTP 完成握手，然后"升级"成 WebSocket 协议**。所以它复用 80/443 端口，能穿透大多数防火墙。

\`\`\`
ws://   ← 明文 WebSocket（对应 HTTP）
wss://  ← 加密 WebSocket（对应 HTTPS，套 TLS）
\`\`\`

### 三、连接建立流程

WebSocket 分两个阶段：

\`\`\`
阶段一：HTTP 握手（Upgrade）
   客户端 --HTTP Upgrade 请求--> 服务器
   客户端 <--101 Switching Protocols-- 服务器

阶段二：WebSocket 帧通信
   双方用 WebSocket 帧格式双向收发
\`\`\`

关键在于：握手用 HTTP，握手成功后这条 TCP 连接不再说 HTTP，改说 WebSocket 帧。

### 四、握手请求

客户端发一个特殊的 HTTP 请求，请求"升级"协议：

\`\`\`http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
\`\`\`

逐行解释：
- \`Upgrade: websocket\` + \`Connection: Upgrade\`：声明要升级协议到 WebSocket。
- \`Sec-WebSocket-Key\`：客户端生成的随机 16 字节，base64 编码。让服务器证明"我懂 WebSocket"。
- \`Sec-WebSocket-Version: 13\`：协议版本（13 是 RFC 6455 的最终版本号）。
- \`Origin\`：浏览器来源，服务器可据此做跨域控制。

### 五、握手响应

服务器同意升级，返回 101：

\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

状态码 \`101 Switching Protocols\` 表示"协议切换成功"。\`Sec-WebSocket-Accept\` 是服务器对客户端 Key 的"应答"，证明服务器真的理解 WebSocket（而不是把请求当普通 HTTP 处理）。

### 六、Sec-WebSocket-Accept 的计算

这是握手的核心算法，RFC 6455 规定：

1. 取客户端的 \`Sec-WebSocket-Key\`。
2. 拼上一个固定的"魔法字符串" \`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\`。
3. 对拼接结果做 SHA-1 哈希。
4. 把哈希做 Base64 编码，得到 \`Sec-WebSocket-Accept\`。

\`\`\`
Accept = Base64( SHA1( Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" ) )
\`\`\`

用 Python 实现：

\`\`\`python
import hashlib, base64
GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
def compute_accept(key):
    sha1 = hashlib.sha1((key + GUID).encode()).digest()
    return base64.b64encode(sha1).decode()

# 验证 RFC 示例
assert compute_accept("dGhlIHNhbXBsZSBub25jZQ==") == "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
\`\`\`

那个魔法字符串是 RFC 写死的全局常量，所有实现都一样。它的作用纯粹是"防呆"——让服务器必须做这个特定计算，避免误把普通 HTTP 请求当成 WebSocket。

### 七、WebSocket 帧格式

握手之后，双方用**帧（Frame）**通信。帧格式（RFC 6455 5.2）：

\`\`\`
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
\`\`\`

逐字段：

| 字段 | 位数 | 含义 |
|------|------|------|
| FIN | 1 | 是否最后一帧（消息可分片） |
| RSV1-3 | 3 | 保留位，扩展用（默认 0） |
| Opcode | 4 | 帧类型 |
| MASK | 1 | payload 是否被掩码 |
| Payload len | 7 | 长度（0-125 直接；126 后跟 16 位；127 后跟 64 位） |
| Masking-key | 32 | 掩码密钥（MASK=1 时存在） |
| Payload Data | 变长 | 实际数据 |

### 八、Opcode 帧类型

| Opcode | 含义 | 说明 |
|--------|------|------|
| 0x0 | 继续帧 | 分片消息的后续帧 |
| 0x1 | 文本帧 | UTF-8 文本 |
| 0x2 | 二进制帧 | 二进制数据 |
| 0x3-7 | 保留 | 未来定义 |
| 0x8 | 关闭帧 | 关闭连接 |
| 0x9 | Ping | 心跳请求 |
| 0xA | Pong | 心跳应答 |

文本帧和二进制帧是数据帧；关闭/Ping/Pong 是控制帧（控制帧 payload 不超 125 字节，且不能分片）。

### 九、掩码（Masking）

**客户端发送的每一帧必须掩码，服务器发送的帧不能掩码**。这是为了防止中间代理缓存中毒——掩码让 payload 不可预测。

掩码算法很简单：生成 4 字节随机掩码密钥，payload 的第 i 字节与掩码密钥的第 (i mod 4) 字节做 XOR：

\`\`\`python
mask_key = os.urandom(4)
masked = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))
# 解掩码是同样操作（XXOR 自身可逆）
unmasked = bytes(b ^ mask_key[i % 4] for i, b in enumerate(masked))
\`\`\`

### 十、长度编码

payload 长度用变长编码节省空间：

| Payload len 字段值 | 实际长度 | 后续字段 |
|--------------------|----------|----------|
| 0-125 | 就是这个值 | 无 |
| 126 | 后跟 2 字节（16 位无符号） | 2 字节扩展长度 |
| 127 | 后跟 8 字节（64 位无符号） | 8 字节扩展长度 |

\`\`\`python
if n < 126:
    header = bytes([b0, 0x80 | n])      # 7 位
elif n < 65536:
    header = bytes([b0, 0x80 | 126]) + struct.pack(">H", n)  # 7+16 位
else:
    header = bytes([b0, 0x80 | 127]) + struct.pack(">Q", n)  # 7+64 位
\`\`\`

### 十一、消息分片

一条长消息可以拆成多个帧：第一个帧 FIN=0、opcode=0x1/0x2，后续帧 FIN=0、opcode=0x0（继续帧），最后一帧 FIN=1、opcode=0x0。这让发送未知长度的数据（如流式语音）成为可能——边产生边发，不必先算总长度。

### 十二、应用场景

- **即时聊天**：消息推送，服务器主动下发。
- **实时游戏**：低延迟状态同步。
- **股票行情**：持续推送价格。
- **协作编辑**：多人编辑同步（Google Docs 用类似机制）。
- **推送通知**：服务端事件直达客户端。
- **在线教育**：白板同步、互动答题。

### 十三、面试要点

**Q1：WebSocket 和 HTTP 的区别？**
A：HTTP 是请求-响应的单向短连接，WebSocket 是全双工持久长连接。WebSocket 借 HTTP 完成握手（Upgrade），握手后改用帧格式双向通信，帧头只有 2-14 字节，开销远小于 HTTP。端口复用 80/443。

**Q2：WebSocket 握手怎么验证服务器懂协议？**
A：客户端发 Sec-WebSocket-Key（随机 16 字节 base64），服务器必须返回 Sec-WebSocket-Accept = Base64(SHA1(Key + 固定 GUID))。这个固定计算让普通 HTTP 服务器无法冒充，客户端验证 Accept 正确才认为握手成功。

**Q3：为什么客户端帧要掩码，服务器帧不要？**
A：防中间代理缓存中毒。客户端发的 payload 经掩码后不可预测，避免恶意客户端构造让代理误判缓存 key 的数据。服务器到客户端方向不存在这个风险，所以不掩码。

**Q4：FIN 和 opcode 0x0 是什么？**
A：FIN=1 表示消息最后一帧。opcode 0x0 是继续帧，用于分片消息的后续部分。一条消息可拆成多帧：首帧 opcode=0x1/0x2 且 FIN=0，中间和末尾帧 opcode=0x0，末尾 FIN=1。用于流式发送未知长度数据。

### 十四、小结

- WebSocket 借 HTTP 握手（Upgrade），握手后用帧格式全双工通信。
- Sec-WebSocket-Accept = Base64(SHA1(Key + GUID))。
- 帧格式：FIN/RSV/Opcode/MASK/长度/掩码/payload。
- Opcode：0x1 文本、0x2 二进制、0x8 关闭、0x9 Ping、0xA Pong。
- 客户端帧必须掩码（XOR），服务器帧不掩码。
- 长度变长编码：126/127 触发扩展长度字段。
- 下一章手写 WebSocket 客户端。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第 3 章代码：WebSocket 协议基础（纯计算，无网络）
# ------------------------------------------------------------
# 演示内容：
#   1. 手动计算 Sec-WebSocket-Accept（并用 RFC 示例验证）
#   2. 构造 WebSocket 握手请求字符串并打印
#   3. 用 struct 编码/解码 WebSocket 帧的二进制结构
#   4. 演示掩码（mask）编解码
#   5. 打印各种 opcode 的含义
# ============================================================
import hashlib
import base64
import os
import struct

# RFC 6455 规定的全局魔法字符串（所有实现一致）
WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

# ---------- 1. 计算 Sec-WebSocket-Accept ----------
def compute_accept(key):
    """根据 Sec-WebSocket-Key 计算 Sec-WebSocket-Accept"""
    # 拼接 Key + GUID，做 SHA-1，再 Base64
    sha1 = hashlib.sha1((key + WS_GUID).encode("ascii")).digest()
    return base64.b64encode(sha1).decode("ascii")

print("=" * 60)
print("1. Sec-WebSocket-Accept 计算")
print("=" * 60)
# 用 RFC 6455 的官方示例验证算法正确性
test_key = "dGhlIHNhbXBsZSBub25jZQ=="
expected = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
got = compute_accept(test_key)
print("输入 Key      :", test_key)
print("期望 Accept   :", expected)
print("计算 Accept   :", got)
print("算法验证通过  :", got == expected)

# ---------- 2. 构造握手请求 ----------
print("\\n" + "=" * 60)
print("2. WebSocket 握手请求构造")
print("=" * 60)
# 客户端随机生成 16 字节再 base64 作为 Key
client_key = base64.b64encode(os.urandom(16)).decode("ascii")
# 握手请求是一个标准 HTTP 请求，带 Upgrade 头
handshake_request = (
    "GET /chat HTTP/1.1\\r\\n"
    "Host: localhost:8080\\r\\n"
    "Upgrade: websocket\\r\\n"
    "Connection: Upgrade\\r\\n"
    "Sec-WebSocket-Key: %s\\r\\n"
    "Sec-WebSocket-Version: 13\\r\\n"
    "Origin: http://localhost\\r\\n"
    "\\r\\n"
) % client_key
print(handshake_request, end="")
print("--- 握手请求结束 ---")

# 对应的握手响应
accept = compute_accept(client_key)
handshake_response = (
    "HTTP/1.1 101 Switching Protocols\\r\\n"
    "Upgrade: websocket\\r\\n"
    "Connection: Upgrade\\r\\n"
    "Sec-WebSocket-Accept: %s\\r\\n"
    "\\r\\n"
) % accept
print("\\n--- 服务器握手响应 ---")
print(handshake_response, end="")

# ---------- 3. opcode 含义表 ----------
print("\\n" + "=" * 60)
print("3. Opcode 帧类型")
print("=" * 60)
opcodes = {
    0x0: "继续帧（分片消息的后续帧）",
    0x1: "文本帧（UTF-8 文本）",
    0x2: "二进制帧",
    0x8: "关闭帧",
    0x9: "Ping（心跳请求）",
    0xA: "Pong（心跳应答）",
}
for code, desc in opcodes.items():
    print("  0x%X : %s" % (code, desc))

# ---------- 4. 帧编码与掩码 ----------
print("\\n" + "=" * 60)
print("4. 帧编码（含掩码，模拟客户端发送）")
print("=" * 60)

def encode_frame(payload, opcode=0x1, mask=True):
    """编码一个 WebSocket 帧"""
    # 第一字节：FIN=1 (0x80) | opcode
    b0 = 0x80 | opcode
    n = len(payload)
    # 掩码标志位
    mask_bit = 0x80 if mask else 0x00
    header = bytearray([b0])
    if n < 126:
        header.append(mask_bit | n)              # 7 位长度
    elif n < 65536:
        header.append(mask_bit | 126)            # 标记用 16 位
        header += struct.pack(">H", n)           # 大端 16 位
    else:
        header.append(mask_bit | 127)            # 标记用 64 位
        header += struct.pack(">Q", n)           # 大端 64 位
    if mask:
        mkey = os.urandom(4)                     # 4 字节随机掩码
        header += mkey
        # payload 每字节与掩码 (i mod 4) 做 XOR
        masked = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
        header += masked
    else:
        header += payload
    return bytes(header)

def decode_frame(data):
    """解码一个 WebSocket 帧（返回 dict）"""
    b0, b1 = data[0], data[1]
    fin = (b0 & 0x80) != 0                       # FIN 位
    opcode = b0 & 0x0F                           # 低 4 位 opcode
    masked = (b1 & 0x80) != 0                    # MASK 位
    length = b1 & 0x7F                           # 7 位长度
    offset = 2
    if length == 126:                            # 16 位扩展长度
        length = struct.unpack(">H", data[offset:offset+2])[0]
        offset += 2
    elif length == 127:                          # 64 位扩展长度
        length = struct.unpack(">Q", data[offset:offset+8])[0]
        offset += 8
    if masked:
        mkey = data[offset:offset+4]
        offset += 4
    payload = data[offset:offset+length]
    if masked:
        payload = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
    return {"fin": fin, "opcode": opcode, "masked": masked,
            "length": length, "payload": bytes(payload)}

# 编码一个文本帧
msg = "Hello WebSocket".encode("utf-8")
frame = encode_frame(msg, opcode=0x1, mask=True)
print("原始 payload:", msg)
print("编码后帧(前 20 字节):", frame[:20])
print("帧总长度:", len(frame), "字节（含 2 头 + 4 掩码 + %d 数据）" % len(msg))

# 解码回来验证
info = decode_frame(frame)
print("解码结果:")
print("  FIN    :", info["fin"])
print("  opcode : 0x%X (%s)" % (info["opcode"], opcodes.get(info["opcode"], "?")))
print("  masked :", info["masked"])
print("  length :", info["length"])
print("  payload:", info["payload"].decode("utf-8"))
print("  往返一致:", info["payload"] == msg)

# ---------- 5. 长度编码分支演示 ----------
print("\\n" + "=" * 60)
print("5. 不同长度的帧头结构")
print("=" * 60)
for size in [10, 200, 70000]:
    payload = b"x" * size
    frame = encode_frame(payload, mask=True)
    # 解析头部长度（前 2 字节 + 扩展 + 掩码 4）
    b1 = frame[1] & 0x7F
    if b1 < 126:
        head_len = 2 + 4
    elif b1 == 126:
        head_len = 2 + 2 + 4
    else:
        head_len = 2 + 8 + 4
    print("payload=%6d 字节 -> 帧总长=%7d 头部=%d (长度字段:%s)" %
          (size, len(frame), head_len, "7位" if b1 < 126 else ("16位" if b1 == 126 else "64位")))

print("\\n" + "=" * 60)
print("小结：握手用 Accept = Base64(SHA1(Key+GUID))；帧用 FIN/opcode/")
print("MASK/变长长度/4字节掩码的结构；客户端必须掩码，掩码即 XOR。")
print("=" * 60)`,
  },

  // ============================================================
  // 第 4 章：WebSocket 客户端实现
  // ============================================================
  {
    id: "py-ws-client",
    group: "WebSocket",
    icon: "🔌",
    title: "WebSocket 客户端实现",
    content: `## 一、为什么这一章重要

上一章讲了 WebSocket 协议格式，这一章**用纯 Python 标准库手写一个 WebSocket 客户端**——不依赖 \`websockets\`、\`websocket-client\` 任何第三方库。手写一遍，你会真正理解协议的每个字节怎么流动，而不是把库当黑盒。

工作中你大概率直接用第三方库（成熟、健壮），但理解手写实现的价值在于：
- 遇到握手失败、帧解析错位时，能定位是哪一步的问题。
- 在受限环境（嵌入式、无 pip）也能跑 WebSocket。
- 面试时能讲清"WebSocket 客户端怎么实现"，而不是"调库"。

### 二、客户端的整体流程

\`\`\`
1. TCP connect 到服务器（普通 socket）
2. 发送 HTTP Upgrade 握手请求
3. 接收并验证 101 响应（校验 Sec-WebSocket-Accept）
4. 发送/接收 WebSocket 帧
5. 发送 Close 帧优雅关闭
\`\`\`

整个过程：先 TCP，再 HTTP 握手，最后切到 WebSocket 帧。三个阶段共用同一条 TCP 连接。

### 三、握手请求构造

客户端要生成随机 Key 并发送标准 Upgrade 请求：

\`\`\`python
import os, base64
key = base64.b64encode(os.urandom(16)).decode("ascii")
request = (
    "GET /chat HTTP/1.1\\r\\n"
    "Host: localhost:%d\\r\\n"
    "Upgrade: websocket\\r\\n"
    "Connection: Upgrade\\r\\n"
    "Sec-WebSocket-Key: %s\\r\\n"
    "Sec-WebSocket-Version: 13\\r\\n"
    "\\r\\n"
) % (port, key)
sock.sendall(request.encode())
\`\`\`

Key 必须是 16 字节随机数的 base64——随机性防止缓存碰撞，固定长度方便服务器处理。

### 四、验证 101 响应

读取响应直到遇到空行（\`\\r\\n\\r\\n\`），然后校验 \`Sec-WebSocket-Accept\`：

\`\`\`python
def compute_accept(key):
    import hashlib, base64
    GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    return base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()

# 读取响应头
data = b""
while b"\\r\\n\\r\\n" not in data:
    data += sock.recv(4096)
# 解析 Accept 并比对
for line in data.decode().split("\\r\\n"):
    if line.lower().startswith("sec-websocket-accept:"):
        accept = line.split(":", 1)[1].strip()
        assert accept == compute_accept(key), "握手验证失败！"
\`\`\`

校验 Accept 是安全关键——确认服务器真的懂 WebSocket，而不是把请求当普通 HTTP 处理后返回 200。

### 五、发送帧（客户端必须掩码）

客户端发的每一帧都要掩码。编码函数：

\`\`\`python
import struct, os
def send_frame(sock, payload, opcode=0x1):
    b0 = 0x80 | opcode              # FIN=1
    n = len(payload)
    header = bytearray([b0])
    if n < 126:
        header.append(0x80 | n)     # MASK=1 | 长度
    elif n < 65536:
        header.append(0x80 | 126)
        header += struct.pack(">H", n)
    else:
        header.append(0x80 | 127)
        header += struct.pack(">Q", n)
    mask = os.urandom(4)            # 4 字节随机掩码
    header += mask
    # payload XOR 掩码
    masked = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))
    sock.sendall(bytes(header) + bytes(masked))
\`\`\`

注意 \`0x80 |\` 这一位是 MASK 标志，客户端必须置 1。

### 六、接收帧（服务器不掩码）

服务器发的帧 MASK=0，没有掩码密钥，解码更简单：

\`\`\`python
def recv_exact(sock, n):
    buf = b""
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk: break
        buf += chunk
    return buf

def recv_frame(sock):
    hdr = recv_exact(sock, 2)
    b0, b1 = hdr[0], hdr[1]
    fin = (b0 & 0x80) != 0
    opcode = b0 & 0x0F
    length = b1 & 0x7F
    if length == 126:
        length = struct.unpack(">H", recv_exact(sock, 2))[0]
    elif length == 127:
        length = struct.unpack(">Q", recv_exact(sock, 8))[0]
    # 服务器帧不掩码，没有 masking-key
    payload = recv_exact(sock, length)
    return fin, opcode, payload
\`\`\`

\`recv_exact\` 是关键辅助：TCP 是字节流，一次 \`recv\` 不一定拿全，要循环读到指定字节数。

### 七、控制帧处理

客户端要正确处理控制帧：

- **Close (0x8)**：服务器要关闭。客户端应回一个 Close 帧，然后关 socket。
- **Ping (0x9)**：服务器心跳探测。客户端必须回 Pong (0xA)，payload 用 Ping 的 payload。
- **Pong (0xA)**：服务器应答心跳，无需处理。

控制帧可能插在数据帧中间，必须及时处理，不能等当前消息读完。

### 八、分片消息发送

长消息可分片发送，避免一次性构造大 buffer：

\`\`\`python
# 第一帧：FIN=0, opcode=0x1（文本起始）
send_frame(sock, b"part1-", opcode=0x1, fin=False)
# 后续帧：FIN=0, opcode=0x0（继续帧）
send_frame(sock, b"part2-", opcode=0x0, fin=False)
# 最后一帧：FIN=1, opcode=0x0
send_frame(sock, b"part3", opcode=0x0, fin=True)
# 服务器拼接得到 "part1-part2-part3"
\`\`\`

实际编码函数要把 fin 参数加进去（第一字节的高位）。

### 九、Close 帧与优雅关闭

关闭连接不是直接 \`close()\`，而是先发 Close 帧：

\`\`\`python
# 发 Close 帧（opcode=0x8，可带状态码）
send_frame(sock, struct.pack(">H", 1000), opcode=0x8)
# 等服务器回 Close
fin, opcode, payload = recv_frame(sock)
sock.close()
\`\`\`

状态码 1000 表示正常关闭。这避免 TCP 直接断开让对端误以为网络故障。

### 十、客户端设计要点

1. **超时保护**：所有 recv 设 \`settimeout\`，防止服务器无响应卡死。
2. **try/finally**：确保异常时也 close socket，不泄漏 fd。
3. **边界处理**：\`recv_exact\` 处理 TCP 半包，不能假设一次 recv 拿全。
4. **掩码随机**：每帧重新生成掩码密钥，不能复用。
5. **UTF-8**：文本帧的 payload 必须是合法 UTF-8。

### 十一、面试要点

**Q1：WebSocket 客户端握手要做什么？**
A：TCP connect 后发 HTTP Upgrade 请求，带随机 Sec-WebSocket-Key。收到 101 后校验 Sec-WebSocket-Accept = Base64(SHA1(Key + GUID))，校验通过则握手成功，后续用帧通信。

**Q2：客户端帧为什么要掩码？怎么掩码？**
A：RFC 规定客户端发的帧必须掩码，防中间代理缓存中毒。掩码：生成 4 字节随机密钥，payload 第 i 字节 XOR 密钥第 (i mod 4) 字节。服务器帧不掩码。

**Q3：接收帧时为什么要循环 recv？**
A：TCP 是字节流，不保证一次 recv 拿到完整帧。帧可能被拆成多个 TCP 段，也可能多个帧黏在一个 recv 里。必须按帧格式逐字段读取（先 2 字节头，再按长度读扩展长度/掩码/payload），用 recv_exact 循环读到指定字节数。

**Q4：收到 Ping 帧怎么处理？**
A：必须回 Pong 帧，payload 用 Ping 的 payload。Ping/Pong 是心跳机制，用于探测连接是否存活、保持 NAT 映射。控制帧可插在数据帧中间，要及时响应。

### 十一补、wss 加密连接与客户端陷阱

#### wss:// = WebSocket over TLS

\`ws://\` 是明文 WebSocket，\`wss://\` 是套了 TLS 的加密 WebSocket，关系就像 HTTP 之于 HTTPS。生产环境必须用 \`wss://\`，否则帧内容（含业务数据、Token）明文传输，可被窃听篡改。

手写 wss 客户端只需把 TLS 套在 TCP 之上：

\`\`\`python
import ssl, socket
# 1. 先建 TCP 连接
raw = socket.create_connection(("wss.example.com", 443), timeout=5)
# 2. 用 ssl context 包装成 TLS socket
ctx = ssl.create_default_context()           # 严格验证
tls_sock = ctx.wrap_socket(raw, server_hostname="wss.example.com")
# 3. 在 TLS socket 上做 WebSocket 握手（和 ws 完全一样）
tls_sock.sendall(handshake_request.encode())
# 4. 之后帧收发全部走加密通道
\`\`\`

关键点：TLS 握手先于 WebSocket 握手——先加密通道，再 Upgrade。所以 \`server_hostname\` 要传真实域名，否则证书验证失败。

#### 客户端常见陷阱

1. **忘了校验 Accept**：直接信任 101 响应就开收帧，可能连的是"假 WebSocket 服务器"（比如返回 101 但实际是 HTTP 缓存）。必须比对 \`Sec-WebSocket-Accept\`。
2. **掩码密钥复用**：每帧用同一个掩码密钥，破坏了掩码的随机性，可能被攻击者推断 payload。每帧必须 \`os.urandom(4)\` 重新生成。
3. **recv 一次当完整帧**：\`sock.recv(1024)\` 可能只返回半个帧或两个半帧，直接解析必错。必须用 \`recv_exact\` 按帧格式逐字段读。
4. **不处理控制帧**：只关心数据帧，收到 Ping 不回 Pong，服务器以为连接死了直接断开。控制帧要优先处理。
5. **Close 帧不等待应答**：发完 Close 立刻 \`close()\`，服务器还没回就断了，可能丢未读数据。发 Close 后应继续读直到收到 Close 应答再关。
6. **无超时保护**：\`recv\` 永久阻塞，服务器卡死客户端就跟着卡死。必须 \`settimeout\`。
7. **大 payload 一次性读**：64 位长度字段可能声明超大 payload，直接 \`recv(huge)\` 会撑爆内存。要限制最大帧大小，超限拒绝。
8. **文本帧不校验 UTF-8**：opcode=0x1 的 payload 必须是合法 UTF-8，发了非法字节接收方可能断开。发送前确认编码。

#### 断线重连

WebSocket 是长连接，网络抖动会断开。生产客户端要实现重连：

\`\`\`python
def connect_with_retry(url, max_retry=5):
    for i in range(max_retry):
        try:
            sock = do_handshake(url)
            return sock            # 成功
        except (socket.error, OSError) as e:
            print("第 %d 次连接失败: %s，%ds 后重试" % (i+1, e, 2**i))
            time.sleep(min(2**i, 30))   # 指数退避，上限 30s
    raise ConnectionError("重连失败")
\`\`\`

重连要配合**指数退避**（间隔翻倍），避免服务器刚恢复就被雪崩重连打挂。重连成功后通常要重新订阅频道、补拉断连期间错过的消息（用消息序号或时间戳）。

### 十二、小结

- 客户端流程：TCP connect → 发 Upgrade 握手 → 验证 101 → 收发帧 → Close。
- 握手 Key 随机 16 字节 base64，校验 Accept 防伪。
- 客户端帧必须掩码（每帧新随机密钥），服务器帧不掩码。
- recv_exact 处理 TCP 半包，按帧格式逐字段读。
- Close 帧优雅关闭，Ping/Pong 心跳要及时响应。
- 下一章实现完整的 WebSocket 服务器。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第 4 章代码：WebSocket 客户端实现
# ------------------------------------------------------------
# 演示内容：
#   1. 在子线程启动一个"极简 WebSocket 服务器"（仅做握手 + 回显一帧）
#   2. 主线程作为客户端：TCP connect -> 发握手 -> 验证 101
#   3. 客户端发送文本帧（带掩码）并接收回显
#   4. 客户端发送分片消息
#   5. 客户端发送 Close 帧优雅关闭
# ============================================================
import socket
import threading
import hashlib
import base64
import os
import struct
import time

WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def compute_accept(key):
    """计算 Sec-WebSocket-Accept"""
    sha1 = hashlib.sha1((key + WS_GUID).encode()).digest()
    return base64.b64encode(sha1).decode()

# ---------- 极简 WebSocket 服务器（子线程，配合演示客户端） ----------
def mini_ws_server(port_holder, ready_evt):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    srv.settimeout(3.0)
    port_holder.append(srv.getsockname()[1])
    ready_evt.set()
    try:
        conn, _ = srv.accept()
        conn.settimeout(3.0)
        # 1) 读取并解析握手请求
        data = b""
        while b"\\r\\n\\r\\n" not in data:
            data += conn.recv(4096)
        key = None
        for line in data.decode().split("\\r\\n"):
            if line.lower().startswith("sec-websocket-key:"):
                key = line.split(":", 1)[1].strip()
        # 2) 返回 101 握手响应
        resp = ("HTTP/1.1 101 Switching Protocols\\r\\n"
                "Upgrade: websocket\\r\\n"
                "Connection: Upgrade\\r\\n"
                "Sec-WebSocket-Accept: %s\\r\\n\\r\\n" % compute_accept(key))
        conn.sendall(resp.encode())
        # 3) 简单回显：循环读帧、原样回发（服务器帧不掩码）
        #    收到 Close 帧则回 Close 并退出
        def recv_exact(n):
            buf = b""
            while len(buf) < n:
                c = conn.recv(n - len(buf))
                if not c: return buf
                buf += c
            return buf
        while True:
            hdr = recv_exact(2)
            if len(hdr) < 2: break
            b0, b1 = hdr[0], hdr[1]
            fin = (b0 & 0x80) != 0
            opcode = b0 & 0x0F
            masked = (b1 & 0x80) != 0
            length = b1 & 0x7F
            if length == 126:
                length = struct.unpack(">H", recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack(">Q", recv_exact(8))[0]
            mkey = recv_exact(4) if masked else b""
            payload = recv_exact(length) if length else b""
            if masked:
                payload = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
            if opcode == 0x8:   # Close 帧：回一个 Close 然后退出
                conn.sendall(bytes([0x88, 0x02, 0x03, 0xE8]))  # 1000
                break
            # 回发一帧（不掩码）
            out = bytearray([0x80 | opcode, len(payload)])
            out += payload
            conn.sendall(bytes(out))
        conn.close()
    except Exception as e:
        print("[SERVER] 异常:", e)
    finally:
        srv.close()

# ---------- 启动服务器 ----------
port_holder = []
ready = threading.Event()
threading.Thread(target=mini_ws_server, args=(port_holder, ready),
                 daemon=True).start()
ready.wait(3.0)
port = port_holder[0]
time.sleep(0.1)

print("=" * 60)
print("WebSocket 客户端演示：连接 127.0.0.1:%d" % port)
print("=" * 60)

# ---------- 客户端辅助函数 ----------
def recv_exact(sock, n):
    buf = b""
    while len(buf) < n:
        c = sock.recv(n - len(buf))
        if not c:
            break
        buf += c
    return buf

def send_frame(sock, payload, opcode=0x1):
    """客户端发送帧（必须掩码）"""
    b0 = 0x80 | opcode              # FIN=1
    n = len(payload)
    header = bytearray([b0])
    if n < 126:
        header.append(0x80 | n)     # MASK=1
    elif n < 65536:
        header.append(0x80 | 126)
        header += struct.pack(">H", n)
    else:
        header.append(0x80 | 127)
        header += struct.pack(">Q", n)
    mkey = os.urandom(4)
    header += mkey
    masked = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
    sock.sendall(bytes(header) + bytes(masked))

def recv_frame(sock):
    """接收服务器帧（不掩码）"""
    hdr = recv_exact(sock, 2)
    if len(hdr) < 2:
        return None, None, None
    b0, b1 = hdr[0], hdr[1]
    opcode = b0 & 0x0F
    length = b1 & 0x7F
    if length == 126:
        length = struct.unpack(">H", recv_exact(sock, 2))[0]
    elif length == 127:
        length = struct.unpack(">Q", recv_exact(sock, 8))[0]
    payload = recv_exact(sock, length) if length else b""
    return (b0 & 0x80) != 0, opcode, bytes(payload)

# ---------- 1) TCP connect + 握手 ----------
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(3.0)
sock.connect(("127.0.0.1", port))
client_key = base64.b64encode(os.urandom(16)).decode()
req = ("GET /chat HTTP/1.1\\r\\nHost: localhost:%d\\r\\n"
       "Upgrade: websocket\\r\\nConnection: Upgrade\\r\\n"
       "Sec-WebSocket-Key: %s\\r\\nSec-WebSocket-Version: 13\\r\\n\\r\\n"
       % (port, client_key))
sock.sendall(req.encode())
# 读 101 响应
data = b""
while b"\\r\\n\\r\\n" not in data:
    data += sock.recv(4096)
got_accept = None
for line in data.decode().split("\\r\\n"):
    if line.lower().startswith("sec-websocket-accept:"):
        got_accept = line.split(":", 1)[1].strip()
print("握手状态行:", data.decode().split("\\r\\n")[0])
print("Accept 验证:", got_accept == compute_accept(client_key))

# ---------- 2) 发送文本帧 + 接收回显 ----------
print("\\n--- 文本帧通信 ---")
send_frame(sock, "Hello WebSocket".encode("utf-8"), opcode=0x1)
fin, op, payload = recv_frame(sock)
print("发送: Hello WebSocket")
print("收到: %s (opcode=0x%X)" % (payload.decode("utf-8"), op))

# ---------- 3) 发送中文文本帧 ----------
send_frame(sock, "实时通信测试".encode("utf-8"), opcode=0x1)
fin, op, payload = recv_frame(sock)
print("发送: 实时通信测试")
print("收到: %s" % payload.decode("utf-8"))

# ---------- 4) 发送 Close 帧优雅关闭 ----------
print("\\n--- 发送 Close 帧 ---")
send_frame(sock, struct.pack(">H", 1000), opcode=0x8)
fin, op, payload = recv_frame(sock)
print("收到 Close 应答 opcode=0x%X" % op)
sock.close()
print("连接已关闭")

print("\\n" + "=" * 60)
print("小结：客户端 = TCP connect + HTTP Upgrade 握手 + 帧收发；")
print("客户端帧必须掩码（4 字节随机密钥 XOR payload）；")
print("服务器帧不掩码；Close 帧实现优雅关闭。")
print("=" * 60)`,
  },

  // ============================================================
  // 第 5 章：WebSocket 服务器实现
  // ============================================================
  {
    id: "py-ws-server",
    group: "WebSocket",
    icon: "🖥️",
    title: "WebSocket 服务器实现",
    content: `## 一、为什么这一章重要

上一章写了客户端，这一章写**服务器端**——它是 WebSocket 通信的"被动方"，要完成握手应答、接收掩码帧、回发不掩码帧、管理多个客户端、处理心跳和关闭。手写服务器能让你彻底搞清"服务器视角"的协议处理，也为理解 WebSocket 库（如 \`websockets\`、\`aiohttp\`）的内部机制打下基础。

### 二、服务器的整体流程

\`\`\`
1. TCP listen + accept 接受连接
2. 接收 HTTP 握手请求，提取 Sec-WebSocket-Key
3. 计算 Sec-WebSocket-Accept，返回 101 响应
4. 循环接收/发送 WebSocket 帧
5. 处理 Close 帧、Ping/Pong
6. 关闭连接
\`\`\`

服务器和客户端共用一条 TCP 连接，但角色不同：服务器先 accept，再被动响应握手。

### 三、接收并解析握手请求

握手请求是标准 HTTP 格式，服务器读到空行 \`\\r\\n\\r\\n\` 表示头结束：

\`\`\`python
data = b""
while b"\\r\\n\\r\\n" not in data:
    data += conn.recv(4096)
# 逐行找 Sec-WebSocket-Key
key = None
for line in data.decode().split("\\r\\n"):
    if line.lower().startswith("sec-websocket-key:"):
        key = line.split(":", 1)[1].strip()
\`\`\`

实际生产还应校验 \`Upgrade: websocket\`、\`Connection: Upgrade\`、\`Version: 13\`，不合规返回 400。

### 四、返回 101 握手响应

\`\`\`python
accept = compute_accept(key)
response = (
    "HTTP/1.1 101 Switching Protocols\\r\\n"
    "Upgrade: websocket\\r\\n"
    "Connection: Upgrade\\r\\n"
    "Sec-WebSocket-Accept: %s\\r\\n"
    "\\r\\n"
) % accept
conn.sendall(response.encode())
\`\`\`

\`compute_accept\` 和客户端一样：Base64(SHA1(Key + GUID))。这一步完成后，TCP 连接正式"升级"为 WebSocket。

### 五、接收帧（客户端掩码，服务器要解掩码）

服务器收到的帧 MASK=1，必须读 4 字节掩码密钥并解掩码：

\`\`\`python
def recv_frame(conn):
    hdr = recv_exact(conn, 2)
    b0, b1 = hdr[0], hdr[1]
    fin = (b0 & 0x80) != 0
    opcode = b0 & 0x0F
    masked = (b1 & 0x80) != 0          # 客户端帧一定 masked=True
    length = b1 & 0x7F
    if length == 126:
        length = struct.unpack(">H", recv_exact(conn, 2))[0]
    elif length == 127:
        length = struct.unpack(">Q", recv_exact(conn, 8))[0]
    if masked:
        mkey = recv_exact(conn, 4)
    payload = recv_exact(conn, length) if length else b""
    if masked:
        # 解掩码：同样 XOR（XOR 两次还原）
        payload = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
    return {"fin": fin, "opcode": opcode, "payload": bytes(payload)}
\`\`\`

**关键**：服务器必须检查 MASK 位。RFC 规定客户端帧不掩码服务器应断开连接（协议错误）。

### 六、发送帧（服务器不掩码）

服务器发的帧 MASK=0，没有掩码密钥，更简单：

\`\`\`python
def send_frame(conn, payload, opcode=0x1):
    b0 = 0x80 | opcode                 # FIN=1
    n = len(payload)
    header = bytearray([b0])
    if n < 126:
        header.append(n)               # MASK=0
    elif n < 65536:
        header.append(126)
        header += struct.pack(">H", n)
    else:
        header.append(127)
        header += struct.pack(">Q", n)
    # 不加掩码密钥，直接发 payload
    conn.sendall(bytes(header) + payload)
\`\`\`

对比客户端：客户端 \`0x80 | n\`（MASK 位），服务器直接 \`n\`（MASK=0）；客户端多 4 字节掩码密钥 + XOR，服务器直接发原文。

### 七、echo 服务器主循环

\`\`\`python
while True:
    frame = recv_frame(conn)
    if frame is None:
        break
    op = frame["opcode"]
    if op == 0x8:                       # Close：回 Close 后退出
        send_frame(conn, b"\\x03\\xe8", opcode=0x8)  # 状态码 1000
        break
    elif op == 0x9:                     # Ping：回 Pong
        send_frame(conn, frame["payload"], opcode=0xA)
    elif op == 0xA:                     # Pong：忽略
        pass
    else:                               # 数据帧：回显
        send_frame(conn, frame["payload"], opcode=op)
\`\`\`

### 八、多客户端处理

单线程服务器一次只能处理一个客户端。要支持并发，两种方式：

#### 8.1 每连接一线程（threading）

\`\`\`python
def handle_client(conn, addr):
    try:
        do_handshake(conn)
        echo_loop(conn)
    finally:
        conn.close()

while True:
    conn, addr = srv.accept()
    threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
\`\`\`

简单直观，但连接数多时线程开销大。

#### 8.2 selectors I/O 多路复用

\`\`\`python
import selectors
sel = selectors.DefaultSelector()
srv.setblocking(False)
sel.register(srv, selectors.EVENT_READ, accept_callback)
while True:
    events = sel.select()
    for key, mask in events:
        callback = key.data
        callback(key.fileobj, mask)
\`\`\`

单线程处理大量连接，性能好但代码复杂。生产 WebSocket 服务器多用 asyncio（协程）。

### 九、Ping/Pong 心跳

长连接可能因为 NAT 超时、网络中断变成"半开连接"（一方断了另一方不知道）。心跳机制解决这个：

- 服务器定期发 **Ping** (0x9)。
- 客户端必须回 **Pong** (0xA)。
- 一段时间没收到 Pong，服务器认为连接已死，主动关闭。

\`\`\`python
# 服务器心跳：每 30 秒发 Ping
last_pong = time.time()
def heartbeat():
    if time.time() - last_pong > 60:
        conn.close()      # 超时未应答，断开
    send_frame(conn, b"ping", opcode=0x9)
\`\`\`

### 十、Close 帧处理

关闭连接的标准流程：

1. 一方发 Close 帧（可带状态码，如 1000 正常关闭、1001 离开、1011 服务器内部错）。
2. 另一方**必须回一个 Close 帧**作为应答。
3. 然后双方关闭 TCP 连接。

\`\`\`python
if frame["opcode"] == 0x8:
    # 解析状态码（前 2 字节）
    code = struct.unpack(">H", frame["payload"][:2])[0] if len(frame["payload"]) >= 2 else 1000
    print("客户端请求关闭，状态码:", code)
    send_frame(conn, struct.pack(">H", 1000), opcode=0x8)  # 回 Close
    break
\`\`\`

直接 \`close()\` 不发 Close 帧，对端会以为网络异常，可能触发重连。

### 十一、服务器设计要点

1. **超时保护**：accept、recv 都设超时，防止单个客户端卡死整个服务器。
2. **异常隔离**：单个客户端异常不能影响其他客户端，用 try/except 包住每个连接处理。
3. **资源释放**：finally 里 close conn，防止 fd 泄漏。
4. **协议校验**：握手时校验必要头，帧解析时检查 MASK 位。
5. **分片重组**：FIN=0 的帧要缓存，直到 FIN=1 拼成完整消息。
6. **控制帧优先**：Ping/Close 可插在数据帧中间，要优先处理。

### 十二、完整 echo 服务器示例结构

\`\`\`
class WebSocketServer:
    def serve(self):
        while True:
            conn, addr = self.sock.accept()
            threading.Thread(target=self.handle, args=(conn,)).start()

    def handle(self, conn):
        try:
            self.handshake(conn)
            self.message_loop(conn)
        except Exception as e:
            log(e)
        finally:
            conn.close()

    def handshake(self, conn): ...
    def message_loop(self, conn): ...
    def on_message(self, conn, payload): ...
    def on_close(self, conn, code): ...
\`\`\`

这是大多数 WebSocket 库的骨架。

### 十三、面试要点

**Q1：WebSocket 服务器握手要做什么？**
A：accept 连接后读取 HTTP 请求，提取 Sec-WebSocket-Key，计算 Sec-WebSocket-Accept = Base64(SHA1(Key + GUID))，返回 101 Switching Protocols 响应带 Accept。之后连接升级为 WebSocket。

**Q2：服务器收发帧和客户端有什么不同？**
A：客户端帧必须掩码（MASK=1，带 4 字节密钥，payload XOR 密钥），服务器帧不掩码（MASK=0）。所以服务器接收时要解掩码，发送时直接发原文。服务器若收到不掩码的客户端帧应断开（协议错误）。

**Q3：如何处理多个 WebSocket 客户端？**
A：每连接一线程（简单，连接多时开销大）；selectors I/O 多路复用（单线程高并发，代码复杂）；asyncio 协程（现代首选，兼顾清晰与性能）。生产多用 asyncio。

**Q4：Ping/Pong 心跳的作用？**
A：检测连接是否存活。服务器定期发 Ping，客户端必须回 Pong。超时未收到 Pong 则认定连接已死（半开连接），主动关闭。也用于保持 NAT 映射不超时。

**Q5：Close 帧为什么要应答？**
A：RFC 规定收到 Close 帧必须回一个 Close 帧作为确认，然后双方关闭 TCP。这是优雅关闭协议，让对端知道是主动关闭而非网络故障，避免触发重连。状态码（如 1000）携带关闭原因。

### 十四、小结

- 服务器流程：accept → 解析握手 → 返回 101 → 帧收发循环 → Close。
- 接收帧要解掩码（客户端必掩码），发送帧不掩码。
- 控制帧：Close 要应答、Ping 要回 Pong、Pong 忽略。
- 多客户端：threading（简单）或 selectors/asyncio（高并发）。
- 心跳 Ping/Pong 防半开连接，Close 帧实现优雅关闭。
- 至此 HTTPS 与 WebSocket 两大主题讲完。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第 5 章代码：WebSocket 服务器实现（完整 echo 服务器）
# ------------------------------------------------------------
# 演示内容：
#   1. 子线程运行完整 WebSocket echo 服务器
#      - accept 连接
#      - 解析握手请求，提取 Sec-WebSocket-Key
#      - 计算 Accept 并返回 101
#      - 循环接收帧（解掩码）、回发帧（不掩码）
#      - 处理 Close 帧优雅关闭
#   2. 主线程作为客户端：
#      - 发送握手并验证 101
#      - 发送 3 条文本帧（带掩码），接收 3 条回显
#      - 发送 Close 帧优雅关闭
# ============================================================
import socket
import threading
import hashlib
import base64
import os
import struct
import time

WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def compute_accept(key):
    """计算 Sec-WebSocket-Accept"""
    sha1 = hashlib.sha1((key + WS_GUID).encode()).digest()
    return base64.b64encode(sha1).decode()

# ---------- 服务器端：帧收发辅助 ----------
def srv_recv_exact(conn, n):
    buf = b""
    while len(buf) < n:
        c = conn.recv(n - len(buf))
        if not c:
            return buf
        buf += c
    return buf

def srv_recv_frame(conn):
    """服务器接收帧（客户端掩码，需解掩码）"""
    hdr = srv_recv_exact(conn, 2)
    if len(hdr) < 2:
        return None
    b0, b1 = hdr[0], hdr[1]
    fin = (b0 & 0x80) != 0
    opcode = b0 & 0x0F
    masked = (b1 & 0x80) != 0
    length = b1 & 0x7F
    if length == 126:
        length = struct.unpack(">H", srv_recv_exact(conn, 2))[0]
    elif length == 127:
        length = struct.unpack(">Q", srv_recv_exact(conn, 8))[0]
    mkey = srv_recv_exact(conn, 4) if masked else b""
    payload = srv_recv_exact(conn, length) if length else b""
    if masked:
        # 解掩码：XOR 掩码密钥（与掩码操作相同，XOR 自反）
        payload = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
    return {"fin": fin, "opcode": opcode, "payload": bytes(payload)}

def srv_send_frame(conn, payload, opcode=0x1):
    """服务器发送帧（不掩码）"""
    b0 = 0x80 | opcode                  # FIN=1
    n = len(payload)
    header = bytearray([b0])
    if n < 126:
        header.append(n)               # MASK=0，直接长度
    elif n < 65536:
        header.append(126)
        header += struct.pack(">H", n)
    else:
        header.append(127)
        header += struct.pack(">Q", n)
    # 服务器帧不掩码，直接发 payload
    conn.sendall(bytes(header) + payload)

# ---------- 完整 WebSocket echo 服务器（子线程） ----------
def ws_echo_server(port_holder, ready_evt):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    srv.settimeout(3.0)
    port_holder.append(srv.getsockname()[1])
    ready_evt.set()
    try:
        conn, addr = srv.accept()
        conn.settimeout(3.0)
        # 1) 读取握手请求
        data = b""
        while b"\\r\\n\\r\\n" not in data:
            data += conn.recv(4096)
        key = None
        for line in data.decode().split("\\r\\n"):
            if line.lower().startswith("sec-websocket-key:"):
                key = line.split(":", 1)[1].strip()
        # 2) 返回 101 握手响应
        resp = ("HTTP/1.1 101 Switching Protocols\\r\\n"
                "Upgrade: websocket\\r\\n"
                "Connection: Upgrade\\r\\n"
                "Sec-WebSocket-Accept: %s\\r\\n\\r\\n" % compute_accept(key))
        conn.sendall(resp.encode())
        # 3) echo 主循环
        while True:
            frame = srv_recv_frame(conn)
            if frame is None:
                break
            op = frame["opcode"]
            if op == 0x8:               # Close：回 Close 后退出
                code = struct.pack(">H", 1000)
                srv_send_frame(conn, code, opcode=0x8)
                break
            elif op == 0x9:             # Ping：回 Pong
                srv_send_frame(conn, frame["payload"], opcode=0xA)
            elif op == 0xA:             # Pong：忽略
                pass
            else:                        # 数据帧：原样回显
                srv_send_frame(conn, frame["payload"], opcode=op)
        conn.close()
    except Exception as e:
        print("[SERVER] 异常:", e)
    finally:
        srv.close()

# ---------- 启动服务器 ----------
port_holder = []
ready = threading.Event()
threading.Thread(target=ws_echo_server, args=(port_holder, ready),
                 daemon=True).start()
ready.wait(3.0)
port = port_holder[0]
time.sleep(0.1)

print("=" * 60)
print("WebSocket echo 服务器演示：127.0.0.1:%d" % port)
print("=" * 60)

# ---------- 客户端辅助函数 ----------
def cli_recv_exact(sock, n):
    buf = b""
    while len(buf) < n:
        c = sock.recv(n - len(buf))
        if not c:
            break
        buf += c
    return buf

def cli_send_frame(sock, payload, opcode=0x1):
    """客户端发送帧（必须掩码）"""
    b0 = 0x80 | opcode
    n = len(payload)
    header = bytearray([b0])
    if n < 126:
        header.append(0x80 | n)         # MASK=1
    elif n < 65536:
        header.append(0x80 | 126)
        header += struct.pack(">H", n)
    else:
        header.append(0x80 | 127)
        header += struct.pack(">Q", n)
    mkey = os.urandom(4)
    header += mkey
    masked = bytearray(b ^ mkey[i % 4] for i, b in enumerate(payload))
    sock.sendall(bytes(header) + bytes(masked))

def cli_recv_frame(sock):
    """客户端接收帧（服务器不掩码）"""
    hdr = cli_recv_exact(sock, 2)
    if len(hdr) < 2:
        return None
    b0, b1 = hdr[0], hdr[1]
    opcode = b0 & 0x0F
    length = b1 & 0x7F
    if length == 126:
        length = struct.unpack(">H", cli_recv_exact(sock, 2))[0]
    elif length == 127:
        length = struct.unpack(">Q", cli_recv_exact(sock, 8))[0]
    payload = cli_recv_exact(sock, length) if length else b""
    return {"fin": (b0 & 0x80) != 0, "opcode": opcode, "payload": bytes(payload)}

# ---------- 客户端：握手 ----------
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(3.0)
sock.connect(("127.0.0.1", port))
ck = base64.b64encode(os.urandom(16)).decode()
req = ("GET /chat HTTP/1.1\\r\\nHost: localhost:%d\\r\\n"
       "Upgrade: websocket\\r\\nConnection: Upgrade\\r\\n"
       "Sec-WebSocket-Key: %s\\r\\nSec-WebSocket-Version: 13\\r\\n\\r\\n"
       % (port, ck))
sock.sendall(req.encode())
data = b""
while b"\\r\\n\\r\\n" not in data:
    data += sock.recv(4096)
print("握手响应:", data.decode().split("\\r\\n")[0])
got = None
for line in data.decode().split("\\r\\n"):
    if line.lower().startswith("sec-websocket-accept:"):
        got = line.split(":", 1)[1].strip()
print("Accept 校验:", got == compute_accept(ck))

# ---------- 客户端：发 3 条消息并收回显 ----------
print("\\n--- 多轮 echo 通信 ---")
messages = ["第一条：Hello", "第二条：WebSocket", "第三条：实时通信"]
for msg in messages:
    cli_send_frame(sock, msg.encode("utf-8"), opcode=0x1)
    f = cli_recv_frame(sock)
    print("发送: %-22s -> 收到: %s" % (msg, f["payload"].decode("utf-8")))

# ---------- 客户端：发送 Close 帧优雅关闭 ----------
print("\\n--- 优雅关闭 ---")
cli_send_frame(sock, struct.pack(">H", 1000), opcode=0x8)
f = cli_recv_frame(sock)
print("收到服务器 Close 应答: opcode=0x%X" % (f["opcode"] if f else -1))
sock.close()

print("\\n" + "=" * 60)
print("小结：")
print("  服务器 = accept + 解析握手 + 返回 101 + 帧收发循环")
print("  接收帧需解掩码（客户端必掩码），发送帧不掩码")
print("  Close 帧要应答，Ping 要回 Pong，数据帧原样 echo")
print("  多客户端可用 threading / selectors / asyncio 扩展")
print("=" * 60)`,
  },

];
