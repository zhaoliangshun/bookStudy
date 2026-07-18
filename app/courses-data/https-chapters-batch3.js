// =============================================================
// HTTPS 详解全书 - 第 3 批章节（TLS 协议详解 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   hs-tls-overview: TLS 概述与历史
//   hs-tls-handshake: TLS 握手流程
//   hs-key-exchange: 密钥交换与密钥派生
//   hs-record-layer: 记录层与对称加密
//   hs-tls13: TLS 1.3 详解
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：TLS 概述与历史
  // ============================================================
  {
    id: "hs-tls-overview",
    group: "TLS 协议详解",
    icon: "🤝",
    title: "TLS 概述与历史",
    content: `# TLS 概述与历史

## 一、TLS 是什么

TLS（Transport Layer Security，传输层安全协议）是为网络通信提供安全保障的一套协议。它运行在传输层（TCP）之上、应用层（HTTP/SMTP/IMAP 等）之下，负责对应用层数据进行**加密**、**完整性校验**和**身份认证**。

简单一句话：**TLS 给任意应用层协议套上一层加密外壳，让中间人既看不到内容、改不了内容，也伪装不了身份。**

### 1.1 生活类比：TLS 就像"保密信封 + 蜡封 + 印章"

想象你要给朋友寄一封机密信件，普通明信片（明文 HTTP）有三大问题：

1. 邮差能看到内容（窃听）
2. 邮差能涂改内容（篡改）
3. 邮差能伪造一封"假信"冒充你（伪造）

TLS 做了三件事，正好对应这三个问题：

- **加密**：把信件装进只有收件人能打开的"保密信封"，邮差看到的全是乱码。
- **完整性**：信封口用特殊蜡封住，一旦被拆开就会留下痕迹，收件人能立刻发现。
- **身份认证**：信封上盖有发件人的"防伪印章"，收件人能验证"这封信确实来自真正的朋友，不是冒充的"。

这三件事合起来，就是 TLS 提供的三大安全服务：机密性、完整性、身份认证。

---

## 二、TLS 在协议栈中的位置

### 2.1 四层模型中的位置

TLS 处于一个特殊的位置——它既不是严格意义上的传输层，也不是应用层，而是夹在两者之间的"安全层"：

\`\`\`
┌───────────────────────────────────────────────┐
│  应用层    HTTP / SMTP / FTP / IMAP 等报文      │  ← 业务数据
├───────────────────────────────────────────────┤
│  安全层    TLS（加密 / 解密 / 认证 / 完整性）    │  ← HTTPS 多出来的就是这层
├───────────────────────────────────────────────┤
│  传输层    TCP（可靠传输 / 三次握手 / 流控）     │  ← 保证字节可靠到达
├───────────────────────────────────────────────┤
│  网络层    IP（路由 / 寻址）                     │  ← 数据包跨网传输
└───────────────────────────────────────────────┘
\`\`\`

从这个分层可以看出：TLS 不知道也不关心上层是 HTTP 还是 SMTP，它只负责"拿到一段字节流，加密后交给 TCP"。同样 TCP 也不关心上面是 TLS 还是裸 HTTP，它只管把字节可靠地传到对端。

### 2.2 TLS 不只是为 HTTPS 服务

很多人以为"TLS = HTTPS"，这是个误解。**HTTPS 只是 TLS 最常见的应用场景**，但 TLS 本身是通用的安全层，可以保护任何基于 TCP 的应用层协议：

| 应用场景 | 协议 | 默认端口 | TLS 用途 |
|---------|------|---------|---------|
| 网页浏览 | HTTPS | 443 | 加密 HTTP 通信 |
| 邮件收发 | SMTPS | 465 | 加密邮件发送 |
| 邮件接收 | IMAPS | 993 | 加密邮件拉取 |
| 邮件接收 | POP3S | 995 | 加密邮件下载 |
| 文件传输 | FTPS | 990 | 加密 FTP 控制/数据通道 |
| 远程登录 | SSH（非 TLS 但类似） | 22 | 加密 Shell 会话 |
| 数据库连接 | MySQL over TLS | 3306 | 加密数据库查询 |
| 消息队列 | AMQPS | 5671 | 加密 RabbitMQ 通信 |

凡是后面带个 "S"（Secure）的协议，基本都是"原协议 + TLS"。**TLS 是个"通用加密层"，HTTPS 只是它最广为人知的用户。**

### 2.3 TLS 的两层结构

TLS 协议本身不是单一协议，而是由**两个子协议**组成：

\`\`\`
┌─────────────────────────────────────────────────────┐
│  TLS 协议                                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  握手协议（Handshake Protocol）                │  │
│  │  - 协商密码套件                                │  │
│  │  - 交换证书                                    │  │
│  │  - 协商密钥                                    │  │
│  │  - 验证身份                                    │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  记录协议（Record Protocol）                   │  │
│  │  - 对应用数据进行分块                          │  │
│  │  - 加密 / 解密                                 │  │
│  │  - 完整性校验                                  │  │
│  │  - 传输给 TCP                                  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
\`\`\`

- **握手协议**：负责"双方见面、对暗号、交换证件、约定密钥"，是协商阶段。
- **记录协议**：负责"用协商好的密钥，把应用数据切块、加密、传输"，是数据传输阶段。

生活类比：握手协议就像两个陌生人见面——互相出示身份证、对暗号、约定一个只有两人知道的"密语"；记录协议就像两人之后用这个密语通信，每说一句话都用密语加密，外人听不懂。

---

## 三、TLS 的历史演变

### 3.1 从 SSL 到 TLS 的演进

TLS 的前身叫 SSL（Secure Sockets Layer，安全套接层），由网景公司（Netscape）在 1995 年开发。后来 IETF 接管并改名为 TLS。整个演进历程如下：

\`\`\`
1995  SSL 1.0  （从未公开发布，存在严重漏洞）
  ↓
1995  SSL 2.0  （网景发布，1996 年被发现漏洞，2011 年正式废弃）
  ↓
1996  SSL 3.0  （重写设计，2015 年因 POODLE 攻击废弃）
  ↓
1999  TLS 1.0  （IETF 接管，RFC 2246，≈ SSL 3.1，2020 年废弃）
  ↓
2006  TLS 1.1  （RFC 4346，修复 CBC 攻击，2020 年废弃）
  ↓
2008  TLS 1.2  （RFC 5246，引入 AEAD，目前仍广泛使用）
  ↓
2018  TLS 1.3  （RFC 8446，大重构，1-RTT 握手，强制前向保密）
\`\`\`

### 3.2 各版本的关键变化

| 版本 | 发布年份 | RFC | 主要变化 | 状态 |
|------|---------|-----|---------|------|
| SSL 2.0 | 1995 | - | 网景首版，弱加密 | 已废弃 |
| SSL 3.0 | 1996 | 6101 | 重写，引入完整握手 | 已废弃（POODLE） |
| TLS 1.0 | 1999 | 2246 | 标准化，修小漏洞 | 已废弃（2020） |
| TLS 1.1 | 2006 | 4346 | 修复 CBC IV 攻击 | 已废弃（2020） |
| TLS 1.2 | 2008 | 5246 | 引入 AEAD（GCM/CCM） | 主流使用 |
| TLS 1.3 | 2018 | 8446 | 1-RTT、移除不安全算法 | 推荐使用 |

### 3.3 为什么 SSL 3.0 / TLS 1.0 / 1.1 被废弃

这些老版本之所以被废弃，是因为都存在严重的、无法修补的安全漏洞：

**POODLE 攻击（针对 SSL 3.0）**
2014 年 Google 公开 POODLE（Padding Oracle On Downgraded Legacy Encryption），利用 SSL 3.0 CBC 填充的设计缺陷，攻击者可以逐步解密密文。SSL 3.0 无法修复，只能废弃。

**BEAST 攻击（针对 TLS 1.0）**
2011 年公开，利用 TLS 1.0 CBC 模式初始向量（IV）可预测的缺陷，攻击者可以通过中间人方式解密部分 Cookie。

**TLS 1.1 的局限**
TLS 1.1 虽然修复了 IV 问题，但仍然依赖 MD5/SHA1 等已弱化的哈希算法，且不支持现代 AEAD 加密，无法满足当代安全需求。

2018 年起，主流浏览器（Chrome、Firefox、Safari、Edge）陆续宣布 2020 年全面停止支持 TLS 1.0/1.1。如今你访问的大多数网站，要么用 TLS 1.2，要么用 TLS 1.3。

---

## 四、Demo 1：用 openssl 看服务器支持的 TLS 版本

openssl 是 TLS 调试最常用的工具。我们可以用 \`s_client\` 子命令指定 TLS 版本连接服务器，看是否支持：

\`\`\`bash
# 测试服务器是否支持 TLS 1.2
# -connect 指定目标地址和端口
# -tls1_2 强制使用 TLS 1.2 版本
openssl s_client -connect example.com:443 -tls1_2

# 测试服务器是否支持 TLS 1.3
# -tls1_3 强制使用 TLS 1.3 版本
openssl s_client -connect example.com:443 -tls1_3

# 测试服务器是否还支持已废弃的 TLS 1.0
# 如果服务器禁用了旧版本，这里会报错"handshake failure"
openssl s_client -connect example.com:443 -tls1

# 测试 SSL 3.0（绝大多数服务器都已禁用）
# 现代服务器会直接拒绝连接
openssl s_client -connect example.com:443 -ssl3
\`\`\`

输出中重点关注这几行：

\`\`\`bash
# 协议版本，这里是 TLSv1.3
Protocol  : TLSv1.3

# 协商出的密码套件
Cipher    : TLS_AES_256_GCM_SHA384

# 服务器证书信息
Server certificate
subject=C = US, O = Internet Corporation, CN = example.com
\`\`\`

如果指定版本服务器不支持，openssl 会输出类似 \`handshake failure\` 或 \`no protocols available\` 的错误。

---

## 五、Demo 2：用 nmap 扫描 TLS 版本与密码套件

nmap 的 ssl-enum-ciphers 脚本可以一次性列出服务器支持的所有 TLS 版本和密码套件，是评估服务器安全配置的好工具：

\`\`\`bash
# 扫描 example.com 的 443 端口
# --script ssl-enum-ciphers 调用 TLS 枚举脚本
# -p 443 指定端口
nmap --script ssl-enum-ciphers -p 443 example.com
\`\`\`

输出示例：

\`\`\`bash
# 输出会按 TLS 版本分组列出支持的密码套件
PORT    STATE SERVICE
443/tcp open  https
| ssl-enum-ciphers:
|   TLSv1.2:
|     ciphers:
|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (secp256r1) - A
|     cipher preference: server
|   TLSv1.3:
|     ciphers:
|       TLS_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_CHACHA20_POLY1305_SHA256 (secp256r1) - A
|       TLS_AES_128_GCM_SHA256 (secp256r1) - A
|_  least strength: A
\`\`\`

每个密码套件后面的字母（A/B/C/D/F）是 nmap 给的安全评级。如果你的服务器出现 C 以下的评级，说明配置需要加固。

---

## 六、Demo 3：用 curl 指定 TLS 版本

curl 也可以指定 TLS 版本，方便测试：

\`\`\`bash
# 强制使用 TLS 1.2 访问
# --tlsv1.2 表示最低使用 TLS 1.2
curl -v --tlsv1.2 https://example.com

# 强制使用 TLS 1.3 访问
# 注意：需要 curl 编译时支持 TLS 1.3（OpenSSL 1.1.1+）
curl -v --tlsv1.3 https://example.com

# 同时限定版本范围：不低于 1.2，不高于 1.2
# --tls-max 1.2 限制最高版本为 1.2
curl -v --tlsv1.2 --tls-max 1.2 https://example.com

# -v 显示详细握手过程，能看到 SSL connection using TLSv1.3
\`\`\`

输出中关注这一行：

\`\`\`bash
# 这一行显示了实际使用的 TLS 版本和密码套件
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
\`\`\`

---

## 七、Demo 4：浏览器查看 TLS 版本

现代浏览器都内置了 TLS 信息查看功能，无需任何命令行工具。

**Chrome / Edge 操作步骤：**

1. 访问任意 HTTPS 网站（如 https://example.com）
2. 按 F12 打开开发者工具
3. 切换到 "Security"（安全）面板
4. 看到 "Connection - secure connection settings"
5. 这里会显示：
   - 协议版本（如 TLS 1.3）
   - 密码套件（如 TLS_AES_256_GCM_SHA384）
   - 证书信息
   - 密钥交换组

**Firefox 操作步骤：**

1. 访问 HTTPS 网站
2. 点击地址栏左侧的锁图标
3. 选择"连接安全" → "更多信息"
4. 在弹出的页面查看"安全"标签
5. 显示协议版本、密码套件、证书详情

**生活类比：** 浏览器的 Security 面板就像快递单上的"运输信息"——你可以看到这件"包裹"用了什么快递公司（TLS 版本）、什么包装方式（密码套件）、发货人是谁（证书）。

---

## 八、Demo 5：禁用旧版本的重要性——POODLE 与 BEAST 攻击

### 8.1 POODLE 攻击原理（针对 SSL 3.0）

POODLE 利用 SSL 3.0 CBC 模式的填充校验缺陷：

1. 攻击者作为中间人，强制客户端降级到 SSL 3.0（"版本降级攻击"）
2. 攻击者反复让客户端发送同一段密文（如 Cookie）
3. 利用 CBC 填充的缺陷，攻击者通过观察服务器对错误填充的响应，逐字节解密 Cookie
4. 大约需要几百次请求就能解密一个字节

防御方法只有一个：**彻底禁用 SSL 3.0**。

### 8.2 BEAST 攻击原理（针对 TLS 1.0）

BEAST 利用 TLS 1.0 中 CBC 模式的 IV 可预测性：

1. 攻击者作为中间人，能预测下一个数据块的 IV
2. 攻击者选择特定明文让客户端加密
3. 通过观察密文，攻击者能逐步推断出 Cookie

防御方法：**升级到 TLS 1.1+**，TLS 1.1 引入了显式 IV，从根本上修复了这个问题。

### 8.3 Nginx 配置禁用旧版本

\`\`\`nginx
# nginx.conf 中禁用所有旧版本，只允许 TLS 1.2 和 1.3
# ssl_protocols 指令控制支持的 TLS 版本
ssl_protocols TLSv1.2 TLSv1.3;

# 推荐配置：优先使用服务器端的密码套件偏好
# 防止客户端选择弱密码套件
ssl_prefer_server_ciphers on;

# 配置安全的密码套件列表（TLS 1.2）
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';

# 配置完后用 nginx -t 测试配置语法
# nginx -t
# 然后重新加载配置
# nginx -s reload
\`\`\`

### 8.4 Apache 配置禁用旧版本

\`\`\`apache
# httpd-ssl.conf 中配置
# SSLProtocol 控制支持的协议版本
# all 表示支持所有，-SSLv2 -SSLv3 -TLSv1 -TLSv1.1 表示减去这些不安全的版本
SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1

# 配置密码套件
SSLCipherSuite HIGH:!aNULL:!MD5:!3DES:!CAMELLIA:!AES128

# 优先使用服务器偏好
SSLHonorCipherOrder on
\`\`\`

配置完成后，用前面的 openssl / nmap 命令验证一遍，确保旧版本确实被禁用了。

---

## 九、TLS 版本对比表

| 版本 | 握手 RTT | 前向保密 | AEAD 支持 | 主要密码套件 | 安全等级 |
|------|---------|---------|-----------|-------------|---------|
| SSL 3.0 | 2-RTT | 不强制 | 不支持 | RC4 / 3DES / RSA | 不安全（已废弃） |
| TLS 1.0 | 2-RTT | 不强制 | 不支持 | RC4 / CBC / RSA | 不安全（已废弃） |
| TLS 1.1 | 2-RTT | 不强制 | 不支持 | CBC / RSA | 不安全（已废弃） |
| TLS 1.2 | 2-RTT | 可选 | 支持 | ECDHE + AES-GCM | 安全（主流） |
| TLS 1.3 | 1-RTT | 强制 | 强制 | AES-GCM / ChaCha20 | 最安全（推荐） |

关键观察：

- **TLS 1.2 之前都不支持 AEAD**，只能用 MAC-then-Encrypt 等不安全的组合方式，容易出漏洞。
- **TLS 1.3 强制前向保密**，移除了 RSA 密钥交换，即使服务器私钥泄露，历史通信也无法被解密。
- **TLS 1.3 握手只需 1-RTT**，比之前所有版本都快，还支持 0-RTT 恢复。

---

## 十、TLS 的核心价值总结

回到开头，TLS 之所以是 HTTPS 的基石，是因为它一次性解决了 HTTP 的三大缺陷：

| HTTP 缺陷 | TLS 解决手段 | 对应协议机制 |
|-----------|-------------|-------------|
| 窃听（无机密性） | 对称加密 | 记录层用 AES-GCM/ChaCha20 加密 |
| 篡改（无完整性） | AEAD 认证 | 每条记录附带 MAC，改一比特就失败 |
| 伪造（无认证） | 数字证书 | 握手阶段验证服务器证书链 |

而这三大机制的"协商"全在握手阶段完成，"使用"则在记录层完成。理解了这两层，就理解了 TLS 的全部。

---

## 本章小结

| 知识点 | 要点 |
|-------|------|
| TLS 定义 | 传输层安全协议，提供加密、完整性、身份认证 |
| 协议位置 | 应用层 ↔ TLS ↔ TCP ↔ IP |
| 服务范围 | 不只 HTTPS，还支持 SMTPS/FTPS/IMAPS 等 |
| 两层结构 | 握手协议（协商）+ 记录协议（传输） |
| 历史 | SSL 1.0/2.0/3.0 → TLS 1.0/1.1/1.2/1.3 |
| 已废弃版本 | SSL 2.0/3.0、TLS 1.0/1.1（2020 年起） |
| 推荐版本 | TLS 1.3（首选）、TLS 1.2（兼容） |
| 调试工具 | openssl s_client、nmap、curl、浏览器 DevTools |
| 老版本漏洞 | POODLE（SSL3）、BEAST（TLS1.0）、CBC 设计缺陷 |
| 配置要点 \| 禁用旧版本，启用 AEAD 套件，优先服务器偏好 |`
  },

  // ============================================================
  // 第二章：TLS 握手流程
  // ============================================================
  {
    id: "hs-tls-handshake",
    group: "TLS 协议详解",
    icon: "🔄",
    title: "TLS 握手流程",
    content: `# TLS 握手流程

## 一、握手到底在干什么

TLS 握手（Handshake）是客户端和服务器在建立加密通信前的一段"对话"。这段对话要解决四个核心问题：

1. **协商版本和密码套件**——双方用哪个 TLS 版本、哪套加密算法
2. **验证身份**——客户端验证服务器证书是否可信
3. **交换密钥**——双方协商出一个只有彼此知道的对称密钥
4. **确认完整性**——确认握手过程没有被中间人篡改

**生活类比：** TLS 握手就像两个特工接头，要完成四件事——对暗号（协商算法）、验身份证（验证证书）、约定密语（密钥交换）、最后互相确认"刚才没被偷听"（Finished 验证）。任何一步出错，接头就失败。

本章详细讲解 TLS 1.2 的完整握手流程，这是理解所有 TLS 版本的基础。TLS 1.3 在后面章节单独讲。

---

## 二、TLS 1.2 完整握手流程

TLS 1.2 的完整握手需要 **2 个 RTT**（往返时间）才能开始传输应用数据。整个过程涉及 10 条消息，时序如下：

\`\`\`
客户端                                              服务器
  │                                                   │
  │ ────── 1. ClientHello ─────────────────────────→  │   RTT 1 开始
  │                                                   │
  │ ←────── 2. ServerHello ─────────────────────────  │
  │ ←────── 3. Certificate ────────────────────────  │
  │ ←────── 4. ServerKeyExchange ──────────────────  │
  │ ←────── 5. ServerHelloDone ────────────────────  │   RTT 1 结束
  │                                                   │
  │ ────── 6. ClientKeyExchange ───────────────────→  │
  │ ────── 7. ChangeCipherSpec ────────────────────→  │
  │ ────── 8. Finished ────────────────────────────→  │   RTT 2 开始
  │                                                   │
  │ ←────── 9. ChangeCipherSpec ───────────────────  │
  │ ←────── 10. Finished ─────────────────────────  │   RTT 2 结束
  │                                                   │
  │ ═══════ 应用数据（已加密）════════════════════════ │   可开始传输
\`\`\`

下面逐条消息详细讲解。

### 2.1 ClientHello（客户端问候）

**方向：** 客户端 → 服务器

客户端发起连接，发送 ClientHello，告诉服务器"我支持哪些东西"。这个消息包含：

| 字段 | 说明 | 示例 |
|------|------|------|
| client_version | 客户端支持的最高 TLS 版本 | TLS 1.2 |
| client_random | 客户端生成的 32 字节随机数 | 防重放，参与密钥派生 |
| session_id | 会话 ID（用于会话恢复） | 空表示新会话 |
| cipher_suites | 客户端支持的密码套件列表 | [ECDHE-RSA-AES128-GCM-SHA256, ...] |
| compression_methods | 压缩方法（一般禁用） | [null] |
| extensions | 扩展字段 | SNI / ALPN / Supported Groups 等 |

**关键扩展说明：**

- **SNI（Server Name Indication）**：告诉服务器客户端要访问哪个域名。一台服务器可能托管多个网站，没有 SNI 服务器就不知道返回哪张证书。
- **ALPN（Application-Layer Protocol Negotiation）**：协商应用层协议，如 h2（HTTP/2）或 http/1.1。
- **Supported Groups**：客户端支持的椭圆曲线列表，如 secp256r1、x25519。
- **Signature Algorithms**：客户端支持的签名算法，用于证书验证。

**生活类比：** ClientHello 就像客人进店说："我会英语和中文，想吃川菜或粤菜，对花生过敏，给我安排。" 服务器根据这些信息"安排"出最合适的方案。

### 2.2 ServerHello（服务器问候）

**方向：** 服务器 → 客户端

服务器从 ClientHello 中选定各项参数，回复 ServerHello：

| 字段 | 说明 | 示例 |
|------|------|------|
| server_version | 选定的 TLS 版本 | TLS 1.2 |
| server_random | 服务器生成的 32 字节随机数 | 防重放，参与密钥派生 |
| session_id | 会话 ID（可复用） | 与客户端一致则恢复会话 |
| cipher_suite | 选定的密码套件（从客户端列表选一个） | ECDHE-RSA-AES128-GCM-SHA256 |
| compression_method | 选定的压缩方法 | null（禁用压缩） |
| extensions | 服务器支持的扩展 | key_share / supported_versions 等 |

注意：服务器只能从客户端提供的选项中选，不能"自作主张"。如果客户端不支持某算法，服务器选了它，握手就失败。

### 2.3 Certificate（服务器证书）

**方向：** 服务器 → 客户端

服务器发送自己的证书链（通常是"服务器证书 + 中间证书"，根证书不在链中，因为客户端已预装）。

证书包含的关键信息：

- 服务器域名（CN 或 SAN）
- 服务器公钥（用于密钥交换或验签）
- 颁发者（CA 信息）
- 有效期（not before / not after）
- 签名算法（CA 用什么算法签的名）

客户端收到证书后要验证：

1. 证书是否由可信 CA 签发（沿着证书链向上验证到根 CA）
2. 证书域名是否匹配访问的域名
3. 证书是否过期
4. 证书是否被吊销（通过 OCSP 或 CRL）

**生活类比：** 证书就像身份证。客户端验证证书就像保安查身份证——看是不是公安局（可信 CA）发的、照片是不是你（域名匹配）、有没有过期。

### 2.4 ServerKeyExchange（服务器密钥交换参数）

**方向：** 服务器 → 客户端

**这一步不是总有**。只有当密码套件的密钥交换算法需要服务器额外发送参数时才发：

- **RSA 密钥交换**：不发（公钥已经在证书里）
- **DHE/ECDHE 密钥交换**：发（服务器 DH/ECDHE 公钥参数）

对于现代主流的 ECDHE 套件，服务器会发送：

- 选定的椭圆曲线（如 x25519）
- 服务器 ECDHE 公钥
- 服务器对这些参数的签名（用证书私钥签名，防止中间人篡改）

### 2.5 ServerHelloDone（服务器问候完成）

**方向：** 服务器 → 客户端

一个简单的"我说完了"标志，告诉客户端"ServerHello 这一批消息发完了，该你了"。客户端收到这个就开始验证证书、生成密钥。

### 2.6 ClientKeyExchange（客户端密钥交换参数）

**方向：** 客户端 → 服务器

客户端发送自己的密钥交换参数：

- **RSA 模式**：客户端生成 pre_master_secret，用服务器证书公钥加密后发送
- **DHE/ECDHE 模式**：客户端生成自己的 DH/ECDHE 公钥，明文发送

注意：对于 ECDHE，客户端和服务器各自用对方公钥和自己的私钥计算出相同的 shared_secret，这就是 pre_master_secret。

### 2.7 ChangeCipherSpec（切换加密模式）

**方向：** 客户端 → 服务器

客户端通知服务器："从下一条消息开始，我要用协商好的密钥加密了。" 这是一条独立的"协议消息"，不属于握手协议。

### 2.8 Finished（客户端握手完成验证）

**方向：** 客户端 → 服务器

客户端发送 Finished 消息，这是**第一条被加密的消息**。它包含一个 verify_data，是之前所有握手消息的摘要 + master_secret 计算出的 HMAC。

服务器收到后：

1. 用协商密钥解密
2. 重新计算所有握手消息的摘要 + master_secret 的 HMAC
3. 对比客户端发来的 verify_data
4. 一致 → 握手没被篡改；不一致 → 中间人篡改了握手，立即断开

这是 TLS 防"中间人篡改握手"的关键机制——中间人可以转发消息，但无法伪造出正确的 verify_data，因为他不知道 master_secret。

### 2.9 服务器 ChangeCipherSpec + Finished

服务器同样发送 ChangeCipherSpec 和 Finished，客户端同样验证。

### 2.10 握手完成，开始传输应用数据

双方都验证 Finished 通过后，握手结束。从此用协商好的对称密钥加密所有应用数据。

---

## 三、Demo 1：用 openssl s_client 看完整握手

\`\`\`bash
# 连接 example.com 并显示完整握手信息
# -connect 指定目标地址和端口
# -servername 指定 SNI（很重要，否则服务器可能返回默认证书）
openssl s_client -connect example.com:443 -servername example.com

# 输出会按顺序显示：
# 1. CONNECTED 表示 TCP 连接已建立
# 2. 证书链信息（Certificate chain）
# 3. 协商出的协议版本和密码套件
# 4. 服务器证书详情
# 5. SSL handshake has read xxx bytes 表示握手完成
\`\`\`

重点关注输出中这几行：

\`\`\`bash
# 协商出的协议版本
SSL-Session:
    Protocol  : TLSv1.2

# 协商出的密码套件
    Cipher    : ECDHE-RSA-AES128-GCM-SHA256

# 会话 ID（用于会话恢复）
    Session-ID: 8E2A...（一长串十六进制）

# 服务器证书主题
subject=C = US, O = Internet Corporation, CN = example.com

# 证书颁发者
issuer=C = US, O = DigiCert Inc, CN = DigiCert TLS RSA SHA256 2020 CA1
\`\`\`

### 3.1 只看握手而不发数据

\`\`\`bash
# 用 echo 管道让 openssl 握手后立即退出
# echo /dev/null 表示不发送任何数据
# 这样只会显示握手信息，不会卡在等待输入
echo "" | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | head -50
\`\`\`

---

## 四、Demo 2：用 -msg 选项显示握手消息

openssl 的 -msg 选项会把每条握手消息的十六进制内容打印出来，可以清楚看到消息顺序：

\`\`\`bash
# -msg 显示所有 TLS 协议消息的十六进制
# 适合分析握手消息的具体顺序和内容
openssl s_client -connect example.com:443 -servername example.com -msg < /dev/null

# 输出会看到类似这样的行：
# <<< TLS 1.2, ClientHello [length 00f0]
# >>> TLS 1.2, ServerHello [length 0051]
# >>> TLS 1.2, Certificate [length 0b9a]
# >>> TLS 1.2, ServerKeyExchange [length 00fc]
# >>> TLS 1.2, ServerHelloDone [length 0004]
# <<< TLS 1.2, ClientKeyExchange [length 0046]
# <<< TLS 1.2, ChangeCipherSpec [length 0001]
# <<< TLS 1.2, Finished [length 0010]
# >>> TLS 1.2, ChangeCipherSpec [length 0001]
# >>> TLS 1.2, Finished [length 0010]
\`\`\`

- \`<<<\` 表示从服务器接收的消息
- \`>>>\` 表示发送给服务器的消息
- 注意顺序正好是前面时序图列出的 10 条

### 4.1 只显示握手消息不显示证书详情

\`\`\`bash
# -brief 简洁模式，只显示关键信息
# 适合快速查看握手结果
openssl s_client -connect example.com:443 -servername example.com -brief < /dev/null

# 输出示例：
# CONCLUDED TLSv1.3 handshake
#   Protocol version: TLSv1.3
#   Ciphersuite: TLS_AES_256_GCM_SHA384
#   Peer certificate: CN = example.com
#   Verified by DigiCert TLS RSA SHA256 2020 CA1
\`\`\`

---

## 五、Demo 3：用 tcpdump 抓包

要深入分析 TLS 握手，抓包是最直观的方法：

\`\`\`bash
# 在网卡上抓取 443 端口的数据包，保存到 tls.pcap 文件
# -i any 表示监听所有网卡
# -w tls.pcap 把数据包写入文件（不直接显示）
# port 443 过滤条件，只抓 443 端口流量
sudo tcpdump -i any -w tls.pcap port 443

# 抓完后用 Ctrl+C 停止
# 然后用 Wireshark 打开 tls.pcap 文件分析
# wireshark tls.pcap

# 也可以用 tcpdump 直接显示（不保存）
# -A 以 ASCII 显示内容
# -n 不解析域名
# -X 同时显示十六进制和 ASCII
sudo tcpdump -i any -A -n -X port 443
\`\`\`

### 5.1 Wireshark 中分析 TLS 握手

打开 Wireshark 后，在过滤栏输入 \`tls.handshake\` 可以只看握手相关包：

\`\`\`
# Wireshark 过滤表达式
tls.handshake                  # 只显示所有握手消息
tls.handshake.type == 1        # 只显示 ClientHello
tls.handshake.type == 2        # 只显示 ServerHello
tls.handshake.type == 11       # 只显示 Certificate
tls.handshake.type == 14       # 只显示 ServerHelloDone
tls.handshake.type == 16       # 只显示 ClientKeyExchange
tls.handshake.extensions_server_name == "example.com"  # 按 SNI 过滤
\`\`\`

Wireshark 能解析出每个字段的含义，是学习 TLS 协议最好的工具。

---

## 六、Demo 4：Python 模拟 TLS 1.2 握手流程（文字描述）

下面用 Python 代码"模拟"TLS 1.2 握手每一步，方便理解每条消息的语义。这只是文字描述，不是真实实现：

\`\`\`python
# tls_handshake_simulation.py
# 用 Python 文字模拟 TLS 1.2 握手流程
# 帮助理解每条消息的内容和作用

import secrets  # 用于生成安全的随机数

# ============================================================
# 模拟客户端
# ============================================================
class TLSClient:
    def __init__(self):
        # 客户端支持的 TLS 版本（从高到低）
        self.supported_versions = ["TLS 1.3", "TLS 1.2"]
        # 客户端支持的密码套件列表
        self.cipher_suites = [
            "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
            "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
            "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
        ]
        # 客户端随机数（32 字节，握手时生成）
        self.client_random = None
        # 服务器随机数（从 ServerHello 接收）
        self.server_random = None
        # 协商出的主密钥
        self.master_secret = None

    def send_client_hello(self, hostname):
        """构造 ClientHello 消息"""
        # 生成 32 字节的客户端随机数
        # 这个随机数会参与后续密钥派生，防止重放攻击
        self.client_random = secrets.token_bytes(32)
        return {
            "type": "ClientHello",
            "version": "TLS 1.2",
            "random": self.client_random.hex(),
            "session_id": "",  # 空表示全新会话
            "cipher_suites": self.cipher_suites,
            "extensions": {
                # SNI 扩展：告诉服务器要访问哪个域名
                "server_name": hostname,
                # ALPN 扩展：协商应用层协议
                "alpn": ["h2", "http/1.1"],
                # 支持的椭圆曲线
                "supported_groups": ["x25519", "secp256r1"],
            }
        }

    def receive_server_hello(self, msg):
        """处理服务器返回的 ServerHello"""
        self.server_random = bytes.fromhex(msg["random"])
        # 保存服务器选定的密码套件
        self.negotiated_cipher = msg["cipher_suite"]
        print(f"[客户端] 服务器选定了密码套件: {self.negotiated_cipher}")

    def verify_certificate(self, cert):
        """验证服务器证书"""
        # 实际中这一步很复杂：验证证书链、域名匹配、有效期、吊销状态
        # 这里只做简单演示
        if cert["valid"] and cert["domain_match"]:
            print(f"[客户端] 证书验证通过: {cert['subject']}")
            return True
        return False

    def compute_master_secret(self, pre_master):
        """根据 pre_master 和双方随机数计算 master_secret"""
        # 实际算法是 PRF（伪随机函数），这里简化为拼接
        material = pre_master + self.client_random + self.server_random
        # 真实实现：PRF(pre_master, "master secret", client_random + server_random)
        self.master_secret = material  # 简化演示
        return self.master_secret


# ============================================================
# 模拟服务器
# ============================================================
class TLSServer:
    def __init__(self):
        # 服务器的私钥（实际中严密保管）
        self.private_key = "server_private_key_demo"
        # 服务器的证书
        self.certificate = {
            "subject": "example.com",
            "issuer": "DigiCert",
            "valid": True,
            "domain_match": True,
            "public_key": "server_public_key_demo",
        }

    def process_client_hello(self, client_hello):
        """处理 ClientHello，选定参数"""
        # 从客户端支持的版本里选最高的（这里固定选 TLS 1.2）
        version = "TLS 1.2"
        # 从客户端列表里选一个最强的密码套件
        cipher = "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
        # 生成服务器随机数
        server_random = secrets.token_bytes(32)
        return {
            "type": "ServerHello",
            "version": version,
            "random": server_random.hex(),
            "cipher_suite": cipher,
        }

    def send_certificate(self):
        """发送证书"""
        return {"type": "Certificate", "cert": self.certificate}


# ============================================================
# 执行握手流程
# ============================================================
def simulate_handshake():
    print("=" * 60)
    print("TLS 1.2 握手流程模拟")
    print("=" * 60)

    client = TLSClient()
    server = TLSServer()

    # 第 1 步：ClientHello
    print("\\n[1] ClientHello")
    ch = client.send_client_hello("example.com")
    print(f"    客户端随机数: {ch['random'][:32]}...")
    print(f"    支持的密码套件: {len(ch['cipher_suites'])} 个")

    # 第 2 步：ServerHello
    print("\\n[2] ServerHello")
    sh = server.process_client_hello(ch)
    client.receive_server_hello(sh)
    print(f"    服务器随机数: {sh['random'][:32]}...")

    # 第 3 步：Certificate
    print("\\n[3] Certificate")
    cert = server.send_certificate()
    if not client.verify_certificate(cert["cert"]):
        print("    证书验证失败，握手中止！")
        return

    # 第 4-8 步省略（密钥交换等）
    print("\\n[4-8] 密钥交换、ChangeCipherSpec、Finished ...")
    print("    （略，详见后续章节）")

    print("\\n[握手完成] 开始传输加密应用数据")

simulate_handshake()
\`\`\`

运行后输出大致如下：

\`\`\`
============================================================
TLS 1.2 握手流程模拟
============================================================

[1] ClientHello
    客户端随机数: 8f3a2b1c4d5e6f70...
    支持的密码套件: 3 个

[2] ServerHello
    服务器选定了密码套件: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    服务器随机数: a1b2c3d4e5f60718...

[3] Certificate
    证书验证通过: example.com

[4-8] 密钥交换、ChangeCipherSpec、Finished ...
    （略，详见后续章节）

[握手完成] 开始传输加密应用数据
\`\`\`

---

## 七、Demo 5：握手中的随机数作用

很多人好奇：为什么要交换两个随机数？它们怎么参与密钥派生？

### 7.1 三个关键"秘密"

TLS 1.2 的密钥派生涉及三个值：

| 名称 | 来源 | 作用 |
|------|------|------|
| client_random | 客户端在 ClientHello 生成 | 防止重放，参与密钥派生 |
| server_random | 服务器在 ServerHello 生成 | 防止重放，参与密钥派生 |
| pre_master_secret | 密钥交换阶段产生 | 主秘密的种子 |

### 7.2 派生过程

\`\`\`python
# key_derivation_demo.py
# 演示 TLS 1.2 密钥派生流程（简化版）

import hashlib  # 用于模拟 PRF

# ============================================================
# 第 1 步：双方各自有 client_random 和 server_random
# ============================================================
client_random = b"client_random_32_bytes_placeholder_12"  # 实际 32 字节
server_random = b"server_random_32_bytes_placeholder_12"  # 实际 32 字节

# ============================================================
# 第 2 步：密钥交换产生 pre_master_secret
# （RSA 模式：客户端生成；ECDHE 模式：双方计算共享秘密）
# ============================================================
pre_master_secret = b"pre_master_secret_48_bytes_placeholder"  # 实际 48 字节

# ============================================================
# 第 3 步：用 PRF 派生 master_secret（48 字节）
# PRF(pre_master_secret, "master secret", client_random + server_random)
# ============================================================
def prf(secret, label, seed, length=48):
    """简化的 PRF（实际用 HMAC-SHA256）"""
    # 拼接 label 和 seed
    data = label.encode() + seed
    # 反复哈希扩展到指定长度
    result = b""
    counter = 0
    while len(result) < length:
        result += hashlib.sha256(secret + data + counter.to_bytes(1, 'big')).digest()
        counter += 1
    return result[:length]

# 派生 master_secret
master_secret = prf(
    pre_master_secret,
    "master secret",  # 标签字符串
    client_random + server_random,  # 种子
    length=48
)
print(f"master_secret: {master_secret.hex()[:32]}...")

# ============================================================
# 第 4 步：从 master_secret 派生 key_block
# key_block 包含：client_write_key, server_write_key, 各自 IV, MAC 密钥
# PRF(master_secret, "key expansion", server_random + client_random)
# ============================================================
key_block = prf(
    master_secret,
    "key expansion",  # 注意标签和顺序都变了
    server_random + client_random,  # 注意顺序：server 在前
    length=128  # 足够长，切出多个密钥
)
print(f"key_block: {key_block.hex()[:32]}...")

# ============================================================
# 第 5 步：从 key_block 切分出各方向密钥
# （以 AES-128-GCM 为例，每方 32 字节：16 字节密钥 + 4 字节 IV）
# ============================================================
client_write_key = key_block[0:16]    # 客户端加密用的对称密钥
server_write_key = key_block[16:32]   # 服务器加密用的对称密钥
client_write_iv = key_block[32:36]    # 客户端的 IV
server_write_iv = key_block[36:40]    # 服务器的 IV

print(f"client_write_key: {client_write_key.hex()}")
print(f"server_write_key: {server_write_key.hex()}")
\`\`\`

### 7.3 为什么要有两个随机数

**生活类比：** 想象两人约定暗号，每次见面要"对一次性的暗号"。如果只用一个固定暗号，被人偷听到一次就完了。两个随机数就像两人每次各掏出一个随机骰子，组合出独一无二的暗号，即使同两人下次再见，暗号也完全不同。

这样即使攻击者记录了所有通信，也无法重放——因为下次握手的随机数变了，密钥就变了。

---

## 八、Demo 6：握手完成后的应用数据传输

握手结束后，双方就用协商好的对称密钥加密所有应用数据：

\`\`\`bash
# 握手完成后，openssl s_client 进入交互模式
# 可以直接输入 HTTP 请求
openssl s_client -connect example.com:443 -servername example.com

# 握手完成后，输入以下内容（按回车两次结束）：
# GET / HTTP/1.1
# Host: example.com
#
# 服务器会返回 HTTP 响应，整个通信都是加密的
\`\`\`

### 8.1 用 openssl 单条命令发请求

\`\`\`bash
# 把 HTTP 请求通过管道传给 openssl
# printf 避免平台换行符差异
# \\r\\n 是 HTTP 协议要求的行结束符
printf "GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n" | \\
  openssl s_client -connect example.com:443 -servername example.com -quiet

# -quiet 安静模式，只显示 HTTP 响应，不显示握手详情
\`\`\`

### 8.2 对比明文 HTTP 和加密 HTTPS

\`\`\`bash
# 明文 HTTP：所有内容都是可见的
# 用 tcpdump 抓包能看到完整的 GET 请求和响应
printf "GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n" | nc example.com 80

# 加密 HTTPS：抓包只能看到密文
# 看不出 GET 还是 POST，看不出路径，看不出内容
printf "GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n" | \\
  openssl s_client -connect example.com:443 -servername example.com -quiet
\`\`\`

抓包对比：HTTP 流量里能清楚看到 \`GET / HTTP/1.1\`，HTTPS 流量里只能看到一串密文。

---

## 九、Demo 7：ClientHello 中的扩展

ClientHello 的扩展字段是 TLS 最灵活的部分，承载了大量协议演进的能力：

\`\`\`bash
# 用 openssl 查看 ClientHello 的所有扩展
# -tlsextdebug 打印 TLS 扩展调试信息
openssl s_client -connect example.com:443 -servername example.com -tlsextdebug < /dev/null

# 输出会列出客户端和服务器协商的所有扩展
\`\`\`

### 9.1 常见扩展说明

| 扩展名 | 作用 | 示例 |
|-------|------|------|
| server_name (SNI) | 告诉服务器访问的域名 | example.com |
| supported_versions | 协商 TLS 版本 | TLS 1.3, TLS 1.2 |
| key_share | 预先发送密钥交换公钥 | x25519 公钥 |
| signature_algorithms | 支持的签名算法 | rsa_pss_rsae_sha256 |
| supported_groups | 支持的椭圆曲线 | x25519, secp256r1 |
| ALPN | 协商应用层协议 | h2, http/1.1 |
| session_ticket | 会话票据（会话恢复） | 票据数据 |
| pre_shared_key | PSK（TLS 1.3 会话恢复） | PSK 标识 |
| early_data | 0-RTT 数据 | （TLS 1.3） |

### 9.2 SNI 的重要性

\`\`\`bash
# 不带 SNI：服务器可能返回默认证书
# 不指定 -servername，服务器不知道你要访问哪个域名
openssl s_client -connect 1.2.3.4:443 < /dev/null 2>&1 | grep subject

# 带 SNI：服务器返回对应域名的证书
# -servername 告诉服务器要访问的域名
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>&1 | grep subject

# 同一 IP 不同域名的证书可能不同
# 这就是 SNI 的作用——让一台服务器托管多个 HTTPS 站点
\`\`\`

**生活类比：** SNI 就像快递员敲门时说"我找张三"，主人知道该用哪张身份证回应。没有 SNI，主人只能拿出默认身份证，可能对不上号。

---

## 十、TLS 1.2 握手消息流程表

| 步骤 | 方向 | 消息 | 主要内容 | 是否加密 |
|------|------|------|---------|---------|
| 1 | C→S | ClientHello | 版本、随机数、密码套件列表、SNI、扩展 | 明文 |
| 2 | S→C | ServerHello | 选定版本、随机数、密码套件 | 明文 |
| 3 | S→C | Certificate | 服务器证书链 | 明文 |
| 4 | S→C | ServerKeyExchange | ECDHE 公钥参数（仅 ECDHE/DHE） | 明文 |
| 5 | S→C | ServerHelloDone | 服务器问候结束标志 | 明文 |
| 6 | C→S | ClientKeyExchange | 客户端密钥交换参数 | 明文 |
| 7 | C→S | ChangeCipherSpec | 切换到加密模式 | 标志 |
| 8 | C→S | Finished | 客户端握手验证数据 | 加密 |
| 9 | S→C | ChangeCipherSpec | 服务器切换到加密模式 | 标志 |
| 10 | S→C | Finished | 服务器握手验证数据 | 加密 |

### 10.1 握手过程中的关键变化

- **第 8 步开始加密**：从客户端 Finished 开始，所有消息都是加密的
- **第 10 步后开始应用数据**：服务器 Finished 验证通过后，正式进入应用数据传输阶段
- **总耗时 2-RTT**：从 ClientHello 发出到收到服务器 Finished，需要 2 个往返

---

## 十一、会话恢复：跳过完整握手

完整握手需要 2-RTT，开销不小。TLS 提供会话恢复机制，可以跳过大部分握手：

### 11.1 Session ID 恢复（TLS 1.0 引入）

\`\`\`bash
# 第一次连接，服务器分配 Session ID
# 输出中能看到 Session-ID: 一长串十六进制
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>&1 | grep "Session-ID"

# 第二次连接复用 Session ID，握手只需 1-RTT
# （openssl 会自动管理，实际中由 TLS 库处理）
\`\`\`

### 11.2 Session Ticket 恢复（TLS 1.2 引入）

服务器把会话状态加密成"票据"发给客户端，客户端下次带票据来，服务器解密后恢复会话：

\`\`\`nginx
# Nginx 配置会话票据
# ssl_session_tickets on;  # 开启会话票据（默认开启）
# ssl_session_ticket_key /path/to/key;  # 票据加密密钥
\`\`\`

### 11.3 会话恢复的优势

| 模式 | RTT | 握手消息数 | 服务器状态 |
|------|-----|-----------|-----------|
| 完整握手 | 2-RTT | 10 条 | 需要保存会话 |
| Session ID 恢复 | 1-RTT | 6 条 | 需要保存会话 |
| Session Ticket 恢复 | 1-RTT | 6 条 | 无状态（票据自带） |

---

## 本章小结

| 知识点 | 要点 |
|-------|------|
| 握手目的 | 协商算法、验证身份、交换密钥、确认完整性 |
| TLS 1.2 握手 | 2-RTT，10 条消息 |
| ClientHello | 客户端能力清单 + 随机数 + SNI + 扩展 |
| ServerHello | 服务器选定参数 + 随机数 |
| Certificate | 服务器证书链，客户端验证 CA/域名/有效期 |
| ServerKeyExchange | ECDHE 公钥参数（仅 DHE/ECDHE） |
| ClientKeyExchange | 客户端密钥交换参数 |
| ChangeCipherSpec | 通知对方"开始加密" |
| Finished | 握手完整性验证（防篡改关键） |
| 随机数作用 | 防重放，参与密钥派生 |
| 密钥派生 | pre_master → master_secret → key_block |
| 调试工具 | openssl -msg、tcpdump、Wireshark |
| 会话恢复 | Session ID / Session Ticket，1-RTT |
| 核心扩展 \| SNI、ALPN、supported_groups、key_share |`
  },

  // ============================================================
  // 第三章：密钥交换与密钥派生
  // ============================================================
  {
    id: "hs-key-exchange",
    group: "TLS 协议详解",
    icon: "🔀",
    title: "密钥交换与密钥派生",
    content: `# 密钥交换与密钥派生

## 一、为什么需要密钥交换

### 1.1 核心矛盾

TLS 最终要用**对称加密**保护应用数据（因为对称加密速度快）。但对称加密的致命问题是：**双方必须共享同一个密钥，而密钥不能在网上明文传输**。

这就形成一个"鸡生蛋"问题：

- 用对称加密传密钥？但你怎么把"加密用的密钥"传过去？又陷入同样问题
- 用明文传密钥？中间人能看到，密钥就泄露了

密钥交换协议（Key Exchange）就是为了解决这个矛盾——**让双方在完全公开的信道上，协商出一个只有彼此知道的共享密钥**。

**生活类比：** 想象两个陌生人要在众目睽睽下约定一个暗号，旁边全是偷听者，但最终两人知道暗号、偷听者却推不出来。这听起来不可能，但数学家发明了 Diffie-Hellman 算法，让这成为现实。

### 1.2 三种密钥交换方式

TLS 历史上用过三种密钥交换方式：

| 方式 | 原理 | 前向保密 | 状态 |
|------|------|---------|------|
| RSA | 客户端生成 pre_master，用服务器公钥加密发送 | 无 | TLS 1.3 已移除 |
| DHE | 离散对数 DH，双方交换公钥 | 有 | TLS 1.2 支持 |
| ECDHE | 椭圆曲线 DH，更高效 | 有 | 现代主流 |

下面逐一讲解。

---

## 二、RSA 密钥交换（已弃用）

### 2.1 工作原理

RSA 密钥交换的流程非常简单：

1. 客户端生成一个随机的 48 字节 pre_master_secret
2. 用服务器证书中的 RSA 公钥加密 pre_master_secret
3. 把密文通过 ClientKeyExchange 发给服务器
4. 服务器用 RSA 私钥解密，得到 pre_master_secret
5. 双方用 pre_master_secret 派生出 master_secret 和会话密钥

\`\`\`
客户端                                     服务器
  │                                          │
  │  1. 生成 pre_master_secret              │
  │  2. 用服务器公钥加密                     │
  │ ──── 密文(ClientKeyExchange) ─────────→  │
  │                                          │  3. 用私钥解密
  │                                          │  4. 得到 pre_master_secret
  │  5. 双方各自派生 master_secret           │
\`\`\`

### 2.2 致命缺陷：无前向保密

RSA 密钥交换的根本问题是：**pre_master_secret 的安全性完全取决于服务器私钥**。

假设攻击者今天录下了所有加密流量，但解不开。十年后服务器私钥泄露了——攻击者可以用私钥解出当年的 pre_master_secret，进而解出所有历史会话！

这就是"无前向保密"——**未来私钥泄露，会让历史通信全部暴露**。

### 2.3 为什么 TLS 1.3 移除了 RSA 密钥交换

正因为这个缺陷，TLS 1.3 彻底移除了 RSA 密钥交换，**强制使用 ECDHE**，保证所有会话都有前向保密。这是 TLS 1.3 最重要的安全改进之一。

---

## 三、Diffie-Hellman 密钥交换原理

### 3.1 数学基础：离散对数难题

DH 算法的安全性基于**离散对数难题**：

- 已知大素数 p 和生成元 g
- 计算 g^a mod p 容易（即使 a 很大）
- 但已知 g^a mod p 反推 a 极其困难（当 p 足够大时）

### 3.2 DH 交换流程

\`\`\`
客户端                                     服务器
  │                                          │
  │  公开参数：大素数 p, 生成元 g            │
  │                                          │
  │  1. 选随机数 a（私钥）                    │  1. 选随机数 b（私钥）
  │  2. 算公钥 A = g^a mod p                 │  2. 算公钥 B = g^b mod p
  │ ←──────── B ──────────────────────────  │
  │ ──────── A ──────────────────────────→  │
  │                                          │
  │  3. 计算 s = B^a mod p                  │  3. 计算 s = A^b mod p
  │     = (g^b)^a mod p                     │     = (g^a)^b mod p
  │     = g^(ab) mod p                      │     = g^(ab) mod p
  │                                          │
  │  两人得到相同的 s！                       │  两人得到相同的 s！
\`\`\`

**关键点：**

- 公开传输的只有 p、g、A、B
- 私钥 a、b 从不传输
- 中间人即使截获 A、B，也无法算出 a 或 b（离散对数难题）
- 最终双方都得到 g^(ab) mod p，这个值从未在网络上出现过

### 3.3 生活类比：颜色混合

DH 的经典类比是"颜色混合"：

1. 双方公开约定一种公开颜色（黄色）
2. 各自选一个秘密颜色（红/蓝），不告诉对方
3. 各自把秘密颜色和黄色混合，得到混合色（橙/绿），公开交换
4. 各自把对方的混合色和自己的秘密色再混合
5. 双方最终都得到"黄+红+蓝"的混合色
6. 中间人只看到橙和绿，无法分离出红和蓝

这就是 DH 的精髓：**正向混合容易，反向分离困难**。

### 3.4 前向保密的来源

DH 的精妙之处在于：**最终的共享秘密 s = g^(ab) mod p 从未在网络上传输**。服务器私钥只用于签名 DH 参数（防中间人篡改），不参与密钥计算。

所以即使服务器私钥泄露，攻击者也无法从录下的 A、B 推出 s——他仍然要解离散对数难题。这就是前向保密。

---

## 四、ECDHE：椭圆曲线 DH

### 4.1 为什么用椭圆曲线

经典 DH 需要很大的素数（2048 位以上）才安全，计算开销大。椭圆曲线密码学（ECC）能用更小的密钥达到同等安全性：

| 安全强度 | RSA/DH 密钥长度 | ECC 密钥长度 | 比例 |
|---------|----------------|-------------|------|
| 80 位 | 1024 | 160 | 6:1 |
| 112 位 | 2048 | 224 | 9:1 |
| 128 位 | 3072 | 256 | 12:1 |
| 192 位 | 7680 | 384 | 20:1 |
| 256 位 | 15360 | 521 | 30:1 |

**256 位 ECC ≈ 3072 位 RSA**，但计算速度快得多。所以 ECDHE 成为现代 TLS 的主流。

### 4.2 ECDHE 交换流程

ECDHE 流程和 DH 几乎一样，只是把"模幂运算"换成"椭圆曲线点乘"：

\`\`\`
客户端                                     服务器
  │                                          │
  │  公开参数：椭圆曲线（如 x25519）         │
  │                                          │
  │  1. 选随机数 a（私钥）                    │  1. 选随机数 b（私钥）
  │  2. 算公钥 A = a·G（G 是基点）           │  2. 算公钥 B = b·G
  │ ←──────── B ──────────────────────────  │
  │ ──────── A ──────────────────────────→  │
  │                                          │
  │  3. 计算 s = a·B = a·b·G                │  3. 计算 s = b·A = b·a·G
  │                                          │
  │  两人得到相同的 s                         │  两人得到相同的 s
\`\`\`

椭圆曲线离散对数难题：已知 G 和 a·G，反推 a 极其困难。

### 4.3 常用曲线

| 曲线 | 特点 | 应用 |
|------|------|------|
| x25519 | 速度快，常量时间实现，抗侧信道 | 现代主流 |
| secp256r1 (P-256) | NIST 标准，广泛兼容 | 传统主流 |
| secp384r1 (P-384) | 更高安全级别 | 高安全场景 |
| secp521r1 (P-521) | 最高安全级别 | 极高安全场景 |

x25519 是 Daniel Bernstein 设计的曲线，因性能和安全优势，已成为 TLS 1.3 的首选。

---

## 五、密钥派生

### 5.1 三层派生结构

TLS 1.2 的密钥派生是三层结构：

\`\`\`
pre_master_secret (48 字节)
        ↓ PRF("master secret", client_random + server_random)
master_secret (48 字节)
        ↓ PRF("key expansion", server_random + client_random)
key_block (按需长度)
        ↓ 切分
client_write_MAC_key, server_write_MAC_key,
client_write_key, server_write_key,
client_write_IV, server_write_IV
\`\`\`

### 5.2 key_block 的切分

key_block 按固定顺序切分出各个方向用的密钥：

| 字段 | 用途 | 长度（AES-128-GCM） |
|------|------|---------------------|
| client_write_key | 客户端→服务器的加密密钥 | 16 字节 |
| server_write_key | 服务器→客户端的加密密钥 | 16 字节 |
| client_write_IV | 客户端的初始向量 | 4 字节（隐式） |
| server_write_IV | 服务器的初始向量 | 4 字节（隐式） |

注意：**两个方向用不同的密钥**。这样即使一个方向的密钥被破解，另一个方向仍然安全。

### 5.3 PRF 的工作方式

TLS 1.2 的 PRF（伪随机函数）基于 HMAC：

\`\`\`
PRF(secret, label, seed) = P_hash(secret, label + seed)

P_hash(secret, seed) = HMAC_hash(secret, A(1) + seed) +
                       HMAC_hash(secret, A(2) + seed) +
                       HMAC_hash(secret, A(3) + seed) + ...

A(0) = seed
A(i) = HMAC_hash(secret, A(i-1))
\`\`\`

这个设计保证了输出可以无限扩展，且每个字节都依赖于 secret 和 seed。

---

## 六、HKDF：TLS 1.3 的密钥派生

### 6.1 为什么 TLS 1.3 用 HKDF

TLS 1.2 的 PRF 是"自制"的，TLS 1.3 改用标准的 HKDF（HMAC-based Key Derivation Function，RFC 5869）。HKDF 有两个阶段：

1. **Extract**：从输入材料提取出固定长度的伪随机密钥（PRK）
2. **Expand**：从 PRK 扩展出任意长度的密钥材料

### 6.2 HKDF 的优势

- 标准化：经过密码学界充分分析
- 更安全：Extract 阶段增强了输入材料的随机性
- 更灵活：可以分阶段派生不同用途的密钥
- 可组合：每个阶段的密钥独立，泄露一个不影响其他

### 6.3 TLS 1.3 的密钥派生层次

TLS 1.3 的密钥派生更复杂，分多个阶段：

\`\`\`
shared_secret (ECDHE 计算出)
    ↓ HKDF-Extract
early_secret (用于 0-RTT)
    ↓ HKDF-Extract + Derive-Secret
handshake_secret (用于握手加密)
    ↓ HKDF-Extract + Derive-Secret
master_secret (用于应用数据)
    ↓ Derive-Secret
client_handshake_traffic_secret, server_handshake_traffic_secret
client_application_traffic_secret, server_application_traffic_secret
\`\`\`

每个阶段的密钥独立，握手阶段密钥用完就丢弃，进一步降低风险。

---

## 七、Demo 1：Python 实现 DH 密钥交换

\`\`\`python
# dh_key_exchange.py
# 用 Python 演示 Diffie-Hellman 密钥交换
# 需要安装：pip install cryptography

from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

# ============================================================
# 第 1 步：生成 DH 参数（公开参数）
# 这相当于公开的 p 和 g
# ============================================================
# generator=2 是常用的生成元
# key_size=2048 是安全强度
params = dh.generate_parameters(generator=2, key_size=2048)
print("[公开] DH 参数已生成（p 和 g）")

# ============================================================
# 第 2 步：双方各自生成密钥对
# ============================================================
# 模拟客户端（A）
a_private = params.generate_private_key()  # 客户端私钥 a
a_public = a_private.public_key()          # 客户端公钥 A = g^a mod p
print("[客户端] 私钥已生成")

# 模拟服务器（B）
b_private = params.generate_private_key()  # 服务器私钥 b
b_public = b_private.public_key()          # 服务器公钥 B = g^b mod p
print("[服务器] 私钥已生成")

# ============================================================
# 第 3 步：交换公钥，计算共享秘密
# ============================================================
# 客户端用服务器公钥计算共享秘密
a_shared = a_private.exchange(b_public)  # s = B^a mod p
# 服务器用客户端公钥计算共享秘密
b_shared = b_private.exchange(a_public)  # s = A^b mod p

# 验证双方得到相同的共享秘密
print(f"[验证] 客户端共享秘密: {a_shared.hex()[:32]}...")
print(f"[验证] 服务器共享秘密: {b_shared.hex()[:32]}...")
assert a_shared == b_shared, "共享秘密不一致！"
print("[成功] 双方计算出相同的共享秘密！")

# ============================================================
# 第 4 步：用 HKDF 从共享秘密派生密钥
# ============================================================
# 直接用共享秘密做密钥不安全，需要用 KDF 派生
hkdf = HKDF(
    algorithm=hashes.SHA256(),  # 哈希算法
    length=32,                  # 输出 32 字节（256 位）密钥
    salt=None,                  # 盐值（可加额外随机性）
    info=b"tls-dh-demo-key",    # 上下文信息
)
# 双方各自用相同输入派生出相同密钥
key_a = hkdf.derive(a_shared)
key_b = hkdf.derive(b_shared)
print(f"[派生] 客户端密钥: {key_a.hex()}")
print(f"[派生] 服务器密钥: {key_b.hex()}")
assert key_a == key_b
print("[完成] 双方派生出相同的对称密钥")
\`\`\`

运行后输出大致：

\`\`\`
[公开] DH 参数已生成（p 和 g）
[客户端] 私钥已生成
[服务器] 私钥已生成
[验证] 客户端共享秘密: 8f3a2b1c4d5e6f70...
[验证] 服务器共享秘密: 8f3a2b1c4d5e6f70...
[成功] 双方计算出相同的共享秘密！
[派生] 客户端密钥: a1b2c3d4e5f60718...
[派生] 服务器密钥: a1b2c3d4e5f60718...
[完成] 双方派生出相同的对称密钥
\`\`\`

---

## 八、Demo 2：Python ECDHE 密钥交换

\`\`\`python
# ecdhe_key_exchange.py
# 用 Python 演示 ECDHE（椭圆曲线 DH）密钥交换
# 需要安装：pip install cryptography

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

# ============================================================
# 第 1 步：双方各自生成 ECDHE 密钥对
# 使用 SECP256R1 曲线（即 P-256，NIST 标准曲线）
# ============================================================
# 客户端生成私钥（随机数 a）和公钥（点 a·G）
a_private = ec.generate_private_key(ec.SECP256R1())
a_public = a_private.public_key()
print("[客户端] ECDHE 私钥已生成（P-256 曲线）")

# 服务器生成私钥（随机数 b）和公钥（点 b·G）
b_private = ec.generate_private_key(ec.SECP256R1())
b_public = b_private.public_key()
print("[服务器] ECDHE 私钥已生成（P-256 曲线）")

# ============================================================
# 第 2 步：交换公钥，计算共享秘密
# ============================================================
# 客户端用服务器公钥计算共享秘密（点 a·B = a·b·G）
a_shared = a_private.exchange(ec.ECDH(), b_public)
# 服务器用客户端公钥计算共享秘密（点 b·A = b·a·G）
b_shared = b_private.exchange(ec.ECDH(), a_public)

# 验证双方得到相同的共享秘密
print(f"[验证] 客户端共享秘密: {a_shared.hex()[:32]}...")
print(f"[验证] 服务器共享秘密: {b_shared.hex()[:32]}...")
assert a_shared == b_shared, "ECDHE 共享秘密不一致！"
print("[成功] 双方 ECDHE 共享秘密一致！")

# ============================================================
# 第 3 步：用 HKDF 派生密钥
# ============================================================
hkdf = HKDF(
    algorithm=hashes.SHA256(),
    length=32,
    salt=None,
    info=b"tls-ecdhe-demo",
)
key = hkdf.derive(a_shared)
print(f"[派生] 对称密钥: {key.hex()}")

# ============================================================
# 性能对比：ECDHE 比 DH 快得多
# ============================================================
import time

# 测试 ECDHE 速度
start = time.time()
for _ in range(100):
    k1 = ec.generate_private_key(ec.SECP256R1())
    k2 = ec.generate_private_key(ec.SECP256R1())
    k1.exchange(ec.ECDH(), k2.public_key())
ecdhe_time = time.time() - start
print(f"[性能] ECDHE 100 次: {ecdhe_time:.3f} 秒")
\`\`\`

---

## 九、Demo 3：HKDF 密钥派生详解

\`\`\`python
# hkdf_demo.py
# 详细演示 HKDF 的 Extract 和 Expand 两个阶段
# 需要安装：pip install cryptography

from cryptography.hazmat.primitives.kdf.hkdf import HKDF, HKDFExpand
from cryptography.hazmat.primitives import hashes
import os

# ============================================================
# 输入：共享秘密（ECDHE 计算出的）
# ============================================================
shared_secret = os.urandom(32)  # 模拟 ECDHE 共享秘密
print(f"[输入] 共享秘密: {shared_secret.hex()}")

# ============================================================
# 阶段 1：Extract
# 从输入材料提取出伪随机密钥（PRK）
# PRK = HMAC(salt, IKM)
# ============================================================
salt = os.urandom(32)  # 盐值，增加随机性
# HKDF 的 derive 方法内部包含了 Extract + Expand
# 这里直接用完整 HKDF
hkdf = HKDF(
    algorithm=hashes.SHA256(),  # 哈希算法
    length=32,                  # 输出长度
    salt=salt,                  # 盐值
    info=b"tls13-demo-key",     # 上下文信息
)
prk = hkdf.derive(shared_secret)
print(f"[Extract] 伪随机密钥 PRK: {prk.hex()}")

# ============================================================
# 阶段 2：Expand
# 从 PRK 扩展出多个不同用途的密钥
# ============================================================
# 派生客户端写入密钥
expand = HKDFExpand(
    algorithm=hashes.SHA256(),
    length=32,
    info=b"client-write-key",  # 不同的 info 派生不同密钥
)
client_key = expand.derive(prk)
print(f"[Expand] 客户端密钥: {client_key.hex()}")

# 派生服务器写入密钥
expand = HKDFExpand(
    algorithm=hashes.SHA256(),
    length=32,
    info=b"server-write-key",  # 不同的 info
)
server_key = expand.derive(prk)
print(f"[Expand] 服务器密钥: {server_key.hex()}")

# 验证两个密钥不同
assert client_key != server_key, "两个方向密钥不能相同！"
print("[验证] 客户端和服务器密钥不同，符合预期")

# ============================================================
# TLS 1.3 中的实际用法（概念演示）
# ============================================================
print("\\n[TLS 1.3 密钥派生层次]")
print("  shared_secret")
print("    ↓ HKDF-Extract(salt=0)")
print("  early_secret (用于 0-RTT)")
print("    ↓ HKDF-Extract(salt=derived)")
print("  handshake_secret (用于握手加密)")
print("    ↓ HKDF-Extract(salt=derived)")
print("  master_secret (用于应用数据)")
print("    ↓ Derive-Secret")
print("  client/server traffic secrets")
\`\`\`

---

## 十、Demo 4：演示前向保密的重要性

\`\`\`python
# forward_secrecy_demo.py
# 演示前向保密的价值
# 对比 RSA 密钥交换（无前向保密）和 ECDHE（有前向保密）

from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
import os

print("=" * 60)
print("前向保密演示")
print("=" * 60)

# ============================================================
# 场景一：RSA 密钥交换（无前向保密）
# ============================================================
print("\\n[场景一] RSA 密钥交换（无前向保密）")

# 服务器有一对 RSA 密钥
server_rsa = rsa.generate_private_key(public_exponent=65537, key_size=2048)
server_public = server_rsa.public_key()

# 客户端生成 pre_master，用服务器公钥加密
pre_master = os.urandom(48)
ciphertext = server_public.encrypt(
    pre_master,
    padding.PKCS1v15()  # RSA 加密填充
)
print("  客户端：用服务器公钥加密 pre_master")
print("  网络上传输的是密文")

# 攻击者录下了密文，现在解不开
print("  攻击者录下密文，但解不开")

# 多年后服务器私钥泄露
print("  [假设] 服务器私钥泄露！")

# 攻击者用泄露的私钥解密当年的密文
recovered = server_rsa.decrypt(ciphertext, padding.PKCS1v15())
print(f"  攻击者用私钥解出 pre_master: {recovered.hex()[:32]}...")
assert recovered == pre_master
print("  [结论] 历史会话全部暴露！无前向保密")

# ============================================================
# 场景二：ECDHE 密钥交换（有前向保密）
# ============================================================
print("\\n[场景二] ECDHE 密钥交换（有前向保密）")

# 服务器有证书私钥（用于签名，不用于加密）
# 双方各自生成临时 ECDHE 密钥
client_ec = ec.generate_private_key(ec.SECP256R1())
server_ec = ec.generate_private_key(ec.SECP256R1())

# 交换公钥（网络上传输的是公钥）
client_shared = client_ec.exchange(ec.ECDH(), server_ec.public_key())
server_shared = server_ec.exchange(ec.ECDH(), client_ec.public_key())
assert client_shared == server_shared
print("  双方计算共享秘密成功")

# 攻击者录下了双方的公钥
print("  攻击者录下双方公钥，但无法算出共享秘密")
print("  （需要解椭圆曲线离散对数难题）")

# 多年后服务器证书私钥泄露
print("  [假设] 服务器证书私钥泄露！")
print("  但 ECDHE 私钥是临时的，早已销毁")
print("  攻击者仍无法算出共享秘密")
print("  [结论] 历史会话仍然安全！有前向保密")

# ============================================================
# 总结对比
# ============================================================
print("\\n" + "=" * 60)
print("总结：")
print("  RSA 密钥交换：私钥泄露 → 历史全暴露")
print("  ECDHE 密钥交换：私钥泄露 → 历史仍安全")
print("  这就是为什么 TLS 1.3 强制 ECDHE！")
print("=" * 60)
\`\`\`

---

## 十一、Demo 5：RSA vs ECDHE 密钥交换对比

\`\`\`bash
# 用 openssl 分别测试 RSA 和 ECDHE 密码套件

# ============================================================
# 测试 RSA 密钥交换（无前向保密）
# RSA 密码套件：TLS_RSA_WITH_AES_128_GCM_SHA256
# ============================================================
# -cipher 指定密码套件
openssl s_client -connect example.com:443 -servername example.com \\
  -cipher 'AES128-GCM-SHA256' < /dev/null 2>&1 | grep "Cipher"

# 注意：现代网站基本不再支持纯 RSA 套件
# 输出可能是 "handshake failure"

# ============================================================
# 测试 ECDHE 密钥交换（有前向保密）
# ============================================================
openssl s_client -connect example.com:443 -servername example.com \\
  -cipher 'ECDHE-RSA-AES128-GCM-SHA256' < /dev/null 2>&1 | grep "Cipher"

# 大多数现代网站会支持这个套件
# 输出：Cipher : ECDHE-RSA-AES128-GCM-SHA256

# ============================================================
# 查看握手时使用的密钥交换算法
# ============================================================
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>&1 | grep -E "(Cipher|Protocol)"

# 输出中的密码套件名包含密钥交换算法：
# ECDHE-RSA-... → ECDHE 密钥交换 + RSA 认证
# DHE-RSA-...   → DHE 密钥交换 + RSA 认证
# RSA-...       → RSA 密钥交换（无前向保密）
\`\`\`

---

## 十二、密钥交换方式对比表

| 方式 | 算法基础 | 密钥长度 | 速度 | 前向保密 | TLS 版本 | 状态 |
|------|---------|---------|------|---------|---------|------|
| RSA | RSA 加解密 | 2048+ | 中 | 无 | 1.0-1.2 | TLS 1.3 移除 |
| DHE | 离散对数 | 2048+ | 慢 | 有 | 1.0-1.2 | 性能差少用 |
| ECDHE | 椭圆曲线 | 256 | 快 | 有 | 1.0-1.3 | 现代主流 |

### 12.1 关键观察

- **RSA 密钥交换已被淘汰**：无前向保密，TLS 1.3 强制移除
- **DHE 性能太差**：2048 位模幂运算开销大，逐渐被 ECDHE 取代
- **ECDHE 是现代标准**：256 位椭圆曲线 + 常量时间实现，既安全又快速
- **x25519 曲线最受欢迎**：性能和安全性都优于 NIST 曲线

### 12.2 密码套件命名规则

理解密钥交换后，密码套件命名就清楚了：

\`\`\`
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
     │      │        │       │    │
     │      │        │       │    └─ 消息认证：SHA256
     │      │        │       └────── 加密：AES-128-GCM
     │      │        └────────────── WITH（固定分隔）
     │      └─────────────────────── 认证：RSA（证书签名）
     └────────────────────────────── 密钥交换：ECDHE
\`\`\`

- **密钥交换**：ECDHE（产生会话密钥）
- **认证**：RSA（证书用什么算法签名，验证服务器身份）
- **加密**：AES-128-GCM（应用数据加密）
- **认证**：SHA256（消息认证码算法）

注意：密钥交换算法和认证算法是独立的。ECDHE_RSA 表示"ECDHE 交换 + RSA 签名认证"，ECDHE_ECDSA 则是"ECDHE 交换 + ECDSA 签名认证"。

---

## 本章小结

| 知识点 | 要点 |
|-------|------|
| 密钥交换目的 | 在公开信道协商共享密钥，不传输密钥 |
| RSA 密钥交换 | 客户端加密 pre_master 发送，无前向保密 |
| DHE 原理 | 离散对数难题，双方交换公钥算共享秘密 |
| ECDHE 原理 | 椭圆曲线离散对数，更高效更安全 |
| 前向保密 | 私钥泄露不影响历史会话 |
| DH 数学基础 | g^(ab) mod p，双方算出相同值，中间人无法反推 |
| 颜色类比 | 公开色+秘密色混合，正向容易反向难 |
| 椭圆曲线优势 | 256 位 ECC ≈ 3072 位 RSA，速度快 |
| x25519 曲线 | 现代首选，常量时间实现抗侧信道 |
| 密钥派生 | pre_master → master_secret → key_block |
| PRF (TLS 1.2) | 基于 HMAC，可无限扩展 |
| HKDF (TLS 1.3) | Extract + Expand 两阶段，标准化 |
| 两个方向密钥 | client_write_key 和 server_write_key 独立 |
| 密码套件命名 | 密钥交换_认证_WITH_加密_认证 |
| TLS 1.3 强制 \| 移除 RSA 交换，强制 ECDHE 前向保密 |`
  },

  // ============================================================
  // 第四章：记录层与对称加密
  // ============================================================
  {
    id: "hs-record-layer",
    group: "TLS 协议详解",
    icon: "📦",
    title: "记录层与对称加密",
    content: `# 记录层与对称加密

## 一、TLS 记录层简介

握手协议完成"协商"后，所有应用数据都由**记录协议（Record Protocol）**处理。记录层是 TLS 真正"干活"的地方——把应用层来的数据切块、加密、加完整性校验、交给 TCP 传输。

**生活类比：** 如果握手协议是两个人见面"对暗号"，那么记录协议就是两人之后"用暗号通信"的过程。每说一句话，都要用约定的方式加密、编号、签名，确保对方能解开、能验证没被篡改、能按顺序拼回原文。

### 1.1 记录层的职责

记录层负责：

1. **分块（Fragmentation）**：把应用层的大数据流切分成不超过 16384 字节的块
2. **压缩（可选，已禁用）**：早期 TLS 支持压缩，因 CRIME 攻击已禁用
3. **加密**：用握手协商的对称密钥加密
4. **完整性校验**：附加 MAC 或用 AEAD 自带的认证
5. **传输**：把加密后的记录交给 TCP

### 1.2 记录层不只是处理应用数据

记录层处理 4 种内容类型：

| 内容类型 | 值 | 说明 |
|---------|---|------|
| ChangeCipherSpec | 20 | 切换加密模式（握手阶段） |
| Alert | 21 | 警告/错误消息 |
| Handshake | 22 | 握手消息 |
| Application Data | 23 | 应用数据（最常见） |

也就是说，握手消息本身也是通过记录层传输的（握手前是明文，握手后是加密）。这是 TLS 协议的精妙之处——**记录层是统一的"信封"，里面可以装不同类型的信件**。

---

## 二、TLS 记录的结构

每条 TLS 记录的固定结构：

\`\`\`
┌────────────┬────────────┬──────────────┬──────────────────────┐
│ ContentType│  Version   │    Length    │   Fragment (载荷)    │
│  1 字节    │  2 字节    │   2 字节     │   0-16384 字节       │
└────────────┴────────────┴──────────────┴──────────────────────┘
\`\`\`

各字段含义：

| 字段 | 长度 | 说明 | 示例 |
|------|------|------|------|
| ContentType | 1 字节 | 内容类型 | 23（应用数据） |
| Version | 2 字节 | TLS 版本 | 0x0303（TLS 1.2） |
| Length | 2 字节 | 载荷长度 | 不超过 16384 |
| Fragment | 变长 | 实际数据 | 加密后的密文 |

### 2.1 加密后的记录结构

对于 AEAD 加密（TLS 1.2 GCM 模式和 TLS 1.3），加密后的记录变成：

\`\`\`
┌────────────┬────────────┬──────────────┬──────────────────────────┐
│ ContentType│  Version   │    Length    │  密文 + AEAD Tag (16字节) │
│  1 字节    │  2 字节    │   2 字节     │                          │
└────────────┴────────────┴──────────────┴──────────────────────────┘
\`\`\`

注意：**记录头（前 5 字节）是明文**，只有载荷是加密的。记录头需要明文是因为接收方要先知道长度才能读取。但记录头会被 AEAD 的 AAD（附加认证数据）覆盖，确保不会被篡改。

### 2.2 为什么限制 16384 字节

TLS 记录最大 16384 字节（2^14），原因：

1. **内存控制**：接收方需要分配缓冲区，限制大小避免内存耗尽
2. **加密效率**：过大的块加密失败重传成本高
3. **协议规范**：RFC 定义，所有实现必须遵守

如果应用层数据超过 16384 字节（如大文件上传），TLS 会自动分多条记录传输，对应用层透明。

---

## 三、AEAD 加密

### 3.1 什么是 AEAD

AEAD（Authenticated Encryption with Associated Data，认证加密）是现代密码学的核心概念。它**一次性完成加密和完整性校验**：

- **加密**：保证机密性，外人看不到内容
- **认证**：保证完整性，数据被改一比特就解密失败
- **关联数据（AAD）**：额外的明文数据也参与认证，但本身不加密

### 3.2 AEAD vs 传统 MAC-then-Encrypt

TLS 1.2 之前用 MAC-then-Encrypt（先算 MAC 再加密），有几个问题：

1. 接收方要先解密才能验证 MAC，容易遭 padding oracle 攻击
2. 加密和认证是分离的两步，实现容易出错
3. 无法认证"明文的元数据"（如记录头）

AEAD 把加密和认证合并成一个原子操作：

| 方式 | 加密 | 认证 | 问题 |
|------|------|------|------|
| MAC-then-Encrypt | 先加密 | MAC 在密文里 | 易遭 padding oracle |
| Encrypt-then-MAC | 先加密 | MAC 在密文外 | 需两次操作 |
| AEAD | 一次完成 | 一次完成 | 现代 TLS 标准 |

### 3.3 TLS 1.2 中常用的 AEAD 算法

| 算法 | 密钥长度 | Nonce 长度 | Tag 长度 | 性能 |
|------|---------|-----------|---------|------|
| AES-128-GCM | 128 位 | 12 字节 | 16 字节 | 快（有硬件加速） |
| AES-256-GCM | 256 位 | 12 字节 | 16 字节 | 中 |
| ChaCha20-Poly1305 | 256 位 | 12 字节 | 16 字节 | 快（无硬件加速时更快） |

### 3.4 Nonce 的构造

AEAD 需要一个 Nonce（一次性随机数），TLS 用"隐式 IV + 序列号"构造：

\`\`\`
Nonce = 隐式 IV (4 字节) || 序列号 (8 字节)
                       （每条记录加 1）
\`\`\`

这样不需要每条记录都传 Nonce，节省空间。序列号保证每条记录的 Nonce 都不同。

---

## 四、密钥分块

握手派生出 key_block 后，按固定顺序切分出各方向密钥：

\`\`\`
key_block 切分顺序：
┌──────────────────────┬──────────────────────┬──────────┬──────────┐
│ client_write_key     │ server_write_key     │ client_  │ server_  │
│ (16/32 字节)         │ (16/32 字节)         │ write_IV │ write_IV │
└──────────────────────┴──────────────────────┴──────────┴──────────┘
\`\`\`

### 4.1 为什么两个方向用不同密钥

**关键安全设计：客户端→服务器 和 服务器→客户端 用不同的密钥。**

这样设计的好处：

1. **隔离风险**：即使一个方向的密钥被破解，另一个方向仍安全
2. **防止反射攻击**：攻击者无法把客户端发的密文"反射"回客户端解密
3. **方向明确**：每条记录只能被正确方向的一方解密

### 4.2 序列号防重放

每个方向维护一个独立的序列号，从 0 开始每条记录加 1：

- 客户端发送的第 1 条记录序列号 = 0
- 客户端发送的第 2 条记录序列号 = 1
- ...
- 服务器发送的第 1 条记录序列号 = 0
- ...

接收方会检查序列号：

1. 必须严格递增
2. 不能重复（防重放）
3. 不能跳变（防丢弃）

如果攻击者重放一条旧记录，序列号对不上，直接丢弃。

**生活类比：** 序列号就像快递单号，每个包裹唯一编号，收件人按编号检查有没有重复或缺失。攻击者复制一个旧包裹重发，单号对不上立即被发现。

---

## 五、Demo 1：用 openssl s_client 看记录层

\`\`\`bash
# 连接服务器，观察 TLS 记录
# -msg 显示所有 TLS 消息
openssl s_client -connect example.com:443 -servername example.com -msg < /dev/null

# 输出中能看到各种记录类型：
# <<< TLS 1.2, Handshake [length xxx]   ← 握手记录
# <<< TLS 1.2, ChangeCipherSpec [length 0001]  ← 切换加密
# <<< TLS 1.2, ApplicationData [length xxx]    ← 应用数据（加密）
\`\`\`

### 5.1 用 -debug 看记录层细节

\`\`\`bash
# -debug 显示更详细的记录层信息
# 包括每条记录的十六进制内容
openssl s_client -connect example.com:443 -servername example.com -debug < /dev/null 2>&1 | head -100

# 输出会显示：
# write to 0x...
# XXXX - <十六进制数据>
# read from 0x...
# XXXX - <十六进制数据>
\`\`\`

---

## 六、Demo 2：Wireshark 解析 TLS 记录结构

在 Wireshark 中打开 TLS 抓包，展开每条记录能看到详细字段：

\`\`\`
TLS 1.2 Record Layer: Application Data Protocol: http-over-tls
    Content Type: Application Data (23)      ← 内容类型
    Version: TLS 1.2 (0x0303)                ← 版本
    Length: 327                               ← 载荷长度
    Encrypted Application Data: ...           ← 加密的载荷
\`\`\`

### 6.1 不同记录类型的 Wireshark 显示

\`\`\`bash
# Wireshark 过滤不同记录类型
# 看握手记录
tls.record.content_type == 22

# 看 ChangeCipherSpec
tls.record.content_type == 20

# 看应用数据（加密后的）
tls.record.content_type == 23

# 看 Alert（警告/错误）
tls.record.content_type == 21
\`\`\`

### 6.2 观察加密前后对比

在 Wireshark 中对比：

- **握手前**的记录（如 ClientHello）：能看到明文字段
- **握手后**的记录（如 Finished、ApplicationData）：只能看到密文

这就是 TLS 的核心价值——握手后所有数据都是不可读的密文。

---

## 七、Demo 3：对比不同密码套件的速度

openssl speed 可以测试不同加密算法的性能：

\`\`\`bash
# 测试 AES-128-GCM 速度（主流，有 AES-NI 硬件加速）
# -evp 指定加密算法
# -seconds 5 测试 5 秒
openssl speed -evp aes-128-gcm -seconds 5

# 测试 AES-256-GCM 速度
openssl speed -evp aes-256-gcm -seconds 5

# 测试 ChaCha20-Poly1305 速度
# 在没有 AES-NI 的设备上（如旧手机），ChaCha20 更快
openssl speed -evp chacha20-poly1305 -seconds 5

# 对比测试：同时测多个算法
openssl speed -evp aes-128-gcm -evp aes-256-gcm -evp chacha20-poly1305 -seconds 3
\`\`\`

### 7.1 输出解读

输出类似：

\`\`\`bash
# type             16 bytes   64 bytes  256 bytes 1024 bytes 8192 bytes
aes-128-gcm         50000.00   60000.00   70000.00   75000.00   78000.00
aes-256-gcm         45000.00   55000.00   65000.00   70000.00   73000.00
chacha20-poly1305   40000.00   50000.00   60000.00   68000.00   72000.00
\`\`\`

数字表示每秒能加密多少千字节（KB/s）。通常：

- **有 AES-NI 的 CPU**：AES-GCM 比 ChaCha20 快
- **无 AES-NI 的 CPU**（旧手机/嵌入式）：ChaCha20 更快
- 这就是为什么现代 TLS 同时支持两者，让客户端根据能力选择

### 7.2 服务器配置建议

\`\`\`nginx
# Nginx 配置：同时支持 AES-GCM 和 ChaCha20
# 顺序很重要，前面的优先级高
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';

# 让客户端根据自身能力选择（移动端会选 ChaCha20）
# ssl_prefer_server_ciphers off;  # 关闭服务器偏好，让客户端选
\`\`\`

---

## 八、Demo 4：密码套件命名规则详解

### 8.1 TLS 1.2 密码套件命名

\`\`\`
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    │      │       │       │    │
    │      │       │       │    └─ PRF/消息认证：SHA256
    │      │       │       └────── 加密算法：AES-128-GCM
    │      │       └────────────── WITH（固定分隔符）
    │      └────────────────────── 认证算法：RSA
    └────────────────────────────── 密钥交换：ECDHE
\`\`\`

### 8.2 各部分含义

| 部分 | 作用 | 常见值 |
|------|------|-------|
| 密钥交换 | 如何协商会话密钥 | ECDHE / DHE / RSA |
| 认证 | 证书用什么算法签名 | RSA / ECDSA |
| 加密 | 应用数据加密 | AES-128-GCM / AES-256-GCM / ChaCha20-Poly1305 |
| PRF/MAC | 密钥派生和消息认证 | SHA256 / SHA384 |

### 8.3 常见密码套件示例

\`\`\`bash
# ECDHE + RSA 认证 + AES-128-GCM 加密
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256

# ECDHE + RSA 认证 + AES-256-GCM 加密（更安全）
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384

# ECDHE + RSA 认证 + ChaCha20-Poly1305（移动端友好）
TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256

# ECDHE + ECDSA 认证（需要 ECDSA 证书）
TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256

# 纯 RSA 密钥交换（无前向保密，已淘汰）
TLS_RSA_WITH_AES_128_GCM_SHA256
\`\`\`

### 8.4 TLS 1.3 密码套件命名（大幅简化）

TLS 1.3 中密码套件命名简化，因为密钥交换和认证不再由套件决定：

\`\`\`
TLS_AES_256_GCM_SHA384
    │          │    │
    │          │    └─ PRF/消息认证
    │          └────── 加密算法
    └───────────────── TLS 前缀（无密钥交换和认证）
\`\`\`

TLS 1.3 只有 5 个密码套件，详见下一章。

---

## 九、Demo 5：查看服务器支持的密码套件

\`\`\`bash
# 用 openssl 看协商出的密码套件
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>&1 | grep "Cipher"

# 输出示例：
# Cipher  : ECDHE-RSA-AES128-GCM-SHA256

# ============================================================
# 用 nmap 枚举所有支持的密码套件
# ============================================================
nmap --script ssl-enum-ciphers -p 443 example.com

# 输出会按 TLS 版本分组列出所有密码套件及评级
\`\`\`

### 9.1 测试特定密码套件

\`\`\`bash
# 测试服务器是否支持特定密码套件
# -cipher 指定要测试的套件
openssl s_client -connect example.com:443 -servername example.com \\
  -cipher 'ECDHE-RSA-AES256-GCM-SHA384' < /dev/null 2>&1 | grep "Cipher"

# 测试 ChaCha20-Poly1305
openssl s_client -connect example.com:443 -servername example.com \\
  -cipher 'ECDHE-RSA-CHACHA20-POLY1305' < /dev/null 2>&1 | grep "Cipher"

# 测试不安全的套件（应该都失败了）
openssl s_client -connect example.com:443 -servername example.com \\
  -cipher 'RC4-MD5' < /dev/null 2>&1 | grep "Cipher"
# 输出：handshake failure
\`\`\`

### 9.2 查看客户端支持的密码套件

\`\`\`bash
# 查看 openssl 默认支持的密码套件
openssl ciphers -v

# 只看 TLS 1.2 的套件
openssl ciphers -v 'TLSv1.2'

# 只看高强度的套件
openssl ciphers -v 'HIGH'

# 只看 AEAD 套件（GCM 和 ChaCha20）
openssl ciphers -v 'AEAD'
\`\`\`

---

## 十、Demo 6：AEAD 加密演示

\`\`\`python
# aead_demo.py
# 演示 AEAD（AES-GCM）加密
# 需要安装：pip install cryptography

import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ============================================================
# AES-GCM 加密演示
# ============================================================

# 1. 生成密钥（256 位 = 32 字节）
key = AESGCM.generate_key(bit_length=256)
print(f"[密钥] {key.hex()}")

# 2. 创建 AESGCM 对象
aes = AESGCM(key)

# 3. 生成 Nonce（12 字节，TLS 中由 IV + 序列号构造）
nonce = os.urandom(12)
print(f"[Nonce] {nonce.hex()}")

# 4. 明文数据（要加密的内容）
plaintext = b"GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n"
print(f"[明文] {plaintext}")

# 5. 附加认证数据（AAD）
# TLS 中 AAD 是记录头（类型+版本+长度）
# AAD 本身不加密，但参与认证，防止被篡改
associated_data = b"\\x17\\x03\\x03" + len(plaintext).to_bytes(2, 'big')
print(f"[AAD] 记录头: {associated_data.hex()}")

# 6. 加密（自动生成 Tag）
ciphertext = aes.encrypt(nonce, plaintext, associated_data)
print(f"[密文+Tag] {ciphertext.hex()}")
# 密文长度 = 明文长度 + 16 字节 Tag

# ============================================================
# 解密验证
# ============================================================
# 解密时需要相同的 nonce 和 AAD
decrypted = aes.decrypt(nonce, ciphertext, associated_data)
print(f"[解密] {decrypted}")
assert decrypted == plaintext
print("[成功] 解密成功，内容一致")

# ============================================================
# 演示篡改检测
# ============================================================
print("\\n[篡改测试]")
# 篡改密文的最后一个字节
tampered = bytearray(ciphertext)
tampered[-1] ^= 0x01  # 翻转一个比特
try:
    aes.decrypt(nonce, bytes(tampered), associated_data)
    print("  错误：篡改未被检测到！")
except Exception as e:
    print(f"  [成功] 检测到篡改：{type(e).__name__}")

# ============================================================
# 演示 AAD 的重要性
# ============================================================
print("\\n[AAD 篡改测试]")
# 篡改 AAD（模拟篡改记录头）
tampered_aad = b"\\x17\\x03\\x03" + (len(plaintext) + 100).to_bytes(2, 'big')
try:
    aes.decrypt(nonce, ciphertext, tampered_aad)
    print("  错误：AAD 篡改未被检测到！")
except Exception as e:
    print(f"  [成功] 检测到 AAD 篡改：{type(e).__name__}")
\`\`\`

运行后输出：

\`\`\`
[密钥] a1b2c3d4e5f6...
[Nonce] 112233445566778899aabbcc
[明文] b'GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n'
[AAD] 记录头: 1703030026
[密文+Tag] 8f3a2b1c...（明文长度的密文 + 16 字节 Tag）
[解密] b'GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n'
[成功] 解密成功，内容一致

[篡改测试]
  [成功] 检测到篡改：InvalidTag

[AAD 篡改测试]
  [成功] 检测到 AAD 篡改：InvalidTag
\`\`\`

### 10.1 ChaCha20-Poly1305 对比演示

\`\`\`python
# chacha_demo.py
# 演示 ChaCha20-Poly1305 加密
# 在没有 AES-NI 的设备上更快

import os
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305

# 1. 生成密钥（256 位）
key = ChaCha20Poly1305.generate_key(bit_length=256)
print(f"[密钥] {key.hex()}")

# 2. 创建 ChaCha20Poly1305 对象
chacha = ChaCha20Poly1305(key)

# 3. 生成 Nonce（12 字节）
nonce = os.urandom(12)

# 4. 加密
plaintext = b"Hello, TLS Record Layer!"
aad = b"\\x17\\x03\\x03\\x00\\x18"  # 模拟记录头
ciphertext = chacha.encrypt(nonce, plaintext, aad)
print(f"[密文] {ciphertext.hex()}")

# 5. 解密
decrypted = chacha.decrypt(nonce, ciphertext, aad)
print(f"[解密] {decrypted}")
assert decrypted == plaintext
print("[成功] ChaCha20-Poly1305 加解密正常")
\`\`\`

---

## 十一、记录层加密的完整流程

把所有概念串起来，TLS 1.2 应用数据加密的完整流程：

\`\`\`
应用数据
    ↓
[分块] 切成不超过 16384 字节的块
    ↓
[构造 AAD] ContentType + Version + Length
    ↓
[构造 Nonce] 隐式 IV (4字节) || 序列号 (8字节)
    ↓
[AEAD 加密] AES-GCM(key, nonce, plaintext, aad)
    ↓
[封装记录] ContentType + Version + Length + (密文 + Tag)
    ↓
[交给 TCP] 传输
\`\`\`

接收方反向操作：

\`\`\`
TCP 数据
    ↓
[解析记录头] ContentType + Version + Length
    ↓
[构造 AAD] 用记录头
    ↓
[构造 Nonce] 隐式 IV || 序列号
    ↓
[AEAD 解密] AES-GCM(key, nonce, 密文, aad)
    ↓
[验证 Tag] 通过则得到明文，失败则断开
    ↓
[检查序列号] 必须递增，防重放
    ↓
[交给应用层] HTTP 等协议处理
\`\`\`

---

## 十二、密码套件对比表

| 密码套件 | 密钥交换 | 加密 | 认证 | 前向保密 | 推荐度 |
|---------|---------|------|------|---------|-------|
| ECDHE-RSA-AES128-GCM-SHA256 | ECDHE | AES-128-GCM | RSA | 有 | 推荐 |
| ECDHE-RSA-AES256-GCM-SHA384 | ECDHE | AES-256-GCM | RSA | 有 | 推荐 |
| ECDHE-RSA-CHACHA20-POLY1305 | ECDHE | ChaCha20 | RSA | 有 | 推荐 |
| ECDHE-ECDSA-AES128-GCM-SHA256 | ECDHE | AES-128-GCM | ECDSA | 有 | 推荐 |
| DHE-RSA-AES128-GCM-SHA256 | DHE | AES-128-GCM | RSA | 有 | 可用 |
| RSA-AES128-GCM-SHA256 | RSA | AES-128-GCM | RSA | 无 | 不推荐 |
| ECDHE-RSA-AES128-SHA | ECDHE | AES-128-CBC | RSA | 有 | 不推荐（非AEAD） |
| RC4-MD5 | RSA | RC4 | - | 无 | 禁用 |

### 12.1 密码套件选择建议

1. **必须用 AEAD**：AES-GCM 或 ChaCha20-Poly1305
2. **必须用 ECDHE**：保证前向保密
3. **避免 CBC 模式**：容易遭 Lucky13 等攻击
4. **禁用 RC4/3DES/MD5/SHA1**：全部已不安全
5. **同时支持 AES-GCM 和 ChaCha20**：让客户端按硬件能力选

---

## 本章小结

| 知识点 | 要点 |
|-------|------|
| 记录层职责 | 分块、加密、完整性校验、传输 |
| 记录结构 | ContentType + Version + Length + Fragment |
| 最大记录 | 16384 字节（2^14） |
| 内容类型 | 20(CCS)/21(Alert)/22(Handshake)/23(AppData) |
| AEAD | 一次完成加密+认证，现代 TLS 标准 |
| AES-GCM | 主流 AEAD，有 AES-NI 时最快 |
| ChaCha20-Poly1305 | 移动端友好，无 AES-NI 时更快 |
| Nonce 构造 | 隐式 IV + 序列号，每条记录唯一 |
| 密钥分块 | client_write_key 和 server_write_key 独立 |
| 序列号 | 防重放，每方向独立计数 |
| 记录头明文 | 但被 AAD 覆盖，篡改即失败 |
| 密码套件命名 | 密钥交换_认证_WITH_加密_认证 |
| TLS 1.3 套件 | 简化为 加密_认证，只有 5 个 |
| 调试工具 | openssl -msg/-debug、Wireshark |
| 配置建议 \| AEAD + ECDHE + 同时支持 AES/ChaCha |`
  },

  // ============================================================
  // 第五章：TLS 1.3 详解
  // ============================================================
  {
    id: "hs-tls13",
    group: "TLS 协议详解",
    icon: "🚀",
    title: "TLS 1.3 详解",
    content: `# TLS 1.3 详解

## 一、TLS 1.3 的设计目标

TLS 1.3（RFC 8446，2018 年发布）是 TLS 协议十年来最大的一次重构。它的设计目标有三个：

1. **更快**：握手从 2-RTT 减到 1-RTT，支持 0-RTT 恢复
2. **更安全**：强制前向保密，移除所有不安全算法
3. **更简单**：移除大量过时特性，减少配置复杂度

**生活类比：** 如果 TLS 1.2 是"老款手机"——功能多但臃肿、有些过时组件还在占地方，TLS 1.3 就是"旗舰机精简版"——砍掉所有过时功能，只留最核心、最安全、最快的部分，开机速度提升一倍。

---

## 二、TLS 1.3 的重大变化

### 2.1 握手从 2-RTT 减到 1-RTT

TLS 1.2 需要 2 个往返才能开始传输数据，TLS 1.3 只需 1 个往返：

\`\`\`
TLS 1.2: ClientHello ──→ ServerHello+Cert+... ──→ ClientKX+Finished ──→ ServerFinished
        |─────── RTT 1 ───────|─────── RTT 2 ──────────|
        数据传输开始于 RTT 2 结束后

TLS 1.3: ClientHello(+key_share) ──→ ServerHello+EncryptedExt+Cert+Finished ──→ ClientFinished
        |─────────── RTT 1 ──────────|
        数据传输开始于 RTT 1 结束后
\`\`\`

**速度提升**：对于一次普通的 HTTPS 请求，省一个 RTT 在跨洋连接中能省 100-300ms，体验提升明显。

### 2.2 0-RTT 模式（会话恢复时）

对于"再次访问"的连接（基于 PSK 恢复），TLS 1.3 支持 0-RTT——客户端在第一个包里就携带应用数据：

\`\`\`
TLS 1.3 0-RTT:
ClientHello + early_data ──→ ServerHello + ... + Finished
|───────── 0-RTT ─────────|
数据在第一个包就发出去了！
\`\`\`

0-RTT 把握手延迟降到 0，对于移动端弱网场景提升巨大。但有重放攻击风险（后面详解）。

### 2.3 强制前向保密

TLS 1.3 **彻底移除 RSA 密钥交换和静态 DH**，只允许 (EC)DHE 临时密钥交换。这意味着：

- 所有 TLS 1.3 会话都有前向保密
- 服务器私钥泄露不影响任何历史会话
- 这是 TLS 1.3 最重要的安全改进

### 2.4 移除不安全算法

TLS 1.3 大刀阔斧地砍掉了所有不安全的算法：

| 类型 | 被移除 | 原因 |
|------|-------|------|
| 对称加密 | RC4 | 弱密钥流，多处攻击 |
| 对称加密 | 3DES | 64 位块，Sweet32 攻击 |
| 对称加密 | AES-CBC | Lucky13、padding oracle |
| 对称加密 | Camellia-CBC | 同 CBC 问题 |
| 哈希 | MD5 | 碰撞攻击 |
| 哈希 | SHA1 | 碰撞攻击（SHAttered） |
| 密钥交换 | RSA | 无前向保密 |
| 密钥交换 | 静态 DH | 无前向保密 |
| 压缩 | 所有 | CRIME/BREACH 攻击 |
| 重协商 | 所有 | 三方握手攻击 |

### 2.5 加密更多握手消息

TLS 1.2 中，ServerHello 之后的消息（Certificate、ServerKeyExchange 等）都是明文。TLS 1.3 在 ServerHello 之后**立即开始加密**：

\`\`\`
TLS 1.2:
ClientHello (明文)
ServerHello (明文)
Certificate (明文)      ← 证书明文，暴露服务器身份
ServerKeyExchange (明文)
ServerHelloDone (明文)
...

TLS 1.3:
ClientHello (明文)
ServerHello (明文)
EncryptedExtensions (加密)  ← 从这里开始全加密
Certificate (加密)
CertVerify (加密)
Finished (加密)
...
\`\`\`

这提升了隐私性——中间人看不到服务器证书，也无法通过 SNI 之外的方式知道客户端访问了哪个网站。

### 2.6 移除 ChangeCipherSpec

TLS 1.2 用 ChangeCipherSpec 消息表示"开始加密"。TLS 1.3 移除了这个消息，因为加密的开始点已经固定（ServerHello 之后立即加密）。

> 注意：TLS 1.3 为了兼容中间件，仍允许发送"伪 ChangeCipherSpec"，但不影响协议逻辑。

### 2.7 密码套件大幅简化

TLS 1.2 有上百个密码套件，配置复杂。TLS 1.3 **只保留 5 个**：

| 密码套件 | 加密 | 认证 |
|---------|------|------|
| TLS_AES_256_GCM_SHA384 | AES-256-GCM | SHA384 |
| TLS_CHACHA20_POLY1305_SHA256 | ChaCha20-Poly1305 | SHA256 |
| TLS_AES_128_GCM_SHA256 | AES-128-GCM | SHA256 |
| TLS_AES_128_CCM_SHA256 | AES-128-CCM | SHA256 |
| TLS_AES_128_CCM_8_SHA256 | AES-128-CCM (8字节Tag) | SHA256 |

密钥交换和认证不再由密码套件决定，而是通过扩展单独协商。

---

## 三、TLS 1.3 握手流程详解

### 3.1 完整握手流程

\`\`\`
客户端                                                    服务器
  │                                                         │
  │ ──── 1. ClientHello ──────────────────────────────────→ │
  │      （含 key_share 扩展，提前发送 ECDHE 公钥）          │
  │      （含 supported_versions 扩展，声明支持 1.3）        │
  │                                                         │
  │ ←─── 2. ServerHello ─────────────────────────────────  │
  │      （含 key_share，服务器 ECDHE 公钥）                │
  │      ←← 从这里开始加密 →→                                │
  │ ←─── 3. EncryptedExtensions ────────────────────────  │
  │ ←─── 4. CertificateRequest (可选) ──────────────────  │
  │ ←─── 5. Certificate ─────────────────────────────────  │
  │ ←─── 6. CertificateVerify ──────────────────────────  │
  │ ←─── 7. Finished ───────────────────────────────────  │
  │                                                         │
  │ ──── 8. Certificate (可选) ──────────────────────────→ │
  │ ──── 9. Finished ──────────────────────────────────→  │
  │                                                         │
  │ ═══════ 应用数据（已加密）══════════════════════════════ │
\`\`\`

### 3.2 各消息详解

**1. ClientHello**

与 TLS 1.2 类似，但增加了关键扩展：

- **key_share**：客户端**提前**在 ClientHello 里就发送 ECDHE 公钥（不用等 ServerHello）
- **supported_versions**：声明支持 TLS 1.3（而不是用 client_version 字段）
- **pre_shared_key**（可选）：用于 0-RTT 恢复
- **early_data**（可选）：0-RTT 数据

**关键改进**：客户端在第一个包就把密钥交换公钥发出去了，不用等服务器响应。这就是 1-RTT 的关键。

**2. ServerHello**

服务器选定参数，**也在 ServerHello 里携带 key_share**（服务器 ECDHE 公钥）。此时双方都有了对方的 ECDHE 公钥，可以计算出共享秘密。

**3. EncryptedExtensions**

ServerHello 之后的第一条加密消息，包含服务器选定的扩展参数（如 ALPN 协议）。从这条开始，所有消息都加密。

**4. CertificateRequest（可选）**

如果需要客户端证书（双向认证），服务器在这里请求。

**5. Certificate**

服务器的证书链（已加密）。

**6. CertificateVerify**

服务器用证书私钥对握手消息签名，证明"我确实是证书的主人"。这取代了 TLS 1.2 中对 ServerKeyExchange 的签名。

**7. Finished**

服务器发送握手完成验证数据。

**8. Client Certificate + Finished（可选）**

客户端发送证书（如果被要求），然后发送 Finished。

握手完成后，立即可以传输应用数据。

### 3.3 为什么 TLS 1.3 能省一个 RTT

关键在于 **key_share 扩展**：

- **TLS 1.2**：ClientHello 不带密钥交换参数 → 等服务器 ServerHello + ServerKeyExchange → 客户端才能发送 ClientKeyExchange → 等服务器 Finished。需要 2-RTT。
- **TLS 1.3**：ClientHello 就带 key_share → 服务器 ServerHello 也带 key_share → 双方立即能算出密钥 → 服务器把后续所有消息一次性发完 → 客户端验证后立即发 Finished。只需 1-RTT。

**生活类比：** TLS 1.2 像两人交接暗号——你先说你支持什么，对方回一句选定方案，你再发你的暗号参数，对方再确认。TLS 1.3 像你一见面就掏出"我的暗号参数+我支持什么"，对方回一句"我也支持+我的参数+我的证件+确认"，你确认后直接开聊。少一个来回。

---

## 四、0-RTT 详解

### 4.1 什么是 0-RTT

0-RTT（Zero Round Trip Time）是 TLS 1.3 的杀手锏。对于"会话恢复"场景，客户端可以在**第一个包**就携带应用数据：

\`\`\`
TLS 1.3 0-RTT 流程：
客户端                                                    服务器
  │                                                         │
  │ ──── ClientHello + early_data ──────────────────────→  │
  │      （应用数据直接放在第一个包里）                       │
  │                                                         │
  │ ←─── ServerHello + EncryptedExt + Finished ─────────  │
  │                                                         │
  │ ═══════ 后续应用数据 ═══════════════════════════════════ │
\`\`\`

**应用数据在 0-RTT 就发出了**，不需要等握手完成！

### 4.2 0-RTT 的工作原理

0-RTT 基于 PSK（Pre-Shared Key）会话恢复：

1. 首次握手时，服务器给客户端一个"会话票据"（Session Ticket）
2. 客户端保存票据，里面包含主密钥信息
3. 下次连接时，客户端在 ClientHello 里携带 pre_shared_key 扩展
4. 服务器验证票据，恢复会话密钥
5. 客户端用恢复的密钥加密 early_data，随 ClientHello 一起发
6. 服务器收到后立即能解密 early_data

### 4.3 0-RTT 的安全风险：重放攻击

0-RTT 最大的问题是**重放攻击**：

- 攻击者录下客户端的 0-RTT 请求
- 攻击者把这个请求**重放**给服务器
- 服务器以为是客户端发的，执行操作

如果 0-RTT 请求是"转账 100 元"，重放 10 次就转了 1000 元！

**为什么 0-RTT 无法防重放？**

因为 0-RTT 数据在 ServerHello 之前就发出，服务器无法用 Nonce 序列号防重放（握手还没完成，序列号机制没建立）。

### 4.4 0-RTT 的使用限制

由于重放风险，0-RTT 有严格的使用限制：

| 操作类型 | 是否适合 0-RTT | 原因 |
|---------|---------------|------|
| GET 请求（幂等） | 适合 | 重放无副作用 |
| 静态资源加载 | 适合 | 重放无影响 |
| POST 表单提交 | 不适合 | 重放会重复提交 |
| 支付/转账 | 绝对不适合 | 重放造成损失 |
| 数据库修改 | 不适合 | 重放导致数据错误 |

### 4.5 应用层防重放

应用层必须自己实现防重放机制：

- 每个请求携带唯一 ID，服务器去重
- 对非幂等操作，强制走完整握手（不用 0-RTT）
- 使用一次性 Token

---

## 五、Demo 1：强制使用 TLS 1.3

\`\`\`bash
# 用 openssl 强制 TLS 1.3 连接
# -tls1_3 强制使用 TLS 1.3
openssl s_client -connect example.com:443 -servername example.com -tls1_3

# 查看协商结果
# 输出中应显示 Protocol : TLSv1.3
\`\`\`

### 5.1 查看 TLS 1.3 密码套件

\`\`\`bash
# 查看 TLS 1.3 支持的密码套件
# -ciphersuites 指定 TLS 1.3 套件
openssl s_client -connect example.com:443 -servername example.com -tls1_3 \\
  -ciphersuites 'TLS_AES_256_GCM_SHA384' < /dev/null 2>&1 | grep Cipher

# 输出：Cipher : TLS_AES_256_GCM_SHA384

# 切换到 ChaCha20
openssl s_client -connect example.com:443 -servername example.com -tls1_3 \\
  -ciphersuites 'TLS_CHACHA20_POLY1305_SHA256' < /dev/null 2>&1 | grep Cipher
\`\`\`

### 5.2 测试服务器是否支持 TLS 1.3

\`\`\`bash
# 简洁模式快速检查
openssl s_client -connect example.com:443 -servername example.com -tls1_3 -brief < /dev/null

# 输出应包含：
# CONCLUDED TLSv1.3 handshake
#   Protocol version: TLSv1.3
#   Ciphersuite: TLS_AES_256_GCM_SHA384
\`\`\`

---

## 六、Demo 2：对比 TLS 1.2 和 1.3 握手

### 6.1 TLS 1.2 握手消息数

\`\`\`bash
# 强制 TLS 1.2，用 -msg 看消息
openssl s_client -connect example.com:443 -servername example.com -tls1_2 -msg < /dev/null 2>&1 | grep -E "(<<<|>>>)"

# TLS 1.2 输出（约 10 条消息）：
# <<< TLS 1.2, ClientHello
# >>> TLS 1.2, ServerHello
# >>> TLS 1.2, Certificate
# >>> TLS 1.2, ServerKeyExchange
# >>> TLS 1.2, ServerHelloDone
# <<< TLS 1.2, ClientKeyExchange
# <<< TLS 1.2, ChangeCipherSpec
# <<< TLS 1.2, Finished
# >>> TLS 1.2, ChangeCipherSpec
# >>> TLS 1.2, Finished
\`\`\`

### 6.2 TLS 1.3 握手消息数

\`\`\`bash
# 强制 TLS 1.3，用 -msg 看消息
openssl s_client -connect example.com:443 -servername example.com -tls1_3 -msg < /dev/null 2>&1 | grep -E "(<<<|>>>)"

# TLS 1.3 输出（消息更少，且后半部分全加密）：
# <<< TLS 1.3, ClientHello
# >>> TLS 1.3, ServerHello
# >>> TLS 1.3, EncryptedExtensions
# >>> TLS 1.3, Certificate
# >>> TLS 1.3, CertificateVerify
# >>> TLS 1.3, Finished
# <<< TLS 1.3, Finished
\`\`\`

### 6.3 关键差异

| 对比项 | TLS 1.2 | TLS 1.3 |
|-------|---------|---------|
| 握手消息数 | 10 条 | 7 条 |
| ChangeCipherSpec | 2 条 | 0 条 |
| ServerKeyExchange | 有 | 无（合并到 key_share 扩展） |
| RTT | 2 | 1 |
| 握手后半段加密 | 仅 Finished | ServerHello 后全加密 |

---

## 七、Demo 3：启用 0-RTT（Nginx 配置）

\`\`\`nginx
# nginx.conf 配置 TLS 1.3 和 0-RTT

# 1. 启用 TLS 1.3
ssl_protocols TLSv1.2 TLSv1.3;

# 2. 配置 TLS 1.3 密码套件
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
# 注意：ssl_ciphers 控制 TLS 1.2 套件
# TLS 1.3 套件用 ssl_ciphersuites（nginx 1.19.4+）
ssl_ciphersuites 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256';

# 3. 启用会话票据（0-RTT 的基础）
ssl_session_tickets on;
ssl_session_ticket_key /path/to/ticket.key;
ssl_session_timeout 1d;

# 4. 启用 0-RTT（early data）
ssl_early_data on;

# 5. 配置完后测试
# nginx -t
# nginx -s reload
\`\`\`

### 7.1 服务器端处理 0-RTT 请求

\`\`\`nginx
# 在 server 块或 location 块中，可以判断是否是 0-RTT 请求
# $ssl_early_data 变量为 "1" 表示是 early data

# 对非幂等请求，拒绝 0-RTT（防重放）
location /api/ {
    # 如果是 0-RTT 请求且不是 GET，返回 425
    if ($ssl_early_data = "1") {
        return 425;  # 425 Too Early
    }
    proxy_pass http://backend;
}

# 静态资源可以接受 0-RTT
location /static/ {
    # 0-RTT 重放无影响，直接处理
    proxy_pass http://backend;
}
\`\`\`

### 7.2 HTTP 状态码 425 Too Early

专门为 0-RTT 重放风险设计的状态码：

- 服务器怀疑请求是重放的，返回 425
- 客户端收到 425 后，等握手完成再重发请求
- 这样既享受 0-RTT 的速度，又保证安全

---

## 八、Demo 4：0-RTT 重放攻击演示

\`\`\`python
# zero_rtt_replay_demo.py
# 文字演示 0-RTT 重放攻击的风险

print("=" * 60)
print("0-RTT 重放攻击演示")
print("=" * 60)

# ============================================================
# 场景：客户端用 0-RTT 发送转账请求
# ============================================================
print("\\n[场景] 客户端用 0-RTT 发送 POST /transfer 请求")
print("  请求体：{ from: 'A', to: 'B', amount: 100 }")

# 攻击者录下这个请求
print("\\n[攻击者] 录下客户端的 0-RTT 请求")
print("  攻击者：我虽然解不开内容，但可以原样重放")

# 攻击者重放
print("\\n[攻击者] 重放请求给服务器")
print("  服务器：收到一个看起来合法的 0-RTT 请求")
print("  服务器：执行转账 A → B，金额 100")

# 攻击者再次重放
print("\\n[攻击者] 再次重放")
print("  服务器：又收到一个，再执行转账")

print("\\n[后果] A 的账户被扣了 200 元，但 A 只想转 100！")

# ============================================================
# 防御措施
# ============================================================
print("\\n" + "=" * 60)
print("防御措施")
print("=" * 60)

print("""
1. 幂等性检查
   - GET 请求：可以接受 0-RTT（重放无副作用）
   - POST/PUT/DELETE：禁止 0-RTT，等完整握手

2. 应用层防重放
   - 每个请求携带唯一 request_id
   - 服务器记录已处理的 request_id
   - 重复的 request_id 直接拒绝

3. 服务器端拒绝
   - Nginx 配置：if ($ssl_early_data) { return 425; }
   - 客户端收到 425 后重试，走完整握手

4. 一次性 Token
   - 客户端先获取一次性 token
   - 0-RTT 请求携带 token
   - token 用过即失效
""")

# ============================================================
# 代码示例：应用层防重放
# ============================================================
print("[代码示例] 应用层防重放")
print("""
# Flask 示例
from flask import Flask, request
import redis

app = Flask(__name__)
r = redis.Redis()

@app.route('/transfer', methods=['POST'])
def transfer():
    request_id = request.headers.get('X-Request-ID')
    if not request_id:
        return 'Missing request ID', 400

    # 检查是否已处理过（防重放）
    if r.set('req:' + request_id, '1', nx=True, ex=3600) is None:
        return 'Duplicate request', 425

    # 处理转账
    # ...
    return 'OK'
""")
\`\`\`

---

## 九、Demo 5：TLS 1.3 密码套件

### 9.1 五个密码套件

TLS 1.3 只有 5 个密码套件，全部是 AEAD：

\`\`\`bash
# 查看 TLS 1.3 支持的密码套件
openssl ciphers -v 'TLSv1.3' 2>/dev/null || \\
  echo "TLS_AES_256_GCM_SHA384 TLS_CHACHA20_POLY1305_SHA256 TLS_AES_128_GCM_SHA256 TLS_AES_128_CCM_SHA256 TLS_AES_128_CCM_8_SHA256"
\`\`\`

### 9.2 各套件详解

| 密码套件 | 加密算法 | 特点 |
|---------|---------|------|
| TLS_AES_256_GCM_SHA384 | AES-256-GCM | 最高安全级别，有 AES-NI 时快 |
| TLS_CHACHA20_POLY1305_SHA256 | ChaCha20-Poly1305 | 移动端友好，无 AES-NI 时快 |
| TLS_AES_128_GCM_SHA256 | AES-128-GCM | 性能与安全平衡，最常用 |
| TLS_AES_128_CCM_SHA256 | AES-128-CCM | 用于特定硬件（物联网） |
| TLS_AES_128_CCM_8_SHA256 | AES-128-CCM (8字节Tag) | Tag 更短，节省空间 |

### 9.3 套件命名差异

\`\`\`bash
# TLS 1.2 套件命名（包含密钥交换和认证）
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256

# TLS 1.3 套件命名（只有加密和认证）
TLS_AES_128_GCM_SHA256

# 原因：TLS 1.3 把密钥交换和认证从套件中分离
# 密钥交换通过 key_share 扩展协商
# 认证通过证书签名算法单独协商
# 套件只负责"加密应用数据"和"派生密钥的哈希"
\`\`\`

### 9.4 为什么 TLS 1.3 套件这么少

\`\`\`bash
# 历史背景：TLS 1.2 套件爆炸
# TLS 1.2 有上百个套件，配置复杂，容易出错
# 很多套件是历史遗留（RC4/3DES/CBC），都不安全

# TLS 1.3 的设计哲学：
# 1. 只保留经过充分验证的算法
# 2. 全部使用 AEAD（无 CBC）
# 3. 全部使用 ECDHE（强制前向保密）
# 4. 移除所有可选的弱算法

# 这样配置简单，安全性可控，实现也简单
\`\`\`

---

## 十、Demo 6：用 Python ssl 模块检查 TLS 版本支持

\`\`\`python
# tls13_support_check.py
# 用 Python 标准库检查 TLS 1.3 支持情况

import ssl  # Python 标准库的 ssl 模块
import socket

# ============================================================
# 1. 查看 OpenSSL 版本
# ============================================================
# TLS 1.3 需要 OpenSSL 1.1.1 或更高版本
print(f"[OpenSSL] {ssl.OPENSSL_VERSION}")

# ============================================================
# 2. 查看支持的 TLS 版本
# ============================================================
# ssl.HAS_TLSv1_3 是个布尔值，True 表示支持 TLS 1.3
print(f"[TLS 1.2 支持] {ssl.HAS_TLSv1_2}")
print(f"[TLS 1.3 支持] {ssl.HAS_TLSv1_3}")

# ============================================================
# 3. 创建默认 SSL 上下文
# ============================================================
ctx = ssl.create_default_context()

# 设置最高版本为 TLS 1.3
# maximum_version 控制最高允许的版本
ctx.maximum_version = ssl.TLSVersion.TLSv1_3

# 设置最低版本为 TLS 1.2（禁用旧版本）
ctx.minimum_version = ssl.TLSVersion.TLSv1_2

# ============================================================
# 4. 连接服务器，查看协商结果
# ============================================================
hostname = "example.com"
try:
    # 建立加密连接
    with socket.create_connection((hostname, 443), timeout=10) as sock:
        # 用 SSL 包装 socket
        with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
            # 查看协商出的协议版本
            print(f"[协商版本] {ssock.version()}")
            # 查看协商出的密码套件
            print(f"[密码套件] {ssock.cipher()}")
except Exception as e:
    print(f"[错误] {e}")

# ============================================================
# 5. 查看默认密码套件列表
# ============================================================
print("\\n[默认密码套件]")
for cipher in ctx.get_ciphers():
    # 只看 TLS 1.3 的套件
    if "TLSv1.3" in str(cipher.get("protocol", "")):
        print(f"  {cipher['name']}")
\`\`\`

运行后输出类似：

\`\`\`
[OpenSSL] OpenSSL 1.1.1k  (1.1.1 系列支持 TLS 1.3)
[TLS 1.2 支持] True
[TLS 1.3 支持] True
[协商版本] TLSv1.3
[密码套件] ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256, ...)

[默认密码套件]
  TLS_AES_256_GCM_SHA384
  TLS_CHACHA20_POLY1305_SHA256
  TLS_AES_128_GCM_SHA256
\`\`\`

---

## 十一、TLS 1.2 vs TLS 1.3 对比表

| 对比项 | TLS 1.2 | TLS 1.3 |
|-------|---------|---------|
| 发布年份 | 2008 | 2018 |
| RFC | 5246 | 8446 |
| 握手 RTT | 2-RTT | 1-RTT |
| 会话恢复 | 1-RTT | 0-RTT（PSK） |
| 密钥交换 | RSA / DHE / ECDHE | 仅 (EC)DHE |
| 前向保密 | 可选 | 强制 |
| 对称加密 | CBC / GCM / ChaCha20 | 仅 AEAD（GCM/CCM/ChaCha20） |
| 哈希算法 | MD5 / SHA1 / SHA256 / SHA384 | 仅 SHA256 / SHA384 |
| 证书消息 | 明文传输 | 加密传输 |
| ChangeCipherSpec | 必需 | 移除 |
| 重协商 | 支持 | 移除 |
| 压缩 | 支持（已禁用） | 移除 |
| 密码套件数 | 上百个 | 5 个 |
| 静态 RSA | 支持 | 移除 |

### 11.1 关键改进总结

1. **速度提升**：1-RTT 节省一次往返，0-RTT 实现零延迟恢复
2. **安全提升**：强制前向保密，移除所有不安全算法，加密更多握手消息
3. **简化配置**：密码套件从上百个减到 5 个，密钥交换固定为 ECDHE
4. **隐私提升**：证书加密传输，中间人无法看到服务器身份

### 11.2 兼容性现状

\`\`\`bash
# 查看主流浏览器对 TLS 1.3 的支持情况
# Chrome 70+（2018 年 10 月）支持
# Firefox 63+（2018 年 10 月）支持
# Safari 12.1+（2019 年）支持
# Edge 79+（基于 Chromium）支持

# 服务器端支持
# OpenSSL 1.1.1+（2018 年 9 月）支持
# Nginx 1.13.0+ 配合 OpenSSL 1.1.1 支持
# Apache 2.4.36+ 配合 OpenSSL 1.1.1 支持

# 截至 2024 年，超过 70% 的网站支持 TLS 1.3
\`\`\`

---

## 十二、TLS 1.3 的会话恢复机制

### 12.1 PSK（Pre-Shared Key）恢复

TLS 1.3 用 PSK 取代了 TLS 1.2 的 Session ID 和 Session Ticket：

\`\`\`
首次连接：
ClientHello ──→ ServerHello + ... + NewSessionTicket ──→ ...
                                    │
                                    └─ 服务器发送会话票据
                                       客户端保存票据

恢复连接（1-RTT）：
ClientHello(+pre_shared_key) ──→ ServerHello + Finished ──→ Finished
                              │
                              └─ 客户端携带票据
                                 服务器验证后恢复密钥

恢复连接（0-RTT）：
ClientHello(+pre_shared_key + early_data) ──→ ServerHello + Finished
                                            │
                                            └─ 数据随第一个包发出
\`\`\`

### 12.2 NewSessionTicket 消息

\`\`\`bash
# 用 openssl 观察会话票据
# -sess_out 把会话保存到文件
openssl s_client -connect example.com:443 -servername example.com \\
  -sess_out session.pem < /dev/null

# 输出中能看到 NewSessionTicket 消息
# 票据里包含恢复会话所需的密钥材料
\`\`\`

---

## 十三、TLS 1.3 的密钥更新

TLS 1.3 支持在通信过程中"更新密钥"（Key Update），增强长期连接的安全性：

\`\`\`
应用数据传输中...
    ↓
任意一方发送 KeyUpdate 消息
    ↓
双方各自更新 traffic secret
    ↓
用新密钥继续加密通信
\`\`\`

**作用：** 对于长时间持续的连接（如 WebSocket），定期更新密钥可以限制单个密钥加密的数据量，降低密钥被破解后的影响。

\`\`\`bash
# Nginx 无法直接控制 KeyUpdate，由 OpenSSL 库处理
# 应用层无需关心，TLS 库会自动处理
\`\`\`

---

## 本章小结

| 知识点 | 要点 |
|-------|------|
| TLS 1.3 发布 | 2018 年，RFC 8446 |
| 设计目标 | 更快、更安全、更简单 |
| 握手 RTT | 1-RTT（完整握手）、0-RTT（会话恢复） |
| key_share 扩展 | ClientHello 提前发送 ECDHE 公钥 |
| 强制前向保密 | 移除 RSA 密钥交换，仅 (EC)DHE |
| 移除不安全算法 | RC4/3DES/CBC/MD5/SHA1/压缩/重协商 |
| 加密更多握手 | ServerHello 后立即全加密 |
| 移除 ChangeCipherSpec | 加密开始点固定 |
| 密码套件 | 仅 5 个，全部 AEAD |
| 0-RTT | 基于 PSK，有重放风险 |
| 0-RTT 限制 | 仅幂等操作，应用层防重放 |
| 425 状态码 | Too Early，拒绝 0-RTT 重放 |
| 会话恢复 | PSK + NewSessionTicket |
| KeyUpdate | 通信中更新密钥，增强安全 |
| 兼容性 | 现代浏览器和服务器普遍支持 |
| 性能提升 | 跨洋连接省 100-300ms |
| 隐私提升 \| 证书加密，中间人看不到服务器身份 |`
  }
];