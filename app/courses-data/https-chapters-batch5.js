// =============================================================
// HTTPS 详解全书 - 第 5 批章节（HTTPS 性能与优化 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   hs-perf-cost: TLS 性能开销分析
//   hs-session-resume: 会话复用
//   hs-ocsp-stapling: OCSP Stapling 优化
//   hs-http2-https: HTTP/2 与 HTTPS 协同
//   hs-0rtt: 0-RTT 与 TLS 1.3 优化
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：TLS 性能开销分析
  // ============================================================
  {
    id: "hs-perf-cost",
    group: "HTTPS 性能与优化",
    icon: "⏱️",
    title: "TLS 性能开销分析",
    content: `# TLS 性能开销分析

## 一、为什么这一章重要

很多人对 HTTPS 有一个根深蒂固的偏见："加了 TLS 一定会让网站变慢"。这个观念放在 2010 年也许是对的，但放在今天基本是错的。现代 CPU 普遍支持 AES-NI 硬件指令集，对称加密几乎"零成本"；TLS 1.3 把握手从 2-RTT 压到 1-RTT，配合会话复用甚至能做到 0-RTT；HTTP/2 又强制跑在 TLS 之上，反而比 HTTP/1.1 over TCP 更快。

但"基本不慢"不等于"完全不用关心"。要做性能优化，第一步是**量化**：到底慢在哪一阶段？是握手慢、加密慢、还是网络慢？是 CPU 瓶颈还是 RTT 瓶颈？只有把开销拆开测量，才能对症下药。这一章就是教你**用工具把 TLS 的性能开销"拆解"到每一毫秒**，为后续章节（会话复用、OCSP Stapling、HTTP/2、0-RTT）的优化打下基础。

> 生活类比：HTTPS 比 HTTP 慢的争论，就像"装了防盗门会不会拖慢回家速度"。开门确实要多花 1 秒，但只要你不是每次回家都换新锁（每次握手），而是用同一把钥匙（会话复用），这 1 秒几乎可以忽略。问题是：你能不能准确测量这 1 秒到底花在哪？答案是能，这一章就教你测。

## 二、HTTPS 比 HTTP 慢在哪

HTTPS = HTTP + TLS。所以 HTTPS 多出来的开销，本质上就是 TLS 的开销。TLS 的开销分两大类：

### 2.1 握手开销（Handshake Cost）

握手阶段的开销又分两块：

1. **CPU 开销**：握手时要做非对称加密运算（RSA/ECDHE），这是 TLS 中最"重"的计算。一次 ECDHE 密钥交换大约需要 0.5~2ms（取决于曲线和 CPU），一次 RSA 签名验证大约 0.1~1ms。
2. **网络开销**：握手需要多个 RTT（Round Trip Time）来回。TLS 1.2 需要 2-RTT，TLS 1.3 只要 1-RTT。如果 RTT 是 100ms，那 TLS 1.2 握手就吃掉 200ms，TLS 1.3 吃掉 100ms。

### 2.2 加密开销（Encryption Cost）

握手完成后，所有应用数据都要对称加密（AES-GCM、ChaCha20）。但这一块在现代 CPU 上**几乎可以忽略**：

- 开启 AES-NI 硬件加速后，AES-256-GCM 吞吐量可达 **5~10 GB/s**
- 即使是 1Gbps 的网络带宽，CPU 占用也不到 5%
- ChaCha20-Poly1305 在没有 AES-NI 的设备（老 ARM）上更快

**结论**：HTTPS 的性能瓶颈几乎全在握手阶段，不在加密阶段。优化 TLS 性能 = 优化握手性能。

## 三、握手开销详解：CPU + 网络

### 3.1 CPU 开销：非对称加密是"重活"

握手阶段的非对称加密操作包括：

| 操作 | 算法 | 大致耗时（现代 CPU） | 谁来做 |
|------|------|---------------------|--------|
| 密钥交换 | ECDHE P-256 | ~0.5ms | 客户端 + 服务端各一次 |
| 签名验证 | RSA-2048 | ~0.1ms | 客户端验证证书链 |
| 签名生成 | ECDSA P-256 | ~0.1ms | 服务端（如果用 ECDSA 证书） |
| 签名生成 | RSA-2048 | ~1ms | 服务端（如果用 RSA 证书） |

注意服务端签名生成：RSA-2048 签名比 ECDSA 慢约 10 倍。这就是为什么大厂都倾向用 **ECDSA 证书**——不光证书小，签名也快。

### 3.2 网络开销：RTT 是握手延迟的大头

假设客户端到服务端 RTT = 100ms（典型的跨省延迟）：

- **HTTP/1.1 over TCP**：1-RTT（TCP 三次握手）= 100ms
- **HTTPS over TLS 1.2**：1-RTT（TCP）+ 2-RTT（TLS）= 300ms
- **HTTPS over TLS 1.3**：1-RTT（TCP）+ 1-RTT（TLS）= 200ms
- **HTTPS + 会话复用（TLS 1.2 Session Ticket）**：1-RTT（TCP）+ 1-RTT（TLS）= 200ms
- **HTTPS + TLS 1.3 0-RTT**：1-RTT（TCP）+ 0-RTT = 100ms（首包数据随 ClientHello 一起发）

可以看到，**RTT 是握手延迟的绝对大头**。CPU 那几毫秒在网络延迟面前可以忽略。这也是为什么会话复用和 0-RTT 如此重要——它们直接砍掉 RTT。

## 四、TLS 1.2 vs TLS 1.3 握手延迟对比

### 4.1 TLS 1.2 握手流程（2-RTT）

\`\`\`text
客户端                          服务端
  |  --- ClientHello --->        |   RTT 1 开始
  |  <-- ServerHello ---         |
  |  <-- Certificate ---         |
  |  <-- ServerKeyExchange ---   |
  |  <-- ServerHelloDone ---     |   RTT 1 结束
  |  --- ClientKeyExchange -->   |   RTT 2 开始
  |  --- ChangeCipherSpec -->    |
  |  --- Finished -->            |   RTT 2 结束
  |  <-- ChangeCipherSpec ---    |
  |  <-- Finished ---            |
  |  === 应用数据 ===            |
\`\`\`

需要 2 个完整 RTT 才能开始发送应用数据。

### 4.2 TLS 1.3 握手流程（1-RTT）

\`\`\`text
客户端                          服务端
  |  --- ClientHello --->        |   RTT 1 开始
  |      (含 KeyShare)           |
  |  <-- ServerHello ---         |
  |  <-- EncryptedExtensions --- |
  |  <-- Certificate ---         |
  |  <-- CertificateVerify ---   |
  |  <-- Finished ---            |   RTT 1 结束
  |  --- Finished -->            |
  |  === 应用数据 ===            |
\`\`\`

TLS 1.3 把握手压缩到 1-RTT，而且服务端的证书已经在加密通道里发送（TLS 1.2 是明文发证书）。

### 4.3 延迟对比表

| 场景 | TCP 握手 | TLS 握手 | 首包总延迟（RTT=100ms） |
|------|---------|---------|------------------------|
| HTTP | 1-RTT | 0 | 100ms |
| HTTPS + TLS 1.2 | 1-RTT | 2-RTT | 300ms |
| HTTPS + TLS 1.3 | 1-RTT | 1-RTT | 200ms |
| HTTPS + TLS 1.3 + 0-RTT | 1-RTT | 0-RTT | 100ms |

## 五、关键指标：连接建立时间

测量 HTTPS 性能时，要把连接建立拆成几个阶段分别测量：

1. **DNS 解析时间**：把域名解析成 IP（首次访问才有，可被缓存）
2. **TCP 连接时间**：TCP 三次握手（1-RTT）
3. **TLS 握手时间**：TLS 握手（TLS 1.2 是 2-RTT，TLS 1.3 是 1-RTT）
4. **首字节时间（TTFB）**：从连接建立到收到第一个响应字节
5. **总时间**：完整请求 + 响应

curl 的 \`-w\` 参数能把这些阶段全部打出来，是测量 HTTPS 性能最趁手的工具。

## 六、Demo 1：用 curl 测量各阶段耗时

\`\`\`bash
# 用 curl 的 -w 参数输出每个阶段的耗时
# -o /dev/null：丢弃响应体，只看时间
# -s：静默模式，不显示进度条
curl -w "DNS 解析:      %{time_namelookup}s\\n" \\
     -w "TCP 连接:      %{time_connect}s\\n" \\
     -w "TLS 握手:      %{time_appconnect}s\\n" \\
     -w "首字节(TTFB):  %{time_starttransfer}s\\n" \\
     -w "总时间:        %{time_total}s\\n" \\
     -o /dev/null -s https://www.example.com

# 输出示例（典型值）：
# DNS 解析:      0.012s    # 本地缓存命中或快速 DNS
# TCP 连接:      0.045s    # 1-RTT（约 33ms 往返）
# TLS 握手:      0.120s    # TLS 1.3 是 1-RTT，TLS 1.2 是 2-RTT
# 首字节(TTFB):  0.180s    # TLS 完成后还要等服务端处理
# 总时间:        0.185s    # 加上响应体传输
\`\`\`

**关键解读**：
- \`time_connect - time_namelookup\` = 纯 TCP 握手时间
- \`time_appconnect - time_connect\` = 纯 TLS 握手时间
- \`time_starttransfer - time_appconnect\` = 服务端处理 + 网络传输时间

对比 HTTP 和 HTTPS：

\`\`\`bash
# 测 HTTP（同一服务器，如果支持）
curl -w "HTTP 总时间: %{time_total}s\\n" -o /dev/null -s http://www.example.com

# 测 HTTPS
curl -w "HTTPS 总时间: %{time_total}s\\n" -o /dev/null -s https://www.example.com

# 多次测量取平均（写个简单循环）
for i in 1 2 3 4 5; do
  curl -w "%{time_total}\\n" -o /dev/null -s https://www.example.com
done
\`\`\`

## 七、Demo 2：用 openssl s_client 测握手时间

\`\`\`bash
# 测 TLS 1.3 握手时间
# -tls1_3：强制使用 TLS 1.3
# < /dev/null：用空输入避免阻塞
# 2>/dev/null：丢弃 stderr
# time：测量整个命令的执行时间
time openssl s_client -connect www.example.com:443 -tls1_3 < /dev/null 2>/dev/null

# 测 TLS 1.2 握手时间
time openssl s_client -connect www.example.com:443 -tls1_2 < /dev/null 2>/dev/null

# 输出示例：
# real    0m0.187s   # TLS 1.3
# real    0m0.298s   # TLS 1.2（多一个 RTT）
\`\`\`

**更精确的测量**：用 openssl 的 \`-trace\` 参数可以看到每个消息的时间戳：

\`\`\`bash
# -msg：显示握手消息
# -msgtime：显示每条消息的时间戳
openssl s_client -connect www.example.com:443 -tls1_3 -msg -msgtime < /dev/null 2>&1 | head -30
\`\`\`

## 八、Demo 3：CPU 占用对比（HTTP vs HTTPS）

用 Apache Benchmark（ab）压测，对比 HTTP 和 HTTPS 的 CPU 占用和吞吐量：

\`\`\`bash
# 压测 HTTP（-n 总请求数，-c 并发数）
ab -n 10000 -c 100 http://localhost/

# 压测 HTTPS（注意 HTTPS 会消耗更多 CPU 做握手）
ab -n 10000 -c 100 https://localhost/

# 关键指标对比：
# - Requests per second（吞吐量，越高越好）
# - Time per request（平均延迟，越低越好）
# - Transfer rate（传输速率）
#
# 典型结果（开启 AES-NI 的现代 CPU）：
# HTTP:  ~15000 req/s
# HTTPS: ~8000 req/s（握手开销导致，但对称加密本身几乎不耗 CPU）
#
# 如果用 -k 开启 keep-alive（复用连接，避免重复握手）：
ab -n 10000 -c 100 -k https://localhost/
# HTTPS keep-alive: ~14000 req/s（接近 HTTP！证明瓶颈在握手）
\`\`\`

**关键结论**：开启 keep-alive 后，HTTPS 吞吐量接近 HTTP，证明**握手才是开销大头**，对称加密本身几乎免费。

## 九、Demo 4：TLS 握手消息大小（抓包分析）

TLS 握手会传输大量证书和密钥交换数据，这些数据本身也要消耗带宽。用 tcpdump 抓包可以看到：

\`\`\`bash
# 抓取 TLS 握手包（443 端口）
# -i any：监听所有网卡
# -w：写入 pcap 文件
sudo tcpdump -i any -w tls_handshake.pcap port 443

# 另一个终端发请求
curl https://www.example.com -o /dev/null

# 停止抓包后用 tshark 分析
tshark -r tls_handshake.pcap -Y "tls.handshake" -T fields \\
  -e frame.time_relative -e tls.handshake.type -e tls.handshake.version

# 各握手消息典型大小：
# ClientHello:        ~250 字节（含 SNI、支持的密码套件列表）
# ServerHello:        ~90 字节
# Certificate:        ~3000~5000 字节（证书链，RSA 较大，ECDSA 较小）
# ServerKeyExchange:  ~150 字节（ECDHE 参数）
# ServerHelloDone:    4 字节
# ClientKeyExchange:  ~70 字节
# Finished:           ~50 字节
#
# TLS 1.2 握手总传输: ~4000~6000 字节
# TLS 1.3 握手总传输: ~3500~5000 字节（少了几个消息）
\`\`\`

**优化启示**：证书链大小直接影响握手流量。用 ECDSA 证书 + 中间证书合并优化，可以把证书链从 5KB 压到 2KB 左右。

## 十、Demo 5：AES-NI 硬件加速效果

现代 Intel/AMD CPU 都支持 AES-NI 指令集，把 AES 加密从软件实现换成硬件实现，速度提升 5~10 倍。

\`\`\`bash
# 检查 CPU 是否支持 AES-NI（Linux）
grep -o aes /proc/cpuinfo | head -1
# 输出 "aes" 表示支持

# 检查 CPU 是否支持 AES-NI（macOS）
sysctl -a | grep aes
# 或
sysctl -n machdep.cpu.features | tr ' ' '\\n' | grep -i aes

# 用 openssl 测速：AES-256-GCM（开启 AES-NI）
openssl speed -evp aes-256-gcm
# 输出示例：
# type             16 bytes    64 bytes   256 bytes  1024 bytes  8192 bytes  16384 bytes
# aes-256-gcm     876543.21k  1234567.89k 2345678.90k 3456789.01k 4567890.12k 5678901.23k
# 即 5.6 GB/s！1Gbps 网络只占 CPU 不到 2%

# 对比：ChaCha20-Poly1305（无 AES-NI 时更优）
openssl speed -evp chacha20-poly1305
# 输出示例：
# chacha20-poly1305  654321.00k  987654.32k  1876543.21k  2654321.10k  3210987.65k  3541236.98k

# 强制禁用 AES-NI 看对比（仅用于测试）
openssl speed -evp aes-256-gcm -no-aesni
# 禁用 AES-NI 后速度会暴跌到 ~300 MB/s
\`\`\`

**结论**：
- 有 AES-NI：AES-256-GCM 远快于 ChaCha20，优先选 AES
- 无 AES-NI（老 ARM、低端 IoT）：ChaCha20 更快，应优先选 ChaCha20
- 浏览器会自动协商，Nginx 配置时把 AES 放前面即可

## 十一、Demo 6：用 h2load 测 HTTP/2 + HTTPS 性能

h2load 是 nghttp2 工具包里的 HTTP/2 压测工具，专门测多路复用场景：

\`\`\`bash
# 安装 nghttp2 工具包
# macOS: brew install nghttp2
# Ubuntu: apt install nghttp2-client

# 压测 HTTP/2（-m 每个连接的最大并发流数）
# -n 总请求数，-c 并发连接数，-m 每连接并发流数
h2load -n 10000 -c 100 -m 100 https://www.example.com

# 输出示例：
# finished in 1.23s, 8130.08 req/s, 12.45MB/s
# requests: 10000 issued, 10000 succeeded
# status codes: 10000 2xx, 0 3xx, 0 4xx, 0 5xx
# traffic: 15.32MB total

# 对比 HTTP/1.1（同样并发）
h2load -n 10000 -c 100 -m 1 --h1 https://www.example.com

# 对比 HTTP/2 但不开多路复用（-m 1）
h2load -n 10000 -c 100 -m 1 https://www.example.com
\`\`\`

**关键观察**：
- HTTP/2 + 多路复用（-m 100）吞吐量远高于 HTTP/1.1
- HTTP/2 把 100 个并发请求塞进 1 个 TLS 连接，握手开销被"摊薄"到 100 个请求上
- 这就是 HTTP/2 over TLS 反而比 HTTP/1.1 over TCP 快的核心原因

## 十二、性能优化方向总结

| 优化方向 | 节省的延迟 | 实施难度 | 章节 |
|---------|-----------|---------|------|
| 升级 TLS 1.3 | 1-RTT | 低 | 第 3 章 |
| 会话复用 | 1-RTT | 中 | 第 2 章（本章后续） |
| 0-RTT | 1-RTT | 高（有重放风险） | 第 5 章 |
| OCSP Stapling | 1-RTT（浏览器侧） | 低 | 第 3 章 |
| HTTP/2 多路复用 | 握手开销摊薄 | 低 | 第 4 章 |
| ECDSA 证书 | 握手 CPU | 低 | 证书章节 |
| AES-NI 硬件加速 | 加密 CPU | 无需配置 | — |
| keep-alive | 避免重复握手 | 低 | — |

## 十三、本章小结

| 知识点 | 要点 |
|-------|------|
| HTTPS 慢在哪 | 慢在握手，不在加密 |
| 握手开销来源 | CPU（非对称加密）+ 网络（RTT） |
| 加密开销 | 现代 CPU 上对称加密几乎可忽略（AES-NI 5GB/s） |
| TLS 1.2 握手 | 2-RTT |
| TLS 1.3 握手 | 1-RTT |
| 关键测量工具 | curl -w、openssl s_client、ab、h2load |
| 性能优化核心思路 | 减少握手次数（会话复用）+ 减少 RTT（TLS 1.3 / 0-RTT） |
| keep-alive 的意义 | 复用连接避免重复握手，HTTPS 性能接近 HTTP |
| 证书选择 | ECDSA 比 RSA 更快更小 |
| AES-NI | 开启后 AES 远快于 ChaCha20，无 AES-NI 选 ChaCha20 |
`
  },

  // ============================================================
  // 第二章：会话复用
  // ============================================================
  {
    id: "hs-session-resume",
    group: "HTTPS 性能与优化",
    icon: "♻️",
    title: "会话复用",
    content: `# 会话复用

## 一、为什么这一章重要

上一章我们看到，TLS 握手是 HTTPS 性能开销的大头——TLS 1.2 要 2-RTT，TLS 1.3 也要 1-RTT。如果用户每次访问你的网站都要重新握手，那每次请求都要额外吃掉 100~300ms，体验会很差。

但仔细想想：用户 5 秒前刚握过手，5 秒后又来一个请求，为什么还要再握一次？这就好比你刚在酒店登记入住，5 分钟后下楼拿个快递，前台又让你重新登记一遍身份证——荒谬吧？**会话复用**就是解决这个问题的：让"老顾客"免登记，直接复用上次的会话密钥。

会话复用能把 TLS 1.2 的 2-RTT 压到 1-RTT，把 TLS 1.3 的 1-RTT 压到 0-RTT（下一章讲）。对于回访用户多的网站（电商、社交、SaaS），会话复用率每提高 10%，平均页面加载时间能下降几十毫秒。这一章是 HTTPS 性能优化的**核心章节**。

> 生活类比：会话复用就像"老顾客免登记"。第一次去酒店要登记身份证（完整握手），之后你拿着房卡（Session Ticket）进出，前台扫一下房卡就放行（复用会话），不用再登记。房卡是酒店加密签发的，别人伪造不了。

## 二、为什么需要会话复用

### 2.1 没有会话复用的世界

假设用户访问一个网页，里面有 20 个资源（图片、CSS、JS）。如果不开 keep-alive，浏览器要建 20 个 TCP+TLS 连接：

- 每个连接：TCP 1-RTT + TLS 1.2 2-RTT = 3-RTT
- 20 个连接：60-RTT
- 假设 RTT = 100ms：6 秒只用来握手！

即使开了 keep-alive，浏览器通常也会开 6 个并发连接，每个连接第一次都要握手。而且用户离开页面再回来，连接已经断了，又要重新握手。

### 2.2 有会话复用的世界

会话复用让"之前握过手的客户端"在重新连接时，跳过完整的密钥交换，直接用之前协商好的密钥：

- TLS 1.2 + Session Ticket：1-RTT（从 2-RTT 降到 1-RTT）
- TLS 1.3 + PSK：1-RTT（从 1-RTT 降到 1-RTT，但首包数据可提前）
- TLS 1.3 + 0-RTT：0-RTT（首包数据随 ClientHello 发出）

对于回访用户，会话复用几乎能砍掉一半的握手延迟。

## 三、会话复用的三种方式

### 3.1 Session ID（TLS 1.0 引入，TLS 1.2 早期主流）

**原理**：服务端在握手时生成一个 Session ID，把会话状态（主密钥、密码套件等）缓存在服务端内存里，把 Session ID 发给客户端。客户端下次连接时带上 Session ID，服务端从缓存里找到对应状态，跳过密钥交换。

\`\`\`text
第一次握手：
客户端 ---ClientHello(带空 Session ID)---> 服务端
客户端 <---ServerHello(带 Session ID=abc)--- 服务端
客户端 <---Certificate / ServerKeyExchange--- 服务端
... 完整密钥交换 ...
（服务端把会话状态存到内存：sessions["abc"] = {...}）

第二次握手（复用）：
客户端 ---ClientHello(带 Session ID=abc)---> 服务端
（服务端查 sessions["abc"]，命中！）
客户端 <---ServerHello(带 Session ID=abc)--- 服务端
客户端 <---ChangeCipherSpec / Finished--- 服务端
（跳过 Certificate / ServerKeyExchange，直接进入加密）
\`\`\`

**优点**：简单，服务端完全可控。
**缺点**：
- 服务端要存所有客户端的会话状态，内存压力大（单机几万连接就占几百 MB）
- 多机部署时，会话状态存在 A 机器，请求落到 B 机器就复用不了（除非用共享缓存如 Redis/Memcached）
- 现代场景基本被 Session Ticket 取代

### 3.2 Session Ticket（TLS 1.2 主流）

**原理**：服务端不存会话状态，而是把状态加密成一个"票据"（Session Ticket）发给客户端。客户端下次连接时把票据带回来，服务端用只有自己知道的密钥解密票据，恢复会话状态。

\`\`\`text
第一次握手：
客户端 ---ClientHello---> 服务端
... 完整密钥交换 ...
客户端 <---NewSessionTicket(加密票据)--- 服务端
（服务端：用 ticket_key 加密 会话状态 → 票据，发给客户端）
（服务端不存任何东西！）

第二次握手（复用）：
客户端 ---ClientHello(带 Session Ticket)---> 服务端
（服务端用 ticket_key 解密票据 → 恢复会话状态）
客户端 <---ServerHello--- 服务端
客户端 <---ChangeCipherSpec / Finished--- 服务端
（跳过密钥交换）
\`\`\`

**优点**：
- 服务端无状态，不占内存
- 多机部署只要共享 ticket_key，任何机器都能解密票据
- 是 TLS 1.2 的主流方案

**缺点**：
- 票据加密密钥（ticket_key）泄露 = 所有会话可被解密（破坏前向保密）
- 需要定期轮换 ticket_key

### 3.3 PSK（TLS 1.3 专用）

**原理**：TLS 1.3 取消了 Session ID 和 Session Ticket 的区分，统一用 PSK（Pre-Shared Key）。第一次握手完成后，服务端发 NewSessionTicket，里面包含一个 PSK。客户端下次连接时在 ClientHello 里带上 PSK 标识，服务端验证后跳过证书验证和密钥交换。

TLS 1.3 的 PSK 还支持 **0-RTT 模式**：客户端在 ClientHello 里直接附带应用数据（HTTP 请求），服务端验证 PSK 后直接处理。这是下一章的重点。

\`\`\`text
TLS 1.3 PSK 复用（1-RTT）：
客户端 ---ClientHello(含 PSK 标识)---> 服务端
客户端 <---ServerHello--- 服务端
客户端 <---Finished--- 服务端
（跳过 Certificate / CertificateVerify）
客户端 ---Finished---> 服务端
客户端 ===应用数据===>

TLS 1.3 0-RTT（早期数据）：
客户端 ---ClientHello(含 PSK + 早期数据)---> 服务端
（服务端验证 PSK，直接处理早期数据）
客户端 <---ServerHello + Finished--- 服务端
\`\`\`

## 四、Demo 1：openssl 测试 Session ID 复用

\`\`\`bash
# 第一次连接：保存会话到 session.pem
# -sess_out：把会话状态保存到文件
openssl s_client -connect www.example.com:443 -sess_out session.pem < /dev/null 2>/dev/null

# 查看保存的会话信息
openssl s_client -connect www.example.com:443 -sess_in session.pem < /dev/null 2>/dev/null | grep -E "Reused|Session-ID"

# 第二次连接：用保存的会话复用
# -sess_in：从文件加载会话状态
openssl s_client -connect www.example.com:443 -sess_in session.pem < /dev/null 2>/dev/null

# 在输出中查找 "Reused" 字段：
# Reused, TLSv1.2  ← 表示复用成功
# (no Reused)       ← 表示未复用，走了完整握手

# 对比两次握手的耗时
echo "=== 第一次（完整握手）==="
time openssl s_client -connect www.example.com:443 -sess_out session.pem < /dev/null 2>/dev/null

echo "=== 第二次（会话复用）==="
time openssl s_client -connect www.example.com:443 -sess_in session.pem < /dev/null 2>/dev/null

# 典型结果：
# 第一次：real 0m0.298s（2-RTT）
# 第二次：real 0m0.187s（1-RTT，节省 1-RTT）
\`\`\`

## 五、Demo 2：Nginx 配置 Session Cache

\`\`\`nginx
# /etc/nginx/nginx.conf 或站点配置

server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 证书配置
    ssl_certificate     /etc/letsencrypt/live/www.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.com/privkey.pem;

    # ===== Session Cache（Session ID 方式）=====
    # shared:SSL:10m 表示在所有 worker 间共享一块 10MB 的缓存
    # 1MB 大约能存 4000 个会话，10MB 约 4 万个会话
    ssl_session_cache shared:SSL:10m;

    # 会话超时时间，超过这个时间未复用的会话被清除
    # 1d = 1 天，生产环境常用 1d~7d
    ssl_session_timeout 1d;

    # ===== Session Ticket（Session Ticket 方式）=====
    # 开启 Session Ticket（默认就是 on）
    ssl_session_tickets on;

    # 可选：手动指定 ticket 加密密钥文件（多机部署时共享同一密钥）
    # ssl_session_ticket_key /etc/nginx/ticket.key;

    # 其他优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
}
\`\`\`

**多机部署的关键**：如果有多台 Nginx，必须共享 \`ssl_session_ticket_key\`，否则用户在 A 机器拿的 Ticket，请求落到 B 机器解不开。

\`\`\`bash
# 生成 ticket 密钥（80 字节随机数）
openssl rand 80 > /etc/nginx/ticket.key

# 把这个文件复制到所有 Nginx 机器上（权限 600）
chmod 600 /etc/nginx/ticket.key

# 定期轮换（比如每周），轮换时新旧密钥并存一段时间
# Nginx 支持：ssl_session_ticket_key 文件1 当前密钥; 文件2 上一代密钥; 文件3 上上代密钥
ssl_session_ticket_key /etc/nginx/ticket_current.key;
ssl_session_ticket_key /etc/nginx/ticket_prev.key;
\`\`\`

## 六、Demo 3：用 Python ssl 测试会话复用

Python 的 ssl 模块支持会话复用，可以写脚本验证：

\`\`\`python
import ssl
import socket
import time

# 创建默认 SSL 上下文
ctx = ssl.create_default_context()

# 第一次连接：完整握手
host = "www.example.com"
print("=== 第一次连接（完整握手）===")
start = time.time()
s1 = socket.create_connection((host, 443))
# wrap_socket 完成 TLS 握手
ss1 = ctx.wrap_socket(s1, server_hostname=host)
session = ss1.session  # 保存会话对象
print(f"协议: {ss1.version()}")
print(f"密码套件: {ss1.cipher()[0]}")
print(f"耗时: {time.time() - start:.3f}s")
ss1.close()

# 第二次连接：复用会话
print("\\n=== 第二次连接（会话复用）===")
ctx2 = ssl.create_default_context()
start = time.time()
s2 = socket.create_connection((host, 443))
# 把上次保存的 session 传进去，尝试复用
ss2 = ctx2.wrap_socket(s2, server_hostname=host, session=session)
print(f"是否复用: {ss2.session_reused}")  # True 表示复用成功
print(f"协议: {ss2.version()}")
print(f"耗时: {time.time() - start:.3f}s")
ss2.close()

# 批量测试复用率
print("\\n=== 批量测试复用率 ===")
reused = 0
total = 20
for i in range(total):
    ctx_i = ssl.create_default_context()
    s_i = socket.create_connection((host, 443))
    ss_i = ctx_i.wrap_socket(s_i, server_hostname=host, session=session)
    if ss_i.session_reused:
        reused += 1
    ss_i.close()
print(f"复用率: {reused}/{total} = {reused/total*100:.0f}%")
\`\`\`

## 七、Demo 4：Session Ticket 安全性分析

Session Ticket 的核心风险：**ticket_key 泄露会破坏前向保密**。

### 7.1 前向保密是什么

前向保密（PFS）的意思是：即使服务端的长期私钥（证书私钥）泄露，**过去已传输的会话也无法被解密**——因为每次会话的临时密钥是 ECDHE 实时协商的，握手完就丢弃。

### 7.2 Session Ticket 如何破坏前向保密

但 Session Ticket 引入了一个新密钥：ticket_key。如果攻击者：
1. 录制了所有过往流量（被动监听）
2. 后来拿到了 ticket_key

那么攻击者可以：解密 Session Ticket → 拿到会话主密钥 → 解密整个会话。前向保密就被破坏了。

### 7.3 防护措施

\`\`\`python
# 模拟 Session Ticket 的加密解密过程
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# ticket_key 是服务端的"根密钥"，必须严加保护
ticket_key = os.urandom(32)  # 32 字节 AES-256 密钥

def create_session_ticket(session_data: bytes) -> bytes:
    """服务端：把会话状态加密成票据"""
    nonce = os.urandom(12)  # 每次加密用新的 nonce
    aesgcm = AESGCM(ticket_key)
    # nonce + 密文 拼在一起作为票据
    ciphertext = aesgcm.encrypt(nonce, session_data, None)
    return nonce + ciphertext

def decrypt_session_ticket(ticket: bytes) -> bytes:
    """服务端：解密票据恢复会话状态"""
    nonce = ticket[:12]
    ciphertext = ticket[12:]
    aesgcm = AESGCM(ticket_key)
    return aesgcm.decrypt(nonce, ciphertext, None)

# 演示
session_data = b"master_secret=abc123, cipher=AES256-GCM"
ticket = create_session_ticket(session_data)
print(f"票据长度: {len(ticket)} 字节")
print(f"恢复的会话: {decrypt_session_ticket(ticket)}")

# 安全要点：
# 1. ticket_key 必须定期轮换（如每周）
# 2. 轮换时新旧 key 并存，让旧票据自然过期
# 3. ticket_key 不能写到代码仓库，应该用 KMS 或配置中心管理
# 4. 多机部署共享 key 时，要走加密通道分发
\`\`\`

## 八、Demo 5：TLS 1.3 PSK 会话恢复

\`\`\`bash
# 检查服务端是否支持 TLS 1.3 PSK（看是否发 NewSessionTicket）
openssl s_client -connect www.example.com:443 -tls1_3 < /dev/null 2>&1 | grep -A2 "NewSessionTicket"

# 输出示例：
# NewSessionTicket, TLSv1.3
#   lifetime: 86400        # 票据有效期 1 天
#   age_add: 1234567       # 防重放用的偏移量
#   nonce: ...             # 单调递增的 nonce
#   ticket: <hex...>       # 加密票据
\`\`\`

\`\`\`python
# Python 测试 TLS 1.3 PSK 复用
import ssl
import socket

# 强制 TLS 1.3
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS)
ctx.minimum_version = ssl.TLSVersion.TLSv1_3
ctx.maximum_version = ssl.TLSVersion.TLSv1_3

host = "www.example.com"

# 第一次握手
s1 = socket.create_connection((host, 443))
ss1 = ctx.wrap_socket(s1, server_hostname=host)
print(f"协议: {ss1.version()}")  # TLSv1.3
session = ss1.session
ss1.close()

# 第二次握手（PSK 复用）
ctx2 = ssl.SSLContext(ssl.PROTOCOL_TLS)
ctx2.minimum_version = ssl.TLSVersion.TLSv1_3
ctx2.maximum_version = ssl.TLSVersion.TLSv1_3
s2 = socket.create_connection((host, 443))
ss2 = ctx2.wrap_socket(s2, server_hostname=host, session=session)
print(f"是否复用 PSK: {ss2.session_reused}")
ss2.close()
\`\`\`

## 九、Demo 6：会话复用率监控

生产环境要持续监控会话复用率，过低说明配置有问题：

\`\`\`bash
# 方法 1：Nginx 日志记录复用情况
# 在 nginx.conf 的 log_format 里加 $ssl_session_reused
log_format main '$remote_addr - $remote_user [$time_local] '
                 '"$request" $status $body_bytes_sent '
                 '"$http_referer" "$http_user_agent" '
                 'ssl_session_reused=$ssl_session_reused';

# 日志示例：
# 1.2.3.4 - - [13/Jul/2026:10:00:00 +0800] "GET / HTTP/1.1" 200 1234
#   ssl_session_reused=r   ← r 表示复用，. 表示未复用

# 方法 2：统计复用率
# 假设日志在 /var/log/nginx/access.log
total=$(wc -l < /var/log/nginx/access.log)
reused=$(grep -c "ssl_session_reused=r" /var/log/nginx/access.log)
echo "总请求: $total"
echo "复用请求: $reused"
echo "复用率: $(echo "scale=2; $reused * 100 / $total" | bc)%"
\`\`\`

\`\`\`python
# 用 Python 实时统计会话复用率（模拟）
import random
from collections import Counter

# 模拟 Nginx 日志流
def simulate_nginx_log(n=1000):
    logs = []
    for _ in range(n):
        reused = "r" if random.random() < 0.7 else "."  # 70% 复用率
        logs.append(reused)
    return logs

# 统计复用率
logs = simulate_nginx_log(10000)
counter = Counter(logs)
total = len(logs)
reused = counter["r"]
print(f"总连接数: {total}")
print(f"复用连接: {reused}")
print(f"未复用: {counter['.']}")
print(f"复用率: {reused/total*100:.1f}%")

# 复用率低于 50% 要排查：
# 1. ssl_session_timeout 是否太短
# 2. ssl_session_cache 是否太小（缓存满了会踢出旧会话）
# 3. 多机部署是否共享了 ticket_key
# 4. 客户端是否禁用了会话复用（部分浏览器隐私模式会禁用）
\`\`\`

## 十、三种会话复用方式对比

| 特性 | Session ID | Session Ticket | TLS 1.3 PSK |
|------|-----------|----------------|-------------|
| 引入版本 | TLS 1.0 | TLS 1.2 | TLS 1.3 |
| 状态存储 | 服务端内存 | 客户端（加密票据） | 客户端（加密票据） |
| 多机部署 | 需共享缓存 | 共享 ticket_key | 共享 ticket_key |
| 复用后 RTT | 1-RTT | 1-RTT | 1-RTT（或 0-RTT） |
| 前向保密 | 保留 | 破坏（ticket_key 泄露时） | 破坏（同 Ticket） |
| 安全风险 | 低 | 中（key 泄露） | 中（key 泄露 + 重放） |
| 现状 | 逐步淘汰 | TLS 1.2 主流 | TLS 1.3 唯一方式 |

## 十一、本章小结

| 知识点 | 要点 |
|-------|------|
| 会话复用的价值 | 避免每次完整握手，节省 1-RTT |
| Session ID | 服务端缓存状态，多机部署难，已淘汰 |
| Session Ticket | 服务端无状态，客户端存加密票据，TLS 1.2 主流 |
| TLS 1.3 PSK | 统一的会话复用机制，支持 0-RTT |
| Nginx 配置 | ssl_session_cache + ssl_session_tickets on |
| 多机部署关键 | 共享 ticket_key |
| 安全风险 | ticket_key 泄露破坏前向保密，需定期轮换 |
| 监控指标 | 会话复用率（通过 $ssl_session_reused） |
| 复用率低排查 | timeout 太短、cache 太小、key 未共享 |
`
  },

  // ============================================================
  // 第三章：OCSP Stapling 优化
  // ============================================================
  {
    id: "hs-ocsp-stapling",
    group: "HTTPS 性能与优化",
    icon: "📌",
    title: "OCSP Stapling 优化",
    content: `# OCSP Stapling 优化

## 一、为什么这一章重要

TLS 握手时，服务端会把证书链发给客户端。但客户端怎么知道这个证书**没被吊销**？比如私钥泄露了，CA 把证书加入 CRL（吊销列表），客户端必须能查到这个状态。这就涉及证书吊销检查机制。

早期方案是 CRL（证书吊销列表）：CA 定期发布一个"被吊销的证书列表"，客户端下载这个列表检查。但 CRL 越来越大（几 MB），下载慢、更新不及时，已经被淘汰。

替代方案是 OCSP（在线证书状态协议）：客户端实时向 CA 查询某个证书的状态。但 OCSP 也有问题——慢、隐私泄露。**OCSP Stapling** 是 OCSP 的优化版：让服务端预先获取 OCSP 响应，在 TLS 握手时"装订"（staple）在一起发给客户端。客户端不用再去 CA 查，既快又保护隐私。

这一章讲清楚 OCSP 的问题、Stapling 的原理、Nginx 配置和常见排查。

> 生活类比：OCSP 就像"每次进酒店前台都要打电话给派出所查你身份证是否有效"——慢，而且派出所知道了你每次住哪个酒店（隐私泄露）。OCSP Stapling 就像"酒店提前去派出所开了个'身份证有效的证明'，你入住时直接出示证明"——快，而且派出所不知道你什么时候来住。

## 二、OCSP 的问题

### 2.1 OCSP 工作流程（无 Stapling）

\`\`\`text
1. 客户端访问 https://example.com
2. TLS 握手，服务端发证书
3. 客户端从证书里读到 OCSP 服务器地址（如 http://ocsp.example-ca.com）
4. 客户端额外发一个 HTTP 请求到 OCSP 服务器查询证书状态
5. OCSP 服务器返回 "good" / "revoked" / "unknown"
6. 客户端确认有效后，继续 TLS 握手
\`\`\`

### 2.2 三个问题

**问题 1：性能差**
- 客户端要多发一个 HTTP 请求到 OCSP 服务器
- OCSP 服务器在境外（如 Let's Encrypt 的 OCSP 在美国），国内访问慢
- 额外增加 100~500ms 延迟

**问题 2：隐私泄露**
- 客户端每次访问你的网站，CA 都知道（因为客户端在向 CA 查询你的证书状态）
- CA 能画出"谁在什么时候访问了你的网站"的图谱

**问题 3：可用性依赖**
- 如果 OCSP 服务器挂了或被墙，客户端要么等超时（慢），要么忽略检查（不安全）
- 浏览器的策略不一：Chrome 直接忽略（用自己 CRL 集合），Firefox 严格检查可能阻断访问

### 2.3 OCSP 响应格式

OCSP 响应是 CA 签名的一段数据，包含：

\`\`\`text
Certificate Status: good（或 revoked / unknown）
This Update: 2026-07-10 00:00:00 UTC（本次更新时间）
Next Update: 2026-07-17 00:00:00 UTC（下次更新时间）
Signature: <CA 的签名>
\`\`\`

客户端验证 CA 签名后即可信任这个状态，不用再实时查询。

## 三、OCSP Stapling 原理

OCSP Stapling 的核心思想：**让服务端代替客户端去查 OCSP**。

### 3.1 工作流程

\`\`\`text
1. 服务端定期（如每小时）主动去 CA 的 OCSP 服务器查询自己的证书状态
2. 服务端把 OCSP 响应缓存起来
3. 客户端访问时，服务端在 TLS 握手的 Certificate 消息后，
   附带一个 CertificateStatus 消息，里面是缓存的 OCSP 响应
4. 客户端验证 OCSP 响应的签名，确认证书有效，无需自己查询
\`\`\`

### 3.2 优势

| 维度 | 无 Stapling | 有 Stapling |
|------|------------|-------------|
| 客户端额外请求 | 要去 CA 查 OCSP | 不用，服务端已附带 |
| 延迟 | +100~500ms | 0 |
| 隐私 | CA 知道谁访问你 | CA 不知道 |
| 可用性 | 依赖 OCSP 服务器 | 服务端缓存，不依赖 |
| 服务端开销 | 0 | 每小时查一次（可忽略） |

## 四、Demo 1：不用 Stapling 时的浏览器行为

\`\`\`bash
# 查看证书里的 OCSP 地址
openssl x509 -in cert.pem -noout -ocsp_uri
# 输出示例：http://ocsp.int-x3.letsencrypt.org

# 手动查询 OCSP（模拟浏览器行为）
# -issuer：颁发者证书
# -cert：要查询的证书
# -url：OCSP 服务器地址
openssl ocsp -issuer chain.pem -cert cert.pem -url http://ocsp.int-x3.letsencrypt.org -resp_text

# 输出示例：
# Response verify OK
# cert.pem: good
#   This Update: Jul 10 00:00:00 2026 GMT
#   Next Update: Jul 17 00:00:00 2026 GMT

# 测量 OCSP 查询耗时（无 Stapling 时浏览器要花的时间）
time openssl ocsp -issuer chain.pem -cert cert.pem -url http://ocsp.int-x3.letsencrypt.org
# 典型结果：0.3~2s（取决于网络和 OCSP 服务器位置）
\`\`\`

可以看到，OCSP 查询本身就要几百毫秒到几秒，对首字节时间影响巨大。

## 五、Demo 2：Nginx 配置 OCSP Stapling

\`\`\`nginx
# /etc/nginx/conf.d/example.com.conf

server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 证书配置（注意 fullchain 必须包含中间证书）
    ssl_certificate     /etc/letsencrypt/live/www.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.com/privkey.pem;

    # ===== OCSP Stapling 配置 =====
    # 开启 OCSP Stapling
    ssl_stapling on;

    # 开启 OCSP 响应验证（验证 CA 签名，防止缓存伪造响应）
    ssl_stapling_verify on;

    # 信任的 CA 证书链（用于验证 OCSP 响应的签名）
    # 通常用 fullchain.pem 或 CA 的根证书
    ssl_trusted_certificate /etc/letsencrypt/live/www.example.com/chain.pem;

    # DNS 解析器（Nginx 解析 OCSP 服务器域名时需要）
    # 必须配！否则 Nginx 无法解析 ocsp.xxx.com
    # valid=300s 表示 DNS 结果缓存 5 分钟
    resolver 8.8.8.8 8.8.4.4 valid=300s;

    # DNS 解析超时
    resolver_timeout 5s;

    # 其他 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
}
\`\`\`

**关键坑点**：
1. \`ssl_trusted_certificate\` 必须配，否则 \`ssl_stapling_verify on\` 会失败
2. \`resolver\` 必须配，否则 Nginx 无法解析 OCSP 服务器域名
3. \`ssl_certificate\` 必须是 fullchain（含中间证书），否则 Stapling 不工作

## 六、Demo 3：测试 OCSP Stapling 是否生效

\`\`\`bash
# 用 openssl s_client 检查 Stapling
# -status：请求 OCSP Stapling 状态
openssl s_client -connect www.example.com:443 -status < /dev/null 2>/dev/null | grep -A20 "OCSP Response"

# 生效的输出：
# OCSP response:
# OCSP Response Status: successful          ← 成功
# Response Type: Basic OCSP Response
# Version: 1
# Responder Id: ...
# Produced At: Jul 10 10:00:00 2026 GMT
# Responses:
# Certificate Status: good                  ← 证书有效
# This Update: Jul 10 10:00:00 2026 GMT
# Next Update: Jul 14 10:00:00 2026 GMT

# 未生效的输出：
# OCSP response: no response sent           ← 服务端没附带 OCSP
\`\`\`

\`\`\`bash
# 重启 Nginx 后立即检查，可能显示 "no response sent"
# 因为 Nginx 需要时间去获取 OCSP 响应（异步）
# 等待 1~2 分钟后再测

# 查看 Nginx 错误日志，排查 Stapling 问题
tail -f /var/log/nginx/error.log | grep -i ocsp

# 常见错误：
# "certificate not found" → ssl_trusted_certificate 路径错
# "host not found in resolver" → resolver 没配或 DNS 不通
# "ocsp response verify failed" → 证书链不完整
\`\`\`

## 七、Demo 4：用 Python 获取 OCSP 响应并检查

\`\`\`python
# 用 Python 主动获取 OCSP 响应（模拟服务端的预取逻辑）
# 需要安装：pip install cryptography requests
import base64
import requests
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.x509.ocsp import OCSPRequestBuilder, load_der_ocsp_response

# 1. 读取证书和颁发者证书
with open("cert.pem", "rb") as f:
    cert = x509.load_pem_x509_certificate(f.read())
with open("chain.pem", "rb") as f:
    issuer = x509.load_pem_x509_certificate(f.read())

# 2. 构造 OCSP 请求
builder = OCSPRequestBuilder()
builder = builder.add_certificate(cert, issuer, hashes.SHA256())
ocsp_request = builder.build()
req_der = ocsp_request.public_bytes(serialization.Encoding.DER)

# 3. 从证书里提取 OCSP 服务器地址
ocsp_urls = cert.extensions.get_extension_for_class(
    x509.AuthorityInformationAccess
).value
ocsp_url = [u.access_location.value for u in ocsp_urls
            if u.access_method == x509.oid.AuthorityInformationAccessOID.OCSP][0]
print(f"OCSP 服务器: {ocsp_url}")

# 4. 发送 OCSP 请求
import time
start = time.time()
resp = requests.post(
    ocsp_url,
    data=req_der,
    headers={"Content-Type": "application/ocsp-request"}
)
elapsed = time.time() - start
print(f"OCSP 查询耗时: {elapsed:.3f}s")

# 5. 解析响应
ocsp_resp = load_der_ocsp_response(resp.content)
print(f"响应状态: {ocsp_resp.response_status}")  # SUCCESSFUL
print(f"证书状态: {ocsp_resp.certificate_status}")  # GOOD
print(f"本次更新: {ocsp_resp.this_update_utc}")
print(f"下次更新: {ocsp_resp.next_update_utc}")

# 6. 把 OCSP 响应保存下来（Nginx 也可以用文件方式提供）
with open("ocsp.der", "wb") as f:
    f.write(resp.content)
print("已保存到 ocsp.der，可作为 ssl_stapling_file 使用")
\`\`\`

## 八、Demo 5：排查 Stapling 不工作的问题

### 8.1 问题 1：证书链不完整

\`\`\`bash
# 错误现象：nginx error.log 显示
# "cannot get certificate chain"

# 检查 ssl_certificate 是否包含完整链
openssl s_client -connect www.example.com:443 -showcerts < /dev/null 2>/dev/null | grep -c "BEGIN CERTIFICATE"
# 应该输出 2 或 3（叶子证书 + 中间证书 + 可选根证书）
# 如果只有 1，说明只配了叶子证书，要换成 fullchain.pem

# 修复：用 fullchain.pem 而不是 cert.pem
ssl_certificate /etc/letsencrypt/live/www.example.com/fullchain.pem;
\`\`\`

### 8.2 问题 2：resolver 配置缺失

\`\`\`bash
# 错误现象：nginx error.log 显示
# "host not found in resolver" 或 "no resolver defined to resolve..."

# Nginx 启动时不解析 OCSP 域名，运行时才解析，所以必须配 resolver
# 检查配置
nginx -T 2>/dev/null | grep resolver
# 如果没有，加上：
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# 国内服务器建议用国内 DNS：
# resolver 223.5.5.5 223.6.6.6 valid=300s;  # 阿里 DNS
\`\`\`

### 8.3 问题 3：OCSP 服务器不可达

\`\`\`bash
# 错误现象：nginx error.log 显示
# "ocsp query timed out" 或 "OCSP responder not responding"

# 手动测试 OCSP 服务器连通性
curl -v http://ocsp.int-x3.letsencrypt.org -o /dev/null

# 国内服务器访问境外 OCSP 经常超时
# 解决方案：
# 1. 配置 Nginx 走代理访问 OCSP（不推荐，复杂）
# 2. 用 ssl_stapling_file 手动指定 OCSP 响应文件（用 cron 定时更新）

# 方案 2 示例：
# 关闭自动获取
ssl_stapling off;
# 用文件提供（手动维护）
ssl_stapling_file /etc/nginx/ocsp/www.example.com.der;

# 配合 cron 定时更新：
# crontab -e
# 0 */6 * * * /usr/local/bin/fetch_ocsp.sh www.example.com
\`\`\`

\`\`\`bash
# fetch_ocsp.sh 内容：
#!/bin/bash
DOMAIN=$1
CERT=/etc/letsencrypt/live/$DOMAIN/cert.pem
CHAIN=/etc/letsencrypt/live/$DOMAIN/chain.pem
OUT=/etc/nginx/ocsp/$DOMAIN.der

openssl ocsp -issuer $CHAIN -cert $CERT \
  -url $(openssl x509 -in $CERT -noout -ocsp_uri | cut -d: -f2-) \
  -respout $OUT -no_nonce

# reload nginx 让它读新的 ocsp 文件
nginx -s reload
\`\`\`

## 九、Demo 6：Must-Staple 扩展

Must-Staple 是证书的一个扩展（RFC 7633），声明"这张证书**必须**用 OCSP Stapling，否则应拒绝"。这是为了防止降级攻击——攻击者不能通过阻止 Stapling 来让浏览器回退到不检查吊销。

### 9.1 查看证书是否有 Must-Staple

\`\`\`bash
# 检查证书的扩展
openssl x509 -in cert.pem -noout -text | grep -A2 "TLS Feature"

# 有 Must-Staple 的证书会显示：
# TLS Feature:
#   status_request

# 用 Python 检查
\`\`\`

\`\`\`python
from cryptography import x509
from cryptography.x509.oid import ExtensionOID

with open("cert.pem", "rb") as f:
    cert = x509.load_pem_x509_certificate(f.read())

try:
    ext = cert.extensions.get_extension_for_oid(ExtensionOID.TLS_FEATURE)
    features = ext.value
    # status_request = OCSP Must-Staple
    has_must_staple = any(
        f == x509.TLSFeatureType.status_request for f in features
    )
    print(f"Must-Staple: {'是' if has_must_staple else '否'}")
except x509.ExtensionNotFound:
    print("Must-Staple: 否（无此扩展）")
\`\`\`

### 9.2 申请 Must-Staple 证书

Let's Encrypt 支持申请带 Must-Staple 的证书：

\`\`\`bash
# certbot 申请时加 --must-staple
certbot certonly --must-staple --redirect -d www.example.com

# 注意：申请了 Must-Staple 就**必须**正确配置 OCSP Stapling
# 否则支持 Must-Staple 的浏览器（Firefox）会拒绝访问
\`\`\`

## 十、OCSP vs OCSP Stapling 对比

| 维度 | OCSP | OCSP Stapling |
|------|------|---------------|
| 谁查询 CA | 客户端 | 服务端 |
| 查询频率 | 每次访问 | 定期（如每小时） |
| 额外延迟 | 100~500ms | 0 |
| 隐私 | CA 知道谁访问你 | CA 不知道 |
| 可用性依赖 | 依赖 OCSP 服务器实时可用 | 服务端缓存，不依赖 |
| 配置难度 | 无需配置（浏览器自带） | 需配置 Nginx |
| 客户端兼容 | 所有浏览器 | 主流浏览器支持 |

## 十一、本章小结

| 知识点 | 要点 |
|-------|------|
| OCSP 的问题 | 慢、隐私泄露、可用性依赖 |
| Stapling 原理 | 服务端预取 OCSP 响应，握手时附带 |
| Stapling 优势 | 0 额外延迟、保护隐私、不依赖 OCSP 服务器 |
| Nginx 关键配置 | ssl_stapling on + ssl_stapling_verify on + resolver |
| 常见坑 | 证书链不完整、resolver 缺失、OCSP 不可达 |
| 测试方法 | openssl s_client -status |
| 国内特殊问题 | 境外 OCSP 不可达，可用 ssl_stapling_file + cron |
| Must-Staple | 证书强制要求 Stapling，否则浏览器拒绝 |
| 监控 | 定期检查 OCSP 响应是否在有效期 |
`
  },

  // ============================================================
  // 第四章：HTTP/2 与 HTTPS 协同
  // ============================================================
  {
    id: "hs-http2-https",
    group: "HTTPS 性能与优化",
    icon: "🚄",
    title: "HTTP/2 与 HTTPS 协同",
    content: `# HTTP/2 与 HTTPS 协同

## 一、为什么这一章重要

HTTP/1.1 已经服役了 20 多年，它的设计在 1999 年是合理的，但放到今天高并发、富媒体的 Web 时代，暴露出严重问题：队头阻塞、连接利用率低、头部冗余。Google 在 2012 年推出 SPDY 协议试图解决这些问题，最终演化为 HTTP/2（2015 年正式发布）。

HTTP/2 最大的特点之一是：**在浏览器里，HTTP/2 只能跑在 TLS 之上**（RFC 7540 标准本身不强制，但所有主流浏览器都只支持 over TLS 的 HTTP/2）。这意味着 HTTP/2 和 HTTPS 是深度绑定的——要享受 HTTP/2 的性能红利，必须先上 HTTPS。反过来，HTTP/2 的多路复用特性又**摊薄了 TLS 握手的开销**，让 HTTPS 性能进一步提升。

这一章讲清楚 HTTP/2 与 HTTPS 的关系、ALPN 协商机制、Nginx 启用 HTTP/2、性能对比和常见问题。

> 生活类比：HTTP/1.1 就像"单车道公路"——一辆车坏了，后面全堵。HTTP/2 就像"多车道高速公路"——一辆车坏在其他车道，不影响你。但这条高速公路只对"装了防盗门的车辆"（HTTPS）开放，普通车辆（HTTP）不让上。

## 二、HTTP/2 与 HTTPS 的关系

### 2.1 标准 vs 现实

- **RFC 7540 标准**：HTTP/2 可以跑在 TLS 之上（h2），也可以跑在明文 TCP 之上（h2c）
- **现实**：所有主流浏览器（Chrome、Firefox、Safari、Edge）**只支持 h2（over TLS）**，不支持 h2c
- **结论**：在 Web 场景，HTTP/2 = HTTP/2 over TLS = HTTPS + HTTP/2

### 2.2 为什么浏览器只支持 over TLS

- 历史原因：SPDY（HTTP/2 前身）从一开始就跑在 TLS 上
- 部署简化：明文 HTTP/2 和 HTTP/1.1 的协商复杂（没有 Upgrade 机制的好用替代）
- 推动加密普及：Google 等厂商希望通过"用 HTTP/2 性能红利换加密普及"

### 2.3 HTTP/2 的性能改进

HTTP/2 相对 HTTP/1.1 的三大改进：

1. **多路复用（Multiplexing）**：一个 TCP 连接上同时跑多个请求/响应，互不阻塞
2. **头部压缩（HPACK）**：用 Huffman 编码 + 静态/动态表压缩 HTTP 头部
3. **服务器推送（Server Push）**：服务端可以主动推送资源（已逐步弃用，后面讲）

## 三、ALPN：握手时协商 HTTP/2

HTTP/2 over TLS 的关键机制是 **ALPN（Application-Layer Protocol Negotiation）**。它在 TLS 握手的 ClientHello 阶段就协商好应用层协议，避免握手完还要再"Upgrade"一次。

### 3.1 ALPN 工作流程

\`\`\`text
客户端                          服务端
  |  --- ClientHello --->        |
  |    (ALPN: h2, http/1.1)     |   客户端声明支持 h2 和 http/1.1
  |  <-- ServerHello ---         |
  |    (ALPN: h2)               |   服务端选择 h2
  |  <-- Certificate ---         |
  |  ... 完成 TLS 握手 ...       |
  |  === HTTP/2 帧 ===           |   直接用 HTTP/2 二进制帧通信
\`\`\`

### 3.2 NPN vs ALPN

早期 Google 用 NPN（Next Protocol Negotiation），后来 IETF 标准化为 ALPN。区别：
- NPN：服务端先声明支持的协议，客户端选
- ALPN：客户端先声明支持的协议，服务端选（更符合 TLS 设计哲学）

现在都用 ALPN，NPN 已废弃。

## 四、Demo 1：检查是否启用 HTTP/2

\`\`\`bash
# 用 curl 检查（--http2 强制用 HTTP/2）
curl -v --http2 https://www.example.com 2>&1 | grep -i alpn

# 生效的输出：
# * ALPN: server accepted h2          ← 服务端接受 h2
# * Using HTTP2, server supports multi-use

# 未生效的输出：
# * ALPN: server did not agree on a protocol. Uses http/1.1.

# 检查 HTTP 版本
curl -sI --http2 https://www.example.com | grep -i "HTTP/"
# 生效：HTTP/2 200
# 未生效：HTTP/1.1 200
\`\`\`

\`\`\`bash
# 用 openssl 检查 ALPN（更底层）
# -alpn h2:http/1.1：声明支持的协议
openssl s_client -connect www.example.com:443 -alpn h2,http/1.1 < /dev/null 2>/dev/null | grep -i alpn

# 输出示例：
# ALPN protocol: h2                  ← 协商成功用 h2
\`\`\`

## 五、Demo 2：Nginx 启用 HTTP/2

\`\`\`nginx
# /etc/nginx/conf.d/example.com.conf

server {
    # 关键：在 listen 后加 http2
    # 注意：Nginx 1.25.1+ 推荐用单独的 http2 on 指令
    listen 443 ssl http2;
    # Nginx 1.25.1+ 的新写法：
    # listen 443 ssl;
    # http2 on;

    server_name www.example.com;

    ssl_certificate     /etc/letsencrypt/live/www.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.com/privkey.pem;

    # HTTP/2 要求 TLS 1.2+
    ssl_protocols TLSv1.2 TLSv1.3;

    # HTTP/2 的密码套件黑名单（避免性能问题）
    # 实际上 Nginx 会自动处理，但显式配置更安全
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # 其他配置
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
}

# 注意事项：
# 1. HTTP/2 和 HTTP/1.1 可以共用一个 listen 端口
#    Nginx 通过 ALPN 协商，自动选择协议
# 2. HTTP/2 不支持 SSLv3/TLSv1.0/TLSv1.1
# 3. 一个 server 块只能有一个 listen 443 ssl http2
\`\`\`

\`\`\`bash
# 验证配置语法
nginx -t

# reload
nginx -s reload

# 验证 HTTP/2 已启用
curl -v --http2 https://www.example.com 2>&1 | grep -E "ALPN|HTTP/"
\`\`\`

## 六、Demo 3：HTTP/1.1 vs HTTP/2 性能对比

\`\`\`bash
# 测单个请求的延迟
echo "=== HTTP/1.1 ==="
for i in 1 2 3; do
  curl -w "%{time_total}\\n" --http1.1 -o /dev/null -s https://www.example.com
done

echo "=== HTTP/2 ==="
for i in 1 2 3; do
  curl -w "%{time_total}\\n" --http2 -o /dev/null -s https://www.example.com
done

# 单请求差异可能不大（主要省在头部压缩）
# 真正的差异在多请求场景：
\`\`\`

\`\`\`bash
# 测多请求场景（用 xargs 并发请求）
# HTTP/1.1：浏览器开 6 个连接，这里模拟开 6 个并发
echo "=== HTTP/1.1 并发 20 请求 ==="
time (seq 20 | xargs -P 6 -I {} curl --http1.1 -o /dev/null -s https://www.example.com/)

# HTTP/2：理论上 1 个连接跑 20 个请求
# 但 curl 单进程一次只发 1 个，要用 h2load 测
echo "=== HTTP/2 并发 20 请求（用 h2load）==="
h2load -n 20 -c 1 -m 20 https://www.example.com/
\`\`\`

\`\`\`python
# 用 Python 对比 HTTP/1.1 vs HTTP/2 的多请求性能
import time
import requests
import concurrent.futures

# HTTP/1.1：6 个并发连接，20 个请求
def fetch_http1(url):
    import requests
    r = requests.get(url, headers={"Connection": "close"})
    return r.status_code

url = "https://www.example.com/"
start = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
    futures = [executor.submit(fetch_http1, url) for _ in range(20)]
    results = [f.result() for f in futures]
print(f"HTTP/1.1 20 请求: {time.time() - start:.3f}s")

# HTTP/2：用 httpx 库（支持 HTTP/2）
# pip install httpx[http2]
import httpx
start = time.time()
with httpx.Client(http2=True) as client:
    # HTTP/2 一个连接多路复用，用 asyncio 更好
    for _ in range(20):
        r = client.get(url)
print(f"HTTP/2 20 请求(串行): {time.time() - start:.3f}s")

# 异步 HTTP/2（最佳性能）
import asyncio
async def fetch_async(client, url):
    r = await client.get(url)
    return r.status_code

async def main():
    async with httpx.AsyncClient(http2=True) as client:
        start = time.time()
        tasks = [fetch_async(client, url) for _ in range(20)]
        results = await asyncio.gather(*tasks)
        print(f"HTTP/2 20 请求(并发): {time.time() - start:.3f}s")

asyncio.run(main())
\`\`\`

## 七、Demo 4：用 h2load 测试 HTTP/2 并发

\`\`\`bash
# h2load 是测 HTTP/2 性能的利器

# 测试 1：单连接，高并发流（HTTP/2 的典型场景）
# -n 10000：总 10000 请求
# -c 1：1 个连接
# -m 100：每连接 100 个并发流
h2load -n 10000 -c 1 -m 100 https://www.example.com/

# 输出示例：
# finished in 0.89s, 11235.96 req/s, 18.23MB/s
# requests: 10000 issued, 10000 succeeded

# 测试 2：多连接，低并发（模拟 HTTP/1.1 风格）
h2load -n 10000 -c 100 -m 1 https://www.example.com/

# 测试 3：纯 HTTP/1.1 对比
h2load -n 10000 -c 100 -m 1 --h1 https://www.example.com/

# 关键指标对比（典型结果）：
# HTTP/2 -c 1 -m 100:  11000 req/s（1 个连接，握手 1 次）
# HTTP/2 -c 100 -m 1:   8000 req/s（100 个连接，握手 100 次）
# HTTP/1.1 -c 100:      6000 req/s（100 个连接，且队头阻塞）
#
# 结论：HTTP/2 多路复用让 1 个连接的吞吐量超过 HTTP/1.1 的 100 个连接
\`\`\`

## 八、Demo 5：HTTP/2 多路复用演示

\`\`\`python
# 演示 HTTP/2 多路复用：一个 TCP+TLS 连接跑多个请求
# 对比 HTTP/1.1 必须开多个连接

import httpx
import asyncio
import time

async def demo_multiplexing():
    url = "https://www.example.com/"

    # HTTP/2：1 个连接，100 个请求并发
    async with httpx.AsyncClient(http2=True) as client:
        start = time.time()
        tasks = [client.get(url) for _ in range(100)]
        responses = await asyncio.gather(*tasks)
        elapsed = time.time() - start
        print(f"HTTP/2: 100 请求 / 1 连接, 耗时 {elapsed:.3f}s")
        print(f"  吞吐: {100/elapsed:.0f} req/s")

    # HTTP/1.1：要开多个连接（httpx 默认连接池 limit=100）
    async with httpx.AsyncClient(http2=False) as client:
        start = time.time()
        tasks = [client.get(url) for _ in range(100)]
        responses = await asyncio.gather(*tasks)
        elapsed = time.time() - start
        print(f"HTTP/1.1: 100 请求 / 100 连接, 耗时 {elapsed:.3f}s")
        print(f"  吞吐: {100/elapsed:.0f} req/s")

asyncio.run(demo_multiplexing())

# 输出示例：
# HTTP/2: 100 请求 / 1 连接, 耗时 0.234s
#   吞吐: 427 req/s
# HTTP/1.1: 100 请求 / 100 连接, 耗时 1.123s
#   吞吐: 89 req/s
\`\`\`

\`\`\`bash
# 用 nghttp 工具直观看到 HTTP/2 的多路复用
# 安装：brew install nghttp2
nghttp -ans https://www.example.com/

# 输出会显示每个流的统计：
# ***** Statistics *****
#
# Request timing:
#   responseEnd: ...  （响应结束时间）
#   ...
# protocol: h2
# alpn: h2
# 充分展示了多个流在一个连接上交错传输
\`\`\`

## 九、Demo 6：HTTP/2 服务器推送

### 9.1 什么是服务器推送

服务端预测客户端接下来会请求什么资源（如 HTML 里的 CSS/JS），主动推送到客户端缓存里。客户端用到时直接从缓存读，不用再发请求。

### 9.2 为什么被逐步弃用

- 推送的资源客户端可能已经有缓存（浪费带宽）
- 推送的不一定是要用的（如不同分辨率的图片）
- 浏览器难以判断是否该用推送的缓存
- Chrome 在 2022 年宣布移除 HTTP/2 Server Push 支持

### 9.3 Nginx 配置（了解即可）

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 开启服务器推送
    http2_push on;

    # 或针对特定资源推送
    location / {
        # 访问 index.html 时推送 style.css
        http2_push /css/style.css;
        http2_push /js/app.js;
    }

    # 更智能：根据 Link 头推送
    location / {
        # 后端返回 Link 头，Nginx 自动推送
        # Link: </css/style.css>; rel=preload; as=style
        http2_push_preload on;
        proxy_pass http://backend;
    }
}
\`\`\`

\`\`\`python
# 后端通过 Link 头触发推送
from fastapi import FastAPI, Response

app = FastAPI()

@app.get("/")
def index():
    headers = {
        # Link 头声明要预加载的资源，Nginx 会推送它们
        "Link": "</css/style.css>; rel=preload; as=style, </js/app.js>; rel=preload; as=script"
    }
    return Response(content="<html>...</html>", headers=headers)
\`\`\`

### 9.4 替代方案

由于 Server Push 被弃用，现在主流的资源预加载方案是：

\`\`\`html
<!-- HTML 里的 preload 指令（浏览器原生支持，更可控） -->
<link rel="preload" href="/css/style.css" as="style">
<link rel="preload" href="/js/app.js" as="script">

<!-- 或者用 103 Early Hints（HTTP 状态码 103） -->
<!-- 服务端先发 103 响应头告诉浏览器预加载，再发真正的 200 响应 -->
\`\`\`

\`\`\`nginx
# Nginx 1.21+ 支持 103 Early Hints
server {
    location / {
        add_header Link "</css/style.css>; rel=preload; as=style" always;
        # 客户端收到 103 后会先去加载这些资源
    }
}
\`\`\`

## 十、HTTP/1.1 vs HTTP/2 对比

| 特性 | HTTP/1.1 | HTTP/2 |
|------|---------|--------|
| 传输格式 | 文本 | 二进制帧 |
| 多路复用 | 不支持（每请求一连接） | 支持（一连接多请求） |
| 队头阻塞 | 有（应用层 + TCP 层） | 仅 TCP 层 |
| 头部压缩 | 无 | HPACK |
| 服务器推送 | 无 | 有（逐步弃用） |
| 加密要求 | 可选 | 浏览器强制 TLS |
| 协商机制 | Upgrade 头 | ALPN |
| 连接利用率 | 低（6 个并发连接） | 高（1 连接多路复用） |
| 性能（高并发） | 一般 | 显著提升 |

## 十一、本章小结

| 知识点 | 要点 |
|-------|------|
| HTTP/2 与 HTTPS | 浏览器只支持 HTTP/2 over TLS |
| ALPN | TLS 握手时协商应用层协议（h2 / http/1.1） |
| HTTP/2 三大改进 | 多路复用、头部压缩、服务器推送 |
| 多路复用价值 | 1 个 TCP+TLS 连接跑多个请求，摊薄握手开销 |
| Nginx 启用 | listen 443 ssl http2 |
| 性能对比 | 高并发场景 HTTP/2 远超 HTTP/1.1 |
| 服务器推送 | 已逐步弃用，用 preload / 103 Early Hints 替代 |
| 测试工具 | curl --http2、h2load、nghttp |
| 前置条件 | TLS 1.2+、ALPN 支持 |
`
  },

  // ============================================================
  // 第五章：0-RTT 与 TLS 1.3 优化
  // ============================================================
  {
    id: "hs-0rtt",
    group: "HTTPS 性能与优化",
    icon: "⚡",
    title: "0-RTT 与 TLS 1.3 优化",
    content: `# 0-RTT 与 TLS 1.3 优化

## 一、为什么这一章重要

前面几章我们一步步把 TLS 握手延迟降下来：TLS 1.2 的 2-RTT → TLS 1.3 的 1-RTT → 会话复用的 1-RTT。还能再降吗？答案是 0-RTT——客户端在第一个数据包（ClientHello）里就附带应用数据，服务端验证后直接处理，**第一个数据包就携带业务请求**。

0-RTT 是 TLS 1.3 的杀手锏，对回访用户能省掉 1 个 RTT 的握手延迟。对于 RTT = 100ms 的跨省访问，这意味着首字节时间从 200ms 降到 100ms；对于 RTT = 300ms 的跨国访问，从 600ms 降到 300ms，体验提升巨大。

但 0-RTT 有一个**致命的安全风险：重放攻击**。攻击者可以录制一个 0-RTT 请求，重复发给服务端，服务端会执行多次。如果是"支付 100 元"的请求，攻击者录一次能让你扣无数次钱。所以 0-RTT 不能无脑开，必须配合后端的幂等性保护。这一章讲清楚 0-RTT 的原理、配置、风险和正确的工程实践。

> 生活类比：0-RTT 就像"老顾客进店直接点单"。普通握手（1-RTT）是"进店 → 前台登记 → 点单"三步；0-RTT 是老顾客直接喊"老样子来一份"（ClientHello 里带请求数据），前台一听声音（PSK）就认识，立刻下单。但风险是：有人录了你的声音重复播放，前台会重复下单——所以"老样子"必须是幂等的（再来一份相同的菜没问题），但"结账"绝不能用 0-RTT。

## 二、1-RTT vs 0-RTT 概念

### 2.1 什么是 RTT

RTT（Round Trip Time）是数据包从客户端到服务端再回来的往返时间。在 TLS 握手中，每多 1 个 RTT，首字节时间就多 1 倍 RTT。

### 2.2 TLS 1.3 的 1-RTT 握手回顾

\`\`\`text
客户端                          服务端
  |  --- ClientHello --->        |   RTT 1 开始
  |      (KeyShare)              |
  |  <-- ServerHello ---         |
  |  <-- Finished ---            |   RTT 1 结束
  |  --- Finished -->            |
  |  === 应用数据 ===>           |   应用数据要等 RTT 1 结束才能发
\`\`\`

应用数据（HTTP 请求）必须等握手完成（1-RTT）后才能发。总延迟 = 1-RTT（TLS）+ 1-RTT（请求响应）= 2-RTT。

### 2.3 TLS 1.3 的 0-RTT 模式

\`\`\`text
客户端                          服务端
  |  --- ClientHello --->        |
  |      (PSK + 早期数据)        |   ← 早期数据（HTTP 请求）随 ClientHello 一起发！
  |  <-- ServerHello ---         |
  |  <-- Finished ---            |
  |  --- Finished -->            |
  |  === 后续应用数据 ===>       |
\`\`\`

客户端在 ClientHello 里直接附带"早期数据"（Early Data，即 HTTP 请求），服务端验证 PSK 后立即处理。总延迟 = 0-RTT（握手）+ 1-RTT（请求响应）= 1-RTT，**节省了 1-RTT**。

## 三、0-RTT 的工作流程

### 3.1 前置条件

0-RTT 基于 **PSK 会话恢复**（第 2 章讲过）。客户端必须之前握过手，拿到服务端发的 NewSessionTicket，里面含 PSK。第一次访问的新客户端无法 0-RTT。

### 3.2 详细流程

\`\`\`text
=== 第一次访问（完整握手，1-RTT）===

客户端                          服务端
  |  --- ClientHello --->        |
  |  <-- ServerHello ---         |
  |  <-- Finished ---            |
  |  --- Finished -->            |
  |  <== NewSessionTicket ===    |   服务端发 PSK 票据
  |  === HTTP 请求 ===>          |
  |  <== HTTP 响应 ===           |
  
（客户端保存 PSK）

=== 第二次访问（0-RTT）===

客户端                          服务端
  |  --- ClientHello --->        |
  |      (PSK 标识)              |
  |      + Early Data (HTTP 请求)|   ← 第一个包就带 HTTP 请求！
  |                              |   服务端收到后：
  |                              |   1. 验证 PSK 有效性
  |                              |   2. 解密 Early Data
  |                              |   3. 直接处理 HTTP 请求
  |  <-- ServerHello ---         |
  |  <-- Finished ---            |
  |  <== HTTP 响应 ===           |   ← 响应可以立即发
  |  --- Finished -->            |
  |  === 后续请求 ===>           |
\`\`\`

### 3.3 0-RTT 的加密

早期数据用从 PSK 派生的密钥加密，不是完整握手协商的密钥。这意味着：
- 早期数据**没有前向保密**（PSK 泄露 = 早期数据被解密）
- 早期数据用的是 PSK 派生密钥，握手完成后切换到 ECDHE 协商的密钥

## 四、0-RTT 的安全风险：重放攻击

### 4.1 重放攻击原理

这是 0-RTT 最大的风险。攻击者只要录制一个 0-RTT 请求，就能重复发送：

\`\`\`text
=== 正常流程 ===
客户端 ---ClientHello + Early Data("POST /pay 100元")---> 服务端
服务端处理：扣款 100 元，返回成功

=== 攻击流程 ===
攻击者录下上面的 ClientHello + Early Data
攻击者 ---录制的 ClientHello + Early Data---> 服务端
服务端验证 PSK 有效 → 解密 Early Data → 执行 "POST /pay 100元" → 又扣 100 元！
攻击者重复 N 次 → 扣 N × 100 元
\`\`\`

### 4.2 为什么 1-RTT 没有这个问题

1-RTT 握手中，应用数据在握手完成后才发送，握手过程有 Finished 消息做完整性保护。攻击者录制后重放，因为 nonce/序列号变化，握手会失败。

而 0-RTT 的早期数据**在握手完成前就发送了**，没有 Finished 消息保护，所以可以被重放。

### 4.3 哪些操作有风险

| 操作类型 | 重放风险 | 示例 |
|---------|---------|------|
| GET 静态资源 | 无（幂等） | GET /image.jpg |
| GET 查询接口 | 低（幂等） | GET /api/user/profile |
| POST 创建资源 | 高（非幂等） | POST /api/orders |
| POST 支付 | 极高（非幂等 + 资金） | POST /api/pay |
| DELETE | 中（幂等但可能有副作用） | DELETE /api/user/123 |

## 五、Demo 1：Nginx 启用 0-RTT

\`\`\`nginx
# /etc/nginx/conf.d/example.com.conf

server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 证书和基础配置
    ssl_certificate     /etc/letsencrypt/live/www.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.com/privkey.pem;

    # 必须 TLS 1.3
    ssl_protocols TLSv1.2 TLSv1.3;

    # 开启 0-RTT（早期数据）
    # Nginx 1.15.3+ 支持
    ssl_early_data on;

    # 把 early data 状态传给后端
    # $ssl_early_data 变量：1 表示这是 0-RTT 早期数据，"" 表示普通请求
    proxy_set_header Early-Data $ssl_early_data;

    # 后端代理
    location / {
        proxy_pass http://backend;
        proxy_set_header Early-Data $ssl_early_data;
        proxy_set_header Host $host;
    }

    # 静态资源（0-RTT 安全）
    location /static/ {
        alias /var/www/static/;
        # 静态资源是幂等的，0-RTT 完全安全
    }
}
\`\`\`

\`\`\`bash
# 验证 0-RTT 是否启用
nginx -t
nginx -s reload

# 检查 Nginx 版本（需要 1.15.3+）
nginx -v

# 用 openssl 测试 0-RTT（需要 OpenSSL 1.1.1+）
openssl s_client -connect www.example.com:443 -tls1_3 \
  -early_data earlydata.txt -sess_out session.pem < /dev/null

# 模拟第二次连接（用 session 触发 0-RTT）
echo "GET / HTTP/1.1\\r\\nHost: www.example.com\\r\\n\\r\\n" > earlydata.txt
openssl s_client -connect www.example.com:443 -tls1_3 \
  -sess_in session.pem -early_data earlydata.txt 2>&1 | grep -i "early"
\`\`\`

## 六、Demo 2：用 curl 测 0-RTT

\`\`\`bash
# 第一次连接（1-RTT，建立 PSK）
curl -v --http2 --tls-max 1.3 -o /dev/null https://www.example.com 2>&1 | grep -E "TLS|HTTP|early"

# 输出会显示：
# * TLSv1.3 (IN), TLS handshake, ...
# * ALPN: server accepted h2
# 没有 "early data" 相关信息（第一次无法 0-RTT）

# 第二次连接（可能 0-RTT）
# 注意：curl 的 0-RTT 支持需要较新版本
curl -v --http2 --tls-max 1.3 -o /dev/null https://www.example.com 2>&1 | grep -i "early"

# 如果服务端支持 0-RTT 且 curl 版本够新，会看到：
# * TLSv1.3 (OUT), TLS early data
# * Sending early data

# 测延迟差异
echo "=== 第一次（1-RTT）==="
for i in 1 2 3; do
  curl -w "%{time_appconnect} -> %{time_total}\\n" --tls-max 1.3 -o /dev/null -s https://www.example.com
done

echo "=== 第二次起（0-RTT）==="
for i in 1 2 3; do
  curl -w "%{time_appconnect} -> %{time_total}\\n" --tls-max 1.3 -o /dev/null -s https://www.example.com
done
\`\`\`

\`\`\`bash
# 用 nghttp 测 0-RTT 更直观
# 第一次连接（保存 session）
nghttp -v https://www.example.com/ 2>&1 | head -20

# 第二次连接（触发 0-RTT）
# nghttp 会自动复用 session 并尝试 0-RTT
nghttp -v https://www.example.com/ 2>&1 | grep -i "early"
\`\`\`

## 七、Demo 3：0-RTT 重放攻击演示

### 7.1 攻击场景模拟（文字描述）

\`\`\`text
=== 场景 ===
用户访问 https://bank.example.com/pay，POST 转账 1000 元给 attacker
服务端开了 0-RTT，但后端没做幂等性检查

=== 步骤 1：正常请求 ===
[用户] ---ClientHello + Early Data(POST /pay 1000元)---> [服务端]
[服务端] 验证 PSK → 解密 Early Data → 执行转账 → 余额 -1000
[服务端] <---转账成功---

=== 步骤 2：攻击者录制 ===
攻击者在中间网络录制了上面的 ClientHello + Early Data
（注意：Early Data 用 PSK 派生密钥加密，但 PSK 可能被泄露，
 或者攻击者不需要解密，直接重放密文）

=== 步骤 3：重放攻击 ===
[攻击者] ---录制的 ClientHello + Early Data---> [服务端]
[服务端] 验证 PSK（同一个 PSK 可以用多次！）→ 解密 → 执行转账 → 余额 -1000
[攻击者] 重复 100 次
[服务端] 总共扣了 100 × 1000 = 10 万元！

=== 关键点 ===
1. 攻击者不需要知道 PSK 或解密内容，直接重放密文就行
2. 服务端的 PSK 验证不防重放（PSK 可以多次使用）
3. 唯一能防的是后端幂等性检查（如订单号去重）
\`\`\`

### 7.2 用 Python 模拟重放

\`\`\`python
# 模拟 0-RTT 重放攻击（演示原理，不是真实攻击代码）
import hashlib
import time

class MockTLSServer:
    """模拟开了 0-RTT 的 TLS 服务端"""
    def __init__(self):
        self.psk_store = {}  # PSK 标识 → PSK 值
        self.processed_requests = []  # 已处理的请求（用于看重复）
        self.balance = 10000  # 用户余额

    def issue_psk(self, client_id):
        """首次握手后发 PSK"""
        psk = hashlib.sha256(f"{client_id}-secret".encode()).hexdigest()
        self.psk_store[client_id] = psk
        return psk

    def handle_0rtt(self, client_id, early_data_ciphertext):
        """处理 0-RTT 请求（不防重放）"""
        # 验证 PSK（但同一个 PSK 可以用多次！）
        if client_id not in self.psk_store:
            return "PSK 无效"
        # 解密 Early Data（这里简化，直接当明文）
        early_data = early_data_ciphertext
        # 处理请求
        self.processed_requests.append((time.time(), early_data))
        if "POST /pay" in early_data:
            amount = int(early_data.split("amount=")[1])
            self.balance -= amount
            return f"支付 {amount} 元成功，余额 {self.balance}"
        return "请求处理完成"

# === 模拟攻击 ===
server = MockTLSServer()
psk = server.issue_psk("alice")

# 正常请求
print("=== 正常请求 ===")
result = server.handle_0rtt("alice", "POST /pay amount=100")
print(result)
print(f"余额: {server.balance}")

# 攻击者重放（用同一个 PSK 和 Early Data）
print("\\n=== 重放攻击（5 次）===")
captured_request = "POST /pay amount=100"  # 攻击者录制的密文
for i in range(5):
    result = server.handle_0rtt("alice", captured_request)
    print(f"第 {i+1} 次重放: {result}")

print(f"\\n最终余额: {server.balance}")
print(f"本应只扣 100，实际扣了 {10000 - server.balance}")
print(f"共处理了 {len(server.processed_requests)} 次请求（应该只有 1 次）")
\`\`\`

## 八、Demo 4：后端处理 0-RTT 的安全实践

后端必须检查 \`Early-Data\` 头，对非幂等请求返回 425 Too Early。

\`\`\`python
# FastAPI 示例：正确处理 0-RTT
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

# 幂等操作白名单
IDEMPOTENT_METHODS = {"GET", "HEAD", "OPTIONS"}
# 非幂等但安全的路径（带幂等键的可以放行）
IDEMPOTENT_PATHS = {"/api/search", "/api/log"}

@app.middleware("http")
async def check_early_data(request: Request, call_next):
    """中间件：检查 Early-Data 头"""
    early_data = request.headers.get("Early-Data")
    
    # 如果是 0-RTT 早期数据
    if early_data == "1":
        method = request.method
        path = request.url.path
        
        # 1. 幂等方法（GET/HEAD/OPTIONS）放行
        if method in IDEMPOTENT_METHODS:
            return await call_next(request)
        
        # 2. 白名单路径放行
        if path in IDEMPOTENT_PATHS:
            return await call_next(request)
        
        # 3. 带 Idempotency-Key 的请求放行（用于幂等的 POST）
        if request.headers.get("Idempotency-Key"):
            return await call_next(request)
        
        # 4. 其他非幂等请求拒绝（支付、创建、删除等）
        return JSONResponse(
            status_code=425,  # Too Early
            content={
                "error": "too_early",
                "message": "此请求需要完整握手，请重试（重试时会走完整 1-RTT）"
            }
        )
    
    # 非 0-RTT 请求，正常处理
    return await call_next(request)

# === 路由示例 ===

@app.get("/api/profile")
def get_profile():
    """GET 请求，幂等，0-RTT 安全"""
    return {"user": "alice", "age": 30}

@app.post("/api/pay")
def pay(request: Request):
    """POST 支付，非幂等，0-RTT 时会被拒绝"""
    # 如果走到这里，说明不是 0-RTT，或带了 Idempotency-Key
    return {"status": "paid", "amount": 100}

@app.post("/api/search")
def search(q: str):
    """POST 搜索，幂等（白名单），0-RTT 安全"""
    return {"results": [f"result for {q}"]}

# 客户端处理 425 的逻辑（重试）：
# import httpx
# async def safe_request():
#     async with httpx.AsyncClient(http2=True) as client:
#         r = await client.post("https://api.example.com/pay", json={...})
#         if r.status_code == 425:
#             # 0-RTT 被拒，等完整握手后重试
#             r = await client.post("https://api.example.com/pay", json={...})
#         return r.json()
\`\`\`

\`\`\`javascript
// Express (Node.js) 示例
const express = require('express');
const app = express();

// 中间件：检查 Early-Data 头
app.use((req, res, next) => {
  const isEarlyData = req.headers['early-data'] === '1';
  const method = req.method;
  const path = req.path;

  if (isEarlyData) {
    // 幂等方法放行
    const idempotentMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (idempotentMethods.includes(method)) {
      return next();
    }
    // 带 Idempotency-Key 的请求放行
    if (req.headers['idempotency-key']) {
      return next();
    }
    // 非幂等请求拒绝
    return res.status(425).json({
      error: 'too_early',
      message: '此请求需要完整握手，请重试'
    });
  }
  next();
});

// 支付接口（非幂等，0-RTT 时被拒）
app.post('/api/pay', (req, res) => {
  res.json({ status: 'paid' });
});

app.listen(3000);
\`\`\`

## 九、Demo 5：哪些操作适合 0-RTT

### 9.1 适合 0-RTT 的操作

\`\`\`python
# 适合 0-RTT 的操作：幂等 + 无副作用

suitable_for_0rtt = [
    "GET /api/user/profile",          # 查询用户信息（幂等）
    "GET /api/products?category=book", # 查询商品列表（幂等）
    "GET /static/css/style.css",       # 静态资源（幂等）
    "GET /api/articles/123",           # 查询文章（幂等）
    "HEAD /api/health",                # 健康检查（幂等）
    "OPTIONS /api/*",                  # CORS 预检（幂等）
    "POST /api/search",                # 搜索（幂等，结果不变化）
    "POST /api/log",                   # 日志上报（幂等，重复无害）
]

# 这些操作的共同点：
# 1. 重复执行 N 次，结果和执行 1 次一样
# 2. 即使被重放，也没有副作用（不扣钱、不创建资源）
\`\`\`

### 9.2 不适合 0-RTT 的操作

\`\`\`python
# 不适合 0-RTT 的操作：非幂等 + 有副作用

not_suitable_for_0rtt = [
    "POST /api/pay",                  # 支付（重放会重复扣款！）
    "POST /api/orders",               # 创建订单（重放会创建多个订单）
    "POST /api/messages",             # 发消息（重放会发多条）
    "POST /api/users",                # 创建用户（重放会冲突）
    "DELETE /api/user/123",           # 删除用户（虽然幂等，但有副作用）
    "PUT /api/user/123",              # 更新用户（非幂等，如带自增字段）
    "POST /api/transfer",             # 转账（重放会重复转账）
]

# 对于这些操作，后端应该返回 425，让客户端重试走完整握手
\`\`\`

### 9.3 让非幂等操作变幂等

如果想让某些 POST 也享受 0-RTT，可以用 **Idempotency-Key** 模式：

\`\`\`python
# 客户端为每个请求生成唯一 key
import uuid

def make_payment(amount):
    key = str(uuid.uuid4())  # 客户端生成的唯一 key
    # 带上 Idempotency-Key 头
    response = requests.post("https://api.example.com/pay",
                            json={"amount": amount},
                            headers={"Idempotency-Key": key})
    return response

# 服务端检查
from fastapi import Request
processed_keys = set()  # 实际用 Redis 存

@app.post("/api/pay")
def pay(request: Request, amount: int):
    key = request.headers.get("Idempotency-Key")
    if key in processed_keys:
        # 重复请求，返回上次的结果（而不是重复执行）
        return {"status": "already_paid", "message": "重复请求已忽略"}
    processed_keys.add(key)
    # 执行支付
    return {"status": "paid", "amount": amount}
\`\`\`

## 十、Demo 6：TLS 1.3 优化清单

### 10.1 服务端优化清单

\`\`\`nginx
# /etc/nginx/conf.d/example.com.conf

server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 1. 启用 TLS 1.3
    ssl_protocols TLSv1.2 TLSv1.3;

    # 2. 优先用 TLS 1.3 的密码套件（AEAD）
    ssl_ciphers TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # 3. 启用 0-RTT（注意后端要处理 Early-Data）
    ssl_early_data on;

    # 4. 会话复用（0-RTT 的前置条件）
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets on;

    # 5. OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/www.example.com/chain.pem;
    resolver 8.8.8.8 valid=300s;

    # 6. 用 ECDSA 证书（比 RSA 快）
    ssl_certificate     /etc/letsencrypt/live/www.example.com/ecc_fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.example.com/ecc_privkey.pem;

    # 7. HTTP/2
    # listen 443 ssl http2;  # 已在 listen 行

    # 8. HSTS（强制后续都用 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 9. 传 Early-Data 给后端
    location / {
        proxy_pass http://backend;
        proxy_set_header Early-Data $ssl_early_data;
    }
}
\`\`\`

### 10.2 验证清单

\`\`\`bash
echo "=== 1. 检查 TLS 版本 ==="
openssl s_client -connect www.example.com:443 < /dev/null 2>/dev/null | grep "Protocol"
# 期望：Protocol: TLSv1.3

echo "=== 2. 检查 ALPN（HTTP/2）==="
openssl s_client -connect www.example.com:443 -alpn h2 < /dev/null 2>/dev/null | grep "ALPN"
# 期望：ALPN protocol: h2

echo "=== 3. 检查 OCSP Stapling ==="
openssl s_client -connect www.example.com:443 -status < /dev/null 2>/dev/null | grep "OCSP Response Status"
# 期望：OCSP Response Status: successful

echo "=== 4. 检查会话复用 ==="
openssl s_client -connect www.example.com:443 -sess_out /tmp/sess.pem < /dev/null 2>/dev/null
openssl s_client -connect www.example.com:443 -sess_in /tmp/sess.pem < /dev/null 2>/dev/null | grep "Reused"
# 期望：Reused, TLSv1.3

echo "=== 5. 检查 0-RTT（需要较新 openssl）==="
echo "GET / HTTP/1.0" > /tmp/early.txt
openssl s_client -connect www.example.com:443 -tls1_3 -sess_in /tmp/sess.pem -early_data /tmp/early.txt 2>&1 | grep -i "early"
# 期望：有 early data 相关信息

echo "=== 6. 检查 HSTS ==="
curl -sI https://www.example.com | grep -i "Strict-Transport-Security"
# 期望：Strict-Transport-Security: max-age=31536000; includeSubDomains

echo "=== 7. 检查证书类型（ECDSA vs RSA）==="
openssl s_client -connect www.example.com:443 < /dev/null 2>/dev/null | grep "Server certificate type"
# 期望：ECDSA（如果配了 ECDSA 证书）

echo "=== 8. 综合性能测试 ==="
for i in 1 2 3; do
  curl -w "TLS: %{time_appconnect}s | Total: %{time_total}s\\n" --tls-max 1.3 -o /dev/null -s https://www.example.com
done
\`\`\`

## 十一、1-RTT vs 0-RTT 对比

| 维度 | TLS 1.3 1-RTT | TLS 1.3 0-RTT |
|------|--------------|---------------|
| 握手延迟 | 1-RTT | 0-RTT |
| 首包数据 | 握手后才能发 | 随 ClientHello 发 |
| 前置条件 | 无 | 需要之前的 PSK |
| 前向保密 | 有（ECDHE） | 无（基于 PSK） |
| 重放攻击风险 | 无 | 有 |
| 适用操作 | 所有操作 | 仅幂等操作 |
| 后端改造 | 无 | 需检查 Early-Data 头 |
| 新客户端 | 支持 | 不支持（首次必须 1-RTT） |

## 十二、本章小结

| 知识点 | 要点 |
|-------|------|
| 0-RTT 价值 | 节省 1-RTT，回访用户首字节更快 |
| 0-RTT 原理 | ClientHello 里附带早期数据（基于 PSK） |
| 前置条件 | 客户端必须之前握过手拿到 PSK |
| 最大风险 | 重放攻击（攻击者可录制重复发送） |
| 防御措施 | 后端检查 Early-Data 头，非幂等操作返回 425 |
| Nginx 配置 | ssl_early_data on + proxy_set_header Early-Data |
| 适合的操作 | GET/HEAD 等幂等操作 |
| 不适合的操作 | 支付、创建等非幂等操作 |
| 幂等化方案 | Idempotency-Key 让 POST 变幂等 |
| TLS 1.3 优化清单 | TLS 1.3 + 会话复用 + 0-RTT + OCSP Stapling + HTTP/2 + ECDSA |
| 测试方法 | openssl -early_data、curl、nghttp |
`
  }
];
