// =============================================================
// Python 实战项目教程 - 第 4 批章节(实时与高并发)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyproject-websocket-arch",
    icon: "📡",
    title: "WebSocket 聊天室:协议与架构",
    group: "实时与高并发",
    content: `
# WebSocket 聊天室:协议与架构

## 本章概览

本章带你深入理解 WebSocket 协议的本质,掌握 Python 生态中 WebSocket 开发的核心技能。
我们将从协议原理出发,对比主流实时通信方案,最终搭建出聊天室的核心架构。

学习目标:
- 理解 WebSocket 握手与帧结构
- 对比 HTTP 轮询、SSE、WebSocket 三种方案
- 掌握 FastAPI WebSocket 基础用法
- 设计可扩展的聊天室架构

---

## 一、WebSocket 协议详解

### 1.1 从 HTTP 到 WebSocket

传统 HTTP 是「请求-响应」模型:客户端发请求,服务器返响应,连接即关闭。
这种模式对聊天室、实时通知、协作编辑等场景极不友好。

HTTP 轮询的无奈:
- 短轮询:客户端每隔 N 秒发一次请求,大部分请求都是"无新消息"
- 长轮询:服务器 hold 住请求直到有消息才返回,但仍需反复建立连接

WebSocket(RFC 6455)解决了一个核心问题:**服务器能主动推送消息**。

### 1.2 握手过程

WebSocket 连接始于一次 HTTP 升级请求:

\`\`\`text
客户端 → 服务器(HTTP 请求)
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket                 # 请求升级协议
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==   # 客户端随机生成的 key
Sec-WebSocket-Version: 13          # 协议版本

服务器 → 客户端(HTTP 101 响应)
HTTP/1.1 101 Switching Protocols   # 101 表示协议切换
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=  # 服务器返回的确认值
\`\`\`

服务器把客户端的 Key 拼上固定字符串后做 SHA-1 + Base64,返回 Accept。
这是为了让客户端验证服务器"真的支持 WebSocket",避免被普通 HTTP 服务器误导。

### 1.3 帧结构

握手成功后,双方用 WebSocket 帧通信。帧结构关键字段:

| 字段 | 说明 |
| --- | --- |
| FIN | 1 位,是否为消息最后一帧 |
| opcode | 4 位,帧类型(0x1 文本,0x2 二进制,0x8 关闭,0x9 ping,0xA pong) |
| mask | 1 位,客户端→服务端必须掩码,服务端→客户端不掩码 |
| payload length | 7/16/64 位,负载数据长度 |

重要概念:
- 一条消息可拆成多个帧(分片),FIN=1 表示最后一片
- ping/pong 帧用于心跳检测,维持连接
- 文本帧默认按 UTF-8 编码

### 1.4 全双工通信

WebSocket 建立后,客户端和服务器共享一条"双向通道":
- 服务器可随时推送消息(无需客户端先请求)
- 客户端可随时发消息(无需重新建立连接)
- 直到任一方主动关闭,连接一直保持

这正是实时应用的关键:消息延迟从"秒级轮询"降到"毫秒级推送"。

---

## 二、实时通信方案对比

### 2.1 WebSocket vs HTTP 轮询 vs SSE

| 方案 | 方向 | 连接 | 适用场景 | 缺点 |
| --- | --- | --- | --- | --- |
| HTTP 短轮询 | 单向(客户端拉) | 每次新建 | 兼容性最好、低频数据 | 浪费请求、延迟高 |
| HTTP 长轮询 | 单向(客户端拉) | hold 住 | 中等实时性需求 | 服务器资源占用大 |
| SSE | 服务器→客户端 | 长连接 | 通知推送、股票行情 | 不支持客户端→服务器推送 |
| WebSocket | 全双工 | 长连接 | 聊天、协作、游戏 | 实现略复杂、需心跳维护 |

### 2.2 选型建议

- 只需要服务器推送(如新闻、股价):用 SSE,简单且自动重连
- 需要双向实时(如聊天室):用 WebSocket
- 低频更新、对兼容性要求高:HTTP 轮询也够用

聊天室场景天然需要双向:用户发消息 + 接收他人消息,所以本章选 WebSocket。

---

## 三、Python WebSocket 库对比

| 库 | 异步 | 集成度 | 适合场景 |
| --- | --- | --- | --- |
| websockets | 原生 asyncio | 纯协议层 | 自定义服务、底层控制 |
| aiohttp | asyncio | 自带 HTTP+WS | 全栈异步应用 |
| Flask-SocketIO | 同步(基于 gevent) | 高层封装 | 传统 Flask 项目 |
| FastAPI WebSocket | asyncio | 与路由无缝集成 | 现代 API + 实时推送 |

本教程选用 **FastAPI WebSocket**:与 REST API 共存、自动文档、类型提示、性能优秀。

---

## 四、FastAPI WebSocket 基础

### 4.1 安装依赖

\`\`\`bash
# 安装 FastAPI 与 uvicorn(ASGI 服务器)
pip install fastapi uvicorn[standard]
\`\`\`

### 4.2 demo:WebSocket 服务端

下面是最简单的 WebSocket 端点:接收客户端消息,原样回显。

\`\`\`python
# 文件:ws_server_basic.py
# 启动命令: uvicorn ws_server_basic:app --reload --port 8000

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# FastAPI 是 ASGI 框架,WebSocket 类型用于声明 WS 路由参数
# WebSocketDisconnect 异常在客户端断开时抛出,便于清理资源

app = FastAPI()  # 创建应用实例

@app.websocket("/ws")           # 声明一个 WebSocket 路由,路径为 /ws
async def echo(websocket: WebSocket):
    # websocket: WebSocket 是连接对象,封装了收发方法
    await websocket.accept()   # 接受握手(必须先 accept 才能收发)
    try:
        while True:            # 主循环:持续监听客户端消息
            # receive_text 阻塞等待一条文本帧,返回字符串
            data = await websocket.receive_text()
            # send_text 把字符串作为文本帧发回客户端
            await websocket.send_text(f"回显: {data}")
    except WebSocketDisconnect:
        # 客户端关闭连接会跳出循环,这里做清理
        print("客户端已断开")
\`\`\`

测试:浏览器打开 ws://localhost:8000/ws 即可连接(用 DevTools 或 wscat)。

### 4.3 demo:WebSocket 客户端

下面用 Python 写一个客户端,方便脚本化测试。

\`\`\`python
# 文件:ws_client_basic.py
# 依赖: pip install websockets
# 这个库是纯 asyncio 实现,适合写 WS 客户端

import asyncio                 # 异步事件循环
import websockets              # WebSocket 客户端库

async def main():
    # connect 是异步上下文管理器,退出时自动关闭连接
    # uri 必须是 ws:// 或 wss://(加密)
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as ws:
        # send 发送一条文本帧
        await ws.send("你好,WebSocket!")
        # recv 阻塞等待一条消息
        reply = await ws.recv()
        print(f"收到: {reply}")   # 输出: 收到: 回显: 你好,WebSocket!

# asyncio.run 启动事件循环并执行协程
asyncio.run(main())
\`\`\`

---

## 五、asyncio 事件循环基础

WebSocket 服务端天然异步,必须理解 asyncio 的几个核心概念:

\`\`\`python
# 文件:asyncio_basic.py
import asyncio

async def task(name: str, seconds: int):
    # async def 定义的函数叫"协程",调用它返回协程对象而非直接执行
    # asyncio.sleep 是异步睡眠,睡眠时让出 CPU 给其他协程
    print(f"{name} 开始")
    await asyncio.sleep(seconds)   # await 等待异步操作完成
    print(f"{name} 结束(耗时 {seconds}s)")
    return f"{name}-done"

async def main():
    # create_task 把协程包装成 Task 并立即调度执行
    # 三个任务并发跑,总耗时约等于最长的 3 秒,而非 1+2+3=6 秒
    t1 = asyncio.create_task(task("A", 1))
    t2 = asyncio.create_task(task("B", 2))
    t3 = asyncio.create_task(task("C", 3))
    # gather 等待所有任务完成,返回结果列表
    results = await asyncio.gather(t1, t2, t3)
    print(results)   # ['A-done', 'B-done', 'C-done']

asyncio.run(main())   # 入口:创建事件循环并跑 main
\`\`\`

要点:
- \`await\` 只能在 \`async def\` 函数里用
- \`asyncio.gather\` 让多个协程并发执行
- WebSocket 服务端就是在一个事件循环里处理成百上千个连接

---

## 六、聊天室架构设计

### 6.1 核心组件

一个聊天室需要解决三个问题:**谁在线、消息怎么发、发给谁**。

架构组件:
1. 连接管理器(ConnectionManager):维护所有在线连接
2. 消息广播器:把消息推送给目标用户集合
3. 房间分组:支持多聊天室隔离
4. 心跳检测:及时清理掉线的僵尸连接

### 6.2 demo:连接管理

下面实现一个简单的连接管理器,管理 WebSocket 连接集合。

\`\`\`python
# 文件:connection_manager.py
from fastapi import FastAPI, WebSocket

app = FastAPI()

# 连接管理器:负责维护所有在线连接
class ConnectionManager:
    def __init__(self):
        # active_connections 是一个列表,保存所有活跃的 WebSocket 连接
        # 实际项目可用 dict 按 user_id 索引,这里用列表演示
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        # accept 握手;若不 accept,客户端会收到 403
        await websocket.accept()
        # 握手成功后加入连接池
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # 客户端断开时从池中移除,避免后续广播出错
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # 广播:遍历所有连接并发送
        # 用 list(...) 复制一份再遍历,避免遍历中修改列表
        for connection in list(self.active_connections):
            await connection.send_text(message)

manager = ConnectionManager()   # 全局唯一的管理器实例

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await manager.connect(websocket)     # 新连接加入
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"有人说话: {data}")
    except Exception:
        manager.disconnect(websocket)   # 出错或断开时清理
\`\`\`

### 6.3 demo:消息广播

上面的 manager.broadcast 已经实现广播。这里演示按房间广播。

\`\`\`python
# 文件:room_broadcast.py
from fastapi import FastAPI, WebSocket

app = FastAPI()

# 房间管理器:用 dict 把房间名映射到连接列表
class RoomManager:
    def __init__(self):
        # rooms 结构: {"general": [ws1, ws2], "tech": [ws3]}
        self.rooms: dict[str, list[WebSocket]] = {}

    async def join(self, room: str, websocket: WebSocket):
        # 进入房间:把连接加入对应房间的列表
        # setdefault 在 key 不存在时初始化为空列表
        self.rooms.setdefault(room, []).append(websocket)

    async def leave(self, room: str, websocket: WebSocket):
        # 离开房间:从列表中移除
        if room in self.rooms and websocket in self.rooms[room]:
            self.rooms[room].remove(websocket)

    async def broadcast_to_room(self, room: str, message: str):
        # 只广播给指定房间的成员,实现"群聊隔离"
        for ws in self.rooms.get(room, []):
            await ws.send_text(message)

rooms = RoomManager()

@app.websocket("/ws/{room}")
async def ws_room(websocket: WebSocket, room: str):
    await websocket.accept()
    await rooms.join(room, websocket)       # 加入房间
    await rooms.broadcast_to_room(room, f"有人加入了 {room} 房间")
    try:
        while True:
            data = await websocket.receive_text()
            # 消息只发给同房间成员
            await rooms.broadcast_to_room(room, f"[{room}] {data}")
    except Exception:
        await rooms.leave(room, websocket)  # 离开房间
\`\`\`

### 6.4 demo:房间分组

下面演示一个用户在多个房间之间切换的完整逻辑。

\`\`\`python
# 文件:room_switch.py
from fastapi import FastAPI, WebSocket
import json

app = FastAPI()

# 每个连接记录自己当前所在房间
# connections 结构: {websocket: {"room": str, "user": str}}
connections: dict[WebSocket, dict] = {}
# 房间成员结构: {room_name: set(websocket)} 用 set 去重
rooms: dict[str, set] = {}

async def enter_room(websocket: WebSocket, room: str, user: str):
    # 先离开旧房间
    old = connections.get(websocket, {}).get("room")
    if old and old in rooms:
        rooms[old].discard(websocket)   # discard 不存在也不报错
        await broadcast_room(old, f"{user} 离开了房间")
    # 进入新房间
    rooms.setdefault(room, set()).add(websocket)
    connections[websocket] = {"room": room, "user": user}
    await broadcast_room(room, f"{user} 加入了房间 {room}")

async def broadcast_room(room: str, message: str):
    # 给房间所有人发消息
    for ws in rooms.get(room, set()):
        await ws.send_text(message)

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            # 消息用 JSON 传输,字段: type / user / room / content
            msg = json.loads(raw)
            if msg["type"] == "join":
                # 切换房间
                await enter_room(websocket, msg["room"], msg["user"])
            elif msg["type"] == "chat":
                info = connections.get(websocket, {})
                room = info.get("room", "general")
                await broadcast_room(room, f'{msg["user"]}: {msg["content"]}')
    except Exception:
        # 断开时从房间清理
        info = connections.pop(websocket, None)
        if info:
            rooms.get(info["room"], set()).discard(websocket)
\`\`\`

### 6.5 demo:心跳检测

长连接可能因网络问题变成"僵尸连接"(TCP 还在但不传数据)。
用心跳:服务端定时发 ping,客户端回 pong,超时即断开。

\`\`\`python
# 文件:heartbeat.py
import asyncio
from fastapi import FastAPI, WebSocket

app = FastAPI()

async def heartbeat(websocket: WebSocket, timeout: int = 30):
    # 后台协程:每隔 10 秒发 ping,30 秒没收到 pong 就判定掉线
    last_pong = asyncio.get_event_loop().time()   # 记录上次 pong 时间
    while True:
        await asyncio.sleep(10)                    # 每 10 秒一次心跳
        now = asyncio.get_event_loop().time()
        if now - last_pong > timeout:
            # 超时未响应,关闭连接
            await websocket.close(code=1001)
            return
        # send_json 发送一个 JSON 帧,客户端识别 type=ping 后回 pong
        await websocket.send_json({"type": "ping"})

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    # create_task 启动心跳协程,与主循环并发运行
    hb = asyncio.create_task(heartbeat(websocket))
    try:
        while True:
            msg = await websocket.receive_json()
            if msg.get("type") == "pong":
                # 收到 pong 更新时间戳(此处简化,实际需共享变量)
                continue
            await websocket.send_text(f"收到: {msg}")
    except Exception:
        hb.cancel()   # 连接断开时取消心跳任务,释放资源
\`\`\`

心跳的意义:
- 及时清理僵尸连接,避免广播到死连接报错
- 保持 NAT/防火墙的连接不被回收(很多路由器会断开闲置连接)

---

## 七、聊天室架构图(文字描述)

\`\`\`text
                    +-----------------------+
                    |   浏览器 / 移动端      |
                    |  (WebSocket 客户端)    |
                    +-----------+-----------+
                                |
                          ws:// / wss://
                                |
                    +-----------v-----------+
                    |     FastAPI 服务       |
                    |  +-------------------+ |
                    |  | ConnectionManager | |  ← 连接池
                    |  +-------------------+ |
                    |  |  Room 分组逻辑     | |  ← 房间隔离
                    |  +-------------------+ |
                    |  |  心跳 / 心跳检测    | |  ← 僵尸清理
                    |  +-------------------+ |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   可选:消息中间件      |
                    |  (Redis Pub/Sub)      |  ← 多实例广播
                    +-----------------------+
\`\`\`

单实例聊天室用内存连接池即可;多实例部署时,需要 Redis Pub/Sub 做跨实例广播。

---

## 八、本章小结

本章核心知识点:
- WebSocket 通过 HTTP 升级握手建立全双工长连接
- FastAPI 用 \`@app.websocket\` 声明 WS 路由,\`accept/receive/send\` 三板斧
- ConnectionManager 管理连接池,RoomManager 实现房间隔离
- 心跳 ping/pong 是长连接的"健康检查",必须实现
- asyncio 事件循环是并发的根基,\`await/gather/create_task\` 是三大原语

下一章我们将把这些组件组装成一个完整、可运行的多人聊天室。
`
  },

  {
    id: "pyproject-websocket-impl",
    icon: "💬",
    title: "实战:多人聊天室(完整实现)",
    group: "实时与高并发",
    content: `
# 实战:多人聊天室(完整实现)

## 本章概览

本章把上一章的组件组装成一个**完整可运行的多人聊天室**:
支持多人聊天、私聊、房间切换、在线用户列表,自带前端页面。

技术栈:FastAPI + WebSocket + 原生 HTML/JS

---

## 一、项目结构

\`\`\`text
chatroom/
├── main.py              # FastAPI 应用 + WebSocket 路由
├── manager.py           # 连接管理器
├── static/
│   └── index.html       # 前端聊天页面
└── requirements.txt     # 依赖清单
\`\`\`

依赖清单:

\`\`\`text
# requirements.txt
fastapi>=0.110
uvicorn[standard]>=0.27
\`\`\`

---

## 二、消息协议设计

客户端与服务端用 JSON 消息通信,统一字段便于扩展。

\`\`\`text
客户端 → 服务端:
  {"type": "join",   "user": "alice", "room": "general"}
  {"type": "chat",   "user": "alice", "content": "大家好"}
  {"type": "private","from": "alice", "to": "bob", "content": "悄悄话"}
  {"type": "leave",  "user": "alice"}

服务端 → 客户端:
  {"type": "system",  "content": "alice 加入了房间"}
  {"type": "chat",    "user": "alice", "content": "大家好", "room": "general"}
  {"type": "private", "from": "alice", "content": "悄悄话"}
  {"type": "users",   "users": ["alice", "bob"]}
\`\`\`

用 JSON 而非纯文本的好处:结构清晰、易扩展(后续加文件、表情只需加字段)。

---

## 三、连接管理器(ConnectionManager)

这是整个聊天室的核心:管理连接、房间、用户三者的映射关系。

\`\`\`python
# 文件:manager.py
from fastapi import WebSocket
import json

class ConnectionManager:
    """连接管理器:维护 用户→连接、房间→用户集合 的映射"""

    def __init__(self):
        # active: user_name -> WebSocket 连接对象
        # 一个用户名对应一个连接(简化版,不支持同账号多端登录)
        self.active: dict[str, WebSocket] = {}
        # rooms: room_name -> set(user_name)
        # 用 set 是因为成员唯一、去重方便
        self.rooms: dict[str, set[str]] = {"general": set()}

    async def connect(self, user: str, websocket: WebSocket):
        # accept 握手并把用户登记到 active
        await websocket.accept()
        self.active[user] = websocket

    def disconnect(self, user: str):
        # 断开时:从 active 删除,并从所在房间移除
        self.active.pop(user, None)
        for users in self.rooms.values():
            users.discard(user)   # discard 在不存在时也不报错

    async def join_room(self, user: str, room: str):
        # 切换房间:先从所有房间移除,再加入新房间
        for users in self.rooms.values():
            users.discard(user)
        self.rooms.setdefault(room, set()).add(user)

    async def broadcast_room(self, room: str, message: dict):
        # 给房间内所有在线用户广播 JSON 消息
        for user in self.rooms.get(room, set()):
            ws = self.active.get(user)
            if ws:   # 用户可能刚好下线,做个空判断
                await ws.send_json(message)

    async def send_private(self, to_user: str, message: dict):
        # 私聊:直接查 to_user 的连接发消息
        ws = self.active.get(to_user)
        if ws:
            await ws.send_json(message)
            return True
        return False   # 目标用户不在线

    def get_room_users(self, room: str) -> list[str]:
        # 返回房间在线用户列表(用于前端展示)
        return list(self.rooms.get(room, set()))

# 全局唯一实例,所有路由共享
manager = ConnectionManager()
\`\`\`

---

## 四、FastAPI 主程序

\`\`\`python
# 文件:main.py
# 启动命令: uvicorn main:app --reload --port 8000
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from manager import ConnectionManager
import json

app = FastAPI()
# 挂载静态目录,让前端页面能被访问
app.mount("/static", StaticFiles(directory="static"), name="static")

manager = ConnectionManager()   # 连接管理器

@app.get("/")
async def get_home():
    # 根路径直接返回聊天页面,方便演示
    with open("static/index.html", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    # 主 WebSocket 路由:处理所有消息类型
    user = None   # 当前连接的用户名,断开时用于清理
    try:
        # 第一条消息必须是 join,带 user 和 room
        first = await websocket.receive_json()
        if first["type"] != "join":
            await websocket.close(code=1003)
            return
        user = first["user"]
        room = first.get("room", "general")
        await manager.connect(user, websocket)        # 注册连接
        await manager.join_room(user, room)            # 进入房间
        # 广播系统消息:有人加入
        await manager.broadcast_room(room, {
            "type": "system",
            "content": f"{user} 加入了房间"
        })
        # 推送当前房间在线用户列表
        await manager.broadcast_room(room, {
            "type": "users",
            "users": manager.get_room_users(room)
        })

        # 主循环:持续接收并分发消息
        while True:
            msg = await websocket.receive_json()
            mtype = msg.get("type")

            if mtype == "chat":
                # 群聊消息:广播给全房间
                await manager.broadcast_room(room, {
                    "type": "chat",
                    "user": user,
                    "content": msg["content"],
                    "room": room
                })

            elif mtype == "private":
                # 私聊消息:只发给指定用户
                target = msg.get("to")
                ok = await manager.send_private(target, {
                    "type": "private",
                    "from": user,
                    "content": msg["content"]
                })
                if not ok:
                    # 目标不在线,给发送者一个提示
                    await websocket.send_json({
                        "type": "system",
                        "content": f"用户 {target} 不在线"
                    })

            elif mtype == "leave":
                # 用户离开房间
                await manager.disconnect(user)
                await manager.broadcast_room(room, {
                    "type": "system",
                    "content": f"{user} 离开了房间"
                })
                break

    except WebSocketDisconnect:
        # 客户端异常断开(关浏览器、断网)时清理
        if user:
            manager.disconnect(user)
            await manager.broadcast_room("general", {
                "type": "system",
                "content": f"{user} 掉线了"
            })
    except Exception as e:
        # 其他异常兜底,避免服务崩溃
        print(f"WebSocket 异常: {e}")
\`\`\`

---

## 五、demo:启动服务

\`\`\`bash
# 安装依赖
pip install -r requirements.txt

# 启动服务,-reload 修改代码自动重启
uvicorn main:app --reload --port 8000

# 浏览器打开 http://localhost:8000 即可看到聊天页面
\`\`\`

---

## 六、前端聊天页面

\`\`\`html
<!-- 文件:static/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>多人聊天室</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    #chat { border: 1px solid #ccc; height: 300px; overflow-y: auto; padding: 10px; }
    .msg { margin: 4px 0; }
    .system { color: gray; font-style: italic; }
    .private { color: purple; }
    #users { color: #06c; margin: 10px 0; }
  </style>
</head>
<body>
  <h2>多人聊天室</h2>
  <!-- 用户名输入框:未连接时显示 -->
  <div id="login">
    昵称: <input id="user" placeholder="输入昵称">
    <button onclick="doJoin()">加入</button>
  </div>
  <!-- 在线用户列表 -->
  <div id="users"></div>
  <!-- 消息显示区 -->
  <div id="chat"></div>
  <!-- 输入区 -->
  <div id="input" style="display:none">
    <input id="to" placeholder="私聊对象(留空则群发)">
    <input id="content" placeholder="输入消息" onkeydown="if(event.key=='Enter')send()">
    <button onclick="send()">发送</button>
  </div>

  <script>
    // 全局 WebSocket 连接
    let ws = null;
    let currentUser = "";

    function doJoin() {
      // 读取昵称并建立 WebSocket 连接
      currentUser = document.getElementById("user").value || "匿名";
      // 注意:浏览器原生支持 WebSocket
      ws = new WebSocket("ws://" + location.host + "/ws");
      ws.onopen = function() {
        // 连接建立后发送 join 消息
        ws.send(JSON.stringify({type: "join", user: currentUser, room: "general"}));
        document.getElementById("login").style.display = "none";
        document.getElementById("input").style.display = "block";
      };
      ws.onmessage = function(event) {
        // 收到消息统一用 handleMessage 处理
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      };
      ws.onclose = function() {
        appendChat("system", "连接已断开");
      };
    }

    function send() {
      // 发送消息:有私聊对象走 private,否则走 chat
      const to = document.getElementById("to").value;
      const content = document.getElementById("content").value;
      if (!content) return;
      if (to) {
        ws.send(JSON.stringify({type: "private", from: currentUser, to: to, content: content}));
        appendChat("private", "我对 " + to + ": " + content);
      } else {
        ws.send(JSON.stringify({type: "chat", user: currentUser, content: content}));
      }
      document.getElementById("content").value = "";
    }

    function handleMessage(msg) {
      // 根据消息类型渲染到页面
      if (msg.type === "chat") {
        appendChat("msg", msg.user + ": " + msg.content);
      } else if (msg.type === "private") {
        appendChat("private", msg.from + " 私聊我: " + msg.content);
      } else if (msg.type === "system") {
        appendChat("system", msg.content);
      } else if (msg.type === "users") {
        document.getElementById("users").innerText = "在线: " + msg.users.join(", ");
      }
    }

    function appendChat(cls, text) {
      // 把消息追加到聊天区,并自动滚到底部
      const div = document.createElement("div");
      div.className = cls;
      div.innerText = text;
      const chat = document.getElementById("chat");
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }
  </script>
</body>
</html>
\`\`\`

---

## 七、demo:多客户端连接

打开两个浏览器标签页,分别用 "alice" 和 "bob" 加入:

\`\`\`text
[alice 标签] 输入昵称 alice → 加入
[bob 标签]   输入昵称 bob   → 加入

alice 标签会看到:
  system: bob 加入了房间
  users: 在线: alice, bob
\`\`\`

这就是 ConnectionManager.broadcast_room 把"加入事件"推给同房间所有人的效果。

---

## 八、demo:广播消息

alice 输入 "大家好" 发送,alice 和 bob 的页面**同时**显示:

\`\`\`text
alice: 大家好
\`\`\`

因为服务端走的是 \`broadcast_room\`,房间内所有成员都能收到。

---

## 九、demo:私聊功能

alice 在"私聊对象"填 \`bob\`,发送 "悄悄话":
- bob 收到紫色显示:\`alice 私聊我: 悄悄话\`
- alice 自己显示:\`我对 bob: 悄悄话\`(前端本地渲染,服务端只发给 bob)

如果私聊对象不在线,发送者会收到:\`用户 xxx 不在线\`。

---

## 十、demo:房间切换

目前前端固定 join "general"。可以扩展协议支持运行中切房间:

\`\`\`python
# 在 main.py 的主循环里新增 switch 分支(扩展示例)
elif mtype == "switch":
    new_room = msg["room"]
    # 通知旧房间
    await manager.broadcast_room(room, {"type": "system", "content": f"{user} 切换到 {new_room}"})
    await manager.join_room(user, new_room)   # join_room 内部会先离开旧房间
    room = new_room
    await manager.broadcast_room(room, {"type": "system", "content": f"{user} 来到本房间"})
    await manager.broadcast_room(room, {"type": "users", "users": manager.get_room_users(room)})
\`\`\`

前端加一个房间下拉框,选择后发送 \`{"type":"switch","room":"tech"}\` 即可。

---

## 十一、demo:在线用户列表

服务端在 join/leave/disconnect 时都会重新广播 users 列表:

\`\`\`json
{"type": "users", "users": ["alice", "bob"]}
\`\`\`

前端 \`handleMessage\` 里 \`msg.type === "users"\` 分支更新顶部栏,实时显示当前房间在线成员。

---

## 十二、demo:完整聊天流程

把所有功能串起来跑一遍:

\`\`\`text
1. alice 加入 general      → system: alice 加入了房间
2. bob 加入 general        → system: bob 加入了房间 / users: [alice, bob]
3. alice 群发 "hi"          → 双方都看到: alice: hi
4. bob 私聊 alice "hi2"    → alice 看到: bob 私聊我: hi2
5. bob 切换到 tech 房间     → general 提示离开,tech 提示加入
6. bob 关闭浏览器           → system: bob 掉线了 / users 更新
\`\`\`

---

## 十三、扩展建议

聊天室还能继续增强:

1. **消息持久化**:把聊天记录存 SQLite/PostgreSQL,新用户进房间能看历史
   - 加一个 \`Message\` 表,接收时写库,join 时查最近 N 条推送
2. **表情与富文本**:前端解析 \`:smile:\` 之类的标记转 emoji
3. **文件传输**:用 \`receive_bytes/send_bytes\` 收发二进制帧
4. **多实例部署**:用 Redis Pub/Sub 跨进程广播
5. **鉴权**:握手时校验 token,把 user_id 绑到连接

---

## 十四、本章小结

完整聊天室的关键设计:
- 用 **JSON 协议**统一消息格式,便于扩展
- **ConnectionManager** 集中管理连接/房间/用户三映射,职责清晰
- **私聊**走 \`send_private\`,**群聊**走 \`broadcast_room\`,互不干扰
- **WebSocketDisconnect** 异常是断线清理的触发点,必须 try/except
- 前端用原生 WebSocket API 即可,无需额外库

至此,一个功能完整的多人聊天室就跑起来了。下一章我们转向另一个高并发场景:**秒杀系统**。
`
  },

  {
    id: "pyproject-seckill-arch",
    icon: "⚡",
    title: "秒杀系统:架构与并发控制",
    group: "实时与高并发",
    content: `
# 秒杀系统:架构与并发控制

## 本章概览

秒杀是高并发领域的经典场景:1000 件商品,10 万人同时抢。
核心难点不是"功能",而是**在极端并发下保证不超卖、不少卖、系统不崩**。

学习目标:
- 理解秒杀场景的并发问题
- 掌握乐观锁、Redis 原子操作、分布式锁三种方案
- 设计防超卖、防刷的秒杀架构

---

## 一、秒杀场景特点

秒杀有四个鲜明特征:

1. **瞬时高并发**:开抢瞬间 QPS 从几十飙到几万
2. **库存有限**:通常只有几百几千件
3. **绝不能超卖**:卖多了要赔钱、要发货、要道歉
4. **绝不能少卖**:少卖等于浪费流量、损失收入

普通电商接口的 QPS 可能只有几百,秒杀接口要扛几万。
所以秒杀不是"写个接口"那么简单,而是一整套**分层防御**体系。

---

## 二、并发问题分析

### 2.1 竞态条件

看一个最朴素的扣库存逻辑:

\`\`\`python
# 错误示例:非原子操作导致超卖
def buy_naive(product_id):
    stock = db.query("SELECT stock FROM products WHERE id = ?", product_id)
    if stock > 0:
        # 危险!从读到写之间,其他线程可能也读到 stock>0
        db.execute("UPDATE products SET stock = stock - 1 WHERE id = ?", product_id)
        create_order(product_id)
        return "抢到了"
    return "卖光了"
\`\`\`

问题:线程 A 读到 stock=1,线程 B 也读到 stock=1,两者都判断 ">0" 都扣减,结果 stock=-1 → **超卖**。

### 2.2 demo:并发问题演示(超卖)

用 threading 模拟并发,直观看到超卖。

\`\`\`python
# 文件:oversell_demo.py
import threading

# 模拟数据库里的库存
stock = {"count": 10}
sold = {"count": 0}   # 已售数量

def buy():
    # 故意用非原子的"读-判-减"流程
    if stock["count"] > 0:
        # 此处加 sleep 放大竞态窗口,让超卖更容易复现
        import time; time.sleep(0.001)
        stock["count"] -= 1
        sold["count"] += 1

# 起 100 个线程同时抢 10 件
threads = [threading.Thread(target=buy) for _ in range(100)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"剩余库存: {stock['count']}")   # 可能是 -2、-3,即超卖
print(f"已售数量: {sold['count']}")     # 可能 > 10
\`\`\`

运行结果:剩余库存可能出现负数,这就是超卖的根源。

---

## 三、解决方案对比

| 方案 | 实现难度 | 性能 | 适用规模 |
| --- | --- | --- | --- |
| 数据库悲观锁 (FOR UPDATE) | 低 | 差(锁全行) | 百级 QPS |
| 数据库乐观锁 (version 字段) | 中 | 中 | 千级 QPS |
| Redis 原子操作 (DECR/Lua) | 中 | 高 | 万级 QPS |
| 消息队列削峰 | 高 | 极高 | 十万级 QPS |

实际项目常用组合:**Redis 原子扣减 + 异步队列下单**,兼顾性能与一致性。

---

## 四、demo:数据库乐观锁

乐观锁不真正加锁,而是用 version 字段做"提交时检查"。

\`\`\`python
# 文件:optimistic_lock.py
# 依赖: pip install sqlalchemy
import sqlite3

def init_db():
    conn = sqlite3.connect("seckill.db")
    # products 表加 version 字段,每次更新 +1
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            stock INTEGER,
            version INTEGER DEFAULT 0
        )
    """)
    # 插入一条测试商品:库存 10
    conn.execute("DELETE FROM products")
    conn.execute("INSERT INTO products(id, name, stock) VALUES(1, '手机', 10)")
    conn.commit()
    return conn

def buy_optimistic(conn, product_id):
    # 乐观锁三步:读(带 version) → 业务判断 → 写(带 version 条件)
    cur = conn.execute(
        "SELECT stock, version FROM products WHERE id = ?", (product_id,)
    )
    row = cur.fetchone()
    if not row or row[0] <= 0:
        return "卖光了"
    stock, version = row
    # UPDATE 时把刚读到的 version 作为条件,version 不变才更新成功
    cur = conn.execute(
        "UPDATE products SET stock = stock - 1, version = version + 1 "
        "WHERE id = ? AND version = ?",
        (product_id, version)
    )
    conn.commit()
    if cur.rowcount == 0:
        # rowcount=0 表示 version 已被别人改过,本次抢失败
        return "抢失败,请重试"
    return "抢到了"

conn = init_db()
print(buy_optimistic(conn, 1))   # 抢到了
\`\`\`

乐观锁适合**冲突较少**的场景;秒杀冲突极多,重试开销大,所以引入 Redis 方案。

---

## 五、Redis 基础

### 5.1 常用数据结构

| 类型 | 用途 | 常用命令 |
| --- | --- | --- |
| string | 计数器、缓存 | SET / GET / INCR / DECR |
| hash | 对象存储 | HSET / HGET / HINCRBY |
| list | 消息队列 | LPUSH / RPOP / BLPOP |
| set | 去重集合 | SADD / SISMEMBER |

### 5.2 原子操作

Redis 是单线程模型,所有命令原子执行,这是它抗并发的根基:

\`\`\`python
# 文件:redis_basic.py
# 依赖: pip install redis
import redis

# decode_responses=True 让返回值是字符串而非 bytes
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# string 原子计数
r.set("seckill:stock:1", 10)
# DECR 是原子减 1,不会出现"读到旧值再写"
remaining = r.decr("seckill:stock:1")
print(remaining)   # 9
# 减到负数也能继续,所以要在 decr 后判断
remaining = r.decr("seckill:stock:1")
if remaining < 0:
    # 库存已抢空,回滚(加回去)
    r.incr("seckill:stock:1")
    print("卖光了")
\`\`\`

注意:\`DECR\` 本身是原子的,但"DECR + 判断 + 回滚"这三步**不是**原子的。
高并发下仍可能多个线程同时 decr 到负数。解决方案是 **Lua 脚本**(下一章详解)。

---

## 六、demo:Redis 原子扣减

用 Lua 脚本把"判断库存 + 扣减"合成一个原子操作。

\`\`\`python
# 文件:redis_atomic_decr.py
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# Lua 脚本:Redis 会原子地执行整段脚本,中间不会被其他命令打断
# KEYS[1] 是库存 key,ARGV[1] 是购买数量(这里固定 1)
LUA_SCRIPT = """
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock == nil then
    return -1   -- 商品不存在
end
if stock < tonumber(ARGV[1]) then
    return 0    -- 库存不足
end
redis.call('DECRBY', KEYS[1], ARGV[1])
return 1        -- 抢购成功
"""

# register_script 把脚本加载到 Redis,返回可调用对象
script = r.register_script(LUA_SCRIPT)

def buy(product_id):
    key = f"seckill:stock:{product_id}"
    # 用 evalsha 执行,只传 key 和参数,避免每次重传脚本
    result = script(keys=[key], args=[1])
    if result == 1:
        return "抢到了"
    elif result == 0:
        return "卖光了"
    else:
        return "商品不存在"

# 预热库存
r.set("seckill:stock:1", 5)
for i in range(8):
    print(f"第 {i+1} 次: {buy(1)}")
\`\`\`

关键点:**整个 Lua 脚本在 Redis 内原子执行**,杜绝了"读到旧库存"的竞态。

---

## 七、demo:库存预热

秒杀开始前,把数据库库存同步到 Redis,避免开抢瞬间打穿数据库。

\`\`\`python
# 文件:stock_warmup.py
import redis
import sqlite3

def warmup():
    # 从数据库读库存
    conn = sqlite3.connect("seckill.db")
    cur = conn.execute("SELECT id, stock FROM products")
    rows = cur.fetchall()

    r = redis.Redis(decode_responses=True)
    # 用 pipeline 批量写入,减少网络往返
    pipe = r.pipeline()
    for pid, stock in rows:
        # 库存写入 Redis,string 类型
        pipe.set(f"seckill:stock:{pid}", stock)
        # 同时记录一份"已售数量"计数器,初始 0
        pipe.set(f"seckill:sold:{pid}", 0)
    pipe.execute()   # 一次性提交
    print(f"预热完成,共 {len(rows)} 个商品")

warmup()
\`\`\`

预热的意义:开抢瞬间所有请求只打 Redis,不打数据库,数据库压力为 0。

---

## 八、缓存设计要点

秒杀场景的缓存要处理四个经典问题:

### 8.1 缓存预热
开抢前把库存、商品信息加载进 Redis,避免开抢瞬间击穿到 DB。

### 8.2 缓存击穿
单个热点 key 过期瞬间,大量请求同时打到 DB。
解决:热点 key 永不过期,或加互斥锁(只放一个请求去查 DB)。

### 8.3 缓存穿透
查询一个**根本不存在**的 key(如恶意刷不存在的商品 ID),缓存没有,每次打 DB。
解决:把"查无此商品"也缓存(null 值),或用布隆过滤器拦截非法 ID。

### 8.4 缓存雪崩
大量 key **同一时刻**过期,请求全打到 DB。
解决:过期时间加随机扰动(如 60-120 秒随机),避免同时失效。

---

## 九、demo:限流(令牌桶)

秒杀开抢瞬间 QPS 极高,必须在前端/网关层就限流,只放一小部分请求到后端。

令牌桶原理:以固定速率往桶里放令牌,桶满则丢弃;每个请求消耗一个令牌,没令牌就拒绝。

\`\`\`python
# 文件:token_bucket.py
import time
import threading

class TokenBucket:
    def __init__(self, capacity: int, rate: float):
        # capacity: 桶容量(最多存多少令牌)
        # rate: 每秒生成多少令牌
        self.capacity = capacity
        self.rate = rate
        self.tokens = capacity       # 初始满桶
        self.last_time = time.time()
        self.lock = threading.Lock()  # 多线程安全

    def acquire(self) -> bool:
        with self.lock:
            now = time.time()
            # 按时间差补充令牌
            elapsed = now - self.last_time
            self.last_time = now
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
            if self.tokens >= 1:
                self.tokens -= 1
                return True    # 拿到令牌,放行
            return False       # 没令牌,拒绝

bucket = TokenBucket(capacity=10, rate=5)   # 桶 10 个,每秒补 5 个

def request(i):
    if bucket.acquire():
        print(f"请求 {i}: 通过")
    else:
        print(f"请求 {i}: 被限流")

# 模拟 20 个并发请求,大部分会被限流
for i in range(20):
    threading.Thread(target=request, args=(i,)).start()
\`\`\`

限流位置:前端按钮置灰、Nginx 限流、网关限流、应用层令牌桶——越靠前越好。

---

## 十、demo:分布式锁

多实例部署时,本地锁失效。用 Redis 实现跨进程锁。

\`\`\`python
# 文件:distributed_lock.py
import redis
import time
import uuid

r = redis.Redis(decode_responses=True)

class DistributedLock:
    """基于 SET NX EX 的简易分布式锁"""

    def __init__(self, name: str, expire: int = 10):
        # name: 锁名(同一资源用同名锁)
        # expire: 过期秒数,防止持锁进程崩溃导致死锁
        self.name = name
        self.expire = expire
        # value 用随机 token,释放时校验,避免误删别人的锁
        self.token = str(uuid.uuid4())

    def acquire(self) -> bool:
        # SET key value NX EX: 不存在才设置 + 过期时间,原子操作
        return r.set(self.name, self.token, nx=True, ex=self.expire)

    def release(self):
        # 释放要先校验 token 是否匹配,再删除
        # 用 Lua 保证"判断+删除"原子,避免删错
        lua = """
        if redis.call('GET', KEYS[1]) == ARGV[1] then
            return redis.call('DEL', KEYS[1])
        else
            return 0
        end
        """
        r.eval(lua, 1, self.name, self.token)

# 使用示例
lock = DistributedLock("lock:product:1", expire=10)
if lock.acquire():
    try:
        print("拿到锁,执行扣库存")
        time.sleep(1)
    finally:
        lock.release()   # finally 确保异常也释放
else:
    print("未拿到锁,稍后重试")
\`\`\`

分布式锁要点:
- 必须设过期时间,防死锁
- 释放要用 Lua 校验 token,防误删
- 高要求场景用 Redisson 的看门狗自动续期

---

## 十一、秒杀架构图(文字描述)

\`\`\`text
       用户请求(10万 QPS)
            |
  +---------v---------+
  |  前端限流(按钮置灰) |   ← 拦截 90% 重复点击
  +---------+---------+
            |
  +---------v---------+
  |  Nginx / 网关限流   |   ← 令牌桶,只放 1 万进
  +---------+---------+
            |
  +---------v---------+
  |  应用层校验(登录态) |   ← 鉴权 + 用户限购
  +---------+---------+
            |
  +---------v---------+
  |  Redis 原子扣减    |   ← Lua 脚本保证不超卖
  +---------+---------+
            |
  +---------v---------+
  |  消息队列(削峰)    |   ← 异步下单,保护数据库
  +---------+---------+
            |
  +---------v---------+
  |  数据库(落单)      |   ← 最终一致性
  +-------------------+
\`\`\`

每一层都在削减流量,数据库最终只承受几百 QPS,稳如泰山。

---

## 十二、本章小结

秒杀架构的核心理念:**分层防御、逐层削减**。
- 前端限流挡住无脑点击
- 网关限流控制进系统速率
- 应用层校验防刷防重
- Redis 原子扣减防超卖
- 消息队列削峰保护数据库

技术要点:
- 乐观锁适合低冲突,Redis Lua 适合高冲突
- 缓存预热、击穿、穿透、雪崩是缓存四大件
- 令牌桶是经典限流算法
- 分布式锁要设过期时间 + Lua 校验释放

下一章我们把这套架构落地成完整可运行的秒杀系统。
`
  },

  {
    id: "pyproject-seckill-impl",
    icon: "🎯",
    title: "实战:秒杀系统(完整实现)",
    group: "实时与高并发",
    content: `
# 实战:秒杀系统(完整实现)

## 本章概览

本章落地一个完整可运行的秒杀系统:商品展示、抢购、原子扣库存、异步下单、防刷限流。
技术栈:FastAPI + Redis + SQLite。

---

## 一、项目结构

\`\`\`text
seckill/
├── main.py          # FastAPI 应用 + 路由
├── stock.py         # Redis 库存操作(Lua 原子扣减)
├── database.py      # SQLite 初始化与订单落库
├── limiter.py       # 令牌桶限流器
├── warmup.py        # 库存预热脚本
└── requirements.txt
\`\`\`

依赖清单:

\`\`\`text
# requirements.txt
fastapi>=0.110
uvicorn[standard]>=0.27
redis>=5.0
\`\`\`

---

## 二、数据库初始化

\`\`\`python
# 文件:database.py
import sqlite3
import os

DB_PATH = "seckill.db"

def get_db():
    # 每次请求新建连接,SQLite 轻量够用
    # check_same_thread=False 允许跨线程(FastAPI 线程池场景)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row   # 让查询结果可用字段名取值
    return conn

def init_db():
    conn = get_db()
    # products 表:商品 + 库存(数据库是最终一致性来源)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            version INTEGER DEFAULT 0
        )
    """)
    # orders 表:订单记录,user_id + product_id 联合可做限购
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(user_id, product_id)   # 同一用户同一商品只能下一单
        )
    """)
    # 清空并插入测试商品:1000 元的手机 5 件
    conn.execute("DELETE FROM products")
    conn.execute("DELETE FROM orders")
    conn.execute("INSERT INTO products(id, name, price, stock) VALUES(1, '秒杀手机', 999.0, 5)")
    conn.commit()
    print("数据库初始化完成")

if __name__ == "__main__":
    init_db()
\`\`\`

---

## 三、Redis 原子扣减(Lua 脚本)

这是防超卖的核心:把"查库存 + 扣库存 + 记已售"合成一个原子操作。

\`\`\`python
# 文件:stock.py
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# Lua 脚本:Redis 执行 Lua 时不会被其他命令打断,天然原子
# KEYS[1]=库存key  KEYS[2]=已售key  ARGV[1]=用户ID  ARGV[2]=限购数
LUA_DEDUCT = """
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock == nil then
    return -1   -- 商品不存在
end
if stock <= 0 then
    return 0    -- 库存为 0
end
-- 检查用户是否已购买(用 set 记录已购用户,实现限购)
local bought = redis.call('SISMEMBER', KEYS[3], ARGV[1])
if bought == 1 then
    return 2    -- 已购买过(限购)
end
-- 原子扣减库存
redis.call('DECR', KEYS[1])
-- 记录已购用户
redis.call('SADD', KEYS[3], ARGV[1])
return 1        -- 成功
"""

deduct_script = r.register_script(LUA_DEDUCT)

def try_deduct(product_id: int, user_id: str) -> int:
    """尝试扣减库存,返回: 1成功 0售罄 2限购 -1商品不存在"""
    # 三个 key:库存、已售、已购用户集合
    stock_key = f"seckill:stock:{product_id}"
    sold_key = f"seckill:sold:{product_id}"
    buyers_key = f"seckill:buyers:{product_id}"
    return deduct_script(keys=[stock_key, sold_key, buyers_key], args=[user_id, 1])

def rollback(product_id: int, user_id: str):
    """下单失败时回滚 Redis 库存"""
    r.incr(f"seckill:stock:{product_id}")
    r.srem(f"seckill:buyers:{product_id}", user_id)
\`\`\`

---

## 四、库存预热

\`\`\`python
# 文件:warmup.py
# 把数据库库存同步到 Redis,开抢前必须执行
import redis
from database import get_db

def warmup():
    conn = get_db()
    rows = conn.execute("SELECT id, stock FROM products").fetchall()
    r = redis.Redis(decode_responses=True)
    pipe = r.pipeline()
    for row in rows:
        # 库存写入 Redis
        pipe.set(f"seckill:stock:{row['id']}", row["stock"])
        # 已售计数器归零
        pipe.set(f"seckill:sold:{row['id']}", 0)
        # 清空已购用户集合(防止上次预热残留)
        pipe.delete(f"seckill:buyers:{row['id']}")
    pipe.execute()
    print(f"预热完成,{len(rows)} 个商品")

if __name__ == "__main__":
    warmup()
\`\`\`

---

## 五、限流器

\`\`\`python
# 文件:limiter.py
# 令牌桶限流:基于 Redis 实现的简单版本
import time
import redis

r = redis.Redis(decode_responses=True)

def acquire_token(user_id: str, capacity: int = 1, rate: float = 0.1) -> bool:
    """每个用户单独一个桶,capacity=1 表示最多攒 1 个令牌
       rate=0.1 表示每 10 秒补 1 个,即每个用户 10 秒只能请求 1 次"""
    key = f"seckill:bucket:{user_id}"
    now = time.time()
    # 用 Redis hash 存桶状态:tokens + last_time
    pipe = r.pipeline()
    pipe.hgetall(key)
    state = pipe.execute()[0]
    if not state:
        # 首次:满桶
        tokens = capacity
        last_time = now
    else:
        tokens = float(state.get("tokens", capacity))
        last_time = float(state.get("last_time", now))
        # 按时间差补令牌
        tokens = min(capacity, tokens + (now - last_time) * rate)
    if tokens >= 1:
        tokens -= 1
        # 写回状态
        r.hset(key, mapping={"tokens": tokens, "last_time": now})
        # 设置过期时间,避免垃圾数据堆积
        r.expire(key, 60)
        return True
    return False
\`\`\`

---

## 六、FastAPI 主程序

\`\`\`python
# 文件:main.py
# 启动命令: uvicorn main:app --reload --port 8000
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import get_db
from stock import try_deduct, rollback
from limiter import acquire_token

app = FastAPI()

# 请求体模型:Pydantic 自动校验字段类型
class BuyRequest(BaseModel):
    user_id: str
    product_id: int

@app.get("/products")
async def list_products():
    """商品列表:直接读数据库(此接口 QPS 不高)"""
    conn = get_db()
    rows = conn.execute("SELECT id, name, price, stock FROM products").fetchall()
    return [dict(row) for row in rows]

@app.post("/seckill")
async def seckill(req: BuyRequest):
    """抢购接口:秒杀核心,高并发入口"""

    # 第一层:用户级限流,防止单用户狂点
    if not acquire_token(req.user_id):
        raise HTTPException(429, "操作太频繁,请稍后再试")

    # 第二层:Redis 原子扣减(含限购校验)
    result = try_deduct(req.product_id, req.user_id)
    if result == 0:
        raise HTTPException(200, "手慢了,库存已抢光")  # 业务上不算错误
    if result == 2:
        raise HTTPException(200, "您已抢购过,每人限购 1 件")
    if result == -1:
        raise HTTPException(404, "商品不存在")

    # 第三层:扣减成功,异步创建订单(不阻塞响应)
    # create_task 把协程丢到事件循环后台跑,接口立即返回
    asyncio.create_task(create_order(req.user_id, req.product_id))
    return {"msg": "抢购成功,订单生成中", "product_id": req.product_id}

async def create_order(user_id: str, product_id: int):
    """异步落单:把订单写进数据库"""
    try:
        conn = get_db()
        # INSERT OR IGNORE 利用 UNIQUE(user_id, product_id) 防重复下单
        conn.execute(
            "INSERT OR IGNORE INTO orders(user_id, product_id, status) "
            "VALUES(?, ?, 'paid')",
            (user_id, product_id)
        )
        # 同步数据库库存(与 Redis 保持最终一致)
        conn.execute(
            "UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0",
            (product_id,)
        )
        conn.commit()
    except Exception as e:
        # 数据库异常要回滚 Redis,否则库存对不上
        print(f"下单失败: {e}")
        rollback(product_id, user_id)

@app.get("/orders/{user_id}")
async def my_orders(user_id: str):
    """查询用户订单"""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM orders WHERE user_id = ?", (user_id,)
    ).fetchall()
    return [dict(row) for row in rows]
\`\`\`

---

## 七、demo:商品列表

\`\`\`bash
# 启动服务前先初始化并预热
python database.py
python warmup.py
uvicorn main:app --reload --port 8000
\`\`\`

\`\`\`bash
# 查看商品列表
curl http://localhost:8000/products
# 返回: [{"id":1,"name":"秒杀手机","price":999.0,"stock":5}]
\`\`\`

---

## 八、demo:抢购接口

\`\`\`bash
# 用户 alice 抢购商品 1
curl -X POST http://localhost:8000/seckill \
  -H "Content-Type: application/json" \
  -d '{"user_id":"alice","product_id":1}'
# 返回: {"msg":"抢购成功,订单生成中","product_id":1}
\`\`\`

---

## 九、demo:并发压测

用 asyncio + aiohttp 模拟 50 个用户同时抢 5 件商品,验证不超卖。

\`\`\`python
# 文件:pressure_test.py
# 依赖: pip install aiohttp
import asyncio
import aiohttp

async def buy(session, user):
    # 每个用户发一次抢购请求
    async with session.post(
        "http://localhost:8000/seckill",
        json={"user_id": user, "product_id": 1}
    ) as resp:
        data = await resp.json()
        print(f"{user}: {data}")

async def main():
    # 50 个用户并发
    users = [f"user_{i}" for i in range(50)]
    async with aiohttp.ClientSession() as session:
        # gather 让所有请求并发发出
        await asyncio.gather(*[buy(session, u) for u in users])

    # 抢完后查库存
    async with aiohttp.ClientSession() as session:
        async with session.get("http://localhost:8000/products") as resp:
            print("最终商品:", await resp.json())

asyncio.run(main())
\`\`\`

预期结果:
- 恰好 5 个用户"抢购成功"
- 其余 45 个"库存已抢光"
- 数据库 stock 从 5 减到 0,**绝不为负**

---

## 十、demo:库存检查

抢完后查看 Redis 与数据库的库存,验证一致性:

\`\`\`python
# 文件:check_stock.py
import redis
from database import get_db

r = redis.Redis(decode_responses=True)
print("Redis 库存:", r.get("seckill:stock:1"))          # 应为 0
print("Redis 已购用户:", r.smembers("seckill:buyers:1"))  # 5 个 user

conn = get_db()
row = conn.execute("SELECT stock FROM products WHERE id = 1").fetchone()
print("DB 库存:", row["stock"])   # 应为 0,不超卖
\`\`\`

---

## 十一、demo:订单创建

\`\`\`bash
# 查询 alice 的订单
curl http://localhost:8000/orders/alice
# 返回: [{"id":1,"user_id":"alice","product_id":1,"status":"paid","created_at":"..."}]
\`\`\`

由于表加了 \`UNIQUE(user_id, product_id)\`,即使并发重复提交也只会有一单。

---

## 十二、demo:防刷限流

测试限流:同一用户连续抢购会被限流。

\`\`\`python
# 文件:test_limiter.py
import requests

# 连续抢 3 次,第二次起应被限流
for i in range(3):
    r = requests.post(
        "http://localhost:8000/seckill",
        json={"user_id": "spammer", "product_id": 1}
    )
    print(f"第 {i+1} 次: {r.status_code} {r.json()}")
# 第 1 次: 200 抢购成功(或提示已抢过)
# 第 2 次: 429 操作太频繁
# 第 3 次: 429 操作太频繁
\`\`\`

防刷三件套:
- 令牌桶:同一用户 N 秒内只能 1 次
- 限购:Redis buyers 集合 + DB UNIQUE 约束
- 验证码:开抢前要求图形验证码(本 demo 省略,生产必备)

---

## 十三、demo:完整秒杀流程

把所有环节串起来:

\`\`\`bash
# 1. 初始化数据库
python database.py

# 2. 预热库存到 Redis
python warmup.py

# 3. 启动服务
uvicorn main:app --port 8000

# 4. 压测(另开终端)
python pressure_test.py
# → 50 个用户抢,只有 5 个成功,库存精准归零

# 5. 检查库存一致性
python check_stock.py
# → Redis 与 DB 库存都为 0

# 6. 查订单
curl http://localhost:8000/orders/user_0
\`\`\`

---

## 十四、性能优化建议

1. **Redis 集群**:单 Redis 抗几万 QPS 够用,更高可上集群分片
2. **本地缓存**:商品信息可缓存到进程内存,减少 Redis 调用
3. **异步下单队列**:订单写库改用消息队列(RabbitMQ/Kafka)削峰
4. **静态资源 CDN**:商品页、JS、图片走 CDN,不进应用服务器
5. **热点隔离**:秒杀服务独立部署,避免拖垮主站
6. **熔断降级**:下游超时自动熔断,返回"活动太火爆"
7. **预热提前**:开抢前 1 小时就预热,避免临时踩坑

---

## 十五、本章小结

完整秒杀系统的关键设计:
- **Lua 脚本**保证"扣库存 + 限购校验"原子,绝不超卖
- **令牌桶限流**挡住无脑点击,保护后端
- **异步下单**(create_task)让接口快速返回,订单写库后台跑
- **UNIQUE 约束** + Redis buyers 集合,双保险防重复下单
- **rollback 机制**保证 Redis 与 DB 最终一致

至此,一个功能完整、可扛并发的秒杀系统就跑起来了。
从聊天室到秒杀,本批次两个实战项目覆盖了实时通信与高并发的核心套路。
`
  }
];
