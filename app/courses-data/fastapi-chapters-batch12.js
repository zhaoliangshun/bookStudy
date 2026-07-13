// =============================================================
// FastAPI 应用开发实战教程 - 第 12 批章节（WebSocket 实时通信 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-ws-basic  : WebSocket 基础
//   fa-ws-broadcast: 广播与连接管理
//   fa-ws-rooms  : 房间机制与私聊
//   fa-sse       : SSE 与实时通信选型
// ============================================================

export const chapters = [
  // =========================================================
  // 第一章：WebSocket 基础
  // =========================================================
  {
    id: "fa-ws-basic",
    group: "WebSocket 实时通信",
    icon: "🔌",
    title: "WebSocket 基础",
    content: `

# WebSocket 基础

## 一、开篇：HTTP 的局限与实时通信的渴望

到目前为止，我们写的所有接口都建立在 **HTTP 协议** 上。HTTP 的核心模型是"请求—响应"：客户端主动发请求，服务器被动回响应，**一次交互结束，连接就关闭**。这个模型在传统的 Web 场景（看新闻、查订单、提交表单）里工作得很好，但有一类场景它处理起来非常别扭——**服务器需要主动给客户端推消息**。

想象下面这些真实业务：

- **聊天应用**：A 给 B 发了一条消息，服务器怎么让 B 的屏幕立刻弹出消息？HTTP 没法主动找 B，只能等 B 来问。
- **在线协作**：同事在文档里敲了一个字，你的编辑器要立刻显示出来，否则两个人会冲突。
- **股票行情**：价格每秒都在变，服务器要实时把最新价推给所有订阅者。
- **通知系统**：你有新邮件、新点赞，服务器要立刻提醒你。

这些场景的共同点是：**信息产生的时机不确定，服务器要在事件发生时立刻推送，而不是等客户端来问**。

最朴素的解法叫**轮询（Polling）**：客户端每隔 1 秒发一次 HTTP 请求问"有新消息吗？"。但这有两个致命问题：第一，大部分请求的答案是"没有"，白白浪费带宽和服务器资源；第二，最坏情况下要等 1 秒才收到消息，实时性差。

\`\`\`txt filename="轮询的尴尬"
客户端：有新消息吗？  服务器：没有
客户端：有新消息吗？  服务器：没有
客户端：有新消息吗？  服务器：没有
...（重复 1000 次）
客户端：有新消息吗？  服务器：有！← 但消息其实 0.9 秒前就产生了
\`\`\`

为了根治这个问题，**WebSocket** 协议应运而生。它专为"双向实时通信"而生，是这一批章节的主角。本章我们先从协议原理讲起，再一步步在 FastAPI 里把 WebSocket 跑起来。

## 二、WebSocket 协议原理：握手、帧与全双工

WebSocket 是 RFC 6455 定义的一种协议，**在单个 TCP 连接上进行全双工通信**。它最巧妙的设计是：**复用 HTTP 来完成握手，握手成功后"升级"成 WebSocket 协议**。这样既能穿透大多数防火墙（因为握手阶段长得像 HTTP），又能获得双向通信能力。

### 2.1 握手过程：从 HTTP 升级而来

WebSocket 连接的建立，始于一个特殊的 HTTP 请求：

\`\`\`http filename="客户端握手请求"
GET /ws HTTP/1.1
Host: localhost:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
\`\`\`

关键字段：
- \`Upgrade: websocket\` 和 \`Connection: Upgrade\`：告诉服务器"我想把这次 HTTP 连接升级成 WebSocket"。
- \`Sec-WebSocket-Key\`：客户端生成的随机字符串，用于安全校验。
- \`Sec-WebSocket-Version: 13\`：协议版本，目前都是 13。

服务器如果同意升级，返回 **101 状态码**：

\`\`\`http filename="服务器握手响应"
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

**101 Switching Protocols** 表示"协议切换成功"。从这一刻起，这条 TCP 连接不再是 HTTP，双方改用 WebSocket 的"帧"格式通信。

### 2.2 帧（Frame）：WebSocket 的数据单元

握手之后，双方发送的数据都封装成**帧**。WebSocket 帧的头开销非常小（最小 2 字节），远比 HTTP 每次都要带一堆请求头高效。帧有几种类型：文本帧（opcode 0x1）、二进制帧（0x2）、关闭帧（0x8）、心跳帧 ping/pong（0x9/0xA）。

\`\`\`txt filename="WebSocket 帧结构简化"
┌─────────┬─────────┬───────────────┬─────────────────┐
│ FIN/opcode │  长度   │  Masking-key  │     Payload     │
│ (1字节)    │ (变长)  │   (4字节,可选) │    (实际数据)    │
└─────────┴─────────┴───────────────┴─────────────────┘
↑ 客户端→服务端的帧必须用 Masking-key 掩码
↑ 服务端→客户端的帧不需要掩码
\`\`\`

**为什么要掩码？** 这是协议设计的防御措施：防止中间代理缓存被污染。客户端发出的每一帧都要用一个 4 字节 key 对 payload 做 XOR 掩码，服务端发出的不需要。

### 2.3 全双工：双方都能主动发

握手完成后，**服务器可以随时主动给客户端推消息，不需要等客户端先发**。这是 WebSocket 与 HTTP 最本质的区别。在这条长连接上，客户端和服务器是对等的，双方都能在任意时刻发送帧。

## 三、WebSocket vs HTTP：什么时候该用哪个

理解了原理，我们用一张表把两者对比清楚，这是技术选型的基础：

| 维度 | HTTP | WebSocket |
|------|------|-----------|
| 通信方向 | 单向（客户端请求→服务器响应） | 双向（双方都能主动发） |
| 连接生命周期 | 短连接（请求完通常就断） | 长连接（一直保持到主动关闭） |
| 谁能主动发消息 | 只有客户端 | 服务器和客户端都能 |
| 协议前缀 | http:// https:// | ws:// wss:// |
| 头开销 | 每次请求都带完整头（几百字节起） | 握手后帧头很小（2-10 字节） |
| 协议层级 | 应用层 | 应用层（握手借道 HTTP） |
| 是否有状态 | 无状态 | 有状态（连接保持） |
| 浏览器 API | fetch / XMLHttpRequest | WebSocket |
| 负载均衡难度 | 简单（无状态，随便转发） | 较难（有状态，需粘性或共享） |

**选型思路**：
- 如果只是"客户端问、服务器答"，用 HTTP 就够了，别上 WebSocket（增加复杂度）。
- 如果服务器需要**主动推送**，且推送频率高、需要双向交互（聊天、游戏、协作），用 WebSocket。
- 如果只是服务器单向推送、低频（通知、日志流），可以考虑 SSE（第 4 章讲）。

\`\`\`txt filename="ws:// vs wss://"
ws://   明文传输，握手后数据不加密。仅开发/内网使用。
wss://  WebSocket over TLS，数据加密。生产环境必用。
        浏览器不允许 https 页面连 ws://（混合内容拦截），
        所以生产 https 站点必须用 wss://，
        通常在 Nginx 层做 TLS 终结再转 ws 给后端。
\`\`\`

## 四、FastAPI 里的 WebSocket 路由

FastAPI（基于 Starlette）用 \`@app.websocket()\` 装饰器定义 WebSocket 路由，处理函数接收一个 \`WebSocket\` 对象。

### 4.1 最简 WebSocket 端点

\`\`\`python filename="demo1: 最简 WebSocket"
# 从 fastapi 模块导入 FastAPI 应用类和 WebSocket 类
from fastapi import FastAPI, WebSocket

# 创建 FastAPI 应用实例，这是所有路由的容器
app = FastAPI()

# 用 @app.websocket 装饰器注册一个 WebSocket 路由，路径是 /ws
# 注意：这里用的是 websocket() 而不是 get()/post()，因为协议不同
@app.websocket("/ws")
# 定义异步处理函数，参数 ws 的类型是 WebSocket
# async 是必须的，因为 WebSocket 全程基于异步 I/O
async def websocket_endpoint(ws: WebSocket):
    # 第一步：必须调用 accept() 完成握手，否则连接一直挂起
    # 这一步对应协议里的 "101 Switching Protocols" 响应
    await ws.accept()
    # 进入消息循环：持续接收和处理客户端消息
    # 用 while True 保持连接不退出，直到客户端断开
    try:
        while True:
            # receive_text() 会阻塞，直到收到客户端发来的文本消息
            # await 是必须的，等待期间事件循环可以去处理别的连接
            data = await ws.receive_text()
            # 把收到的消息原样回发，前面加 "echo: " 前缀
            # send_text() 主动给客户端推一条文本消息
            await ws.send_text(f"echo: {data}")
    except Exception:
        # 客户端断开时 receive_text 会抛异常，这里简单吞掉
        # 下一节我们会用更精确的 WebSocketDisconnect 来处理
        pass
\`\`\`

启动服务后 (\`uvicorn main:app\`)，这个端点就可以接受 WebSocket 连接了。

### 4.2 WebSocket 对象的核心方法

\`\`\`txt filename="WebSocket 对象方法一览"
方法                          作用            说明
await ws.accept()             接受握手         必须先调用，否则连接挂起
await ws.receive_text()       接收文本消息      阻塞直到收到，返回 str
await ws.receive_bytes()      接收二进制消息    返回 bytes，用于图片/文件
await ws.receive_json()       接收 JSON 消息    自动反序列化为 dict/list
await ws.send_text(msg)       发送文本         主动推消息给客户端
await ws.send_bytes(b)        发送二进制        推送图片、文件分片等
await ws.send_json(obj)       发送 JSON         自动序列化 dict/list
await ws.close(code, reason)  主动关闭连接      code 是状态码，reason 是原因
ws.client_state               连接状态          可读取当前状态（枚举）
ws.client                     客户端地址信息    含 host/port
\`\`\`

> 所有方法都是 \`async\`，必须 \`await\`。WebSocket 是异步协议，基于事件循环，绝不能写成同步调用。

## 五、异常处理与 WebSocketDisconnect

WebSocket 连接的"断开"是常态——用户关浏览器、网络抖动、手机切后台都会断。断开时 \`receive_text()\` 会抛出 \`WebSocketDisconnect\` 异常，我们必须捕获它，否则异常会冒泡导致日志爆炸。

### 5.1 完整生命周期处理

\`\`\`python filename="demo2: 完整生命周期与异常处理"
# 从 fastapi 导入 FastAPI、WebSocket、WebSocketDisconnect
# WebSocketDisconnect 是 Starlette 提供的专用异常类
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 从 starlette.websockets 导入 WebSocketState 枚举
# WebSocketState 表示连接状态：CONNECTING/CONNECTED/DISCONNECTED
from starlette.websockets import WebSocketState

# 创建应用实例
app = FastAPI()

# 注册带路径参数的 WebSocket 路由
# 路径里的 {client_id} 会作为函数参数传入，和 HTTP 路由一致
@app.websocket("/ws/{client_id}")
# 参数 client_id 来自路径，ws 是 WebSocket 对象
async def ws_endpoint(ws: WebSocket, client_id: str):
    # 1. 接受握手
    await ws.accept()
    # 打印日志，方便调试时观察谁连进来了
    print(f"[连接] 客户端 {client_id} 已建立连接")
    # 用 try/except 包裹消息循环，捕获各类异常
    try:
        # 持续接收消息
        while True:
            # 接收文本消息
            msg = await ws.receive_text()
            # 业务逻辑：构造回复
            reply = f"[{client_id}] 你发送了: {msg}"
            # 回复客户端
            await ws.send_text(reply)
    # 精确捕获 WebSocketDisconnect：客户端主动关闭或网络断开
    except WebSocketDisconnect:
        # 这是最常见的"正常断开"，不需要当作错误
        print(f"[断开] 客户端 {client_id} 已断开连接")
    # 捕获其他未预期异常（如序列化错误、业务异常）
    except Exception as e:
        # 记录异常，便于排查
        print(f"[异常] 客户端 {client_id} 发生异常: {type(e).__name__}: {e}")
    # finally 块无论是否异常都会执行，做收尾工作
    finally:
        # 检查连接状态：只有还在连接态才需要主动 close
        # 如果已经 DISCONNECTED 再 close 会报错
        if ws.client_state == WebSocketState.CONNECTED:
            # 主动关闭，code=1000 表示正常关闭
            await ws.close(code=1000, reason="服务端收尾")
\`\`\`

### 5.2 WebSocket 关闭码

关闭码是协议规定的，常见值要记住：

| 码 | 含义 | 谁发 |
|----|------|------|
| 1000 | 正常关闭 | 任一方 |
| 1001 | 端点离开（如关浏览器标签） | 客户端 |
| 1002 | 协议错误 | 接收方 |
| 1003 | 不支持的数据类型 | 接收方 |
| 1006 | 异常关闭（没发关闭帧，如断网） | 浏览器自动设置 |
| 1008 | 策略违反 | 任一方 |
| 1011 | 服务器内部错误 | 服务端 |
| 4000-4999 | 应用自定义关闭码 | 应用自定义 |

> **1006 最坑**：它代表"异常断开"，浏览器不会触发 \`onclose\` 的正常流程，服务端也未必能立刻感知。这就是为什么后面要讲**心跳机制**。

## 六、接收和发送 JSON 数据

实际业务里，文本消息不够用——我们要传结构化数据（谁发的、什么类型、内容是什么）。WebSocket 的 \`receive_json\` / \`send_json\` 让我们能直接收发 JSON。

### 6.1 JSON 收发示例

\`\`\`python filename="demo3: JSON 收发"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 datetime 用于生成时间戳
from datetime import datetime

# 创建应用
app = FastAPI()

# 注册 WebSocket 路由
@app.websocket("/chat/{user}")
# 参数 user 来自路径
async def chat_endpoint(ws: WebSocket, user: str):
    # 接受握手
    await ws.accept()
    # 进入消息循环
    try:
        while True:
            # receive_json 直接把客户端发来的 JSON 解析成 dict
            # 客户端必须发合法 JSON，否则会抛异常
            payload = await ws.receive_json()
            # payload 示例: {"type": "msg", "content": "你好", "to": "all"}
            # 取出字段
            msg_type = payload.get("type", "msg")      # 消息类型，默认 msg
            content = payload.get("content", "")        # 消息内容
            # 构造服务器返回的结构化消息
            reply = {
                "type": "reply",                        # 消息类型
                "from": "server",                       # 发送方
                "to": user,                             # 接收方
                "content": f"已收到你的 {msg_type}: {content}",  # 回复内容
                "timestamp": datetime.now().isoformat() # ISO 格式时间戳
            }
            # send_json 自动把 dict 序列化成 JSON 字符串发送
            await ws.send_json(reply)
    except WebSocketDisconnect:
        # 客户端断开
        print(f"用户 {user} 离开")
\`\`\`

### 6.2 前端 JS 客户端

WebSocket 在浏览器里有原生 API，不需要任何库：

\`\`\`html filename="demo4: 前端 WebSocket 客户端"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>WebSocket 测试</title></head>
<body>
  <!-- 输入框和按钮 -->
  <input id="msgInput" type="text" placeholder="输入消息" />
  <button onclick="sendMsg()">发送</button>
  <!-- 显示消息的容器 -->
  <div id="log"></div>

  <script>
    // 创建 WebSocket 连接，注意协议是 ws:// 不是 http://
    // 后端运行在 localhost:8000，路径是 /chat/alice
    const ws = new WebSocket("ws://localhost:8000/chat/alice");

    // 连接建立成功时触发
    ws.onopen = function() {
      console.log("已连接服务器");
      appendLog("系统: 已连接");
    };

    // 收到服务器消息时触发
    // e.data 是字符串（如果服务端用 send_text）或自动解析
    ws.onmessage = function(e) {
      // 尝试解析 JSON
      try {
        const data = JSON.parse(e.data);
        appendLog(data.from + ": " + data.content);
      } catch {
        // 不是 JSON 就当普通文本
        appendLog("收到: " + e.data);
      }
    };

    // 连接关闭时触发
    ws.onclose = function(e) {
      console.log("连接关闭", e.code, e.reason);
      appendLog("系统: 连接关闭 (" + e.code + ")");
    };

    // 发生错误时触发（如连不上服务器）
    ws.onerror = function(e) {
      console.error("WebSocket 错误", e);
    };

    // 发送消息的函数
    function sendMsg() {
      // 获取输入框的值
      const text = document.getElementById("msgInput").value;
      // 构造 JSON 消息
      const payload = { type: "msg", content: text, to: "all" };
      // 用 JSON.stringify 转成字符串后发送
      // ws.readyState === 1 表示连接已建立，才能发
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      } else {
        appendLog("系统: 连接未就绪");
      }
    }

    // 在页面上追加一行日志
    function appendLog(text) {
      const div = document.createElement("div");
      div.textContent = text;
      document.getElementById("log").appendChild(div);
    }
  </script>
</body>
</html>
\`\`\`

> **readyState 状态值**：0=CONNECTING（连接中）、1=OPEN（已连接）、2=CLOSING（关闭中）、3=CLOSED（已关闭）。发送前最好检查是否为 OPEN。

## 七、查询参数与认证

WebSocket 路由也能接收查询参数，常用于传 token（因为浏览器 WebSocket API 不能自定义请求头）：

\`\`\`python filename="demo5: 带查询参数的 WebSocket"
# 导入必要模块：FastAPI 应用、WebSocket 对象、WebSocketDisconnect 异常、Query 查询参数
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query

# 创建应用实例
app = FastAPI()

# 模拟一个 token 白名单（真实场景用 JWT 验证）
# 用 set 存储，O(1) 查找
VALID_TOKENS = {"abc123", "xyz789"}

# 注册 WebSocket 路由
@app.websocket("/ws")
# 参数 token 来自查询字符串 ?token=abc123
# Query(None) 表示可选，默认 None
# 浏览器 WebSocket API 不支持自定义请求头，所以 token 只能放 URL
async def ws_with_auth(ws: WebSocket, token: str = Query(None)):
    # 鉴权：token 不合法就拒绝连接
    if token not in VALID_TOKENS:
        # 用 close 拒绝，code=1008 表示策略违反
        # 注意：还没 accept 就 close，要用 ws.close(code=1008)
        # Starlette 支持在 accept 前调用 close 来拒绝握手
        await ws.close(code=1008, reason="token 无效")
        # 直接 return，结束函数
        return
    # 鉴权通过，接受握手
    await ws.accept()
    # 给客户端发欢迎消息
    await ws.send_text(f"认证成功，token={token}")
    # 消息循环
    try:
        while True:
            # 接收客户端消息
            data = await ws.receive_text()
            # 回复客户端
            await ws.send_text(f"已收到: {data}")
    except WebSocketDisconnect:
        # 客户端断开连接
        print("客户端断开")
\`\`\`

前端连接时把 token 拼在 URL 里：\`new WebSocket("ws://localhost:8000/ws?token=abc123")\`。

## 八、实战：Echo 回声服务器

把前面学的串起来，做一个完整的 Echo 服务器——客户端发什么，服务器回什么，并统计收发次数。

\`\`\`python filename="demo6: 完整 Echo 服务器"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 starlette.websockets 的 WebSocketState
from starlette.websockets import WebSocketState

# 创建应用，给文档起个标题
app = FastAPI(title="Echo Server")

# Echo 端点
@app.websocket("/echo")
async def echo(ws: WebSocket):
    # 接受握手
    await ws.accept()
    # 统计收发次数
    received_count = 0   # 收到的消息数
    sent_count = 0       # 发出的消息数
    # 进入循环
    try:
        while True:
            # 接收文本
            data = await ws.receive_text()
            # 计数+1
            received_count += 1
            # 如果客户端发 "quit"，主动关闭
            if data.strip().lower() == "quit":
                # 发送告别消息
                await ws.send_text(f"再见！共收到 {received_count} 条")
                # 主动关闭，code=1000 正常关闭
                await ws.close(code=1000, reason="客户端请求退出")
                # 退出循环
                break
            # 构造回复：原样回显 + 计数
            reply = f"echo #{received_count}: {data}"
            # 发送
            await ws.send_text(reply)
            # 发送计数+1
            sent_count += 1
    # 捕获断开异常
    except WebSocketDisconnect:
        # 客户端主动断开
        print(f"客户端断开，共收到 {received_count} 条，发出 {sent_count} 条")
    # 捕获其他异常
    except Exception as e:
        print(f"异常: {e}")
    # 收尾
    finally:
        # 确保连接关闭
        if ws.client_state == WebSocketState.CONNECTED:
            await ws.close()

# 启动: uvicorn main:app --reload
# 测试: 浏览器打开 demo4 的 HTML，把 URL 改成 ws://localhost:8000/echo
\`\`\`

## 九、用 Python 客户端测试 WebSocket

开发时不用每次都开浏览器，可以用 \`websockets\` 库写 Python 客户端测试：

\`\`\`python filename="demo7: Python WebSocket 客户端"
# 先安装: pip install websockets
# 导入 websockets 库（第三方异步 WebSocket 客户端库）
import websockets
# 导入 asyncio 用于事件循环
import asyncio

# 定义异步主函数
async def main():
    # 连接到服务器
    # async with 会在退出时自动关闭连接
    # websockets.connect 返回一个 WebSocketClientProtocol 对象
    async with websockets.connect("ws://localhost:8000/echo") as ws:
        # 发送 3 条消息
        for i in range(3):
            # 发送文本消息到服务端
            # ws.send 是协程，必须 await
            await ws.send(f"hello {i}")
            # 等待回复
            # ws.recv 阻塞直到收到一条消息
            reply = await ws.recv()
            # 打印收到的回复
            print(f"收到: {reply}")
        # 发送 quit 退出
        # 服务端收到 quit 会主动关闭连接
        await ws.send("quit")
        # 接收告别消息
        # 服务端关闭前会发一条告别消息
        bye = await ws.recv()
        print(f"告别: {bye}")

# 运行事件循环执行 main 协程
asyncio.run(main())
# 预期输出:
# 收到: echo #1: hello 0
# 收到: echo #2: hello 1
# 收到: echo #3: hello 2
# 告别: 再见！共收到 4 条
\`\`\`

## 十、常见错误与避坑指南

1. **忘了调 \`accept()\`**：客户端连接后一直挂起，浏览器 \`onopen\` 不触发。**所有 WebSocket 端点第一行必须是 \`await ws.accept()\`**。
2. **没捕获 \`WebSocketDisconnect\`**：客户端一断开，服务端日志刷一堆异常栈。**消息循环必须 try/except WebSocketDisconnect**。
3. **在同步函数里用 WebSocket**：写成 \`def ws_endpoint\` 而不是 \`async def\`，会报错。**WebSocket 必须 \`async def\`**。
4. **\`receive_text\` 收到二进制数据**：客户端发了 Blob/ArrayBuffer，服务端用 \`receive_text\` 会抛异常。约定好用文本就用 \`receive_text\`，传二进制就用 \`receive_bytes\`。
5. **在 \`accept\` 前调 \`close\` 报错**：Starlette 早期版本不支持，新版本可以。鉴权拒绝时用 \`await ws.close(code=1008)\` 是 OK 的。
6. **多 worker 下连接丢失**：\`uvicorn --workers 4\` 启动 4 个进程，每个进程有自己的连接列表，客户端连到 worker A，发给 worker B 的消息收不到。**多 worker 要用 Redis Pub/Sub 做跨进程广播**，下一章详讲。
7. **前端用 \`ws://\` 连 \`https\` 站点**：浏览器拦截混合内容。**https 站点必须用 wss://**。
8. **Nginx 没配 WebSocket 转发**：默认 Nginx 会缓冲响应，WebSocket 握手失败。需要加：
   \`\`\`
   proxy_http_version 1.1;
   proxy_set_header Upgrade \$http_upgrade;
   proxy_set_header Connection "upgrade";
   \`\`\`
9. **连接泄漏**：异常没处理好，连接没关，越积越多。**finally 块里检查状态并 close**。
10. **用 \`ws.send\` 不 await**：\`ws.send_text(...)\` 是协程，不 await 不会真正发送。**所有 send/receive 都要 await**。

## 十一、本章小结

- HTTP 是"请求—响应"单向模型，**服务器无法主动推消息**，实时场景要用 WebSocket 或 SSE。
- WebSocket 通过 HTTP 握手升级到 101，之后在长连接上用帧进行**全双工**通信。
- FastAPI 用 \`@app.websocket()\` 定义路由，\`WebSocket\` 对象提供 \`accept/receive_*/send_*/close\` 方法，**全部 async**。
- 客户端断开会抛 \`WebSocketDisconnect\`，**必须捕获**，并在 finally 里收尾。
- \`receive_json/send_json\` 让收发结构化数据更方便，前端用原生 \`WebSocket\` API。
- 鉴权通常用查询参数传 token（浏览器 WebSocket 不能自定义头）。
- 多 worker 部署需要 Redis Pub/Sub 做跨进程通信，这是下一章的重点。

下一章我们解决"如何管理多个并发连接、如何广播消息"，做一个真正的实时聊天室。
`
  },

  // =========================================================
  // 第二章：广播与连接管理
  // =========================================================
  {
    id: "fa-ws-broadcast",
    group: "WebSocket 实时通信",
    icon: "📡",
    title: "广播与连接管理",
    content: `

# 广播与连接管理

## 一、开篇：从单连接到多连接的难题

上一章我们写的 WebSocket 端点只能服务"一个连接和自己玩"——客户端发什么，服务器回什么。但真实场景里，聊天室是**多人**的：A 发一条消息，B、C、D 都要收到。这就要求服务器**把一条消息推给所有当前在线的连接**，这叫**广播（Broadcast）**。

广播的核心难题是**连接管理**：
- 谁连进来了？要维护一个"活跃连接列表"。
- 谁断开了？要从列表里移除，否则给已断开的连接发消息会报错。
- 多个连接同时收发，怎么保证**并发安全**？
- 连接悄悄断了（网络抖动），服务器怎么及时感知？需要**心跳机制**。

这一章我们设计一个 \`ConnectionManager\`（连接管理器）类，把这些问题统一解决，最后做出一个多人实时聊天室。

## 二、连接管理的核心思路

### 2.1 为什么需要一个"管理器"

朴素的想法是：用一个全局 list 存所有 \`WebSocket\` 对象。但这有几个问题：

1. **职责分散**：增删连接、广播、错误处理散落在各处，难维护。
2. **并发不安全**：多个协程同时修改 list，可能出问题。
3. **难扩展**：后面要加房间、私聊，散落的代码改不动。

更好的设计是**封装一个 \`ConnectionManager\` 类**，对外提供 \`connect/disconnect/broadcast/send_personal\` 等方法，内部处理所有细节。这是"单一职责"和"封装变化"思想的体现。

### 2.2 连接的生命周期

\`\`\`txt filename="连接生命周期"
客户端连入
  ↓
manager.connect(ws)  → 加入活跃列表
  ↓
消息循环 (receive → 业务处理 → broadcast)
  ↓
断开 (WebSocketDisconnect / 异常)
  ↓
manager.disconnect(ws) → 从列表移除
  ↓
广播通知其他人 "xxx 离开了"
\`\`\`

每一步都要可靠：连入要记录，断开要清理，广播要跳过已断开的。

## 三、设计 ConnectionManager

### 3.1 基础版管理器

\`\`\`python filename="demo1: ConnectionManager 基础版"
# 从 fastapi 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 从 typing 导入 List（类型注解）
from typing import List

# 创建应用
app = FastAPI()

# 定义连接管理器类
# 把连接的增删、广播、私信封装到一个类里，职责清晰
class ConnectionManager:
    """管理所有活跃的 WebSocket 连接"""

    # 构造函数
    def __init__(self):
        # 用 list 存储所有活跃连接
        # 注意：这里用普通 list，asyncio 单线程模型下其实是安全的
        # 但如果以后扩展到多线程，要换 threading.Lock 或 asyncio.Lock
        # list 的 append/remove 在 CPython 里是原子操作，不会被打断
        self.active_connections: List[WebSocket] = []

    # 接受新连接并加入列表
    async def connect(self, ws: WebSocket):
        # 先接受握手
        # accept() 必须在加入列表前调用，否则连接还没建立就用不了
        await ws.accept()
        # 加入活跃列表
        self.active_connections.append(ws)
        # 打印日志
        print(f"新连接加入，当前共 {len(self.active_connections)} 个")

    # 断开连接，从列表移除
    # 注意：这里不是 async，因为 list.remove 是同步操作
    def disconnect(self, ws: WebSocket):
        # 安全移除：如果不在列表里也不会报错
        # 用 in 检查避免 ValueError
        if ws in self.active_connections:
            self.active_connections.remove(ws)
        print(f"连接离开，当前共 {len(self.active_connections)} 个")

    # 给指定连接发私信
    async def send_personal(self, message: str, ws: WebSocket):
        # 直接给单个连接发
        # 只给指定的 ws 发，其他人收不到
        await ws.send_text(message)

    # 广播给所有连接
    async def broadcast(self, message: str):
        # 遍历所有活跃连接
        # 注意：这里直接遍历原列表，生产环境应该遍历副本（见 demo2）
        for ws in self.active_connections:
            try:
                # 给每个连接发消息
                # await 期间可能被其他协程打断，列表可能被修改
                await ws.send_text(message)
            except Exception:
                # 如果发送失败（连接已断），跳过
                # 真正的清理会在 disconnect 里做
                # 这里只跳过，不中断整次广播
                pass

# 全局唯一的管理器实例
# 所有路由共享这一个实例，保证连接列表统一
manager = ConnectionManager()

# 注册 WebSocket 路由
@app.websocket("/ws/{client_id}")
# 参数 client_id 来自路径
async def chat(ws: WebSocket, client_id: str):
    # 1. 接受并记录连接
    await manager.connect(ws)
    # 2. 广播通知所有人 "xxx 加入了"
    await manager.broadcast(f"系统: {client_id} 加入了聊天室")
    # 3. 进入消息循环
    try:
        while True:
            # 接收消息
            # receive_text 会阻塞直到收到消息或连接断开
            data = await ws.receive_text()
            # 构造广播内容
            msg = f"{client_id}: {data}"
            # 广播给所有人
            await manager.broadcast(msg)
    # 4. 客户端断开
    except WebSocketDisconnect:
        # 从管理器移除
        # 必须清理，否则广播时会给死连接发消息
        manager.disconnect(ws)
        # 通知其他人
        await manager.broadcast(f"系统: {client_id} 离开了")
\`\`\`

打开两个浏览器标签都连 \`ws://localhost:8000/ws/alice\` 和 \`ws://localhost:8000/ws/bob\`，互相发消息就能收到——这就是多人聊天的雏形。

### 3.2 为什么 broadcast 要 try/except

想象这个场景：广播时遍历到第 5 个连接，但它刚好断开了，\`send_text\` 抛异常。如果不 try/except，整个广播就中断了，第 6 个以后的人都收不到消息。**广播必须容错**：单个连接失败不能影响其他人。

\`\`\`txt filename="广播容错思路"
广播循环:
  for ws in connections:
    try:
      await ws.send_text(msg)   ← 第5个失败
    except:
      pass                       ← 跳过，继续给第6个发
  ← 不容错的话，第5个失败就抛出，6/7/8 全收不到
\`\`\`

## 四、并发安全：asyncio.Lock 与连接表

### 4.1 单线程为什么也要锁？

asyncio 是**单线程**的，理论上不会有"两个线程同时改 list"的问题。但有个微妙的场景：\`broadcast\` 是个 async 函数，遍历到一半被 \`await\` 挂起时，另一个协程可能修改了 \`active_connections\`（比如新连接加入），导致遍历出错。

虽然 list 在 CPython 里追加/删除是原子的，但**遍历过程中被修改**仍可能抛 \`RuntimeError: list changed size during iteration\`。更稳妥的做法是用 \`asyncio.Lock\` 保护关键操作，或者遍历时用副本。

### 4.2 改进版：带锁的管理器

\`\`\`python filename="demo2: 并发安全的 ConnectionManager"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio（用它的 Lock）
import asyncio
# 从 typing 导入 List、Dict
from typing import List, Dict

# 创建应用
app = FastAPI()

# 定义改进版连接管理器
# 相比基础版，增加了 asyncio.Lock 保护共享数据，避免并发问题
class ConnectionManager:
    def __init__(self):
        # 活跃连接列表
        self.active_connections: List[WebSocket] = []
        # 连接→用户名 的映射，方便反查
        # 通过 ws 对象反查用户名，不用遍历
        self.connection_user: Dict[WebSocket, str] = {}
        # 异步锁，保护共享数据
        # asyncio.Lock 是协程级别的锁，await 期间其他协程不能获取
        # 注意：和 threading.Lock 不同，asyncio.Lock 不阻塞线程，只阻塞协程
        self.lock = asyncio.Lock()

    # 接受连接
    async def connect(self, ws: WebSocket, user: str):
        # 获取锁
        # async with self.lock 保证块内代码不被其他协程打断
        async with self.lock:
            # 接受握手
            await ws.accept()
            # 加入列表
            self.active_connections.append(ws)
            # 记录映射
            self.connection_user[ws] = user
        # 锁外打印（不阻塞其他操作）
        # 日志是慢操作（I/O），放锁外避免阻塞其他协程
        print(f"[{user}] 连接，在线 {len(self.active_connections)} 人")

    # 断开连接
    async def disconnect(self, ws: WebSocket):
        # 获取锁
        async with self.lock:
            # 移除连接
            if ws in self.active_connections:
                self.active_connections.remove(ws)
            # 取用户名
            # pop(ws, "未知")：如果 ws 不在字典里，返回 "未知" 不报错
            user = self.connection_user.pop(ws, "未知")
        # 锁外打印
        print(f"[{user}] 断开，在线 {len(self.active_connections)} 人")
        # 返回用户名，方便上层广播
        return user

    # 广播
    async def broadcast(self, message: str):
        # 拷贝一份列表再遍历，避免遍历中被修改
        # 这是个常用技巧：snapshot 遍历
        # 即使原列表在 await 期间被增删，副本不变，遍历安全
        connections = list(self.active_connections)
        # 遍历副本
        for ws in connections:
            try:
                await ws.send_text(message)
            except Exception:
                # 发送失败的连接，异步清理
                # 不能在这里直接 remove，因为正在遍历副本
                # 用 create_task 让 disconnect 在后台执行
                # create_task 立即返回，不阻塞当前广播
                asyncio.create_task(self.disconnect(ws))

    # 获取在线用户列表
    async def get_online_users(self) -> List[str]:
        # 获取锁后读取
        # 读取也要加锁，避免读到不一致的中间状态
        async with self.lock:
            # 返回 values 的副本，避免外部修改影响内部数据
            return list(self.connection_user.values())

# 全局管理器
manager = ConnectionManager()

# 路由
@app.websocket("/ws/{user}")
async def chat(ws: WebSocket, user: str):
    # 连接
    await manager.connect(ws, user)
    # 广播加入通知
    await manager.broadcast(f"系统: {user} 加入了聊天室")
    # 循环
    try:
        while True:
            data = await ws.receive_text()
            await manager.broadcast(f"{user}: {data}")
    except WebSocketDisconnect:
        # 断开
        left_user = await manager.disconnect(ws)
        # 通知
        await manager.broadcast(f"系统: {left_user} 离开了")

# HTTP 接口：查在线人数
@app.get("/online")
async def online():
    # 调用管理器方法
    # HTTP 接口也能查 WebSocket 连接状态，因为 manager 是全局的
    users = await manager.get_online_users()
    return {"count": len(users), "users": users}
\`\`\`

### 4.3 遍历用副本是个通用技巧

\`connections = list(self.active_connections)\` 这一行很关键。它把当前列表**快照**一份，之后即使原列表被增删，遍历的副本不变。这是处理"遍历中修改"的标准做法，不止 WebSocket，所有并发场景都适用。

\`\`\`txt filename="为什么遍历要用副本"
情况：广播时，第3个连接断开，触发 disconnect 修改原列表
  → 如果直接遍历原列表：IndexError / RuntimeError
  → 遍历副本：原列表改它的，我遍历我的快照，互不干扰
\`\`\`

## 五、心跳检测：及时发现"死连接"

### 5.1 为什么需要心跳

TCP 有个机制叫 keep-alive，但默认要 2 小时才检测到断连。对实时应用来说太慢了——用户手机切后台、Wi-Fi 闪断，服务器 2 小时都不知道，还以为他在线，给他转发的消息全丢了。

解决方法是**应用层心跳**：服务器每隔 N 秒发一个 ping，客户端回 pong，超过几次没回就认为断开。WebSocket 协议内置了 ping/pong 帧支持，Starlette 也提供了 API。

### 5.2 心跳实现思路

\`\`\`txt filename="心跳策略"
方案A：服务端定时 ping
  - 每 30 秒给所有连接发 ping
  - 客户端浏览器会自动回 pong（不用手写）
  - 如果 send 失败，认为连接已死，清理

方案B：客户端定时发"心跳消息"
  - 客户端每 30 秒发一条 {"type":"ping"}
  - 服务端记录最后活跃时间
  - 后台任务扫描，超过 60 秒没活跃的连接踢掉

方案C：用 asyncio.wait_for 给 receive 加超时
  - receive_text() 设 60 秒超时
  - 超时没消息就认为死了，主动关闭
\`\`\`

### 5.3 用 wait_for 实现超时检测

\`\`\`python filename="demo3: 带超时的心跳检测"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio，用它的 wait_for 实现超时
import asyncio

# 创建应用
app = FastAPI()

# 全局连接列表
# 存所有活跃连接，用于广播等场景
connections = []

# 心跳超时时间（秒）
# 60 秒是经验值：手机网络抖动 1-2 秒很常见，太短会误杀
# 太长又不能及时发现死连接，60 秒是平衡点
HEARTBEAT_TIMEOUT = 60

@app.websocket("/ws/heartbeat")
async def ws_heartbeat(ws: WebSocket):
    # 接受握手
    await ws.accept()
    # 加入列表
    connections.append(ws)
    # 进入循环
    try:
        while True:
            # 用 asyncio.wait_for 给 receive 设超时
            # 如果 HEARTBEAT_TIMEOUT 秒内没收到任何消息，抛 TimeoutError
            # wait_for 的原理：把协程包装成 Task，超时后取消它
            try:
                # wait_for 第一个参数是要等待的协程
                # timeout 参数是超时秒数
                data = await asyncio.wait_for(
                    ws.receive_text(),
                    timeout=HEARTBEAT_TIMEOUT
                )
                # 收到消息，正常处理
                # 前端可以每 30 秒发一条 "ping"，这里收到就重置超时计时
                await ws.send_text(f"echo: {data}")
            except asyncio.TimeoutError:
                # 超时了，说明客户端可能已经"死"了
                # 主动关闭连接
                # code=1001 表示端点离开（Going Away）
                print("心跳超时，关闭连接")
                await ws.close(code=1001, reason="心跳超时")
                # 跳出循环
                break
    except WebSocketDisconnect:
        # 客户端主动断开
        print("客户端断开")
    except Exception as e:
        # 其他异常
        print(f"异常: {e}")
    finally:
        # 清理
        # finally 确保无论正常退出还是异常，都从列表移除
        if ws in connections:
            connections.remove(ws)
\`\`\`

> 这种"超时即踢"的策略简单有效。前端配合每 30 秒发一条心跳消息就能保活：\`setInterval(() => ws.send("ping"), 30000)\`。

### 5.4 后台广播任务

有时需要"服务器主动推"——比如整点报时、新公告。可以用后台任务定时广播：

\`\`\`python filename="demo4: 后台定时广播"
# 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 导入 asyncio 用于异步操作和后台任务
import asyncio
# 导入 datetime 用于生成时间字符串
from datetime import datetime

# 创建应用
app = FastAPI()

# 连接列表
# 存所有当前活跃的 WebSocket 连接
connections = []

# 后台广播任务：每 10 秒给所有连接推一次时间
# 这是"服务器主动推送"的典型场景，不依赖客户端请求
async def broadcast_time():
    # 无限循环
    while True:
        # 等 10 秒
        # asyncio.sleep 不阻塞事件循环，期间能处理其他协程
        await asyncio.sleep(10)
        # 如果没有连接，跳过
        # 空列表广播没意义，省 CPU
        if not connections:
            continue
        # 构造消息
        # strftime 格式化时间，%H:%M:%S 是时:分:秒
        now = datetime.now().strftime("%H:%M:%S")
        msg = f"服务器报时: {now}"
        # 遍历副本
        # 必须用副本，因为 send_text 的 await 期间列表可能被修改
        for ws in list(connections):
            try:
                await ws.send_text(msg)
            except Exception:
                # 失败就清理
                # 发不出去说明连接已断，从列表移除
                if ws in connections:
                    connections.remove(ws)

# 用 startup 事件启动后台任务
@app.on_event("startup")
async def start_background():
    # create_task 把协程调度到后台运行
    # 注意：task 引用没保存，可能被 GC 回收（见避坑指南）
    # 生产环境应该：tasks = set(); task = create_task(...); tasks.add(task)
    asyncio.create_task(broadcast_time())

# WebSocket 端点
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    # 接受握手
    await ws.accept()
    # 加入连接列表
    connections.append(ws)
    try:
        while True:
            # 即使客户端不发消息，也能收到服务器的报时
            # receive_text 只负责接收，后台广播独立运行
            data = await ws.receive_text()
            await ws.send_text(f"你说: {data}")
    except Exception:
        # 客户端断开，从列表移除
        if ws in connections:
            connections.remove(ws)
\`\`\`

## 六、实战：实时聊天室

把前面所有知识拼起来，做一个完整的多人聊天室，包含前端页面。

### 6.1 后端代码

\`\`\`python filename="demo5: 实时聊天室后端"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 导入 asyncio
import asyncio
# 从 typing 导入 List、Dict
from typing import List, Dict
# 导入 datetime
from datetime import datetime

# 创建应用
app = FastAPI(title="实时聊天室")

# 连接管理器（改进版）
class ChatManager:
    def __init__(self):
        # 连接列表
        self.connections: List[WebSocket] = []
        # 连接→用户名映射
        self.users: Dict[WebSocket, str] = {}
        # 锁
        self.lock = asyncio.Lock()

    # 连接
    async def connect(self, ws: WebSocket, user: str):
        async with self.lock:
            await ws.accept()
            self.connections.append(ws)
            self.users[ws] = user
        # 广播更新在线列表
        await self.broadcast_users()

    # 断开
    async def disconnect(self, ws: WebSocket):
        async with self.lock:
            if ws in self.connections:
                self.connections.remove(ws)
            user = self.users.pop(ws, "未知")
        # 广播更新在线列表
        await self.broadcast_users()
        return user

    # 广播文本
    async def broadcast(self, message: str):
        # 快照遍历
        for ws in list(self.connections):
            try:
                await ws.send_text(message)
            except Exception:
                await self.disconnect(ws)

    # 广播 JSON（用于结构化消息）
    async def broadcast_json(self, data: dict):
        for ws in list(self.connections):
            try:
                await ws.send_json(data)
            except Exception:
                await self.disconnect(ws)

    # 广播在线用户列表
    async def broadcast_users(self):
        # 取当前用户名列表
        async with self.lock:
            user_list = list(self.users.values())
        # 构造消息
        await self.broadcast_json({
            "type": "users",
            "users": user_list,
            "count": len(user_list)
        })

    # 获取在线人数
    async def get_count(self) -> int:
        async with self.lock:
            return len(self.connections)

# 全局管理器
manager = ChatManager()

# WebSocket 端点
@app.websocket("/chat/{user}")
async def chat_endpoint(ws: WebSocket, user: str):
    # 连接
    await manager.connect(ws, user)
    # 广播加入通知
    await manager.broadcast_json({
        "type": "system",
        "content": f"{user} 加入了聊天室",
        "time": datetime.now().strftime("%H:%M:%S")
    })
    # 消息循环
    try:
        while True:
            # 接收 JSON
            data = await ws.receive_json()
            # 取消息内容
            content = data.get("content", "")
            # 广播给所有人
            await manager.broadcast_json({
                "type": "message",
                "from": user,
                "content": content,
                "time": datetime.now().strftime("%H:%M:%S")
            })
    except WebSocketDisconnect:
        # 断开
        left = await manager.disconnect(ws)
        # 通知
        await manager.broadcast_json({
            "type": "system",
            "content": f"{left} 离开了聊天室",
            "time": datetime.now().strftime("%H:%M:%S")
        })

# HTTP 接口：在线人数
@app.get("/api/online")
async def online():
    return {"count": await manager.get_count()}
\`\`\`

### 6.2 前端页面

\`\`\`html filename="demo6: 聊天室前端"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>聊天室</title></head>
<body>
  <div>
    <input id="userInput" placeholder="你的名字" value="alice" />
    <button onclick="connect()">连接</button>
    <button onclick="disconnect()">断开</button>
    <span id="onlineCount">在线: 0</span>
  </div>
  <div id="users" style="color:gray;font-size:12px;"></div>
  <div id="messages" style="height:300px;overflow:auto;border:1px solid #ccc;"></div>
  <input id="msgInput" placeholder="输入消息" />
  <button onclick="sendMsg()">发送</button>

  <script>
    let ws = null;

    // 连接
    function connect() {
      const user = document.getElementById("userInput").value;
      ws = new WebSocket("ws://localhost:8000/chat/" + user);
      ws.onopen = () => appendMsg("系统: 已连接");
      ws.onmessage = (e) => {
        // 解析 JSON
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          appendMsg(data.time + " " + data.from + ": " + data.content);
        } else if (data.type === "system") {
          appendMsg(data.time + " [系统] " + data.content);
        } else if (data.type === "users") {
          document.getElementById("onlineCount").textContent = "在线: " + data.count;
          document.getElementById("users").textContent = "在线用户: " + data.users.join(", ");
        }
      };
      ws.onclose = () => appendMsg("系统: 已断开");
    }

    // 断开
    function disconnect() {
      if (ws) ws.close();
    }

    // 发送
    function sendMsg() {
      const text = document.getElementById("msgInput").value;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ content: text }));
        document.getElementById("msgInput").value = "";
      }
    }

    // 回车发送
    document.getElementById("msgInput").onkeydown = (e) => {
      if (e.key === "Enter") sendMsg();
    };

    // 追加消息
    function appendMsg(text) {
      const div = document.createElement("div");
      div.textContent = text;
      const box = document.getElementById("messages");
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;  // 自动滚到底
    }
  </script>
</body>
</html>
\`\`\`

打开多个浏览器标签，输入不同名字连接，就能互相聊天了。

## 七、多进程部署与 Redis Pub/Sub

### 7.1 单进程的局限

uvicorn 单进程跑没问题，但生产环境为了利用多核，通常 \`uvicorn --workers 4\` 启动 4 个进程。每个进程有自己的 \`ConnectionManager\`，**A 连到进程1，B 连到进程2，A 发消息 B 收不到**——因为进程1 的广播只发给进程1 自己的连接。

\`\`\`txt filename="多进程的连接隔离问题"
进程1: connections = [A, B]      ← 广播只发给 A、B
进程2: connections = [C, D]      ← 广播只发给 C、D
进程3: connections = [E]
↑ A 发的消息，C/D/E 收不到
\`\`\`

### 7.2 用 Redis Pub/Sub 跨进程广播

解法是用一个**中间件**（Redis）做消息分发：每个进程订阅 Redis 频道，要广播时发到 Redis，所有进程收到后各自推给自己的连接。

\`\`\`txt filename="Redis Pub/Sub 广播流程"
A (进程1) 发消息
  ↓
进程1 publish 到 Redis 频道 "chat"
  ↓
Redis 把消息推给所有订阅者（进程1/2/3）
  ↓
每个进程收到后，遍历自己的 connections 发送
  ↓
A/B/C/D/E 都收到
\`\`\`

### 7.3 Redis Pub/Sub 代码骨架

\`\`\`python filename="demo7: Redis Pub/Sub 跨进程广播（骨架）"
# 需要 pip install redis aioredis（或 redis>=4.2 自带 async）
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# 简化版：用 redis.asyncio
# redis 4.2+ 自带异步支持，不用单独装 aioredis
try:
    from redis.asyncio import Redis
except ImportError:
    Redis = None

class RedisChatManager:
    def __init__(self):
        # 本进程的连接列表
        # 每个 worker 进程只管自己的连接
        self.connections = []
        # Redis 客户端（发布用）
        # 所有进程连同一个 Redis，通过频道通信
        self.redis = Redis(host="localhost", port=6379) if Redis else None
        # 启动订阅任务
        # create_task 在后台跑订阅循环，不阻塞主流程
        if self.redis:
            asyncio.create_task(self._subscribe())

    # 订阅 Redis 频道
    async def _subscribe(self):
        # 用 pubsub 订阅
        # pubsub 是 Redis 的发布订阅机制，类似消息队列
        pubsub = self.redis.pubsub()
        # subscribe 订阅频道，之后能收到该频道的所有消息
        await pubsub.subscribe("chat_channel")
        # 持续监听
        # async for 会阻塞，直到有新消息
        async for message in pubsub.listen():
            if message["type"] == "message":
                # 收到消息，分发给本进程所有连接
                # message["data"] 是 bytes，要 decode 成 str
                data = message["data"].decode()
                for ws in list(self.connections):
                    try:
                        await ws.send_text(data)
                    except Exception:
                        self.connections.remove(ws)

    # 连接
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    # 断开
    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    # 广播：发到 Redis，所有进程都会收到
    async def broadcast(self, message: str):
        if self.redis:
            # publish 把消息发到 Redis 频道
            # 所有订阅了该频道的进程（包括自己）都会收到
            # 这样跨进程广播就实现了
            await self.redis.publish("chat_channel", message)
        else:
            # 没有 Redis 就本地广播
            # 降级方案：只在本进程内广播，多进程下消息会丢
            for ws in list(self.connections):
                try:
                    await ws.send_text(message)
                except Exception:
                    self.disconnect(ws)

manager = RedisChatManager()

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(ws)
\`\`\`

> 这是骨架，生产环境还要处理 Redis 重连、消息丢失等。但思路很清晰：**用 Redis 做跨进程消息总线**。

## 八、常见错误与避坑指南

1. **广播时连接已断**：必须 try/except，否则一个断连导致整次广播失败。
2. **遍历时修改列表**：\`for ws in self.connections\` 里 remove，会 RuntimeError。**遍历副本 \`list(self.connections)\`**。
3. **忘了在 disconnect 后广播**：用户离开了但没通知其他人，其他人以为他还在。**disconnect 后立即广播"xxx 离开"**。
4. **连接泄漏**：异常没处理，连接没从列表移除，越积越多，内存涨。**finally 里务必 disconnect**。
5. **心跳超时设太短**：手机网络抖动 1-2 秒很常见，超时设 10 秒会误杀。**建议 60 秒以上**。
6. **多 worker 不共享连接**：单进程测试正常，上多 worker 就"丢消息"。**必须用 Redis Pub/Sub**。
7. **\`asyncio.create_task\` 没持有引用**：后台任务被 GC 回收，莫名消失。**把 task 存到全局变量**：
   \`\`\`python
   bg_tasks = set()
   task = asyncio.create_task(broadcast_time())
   bg_tasks.add(task)
   task.add_done_callback(bg_tasks.discard)
   \`\`\`
8. **广播消息太大**：一次发 1MB 的 JSON 给 1000 个连接，会阻塞事件循环。**大消息分片或用 SSE 流式**。
9. **用 \`manager.disconnect(ws)\` 但没 await**：改进版 disconnect 是 async 的，不 await 不会执行清理。
10. **在线列表频繁广播**：每来一个人就广播全量列表，人多时消息风暴。**可以增量更新，或只在人数变化时广播**。

## 九、本章小结

- 多人实时通信的核心是**连接管理 + 广播**，用 \`ConnectionManager\` 类封装职责。
- \`connect/disconnect/broadcast\` 三件套，broadcast 必须**容错**（try/except）和**遍历副本**。
- 并发安全用 \`asyncio.Lock\` 保护共享数据，单线程也要防"遍历中被修改"。
- **心跳机制**及时发现死连接，用 \`asyncio.wait_for\` 给 receive 加超时是最简单的实现。
- 多 worker 部署要用 **Redis Pub/Sub** 做跨进程广播，否则消息会丢。
- 后台定时广播用 \`asyncio.create_task\` + \`startup\` 事件，注意持有 task 引用防 GC。

下一章我们给聊天系统加上"房间"概念——不同话题的聊天室互不干扰，还能私聊指定用户。
`
  },

  // =========================================================
  // 第三章：房间机制与私聊
  // =========================================================
  {
    id: "fa-ws-rooms",
    group: "WebSocket 实时通信",
    icon: "🚪",
    title: "房间机制与私聊",
    content: `

# 房间机制与私聊

## 一、开篇：为什么需要"房间"

上一章的聊天室是"大喇叭"模式——所有人都在一个大厅里，谁说话所有人都听见。但真实业务往往需要**分组通信**：

- **游戏房间**：4 个人一桌打牌，别的桌听不到你们的对话。
- **客服系统**：客户 A 和客服 B 是一条独立会话，互不打扰。
- **多话题聊天**：技术群、闲聊群、公告群，各聊各的。
- **私聊**：A 想单独对 B 说句话，不希望别人看见。

这就引出**房间（Room）**的概念：把连接按"房间"分组，消息只在自己的房间内广播；再进一步，**私聊**就是"房间内只有两个人的特例"。

这一章我们设计 \`RoomManager\`，实现加入/离开房间、房间内广播、私聊、在线列表，最后做出一个多房间聊天系统。

## 二、房间的概念设计

### 2.1 数据结构怎么想

最直观的设计是：\`rooms: Dict[room_id, List[WebSocket]]\`——房间ID 到连接列表的映射。但这样有几个问题：

1. **同一个用户多个连接**（手机+电脑同时登录）怎么处理？
2. **反查"这个连接在哪个房间"** 要遍历所有房间，慢。
3. **私聊**要按用户名找人，不是按连接找。

更好的设计是**双向映射**：
- \`user_connections: Dict[user_id, Set[WebSocket]]\`：用户→他的所有连接（支持多端登录）。
- \`room_users: Dict[room_id, Set[user_id]]\`：房间→房间里的所有用户。
- \`user_rooms: Dict[user_id, Set[room_id]]\`：用户→他加入的所有房间（反查快）。

\`\`\`txt filename="双向映射设计"
user_connections: { "alice": {ws1, ws2}, "bob": {ws3} }
room_users:       { "tech": {"alice","bob"}, "game": {"bob"} }
user_rooms:       { "alice": {"tech"}, "bob": {"tech","game"} }

→ 要给 tech 房间广播：
    room_users["tech"] = {"alice","bob"}
    → 对 alice: 遍历 user_connections["alice"]={ws1,ws2} 都发
    → 对 bob:   遍历 user_connections["bob"]={ws3} 发
→ 要查 alice 在哪些房间：直接 user_rooms["alice"]，O(1)
\`\`\`

这种设计虽然数据冗余，但查询和广播都高效，是实时系统的常见权衡。

### 2.2 消息类型设计

房间系统的消息要区分类型，前端才知道怎么渲染：

\`\`\`json filename="消息类型约定"
{"type": "join",      "room": "tech", "user": "alice", "time": "..."}
{"type": "leave",     "room": "tech", "user": "alice", "time": "..."}
{"type": "room_msg",  "room": "tech", "from": "alice", "content": "...", "time": "..."}
{"type": "private",   "from": "alice", "to": "bob", "content": "...", "time": "..."}
{"type": "user_list", "room": "tech", "users": ["alice","bob"]}
{"type": "error",     "message": "房间不存在"}
\`\`\`

## 三、RoomManager 基础实现

### 3.1 加入与离开房间

\`\`\`python filename="demo1: RoomManager 加入/离开房间"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 从 typing 导入 Dict、Set、List
from typing import Dict, Set, List
# 导入 asyncio
import asyncio

# 创建应用
app = FastAPI()

# 房间管理器
# 用三个字典实现双向映射，支持多端登录和高效反查
class RoomManager:
    def __init__(self):
        # 用户→连接集合（一个用户可能多端登录）
        # 用 Set 是因为同一用户的多个连接不重复
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        # 房间→用户集合
        # 存用户名而不是连接，因为一个用户可能多端登录
        self.room_users: Dict[str, Set[str]] = {}
        # 用户→房间集合（反查用）
        # 查"这个用户在哪些房间"时 O(1)，不用遍历所有房间
        self.user_rooms: Dict[str, Set[str]] = {}
        # 锁
        # 保护三个字典的修改，避免并发导致数据不一致
        self.lock = asyncio.Lock()

    # 用户连接（首次建立 WebSocket）
    async def register(self, user: str, ws: WebSocket):
        async with self.lock:
            # 如果该用户还没有连接集合，创建
            if user not in self.user_connections:
                self.user_connections[user] = set()
            # 加入连接
            # 同一用户多次连接（手机+电脑），都加到集合里
            self.user_connections[user].add(ws)
        # 接受握手（锁外做，避免阻塞）
        # accept 是 I/O 操作，放锁外不阻塞其他协程
        await ws.accept()

    # 用户断开
    async def unregister(self, user: str, ws: WebSocket):
        async with self.lock:
            # 从该用户的连接集合移除
            if user in self.user_connections:
                # discard 不存在不报错，比 remove 安全
                self.user_connections[user].discard(ws)
                # 如果连接集合空了，说明用户彻底下线
                # 所有端都断开了，才需要清理房间
                if not self.user_connections[user]:
                    del self.user_connections[user]
                    # 从所有他加入的房间移除
                    for room in self.user_rooms.get(user, set()):
                        self.room_users.get(room, set()).discard(user)
                        # 如果房间空了，删掉房间
                        # 空房间占内存，及时清理
                        if not self.room_users.get(room):
                            self.room_users.pop(room, None)
                    # 删用户的房间记录
                    self.user_rooms.pop(user, None)
                    # 返回 True 表示用户彻底下线
                    # 上层据此决定是否广播"xxx 下线"
                    return True
            return False

    # 加入房间
    async def join_room(self, user: str, room: str):
        async with self.lock:
            # 房间不存在则创建
            if room not in self.room_users:
                self.room_users[room] = set()
            # 用户加入房间
            self.room_users[room].add(user)
            # 记录用户加入了哪个房间
            # 双向更新：room_users 和 user_rooms 都要改，保持一致
            if user not in self.user_rooms:
                self.user_rooms[user] = set()
            self.user_rooms[user].add(room)

    # 离开房间
    async def leave_room(self, user: str, room: str):
        async with self.lock:
            # 从房间移除用户
            if room in self.room_users:
                self.room_users[room].discard(user)
                # 房间空了就删
                if not self.room_users[room]:
                    del self.room_users[room]
            # 从用户的房间集合移除
            # 双向更新，和 join_room 对称
            if user in self.user_rooms:
                self.user_rooms[user].discard(room)

    # 获取房间内用户列表
    async def get_room_users(self, room: str) -> List[str]:
        async with self.lock:
            # 返回列表副本，避免外部修改影响内部数据
            return list(self.room_users.get(room, set()))

    # 获取所有房间
    async def get_all_rooms(self) -> List[str]:
        async with self.lock:
            return list(self.room_users.keys())

# 全局管理器
manager = RoomManager()

# WebSocket 端点
@app.websocket("/ws/{user}")
async def ws_endpoint(ws: WebSocket, user: str):
    # 注册连接
    await manager.register(user, ws)
    # 消息循环
    try:
        while True:
            # 接收 JSON 消息
            data = await ws.receive_json()
            # 取消息类型
            # 用 type 字段区分不同操作，前端按 type 路由处理逻辑
            msg_type = data.get("type")
            # 处理加入房间
            if msg_type == "join":
                room = data.get("room")
                await manager.join_room(user, room)
                await ws.send_json({"type": "joined", "room": room})
            # 处理离开房间
            elif msg_type == "leave":
                room = data.get("room")
                await manager.leave_room(user, room)
                await ws.send_json({"type": "left", "room": room})
            # 查询房间列表
            elif msg_type == "rooms":
                rooms = await manager.get_all_rooms()
                await ws.send_json({"type": "rooms", "rooms": rooms})
    except WebSocketDisconnect:
        # 注销
        await manager.unregister(user, ws)
\`\`\`

### 3.2 房间内广播

\`\`\`python filename="demo2: 房间内广播"
# 在 RoomManager 类里添加 broadcast_to_room 方法

class RoomManager:
    # ... 前面的方法省略 ...

    # 给指定房间广播消息
    # 只发给该房间内的用户，其他房间收不到
    async def broadcast_to_room(self, room: str, message: dict):
        # 取房间内所有用户（快照）
        # 在锁内拷贝一份，锁外遍历，避免长时间持锁
        async with self.lock:
            users = list(self.room_users.get(room, set()))
        # 遍历用户
        for user in users:
            # 取该用户的所有连接
            # 一个用户可能多端登录，每个连接都要发
            async with self.lock:
                conns = list(self.user_connections.get(user, set()))
            # 给每个连接发
            for ws in conns:
                try:
                    await ws.send_json(message)
                except Exception:
                    # 发送失败，移除该连接
                    # 连接已断，从用户的连接集合移除
                    async with self.lock:
                        if user in self.user_connections:
                            self.user_connections[user].discard(ws)

    # 给指定用户发私聊
    # 私聊就是"房间内只有两个人"的特例，直接发给目标用户的所有连接
    async def send_to_user(self, to_user: str, message: dict):
        # 取该用户所有连接
        async with self.lock:
            conns = list(self.user_connections.get(to_user, set()))
        # 发送
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                async with self.lock:
                    if to_user in self.user_connections:
                        self.user_connections[to_user].discard(ws)

# 在 ws_endpoint 里处理 room_msg 和 private
@app.websocket("/ws/{user}")
async def ws_endpoint(ws: WebSocket, user: str):
    await manager.register(user, ws)
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")
            if msg_type == "join":
                room = data.get("room")
                await manager.join_room(user, room)
                # 广播给房间内其他人：xxx 加入了
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 加入了房间",
                    "time": "12:00:00"
                })
            elif msg_type == "leave":
                room = data.get("room")
                await manager.leave_room(user, room)
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 离开了房间",
                    "time": "12:00:00"
                })
            elif msg_type == "room_msg":
                room = data.get("room")
                content = data.get("content", "")
                # 广播给房间所有人
                await manager.broadcast_to_room(room, {
                    "type": "room_msg",
                    "room": room,
                    "from": user,
                    "content": content,
                    "time": "12:00:00"
                })
            elif msg_type == "private":
                to = data.get("to")
                content = data.get("content", "")
                # 发给对方
                await manager.send_to_user(to, {
                    "type": "private",
                    "from": user,
                    "to": to,
                    "content": content,
                    "time": "12:00:00"
                })
                # 也发给自己（回显）
                await manager.send_to_user(user, {
                    "type": "private",
                    "from": user,
                    "to": to,
                    "content": content,
                    "time": "12:00:00"
                })
    except WebSocketDisconnect:
        await manager.unregister(user, ws)
\`\`\`

## 四、在线用户列表与房间列表

### 4.1 实时推送在线列表

每次有人加入/离开，都要更新房间内的在线列表：

\`\`\`python filename="demo3: 在线用户列表推送"
# 在 RoomManager 添加 broadcast_user_list 方法

class RoomManager:
    # ...

    # 广播房间内用户列表
    async def broadcast_user_list(self, room: str):
        users = await self.get_room_users(room)
        await self.broadcast_to_room(room, {
            "type": "user_list",
            "room": room,
            "users": users,
            "count": len(users)
        })

# 在 join/leave 后调用
@app.websocket("/ws/{user}")
async def ws_endpoint(ws: WebSocket, user: str):
    await manager.register(user, ws)
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")
            if msg_type == "join":
                room = data.get("room")
                await manager.join_room(user, room)
                # 推送系统消息
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 加入了房间"
                })
                # 推送更新后的用户列表
                await manager.broadcast_user_list(room)
            elif msg_type == "leave":
                room = data.get("room")
                await manager.leave_room(user, room)
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 离开了房间"
                })
                # 推送更新后的列表
                await manager.broadcast_user_list(room)
            elif msg_type == "room_msg":
                room = data.get("room")
                content = data.get("content", "")
                await manager.broadcast_to_room(room, {
                    "type": "room_msg",
                    "room": room,
                    "from": user,
                    "content": content
                })
            elif msg_type == "private":
                to = data.get("to")
                content = data.get("content", "")
                await manager.send_to_user(to, {
                    "type": "private",
                    "from": user,
                    "to": to,
                    "content": content
                })
                await manager.send_to_user(user, {
                    "type": "private",
                    "from": user,
                    "to": to,
                    "content": content,
                    "self": True
                })
            elif msg_type == "list_rooms":
                rooms = await manager.get_all_rooms()
                await ws.send_json({"type": "rooms", "rooms": rooms})
            elif msg_type == "list_users":
                room = data.get("room")
                users = await manager.get_room_users(room)
                await ws.send_json({
                    "type": "user_list",
                    "room": room,
                    "users": users
                })
    except WebSocketDisconnect:
        offline = await manager.unregister(user, ws)
        # 如果用户彻底下线，通知他所在的所有房间
        if offline:
            # 这里简化：通知所有房间
            # 真实场景要在 unregister 前记录用户在哪些房间
            for room in await manager.get_all_rooms():
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 下线了"
                })
                await manager.broadcast_user_list(room)
\`\`\`

## 五、实战：多房间聊天系统

### 5.1 完整后端

\`\`\`python filename="demo4: 多房间聊天系统后端"
# 导入 FastAPI、WebSocket、WebSocketDisconnect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# 从 typing 导入 Dict、Set、List
from typing import Dict, Set, List
# 导入 asyncio、datetime
import asyncio
from datetime import datetime

# 创建应用
app = FastAPI(title="多房间聊天")

# 获取当前时间字符串
def now():
    return datetime.now().strftime("%H:%M:%S")

# 房间管理器（完整版）
class RoomManager:
    def __init__(self):
        # 用户→连接集合
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        # 房间→用户集合
        self.room_users: Dict[str, Set[str]] = {}
        # 用户→房间集合
        self.user_rooms: Dict[str, Set[str]] = {}
        self.lock = asyncio.Lock()

    async def register(self, user: str, ws: WebSocket):
        async with self.lock:
            if user not in self.user_connections:
                self.user_connections[user] = set()
            self.user_connections[user].add(ws)
        await ws.accept()

    async def unregister(self, user: str, ws: WebSocket):
        async with self.lock:
            if user in self.user_connections:
                self.user_connections[user].discard(ws)
                if not self.user_connections[user]:
                    del self.user_connections[user]
                    # 记录用户之前在哪些房间
                    rooms = list(self.user_rooms.get(user, set()))
                    for room in rooms:
                        self.room_users.get(room, set()).discard(user)
                        if not self.room_users.get(room):
                            self.room_users.pop(room, None)
                    self.user_rooms.pop(user, None)
                    # 返回用户之前所在的房间列表
                    return rooms
            return []

    async def join_room(self, user: str, room: str):
        async with self.lock:
            if room not in self.room_users:
                self.room_users[room] = set()
            self.room_users[room].add(user)
            if user not in self.user_rooms:
                self.user_rooms[user] = set()
            self.user_rooms[user].add(room)

    async def leave_room(self, user: str, room: str):
        async with self.lock:
            if room in self.room_users:
                self.room_users[room].discard(user)
                if not self.room_users[room]:
                    del self.room_users[room]
            if user in self.user_rooms:
                self.user_rooms[user].discard(room)

    async def get_room_users(self, room: str) -> List[str]:
        async with self.lock:
            return list(self.room_users.get(room, set()))

    async def get_all_rooms(self) -> List[str]:
        async with self.lock:
            return list(self.room_users.keys())

    async def broadcast_to_room(self, room: str, message: dict):
        async with self.lock:
            users = list(self.room_users.get(room, set()))
        for user in users:
            async with self.lock:
                conns = list(self.user_connections.get(user, set()))
            for ws in conns:
                try:
                    await ws.send_json(message)
                except Exception:
                    async with self.lock:
                        if user in self.user_connections:
                            self.user_connections[user].discard(ws)

    async def send_to_user(self, to_user: str, message: dict):
        async with self.lock:
            conns = list(self.user_connections.get(to_user, set()))
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                async with self.lock:
                    if to_user in self.user_connections:
                        self.user_connections[to_user].discard(ws)

    async def broadcast_user_list(self, room: str):
        users = await self.get_room_users(room)
        await self.broadcast_to_room(room, {
            "type": "user_list",
            "room": room,
            "users": users,
            "count": len(users)
        })

# 全局管理器
manager = RoomManager()

# WebSocket 端点
@app.websocket("/ws/{user}")
async def ws_endpoint(ws: WebSocket, user: str):
    # 注册
    await manager.register(user, ws)
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")
            # 加入房间
            if msg_type == "join":
                room = data.get("room")
                await manager.join_room(user, room)
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 加入了房间",
                    "time": now()
                })
                await manager.broadcast_user_list(room)
            # 离开房间
            elif msg_type == "leave":
                room = data.get("room")
                await manager.leave_room(user, room)
                await manager.broadcast_to_room(room, {
                    "type": "system",
                    "room": room,
                    "content": f"{user} 离开了房间",
                    "time": now()
                })
                await manager.broadcast_user_list(room)
            # 房间消息
            elif msg_type == "room_msg":
                room = data.get("room")
                content = data.get("content", "")
                await manager.broadcast_to_room(room, {
                    "type": "room_msg",
                    "room": room,
                    "from": user,
                    "content": content,
                    "time": now()
                })
            # 私聊
            elif msg_type == "private":
                to = data.get("to")
                content = data.get("content", "")
                await manager.send_to_user(to, {
                    "type": "private",
                    "from": user,
                    "to": to,
                    "content": content,
                    "time": now()
                })
                await manager.send_to_user(user, {
                    "type": "private",
                    "from": user,
                    "to": to,
                    "content": content,
                    "time": now(),
                    "self": True
                })
            # 查询房间列表
            elif msg_type == "list_rooms":
                rooms = await manager.get_all_rooms()
                await ws.send_json({"type": "rooms", "rooms": rooms})
            # 查询房间用户
            elif msg_type == "list_users":
                room = data.get("room")
                users = await manager.get_room_users(room)
                await ws.send_json({
                    "type": "user_list",
                    "room": room,
                    "users": users,
                    "count": len(users)
                })
    except WebSocketDisconnect:
        # 注销并通知所有房间
        rooms = await manager.unregister(user, ws)
        for room in rooms:
            await manager.broadcast_to_room(room, {
                "type": "system",
                "room": room,
                "content": f"{user} 下线了",
                "time": now()
            })
            await manager.broadcast_user_list(room)

# HTTP 接口：查所有房间
@app.get("/api/rooms")
async def list_rooms():
    return {"rooms": await manager.get_all_rooms()}

# HTTP 接口：查房间在线用户
@app.get("/api/rooms/{room}/users")
async def room_users(room: str):
    users = await manager.get_room_users(room)
    return {"room": room, "users": users, "count": len(users)}
\`\`\`

### 5.2 前端页面

\`\`\`html filename="demo5: 多房间聊天前端"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>多房间聊天</title></head>
<body>
  <div>
    <input id="userInput" placeholder="你的名字" value="alice" />
    <button onclick="connect()">连接</button>
  </div>
  <div>
    <input id="roomInput" placeholder="房间名" value="tech" />
    <button onclick="joinRoom()">加入房间</button>
    <button onclick="leaveRoom()">离开房间</button>
    <button onclick="listRooms()">所有房间</button>
  </div>
  <div style="display:flex;">
    <div style="width:70%;">
      <div id="messages" style="height:300px;overflow:auto;border:1px solid #ccc;"></div>
      <input id="msgInput" placeholder="房间消息" />
      <button onclick="sendRoomMsg()">发送到房间</button>
    </div>
    <div style="width:30%;">
      <h4>房间用户</h4>
      <div id="userList"></div>
      <h4>私聊</h4>
      <input id="toUser" placeholder="对方" />
      <input id="privateMsg" placeholder="私聊内容" />
      <button onclick="sendPrivate()">发送私聊</button>
    </div>
  </div>

  <script>
    let ws = null;
    let currentUser = "";

    function connect() {
      currentUser = document.getElementById("userInput").value;
      ws = new WebSocket("ws://localhost:8000/ws/" + currentUser);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "room_msg") {
          appendMsg("[" + data.room + "] " + data.time + " " + data.from + ": " + data.content);
        } else if (data.type === "private") {
          const tag = data.self ? "(我发)" : "";
          appendMsg("[私聊] " + data.time + " " + data.from + "→" + data.to + tag + ": " + data.content);
        } else if (data.type === "system") {
          appendMsg("[系统] " + data.content);
        } else if (data.type === "user_list") {
          document.getElementById("userList").textContent =
            "房间 " + data.room + " (" + data.count + "人): " + data.users.join(", ");
        } else if (data.type === "rooms") {
          appendMsg("[房间列表] " + data.rooms.join(", "));
        }
      };
      ws.onclose = () => appendMsg("系统: 已断开");
    }

    function send(obj) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
      }
    }

    function joinRoom() {
      send({ type: "join", room: document.getElementById("roomInput").value });
    }
    function leaveRoom() {
      send({ type: "leave", room: document.getElementById("roomInput").value });
    }
    function listRooms() {
      send({ type: "list_rooms" });
    }
    function sendRoomMsg() {
      send({
        type: "room_msg",
        room: document.getElementById("roomInput").value,
        content: document.getElementById("msgInput").value
      });
      document.getElementById("msgInput").value = "";
    }
    function sendPrivate() {
      send({
        type: "private",
        to: document.getElementById("toUser").value,
        content: document.getElementById("privateMsg").value
      });
      document.getElementById("privateMsg").value = "";
    }

    function appendMsg(text) {
      const div = document.createElement("div");
      div.textContent = text;
      const box = document.getElementById("messages");
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }
  </script>
</body>
</html>
\`\`\`

## 六、私聊的细节处理

### 6.1 用户不在线怎么办

上面的私聊代码，如果 \`to\` 用户不在线，\`send_to_user\` 找不到连接，消息就丢了。两种解法：

1. **存离线消息**：把消息存数据库，用户下次上线时推送。适合 IM 场景。
2. **回执告知**：发不到就告诉发送方"对方不在线"。

\`\`\`python filename="demo6: 离线消息处理"
# 在 RoomManager 加 send_to_user_with_ack 方法

class RoomManager:
    # ...

    # 带回执的私聊：返回是否送达
    # 相比 send_to_user，多了返回值，调用方知道有没有送到
    async def send_to_user_with_ack(self, to_user: str, message: dict) -> bool:
        async with self.lock:
            conns = list(self.user_connections.get(to_user, set()))
        # 用户不在线
        # 没有连接说明对方没上线或已下线
        if not conns:
            return False
        # 在线则发
        delivered = False
        for ws in conns:
            try:
                await ws.send_json(message)
                # 只要有一个连接送达，就认为成功
                delivered = True
            except Exception:
                async with self.lock:
                    if to_user in self.user_connections:
                        self.user_connections[to_user].discard(ws)
        return delivered

# 在 ws_endpoint 的 private 分支用 ack
elif msg_type == "private":
    to = data.get("to")
    content = data.get("content", "")
    msg = {
        "type": "private",
        "from": user,
        "to": to,
        "content": content,
        "time": now()
    }
    # 尝试发送
    delivered = await manager.send_to_user_with_ack(to, msg)
    if delivered:
        # 给自己回显
        # 发送方需要看到自己发的消息，所以也发一份给自己
        msg["self"] = True
        await manager.send_to_user(user, msg)
    else:
        # 告知发送方对方不在线
        # 让发送方知道消息没送到，可以稍后重试或存离线
        await manager.send_to_user(user, {
            "type": "error",
            "message": f"{to} 不在线，消息未送达"
        })
\`\`\`

### 6.2 离线消息持久化

更完整的方案是存数据库：

\`\`\`python filename="demo7: 离线消息存数据库（示意）"
# 用一个简单的 dict 模拟离线消息库
# 真实场景用 SQLite/Redis
offline_messages: Dict[str, List[dict]] = {}

# 存离线消息
def store_offline(user: str, message: dict):
    if user not in offline_messages:
        offline_messages[user] = []
    offline_messages[user].append(message)

# 用户上线时推送离线消息
async def push_offline(user: str):
    msgs = offline_messages.pop(user, [])
    for m in msgs:
        await manager.send_to_user(user, m)

# 在 register 后调用 push_offline
@app.websocket("/ws/{user}")
async def ws_endpoint(ws: WebSocket, user: str):
    await manager.register(user, ws)
    # 推送离线消息
    await push_offline(user)
    # ... 后续循环
\`\`\`

## 七、房间权限与黑名单

真实业务里，房间可能有权限：加群要审批、被踢出不能再加。可以扩展 \`RoomManager\`：

\`\`\`python filename="demo8: 房间权限扩展（示意）"
class RoomManager:
    def __init__(self):
        # ... 前面的字段 ...
        # 房间→黑名单
        self.room_blacklist: Dict[str, Set[str]] = {}
        # 房间→管理员
        self.room_admins: Dict[str, Set[str]] = {}

    # 加入房间前检查
    async def join_room(self, user: str, room: str) -> bool:
        async with self.lock:
            # 检查黑名单
            if user in self.room_blacklist.get(room, set()):
                return False  # 被拉黑，拒绝
            # 正常加入
            if room not in self.room_users:
                self.room_users[room] = set()
            self.room_users[room].add(user)
            if user not in self.user_rooms:
                self.user_rooms[user] = set()
            self.user_rooms[user].add(room)
            return True

    # 踢人（只有管理员能踢）
    async def kick_user(self, room: str, admin: str, target: str) -> bool:
        async with self.lock:
            # 检查 admin 是不是管理员
            if admin not in self.room_admins.get(room, set()):
                return False
            # 把 target 加入黑名单
            if room not in self.room_blacklist:
                self.room_blacklist[room] = set()
            self.room_blacklist[room].add(target)
            # 从房间移除
            self.room_users.get(room, set()).discard(target)
            if target in self.user_rooms:
                self.user_rooms[target].discard(room)
            return True
\`\`\`

## 八、常见错误与避坑指南

1. **广播时锁持有太久**：在 \`broadcast_to_room\` 里全程持锁，会阻塞其他操作。**只在读取数据时持锁，发送在锁外**。
2. **多端登录消息重复**：用户手机和电脑同时在线，私聊时两个端都收到，这其实是**正确行为**（同步多端）。但如果业务要求"只发最新端"，要做端优先级。
3. **离开房间没清理**：用户断开但没从房间移除，房间列表越来越大。**unregister 时务必清理所有房间**。
4. **房间名大小写**：\`Tech\` 和 \`tech\` 被当成两个房间。**统一转小写**或用 UUID。
5. **私聊发给自己**：没判断 \`to == user\`，可能死循环或重复。**显式处理**。
6. **并发修改 Set**：和 list 一样，遍历 Set 时被修改会出错。**遍历前 \`list()\` 拷贝**。
7. **房间没人了不删**：空房间占内存，越来越多。**leave 时检查并删除空房间**。
8. **私聊消息没存离线**：对方不在线消息就丢。**IM 场景必须存离线消息**。
9. **广播风暴**：1000 人的房间，每条消息要遍历 1000 个用户×N 个连接，事件循环卡住。**大房间用分片或 Redis Stream**。
10. **\`user_rooms\` 和 \`room_users\` 不同步**：只更新了一边，导致数据不一致。**所有修改都在锁里、成对更新**。

## 九、本章小结

- 房间机制的核心是**分组广播**，用 \`room_users\` 和 \`user_rooms\` 双向映射高效查询。
- 支持**多端登录**用 \`user_connections: Dict[user, Set[ws]]\`，一个用户可有多个连接。
- 房间内广播只发给该房间的用户的所有连接；私聊是"房间内只有两个人"的特例。
- 在线用户列表在每次 join/leave 后推送，前端实时显示。
- 私聊要处理**离线消息**：存数据库，用户上线时推送。
- 房间可扩展**权限**：黑名单、管理员、踢人。
- 数据结构修改必须在锁里，遍历要拷贝，离开要清理。

下一章我们学习 SSE（Server-Sent Events），它比 WebSocket 更轻量，适合"服务器单向推送"场景，并对比两者的选型。
`
  },

  // =========================================================
  // 第四章：SSE 与实时通信选型
  // =========================================================
  {
    id: "fa-sse",
    group: "WebSocket 实时通信",
    icon: "📺",
    title: "SSE 与实时通信选型",
    content: `

# SSE 与实时通信选型

## 一、开篇：实时通信不止 WebSocket

前三章我们深入了 WebSocket，它能双向通信，看起来"什么实时场景都能搞定"。但 WebSocket 也有代价：协议复杂、需要长连接管理、多进程部署要 Redis、Nginx 要特殊配置。有些场景其实**不需要这么重**——比如服务器单向推送通知、日志流、股票行情，客户端只需要"听"，不需要"说"。

这种"服务器单向推送"场景，有一个更轻量的方案：**SSE（Server-Sent Events）**。它基于 HTTP，不需要协议升级，天然支持断线重连，浏览器有原生 API，部署也比 WebSocket 简单。

这一章我们学 SSE 的原理、在 FastAPI 里用 \`StreamingResponse\` 实现、对比 SSE/WebSocket/轮询的选型，最后做一个"实时通知系统"——SSE 推通知 + WebSocket 聊天，把两种技术组合起来用。

## 二、SSE 原理：用 HTTP 流式推送

### 2.1 SSE 是什么

SSE（Server-Sent Events）是一种基于 HTTP 的**服务器单向推送**技术。服务器响应不一次性发完，而是"开着不关"，持续往响应流里写数据，客户端持续读取。

\`\`\`txt filename="SSE 的本质"
客户端发普通 HTTP 请求（GET）
  ↓
服务器响应头:
  Content-Type: text/event-stream
  Cache-Control: no-cache
  ↓
服务器不结束响应，持续往 body 写数据
  每条消息格式: data: xxx\\n\\n
  ↓
客户端持续收到数据，解析成事件
  ↓
服务器关闭响应或客户端断开，结束
\`\`\`

关键点：
- **响应头** \`Content-Type: text/event-stream\` 告诉浏览器"这是 SSE 流"。
- **消息格式** 固定：\`data: 内容\\n\\n\`（两个换行结尾）。
- **单向**：只能服务器→客户端，客户端要发消息得另外发 HTTP 请求。

### 2.2 SSE 消息格式

\`\`\`txt filename="SSE 消息格式"
data: 这是一条消息\\n\\n

data: 第二条消息\\n\\n

: 注释行（忽略）\\n

event: custom\\n
data: 自定义事件类型\\n\\n

id: 42\\n
data: 带ID的消息（断线重连用）\\n\\n

retry: 5000\\n
data: 告诉客户端重连间隔5秒\\n\\n
\`\`\`

- \`data:\` 是消息内容，必须以 \`\\n\\n\` 结尾（两条消息的分隔）。
- \`event:\` 自定义事件类型，前端可以按类型监听。
- \`id:\` 消息ID，断线重连时客户端会带 \`Last-Event-ID\` 头，服务器可据此续传。
- \`retry:\` 重连间隔（毫秒）。
- \`:\` 开头是注释，常用于心跳（防止连接超时）。

### 2.3 SSE vs WebSocket vs 轮询

| 维度 | 轮询（HTTP） | SSE | WebSocket |
|------|-------------|-----|-----------|
| 通信方向 | 单向（客户端问） | 单向（服务器推） | 双向 |
| 协议 | HTTP | HTTP | WebSocket（握手借 HTTP） |
| 连接 | 每次新建 | 长连接 | 长连接 |
| 服务器推送 | 不支持 | 支持 | 支持 |
| 客户端推送 | 支持 | 不支持（要另外 HTTP） | 支持 |
| 浏览器原生 API | fetch | EventSource | WebSocket |
| 断线重连 | 手动实现 | **浏览器自动** | 手动实现 |
| 穿透代理/防火墙 | 完美 | 完美（就是 HTTP） | 可能有问题 |
| 最大连接数 | 无限制 | HTTP/1.1 每域名 6 个 | 无限制 |
| 头开销 | 每次都带 | 握手带一次 | 握手带一次 |
| 实现复杂度 | 低 | **低** | 高 |

### 2.4 什么时候用 SSE

- ✅ 服务器单向推送：通知、公告、日志流、股票行情
- ✅ 不需要客户端频繁发消息（偶尔发可以用普通 HTTP）
- ✅ 需要断线自动重连（SSE 浏览器原生支持）
- ✅ 部署简单（就是 HTTP，Nginx 不用特殊配置）
- ❌ 需要双向高频通信（聊天、游戏、协作编辑）→ 用 WebSocket

## 三、FastAPI 用 StreamingResponse 实现 SSE

### 3.1 StreamingResponse 基础

FastAPI 的 \`StreamingResponse\` 可以返回一个生成器，逐块输出响应体，非常适合 SSE：

\`\`\`python filename="demo1: 最简 SSE"
# 从 fastapi 导入 FastAPI、StreamingResponse
# StreamingResponse 让响应体可以分块输出，适合流式推送
from fastapi import FastAPI, StreamingResponse
# 导入 asyncio 用于异步 sleep
import asyncio

# 创建应用
app = FastAPI()

# 定义 SSE 生成器函数
# 异步生成器：每次 yield 产出一条数据，客户端持续接收
async def event_generator():
    """生成 SSE 事件流"""
    # 无限循环，持续推送
    count = 0
    while True:
        # 等待 1 秒
        # asyncio.sleep 让出 CPU，不阻塞事件循环
        await asyncio.sleep(1)
        # 计数+1
        count += 1
        # 生成 SSE 格式消息
        # 注意: data: 后面要有空格，结尾要两个 \\n
        # 两个 \\n 是 SSE 消息的分隔符，浏览器据此判断一条消息结束
        yield f"data: 第 {count} 条消息\\n\\n"

# 注册路由
@app.get("/sse")
async def sse():
    # 返回 StreamingResponse
    # media_type 必须是 text/event-stream
    # 浏览器看到这个 Content-Type 会用 EventSource API 解析
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        # 设置响应头
        headers={
            "Cache-Control": "no-cache",          # 禁用缓存
            # 不缓存保证每次请求都新建流，不读旧数据
            "Connection": "keep-alive",            # 保持连接
            # 长连接，不主动关闭
            "X-Accel-Buffering": "no",             # Nginx 不缓冲
            # 关键：Nginx 默认会缓冲响应，加了这头才实时推送
        }
    )

# 测试: 浏览器打开 http://localhost:8000/sse
# 会看到每秒刷新一条消息
\`\`\`

### 3.2 前端 EventSource API

浏览器有原生 \`EventSource\` 对象接收 SSE：

\`\`\`html filename="demo2: EventSource 客户端"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>SSE 测试</title></head>
<body>
  <div id="log"></div>
  <script>
    // 创建 EventSource，连接 SSE 端点
    const source = new EventSource("http://localhost:8000/sse");

    // 默认消息监听（没有 event: 类型的消息走这里）
    source.onmessage = function(e) {
      // e.data 是消息内容
      appendLog("收到: " + e.data);
    };

    // 连接建立
    source.onopen = function() {
      appendLog("SSE 已连接");
    };

    // 错误处理（含断线重连）
    source.onerror = function(e) {
      appendLog("SSE 错误，浏览器将自动重连...");
      // 不需要手动重连，EventSource 会自动重连
      // readyState: 0=连接中, 1=已连接, 2=已关闭
      console.log("readyState:", source.readyState);
    };

    // 监听自定义事件
    source.addEventListener("custom", function(e) {
      appendLog("[custom] " + e.data);
    });

    function appendLog(text) {
      const div = document.createElement("div");
      div.textContent = text;
      document.getElementById("log").appendChild(div);
    }
  </script>
</body>
</html>
\`\`\`

> \`EventSource\` 自动重连是它最大的优点——断线后浏览器会自动重试，开发者不用写重连逻辑。

## 四、SSE 断线重连与消息续传

### 4.1 浏览器自动重连

当 SSE 连接断开，浏览器会自动重连，默认 3 秒后。服务器可以用 \`retry:\` 字段调整：

\`\`\`python filename="demo3: 调整重连间隔"
async def event_generator():
    # 第一条消息告诉客户端: 断线后 5 秒重连
    yield "retry: 5000\\n\\n"
    # 后续正常推送
    while True:
        await asyncio.sleep(1)
        yield f"data: {asyncio.get_event_loop().time()}\\n\\n"
\`\`\`

### 4.2 Last-Event-ID 续传

浏览器重连时会带上 \`Last-Event-ID\` 请求头，值是上次收到的最后一条消息的 \`id\`。服务器据此推送"漏掉"的消息：

\`\`\`python filename="demo4: 消息续传"
# 从 fastapi 导入 FastAPI、StreamingResponse、Request
from fastapi import FastAPI, StreamingResponse, Request
# 导入 asyncio
import asyncio

app = FastAPI()

# 模拟一个消息队列（真实场景用 Redis Stream/Kafka）
# 存所有已发送的消息，用于断线重连后补发
messages = []  # [(id, content), ...]
next_id = 0

async def event_generator(last_id: int):
    """从 last_id 之后开始推送"""
    global next_id
    # 先把历史消息补发
    # 遍历所有消息，只发 id 大于 last_id 的（即断线期间漏掉的）
    for msg_id, content in messages:
        if msg_id > last_id:
            yield f"id: {msg_id}\\ndata: {content}\\n\\n"
    # 然后持续推送新消息
    while True:
        await asyncio.sleep(2)
        # 生成新消息
        content = f"消息 #{next_id}"
        messages.append((next_id, content))
        # 带 id 推送
        # id: 字段让浏览器记录最后收到的消息 ID
        # 断线重连时浏览器自动带 Last-Event-ID 头
        yield f"id: {next_id}\\ndata: {content}\\n\\n"
        next_id += 1

@app.get("/sse")
async def sse(request: Request):
    # 从请求头取 Last-Event-ID
    # 浏览器重连时自动带这个头，值是上次收到的最后一条消息的 id
    last_id_header = request.headers.get("Last-Event-ID", "0")
    try:
        last_id = int(last_id_header)
    except ValueError:
        last_id = 0
    # 返回流
    # 生成器从 last_id 之后开始推送，保证不丢消息
    return StreamingResponse(
        event_generator(last_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )
\`\`\`

\`\`\`txt filename="续传流程"
客户端收到 id:5 的消息后断线
  ↓
3秒后浏览器自动重连，请求带 Last-Event-ID: 5
  ↓
服务器收到，从 id>5 开始推送
  ↓
id:6, id:7, ... 客户端不丢消息
\`\`\`

### 4.3 心跳保活

SSE 连接如果长时间没数据，可能被代理/防火墙关闭。要定期发注释行保活：

\`\`\`python filename="demo5: SSE 心跳"
# 从 fastapi 导入 FastAPI、StreamingResponse
from fastapi import FastAPI, StreamingResponse
# 导入 asyncio
import asyncio

app = FastAPI()

async def event_generator():
    # 计时器
    last_heartbeat = asyncio.get_event_loop().time()
    # 持续推送
    while True:
        # 模拟：有消息就发，没消息就发心跳
        # 这里简化，每 15 秒发一次心跳
        await asyncio.sleep(15)
        # 发心跳：注释行（:开头）
        # 浏览器会忽略，但能保持连接
        yield ": heartbeat\\n\\n"
        # 真实场景：检查是否有新消息
        # if has_new_message():
        #     yield f"data: {get_message()}\\n\\n"

@app.get("/sse")
async def sse():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )
\`\`\`

## 五、SSE 推送结构化数据

实际业务里要推 JSON，SSE 的 \`data:\` 可以放任意字符串：

\`\`\`python filename="demo6: SSE 推送 JSON"
# 从 fastapi 导入 FastAPI、StreamingResponse
from fastapi import FastAPI, StreamingResponse
# 导入 asyncio、json、datetime
import asyncio
import json
from datetime import datetime

app = FastAPI()

async def notification_generator():
    """模拟推送通知"""
    while True:
        await asyncio.sleep(3)
        # 构造通知对象
        notif = {
            "type": "notification",
            "title": "新消息",
            "content": f"您有 {int(asyncio.get_event_loop().time()) % 10} 条未读",
            "time": datetime.now().isoformat()
        }
        # 用 JSON 序列化后放进 data:
        # 注意: data: 后内容里不能有裸 \\n，要转义
        yield f"data: {json.dumps(notif, ensure_ascii=False)}\\n\\n"

@app.get("/sse/notifications")
async def sse_notifications():
    return StreamingResponse(
        notification_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )
\`\`\`

前端解析：

\`\`\`javascript filename="前端解析 JSON 通知"
const source = new EventSource("/sse/notifications");
source.onmessage = function(e) {
  // e.data 是 JSON 字符串
  const notif = JSON.parse(e.data);
  console.log(notif.title, notif.content);
  // 显示通知
  alert(notif.title + ": " + notif.content);
};
\`\`\`

## 六、轮询对比：为什么 SSE 更好

为了直观感受，我们写一个轮询接口对比：

\`\`\`python filename="demo7: 轮询 vs SSE 对比"
# 从 fastapi 导入 FastAPI、StreamingResponse
from fastapi import FastAPI, StreamingResponse
# 导入 asyncio
import asyncio

app = FastAPI()

# 模拟一个状态：什么时候有新消息
last_message_time = asyncio.get_event_loop().time()
new_message_ready = False

# 轮询接口：客户端每隔 1 秒来问一次
@app.get("/api/poll")
async def poll():
    global new_message_ready
    # 检查有没有新消息
    if new_message_ready:
        new_message_ready = False
        return {"has_message": True, "content": "新消息!"}
    else:
        return {"has_message": False}  # 99% 的请求都是这个

# SSE 接口：有消息才推，不浪费
async def sse_gen():
    global new_message_ready
    while True:
        await asyncio.sleep(1)
        if new_message_ready:
            new_message_ready = False
            yield "data: 新消息!\\n\\n"

@app.get("/sse")
async def sse():
    return StreamingResponse(sse_gen(), media_type="text/event-stream")

# 对比:
# 轮询: 客户端每秒1个请求, 100个客户端=100请求/秒, 99%是空的
# SSE: 100个客户端=100个长连接, 有消息才推数据, 几乎零浪费
\`\`\`

\`\`\`txt filename="资源消耗对比（100客户端，1秒延迟要求）"
轮询:
  请求量: 100 req/s（99 个空响应）
  服务器 CPU: 持续处理 100 个请求/秒
  带宽: 每个请求带完整头（~500字节），50KB/s 浪费
  实时性: 最坏 1 秒延迟

SSE:
  连接数: 100 个长连接
  服务器 CPU: 空闲（有消息才推）
  带宽: 仅消息本身（~50字节）
  实时性: 毫秒级

→ SSE 在"服务器推送"场景完胜轮询
\`\`\`

## 七、实战：实时通知系统（SSE + WebSocket）

把 SSE 和 WebSocket 组合起来：SSE 推系统通知（单向广播），WebSocket 做聊天（双向交互）。

### 7.1 后端

\`\`\`python filename="demo8: 实时通知系统后端"
# 导入 FastAPI、WebSocket、WebSocketDisconnect、StreamingResponse
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, StreamingResponse
# 导入 asyncio、json、datetime
import asyncio
import json
from datetime import datetime
# 从 typing 导入 List
from typing import List

# 创建应用
app = FastAPI(title="实时通知系统")

# 当前时间
def now():
    return datetime.now().strftime("%H:%M:%S")

# ========== SSE 部分：系统通知 ==========
# SSE 客户端队列列表
# 每个 SSE 客户端一个独立的 asyncio.Queue，实现"按需推送"
# 管理员调 /api/notify 时，往所有队列塞消息，各客户端自己取
sse_queues: List[asyncio.Queue] = []

# 通知生成器
async def notification_stream(queue: asyncio.Queue):
    """每个 SSE 客户端一个队列，从这里取消息推送"""
    # 先发个欢迎消息
    # 客户端连上立即收到，确认连接成功
    yield f"data: {json.dumps({'type':'welcome','time':now()}, ensure_ascii=False)}\\n\\n"
    # 持续从队列取消息
    while True:
        try:
            # 5 秒超时，超时就发心跳
            # wait_for 给 queue.get() 设超时，没有消息时定期发心跳保活
            msg = await asyncio.wait_for(queue.get(), timeout=15)
            yield f"data: {json.dumps(msg, ensure_ascii=False)}\\n\\n"
        except asyncio.TimeoutError:
            # 心跳
            # 15 秒没消息就发注释行，防止代理超时关闭连接
            yield ": heartbeat\\n\\n"

# SSE 端点
@app.get("/sse/notifications")
async def sse_notifications():
    # 为每个客户端创建独立队列
    # 队列是生产者-消费者模型：/api/notify 生产，这里消费
    queue = asyncio.Queue()
    sse_queues.append(queue)

    async def generator():
        try:
            async for chunk in notification_stream(queue):
                yield chunk
        finally:
            # 客户端断开，移除队列
            # finally 确保无论正常断开还是异常，都清理队列
            # 否则队列越积越多，内存泄漏
            if queue in sse_queues:
                sse_queues.remove(queue)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )

# 推送通知的 HTTP 接口（管理员调用）
@app.post("/api/notify")
async def notify(title: str, content: str):
    """推送系统通知给所有 SSE 客户端"""
    notif = {
        "type": "notification",
        "title": title,
        "content": content,
        "time": now()
    }
    # 往所有队列塞消息
    # 每个队列对应一个 SSE 客户端，put 后客户端的生成器就能 get 到
    for q in sse_queues:
        await q.put(notif)
    return {"pushed": len(sse_queues), "notif": notif}

# ========== WebSocket 部分：聊天 ==========
# 连接列表
chat_connections: List[WebSocket] = []

# 广播聊天消息
async def broadcast_chat(message: dict):
    # 遍历副本，避免遍历中被修改
    for ws in list(chat_connections):
        try:
            await ws.send_json(message)
        except Exception:
            # 发送失败说明连接已断，从列表移除
            if ws in chat_connections:
                chat_connections.remove(ws)

# WebSocket 端点
@app.websocket("/ws/chat/{user}")
async def chat(ws: WebSocket, user: str):
    await ws.accept()
    chat_connections.append(ws)
    # 广播加入
    await broadcast_chat({
        "type": "system",
        "content": f"{user} 加入了聊天",
        "time": now()
    })
    try:
        while True:
            data = await ws.receive_json()
            content = data.get("content", "")
            await broadcast_chat({
                "type": "message",
                "from": user,
                "content": content,
                "time": now()
            })
    except WebSocketDisconnect:
        # 客户端断开，清理并通知
        if ws in chat_connections:
            chat_connections.remove(ws)
        await broadcast_chat({
            "type": "system",
            "content": f"{user} 离开了",
            "time": now()
        })

# 启动: uvicorn main:app --reload
# 测试:
#   1. 浏览器打开前端页面，自动连 SSE + WebSocket
#   2. 用 curl 推送通知: curl -X POST "http://localhost:8000/api/notify?title=测试&content=hello"
#   3. 页面右上角弹通知（SSE），聊天框互相发消息（WebSocket）
\`\`\`

### 7.2 前端

\`\`\`html filename="demo9: 通知系统前端"
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>实时通知系统</title></head>
<body>
  <h3>SSE 通知区</h3>
  <div id="notifications" style="position:fixed;top:10px;right:10px;width:300px;"></div>

  <h3>WebSocket 聊天区</h3>
  <div>
    <input id="userInput" value="alice" />
    <button onclick="connectChat()">连接聊天</button>
  </div>
  <div id="messages" style="height:200px;overflow:auto;border:1px solid #ccc;"></div>
  <input id="msgInput" />
  <button onclick="sendChat()">发送</button>

  <script>
    // ===== SSE: 系统通知 =====
    const sse = new EventSource("/sse/notifications");
    sse.onmessage = function(e) {
      const data = JSON.parse(e.data);
      showNotification(data);
    };

    function showNotification(data) {
      const div = document.createElement("div");
      div.style.cssText = "background:#ffe;padding:8px;margin:4px;border:1px solid #ccc;";
      div.textContent = (data.title || "通知") + ": " + (data.content || "");
      const container = document.getElementById("notifications");
      container.appendChild(div);
      // 3秒后消失
      setTimeout(() => div.remove(), 3000);
    }

    // ===== WebSocket: 聊天 =====
    let ws = null;
    function connectChat() {
      const user = document.getElementById("userInput").value;
      ws = new WebSocket("ws://localhost:8000/ws/chat/" + user);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        appendMsg("[" + data.time + "] " + (data.type === "system" ? "[系统]" : data.from) + ": " + data.content);
      };
      ws.onclose = () => appendMsg("聊天已断开");
    }

    function sendChat() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ content: document.getElementById("msgInput").value }));
        document.getElementById("msgInput").value = "";
      }
    }

    function appendMsg(text) {
      const div = document.createElement("div");
      div.textContent = text;
      const box = document.getElementById("messages");
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }
  </script>
</body>
</html>
\`\`\`

### 7.3 为什么这样分工

- **通知用 SSE**：通知是服务器单向推送，客户端不需要回消息；SSE 自动重连，断网恢复通知自动续上；SSE 走 HTTP，部署简单。
- **聊天用 WebSocket**：聊天是双向高频通信，客户端要频繁发消息，WebSocket 的双向能力刚好匹配。
- **两者各司其职**，不强行用一种技术解决所有问题。这是**技术选型**的核心思想：用合适的工具做合适的事。

## 八、实时通信方案选型指南

### 8.1 决策流程

\`\`\`txt filename="选型决策树"
需求: 服务器需要主动推送吗?
├─ 否 → 用普通 HTTP（请求-响应）即可
└─ 是 → 客户端需要频繁发消息吗?
    ├─ 否（只听不说，或偶尔说）→ SSE
    │   ├─ 通知、公告、日志流、行情 → SSE
    │   └─ 偶尔发消息 → SSE 接收 + HTTP 发送
    └─ 是（双向高频）→ WebSocket
        ├─ 聊天、游戏、协作编辑 → WebSocket
        └─ 多进程部署 → WebSocket + Redis Pub/Sub
\`\`\`

### 8.2 详细对比

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 用户通知、公告 | SSE | 单向推送，自动重连，简单 |
| 实时聊天 | WebSocket | 双向高频 |
| 股票行情 | SSE | 服务器单向推送，量大 |
| 协作编辑 | WebSocket | 双向，低延迟 |
| 日志流 | SSE | 单向流，HTTP 友好 |
| 在线游戏 | WebSocket | 双向，低延迟 |
| 进度条/任务状态 | SSE | 单向，偶尔推 |
| 客服系统 | WebSocket | 双向 |
| 文件上传进度 | SSE 或轮询 | 单向，低频 |
| 直播弹幕 | WebSocket | 双向高频 |

### 8.3 生产环境注意事项

\`\`\`txt filename="生产部署要点"
SSE:
  - Nginx 加 proxy_buffering off（否则消息攒一批才发）
  - 设 X-Accel-Buffering: no 响应头
  - 心跳保活（15 秒一次注释行）
  - 注意 HTTP/1.1 每域名 6 连接限制（HTTP/2 无此限制）

WebSocket:
  - Nginx 加 Upgrade/Connection 头转发
  - 多 worker 用 Redis Pub/Sub
  - 心跳检测死连接
  - 连接数监控（每连接占内存）

通用:
  - 监控连接数，设上限（防止资源耗尽）
  - 鉴权：SSE 用 Cookie/查询参数，WebSocket 用查询参数
  - 限流：防止恶意客户端狂连
  - 日志：记录连接/断开/异常
\`\`\`

## 九、常见错误与避坑指南

1. **SSE 响应被 Nginx 缓冲**：消息攒一批才发，实时性没了。**加 \`X-Accel-Buffering: no\` 头或 Nginx 配 \`proxy_buffering off\`**。
2. **忘了 \`\\n\\n\` 结尾**：SSE 消息必须以两个换行结尾，否则浏览器不解析。**每条消息 \`data: xxx\\n\\n\`**。
3. **消息里有裸换行**：\`data: 第一行\\n第二行\\n\\n\` 会被当成两条消息。**多行内容用多个 \`data:\` 行**：
   \`\`\`
   data: 第一行
   data: 第二行
   \\n
   \`\`\`
4. **EventSource 不能自定义请求头**：\`EventSource\` 不支持设 \`Authorization\`。**用 Cookie 鉴权或查询参数传 token**。
5. **SSE 连接数限制**：HTTP/1.1 每域名最多 6 个 SSE 连接。**用 HTTP/2 或开多域名**。
6. **StreamingResponse 生成器没正确关闭**：客户端断开，生成器还在跑，资源泄漏。**用 try/finally 清理**。
7. **WebSocket 当 SSE 用**：只需要单向推送却上 WebSocket，过度设计。**单向推送用 SSE 更简单**。
8. **SSE 当 WebSocket 用**：需要双向却用 SSE，客户端发消息要另开 HTTP，麻烦。**双向用 WebSocket**。
9. **心跳间隔设太长**：代理 60 秒超时，你 90 秒才心跳，连接被关。**心跳 15-30 秒**。
10. **跨域没配**：SSE 跨域要 CORS，\`EventSource\` 不支持 credentials 时带 Cookie。**配 CORS 允许 credentials**。

## 十、本章小结

- SSE 是基于 HTTP 的**服务器单向推送**技术，用 \`text/event-stream\` 流式响应。
- 消息格式固定：\`data: 内容\\n\\n\`，支持 \`event/id/retry\` 字段。
- 浏览器原生 \`EventSource\` API，**自动断线重连**，重连带 \`Last-Event-ID\` 实现续传。
- FastAPI 用 \`StreamingResponse\` + 异步生成器实现 SSE，注意心跳保活和 Nginx 缓冲。
- **选型**：单向推送用 SSE，双向高频用 WebSocket，偶尔推送用轮询也可。
- 生产环境组合使用：SSE 做通知/行情，WebSocket 做聊天/协作，各司其职。
- 部署注意：SSE 关 Nginx 缓冲，WebSocket 配 Upgrade 头，多 worker 用 Redis。

至此，WebSocket 实时通信篇结束。你掌握了 WebSocket 协议、连接管理、广播、房间、私聊、SSE，以及如何选型。这些技术组合起来，足以应对绝大多数实时业务场景——聊天、通知、协作、行情、游戏，都能游刃有余。
`
  }
];
