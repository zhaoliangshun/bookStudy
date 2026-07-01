// =============================================================
// Java Web 应用开发实战教程 —— 第十三批章节（WebSocket 实时通信组，共 4 章）
// =============================================================

export const chapters = [
  {
    id: "jw-49",
    group: "WebSocket 实时通信",
    icon: "⚡",
    title: "WebSocket 协议",
    content: `# WebSocket 协议

## 概念讲解

WebSocket 是 HTML5 规范中提出的在单个 TCP 连接上进行全双工通信的网络协议，标准化文档为 RFC 6455。它解决了传统 HTTP 协议在实时通信场景下的低效问题，使服务器能够主动向客户端推送数据，而不需要客户端反复轮询。

### WebSocket vs HTTP

HTTP 是一种请求-响应模型协议：客户端发起请求，服务器被动响应，每次请求完成后连接即关闭（HTTP/1.1 默认 keep-alive 复用连接，但仍是请求驱动）。这种方式存在几个固有缺陷：

- **无法主动推送**：服务器有新数据时，不能主动通知客户端，只能等客户端来问。
- **轮询浪费资源**：客户端为获取实时数据只能定时轮询，绝大多数请求是"空跑"。
- **头部开销大**：每次 HTTP 请求都携带完整请求头（Cookie、User-Agent 等），即使只传 1 字节数据，头部可能就有数百字节。
- **延迟高**：轮询间隔越长，消息送达越慢；间隔越短，资源浪费越严重。

WebSocket 与之相比有以下根本性差异：

- **全双工通信**：建立连接后，客户端和服务器可同时双向收发数据，互不阻塞。
- **持久连接**：一次握手建立后连接长期保持，直到任意一方主动关闭。
- **低延迟**：握手只需一次，后续数据帧头部极小（最小 2 字节），消息几乎即时送达。
- **协议独立**：WebSocket 没有绑定 HTTP 语义，可在其上承载任意应用层协议（如 STOMP）。

### WebSocket 握手过程

WebSocket 连接的建立借助 HTTP/1.1 的 Upgrade 机制完成，握手阶段仍走 HTTP，握手成功后协议升级为 WebSocket。

客户端发起握手请求（携带 Upgrade 头）：

\`\`\`http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
\`\`\`

服务器响应 101 状态码表示协议切换成功：

\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

服务器计算 \`Sec-WebSocket-Accept\` 的方式：将客户端传来的 \`Sec-WebSocket-Key\` 拼上固定 GUID（258EAFA5-E914-47DA-95CA-C5AB0DC85B11），做 SHA-1 摘要后做 Base64 编码。这个魔术串的作用是防止普通 HTTP 服务器误把 WebSocket 请求当作普通 HTTP 处理。

### 数据帧格式

握手成功后，双方通过"数据帧"（Frame）传递消息。一个 WebSocket 帧结构如下（RFC 6455 定义）：

- **FIN（1 bit）**：是否为消息的最后一帧。WebSocket 支持把一条大消息分成多个帧传输。
- **RSV1/RSV2/RSV3（各 1 bit）**：保留位，用于扩展（如压缩）。
- **Opcode（4 bit）**：帧类型。0x1 文本帧、0x2 二进制帧、0x8 关闭帧、0x9 Ping 帧、0xA Pong 帧。
- **MASK（1 bit）**：客户端发给服务器的帧必须掩码，服务器发给客户端的帧不掩码。
- **Payload Length（7/16/64 bit）**：负载数据长度。0-125 用 7 位，126 表示后 16 位是长度，127 表示后 64 位是长度。
- **Masking Key（32 bit）**：掩码密钥，仅当 MASK=1 时存在。
- **Payload Data**：实际数据。

Ping/Pong 帧用于心跳检测，对方收到 Ping 必须尽快回 Pong，借此判断连接是否健康。

### 心跳机制 ping/pong

WebSocket 连接长时间不传数据时，可能被中间网络设备（如 NAT、代理）静默断开。心跳机制定期发送 Ping 帧探测连接活性，对端回 Pong 帧。常见心跳间隔 30-60 秒。如果多次未收到 Pong，认为连接已死，主动关闭并触发重连。

### 连接生命周期

WebSocket 连接经历以下阶段：

1. **建立**：客户端发起握手，服务器响应 101。
2. **OPEN**：连接就绪，可双向收发数据帧。
3. **CLOSING**：任意一方发送 Close 帧（Opcode 0x8），进入关闭中状态。
4. **CLOSED**：握手完成关闭，底层 TCP 连接释放。

关闭帧可携带状态码（2 字节）和原因说明。常见状态码：1000 正常关闭、1001 端点离开、1002 协议错误、1011 服务器内部错误。

### 适用场景

WebSocket 适合需要服务器主动推送或低延迟双向通信的场景：

- **即时通讯（IM）**：聊天、私信、群消息。
- **实时推送**：股票行情、比赛比分、新闻推送、订单状态。
- **协同编辑**：多人在线文档、白板、设计协作。
- **实时游戏**：联机对战、弹幕、互动小游戏。
- **实时监控**：服务器监控大盘、IoT 设备状态推送。

不适合 WebSocket 的场景：偶尔拉取数据、强请求-响应语义的接口（REST 更合适）、对兼容性要求极高的旧浏览器。

## 设计原则

### 原则一：握手复用 HTTP 基础设施

WebSocket 借用 HTTP 的 80/443 端口和 Upgrade 头，能穿透大多数防火墙和反向代理。这使 WebSocket 在生产部署上不需要额外开端口，降低运维成本。

### 原则二：帧最小化头部

WebSocket 帧头部最小只有 2 字节，相比 HTTP 每次数百字节头部，长期实时通信时带宽节省显著。设计消息时应尽量拆成小帧高频发送，而不是攒大批量低频发。

### 原则三：必须有心跳保活

长连接必然面临"半开连接"问题：一端崩溃后 TCP 不一定能立即感知。心跳是发现死连接的唯一可靠手段，绝不能省略。

### 原则四：消息边界由协议保证

WebSocket 是消息流而非字节流。每条消息有明确边界（FIN=1 表示消息结束），上层应用无需自己分包。设计时应让一条业务消息对应一个 WebSocket 消息，而不是靠特殊分隔符。

### 原则五：注意安全：Origin 校验与鉴权

握手是普通 HTTP，必须校验 Origin 头防止 CSRF 式的 WebSocket 跨站攻击。鉴权应在握手阶段完成（用 Cookie 或 Header 携带 Token），握手后再校验就晚了。

## 使用场景

### 场景一：即时通讯聊天室

用户上线后建立 WebSocket 长连接，发送消息走连接上行通道，接收消息走下行通道。在线用户列表通过连接建立/断开事件维护。消息广播给同房间所有人。

### 场景二：股票行情推送

行情服务订阅交易所数据，通过 WebSocket 推给前端。客户端只发一次订阅请求，后续行情数据持续推送。相比轮询，延迟从秒级降到毫秒级，带宽节省 90%+。

### 场景三：协同编辑文档

多人编辑同一文档时，每次按键产生的变更通过 WebSocket 广播给其他协作者，对方实时看到光标和内容变化。冲突解决靠 OT 或 CRDT 算法。

### 场景四：服务器监控大盘

Prometheus 采集的指标通过 WebSocket 推送到 Grafana 自定义面板，实现毫秒级实时刷新。

## 代码逐行讲解

下面用一个完整的 Java WebSocket 服务端示例（基于 JSR-356 标准 API）演示握手、消息收发、心跳：

\`\`\`java
package com.example.websocket;

import jakarta.websocket.*;        // JSR-356 标准 API
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

// @ServerEndpoint 注解声明这是一个 WebSocket 端点
// 路径 /chat/{username} 中的 {username} 是路径参数，可通过 @PathParam 注入
@ServerEndpoint("/chat/{username}")
public class ChatEndpoint {

    // 所有在线会话集合，线程安全
    private static final Set<Session> SESSIONS = new CopyOnWriteArraySet<>();

    private String username;

    // @OnOpen 在握手成功后立即调用，session 代表这条连接
    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        this.username = username;
        SESSIONS.add(session);                 // 加入在线集合
        System.out.println(username + " 上线，当前在线：" + SESSIONS.size());
        // 设置空闲超时：60 秒无消息则触发 onClose，避免僵尸连接
        session.setMaxIdleTimeout(60_000);
        broadcast("系统", username + " 加入了聊天");
    }

    // @OnMessage 接收到文本消息时调用
    @OnMessage
    public void onMessage(String message, Session session) {
        // 简单广播：把消息发给所有在线会话
        broadcast(username, message);
    }

    // @OnClose 连接关闭时调用
    @OnClose
    public void onClose(Session session) {
        SESSIONS.remove(session);
        broadcast("系统", username + " 离开了聊天");
    }

    // @OnError 出现异常时调用
    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
        try { session.close(); } catch (IOException ignored) {}
    }

    // 广播给所有在线会话
    private void broadcast(String from, String text) {
        String msg = "[" + from + "]: " + text;
        for (Session s : SESSIONS) {
            if (s.isOpen()) {
                // 异步发送避免阻塞当前线程
                s.getAsyncRemote().sendText(msg);
            }
        }
    }
}
\`\`\`

代码逐行解释：

- \`@ServerEndpoint("/chat/{username}")\`：JSR-356 注解，声明类为 WebSocket 端点。路径中 \`{username}\` 是 URI 模板参数。
- \`Set<Session> SESSIONS\`：用 \`CopyOnWriteArraySet\` 保证并发安全，因为多用户同时上线/下线会触发并发修改。
- \`@OnOpen\`：握手成功后被容器调用，\`Session\` 参数代表这条 WebSocket 连接，\`@PathParam\` 取出路径参数。
- \`session.setMaxIdleTimeout(60_000)\`：设置空闲超时，60 秒内无任何消息就关闭。这是兜底机制，正常应靠心跳维护。
- \`s.getAsyncRemote().sendText(msg)\`：异步发送文本。同步 \`getBasicRemote()\` 会阻塞，广播场景必须用异步避免一个慢客户端拖累所有人。
- \`@OnClose\` / \`@OnError\`：分别在正常关闭和异常时触发，注意清理 \`SESSIONS\` 集合，避免内存泄漏。

下面是前端的 WebSocket 客户端代码：

\`\`\`javascript
// 创建 WebSocket 连接，URL 必须是 ws:// 或 wss://（TLS 加密）
const socket = new WebSocket("ws://localhost:8080/chat/alice");

// 连接建立后触发
socket.onopen = () => {
    console.log("连接已建立");
    socket.send("大家好");
};

// 收到消息时触发，event.data 是消息内容
socket.onmessage = (event) => {
    console.log("收到：" + event.data);
};

// 连接关闭时触发，code 是关闭码，reason 是原因
socket.onclose = (event) => {
    console.log("连接关闭，code=" + event.code + "，reason=" + event.reason);
};

// 心跳保活：每 30 秒发一次自定义心跳消息
setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("PING");   // 业务自定义心跳，也可用浏览器原生 ping
    }
}, 30000);
\`\`\`

代码逐行解释：

- \`new WebSocket(url)\`：浏览器原生 API，立即开始握手。
- \`onopen / onmessage / onclose\`：回调式 API，分别对应连接生命周期事件。
- \`socket.send(data)\`：发送文本或二进制数据。
- \`readyState\`：连接状态枚举（CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3），发心跳前必须判断是 OPEN 才能发。

## 对比（表格形式）

| 维度 | HTTP 轮询 | HTTP 长轮询 | SSE（Server-Sent Events） | WebSocket |
| --- | --- | --- | --- | --- |
| 通信方向 | 单向（客户端发起） | 单向 | 单向（服务器→客户端） | 全双工双向 |
| 连接方式 | 短连接 | 长连接挂起 | 长连接 | 持久长连接 |
| 协议 | HTTP | HTTP | HTTP | WebSocket（握手用 HTTP） |
| 实时性 | 差（依赖轮询间隔） | 中（请求挂起） | 好 | 极好（毫秒级） |
| 头部开销 | 大（每次几百字节） | 大 | 小（首次后流式） | 极小（2 字节） |
| 服务器推送 | 不支持 | 半支持 | 支持 | 支持 |
| 二进制数据 | 支持 | 支持 | 不支持（仅文本） | 支持 |
| 浏览器兼容 | 全部 | 全部 | 现代浏览器 | 现代浏览器 |
| 断线重连 | 自动 | 需手动 | 浏览器自动 | 需手动 |
| 适用场景 | 普通接口 | 早期 IM | 通知/行情推送 | IM/协同/双向交互 |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 连接 30 秒后被自动断开 | 服务器或反向代理（Nginx）有默认空闲超时 | 配置 \`proxy_read_timeout\` 同时启用应用层心跳 |
| Nginx 反向代理后握手失败 | Nginx 默认不支持 Upgrade 头透传 | 加 \`proxy_set_header Upgrade \$http_upgrade\` 和 \`Connection "upgrade"\` |
| 心跳漏发后客户端无感知 | 浏览器 onclose 不一定立即触发 | 客户端定时心跳，超时未收 Pong 则手动重连 |
| 集群部署时广播丢失 | 多节点间 Session 不共享 | 用 Redis Pub/Sub 或 MQ 在节点间转发广播消息 |
| 内存泄漏：SESSIONS 集合无限增长 | onClose 未触发（如客户端断电） | 定期扫描过期会话 + 设置 maxIdleTimeout |
| 鉴权失效：任何人都能连上 | 仅靠 URL 携带 username 没校验 | 握手阶段用 Cookie/Token 校验，使用 HandshakeInterceptor |
| 跨域攻击：恶意页面建连接 | 未校验 Origin | 服务端校验 Origin 头白名单 |
| 大消息分片卡顿 | 单条消息过大占满发送缓冲 | 应用层分片，控制单帧大小 |
| 二进制传输乱码 | 误用文本帧收二进制 | 区分 TextMessage 与 BinaryMessage，对应处理 |
| Tomcat Worker 线程被占满 | 误以为 WebSocket 占用请求线程 | WebSocket 是非阻塞的，不占请求线程，但别在 onMessage 阻塞 |
`,
  },
  {
    id: "jw-50",
    group: "WebSocket 实时通信",
    icon: "⚡",
    title: "Spring WebSocket",
    content: `# Spring WebSocket

## 概念讲解

Spring 框架对 WebSocket 提供了完整支持，位于 \`spring-websocket\` 模块。相比裸 JSR-356（\`@ServerEndpoint\`），Spring WebSocket 抽象更高级，能无缝集成 Spring 容器、依赖注入、拦截器、消息转换器，更贴近 Spring 应用开发者的使用习惯。

### Spring WebSocket 抽象核心接口

Spring 把 WebSocket 抽象为几个核心接口：

- **\`WebSocketHandler\`**：处理 WebSocket 生命周期的核心接口，定义 \`afterConnectionEstablished\`、\`handleMessage\`、\`handleTransportError\`、\`afterConnectionClosed\`、\`supportsPartialMessages\` 方法。
- **\`WebSocketSession\`**：代表一条已建立的 WebSocket 连接，提供 \`sendMessage\`、\`close\`、\`getAttributes\`、\`getPrincipal\` 等。
- **\`WebSocketConfigurer\`**：注册端点、配置拦截器、允许的源。
- **\`HandshakeInterceptor\`**：握手阶段拦截器，可在握手前做鉴权、写入属性到 session。
- **\`WebSocketMessage\`**：消息抽象，有 \`TextMessage\`、\`BinaryMessage\`、\`PingMessage\`、\`PongMessage\` 四种。

### WebSocketHandler 接口

\`WebSocketHandler\` 是处理连接的核心，但接口太细碎，实际多用 \`TextWebSocketHandler\` 或 \`AbstractWebSocketHandler\` 这两个适配类：

\`\`\`java
public class MyHandler extends TextWebSocketHandler {
    // 连接建立后
    @Override
    public void afterConnectionEstablished(WebSocketSession session) { }
    // 收到文本消息
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) { }
    // 收到二进制消息（AbstractWebSocketHandler 才有）
    // @Override
    // public void handleBinaryMessage(WebSocketSession session, BinaryMessage message) { }
    // 连接关闭
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) { }
}
\`\`\`

\`TextWebSocketHandler\` 默认拒绝二进制消息（收到会关闭连接），如果同时需要文本和二进制，继承 \`AbstractWebSocketHandler\` 并重写两个 \`handle*Message\`。

### 配置 WebSocketConfigurer

通过实现 \`WebSocketConfigurer\` 注册 Handler、配置拦截器、跨域：

\`\`\`java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MyHandler(), "/ws/chat")
                .addInterceptors(new AuthHandshakeInterceptor())
                .setAllowedOrigins("https://example.com");
    }
}
\`\`\`

\`@EnableWebSocket\` 开启 WebSocket 支持，\`setAllowedOrigins\` 配置允许的 Origin（跨域），默认是同源。

### 握手拦截器 HandshakeInterceptor

握手阶段（HTTP 升级前）是做鉴权的最佳时机，因为此时还是 HTTP 请求，能取到 Cookie、Header、Principal：

\`\`\`java
public class AuthHandshakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // 从 HTTP 头取 Token
        String token = request.getHeaders().getFirst("Authorization");
        if (token == null || !validateToken(token)) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;   // 拒绝握手
        }
        // 把用户信息塞进 attributes，后续 WebSocketSession 可读
        attributes.put("userId", parseUserId(token));
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // 握手完成后的回调，通常留空
    }
}
\`\`\`

\`attributes\` 这个 Map 是关键：写入的内容会带到 \`WebSocketSession.getAttributes()\`，可在 Handler 中读取，省去每次解析 Token。

### 消息处理：TextMessage / BinaryMessage

\`WebSocketSession.sendMessage\` 接收 \`WebSocketMessage\` 接口的实例：

\`\`\`java
session.sendMessage(new TextMessage("hello"));              // 文本
session.sendMessage(new BinaryMessage(byteBuffer));         // 二进制
session.sendMessage(new PingMessage());                    // 心跳
\`\`\`

注意 \`sendMessage\` 不是线程安全的，多线程同时给同一 session 发消息会出问题。要么加锁，要么用 \`ConcurrentWebSocketSessionDecorator\` 包装：

\`\`\`java
WebSocketSession safe = new ConcurrentWebSocketSessionDecorator(session, 5000, 65536);
// 之后用 safe 发送，内部加锁 + 缓冲队列
\`\`\`

参数：5000ms 发送超时、65536 字节缓冲上限，超缓冲会关闭连接，避免慢客户端拖垮服务器。

### 连接管理与广播

实战中要管理所有在线连接，通常用一个并发安全的 Map 维护 userId 到 Session 的映射，方便定向推送：

\`\`\`java
private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

// 上线
public void onConnect(String userId, WebSocketSession session) {
    WebSocketSession old = userSessions.put(userId, session);
    if (old != null && old.isOpen()) {
        old.close(CloseStatus.POLICY_VIOLATION);   // 踢掉旧会话，避免重复登录
    }
}

// 定向推送
public void sendToUser(String userId, String msg) throws IOException {
    WebSocketSession s = userSessions.get(userId);
    if (s != null && s.isOpen()) {
        s.sendMessage(new TextMessage(msg));
    }
}

// 全员广播
public void broadcast(String msg) {
    TextMessage text = new TextMessage(msg);
    userSessions.forEach((uid, s) -> {
        try {
            if (s.isOpen()) s.sendMessage(text);
        } catch (IOException e) { /* 忽略失败会话 */ }
    });
}
\`\`\`

### SockJS 回退方案

部分老旧浏览器或受限网络不支持 WebSocket，Spring 提供 SockJS 兜底：自动回退到 XHR streaming、XHR polling 等方案：

\`\`\`java
registry.addHandler(new MyHandler(), "/ws/chat").withSockJS();
\`\`\`

前端用 \`sockjs-client\` 库连接。现代项目大多直接用原生 WebSocket，不引入 SockJS。

## 设计原则

### 原则一：握手阶段完成所有鉴权

握手是 HTTP，可以拿到完整 HTTP 上下文（Cookie/Header/Principal）。一旦升级到 WebSocket，鉴权信息只能通过 \`attributes\` 传递。所有 Token 校验、用户解析、权限检查都应该在 \`HandshakeInterceptor\` 完成。

### 原则二：Session 集合用并发容器

多用户同时上下线会触发集合并发修改。必须用 \`ConcurrentHashMap\`、\`CopyOnWriteArraySet\` 等线程安全容器。绝不能在 \`handleMessage\` 中用 \`HashMap\` 直接 put/remove。

### 原则三：sendMessage 必须串行化

\`WebSocketSession.sendMessage\` 非线程安全。多线程广播时要么外层加锁，要么用 \`ConcurrentWebSocketSessionDecorator\` 包装。

### 原则四：异常处理别吞掉

\`handleMessage\` 抛异常会触发 \`handleTransportError\`，但若该方法继续抛异常，Spring 会关闭连接。建议在 Handler 内部 try-catch 业务异常，做日志记录后再决定是否关闭。

### 原则五：考虑集群横向扩展

单机 Session 集合只能在本机广播。生产环境多节点部署时，必须用 Redis Pub/Sub 或 MQ 在节点间转发广播消息，否则跨节点用户收不到消息。

## 使用场景

### 场景一：定向推送通知

后台管理员发公告，只推送给特定角色用户。维护 userId→Session 映射，按用户角色筛选推送。

### 场景二：群组聊天

按群 ID 分组维护 Session 列表，发消息时遍历群内成员推送。可结合 Redis 集群广播。

### 场景三：实时仪表盘

后台任务监控数据通过 WebSocket 推送到前端仪表盘，无需轮询刷新。

### 场景四：实时协作画板

每次画笔动作编码成小消息推送，所有协作者实时同步画板内容。

## 代码逐行讲解

下面是一个完整的 Spring WebSocket 聊天室实现，包含 Handler、拦截器、配置、Session 管理：

\`\`\`java
package com.example.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.socket.adapter.standard.StandardWebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

// 配置类：注册 Handler 与拦截器
@Configuration
@EnableWebSocket   // 开启 Spring WebSocket 支持
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatHandler chatHandler = new ChatHandler();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatHandler, "/ws/chat")
                .addInterceptors(new AuthInterceptor())
                // setAllowedOrigins("*"") 等于关闭 Origin 校验，生产环境必须用具体域名
                .setAllowedOriginPatterns("https://*.example.com");
    }
}

// 鉴权拦截器：握手阶段校验 Token
class AuthInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // 从查询参数取 token（前端 ws://host/ws/chat?token=xxx 方式）
        String query = request.getURI().getQuery();
        String token = parseQuery(query).get("token");
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
        String userId = verifyToken(token.substring(7));   // 解析出 userId
        if (userId == null) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
        attributes.put("userId", userId);   // 后续 Handler 可读
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest req, ServerHttpResponse resp,
                               WebSocketHandler handler, Exception ex) { }

    private Map<String, String> parseQuery(String q) {
        Map<String, String> m = new java.util.HashMap<>();
        if (q == null) return m;
        for (String kv : q.split("&")) {
            String[] p = kv.split("=", 2);
            if (p.length == 2) m.put(p[0], p[1]);
        }
        return m;
    }

    private String verifyToken(String t) {
        // 实际项目：解析 JWT、查 Redis 等
        return "user-" + t.hashCode();   // 简化示例
    }
}

// 业务 Handler：处理连接、消息、广播
class ChatHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> users = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String uid = (String) session.getAttributes().get("userId");
        // 防止同一用户重复登录：踢掉旧会话
        WebSocketSession old = users.put(uid, session);
        if (old != null && old.isOpen()) {
            try { old.close(CloseStatus.POLICY_VIOLATION); } catch (IOException ignored) {}
        }
        broadcast("系统", uid + " 上线");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String uid = (String) session.getAttributes().get("userId");
        // 简单广播：实际项目可解析 JSON 决定单聊还是群发
        broadcast(uid, message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String uid = (String) session.getAttributes().get("userId");
        // 注意只移除当前 session，避免误删新会话
        if (session.equals(users.get(uid))) {
            users.remove(uid);
        }
        broadcast("系统", uid + " 下线");
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        exception.printStackTrace();
        try { session.close(CloseStatus.SERVER_ERROR); } catch (IOException ignored) {}
    }

    private void broadcast(String from, String text) {
        String msg = "[" + from + "]: " + text;
        TextMessage payload = new TextMessage(msg);
        users.forEach((uid, s) -> {
            if (s.isOpen()) {
                try {
                    // 注意：sendMessage 非线程安全，并发场景应包装 ConcurrentWebSocketSessionDecorator
                    s.sendMessage(payload);
                } catch (IOException e) {
                    // 发送失败可能是连接已断，忽略即可
                }
            }
        });
    }
}
\`\`\`

代码逐行解释：

- \`@Configuration @EnableWebSocket\`：声明配置类并开启 WebSocket 支持。
- \`WebSocketConfigurer.registerWebSocketHandlers\`：注册端点，绑定 Handler 到 URL 路径。
- \`addInterceptors(new AuthInterceptor())\`：在握手前调用拦截器做鉴权。
- \`setAllowedOriginPatterns\`：允许的源，支持通配符。生产环境绝不能用 \`"*"\`，会有跨站攻击风险。
- \`HandshakeInterceptor.beforeHandshake\`：返回 false 即拒绝握手，response 状态码设为 401 客户端可识别。
- \`attributes.put("userId", userId)\`：握手时写入的数据会随 Session 透传给后续 Handler。
- \`session.getAttributes().get("userId")\`：在 Handler 中取出握手时存入的用户信息。
- \`users.put(uid, session)\`：覆盖旧 session 实现"单点登录"——同账号新登录会踢掉旧的。
- \`session.equals(users.get(uid))\` 判断后才 remove：避免把刚登录的新会话误删掉（旧会话断开事件可能延迟到达）。
- \`broadcast\` 用 \`forEach\` 遍历所有在线 session，注意并发安全靠 \`ConcurrentHashMap\` 保证遍历不抛 ConcurrentModificationException，但 \`sendMessage\` 本身仍非线程安全，高并发需加包装。

## 对比（表格形式）

| 维度 | JSR-356 @ServerEndpoint | Spring WebSocket Handler | STOMP over WebSocket |
| --- | --- | --- | --- |
| 编程模型 | 注解式端点 | 接口/适配类 | 消息代理模型 |
| 集成 Spring 容器 | 需手动配置 | 原生支持 | 原生支持 |
| 鉴权方式 | 配置 Servlet Filter | HandshakeInterceptor | 拦截器 + Principal |
| 消息路由 | 自己解析 | 自己解析 | @MessageMapping 自动路由 |
| 消息格式 | 自由 | 自由 | STOMP 帧 |
| 学习成本 | 低 | 中 | 高 |
| 灵活性 | 高 | 高 | 中（受 STOMP 约束） |
| 适合复杂业务 | 难 | 适合 | 适合大型应用 |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| Handler 中无法 @Autowired | Handler 是 new 出来的，未托管给 Spring | 把 Handler 声明为 @Component 注入，配置类 @Autowired 注入实例 |
| 鉴权拿不到 Cookie | 跨域请求未带 Cookie | 前端设置 withCredentials，后端 setAllowedOrigins 用具体域名而非 * |
| 同一用户多设备登录互相挤 | put 时直接覆盖 | 改用 Map<String, Set<Session>>，按设备 ID 区分 |
| 内存泄漏：session 集合越来越大 | 客户端异常断开 onClose 不触发 | 定时扫描 session 集合清理未 open 的，加 maxIdleTimeout |
| 广播时某客户端卡死拖累所有人 | sendMessage 同步阻塞 | 用 ConcurrentWebSocketSessionDecorator 包装，设缓冲上限 |
| 集群部署广播丢失 | 各节点只维护自己 session | 用 Redis Pub/Sub 跨节点广播 |
| 握手成功后想再校验权限没办法 | 升级后无 HTTP 上下文 | 鉴权必须放 beforeHandshake，关闭后无法补 |
| 二进制消息触发关闭连接 | 默认 TextWebSocketHandler 拒绝 | 改继承 AbstractWebSocketHandler 重写 handleBinaryMessage |
| 反向代理后偶发 403 | Nginx 未透传 Upgrade 头 | 配置 proxy_set_header Upgrade \$http_upgrade 与 Connection |
`,
  },
  {
    id: "jw-51",
    group: "WebSocket 实时通信",
    icon: "⚡",
    title: "STOMP 消息",
    content: `# STOMP 消息

## 概念讲解

WebSocket 只是字节流通道，本身不规定消息格式与路由语义。如果每条消息都自己解析 JSON、自己路由、自己管理订阅，代码会非常凌乱。STOMP（Simple Text Oriented Messaging Protocol）就是为 WebSocket 提供的一套「面向消息」的协议层，让我们像用消息队列一样用 WebSocket。

### STOMP 协议简介

STOMP 是一种简单的文本消息协议，灵感来自 HTTP。它通过预定义的「帧」（Frame）来组织消息，每帧有命令、头、正文三部分，类似 HTTP 请求的结构：

\`\`\`
COMMAND
header1:value1
header2:value2

body^@
\`\`\`

帧之间用空行分隔，正文以 NULL 字符（^@）结束。STOMP 1.2 定义了以下核心命令：

- **CONNECT**：客户端发起连接，握手 STOMP 协议（在 WebSocket 之上）。
- **CONNECTED**：服务器回应连接成功。
- **SEND**：客户端发送消息到指定目的地（destination）。
- **SUBSCRIBE**：客户端订阅某个主题（destination）。
- **UNSUBSCRIBE**：取消订阅。
- **MESSAGE**：服务器推送订阅的消息给客户端。
- **ACK / NACK**：确认收到 / 否认收到（用于可靠投递）。
- **DISCONNECT**：断开 STOMP 连接。
- **RECEIPT**：服务器对客户端请求的回执。

destination 是 STOMP 的核心概念，类似 URL 路径，例如 \`/topic/news\`（广播主题）、\`/queue/tasks\`（点对点队列）、\`/app/chat\`（应用处理入口）。

### STOMP 与 WebSocket 的关系

WebSocket 是传输层，STOMP 是应用层协议。整体分层：

\`\`\`
应用代码  ←→  STOMP 协议  ←→  WebSocket  ←→  TCP
\`\`\`

- 客户端先建立 WebSocket 连接。
- 然后在 WebSocket 上发 CONNECT 帧，建立 STOMP 会话。
- 之后所有消息都按 STOMP 帧格式收发。

Spring 内置 STOMP 支持，让我们不用自己解析帧，直接用注解写代码。

### Spring 中的 STOMP 注解

Spring 提供 \`@MessageMapping\`、\`@SendTo\`、\`@SubscribeMapping\` 等注解，让 STOMP 编程像写 Spring MVC 一样简单：

- **\`@MessageMapping("/app/chat")\`**：客户端 SEND 到 \`/app/chat\` 时触发该方法，类似 \`@RequestMapping\`。
- **\`@SendTo("/topic/messages")\`**：方法返回值自动发送到 \`/topic/messages\` 主题。
- **\`@SubscribeMapping("/topic/news")\`**：客户端订阅时触发，返回值直接发给订阅者（一次性）。
- **\`@MessageExceptionHandler\`**：处理 @MessageMapping 方法抛出的异常。

### SimpMessagingTemplate

类似 \`RestTemplate\` / \`JmsTemplate\`，\`SimpMessagingTemplate\` 是发消息的统一入口，可在任意位置主动推送：

\`\`\`java
@Autowired
private SimpMessagingTemplate messaging;

// 发到广播主题
messaging.convertAndSend("/topic/news", "重要通知");

// 发给指定用户（基于 Principal.getName()）
messaging.convertAndSendToUser("alice", "/queue/notifications", "你有新消息");
\`\`\`

后者实际发往 \`/user/alice/queue/notifications\`，Spring 自动按用户路由（需要配置 user destination broker）。

### 消息代理 SimpleBroker / StompBrokerRelay

STOMP 有「消息代理」（Broker）的概念，负责管理订阅关系、消息分发。Spring 提供两种内置代理：

- **SimpleBroker**：内置内存代理，开箱即用。订阅主题、广播消息都靠它。不支持持久化、不支持集群。
- **StompBrokerRelay**：把消息转发给外部消息中间件（如 RabbitMQ、ActiveMQ），由后者做真正的消息路由和持久化。生产环境用这个。

配置示例：

\`\`\`java
@Override
public void configureMessageBroker(MessageBrokerRegistry registry) {
    // /topic 和 /queue 走 SimpleBroker 处理（广播与队列）
    registry.enableSimpleBroker("/topic", "/queue");
    // /app 前缀的 SEND 消息交给 @MessageMapping 方法处理
    registry.setApplicationDestinationPrefixes("/app");
    // 客户端订阅用户私有目的地的前缀
    registry.setUserDestinationPrefix("/user");

    // 生产环境可换成外部 broker：
    // registry.enableStompBrokerRelay("/topic", "/queue")
    //         .setRelayHost("rabbitmq").setRelayPort(61613);
}
\`\`\`

### 客户端连接：stomp.js + sockjs

前端用 \`@stomp/stompjs\` 库连接 STOMP over WebSocket：

\`\`\`javascript
import { Client } from "@stomp/stompjs";

const client = new Client({
    brokerURL: "ws://localhost:8080/ws-stomp",   // STOMP 端点
    connectHeaders: { Authorization: "Bearer xxx" },
    onConnect: () => {
        // 订阅广播主题
        client.subscribe("/topic/news", (msg) => {
            console.log("收到通知：" + msg.body);
        });
        // 发送消息
        client.publish({ destination: "/app/chat", body: "大家好" });
    },
});
client.activate();
\`\`\`

注意 \`brokerURL\` 用 \`ws://\` 或 \`wss://\`。Spring 端点需要用 \`registerStompEndpoints\` 注册：

\`\`\`java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-stomp")
            .setAllowedOriginPatterns("https://*.example.com");
    // .withSockJS();   // 兼容老浏览器可开启
}
\`\`\`

## 设计原则

### 原则一：destination 前缀要规划好

不同前缀代表不同路由规则：\`/app/**\` 走 @MessageMapping，\`/topic/**\` 走广播，\`/queue/**\` 走点对点。前期规划好命名空间，后期业务扩展才不乱。

### 原则二：消息可序列化为统一 DTO

消息体不要直接传字符串，统一用 DTO 序列化为 JSON。前端反序列化也方便。DTO 应包含 type 字段，方便前端按类型分发处理。

### 原则三：点对点用 convertAndSendToUser

定向推送用 \`convertAndSendToUser\`，不要自己拼 \`/user/{id}/queue/...\`，因为 Spring 会处理 session 多设备、用户名 Principal 等细节。

### 原则四：生产环境上 StompBrokerRelay

SimpleBroker 不能持久化、不能跨节点。生产环境多节点部署、需要消息可靠投递时，必须接 RabbitMQ 等外部 broker。

### 原则五：鉴权用 ChannelInterceptor 或 HandshakeInterceptor

STOMP 的鉴权可在两层做：握手层（HTTP 升级时）和 STOMP CONNECT 帧。前者用 \`HandshakeInterceptor\`，后者用 \`ChannelInterceptor\` 拦截 CONNECT 帧。

## 使用场景

### 场景一：多房间聊天室

每个房间是一个 \`/topic/room/{roomId}\` 主题，用户订阅哪个房间就收哪个房间的消息。切换房间用 UNSUBSCRIBE + SUBSCRIBE。

### 场景二：定向通知系统

服务端定时任务发公告，用 \`convertAndSendToUser\` 推给所有在线管理员。

### 场景三：实时仪表盘多主题

订阅 \`/topic/cpu\`、\`/topic/memory\`、\`/topic/disk\` 三个主题，分别接收不同指标推送，前端分别渲染不同图表。

### 场景四：协作编辑广播

每次编辑动作 SEND 到 \`/app/doc/{docId}/edit\`，方法处理后广播到 \`/topic/doc/{docId}\`，所有订阅者收到变更。

## 代码逐行讲解

下面是一个完整的 Spring STOMP 聊天室示例，包含配置、消息 DTO、Controller、用户上下线事件：

\`\`\`java
package com.example.stomp;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

// 1. 配置类：开启 STOMP 消息代理
@Configuration
@EnableWebSocketMessageBroker   // 开启 STOMP over WebSocket
public class StompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 启用内存代理处理 /topic 和 /queue 开头的订阅
        registry.enableSimpleBroker("/topic", "/queue");
        // /app 前缀的 SEND 走 @MessageMapping 方法
        registry.setApplicationDestinationPrefixes("/app");
        // 用户私有目的地前缀（convertAndSendToUser 自动拼接）
        registry.setUserDestinationPrefix("/user");
        // 消息体心跳间隔（毫秒），底层 WebSocket 自动 ping/pong
        registry.setHeartbeatValue(new long[]{10000, 10000});
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stomp")         // STOMP 握手端点
                .setAllowedOriginPatterns("*");   // 生产应改为具体域名
    }
}

// 2. 消息 DTO
class ChatMessage {
    private String from;       // 发送者
    private String text;       // 正文
    private String type;      // CHAT / JOIN / LEAVE
    // 省略 getter/setter，实际用 Lombok @Data
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

// 3. Controller：处理 SEND 消息
@Controller
class ChatController {

    @Autowired
    private SimpMessagingTemplate messaging;   // 主动推送入口

    // 客户端 SEND /app/chat.public 触发
    // 方法返回值自动发到 /topic/messages（@SendTo 指定）
    @MessageMapping("/chat.public")
    @SendTo("/topic/messages")
    public ChatMessage publicChat(@Payload ChatMessage msg,
                                  SimpMessageHeaderAccessor headers) {
        // 从 headers 取出会话属性（鉴权时写入的）
        String sessionId = headers.getSessionId();
        msg.setType("CHAT");
        // 返回值由 Spring 自动序列化为 JSON 广播到 /topic/messages
        return msg;
    }

    // 私聊：客户端 SEND /app/chat.private，body 里指定 to 字段
    @MessageMapping("/chat.private")
    public void privateChat(@Payload ChatMessage msg) {
        // 不广播，定向发给指定用户
        messaging.convertAndSendToUser(
            msg.getFrom(),                  // 目标用户名
            "/queue/private",               // 主题后缀 → /user/{name}/queue/private
            msg                              // 消息体
        );
    }

    // 订阅 /topic/messages 时触发，返回值一次性发给订阅者
    @SubscribeMapping("/topic/messages")
    public ChatMessage onSubscribe() {
        ChatMessage welcome = new ChatMessage();
        welcome.setFrom("系统");
        welcome.setText("欢迎加入聊天室");
        welcome.setType("JOIN");
        return welcome;   // 仅发给当前订阅者，其他订阅者收不到
    }
}
\`\`\`

代码逐行解释：

- \`@EnableWebSocketMessageBroker\`：开启 STOMP 消息代理，同时导入 WebSocket 配置。
- \`enableSimpleBroker("/topic", "/queue")\`：注册内存代理处理这两个前缀的订阅。
- \`setApplicationDestinationPrefixes("/app")\`：客户端 SEND 到 \`/app/**\` 的消息会被路由到 \`@MessageMapping\` 方法。
- \`setUserDestinationPrefix("/user")\`：\`convertAndSendToUser\` 会把消息发到 \`/user/{username}/{queue}\`。
- \`setHeartbeatValue\`：配置 STOMP 层心跳，10 秒一次。Spring 底层自动发 WebSocket Ping/Pong。
- \`@MessageMapping("/chat.public")\`：客户端 SEND 到 \`/app/chat.public\` 触发。\`@Payload\` 注解方法参数为消息体（自动反序列化为 DTO）。
- \`@SendTo("/topic/messages")\`：方法返回值自动广播到指定主题，省去手动 \`messaging.convertAndSend\`。
- \`@SubscribeMapping\`：客户端订阅时触发，返回值只发给当前订阅者一次，常用于"欢迎语"。
- \`convertAndSendToUser\`：定向推送，Spring 内部维护用户名到 Session 的映射，自动选择正确的 session。

前端完整代码（stomp.js + sockjs）：

\`\`\`javascript
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// 创建 STOMP 客户端
const stompClient = new Client({
    // 用 SockJS 兜底（兼容老浏览器），可改成 ws:// 直接用 WebSocket
    webSocketFactory: () => new SockJS("http://localhost:8080/ws-stomp"),
    connectHeaders: { Authorization: "Bearer " + token },
    reconnectDelay: 5000,    // 断线 5 秒后自动重连

    onConnect: (frame) => {
        console.log("STOMP 已连接");

        // 订阅公共广播
        stompClient.subscribe("/topic/messages", (msg) => {
            const body = JSON.parse(msg.body);
            console.log("[" + body.from + "]: " + body.text);
        });

        // 订阅我的私有消息
        stompClient.subscribe("/user/queue/private", (msg) => {
            const body = JSON.parse(msg.body);
            console.log("[私信] " + body.from + ": " + body.text);
        });

        // 发送公共消息
        stompClient.publish({
            destination: "/app/chat.public",
            body: JSON.stringify({ from: "alice", text: "大家好" })
        });

        // 发送私信
        stompClient.publish({
            destination: "/app/chat.private",
            body: JSON.stringify({ from: "bob", text: "嘿" })
        });
    },

    onStompError: (frame) => {
        console.error("STOMP 错误：" + frame.headers["message"]);
    }
});

stompClient.activate();   // 启动连接
\`\`\`

代码逐行解释：

- \`webSocketFactory\`：自定义 WebSocket 工厂，这里用 SockJS。也可直接用 \`brokerURL: "ws://host/ws-stomp"\`。
- \`connectHeaders\`：CONNECT 帧的头，用于传递鉴权信息。
- \`reconnectDelay\`：断线自动重连间隔，省去手写重连逻辑。
- \`subscribe(destination, callback)\`：发 SUBSCRIBE 帧，后续 MESSAGE 帧触发 callback。
- \`publish({destination, body})\`：发 SEND 帧。body 是字符串，对象需自己 JSON.stringify。

## 对比（表格形式）

| 维度 | 裸 WebSocket | STOMP over WebSocket | 消息队列（如 RabbitMQ） |
| --- | --- | --- | --- |
| 协议 | 字节流 | STOMP 文本协议 | AMQP/MQTT 等 |
| 路由 | 自己实现 | destination 自动路由 | exchange/queue 路由 |
| 订阅模型 | 自己管理 | SUBSCRIBE/UNSUBSCRIBE | 标准 queue/topic |
| 持久化 | 不支持 | SimpleBroker 不支持，Relay 支持 | 支持 |
| 可靠投递 | 不支持 | ACK/NACK | 支持 |
| 跨节点广播 | 自己实现 | SimpleBroker 不支持，Relay 支持 | 支持 |
| 集成 Spring | 弱 | 原生 | 需 spring-amqp |
| 适合场景 | 简单实时 | 大多数实时应用 | 企业级异步消息 |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| @MessageMapping 方法不触发 | destination 前缀不是 /app | 检查 setApplicationDestinationPrefixes 配置 |
| @SendTo 消息客户端收不到 | 客户端没 SUBSCRIBE 对应主题 | 客户端 subscribe("/topic/xxx")，且前缀在 broker 注册范围 |
| convertAndSendToUser 找不到用户 | 用户没有 Principal 或名字不匹配 | 配置 Spring Security 让握手带 Principal，或用 SessionId 而非 username |
| 集群部署收不到广播 | SimpleBroker 是内存的，不跨节点 | 改用 StompBrokerRelay 接外部 broker |
| 消息丢失 | SimpleBroker 不持久化 | 需要可靠性就上 RabbitMQ + ACK 机制 |
| 心跳不生效 | 没配 setHeartbeatValue 或客户端没开启 | 服务端配 heartbeatValue，客户端默认开启 |
| 大消息卡顿 | 默认消息缓冲小 | 调大 \`setSendBufferSizeLimit\` 和 \`setMessageSizeLimit\` |
| 鉴权失败 | CONNECT 帧未带 token | 用 ChannelInterceptor 拦截 CONNECT 帧，校验 connectHeaders |
| 序列化失败 | DTO 没无参构造或 getter | 加 @JsonInclude + 无参构造 + getter/setter |
| @SubscribeMapping 不广播给其他订阅者 | 这是设计如此，只回当前订阅者 | 改用 @MessageMapping + @SendTo 才广播 |
`,
  },
  {
    id: "jw-52",
    group: "WebSocket 实时通信",
    icon: "⚡",
    title: "实时聊天实现",
    content: `# 实时聊天实现

## 概念讲解

实时聊天是 WebSocket 最经典的应用场景。一个完整的聊天系统远不止"消息收发"那么简单，涉及架构设计、用户管理、消息持久化、多端同步、可靠性保障等多个层面。本节从架构到实现，系统讲解一个生产级聊天室的关键技术。

### 聊天室架构设计

典型聊天系统由以下几层组成：

- **接入层**：WebSocket 端点，负责连接建立、心跳保活、断线重连。
- **路由层**：根据消息类型（私聊/群聊）决定投递目标，可能跨节点。
- **业务层**：用户上线/下线、好友关系、群组管理、消息过滤。
- **存储层**：消息持久化（MySQL/MongoDB）、离线消息缓存（Redis）、会话管理。
- **推送层**：在多节点间广播消息（Redis Pub/Sub 或 MQ）。

### 用户上线/下线管理

用户上线时：

1. 建立 WebSocket 连接，握手阶段校验 Token 拿到 userId。
2. 在 Redis 维护在线用户集合（userId → nodeId+sessionId），便于集群内查找。
3. 在本地节点维护 userId → Session 映射，方便本节点快速推送。
4. 广播 ONLINE 消息给关注该用户的客户端。

下线时反过来：清理 Redis、清理本地集合、广播 OFFLINE。注意区分"主动下线"（用户关页面）与"异常下线"（网络断开），后者靠心跳超时检测。

### 私聊 vs 群聊实现

**私聊**流程：

1. 发送方 SEND 消息，body 指明 \`to: userId\`。
2. 服务端查 Redis 找到目标用户所在节点。
3. 同节点直接推送；跨节点用 Redis Pub/Sub 转发到目标节点。
4. 目标节点从本地 Session 集合找到 Session 推送。
5. 消息持久化到数据库，目标不在线时存为离线消息。

**群聊**流程：

1. 发送方 SEND 到群组 ID。
2. 服务端查出群成员列表（可缓存到 Redis）。
3. 遍历成员，对每个成员走私聊的"找节点 → 推送"逻辑。
4. 大群可异步投递（先入库，后台任务慢慢推）。

### 消息持久化

消息要落库以便历史消息查询。常见表结构：

\`\`\`sql
CREATE TABLE chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(64) UNIQUE,    -- 业务消息 ID（雪花算法），用于幂等
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT,               -- 私聊接收方，群聊为 NULL
    group_id BIGINT,                  -- 群聊群 ID，私聊为 NULL
    content TEXT,
    type TINYINT,                     -- 1 文本 2 图片 3 语音
    created_at DATETIME,
    INDEX idx_receiver_time(receiver_id, created_at),
    INDEX idx_group_time(group_id, created_at)
);
\`\`\`

写入策略：异步落库（先把消息推给在线方，再写库），避免数据库 IO 阻塞推送。但要保证最终一致——用消息队列做异步写入。

### 在线用户列表维护

在线列表必须支持集群。两种方案：

- **Redis Set**：\`SADD online_users userId\`，全局唯一。简单但无法知道用户在哪个节点。
- **Redis Hash**：\`HSET online:node1 userId sessionId\`，按节点分桶，方便知道用户在哪个节点。
- **Redis Hash（推荐）**：\`HSET online_users userId nodeId\`，按 userId 索引节点，跨节点推送时一眼就能找到。

### 前端实现：Vue/React + WebSocket

前端要做的事：连接管理、断线重连、消息收发、UI 渲染。Vue 3 示例：

\`\`\`javascript
import { ref, onMounted } from "vue";

export function useChat(userId) {
    const messages = ref([]);
    const online = ref(false);
    let socket = null;
    let reconnectTimer = null;

    function connect() {
        socket = new WebSocket("ws://localhost:8080/ws/chat?userId=" + userId);

        socket.onopen = () => {
            online.value = true;
            startHeartbeat();
        };
        socket.onmessage = (event) => {
            messages.value.push(JSON.parse(event.data));
        };
        socket.onclose = () => {
            online.value = false;
            scheduleReconnect();
        };
    }

    function startHeartbeat() {
        setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "PING" }));
            }
        }, 30000);
    }

    function scheduleReconnect() {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 3000);   // 3 秒后重连
    }

    function send(text) {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "CHAT", text }));
        }
    }

    onMounted(connect);

    return { messages, online, send };
}
\`\`\`

### 心跳保活与断线重连

心跳是双向的：客户端定时发 PING，服务端回 PONG。如果客户端连续 N 次没收到 Pong，认为连接已死，关闭并重连。

重连策略：

- **固定间隔重连**：每 3 秒重连一次。简单但失败时浪费资源。
- **指数退避**：失败后 1s、2s、4s、8s... 逐步拉长，避免服务挂了时被重连风暴打垮。上限设 60s。
- **随机抖动**：在退避基础上加随机量（如 ±500ms），避免多个客户端同时重连。

### 生产环境注意事项

- **TLS 加密**：用 \`wss://\`，避免消息被中间人窃听。
- **限流**：单连接每秒消息数上限，防刷屏攻击。
- **消息大小限制**：单条消息不超过 64KB，大文件用 OSS 上传后传 URL。
- **敏感词过滤**：消息入库前过一遍敏感词库。
- **消息加密**：高度敏感场景下消息体端到端加密，服务器只转发密文。
- **审计日志**：所有消息记录留痕，满足合规要求。
- **横向扩展**：用 Redis Pub/Sub 跨节点广播，简单方案；或上 RabbitMQ Topic Exchange。

## 设计原则

### 原则一：消息 ID 用业务唯一标识

不要用数据库自增 ID 做消息标识，跨库时会冲突。用雪花算法（Snowflake）生成全局唯一 ID，前端可借此去重——同一消息收到两次只渲染一次。

### 原则二：推送与持久化解耦

实时推送要快，数据库写入要可靠。两者解耦：先推送，后异步落库。落库失败用重试或补偿。这样即使数据库卡顿，消息推送不受影响。

### 原则三：离线消息用 Redis 缓存

用户不在线时消息存哪？存数据库表 \`offline_message\`，下次上线时查询并推送。但大量离线消息会拖慢数据库。可用 Redis List 缓存最近 N 条，超出再回源查库。

### 原则四：多端同步要带消息序号

同一用户多设备登录时，每条消息分配单调递增的 seq。客户端用 seq 判断消息顺序、补齐缺口。这是 IM 系统的基本要求。

### 原则五：群聊大群异步化

500 人以上的大群，发送方不需要等全员收到再返回。异步投递：发送方立即收到"已发送"，后台任务慢慢推给群成员。

## 使用场景

### 场景一：在线客服系统

访客发起会话，客服端订阅自己的消息队列。客服忙时排队，闲时自动分配。消息记录留档以便审计。

### 场景二：企业 IM（类似钉钉）

支持单聊、群聊、@提醒、消息撤回、已读回执。组织架构同步、文件传输、富文本消息。

### 场景三：直播弹幕

观众发弹幕 → 服务端聚合 → 广播给所有观众。高并发场景需要消息合并（每 500ms 合并一次批量推）。

### 场景四：游戏内聊天

公屏聊天、私聊、工会频道。游戏内聊天对延迟敏感，需要就近部署 WebSocket 节点。

## 代码逐行讲解

下面是一个完整的聊天室后端实现，包含连接管理、私聊群聊、跨节点广播、消息持久化：

\`\`\`java
package com.example.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// 消息 DTO
class ChatProtocol {
    public String type;       // CHAT/PRIVATE/JOIN/LEAVE/PING/PONG
    public String from;       // 发送者 userId
    public String to;         // 接收者（私聊）或群组 ID（群聊）
    public String text;       // 消息正文
    public Long messageId;    // 雪花 ID，用于幂等
    public Long timestamp;    // 发送时间戳
}

@Service
public class ChatWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private StringRedisTemplate redis;          // Redis：跨节点广播
    @Autowired
    private MessageService messageService;       // 消息持久化
    @Autowired
    private ObjectMapper objectMapper;           // JSON 序列化

    // 本节点的在线用户：userId -> Session
    private final Map<String, WebSocketSession> localSessions = new ConcurrentHashMap<>();
    private static final String ONLINE_KEY = "chat:online";        // Redis Hash: userId -> nodeId
    private static final String CHANNEL = "chat:broadcast";         // Redis Pub/Sub 频道

    // ===== 连接生命周期 =====
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        String nodeId = (String) session.getAttributes().get("nodeId");

        // 踢掉同账号旧会话（单点登录）
        WebSocketSession old = localSessions.put(userId, session);
        if (old != null && old.isOpen()) {
            old.close(CloseStatus.POLICY_VIOLATION);
        }
        // 在 Redis 标记在线：userId -> 当前节点 ID
        redis.opsForHash().put(ONLINE_KEY, userId, nodeId);

        broadcastSystem(userId + " 上线");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        ChatProtocol msg = objectMapper.readValue(message.getPayload(), ChatProtocol.class);
        msg.from = userId;
        msg.timestamp = System.currentTimeMillis();
        msg.messageId = SnowflakeId.next();      // 生成全局唯一 ID

        switch (msg.type) {
            case "PING":
                // 心跳：直接回 PONG
                sendToSession(session, new ChatProtocol("PONG", null, null, null, null, msg.timestamp));
                return;
            case "CHAT":
                // 群聊：广播到频道，本节点订阅者会收到
                handleGroupChat(msg);
                break;
            case "PRIVATE":
                // 私聊：先查目标在哪个节点
                handlePrivateChat(msg);
                break;
            default:
                // 未知类型忽略
        }
    }

    @Override
    public void afterConnectionClosed(WebSocket session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        // 只移除当前 session，避免误删新会话
        if (session.equals(localSessions.get(userId))) {
            localSessions.remove(userId);
        }
        redis.opsForHash().delete(ONLINE_KEY, userId);
        broadcastSystem(userId + " 下线");
    }

    // ===== 业务方法 =====
    private void handleGroupChat(ChatProtocol msg) {
        // 1. 异步落库（不阻塞推送）
        messageService.saveAsync(msg);
        // 2. 通过 Redis Pub/Sub 广播到所有节点（包括本节点订阅者）
        redis.convertAndSend(CHANNEL, toJson(msg));
    }

    private void handlePrivateChat(ChatProtocol msg) {
        // 1. 落库（含离线消息存储）
        messageService.saveAsync(msg);
        // 2. 查目标用户所在节点
        Object targetNode = redis.opsForHash().get(ONLINE_KEY, msg.to);
        if (targetNode == null) {
            // 目标不在线：消息已入库，下次上线时拉取离线消息
            messageService.markOffline(msg.to, msg.messageId);
            return;
        }
        // 3. 跨节点：发到 Redis 频道，目标节点订阅后会推给本地 session
        // 为了让目标节点知道只推给特定用户，频道消息里带 to 字段
        redis.convertAndSend(CHANNEL, toJson(msg));
    }

    // Redis 订阅回调：收到广播消息时调用
    public void onRedisMessage(String payload) {
        ChatProtocol msg = fromJson(payload);
        if ("PRIVATE".equals(msg.type)) {
            // 私聊：只推给 to 用户
            WebSocketSession s = localSessions.get(msg.to);
            if (s != null && s.isOpen()) {
                sendToSession(s, msg);
            }
        } else {
            // 群聊：推给本节点所有在线用户
            for (WebSocketSession s : localSessions.values()) {
                if (s.isOpen()) sendToSession(s, msg);
            }
        }
    }

    private void broadcastSystem(String text) {
        ChatProtocol sys = new ChatProtocol();
        sys.type = "SYSTEM";
        sys.text = text;
        sys.timestamp = System.currentTimeMillis();
        redis.convertAndSend(CHANNEL, toJson(sys));
    }

    private void sendToSession(WebSocketSession s, ChatProtocol msg) {
        try {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(toJson(msg)));
            }
        } catch (IOException e) {
            // 发送失败通常是连接已断，记录日志即可
        }
    }

    private String toJson(ChatProtocol m) {
        try { return objectMapper.writeValueAsString(m); }
        catch (Exception e) { return "{}"; }
    }
    private ChatProtocol fromJson(String s) {
        try { return objectMapper.readValue(s, ChatProtocol.class); }
        catch (Exception e) { return new ChatProtocol(); }
    }
}
\`\`\`

代码逐行解释：

- \`localSessions\` 用 \`ConcurrentHashMap\` 维护本节点的在线用户，跨节点查找走 Redis。
- \`redis.opsForHash().put(ONLINE_KEY, userId, nodeId)\`：在 Redis 维护全局在线表，记录每个用户在哪个节点，跨节点推送时查这张表。
- \`old.close(CloseStatus.POLICY_VIOLATION)\`：单点登录。同账号在新设备登录时，老设备连接被踢。
- \`msg.messageId = SnowflakeId.next()\`：用雪花算法生成全局唯一 ID。客户端用此 ID 做幂等：相同 messageId 的消息只渲染一次。
- \`messageService.saveAsync(msg)\`：异步落库。不阻塞推送线程，提升吞吐。
- \`redis.convertAndSend(CHANNEL, toJson(msg))\`：通过 Redis Pub/Sub 跨节点广播。所有节点订阅 \`chat:broadcast\` 频道，收到消息后转发给本地 Session。
- \`onRedisMessage\`：Redis 订阅回调。私聊消息检查 \`to\` 字段只推给目标用户；群聊消息推给本节点所有在线用户。
- \`messageService.markOffline\`：目标不在线时标记为离线消息，用户下次上线时查询并推送。

前端 React + WebSocket 完整示例：

\`\`\`javascript
import { useEffect, useRef, useState } from "react";

export default function Chat({ userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [online, setOnline] = useState(false);
    const socketRef = useRef(null);
    const reconnectRef = useRef(null);

    useEffect(() => {
        let heartbeatTimer = null;

        function connect() {
            const socket = new WebSocket("ws://localhost:8080/ws/chat?userId=" + userId);
            socketRef.current = socket;

            socket.onopen = () => {
                setOnline(true);
                // 心跳：每 30 秒发 PING，服务端回 PONG
                heartbeatTimer = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "PING" }));
                    }
                }, 30000);
            };

            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                setMessages((prev) => [...prev, msg]);
            };

            socket.onclose = () => {
                setOnline(false);
                clearInterval(heartbeatTimer);
                // 指数退避重连：1s/2s/4s/8s...上限 60s
                const delay = Math.min(1000 * Math.pow(2, retryCount++), 60000);
                reconnectRef.current = setTimeout(connect, delay);
            };
        }

        let retryCount = 0;
        connect();

        return () => {
            clearInterval(heartbeatTimer);
            clearTimeout(reconnectRef.current);
            socketRef.current?.close();
        };
    }, [userId]);

    function send() {
        if (!input.trim()) return;
        socketRef.current?.send(JSON.stringify({
            type: "CHAT",
            text: input,
            timestamp: Date.now()
        }));
        setInput("");
    }

    return (
        <div>
            <div>状态：{online ? "在线" : "离线"}</div>
            <ul>
                {messages.map((m, i) => (
                    <li key={i}>[{m.from || "系统"}] {m.text}</li>
                ))}
            </ul>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={send}>发送</button>
        </div>
    );
}
\`\`\`

代码逐行解释：

- \`useRef\` 保存 socket 与重连定时器，避免 re-render 时丢失引用。
- \`setMessages((prev) => [...prev, msg])\` 用函数式更新，避免闭包拿到旧 state。
- \`Math.min(1000 * Math.pow(2, retryCount++), 60000)\`：指数退避重连，1/2/4/8s...，上限 60s。
- \`return () => { ... }\` 组件卸载时清理定时器和 socket，避免内存泄漏。

## 对比（表格形式）

| 维度 | 单机部署 | Redis Pub/Sub 集群 | MQ（RabbitMQ）集群 |
| --- | --- | --- | --- |
| 跨节点广播 | 不支持 | 支持 | 支持 |
| 消息可靠性 | 不保证 | 不保证（Pub 丢失无感知） | 高（ACK + 持久化） |
| 实现复杂度 | 低 | 中 | 高 |
| 消息顺序 | 单机有序 | 不保证全局有序 | 队列内有序 |
| 性能 | 高 | 高 | 中 |
| 适合规模 | 小型 | 中型 | 大型、企业级 |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 消息重复渲染 | 网络重发或重连后历史消息再推 | 用 messageId 在前端去重 |
| 离线消息丢失 | 用户上线时没拉离线消息 | 上线后调接口拉 offline_message 表 |
| 大群广播风暴 | 一次推给 5000 人同步卡顿 | 异步分批推送，单次推送限频 |
| 单点登录踢人后旧会话不释放 | close 异步，事件延迟 | 加 maxIdleTimeout 兜底，定时扫描僵尸 session |
| Redis Pub/Sub 消息丢失 | 订阅者不在线时消息直接丢 | 需要可靠性就上 MQ，Pub/Sub 只适合"无所谓丢"的场景 |
| 前端断线重连风暴 | 服务挂后所有客户端同时重连 | 指数退避 + 随机抖动 |
| 心跳不生效 | 服务端没回 PONG 或客户端没检测 | 客户端记录最近一次 PONG 时间，超时主动 close 触发重连 |
| 消息顺序乱 | 多线程推送无序 | 同一会话消息串行化，或用 seq 字段客户端排序 |
| 跨时区时间显示乱 | 服务器存 UTC 但客户端按本地解析 | 统一存时间戳（毫秒），客户端按本地时区格式化 |
| 鉴权 token 过期后连接还能用 | 握手时校验后不再校验 | 长 token 续期，或定期发心跳校验 |
`,
  },
];
