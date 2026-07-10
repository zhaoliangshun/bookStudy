// =============================================================
// 后端开发综合教程 - 第 2 批章节（基础与网络 6-10）
// -------------------------------------------------------------
// 本文件包含以下 5 章（基础与网络分组后 5 章）：
//   1. backend-websocket      — WebSocket 与长连接
//   2. backend-proxy          — 反向代理与 Nginx
//   3. backend-lb             — 负载均衡
//   4. backend-cdn            — CDN 与静态资源
//   5. backend-cookie-session — Cookie 与 Session 机制
//
// 约定：
//   - content 用中文讲解通用后端原理，并用多种语言
//     （Java/Go/Python/Node.js）的伪代码示例对照说明
//   - code 是可直接执行的 Node.js 代码，通过 /api/run-backend
//     在共享沙箱中运行（无 http/net/ws，用 events/自定义对象模拟）
//   - 不依赖外部 npm 包
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：WebSocket 与长连接
  // =========================================================
  {
    id: "backend-websocket",
    group: "基础与网络",
    icon: "🔁",
    title: "WebSocket 与长连接",
    content: `# WebSocket 与长连接

## 为什么需要 WebSocket

在深入 WebSocket 之前，我们必须先理解一个根本问题：**HTTP 协议本身是请求-响应模型，它天生不适合服务器主动推送数据**。传统的 HTTP 是"一问一答"——客户端发请求，服务端给响应，连接就结束了。如果服务端有新数据想主动告诉客户端，HTTP 做不到。

这个限制催生了各种"实时通信"的变通方案。我们逐一分析它们的原理和局限。

### 1. 短轮询（Short Polling）

最朴素的想法：客户端每隔 N 秒发一次 HTTP 请求，问服务端"有新消息吗？"。

\`\`\`javascript
// 客户端短轮询（伪代码）
setInterval(async () => {
  const res = await fetch('/api/messages?since=' + lastId);
  const msgs = await res.json();
  if (msgs.length > 0) {
    renderMessages(msgs);
  }
}, 3000); // 每 3 秒问一次
\`\`\`

**优点**：实现极简，服务端不用改，纯靠客户端定时请求。

**缺点**：
- 大部分请求是"空轮询"——服务端没有新数据，白白浪费带宽和连接资源
- 实时性差——如果间隔 3 秒，最坏情况下消息延迟 3 秒
- 服务端 QPS 被无意义请求撑高——1 万用户 × 每 3 秒 1 次 = 3333 QPS，大部分返回空
- HTTP 头开销大——每次请求都带 Cookie、UA 等头信息，真正的数据可能就几个字节

**适用场景**：数据更新频率低且不要求强实时（如每分钟检查一次系统状态）。

### 2. 长轮询（Long Polling）

为了解决短轮询的空转问题，长轮询让服务端"hold 住"请求：客户端发请求后，服务端不立即响应，而是等到有新数据（或超时）才返回。客户端收到响应后立刻发下一次请求。

\`\`\`javascript
// 客户端长轮询（伪代码）
async function longPoll() {
  while (true) {
    try {
      const res = await fetch('/api/messages/long-poll?since=' + lastId);
      const msgs = await res.json();
      renderMessages(msgs);
    } catch (e) {
      // 网络错误，等一会重试
      await sleep(1000);
    }
  }
}
longPoll();
\`\`\`

\`\`\`python
# Python 服务端长轮询（伪代码）
import asyncio

async def long_poll_handler(request):
    since = request.args.get('since')
    for _ in range(60):  # 最多等 60 秒
        messages = await get_new_messages(since)
        if messages:
            return json_response(messages)
        await asyncio.sleep(1)  # 每秒检查一次
    return json_response([])  # 超时返回空
\`\`\`

**优点**：
- 比短轮询大幅减少无效请求
- 实时性较好——有数据时服务端立即返回
- 兼容性好——纯 HTTP，不需要特殊协议

**缺点**：
- 每个消息仍需一次完整的 HTTP 请求-响应（头部开销）
- 服务端需要维持大量挂起的连接（线程/协程占用）
- 实现复杂——要处理超时、断连、消息顺序
- 本质仍是"单向"——客户端到服务端的发送仍需另开请求

**适用场景**：不能使用 WebSocket 的环境（如某些企业内网代理会阻断 WebSocket 升级），或只需服务端到客户端的单向推送。

### 3. SSE（Server-Sent Events）

SSE 是 HTML5 标准的一部分，专门为"服务端到客户端的单向推送"设计。它基于 HTTP 长连接，服务端可以持续往连接上写数据。

\`\`\`javascript
// 客户端 SSE
const source = new EventSource('/api/stream');
source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  renderMessage(data);
};
source.onerror = () => {
  // 浏览器会自动重连
  console.log('连接断开，浏览器自动重连...');
};
\`\`\`

\`\`\`go
// Go 服务端 SSE（伪代码）
func sseHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")

    flusher, _ := w.(http.Flusher)
    for {
        msg := <-messageChan // 从消息通道取数据
        fmt.Fprintf(w, "data: %s\\n\\n", msg)
        flusher.Flush() // 立即推送
    }
}
\`\`\`

SSE 的数据格式是纯文本：
\`\`\`
data: {"user":"alice","text":"hello"}\\n\\n
data: {"user":"bob","text":"hi"}\\n\\n
\`\`\`

**优点**：
- 标准化，浏览器原生支持 EventSource API
- 自动重连（浏览器内置）
- 轻量——基于 HTTP，无需协议升级
- 支持事件类型（event: 自定义事件名）

**缺点**：
- **单向**——只能服务端到客户端，客户端到服务端仍需 HTTP 请求
- 浏览器连接数限制——同一域名最多 6 个 SSE 连接（HTTP/1.1）
- 只支持文本（UTF-8），不支持二进制
- IE/旧 Edge 不支持（需 polyfill）

**适用场景**：股票行情、新闻推送、日志流、通知——凡是只需服务端推送的场景，SSE 比 WebSocket 更轻量。

### 4. 三种方案对比

| 特性 | 短轮询 | 长轮询 | SSE | WebSocket |
|------|--------|--------|-----|-----------|
| 通信方向 | 双向（多次请求） | 双向（多次请求） | 单向（S→C） | 全双工 |
| 协议 | HTTP | HTTP | HTTP | WebSocket（基于 HTTP 升级） |
| 连接复用 | 否 | 部分 | 是（长连接） | 是（长连接） |
| 实时性 | 差（秒级延迟） | 较好 | 好 | 极好 |
| 二进制支持 | 是 | 是 | 否 | 是 |
| 浏览器支持 | 全部 | 全部 | 现代浏览器 | 现代浏览器 |
| 服务端复杂度 | 低 | 中 | 低 | 中高 |
| 资源消耗 | 高 | 中 | 低 | 低 |
| 自动重连 | 无 | 需手动 | 浏览器内置 | 需手动 |

**结论**：如果只需服务端推送，用 SSE；如果需要全双工实时通信（聊天、协作编辑、游戏），用 WebSocket。

---

## WebSocket 协议详解

WebSocket 协议（RFC 6455）在 2011 年成为国际标准。它的核心思想是：**先借 HTTP 完成握手，然后"劫持"这条 TCP 连接，把它升级为全双工的 WebSocket 连接**。

### 1. 握手过程（Opening Handshake）

WebSocket 连接以一个 HTTP GET 请求开始，但携带了特殊的升级头：

\`\`\`http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Extensions: permessage-deflate
\`\`\`

关键头部：
- \`Upgrade: websocket\` 和 \`Connection: Upgrade\`：要求升级协议
- \`Sec-WebSocket-Key\`：客户端生成的随机 Base64 值，用于安全校验
- \`Sec-WebSocket-Version: 13\`：协议版本（13 是当前标准版本）
- \`Origin\`：客户端来源，服务端可做跨域校验
- \`Sec-WebSocket-Protocol\`：可选，协商子协议（如 chat）
- \`Sec-WebSocket-Extensions\`：可选，协商扩展（如压缩）

服务端同意升级后返回 101 响应：

\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

**Sec-WebSocket-Accept 的计算方式**：

服务端把客户端发来的 \`Sec-WebSocket-Key\` 拼上一个固定 GUID（\`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\`），做 SHA-1 哈希，再 Base64 编码：

\`\`\`python
import hashlib, base64

def compute_accept(key):
    GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    combined = key + GUID
    sha1_hash = hashlib.sha1(combined.encode()).digest()
    return base64.b64encode(sha1_hash).decode()
\`\`\`

这个校验不是为了加密，而是确认服务端"懂"WebSocket 协议——防止普通 HTTP 服务端误响应。

\`\`\`java
// Java 计算 Sec-WebSocket-Accept
import java.security.MessageDigest;
import java.util.Base64;

public static String computeAccept(String key) throws Exception {
    String guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    MessageDigest md = MessageDigest.getInstance("SHA-1");
    md.update((key + guid).getBytes("UTF-8"));
    byte[] hash = md.digest();
    return Base64.getEncoder().encodeToString(hash);
}
\`\`\`

### 2. 数据帧格式（Data Framing）

握手成功后，双方在这条 TCP 连接上收发的不再是 HTTP 文本，而是**二进制帧**。WebSocket 帧格式如下：

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

逐字段说明：

| 字段 | 位数 | 说明 |
|------|------|------|
| FIN | 1 | 是否是消息的最后一个分片。1=完整消息或最后一片 |
| RSV1-3 | 3 | 保留位，扩展用（如 permessage-deflate 压缩用 RSV1） |
| opcode | 4 | 操作码，标识帧类型 |
| MASK | 1 | 载荷是否被掩码。客户端→服务端必须为 1，服务端→客户端必须为 0 |
| Payload len | 7 | 载荷长度。0-125 直接表示；126 表示后 2 字节是长度；127 表示后 8 字节是长度 |
| Masking-key | 0/32 | 掩码密钥，MASK=1 时存在，4 字节 |
| Payload Data | 变长 | 实际数据 |

### 3. Opcode（操作码）

| Opcode | 含义 | 说明 |
|--------|------|------|
| 0x0 | continuation | 分片消息的后续帧 |
| 0x1 | text frame | UTF-8 文本数据 |
| 0x2 | binary frame | 二进制数据 |
| 0x8 | close | 关闭连接帧 |
| 0x9 | ping | 心跳请求 |
| 0xA | pong | 心跳响应 |
| 0x3-7, 0xB-F | 保留 | 未来扩展用 |

最常用的是 0x1（文本）和 0x2（二进制）。0x8-0xA 是控制帧，用于连接管理。

### 4. 掩码机制（Masking）

**客户端发送的每一帧都必须经过掩码处理**，服务端发送的帧不掩码。掩码的目的是防止中间代理缓存中毒——不是加密。

掩码算法：用 4 字节掩码密钥与载荷做 XOR：

\`\`\`javascript
// 掩码/解掩码（同一个操作，XXOR 是可逆的）
function mask(payload, maskingKey) {
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) {
    masked[i] = payload[i] ^ maskingKey[i % 4];
  }
  return masked;
}
\`\`\`

\`\`\`go
// Go 掩码处理
func maskPayload(payload, key []byte) {
    for i := range payload {
        payload[i] ^= key[i%4]
    }
}
\`\`\`

### 5. 分片（Fragmentation）

一条大消息可以拆成多个帧发送。第一个帧的 opcode 是 0x1 或 0x2（文本或二进制），FIN=0；后续帧 opcode=0x0（continuation），最后一个帧 FIN=1。

分片的意义：
- **流式发送**：不需要事先知道消息总大小，可以边产生边发
- **多路复用**：控制帧（如 ping）可以插入到分片消息之间，不被大消息阻塞
- **限制**：一条消息的所有分片必须同类型（不能文本帧后跟二进制 continuation）

### 6. 关闭握手（Closing Handshake）

关闭连接不是直接断 TCP，而是先发 close 帧（opcode=0x8）：

\`\`\`
端 A 发 close 帧 → 端 B 收到后回 close 帧 → 双方关闭 TCP 连接
\`\`\`

close 帧可携带状态码和原因：

| 状态码 | 含义 |
|--------|------|
| 1000 | 正常关闭 |
| 1001 | 端点离开（如页面关闭） |
| 1002 | 协议错误 |
| 1003 | 不支持的数据类型 |
| 1006 | 异常关闭（未发 close 帧就断了，保留值，不可发送） |
| 1007 | 数据格式错误（非 UTF-8） |
| 1008 | 策略违反 |
| 1009 | 消息过大 |
| 1011 | 内部错误 |
| 4000-4999 | 应用自定义 |

---

## WebSocket 生命周期

一个完整的 WebSocket 连接经历以下阶段：

\`\`\`
1. 建立连接（握手）
   ↓
2. 连接就绪（open 事件）
   ↓
3. 消息收发（message 事件）←→ 可双向通信
   ↓
4. 心跳保活（ping/pong）
   ↓
5. 异常断连 / 主动关闭（close 事件）
   ↓
6. 断线重连（可选，回到步骤 1）
\`\`\`

### 1. 连接建立

\`\`\`javascript
// 浏览器端
const ws = new WebSocket('wss://server.example.com/chat', ['chat-protocol']);
ws.onopen = () => {
  console.log('连接已建立');
  ws.send('Hello Server!');
};
ws.onmessage = (event) => {
  console.log('收到:', event.data);
};
ws.onerror = (error) => {
  console.error('连接错误', error);
};
ws.onclose = (event) => {
  console.log(\`连接关闭: \${event.code} \${event.reason}\`);
};
\`\`\`

\`\`\`python
# Python websockets 库
import asyncio
import websockets

async def client():
    uri = "wss://server.example.com/chat"
    async with websockets.connect(uri) as ws:
        await ws.send("Hello Server!")
        response = await ws.recv()
        print(f"收到: {response}")

asyncio.run(client())
\`\`\`

### 2. 心跳保活

WebSocket 连接是长连接，但中间的代理、负载均衡器可能会因为"长时间无数据"而断开连接。心跳就是定期发小数据包，告诉中间设备"这条连接还活着"。

WebSocket 协议内置了 ping/pong 控制帧：
- 一方发 ping（0x9），另一方必须回 pong（0xA）
- pong 的载荷应与 ping 的载荷一致
- 大多数库会自动响应 ping，应用层无感

但有时应用层也要自己做心跳（比如某些代理不透传 ping/pong）：

\`\`\`javascript
// 应用层心跳
class Heartbeat {
  constructor(ws, interval = 30000, timeout = 10000) {
    this.ws = ws;
    this.interval = interval;
    this.timeout = timeout;
    this.timer = null;
    this.timeoutTimer = null;
    this.alive = true;
  }

  start() {
    this.timer = setInterval(() => {
      if (!this.alive) {
        console.log('心跳超时，主动断连');
        this.ws.terminate();
        return;
      }
      this.alive = false;
      this.ws.send(JSON.stringify({ type: 'ping' }));

      this.timeoutTimer = setTimeout(() => {
        if (!this.alive) {
          console.log('pong 超时');
          this.ws.terminate();
        }
      }, this.timeout);
    }, this.interval);
  }

  onPong() {
    this.alive = true;
    clearTimeout(this.timeoutTimer);
  }

  stop() {
    clearInterval(this.timer);
    clearTimeout(this.timeoutTimer);
  }
}
\`\`\`

### 3. 断线重连

网络不稳定时连接会断开。客户端需要自动重连，但不能疯狂重试（会导致服务端雪崩）。**指数退避（Exponential Backoff）** 是标准做法：

\`\`\`javascript
// 指数退避重连
class ReconnectWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.maxRetries = options.maxRetries || 10;
    this.maxDelay = options.maxDelay || 30000;
    this.baseDelay = options.baseDelay || 1000;
    this.retries = 0;
    this.ws = null;
    this.shouldReconnect = true;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      console.log('连接成功，重置重试次数');
      this.retries = 0;
    };
    this.ws.onclose = () => {
      if (this.shouldReconnect) {
        this.reconnect();
      }
    };
    this.ws.onmessage = (e) => { /* 处理消息 */ };
  }

  reconnect() {
    if (this.retries >= this.maxRetries) {
      console.log('达到最大重试次数，停止重连');
      return;
    }
    // 指数退避 + 随机抖动
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.retries),
      this.maxDelay
    ) + Math.random() * 1000;
    this.retries++;
    console.log(\`\${delay}ms 后第 \${this.retries} 次重连\`);
    setTimeout(() => this.connect(), delay);
  }

  close() {
    this.shouldReconnect = false;
    this.ws.close();
  }
}
\`\`\`

### 4. 优雅关闭

关闭连接时要注意：
- 先发关闭原因（close 帧带状态码和原因文本）
- 等待对方的 close 帧响应
- 清理资源（定时器、事件监听、引用计数）
- 不要在 close 后继续 send

\`\`\`java
// Java Spring WebSocket 优雅关闭
@Component
public class ChatHandler extends TextWebSocketHandler {
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = (String) session.getAttributes().get("userId");
        sessionRegistry.remove(userId);
        // 通知房间内其他用户
        broadcastToRoom(roomId, userId + " 离开了房间");
        // 清理心跳定时器
        scheduledFutures.remove(userId);
    }
}
\`\`\`

---

## 广播与房间机制

WebSocket 的经典场景是聊天室、实时通知。这需要**广播**（一条消息发给多个连接）和**房间**（只发给同一房间的连接）。

### 1. 聊天室模型

\`\`\`
┌─────────┐     ┌───────────────────────┐     ┌─────────┐
│ 用户 A  │ ←→  │   WebSocket 服务端    │  ←→ │ 用户 B  │
│ 房间1   │     │                       │     │ 房间1   │
└─────────┘     │  房间1: [A, B, C]     │     └─────────┘
                │  房间2: [D, E]        │
┌─────────┐     │                       │     ┌─────────┐
│ 用户 D  │ ←→  │  广播: 给房间1发消息  │  ←→ │ 用户 C  │
│ 房间2   │     │  → 遍历房间1所有连接  │     │ 房间1   │
└─────────┘     └───────────────────────┘     └─────────┘
\`\`\`

### 2. Node.js 实现房间

\`\`\`javascript
class Room {
  constructor(name) {
    this.name = name;
    this.clients = new Set();
  }
  join(client) { this.clients.add(client); }
  leave(client) { this.clients.delete(client); }
  broadcast(message, except = null) {
    for (const client of this.clients) {
      if (client !== except) {
        client.send(message);
      }
    }
  }
}

class WebSocketServer {
  constructor() {
    this.rooms = new Map(); // roomName -> Room
    this.clients = new Map(); // clientId -> connection
  }
  joinRoom(roomName, client) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Room(roomName));
    }
    this.rooms.get(roomName).join(client);
  }
  broadcastToRoom(roomName, message, except = null) {
    const room = this.rooms.get(roomName);
    if (room) room.broadcast(message, except);
  }
}
\`\`\`

### 3. 通知推送模型

通知推送与聊天室不同——它通常是"给某个用户的所有设备"推送：

\`\`\`go
// Go 通知推送
type PushServer struct {
    mu      sync.RWMutex
    // userId -> 多个连接（用户可能多端登录）
    clients map[string][]*websocket.Conn
}

func (s *PushServer) PushToUser(userID string, msg []byte) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    conns := s.clients[userID]
    for _, conn := range conns {
        conn.WriteMessage(websocket.TextMessage, msg)
    }
}
\`\`\`

---

## WebSocket 安全

### 1. Origin 校验

浏览器在建立 WebSocket 连接时会带 Origin 头。服务端应校验 Origin 是否在白名单内，防止跨站 WebSocket 劫持（CSWSH）。

\`\`\`javascript
// Node.js ws 库 Origin 校验
const allowedOrigins = ['https://example.com', 'https://app.example.com'];
const wss = new WebSocketServer({
  verifyClient: (info) => {
    return allowedOrigins.includes(info.origin);
  }
});
\`\`\`

\`\`\`python
# Python websockets Origin 校验
async def handler(websocket):
    origin = websocket.request_headers.get('Origin', '')
    if origin not in ALLOWED_ORIGINS:
        await websocket.close(code=1008, reason='Origin not allowed')
        return
    # 正常处理...
\`\`\`

### 2. 鉴权

WebSocket 握手是 HTTP 请求，可以带 Cookie 或 Authorization 头：

\`\`\`javascript
// 方式1：URL 参数传 token（不推荐，可能被日志记录）
const ws = new WebSocket('wss://server/chat?token=' + jwtToken);

// 方式2：Cookie（推荐，HttpOnly 防 XSS）
// 浏览器会自动带同源 Cookie，无需额外处理
const ws = new WebSocket('wss://server/chat');

// 方式3：子协议头传 token
const ws = new WebSocket('wss://server/chat', ['bearer.' + jwtToken]);
\`\`\`

服务端校验：

\`\`\`java
// Java Spring WebSocket 鉴权
public class AuthInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        // 从 HTTP 头取 token
        String token = request.getHeaders().getFirst("Authorization");
        if (token == null || !validateToken(token)) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false; // 拒绝握手
        }
        attributes.put("userId", extractUserId(token));
        return true;
    }
}
\`\`\`

### 3. wss（WebSocket over TLS）

就像 HTTPS 之于 HTTP，wss 是 WebSocket over TLS。生产环境**必须**用 wss：
- 防止中间人窃听/篡改
- 某些代理只允许 wss 通过
- 浏览器混合内容策略：HTTPS 页面只能连 wss，不能连 ws

### 4. 其他安全要点

- **消息大小限制**：限制单条消息大小，防止内存耗尽攻击
- **频率限制**：限制单连接发送频率，防刷屏
- **输入校验**：WebSocket 消息也要做参数校验，防注入
- **DOS 防护**：限制单 IP 连接数，防止连接泛洪

---

## 生产实践

### 1. 连接数管理

单机 WebSocket 连接数受以下因素限制：
- **文件描述符**：每个连接占一个 fd，默认 ulimit 1024，需调高到 65535+
- **内存**：每个连接约 50-100KB（缓冲区 + 上下文），10 万连接约 5-10GB
- **CPU**：消息收发、编码解码、业务逻辑
- **端口**：服务端只占 1 个端口，客户端端口是临时端口，不影响

优化：
\`\`\`bash
# Linux 内核参数调优
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535
# 文件描述符
ulimit -n 65535
\`\`\`

\`\`\`go
// Go gorilla/websocket 单机百万连接优化
upgrader := websocket.Upgrader{
    ReadBufferSize:  1024,  // 读缓冲，不要太大
    WriteBufferSize: 1024,  // 写缓冲
}
// 控制每个连接的 goroutine 数量（通常 2 个：读、写）
\`\`\`

### 2. 消息队列结合

高并发场景下，WebSocket 服务端不直接处理业务，而是与消息队列结合：

\`\`\`
客户端 ←→ WebSocket 网关 ←→ Redis/RabbitMQ ←→ 业务服务
                                ↑
                           其他服务推送消息到队列
\`\`\`

好处：
- WebSocket 网关只负责连接管理，无状态
- 业务服务不直接操作连接，解耦
- 消息队列削峰填谷

\`\`\`javascript
// WebSocket 网关订阅 Redis
const redis = require('redis');
const sub = redis.createClient();
sub.subscribe('chat:room1');
sub.on('message', (channel, message) => {
  // 收到 Redis 推送，广播给对应房间的连接
  const room = channel.split(':')[1];
  broadcastToRoom(room, message);
});
\`\`\`

### 3. 集群广播：Redis Pub/Sub

单机 WebSocket 无法支撑大规模在线用户。多机部署时，用户 A 连在节点 1，用户 B 连在节点 2，A 发消息给 B 需要跨节点。

**解决方案：Redis Pub/Sub 做跨节点广播**

\`\`\`
节点1 ──┐                          ┌── 节点1 的连接
        ├── Redis Pub/Sub ────────┤
节点2 ──┘                          └── 节点2 的连接
\`\`\`

\`\`\`python
# Python 集群广播
import redis
import asyncio
import websockets

r = redis.Redis()
pubsub = r.pubsub()

async def broadcast_handler(websocket):
    async for message in websocket:
        # 收到消息，发布到 Redis
        r.publish('global_chat', message)

async def subscribe_redis():
    pubsub.subscribe('global_chat')
    for message in pubsub.listen():
        if message['type'] == 'message':
            # 广播给本节点的所有连接
            for ws in connected_clients:
                await ws.send(message['data'])

asyncio.create_task(subscribe_redis())
\`\`\`

\`\`\`java
// Java 集群广播（Spring + Redis）
@Service
public class ClusterBroadcastService {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private final RedisMessageListener listener = new RedisMessageListener();

    @PostConstruct
    public void init() {
        // 订阅 Redis 频道
        redisTemplate.convertAndSend("ws:global", "");
    }

    public void broadcast(String channel, String message) {
        // 发布到 Redis，所有节点都能收到
        redisTemplate.convertAndSend("ws:" + channel, message);
    }

    class RedisMessageListener implements MessageListener {
        @Override
        public void onMessage(Message message, byte[] pattern) {
            String body = new String(message.getBody());
            String channel = new String(message.getChannel());
            // 广播给本节点的连接
            localSessions.get(channel).forEach(s -> s.sendMessage(body));
        }
    }
}
\`\`\`

### 4. 连接亲和性

对于有状态连接（如游戏对战），可以用一致性哈希把同一对战的用户路由到同一节点，减少跨节点通信。

---

## 多语言实现对照

### Node.js（ws 库）

\`\`\`javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  ws.on('message', (msg) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });
  ws.on('close', () => console.log('client disconnected'));
  ws.on('ping', () => ws.pong()); // 自动 pong
});
\`\`\`

### Java（Spring WebSocket）

\`\`\`java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatHandler(), "/chat")
                .setAllowedOrigins("*")
                .addInterceptors(new AuthInterceptor());
    }
}

@Component
public class ChatHandler extends TextWebSocketHandler {
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) s.sendMessage(message);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }
}
\`\`\`

### Go（gorilla/websocket）

\`\`\`go
package main

import (
    "log"
    "net/http"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan []byte)

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil { log.Println(err); return }
    defer ws.Close()
    clients[ws] = true

    for {
        _, msg, err := ws.ReadMessage()
        if err != nil { delete(clients, ws); break }
        broadcast <- msg
    }
}

func handleBroadcast() {
    for msg := range broadcast {
        for client := range clients {
            client.WriteMessage(websocket.TextMessage, msg)
        }
    }
}

func main() {
    go handleBroadcast()
    http.HandleFunc("/ws", handleWebSocket)
    http.ListenAndServe(":8080", nil)
}
\`\`\`

### Python（websockets）

\`\`\`python
import asyncio
import websockets

connected = set()

async def handler(websocket):
    connected.add(websocket)
    try:
        async for message in websocket:
            # 广播给所有连接
            await asyncio.gather(
                *[ws.send(message) for ws in connected]
            )
    finally:
        connected.discard(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # 永久运行

asyncio.run(main())
\`\`\`

---

## 常见坑与最佳实践

### 坑 1：代理不透传 WebSocket

某些 Nginx/代理默认不转发 Upgrade 头，导致握手失败。

**解决**：Nginx 配置 proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";

\`\`\`nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s; # 长连接超时调大
}
\`\`\`

### 坑 2：连接泄漏

断连后没清理引用，导致连接对象无法 GC，内存泄漏。

**解决**：在 close 事件中彻底清理（移出 rooms、清理 timers、移除 listeners）。

### 坑 3：心跳间隔太长或太短

太长（如 5 分钟）→ 中间代理可能已断开，用户感知不到。
太短（如 5 秒）→ 大量心跳包消耗带宽和 CPU。

**经验值**：30-60 秒发一次心跳，10-15 秒无响应判定断连。

### 坑 4：消息顺序

WebSocket 保证单连接上的消息顺序，但多连接（如分片后并行发送）不保证。如果有顺序要求，用序号 + 前端缓冲。

### 坑 5：大消息阻塞

发送大文件（如 10MB）会阻塞连接上的其他消息。

**解决**：分片发送，或用二进制流 + 序号，让控制帧能穿插。

### 坑 6：重连风暴

服务端重启后，所有客户端同时重连，造成"惊群"。

**解决**：指数退避 + 随机抖动，分散重连时间。

---

## WebSocket vs HTTP/2 vs HTTP/3

| 特性 | WebSocket | HTTP/2 | HTTP/3 |
|------|-----------|--------|--------|
| 双向通信 | 是 | 是（流） | 是（流） |
| 多路复用 | 否（单连接单流） | 是 | 是 |
| 服务端推送 | 应用层 | Server Push（已弃用） | Server Push |
| 协议升级 | 需要 HTTP 升级 | 原生 | 原生（QUIC） |
| 适用场景 | 实时双向 | API/网页 | API/网页 |

HTTP/2 的多路复用让"一个 TCP 连接上多个请求"成为可能，但它仍是请求-响应模型。WebSocket 的全双工在 HTTP/2 时代仍有不可替代的价值——服务端可以随时主动推送，不需要客户端先发请求。

---

## 实战要点总结

1. **选型**：服务端推送选 SSE，双向实时选 WebSocket
2. **握手**：理解 101 Switching Protocols 和 Sec-WebSocket-Accept 计算
3. **帧**：掌握 opcode、掩码、分片机制
4. **心跳**：30-60 秒 ping，超时判定断连
5. **重连**：指数退避 + 随机抖动
6. **安全**：Origin 校验 + wss + 鉴权
7. **集群**：Redis Pub/Sub 做跨节点广播
8. **优化**：调高 fd 限制、控制单连接内存、消息大小限制
9. **监控**：连接数、消息量、断连率、重连成功率
10. **降级**：WebSocket 不可用时降级为 SSE 或长轮询

---

## 章节小结

WebSocket 通过 HTTP 升级握手建立全双工长连接，解决了 HTTP 请求-响应模型无法服务端主动推送的痛点。理解握手过程、帧格式、心跳机制、断线重连是使用 WebSocket 的基础。在生产环境中，集群广播、连接管理、安全防护是 WebSocket 系统的三大挑战，通常借助 Redis Pub/Sub、连接数监控、Origin 校验等手段解决。

下一章我们将学习反向代理与 Nginx，它是 WebSocket 生产部署中不可或缺的一环——负载均衡、SSL 终止、协议升级转发都离不开它。`,
    code: `// ===================================================
// WebSocket 长连接模拟（沙箱环境，无 ws 模块）
// 用 EventEmitter 模拟 WebSocket 服务端与客户端
// ===================================================
const { EventEmitter } = require('events');
const crypto = require('crypto');

// ---------- 模拟 WebSocket 连接 ----------
class MockWebSocket extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.alive = true;
    this.rooms = new Set();
    this.lastPong = Date.now();
  }
  send(data) {
    if (!this.alive) return;
    const msg = typeof data === 'string' ? data : JSON.stringify(data);
    this.emit('message-in', msg); // 模拟对端收到消息
    return true;
  }
  ping() { this.emit('ping'); }
  close(code = 1000, reason = 'normal') {
    this.alive = false;
    this.emit('close', { code, reason });
  }
}

// ---------- WebSocket 服务端 ----------
class WebSocketServer {
  constructor() {
    this.connections = new Map();   // id -> MockWebSocket
    this.rooms = new Map();          // roomName -> Set<id>
    this.heartbeatTimer = null;
    this.heartbeatInterval = 200;    // 演示用 200ms（生产 30s）
    this.heartbeatTimeout = 150;     // 150ms 无 pong 判定断连
  }

  // 接受新连接（模拟握手成功）
  accept(id) {
    const ws = new MockWebSocket(id);
    this.connections.set(id, ws);
    ws.on('ping', () => {
      ws.lastPong = Date.now();
      ws.emit('pong'); // 自动回 pong
    });
    console.log(\`[握手] 客户端 \${id} 已连接 (当前在线: \${this.connections.size})\`);
    return ws;
  }

  // 房间管理
  joinRoom(roomName, wsId) {
    if (!this.rooms.has(roomName)) this.rooms.set(roomName, new Set());
    this.rooms.get(roomName).add(wsId);
    const ws = this.connections.get(wsId);
    if (ws) ws.rooms.add(roomName);
    console.log(\`[房间] \${wsId} 加入房间 \${roomName} (房间人数: \${this.rooms.get(roomName).size})\`);
  }
  leaveRoom(roomName, wsId) {
    const room = this.rooms.get(roomName);
    if (room) room.delete(wsId);
    const ws = this.connections.get(wsId);
    if (ws) ws.rooms.delete(roomName);
  }

  // 广播到房间
  broadcastToRoom(roomName, message, exceptId = null) {
    const room = this.rooms.get(roomName);
    if (!room) return 0;
    let count = 0;
    for (const id of room) {
      if (id === exceptId) continue;
      const ws = this.connections.get(id);
      if (ws && ws.alive) { ws.send(message); count++; }
    }
    return count;
  }

  // 全局广播
  broadcast(message, exceptId = null) {
    let count = 0;
    for (const [id, ws] of this.connections) {
      if (id === exceptId) continue;
      if (ws.alive) { ws.send(message); count++; }
    }
    return count;
  }

  // 心跳检测：定时 ping，超时未 pong 则断开
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      for (const [id, ws] of this.connections) {
        if (!ws.alive) continue;
        if (now - ws.lastPong > this.heartbeatTimeout) {
          console.log(\`[心跳] \${id} 超时未响应，主动断开\`);
          this.disconnect(id, 1001, 'heartbeat timeout');
        } else {
          ws.ping(); // 发心跳
        }
      }
    }, this.heartbeatInterval);
  }

  disconnect(id, code = 1000, reason = 'normal') {
    const ws = this.connections.get(id);
    if (!ws) return;
    // 清理房间
    for (const room of ws.rooms) this.leaveRoom(room, id);
    ws.close(code, reason);
    this.connections.delete(id);
    console.log(\`[断开] \${id} 已断开 (原因: \${reason}, 剩余在线: \${this.connections.size})\`);
  }

  stats() {
    const roomInfo = {};
    for (const [name, members] of this.rooms) roomInfo[name] = members.size;
    return { online: this.connections.size, rooms: roomInfo };
  }
}

// ---------- 模拟客户端（带断线重连） ----------
class ReconnectClient {
  constructor(server, id, opts = {}) {
    this.server = server;
    this.id = id;
    this.baseDelay = opts.baseDelay || 50;
    this.maxDelay = opts.maxDelay || 500;
    this.maxRetries = opts.maxRetries || 3;
    this.retries = 0;
    this.ws = null;
    this.shouldReconnect = true;
    this.received = [];
  }
  connect() {
    this.ws = this.server.accept(this.id + (this.retries ? '#' + this.retries : ''));
    this.ws.on('message-in', (msg) => this.received.push(msg));
    this.retries = 0;
    return this.ws;
  }
  reconnect() {
    if (!this.shouldReconnect || this.retries >= this.maxRetries) {
      console.log(\`[重连] \${this.id} 达到最大重试次数，停止重连\`);
      return null;
    }
    const delay = Math.min(this.baseDelay * Math.pow(2, this.retries), this.maxDelay)
                  + Math.floor(Math.random() * 20);
    this.retries++;
    console.log(\`[重连] \${this.id} 将在 \${delay}ms 后第 \${this.retries} 次重连\`);
    setTimeout(() => { if (this.shouldReconnect) this.connect(); }, delay);
  }
}

// ---------- 演示场景 ----------
(async () => {
  const server = new WebSocketServer();
  server.startHeartbeat();

  console.log('===== 场景1：聊天室广播 =====');
  const alice = server.accept('alice');
  const bob = server.accept('bob');
  const carol = server.accept('carol');

  server.joinRoom('general', 'alice');
  server.joinRoom('general', 'bob');
  server.joinRoom('general', 'carol');

  // Alice 发消息，广播给房间内其他人
  const sent = server.broadcastToRoom('general', JSON.stringify({ from: 'alice', text: '大家好！' }), 'alice');
  console.log(\`  Alice 发消息 → 推送给 \${sent} 人\`);
  console.log(\`  Bob 收到: \${bob.received.length} 条, Carol 收到: \${carol.received.length} 条\`);

  console.log('\\n===== 场景2：多房间隔离 =====');
  server.joinRoom('dev', 'bob');
  const devMsg = server.broadcastToRoom('dev', JSON.stringify({ from: 'system', text: 'dev 频道通知' }));
  console.log(\`  dev 房间广播 → \${devMsg} 人收到 (只有 Bob 在 dev 房间)\`);

  console.log('\\n===== 场景3：心跳超时断连 =====');
  const ghost = server.accept('ghost');
  ghost.lastPong = Date.now() - 10000; // 模拟很久没响应
  await new Promise(r => setTimeout(r, 300));
  console.log(\`  ghost 是否还在: \${server.connections.has('ghost') ? '是' : '否（已被心跳断开）'}\`);

  console.log('\\n===== 场景4：断线重连（指数退避） =====');
  const client = new ReconnectClient(server, 'dave', { baseDelay: 30, maxDelay: 200, maxRetries: 3 });
  client.connect();
  console.log('  模拟网络断开...');
  server.disconnect('dave', 1006, 'network error');
  client.reconnect();
  await new Promise(r => setTimeout(r, 400));

  console.log('\\n===== 场景5：全局统计 =====');
  const stats = server.stats();
  console.log(\`  当前在线: \${stats.online} 人\`);
  console.log(\`  房间信息: \${JSON.stringify(stats.rooms)}\`);

  console.log('\\n===== 场景6：全局广播（通知推送） =====');
  const pushed = server.broadcast(JSON.stringify({ type: 'notice', text: '系统维护通知' }));
  console.log(\`  全局广播推送: \${pushed} 人\`);

  console.log('\\n===== 运行结束 =====');
  clearInterval(server.heartbeatTimer);
})();
`,
  },

  // =========================================================
  // 第二章：反向代理与 Nginx
  // =========================================================
  {
    id: "backend-proxy",
    group: "基础与网络",
    icon: "🔀",
    title: "反向代理与 Nginx",
    content: `# 反向代理与 Nginx

## 正向代理 vs 反向代理

代理（Proxy）是网络中常见的中间人角色。根据代理代理的是"谁"，分为正向代理和反向代理。

### 正向代理（Forward Proxy）

**正向代理代理的是客户端**。客户端知道要访问的目标，但无法直接访问（被墙、公司防火墙），于是通过代理服务器转发请求。

\`\`\`
客户端 → 正向代理服务器 → 目标服务器
         (代理客户端)        (不知道真正客户端是谁)
\`\`\`

典型场景：
- 翻墙（VPN、Shadowsocks）
- 公司内网上网代理
- 缓存代理（Squid）加速访问
- 隐藏客户端真实 IP

\`\`\`nginx
# Nginx 正向代理配置示例
server {
    listen 8080;
    resolver 8.8.8.8;
    location / {
        proxy_pass $scheme://$http_host$request_uri;
        proxy_set_header Host $http_host;
    }
}
\`\`\`

### 反向代理（Reverse Proxy）

**反向代理代理的是服务端**。客户端不知道真正的后端服务器是谁，只访问代理服务器，代理服务器再把请求转发给后端。

\`\`\`
客户端 → 反向代理服务器 → 后端服务器A / B / C
         (代理服务端)    (客户端不知道访问的是哪台)
\`\`\`

典型场景：
- 负载均衡（Nginx 把请求分发到多台后端）
- SSL 终止（代理处理 HTTPS，后端用 HTTP）
- 缓存（代理缓存静态资源）
- 安全（隐藏后端 IP，做 WAF 过滤）
- 路由（根据 URL 转发到不同服务）

### 核心区别

| 维度 | 正向代理 | 反向代理 |
|------|----------|----------|
| 代理谁 | 客户端 | 服务端 |
| 客户端是否知道目标 | 知道 | 不知道 |
| 服务端是否知道客户端 | 不知道 | 通过 X-Forwarded-For 可知道 |
| 配置位置 | 客户端配置代理地址 | DNS 解析到代理服务器 |
| 典型用途 | 翻墙、内网上网 | 负载均衡、SSL 终止 |
| 典型软件 | Squid、Shadowsocks | Nginx、HAProxy、Traefik |

**记忆口诀**：正向代理"帮客户端出去"，反向代理"帮服务端收信"。

---

## 反向代理的核心作用

### 1. 负载均衡

反向代理最经典的用途。多台后端服务器提供相同服务，代理根据策略把请求分发到不同后端，提升整体吞吐和可用性。

\`\`\`
                    ┌→ 后端服务器 1 (192.168.1.1:8080)
客户端 → Nginx ─────┼→ 后端服务器 2 (192.168.1.2:8080)
                    └→ 后端服务器 3 (192.168.1.3:8080)
\`\`\`

### 2. SSL 终止（SSL Termination）

HTTPS 加解密很消耗 CPU。让 Nginx 处理 SSL，后端用纯 HTTP，后端就不用管证书和加解密：

\`\`\`
客户端 ←──HTTPS──→ Nginx ←──HTTP──→ 后端
        (加密)           (明文内网)
\`\`\`

### 3. 缓存

Nginx 可以缓存后端的响应，重复请求直接从缓存返回，减少后端压力。

### 4. 安全

- 隐藏后端服务器真实 IP
- 做 WAF（Web Application Firewall）过滤恶意请求
- 限制 IP 访问、限流防 DDoS
- 统一认证入口

### 5. 路由

根据 URL 路径、域名、Header 转发到不同后端服务：

\`\`\`
api.example.com/user    → 用户服务
api.example.com/order   → 订单服务
api.example.com/payment → 支付服务
\`\`\`

### 6. 协议转换

Nginx 可以把 HTTP 转成 FastCGI（给 PHP-FPM）、转成 uwsgi（给 Python）、代理 WebSocket、代理 gRPC。

---

## Nginx 架构

Nginx（Engine-X）是当前最流行的 Web 服务器/反向代理。理解它的架构有助于做性能调优。

### Master-Worker 进程模型

\`\`\`
Nginx 启动
  │
  ├── Master 进程（1个）
  │     ├── 读取配置
  │     ├── 绑定监听端口
  │     ├── 管理 Worker 进程（创建/退出/重载配置）
  │     └── 不处理请求
  │
  ├── Worker 进程（N个，默认=CPU核数）
  │     ├── 实际处理请求
  │     ├── 各自独立，互不干扰
  │     └── 竞争 accept 同一端口（通过锁或 reuseport）
  │
  └── Cache Manager / Cache Loader（如果有缓存）
        ├── Cache Loader：启动时加载磁盘缓存索引
        └── Cache Manager：定期清理过期缓存
\`\`\`

**为什么用多进程而不是多线程？**
- 进程隔离：一个 Worker 崩溃不影响其他 Worker，Master 会重新拉起
- 无锁：Worker 之间不共享数据（除了共享内存缓存），避免锁竞争
- 利用多核：每个 Worker 跑在一个 CPU 核上

### 事件驱动（epoll/kqueue）

每个 Worker 是单线程的，但能处理数万并发连接，靠的是**事件驱动**：

\`\`\`
Worker 线程
  │
  ├── epoll_wait()  ← 阻塞等待事件（连接到达、数据可读、可写...）
  │       │
  │       ├── 事件1：新连接到达 → accept()
  │       ├── 事件2：连接A有数据可读 → read() → 处理请求
  │       ├── 事件3：连接B可写 → write() → 返回响应
  │       └── 事件4：连接C超时 → close()
  │
  └── 非阻塞 I/O：一次 epoll_wait 可返回多个事件，一个线程处理多个连接
\`\`\`

对比传统多线程模型（一个连接一个线程）：
- 1 万连接 = 1 万线程 → 内存爆炸、上下文切换开销大
- Nginx：1 万连接 = 1 个 Worker 线程 → 通过 epoll 高效管理

| 特性 | 多线程模型 | Nginx 事件驱动 |
|------|------------|----------------|
| 连接与线程 | 1:1 | N:1 |
| 内存 | 每线程约 8MB 栈 | 共享，开销小 |
| 上下文切换 | 频繁 | 少 |
| 适合 | 阻塞 I/O（数据库） | 非阻塞 I/O（静态资源、代理） |
| CPU 利用 | 低（线程等待 I/O） | 高（I/O 时不阻塞） |

---

## Nginx 配置详解

Nginx 配置是层级块结构，从外到内：

\`\`\`
main（全局）
├── events {}       事件模块
└── http {}         HTTP 模块
    ├── upstream {}     上游服务器池
    ├── server {}       虚拟主机（一个域名/端口）
    │   ├── location {}     URL 路由
    │   └── location {}
    └── server {}
\`\`\`

### 1. main 块（全局配置）

\`\`\`nginx
# nginx.conf 顶层
worker_processes auto;        # Worker 进程数，auto=CPU核数
worker_rlimit_nofile 65535;   # 每个 Worker 最大文件描述符
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;
events {
    worker_connections 10240;  # 每个 Worker 最大连接数
    use epoll;                 # Linux 用 epoll
    multi_accept on;           # 一次 accept 多个连接
}
\`\`\`

### 2. http 块

\`\`\`nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'rt=$request_time uct=$upstream_connect_time '
                    'urt=$upstream_response_time';

    access_log /var/log/nginx/access.log main;

    sendfile        on;       # 零拷贝发送静态文件
    tcp_nopush      on;       # 等数据包攒够再发（配合 sendfile）
    tcp_nodelay     on;       # 小数据立即发（keep-alive）
    keepalive_timeout  65;    # keep-alive 超时
    keepalive_requests 1000;  # 一个 keep-alive 连接最多处理多少请求
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_min_length 1024;
    gzip_types text/plain application/json text/css application/javascript;

    upstream backend {
        server 192.168.1.1:8080 weight=3;
        server 192.168.1.2:8080 weight=1;
        server 192.168.1.3:8080 backup;  # 备用，前面都挂了才用
        keepalive 32;  # 到后端保持 32 个长连接
    }

    server {
        listen 80;
        server_name api.example.com;
        # ... location ...
    }
}
\`\`\`

### 3. server 块

一个 server 块对应一个虚拟主机：

\`\`\`nginx
server {
    listen 80;
    listen 443 ssl;
    server_name api.example.com www.api.example.com;

    # SSL 配置
    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # HTTP 跳 HTTPS
    if ($scheme = http) {
        return 301 https://$host$request_uri;
    }

    # 访问日志
    access_log /var/log/nginx/api.access.log main;

    location / {
        proxy_pass http://backend;
    }
}
\`\`\`

### 4. location 块（URL 路由）

location 的匹配规则是 Nginx 配置最容易搞混的部分。

**匹配优先级**（从高到低）：

| 修饰符 | 含义 | 优先级 |
|--------|------|--------|
| \`=\` | 精确匹配 | 1（最高） |
| \`^~\` | 前缀匹配（不再正则） | 2 |
| \`~\` / \`~*\` | 正则匹配（区分/不区分大小写） | 3 |
| 无修饰符 | 前缀匹配 | 4（最低） |

\`\`\`nginx
server {
    listen 80;

    # 精确匹配：只匹配 /exact
    location = /exact {
        return 200 "精确匹配";
    }

    # 前缀匹配优先（不再检查正则）
    location ^~ /static/ {
        root /var/www;  # /static/a.js → /var/www/static/a.js
    }

    # 正则匹配（区分大小写）
    location ~ \\.php$ {
        fastcgi_pass 127.0.0.1:9000;
    }

    # 正则匹配（不区分大小写）
    location ~* \\.(jpg|png|gif|css|js)$ {
        expires 30d;
    }

    # 默认前缀匹配
    location /api {
        proxy_pass http://backend;
    }

    # 兜底
    location / {
        proxy_pass http://frontend;
    }
}
\`\`\`

**root vs alias**：
- \`root /var/www\`：URL 路径拼接在 root 后。/static/a.js → /var/www/static/a.js
- \`alias /var/www\`：URL 匹配部分被替换。location /static/ { alias /var/www/; } → /static/a.js → /var/www/a.js

### 5. 指令优先级

Nginx 处理请求时，指令的生效顺序：

1. **server 块**的 listen + server_name 选出虚拟主机
2. **location 块**按优先级选出处理规则
3. **rewrite** 指令（server 和 location 都可以有）
4. **location 内的指令**（proxy_pass、return、try_files 等）
5. 如果有嵌套 location，内层覆盖外层

---

## 常用反向代理配置

### 1. proxy_pass 基础

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/;  # 注意末尾斜杠
}
# 请求 /api/users → 后端收到 /users（带斜杠会去掉 /api 前缀）

location /api/ {
    proxy_pass http://127.0.0.1:8080;   # 不带斜杠
}
# 请求 /api/users → 后端收到 /api/users（保留完整路径）
\`\`\`

**末尾斜杠规则**（最容易踩的坑）：
- proxy_pass **不带 URI**（只有 host:port）：原样转发完整路径
- proxy_pass **带 URI**（如末尾有 /）：匹配的 location 前缀被替换

### 2. 代理头设置

反向代理转发时，默认不会传递客户端的真实信息。需要手动设置：

\`\`\`nginx
location /api/ {
    proxy_pass http://backend;

    # 传递客户端真实 IP
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 传递 WebSocket 升级头
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    # 超时配置
    proxy_connect_timeout 5s;    # 连接后端超时
    proxy_send_timeout 30s;      # 发送请求给后端超时
    proxy_read_timeout 30s;      # 等后端响应超时

    # 缓冲区
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
}
\`\`\`

**X-Forwarded-For vs X-Real-IP**：
- \`X-Real-IP\`：客户端真实 IP（只一跳）
- \`X-Forwarded-For\`：IP 链。client, proxy1, proxy2...\`$proxy_add_x_forwarded_for\` 会自动追加

后端取真实 IP：
\`\`\`java
// Java Spring Boot
@RequestMapping("/api")
public String handler(HttpServletRequest request) {
    String ip = request.getHeader("X-Forwarded-For");
    if (ip == null || ip.isEmpty()) {
        ip = request.getRemoteAddr();
    } else {
        ip = ip.split(",")[0].trim(); // 取第一个（最原始客户端）
    }
    return "Your IP: " + ip;
}
\`\`\`

\`\`\`go
// Go Gin
func getRealIP(c *gin.Context) string {
    if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
        return strings.Split(xff, ",")[0]
    }
    return c.ClientIP()
}
\`\`\`

### 3. WebSocket 代理

\`\`\`nginx
# map 定义 Connection 升级映射
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3600s;  # WebSocket 长连接，超时调大
    }
}
\`\`\`

---

## 负载均衡策略

Nginx 通过 upstream 块定义后端服务器池，并支持多种负载均衡策略。

### 1. 轮询（默认）

\`\`\`nginx
upstream backend {
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
    server 192.168.1.3:8080;
}
# 请求依次分给 1→2→3→1→2→3...
\`\`\`

### 2. 加权轮询

\`\`\`nginx
upstream backend {
    server 192.168.1.1:8080 weight=3;  # 性能强的多分
    server 192.168.1.2:8080 weight=1;
    server 192.168.1.3:8080 weight=1;
}
# 比例 3:1:1，5 个请求中 1 号分 3 个
\`\`\`

### 3. ip_hash（会话保持）

\`\`\`nginx
upstream backend {
    ip_hash;  # 同一客户端 IP 固定到同一后端
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}
# 解决 Session 不共享问题（但有隐患：NAT 后大量用户同 IP）
\`\`\`

### 4. least_conn（最少连接）

\`\`\`nginx
upstream backend {
    least_conn;  # 优先分给当前连接数最少的后端
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}
# 适合请求处理时间差异大的场景
\`\`\`

### 5. 一致性哈希（需第三方模块 ngx_http_upstream_consistent_hash）

\`\`\`nginx
upstream backend {
    consistent_hash $request_uri;  # 按 URI 一致性哈希
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}
# 节点增减时只影响部分请求的映射
\`\`\`

### 6. 健康检查

Nginx 开源版只有被动健康检查（请求失败到一定次数才标记下线）。主动健康检查需要 Nginx Plus 或第三方模块。

\`\`\`nginx
upstream backend {
    server 192.168.1.1:8080 max_fails=3 fail_timeout=30s;
    # max_fails: 30s 内失败 3 次标记为不可用
    # fail_timeout: 标记不可用后 30s 后重试
    server 192.168.1.2:8080 max_fails=3 fail_timeout=30s;
}
\`\`\`

### 负载均衡策略对比

| 策略 | 原理 | 适用场景 | 优点 | 缺点 |
|------|------|----------|------|------|
| 轮询 | 依次分配 | 后端性能相同 | 简单 | 不考虑负载差异 |
| 加权轮询 | 按权重分配 | 后端性能不同 | 合理分配 | 需手动设权重 |
| ip_hash | 按 IP 哈希 | 需会话保持 | Session 粘滞 | NAT 下不均匀 |
| least_conn | 最少连接 | 请求耗时差异大 | 动态均衡 | 需维护连接计数 |
| 一致性哈希 | 按 key 哈希 | 缓存场景 | 节点变动影响小 | 分布可能不均 |

---

## Nginx 缓存配置

### proxy_cache 基础

\`\`\`nginx
http {
    # 定义缓存区
    proxy_cache_path /var/cache/nginx
                     levels=1:2           # 两级目录
                     keys_zone=api_cache:10m  # 共享内存 10MB（存缓存键）
                     max_size=1g          # 磁盘最大 1GB
                     inactive=60m         # 60 分钟未访问就清理
                     use_temp_path=off;

    server {
        location /api/ {
            proxy_pass http://backend;
            proxy_cache api_cache;        # 启用缓存
            proxy_cache_key "$scheme$host$request_uri";  # 缓存键
            proxy_cache_valid 200 302 10m;  # 200/302 缓存 10 分钟
            proxy_cache_valid 404 1m;       # 404 缓存 1 分钟
            proxy_cache_valid any 5s;       # 其他 5 秒

            # 响应头加缓存状态（HIT/MISS/EXPIRED）
            add_header X-Cache-Status $upstream_cache_status;

            # bypass 缓存的条件
            proxy_cache_bypass $http_cache_control;
            proxy_no_cache $http_authorization;  # 带 Auth 不缓存
        }
    }
}
\`\`\`

缓存状态值：

| 状态 | 含义 |
|------|------|
| MISS | 未命中，请求了后端并存入缓存 |
| HIT | 命中缓存 |
| EXPIRED | 缓存已过期，请求了后端 |
| STALE | 用了过期缓存（后端挂了，降级用旧缓存） |
| BYPASS | 绕过缓存（proxy_cache_bypass 命中） |
| REVALIDATED | 304 协商缓存验证 |

### 缓存清理

Nginx 开源版没有自动清理指定 URL 的功能，需要第三方模块（如 ngx_cache_purge）或删除文件。

---

## HTTPS 配置

### 1. 基础 HTTPS

\`\`\`nginx
server {
    listen 443 ssl http2;  # 启用 HTTP/2
    server_name api.example.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;       # 禁用旧协议
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;     # SSL 会话缓存
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://backend;
    }
}
\`\`\`

### 2. HTTP 跳转 HTTPS

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
}
\`\`\`

### 3. HSTS（强制 HTTPS）

\`\`\`nginx
# 在 HTTPS server 中加 HSTS 头
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
# 浏览器记住一年内只用 HTTPS 访问
\`\`\`

### 4. 证书自动续期

\`\`\`bash
# Let's Encrypt + certbot 自动续期
certbot certonly --webroot -w /var/www/html -d example.com
# crontab 每月续期
0 0 1 * * certbot renew --quiet --post-hook "nginx -s reload"
\`\`\`

---

## 动静分离

静态资源（图片、CSS、JS）由 Nginx 直接返回，动态请求转发给后端：

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/html;

    # 静态资源直接返回
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff2?)$ {
        expires 30d;                          # 浏览器缓存 30 天
        add_header Cache-Control "public";
        access_log off;                        # 不记访问日志
        try_files $uri =404;
    }

    # 动态请求转发后端
    location /api/ {
        proxy_pass http://backend;
    }

    # 前端 SPA
    location / {
        try_files $uri $uri/ /index.html;  # 找不到文件就返回 index.html
    }
}
\`\`\`

---

## 限流配置

### 1. limit_req（请求限流）

\`\`\`nginx
http {
    # 定义限流区：每 IP 每秒 10 个请求
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            # burst=20: 允许突发 20 个请求排队
            # nodelay: 突发请求不延迟，超过直接 503
            proxy_pass http://backend;
        }
    }
}
\`\`\`

### 2. limit_conn（连接限流）

\`\`\`nginx
http {
    # 每个 IP 最多 50 个并发连接
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    server {
        limit_conn conn_limit 50;
        location / {
            proxy_pass http://backend;
        }
    }
}
\`\`\`

### 3. 自定义限流响应

\`\`\`nginx
limit_req_status 429;  # 默认 503，改成 429 Too Many Requests
limit_conn_status 429;
\`\`\`

---

## Nginx vs Caddy vs Traefik

| 特性 | Nginx | Caddy | Traefik |
|------|-------|-------|---------|
| 语言 | C | Go | Go |
| 配置 | 文本配置文件 | Caddyfile（简洁） | 动态配置（标签/CRD） |
| 自动 HTTPS | 需手动/certbot | 内置自动 Let's Encrypt | 内置自动 Let's Encrypt |
| 性能 | 极高（C + epoll） | 高 | 高 |
| 动态后端 | 需 reload | 需 reload | 热更新（无需 reload） |
| 微服务支持 | 一般 | 一般 | 优秀（K8s/Docker） |
| 生态 | 最丰富 | 增长中 | 容器生态 |
| 学习曲线 | 中等 | 低 | 中等 |
| 适用场景 | 通用 Web/代理 | 小项目/快速部署 | 容器/微服务 |

**选择建议**：
- 传统部署、高性能要求 → Nginx
- 小项目、想要零配置 HTTPS → Caddy
- Kubernetes/Docker 微服务 → Traefik

---

## Nginx 性能调优

### 1. Worker 配置

\`\`\`nginx
worker_processes auto;          # = CPU 核数
worker_rlimit_nofile 100000;    # fd 上限
events {
    worker_connections 20000;   # 每 Worker 最大连接
    use epoll;
    multi_accept on;
}
\`\`\`

**最大连接数 = worker_processes × worker_connections**。但反向代理模式下每个客户端要占 2 个连接（一个对客户端，一个对后端），所以实际约为 worker_processes × worker_connections / 2。

### 2. 内核参数

\`\`\`bash
# /etc/sysctl.conf
net.core.somaxconn = 65535           # listen 队列
net.ipv4.tcp_max_syn_backlog = 65535 # SYN 队列
net.ipv4.tcp_fin_timeout = 15        # FIN-WAIT-2 超时
net.ipv4.tcp_tw_reuse = 1            # TIME-WAIT 复用
net.ipv4.ip_local_port_range = 10000 65535  # 临时端口范围
# 生效
sysctl -p
\`\`\`

### 3. 文件描述符

\`\`\`bash
# /etc/security/limits.conf
nginx soft nofile 65535
nginx hard nofile 65535
# 或 systemd 服务
# /etc/systemd/system/nginx.service
[Service]
LimitNOFILE=65535
\`\`\`

### 4. 缓冲区调优

\`\`\`nginx
http {
    client_body_buffer_size 16k;    # 请求体缓冲
    client_max_body_size 10m;        # 最大请求体
    client_header_buffer_size 4k;    # 请求头缓冲
    large_client_header_buffers 4 8k;

    proxy_buffer_size 8k;            # 后端响应头缓冲
    proxy_buffers 8 16k;             # 后端响应体缓冲
    proxy_busy_buffers_size 32k;     # 忙时缓冲
}
\`\`\`

### 5. keep-alive

\`\`\`nginx
http {
    keepalive_timeout 65;
    keepalive_requests 1000;
}
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;  # 到后端的连接池
}
location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;          # HTTP/1.1 才支持 keep-alive
    proxy_set_header Connection "";  # 清空 Connection 头
}
\`\`\`

### 6. 零拷贝

\`\`\`nginx
sendfile on;      # 静态文件用 sendfile 零拷贝
tcp_nopush on;    # 配合 sendfile，攒包发送
tcp_nodelay on;   # keep-alive 下小包立即发
\`\`\`

---

## 多语言对照

### Java（Nginx 后端，Spring Boot）

\`\`\`java
@RestController
@RequestMapping("/api")
public class UserController {
    @GetMapping("/users")
    public List<User> list(
            @RequestHeader(value = "X-Real-IP", required = false) String realIp,
            HttpServletRequest request) {
        // Nginx 代理后，获取真实 IP
        String ip = realIp != null ? realIp : request.getRemoteAddr();
        log.info("Request from: {}", ip);
        return userService.list();
    }
}
\`\`\`

### Go（Nginx 后端，Gin）

\`\`\`go
func main() {
    r := gin.Default()
    r.GET("/api/users", func(c *gin.Context) {
        // 获取真实 IP
        ip := c.GetHeader("X-Real-IP")
        if ip == "" { ip = c.ClientIP() }
        c.JSON(200, gin.H{"users": userList, "from": ip})
    })
    r.Run(":8080") // Nginx 代理到这里
}
\`\`\`

### Python（Nginx + Gunicorn + Flask）

\`\`\`python
from flask import Flask, request
app = Flask(__name__)

@app.route('/api/users')
def list_users():
    # Nginx 代理头
    real_ip = request.headers.get('X-Real-IP', request.remote_addr)
    return {'users': get_users(), 'ip': real_ip}

# Gunicorn 启动: gunicorn -w 4 -b 127.0.0.1:8080 app:app
\`\`\`

---

## 常见坑

### 坑 1：proxy_pass 末尾斜杠

\`\`\`nginx
# 请求 /api/users
location /api/ {
    proxy_pass http://backend/;   # 后端收到 /users
}
location /api/ {
    proxy_pass http://backend;    # 后端收到 /api/users
}
\`\`\`

**最佳实践**：统一风格，要么都带斜杠，要么都不带。

### 坑 2：X-Forwarded-For 伪造

客户端可以伪造 X-Forwarded-For 头。应该只信任 Nginx 追加的最后一个 IP：

\`\`\`java
// Java 正确获取真实 IP
String xff = request.getHeader("X-Forwarded-For");
String ip;
if (xff != null) {
    String[] ips = xff.split(",");
    ip = ips[0].trim(); // 第一个是客户端，但可能被伪造
    // 更安全：只信任最后一跳（Nginx 追加的）
    ip = ips[ips.length - 1].trim();
} else {
    ip = request.getRemoteAddr();
}
\`\`\`

### 坑 3：大文件上传 413

\`\`\`nginx
client_max_body_size 1m;  # 默认 1MB，上传大文件需调大
# 改成
client_max_body_size 100m;
\`\`\`

### 坑 4：502 Bad Gateway

后端服务挂了或拒绝连接。检查：
- 后端进程是否在运行
- 后端端口是否正确
- SELinux/防火墙是否拦截
- 后端是否处理超时（调大 proxy_read_timeout）

### 坑 5：reload 不会重置连接

\`nginx -s reload\` 是平滑重载，不会断开已有连接。但如果修改了 listen 端口，需要完全重启。

### 坑 6：WebSocket 代理 60s 断开

Nginx 默认 proxy_read_timeout 60s，WebSocket 空闲 60s 就断。需要调大或配置心跳。

---

## 实战配置案例

### 案例 1：前后端分离 + API 代理

\`\`\`nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/frontend;

    # 前端 SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源长缓存
    location ~* \\.(js|css|png|jpg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
\`\`\`

### 案例 2：灰度发布

\`\`\`nginx
upstream stable {
    server 192.168.1.1:8080;
}
upstream canary {
    server 192.168.1.10:8080;
}

# 按 Cookie 灰度
map $cookie_version $pool {
    default stable;
    v2     canary;
}

server {
    location / {
        proxy_pass http://$pool;
    }
}
\`\`\`

### 案例 3：多域名路由

\`\`\`nginx
server {
    listen 80;
    server_name ~^(?<service>.+)\\.internal\\.com$;
    location / {
        proxy_pass http://$service-backend;  # user-backend, order-backend...
    }
}
\`\`\`

---

## 章节小结

反向代理是后端架构的"门卫"，它通过负载均衡、SSL 终止、缓存、安全过滤等功能，把后端服务从网络细节中解放出来。Nginx 凭借 master-worker 进程模型和 epoll 事件驱动，成为高性能反向代理的事实标准。

掌握 Nginx 配置的核心是理解 http/server/location/upstream 的层级关系、location 匹配优先级、proxy_pass 末尾斜杠规则、以及各种负载均衡和缓存策略。下一章我们将深入负载均衡算法，这是反向代理的核心能力之一。`,
    code: `// ===================================================
// 反向代理模拟器（沙箱环境，无 http 模块）
// 用纯 JS 对象模拟 Nginx 反向代理的核心行为
// ===================================================

// ---------- 上游服务器 ----------
class UpstreamServer {
  constructor(name, address, weight = 1) {
    this.name = name;
    this.address = address;
    this.weight = weight;
    this.healthy = true;
    this.connections = 0;     // 当前活跃连接数
    this.totalRequests = 0;   // 总请求数
    this.failCount = 0;       // 连续失败次数
  }
  markHealthy() { this.healthy = true; this.failCount = 0; }
  markUnhealthy() { this.healthy = false; }
  recordSuccess() { this.failCount = 0; this.totalRequests++; }
  recordFailure() {
    this.failCount++;
    if (this.failCount >= 3) this.markUnhealthy();
  }
}

// ---------- 反向代理 ----------
class ReverseProxy {
  constructor() {
    this.servers = [];
    this.lastIndex = -1;      // 轮询游标
    this.currentWeight = {};  // 加权轮询当前权重
    this.stats = { forwarded: 0, failed: 0, fallback: 0 };
  }

  addServer(name, address, weight = 1) {
    const srv = new UpstreamServer(name, address, weight);
    this.servers.push(srv);
    this.currentWeight[name] = 0;
    console.log(\`[注册] 后端 \${name} (\${address}) weight=\${weight}\`);
    return srv;
  }

  getHealthyServers() { return this.servers.filter(s => s.healthy); }

  // 策略1：轮询
  roundRobin() {
    const healthy = this.getHealthyServers();
    if (!healthy.length) return null;
    this.lastIndex = (this.lastIndex + 1) % healthy.length;
    return healthy[this.lastIndex];
  }

  // 策略2：加权轮询（平滑加权轮询算法）
  weightedRoundRobin() {
    const healthy = this.getHealthyServers();
    if (!healthy.length) return null;
    let total = 0, best = null;
    for (const s of healthy) {
      this.currentWeight[s.name] += s.weight;
      total += s.weight;
      if (!best || this.currentWeight[s.name] > this.currentWeight[best.name]) best = s;
    }
    this.currentWeight[best.name] -= total;
    return best;
  }

  // 策略3：最少连接
  leastConnections() {
    const healthy = this.getHealthyServers();
    if (!healthy.length) return null;
    return healthy.reduce((min, s) => s.connections < min.connections ? s : min);
  }

  // 健康检查
  healthCheck() {
    for (const s of this.servers) {
      if (!s.healthy && Math.random() > 0.7) {
        s.markHealthy();
        console.log(\`[健康检查] \${s.name} 恢复健康\`);
      }
    }
  }

  // 转发请求
  forward(request, strategy = 'roundRobin') {
    this.stats.forwarded++;
    let server;
    switch (strategy) {
      case 'weighted': server = this.weightedRoundRobin(); break;
      case 'leastConn': server = this.leastConnections(); break;
      default: server = this.roundRobin();
    }
    if (!server) {
      this.stats.failed++;
      return { status: 503, error: 'No healthy upstream', request };
    }
    server.connections++;
    // 模拟请求处理（10% 概率失败）
    const success = Math.random() > 0.1;
    server.connections--;
    if (success) {
      server.recordSuccess();
      return { status: 200, server: server.name, address: server.address, request };
    } else {
      server.recordFailure();
      this.stats.fallback++;
      // 模拟故障转移：重试一次
      const retry = this.forward(request, strategy);
      retry.retried = true;
      return retry;
    }
  }
}

// ---------- 演示场景 ----------
function simulate(proxy, strategy, count, label) {
  console.log(\`\\n===== \${label} =====\`);
  const distribution = {};
  for (let i = 0; i < count; i++) {
    const res = proxy.forward({ id: i, path: '/api/data' }, strategy);
    if (res.server) distribution[res.server] = (distribution[res.server] || 0) + 1;
  }
  console.log(\`  请求分发结果: \${JSON.stringify(distribution)}\`);
  return distribution;
}

// 创建代理和后端
const proxy = new ReverseProxy();
proxy.addServer('web-1', '192.168.1.1:8080', 5);
proxy.addServer('web-2', '192.168.1.2:8080', 3);
proxy.addServer('web-3', '192.168.1.3:8080', 2);

// 场景1：轮询
simulate(proxy, 'roundRobin', 12, '场景1：轮询（均匀分配）');

// 场景2：加权轮询
const wrr = new ReverseProxy();
wrr.addServer('web-1', '192.168.1.1:8080', 5);
wrr.addServer('web-2', '192.168.1.2:8080', 3);
wrr.addServer('web-3', '192.168.1.3:8080', 2);
simulate(wrr, 'weighted', 20, '场景2：加权轮询（按权重 5:3:2 分配）');

// 场景3：最少连接
console.log('\\n===== 场景3：最少连接 =====');
const lcProxy = new ReverseProxy();
lcProxy.addServer('web-1', '10.0.0.1:8080');
lcProxy.addServer('web-2', '10.0.0.2:8080');
lcProxy.addServer('web-3', '10.0.0.3:8080');
// 模拟已有连接
lcProxy.servers[0].connections = 10;
lcProxy.servers[1].connections = 3;
lcProxy.servers[2].connections = 7;
console.log('  当前连接数: web-1=10, web-2=3, web-3=7');
for (let i = 0; i < 5; i++) {
  const res = lcProxy.forward({ id: i }, 'leastConn');
  console.log(\`  请求\${i} → \${res.server} (连接最少)\`);
}

// 场景4：健康检查与故障转移
console.log('\\n===== 场景4：健康检查与故障转移 =====');
const failProxy = new ReverseProxy();
failProxy.addServer('web-A', '10.0.0.10:8080');
failProxy.addServer('web-B', '10.0.0.11:8080');
failProxy.addServer('web-C', '10.0.0.12:8080');
console.log('  模拟 web-A 宕机...');
failProxy.servers[0].markUnhealthy();
const dist = {};
for (let i = 0; i < 10; i++) {
  const res = failProxy.forward({ id: i });
  if (res.server) dist[res.server] = (dist[res.server] || 0) + 1;
}
console.log(\`  web-A 下线后分发: \${JSON.stringify(dist)} (web-A 不应出现)\`);

// 场景5：模拟恢复
console.log('\\n===== 场景5：服务器恢复 =====');
console.log('  执行健康检查...');
failProxy.servers[0].markHealthy();
const dist2 = {};
for (let i = 0; i < 9; i++) {
  const res = failProxy.forward({ id: i });
  if (res.server) dist2[res.server] = (dist2[res.server] || 0) + 1;
}
console.log(\`  恢复后分发: \${JSON.stringify(dist2)}\`);

// 场景6：全部宕机
console.log('\\n===== 场景6：全部宕机 =====');
failProxy.servers.forEach(s => s.markUnhealthy());
const res = failProxy.forward({ id: 999 });
console.log(\`  请求结果: status=\${res.status}, error="\${res.error}"\`);

// 最终统计
console.log('\\n===== 最终统计 =====');
console.log('  各服务器状态:');
failProxy.servers.forEach(s => {
  console.log(\`    \${s.name}: healthy=\${s.healthy}, totalRequests=\${s.totalRequests}, failCount=\${s.failCount}\`);
});
console.log(\`  代理统计: \${JSON.stringify(failProxy.stats)}\`);
`,
  },

  // =========================================================
  // 第三章：负载均衡
  // =========================================================
  {
    id: "backend-lb",
    group: "基础与网络",
    icon: "⚖",
    title: "负载均衡",
    content: `# 负载均衡

## 什么是负载均衡

负载均衡（Load Balancing）是将网络流量分发到多台服务器的技术。它的核心目标有三个：

1. **高可用**：一台挂了，其他顶上，服务不中断
2. **可扩展**：流量涨了加机器，线性扩容
3. **高性能**：多台并行处理，提升整体吞吐

\`\`\`
                    ┌→ 服务器 A
客户端 → 负载均衡器 ─┼→ 服务器 B
                    └→ 服务器 C
\`\`\`

如果没有负载均衡器，客户端直接连单台服务器——这台服务器挂了服务就没了，流量大到一台扛不住也没法扩。负载均衡器就是流量分发的"交警"。

---

## 负载均衡的层次

### 1. DNS 负载均衡

最简单的方式：DNS 解析返回多个 IP，客户端随机选一个。

\`\`\`
dig api.example.com
# 返回:
# api.example.com.  300  IN  A  1.1.1.1
# api.example.com.  300  IN  A  1.1.1.2
# api.example.com.  300  IN  A  1.1.1.3
\`\`\`

**优点**：
- 零成本，DNS 天然支持
- 客户端就近访问（GeoDNS 按地区返回不同 IP）

**缺点**：
- 缓存导致切换慢——TTL 内客户端缓存旧 IP，服务器挂了也切不过来
- 不感知服务器健康状态——DNS 不知道哪台挂了
- 粒度粗——无法基于 URL、Header 做路由
- 均衡性差——客户端缓存导致流量不均匀

**适用场景**：第一层流量入口，配合其他负载均衡使用。比如用 DNS 把流量分到不同机房，机房内再用 LVS/Nginx 分发。

### 2. 四层负载均衡（L4）

工作在 **OSI 第四层（传输层）**，基于 IP + Port 做转发，不关心应用层内容。

\`\`\`
客户端 → L4 LB(1.1.1.1:80) → 后端(192.168.1.1:8080)
                              后端(192.168.1.2:8080)
\`\`\`

L4 LB 只看 IP 和端口，把 TCP/UDP 连接转发到后端。它不解析 HTTP 内容，所以：
- 速度快（内核级转发，不用解析应用层）
- 支持任意协议（TCP/UDP/MySQL/Redis 都行）
- 功能简单（不能按 URL 路由、不能改 HTTP 头）

典型产品：**LVS**（Linux Virtual Server）、**HAProxy**（也支持四层）、云厂商的 SLB。

### 3. 七层负载均衡（L7）

工作在 **OSI 第七层（应用层）**，基于 HTTP 内容（URL、Header、Cookie、Body）做转发。

\`\`\`
客户端 → L7 LB → 按 URL 路由:
                 /api/user → 用户服务集群
                 /api/order → 订单服务集群
                 /static → 缓存服务器
\`\`\`

L7 LB 能看到 HTTP 请求的完整内容，可以做：
- 基于 URL/Header 路由到不同后端
- SSL 终止（HTTPS 解密后用 HTTP 转发）
- 内容缓存
- 修改请求/响应头
- 限流、WAF

典型产品：**Nginx**、**HAProxy**、**Traefik**、**Envoy**。

### 4. 四层 vs 七层对比

| 维度 | 四层（L4） | 七层（L7） |
|------|-----------|-----------|
| 工作层 | 传输层 | 应用层 |
| 转发依据 | IP + Port | HTTP 内容（URL/Header/Cookie） |
| 协议支持 | 任意 TCP/UDP | HTTP/HTTPS |
| 性能 | 极高（内核转发） | 高（需解析 HTTP） |
| 功能 | 简单转发 | 路由/缓存/SSL/限流/WAF |
| 后端感知 | 只看连接 | 看请求内容 |
| 典型产品 | LVS、F5 | Nginx、HAProxy |
| 适用场景 | 入口流量分发 | 应用层路由 |

**实际架构中常组合使用**：

\`\`\`
客户端 → DNS（机房级分流） → LVS（四层，入口流量分发） → Nginx（七层，按 URL 路由） → 后端服务
\`\`\`

---

## 负载均衡算法详解

### 1. 轮询（Round Robin）

最简单的算法：依次把请求分给每台服务器。

\`\`\`
请求1 → 服务器A
请求2 → 服务器B
请求3 → 服务器C
请求4 → 服务器A
请求5 → 服务器B
...
\`\`\`

\`\`\`python
# Python 轮询
class RoundRobin:
    def __init__(self, servers):
        self.servers = servers
        self.index = 0
    def next(self):
        server = self.servers[self.index % len(self.servers)]
        self.index += 1
        return server
\`\`\`

**适用场景**：所有服务器性能相同，请求处理时间相近。

**缺点**：不考虑服务器性能差异和当前负载。

### 2. 加权轮询（Weighted Round Robin）

给每台服务器一个权重，性能强的权重高，分到更多请求。

\`\`\`
服务器A weight=5, B weight=3, C weight=2
→ 10 个请求中：A 分 5 个，B 分 3 个，C 分 2 个
\`\`\`

**普通加权轮询**：先连续分 A 5 次，再 B 3 次，再 C 2 次。问题是请求集中，不均匀。

**平滑加权轮询（Nginx 用的算法）**：分散分配，避免连续集中。

\`\`\`java
// Java 平滑加权轮询
public class SmoothWeightedRoundRobin {
    static class Server {
        String name; int weight; int currentWeight;
        Server(String n, int w) { name = n; weight = w; currentWeight = 0; }
    }

    List<Server> servers;

    Server select() {
        int total = 0;
        Server best = null;
        for (Server s : servers) {
            s.currentWeight += s.weight;  // 当前权重 += 有效权重
            total += s.weight;
            if (best == null || s.currentWeight > best.currentWeight) best = s;
        }
        best.currentWeight -= total;  // 选中的减去总权重
        return best;
    }
}
\`\`\`

### 3. 最少连接（Least Connections）

把请求分给当前连接数最少的服务器。

\`\`\`go
// Go 最少连接
func leastConnections(servers []*Server) *Server {
    var best *Server
    minConn := math.MaxInt32
    for _, s := range servers {
        if s.healthy && s.connections < minConn {
            minConn = s.connections
            best = s
        }
    }
    return best
}
\`\`\`

**适用场景**：请求处理时间差异大（有的快有的慢），轮询会导致慢服务器积压。

### 4. 源 IP 哈希（IP Hash）

对客户端 IP 做哈希，同一 IP 的请求固定到同一服务器。

\`\`\`python
# Python IP Hash
import hashlib

def ip_hash(client_ip, servers):
    h = int(hashlib.md5(client_ip.encode()).hexdigest(), 16)
    return servers[h % len(servers)]
\`\`\`

**适用场景**：需要会话保持——同一用户的请求落到同一服务器，Session 不用共享。

**缺点**：
- 服务器增减时，大量请求的映射会变（哈希重分布）
- NAT 后大量用户同一 IP，会导致负载不均

### 5. 一致性哈希（Consistent Hashing）

解决普通哈希在节点增减时全量重分布的问题。

#### 核心思想

把哈希空间想象成一个环（0 ~ 2^32-1），服务器和请求都映射到这个环上。请求顺时针找最近的节点。

\`\`\`
          0
      ╱       ╲
   NodeA      NodeB
     |          |
   NodeD —— NodeC
          2^32-1

请求 hash → 在环上定位 → 顺时针找最近的 Node
\`\`\`

\`\`\`javascript
// JavaScript 一致性哈希
class ConsistentHash {
  constructor(virtualNodes = 150) {
    this.ring = new Map();  // hash -> serverName
    this.sortedHashes = [];
    this.virtualNodes = virtualNodes;
    this.servers = new Set();
  }

  hash(str) {
    // 简单哈希函数（生产用 MD5/MurmurHash）
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  addServer(name) {
    this.servers.add(name);
    // 每个物理节点映射 virtualNodes 个虚拟节点
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this.hash(name + '#' + i);
      this.ring.set(h, name);
      this.sortedHashes.push(h);
    }
    this.sortedHashes.sort((a, b) => a - b);
  }

  removeServer(name) {
    this.servers.delete(name);
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this.hash(name + '#' + i);
      this.ring.delete(h);
    }
    this.sortedHashes = this.sortedHashes.filter(h => this.ring.has(h));
  }

  getServer(key) {
    if (this.sortedHashes.length === 0) return null;
    const h = this.hash(key);
    // 二分查找第一个 >= h 的节点
    let left = 0, right = this.sortedHashes.length - 1;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (this.sortedHashes[mid] < h) left = mid + 1;
      else right = mid;
    }
    // 如果 h 大于所有节点，回到环头
    if (this.sortedHashes[left] < h) left = 0;
    return this.ring.get(this.sortedHashes[left]);
  }
}
\`\`\`

#### 虚拟节点解决数据倾斜

如果只有 3 个物理节点，它们在环上的分布可能很不均匀——某台服务器负责的弧段特别长，分到大部分请求。

**虚拟节点**：每个物理节点映射成 150 个虚拟节点（Nginx 默认 160），均匀散布在环上，使负载更均衡。

\`\`\`
物理节点少 → 环上分布不均 → 某节点负载过高
    ↓ 加虚拟节点
3 个物理节点 × 150 虚拟 = 450 个点 → 环上均匀分布 → 负载均衡
\`\`\`

#### 节点增减的影响

- **新增节点**：只影响新节点在环上前一段的请求（迁移到新节点）
- **删除节点**：只影响被删节点负责的请求（迁移到顺时针下一个节点）

\`\`\`
环上: NodeA — [区域1] — NodeB — [区域2] — NodeC — [区域3] — NodeA

新增 NodeD 在 NodeB 和 NodeC 之间:
  只有 [NodeB, NodeD] 这段区域的请求从 NodeC 迁移到 NodeD
  其他区域不受影响！
\`\`\`

这比普通哈希（取模）好太多——普通哈希节点数从 3 变 4，约 75% 的请求要迁移。

#### 适用场景

- **缓存负载均衡**：Memcached/Redis 集群用一致性哈希分配 key
- **会话保持**：同一用户固定到同一服务器
- **分片路由**：数据分片按一致性哈希

### 6. 随机 / 加权随机

\`\`\`python
# Python 加权随机
import random

def weighted_random(servers):
    total = sum(s['weight'] for s in servers)
    r = random.randint(1, total)
    for s in servers:
        r -= s['weight']
        if r <= 0:
            return s
\`\`\`

随机法实现简单，但短期可能不均匀（连续分到同一台），长期统计上接近加权轮询。

### 算法对比总览

| 算法 | 均衡性 | 会话保持 | 节点变动影响 | 复杂度 | 适用场景 |
|------|--------|----------|-------------|--------|----------|
| 轮询 | 好 | 无 | 全量 | 低 | 同构服务器 |
| 加权轮询 | 好 | 无 | 全量 | 低 | 异构服务器 |
| 最少连接 | 好 | 无 | 部分 | 中 | 请求耗时差异大 |
| IP Hash | 一般 | 有 | 全量 | 低 | Session 粘滞 |
| 一致性哈希 | 一般 | 有 | 最小 | 高 | 缓存/分片 |
| 随机 | 一般 | 无 | 全量 | 低 | 简单场景 |

---

## 会话保持（Session 粘滞）

### 问题

HTTP 是无状态的，用户 A 的第一次请求落到服务器 1（创建了 Session），第二次请求可能落到服务器 2（没有 A 的 Session），导致用户被"踢出登录"。

\`\`\`
请求1 → LB → 服务器1（创建 Session）
请求2 → LB → 服务器2（没有 Session！）→ 要求重新登录
\`\`\`

### 解决方案

#### 1. Session 粘滞（Sticky Session）

让同一用户的请求始终落到同一服务器。

**IP Hash 方式**：
\`\`\`nginx
upstream backend {
    ip_hash;
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}
\`\`\`

**Cookie 方式**（更精准）：
\`\`\`nginx
upstream backend {
    sticky cookie srv_id expires=1h domain=.example.com path=/;
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}
# 第一次请求 LB 在 Cookie 中标记服务器，后续请求带 Cookie，LB 路由到同一服务器
\`\`\`

**缺点**：服务器挂了，上面的 Session 全丢。

#### 2. Session 集中存储

把 Session 存到 Redis 等共享存储，所有服务器都能访问。

\`\`\`java
// Java Spring Session + Redis
@EnableRedisHttpSession
@SpringBootApplication
public class App { ... }

// 任何服务器都能从 Redis 读 Session，无需粘滞
\`\`\`

\`\`\`python
# Python Flask + Redis Session
from flask_session import Session
app.config['SESSION_TYPE'] = 'redis'
Session(app)
\`\`\`

**优点**：服务器挂了 Session 不丢，负载均衡器可用任意算法。

**缺点**：多一次 Redis 访问，增加延迟。

#### 3. Token 方案（无状态）

不用 Session，用 JWT 等 Token。服务端不存状态，Token 自包含用户信息。

\`\`\`
登录 → 服务端签发 JWT（含用户ID、过期时间、签名）
请求 → 客户端带 JWT → 任何服务器验签即可
\`\`\`

**优点**：完全无状态，完美适配负载均衡。

**缺点**：注销难（Token 未过期前一直有效）、Token 较大。

---

## 健康检查

### 1. 被动健康检查

负载均衡器在转发请求时观察结果，失败到一定次数标记下线。

\`\`\`nginx
upstream backend {
    server 192.168.1.1:8080 max_fails=3 fail_timeout=30s;
    # 30s 内失败 3 次 → 标记下线 30s → 30s 后重试
}
\`\`\`

**优点**：零配置，自动检测。

**缺点**：有延迟——前几个失败请求会受影响。

### 2. 主动健康检查

负载均衡器定期主动探测后端健康状态。

\`\`\`nginx
# Nginx Plus（商业版）
upstream backend {
    server 192.168.1.1:8080;
    health_check interval=5s uri=/health;
    # 每 5 秒请求 /health，失败标记下线
}
\`\`\`

\`\`\`yaml
# HAProxy 主动健康检查
backend web_servers
    option httpchk GET /health
    server web1 192.168.1.1:8080 check inter 5s fall 3 rise 2
    # inter: 检查间隔 5s
    # fall: 连续失败 3 次标记下线
    # rise: 连续成功 2 次标记恢复
\`\`\`

### 3. 健康检查端点设计

\`\`\`java
// Java Spring Boot Actuator
// GET /actuator/health
@RestController
public class HealthController {
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        if (db.isConnected() && redis.isConnected()) {
            status.put("status", "UP");
            return ResponseEntity.ok(status);
        } else {
            status.put("status", "DOWN");
            return ResponseEntity.status(503).body(status);
        }
    }
}
\`\`\`

**设计要点**：
- 检查关键依赖（数据库、缓存、消息队列）
- 快速返回（< 100ms）
- 轻量（不要做重操作）
- 区分 liveness（活着吗）和 readiness（能接请求吗）

---

## 负载均衡器产品

### 1. LVS（Linux Virtual Server）

LVS 是 Linux 内核级的四层负载均衡，由章文嵩博士开发。

**三种工作模式**：

#### NAT 模式
\`\`\`
客户端 → LVS(DNAT) → 后端 → LVS(SNAT) → 客户端
\`\`\`
- 请求和响应都经过 LVS
- 后端可以是任意 OS，不需要特殊配置
- LVS 是瓶颈（响应也要经过它）

#### DR 模式（Direct Routing）
\`\`\`
客户端 → LVS(改 MAC) → 后端 → 直接回客户端（不经过 LVS）
\`\`\`
- LVS 只处理请求，响应由后端直接回客户端
- 性能最高（LVS 不成为瓶颈）
- 要求 LVS 和后端在同一物理网络（二层可达）

#### TUN 模式（IP Tunneling）
\`\`\`
客户端 → LVS(IP 隧道封装) → 后端 → 直接回客户端
\`\`\`
- 后端可以跨机房（通过 IP 隧道）
- 后端需要支持 IP 隧道协议

| 模式 | 性能 | 后端要求 | 跨网络 | 适用场景 |
|------|------|----------|--------|----------|
| NAT | 中 | 无 | 否 | 小规模 |
| DR | 高 | 同网段 | 否 | 大规模同机房 |
| TUN | 高 | 支持 IP 隧道 | 是 | 跨机房 |

### 2. HAProxy

HAProxy 是高性能的七层（也支持四层）负载均衡器。

\`\`\`haproxy
# HAProxy 配置
frontend web_front
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    option httpchk GET /health
    server web1 192.168.1.1:8080 check
    server web2 192.168.1.2:8080 check
    server web3 192.168.1.3:8080 check backup
\`\`\`

特点：
- 性能极高（C 语言，事件驱动）
- 七层功能丰富（ACL、路由、改写）
- 自带统计页面
- 配置比 Nginx 更适合纯负载均衡场景

### 3. Nginx

Nginx 既能做 Web 服务器也能做负载均衡器。前面已详细讲解，这里不重复。

### 4. 云厂商 SLB

阿里云 SLB、AWS ELB、腾讯云 CLB：
- 全托管，无需运维
- 自动健康检查
- 支持四层/七层
- 按量计费
- 但不如自建灵活

### 对比

| 产品 | 层次 | 性能 | 功能 | 运维成本 | 适用场景 |
|------|------|------|------|----------|----------|
| LVS | L4 | 极高 | 简单 | 中 | 入口流量分发 |
| HAProxy | L4/L7 | 高 | 丰富 | 中 | 专业负载均衡 |
| Nginx | L7 | 高 | 丰富 | 低 | Web+代理+LB |
| 云 SLB | L4/L7 | 高 | 托管 | 低 | 云上托管 |

---

## 客户端负载 vs 服务端负载

### 服务端负载均衡

前面讲的都是服务端负载——有一个独立的负载均衡器（LVS/Nginx），客户端请求先到 LB，LB 再转发到后端。

\`\`\`
客户端 → LB → 后端A/B/C
\`\`\`

### 客户端负载均衡

微服务架构中，服务间调用频繁。如果每次都经过 LB，LB 会成为瓶颈。客户端负载均衡让调用方自己选目标：

\`\`\`
服务A（调用方）→ 自带负载均衡器 → 直接调服务B的某个实例
                               （从注册中心拿到 B 的所有实例列表）
\`\`\`

**Ribbon（Spring Cloud）**：

\`\`\`java
// Java Spring Cloud Ribbon
@Service
public class OrderService {
    @Autowired
    private RestTemplate restTemplate;  // 带 Ribbon 负载均衡

    public User getUser(String userId) {
        // Ribbon 自动从注册中心拿 user-service 的实例列表
        // 按轮询策略选一个，直接调用
        return restTemplate.getForObject(
            "http://user-service/users/" + userId, User.class);
    }
}
\`\`\`

**对比**：

| 维度 | 服务端 LB | 客户端 LB |
|------|-----------|-----------|
| 架构 | 有独立 LB | 无独立 LB |
| 性能 | LB 可能瓶颈 | 直连，无瓶颈 |
| 可用性 | LB 挂了全挂 | 单实例挂不影响 |
| 语言耦合 | 无 | 需要各语言 SDK |
| 适用 | 外部入口 | 微服务内部 |

现代微服务常用 **Service Mesh**（如 Istio），把负载均衡下沉到 Sidecar（Envoy），兼顾两者优点。

---

## 灰度发布与金丝雀发布

### 1. 灰度发布

逐步把流量从旧版本切到新版本：

\`\`\`
阶段1: 100% → v1
阶段2: 5% → v2, 95% → v1
阶段3: 20% → v2, 80% → v1
阶段4: 50% → v2, 50% → v1
阶段5: 100% → v2
\`\`\`

\`\`\`nginx
# Nginx 灰度（按权重）
upstream backend {
    server v1.example.com:8080 weight=95;
    server v2.example.com:8080 weight=5;
}
\`\`\`

### 2. 金丝雀发布

先让小部分用户（如内部员工）用新版本，确认没问题再全量。

\`\`\`nginx
# 按 Cookie 标记金丝雀用户
map $cookie_canary $upstream_pool {
    default v1_backend;
    "true" v2_backend;
}

upstream v1_backend { server v1:8080; }
upstream v2_backend { server v2:8080; }

server {
    location / {
        proxy_pass http://$upstream_pool;
    }
}
\`\`\`

### 3. 蓝绿发布

维护两套环境（蓝/绿），切换流量：

\`\`\`
蓝环境(v1) ← 当前生产流量
绿环境(v2) ← 部署新版本

测试通过后:
DNS/LB 切换 → 绿环境(v2) 接生产流量
蓝环境(v1) 保留（可快速回滚）
\`\`\`

---

## 多语言实现对照

### Java（自定义负载均衡）

\`\`\`java
public class LoadBalancer {
    private List<Server> servers;
    private AtomicInteger counter = new AtomicInteger(0);

    // 轮询
    public Server roundRobin() {
        int idx = counter.getAndIncrement() % servers.size();
        return servers.get(Math.abs(idx));
    }

    // 最少连接
    public Server leastConnections() {
        return servers.stream()
            .filter(Server::isHealthy)
            .min(Comparator.comparingInt(Server::getConnections))
            .orElse(null);
    }

    // 一致性哈希
    public Server consistentHash(String key) {
        int hash = Math.abs(key.hashCode());
        // 在环上查找...
        return findOnRing(hash);
    }
}
\`\`\`

### Go（gRPC 客户端负载均衡）

\`\`\`go
// gRPC 内置客户端负载均衡
import "google.golang.org/grpc/balancer/roundrobin"

conn, _ := grpc.Dial(
    "dns:///user-service:8080",  // 从 DNS 拿实例列表
    grpc.WithDefaultServiceConfig(\`{"loadBalancingPolicy":"round_robin"}\`),
)
// gRPC 自动做客户端负载均衡
client := pb.NewUserServiceClient(conn)
\`\`\`

### Python（自定义一致性哈希）

\`\`\`python
import hashlib
import bisect

class ConsistentHashRing:
    def __init__(self, replicas=150):
        self.ring = {}          # hash -> node
        self.sorted_keys = []   # 排序的 hash 列表
        self.replicas = replicas

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_node(self, node):
        for i in range(self.replicas):
            h = self._hash(f"{node}#{i}")
            self.ring[h] = node
            bisect.insort(self.sorted_keys, h)

    def remove_node(self, node):
        for i in range(self.replicas):
            h = self._hash(f"{node}#{i}")
            del self.ring[h]
            self.sorted_keys.remove(h)

    def get_node(self, key):
        if not self.sorted_keys: return None
        h = self._hash(key)
        idx = bisect.bisect(self.sorted_keys, h)
        if idx == len(self.sorted_keys): idx = 0
        return self.ring[self.sorted_keys[idx]]
\`\`\`

---

## 常见坑

### 坑 1：加权轮询不均匀

普通加权轮询（连续分配）会导致流量集中爆发。用平滑加权轮询（Nginx 算法）分散分配。

### 坑 2：IP Hash 负载不均

大量用户在同一个 NAT 出口（公司、校园），同一 IP 后面是成百上千用户，全部落到同一服务器。

**解决**：改用 Cookie 粘滞或集中 Session 存储。

### 坑 3：健康检查误判

健康检查端点太严格（如检查了所有依赖），一个非关键依赖抖动导致整台被标记下线。

**解决**：区分 liveness（进程活着）和 readiness（能接请求），健康检查只查关键依赖。

### 坑 4：LB 单点故障

负载均衡器自身是单点，它挂了整个服务全挂。

**解决**：LB 高可用——主备 LB + Keepalived（VRRP），主挂了备自动接管。

\`\`\`
客户端 → VIP（虚拟 IP）
          ├── 主 LVS（Keepalived Master）
          └── 备 LVS（Keepalived Backup）
         主挂了 → VIP 漂移到备 → 无感切换
\`\`\`

### 坑 5：长连接导致负载不均

HTTP keep-alive 让连接复用，后续请求不走 LB 的分发逻辑，全落到第一次连接的服务器。

**解决**：限制 keep-alive 请求数（keepalive_requests），到期后重新走 LB 分发。

### 坑 6：一致性哈希虚拟节点太少

虚拟节点少（如 10 个），环上分布不均，某节点负责的弧段过大。

**经验值**：每物理节点 150-200 个虚拟节点。

---

## 实战案例

### 案例 1：电商大促负载均衡架构

\`\`\`
用户 → DNS（按地区分流）
  → CDN（静态资源就近返回）
    → LVS（四层，入口分发，主备高可用）
      → Nginx（七层，按 URL 路由 + WAF + 限流）
        → API 网关（鉴权、灰度）
          → 微服务集群（客户端负载 Ribbon/Envoy）
            → 数据库/缓存（分库分表 + 读写分离）
\`\`\`

### 案例 2：Redis 集群一致性哈希

Redis Cluster 用哈希槽（16384 个 slot）分配 key 到节点：

\`\`\`
key → CRC16(key) % 16384 → slot 号 → 节点
\`\`\`

节点增减时迁移 slot，而不是全量重分布。这是一致性哈希的变体——用固定数量的 slot 代替虚拟节点。

### 案例 3：gRPC 负载均衡

gRPC 基于 HTTP/2 长连接，一个连接可以发多个请求。负载均衡有两种模式：

- **代理模式**：客户端 → L7 LB → 后端（如 Envoy）
- **客户端模式**：客户端直接连多个后端实例，自己负载均衡

---

## 章节小结

负载均衡是分布式系统的基础设施。理解四层与七层的区别、掌握各种负载均衡算法（尤其是加权轮询和一致性哈希）、做好健康检查和会话保持，是构建高可用后端的关键。

实际架构中通常多层负载均衡组合使用——DNS 做机房级分流，LVS 做四层入口分发，Nginx 做七层路由，微服务内部用客户端负载均衡。每一层解决不同层面的问题。

下一章我们将学习 CDN，它与负载均衡紧密相关——CDN 本质上是分布在全球的负载均衡 + 缓存系统。`,
    code: `// ===================================================
// 负载均衡算法模拟（沙箱环境）
// 实现：轮询/加权轮询/最少连接/一致性哈希
// ===================================================
const crypto = require('crypto');

// ---------- 服务器节点 ----------
class Server {
  constructor(name, weight = 1) {
    this.name = name;
    this.weight = weight;
    this.connections = 0;
    this.healthy = true;
    this.requestCount = 0;
  }
}

// ---------- 1. 轮询 ----------
class RoundRobin {
  constructor(servers) {
    this.servers = servers;
    this.idx = 0;
  }
  pick() {
    const healthy = this.servers.filter(s => s.healthy);
    if (!healthy.length) return null;
    const s = healthy[this.idx % healthy.length];
    this.idx++;
    s.requestCount++;
    return s;
  }
}

// ---------- 2. 平滑加权轮询 ----------
class SmoothWeightedRoundRobin {
  constructor(servers) {
    this.servers = servers.map(s => ({
      ...s, currentWeight: 0, effectiveWeight: s.weight
    }));
  }
  pick() {
    const healthy = this.servers.filter(s => s.healthy);
    if (!healthy.length) return null;
    let total = 0, best = null;
    for (const s of healthy) {
      s.currentWeight += s.effectiveWeight;
      total += s.effectiveWeight;
      if (!best || s.currentWeight > best.currentWeight) best = s;
    }
    best.currentWeight -= total;
    best.requestCount++;
    return best;
  }
}

// ---------- 3. 最少连接 ----------
class LeastConnections {
  constructor(servers) { this.servers = servers; }
  pick() {
    const healthy = this.servers.filter(s => s.healthy);
    if (!healthy.length) return null;
    const best = healthy.reduce((min, s) =>
      s.connections < min.connections ? s : min
    );
    best.connections++;
    best.requestCount++;
    return best;
  }
  release(server) { if (server) server.connections--; }
}

// ---------- 4. 一致性哈希（带虚拟节点） ----------
class ConsistentHash {
  constructor(virtualNodes = 100) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();    // hash -> serverName
    this.sortedHashes = [];   // 排序的 hash 值
    this.servers = new Map(); // name -> Server
  }
  _hash(str) {
    return parseInt(crypto.createHash('md5').update(str).digest('hex').slice(0, 8), 16);
  }
  addServer(server) {
    this.servers.set(server.name, server);
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this._hash(server.name + '#' + i);
      this.ring.set(h, server.name);
      this.sortedHashes.push(h);
    }
    this.sortedHashes.sort((a, b) => a - b);
  }
  removeServer(name) {
    this.servers.delete(name);
    this.sortedHashes = this.sortedHashes.filter(h => this.ring.get(h) !== name);
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this._hash(name + '#' + i);
      this.ring.delete(h);
    }
  }
  pick(key) {
    if (!this.sortedHashes.length) return null;
    const h = this._hash(key);
    // 二分查找第一个 >= h 的位置
    let left = 0, right = this.sortedHashes.length - 1;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (this.sortedHashes[mid] < h) left = mid + 1;
      else right = mid;
    }
    if (this.sortedHashes[left] < h) left = 0;
    const serverName = this.ring.get(this.sortedHashes[left]);
    const server = this.servers.get(serverName);
    if (server) server.requestCount++;
    return server;
  }
}

// ---------- 统计打印 ----------
function printDistribution(label, servers, total) {
  const dist = {};
  for (const s of servers) dist[s.name] = s.requestCount;
  console.log(\`  \${label}: \${JSON.stringify(dist)} (总请求: \${total})\`);
}
function resetCounts(servers) { servers.forEach(s => s.requestCount = 0); }

// ---------- 演示场景 ----------
console.log('===== 1. 轮询 =====');
const servers1 = [
  new Server('A'), new Server('B'), new Server('C')
];
const rr = new RoundRobin(servers1);
for (let i = 0; i < 12; i++) rr.pick();
printDistribution('轮询结果', servers1, 12);

console.log('\\n===== 2. 加权轮询（A:5, B:3, C:2）=====');
const servers2 = [
  new Server('A', 5), new Server('B', 3), new Server('C', 2)
];
const wrr = new SmoothWeightedRoundRobin(servers2);
for (let i = 0; i < 20; i++) wrr.pick();
printDistribution('加权轮询', servers2, 20);

console.log('\\n===== 3. 最少连接 =====');
const servers3 = [
  new Server('A'), new Server('B'), new Server('C')
];
const lc = new LeastConnections(servers3);
// 模拟已有连接数
servers3[0].connections = 10;
servers3[1].connections = 2;
servers3[2].connections = 5;
console.log('  初始连接数: A=10, B=2, C=5');
for (let i = 0; i < 5; i++) {
  const s = lc.pick();
  console.log(\`    请求\${i} → \${s.name} (当前连接: \${s.connections})\`);
}

console.log('\\n===== 4. 一致性哈希 =====');
const chServers = [
  new Server('Node-A'), new Server('Node-B'), new Server('Node-C')
];
const ch = new ConsistentHash(100);
chServers.forEach(s => ch.addServer(s));
// 模拟 1000 个不同的 key
const keys = Array.from({ length: 1000 }, (_, i) => 'key-' + i);
keys.forEach(k => ch.pick(k));
printDistribution('3 节点分布', chServers, 1000);

// 演示节点增减的迁移
console.log('\\n  --- 新增 Node-D，统计迁移情况 ---');
const beforeMap = {};
keys.forEach(k => {
  beforeMap[k] = ch.pick(k).name;
});
resetCounts(chServers);
ch.addServer(new Server('Node-D'));
let migrated = 0;
const migrateDetail = {};
keys.forEach(k => {
  const after = ch.pick(k).name;
  if (beforeMap[k] !== after) {
    migrated++;
    migrateDetail[beforeMap[k] + '→' + after] = (migrateDetail[beforeMap[k] + '→' + after] || 0) + 1;
  }
});
console.log(\`  新增 Node-D 后: \${migrated}/1000 个 key 迁移 (\${(migrated/10).toFixed(1)}%)\`);
console.log(\`  迁移详情: \${JSON.stringify(migrateDetail)}\`);
printDistribution('4 节点分布', [...chServers, ch.servers.get('Node-D')], 1000);

console.log('\\n  --- 移除 Node-B，统计迁移情况 ---');
const beforeMap2 = {};
keys.forEach(k => { beforeMap2[k] = ch.pick(k).name; });
resetCounts([...chServers, ch.servers.get('Node-D')]);
ch.removeServer('Node-B');
let migrated2 = 0;
const migrateDetail2 = {};
keys.forEach(k => {
  const after = ch.pick(k);
  if (!after) return;
  if (beforeMap2[k] !== after.name) {
    migrated2++;
    migrateDetail2[beforeMap2[k] + '→' + after.name] = (migrateDetail2[beforeMap2[k] + '→' + after.name] || 0) + 1;
  }
});
console.log(\`  移除 Node-B 后: \${migrated2}/1000 个 key 迁移 (\${(migrated2/10).toFixed(1)}%)\`);
console.log(\`  迁移详情: \${JSON.stringify(migrateDetail2)}\`);

console.log('\\n===== 5. 对比：普通哈希（取模）的迁移 =====');
const moduleKeys = keys.slice();
const beforeMod = {};
moduleKeys.forEach(k => {
  const h = parseInt(crypto.createHash('md5').update(k).digest('hex').slice(0, 8), 16);
  beforeMod[k] = ['Node-A', 'Node-B', 'Node-C'][h % 3];
});
let modMigrated = 0;
moduleKeys.forEach(k => {
  const h = parseInt(crypto.createHash('md5').update(k).digest('hex').slice(0, 8), 16);
  const after = ['Node-A', 'Node-B', 'Node-C', 'Node-D'][h % 4];
  if (beforeMod[k] !== after) modMigrated++;
});
console.log(\`  取模哈希 3→4 节点: \${modMigrated}/1000 迁移 (\${(modMigrated/10).toFixed(1)}%)\`);
console.log(\`  一致性哈希 3→4 节点: \${migrated}/1000 迁移 (\${(migrated/10).toFixed(1)}%)\`);
console.log('  → 一致性哈希迁移量远小于取模哈希！');
`,
  },

  // =========================================================
  // 第四章：CDN 与静态资源
  // =========================================================
  {
    id: "backend-cdn",
    group: "基础与网络",
    icon: "🌍",
    title: "CDN 与静态资源",
    content: `# CDN 与静态资源

## CDN 核心原理

CDN（Content Delivery Network，内容分发网络）的核心思想非常简单：**把内容缓存到离用户最近的节点，让用户就近获取，减少延迟和源站压力**。

\`\`\`
没有 CDN:
用户(北京) → 源站(美国) → 延迟 200ms+

有 CDN:
用户(北京) → CDN边缘节点(北京) → 缓存命中 → 延迟 5ms
                              缓存未命中 → 回源(美国) → 延迟 200ms（只第一次）
\`\`\`

CDN 解决三个核心问题：
1. **延迟**——物理距离远导致网络延迟高，CDN 就近返回
2. **带宽**——源站带宽有限，CDN 分担流量（一个热门视频可能被百万人访问，全走源站带宽扛不住）
3. **可用性**——源站挂了，CDN 缓存还能服务（降级）

---

## CDN 架构

\`\`\`
                    ┌─────────────┐
                    │   源站       │  原始内容服务器
                    │ (Origin)    │  （你的服务器 / OSS）
                    └──────┬──────┘
                           │ 回源
                    ┌──────┴──────┐
                    │  CDN 调度系统 │  全局负载均衡，分配用户到最优边缘节点
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ 边缘节点  │  │ 边缘节点  │  │ 边缘节点  │
        │ (北京)   │  │ (上海)   │  │ (广州)   │
        │ 缓存+服务│  │ 缓存+服务│  │ 缓存+服务│
        └─────────┘  └─────────┘  └─────────┘
              ↓            ↓            ↓
           北京用户      上海用户      广州用户
\`\`\`

### 1. 源站（Origin）

内容的原始来源。可以是：
- 你自己的 Web 服务器
- 对象存储（OSS/S3）
- 另一个 CDN（二级 CDN）

### 2. 边缘节点（Edge Node）

分布在各地的缓存服务器，直接面向用户。每个边缘节点：
- 缓存源站的内容
- 响应用户请求
- 缓存未命中时回源拉取

### 3. 调度系统

决定用户访问哪个边缘节点。调度方式：
- **DNS 调度**：CDN 域名的 DNS 解析根据用户 IP 返回最近边缘节点的 IP
- **HTTP 302 调度**：用户先访问调度服务器，302 跳转到最优边缘节点
- **Anycast**：同一个 IP 在多地宣告，路由协议自动选最近路径

### 4. CDN 节点层级

大型 CDN 有多级缓存：
\`\`\`
用户 → 边缘节点(L1) → 中间节点(L2) → 源站
      缓存未命中 → L2 有缓存 → 返回
                  L2 也没有 → 回源
\`\`\`

多级缓存提高命中率——L1 未命中可以问 L2，不用每次都回源。

---

## CDN 工作流程

### 1. 完整请求流程

\`\`\`
1. 用户访问 www.example.com/logo.png
2. DNS 解析 www.example.com
   → CNAME 到 www.example.com.cdn.cloudflare.net
   → CDN 的 DNS 根据用户 IP 返回最近边缘节点的 IP
3. 用户请求边缘节点
4. 边缘节点检查缓存:
   ├── 命中 → 直接返回缓存内容
   └── 未命中 → 回源拉取
              ├── 源站返回内容 + Cache-Control
              ├── 边缘节点缓存一份
              └── 返回给用户
5. 后续其他用户请求同一内容 → 直接从边缘节点缓存返回
\`\`\`

### 2. DNS 调度详解

CDN 通常通过 CNAME 实现 DNS 调度：

\`\`\`
; 用户的 DNS 配置
www.example.com.  CNAME  www.example.com.cdn.net.

; CDN 的 DNS 服务器根据来源返回不同 IP
; 北京联通用户解析 www.example.com.cdn.net:
www.example.com.cdn.net.  A  10.0.1.1   ; 北京联通边缘节点

; 上海电信用户解析:
www.example.com.cdn.net.  A  10.0.2.1   ; 上海电信边缘节点
\`\`\`

CDN 的 DNS 调度会考虑：
- 用户地理位置（省/市级别）
- 用户运营商（电信/联通/移动）
- 节点健康状态
- 节点负载

---

## CDN 缓存策略

### 1. HTTP 缓存头

CDN 缓存行为由 HTTP 缓存头控制：

#### Cache-Control（最重要）

\`\`\`
Cache-Control: max-age=86400        // 缓存 1 天（86400 秒）
Cache-Control: public, max-age=3600 // 公共缓存 1 小时
Cache-Control: private, no-cache    // 不缓存（私有内容）
Cache-Control: no-store             // 绝不缓存
Cache-Control: s-maxage=3600        // CDN 缓存 1 小时（优先于 max-age）
\`\`\`

| 指令 | 含义 |
|------|------|
| max-age | 缓存有效时间（秒） |
| s-maxage | 共享缓存（CDN）有效时间，优先于 max-age |
| public | 允许 CDN 缓存（即使有 Authorization） |
| private | 只允许浏览器缓存，CDN 不缓存 |
| no-cache | 必须向源站验证才能用缓存 |
| no-store | 完全不缓存 |
| must-revalidate | 过期后必须重新验证 |

#### Expires（旧标准）

\`\`\`
Expires: Wed, 21 Oct 2025 07:28:00 GMT
\`\`\`

指定绝对过期时间。Cache-Control 优先级更高。

#### ETag / Last-Modified（协商缓存）

\`\`\`
# 首次请求，源站返回内容和标识
GET /logo.png
← 200 OK
  ETag: "abc123"
  Last-Modified: Wed, 21 Oct 2025 07:00:00 GMT
  Cache-Control: max-age=3600

# 缓存过期后，CDN 带标识回源验证
GET /logo.png
  If-None-Match: "abc123"
  If-Modified-Since: Wed, 21 Oct 2025 07:00:00 GMT
← 304 Not Modified  (内容没变，不传 body，省带宽)
\`\`\`

- **ETag**：内容的唯一标识（通常是内容的哈希），内容变了 ETag 就变
- **Last-Modified**：内容最后修改时间
- 协商缓存比强缓存（max-age）多一次请求，但不传 body，省带宽

### 2. CDN 缓存键（Cache Key）

CDN 用缓存键区分不同内容。默认缓存键是 URL（含查询参数）：

\`\`\`
/logo.png          → 缓存键: /logo.png
/logo.png?v=1      → 缓存键: /logo.png?v=1 （与上面不同！）
/logo.png?token=xx → 缓存键: /logo.png?token=xx （每个 token 一份缓存！）
\`\`\`

**问题**：URL 带了无关的查询参数（如 token、时间戳），会导致缓存命中率暴跌。

**解决**：配置 CDN 忽略指定查询参数：

\`\`\`
# 阿里云 CDN：忽略所有查询参数
缓存键: 只用 URL path，忽略 query string

# Cloudflare：只保留指定参数
Cache Key: /logo.png (忽略 ?token=xxx)
\`\`\`

### 3. 缓存刷新与预热

- **刷新（刷新/清除）**：强制删除 CDN 缓存，下次请求回源。用于内容更新后让用户立即看到新内容。
- **预热（预加载）**：在用户请求前，主动把内容推送到 CDN 节点缓存。用于新版本发布前预热。

\`\`\`python
# 阿里云 CDN 刷新 API（伪代码）
import requests
requests.post('https://cdn.aliyuncs.com', {
    'Action': 'RefreshObjectCaches',
    'ObjectPath': 'https://www.example.com/logo.png',
    'ObjectType': 'File',  # 或 Directory 刷新整个目录
})
\`\`\`

**刷新注意**：
- 刷新有频率限制（如每天 100 次）
- 刷新后缓存命中率会短暂下降
- 刷新目录比刷新文件慢

---

## 静态资源优化

### 1. 文件哈希命名 + 长缓存

前端构建时给文件名加内容哈希：

\`\`\`
app.a3f5b2.js   ← 内容变了，哈希变，文件名变
app.a3f5b2.css
logo.b8c9d0.png
\`\`\`

配合长缓存策略：

\`\`\`nginx
# 文件名带哈希的，缓存 1 年（immutable）
location ~* \\.[a-f0-9]{8}\\.(js|css|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# index.html 不缓存（每次拉最新的，引用最新哈希文件）
location = /index.html {
    add_header Cache-Control "no-cache";
}
\`\`\`

**原理**：
1. 用户首次访问 → 拉 index.html → 引用 app.a3f5b2.js
2. 浏览器缓存 app.a3f5b2.js 一年
3. 代码更新 → 构建出 app.c7d8e9.js → index.html 更新引用
4. 用户再次访问 → 拉 index.html（不缓存）→ 引用 app.c7d8e9.js → 新文件，重新下载

这样文件名不变就一直用缓存，文件名变了就拉新的。完美解决"缓存 vs 更新"矛盾。

### 2. Gzip / Brotli 压缩

文本资源压缩能大幅减小传输体积：

| 资源 | 原始大小 | Gzip | Brotli |
|------|----------|------|--------|
| jQuery 3.x | 280KB | 90KB | 75KB |
| React 17 | 130KB | 42KB | 35KB |
| CSS 50KB | 50KB | 12KB | 10KB |

\`\`\`nginx
# Nginx Gzip
gzip on;
gzip_min_length 1024;        # 小于 1KB 不压缩
gzip_comp_level 6;           # 压缩级别 1-9，6 是平衡点
gzip_types text/plain text/css application/json application/javascript;

# Nginx Brotli（需 ngx_brotli 模块）
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript;
\`\`\`

**注意**：
- 图片/视频已压缩，再 gzip 无效反而浪费 CPU
- 压缩级别不是越高越好，6 是性价比最高的
- Brotli 比 Gzip 压缩率高 10-20%，但压缩稍慢

### 3. 图片优化

图片通常是页面体积大头：

| 格式 | 适用 | 特点 |
|------|------|------|
| WebP | 照片、插画 | 比 JPEG 小 25-35%，现代浏览器支持 |
| AVIF | 照片 | 比 WebP 再小 20%，较新 |
| JPEG | 照片 | 兼容性最好 |
| PNG | 透明图、图标 | 无损，体积大 |
| SVG | 矢量图标 | 矢量，无限缩放，体积小 |

\`\`\`html
<!-- 响应式图片 + 格式回退 -->
<picture>
  <source srcset="logo.avif" type="image/avif">
  <source srcset="logo.webp" type="image/webp">
  <img src="logo.jpg" alt="Logo">
</picture>
\`\`\`

### 4. HTTP/2 Server Push（已弃用）

曾经 Server Push 可以在用户请求 HTML 时主动推送 CSS/JS。但 Chrome 已移除支持，不推荐使用。用 \`<link rel="preload">\` 代替。

---

## 动静分离方案

把静态资源和动态接口分开部署：

\`\`\`
静态资源 (js/css/img) → CDN / 对象存储 → 全球加速
动态接口 (/api/*)     → 源站服务器    → 实时处理
\`\`\`

### 方案 1：CDN + 源站

\`\`\`
www.example.com/static/* → CDN
www.example.com/api/*    → 源站
\`\`\`

### 方案 2：独立域名

\`\`\`
static.example.com  → CDN（纯静态，Cookie-free）
www.example.com     → 源站（动态）
\`\`\`

独立域名的好处：
- Cookie-free：静态资源请求不带 Cookie，省带宽
- CDN 配置独立：静态域名全走 CDN，动态域名不走
- 浏览器并发：不同域名可突破 6 个并发连接限制

### 方案 3：对象存储 + CDN

\`\`\`
用户 → CDN → 对象存储(OSS/S3)
              ↑
         CI/CD 上传静态资源到 OSS
\`\`\`

源站完全不用管静态资源，CI/CD 把构建产物上传到 OSS，CDN 从 OSS 回源。

---

## CDN 适用场景

### 1. 静态网站

博客、文档站、营销页——全静态，CDN 命中率 99%+。

### 2. 视频流

短视频、直播、点播。CDN 边缘节点缓存视频分片，用户就近拉流。

\`\`\`
HLS 切片: video.m3u8 + seg0.ts + seg1.ts + ...
用户拉 m3u8 → CDN → 逐个拉 ts 分片 → CDN 缓存分片
\`\`\`

### 3. 文件下载

APP 安装包、软件更新包——大文件，CDN 分担带宽。

### 4. 动态加速

动态接口（API）虽然不能缓存，但 CDN 可以优化回源路径（CDN 的专线比公网快）。

---

## CDN 选型

| CDN | 特点 | 适用 |
|-----|------|------|
| 阿里云 CDN | 国内节点多，按量计费 | 国内业务 |
| 腾讯云 CDN | 国内节点多，与微信生态好 | 国内业务 |
| Cloudflare | 全球节点，免费计划 | 海外/全球 |
| AWS CloudFront | 与 S3/Lambda 集成 | AWS 生态 |
| Akamai | 老牌，全球覆盖，贵 | 大企业 |

**选型考虑**：
- 用户分布（国内/海外/全球）
- 节点覆盖（你的用户在哪，CDN 节点有没有）
- 计费方式（按流量/按带宽/按请求数）
- 功能（是否支持视频直播、动态加速、边缘计算）
- 价格（国内 CDN 约 0.2 元/GB）

---

## CDN 常见问题

### 1. 缓存不更新

内容更新了，CDN 还返回旧内容。

**原因**：CDN 缓存还没过期（max-age 未到）。

**解决**：
- 文件名加哈希，更新后文件名变
- 主动刷新 CDN 缓存
- 短 max-age + 协商缓存（ETag）

### 2. 跨域问题

CDN 域名和源站域名不同，字体、Canvas 等资源有跨域限制。

**解决**：CDN 配置 CORS 头：

\`\`\`
Access-Control-Allow-Origin: https://www.example.com
\`\`\`

### 3. 回源带宽突增

CDN 缓存大面积过期（如统一刷新），大量请求同时回源，源站带宽打满。

**解决**：
- 分批刷新，不要一次全刷
- 源站用 OSS（带宽大）而不是自己的服务器
- CDN 多级缓存，减少回源

### 4. 计费超预期

CDN 按流量计费，被刷流量（如被 DDoS、爬虫）会产生高额账单。

**解决**：
- 设置流量上限告警
- 配置防盗链（Referer 校验）
- 使用 Token 鉴权（URL 签名，防盗链）

\`\`\`
# URL 签名防盗链
https://cdn.example.com/video.mp4?sign=md5(密钥+过期时间+路径)&expire=1234567890
# 过期后 URL 失效，无法访问
\`\`\`

---

## 对象存储与 CDN 配合

### OSS + CDN 方案

\`\`\`
构建产物 → CI/CD → 上传到 OSS(S3)
                     ↓ 回源
                   CDN 边缘节点 ← 用户
\`\`\`

\`\`\`yaml
# GitHub Actions 上传到 OSS（伪代码）
- name: Upload to OSS
  run: |
    ossutil cp -r dist/ oss://my-bucket/ --recursive
    # 刷新 CDN 缓存
    aliyun cdn RefreshObjectCaches --ObjectPath "https://cdn.example.com/*" --ObjectType Directory
\`\`\`

**优势**：
- 源站是 OSS（无限带宽、高可用），不是你的服务器
- 静态资源不占服务器带宽
- CDN 缓存层分担流量

### 私有桶 + CDN 鉴权

OSS 桶设为私有（防直接访问），只允许通过 CDN 访问：

\`\`\`
用户 → CDN(带签名鉴权) → OSS(验证 CDN 来源) → 返回
\`\`\`

---

## 多语言对照

### Node.js（Express 设缓存头）

\`\`\`javascript
app.use('/static', express.static('public', {
  maxAge: '1y',           // 浏览器缓存 1 年
  immutable: true,        // immutable 标记
  etag: true,             // 自动生成 ETag
  lastModified: true      // 自动 Last-Modified
}));

// API 不缓存
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({ data: getData() });
});
\`\`\`

### Java（Spring Boot 静态资源缓存）

\`\`\`java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                        .cachePublic().immutable());
    }
}
\`\`\`

### Python（Flask 缓存头）

\`\`\`python
from flask import Flask, send_file
app = Flask(__name__)

@app.route('/static/<path:filename>')
def serve_static(filename):
    resp = send_file(f'static/{filename}')
    resp.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return resp
\`\`\`

---

## 常见坑

### 坑 1：CDN 缓存了错误响应

源站返回 500 错误被 CDN 缓存了，所有用户都看到 500。

**解决**：CDN 配置不缓存 4xx/5xx，或缓存时间极短。

### 坑 2：查询参数导致缓存不命中

\`/api/data?ts=1234567890\` 每次时间戳不同，CDN 每次回源。

**解决**：CDN 忽略指定查询参数，或改用路径（\`/api/data/v123\`）。

### 坑 3：CDN 节点回源风暴

一个内容在 CDN 过期，同时大量请求回源（缓存击穿）。

**解决**：CDN 配置 stale-while-revalidate（过期后先用旧缓存，后台异步刷新）。

### 坑 4：HTTPS 混合内容

HTTPS 页面引用 HTTP 的 CDN 资源，浏览器拦截。

**解决**：CDN 用 HTTPS，或用协议相对 URL（\`//cdn.example.com/a.js\`）。

---

## 章节小结

CDN 通过边缘缓存 + 就近访问，解决了延迟、带宽、可用性三大问题。掌握 HTTP 缓存头（Cache-Control/ETag/Last-Modified）、缓存键设计、缓存刷新预热是使用 CDN 的关键。静态资源优化（文件哈希命名、Gzip/Brotli 压缩、图片格式）能进一步减小体积提升体验。

对象存储 + CDN 是现代前端部署的标准方案——源站用 OSS，CI/CD 自动上传，CDN 全球加速，服务器完全不碰静态资源。

下一章我们将学习 Cookie 与 Session 机制，这是 Web 登录态管理的基石。`,
    code: `// ===================================================
// CDN 节点缓存模拟（沙箱环境）
// 模拟边缘节点缓存/回源/协商缓存/就近调度
// ===================================================
const crypto = require('crypto');

// ---------- 源站 ----------
class OriginServer {
  constructor() {
    this.resources = new Map(); // path -> { content, etag, lastModified }
  }
  setResource(path, content) {
    const etag = '"' + crypto.createHash('md5').update(content).digest('hex').slice(0, 8) + '"';
    this.resources.set(path, {
      content, etag,
      lastModified: Date.now(),
      maxAge: 3600 // 源站默认缓存 1 小时
    });
  }
  // 回源请求
  fetch(path, headers = {}) {
    const res = this.resources.get(path);
    if (!res) return { status: 404, body: 'Not Found' };
    // 协商缓存：If-None-Match
    if (headers['if-none-match'] === res.etag) {
      return { status: 304, headers: { etag: res.etag }, body: null };
    }
    return {
      status: 200,
      headers: {
        'content-type': 'text/plain',
        'etag': res.etag,
        'last-modified': new Date(res.lastModified).toUTCString(),
        'cache-control': 'public, max-age=' + res.maxAge
      },
      body: res.content
    };
  }
  updateResource(path, content) {
    this.setResource(path, content); // 更新内容，ETag 变化
  }
}

// ---------- CDN 边缘节点 ----------
class CDNEdge {
  constructor(name, region) {
    this.name = name;
    this.region = region;
    this.cache = new Map(); // path -> { body, etag, headers, expireAt }
    this.stats = { hits: 0, misses: 0, revalidates: 0, requests: 0 };
  }
  // 用户请求
  request(path, origin, clientHeaders = {}) {
    this.stats.requests++;
    const cached = this.cache.get(path);

    if (cached) {
      // 强缓存未过期
      if (Date.now() < cached.expireAt) {
        this.stats.hits++;
        return { ...cached.response, from: 'CDN-HIT', edge: this.name };
      }
      // 缓存过期，协商回源验证
      this.stats.revalidates++;
      const originRes = origin.fetch(path, {
        'if-none-match': cached.etag
      });
      if (originRes.status === 304) {
        // 内容没变，续期缓存
        cached.expireAt = Date.now() + 3600 * 1000;
        return { ...cached.response, from: 'CDN-REVALIDATE', edge: this.name };
      } else {
        // 内容变了，更新缓存
        this._cacheResponse(path, originRes);
        return { ...originRes, from: 'CDN-UPDATE', edge: this.name };
      }
    }

    // 缓存未命中，回源
    this.stats.misses++;
    const originRes = origin.fetch(path, clientHeaders);
    if (originRes.status === 200) {
      this._cacheResponse(path, originRes);
    }
    return { ...originRes, from: 'CDN-MISS', edge: this.name };
  }
  _cacheResponse(path, res) {
    const maxAge = 3600;
    this.cache.set(path, {
      body: res.body,
      etag: res.headers.etag,
      response: res,
      expireAt: Date.now() + maxAge * 1000
    });
  }
  // 刷新缓存
  purge(path) {
    const had = this.cache.has(path);
    this.cache.delete(path);
    return had;
  }
  // 预热
  prefetch(path, origin) {
    const res = origin.fetch(path);
    if (res.status === 200) this._cacheResponse(path, res);
    return res.status === 200;
  }
  hitRate() {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? '0%' : ((this.stats.hits / total) * 100).toFixed(1) + '%';
  }
}

// ---------- CDN 调度系统 ----------
class CDNScheduler {
  constructor() { this.edges = []; }
  addEdge(edge) { this.edges.push(edge); }
  // 根据用户区域就近调度
  route(userRegion) {
    // 找同区域节点
    const same = this.edges.find(e => e.region === userRegion);
    if (same) return same;
    // 找不到就返回第一个
    return this.edges[0] || null;
  }
}

// ---------- 演示场景 ----------
console.log('===== 1. CDN 基本缓存流程 =====');
const origin = new OriginServer();
origin.setResource('/index.html', '<html>Hello CDN</html>');

const edge = new CDNEdge('edge-bj', 'beijing');
console.log('  首次请求（回源）:');
let res = edge.request('/index.html', origin);
console.log(\`    状态: \${res.status}, 来源: \${res.from}, ETag: \${res.headers.etag}\`);

console.log('  第二次请求（命中缓存）:');
res = edge.request('/index.html', origin);
console.log(\`    状态: \${res.status}, 来源: \${res.from}\`);

console.log('\\n===== 2. 就近调度 =====');
const scheduler = new CDNScheduler();
scheduler.addEdge(new CDNEdge('edge-bj', 'beijing'));
scheduler.addEdge(new CDNEdge('edge-sh', 'shanghai'));
scheduler.addEdge(new CDNEdge('edge-gz', 'guangzhou'));
for (const region of ['beijing', 'shanghai', 'guangzhou', 'chengdu']) {
  const edge = scheduler.route(region);
  console.log(\`  用户(\${region}) → 调度到 \${edge.name}\`);
}

console.log('\\n===== 3. 协商缓存（304） =====');
const origin3 = new OriginServer();
origin3.setResource('/app.js', 'console.log("v1")');
const edge3 = new CDNEdge('edge-bj', 'beijing');
// 首次回源
edge3.request('/app.js', origin3);
// 模拟缓存过期
const cached = edge3.cache.get('/app.js');
cached.expireAt = Date.now() - 1000;
console.log('  缓存已过期，但源站内容未变:');
res = edge3.request('/app.js', origin3);
console.log(\`    来源: \${res.from} (304 协商，不传 body，省带宽)\`);

console.log('\\n===== 4. 内容更新（ETag 变化） =====');
origin3.updateResource('/app.js', 'console.log("v2")');
cached.expireAt = Date.now() - 1000; // 再过期
console.log('  源站内容已更新，缓存过期:');
res = edge3.request('/app.js', origin3);
console.log(\`    来源: \${res.from}, 新内容: "\${res.body}"\`);

console.log('\\n===== 5. 缓存刷新与预热 =====');
const origin5 = new OriginServer();
origin5.setResource('/news.html', '<h1>News v1</h1>');
const edge5 = new CDNEdge('edge-bj', 'beijing');
console.log('  预热（用户请求前主动缓存）:');
edge5.prefetch('/news.html', origin5);
res = edge5.request('/news.html', origin5);
console.log(\`    来源: \${res.from} (预热后直接命中)\`);
console.log('  刷新缓存:');
edge5.purge('/news.html');
res = edge5.request('/news.html', origin5);
console.log(\`    来源: \${res.from} (刷新后回源)\`);

console.log('\\n===== 6. 缓存命中率统计 =====');
const origin6 = new OriginServer();
origin6.setResource('/a.js', 'a');
origin6.setResource('/b.js', 'b');
origin6.setResource('/c.js', 'c');
const edge6 = new CDNEdge('edge-bj', 'beijing');
// 模拟 100 个请求
const paths = ['/a.js', '/a.js', '/b.js', '/a.js', '/c.js', '/a.js', '/b.js', '/a.js', '/a.js', '/b.js'];
for (let i = 0; i < 100; i++) {
  edge6.request(paths[i % paths.length], origin6);
}
console.log(\`  100 次请求统计:\`);
console.log(\`    总请求: \${edge6.stats.requests}\`);
console.log(\`    命中: \${edge6.stats.hits}, 未命中: \${edge6.stats.misses}, 协商: \${edge6.stats.revalidates}\`);
console.log(\`    命中率: \${edge6.hitRate()}\`);

console.log('\\n===== 7. 多节点协同 =====');
const multiOrigin = new OriginServer();
multiOrigin.setResource('/data.json', '{"v":1}');
const bjEdge = new CDNEdge('edge-bj', 'beijing');
const shEdge = new CDNEdge('edge-sh', 'shanghai');
// 北京用户请求
bjEdge.request('/data.json', multiOrigin);
// 上海用户请求（不同节点，各自回源）
shEdge.request('/data.json', multiOrigin);
console.log(\`  北京节点: hits=\${bjEdge.stats.hits}, misses=\${bjEdge.stats.misses}\`);
console.log(\`  上海节点: hits=\${shEdge.stats.hits}, misses=\${shEdge.stats.misses}\`);
console.log('  → 不同边缘节点各自独立缓存，首次都要回源');
`,
  },

  // =========================================================
  // 第五章：Cookie 与 Session 机制
  // =========================================================
  {
    id: "backend-cookie-session",
    group: "基础与网络",
    icon: "🍪",
    title: "Cookie 与 Session 机制",
    content: `# Cookie 与 Session 机制

## HTTP 无状态问题

HTTP 协议是一个**无状态协议**——每个请求都是独立的，服务器不会记住"这个请求和上一个请求是同一个人发的"。这就像一家餐厅每次都把你当新顾客，不记得你上次点了什么。

无状态的好处是简单、可扩展（任何服务器都能处理任何请求），但带来了一个核心问题：**如何记住用户的登录状态？**

\`\`\`
请求1: 登录 → 服务器验证密码 → 返回"登录成功"
请求2: 查看个人信息 → 服务器：你是谁？我不认识你 → 要求重新登录
\`\`\`

这就是 HTTP 无状态导致的"登录态丢失"问题。解决方案就是 **Cookie + Session** 或 **Token**。

### 解决方案的演进

1. **Cookie**：浏览器存储的小数据，每次请求自动带上
2. **Session**：服务端存储的用户状态，通过 Cookie 传递 Session ID
3. **Token（JWT）**：自包含的令牌，服务端不存状态
4. **OAuth/SSO**：跨系统的统一认证

---

## Cookie 详解

### Cookie 是什么

Cookie 是浏览器存储的一小块数据（通常 4KB 以内），它会在每次请求同一域名时**自动**附带到请求头中。

\`\`\`
# 服务端通过 Set-Cookie 响应头设置 Cookie
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: lang=zh-CN; Max-Age=86400

# 浏览器后续请求自动带上 Cookie
GET /profile HTTP/1.1
Cookie: sessionId=abc123; lang=zh-CN
\`\`\`

### Cookie 的结构

一个 Cookie 由 name=value 和多个属性组成：

\`\`\`
Set-Cookie: <name>=<value>; <attr1>; <attr2>; ...
\`\`\`

| 属性 | 说明 | 示例 |
|------|------|------|
| Domain | Cookie 所属域名 | Domain=.example.com（主域及子域都带） |
| Path | Cookie 生效路径 | Path=/api（只有 /api 路径带） |
| Expires | 绝对过期时间 | Expires=Wed, 21 Oct 2025 07:28:00 GMT |
| Max-Age | 相对过期秒数 | Max-Age=86400（24 小时） |
| Secure | 只通过 HTTPS 传输 | Secure |
| HttpOnly | JS 不可读（防 XSS） | HttpOnly |
| SameSite | 跨站发送策略 | SameSite=Strict/Lax/None |

### Domain 和 Path 的作用

\`\`\`
Set-Cookie: token=abc; Domain=.example.com; Path=/
→ 访问 example.com、www.example.com、api.example.com 的任何路径都带

Set-Cookie: token=abc; Domain=api.example.com; Path=/v1
→ 只有访问 api.example.com/v1/* 才带
\`\`\`

**Domain 规则**：
- 不设 Domain：只当前域名带，子域不带
- 设 Domain=.example.com：主域和所有子域都带
- 不能设跨域 Domain（example.com 不能设 Domain=google.com）

### Expires vs Max-Age

\`\`\`
# Expires：绝对时间
Set-Cookie: token=abc; Expires=Wed, 21 Oct 2025 07:28:00 GMT

# Max-Age：相对秒数（优先于 Expires）
Set-Cookie: token=abc; Max-Age=86400
\`\`\`

- 都不设：**会话 Cookie**，浏览器关闭就删
- Max-Age=0 或负数：立即删除
- Max-Age 优先于 Expires

---

## Cookie 工作流程

### 1. 设置 Cookie

服务端通过 \`Set-Cookie\` 响应头设置：

\`\`\`javascript
// Node.js Express
res.cookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 86400000,  // 24 小时（毫秒）
  path: '/',
  domain: '.example.com'
});
\`\`\`

\`\`\`java
// Java Spring Boot
@GetMapping("/login")
public ResponseEntity login(HttpServletResponse response) {
    Cookie cookie = new Cookie("sessionId", "abc123");
    cookie.setHttpOnly(true);
    cookie.setSecure(true);
    cookie.setMaxAge(86400);  // 24 小时（秒）
    cookie.setPath("/");
    response.addCookie(cookie);
    return ResponseEntity.ok("登录成功");
}
\`\`\`

\`\`\`go
// Go Gin
func login(c *gin.Context) {
    c.SetCookie("sessionId", "abc123", 86400, "/", ".example.com", true, true)
    // 参数: name, value, maxAge, path, domain, secure, httpOnly
    c.JSON(200, gin.H{"msg": "登录成功"})
}
\`\`\`

### 2. 发送 Cookie

浏览器在后续请求中自动带上 Cookie：

\`\`\`
GET /profile HTTP/1.1
Host: www.example.com
Cookie: sessionId=abc123; lang=zh-CN; theme=dark
\`\`\`

\`\`\`javascript
// 服务端读取 Cookie
// Node.js Express（需 cookie-parser 中间件）
app.use(require('cookie-parser')());
app.get('/profile', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const lang = req.cookies.lang;
  res.json({ sessionId, lang });
});
\`\`\`

\`\`\`python
# Python Flask
from flask import request

@app.route('/profile')
def profile():
    session_id = request.cookies.get('sessionId')
    lang = request.cookies.get('lang')
    return {'sessionId': session_id, 'lang': lang}
\`\`\`

### 3. 删除 Cookie

\`\`\`javascript
// 设置 Max-Age=0 删除
res.clearCookie('sessionId', { path: '/' });
// 等价于
res.cookie('sessionId', '', { maxAge: 0, path: '/' });
\`\`\`

**注意**：删除 Cookie 时 path 和 domain 必须与设置时一致，否则删不掉。

---

## Cookie 安全

### 1. HttpOnly（防 XSS）

设置 HttpOnly 后，JavaScript 的 \`document.cookie\` 读不到这个 Cookie，防止 XSS 攻击窃取。

\`\`\`
Set-Cookie: sessionId=abc123; HttpOnly
\`\`\`

\`\`\`javascript
// 没设 HttpOnly：
document.cookie  // "sessionId=abc123; lang=zh-CN"
// XSS 攻击可以窃取 sessionId！

// 设了 HttpOnly：
document.cookie  // "lang=zh-CN"（sessionId 读不到）
// XSS 攻击窃取不到 sessionId
\`\`\`

**原则**：所有敏感 Cookie（Session ID、Token）都应设 HttpOnly。

### 2. Secure（防窃听）

设置 Secure 后，Cookie 只通过 HTTPS 传输，HTTP 不带。

\`\`\`
Set-Cookie: sessionId=abc123; Secure
\`\`\`

防止中间人窃听。生产环境必须开启。

### 3. SameSite（防 CSRF）

CSRF（跨站请求伪造）攻击：用户登录了银行网站 A，又访问了恶意网站 B，B 中嵌了一个向 A 转账的请求。浏览器会自动带上 A 的 Cookie，导致转账成功。

**SameSite** 控制 Cookie 在跨站请求时是否发送：

| 值 | 行为 | 安全性 |
|----|------|--------|
| Strict | 完全不发送跨站 Cookie（即使从外站链接过来也不带） | 最安全，但体验差 |
| Lax | 大多数跨站不发送，但顶层导航的 GET 请求会带 | 安全与体验平衡（默认值） |
| None | 跨站都发送（需配合 Secure） | 不安全，需显式声明 |

\`\`\`
Set-Cookie: sessionId=abc123; SameSite=Strict
# 从 google.com 链接跳转到你的网站，不会带 sessionId（需重新登录）

Set-Cookie: sessionId=abc123; SameSite=Lax
# 从 google.com 链接跳转过来，GET 请求会带（保持登录），但 POST 不带

Set-Cookie: sessionId=abc123; SameSite=None; Secure
# 跨站都带（第三方 Cookie，逐步被浏览器淘汰）
\`\`\`

**现代浏览器默认 SameSite=Lax**，大大减少了 CSRF 攻击面。

### 4. CSRF 防护补充

除了 SameSite，还有其他 CSRF 防护手段：

\`\`\`javascript
// CSRF Token 方案
// 1. 服务端生成随机 token，放在表单隐藏字段
<input type="hidden" name="_csrf" value="随机token">

// 2. 提交表单时带 token
// 3. 服务端验证 token 是否匹配
app.post('/transfer', (req, res) => {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send('CSRF 验证失败');
  }
  // 处理转账
});
\`\`\`

\`\`\`java
// Java Spring Security CSRF 防护（默认开启）
// 自动在表单中注入 _csrf token
// <input type="hidden" name="_csrf" value="\${_csrf.token}">
\`\`\`

### 安全属性总结

| 属性 | 防御 | 建议 |
|------|------|------|
| HttpOnly | 防 XSS 窃取 | 敏感 Cookie 必设 |
| Secure | 防窃听 | 生产环境必设 |
| SameSite=Lax | 防 CSRF | 推荐默认 |
| Domain | 限制范围 | 尽量不设跨子域 |
| Path | 限制路径 | 登录 Cookie 设 / |

---

## Session 机制

### Session 是什么

Cookie 存在浏览器端，有大小限制（4KB）和安全风险。Session 是**服务端存储**的用户状态，浏览器只存一个 Session ID。

\`\`\`
浏览器                         服务端
  │                              │
  │  1. 登录请求(账号密码)        │
  │ ─────────────────────────→   │
  │                              │ 2. 验证密码
  │                              │ 3. 创建 Session(id=abc, userId=123)
  │                              │    存入 Session 存储
  │  4. 返回 Set-Cookie: sid=abc │
  │ ←─────────────────────────   │
  │                              │
  │  5. 请求带 Cookie: sid=abc   │
  │ ─────────────────────────→   │
  │                              │ 6. 根据 sid 查 Session
  │                              │    → 找到 userId=123
  │  7. 返回用户数据              │
  │ ←─────────────────────────   │
\`\`\`

### Session ID 的传递方式

#### 方式 1：Cookie（最常用）

\`\`\`
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax
\`\`\`

浏览器自动管理，无需前端干预。推荐方式。

#### 方式 2：URL 重写（不推荐）

\`\`\`
https://example.com/profile;jsessionid=abc123
\`\`\`

Cookie 不可用时（如禁用 Cookie）的降级方案。问题：
- URL 泄露导致 Session 劫持（日志、Referer 头会暴露）
- 不美观
- 现代基本不用

#### 方式 3：Token（Header）

\`\`\`
Authorization: Bearer <token>
\`\`\`

JWT 等 Token 方案，不依赖 Cookie。适合跨域、移动端。

### Session 数据存储

#### 1. 内存存储（开发用）

\`\`\`javascript
// Node.js 内存 Session
const sessions = new Map();

app.post('/login', (req, res) => {
  const sessionId = generateId();
  sessions.set(sessionId, { userId: 123, loginTime: Date.now() });
  res.cookie('sid', sessionId, { httpOnly: true });
  res.send('登录成功');
});

app.get('/profile', (req, res) => {
  const session = sessions.get(req.cookies.sid);
  if (!session) return res.status(401).send('未登录');
  res.json({ userId: session.userId });
});
\`\`\`

**优点**：速度快。
**缺点**：重启丢失、不支持多实例（A 创建的 Session B 读不到）。

#### 2. 文件存储

\`\`\`php
// PHP 默认文件 Session
// Session 存在 /tmp/sess_<session_id> 文件中
session_start();
$_SESSION['userId'] = 123;
\`\`\`

**优点**：简单，无需额外组件。
**缺点**：多服务器不共享、IO 慢。

#### 3. Redis 存储（生产推荐）

\`\`\`javascript
// Node.js + Redis Session
const redis = require('redis');
const client = redis.createClient();

app.post('/login', async (req, res) => {
  const sessionId = generateId();
  await client.set(\`session:\${sessionId}\`, JSON.stringify({
    userId: 123, loginTime: Date.now()
  }), 'EX', 86400);  // 24 小时过期
  res.cookie('sid', sessionId, { httpOnly: true });
  res.send('登录成功');
});
\`\`\`

\`\`\`java
// Java Spring Session + Redis
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 86400)
@SpringBootApplication
public class App { ... }

// 自动存入 Redis，所有实例共享
\`\`\`

**优点**：多实例共享、自带过期、高性能。
**缺点**：需维护 Redis。

#### 4. 数据库存储

\`\`\`sql
CREATE TABLE sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  data TEXT,
  expires_at TIMESTAMP,
  INDEX idx_expires (expires_at)
);
\`\`\`

**优点**：持久化、可查询。
**缺点**：性能不如 Redis。

### 存储方案对比

| 方案 | 速度 | 共享 | 持久化 | 适用 |
|------|------|------|--------|------|
| 内存 | 极快 | 否 | 否 | 开发测试 |
| 文件 | 中 | 否 | 是 | 单机小项目 |
| Redis | 快 | 是 | 是 | 生产推荐 |
| 数据库 | 慢 | 是 | 是 | 需要查询 Session |

---

## Session vs JWT 深度对比

### Session（有状态）

\`\`\`
登录 → 服务端创建 Session（存 Redis）→ 返回 Session ID
请求 → 带 Session ID → 服务端查 Redis → 获取用户信息
\`\`\`

### JWT（无状态）

\`\`\`
登录 → 服务端签发 JWT（含用户信息+签名）→ 返回 JWT
请求 → 带 JWT → 服务端验签 → 直接获取用户信息（不查存储）
\`\`\`

JWT 结构：

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyM30.signature
   Header               Payload          Signature
\`\`\`

\`\`\`javascript
// JWT 生成与验证（Node.js，用 crypto 模块实现）
const crypto = require('crypto');

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\\+/g, '-').replace(/\\//g, '_');
}

function signJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const data = base64url(Buffer.from(JSON.stringify(header))) + '.' +
               base64url(Buffer.from(JSON.stringify(payload)));
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return data + '.' + base64url(sig);
}

function verifyJWT(token, secret) {
  const [header, payload, sig] = token.split('.');
  const data = header + '.' + payload;
  const expectedSig = base64url(crypto.createHmac('sha256', secret).update(data).digest());
  if (sig !== expectedSig) throw new Error('签名无效');
  return JSON.parse(Buffer.from(payload, 'base64').toString());
}
\`\`\`

### 对比

| 维度 | Session | JWT |
|------|---------|-----|
| 状态 | 有状态（服务端存） | 无状态（Token 自包含） |
| 存储 | Redis/内存 | 不需要 |
| 续期 | 容易（刷新过期时间） | 难（需重新签发） |
| 注销 | 容易（删 Session） | 难（Token 未过期前有效） |
| 扩展 | 需共享 Session | 天然支持多实例 |
| 大小 | Session ID 短 | JWT 较大（含数据） |
| 安全 | ID 随机，不易篡改 | 签名防篡改，但 payload 可读 |
| 适用 | Web 应用 | API、移动端、SSO |

### Session 的优势

1. **注销简单**：删掉服务端的 Session 即可，Token 无法主动失效
2. **续期简单**：每次访问刷新过期时间
3. **安全可控**：服务端完全掌控状态

### JWT 的优势

1. **无状态**：不需要 Session 存储，多实例天然支持
2. **跨域友好**：不依赖 Cookie，放 Header 即可
3. **移动端友好**：APP 不方便用 Cookie

### JWT 的坑

#### 坑 1：注销难

JWT 签发后，在过期前一直有效。用户"退出登录"后，旧 Token 仍可用。

**解决**：
- 维护黑名单（存 Redis，记录注销的 Token）——但又变成有状态了
- 短过期 + Refresh Token：Access Token 15 分钟过期，Refresh Token 续期

#### 坑 2：续期难

Session 每次访问自动续期，JWT 不能改过期时间（改了签名就变）。

**解决**：每次请求返回新 Token（滑动过期）。

#### 坑 3：Payload 可读

JWT 的 Payload 是 Base64 编码（不是加密），任何人都能解码看到内容。

**注意**：不要在 JWT 里放敏感信息（密码、手机号）。

#### 坑 4：Token 泄露

Token 被截获后，在有效期内可冒充用户。

**解决**：
- 短过期时间
- HTTPS 传输
- 结合 IP/设备指纹校验

### 最佳实践：Access Token + Refresh Token

\`\`\`
登录 → 返回 access_token(15min) + refresh_token(7d)
请求 → 带 access_token
access_token 过期 → 用 refresh_token 换新的 access_token
refresh_token 过期 → 重新登录
\`\`\`

\`\`\`javascript
// Node.js 双 Token 方案
app.post('/login', (req, res) => {
  const user = verifyPassword(req.body);
  const accessToken = signJWT({ userId: user.id }, secret, '15m');
  const refreshToken = signJWT({ userId: user.id, type: 'refresh' }, refreshSecret, '7d');
  // refresh_token 存 Redis，可主动吊销
  redis.set(\`refresh:\${user.id}\`, refreshToken, 'EX', 604800);
  res.json({ accessToken, refreshToken });
});

app.post('/refresh', (req, res) => {
  const payload = verifyJWT(req.body.refreshToken, refreshSecret);
  const stored = redis.get(\`refresh:\${payload.userId}\`);
  if (stored !== req.body.refreshToken) throw new Error('Token 已失效');
  const newAccessToken = signJWT({ userId: payload.userId }, secret, '15m');
  res.json({ accessToken: newAccessToken });
});
\`\`\`

---

## 分布式 Session 问题

### 问题

多台服务器部署时，用户 A 的登录请求落到服务器 1（创建 Session 在服务器 1 的内存），下次请求可能落到服务器 2（内存里没有 A 的 Session），导致用户被"踢出"。

\`\`\`
请求1 → 服务器1（创建 Session）
请求2 → 服务器2（没有 Session！）→ 401 未登录
\`\`\`

### 解决方案

#### 1. Session 粘滞（Sticky Session）

负载均衡器把同一用户的请求路由到同一服务器（IP Hash / Cookie）。

**缺点**：服务器挂了 Session 丢失，负载不均。

#### 2. Session 复制

服务器间同步 Session（如 Tomcat 集群 Session 复制）。

**缺点**：同步开销大，不适合大规模集群。

#### 3. 集中存储（推荐）

Session 存到 Redis，所有服务器共享。

\`\`\`java
// Java Spring Session + Redis
@EnableRedisHttpSession
// 任何服务器都能从 Redis 读 Session
\`\`\`

#### 4. Token 方案

用 JWT，服务端不存状态，彻底解决分布式 Session 问题。

---

## 登录态管理实战

### 1. 登录流程

\`\`\`
1. 用户提交账号密码
2. 服务端验证 → 查数据库比对密码（用 bcrypt 等慢哈希）
3. 验证通过 → 创建 Session/JWT
4. 返回 Set-Cookie（Session ID）或 Token
5. 后续请求带凭证 → 服务端验证 → 返回数据
\`\`\`

\`\`\`javascript
// Node.js 登录实现
const crypto = require('crypto');

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.findUser(username);
  if (!user) return res.status(401).send('用户不存在');

  // 验证密码（bcrypt）
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).send('密码错误');

  // 创建 Session
  const sessionId = crypto.randomBytes(32).toString('hex');
  await redis.set(\`session:\${sessionId}\`, JSON.stringify({
    userId: user.id,
    username: user.username,
    loginAt: Date.now()
  }), 'EX', 86400);

  res.cookie('sid', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 86400000
  });
  res.json({ msg: '登录成功', user: { id: user.id, name: user.username } });
});
\`\`\`

\`\`\`java
// Java Spring Security 登录
@PostMapping("/login")
public ResponseEntity login(@RequestBody LoginDTO dto) {
    try {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );
        // Spring Security 自动创建 Session
        String sessionId = RequestContextHolder.currentRequestAttributes()
            .getSessionId();
        return ResponseEntity.ok(Map.of("sessionId", sessionId));
    } catch (BadCredentialsException e) {
        return ResponseEntity.status(401).body("账号或密码错误");
    }
}
\`\`\`

### 2. 登出流程

\`\`\`javascript
app.post('/logout', async (req, res) => {
  const sessionId = req.cookies.sid;
  if (sessionId) {
    await redis.del(\`session:\${sessionId}\`);  // 删除 Session
    res.clearCookie('sid');                      // 清除 Cookie
  }
  res.send('已登出');
});
\`\`\`

### 3. 自动登录（记住我）

\`\`\`
首次登录：
  登录 → 勾选"记住我" → Set-Cookie: sid=xxx; Max-Age=30天
  同时设 remember_token（加密的长期凭证）

后续访问（Session 过期）：
  带 remember_token → 服务端验证 → 重新创建 Session → 续期
\`\`\`

\`\`\`javascript
app.post('/login', async (req, res) => {
  // ... 验证密码 ...
  if (req.body.rememberMe) {
    // 生成记住我 Token（7天）
    const rememberToken = crypto.randomBytes(32).toString('hex');
    await db.saveRememberToken(user.id, rememberToken);
    res.cookie('remember', rememberToken, {
      httpOnly: true, maxAge: 7 * 86400000
    });
  }
});

// 中间件：Session 过期时自动登录
app.use(async (req, res, next) => {
  let session = await getSession(req.cookies.sid);
  if (!session && req.cookies.remember) {
    // 尝试用 remember_token 自动登录
    const userId = await db.getUserIdByRememberToken(req.cookies.remember);
    if (userId) {
      session = createSession(userId);  // 重新创建 Session
      res.cookie('sid', session.id, { httpOnly: true, maxAge: 86400000 });
    }
  }
  req.session = session;
  next();
});
\`\`\`

### 4. Session 过期与续期

\`\`\`javascript
// 滑动过期：每次访问刷新 TTL
app.use(async (req, res, next) => {
  if (req.cookies.sid) {
    const session = await redis.get(\`session:\${req.cookies.sid}\`);
    if (session) {
      // 续期：重新设置 24 小时
      redis.expire(\`session:\${req.cookies.sid}\`, 86400);
      req.session = JSON.parse(session);
    }
  }
  next();
});
\`\`\`

---

## 单点登录（SSO）

### SSO 原理

单点登录：用户在一个地方登录后，访问所有相关系统都不用再登录。

\`\`\`
用户 → 系统A（未登录）→ 跳转 SSO 认证中心
用户 → SSO 登录 → 返回 Ticket → 系统A 验证 Ticket → 登录成功
用户 → 系统B（未登录）→ 跳转 SSO → SSO 已登录 → 直接返回 Ticket → 系统B 登录成功
\`\`\`

### CAS（Central Authentication Service）流程

\`\`\`
1. 用户访问 app1.com → 未登录 → 302 跳转到 sso.com/login?service=app1.com
2. 用户在 sso.com 登录 → SSO 创建全局会话 → 生成 Ticket(ST)
3. 302 跳回 app1.com?ticket=ST123
4. app1.com 后端拿 ST 向 sso.com 验证 → 验证通过 → 创建 app1 的局部会话
5. 用户访问 app2.com → 未登录 → 302 跳转 sso.com/login?service=app2.com
6. sso.com 发现全局会话还在 → 直接生成 ST → 跳回 app2.com
7. app2.com 验证 ST → 创建局部会话 → 登录成功（无需再输密码）
\`\`\`

### OAuth 2.0 / OIDC

第三方登录（如"用微信登录"）基于 OAuth 2.0：

\`\`\`
1. 用户点"微信登录" → 跳转微信授权页
2. 用户授权 → 微信返回 Authorization Code
3. 后端用 Code 换 Access Token
4. 用 Token 调微信 API 获取用户信息
5. 创建本系统 Session/JWT
\`\`\`

\`\`\`javascript
// Node.js OAuth 2.0 授权码流程
app.get('/auth/wechat/callback', async (req, res) => {
  const { code } = req.query;
  // 用 code 换 token
  const tokenRes = await fetch('https://api.weixin.qq.com/sns/oauth2/access_token', {
    params: { code, appid, secret, grant_type: 'authorization_code' }
  });
  const { access_token, openid } = await tokenRes.json();
  // 用 token 获取用户信息
  const userRes = await fetch('https://api.weixin.qq.com/sns/userinfo', {
    params: { access_token, openid }
  });
  const wxUser = await userRes.json();
  // 创建本系统登录态
  const session = createSession({ wxOpenid: openid, nickname: wxUser.nickname });
  res.cookie('sid', session.id, { httpOnly: true });
  res.redirect('/');
});
\`\`\`

---

## 多语言 Session 实现对照

### Node.js（Express + express-session + Redis）

\`\`\`javascript
const session = require('express-session');
const RedisStore = require('connect-redis');

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'my-secret',
  name: 'sid',
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 86400000
  },
  resave: false,
  saveUninitialized: false
}));

app.get('/profile', (req, res) => {
  if (!req.session.userId) return res.status(401).send('未登录');
  res.json({ userId: req.session.userId });
});
\`\`\`

### Java（Spring Session + Redis）

\`\`\`java
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 86400)
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

@RestController
public class UserController {
    @GetMapping("/profile")
    public ResponseEntity profile(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).body("未登录");
        return ResponseEntity.ok(Map.of("userId", userId));
    }
}
\`\`\`

### Go（Gin + Redis Session）

\`\`\`go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        sid, err := c.Cookie("sid")
        if err != nil {
            c.AbortWithStatusJSON(401, gin.H{"error": "未登录"})
            return
        }
        data, err := redis.Get("session:" + sid).Result()
        if err != nil {
            c.AbortWithStatusJSON(401, gin.H{"error": "Session 过期"})
            return
        }
        var session Session
        json.Unmarshal([]byte(data), &session)
        c.Set("user", session)
        c.Next()
    }
}
\`\`\`

### Python（Flask + Flask-Session）

\`\`\`python
from flask import Flask, session
from flask_session import Session

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400
Session(app)

@app.route('/profile')
def profile():
    user_id = session.get('user_id')
    if not user_id:
        return {'error': '未登录'}, 401
    return {'userId': user_id}
\`\`\`

---

## 常见坑

### 坑 1：Cookie 跨域

前端 \`localhost:3000\` 访问后端 \`localhost:8080\`，Cookie 带不上。

**解决**：
- 后端设 \`Access-Control-Allow-Credentials: true\`
- \`Access-Control-Allow-Origin\` 不能是 \`*\`，必须是具体域名
- 前端 fetch 设 \`credentials: 'include'\`
- Cookie 的 SameSite=None; Secure

\`\`\`javascript
// 后端
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 前端
fetch('/api/profile', { credentials: 'include' });
\`\`\`

### 坑 2：Session 不共享

多实例部署，Session 存内存导致跨实例丢失。

**解决**：用 Redis 集中存储。

### 坑 3：密码明文存储

数据库里存明文密码，泄露后全完。

**解决**：用 bcrypt/scrypt/argon2 慢哈希加盐。

\`\`\`javascript
// 注册时哈希
const hash = await bcrypt.hash(password, 10);  // 10 是 cost factor
// 登录时验证
const valid = await bcrypt.compare(password, hash);
\`\`\`

### 坑 4：Session 固定攻击

攻击者让用户用攻击者已知的 Session ID 登录，然后冒充用户。

**解决**：登录成功后**重新生成 Session ID**（不要复用旧的）。

\`\`\`javascript
app.post('/login', (req, res) => {
  // 验证密码...
  req.session.regenerate(() => {  // 重新生成 Session ID
    req.session.userId = user.id;
    res.send('登录成功');
  });
});
\`\`\`

### 坑 5：XSS 窃取 Cookie

没设 HttpOnly，XSS 攻击通过 \`document.cookie\` 窃取 Session ID。

**解决**：所有敏感 Cookie 设 HttpOnly。

### 坑 6：JWT 存 localStorage 被 XSS 窃取

JWT 存 localStorage，XSS 能读取。

**解决**：JWT 存 HttpOnly Cookie（但又有 CSRF 风险），或用短期 Token + Refresh Token。

---

## 实战要点总结

1. **Cookie 安全三件套**：HttpOnly + Secure + SameSite=Lax
2. **Session 存储**：生产环境用 Redis，不要用内存
3. **Session ID**：用 crypto 安全随机生成（至少 128 位）
4. **密码存储**：bcrypt/scrypt 加盐慢哈希，绝不存明文
5. **登录后重新生成 Session ID**：防 Session 固定攻击
6. **Session 续期**：滑动过期（每次访问刷新 TTL）
7. **JWT 适用**：API/移动端/SSO，Web 应用优先用 Session
8. **JWT 安全**：短过期 + Refresh Token，payload 不放敏感信息
9. **跨域**：CORS 配 credentials，Cookie 设 SameSite=None; Secure
10. **CSRF 防护**：SameSite=Lax + CSRF Token

---

## 章节小结

Cookie 和 Session 是 Web 登录态管理的基石。Cookie 存在浏览器端，通过 Set-Cookie 设置，每次请求自动携带；Session 存在服务端，通过 Cookie 传递 Session ID。理解 Cookie 的安全属性（HttpOnly/Secure/SameSite）、Session 的存储方案（Redis 推荐）、Session 与 JWT 的取舍、分布式 Session 的解决方案，是构建安全登录系统的关键。

在实际工程中，Web 应用优先用 Session（安全可控、注销容易），API/移动端用 JWT（无状态、跨域友好）。两者各有优劣，选择取决于场景。`,
    code: `// ===================================================
// Cookie/Session 机制模拟（沙箱环境）
// 实现：Cookie 解析/Session 存储/登录流程/分布式 Session
// ===================================================
const crypto = require('crypto');

// ---------- Cookie 解析器 ----------
class CookieParser {
  static parse(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    for (const pair of cookieHeader.split(';')) {
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      cookies[name] = value;
    }
    return cookies;
  }
  static serialize(name, value, attrs = {}) {
    const parts = [\`\${name}=\${value}\`];
    if (attrs.maxAge) parts.push(\`Max-Age=\${attrs.maxAge}\`);
    if (attrs.path) parts.push(\`Path=\${attrs.path}\`);
    if (attrs.domain) parts.push(\`Domain=\${attrs.domain}\`);
    if (attrs.httpOnly) parts.push('HttpOnly');
    if (attrs.secure) parts.push('Secure');
    if (attrs.sameSite) parts.push(\`SameSite=\${attrs.sameSite}\`);
    return parts.join('; ');
  }
}

// ---------- Session 存储 ----------
class SessionStore {
  constructor(ttl = 30000) {
    this.sessions = new Map();  // sessionId -> data
    this.ttl = ttl;             // 默认 30 秒过期（演示用）
    this.cleanupInterval = setInterval(() => this._cleanup(), 10000);
  }
  _generateId() {
    return crypto.randomBytes(16).toString('hex');
  }
  create(data) {
    const sid = this._generateId();
    this.sessions.set(sid, {
      data: { ...data, createdAt: Date.now() },
      expireAt: Date.now() + this.ttl
    });
    return sid;
  }
  get(sid) {
    const session = this.sessions.get(sid);
    if (!session) return null;
    if (Date.now() > session.expireAt) {
      this.sessions.delete(sid);
      return null;
    }
    // 滑动续期
    session.expireAt = Date.now() + this.ttl;
    return session.data;
  }
  destroy(sid) { return this.sessions.delete(sid); }
  // 重新生成 Session ID（防 Session 固定攻击）
  regenerate(sid) {
    const session = this.sessions.get(sid);
    if (!session) return null;
    this.sessions.delete(sid);
    return this.create(session.data);
  }
  _cleanup() {
    const now = Date.now();
    for (const [sid, session] of this.sessions) {
      if (now > session.expireAt) this.sessions.delete(sid);
    }
  }
  size() { return this.sessions.size; }
}

// ---------- 分布式 Session（一致性哈希路由） ----------
class DistributedSessionStore {
  constructor(nodes = ['node-1', 'node-2', 'node-3']) {
    this.nodes = new Map();
    nodes.forEach(n => this.nodes.set(n, new SessionStore()));
    this.ring = [];
    this.virtualNodes = 50;
    this._buildRing();
  }
  _hash(key) {
    return parseInt(crypto.createHash('md5').update(key).digest('hex').slice(0, 8), 16);
  }
  _buildRing() {
    this.ring = [];
    for (const node of this.nodes.keys()) {
      for (let i = 0; i < this.virtualNodes; i++) {
        this.ring.push({ hash: this._hash(node + '#' + i), node });
      }
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }
  _getNode(sid) {
    const h = this._hash(sid);
    for (const entry of this.ring) {
      if (entry.hash >= h) return entry.node;
    }
    return this.ring[0].node;
  }
  create(data) {
    const sid = crypto.randomBytes(16).toString('hex');
    const node = this._getNode(sid);
    this.nodes.get(node).create(data);
    console.log(\`    [分布式] Session \${sid.slice(0,8)}... 路由到 \${node}\`);
    return sid;
  }
  get(sid) {
    const node = this._getNode(sid);
    return this.nodes.get(node).get(sid);
  }
}

// ---------- 模拟后端应用 ----------
class App {
  constructor() {
    this.sessionStore = new SessionStore();
    this.users = new Map([
      ['alice', { id: 1, username: 'alice', password: '123456' }],
      ['bob', { id: 2, username: 'bob', password: 'password' }]
    ]);
    this.responseCookies = [];
  }
  _setCookie(name, value, attrs) {
    this.responseCookies.push(CookieParser.serialize(name, value, attrs));
  }
  // 登录
  login(body) {
    this.responseCookies = [];
    const user = this.users.get(body.username);
    if (!user || user.password !== body.password) {
      return { status: 401, body: { error: '账号或密码错误' } };
    }
    // 重新生成 Session ID（防 Session 固定攻击）
    const sid = this.sessionStore.create({
      userId: user.id, username: user.username
    });
    this._setCookie('sid', sid, {
      httpOnly: true, secure: true, sameSite: 'Lax',
      maxAge: 30, path: '/'
    });
    return {
      status: 200,
      setCookie: this.responseCookies,
      body: { msg: '登录成功', user: { id: user.id, name: user.username } }
    };
  }
  // 鉴权中间件
  authenticate(cookieHeader) {
    const cookies = CookieParser.parse(cookieHeader);
    const sid = cookies.sid;
    if (!sid) return null;
    const session = this.sessionStore.get(sid);
    return session;
  }
  // 获取个人信息
  profile(cookieHeader) {
    const session = this.authenticate(cookieHeader);
    if (!session) return { status: 401, body: { error: '未登录' } };
    return { status: 200, body: { userId: session.userId, username: session.username } };
  }
  // 登出
  logout(cookieHeader) {
    this.responseCookies = [];
    const cookies = CookieParser.parse(cookieHeader);
    if (cookies.sid) {
      this.sessionStore.destroy(cookies.sid);
      this._setCookie('sid', '', { maxAge: 0, path: '/' });
    }
    return { status: 200, setCookie: this.responseCookies, body: { msg: '已登出' } };
  }
}

// ---------- 模拟客户端 ----------
class HttpClient {
  constructor() { this.cookies = {}; }
  _cookieHeader() {
    return Object.entries(this.cookies).map(([k, v]) => \`\${k}=\${v}\`).join('; ');
  }
  _saveCookies(setCookie) {
    if (!setCookie) return;
    for (const sc of setCookie) {
      const pair = sc.split(';')[0];
      const [name, value] = pair.split('=');
      if (value === '' || value === undefined) delete this.cookies[name.trim()];
      else this.cookies[name.trim()] = value;
    }
  }
  request(app, method, path, body = null) {
    let res;
    const cookieHeader = this._cookieHeader();
    if (method === 'POST' && path === '/login') {
      res = app.login(body);
    } else if (method === 'GET' && path === '/profile') {
      res = app.profile(cookieHeader);
    } else if (method === 'POST' && path === '/logout') {
      res = app.logout(cookieHeader);
    }
    this._saveCookies(res.setCookie);
    return res;
  }
}

// ---------- 演示场景 ----------
console.log('===== 1. Cookie 解析 =====');
const parsed = CookieParser.parse('sid=abc123; lang=zh-CN; theme=dark');
console.log(\`  解析结果: \${JSON.stringify(parsed)}\`);
console.log(\`  序列化: \${CookieParser.serialize('token', 'xyz', { httpOnly: true, secure: true, sameSite: 'Lax' })}\`);

console.log('\\n===== 2. 登录流程 =====');
const app = new App();
const client = new HttpClient();

console.log('  未登录访问 /profile:');
let res = client.request(app, 'GET', '/profile');
console.log(\`    状态: \${res.status}, \${JSON.stringify(res.body)}\`);

console.log('  登录(alice/123456):');
res = client.request(app, 'POST', '/login', { username: 'alice', password: '123456' });
console.log(\`    状态: \${res.status}, \${JSON.stringify(res.body)}\`);
console.log(\`    Set-Cookie: \${res.setCookie}\`);

console.log('  登录后访问 /profile:');
res = client.request(app, 'GET', '/profile');
console.log(\`    状态: \${res.status}, \${JSON.stringify(res.body)}\`);

console.log('\\n===== 3. 密码错误 =====');
const badClient = new HttpClient();
res = badClient.request(app, 'POST', '/login', { username: 'alice', password: 'wrong' });
console.log(\`    状态: \${res.status}, \${JSON.stringify(res.body)}\`);

console.log('\\n===== 4. 登出 =====');
console.log('  登出:');
res = client.request(app, 'POST', '/logout');
console.log(\`    状态: \${res.status}, \${JSON.stringify(res.body)}\`);
console.log('  登出后访问 /profile:');
res = client.request(app, 'GET', '/profile');
console.log(\`    状态: \${res.status}, \${JSON.stringify(res.body)}\`);

console.log('\\n===== 5. Session 过期与续期 =====');
const expApp = new App();
const expClient = new HttpClient();
expClient.request(expApp, 'POST', '/login', { username: 'bob', password: 'password' });
console.log(\`  登录后 Session 数量: \${expApp.sessionStore.size()}\`);
console.log('  等待 Session 过期(35s)...');
setTimeout(() => {
  res = expClient.request(expApp, 'GET', '/profile');
  console.log(\`    过期后访问: 状态=\${res.status}, \${JSON.stringify(res.body)}\`);

  console.log('\\n===== 6. 分布式 Session（一致性哈希路由） =====');
  const distStore = new DistributedSessionStore(['node-A', 'node-B', 'node-C']);
  console.log('  创建 5 个 Session，观察路由分布:');
  const sids = [];
  for (let i = 0; i < 5; i++) {
    const sid = distStore.create({ userId: i + 1 });
    sids.push(sid);
  }
  console.log('  验证 Session 可跨节点读取:');
  sids.forEach((sid, i) => {
    const data = distStore.get(sid);
    console.log(\`    Session\${i+1} → userId=\${data ? data.userId : 'null'}\`);
  });

  console.log('\\n===== 运行结束 =====');
  clearInterval(expApp.sessionStore.cleanupInterval);
}, 35000);
`,
  },
];
