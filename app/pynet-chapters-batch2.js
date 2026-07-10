// =============================================================
// Python 网络编程教程（pynet）—— 第二批章节（UDP 编程 + HTTP，共 7 章）
// -------------------------------------------------------------
// 本批讲解 UDP 协议编程与 HTTP 协议。
// 包含以下章节：
//   UDP 编程组：
//     1. py-udp-basics   — UDP 基础
//     2. py-udp-echo     — UDP echo 实战
//     3. py-udp-broadcast — UDP 广播
//   HTTP 组：
//     4. py-http-basics  — HTTP 协议基础
//     5. py-http-server  — http.server 服务器
//     6. py-http-client  — urllib 与 http.client
//     7. py-http-practice — HTTP 实战
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
  // 第一章：UDP 基础
  // ============================================================
  {
    id: "py-udp-basics",
    group: "UDP 编程",
    icon: "📡",
    title: "UDP 基础",
    content: `## 一、什么是 UDP

UDP（User Datagram Protocol，用户数据报协议）是 TCP/IP 协议栈中传输层的两大协议之一，与 TCP 并列。如果说 TCP 是一个"负责任的快递员"——确保每个包裹按时送达、按序到达，那 UDP 就是一个"只管寄出的邮差"——把信扔进邮筒就完事，至于收件人有没有收到、什么时候收到，一概不管。

这种"不管不顾"听起来很不靠谱，但正是这种简单带来了极高的效率。很多场景下我们不需要绝对的可靠，反而更需要速度和低延迟：视频通话掉几帧无所谓、游戏里偶尔丢个位置更新不影响大局、DNS 查询发一次问等一次答就够了。

### 1.1 UDP 的四大核心特点

| 特点 | 说明 | 带来的影响 |
|------|------|-----------|
| **无连接** | 发送数据前不需要先建立连接（对比 TCP 的三次握手） | 速度快，开销小，随时可发 |
| **不可靠** | 不保证送达、不保证顺序、没有重传机制 | 可能丢包、可能乱序，应用层需自行处理 |
| **数据报** | 每个消息是独立的数据报，有明确边界 | 一次 sendto 对应一次 recvfrom，无粘包 |
| **轻量** | 协议头只有 8 字节，无握手、无状态维护 | 省带宽、省内存，适合海量终端 |

### 1.2 UDP 头部结构

UDP 的头部极其精简，只有 8 个字节（TCP 头部至少 20 字节）：

\`\`\`
 0      7 8     15 16    23 24    31
+--------+--------+--------+--------+
|  源端口  | 目的端口 |           ← 各 2 字节
+--------+--------+--------+--------+
|   长度   |  校验和  |              ← 各 2 字节
+--------+--------+--------+--------+
|          数据部分 ...              |
+-----------------------------------+
\`\`\`

- **源端口**（2字节）：发送方端口，可选（不需要回复时填 0）
- **目的端口**（2字节）：接收方端口
- **长度**（2字节）：整个 UDP 数据报（头+数据）的字节数，最小 8
- **校验和**（2字节）：可选的差错检测，覆盖头部和数据

> 对比：TCP 头部有 20 字节，包含序号、确认号、窗口大小等大量字段用于可靠传输控制。UDP 省去了所有这些，因此头部开销不到 TCP 的一半。

## 二、UDP vs TCP 全面对比

理解 UDP 离不开和 TCP 的对比。两者各有适用场景，没有绝对的优劣：

| 维度 | UDP | TCP |
|------|-----|-----|
| **连接方式** | 无连接，直接发送 | 面向连接，需三次握手 |
| **可靠性** | 不保证送达，不重传 | 保证送达，自动重传 |
| **顺序性** | 不保证顺序 | 严格按发送顺序到达 |
| **数据边界** | 有边界（数据报模型） | 无边界（字节流模型） |
| **头部开销** | 8 字节 | 20 字节（最小） |
| **传输速度** | 快（无握手、无重传） | 较慢（握手、确认、重传） |
| **流量控制** | 无 | 有（滑动窗口） |
| **拥塞控制** | 无 | 有（慢启动、拥塞避免） |
| **一对多** | 支持广播、组播 | 只能一对一 |
| **应用场景** | DNS、DHCP、视频流、游戏、IoT | HTTP、SSH、SMTP、文件传输 |

### 2.1 什么时候选 UDP？

1. **实时性要求高**：视频会议、在线游戏——偶尔丢包好过等待重传
2. **查询-响应模式**：DNS 查询——一问一答，建连接太浪费
3. **广播/组播需求**：服务发现、局域网通知——TCP 不支持一对多
4. **海量连接**：IoT 传感器上报——维护 TCP 状态太耗资源
5. **短消息**：心跳包、位置更新——数据量小，可靠性由应用层保证

## 三、UDP 的工作流程

### 3.1 服务器端流程

\`\`\`python
import socket

# 1. 创建 UDP socket（SOCK_DGRAM 表示数据报）
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 2. 绑定地址和端口
sock.bind(("127.0.0.1", 9999))

# 3. 接收数据（阻塞，直到有数据到达）
data, addr = sock.recvfrom(1024)  # 返回 (数据, 发送方地址)

# 4. 发送响应
sock.sendto(b"reply", addr)

# 5. 关闭
sock.close()
\`\`\`

> **注意**：UDP 服务器不需要 \`listen()\` 和 \`accept()\`！这是和 TCP 最大的区别之一。UDP 是无连接的，服务器只要 bind 后就能直接 recvfrom 接收任何客户端发来的数据。

### 3.2 客户端流程

\`\`\`python
import socket

# 1. 创建 UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 2. 直接发送数据（不需要 connect！）
sock.sendto(b"hello", ("127.0.0.1", 9999))

# 3. 接收响应
data, addr = sock.recvfrom(1024)

# 4. 关闭
sock.close()
\`\`\`

> UDP 客户端**不需要 connect()**，直接用 \`sendto(data, address)\` 指定目标地址即可。这是"无连接"的体现。

### 3.3 流程对比图

\`\`\`
UDP 服务器                          UDP 客户端
    │                                   │
    │  socket()  创建套接字              │  socket()  创建套接字
    │  bind()    绑定端口                │
    │                                   │
    │  ←──── recvfrom() 等待数据 ────────│  sendto()  发送数据报
    │                                   │
    │  sendto()  回发响应                │  recvfrom() 等待响应
    │  ─────────────────────────────→   │
    │                                   │
    │  close()                          │  close()

TCP 对比（需要握手）：
    │  socket()                         │  socket()
    │  bind()                           │
    │  listen()  ←── 监听               │
    │  accept()  ←── 三次握手 ──────────│  connect()
    │                                   │
    │  recv()    ←── 数据 ──────────────│  send()
    │  send()    ─── 响应 → ────────────│  recv()
    │  close()                          │  close()
\`\`\`

## 四、核心 API 详解

### 4.1 recvfrom(bufsize)

\`\`\`python
data, addr = sock.recvfrom(1024)
# data: bytes 类型，收到的数据
# addr: 元组 (ip, port)，发送方地址
# bufsize: 最多接收的字节数，建议 1024 或 2048
\`\`\`

\`recvfrom\` 是阻塞的——如果没有数据到达，它会一直等。在生产环境务必设置超时：

\`\`\`python
sock.settimeout(1.0)  # 1 秒超时
try:
    data, addr = sock.recvfrom(1024)
except socket.timeout:
    print("超时，没有收到数据")
\`\`\`

### 4.2 sendto(data, addr)

\`\`\`python
n = sock.sendto(b"hello", ("127.0.0.1", 9999))
# n: 实际发送的字节数
# data: bytes 类型，要发送的数据
# addr: 元组 (ip, port)，目标地址
\`\`\`

> \`sendto\` 成功返回只意味着数据已经交给操作系统发送，**不代表对方收到**。这是 UDP 不可靠的根源。

### 4.3 常用 socket 选项

| 方法 | 作用 |
|------|------|
| \`sock.settimeout(seconds)\` | 设置超时，避免永久阻塞 |
| \`sock.setsockopt(level, name, value)\` | 设置 socket 选项 |
| \`sock.getsockname()\` | 获取本端地址 (ip, port) |
| \`sock.fileno()\` | 获取文件描述符 |

## 五、UDP 的典型应用场景

### 5.1 DNS（域名解析）

DNS 是 UDP 最经典的应用。客户端发一个查询包（"example.com 的 IP 是？"），服务器返回一个响应包。一问一答，不需要维持连接，效率极高。

\`\`\`bash
# DNS 默认使用 UDP 端口 53
dig example.com    # 底层用 UDP 查询
\`\`\`

### 5.2 DHCP（动态主机配置）

设备接入网络时，用 UDP 广播发送 DHCP Discover 包寻找 DHCP 服务器。广播特性使 UDP 成为 DHCP 的必然选择。

### 5.3 实时音视频

Zoom、微信视频通话等用 UDP 传输音视频流。丢一帧画面只是闪一下，但如果用 TCP 重传等待，画面会卡顿——实时性比可靠性更重要。

### 5.4 在线游戏

游戏中的位置同步、状态更新用 UDP。玩家位置每秒更新几十次，丢一个更新包无所谓（下一个马上就来），但延迟会让游戏体验极差。

### 5.5 IoT 物联网

海量传感器每秒上报数据，TCP 维护连接状态太耗资源。UDP 轻量无状态，更适合海量终端。

## 六、本章节代码演示说明

下面的代码演示 UDP 的基本通信流程：

1. 创建 UDP socket（\`SOCK_DGRAM\`）
2. 服务器 bind 到 127.0.0.1，线程内 recvfrom 等待
3. 客户端 sendto 发送消息（无需 connect）
4. 服务器收到后打印 (data, addr)，再 sendto 回发响应
5. 客户端 recvfrom 接收响应
6. 演示 UDP 的无连接特性

> 💡 所有代码用 127.0.0.1 回环地址，设置 1 秒超时，确保 5 秒内完成。点击"运行代码"实际体验 UDP 通信！`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第一章代码演示：UDP 基础通信
# ------------------------------------------------------------
# 演示内容：
#   1. 创建 UDP socket（SOCK_DGRAM）
#   2. 服务器 bind + recvfrom 等待数据
#   3. 客户端 sendto 发送（无需 connect）
#   4. 服务器回发响应，客户端接收
#   5. 演示 UDP 无连接特性
# 约束：全部用 127.0.0.1 回环地址，settimeout 避免阻塞
# ============================================================
import socket        # Python 标准库网络模块
import threading     # 线程模块，用于在后台运行服务器
import time          # 时间模块，用于 sleep 同步

print("=" * 60)
print("UDP 基础通信演示")
print("=" * 60)

# ------------------------------------------------------------
# 第一步：创建 UDP 服务器 socket
# ------------------------------------------------------------
# AF_INET = IPv4 地址族
# SOCK_DGRAM = 数据报套接字（UDP），对比 TCP 用 SOCK_STREAM
server_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# bind 到 127.0.0.1，端口填 0 让操作系统自动分配可用端口
server_sock.bind(("127.0.0.1", 0))

# 获取系统分配的实际端口
server_port = server_sock.getsockname()[1]
print(f"[服务器] 已绑定 127.0.0.1:{server_port} (UDP)")

# 设置 1 秒超时，防止 recvfrom 永久阻塞
server_sock.settimeout(1.0)

# ------------------------------------------------------------
# 第二步：定义服务器线程函数
# ------------------------------------------------------------
# UDP 服务器不需要 listen() 和 accept()，bind 后直接 recvfrom
def udp_server():
    """服务器线程：等待接收客户端数据，然后回发响应"""
    try:
        # recvfrom(bufsize) 阻塞等待，返回 (data, addr)
        # data 是 bytes 类型，addr 是 (ip, port) 元组
        data, client_addr = server_sock.recvfrom(1024)
        print(f"[服务器] 收到来自 {client_addr} 的数据: {data.decode('utf-8')}")

        # 用 sendto 回发响应给客户端
        reply = "Hello from UDP server! 你好".encode("utf-8")
        server_sock.sendto(reply, client_addr)
        print(f"[服务器] 已向 {client_addr} 发送响应")
    except socket.timeout:
        print("[服务器] 等待数据超时（1 秒内无数据到达）")

# 在后台线程启动服务器
server_thread = threading.Thread(target=udp_server, daemon=True)
server_thread.start()

# 等待服务器就绪
time.sleep(0.1)

# ------------------------------------------------------------
# 第三步：客户端发送数据
# ------------------------------------------------------------
print("\\n[客户端] 开始发送数据...")

# 创建客户端 UDP socket
client_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client_sock.settimeout(1.0)  # 客户端也设置超时

# UDP 无连接：不需要 connect()，直接 sendto 指定目标地址
message = "Hello UDP Server! 这是客户端的消息"
client_sock.sendto(message.encode("utf-8"), ("127.0.0.1", server_port))
print(f"[客户端] 已发送: {message}")
print(f"[客户端] 目标地址: 127.0.0.1:{server_port}")

# ------------------------------------------------------------
# 第四步：客户端接收服务器响应
# ------------------------------------------------------------
try:
    # recvfrom 接收服务器回发的响应
    data, server_addr = client_sock.recvfrom(1024)
    print(f"\\n[客户端] 收到来自 {server_addr} 的响应: {data.decode('utf-8')}")
except socket.timeout:
    print("[客户端] 接收响应超时")

# 等待服务器线程结束
server_thread.join(timeout=1.0)

# ------------------------------------------------------------
# 第五步：演示 UDP 无连接特性
# ------------------------------------------------------------
print("\\n" + "-" * 60)
print("[演示] UDP 无连接特性：可随时向不同地址发送")
print("-" * 60)

# 同一个 socket 可以向不同地址发送数据（无需重新连接）
# 这里我们向同一个服务器的另一个端口发送（模拟）
test_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
test_sock.settimeout(0.5)

# 向一个不存在的端口发送（UDP 不会报错，因为不需要建立连接）
# sendto 成功只代表数据已发出，不代表对方收到
test_sock.sendto(b"ping", ("127.0.0.1", 59999))  # 59999 大概率没人监听
print("[演示] 向未监听端口发送 UDP 包 -> sendto 成功返回（不报错）")
print("       这体现了 UDP 的'发了就不管'特性")
test_sock.close()

# ------------------------------------------------------------
# 清理资源
# ------------------------------------------------------------
client_sock.close()
server_sock.close()

# ------------------------------------------------------------
# 小结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("[本章小结]")
print("=" * 60)
print("1. UDP 用 SOCK_DGRAM 创建 socket，TCP 用 SOCK_STREAM")
print("2. UDP 服务器: socket() -> bind() -> recvfrom()/sendto() -> close()")
print("3. UDP 客户端: socket() -> sendto()/recvfrom() -> close()")
print("4. UDP 不需要 listen() 和 accept()（无连接）")
print("5. sendto(data, addr) 发送，recvfrom() 返回 (data, addr)")
print("6. sendto 成功不保证送达，UDP 是不可靠协议")
print("7. 务必用 settimeout() 防止永久阻塞")`,
  },

  // ============================================================
  // 第二章：UDP echo 实战
  // ============================================================
  {
    id: "py-udp-echo",
    group: "UDP 编程",
    icon: "🔁",
    title: "UDP echo 实战",
    content: `## 一、什么是 echo 协议

echo（回显）是网络编程中最经典的练习协议，定义于 RFC 862。它的规则极其简单：**服务器把收到的任何数据原样返回**。你发"hello"，服务器就回"hello"；你发"123"，服务器就回"123"。

虽然简单，echo 协议却是学习网络编程的最佳起点，因为它涵盖了"收-处理-发"的完整通信循环，又不需要处理复杂的业务逻辑。掌握 echo 服务器后，把"原样返回"换成"按业务处理再返回"，就是真实的业务服务器了。

### 1.1 UDP echo vs TCP echo

| 维度 | UDP echo | TCP echo |
|------|----------|----------|
| **消息边界** | 天然有边界，一次 sendto = 一次 recvfrom | 字节流，无边界，需自行分帧 |
| **粘包问题** | 不存在 | 存在，需自定义分隔符或长度前缀 |
| **丢包处理** | 可能丢失，服务器收不到就不回 | TCP 保证送达 |
| **并发支持** | 天然支持多客户端（无连接） | 需多线程或多路复用 |
| **代码复杂度** | 简单 | 较复杂（需处理粘包） |

### 1.2 为什么 UDP 没有"粘包"问题？

这是 UDP 和 TCP 最本质的区别之一：

- **TCP 是字节流**：数据没有边界，发送方连续 send 两次"hello"和"world"，接收方可能一次 recv 收到"helloworld"，也可能收到"hel"和"loworld"——完全取决于 TCP 缓冲区。这就是"粘包"。

- **UDP 是数据报**：每个 sendto 对应一个独立的数据报，接收方一次 recvfrom 正好收到一个完整的数据报。发 3 次，收 3 次，一一对应，永远不存在粘包。

\`\`\`
TCP 字节流（无边界）：
  发送: [hello][world]  →  网络上: helloworld
  接收: 可能 [helloworld] 或 [hel][loworld] 或 [hello][world]

UDP 数据报（有边界）：
  发送: sendto("hello") sendto("world")
  接收: recvfrom() → "hello"   recvfrom() → "world"
  一定是一一对应的！
\`\`\`

## 二、UDP 的三大可靠性问题

UDP 不可靠，具体体现在三个方面。在实际应用中，如果需要可靠性，应用层必须自行处理。

### 2.1 丢包问题

\`\`\`
客户端                     服务器
  │  sendto("msg1")          │
  │ ─────────────────────→   │  (网络拥堵，包丢了)
  │                          │  服务器根本没收到
  │  recvfrom() 等待响应...   │
  │  (永远等不到，超时)        │
\`\`\`

\`sendto\` 返回成功只代表数据交给了操作系统，数据可能在网络任何环节丢失：路由器拥堵、网卡缓冲区满、接收方处理不过来。**UDP 没有任何重传机制**。

### 2.2 乱序问题

\`\`\`
客户端                     服务器
  │  sendto("A")             │
  │  sendto("B")             │
  │  sendto("C")             │
  │                          │
  │  网络中 A 走了慢路线      │
  │  B 和 C 走了快路线        │
  │                          │
  │           recvfrom() → B │  先收到 B
  │           recvfrom() → C │  再收到 C
  │           recvfrom() → A │  最后收到 A
\`\`\`

UDP 不保证顺序。先发的可能后到，后发的可能先到。如果应用层依赖顺序（比如文件分片传输），必须自己在数据中加序号，接收方排序。

### 2.3 数据报大小限制

UDP 数据报有大小限制，受底层 MTU（最大传输单元）约束：

| 层级 | MTU | 说明 |
|------|-----|------|
| 以太网 | 1500 字节 | 最常见的局域网 MTU |
| IP 头部 | 20 字节 | IPv4 固定头部 |
| UDP 头部 | 8 字节 | 源端口+目的端口+长度+校验和 |
| **UDP 数据上限** | **1472 字节** | 1500 - 20 - 8 |

> **建议**：实际应用中 UDP 数据报建议控制在 **512 字节以内**，这样能兼容各种网络环境（包括 PPPoE、VPN 等会减小 MTU 的场景）。超过 MTU 的数据报会被 IP 层分片，分片一旦丢失一个，整个数据报都会被丢弃。

### 2.4 如果需要可靠 UDP 怎么办？

应用层自行实现可靠机制：
- **序号+确认**：发送方给每个包编号，接收方回 ACK
- **超时重传**：发送方启动定时器，超时未收到 ACK 就重发
- **序号排序**：接收方按序号重组数据

现实中的可靠 UDP 实现：QUIC（HTTP/3 底层）、KCP（游戏加速）、TFTP（简单文件传输）。

## 三、多客户端并发

UDP 天然支持多客户端——因为无连接，服务器不需要为每个客户端维护连接状态。一个 recvfrom 可以接收任何客户端发来的数据，\`addr\` 标识了发送方。

\`\`\`python
while True:
    data, addr = sock.recvfrom(1024)  # 任何客户端的数据都能收到
    print(f"来自 {addr}: {data}")
    sock.sendto(data, addr)  # 回发给对应的客户端
\`\`\`

对比 TCP：每个客户端需要 accept 一次，通常要开线程或用 select 处理。

## 四、UDP echo 服务器设计

### 4.1 服务器端

\`\`\`python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("0.0.0.0", 9999))
sock.settimeout(1.0)

count = 0
while count < 10:  # 处理 10 条消息后退出
    try:
        data, addr = sock.recvfrom(1024)
        sock.sendto(data, addr)  # 原样返回
        count += 1
    except socket.timeout:
        break

sock.close()
\`\`\`

### 4.2 客户端

\`\`\`python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(1.0)

for msg in ["hello", "world", "echo"]:
    sock.sendto(msg.encode(), ("127.0.0.1", 9999))
    data, _ = sock.recvfrom(1024)  # 收到回显
    print(f"发送: {msg}, 回显: {data.decode()}")

sock.close()
\`\`\`

### 4.3 消息边界验证

下面的演示验证 UDP 的消息边界特性：发送 3 次，接收 3 次，一一对应：

\`\`\`
发送: sendto("A") sendto("B") sendto("C")
接收: recvfrom()="A"  recvfrom()="B"  recvfrom()="C"
     ↑ 不会出现 recvfrom()="AB" 这种粘包情况
\`\`\`

## 五、本章节代码演示说明

代码演示以下内容：

1. **UDP echo 服务器**：线程内循环 recvfrom + sendto 回发
2. **客户端发送 3 条消息**：逐条收到回显，验证消息边界
3. **超时演示**：settimeout 后 recvfrom 超时抛异常
4. **与 TCP 粘包对比**：说明 UDP 无此问题

> 💡 重点关注"3 次 sendto 对应 3 次 recvfrom"，这就是 UDP 数据报边界的有力证明。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第二章代码演示：UDP echo 实战
# ------------------------------------------------------------
# 演示内容：
#   1. UDP echo 服务器（线程内循环 recvfrom + sendto 回发）
#   2. 客户端发送 3 条消息，逐条 recvfrom 回显
#   3. 验证 UDP 消息边界（3 次 sendto = 3 次 recvfrom）
#   4. 演示 settimeout 超时机制
#   5. 对比 TCP 粘包问题
# ============================================================
import socket
import threading
import time

print("=" * 60)
print("UDP echo 实战演示")
print("=" * 60)

# ------------------------------------------------------------
# 第一步：创建 UDP echo 服务器
# ------------------------------------------------------------
server_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_sock.bind(("127.0.0.1", 0))  # 端口 0 让系统分配
server_port = server_sock.getsockname()[1]
server_sock.settimeout(1.0)  # 1 秒超时
print(f"[echo 服务器] 监听 127.0.0.1:{server_port} (UDP)")

# echo 服务器逻辑：循环接收并原样回发
def echo_server():
    """UDP echo 服务器：收到什么就回什么"""
    msg_count = 0
    # 处理 3 条消息后退出（不能用 while True，否则永久阻塞）
    while msg_count < 3:
        try:
            # recvfrom 阻塞等待，超时则抛 socket.timeout
            data, client_addr = server_sock.recvfrom(1024)
            msg_count += 1
            decoded = data.decode("utf-8")
            print(f"  [服务器] 收到 #{msg_count}: '{decoded}' 来自 {client_addr}")

            # echo 核心：原样返回收到的数据
            server_sock.sendto(data, client_addr)
            print(f"  [服务器] 已回显 #{msg_count}: '{decoded}'")

        except socket.timeout:
            # 超时退出循环
            print(f"  [服务器] 等待超时（已处理 {msg_count} 条）")
            break

# 后台线程启动服务器
server_thread = threading.Thread(target=echo_server, daemon=True)
server_thread.start()
time.sleep(0.1)  # 等服务器就绪

# ------------------------------------------------------------
# 第二步：客户端发送 3 条消息并接收回显
# ------------------------------------------------------------
print("\\n[客户端] 发送 3 条消息，验证消息边界...")
print("-" * 60)

client_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client_sock.settimeout(1.0)

messages = ["Hello", "世界", "UDP Echo Test"]

for i, msg in enumerate(messages, 1):
    # 发送数据报
    client_sock.sendto(msg.encode("utf-8"), ("127.0.0.1", server_port))
    print(f"  [客户端] 发送 #{i}: '{msg}'")

    # 接收回显 —— 注意：一次 sendto 严格对应一次 recvfrom
    try:
        data, _ = client_sock.recvfrom(1024)
        echo = data.decode("utf-8")
        print(f"  [客户端] 回显 #{i}: '{echo}'")
    except socket.timeout:
        print(f"  [客户端] 等待回显 #{i} 超时")

# 等服务器处理完
server_thread.join(timeout=1.0)

# ------------------------------------------------------------
# 第三步：验证 UDP 消息边界（无粘包）
# ------------------------------------------------------------
print("\\n" + "-" * 60)
print("[验证] UDP 消息边界：3 次 sendto 严格对应 3 次 recvfrom")
print("-" * 60)
print("  发送: sendto('Hello')  sendto('世界')  sendto('UDP Echo Test')")
print("  接收: recvfrom()='Hello'  recvfrom()='世界'  recvfrom()='UDP Echo Test'")
print("  结论: 每条消息独立成包，绝不会出现 'Hello世界' 这种粘包")
print("  对比: TCP 是字节流，连续 send 两次可能一次 recv 全收到（粘包）")

# ------------------------------------------------------------
# 第四步：演示 recvfrom 超时
# ------------------------------------------------------------
print("\\n" + "-" * 60)
print("[演示] recvfrom 超时机制")
print("-" * 60)

# 设置很短的超时
client_sock.settimeout(0.3)  # 0.3 秒
print("  设置 timeout=0.3 秒，此时无人发送数据...")
try:
    client_sock.recvfrom(1024)
    print("  收到了数据（不应该发生）")
except socket.timeout:
    print("  ✓ recvfrom 超时，抛出 socket.timeout 异常")
    print("  说明：生产环境必须设置超时，否则永久阻塞！")

# ------------------------------------------------------------
# 第五步：多客户端并发演示
# ------------------------------------------------------------
print("\\n" + "-" * 60)
print("[演示] UDP 天然支持多客户端（无需多线程）")
print("-" * 60)

# 再启动一个 echo 服务器处理多个客户端
multi_server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
multi_server.bind(("127.0.0.1", 0))
multi_port = multi_server.getsockname()[1]
multi_server.settimeout(1.0)

def multi_echo():
    """处理多个客户端的数据"""
    clients_seen = set()
    while len(clients_seen) < 2:
        try:
            data, addr = multi_server.recvfrom(1024)
            clients_seen.add(addr)
            multi_server.sendto(b"ACK:" + data, addr)
        except socket.timeout:
            break

t = threading.Thread(target=multi_echo, daemon=True)
t.start()
time.sleep(0.1)

# 两个客户端向同一个服务器发送
c1 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
c1.settimeout(1.0)
c2 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
c2.settimeout(1.0)

c1.sendto(b"client1-msg", ("127.0.0.1", multi_port))
c2.sendto(b"client2-msg", ("127.0.0.1", multi_port))

r1, _ = c1.recvfrom(1024)
r2, _ = c2.recvfrom(1024)
print(f"  客户端1 收到: {r1.decode()}")
print(f"  客户端2 收到: {r2.decode()}")
print("  说明: UDP 服务器一个 recvfrom 就能接收任意客户端的数据")

t.join(timeout=1.0)

# ------------------------------------------------------------
# 清理资源
# ------------------------------------------------------------
client_sock.close()
multi_server.close()
c1.close()
c2.close()
server_sock.close()

# ------------------------------------------------------------
# 小结
# ------------------------------------------------------------
print("\\n" + "=" * 60)
print("[本章小结]")
print("=" * 60)
print("1. UDP echo: 服务器把收到的数据原样返回（RFC 862）")
print("2. UDP 有消息边界：N 次 sendto 对应 N 次 recvfrom，无粘包")
print("3. TCP 是字节流，有粘包问题；UDP 是数据报，无此问题")
print("4. sendto 成功不保证送达——UDP 可能丢包")
print("5. 务必 settimeout()，避免 recvfrom 永久阻塞")
print("6. UDP 天然支持多客户端（无连接，一个 recvfrom 接收所有）")`,
  },

  // ============================================================
  // 第三章：UDP 广播
  // ============================================================
  {
    id: "py-udp-broadcast",
    group: "UDP 编程",
    icon: "📢",
    title: "UDP 广播",
    content: `## 一、什么是广播

广播（Broadcast）是 UDP 独有的能力——**一条消息发给局域网内的所有设备**。TCP 只能一对一通信，无法广播。这个特性让 UDP 在服务发现、局域网通知等场景不可替代。

想象走进一个会议室喊一声"谁是管理员？"——所有人都能听到，只有管理员会回应。这就是广播的本质。

### 1.1 广播地址的类型

| 类型 | 地址 | 范围 | 说明 |
|------|------|------|------|
| **受限广播** | \`255.255.255.255\` | 当前局域网 | 路由器不转发，只在本地网段传播 |
| **子网广播** | 如 \`192.168.1.255\` | 特定子网 | 针对特定子网的所有主机 |
| **回环广播** | \`127.255.255.255\` | 本机回环 | 仅本机可见，用于测试 |

### 1.2 子网广播地址的计算

子网广播地址 = 网络号部分照写，主机号部分全填 1。

\`\`\`
子网: 192.168.1.0/24
网络号: 192.168.1   主机号: 0~255
广播地址: 192.168.1.255  (主机号全1)

子网: 10.0.0.0/16
网络号: 10.0         主机号: 0.0~255.255
广播地址: 10.0.255.255
\`\`\`

### 1.3 广播的用途

1. **服务发现**：DHCP 客户端用广播寻找 DHCP 服务器
2. **ARP 解析**：把 IP 解析为 MAC 地址（链路层广播）
3. **局域网通知**：向所有设备推送消息
4. **设备搜索**：扫描局域网内的智能设备（如打印机、摄像头）

\`\`\`bash
# DHCP Discover 就是广播
客户端 → 255.255.255.255:67 → "谁是 DHCP 服务器？"
DHCP服务器 → 客户端:68 → "我是，这是你的 IP"
\`\`\`

## 二、发送广播的编程步骤

### 2.1 必须设置 SO_BROADCAST 选项

默认情况下，操作系统禁止发送广播（防止误操作）。必须显式开启：

\`\`\`python
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# 开启广播权限！不设置会报 PermissionError
sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sock.sendto(b"hello", ("255.255.255.255", 9999))
\`\`\`

> **关键**：忘记 \`setsockopt(SO_BROADCAST, 1)\` 会导致 \`PermissionError: [Errno 13] Permission denied\`。

### 2.2 发送广播

\`\`\`python
# 方式一：用 '<broadcast>' 特殊地址（Python 解析为 255.255.255.255）
sock.sendto(data, ("<broadcast>", port))

# 方式二：直接用 255.255.255.255
sock.sendto(data, ("255.255.255.255", port))

# 方式三：用子网广播地址
sock.sendto(data, ("192.168.1.255", port))
\`\`\`

### 2.3 接收广播

接收端不需要特殊设置，正常 bind + recvfrom 即可。但要注意：

- **bind 到 0.0.0.0** 才能接收广播（bind 到具体 IP 可能收不到）
- 端口必须和广播的目标端口一致

\`\`\`python
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.bind(("0.0.0.0", 9999))  # 监听所有网卡
data, addr = sock.recvfrom(1024)
\`\`\`

## 三、组播（Multicast）

广播是"发给所有人"，组播是"发给一组人"——更精确、更省带宽。

### 3.1 组播地址

组播使用 D 类 IP 地址：\`224.0.0.0 ~ 239.255.255.255\`

| 地址范围 | 用途 |
|----------|------|
| \`224.0.0.0/24\` | 链路本地（路由器不转发） |
| \`224.0.1.0 ~ 238.255.255.255\` | 全球可路由组播 |
| \`239.0.0.0/8\` | 管理权限范围（私有组播） |

常见组播地址：
- \`224.0.0.1\` — 所有主机（本子网所有设备）
- \`224.0.0.2\` — 所有路由器
- \`224.0.0.251\` — mDNS（组播 DNS，用于服务发现）

### 3.2 加入组播组

接收组播必须先"加入组"，通过 IGMP（Internet Group Management Protocol）通知网络：

\`\`\`python
import socket
import struct

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# 允许端口复用
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.bind(("0.0.0.0", 9999))

# 加入组播组 224.0.0.1
mreq = struct.pack("4sl", socket.inet_aton("224.0.0.1"), socket.INADDR_ANY)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

data, addr = sock.recvfrom(1024)  # 现在能收到发往 224.0.0.1 的数据
\`\`\`

\`struct.pack("4sl", ...)\` 的含义：
- \`4s\`：4 字节组播组 IP 地址
- \`l\`：4 字节本地接口地址（\`INADDR_ANY\` = 0.0.0.0 = 所有接口）

## 四、广播 vs 组播 vs 单播

| 维度 | 单播 (Unicast) | 广播 (Broadcast) | 组播 (Multicast) |
|------|---------------|-----------------|-----------------|
| **接收方** | 一个特定主机 | 局域网所有主机 | 加入组的一组主机 |
| **地址** | 普通 IP | 255.255.255.255 | 224.0.0.0/4 |
| **带宽** | 每个接收方一份流量 | 局域网一份流量 | 组内一份流量 |
| **跨网段** | 支持 | 不支持（路由器不转发） | 支持（需组播路由） |
| **选择性** | 精确 | 无差别 | 按组选择 |
| **典型应用** | HTTP、SSH | DHCP、ARP | 视频会议、IPTV |

### 4.1 广播的限制

1. **路由器不转发广播**：广播只在本地局域网内有效，跨网段无效
2. **影响性能**：广播包会中断局域网内每台设备的 CPU（网卡收到后要交给协议栈判断）
3. **安全风险**：任何人都能监听广播，不适合传敏感数据
4. **IPv6 无广播**：IPv6 用组播替代了广播

## 五、广播实战场景

### 5.1 局域网设备发现

\`\`\`python
# 客户端广播 "谁在？"
sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
sock.sendto(b"DISCOVER", ("255.255.255.255", 9999))

# 各设备回应自己的信息
# 设备A → 客户端: "我是设备A，IP=192.168.1.10"
# 设备B → 客户端: "我是设备B，IP=192.168.1.11"
\`\`\`

### 5.2 DHCP 工作流程

\`\`\`
1. DHCP Discover  (客户端 → 255.255.255.255:67)  广播找服务器
2. DHCP Offer     (服务器 → 客户端:68)           单播/广播回应
3. DHCP Request   (客户端 → 255.255.255.255:67)  广播确认选择
4. DHCP Ack       (服务器 → 客户端:68)           确认分配 IP
\`\`\`

## 六、本章节代码演示说明

代码演示：

1. **设置 SO_BROADCAST 选项**发送广播
2. **接收端 bind 到 0.0.0.0** 接收广播
3. **组播演示**：加入 224.0.0.1 组播组
4. 所有操作用 try/except 处理系统差异

> 💡 广播行为受操作系统和网络环境影响，回环地址上的广播可能与真实局域网不同。代码用 127.255.255.255 测试，并做好异常处理。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第三章代码演示：UDP 广播与组播
# ------------------------------------------------------------
# 演示内容：
#   1. 设置 SO_BROADCAST 选项发送广播
#   2. 接收端 bind 0.0.0.0 接收广播
#   3. 组播：加入 224.0.0.1 组播组（IGMP）
#   4. 广播 vs 组播 vs 单播对比
# 注意：广播行为受系统限制，用 try/except 处理
# ============================================================
import socket
import struct      # 用于打包组播成员关系数据
import threading
import time

print("=" * 60)
print("UDP 广播与组播演示")
print("=" * 60)

# ============================================================
# 第一部分：UDP 广播演示
# ============================================================
print("\\n[第一部分] UDP 广播")
print("-" * 60)

# ------------------------------------------------------------
# 创建广播接收端
# ------------------------------------------------------------
# 接收广播必须 bind 到 0.0.0.0（所有网卡）
# 如果 bind 到具体 IP，可能收不到广播包
recv_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
recv_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
recv_sock.bind(("0.0.0.0", 0))  # 端口 0 让系统分配
bcast_port = recv_sock.getsockname()[1]
recv_sock.settimeout(1.0)
print(f"[接收端] 绑定 0.0.0.0:{bcast_port}")

# 接收线程
broadcast_received = False
def recv_broadcast():
    """接收广播消息的线程"""
    global broadcast_received
    try:
        data, addr = recv_sock.recvfrom(1024)
        print(f"  [接收端] 收到广播: {data.decode('utf-8')} 来自 {addr}")
        broadcast_received = True
    except socket.timeout:
        print("  [接收端] 等待广播超时")

recv_thread = threading.Thread(target=recv_broadcast, daemon=True)
recv_thread.start()
time.sleep(0.1)  # 等接收端就绪

# ------------------------------------------------------------
# 创建广播发送端
# ------------------------------------------------------------
bcast_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 关键：必须设置 SO_BROADCAST 才能发送广播！
# 不设置会报 PermissionError
bcast_sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
bcast_sock.settimeout(1.0)
print("[发送端] 已设置 SO_BROADCAST 选项")

# 发送广播消息
# 127.255.255.255 是回环广播地址（仅本机可见，适合测试）
# 实际局域网用 255.255.255.255 或子网广播如 192.168.1.255
broadcast_msg = "广播通知：这是一条广播消息！"
try:
    bcast_sock.sendto(broadcast_msg.encode("utf-8"), ("127.255.255.255", bcast_port))
    print(f"[发送端] 已发送广播到 127.255.255.255:{bcast_port}")
    print(f"         消息内容: {broadcast_msg}")
except OSError as e:
    # 某些系统可能限制回环广播
    print(f"[发送端] 广播发送失败（系统可能限制）: {e}")

# 等接收完成
recv_thread.join(timeout=1.0)

# 演示未设置 SO_BROADCAST 的后果
print("\\n[对比] 不设置 SO_BROADCAST 发送广播会怎样？")
test_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    # 不设置 SO_BROADCAST 直接发广播
    test_sock.sendto(b"test", ("255.255.255.255", bcast_port))
    print("  发送成功（部分系统允许，但不推荐）")
except PermissionError:
    print("  PermissionError: 需要设置 SO_BROADCAST 选项！")
except OSError as e:
    print(f"  发送失败: {e}")
test_sock.close()

bcast_sock.close()
recv_sock.close()

# ============================================================
# 第二部分：UDP 组播演示
# ============================================================
print("\\n[第二部分] UDP 组播（Multicast）")
print("-" * 60)

# 组播地址范围: 224.0.0.0 ~ 239.255.255.255 (D类IP)
# 224.0.0.1 是"所有主机组"，本子网所有设备默认属于该组
MCAST_GROUP = "224.0.0.1"
MCAST_PORT = 0  # 系统分配

# ------------------------------------------------------------
# 创建组播接收端
# ------------------------------------------------------------
mcast_recv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
mcast_recv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
mcast_recv.bind(("0.0.0.0", 0))
mcast_port = mcast_recv.getsockname()[1]
mcast_recv.settimeout(1.0)

# 加入组播组 —— 这是组播接收的关键步骤
# 通过 IGMP 协议告诉网络"我要加入这个组"
try:
    # struct.pack 打包组播组成员关系
    # "4sl" 格式: 4字节IP地址 + 4字节(long)本地接口地址
    # INADDR_ANY = 0.0.0.0 表示在所有接口上加入
    mreq = struct.pack("4sl", socket.inet_aton(MCAST_GROUP), socket.INADDR_ANY)
    mcast_recv.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
    print(f"[组播接收端] 已加入组播组 {MCAST_GROUP}, 端口 {mcast_port}")
    mcast_ok = True
except OSError as e:
    print(f"[组播接收端] 加入组播组失败: {e}")
    print("  (回环环境或系统限制可能不支持，跳过组播收发)")
    mcast_ok = False

# ------------------------------------------------------------
# 组播接收线程 + 发送
# ------------------------------------------------------------
if mcast_ok:
    mcast_received = False

    def recv_mcast():
        global mcast_received
        try:
            data, addr = mcast_recv.recvfrom(1024)
            print(f"  [组播接收] 收到: {data.decode('utf-8')} 来自 {addr}")
            mcast_received = True
        except socket.timeout:
            print("  [组播接收] 等待超时")

    t = threading.Thread(target=recv_mcast, daemon=True)
    t.start()
    time.sleep(0.1)

    # 发送组播
    mcast_send = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    mcast_send.settimeout(1.0)

    # 设置 TTL（生存时间），控制组播传播范围
    # TTL=1 表示只在本地子网传播
    mcast_send.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 1)

    msg = f"组播消息 -> {MCAST_GROUP}"
    try:
        mcast_send.sendto(msg.encode("utf-8"), (MCAST_GROUP, mcast_port))
        print(f"[组播发送端] 已发送到 {MCAST_GROUP}:{mcast_port}")
    except OSError as e:
        print(f"[组播发送端] 发送失败: {e}")

    t.join(timeout=1.0)
    mcast_send.close()

mcast_recv.close()

# ============================================================
# 第三部分：三种通信方式对比
# ============================================================
print("\\n[第三部分] 三种通信方式对比")
print("-" * 60)
print(f"{'方式':<8} {'接收方':<16} {'地址':<20} {'跨网段':<8} {'典型应用'}")
print(f"{'单播':<8} {'一个主机':<16} {'192.168.1.10':<20} {'支持':<8} HTTP/SSH")
print(f"{'广播':<8} {'局域网所有':<16} {'255.255.255.255':<20} {'不支持':<8} DHCP/ARP")
print(f"{'组播':<8} {'组内成员':<16} {'224.0.0.1':<20} {'支持':<8} 视频会议/mDNS")

# ============================================================
# 小结
# ============================================================
print("\\n" + "=" * 60)
print("[本章小结]")
print("=" * 60)
print("1. 广播: 一条消息发给局域网所有设备（UDP 独有，TCP 不支持）")
print("2. 发送广播必须 setsockopt(SO_BROADCAST, 1)")
print("3. 接收广播需 bind('0.0.0.0', port)，不能 bind 具体 IP")
print("4. 255.255.255.255 受限广播，路由器不转发")
print("5. 组播: 一对多，需 IP_ADD_MEMBERSHIP 加入组（224.0.0.0/4）")
print("6. 广播 vs 组播: 广播无差别，组播有选择性更省带宽")
print("7. IPv6 已废弃广播，全部用组播替代")`,
  },

  // ============================================================
  // 第四章：HTTP 协议基础
  // ============================================================
  {
    id: "py-http-basics",
    group: "HTTP",
    icon: "📄",
    title: "HTTP 协议基础",
    content: `## 一、什么是 HTTP

HTTP（HyperText Transfer Protocol，超文本传输协议）是互联网上最重要的应用层协议。每次你打开网页、刷短视频、用手机 App 联网，背后几乎都有 HTTP 在工作。它基于 TCP（可靠传输），采用请求-响应模型：客户端发请求，服务器回响应。

### 1.1 HTTP 的基本特征

| 特征 | 说明 |
|------|------|
| **基于 TCP** | 底层用 TCP 保证可靠传输（HTTP/3 改用 UDP+QUIC） |
| **请求-响应** | 一问一答模式，客户端发请求，服务器回响应 |
| **无状态** | 每个请求独立，服务器不记住之前的请求（用 Cookie 弥补） |
| **文本协议** | HTTP/1.x 是纯文本，可读性强（HTTP/2 改为二进制） |
| **默认端口** | HTTP 端口 80，HTTPS 端口 443 |

### 1.2 HTTP 的发展历程

| 版本 | 年份 | 主要改进 |
|------|------|---------|
| HTTP/0.9 | 1991 | 极简，只有 GET，响应只有 HTML |
| HTTP/1.0 | 1996 | 增加 POST/HEAD、状态码、头部 |
| HTTP/1.1 | 1997 | 持久连接（keep-alive）、Host 头、管道化 |
| HTTP/2 | 2015 | 二进制分帧、多路复用、头部压缩 |
| HTTP/3 | 2022 | 基于 QUIC（UDP），解决队头阻塞 |

## 二、HTTP 请求格式

HTTP 请求由四部分组成：**请求行、请求头、空行、请求体**。

### 2.1 请求结构

\`\`\`
GET /api/users?id=1 HTTP/1.1       ← 请求行（方法 路径 版本）
Host: example.com                   ← 请求头
User-Agent: Mozilla/5.0             ← 请求头
Accept: application/json            ← 请求头
                                    ← 空行（CRLF），标志头部结束
                                    ← 请求体（GET 通常没有）
\`\`\`

### 2.2 请求行详解

\`\`\`
GET /api/users?id=1 HTTP/1.1\\r\\n
│    │            │      │
│    │            │      └─ HTTP 版本（HTTP/1.1 最常用）
│    │            └──────── 协议版本
│    └───────────────────── 请求路径（含查询字符串）
└────────────────────────── 请求方法
\`\`\`

每行以 \`\\r\\n\`（CRLF）结尾，头部结束后有一个空行 \`\\r\\n\`。

### 2.3 GET 请求示例

\`\`\`
GET /index.html HTTP/1.1\\r\\n
Host: www.example.com\\r\\n
User-Agent: curl/7.79\\r\\n
Accept: */*\\r\\n
\\r\\n
\`\`\`

GET 请求通常没有请求体，参数放在 URL 的查询字符串中。

### 2.4 POST 请求示例

\`\`\`
POST /api/login HTTP/1.1\\r\\n
Host: www.example.com\\r\\n
Content-Type: application/x-www-form-urlencoded\\r\\n
Content-Length: 27\\r\\n
\\r\\n
username=admin&password=123
\`\`\`

POST 请求的参数放在请求体中，必须用 \`Content-Type\` 说明格式，\`Content-Length\` 说明长度。

## 三、HTTP 响应格式

HTTP 响应同样由四部分组成：**状态行、响应头、空行、响应体**。

\`\`\`
HTTP/1.1 200 OK                     ← 状态行（版本 状态码 短语）
Content-Type: text/html             ← 响应头
Content-Length: 1234                 ← 响应头
Set-Cookie: session=abc123           ← 响应头
                                    ← 空行
<html><body>Hello</body></html>      ← 响应体
\`\`\`

### 3.1 状态行

\`\`\`
HTTP/1.1 200 OK\\r\\n
│        │   │
│        │   └─ 原因短语（人类可读的状态描述）
│        └───── 状态码（3位数字）
└────────────── 协议版本
\`\`\`

## 四、HTTP 方法

| 方法 | 语义 | 有请求体 | 幂等 | 典型用途 |
|------|------|---------|------|---------|
| **GET** | 获取资源 | 否 | 是 | 获取网页、查询数据 |
| **POST** | 创建资源 | 是 | 否 | 提交表单、上传文件 |
| **PUT** | 替换资源 | 是 | 是 | 更新整个资源 |
| **DELETE** | 删除资源 | 可选 | 是 | 删除资源 |
| **PATCH** | 部分更新 | 是 | 否 | 修改部分字段 |
| **HEAD** | 获取头信息 | 否 | 是 | 检查资源是否存在 |
| **OPTIONS** | 查询支持的方法 | 否 | 是 | CORS 预检 |

> **幂等性**：同一个请求执行一次和执行多次效果相同。GET、PUT、DELETE 是幂等的，POST 不是。

## 五、HTTP 状态码

状态码用 3 位数字表示，分 5 大类：

| 分类 | 含义 | 常见状态码 |
|------|------|-----------|
| **1xx** | 信息性 | 100 Continue |
| **2xx** | 成功 | 200 OK, 201 Created, 204 No Content |
| **3xx** | 重定向 | 301 永久重定向, 302 临时重定向, 304 Not Modified |
| **4xx** | 客户端错误 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| **5xx** | 服务器错误 | 500 Internal Error, 502 Bad Gateway, 503 Service Unavailable |

### 5.1 常见状态码详解

\`\`\`
200 OK          请求成功（最常见的成功响应）
201 Created     资源创建成功（POST 请求常见）
204 No Content  成功但无内容返回（DELETE 常见）

301 Moved       资源永久移动到新地址（浏览器会缓存）
302 Found       资源临时移动（每次都请求原地址）
304 Not Modified 资源未修改，用浏览器缓存

400 Bad Request  请求格式错误（参数不对）
401 Unauthorized 未认证（需要登录）
403 Forbidden    无权限（登录了但不能访问）
404 Not Found    资源不存在

500 Internal Error   服务器内部错误（代码异常）
502 Bad Gateway      网关错误（上游服务挂了）
503 Service Unavailable 服务不可用（过载或维护）
\`\`\`

## 六、HTTP 头部

### 6.1 常见请求头

| 头部 | 说明 | 示例 |
|------|------|------|
| \`Host\` | 目标主机名（HTTP/1.1 必需） | \`Host: example.com\` |
| \`User-Agent\` | 客户端标识 | \`User-Agent: Mozilla/5.0\` |
| \`Accept\` | 期望的响应格式 | \`Accept: application/json\` |
| \`Content-Type\` | 请求体格式 | \`Content-Type: application/json\` |
| \`Content-Length\` | 请求体字节数 | \`Content-Length: 27\` |
| \`Cookie\` | 携带的 Cookie | \`Cookie: session=abc123\` |
| \`Authorization\` | 认证凭证 | \`Authorization: Bearer xxx\` |

### 6.2 常见响应头

| 头部 | 说明 | 示例 |
|------|------|------|
| \`Content-Type\` | 响应体格式 | \`Content-Type: text/html; charset=utf-8\` |
| \`Content-Length\` | 响应体字节数 | \`Content-Length: 1234\` |
| \`Set-Cookie\` | 设置 Cookie | \`Set-Cookie: sid=abc; HttpOnly\` |
| \`Location\` | 重定向地址 | \`Location: https://new.example.com\` |
| \`Cache-Control\` | 缓存策略 | \`Cache-Control: max-age=3600\` |
| \`Server\` | 服务器标识 | \`Server: nginx/1.21\` |

### 6.3 Content-Type 常见值

| Content-Type | 用途 | 示例 |
|-------------|------|------|
| \`text/html\` | HTML 网页 | \`<html>...</html>\` |
| \`application/json\` | JSON 数据 | \`{"name":"abc"}\` |
| \`application/x-www-form-urlencoded\` | 表单提交 | \`name=abc&age=20\` |
| \`multipart/form-data\` | 文件上传 | 二进制分片 |
| \`text/plain\` | 纯文本 | \`hello world\` |
| \`application/octet-stream\` | 二进制流 | 文件下载 |

## 七、HTTP 持久连接与无状态

### 7.1 持久连接（Keep-Alive）

HTTP/1.0 默认每次请求都建立新 TCP 连接（三次握手开销大）。HTTP/1.1 默认开启持久连接：

\`\`\`
# HTTP/1.1 默认 keep-alive
Connection: keep-alive

# 关闭持久连接
Connection: close
\`\`\`

一个 TCP 连接可以连续发送多个 HTTP 请求，减少握手开销。

### 7.2 无状态与 Cookie

HTTP 本身是无状态的——服务器不记得"你之前来过"。但很多场景需要状态（比如购物车、登录状态），于是有了 Cookie/Session：

\`\`\`
第一次请求:
  客户端 → 服务器: POST /login (username, password)
  服务器 → 客户端: Set-Cookie: session=abc123

后续请求:
  客户端 → 服务器: GET /cart  Cookie: session=abc123
  服务器: 看到 Cookie，知道你是登录用户 abc123
\`\`\`

## 八、本章节代码演示说明

代码演示：

1. **手动构造 HTTP 请求字符串**并打印
2. **用 socket 连接本地 HTTP 服务器**发送原始请求
3. **解析 HTTP 响应**：状态行、头部、正文
4. **演示 GET 请求**和 **POST 请求**

> 💡 用 socket 手动构造 HTTP 请求是理解协议本质的最佳方式——你会看到 HTTP 就是纯文本规则。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第四章代码演示：HTTP 协议基础
# ------------------------------------------------------------
# 演示内容：
#   1. 启动本地 HTTP 服务器（http.server）
#   2. 手动构造 HTTP GET 请求字符串
#   3. 用 socket 发送原始 HTTP 请求
#   4. 解析 HTTP 响应（状态行 + 头部 + 正文）
#   5. 手动构造 HTTP POST 请求
# ============================================================
import socket
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

print("=" * 60)
print("HTTP 协议基础演示")
print("=" * 60)

# ------------------------------------------------------------
# 第一步：启动本地 HTTP 服务器（子线程）
# ------------------------------------------------------------
class DemoHandler(BaseHTTPRequestHandler):
    """简单的 HTTP 请求处理器"""
    def log_message(self, *args):
        pass  # 屏蔽默认日志输出

    def do_GET(self):
        """处理 GET 请求：返回简单 HTML"""
        body = "<h1>Hello HTTP</h1><p>这是一个 GET 响应</p>".encode("utf-8")
        self.send_response(200)                          # 状态码 200
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Custom-Header", "DemoServer/1.0")
        self.end_headers()                               # 结束头部（空行）
        self.wfile.write(body)                           # 写入响应体

    def do_POST(self):
        """处理 POST 请求：回显请求体"""
        # 读取请求体：根据 Content-Length
        length = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(length)
        body = b"Server received: " + data
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

# 创建服务器，端口 0 让系统分配
http_server = HTTPServer(("127.0.0.1", 0), DemoHandler)
server_port = http_server.server_address[1]
# 子线程运行服务器
threading.Thread(target=http_server.serve_forever, daemon=True).start()
time.sleep(0.3)  # 等服务器就绪
print(f"[服务器] 已启动 http://127.0.0.1:{server_port}")

# ============================================================
# 第二步：手动构造 HTTP GET 请求
# ============================================================
print("\\n[1] 手动构造 HTTP GET 请求")
print("-" * 60)

# HTTP 请求格式：请求行 + 头部 + 空行 + 请求体
# 每行用 \\r\\n 结尾，头部结束后有一个空行
get_request = (
    "GET / HTTP/1.1\\r\\n"          # 请求行：方法 路径 版本
    "Host: 127.0.0.1\\r\\n"         # Host 头（HTTP/1.1 必需）
    "User-Agent: PythonSocket/1.0\\r\\n"
    "Accept: text/html\\r\\n"
    "Connection: close\\r\\n"       # 请求完关闭连接
    "\\r\\n"                         # 空行，标志头部结束
)
print("原始请求内容：")
print(get_request)

# 用 socket 发送原始 HTTP 请求
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(1.0)
sock.connect(("127.0.0.1", server_port))
sock.sendall(get_request.encode("utf-8"))

# 接收完整响应
response_data = b""
while True:
    try:
        chunk = sock.recv(1024)
        if not chunk:
            break  # 连接关闭
        response_data += chunk
    except socket.timeout:
        break
sock.close()

# ============================================================
# 第三步：解析 HTTP 响应
# ============================================================
print("\\n[2] 解析 HTTP 响应")
print("-" * 60)

response_str = response_data.decode("utf-8")

# HTTP 响应格式：状态行 + 头部 + 空行 + 正文
# 用 \\r\\n\\r\\n 分割头部和正文
header_end = response_str.find("\\r\\n\\r\\n")
header_section = response_str[:header_end]
body_section = response_str[header_end + 4:]

# 解析状态行（第一行）
lines = header_section.split("\\r\\n")
status_line = lines[0]
print(f"状态行: {status_line}")

# 解析状态码
parts = status_line.split(" ", 2)
http_version = parts[0]
status_code = int(parts[1])
reason = parts[2] if len(parts) > 2 else ""
print(f"  版本: {http_version}")
print(f"  状态码: {status_code}")
print(f"  原因短语: {reason}")

# 解析响应头
print(f"\\n响应头:")
headers = {}
for line in lines[1:]:
    if ": " in line:
        key, value = line.split(": ", 1)
        headers[key] = value
        print(f"  {key}: {value}")

print(f"\\n响应正文:")
print(f"  {body_section}")

# ============================================================
# 第四步：手动构造 HTTP POST 请求
# ============================================================
print("\\n[3] 手动构造 HTTP POST 请求")
print("-" * 60)

# POST 请求体（表单格式）
post_body = "username=admin&password=secret"

# POST 请求必须包含 Content-Type 和 Content-Length
post_request = (
    "POST / HTTP/1.1\\r\\n"
    "Host: 127.0.0.1\\r\\n"
    "Content-Type: application/x-www-form-urlencoded\\r\\n"
    f"Content-Length: {len(post_body)}\\r\\n"
    "Connection: close\\r\\n"
    "\\r\\n"
    f"{post_body}"
)
print("原始请求内容：")
print(post_request)

# 发送 POST 请求
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(1.0)
sock.connect(("127.0.0.1", server_port))
sock.sendall(post_request.encode("utf-8"))

# 接收响应
response_data = b""
while True:
    try:
        chunk = sock.recv(1024)
        if not chunk:
            break
        response_data += chunk
    except socket.timeout:
        break
sock.close()

response_str = response_data.decode("utf-8")
header_end = response_str.find("\\r\\n\\r\\n")
body = response_str[header_end + 4:]
status_line = response_str.split("\\r\\n")[0]

print(f"\\n响应状态行: {status_line}")
print(f"响应正文: {body}")

# ============================================================
# 第五步：HTTP 请求格式总结
# ============================================================
print("\\n[4] HTTP 请求/响应格式总结")
print("-" * 60)
print("请求格式:")
print("  METHOD PATH HTTP/1.1\\r\\n   ← 请求行")
print("  Header: Value\\r\\n           ← 请求头")
print("  \\r\\n                        ← 空行")
print("  <请求体>                    ← 可选")
print()
print("响应格式:")
print("  HTTP/1.1 CODE REASON\\r\\n   ← 状态行")
print("  Header: Value\\r\\n           ← 响应头")
print("  \\r\\n                        ← 空行")
print("  <响应体>                    ← 数据")

# 关闭服务器
http_server.shutdown()

print("\\n" + "=" * 60)
print("[本章小结]")
print("=" * 60)
print("1. HTTP 基于 TCP，请求-响应模式，默认无状态")
print("2. 请求 = 请求行 + 头部 + 空行 + 请求体")
print("3. 响应 = 状态行 + 头部 + 空行 + 响应体")
print("4. GET 参数在 URL，POST 参数在请求体")
print("5. POST 必须有 Content-Type 和 Content-Length")
print("6. 状态码: 2xx成功 3xx重定向 4xx客户端错误 5xx服务器错误")
print("7. 每行用 \\r\\n 结尾，头部后空行分隔正文")`,
  },

  // ============================================================
  // 第五章：http.server 服务器
  // ============================================================
  {
    id: "py-http-server",
    group: "HTTP",
    icon: "🖥️",
    title: "http.server 服务器",
    content: `## 一、Python 内置 HTTP 服务器

Python 标准库自带 HTTP 服务器模块 \`http.server\`，无需安装任何第三方库就能搭建 Web 服务器。虽然不适合生产环境（性能、安全性不足），但非常适合学习、测试、写内部工具。

### 1.1 最简用法：命令行启动静态文件服务器

\`\`\`bash
# 在当前目录启动 HTTP 服务器，端口 8000
python3 -m http.server 8000

# 指定目录
python3 -m http.server 8000 --directory /path/to/files

# 指定绑定地址
python3 -m http.server 8000 --bind 127.0.0.1
\`\`\`

这会启动一个静态文件服务器，浏览器访问 \`http://localhost:8000\` 可以浏览当前目录的文件。非常适合本地调试和临时分享文件。

### 1.2 http.server 模块结构

| 类/方法 | 作用 |
|---------|------|
| \`HTTPServer\` | HTTP 服务器类，管理连接和请求分发 |
| \`ThreadingHTTPServer\` | 多线程版 HTTPServer，支持并发 |
| \`BaseHTTPRequestHandler\` | 请求处理器基类，需自行实现 do_GET 等 |
| \`SimpleHTTPRequestHandler\` | 静态文件处理器（命令行用的就是它） |
| \`CGIHTTPRequestHandler\` | CGI 脚本处理器（已过时） |

## 二、BaseHTTPRequestHandler 详解

这是自定义 HTTP 服务器的核心类。继承它并重写 \`do_GET\`、\`do_POST\` 等方法即可处理请求。

### 2.1 核心属性

| 属性 | 说明 | 示例 |
|------|------|------|
| \`self.path\` | 请求路径（含查询字符串） | \`/api/users?id=1\` |
| \`self.command\` | 请求方法 | \`GET\`、\`POST\` |
| \`self.headers\` | 请求头对象 | \`self.headers['Host']\` |
| \`self.rfile\` | 读取请求体的文件流 | \`self.rfile.read(n)\` |
| \`self.wfile\` | 写响应的文件流 | \`self.wfile.write(data)\` |
| \`self.client_address\` | 客户端地址 | \`('127.0.0.1', 54321)\` |
| \`self.request_version\` | HTTP 版本 | \`HTTP/1.1\` |

### 2.2 核心方法

| 方法 | 作用 |
|------|------|
| \`self.send_response(code)\` | 发送状态行（如 200） |
| \`self.send_header(key, value)\` | 发送响应头 |
| \`self.end_headers()\` | 结束头部（发送空行） |
| \`self.send_error(code, msg)\` | 发送错误响应 |

### 2.3 处理流程

\`\`\`
1. 收到请求 → HTTPServer 分发给 Handler
2. 解析请求行和头部，存入 self.path / self.headers
3. 调用对应的 do_XXX 方法（do_GET / do_POST / do_PUT...）
4. 在 do_XXX 中：
   a. send_response(200)           # 发送状态行
   b. send_header("Content-Type")  # 发送响应头
   c. end_headers()                # 结束头部
   d. wfile.write(data)            # 写入响应体
\`\`\`

## 三、实现 do_GET 返回 JSON

\`\`\`python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class ApiHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 构造 JSON 响应
        data = {"message": "hello", "code": 200}
        body = json.dumps(data).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

server = HTTPServer(("127.0.0.1", 8000), ApiHandler)
server.serve_forever()
\`\`\`

### 3.1 路由处理

根据 \`self.path\` 返回不同内容：

\`\`\`python
def do_GET(self):
    if self.path == "/":
        # 首页
        body = b"<h1>Home</h1>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
    elif self.path == "/api/info":
        # API 返回 JSON
        body = json.dumps({"name": "api"}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
    else:
        # 404
        self.send_error(404, "Not Found")
        return

    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)
\`\`\`

## 四、实现 do_POST 处理请求体

POST 请求通常有请求体，需要通过 \`Content-Length\` 头判断长度，然后从 \`self.rfile\` 读取。

\`\`\`python
def do_POST(self):
    # 1. 读取 Content-Length 头
    content_length = int(self.headers.get("Content-Length", 0))

    # 2. 从 rfile 读取请求体
    body = self.rfile.read(content_length)

    # 3. 解析请求体（假设是 JSON）
    data = json.loads(body)

    # 4. 处理并返回响应
    response = json.dumps({"echo": data}).encode()
    self.send_response(200)
    self.send_header("Content-Type", "application/json")
    self.send_header("Content-Length", str(len(response)))
    self.end_headers()
    self.wfile.write(response)
\`\`\`

> **关键**：必须用 \`Content-Length\` 判断要读多少字节，不能直接 \`rfile.read()\`（会阻塞等待更多数据）。

## 五、ThreadingHTTPServer 支持并发

\`HTTPServer\` 是单线程的——一次只能处理一个请求，前一个没处理完，后面的要排队。\`ThreadingHTTPServer\` 每个请求开一个线程，支持并发。

\`\`\`python
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# 对比：
server = HTTPServer(addr, handler)           # 单线程，请求排队
server = ThreadingHTTPServer(addr, handler)  # 多线程，并发处理
\`\`\`

### 5.1 单线程 vs 多线程

| 维度 | HTTPServer | ThreadingHTTPServer |
|------|-----------|-------------------|
| **并发** | 不支持，排队处理 | 支持，每请求一线程 |
| **性能** | 低（阻塞） | 高（并发） |
| **资源** | 少 | 每连接占线程 |
| **适用** | 学习、调试 | 小型工具服务 |

## 六、设置 Content-Type

不同的响应内容需要设置不同的 \`Content-Type\`：

| 内容类型 | Content-Type |
|---------|-------------|
| HTML 网页 | \`text/html; charset=utf-8\` |
| JSON 数据 | \`application/json; charset=utf-8\` |
| 纯文本 | \`text/plain; charset=utf-8\` |
| 图片 | \`image/png\`、\`image/jpeg\` |
| 文件下载 | \`application/octet-stream\` |

> **务必加 charset=utf-8**，否则中文可能乱码。

## 七、关闭默认日志

默认情况下，每个请求都会打印日志到 stderr：

\`\`\`
127.0.0.1 - - [03/Jul/2026 10:00:00] "GET / HTTP/1.1" 200 -
\`\`\`

在演示代码中可以关闭它：

\`\`\`python
class MyHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # 空实现，屏蔽日志
\`\`\`

## 八、SimpleHTTPRequestHandler 静态文件服务

如果只是想共享文件目录，直接用 \`SimpleHTTPRequestHandler\`：

\`\`\`python
from http.server import HTTPServer, SimpleHTTPRequestHandler

# 共享当前目录的文件
server = HTTPServer(("0.0.0.0", 8000), SimpleHTTPRequestHandler)
server.serve_forever()
\`\`\`

浏览器访问会看到目录列表，点击文件可下载或查看。

## 九、本章节代码演示说明

代码演示：

1. **自定义 BaseHTTPRequestHandler**，实现 do_GET 和 do_POST
2. **路由处理**：根据 self.path 返回 HTML 或 JSON
3. **POST 请求体解析**：读取 Content-Length，解析 JSON
4. **ThreadingHTTPServer** 支持并发
5. **用 urllib 请求测试**

> 💡 服务器在子线程运行，主线程用 urllib 发请求测试，最后 shutdown 关闭。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第五章代码演示：http.server 服务器
# ------------------------------------------------------------
# 演示内容：
#   1. 自定义 BaseHTTPRequestHandler
#   2. 实现 do_GET 返回 HTML 和 JSON（路由）
#   3. 实现 do_POST 解析请求体并回显
#   4. 使用 ThreadingHTTPServer 支持并发
#   5. 用 urllib 发请求测试
# ============================================================
import json
import threading
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import urllib.request

print("=" * 60)
print("http.server 服务器演示")
print("=" * 60)

# ------------------------------------------------------------
# 第一步：自定义请求处理器
# ------------------------------------------------------------
class ApiHandler(BaseHTTPRequestHandler):
    """自定义 HTTP 请求处理器"""

    # 屏蔽默认的请求日志（避免干扰输出）
    def log_message(self, *args):
        pass

    # ========================================================
    # 处理 GET 请求：根据路径返回不同内容（路由）
    # ========================================================
    def do_GET(self):
        # self.path 包含路径和查询字符串，如 "/api/info?name=abc"
        # self.command 是请求方法 "GET"

        if self.path == "/" or self.path == "/index":
            # 路由：首页返回 HTML
            html = b"<html><body><h1>Welcome</h1><p>Home Page</p></body></html>"
            self.send_response(200)                                   # 发送状态码
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()                                        # 结束头部
            self.wfile.write(html)                                    # 写入响应体

        elif self.path == "/api/info":
            # 路由：API 返回 JSON
            data = {
                "name": "PyHTTPServer",
                "version": "1.0",
                "time": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            body = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        elif self.path == "/api/text":
            # 路由：返回纯文本
            body = "这是一段纯文本响应".encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        else:
            # 路由：404 未找到
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            body = "404 Not Found".encode("utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    # ========================================================
    # 处理 POST 请求：解析请求体并回显
    # ========================================================
    def do_POST(self):
        # 读取请求体的步骤：
        # 1. 从请求头获取 Content-Length（字节数）
        # 2. 从 self.rfile 读取相应字节数

        content_length = int(self.headers.get("Content-Length", 0))
        request_body = self.rfile.read(content_length)

        # 尝试解析 JSON
        try:
            data = json.loads(request_body)
            # 回显收到的数据
            response = {
                "status": "ok",
                "echo": data,
                "received_bytes": content_length
            }
            resp_body = json.dumps(response, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)

        except json.JSONDecodeError:
            # JSON 解析失败
            error = json.dumps({"error": "Invalid JSON"}).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(error)))
            self.end_headers()
            self.wfile.write(error)

# ------------------------------------------------------------
# 第二步：启动 ThreadingHTTPServer
# ------------------------------------------------------------
# ThreadingHTTPServer 每个请求开一个线程，支持并发
# 对比 HTTPServer 是单线程，请求排队
server = ThreadingHTTPServer(("127.0.0.1", 0), ApiHandler)
server_port = server.server_address[1]
# 子线程运行 serve_forever
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.3)  # 等服务器就绪
base_url = f"http://127.0.0.1:{server_port}"
print(f"[服务器] 已启动 {base_url} (ThreadingHTTPServer)")

# ============================================================
# 第三步：测试各种路由
# ============================================================

# 测试 1：GET / 返回 HTML
print("\\n[1] GET / -> HTML")
with urllib.request.urlopen(f"{base_url}/") as r:
    print(f"  状态码: {r.status}")
    print(f"  Content-Type: {r.headers.get('Content-Type')}")
    print(f"  正文: {r.read().decode('utf-8')[:50]}...")

# 测试 2：GET /api/info 返回 JSON
print("\\n[2] GET /api/info -> JSON")
with urllib.request.urlopen(f"{base_url}/api/info") as r:
    print(f"  状态码: {r.status}")
    print(f"  Content-Type: {r.headers.get('Content-Type')}")
    data = json.loads(r.read())
    print(f"  JSON 数据: {data}")

# 测试 3：GET /api/text 返回纯文本
print("\\n[3] GET /api/text -> 纯文本")
with urllib.request.urlopen(f"{base_url}/api/text") as r:
    print(f"  状态码: {r.status}")
    print(f"  Content-Type: {r.headers.get('Content-Type')}")
    print(f"  正文: {r.read().decode('utf-8')}")

# 测试 4：GET /notexist 返回 404
print("\\n[4] GET /notexist -> 404")
try:
    urllib.request.urlopen(f"{base_url}/notexist")
except urllib.error.HTTPError as e:
    print(f"  状态码: {e.code}")
    print(f"  原因: {e.reason}")

# 测试 5：POST / 发送 JSON 并收到回显
print("\\n[5] POST / -> JSON 回显")
post_data = json.dumps({"name": "张三", "action": "login"}).encode("utf-8")
req = urllib.request.Request(
    f"{base_url}/",
    data=post_data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as r:
    print(f"  状态码: {r.status}")
    resp = json.loads(r.read())
    print(f"  回显: {resp}")

# 测试 6：POST / 发送无效 JSON -> 400
print("\\n[6] POST / 无效 JSON -> 400")
req = urllib.request.Request(
    f"{base_url}/",
    data=b"not a json",
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(f"  状态码: {e.code}")
    err = json.loads(e.read())
    print(f"  错误: {err}")

# ============================================================
# 关闭服务器
# ============================================================
server.shutdown()
print(f"\\n[服务器] 已关闭")

print("\\n" + "=" * 60)
print("[本章小结]")
print("=" * 60)
print("1. http.server 模块无需安装，标准库自带")
print("2. 继承 BaseHTTPRequestHandler，重写 do_GET/do_POST")
print("3. self.path 路由, self.rfile 读请求体, self.wfile 写响应")
print("4. 响应步骤: send_response -> send_header -> end_headers -> wfile.write")
print("5. POST 读取请求体: 先获取 Content-Length, 再 rfile.read(n)")
print("6. ThreadingHTTPServer 支持并发，HTTPServer 是单线程")
print("7. log_message 可重写为空来屏蔽默认日志")`,
  },

  // ============================================================
  // 第六章：urllib 与 http.client
  // ============================================================
  {
    id: "py-http-client",
    group: "HTTP",
    icon: "🌐",
    title: "urllib 与 http.client",
    content: `## 一、Python 标准库 HTTP 客户端

Python 标准库提供了两套 HTTP 客户端工具，无需安装第三方库即可发送 HTTP 请求：

| 模块 | 层级 | 特点 | 推荐场景 |
|------|------|------|---------|
| \`urllib.request\` | 高层 | API 简单，自动处理重定向、Cookie | 一般请求 |
| \`http.client\` | 低层 | 细粒度控制，手动管理连接 | 需要精确控制 |
| \`urllib.parse\` | 工具 | URL 解析与编码 | 编码表单、解析 URL |

### 1.1 与第三方库 requests 的对比

| 维度 | urllib (标准库) | requests (第三方) |
|------|----------------|------------------|
| **安装** | 无需安装 | \`pip install requests\` |
| **API 简洁度** | 较繁琐 | 非常简洁 |
| **功能** | 基本够用 | 功能丰富（Session、Auth 等） |
| **跨平台** | 随 Python 发布 | 需额外安装 |
| **学习价值** | 理解底层 | 实际开发效率高 |

\`\`\`python
# urllib（标准库，较繁琐）
import urllib.request
req = urllib.request.Request(url, data=data, headers=headers)
with urllib.request.urlopen(req) as r:
    body = r.read()

# requests（第三方，更简洁）
import requests
r = requests.post(url, json=data, headers=headers)
body = r.text
\`\`\`

本教程用标准库，因为运行环境只有标准库。掌握 urllib 后转用 requests 很容易。

## 二、urllib.request 高层 API

### 2.1 urlopen：最简单的 GET 请求

\`\`\`python
import urllib.request

# 最简单的 GET 请求
with urllib.request.urlopen("http://example.com") as response:
    status = response.status       # 状态码 200
    headers = response.headers     # 响应头
    body = response.read()         # 响应体（bytes）
    text = body.decode("utf-8")    # 转字符串
\`\`\`

\`urlopen\` 返回的 response 对象常用属性：

| 属性/方法 | 说明 |
|-----------|------|
| \`response.status\` | 状态码（如 200） |
| \`response.headers\` | 响应头对象 |
| \`response.read()\` | 读取响应体（bytes） |
| \`response.read(n)\` | 读取 n 字节 |
| \`response.readline()\` | 读取一行 |
| \`response.geturl()\` | 最终 URL（重定向后） |
| \`response.getcode()\` | 状态码（同 status） |

### 2.2 Request：自定义请求

\`urlopen\` 只能发简单请求。需要自定义头、方法、请求体时用 \`Request\`：

\`\`\`python
import urllib.request

# 创建 Request 对象，自定义请求头
req = urllib.request.Request(
    url="http://example.com/api",
    data=b'{"name":"abc"}',                    # 请求体（bytes）
    headers={
        "User-Agent": "MyClient/1.0",
        "Content-Type": "application/json",
        "Authorization": "Bearer xxx"
    },
    method="POST"                               # 请求方法
)

with urllib.request.urlopen(req) as response:
    body = response.read()
\`\`\`

### 2.3 自定义 User-Agent

有些服务器会根据 User-Agent 区分客户端（比如屏蔽爬虫）：

\`\`\`python
import urllib
# 默认 User-Agent 是 "Python-urllib/3.x"，容易被屏蔽
# 伪装成浏览器
req = urllib.request.Request(
    url,
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
)
\`\`\`

## 三、urllib.parse URL 处理

### 3.1 urlencode：编码表单数据

表单提交时，特殊字符需要 URL 编码：

\`\`\`python
import urllib.parse

# 编码表单数据
params = {"name": "张三", "city": "北京", "age": 20}
encoded = urllib.parse.urlencode(params)
# 结果: "name=%E5%BC%A0%E4%B8%89&city=%E5%8C%97%E4%BA%AC&age=20"

# 用于 POST 请求体
data = encoded.encode("utf-8")  # 转为 bytes
req = urllib.request.Request(url, data=data, method="POST")

# 也可用于 GET 查询字符串
url = f"http://example.com/api?{encoded}"
\`\`\`

### 3.2 urlparse：解析 URL

\`\`\`python
import urllib.parse

parsed = urllib.parse.urlparse("https://user:pass@host:8080/path?q=1#frag")
# ParseResult(
#   scheme='https',      # 协议
#   netloc='user:pass@host:8080',  # 网络位置
#   path='/path',        # 路径
#   params='',           # 路径参数
#   query='q=1',         # 查询字符串
#   fragment='frag'      # 锚点
# )
\`\`\`

URL 各部分：

\`\`\`
  https://user:pass@host:8080/path/file?q=1&n=2#section
  └──┬─┘ └─────┬─────┘ └─┬─┘ └──┬──┘ └──┬──┘ └──┬──┘
  scheme      userinfo  host  port   path  query fragment
\`\`\`

### 3.3 parse_qs：解析查询字符串

\`\`\`python
import urllib.parse

# 解析查询字符串为字典
qs = "name=%E5%BC%A0%E4%B8%89&age=20&hobby=read&hobby=code"
params = urllib.parse.parse_qs(qs)
# {'name': ['张三'], 'age': ['20'], 'hobby': ['read', 'code']}
# 注意：值是列表（同一 key 可能有多个值）
\`\`\`

## 四、http.client 低层 API

\`http.client\` 提供更底层的控制，需要手动管理连接：

### 4.1 HTTPConnection 基本用法

\`\`\`python
import http.client

# 1. 创建连接
conn = http.client.HTTPConnection("example.com", 80, timeout=10)

# 2. 发送请求
conn.request("GET", "/api/users", body=None, headers={"Host": "example.com"})

# 3. 获取响应
response = conn.getresponse()
print(response.status)       # 200
print(response.reason)       # OK
print(response.getheaders()) # 响应头列表
body = response.read()       # 读取响应体

# 4. 关闭连接
conn.close()
\`\`\`

### 4.2 发送 POST 请求

\`\`\`python
import http
conn = http.client.HTTPConnection("example.com", 80)
conn.request(
    "POST",
    "/api/create",
    body='{"name":"abc"}',
    headers={
        "Content-Type": "application/json",
        "Content-Length": "15"
    }
)
response = conn.getresponse()
print(response.read().decode())
conn.close()
\`\`\`

### 4.3 urllib vs http.client

| 维度 | urllib.request | http.client |
|------|---------------|-------------|
| **层级** | 高层封装 | 低层 API |
| **连接管理** | 自动 | 手动（open/close） |
| **重定向** | 自动跟随 | 不自动 |
| **Cookie** | 需配合 cookiejar | 手动处理 |
| **控制粒度** | 粗 | 细 |
| **代码量** | 少 | 多 |

> 一般情况下用 \`urllib.request\` 就够了。需要精确控制连接（如复用连接、自定义传输）时用 \`http.client\`。

## 五、响应对象的常用操作

### 5.1 读取响应体

\`\`\`python
import urllib
with urllib.request.urlopen(url) as r:
    # 一次性读取全部
    body = r.read()
    text = body.decode("utf-8")

    # 分块读取（大文件/流式）
    while True:
        chunk = r.read(1024)  # 每次读 1024 字节
        if not chunk:
            break
        process(chunk)
\`\`\`

### 5.2 获取响应头

\`\`\`python
import urllib
with urllib.request.urlopen(url) as r:
    # 获取单个头
    content_type = r.headers.get("Content-Type")

    # 遍历所有头
    for key, value in r.headers.items():
        print(f"{key}: {value}")

    # 获取状态码
    status = r.status
\`\`\`

## 六、错误处理

\`\`\`python
import socket
import urllib.request
import urllib.error

try:
    with urllib.request.urlopen(url, timeout=5) as r:
        body = r.read()
except urllib.error.HTTPError as e:
    # HTTP 错误（4xx、5xx）
    print(f"HTTP 错误: {e.code} {e.reason}")
    print(e.read().decode())  # 读取错误响应体
except urllib.error.URLError as e:
    # URL 错误（网络问题、DNS 解析失败）
    print(f"URL 错误: {e.reason}")
except socket.timeout:
    # 超时
    print("请求超时")
\`\`\`

- \`HTTPError\` 是 \`URLError\` 的子类，处理顺序：先 HTTPError 后 URLError
- \`urlopen(url, timeout=5)\` 设置超时

## 七、本章节代码演示说明

代码演示：

1. **urlopen** 发 GET 请求
2. **Request** 自定义 User-Agent
3. **urlencode** 编码表单，发 POST 请求
4. **urlparse** 和 **parse_qs** 解析 URL
5. **http.client.HTTPConnection** 发请求
6. 读取状态码、头部、正文

> 💡 所有请求发到本地启动的 HTTP 服务器，不连外网，确保 5 秒内完成。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第六章代码演示：urllib 与 http.client
# ------------------------------------------------------------
# 演示内容：
#   1. urllib.request.urlopen 发 GET 请求
#   2. urllib.request.Request 自定义 User-Agent
#   3. urllib 发 POST 请求（urlencode 表单）
#   4. urllib.parse.urlparse / parse_qs 解析 URL
#   5. http.client.HTTPConnection 发请求
#   6. 读取状态码、头部、正文
# 约束：请求发到本地 HTTP 服务器，不连外网
# ============================================================
import json
import threading
import time
import urllib.request
import urllib.parse
import urllib.error
import http.client
from http.server import HTTPServer, BaseHTTPRequestHandler

print("=" * 60)
print("urllib 与 http.client 演示")
print("=" * 60)

# ------------------------------------------------------------
# 第一步：启动本地 HTTP 服务器（供客户端测试）
# ------------------------------------------------------------
class TestHandler(BaseHTTPRequestHandler):
    """测试用 HTTP 处理器"""
    def log_message(self, *args):
        pass

    def do_GET(self):
        # 返回请求信息（path、方法、头）
        info = {
            "method": "GET",
            "path": self.path,
            "ua": self.headers.get("User-Agent", ""),
            "time": time.strftime("%H:%M:%S")
        }
        body = json.dumps(info, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Server", "TestServer/1.0")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(length)
        # 回显收到的数据
        result = {
            "method": "POST",
            "path": self.path,
            "body": data.decode("utf-8"),
            "length": length
        }
        body = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

server = HTTPServer(("127.0.0.1", 0), TestHandler)
port = server.server_address[1]
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.3)
base_url = f"http://127.0.0.1:{port}"
print(f"[服务器] 已启动 {base_url}")

# ============================================================
# 第二步：urlopen 发 GET 请求
# ============================================================
print("\\n[1] urllib.request.urlopen 发 GET 请求")
print("-" * 60)

# urlopen 是最简单的 HTTP 请求方式
with urllib.request.urlopen(f"{base_url}/api/test") as response:
    print(f"  状态码: {response.status}")
    print(f"  状态短语: {response.reason}")
    print(f"  服务器: {response.headers.get('X-Server')}")
    print(f"  Content-Type: {response.headers.get('Content-Type')}")
    body = response.read().decode("utf-8")
    print(f"  正文: {body}")
    # response 对象还支持 geturl()（最终URL）和 getcode()（状态码）
    print(f"  getcode(): {response.getcode()}")

# ============================================================
# 第三步：Request 自定义 User-Agent
# ============================================================
print("\\n[2] urllib.request.Request 自定义 User-Agent")
print("-" * 60)

# 默认 User-Agent 是 "Python-urllib/3.x"
# 用 Request 对象可以自定义请求头
req = urllib.request.Request(
    f"{base_url}/api/with-ua",
    headers={
        "User-Agent": "MyPythonClient/2.0",
        "Accept": "application/json"
    }
)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
    print(f"  发送的 User-Agent: MyPythonClient/2.0")
    print(f"  服务器收到的 UA: {data['ua']}")
    print(f"  请求路径: {data['path']}")

# ============================================================
# 第四步：urlencode 编码表单 + POST 请求
# ============================================================
print("\\n[3] POST 请求（urlencode 编码表单数据）")
print("-" * 60)

# 表单数据需要 URL 编码：特殊字符转 %XX
form_data = {
    "username": "张三",
    "email": "test@example.com",
    "message": "hello world & special=chars"
}
# urlencode 把字典编码成 "key=value&key=value" 格式
encoded = urllib.parse.urlencode(form_data)
print(f"  编码后: {encoded}")

# POST 请求需要把编码后的字符串转为 bytes
post_data = encoded.encode("utf-8")
req = urllib.request.Request(
    f"{base_url}/api/submit",
    data=post_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    method="POST"
)
with urllib.request.urlopen(req) as response:
    result = json.loads(response.read())
    print(f"  服务器收到: {result['body']}")
    print(f"  数据长度: {result['length']} 字节")

# ============================================================
# 第五步：urlparse 和 parse_qs 解析 URL
# ============================================================
print("\\n[4] urllib.parse.urlparse 解析 URL")
print("-" * 60)

# 解析 URL 的各个组成部分
test_url = "https://user:pass@www.example.com:8443/api/users?id=1&name=abc&page=2#section"
parsed = urllib.parse.urlparse(test_url)
print(f"  原始 URL: {test_url}")
print(f"  scheme  (协议): {parsed.scheme}")
print(f"  netloc  (位置): {parsed.netloc}")
print(f"  hostname(主机): {parsed.hostname}")
print(f"  port    (端口): {parsed.port}")
print(f"  path    (路径): {parsed.path}")
print(f"  query   (查询): {parsed.query}")
print(f"  fragment(锚点): {parsed.fragment}")

# parse_qs 把查询字符串解析为字典
print(f"\\n  解析查询字符串: {parsed.query}")
qs_dict = urllib.parse.parse_qs(parsed.query)
print(f"  parse_qs 结果: {qs_dict}")
print(f"  (注意: 值是列表，因为同一 key 可能有多个值)")

# quote / unquote：编码/解码单个字符串
print(f"\\n  quote('张三 北京'): {urllib.parse.quote('张三 北京')}")
print(f"  unquote('%E5%BC%A0%E4%B8%89'): {urllib.parse.unquote('%E5%BC%A0%E4%B8%89')}")

# ============================================================
# 第六步：http.client.HTTPConnection 低层 API
# ============================================================
print("\\n[5] http.client.HTTPConnection 发请求")
print("-" * 60)

# http.client 是更低层的 API，需要手动管理连接
# 1. 创建连接
conn = http.client.HTTPConnection("127.0.0.1", port, timeout=2)
print(f"  已连接 127.0.0.1:{port}")

# 2. 发送 GET 请求
conn.request("GET", "/api/httpclient", headers={"User-Agent": "HttpClient/1.0"})

# 3. 获取响应
response = conn.getresponse()
print(f"\\n  GET 响应:")
print(f"    状态: {response.status} {response.reason}")
print(f"    头部:")
for k, v in response.getheaders():
    print(f"      {k}: {v}")
body = response.read().decode("utf-8")
print(f"    正文: {body}")

# 4. 发送 POST 请求（复用同一连接）
print(f"\\n  POST 请求（复用连接）:")
post_body = json.dumps({"client": "http.client", "msg": "hello"}).encode("utf-8")
conn.request(
    "POST", "/api/post-test",
    body=post_body,
    headers={
        "Content-Type": "application/json",
        "Content-Length": str(len(post_body))
    }
)
response = conn.getresponse()
print(f"    状态: {response.status}")
print(f"    正文: {response.read().decode('utf-8')}")

# 5. 关闭连接
conn.close()
print(f"  连接已关闭")

# ============================================================
# 关闭服务器
# ============================================================
server.shutdown()

print("\\n" + "=" * 60)
print("[本章小结]")
print("=" * 60)
print("1. urllib.request: 高层 API，urlopen 简单 GET，Request 自定义请求")
print("2. urllib.parse: urlencode 编码表单, urlparse 解析 URL, parse_qs 解析查询串")
print("3. http.client: 低层 API，HTTPConnection 手动管理连接")
print("4. urllib 自动处理重定向，http.client 需手动处理")
print("5. POST 表单: urlencode 编码 -> encode('utf-8') -> Request(data=...)")
print("6. 错误处理: HTTPError(4xx/5xx), URLError(网络问题), socket.timeout")
print("7. 实际开发推荐 requests 库（API 更简洁），但标准库够用且无需安装")`,
  },

  // ============================================================
  // 第七章：HTTP 实战
  // ============================================================
  {
    id: "py-http-practice",
    group: "HTTP",
    icon: "🛠️",
    title: "HTTP 实战",
    content: `## 一、实战概览

本章把前面学的 HTTP 知识综合运用到四个实战场景：

| 场景 | 涉及技术 | 学习目标 |
|------|---------|---------|
| **REST API 服务器** | http.server + JSON + 路由 | 构建后端 API |
| **简易爬虫** | urllib + html.parser | 获取并解析网页 |
| **Cookie 处理** | CookieJar + HTTPCookieProcessor | 模拟登录状态 |
| **文件下载** | 流式读取 + 进度显示 | 处理大文件 |

## 二、实战一：REST API 服务器

REST（Representational State Transfer）是一种 API 设计风格，核心思想是"资源 + HTTP 方法"。

### 2.1 REST 设计原则

| HTTP 方法 | 语义 | URL | 示例 |
|-----------|------|-----|------|
| GET | 获取资源 | /api/items | 获取列表 |
| GET | 获取单个 | /api/items/1 | 获取 ID=1 的项 |
| POST | 创建资源 | /api/items | 新建 |
| PUT | 替换资源 | /api/items/1 | 更新 ID=1 |
| DELETE | 删除资源 | /api/items/1 | 删除 ID=1 |

### 2.2 实现路由

\`\`\`python
class ApiHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/items":
            # 返回列表
            body = json.dumps(ITEMS).encode()
            self._respond(200, body)
        elif self.path.startswith("/api/items/"):
            # 获取单个: /api/items/1
            item_id = int(self.path.split("/")[-1])
            ...
    
    def do_POST(self):
        if self.path == "/api/items":
            # 创建
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
            ITEMS.append(data)
            ...
\`\`\`

### 2.3 REST 响应规范

| 操作 | 成功状态码 | 说明 |
|------|-----------|------|
| GET | 200 OK | 返回资源 |
| POST | 201 Created | 资源已创建 |
| PUT | 200 OK | 资源已更新 |
| DELETE | 204 No Content | 已删除，无返回 |
| 错误 | 400/404/500 | 客户端/服务器错误 |

## 三、实战二：简易爬虫

爬虫的核心是"获取网页 + 解析 HTML"。标准库用 \`urllib\` 获取，\`html.parser\` 解析。

### 3.1 获取网页

\`\`\`python
import urllib.request

with urllib.request.urlopen(url) as r:
    html = r.read().decode("utf-8")
\`\`\`

### 3.2 解析 HTML

\`html.parser.HTMLParser\` 是标准库的 HTML 解析器，基于事件回调：

\`\`\`python
from html.parser import HTMLParser

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    
    def handle_starttag(self, tag, attrs):
        # 遇到开始标签时调用
        # tag: 标签名如 "a", "img"
        # attrs: 属性列表 [("href", "url"), ("class", "x")]
        if tag == "a":
            for key, value in attrs:
                if key == "href":
                    self.links.append(value)

parser = LinkExtractor()
parser.feed('<a href="/page1">链接1</a><a href="/page2">链接2</a>')
print(parser.links)  # ['/page1', '/page2']
\`\`\`

### 3.3 HTMLParser 回调方法

| 方法 | 触发时机 | 参数 |
|------|---------|------|
| \`handle_starttag(tag, attrs)\` | 开始标签 | \`<a href="...">\` |
| \`handle_endtag(tag)\` | 结束标签 | \`</a>\` |
| \`handle_data(data)\` | 文本内容 | 标签之间的文本 |
| \`handle_comment(data)\` | 注释 | \`<!-- ... -->\` |

### 3.4 爬虫礼貌原则

1. **遵守 robots.txt**：\`urllib.robotparser\` 可解析
2. **控制频率**：加 \`time.sleep()\`，别把人家服务器搞崩
3. **设置 User-Agent**：别用默认的 \`Python-urllib\`
4. **尊重版权**：爬到的数据别乱用

## 四、实战三：Cookie 处理

HTTP 无状态，登录后服务器用 \`Set-Cookie\` 下发凭证，客户端后续请求带 \`Cookie\` 头。

### 4.1 Cookie 工作流程

\`\`\`
1. 登录请求
   客户端 → 服务器: POST /login (username, password)
   服务器 → 客户端: 200 OK + Set-Cookie: session=abc123

2. 后续请求（自动携带 Cookie）
   客户端 → 服务器: GET /profile  Cookie: session=abc123
   服务器: 验证 session，知道你是登录用户
\`\`\`

### 4.2 CookieJar 自动管理 Cookie

手动管理 Cookie 很麻烦，\`http.cookiejar\` 可以自动处理：

\`\`\`python
import urllib.request
import http.cookiejar

# 1. 创建 CookieJar 存储 Cookie
cookie_jar = http.cookiejar.CookieJar()

# 2. 创建带 Cookie 处理的 opener
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookie_jar)
)

# 3. 用 opener 发请求，Cookie 自动管理
opener.open(login_url)    # 服务器 Set-Cookie，cookie_jar 自动保存
opener.open(profile_url)  # cookie_jar 自动带上 Cookie
\`\`\`

### 4.3 Cookie 的安全属性

| 属性 | 作用 |
|------|------|
| \`HttpOnly\` | JS 无法读取（防 XSS） |
| \`Secure\` | 仅 HTTPS 传输 |
| \`SameSite=Strict\` | 跨站不带（防 CSRF） |
| \`Max-Age\` / \`Expires\` | 过期时间 |
| \`Path\` | 生效路径 |
| \`Domain\` | 生效域名 |

## 五、实战四：文件下载

下载大文件时不能一次性 \`read()\`（内存爆炸），要流式分块读取。

### 5.1 流式读取

\`\`\`python
import urllib
with urllib.request.urlopen(url) as r:
    total = int(r.headers.get("Content-Length", 0))
    downloaded = 0
    while True:
        chunk = r.read(8192)  # 每次读 8KB
        if not chunk:
            break
        downloaded += len(chunk)
        save_to_file(chunk)
        # 显示进度
        percent = downloaded * 100 // total if total else 0
        print(f"\\r{percent}%", end="")
\`\`\`

### 5.2 Content-Length 与分块传输

| 传输方式 | 特点 | 判断 |
|---------|------|------|
| **Content-Length** | 服务器知道总大小 | \`r.headers.get('Content-Length')\` |
| **Transfer-Encoding: chunked** | 流式分块，不知总大小 | \`r.headers.get('Transfer-Encoding')\` |

## 六、错误处理与超时

### 6.1 常见错误

\`\`\`python
import socket
import urllib.error

try:
    urllib.request.urlopen(url, timeout=5)
except urllib.error.HTTPError as e:
    # HTTP 错误响应（404、500 等）
    print(f"HTTP {e.code}: {e.reason}")
    error_body = e.read().decode()
except urllib.error.URLError as e:
    # 网络层错误（DNS 失败、连接拒绝）
    print(f"URL Error: {e.reason}")
except socket.timeout:
    print("请求超时")
\`\`\`

### 6.2 超时设置

\`\`\`python
import urllib
# 全局超时
urllib.request.urlopen(url, timeout=10)

# 连接超时 vs 读取超时（需用 socket）
import socket
socket.setdefaulttimeout(10)
\`\`\`

## 七、本章节代码演示说明

代码综合演示四个实战场景：

1. **REST API 服务器**：GET 返回列表，POST 创建数据
2. **urllib 调用 API**：GET 获取列表、POST 添加数据
3. **简易爬虫**：获取 HTML，用 HTMLParser 提取 \`<a href>\`
4. **Cookie 处理**：服务器 Set-Cookie，客户端 CookieJar 自动管理
5. **文件下载**：流式分块读取，计算下载大小

> 💡 所有操作在本地服务器完成，不连外网，确保 5 秒内运行结束。`,
    code: `# -*- coding: utf-8 -*-
# ============================================================
# 第七章代码演示：HTTP 实战
# ------------------------------------------------------------
# 实战场景：
#   1. REST API 服务器（GET 列表 + POST 创建）
#   2. urllib 调用 API（GET 获取、POST 创建）
#   3. 简易爬虫（html.parser 提取链接）
#   4. Cookie 处理（CookieJar 自动管理）
#   5. 文件下载（流式分块读取）
# 约束：全部本地通信，5 秒内完成
# ============================================================
import json
import threading
import time
import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
from html.parser import HTMLParser
from http.server import HTTPServer, BaseHTTPRequestHandler

print("=" * 60)
print("HTTP 实战演示")
print("=" * 60)

# ============================================================
# 数据存储（内存中模拟数据库）
# ============================================================
ITEMS = [
    {"id": 1, "name": "Python 编程", "price": 59},
    {"id": 2, "name": "网络编程", "price": 49}
]
next_id = 3

# ============================================================
# 第一步：构建多路由 REST API 服务器
# ============================================================
class RestApiHandler(BaseHTTPRequestHandler):
    """REST API 服务器"""

    def log_message(self, *args):
        pass  # 屏蔽日志

    def _send_json(self, code, data):
        """发送 JSON 响应的辅助方法"""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ----- GET：获取资源 -----
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            # 首页返回 HTML（供爬虫测试）
            html = (
                b'<html><body>'
                b'<h1>Book List</h1>'
                b'<ul>'
                b'<li><a href="/api/items">API: Items</a></li>'
                b'<li><a href="/about">About Page</a></li>'
                b'<li><a href="https://example.com">External Link</a></li>'
                b'</ul>'
                b'</body></html>'
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)

        elif self.path == "/api/items":
            # REST: GET /api/items 返回列表
            self._send_json(200, {"items": ITEMS, "total": len(ITEMS)})

        elif self.path == "/login":
            # 模拟登录：Set-Cookie 下发 session
            body = json.dumps({"login": "success", "user": "admin"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Set-Cookie", "session=abc123; Path=/; HttpOnly")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        elif self.path == "/profile":
            # 需要登录才能访问
            cookie = self.headers.get("Cookie", "")
            if "session=abc123" in cookie:
                self._send_json(200, {"user": "admin", "role": "admin"})
            else:
                self._send_json(401, {"error": "未登录"})

        elif self.path == "/download":
            # 文件下载（流式，返回固定大小的数据）
            data = b"X" * 500  # 模拟 500 字节的文件内容
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Content-Disposition", "attachment; filename=test.bin")
            self.end_headers()
            self.wfile.write(data)

        else:
            self._send_json(404, {"error": "Not Found"})

    # ----- POST：创建资源 -----
    def do_POST(self):
        global next_id
        if self.path == "/api/items":
            # REST: POST /api/items 创建新资源
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
            # 分配 ID
            data["id"] = next_id
            next_id += 1
            ITEMS.append(data)
            # 返回 201 Created
            self._send_json(201, {"created": data, "total": len(ITEMS)})
        else:
            self._send_json(404, {"error": "Not Found"})

# 启动服务器
server = HTTPServer(("127.0.0.1", 0), RestApiHandler)
port = server.server_address[1]
threading.Thread(target=server.serve_forever, daemon=True).start()
time.sleep(0.3)
base = f"http://127.0.0.1:{port}"
print(f"[服务器] REST API 已启动 {base}")

# ============================================================
# 实战一：REST API 客户端调用
# ============================================================
print("\\n" + "=" * 60)
print("[实战一] REST API 调用")
print("=" * 60)

# 1.1 GET 获取列表
print("\\n[1.1] GET /api/items 获取列表")
with urllib.request.urlopen(f"{base}/api/items") as r:
    print(f"  状态码: {r.status}（200 = 成功）")
    data = json.loads(r.read())
    print(f"  当前共 {data['total']} 项:")
    for item in data["items"]:
        print(f"    - #{item['id']} {item['name']} (¥{item['price']})")

# 1.2 POST 创建新资源
print("\\n[1.2] POST /api/items 创建新资源")
new_item = {"name": "Go 语言圣经", "price": 89}
post_data = json.dumps(new_item, ensure_ascii=False).encode("utf-8")
req = urllib.request.Request(
    f"{base}/api/items",
    data=post_data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as r:
    print(f"  状态码: {r.status}（201 = Created）")
    result = json.loads(r.read())
    print(f"  创建成功: {result['created']}")

# 1.3 再次 GET 验证
print("\\n[1.3] 再次 GET 验证新资源已添加")
with urllib.request.urlopen(f"{base}/api/items") as r:
    data = json.loads(r.read())
    print(f"  现在共 {data['total']} 项")

# ============================================================
# 实战二：简易爬虫
# ============================================================
print("\\n" + "=" * 60)
print("[实战二] 简易爬虫：提取网页链接")
print("=" * 60)

# 定义 HTML 解析器，提取所有 <a href="...">
class LinkExtractor(HTMLParser):
    """HTML 解析器：提取所有链接"""
    def __init__(self):
        super().__init__()
        self.links = []
        self.in_a = False

    def handle_starttag(self, tag, attrs):
        # 遇到开始标签
        if tag == "a":
            self.in_a = True
            for key, value in attrs:
                if key == "href" and value:
                    self.links.append(value)

    def handle_endtag(self, tag):
        if tag == "a":
            self.in_a = False

    def handle_data(self, data):
        if self.in_a:
            # 可以在这里提取链接文本
            pass

# 获取网页 HTML
print("  获取首页 HTML...")
with urllib.request.urlopen(f"{base}/") as r:
    html_content = r.read().decode("utf-8")
    print(f"  HTML 长度: {len(html_content)} 字符")

# 解析提取链接
parser = LinkExtractor()
parser.feed(html_content)
print(f"  提取到 {len(parser.links)} 个链接:")
for i, link in enumerate(parser.links, 1):
    print(f"    {i}. {link}")

# ============================================================
# 实战三：Cookie 处理
# ============================================================
print("\\n" + "=" * 60)
print("[实战三] Cookie 处理（模拟登录）")
print("=" * 60)

# 创建 CookieJar 自动管理 Cookie
cookie_jar = http.cookiejar.CookieJar()
# 创建带 Cookie 处理的 opener
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookie_jar)
)

# 3.1 访问 /login 获取 Cookie
print("\\n[3.1] 访问 /login 获取 Cookie")
with opener.open(f"{base}/login") as r:
    print(f"  状态码: {r.status}")
    data = json.loads(r.read())
    print(f"  响应: {data}")

# 查看 CookieJar 中保存的 Cookie
print(f"  CookieJar 自动保存的 Cookie:")
for cookie in cookie_jar:
    print(f"    {cookie.name} = {cookie.value}")
    print(f"    domain={cookie.domain}, path={cookie.path}")

# 3.2 带 Cookie 访问 /profile
print("\\n[3.2] 带 Cookie 访问 /profile")
with opener.open(f"{base}/profile") as r:
    print(f"  状态码: {r.status}")
    data = json.loads(r.read())
    print(f"  响应: {data}")
    print("  (CookieJar 自动携带了 session=abc123)")

# 3.3 不带 Cookie 访问（对比）
print("\\n[3.3] 不带 Cookie 访问 /profile（对比）")
try:
    urllib.request.urlopen(f"{base}/profile")
except urllib.error.HTTPError as e:
    print(f"  状态码: {e.code}（401 = 未授权）")
    print(f"  错误: {json.loads(e.read())}")

# ============================================================
# 实战四：文件下载（流式读取）
# ============================================================
print("\\n" + "=" * 60)
print("[实战四] 文件下载（流式分块读取）")
print("=" * 60)

print("\\n[4.1] 下载 /download 文件")
with urllib.request.urlopen(f"{base}/download") as r:
    # 获取文件信息
    content_length = r.headers.get("Content-Length", "?")
    content_type = r.headers.get("Content-Type")
    disposition = r.headers.get("Content-Disposition", "")
    print(f"  Content-Length: {content_length} 字节")
    print(f"  Content-Type: {content_type}")
    print(f"  Content-Disposition: {disposition}")

    # 流式分块读取（模拟大文件下载）
    total_size = int(content_length) if content_length.isdigit() else 0
    downloaded = 0
    chunk_size = 100  # 每次读 100 字节（演示用，实际建议 8192）
    chunk_count = 0

    while True:
        chunk = r.read(chunk_size)
        if not chunk:
            break
        downloaded += len(chunk)
        chunk_count += 1
        # 模拟显示进度
        if total_size > 0:
            percent = downloaded * 100 // total_size
            print(f"  读取第 {chunk_count} 块: {len(chunk)} 字节, "
                  f"进度 {percent}% ({downloaded}/{total_size})")

    print(f"\\n  下载完成!")
    print(f"  总大小: {downloaded} 字节")
    print(f"  分块数: {chunk_count} 块")

# ============================================================
# 关闭服务器
# ============================================================
server.shutdown()

# ============================================================
# 总结
# ============================================================
print("\\n" + "=" * 60)
print("[全章总结]")
print("=" * 60)
print("实战一: REST API 服务器")
print("  - GET /api/items 获取列表, POST /api/items 创建资源")
print("  - 状态码: 200 OK, 201 Created, 404 Not Found")
print("实战二: 简易爬虫")
print("  - urllib.request 获取 HTML")
print("  - html.parser.HTMLParser 提取 <a href>")
print("实战三: Cookie 处理")
print("  - http.cookiejar.CookieJar 存储 Cookie")
print("  - HTTPCookieProcessor 自动携带 Cookie")
print("实战四: 文件下载")
print("  - response.read(chunk_size) 流式分块读取")
print("  - Content-Length 获取总大小, 计算下载进度")
print("通用:")
print("  - HTTPError 处理 4xx/5xx, URLError 处理网络错误")
print("  - urlopen(url, timeout=) 设置超时")`,
  },
];
