// =============================================================
// 计算机网络教程 —— 第二批章节（应用层协议篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. net-dns            — DNS 域名解析系统
//   2. net-websocket      — WebSocket 实时通信
//   3. net-cors-csrf      — 跨域、CORS、CSRF 安全
//   4. net-cookie-session — Cookie、Session、JWT 认证机制
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（"应用层协议"）
//   content : Markdown 格式的详细讲解（中文，8000+ 字）
//   code    : 可真实运行的 Python 代码（用标准库演示网络协议）
//
// 沙箱约束：Python 3.13，无外网，标准库可用（socket/http/ssl/struct/
// threading/json/hashlib/hmac/base64 等），执行超时 10 秒。所有 demo 用
// 127.0.0.1 本地通信，端口 0 由系统分配避免冲突。
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：DNS 域名解析系统
  // ============================================================
  {
    id: "net-dns",
    title: "DNS 域名解析系统",
    icon: "📶",
    group: "应用层协议",
    content: `## 一、为什么这一章重要

打开浏览器输入 \`www.example.com\`，第一件事不是建立 TCP 连接，而是把这个域名翻译成 IP 地址——这件事由 DNS（Domain Name System）完成。DNS 是互联网的"电话簿"，几乎所有网络应用的第一步都离不开它。一旦 DNS 出问题，再华丽的应用也无法访问：你能 ping 通 IP 却打不开域名，八成是 DNS 解析故障。

工作中 DNS 无处不在：配置 Nginx 的 \`server_name\`、排查"域名解析失败"、理解 CDN 加速原理、做服务发现（Kubernetes 的 CoreDNS）、调试本地 \`hosts\`、防范 DNS 劫持。这一章把 DNS 的层次结构、查询过程、报文格式、记录类型、缓存策略和安全增强讲透，让你既能在面试中答清楚，也能在线上 DNS 问题时快速定位。

### 1.1 DNS 的核心作用

DNS 做的事一句话概括：**把人类易记的域名翻译成机器能路由的 IP 地址**。它本质上是一个**分布式的、层次化的数据库**，存储着"域名 → 记录"的映射。注意这里说的是"记录"而不只是 IP——DNS 除了 A 记录（域名→IPv4），还存 MX（邮件服务器）、CNAME（别名）、TXT（文本）等多种记录。

为什么不用一个中心服务器存所有域名？因为全球有上亿域名、每秒数十亿次查询，单点必然崩溃，而且单点故障会让整个互联网瘫痪。所以 DNS 被设计成**层次化分布式**：每一级只管自己那一段，查询时逐级下发，缓存层层分担。

## 二、DNS 的层次结构

DNS 的域名空间是一棵倒置的树，根在顶部，叶子在底部。每一层对应一个管理边界。

\`\`\`text
                  根域 (.)
                /   |   \\
          com   org   net   cn   ...      ← 顶级域 TLD
         / \\    |     |
   example google  ...   ...  ...        ← 二级域
      /   \\
   www    api                              ← 三级域（主机名）
\`\`\`

逐层解释：

1. **根域（Root，用 \`.\` 表示）**：DNS 树的顶端。全球有 13 组根域名服务器（A-M），实际是数百台机器用任播（Anycast）技术共享这些 IP。根服务器存储的是"顶级域的权威服务器地址"，而不是具体域名。
2. **顶级域（TLD，Top-Level Domain）**：如 \`com\`、\`org\`、\`net\`、\`cn\`、\`jp\`、\`edu\`、\`gov\`。顶级域分三类：
   - **gTLD（通用顶级域）**：com/org/net/info 等通用类别。
   - **ccTLD（国家代码顶级域）**：cn/us/jp/uk 等国家/地区。
   - **新 gTLD**：.app/.dev/.xyz/.top 等近年开放的新顶级域。
3. **二级域（Second-Level Domain）**：如 \`example.com\` 中的 \`example\`。这是用户注册时获得的域名主体。
4. **三级域/主机名**：如 \`www.example.com\` 中的 \`www\`，通常是组织内部划分的服务。

完整域名的末尾理论上有一个根域的 \`.\`，写作 \`www.example.com.\`，但日常使用都省略末尾的点。DNS 报文里域名末尾的 \`\\x00\`（零字节）就代表根域。

### 2.1 域名解析的管辖权

每一级域名的权威服务器只负责下一级。比如 \`example.com\` 的权威服务器（由注册商配置）只负责 \`*.example.com\` 的解析，它把 \`www.example.com\` 解析成具体 IP。这种"分层授权"保证了每个组织只需管理自己的子域，互不干扰。

## 三、DNS 查询过程详解

这是面试最高频的 DNS 知识点：从输入域名到拿到 IP，中间经过哪些步骤。完整过程如下：

\`\`\`text
浏览器输入 www.example.com
    │
    1. 浏览器 DNS 缓存 ──────── 命中? 直接返回
    │ (Chrome: chrome://net-internals/#dns)
    2. OS DNS 缓存 ─────────── 命中? 直接返回
    │ (Linux: nscd/systemd-resolved)
    3. hosts 文件 ─────────── 命中? 直接返回
    │ (/etc/hosts)
    4. 本地 DNS 服务器 (递归解析器) ── 命中缓存? 返回
    │ (运营商/公共 DNS: 8.8.8.8 / 114.114.114.114)
    │  以下为"递归解析器"代为完成的工作（迭代查询）：
    5. 根域名服务器 ────→ 返回 .com 顶级域服务器地址
    6. .com 顶级域服务器 ──→ 返回 example.com 权威服务器地址
    7. example.com 权威服务器 ──→ 返回 www.example.com 的 A 记录 IP
    │
    8. 递归解析器把结果缓存（按 TTL），返回给客户端
\`\`\`

关键细节：

- **步骤 1-3 在客户端本地完成**，命中就直接用，不发出任何 DNS 查询。这就是为什么改了 \`hosts\` 立刻生效。
- **步骤 4 是递归解析器**（也叫递归 DNS 服务器、本地 DNS 服务器）。它通常是运营商提供的，或公共 DNS（Google 8.8.8.8、Cloudflare 1.1.1.1、阿里 223.5.5.5）。客户端把"递归"的活全交给它：它去问根、问 TLD、问权威，一路跑完把最终 IP 拿回来。
- **步骤 5-7 是迭代查询**：递归解析器问根"com 谁管？"根答"去问这些 TLD 服务器"；解析器再问 TLD"example.com 谁管？"TLD 答"去问这些权威服务器"；解析器最后问权威"www.example.com 的 IP？"权威直接答 IP。

### 3.1 递归查询 vs 迭代查询

这是最容易混淆的概念，务必分清：

| 维度 | 递归查询（Recursive） | 迭代查询（Iterative） |
|------|---------------------|----------------------|
| 谁干活 | 被问的服务器替你跑完所有查询 | 被问的服务器只告诉你"下一步去问谁" |
| 客户端 | 只发一次请求，等最终结果 | 要发多次请求，逐级追问 |
| 典型位置 | 客户端 → 本地 DNS 服务器 | 本地 DNS 服务器 → 根/TLD/权威 |

口诀：**客户端对本地 DNS 是递归（我不管细节，你帮我把结果拿来）；本地 DNS 对根/TLD/权威是迭代（我问你，你指路，我自己再去问）**。

为什么客户端不用迭代？因为迭代要发多次请求、逐级追问，客户端做这件事既慢又加重网络负担。让递归解析器统一做并缓存结果，所有客户端共享缓存，效率最高。

### 3.2 为什么根只有 13 个 IP

历史上根服务器只有 13 组 IP（A 到 M），是因为 DNS 报文通过 UDP 传输，UDP 报文不超过 512 字节（不加 EDNS0 时）。13 组根的地址刚好能塞进一个 512 字节的 UDP 包。但这 13 个 IP 背后用 BGP Anycast 部署了上千台机器分布全球，所以"13 个根"不等于"13 台机器"，性能和冗余都有保障。

## 四、DNS 报文格式详解

DNS 报文既是请求也是响应，格式统一：Header + Question + Answer + Authority + Additional。理解报文格式是排查 DNS 问题、自己实现 DNS 工具的基础。

### 4.1 Header（12 字节）

\`\`\`text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Transaction ID (16)         |     Flags (16)          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Question Count (16)      |    Answer Count (16)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Authority Count (16)       |   Additional Count (16)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
\`\`\`

Flags 字段位含义：

| 位 | 字段 | 含义 |
|----|------|------|
| 0 | QR | 0=查询，1=响应 |
| 1-4 | Opcode | 0=标准查询，1=反向查询 |
| 5 | AA | 权威回答（来自权威服务器） |
| 6 | TC | 报文被截断（超过 512 字节，TCP 重试） |
| 7 | RD | 期望递归（客户端请求递归） |
| 8 | RA | 支持递归（服务器告诉客户端我支持） |
| 9-11 | 保留 | - |
| 12-15 | RCODE | 响应码：0=无错，3=NXDOMAIN 域名不存在 |

### 4.2 Question 段

每个问题包含：域名（变长）+ QTYPE（2 字节）+ QCLASS（2 字节，IN=1）。

域名编码特殊：不用字符串而是**长度前缀 + 标签**，每个标签前一个字节表示长度，末尾加 \`\\x00\`。比如 \`example.com\` 编码为 \`\\x07example\\x03com\\x00\`（7 长度 example + 3 长度 com + 0 结束）。

### 4.3 Answer 段

每条回答包含：域名（常压缩为指针 0xC00C 指向 Question 中的域名）+ TYPE + CLASS + TTL（4 字节）+ RDLENGTH（2 字节）+ RDATA（变长）。

域名压缩是 DNS 节省字节的技巧：当 Answer 的域名和 Question 里的一样，就用 2 字节指针（前两 bit 为 11 表示指针，后 14 bit 是偏移量）指向 Question 中的域名，避免重复存储。

### 4.4 为什么 DNS 用 UDP

DNS 查询通常很小（< 512 字节），一问一答，用 UDP 省 TCP 握手开销，快。但 UDP 限制 512 字节，大响应（如 DNSSEC 签名）超长时要切到 TCP。EDNS0 扩展把 UDP 上限提到 4096 字节，大多数情况不用切 TCP 了。

## 五、DNS 记录类型

DNS 不只存 IP，它存多种记录类型，每种用途不同。这是工程中配置域名时最常打交道的：

| 类型 | 全称 | 作用 | 示例 |
|------|------|------|------|
| A | Address | 域名 → IPv4 | \`www IN A 93.184.216.34\` |
| AAAA | IPv6 Address | 域名 → IPv6 | \`www IN AAAA 2606:2800:220:1::\` |
| CNAME | Canonical Name | 域名别名，指向另一个域名 | \`blog IN CNAME example.com\` |
| MX | Mail Exchange | 邮件服务器（带优先级） | \`@ IN MX 10 mail.example.com\` |
| TXT | Text | 任意文本（用于验证、SPF、DKIM） | \`@ IN TXT "v=spf1 -all"\` |
| NS | Name Server | 该域由哪些权威服务器管 | \`@ IN NS ns1.dnspod.net\` |
| SOA | Start of Authority | 区域起点、管理员、序列号 | 含主服务器、管理员邮箱、TTL |
| PTR | Pointer | IP → 域名（反向解析） | 用于邮件服务器反查 |
| SRV | Service | 指定服务的端口和主机 | \`_sip._tcp IN SRV ...\` |
| CAA | CA Authorization | 限制哪些 CA 可签证书 | 防止证书被误签 |

高频记录详解：

- **CNAME 链**：\`blog.example.com\` CNAME 到 \`example.cdn.net\`，\`example.cdn.net\` 再 A 到 IP。解析时要跟随 CNAME 链直到拿到 A/AAAA。注意：**CNAME 不能和其他记录共存**（如同一域名既有 CNAME 又有 MX 会冲突），根域（@）一般不用 CNAME。
- **MX 优先级**：数字越小优先级越高。配多个 MX 提高邮件可靠性。
- **TXT 验证**：申请 SSL 证书（DNS-01）、配置 SPF/DKIM 防垃圾邮件、域名所有权证明都用 TXT。
- **PTR 反向解析**：很多邮件服务器收信时会反查发件 IP 的 PTR，没有匹配就拒收（防垃圾邮件）。

## 六、TTL 的作用与设置策略

TTL（Time To Live）是 DNS 记录的缓存时间。递归解析器和客户端拿到记录后，会按 TTL 缓存，过期前不再向上游查。

TTL 设置是工程中需要权衡的关键参数：

| TTL | 优点 | 缺点 | 适用 |
|-----|------|------|------|
| 长（如 1 小时/1 天） | 减少查询压力、解析快 | 改 IP 后生效慢 | 稳定的静态资源域名 |
| 短（如 60 秒/300 秒） | 改 IP 快速生效 | 查询压力大 | 灰度发布、故障切换域名 |

经验策略：

1. **即将变更 IP**：提前把 TTL 调短（如 60 秒），等全球缓存过期后改 IP，几分钟内全网生效。
2. **CDN 域名**：TTL 通常很短（如 60 秒），因为 CDN 节点 IP 会动态调度。
3. **根/顶级域**：TTL 很长（如 2 天），因为顶级服务器地址极少变。
4. **不要设 TTL=0**：TTL=0 不缓存，每次都递归解析，压力极大。最低建议 30-60 秒。

TTL 在 DNS 报文 Answer 段中是 4 字节整数，单位秒。

## 七、DNS 缓存与刷新

DNS 缓存分多层：浏览器缓存 → OS 缓存（nscd/systemd-resolved）→ 路由器缓存 → 运营商 DNS 缓存。每一层都按 TTL 缓存。

常见刷新操作：

- \`ipconfig /flushdns\`（Windows）、\`systemd-resolve --flush-caches\`（Linux）：清 OS 缓存。
- 浏览器：\`chrome://net-internals/#dns\` → Clear host cache。
- 运营商缓存改不了，只能等 TTL 过期，所以**改域名前先调短 TTL**。

## 八、DNS 安全增强：DoH / DoT / DNSSEC

传统 DNS 是明文传输，任何人（路由器、运营商、黑客）都能看到你查什么域名，还能篡改响应。这导致 DNS 劫持和隐私泄漏问题。三个增强方案：

### 8.1 DNS over HTTPS (DoH)

DNS 查询走 HTTPS（端口 443），加密传输，和正常网页流量混在一起。客户端如 Firefox、Chrome 默认开启 DoH（连 Cloudflare/Google 的 DoH 服务器）。优点：防劫持、防窥探、穿墙（HTTPS 流量难区分）。缺点：运营商失去 DNS 可见性，企业内容审计困难。

### 8.2 DNS over TLS (DoT)

DNS 查询走 TLS（端口 853），加密传输。和 DoH 区别：DoT 用专用端口 853，易被防火墙识别和封锁；DoH 走 443 难以区分。企业内网审计更倾向 DoT（能针对性放行/封锁），隐私优先用户倾向 DoH。

### 8.3 DNSSEC

DNSSEC 给 DNS 记录加数字签名，保证记录**未被篡改、来源可信**（防 DNS 投毒/劫持），但不加密（内容仍明文）。它通过签名的 RRSET 验证真实性。和 DoH/DoT 互补：DNSSEC 防篡改，DoH/DoT 防窃听。

## 九、常见 DNS 问题与攻击

### 9.1 DNS 劫持

运营商或攻击者把 \`www.example.com\` 解析到自己的 IP，引导用户到钓鱼站。早期运营商劫持 HTTP 站点插广告就是这个手段。防御：用 DoH/DoT、HSTS、DNSSEC。

### 9.2 DNS 污染（DNS Poisoning）

针对 DNS 查询的 UDP 包，攻击者抢在真实响应前发一个伪造响应（带正确的 Transaction ID），让递归解析器缓存错误记录。防御：DNSSEC、源端口随机化、0x20 编码（域名大小写随机）。

### 9.3 DNS Rebinding

攻击者控制一个域名，第一次解析返回合法 IP（让浏览器同源策略放行），第二次解析返回 \`127.0.0.1\` 或内网 IP，让浏览器 JS 访问到内网服务。防御：DNS 服务过滤私有 IP 回应、浏览器禁用公网域名解析到内网 IP。

### 9.4 NXDOMAIN 攻击

攻击者疯狂查询大量不存在的子域，让递归解析器缓存大量 NXDOMAIN，耗尽缓存击垮 DNS。防御：限速、NXDOMAIN 限流。

## 十、工作中常用场景

1. **本地 hosts 调试**：\`/etc/hosts\` 加 \`127.0.0.1 myapp.test\` 让本地访问域名走本地服务。
2. **dig 排查**：\`dig www.example.com\`、\`dig +trace\` 看完整迭代过程、\`dig MX example.com\` 查邮件记录、\`dig @8.8.8.8 domain\` 指定解析器。
3. **TTL 调整配合发版**：切换 IP 前把 TTL 调到 60 秒，发版后快速生效。
4. **CNAME 接 CDN**：把 \`static.example.com\` CNAME 到 CDN 提供商的域名。
5. **DNS 服务发现**：Kubernetes 用 CoreDNS 让 \`my-svc.my-namespace.svc.cluster.local\` 解析到 Service IP。
6. **分流配置**：国内/国外双线解析，国外走 Cloudflare，国内走阿里。

## 十一、常见陷阱与最佳实践

1. **CNAME 与根域冲突**：根域（@）不能配 CNAME（与 NS/MX 冲突），要用 ANAME/ALIAS（部分 DNS 商支持的扩展）或直接 A 记录。
2. **改了 IP 不生效**：TTL 没过。改前先调短 TTL。
3. **本地缓存误导**：dig 返回对了但浏览器还是旧 IP，是浏览器/OS 缓存，flush 一下。
4. **公共 DNS 不一致**：8.8.8.8 和 114 缓存可能不同步，灰度时多查几个解析器对比。
5. **反向 PTR 没配**：邮件被拒收，检查发信 IP 的 PTR 记录。
6. **DNSSEC 配错**：开启后若 DS 记录没正确链到上级，会导致域名解析全失败。

## 十二、面试要点

**Q1：讲讲 DNS 解析的完整过程。**
答：①浏览器缓存 → ②OS 缓存 → ③hosts → ④本地 DNS 服务器（递归解析器）缓存，命中即返回；未命中则递归解析器迭代查询：问根拿 TLD 地址、问 TLD 拿权威地址、问权威拿 A 记录，结果按 TTL 缓存后返回客户端。

**Q2：递归查询和迭代查询的区别？**
答：递归是被问服务器替你跑完整条链返回最终结果（客户端对本地 DNS）；迭代是被问服务器只指路不替跑，客户端逐级追问（本地 DNS 对根/TLD/权威）。

**Q3：DNS 用 UDP 还是 TCP？为什么？**
答：默认 UDP（端口 53），因为查询小、一问一答、省握手。当响应超 512 字节（如 DNSSEC）或 zone transfer（区域传送）时切 TCP。EDNS0 扩展把 UDP 上限提到 4096 字节。

**Q4：DNS 常见记录类型？**
答：A（IPv4）、AAAA（IPv6）、CNAME（别名）、MX（邮件，带优先级）、TXT（文本/验证）、NS（权威服务器）、SOA（区域起点）、PTR（反向解析）、SRV（服务）、CAA（证书授权）。CNAME 不能与 MX/NS 等共存于同一域名。

**Q5：DNS 劫持和污染怎么防？**
答：DNSSEC 防篡改（签名验证）；DoH/DoT 加密防窃听和劫持；HSTS 防降级；浏览器源端口随机化和 0x20 编码防污染投毒。

**Q6：TTL 设多少合适？**
答：稳定域名设长（1 小时到 1 天）减查询压力；CDN/灰度域名设短（60-300 秒）便于切换；改 IP 前先调短 TTL 等全球缓存过期再改。不建议 TTL=0。

## 十三、本章小结

1. DNS 是分布式层次数据库，根 → TLD → 二级域 → 主机名，逐级授权。
2. 查询过程：客户端缓存 → 本地 DNS（递归）→ 根/TLD/权威（迭代），结果按 TTL 缓存。
3. 递归 = 替你跑完；迭代 = 只指路。
4. 报文：Header(12) + Question + Answer，UDP 传输，超 512 切 TCP。
5. 记录类型：A/AAAA/CNAME/MX/TXT/NS/SOA/PTR/SRV/CAA。
6. TTL 控制缓存时长，长则省压力慢生效，短则快切换大压力。
7. 安全：DoH(443)/DoT(853) 加密，DNSSEC 防篡改。

下一章我们看 WebSocket，理解它如何突破 HTTP 单向通信实现实时双向推送。`,
    code: `# ============================================================
# 第一章代码演示：DNS 报文构造与解析
# ------------------------------------------------------------
# 演示内容：
#   1. 用 struct 手工构造 DNS 查询报文（Header + Question）
#   2. 解析 DNS 报文各字段（Transaction ID / Flags / 计数器）
#   3. 用 socket 起一个本地 UDP DNS server 模拟响应
#   4. 客户端发送查询、接收响应、解析 A 记录
# 不发真实外网 DNS 请求，全程 127.0.0.1 本地通信
# ============================================================
import socket
import struct
import threading
import time

print("=" * 60)
print("DNS 报文构造与解析演示")
print("=" * 60)

# ============================================================
# 1. 构造 DNS 查询报文
# ============================================================
def build_dns_query(domain, qtype=1):
    \"\"\"构造 DNS 查询报文：Header(12) + Question\"\"\"
    # ---- Header (12 字节) ----
    txn_id = 0x1234                 # 事务 ID，用于匹配请求/响应
    flags = 0x0100                  # RD=1，期望递归
    qdcount = 1                     # 问题数
    header = struct.pack("!HHHHHH", txn_id, flags, qdcount, 0, 0, 0)
    # ---- Question ----
    # 域名编码：长度前缀 + 标签 + 0 结束
    qname = b""
    for label in domain.split("."):
        qname += bytes([len(label)]) + label.encode("ascii")
    qname += b"\\x00"
    # QTYPE(2) + QCLASS(2)  class=IN=1
    question = qname + struct.pack("!HH", qtype, 1)
    return header + question

print("\\n[1] 构造 DNS 查询报文")
print("-" * 60)
query = build_dns_query("example.com")
print(f"查询域名: example.com  (A 记录)")
print(f"报文长度: {len(query)} 字节")
print(f"原始字节: {query.hex()}")

# 逐字段拆解 Header
fields = struct.unpack("!HHHHHH", query[:12])
names = ["TxnID", "Flags", "QDCOUNT", "ANCOUNT", "NSCOUNT", "ARCOUNT"]
print("\\nHeader 字段拆解:")
for n, v in zip(names, fields):
    print(f"  {n:10s} = 0x{v:04X} ({v})")
flags = fields[1]
print(f"\\nFlags 位拆解:")
print(f"  QR      = {(flags >> 15) & 1}   (0=查询)")
print(f"  Opcode  = {(flags >> 11) & 0xF} (0=标准查询)")
print(f"  RD      = {(flags >> 8) & 1}   (1=期望递归)")
print(f"  RCODE   = {flags & 0xF}   (响应码)")

# ============================================================
# 2. 解析 DNS 报文 Header
# ============================================================
def parse_dns_header(data):
    fields = struct.unpack("!HHHHHH", data[:12])
    names = ["TxnID", "Flags", "QDCOUNT", "ANCOUNT", "NSCOUNT", "ARCOUNT"]
    result = dict(zip(names, fields))
    flags = result["Flags"]
    result["QR"] = (flags >> 15) & 1
    result["Opcode"] = (flags >> 11) & 0xF
    result["AA"] = (flags >> 10) & 1
    result["TC"] = (flags >> 9) & 1
    result["RD"] = (flags >> 8) & 1
    result["RA"] = (flags >> 7) & 1
    result["RCODE"] = flags & 0xF
    return result

# ============================================================
# 3. 构造 DNS 响应（服务端）
# ============================================================
def make_dns_response(query, ip="93.184.216.34"):
    \"\"\"根据查询报文构造一个 A 记录响应\"\"\"
    qhdr = parse_dns_header(query)
    txn_id = qhdr["TxnID"]
    # 响应 Header: QR=1, RD=1, RA=1, RCODE=0
    flags = 0x8180
    header = struct.pack("!HHHHHH", txn_id, flags, 1, 1, 0, 0)
    # 回显 Question 段（找到 Question 结束位置）
    qname_end = query.index(b"\\x00", 12) + 1
    question = query[12:qname_end + 4]   # +4 = QTYPE(2) + QCLASS(2)
    # Answer 段：用指针压缩域名(0xC00C 指向偏移 12)
    # name(ptr) + TYPE(2) + CLASS(2) + TTL(4) + RDLENGTH(2) + RDATA(4)
    answer = struct.pack("!HHHIH", 0xC00C, 1, 1, 300, 4) + socket.inet_aton(ip)
    return header + question + answer

# ============================================================
# 4. 起一个本地 UDP DNS server
# ============================================================
print("\\n[2] 启动本地 DNS server（UDP，模拟权威/递归服务器）")
print("-" * 60)
server_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_sock.bind(("127.0.0.1", 0))
port = server_sock.getsockname()[1]
print(f"DNS server listen: 127.0.0.1:{port} (UDP)")

def serve_dns():
    server_sock.settimeout(3)
    while True:
        try:
            data, addr = server_sock.recvfrom(512)
        except socket.timeout:
            break
        print(f"  [server] 收到 DNS 查询 ({len(data)} 字节) 来自 {addr}")
        resp = make_dns_response(data)
        server_sock.sendto(resp, addr)
        print(f"  [server] 返回 DNS 响应 ({len(resp)} 字节) IP=93.184.216.34 TTL=300")

threading.Thread(target=serve_dns, daemon=True).start()
time.sleep(0.2)

# ============================================================
# 5. 客户端发查询、收响应、解析
# ============================================================
print("\\n[3] 客户端发送 DNS 查询并解析响应")
print("-" * 60)
client_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client_sock.settimeout(3)
client_sock.sendto(query, ("127.0.0.1", port))
print(f"  [client] 已发送查询到 127.0.0.1:{port}")

resp, _ = client_sock.recvfrom(512)
print(f"  [client] 收到响应 ({len(resp)} 字节)")
print(f"  原始字节: {resp.hex()}")

# 解析响应 Header
rh = parse_dns_header(resp)
print(f"\\n  响应 Header:")
print(f"    TxnID    = 0x{rh['TxnID']:04X} (应与请求一致: {'MATCH' if rh['TxnID']==0x1234 else 'MISMATCH'})")
print(f"    QR       = {rh['QR']} (1=响应)")
print(f"    RD       = {rh['RD']} (期望递归)")
print(f"    RA       = {rh['RA']} (支持递归)")
print(f"    RCODE    = {rh['RCODE']} (0=无错)")
print(f"    ANCOUNT  = {rh['ANCOUNT']} (回答数)")

# 解析 Answer 段
qname_end = resp.index(b"\\x00", 12) + 1
ans_offset = qname_end + 4   # 跳过 Question
name_ptr, qtype, qclass, ttl, rdlen = struct.unpack(
    "!HHHIH", resp[ans_offset:ans_offset + 12])
rdata = resp[ans_offset + 12:ans_offset + 12 + rdlen]
resolved_ip = socket.inet_ntoa(rdata)
print(f"\\n  Answer 段:")
print(f"    name指针 = 0x{name_ptr:04X} (指向偏移 12 的 Question 域名，压缩)")
print(f"    TYPE     = {qtype} (1=A 记录)")
print(f"    CLASS    = {qclass} (1=IN)")
print(f"    TTL      = {ttl} 秒")
print(f"    RDLENGTH = {rdlen} 字节")
print(f"    RDATA    = {resolved_ip} (IPv4 地址)")

client_sock.close()
server_sock.close()

print("\\n" + "=" * 60)
print("[小结]")
print("- DNS 报文 = Header(12字节) + Question + Answer + Authority + Additional")
print("- Header 含 TxnID/Flags/4 个计数器；Flags 含 QR/AA/RD/RA/RCODE")
print("- 域名编码：长度前缀+标签+0结束；Answer 用指针 0xC00C 压缩重复域名")
print("- UDP 传输，一问一答，TxnID 用于匹配请求与响应")
print("- 本 demo 模拟了完整的报文构造、服务端响应、客户端解析流程")
`,
  },

  // ============================================================
  // 第二章：WebSocket 实时通信
  // ============================================================
  {
    id: "net-websocket",
    title: "WebSocket 实时通信",
    icon: "🔌",
    group: "应用层协议",
    content: `## 一、为什么这一章重要

HTTP 是请求-响应模型——客户端问、服务端答，服务端不能主动推消息给客户端。但很多场景需要**实时双向通信**：聊天室、股票行情、在线协作编辑、游戏同步、实时通知。用 HTTP 实现这些会很别扭：要么轮询（不停问"有新消息吗"），要么长轮询。WebSocket 就是为这类场景而生，它在单个 TCP 连接上提供**全双工**通信，服务端能随时主动推数据。

理解 WebSocket 的握手过程、帧格式、opcode、心跳机制，是做实时系统、排查连接断开、选择技术方案的基础。这一章把 WebSocket 从诞生背景到帧编解码讲透，并用 Python 手动实现握手和帧的构造解析。

## 二、HTTP 的局限与实时通信方案对比

### 2.1 轮询（Polling）

客户端每隔 N 秒发一次 HTTP 请求问"有新消息吗"。简单但有明显缺陷：间隔短则服务器压力大、流量浪费；间隔长则消息延迟大。大多数请求是"没新消息"的空响应，纯浪费。

\`\`\`text
轮询：
  client: 有新消息吗?  server: 没有  (空响应)
  client: 有新消息吗?  server: 没有
  client: 有新消息吗?  server: 有! 给你
  每次都是完整的 HTTP 请求（头部开销大）
\`\`\`

### 2.2 长轮询（Long Polling）

客户端发请求，服务端**不立即响应**，而是 hold 住连接，直到有新消息或超时才返回。客户端收到响应后立刻再发一个请求。比普通轮询省请求次数、延迟更低。Facebook 早期聊天、Gmail 用过。

\`\`\`text
长轮询：
  client: 有新消息吗?  (请求挂起 30 秒)
  server: ... 等到有消息 ... 给你
  client: (立刻再问) 有新消息吗?
\`\`\`

缺点：每次还是要建立/复用 HTTP 连接、带完整头部、服务端要维护大量挂起连接。

### 2.3 SSE（Server-Sent Events）

服务端通过 HTTP 长连接**单向**推消息给客户端（只能服务端→客户端）。基于 HTTP，简单，浏览器原生支持 \`EventSource\`。适合服务端推送通知、股票行情。但不能客户端→服务端（客户端只能用普通 HTTP 请求）。

\`\`\`text
SSE:
  client: GET /stream  HTTP/1.1
  server: ... 一直保持连接，有数据就推一条 ...
  data: {msg: "hello"}
  data: {msg: "world"}
\`\`\`

### 2.4 WebSocket

在单个 TCP 连接上**全双工**通信，双方都能随时发数据。握手用 HTTP（借 HTTP Upgrade），之后切到 WebSocket 二进制帧协议，头部开销极小（2-14 字节），适合高频小消息。

| 方案 | 通信方向 | 连接 | 延迟 | 头部开销 | 适用 |
|------|---------|------|------|---------|------|
| 轮询 | 客户端发起 | 短/长 | 高（取决于间隔） | 大 | 兼容性好、低频 |
| 长轮询 | 客户端发起 | 长保持 | 中 | 中 | 早期实时 |
| SSE | 服务端→客户端 | 长保持 | 低 | 小 | 单向推送 |
| WebSocket | 双向全双工 | 长保持 | 极低 | 极小 | 双向实时 |

## 三、WebSocket 握手过程

WebSocket 复用 HTTP 协议完成握手，握手成功后"升级"成 WebSocket。客户端发一个带特殊头的 HTTP 请求：

\`\`\`text
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
\`\`\`

服务端同意升级，回 \`101 Switching Protocols\`：

\`\`\`text
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

关键头：

- \`Upgrade: websocket\` + \`Connection: Upgrade\`：HTTP 升级机制，告诉对方"我要把这个连接升级成别的协议"。
- \`Sec-WebSocket-Key\`：客户端生成的随机 base64 字符串（16 字节随机数的 base64），用于握手验证。
- \`Sec-WebSocket-Version: 13\`：协议版本，当前是 13。
- \`Sec-WebSocket-Accept\`：服务端用 Key 计算出的应答，证明自己懂 WebSocket。

握手后，TCP 连接不再传 HTTP 报文，改传 WebSocket 帧。

## 四、Sec-WebSocket-Accept 计算算法

这是 WebSocket 握手的核心校验，防止普通 HTTP 服务器误响应 WebSocket 请求。算法：

\`\`\`text
accept = base64( sha1( Sec-WebSocket-Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" ) )
\`\`\`

其中 \`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\` 是 RFC 6455 规定的固定 GUID。服务端把客户端的 Key 拼上这个 GUID，做 SHA-1，再 base64 编码，得到 Accept 值返回。客户端校验 Accept 是否正确，正确才认为握手成功。

为什么加 GUID？防止误用：只有真正实现了 WebSocket 的服务端才会按这个算法计算，普通 HTTP 服务器不会拼 GUID 做 SHA-1，所以不会误回 Accept。这是个简单的"协议彩蛋"校验，不是安全机制（GUID 是公开的）。

## 五、WebSocket 帧格式详解

握手后，数据以**帧（Frame）**为单位传输。帧格式：

\`\`\`text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|FIN|RSV1|RSV2|RSV3|   Opcode   |MASK|      Payload len         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Extended payload length（如果 len=126/127）              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Masking key（4 字节，如果 MASK=1）        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Payload 数据 ...                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
\`\`\`

逐字段：

| 字段 | 位数 | 含义 |
|------|------|------|
| FIN | 1 | 1=这是消息的最后一帧（消息可分多帧） |
| RSV1-3 | 3 | 保留，必须为 0（除非扩展如压缩） |
| Opcode | 4 | 帧类型（见下表） |
| MASK | 1 | 1=payload 被掩码（客户端发必须 1，服务端发必须 0） |
| Payload len | 7 | 0-125 直接是长度；126 表示后 2 字节是长度；127 表示后 8 字节是长度 |
| Masking key | 32 | 掩码密钥（MASK=1 时存在） |
| Payload | 变长 | 实际数据 |

### 5.1 Payload Length 编码

- 0-125：直接用 7 bit 表示长度。
- 126：7 bit 后跟 2 字节无符号整数表示长度（126-65535）。
- 127：7 bit 后跟 8 字节无符号整数表示长度（>65535）。

### 5.2 掩码（Masking）

**客户端发给服务端的帧必须掩码**，服务端发给客户端的帧不掩码。掩码用 4 字节随机 key，对 payload 逐字节异或：\`payload[i] ^= mask_key[i % 4]\`。解掩码用同样的异或（异或的自反性）。

为什么客户端要掩码？防止中间代理缓存中毒攻击（恶意客户端伪造未掩码数据欺骗老式代理）。服务端不掩码因为它是受信方。

## 六、Opcode 含义

Opcode 4 bit 决定帧类型：

| Opcode | 含义 | 说明 |
|--------|------|------|
| 0x0 | continuation | 分片帧的后续帧（FIN=0 的后续） |
| 0x1 | text | 文本帧（UTF-8） |
| 0x2 | binary | 二进制帧 |
| 0x8 | close | 关闭帧（可带状态码和原因） |
| 0x9 | ping | 心跳请求 |
| 0xA | pong | 心跳响应 |
| 0x3-7, B-F | 保留 | 未定义 |

关键点：

- **文本帧 0x1**：payload 是 UTF-8 文本，最常用。
- **二进制帧 0x2**：payload 是任意二进制，传文件/图片/Protobuf。
- **分片**：长消息可拆成多帧：第一帧 opcode=0x1/0x2 + FIN=0，中间帧 opcode=0x0 + FIN=0，最后帧 opcode=0x0 + FIN=1。接收方按顺序拼接。
- **关闭帧 0x8**：可带 2 字节状态码（1000 正常关闭、1001 离开、1002 协议错误、1003 不支持数据类型）+ 原因文本。
- **ping/pong 0x9/0xA**：心跳，维持连接活性。

## 七、心跳机制：ping/pong

WebSocket 连接长时间无数据，中间 NAT/防火墙可能清除连接表项导致"假死"。心跳机制定时发 ping/pong 维持活性：

\`\`\`text
client --ping-->  server
client <--pong--  server
\`\`\`

任意一方可发 ping，对方必须尽快回 pong。如果多次 ping 没收到 pong，认为连接已断，主动关闭。浏览器原生 WebSocket API 不暴露 ping/pong（由浏览器自动处理），但服务端库（如 Python websockets、Node ws）可手动控制。

典型心跳间隔：30-60 秒。太短费流量，太长来不及发现断连。

## 八、WebSocket vs HTTP/2 Server Push vs SSE

三者都能"服务端推"，区别：

| 维度 | WebSocket | HTTP/2 Server Push | SSE |
|------|-----------|-------------------|-----|
| 方向 | 全双工 | 服务端→客户端 | 服务端→客户端 |
| 协议 | WebSocket（基于 TCP） | HTTP/2（基于 TCP） | HTTP/1.1+ |
| 帧格式 | 二进制帧 | HTTP/2 帧 | 文本（\`data:\` 行） |
| 二进制 | 支持 | 支持 | 仅文本（需 base64） |
| 状态 | 有状态 | 无状态（HTTP 语义） | 无状态 |
| 兼容性 | 需 WebSocket 支持 | 需 HTTP/2（已普遍） | 浏览器原生 EventSource |
| 现状 | 实时双向主流 | HTTP/2 Push 已被 Chrome 移除 | 单向推送仍常用 |

注意：**HTTP/2 Server Push 和 WebSocket 不是一回事**。HTTP/2 Push 是服务端在客户端请求 HTML 时主动推关联资源（CSS/JS），仍是 HTTP 请求-响应语义，连接用完即关。它**不是**双向通信，且 Chrome 已移除该特性。WebSocket 是真正的全双工长连接。

## 九、应用场景

1. **聊天/IM**：微信网页版、Slack、Discord 都用 WebSocket。
2. **实时通知**：站内信、订单状态更新、运维告警。
3. **协作编辑**：Google Docs、Figma、腾讯文档多人光标同步。
4. **股票/币种行情**：高频推送价格波动。
5. **在线游戏**：玩家位置/动作同步（部分用 UDP/WebRTC）。
6. **直播弹幕**：B 站、YouTube 弹幕推送。
7. **协同画板/白板**：实时同步绘制。

## 十、工作中常用场景

1. **Nginx 代理 WebSocket**：WebSocket 是长连接，Nginx 代理要配 \`proxy_http_version 1.1\` + \`Upgrade\` + \`Connection\` 头透传：
   \`\`\`text
   location /ws {
       proxy_pass http://backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_read_timeout 3600s;
   }
   \`\`\`
   \`proxy_read_timeout\` 要调长，否则长连接空闲被 Nginx 断开。

2. **负载均衡**：WebSocket 是有状态长连接，不能用轮询负载均衡切换实例（会断连）。用 IP hash 或 sticky session 让同一客户端固定连到同一后端。

3. **心跳调优**：服务端设 30-60 秒 ping，超时无 pong 关连接释放资源。

4. **连接数控制**：单服务端能撑的 WebSocket 连接数有限（每连接占内存/fd），大规模要分布式（如每节点 5 万连接，多节点 + 消息总线 Redis Pub/Sub 跨节点转发）。

5. **断线重连**：客户端实现指数退避重连，重连后重新订阅频道恢复状态。

## 十一、常见陷阱与最佳实践

1. **忘记透传 Upgrade 头**：Nginx 代理 WebSocket 没配 \`Connection: upgrade\`，握手失败。这是最常见坑。
2. **用 WebSocket 当 HTTP 用**：偶尔发一次请求用 WebSocket 是过度设计，HTTP 更合适。WebSocket 适合高频双向。
3. **不处理心跳**：长连接假死发现不了，加 ping/pong。
4. **客户端不掩码**：自己手撸 WebSocket 客户端必须掩码，否则服务端拒绝。
5. **消息无边界处理**：WebSocket 帧可能分片，接收方要按 FIN 拼接完整消息再处理。
6. **不限制消息大小**：客户端发超大帧可能 OOM，服务端要限制单帧/单消息上限。
7. **wss 未启用**：生产必须用 \`wss://\`（WebSocket over TLS），否则明文易被劫持。

## 十二、面试要点

**Q1：WebSocket 和 HTTP 的区别？为什么需要 WebSocket？**
答：HTTP 是请求-响应、服务端不能主动推；WebSocket 是全双工长连接，双方随时发数据。实时场景（聊天/行情）用 HTTP 要轮询浪费大，WebSocket 头部小（2-14 字节）延迟低。WebSocket 握手借 HTTP（Upgrade），之后切帧协议。

**Q2：WebSocket 握手过程？Sec-WebSocket-Accept 怎么算？**
答：客户端发 HTTP GET 带 \`Upgrade: websocket\`、\`Sec-WebSocket-Key\`（随机 base64）。服务端回 \`101\` + \`Sec-WebSocket-Accept\`。Accept = \`base64(sha1(Key + 固定GUID))\`，GUID 是 \`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\`。客户端校验 Accept 正确才认为握手成功。

**Q3：WebSocket 帧结构？opcode 含义？**
答：帧含 FIN/RSV(3)/Opcode(4)/MASK/PayloadLen/MaskingKey/Payload。PayloadLen：0-125 直接，126 后跟 2 字节长度，127 后跟 8 字节。Opcode：0x0 分片续帧、0x1 文本、0x2 二进制、0x8 关闭、0x9 ping、0xA pong。客户端发必须掩码，服务端发不掩码。

**Q4：为什么客户端发要掩码，服务端发不用？**
答：防止中间老式代理缓存中毒攻击——恶意客户端构造未掩码数据欺骗代理。强制客户端掩码杜绝此攻击。服务端是受信方，不掩码省开销。

**Q5：WebSocket 心跳是什么？为什么需要？**
答：ping/pong 帧维持长连接活性。NAT/防火墙会清除空闲连接表项导致假死，定时 ping（30-60 秒）让对方回 pong，多次无响应则判定断开。浏览器自动处理 ping/pong，服务端库可手动控制。

**Q6：WebSocket 和 SSE 怎么选？**
答：需要双向实时用 WebSocket（聊天、协作）。只需服务端→客户端单向推送用 SSE（更简单，基于 HTTP，浏览器原生 EventSource，自动重连）。

**Q7：Nginx 代理 WebSocket 要注意什么？**
答：必须 \`proxy_http_version 1.1\` 并透传 \`Upgrade\`/\`Connection\` 头，否则握手失败。\`proxy_read_timeout\` 要调长（默认 60 秒会断长连接）。负载均衡用 IP hash 避免长连接被切到不同实例。

## 十三、本章小结

1. HTTP 单向请求-响应，实时场景用轮询/长轮询/SSE/WebSocket，WebSocket 全双工最优。
2. 握手借 HTTP Upgrade，Accept = base64(sha1(Key+GUID))。
3. 帧格式：FIN/Opcode/MASK/PayloadLen/MaskingKey/Payload，PayloadLen 三档编码。
4. Opcode：0x1 文本、0x2 二进制、0x8 关闭、0x9 ping、0xA pong、0x0 分片续。
5. 客户端发必须掩码（异或 4 字节 key），服务端发不掩码。
6. 心跳 ping/pong 维持长连接，发现假死。
7. 生产用 wss、Nginx 透传 Upgrade、限制消息大小、实现断线重连。

下一章我们看跨域、CORS、CSRF 这三个前端安全核心概念。`,
    code: `# ============================================================
# 第二章代码演示：WebSocket 握手与帧编解码
# ------------------------------------------------------------
# 演示内容：
#   1. 手动计算 Sec-WebSocket-Accept（sha1 + base64）
#   2. 手动构造 WebSocket 帧（struct 打包 FIN/opcode/mask/payload）
#   3. 手动解析 WebSocket 帧（解包提取 payload）
#   4. 用 socket 起原始 TCP server 模拟 WebSocket 握手 + 帧收发
# 不实现完整 WebSocket 库，只演示核心算法
# ============================================================
import hashlib
import base64
import os
import socket
import struct
import re
import threading
import time

print("=" * 60)
print("WebSocket 握手与帧编解码演示")
print("=" * 60)

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

# ============================================================
# 1. 计算 Sec-WebSocket-Accept
# ============================================================
def compute_accept(client_key):
    \"\"\"accept = base64( sha1( key + GUID ) )\"\"\"
    combined = (client_key + GUID).encode("ascii")
    sha1_digest = hashlib.sha1(combined).digest()
    return base64.b64encode(sha1_digest).decode("ascii")

print("\\n[1] Sec-WebSocket-Accept 计算")
print("-" * 60)
# RFC 6455 官方测试向量
test_key = "dGhlIHNhbXBsZSBub25jZQ=="
expected = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
got = compute_accept(test_key)
print(f"  客户端 Key : {test_key}")
print(f"  GUID       : {GUID}")
print(f"  SHA1       : {hashlib.sha1((test_key+GUID).encode()).hexdigest()}")
print(f"  Accept     : {got}")
print(f"  期望       : {expected}")
print(f"  校验       : {'PASS' if got == expected else 'FAIL'}")

# 随机生成一个 key
rand_key = base64.b64encode(os.urandom(16)).decode("ascii")
rand_accept = compute_accept(rand_key)
print(f"\\n  随机 Key   : {rand_key}")
print(f"  对应 Accept: {rand_accept}")

# ============================================================
# 2. 构造 WebSocket 帧（客户端发，必须 mask）
# ============================================================
def build_frame(payload, opcode=0x1):
    \"\"\"构造客户端发送的 WebSocket 帧（带掩码）\"\"\"
    fin = 1
    mask = 1
    b0 = (fin << 7) | opcode
    length = len(payload)
    mask_key = os.urandom(4)
    # 掩码：payload 每字节异或 mask_key[i%4]
    masked = bytearray(payload)
    for i in range(len(masked)):
        masked[i] ^= mask_key[i % 4]
    if length < 126:
        header = struct.pack("!BB", b0, (mask << 7) | length)
    elif length < 65536:
        header = struct.pack("!BBH", b0, (mask << 7) | 126, length)
    else:
        header = struct.pack("!BBQ", b0, (mask << 7) | 127, length)
    return header + mask_key + bytes(masked)

# ============================================================
# 3. 解析 WebSocket 帧
# ============================================================
def parse_frame(data):
    \"\"\"解析 WebSocket 帧，返回 fin/opcode/masked/payload\"\"\"
    b0, b1 = data[0], data[1]
    fin = (b0 >> 7) & 1
    opcode = b0 & 0x0F
    masked = (b1 >> 7) & 1
    length = b1 & 0x7F
    idx = 2
    if length == 126:
        length = struct.unpack("!H", data[idx:idx + 2])[0]
        idx += 2
    elif length == 127:
        length = struct.unpack("!Q", data[idx:idx + 8])[0]
        idx += 8
    if masked:
        # MASK=1 时帧中才有 4 字节 masking-key（客户端发的帧必须掩码）
        mask_key = data[idx:idx + 4]
        idx += 4
        payload = bytearray(data[idx:idx + length])
        for i in range(len(payload)):
            payload[i] ^= mask_key[i % 4]
    else:
        # MASK=0 时帧中没有 masking-key 字段，服务端发的帧即如此
        payload = bytearray(data[idx:idx + length])
    return {"fin": fin, "opcode": opcode, "masked": masked, "payload": bytes(payload)}

# ---- 演示帧的构造与解析（环回测试）----
print("\\n[2] 帧的构造与解析（环回测试）")
print("-" * 60)

# 文本帧
msg = "Hello WebSocket"
frame = build_frame(msg.encode("utf-8"), opcode=0x1)
parsed = parse_frame(frame)
print(f"  文本帧 payload={msg!r}")
print(f"    原始字节: {frame.hex()}")
print(f"    解析: fin={parsed['fin']} opcode=0x{parsed['opcode']:X} masked={parsed['masked']}")
print(f"    还原 payload: {parsed['payload'].decode('utf-8')}  {'OK' if parsed['payload']==msg.encode() else 'FAIL'}")

# 二进制帧
bin_data = bytes(range(20))
bframe = build_frame(bin_data, opcode=0x2)
bparsed = parse_frame(bframe)
print(f"\\n  二进制帧 opcode=0x{bparsed['opcode']:X} len={len(bparsed['payload'])}")
print(f"    还原: {'OK' if bparsed['payload']==bin_data else 'FAIL'}")

# 关闭帧 / ping / pong
for name, op in [("close", 0x8), ("ping", 0x9), ("pong", 0xA)]:
    f = build_frame(b"hi", opcode=op)
    p = parse_frame(f)
    print(f"  {name:6s}帧 opcode=0x{p['opcode']:X} payload={p['payload']!r}")

# 长消息（触发 126 扩展长度）
long_msg = ("X" * 200).encode()
lframe = build_frame(long_msg, opcode=0x1)
lparsed = parse_frame(lframe)
print(f"\\n  长消息 200 字节 -> 触发扩展长度字段")
print(f"    帧总长 {len(lframe)} 字节，解析 payload 长度 {len(lparsed['payload'])}")
print(f"    还原: {'OK' if lparsed['payload']==long_msg else 'FAIL'}")

# ============================================================
# 4. 起一个原始 TCP server 模拟 WebSocket 握手 + 帧通信
# ============================================================
print("\\n[3] 模拟 WebSocket 握手与帧通信（本地 TCP）")
print("-" * 60)

srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(("127.0.0.1", 0))
srv.listen(1)
port = srv.getsockname()[1]
print(f"  WebSocket server listen: ws://127.0.0.1:{port}")

def ws_server():
    conn, _ = srv.accept()
    conn.settimeout(3)
    # ---- 读握手请求 ----
    req = conn.recv(1024).decode("latin-1")
    key = re.search(r"Sec-WebSocket-Key: (\\S+)", req).group(1)
    print(f"  [server] 收到握手 Key={key}")
    # ---- 回握手响应 ----
    accept_val = compute_accept(key)
    resp = (
        "HTTP/1.1 101 Switching Protocols\\r\\n"
        "Upgrade: websocket\\r\\n"
        "Connection: Upgrade\\r\\n"
        f"Sec-WebSocket-Accept: {accept_val}\\r\\n\\r\\n"
    )
    conn.sendall(resp.encode("latin-1"))
    print(f"  [server] 返回 101 + Accept={accept_val}")
    # ---- 服务端发一个文本帧（不掩码）----
    welcome = "welcome from server".encode("utf-8")
    # FIN=1, opcode=0x1, MASK=0, len=...
    server_frame = struct.pack("!BB", 0x81, len(welcome)) + welcome
    conn.sendall(server_frame)
    # ---- 读客户端帧 ----
    data = conn.recv(1024)
    parsed = parse_frame(data)
    print(f"  [server] 收到客户端帧: {parsed['payload'].decode('utf-8')} (opcode=0x{parsed['opcode']:X})")
    conn.close()

threading.Thread(target=ws_server, daemon=True).start()
time.sleep(0.2)

# ---- 客户端 ----
cli = socket.create_connection(("127.0.0.1", port), timeout=5)
client_key = base64.b64encode(os.urandom(16)).decode("ascii")
handshake = (
    "GET /chat HTTP/1.1\\r\\n"
    "Host: 127.0.0.1\\r\\n"
    "Upgrade: websocket\\r\\n"
    "Connection: Upgrade\\r\\n"
    f"Sec-WebSocket-Key: {client_key}\\r\\n"
    "Sec-WebSocket-Version: 13\\r\\n\\r\\n"
)
cli.sendall(handshake.encode("latin-1"))
print(f"  [client] 发送握手 Key={client_key}")

# 读握手响应（TCP 是字节流：握手响应和帧可能粘在一次 recv 里）
buf = b""
while b"\\r\\n\\r\\n" not in buf:
    chunk = cli.recv(1024)
    if not chunk:
        break
    buf += chunk
# 把 HTTP 响应和帧字节分开：\\r\\n\\r\\n 之后若有字节即帧起始
sep = buf.find(b"\\r\\n\\r\\n") + 4
resp = buf[:sep].decode("latin-1")
frame_bytes = buf[sep:]
print(f"  [client] 握手响应:")
for line in resp.strip().split("\\r\\n"):
    print(f"    {line}")
server_accept = re.search(r"Sec-WebSocket-Accept: (\\S+)", resp).group(1)
expected_accept = compute_accept(client_key)
print(f"  [client] 校验 Accept: {'PASS' if server_accept == expected_accept else 'FAIL'}")

# 读服务端帧（frame_bytes 可能已含部分帧，循环读直到帧完整）
data = frame_bytes
while len(data) < 2:
    data += cli.recv(1024)
b1 = data[1]
pl = b1 & 0x7F
extra = 2 if pl == 126 else 8 if pl == 127 else 0
need = 2 + extra
while len(data) < need:
    data += cli.recv(1024)
parsed = parse_frame(data)
print(f"  [client] 收到服务端帧: {parsed['payload'].decode('utf-8')} (opcode=0x{parsed['opcode']:X})")

# 客户端发帧给服务端
client_frame = build_frame("hi from client".encode("utf-8"), opcode=0x1)
cli.sendall(client_frame)
print(f"  [client] 已发送文本帧 'hi from client'")
time.sleep(0.3)
cli.close()

print("\\n" + "=" * 60)
print("[小结]")
print("- 握手: HTTP Upgrade + Sec-WebSocket-Key -> Sec-WebSocket-Accept")
print("- Accept = base64(sha1(Key + GUID))")
print("- 帧: FIN|opcode|MASK|payload_len|mask_key|masked_payload")
print("- opcode: 0x1文本 0x2二进制 0x8关闭 0x9ping 0xApong")
print("- 客户端发必须掩码(异或4字节key), 服务端发不掩码")
print("- payload_len: <126直接, 126后2字节, 127后8字节")
`,
  },

  // ============================================================
  // 第三章：跨域、CORS、CSRF 安全
  // ============================================================
  {
    id: "net-cors-csrf",
    title: "跨域、CORS、CSRF 安全",
    icon: "🛡️",
    group: "应用层协议",
    content: `## 一、为什么这一章重要

"跨域"是前端开发碰到最多的报错之一——调一个接口浏览器报 \`No 'Access-Control-Allow-Origin' header\`，新手一头雾水。而 CSRF（跨站请求伪造）是 Top 10 Web 安全漏洞之一，曾导致大量银行转账被盗刷。这两个概念都和"同源策略"紧密相关，但很多人分不清 CORS 和 CSRF 的关系：CORS 是浏览器**放松**同源策略的机制，CSRF 是**利用**浏览器自动带 Cookie 的特性发起攻击。

这一章把同源策略、跨域场景、CORS 预检、CSRF 原理与防御讲透，让你能在面试中答清两者关系，也能在线上跨域报错时快速定位是预检没配还是凭证没带。

## 二、同源策略

### 2.1 什么是"源"（Origin）

一个源由三部分组成：**协议（scheme）+ 主机（host）+ 端口（port）**。三者完全相同才是同源，任一不同即跨域。

\`\`\`text
源 = scheme://host:port

https://www.example.com:443/page
└─┬─┘   └────┬─────┘ └┬┘
scheme       host      port
\`\`\`

跨域判定示例（以 \`http://www.example.com\` 为基准）：

| URL | 是否同源 | 原因 |
|-----|---------|------|
| \`http://www.example.com/a\` | ✅ 同源 | 仅路径不同 |
| \`https://www.example.com\` | ❌ 跨域 | 协议不同（https vs http） |
| \`http://api.example.com\` | ❌ 跨域 | 主机不同（子域也算不同） |
| \`http://www.example.com:8080\` | ❌ 跨域 | 端口不同 |
| \`http://example.com\` | ❌ 跨域 | www 子域不同 |

注意：**IP 和域名不同源**（\`http://127.0.0.1\` 和 \`http://localhost\` 跨域，即使解析到同一 IP）。**子域不同就跨域**（\`a.example.com\` 和 \`b.example.com\` 跨域）。

### 2.2 为什么需要同源策略

同源策略是浏览器的**核心安全机制**，防止恶意网站读取/操作其他网站的数据。没有它，你打开 \`evil.com\`，它的 JS 就能：

- 用 \`fetch\` 请求你的银行接口（浏览器自动带你的 Cookie），读取余额。
- 用 \`XMLHttpRequest\` 读你已登录的邮箱页面内容。
- 操作 \`iframe\` 里其他网站的 DOM。

同源策略限制三类行为：

1. **跨源 DOM 访问**：\`iframe\`、\`window.open\` 打开的跨源页面，不能读其 DOM（\`document\`）。
2. **跨源 Cookie/Storage 访问**：跨源不能读对方 Cookie、localStorage、sessionStorage（Cookie 可设 Domain 共享子域，但默认隔离）。
3. **跨源网络请求**：JS 发跨源请求受 CORS 限制（见下）。

但同源策略**不阻止发请求**，只阻止**读响应**。这就是 CSRF 能成立的基础——请求发出去了，Cookie 也带了，只是 JS 读不到响应。后面会讲。

## 三、CORS 机制详解

CORS（Cross-Origin Resource Sharing，跨源资源共享）是浏览器**放松同源策略**的标准机制，让服务端能声明"允许哪些源访问我"。分两种请求：简单请求和预检请求。

### 3.1 简单请求（Simple Request）

满足以下条件的跨源请求，浏览器**直接发**，不预检：

- 方法：GET / HEAD / POST
- 自定义头仅限：Accept、Accept-Language、Content-Language、Content-Type
- Content-Type 仅限：\`application/x-www-form-urlencoded\`、\`multipart/form-data\`、\`text/plain\`
- 不使用 \`XMLHttpRequest.upload\` 监听
- 不读 ReadableStream

请求发出时浏览器带 \`Origin\` 头，服务端响应带 \`Access-Control-Allow-Origin\`。浏览器检查通过才把响应交给 JS。

\`\`\`text
简单请求流程：
  浏览器 → GET /api (Origin: http://a.com) → 服务端
  浏览器 ← 200 + Access-Control-Allow-Origin: http://a.com ← 服务端
  浏览器检查 Allow-Origin 匹配 Origin? 是 → 把响应交给 JS; 否 → 拦截，JS 报错
\`\`\`

### 3.2 预检请求（Preflight Request）

不满足简单请求条件的（如 PUT/DELETE 方法、\`Content-Type: application/json\`、带自定义头 \`X-Token\`），浏览器会**先发一个 OPTIONS 请求**预检，问服务端"我能不能这么发"。服务端同意后浏览器才发真实请求。

\`\`\`text
预检流程：
  1. 浏览器 → OPTIONS /api (预检)
       Origin: http://a.com
       Access-Control-Request-Method: PUT
       Access-Control-Request-Headers: Content-Type, X-Token
  2. 服务端 ← 200/204 + CORS 响应头
       Access-Control-Allow-Origin: http://a.com
       Access-Control-Allow-Methods: GET, POST, PUT, DELETE
       Access-Control-Allow-Headers: Content-Type, X-Token
       Access-Control-Max-Age: 86400
  3. 预检通过，浏览器发真实请求
     浏览器 → PUT /api (Origin: http://a.com, Content-Type: application/json, X-Token: ...)
  4. 服务端 ← 200 + Allow-Origin
\`\`\`

为什么要预检？因为非简单请求（如 PUT、自定义头）可能是"危险"操作，浏览器要**先确认服务端愿意接受**，避免直接发出去造成副作用（如 PUT 改了数据）。预检是浏览器的保护机制，**对服务端是额外的一次 OPTIONS 请求**。

### 3.3 CORS 响应头详解

| 响应头 | 作用 |
|--------|------|
| \`Access-Control-Allow-Origin\` | 允许的源（精确域名或 \`*\`；带凭证时不能 \`*\`） |
| \`Access-Control-Allow-Methods\` | 允许的方法（预检响应） |
| \`Access-Control-Allow-Headers\` | 允许的请求头（预检响应） |
| \`Access-Control-Allow-Credentials\` | 是否允许带 Cookie（\`true\`） |
| \`Access-Control-Expose-Headers\` | 允许 JS 读的额外响应头 |
| \`Access-Control-Max-Age\` | 预检结果缓存时间（秒），期内不再预检 |

关键细节：

- \`Allow-Origin: *\` 表示允许任意源，但**与凭证请求互斥**——带 Cookie 时不能用 \`*\`，必须精确指定源。
- \`Allow-Credentials: true\` 时，\`Allow-Origin\` 必须是具体域名（不能 \`*\`），否则浏览器拒绝。
- \`Max-Age\` 让预检结果缓存（如 86400 秒 = 1 天），期内同源同方法的请求不再发 OPTIONS，减少开销。

### 3.4 CORS 凭证请求（带 Cookie）

默认跨源请求**不带 Cookie**。要让跨源请求带 Cookie：

1. 客户端：\`fetch(url, { credentials: 'include' })\` 或 \`xhr.withCredentials = true\`。
2. 服务端：响应 \`Access-Control-Allow-Credentials: true\`。
3. 服务端：\`Allow-Origin\` 不能是 \`*\`，必须是精确源。

\`\`\`text
凭证请求：
  fetch('https://api.com/me', { credentials: 'include' })
  → Cookie: sid=xxx 自动带（前提 Allow-Credentials: true 且 Allow-Origin 精确）
\`\`\`

漏配任何一项，Cookie 都不会带或浏览器拦截响应。

## 四、CSRF 攻击原理

CSRF（Cross-Site Request Forgery，跨站请求伪造）——攻击者诱导已登录用户访问恶意页面，恶意页面的 JS/HTML 利用**浏览器自动带 Cookie**的特性，以用户身份发起请求。

### 4.1 攻击流程

\`\`\`text
1. 用户在 bank.com 登录，浏览器存了 bank.com 的 Cookie (sid=xxx)
2. 用户被诱导访问 evil.com
3. evil.com 页面里有:
   <img src="http://bank.com/transfer?to=hacker&amount=1000">
   或 <form action="http://bank.com/transfer" method="POST"> ... </form>
   或 fetch('http://bank.com/transfer', {method:'POST'})  (简单请求会发)
4. 浏览器发请求到 bank.com，自动带上 bank.com 的 Cookie!
5. bank.com 以为是用户本人操作，执行转账
\`\`\`

关键：CSRF 利用了"浏览器对同源请求自动带 Cookie"的特性。攻击者不需要偷 Cookie，**浏览器自己就把 Cookie 带上了**。

### 4.2 为什么 GET 请求危险

如果转账接口是 GET \`/transfer?to=x&amount=1000\`，攻击者用 \`<img src=...>\` 就能触发——浏览器加载图片会发 GET 请求带 Cookie。所以**写操作必须用 POST/PUT/DELETE，绝不能用 GET**。即便如此，POST 也能被 \`<form>\` 构造（form 提交跨源是允许的，只是 JS 读不到响应）。

### 4.3 CSRF vs CORS 的关系

这是面试高频混淆点，务必分清：

- **CORS 是浏览器放松同源策略的机制**：让服务端声明"允许哪些源跨域访问"。CORS 主要限制 **JS 读跨源响应**。
- **CSRF 是利用浏览器自动带 Cookie 的攻击**：CSRF 不需要读响应，只要请求发出去（Cookie 带上）就够了。

关键洞察：**CORS 不能防 CSRF**。因为 CSRF 攻击中，请求是浏览器原生发起的（form 提交、img 加载），不经过 JS，CORS 不管这些。CORS 只管 JS 发的 \`fetch\`/\`XHR\`。所以即便服务端配了 CORS 限制，恶意站点的 form 提交照样发出去、Cookie 照样带。

CSRF 的防御要靠别的机制。

## 五、CSRF 防御

### 5.1 CSRF Token（最经典）

服务端为每个会话生成一个随机 Token，嵌入表单隐藏字段或响应头。提交时客户端带 Token，服务端校验。

\`\`\`text
1. GET /form -> 服务端生成 csrf_token, 返回表单 + <input type="hidden" name="csrf" value="TOKEN">
2. POST /submit (带 csrf=TOKEN) -> 服务端校验 token 是否匹配 session 里的
3. evil.com 无法读到 bank.com 的 token（同源策略阻止读响应），所以伪造不了
\`\`\`

为什么有效？因为攻击者的 evil.com 页面虽然能发请求到 bank.com（带 Cookie），但它**读不到 bank.com 返回的 token**（同源策略阻止 JS 读跨源响应）。没有正确 token 就被拒。

实现方式：双重 Cookie、Synchronizer Token（session 存 token）、JWT 中带 token。

### 5.2 SameSite Cookie（现代首选）

给 Cookie 设 \`SameSite\` 属性，限制跨站请求是否带 Cookie：

| 值 | 行为 |
|----|------|
| \`Strict\` | 完全不带 Cookie 给跨站请求（即使点链接过来也不带，最严） |
| \`Lax\` | 顶层导航的 GET 请求带 Cookie（如点链接），其他不带（默认值，Chrome 80+） |
| \`None\` | 任意跨站都带（必须同时 \`Secure\`，仅 HTTPS） |

\`\`\`text
Set-Cookie: sid=xxx; SameSite=Lax
\`\`\`

CSRF 攻击（evil.com 发请求到 bank.com）是跨站请求，\`SameSite=Strict/Lax\` 会阻止带 Cookie，攻击失效。**这是现代浏览器默认开启的 CSRF 防御**，Chrome 把默认值从 \`None\` 改成 \`Lax\` 后大幅降低了 CSRF 风险。

### 5.3 Referer / Origin 校验

服务端检查请求头 \`Referer\` 或 \`Origin\` 是否来自合法源。CSRF 攻击的请求 \`Origin\` 是 evil.com，校验不通过即拒绝。

\`\`\`text
Origin: https://evil.com  -> 拒绝
Origin: https://bank.com   -> 放行
\`\`\`

缺点：Referer 可能被浏览器策略去掉（隐私设置），不能完全依赖。作为辅助防御。

### 5.4 三种防御对比

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| CSRF Token | 服务端发 token，提交校验 | 最可靠 | 实现复杂，要前端配合 |
| SameSite Cookie | 限制跨站带 Cookie | 简单，浏览器自动 | 老浏览器不支持，影响合法跨站 |
| Referer 校验 | 检查来源 | 简单 | Referer 可缺失，可伪造（部分场景） |

最佳实践：**SameSite=Lax（默认）+ CSRF Token（敏感操作）** 双重保险。

## 六、常见跨域错误排查

### 6.1 \`No 'Access-Control-Allow-Origin' header\`

服务端没返回 \`Allow-Origin\`，或返回的源和请求 \`Origin\` 不匹配。检查后端 CORS 中间件配置。

### 6.2 预检失败 \`CORS preflight\`

OPTIONS 请求被服务端拒绝（返回 4xx）或没回 CORS 头。检查：服务端是否处理 OPTIONS 方法、是否回了 \`Allow-Methods\`/\`Allow-Headers\`。

### 6.3 带凭证时被拒

\`credentials: 'include'\` 但服务端 \`Allow-Origin: *\`，浏览器拒。改成精确源 + \`Allow-Credentials: true\`。

### 6.4 Cookie 不带

跨源请求默认不带 Cookie。要 \`credentials: 'include'\` + 服务端 \`Allow-Credentials: true\` + \`Allow-Origin\` 精确。还要 Cookie 设了正确的 \`Domain\`/\`Path\`。

### 6.5 自定义头被拒

带了 \`X-Token\` 头但 \`Allow-Headers\` 没声明，预检失败。把 \`X-Token\` 加进 \`Allow-Headers\`。

## 七、工作中常用场景

1. **后端 CORS 中间件**：FastAPI/Express/Koa 都有 CORS 中间件，配允许的源、方法、头、凭证。
   \`\`\`text
   FastAPI: CORSMiddleware(allow_origins=["https://a.com"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
   \`\`\`

2. **Nginx 加 CORS 头**：静态资源或代理后端统一加。
   \`\`\`text
   add_header Access-Control-Allow-Origin $http_origin always;
   \`\`\`

3. **预检缓存**：设 \`Access-Control-Max-Age: 86400\` 减少 OPTIONS 请求。

4. **Cookie 跨子域**：\`Domain=.example.com\` 让 a.example.com 和 b.example.com 共享 Cookie（注意前导点）。

5. **CSRF Token 中间件**：Django/Express 都有，自动给表单注入 token。

6. **生产用 \`SameSite=Lax\`**：现代浏览器默认，敏感操作加 token。

## 八、常见陷阱与最佳实践

1. **\`Allow-Origin: *\` + 凭证**：互斥，浏览器拒。带 Cookie 必须精确源。
2. **以为 CORS 防 CSRF**：CORS 只管 JS 读响应，CSRF 是 form/img 发请求，CORS 管不到。CSRF 要靠 token/SameSite。
3. **OPTIONS 没处理**：很多框架 OPTIONS 默认不路由，要单独处理或开中间件。
4. **\`Allow-Origin\` 多个源**：不能写多个（\`a.com b.com\` 非法）。要后端根据 \`Origin\` 动态回单个匹配的源。
5. **CSRF Token 放 Cookie 又读 Cookie**：双重 Cookie 模式 token 要可读，不能 HttpOnly。
6. **GET 做写操作**：CSRF 一发就中。写操作必须 POST/PUT/DELETE。
7. **Referer 校验漏掉空值**：有些请求没 Referer（直接访问），要么放行要么拒，要明确策略。

## 九、面试要点

**Q1：什么是同源策略？源由什么决定？**
答：同源策略是浏览器核心安全机制，限制跨源 DOM/Cookie/网络请求的读取。源 = 协议+主机+端口，三者全同才同源。子域不同、端口不同、协议不同都算跨域。

**Q2：CORS 简单请求和预检请求的区别？什么时候预检？**
答：简单请求是 GET/HEAD/POST 且头/Content-Type 受限，浏览器直接发。预检是方法非简单（PUT/DELETE）或带自定义头/json Content-Type 时，浏览器先发 OPTIONS 询问服务端是否允许。预检响应含 Allow-Methods/Allow-Headers/Max-Age。

**Q3：CORS 凭证请求怎么配？**
答：客户端 \`credentials: 'include'\`（或 \`withCredentials=true\`），服务端 \`Allow-Credentials: true\` 且 \`Allow-Origin\` 必须精确域名（不能 \`*\`）。三者缺一 Cookie 不带或响应被拦。

**Q4：CSRF 原理？怎么防？**
答：CSRF 利用浏览器自动带 Cookie，诱导已登录用户访问恶意页，恶意页以用户身份发请求。防御：①CSRF Token（服务端发 token，提交校验，攻击者读不到 token）；②SameSite Cookie（Lax/Strict 阻止跨站带 Cookie，现代默认）；③Referer/Origin 校验。最佳实践 SameSite + Token。

**Q5：CORS 和 CSRF 的关系？CORS 能防 CSRF 吗？**
答：不能。CORS 是浏览器放松同源策略让 JS 读跨源响应的机制；CSRF 利用浏览器自动带 Cookie 发请求（form/img，不经过 JS）。CORS 只管 JS 发的 fetch/XHR，管不到 form 提交。CSRF 要靠 token/SameSite 防。

**Q6：为什么 \`Allow-Origin: *\` 和 \`Allow-Credentials: true\` 不能同时用？**
答：安全考虑。带凭证（Cookie）时若允许任意源，任意网站都能以用户身份请求。规范规定带凭证时 Allow-Origin 必须精确指定单一源。

**Q7：跨域请求发了但拿不到响应？**
答：浏览器其实把请求发出去了（Cookie 也带了），只是因为服务端没回正确的 \`Allow-Origin\`，浏览器把响应拦截不让 JS 读。这就是为什么 CSRF 不需要读响应也能攻击——请求已执行。

## 十、本章小结

1. 源 = 协议+主机+端口，子域/端口/协议不同都跨域。
2. 同源策略限制跨源 DOM、Cookie、响应读取，但**不阻止发请求**。
3. CORS 简单请求直接发（带 Origin），预检请求先 OPTIONS 再发真实请求。
4. CORS 响应头：Allow-Origin/Methods/Headers/Credentials/Max-Age。
5. 带凭证需 \`credentials: include\` + \`Allow-Credentials: true\` + 精确源（不能 \`*\`）。
6. CSRF 利用浏览器自动带 Cookie，防御靠 Token + SameSite + Referer 校验。
7. CORS 不防 CSRF（CSRF 不经 JS），CSRF 不防跨域读取（只发请求）。
8. 写操作用 POST/PUT/DELETE，绝不用 GET。

下一章我们看 Cookie、Session、JWT 这三种认证机制的原理与对比。`,
    code: `# ============================================================
# 第三章代码演示：CORS 与 CSRF
# ------------------------------------------------------------
# 演示内容：
#   1. 起两个 http.server（不同端口 = 跨域）
#   2. 演示 CORS 预检 OPTIONS + 响应头
#   3. 演示 CSRF Token 生成与校验（hmac）
#   4. 演示 SameSite Cookie 设置
# 用 threading 起 server，http.client 发请求
# ============================================================
import hmac
import hashlib
import json
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from http.client import HTTPConnection

print("=" * 60)
print("CORS 与 CSRF 演示")
print("=" * 60)

SECRET = "csrf-secret-key"
CSRF_TOKENS = set()   # 模拟服务端存储的合法 token

def make_csrf_token(session_id):
    \"\"\"用 hmac 生成 CSRF token\"\"\"
    msg = f"{session_id}:{time.time()}".encode()
    sig = hmac.new(SECRET.encode(), msg, hashlib.sha256).hexdigest()
    return sig[:32]

class ApiHandler(BaseHTTPRequestHandler):
    \"\"\"后端 API server（模拟被跨域访问的接口）\"\"\"
    def log_message(self, *a):
        pass

    def _cors(self, origin):
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        # CORS 预检
        origin = self.headers.get("Origin", "*")
        self.send_response(204)
        self._cors(origin)
        self.end_headers()
        print(f"  [api] OPTIONS 预检 (Origin={origin}) -> 204 + CORS 头")

    def do_GET(self):
        origin = self.headers.get("Origin", "*")
        if self.path == "/api/csrf-token":
            # 颁发 CSRF token
            token = make_csrf_token("user123")
            CSRF_TOKENS.add(token)
            body = json.dumps({"token": token}).encode()
            self.send_response(200)
            self._cors(origin)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            print(f"  [api] GET /api/csrf-token -> 颁发 token={token[:12]}...")
        elif self.path == "/api/transfer":
            # 校验 CSRF token
            token = self.headers.get("X-CSRF-Token", "")
            if token not in CSRF_TOKENS:
                body = json.dumps({"error": "invalid csrf token"}).encode()
                self.send_response(403)
                self._cors(origin)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                print(f"  [api] GET /api/transfer -> 403 (CSRF 校验失败, token={token[:12] or '空'})")
            else:
                body = json.dumps({"ok": True, "msg": "转账成功 100 元"}).encode()
                self.send_response(200)
                self._cors(origin)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                print(f"  [api] GET /api/transfer -> 200 (CSRF 校验通过)")

api_server = HTTPServer(("127.0.0.1", 0), ApiHandler)
api_port = api_server.server_address[1]
threading.Thread(target=api_server.serve_forever, daemon=True).start()

class FrontHandler(BaseHTTPRequestHandler):
    \"\"\"前端 server（模拟不同源页面）\"\"\"
    def log_message(self, *a):
        pass
    def do_GET(self):
        # 演示 SameSite Cookie
        html = b"<h1>Bank Page</h1>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Set-Cookie", "sid=user123; HttpOnly; SameSite=Strict; Path=/")
        self.send_header("Content-Length", str(len(html)))
        self.end_headers()
        self.wfile.write(html)
        print(f"  [front] GET / -> Set-Cookie: sid=user123; HttpOnly; SameSite=Strict")

front_server = HTTPServer(("127.0.0.1", 0), FrontHandler)
front_port = front_server.server_address[1]
threading.Thread(target=front_server.serve_forever, daemon=True).start()
time.sleep(0.3)

origin = f"http://127.0.0.1:{front_port}"
print(f"  前端: http://127.0.0.1:{front_port}")
print(f"  后端: http://127.0.0.1:{api_port}")
print(f"  (端口不同 = 跨域)")

# ============================================================
# 1. CORS 预检请求
# ============================================================
print("\\n[1] CORS 预检请求 OPTIONS")
print("-" * 60)
conn = HTTPConnection("127.0.0.1", api_port, timeout=5)
conn.request("OPTIONS", "/api/transfer", headers={
    "Origin": origin,
    "Access-Control-Request-Method": "GET",
    "Access-Control-Request-Headers": "X-CSRF-Token",
})
r = conn.getresponse()
print(f"  << {r.status} {r.reason}")
for k, v in r.getheaders():
    print(f"     {k}: {v}")
conn.close()

# ============================================================
# 2. 无 CSRF Token 转账 -> 403
# ============================================================
print("\\n[2] 无 CSRF Token 转账（模拟 CSRF 攻击）-> 403")
print("-" * 60)
conn = HTTPConnection("127.0.0.1", api_port, timeout=5)
conn.request("GET", "/api/transfer", headers={
    "Origin": origin,
    "Cookie": "sid=user123",   # 浏览器会自动带 Cookie
})
r = conn.getresponse()
print(f"  << {r.status} {r.reason} {r.read().decode()}")
conn.close()

# ============================================================
# 3. 获取 CSRF Token 后转账 -> 200
# ============================================================
print("\\n[3] 获取 CSRF Token 后转账 -> 200")
print("-" * 60)
conn = HTTPConnection("127.0.0.1", api_port, timeout=5)
conn.request("GET", "/api/csrf-token", headers={
    "Origin": origin,
    "Cookie": "sid=user123",
})
r = conn.getresponse()
data = json.loads(r.read())
token = data["token"]
print(f"  << 拿到 token: {token[:12]}...")
conn.close()

conn = HTTPConnection("127.0.0.1", api_port, timeout=5)
conn.request("GET", "/api/transfer", headers={
    "Origin": origin,
    "Cookie": "sid=user123",
    "X-CSRF-Token": token,
})
r = conn.getresponse()
print(f"  << {r.status} {r.reason} {r.read().decode()}")
conn.close()

# ============================================================
# 4. SameSite Cookie 演示
# ============================================================
print("\\n[4] SameSite Cookie 设置")
print("-" * 60)
conn = HTTPConnection("127.0.0.1", front_port, timeout=5)
conn.request("GET", "/")
r = conn.getresponse()
r.read()
for k, v in r.getheaders():
    if k.lower() == "set-cookie":
        print(f"  Set-Cookie: {v}")
        # 解析属性
        attrs = v.split(";")
        for a in attrs[1:]:
            a = a.strip()
            if a:
                print(f"    属性: {a}")
conn.close()

api_server.shutdown()
front_server.shutdown()

print("\\n" + "=" * 60)
print("[小结]")
print("- CORS: 预检 OPTIONS + Access-Control-Allow-* 头放松同源策略")
print("  - 简单请求直接发，复杂请求先预检")
print("  - 带凭证需 Allow-Credentials:true + 精确 Allow-Origin(不能 *)")
print("- CSRF: 利用浏览器自动带 Cookie，攻击者伪造请求")
print("  - 防御: CSRF Token(攻击者读不到) + SameSite Cookie(阻止跨站带)")
print("- SameSite=Strict 最严, Lax 默认(顶层GET带), None 需 Secure")
print("- CORS 不防 CSRF: CSRF 是 form/img 发请求不经 JS, CORS 管不到")
`,
  },

  // ============================================================
  // 第四章：Cookie、Session、JWT 认证机制
  // ============================================================
  {
    id: "net-cookie-session",
    title: "Cookie、Session、JWT 认证机制",
    icon: "🍪",
    group: "应用层协议",
    content: `## 一、为什么这一章重要

HTTP 是无状态协议——服务器默认不记得"上一个请求是谁发的"。但几乎所有业务都需要"记住用户"：登录后访问受保护资源、购物车跨页面保留、个性化推荐。如何在无状态的 HTTP 上实现"有状态"的用户识别？答案是 Cookie、Session、JWT 三大机制。

理解这三者的原理、区别、适用场景，是做登录认证、排查"登录态丢失"、设计微服务鉴权、防止 XSS/CSRF 的基础。这一章把 Cookie 的属性、Session 的存储方案、JWT 的签名验证、认证与授权的区别讲透。

## 二、Cookie 机制

### 2.1 Cookie 是什么

Cookie 是**浏览器存储的小段数据**，由服务端通过响应头 \`Set-Cookie\` 下发，浏览器保存后，后续请求自动通过 \`Cookie\` 请求头带回去。

\`\`\`text
首次登录:
  client -> POST /login (user, pwd)
  server <- 200 + Set-Cookie: sid=abc123; HttpOnly; Secure; Path=/

后续请求:
  client -> GET /me (Cookie: sid=abc123)   <- 浏览器自动带
  server <- 200 {user: ...}
\`\`\`

Cookie 的核心特点：

- **浏览器自动管理**：JS 不用管带不带，浏览器按 Domain/Path 匹配自动带。
- **每次请求都带**：匹配的 Cookie 在每个 HTTP 请求都带上，所以别存大数据（增加流量）。
- **有大小限制**：单个 Cookie ≤ 4KB，每个域名一般 ≤ 20-50 个。

### 2.2 Set-Cookie 响应头属性

\`Set-Cookie\` 可以带多个属性控制 Cookie 行为：

| 属性 | 作用 | 示例 |
|------|------|------|
| \`Name=Value\` | 键值对 | \`sid=abc123\` |
| \`Domain\` | 生效域名（默认当前域） | \`Domain=.example.com\`（前导点让子域共享） |
| \`Path\` | 生效路径（默认 /） | \`Path=/api\`（仅 /api 路径带） |
| \`Expires\` | 绝对过期时间 | \`Expires=Wed, 21 Oct 2025 07:28:00 GMT\` |
| \`Max-Age\` | 相对存活秒数（优先于 Expires） | \`Max-Age=3600\` |
| \`Secure\` | 仅 HTTPS 传输 | \`Secure\` |
| \`HttpOnly\` | JS 不可读（防 XSS 窃取） | \`HttpOnly\` |
| \`SameSite\` | 跨站是否带（防 CSRF） | \`SameSite=Lax\` |

详解：

- **Domain**：\`Domain=example.com\` 让 \`www.example.com\`、\`api.example.com\` 都带（子域共享）。不设 Domain 默认只当前域带。
- **Expires/Max-Age**：都不设则是**会话 Cookie**（浏览器关了就删）。设了就是**持久 Cookie**。\`Max-Age=0\` 立即删除。
- **Secure**：只在 HTTPS 上带，防止明文 HTTP 泄漏。
- **HttpOnly**：\`document.cookie\` 读不到，防 XSS 攻击用 JS 偷 Cookie。**登录 Cookie 必须设 HttpOnly**。
- **SameSite**：防 CSRF（见上章），现代浏览器默认 Lax。

### 2.3 Cookie 的安全最佳实践

\`\`\`text
Set-Cookie: sid=xxx; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
\`\`\`

- 登录态 Cookie：\`HttpOnly\`（防 XSS 读）+ \`Secure\`（仅 HTTPS）+ \`SameSite=Lax\`（防 CSRF）。
- 不要在 Cookie 存敏感信息（如密码），Cookie 可能被泄漏。
- 存用户偏好等非敏感数据可以不 HttpOnly（JS 要读）。

## 三、Session 机制

### 3.1 Session 是什么

Cookie 把状态存客户端有安全隐患（用户能改、能看）。Session 把状态存**服务端**，客户端只持有一个不透明的 Session ID。

\`\`\`text
1. 登录: server 验证密码 -> 生成 session_id, 存 session_id 映射 {user, login_time} 到服务端
2. server -> Set-Cookie: sid=session_id; HttpOnly
3. 后续请求带 Cookie: sid=session_id
4. server 查 session_id -> 找到 {user} -> 认为已登录
\`\`\`

Session ID 是个随机不可猜的字符串（如 \`hashlib.sha256(...).hexdigest()\`），用户改了就找不到对应 session，所以无法伪造身份。状态（用户 ID、权限）都在服务端，客户端只拿个"门票"。

### 3.2 Session 存储方案

服务端把 session 存哪？三种方案：

| 方案 | 实现 | 优点 | 缺点 | 适用 |
|------|------|------|------|------|
| 内存 | 进程内 dict | 最快 | 重启丢失、不能多机共享 | 单机开发 |
| 文件/数据库 | 持久化 | 永久 | 慢 | 需要永久会话 |
| Redis/Memcached | 内存数据库 | 快、可共享、过期自动 | 多一个依赖 | 生产主流 |

**多机共享问题**：负载均衡下，用户第一次请求打到 A 机器（session 存 A），第二次打到 B（B 没有）就掉登录。解决：

1. **Session 共享存储**：所有机器连同一个 Redis，session 都存 Redis，任意机器都能查到。最常用。
2. **Sticky Session**：负载均衡把同一用户固定打到同一机器（IP hash/Cookie sticky）。但机器宕机 session 丢失。
3. **Session 复制**：机器间同步 session，复杂且耗资源，少用。

生产标配：**Session 存 Redis**，前端 Nginx/LB 任意分发，所有机器都能查 Redis 拿 session。

### 3.3 Session 的缺点

1. **有状态**：服务端要存 session，用户多了占内存。
2. **扩展麻烦**：多机要共享存储（Redis），增加依赖。
3. **跨域难**：Cookie 默认不跨域，多端（web/app/小程序）共享登录态麻烦。

这些缺点催生了 JWT。

## 四、JWT 机制

### 4.1 JWT 是什么

JWT（JSON Web Token）是一种**无状态**的认证方案。服务端不存 session，而是把用户信息编码成一个 Token 发给客户端，客户端每次请求带上 Token，服务端**验签**确认 Token 真实未篡改。

\`\`\`text
1. 登录: server 验证密码 -> 生成 JWT (含 user_id, 过期时间, 签名) -> 返回给客户端
2. 客户端存 JWT (localStorage 或 Cookie)
3. 后续请求带 Authorization: Bearer <JWT>
4. server 验证签名 + 检查过期 -> 解析出 user_id -> 认为已登录
\`\`\`

JWT 的核心：**签名保证 Token 不可伪造**，服务端不用存任何状态，验签即可。

### 4.2 JWT 结构

JWT 由三段组成，用 \`.\` 分隔：\`Header.Payload.Signature\`。

\`\`\`text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsImV4cCI6MTYwMH0.signature
└──────── Header ───────┘└──────── Payload ────────┘└──── Signature ────┘
\`\`\`

- **Header**：\`{"alg": "HS256", "typ": "JWT"}\`，base64url 编码。
- **Payload**：声明（claims），如 \`{"sub": "alice", "exp": 1600, "iat": 1500}\`。**注意：Payload 只是 base64 编码，不是加密，任何人能解出来，所以别放密码等敏感信息！**
- **Signature**：\`HMAC-SHA256(base64url(Header) + "." + base64url(Payload), secret)\`。

验签过程：服务端拿到 Token，用同样的 secret 重新算签名，和 Token 里的 signature 对比，一致则 Token 真实未篡改。

### 4.3 常用声明（Claims）

| 声明 | 含义 |
|------|------|
| \`iss\` | 签发者 |
| \`sub\` | 主体（用户 ID） |
| \`aud\` | 接收方 |
| \`exp\` | 过期时间（Unix 时间戳） |
| \`nbf\` | 生效时间 |
| \`iat\` | 签发时间 |
| \`jti\` | 唯一 ID（防重放） |

\`exp\` 必须设，否则 Token 永久有效，泄漏后无法吊销。

### 4.4 JWT 的优缺点

**优点**：

- **无状态**：服务端不存 session，验签即可，扩展性好。
- **跨域/跨端友好**：Token 放 Authorization 头，不依赖 Cookie，web/app/小程序统一。
- **自包含**：Token 里有用户信息，不用查库（但要注意过期和吊销）。

**缺点**：

- **无法主动吊销**：签发后到过期前一直有效，没法像 session 那样"踢下线"。要吊销得维护黑名单（又变有状态了）。
- **Payload 不加密**：任何人能 base64 解出内容，不能放敏感信息。
- **续期麻烦**：Token 过期要重新签发，常用 Refresh Token 方案。
- **大小较大**：比 session_id 长得多，每个请求都带增加流量。

### 4.5 JWT 存哪里

- **localStorage**：JS 能读，方便，但 XSS 能偷。要配合严格的 XSS 防护。
- **HttpOnly Cookie**：JS 读不到，防 XSS，但要处理 CSRF（SameSite）。
- **Authorization Header**：\`Authorization: Bearer <token>\`，最常用，不依赖 Cookie。

## 五、Cookie vs Session vs JWT 对比

| 维度 | Cookie | Session | JWT |
|------|--------|---------|-----|
| 状态位置 | 客户端 | 服务端 | Token 自包含（客户端） |
| 服务端存储 | 无 | 要（内存/Redis） | 无 |
| 跨域 | 难（Cookie 限制） | 难（依赖 Cookie） | 易（Header） |
| 安全 | 低（用户能看改） | 高（ID 不可猜） | 中（签名防篡改，但内容可见） |
| 吊销 | 改 Cookie | 删 session 即可 | 难（要黑名单） |
| 扩展性 | 好 | 差（共享存储） | 好（无状态） |
| 适用 | 用户偏好/跟踪 | 传统 Web 登录 | API/微服务/移动端 |

口诀：**Cookie 是容器，Session 是服务端方案，JWT 是无状态 Token**。实际中常组合：Session ID 通过 Cookie 传（Cookie+Session），JWT 通过 Cookie 或 Header 传。

## 六、认证 vs 授权

容易混淆的两个概念：

- **认证（Authentication，AuthN）**：验证"你是谁"。登录输密码、刷脸、扫码都是认证。问"你是 alice 吗？"
- **授权（Authorization，AuthZ）**：验证"你能做什么"。alice 登录后能不能访问这个接口、能不能删数据。问"alice 有权限吗？"

\`\`\`text
认证: 用户名密码 -> 确认身份 -> 颁发凭证 (Cookie/Session/JWT)
授权: 凭证 -> 解析身份 -> 检查权限 (RBAC/ABAC) -> 放行或拒绝 (401/403)
\`\`\`

状态码：**401 Unauthorized** 是认证失败（没登录/凭证无效）；**403 Forbidden** 是授权失败（登录了但没权限）。

## 七、OAuth 2.0 概览

OAuth 2.0 是**授权框架**，让用户授权第三方应用访问其在另一服务上的资源，**而不交出密码**。典型场景：用微信登录某 App、用 GitHub 登录某网站。

最常用的是**授权码流程（Authorization Code）**：

\`\`\`text
1. 用户点"用 GitHub 登录" -> 跳转 github.com/oauth?client_id=APP&redirect_uri=CALLBACK
2. 用户在 GitHub 授权 -> GitHub 重定向到 CALLBACK?code=AUTH_CODE
3. App 后端用 code + client_secret 换 access_token: POST github.com/oauth/token
4. App 用 access_token 调 GitHub API 拿用户信息
\`\`\`

为什么要 code 换 token，不直接给 token？因为 code 走浏览器（前端，不安全），token 走后端（带 client_secret，安全）。这是 OAuth 2.0 的安全设计。

OAuth 2.0 是授权框架，不是认证协议（虽然常用来做"登录"）。基于它做认证的开放协议叫 **OIDC（OpenID Connect）**。

## 八、SSO 单点登录

SSO（Single Sign-On）——一次登录，访问所有互信系统不用再登录。如企业内部：登录一次 OA，邮件、CRM、HR 系统都免登。

原理（以 CAS/OIDC 为例）：

\`\`\`text
1. 用户访问 app1.com (未登录) -> 跳转 sso.com/login
2. sso.com 登录 -> 颁发 ticket/token -> 重定向回 app1.com?ticket=xxx
3. app1.com 验证 ticket -> 建立本地登录态
4. 用户访问 app2.com (未登录) -> 跳转 sso.com/login
5. sso.com 发现已登录(全局会话) -> 直接发 ticket -> 重定向回 app2.com
6. app2.com 验证 ticket -> 建立本地登录态 (用户无感)
\`\`\`

SSO 的核心是**一个中心认证服务器 + 各子系统信任它颁发的票据**。登出时通常要全局登出（Single Logout）。

## 九、常见安全问题

### 9.1 XSS 窃取 Cookie

XSS（跨站脚本）攻击者在页面注入 JS，用 \`document.cookie\` 读 Cookie 发走。防御：Cookie 设 \`HttpOnly\`（JS 读不到）、对用户输入做转义、CSP（Content-Security-Policy）限制脚本源。

### 9.2 CSRF 攻击

见上章。Cookie 自动带导致 CSRF。防御：SameSite Cookie + CSRF Token。

### 9.3 JWT 泄漏

JWT 一旦泄漏，到过期前都能用。防御：

- HTTPS 传输（防中间人）。
- 短过期时间 + Refresh Token。
- 不放 localStorage（XSS 偷），放 HttpOnly Cookie。
- 敏感操作（支付）二次验证。

### 9.4 Session 固定攻击

攻击者让用户用指定的 session_id 登录（如 \`?sid=evil_id\`），登录后攻击者用同 id 访问。防御：登录成功后**重新生成 session_id**（regenerate）。

## 十、工作中常用场景

1. **Web 登录用 Session**：FastAPI/Express/Django 内置 session，存 Redis。
2. **API/移动端用 JWT**：无状态，\`Authorization: Bearer\` 头。
3. **Refresh Token**：access_token 短期（15 分钟），refresh_token 长期（7 天），过期用 refresh 换新 access，避免频繁登录。
4. **Cookie 跨子域**：\`Domain=.example.com\` 让 web.example.com 和 api.example.com 共享。
5. **登出**：Session 删服务端记录 + 清客户端 Cookie；JWT 加黑名单。
6. **RBAC 权限**：角色（admin/user）+ 资源权限矩阵，中间件统一校验。

## 十一、常见陷阱与最佳实践

1. **JWT 放密码**：Payload 不加密，能解出来。绝对不放敏感信息。
2. **不设 exp**：Token 永久有效，泄漏后无法吊销。必须设短 exp。
3. **Session 存内存**：重启丢登录、多机不共享。生产用 Redis。
4. **登录 Cookie 不设 HttpOnly**：XSS 一偷就走。必设 HttpOnly+Secure+SameSite。
5. **用 JWT 当 Session 用**：要吊销时发现做不到。需要吊销场景用 Session。
6. **session_id 可猜**：用 \`secrets.token_hex\` 或 sha256 随机，别用自增 ID。
7. **登录后不 regenerate**：session 固定攻击。登录成功重新生成 id。
8. **Authorization 头大小写**：HTTP 头不区分大小写，但规范是 \`Authorization\`。

## 十二、面试要点

**Q1：Cookie、Session、JWT 的区别？**
答：Cookie 是浏览器存储机制（容器）；Session 是服务端存储状态、客户端持 ID（有状态）；JWT 是自包含签名 Token（无状态）。Cookie+Session 是经典 Web 登录，JWT 适合 API/移动端。Session 能主动吊销但要多机共享存储，JWT 无状态扩展好但难吊销。

**Q2：Cookie 的 HttpOnly/Secure/SameSite 各防什么？**
答：HttpOnly 防 XSS 读 Cookie（JS 读不到）；Secure 防明文 HTTP 传输泄漏（仅 HTTPS）；SameSite 防 CSRF（限制跨站带 Cookie）。登录 Cookie 三者都设。

**Q3：JWT 为什么不能放密码？**
答：JWT 的 Payload 只是 base64 编码（不是加密），任何人能解出内容。签名只防篡改不防读取。敏感信息要加密用 JWE（加密的 JWT）。

**Q4：JWT 怎么吊销？**
答：JWT 无状态本身无法吊销，签发后到 exp 前一直有效。要吊销得维护黑名单（存已吊销的 jti），验签时查黑名单——但这又变成有状态。所以敏感操作用短 exp + Refresh Token + 二次验证。

**Q5：认证和授权的区别？401 和 403？**
答：认证（AuthN）验"你是谁"（登录），授权（AuthZ）验"你能做什么"（权限）。401 是未认证（没登录/凭证无效），403 是已认证但未授权（没权限）。

**Q6：多机 Session 怎么共享？**
答：①所有机器连同一 Redis 存 session（主流）；②Sticky Session 固定打到同一机器（宕机丢失）；③Session 复制（复杂少用）。或改用 JWT 无状态。

**Q7：OAuth 2.0 授权码流程？为什么不直接给 token？**
答：用户跳转授权中心登录授权 -> 回调带 code -> 后端用 code+client_secret 换 access_token -> 用 token 调 API。code 走浏览器不安全，token 走后端带 secret 安全，防止 token 经浏览器泄漏。

## 十三、本章小结

1. Cookie 是浏览器存储，\`Set-Cookie\` 下发，\`Cookie\` 自动带，属性 Domain/Path/Expires/Secure/HttpOnly/SameSite。
2. Session 是服务端存状态，客户端持 session_id（经 Cookie 传），生产存 Redis 共享。
3. JWT = Header.Payload.Signature，签名防篡改，无状态，适合 API/移动端。
4. Cookie+Session 适合传统 Web，JWT 适合无状态 API。
5. 登录 Cookie 必设 HttpOnly+Secure+SameSite 防 XSS/CSRF。
6. 认证（你是谁）vs 授权（你能做什么），401 vs 403。
7. OAuth 2.0 授权码流程：code 换 token，code 走前端 token 走后端。
8. SSO 一次登录全局有效，靠中心认证 + 票据信任。

至此应用层协议篇四章结束。下一批工程实践篇将讲代理、CDN、抓包调试、性能优化。`,
    code: `# ============================================================
# 第四章代码演示：Cookie / Session / JWT
# ------------------------------------------------------------
# 演示内容：
#   1. 用 http.server 演示 Set-Cookie 响应头
#   2. 用 http.client 演示 Cookie 请求头携带
#   3. 演示 Session（dict 存储 + session_id 经 Cookie 传）
#   4. 手动构造 JWT（hmac + base64，不依赖 PyJWT）
# 用 threading 起 server
# ============================================================
import base64
import hashlib
import hmac
import json
import os
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from http.client import HTTPConnection

print("=" * 60)
print("Cookie / Session / JWT 演示")
print("=" * 60)

USERS = {"alice": "pwd123"}     # 模拟用户库
SESSIONS = {}                    # session_id -> {user, login_at}  (服务端存储)
JWT_SECRET = "my-jwt-secret"    # JWT 签名密钥

# ============================================================
# JWT 工具函数（手动实现，不依赖 PyJWT）
# ============================================================
def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def b64url_decode(s):
    padding = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)

def make_jwt(payload):
    \"\"\"构造 JWT: Header.Payload.Signature\"\"\"
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    p = b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{h}.{p}".encode("ascii")
    sig = hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest()
    s = b64url_encode(sig)
    return f"{h}.{p}.{s}"

def verify_jwt(token):
    \"\"\"验证 JWT 签名 + 过期时间，返回 payload 或 None\"\"\"
    parts = token.split(".")
    if len(parts) != 3:
        return None
    h, p, s = parts
    signing_input = f"{h}.{p}".encode("ascii")
    expected_sig = b64url_encode(
        hmac.new(JWT_SECRET.encode(), signing_input, hashlib.sha256).digest())
    # 用 compare_digest 防时序攻击
    if not hmac.compare_digest(s, expected_sig):
        return None
    payload = json.loads(b64url_decode(p))
    if payload.get("exp", 0) < time.time():
        return None
    return payload

# ---- 先演示 JWT 构造与验证（不依赖 server）----
print("\\n[1] JWT 构造与验证（离线演示）")
print("-" * 60)
token = make_jwt({"sub": "alice", "exp": int(time.time()) + 3600, "role": "admin"})
print(f"  构造 JWT: {token[:50]}...")
h, p, s = token.split(".")
print(f"  Header  : {json.loads(b64url_decode(h))}")
print(f"  Payload : {json.loads(b64url_decode(p))}")
print(f"  签名校验: {verify_jwt(token) is not None}")

# 篡改 payload 后验签应失败
tampered = token.split(".")
bad_payload = b64url_encode(json.dumps({"sub":"admin","exp":int(time.time())+3600}).encode())
bad_token = f"{tampered[0]}.{bad_payload}.{tampered[2]}"
print(f"  篡改后校验: {verify_jwt(bad_token) is not None} (应为 False)")

# ============================================================
# HTTP Handler：演示登录(Session+JWT) 与受保护接口
# ============================================================
class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send_json(self, status, obj, extra_headers=None):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for k, v in extra_headers:
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path == "/login":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length) or b"{}")
            user, pwd = data.get("user"), data.get("pwd")
            if USERS.get(user) == pwd:
                # 生成 session_id（随机不可猜）
                sid = hashlib.sha256(
                    f"{user}{time.time()}{os.urandom(8)}".encode()
                ).hexdigest()[:24]
                SESSIONS[sid] = {"user": user, "login_at": time.time()}
                # 同时签发 JWT
                jwt = make_jwt({"sub": user, "exp": int(time.time()) + 3600})
                self._send_json(200, {"jwt": jwt, "session_id": sid}, [
                    ("Set-Cookie",
                     f"sid={sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600"),
                ])
                print(f"  [server] /login OK -> Set-Cookie sid={sid[:12]}... + JWT")
            else:
                self._send_json(401, {"error": "bad credentials"})
                print(f"  [server] /login 401 (密码错误)")

    def do_GET(self):
        if self.path == "/me":
            # 1. 先查 Session
            cookie = self.headers.get("Cookie", "")
            sid = None
            for c in cookie.split(";"):
                c = c.strip()
                if c.startswith("sid="):
                    sid = c[4:]
            if sid and sid in SESSIONS:
                user = SESSIONS[sid]["user"]
                self._send_json(200, {"user": user, "via": "session"})
                print(f"  [server] /me 200 via session (user={user})")
                return
            # 2. 再查 JWT
            auth = self.headers.get("Authorization", "")
            if auth.startswith("Bearer "):
                token = auth[7:]
                payload = verify_jwt(token)
                if payload:
                    self._send_json(200, {"user": payload["sub"], "via": "jwt"})
                    print(f"  [server] /me 200 via JWT (user={payload['sub']})")
                    return
            # 3. 都没有 -> 401
            self._send_json(401, {"error": "unauthorized"})
            print(f"  [server] /me 401 (无有效凭证)")

# ============================================================
# 启动 server
# ============================================================
server = HTTPServer(("127.0.0.1", 0), Handler)
port = server.server_address[1]
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.3)
print(f"\\n  server: http://127.0.0.1:{port}")

def req(method, path, body=None, headers=None):
    conn = HTTPConnection("127.0.0.1", port, timeout=5)
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    conn.request(method, path, body=body, headers=hdrs)
    r = conn.getresponse()
    data = r.read().decode()
    set_cookie = None
    for k, v in r.getheaders():
        if k.lower() == "set-cookie":
            set_cookie = v
    conn.close()
    return r.status, data, set_cookie

# ============================================================
# 2. 登录获取 Session Cookie + JWT
# ============================================================
print("\\n[2] 登录获取 Session + JWT")
print("-" * 60)
status, data, set_cookie = req("POST", "/login",
    body=json.dumps({"user": "alice", "pwd": "pwd123"}))
print(f"  << {status} {data}")
if set_cookie:
    print(f"  Set-Cookie: {set_cookie}")
    # 解析 sid
    sid = set_cookie.split(";")[0].split("=", 1)[1]
jwt_token = json.loads(data)["jwt"]
print(f"  JWT: {jwt_token[:50]}...")

# 错误密码
status, data, _ = req("POST", "/login",
    body=json.dumps({"user": "alice", "pwd": "wrong"}))
print(f"  错误密码 -> << {status} {data}")

# ============================================================
# 3. 解析 JWT 三段
# ============================================================
print("\\n[3] 解析 JWT 三段结构")
print("-" * 60)
h, p, s = jwt_token.split(".")
print(f"  Header  : {json.loads(b64url_decode(h))}")
print(f"  Payload : {json.loads(b64url_decode(p))}")
print(f"  签名    : {s[:30]}...")
print(f"  验签    : {verify_jwt(jwt_token) is not None}")

# ============================================================
# 4. 用 Session Cookie 访问 /me
# ============================================================
print("\\n[4] 用 Session Cookie 访问 /me")
print("-" * 60)
status, data, _ = req("GET", "/me", headers={"Cookie": f"sid={sid}"})
print(f"  << {status} {data}")

# ============================================================
# 5. 用 JWT 访问 /me
# ============================================================
print("\\n[5] 用 JWT 访问 /me")
print("-" * 60)
status, data, _ = req("GET", "/me", headers={"Authorization": f"Bearer {jwt_token}"})
print(f"  << {status} {data}")

# ============================================================
# 6. 篡改 JWT -> 401
# ============================================================
print("\\n[6] 篡改 JWT 签名 -> 401")
print("-" * 60)
bad_token = jwt_token[:-5] + "XXXXX"
status, data, _ = req("GET", "/me", headers={"Authorization": f"Bearer {bad_token}"})
print(f"  << {status} {data}")

# ============================================================
# 7. 无凭证访问 /me -> 401
# ============================================================
print("\\n[7] 无凭证访问 /me -> 401")
print("-" * 60)
status, data, _ = req("GET", "/me")
print(f"  << {status} {data}")

server.shutdown()

print("\\n" + "=" * 60)
print("[小结]")
print("- Cookie: Set-Cookie 下发, Cookie 头自动带, HttpOnly/Secure/SameSite 加固")
print("- Session: 服务端存(dict/Redis), session_id 经 Cookie 传, 有状态可吊销")
print("- JWT: Header.Payload.Signature, hmac 签名防篡改, 无状态, payload 不加密")
print("  - 验签: 重算 HMAC 与 token 中 signature 比对 (compare_digest 防时序)")
print("  - 过期: 校验 exp < now 则拒绝")
print("- 三种凭证都失效/无效时返回 401 Unauthorized")
`,
  },
];
