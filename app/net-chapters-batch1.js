// =============================================================
// 计算机网络教程 —— 第一批章节（网络基础篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. net-overview — 网络分层模型与整体架构
//   2. net-tcp-udp  — TCP/UDP 协议详解
//   3. net-http     — HTTP 协议从 1.0 到 3.0
//   4. net-https    — HTTPS 与 TLS 握手
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（"网络基础篇"）
//   content : Markdown 格式的详细讲解（中文，8000+ 字）
//   code    : 可真实运行的 Python 代码（用标准库演示网络协议）
//
// 沙箱约束：Python 3.13，无外网，标准库可用（socket/http/ssl/struct/
// threading/json 等），执行超时 10 秒。所有 demo 用 127.0.0.1 本地通信。
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：网络分层模型与整体架构
  // ============================================================
  {
    id: "net-overview",
    title: "网络分层模型与整体架构",
    icon: "🌐",
    group: "网络基础篇",
    content: \`## 一、为什么这一章重要

打开浏览器输入一个网址，背后发生的事情远比想象中复杂：DNS 把域名解析成 IP、TCP 建立可靠连接、TLS 协商密钥、HTTP 传输请求与响应，最后浏览器渲染页面。这每一步都对应网络协议栈的不同层次。理解分层模型，就像拿到了一张「网络世界地图」——当线上出现「连接超时」「502 Bad Gateway」「证书错误」时，你能迅速定位问题出在哪一层，而不是盲目重启服务。

工作中分层思维无处不在：前端排查 CORS 是应用层问题、后端调 keepalive 是传输层问题、运维看 MTU 是网络层问题、安全做 TLS 是表示层会话层问题。这一章先把地图铺开，后面几章再逐层深入。

### 1.1 分层的本质：解耦、复用、标准化

网络之所以分层，源于一个朴素的工程原则：**把复杂问题拆成可独立演进的子问题**。每一层只解决一个关注点，对上层提供统一接口，对下层隐藏实现细节。这样带来的三大好处：

1. **解耦**：HTTP 不用关心底层用 Wi-Fi 还是有线，TCP 不用关心跑在 IPv4 还是 IPv6。某一层升级（比如 TCP 升级到 QUIC），不影响其他层。
2. **复用**：同一套 TCP 既可承载 HTTP，也可承载 SSH、SMTP、MySQL 协议；同一套 IP 既可跑在以太网，也可跑在 Wi-Fi、4G。
3. **标准化**：每层都有清晰的 RFC 规范，不同厂商设备能互通。Cisco 路由器和华为交换机都能转发 IP 包，因为它们都遵守 RFC 791。

如果不分层会怎样？想象一个"巨石协议"把网卡驱动、路由、可靠传输、加密、业务格式全揉在一起——换张网卡要重写整个协议栈，加个新业务要重做加密。这就是 1970 年代之前网络的困境，也是分层模型被发明出来的根本原因。

## 二、OSI 七层模型详解

1984 年 ISO 提出 OSI（Open Systems Interconnection）参考模型，把网络通信抽象成七层。它是理论上的"完美模型"，实际实现中有些层会合并，但作为分析框架至今无可替代。

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  OSI 七层模型          典型协议        PDU 名称          │
├─────────────────────────────────────────────────────────┤
│  7. 应用层 Application  HTTP/DNS/SMTP   报文 Message     │
│  6. 表示层 Presentation SSL/TLS/JPEG    数据 Data       │
│  5. 会话层 Session      RPC/SOCKET      数据 Data       │
│  4. 传输层 Transport     TCP/UDP         段 Segment       │
│  3. 网络层 Network       IP/ICMP        包 Packet        │
│  2. 数据链路层 Data Link 以太网/ARP     帧 Frame         │
│  1. 物理层 Physical      电信号/光纤    比特 Bit         │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 2.1 物理层（Physical）

负责在物理介质上传输**比特流（0 和 1）**。它关心的是电压、光信号、无线电波、网线接头（RJ45）、光纤型号（单模/多模）。这一层不关心 0 和 1 代表什么含义，只负责"把一个比特从一端搬到另一端"。

典型设备：集线器（Hub，已淘汰）、中继器（Repeater）、网线、光纤。集线器是广播式设备，收到信号向所有端口转发，所以用集线器接出来的网络是"共享冲突域"。

### 2.2 数据链路层（Data Link）

把物理层的比特流组织成**帧（Frame）**，并在相邻节点之间可靠传输。它解决两个问题：

1. **成帧**：在比特流中标识一个帧的起始和结束（前导码、帧定界符）。
2. **寻址**：用 MAC 地址（48 位，如 \`00:1A:2B:3C:4D:5E\`）标识局域网内的网卡。

链路层还有 **ARP 协议**（把 IP 解析成 MAC）和交换机的 MAC 地址表学习。交换机是链路层设备，每个端口是独立冲突域，所以比集线器高效。

以太网帧结构（Ethernet II）：

\`\`\`text
+----------+----------+----------+---------+-----------+----------+
| 目的 MAC | 源 MAC   | 类型     | 数据    | FCS 校验  | 前导码   |
| 6 字节   | 6 字节   | 2 字节   | 46-1500 | 4 字节    | 8 字节   |
+----------+----------+----------+---------+-----------+----------+
类型字段：0x0800=IPv4, 0x0806=ARP, 0x86DD=IPv6, 0x8100=VLAN 标签
\`\`\`

### 2.3 网络层（Network）

负责**跨网络的数据包转发**，核心是**路由**和**寻址**。IP 协议给每台主机分配一个逻辑地址（IP 地址），路由器根据目的 IP 查路由表决定下一跳。这一层是无连接、不可靠的——丢包、乱序都由上层（TCP）处理。

- **IPv4**：32 位地址，如 \`192.168.1.100\`，约 43 亿个地址，已耗尽。
- **IPv6**：128 位地址，如 \`2001:db8::1\`，号称"地球每粒沙子都能分一个"。
- **ICMP**：网络层控制协议，ping 命令用的就是 ICMP Echo Request/Reply。

IP 包结构关键字段：

| 字段 | 长度 | 作用 |
|------|------|------|
| Version | 4 bit | 4=IPv4，6=IPv6 |
| TTL | 8 bit | 生存时间，每过一台路由器减 1，到 0 丢弃（防环路） |
| Protocol | 8 bit | 上层协议：6=TCP，17=UDP，1=ICMP |
| Source IP | 32 bit | 源 IP 地址 |
| Destination IP | 32 bit | 目的 IP 地址 |

### 2.4 传输层（Transport）

提供**端到端**的进程间通信。网络层只把数据送到主机，但一台主机上跑着成百上千个进程（浏览器、微信、MySQL），数据该交给谁？传输层用**端口号**（16 位，0-65535）区分进程。

- **TCP**：面向连接、可靠、有序、字节流。适合 HTTP、SSH、数据库。
- **UDP**：无连接、不可靠、数据报。适合 DNS、视频流、游戏、QUIC。

端口分类：知名端口（0-1023，需 root）、注册端口（1024-49151）、动态端口（49152-65535）。

### 2.5 会话层（Session）

管理**会话的建立、维持、断开**。比如 RPC 调用需要维护一个会话上下文，断线后能恢复。实际工程中，会话层功能常被应用层自己实现（如 HTTP 的 Cookie/Session），所以 OSI 的 5、6、7 层在 TCP/IP 模型里被合并成一层。

### 2.6 表示层（Presentation）

处理数据的**表示格式**：编码（ASCII/UTF-8）、压缩（gzip/br）、加密（TLS）。你看到 HTTPS 的加密就发生在这一层——它把 HTTP 明文加密成密文，让网络层以下都看不到内容。

### 2.7 应用层（Application）

直接为应用程序提供服务的协议：HTTP（网页）、DNS（域名解析）、SMTP/IMAP（邮件）、SSH（远程登录）、FTP（文件传输）。应用层定义了报文格式和交互规则。

## 三、TCP/IP 四层模型

互联网实际使用的是 TCP/IP 模型，比 OSI 更简洁，把 7 层合并成 4 层。它是"工程派"，OSI 是"学院派"。

\`\`\`text
OSI 七层                TCP/IP 四层            实例
┌────────────┐         ┌──────────────┐
│ 应用层     │         │              │   HTTP, DNS, SMTP
│ 表示层     │ ──合并→ │  应用层       │   SSH, FTP
│ 会话层     │         │              │   TLS/SSL
├────────────┤         ├──────────────┤
│ 传输层     │ ──对应→ │  传输层       │   TCP, UDP
├────────────┤         ├──────────────┤
│ 网络层     │ ──对应→ │  网络层       │   IP, ICMP
├────────────┤         │  (互联网层)   │
│ 数据链路层 │ ──合并→ ├──────────────┤
│ 物理层     │         │  网络接口层   │   以太网, Wi-Fi
└────────────┘         │  (链路层)     │   ARP
                       └──────────────┘
\`\`\`

两模型的对应关系是面试高频题，记住口诀：**OSI 上三层（应用/表示/会话）→ TCP/IP 应用层；OSI 下两层（链路/物理）→ TCP/IP 网络接口层**。

TCP/IP 模型之所以胜出，因为它先有实现（1974 年的 TCP/IP）后有标准，是"用出来的"；OSI 先有标准后有实现，过度设计、迟迟没有好实现，被市场淘汰。这也是工程界常见规律：**先跑起来的简单方案往往打败迟到的完美方案**。

## 四、数据封装与解封装

数据从应用层往下传，每层都会加上自己的"头"（header），这个过程叫**封装（Encapsulation）**。接收方则反过来层层剥头，叫**解封装（Decapsulation）**。

\`\`\`text
发送方（封装，层层加头）：

应用层:   [ 应用数据 "GET / HTTP/1.1" ]
              │ 加 TCP 头
传输层:   [ TCP 头 | 应用数据 ]              → 段 Segment
              │ 加 IP 头
网络层:   [ IP 头 | TCP 头 | 应用数据 ]      → 包 Packet
              │ 加以太网头/尾
链路层:   [ ETH 头 | IP 头 | TCP 头 | 数据 | FCS ] → 帧 Frame
              │ 转成电信号
物理层:   ~~~~~比特流~~~~~

接收方（解封装，层层剥头）：
帧 → 剥 ETH 头 → 包 → 剥 IP 头 → 段 → 剥 TCP 头 → 应用数据
\`\`\`

每一层只看自己的头，不关心上层数据内容（这就是"对等层通信"）。发送方的 TCP 和接收方的 TCP 像在直接对话，虽然中间隔着 IP、链路层，但它们感知不到——这叫**虚拟通信**。

### 4.1 MTU 与分片

每层能承载的数据有上限。链路层以太网的 **MTU（Maximum Transmission Unit）默认 1500 字节**，意味着一个 IP 包（含 IP 头）最大 1500 字节。如果应用层数据超过这个值，IP 层会**分片（Fragmentation）**：把一个大包拆成多个小包，每个带偏移量，到目的地再重组。

\`\`\`text
应用层数据 4000 字节，IP 头 20 字节，MTU 1500：
每片可装 1500 - 20(IP头) = 1480 字节 payload

片1: [IP头|偏移0   | 1480 字节]  flags=MF(还有更多)
片2: [IP头|偏移1480| 1480 字节]  flags=MF
片3: [IP头|偏移2960| 1040 字节]  flags=0(最后一片)
\`\`\`

分片的坑：只要任意一片丢失，整个包都要重传（IP 层不重传，TCP 层会重传整个数据）。所以现代网络尽量用 **MSS（最大段大小）= MTU - 40（TCP/IP 头）** 在 TCP 层就避免分片。VPN/隧道场景（如 GRE、IPSec）会再封装一层 IP 头，导致有效 MTU 变小（如 1400），常见"大包通小包通中等包卡"就是 MTU 问题。

工作中遇到的典型场景：某接口偶尔超时，ping 正常，最后发现是 VPN 链路 MTU 太小，TCP 没协商 MSS 导致大包被分片丢弃。解决：调小 MSS 或开启 PMTUD（路径 MTU 发现）。

## 五、每层职责与典型协议速查

| 层 | 核心职责 | 典型协议 | 典型设备 |
|----|---------|---------|---------|
| 应用层 | 业务报文格式 | HTTP/2/3, DNS, SMTP, SSH | 网关（应用层代理） |
| 表示层 | 编码/压缩/加密 | TLS, JPEG, gzip | - |
| 会话层 | 会话管理 | RPC, NetBIOS | - |
| 传输层 | 端到端可靠/不可靠 | TCP, UDP, QUIC | 防火墙（四层）、LB |
| 网络层 | 路由寻址 | IP, ICMP, OSPF, BGP | 路由器、三层交换机 |
| 数据链路层 | 局域网内寻址 | 以太网, ARP, PPP | 交换机、网卡 |
| 物理层 | 比特传输 | 10/100/1000BASE-T | 集线器、网线 |

## 六、工作中如何用分层思维排查问题

遇到网络故障，按"自上而下"或"自下而上"逐层排查，是最高效的定位方法。

**自下而上排查（先看通不通）**：
1. 物理层：网线插了吗？灯亮吗？
2. 链路层：\`ping 同网段 IP\` 通吗？ARP 学到 MAC 吗？
3. 网络层：\`ping 网关\` 通吗？\`traceroute\` 到哪一跳断？
4. 传输层：\`telnet host port\` 或 \`nc -zv host port\` 通吗？防火墙放行了吗？
5. 应用层：curl 请求返回什么状态码？证书有效吗？

**自上而下排查（先看业务）**：
1. 应用层：浏览器报什么错？日志里有什么？
2. 传输层：端口监听了吗？连接被拒绝还是超时？
3. 往下逐层缩小范围。

举例：用户反馈"网站打不开"。先 \`curl -v https://site\` 看报错——如果 \`Connection refused\` 是传输层（端口没监听/防火墙挡），如果 \`Could not resolve host\` 是 DNS（应用层依赖），如果 \`SSL certificate problem\` 是表示层 TLS，如果 \`502\` 是应用层网关错误。一个 curl 命令就能区分四层问题，这就是分层的威力。

## 七、常见陷阱与最佳实践

1. **混淆"层"和"协议"**：说"HTTP 在第七层"没错，但说"HTTP 是会话层"就错了。一个协议可能跨多层（如 TLS 跨表示层和会话层）。
2. **以为 TCP 在应用层**：TCP 是传输层，HTTP 才是应用层。新手常说"HTTP 连接"，严格说 HTTP 不维护连接，连接是 TCP 的。
3. **忽略 MTU**：跨网络大包丢失，九成是 MTU 不匹配。排查时记得 \`ping -M do -s 1472 host\`（禁止分片测 MTU）。
4. **混淆集线器/交换机/路由器**：集线器是物理层（广播）、交换机是链路层（按 MAC 转发）、路由器是网络层（按 IP 转发）。
5. **ARP 只在同一网段**：ARP 不能跨路由器。跨网段靠 IP 路由，到了目标网段才 ARP。

## 八、面试要点

**Q1：OSI 七层和 TCP/IP 四层的区别？**
答：OSI 是理论参考模型，七层（物理/链路/网络/传输/会话/表示/应用），先有标准后有实现；TCP/IP 是工程实用模型，四层（网络接口/网络/传输/应用），先有实现后有标准。对应关系：OSI 上三层合并为 TCP/IP 应用层，OSI 下两层合并为 TCP/IP 网络接口层。

**Q2：为什么 TCP/IP 模型胜出？**
答：因为它简单实用、先有成熟实现（BSD Unix 内置）、被 ARPANET 大规模部署形成网络效应；OSI 设计过度复杂、协议实现迟缓、政府主导市场响应慢。这是"Good enough + 先发优势"打败"完美但迟到"的经典案例。

**Q3：数据在每一层怎么封装？**
答：发送方从应用层到物理层，每层加自己的头（应用数据→TCP 段→IP 包→以太网帧→比特流）。接收方反向解封装。每层只处理本层头，对等层"虚拟通信"。

**Q4：为什么传输层既用 IP 又用端口？**
答：IP 决定数据送到哪台主机（网络层），端口决定交给主机上哪个进程（传输层）。两者缺一不可：只有 IP 找不到进程，只有端口跨不了网络。类比：IP 是小区地址，端口是门牌号。

**Q5：MTU 是什么？分片有什么问题？**
答：MTU 是链路层单帧最大数据量，以太网默认 1500 字节。IP 包超 MTU 会被分片，分片只要丢一片整包重传，且增加路由器开销。现代用 TCP MSS 协商避免分片，或 PMTUD 动态发现路径 MTU。

## 九、本章小结

1. 分层是为了解耦、复用、标准化，每层只解决一个关注点。
2. OSI 七层是理论模型，TCP/IP 四层是工程实现，两者可对应。
3. 数据发送时层层加头（封装），接收时层层剥头（解封装）。
4. 应用层（HTTP/DNS）、传输层（TCP/UDP）、网络层（IP）、链路层（以太网/ARP）是工作最常打交道的四层。
5. 排障按层逐层定位：物理→链路→网络→传输→应用，一个 curl 就能区分大半。
6. MTU 默认 1500，分片有性能损耗，用 MSS/PMTUD 避免。

下一章我们深入传输层，看 TCP 三次握手四次挥手的细节，以及流量控制、拥塞控制是怎么工作的。\`,
    code: \`# ============================================================
# 第一章代码演示：网络分层模型
# ------------------------------------------------------------
# 演示内容：
#   1. socket.gethostbyname 解析 localhost（应用层调用传输层）
#   2. 用 socket 建立本地 TCP 连接，观察协议栈调用
#   3. 打印每一层对应的封装数据
# ============================================================
import socket
import threading
import time

print("=" * 60)
print("网络分层演示：从应用层到传输层")
print("=" * 60)

# ---- 1. 应用层 → 传输层：DNS 解析（这里用 hosts 表）----
# 真实场景：浏览器调用 gethostbyname，触发 DNS 查询
# 这里解析 localhost，回退到 hosts，无需外网
ip = socket.gethostbyname("localhost")
print(f"[应用层] gethostbyname('localhost') -> {ip}")
print(f"[传输层] socket 将基于此 IP 建立 TCP 连接")

# ---- 2. 链路层：查看本机网络接口信息 ----
hostname = socket.gethostname()
print(f"[链路层] 本机主机名: {hostname}")
print(f"[应用层] 本机回环地址: 127.0.0.1（不经过网卡，内核直接环回）")

# ---- 3. 模拟数据封装过程 ----
print("\\n" + "=" * 60)
print("数据封装过程演示（发送方向）")
print("=" * 60)

app_data = b"GET /index.html HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n"
print(f"[应用层] 原始数据（{len(app_data)} 字节）:")
print(f"  {app_data!r}")

# TCP 头：源端口 54321 -> 目的端口 80（这里只是构造示意，非真实头）
src_port, dst_port = 54321, 80
tcp_header = struct_tcp = f"TCP[src={src_port},dst={dst_port},seq=1,ack=0,SYN]"
print(f"[传输层] 加 TCP 头: {tcp_header}")

# IP 头：源 127.0.0.1 -> 目的 127.0.0.1
ip_header = "IP[src=127.0.0.1,dst=127.0.0.1,TTL=64,PROTO=TCP]"
print(f"[网络层] 加 IP 头: {ip_header}")

# 以太网头（回环实际不封装以太网帧，这里演示概念）
eth_header = "ETH[dstMAC=00:00:00:00:00:00,srcMAC=00:00:00:00:00:00,type=0x0800]"
print(f"[链路层] 加 ETH 头: {eth_header}")
print(f"[物理层] 转成比特流传输...")

# ---- 4. 真实建立一个 TCP 连接，观察 socket 调用 ----
print("\\n" + "=" * 60)
print("真实 TCP 连接建立（127.0.0.1 本地通信）")
print("=" * 60)

server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_sock.bind(("127.0.0.1", 0))
server_sock.listen(1)
port = server_sock.getsockname()[1]
print(f"[传输层] server 已 listen, 端口={port} (动态分配)")

def server_thread():
    conn, addr = server_sock.accept()
    print(f"[传输层] server accept: 来自 {addr}")
    data = conn.recv(1024)
    print(f"[应用层] server 收到: {data.decode().strip()}")
    conn.sendall(b"HTTP/1.1 200 OK\\r\\nContent-Length: 11\\r\\n\\r\\nhello world")
    conn.close()

t = threading.Thread(target=server_thread, daemon=True)
t.start()
time.sleep(0.2)

# 客户端：应用层发起请求，传输层自动完成三次握手
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(f"[应用层] client 调用 connect（触发三次握手）")
client.connect(("127.0.0.1", port))
print(f"[传输层] TCP 已建立 (三次握手完成)")
print(f"[传输层] 本地端口={client.getsockname()[1]}, 对端={client.getpeername()}")

client.sendall(app_data)
print(f"[应用层] client 已发送 HTTP 请求")

resp = client.recv(1024)
print(f"[应用层] client 收到响应:")
print(f"  {resp.decode()}")
client.close()
print(f"[传输层] client close（触发四次挥手）")
print("\\n[完成] 整个过程跨越应用层、传输层、网络层（回环绕过链路层）")
\`,
  },

  // ============================================================
  // 第二章：TCP/UDP 协议详解
  // ============================================================
  {
    id: "net-tcp-udp",
    title: "TCP/UDP 协议详解",
    icon: "🤝",
    group: "网络基础篇",
    content: \`## 一、传输层的两个主角

传输层是网络协议栈中最常被面试、也最常被排查的一层。它向上承接应用层的 HTTP/MySQL/Redis 连接，向下使用 IP 提供的"尽力而为"服务，向应用进程提供两种风格截然不同的服务：

- **TCP（Transmission Control Protocol）**：可靠、有序、面向连接的字节流。像打电话——先拨号建立连接，确认对方在线，然后逐字逐句交流，说错了重说，挂电话有礼貌地道别。
- **UDP（User Datagram Protocol）**：不可靠、无连接的数据报。像寄明信片——写好地址扔进邮筒，不保证送达、不保证顺序，但快、省事、适合广播。

工作中 95% 的业务流量是 TCP（HTTP/数据库/SSH），但 UDP 正在复兴——DNS、视频会议、游戏、以及 Google 力推的 QUIC（HTTP/3）都是 UDP。理解两者的差异和适用场景，是后端/前端的必备技能。

### 1.1 为什么需要传输层

IP 层只负责把包送到主机，但一台主机同时跑着浏览器（80/443）、SSH（22）、MySQL（3306）。一个 IP 包到了，内核怎么知道交给哪个进程？答案是**端口号**。传输层用 16 位端口号（0-65535）做多路复用和解复用：

\`\`\`text
发送方：应用数据 + 端口号 → 内核封装成段
  浏览器(进程A, 端口54321) ──┐
  SSH(进程B, 端口22)     ────┤── IP 层 ──→ 网络
  MySQL(进程C, 端口3306) ────┘
接收方：内核根据目的端口把数据分发给对应进程
  端口 54321 → 进程A
  端口 22    → 进程B
\`\`\`

端口范围：知名端口 0-1023（需 root）、注册端口 1024-49151、动态/临时端口 49152-65535（客户端临时用）。

## 二、TCP 报文段结构

TCP 头部固定 20 字节（不含选项），是协议里最复杂的头部之一，因为要支持可靠传输、流量控制、拥塞控制三大功能。

\`\`\`text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          源端口 (16)          |       目的端口 (16)          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        序列号 seq (32)                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     确认号 ack (32)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| 数据偏移 | 保留 |URG|ACK|PSH|RST|SYN|FIN|    窗口大小 (16)    |
|   (4)    | (6)  |   flags (6)   |            (cwnd/rwnd)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       校验和 (16)             |       紧急指针 (16)           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    选项（可变长，0-40 字节）                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
\`\`\`

逐字段含义：

| 字段 | 长度 | 作用 |
|------|------|------|
| 源端口 | 16 bit | 发送方端口 |
| 目的端口 | 16 bit | 接收方端口 |
| 序列号 seq | 32 bit | 本段数据第一个字节的序号，保证有序 |
| 确认号 ack | 32 bit | 期望收到的下一个字节序号（累计确认） |
| 数据偏移 | 4 bit | TCP 头长度（以 4 字节为单位），即首部长度 |
| 标志位 | 6 bit | URG/ACK/PSH/RST/SYN/FIN，控制连接状态 |
| 窗口大小 | 16 bit | 接收方通告的可用缓冲区（流量控制） |
| 校验和 | 16 bit | 检验首部和数据完整性 |
| 紧急指针 | 16 bit | URG=1 时有效，指向紧急数据末尾 |

六个标志位是 TCP 状态机的"开关"：
- **SYN**：同步位，建立连接时用，表示发起连接。
- **ACK**：确认位，ack 字段有效。除初始 SYN 外几乎所有包都带 ACK。
- **FIN**：结束位，表示发送方数据发完，请求关闭。
- **RST**：重置位，强制复位连接（端口未监听、异常断开）。
- **PSH**：推送位，要求立即把数据交给应用，不要缓冲。
- **URG**：紧急位，紧急指针有效（带外数据 OOB）。

## 三、TCP 三次握手

建立 TCP 连接需要三次握手（Three-way Handshake）。这是面试最高频题，要讲清"为什么是三次"。

\`\`\`text
客户端                                       服务端
  |                                            |
  |  1. SYN, seq=x              --------→     |  服务端 listen
  |  (进入 SYN_SENT)                          |  (进入 SYN_RCVD)
  |                                            |
  |  ←--------  2. SYN+ACK, seq=y, ack=x+1    |
  |                                            |
  |  3. ACK, ack=y+1             --------→     |  (进入 ESTABLISHED)
  |  (进入 ESTABLISHED)                       |
  |                                            |
  |  可双向传输数据                            |
\`\`\`

握手过程详解：
1. 客户端发 SYN=1, seq=x（随机初始序号），进入 \`SYN_SENT\`。这个包不带数据但消耗一个序号。
2. 服务端收到 SYN，回 SYN=1, ACK=1, seq=y, ack=x+1，进入 \`SYN_RCVD\`。这一步服务端既确认了客户端的 SYN（ack=x+1），又发起自己的 SYN（seq=y）。
3. 客户端回 ACK=1, ack=y+1，进入 \`ESTABLISHED\`。服务端收到后也进入 \`ESTABLISHED\`，连接建立。

### 3.1 为什么是三次而不是两次

这是核心面试题，答案要从"双向可靠通信"角度回答：

**两次握手的问题**：如果只有两次，服务端发完 SYN+ACK 就进 ESTABLISHED 并分配资源。但网络可能延迟，旧的重传 SYN 抵达服务端，服务端误以为是新连接，回 SYN+ACK 后就一直等数据，**白白占用资源**（经典攻击：SYN Flood 用伪造源 IP 让服务端开满半连接）。

**三次握手的解决**：第三次 ACK 是客户端对服务端 SYN 的确认。如果服务端发了 SYN+ACK 但一直收不到第三次 ACK（超时），就重传或放弃，不会无限等待。换句话说，**第三次握手确认了"双方的收发能力都正常"**：
- 第一次：服务端确认"客户端能发，服务端能收"
- 第二次：客户端确认"服务端能收发，客户端能收发"（至此客户端知道双向通）
- 第三次：服务端确认"客户端能收，服务端能发"（至此服务端知道双向通）

三次握手后，双方都确认了对方收发正常，才进入 ESTABLISHED。

### 3.2 为什么不是四次

理论上三次已经够确认双向能力，再多一次是冗余。三次是"最少能保证可靠建立连接"的次数。SYN 和 ACK 可以合并（第二步 SYN+ACK），所以省了一次。这就是协议设计的优雅：**用最少的交互达成目标**。

### 3.3 SYN Flood 攻击与防御

攻击者发海量伪造源 IP 的 SYN 包，服务端为每个回 SYN+ACK 后等待第三次 ACK，半连接队列撑爆，正常用户无法建连。防御手段：
- **SYN Cookies**：服务端不为半连接分配资源，而是把状态编码进 seq 返回，收到第三次 ACK 再验证。
- **SYN Cache / SYN Proxy**：限制半连接数，超限丢弃。
- Linux 可开 \`net.ipv4.tcp_syncookies=1\`。

## 四、TCP 四次挥手

断开连接需要四次挥手（Four-way Handshake），因为 TCP 是**全双工**的——双方都能独立关闭自己的发送通道。

\`\`\`text
客户端                                       服务端
  |                                            |
  |  1. FIN, seq=u              --------→      |  (进入 CLOSE_WAIT)
  |  (进入 FIN_WAIT_1)                         |
  |                                            |
  |  ←--------  2. ACK, ack=u+1                |  服务端仍可发数据
  |  (进入 FIN_WAIT_2)                         |
  |  ......（服务端处理剩余数据）............. |
  |                                            |
  |  ←--------  3. FIN, seq=v                  |  (进入 LAST_ACK)
  |                                            |
  |  4. ACK, ack=v+1            --------→      |  (进入 CLOSED)
  |  (进入 TIME_WAIT, 等 2MSL)                 |
  |  ......2MSL 后 CLOSED                      |
\`\`\`

### 4.1 为什么挥手是四次而握手是三次

握手时 SYN 和 ACK 可以合并成一个 SYN+ACK 包。但挥手时，服务端收到客户端 FIN 后，**自己可能还有数据没发完**，所以先回 ACK（"我知道你要关了"），等数据发完再单独发 FIN。于是 ACK 和 FIN 没法合并，需要四次。

如果服务端收到 FIN 时已经没数据要发了，ACK 和 FIN 也能合并成三次（这种情况叫"延迟 ACK + piggyback"）。所以"四次"是常态，"三次"是优化。

### 4.2 TIME_WAIT 状态（高频考点）

主动关闭方发完最后一个 ACK 后进入 \`TIME_WAIT\`，等待 **2 倍 MSL**（Maximum Segment Lifetime，Linux 默认 MSL=30s，即等 60s）才真正 CLOSED。为什么要等？

1. **保证最后一个 ACK 到达**：如果最后一个 ACK 丢失，被动方会重发 FIN。主动方在 TIME_WAIT 期间能重发 ACK。如果主动方直接 CLOSED，收到重传的 FIN 会回 RST，连接异常终止。
2. **防止旧连接报文干扰新连接**：等 2MSL 让本次连接的所有报文都在网络中消失。否则如果立刻用同样的四元组（src_ip,src_port,dst_ip,dst_port）建新连接，旧连接延迟到达的包会被当成新连接的数据，造成错乱。

TIME_WAIT 是**主动关闭方**的状态。工作中 Nginx/客户端主动断开会堆积 TIME_WAIT，可用以下参数优化：
- \`net.ipv4.tcp_tw_reuse=1\`：允许将 TIME_WAIT 的端口快速复用给新连接（依赖 timestamp 防旧报文）。
- 缩短 \`tcp_fin_timeout\`，但**不建议开 \`tcp_tw_recycle\`**（NAT 环境下会导致丢包，已在新内核移除）。

### 4.3 CLOSE_WAIT 堆积问题

**CLOSE_WAIT 是被动关闭方的状态**——收到对方 FIN、回了 ACK，但自己还没调 close()。如果服务端代码没正确关闭 socket（比如异常没 close、连接泄漏），CLOSE_WAIT 会堆积，最终撑爆 fd。排查：\`ss -tan state close-wait\` 看堆积量，配合应用日志找未关闭的连接。

## 五、TCP 可靠性保障

TCP 的"可靠"靠四个机制实现：

### 5.1 序列号与确认

每个字节都有序号，接收方用累计确认（ack=N 表示"序号 < N 的都收到了，期望下一个是 N"）。发送方超时未收到 ack 就重传。

### 5.2 流量控制（滑动窗口）

接收方在 ACK 里带**窗口大小（rwnd）**，告诉发送方"我还能收多少字节"。发送方据此调整发送速度，避免淹没接收方。窗口为 0 时发送方暂停（Zero Window），接收方有空位后发 Window Update。

\`\`\`text
发送窗口 = min(rwnd, cwnd)
  rwnd: 接收方通告的窗口（流量控制，保护接收方）
  cwnd: 拥塞窗口（发送方自己估计，保护网络）
\`\`\`

### 5.3 拥塞控制

流量控制保护接收方，拥塞控制保护网络。TCP 拥塞控制四个阶段：

\`\`\`text
cwnd
 ↑
 |        /------- 拥塞避免（线性增长，每 RTT +1）
 |       /
 |      /---- 慢启动（指数增长，每 RTT 翻倍）
 |     /
 |    /
 |---|--------|--------|--------→ 时间
 0   ssthresh  丢包
       (阈值)
丢包后：ssthresh = cwnd/2，cwnd = 1，重新慢启动
（快恢复：cwnd = ssthresh，不回到 1）
\`\`\`

1. **慢启动（Slow Start）**：cwnd 从 1 开始，每收到一个 ACK 翻倍（指数增长），到 ssthresh 转拥塞避免。
2. **拥塞避免（Congestion Avoidance）**：cwnd 超过 ssthresh 后线性增长（每 RTT +1 MSS），谨慎探测带宽。
3. **快重传（Fast Retransmit）**：收到 3 个重复 ACK 立即重传丢失包，不等超时。
4. **快恢复（Fast Recovery）**：快重传后 ssthresh = cwnd/2，cwnd = ssthresh（不回到 1），直接进拥塞避免。

### 5.4 超时重传与 RTT 估计

每个包有重传定时器（RTO）。RTO 动态调整：基于 SRTT（平滑 RTT）和 RTTVAR（RTT 偏差）估算，公式大致 \`RTO = SRTT + 4×RTTVAR\`。RTO 太小误重传，太大延迟高。

## 六、TCP Keep-Alive

TCP 连接建立后如果长时间无数据，中间设备（NAT、防火墙）可能清除连接表项，导致"假死"——连接看似还在，发数据却超时。Keep-Alive 机制定时发探测包维持连接活性。

Linux 默认参数：
- \`tcp_keepalive_time=7200\`：7200 秒无数据后开始探测。
- \`tcp_keepalive_intvl=75\`：每 75 秒探测一次。
- \`tcp_keepalive_probes=9\`：探测 9 次失败才判定断开。

注意：TCP Keep-Alive 是"链路活性检测"，**不是 HTTP 的 Keep-Alive**！HTTP Keep-Alive 是应用层复用 TCP 连接，名字相似但概念完全不同，工作中别搞混。

## 七、UDP 协议

UDP 极简，头部只有 8 字节，无连接、无确认、无重传。

\`\`\`text
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        源端口 (16)            |      目的端口 (16)            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        长度 (16)              |      校验和 (16)              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       数据（变长）                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
\`\`\`

UDP 的特点：
- **无连接**：sendto 直接发，不用握手。
- **不可靠**：丢包不重传，乱序不重组。
- **头部小**：8 字节 vs TCP 20+ 字节。
- **支持广播/多播**：一对多发送。
- **应用层自己控制**：要不要可靠、要不要拥塞控制，全交给应用（如 QUIC 在 UDP 上实现了类 TCP 的可靠传输）。

UDP 适用场景：DNS（一次查询一问一答，握手太重）、视频/语音（偶尔丢帧无所谓，延迟敏感）、游戏（实时同步）、DHCP、SNMP、QUIC/HTTP3。

## 八、TCP vs UDP 对比

| 维度 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠（确认+重传） | 不可靠 |
| 顺序 | 有序 | 无序 |
| 速度 | 慢（握手+拥塞控制） | 快 |
| 头部 | 20+ 字节 | 8 字节 |
| 流量控制 | 有（滑动窗口） | 无 |
| 拥塞控制 | 有 | 无 |
| 传输方式 | 字节流 | 数据报 |
| 广播 | 不支持 | 支持单播/广播/多播 |
| 典型应用 | HTTP/SSH/SMTP/MySQL | DNS/视频/游戏/QUIC |

选型口诀：**可靠要 TCP，实时要 UDP，又快又可靠要 QUIC**。

## 九、常见陷阱与最佳实践

1. **TIME_WAIT 太多**：客户端主动断开会堆积。开 \`tcp_tw_reuse\`，或让服务端主动关闭（如 Nginx 配置 \`keepalive_timeout\`）。
2. **CLOSE_WAIT 泄漏**：应用没 close 连接。代码里用 try/finally 确保 close，或用连接池。
3. **混淆 Keep-Alive**：TCP keepalive 是链路探测（默认 2 小时），HTTP Keep-Alive 是连接复用，两回事。
4. **TCP_NODELAY**：默认开 Nagle 算法（攒够 MSS 再发），小包场景（如交互式 SSH、游戏）建议 \`setsockopt(TCP_NODELAY)\` 关掉，否则延迟高。
5. **UDP 也能可靠**：QUIC 在 UDP 上实现了可靠+拥塞控制。别以为"用 UDP 就不可靠"，可靠性是应用层决定的。
6. **三次握手不全等于安全**：SYN Flood 攻击就是利用三次握手前的半连接，必须开 syncookies。

## 十、面试要点

**Q1：详细讲讲三次握手。**
答：①客户端发 SYN seq=x 进 SYN_SENT；②服务端回 SYN+ACK seq=y ack=x+1 进 SYN_RCVD；③客户端回 ACK ack=y+1，双方进 ESTABLISHED。三次后双方都确认了对方收发能力正常。

**Q2：为什么三次不是两次？**
答：两次时服务端发完 SYN+ACK 就 ESTABLISHED 并分配资源。若旧的重传 SYN 迟到抵达，服务端误开连接空耗资源。三次握手的最后一次 ACK 让服务端确认客户端确实在线，避免历史连接浪费资源。本质是确认双向信道可用，最少需三次。

**Q3：为什么挥手四次？为什么 TIME_WAIT 等 2MSL？**
答：四次因 TCP 全双工，被动方收到 FIN 后可能还有数据要发，只能先 ACK 再单独 FIN。TIME_WAIT 等 2MSL：①保证最后 ACK 能重传（被动方重发 FIN 时仍能回 ACK）；②让旧连接报文在网络中消亡，防止干扰同四元组的新连接。

**Q4：TCP 怎么保证可靠？**
答：四机制：序列号+累计确认保证有序不丢；超时重传（动态 RTO）补丢包；流量控制（rwnd 滑动窗口）防淹没接收方；拥塞控制（慢启动/拥塞避免/快重传/快恢复）防淹没网络。

**Q5：TCP 和 UDP 怎么选？**
答：要可靠有序选 TCP（HTTP/数据库）；要低延迟、能容忍丢包、需广播选 UDP（DNS/视频/游戏）；又要快又可靠用 QUIC（基于 UDP 自实现可靠性）。

**Q6：TIME_WAIT 太多怎么办？**
答：调 \`tcp_tw_reuse=1\`、缩短 \`tcp_fin_timeout\`、让服务端主动关闭减少客户端 TIME_WAIT、用长连接（HTTP keepalive）减少建连断连。不要开 \`tcp_tw_recycle\`（NAT 下丢包，已废弃）。

## 十一、本章小结

1. 传输层用端口做进程间多路复用，TCP 可靠面向连接，UDP 简单无连接。
2. TCP 头含 seq/ack/标志位/窗口，是可靠性、流控、拥塞控制的基础。
3. 三次握手确认双向能力，四次挥手因全双工要分别关闭。
4. TIME_WAIT 等 2MSL 保最后 ACK 到达 + 防旧报文干扰。
5. 可靠性靠序列号确认 + 重传 + 滑动窗口 + 拥塞控制四件套。
6. 流量控制（rwnd）保护接收方，拥塞控制（cwnd）保护网络。
7. UDP 头部 8 字节，适合 DNS/视频/QUIC 等实时或自控可靠性场景。

下一章我们看应用层最常用的 HTTP，从 1.0 一路演进到 3.0。\`,
    code: \`# ============================================================
# 第二章代码演示：TCP / UDP 协议对比
# ------------------------------------------------------------
# 演示内容：
#   1. 启动 TCP server(SOCK_STREAM) + client，演示面向连接通信
#   2. 启动 UDP server(SOCK_DGRAM) + client，演示无连接通信
#   3. 打印连接建立、数据收发、断开的整个过程
# ============================================================
import socket
import threading
import time

print("=" * 60)
print("TCP vs UDP 协议对比演示")
print("=" * 60)

# ============================================================
# 一、TCP：面向连接、可靠、字节流
# ============================================================
print("\\n[1] TCP 通信（SOCK_STREAM，面向连接）")
print("-" * 60)

tcp_server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
tcp_server.bind(("127.0.0.1", 0))
tcp_server.listen(1)
tcp_port = tcp_server.getsockname()[1]
print(f"TCP server listen: 127.0.0.1:{tcp_port}")

def tcp_handler():
    conn, addr = tcp_server.accept()  # 三次握手在这里完成
    print(f"  [server] accept() 返回，三次握手完成，对端={addr}")
    # 模拟收到数据后回显
    data = conn.recv(1024)
    print(f"  [server] recv 收到: {data!r}")
    conn.sendall(b"TCP:ECHO:" + data)
    print(f"  [server] sendall 回显完成")
    conn.close()
    print(f"  [server] close() -> 触发四次挥手")

threading.Thread(target=tcp_handler, daemon=True).start()
time.sleep(0.1)

tcp_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(f"  [client] connect() -> 发起三次握手")
tcp_client.connect(("127.0.0.1", tcp_port))
print(f"  [client] 连接已建立 ESTABLISHED")
print(f"  [client] 本地端口={tcp_client.getsockname()[1]}")

tcp_client.sendall(b"hello-tcp")
print(f"  [client] sendall 发送: b'hello-tcp'")
reply = tcp_client.recv(1024)
print(f"  [client] recv 收到: {reply!r}")
tcp_client.close()
print(f"  [client] close() -> 主动关闭，进入 TIME_WAIT")
time.sleep(0.2)

# ============================================================
# 二、UDP：无连接、不可靠、数据报
# ============================================================
print("\\n[2] UDP 通信（SOCK_DGRAM，无连接）")
print("-" * 60)

udp_server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp_server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
udp_server.bind(("127.0.0.1", 0))
udp_port = udp_server.getsockname()[1]
print(f"UDP server bind: 127.0.0.1:{udp_port}（无需 listen/accept）")

def udp_handler():
    data, addr = udp_server.recvfrom(1024)
    print(f"  [server] recvfrom 收到: {data!r} 来自 {addr}")
    udp_server.sendto(b"UDP:ECHO:" + data, addr)
    print(f"  [server] sendto 回显完成")

threading.Thread(target=udp_handler, daemon=True).start()
time.sleep(0.1)

udp_client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp_client.settimeout(3)
print(f"  [client] 直接 sendto，无需 connect")
udp_client.sendto(b"hello-udp", ("127.0.0.1", udp_port))
print(f"  [client] sendto 发送: b'hello-udp'")
reply, _ = udp_client.recvfrom(1024)
print(f"  [client] recvfrom 收到: {reply!r}")
udp_client.close()
print(f"  [client] close()（UDP 无挥手，直接关 socket）")
time.sleep(0.1)

# ============================================================
# 三、对比总结
# ============================================================
print("\\n" + "=" * 60)
print("对比总结")
print("=" * 60)
print("TCP: socket() -> bind() -> listen() -> accept() [握手] -> recv/send -> close() [挥手]")
print("UDP: socket() -> bind() ----------------------------> recvfrom/sendto -> close()")
print("TCP 头部 20+ 字节，UDP 头部 8 字节")
print("TCP 面向连接可靠有序；UDP 无连接不可靠但轻量快速")
\`,
  },

  // ============================================================
  // 第三章：HTTP 协议从 1.0 到 3.0
  // ============================================================
  {
    id: "net-http",
    title: "HTTP 协议从 1.0 到 3.0",
    icon: "📄",
    group: "网络基础篇",
    content: \`## 一、HTTP 是什么，为什么重要

HTTP（HyperText Transfer Protocol）是互联网上应用最广的协议——你浏览的每个网页、调用的每个 API、甚至很多 RPC 框架（gRPC、RESTful）底层都是 HTTP。它是应用层协议，定义了客户端和服务器之间交换数据的格式和交互规则。

HTTP 的核心特点是**无状态**（服务器默认不记录客户端状态）和**请求-响应模型**（一问一答）。这两个特性决定了它简单、可扩展、易缓存，但也催生了 Cookie/Session/JWT 等方案来弥补"无状态"。

理解 HTTP 演进史（1.0 → 1.1 → 2 → 3）非常重要：每一次演进都是为了解决上一代的性能瓶颈，而今天你遇到的"接口慢""连接数限制""队头阻塞"几乎都能在演进史里找到答案。

## 二、HTTP 报文结构

HTTP 报文分**请求**和**响应**两种，都是纯文本（HTTP/1.x），用 CRLF（\\r\\n）分隔。

### 2.1 请求报文

\`\`\`text
GET /api/users?page=1 HTTP/1.1       ← 请求行：方法 路径 版本
Host: www.example.com                 ← 请求头
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer xxx
Content-Type: application/json
Content-Length: 23
                                     ← 空行（CRLF）分隔头部和主体
{"name":"alice","age":30}            ← 请求体（GET 通常没有）
\`\`\`

请求行三部分：**方法 + 请求目标（URL 路径）+ HTTP 版本**。

### 2.2 响应报文

\`\`\`text
HTTP/1.1 200 OK                      ← 状态行：版本 状态码 原因短语
Content-Type: application/json       ← 响应头
Content-Length: 27
Cache-Control: max-age=60
Set-Cookie: sid=abc; HttpOnly; Secure
                                     ← 空行
{"id":1,"name":"alice"}             ← 响应体
\`\`\`

记住：**头部和主体之间必须有一个空行（CRLF）**，这是解析报文的关键。Content-Length 告诉对方主体多长，没有它就只能靠连接关闭判断结束（HTTP/1.0 的做法）。

## 三、HTTP 方法与语义

| 方法 | 语义 | 幂等 | 安全 | 有体 |
|------|------|------|------|------|
| GET | 获取资源 | 是 | 是 | 无 |
| POST | 创建资源/提交数据 | 否 | 否 | 有 |
| PUT | 完整替换资源 | 是 | 否 | 有 |
| PATCH | 部分更新资源 | 否 | 否 | 有 |
| DELETE | 删除资源 | 是 | 否 | 可有 |
| HEAD | 只取响应头（同 GET） | 是 | 是 | 无 |
| OPTIONS | 查询支持的方法（CORS 预检） | 是 | 是 | 无 |

两个关键概念：
- **安全（Safe）**：不改服务器状态。GET/HEAD/OPTIONS 是安全的，POST/PUT/DELETE 不是。
- **幂等（Idempotent）**：调用一次和调用 N 次效果相同。GET/PUT/DELETE 幂等（重复 PUT 同一份数据结果一样，重复 DELETE 同一资源最终都是"已删除"）。POST 不幂等（重复 POST 会创建多条记录）。

幂等性在工程上极重要：网络抖动导致请求重试时，幂等的接口重试无副作用，非幂等（POST）重试可能产生脏数据。所以支付、下单这类要设计幂等键（idempotency-key）。

### 3.1 常见误区

- **GET 不能有 body**：RFC 没禁止，但很多代理/服务器会丢弃 GET body， Elasticsearch 早期用 GET 带 body 查询被诟病。最佳实践：GET 不带 body。
- **POST 一定不幂等**：如果用唯一键约束+UPSERT 语义，POST 也能幂等。幂等是设计问题，不绝对。
- **PUT vs PATCH**：PUT 是完整替换（未传字段被清空），PATCH 是部分更新（只改传的字段）。混用是常见 bug 源。

## 四、HTTP 状态码

状态码三位数，第一位表示类别：

| 类别 | 含义 | 典型 |
|------|------|------|
| 1xx | 信息性 | 100 Continue, 101 Switching Protocols（WebSocket 升级） |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 永久, 302 临时, 304 Not Modified（缓存） |
| 4xx | 客户端错误 | 400 Bad Request, 401 未认证, 403 禁止, 404 Not Found, 429 限流 |
| 5xx | 服务端错误 | 500 内部错误, 502 网关错误, 503 不可用, 504 网关超时 |

工作中高频：
- **301 vs 302**：301 永久重定向（浏览器缓存，SEO 权重转移）；302 临时重定向（不缓存）。307/308 是 HTTP/1.1 新增，区别在于保留方法和 body（302 历史上会变 GET，307 保留原方法）。
- **401 vs 403**：401 是"没登录/Token 无效"（未认证）；403 是"登录了但没权限"（禁止访问）。
- **502 vs 504**：502 是上游返回无效响应（如 Nginx 后端崩了）；504 是上游超时（Nginx 等不到后端响应）。看到 502/504 先查后端服务是否存活。

## 五、HTTP 头部

头部是键值对，分四类：

**通用头**（请求响应都有）：\`Cache-Control\`、\`Connection\`、\`Date\`。
**请求头**：\`Host\`、\`User-Agent\`、\`Accept\`、\`Authorization\`、\`Cookie\`、\`Referer\`、\`Origin\`。
**响应头**：\`Server\`、\`Set-Cookie\`、\`Location\`、\`WWW-Authenticate\`。
**实体头**：\`Content-Type\`、\`Content-Length\`、\`Content-Encoding\`、\`Last-Modified\`、\`ETag\`。

高频头部详解：

- **Host**：HTTP/1.1 必须头，虚拟主机靠它区分同一 IP 上的多个域名。
- **Content-Type**：决定怎么解析 body。\`application/json\`、\`application/x-www-form-urlencoded\`、\`multipart/form-data\`（文件上传）、\`text/html\`。
- **Cookie / Set-Cookie**：Cookie 是请求头（客户端带），Set-Cookie 是响应头（服务端下发）。
- **Cache-Control**：\`max-age=60\` 缓存 60 秒、\`no-cache\` 每次问服务器、\`no-store\` 完全不存。
- **Origin / Referer**：CORS 和防盗链靠它们。\`Referer\` 完整 URL，\`Origin\` 只有协议+域名+端口。
- **Authorization**：\`Bearer <token>\`（JWT）、\`Basic base64(user:pass)\`（基本认证）。

## 六、HTTP/1.0：短连接时代

HTTP/1.0 默认**短连接**：每次请求都新建 TCP 连接，请求完就断开。一次请求要经历 TCP 三次握手 + HTTP 交互 + 四次挥手，握手开销占了大头。

\`\`\`text
HTTP/1.0 短连接：
  请求1: 握手 → GET → 响应 → 挥手   (慢)
  请求2: 握手 → GET → 响应 → 挥手   (又慢)
\`\`\`

一个网页有 50 个资源（图片/CSS/JS），就要 50 次 TCP 握手，性能极差。HTTP/1.0 可以加 \`Connection: keep-alive\` 头复用，但不是默认行为。

## 七、HTTP/1.1：长连接与管道化

HTTP/1.1 是使用最久、最普及的版本，三大改进：

### 7.1 持久连接（Keep-Alive）

默认开启长连接，多个请求复用一个 TCP 连接，大幅减少握手开销。

\`\`\`text
HTTP/1.1 持久连接：
  握手 → GET1 → 响应1 → GET2 → 响应2 → ... → 挥手
\`\`\`

配合 \`Connection: keep-alive\`（默认）和 \`Keep-Alive: timeout=5, max=100\` 头控制超时和最大请求数。

### 7.2 管道化（Pipelining）

允许客户端**不等响应就连续发多个请求**，服务端按顺序响应。

\`\`\`text
管道化：
  client: 发 GET1, GET2, GET3 (不等响应)
  server: 按序回 响应1, 响应2, 响应3
\`\`\`

但管道化有致命缺陷：**响应必须按序返回（FIFO 队头阻塞）**。如果响应1慢，响应2/3 即使在服务端已就绪也得等。所以实际中管道化几乎没人用，浏览器默认关闭。

### 7.3 Host 头与虚拟主机

HTTP/1.1 强制要求 \`Host\` 头，让一个 IP/端口能托管多个域名（虚拟主机）。Nginx 靠 \`server_name\` 匹配 Host 分发到不同应用。

### 7.4 其他增强

- 范围请求 \`Range: bytes=0-1023\`（断点续传、分片下载）。
- 缓存控制增强（\`Cache-Control\`、\`ETag\`、\`If-None-Match\`）。
- 分块传输 \`Transfer-Encoding: chunked\`（流式响应，不知道总长度时用）。

### 7.5 HTTP/1.1 的队头阻塞

虽然长连接复用了 TCP，但**同一个连接上的请求必须串行响应**（HTTP 层队头阻塞）。解决：浏览器对同域名开 6 个并发连接（Chrome 默认 6）。这就是为什么早期要"域名分片"（sharding）——把资源分散到多个域名绕开 6 连接限制。

## 八、HTTP/2：多路复用与二进制分帧

2015 年发布的 HTTP/2 核心目标就是干掉 HTTP/1.1 的队头阻塞。四大特性：

### 8.1 二进制分帧

HTTP/2 把数据拆成**二进制帧（Frame）**，不再是文本。一个连接上多个请求的帧可交错传输，再在接收端按流（Stream）重组。

\`\`\`text
HTTP/2 多路复用（单连接并发）：
  连接: [S1帧][S2帧][S1帧][S3帧][S2帧]... 交错发送
  Stream1 → 重组 → 响应1
  Stream2 → 重组 → 响应2
  Stream3 → 重组 → 响应3
  互不阻塞！
\`\`\`

每个请求/响应是一个**流（Stream）**，用 Stream ID 区分。一个 TCP 连接可并发无数流，彻底解决 HTTP 层队头阻塞。

### 8.2 头部压缩（HPACK）

HTTP/1.1 每个请求都带完整头部（Cookie、UA 动辄 1-2KB），重复传输浪费。HTTP/2 用 **HPACK** 算法压缩：
- 维护客户端/服务端共享的**静态表**（61 个常用头如 \`:method: GET\`）。
- 维护**动态表**（之前发过的头记下来，下次用索引引用）。
- 用 Huffman 编码压缩字符串。

实测头部能压到原来的 10%-30%。

### 8.3 服务端推送（Server Push）

服务端可在客户端请求前主动推送资源。客户端请求 \`index.html\`，服务端顺手推 \`style.css\`、\`app.js\`。但实践中收益有限（客户端可能已缓存），HTTP/2 Push 在 Chrome 已被移除，HTTP/3 不再支持。

### 8.4 HTTP/2 的遗留问题：TCP 层队头阻塞

HTTP/2 解决了 HTTP 层队头阻塞，但**底层还是 TCP**。一个 TCP 包丢失，所有流都要等重传（TCP 保证有序）。

\`\`\`text
HTTP/2 over TCP：
  丢一个 TCP 包 → 整个连接所有 Stream 卡住等重传
  这就是 TCP 层队头阻塞（HOL blocking）
\`\`\`

在弱网（丢包率高）下，HTTP/2 可能比 HTTP/1.1 的 6 连接还慢！这是 HTTP/3 诞生的直接原因。

## 九、HTTP/3：基于 QUIC

2018 年 Google 提出 QUIC（Quick UDP Internet Connections），HTTP/3 = HTTP/2 语义 + QUIC 传输。**底层从 TCP 换成 UDP**，在 UDP 上自己实现可靠传输、拥塞控制、加密。

### 9.1 为什么用 UDP

TCP 是内核实现的，改不动（要升级得改内核，全球部署几十年）。QUIC 跑在用户态 UDP 上，迭代快（Google 每周更新 Chrome 内的 QUIC）。而且 UDP 没有内核握手开销，适合做新协议试验田。

### 9.2 QUIC 解决了什么

1. **无 TCP 层队头阻塞**：每个 Stream 独立，丢包只影响那一个 Stream。
2. **0-RTT 建连**：首次连接 1-RTT（TLS 1.3 握手 + 传输合并），复用连接 0-RTT（带上之前的密钥，第一个包就能带数据）。
3. **连接迁移**：用 Connection ID 标识连接，IP 变了（如 Wi-Fi 切 4G）连接不断，TCP 做不到（TCP 四元组变就断）。
4. **前向纠错（FEC）**：可选，冗余包能恢复少量丢包。

### 9.3 HTTP/3 握手对比

\`\`\`text
HTTP/1.1 / HTTP/2 over TCP + TLS：
  TCP 握手 (1 RTT) + TLS 握手 (1-2 RTT) + 请求 = 3 RTT 才能发数据

HTTP/3 over QUIC：
  QUIC 握手 = TLS 1.3 握手 (1 RTT) + 请求 = 1 RTT
  复用连接 (0-RTT) = 0 RTT，第一个包就带数据
\`\`\`

## 十、HTTP 版本对比总表

| 特性 | HTTP/1.0 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|----------|--------|--------|
| 连接 | 短连接 | 长连接 | 长连接 | QUIC |
| 传输层 | TCP | TCP | TCP | UDP |
| 报文格式 | 文本 | 文本 | 二进制帧 | 二进制帧 |
| 多路复用 | ✗ | 管道化（弃用） | ✓ Stream | ✓ Stream |
| 队头阻塞 | HTTP 层 | HTTP 层 | TCP 层 | 无 |
| 头部压缩 | ✗ | ✗ | HPACK | QPACK |
| 加密 | 可选 | 可选 | 实践中必 TLS | 内建 TLS 1.3 |
| 建连 RTT | 多次握手 | 2-3 RTT | 2-3 RTT | 1 RTT / 0-RTT |
| 服务器推送 | ✗ | ✗ | 有（已弃用） | ✗ |

## 十一、工作中常用场景

1. **Content-Type 协商**：前后端约定 JSON 还是 form。\`multipart/form-data\` 上传文件要带 boundary。
2. **CORS 跨域**：浏览器对跨域请求做预检（OPTIONS），服务端回 \`Access-Control-Allow-Origin\`。OPTIONS 不带 Cookie。
3. **缓存控制**：\`Cache-Control: max-age\` + \`ETag\` + \`If-None-Match\` 实现 304 协商缓存，省带宽。
4. **长连接调优**：Nginx \`keepalive_timeout\`、上游 \`keepalive\` 连接池，减少 TIME_WAIT。
5. **HTTP/2 启用**：Nginx 加 \`http2 on\`，注意 HTTP/2 必须在 TLS 上（实践中），且一个连接并发多请求，别再域名分片。

## 十二、常见陷阱与最佳实践

1. **GET 带 body**：会被代理丢弃，别这么干。
2. **POST 不幂等就重试**：网络重试可能重复下单，务必用幂等键。
3. **依赖 302 改方法**：302 历史上会把 POST 变 GET，要用 307（保方法）。
4. **HTTP/2 比 1.1 一定快**：弱网丢包高时 HTTP/2 因 TCP 队头阻塞可能更慢。
5. **Transfer-Encoding chunked 配 Content-Length**：二者互斥，二选一。
6. **Host 头缺失**：HTTP/1.1 强制 Host，缺失返回 400。
7. **HTTP/2 多路复用让连接数不再重要**：错，单连接 TCP 层队头阻塞仍在，HTTP/3 才真解决。

## 十三、面试要点

**Q1：HTTP/1.1 和 HTTP/2 的核心区别？**
答：①HTTP/2 二进制分帧，1.1 是文本；②HTTP/2 多路复用单连接并发多请求，1.1 同连接串行有队头阻塞；③HTTP/2 用 HPACK 压缩头部；④HTTP/2 有服务端推送（已弃用）。HTTP/2 解决 HTTP 层队头阻塞但仍受 TCP 层队头阻塞影响。

**Q2：HTTP/2 为什么还有队头阻塞？**
答：HTTP/2 多个 Stream 跑在一个 TCP 连接上，TCP 保证有序。一个 TCP 包丢失，所有 Stream 都要等它重传，这是 TCP 层队头阻塞。HTTP/3 改用 QUIC（UDP）让 Stream 独立解决。

**Q3：HTTP/3 为什么用 UDP？**
答：TCP 在内核实现难以演进，且 TCP 层队头阻塞无法解决。QUIC 跑在 UDP 上（用户态），实现独立 Stream 可靠性、0-RTT 握手、连接迁移，解决 HTTP/2 遗留问题。

**Q4：GET 和 POST 的区别？**
答：语义上 GET 获取（安全幂等无 body），POST 创建（不幂等有 body）。但本质都是 TCP 请求，技术上 GET 也能带 body。关键差异在幂等性和语义，不是"GET 有长度限制"（那是浏览器/服务器限制，不是协议）。

**Q5：HTTP 常见状态码？301/302 区别？**
答：2xx 成功（200/201/204）、3xx 重定向（301 永久/302 临时/304 缓存）、4xx 客户端错（400/401/403/404/429）、5xx 服务端错（500/502/503/504）。301 永久重定向可缓存且 SEO 权重转移，302 临时不缓存；307/308 保留原方法。

**Q6：HTTP/1.1 Keep-Alive 是什么？**
答：长连接复用，默认开启，一个 TCP 连接上可发多个请求，省去每次握手开销。配合 \`Keep-Alive: timeout,max\` 控制。注意它和 TCP 的 keepalive（链路探测）是两回事。

## 十四、本章小结

1. HTTP 是无状态、请求-响应的应用层协议，报文是文本（1.x）或二进制（2/3）。
2. 方法分安全/幂等语义：GET 幂等安全，POST 不幂等。
3. 状态码 1-5 类，重点 200/301/302/304/400/401/403/404/500/502/504。
4. HTTP/1.0 短连接，1.1 长连接+Host，2 多路复用+HPACK，3 基于 QUIC 干掉 TCP 队头阻塞。
5. HTTP/2 解决 HTTP 层队头阻塞，HTTP/3 解决 TCP 层队头阻塞。
6. 工作中关注 Content-Type、CORS、缓存、Keep-Alive 调优。

下一章我们把 HTTP 升级到 HTTPS，看 TLS 怎么加密通信。\`,
    code: \`# ============================================================
# 第三章代码演示：HTTP 协议交互
# ------------------------------------------------------------
# 演示内容：
#   1. 用 http.server 启动本地 HTTP server（线程）
#   2. 用 http.client 请求本地 server
#   3. 演示 GET / POST / PUT / DELETE 方法和状态码
#   4. 打印完整的请求报文和响应报文
# ============================================================
import json
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from http.client import HTTPConnection

print("=" * 60)
print("HTTP 协议演示：方法、状态码、报文结构")
print("=" * 60)

# 模拟一个资源存储
DB = {"items": {"1": {"name": "apple", "price": 5}}}


class Handler(BaseHTTPRequestHandler):
    # 关闭默认日志，自己打印请求行
    def log_message(self, *args):
        pass

    def _print_request(self):
        print(f"  >> {self.command} {self.path} {self.request_version}")
        for k, v in self.headers.items():
            print(f"     {k}: {v}")

    def _send_json(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._print_request()
        if self.path == "/api/items":
            self._send_json(200, DB["items"])
        elif self.path.startswith("/api/items/"):
            key = self.path.split("/")[-1]
            if key in DB["items"]:
                self._send_json(200, DB["items"][key])
            else:
                self._send_json(404, {"error": "not found"})
        else:
            self._send_json(404, {"error": "unknown path"})

    def do_POST(self):
        self._print_request()
        length = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(length) or b"{}")
        new_id = str(len(DB["items"]) + 1)
        DB["items"][new_id] = data
        self._send_json(201, {"id": new_id, **data})

    def do_PUT(self):
        self._print_request()
        key = self.path.split("/")[-1]
        length = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(length) or b"{}")
        if key in DB["items"]:
            DB["items"][key] = data
            self._send_json(200, {"id": key, **data})
        else:
            self._send_json(404, {"error": "not found"})

    def do_DELETE(self):
        self._print_request()
        key = self.path.split("/")[-1]
        if key in DB["items"]:
            del DB["items"][key]
            self._send_json(204, {})
        else:
            self._send_json(404, {"error": "not found"})


# 启动 server（端口 0 = 系统分配）
server = HTTPServer(("127.0.0.1", 0), Handler)
port = server.server_address[1]
print(f"HTTP server 已启动: http://127.0.0.1:{port}")
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.2)


def request(method, path, body=None, headers=None):
    conn = HTTPConnection("127.0.0.1", port, timeout=5)
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    conn.request(method, path, body=body, headers=hdrs)
    resp = conn.getresponse()
    data = resp.read().decode()
    print(f"  << HTTP/{resp.version/10:.1f} {resp.status} {resp.reason}")
    for k, v in resp.getheaders():
        print(f"     {k}: {v}")
    if data:
        print(f"     [body] {data}")
    conn.close()
    print("-" * 60)
    return resp.status


print("\\n[1] GET 集合 -> 200")
request("GET", "/api/items")

print("[2] GET 单个 -> 200")
request("GET", "/api/items/1")

print("[3] GET 不存在 -> 404")
request("GET", "/api/items/999")

print("[4] POST 创建 -> 201")
request("POST", "/api/items", body=json.dumps({"name": "banana", "price": 3}))

print("[5] PUT 更新 -> 200")
request("PUT", "/api/items/1", body=json.dumps({"name": "apple", "price": 6}))

print("[6] DELETE 删除 -> 204")
request("DELETE", "/api/items/2")

print("[7] 验证删除后 GET -> 404")
request("GET", "/api/items/2")

server.shutdown()
print("HTTP server 已关闭")
print("\\n[小结] 演示了 GET/POST/PUT/DELETE 与 200/201/204/404 状态码")
print("观察请求行、请求头、空行、请求体，以及响应的结构")
\`,
  },

  // ============================================================
  // 第四章：HTTPS 与 TLS 握手
  // ============================================================
  {
    id: "net-https",
    title: "HTTPS 与 TLS 握手",
    icon: "🔒",
    group: "网络基础篇",
    content: \`## 一、为什么需要 HTTPS

HTTP 是明文传输——你登录的密码、银行卡号、Token 在网络上一路裸奔，任何中间节点（路由器、运营商、咖啡店 Wi-Fi）都能窃听、篡改。HTTPS = HTTP + TLS，在 HTTP 下加一层加密，解决三大安全问题：

1. **机密性（加密）**：数据加密，中间人看不懂内容。
2. **完整性（防篡改）**：MAC/AEAD 保证数据不被改。
3. **身份认证（防冒充）**：证书证明服务器身份，防钓鱼。

工作中 HTTPS 是标配：浏览器对 HTTP 站点标"不安全"、微信小程序/苹果 ATS 强制 HTTPS、SEO 排名加权。理解 TLS 握手和证书原理，是配置 Nginx SSL、排查证书错误、做双向认证的基础。

### 1.1 HTTPS 默认端口

HTTP 默认 80，HTTPS 默认 443。Nginx 配置时 \`listen 443 ssl;\` 即开启 HTTPS。

### 1.2 TLS 不是传输层

常被误认为 TLS 是传输层。其实 TLS 是**会话层/表示层**协议，夹在应用层（HTTP）和传输层（TCP）之间。它对 HTTP 透明——HTTP 应用代码不变，只是底层 socket 被 TLS 包裹（\`wrap_socket\`）。

\`\`\`text
应用层:   HTTP 请求/响应
表示层:   TLS 加密/解密、压缩
传输层:   TCP 段
\`\`\`

## 二、加密基础：对称 vs 非对称

理解 TLS 必须先懂两种加密：

**对称加密**：加密解密用**同一个密钥**。如 AES、ChaCha20。速度快，适合加密大量数据。问题：密钥怎么安全传给对方？直接发会被窃听。

**非对称加密**：一对密钥——**公钥**公开，**私钥**保密。用公钥加密只能用私钥解密（反之亦然）。如 RSA、ECDH。解决密钥分发问题，但慢（比对称慢百倍），不适合加密大数据。

\`\`\`text
非对称加密：
  A 想发机密给 B:
    1. B 把公钥公开
    2. A 用 B 的公钥加密 → 密文
    3. 只有 B 的私钥能解密 → 明文
  中间人即使拿到公钥和密文也解不开（缺私钥）
\`\`\`

**TLS 的聪明之处**：用非对称加密**协商出一个对称密钥**（密钥交换），之后用对称密钥加密所有数据。兼顾安全（密钥协商安全）和性能（数据传输用对称加密快）。

### 2.1 哈希与数字签名

- **哈希（Hash）**：把任意数据映射成固定长度摘要（如 SHA-256 输出 32 字节）。单向、抗碰撞。用于校验完整性。
- **数字签名**：用私钥对哈希加密，得到签名。对方用公钥验证——能验证通过说明数据确实来自私钥持有者且未被篡改。证书就是靠签名实现"身份证明"。

\`\`\`text
签名过程：
  发送方: hash = SHA256(data); sign = RSA_私钥加密(hash); 发 (data, sign)
  接收方: 用公钥解 sign 得 hash1; 自己算 hash2 = SHA256(data)
          hash1 == hash2 → 验证通过（数据真实完整）
\`\`\`

## 三、TLS 握手过程（TLS 1.2）

TLS 1.2 握手需要 2 个 RTT（往返）才完成。下面是完整过程：

\`\`\`text
Client                                          Server
  |                                               |
  |  1. ClientHello                               |
  |     - 支持的 TLS 版本(1.2)                     |
  |     - 支持的密码套件列表                         |
  |     - 客户端随机数 ClientRandom (32 字节)       |
  |     - SNI (目标域名)                          |
  |  ────────────────────────────→               |
  |                                               |
  |  2. ServerHello                               |
  |     - 选定的 TLS 版本                          |
  |     - 选定的密码套件 (如 TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256)
  |     - 服务端随机数 ServerRandom               |
  |  ────────────────────────────←               |
  |  3. Certificate                               |
  |     - 服务器证书链 (含公钥)                    |
  |  ────────────────────────────←               |
  |  4. ServerKeyExchange                         |
  |     - ECDHE 参数(用于密钥协商)                 |
  |  5. ServerHelloDone                           |
  |  ────────────────────────────←               |
  |                                               |
  |  6. ClientKeyExchange                         |
  |     - 客户端 ECDHE 参数                       |
  |  7. ChangeCipherSpec                          |
  |     - "接下来我都加密了"                       |
  |  8. Finished (加密)                           |
  |  ────────────────────────────→               |
  |                                               |
  |  9. ChangeCipherSpec                          |
  |  10. Finished (加密)                          |
  |  ────────────────────────────←               |
  |                                               |
  |  握手完成，开始加密通信                         |
\`\`\`

### 3.1 密钥是怎么协商出来的

以 ECDHE 为例（现代主流）：

1. 双方各生成一对临时椭圆曲线密钥对（ClientECDH、ServerECDH）。
2. 交换公钥（通过 ClientKeyExchange / ServerKeyExchange）。
3. 各自用自己的私钥 + 对方公钥算出**相同的共享密钥 PreMasterSecret**（ECDH 数学性质保证）。
4. 用 ClientRandom + ServerRandom + PreMasterSecret 派生出**MasterSecret**，再派生出一组对称密钥（写密钥、读密钥、MAC 密钥）。

因为用临时密钥对（每次握手都换），所以叫 **ECDHE（E=Ephemeral 临时）**，提供**前向安全**——即使日后私钥泄漏，旧的握手流量也无法解密（因为临时密钥已销毁）。

### 3.2 证书验证

ClientHello 时客户端拿到服务器证书，要验证：

1. **证书链**：终端证书 → 中间 CA → 根 CA。根 CA 预置在操作系统/浏览器信任库（如 macOS Keychain、Firefox 自带）。
2. **签名**：用上级 CA 的公钥验证下级证书的签名。
3. **域名匹配**：证书的 SAN（Subject Alternative Name）包含访问的域名。
4. **有效期**：notBefore < now < notAfter。
5. **吊销状态**：查 OCSP 或 CRL，确认证书没被吊销。

任一检查失败，浏览器报"NET::ERR_CERT_AUTHORITY_INVALID"等错误。

## 四、TLS 1.3 的重大改进

2018 年发布的 TLS 1.3 大幅简化、提速：

### 4.1 1-RTT 握手

TLS 1.2 要 2-RTT，TLS 1.3 只要 1-RTT——ClientHello 就带上密钥交换参数，服务端一次回完所有信息。

\`\`\`text
TLS 1.3 握手（1-RTT）：
  Client → ClientHello + KeyShare          (带 ECDHE 公钥)
  Server ← ServerHello + KeyShare + Cert + Finished (加密)
  Client → Finished (加密)
  完成！1 个 RTT 后就能发应用数据
\`\`\`

### 4.2 0-RTT 恢复

复用之前的会话（PSK 模式）时，ClientHello 直接带加密的应用数据，**0-RTT** 就能发请求。代价：0-RTT 数据有**重放风险**（攻击者重放相同数据），所以只用于幂等请求（如 GET），不能用于下单等非幂等操作。

### 4.3 移除不安全算法

TLS 1.3 砍掉了一大堆不安全的算法：
- 移除 RSA 密钥交换（不支持前向安全）。
- 移除静态 DH、非 AEAD 的密码套件。
- 移除 SHA-1、MD5、RC4、3DES、CBC 模式（有漏洞）。
- 只保留 AEAD 加密（AES-GCM、ChaCha20-Poly1305）和 ECDHE/DHE 密钥交换。

密码套件从 TLS 1.2 的几十个精简到 TLS 1.3 的 5 个，配置简单不易出错。

### 4.4 握手加密

TLS 1.2 的证书是明文传的（中间人能看到你访问哪个站，即便内容加密）。TLS 1.3 在 ServerHello 之后所有握手消息都加密，连证书都看不到——进一步提升隐私（但 SNI 仍是明文，ESNI/ECH 在解决）。

## 五、密码套件命名

密码套件（Cipher Suite）是一个组合：**密钥交换 + 认证 + 加密 + MAC**。

**TLS 1.2 命名**（如 \`TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256\`）：
- \`ECDHE\`：密钥交换（临时椭圆曲线 DH）
- \`RSA\`：认证（用 RSA 证书）
- \`AES_128_GCM\`：加密算法（AES-128-GCM，AEAD）
- \`SHA256\`：PRF/伪随机函数

**TLS 1.3 命名**（如 \`TLS_AES_256_GCM_SHA384\`）：
- 只有加密和哈希，因为密钥交换固定 ECDHE、认证固定证书，不用写在名字里。
- 常见：\`TLS_AES_256_GCM_SHA384\`、\`TLS_CHACHA20_POLY1305_SHA256\`、\`TLS_AES_128_GCM_SHA256\`。

优先选 **AEAD** 套件（GCM/ChaCha20-Poly1305），它们把加密和认证合一，避免 CBC 模式的填充 oracle 攻击（如 POODLE、Lucky13）。

## 六、证书与 CA

### 6.1 证书链

\`\`\`text
根 CA (Root CA)          ← 自签名，预置在信任库
  ↑ 签发
中间 CA (Intermediate)   ← 由根 CA 签发，负责签终端证书
  ↑ 签发
终端证书 (Leaf)           ← 你申请的 www.example.com 证书
\`\`\`

服务器在握手时要发**终端证书 + 中间证书**（不发根 CA，因为客户端自带）。漏发中间证书会导致"证书链不完整"错误。

### 6.2 证书类型

| 类型 | 验证内容 | 颁发速度 | 价格 | 典型 |
|------|---------|---------|------|------|
| DV | 域名所有权 | 自动，分钟级 | 免费/便宜 | Let's Encrypt |
| OV | 域名 + 组织身份 | 人工审核，天级 | 几百-几千 | 企业站 |
| EV | 严格组织审核 | 数天 | 上千-上万 | 金融、银行（地址栏绿色，现已弱化） |

DV 证书只证明"你控制这个域名"，不证明你是谁。Let's Encrypt 让 DV 免费自动化，HTTPS 普及大功臣。

### 6.3 自签名证书

开发/测试用自签名证书（自己签自己）。浏览器不信任会报警告。生产必须用 CA 签名的证书。本课 demo 就用 openssl 自签名证书演示 TLS 握手。

### 6.4 Let's Encrypt 免费证书

Let's Encrypt 通过 ACME 协议自动签发 DV 证书：
1. 客户端证明对域名的控制（HTTP-01 验证放文件，或 DNS-01 加 TXT 记录）。
2. CA 签发证书，有效期 90 天。
3. 用 certbot/acme.sh 配合 cron 自动续期。

Nginx + certbot 一条命令搞定，生产标配。

## 七、HSTS 强制 HTTPS

即使用了 HTTPS，用户可能输入 \`http://\` 被中间人劫持降级。**HSTS**（HTTP Strict Transport Security）让服务器告诉浏览器"以后只用 HTTPS 访问我"：

\`\`\`text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

浏览器记下后，期限内所有访问自动跳转 HTTPS，拒绝降级。加上 \`preload\` 可申请加入浏览器内置 HSTS 预加载列表（即使用户第一次访问也强制 HTTPS）。

## 八、TLS 1.2 vs TLS 1.3 对比

| 特性 | TLS 1.2 | TLS 1.3 |
|------|---------|---------|
| 握手 RTT | 2-RTT | 1-RTT（0-RTT 恢复） |
| 密码套件 | 数十个 | 5 个 |
| 密钥交换 | RSA/ECDHE/DHE 等 | 仅 ECDHE/DHE（PSK） |
| 加密 | CBC/GCM/ChaCha20 等 | 仅 AEAD（GCM/ChaCha20） |
| 前向安全 | ECDHE 套件才有 | 全部强制 |
| 握手加密 | 部分明文 | ServerHello 后全加密 |
| RSA 密钥交换 | 支持 | 移除 |
| CBC 模式 | 支持 | 移除 |

## 九、工作中常用场景

1. **Nginx 配置 SSL**：
   \`\`\`text
   server {
     listen 443 ssl http2;
     ssl_certificate     /etc/ssl/fullchain.pem;
     ssl_certificate_key /etc/ssl/privkey.pem;
     ssl_protocols TLSv1.2 TLSv1.3;
     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...;
   }
   \`\`\`
   记得发 fullchain（终端+中间），别只发终端证书。

2. **证书续期**：Let's Encrypt 90 天到期，用 certbot renew + cron 自动续。监控告警提前 30 天提醒。

3. **排查证书错误**：\`openssl s_client -connect host:443 -servername host\` 看证书链、协商的套件、是否完整。浏览器 F12 安全面板看详情。

4. **双向 TLS（mTLS）**：客户端也要证书，服务端验证。用于内部服务互信、零信任网络。Nginx \`ssl_verify_client on;\`。

5. **性能优化**：开 TLS 1.3、Session Resumption（会话复用减少握手）、OCSP Stapling（服务端带 OCSP 结果省去客户端查询）。

## 十、常见陷阱与最佳实践

1. **只配终端证书**：漏发中间证书，部分客户端报错。永远配 fullchain。
2. **私钥泄露**：私钥权限 600，别提交到 Git。泄露要立即吊销重签。
3. **用 RSA 密钥交换**：不支持前向安全，应改 ECDHE。TLS 1.3 已强制。
4. **开 CBC 模式**：有 BEAST/Lucky13 漏洞，用 GCM/ChaCha20。
5. **0-RTT 用于非幂等**：0-RTT 可重放，POST 下单会重复，只用于 GET。
6. **HSTS preload 无法撤销**：加入 preload 列表后很难移除，确保准备好长期 HTTPS。
7. **混合内容**：HTTPS 页面引 HTTP 资源会被浏览器拦截，要全站 HTTPS。
8. **证书未续期**：过期后服务直接不可用。务必设自动续期 + 告警。

## 十一、面试要点

**Q1：HTTPS 和 HTTP 的区别？TLS 在哪一层？**
答：HTTPS = HTTP + TLS，默认端口 443（HTTP 80）。TLS 提供加密（机密性）、MAC/AEAD（完整性）、证书（身份认证）。TLS 在会话/表示层，夹在 HTTP 和 TCP 之间，对 HTTP 透明。

**Q2：讲讲 TLS 握手过程。**
答：①ClientHello 带版本、套件、随机数、SNI；②ServerHello 选定套件、随机数，发证书链；③密钥交换（ECDHE 双方交换公钥算共享密钥）；④双方用随机数+共享密钥派生对称密钥；⑤Finished 互相验证握手无篡改。TLS 1.2 两 RTT，TLS 1.3 一 RTT。

**Q3：TLS 1.3 比 1.2 改进什么？**
答：①1-RTT 握手（1.2 要 2-RTT），支持 0-RTT 恢复；②移除不安全算法（RSA 密钥交换、CBC、SHA1、RC4），强制 ECDHE 前向安全；③密码套件精简到 5 个；④ServerHello 后握手全加密，提升隐私。

**Q4：为什么用非对称加密协商对称密钥？**
答：对称加密快但密钥分发难（直接发会被窃听）。非对称加密无密钥分发问题但慢。TLS 用非对称（ECDHE/RSA）安全协商出对称密钥，之后用对称密钥加密大量数据，兼顾安全与性能。

**Q5：什么是前向安全（PFS）？为什么 ECDHE 有而 RSA 没有？**
答：前向安全指私钥泄漏不危及历史流量。ECDHE 用临时密钥对（每次握手换），握手后销毁，私钥泄漏也解不开历史流量。RSA 密钥交换用服务器私钥直接加密预主密钥，私钥泄漏就能解密所有历史抓包。TLS 1.3 强制 ECDHE 保证前向安全。

**Q6：证书链怎么验证？**
答：终端证书由中间 CA 签发，中间 CA 由根 CA 签发。客户端用上级 CA 公钥验证下级证书签名，逐级上溯到根 CA（预置在信任库即信任）。还要校验域名（SAN）、有效期、吊销状态（OCSP/CRL）。服务器要发终端+中间证书，根证书客户端自带不发。

**Q7：什么是 HSTS？**
答：HTTP Strict Transport Security，服务器响应头 \`Strict-Transport-Security: max-age=...\` 告诉浏览器此域名长期用 HTTPS。期限内浏览器自动 HTTPS 访问，拒绝降级劫持。preload 可加入浏览器内置列表，首次访问也强制 HTTPS。

## 十二、本章小结

1. HTTPS = HTTP + TLS，解决机密性、完整性、身份认证三大问题。
2. TLS 用非对称加密（ECDHE）协商对称密钥，用对称密钥（AES-GCM）加密数据。
3. TLS 1.2 握手 2-RTT，TLS 1.3 握手 1-RTT 且支持 0-RTT，移除不安全算法。
4. 证书链：根 CA → 中间 CA → 终端证书，服务器发终端+中间。
5. DV/OV/EV 证书验证严格度递增，Let's Encrypt 让 DV 免费自动化。
6. HSTS 强制 HTTPS 防降级，preload 加入浏览器内置列表。
7. 工作中：Nginx 配 fullchain、开 TLS 1.3、自动续期、避免 0-RTT 用于非幂等。

至此网络基础篇四章结束。接下来应用层协议篇将深入 DNS、WebSocket、CORS/CSRF、Cookie/Session。\`,
    code: \`# ============================================================
# 第四章代码演示：HTTPS 与 TLS 握手
# ------------------------------------------------------------
# 演示内容：
#   1. 用 ssl 模块配置证书验证上下文
#   2. 用 openssl 命令生成自签名证书
#   3. 启动 HTTPS server（本地自签名）+ client 连接
#   4. 打印 TLS 握手信息（协议版本、密码套件、证书信息）
# ============================================================
import os
import ssl
import socket
import threading
import time
import subprocess
import tempfile

print("=" * 60)
print("HTTPS 与 TLS 握手演示")
print("=" * 60)

# ============================================================
# 1. 创建 SSL 上下文并展示配置
# ============================================================
print("\\n[1] SSL 上下文配置")
print("-" * 60)

client_ctx = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
print(f"客户端 Purpose: {ssl.Purpose.SERVER_AUTH}")
print(f"默认最低版本: {ssl.TLSVersion.MINIMUM_SUPPORTED}")
print(f"默认最高版本: {ssl.TLSVersion.MAXIMUM_SUPPORTED}")
print(f"verify_mode: {client_ctx.verify_mode} (CERT_REQUIRED=要求验证)")
print(f"check_hostname: {client_ctx.check_hostname}")
print("支持的密码套件（部分）:")
for c in client_ctx.get_ciphers()[:5]:
    print(f"  - {c['name']}  version={c['protocol']}  kx={c['kx']}")

# ============================================================
# 2. 用 openssl 生成自签名证书
# ============================================================
print("\\n[2] 生成自签名证书（openssl）")
print("-" * 60)

tmpdir = tempfile.mkdtemp()
cert_path = os.path.join(tmpdir, "cert.pem")
key_path = os.path.join(tmpdir, "key.pem")

cmd = [
    "openssl", "req", "-x509", "-newkey", "rsa:2048",
    "-keyout", key_path, "-out", cert_path,
    "-days", "1", "-nodes",
    "-subj", "/CN=localhost",
]
result = subprocess.run(cmd, capture_output=True, text=True, timeout=8)
if result.returncode == 0:
    print(f"openssl 成功生成证书: {os.path.getsize(cert_path)} 字节")
    print(f"  证书: {cert_path}")
    print(f"  私钥: {key_path}")
else:
    print(f"openssl 失败: {result.stderr[:200]}")
    raise SystemExit(1)

# ============================================================
# 3. 启动 HTTPS server
# ============================================================
print("\\n[3] 启动 HTTPS server（TLS 包装 socket）")
print("-" * 60)

server_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
server_ctx.load_cert_chain(cert_path, key_path)
print(f"server 端协议: {server_ctx.protocol}")
print("已加载自签名证书链")

raw_srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
raw_srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
raw_srv.bind(("127.0.0.1", 0))
raw_srv.listen(1)
port = raw_srv.getsockname()[1]
print(f"HTTPS server listen: https://127.0.0.1:{port}")

def serve_https():
    conn, addr = raw_srv.accept()
    # 用 TLS 包装连接 -> 这一步完成 TLS 握手
    tls_conn = server_ctx.wrap_socket(conn, server_side=True)
    print(f"  [server] TLS 握手完成，对端={addr}")
    data = tls_conn.recv(1024)
    body = b'{"msg":"hello over TLS"}'
    resp = (
        b"HTTP/1.1 200 OK\\r\\n"
        b"Content-Type: application/json\\r\\n"
        b"Content-Length: " + str(len(body)).encode() + b"\\r\\n"
        b"Connection: close\\r\\n\\r\\n" + body
    )
    tls_conn.sendall(resp)
    tls_conn.close()

threading.Thread(target=serve_https, daemon=True).start()
time.sleep(0.2)

# ============================================================
# 4. 客户端连接，演示 TLS 握手信息
# ============================================================
print("\\n[4] 客户端发起 HTTPS 请求")
print("-" * 60)

# 信任我们自签的证书（生产环境应使用受信任的 CA 证书）
trust_ctx = ssl.create_default_context(cafile=cert_path)
print(f"客户端用 cafile={os.path.basename(cert_path)} 信任自签证书")

raw_cli = socket.create_connection(("127.0.0.1", port), timeout=5)
# wrap_socket 这一步触发 TLS 握手
tls_cli = trust_ctx.wrap_socket(raw_cli, server_hostname="localhost")

print(f"\\n=== TLS 握手结果 ===")
print(f"协商的协议版本: {tls_cli.version()}")
cipher = tls_cli.cipher()
print(f"协商的密码套件: {cipher[0]}")
print(f"套件类型: {cipher[1]} (TLS 1.3 套件名不含密钥交换)")

# 获取并打印证书信息
cert_dict = tls_cli.getpeercert()
print(f"\\n=== 服务器证书信息 ===")
for rdn in cert_dict.get("subject", []):
    for k, v in rdn:
        print(f"  {k}: {v}")
print(f"  颁发者: {cert_dict.get('issuer')}")
print(f"  有效期: {cert_dict.get('notBefore')} ~ {cert_dict.get('notAfter')}")
print(f"  SAN: {cert_dict.get('subjectAltName')}")

# 发送 HTTPS 请求
print(f"\\n=== HTTPS 请求/响应 ===")
request = b"GET / HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n"
tls_cli.sendall(request)
print(f"客户端发送:\\n{request.decode().strip()}")

response = tls_cli.recv(4096)
print(f"服务器响应:")
print(response.decode())
tls_cli.close()

print("\\n[小结]")
print("- 客户端用 create_default_context(cafile=...) 信任自签证书")
print("- wrap_socket 触发 TLS 握手（协商版本、套件、验证证书）")
print("- 本环境协商出 TLS 1.3 + TLS_AES_256_GCM_SHA384")
print("- 之后 HTTP 明文被 TLS 加密成密文传输（HTTPS = HTTP over TLS）")
\`,
  },
];
