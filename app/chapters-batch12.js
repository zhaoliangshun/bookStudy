// =============================================================
// Node.js 交互式教程 —— 第十二批章节（实用场景组，共 8 章）
// =============================================================

export const chapters = [
  // ==========================================================
  // 第 1 章：WebSocket 实时通信
  // ==========================================================
  {
    id: "node-websocket",
    group: "实用场景",
    icon: "🔌",
    title: "WebSocket 实时通信",
    content: `# WebSocket 实时通信

## 什么是 WebSocket

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。与 HTTP 的"请求-响应"模式不同，WebSocket 允许服务器主动向客户端推送数据，实现真正的实时通信。

## WebSocket 协议 vs HTTP

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信模式 | 请求-响应（半双工） | 全双工 |
| 连接方式 | 短连接（每次请求） | 长连接（持久化） |
| 头部开销 | 每次请求携带完整头部 | 帧头部仅 2-14 字节 |
| 服务端推送 | 不支持（需轮询） | 原生支持 |
| 协议标识 | http:// 或 https:// | ws:// 或 wss:// |

## 握手升级过程

WebSocket 连接始于 HTTP 升级请求：

1. 客户端发送带有 \`Upgrade: websocket\` 头的 HTTP 请求
2. 服务器返回 \`101 Switching Protocols\` 状态码
3. 通过 \`Sec-WebSocket-Key\` 和 \`Sec-WebSocket-Accept\` 验证握手

## 全双工通信

全双工意味着客户端和服务器可以同时发送和接收数据，就像打电话一样——双方可以同时说话。这区别于 HTTP 的半双工模式，后者像对讲机，一方说完另一方才能回应。

## 心跳机制（Ping/Pong）

WebSocket 协议内置了 ping/pong 帧用于保活检测：
- 客户端或服务器发送 ping 帧
- 对端必须回复 pong 帧
- 如果一段时间内未收到 pong，则认为连接已断开

## 消息广播

广播是 WebSocket 的核心功能之一——将一条消息发送给多个连接的客户端。常见模式包括：
- 全员广播：发送给所有连接的客户端
- 房间广播：只发送给特定房间/频道的客户端
- 排除广播：发送给除发送者外的所有客户端

## 房间/频道概念

房间（Room）是对连接进行逻辑分组的方式。客户端可以加入一个或多个房间，消息可以定向发送到特定房间。这在聊天应用、游戏房间、协作文档等场景中非常实用。

## 重连机制

网络不稳定时，WebSocket 连接可能断开。健壮的重连机制包括：
- 指数退避重连：1s → 2s → 4s → 8s → ...（最大 30s）
- 重连次数限制
- 连接状态事件通知

\`\`\`javascript
// 简单的重连策略示例
function connect() {
  const ws = new WebSocket('ws://localhost:3000');
  ws.onclose = () => {
    setTimeout(connect, Math.min(1000 * Math.pow(2, retries), 30000));
  };
}
\`\`\`

## WebSocket 帧结构

WebSocket 数据以帧的形式传输，每个帧包含以下部分：
- FIN（1 bit）：是否为最后一帧
- Opcode（4 bits）：帧类型（文本=1，二进制=2，关闭=8，ping=9，pong=10）
- Mask（1 bit）：掩码标志（客户端到服务器的帧必须掩码）
- Payload length（7/7+16/7+64 bits）：数据长度
- Masking key（0/4 bytes）：掩码密钥
- Payload data：实际数据

## 安全考虑

WebSocket 应用中需要注意的安全问题：
- **WSS 加密**：生产环境使用 wss://（WebSocket over TLS）
- **Origin 验证**：服务器应验证请求的 Origin 头，防止跨站 WebSocket 劫持
- **认证鉴权**：在握手阶段通过 token 或 cookie 进行认证
- **消息验证**：验证消息格式，防止注入攻击
- **速率限制**：限制单个连接的发送频率，防止滥用

## 实现模式

常见的 WebSocket 实现模式：
- **发布/订阅模式**：客户端订阅特定主题，服务器向订阅者广播
- **请求/响应模式**：通过消息 ID 关联请求和响应
- **流式模式**：服务器持续推送数据流（如日志流、实时数据）

## 适用场景

- 即时通讯（聊天应用）
- 实时协作（在线文档编辑）
- 实时数据推送（股票行情、体育比分）
- 在线游戏
- 物联网设备监控

## WebSocket 库选择

Node.js 中常用的 WebSocket 库：
- **ws**：最流行的 WebSocket 实现，轻量高性能
- **socket.io**：功能丰富的实时通信框架，支持自动重连、房间、命名空间
- **uWebSockets.js**：极致性能，C++ 实现
- **SockJS**：提供 WebSocket 模拟的备选传输方案

选择建议：简单场景用 ws，复杂实时应用用 socket.io，极致性能要求用 uWebSockets.js。
`,
    code: `// ============================================================
// WebSocket 实时通信模拟（基于 EventEmitter）
// 使用 events 模块模拟 WebSocket 连接、消息广播和心跳检测
// ============================================================

const { EventEmitter } = require('events');

// -----------------------------------------------------------
// 模拟 WebSocket 连接
// -----------------------------------------------------------
class MockWebSocket extends EventEmitter {
  constructor(id) {
    super();
    // 连接唯一标识
    this.id = id;
    // 连接状态：CONNECTING, OPEN, CLOSING, CLOSED
    this.readyState = 'CONNECTING';
    // 加入的房间列表
    this.rooms = new Set();
    // 心跳计时器
    this._heartbeatTimer = null;
    // 心跳超时计时器
    this._heartbeatTimeout = null;
  }

  // 模拟连接建立
  open() {
    // 模拟握手延迟
    setTimeout(() => {
      this.readyState = 'OPEN';
      this.emit('open', { id: this.id });
      // 启动心跳检测
      this._startHeartbeat();
      console.log(\`[连接] 客户端 \${this.id} 已连接（状态: \${this.readyState}）\`);
    }, 100);
  }

  // 模拟关闭连接
  close(code = 1000, reason = '正常关闭') {
    if (this.readyState === 'CLOSED') return;
    this.readyState = 'CLOSING';
    this._clearHeartbeat();
    setTimeout(() => {
      this.readyState = 'CLOSED';
      this.emit('close', { code, reason, id: this.id });
      console.log(\`[连接] 客户端 \${this.id} 已断开（\${code}: \${reason}）\`);
    }, 50);
  }

  // 模拟发送消息
  send(data) {
    if (this.readyState !== 'OPEN') {
      console.log(\`[错误] 客户端 \${this.id} 连接未就绪，无法发送\`);
      return;
    }
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.emit('message', { from: this.id, data: message, timestamp: Date.now() });
  }

  // 加入房间
  join(room) {
    this.rooms.add(room);
    console.log(\`[房间] 客户端 \${this.id} 加入房间 "\${room}"\`);
    return this;
  }

  // 离开房间
  leave(room) {
    this.rooms.delete(room);
    console.log(\`[房间] 客户端 \${this.id} 离开房间 "\${room}"\`);
    return this;
  }

  // 启动心跳检测
  _startHeartbeat() {
    // 每 5 秒发送一次 ping
    this._heartbeatTimer = setInterval(() => {
      if (this.readyState === 'OPEN') {
        this.emit('ping', { id: this.id });
        // 设置 pong 超时（3 秒内未收到 pong 则认为超时）
        this._heartbeatTimeout = setTimeout(() => {
          console.log(\`[心跳] 客户端 \${this.id} 心跳超时，强制断开\`);
          this.close(1006, '心跳超时');
        }, 3000);
      }
    }, 5000);
  }

  // 收到 pong 响应，重置超时
  pong() {
    if (this._heartbeatTimeout) {
      clearTimeout(this._heartbeatTimeout);
      this._heartbeatTimeout = null;
    }
  }

  // 清理心跳定时器
  _clearHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    if (this._heartbeatTimeout) {
      clearTimeout(this._heartbeatTimeout);
      this._heartbeatTimeout = null;
    }
  }
}

// -----------------------------------------------------------
// WebSocket 服务器（管理所有连接和广播）
// -----------------------------------------------------------
class WebSocketServer extends EventEmitter {
  constructor() {
    super();
    // 存储所有连接的客户端
    this.clients = new Map();
    // 连接计数器（用于生成 ID）
    this._counter = 0;
  }

  // 建立新连接
  connect() {
    const id = \`client-\${++this._counter}\`;
    const ws = new MockWebSocket(id);

    // 监听客户端消息
    ws.on('message', (msg) => {
      console.log(\`[消息] 收到来自 \${msg.from} 的消息: \${msg.data}\`);
      this.emit('message', { socket: ws, ...msg });
    });

    // 监听心跳 ping
    ws.on('ping', ({ id }) => {
      // 模拟收到 ping 后回复 pong
      setTimeout(() => {
        ws.pong();
      }, 100);
    });

    // 监听连接关闭
    ws.on('close', ({ id }) => {
      this.clients.delete(id);
      console.log(\`[服务器] 当前连接数: \${this.clients.size}\`);
    });

    this.clients.set(id, ws);
    ws.open();
    return ws;
  }

  // 全员广播（发送给所有已连接的客户端）
  broadcast(data, excludeId = null) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    let count = 0;
    this.clients.forEach((client) => {
      if (client.readyState === 'OPEN' && client.id !== excludeId) {
        client.emit('broadcast', { data: message, from: 'server' });
        count++;
      }
    });
    console.log(\`[广播] 消息已发送给 \${count} 个客户端\`);
    return count;
  }

  // 房间广播（发送给特定房间的所有客户端）
  broadcastToRoom(room, data, excludeId = null) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    let count = 0;
    this.clients.forEach((client) => {
      if (
        client.readyState === 'OPEN' &&
        client.rooms.has(room) &&
        client.id !== excludeId
      ) {
        client.emit('broadcast', { data: message, room, from: 'server' });
        count++;
      }
    });
    console.log(\`[广播] 房间 "\${room}" 消息已发送给 \${count} 个客户端\`);
    return count;
  }

  // 获取连接统计
  getStats() {
    const stats = { total: this.clients.size, open: 0, rooms: {} };
    this.clients.forEach((client) => {
      if (client.readyState === 'OPEN') stats.open++;
      client.rooms.forEach((room) => {
        stats.rooms[room] = (stats.rooms[room] || 0) + 1;
      });
    });
    return stats;
  }
}

// ============================================================
// 演示运行
// ============================================================
console.log('========== WebSocket 实时通信模拟 ==========\\n');

const server = new WebSocketServer();

// 创建 3 个客户端连接
const client1 = server.connect();
const client2 = server.connect();
const client3 = server.connect();

// 等待连接建立后执行操作
setTimeout(() => {
  // 客户端加入房间
  client1.join('chat-room');
  client2.join('chat-room');
  client3.join('game-room');

  console.log('\\n--- 房间广播测试 ---');
  server.broadcastToRoom('chat-room', '欢迎加入聊天室！');

  console.log('\\n--- 全员广播测试 ---');
  server.broadcast('系统通知：服务器将在 5 分钟后维护');

  console.log('\\n--- 排除广播测试 ---');
  server.broadcast('大家好！', client1.id);

  console.log('\\n--- 连接统计 ---');
  console.log('统计信息:', JSON.stringify(server.getStats(), null, 2));

  // 模拟客户端断开
  setTimeout(() => {
    client2.close(1000, '用户主动离开');
    console.log('\\n断开后统计:', JSON.stringify(server.getStats(), null, 2));
  }, 500);
}, 200);

// 保持进程运行以观察心跳
setTimeout(() => {
  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}, 2000);
`,
  },

  // ==========================================================
  // 第 2 章：SSE 服务端推送
  // ==========================================================
  {
    id: "node-sse",
    group: "实用场景",
    icon: "📡",
    title: "SSE 服务端推送",
    content: `# SSE 服务端推送（Server-Sent Events）

## 什么是 SSE

Server-Sent Events（SSE）是一种允许服务器通过 HTTP 连接向客户端推送实时更新的技术。与 WebSocket 不同，SSE 是单向的——数据只能从服务器流向客户端。

## SSE 协议格式

SSE 使用简单的文本格式，每个事件由多个字段组成，以空行分隔：

\`\`\`text
event: update
id: 42
data: {"message": "hello"}
data: {"status": "ok"}

\`\`\`

关键字段说明：
- \`event\`：事件类型（可选，默认为 \`message\`）
- \`id\`：事件 ID，用于断线重连
- \`data\`：事件数据（必需，可多行）
- \`retry\`：重连间隔（毫秒）

## EventSource API

客户端通过浏览器内置的 \`EventSource\` 对象连接 SSE：

\`\`\`javascript
const es = new EventSource('/events');
es.onmessage = (e) => console.log(e.data);
es.addEventListener('custom-event', (e) => {
  console.log('Custom:', e.data);
});
\`\`\`

## 单向推送的特点

SSE 是纯单向的——客户端只能接收数据，不能通过同一连接发送数据。如果需要客户端发送数据，需要额外的 HTTP 请求。这简化了实现，也降低了服务器复杂度。

## 自动重连机制

SSE 内置了自动重连机制：
- 当连接断开时，浏览器会自动尝试重连
- 通过 \`Last-Event-ID\` 请求头告知服务器上次收到的事件 ID
- 服务器可以根据此 ID 发送丢失的事件，实现断点续传

## 自定义事件类型

除了默认的 \`message\` 事件，SSE 支持自定义事件类型，让客户端可以区分不同种类的通知：

\`\`\`text
event: notification
data: {"type": "info", "text": "新消息"}

event: heartbeat
data: ping

\`\`\`

## SSE vs WebSocket

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向（服务器→客户端） | 双向（全双工） |
| 协议 | HTTP（标准） | 独立协议 ws/wss |
| 浏览器支持 | 原生 EventSource | 需要自定义实现 |
| 自动重连 | 内置支持 | 需要手动实现 |
| 二进制数据 | 仅文本 | 支持二进制 |
| 实现复杂度 | 低 | 中等 |
| 防火墙友好 | 是（标准 HTTP） | 可能被拦截 |

## 适用场景

- **消息推送**：新消息通知、系统通知
- **状态更新**：实时状态变更、在线状态
- **进度通知**：文件上传进度、任务执行进度
- **实时数据流**：股票价格、天气更新
- **日志推送**：实时日志流、监控数据

## SSE HTTP 响应头

SSE 连接通过标准的 HTTP 响应建立，需要设置以下关键响应头：

\`\`\`http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
\`\`\`

\`Content-Type: text/event-stream\` 告诉浏览器这是一个 SSE 流，\`Cache-Control: no-cache\` 防止代理服务器缓存事件流。

## 多行数据与注释

SSE 支持多行数据和多事件合并：

\`\`\`text
: 这是一条注释，客户端会忽略以冒号开头的行
data: {"line1": "hello"}
data: {"line2": "world"}

\`\`\`

多行 data 会被客户端合并为一个完整的 JSON 对象。注释行可用于发送心跳保活信号。

## 服务端实现要点

在 Node.js 中实现 SSE 推送的关键步骤：
1. 设置正确的响应头
2. 保持连接不关闭（长连接）
3. 定期发送数据（或事件驱动）
4. 监听客户端断开事件，清理资源
5. 使用 \`res.write()\` 而非 \`res.send()\`

## 不适合的场景

- 需要客户端频繁发送数据的场景（聊天应用）
- 需要二进制数据传输的场景（视频流）
- 需要极低延迟的双向通信场景（在线游戏）
`,
    code: `// ============================================================
// SSE 服务端推送模拟
// 使用 events 和 stream 模块模拟 SSE 事件推送
// ============================================================

const { EventEmitter } = require('events');
const { Readable } = require('stream');

// -----------------------------------------------------------
// SSE 事件格式化工具
// -----------------------------------------------------------
class SSEFormatter {
  /**
   * 格式化单个 SSE 事件
   * @param {string} event - 事件类型
   * @param {string|object} data - 事件数据
   * @param {string} id - 事件 ID
   * @param {number} retry - 重连间隔（毫秒）
   * @returns {string} 格式化后的 SSE 消息
   */
  static formatEvent({ event = 'message', data, id, retry } = {}) {
    const lines = [];

    // 事件 ID（用于断线重连时的 Last-Event-ID）
    if (id !== undefined && id !== null) {
      lines.push(\`id: \${id}\`);
    }

    // 事件类型
    if (event) {
      lines.push(\`event: \${event}\`);
    }

    // 重连间隔设置
    if (retry !== undefined) {
      lines.push(\`retry: \${retry}\`);
    }

    // 数据行（支持多行和对象；data 缺省时跳过）
    if (data !== undefined && data !== null) {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      const dataLines = String(dataStr).split('\\n');
      dataLines.forEach((line) => {
        lines.push(\`data: \${line}\`);
      });
    }

    // 以空行结束表示事件结束
    lines.push('');
    return lines.join('\\n');
  }
}

// -----------------------------------------------------------
// SSE 服务端模拟
// -----------------------------------------------------------
class SSEServer extends EventEmitter {
  constructor() {
    super();
    // 事件 ID 计数器
    this._eventId = 0;
    // 客户端列表
    this._clients = new Map();
    // 客户端计数器
    this._clientCounter = 0;
  }

  // 创建新的 SSE 客户端连接
  createClient() {
    const clientId = \`sse-client-\${++this._clientCounter}\`;
    const client = new SSEClient(clientId, this);
    this._clients.set(clientId, client);
    return client;
  }

  // 发送事件到指定客户端
  sendToClient(clientId, event, data) {
    const client = this._clients.get(clientId);
    if (client) {
      const id = ++this._eventId;
      const formatted = SSEFormatter.formatEvent({ event, data, id });
      client.receive(formatted);
      return id;
    }
    return null;
  }

  // 广播事件到所有客户端
  broadcast(event, data) {
    this._clients.forEach((client) => {
      if (client.connected) {
        const id = ++this._eventId;
        const formatted = SSEFormatter.formatEvent({ event, data, id });
        client.receive(formatted);
      }
    });
  }

  // 发送重连间隔设置
  setRetry(retryMs) {
    this._clients.forEach((client) => {
      if (client.connected) {
        const formatted = SSEFormatter.formatEvent({ retry: retryMs });
        client.receive(formatted);
      }
    });
  }
}

// -----------------------------------------------------------
// SSE 客户端模拟
// -----------------------------------------------------------
class SSEClient extends EventEmitter {
  constructor(id, server) {
    super();
    this.id = id;
    this.server = server;
    this.connected = false;
    // 记录最后收到的事件 ID（用于重连）
    this.lastEventId = null;
    // 重连计时器
    this._reconnectTimer = null;
    // 重连次数
    this._reconnectCount = 0;
    // 最大重连次数
    this._maxReconnects = 5;
  }

  // 建立连接
  connect() {
    this.connected = true;
    this._reconnectCount = 0;
    console.log(\`[SSE] 客户端 \${this.id} 已连接\`);
    this.emit('connected', { clientId: this.id });

    // 发送初始重连间隔
    const formatted = SSEFormatter.formatEvent({ retry: 3000 });
    this.receive(formatted);

    return this;
  }

  // 接收事件
  receive(rawEvent) {
    if (!this.connected) return;

    // 解析 SSE 事件文本
    const parsed = this._parseSSEEvent(rawEvent);
    if (parsed.id) {
      this.lastEventId = parsed.id;
    }

    console.log(\`[SSE] 客户端 \${this.id} 收到事件 [\${parsed.event}#\${parsed.id}]: \${parsed.data}\`);
    this.emit(parsed.event, { clientId: this.id, ...parsed });
    this.emit('message', { clientId: this.id, ...parsed });
  }

  // 断开连接
  disconnect() {
    this.connected = false;
    console.log(\`[SSE] 客户端 \${this.id} 已断开\`);
    this.emit('disconnected', { clientId: this.id });
  }

  // 模拟断线重连
  simulateReconnect() {
    this.connected = false;
    this._reconnectCount++;

    if (this._reconnectCount > this._maxReconnects) {
      console.log(\`[SSE] 客户端 \${this.id} 重连次数已达上限，放弃重连\`);
      this.emit('reconnect_failed', { clientId: this.id });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this._reconnectCount - 1), 30000);
    console.log(
      \`[SSE] 客户端 \${this.id} 将在 \${delay}ms 后重连（第 \${this._reconnectCount} 次）\`
    );

    this._reconnectTimer = setTimeout(() => {
      this.connected = true;
      console.log(
        \`[SSE] 客户端 \${this.id} 重连成功，Last-Event-ID: \${this.lastEventId || '无'}\`
      );
      this.emit('reconnected', {
        clientId: this.id,
        lastEventId: this.lastEventId,
        attempt: this._reconnectCount,
      });
    }, delay);
  }

  // 解析 SSE 事件文本
  _parseSSEEvent(raw) {
    const result = { event: 'message', data: '', id: null, retry: null };
    const lines = raw.split('\\n');

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        result.event = line.slice(7).trim();
      } else if (line.startsWith('id: ')) {
        result.id = line.slice(4).trim();
      } else if (line.startsWith('retry: ')) {
        result.retry = parseInt(line.slice(7).trim(), 10);
      } else if (line.startsWith('data: ')) {
        result.data = line.slice(6).trim();
      }
    }

    return result;
  }
}

// -----------------------------------------------------------
// SSE 可读流（用于模拟 HTTP 响应流）
// -----------------------------------------------------------
class SSEStream extends Readable {
  constructor(server, options = {}) {
    super({ objectMode: true });
    this.server = server;
    this._timer = null;
  }

  _read() {
    // 流由 SSE 服务器事件驱动，不需要手动 push
  }

  start() {
    console.log('[SSE 流] 开始推送数据...');
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this.push(null); // 结束流
    console.log('[SSE 流] 推送已停止');
  }
}

// ============================================================
// 演示运行
// ============================================================
console.log('========== SSE 服务端推送模拟 ==========\\n');

const sseServer = new SSEServer();

// 创建两个客户端
const clientA = sseServer.createClient();
const clientB = sseServer.createClient();

// 监听客户端事件
clientA.on('message', (msg) => {
  // 默认消息事件
});
clientA.on('notification', (msg) => {
  console.log(\`  -> [客户端A] 收到通知: \${msg.data}\`);
});
clientA.on('progress', (msg) => {
  console.log(\`  -> [客户端A] 进度更新: \${msg.data}\`);
});
clientA.on('heartbeat', (msg) => {
  // 心跳事件（静默处理）
});

clientB.on('notification', (msg) => {
  console.log(\`  -> [客户端B] 收到通知: \${msg.data}\`);
});

// 连接客户端
clientA.connect();
clientB.connect();

// 模拟推送不同类型的事件
setTimeout(() => {
  console.log('\\n--- 发送基础消息 ---');
  sseServer.sendToClient(
    clientA.id,
    'message',
    JSON.stringify({ text: '欢迎使用 SSE 服务！', time: new Date().toISOString() })
  );

  console.log('\\n--- 发送自定义事件（通知）---');
  sseServer.broadcast(
    'notification',
    JSON.stringify({ type: 'info', title: '系统通知', body: '服务器维护计划于今晚 2:00 进行' })
  );
}, 100);

setTimeout(() => {
  console.log('\\n--- 发送进度事件 ---');
  // 模拟任务进度推送
  let progress = 0;
  const progressTimer = setInterval(() => {
    progress += 25;
    sseServer.sendToClient(
      clientA.id,
      'progress',
      JSON.stringify({ task: '数据导出', percent: progress, step: progress / 25 })
    );
    if (progress >= 100) {
      clearInterval(progressTimer);
      sseServer.sendToClient(
        clientA.id,
        'notification',
        JSON.stringify({ type: 'success', title: '导出完成', body: '数据已成功导出' })
      );
    }
  }, 150);
}, 300);

setTimeout(() => {
  console.log('\\n--- 模拟断线重连 ---');
  clientB.disconnect();
  clientB.simulateReconnect();
}, 600);

setTimeout(() => {
  console.log('\\n--- 发送心跳事件 ---');
  sseServer.broadcast('heartbeat', 'ping');
}, 1000);

setTimeout(() => {
  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}, 1500);
`,
  },

  // ==========================================================
  // 第 3 章：定时任务（Cron）
  // ==========================================================
  {
    id: "node-cron",
    group: "实用场景",
    icon: "⏰",
    title: "定时任务",
    content: `# 定时任务调度

## 什么是定时任务

定时任务（Scheduled Task / Cron Job）是按预定时间周期自动执行的任务。在 Node.js 中，定时任务广泛用于数据备份、日志清理、定期报表生成、缓存刷新等场景。

## Cron 表达式

Cron 表达式是定义任务执行时间的字符串，由 5 或 6 个字段组成：

\`\`\`text
┌────────── 分钟 (0 - 59)
│ ┌──────── 小时 (0 - 23)
│ │ ┌────── 日期 (1 - 31)
│ │ │ ┌──── 月份 (1 - 12)
│ │ │ │ ┌── 星期 (0 - 7, 0 和 7 都表示周日)
│ │ │ │ │
* * * * *
\`\`\`

常用表达式示例：
- \`*/5 * * * *\` — 每 5 分钟
- \`0 * * * *\` — 每小时整点
- \`0 8 * * *\` — 每天早上 8:00
- \`0 0 1 * *\` — 每月 1 号零点
- \`30 9 * * 1-5\` — 工作日 9:30
- \`0 0 * * 0\` — 每周日零点

## 特殊字符

| 字符 | 说明 | 示例 |
|------|------|------|
| \`*\` | 任意值 | \`* * * * *\` 每秒 |
| \`,\` | 列举 | \`1,3,5 * * * *\` |
| \`-\` | 范围 | \`1-5 * * * *\` |
| \`/\` | 步长 | \`*/15 * * * *\` 每15分钟 |

## 定时任务调度器设计

一个基本的任务调度器需要：
1. **Cron 表达式解析**：将表达式解析为下次执行时间
2. **任务注册**：注册任务及其执行函数
3. **调度循环**：检查哪些任务到了执行时间
4. **任务执行**：执行到期的任务

## 任务管理功能

- **任务队列**：管理待执行的任务
- **任务重试**：失败后自动重试
- **任务日志**：记录每次执行的结果
- **任务并发控制**：限制同时执行的任务数
- **任务优先级**：高优先级任务优先执行

## 分布式定时任务

在分布式系统中，定时任务需要避免重复执行。常见方案：
- 使用 Redlock（Redis 分布式锁）确保同一时刻只有一个实例执行
- 使用数据库行锁
- 使用专门的调度系统（如 Quartz、XXL-JOB）

## 注意事项

- 注意时区问题，统一使用 UTC 或明确指定时区
- 避免任务执行时间超过调度间隔导致堆积
- 长时间运行的任务要有超时机制
- 任务执行失败要有告警通知

## Cron 表达式完整示例

| 表达式 | 含义 |
|--------|------|
| \`* * * * *\` | 每分钟执行 |
| \`0 * * * *\` | 每小时整点执行 |
| \`0 */6 * * *\` | 每 6 小时执行 |
| \`0 8 * * *\` | 每天上午 8:00 执行 |
| \`0 9 * * 1-5\` | 工作日 9:00 执行 |
| \`0 0 1,15 * *\` | 每月 1 号和 15 号零点执行 |
| \`30 2 * * 0\` | 每周日凌晨 2:30 执行 |
| \`0 0 1 1 *\` | 每年 1 月 1 日零点执行 |

## 任务调度的实现方式

除了自行实现调度器，还可以使用以下方式：
- **node-cron**：最流行的 Node.js cron 库
- **node-schedule**：支持对象语法和日期定义
- **bull**：基于 Redis 的鲁棒任务队列
- **agenda**：MongoDB 支持的任务调度
- **操作系统 cron**：直接写入 crontab

## 生产环境建议

- 使用独立的调度服务（如 Bull + Redis），与主应用解耦
- 所有任务记录执行日志，便于排查问题
- 设置任务执行超时，防止无限阻塞
- 任务失败时发送告警（邮件、钉钉、企业微信）
- 定期审查任务执行情况，清理无用任务

## 任务监控与运维

生产环境的定时任务需要完善的监控：
- **执行记录**：记录每次任务的开始时间、结束时间、执行结果
- **成功率告警**：当成功率低于阈值时发送告警
- **执行时长监控**：当执行时间异常增长时告警
- **死信处理**：多次失败的任务需要人工介入
- **可视化面板**：提供任务执行状态的可视化界面

## 常见使用场景

定时任务在 Node.js 应用中的典型场景：
- 数据备份与归档
- 日志轮转与清理
- 定期报表生成与邮件发送
- 缓存预热与刷新
- 数据同步与对账
- 过期会话/令牌清理
- 系统健康检查
`,
    code: `// ============================================================
// Cron 表达式解析器和任务调度器
// 实现 cron 表达式解析、任务注册、调度执行和日志管理
// ============================================================

const { EventEmitter } = require('events');

// -----------------------------------------------------------
// Cron 表达式解析器
// -----------------------------------------------------------
class CronParser {
  /**
   * 解析 cron 表达式为各字段的匹配值
   * @param {string} expression - cron 表达式（5 字段）
   * @returns {object} 解析后的字段规则
   */
  static parse(expression) {
    const parts = expression.trim().split(/\\s+/);
    if (parts.length !== 5) {
      throw new Error(\`无效的 Cron 表达式："\${expression}"，需要 5 个字段\`);
    }

    return {
      minute: CronParser._parseField(parts[0], 0, 59),
      hour: CronParser._parseField(parts[1], 0, 23),
      dayOfMonth: CronParser._parseField(parts[2], 1, 31),
      month: CronParser._parseField(parts[3], 1, 12),
      dayOfWeek: CronParser._parseField(parts[4], 0, 7),
      raw: expression,
    };
  }

  /**
   * 检查给定时间是否匹配 cron 规则
   * @param {object} rule - 解析后的规则
   * @param {Date} date - 要检查的时间
   * @returns {boolean}
   */
  static matches(rule, date) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // JS 月份从 0 开始
    const dayOfWeek = date.getDay(); // 0=周日

    return (
      rule.minute.includes(minute) &&
      rule.hour.includes(hour) &&
      rule.dayOfMonth.includes(dayOfMonth) &&
      rule.month.includes(month) &&
      (rule.dayOfWeek.includes(dayOfWeek) ||
        (dayOfWeek === 0 && rule.dayOfWeek.includes(7)))
    );
  }

  /**
   * 计算下次匹配时间
   */
  static nextTime(rule, fromDate = new Date()) {
    const next = new Date(fromDate.getTime() + 60000); // 至少从下一分钟开始
    next.setSeconds(0, 0);

    let attempts = 0;
    const maxAttempts = 366 * 24 * 60; // 最多查找一年

    while (attempts < maxAttempts) {
      if (CronParser.matches(rule, next)) {
        return next;
      }
      next.setMinutes(next.getMinutes() + 1);
      attempts++;
    }

    throw new Error('无法找到下次执行时间');
  }

  /**
   * 解析单个 cron 字段
   */
  static _parseField(field, min, max) {
    const values = new Set();

    if (field === '*') {
      for (let i = min; i <= max; i++) values.add(i);
      return Array.from(values);
    }

    // 处理逗号分隔的多个值
    const parts = field.split(',');
    for (const part of parts) {
      if (part.includes('/')) {
        // 步长值：*/5 或 1-30/5
        const [range, stepStr] = part.split('/');
        const step = parseInt(stepStr, 10);
        let rangeStart = min;
        let rangeEnd = max;

        if (range !== '*') {
          if (range.includes('-')) {
            [rangeStart, rangeEnd] = range.split('-').map(Number);
          } else {
            rangeStart = parseInt(range, 10);
            rangeEnd = max;
          }
        }

        for (let i = rangeStart; i <= rangeEnd; i += step) {
          values.add(i);
        }
      } else if (part.includes('-')) {
        // 范围值：1-5
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          values.add(i);
        }
      } else {
        // 单个值
        values.add(parseInt(part, 10));
      }
    }

    return Array.from(values).sort((a, b) => a - b);
  }
}

// -----------------------------------------------------------
// 任务定义
// -----------------------------------------------------------
class Task {
  constructor(name, cronExpression, handler, options = {}) {
    // 任务名称
    this.name = name;
    // Cron 表达式
    this.cronExpression = cronExpression;
    // 解析后的规则
    this.rule = CronParser.parse(cronExpression);
    // 执行函数
    this.handler = handler;
    // 任务选项
    this.options = {
      maxRetries: 3,       // 最大重试次数
      retryDelay: 1000,    // 重试延迟（毫秒）
      timeout: 30000,      // 任务超时时间
      enabled: true,       // 是否启用
      runOnStart: false,   // 启动时是否立即执行
      ...options,
    };
    // 下次执行时间
    this.nextRun = null;
    // 执行统计
    this.stats = {
      totalRuns: 0,
      successRuns: 0,
      failedRuns: 0,
      lastRun: null,
      lastError: null,
    };
    // 当前是否在执行
    this.running = false;
  }

  // 更新下次执行时间
  updateNextRun(fromDate = new Date()) {
    this.nextRun = CronParser.nextTime(this.rule, fromDate);
    return this.nextRun;
  }
}

// -----------------------------------------------------------
// 任务日志
// -----------------------------------------------------------
class TaskLogger {
  constructor() {
    this.logs = [];
  }

  info(taskName, message) {
    this._log('INFO', taskName, message);
  }

  success(taskName, message, duration) {
    this._log('SUCCESS', taskName, \`\${message} (耗时: \${duration}ms)\`);
  }

  error(taskName, message, error) {
    this._log('ERROR', taskName, \`\${message}: \${error?.message || error}\`);
  }

  warn(taskName, message) {
    this._log('WARN', taskName, message);
  }

  _log(level, taskName, message) {
    const entry = {
      time: new Date().toISOString(),
      level,
      task: taskName,
      message,
    };
    this.logs.push(entry);
    console.log(\`[\${entry.time}] [\${level}] [\${taskName}] \${message}\`);
  }

  // 获取最近日志
  getRecent(count = 10) {
    return this.logs.slice(-count);
  }
}

// -----------------------------------------------------------
// 任务调度器
// -----------------------------------------------------------
class TaskScheduler extends EventEmitter {
  constructor(options = {}) {
    super();
    // 注册的任务
    this.tasks = new Map();
    // 任务日志
    this.logger = new TaskLogger();
    // 调度器选项
    this.options = {
      tickInterval: 1000,     // 检查间隔（毫秒）
      maxConcurrent: 5,       // 最大并发任务数
      ...options,
    };
    // 调度器状态
    this.running = false;
    // 调度循环计时器
    this._tickTimer = null;
    // 当前运行的任务数
    this._activeJobs = 0;
  }

  // 注册任务
  register(name, cronExpression, handler, options = {}) {
    if (this.tasks.has(name)) {
      throw new Error(\`任务 "\${name}" 已存在\`);
    }

    const task = new Task(name, cronExpression, handler, options);
    task.updateNextRun();
    this.tasks.set(name, task);

    this.logger.info(name, \`任务已注册（cron: \${cronExpression}，下次执行: \${task.nextRun.toISOString()}）\`);

    // 如果设置了立即执行
    if (task.options.runOnStart) {
      setTimeout(() => this._executeTask(task), 0);
    }

    this.emit('registered', { name, cronExpression });
    return task;
  }

  // 启动调度器
  start() {
    if (this.running) return;
    this.running = true;
    this.logger.info('调度器', '调度器已启动');

    this._tickTimer = setInterval(() => {
      this._tick();
    }, this.options.tickInterval);

    this.emit('started');
  }

  // 停止调度器
  stop() {
    if (!this.running) return;
    this.running = false;

    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }

    this.logger.info('调度器', '调度器已停止');
    this.emit('stopped');
  }

  // 手动触发任务
  async trigger(name) {
    const task = this.tasks.get(name);
    if (!task) {
      this.logger.error('调度器', \`任务 "\${name}" 不存在\`);
      return;
    }

    this.logger.info(name, '手动触发执行');
    await this._executeTask(task);
  }

  // 获取调度器状态
  getStatus() {
    const taskStatuses = [];
    this.tasks.forEach((task) => {
      taskStatuses.push({
        name: task.name,
        cron: task.cronExpression,
        enabled: task.options.enabled,
        running: task.running,
        nextRun: task.nextRun?.toISOString(),
        stats: { ...task.stats },
      });
    });

    return {
      running: this.running,
      activeJobs: this._activeJobs,
      totalTasks: this.tasks.size,
      tasks: taskStatuses,
    };
  }

  // 调度循环
  _tick() {
    if (!this.running) return;

    const now = new Date();
    this.tasks.forEach((task) => {
      if (
        task.options.enabled &&
        !task.running &&
        task.nextRun &&
        now >= task.nextRun &&
        this._activeJobs < this.options.maxConcurrent
      ) {
        this._executeTask(task);
      }
    });
  }

  // 执行任务
  async _executeTask(task) {
    task.running = true;
    this._activeJobs++;
    task.stats.totalRuns++;

    const startTime = Date.now();
    let retries = 0;

    this.logger.info(task.name, '开始执行');

    // 带超时和重试的执行逻辑
    const executeWithTimeout = () => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(\`任务执行超时（\${task.options.timeout}ms）\`));
        }, task.options.timeout);

        try {
          const result = task.handler(task);
          clearTimeout(timeoutId);

          // 处理 Promise 结果
          if (result instanceof Promise) {
            result.then(
              (res) => { clearTimeout(timeoutId); resolve(res); },
              (err) => { clearTimeout(timeoutId); reject(err); }
            );
          } else {
            resolve(result);
          }
        } catch (err) {
          clearTimeout(timeoutId);
          reject(err);
        }
      });
    };

    // 重试循环
    while (retries <= task.options.maxRetries) {
      try {
        await executeWithTimeout();
        // 执行成功
        const duration = Date.now() - startTime;
        task.stats.successRuns++;
        task.stats.lastRun = new Date();
        this.logger.success(task.name, '执行成功', duration);
        this.emit('success', { name: task.name, duration });
        break;
      } catch (err) {
        retries++;
        if (retries <= task.options.maxRetries) {
          this.logger.warn(
            task.name,
            \`第 \${retries} 次重试（共 \${task.options.maxRetries} 次）\`
          );
          await new Promise((r) => setTimeout(r, task.options.retryDelay));
        } else {
          // 重试耗尽
          task.stats.failedRuns++;
          task.stats.lastError = err.message;
          this.logger.error(task.name, '执行失败（重试已耗尽）', err);
          this.emit('failed', { name: task.name, error: err });
        }
      }
    }

    // 更新下次执行时间
    task.updateNextRun();
    task.running = false;
    this._activeJobs--;
  }
}

// ============================================================
// 演示运行
// ============================================================
console.log('========== 定时任务调度器演示 ==========\\n');

const scheduler = new TaskScheduler({ tickInterval: 1000, maxConcurrent: 5 });

// 注册 "数据备份" 任务（模拟每天凌晨 2:00 执行）
scheduler.register('数据备份', '0 2 * * *', (task) => {
  console.log(\`  [执行] \${task.name}：正在备份数据...\`);
  return '备份完成';
});

// 注册 "日志清理" 任务（模拟每 5 分钟执行）
scheduler.register('日志清理', '*/5 * * * *', (task) => {
  console.log(\`  [执行] \${task.name}：正在清理过期日志...\`);
  return '清理完成';
});

// 注册 "健康检查" 任务（模拟每分钟执行）
scheduler.register('健康检查', '* * * * *', (task) => {
  console.log(\`  [执行] \${task.name}：系统状态正常\`);
  return { status: 'healthy', cpu: '12%', memory: '45%' };
});

// 注册一个会失败的任务（演示重试机制）
scheduler.register('失败重试演示', '*/2 * * * *', (task) => {
  console.log(\`  [执行] \${task.name}：尝试执行...\`);
  throw new Error('模拟执行失败');
}, { maxRetries: 2, retryDelay: 500 });

// 启动调度器
scheduler.start();

// 手动触发一个任务
setTimeout(() => {
  console.log('\\n--- 手动触发"数据备份"任务 ---');
  scheduler.trigger('数据备份');
}, 500);

// 查看调度器状态
setTimeout(() => {
  console.log('\\n--- 调度器状态 ---');
  const status = scheduler.getStatus();
  console.log('运行中:', status.running);
  console.log('活跃任务:', status.activeJobs);
  console.log('任务总数:', status.totalTasks);
  status.tasks.forEach((t) => {
    console.log(\`  \${t.name}: 启用=\${t.enabled}, 总执行=\${t.stats.totalRuns}, 成功=\${t.stats.successRuns}, 失败=\${t.stats.failedRuns}\`);
  });
}, 2000);

// 停止调度器
setTimeout(() => {
  scheduler.stop();
  console.log('\\n--- 最近日志 ---');
  scheduler.logger.getRecent(5).forEach((log) => {
    console.log(\`  [\${log.level}] \${log.task}: \${log.message}\`);
  });
  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}, 3500);
`,
  },

  // ==========================================================
  // 第 4 章：邮件发送
  // ==========================================================
  {
    id: "node-email",
    group: "实用场景",
    icon: "📧",
    title: "邮件发送",
    content: `# 邮件发送服务

## 邮件发送流程

在 Node.js 应用中发送邮件通常遵循以下流程：

1. **创建邮件内容**：构建邮件主题、正文、收件人等
2. **渲染邮件模板**：将动态数据填充到 HTML 模板中
3. **连接 SMTP 服务器**：通过 SMTP 协议发送邮件
4. **处理发送结果**：记录日志、处理失败重试

## SMTP 协议

SMTP（Simple Mail Transfer Protocol）是发送电子邮件的标准协议。常见 SMTP 服务：
- Gmail：smtp.gmail.com（端口 587，TLS）
- QQ邮箱：smtp.qq.com（端口 587/465）
- 企业邮箱：自定义 SMTP 服务器

## 邮件模板

邮件模板将邮件内容和样式分离，常用模板引擎：
- **EJS**：类 HTML 语法，简单直观
- **Handlebars**：逻辑模板，支持 helper
- **Pug**：缩进语法，简洁

模板示例：
\`\`\`html
<h1>你好，{{name}}！</h1>
<p>您的订单 #{{orderId}} 已发货。</p>
<p>预计送达时间：{{deliveryDate}}</p>
\`\`\`

## 异步发送

邮件发送是典型的 I/O 密集操作，必须异步处理：
- 发送邮件时不应阻塞主请求
- 使用消息队列（如 Bull、RabbitMQ）异步处理
- 发送结果通过回调或 WebSocket 通知用户

## 发送失败重试

邮件发送可能因网络问题、SMTP 限流等原因失败，需要重试机制：
- 指数退避重试：1min → 5min → 15min → 30min
- 重试次数限制（如最多 3 次）
- 最终失败后记录到死信队列，人工处理

## 邮件队列

邮件队列是处理大量邮件发送的关键：
- **入队**：将邮件任务加入队列
- **消费**：工作进程从队列取出并发送
- **速率控制**：限制每秒发送数量，避免被 SMTP 封禁
- **优先级**：事务邮件（密码重置）优先于营销邮件

## 开发环境测试

开发环境中避免发送真实邮件，常用方案：
- **MailDev**：本地 SMTP 服务器 + Web 界面
- **Ethereal**：Nodemailer 提供的测试邮箱
- **日志模式**：将邮件内容输出到日志而非发送

## 安全注意事项

- 使用 TLS/SSL 加密邮件传输
- 不要在日志中记录完整的邮件内容（可能含敏感信息）
- 验证收件人邮箱格式，防止注入攻击
- 限制邮件发送频率，防止被滥用

## 邮件内容设计

一封好的邮件需要考虑：
- **主题行**：简洁明了，避免被标记为垃圾邮件
- **纯文本备选**：提供 text/plain 版本，兼容所有邮件客户端
- **响应式设计**：使用内联样式，确保在移动端正常显示
- **退订链接**：营销邮件必须包含退订链接
- **发件人名称**：使用可识别的发件人名称

## 邮件附件处理

邮件附件通过 MIME（Multipurpose Internet Mail Extensions）实现：
- 使用 Base64 编码二进制数据
- 设置正确的 Content-Type（如 application/pdf）
- 大附件建议使用云存储链接替代
- 注意附件大小限制（通常 25MB）

## 邮件发送最佳实践

- **SPF/DKIM/DMARC**：配置 DNS 记录，提高邮件送达率
- **预热 IP**：新 IP 逐步增加发送量，建立信誉
- **退信处理**：自动处理退信，清理无效地址
- **A/B 测试**：测试不同主题和内容的效果
- **发送窗口**：在用户活跃时间发送，提高打开率

## 邮件队列高级特性

生产环境的邮件队列需要更复杂的特性：
- **持久化**：队列数据持久化到 Redis/MongoDB，防止进程重启丢失
- **优先级队列**：事务邮件优先处理，营销邮件在低峰期发送
- **延迟发送**：支持定时发送（如明天上午 9:00）
- **发送统计**：实时统计发送成功率、退信率、打开率
- **消费者扩展**：通过增加消费者进程水平扩展发送能力

## SMTP 连接池

复用 SMTP 连接可以显著提高发送效率：
- 维护一个连接池，避免每次发送都建立新连接
- 连接数限制在 3-5 个，避免被 SMTP 服务器限流
- 连接空闲超时自动关闭，释放资源
- 连接失败时自动重连

## 邮件发送的常见问题

- **被标记为垃圾邮件**：配置 SPF/DKIM/DMARC、避免垃圾关键词
- **发送频率限制**：SMTP 服务商通常有每小时/每天发送上限
- **邮件内容乱码**：确保使用 UTF-8 编码，设置正确的 Content-Type
- **附件过大**：使用云存储链接替代大附件
- **退信率高**：定期清理无效邮箱地址，维护发件人信誉
`,
    code: `// ============================================================
// 邮件发送服务模拟
// 实现邮件模板渲染、队列管理和重试机制
// ============================================================

const { EventEmitter } = require('events');
const { Buffer } = require('buffer');

// -----------------------------------------------------------
// 邮件模板引擎（模拟 Handlebars 风格）
// -----------------------------------------------------------
class EmailTemplate {
  constructor(templateStr) {
    // 模板字符串
    this.template = templateStr;
  }

  /**
   * 渲染模板，替换 {{变量}} 占位符
   * @param {object} data - 模板数据
   * @returns {string} 渲染后的 HTML
   */
  render(data) {
    let html = this.template;
    // 替换 {{key}} 形式的占位符
    html = html.replace(/\\{\\{\\s*(\\w+)\\s*\\}\\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
    return html;
  }

  /**
   * 创建模板实例
   */
  static create(type) {
    const templates = {
      welcome: new EmailTemplate(\`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">欢迎加入，{{name}}！</h1>
          <p>感谢您注册我们的服务。</p>
          <p>您的账号：<strong>{{email}}</strong></p>
          <p>如有任何问题，请随时联系我们。</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            此邮件由系统自动发送，请勿回复。
          </p>
        </div>
      \`),
      resetPassword: new EmailTemplate(\`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">密码重置</h1>
          <p>您好，{{name}}！</p>
          <p>您正在重置密码，验证码为：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e74c3c;">
              {{code}}
            </span>
          </div>
          <p>验证码 {{expireMinutes}} 分钟内有效，请勿泄露给他人。</p>
          <p style="color: #999; font-size: 12px;">
            如果您没有请求重置密码，请忽略此邮件。
          </p>
        </div>
      \`),
      orderShipped: new EmailTemplate(\`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">订单已发货</h1>
          <p>您好，{{name}}！</p>
          <p>您的订单 <strong>#{{orderId}}</strong> 已发货。</p>
          <p>物流公司：{{carrier}}</p>
          <p>快递单号：<strong>{{trackingNumber}}</strong></p>
          <p>预计送达时间：{{deliveryDate}}</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            您可以在"我的订单"中查看物流详情。
          </p>
        </div>
      \`),
    };
    return templates[type] || templates.welcome;
  }
}

// -----------------------------------------------------------
// 邮件对象
// -----------------------------------------------------------
class Email {
  constructor({ to, subject, templateType, templateData, priority = 'normal' }) {
    // 收件人
    this.to = to;
    // 邮件主题
    this.subject = subject;
    // 模板类型
    this.templateType = templateType;
    // 模板数据
    this.templateData = templateData;
    // 优先级（high, normal, low）
    this.priority = priority;
    // 邮件 ID
    this.id = \`email-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\`;
    // 创建时间
    this.createdAt = new Date();
    // 发送状态
    this.status = 'pending'; // pending, sending, sent, failed
    // 重试次数
    this.retries = 0;
  }

  /**
   * 渲染邮件的 HTML 内容
   */
  renderContent() {
    const template = EmailTemplate.create(this.templateType);
    return template.render(this.templateData);
  }
}

// -----------------------------------------------------------
// 邮件队列
// -----------------------------------------------------------
class EmailQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxRetries: 3,           // 最大重试次数
      retryDelay: 1000,        // 重试延迟（毫秒）
      rateLimit: 5,            // 每秒最多发送数量
      maxConcurrent: 2,        // 最大并发发送
      ...options,
    };
    // 队列（按优先级分组）
    this.queues = {
      high: [],
      normal: [],
      low: [],
    };
    // 死信队列（最终失败）
    this.deadLetterQueue = [];
    // 发送记录
    this.sent = [];
    // 队列处理状态
    this.processing = false;
    // 发送速率控制
    this._sentInWindow = 0;
    this._windowTimer = null;
    // 当前活跃的发送任务数
    this._activeSends = 0;
  }

  /**
   * 将邮件加入队列
   */
  enqueue(email) {
    const queue = this.queues[email.priority] || this.queues.normal;
    queue.push(email);
    console.log(\`[队列] 邮件 \${email.id} 已入队（优先级: \${email.priority}，收件人: \${email.to}）\`);
    console.log(\`  主题: \${email.subject}\`);
    this.emit('enqueued', { emailId: email.id });

    // 触发处理
    this.process();
  }

  /**
   * 处理队列
   */
  async process() {
    if (this.processing) return;
    this.processing = true;

    // 启动速率窗口
    this._startRateWindow();

    while (this._hasPending()) {
      if (this._activeSends >= this.options.maxConcurrent) {
        await this._sleep(100);
        continue;
      }

      if (this._sentInWindow >= this.options.rateLimit) {
        await this._sleep(100);
        continue;
      }

      const email = this._dequeue();
      if (!email) break;

      this._activeSends++;
      this._sentInWindow++;

      this._sendEmail(email).finally(() => {
        this._activeSends--;
      });
    }

    this.processing = false;
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    return {
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length,
      deadLetter: this.deadLetterQueue.length,
      sent: this.sent.length,
      activeSends: this._activeSends,
    };
  }

  /**
   * 从队列取出邮件（按优先级）
   */
  _dequeue() {
    for (const priority of ['high', 'normal', 'low']) {
      if (this.queues[priority].length > 0) {
        return this.queues[priority].shift();
      }
    }
    return null;
  }

  /**
   * 检查是否有待处理邮件
   */
  _hasPending() {
    return (
      this.queues.high.length > 0 ||
      this.queues.normal.length > 0 ||
      this.queues.low.length > 0
    );
  }

  /**
   * 发送邮件
   */
  async _sendEmail(email) {
    email.status = 'sending';
    console.log(\`[发送] 正在发送邮件 \${email.id}...\`);

    // 模拟 SMTP 发送
    const success = Math.random() > 0.3; // 70% 成功率

    if (success) {
      email.status = 'sent';
      this.sent.push(email);
      console.log(\`[发送] 邮件 \${email.id} 发送成功 ✓\`);
      this.emit('sent', { emailId: email.id, to: email.to });
    } else {
      email.retries++;
      if (email.retries <= this.options.maxRetries) {
        console.log(
          \`[重试] 邮件 \${email.id} 发送失败，第 \${email.retries} 次重试（共 \${this.options.maxRetries} 次）\`
        );
        // 延迟后重新入队
        await this._sleep(this.options.retryDelay * email.retries);
        this.queues[email.priority].push(email);
      } else {
        email.status = 'failed';
        this.deadLetterQueue.push(email);
        console.log(\`[失败] 邮件 \${email.id} 重试耗尽，已移入死信队列\`);
        this.emit('failed', {
          emailId: email.id,
          to: email.to,
          retries: email.retries,
        });
      }
    }
  }

  /**
   * 启动速率控制窗口
   */
  _startRateWindow() {
    if (this._windowTimer) return;
    this._windowTimer = setInterval(() => {
      this._sentInWindow = 0;
    }, 1000);
  }

  /**
   * 异步延迟
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// -----------------------------------------------------------
// 邮件服务
// -----------------------------------------------------------
class EmailService {
  constructor(options = {}) {
    this.queue = new EmailQueue(options);
    // SMTP 配置（模拟）
    this.config = {
      host: options.host || 'smtp.example.com',
      port: options.port || 587,
      secure: options.secure || false,
      from: options.from || 'noreply@example.com',
    };
  }

  /**
   * 发送邮件（加入队列）
   */
  send(options) {
    const email = new Email({
      to: options.to,
      subject: options.subject,
      templateType: options.templateType || 'welcome',
      templateData: options.templateData || {},
      priority: options.priority || 'normal',
    });

    // 渲染预览
    if (options.preview) {
      console.log('\\n--- 邮件预览 ---');
      console.log(email.renderContent());
      console.log('--- 预览结束 ---\\n');
    }

    this.queue.enqueue(email);
    return email;
  }

  /**
   * 批量发送
   */
  sendBatch(emails) {
    emails.forEach((options) => this.send(options));
    return this.queue.getStatus();
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    return this.queue.getStatus();
  }
}

// ============================================================
// 演示运行
// ============================================================
async function main() {
  console.log('========== 邮件发送服务模拟 ==========\\n');

  const emailService = new EmailService({
    host: 'smtp.example.com',
    port: 587,
    from: 'noreply@example.com',
  });

  // 发送欢迎邮件
  emailService.send({
    to: 'user1@example.com',
    subject: '欢迎注册！',
    templateType: 'welcome',
    templateData: { name: '张三', email: 'user1@example.com' },
    priority: 'normal',
    preview: true,
  });

  // 发送密码重置邮件（高优先级）
  emailService.send({
    to: 'user2@example.com',
    subject: '密码重置验证码',
    templateType: 'resetPassword',
    templateData: {
      name: '李四',
      code: '482931',
      expireMinutes: '10',
    },
    priority: 'high',
  });

  // 发送订单发货邮件
  emailService.send({
    to: 'user3@example.com',
    subject: '您的订单已发货 #20240001',
    templateType: 'orderShipped',
    templateData: {
      name: '王五',
      orderId: '20240001',
      carrier: '顺丰速运',
      trackingNumber: 'SF1234567890',
      deliveryDate: '2024-01-15',
    },
    priority: 'normal',
  });

  // 批量发送（低优先级）
  emailService.sendBatch([
    { to: 'user4@example.com', subject: '促销活动', templateType: 'welcome', templateData: { name: '用户4', email: 'user4@example.com' }, priority: 'low' },
    { to: 'user5@example.com', subject: '系统通知', templateType: 'welcome', templateData: { name: '用户5', email: 'user5@example.com' }, priority: 'low' },
  ]);

  // 等待队列处理完成
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('\\n--- 队列状态 ---');
  const status = emailService.getStatus();
  console.log(\`  高优先级: \${status.high}\`);
  console.log(\`  普通优先级: \${status.normal}\`);
  console.log(\`  低优先级: \${status.low}\`);
  console.log(\`  死信队列: \${status.deadLetter}\`);
  console.log(\`  已发送: \${status.sent}\`);

  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}

main();
`,
  },

  // ==========================================================
  // 第 5 章：文件导出
  // ==========================================================
  {
    id: "node-export",
    group: "实用场景",
    icon: "📊",
    title: "文件导出",
    content: `# 文件导出

## 导出需求概述

在 Web 应用中，文件导出是常见的功能需求。用户需要将数据导出为 CSV、Excel、PDF 等格式进行离线分析、存档或分享。Node.js 的流式处理能力使其特别适合处理大数据量的导出。

## CSV 导出

CSV（Comma-Separated Values）是最简单通用的数据导出格式：

- **一次性导出**：适用于小数据量（< 10万行），将数据全部加载到内存后写入
- **流式导出**：适用于大数据量，边读边写，内存占用恒定

## 流式导出 vs 一次性导出

| 方式 | 内存占用 | 适用数据量 | 实现复杂度 |
|------|---------|-----------|-----------|
| 一次性导出 | O(n) | 小（< 10万行） | 低 |
| 流式导出 | O(1) | 任意大小 | 中 |
| 分批导出 | O(k) | 大（分批处理） | 中 |

## 大数据量导出优化

1. **流式写入**：使用 \`fs.createWriteStream\` 配合数据的流式读取
2. **分批处理**：从数据库分批读取数据，每批 1000-5000 条
3. **压缩导出**：导出时直接压缩为 gzip，减少传输时间
4. **异步导出**：大数据量导出使用后台任务，完成后通知用户下载

## 导出进度追踪

对于长时间运行的导出任务，提供进度反馈非常重要：

- 记录已处理行数和总行数
- 通过 SSE 或 WebSocket 推送进度
- 导出完成后发送通知

## CSV 格式注意事项

- 字段值包含逗号时，需要用双引号包裹
- 字段值包含双引号时，需要转义为两个双引号
- 字段值包含换行符时，需要用双引号包裹
- BOM 头：UTF-8 CSV 文件建议添加 BOM，确保 Excel 正确识别中文

## Excel 导出概念

Excel 导出通常使用以下库：
- **exceljs**：支持 xlsx 格式，功能丰富
- **xlsx**（SheetJS）：轻量级，支持多种格式
- 流式写入同样支持，避免大数据量 OOM

## PDF 生成概念

PDF 生成通常使用：
- **pdfkit**：Node.js 原生 PDF 生成
- **puppeteer**：使用 HTML 渲染后转 PDF（最灵活）
- 模板化的 HTML 转 PDF 是最常见的方案

## 导出格式选择指南

| 格式 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| CSV | 数据交换、数据分析 | 简单、通用、体积小 | 不支持样式、多表 |
| Excel | 报表、财务数据 | 支持公式、图表、样式 | 实现复杂、体积大 |
| PDF | 正式文档、发票 | 格式固定、跨平台 | 不易编辑、生成慢 |
| JSON | API 数据导出 | 结构化、易解析 | 非技术人员难阅读 |

## 导出性能优化清单

1. **分批读取**：数据库查询使用游标或分页
2. **流式写入**：避免将所有数据加载到内存
3. **压缩传输**：导出文件使用 gzip 压缩
4. **异步任务**：大数据量导出使用后台任务
5. **CDN 分发**：导出文件存储在对象存储，通过 CDN 下载
6. **超时控制**：设置合理的导出超时时间
7. **资源回收**：导出完成后及时清理临时文件

## 导出安全注意事项

- **权限控制**：确保用户只能导出自己有权限的数据
- **数据脱敏**：敏感字段（手机号、身份证）导出时脱敏
- **导出审计**：记录谁在什么时间导出了什么数据
- **下载链接安全**：使用临时签名 URL，设置过期时间
- **文件大小限制**：防止恶意请求导出超大文件导致 OOM

## Excel 导出进阶

利用 Excel 的丰富功能提升导出质量：
- **多工作表**：将不同类型数据导出到不同 Sheet
- **单元格样式**：表头加粗、数字格式化、条件格式化
- **数据验证**：添加下拉列表、数值范围限制
- **公式计算**：预设计算公式（SUM、AVERAGE 等）
- **冻结窗格**：冻结表头行，方便浏览大数据

## 导出功能的设计原则

1. **配置驱动**：导出列、格式、筛选条件通过配置定义，灵活可复用
2. **异步导出**：大数据量导出不阻塞用户请求，后台处理后通知
3. **分片下载**：超大文件支持分片下载，断点续传
4. **多格式支持**：同一数据源支持导出 CSV/Excel/PDF 多种格式
5. **模板化**：预定义导出模板，用户选择模板后一键导出
`,
    code: `// ============================================================
// CSV 导出器
// 实现流式写入、自定义列、批量导出和进度追踪
// ============================================================

const { EventEmitter } = require('events');
const { Readable, Transform } = require('stream');
const path = require('path');
const fs = require('fs');
const os = require('os');

// -----------------------------------------------------------
// CSV 格式化工具
// -----------------------------------------------------------
class CSVFormatter {
  /**
   * 格式化单个字段值（处理特殊字符）
   */
  static formatField(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);

    // 如果包含逗号、双引号或换行符，需要用双引号包裹
    if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
      // 双引号转义为两个双引号
      return \`"\${str.replace(/"/g, '""')}"\`;
    }
    return str;
  }

  /**
   * 格式化一行数据
   */
  static formatRow(values, columns) {
    const fields = columns
      ? columns.map((col) => CSVFormatter.formatField(values[col]))
      : values.map((v) => CSVFormatter.formatField(v));
    return fields.join(',') + '\\n';
  }

  /**
   * 生成 BOM 头（确保 Excel 正确识别 UTF-8）
   */
  static getBOM() {
    return '\\uFEFF';
  }
}

// -----------------------------------------------------------
// CSV 导出器
// -----------------------------------------------------------
class CSVExporter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      // 列定义：[{ key: 'name', title: '姓名' }, ...]
      columns: [],
      // 输出目录
      outputDir: options.outputDir || os.tmpdir(),
      // 文件名
      filename: options.filename || \`export-\${Date.now()}.csv\`,
      // 是否添加 BOM
      addBOM: options.addBOM !== false,
      // 批量写入大小（行数）
      batchSize: options.batchSize || 1000,
      // 编码
      encoding: options.encoding || 'utf-8',
      ...options,
    };
    // 写入流
    this._writeStream = null;
    // 导出统计
    this.stats = {
      totalRows: 0,
      writtenRows: 0,
      startTime: null,
      endTime: null,
      fileSize: 0,
      filePath: null,
    };
    // 导出状态
    this.status = 'idle'; // idle, exporting, completed, error
    // 缓冲行
    this._buffer = [];
  }

  /**
   * 获取完整输出路径
   */
  get outputPath() {
    return path.join(this.options.outputDir, this.options.filename);
  }

  /**
   * 设置列定义
   */
  setColumns(columns) {
    this.options.columns = columns;
    return this;
  }

  /**
   * 启动导出（写入文件头）
   */
  start() {
    if (this.status === 'exporting') {
      throw new Error('导出正在进行中，请等待完成');
    }

    this.status = 'exporting';
    this.stats.startTime = new Date();
    this.stats.totalRows = 0;
    this.stats.writtenRows = 0;
    this.stats.filePath = this.outputPath;
    this._buffer = [];

    // 确保输出目录存在
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }

    // 创建写入流
    this._writeStream = fs.createWriteStream(this.outputPath, {
      encoding: this.options.encoding,
    });

    // 写入 BOM 头
    if (this.options.addBOM) {
      this._writeStream.write(CSVFormatter.getBOM());
    }

    // 写入列标题
    if (this.options.columns.length > 0) {
      const headers = this.options.columns.map((col) => col.title || col.key);
      this._writeStream.write(CSVFormatter.formatRow(headers));
    }

    this.emit('start', { filePath: this.outputPath });
    console.log(\`[导出] 开始导出到: \${this.outputPath}\`);
    return this;
  }

  /**
   * 写入一行数据
   */
  writeRow(row) {
    if (this.status !== 'exporting') {
      throw new Error('导出未启动，请先调用 start()');
    }

    const line = CSVFormatter.formatRow(row, this.options.columns.map((c) => c.key));
    this._buffer.push(line);
    this.stats.totalRows++;

    // 达到批量大小时刷新
    if (this._buffer.length >= this.options.batchSize) {
      this._flushBuffer();
    }

    return this;
  }

  /**
   * 批量写入数据
   */
  writeRows(rows) {
    rows.forEach((row) => this.writeRow(row));
    return this;
  }

  /**
   * 从可读流批量写入
   */
  async writeFromStream(readableStream) {
    return new Promise((resolve, reject) => {
      readableStream.on('data', (row) => {
        this.writeRow(row);
      });
      readableStream.on('end', () => {
        this.finish().then(resolve).catch(reject);
      });
      readableStream.on('error', (err) => {
        this.status = 'error';
        this.emit('error', err);
        reject(err);
      });
    });
  }

  /**
   * 完成导出
   */
  async finish() {
    if (this.status !== 'exporting') return;

    // 刷新剩余缓冲区
    this._flushBuffer();

    return new Promise((resolve, reject) => {
      this._writeStream.end(() => {
        this.status = 'completed';
        this.stats.endTime = new Date();

        // 获取文件大小
        try {
          const stat = fs.statSync(this.outputPath);
          this.stats.fileSize = stat.size;
        } catch (e) {
          // 忽略
        }

        const duration = this.stats.endTime - this.stats.startTime;
        console.log(\`[导出] 导出完成！\`);
        console.log(\`  文件: \${this.outputPath}\`);
        console.log(\`  总行数: \${this.stats.writtenRows}\`);
        console.log(\`  文件大小: \${(this.stats.fileSize / 1024).toFixed(2)} KB\`);
        console.log(\`  耗时: \${duration}ms\`);
        this.emit('complete', { ...this.stats });
        resolve(this.stats);
      });
    });
  }

  /**
   * 获取导出进度
   */
  getProgress() {
    const total = this.stats.totalRows;
    const written = this.stats.writtenRows;
    return {
      status: this.status,
      totalRows: total,
      writtenRows: written,
      progress: total > 0 ? Math.round((written / total) * 100) : 0,
      bufferSize: this._buffer.length,
      filePath: this.stats.filePath,
    };
  }

  /**
   * 刷新缓冲区到文件
   */
  _flushBuffer() {
    if (this._buffer.length === 0) return;
    const chunk = this._buffer.join('');
    this._writeStream.write(chunk);
    this.stats.writtenRows += this._buffer.length;
    this._buffer = [];

    // 发送进度事件
    this.emit('progress', this.getProgress());
  }
}

// -----------------------------------------------------------
// 模拟数据生成器（可读流）
// -----------------------------------------------------------
class DataGenerator extends Readable {
  constructor(totalRows, columns) {
    super({ objectMode: true });
    this.totalRows = totalRows;
    this.columns = columns;
    this.currentRow = 0;
  }

  _read() {
    if (this.currentRow >= this.totalRows) {
      this.push(null); // 结束流
      return;
    }

    const row = {};
    this.columns.forEach((col) => {
      row[col.key] = this._generateValue(col);
    });

    this.currentRow++;
    this.push(row);
  }

  _generateValue(col) {
    switch (col.type) {
      case 'name':
        return \`用户\${this.currentRow + 1}\`;
      case 'email':
        return \`user\${this.currentRow + 1}@example.com\`;
      case 'age':
        return Math.floor(Math.random() * 50) + 18;
      case 'score':
        return (Math.random() * 100).toFixed(1);
      case 'date':
        const d = new Date(2024, 0, 1);
        d.setDate(d.getDate() + this.currentRow);
        return d.toISOString().split('T')[0];
      case 'status':
        const statuses = ['启用', '禁用', '待审核'];
        return statuses[this.currentRow % statuses.length];
      default:
        return \`data-\${this.currentRow}\`;
    }
  }
}

// ============================================================
// 演示运行
// ============================================================
async function main() {
  console.log('========== CSV 文件导出演示 ==========\\n');

  // 定义列
  const columns = [
    { key: 'name', title: '姓名', type: 'name' },
    { key: 'email', title: '邮箱', type: 'email' },
    { key: 'age', title: '年龄', type: 'age' },
    { key: 'score', title: '分数', type: 'score' },
    { key: 'date', title: '日期', type: 'date' },
    { key: 'status', title: '状态', type: 'status' },
  ];

  // 方式一：流式导出大数据量
  console.log('--- 方式一：流式导出（10000 行） ---');
  const exporter1 = new CSVExporter({
    filename: 'users-stream.csv',
    batchSize: 500,
  });
  exporter1.setColumns(columns);

  // 监听进度
  exporter1.on('progress', (p) => {
    if (p.progress % 20 === 0) {
      console.log(\`  进度: \${p.progress}%（已写入 \${p.writtenRows} 行）\`);
    }
  });

  exporter1.start();
  const generator = new DataGenerator(10000, columns);
  await exporter1.writeFromStream(generator);

  console.log('');

  // 方式二：逐行写入
  console.log('--- 方式二：逐行写入（100 行） ---');
  const exporter2 = new CSVExporter({
    filename: 'users-rows.csv',
    batchSize: 20,
  });
  exporter2.setColumns(columns);

  exporter2.on('progress', (p) => {
    console.log(\`  缓冲区大小: \${p.bufferSize}, 已写入: \${p.writtenRows}\`);
  });

  exporter2.start();
  for (let i = 0; i < 100; i++) {
    exporter2.writeRow({
      name: \`用户\${i + 1}\`,
      email: \`user\${i + 1}@example.com\`,
      age: Math.floor(Math.random() * 50) + 18,
      score: (Math.random() * 100).toFixed(1),
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      status: i % 3 === 0 ? '启用' : i % 3 === 1 ? '待审核' : '禁用',
    });
  }
  await exporter2.finish();

  // 验证导出结果
  console.log('\\n--- 验证导出文件 ---');
  const filePath = exporter2.outputPath;
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\\n');
    console.log(\`  文件: \${filePath}\`);
    console.log(\`  总行数（含表头）: \${lines.length}\`);
    console.log(\`  前 3 行:\`);
    lines.slice(0, 3).forEach((line) => {
      console.log(\`    \${line.substring(0, 80)}\${line.length > 80 ? '...' : ''}\`);
    });
  }

  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}

main();
`,
  },

  // ==========================================================
  // 第 6 章：Webhook 实现
  // ==========================================================
  {
    id: "node-webhook",
    group: "实用场景",
    icon: "🪝",
    title: "Webhook 实现",
    content: `# Webhook 实现

## 什么是 Webhook

Webhook 是一种"反向 API"——当某个事件发生时，服务端主动向预先注册的 URL 发送 HTTP 请求，通知第三方系统。它避免了轮询的开销，实现了实时的系统间通信。

## Webhook vs API

| 特性 | REST API | Webhook |
|------|---------|---------|
| 通信方向 | 客户端主动请求 | 服务端主动推送 |
| 触发方式 | 按需调用 | 事件驱动 |
| 实时性 | 需要轮询 | 实时 |
| 实现复杂度 | 客户端实现 | 服务端实现 |
| 典型场景 | CRUD 操作 | 事件通知 |

## 事件注册与回调

Webhook 的核心是事件-回调的注册机制：

1. 第三方系统注册感兴趣的**事件类型**
2. 提供接收事件的**回调 URL**
3. 当事件发生时，Webhook 系统向回调 URL 发送 HTTP POST
4. 回调 URL 返回 2xx 表示成功，否则触发重试

## 消息签名验证（HMAC）

Webhook 安全性的核心是签名验证，确保请求确实来自可信源：

\`\`\`javascript
const crypto = require('crypto');

// 生成签名
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

// 在 HTTP 头中发送签名
headers['X-Webhook-Signature'] = signature;
\`\`\`

## 重试机制

当回调 URL 不可达或返回非 2xx 时，需要重试：
- 重试策略：立即 → 1分钟 → 5分钟 → 15分钟 → 30分钟
- 最大重试次数：通常 5-10 次
- 重试时携带相同的 \`X-Webhook-ID\` 头

## 幂等性处理

由于网络重试，接收方可能收到重复的 Webhook 请求。接收方应基于 \`X-Webhook-ID\` 实现幂等性：

\`\`\`javascript
// 接收方处理
const webhookId = req.headers['x-webhook-id'];
if (await alreadyProcessed(webhookId)) {
  return res.status(200).send('OK'); // 已处理，直接返回成功
}
await processEvent(payload);
await markAsProcessed(webhookId);
\`\`\`

## Webhook 安全性最佳实践

1. **HTTPS 强制**：所有回调 URL 必须使用 HTTPS
2. **签名验证**：使用 HMAC-SHA256 签名验证
3. **时间戳验证**：防止重放攻击（过期请求拒绝）
4. **IP 白名单**：限制回调 URL 的 IP 段
5. **密钥轮换**：定期更换签名密钥
6. **最小权限**：每个 Webhook 订阅只发送必要数据

## Webhook 的常见应用

- 支付回调（支付宝、微信支付）
- CI/CD 触发（GitHub Webhook 触发部署）
- 消息通知（Slack、钉钉机器人）
- 数据同步（CRM 系统数据变更通知）

## Webhook 实现最佳实践

### 发送方（Provider）
1. **事件设计**：使用标准事件类型命名（如 \`order.created\`、\`payment.succeeded\`）
2. **投递保证**：至少一次投递（at-least-once），通过重试实现
3. **非阻塞投递**：异步投递，不阻塞主业务流程
4. **监控仪表盘**：提供投递成功率、延迟等监控
5. **手动重试**：允许订阅者手动重新投递失败的事件

### 接收方（Consumer）
1. **快速响应**：收到 Webhook 后立即返回 200，然后异步处理
2. **幂等处理**：基于 \`X-Webhook-ID\` 去重
3. **签名验证**：验证 \`X-Webhook-Signature\` 头
4. **顺序处理**：对于同一资源的事件，按顺序处理

## 测试 Webhook

开发 Webhook 时的测试方法：
- **本地隧道**：使用 ngrok 将本地服务暴露到公网
- **Webhook 测试工具**：如 webhook.site 接收和查看请求
- **模拟发送**：编写脚本模拟 Webhook 发送
- **集成测试**：端到端测试整个 Webhook 流程
`,
    code: `// ============================================================
// Webhook 系统实现
// 包括事件注册、HMAC 签名验证、重试队列和幂等性处理
// ============================================================

const crypto = require('crypto');
const { EventEmitter } = require('events');

// -----------------------------------------------------------
// Webhook 订阅
// -----------------------------------------------------------
class WebhookSubscription {
  constructor({ id, event, url, secret, metadata = {} }) {
    // 订阅 ID
    this.id = id;
    // 订阅的事件类型
    this.event = event;
    // 回调 URL
    this.url = url;
    // 签名密钥（HMAC-SHA256）
    this.secret = secret;
    // 元数据（自定义字段）
    this.metadata = metadata;
    // 是否启用
    this.active = true;
    // 创建时间
    this.createdAt = new Date();
    // 统计
    this.stats = {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      lastDelivery: null,
    };
  }
}

// -----------------------------------------------------------
// Webhook 事件
// -----------------------------------------------------------
class WebhookEvent {
  constructor({ type, data, id }) {
    // 事件 ID（用于幂等性）
    this.id = id || \`evt-\${Date.now()}-\${crypto.randomBytes(4).toString('hex')}\`;
    // 事件类型
    this.type = type;
    // 事件数据
    this.data = data;
    // 事件时间
    this.timestamp = Date.now();
  }

  // 生成 HMAC-SHA256 签名
  sign(secret) {
    const payload = JSON.stringify({
      id: this.id,
      type: this.type,
      data: this.data,
      timestamp: this.timestamp,
    });
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  // 生成请求体
  toPayload() {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      data: this.data,
      timestamp: this.timestamp,
    });
  }
}

// -----------------------------------------------------------
// 重试队列项
// -----------------------------------------------------------
class RetryItem {
  constructor(subscription, event, attempt = 0) {
    this.subscription = subscription;
    this.event = event;
    this.attempt = attempt;
    this.nextRetryAt = Date.now() + RetryItem.getRetryDelay(attempt);
  }

  // 计算重试延迟（指数退避）
  static getRetryDelay(attempt) {
    const delays = [1000, 5000, 15000, 30000, 60000]; // 1s, 5s, 15s, 30s, 60s
    return delays[Math.min(attempt, delays.length - 1)];
  }
}

// -----------------------------------------------------------
// 幂等性守卫
// -----------------------------------------------------------
class IdempotencyGuard {
  constructor(ttlMs = 3600000) {
    // 已处理的事件 ID 集合
    this.processed = new Map();
    // TTL（毫秒），默认 1 小时
    this.ttlMs = ttlMs;
    // 清理定时器
    this._cleanupTimer = setInterval(() => this._cleanup(), ttlMs);
  }

  // 检查是否已处理
  isProcessed(eventId) {
    return this.processed.has(eventId);
  }

  // 标记为已处理
  markProcessed(eventId) {
    this.processed.set(eventId, Date.now());
  }

  // 清理过期记录
  _cleanup() {
    const now = Date.now();
    for (const [id, time] of this.processed) {
      if (now - time > this.ttlMs) {
        this.processed.delete(id);
      }
    }
  }

  // 销毁
  destroy() {
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
      this._cleanupTimer = null;
    }
  }
}

// -----------------------------------------------------------
// Webhook 系统
// -----------------------------------------------------------
class WebhookSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxRetries: 5,           // 最大重试次数
      retryEnabled: true,      // 是否启用重试
      signatureHeader: 'X-Webhook-Signature', // 签名头名称
      eventIdHeader: 'X-Webhook-ID',          // 事件 ID 头名称
      timestampHeader: 'X-Webhook-Timestamp', // 时间戳头名称
      deliveryTimeout: 10000,  // 投递超时（毫秒）
      ...options,
    };
    // 订阅列表
    this.subscriptions = new Map();
    // 重试队列
    this.retryQueue = [];
    // 幂等性守卫
    this.idempotencyGuard = new IdempotencyGuard();
    // 重试处理定时器
    this._retryTimer = null;
    // 投递记录
    this.deliveries = [];
  }

  /**
   * 注册 Webhook 订阅
   */
  subscribe({ event, url, secret, metadata }) {
    const id = \`sub-\${crypto.randomBytes(6).toString('hex')}\`;
    const subscription = new WebhookSubscription({
      id,
      event,
      url,
      secret: secret || crypto.randomBytes(32).toString('hex'),
      metadata,
    });
    this.subscriptions.set(id, subscription);
    console.log(\`[Webhook] 订阅已注册: \${id}（事件: \${event}，URL: \${url}）\`);
    this.emit('subscribed', { id, event, url });
    return subscription;
  }

  /**
   * 取消订阅
   */
  unsubscribe(id) {
    const sub = this.subscriptions.get(id);
    if (sub) {
      this.subscriptions.delete(id);
      console.log(\`[Webhook] 订阅已取消: \${id}\`);
      this.emit('unsubscribed', { id });
    }
  }

  /**
   * 触发事件（向所有匹配的订阅发送）
   */
  async trigger(eventType, data) {
    const event = new WebhookEvent({ type: eventType, data });

    // 查找匹配的订阅
    const matchingSubs = [];
    this.subscriptions.forEach((sub) => {
      if (sub.active && sub.event === eventType) {
        matchingSubs.push(sub);
      }
    });

    console.log(
      \`[Webhook] 触发事件 "\${eventType}"（\${event.id}），匹配 \${matchingSubs.length} 个订阅\`
    );

    // 向每个订阅投递
    const results = await Promise.allSettled(
      matchingSubs.map((sub) => this._deliver(sub, event))
    );

    return results;
  }

  /**
   * 投递事件到订阅
   */
  async _deliver(subscription, event) {
    const signature = event.sign(subscription.secret);
    const payload = event.toPayload();

    console.log(\`[投递] 发送到 \${subscription.url}（事件: \${event.type}，ID: \${event.id}）\`);

    // 模拟 HTTP POST 请求
    const result = await this._mockDelivery(subscription, event, signature, payload);

    // 记录投递
    this.deliveries.push({
      subscriptionId: subscription.id,
      eventId: event.id,
      success: result.success,
      statusCode: result.statusCode,
      timestamp: Date.now(),
    });

    if (result.success) {
      subscription.stats.totalDeliveries++;
      subscription.stats.successfulDeliveries++;
      subscription.stats.lastDelivery = new Date();
      console.log(\`[投递] 成功 ✓（\${result.statusCode}）\`);
    } else {
      subscription.stats.totalDeliveries++;
      subscription.stats.failedDeliveries++;
      console.log(\`[投递] 失败 ✗（\${result.statusCode}）\`);

      // 加入重试队列
      if (this.options.retryEnabled) {
        this.retryQueue.push(new RetryItem(subscription, event, 0));
        this._processRetryQueue();
      }
    }

    return result;
  }

  /**
   * 模拟 HTTP 投递
   */
  async _mockDelivery(subscription, event, signature, payload) {
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

    // 模拟 80% 成功率
    const success = Math.random() > 0.2;

    return {
      success,
      statusCode: success ? 200 : 500 + Math.floor(Math.random() * 4),
      headers: {
        [this.options.signatureHeader]: signature,
        [this.options.eventIdHeader]: event.id,
        [this.options.timestampHeader]: event.timestamp.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    };
  }

  /**
   * 处理重试队列
   */
  _processRetryQueue() {
    if (this._retryTimer) return;

    this._retryTimer = setInterval(() => {
      const now = Date.now();
      const readyItems = [];
      const remainingItems = [];

      for (const item of this.retryQueue) {
        if (item.nextRetryAt <= now) {
          readyItems.push(item);
        } else {
          remainingItems.push(item);
        }
      }

      this.retryQueue = remainingItems;

      // 处理就绪的重试项
      for (const item of readyItems) {
        if (item.attempt >= this.options.maxRetries) {
          console.log(
            \`[重试] 事件 \${item.event.id} 重试次数已达上限（\${item.attempt}），放弃投递\`
          );
          this.emit('delivery_failed', {
            subscriptionId: item.subscription.id,
            eventId: item.event.id,
            attempts: item.attempt,
          });
          continue;
        }

        console.log(
          \`[重试] 第 \${item.attempt + 1} 次重试投递事件 \${item.event.id} 到 \${item.subscription.url}\`
        );

        const signature = item.event.sign(item.subscription.secret);
        const payload = item.event.toPayload();

        this._mockDelivery(item.subscription, item.event, signature, payload).then(
          (result) => {
            if (result.success) {
              item.subscription.stats.successfulDeliveries++;
              console.log(\`[重试] 成功 ✓\`);
            } else {
              this.retryQueue.push(
                new RetryItem(item.subscription, item.event, item.attempt + 1)
              );
            }
          }
        );
      }

      if (this.retryQueue.length === 0) {
        clearInterval(this._retryTimer);
        this._retryTimer = null;
      }
    }, 1000);
  }

  /**
   * 验证签名（接收方视角）
   */
  static verifySignature(payload, signature, secret) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    const subs = [];
    this.subscriptions.forEach((sub) => {
      subs.push({
        id: sub.id,
        event: sub.event,
        url: sub.url,
        active: sub.active,
        stats: { ...sub.stats },
      });
    });

    return {
      subscriptions: subs.length,
      retryQueueSize: this.retryQueue.length,
      totalDeliveries: this.deliveries.length,
      subscriptionsDetail: subs,
    };
  }
}

// ============================================================
// 演示运行
// ============================================================
async function main() {
  console.log('========== Webhook 系统演示 ==========\\n');

  const webhook = new WebhookSystem({ maxRetries: 3 });

  // 注册订阅
  webhook.subscribe({
    event: 'order.created',
    url: 'https://api.partner.com/webhooks/orders',
    secret: 'secret_key_12345',
    metadata: { partner: '合作商A' },
  });

  webhook.subscribe({
    event: 'order.created',
    url: 'https://api.partner2.com/callbacks',
    secret: 'secret_key_67890',
    metadata: { partner: '合作商B' },
  });

  webhook.subscribe({
    event: 'user.registered',
    url: 'https://analytics.example.com/webhook',
    secret: 'analytics_secret',
    metadata: { source: 'analytics' },
  });

  // 触发事件
  console.log('\\n--- 触发 order.created 事件 ---');
  await webhook.trigger('order.created', {
    orderId: 'ORD-20240001',
    amount: 299.99,
    currency: 'CNY',
    customer: 'customer@example.com',
  });

  // 触发另一个事件
  console.log('\\n--- 触发 user.registered 事件 ---');
  await webhook.trigger('user.registered', {
    userId: 'USR-1001',
    email: 'newuser@example.com',
    registeredAt: new Date().toISOString(),
  });

  // 演示签名验证
  console.log('\\n--- 签名验证演示 ---');
  const testEvent = new WebhookEvent({
    type: 'test.event',
    data: { message: 'hello' },
  });
  const secret = 'my_secret_key';
  const signature = testEvent.sign(secret);
  const payload = testEvent.toPayload();

  console.log(\`  事件 ID: \${testEvent.id}\`);
  console.log(\`  签名: \${signature}\`);
  console.log(
    \`  正确密钥验证: \${WebhookSystem.verifySignature(payload, signature, secret)}\`
  );
  console.log(
    \`  错误密钥验证: \${WebhookSystem.verifySignature(payload, signature, 'wrong_key')}\`
  );

  // 等待重试处理
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('\\n--- Webhook 系统状态 ---');
  const status = webhook.getStatus();
  console.log(\`  订阅数: \${status.subscriptions}\`);
  console.log(\`  重试队列: \${status.retryQueueSize}\`);
  console.log(\`  总投递数: \${status.totalDeliveries}\`);
  status.subscriptionsDetail.forEach((sub) => {
    console.log(
      \`  \${sub.id}: \${sub.event} -> \${sub.url}（成功: \${sub.stats.successfulDeliveries}, 失败: \${sub.stats.failedDeliveries}）\`
    );
  });

  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}

main();
`,
  },

  // ==========================================================
  // 第 7 章：REST API 设计总结
  // ==========================================================
  {
    id: "node-rest-api",
    group: "实用场景",
    icon: "🔗",
    title: "REST API 设计总结",
    content: `# REST API 设计总结

## RESTful API 设计原则

REST（Representational State Transfer）是一组架构约束，定义了 Web API 的设计规范。良好的 REST API 设计让接口易于理解、使用和维护。

## 资源命名规范

资源命名是 REST API 设计的第一步：

- 使用名词复数形式：\`/users\`、\`/orders\`、\`/products\`
- 使用层级关系表达关联：\`/users/123/orders\`
- 避免动词：\`GET /users\`（而非 \`/getUsers\`）
- 使用小写字母和连字符：\`/order-items\`（而非 \`/orderItems\`）
- 避免文件扩展名：\`/users\`（而非 \`/users.json\`）

## HTTP 方法语义

| 方法 | 操作 | 幂等性 | 安全性 | 示例 |
|------|------|--------|--------|------|
| GET | 获取资源 | 是 | 是 | \`GET /users/123\` |
| POST | 创建资源 | 否 | 否 | \`POST /users\` |
| PUT | 全量更新 | 是 | 否 | \`PUT /users/123\` |
| PATCH | 部分更新 | 否 | 否 | \`PATCH /users/123\` |
| DELETE | 删除资源 | 是 | 否 | \`DELETE /users/123\` |

## HTTP 状态码使用

### 2xx 成功
- \`200 OK\`：请求成功（GET、PUT、PATCH）
- \`201 Created\`：资源创建成功（POST）
- \`204 No Content\`：删除成功（DELETE）

### 3xx 重定向
- \`301 Moved Permanently\`：永久重定向
- \`304 Not Modified\`：缓存命中

### 4xx 客户端错误
- \`400 Bad Request\`：请求参数错误
- \`401 Unauthorized\`：未认证
- \`403 Forbidden\`：无权限
- \`404 Not Found\`：资源不存在
- \`409 Conflict\`：资源冲突
- \`422 Unprocessable Entity\`：验证失败
- \`429 Too Many Requests\`：请求频率超限

### 5xx 服务端错误
- \`500 Internal Server Error\`：服务器内部错误
- \`502 Bad Gateway\`：网关错误
- \`503 Service Unavailable\`：服务不可用

## API 版本控制

常见版本控制策略：
- **URL 路径**：\`/api/v1/users\`（最常用）
- **请求头**：\`Accept: application/vnd.api.v1+json\`
- **查询参数**：\`/api/users?version=1\`

## API 文档（Swagger/OpenAPI）

使用 OpenAPI 规范自动生成 API 文档，确保文档与代码同步。Swagger UI 提供交互式文档界面，方便开发者测试 API。

## 常见反模式

1. **在 URL 中使用动词**：\`POST /createUser\` → 应为 \`POST /users\`
2. **返回不合适的 HTTP 状态码**：错误时返回 200 并在 body 中标记错误
3. **深层嵌套**：\`/users/1/orders/2/items/3/comments\` → 建议不超过 3 层
4. **忽略分页**：返回全量数据导致性能问题
5. **不一致的响应格式**：应当统一响应结构

## 统一响应格式设计

良好的 API 响应应该保持一致的结构：

\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

对于分页数据，还应该包含分页元信息：

\`\`\`json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
\`\`\`

## 过滤、排序和搜索

REST API 通过查询参数支持过滤和排序：
- 过滤：\`GET /users?status=active&role=admin\`
- 排序：\`GET /users?sort=-createdAt,name\`（- 表示降序）
- 搜索：\`GET /users?q=张三\`
- 字段选择：\`GET /users?fields=id,name,email\`

## API 设计清单

1. ✅ 使用名词复数形式命名资源
2. ✅ 正确使用 HTTP 方法
3. ✅ 返回合适的 HTTP 状态码
4. ✅ 统一的响应格式
5. ✅ 支持分页、过滤和排序
6. ✅ API 版本控制
7. ✅ 完善的错误信息
8. ✅ 使用 HTTPS
9. ✅ 认证和授权
10. ✅ 速率限制
`,
    code: `// ============================================================
// REST API 设计最佳实践综合演示
// 包括路由设计、中间件链、错误处理和统一响应
// ============================================================

const { EventEmitter } = require('events');
const crypto = require('crypto');

// -----------------------------------------------------------
// 统一响应格式
// -----------------------------------------------------------
class ApiResponse {
  /**
   * 成功响应
   */
  static success(data, message = '操作成功', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 分页成功响应
   */
  static paginated(items, pagination, message = '查询成功') {
    return {
      success: true,
      statusCode: 200,
      message,
      data: {
        items,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          totalPages: Math.ceil(pagination.total / pagination.pageSize),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 错误响应
   */
  static error(message, statusCode = 400, details = null) {
    const response = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
    if (details) {
      response.details = details;
    }
    return response;
  }

  /**
   * 创建成功响应
   */
  static created(data, message = '资源创建成功') {
    return ApiResponse.success(data, message, 201);
  }
}

// -----------------------------------------------------------
// 自定义错误类
// -----------------------------------------------------------
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = '资源') {
    super(\`\${resource}不存在\`, 404);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends AppError {
  constructor(details) {
    super('请求参数验证失败', 422, details);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未认证或认证已过期') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = '无权限执行此操作') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// -----------------------------------------------------------
// 请求对象模拟
// -----------------------------------------------------------
class Request {
  constructor({ method, url, params = {}, query = {}, body = null, headers = {} }) {
    this.method = method.toUpperCase();
    this.url = url;
    this.params = params;
    this.query = query;
    this.body = body;
    this.headers = headers;
    this.user = null; // 认证后设置
    this.requestId = crypto.randomBytes(8).toString('hex');
  }
}

// -----------------------------------------------------------
// 响应对象模拟
// -----------------------------------------------------------
class Response {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.headers['Content-Type'] = 'application/json';
    this.body = data;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }
}

// -----------------------------------------------------------
// 中间件系统
// -----------------------------------------------------------
class MiddlewareChain {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  async execute(req, res, handler) {
    let index = 0;

    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(req, res, next);
      } else {
        await handler(req, res);
      }
    };

    await next();
  }
}

// -----------------------------------------------------------
// 路由系统
// -----------------------------------------------------------
class Router {
  constructor() {
    this.routes = [];
    this.middlewares = new MiddlewareChain();
  }

  // 注册路由（支持多个 handler，前 N-1 个作为中间件，最后一个为最终处理）
  get(path, ...handlers) { this.routes.push({ method: 'GET', path, handlers }); }
  post(path, ...handlers) { this.routes.push({ method: 'POST', path, handlers }); }
  put(path, ...handlers) { this.routes.push({ method: 'PUT', path, handlers }); }
  patch(path, ...handlers) { this.routes.push({ method: 'PATCH', path, handlers }); }
  delete(path, ...handlers) { this.routes.push({ method: 'DELETE', path, handlers }); }

  // 注册中间件
  use(middleware) {
    this.middlewares.use(middleware);
    return this;
  }

  // 匹配路由并执行
  async handle(req, res) {
    const route = this.routes.find((r) => {
      if (r.method !== req.method) return false;
      return this._matchPath(r.path, req);
    });

    if (!route) {
      res.status(404).json(ApiResponse.error('请求的资源不存在', 404));
      return;
    }

    try {
      // 链式执行路由级 handler：前 N-1 个可调用 next() 传递，最后一个为最终处理
      let routeIdx = 0;
      const routeNext = async () => {
        if (routeIdx < route.handlers.length) {
          const h = route.handlers[routeIdx++];
          await h(req, res, routeNext);
        }
      };
      await this.middlewares.execute(req, res, routeNext);
    } catch (err) {
      this._handleError(err, req, res);
    }
  }

  // 路径匹配
  _matchPath(routePath, req) {
    // 简单路径匹配（支持 :param 参数）
    const routeParts = routePath.split('/');
    const urlParts = req.url.split('?')[0].split('/');

    if (routeParts.length !== urlParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        req.params[routeParts[i].slice(1)] = urlParts[i];
      } else if (routeParts[i] !== urlParts[i]) {
        return false;
      }
    }

    return true;
  }

  // 全局错误处理
  _handleError(err, req, res) {
    console.error(\`[错误] \${req.method} \${req.url}: \${err.message}\`);

    if (err instanceof AppError) {
      res.status(err.statusCode).json(
        ApiResponse.error(err.message, err.statusCode, err.details)
      );
    } else {
      res.status(500).json(
        ApiResponse.error('服务器内部错误', 500)
      );
    }
  }
}

// -----------------------------------------------------------
// 模拟数据存储
// -----------------------------------------------------------
class UserStore {
  constructor() {
    this.users = new Map();
    this._counter = 0;
  }

  findAll({ page = 1, pageSize = 10, status } = {}) {
    let list = Array.from(this.users.values());
    if (status) {
      list = list.filter((u) => u.status === status);
    }
    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);
    return { items, total, page, pageSize };
  }

  findById(id) {
    return this.users.get(id) || null;
  }

  create(data) {
    const id = String(++this._counter);
    const user = {
      id,
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  update(id, data) {
    const user = this.users.get(id);
    if (!user) return null;
    Object.assign(user, data, { updatedAt: new Date().toISOString() });
    return user;
  }

  delete(id) {
    const user = this.users.get(id);
    if (user) {
      user.status = 'deleted';
      user.deletedAt = new Date().toISOString();
    }
    return user;
  }
}

// -----------------------------------------------------------
// 中间件定义
// -----------------------------------------------------------

// 请求日志中间件
function loggerMiddleware(req, res, next) {
  const start = Date.now();
  console.log(\`[日志] \${req.method} \${req.url}（请求ID: \${req.requestId}）\`);
  // 继续处理
  next();
  // 响应后记录
  const duration = Date.now() - start;
  console.log(\`[日志] \${req.method} \${req.url} -> \${res.statusCode}（耗时: \${duration}ms）\`);
}

// 认证中间件
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    throw new UnauthorizedError('缺少认证令牌');
  }

  // 模拟令牌验证
  if (token === 'Bearer admin-token') {
    req.user = { id: '1', role: 'admin', name: '管理员' };
  } else if (token === 'Bearer user-token') {
    req.user = { id: '2', role: 'user', name: '普通用户' };
  } else {
    throw new UnauthorizedError('无效的认证令牌');
  }

  next();
}

// 权限检查中间件工厂
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('需要 ' + roles.join(' 或 ') + ' 权限');
    }
    next();
  };
}

// 参数验证中间件工厂
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body?.[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(\`\${field} 为必填字段\`);
      }
      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors.push(\`\${field} 类型应为 \${rules.type}\`);
      }
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(\`\${field} 长度不能少于 \${rules.minLength} 个字符\`);
      }
    }
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
    next();
  };
}

// -----------------------------------------------------------
// 构建 API 路由
// -----------------------------------------------------------
function buildUserRoutes(userStore) {
  const router = new Router();

  // 全局中间件
  router.use(loggerMiddleware);
  router.use(authMiddleware);

  // GET /api/v1/users —— 获取用户列表（分页）
  router.get('/api/v1/users', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100);
    const status = req.query.status;

    const result = userStore.findAll({ page, pageSize, status });
    res.json(ApiResponse.paginated(result.items, result));
  });

  // GET /api/v1/users/:id —— 获取单个用户
  router.get('/api/v1/users/:id', (req, res) => {
    const user = userStore.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('用户');
    }
    res.json(ApiResponse.success(user));
  });

  // POST /api/v1/users —— 创建用户
  router.post(
    '/api/v1/users',
    (req, res, next) => {
      // 行内验证
      const schema = {
        name: { required: true, type: 'string', minLength: 2 },
        email: { required: true, type: 'string' },
        age: { type: 'number' },
      };
      const errors = [];
      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body?.[field];
        if (rules.required && !value) errors.push(\`\${field} 为必填字段\`);
        if (rules.type && value !== undefined && typeof value !== rules.type) {
          errors.push(\`\${field} 应为 \${rules.type} 类型\`);
        }
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push(\`\${field} 长度不能少于 \${rules.minLength} 个字符\`);
        }
      }
      if (errors.length > 0) {
        throw new ValidationError(errors);
      }
      next();
    },
    (req, res) => {
      const user = userStore.create(req.body);
      res.status(201).json(ApiResponse.created(user));
    }
  );

  // PUT /api/v1/users/:id —— 全量更新用户
  router.put('/api/v1/users/:id', requireRole('admin'), (req, res) => {
    const user = userStore.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('用户');
    }
    const updated = userStore.update(req.params.id, req.body);
    res.json(ApiResponse.success(updated, '用户更新成功'));
  });

  // PATCH /api/v1/users/:id —— 部分更新用户
  router.patch('/api/v1/users/:id', (req, res) => {
    const user = userStore.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('用户');
    }
    const updated = userStore.update(req.params.id, req.body);
    res.json(ApiResponse.success(updated, '用户更新成功'));
  });

  // DELETE /api/v1/users/:id —— 删除用户
  router.delete('/api/v1/users/:id', requireRole('admin'), (req, res) => {
    const user = userStore.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('用户');
    }
    userStore.delete(req.params.id);
    res.status(204).json(ApiResponse.success(null, '用户已删除', 204));
  });

  return router;
}

// ============================================================
// 演示运行
// ============================================================
async function main() {
  console.log('========== REST API 设计演示 ==========\\n');

  const userStore = new UserStore();
  const router = buildUserRoutes(userStore);

  // 辅助函数：模拟请求
  async function simulateRequest(method, url, options = {}) {
    const req = new Request({
      method,
      url,
      query: options.query || {},
      body: options.body || null,
      headers: options.headers || {},
    });
    const res = new Response();

    console.log(\`\\n--- \${method} \${url} ---\`);
    await router.handle(req, res);

    console.log(\`  状态码: \${res.statusCode}\`);
    console.log(\`  响应: \${JSON.stringify(res.body, null, 2)}\`);
    return res;
  }

  // 创建用户（需要认证）
  await simulateRequest('POST', '/api/v1/users', {
    headers: { authorization: 'Bearer admin-token' },
    body: { name: '张三', email: 'zhangsan@example.com', age: 28 },
  });

  await simulateRequest('POST', '/api/v1/users', {
    headers: { authorization: 'Bearer admin-token' },
    body: { name: '李四', email: 'lisi@example.com', age: 35 },
  });

  await simulateRequest('POST', '/api/v1/users', {
    headers: { authorization: 'Bearer admin-token' },
    body: { name: '王五', email: 'wangwu@example.com', age: 22 },
  });

  // 获取用户列表（分页）
  await simulateRequest('GET', '/api/v1/users?page=1&pageSize=2', {
    headers: { authorization: 'Bearer user-token' },
  });

  // 获取单个用户
  await simulateRequest('GET', '/api/v1/users/1', {
    headers: { authorization: 'Bearer user-token' },
  });

  // 更新用户（PATCH）
  await simulateRequest('PATCH', '/api/v1/users/1', {
    headers: { authorization: 'Bearer admin-token' },
    body: { age: 29 },
  });

  // 无认证请求（应返回 401）
  await simulateRequest('GET', '/api/v1/users');

  // 普通用户尝试删除（应返回 403）
  await simulateRequest('DELETE', '/api/v1/users/3', {
    headers: { authorization: 'Bearer user-token' },
  });

  // 管理员删除
  await simulateRequest('DELETE', '/api/v1/users/3', {
    headers: { authorization: 'Bearer admin-token' },
  });

  // 请求不存在的资源
  await simulateRequest('GET', '/api/v1/users/999', {
    headers: { authorization: 'Bearer user-token' },
  });

  // 参数验证失败
  await simulateRequest('POST', '/api/v1/users', {
    headers: { authorization: 'Bearer admin-token' },
    body: { email: 'invalid' },
  });

  console.log('\\n========== 演示结束 ==========');
  process.exit(0);
}

main();
`,
  },

  // ==========================================================
  // 第 8 章：Node.js 最佳实践
  // ==========================================================
  {
    id: "node-best-practices",
    group: "实用场景",
    icon: "✅",
    title: "Node.js 最佳实践",
    content: `# Node.js 最佳实践

## 项目结构组织

良好的项目结构让代码易于维护和扩展：

\`\`\`text
src/
├── config/          # 配置管理
├── controllers/     # 控制器（处理请求）
├── services/        # 业务逻辑层
├── models/          # 数据模型
├── middleware/       # 中间件
├── routes/          # 路由定义
├── utils/           # 工具函数
├── validators/      # 验证逻辑
├── jobs/            # 定时任务
├── events/          # 事件处理
└── app.js           # 应用入口
\`\`\`

## 错误处理策略

### 分类处理

- **可预期错误**：业务逻辑错误（验证失败、资源不存在）→ 返回明确的错误信息给客户端
- **不可预期错误**：系统错误（数据库连接失败）→ 记录日志，返回通用错误信息
- **未捕获异常**：使用 \`process.on('uncaughtException')\` 兜底，记录日志后优雅退出

### 错误处理模式

\`\`\`javascript
// 全局错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(422).json({ error: err.message });
  }
  logger.error('Unexpected error', err);
  res.status(500).json({ error: 'Internal Server Error' });
});
\`\`\`

## 配置管理

- 使用环境变量区分环境（development / staging / production）
- 敏感信息（密钥、数据库密码）通过环境变量注入，不硬编码
- 使用 \`dotenv\` 加载 \`.env\` 文件（开发环境）
- 配置验证：启动时检查必需配置项是否存在

## 日志规范

- **日志级别**：error > warn > info > debug
- **结构化日志**：使用 JSON 格式，便于日志系统解析
- **关键字段**：timestamp、level、message、requestId、userId
- **敏感信息脱敏**：不要在日志中记录密码、令牌等
- **生产环境**：日志输出到 stdout/stderr，由容器/日志系统收集

## 安全实践

1. **依赖安全**：定期运行 \`npm audit\`，及时更新有漏洞的依赖
2. **HTTP 安全头**：设置 Helmet 中间件（CSP、HSTS、X-Frame-Options）
3. **输入验证**：所有用户输入必须验证和净化
4. **速率限制**：防止 API 滥用和 DDoS 攻击
5. **CORS 配置**：明确指定允许的源，不使用通配符 \`*\`
6. **SQL/NoSQL 注入防护**：使用参数化查询或 ORM

## 性能优化

1. **使用集群**：利用多核 CPU（cluster 模块或 PM2）
2. **缓存策略**：使用 Redis 缓存热点数据，减少数据库查询
3. **数据库查询优化**：创建合适的索引，避免 N+1 查询
4. **流式处理**：大数据量使用流而非一次性加载
5. **压缩响应**：使用 gzip/brotli 压缩 HTTP 响应

## 监控告警

- 关键指标：QPS、响应时间（P50/P95/P99）、错误率、内存/CPU 使用率
- 健康检查端点：\`GET /health\` 返回服务状态
- 优雅关闭：捕获 SIGTERM 信号，等待进行中的请求完成后再退出

## 代码质量

### 代码规范
- 使用 ESLint + Prettier 统一代码风格
- 遵循一致的命名规范（camelCase、PascalCase）
- 函数保持简短，单一职责

### 测试策略
- **单元测试**：使用 Jest 或 Mocha 测试核心逻辑
- **集成测试**：测试中间件、路由和数据库交互
- **端到端测试**：测试完整的用户流程
- 目标覆盖率：核心业务逻辑 80%+ 覆盖率

### 代码审查
- 每个 PR 至少一人审查
- 使用 PR 模板，包含变更说明和测试计划
- 自动化检查：lint、test、类型检查

## CI/CD 流程

\`\`\`text
代码提交 → 运行测试 → 构建镜像 → 部署到测试环境
    → 自动化测试 → 部署到生产环境（分批发布）
\`\`\`

- 使用 GitHub Actions / GitLab CI 自动化
- 蓝绿部署或金丝雀发布降低风险
- 部署后自动回滚机制

## 依赖管理

- 锁定依赖版本（package-lock.json / yarn.lock）
- 定期更新依赖：\`npm outdated\` 和 \`npm update\`
- 使用 \`npm audit\` 检查安全漏洞
- 区分 dependencies 和 devDependencies
- 避免引入过度庞大的依赖包

## 部署策略

| 策略 | 优点 | 缺点 |
|------|------|------|
| 蓝绿部署 | 即时回滚、零停机 | 需要双倍资源 |
| 滚动更新 | 资源利用率高 | 回滚较慢 |
| 金丝雀发布 | 风险可控 | 实现复杂 |
| A/B 测试 | 数据驱动决策 | 需要流量管理 |
`,
    code: `// ============================================================
// Node.js 最佳实践综合演示
// 包括错误处理、配置管理、日志、性能监控和优雅关闭
// ============================================================

const { EventEmitter } = require('events');
const os = require('os');
const crypto = require('crypto');

// -----------------------------------------------------------
// 配置管理
// -----------------------------------------------------------
class ConfigManager {
  constructor() {
    this._config = new Map();
    this._requiredKeys = [];
    this._schema = {};
  }

  /**
   * 定义配置项
   */
  define(key, defaultValue, options = {}) {
    const { required, validate, sensitive } = options;

    if (required) {
      this._requiredKeys.push(key);
    }

    this._schema[key] = { defaultValue, validate, sensitive };

    // 从环境变量读取
    const envValue = process.env[key];
    const value = envValue !== undefined ? envValue : defaultValue;

    if (value !== undefined) {
      this._config.set(key, value);
    }
  }

  /**
   * 获取配置值
   */
  get(key) {
    if (!this._config.has(key)) {
      const schema = this._schema[key];
      if (schema?.defaultValue !== undefined) {
        return schema.defaultValue;
      }
      throw new Error(\`配置项 "\${key}" 未设置\`);
    }
    return this._config.get(key);
  }

  /**
   * 验证所有必需配置
   */
  validate() {
    const errors = [];

    for (const key of this._requiredKeys) {
      if (!this._config.has(key) || this._config.get(key) === undefined) {
        errors.push(\`缺少必需配置项: \${key}\`);
      }
    }

    for (const [key, schema] of Object.entries(this._schema)) {
      if (schema.validate && this._config.has(key)) {
        try {
          schema.validate(this._config.get(key));
        } catch (e) {
          errors.push(\`配置项 \${key} 验证失败: \${e.message}\`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(\`配置验证失败:\\n\${errors.map((e) => '  - ' + e).join('\\n')}\`);
    }

    return true;
  }

  /**
   * 打印配置（隐藏敏感信息）
   */
  toString() {
    const entries = [];
    for (const [key, value] of this._config) {
      const schema = this._schema[key];
      const display = schema?.sensitive ? '***' : value;
      entries.push(\`  \${key}: \${display}\`);
    }
    return entries.join('\\n');
  }
}

// -----------------------------------------------------------
// 日志系统
// -----------------------------------------------------------
class Logger {
  constructor(options = {}) {
    this.options = {
      level: options.level || 'info',
      format: options.format || 'json',
      ...options,
    };

    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
  }

  error(message, meta = {}) { this._log('error', message, meta); }
  warn(message, meta = {}) { this._log('warn', message, meta); }
  info(message, meta = {}) { this._log('info', message, meta); }
  debug(message, meta = {}) { this._log('debug', message, meta); }

  _log(level, message, meta) {
    if (this.levels[level] > this.levels[this.options.level]) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...this._sanitize(meta),
    };

    if (this.options.format === 'json') {
      console.log(JSON.stringify(entry));
    } else {
      const metaStr = Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';
      console.log(\`[\${entry.timestamp}] [\${entry.level}] \${message}\${metaStr}\`);
    }

    this.emit?.('log', entry);
  }

  _sanitize(meta) {
    // 脱敏：移除密码、token 等敏感字段
    const sanitized = { ...meta };
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '***';
      }
    }
    return sanitized;
  }
}

// -----------------------------------------------------------
// 性能监控
// -----------------------------------------------------------
class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      startTime: Date.now(),
    };
    // 响应时间分桶
    this.buckets = { fast: 0, normal: 0, slow: 0, critical: 0 };
  }

  /**
   * 记录一次请求
   */
  recordRequest(duration, success = true) {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += duration;
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, duration);
    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, duration);

    if (!success) {
      this.metrics.errorCount++;
    }

    // 分桶统计
    if (duration < 100) this.buckets.fast++;
    else if (duration < 500) this.buckets.normal++;
    else if (duration < 2000) this.buckets.slow++;
    else this.buckets.critical++;
  }

  /**
   * 获取监控报告
   */
  getReport() {
    const uptime = Date.now() - this.metrics.startTime;
    const count = this.metrics.requestCount || 1;

    return {
      uptime: \`\${Math.floor(uptime / 1000)}s\`,
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      errorRate: \`\${((this.metrics.errorCount / count) * 100).toFixed(2)}%\`,
      avgResponseTime: \`\${(this.metrics.totalResponseTime / count).toFixed(2)}ms\`,
      maxResponseTime: \`\${this.metrics.maxResponseTime}ms\`,
      minResponseTime: this.metrics.minResponseTime === Infinity ? 'N/A' : \`\${this.metrics.minResponseTime}ms\`,
      responseTimeDistribution: {
        '<100ms': this.buckets.fast,
        '100-500ms': this.buckets.normal,
        '500ms-2s': this.buckets.slow,
        '>2s': this.buckets.critical,
      },
      memory: {
        heapUsed: \`\${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`,
        heapTotal: \`\${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB\`,
        rss: \`\${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\`,
      },
      cpu: {
        loadAvg: os.loadavg().map((v) => v.toFixed(2)),
        cpus: os.cpus().length,
      },
    };
  }
}

// -----------------------------------------------------------
// 应用错误处理
// -----------------------------------------------------------
class AppError extends Error {
  constructor(message, code, httpStatus = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.isOperational = isOperational; // 区分可预期错误和系统错误
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 'VALIDATION_ERROR', 422);
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(\`\${resource} 不存在\`, 'NOT_FOUND', 404);
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 'DATABASE_ERROR', 500, false); // 非操作性错误
  }
}

// -----------------------------------------------------------
// 全局错误处理器
// -----------------------------------------------------------
class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // 未捕获的 Promise 拒绝
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('未处理的 Promise 拒绝', {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
      // 生产环境不应该让进程崩溃，但应记录并告警
    });

    // 未捕获的异常（致命错误，应优雅退出）
    process.on('uncaughtException', (error) => {
      this.logger.error('未捕获的异常 - 进程即将退出', {
        error: error.message,
        stack: error.stack,
      });
      // 给日志系统一点时间刷新
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }

  /**
   * 处理应用错误
   */
  handleError(error, context = {}) {
    if (error instanceof AppError && error.isOperational) {
      // 可预期错误：记录 warn 级别
      this.logger.warn(\`业务错误: \${error.message}\`, {
        code: error.code,
        httpStatus: error.httpStatus,
        ...context,
      });
      return {
        success: false,
        code: error.code,
        message: error.message,
        httpStatus: error.httpStatus,
      };
    }

    // 不可预期错误：记录 error 级别
    this.logger.error(\`系统错误: \${error.message}\`, {
      stack: error.stack,
      ...context,
    });
    return {
      success: false,
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误，请稍后重试',
      httpStatus: 500,
    };
  }
}

// -----------------------------------------------------------
// 优雅关闭
// -----------------------------------------------------------
class GracefulShutdown {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 30000, // 30 秒超时强制退出
      ...options,
    };
    this.handlers = [];
    this.shuttingDown = false;
  }

  /**
   * 注册关闭处理器
   */
  onShutdown(handler) {
    this.handlers.push(handler);
  }

  /**
   * 启动信号监听
   */
  listen(logger) {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        if (this.shuttingDown) {
          logger.warn(\`收到第二次 \${signal} 信号，强制退出\`);
          process.exit(1);
        }

        this.shuttingDown = true;
        logger.info(\`收到 \${signal} 信号，开始优雅关闭...\`);

        // 设置超时强制退出
        const forceExit = setTimeout(() => {
          logger.error('优雅关闭超时，强制退出');
          process.exit(1);
        }, this.options.timeout);

        try {
          // 依次执行关闭处理器
          for (const handler of this.handlers) {
            await handler();
          }
          logger.info('所有资源已清理，进程退出');
          clearTimeout(forceExit);
          process.exit(0);
        } catch (err) {
          logger.error('关闭过程中出错', { error: err.message });
          clearTimeout(forceExit);
          process.exit(1);
        }
      });
    });
  }
}

// -----------------------------------------------------------
// 健康检查
// -----------------------------------------------------------
class HealthChecker {
  constructor() {
    this.checks = new Map();
  }

  /**
   * 注册健康检查项
   */
  register(name, checkFn) {
    this.checks.set(name, checkFn);
  }

  /**
   * 执行所有健康检查
   */
  async check() {
    const results = {};
    let healthy = true;

    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        results[name] = { status: 'healthy', ...result };
      } catch (err) {
        results[name] = { status: 'unhealthy', error: err.message };
        healthy = false;
      }
    }

    return {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: results,
    };
  }
}

// ============================================================
// 演示运行
// ============================================================
async function main() {
  console.log('========== Node.js 最佳实践演示 ==========\\n');

  // 1. 配置管理
  console.log('--- 1. 配置管理 ---');
  const config = new ConfigManager();
  config.define('APP_NAME', 'my-app', { required: true });
  config.define('APP_PORT', '3000', { required: true });
  config.define('DB_HOST', 'localhost', { required: true });
  config.define('DB_PASSWORD', undefined, { required: true, sensitive: true });
  config.define('LOG_LEVEL', 'info');
  config.define('NODE_ENV', 'development');

  // 设置环境变量模拟
  process.env.DB_PASSWORD = 'my-secret-password';
  process.env.NODE_ENV = 'production';

  // 重新定义 DB_PASSWORD 以读取环境变量
  config.define('DB_PASSWORD', undefined, { required: true, sensitive: true });

  try {
    config.validate();
    console.log('配置验证通过:');
    console.log(config.toString());
  } catch (e) {
    console.log('配置验证失败:', e.message);
  }

  // 2. 日志系统
  console.log('\\n--- 2. 日志系统 ---');
  const logger = new Logger({ level: 'debug', format: 'text' });
  logger.info('应用启动', { appName: config.get('APP_NAME'), env: config.get('NODE_ENV') });
  logger.warn('磁盘空间不足', { diskUsage: '92%', path: '/data' });
  logger.error('数据库连接失败', { host: config.get('DB_HOST'), password: 'secret123' });
  logger.debug('请求处理详情', { requestId: 'req-001', duration: 45 });

  // 3. 性能监控
  console.log('\\n--- 3. 性能监控 ---');
  const monitor = new PerformanceMonitor();

  // 模拟请求
  for (let i = 0; i < 50; i++) {
    const duration = Math.floor(Math.random() * 2500) + 10;
    const success = Math.random() > 0.1;
    monitor.recordRequest(duration, success);
  }

  console.log(JSON.stringify(monitor.getReport(), null, 2));

  // 4. 错误处理
  console.log('\\n--- 4. 错误处理 ---');
  const errorHandler = new ErrorHandler(logger);

  // 业务错误
  const notFoundResult = errorHandler.handleError(
    new NotFoundError('用户'),
    { requestId: 'req-001', userId: '999' }
  );
  console.log('业务错误响应:', JSON.stringify(notFoundResult, null, 2));

  // 系统错误
  const dbErrorResult = errorHandler.handleError(
    new DatabaseError('连接超时'),
    { requestId: 'req-002' }
  );
  console.log('系统错误响应:', JSON.stringify(dbErrorResult, null, 2));

  // 5. 健康检查
  console.log('\\n--- 5. 健康检查 ---');
  const healthChecker = new HealthChecker();

  healthChecker.register('database', async () => {
    return { connected: true, latency: '12ms' };
  });
  healthChecker.register('redis', async () => {
    return { connected: true, usedMemory: '256MB' };
  });
  healthChecker.register('disk', async () => {
    return { free: '50GB', total: '100GB', usage: '50%' };
  });

  const health = await healthChecker.check();
  console.log(JSON.stringify(health, null, 2));

  // 6. 优雅关闭
  console.log('\\n--- 6. 优雅关闭（已注册，未触发） ---');
  const shutdown = new GracefulShutdown({ timeout: 10000 });
  shutdown.onShutdown(async () => {
    console.log('  [关闭] 停止接收新请求...');
  });
  shutdown.onShutdown(async () => {
    console.log('  [关闭] 关闭数据库连接...');
  });
  shutdown.onShutdown(async () => {
    console.log('  [关闭] 刷新日志缓冲区...');
  });
  shutdown.listen(logger);
  console.log('已注册 3 个关闭处理器，等待 SIGTERM/SIGINT 信号');

  console.log('\\n========== 演示结束 ==========');
  setTimeout(() => process.exit(0), 1000);
}

main();
`,
  },
];

export default chapters;