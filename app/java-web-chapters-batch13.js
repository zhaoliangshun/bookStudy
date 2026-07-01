// =============================================================
// Java Web 应用开发实战教程 —— 第十三批章节（WebSocket 实时通信组，共 4 章）
// 章节 49-52:WebSocket 协议与原理 / Spring WebSocket 入门 /
//          STOMP 消息协议 / 实时聊天室实战
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十九章:WebSocket 协议与原理
  // =============================================================
  {
    id: "jw-49",
    group: "WebSocket 实时通信",
    icon: "📡",
    title: "WebSocket 协议与原理",
    content: `# WebSocket 协议与原理

## 概念解释

WebSocket 是 HTML5 规范中提出的在单个 TCP 连接上进行**全双工通信**的网络协议，标准化文档为 RFC 6455。它解决了传统 HTTP 协议在实时通信场景下的低效问题，让服务器能够**主动向客户端推送数据**，而不需要客户端反复轮询。

HTTP 是请求-响应模型：客户端发起请求，服务器被动响应，每次请求完成后连接即关闭（HTTP/1.1 默认 keep-alive 复用连接，但仍是请求驱动）。这种方式有几个固有缺陷：服务器无法主动推送、轮询浪费资源、头部开销大、延迟高。

WebSocket 与之相比有根本性差异：全双工双向通信、持久连接、低延迟（帧头部最小仅 2 字节）、协议独立（可承载任意应用层协议如 STOMP）。

### 核心概念

- **握手（Handshake）**：WebSocket 借助 HTTP/1.1 的 Upgrade 机制完成连接建立。
- **数据帧（Frame）**：握手成功后双方通过帧传递消息，由 Opcode 区分文本/二进制/关闭/Ping/Pong。
- **心跳（Ping/Pong）**：定期探测连接活性，防止半开连接。
- **生命周期**：建立 → OPEN → CLOSING → CLOSED。

## 设计原理

### 原理一：握手复用 HTTP 基础设施

WebSocket 借用 HTTP 的 80/443 端口和 Upgrade 头，能穿透大多数防火墙和反向代理，降低运维成本。客户端发起握手：

\`\`\`http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
\`\`\`

服务器响应 101 表示协议切换：

\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

服务器计算 \`Sec-WebSocket-Accept\`：将客户端的 \`Sec-WebSocket-Key\` 拼上固定 GUID（\`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\`），做 SHA-1 摘要后 Base64 编码。这个魔术串防止普通 HTTP 服务器误把 WebSocket 请求当普通 HTTP 处理。

### 原理二：帧格式最小化头部

WebSocket 帧头部最小只有 2 字节，相比 HTTP 每次数百字节头部，长期实时通信时带宽节省显著。帧结构包含：FIN（是否最后一帧）、Opcode（帧类型）、MASK（客户端发往服务端必须掩码）、Payload Length（7/16/64 位）、Masking Key、Payload Data。

### 原理三：必须有心跳保活

长连接必然面临"半开连接"问题：一端崩溃后 TCP 不一定能立即感知。Ping/Pong 帧是发现死连接的可靠手段。常见心跳间隔 30-60 秒，多次未收到 Pong 则认为连接已死。

### 原理四：消息边界由协议保证

WebSocket 是消息流而非字节流。每条消息有明确边界（FIN=1 表示消息结束），上层应用无需自己分包。

## 使用场景

**适合场景**：即时通讯（IM 聊天）、实时推送（股票行情、比分、订单状态）、协同编辑（多人文档/白板）、实时游戏（联机对战、弹幕）、实时监控（服务器大盘、IoT 状态）。

**不适合场景**：偶尔拉取数据的普通接口（REST 更合适）、强请求-响应语义接口、对兼容性要求极高的旧浏览器环境。

## 代码示例

下面是基于 JSR-356 标准 API 的 WebSocket 服务端聊天端点：

\`\`\`java
package com.example.websocket;

import jakarta.websocket.*;        // JSR-356 标准 API
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

// @ServerEndpoint 声明 WebSocket 端点，路径参数 {username} 可通过 @PathParam 注入
@ServerEndpoint("/chat/{username}")
public class ChatEndpoint {

    // 所有在线会话集合，CopyOnWriteArraySet 保证并发安全
    private static final Set<Session> SESSIONS = new CopyOnWriteArraySet<>();
    private String username;

    // 握手成功后调用，session 代表这条连接
    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        this.username = username;
        SESSIONS.add(session);                 // 加入在线集合
        // 设置空闲超时：60 秒无消息则关闭，避免僵尸连接
        session.setMaxIdleTimeout(60_000);
        broadcast("系统", username + " 加入了聊天");
    }

    // 接收到文本消息时调用
    @OnMessage
    public void onMessage(String message, Session session) {
        broadcast(username, message);          // 简单广播给所有人
    }

    // 连接关闭时调用，清理集合避免内存泄漏
    @OnClose
    public void onClose(Session session) {
        SESSIONS.remove(session);
        broadcast("系统", username + " 离开了聊天");
    }

    // 异常时调用
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

前端 WebSocket 客户端：

\`\`\`javascript
// 创建 WebSocket 连接，ws:// 或 wss://（TLS 加密）
const socket = new WebSocket("ws://localhost:8080/chat/alice");

// 连接建立后触发
socket.onopen = () => {
    console.log("连接已建立");
    socket.send("大家好");
};

// 收到消息时触发
socket.onmessage = (event) => {
    console.log("收到：" + event.data);
};

// 心跳保活：每 30 秒发一次自定义心跳
setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send("PING");
    }
}, 30000);
\`\`\`

关键点：\`@ServerEndpoint\` 声明端点；\`CopyOnWriteArraySet\` 保证并发安全；\`getAsyncRemote().sendText()\` 异步发送避免慢客户端拖累广播；\`readyState\` 必须为 OPEN 才能发心跳。

## 对比分析

| 维度 | HTTP 轮询 | HTTP 长轮询 | SSE | WebSocket |
| --- | --- | --- | --- | --- |
| 通信方向 | 单向（客户端发起） | 单向 | 服务器→客户端 | 全双工双向 |
| 连接方式 | 短连接 | 长连接挂起 | 长连接 | 持久长连接 |
| 实时性 | 差（依赖轮询间隔） | 中 | 好 | 极好（毫秒级） |
| 头部开销 | 大（每次几百字节） | 大 | 小 | 极小（2 字节） |
| 服务器推送 | 不支持 | 半支持 | 支持 | 支持 |
| 二进制数据 | 支持 | 支持 | 不支持 | 支持 |
| 断线重连 | 自动 | 需手动 | 浏览器自动 | 需手动 |
| 适用场景 | 普通接口 | 早期 IM | 通知/行情推送 | IM/协同/双向交互 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 连接 30 秒后被自动断开 | 服务器或 Nginx 默认空闲超时 | 配置 \`proxy_read_timeout\` 同时启用应用层心跳 |
| Nginx 反向代理后握手失败 | Nginx 默认不透传 Upgrade 头 | 加 \`proxy_set_header Upgrade \$http_upgrade\` 和 \`Connection "upgrade"\` |
| 心跳漏发后客户端无感知 | 浏览器 onclose 不一定立即触发 | 客户端定时心跳，超时未收 Pong 则手动重连 |
| 集群部署时广播丢失 | 多节点间 Session 不共享 | 用 Redis Pub/Sub 或 MQ 在节点间转发广播 |
| 内存泄漏：SESSIONS 集合无限增长 | onClose 未触发（如客户端断电） | 定期扫描过期会话 + 设置 maxIdleTimeout |
| 鉴权失效：任何人都能连上 | 仅靠 URL 携带 username 没校验 | 握手阶段用 Cookie/Token 校验 |
| 跨域攻击：恶意页面建连接 | 未校验 Origin | 服务端校验 Origin 头白名单 |
| 二进制传输乱码 | 误用文本帧收二进制 | 区分 TextMessage 与 BinaryMessage |
`
  },
  // =============================================================
  // 第五十章:Spring WebSocket 入门
  // =============================================================
  {
    id: "jw-50",
    group: "WebSocket 实时通信",
    icon: "🌐",
    title: "Spring WebSocket 入门",
    content: `# Spring WebSocket 入门

## 概念解释

Spring 框架对 WebSocket 提供了完整支持，位于 \`spring-websocket\` 模块。相比裸 JSR-356（\`@ServerEndpoint\`），Spring WebSocket 抽象更高级，能无缝集成 Spring 容器、依赖注入、拦截器、消息转换器，更贴近 Spring 应用开发者的使用习惯。

### 核心接口

- **\`WebSocketHandler\`**：处理 WebSocket 生命周期的核心接口，定义 \`afterConnectionEstablished\`、\`handleMessage\`、\`handleTransportError\`、\`afterConnectionClosed\` 方法。
- **\`WebSocketSession\`**：代表一条已建立的连接，提供 \`sendMessage\`、\`close\`、\`getAttributes\`、\`getPrincipal\`。
- **\`WebSocketConfigurer\`**：注册端点、配置拦截器、允许的源。
- **\`HandshakeInterceptor\`**：握手阶段拦截器，可在握手前做鉴权、写入属性到 session。
- **\`WebSocketMessage\`**：消息抽象，有 \`TextMessage\`、\`BinaryMessage\`、\`PingMessage\`、\`PongMessage\` 四种。

实际开发多用 \`TextWebSocketHandler\` 或 \`AbstractWebSocketHandler\` 适配类，避免直接实现接口的繁杂。

## 设计原理

### 原理一：握手阶段完成所有鉴权

握手是 HTTP，可以拿到完整 HTTP 上下文（Cookie/Header/Principal）。一旦升级到 WebSocket，鉴权信息只能通过 \`attributes\` 传递。所有 Token 校验、用户解析都应该在 \`HandshakeInterceptor\` 完成。

### 原理二：Session 集合用并发容器

多用户同时上下线会触发集合并发修改。必须用 \`ConcurrentHashMap\`、\`CopyOnWriteArraySet\` 等线程安全容器。

### 原理三：sendMessage 必须串行化

\`WebSocketSession.sendMessage\` 非线程安全。多线程广播时要么外层加锁，要么用 \`ConcurrentWebSocketSessionDecorator\` 包装，内部加锁并设缓冲上限，避免慢客户端拖垮服务器。

### 原理四：SockJS 回退方案

部分老旧浏览器或受限网络不支持 WebSocket，Spring 提供 SockJS 兜底：自动回退到 XHR streaming、XHR polling。

### 原理五：集群横向扩展

单机 Session 集合只能在本机广播。生产环境多节点部署时，必须用 Redis Pub/Sub 或 MQ 在节点间转发广播消息。

## 使用场景

**适合场景**：定向推送通知（管理员公告）、群组聊天、实时仪表盘（监控数据推送）、实时协作画板、需要 Spring 容器集成的复杂业务。

**不适合场景**：简单的「广播所有连接」用 JSR-356 更轻量；需要消息路由、订阅管理的大型应用应该直接上 STOMP。

## 代码示例

下面是一个完整的 Spring WebSocket 聊天室实现，包含配置、拦截器、Handler、Session 管理：

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

import java.io.IOException;
import java.util.Map;
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
                // 生产环境必须用具体域名，不能用 "*"
                .setAllowedOriginPatterns("https://*.example.com");
    }
}

// 鉴权拦截器：握手阶段校验 Token
class AuthInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // 从查询参数取 token（前端 ws://host/ws/chat?token=xxx）
        String query = request.getURI().getQuery();
        String token = parseQuery(query).get("token");
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;   // 拒绝握手
        }
        String userId = verifyToken(token.substring(7));
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
        return "user-" + t.hashCode();   // 简化示例，实际解析 JWT
    }
}

// 业务 Handler：处理连接、消息、广播
class ChatHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> users = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String uid = (String) session.getAttributes().get("userId");
        // 单点登录：踢掉旧会话，避免重复登录
        WebSocketSession old = users.put(uid, session);
        if (old != null && old.isOpen()) {
            old.close(CloseStatus.POLICY_VIOLATION);
        }
        broadcast("系统", uid + " 上线");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String uid = (String) session.getAttributes().get("userId");
        broadcast(uid, message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String uid = (String) session.getAttributes().get("userId");
        // 只移除当前 session，避免误删新会话（旧会话关闭事件可能延迟到达）
        if (session.equals(users.get(uid))) {
            users.remove(uid);
        }
        broadcast("系统", uid + " 下线");
    }

    private void broadcast(String from, String text) {
        String msg = "[" + from + "]: " + text;
        TextMessage payload = new TextMessage(msg);
        users.forEach((uid, s) -> {
            if (s.isOpen()) {
                try {
                    // 注意：sendMessage 非线程安全，高并发需用 ConcurrentWebSocketSessionDecorator 包装
                    s.sendMessage(payload);
                } catch (IOException e) {
                    // 发送失败通常是连接已断，忽略
                }
            }
        });
    }
}
\`\`\`

关键点：\`@EnableWebSocket\` 开启支持；\`HandshakeInterceptor\` 在握手前鉴权；\`attributes.put\` 透传用户信息；\`session.equals(users.get(uid))\` 判断后才 remove 避免误删新会话。

## 对比分析

| 维度 | JSR-356 @ServerEndpoint | Spring WebSocket Handler | STOMP over WebSocket |
| --- | --- | --- | --- |
| 编程模型 | 注解式端点 | 接口/适配类 | 消息代理模型 |
| 集成 Spring 容器 | 需手动配置 | 原生支持 | 原生支持 |
| 鉴权方式 | Servlet Filter | HandshakeInterceptor | 拦截器 + Principal |
| 消息路由 | 自己解析 | 自己解析 | @MessageMapping 自动路由 |
| 消息格式 | 自由 | 自由 | STOMP 帧 |
| 学习成本 | 低 | 中 | 高 |
| 灵活性 | 高 | 高 | 中（受 STOMP 约束） |
| 适合复杂业务 | 难 | 适合 | 适合大型应用 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| Handler 中无法 @Autowired | Handler 是 new 出来的，未托管给 Spring | 把 Handler 声明为 @Component，配置类 @Autowired 注入实例 |
| 鉴权拿不到 Cookie | 跨域请求未带 Cookie | 前端设置 withCredentials，后端用具体域名而非 * |
| 同一用户多设备登录互相挤 | put 时直接覆盖 | 改用 Map<String, Set<Session>>，按设备 ID 区分 |
| 内存泄漏：session 集合越来越大 | 客户端异常断开 onClose 不触发 | 定时扫描清理未 open 的 session，加 maxIdleTimeout |
| 广播时某客户端卡死拖累所有人 | sendMessage 同步阻塞 | 用 ConcurrentWebSocketSessionDecorator 包装，设缓冲上限 |
| 集群部署广播丢失 | 各节点只维护自己 session | 用 Redis Pub/Sub 跨节点广播 |
| 握手成功后想再校验权限没办法 | 升级后无 HTTP 上下文 | 鉴权必须放 beforeHandshake |
| 二进制消息触发关闭连接 | 默认 TextWebSocketHandler 拒绝二进制 | 改继承 AbstractWebSocketHandler 重写 handleBinaryMessage |
`
  },
  // =============================================================
  // 第五十一章:STOMP 消息协议
  // =============================================================
  {
    id: "jw-51",
    group: "WebSocket 实时通信",
    icon: "📮",
    title: "STOMP 消息协议",
    content: `# STOMP 消息协议

## 概念解释

WebSocket 只是字节流通道，本身不规定消息格式与路由语义。如果每条消息都自己解析 JSON、自己路由、自己管理订阅，代码会非常凌乱。**STOMP**（Simple Text Oriented Messaging Protocol）就是为 WebSocket 提供的一套「面向消息」的协议层，让我们像用消息队列一样用 WebSocket。

### STOMP 帧结构

STOMP 灵感来自 HTTP，通过预定义的「帧」（Frame）组织消息，每帧有命令、头、正文三部分：

\`\`\`
COMMAND
header1:value1
header2:value2

body^@
\`\`\`

帧之间用空行分隔，正文以 NULL 字符（^@）结束。STOMP 1.2 核心命令：

- **CONNECT / CONNECTED**：客户端发起连接 / 服务器回应成功。
- **SEND**：客户端发送消息到指定目的地（destination）。
- **SUBSCRIBE / UNSUBSCRIBE**：订阅 / 取消订阅主题。
- **MESSAGE**：服务器推送订阅的消息给客户端。
- **ACK / NACK**：确认收到 / 否认收到（用于可靠投递）。
- **DISCONNECT**：断开 STOMP 连接。

\`destination\` 是核心概念，类似 URL 路径，例如 \`/topic/news\`（广播主题）、\`/queue/tasks\`（点对点队列）、\`/app/chat\`（应用处理入口）。

### Spring 中的 STOMP 注解

- **\`@MessageMapping("/app/chat")\`**：客户端 SEND 到 \`/app/chat\` 时触发，类似 \`@RequestMapping\`。
- **\`@SendTo("/topic/messages")\`**：方法返回值自动发送到指定主题。
- **\`@SubscribeMapping("/topic/news")\`**：客户端订阅时触发，返回值一次性发给订阅者。
- **\`@MessageExceptionHandler\`**：处理 @MessageMapping 方法抛出的异常。

## 设计原理

### 原理一：协议分层

WebSocket 是传输层，STOMP 是应用层协议。整体分层：应用代码 ←→ STOMP 协议 ←→ WebSocket ←→ TCP。客户端先建立 WebSocket 连接，然后发 CONNECT 帧建立 STOMP 会话，之后所有消息按 STOMP 帧格式收发。

### 原理二：destination 前缀规划

不同前缀代表不同路由规则：\`/app/**\` 走 @MessageMapping，\`/topic/**\` 走广播，\`/queue/**\` 走点对点。前期规划好命名空间，后期业务扩展才不乱。

### 原理三：消息代理 SimpleBroker / StompBrokerRelay

- **SimpleBroker**：内置内存代理，开箱即用。订阅主题、广播消息都靠它。不支持持久化、不支持集群。
- **StompBrokerRelay**：把消息转发给外部消息中间件（如 RabbitMQ、ActiveMQ），由后者做真正的消息路由和持久化。生产环境用这个。

### 原理四：点对点用 convertAndSendToUser

\`SimpMessagingTemplate.convertAndSendToUser\` 定向推送，Spring 自动处理 session 多设备、用户名 Principal 等细节，实际发往 \`/user/{username}/{queue}\`。

### 原理五：心跳保活

STOMP 层心跳通过 \`setHeartbeatValue\` 配置，Spring 底层自动发 WebSocket Ping/Pong。

## 使用场景

**适合场景**：多房间聊天室（每房间一个 \`/topic/room/{id}\`）、定向通知系统（\`convertAndSendToUser\`）、实时仪表盘多主题（分别订阅 cpu/memory/disk）、协作编辑广播。

**不适合场景**：简单的双向通信不需要 STOMP 的路由能力，裸 WebSocket 更轻量；需要严格消息顺序和事务的场景用专业 MQ 更合适。

## 代码示例

下面是完整的 Spring STOMP 聊天室示例，包含配置、DTO、Controller：

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
                .setAllowedOriginPatterns("https://*.example.com");
    }
}

// 2. 消息 DTO
class ChatMessage {
    private String from;       // 发送者
    private String text;       // 正文
    private String type;       // CHAT / JOIN / LEAVE
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

    // 客户端 SEND /app/chat.public 触发，返回值自动广播到 /topic/messages
    @MessageMapping("/chat.public")
    @SendTo("/topic/messages")
    public ChatMessage publicChat(@Payload ChatMessage msg,
                                  SimpMessageHeaderAccessor headers) {
        String sessionId = headers.getSessionId();
        msg.setType("CHAT");
        return msg;   // Spring 自动序列化为 JSON 广播
    }

    // 私聊：客户端 SEND /app/chat.private，body 指定 to 字段
    @MessageMapping("/chat.private")
    public void privateChat(@Payload ChatMessage msg) {
        messaging.convertAndSendToUser(
            msg.getFrom(),                  // 目标用户名
            "/queue/private",               // → /user/{name}/queue/private
            msg
        );
    }

    // 订阅 /topic/messages 时触发，返回值一次性发给订阅者
    @SubscribeMapping("/topic/messages")
    public ChatMessage onSubscribe() {
        ChatMessage welcome = new ChatMessage();
        welcome.setFrom("系统");
        welcome.setText("欢迎加入聊天室");
        welcome.setType("JOIN");
        return welcome;
    }
}
\`\`\`

前端 STOMP 客户端：

\`\`\`javascript
import { Client } from "@stomp/stompjs";

const stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws-stomp",   // STOMP 端点
    connectHeaders: { Authorization: "Bearer xxx" },
    reconnectDelay: 5000,    // 断线 5 秒后自动重连

    onConnect: (frame) => {
        console.log("STOMP 已连接");
        // 订阅公共广播
        stompClient.subscribe("/topic/messages", (msg) => {
            const body = JSON.parse(msg.body);
            console.log("[" + body.from + "]: " + body.text);
        });
        // 发送公共消息
        stompClient.publish({
            destination: "/app/chat.public",
            body: JSON.stringify({ from: "alice", text: "大家好" })
        });
    },

    onStompError: (frame) => {
        console.error("STOMP 错误：" + frame.headers["message"]);
    }
});

stompClient.activate();   // 启动连接
\`\`\`

关键点：\`@EnableWebSocketMessageBroker\` 开启 STOMP；\`@Payload\` 自动反序列化消息体；\`@SendTo\` 自动广播返回值；\`@SubscribeMapping\` 返回值只发给当前订阅者一次。

## 对比分析

| 维度 | 裸 WebSocket | STOMP over WebSocket | 消息队列（RabbitMQ） |
| --- | --- | --- | --- |
| 协议 | 字节流 | STOMP 文本协议 | AMQP/MQTT 等 |
| 路由 | 自己实现 | destination 自动路由 | exchange/queue 路由 |
| 订阅模型 | 自己管理 | SUBSCRIBE/UNSUBSCRIBE | 标准 queue/topic |
| 持久化 | 不支持 | SimpleBroker 不支持，Relay 支持 | 支持 |
| 可靠投递 | 不支持 | ACK/NACK | 支持 |
| 跨节点广播 | 自己实现 | SimpleBroker 不支持，Relay 支持 | 支持 |
| 集成 Spring | 弱 | 原生 | 需 spring-amqp |
| 适合场景 | 简单实时 | 大多数实时应用 | 企业级异步消息 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| @MessageMapping 方法不触发 | destination 前缀不是 /app | 检查 setApplicationDestinationPrefixes 配置 |
| @SendTo 消息客户端收不到 | 客户端没 SUBSCRIBE 对应主题 | 客户端 subscribe，且前缀在 broker 注册范围 |
| convertAndSendToUser 找不到用户 | 用户没有 Principal 或名字不匹配 | 配置 Spring Security 让握手带 Principal |
| 集群部署收不到广播 | SimpleBroker 是内存的，不跨节点 | 改用 StompBrokerRelay 接外部 broker |
| 消息丢失 | SimpleBroker 不持久化 | 需要可靠性就上 RabbitMQ + ACK 机制 |
| 心跳不生效 | 没配 setHeartbeatValue | 服务端配 heartbeatValue，客户端默认开启 |
| 大消息卡顿 | 默认消息缓冲小 | 调大 setSendBufferSizeLimit 和 setMessageSizeLimit |
| 鉴权失败 | CONNECT 帧未带 token | 用 ChannelInterceptor 拦截 CONNECT 帧校验 |
| @SubscribeMapping 不广播给其他订阅者 | 这是设计如此，只回当前订阅者 | 改用 @MessageMapping + @SendTo 才广播 |
`
  },
  // =============================================================
  // 第五十二章:实时聊天室实战
  // =============================================================
  {
    id: "jw-52",
    group: "WebSocket 实时通信",
    icon: "💬",
    title: "实时聊天室实战",
    content: `# 实时聊天室实战

## 概念解释

实时聊天是 WebSocket 最经典的应用场景。一个完整的聊天系统远不止"消息收发"那么简单，涉及架构设计、用户管理、消息持久化、多端同步、可靠性保障等多个层面。本节从架构到实现，系统讲解一个生产级聊天室的关键技术。

### 聊天室架构设计

典型聊天系统由以下几层组成：

- **接入层**：WebSocket 端点，负责连接建立、心跳保活、断线重连。
- **路由层**：根据消息类型（私聊/群聊）决定投递目标，可能跨节点。
- **业务层**：用户上线/下线、好友关系、群组管理、消息过滤。
- **存储层**：消息持久化（MySQL/MongoDB）、离线消息缓存（Redis）、会话管理。
- **推送层**：在多节点间广播消息（Redis Pub/Sub 或 MQ）。

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

## 设计原理

### 原理一：用户上线/下线管理

用户上线时：建立 WebSocket 连接 → 握手阶段校验 Token 拿到 userId → 在 Redis 维护在线用户集合（userId → nodeId+sessionId）→ 在本地节点维护 userId → Session 映射 → 广播 ONLINE 消息。下线反过来：清理 Redis、清理本地集合、广播 OFFLINE。区分"主动下线"与"异常下线"，后者靠心跳超时检测。

### 原理二：私聊 vs 群聊

**私聊**流程：发送方 SEND 消息 → 服务端查 Redis 找到目标用户所在节点 → 同节点直接推送，跨节点用 Redis Pub/Sub 转发 → 消息持久化，目标不在线时存为离线消息。

**群聊**流程：发送方 SEND 到群组 ID → 服务端查出群成员列表（可缓存到 Redis）→ 遍历成员推送 → 大群异步投递（先入库，后台任务慢慢推）。

### 原理三：在线用户列表集群维护

- **Redis Set**：\`SADD online_users userId\`，全局唯一但无法知道用户在哪个节点。
- **Redis Hash（推荐）**：\`HSET online_users userId nodeId\`，按 userId 索引节点，跨节点推送时一眼就能找到。

### 原理四：心跳保活与断线重连

心跳是双向的：客户端定时发 PING，服务端回 PONG。重连策略：

- **固定间隔重连**：每 3 秒重连一次，简单但失败时浪费资源。
- **指数退避**：失败后 1s、2s、4s、8s... 逐步拉长，上限 60s。
- **随机抖动**：在退避基础上加随机量，避免多个客户端同时重连。

### 原理五：消息 ID 用业务唯一标识

不要用数据库自增 ID 做消息标识，跨库时会冲突。用雪花算法（Snowflake）生成全局唯一 ID，前端可借此去重——同一消息收到两次只渲染一次。

## 使用场景

**适合场景**：在线客服系统（访客排队、客服分配、消息留档）、企业 IM（单聊群聊、@提醒、消息撤回、已读回执）、直播弹幕（高并发聚合批量推）、游戏内聊天（公屏、私聊、工会频道）。

**不适合场景**：消息可靠性要求极高的金融场景（应上专业 MQ）、超大规模万人群聊（需要专门的 IM 中间件如 TeamTalk）。

## 代码示例

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
    public ChatProtocol() {}
    public ChatProtocol(String type, String from, String to, String text, Long id, Long ts) {
        this.type = type; this.from = from; this.to = to; this.text = text; this.messageId = id; this.timestamp = ts;
    }
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
                handleGroupChat(msg);   // 群聊：广播到频道
                break;
            case "PRIVATE":
                handlePrivateChat(msg); // 私聊：先查目标在哪个节点
                break;
            default:
                // 未知类型忽略
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        // 只移除当前 session，避免误删新会话
        if (session.equals(localSessions.get(userId))) {
            localSessions.remove(userId);
        }
        redis.opsForHash().delete(ONLINE_KEY, userId);
        broadcastSystem(userId + " 下线");
    }

    private void handleGroupChat(ChatProtocol msg) {
        messageService.saveAsync(msg);                          // 异步落库
        redis.convertAndSend(CHANNEL, toJson(msg));              // Redis Pub/Sub 广播
    }

    private void handlePrivateChat(ChatProtocol msg) {
        messageService.saveAsync(msg);
        Object targetNode = redis.opsForHash().get(ONLINE_KEY, msg.to);
        if (targetNode == null) {
            // 目标不在线：消息已入库，下次上线时拉取离线消息
            messageService.markOffline(msg.to, msg.messageId);
            return;
        }
        redis.convertAndSend(CHANNEL, toJson(msg));              // 跨节点推送
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
        ChatProtocol sys = new ChatProtocol("SYSTEM", "系统", null, text, null, System.currentTimeMillis());
        redis.convertAndSend(CHANNEL, toJson(sys));
    }

    private void sendToSession(WebSocketSession s, ChatProtocol msg) {
        try {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(toJson(msg)));
            }
        } catch (IOException e) {
            // 发送失败通常是连接已断
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

前端 React + WebSocket 客户端：

\`\`\`javascript
import { useEffect, useRef, useState } from "react";

export default function Chat({ userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [online, setOnline] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        let heartbeatTimer = null;
        let retryCount = 0;

        function connect() {
            const socket = new WebSocket("ws://localhost:8080/ws/chat?userId=" + userId);
            socketRef.current = socket;

            socket.onopen = () => {
                setOnline(true);
                // 心跳：每 30 秒发 PING
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
                setTimeout(connect, delay);
            };
        }

        connect();

        return () => {
            clearInterval(heartbeatTimer);
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
            <ul>{messages.map((m, i) => <li key={i}>[{m.from}] {m.text}</li>)}</ul>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={send}>发送</button>
        </div>
    );
}
\`\`\`

关键点：\`localSessions\` 用 \`ConcurrentHashMap\` 维护本节点在线用户；\`redis.opsForHash().put(ONLINE_KEY, userId, nodeId)\` 维护全局在线表；\`messageService.saveAsync\` 异步落库不阻塞推送；\`redis.convertAndSend\` 跨节点广播；前端指数退避重连避免风暴。

## 对比分析

| 维度 | 单机部署 | Redis Pub/Sub 集群 | MQ（RabbitMQ）集群 |
| --- | --- | --- | --- |
| 跨节点广播 | 不支持 | 支持 | 支持 |
| 消息可靠性 | 不保证 | 不保证（Pub 丢失无感知） | 高（ACK + 持久化） |
| 实现复杂度 | 低 | 中 | 高 |
| 消息顺序 | 单机有序 | 不保证全局有序 | 队列内有序 |
| 性能 | 高 | 高 | 中 |
| 适合规模 | 小型 | 中型 | 大型、企业级 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 消息重复渲染 | 网络重发或重连后历史消息再推 | 用 messageId 在前端去重 |
| 离线消息丢失 | 用户上线时没拉离线消息 | 上线后调接口拉 offline_message 表 |
| 大群广播风暴 | 一次推给 5000 人同步卡顿 | 异步分批推送，单次推送限频 |
| 单点登录踢人后旧会话不释放 | close 异步，事件延迟 | 加 maxIdleTimeout 兜底，定时扫描僵尸 session |
| Redis Pub/Sub 消息丢失 | 订阅者不在线时消息直接丢 | 需要可靠性就上 MQ |
| 前端断线重连风暴 | 服务挂后所有客户端同时重连 | 指数退避 + 随机抖动 |
| 心跳不生效 | 服务端没回 PONG 或客户端没检测 | 客户端记录最近 PONG 时间，超时主动 close |
| 消息顺序乱 | 多线程推送无序 | 同一会话消息串行化，或用 seq 字段排序 |
| 跨时区时间显示乱 | 服务器存 UTC 但客户端按本地解析 | 统一存时间戳（毫秒），客户端按本地时区格式化 |
| 鉴权 token 过期后连接还能用 | 握手时校验后不再校验 | 长 token 续期，或定期发心跳校验 |
`
  },
];
