// =============================================================
// Python 网络编程教程（pynet）—— 第一批章节（网络基础 + TCP 编程，共 7 章）
// -------------------------------------------------------------
// 系统讲解 Python 网络编程，从 socket API 到 TCP 服务器/客户端实战。
// 包含以下章节：
//   网络基础组：
//     1. py-net-intro   — 网络编程入门
//     2. py-net-socket  — socket 模块基础
//     3. py-net-address — 地址与端口
//   TCP 编程组：
//     4. py-tcp-server    — TCP 服务器
//     5. py-tcp-client    — TCP 客户端
//     6. py-tcp-echo      — TCP echo 实战
//     7. py-tcp-concurrent — 并发 TCP 服务器
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量大，含大量 demo）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束（非常重要！）：
//   - 用 python3 直接运行，5 秒超时，超时会被 kill
//   - 仅使用 Python 标准库（不能用 requests/aiohttp 等第三方库）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
//   - 网络代码必须在 5 秒内完成，不能永久阻塞
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：网络编程入门
  // ============================================================
  {
    id: "py-net-intro",
    group: "网络基础",
    icon: "🌐",
    title: "网络编程入门",
    content: `## 一、什么是网络编程

网络编程，本质上是**让分布在不同计算机上的进程能够互相通信**。你的浏览器能打开网页、微信能收发消息、数据库客户端能查询远程数据库——这些背后都是网络编程在起作用。

从程序员视角看，网络编程要解决三个核心问题：

1. **寻址**：数据要发给谁？用 IP 地址定位主机，用端口号定位主机上的进程。
2. **传输**：数据怎么发？用 TCP 保证可靠有序，还是用 UDP 追求低延迟？
3. **协议**：数据长什么样？双方约定好报文格式（如 HTTP 请求行 + 头部 + 主体）。

操作系统把这些能力封装成了一套 API，在 Linux/Windows/macOS 上统一称为 **socket（套接字）API**。Python 的 \`socket\` 模块就是对操作系统 socket API 的薄薄一层封装。掌握 socket，就掌握了网络编程的底层钥匙——所有高级框架（Flask、Django、requests、aiohttp）底层都在用 socket。

### 1.1 为什么直接学 socket 而不是 requests

很多初学者会问："既然有 requests 这么好用的库，为什么还要学 socket？" 答案有三：

- **理解原理**：requests 出 bug（连接超时、连接被拒、乱码）时，不懂 socket 你只能瞎猜；懂了 socket 你能立刻定位是连接阶段、发送阶段还是接收阶段的问题。
- **协议自由**：requests 只会 HTTP。如果你想实现自定义 RPC 协议、游戏服务器、IoT 设备通信、数据库代理，必须直接用 socket。
- **性能调优**：高并发服务器的连接复用、零拷贝、背压控制，都需要在 socket 层面理解。

所以 socket 是网络编程的"内功"，requests 是"招式"。内功扎实，学什么招式都快。

## 二、OSI 七层模型

网络通信是一个极其复杂的问题，工程师们用**分层**的思想把它拆解：每一层只解决一个关注点，对上层提供接口，对下层隐藏细节。1970 年代 ISO 组织提出了 OSI（Open Systems Interconnection）七层参考模型：

| 层号 | 名称 | 英文 | 职责 | 典型协议 | 数据单元 |
|------|------|------|------|----------|----------|
| 7 | 应用层 | Application | 为应用程序提供网络服务 | HTTP、FTP、SMTP、DNS | 报文 Message |
| 6 | 表示层 | Presentation | 数据格式转换、加密压缩 | SSL/TLS、JPEG、ASCII | 数据 Data |
| 5 | 会话层 | Session | 建立/维护/断开会话 | RPC、NetBIOS | 数据 Data |
| 4 | 传输层 | Transport | 端到端可靠传输 | TCP、UDP | 段 Segment |
| 3 | 网络层 | Network | 跨网络路由与寻址 | IP、ICMP | 包 Packet |
| 2 | 数据链路层 | Data Link | 相邻节点成帧传输 | 以太网、ARP | 帧 Frame |
| 1 | 物理层 | Physical | 比特流在介质上传输 | 电信号、光纤 | 比特 Bit |

记忆口诀（从下往上）：**物（物理）链（链路）网（网络）传（传输）会（会话）表（表示）应（应用）**。

### 2.1 分层的好处

1. **解耦**：HTTP 不用关心底层是 Wi-Fi 还是有线，换网卡不影响上层协议。
2. **复用**：同一套 TCP 既可承载 HTTP，也可承载 SSH、MySQL 协议。
3. **标准化**：每层有 RFC 规范，不同厂商设备能互通。

### 2.2 实际中的层会合并

OSI 是理论模型，实际 TCP/IP 实现中，会话层/表示层/应用层常合并成一层。所以工程中更常用的是 TCP/IP 四层模型。

## 三、TCP/IP 四层模型

互联网实际使用的是 TCP/IP 模型，它把 OSI 的七层压缩成四层：

| TCP/IP 层 | 对应 OSI 层 | 典型协议 | 本教程关注点 |
|-----------|-------------|----------|--------------|
| 应用层 | 7、6、5 | HTTP、DNS、SMTP、SSH | 第 4-7 章在应用层写自定义协议 |
| 传输层 | 4 | TCP、UDP | **本教程重点**，socket 主要在这一层 |
| 网络层 | 3 | IP、ICMP | socket 通过 AF_INET 使用 |
| 链路层 | 2、1 | 以太网、Wi-Fi | 操作系统和网卡处理，程序员基本不碰 |

> **关键认知**：Python 的 \`socket\` 模块工作在传输层之上。当我们创建一个 \`SOCK_STREAM\` socket 并 \`connect()\` 时，操作系统会自动完成下面三层（IP 路由、链路成帧、物理传输）的所有工作。程序员只需关心传输层和应用层。

## 四、传输层两大协议：TCP vs UDP

传输层是 socket 编程最直接打交道的一层，它有两个核心协议：

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接性 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠（重传、确认、排序） | 不可靠（尽最大努力） |
| 传输方式 | 字节流（无边界） | 数据报（有边界） |
| 头部开销 | 20+ 字节 | 8 字节 |
| 速度 | 较慢（需要握手和确认） | 快（无握手） |
| 拥塞控制 | 有（慢启动、拥塞避免） | 无 |
| 适用场景 | HTTP、SSH、邮件、文件传输 | DNS、视频流、游戏、IoT |

### 4.1 TCP：可靠的字节流

TCP（Transmission Control Protocol）通过三次握手建立连接，四次挥手断开连接，并通过序列号、确认号、重传机制保证数据**不丢、不乱、不重**。代价是开销大、延迟相对高。

\`\`\`text
TCP 三次握手：
Client                              Server
  | --- SYN (seq=x) ---------------> |   ① 客户端发起
  | <--- SYN+ACK (seq=y, ack=x+1)--- |   ② 服务器回应
  | --- ACK (ack=y+1) -------------> |   ③ 客户端确认
  |                                  |   连接建立 ESTABLISHED
\`\`\`

### 4.2 UDP：轻量的数据报

UDP（User Datagram Protocol）不建立连接，发出去就不管了。每个数据报独立、有边界。优势是快、省资源，适合实时性要求高、能容忍少量丢包的场景（如视频通话、DNS 查询）。

## 五、应用层协议

传输层只管把字节送到，但这些字节代表什么含义？由应用层协议定义。常见应用层协议：

| 协议 | 端口 | 传输层 | 用途 |
|------|------|--------|------|
| HTTP | 80 | TCP | 网页、API |
| HTTPS | 443 | TCP | 加密的 HTTP |
| DNS | 53 | UDP/TCP | 域名解析 |
| FTP | 21 | TCP | 文件传输 |
| SMTP | 25 | TCP | 发邮件 |
| SSH | 22 | TCP | 加密远程登录 |
| WebSocket | 80/443 | TCP | 全双工实时通信 |

本教程第 6 章（echo 实战）会带你手写一个最简单的应用层协议，体会协议设计的本质。

## 六、Python 网络编程工具箱

Python 标准库提供了丰富的网络编程模块，从底层到高层：

| 模块 | 层次 | 用途 | 本教程 |
|------|------|------|--------|
| \`socket\` | 传输层 | 底层套接字 API | **核心，全教程都用** |
| \`selectors\` | 传输层 | I/O 多路复用 | 第 7 章 |
| \`asyncio\` | 传输层+ | 异步网络编程 | 第 7 章 |
| \`ssl\` | 传输层+ | TLS/SSL 加密 socket | 进阶 |
| \`http.client\` | 应用层 | HTTP 客户端封装 | 进阶 |
| \`http.server\` | 应用层 | HTTP 服务器封装 | 进阶 |
| \`urllib\` | 应用层 | 高级 HTTP 客户端 | 进阶 |
| \`struct\` | 工具 | 二进制数据打包/解包 | 第 1、6 章 |
| \`pickle\` | 工具 | 对象序列化 | 进阶 |
| \`json\` | 工具 | JSON 编解码 | 进阶 |

> **本教程的定位**：专注 \`socket\` 模块，把传输层编程彻底讲透。掌握了 socket，再去学 http.client、asyncio 就势如破竹。

## 七、客户端/服务器模型（C/S 模型）

网络通信绝大多数采用 **C/S（Client/Server）模型**：

\`\`\`text
        服务器 Server                          客户端 Client
  ┌─────────────────────┐               ┌─────────────────────┐
  │ 1. socket() 创建    │               │ 1. socket() 创建    │
  │ 2. bind() 绑定端口  │               │                     │
  │ 3. listen() 监听    │               │                     │
  │ 4. accept() 等待 ←────────────────── 2. connect() 发起连接 │
  │    （阻塞）         │  三次握手      │                     │
  │ 5. recv()/send() ←────────────────── 3. send() 发送数据   │
  │ 6. send()/recv() ──────────────────→ 4. recv() 接收响应   │
  │ 7. close() 关闭     │               │ 5. close() 关闭     │
  └─────────────────────┘               └─────────────────────┘
\`\`\`

核心思想：**服务器被动等待，客户端主动发起**。服务器要先绑定一个固定端口并监听，客户端才能找到它并连接。

### 7.1 端口与套接字预览

- **端口（Port）**：16 位整数（0-65535），标识主机上的进程。一台主机上同时有浏览器（80）、SSH（22）、MySQL（3306），靠端口区分。
- **套接字（Socket）**：IP 地址 + 端口号的组合，如 \`127.0.0.1:8080\`，是网络通信的端点。

这两个概念会在第 3 章详细讲解。

## 八、本教程学习路径

本教程共 7 章，分两组循序渐进：

**网络基础组（第 1-3 章）**：打地基
1. 网络编程入门（本章）—— 建立整体认知
2. socket 模块基础 —— 学会创建和配置 socket 对象
3. 地址与端口 —— 理解 IP、端口、DNS 解析

**TCP 编程组（第 4-7 章）**：建房子
4. TCP 服务器 —— 写第一个能接受连接的服务器
5. TCP 客户端 —— 写客户端连接服务器
6. TCP echo 实战 —— 完整的请求-响应通信，解决粘包
7. 并发 TCP 服务器 —— threading、selectors、asyncio 三种并发方案

学完这 7 章，你就能写出自己的网络服务器，看懂任何 Python 网络框架的底层实现。

## 九、本章 demo 预告

下面的代码会带你：
- 用 \`socket\` 模块查看本机信息（主机名、IP）
- 认识 TCP 和 UDP 的 socket 类型常量
- 用 \`struct\` 演示网络字节序（大端序）
- 打印 socket 模块的核心常量
- 创建一个最简的 TCP socket 对象

> 💡 **学习建议**：每章的代码都请点击"运行代码"实际跑一遍，对照输出理解每个概念。网络编程是实践性极强的技能，光看不动手学不会。`,
    code: `# ============================================================
# 第一章代码演示：网络编程入门
# ------------------------------------------------------------
# 演示内容：
#   1. 查看本机网络信息（主机名、IP）
#   2. 认识 TCP / UDP 的 socket 类型常量
#   3. 用 struct 演示网络字节序（大端序）
#   4. 打印 socket 模块的核心常量
#   5. 创建最简 TCP socket 对象
# ============================================================
import socket       # Python 网络编程核心模块
import struct       # 二进制数据打包/解包，处理字节序

print("=" * 60)
print("Python 网络编程入门")
print("=" * 60)

# ------------------------------------------------------------
# 一、查看本机网络信息
# ------------------------------------------------------------
print("\\n[1] 本机网络信息")
print("-" * 60)

# 获取本机主机名
hostname = socket.gethostname()
print(f"  主机名 hostname: {hostname}")

# 获取本机 IP（通过主机名解析）
# 注意：gethostbyname 在不同系统返回结果可能不同
# 沙箱里通常返回回环地址或容器地址
try:
    local_ip = socket.gethostbyname(hostname)
    print(f"  本机 IP（通过主机名解析）: {local_ip}")
except socket.gaierror as e:
    print(f"  解析主机名失败: {e}")

# 获取本机所有网络接口的 IP 地址（推荐方式）
# getaddrinfo 返回一个列表，每项是 (family, type, proto, canonname, sockaddr)
print("  本机所有地址（getaddrinfo(hostname, None)）:")
try:
    infos = socket.getaddrinfo(hostname, None)
    seen = set()
    for family, stype, proto, canon, sockaddr in infos:
        ip = sockaddr[0]
        if ip not in seen:
            seen.add(ip)
            fam_name = "IPv4" if family == socket.AF_INET else "IPv6" if family == socket.AF_INET6 else str(family)
            print(f"    {fam_name}: {ip}")
except socket.gaierror:
    print("    （解析失败，跳过）")

# ------------------------------------------------------------
# 二、TCP 与 UDP 的 socket 类型常量
# ------------------------------------------------------------
print("\\n[2] TCP vs UDP 的 socket 类型")
print("-" * 60)

# SOCK_STREAM = 面向连接的可靠字节流 = TCP
print(f"  SOCK_STREAM (= TCP) = {socket.SOCK_STREAM}")
# SOCK_DGRAM = 无连接的不可靠数据报 = UDP
print(f"  SOCK_DGRAM  (= UDP) = {socket.SOCK_DGRAM}")

# 创建 TCP socket 和 UDP socket，对比它们的类型
tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
print(f"  创建的 TCP socket 类型: {tcp_sock.type} (SOCK_STREAM={socket.SOCK_STREAM})")
print(f"  创建的 UDP socket 类型: {udp_sock.type} (SOCK_DGRAM={socket.SOCK_DGRAM})")
print(f"  TCP socket 地址族: {tcp_sock.family} (AF_INET={socket.AF_INET})")

# 查看 socket 的文件描述符（操作系统层面的句柄）
print(f"  TCP socket 文件描述符 fileno(): {tcp_sock.fileno()}")
print(f"  UDP socket 文件描述符 fileno(): {udp_sock.fileno()}")

# 用完一定要关闭，避免资源泄漏
tcp_sock.close()
udp_sock.close()
print("  两个 socket 已 close()")

# ------------------------------------------------------------
# 三、网络字节序（大端序）演示
# ------------------------------------------------------------
print("\\n[3] 网络字节序（大端序）")
print("-" * 60)

# 网络传输多字节数据时统一用大端序（高位字节在前）
# struct.pack 的 '!' 前缀表示网络字节序（= 大端序）
# 'I' 表示 4 字节无符号整数，'H' 表示 2 字节无符号整数

port = 8080
packed_port = struct.pack('!H', port)   # 2 字节，端口号用 H
print(f"  端口 {port} 的网络字节序: {packed_port} (十六进制: {packed_port.hex()})")
unpacked_port = struct.unpack('!H', packed_port)[0]
print(f"  解包后还原: {unpacked_port}")

# 对比：用 4 字节整数表示端口号
big_num = 0x12345678
packed = struct.pack('!I', big_num)     # 4 字节无符号整数
print(f"\\n  数字 0x{big_num:08X} 的网络字节序: {packed.hex()}")
print(f"  大端序（网络序）：高位 0x12 在前 → {packed.hex()}")
# 对比本机字节序（小端序，x86/ARM 都是小端）
packed_local = struct.pack('I', big_num)  # 没有 !，用本机字节序
print(f"  本机字节序（小端序）：低位 0x78 在前 → {packed_local.hex()}")
print("  → 网络编程中传多字节整数必须用 '! ' 前缀保证大端序")

# ------------------------------------------------------------
# 四、socket 模块核心常量一览
# ------------------------------------------------------------
print("\\n[4] socket 模块核心常量")
print("-" * 60)

constants = [
    ("AF_INET",   "IPv4 地址族"),
    ("AF_INET6",  "IPv6 地址族"),
    ("SOCK_STREAM", "TCP 流式套接字"),
    ("SOCK_DGRAM",  "UDP 数据报套接字"),
    ("SOL_SOCKET",  "socket 层选项级别"),
    ("SO_REUSEADDR", "允许重用地址（避免 Address already in use）"),
    ("SO_KEEPALIVE", "保持连接探测"),
]
for name, desc in constants:
    val = getattr(socket, name, "N/A")
    print(f"  socket.{name:14s} = {val!s:6s}  # {desc}")

# ------------------------------------------------------------
# 五、最简 TCP 连接流程（只创建对象，不真正连接）
# ------------------------------------------------------------
print("\\n[5] 最简 TCP socket 创建流程")
print("-" * 60)

# 第一步：创建 socket 对象
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print("  ① socket.socket(AF_INET, SOCK_STREAM) 创建成功")
print(f"     family={sock.family}, type={sock.type}, fileno={sock.fileno()}")

# 设置超时，避免后续操作永久阻塞（好习惯）
sock.settimeout(1.0)
print("  ② sock.settimeout(1.0) 设置 1 秒超时（防止永久阻塞）")

# 真实场景下一步会是 connect()，这里仅演示创建
# sock.connect(("127.0.0.1", 80))  # 真正连接需要目标服务器

sock.close()
print("  ③ sock.close() 关闭，释放资源")

# ------------------------------------------------------------
# 六、总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("本章小结")
print("=" * 60)
print("• 网络编程 = 让不同计算机的进程通信，核心 API 是 socket")
print("• OSI 七层 / TCP/IP 四层模型：分层解耦、复用、标准化")
print("• TCP 可靠字节流，UDP 轻量数据报，socket 主要在传输层")
print("• C/S 模型：服务器被动监听，客户端主动连接")
print("• Python socket 模块是对操作系统 socket API 的封装")
print("• 网络字节序用大端序，struct.pack('!I', ...) 处理")
`,
  },

  // ============================================================
  // 第二章：socket 模块基础
  // ============================================================
  {
    id: "py-net-socket",
    group: "网络基础",
    icon: "🔌",
    title: "socket 模块基础",
    content: `## 一、socket 到底是什么

socket（套接字）是操作系统提供的**网络通信端点 API**。你可以把它理解为一个"网络上的文件描述符"——读写本地文件用 \`open()\`，读写网络数据用 \`socket()\`。

本质上，socket 是一个**五元组**：

\`\`\`
{协议, 本地IP, 本地端口, 远程IP, 远程端口}
\`\`\`

- 对于 TCP 服务器：本地 IP+端口是 \`bind()\` 设定的，远程 IP+端口在 \`accept()\` 后获得。
- 对于 TCP 客户端：本地 IP+端口由系统自动分配，远程 IP+端口是 \`connect()\` 指定的。

在 Python 里，\`socket.socket\` 对象就是对操作系统 socket 文件描述符的封装。每个 socket 对象都有一个 \`fileno()\` 方法，返回底层的整数文件描述符。

### 1.1 一个生活类比

把 socket 想象成"电话系统"：

| socket 概念 | 电话类比 |
|-------------|----------|
| \`socket()\` | 买一部电话机 |
| \`bind()\` | 申请一个电话号码 |
| \`listen()\` | 把电话设为可接听状态 |
| \`accept()\` | 接听来电（会拿到对方号码） |
| \`connect()\` | 拨打对方号码 |
| \`send()\` / \`recv()\` | 说话 / 听话 |
| \`close()\` | 挂断 |

理解了这个类比，socket 的所有方法就都不难记了。

## 二、创建 socket：socket.socket()

创建 socket 的函数签名：

\`\`\`python
sock = socket.socket(family=AF_INET, type=SOCK_STREAM, proto=0)
\`\`\`

三个参数：

| 参数 | 含义 | 常用值 |
|------|------|--------|
| \`family\` | 地址族 | \`AF_INET\`（IPv4）、\`AF_INET6\`（IPv6）、\`AF_UNIX\`（本机进程间） |
| \`type\` | 套接字类型 | \`SOCK_STREAM\`（TCP）、\`SOCK_DGRAM\`（UDP）、\`SOCK_RAW\`（原始） |
| \`proto\` | 协议号 | 通常默认 0，系统自动选择 |

### 2.1 地址族（Address Family）

| 地址族 | 说明 | 使用场景 |
|--------|------|----------|
| \`AF_INET\` | IPv4 | **最常用**，本教程默认 |
| \`AF_INET6\` | IPv6 | 未来趋势，但兼容性需注意 |
| \`AF_UNIX\` | Unix 域套接字 | 同一台机器进程间通信，不走网络栈，速度快 |

\`AF_UNIX\` 特别值得一提：它不走 IP 协议栈，直接在内核缓冲区拷贝数据，所以**比 127.0.0.1 还快**。Docker、MySQL 本地连接常用它。

### 2.2 套接字类型（Socket Type）

| 类型 | 说明 | 对应协议 |
|------|------|----------|
| \`SOCK_STREAM\` | 面向连接、可靠、字节流 | TCP |
| \`SOCK_DGRAM\` | 无连接、不可靠、数据报 | UDP |
| \`SOCK_RAW\` | 原始套接字，可访问 IP/TCP 头部 | 需 root 权限 |

本教程第 1-7 章主要用 \`SOCK_STREAM\`（TCP），UDP 会在后续章节介绍。

## 三、socket 对象的常用方法

这是本章最重要的表格，建议收藏：

### 3.1 服务器端方法

| 方法 | 说明 |
|------|------|
| \`bind(address)\` | 绑定地址和端口，address 是 \`(host, port)\` 元组 |
| \`listen(backlog)\` | 开始监听，backlog 是等待连接队列的最大长度 |
| \`accept()\` | 接受连接（阻塞），返回 \`(conn, addr)\`，conn 是新 socket |

### 3.2 客户端方法

| 方法 | 说明 |
|------|------|
| \`connect(address)\` | 连接服务器，失败抛异常 |
| \`connect_ex(address)\` | 连接服务器，失败返回错误码（0 表示成功） |

### 3.3 通用收发方法

| 方法 | 说明 |
|------|------|
| \`send(data)\` | 发送数据，返回实际发送字节数（可能没发完） |
| \`sendall(data)\` | 发送全部数据，保证发完（推荐） |
| \`recv(bufsize)\` | 接收数据，返回 bytes，连接关闭返回 \`b''\` |
| \`sendto(data, addr)\` | UDP 发送（指定目标地址） |
| \`recvfrom(bufsize)\` | UDP 接收，返回 \`(data, addr)\` |
| \`close()\` | 关闭 socket |
| \`settimeout(seconds)\` | 设置超时，避免永久阻塞 |
| \`setsockopt(level, name, value)\` | 设置 socket 选项 |
| \`setblocking(flag)\` | 设置阻塞/非阻塞模式 |

### 3.4 信息查询方法

| 方法 | 说明 |
|------|------|
| \`getsockname()\` | 返回本端地址 \`(ip, port)\` |
| \`getpeername()\` | 返回对端地址 \`(ip, port)\`（需已连接） |
| \`fileno()\` | 返回文件描述符（整数） |

## 四、套接字的生命周期

### 4.1 TCP 服务器生命周期

\`\`\`text
socket()  →  bind()  →  listen()  →  accept()  →  recv()/send()  →  close()
 创建       绑定       监听        接受连接      收发数据          关闭
                        ↑                          ↑
                     backlog队列               conn 是新 socket
\`\`\`

注意：\`accept()\` 会返回一个**新的 socket 对象** \`conn\`，专门用来和这个客户端通信。原来的服务器 socket 继续监听新连接。这是初学者最容易困惑的点——**一个服务器会有很多 socket：一个监听 socket + 每个客户端一个 conn socket**。

### 4.2 TCP 客户端生命周期

\`\`\`text
socket()  →  connect()  →  send()/recv()  →  close()
 创建       连接服务器     收发数据          关闭
\`\`\`

客户端通常**不需要 \`bind()\`**——\`connect()\` 时系统会自动分配一个临时端口（ephemeral port，范围 49152-65535）。

## 五、SO_REUSEADDR 选项详解

这是 TCP 服务器**必加**的选项，否则你会频繁遇到 \`Address already in use\` 错误。

\`\`\`python
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
\`\`\`

### 5.1 为什么会有这个错误

TCP 连接主动关闭方会进入 **TIME_WAIT** 状态，持续 2*MSL（通常 60-120 秒）。在这段时间内，那个端口仍被占用，重新 \`bind()\` 同一端口会失败。

\`\`\`text
主动关闭方状态变化：
ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT (持续 60-120s) → CLOSED
\`\`\`

### 5.2 SO_REUSEADDR 的作用

设置 \`SO_REUSEADDR\` 后，允许 socket 绑定一个仍在 TIME_WAIT 状态的端口。这样服务器重启时能立刻绑定端口，不用等 TIME_WAIT 结束。

> **工程实践**：每个 TCP 服务器在 \`bind()\` 之前都应加上这一行。这是"肌肉记忆"级别的最佳实践。

### 5.3 backlog 参数

\`listen(backlog)\` 的 backlog 是**未完成连接队列 + 已完成连接队列的总长度上限**。当队列满时，新连接会被拒绝或忽略。

- Linux 5.4+ 默认最大 4096（\`/proc/sys/net/core/somaxconn\`）。
- 高并发服务器通常设 128 或更大：\`listen(128)\`。
- 本教程 demo 用 \`listen(1)\` 或 \`listen(5)\` 即可。

## 六、settimeout：防止永久阻塞

socket 默认是**阻塞模式**：\`accept()\`、\`recv()\`、\`connect()\` 会一直等到有结果才返回。如果对端永不响应，你的程序就卡死了。

\`\`\`python
sock.settimeout(1.0)  # 1 秒超时
\`\`\`

设置后，所有阻塞操作超过 1 秒就抛 \`socket.timeout\` 异常（Python 3.10+ 是 \`TimeoutError\`）。这是网络编程必备的防御性编程手段。

> **本教程所有 demo** 都会 \`settimeout(1.0)\`，因为沙箱有 5 秒执行限制，绝不能让 socket 永久阻塞。

## 七、本章 demo 预告

下面的代码会演示：
- 创建 TCP socket 和 UDP socket，对比类型
- socket 的创建、绑定到 \`127.0.0.1:0\`、获取实际端口、关闭
- \`setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)\`
- \`getsockname()\` 在 bind 前后的区别
- \`settimeout(1.0)\` 后 accept 不阻塞而是抛 timeout 异常
- 查看 socket 的 \`fileno()\``,
    code: `# ============================================================
# 第二章代码演示：socket 模块基础
# ------------------------------------------------------------
# 演示内容：
#   1. 创建 TCP / UDP socket，对比类型
#   2. socket 的创建、绑定、获取端口、关闭全流程
#   3. setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
#   4. getsockname() 在 bind 前后的区别
#   5. settimeout(1.0) 后 accept 抛 timeout 异常
#   6. 查看 socket 的 fileno()
# ============================================================
import socket
import threading
import time

print("=" * 60)
print("socket 模块基础演示")
print("=" * 60)

# ------------------------------------------------------------
# 一、创建 TCP 和 UDP socket，对比类型
# ------------------------------------------------------------
print("\\n[1] 创建 TCP / UDP socket，对比类型")
print("-" * 60)

# TCP socket：AF_INET（IPv4）+ SOCK_STREAM（流式 = TCP）
tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# UDP socket：AF_INET（IPv4）+ SOCK_DGRAM（数据报 = UDP）
udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

print(f"  TCP socket: family={tcp_sock.family}, type={tcp_sock.type}")
print(f"  UDP socket: family={udp_sock.family}, type={udp_sock.type}")
print(f"  SOCK_STREAM = {socket.SOCK_STREAM}, SOCK_DGRAM = {socket.SOCK_DGRAM}")
print(f"  TCP 是 SOCK_STREAM? {tcp_sock.type == socket.SOCK_STREAM}")
print(f"  UDP 是 SOCK_DGRAM?  {udp_sock.type == socket.SOCK_DGRAM}")

# 查看文件描述符：每个 socket 在操作系统层面是一个整数 fd
print(f"  TCP socket fileno() = {tcp_sock.fileno()}")
print(f"  UDP socket fileno() = {udp_sock.fileno()}")

tcp_sock.close()
udp_sock.close()
print("  两个 socket 已 close()")

# ------------------------------------------------------------
# 二、socket 创建 → 绑定 → 获取端口 → 关闭 全流程
# ------------------------------------------------------------
print("\\n[2] socket 绑定到 127.0.0.1:0（端口 0 = 系统自动分配）")
print("-" * 60)

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# SO_REUSEADDR：允许重用处于 TIME_WAIT 状态的端口（服务器必加）
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
print("  setsockopt(SOL_SOCKET, SO_REUSEADDR, 1) 已设置")

# bind 前调用 getsockname 会报错（还没绑定地址）
try:
    sock.getsockname()
except OSError as e:
    print(f"  bind 前 getsockname(): 抛异常 {e}")

# 绑定到 127.0.0.1:0，端口 0 让操作系统自动分配可用端口
sock.bind(("127.0.0.1", 0))
print("  bind(('127.0.0.1', 0)) 完成")

# bind 后 getsockname 返回实际分配的端口
host, port = sock.getsockname()
print(f"  bind 后 getsockname() = ({host!r}, {port})")
print(f"  → 系统分配的实际端口是 {port}")

# listen：开始监听，backlog=1 表示等待队列最多 1 个
sock.listen(1)
print("  listen(1) 完成，socket 进入监听状态")

sock.close()
print("  close() 完成")

# ------------------------------------------------------------
# 三、settimeout 后 accept 不再永久阻塞
# ------------------------------------------------------------
print("\\n[3] settimeout(0.5) 后 accept 抛 timeout 异常")
print("-" * 60)

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 0))
server.listen(1)
srv_port = server.getsockname()[1]
print(f"  服务器已监听 127.0.0.1:{srv_port}")

# 设置 0.5 秒超时：accept 最多等 0.5 秒，没有连接就抛异常
server.settimeout(0.5)
print("  server.settimeout(0.5) 已设置")

try:
    # 没有客户端连接，accept 会在 0.5 秒后超时
    conn, addr = server.accept()
    print(f"  accept() 返回：{addr}")
except (socket.timeout, TimeoutError) as e:
    # Python 3.10+ socket.timeout 是 TimeoutError 的别名
    print(f"  accept() 超时！抛出异常类型: {type(e).__name__}")
    print("  → settimeout 让阻塞操作不会永久卡住，超时后抛异常")

server.close()
print("  server.close() 完成")

# ------------------------------------------------------------
# 四、完整的 TCP socket 生命周期（服务器 + 客户端在同一进程）
# ------------------------------------------------------------
print("\\n[4] 完整 TCP 生命周期：bind → listen → accept → recv/send → close")
print("-" * 60)

# 创建服务器 socket
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(("127.0.0.1", 0))
srv.listen(1)
srv.settimeout(2.0)  # 防止 accept 永久阻塞
port = srv.getsockname()[1]
print(f"  [server] bind+listen 完成，端口={port}")

# 用线程运行服务器端的 accept 逻辑
def server_task():
    conn, addr = srv.accept()           # 接受连接，返回新 socket
    print(f"  [server] accept() 返回，客户端地址={addr}")
    print(f"  [server] 新 conn 的 fileno={conn.fileno()}（与监听 socket 不同）")
    data = conn.recv(1024)              # 接收数据
    print(f"  [server] recv() 收到: {data!r}")
    conn.sendall(b"ECHO:" + data)       # 回发
    print(f"  [server] sendall() 回显完成")
    conn.close()                        # 关闭连接 socket
    print(f"  [server] conn.close() 完成")

t = threading.Thread(target=server_task, daemon=True)
t.start()
time.sleep(0.1)  # 等服务器先进入 accept

# 主线程做客户端
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.settimeout(2.0)
print(f"  [client] connect() 连接 127.0.0.1:{port}")
client.connect(("127.0.0.1", port))
print(f"  [client] 连接成功，本地地址={client.getsockname()}")
print(f"  [client] 对端地址 getpeername()={client.getpeername()}")
client.sendall(b"hello-socket")
print(f"  [client] sendall(b'hello-socket')")
reply = client.recv(1024)
print(f"  [client] recv() 收到: {reply!r}")
client.close()
print(f"  [client] close() 完成")

t.join(timeout=2)
srv.close()
print("  [server] 监听 socket 也 close()")

# ------------------------------------------------------------
# 五、总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("本章小结")
print("=" * 60)
print("• socket() 创建套接字：AF_INET(IPv4) + SOCK_STREAM(TCP) 最常用")
print("• 服务器流程：socket→bind→listen→accept→recv/send→close")
print("• accept 返回新 socket conn，原 socket 继续监听")
print("• SO_REUSEADDR 必加：避免 TIME_WAIT 导致 Address already in use")
print("• settimeout() 必加：防止 accept/recv 永久阻塞")
print("• 客户端通常不 bind，connect 时系统自动分配临时端口")
`,
  },

  // ============================================================
  // 第三章：地址与端口
  // ============================================================
  {
    id: "py-net-address",
    group: "网络基础",
    icon: "📮",
    title: "地址与端口",
    content: `## 一、IP 地址：网络上的门牌号

IP 地址是互联网上主机的唯一标识。要让数据从 A 送到 B，必须知道 B 的 IP 地址。

### 1.1 IPv4

IPv4 是 32 位地址，通常写成 4 个十进制数，用点分隔：

\`\`\`
192.168.1.100    →  192.168.1.100
每个数 0-255（1 字节），共 4 字节
\`\`\`

IPv4 总共约 43 亿个地址，早已不够用，所以有了 NAT（网络地址转换）和 IPv6。

### 1.2 IPv6

IPv6 是 128 位地址，写成 8 组十六进制数，用冒号分隔：

\`\`\`
2001:0db8:85a3:0000:0000:8a2e:0370:7334
可简写为：2001:db8:85a3::8a2e:370:7334（连续的 0 用 :: 简写）
\`\`\`

IPv6 地址多到"地球每粒沙子都能分一个"，但普及速度慢，目前大多数网络编程仍以 IPv4 为主。

### 1.3 特殊 IP 地址

| 地址 | 含义 | 用途 |
|------|------|------|
| \`127.0.0.1\` | 回环地址（loopback） | 本机内部通信，**本教程所有 demo 都用它** |
| \`0.0.0.0\` | 所有接口 | 服务器 bind 时表示监听所有网卡 |
| \`255.255.255.255\` | 广播地址 | 发给同一子网所有主机 |
| \`10.0.0.0/8\` | 私有地址 | 内网（企业） |
| \`192.168.0.0/16\` | 私有地址 | 内网（家庭路由器常用） |
| \`172.16.0.0/12\` | 私有地址 | 内网 |
| \`::1\` | IPv6 回环 | IPv6 的 127.0.0.1 |

> **本教程关键**：所有网络 demo 都用 \`127.0.0.1\`，因为：
> 1. 不需要真实网络，单机就能跑
> 2. 不会被防火墙拦截
> 3. 速度最快（不经过网卡）
> 4. 沙箱环境通常禁止外网访问

### 1.4 服务器 bind 时 host 的三种写法

\`\`\`python
server.bind(('127.0.0.1', 8080))  # 只监听本机回环，外部访问不了
server.bind(('0.0.0.0', 8080))    # 监听所有网卡，外部可访问
server.bind(('', 8080))           # 等价于 0.0.0.0（空字符串）
\`\`\`

开发本地服务用 \`127.0.0.1\`（安全），部署生产服务用 \`0.0.0.0\`（对外可访问）。

## 二、端口：进程的门牌号

一台主机上同时跑着浏览器、微信、MySQL、SSH……IP 只能把数据送到这台主机，但该交给哪个进程？靠**端口号**区分。

### 2.1 端口范围

端口是 16 位整数，范围 0-65535，分三段：

| 范围 | 名称 | 说明 |
|------|------|------|
| 0-1023 | 知名端口（Well-known） | HTTP 80、HTTPS 443、SSH 22 等，Unix 下需 root 才能绑定 |
| 1024-49151 | 注册端口（Registered） | MySQL 3306、Redis 6379、PostgreSQL 5432 等 |
| 49152-65535 | 动态/临时端口（Ephemeral） | 客户端 connect 时系统自动分配 |

### 2.2 常见知名端口

| 端口 | 协议 | 说明 |
|------|------|------|
| 20、21 | FTP | 文件传输（21 控制连接，20 数据连接） |
| 22 | SSH | 加密远程登录 |
| 25 | SMTP | 发送邮件 |
| 53 | DNS | 域名解析 |
| 80 | HTTP | 网页 |
| 443 | HTTPS | 加密网页 |
| 3306 | MySQL | 数据库 |
| 6379 | Redis | 缓存 |
| 8080 | HTTP 备用 | 常用于开发服务器 |

### 2.3 为什么客户端通常不 bind 端口

客户端 \`connect()\` 时，操作系统会自动从 49152-65535 中挑一个空闲端口分配。如果你手动 \`bind()\` 一个固定端口，反而容易冲突。所以**客户端让系统自动分配就好**。

## 三、DNS：域名系统

人记 IP 地址太痛苦（\`93.184.216.34\` 谁记得住？），所以有了 DNS（Domain Name System），把域名解析成 IP：

\`\`\`
www.example.com  →  DNS 查询  →  93.184.216.34
\`\`\`

Python \`socket\` 模块提供了几个 DNS 解析函数。

### 3.1 gethostbyname：域名 → IPv4

\`\`\`python
ip = socket.gethostbyname('www.example.com')
# 返回字符串 '93.184.216.34'
\`\`\`

简单，但只返回一个 IPv4，且不支持指定端口和协议类型。

### 3.2 getaddrinfo：综合解析（推荐）

\`\`\`python
infos = socket.getaddrinfo(host, port, family=0, type=0)
# 返回列表，每项：(family, type, proto, canonname, sockaddr)
\`\`\`

\`getaddrinfo\` 是**最推荐**的解析函数，因为：
1. 同时支持 IPv4 和 IPv6
2. 返回所有可用地址（一个域名可能对应多个 IP，做负载均衡）
3. 能根据你要的 family/type 过滤
4. 直接返回可用于 \`socket()\` 和 \`connect()\` 的参数

\`\`\`python
# 用法示例
infos = socket.getaddrinfo('localhost', 80, socket.AF_INET, socket.SOCK_STREAM)
for family, stype, proto, canon, sockaddr in infos:
    sock = socket.socket(family, stype, proto)
    sock.connect(sockaddr)  # sockaddr 就是 (ip, port)
    break
\`\`\`

### 3.3 getfqdn：完整域名

\`\`\`python
socket.getfqdn()  # 返回本机的完整域名（Fully Qualified Domain Name）
\`\`\`

## 四、IP 地址与字节串的转换

网络传输时，IP 地址是 4 字节（IPv4）或 16 字节（IPv6）的二进制串，而不是字符串。Python 提供了转换函数：

### 4.1 inet_aton / inet_ntoa（仅 IPv4）

\`\`\`python
# 字符串 IP → 4 字节字节串
b = socket.inet_aton('192.168.1.1')   # b'\\xc0\\xa8\\x01\\x01'
# 4 字节字节串 → 字符串 IP
s = socket.inet_ntoa(b)               # '192.168.1.1'
\`\`\`

### 4.2 inet_pton / inet_ntop（支持 IPv6，推荐）

\`\`\`python
# pton = presentation to network（字符串 → 字节串）
b = socket.inet_pton(socket.AF_INET, '192.168.1.1')
b6 = socket.inet_pton(socket.AF_INET6, '2001:db8::1')
# ntop = network to presentation（字节串 → 字符串）
s = socket.inet_ntop(socket.AF_INET, b)
s6 = socket.inet_ntop(socket.AF_INET6, b6)
\`\`\`

\`inet_pton\`/\`inet_ntop\` 名字怪但功能强：\`p\` = presentation（点分字符串），\`n\` = network（二进制字节串）。

## 五、网络字节序

不同 CPU 存储多字节数据的顺序不同：

- **大端序（Big-endian）**：高位字节存低地址。网络协议规定用大端序。
- **小端序（Little-endian）**：高位字节存高地址。x86、ARM（默认）用小端序。

\`\`\`text
数字 0x12345678 在内存中：
大端序：12 34 56 78  ← 网络字节序
小端序：78 56 34 12  ← x86 本机字节序
\`\`\`

网络传输多字节整数（端口号、长度前缀）时**必须转成大端序**，否则不同架构的机器无法互通。

### 5.1 用 struct 处理字节序

\`\`\`python
import struct

# '!' 前缀 = 网络字节序（大端序）
# 'H' = 2 字节无符号整数（端口号）
# 'I' = 4 字节无符号整数
packed = struct.pack('!H', 8080)        # 端口转成 2 字节大端序
port = struct.unpack('!H', packed)[0]   # 解包还原

# 发送长度前缀的常见模式
length = struct.pack('!I', len(data))   # 4 字节长度前缀
sock.sendall(length + data)
\`\`\`

> **记忆**：凡是网络传输多字节整数，\`struct.pack\` 一定要加 \`!\` 前缀。这是跨平台互通的关键。

## 六、本章 demo 预告

下面的代码会演示：
- 用 \`gethostbyname\` 解析 \`localhost\` 和 \`127.0.0.1\`
- 用 \`getaddrinfo\` 解析 \`localhost:80\`，打印所有结果
- 用 \`inet_aton\`/\`inet_ntoa\` 演示 IP 字符串与字节串互转
- 用 \`struct.pack('!I', ...)\` 演示网络字节序
- 演示端口范围和知名端口列表
- 解析 IPv6 地址 \`::1\``,
    code: `# ============================================================
# 第三章代码演示：地址与端口
# ------------------------------------------------------------
# 演示内容：
#   1. gethostbyname 解析 localhost 和 127.0.0.1
#   2. getaddrinfo 综合解析 localhost:80
#   3. inet_aton / inet_ntoa IP 字符串与字节串互转
#   4. struct.pack('!I', ...) 网络字节序
#   5. 端口范围与知名端口列表
#   6. 解析 IPv6 地址 ::1
# ============================================================
import socket
import struct

print("=" * 60)
print("地址与端口演示")
print("=" * 60)

# ------------------------------------------------------------
# 一、gethostbyname：域名 → IPv4
# ------------------------------------------------------------
print("\\n[1] gethostbyname：域名 → IPv4")
print("-" * 60)

# 解析 localhost（通常返回 127.0.0.1）
for host in ["localhost", "127.0.0.1"]:
    try:
        ip = socket.gethostbyname(host)
        print(f"  gethostbyname({host!r}) = {ip}")
    except socket.gaierror as e:
        print(f"  gethostbyname({host!r}) 失败: {e}")

# 获取本机完整域名
fqdn = socket.getfqdn()
print(f"  本机 FQDN（完整域名）: {fqdn!r}")

# ------------------------------------------------------------
# 二、getaddrinfo：综合解析（推荐方式）
# ------------------------------------------------------------
print("\\n[2] getaddrinfo：综合解析 localhost 端口 80")
print("-" * 60)

# getaddrinfo 返回 (family, type, proto, canonname, sockaddr) 列表
# 可以指定 family/type 过滤，这里不指定，看全部结果
infos = socket.getaddrinfo("localhost", 80)
print(f"  共返回 {len(infos)} 条结果：")
for i, (family, stype, proto, canon, sockaddr) in enumerate(infos):
    fam = "AF_INET" if family == socket.AF_INET else "AF_INET6" if family == socket.AF_INET6 else str(family)
    typ = "SOCK_STREAM" if stype == socket.SOCK_STREAM else "SOCK_DGRAM" if stype == socket.SOCK_DGRAM else str(stype)
    print(f"  [{i}] family={fam}, type={typ}, proto={proto}, sockaddr={sockaddr}")

# 实际用法：用 getaddrinfo 的结果直接创建 socket
print("\\n  用 getaddrinfo 结果创建 socket：")
for family, stype, proto, canon, sockaddr in infos:
    if family == socket.AF_INET and stype == socket.SOCK_STREAM:
        print(f"    选中: family={family}, type={stype}, sockaddr={sockaddr}")
        print(f"    → sockaddr 可直接传给 connect(): {sockaddr}")
        break

# ------------------------------------------------------------
# 三、inet_aton / inet_ntoa：IP 字符串与字节串互转（仅 IPv4）
# ------------------------------------------------------------
print("\\n[3] inet_aton / inet_ntoa：IP 字符串 ↔ 字节串")
print("-" * 60)

ips = ["127.0.0.1", "192.168.1.100", "10.0.0.1", "255.255.255.255"]
for ip_str in ips:
    # aton = ASCII to network：字符串 → 4 字节字节串
    ip_bytes = socket.inet_aton(ip_str)
    # ntoa = network to ASCII：4 字节字节串 → 字符串
    ip_back = socket.inet_ntoa(ip_bytes)
    print(f"  {ip_str:18s} → 字节串 {ip_bytes} (hex={ip_bytes.hex()}) → {ip_back}")

# ------------------------------------------------------------
# 四、inet_pton / inet_ntop：支持 IPv6（推荐）
# ------------------------------------------------------------
print("\\n[4] inet_pton / inet_ntop：支持 IPv4 和 IPv6")
print("-" * 60)

# IPv4 转换
for ip_str in ["127.0.0.1", "0.0.0.0"]:
    b = socket.inet_pton(socket.AF_INET, ip_str)
    s = socket.inet_ntop(socket.AF_INET, b)
    print(f"  IPv4 {ip_str:15s} → {b.hex()} → {s}")

# IPv6 转换
ipv6_addrs = ["::1", "2001:db8::1", "fe80::1"]
for ip_str in ipv6_addrs:
    try:
        b = socket.inet_pton(socket.AF_INET6, ip_str)
        s = socket.inet_ntop(socket.AF_INET6, b)
        print(f"  IPv6 {ip_str:15s} → {b.hex()} → {s}")
    except OSError as e:
        print(f"  IPv6 {ip_str:15s} 不支持: {e}")

# ------------------------------------------------------------
# 五、网络字节序（大端序）演示
# ------------------------------------------------------------
print("\\n[5] 网络字节序（大端序）")
print("-" * 60)

# 端口号用 2 字节无符号整数传输（!H）
ports = [80, 443, 8080, 65535]
print("  端口号的网络字节序（!H = 2 字节大端序）：")
for p in ports:
    packed = struct.pack('!H', p)
    print(f"    端口 {p:5d} → 字节 {packed.hex()} → 还原 {struct.unpack('!H', packed)[0]}")

# 4 字节整数对比大端序 vs 小端序
num = 0x12345678
big_endian = struct.pack('!I', num)     # ! = 网络字节序（大端）
little_endian = struct.pack('<I', num)  # < = 小端序（x86 本机）
host_endian = struct.pack('I', num)     # 无前缀 = 本机字节序
print(f"\\n  数字 0x{num:08X}：")
print(f"    大端序（网络）!I: {big_endian.hex()}    ← 高位 12 在前")
print(f"    小端序        <I: {little_endian.hex()}    ← 低位 78 在前")
print(f"    本机序         I: {host_endian.hex()}    ← x86 是小端")
print("    → 网络传输必须用 ! 前缀保证大端序，跨平台才能互通")

# ------------------------------------------------------------
# 六、端口范围与知名端口
# ------------------------------------------------------------
print("\\n[6] 端口范围与知名端口")
print("-" * 60)

print("  端口范围（16 位整数 0-65535）：")
print(f"    知名端口   0 - 1023    （需 root 权限绑定）")
print(f"    注册端口   1024 - 49151 （应用注册）")
print(f"    动态端口   49152 - 65535（客户端临时分配）")

well_known = {
    21: "FTP（文件传输）",
    22: "SSH（远程登录）",
    25: "SMTP（发送邮件）",
    53: "DNS（域名解析）",
    80: "HTTP（网页）",
    443: "HTTPS（加密网页）",
    3306: "MySQL（数据库）",
    6379: "Redis（缓存）",
    8080: "HTTP 备用（开发常用）",
}
print("\\n  常见知名端口：")
for port, name in well_known.items():
    print(f"    {port:5d}  {name}")

# 验证端口范围
print(f"\\n  端口最大值 65535 = 0x{65535:04X} = 2^16 - 1")
print(f"  端口 0 的特殊含义：bind 时让系统自动分配可用端口")

# ------------------------------------------------------------
# 七、总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("本章小结")
print("=" * 60)
print("• IP 地址定位主机，端口定位进程；127.0.0.1 是回环地址（本教程全用它）")
print("• 端口 0-1023 知名，1024-49151 注册，49152-65535 临时")
print("• getaddrinfo 是最推荐的 DNS 解析函数，支持 IPv4/IPv6 过滤")
print("• inet_pton/inet_ntop 比 inet_aton/inet_ntoa 更通用（支持 IPv6）")
print("• 网络字节序是大端序，struct.pack 加 '!' 前缀保证跨平台")
print("• 客户端通常不 bind 端口，connect 时系统自动分配临时端口")
`,
  },

  // ============================================================
  // 第四章：TCP 服务器
  // ============================================================
  {
    id: "py-tcp-server",
    group: "TCP 编程",
    icon: "🖥️",
    title: "TCP 服务器",
    content: `## 一、TCP 服务器的工作流程

写一个 TCP 服务器，核心是六步，顺序固定：

\`\`\`text
┌─────────────────────────────────────────────────────────┐
│  1. socket()   创建套接字                                │
│  2. bind()     绑定地址和端口 (host, port)               │
│  3. listen()   开始监听，等待客户端连接                   │
│  4. accept()   接受连接（阻塞），返回新 socket conn       │
│  5. recv()/send()  与客户端收发数据                       │
│  6. close()    关闭连接                                  │
└─────────────────────────────────────────────────────────┘
\`\`\`

下面逐步讲解每一步。

### 1.1 第一步：socket() 创建套接字

\`\`\`python
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
\`\`\`

\`AF_INET\`（IPv4）+ \`SOCK_STREAM\`（TCP）是最常用的组合。

### 1.2 第二步：bind() 绑定地址

\`\`\`python
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # 必加！
server.bind(('127.0.0.1', 8080))
\`\`\`

\`bind()\` 的参数是一个元组 \`(host, port)\`：
- \`host='127.0.0.1'\`：只监听本机回环，外部访问不了（开发用，安全）
- \`host='0.0.0.0'\` 或 \`''\`：监听所有网卡，外部可访问（部署用）
- \`port=8080\`：固定端口；\`port=0\` 让系统自动分配（demo 用，避免冲突）

> **重要**：\`bind()\` 之前一定要 \`setsockopt(SO_REUSEADDR, 1)\`，否则重启服务器会报 \`Address already in use\`。

### 1.3 第三步：listen() 开始监听

\`\`\`python
server.listen(5)
\`\`\`

\`listen(backlog)\` 把 socket 标记为"被动监听"状态，\`backlog\` 是等待队列长度。之后客户端的 \`connect()\` 就能连上来了。

\`backlog\` 不是"最大连接数"，而是"还没被 \`accept()\` 取走的连接队列长度"。队列满了，新连接会被拒绝。

### 1.4 第四步：accept() 接受连接

\`\`\`python
conn, addr = server.accept()  # 阻塞，直到有客户端连接
\`\`\`

\`accept()\` 会**阻塞**（一直等），直到有客户端连接进来。它返回两个值：
- \`conn\`：一个新的 socket 对象，专门用来和这个客户端通信
- \`addr\`：客户端地址 \`(ip, port)\`

> **关键理解**：\`accept()\` 返回的 \`conn\` 是新 socket，原 \`server\` socket 继续监听。所以一个服务器同时有：1 个监听 socket + N 个连接 socket（每个客户端一个）。

### 1.5 第五步：recv() / send() 收发数据

\`\`\`python
data = conn.recv(1024)   # 接收，最多读 1024 字节
conn.sendall(data)       # 发送全部数据
\`\`\`

### 1.6 第六步：close() 关闭

\`\`\`python
conn.close()    # 关闭与客户端的连接
server.close()  # 关闭监听 socket（不再接受新连接）
\`\`\`

## 二、bind() 详解

\`bind()\` 最容易踩的坑是地址格式。不同地址族的 \`bind()\` 参数不同：

\`\`\`python
# AF_INET（IPv4）：(host, port) 二元组
sock.bind(('127.0.0.1', 8080))

# AF_INET6（IPv6）：(host, port, flowinfo, scope_id) 四元组
sock.bind(('::1', 8080, 0, 0))

# AF_UNIX（Unix 域）：文件路径字符串
sock.bind('/tmp/mysocket.sock')
\`\`\`

### 2.1 端口冲突

如果端口已被占用，\`bind()\` 会抛 \`OSError: [Errno 48] Address already in use\`。解决办法：
1. 加 \`SO_REUSEADDR\`（见上文）
2. 换一个端口
3. 用 \`port=0\` 让系统分配（本教程 demo 都这么做）

### 2.2 用 port=0 让系统分配端口

\`\`\`python
server.bind(('127.0.0.1', 0))         # 端口 0 = 系统分配
port = server.getsockname()[1]        # 获取实际分配的端口
print(f'服务器监听端口: {port}')
\`\`\`

这是 demo 的最佳实践：永远不会端口冲突。

## 三、accept() 与新 socket

\`accept()\` 是 TCP 服务器最核心的方法。理解它的关键：

\`\`\`text
                    ┌──────────────────────┐
客户端 A ──connect──→│  server (监听 socket) │
                    │   accept() 取出连接   │
客户端 B ──connect──→│   返回 conn_A, conn_B │
                    └──────────────────────┘
\`\`\`

每个 \`accept()\` 返回的 \`conn\` 是独立的 socket，有自己的五元组（本地 IP:port + 客户端 IP:port）。服务器通过不同的 \`conn\` 区分不同客户端。

\`\`\`python
while True:   # 实际 demo 不会用 while True，这里示意
    conn, addr = server.accept()
    print(f'新客户端: {addr}')
    # 处理 conn ...
    conn.close()
\`\`\`

## 四、recv() 的行为

\`recv(bufsize)\` 是初学者最容易误解的方法：

1. **返回 bytes**：\`recv(1024)\` 表示**最多**读 1024 字节，实际可能更少。
2. **返回 \`b''\`**：表示对端关闭了连接（重要！这是检测断开的信号）。
3. **阻塞**：默认会一直等到有数据才返回（设了 \`settimeout\` 会超时）。

\`\`\`python
data = conn.recv(1024)
if not data:          # b'' 表示对端关闭
    print('客户端断开')
    break
print(f'收到: {data}')
\`\`\`

### 4.1 bufsize 不是"期望长度"

\`recv(1024)\` 不是"必须读满 1024 字节才返回"，而是"最多读 1024 字节"。对方发 10 字节，\`recv(1024)\` 可能只返回这 10 字节。所以**不能用 \`recv\` 的返回长度判断消息边界**。

## 五、send() vs sendall()

| 方法 | 行为 | 返回值 | 推荐 |
|------|------|--------|------|
| \`send(data)\` | 可能只发送一部分 | 实际发送字节数 | 需自己循环补发 |
| \`sendall(data)\` | 保证全部发完 | None（成功）或抛异常 | **推荐** |

\`send()\` 在内核发送缓冲区满时可能只发一部分，你需要自己循环：

\`\`\`python
# send 的正确用法（要自己循环）
total = 0
while total < len(data):
    sent = sock.send(data[total:])
    total += sent
\`\`\`

而 \`sendall()\` 帮你做了这个循环，**绝大多数情况用 \`sendall()\`**。

## 六、TCP 的字节流特性

TCP 是**字节流**，不是"消息流"——它没有消息边界。这意味着：

\`\`\`text
发送方：send("hello")  send("world")
接收方：recv() 可能收到 "helloworld"（粘包）
        也可能收到 "hel" "loworld"（拆包）
\`\`\`

TCP 只保证字节顺序和可靠性，**不保证一次 \`send\` 对应一次 \`recv\`**。这是第 6 章（echo 实战）要重点解决的问题。

解决粘包/拆包的三种方案：
1. **固定长度**：每条消息固定 N 字节，不够补齐。
2. **分隔符**：用 \`\\n\` 或特殊字节分隔。
3. **长度前缀**（最常用）：先发 4 字节长度，再发内容。第 6 章详细讲。

## 七、最简 TCP echo 服务器完整代码

\`\`\`python
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('127.0.0.1', 0))
server.listen(1)
port = server.getsockname()[1]
print(f'服务器监听端口: {port}')

conn, addr = server.accept()
print(f'客户端连接: {addr}')
data = conn.recv(1024)
conn.sendall(b'ECHO:' + data)
conn.close()
server.close()
\`\`\`

> 注意：这只是一个连接就退出。真正的服务器会循环 \`accept\`。本教程的 demo 为了在 5 秒内跑完，都只处理一次连接。

## 八、本章 demo 预告

下面的代码会演示：
- 完整的 TCP echo 服务器（单次接受一个连接）
- 用 threading 在子线程运行服务器，主线程做客户端测试
- 服务器 bind 到 \`127.0.0.1:0\`，打印实际端口
- 客户端 connect 后 send 一条消息，recv 回显
- 演示 \`recv\` 返回 \`b''\` 表示连接关闭
- 演示 \`sendall\` vs \`send\``,
    code: `# ============================================================
# 第四章代码演示：TCP 服务器
# ------------------------------------------------------------
# 演示内容：
#   1. 完整的 TCP echo 服务器（单次接受一个连接）
#   2. threading 子线程跑服务器，主线程做客户端测试
#   3. bind 到 127.0.0.1:0，打印实际端口
#   4. 客户端 connect → send → recv 回显
#   5. 演示 recv 返回 b'' 表示连接关闭
#   6. 演示 sendall vs send 的区别
# ============================================================
import socket
import threading
import time

print("=" * 60)
print("TCP 服务器演示")
print("=" * 60)

# ------------------------------------------------------------
# 一、完整的 TCP echo 服务器（单次连接）
# ------------------------------------------------------------
print("\\n[1] 完整 TCP echo 服务器 + 客户端测试")
print("-" * 60)

# ===== 服务器端 =====
def run_echo_server(result, port_holder):
    # 第 1 步：创建 socket
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # SO_REUSEADDR：避免 Address already in use（服务器必加）
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # 第 2 步：bind 到 127.0.0.1:0（端口 0 = 系统自动分配）
    srv.bind(("127.0.0.1", 0))
    # 第 3 步：listen，backlog=1
    srv.listen(1)
    # 把实际端口传给主线程
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(2.0)  # 防止 accept 永久阻塞
    print(f"  [server] socket→bind→listen 完成，端口={port_holder[0]}")

    try:
        # 第 4 步：accept 接受连接（阻塞，直到客户端 connect）
        conn, addr = srv.accept()
        print(f"  [server] accept() 返回 conn, 客户端={addr}")
        print(f"  [server] 监听 socket fileno={srv.fileno()}, conn fileno={conn.fileno()}")

        # 第 5 步：recv 接收数据
        data = conn.recv(1024)
        print(f"  [server] recv() 收到: {data!r}")
        # sendall 回发（echo）
        conn.sendall(b"ECHO:" + data)
        print(f"  [server] sendall() 回显: {b'ECHO:'+data!r}")

        # 再 recv 一次：客户端关闭后返回 b''
        rest = conn.recv(1024)
        print(f"  [server] 再次 recv() 返回: {rest!r}（b'' 表示对端关闭）")

        # 第 6 步：close
        conn.close()
        print(f"  [server] conn.close() 完成")
    except socket.timeout:
        print("  [server] accept 超时")
    finally:
        srv.close()
        print(f"  [server] 监听 socket close() 完成")
    result.append("done")

# 用列表传端口（线程间共享简单方式）
port_holder = []
result = []
t = threading.Thread(target=run_echo_server, args=(result, port_holder), daemon=True)
t.start()
time.sleep(0.2)  # 等服务器进入 accept

# ===== 客户端（主线程） =====
port = port_holder[0]
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.settimeout(2.0)
print(f"\\n  [client] connect 127.0.0.1:{port}")
client.connect(("127.0.0.1", port))
print(f"  [client] 连接成功，本地地址={client.getsockname()}")

# 发送数据
client.sendall(b"Hello, TCP Server!")
print(f"  [client] sendall(b'Hello, TCP Server!')")

# 接收回显
reply = client.recv(1024)
print(f"  [client] recv() 收到回显: {reply!r}")

# 主动关闭，触发服务器 recv 返回 b''
client.close()
print(f"  [client] close()（触发服务器 recv 返回 b''）")

t.join(timeout=2)

# ------------------------------------------------------------
# 二、sendall vs send 的区别
# ------------------------------------------------------------
print("\\n[2] sendall vs send 的区别")
print("-" * 60)

def echo_server2(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(2.0)
    conn, addr = srv.accept()
    # 收完所有数据再回显
    data = b""
    while True:
        chunk = conn.recv(1024)
        if not chunk:
            break
        data += chunk
    conn.sendall(b"RECEIVED:" + data)
    conn.close()
    srv.close()

port_holder2 = []
threading.Thread(target=echo_server2, args=(port_holder2,), daemon=True).start()
time.sleep(0.2)

client2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client2.settimeout(2.0)
client2.connect(("127.0.0.1", port_holder2[0]))

# send：返回实际发送字节数（可能没发完）
# 这里数据短，通常一次就发完，但语义上 send 不保证
sent = client2.send(b"ABC")
print(f"  send(b'ABC') 返回: {sent}（实际发送字节数）")

# sendall：保证全部发完，返回 None
ret = client2.sendall(b"DEF")
print(f"  sendall(b'DEF') 返回: {ret}（None 表示全部发送成功）")

# shutdown(SHUT_WR) 告诉服务器：我发完了，不再写
client2.shutdown(socket.SHUT_WR)
print(f"  shutdown(SHUT_WR) 通知服务器发送完毕")

# 还能接收服务器回显
reply = client2.recv(1024)
print(f"  recv() 收到: {reply!r}（服务器收到了全部数据 ABCDEF）")
client2.close()

print("\\n  → send 可能只发一部分，需自己循环补发")
print("  → sendall 内部自动循环，保证全发完（推荐用 sendall）")

# ------------------------------------------------------------
# 三、总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("本章小结")
print("=" * 60)
print("• TCP 服务器六步：socket→bind→listen→accept→recv/send→close")
print("• bind 前 setsockopt(SO_REUSEADDR, 1) 必加")
print("• accept 返回新 conn socket，原 socket 继续监听")
print("• recv 返回 b'' 表示对端关闭连接（检测断开的信号）")
print("• send 不保证发完，sendall 保证全发完（推荐 sendall）")
print("• TCP 是字节流无消息边界，粘包拆包在第 6 章解决")
print("• shutdown(SHUT_WR) 可单向关闭发送，仍能接收")
`,
  },

  // ============================================================
  // 第五章：TCP 客户端
  // ============================================================
  {
    id: "py-tcp-client",
    group: "TCP 编程",
    icon: "📱",
    title: "TCP 客户端",
    content: `## 一、TCP 客户端的工作流程

相比服务器，客户端的流程更简单，只有四步：

\`\`\`text
1. socket()    创建套接字
2. connect()   连接服务器（触发三次握手）
3. send()/recv()  收发数据
4. close()     关闭连接
\`\`\`

\`\`\`python
import socket

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('127.0.0.1', 8080))   # 连接服务器
client.sendall(b'Hello')
data = client.recv(1024)
client.close()
\`\`\`

注意：**客户端不需要 \`bind()\`**。\`connect()\` 时系统会自动分配一个临时端口（49152-65535 范围）。

## 二、connect() 与三次握手

\`connect()\` 是客户端最关键的方法。调用它时，操作系统会在底层完成 TCP 三次握手：

\`\`\`text
Client                              Server
  | --- SYN -----------------------> |   ① 客户端发送 SYN
  | <--- SYN+ACK ------------------ |   ② 服务器回应 SYN+ACK
  | --- ACK -----------------------> |   ③ 客户端发送 ACK
  |                                  |   连接建立 ESTABLISHED
\`\`\`

\`connect()\` 返回时，连接已建立（或失败抛异常）。这之后才能 \`send\`/\`recv\`。

### 2.1 connect 的参数

\`\`\`python
client.connect(('127.0.0.1', 8080))   # IPv4：(host, port) 元组
\`\`\`

地址格式必须和 socket 的 family 匹配：
- \`AF_INET\`：\`(host, port)\` 二元组
- \`AF_INET6\`：\`(host, port, flowinfo, scope_id)\` 四元组

### 2.2 连接失败的异常

| 异常 | 含义 |
|------|------|
| \`ConnectionRefusedError\` | 目标端口没有服务器监听（最常见） |
| \`TimeoutError\` | 连接超时（设了 settimeout） |
| \`socket.gaierror\` | 域名解析失败 |
| \`OSError\` | 其他网络错误（如网络不可达） |

\`\`\`python
try:
    client.connect(('127.0.0.1', 9999))
except ConnectionRefusedError:
    print('连接被拒绝：目标端口没有服务')
except TimeoutError:
    print('连接超时')
\`\`\`

## 三、connect() vs connect_ex()

这两个方法都能连接服务器，但错误处理方式不同：

| 方法 | 成功 | 失败 |
|------|------|------|
| \`connect(addr)\` | 返回 None | **抛异常** |
| \`connect_ex(addr)\` | 返回 0 | **返回错误码**（不抛异常） |

\`\`\`python
# connect：失败抛异常
try:
    client.connect(('127.0.0.1', 9999))
except OSError as e:
    print(f'连接失败: {e}')

# connect_ex：失败返回错误码
err = client.connect_ex(('127.0.0.1', 9999))
if err == 0:
    print('连接成功')
else:
    print(f'连接失败，错误码: {err}')
\`\`\`

### 3.1 端口扫描器原理

\`connect_ex\` 返回 0 表示端口开放（有服务器监听），返回非 0（通常是 111=ECONNREFUSED）表示端口关闭。这就是**端口扫描器**的原理：

\`\`\`python
for port in range(80, 90):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    result = s.connect_ex(('127.0.0.1', port))
    if result == 0:
        print(f'端口 {port} 开放')
    s.close()
\`\`\`

> 注意：端口扫描要谨慎，未经授权扫描他人服务器是违法行为。本教程只在 127.0.0.1 本机演示。

## 四、客户端不需要 bind

为什么客户端通常不 \`bind\`？

1. **避免冲突**：手动指定端口容易和别的进程冲突。
2. **无需固定**：客户端不需要被别人主动连接，所以不需要固定端口。
3. **系统更聪明**：系统会从临时端口范围挑一个空闲的。

\`\`\`python
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('127.0.0.1', 8080))
print(client.getsockname())  # 看系统分配的临时端口，如 ('127.0.0.1', 54321)
\`\`\`

## 五、recv 的阻塞与 settimeout

\`recv()\` 默认会**永久阻塞**，直到收到数据或连接关闭。如果服务器不响应，程序就卡死了。

\`\`\`python
client.settimeout(2.0)   # 2 秒超时
try:
    data = client.recv(1024)
except socket.timeout:
    print('接收超时，服务器可能没响应')
\`\`\`

### 5.1 三种阻塞模式

\`\`\`python
sock.setblocking(True)     # 阻塞模式（默认）
sock.setblocking(False)    # 非阻塞模式：recv 没数据立刻抛 BlockingIOError
sock.settimeout(2.0)       # 超时模式：阻塞最多 2 秒
\`\`\`

- **阻塞模式**：简单，但一个连接卡住整个程序。
- **非阻塞模式**：配合 selectors/asyncio 用，复杂但高并发。
- **超时模式**：折中，本教程 demo 都用它。

## 六、处理常见异常

网络编程必须处理异常，因为网络是不可靠的：

\`\`\`python
try:
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.settimeout(2.0)
    client.connect(('127.0.0.1', 8080))
    client.sendall(b'Hello')
    data = client.recv(1024)
except ConnectionRefusedError:
    print('连接被拒：服务器没开')
except ConnectionResetError:
    print('连接被重置：服务器崩溃了')
except socket.timeout:
    print('超时')
except BrokenPipeError:
    print('管道破裂：对端已关闭还试图 send')
finally:
    client.close()   # 确保关闭
\`\`\`

### 6.1 各种异常的含义

| 异常 | 场景 | 原因 |
|------|------|------|
| \`ConnectionRefusedError\` | connect 时 | 目标端口没服务 |
| \`ConnectionResetError\` | recv/send 时 | 对端强制关闭（崩溃） |
| \`BrokenPipeError\` | send 时 | 对端已关闭，你还发 |
| \`socket.timeout\` | 任何阻塞操作 | 超时 |
| \`ConnectionAbortedError\` | recv/send 时 | 连接被中止 |

## 七、优雅关闭：shutdown vs close

| 方法 | 行为 |
|------|------|
| \`close()\` | 立即关闭 socket，释放 fd |
| \`shutdown(how)\` | 单向/双向关闭，不释放 fd |

\`\`\`python
client.shutdown(socket.SHUT_WR)   # 关闭发送方向（还能接收）
client.shutdown(socket.SHUT_RD)   # 关闭接收方向（还能发送）
client.shutdown(socket.SHUT_RDWR) # 双向关闭
client.close()                    # 真正释放
\`\`\`

\`shutdown(SHUT_WR)\` 的典型场景：客户端发完所有数据后，告诉服务器"我发完了"，但还想接收服务器的最终响应。HTTP 的 \`Connection: close\` 就是这么做的。

## 八、本章 demo 预告

下面的代码会演示：
- 启动一个 TCP echo 服务器线程
- 客户端 connect、send "Hello"、recv 回显
- 用 \`connect_ex\` 扫描 127.0.0.1 的几个端口（开放 vs 关闭）
- 演示 \`settimeout\` 后 connect 超时
- 演示 \`ConnectionRefusedError\` 的捕获`,
    code: `# ============================================================
# 第五章代码演示：TCP 客户端
# ------------------------------------------------------------
# 演示内容：
#   1. 启动 TCP echo 服务器线程，客户端连接通信
#   2. connect_ex 扫描 127.0.0.1 的端口（开放 vs 关闭）
#   3. settimeout 后 connect 超时
#   4. ConnectionRefusedError 的捕获
# ============================================================
import socket
import threading
import time

print("=" * 60)
print("TCP 客户端演示")
print("=" * 60)

# ------------------------------------------------------------
# 一、客户端连接 echo 服务器，收发数据
# ------------------------------------------------------------
print("\\n[1] 客户端连接 echo 服务器")
print("-" * 60)

# 启动一个简单的 echo 服务器（线程内）
def echo_server(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    conn, addr = srv.accept()
    # 多轮 echo：收到数据就回发，直到客户端关闭
    while True:
        data = conn.recv(1024)
        if not data:
            break
        conn.sendall(b"ECHO:" + data)
    conn.close()
    srv.close()

port_holder = []
threading.Thread(target=echo_server, args=(port_holder,), daemon=True).start()
time.sleep(0.2)

# 客户端连接
port = port_holder[0]
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.settimeout(2.0)
print(f"  [client] connect 127.0.0.1:{port}")
client.connect(("127.0.0.1", port))
print(f"  [client] 连接成功，本地临时端口={client.getsockname()[1]}")
print(f"  [client] 对端地址 getpeername()={client.getpeername()}")

# 发送两条消息，分别接收回显
for msg in [b"Hello", b"TCP Client"]:
    client.sendall(msg)
    reply = client.recv(1024)
    print(f"  [client] send {msg!r} → recv {reply!r}")

# 主动关闭
client.close()
print(f"  [client] close() 完成")
time.sleep(0.2)

# ------------------------------------------------------------
# 二、connect_ex 端口扫描器原理
# ------------------------------------------------------------
print("\\n[2] connect_ex 端口扫描（127.0.0.1）")
print("-" * 60)

# 先启动一个服务器在某个端口，用来演示"开放"端口
scan_srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
scan_srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
scan_srv.bind(("127.0.0.1", 0))
scan_srv.listen(1)
open_port = scan_srv.getsockname()[1]
print(f"  已在 127.0.0.1:{open_port} 开放一个端口（用于演示）")

# 扫描几个端口：开放的那个会返回 0
test_ports = [open_port, 8080, 8888, 9999, 12345]
print(f"  扫描端口: {test_ports}")
for p in test_ports:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    # connect_ex：成功返回 0，失败返回错误码（不抛异常）
    err = s.connect_ex(("127.0.0.1", p))
    status = "开放 ✅" if err == 0 else f"关闭（错误码 {err}）"
    print(f"    端口 {p:5d}: {status}")
    s.close()

scan_srv.close()
print("  （扫描完，关闭演示服务器）")

# ------------------------------------------------------------
# 三、settimeout 后 connect 超时
# ------------------------------------------------------------
# 用一个不可路由的地址演示 connect 超时
# 10.255.255.1 通常是不可达地址，connect 会超时
print("\\n[3] settimeout 后 connect 超时")
print("-" * 60)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(0.5)  # 0.5 秒超时
print("  尝试连接 10.255.255.1:80（不可达地址，0.5 秒超时）")
start = time.time()
try:
    s.connect(("10.255.255.1", 80))
    print("  连接成功（意外）")
except (socket.timeout, TimeoutError) as e:
    elapsed = time.time() - start
    print(f"  连接超时！耗时 {elapsed:.2f}s，异常类型: {type(e).__name__}")
except OSError as e:
    elapsed = time.time() - start
    print(f"  连接失败：{e}（耗时 {elapsed:.2f}s）")
finally:
    s.close()

# ------------------------------------------------------------
# 四、ConnectionRefusedError 捕获
# ------------------------------------------------------------
print("\\n[4] ConnectionRefusedError 捕获")
print("-" * 60)

# 连接一个肯定没有服务器的端口（如 1，需要 root 且通常空闲）
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(1.0)
refused_port = 1  # 端口 1 几乎不会有服务
print(f"  尝试连接 127.0.0.1:{refused_port}（没有服务器监听）")
try:
    s.connect(("127.0.0.1", refused_port))
    print("  连接成功（意外）")
except ConnectionRefusedError as e:
    print(f"  ConnectionRefusedError: {e}")
    print("  → 含义：目标端口没有服务器监听，TCP 收到了 RST 重置包")
except OSError as e:
    print(f"  其他 OSError: {e}")
finally:
    s.close()

# 对比 connect_ex 处理同样情况（不抛异常）
s2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s2.settimeout(1.0)
err = s2.connect_ex(("127.0.0.1", refused_port))
print(f"  connect_ex 返回错误码: {err}（111=ECONNREFUSED，不抛异常）")
s2.close()

# ------------------------------------------------------------
# 五、完整的客户端异常处理模板
# ------------------------------------------------------------
print("\\n[5] 客户端异常处理模板")
print("-" * 60)

# 启动 echo 服务器
def safe_echo(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    try:
        conn, _ = srv.accept()
        data = conn.recv(1024)
        conn.sendall(b"OK:" + data)
        conn.close()
    except Exception:
        pass
    srv.close()

ph = []
threading.Thread(target=safe_echo, args=(ph,), daemon=True).start()
time.sleep(0.2)

# 标准的客户端异常处理写法
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.settimeout(2.0)
try:
    client.connect(("127.0.0.1", ph[0]))
    client.sendall(b"safe-client")
    data = client.recv(1024)
    print(f"  通信成功: {data!r}")
except ConnectionRefusedError:
    print("  连接被拒绝")
except ConnectionResetError:
    print("  连接被重置")
except (socket.timeout, TimeoutError):
    print("  超时")
except BrokenPipeError:
    print("  管道破裂")
except OSError as e:
    print(f"  其他网络错误: {e}")
finally:
    client.close()  # finally 确保一定关闭
    print("  finally: client.close() 已执行")

# ------------------------------------------------------------
# 六、总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("本章小结")
print("=" * 60)
print("• 客户端四步：socket→connect→send/recv→close（不需要 bind）")
print("• connect 触发三次握手，失败抛 ConnectionRefusedError")
print("• connect_ex 返回错误码不抛异常，适合做端口扫描")
print("• settimeout 防止 recv/connect 永久阻塞")
print("• 网络不可靠，必须用 try/except 处理各类异常")
print("• finally 中 close() 确保资源释放")
`,
  },

  // ============================================================
  // 第六章：TCP echo 实战
  // ============================================================
  {
    id: "py-tcp-echo",
    group: "TCP 编程",
    icon: "🔁",
    title: "TCP echo 实战",
    content: `## 一、echo 协议

echo（回显）是最简单的网络协议之一，定义在 RFC 862：**服务器把收到的数据原样返回**。

\`\`\`text
客户端发送 "hello"  →  服务器  →  服务器返回 "hello"
\`\`\`

虽然简单，但 echo 协议涵盖了网络编程的所有核心要素：连接建立、数据收发、连接关闭、多轮通信。它是学习网络编程的最佳起点。

### 1.1 echo 服务器的核心逻辑

\`\`\`python
while True:
    data = conn.recv(1024)   # 接收
    if not data:             # b'' 表示客户端断开
        break
    conn.sendall(data)       # 原样回发
\`\`\`

关键点：
1. **循环 recv**：一次连接可能有多轮通信。
2. **检测 \`b''\`**：recv 返回空字节串表示对端关闭，必须退出循环。
3. **sendall 回发**：用 sendall 保证数据全发出去。

## 二、多轮通信

真实的网络应用通常是一次连接、多轮请求-响应（如 HTTP/1.1 keep-alive）：

\`\`\`text
Client                          Server
  | --- "hello" ---------------> |
  | <--- "hello" ---------------- |  第 1 轮
  | --- "world" ---------------> |
  | <--- "world" ---------------- |  第 2 轮
  | --- "quit" -----------------> |
  | <--- "quit" ---------------- |  第 3 轮
  | --- close() ----------------> |  客户端断开
\`\`\`

\`\`\`python
# 服务器多轮 echo
while True:
    data = conn.recv(1024)
    if not data:
        break           # 客户端关闭
    conn.sendall(data)
    if data == b'quit':
        break           # 收到 quit 也退出
\`\`\`

## 三、粘包与拆包问题

这是 TCP 编程**最重要**的难点。TCP 是**字节流**，没有消息边界：

### 3.1 粘包

发送方连续发两条短消息，接收方一次 recv 全收到了：

\`\`\`text
发送：send("hello")  send("world")
接收：recv() → "helloworld"（两条粘在一起）
\`\`\`

### 3.2 拆包

发送方发一条长消息，接收方分两次 recv 收到：

\`\`\`text
发送：send("a" * 5000)
接收：recv() → "a"*4096  +  recv() → "a"*904（被拆成两段）
\`\`\`

### 3.3 为什么会这样

TCP 把数据当成连续的字节流，它会根据发送缓冲区、MSS、网络情况自由切分或合并数据。\`send\` 和 \`recv\` 之间**没有一一对应关系**。

> **常见误解**："发送方 send 几次，接收方就 recv 几次"。**错！** TCP 不保证这个。一次 send 可能对应多次 recv，多次 send 可能对应一次 recv。

### 3.4 这不是 bug

粘包/拆包不是 TCP 的 bug，而是字节流协议的固有特性。TCP 的设计目标是"可靠传输字节流"，消息边界是**应用层**的责任。

## 四、解决粘包的三种方案

### 4.1 方案一：固定长度

每条消息固定 N 字节，不够补齐：

\`\`\`python
# 发送：补齐到 16 字节
msg = b'hello'
msg = msg.ljust(16, b'\\x00')
sock.sendall(msg)

# 接收：固定读 16 字节
data = sock.recv(16)
\`\`\`

缺点：浪费带宽（短消息也要占 16 字节），长度不灵活。

### 4.2 方案二：特殊分隔符

用 \`\\n\` 等特殊字符分隔消息：

\`\`\`python
# 发送：末尾加 \\n
sock.sendall(b'hello\\n')

# 接收：读到 \\n 为止（需自己实现按行读取）
buffer = b''
while b'\\n' not in buffer:
    buffer += sock.recv(1024)
line, buffer = buffer.split(b'\\n', 1)
\`\`\`

缺点：消息内容不能包含分隔符，需转义。HTTP、Redis 协议用这种方案。

### 4.3 方案三：长度前缀（推荐）

先发 4 字节消息长度，再发消息内容：

\`\`\`text
| 长度 (4 字节, 大端序) | 消息内容 (长度字节) |
\`\`\`

\`\`\`python
import struct

# 发送：4 字节长度 + 内容
def send_msg(sock, msg):
    length = struct.pack('!I', len(msg))   # 4 字节大端序长度
    sock.sendall(length + msg)

# 接收：先读 4 字节长度，再按长度读内容
def recv_msg(sock):
    # 先读 4 字节长度（可能要循环读满 4 字节）
    length_bytes = recv_exact(sock, 4)
    length = struct.unpack('!I', length_bytes)[0]
    # 再读 length 字节内容
    return recv_exact(sock, length)

# 确保读满 n 字节的辅助函数（核心！）
def recv_exact(sock, n):
    data = b''
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError('连接已关闭')
        data += chunk
    return data
\`\`\`

优点：消息可含任意字节、长度灵活、不浪费带宽。**这是最常用的方案**，gRPC、Thrift、MQTT 都用它。

### 4.4 recv_exact 为什么必须循环

\`recv(n)\` 最多返回 n 字节，可能更少。要读满 n 字节必须循环：

\`\`\`python
# 错误写法：可能读不满
length_bytes = sock.recv(4)   # 可能只返回 2 字节！

# 正确写法：循环直到读满
def recv_exact(sock, n):
    data = b''
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError('连接关闭')
        data += chunk
    return data
\`\`\`

这是网络编程最常见的 bug 来源——**假设 recv 一定返回指定长度**。记住：recv 只保证"最多 n 字节"，不保证"恰好 n 字节"。

## 五、用 struct 处理长度前缀

\`struct\` 模块用于二进制数据的打包/解包：

\`\`\`python
import struct

# pack：把 Python 整数转成 4 字节大端序字节串
length_bytes = struct.pack('!I', 100)   # b'\\x00\\x00\\x00d'

# unpack：把 4 字节字节串转回 Python 整数
length = struct.unpack('!I', length_bytes)[0]   # 100
\`\`\`

格式字符说明：

| 字符 | 字节数 | 类型 |
|------|--------|------|
| \`!\` | - | 网络字节序（大端序）前缀 |
| \`I\` | 4 | 无符号整数 |
| \`H\` | 2 | 无符号短整数（端口用） |
| \`Q\` | 8 | 无符号长整数 |

## 六、完整的长度前缀协议示例

\`\`\`text
发送方                            接收方
  | struct.pack('!I', 5) + "hello"  |
  | ------------------------------> | 读 4 字节得长度 5
  |                                 | 再读 5 字节得 "hello"
  | struct.pack('!I', 5) + "world"  |
  | ------------------------------> | 读 4 字节得长度 5
  |                                 | 再读 5 字节得 "world"
\`\`\`

即使发送方连续发两条，接收方也能正确拆分——因为每条消息前都有明确的长度标识。

## 七、本章 demo 预告

下面的代码会演示：
- 完整的 echo 服务器（线程内运行，支持多轮通信）
- 客户端发送 3 条消息，逐条接收回显
- 演示粘包：连续 send 两条短消息，可能一次 recv 收到
- 长度前缀方案：用 \`struct.pack('!I', len)\` 发送 4 字节长度 + 内容
- 服务器按长度前缀正确拆分消息`,
    code: `# ============================================================
# 第六章代码演示：TCP echo 实战
# ------------------------------------------------------------
# 演示内容：
#   1. 完整 echo 服务器（多轮通信）
#   2. 客户端发 3 条消息，逐条接收回显
#   3. 演示粘包：连续 send 两条短消息
#   4. 长度前缀方案：struct.pack('!I', len) 正确拆分消息
# ============================================================
import socket
import threading
import time
import struct

print("=" * 60)
print("TCP echo 实战演示")
print("=" * 60)

# ------------------------------------------------------------
# 一、基础 echo 服务器 + 多轮通信
# ------------------------------------------------------------
print("\\n[1] 基础 echo 服务器（多轮通信）")
print("-" * 60)

def basic_echo_server(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    conn, addr = srv.accept()
    print(f"  [server] 客户端连接: {addr}")
    # 多轮 echo：收到就回发，直到客户端关闭
    round_count = 0
    while True:
        data = conn.recv(1024)
        if not data:
            break  # b'' 表示客户端断开
        round_count += 1
        print(f"  [server] 第 {round_count} 轮 recv: {data!r}")
        conn.sendall(b"ECHO:" + data)
    conn.close()
    srv.close()
    print(f"  [server] 客户端断开，共 {round_count} 轮通信")

port_holder = []
threading.Thread(target=basic_echo_server, args=(port_holder,), daemon=True).start()
time.sleep(0.2)

# 客户端发 3 条消息
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.settimeout(2.0)
client.connect(("127.0.0.1", port_holder[0]))
for msg in [b"Hello", b"Echo", b"Bye"]:
    client.sendall(msg)
    reply = client.recv(1024)
    print(f"  [client] send {msg!r:10s} → recv {reply!r}")
client.close()
print(f"  [client] close() 完成")
time.sleep(0.2)

# ------------------------------------------------------------
# 二、演示粘包现象
# ------------------------------------------------------------
print("\\n[2] 粘包现象演示")
print("-" * 60)

def sticky_server(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    conn, _ = srv.accept()
    # 一次性 recv，看能收到多少
    data = conn.recv(1024)
    print(f"  [server] 一次 recv 收到: {data!r}")
    if len(data) > 5:
        print(f"  [server] → 粘包了！两条消息被合并接收")
    else:
        print(f"  [server] → 没粘包（也可能只是恰好分开）")
    conn.close()
    srv.close()

ph2 = []
threading.Thread(target=sticky_server, args=(ph2,), daemon=True).start()
time.sleep(0.2)

c2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c2.settimeout(2.0)
c2.connect(("127.0.0.1", ph2[0]))
# 连续快速 send 两条短消息，很可能被服务器一次 recv 收到
c2.sendall(b"AAAA")
c2.sendall(b"BBBB")
print(f"  [client] 连续 send(b'AAAA') + send(b'BBBB')")
c2.close()
time.sleep(0.2)
print("  → TCP 字节流无消息边界，send 两次可能被 recv 一次收到")

# ------------------------------------------------------------
# 三、长度前缀方案：正确拆分消息
# ------------------------------------------------------------
print("\\n[3] 长度前缀方案：struct.pack('!I', len)")
print("-" * 60)

# 辅助函数：确保读满 n 字节（核心！recv 不保证读满）
def recv_exact(sock, n):
    data = b''
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError("连接已关闭")
        data += chunk
    return data

# 发送带长度前缀的消息
def send_msg(sock, msg):
    length = struct.pack('!I', len(msg))   # 4 字节大端序长度
    sock.sendall(length + msg)

# 接收带长度前缀的消息
def recv_msg(sock):
    length_bytes = recv_exact(sock, 4)      # 先读 4 字节长度
    length = struct.unpack('!I', length_bytes)[0]
    return recv_exact(sock, length)          # 再读 length 字节内容

# 长度前缀服务器
def framed_echo_server(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    conn, _ = srv.accept()
    count = 0
    while True:
        try:
            msg = recv_msg(conn)   # 按长度前缀正确读取一条完整消息
        except ConnectionError:
            break
        count += 1
        print(f"  [server] 第 {count} 条消息: {msg!r}（长度 {len(msg)}）")
        send_msg(conn, b"ECHO:" + msg)   # 回发也用长度前缀
    conn.close()
    srv.close()

ph3 = []
threading.Thread(target=framed_echo_server, args=(ph3,), daemon=True).start()
time.sleep(0.2)

c3 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c3.settimeout(2.0)
c3.connect(("127.0.0.1", ph3[0]))

# 发送 3 条不同长度的消息，即使连续发送也能正确拆分
messages = [b"Hi", b"Hello World", b"Length-Prefix Protocol Works!"]
for msg in messages:
    send_msg(c3, msg)
    reply = recv_msg(c3)
    print(f"  [client] send {msg!r}")
    print(f"          recv {reply!r}")

c3.close()
print(f"  [client] close() 完成")
time.sleep(0.2)

# ------------------------------------------------------------
# 四、对比：连续发送多条，长度前缀保证正确拆分
# ------------------------------------------------------------
print("\\n[4] 连续发送 3 条，服务器逐条正确接收")
print("-" * 60)

def framed_server2(port_holder, received):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(1)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    conn, _ = srv.accept()
    for _ in range(3):
        msg = recv_msg(conn)
        received.append(msg)
        send_msg(conn, msg)
    conn.close()
    srv.close()

ph4 = []
received = []
threading.Thread(target=framed_server2, args=(ph4, received), daemon=True).start()
time.sleep(0.2)

c4 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
c4.settimeout(2.0)
c4.connect(("127.0.0.1", ph4[0]))

# 连续 send 3 条（不等回复），服务器仍能逐条正确拆分
send_msg(c4, b"first")
send_msg(c4, b"second")
send_msg(c4, b"third")
print("  [client] 连续发送 3 条（不等回复）")

# 再逐条接收回显
for _ in range(3):
    reply = recv_msg(c4)
    print(f"  [client] recv {reply!r}")

c4.close()
time.sleep(0.2)
print(f"  [server] 按长度前缀正确拆分，收到: {[m.decode() for m in received]}")

# ------------------------------------------------------------
# 五、总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("本章小结")
print("=" * 60)
print("• echo 协议：服务器把收到的数据原样返回（RFC 862）")
print("• recv 返回 b'' 表示对端关闭，循环 recv 时用它退出")
print("• TCP 是字节流无消息边界：粘包/拆包是固有特性，不是 bug")
print("• 解决粘包三方案：固定长度、分隔符、长度前缀（推荐）")
print("• 长度前缀：struct.pack('!I', len) + 内容，接收时先读 4 字节长度")
print("• recv_exact 辅助函数循环读满 n 字节（recv 不保证读满！）")
`,
  },

  // ============================================================
  // 第七章：并发 TCP 服务器
  // ============================================================
  {
    id: "py-tcp-concurrent",
    group: "TCP 编程",
    icon: "⚡",
    title: "并发 TCP 服务器",
    content: `## 一、单线程服务器的局限

前几章的服务器都是**单线程**的：\`accept()\` 一次只能处理一个连接，处理完才能接下一个。这带来致命问题：

\`\`\`text
时间线：
  accept 客户端A → 处理A（recv 阻塞 5 秒）→ 客户端B 连接 → B 排队等 5 秒 → 才被处理
\`\`\`

如果一个客户端网络慢（recv 卡住），所有其他客户端都被阻塞。这在生产环境是不可接受的。

### 1.1 为什么要并发

- **响应性**：多个客户端同时被服务，不互相阻塞。
- **吞吐量**：一个连接等 IO 时，CPU 去处理其他连接。
- **可扩展性**：能支撑成千上万并发连接（C10K/C100K 问题）。

## 二、并发方案一：多线程（threading）

最直观的并发方案：每个客户端连接开一个线程处理。

\`\`\`python
import threading

def handle_client(conn, addr):
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)
    finally:
        conn.close()

while True:
    conn, addr = server.accept()
    threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
\`\`\`

### 2.1 优点

- **简单直观**：代码结构和单线程几乎一样。
- **阻塞 IO 友好**：一个线程 recv 阻塞不影响其他线程。

### 2.2 缺点

- **线程开销**：每个线程占约 8MB 栈空间，1 万连接就 80GB，扛不住 C10K。
- **GIL 限制**：Python 的 GIL 让线程无法真正并行执行 CPU 任务（但 IO 操作会释放 GIL，所以网络 IO 还好）。
- **线程安全**：多线程共享数据需加锁。

### 2.3 适用场景

- 连接数不多（几百以内）
- 每个连接主要是 IO 等待
- 快速原型开发

## 三、并发方案二：多进程（multiprocessing）

每个连接 fork 一个进程：

\`\`\`python
import multiprocessing

def handle_client(conn):
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)
    finally:
        conn.close()

while True:
    conn, addr = server.accept()
    p = multiprocessing.Process(target=handle_client, args=(conn,))
    p.daemon = True
    p.start()
    conn.close()  # 父进程关闭 conn（子进程已有副本）
\`\`\`

### 3.1 优缺点

| 特性 | 多线程 | 多进程 |
|------|--------|--------|
| 隔离性 | 差（共享内存） | 好（独立内存空间） |
| GIL | 有 | 无（真并行） |
| 开销 | 小（~8MB 栈） | 大（独立内存） |
| 通信 | 直接共享变量 | 需 Queue/Pipe |
| 崩溃影响 | 一个线程崩可能影响全局 | 一个进程崩不影响其他 |

多进程适合 CPU 密集型 + 需要隔离的场景。但开销更大，连接数受限。

## 四、并发方案三：I/O 多路复用（selectors，推荐）

这是**高性能网络服务器**的核心技术。原理：单线程同时监控多个 socket，哪个有事件（可读/可写）就处理哪个。

\`\`\`text
单线程：                    I/O 多路复用：
  监听 socket A              selector 同时监控 A B C D
  accept A                   A 有数据 → 处理 A
  recv A（阻塞）              B 有数据 → 处理 B
  ... A 卡住，B 等待          C 有连接 → accept C
                             （单线程，无阻塞，高并发）
\`\`\`

### 4.1 selectors 模块

Python 的 \`selectors\` 模块是对 \`select/poll/epoll/kqueue\` 的统一封装：

\`\`\`python
import selectors

sel = selectors.DefaultSelector()  # 自动选最优（Linux epoll/macOS kqueue）

def accept(sock, mask):
    conn, addr = sock.accept()
    conn.setblocking(False)
    sel.register(conn, selectors.EVENT_READ, read)

def read(conn, mask):
    data = conn.recv(1024)
    if data:
        conn.sendall(data)
    else:
        sel.unregister(conn)
        conn.close()

server.bind(('127.0.0.1', 8080))
server.listen()
server.setblocking(False)
sel.register(server, selectors.EVENT_READ, accept)

while True:
    events = sel.select()  # 阻塞等事件
    for key, mask in events:
        callback = key.data     # 注册时传的函数
        callback(key.fileobj, mask)  # 调用回调
\`\`\`

### 4.2 事件类型

| 事件 | 含义 |
|------|------|
| \`EVENT_READ\` | socket 可读（有数据/有新连接/对端关闭） |
| \`EVENT_WRITE\` | socket 可写（发送缓冲区未满） |

### 4.3 为什么高性能

- **单线程**：无线程切换开销，无锁竞争。
- **epoll/kqueue**：O(1) 事件通知，不像 select 轮询（O(n)）。
- **可扩展**：单机可扛数万并发连接（C10K 轻松，C100K 也可）。

Nginx、Redis、Node.js 底层都是这个模型。

## 五、并发方案四：asyncio（Python 3.4+）

asyncio 用**协程 + 事件循环**实现并发，语法更现代：

\`\`\`python
import asyncio

async def handle_client(reader, writer):
    while True:
        data = await reader.read(1024)
        if not data:
            break
        writer.write(data)
        await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, '127.0.0.1', 8080)
    async with server:
        await server.serve_forever()

asyncio.run(main())
\`\`\`

### 5.1 async/await 的优势

- **代码像同步**：用 \`await\` 写异步，比回调直观。
- **单线程高并发**：和 selectors 一样高效，但语法更友好。
- **生态丰富**：aiohttp、aiomysql、aioredis 等异步库。

### 5.2 关键概念

| 概念 | 说明 |
|------|------|
| \`async def\` | 定义协程函数 |
| \`await\` | 等待协程完成（不阻塞线程） |
| \`asyncio.run()\` | 启动事件循环 |
| \`asyncio.gather()\` | 并发执行多个协程 |
| \`asyncio.start_server()\` | 高级 TCP 服务器 API |

## 六、四种方案对比

| 方案 | 并发模型 | 开销 | 复杂度 | 扩展性 | 适用场景 |
|------|----------|------|--------|--------|----------|
| 多线程 | 一连接一线程 | 中 | 低 | 千级 | 简单服务、IO 密集 |
| 多进程 | 一连接一进程 | 高 | 中 | 百级 | CPU 密集、需隔离 |
| selectors | 事件驱动 | 低 | 高 | 万级+ | 高性能服务器 |
| asyncio | 协程+事件循环 | 低 | 中 | 万级+ | 现代高并发应用 |

## 七、C10K 问题

C10K 问题：如何让单台服务器同时处理 1 万并发连接？

- **多线程/多进程**：1 万线程 × 8MB 栈 = 80GB 内存，扛不住。
- **select**：默认最多 1024 个 fd，且 O(n) 轮询，性能差。
- **epoll/kqueue**：O(1) 事件通知，无 fd 数量限制，是 C10K 的解法。

现代服务器（Nginx、Redis）用 epoll + 单线程事件循环，轻松扛 C10K 甚至 C100K。Python 的 selectors/asyncio 底层就是 epoll。

## 八、本章 demo 预告

下面的代码会演示：
- 方案一：threading 多线程服务器（每个连接一个线程）
- 在子线程运行服务器，主线程开 3 个客户端同时连接
- 服务器打印每个连接的客户端地址和处理线程名
- 方案三：selectors I/O 多路复用服务器（简化版）
- 方案四：asyncio.start_server + async client`,
    code: `# ============================================================
# 第七章代码演示：并发 TCP 服务器
# ------------------------------------------------------------
# 演示内容：
#   1. threading 多线程服务器（每个连接一个线程）
#   2. 主线程开 3 个客户端同时连接，服务器并发处理
#   3. selectors I/O 多路复用服务器（简化版单轮）
#   4. asyncio.start_server + async client
# ============================================================
import socket
import threading
import time
import selectors
import asyncio

print("=" * 60)
print("并发 TCP 服务器演示")
print("=" * 60)

# ------------------------------------------------------------
# 方案一：threading 多线程服务器
# ------------------------------------------------------------
print("\\n[1] 方案一：threading 多线程服务器")
print("-" * 60)

def threaded_server(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(8)
    port_holder.append(srv.getsockname()[1])
    srv.settimeout(3.0)
    print(f"  [server] 多线程服务器启动，端口={port_holder[0]}")

    # 每个客户端连接的处理函数（在新线程中运行）
    def handle(conn, addr, cid):
        tname = threading.current_thread().name
        print(f"  [server] 线程 {tname} 处理客户端 {cid} {addr}")
        try:
            data = conn.recv(1024)
            print(f"  [server] 线程 {tname} 收到客户端 {cid}: {data!r}")
            time.sleep(0.2)  # 模拟处理耗时
            conn.sendall(f"REPLY-{cid}".encode())
        finally:
            conn.close()

    # 接受 3 个连接，每个开一个线程
    served = 0
    while served < 3:
        try:
            conn, addr = srv.accept()
            threading.Thread(target=handle, args=(conn, addr, served+1), daemon=True).start()
            served += 1
        except socket.timeout:
            break
    # 等所有处理线程完成
    time.sleep(0.5)
    srv.close()
    print(f"  [server] 共服务 {served} 个客户端，关闭")

ph1 = []
threading.Thread(target=threaded_server, args=(ph1,), daemon=True).start()
time.sleep(0.3)

# 主线程开 3 个客户端"同时"连接
port = ph1[0]
clients = []
for i in range(3):
    c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    c.settimeout(2.0)
    c.connect(("127.0.0.1", port))
    c.sendall(f"Hello-{i+1}".encode())
    clients.append(c)
    print(f"  [client {i+1}] connect + send Hello-{i+1}")

# 接收各自的回复
for i, c in enumerate(clients):
    reply = c.recv(1024)
    print(f"  [client {i+1}] recv {reply!r}")
    c.close()

time.sleep(0.3)
print("  → 3 个客户端被不同线程并发处理，互不阻塞")

# ------------------------------------------------------------
# 方案三：selectors I/O 多路复用服务器（简化版）
# ------------------------------------------------------------
print("\\n[2] 方案三：selectors I/O 多路复用")
print("-" * 60)

def selector_server(port_holder):
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("127.0.0.1", 0))
    srv.listen(8)
    port_holder.append(srv.getsockname()[1])
    srv.setblocking(False)  # 非阻塞模式

    sel = selectors.DefaultSelector()
    handled = {"count": 0}

    def accept(sock, mask):
        conn, addr = sock.accept()
        conn.setblocking(False)
        sel.register(conn, selectors.EVENT_READ, read)
        print(f"  [selector] accept 新连接 {addr}")

    def read(conn, mask):
        data = conn.recv(1024)
        if data:
            print(f"  [selector] 收到 {data!r}")
            conn.sendall(b"SEL-REPLY:" + data)
        else:
            sel.unregister(conn)
            conn.close()
            handled["count"] += 1

    sel.register(srv, selectors.EVENT_READ, accept)
    print(f"  [selector] 服务器启动，端口={port_holder[0]}")

    # 事件循环：最多跑 2 秒，处理完 2 个连接就退出
    start = time.time()
    while time.time() - start < 2.0 and handled["count"] < 2:
        events = sel.select(timeout=0.3)  # 最多等 0.3 秒
        for key, mask in events:
            callback = key.data
            callback(key.fileobj, mask)

    sel.close()
    srv.close()
    print(f"  [selector] 处理了 {handled['count']} 个连接，关闭")

ph2 = []
threading.Thread(target=selector_server, args=(ph2,), daemon=True).start()
time.sleep(0.3)

# 2 个客户端连接
for i in range(2):
    c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    c.settimeout(2.0)
    c.connect(("127.0.0.1", ph2[0]))
    c.sendall(f"sel-{i+1}".encode())
    reply = c.recv(1024)
    print(f"  [client {i+1}] recv {reply!r}")
    c.close()
    time.sleep(0.1)

time.sleep(0.5)
print("  → 单线程通过 selectors 同时监控多个 socket，实现并发")

# ------------------------------------------------------------
# 方案四：asyncio.start_server + async client
# ------------------------------------------------------------
print("\\n[3] 方案四：asyncio 协程服务器")
print("-" * 60)

async def async_handle(reader, writer):
    addr = writer.get_extra_info('peername')
    data = await reader.read(1024)
    print(f"  [asyncio] 协程处理 {addr}: {data!r}")
    writer.write(b"ASYNC-REPLY:" + data)
    await writer.drain()
    writer.close()

async def async_client(host, port, msg):
    reader, writer = await asyncio.open_connection(host, port)
    writer.write(msg)
    await writer.drain()
    data = await reader.read(1024)
    print(f"  [async client] send {msg!r} → recv {data!r}")
    writer.close()
    await writer.wait_closed()

async def async_main():
    server = await asyncio.start_server(async_handle, '127.0.0.1', 0)
    port = server.sockets[0].getsockname()[1]
    print(f"  [asyncio] 服务器启动，端口={port}")
    # 并发 3 个客户端
    tasks = [async_client('127.0.0.1', port, f"async-{i+1}".encode()) for i in range(3)]
    await asyncio.gather(*tasks)
    server.close()
    await server.wait_closed()
    print(f"  [asyncio] 服务器关闭")

# asyncio.run 在 5 秒内完成
asyncio.run(async_main())

print("  → asyncio 用协程单线程并发，语法像同步但性能像事件循环")

# ------------------------------------------------------------
# 四种方案对比总结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("四种并发方案对比")
print("=" * 60)
print("方案         | 并发模型      | 开销 | 扩展性   | 复杂度")
print("-------------|---------------|------|----------|-------")
print("threading    | 一连接一线程  | 中   | 千级     | 低    ")
print("multiprocess | 一连接一进程  | 高   | 百级     | 中    ")
print("selectors    | 事件驱动      | 低   | 万级+    | 高    ")
print("asyncio      | 协程+事件循环 | 低   | 万级+    | 中    ")
print()
print("本章小结：")
print("• 单线程服务器 accept/recv 阻塞会卡住所有客户端")
print("• threading 每连接一线程，简单但开销大（~8MB 栈/线程）")
print("• selectors 单线程事件驱动，epoll/kqueue 底层，高性能")
print("• asyncio 协程+事件循环，async/await 语法现代，推荐")
print("• C10K 解法：epoll/kqueue + 单线程事件循环（selectors/asyncio）")
`,
  },
];
