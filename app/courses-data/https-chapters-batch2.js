// =============================================================
// HTTPS 详解全书 - 第 2 批章节（数字证书与 PKI 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   hs-cert-intro: 数字证书概述
//   hs-x509: X.509 证书结构
//   hs-ca-chain: CA 与信任链
//   hs-cert-issue: 证书签发流程
//   hs-revoke: 证书吊销机制
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：数字证书概述
  // ============================================================
  {
    id: "hs-cert-intro",
    group: "数字证书与 PKI",
    icon: "📜",
    title: "数字证书概述",
    content: `# 数字证书概述

## 一、为什么需要证书——公钥分发难题

在前面密码学基础一章中，我们学到了非对称加密：Alice 用 Bob 的公钥加密数据，只有 Bob 用自己的私钥才能解密。这套机制看起来天衣无缝，但隐藏着一个致命问题——**你怎么确定手上的公钥真的是 Bob 的？**

### 1.1 公钥分发问题

生活类比：假设你想给朋友张三寄一封加密信，你需要张三的公钥（相当于一把公开的锁）。你在网上搜到了一个"张三的公钥"，但这把锁可能是李四伪造的！如果你用了李四伪造的公钥加密，李四就能用他的私钥解密你的信，而张三反而看不懂。

这就是 **公钥分发问题（Public Key Distribution Problem）**：公钥是公开的，但没人能保证你拿到的公钥是真的。

没有证书的世界里，分发公钥只能靠这些笨办法：
- **面对面交换公钥**：最安全，但互联网上几亿用户不可能都见面
- **通过可信第三方口口相传**：规模一大就不可行
- **直接在网上公布公钥**：无法验证真伪

### 1.2 中间人攻击（MITM）详解

如果公钥分发没有保障，攻击者就可以实施 **中间人攻击（Man-in-the-Middle Attack，MITM）**。这是 HTTPS 出现前互联网最大的安全隐患之一。

攻击过程：

\`\`\`text
正常情况：
  Alice  ────(用 Bob 公钥加密)────▶  Bob

中间人攻击：
  Alice  ──(用 Mallory 公钥加密)──▶  Mallory  ──(用 Bob 公钥加密)──▶  Bob
                                  ◀──────────────────────────────
  Alice  ◀──(Mallory 解密后查看)──  Mallory  ◀──(Bob 响应)────────  Bob
\`\`\`

步骤拆解：
1. Alice 向 Bob 请求公钥
2. Mallory（中间人）拦截请求，把自己冒充成 Bob
3. Mallory 把自己的公钥发给 Alice，Alice 以为这是 Bob 的公钥
4. Alice 用 Mallory 的公钥加密数据发出去
5. Mallory 拦截到密文，用自己的私钥解密，偷看/篡改内容
6. Mallory 再用 Bob 的真公钥加密，转发给 Bob
7. Bob 以为直接收到了 Alice 的消息，完全不知道被窃听了

整个过程中，Alice 和 Bob 都以为在直接通信，其实中间隔着一个人。**这就是为什么单纯用非对称加密还不够——你必须能确认公钥的归属。**

### 1.3 证书的本质：CA 给公钥签名

生活类比：**证书就像身份证**。

你怎么证明你是你？你不能自己说"我是张三"就算数，得由国家颁发的身份证来证明。身份证上有：
- 你的姓名、照片、身份证号（对应：主体信息 + 公钥）
- 发证机关（对应：CA 签发者）
- 有效期（对应：证书有效期）
- 防伪标记（对应：CA 的数字签名）

**数字证书（Digital Certificate）** 的本质就是：**一个可信的第三方（CA）用自己的私钥，对"某人的公钥 + 身份信息"进行数字签名。**

\`\`\`text
证书 = 主体身份信息 + 主体公钥 + CA 的数字签名

具体结构：
┌──────────────────────────────────┐
│  主体信息：CN=github.com, O=...  │
│  主体公钥：RSA 2048 位公钥       │  ← 这部分是要被签名的内容
│  有效期：2024-01-01 ~ 2025-01-01 │
├──────────────────────────────────┤
│  CA 签名：用 CA 私钥对上面内容   │  ← 用 CA 私钥生成
│  的哈希值进行签名                │
└──────────────────────────────────┘
\`\`\`

验证过程：
1. 拿到证书后，用 CA 的公钥（CA 公钥是预装在系统里的，可信）验证签名
2. 签名有效 → 证书里的公钥确实属于证书里写的主体
3. 用这个公钥加密通信，就不会被中间人骗了

因为中间人没有 CA 的私钥，他无法伪造一个能通过 CA 公钥验证的假证书。**这就是证书防中间人攻击的核心原理。**

## 二、证书的三大作用

数字证书在 HTTPS 中承担三个核心职责：

### 2.1 身份认证

证书证明"你是谁"。浏览器连接 github.com 时，github.com 出示证书，证书上写着 CN=github.com，且由可信 CA 签名，浏览器就确认对方确实是 GitHub。

如果没有证书，任何服务器都可以自称是 github.com，钓鱼网站就横行了。

### 2.2 公钥分发

证书把主体的公钥安全地传递给对方。接收方不需要事先获取公钥，握手时对方直接把证书发过来，验证签名后就能放心使用证书里的公钥。

这解决了前面说的公钥分发难题——**用 CA 的信用背书代替了直接信任公钥本身。**

### 2.3 防伪造

证书有 CA 的数字签名，任何对证书内容的篡改都会导致签名校验失败。攻击者无法伪造证书，因为他没有 CA 的私钥。

三大作用合在一起，构成了 HTTPS 安全的基石。

## 三、PKI——公钥基础设施概述

**PKI（Public Key Infrastructure，公钥基础设施）** 是一套完整的体系，用来管理数字证书的整个生命周期。它不是单个组件，而是一组角色和规则的集合。

### 3.1 PKI 的五大组件

\`\`\`text
┌──────────────────────────────────────────────────────────┐
│                     PKI 体系架构                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────┐   申请证书    ┌──────────┐                │
│   │ 终端实体  │ ────────────▶ │   RA     │                │
│   │ (EE)     │               │ 注册机构  │                │
│   │ 网站服务器│ ◀──────────── │ 审核身份  │                │
│   └──────────┘    签发证书   └────┬─────┘                │
│                                  │ 审核通过               │
│                                  ▼                       │
│                              ┌──────────┐                │
│                              │   CA     │                │
│                              │ 认证机构  │                │
│                              │ 签发证书  │                │
│                              └────┬─────┘                │
│                                   │ 发布证书               │
│                                   ▼                       │
│   ┌──────────┐   查询证书    ┌──────────┐                │
│   │  证书库   │ ◀─────────── │  浏览器   │                │
│   │ 公开存放  │              │  客户端   │                │
│   └──────────┘              └────┬─────┘                │
│                                  │ 验证时查询             │
│                                  ▼                       │
│                              ┌──────────┐                │
│                              │   CRL    │                │
│                              │ 吊销列表  │                │
│                              │ 查是否作废 │                │
│                              └──────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
\`\`\`

各组件说明：

1. **CA（Certificate Authority，认证机构）**：PKI 的核心，负责签发证书。CA 的私钥是整个信任体系的根，一旦泄露后果不堪设想。CA 就像公安局，有权威颁发身份证。

2. **RA（Registration Authority，注册机构）**：CA 的下属机构，负责审核申请者的身份。RA 不签发证书，只做身份核验，通过后告诉 CA 可以签发。RA 就像派出所的户籍窗口，负责核验材料。

3. **终端实体（End Entity，EE）**：证书的使用者，通常是网站服务器，也可以是个人、设备、应用。EE 是身份证的持有人。

4. **证书库（Certificate Repository）**：存放已签发证书的公共数据库，任何人都可以查询。通常是 LDAP 或 HTTP 目录。

5. **CRL（Certificate Revocation List，吊销列表）**：记录已被吊销的证书编号，客户端验证证书时要检查它是否在吊销列表里。类似公安局公布的"作废身份证清单"。

### 3.2 PKI 的工作流程

\`\`\`text
1. 网站管理员向 RA 提交证书申请（CSR），附带身份材料
2. RA 审核身份材料（域名所有权、企业资质等）
3. 审核通过，RA 通知 CA
4. CA 用自己的私钥对"网站公钥 + 身份信息"签名，生成证书
5. 证书发布到证书库
6. 网站部署证书
7. 用户浏览器访问网站，获取证书
8. 浏览器用内置 CA 公钥验证证书签名
9. 浏览器查询 CRL/OCSP 确认证书未吊销
10. 验证通过，建立加密连接
\`\`\`

## 四、Demo 1：用浏览器查看网站证书

以 github.com 为例，用浏览器查看证书的步骤：

1. 打开 Chrome，访问 https://github.com
2. 点击地址栏左侧的小锁图标
3. 点击"连接是安全的"
4. 点击"证书有效"
5. 在弹出的证书查看器中，你会看到三个标签页

**常规信息（General）**：
- 颁发者：DigiCert Inc
- 颁发给：GitHub, Inc.
- 有效期：from 2024-XX-XX to 2025-XX-XX

**详细信息（Details）**：
- 版本：V3
- 序列号：一串十六进制数字
- 签名算法：SHA256withRSA
- 颁发者：CN=DigiCert TLS Hybrid ECC SHA384 2020 CA 1, O=DigiCert Inc
- 有效期：Not Before / Not After
- 主体：CN=github.com, O=GitHub Inc., L=San Francisco, S=California, C=US
- 公钥：RSA 2048 位
- SAN：github.com, www.github.com, *.github.com, *.githubusercontent.com ...
- 扩展：Key Usage, Extended Key Usage, Basic Constraints, CRL Distribution Points, Authority Info Access

**证书路径（Certification Path）**：
- DigiCert Global Root CA（根 CA，系统内置信任）
  - DigiCert TLS Hybrid ECC SHA384 2020 CA 1（中间 CA）
    - github.com（终端证书）

这条路径就是信任链，后面章节会详细讲。

## 五、Demo 2：用 openssl 查看网站证书

openssl 是命令行下查看证书最强大的工具。下面用 openssl 连接 github.com 并查看证书。

\`\`\`bash
# 连接 github.com 的 443 端口，获取证书并以可读格式输出
# echo | 是为了给 s_client 输入一个 EOF，否则它会一直等待输入
# -connect 指定目标主机和端口
# -servername 指定 SNI（Server Name Indication），告诉服务器要访问哪个域名
# 2>/dev/null 丢弃 stderr 的调试信息
# | openssl x509 -text -noout 把 PEM 格式证书转成可读文本，不输出原始 PEM
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 -text -noout
\`\`\`

输出示例（节选）：

\`\`\`text
Certificate:
    Data:
        Version: 3 (0x2)                          # 证书版本 v3
        Serial Number:                            # 序列号，CA 签发的每张证书唯一
            0e:9c:4c:5a:xx:xx:xx:xx
        Signature Algorithm: sha256WithRSAEncryption   # 签名算法 SHA256+RSA
        Issuer: DigiCert Inc                       # 签发者
        Validity                                   # 有效期
            Not Before: Mar  7 00:00:00 2024 GMT   # 生效时间
            Not After : Mar  7 23:59:59 2025 GMT   # 失效时间
        Subject: CN=github.com                     # 主体，CN 是 Common Name
        Subject Public Key Info:                   # 主体公钥信息
            Public Key Algorithm: rsaEncryption    # RSA 公钥
            RSA Public-Key: (2048 bit)             # 2048 位
        X509v3 extensions:                         # v3 扩展
            X509v3 Key Usage: critical             # 证书用途（关键扩展）
                Digital Signature, Key Encipherment
            X509v3 Subject Alternative Name:       # SAN 备用名称
                DNS:github.com, DNS:www.github.com, DNS:*.github.com
            X509v3 Basic Constraints: critical     # 基本约束
                CA:FALSE                            # 不是 CA 证书，是终端证书
    Signature Algorithm: sha256WithRSAEncryption   # 签名值
        a1:b2:c3:d4:...                            # 签名的十六进制
\`\`\`

如果只想看关键字段，可以用这些精简命令：

\`\`\`bash
# 只看主体 Subject
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 -subject -noout
# 输出：subject=CN = github.com, O = "GitHub, Inc.", L = San Francisco, ST = California, C = US

# 只看签发者 Issuer
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 -issuer -noout
# 输出：issuer=CN = DigiCert TLS Hybrid ECC SHA384 2020 CA 1, O = DigiCert Inc

# 只看有效期
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 -dates -noout
# 输出：notBefore=Mar  7 00:00:00 2024 GMT / notAfter=Mar  7 23:59:59 2025 GMT

# 只看序列号
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 -serial -noout
# 输出：serial=0E9C4C5AXXXXXXXX

# 只看指纹
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 -fingerprint -noout
# 输出：SHA1 Fingerprint=AB:CD:EF:...
\`\`\`

## 六、Demo 3：演示中间人攻击（mitmproxy 思路）

mitmproxy 是一个常用的中间人攻击演示工具。它的原理是：在客户端和服务器之间架一个代理，代理动态生成假证书骗客户端，同时代理和真实服务器建立正常连接。

\`\`\`text
客户端 ──(信任 mitmproxy 的根证书)──▶ mitmproxy ──(正常 HTTPS)──▶ 真实服务器

mitmproxy 做的事：
1. 拦截客户端对 github.com 的请求
2. 动态生成一张"github.com"的假证书（用自己内置的 CA 私钥签名）
3. 把假证书发给客户端
4. 客户端如果信任了 mitmproxy 的 CA，就会接受假证书
5. mitmproxy 同时用真实证书连 github.com
6. 两边的数据都被 mitmproxy 转发，可以查看/修改明文
\`\`\`

mitmproxy 的基本用法（仅用于学习，请勿用于非法用途）：

\`\`\`bash
# 安装 mitmproxy
pip install mitmproxy

# 启动 mitmproxy 代理，默认监听 8080 端口
mitmproxy --listen-port 8080

# 启动后它会生成一个 CA 证书，首次运行在 ~/.mitmproxy/ 目录下
# 要让浏览器信任它，需手动把 mitmproxy-ca-cert.pem 导入系统信任库
# 这一步就相当于"主动信任中间人"，实际攻击中用户不会这么做

# 配置浏览器/系统代理指向 127.0.0.1:8080
# 访问 http://mitm.it 可以下载并安装 mitmproxy 的 CA 证书

# 用 mitmdump（mitmproxy 的命令行版本）抓包并保存
mitmdump -w traffic.flow --listen-port 8080

# 抓取 HTTPS 流量后能看到明文请求和响应
# 包括 URL、请求头、Cookie、请求体、响应内容等
\`\`\`

防御中间人攻击的关键：
1. **浏览器只信任系统内置的 CA**，不信任未知 CA 出具的证书
2. **HSTS** 头强制使用 HTTPS，防止降级攻击
3. **证书透明度（CT）** 日志让伪造证书更容易被发现
4. **不要随意安装来路不明的根证书**——这等于主动交出信任

## 七、Demo 4：证书分类——DV / OV / EV

证书按验证强度分为三类：

### 7.1 DV（Domain Validation）域名验证型

CA 只验证你是否拥有该域名（通过在域名 DNS 加 TXT 记录或收验证邮件）。验证最快，几分钟就能签发。

\`\`\`bash
# Let's Encrypt 是最著名的免费 DV 证书签发机构
# 用 certbot 申请一个 DV 证书
# --nginx 自动配置 Nginx
# -d 指定域名
sudo certbot --nginx -d example.com -d www.example.com

# 或者用 acme.sh（纯 shell 实现，轻量）
# 安装
curl https://get.acme.sh | sh
# 申请证书（DNS 方式验证）
acme.sh --issue -d example.com --dns --yes-I-know-dns-manual-mode-enough-go-ahead-please
\`\`\`

### 7.2 OV（Organization Validation）组织验证型

CA 除验证域名所有权外，还要核实组织是否真实存在（查企业营业执照、电话回访等）。证书里会显示组织名称。

### 7.3 EV（Extended Validation）扩展验证型

最严格的验证，CA 要做全面的企业背景调查。以前 EV 证书在浏览器地址栏会显示绿色组织名称，但 2019 年后各大浏览器取消了这一视觉标识。

## 八、Demo 5：通配符证书与多域名证书（SAN）

### 8.1 通配符证书

一张证书覆盖一个域名下所有同级子域名。如 \`\`*.example.com\`\` 可用于 www.example.com、api.example.com、mail.example.com，但不能用于 example.com 本身或 a.b.example.com。

\`\`\`bash
# 申请通配符证书（必须用 DNS-01 验证，因为 HTTP 验证无法验证通配符）
# 用 acme.sh 申请 Let's Encrypt 通配符证书
# --dns dns_cf 表示用 Cloudflare DNS API 自动加 TXT 记录验证
export CF_Token="你的 Cloudflare API Token"
export CF_Zone_ID="你的 Zone ID"
acme.sh --issue -d '*.example.com' --dns dns_cf

# 签发后证书可用于 *.example.com 下任意子域名
# 部署到 Nginx：
# ssl_certificate /path/to/fullchain.cer;
# ssl_certificate_key /path/to/*.example.com.key;
\`\`\`

### 8.2 多域名证书（SAN）

一张证书可以同时覆盖多个不相关的域名，通过 SAN（Subject Alternative Name）扩展实现。现代证书几乎都用 SAN，CN 字段已弱化。

\`\`\`bash
# 用 openssl 生成一张多域名证书的 CSR
# 先创建配置文件 san.cnf
cat > san.cnf <<'EOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
CN = example.com                    # 主域名（现在浏览器主要看 SAN）

[req_ext]
subjectAltName = @alt_names         # 指定 SAN 扩展

[alt_names]
DNS.1 = example.com                 # 第一个域名
DNS.2 = www.example.com             # 第二个
DNS.3 = api.example.com             # 第三个
DNS.4 = example.org                 # 可以是完全不同的域名
DNS.5 = *.example.net               # 也可以混合通配符
EOF

# 用配置文件生成 CSR
openssl req -new -key example.key -out example.csr -config san.cnf

# 查看 CSR 的 SAN
openssl req -in example.csr -text -noout | grep -A 1 "Subject Alternative Name"
# 输出类似：
# X509v3 Subject Alternative Name:
#     DNS:example.com, DNS:www.example.com, DNS:api.example.com, ...
\`\`\`

## 九、证书类型对比表

| 对比项 | DV 域名验证 | OV 组织验证 | EV 扩展验证 |
|--------|------------|------------|------------|
| 验证内容 | 仅域名所有权 | 域名 + 组织真实性 | 域名 + 全面企业调查 |
| 验证时间 | 几分钟 | 1-3 天 | 3-10 天 |
| 费用 | 免费~百元 | 数百~数千元 | 数千~万元 |
| 证书显示组织名 | 否 | 是 | 是 |
| 浏览器地址栏 | 普通锁 | 普通锁 | 普通锁（曾显示绿色组织名） |
| 信任强度 | 一般 | 较高 | 最高 |
| 适用场景 | 个人博客、测试站 | 企业官网、SaaS | 金融、电商、政府 |
| 典型签发机构 | Let's Encrypt | DigiCert、Sectigo | DigiCert、GlobalSign |

## 十、本章小结

| 知识点 | 核心内容 | 生活类比 |
|--------|---------|---------|
| 公钥分发问题 | 无法确认公钥归属，会被 MITM 攻击 | 收到一把锁但不知是不是本人的 |
| 中间人攻击 MITM | 攻击者冒充双方，窃听篡改通信 | 邮差偷拆信件再封回去 |
| 证书本质 | CA 用私钥对"身份+公钥"签名 | 公安局给身份证盖章 |
| 三大作用 | 身份认证、公钥分发、防伪造 | 身份证的三个功能 |
| PKI 组件 | CA / RA / EE / 证书库 / CRL | 公安局/派出所/市民/档案库/作废清单 |
| DV/OV/EV | 验证强度递增的三类证书 | 临时证/工作证/政审证 |
| 通配符证书 | 一证覆盖所有同级子域名 | 一把钥匙开整栋楼的门 |
| 多域名证书 SAN | 一证覆盖多个不相关域名 | 一张身份证写多个住址 |
`
  },

  // ============================================================
  // 第二章：X.509 证书结构
  // ============================================================
  {
    id: "hs-x509",
    group: "数字证书与 PKI",
    icon: "📋",
    title: "X.509 证书结构",
    content: `# X.509 证书结构

## 一、X.509 标准简介

**X.509** 是国际电信联盟（ITU-T）制定的数字证书标准，定义了公钥证书的格式。它最早出现在 1988 年的 X.500 目录服务标准中，后来被 TLS/SSL 广泛采用，成为互联网证书的事实标准。

生活类比：X.509 就像身份证的国家标准——规定了身份证必须有哪些字段、各字段多长、用什么编码。所有公安局发的身份证都遵循这个标准，所有需要核验身份证的场所也按这个标准读取。

X.509 的核心规范：
- **RFC 5280**：Internet X.509 Public Key Infrastructure Certificate and CRL Profile
- **RFC 3280**：旧版规范（已废弃）
- 证书编码格式通常为 **DER**（二进制）或 **PEM**（Base64 文本）

\`\`\`bash
# PEM 格式证书长这样（Base64 编码，首尾有标记）
# 文件扩展名通常是 .pem / .crt / .cer
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
...（多行 Base64 编码）...
-----END CERTIFICATE-----

# DER 是二进制格式，用 cat 看是乱码
# 转换：PEM <-> DER
# PEM 转 DER
openssl x509 -in cert.pem -outform DER -out cert.der
# DER 转 PEM
openssl x509 -in cert.der -inform DER -outform PEM -out cert.pem
\`\`\`

## 二、证书版本（v1 / v2 / v3）

X.509 证书有三个版本：

- **v1（1988）**：最基础版本，只有基本字段（版本、序列号、签名算法、签发者、有效期、主体、公钥、签名）。
- **v2（1993）**：在 v1 基础上加了 issuerUniqueID 和 subjectUniqueID，用于处理主体/签发者重名，现已很少用。
- **v3（2008 RFC 5280）**：在 v2 基础上增加了 **扩展（Extensions）** 机制，这是最重要的改进。现代证书几乎全是 v3。

\`\`\`bash
# 查看证书版本
openssl x509 -in cert.pem -text -noout | grep Version
# 输出：Version: 3 (0x2)
# 注意 0x2 是内部编码，v3 对应的内部值是 2（从 0 开始）
\`\`\`

为什么 v3 成为主流？因为 v1/v2 的字段是固定的，无法扩展。v3 的扩展机制允许证书携带任意额外信息（如 SAN、Key Usage、Basic Constraints），这让证书能适应各种用途。

## 三、证书核心字段详解

一张 X.509 v3 证书包含以下字段，按出现顺序讲解。

### 3.1 Version（版本号）

证书使用的 X.509 版本。现代证书都是 v3。

### 3.2 Serial Number（序列号）

CA 为每张证书分配的唯一编号。同一 CA 签发的证书不会有重复序列号。序列号在吊销证书时用于标识（CRL 里记录的就是序列号）。

\`\`\`bash
# 查看序列号
openssl x509 -in cert.pem -serial -noout
# 输出：serial=0E9C4C5A12345678
\`\`\`

序列号长度建议至少 64 位（8 字节），最高位要为 0（保证非负），且必须是正整数。有些 CA 用 128 位序列号增加安全性，防止碰撞攻击。

### 3.3 Signature Algorithm（签名算法）

CA 对证书签名时使用的算法。常见组合：哈希算法 + 非对称算法。

- **sha256WithRSAEncryption**：SHA-256 哈希 + RSA 签名（最常见）
- **ecdsa-with-SHA256**：SHA-256 哈希 + ECDSA 签名
- **sha384WithRSAEncryption**：SHA-384 哈希 + RSA 签名
- **ed25519**：Ed25519 签名（现代推荐）

\`\`\`bash
# 查看签名算法
openssl x509 -in cert.pem -text -noout | grep "Signature Algorithm"
# 出现两次：一次在证书数据中（声明用的算法），一次在签名值处（实际签名）
\`\`\`

### 3.4 Issuer（签发者）

签发这张证书的 CA 的信息。是一个 **DN（Distinguished Name，可分辨名称）**，包含多个字段：

- **CN（Common Name）**：CA 的名称
- **O（Organization）**：CA 所属组织
- **OU（Organizational Unit）**：组织单元
- **C（Country）**：国家代码
- **ST/L（State/Locality）**：州/城市

\`\`\`bash
# 查看签发者
openssl x509 -in cert.pem -issuer -noout
# 输出：issuer=CN = DigiCert TLS Hybrid ECC SHA384 2020 CA 1, O = DigiCert Inc, C = US
\`\`\`

### 3.5 Validity（有效期）

证书的有效时间范围，包含两个字段：

- **Not Before**：生效时间，此之前证书无效
- **Not After**：失效时间，此之后证书无效

浏览器验证证书时会检查当前时间是否在有效期内。证书过期后必须续签。

\`\`\`bash
# 查看有效期
openssl x509 -in cert.pem -dates -noout
# 输出：
# notBefore=Mar  7 00:00:00 2024 GMT
# notAfter=Mar  7 23:59:59 2025 GMT

# 计算剩余有效天数
# 先取 notAfter 时间，再用 date 计算
not_after=$(openssl x509 -in cert.pem -enddate -noout | cut -d= -f2)
expire_seconds=$(date -d "$not_after" +%s 2>/dev/null || date -jf "%b %d %T %Y %Z" "$not_after" +%s)
now_seconds=$(date +%s)
days_left=$(( (expire_seconds - now_seconds) / 86400 ))
echo "证书剩余有效天数: $days_left"
\`\`\`

现代证书有效期限制：
- 2015 年前：最长 5 年
- 2015-2018：最长 3 年
- 2018-2025：最长 2 年（825 天）
- 2025 年起：最长 398 天（约 13 个月）
- 未来趋势：进一步缩短（苹果/谷歌推动 47 天有效期）

### 3.6 Subject（主体）

证书持有者的信息，也是一个 DN。终端证书的 Subject 通常包含：

- **CN（Common Name）**：曾经是主要域名，现在被 SAN 取代但仍有兼容价值
- **O（Organization）**：组织名（OV/EV 证书才有）
- **OU（Organizational Unit）**：部门
- **C/ST/L**：国家/州/城市
- **emailAddress**：邮箱（少见）

\`\`\`bash
# 查看主体
openssl x509 -in cert.pem -subject -noout
# DV 证书输出：subject=CN = github.com
# OV 证书输出：subject=CN = github.com, O = "GitHub, Inc.", L = San Francisco, ST = California, C = US
\`\`\`

重要：从 2015 年起，浏览器不再使用 CN 字段匹配域名，而是只用 **SAN** 扩展。所以现代证书即使 CN 为空也能正常工作，但为了兼容性通常仍会填写。

### 3.7 Subject Public Key Info（主体公钥信息）

证书持有者的公钥及其算法。包含：

- **算法标识**：如 rsaEncryption / id-ecPublicKey / id-ed25519
- **公钥本身**：编码后的公钥数据

\`\`\`bash
# 查看公钥
openssl x509 -in cert.pem -text -noout | grep -A 4 "Public Key"
# RSA 证书输出：
# Public Key Algorithm: rsaEncryption
#     RSA Public-Key: (2048 bit)
#     Modulus: 00:b3:a1:...（2048 位模数）
#     Exponent: 65537 (0x10001)（公钥指数）

# 单独提取公钥到文件
openssl x509 -in cert.pem -pubkey -noout > pubkey.pem
# 查看提取出的公钥
openssl rsa -pubin -in pubkey.pem -text -noout
\`\`\`

常见公钥类型：
- **RSA 2048**：最普遍，兼容性最好
- **RSA 4096**：更安全但更慢
- **ECDSA P-256**：现代推荐，体积小速度快
- **Ed25519**：最新，性能和安全性都最优

### 3.8 Extensions（扩展）

v3 证书最重要的部分。扩展允许证书携带额外信息，每个扩展可标记为 **critical**（关键）或 **non-critical**。如果 critical 扩展无法识别，验证必须失败。

最重要的几个扩展：

#### 3.8.1 Subject Alternative Name（SAN）

\`\`\`bash
# 查看 SAN
openssl x509 -in cert.pem -ext subjectAltName -noout
# 输出：
# X509v3 Subject Alternative Name:
#     DNS:github.com, DNS:www.github.com, DNS:*.github.com, DNS:*.githubusercontent.com
\`\`\`

SAN 是现代证书最重要的扩展。它列出证书覆盖的所有域名/IP。浏览器只看 SAN，不看 CN。SAN 可以包含：
- **DNS**：域名
- **IP**：IP 地址
- **email**：邮箱
- **URI**：统一资源标识符

#### 3.8.2 Key Usage（密钥用法）

限制证书中公钥的用途。

\`\`\`bash
# 查看 Key Usage
openssl x509 -in cert.pem -ext keyUsage -noout
\`\`\`

可选值：
- **Digital Signature**：数字签名（如 SSL/TLS 握手签名）
- **Non Repudiation**：不可否认（用于电子合同）
- **Key Encipherment**：密钥加密（如 RSA 交换密钥）
- **Data Encipherment**：数据加密（少见）
- **Key Agreement**：密钥协商（如 DH/ECDH）
- **Key Cert Sign**：签发证书（只有 CA 证书才有）
- **CRL Sign**：签 CRL（只有 CA 才有）
- **Encipher Only / Decipher Only**：仅加密/仅解密

#### 3.8.3 Extended Key Usage（扩展密钥用法）

更细粒度的用途限制。

\`\`\`bash
# 查看 EKU
openssl x509 -in cert.pem -ext extendedKeyUsage -noout
\`\`\`

常见值：
- **serverAuth**：服务器认证（HTTPS 服务器证书必须有）
- **clientAuth**：客户端认证（双向 TLS 时客户端证书需要）
- **codeSigning**：代码签名
- **emailProtection**：邮件保护（S/MIME）
- **timeStamping**：时间戳

#### 3.8.4 Basic Constraints（基本约束）

\`\`\`bash
# 查看 Basic Constraints
openssl x509 -in cert.pem -ext basicConstraints -noout
# CA 证书输出：
# X509v3 Basic Constraints: critical
#     CA:TRUE, pathlen:0
# 终端证书输出：
# X509v3 Basic Constraints: critical
#     CA:FALSE
\`\`\`

- **CA:TRUE**：这是一张 CA 证书，可以签发其他证书
- **CA:FALSE**：这是终端证书，不能签发
- **pathlen**：CA 能签发的证书链深度。pathlen:0 表示只能签终端证书，不能再签下级 CA；pathlen:1 表示可签一级中间 CA

#### 3.8.5 CRL Distribution Points（CRL 分发点）

\`\`\`bash
# 查看 CRL 分发点
openssl x509 -in cert.pem -ext crlDistributionPoints -noout
# 输出：
# Full Name:
#   URI:http://crl3.digicert.com/sha2-hybrid-g6.crl
\`\`\`

告诉客户端去哪里下载 CRL（吊销列表）。

#### 3.8.6 Authority Information Access（AIA）

\`\`\`bash
# 查看 AIA
openssl x509 -in cert.pem -ext authorityInfoAccess -noout
# 输出：
# CA Issuers - URI:http://cacerts.digicert.com/DigiCertTLSHybridECCSHA3842020CA1-1.crt
# OCSP - URI:http://ocsp.digicert.com
\`\`\`

包含两类信息：
- **CA Issuers**：签发此证书的 CA 证书下载地址（补全证书链用）
- **OCSP**：OCSP 查询地址（在线查询证书是否吊销）

### 3.9 Signature Value（签名值）

CA 用自己的私钥对证书前面所有字段（Version 到 Extensions）的 DER 编码做哈希+签名后的结果。验证证书时，用 CA 的公钥验证这个签名。

\`\`\`bash
# 查看签名值（十六进制）
openssl x509 -in cert.pem -text -noout | grep -A 20 "Signature Algorithm" | tail -20
\`\`\`

## 四、Demo 1：openssl 查看证书所有字段

\`\`\`bash
# 准备一张证书（从网站下载）
echo | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null | openssl x509 > github.crt

# 查看完整证书信息
openssl x509 -in github.crt -text -noout

# 输出包含所有字段，是最全面的查看方式
# -text 以人类可读格式输出
# -noout 不输出原始 PEM 编码
\`\`\`

完整输出示例（带注释）：

\`\`\`text
Certificate:
    Data:                                    # 证书数据部分（被签名的部分）
        Version: 3 (0x2)                     # 版本 v3
        Serial Number:                       # 序列号
            0e:9c:4c:5a:xx:xx:xx:xx
        Signature Algorithm: sha256WithRSAEncryption  # 签名算法
        Issuer: DigiCert Inc                 # 签发者
        Validity                             # 有效期
            Not Before: Mar  7 00:00:00 2024 GMT
            Not After : Mar  7 23:59:59 2025 GMT
        Subject: CN=github.com              # 主体
        Subject Public Key Info:            # 公钥信息
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus: ...
                Exponent: 65537 (0x10001)
        X509v3 extensions:                  # 扩展
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Subject Alternative Name:
                DNS:github.com, DNS:www.github.com
            X509v3 CRL Distribution Points:
                Full Name: URI:http://crl3.digicert.com/...
            Authority Information Access:
                CA Issuers - URI:http://cacerts.digicert.com/...
                OCSP - URI:http://ocsp.digicert.com
    Signature Algorithm: sha256WithRSAEncryption  # 签名值
         a1:b2:c3:...
\`\`\`

## 五、Demo 2：提取证书单个字段

\`\`\`bash
# 1. 提取主体 Subject
openssl x509 -in github.crt -subject -noout
# 输出：subject=CN = github.com, O = "GitHub, Inc.", L = San Francisco, ST = California, C = US

# 2. 提取签发者 Issuer
openssl x509 -in github.crt -issuer -noout
# 输出：issuer=CN = DigiCert TLS Hybrid ECC SHA384 2020 CA 1, O = DigiCert Inc

# 3. 提取有效期
openssl x509 -in github.crt -dates -noout
# 输出两行：notBefore 和 notAfter

# 4. 提取序列号
openssl x509 -in github.crt -serial -noout
# 输出：serial=0E9C4C5A...

# 5. 提取指纹（SHA-1）
openssl x509 -in github.crt -fingerprint -noout
# 输出：SHA1 Fingerprint=AB:CD:EF:...

# 6. 提取指纹（SHA-256）
openssl x509 -in github.crt -fingerprint -sha256 -noout
# 输出：SHA256 Fingerprint=AB:CD:EF:...

# 7. 提取公钥
openssl x509 -in github.crt -pubkey -noout > pubkey.pem
# 查看公钥详情
openssl rsa -pubin -in pubkey.pem -text -noout

# 8. 提取签名算法
openssl x509 -in github.crt -text -noout | grep "Signature Algorithm" | head -1

# 9. 提取整个证书为 DER 二进制
openssl x509 -in github.crt -outform DER -out github.der
\`\`\`

## 六、Demo 3：SAN 扩展详解

SAN 是现代证书最重要的扩展。2015 年后浏览器只看 SAN 不看 CN。

\`\`\`bash
# 查看 SAN 扩展
openssl x509 -in github.crt -ext subjectAltName -noout
# 输出：
# X509v3 Subject Alternative Name:
#     DNS:github.com, DNS:www.github.com, DNS:*.github.com,
#     DNS:*.github.io, DNS:*.githubusercontent.com, ...

# SAN 可以包含多种类型的标识：
# DNS:example.com          → 域名
# IP:192.168.1.1           → IP 地址
# email:user@example.com   → 邮箱
# URI:https://example.com  → URI

# 查看 SAN 的原始 ASN.1 结构
openssl asn1parse -in github.crt | grep -A 2 "subjectAltName"
\`\`\`

用 Python 提取 SAN：

\`\`\`python
# 用 Python 的 cryptography 库解析证书的 SAN
from cryptography import x509
from cryptography.hazmat.backends import default_backend

# 读取证书文件
with open("github.crt", "rb") as f:
    cert = x509.load_pem_x509_certificate(f.read(), default_backend())

# 尝试获取 SAN 扩展
try:
    san_ext = cert.extensions.get_extension_for_class(x509.SubjectAlternativeName)
    # 获取所有 DNS 名称
    dns_names = san_ext.value.get_values_for_type(x509.DNSName)
    print("证书覆盖的域名：")
    for name in dns_names:
        print(f"  - {name}")

    # 获取所有 IP 地址
    ip_addrs = san_ext.value.get_values_for_type(x509.IPAddress)
    for ip in ip_addrs:
        print(f"  - IP: {ip}")
except x509.ExtensionNotFound:
    print("该证书没有 SAN 扩展")
\`\`\`

## 七、Demo 4：Key Usage 扩展

Key Usage 限制证书的用途，防止误用。

\`\`\`bash
# 查看 Key Usage
openssl x509 -in github.crt -ext keyUsage -noout
# 输出：
# X509v3 Key Usage: critical
#     Digital Signature, Key Encipherment

# 查看 Extended Key Usage
openssl x509 -in github.crt -ext extendedKeyUsage -noout
# 输出：
# X509v3 Extended Key Usage:
#     TLS Web Server Authentication
\`\`\`

不同用途的证书 Key Usage 不同：

\`\`\`text
HTTPS 服务器证书：
  Key Usage: Digital Signature, Key Encipherment
  Extended Key Usage: TLS Web Server Authentication (serverAuth)

HTTPS 客户端证书（双向认证）：
  Key Usage: Digital Signature
  Extended Key Usage: TLS Web Client Authentication (clientAuth)

CA 证书：
  Key Usage: Certificate Sign, CRL Sign
  （没有 Extended Key Usage，因为 CA 不用于端到端认证）

代码签名证书：
  Key Usage: Digital Signature
  Extended Key Usage: Code Signing (codeSigning)

邮件证书（S/MIME）：
  Key Usage: Digital Signature, Non Repudiation, Key Encipherment
  Extended Key Usage: Email Protection (emailProtection)
\`\`\`

## 八、Demo 5：Basic Constraints

Basic Constraints 区分 CA 证书和终端证书。

\`\`\`bash
# 查看终端证书的 Basic Constraints
openssl x509 -in github.crt -ext basicConstraints -noout
# 输出：
# X509v3 Basic Constraints: critical
#     CA:FALSE
# CA:FALSE 表示这是终端证书，不能用来签发其他证书

# 查看一张 CA 证书的 Basic Constraints（以中间 CA 为例）
# 先从网站证书链中提取中间 CA 证书
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | awk '/BEGIN CERT/{n++} n==2{print}' > intermediate.crt
openssl x509 -in intermediate.crt -ext basicConstraints -noout
# 输出：
# X509v3 Basic Constraints: critical
#     CA:TRUE, pathlen:0
# CA:TRUE 表示这是 CA 证书
# pathlen:0 表示这个 CA 只能签终端证书，不能再签下级 CA
\`\`\`

pathlen 的含义：

\`\`\`text
pathlen: 无限制    → 根 CA，可以签任意层级的中间 CA
pathlen: 2         → 可以签 1 层中间 CA，再签终端证书（共 3 层）
pathlen: 1         → 可以签 1 层中间 CA，再签终端证书
pathlen: 0         → 只能签终端证书，不能再签 CA

证书链深度计算（从终端证书到根 CA 不算根）：
终端证书(0) → 中间CA(pathlen:0) → 根CA
  这条链长度 1，pathlen:0 的中间 CA 刚好满足
\`\`\`

## 九、Demo 6：Python cryptography 解析证书

用 Python 的 cryptography 库编程解析证书，适合自动化场景。

\`\`\`python
# 需要先安装：pip install cryptography
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
import datetime

# ---------- 1. 加载证书 ----------
# 支持 PEM 和 DER 两种格式
with open("github.crt", "rb") as f:
    cert_data = f.read()

# 加载 PEM 格式证书
cert = x509.load_pem_x509_certificate(cert_data, default_backend())

# 如果是 DER 格式：
# cert = x509.load_der_x509_certificate(cert_data, default_backend())

# ---------- 2. 查看基本信息 ----------
print("=" * 50)
print("证书基本信息")
print("=" * 50)

# 主体
print(f"Subject: {cert.subject}")
# 签发者
print(f"Issuer: {cert.issuer}")

# CN（Common Name）单独提取
cn_attrs = cert.subject.get_attributes_for_oid(x509.NameOID.COMMON_NAME)
if cn_attrs:
    print(f"CN: {cn_attrs[0].value}")

# 有效期
print(f"生效时间: {cert.not_valid_before}")
print(f"失效时间: {cert.not_valid_after}")

# 检查是否过期
now = datetime.datetime.utcnow()
if now > cert.not_valid_after:
    print("状态: 已过期")
elif now < cert.not_valid_before:
    print("状态: 尚未生效")
else:
    remaining = cert.not_valid_after - now
    print(f"状态: 有效，剩余 {remaining.days} 天")

# 序列号
print(f"序列号: {cert.serial_number}")

# 签名算法
print(f"签名算法: {cert.signature_algorithm_oid._name}")

# 公钥信息
public_key = cert.public_key()
print(f"公钥类型: {type(public_key).__name__}")

# ---------- 3. 查看扩展 ----------
print("\\n" + "=" * 50)
print("证书扩展")
print("=" * 50)

for ext in cert.extensions:
    print(f"扩展名: {ext.oid._name}")
    print(f"  是否关键(critical): {ext.critical}")
    print(f"  值: {ext.value}")
    print()

# ---------- 4. 单独提取常用扩展 ----------
# SAN
try:
    san = cert.extensions.get_extension_for_class(x509.SubjectAlternativeName)
    dns_names = san.value.get_values_for_type(x509.DNSName)
    print(f"证书覆盖域名(SAN): {dns_names}")
except x509.ExtensionNotFound:
    print("无 SAN 扩展")

# Basic Constraints
try:
    bc = cert.extensions.get_extension_for_class(x509.BasicConstraints)
    print(f"是否 CA 证书: {bc.value.ca}")
    print(f"pathlen: {bc.value.path_length}")
except x509.ExtensionNotFound:
    print("无 Basic Constraints 扩展")

# Key Usage
try:
    ku = cert.extensions.get_extension_for_class(x509.KeyUsage)
    print(f"数字签名: {ku.value.digital_signature}")
    print(f"密钥加密: {ku.value.key_encipherment}")
    print(f"证书签名: {ku.value.key_cert_sign}")
except x509.ExtensionNotFound:
    print("无 Key Usage 扩展")

# ---------- 5. 计算证书指纹 ----------
# SHA-256 指纹
fingerprint = cert.fingerprint(hashes.SHA256())
print(f"\\nSHA-256 指纹: {fingerprint.hex()}")

# ---------- 6. 导出证书为不同格式 ----------
# 导出 DER
der_data = cert.public_bytes(encoding=x509.Encoding.DER)
# 导出 PEM
pem_data = cert.public_bytes(encoding=x509.Encoding.PEM)
print(f"\\nDER 长度: {len(der_data)} 字节")
print(f"PEM 长度: {len(pem_data)} 字节")
\`\`\`

## 十、X.509 字段速查表

| 字段 | 说明 | 示例 | 是否必填 |
|------|------|------|---------|
| Version | 版本号 | v3 | 是 |
| Serial Number | 序列号 | 0E9C4C5A... | 是 |
| Signature Algorithm | 签名算法 | sha256WithRSA | 是 |
| Issuer | 签发者 DN | CN=DigiCert... | 是 |
| Validity | 有效期 | 2024-03-07 ~ 2025-03-07 | 是 |
| Subject | 主体 DN | CN=github.com | 是（可为空，靠 SAN） |
| Subject Public Key Info | 公钥信息 | RSA 2048 | 是 |
| Subject Alternative Name | 备用名称 | DNS:github.com | 现代必填 |
| Key Usage | 密钥用法 | Digital Signature | 推荐 |
| Extended Key Usage | 扩展密钥用法 | serverAuth | 推荐 |
| Basic Constraints | 基本约束 | CA:FALSE | CA 证书必填 |
| CRL Distribution Points | CRL 地址 | URI:http://... | 推荐 |
| Authority Info Access | AIA | CA Issuers + OCSP | 推荐 |
| Signature Value | 签名值 | 十六进制 | 是 |

## 十一、本章小结

| 知识点 | 核心内容 |
|--------|---------|
| X.509 标准 | ITU-T 制定的数字证书格式标准，RFC 5280 |
| 证书版本 | v1/v2/v3，现代全用 v3（支持扩展） |
| 编码格式 | DER（二进制）/ PEM（Base64 文本） |
| 基本字段 | 版本/序列号/签名算法/签发者/有效期/主体/公钥/签名 |
| SAN 扩展 | 现代证书最重要的扩展，浏览器只看 SAN |
| Key Usage | 限制证书用途，防止误用 |
| Basic Constraints | 区分 CA 证书和终端证书 |
| AIA | CA 证书下载地址 + OCSP 查询地址 |
| Python 解析 | cryptography 库可编程解析所有字段 |
`
  },

  // ============================================================
  // 第三章：CA 与信任链
  // ============================================================
  {
    id: "hs-ca-chain",
    group: "数字证书与 PKI",
    icon: "🔗",
    title: "CA 与信任链",
    content: `# CA 与信任链

## 一、CA（Certificate Authority）简介

**CA（认证机构）** 是 PKI 体系的核心角色，负责签发数字证书。CA 的本质是一个**被广泛信任的第三方**——它用自己的私钥给网站公钥签名，从而让全世界都相信"这个公钥确实属于这个网站"。

生活类比：**CA 就像公安局**。你声称自己是张三没人信，但公安局发的身份证上写着张三，大家就信了。公安局的权威来自国家的背书，CA 的权威来自浏览器/操作系统厂商的认可（预装根证书）。

CA 的核心职责：
1. **审核身份**：验证申请者是否真的是域名/组织的拥有者
2. **签发证书**：用 CA 私钥对"身份+公钥"签名
3. **维护吊销信息**：发布 CRL、响应 OCSP 查询
4. **保护私钥**：CA 私钥一旦泄露，整个信任体系崩塌

CA 的私钥是整个互联网信任体系的根基。CA 私钥通常保存在**离线的硬件安全模块（HSM）** 中，放在物理隔离的机房，多重门禁 + 视频监控 + 多人共管。

## 二、根 CA / 中间 CA / 终端证书的三级结构

实际的 PKI 不是单个 CA 直接给所有网站签证书，而是采用 **三级（甚至更多级）树状结构**。

\`\`\`text
                    ┌──────────────┐
                    │    根 CA      │   ← 离线保管，极少使用
                    │  Root CA     │   ← 自签名证书，预装在系统里
                    │  (自签名)     │
                    └──────┬───────┘
                           │ 用根 CA 私钥签名
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──────┐ ┌──┴──────┐ ┌──┴──────┐
       │  中间 CA 1   │ │ 中间CA 2 │ │ 中间CA 3 │  ← 在线工作，签发终端证书
       │ Intermediate│ │         │ │         │
       └──────┬──────┘ └────┬────┘ └────┬────┘
              │             │           │
       ┌──────┴──────┐      │      ┌────┴────┐
       │ 终端证书     │  ... │      │ 终端证书 │  ← 网站实际使用的证书
       │ github.com  │      │      │ google  │
       └─────────────┘      │      └─────────┘
\`\`\`

### 2.1 根 CA（Root CA）

根 CA 是信任链的起点。根证书是**自签名**的——根 CA 用自己的私钥给自己的证书签名。根证书不依赖任何其他 CA，它的信任来自**浏览器/操作系统预装**。

\`\`\`bash
# 查看一张根 CA 证书（以 DigiCert Global Root CA 为例）
# 根 CA 证书的特征：Issuer 和 Subject 相同（自签名）
openssl x509 -in /etc/ssl/certs/DigiCert_Global_Root_CA.pem -text -noout | grep -E "Issuer:|Subject:|CA:"
# 输出：
# Issuer: CN=DigiCert Global Root CA, O=DigiCert Inc, OU=www.digicert.com, C=US
# Subject: CN=DigiCert Global Root CA, O=DigiCert Inc, OU=www.digicert.com, C=US
# CA:TRUE                    # 是 CA 证书
\`\`\`

根 CA 证书的特点：
- **自签名**（Issuer = Subject）
- **CA:TRUE**，且通常 pathlen 无限制
- **有效期很长**（20-30 年），因为更换根证书极其麻烦
- **私钥离线保管**，只在签发中间 CA 时才上线

### 2.2 中间 CA（Intermediate CA）

中间 CA 由根 CA 签发，负责签发大量的终端证书。为什么不让根 CA 直接签终端证书？原因如下：

1. **保护根 CA 私钥**：根 CA 私钥一旦泄露，它签发的所有证书都要作废，影响面极大。所以根 CA 私钥离线保管，只在签发中间 CA 时短暂上线。日常签发由中间 CA 完成，即使中间 CA 私钥泄露，只需吊销这一个中间 CA，不影响根 CA。

2. **职责分离**：根 CA 只做少量高价值操作（签中间 CA），中间 CA 做大量日常签发。不同中间 CA 还可以按地区/业务线划分。

3. **便于轮换**：中间 CA 证书有效期较短（5-10 年），可以定期更换密钥和算法，而根 CA 保持稳定。

\`\`\`bash
# 查看一张中间 CA 证书
# 特征：Issuer 是根 CA，Subject 是中间 CA，CA:TRUE
openssl x509 -in intermediate.crt -text -noout | grep -E "Issuer:|Subject:|CA:|pathlen"
# 输出：
# Issuer: CN=DigiCert Global Root CA, ...        # 签发者是根 CA
# Subject: CN=DigiCert TLS Hybrid ECC SHA384...  # 主体是中间 CA
# CA:TRUE, pathlen:0                              # 是 CA，但只能签终端证书
\`\`\`

### 2.3 终端证书（End-entity Certificate）

终端证书是网站实际部署的证书，由中间 CA 签发，\`CA:FALSE\`，不能再签发其他证书。

\`\`\`bash
# 查看终端证书
openssl x509 -in github.crt -text -noout | grep -E "Issuer:|Subject:|CA:"
# 输出：
# Issuer: CN=DigiCert TLS Hybrid ECC SHA384...   # 签发者是中间 CA
# Subject: CN=github.com                         # 主体是网站
# CA:FALSE                                        # 不是 CA，是终端证书
\`\`\`

## 三、为什么不直接用根 CA 签终端证书

\`\`\`text
方案 A：根 CA 直接签所有终端证书
  优点：证书链短，只有两层
  缺点：根 CA 私钥要经常使用（在线签发），泄露风险极高
        一旦泄露，全球所有用它签的证书都要作废

方案 B：根 CA 签中间 CA，中间 CA 签终端证书（实际采用）
  优点：根 CA 私钥离线保管，几乎不使用，泄露风险极低
        中间 CA 私钥泄露只需吊销中间 CA，根 CA 不受影响
        可以设置多个中间 CA 分散风险
  缺点：证书链多一层，握手时要多发一张中间证书
        信任链验证稍复杂

结论：安全考虑压倒一切，所以采用三级结构
\`\`\`

## 四、信任链验证过程

浏览器验证网站证书时，要验证完整的信任链。

\`\`\`text
验证方向：从终端证书往根 CA 验证

步骤 1：收到终端证书（github.com）
        ↓
步骤 2：终端证书的 Issuer 是中间 CA，需要中间 CA 证书来验证签名
        服务器在握手时通常会一起发送中间证书
        ↓
步骤 3：用中间 CA 的公钥验证终端证书的签名 → 验证通过
        ↓
步骤 4：中间 CA 证书的 Issuer 是根 CA
        查系统信任库，找到对应的根 CA 证书
        ↓
步骤 5：用根 CA 的公钥验证中间 CA 证书的签名 → 验证通过
        ↓
步骤 6：根 CA 证书在系统信任库里 → 信任链建立完成
        ↓
步骤 7：额外检查（有效期、域名匹配 SAN、吊销状态、用途等）

\`\`\`

任何一步失败都会导致证书验证失败，浏览器显示"不安全"警告。

## 五、浏览器/操作系统的信任库（Root Store）

根 CA 证书不是凭空被信任的，而是被**预装**在浏览器或操作系统中的**信任库（Root Store）**里。

\`\`\`text
主流信任库：
┌────────────────────┬────────────────────────────────┐
│ 信任库              │ 维护者                          │
├────────────────────┼────────────────────────────────┤
│ Mozilla NSS         │ Mozilla（Firefox 及很多软件）   │
│ Apple Root Program  │ Apple（macOS/iOS/Safari）      │
│ Microsoft Root CA   │ Microsoft（Windows/Edge）       │
│ Google Root Store   │ Google（Chrome/Android）       │
│ Oracle Java CAStore │ Oracle（Java 应用）             │
└────────────────────┴────────────────────────────────┘

每个信任库都有自己的 CA 准入标准（审计要求、技术要求、保险等）。
一张根 CA 要被全世界信任，需要同时进入所有主流信任库。
\`\`\`

CA 被移出信任库的影响是灾难性的：它签发的所有证书立刻不被信任。2017 年沃通（WoSign）和 StartCom 因违规操作被 Mozilla/苹果/谷歌从信任库移除，导致它们签发的证书全部失效。

## 六、Demo 1：查看网站的完整证书链

\`\`\`bash
# 查看网站完整的证书链（终端证书 + 中间证书）
# -showcerts 选项会输出服务器发送的所有证书
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | grep -E "BEGIN CERT|END CERT|s:|i:"

# 输出会看到多个证书块，每个证书前面有 s:（subject）和 i:（issuer）
# 0 s:CN = github.com                      ← 第 0 张：终端证书
#   i:CN = DigiCert TLS Hybrid ECC...      ← 由中间 CA 签发
# 1 s:CN = DigiCert TLS Hybrid ECC...      ← 第 1 张：中间 CA 证书
#   i:CN = DigiCert Global Root CA         ← 由根 CA 签发

# 完整查看（含证书内容）
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null
# 会看到多个 "BEGIN CERTIFICATE" 块
# 第一个是终端证书，后面是中间证书
# 根 CA 证书通常不发（因为客户端自带）
\`\`\`

保存证书链中的每张证书：

\`\`\`bash
# 把整个证书链保存到一个文件
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/{print}' > fullchain.pem

# 分别保存终端证书和中间证书
# 第一张是终端证书
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | awk '/BEGIN CERTIFICATE/{n++} n==1{print} /END CERTIFICATE/{if(n==1)exit}' > end_cert.pem
# 第二张是中间证书
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | awk '/BEGIN CERTIFICATE/{n++} n==2{print} /END CERTIFICATE/{if(n==2)exit}' > intermediate.pem
\`\`\`

## 七、Demo 2：验证证书链

\`\`\`bash
# 准备文件：
# end_cert.pem      终端证书
# intermediate.pem  中间 CA 证书
# ca.crt            根 CA 证书（从系统信任库导出）

# 方法 1：用根 CA 验证终端证书，-untrusted 指定中间证书
# openssl verify -CAfile <根CA> -untrusted <中间CA> <终端证书>
openssl verify -CAfile /etc/ssl/certs/DigiCert_Global_Root_CA.pem -untrusted intermediate.pem end_cert.pem
# 输出：end_cert.pem: OK    ← 验证通过

# 方法 2：把根 CA 和中间 CA 合并后验证
cat /etc/ssl/certs/DigiCert_Global_Root_CA.pem intermediate.pem > chain.pem
openssl verify -CAfile chain.pem end_cert.pem
# 输出：end_cert.pem: OK

# 方法 3：用 openssl verify 的 -verbose 选项看详细过程
openssl verify -verbose -CAfile chain.pem end_cert.pem

# 如果验证失败，输出类似：
# end_cert.pem: CN = github.com
# error 20 at 0 depth lookup: unable to get local issuer certificate
# 这表示找不到签发者证书（中间证书未提供）
\`\`\`

常见验证错误：

\`\`\`text
error 20: unable to get local issuer certificate
  → 找不到签发者证书，中间证书没提供

error 24: invalid CA certificate
  → 中间证书不是 CA 证书（Basic Constraints 的 CA:TRUE 缺失）

error 10: certificate has expired
  → 证书已过期

error 26: unsupported certificate purpose
  → 证书用途不匹配（如用 client 证书做 server 认证）
\`\`\`

## 八、Demo 3：查看系统信任的根 CA

\`\`\`bash
# ---------- Linux（Ubuntu/Debian）----------
# 根 CA 证书存放目录
ls /etc/ssl/certs/ | head -20
# 里面有上百个根 CA 证书文件

# 查看信任的根 CA 数量
ls /etc/ssl/certs/ | wc -l

# 更新系统 CA 信任库（Ubuntu/Debian）
sudo update-ca-certificates
# 添加自定义 CA：把 .crt 文件放到 /usr/local/share/ca-certificates/ 再执行

# ---------- Linux（CentOS/RHEL）----------
ls /etc/pki/ca-trust/source/anchors/
sudo update-ca-trust

# ---------- macOS ----------
# 系统钥匙串中的信任根 CA
security find-certificate -a /Library/Keychains/System.keychain | head -50
# 或打开"钥匙串访问"App → 系统根 → 证书

# 查看某个根 CA 的详情
security find-certificate -c "DigiCert Global Root CA" -p /Library/Keychains/System.keychain > root_ca.pem
openssl x509 -in root_ca.pem -text -noout

# ---------- 浏览器 ----------
# Firefox 有自己独立的信任库（不使用系统信任库）
# 地址栏输入 about:preferences#privacy → 滚到底部 → 查看证书
\`\`\`

## 九、Demo 4：Python 验证证书链

用 Python 手动实现证书链验证，理解浏览器内部做的事。

\`\`\`python
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import padding, ec, rsa
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature
import datetime

def load_cert(path):
    """加载 PEM 格式证书"""
    with open(path, "rb") as f:
        return x509.load_pem_x509_certificate(f.read(), default_backend())

def verify_signature(cert, issuer_cert):
    """用 issuer 的公钥验证 cert 的签名"""
    # 获取 issuer 的公钥
    issuer_pubkey = issuer_cert.public_key()

    # 获取 cert 的签名值和算法
    signature = cert.signature
    algorithm = cert.signature_hash_algorithm

    # 获取 cert 的 DER 编码（被签名的部分）
    tbs_bytes = cert.tbs_certificate_bytes

    # 根据公钥类型选择验证方式
    try:
        if isinstance(issuer_pubkey, rsa.RSAPublicKey):
            # RSA 验签
            issuer_pubkey.verify(
                signature,
                tbs_bytes,
                padding.PKCS1v15(),
                algorithm
            )
        elif isinstance(issuer_pubkey, ec.EllipticCurvePublicKey):
            # ECDSA 验签
            issuer_pubkey.verify(
                signature,
                tbs_bytes,
                ec.ECDSA(algorithm)
            )
        return True
    except InvalidSignature:
        return False

def check_validity(cert):
    """检查证书有效期"""
    now = datetime.datetime.utcnow()
    if now < cert.not_valid_before:
        return False, "证书尚未生效"
    if now > cert.not_valid_after:
        return False, "证书已过期"
    return True, "有效期内"

def check_basic_constraints(cert):
    """检查 Basic Constraints"""
    try:
        bc = cert.extensions.get_extension_for_class(x509.BasicConstraints)
        return bc.value.ca
    except x509.ExtensionNotFound:
        return False

def verify_chain(end_cert, intermediates, root_certs):
    """
    验证证书链
    end_cert: 终端证书
    intermediates: 中间 CA 证书列表
    root_certs: 根 CA 证书列表（受信任的）
    """
    print("开始验证证书链...")
    print(f"终端证书: {end_cert.subject}")
    print()

    # 1. 检查终端证书有效期
    valid, msg = check_validity(end_cert)
    print(f"终端证书有效期检查: {msg}")
    if not valid:
        return False

    # 2. 构建证书链：从终端证书往上找签发者
    chain = [end_cert]
    current = end_cert

    while True:
        # 在中间 CA 中找签发者
        issuer = None
        for inter in intermediates:
            if inter.subject == current.issuer:
                issuer = inter
                break

        # 如果中间 CA 里没找到，在根 CA 里找
        if issuer is None:
            for root in root_certs:
                if root.subject == current.issuer:
                    issuer = root
                    break

        if issuer is None:
            print(f"错误: 找不到 {current.subject} 的签发者 {current.issuer}")
            return False

        # 验证签名
        if not verify_signature(current, issuer):
            print(f"错误: {current.subject} 的签名验证失败")
            return False
        print(f"签名验证: {current.subject} ← {issuer.subject} OK")

        # 如果 issuer 是根 CA（自签名），结束
        if issuer.subject == issuer.issuer:
            print(f"到达根 CA: {issuer.subject}")
            break

        chain.append(issuer)
        current = issuer

    print(f"\\n证书链验证通过！共 {len(chain)} 张证书")
    return True

# ---------- 使用示例 ----------
# end_cert = load_cert("end_cert.pem")
# intermediate = load_cert("intermediate.pem")
# root_ca = load_cert("root_ca.pem")
# verify_chain(end_cert, [intermediate], [root_ca])
\`\`\`

## 十、Demo 5：交叉证书（Cross-Certification）

**交叉证书**是指一个 CA 被多个根 CA 签名，从而被多个信任库信任。

\`\`\`text
场景：某国 CA 想被全球信任，但该国根 CA 只在本国信任库里
方案：让一个国际根 CA（如 DigiCert）给该国 CA 签一张证书
      这样该国 CA 既能被本国根信任，也能被 DigiCert 根信任

       ┌─────────────┐
       │  本国根 CA   │ ──→ 签 ──→ ┌──────────┐
       └─────────────┘              │  某 CA   │ ──→ 签终端证书
       ┌─────────────┐              │          │
       │ DigiCert根CA│ ──→ 签 ──→ └──────────┘
       └─────────────┘    （交叉证书）

浏览器验证时可以走任一条路径到达受信任的根
\`\`\`

生成交叉证书示例：

\`\`\`bash
# 假设已有 CA A 的根证书 ca_a.crt 和私钥 ca_a.key
# 已有 CA B 的 CSR ca_b.csr
# CA A 签发 CA B 的证书（交叉签名）
openssl x509 -req -in ca_b.csr -CA ca_a.crt -CAkey ca_a.key -CAcreateserial -out ca_b_cross.crt -days 3650 -extfile <(echo "basicConstraints=critical,CA:TRUE") -days 3650

# 现在 ca_b 有两张证书：
# 1. 自己的自签名根证书 ca_b_self.crt
# 2. 被 CA A 签名的交叉证书 ca_b_cross.crt
# 浏览器可以通过 ca_b_self.crt（如果信任 ca_b）或 ca_b_cross.crt（如果信任 ca_a）验证
\`\`\`

## 十一、Demo 6：信任链断裂的常见原因

证书链问题是 HTTPS 部署中最常见的错误。

### 11.1 中间证书未发送

\`\`\`bash
# 服务器只发了终端证书，没发中间证书
# 浏览器找不到中间 CA，无法验证到根 CA
# 错误信息：unable to get local issuer certificate

# 检查：用 openssl 看服务器发了几张证书
echo | openssl s_client -connect example.com:443 -showcerts 2>/dev/null | grep -c "BEGIN CERTIFICATE"
# 如果只输出 1，说明只发了终端证书

# 解决：把终端证书和中间证书合并为 fullchain
cat end_cert.pem intermediate.pem > fullchain.pem
# Nginx 配置使用 fullchain
# ssl_certificate /path/to/fullchain.pem;
\`\`\`

### 11.2 中间证书过期

\`\`\`bash
# 中间 CA 证书过期了，即使终端证书没过期也无法验证
# 错误信息：certificate has expired

# 检查中间证书有效期
openssl x509 -in intermediate.pem -dates -noout
# 如果 notAfter 已过当前日期，需要联系 CA 更新中间证书

# 经典案例：2021 年 Let's Encrypt 的 R3 中间证书过期
# 影响了大量使用旧中间证书的网站
\`\`\`

### 11.3 证书链顺序错误

\`\`\`bash
# fullchain.pem 中证书顺序必须是：终端证书在前，中间证书在后
# 如果顺序反了，某些客户端会验证失败

# 正确顺序：
# 1. 终端证书（github.com）
# 2. 中间证书
# 3. （可选）更上层中间证书
# 注意：不需要包含根证书（客户端自带）

# 检查顺序
echo | openssl s_client -connect example.com:443 -showcerts 2>/dev/null | grep "s:"
# 第一个 s: 应该是网站域名，后面是 CA 名称
\`\`\`

### 11.4 根证书不在信任库

\`\`\`bash
# 自签名的根 CA 没有加入系统信任库
# 解决（Linux）：
sudo cp my_ca.crt /usr/local/share/ca-certificates/my_ca.crt
sudo update-ca-certificates

# 解决（macOS）：
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain my_ca.crt

# 解决（Firefox 独立信任库）：
# 首选项 → 隐私与安全 → 证书 → 查看证书 → 导入
\`\`\`

### 11.5 完整诊断脚本

\`\`\`bash
# 综合诊断证书链问题
#!/bin/bash
DOMAIN=$1
echo "=== 证书链诊断: $DOMAIN ==="

# 1. 检查发送了几个证书
CERT_COUNT=$(echo | openssl s_client -connect $DOMAIN:443 -showcerts 2>/dev/null | grep -c "BEGIN CERTIFICATE")
echo "服务器发送的证书数量: $CERT_COUNT"
if [ "$CERT_COUNT" -lt 2 ]; then
  echo "警告: 可能缺少中间证书！"
fi

# 2. 检查证书链
echo ""
echo "=== 证书链验证 ==="
echo | openssl s_client -connect $DOMAIN:443 -verify_return_error 2>&1 | grep -E "Verify|verify|error"

# 3. 检查每个证书的有效期
echo ""
echo "=== 各证书有效期 ==="
echo | openssl s_client -connect $DOMAIN:443 -showcerts 2>/dev/null | awk '/BEGIN CERT/{n++} {print > "/tmp/cert_"n".pem"}'
for i in $(seq 1 $CERT_COUNT); do
  if [ -f "/tmp/cert_$i.pem" ]; then
    echo "证书 $i:"
    openssl x509 -in /tmp/cert_$i.pem -subject -noout 2>/dev/null
    openssl x509 -in /tmp/cert_$i.pem -dates -noout 2>/dev/null
    echo ""
  fi
done
rm -f /tmp/cert_*.pem
\`\`\`

## 十二、信任链层级表

| 层级 | 名称 | 特征 | 私钥状态 | 数量 |
|------|------|------|---------|------|
| 第 1 层 | 根 CA | 自签名，CA:TRUE，pathlen 无限 | 离线保管 | 极少（全球约 50-100 家） |
| 第 2 层 | 中间 CA | 被根签，CA:TRUE，pathlen 受限 | 在线工作 | 每家 CA 数个 |
| 第 3 层 | 终端证书 | 被中间签，CA:FALSE | 网站使用 | 全球数千万 |

## 十三、本章小结

| 知识点 | 核心内容 |
|--------|---------|
| CA 的角色 | 可信第三方，用私钥给公钥签名 |
| 三级结构 | 根 CA → 中间 CA → 终端证书 |
| 为什么用中间 CA | 保护根 CA 私钥，职责分离，便于轮换 |
| 信任链验证 | 从终端证书逐级验签到根 CA |
| 信任库 Root Store | 浏览器/OS 预装的根 CA 列表 |
| 交叉证书 | 一个 CA 被多个根信任 |
| 常见链断裂原因 | 中间证书未发送/过期/顺序错/根不在信任库 |
| openssl verify | -CAfile 指定根，-untrusted 指定中间 |
`
  },

  // ============================================================
  // 第四章：证书签发流程
  // ============================================================
  {
    id: "hs-cert-issue",
    group: "数字证书与 PKI",
    icon: "✍️",
    title: "证书签发流程",
    content: `# 证书签发流程

## 一、完整签发流程概述

证书签发是从申请到部署的完整过程，分为五大步骤。

\`\`\`text
┌─────────────────────────────────────────────────────────────────┐
│                    证书签发完整流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 生成私钥                                                    │
│     网站在本地生成一对公私钥（RSA/ECC/Ed25519）                 │
│     私钥妥善保管，绝不外泄                                      │
│                                                                 │
│  2. 生成 CSR                                                    │
│     把公钥 + 身份信息打包成 CSR（证书签名请求）                 │
│     CSR 用私钥自签名，证明你拥有该私钥                          │
│                                                                 │
│  3. 提交 CSR 给 CA                                              │
│     把 CSR 提交给 CA（或 RA）                                   │
│     CA 审核身份（DV/OV/EV 不同程度审核）                        │
│                                                                 │
│  4. CA 签发证书                                                 │
│     CA 用自己的私钥对 CSR 中的公钥+身份签名                     │
│     生成正式的 X.509 证书                                       │
│     返回给申请者                                                │
│                                                                 │
│  5. 部署证书                                                    │
│     把证书 + 私钥部署到 Web 服务器（Nginx/Apache）              │
│     配置完整证书链                                              │
│     重启服务                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

生活类比：证书签发就像办身份证。你（网站）先拍好照片（生成公私钥），然后填写申请表（生成 CSR），把表交给公安局（CA），公安局审核你的身份（DV/OV/EV 审核对应不同级别），审核通过后给你发身份证（签发证书），你把身份证带在身上（部署到服务器）。

## 二、CSR（Certificate Signing Request）详解

**CSR（证书签名请求）** 是申请者向 CA 提交的"申请表"，包含：

\`\`\`text
CSR 内容：
┌──────────────────────────────────┐
│  1. 身份信息（Subject DN）       │
│     CN=example.com, O=MyOrg...   │
│                                  │
│  2. 公钥                         │
│     RSA 2048 / ECC P-256 等      │
│                                  │
│  3. 扩展信息（可选）             │
│     SAN 多域名、Key Usage 等     │
│                                  │
│  4. 申请者私钥的签名             │
│     证明申请者确实拥有对应私钥   │
└──────────────────────────────────┘
\`\`\`

CSR 用申请者的私钥自签名，这样 CA 验证签名后就知道申请者确实拥有对应私钥（防止别人冒用你的公钥申请证书）。

\`\`\`bash
# CSR 文件格式（PEM）
-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMCQ04xCzAJBgNVBAgMAl...
（Base64 编码）
-----END CERTIFICATE REQUEST-----

# 查看 CSR 内容
openssl req -in mydomain.csr -text -noout
\`\`\`

## 三、Demo 1：生成 RSA 私钥和 CSR

\`\`\`bash
# ---------- 1. 生成 RSA 私钥 ----------

# 方法 A：生成 2048 位 RSA 私钥（推荐，兼容性最好）
# -out 指定输出文件
# 2048 是密钥位数
openssl genrsa -out mydomain.key 2048

# 方法 B：生成更安全的 4096 位 RSA 私钥（更安全但更慢）
openssl genrsa -out mydomain.key 4096

# 方法 C：生成加密的私钥（带密码保护，每次使用要输密码）
# -aes256 用 AES-256 加密私钥文件
openssl genrsa -aes256 -out mydomain.key 2048

# 查看私钥内容
openssl rsa -in mydomain.key -text -noout | head -20
# 输出：Private-Key: (2048 bit, 2 primes)
#       modulus: 00:b3:a1:...
#       publicExponent: 65537 (0x10001)
#       privateExponent: ...

# ---------- 2. 生成 CSR ----------

# 方法 A：交互式生成 CSR（会逐项提问）
openssl req -new -key mydomain.key -out mydomain.csr
# 会依次问：
# Country Name (2 letter code): CN
# State or Province Name: Beijing
# Locality Name: Beijing
# Organization Name: MyCompany
# Organizational Unit Name: IT
# Common Name: example.com       ← 最重要，填域名
# Email Address: admin@example.com
# A challenge password:          ← 可留空
# An optional company name:      ← 可留空

# 方法 B：一行命令生成 CSR（用 -subj 直接指定，适合脚本）
# /C=国家 /ST=省 /L=市 /O=组织 /OU=部门 /CN=域名
openssl req -new -key mydomain.key -out mydomain.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/OU=IT/CN=example.com"

# ---------- 3. 查看 CSR ----------
openssl req -in mydomain.csr -text -noout
# 输出包含：
# Certificate Request:
#     Data:
#         Version: 1 (0x0)
#         Subject: C=CN, ST=Beijing, L=Beijing, O=MyOrg, OU=IT, CN=example.com
#         Subject Public Key Info: RSA 2048 位公钥
#     Signature Algorithm: sha256WithRSAEncryption
#         （申请者私钥的签名）

# 验证 CSR 签名（确认 CSR 没被篡改，且私钥匹配）
openssl req -in mydomain.csr -verify -noout
# 输出：Certificate request self-signature verify OK

# ---------- 4. 保护私钥 ----------
# 私钥是命根子，权限要设为 600（只有 owner 可读）
chmod 600 mydomain.key
\`\`\`

## 四、Demo 2：用 ECC 私钥生成 CSR

ECC（椭圆曲线加密）比 RSA 更高效，同等安全性下密钥更短，是现代推荐的选择。

\`\`\`bash
# ---------- 1. 生成 ECC 私钥 ----------

# 方法 A：用 ecparam 生成（指定曲线）
# -name prime256v1 指定曲线（即 P-256/NIST P-256，最常用）
# -genkey 生成私钥
openssl ecparam -name prime256v1 -genkey -out mydomain.key

# 其他常用曲线：
# prime256v1（P-256）：最广泛兼容，推荐
# secp384r1（P-384）：更高安全，较慢
# secp521r1（P-521）：最高安全，兼容性一般

# 方法 B：用 genpkey 生成（更通用的命令）
# -algorithm EC 指定 ECC 算法
# -pkeyopt ec_paramgen_curve:P-256 指定曲线
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out mydomain.key

# 方法 C：生成 Ed25519 私钥（最新，性能最优）
# 注意：Ed25519 兼容性不如 ECC，部分老系统不支持
openssl genpkey -algorithm Ed25519 -out mydomain.key

# 查看 ECC 私钥
openssl ec -in mydomain.key -text -noout
# 输出：
# Private-Key: (256 bit)
# ASN1 OID: prime256v1
# NIST CURVE: P-256

# ---------- 2. 生成 CSR ----------
# ECC 私钥生成 CSR 的命令和 RSA 一样
openssl req -new -key mydomain.key -out mydomain.csr -subj "/CN=example.com/O=MyOrg/C=CN"

# ---------- 3. 查看 CSR ----------
openssl req -in mydomain.csr -text -noout
# 注意公钥部分会显示：
# Public Key Algorithm: id-ecPublicKey
#     Public-Key: (256 bit)
#     ASN1 OID: prime256v1
\`\`\`

RSA vs ECC 对比：

\`\`\`text
算法         密钥长度    等效对称强度    性能    兼容性
RSA-2048     2048 bit    112 bit         较慢    最好
RSA-4096     4096 bit    128 bit         慢      好
ECC P-256    256 bit     128 bit         快      好（现代）
ECC P-384    384 bit     192 bit         中      较好
Ed25519      256 bit     128 bit         最快    一般（新）

结论：新建站点推荐 ECC P-256 或 Ed25519
      兼容老系统选 RSA 2048
\`\`\`

## 五、Demo 3：自建 CA 签发证书（完整流程）

在内网/测试环境，可以自建 CA 来签发证书（不被公网信任，但内网可用）。

\`\`\`bash
# ============================================================
# 完整流程：自建 CA → 签发服务器证书
# ============================================================

# ---------- 第 1 步：创建 CA 私钥和根证书 ----------

# 1.1 生成 CA 私钥（4096 位 RSA，更安全）
openssl genrsa -out ca.key 4096

# 1.2 生成 CA 自签名根证书
# -x509 直接生成自签名证书（而非 CSR）
# -new 生成新的证书请求
# -key 指定私钥
# -days 3650 有效期 10 年（根证书有效期长）
# -out 输出证书文件
# -subj 指定主体信息
# -addext 添加扩展（关键：标记为 CA 证书）
openssl req -x509 -new -key ca.key -days 3650 -out ca.crt \\
  -subj "/CN=My Test CA/O=MyOrg/C=CN" \\
  -addext "basicConstraints=critical,CA:TRUE,pathlen:1" \\
  -addext "keyUsage=critical,keyCertSign,cRLSign"

# 1.3 验证 CA 证书
openssl x509 -in ca.crt -text -noout
# 确认：Issuer=Subject（自签名），CA:TRUE，Key Usage 含 keyCertSign

# ---------- 第 2 步：生成服务器私钥和 CSR ----------

# 2.1 生成服务器私钥
openssl genrsa -out server.key 2048

# 2.2 生成 CSR
openssl req -new -key server.key -out server.csr \\
  -subj "/CN=localhost/O=MyApp/C=CN"

# 2.3 查看 CSR
openssl req -in server.csr -text -noout

# ---------- 第 3 步：CA 签发服务器证书 ----------

# 3.1 用 CA 私钥签发服务器证书
# -x509 -req 表示用 CSR 申请签发 x509 证书
# -CA 指定 CA 证书
# -CAkey 指定 CA 私钥
# -CAcreateserial 自动创建序列号文件（ca.srl）
# -out 输出证书
# -days 365 有效期 1 年
# -extfile 指定扩展配置（SAN 必须有）
# bash 进程替换 <(echo "...") 临时生成配置
openssl x509 -req -in server.csr \\
  -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out server.crt -days 365 \\
  -extfile <(printf "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1")

# 3.2 验证签发的证书
openssl x509 -in server.crt -text -noout
# 确认：Issuer 是 My Test CA，CA:FALSE，SAN 含 localhost

# 3.3 验证证书链
openssl verify -CAfile ca.crt server.crt
# 输出：server.crt: OK

# ---------- 第 4 步：部署到 Nginx ----------

# 4.1 复制文件到服务器
# cp server.key /etc/nginx/ssl/
# cp server.crt /etc/nginx/ssl/

# 4.2 Nginx 配置
cat > nginx.conf <<'CONF'
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate     /etc/nginx/ssl/server.crt;   # 证书
    ssl_certificate_key /etc/nginx/ssl/server.key;   # 私钥

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
CONF

# 4.3 把 CA 证书加入客户端信任库（让客户端信任自签 CA）
# Linux
sudo cp ca.crt /usr/local/share/ca-certificates/my-ca.crt
sudo update-ca-certificates

# 4.4 测试
curl -v https://localhost/
# 或指定 CA
curl --cacert ca.crt https://localhost/
\`\`\`

## 六、Demo 4：用 Python cryptography 实现自建 CA

用 Python 实现完整的 CA 签发流程，适合自动化运维。

\`\`\`python
# 需要先安装：pip install cryptography
from cryptography import x509
from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.backends import default_backend
import datetime

# ============================================================
# 第 1 步：生成 CA 根证书
# ============================================================
def create_ca():
    """创建自签名 CA 根证书"""
    # 1.1 生成 CA 私钥（RSA 4096 位）
    ca_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096,
        backend=default_backend()
    )

    # 1.2 构造 CA 主体名称
    ca_name = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "CN"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "My Test CA"),
        x509.NameAttribute(NameOID.COMMON_NAME, "My Test Root CA"),
    ])

    # 1.3 构造 CA 证书
    # 自签名：签发者 = 主体 = CA 自己
    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(ca_name)                        # 主体
        .issuer_name(ca_name)                         # 签发者（= 主体，自签名）
        .public_key(ca_key.public_key())              # CA 公钥
        .serial_number(x509.random_serial_number())   # 随机序列号
        .not_valid_before(datetime.datetime.utcnow()) # 生效时间
        .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=3650))  # 10 年
        .add_extension(
            x509.BasicConstraints(ca=True, path_length=1),  # CA:TRUE，可签 1 级中间 CA
            critical=True
        )
        .add_extension(
            x509.KeyUsage(
                digital_signature=False,
                content_commitment=False,
                key_encipherment=False,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=True,                   # 可以签发证书
                crl_sign=True,                        # 可以签 CRL
                encipher_only=False,
                decipher_only=False
            ),
            critical=True
        )
        .sign(ca_key, hashes.SHA256(), default_backend())  # 用 CA 私钥签名
    )

    # 1.4 保存 CA 私钥和证书
    with open("ca.key", "wb") as f:
        f.write(ca_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    with open("ca.crt", "wb") as f:
        f.write(ca_cert.public_bytes(serialization.Encoding.PEM))

    print("CA 根证书已生成: ca.crt, ca.key")
    return ca_key, ca_cert


# ============================================================
# 第 2 步：签发终端证书
# ============================================================
def issue_cert(ca_key, ca_cert, domain, san_list=None):
    """
    用 CA 签发终端证书
    domain: 主域名
    san_list: SAN 域名列表（含主域名）
    """
    if san_list is None:
        san_list = [domain]

    # 2.1 生成终端证书私钥（RSA 2048）
    server_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    # 2.2 构造主体名称
    subject_name = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "CN"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "MyApp"),
        x509.NameAttribute(NameOID.COMMON_NAME, domain),
    ])

    # 2.3 构造 SAN 扩展
    san_names = [x509.DNSName(d) for d in san_list]

    # 2.4 构造终端证书
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject_name)
        .issuer_name(ca_cert.subject)                 # 签发者 = CA 主体
        .public_key(server_key.public_key())          # 终端公钥
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.utcnow())
        .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365))
        .add_extension(
            x509.BasicConstraints(ca=False, path_length=None),  # CA:FALSE
            critical=True
        )
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,               # 数字签名
                content_commitment=False,
                key_encipherment=True,                # 密钥加密（RSA 交换密钥用）
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=False,
                crl_sign=False,
                encipher_only=False,
                decipher_only=False
            ),
            critical=True
        )
        .add_extension(
            x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]),  # 服务器认证
            critical=False
        )
        .add_extension(
            x509.SubjectAlternativeName(san_names),   # SAN
            critical=False
        )
        .sign(ca_key, hashes.SHA256(), default_backend())  # 用 CA 私钥签名
    )

    # 2.5 保存
    with open("server.key", "wb") as f:
        f.write(server_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    with open("server.crt", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print(f"终端证书已签发: server.crt (域名: {san_list})")
    return cert


# ============================================================
# 执行
# ============================================================
# 1. 创建 CA
# ca_key, ca_cert = create_ca()

# 2. 签发终端证书
# issue_cert(ca_key, ca_cert, "localhost", ["localhost", "127.0.0.1", "*.localhost"])

# 3. 验证
# openssl verify -CAfile ca.crt server.crt
# 输出: server.crt: OK
\`\`\`

## 七、Demo 5：SAN 多域名证书签发

一张证书覆盖多个域名，通过 SAN 扩展实现。

\`\`\`bash
# ---------- 1. 创建 SAN 配置文件 ----------

cat > san.cnf <<'EOF'
# OpenSSL 配置文件：用于生成带 SAN 的 CSR

[req]
default_bits = 2048                    # 默认密钥位数
prompt = no                            # 不交互式提问（用配置里的值）
default_md = sha256                    # 默认哈希算法
distinguished_name = dn                # 指定 DN 段
req_extensions = req_ext               # 指定扩展段

[dn]
C = CN                                 # 国家
ST = Beijing                           # 省
L = Beijing                            # 市
O = MyCompany                          # 组织
CN = example.com                       # 主域名

[req_ext]
subjectAltName = @alt_names            # 引用 alt_names 段

[alt_names]
DNS.1 = example.com                    # 主域名
DNS.2 = www.example.com                # www 子域名
DNS.3 = api.example.com                # api 子域名
DNS.4 = admin.example.com              # admin 子域名
DNS.5 = example.org                    # 不同域名也行
IP.1 = 192.168.1.100                   # IP 地址也行
IP.2 = 10.0.0.5                        # 多个 IP
EOF

# ---------- 2. 生成私钥 ----------
openssl genrsa -out san.key 2048

# ---------- 3. 用配置文件生成 CSR ----------
# -config 指定配置文件
openssl req -new -key san.key -out san.csr -config san.cnf

# ---------- 4. 查看 CSR 的 SAN ----------
openssl req -in san.csr -text -noout | grep -A 1 "Subject Alternative Name"
# 输出：
# X509v3 Subject Alternative Name:
#     DNS:example.com, DNS:www.example.com, DNS:api.example.com,
#     DNS:admin.example.com, DNS:example.org,
#     IP Address:192.168.1.100, IP Address:10.0.0.5

# ---------- 5. 用 CA 签发（带 SAN）----------
# 签发时也要用同样的配置文件，否则 SAN 不会写入证书
openssl x509 -req -in san.csr \\
  -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out san.crt -days 365 \\
  -extfile san.cnf -extensions req_ext

# ---------- 6. 验证证书的 SAN ----------
openssl x509 -in san.crt -ext subjectAltName -noout
# 输出与 CSR 一致

# ---------- 7. 用 openssl verify 验证多个域名 ----------
# 用 -verify_hostname 选项
openssl verify -CAfile ca.crt -verify_hostname www.example.com san.crt
# 输出：san.crt: OK
\`\`\`

## 八、Demo 6：通配符证书签发

通配符证书（\`*.example.com\`）用一张证书覆盖所有同级子域名。

\`\`\`bash
# ---------- 1. 通配符证书的 CSR ----------
# CN 和 SAN 都用 *.example.com
cat > wildcard.cnf <<'EOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = CN
O = MyCompany
CN = *.example.com                    # 通配符主域名

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.example.com                 # 通配符
DNS.2 = example.com                   # 根域名（通配符不含根域名，需单独加）
EOF

# 生成私钥和 CSR
openssl genrsa -out wildcard.key 2048
openssl req -new -key wildcard.key -out wildcard.csr -config wildcard.cnf

# ---------- 2. CA 签发 ----------
openssl x509 -req -in wildcard.csr \\
  -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out wildcard.crt -days 365 \\
  -extfile wildcard.cnf -extensions req_ext

# ---------- 3. 验证通配符匹配 ----------
openssl verify -CAfile ca.crt -verify_hostname www.example.com wildcard.crt
# 输出：wildcard.crt: OK（www.example.com 匹配 *.example.com）

openssl verify -CAfile ca.crt -verify_hostname api.example.com wildcard.crt
# 输出：wildcard.crt: OK

# 注意：通配符只匹配一级子域名
openssl verify -CAfile ca.crt -verify_hostname a.b.example.com wildcard.crt
# 输出：verification failed（a.b.example.com 不匹配 *.example.com）

# 通配符不匹配根域名
openssl verify -CAfile ca.crt -verify_hostname example.com wildcard.crt
# 如果 SAN 里加了 example.com 则 OK，否则失败

# ---------- 4. 混合通配符和多域名 ----------
# 一张证书可以有多个通配符 + 多个精确域名
cat > multi.cnf <<'EOF'
[req]
prompt = no
distinguished_name = dn
req_extensions = req_ext

[dn]
CN = example.com

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = example.com                   # 根域名
DNS.2 = *.example.com                 # example.com 的所有子域名
DNS.3 = *.api.example.com             # 二级通配符（*.api.example.com）
DNS.4 = example.net                   # 另一个域名
DNS.5 = *.example.net                 # 另一个通配符
EOF
\`\`\`

通配符证书匹配规则：

\`\`\`text
证书 SAN: *.example.com

匹配：
  www.example.com    ✓ 匹配
  api.example.com    ✓ 匹配
  mail.example.com   ✓ 匹配

不匹配：
  example.com        ✗ 通配符不含根域名
  a.b.example.com    ✗ 只匹配一级子域名
  www.example.org    ✗ 域名后缀不同

证书 SAN: *.example.com + example.com
  这样根域名和所有一级子域名都覆盖了
\`\`\`

## 九、证书签发流程图（文字描述）

\`\`\`text
申请者                                  CA / RA
  │                                       │
  │  1. 生成密钥对                         │
  │     (公钥 + 私钥)                      │
  │                                       │
  │  2. 生成 CSR                           │
  │     (公钥 + 身份 + 自签名)             │
  │                                       │
  │  3. 提交 CSR ──────────────────────────▶│
  │                                       │
  │                              4. RA 审核身份
  │                                 - DV: 验证域名所有权
  │                                   (DNS TXT / HTTP 验证)
  │                                 - OV: 核查企业资质
  │                                 - EV: 全面背景调查
  │                                       │
  │                              5. CA 签发证书
  │                                 - 用 CA 私钥签名
  │                                 - 设置有效期/扩展
  │                                       │
  │  6. 返回证书 ◀──────────────────────────│
  │                                       │
  │  7. 部署证书                           │
  │     (证书 + 私钥 → 服务器)             │
  │                                       │
  │  8. 配置证书链                         │
  │     (终端证书 + 中间证书)              │
  │                                       │
  │  9. 重启 Web 服务器                    │
  │                                       │

验证流程（浏览器）：
  访问网站 → 收到证书链 → 用内置根 CA 验证签名 → 检查有效期/SAN/吊销 → 建立连接
\`\`\`

## 十、本章小结

| 知识点 | 核心内容 |
|--------|---------|
| 签发五步 | 生成私钥 → 生成 CSR → CA 审核 → CA 签发 → 部署 |
| CSR | 证书签名请求，含公钥+身份+自签名 |
| RSA 私钥 | openssl genrsa，推荐 2048 位 |
| ECC 私钥 | openssl ecparam，推荐 P-256，更高效 |
| 自建 CA | req -x509 生成自签根证书，x509 -req 签发终端证书 |
| SAN 多域名 | 通过配置文件添加多个 DNS/IP |
| 通配符证书 | *.example.com，只匹配一级子域名 |
| Python 签发 | cryptography 库 CertificateBuilder |
| 部署要点 | fullchain（终端+中间）、私钥权限 600 |
`
  },

  // ============================================================
  // 第五章：证书吊销机制
  // ============================================================
  {
    id: "hs-revoke",
    group: "数字证书与 PKI",
    icon: "✂️",
    title: "证书吊销机制",
    content: `# 证书吊销机制

## 一、为什么需要吊销证书

证书有有效期，但在有效期内也可能需要提前作废，这就是**证书吊销（Revocation）**。

生活类比：身份证没过期，但你丢了——你需要立刻挂失，防止被别人捡到冒用。证书也一样，私钥泄露了，即使证书没到期也要立刻吊销。

### 1.1 吊销证书的常见原因

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│                    证书吊销的常见原因                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 私钥泄露                                                  │
│     最严重的情况。服务器被黑、私钥文件被窃取、                 │
│     员工带走私钥等。攻击者拿到私钥就能冒充该网站。             │
│     必须立刻吊销证书，让浏览器拒绝信任。                       │
│                                                              │
│  2. 证书发错                                                  │
│     CA 把证书发给了不该发的人（如域名验证被绕过），            │
│     CA 发现后必须吊销。                                       │
│                                                              │
│  3. 域名易主                                                  │
│     网站换了主人，原证书不应继续使用。                        │
│     如公司被收购、域名转手。                                  │
│                                                              │
│  4. 组织变更                                                  │
│     公司改名、合并、解散，原证书中的组织信息失效。             │
│                                                              │
│  5. 证书用途变更                                              │
│     原本用于加密的证书要改用于签名，用途不匹配需吊销重签。     │
│                                                              │
│  6. CA 违规被处罚                                             │
│     CA 自己违规操作（如 Google 发现 Symantec 误发证书），      │
│     浏览器/操作系统强制吊销该 CA 签发的证书。                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### 1.2 吊销 vs 过期

\`\`\`text
过期（Expiration）：
  - 证书到达 Not After 时间后自然失效
  - 是计划内的，可以提前续签
  - 不需要特别通知

吊销（Revocation）：
  - 在有效期内提前作废
  - 是计划外的，通常因安全事件
  - 必须及时通知所有客户端
  - 客户端要通过 CRL/OCSP 查询吊销状态
\`\`\`

## 二、两大吊销机制：CRL 与 OCSP

### 2.1 CRL（Certificate Revocation List）证书吊销列表

**CRL** 是 CA 定期发布的一个列表，记录所有已被吊销的证书编号。

\`\`\`text
CRL 就像公安局公布的"作废身份证清单"：
  - 定期发布（如每 24 小时）
  - 列出所有作废证书的序列号
  - 客户端下载清单，检查证书是否在内

CRL 文件结构：
┌──────────────────────────────────────┐
│  CRL 版本：v2                         │
│  签发者：CN=DigiCert CA               │
│  本次更新时间：2024-06-01 00:00:00    │
│  下次更新时间：2024-06-08 00:00:00    │
│  吊销证书列表：                       │
│    序列号 0E9C...  吊销时间 ...       │
│    序列号 1A2B...  吊销时间 ...       │
│    序列号 3F4E...  吊销时间 ...       │
│    ...（可能成千上万条）              │
│  CA 签名：...                         │
└──────────────────────────────────────┘
\`\`\`

**CRL 优点**：
- 批量下载，一次查询覆盖所有吊销证书
- 离线可用（下载后本地查询）
- 实现简单

**CRL 缺点**：
- **体积大**：大型 CA 的 CRL 可达数 MB，每次下载消耗带宽
- **不及时**：两次发布之间有延迟（如 24 小时内吊销的证书查不到）
- **增长无限**：吊销记录只增不减，CRL 越来越大
- **隐私泄露**：客户端访问 CA 的 CRL 地址，CA 知道你在查哪些网站的吊销状态

### 2.2 OCSP（Online Certificate Status Protocol）在线证书状态协议

**OCSP** 是实时查询单个证书状态的协议，客户端向 CA 的 OCSP 服务器查询某张证书是否有效。

\`\`\`text
OCSP 就像打电话给公安局查某张身份证是否挂失：
  - 实时查询，针对单张证书
  - CA 的 OCSP 服务器即时响应
  - 返回：good（有效）/ revoked（已吊销）/ unknown（未知）

OCSP 交互流程：
  客户端                      OCSP 服务器（CA）
    │                              │
    │  1. 查询证书 0E9C... 状态    │
    │ ────────────────────────────▶│
    │                              │
    │  2. 查询结果：good/revoked   │
    │ ◀────────────────────────────│
    │                              │

OCSP 请求和响应都是 DER 编码的 ASN.1 结构
通常走 HTTP（不是 HTTPS，为了性能）
\`\`\`

**OCSP 优点**：
- **实时**：查询的是当前最新状态
- **响应小**：只查一张证书，响应只有几百字节
- **无增长问题**：不像 CRL 不断变大

**OCSP 缺点**：
- **性能差**：每次 HTTPS 连接都要额外发一次 OCSP 查询，增加延迟
- **隐私泄露**：CA 的 OCSP 服务器知道你访问了哪些网站
- **可用性依赖**：OCSP 服务器挂了，客户端怎么办？（多数浏览器选择"软失败"——查不到就当没吊销）
- **可被阻断**：网络中间人可阻断 OCSP 查询，触发软失败

### 2.3 OCSP Stapling（OCSP 装订）

为解决 OCSP 的性能和隐私问题，出现了 **OCSP Stapling**。

\`\`\`text
OCSP Stapling 流程：
  服务器                          OCSP 服务器
    │                              │
    │  1. 服务器定期预取 OCSP 响应  │
    │ ────────────────────────────▶│
    │                              │
    │  2. OCSP 响应（签名过的）     │
    │ ◀────────────────────────────│
    │                              │
  客户端                          服务器
    │                              │
    │  3. TLS 握手                 │
    │ ◀──── 证书 + OCSP 响应 ──────│
    │                              │
    │  4. 验证 OCSP 响应签名       │
    │     （无需直接联系 OCSP）    │
    │                              │

好处：
  - 客户端不用直接查 OCSP（省一次请求，降低延迟）
  - CA 不知道是哪个客户端在访问（保护隐私）
  - 服务器缓存 OCSP 响应，减少 CA 压力
\`\`\`

OCSP 响应是 CA 签名的，服务器只是"转交"，客户端验证签名后即可信任。服务器需要定期刷新缓存的 OCSP 响应（通常每 24-48 小时）。

## 三、Demo 1：查看 CRL

\`\`\`bash
# ---------- 1. 从证书中获取 CRL 地址 ----------
# CRL 地址在证书的 CRL Distribution Points 扩展里
openssl x509 -in cert.pem -ext crlDistributionPoints -noout
# 输出：
# Full Name:
#   URI:http://crl3.digicert.com/sha2-hybrid-g6.crl

# ---------- 2. 下载 CRL ----------
# CRL 通常是 DER 格式
curl -o crl.der http://crl3.digicert.com/sha2-hybrid-g6.crl

# ---------- 3. 查看 CRL 内容 ----------
# -in 指定输入文件
# -inform DER 指定输入格式
# -text 以可读格式输出
# -noout 不输出原始编码
openssl crl -in crl.der -inform DER -text -noout

# 输出示例：
# Certificate Revocation List (CRL):
#     Version 2 (0x1)                          # CRL 版本
#     Signature Algorithm: sha256WithRSAEncryption   # 签名算法
#     Issuer: CN=DigiCert ...                   # 签发者
#     Last Update: Jun  1 00:00:00 2024 GMT     # 本次更新时间
#     Next Update: Jun  8 00:00:00 2024 GMT     # 下次更新时间
#     CRL extensions:                           # CRL 扩展
#         X509v3 CRL Number: 12345              # CRL 序号
#     Revoked Certificates:                     # 吊销列表
#         Serial Number: 0E9C4C5A...            # 被吊销证书的序列号
#             Revocation Date: May 15 00:00:00 2024 GMT  # 吊销时间
#         Serial Number: 1A2B3C4D...
#             Revocation Date: May 20 00:00:00 2024 GMT
#         ...（可能有成千上万条）
#     Signature Algorithm: sha256WithRSAEncryption   # CA 签名

# ---------- 4. 检查某张证书是否在 CRL 中 ----------
# 提取证书序列号
CERT_SERIAL=$(openssl x509 -in cert.pem -serial -noout | cut -d= -f2)
echo "证书序列号: $CERT_SERIAL"

# 在 CRL 中搜索该序列号
if openssl crl -in crl.der -inform DER -text -noout | grep -i "$CERT_SERIAL"; then
  echo "警告: 该证书已被吊销！"
else
  echo "证书未被吊销"
fi

# ---------- 5. 验证 CRL 签名 ----------
# 需要 CA 证书来验证 CRL 签名
openssl crl -in crl.der -inform DER -CAfile ca.crt -noout
# 输出：verify OK  或  verify failure
\`\`\`

## 四、Demo 2：OCSP 查询证书状态

\`\`\`bash
# ---------- 1. 获取证书的 OCSP 地址 ----------
# OCSP 地址在证书的 Authority Information Access 扩展里
openssl x509 -in cert.pem -ext authorityInfoAccess -noout
# 输出：
# CA Issuers - URI:http://cacerts.digicert.com/...crt   # CA 证书下载地址
# OCSP - URI:http://ocsp.digicert.com                    # OCSP 查询地址

# ---------- 2. 下载 CA 证书 ----------
# OCSP 查询需要 CA 证书（验证 OCSP 响应签名）
curl -o ca.der http://cacerts.digicert.com/DigiCertTLSHybridECCSHA3842020CA1-1.crt
# DER 转 PEM
openssl x509 -in ca.der -inform DER -out ca.crt

# ---------- 3. OCSP 查询 ----------
# -issuer 指定 CA 证书
# -cert 指定要查询的证书
# -url 指定 OCSP 服务器地址
# -resp_text 输出完整响应文本
openssl ocsp -issuer ca.crt -cert cert.pem -url http://ocsp.digicert.com -resp_text

# 输出示例：
# OCSP Response Status: successful (0x0)         # OCSP 响应状态
# Response Type: Basic OCSP Response
# ...
# Cert Status: good                               # 证书状态：good/revoked/unknown
# This Update: Jun  5 00:00:00 2024 GMT           # 本次更新时间
# Next Update: Jun 12 00:00:00 2024 GMT           # 下次更新时间
# ...

# 如果证书被吊销：
# Cert Status: revoked
# Revocation Time: May 15 00:00:00 2024 GMT
# Revocation Reason: keyCompromise (1)            # 吊销原因

# ---------- 4. 只看简洁结果 ----------
openssl ocsp -issuer ca.crt -cert cert.pem -url http://ocsp.digicert.com
# 输出：
# cert.pem: good
#     This Update: Jun  5 00:00:00 2024 GMT

# ---------- 5. 查询真实网站 ----------
# 以 github.com 为例
# 先获取证书和 CA
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | awk '/BEGIN CERT/{n++} n==1{print}' > github.pem
echo | openssl s_client -connect github.com:443 -showcerts 2>/dev/null | awk '/BEGIN CERT/{n++} n==2{print}' > github_ca.pem

# 查询 OCSP
openssl ocsp -issuer github_ca.pem -cert github.pem -url http://ocsp.digicert.com
\`\`\`

OCSP 吊销原因代码：

\`\`\`text
0  unspecified              未指定
1  keyCompromise            私钥泄露（最常见）
2  cACompromise             CA 私钥泄露
3  affiliationChanged       隶属关系变更
4  superseded               被替代
5  cessationOfOperation     停止运营
6  certificateHold          证书暂停（可恢复）
8  removeFromCRL            从 CRL 移除
9  privilegeWithdrawn       权限撤销
10 aACompromise             AA 泄露
\`\`\`

## 五、Demo 3：用 Python 查询 OCSP

\`\`\`python
# 需要安装：pip install cryptography requests
import requests
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import struct

def build_ocsp_request(cert, issuer_cert):
    """构造 OCSP 请求（DER 编码）"""
    builder = x509.OCSPRequestBuilder()
    builder = builder.add_certificate(cert, issuer_cert, hashes.SHA1())
    # 注意：OCSP 通常用 SHA-1 做 CertID（历史原因，不涉及安全性）
    request = builder.build()
    return request.public_bytes(serialization.Encoding.DER)

def parse_ocsp_response(response_der):
    """解析 OCSP 响应"""
    response = x509.ocsp.load_der_ocsp_response(response_der)

    print("=== OCSP 响应解析 ===")
    print(f"响应状态: {response.response_status.name}")

    if response.response_status == x509.ocsp.OCSPResponseStatus.SUCCESSFUL:
        print(f"证书状态: {response.certificate_status.name}")
        # SUCCESSFUL / REVOKED / UNKNOWN

        if response.certificate_status == x509.ocsp.OCSPCertStatus.REVOKED:
            print(f"吊销时间: {response.revocation_time_utc}")
            print(f"吊销原因: {response.revocation_reason}")

        print(f"本次更新: {response.this_update_utc}")
        if response.next_update_utc:
            print(f"下次更新: {response.next_update_utc}")

    return response

def query_ocsp(cert_path, issuer_path, ocsp_url):
    """查询证书的 OCSP 状态"""
    # 1. 加载证书和 CA 证书
    with open(cert_path, "rb") as f:
        cert = x509.load_pem_x509_certificate(f.read(), default_backend())
    with open(issuer_path, "rb") as f:
        issuer = x509.load_pem_x509_certificate(f.read(), default_backend())

    # 2. 构造 OCSP 请求
    request_der = build_ocsp_request(cert, issuer)

    # 3. 发送 HTTP POST 请求
    headers = {"Content-Type": "application/ocsp-request"}
    resp = requests.post(ocsp_url, data=request_der, headers=headers, timeout=10)

    # 4. 解析响应
    if resp.status_code == 200:
        return parse_ocsp_response(resp.content)
    else:
        print(f"HTTP 错误: {resp.status_code}")
        return None

# ---------- 使用示例 ----------
# 先获取 OCSP 地址
# cert = x509.load_pem_x509_certificate(open("github.pem","rb").read(), default_backend())
# aia = cert.extensions.get_extension_for_class(x509.AuthorityInformationAccess)
# for desc in aia.value:
#     if desc.access_method == x509.AuthorityInformationAccessOID.OCSP:
#         ocsp_url = desc.access_location.value
#         print(f"OCSP 地址: {ocsp_url}")
#
# query_ocsp("github.pem", "github_ca.pem", ocsp_url)
\`\`\`

## 六、Demo 4：Nginx 配置 OCSP Stapling

让 Nginx 服务器预取 OCSP 响应，在 TLS 握手时直接发给客户端。

\`\`\`nginx
# nginx.conf 配置 OCSP Stapling

server {
    listen 443 ssl;
    server_name example.com;

    # ---------- 基础证书配置 ----------
    ssl_certificate     /etc/nginx/ssl/fullchain.pem;   # 含终端证书+中间证书
    ssl_certificate_key /etc/nginx/ssl/server.key;      # 私钥

    # ---------- OCSP Stapling 配置 ----------
    ssl_stapling on;                          # 开启 OCSP Stapling
    ssl_stapling_verify on;                   # 开启 OCSP 响应验证
    ssl_trusted_certificate /etc/nginx/ssl/chain.pem;  # 含所有 CA 证书（用于验证 OCSP 签名）

    # resolver 配置 DNS 服务器（OCSP 预取需要解析 OCSP 域名）
    # valid=300s 表示 DNS 缓存 5 分钟
    # ipv6=off 禁用 IPv6 解析（避免某些环境 IPv6 不通导致超时）
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;                      # DNS 解析超时 5 秒

    # ---------- 其他推荐配置 ----------
    ssl_protocols TLSv1.2 TLSv1.3;            # 只允许 TLS 1.2/1.3
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;            # TLS 1.3 让客户端选

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
\`\`\`

重启 Nginx 并检查：

\`\`\`bash
# 测试配置语法
sudo nginx -t

# 重新加载配置
sudo nginx -s reload

# 注意：开启 OCSP Stapling 后，Nginx 需要几秒到几分钟去预取 OCSP 响应
# 不是立刻生效的

# 如果 Nginx 日志报 OCSP 错误，常见原因：
# 1. ssl_trusted_certificate 没包含完整 CA 链
# 2. DNS 解析失败（resolver 配错）
# 3. OCSP 服务器访问不了（网络问题）
\`\`\`

Apache 配置 OCSP Stapling：

\`\`\`apache
# httpd-ssl.conf

# 开启 OCSP Stapling
SSLUseStapling on
# Stapling 缓存路径和大小
SSLStaplingCache shmcb:/var/run/ocsp(128000)

<VirtualHost *:443>
    ServerName example.com
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/server.crt
    SSLCertificateKeyFile /etc/ssl/private/server.key
    SSLCertificateChainFile /etc/ssl/certs/chain.pem
</VirtualHost>
\`\`\`

## 七、Demo 5：测试 OCSP Stapling 是否生效

\`\`\`bash
# ---------- 方法 1：openssl s_client ----------
# -status 选项让 openssl 在握手时请求 OCSP Stapling
openssl s_client -connect example.com:443 -status

# 输出中查找 OCSP Response 部分：
# OCSP response:
# ======================================
# OCSP Response Status: successful (0x0)   ← 看到 successful 表示生效
# Response Type: basic
# ...
# Cert Status: good                        ← 证书状态 good
# This Update: Jun  5 00:00:00 2024 GMT
# Next Update: Jun 12 00:00:00 2024 GMT
# ======================================

# 如果没有 OCSP Response 部分，或者显示：
# "no OCSP response received"
# 说明 Stapling 未生效

# ---------- 方法 2：只看关键信息 ----------
echo | openssl s_client -connect example.com:443 -status 2>/dev/null | grep -A 5 "OCSP Response"
# 一行检查
echo | openssl s_client -connect example.com:443 -status 2>/dev/null | grep "OCSP Response Status"

# ---------- 方法 3：测试多个网站 ----------
for domain in github.com google.com cloudflare.com; do
  echo "=== $domain ==="
  result=$(echo | openssl s_client -connect $domain:443 -status 2>/dev/null | grep "OCSP Response Status")
  if [ -z "$result" ]; then
    echo "  OCSP Stapling: 未启用"
  else
    echo "  $result"
  fi
done

# ---------- 方法 4：用 curl 检查 ----------
# curl 不直接显示 OCSP Stapling，但可以用 --cert-status 间接检查
curl -vI https://example.com 2>&1 | grep -i ocsp
\`\`\`

OCSP Stapling 不生效的排查：

\`\`\`bash
# ---------- 排查清单 ----------

# 1. 检查 Nginx 配置是否正确
sudo nginx -T 2>/dev/null | grep -E "stapling|resolver"

# 2. 检查证书是否有 OCSP URL
openssl x509 -in /etc/nginx/ssl/server.crt -ext authorityInfoAccess -noout
# 必须有 OCSP - URI:... 行

# 3. 检查 ssl_trusted_certificate 是否包含完整 CA 链
# chain.pem 应该包含中间 CA + 根 CA
openssl x509 -in /etc/nginx/ssl/chain.pem -text -noout | grep -c "BEGIN CERT"
# 应该 >= 2

# 4. 手动测试 OCSP 查询是否能成功
openssl ocsp -issuer chain.pem -cert server.crt -url http://ocsp.example.com
# 如果这里就失败，说明 OCSP 服务器有问题

# 5. 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log | grep -i ocsp
# 常见错误：
# "ocsp server responder error" → OCSP 服务器问题
# "hostname resolving failed" → DNS 问题
# "certificate verify error" → chain.pem 不完整

# 6. 重启 Nginx 后等待几分钟再测（OCSP 预取是异步的）
\`\`\`

## 八、Demo 6：吊销后的证书浏览器行为

### 8.1 模拟吊销并观察浏览器行为

\`\`\`bash
# ---------- 场景：自建 CA 签发证书后吊销 ----------

# 1. 自建 CA（参考上一章）
openssl genrsa -out ca.key 4096
openssl req -x509 -new -key ca.key -days 3650 -out ca.crt \\
  -subj "/CN=Test CA" \\
  -addext "basicConstraints=critical,CA:TRUE"

# 2. 签发服务器证书
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/CN=localhost"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out server.crt -days 365 \\
  -extfile <(echo "subjectAltName=DNS:localhost,IP:127.0.0.1")

# 3. 把 CA 加入系统信任
sudo cp ca.crt /usr/local/share/ca-certificates/test-ca.crt
sudo update-ca-certificates

# 4. 启动测试服务器（用 Python）
# python3 -m http.server 443 --certfile server.crt --keyfile server.key
# 此时浏览器访问 https://localhost 应该正常

# 5. 吊销证书
# 生成 CRL（需要配置文件）
cat > crl.cnf <<'EOF'
[ca]
default_ca = CA_default

[CA_default]
database = index.txt
crlnumber = crlnumber.txt
default_md = sha256
crl_extensions = crl_ext
default_crl_days = 30

[crl_ext]
authorityKeyIdentifier = keyid:always
EOF

# 创建 CA 数据库文件
touch index.txt
echo "01" > crlnumber.txt

# 把证书加入吊销列表
openssl ca -config crl.cnf -revoke server.crt -keyfile ca.key -cert ca.crt
# 输出：Data Base Updated

# 生成 CRL
openssl ca -config crl.cnf -gencrl -keyfile ca.key -cert ca.crt -out crl.pem

# 查看 CRL
openssl crl -in crl.pem -text -noout
# 可以看到 server.crt 的序列号在吊销列表里

# 6. 此时浏览器访问 https://localhost
# 不同浏览器行为不同：
# - Firefox（严格模式）：显示"证书已吊销"，拒绝访问
# - Chrome（软失败）：可能仍可访问（不强制检查 CRL）
# - curl（默认不检查吊销）：可访问
#   curl --cacert ca.crt https://localhost  → 正常
#   curl --crlfile crl.pem --cacert ca.crt https://localhost  → 失败
\`\`\`

### 8.2 curl 检查吊销

\`\`\`bash
# curl 默认不检查证书吊销状态
curl -v https://localhost
# 即使证书被吊销，curl 默认仍可访问

# 用 CRL 检查
# --crlfile 指定 CRL 文件
curl --crlfile crl.pem --cacert ca.crt https://localhost
# 输出：curl: (35) Revoked certificate in certification chain

# 用 OCSP 检查（curl 本身不支持 OCSP，需要配合 openssl）
\`\`\`

### 8.3 各浏览器吊销检查策略

\`\`\`text
浏览器          CRL      OCSP     OCSP Stapling    软失败
─────────────────────────────────────────────────────────
Chrome          基本不用  使用      支持             是（查不到就放行）
Firefox         CT 日志   使用      支持             可配置（security.OCSP.require）
Safari          使用      使用      支持             是
Edge            基本不用  使用      支持             是

现代浏览器趋势：
  - 越来越多使用 OCSP Stapling（减少客户端查询）
  - Google Chrome 推行 CRLSets（Chrome 自己维护的高危吊销列表）
  - Firefox 有 OneCRL（针对中间 CA 的吊销列表）
  - 普通证书吊销越来越依赖"软失败"（不阻断访问）
  - EV 证书吊销检查更严格
\`\`\`

### 8.4 CRLSets（Chrome 特有）

\`\`\`bash
# Google Chrome 维护自己的吊销列表 CRLSets
# 而不依赖 CA 的 CRL/OCSP
# CRLSets 只包含"高危"吊销（如 CA 被入侵），不包含所有吊销

# 查看 Chrome 的 CRLSet
# 在 Chrome 地址栏输入：chrome://components/
# 找到 CRLSet，点击"更新"可看版本

# CRLSet 是一个二进制文件，Chrome 定期从 Google 下载
# 格式：JSON 头 + 二进制序列号列表
\`\`\`

## 九、三种吊销机制对比表

| 对比项 | CRL | OCSP | OCSP Stapling |
|--------|-----|------|---------------|
| 查询方式 | 批量下载列表 | 实时单张查询 | 服务器预取+握手附带 |
| 实时性 | 差（数小时延迟） | 好（实时） | 中（缓存数小时） |
| 响应大小 | 大（MB 级） | 小（几百字节） | 小（几百字节） |
| 客户端延迟 | 低（本地查询） | 高（额外请求） | 低（握手时附带） |
| 隐私 | 泄露给 CA | 泄露给 CA | 保护隐私 |
| 可用性依赖 | 低（离线可用） | 高（依赖 OCSP 服务器） | 中（服务器缓存） |
| 实现复杂度 | 简单 | 中等 | 较高 |
| 现代使用 | 衰退中 | 仍在用 | 推荐方案 |
| 适用场景 | 离线环境 | 兼容旧客户端 | 现代浏览器 |

## 十、本章小结

| 知识点 | 核心内容 |
|--------|---------|
| 吊销原因 | 私钥泄露/证书发错/域名易主/CA 违规 |
| CRL | 批量下载吊销列表，体积大、不及时 |
| OCSP | 实时查询单张证书，隐私泄露、性能差 |
| OCSP Stapling | 服务器预取 OCSP 响应，握手时附带 |
| OCSP 查询命令 | openssl ocsp -issuer ... -cert ... -url ... |
| Nginx Stapling | ssl_stapling on + resolver 配置 |
| 吊销原因码 | keyCompromise(1)/cessationOfOperation(5) 等 |
| 浏览器策略 | 多数软失败，Chrome 用 CRLSets，Firefox 可严格 |
| Python OCSP | cryptography 库 x509.ocsp 模块 |
`
  },
];
