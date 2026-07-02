// =============================================================
// FastAPI 应用开发实战教程 - 第 12 批章节（WebSocket 实时通信篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   45. ws-basics    : WebSocket 基础
//   46. ws-broadcast : 广播与连接管理
//   47. ws-rooms    : 房间机制与私聊
//   48. ws-sse       : SSE 与实时通信选型
//
// 技术栈：FastAPI 0.110+ / Starlette WebSocket / asyncio
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"WebSocket 实时通信"
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十五章：WebSocket 基础
  // =========================================================
  {
    id: "ws-basics",
    group: "WebSocket 实时通信",
    icon: "🔌",
    title: "WebSocket 基础",
    content: `

# WebSocket 基础

## 一、HTTP 的局限：服务器没法主动找你

到目前为止我们写的所有接口都是 HTTP——**请求-响应**模型：客户端发请求，服务器被动回响应。这个模型有个根本限制：**服务器没法主动给客户端推消息**。

这在很多场景下是问题：

\`\`\`txt filename="需要服务器推送的场景"
- 聊天：别人发消息给你，服务器要推给你
- 协作编辑：同事改了文档，你的屏幕要实时更新
- 股票行情：价格变化要实时推送
- 通知：有新消息要提醒
↑ 这些场景靠"客户端每隔 1 秒问一次"（轮询）既浪费又延迟
\`\`\`

WebSocket 就是为"双向实时通信"而生的协议。

## 二、WebSocket 是什么

**WebSocket** 是一种在单个 TCP 连接上进行**全双工通信**的协议（RFC 6455）。和 HTTP 的关键区别：

| 维度 | HTTP | WebSocket |
|------|------|-----------|
| 通信方向 | 单向（客户端请求→服务器响应） | 双向（双方都能主动发消息） |
| 连接生命周期 | 短连接（请求完就断） | 长连接（一直保持） |
| 谁能主动发 | 只有客户端 | 服务器也能主动推 |
| 协议前缀 | http:// https:// | ws:// wss:// |
| 头开销 | 每次都带完整头 | 握手后帧头很小 |

\`\`\`txt filename="WebSocket 工作流程"
1. 客户端发 HTTP 请求，带 Upgrade: websocket 头
   GET /ws HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade
2. 服务器同意，返回 101 Switching Protocols
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
3. 握手完成，连接从 HTTP "升级"为 WebSocket
4. 之后双方在这个长连接上自由收发"帧"（frame）
   服务器想推就推，不用等客户端先问
5. 任一方可以主动关闭连接
\`\`\`

\`\`\`txt filename="轮询 vs WebSocket"
轮询（HTTP）：客户端每秒问一次"有新消息吗"
  → 大部分回答"没有"，浪费带宽和服务器资源
  → 最坏延迟 1 秒
长轮询：客户端问，服务器没消息就挂着不回，有了才回
  → 减少空轮询，但实现复杂
WebSocket：连接保持，有消息服务器直接推
  → 零空请求，实时性最好
\`\`\`

## 三、ws:// vs wss://

就像 HTTP 有 https，WebSocket 有 wss：

- **ws://**：明文传输，握手后数据不加密。**仅开发/内网用**。
- **wss://**：WebSocket over TLS，数据加密。**生产必用**。

浏览器出于安全，不允许在 https 页面里连 ws://（混合内容被拦截），所以生产环境 https 站点必须用 wss://。wss 通常在反向代理（Nginx）层做 TLS 终结，再转 ws 给后端。

## 四、FastAPI 里的 WebSocket 路由

FastAPI（基于 Starlette）用 \`@app.websocket()\` 定义 WebSocket 路由，参数是一个 \`WebSocket\` 对象：

\`\`\`python filename="最简 WebSocket"
# 从 fastapi 导入 FastAPI, WebSocket
from fastapi import FastAPI, WebSocket

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.websocket
@app.websocket("/ws")
# 定义异步函数 websocket_endpoint，参数: ws: WebSocket
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()                    # 1. 接受连接（握手完成）
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            data = await ws.receive_text()   # 2. 接收客户端消息
            await ws.send_text(f"echo: {data}")  # 3. 回发消息
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        print("客户端断开")               # 4. 处理断开
\`\`\`

### WebSocket 对象的核心方法

| 方法 | 作用 | 说明 |
|------|------|------|
| \`await ws.accept()\` | 接受握手 | 必须先调用，否则连接挂起 |
| \`await ws.receive_text()\` | 接收文本消息 | 阻塞直到收到消息 |
| \`await ws.receive_bytes()\` | 接收二进制 | 图片、文件等 |
| \`await ws.receive_json()\` | 接收 JSON | 自动解析 |
| \`await ws.send_text(msg)\` | 发送文本 | 主动推消息给客户端 |
| \`await ws.send_bytes(b)\` | 发送二进制 | |
| \`await ws.send_json(obj)\` | 发送 JSON | 自动序列化 |
| \`await ws.close(code, reason)\` | 主动关闭 | code 是状态码 |

> 注意：所有方法都是 \`async\`，必须 \`await\`。WebSocket 是异步协议，基于事件循环。

## 五、连接生命周期

\`\`\`txt filename="WebSocket 生命周期"
建立 → accept() → 通信循环(receive/send) → 断开(任一方关闭)
                                      ↑
                            异常：客户端断网、超时、服务重启
\`\`\`

\`\`\`python filename="完整生命周期处理"
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 从 starlette.websockets 导入 WebSocketState
from starlette.websockets import WebSocketState

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.websocket
@app.websocket("/ws/{client_id}")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket, client_id: str
async def ws_endpoint(ws: WebSocket, client_id: str):
    # await ws.accept()
    await ws.accept()
    # 调用 print()
    print(f"客户端 {client_id} 已连接")
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 msg，赋值为 await ws.receive_text()
            msg = await ws.receive_text()
            # 业务处理
            # 定义变量 reply，赋值为 f"[{client_id}] 收到: {msg}"
            reply = f"[{client_id}] 收到: {msg}"
            # await ws.send_text(reply)
            await ws.send_text(reply)
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 客户端主动断开或网络断开
        # 调用 print()
        print(f"客户端 {client_id} 断开")
    # 捕获 Exception 异常，赋值为 e
    except Exception as e:
        # 其他异常（如运行时错误）
        # 调用 print()
        print(f"异常: {e}")
    # 无论是否异常都执行
    finally:
        # 检查连接状态，必要时关闭
        # 条件判断：如果 ws.client_state != WebSocketState.DISCONNECTED
        if ws.client_state != WebSocketState.DISCONNECTED:
            # await ws.close(code=1000, reason="服务端关闭")
            await ws.close(code=1000, reason="服务端关闭")
\`\`\`

### WebSocket 关闭码

| 码 | 含义 | 谁发 |
|----|------|------|
| 1000 | 正常关闭 | 任一方 |
| 1001 | 端点离开（如关浏览器） | 客户端 |
| 1006 | 异常关闭（没发关闭帧，如断网） | 浏览器自动 |
| 1011 | 服务器内部错误 | 服务端 |
| 4000-4999 | 应用自定义 | 应用 |

## 六、Echo 服务器示例

经典入门例子：客户端发什么，服务器原样回什么。

\`\`\`python filename="Echo 服务器"
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio 模块
import asyncio

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.websocket
@app.websocket("/echo")
# 定义异步函数 echo，参数: ws: WebSocket
async def echo(ws: WebSocket):
    # await ws.accept()
    await ws.accept()
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 msg，赋值为 await ws.receive_text()
            msg = await ws.receive_text()
            # await ws.send_text(msg)
            await ws.send_text(msg)
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        pass   # 客户端走了，安静退出
\`\`\`

\`\`\`html filename="客户端 HTML/JS"
# <!-- 浏览器内置 WebSocket API -->
<!-- 浏览器内置 WebSocket API -->
# <script>
<script>
# const ws = new WebSocket("ws://localhost:8000/echo
const ws = new WebSocket("ws://localhost:8000/echo");
# ws.onopen = () => console.log("已连接");
ws.onopen = () => console.log("已连接");
# ws.onmessage = (e) => console.log("收到:", e.data);
ws.onmessage = (e) => console.log("收到:", e.data);
# ws.onclose = () => console.log("断开");
ws.onclose = () => console.log("断开");
# ws.onerror = (e) => console.log("错误", e);
ws.onerror = (e) => console.log("错误", e);

# // 发送消息
// 发送消息
# 调用 ws.send()
ws.send("hello");
# </script>
</script>
\`\`\`

## 七、客户端断开处理

最常见的问题是：客户端断网或关浏览器，服务端怎么知道？答案是 \`receive_text()\` 会抛 \`WebSocketDisconnect\` 异常。但有时异常不会立刻抛出（TCP 没及时检测到断连），需要**心跳机制**：

\`\`\`python filename="心跳保活"
# 导入 asyncio 模块
import asyncio

# 装饰器：app.websocket
@app.websocket("/ws")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket
async def ws_endpoint(ws: WebSocket):
    # await ws.accept()
    await ws.accept()
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 尝试执行，捕获异常
            try:
                # 设超时，超时发心跳
                # 定义变量 msg，赋值为 await asyncio.wait_for(ws.receive_text(), tim...
                msg = await asyncio.wait_for(ws.receive_text(), timeout=30)
            # except asyncio.TimeoutError:
            except asyncio.TimeoutError:
                # 30 秒没消息，发心跳探测
                # 尝试执行，捕获异常
                try:
                    await ws.send_text("ping")   # 客户端应回 "pong"
                # 捕获 Exception 异常
                except Exception:
                    break   # 发不出去，说明断了
            # 否则执行
            else:
                # await ws.send_text(f"echo: {msg}")
                await ws.send_text(f"echo: {msg}")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 空操作占位
        pass
\`\`\`

\`\`\`txt filename="心跳的作用"
1. 保活：中间设备（NAT、负载均衡）会清理空闲连接，心跳保持连接活跃
2. 探活：发了 ping 客户端没回 pong，说明客户端已断，服务端及时清理
3. 检测半开连接：TCP 半开（一端已断另一端不知道）靠心跳发现
\`\`\`

## 八、WebSocket vs HTTP：什么时候用哪个

| 场景 | 推荐协议 | 理由 |
|------|----------|------|
| 一次性数据查询 | HTTP | 请求完即返回，无需保持连接 |
| 文件上传下载 | HTTP | HTTP 流成熟 |
| 聊天 | WebSocket | 双向实时 |
| 协作编辑 | WebSocket | 双向实时 |
| 股票行情 | WebSocket/SSE | 服务器推送 |
| 通知推送 | SSE | 单向推送足够 |
| 表单提交 | HTTP | 一次性 |
| REST API | HTTP | 无状态、易缓存 |

> 不要滥用 WebSocket。如果只是"查个数据"，HTTP 更简单、更可缓存、更易调试。WebSocket 适合"持续双向通信"的场景。

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 忘了 \`accept()\` | 客户端一直连不上 | 先 \`await ws.accept()\` |
| 阻塞循环里不处理断开 | 服务端协程卡死 | try/except WebSocketDisconnect |
| 没有心跳 | 半开连接堆积 | 加心跳保活 |
| 生产用 ws:// 明文 | 被中间人窃听 | 用 wss:// |
| 在 receive 前发消息 | 客户端没收到 | 先 accept 再通信 |
| 长连接占资源 | 连接数爆炸 | 限制最大连接数 |
| 异常没兜底 | 协程崩，连接泄漏 | try/finally 确保关闭 |
| 共享可变状态不加锁 | 多协程数据错乱 | 用 asyncio.Lock 或单写者模式 |

## 十、小结

WebSocket 提供全双工长连接，适合需要服务器主动推送的实时场景。\`@app.websocket()\` + \`WebSocket\` 对象是 FastAPI 的入口：\`accept\` 握手、\`receive/send\` 通信、捕获 \`WebSocketDisconnect\` 处理断开。务必加心跳保活，生产用 wss。但单个连接只能和单客户端通信，要实现"群聊""广播"需要管理多个连接——下一章讲这个。
`
  },

  // =========================================================
  // 第四十六章：广播与连接管理
  // =========================================================
  {
    id: "ws-broadcast",
    group: "WebSocket 实时通信",
    icon: "📢",
    title: "广播与连接管理",
    content: `

# 广播与连接管理

## 一、单个连接不够：要管一群

上一章的 Echo 服务器只能和单个客户端一对一通信。但聊天室要"一个人发消息，所有人都能收到"，这需要**管理多个连接**并**广播**。

\`\`\`txt filename="广播的需求"
alice 发 "大家好" → 服务器收到
                → 找到当前所有在线连接（alice、bob、carol）
                → 给每个连接都 send_text("alice: 大家好")
\`\`\`

核心问题是：服务器要把所有活跃的 WebSocket 连接"记住"，需要时遍历它们推送消息。这就是 **ConnectionManager（连接管理器）** 的职责。

## 二、ConnectionManager 类

把"管理连接"的逻辑封装成一个类，路由里只管用：

\`\`\`python filename="connection_manager.py"
# 从 fastapi 导入 WebSocket
from fastapi import WebSocket
# 从 typing 导入 Set
from typing import Set

# 定义类 ConnectionManager
class ConnectionManager:
    # """管理所有活跃的 WebSocket 连接。"""
    """管理所有活跃的 WebSocket 连接。"""
    # 定义函数 __init__，参数: self
    def __init__(self):
        # 用集合存连接（去重、快速增删）
        # self.active_connections: Set[WebSocket] = set()
        self.active_connections: Set[WebSocket] = set()

    # 定义异步函数 connect，参数: self, ws: WebSocket
    async def connect(self, ws: WebSocket):
        # """接受新连接并加入集合。"""
        """接受新连接并加入集合。"""
        await ws.accept()                  # 握手
        self.active_connections.add(ws)     # 记住这个连接
        # 调用 print()
        print(f"当前在线: {len(self.active_connections)}")

    # 定义函数 disconnect，参数: self, ws: WebSocket
    def disconnect(self, ws: WebSocket):
        # """连接断开时移除。"""
        """连接断开时移除。"""
        self.active_connections.discard(ws)   # discard 不存在也不报错
        # 调用 print()
        print(f"当前在线: {len(self.active_connections)}")

    # 定义异步函数 broadcast，参数: self, message: str
    async def broadcast(self, message: str):
        # """广播：给所有在线连接发消息。"""
        """广播：给所有在线连接发消息。"""
        # 复制一份遍历，避免遍历时集合变动
        # 定义列表 dead
        dead = []
        # 遍历 list(self.active_connections)，取 ws
        for ws in list(self.active_connections):
            # 尝试执行，捕获异常
            try:
                # await ws.send_text(message)
                await ws.send_text(message)
            # 捕获 Exception 异常
            except Exception:
                # 发不出去说明连接已断，标记清理
                # 调用 dead.append()
                dead.append(ws)
        # 遍历 dead，取 ws
        for ws in dead:
            # 调用 self.active_connections.discard()
            self.active_connections.discard(ws)

    # 定义异步函数 send_personal，参数: self, ws: WebSocket, message: str
    async def send_personal(self, ws: WebSocket, message: str):
        # """单发：只给指定连接发。"""
        """单发：只给指定连接发。"""
        # await ws.send_text(message)
        await ws.send_text(message)

# 全局单例
# 定义变量 manager，赋值为 ConnectionManager()
manager = ConnectionManager()
\`\`\`

### 设计要点

1. **用 \`set\` 而非 \`list\`**：连接去重，增删 O(1)。
2. **\`connect\` 里 accept**：把握手和登记合并，路由更简洁。
3. **\`disconnect\` 用 \`discard\` 而非 \`remove\`**：移除时连接可能不在集合里（已清理过），discard 不报错。
4. **\`broadcast\` 遍历副本**：\`list(self.active_connections)\` 复制一份，避免遍历时改集合。
5. **广播时清理死连接**：发失败的就移除，防止集合里堆积僵尸连接。

## 三、聊天室路由

\`\`\`python filename="聊天室"
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.websocket
@app.websocket("/ws/chat/{username}")
# 定义异步函数 chat_endpoint，参数: ws: WebSocket, username: str
async def chat_endpoint(ws: WebSocket, username: str):
    await manager.connect(ws)             # 1. 连接并加入管理器
    await manager.broadcast(f"📢 {username} 加入了聊天室")   # 2. 广播上线通知
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            msg = await ws.receive_text()             # 3. 接收消息
            await manager.broadcast(f"{username}: {msg}")  # 4. 广播给所有人
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        manager.disconnect(ws)                          # 5. 断开时移除
        # await manager.broadcast(f"📢 {username} 离开了聊天室")
        await manager.broadcast(f"📢 {username} 离开了聊天室")
\`\`\`

\`\`\`txt filename="广播时序"
alice 连接 → manager.connect → 广播"alice 加入"
alice 发 "嗨" → receive → broadcast"alice: 嗨" → alice/bob/carol 都收到
alice 断开 → manager.disconnect → 广播"alice 离开"
\`\`\`

## 四、单发：私聊（一对一）

\`\`\`python filename="私聊"
# 定义类 ConnectionManager
class ConnectionManager:
    # 定义函数 __init__，参数: self
    def __init__(self):
        # 用字典存：用户名 → 连接，便于按用户定向发送
        # self.connections: dict[str, WebSocket] = {}
        self.connections: dict[str, WebSocket] = {}

    # 定义异步函数 connect，参数: self, username: str, ws: WebSocket
    async def connect(self, username: str, ws: WebSocket):
        # await ws.accept()
        await ws.accept()
        # self.connections[username] = ws
        self.connections[username] = ws

    # 定义函数 disconnect，参数: self, username: str
    def disconnect(self, username: str):
        # 调用 self.connections.pop()
        self.connections.pop(username, None)

    # 定义异步函数 send_to_user，返回: bool
    async def send_to_user(self, target: str, message: str) -> bool:
        # """私聊：只给指定用户发。返回是否成功。"""
        """私聊：只给指定用户发。返回是否成功。"""
        # 定义变量 ws，赋值为 self.connections.get(target)
        ws = self.connections.get(target)
        # 条件判断：如果 ws is None
        if ws is None:
            return False   # 用户不在线
        # 尝试执行，捕获异常
        try:
            # await ws.send_text(message)
            await ws.send_text(message)
            # 返回 True
            return True
        # 捕获 Exception 异常
        except Exception:
            # 调用 self.disconnect()
            self.disconnect(target)
            # 返回 False
            return False

    # 定义异步函数 broadcast，参数: self, message: str
    async def broadcast(self, message: str):
        # 遍历 list(self.connections.items())，取 username, ws
        for username, ws in list(self.connections.items()):
            # 尝试执行，捕获异常
            try:
                # await ws.send_text(message)
                await ws.send_text(message)
            # 捕获 Exception 异常
            except Exception:
                # 调用 self.disconnect()
                self.disconnect(username)
\`\`\`

\`\`\`python filename="私聊路由"
# 约定消息格式：{"type": "private", "to": "bob", "text": "你好"}
# 装饰器：app.websocket
@app.websocket("/ws/{username}")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket, username: str
async def ws_endpoint(ws: WebSocket, username: str):
    # await manager.connect(username, ws)
    await manager.connect(username, ws)
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 data，赋值为 await ws.receive_json()
            data = await ws.receive_json()
            # 条件判断：如果 data["type"] == "private"
            if data["type"] == "private":
                # 定义变量 sent，赋值为 await manager.send_to_user(data["to"], f"[私聊]...
                sent = await manager.send_to_user(data["to"], f"[私聊] {username}: {data['text']}")
                # 条件判断：如果 not sent
                if not sent:
                    # await manager.send_to_user(username, f"⚠ 用户 {data[
                    await manager.send_to_user(username, f"⚠ 用户 {data['to']} 不在线")
            # 否则如果 data["type"] == "broadcast"
            elif data["type"] == "broadcast":
                # await manager.broadcast(f"{username}: {data['text'
                await manager.broadcast(f"{username}: {data['text']}")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 调用 manager.disconnect()
        manager.disconnect(username)
\`\`\`

## 五、连接异常处理：断开时清理

客户端可能"粗暴断开"——关浏览器、断网、手机切后台。服务端必须保证：

1. **断开时从管理器移除**：否则广播时给死连接发消息，浪费时间还报错。
2. **广播时容错**：发送失败的连接要清理，不能让一个死连接拖垮整个广播。

\`\`\`python filename="健壮的异常处理"
# 装饰器：app.websocket
@app.websocket("/ws/{username}")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket, username: str
async def ws_endpoint(ws: WebSocket, username: str):
    # await manager.connect(username, ws)
    await manager.connect(username, ws)
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 msg，赋值为 await ws.receive_text()
            msg = await ws.receive_text()
            # await manager.broadcast(f"{username}: {msg}")
            await manager.broadcast(f"{username}: {msg}")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        pass   # 正常断开
    # 捕获 Exception 异常，赋值为 e
    except Exception as e:
        # 调用 print()
        print(f"未知异常 {username}: {e}")
    # 无论是否异常都执行
    finally:
        # ★ 无论怎么结束都清理，确保不泄漏
        # 调用 manager.disconnect()
        manager.disconnect(username)
        # await manager.broadcast(f"📢 {username} 离开")
        await manager.broadcast(f"📢 {username} 离开")
\`\`\`

> \`finally\` 块是关键：无论正常断开、异常、还是协程被取消，都会执行清理。把 \`disconnect\` 放在 \`finally\` 里，保证连接一定被移除。

## 六、线程安全 / 协程安全

WebSocket 是异步的，多个连接的协程并发访问同一个 \`manager.active_connections\`。Python 协程虽然单线程，但 \`await\` 点会切换协程，可能出现：

\`\`\`txt filename="并发问题场景"
协程A：在 broadcast 遍历 connections
协程B：同时 connect() 往 connections 加新连接
↑ 遍历时集合被改，可能抛 RuntimeError: Set changed size during iteration

解决：遍历前复制一份（list(self.connections)）
     或用 asyncio.Lock 串行化关键操作
\`\`\`

\`\`\`python filename="用锁保护"
# 导入 asyncio 模块
import asyncio

# 定义类 ConnectionManager
class ConnectionManager:
    # 定义函数 __init__，参数: self
    def __init__(self):
        # self.connections: dict[str, WebSocket] = {}
        self.connections: dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()   # 异步锁

    # 定义异步函数 broadcast，参数: self, message: str
    async def broadcast(self, message: str):
        async with self._lock:   # 加锁，避免遍历时被改
            # 遍历 list(self.connections.values())，取 ws
            for ws in list(self.connections.values()):
                # 尝试执行，捕获异常
                try:
                    # await ws.send_text(message)
                    await ws.send_text(message)
                # 捕获 Exception 异常
                except Exception:
                    # 空操作占位
                    pass
\`\`\`

> 实务中，遍历前 \`list(...)\` 复制一份通常就够了（开销小）。锁用于更复杂的"读-改-写"原子操作。注意：\`await ws.send_text\` 时不要持锁太久（发送是 I/O，会阻塞其他协程），尽量缩小锁的临界区。

## 七、限制最大连接数

\`\`\`python filename="限制连接数"
# 定义变量 MAX_CONNECTIONS，赋值为 1000
MAX_CONNECTIONS = 1000

# 装饰器：app.websocket
@app.websocket("/ws")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket
async def ws_endpoint(ws: WebSocket):
    # 条件判断：如果 len(manager.active_connections) >= MAX_CONNECTIONS
    if len(manager.active_connections) >= MAX_CONNECTIONS:
        # 超过上限，拒绝连接
        # await ws.accept()
        await ws.accept()
        # await ws.send_text("服务器忙，请稍后再试")
        await ws.send_text("服务器忙，请稍后再试")
        await ws.close(code=1013, reason="Try Again Later")   # 1013 = Try Again Later
        # 返回
        return
    # await manager.connect(ws)
    await manager.connect(ws)
    # ...
\`\`\`

> 不限制最大连接数，恶意客户端可以开海量连接把服务器资源耗尽（每个连接占内存 + 一个协程）。生产环境一定要设上限 + 限流。

## 八、完整聊天室示例

\`\`\`python filename="完整聊天室"
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio 模块
import asyncio

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义类 ChatManager
class ChatManager:
    # 定义函数 __init__，参数: self
    def __init__(self):
        # self.connections: dict[str, WebSocket] = {}
        self.connections: dict[str, WebSocket] = {}

    # 定义异步函数 connect，参数: self, username: str, ws: WebSocket
    async def connect(self, username: str, ws: WebSocket):
        # await ws.accept()
        await ws.accept()
        # self.connections[username] = ws
        self.connections[username] = ws
        # await self.broadcast(f"📢 {username} 上线（当前 {len(sel
        await self.broadcast(f"📢 {username} 上线（当前 {len(self.connections)} 人在线）")

    # 定义函数 disconnect，参数: self, username: str
    def disconnect(self, username: str):
        # 调用 self.connections.pop()
        self.connections.pop(username, None)

    # 定义异步函数 broadcast，参数: self, message: str
    async def broadcast(self, message: str):
        # 定义列表 dead
        dead = []
        # 遍历 list(self.connections.items())，取 name, ws
        for name, ws in list(self.connections.items()):
            # 尝试执行，捕获异常
            try:
                # await ws.send_text(message)
                await ws.send_text(message)
            # 捕获 Exception 异常
            except Exception:
                # 调用 dead.append()
                dead.append(name)
        # 遍历 dead，取 name
        for name in dead:
            # 调用 self.connections.pop()
            self.connections.pop(name, None)
        # 条件判断：如果 dead
        if dead:
            # await self.broadcast(f"📢 {','.join(dead)} 已掉线")
            await self.broadcast(f"📢 {','.join(dead)} 已掉线")

    # 定义异步函数 send_to，返回: bool
    async def send_to(self, target: str, message: str) -> bool:
        # 定义变量 ws，赋值为 self.connections.get(target)
        ws = self.connections.get(target)
        # 条件判断：如果 not ws
        if not ws:
            # 返回 False
            return False
        # 尝试执行，捕获异常
        try:
            # await ws.send_text(message)
            await ws.send_text(message)
            # 返回 True
            return True
        # 捕获 Exception 异常
        except Exception:
            # 调用 self.disconnect()
            self.disconnect(target)
            # 返回 False
            return False

# 定义变量 manager，赋值为 ChatManager()
manager = ChatManager()

# 装饰器：app.websocket
@app.websocket("/ws/chat/{username}")
# 定义异步函数 chat，参数: ws: WebSocket, username: str
async def chat(ws: WebSocket, username: str):
    # await manager.connect(username, ws)
    await manager.connect(username, ws)
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 data，赋值为 await ws.receive_json()
            data = await ws.receive_json()
            # 条件判断：如果 data["type"] == "msg"
            if data["type"] == "msg":
                # await manager.broadcast(f"{username}: {data['text'
                await manager.broadcast(f"{username}: {data['text']}")
            # 否则如果 data["type"] == "private"
            elif data["type"] == "private":
                # 定义变量 ok，赋值为 await manager.send_to(data["to"], f"[私聊]{user...
                ok = await manager.send_to(data["to"], f"[私聊]{username}: {data['text']}")
                # 条件判断：如果 not ok
                if not ok:
                    # await manager.send_to(username, f"⚠ {data['to']} 不
                    await manager.send_to(username, f"⚠ {data['to']} 不在线")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 空操作占位
        pass
    # 无论是否异常都执行
    finally:
        # 调用 manager.disconnect()
        manager.disconnect(username)
        # await manager.broadcast(f"📢 {username} 下线")
        await manager.broadcast(f"📢 {username} 下线")
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 断开不移除 | 集合堆积僵尸连接 | \`finally\` 里 disconnect |
| 遍历时改集合 | RuntimeError | 遍历前 \`list(...)\` 复制 |
| 广播不给死连接容错 | 一个死连接拖垮广播 | try/except 清理失败连接 |
| 不限最大连接数 | 资源耗尽 | 设上限 + 拒绝超额连接 |
| 持锁 await I/O | 锁住其他协程 | 缩小临界区或用复制遍历 |
| 用 \`remove\` 移除 | KeyError | 用 \`discard\` / \`pop(k, None)\` |
| 私聊查用户遍历 | 慢 | 用 dict 按用户名索引 |
| 重复 connect 同一用户 | 连接覆盖，旧连接泄漏 | 连接前先踢旧连接 |

## 十、小结

ConnectionManager 封装"连接集合 + connect/disconnect/broadcast/send_to"四件套。用 \`set\`/\`dict\` 存连接，遍历广播前复制一份防并发改集合，\`finally\` 块保证断开必清理。生产要限制最大连接数、给死连接容错。下一章我们升级连接管理，引入"房间"概念支持多频道聊天。
`
  },

  // =========================================================
  // 第四十七章：房间机制与私聊
  // =========================================================
  {
    id: "ws-rooms",
    group: "WebSocket 实时通信",
    icon: "🚪",
    title: "房间机制与私聊",
    content: `

# 房间机制与私聊

## 一、为什么需要房间

上一章的聊天室是"一个大厅"——所有人都在一个频道，谁发消息所有人都收到。但真实需求往往是**多频道**：

- 群聊 App：有几十个群，每个群是一个独立频道。
- 直播：每个直播间是一个房间，互不干扰。
- 协作：每个文档/白板是一个房间。

如果只有一个全局广播，所有消息混在一起，前端要自己过滤，浪费带宽还混乱。**房间（Room）** 机制就是按主题把连接分组，消息只在组内广播。

\`\`\`txt filename="房间模型"
┌─ 房间 "tech" ─────────────┐  ┌─ 房间 "music" ───────────┐
│  alice, bob, carol        │  │  dave, eve              │
│  → 消息只发给这三人        │  │  → 消息只发给这两人       │
└──────────────────────────┘  └─────────────────────────┘
       ↑ 互不影响，互不串台
\`\`\`

## 二、Room 的数据结构

\`\`\`python filename="room_manager.py"
# 从 fastapi 导入 WebSocket
from fastapi import WebSocket
# 从 collections 导入 defaultdict
from collections import defaultdict
# 导入 asyncio 模块
import asyncio

# 定义类 RoomManager
class RoomManager:
    # """按房间分组管理连接。"""
    """按房间分组管理连接。"""
    # 定义函数 __init__，参数: self
    def __init__(self):
        # rooms: 房间名 → 该房间的连接集合
        # defaultdict(set) 自动初始化新房间
        # self.rooms: dict[str, set[WebSocket]] = defaultdic
        self.rooms: dict[str, set[WebSocket]] = defaultdict(set)

    # 定义异步函数 join，参数: self, room: str, ws: WebSocket
    async def join(self, room: str, ws: WebSocket):
        # """加入房间（已 accept 过的连接）。"""
        """加入房间（已 accept 过的连接）。"""
        # self.rooms[room].add(ws)
        self.rooms[room].add(ws)

    # 定义函数 leave，参数: self, room: str, ws: WebSocket
    def leave(self, room: str, ws: WebSocket):
        # """离开房间。"""
        """离开房间。"""
        # 条件判断：如果 room in self.rooms
        if room in self.rooms:
            # self.rooms[room].discard(ws)
            self.rooms[room].discard(ws)
            # 房间空了就删，避免内存泄漏
            # 条件判断：如果 not self.rooms[room]
            if not self.rooms[room]:
                # del self.rooms[room]
                del self.rooms[room]

    # 定义异步函数 broadcast_to_room，参数: self, room: str, message: str
    async def broadcast_to_room(self, room: str, message: str):
        # """房间内广播：只发给该房间的连接。"""
        """房间内广播：只发给该房间的连接。"""
        # 定义变量 members，赋值为 self.rooms.get(room, set())
        members = self.rooms.get(room, set())
        # 定义列表 dead
        dead = []
        # 遍历 list(members)，取 ws
        for ws in list(members):
            # 尝试执行，捕获异常
            try:
                # await ws.send_text(message)
                await ws.send_text(message)
            # 捕获 Exception 异常
            except Exception:
                # 调用 dead.append()
                dead.append(ws)
        # 遍历 dead，取 ws
        for ws in dead:
            # 调用 members.discard()
            members.discard(ws)
        # 条件判断：如果 room in self.rooms and not self.rooms[room]
        if room in self.rooms and not self.rooms[room]:
            # del self.rooms[room]
            del self.rooms[room]

    # 定义函数 room_size，返回: int
    def room_size(self, room: str) -> int:
        # 返回 len(self.rooms.get(room, set()))
        return len(self.rooms.get(room, set()))

# 定义变量 manager，赋值为 RoomManager()
manager = RoomManager()
\`\`\`

> 关键：房间空了要 \`del\`，否则 \`rooms\` 字典会无限增长（用户进出每个房间名都留个空 set），内存泄漏。

## 三、加入 / 离开 / 房间内广播

\`\`\`python filename="多房间聊天"
# 从 fastapi 导入 FastAPI, WebSocket, WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建 FastAPI 应用实例
app = FastAPI()

# 装饰器：app.websocket
@app.websocket("/ws/chat/{room}/{username}")
# 定义异步函数 room_chat，参数: ws: WebSocket, room: str, username: str
async def room_chat(ws: WebSocket, room: str, username: str):
    # await ws.accept()
    await ws.accept()
    await manager.join(room, ws)   # 加入指定房间
    # await manager.broadcast_to_room(room, f"📢 {usernam
    await manager.broadcast_to_room(room, f"📢 {username} 加入房间")
    # await ws.send_text(f"欢迎 {username}，房间 {room} 当前 {m
    await ws.send_text(f"欢迎 {username}，房间 {room} 当前 {manager.room_size(room)} 人")
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 msg，赋值为 await ws.receive_text()
            msg = await ws.receive_text()
            # 消息只广播给同房间的人
            # await manager.broadcast_to_room(room, f"{username}
            await manager.broadcast_to_room(room, f"{username}: {msg}")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 空操作占位
        pass
    # 无论是否异常都执行
    finally:
        manager.leave(room, ws)   # 离开房间
        # await manager.broadcast_to_room(room, f"📢 {usernam
        await manager.broadcast_to_room(room, f"📢 {username} 离开房间")
\`\`\`

\`\`\`txt filename="房间通信时序"
alice 连 /ws/chat/tech/alice → 加入 tech 房间 → 房间内广播"alice 加入"
bob  连 /ws/chat/tech/bob   → 加入 tech 房间 → 房间内广播"bob 加入"
carol 连 /ws/chat/music/carol → 加入 music 房间
alice 发 "你好" → 只在 tech 广播 → alice、bob 收到，carol 收不到
\`\`\`

## 四、一个用户在多个房间

真实场景：用户同时参加多个群。可以用 \`用户 → 连接\` 和 \`房间 → 连接集合\` 两套索引，让一个连接同时属于多个房间：

\`\`\`python filename="多房间成员"
# 定义类 RoomManager
class RoomManager:
    # 定义函数 __init__，参数: self
    def __init__(self):
        # self.rooms: dict[str, set[WebSocket]] = defaultdic
        self.rooms: dict[str, set[WebSocket]] = defaultdict(set)
        # 反向索引：连接 → 它所在的房间集合（离开时清理用）
        # self.ws_rooms: dict[WebSocket, set[str]] = default
        self.ws_rooms: dict[WebSocket, set[str]] = defaultdict(set)

    # 定义异步函数 join，参数: self, room: str, ws: WebSocket
    async def join(self, room: str, ws: WebSocket):
        # self.rooms[room].add(ws)
        self.rooms[room].add(ws)
        self.ws_rooms[ws].add(room)   # 记录这个连接在哪些房间

    # 定义函数 leave_all，参数: self, ws: WebSocket
    def leave_all(self, ws: WebSocket):
        # """连接断开时，从它所在的所有房间移除。"""
        """连接断开时，从它所在的所有房间移除。"""
        # 遍历 self.ws_rooms.get(ws, set())，取 room
        for room in self.ws_rooms.get(ws, set()):
            # self.rooms[room].discard(ws)
            self.rooms[room].discard(ws)
            # 条件判断：如果 not self.rooms[room]
            if not self.rooms[room]:
                # del self.rooms[room]
                del self.rooms[room]
        # 调用 self.ws_rooms.pop()
        self.ws_rooms.pop(ws, None)
\`\`\`

\`\`\`python filename="多房间路由"
# 装饰器：app.websocket
@app.websocket("/ws/{username}")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket, username: str
async def ws_endpoint(ws: WebSocket, username: str):
    # await ws.accept()
    await ws.accept()
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 data，赋值为 await ws.receive_json()
            data = await ws.receive_json()
            # 条件判断：如果 data["action"] == "join"
            if data["action"] == "join":
                # await manager.join(data["room"], ws)
                await manager.join(data["room"], ws)
                # await ws.send_text(f"已加入 {data['room']}")
                await ws.send_text(f"已加入 {data['room']}")
            # 否则如果 data["action"] == "msg"
            elif data["action"] == "msg":
                # await manager.broadcast_to_room(data["room"], f"{u
                await manager.broadcast_to_room(data["room"], f"{username}: {data['text']}")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 空操作占位
        pass
    # 无论是否异常都执行
    finally:
        manager.leave_all(ws)   # 断开时从所有房间移除
\`\`\`

\`\`\`json filename="客户端发的消息"
{"action": "join", "room": "tech"}
{"action": "join", "room": "music"}
{"action": "msg", "room": "tech", "text": "大家好"}
{"action": "msg", "room": "music", "text": "这首歌不错"}
\`\`\`

## 五、私聊：定向发送

私聊就是"房间大小为 1 的特例"。可以直接用 \`用户名 → 连接\` 字典定向发：

\`\`\`python filename="私聊"
# 定义类 ChatManager
class ChatManager:
    # 定义函数 __init__，参数: self
    def __init__(self):
        # self.rooms: dict[str, set[WebSocket]] = defaultdic
        self.rooms: dict[str, set[WebSocket]] = defaultdict(set)
        self.users: dict[str, WebSocket] = {}   # 用户名 → 连接

    # 定义异步函数 send_private，返回: bool
    async def send_private(self, from_user: str, to_user: str, message: str) -> bool:
        # 定义变量 ws，赋值为 self.users.get(to_user)
        ws = self.users.get(to_user)
        # 条件判断：如果 not ws
        if not ws:
            # 返回 False
            return False
        # 尝试执行，捕获异常
        try:
            # await ws.send_text(f"[私聊] {from_user}: {message}")
            await ws.send_text(f"[私聊] {from_user}: {message}")
            # 返回 True
            return True
        # 捕获 Exception 异常
        except Exception:
            # 调用 self.users.pop()
            self.users.pop(to_user, None)
            # 返回 False
            return False

# 装饰器：app.websocket
@app.websocket("/ws/{username}")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket, username: str
async def ws_endpoint(ws: WebSocket, username: str):
    # await ws.accept()
    await ws.accept()
    manager.users[username] = ws   # 注册在线
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 data，赋值为 await ws.receive_json()
            data = await ws.receive_json()
            # 条件判断：如果 data["type"] == "private"
            if data["type"] == "private":
                # 定义变量 ok，赋值为 await manager.send_private(username, data["to...
                ok = await manager.send_private(username, data["to"], data["text"])
                # 条件判断：如果 not ok
                if not ok:
                    # await ws.send_text(f"⚠ {data['to']} 不在线")
                    await ws.send_text(f"⚠ {data['to']} 不在线")
            # 否则如果 data["type"] == "room_msg"
            elif data["type"] == "room_msg":
                # await manager.broadcast_to_room(data["room"], f"{u
                await manager.broadcast_to_room(data["room"], f"{username}: {data['text']}")
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 空操作占位
        pass
    # 无论是否异常都执行
    finally:
        # 调用 manager.users.pop()
        manager.users.pop(username, None)
        # 调用 manager.leave_all()
        manager.leave_all(ws)
\`\`\`

## 六、WebSocket 握手时认证

WebSocket 握手是 HTTP 升级请求，可以带 \`Authorization\` 头或 query 参数传 token。但浏览器原生 WebSocket API **不能设置自定义请求头**，所以常用 query 参数：

\`\`\`python filename="握手认证"
# 从 fastapi 导入 Query, WebSocket, status
from fastapi import Query, WebSocket, status
# 从 jose 导入 jwt, JWTError
from jose import jwt, JWTError

# 定义异步函数 get_ws_user，返回: str
async def get_ws_user(ws: WebSocket, token: str = Query(...)) -> str:
    # """从 query 参数取 token 验证身份。"""
    """从 query 参数取 token 验证身份。"""
    # 尝试执行，捕获异常
    try:
        # 定义变量 payload，赋值为 jwt.decode(token, SECRET_KEY, algorithms=["HS...
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        # 定义变量 username，赋值为 payload.get("sub")
        username = payload.get("sub")
        # 条件判断：如果 not username
        if not username:
            # 抛出 ValueError 异常: "token 无 sub"
            raise ValueError("token 无 sub")
        # 返回 username
        return username
    # except (JWTError, ValueError):
    except (JWTError, ValueError):
        # 认证失败：在 accept 前关闭连接，返回 401
        # await ws.close(code=status.WS_1008_POLICY_VIOLATIO
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        # 抛出 Exception 异常: "认证失败"
        raise Exception("认证失败")

# 装饰器：app.websocket
@app.websocket("/ws")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket
async def ws_endpoint(ws: WebSocket):
    # 注意：必须在 accept 前认证，否则握手已完成
    # 尝试执行，捕获异常
    try:
        # 定义变量 username，赋值为 await get_ws_user(ws, token=ws.query_params.g...
        username = await get_ws_user(ws, token=ws.query_params.get("token", ""))
    # 捕获 Exception 异常
    except Exception:
        return   # 认证失败已关闭，直接返回
    # await ws.accept()
    await ws.accept()
    # 后续逻辑...
\`\`\`

\`\`\`txt filename="WebSocket 认证的安全注意"
- token 放 query 参数会进服务器日志/浏览器历史，有泄露风险
- 生产建议：用短期 ticket（一次性握手 token），握手后用 cookie 或 challenge
- 或者用 cookie：WebSocket 握手自动带同源 cookie，服务端读 cookie 验证
- wss + cookie + SameSite 是更安全的组合
\`\`\`

\`\`\`html filename="客户端连接"
# // query 参数传 token
// query 参数传 token
# const token = localStorage.getItem("token");
const token = localStorage.getItem("token");
# const ws = new WebSocket("wss://api.example.com/ws
const ws = new WebSocket("wss://api.example.com/ws?token=" + token);
\`\`\`

## 七、在线状态管理

\`\`\`python filename="在线状态"
# 定义类 PresenceManager
class PresenceManager:
    # 定义函数 __init__，参数: self
    def __init__(self):
        self.online: dict[str, set[str]] = defaultdict(set)   # 用户 → 设备ID集合

    # 定义函数 set_online，参数: self, username: str, device: str
    def set_online(self, username: str, device: str):
        # 定义变量 was_offline，赋值为 username not in self.online or not self.onlin...
        was_offline = username not in self.online or not self.online[username]
        # self.online[username].add(device)
        self.online[username].add(device)
        return was_offline   # 是否从离线变在线（要广播上线）

    # 定义函数 set_offline，返回: bool
    def set_offline(self, username: str, device: str) -> bool:
        # self.online[username].discard(device)
        self.online[username].discard(device)
        if not self.online[username]:   # 所有设备都下线了
            # del self.online[username]
            del self.online[username]
            return True   # 真正离线
        # 返回 False
        return False

    # 定义函数 is_online，返回: bool
    def is_online(self, username: str) -> bool:
        # 返回 username in self.online and bool(self.online[username])
        return username in self.online and bool(self.online[username])

    # 定义函数 get_online_users，返回: list[str]
    def get_online_users(self) -> list[str]:
        # 返回 list(self.online.keys())
        return list(self.online.keys())
\`\`\`

> 多设备支持：一个用户可能手机+电脑同时在线，用 \`set\` 存设备 ID，任一设备在线就算在线，全下线才算离线。

\`\`\`python filename="在线状态集成"
# 装饰器：app.websocket
@app.websocket("/ws/{username}")
# 定义异步函数 ws_endpoint，参数: ws: WebSocket, username: str, device: str = "web"
async def ws_endpoint(ws: WebSocket, username: str, device: str = "web"):
    # await ws.accept()
    await ws.accept()
    # 定义变量 just_online，赋值为 presence.set_online(username, device)
    just_online = presence.set_online(username, device)
    # 条件判断：如果 just_online
    if just_online:
        await manager.broadcast(f"🟢 {username} 上线")   # 全网广播上线
    # 尝试执行，捕获异常
    try:
        # 当 True 为真时循环
        while True:
            # 定义变量 data，赋值为 await ws.receive_json()
            data = await ws.receive_json()
            # 条件判断：如果 data["type"] == "list_online"
            if data["type"] == "list_online":
                # await ws.send_json({"online": presence.get_online_
                await ws.send_json({"online": presence.get_online_users()})
    # 捕获 WebSocketDisconnect 异常
    except WebSocketDisconnect:
        # 空操作占位
        pass
    # 无论是否异常都执行
    finally:
        # 定义变量 truly_offline，赋值为 presence.set_offline(username, device)
        truly_offline = presence.set_offline(username, device)
        # 条件判断：如果 truly_offline
        if truly_offline:
            # await manager.broadcast(f"⚪ {username} 离线")
            await manager.broadcast(f"⚪ {username} 离线")
\`\`\`

## 八、踢人机制

管理员把捣乱用户踢出：

\`\`\`python filename="踢人"
# 定义类 RoomManager
class RoomManager:
    # ...
    # 定义异步函数 kick，参数: self, username: str, reason: str = "被管理员移除"
    async def kick(self, username: str, reason: str = "被管理员移除"):
        # 定义变量 ws，赋值为 self.users.get(username)
        ws = self.users.get(username)
        # 条件判断：如果 ws
        if ws:
            # 尝试执行，捕获异常
            try:
                # await ws.send_text(f"⚠ 你已被踢出：{reason}")
                await ws.send_text(f"⚠ 你已被踢出：{reason}")
                await ws.close(code=4001, reason=reason)   # 自定义关闭码
            # 捕获 Exception 异常
            except Exception:
                # 空操作占位
                pass
            # 无论是否异常都执行
            finally:
                # 调用 self.users.pop()
                self.users.pop(username, None)
                # 调用 self.leave_all()
                self.leave_all(ws)

# 管理员 HTTP 接口触发踢人
# 定义 POST 路由：访问 /admin/kick/{username} 时触发
@app.post("/admin/kick/{username}")
# 定义异步函数 kick_user，参数: username: str, admin: User = Depends(require_admin...
async def kick_user(username: str, admin: User = Depends(require_admin)):
    # await manager.kick(username, "管理员操作")
    await manager.kick(username, "管理员操作")
    # 返回 {"msg": f"已踢出 {username}"}
    return {"msg": f"已踢出 {username}"}
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| 空房间不删 | rooms 字典无限增长 | 空了就 \`del\` |
| 用户断开不从所有房间移除 | 房间里留死连接 | 维护反向索引 \`leave_all\` |
| 认证在 accept 后做 | 已握手没法拒绝 | accept 前认证，失败用 \`close\` |
| token 放 query 进日志 | token 泄露 | 用短期 ticket 或 cookie |
| 多设备重复登录覆盖连接 | 旧连接泄漏 | 新连接前先踢旧连接 |
| 在线状态误判 | 设备下线却显示在线 | 多设备计数，全下才算离线 |
| 房间名不校验 | 任意字符串占内存 | 限制房间名白名单/数量 |
| 广播房间不存在不判空 | KeyError | 用 \`.get(room, set())\` |

## 十、小结

房间机制按主题分组连接，消息只在组内广播，避免全频道串台。用 \`rooms: dict[room, set[ws]]\` 正向索引 + \`ws_rooms: dict[ws, set[room]]\` 反向索引，断开时 \`leave_all\` 一次性清理。私聊是房间大小为 1 的特例，用 \`users: dict[name, ws]\` 定向。握手认证要在 accept 前做（浏览器无法设 WS 头，用 query token 或 cookie）。在线状态支持多设备计数。下一章对比 WebSocket 和 SSE，给出实时通信的选型决策。
`
  },

  // =========================================================
  // 第四十八章：SSE 与实时通信选型
  // =========================================================
  {
    id: "ws-sse",
    group: "WebSocket 实时通信",
    icon: "📡",
    title: "SSE 与实时通信选型",
    content: `

# SSE 与实时通信选型

## 一、不是所有实时场景都需要 WebSocket

前三章我们讲了 WebSocket 的强大——全双工、双向、实时。但 WebSocket 也有代价：协议重、状态管理复杂、要管连接池、调试难。**有些场景其实只需要"服务器→客户端"单向推送**，根本用不上双向，这时 SSE 是更轻量的选择。

\`\`\`txt filename="推送方向决定选型"
只需要服务器推给客户端（单向）→ SSE 足矣
需要客户端也推给服务器（双向）→ 必须 WebSocket
\`\`\`

典型例子：
- 股票行情、通知推送、日志流：服务器单向推 → SSE
- 聊天、协作编辑：双向 → WebSocket

## 二、SSE 是什么

**SSE（Server-Sent Events）** 是 HTML5 标准的一部分，让服务器通过 HTTP 持续向客户端推送事件。它本质上是一个**长连接的 HTTP 响应流**——服务器不断往响应体写数据，客户端持续读。

\`\`\`txt filename="SSE 工作原理"
客户端：发一个普通 GET 请求，Accept: text/event-stream
服务器：不结束响应，持续往响应体写 "data: xxx\\n\\n"
客户端：用 EventSource API 持续接收
↑ 全程是 HTTP，不需要协议升级，复用 HTTP 基础设施
\`\`\`

\`\`\`txt filename="SSE 消息格式"
data: 第一条消息\\n\\n
data: 第二条消息\\n\\n
event: update\\n
data: {"price": 100}\\n\\n
id: 42\\n
data: 带ID的消息\\n\\n

↑ 每条消息以两个换行分隔
↑ 可以带 event（事件类型）、id（用于断点续传）
\`\`\`

## 三、SSE vs WebSocket：核心对比

| 维度 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向（服务器→客户端） | 双向 |
| 协议 | HTTP（保持长连接） | 独立协议（ws/wss） |
| 数据格式 | 文本（UTF-8） | 文本 + 二进制 |
| 自动重连 | ✅ 浏览器内置 | ❌ 要自己实现 |
| 断点续传 | ✅ 用 Last-Event-ID | ❌ 无 |
| 连接数限制 | 浏览器每域名 6 个 | 无此限制 |
| 穿透代理 | 容易（就是 HTTP） | 可能被拦（需配置） |
| 复杂度 | 低 | 高 |
| 适合 | 通知、行情、日志 | 聊天、协作 |
| 浏览器 API | EventSource | WebSocket |

### 关键差异解读

**① SSE 自动重连**：浏览器 \`EventSource\` 断开后会自动重连，还会带上 \`Last-Event-ID\` 头，服务器据此从断点续传——这是 SSE 最大的便利。WebSocket 断了要自己写重连逻辑。

**② SSE 连接数限制**：HTTP/1.1 下浏览器对同一域名限制 6 个连接，SSE 会占掉这些额度。HTTP/2 没这个问题（多路复用）。WebSocket 没这个限制。

**③ SSE 穿透代理**：SSE 就是 HTTP，企业代理、CDN、Nginx 都原生支持。WebSocket 需要专门配置 \`Upgrade\` 头，有时被严格代理拦截。

**④ SSE 只能文本**：不能传二进制（图片、文件）。WebSocket 可以。

## 四、SSE 的浏览器端：EventSource

\`\`\`javascript filename="EventSource 用法"
// 创建 EventSource，连接 SSE 端点
// 定义变量 es
const es = new EventSource("/api/notifications");

// 默认消息
// es.onmessage = (e) => {
es.onmessage = (e) => {
// console.log("收到:", e.data);
    console.log("收到:", e.data);
// };
};

// 命名事件
// es.addEventListener("update", (e) => {
es.addEventListener("update", (e) => {
// console.log("update 事件:", e.data);
    console.log("update 事件:", e.data);
// });
});

// 自动重连（浏览器自动做，无需代码）
// es.onerror = () => {
es.onerror = () => {
// console.log("断开了，浏览器会自动重连");
    console.log("断开了，浏览器会自动重连");
// };
};

// 主动关闭
// es.close();
\`\`\`

## 五、FastAPI 实现 SSE：StreamingResponse

FastAPI 用 \`StreamingResponse\` 返回一个流式响应，配合 \`text/event-stream\` 内容类型就是 SSE：

\`\`\`python filename="SSE 基础实现"
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 asyncio 模块
import asyncio
# 导入 json 模块
import json

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义异步函数 event_generator，参数: 
async def event_generator():
    # """生成 SSE 事件流。"""
    """生成 SSE 事件流。"""
    # 遍历 range(10)，取 i
    for i in range(10):
        # 每条消息格式：data: <内容>\\n\\n
        # 生成值: f"data: 消息 {i}\\n\\n"
        yield f"data: 消息 {i}\\n\\n"
        await asyncio.sleep(1)   # 模拟间隔

# 定义 GET 路由：访问 /sse/notifications 时触发
@app.get("/sse/notifications")
# 定义异步函数 notifications，参数: 
async def notifications():
    # 返回 StreamingResponse(
    return StreamingResponse(
        # 调用 event_generator()
        event_generator(),
        media_type="text/event-stream",   # ★ 关键：SSE 的 MIME
        # 定义字典 headers
        headers={
            "Cache-Control": "no-cache",   # 禁止缓存
            "X-Accel-Buffering": "no",    # 禁止 Nginx 缓冲
        # },
        },
    # )
    )
\`\`\`

> 两个响应头很重要：
> - \`Cache-Control: no-cache\`：防止代理缓存流。
> - \`X-Accel-Buffering: no\`：告诉 Nginx 不要缓冲响应（否则消息攒一批才发，失去实时性）。

## 六、推送 JSON 数据

\`\`\`python filename="JSON 推送"
# 定义异步函数 stock_stream，参数: 
async def stock_stream():
    # 定义变量 price，赋值为 100.0
    price = 100.0
    # 当 True 为真时循环
    while True:
        price += random.uniform(-1, 1)   # 模拟价格波动
        # 定义变量 data，赋值为 json.dumps({"price": round(price, 2), "time":...
        data = json.dumps({"price": round(price, 2), "time": time.time()})
        # 多行 data 要每行都加 data: 前缀
        # 生成值: f"data: {data}\\n\\n"
        yield f"data: {data}\\n\\n"
        # await asyncio.sleep(2)
        await asyncio.sleep(2)

# 定义 GET 路由：访问 /sse/stock/{symbol} 时触发
@app.get("/sse/stock/{symbol}")
# 定义异步函数 stock，参数: symbol: str
async def stock(symbol: str):
    # 返回 StreamingResponse(
    return StreamingResponse(
        # 调用 stock_stream()
        stock_stream(),
        # 定义变量 media_type，赋值为 "text/event-stream",
        media_type="text/event-stream",
    # )
    )
\`\`\`

\`\`\`javascript filename="前端接收 JSON"
// 定义变量 es
const es = new EventSource("/sse/stock/AAPL");
// es.onmessage = (e) => {
es.onmessage = (e) => {
    // 定义变量 data
    const data = JSON.parse(e.data);
// console.log("AAPL:", data.price);
    console.log("AAPL:", data.price);
// };
};
\`\`\`

## 七、命名事件

SSE 支持事件类型，前端用 \`addEventListener\` 分别处理：

\`\`\`python filename="命名事件"
# 定义异步函数 mixed_events，参数: 
async def mixed_events():
    # 当 True 为真时循环
    while True:
        # 普通消息
        # 生成值: "data: 心跳\\n\\n"
        yield "data: 心跳\\n\\n"
        # await asyncio.sleep(5)
        await asyncio.sleep(5)
        # 命名事件：event: <类型>\\n
        # 生成值: "event: alert\\ndata: 价格异常\\n\\n"
        yield "event: alert\\ndata: 价格异常\\n\\n"
        # await asyncio.sleep(30)
        await asyncio.sleep(30)

# 定义 GET 路由：访问 /sse/mixed 时触发
@app.get("/sse/mixed")
# 定义异步函数 mixed，参数: 
async def mixed():
    # 返回 StreamingResponse(mixed_events(), media_type="text/event-stream")
    return StreamingResponse(mixed_events(), media_type="text/event-stream")
\`\`\`

\`\`\`javascript filename="前端按事件类型接收"
// 定义变量 es
const es = new EventSource("/sse/mixed");
// es.onmessage = (e) => console.log("默认:", e.data);
es.onmessage = (e) => console.log("默认:", e.data);
// es.addEventListener("alert", (e) => {
es.addEventListener("alert", (e) => {
// console.log("告警:", e.data);
    console.log("告警:", e.data);
    // 弹通知
// });
});
\`\`\`

## 八、断点续传：Last-Event-ID

SSE 重连时浏览器自动带上最后收到的消息 ID：

\`\`\`python filename="断点续传"
# 从 fastapi 导入 Request
from fastapi import Request

# 定义 GET 路由：访问 /sse/log 时触发
@app.get("/sse/log")
# 定义异步函数 log_stream，参数: request: Request
async def log_stream(request: Request):
    # 客户端重连时，浏览器自动带 Last-Event-ID 头
    # 定义变量 last_id，赋值为 request.headers.get("Last-Event-ID", "0")
    last_id = request.headers.get("Last-Event-ID", "0")
    # 定义变量 start_id，赋值为 int(last_id) + 1
    start_id = int(last_id) + 1

    # 定义异步函数 gen，参数: 
    async def gen():
        # 定义变量 current，赋值为 start_id
        current = start_id
        # 从数据库/日志文件读，跳过已发送的
        # 当 True 为真时循环
        while True:
            # 遍历 read_logs_from(current)，取 line
            for line in read_logs_from(current):
                # 带 id 的消息：id: <id>\\n
                # 生成值: f"id: {current}\\ndata: {line}\\n\\n"
                yield f"id: {current}\\ndata: {line}\\n\\n"
                # current += 1
                current += 1
            await asyncio.sleep(1)   # 等新日志

    # 返回 StreamingResponse(gen(), media_type="text/event-stream")
    return StreamingResponse(gen(), media_type="text/event-stream")
\`\`\`

> 这是 SSE 相对 WebSocket 的杀手锏：网络抖动断开后，浏览器自动重连并带 \`Last-Event-ID\`，服务器从断点继续推，不丢消息。WebSocket 要自己实现这套逻辑。

## 九、Long Polling：第三种选择

\`\`\`txt filename="长轮询"
客户端发请求 → 服务器没新数据就挂着不回（不结束响应）
            → 有新数据或超时才返回
            → 客户端立刻再发下一个请求
↑ 实时性不如 SSE/WS，但兼容性最好（老浏览器、严格代理）
↑ 实现比 SSE 简单（普通 HTTP），但比 SSE 浪费（每次新请求头）
\`\`\`

\`\`\`python filename="长轮询"
# 定义 GET 路由：访问 /poll/messages 时触发
@app.get("/poll/messages")
# 定义异步函数 poll，参数: user_id: str
async def poll(user_id: str):
    deadline = time.time() + 25   # 最多挂 25 秒
    # 当 time.time() < deadline 为真时循环
    while time.time() < deadline:
        # 定义变量 msgs，赋值为 get_new_messages(user_id)
        msgs = get_new_messages(user_id)
        # 条件判断：如果 msgs
        if msgs:
            return {"messages": msgs}   # 有消息立刻返回
        # await asyncio.sleep(1)
        await asyncio.sleep(1)
    return {"messages": []}   # 超时返回空
\`\`\`

## 十、选型决策表

| 需求特征 | 推荐方案 | 理由 |
|----------|----------|------|
| 服务器单向推送（通知、行情） | SSE | 轻量、自动重连、复用 HTTP |
| 双向实时（聊天、协作） | WebSocket | 必须 |
| 只读数据流（日志、监控） | SSE | 单向，SSE 足够 |
| 需要二进制传输 | WebSocket | SSE 只能文本 |
| 老旧环境/严格代理 | Long Polling | 兼容性最好 |
| 偶尔推送，低频 | 轮询/Long Polling | 不值得长连接开销 |
| 高并发双向 + 复杂状态 | WebSocket + ConnectionManager | 必须管连接 |

\`\`\`txt filename="决策流程"
需要双向？ → 是 → WebSocket
         → 否 → 服务器推送？
                   → 是 → 容易配置 HTTP？ → 是 → SSE
                                              → 否 → WebSocket
                   → 否 → 频率低？ → 是 → 轮询
                                   → 否 → Long Polling
\`\`\`

## 十一、SSE 完整示例：通知推送

\`\`\`python filename="SSE 通知服务"
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 asyncio, 模块
import asyncio, json, time, random

# 创建 FastAPI 应用实例
app = FastAPI()

# 简单的内存消息队列（生产用 Redis Pub/Sub）
# 字段 notification_queues，类型: dict[str, asyncio.Queue]，默认值: {}
notification_queues: dict[str, asyncio.Queue] = {}

# 定义函数 get_queue，返回: asyncio.Queue
def get_queue(user_id: str) -> asyncio.Queue:
    # 条件判断：如果 user_id not in notification_queues
    if user_id not in notification_queues:
        # notification_queues[user_id] = asyncio.Queue()
        notification_queues[user_id] = asyncio.Queue()
    # 返回 notification_queues[user_id]
    return notification_queues[user_id]

# 定义异步函数 sse_stream，参数: user_id: str, request: Request
async def sse_stream(user_id: str, request: Request):
    # 定义变量 queue，赋值为 get_queue(user_id)
    queue = get_queue(user_id)
    # 先发个连接成功事件
    # 生成值: "event: connected\\ndata: 已连接\\n\\n"
    yield "event: connected\\ndata: 已连接\\n\\n"
    # 当 True 为真时循环
    while True:
        # 客户端断开时退出循环（StreamingResponse 会取消生成器）
        # 条件判断：如果 await request.is_disconnected()
        if await request.is_disconnected():
            # 跳出循环
            break
        # 尝试执行，捕获异常
        try:
            # 等 1 秒看有没有消息，避免死循环
            # 定义变量 msg，赋值为 await asyncio.wait_for(queue.get(), timeout=1...
            msg = await asyncio.wait_for(queue.get(), timeout=1.0)
            # 定义变量 data，赋值为 json.dumps(msg, ensure_ascii=False)
            data = json.dumps(msg, ensure_ascii=False)
            # 生成值: f"data: {data}\\n\\n"
            yield f"data: {data}\\n\\n"
        # except asyncio.TimeoutError:
        except asyncio.TimeoutError:
            # 没消息，发心跳保持连接（防代理超时断开）
            yield ": heartbeat\\n\\n"   # 以 : 开头是注释，客户端忽略

# 定义 GET 路由：访问 /sse/notifications/{user_id} 时触发
@app.get("/sse/notifications/{user_id}")
# 定义异步函数 notifications，参数: user_id: str, request: Request
async def notifications(user_id: str, request: Request):
    # 返回 StreamingResponse(
    return StreamingResponse(
        # 调用 sse_stream()
        sse_stream(user_id, request),
        # 定义变量 media_type，赋值为 "text/event-stream",
        media_type="text/event-stream",
        # 定义字典 headers
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    # )
    )

# 其他服务往队列推消息，SSE 自动推给客户端
# 定义 POST 路由：访问 /notify/{user_id} 时触发
@app.post("/notify/{user_id}")
# 定义异步函数 push_notification，参数: user_id: str, content: str
async def push_notification(user_id: str, content: str):
    # 定义变量 queue，赋值为 get_queue(user_id)
    queue = get_queue(user_id)
    # await queue.put({"content": content, "time": time.
    await queue.put({"content": content, "time": time.time()})
    # 返回 {"msg": "已推送"}
    return {"msg": "已推送"}
\`\`\`

\`\`\`javascript filename="前端"
// 定义变量 es
const es = new EventSource("/sse/notifications/alice");
// es.addEventListener("connected", (e) => console.lo
es.addEventListener("connected", (e) => console.log("已连接"));
// es.onmessage = (e) => {
es.onmessage = (e) => {
    // 定义变量 data
    const data = JSON.parse(e.data);
    // 弹通知
// new Notification(data.content);
    new Notification(data.content);
// };
};
\`\`\`

> 用注释行（\`: heartbeat\\n\\n\`）做心跳很巧妙：以 \`:\` 开头的行是 SSE 注释，客户端会忽略，但能保持连接活跃、防止代理超时断开。

## 十二、WebSocket + SSE 混合架构

大型系统常组合用：
- **WebSocket**：聊天主通道（双向）。
- **SSE**：全局通知（单向，自动重连省心）。
- **HTTP**：常规数据查询。

\`\`\`txt filename="混合架构"
浏览器
├─ WebSocket → 聊天 / 协作（双向实时）
├─ SSE      → 通知 / 在线状态（单向推送，断了自动重连）
└─ HTTP     → CRUD / 表单（常规）
↑ 各司其职，不强行用一种协议解决所有问题
\`\`\`

## 十三、易错点小结

| 易错点 | 现象 | 正确做法 |
|-------|------|----------|
| SSE 没设 \`text/event-stream\` | 浏览器不当 SSE 处理 | \`media_type="text/event-stream"\` |
| Nginx 缓冲响应 | 消息攒批才发 | \`X-Accel-Buffering: no\` |
| 消息格式错（少 \\n\\n） | 客户端收不到 | 每条消息以 \`\\n\\n\` 结尾 |
| 不发心跳 | 代理超时断连 | 定期发注释行保活 |
| 单向场景用 WebSocket | 过度工程 | 能用 SSE 就别上 WS |
| 不检测客户端断开 | 生成器空转 | \`await request.is_disconnected()\` |
| Long Polling 不设超时 | 请求堆积 | 25~30 秒必须返回 |
| HTTP/1.1 SSE 连接数超限 | 后续连接被阻塞 | 用 HTTP/2 或换 WebSocket |

## 十四、小结

SSE 基于 HTTP 长连接做单向推送，轻量、自动重连、断点续传，适合通知、行情、日志等服务器→客户端场景。FastAPI 用 \`StreamingResponse\` + \`text/event-stream\` 实现，注意消息格式（\`data: ...\\n\\n\`）、禁缓冲、发心跳。WebSocket 适合双向实时，Long Polling 兼容性最好。选型核心看"是否双向"：单向优先 SSE，双向才用 WebSocket，不要无脑上 WebSocket。本章也是 WebSocket 实时通信篇的收尾，至此数据库、认证、异步、实时四大块全部讲完。
`
  },
];
