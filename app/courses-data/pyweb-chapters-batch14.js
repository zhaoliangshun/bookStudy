// =============================================================
// Python Web 应用开发实战 - 第十四批章节(WebSocket 与实时,共 4 章)
// 章节 53-56:WebSocket 原理 / Flask-SocketIO 实现 / Django Channels / SSE 与实时通信选型
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十三章:WebSocket 原理
  // =============================================================
  {
    id: 'ws-principle',
    group: 'WebSocket 与实时',
    icon: '🔌',
    title: 'WebSocket 原理',
    content: `## 第五十三章　WebSocket 原理

### 53.1 为什么需要 WebSocket

传统 HTTP 是**请求-响应**模式:客户端发一个请求,服务器回一个响应,然后连接就结束。这种模式有个根本问题:**服务器没办法主动给客户端推消息**。

如果业务是"实时"的,你立刻就难受了:
- **聊天应用**:别人给你发消息,你不知道,只能每隔 2 秒问服务器"有新消息吗?";
- **实时通知**:管理员发个公告,所有人都得等下一次轮询才知道;
- **股票行情**:价格变动要延迟几秒;
- **协作编辑**:多人改同一份文档,冲突不断。

这种"客户端定时问"的方式叫**轮询(Polling)**,效率极低:大部分请求服务器都回答"没有新数据",白白浪费带宽和服务器资源。

> WebSocket 就是为解决"服务器主动推送"而生的。它建立一条**持久连接**,连接建立后服务器可以随时往客户端推数据,客户端也可以随时发数据给服务器,**双向、全双工**。

### 53.2 WebSocket 是什么

WebSocket 是 HTML5 引入的一种**全双工通信协议**,在一条 TCP 连接上同时双向传输数据:

- **全双工(Full-Duplex)**:服务器和客户端可以**同时**互相发数据,不用等对方;
- **持久连接**:连接建立后一直保持,直到任一方主动关闭;
- **轻量帧**:数据帧头部只有 2-14 字节,比 HTTP 头(几百字节到几 KB)小得多,适合频繁小消息;
- **基于 TCP**:可靠传输,数据不会丢。

### 53.3 WebSocket vs HTTP

| 对比点 | HTTP | WebSocket |
| --- | --- | --- |
| 通信方向 | 单向(客户端发起,服务器响应) | 双向(双方都能主动发) |
| 连接生命周期 | 短连接(请求完就断,Keep-ive 除外) | 持久连接 |
| 数据格式 | 文本为主,头部大 | 文本或二进制,头部小 |
| 服务器主动推送 | 不行 | 行 |
| 协议 | HTTP/1.1、HTTP/2、HTTP/3 | ws://、wss:// |
| 适合场景 | 普通请求-响应业务 | 聊天、通知、实时数据 |

### 53.4 握手过程(HTTP Upgrade)

WebSocket 连接的建立很有意思:**它先假装是 HTTP 请求**。客户端发一个带 Upgrade 头的 HTTP 请求,服务器同意后,这条连接就从 HTTP 升级成 WebSocket。

客户端握手请求(看起来像 HTTP):

\`\`\`http
# GET /chat HTTP/1.1
GET /chat HTTP/1.1
# 字段 Host，类型: example.com
Host: example.com
Upgrade: websocket        # 我要升级协议
# 字段 Connection，类型: Upgrade
Connection: Upgrade
# Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
# Sec-WebSocket-Version: 13
Sec-WebSocket-Version: 13
\`\`\`

服务器响应:

\`\`\`http
HTTP/1.1 101 Switching Protocols  # 101 表示同意升级
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

握手成功后,这条 TCP 连接就变成了 WebSocket 连接,双方可以随时互发数据帧,不再走 HTTP 格式。

> 这套设计很聪明:**复用了 HTTP 基础设施**。WebSocket 连接走的是 80/443 端口,能穿透大部分防火墙和代理(因为握手长得像普通 HTTP)。

### 53.5 ws 和 wss 协议

类比 http 和 https:

- \`ws://\` —— 明文 WebSocket,数据不加密;
- \`wss://\` —— WebSocket over TLS,数据加密,**生产环境必须用 wss**。

\`\`\`text
ws://localhost:8000/chat
wss://api.example.com/chat
\`\`\`

### 53.6 应用场景

| 场景 | 说明 |
| --- | --- |
| 即时聊天 | 微信、Slack、Discord,消息秒到 |
| 实时通知 | 站内消息、订单状态变化提醒 |
| 实时数据 | 股票行情、直播弹幕、监控大屏 |
| 协作编辑 | Google Docs 多人同改 |
| 多人游戏 | 玩家位置同步 |
| IoT | 设备状态上报、远程控制 |

### 53.7 浏览器 WebSocket API

浏览器原生支持 WebSocket,不用任何库。下面是一个最小的 JavaScript 客户端:

\`\`\`javascript
// 1. 创建 WebSocket 连接(注意协议是 ws 或 wss)
// 定义变量 ws
const ws = new WebSocket("ws://localhost:8000/chat");

// 2. 连接成功时触发
// ws.onopen = function () {
ws.onopen = function () {
// console.log("连接已建立");
  console.log("连接已建立");
// ws.send("你好服务器");  // 发送一条文本消息
  ws.send("你好服务器");  // 发送一条文本消息
// };
};

// 3. 收到服务器消息时触发
// ws.onmessage = function (event) {
ws.onmessage = function (event) {
// console.log("收到:", event.data);
  console.log("收到:", event.data);
// };
};

// 4. 连接关闭时触发
// ws.onclose = function () {
ws.onclose = function () {
// console.log("连接已关闭");
  console.log("连接已关闭");
// };
};

// 5. 出错时触发
// ws.onerror = function (error) {
ws.onerror = function (error) {
// console.log("出错了", error);
  console.log("出错了", error);
// };
};

// 主动发消息
// 定义函数 sendMsg
function sendMsg(text) {
// if (ws.readyState === WebSocket.OPEN) {
  if (ws.readyState === WebSocket.OPEN) {
// ws.send(text);
    ws.send(text);
// }
  }
// }
}
\`\`\`

> 注意:上面是 JavaScript 代码,不是 Python。客户端侧通常是浏览器跑 JS。后端用 Python,后面两章讲 Flask-SocketIO 和 Django Channels。

### 53.8 WebSocket 的局限

WebSocket 不是银弹,它也有麻烦:
- **连接管理复杂**:服务器要维护成千上万条长连接,需要专门架构;
- **断线重连要自己做**:网络抖动断线,WebSocket 不会自动重连;
- **没有原生订阅/房间概念**:广播给特定人群要自己实现;
- **没有 HTTP 缓存**:不像 GET 能被 CDN 缓存。

这些麻烦正是 **Socket.IO** 这种库存在的理由(下一章讲)。

### 53.9 一个概念澄清:WebSocket 不等于 Socket.IO

| 概念 | 关系 |
| --- | --- |
| WebSocket | W3C/IETF 标准,浏览器和服务器原生协议 |
| Socket.IO | 一个**库**(有 JS 端和 Python 端),基于 WebSocket,但加了重连、房间、降级、事件等特性 |

Socket.IO 的协议和原生 WebSocket **不兼容**:用 Socket.IO 的服务器,客户端必须也用 Socket.IO 的 JS 库,不能直接用 \`new WebSocket()\`。

### 53.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 用 HTTP 轮询做聊天 | 服务器被刷爆,体验差 | 用 WebSocket |
| 用 ws:// 上生产 | 数据被中间人窃听 | 用 wss:// |
| 以为 WebSocket 自动重连 | 断线后客户端就"卡死" | 自己实现重连或用 Socket.IO |
| 服务器不限制连接数 | 单机连接太多拖垮 | 用专门的 WS 服务器,做连接限流 |
| Socket.IO 服务端配原生 WebSocket 客户端 | 连不上 | 两端都用 Socket.IO |

> **本章小结**:WebSocket 是全双工持久连接,解决"服务器主动推送"问题。它先发 HTTP 握手升级,之后双向收发。生产用 wss,断线重连要么自己做要么用 Socket.IO。下一章讲 Flask 怎么用 Socket.IO 实现一个聊天室。`,
  },

  // =============================================================
  // 第五十四章:Flask-SocketIO 实现
  // =============================================================
  {
    id: 'ws-flask',
    group: 'WebSocket 与实时',
    icon: '🧪',
    title: 'Flask-SocketIO 实现',
    content: `## 第五十四章　Flask-SocketIO 实现

### 54.1 Flask-SocketIO 是什么

\`Flask-SocketIO\` 是 Flask 的 WebSocket 扩展,基于 **Socket.IO** 协议。它帮你把 WebSocket 难搞的部分都封装好了:

- **断线自动重连**:网络抖动断了,客户端自动重连;
- **降级**:浏览器不支持 WebSocket 时,自动降级到 HTTP 长轮询,兼容老浏览器;
- **房间(Room)**:把用户分组,群发给特定房间;
- **命名空间(Namespace)**:一个连接上多业务复用;
- **事件机制**:不只发字符串,发任意 JSON 对象,带事件名区分。

### 54.2 安装

\`\`\`bash
# 安装 Python 包: flask-socketio
pip install flask-socketio
\`\`\`

### 54.3 最小示例

\`\`\`python
# 从 flask 导入 Flask
from flask import Flask
# 从 flask_socketio 导入 SocketIO, emit
from flask_socketio import SocketIO, emit

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # 允许跨域

# 监听客户端连接事件
# 装饰器：socketio.on
@socketio.on("connect")
# 定义函数 on_connect，参数: 
def on_connect():
    # 调用 print()
    print("有客户端连上了")
    emit("server_msg", {"msg": "欢迎连接"})  # 给这个客户端发欢迎消息

# 监听客户端发来的 "chat" 事件
# 装饰器：socketio.on
@socketio.on("chat")
# 定义函数 on_chat，参数: data
def on_chat(data):
    # 调用 print()
    print("收到:", data)
    # broadcast=True 表示广播给所有连接的客户端
    # 调用 emit()
    emit("chat", data, broadcast=True)

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 注意:用 socketio.run 而不是 app.run
    # 调用 socketio.run()
    socketio.run(app, debug=True)
\`\`\`

> 注意最后一行:\`socketio.run(app)\` 而不是 \`app.run()\`。SocketIO 需要它自己的服务器循环。

### 54.4 核心事件:connect / disconnect / message

Flask-SocketIO 用装饰器 \`@socketio.on(事件名)\` 监听事件。三个内置事件:

\`\`\`python
# 装饰器：socketio.on
@socketio.on("connect")
# 定义函数 on_connect，参数: 
def on_connect():
    # 客户端连上时触发
    # 可以在这里做鉴权,返回 False 拒绝连接
    # 空操作占位
    pass

# 装饰器：socketio.on
@socketio.on("disconnect")
# 定义函数 on_disconnect，参数: 
def on_disconnect():
    # 客户端断开时触发
    # 调用 print()
    print("用户走了")

# 装饰器：socketio.on
@socketio.on("message")
# 定义函数 on_message，参数: data
def on_message(data):
    # 监听原生 message 事件
    # 调用 print()
    print("收到消息:", data)
\`\`\`

### 54.5 emit 发送消息

\`emit(事件名, 数据)\` 给客户端发消息。三个常用参数:

\`\`\`python
# 从 flask_socketio 导入 emit
from flask_socketio import emit

# 装饰器：socketio.on
@socketio.on("chat")
# 定义函数 on_chat，参数: data
def on_chat(data):
    # 1. 只回给发送者
    # 调用 emit()
    emit("server_reply", {"msg": "已收到"})

    # 2. 广播给所有人(broadcast=True)
    # 调用 emit()
    emit("broadcast", {"msg": data["msg"]}, broadcast=True)

    # 3. 只发给某个房间的人(room=房间名)
    # 调用 emit()
    emit("room_msg", {"msg": "房间消息"}, room="room_1")
\`\`\`

### 54.6 Room 房间

房间是 Socket.IO 把用户分组的机制。典型用法:进入聊天室 = join_room,群发 = emit(room=房间名)。

\`\`\`python
# 从 flask_socketio 导入 join_room, leave_room, emit
from flask_socketio import join_room, leave_room, emit

# 装饰器：socketio.on
@socketio.on("join")
# 定义函数 on_join，参数: data
def on_join(data):
    room = data["room"]         # 客户端告诉要进哪个房间
    join_room(room)             # 把当前用户加入房间
    emit("sys_msg", f"有人加入了 {room}", room=room)  # 给房间所有人通知

# 装饰器：socketio.on
@socketio.on("leave")
# 定义函数 on_leave，参数: data
def on_leave(data):
    # 定义变量 room，赋值为 data["room"]
    room = data["room"]
    # 调用 leave_room()
    leave_room(room)
    # 调用 emit()
    emit("sys_msg", f"有人离开了 {room}", room=room)
\`\`\`

> 实际项目里,房间常对应一个"群"或"会话":群 ID 当房间名,加入群 = join_room(群ID),群里发消息 = emit(room=群ID)。

### 54.7 broadcast 广播

\`broadcast=True\` 表示发给**所有**已连接的客户端,常用于"全站公告":

\`\`\`python
@socketio.route_global_announce  # 伪代码,演示用
# 定义函数 announce，参数: 
def announce():
    # 调用 emit()
    emit("announcement", {"text": "系统维护通知"}, broadcast=True)
\`\`\`

### 54.8 Namespace 命名空间

一个连接上跑多套业务,用命名空间隔离。比如聊天和实时通知分到两个 namespace:

\`\`\`python
# 装饰器：socketio.on
@socketio.on("connect", namespace="/chat")
# 定义函数 on_chat_connect，参数: 
def on_chat_connect():
    # 调用 emit()
    emit("msg", "聊天连接成功", namespace="/chat")

# 装饰器：socketio.on
@socketio.on("connect", namespace="/notify")
# 定义函数 on_notify_connect，参数: 
def on_notify_connect():
    # 调用 emit()
    emit("msg", "通知连接成功", namespace="/notify")

# 装饰器：socketio.on
@socketio.on("msg", namespace="/chat")
# 定义函数 on_chat_msg，参数: data
def on_chat_msg(data):
    # 调用 emit()
    emit("msg", data, namespace="/chat", broadcast=True)
\`\`\`

客户端连接时指定 namespace:\`io("/chat")\`、\`io("/notify")\`。

### 54.9 前端 socket.io.js

后端用 Flask-SocketIO,前端必须用对应版本的 \`socket.io.js\`(不能用原生 WebSocket):

\`\`\`html
# <!-- 引入 socket.io 客户端 -->
<!-- 引入 socket.io 客户端 -->
# <script src="https://cdn.socket.io/socket.io-4.7.2
<script src="https://cdn.socket.io/socket.io-4.7.2.min.js"></script>
# <script>
<script>
  # // 连接服务器
  // 连接服务器
  # const socket = io("http://localhost:5000");
  const socket = io("http://localhost:5000");

  # // 收到服务器的 server_msg 事件
  // 收到服务器的 server_msg 事件
  # 调用 socket.on()
  socket.on("server_msg", function (data) {
    # 调用 console.log()
    console.log("服务器说:", data.msg);
  # });
  });

  # // 发送 chat 事件
  // 发送 chat 事件
  # function sendChat(text) {
  function sendChat(text) {
    # 调用 socket.emit()
    socket.emit("chat", { msg: text });
  # }
  }

  # // 加入房间
  // 加入房间
  # function joinRoom(roomName) {
  function joinRoom(roomName) {
    # 调用 socket.emit()
    socket.emit("join", { room: roomName });
  # }
  }
# </script>
</script>
\`\`\`

### 54.10 完整示例:聊天室

下面是一个能跑的最小聊天室,服务器 + 前端:

**服务器 app.py**:

\`\`\`python
# 从 flask 导入 Flask, render_template
from flask import Flask, render_template
# 从 flask_socketio 导入 SocketIO, emit, join_room
from flask_socketio import SocketIO, emit, join_room

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.config["SECRET_KEY"] = "dev-secret"
app.config["SECRET_KEY"] = "dev-secret"
# 定义变量 socketio，赋值为 SocketIO(app, cors_allowed_origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回聊天页面
    # 返回 render_template("chat.html")
    return render_template("chat.html")

# 装饰器：socketio.on
@socketio.on("connect")
# 定义函数 on_connect，参数: 
def on_connect():
    # 调用 emit()
    emit("sys", "你已连接服务器")

# 装饰器：socketio.on
@socketio.on("join")
# 定义函数 on_join，参数: data
def on_join(data):
    # 定义变量 room，赋值为 data["room"]
    room = data["room"]
    # 定义变量 username，赋值为 data["username"]
    username = data["username"]
    # 调用 join_room()
    join_room(room)
    # 给房间其他人通知(自己不收)
    # 调用 emit()
    emit("sys", f"{username} 加入了房间", room=room, include_self=False)

# 装饰器：socketio.on
@socketio.on("msg")
# 定义函数 on_msg，参数: data
def on_msg(data):
    # 定义变量 room，赋值为 data["room"]
    room = data["room"]
    # 群发给房间所有人
    # 调用 emit()
    emit("msg", {"username": data["username"], "text": data["text"]}, room=room)

# 判断是否直接运行此脚本
if __name__ == "__main__":
    # 调用 socketio.run()
    socketio.run(app, debug=True)
\`\`\`

**模板 templates/chat.html**:

\`\`\`html
# <!DOCTYPE html>
<!DOCTYPE html>
# <html>
<html>
# <head><meta charset="utf-8"><title>聊天室</title></he
<head><meta charset="utf-8"><title>聊天室</title></head>
# <body>
<body>
  # <input id="room" placeholder="房间名" value="general"
  <input id="room" placeholder="房间名" value="general">
  # <input id="username" placeholder="昵称" value="匿名">
  <input id="username" placeholder="昵称" value="匿名">
  # <button onclick="doJoin()">加入</button>
  <button onclick="doJoin()">加入</button>
  # <div id="msgs"></div>
  <div id="msgs"></div>
  # <input id="text" placeholder="说点什么">
  <input id="text" placeholder="说点什么">
  # <button onclick="sendMsg()">发送</button>
  <button onclick="sendMsg()">发送</button>

  # <script src="https://cdn.socket.io/socket.io-4.7.2
  <script src="https://cdn.socket.io/socket.io-4.7.2.min.js"></script>
  # <script>
  <script>
    # const socket = io();
    const socket = io();

    # 调用 socket.on()
    socket.on("sys", function (msg) {
      # const div = document.getElementById("msgs");
      const div = document.getElementById("msgs");
      # div.innerHTML += "<p><i>" + msg + "</i></p>";
      div.innerHTML += "<p><i>" + msg + "</i></p>";
    # });
    });

    # 调用 socket.on()
    socket.on("msg", function (data) {
      # const div = document.getElementById("msgs");
      const div = document.getElementById("msgs");
      # div.innerHTML += "<p><b>" + data.username + ":</b>
      div.innerHTML += "<p><b>" + data.username + ":</b> " + data.text + "</p>";
    # });
    });

    # function doJoin() {
    function doJoin() {
      # const room = document.getElementById("room").value
      const room = document.getElementById("room").value;
      # const username = document.getElementById("username
      const username = document.getElementById("username").value;
      # 调用 socket.emit()
      socket.emit("join", { room: room, username: username });
    # }
    }

    # function sendMsg() {
    function sendMsg() {
      # const room = document.getElementById("room").value
      const room = document.getElementById("room").value;
      # const username = document.getElementById("username
      const username = document.getElementById("username").value;
      # const text = document.getElementById("text").value
      const text = document.getElementById("text").value;
      # 调用 socket.emit()
      socket.emit("msg", { room: room, username: username, text: text });
    # }
    }
  # </script>
  </script>
# </body>
</body>
# </html>
</html>
\`\`\`

启动后开两个浏览器标签,都能进同一个房间实时聊天。

### 54.11 为什么用 Socket.IO 而不是原生 WebSocket

| 原生 WebSocket | Socket.IO |
| --- | --- |
| 断线不重连 | 自动重连 |
| 没有房间概念 | 内置 room |
| 浏览器不支持就废 | 自动降级到轮询 |
| 只能发字符串/二进制 | 可发任意 JSON + 事件名 |
| 没有命名空间 | 有 namespace 隔离业务 |

代价:前后端必须都用 Socket.IO 库,且版本要对应。

### 54.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 用 \`app.run()\` 启动 | WebSocket 不工作 | 用 \`socketio.run(app)\` |
| 前端用原生 \`new WebSocket()\` | 连不上 | 用 socket.io.js 库 |
| emit 没指定 room 也没 broadcast=True | 只发回自己 | 要广播加 broadcast=True |
| 前后端 Socket.IO 版本不匹配 | 握手失败 | 版本号要对应(都用 4.x) |
| 没设 \`cors_allowed_origins\` | 跨域连接被拒 | 开发设 "*",生产设白名单 |
| 在多 worker 下用默认内存队列 | 消息丢失 | 配 Redis 消息队列(eventlet + Redis) |

> **本章小结**:Flask-SocketIO 把 WebSocket 难点封装好,装饰器 \`@socketio.on\` 监听事件,emit 发送,room 分组,broadcast 广播。一个聊天室几十行就能写完。下一章讲 Django 的实时方案 Django Channels。`,
  },

  // =============================================================
  // 第五十五章:Django Channels
  // =============================================================
  {
    id: 'ws-django',
    group: 'WebSocket 与实时',
    icon: '🎯',
    title: 'Django Channels',
    content: `## 第五十五章　Django Channels

### 55.1 Django Channels 是什么

Django 原生是基于 WSGI 的**同步**框架:一个请求占一个线程,视图函数跑完才返回。这种模型处理 WebSocket 很别扭——WebSocket 是长连接,要持续收发,一个连接占一个线程,几千连接服务器就扛不住。

**Django Channels** 是 Django 官方的异步扩展,让 Django 能处理 WebSocket、后台任务这类长连接、异步场景。它把 Django 从 WSGI 升级到 **ASGI**(异步服务器网关接口)。

| 对比 | 传统 Django | Django Channels |
| --- | --- | --- |
| 网关 | WSGI(同步) | ASGI(异步) |
| 服务器 | Gunicorn/uWSGI | Daphne/Uvicorn |
| 处理 HTTP | 同步视图 | 异步视图 |
| 处理 WebSocket | 不支持 | 支持 |

### 55.2 ASGI 应用

ASGI 是 WSGI 的异步版本,既能处理 HTTP 也能处理 WebSocket。Channels 把 Django 应用包成一个 ASGI 应用,\`asgi.py\` 是入口:

\`\`\`python
# myproject/asgi.py
# 导入 os 模块
import os
# 从 django.core.asgi 导入 get_asgi_application
from django.core.asgi import get_asgi_application
# 从 channels.routing 导入 ProtocolTypeRouter, URLRouter
from channels.routing import ProtocolTypeRouter, URLRouter
# 从 channels.auth 导入 AuthMiddlewareStack
from channels.auth import AuthMiddlewareStack
# 导入 myapp.routing 模块
import myapp.routing

# 调用 os.environ.setdefault()
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

# 定义变量 application，赋值为 ProtocolTypeRouter({
application = ProtocolTypeRouter({
    # 普通 HTTP 请求走 Django
    # "http": get_asgi_application(),
    "http": get_asgi_application(),
    # WebSocket 请求走 Channels 的路由
    # "websocket": AuthMiddlewareStack(
    "websocket": AuthMiddlewareStack(
        # 调用 URLRouter()
        URLRouter(myapp.routing.websocket_urlpatterns)
    # ),
    ),
# })
})
\`\`\`

### 55.3 安装和配置

\`\`\`bash
# 安装 Python 包: channels daphne channels_redis
pip install channels daphne channels_redis
\`\`\`

\`settings.py\`:

\`\`\`python
# 定义列表 INSTALLED_APPS
INSTALLED_APPS = [
    "daphne",       # 放在最前面,用 Daphne 替代默认的 runserver
    # "channels",
    "channels",
    # "channels_redis",
    "channels_redis",
    # ...其他 app
# ]
]

# 定义变量 ASGI_APPLICATION，赋值为 "myproject.asgi.application"
ASGI_APPLICATION = "myproject.asgi.application"

# Channel layer 后端,用 Redis 做跨进程消息分发
# 定义字典 CHANNEL_LAYERS
CHANNEL_LAYERS = {
    # "default": {
    "default": {
        # "BACKEND": "channels_redis.core.RedisChannelLayer"
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        # "CONFIG": {"hosts": [("127.0.0.1", 6379)]},
        "CONFIG": {"hosts": [("127.0.0.1", 6379)]},
    # },
    },
# }
}
\`\`\`

> 开发服务器用 \`python manage.py runserver\` 现在会自动用 Daphne 启动(因为 daphne 在 INSTALLED_APPS 前面),支持 WebSocket。

### 55.4 Consumer(消费者)

Channels 里的"视图"叫 **Consumer**,处理 WebSocket 连接。类比 Django 视图:HTTP 视图处理一次请求,Consumer 处理一条长连接的多次事件。

\`\`\`python
# myapp/consumers.py
# 导入 json 模块
import json
# 从 channels.generic.websocket 导入 WebsocketConsumer, AsyncWebsocketConsumer
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
# 从 asgiref.sync 导入 async_to_sync
from asgiref.sync import async_to_sync

# 定义类 ChatConsumer，继承 WebsocketConsumer
class ChatConsumer(WebsocketConsumer):
    # """同步 Consumer:简单直观,适合入门"""
    """同步 Consumer:简单直观,适合入门"""

    # 定义函数 connect，参数: self
    def connect(self):
        # 客户端连上时触发
        # self.room_name = self.scope["url_route"]["kwargs"]
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        # self.room_group_name = f"chat_{self.room_name}"
        self.room_group_name = f"chat_{self.room_name}"

        # 加入房间组(channel layer 的 group)
        # 调用 async_to_sync()
        async_to_sync(self.channel_layer.group_add)(
            # self.room_group_name, self.channel_name
            self.room_group_name, self.channel_name
        # )
        )
        self.accept()  # 接受连接

    # 定义函数 disconnect，参数: self, close_code
    def disconnect(self, close_code):
        # 离开房间组
        # 调用 async_to_sync()
        async_to_sync(self.channel_layer.group_discard)(
            # self.room_group_name, self.channel_name
            self.room_group_name, self.channel_name
        # )
        )

    # 定义函数 receive，参数: self, text_data
    def receive(self, text_data):
        # 收到客户端消息
        # 定义变量 data，赋值为 json.loads(text_data)
        data = json.loads(text_data)
        # 定义变量 message，赋值为 data["message"]
        message = data["message"]
        # 群发给房间所有人(通过 group_send)
        # 调用 async_to_sync()
        async_to_sync(self.channel_layer.group_send)(
            # self.room_group_name,
            self.room_group_name,
            # {"type": "chat_message", "message": message},
            {"type": "chat_message", "message": message},
        # )
        )

    # 自定义 handler:接收上面 group_send 的 type
    # 定义函数 chat_message，参数: self, event
    def chat_message(self, event):
        # 定义变量 message，赋值为 event["message"]
        message = event["message"]
        # 调用 self.send()
        self.send(text_data=json.dumps({"message": message}))


# 定义类 AsyncChatConsumer，继承 AsyncWebsocketConsumer
class AsyncChatConsumer(AsyncWebsocketConsumer):
    # """异步 Consumer:性能更好,正式项目推荐"""
    """异步 Consumer:性能更好,正式项目推荐"""

    # 定义异步函数 connect，参数: self
    async def connect(self):
        # self.room_name = self.scope["url_route"]["kwargs"]
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        # self.room_group_name = f"chat_{self.room_name}"
        self.room_group_name = f"chat_{self.room_name}"
        # await self.channel_layer.group_add(self.room_group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        # await self.accept()
        await self.accept()

    # 定义异步函数 disconnect，参数: self, close_code
    async def disconnect(self, close_code):
        # await self.channel_layer.group_discard(self.room_g
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # 定义异步函数 receive，参数: self, text_data
    async def receive(self, text_data):
        # 定义变量 data，赋值为 json.loads(text_data)
        data = json.loads(text_data)
        # 定义变量 message，赋值为 data["message"]
        message = data["message"]
        # await self.channel_layer.group_send(
        await self.channel_layer.group_send(
            # self.room_group_name,
            self.room_group_name,
            {"type": "chat.message", "message": message},  # type 用点号会被转成下划线方法名
        # )
        )

    # 定义异步函数 chat_message，参数: self, event
    async def chat_message(self, event):
        # await self.send(text_data=json.dumps({"message": e
        await self.send(text_data=json.dumps({"message": event["message"]}))
\`\`\`

> 注意上面的 \`f"chat_{self.room_name}"\` 是 Python f-string,**没有 \`$\`**,不会和 JS 模板字符串冲突。Python 里 f-string 永远是 \`{var}\` 这种形式。

### 55.5 路由(routing.py)

像 Django 的 urls.py,但针对 WebSocket:

\`\`\`python
# myapp/routing.py
# 从 django.urls 导入 re_path
from django.urls import re_path
# 从 . 导入 consumers
from . import consumers

# 定义列表 websocket_urlpatterns
websocket_urlpatterns = [
    # ws://host/ws/chat/room_name/
    # 调用 re_path()
    re_path(r"ws/chat/(?P<room_name>\\w+)/$", consumers.ChatConsumer.as_asgi()),
# ]
]
\`\`\`

> 注意 \`\\w+\` 这里要写两个反斜杠:在 JS 模板字符串里反斜杠是转义符,写 \`\\w\` 文件里实际是 \`\\w\`,转成 Python 正则就是 \`\\w+\`,正确匹配单词字符。

### 55.6 group_send 群发

单台服务器一个 Consumer 实例只能管自己那条连接,要"群发给房间里所有人"(可能散落在多台服务器上),必须用 **channel layer + group**:

- **channel layer**:跨进程/跨服务器的消息通道,后端是 Redis;
- **group**:用户分组,加进 group 的所有 channel 都能收到群发消息。

\`\`\`python
# 群发消息给房间所有人
# await self.channel_layer.group_send(
await self.channel_layer.group_send(
    "chat_general",                              # group 名
    {"type": "chat.message", "message": "你好"},  # type 决定调哪个 handler
# )
)
\`\`\`

\`type\` 字段是约定:Channels 拿到这条消息,会在 Consumer 上找 \`chat_message\` 方法(把点号转下划线)调用,把消息分发到每个连接。

### 55.7 和 Django 视图的区别

| 对比 | Django 视图 | Channels Consumer |
| --- | --- | --- |
| 触发 | 一次 HTTP 请求 | 一条 WebSocket 连接 |
| 处理 | 同步,处理完返回 | 异步,持续收发 |
| 生命周期 | 短(毫秒级) | 长(分钟到小时) |
| 数据格式 | request/response | event 驱动 |
| 跨实例通信 | 不需要 | 用 channel layer |

### 55.8 完整示例:Django 聊天室

把上面拼起来,一个能跑的 Django 聊天室:

\`\`\`python
# consumers.py(见 55.4 的 ChatConsumer)
# routing.py(见 55.5)
# asgi.py(见 55.2)
# settings.py(见 55.3)
\`\`\`

前端页面 \`chat.html\`:

\`\`\`html
# <input id="msg"><button onclick="send()">发</button
<input id="msg"><button onclick="send()">发</button>
# <div id="box"></div>
<div id="box"></div>
# <script>
<script>
  # const room = "general";
  const room = "general";
  # // 注意协议是 ws,路径要和 routing.py 对应
  // 注意协议是 ws,路径要和 routing.py 对应
  # const socket = new WebSocket(
  const socket = new WebSocket(
    # "ws://" + window.location.host + "/ws/chat/" + roo
    "ws://" + window.location.host + "/ws/chat/" + room + "/"
  # );
  );

  # socket.onmessage = function (e) {
  socket.onmessage = function (e) {
    # const data = JSON.parse(e.data);
    const data = JSON.parse(e.data);
    # 调用 document.getElementById()
    document.getElementById("box").innerHTML += "<p>" + data.message + "</p>";
  # };
  };

  # function send() {
  function send() {
    # const text = document.getElementById("msg").value;
    const text = document.getElementById("msg").value;
    # 调用 socket.send()
    socket.send(JSON.stringify({ message: text }));
  # }
  }
# </script>
</script>
\`\`\`

> Channels 这里前端可以用原生 \`new WebSocket()\`,因为它走的是标准 WebSocket 协议(不像 Flask-SocketIO 强制 socket.io.js)。要启动:\`python manage.py runserver\`(底层是 Daphne),并先跑一个 Redis。

### 55.9 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 用 \`python manage.py runserver\` 但没装 daphne | WebSocket 404 | INSTALLED_APPS 第一个加 daphne |
| 没配 channel layer | 多 worker 下群发失效 | 配 channels_redis |
| 用同步 Consumer 忘了 \`async_to_sync\` | 报错 | 用 AsyncConsumer 更省心 |
| \`type\` 字段用了点号 \`chat.message\` | 找不到 handler | 写成下划线方法名 \`chat_message\` |
| 没装 Redis 就启动 | channel layer 连接失败 | 先启 Redis |
| 在 Consumer 里同步查数据库阻塞 | 阻塞整个事件循环 | 用 \`database_sync_to_async\` 包装 |

> **本章小结**:Django Channels 把 Django 升级到 ASGI,Consumer 处理 WebSocket 长连接,channel layer + group 实现跨服务器群发。前端可用原生 WebSocket。生产用 Daphne/Uvicorn + Redis。下一章讲 SSE,以及实时通信怎么选型。`,
  },

  // =============================================================
  // 第五十六章:SSE 与实时通信选型
  // =============================================================
  {
    id: 'realtime-sse',
    group: 'WebSocket 与实时',
    icon: '📡',
    title: 'SSE 与实时通信选型',
    content: `## 第五十六章　SSE 与实时通信选型

### 56.1 不止 WebSocket 一种方案

WebSocket 全双工很强大,但不是所有"实时"场景都需要双向。很多时候,服务器只需要**单向推**给客户端(通知、行情、日志流),这时 WebSocket 有点重——能不能复用 HTTP 来做?

可以,这就是 **SSE(Server-Sent Events)** 和**长轮询**。

### 56.2 SSE 是什么

SSE(Server-Sent Events)是 HTML5 标准,基于 HTTP 的**单向推送**:服务器在一条 HTTP 长连接上,持续给客户端发数据,客户端只能听不能说话。

工作机制:
1. 客户端用 \`EventSource\` 发一个普通 HTTP 请求;
2. 服务器不关闭响应,持续往响应流写数据(每条以 \`data: ...\` 格式);
3. 客户端的 \`onmessage\` 不断被触发。

\`\`\`text
# SSE 响应的内容格式
Content-Type: text/event-stream

data: 第一条消息

data: 第二条消息

event: update
data: {"price": 100}
\`\`\`

### 56.3 SSE vs WebSocket

| 对比点 | SSE | WebSocket |
| --- | --- | --- |
| 通信方向 | 单向(服务器→客户端) | 双向 |
| 协议 | HTTP | 独立协议(ws/wss) |
| 端口 | 80/443 | 80/443 |
| 自动重连 | 浏览器内置 | 要自己实现 |
| 浏览器支持 | 现代浏览器原生支持 | 原生支持 |
| 跨域 | HTTP CORS 机制 | 自己处理 |
| 代理穿透 | 好(就是 HTTP) | 一般 |
| 最大连接数 | 浏览器对同源限制 6 条 | 无此限制 |
| 适合场景 | 通知、行情、日志 | 聊天、协作 |

> 经验:**只要单向推送,优先用 SSE**。它更简单:就是 HTTP,自带重连,服务器不用维护连接状态机。

### 56.4 SSE 浏览器 API

浏览器用 \`EventSource\` 接收:

\`\`\`javascript
// 连接 SSE 端点
// 定义变量 source
const source = new EventSource("/stream/logs");

// 收到默认事件
// source.onmessage = function (event) {
source.onmessage = function (event) {
// console.log("收到:", event.data);
  console.log("收到:", event.data);
// };
};

// 收到自定义事件
// source.addEventListener("update", function (event)
source.addEventListener("update", function (event) {
// console.log("更新:", event.data);
  console.log("更新:", event.data);
// });
});

// source.onerror = function () {
source.onerror = function () {
// console.log("出错了,浏览器会自动重连");
  console.log("出错了,浏览器会自动重连");
// };
};
\`\`\`

### 56.5 SSE 在 Flask 里实现

Flask 用生成器函数 + \`Response\` 流式响应实现 SSE:

\`\`\`python
# 从 flask 导入 Flask, Response, render_template
from flask import Flask, Response, render_template
# 导入 time 模块
import time

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 定义 GET 路由：访问 /stream/logs 时触发
@app.get("/stream/logs")
# 定义函数 stream_logs，参数: 
def stream_logs():
    # """SSE 端点:持续推送日志"""
    """SSE 端点:持续推送日志"""
    # 定义函数 generate，参数: 
    def generate():
        # 生成器:每秒 yield 一条消息
        # 定义变量 i，赋值为 0
        i = 0
        # 当 True 为真时循环
        while True:
            # i += 1
            i += 1
            # SSE 格式:data: 内容\\n\\n(两个换行结尾)
            # 生成值: f"data: 日志第 {i} 条\\n\\n"
            yield f"data: 日志第 {i} 条\\n\\n"
            # 调用 time.sleep()
            time.sleep(1)

    # 关键:mimetype 是 text/event-stream
    # 返回 Response(generate(), mimetype="text/event-stream")
    return Response(generate(), mimetype="text/event-stream")

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 index，参数: 
def index():
    # 返回 render_template("logs.html")
    return render_template("logs.html")
\`\`\`

> 注意 \`f"data: 日志第 {i} 条\\n\\n"\` 里花括号前没有 \`$\`,不会和 JS 模板字符串冲突。\\n 是换行,在模板字符串里写 \`\\n\` 实际就是一个换行字符。

### 56.6 SSE 在 Django 里实现

Django 用 \`StreamingHttpResponse\`:

\`\`\`python
# 从 django.http 导入 StreamingHttpResponse
from django.http import StreamingHttpResponse
# 导入 time 模块
import time

# 定义函数 stream_logs，参数: request
def stream_logs(request):
    # 定义函数 event_stream，参数: 
    def event_stream():
        # 定义变量 i，赋值为 0
        i = 0
        # 当 True 为真时循环
        while True:
            # i += 1
            i += 1
            # 生成值: f"data: 日志第 {i} 条\\n\\n"
            yield f"data: 日志第 {i} 条\\n\\n"
            # 调用 time.sleep()
            time.sleep(1)
    # 定义变量 response，赋值为 StreamingHttpResponse(event_stream(), content...
    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"  # SSE 别被缓存
    # 返回 response
    return response
\`\`\`

### 56.7 长轮询(Long Polling)

兼容性最好、最老土的方案:客户端发请求,服务器**没有新数据就挂着不返回**,有数据或超时才返回;客户端收到响应立刻再发一个请求。

\`\`\`python
# Flask 长轮询
# 导入 time 模块
import time
# 从 flask 导入 Flask, jsonify
from flask import Flask, jsonify

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# 定义列表 notifications
notifications = []

# 定义 GET 路由：访问 /poll 时触发
@app.get("/poll")
# 定义函数 long_poll，参数: 
def long_poll():
    # """客户端发请求,服务器最多挂 30 秒等新数据"""
    """客户端发请求,服务器最多挂 30 秒等新数据"""
    # 定义变量 deadline，赋值为 time.time() + 30
    deadline = time.time() + 30
    # 当 time.time() < deadline 为真时循环
    while time.time() < deadline:
        if notifications:               # 有新数据
            # 返回 jsonify(notifications.pop(0))
            return jsonify(notifications.pop(0))
        time.sleep(0.5)                  # 没有就等一会再查
    return jsonify(None), 204            # 30 秒超时,客户端再发一次
\`\`\`

优点:浏览器支持最广(就是普通 HTTP),能穿透几乎所有代理。缺点:每次都要重新建立 HTTP 连接,效率低,延迟比 SSE 大。

### 56.8 Server-Push 技术对比

| 方案 | 方向 | 协议 | 自动重连 | 复杂度 | 适合场景 |
| --- | --- | --- | --- | --- | --- |
| WebSocket | 双向 | ws/wss | 否 | 中高 | 聊天、协作、游戏 |
| SSE | 单向 | HTTP | 是 | 低 | 通知、行情、日志 |
| 长轮询 | 单向 | HTTP | 否 | 低 | 兼容性要求极高的老系统 |
| 短轮询 | 客户端拉 | HTTP | 否 | 极低 | 偶尔查一下状态 |
| Comet | 单向 | HTTP | 否 | 中 | 已被 SSE/WebSocket 取代 |

### 56.9 选型决策

不同业务该用哪个?用一个决策树:

| 场景 | 推荐方案 | 理由 |
| --- | --- | --- |
| 即时聊天 | WebSocket | 客户端也要发消息 |
| 站内通知 | SSE | 服务器单向推,简单 |
| 股票行情/币价 | SSE | 单向推,频率高,SSE 轻量 |
| 实时日志流 | SSE | 单向推,就是 HTTP 好部署 |
| 多人协作编辑 | WebSocket | 双向同步光标/内容 |
| 多人游戏 | WebSocket | 双向低延迟 |
| 老系统兼容老浏览器 | 长轮询 | SSE/WS 不支持时降级 |
| 偶尔查状态(订单状态) | 短轮询 | 不值得为低频上 WS |

> 心法:**先看方向**。客户端只要"听",用 SSE;要"说",用 WebSocket;都不行就轮询。

### 56.10 完整示例:SSE 推送日志

下面是一个 Flask + SSE 实时日志推送的完整例子:

\`\`\`python
# 从 flask 导入 Flask, Response, render_template
from flask import Flask, Response, render_template
# 导入 time, 模块
import time, random

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 定义 GET 路由：访问 / 时触发
@app.get("/")
# 定义函数 index，参数: 
def index():
    # 返回 render_template("logs.html")
    return render_template("logs.html")

# 定义 GET 路由：访问 /stream/logs 时触发
@app.get("/stream/logs")
# 定义函数 stream_logs，参数: 
def stream_logs():
    # 定义函数 generate，参数: 
    def generate():
        # 模拟持续产生日志
        # 定义列表 levels
        levels = ["INFO", "WARN", "ERROR"]
        # 定义变量 i，赋值为 0
        i = 0
        # 当 True 为真时循环
        while True:
            # i += 1
            i += 1
            # 定义变量 level，赋值为 random.choice(levels)
            level = random.choice(levels)
            # 定义变量 msg，赋值为 f"[{level}] 系统运行中,处理了 {i} 个任务"
            msg = f"[{level}] 系统运行中,处理了 {i} 个任务"
            # SSE 格式:event 行(可选) + data 行 + 空行
            # 生成值: f"event: log\\ndata: {msg}\\n\\n"
            yield f"event: log\\ndata: {msg}\\n\\n"
            # 调用 time.sleep()
            time.sleep(1)
    # 返回 Response(generate(), mimetype="text/event-stream")
    return Response(generate(), mimetype="text/event-stream")
\`\`\`

前端 \`templates/logs.html\`:

\`\`\`html
# <h2>实时日志</h2>
<h2>实时日志</h2>
# <pre id="box" style="height:300px;overflow:auto;ba
<pre id="box" style="height:300px;overflow:auto;background:#eee"></pre>
# <script>
<script>
  # const source = new EventSource("/stream/logs");
  const source = new EventSource("/stream/logs");
  # // 监听 event=log 的消息
  // 监听 event=log 的消息
  # 调用 source.addEventListener()
  source.addEventListener("log", function (e) {
    # const box = document.getElementById("box");
    const box = document.getElementById("box");
    # box.textContent += e.data + "\\n";
    box.textContent += e.data + "\\n";
    # box.scrollTop = box.scrollHeight;  // 自动滚到底
    box.scrollTop = box.scrollHeight;  // 自动滚到底
  # });
  });
  # source.onerror = function () {
  source.onerror = function () {
    # // 浏览器会自动重连,这里只记日志
    // 浏览器会自动重连,这里只记日志
    # 调用 console.log()
    console.log("断开了,自动重连中");
  # };
  };
# </script>
</script>
\`\`\`

启动后浏览器打开,日志每秒滚动出现,断网自动重连,完全不用前端写重连逻辑。

### 56.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 单向推送也用 WebSocket | 杀鸡用牛刀,重连要自己写 | 用 SSE |
| SSE 响应没设 \`text/event-stream\` | 浏览器不当 SSE 处理 | mimetype 一定要对 |
| SSE 消息结尾只有一个 \`\\n\` | 浏览器不识别消息边界 | 每条消息后跟两个 \`\\n\\n\` |
| SSE 在 Nginx 后面被缓冲 | 日志不实时显示 | Nginx 加 \`proxy_buffering off\` |
| 聊天用 SSE | 客户端没法发消息 | 聊天必须用 WebSocket |
| 长轮询没设超时 | 请求挂死占连接 | 设 30 秒超时 |

> **本章小结**:实时通信选型记住三句话——**客户端只要听用 SSE(自动重连,就是 HTTP);要双向用 WebSocket;老系统兜底用长轮询**。WebSocket 与实时这一批到此结束,下一批进入测试与调试。`,
  },
];
