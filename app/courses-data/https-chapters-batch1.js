// =============================================================
// HTTPS 详解全书 - 第 1 批章节（密码学基础 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   hs-crypto-intro: 加密概述与 HTTPS 全景
//   hs-symmetric: 对称加密
//   hs-asymmetric: 非对称加密
//   hs-hash-mac: 哈希与 MAC
//   hs-random: 随机数与熵
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：加密概述与 HTTPS 全景
  // ============================================================
  {
    id: "hs-crypto-intro",
    group: "密码学基础",
    icon: "🔐",
    title: "加密概述与 HTTPS 全景",
    content: `# 加密概述与 HTTPS 全景

## 为什么需要 HTTPS

我们先从一个生活中的小例子说起。

假设你想给远方的朋友寄一封信，你有两种选择：

1. **明信片**：写完之后直接扔进邮筒，邮递员、邮局分拣员、路过的任何人都能看到内容。方便，但毫无隐私。
2. **密封信件**：把信纸装进信封，用火漆封口，只有收信人拆开才能看到内容。麻烦一些，但别人偷看不到。

**HTTP 就是明信片，HTTPS 就是密封信件。**

当你在浏览器里输入 \`http://www.example.com\` 时，你发给服务器的所有数据——用户名、密码、搜索关键词、聊天内容——全部都是明文。这些数据会经过你的路由器、运营商的交换机、沿途的各种网关，任何中间节点都能用 Wireshark 这样的抓包工具看到全部内容。

\`\`\`text
HTTP 明文传输场景：

  你的浏览器                  运营商路由器              服务器
     │                           │                       │
     │  GET /login?user=admin    │                       │
     │  &password=123456         │                       │
     │ ─────────────────────────▶│ ─────────────────────▶│
     │                           │                       │
     │  ↑ 中间人可以看到密码 ↑    │                       │
     │                           │                       │

HTTPS 加密传输场景：

  你的浏览器                  运营商路由器              服务器
     │                           │                       │
     │  9f8a2b7c4e1d...          │                       │
     │  (密文，没人看懂)          │                       │
     │ ─────────────────────────▶│ ─────────────────────▶│
     │                           │                       │
     │  ↑ 中间人只能看到乱码 ↑    │                       │
     │                           │                       │
\`\`\`

## HTTP 的三大缺陷

HTTP 作为应用层协议，设计之初并没有考虑安全性，因此天生存在三大致命缺陷：

### 缺陷一：窃听风险（机密性缺失）

HTTP 数据全部明文传输。在公共 WiFi（咖啡馆、机场）场景下，攻击者只要接入同一个网络，运行一个抓包工具，就能看到所有人访问了哪些网站、输入了什么内容。

\`\`\`bash
# 模拟：在公共 WiFi 下抓取 HTTP 流量（需要 root 权限，仅作演示）
# 以下命令在 Linux 下使用 tcpdump 抓包，并过滤 HTTP 请求
sudo tcpdump -i wlan0 -A -s 0 'tcp port 80'  # 监听 wlan0 网卡的 80 端口，-A 表示以 ASCII 显示
# -i wlan0：指定无线网卡
# -A：以 ASCII 方式打印数据包内容（这样能看到明文 HTTP）
# -s 0：抓取完整数据包（0 表示不截断）
# 'tcp port 80'：只抓取目标端口或源端口为 80 的 TCP 流量
\`\`\`

运行后你会看到形如 \`GET /login?password=xxx\` 的明文请求，密码赤裸裸地暴露在屏幕上。

### 缺陷二：篡改风险（完整性缺失）

HTTP 没有任何机制保证数据在传输过程中不被修改。运营商曾经普遍使用一种叫"HTTP 劫持"的手段：你访问一个普通网站，它给你在响应里塞一段广告 JS，或者在页面里插一个运营商的横幅。

\`\`\`text
正常流程：
  服务器 → "页面内容 A" → 你的浏览器

被篡改：
  服务器 → "页面内容 A" → 中间人 → "页面内容 A + 广告 JS" → 你的浏览器
\`\`\`

更严重的场景：你下载一个软件安装包，HTTP 不校验完整性，中间人完全可以把安装包替换成木马版本。

### 缺陷三：伪造风险（身份认证缺失）

HTTP 没有任何机制证明"你访问的这个服务器，确实是它声称的那个"。

比如你访问 \`www.bank.com\`，HTTP 协议本身无法保证对面那台服务器真的是银行。可能是：
- DNS 污染：你输入 \`bank.com\`，DNS 被劫持，返回了攻击者的 IP
- 路由劫持：BGP 路由被篡改，你的请求被转发到攻击者那里
- 公共 WiFi 热点欺骗：你连的"免费 WiFi"本身就是钓鱼热点

\`\`\`text
你以为的访问：
  你 ────────────▶ www.bank.com（真正的银行）

实际发生的访问（DNS 污染）：
  你 ────────────▶ 攻击者的钓鱼网站（长得和银行一模一样）
                    攻击者记录你输入的账号密码
\`\`\`

## HTTPS = HTTP + TLS

HTTPS 不是一个全新的协议，它就是 **HTTP 跑在 TLS 之上**。

\`\`\`text
HTTP 协议栈：              HTTPS 协议栈：

  应用层：HTTP                应用层：HTTP
                              ↓
                              安全层：TLS（加密、认证、完整性）
                              ↓
  传输层：TCP                 传输层：TCP
  网络层：IP                  网络层：IP
\`\`\`

所以严格来说，HTTPS = HTTP + TLS。HTTP 还是那个 HTTP，请求方法、状态码、头部都一样，只是 HTTP 的数据在交给 TCP 之前，先经过 TLS 加了一层"加密壳子"。

- **HTTP 默认端口 80**
- **HTTPS 默认端口 443**

浏览器看到 \`https://\` 前缀，就会先和服务器的 443 端口建立 TCP 连接，然后在 TCP 之上进行 TLS 握手，握手完成后才发送 HTTP 请求（此时已经是加密的 HTTP 请求了）。

## HTTPS 解决的三大问题

HTTPS 通过 TLS 协议，一次性解决了 HTTP 的三大缺陷：

| 安全属性 | 对应缺陷 | HTTPS 如何解决 | 用的技术 |
|---------|---------|---------------|---------|
| **机密性**（Confidentiality） | 窃听 | 加密数据，中间人看到的是密文 | 对称加密（AES、ChaCha20） |
| **完整性**（Integrity） | 篡改 | 校验数据是否被修改 | MAC（HMAC、Poly1305） |
| **身份认证**（Authentication） | 伪造 | 验证服务器身份 | 数字证书 + 非对称加密（RSA、ECC） |

这三大问题分别对应三大类密码学技术，这也是本书接下来几章要详细讲的内容。

## 加密三大分类

密码学主要研究三大类技术，它们共同构成了 HTTPS 的安全基础：

### 1. 对称加密（Symmetric Encryption）

加密和解密用**同一把钥匙**。

生活类比：带锁的箱子。你用钥匙把箱子锁上，别人打不开；送到对方手里，对方用**同一把钥匙**才能打开。

代表算法：AES、ChaCha20、DES（已淘汰）。

优点：速度快，适合加密大量数据。
缺点：密钥分发困难——怎么把钥匙安全地送给对方是个大问题。

### 2. 非对称加密（Asymmetric Encryption）

加密和解密用**两把不同的钥匙**，一把叫公钥（公开），一把叫私钥（保密）。

生活类比：信箱。信箱上有个投信口（公钥），任何人都可以从这里塞信进来；但只有信箱主人有钥匙（私钥），才能打开放信。

代表算法：RSA、ECC（椭圆曲线）。

优点：解决了密钥分发问题，公钥可以随便公开。
缺点：速度慢，比对称加密慢几百倍，不适合加密大量数据。

**HTTPS 的巧妙之处**：用非对称加密交换对称密钥，然后用对称加密传输数据。两者取长补短。

### 3. 哈希函数（Hash Function）

把任意长度的数据变成固定长度的"指纹"，不可逆。

生活类比：人的指纹。你看到一个人的指纹，无法还原出这个人的长相；但同一个人的指纹永远一样，可以用来识别身份。

代表算法：SHA-256、SHA-3、BLAKE2。

用途：完整性校验、数字签名、密码存储。

### 三者对比

\`\`\`text
┌────────────┬───────────────┬────────────────┬──────────────┐
│   类型     │  密钥数量      │  典型用途       │  速度         │
├────────────┼───────────────┼────────────────┼──────────────┤
│  对称加密   │  1 把（共享）  │  加密大量数据    │  极快         │
│  非对称加密 │  2 把（公私钥）│  交换密钥、签名  │  慢（几百倍） │
│  哈希       │  0 把          │  完整性、签名    │  快           │
└────────────┴───────────────┴────────────────┴──────────────┘
\`\`\`

## HTTPS 全景图

理解 HTTPS，脑子里要有这张全景图：

\`\`\`text
                    ┌─────────────────────────────────────┐
                    │           TLS 隧道（加密）           │
                    │  ┌─────────┐         ┌─────────┐    │
  浏览器（客户端）   │  │ HTTP    │         │ HTTP    │    │   服务器
  ───────────────▶ │  │ 请求    │ ──────▶ │ 请求    │    │ ──────────▶
                    │  │ (明文)  │  加密   │ (明文)  │    │  业务逻辑
  ◀─────────────── │  │         │ ◀────── │         │    │ ◀──────────
                    │  │ HTTP    │  解密   │ HTTP    │    │
                    │  │ 响应    │         │ 响应    │    │
                    │  └─────────┘         └─────────┘    │
                    └─────────────────────────────────────┘
                          客户端 TLS                  服务器 TLS
\`\`\`

整个过程分三步：

1. **TCP 握手**：客户端和服务器先建立 TCP 连接（三次握手）。
2. **TLS 握手**：在 TCP 之上，客户端和服务器协商加密算法、交换密钥、验证证书。这是 HTTPS 最复杂的部分。
3. **加密通信**：握手完成后，双方用协商好的对称密钥加密 HTTP 数据，开始正常通信。

## Demo 1：用 curl 抓 HTTP 明文请求

我们先用 curl 看看 HTTP 的明文长什么样。\`-v\` 参数会输出详细的连接过程。

\`\`\`bash
# 访问一个 HTTP 网站（注意是 http:// 不是 https://）
curl -v http://example.com
# -v：verbose，显示详细通信过程
# curl 会输出：
#   * Trying 93.184.216.34...        # 解析域名得到 IP
#   * TCP_NODELAY set
#   * Connected to example.com       # TCP 连接建立
#   > GET / HTTP/1.1                 # 请求行（明文，> 表示客户端发出）
#   > Host: example.com              # Host 头（明文）
#   > User-Agent: curl/7.64.1        # User-Agent（明文）
#   > Accept: */*                    # Accept 头（明文）
#   >                               # 空行，表示请求头结束
#   < HTTP/1.1 200 OK                # 响应状态行（< 表示服务器返回）
#   < Content-Type: text/html        # 响应头（明文）
#   < ...                            # 更多响应头
#   <                               # 空行，响应头结束
#   <html>...                        # 响应体（明文 HTML）
\`\`\`

注意所有 \`>\` 开头的行都是请求内容，全部明文。如果有人在网络中抓包，这些内容一览无余。

如果你想用 Wireshark 更直观地看，可以：

\`\`\`bash
# 启动 Wireshark 抓包（GUI 工具）
sudo wireshark
# 选择你的网络接口（如 en0、wlan0）
# 在过滤栏输入：http
# 然后用浏览器访问 http 网站
# Wireshark 会显示所有 HTTP 请求的明文内容
# 右键某个包 → Follow → HTTP Stream，可以看到完整的请求响应原文
\`\`\`

## Demo 2：用 curl 抓 HTTPS 请求

现在换成 HTTPS：

\`\`\`bash
# 访问 HTTPS 网站
curl -v https://example.com
# curl 会输出：
#   * Trying 93.184.216.34:443...
#   * Connected to example.com port 443
#   * ALPN: offers h2                     # ALPN 协商，询问是否支持 HTTP/2
#   * TLSv1.3 (OUT): TLS handshake ...    # TLS 1.3 握手开始
#   * TLSv1.3 (IN): TLS handshake ...     # 服务器响应握手
#   * SSL certificate verify ok.          # 证书验证通过
#   * TLSv1.3 (OUT): TLS handshake done   # 握手完成
#   > GET / HTTP/1.1                      # 注意：这是 curl 显示的，不是实际传输
#   > Host: example.com                   # 实际网络中这些是密文！
#   ...
\`\`\`

关键区别：
- 多了一堆 \`TLS handshake\` 的输出，这是 TLS 握手过程
- \`>\` 开头的请求行是 curl 在内部显示的，**实际网络上传输的是密文**
- 用 Wireshark 抓 HTTPS 包，你会看到一堆"Application Data"，看不到明文

\`\`\`bash
# 只看 TLS 握手的关键信息
curl -v --tlsv1.3 https://example.com 2>&1 | grep -E "TLS|SSL|certificate|cipher"
# --tlsv1.3：强制使用 TLS 1.3
# 2>&1：把标准错误（curl -v 输出到 stderr）重定向到 stdout
# grep -E：用扩展正则过滤包含 TLS、SSL、certificate、cipher 的行
\`\`\`

## Demo 3：用 openssl s_client 查看 TLS 握手细节

curl 的输出比较简略，想看完整的 TLS 握手细节，用 \`openssl s_client\`：

\`\`\`bash
# 连接到 example.com 的 443 端口，查看完整 TLS 握手
openssl s_client -connect example.com:443 -servername example.com
# -connect example.com:443：连接目标主机和端口
# -servername example.com：SNI（Server Name Indication），告诉服务器要访问哪个域名
#                          （一台服务器可能托管多个 HTTPS 网站，靠 SNI 区分）

# 输出会包含：
#   CONNECTED               # TCP 连接建立
#   ---
#   Certificate chain       # 证书链（服务器证书 + 中间证书）
#     0 s: CN=example.com   # 服务器证书的主体名
#       i: CN=...           # 颁发者（CA）
#     1 s: CN=...           # 中间证书
#       i: CN=...           # 根 CA
#   ---
#   SSL handshake has read ... bytes    # 握手读取的字节数
#   ---
#   Protocol version: TLSv1.3           # 协商出的 TLS 版本
#   Ciphers: TLS_AES_256_GCM_SHA384     # 协商出的加密套件
#   ...
\`\`\`

你可以看到：
- **证书链**：服务器证书是谁颁发的，中间 CA 是谁，根 CA 是谁
- **协商出的协议版本**：TLS 1.2 还是 TLS 1.3
- **加密套件**：用哪个对称算法、哪个密钥交换算法、哪个 MAC 算法

\`\`\`bash
# 只显示证书信息，不建立完整会话
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -text -noout
# echo |：通过管道发送一个空行，让 s_client 立即结束（否则它会一直等输入）
# 2>/dev/null：丢弃错误信息
# | openssl x509 -text -noout：把证书内容以可读文本显示
#   -text：以文本形式显示证书详情
#   -noout：不输出原始证书编码
\`\`\`

这条命令会显示证书的完整信息：颁发者、有效期、公钥、签名算法、扩展字段（SAN、密钥用途等）。

## Demo 4：HTTPS 发展简史

HTTPS 背后的 TLS 协议也经历了一段演进历史，了解这段历史有助于理解为什么现在的 HTTPS 是这个样子。

\`\`\`text
时间线：

1994  SSL 1.0    网景公司内部版本，从未发布（有严重漏洞）
1995  SSL 2.0    网景浏览器首次集成，但很快被发现有安全缺陷
1996  SSL 3.0    重新设计，基本可用，2015 年被废弃（POODLE 攻击）
1999  TLS 1.0    RFC 2246，IETF 接管，基本就是 SSL 3.1
2006  TLS 1.1    RFC 4346，修复了 BEAST 等攻击
2008  TLS 1.2    RFC 5246，引入 AEAD（AES-GCM），目前最广泛使用
2018  TLS 1.3    RFC 8446，大改版，握手从 2-RTT 减到 1-RTT，强制前向安全
\`\`\`

\`\`\`bash
# 查看你的 openssl 支持哪些 TLS 版本
openssl ciphers -v | awk '{print $2}' | sort -u
# openssl ciphers -v：列出所有支持的加密套件
# awk '{print $2}'：取第二列（协议版本，如 SSLv3、TLSv1.2、TLSv1.3）
# sort -u：排序去重

# 强制使用 TLS 1.2 访问
curl --tlsv1.2 --tls-max 1.2 https://example.com
# --tlsv1.2：最低使用 TLS 1.2
# --tls-max 1.2：最高也是 1.2（不允许升级到 1.3）

# 强制使用 TLS 1.3 访问
curl --tlsv1.3 https://example.com
# TLS 1.3 是目前最安全的版本，握手更快，安全性更强
\`\`\`

## 三大加密分类对比表

| 对比项 | 对称加密 | 非对称加密 | 哈希函数 |
|-------|---------|-----------|---------|
| 密钥数量 | 1 把（双方共享） | 2 把（公钥+私钥） | 无密钥 |
| 加密/解密 | 同一密钥 | 公钥加密→私钥解密 | 不可逆 |
| 典型算法 | AES、ChaCha20 | RSA、ECC | SHA-256、SHA-3 |
| 速度 | 极快（1 Gbps+） | 慢（几百 kbps） | 快 |
| 主要用途 | 加密大量数据 | 密钥交换、数字签名 | 完整性、签名、密码存储 |
| HTTPS 中的角色 | 加密应用数据 | 握手阶段交换密钥、签名证书 | 校验完整性、签名 |
| 主要缺点 | 密钥分发困难 | 速度慢、计算开销大 | 无法解密还原 |

## 本章小结

| 知识点 | 核心内容 |
|-------|---------|
| HTTP 三大缺陷 | 窃听（明文）、篡改（无完整性校验）、伪造（无身份认证） |
| HTTPS 定义 | HTTP + TLS，不是新协议，HTTP 跑在 TLS 隧道之上 |
| HTTPS 解决的三大问题 | 机密性、完整性、身份认证 |
| 加密三大分类 | 对称加密、非对称加密、哈希函数 |
| TLS 版本演进 | SSL 1.0/2.0/3.0 → TLS 1.0/1.1/1.2/1.3，目前推荐 TLS 1.3 |
| 默认端口 | HTTP 80，HTTPS 443 |
| HTTPS 三步走 | TCP 握手 → TLS 握手 → 加密通信 |
| 关键工具 | curl -v、openssl s_client、Wireshark |
`
  },

  // ============================================================
  // 第二章：对称加密
  // ============================================================
  {
    id: "hs-symmetric",
    group: "密码学基础",
    icon: "🔑",
    title: "对称加密",
    content: `# 对称加密

## 对称加密原理

**对称加密**指的是加密和解密使用**同一把密钥**的加密方式。

生活类比：想象一个带锁的箱子。你有一把钥匙，把重要的文件锁进箱子里。箱子在运输途中，没有钥匙的人打不开它。文件送到对方手里，对方必须用**同一把钥匙**才能打开箱子取出文件。

这里的关键是"同一把钥匙"——这就是"对称"二字的含义：加密方和解密方持有的密钥是对称的（相同的）。

\`\`\`text
对称加密流程：

  发送方                                       接收方
    │                                            │
    │  明文 "hello"                              │
    │     │                                      │
    │     ▼  加密（用密钥 K）                      │
    │  密文 "Xf9$k2"                             │
    │     │                                      │
    │     │  ──── 通过网络传输密文 ────▶           │
    │     │                       密文 "Xf9$k2"   │
    │     │                          │            │
    │     │                          ▼ 解密（用密钥 K）
    │     │                       明文 "hello"     │
    │                                            │
    └────────── 双方事先共享密钥 K ────────────────┘
\`\`\`

数学表达：
- 加密：\`C = E(K, P)\`，其中 C 是密文，E 是加密算法，K 是密钥，P 是明文
- 解密：\`P = D(K, C)\`，其中 D 是解密算法

## 常见对称加密算法

### DES（Data Encryption Standard）

1977 年由 IBM 设计、美国国家标准局发布的对称加密标准。

- **密钥长度**：56 位（实际 64 位，但 8 位是校验位）
- **块大小**：64 位
- **现状**：**已不安全**，56 位密钥用现代计算机几天就能暴力破解

生活类比：DES 就像一把老式弹子锁，钥匙只有 56 个齿位变化，小偷挨个试也能试开。

### 3DES（Triple DES）

DES 不安全了，人们想了个折中的办法：用 DES 加密三次。

\`\`\`text
3DES 加密过程：
  明文 → DES加密(K1) → DES解密(K2) → DES加密(K3) → 密文

为什么中间是"解密"？这样设计是为了兼容：当 K1=K2=K3 时，3DES 就退化为 DES。
\`\`\`

- **密钥长度**：112 位或 168 位
- **现状**：安全性尚可，但速度慢，正在被淘汰

### AES（Advanced Encryption Standard）

2001 年发布，用来替代 DES 的现代加密标准。由比利时密码学家 Joan Daemen 和 Vincent Rijmen 设计（原名 Rijndael 算法）。

- **密钥长度**：128 / 192 / 256 位（对应 AES-128、AES-192、AES-256）
- **块大小**：128 位（16 字节）
- **现状**：**目前最广泛使用的对称加密算法**，HTTPS 中大量使用

AES-256 的安全性：密钥空间是 2^256 ≈ 1.16 × 10^77。假设有 1 亿台计算机，每台每秒尝试 10 亿个密钥，穷举一遍需要的时间远远超过宇宙年龄。所以 AES-256 在可预见的未来是安全的（量子计算机的 Grover 算法能把搜索空间减半，相当于密钥强度减半，AES-256 仍有 128 位安全性，依然安全）。

### ChaCha20

Google 力推的流密码，专为没有 AES 硬件加速的移动设备设计。

- **密钥长度**：256 位
- **特点**：纯软件实现就很快，在 ARM 手机上比 AES 软件实现快
- **常配 Poly1305**：组成 ChaCha20-Poly1305 认证加密方案
- **现状**：TLS 1.3 支持的三大加密套件之一

## AES 详解

AES 是一个**块密码**（Block Cipher），它一次加密一个固定大小的数据块（128 位 = 16 字节）。但我们要加密的数据往往远超 16 字节，怎么办？这就需要"工作模式"来规定如何处理多个数据块。

### AES 的内部结构

AES 把 16 字节的数据块排列成 4×4 的字节矩阵，然后进行多轮变换：

\`\`\`text
AES-128：10 轮
AES-192：12 轮
AES-256：14 轮

每一轮包含 4 个步骤：
  1. SubBytes（字节替换）：非线性替换，提供混淆
  2. ShiftRows（行移位）：行循环移位，提供扩散
  3. MixColumns（列混淆）：列混合变换，提供扩散
  4. AddRoundKey（轮密钥加）：与轮密钥异或，提供密钥影响

最后一轮省略 MixColumns。
\`\`\`

不用深究细节，你只需要知道：AES 经过这么多轮变换后，输入和输出之间的关系变得极其复杂，明文哪怕只改一个比特，经过若干轮后密文也会面目全非（这叫"雪崩效应"）。

## 工作模式

块密码一次只能加密 16 字节，要加密更长的数据，需要工作模式。

### ECB（Electronic Codebook）——最简单，但最不安全

ECB 模式把明文切成 16 字节一块，每块独立加密。

\`\`\`text
ECB 模式：
  明文块1 ──加密──▶ 密文块1
  明文块2 ──加密──▶ 密文块2
  明文块3 ──加密──▶ 密文块3
  ...
\`\`\`

致命缺陷：**相同的明文块加密后得到相同的密文块**。这会泄露明文的模式。

经典案例：用 ECB 加密一张企鹅图片，加密后的图片轮廓还是企鹅！（著名的"ECB 企鹅图"）

### CBC（Cipher Block Chaining）——链接式加密

CBC 模式把前一块的密文和当前块的明文异或后再加密，第一块需要一个初始向量（IV）。

\`\`\`text
CBC 模式：
  明文块1 ──⊕(IV)──加密──▶ 密文块1 ──┐
  明文块2 ──⊕─────────────────────▶ 加密 ──▶ 密文块2 ──┐
  明文块3 ──⊕─────────────────────▶ 加密 ──▶ 密文块3
\`\`\`

特点：
- 需要 IV（初始向量），IV 必须随机且不可预测
- 相同明文在不同位置加密结果不同（因为前一块密文不同）
- 加密不可并行（每块依赖前一块），解密可并行

### CTR（Counter）——计数器模式

CTR 模式把加密变成流密码：用一个计数器作为"明文"加密，再和真正的明文异或。

\`\`\`text
CTR 模式：
  counter(0) ──加密──▶ ⊕ 明文块1 = 密文块1
  counter(1) ──加密──▶ ⊕ 明文块2 = 密文块2
  counter(2) ──加密──▶ ⊕ 明文块3 = 密文块3
\`\`\`

特点：可并行（各块独立），加解密用同一逻辑，但不提供完整性保护。

### GCM（Galois/Counter Mode）——推荐

GCM = CTR 加密 + GHASH 认证。**加密的同时提供完整性校验**，这叫 AEAD（认证加密）。

\`\`\`text
GCM 模式：
  1. 用 CTR 模式加密数据 → 得到密文
  2. 同时用 GHASH 计算认证标签（tag）
  3. 输出：密文 + tag
  4. 解密时先验证 tag，通过才解密
\`\`\`

特点：
- 加密 + 认证一体化（AEAD）
- 可并行，性能好
- 需要 nonce（一次性数字），不能重复
- **HTTPS 中最推荐的模式**（TLS 1.3 只保留 AEAD 模式）

## Demo 1：openssl AES-256-GCM 加密文件

我们用 openssl 命令行实际操作 AES-256-GCM 加解密。

\`\`\`bash
# 先准备一个明文文件
echo "Hello, HTTPS! This is a secret message." > plain.txt
# echo "..." > plain.txt：把文本写入 plain.txt

# 生成 32 字节（256 位）的随机密钥，以十六进制输出
KEY=$(openssl rand -hex 32)
# openssl rand -hex 32：生成 32 字节随机数，输出为 64 字符十六进制
# $()：命令替换，把输出赋给变量 KEY
# 32 字节 = 256 位，对应 AES-256

# 生成 12 字节的 nonce（GCM 推荐 12 字节）
IV=$(openssl rand -hex 12)
# 12 字节是 GCM 标准推荐的 nonce 长度
# 此时 IV 是 24 字符十六进制字符串

echo "密钥: $KEY"
echo "IV:   $IV"
# 打印密钥和 IV，方便后续解密使用

# 加密
openssl enc -aes-256-gcm -in plain.txt -out enc.bin -K "$KEY" -iv "$IV"
# enc：openssl 的对称加密子命令
# -aes-256-gcm：指定算法为 AES-256-GCM
# -in plain.txt：输入文件
# -out enc.bin：输出文件（二进制密文）
# -K "$KEY"：指定密钥（十六进制字符串）
# -iv "$IV"：指定初始向量（十六进制字符串）

# 查看密文（应该是乱码）
xxd enc.bin
# xxd：十六进制查看工具
# 输出类似：00000000: 7a8b... 密文 + 末尾的认证 tag

# 解密
openssl enc -d -aes-256-gcm -in enc.bin -out dec.txt -K "$KEY" -iv "$IV"
# -d：decrypt，解密模式
# 解密时必须提供相同的密钥和 IV
# GCM 会自动验证 tag，如果密文被篡改，解密会失败

# 验证解密结果
cat dec.txt
# 应该输出：Hello, HTTPS! This is a secret message.

# 如果密文被篡改哪怕一个字节，解密会报错：
# echo "garbage" >> enc.bin  # 故意篡改
# openssl enc -d -aes-256-gcm -in enc.bin -out dec.txt -K "$KEY" -iv "$IV"
# 会报错：bad decrypt
\`\`\`

## Demo 2：Python cryptography 库 AES-GCM

实际开发中，更多用编程语言操作加密。Python 的 \`cryptography\` 库是首选。

\`\`\`python
# 安装：pip install cryptography
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# 生成 256 位（32 字节）的 AES 密钥
key = AESGCM.generate_key(bit_length=256)
# generate_key：类方法，生成指定长度的随机密钥
# bit_length=256：256 位密钥，对应 AES-256
# 此时 key 是 32 字节的 bytes 对象

# 生成 12 字节的 nonce（GCM 推荐 12 字节，不可重复使用）
nonce = os.urandom(12)
# os.urandom(12)：从操作系统的 CSPRNG 读取 12 字节随机数
# nonce 必须每次加密都不同，否则会破坏 GCM 的安全性

# 创建 AESGCM 实例
aes = AESGCM(key)
# 传入密钥，创建加密器对象

# 加密
plaintext = b"Hello, HTTPS! This is a secret message."
# 注意是 bytes（b"..."），不是 str
ct = aes.encrypt(nonce, plaintext, None)
# encrypt(nonce, plaintext, associated_data)
#   nonce：12 字节随机数
#   plaintext：要加密的明文（bytes）
#   associated_data：附加认证数据（AAD），None 表示无
# 返回值 ct = 密文 + 16 字节认证 tag（拼在一起）

print(f"密文（hex）: {ct.hex()}")
# .hex()：把 bytes 转成十六进制字符串方便查看

# 解密
decrypted = aes.decrypt(nonce, ct, None)
# decrypt(nonce, ciphertext, associated_data)
# 传入相同的 nonce 和密文
# 内部会先验证 tag，验证失败抛出 InvalidTag 异常
# AAD 必须和加密时一致，否则也会验证失败

print(f"解密结果: {decrypted.decode()}")
# .decode()：把 bytes 解码为 str（默认 UTF-8）
# 输出：Hello, HTTPS! This is a secret message.

# 演示 AAD（附加认证数据）的用法
aad = b"metadata:user_id=12345"  # 不加密但要认证的数据
ct2 = aes.encrypt(nonce, plaintext, aad)
# AAD 不会出现在密文里，但会被纳入 tag 计算
# 解密时必须提供相同的 AAD 才能通过验证
decrypted2 = aes.decrypt(nonce, ct2, aad)
print(f"带 AAD 解密: {decrypted2.decode()}")

# 演示篡改检测
try:
    # 篡改密文的最后一个字节（tag 部分）
    tampered = ct[:-1] + bytes([ct[-1] ^ 1])  # 翻转最后一位
    aes.decrypt(nonce, tampered, None)  # 应该抛异常
except Exception as e:
    print(f"篡改检测成功，抛出异常: {type(e).__name__}")
    # 输出：InvalidTag
\`\`\`

## Demo 3：ECB vs CBC 直观对比

经典的"ECB 企鹅图"实验：用 ECB 和 CBC 加密同一张图片，看效果差异。

\`\`\`python
# 需要安装 Pillow：pip install Pillow cryptography
from PIL import Image
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os

# 打开一张图片（建议用色彩丰富的图）
img = Image.open("tux.png")  # Linux 吉祥物企鹅图是经典案例
# 转为 RGB 模式
img = img.convert("RGB")
pixels = img.tobytes()
# 把图片像素数据转成 bytes，这样才能用加密库处理

# 生成密钥（16 字节，AES-128）
key = os.urandom(16)

# === ECB 加密 ===
# ECB 不需要 IV，每块独立加密
cipher_ecb = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
# Cipher：加密器对象
#   algorithms.AES(key)：指定 AES 算法和密钥
#   modes.ECB()：指定 ECB 模式
#   backend：后端实现（现代版本可省略）
encryptor_ecb = cipher_ecb.encryptor()
# 创建加密器实例

# 补齐到 16 字节倍数（PKCS7 padding）
pad_len = 16 - (len(pixels) % 16)
padded = pixels + bytes([pad_len]) * pad_len
# PKCS7 填充：缺几字节就补几个值为该数字的字节

ct_ecb = encryptor_ecb.update(padded) + encryptor_ecb.finalize()
# update：分块加密
# finalize：处理剩余数据并结束

# 把 ECB 密文转回图片（去掉 padding）
ct_ecb_unpadded = ct_ecb[:len(pixels)]
img_ecb = Image.frombytes("RGB", img.size, ct_ecb_unpadded)
img_ecb.save("tux_ecb.png")
# 保存后打开看，你会看到企鹅的轮廓依然可见！
# 因为相同的像素块加密后得到相同的密文块，图案被保留

# === CBC 加密 ===
iv = os.urandom(16)  # CBC 需要 16 字节 IV
cipher_cbc = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
encryptor_cbc = cipher_cbc.encryptor()
ct_cbc = encryptor_cbc.update(padded) + encryptor_cbc.finalize()

ct_cbc_unpadded = ct_cbc[:len(pixels)]
img_cbc = Image.frombytes("RGB", img.size, ct_cbc_unpadded)
img_cbc.save("tux_cbc.png")
# 保存后打开看，完全看不出企鹅的轮廓，全是雪花般的噪点
# 这就是 CBC 的优势：相同的明文块加密后得到不同的密文块
\`\`\`

运行后对比两张图片：
- \`tux_ecb.png\`：还能看出企鹅轮廓（ECB 的致命缺陷）
- \`tux_cbc.png\`：完全看不出原图（CBC 的优势）

## Demo 4：对比 AES-GCM 与 ChaCha20 性能

不同算法的性能差异很大，实际部署 HTTPS 时要根据硬件选择。

\`\`\`bash
# 测试 AES-256-GCM 性能
openssl speed -evp aes-256-gcm
# speed：性能测试子命令
# -evp：使用 EVP 接口（更现代的 API，能利用硬件加速）
# aes-256-gcm：要测试的算法
# 输出类似：
#   type             16 bytes   64 bytes  256 bytes 1024 bytes 8192 bytes
#   aes-256-gcm     123456.78k 234567.89k 345678.90k 456789.01k 567890.12k
#   表示每秒处理多少 KB 数据

# 测试 ChaCha20-Poly1305 性能
openssl speed -evp chacha20-poly1305
# chacha20-poly1305：ChaCha20 流密码 + Poly1305 MAC
# 在没有 AES 硬件加速的设备上（如部分手机、物联网设备），
# ChaCha20 通常比 AES 快

# 同时测试多个算法对比
openssl speed -evp aes-128-gcm -evp aes-256-gcm -evp chacha20-poly1305
# 可以一次测试多个算法，输出对比表

# 测试不同数据块大小（用 -bytes 指定）
openssl speed -bytes 1024 -evp aes-256-gcm
# -bytes 1024：只测 1024 字节大小的数据块
\`\`\`

经验法则：
- **服务器（有 AES-NI 指令集）**：用 AES-GCM 更快
- **手机/物联网设备（无 AES 硬件加速）**：用 ChaCha20-Poly1305 更快
- **两者都是 AEAD**：都提供加密 + 完整性

## 对称算法对比表

| 算法 | 密钥长度 | 块大小 | 速度 | 安全性 | 状态 |
|-----|---------|-------|------|-------|------|
| DES | 56 位 | 64 位 | 快 | 已被破解 | 已淘汰，禁用 |
| 3DES | 112/168 位 | 64 位 | 慢 | 尚可 | 逐步淘汰 |
| AES-128 | 128 位 | 128 位 | 极快 | 安全 | 推荐 |
| AES-256 | 256 位 | 128 位 | 极快 | 很安全 | 推荐 |
| ChaCha20 | 256 位 | 流密码 | 快 | 很安全 | 推荐（移动端） |
| RC4 | 40-2048 位 | 流密码 | 极快 | 已被破解 | 禁用 |

## 工作模式对比表

| 模式 | 需要 IV | 并行 | 完整性 | 安全性 | 推荐度 |
|-----|--------|------|-------|-------|-------|
| ECB | 否 | 是 | 无 | 不安全（泄露模式） | 禁用 |
| CBC | 是（不可预测） | 解密可并行 | 无 | 安全（需配合 MAC） | 不推荐 |
| CTR | 是（nonce） | 是 | 无 | 安全（需配合 MAC） | 不推荐 |
| GCM | 是（nonce） | 是 | 有（AEAD） | 安全 | 强烈推荐 |
| CCM | 是（nonce） | 有限 | 有（AEAD） | 安全 | 推荐（受限场景） |

## 本章小结

| 知识点 | 核心内容 |
|-------|---------|
| 对称加密定义 | 加密解密用同一把密钥 |
| 主要算法 | AES（主流）、ChaCha20（移动端）、DES/3DES（已淘汰） |
| AES 参数 | 块 128 位，密钥 128/192/256 位，10/12/14 轮 |
| 工作模式 | ECB（禁用）、CBC、CTR、GCM（推荐） |
| AEAD 概念 | 加密 + 认证一体化，GCM 是代表 |
| 关键原则 | 禁用 ECB，优先用 AES-GCM 或 ChaCha20-Poly1305 |
| 密钥管理 | 密钥必须保密，nonce/IV 不能重复 |
| HTTPS 中的应用 | TLS 1.3 只保留 AEAD 模式（AES-GCM、ChaCha20-Poly1305） |
`
  },

  // ============================================================
  // 第三章：非对称加密
  // ============================================================
  {
    id: "hs-asymmetric",
    group: "密码学基础",
    icon: "🗝️",
    title: "非对称加密",
    content: `# 非对称加密

## 对称加密的痛点：密钥分发问题

上一章我们学了对称加密，它有个致命问题：**怎么把密钥安全地送给对方？**

生活类比：假设你和远方的朋友想用带锁箱子通信。你把信锁进箱子，但钥匙只有你和朋友有。问题是——**怎么把钥匙送给朋友？**

- 邮寄钥匙？邮寄过程中可能被复制
- 当面给？那还得跑一趟，太麻烦
- 网上发？网上发什么都是明文，等于没加密

这就是**密钥分发问题**（Key Distribution Problem）。在互联网时代，你和服务器之间可能隔着半个地球，根本不可能"当面交换密钥"。

\`\`\`text
密钥分发难题：

  你                              服务器
    │                                │
    │  ??? 怎么安全传输密钥 K ???     │
    │  ──── 网络是不安全的 ────▶      │
    │                                │
    │  如果直接发密钥，中间人能拿到    │
    │  如果加密发，又要先有密钥（循环） │
    └────────────────────────────────┘
\`\`\`

这个问题困扰了密码学界几十年，直到 1970 年代**非对称加密**（也叫公钥加密）的诞生才被解决。

## 非对称加密原理

非对称加密用**两把不同的钥匙**：
- **公钥（Public Key）**：可以公开给任何人
- **私钥（Private Key）**：必须严格保密，只有自己知道

生活类比：信箱。信箱上有个投信口（公钥），任何人都可以从投信口塞信进来；但只有信箱主人有钥匙（私钥），才能打开放信。

\`\`\`text
非对称加密流程：

  发送方                          接收方
    │                               │
    │                  生成密钥对     │
    │                  公钥（公开）   │
    │                  私钥（保密）   │
    │       ◀── 公钥随便发 ──        │
    │                               │
    │  明文 "hello"                  │
    │     │                          │
    │     ▼ 用【公钥】加密             │
    │  密文 "Xf9$k2"                 │
    │     │                          │
    │     │ ── 传输密文 ──▶            │
    │     │              密文 "Xf9$k2"│
    │     │                 │        │
    │     │                 ▼ 用【私钥】解密
    │     │              明文 "hello" │
\`\`\`

关键特性：
1. **公钥加密，私钥解密**：任何人都能用你的公钥加密发给你，但只有你能用私钥解密
2. **从公钥推不出私钥**：这是数学上的难题保证的
3. **私钥签名，公钥验证**：反过来用，可以验证身份（数字签名）

数学表达：
- 加密：\`C = E(Pub, P)\`
- 解密：\`P = D(Priv, C)\`
- 签名：\`S = Sign(Priv, M)\`
- 验签：\`Verify(Pub, M, S) → True/False\`

## RSA 算法

RSA 是 1977 年由 Ron Rivest、Adi Shamir、Leonard Adleman 三人发明的（名字就是三人首字母），是第一个能用于加密也能用于签名的非对称算法。

### 数学基础：大数分解难题

RSA 的安全性基于一个数学事实：**把两个大素数相乘很容易，但把乘积分解回两个素数极难**。

\`\`\`text
正向（容易）：  373 × 571 = 212983
反向（极难）：  212983 = ? × ?    （需要穷举试除）

当素数大到 2048 位（约 600 位十进制），用目前最快的计算机也要算几十亿年。
但量子计算机的 Shor 算法理论上能快速分解，所以 RSA 有"后量子"风险。
\`\`\`

### RSA 密钥生成过程（简化版）

\`\`\`text
1. 选两个大素数 p 和 q
2. 计算 n = p × q                （n 是公钥和私钥的一部分）
3. 计算欧拉函数 φ(n) = (p-1)(q-1)
4. 选一个 e，满足 1 < e < φ(n) 且 gcd(e, φ(n)) = 1
   （e 通常选 65537，这是个固定的"好"值）
5. 计算 d = e⁻¹ mod φ(n)        （d 是 e 对 φ(n) 的模反元素）

公钥 = (n, e)
私钥 = (n, d)

加密：C = M^e mod n
解密：M = C^d mod n
\`\`\`

不用深究数学，你只需要知道：
- **n** 决定了密钥长度（2048 位指 n 的位数）
- **e** 是公开的（通常 65537）
- **d** 是保密的（这是私钥的核心）
- 从 (n, e) 推出 d 需要分解 n，而分解大数极难

## 椭圆曲线 ECC

ECC（Elliptic Curve Cryptography）是基于椭圆曲线离散对数难题的非对称算法。

### 优势：密钥更短，安全性相当

\`\`\`text
安全强度对比：

  对称强度    RSA 密钥长度    ECC 密钥长度
  ─────────────────────────────────────
   80 位      1024 位        160 位
  128 位      3072 位        256 位
  256 位      15360 位       512 位

同样 128 位安全性，RSA 要 3072 位，ECC 只要 256 位！
密钥短意味着计算快、存储省、传输少。
\`\`\`

### 数学基础：椭圆曲线离散对数难题

椭圆曲线方程形如 \`y² = x³ + ax + b\`，曲线上定义了一种特殊的"加法"运算。已知点 G 和 k×G = Q，求 k 极难（这就是离散对数问题）。

\`\`\`text
椭圆曲线加密的核心：
  私钥 = k（一个随机大整数）
  公钥 = Q = k × G（G 是公开的基点）

  已知 k 和 G，算 Q 很容易（几次乘法）
  已知 Q 和 G，算 k 极难（这就是离散对数难题）
\`\`\`

常用的 ECC 曲线：
- **prime256v1**（也叫 P-256、secp256r1）：NIST 标准，最常用
- **secp384r1**（P-384）：更高强度
- **Curve25519**：Daniel J. Bernstein 设计，无后门嫌疑，现代首选

## 公钥加密/私钥签名两个用途

非对称加密有两个截然不同的用途，这是初学者容易混淆的地方：

### 用途一：公钥加密，私钥解密（保密通信）

\`\`\`text
场景：你想给某人发加密邮件
  1. 你拿到对方的【公钥】
  2. 用公钥加密邮件内容
  3. 对方收到后用【私钥】解密

特点：公钥加密 → 只有持私钥的人能解密 → 保证机密性
\`\`\`

### 用途二：私钥签名，公钥验签（身份认证）

\`\`\`text
场景：你要发布一个声明，证明"这确实是我发的"
  1. 你用【私钥】对声明签名
  2. 别人用你的【公钥】验证签名
  3. 验证通过，证明声明确实是你发的，且没被篡改

特点：私钥签名 → 公钥能验证 → 证明身份 + 完整性
\`\`\`

**HTTPS 中的关键应用**：服务器用私钥签名握手数据，客户端用证书里的公钥验证——这就是身份认证。如果私钥泄露，攻击者就能冒充服务器。

## Demo 1：openssl 生成 RSA 密钥对

我们用 openssl 实际生成 RSA 密钥对。

\`\`\`bash
# 生成 2048 位的 RSA 私钥
openssl genrsa -out private.pem 2048
# genrsa：生成 RSA 密钥对的子命令
# -out private.pem：输出到 private.pem 文件
# 2048：密钥位数（2048 是目前最低安全要求，推荐 4096）
# 生成的 private.pem 是 PEM 格式（Base64 编码，带 -----BEGIN...----- 头尾）

# 查看私钥文件内容
cat private.pem
# 输出类似：
#   -----BEGIN PRIVATE KEY-----
#   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...
#   ...（Base64 编码的密钥数据）
#   -----END PRIVATE KEY-----
# 这个文件必须严格保密！泄露了就等于密钥泄露

# 从私钥导出公钥
openssl rsa -in private.pem -pubout -out public.pem
# rsa：处理 RSA 密钥的子命令
# -in private.pem：输入私钥文件
# -pubout：输出公钥（默认是输出私钥）
# -out public.pem：输出到 public.pem
# 公钥可以公开给任何人

# 查看公钥内容
cat public.pem
# 输出类似：
#   -----BEGIN PUBLIC KEY-----
#   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
#   -----END PUBLIC KEY-----

# 查看私钥的详细参数（素数、指数等）
openssl rsa -in private.pem -text -noout
# -text：以可读文本显示密钥参数
# -noout：不输出 PEM 格式的密钥本身
# 输出会显示：
#   Private-Key: (2048 bit)         # 密钥长度
#   modulus:                         # n（模数）
#     00:b3:7c:...
#   publicExponent: 65537 (0x10001) # e（公钥指数，固定 65537）
#   privateExponent:                 # d（私钥指数，保密！）
#   prime1:                          # p（素数 1）
#   prime2:                          # q（素数 2）
#   ...
\`\`\`

## Demo 2：用公钥加密、私钥解密

现在用刚生成的密钥对加密一段消息。

\`\`\`bash
# 准备明文文件
echo "This is a secret message for RSA encryption." > plain.txt

# 用公钥加密
openssl pkeyutl -encrypt -inkey public.pem -pubin -in plain.txt -out enc.bin
# pkeyutl：非对称加密工具（pkey = public key）
# -encrypt：加密操作
# -inkey public.pem：指定密钥文件
# -pubin：明确告诉 openssl 输入的是公钥（否则默认当私钥处理）
# -in plain.txt：明文输入
# -out enc.bin：密文输出（二进制）

# 查看密文（应该是乱码）
xxd enc.bin | head
# xxd：十六进制查看
# head：只看前几行
# 密文长度等于密钥长度（2048 位 = 256 字节）

# 用私钥解密
openssl pkeyutl -decrypt -inkey private.pem -in enc.bin -out dec.txt
# -decrypt：解密操作
# -inkey private.pem：用私钥解密（不用 -pubin，因为解密用私钥）
# -in enc.bin：密文输入
# -out dec.txt：解密后的明文输出

# 验证解密结果
cat dec.txt
# 输出：This is a secret message for RSA encryption.
\`\`\`

注意：**RSA 能加密的数据长度有限**，最大等于密钥长度减去 padding（OAEP padding 下 2048 位密钥最多加密 214 字节）。所以实际中不会直接用 RSA 加密大文件，而是用 RSA 加密一个对称密钥，再用对称密钥加密文件——这就是混合加密。

## Demo 3：用私钥签名、公钥验签

签名是 HTTPS 中验证服务器身份的核心机制。

\`\`\`bash
# 准备要签名的文件
echo "This document is signed by the server." > doc.txt

# 用私钥签名（先对文件做 SHA-256 哈希，再用私钥加密哈希值）
openssl dgst -sha256 -sign private.pem -out sig.bin doc.txt
# dgst：digest，摘要工具（这里用于签名）
# -sha256：用 SHA-256 算法做哈希
# -sign private.pem：用私钥签名
# -out sig.bin：签名输出（二进制）
# doc.txt：要签名的文件
# 签名过程：SHA256(doc.txt) → 用私钥加密 → sig.bin

# 查看签名（二进制乱码）
xxd sig.bin | head
# 签名长度等于密钥长度（2048 位 = 256 字节）

# 用公钥验签
openssl dgst -sha256 -verify public.pem -signature sig.bin doc.txt
# -verify public.pem：用公钥验证签名
# -signature sig.bin：指定签名文件
# doc.txt：原始文件
# 输出：Verified OK    # 验证通过

# 演示：如果文件被篡改，验签会失败
echo "tampered" >> doc.txt
openssl dgst -sha256 -verify public.pem -signature sig.bin doc.txt
# 输出：Verification failure
# 因为文件内容变了，重新计算的哈希和签名对不上
\`\`\`

这就是数字签名的原理：
- **签名者**用私钥对消息的哈希值"加密"（签名）
- **验证者**用公钥"解密"签名得到哈希值，再和消息的哈希值对比
- 一致就验证通过，不一致说明消息被篡改或签名伪造

HTTPS 中，服务器证书里包含 CA 的数字签名，浏览器用 CA 的公钥验证这个签名，从而确认证书的真实性。

## Demo 4：Python cryptography 用 RSA 加密解密

实际开发中，推荐用 Python cryptography 库。

\`\`\`python
# pip install cryptography
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization

# 生成 RSA 私钥（2048 位）
private_key = rsa.generate_private_key(
    public_exponent=65537,  # 公钥指数 e，固定用 65537
    key_size=2048,          # 密钥长度，2048 是最低要求
)
# generate_private_key：生成 RSA 密钥对
# public_exponent=65537：e 的值，几乎都用 65537（0x10001）
#   为什么是 65537？它是素数，且二进制只有两个 1，模幂运算快
# key_size=2048：2048 位密钥，提供约 112 位安全性

# 从私钥导出公钥
public_key = private_key.public_key()
# 公钥可以从私钥导出，反过来不行

# 保存私钥到文件（PEM 格式）
pem_private = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,        # PEM 编码（Base64）
    format=serialization.PrivateFormat.PKCS8,   # PKCS#8 格式
    encryption_algorithm=serialization.NoEncryption(),  # 不加密（生产中应加密）
)
with open("py_private.pem", "wb") as f:
    f.write(pem_private)
# private_bytes：把私钥序列化为字节
#   Encoding.PEM：PEM 格式（带 -----BEGIN...-----）
#   PrivateFormat.PKCS8：PKCS#8 标准（跨平台兼容）
#   NoEncryption：不加密存储（实际应加密，用 BestAvailableEncryption）

# 保存公钥到文件
pem_public = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)
with open("py_public.pem", "wb") as f:
    f.write(pem_public)
# public_bytes：把公钥序列化为字节
#   SubjectPublicKeyInfo：X.509 标准公钥格式

# 用公钥加密
message = b"Hello, RSA encryption!"
# 注意：必须是 bytes

ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),  # 掩码生成函数
        algorithm=hashes.SHA256(),                     # 哈希算法
        label=None,                                    # 标签（通常 None）
    ),
)
# encrypt：用公钥加密
# OAEP（Optimal Asymmetric Encryption Padding）：推荐的 padding 方式
#   MGF1：Mask Generation Function 1，基于 SHA-256
#   SHA-256：OAEP 内部用的哈希
#   label：可选标签，通常不用
# 为什么不用 PKCS1v15？它有 Bleichenbacher 攻击漏洞，OAEP 更安全

# 用私钥解密
plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None,
    ),
)
# decrypt：用私钥解密
# padding 必须和加密时一致

print(f"解密结果: {plaintext.decode()}")
# 输出：Hello, RSA encryption!

# 用私钥签名（PSS 是推荐的签名 padding）
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding

signature = private_key.sign(
    message,
    asym_padding.PSS(
        mgf=asym_padding.MGF1(hashes.SHA256()),  # 掩码生成函数
        salt_length=asym_padding.PSS.MAX_LENGTH,  # 盐长度
    ),
    hashes.SHA256(),
)
# sign：用私钥签名
# PSS（Probabilistic Signature Scheme）：推荐的签名 padding
#   比 PKCS1v15 更安全（概率性，不可预测）
#   salt_length：盐的长度，MAX 表示和哈希长度一样
# 最后一个参数 hashes.SHA256()：签名前对消息做的哈希算法

# 用公钥验签
try:
    public_key.verify(
        signature,
        message,
        asym_padding.PSS(
            mgf=asym_padding.MGF1(hashes.SHA256()),
            salt_length=asym_padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )
    # verify：用公钥验证签名
    # 验证通过不返回任何值
    # 验证失败抛出 InvalidSignature 异常
    print("签名验证通过")
except Exception as e:
    print(f"签名验证失败: {e}")
\`\`\`

## Demo 5：ECC 密钥生成与对比

现在生成 ECC 密钥，对比和 RSA 的差异。

\`\`\`bash
# 生成 ECC 私钥（使用 prime256v1 曲线，即 P-256）
openssl ecparam -name prime256v1 -genkey -out ec-private.pem
# ecparam：椭圆曲线参数工具
# -name prime256v1：指定曲线名（P-256，NIST 标准）
#   其他常用曲线：secp384r1（P-384）、secp521r1（P-521）
# -genkey：生成密钥
# -out ec-private.pem：输出到文件

# 从 ECC 私钥导出公钥
openssl ec -in ec-private.pem -pubout -out ec-public.pem
# ec：处理 EC 密钥的子命令
# -pubout：输出公钥

# 生成 RSA 私钥作对比
openssl genrsa -out rsa-private.pem 2048

# 对比文件大小
ls -l rsa-private.pem ec-private.pem rsa-public.pem ec-public.pem
# 输出类似：
#   -rw-r--r--  1 user  staff  1675 rsa-private.pem   # RSA 私钥 1.6KB
#   -rw-r--r--  1 user  staff   451 ec-private.pem    # ECC 私钥只有 0.4KB！
#   -rw-r--r--  1 user  staff   451 rsa-public.pem
#   -rw-r--r--  1 user  staff   178 ec-public.pem     # ECC 公钥只有 0.17KB

# 查看 ECC 私钥详情
openssl ec -in ec-private.pem -text -noout
# 输出会显示：
#   Private-Key: (256 bit)           # 密钥长度只有 256 位
#   priv:                            # 私钥标量 k
#     00:ab:...
#   pub:                             # 公钥点 Q = k×G（两个坐标）
#     04:...                         # 04 表示未压缩格式 + x + y

# 生成 Curve25519 密钥（更现代的曲线）
openssl genpkey -algorithm X25519 -out x25519-private.pem
# genpkey：通用密钥生成工具
# -algorithm X25519：指定算法为 X25519（用于密钥交换）
# X25519 是 Bernstein 设计的曲线，无后门嫌疑，TLS 1.3 支持
\`\`\`

ECC 的优势非常明显：同样 128 位安全性，ECC 密钥只有 256 位，而 RSA 需要 3072 位。这意味着：
- 密钥更小，存储和传输更省
- 计算更快，握手延迟更低
- 特别适合移动端和物联网设备

## RSA vs ECC 对比表

| 对比项 | RSA-2048 | ECC-256 | 说明 |
|-------|----------|---------|------|
| 密钥长度 | 2048 位 | 256 位 | ECC 短得多 |
| 安全强度 | 约 112 位 | 约 128 位 | 同等安全下 ECC 更强 |
| 公钥大小 | 256 字节 | 64 字节 | ECC 小 4 倍 |
| 签名大小 | 256 字节 | 64 字节 | ECC 小 4 倍 |
| 密钥生成 | 慢 | 快 | ECC 快很多 |
| 签名速度 | 快 | 较慢 | RSA 签名快 |
| 验签速度 | 较慢 | 快 | ECC 验签快 |
| 适合场景 | 兼容性好 | 新系统首选 | 现代推荐 ECC |
| 抗量子 | 不行 | 不行 | 都需要后量子算法 |

## 本章小结

| 知识点 | 核心内容 |
|-------|---------|
| 非对称加密定义 | 公钥加密私钥解密，或私钥签名公钥验签 |
| 解决的核心问题 | 密钥分发问题 |
| RSA 原理 | 基于大数分解难题，密钥 2048+ 位 |
| ECC 原理 | 基于椭圆曲线离散对数，密钥更短 |
| 两个用途 | 加密通信（公钥加密）+ 数字签名（私钥签名） |
| RSA padding | 加密用 OAEP，签名用 PSS |
| HTTPS 中的应用 | 握手时交换对称密钥、证书签名验证 |
| 混合加密 | 非对称加密对称密钥，对称加密数据 |
| 推荐选择 | 新系统优先 ECC（P-256/X25519） |
`
  },

  // ============================================================
  // 第四章：哈希与 MAC
  // ============================================================
  {
    id: "hs-hash-mac",
    group: "密码学基础",
    icon: "📐",
    title: "哈希与 MAC",
    content: `# 哈希与 MAC

## 哈希函数

**哈希函数**（Hash Function）是一种把任意长度的输入变成固定长度输出的函数。它的输出叫**哈希值**（hash）、**摘要**（digest）或**指纹**（fingerprint）。

生活类比：人的指纹。你看到一个人的指纹，无法还原出这个人的长相（不可逆）；但同一个人的指纹永远一样（确定性）；指纹是固定大小的（定长输出），不管这个人高矮胖瘦。

\`\`\`text
哈希函数的特性：

  输入（任意长度）          输出（固定长度）
  ┌──────────────┐         ┌──────────────────┐
  │ "hello"      │ ──哈希──▶│ 2cf24dba5fb0...  │  ← SHA-256，64 字符
  └──────────────┘         └──────────────────┘
  ┌──────────────┐         ┌──────────────────┐
  │ "hello!"     │ ──哈希──▶│ a0665f9a2d8d...  │  ← 改一个字符，输出完全变
  └──────────────┘         └──────────────────┘
  ┌──────────────┐         ┌──────────────────┐
  │ 10GB 文件    │ ──哈希──▶│ 9f86d081884c...  │  ← 文件再大，输出还是 64 字符
  └──────────────┘         └──────────────────┘
\`\`\`

### 哈希函数的四大特性

1. **确定性**：相同的输入永远得到相同的输出
2. **快速性**：计算哈希很快（比加密还快）
3. **雪崩效应**：输入改一个比特，输出面目全非
4. **不可逆性**（单向性）：从哈希值推不出输入（数学上不可行）
5. **抗碰撞**：找不到两个不同的输入产生相同输出（极难）

### 密码学哈希 vs 普通哈希

注意区分两类哈希：
- **普通哈希**（如 Python 的 \`hash()\`、Java 的 \`hashCode()\`）：用于哈希表，快但不抗碰撞
- **密码学哈希**（如 SHA-256）：用于安全场景，抗碰撞

本书讨论的都是密码学哈希。

## 常见哈希算法

### MD5（Message Digest 5）

1992 年由 Ron Rivest 设计，输出 128 位（16 字节，32 个十六进制字符）。

- **速度**：极快
- **现状**：**已不安全**！2004 年王小云团队找到了 MD5 的碰撞（两个不同输入产生相同输出）
- **仍可见的场景**：非安全用途（如文件去重、URL 短链接），但**绝不能用于安全场景**

\`\`\`bash
# 计算文件的 MD5（仅用于非安全场景，如校验下载完整性）
md5sum plain.txt    # Linux
md5 plain.txt       # macOS
# 输出类似：d41d8cd98f00b204e9800998ecf8427e  plain.txt
\`\`\`

### SHA-1（Secure Hash Algorithm 1）

1995 年由 NSA 设计，输出 160 位（20 字节）。

- **现状**：**已不安全**！2017 年 Google 和 CWI 研究所公布了 SHAttered 攻击，找到了实际碰撞
- **历史地位**：曾经是 TLS 证书签名的默认算法，现已全面淘汰

### SHA-2（Secure Hash Algorithm 2）

2001 年发布，是 SHA-1 的继任者，目前最常用的安全哈希家族。

- **SHA-224**：输出 224 位
- **SHA-256**：输出 256 位 ← **最常用**
- **SHA-384**：输出 384 位
- **SHA-512**：输出 512 位

SHA-256 是目前 HTTPS 中最常用的哈希算法，用于证书签名、TLS 握手、HMAC 等。

### SHA-3（Keccak）

2015 年发布的新一代哈希标准。和 SHA-2 没有数学关系（SHA-2 还是 Merkle-Damgård 结构，SHA-3 是海绵结构）。

- **优势**：和 SHA-2 完全不同的设计，即使 SHA-2 被攻破也能顶上
- **现状**：目前 SHA-2 还安全，SHA-3 用得少，属于"备胎"

### BLAKE2 / BLAKE3

现代高速哈希算法，比 SHA-2 快很多，安全性也好。

- **BLAKE2**：比 MD5 快，比 SHA-256 安全
- **BLAKE3**：并行设计，超快，适合大文件
- **用途**：文件校验、内容寻址（如 IPFS）

## 哈希的用途

### 用途一：完整性校验

下载大文件时，网站通常提供文件的哈希值。你下载后本地算一次哈希，和网站提供的对比，一致就说明文件没损坏或被篡改。

\`\`\`text
完整性校验流程：
  1. 网站提供：file.zip + SHA-256(原文件) = "abc123..."
  2. 你下载 file.zip（可能被篡改）
  3. 本地计算：SHA-256(下载的文件) = "???"
  4. 对比两个哈希值
     - 一致 → 文件完整
     - 不一致 → 文件被篡改或损坏
\`\`\`

### 用途二：密码存储

**绝对不能明文存储用户密码！**数据库一旦泄露，所有密码就暴露了。正确做法是存密码的哈希值。

\`\`\`text
错误做法：数据库存 password = "123456"
正确做法：数据库存 password_hash = SHA256(salt + "123456")

用户登录时：
  1. 用户输入密码 "123456"
  2. 服务器计算 SHA256(salt + "123456")
  3. 和数据库存的哈希值对比
  4. 一致 → 登录成功

数据库泄露后：
  攻击者拿到的是哈希值，无法直接反推出密码
\`\`\`

注意：单纯 SHA256 还不够（容易被彩虹表攻击），需要加盐 + 慢哈希（后面 Demo 5 详解）。

### 用途三：数字签名

非对称加密很慢，直接对大文件签名不现实。实际做法是先哈希再签名：

\`\`\`text
签名流程：
  1. 计算 message 的哈希 H = SHA256(message)
  2. 用私钥对 H 签名 S = Sign(private_key, H)
  3. 发送 message + S

验签流程：
  1. 重新计算 H' = SHA256(message)
  2. 用公钥验证 S：Verify(public_key, H', S)
  3. 通过 → 签名有效
\`\`\`

这样不管文件多大，签名的都是固定 32 字节的哈希值，速度很快。

## MAC（消息认证码）

哈希函数只能验证"数据没被篡改"，但无法验证"数据是谁发的"。任何人都能算哈希，攻击者可以篡改数据后重新算哈希。

\`\`\`text
单纯哈希的问题：
  服务器 → "转账100元" + SHA256("转账100元") → 你
  攻击者 → "转账10000元" + SHA256("转账10000元") → 你
  你无法分辨哪个是服务器发的，因为两个哈希都是"正确"的
\`\`\`

**MAC（Message Authentication Code）**解决了这个问题：它是**带密钥的哈希**。

生活类比：哈希像是"盖了章的指纹"——章（密钥）只有特定的人有，别人盖不出一样的章。

\`\`\`text
MAC 的工作方式：
  发送方：
    1. 有密钥 K 和消息 M
    2. 计算 MAC = MAC(K, M)
    3. 发送 M + MAC

  接收方：
    1. 收到 M + MAC
    2. 用相同密钥 K 计算 MAC' = MAC(K, M)
    3. 对比 MAC 和 MAC'
       - 一致 → 消息没被篡改，且是持密钥 K 的人发的
       - 不一致 → 被篡改或来源不对

  攻击者没有 K，无法伪造正确的 MAC
\`\`\`

### HMAC（Hash-based MAC）

HMAC 是最常用的 MAC 实现，它基于哈希函数（如 SHA-256）。

\`\`\`text
HMAC(K, M) = H((K' ⊕ opad) || H((K' ⊕ ipad) || M))

其中：
  H：哈希函数（如 SHA-256）
  K：密钥
  K'：K 补齐到块大小后的值
  ipad：0x36 重复（内层 padding）
  opad：0x5c 重复（外层 padding）
  ||：拼接
  ⊕：异或

不用深究公式，你只需要知道：
  HMAC = 用密钥参与的哈希，比单纯哈希更安全
  HMAC-SHA256：用 SHA-256 作为底层哈希
\`\`\`

为什么需要 HMAC 而不是简单地 \`H(K || M)\`？因为单纯拼接有长度扩展攻击漏洞（针对 Merkle-Damgård 结构的哈希）。HMAC 的双层结构能抵抗这种攻击。

## Demo 1：openssl 计算文件哈希

\`\`\`bash
# 准备测试文件
echo "Hello, HTTPS!" > plain.txt

# 用 openssl 计算 SHA-256 哈希
openssl dgst -sha256 plain.txt
# dgst：digest，摘要计算子命令
# -sha256：使用 SHA-256 算法
# 输出：SHA256(plain.txt)= 66a045b452102c59d840ec097d59d9467e13a3f34f6494e539ffd32c1bb35f18

# 计算其他哈希算法
openssl dgst -md5 plain.txt       # MD5（不安全，仅演示）
openssl dgst -sha1 plain.txt      # SHA-1（不安全，仅演示）
openssl dgst -sha384 plain.txt    # SHA-384
openssl dgst -sha512 plain.txt    # SHA-512

# 用 shasum 命令（macOS/Linux 自带）
shasum -a 256 plain.txt
# -a 256：指定 SHA-256 算法
# 输出和 openssl 一致

# macOS 自带 md5 命令
md5 plain.txt
# 等价于 openssl dgst -md5 plain.txt

# 计算字符串的哈希（不用文件）
echo -n "Hello, HTTPS!" | openssl dgst -sha256
# echo -n：-n 表示不输出末尾换行符（否则换行符也会被算进哈希）
# |：管道，把 echo 的输出传给 openssl
# 输出：66a045b452102c59d840ec097d59d9467e13a3f34f6494e539ffd32c1bb35f18
\`\`\`

## Demo 2：Python hashlib 计算多种哈希

\`\`\`python
import hashlib

data = b"hello"  # 注意是 bytes

# MD5（不安全，仅演示，不要用于安全场景）
md5_hash = hashlib.md5(data).hexdigest()
# hashlib.md5(data)：创建 MD5 哈希对象并传入数据
# .hexdigest()：以十六进制字符串返回哈希值
print(f"MD5:      {md5_hash}")
# 输出：MD5:      5d41402abc4b2a76b9719d911017c592
# 32 个十六进制字符 = 128 位

# SHA-1（不安全，仅演示）
sha1_hash = hashlib.sha1(data).hexdigest()
print(f"SHA-1:    {sha1_hash}")
# 输出：SHA-1:    aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
# 40 个十六进制字符 = 160 位

# SHA-256（推荐）
sha256_hash = hashlib.sha256(data).hexdigest()
print(f"SHA-256:  {sha256_hash}")
# 输出：SHA-256:  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
# 64 个十六进制字符 = 256 位

# SHA-512
sha512_hash = hashlib.sha512(data).hexdigest()
print(f"SHA-512:  {sha512_hash[:32]}...")  # 太长，只显示前 32 字符
# 128 个十六进制字符 = 512 位

# 分块计算（适合大文件）
sha256 = hashlib.sha256()  # 先创建空对象
with open("large_file.bin", "rb") as f:  # 假设有大文件
    while True:
        chunk = f.read(8192)  # 每次读 8KB
        if not chunk:
            break
        sha256.update(chunk)  # 分块更新
# update：可以多次调用，效果和一次性传入完整数据一样
# 这样可以处理超大文件，不会爆内存
print(f"分块哈希: {sha256.hexdigest()}")

# 查看支持的算法
print(f"可用算法: {hashlib.algorithms_available}")
# 列出当前 Python 支持的所有哈希算法
\`\`\`

## Demo 3：HMAC 生成与验证

\`\`\`python
import hmac
import hashlib

# 生成 HMAC
key = b"my-secret-key"   # 密钥（必须保密）
message = b"transfer:100USD:alice->bob"

# 用 HMAC-SHA256 生成 MAC
mac = hmac.new(key, message, hashlib.sha256).hexdigest()
# hmac.new(key, message, digestmod)：
#   key：密钥（bytes）
#   message：要认证的消息（bytes）
#   digestmod：底层哈希算法，传 hashlib.sha256
# .hexdigest()：返回十六进制字符串
print(f"HMAC: {mac}")
# 输出类似：HMAC: 7e7c8d2f...

# 验证 HMAC
expected_mac = mac  # 假设这是接收到的 MAC
# 接收方重新计算 MAC 并对比
computed_mac = hmac.new(key, message, hashlib.sha256).hexdigest()

# 用 compare_digest 比较，而不是用 ==
if hmac.compare_digest(computed_mac, expected_mac):
    # compare_digest：恒定时间比较，防止时序攻击
    # 如果用 ==，攻击者可以通过比较耗时推测正确字符数
    print("验证通过：消息完整且来源可信")
else:
    print("验证失败：消息被篡改或密钥不对")

# 演示时序攻击为什么危险
# 错误做法（用 ==）：
# def bad_verify(mac1, mac2):
#     return mac1 == mac2  # 字符串比较遇到第一个不同字符就返回
#                          # 攻击者可以逐字符试探，根据响应时间判断对错

# 正确做法（用 compare_digest）：
# def good_verify(mac1, mac2):
#     return hmac.compare_digest(mac1, mac2)  # 恒定时间，无论对错耗时一样

# 演示：消息被篡改后 HMAC 变化
tampered_message = b"transfer:10000USD:alice->bob"  # 金额从 100 改成 10000
tampered_mac = hmac.new(key, tampered_message, hashlib.sha256).hexdigest()
print(f"篡改后 HMAC: {tampered_mac}")
print(f"和原 HMAC 相同吗: {mac == tampered_mac}")  # False，检测到篡改
\`\`\`

## Demo 4：演示雪崩效应

雪崩效应是哈希函数的核心特性：输入改一点，输出完全变。

\`\`\`python
import hashlib

# 两个只差一个字符的字符串
msg1 = b"hello"
msg2 = b"hellp"  # 最后一个字符 o → p

h1 = hashlib.sha256(msg1).hexdigest()
h2 = hashlib.sha256(msg2).hexdigest()

print(f"原文1: {msg1}")
print(f"原文2: {msg2}")
print(f"差异: 最后一个字符 o → p")
print()
print(f"SHA-256(1): {h1}")
print(f"SHA-256(2): {h2}")
print()

# 统计不同的十六进制字符数
diff_count = sum(1 for a, b in zip(h1, h2) if a != b)
print(f"不同的字符数: {diff_count} / {len(h1)}")
# 大约一半字符不同，这就是"雪崩效应"
# 理想情况下，输入改 1 比特，输出每个比特都有 50% 概率翻转

# 更直观的演示：逐字节对比
print()
print("逐字符对比（^ 表示不同）：")
for i, (a, b) in enumerate(zip(h1, h2)):
    if a != b:
        print(f"  位置 {i:2d}: {a} ≠ {b}  ^")
    else:
        print(f"  位置 {i:2d}: {a} = {b}")

# 更极端的例子：空字符串 vs 一个字符
print()
print(f'SHA-256(""):    {hashlib.sha256(b"").hexdigest()[:32]}...')
print(f'SHA-256("a"):   {hashlib.sha256(b"a").hexdigest()[:32]}...')
# 完全不同，无法从输出推断输入相似度
\`\`\`

运行这个脚本，你会看到两个几乎相同的输入，哈希值却天差地别。这就是为什么哈希能用于完整性校验——任何微小改动都会被发现。

## Demo 5：密码存储（加盐 + 慢哈希）

用户密码存储是哈希最重要的应用之一，但很容易做错。

\`\`\`python
import hashlib
import os
import hmac

# ========== 错误做法 ==========

# 错误1：明文存储（千万别这样！）
# database.save(password="123456")  # 数据库泄露 = 密码泄露

# 错误2：单纯 SHA256（容易被彩虹表攻击）
# database.save(password_hash=hashlib.sha256(b"123456").hexdigest())
# 问题：攻击者可以预先计算常见密码的哈希（彩虹表），数据库泄露后直接反查
# 比如 sha256("123456") 的结果在网上随便一搜就有

# 错误3：MD5 存密码（MD5 已不安全，且有 GPU 暴力破解工具）
# database.save(password_hash=hashlib.md5(b"123456").hexdigest())

# ========== 正确做法：加盐 + 慢哈希 ==========

# 正确做法：PBKDF2（Password-Based Key Derivation Function 2）
# 原理：加盐 + 迭代哈希很多次（让破解变慢）

# 步骤1：生成随机盐（salt）
salt = os.urandom(16)
# 盐必须是随机的，每个用户不同
# 盐的作用：让相同密码产生不同哈希，彩虹表失效
# 16 字节（128 位）是推荐的盐长度

# 步骤2：用 PBKDF2 派生密钥
password = b"my-password-123"
iterations = 100000  # 迭代 10 万次
# 迭代次数越多越安全（但越慢），10 万次是目前的最低推荐
# 每年应该根据硬件性能提升而增加
key = hashlib.pbkdf2_hmac(
    "sha256",        # 哈希算法
    password,        # 用户密码
    salt,            # 盐
    iterations,      # 迭代次数
    dklen=32,        # 输出密钥长度（32 字节 = 256 位）
)
# pbkdf2_hmac：PBKDF2 实现，基于 HMAC
#   "sha256"：底层用 SHA-256
#   password：用户密码
#   salt：随机盐
#   iterations：迭代次数
#   dklen：输出长度
# 结果：一个 32 字节的密钥（即密码哈希）

# 数据库存储格式：salt + iterations + key（通常编码为字符串）
stored = f"{salt.hex()}:{iterations}:{key.hex()}"
# hex()：转成十六进制字符串存储
# 存储示例：a1b2c3...:100000:d4e5f6...

# 验证密码时：
def verify_password(stored: str, input_password: str) -> bool:
    # 从数据库取出 salt, iterations, key
    salt_hex, iter_str, key_hex = stored.split(":")
    salt = bytes.fromhex(salt_hex)
    iterations = int(iter_str)
    stored_key = bytes.fromhex(key_hex)
    
    # 用相同的 salt 和 iterations 计算输入密码的哈希
    input_key = hashlib.pbkdf2_hmac(
        "sha256",
        input_password.encode(),  # str 转 bytes
        salt,
        iterations,
        dklen=32,
    )
    # 用恒定时间比较，防止时序攻击
    return hmac.compare_digest(input_key, stored_key)

# 测试
print(f"存储格式: {stored[:40]}...")
print(f"正确密码验证: {verify_password(stored, 'my-password-123')}")  # True
print(f"错误密码验证: {verify_password(stored, 'wrong-password')}")    # False

# 更好的选择：bcrypt / argon2（专门为密码设计）
# pip install bcrypt
# import bcrypt
# hashed = bcrypt.hashpw(b"password", bcrypt.gensalt(rounds=12))
# bcrypt.checkpw(b"password", hashed)  # 验证
# bcrypt 的 rounds 参数类似 iterations，控制计算成本
\`\`\`

PBKDF2 / bcrypt / argon2 的共同特点：
- **加盐**：每个用户独立盐，彩虹表失效
- **慢哈希**：故意变慢（迭代/内存消耗），让暴力破解成本极高
- **可调成本**：随着硬件进步可以增加迭代次数

## Demo 6：TLS 1.3 中的 HKDF

TLS 1.3 大量使用 HKDF（HMAC-based Key Derivation Function）来从握手密钥派生出各种会话密钥。

\`\`\`python
# 演示 HKDF 的基本用法
import hashlib
import hmac

def hkdf_extract(salt: bytes, ikm: bytes) -> bytes:
    # HKDF-Extract：从输入密钥材料（IKM）提取伪随机密钥（PRK）
    if len(salt) == 0:
        salt = b'\\x00' * hashlib.sha256().digest_size
    return hmac.new(salt, ikm, hashlib.sha256).digest()
    # extract 阶段：HMAC(salt, IKM)
    # salt 是"盐"，IKM 是输入密钥材料
    # 输出 PRK 是固定长度（SHA-256 = 32 字节）

def hkdf_expand(prk: bytes, info: bytes, length: int) -> bytes:
    # HKDF-Expand：从 PRK 扩展出指定长度的密钥
    hash_len = hashlib.sha256().digest_size
    n = (length + hash_len - 1) // hash_len  # 需要多少轮
    okm = b""
    t = b""
    for i in range(1, n + 1):
        t = hmac.new(prk, t + info + bytes([i]), hashlib.sha256).digest()
        # 每轮：T(i) = HMAC(PRK, T(i-1) || info || i)
        okm += t
    return okm[:length]
    # expand 阶段：通过多轮 HMAC 生成指定长度的输出
    # info 是"上下文信息"，用于区分不同用途的密钥

# 演示：从握手密钥派生会话密钥
salt = b"initial-salt"           # 初始盐
ikm = b"handshake-secret"        # 握手产生的密钥材料
prk = hkdf_extract(salt, ikm)    # 提取 PRK
print(f"PRK: {prk.hex()}")

# 派生不同用途的密钥
client_write_key = hkdf_expand(prk, b"client-write-key", 32)
server_write_key = hkdf_expand(prk, b"server-write-key", 32)
# info 参数（b"client-write-key" 等）标识密钥用途
# 这样即使 PRK 相同，不同 info 产生不同密钥
print(f"客户端写密钥: {client_write_key.hex()}")
print(f"服务器写密钥: {server_write_key.hex()}")

# 用 cryptography 库的 HKDF（推荐）
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

hkdf = HKDF(
    algorithm=hashes.SHA256(),
    length=32,                    # 输出 32 字节
    salt=b"my-salt",              # 盐
    info=b"my-context-info",      # 上下文信息
)
key = hkdf.derive(b"input-key-material")
# derive：从输入密钥材料派生出密钥
# 注意：HKDF 是单次派生，不能复用对象
print(f"HKDF 派生密钥: {key.hex()}")
\`\`\`

TLS 1.3 中 HKDF 的作用：把握手阶段产生的一个"主密钥"，派生出多个独立的密钥（客户端写密钥、服务器写密钥、IV、finished 验证密钥等），每个密钥用途独立，互不影响。

## 哈希算法对比表

| 算法 | 输出长度 | 块大小 | 速度 | 安全性 | 状态 |
|-----|---------|-------|------|-------|------|
| MD5 | 128 位 | 512 位 | 极快 | 已破解 | 禁用（安全场景） |
| SHA-1 | 160 位 | 512 位 | 快 | 已破解 | 禁用（安全场景） |
| SHA-224 | 224 位 | 512 位 | 快 | 安全 | 可用 |
| SHA-256 | 256 位 | 512 位 | 快 | 安全 | 推荐 |
| SHA-384 | 384 位 | 1024 位 | 较快 | 安全 | 可用 |
| SHA-512 | 512 位 | 1024 位 | 较快 | 安全 | 推荐 |
| SHA-3-256 | 256 位 | 1600 位 | 中 | 安全 | 备选 |
| BLAKE2 | 可变 | - | 极快 | 安全 | 推荐（非密码学） |
| BLAKE3 | 可变 | - | 极快 | 安全 | 推荐（大文件） |

## 哈希 vs MAC 对比表

| 对比项 | 哈希函数 | MAC（HMAC） |
|-------|---------|-------------|
| 是否需要密钥 | 否 | 是 |
| 用途 | 完整性校验 | 完整性 + 来源认证 |
| 输出 | 固定长度 | 固定长度 |
| 安全性 | 任何人都能计算 | 只有持密钥者能计算 |
| 抗篡改 | 不能（攻击者可重算） | 能（攻击者无法伪造） |
| 典型算法 | SHA-256、SHA-3 | HMAC-SHA256 |
| HTTPS 中的角色 | 签名、证书指纹 | TLS 记录层完整性校验 |

## 本章小结

| 知识点 | 核心内容 |
|-------|---------|
| 哈希函数特性 | 定长输出、单向、雪崩效应、抗碰撞 |
| 已淘汰算法 | MD5（2004 破解）、SHA-1（2017 破解） |
| 推荐算法 | SHA-256、SHA-3、BLAKE2/3 |
| 哈希三大用途 | 完整性校验、密码存储、数字签名 |
| MAC 定义 | 带密钥的哈希，提供完整性 + 来源认证 |
| HMAC | 基于哈希的 MAC，推荐 HMAC-SHA256 |
| 密码存储原则 | 加盐 + 慢哈希（PBKDF2/bcrypt/argon2） |
| 时序攻击防护 | 用 compare_digest 恒定时间比较 |
| TLS 1.3 中的 HKDF | 从主密钥派生多个会话密钥 |
`
  },

  // ============================================================
  // 第五章：随机数与熵
  // ============================================================
  {
    id: "hs-random",
    group: "密码学基础",
    icon: "🎲",
    title: "随机数与熵",
    content: `# 随机数与熵

## 为什么密码学需要随机数

密码学中到处需要随机数，而且必须是**真正不可预测的随机数**。一旦随机数可预测，整个系统的安全性就会崩塌。

HTTPS 中需要随机数的场景：

\`\`\`text
1. 密钥生成
   - 对称密钥（AES key）
   - 非对称密钥对（RSA 私钥、ECC 私钥）
   如果密钥可预测，攻击者直接猜出来，加密形同虚设

2. IV / Nonce
   - CBC 模式的 IV
   - GCM 模式的 nonce
   如果 IV/nonce 重复，加密会被攻破

3. TLS 握手
   - 客户端随机数（Client Random）
   - 服务器随机数（Server Random）
   这两个随机数参与会话密钥推导，必须不可预测

4. Session ID / Token
   - 会话 ID
   - CSRF token
   - 密码重置 token
   如果可预测，攻击者能伪造身份

5. 盐（Salt）
   - 密码哈希的盐
   每个用户独立盐，防止彩虹表攻击
\`\`\`

生活类比：随机数就像赌博用的骰子。如果骰子被做了手脚（可预测），赌场就会破产。密码学中的随机数就是"安全的骰子"，必须保证攻击者无法预测下一个点数。

## 真随机 vs 伪随机

### 真随机数（True Random Number）

来自物理现象的随机性，理论上不可预测。

\`\`\`text
真随机源：
  - 放射性衰变（原子物理）
  - 热噪声（电路中的电子运动）
  - 大气噪声（雷电、电磁波）
  - 量子效应（量子计算机利用）
  - 鼠标移动、键盘敲击的时间间隔
  - 硬盘寻道时间

特点：
  - 不可预测（即使知道所有历史也无法预测下一个）
  - 不可复现（同样的条件不会产生同样的序列）
  - 速度慢（受物理现象限制）
\`\`\`

### 伪随机数（Pseudo Random Number）

用确定性算法生成的"随机数"，看起来随机，但其实是公式算出来的。

\`\`\`text
伪随机数生成器（PRNG）：
  输入：种子（seed）
  算法：线性同余、梅森旋转等
  输出：看似随机的数列

特点：
  - 确定性：相同种子产生相同序列
  - 可预测：知道种子就能复现整个序列
  - 速度快：纯计算，不受物理限制
  - 周期性：数列最终会重复（虽然周期很长）

例子：Python 的 random 模块用的就是梅森旋转算法
\`\`\`

## PRNG vs CSPRNG

这是密码学中最关键的区分：

\`\`\`text
┌──────────┬─────────────────────┬──────────────────────┐
│   类型   │       PRNG          │       CSPRNG         │
├──────────┼─────────────────────┼──────────────────────┤
│ 全称     │ Pseudo Random       │ Cryptographically    │
│          │ Number Generator    │ Secure PRNG          │
├──────────┼─────────────────────┼──────────────────────┤
│ 用途     │ 模拟、游戏、统计     │ 密钥、token、IV      │
├──────────┼─────────────────────┼──────────────────────┤
│ 不可预测 │ 部分可预测           │ 完全不可预测          │
├──────────┼─────────────────────┼──────────────────────┤
│ 状态泄露 │ 后续全暴露           │ 后续仍不可预测        │
├──────────┼─────────────────────┼──────────────────────┤
│ 例子     │ random.randint()    │ os.urandom()         │
│          │ Math.random()       │ secrets模块           │
│          │ 梅森旋转            │ /dev/urandom          │
└──────────┴─────────────────────┴──────────────────────┘
\`\`\`

### PRNG 的问题：可预测

\`\`\`text
PRNG（如 Python random）的问题：
  1. 种子决定一切：知道种子 → 知道整个序列
  2. 状态泄露：观察到若干输出 → 推断内部状态 → 预测后续
  3. 不满足"前向安全"：内部状态泄露 → 之前的随机数也被推出

CSPRNG 的要求：
  1. 不可预测：即使知道前面的输出，也无法预测下一个
  2. 后向安全：内部状态泄露后，之前的输出仍不可推（需要定期重置）
  3. 前向安全：知道当前状态，无法推回之前的状态
\`\`\`

**核心原则：密码学场景绝对不能用普通 PRNG，必须用 CSPRNG！**

## 熵源

### /dev/random（Linux）

\`\`\`text
/dev/random：
  - 从内核收集的环境噪声中提取熵
  - 噪声源：键盘敲击、鼠标移动、中断时间差等
  - 当熵不足时，读取会阻塞（等待积累足够熵）
  - 适合：长期密钥生成（如 GPG 密钥）
  - 问题：容易阻塞，影响性能
\`\`\`

### /dev/urandom（Linux/macOS）

\`\`\`text
/dev/urandom：
  - "unlimited" random，不会阻塞
  - 即使熵不足也会输出（用 CSPRNG 算法扩展）
  - 现代密码学认为 urandom 已经足够安全
  - 适合：日常密码学用途（密钥、IV、nonce）
  - 推荐：大多数场景用 urandom 而不是 random
\`\`\`

### getrandom() 系统调用（Linux 3.17+）

\`\`\`text
getrandom()：
  - 现代推荐的获取随机数方式
  - 不需要文件描述符（避免 fd 耗尽问题）
  - 启动早期熵不足时会阻塞（更安全）
  - 之后不再阻塞
  - glibc 2.25+ 的 getentropy() 包装了它
\`\`\`

### macOS 的随机源

macOS 也有 \`/dev/random\` 和 \`/dev/urandom\`，但行为和 Linux 不同：macOS 的 \`/dev/random\` 不会阻塞（等同于 urandom）。

## Demo 1：Linux 查看系统熵

\`\`\`bash
# 查看当前系统可用熵（Linux 专用）
cat /proc/sys/kernel/random/entropy_avail
# 输出一个数字，表示可用熵的位数
# 理想值：> 200（足够安全）
# 低值：< 100（可能不安全，但现代 CSPRNG 不依赖这个）

# 查看熵池大小上限
cat /proc/sys/kernel/random/poolsize
# 通常输出 4096（位）

# 用 dd 从 /dev/urandom 读取随机字节
dd if=/dev/urandom of=rand.bin bs=32 count=1
# if=/dev/urandom：输入文件
# of=rand.bin：输出文件
# bs=32：块大小 32 字节
# count=1：只读 1 块
# 结果：生成 32 字节随机数据存入 rand.bin

# 用 xxd 查看随机字节
xxd rand.bin
# 输出类似：00000000: a3 7f 2b 9c ... （32 字节十六进制）

# 从 /dev/urandom 直接读十六进制（用 xxd）
xxd -l 32 -p /dev/urandom
# -l 32：只读 32 字节
# -p：纯十六进制输出（不带地址和 ASCII）

# 对比 /dev/random（可能阻塞）
# dd if=/dev/random of=rand2.bin bs=32 count=1
# 如果熵不足，这条命令会卡住等待
\`\`\`

注意：macOS 没有 \`/proc/sys/kernel/random/entropy_avail\`，可以用 \`sysctl kern.random\` 查看相关信息。

## Demo 2：openssl 生成随机字节

openssl 提供了跨平台的随机数生成命令。

\`\`\`bash
# 生成 16 字节随机数（十六进制格式）
openssl rand -hex 16
# rand：生成随机数的子命令
# -hex 16：生成 16 字节，以十六进制输出（32 个字符）
# 用途：生成 AES-128 密钥、IV 等

# 生成 32 字节随机数（十六进制）
openssl rand -hex 32
# 64 个十六进制字符
# 用途：生成 AES-256 密钥

# 生成 base64 格式的随机数
openssl rand -base64 32
# -base64 32：生成 32 字节，以 Base64 输出
# Base64 比 hex 紧凑（每 3 字节变 4 字符，而 hex 是每 1 字节变 2 字符）
# 用途：生成 API key、token

# 生成原始二进制随机数到文件
openssl rand -out rand.bin 32
# -out rand.bin：输出到文件
# 32：32 字节
# 用途：生成密钥文件

# 生成适合做密码的随机字符串
openssl rand -base64 18 | tr -d '/+=' | head -c 16
# -base64 18：生成 18 字节（Base64 后约 24 字符）
# tr -d '/+='：删除 Base64 中的特殊字符 / + =
# head -c 16：只取前 16 个字符
# 结果：16 个字母数字字符的随机密码
\`\`\`

## Demo 3：Python os.urandom 与 secrets 模块

Python 中获取密码学安全随机数的两种方式。

\`\`\`python
import os
import secrets

# === 方式一：os.urandom（底层接口） ===
# os.urandom 直接读取操作系统的 CSPRNG
key = os.urandom(32)
# 参数 32：读取 32 字节
# 返回：32 字节的 bytes 对象
# 底层：Linux 调用 getrandom()，macOS 调用 /dev/urandom
print(f"os.urandom(32): {key.hex()}")
# .hex()：转成十六进制字符串查看

# 生成不同长度的随机数
iv = os.urandom(12)    # 12 字节，GCM 的 nonce
nonce = os.urandom(16) # 16 字节
salt = os.urandom(16)  # 16 字节，密码盐

# === 方式二：secrets 模块（推荐，Python 3.6+） ===
# secrets 封装了 os.urandom，提供更友好的接口

# 生成十六进制随机字符串
token_hex = secrets.token_hex(16)
# token_hex(16)：生成 16 字节随机数，返回 32 字符十六进制字符串
# 等价于 os.urandom(16).hex()
print(f"token_hex(16): {token_hex}")

# 生成 URL 安全的随机字符串
url_safe = secrets.token_urlsafe(32)
# token_urlsafe(32)：生成 32 字节随机数，返回 Base64url 编码字符串
# Base64url 用 - 和 _ 替换 + 和 /，适合放在 URL 里
# 用途：session token、API key
print(f"token_urlsafe(32): {url_safe}")

# 生成随机字节
random_bytes = secrets.token_bytes(32)
# token_bytes(32)：生成 32 字节随机 bytes
# 等价于 os.urandom(32)
print(f"token_bytes(32): {random_bytes.hex()}")

# 生成指定范围的随机整数
random_int = secrets.randbelow(100)
# randbelow(100)：生成 0-99 的随机整数
# 比 random.randint 更安全
print(f"randbelow(100): {random_int}")

# 安全地选择随机元素
choices = ["A", "B", "C", "D"]
random_choice = secrets.choice(choices)
# choice：从序列中随机选一个
print(f"choice: {random_choice}")

# === 错误示范：random 模块不安全 ===
import random
# random 模块是 PRNG，不是 CSPRNG，绝不能用于密码学！
random.seed(42)  # 设置种子
bad_key = bytes([random.randint(0, 255) for _ in range(32)])
# 问题1：如果知道种子 42，就能复现整个序列
# 问题2：即使不知道种子，梅森旋转算法的状态可被推断
# 问题3：random 模块的输出可预测
print(f"不安全的随机数: {bad_key.hex()}")
# 这个"密钥"是不安全的，攻击者可能猜出来

# 对比安全与不安全
print()
print("=== 安全 vs 不安全 对比 ===")
print(f"安全（secrets）: {secrets.token_hex(16)}")
print(f"安全（secrets）: {secrets.token_hex(16)}")
# 每次调用结果不同，不可预测
random.seed(42)
print(f"不安全（random, seed=42）: {''.join(f'{random.randint(0,255):02x}' for _ in range(16))}")
random.seed(42)
print(f"不安全（random, seed=42）: {''.join(f'{random.randint(0,255):02x}' for _ in range(16))}")
# 同样 seed，两次调用结果一样！这就是不安全的原因
\`\`\`

## Demo 4：用 Python secrets 生成强密码

\`\`\`python
import secrets
import string

# 生成强密码的几个方案

# 方案1：纯字母数字密码
def gen_alnum_password(length=16):
    alphabet = string.ascii_letters + string.digits
    # ascii_letters：a-zA-Z
    # digits：0-9
    # 合起来 62 个字符
    return "".join(secrets.choice(alphabet) for _ in range(length))
    # secrets.choice：安全地从字母表选一个字符
    # 重复 length 次，拼成密码

# 方案2：包含特殊字符的密码
def gen_strong_password(length=16):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    # 加上常用特殊字符
    return "".join(secrets.choice(alphabet) for _ in range(length))

# 方案3：XKCD 风格密码（多个随机单词拼接）
def gen_xkcd_password(word_count=4):
    # 用常见单词拼接，好记但强度高
    # 参考：https://xkcd.com/936/
    words = [
        "correct", "horse", "battery", "staple",
        "apple", "banana", "cherry", "dragon",
        "eagle", "falcon", "giraffe", "hammer",
        "igloo", "jacket", "kettle", "lemon",
    ]
    return "-".join(secrets.choice(words) for _ in range(word_count))
    # 用 - 连接单词，如 correct-horse-battery-staple

# 方案4：Diceware 风格（用骰子选单词，这里用 secrets 模拟）
def gen_diceware_password(word_count=5):
    # Diceware：掷骰子 5 次得到 5 位数字，查表选单词
    # 这里简化，直接从词库随机选
    wordlist = ["alpha", "beta", "gamma", "delta", "epsilon",
                "zeta", "eta", "theta", "iota", "kappa"]
    return " ".join(secrets.choice(wordlist) for _ in range(word_count))

# 生成示例
print("方案1（字母数字）:", gen_alnum_password(16))
print("方案2（含特殊字符）:", gen_strong_password(16))
print("方案3（XKCD 风格）:", gen_xkcd_password(4))
print("方案4（Diceware）:", gen_diceware_password(5))

# 验证密码强度（熵估算）
import math
def password_entropy(password: str, alphabet_size: int) -> float:
    # 熵 = log2(alphabet_size) * length
    return math.log2(alphabet_size) * len(password)

# 16 字符字母数字密码的熵
print(f"\\n16字符字母数字密码熵: {math.log2(62) * 16:.1f} bits")
# 62^16 约等于 2^95.3，约 95 位熵，非常强

# 4 单词 XKCD 密码的熵（假设词库 2048 个词）
print(f"4单词 XKCD 密码熵: {math.log2(2048) * 4:.1f} bits")
# 2048^4 = 2^44，约 44 位熵，足够日常使用

# 安全建议：
# - 至少 12 位字母数字密码（约 71 位熵）
# - 或 4-5 个随机单词拼接
# - 每个网站用不同密码（用密码管理器）
\`\`\`

## Demo 5：演示 random 模块可预测性

这个 Demo 展示为什么不能用 random 模块做密码学，攻击者如何利用可预测性。

\`\`\`python
import random

# === 场景：服务器用 random 生成 session token ===

# 服务器代码（有漏洞）：
def generate_token_insecure():
    random.seed()  # 用系统时间做种子（默认行为）
    token = "".join(random.choices("0123456789abcdef", k=32))
    # random.choices：从字符集选 32 个
    # 问题：random 是 PRNG，种子来自系统时间
    return token

# 生成一个 token
token = generate_token_insecure()
print(f"服务器生成的 token: {token}")

# === 攻击者如何破解 ===

# 攻击者知道服务器用 random 模块，种子是系统时间
# 假设攻击者知道 token 生成的大概时间（±1 分钟内）

import time

def crack_token(known_token: str, time_range: int = 120):
    # time_range：搜索时间范围（秒）
    current_time = int(time.time())
    # time.time()：当前时间戳（秒）
    
    # 暴力尝试每个可能的种子（时间戳）
    for t in range(current_time - time_range, current_time + time_range):
        random.seed(t)  # 用假设的时间戳做种子
        guess = "".join(random.choices("0123456789abcdef", k=32))
        # 用这个种子生成 token
        if guess == known_token:
            return t  # 找到正确的种子！
    return None

# 模拟攻击
print("\\n模拟攻击...")
print("（实际需要遍历 ±120 秒的时间戳，可能需要几秒）")

# 演示 random 的可复现性
print("\\n=== random 的可复现性演示 ===")
random.seed(12345)
seq1 = [random.randint(0, 255) for _ in range(8)]
print(f"seed=12345, 序列1: {seq1}")

random.seed(12345)  # 相同种子
seq2 = [random.randint(0, 255) for _ in range(8)]
print(f"seed=12345, 序列2: {seq2}")

print(f"两个序列相同: {seq1 == seq2}")
# True！相同种子产生相同序列

# 如果用这个生成密钥：
random.seed(12345)
bad_key = bytes([random.randint(0, 255) for _ in range(32)])
print(f"\\n用 random 生成的'密钥': {bad_key.hex()}")
# 攻击者只要试 12345 这个种子，就能得到相同密钥

# === 正确做法：用 secrets ===
import secrets
good_key = secrets.token_bytes(32)
print(f"用 secrets 生成的密钥: {good_key.hex()}")
# 无法预测，无法复现

# 总结：
# random 模块：PRNG，种子决定序列，可预测，禁用于密码学
# secrets 模块：CSPRNG，不可预测，密码学专用
\`\`\`

## Demo 6：密钥派生函数 KDF

KDF（Key Derivation Function）用于从一个"主密钥"或"密码"派生出密钥。这在 HTTPS 和密码存储中都很重要。

\`\`\`python
# pip install cryptography
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
import os

# === KDF 用途一：从密码派生密钥 ===
# 场景：用户输入密码，需要派生成加密密钥

# PBKDF2：适合从低熵密码派生密钥
password = b"my-password-123"  # 用户密码
salt = os.urandom(16)          # 随机盐

kdf = PBKDF2HMAC(
    algorithm=hashes.SHA256(),    # 哈希算法
    length=32,                    # 输出密钥长度（32 字节 = AES-256）
    salt=salt,                    # 盐
    iterations=100000,            # 迭代次数（越大越安全越慢）
)
# PBKDF2HMAC：基于 HMAC 的密钥派生
#   algorithm：底层哈希算法
#   length：输出密钥长度
#   salt：随机盐（防止彩虹表）
#   iterations：迭代次数（让暴力破解变慢）

key = kdf.derive(password)
# derive：从输入（密码）派生密钥
# 注意：derive 只能调用一次，调用后对象失效
print(f"PBKDF2 派生的密钥: {key.hex()}")

# 验证：相同密码和盐产生相同密钥
kdf2 = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=salt,            # 相同的盐
    iterations=100000,
)
key2 = kdf2.derive(password)
print(f"相同输入派生的密钥: {key2.hex()}")
print(f"两次密钥相同: {key == key2}")  # True

# 不同盐产生不同密钥（即使密码相同）
salt2 = os.urandom(16)
kdf3 = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=salt2,           # 不同的盐
    iterations=100000,
)
key3 = kdf3.derive(password)
print(f"不同盐派生的密钥: {key3.hex()}")
print(f"密钥不同: {key != key3}")  # True，盐不同结果不同

# === KDF 用途二：从主密钥派生多个子密钥 ===
# 场景：TLS 握手后有一个主密钥，需要派生多个会话密钥

# HKDF：适合从高熵密钥派生（比 PBKDF2 快，因为不需要慢哈希）
master_key = os.urandom(32)  # 主密钥（已经是高熵的）

# 派生客户端写密钥
hkdf1 = HKDF(
    algorithm=hashes.SHA256(),
    length=32,
    salt=b"session-salt",
    info=b"client-write-key",  # info 区分不同用途
)
client_write_key = hkdf1.derive(master_key)

# 派生服务器写密钥
hkdf2 = HKDF(
    algorithm=hashes.SHA256(),
    length=32,
    salt=b"session-salt",
    info=b"server-write-key",  # 不同的 info
)
server_write_key = hkdf2.derive(master_key)

print(f"\\n客户端写密钥: {client_write_key.hex()}")
print(f"服务器写密钥: {server_write_key.hex()}")
print(f"两个密钥不同: {client_write_key != server_write_key}")
# 同一个主密钥，不同 info 产生不同子密钥

# === KDF 选择指南 ===
print("\\n=== KDF 选择指南 ===")
print("PBKDF2：从密码派生（低熵输入，需要慢哈希）")
print("HKDF：从密钥派生（高熵输入，快速）")
print("scrypt/argon2：更现代的密码 KDF（抗 GPU/ASIC）")
\`\`\`

## 随机数类型对比表

| 类型 | 不可预测 | 速度 | 用途 | 例子 |
|-----|---------|------|------|------|
| 真随机 | 是 | 慢 | 密钥种子、长期密钥 | /dev/random（阻塞时） |
| CSPRNG | 是 | 快 | 密钥、IV、token | /dev/urandom、secrets |
| PRNG | 否 | 极快 | 模拟、游戏、统计 | random 模块、Math.random |

## 熵源对比表

| 熵源 | 阻塞 | 安全性 | 跨平台 | 推荐度 |
|-----|------|-------|-------|-------|
| /dev/random（Linux） | 会阻塞 | 高 | Linux 专属 | 长期密钥可用 |
| /dev/urandom | 不阻塞 | 高 | Linux/macOS | 日常推荐 |
| getrandom() | 启动期阻塞 | 高 | Linux 3.17+ | 现代 Linux 推荐 |
| getentropy() | 不阻塞 | 高 | macOS/OpenBSD | macOS 推荐 |
| RDRAND 指令 | 不阻塞 | 中（硬件） | Intel CPU | 辅助熵源 |

## 本章小结

| 知识点 | 核心内容 |
|-------|---------|
| 随机数的作用 | 生成密钥、IV/nonce、token、盐 |
| 真随机 vs 伪随机 | 真随机来自物理现象，伪随机来自算法 |
| PRNG vs CSPRNG | 密码学必须用 CSPRNG，PRNG 可预测 |
| Python 获取随机数 | os.urandom 或 secrets 模块（推荐） |
| 禁用 random 模块 | random 是 PRNG，种子可预测，不可用于密码学 |
| 密码存储 | 加盐 + 慢哈希（PBKDF2/bcrypt/argon2） |
| KDF 用途 | 从密码/主密钥派生密钥 |
| PBKDF2 vs HKDF | PBKDF2 适合低熵密码，HKDF 适合高熵密钥 |
| 系统熵源 | /dev/urandom 不阻塞，日常推荐使用 |
| 核心原则 | 密钥生成必须用 CSPRNG，绝不能用 random |
`
  }
];