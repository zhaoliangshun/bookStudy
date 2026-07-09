export const chapters = [
  {
    id: "pyb-5-1",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "ASGI协议规范 - ASGI与WSGI对比、scope/receive/send三参数、异步应用协议、ASGI v3规范",
    content: `

# ASGI协议规范详解

## 一、ASGI是什么

ASGI（Asynchronous Server Gateway Interface）是Python异步Web应用的标准接口规范，由Django核心开发者Andrew Godwin于2017年提出。它是WSGI的精神继承者，旨在同时支持异步和同步应用，提供WebSocket、HTTP长连接等WSGI无法处理的功能。

### 1.1 ASGI诞生背景

WSGI作为Python Web的标准接口，在过去十几年中取得了巨大成功，但随着Web技术的发展，它的局限性日益凸显：

| WSGI局限性 | 具体表现 |
|------------|----------|
| 单调用模型 | 一个请求对应一个响应，无法处理长连接 |
| 同步阻塞 | 天然只支持同步编程模型 |
| 无WebSocket支持 | 无法原生处理WebSocket协议 |
| 单一协议 | 只能处理HTTP，无法扩展到其他协议 |

ASGI正是为了解决这些问题而诞生的，它的设计目标是：
- 成为Python异步Web的通用标准
- 同时支持HTTP、WebSocket、HTTP/2等多种协议
- 支持异步和同步两种编程风格
- 保持与WSGI应用的向后兼容性

### 1.2 ASGI与WSGI对比

| 特性 | WSGI | ASGI |
|------|------|------|
| 调用方式 | 同步调用，单函数 | 异步调用，协程函数 |
| 参数 | environ, start_response | scope, receive, send |
| 返回值 | 可迭代的字节串 | 异步可迭代对象 |
| 协议支持 | 仅HTTP/1.1 | HTTP/1.1, HTTP/2, WebSocket |
| 异步支持 | 原生不支持 | 原生异步支持 |
| 长连接 | 不支持 | 原生支持 |
| 服务器实现 | Gunicorn, uWSGI, wsgiref | Uvicorn, Hypercorn, Daphne |
| 框架支持 | Flask, Django(同步) | FastAPI, Starlette, Sanic, Django 3+ |

\`\`\`python
# WSGI应用示例
def simple_app(environ, start_response):
    status = '200 OK'
    headers = [('Content-type', 'text/plain; charset=utf-8')]
    start_response(status, headers)
    return [b"Hello World"]

# ASGI应用示例（v3）
async def simple_app(scope, receive, send):
    assert scope['type'] == 'http'
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [(b'content-type', b'text/plain; charset=utf-8')],
    })
    await send({
        'type': 'http.response.body',
        'body': b'Hello World',
    })
\`\`\`

---

## 二、ASGI v3核心三参数

ASGI v3应用是一个可调用对象（通常是async def函数），它接收三个参数：scope、receive、send。

### 2.1 scope参数详解

scope是一个字典，包含了连接的所有上下文信息，类似于WSGI中的environ，但结构更加清晰。scope在整个连接生命周期内只创建一次，对于WebSocket等长连接来说，这一点非常重要。

\`\`\`python
# HTTP请求的scope示例
{
    'type': 'http',                    # 协议类型: http/websocket/lifespan
    'asgi': {
        'version': '3.0',              # ASGI版本
        'spec_version': '2.1'
    },
    'http_version': '1.1',             # HTTP版本
    'method': 'GET',                   # 请求方法
    'scheme': 'http',                  # http或https
    'path': '/api/users',              # 请求路径
    'raw_path': b'/api/users',         # 原始路径字节
    'query_string': b'page=1&size=10', # 查询字符串（未解码）
    'root_path': '',                   # 应用挂载路径
    'headers': [                       # 请求头（字节元组列表）
        (b'host', b'localhost:8000'),
        (b'user-agent', b'curl/7.64.1'),
        (b'accept', b'*/*')
    ],
    'server': ('127.0.0.1', 8000),     # 服务器地址
    'client': ('127.0.0.1', 51234),    # 客户端地址
}

# WebSocket连接的scope示例
{
    'type': 'websocket',
    'asgi': {'version': '3.0'},
    'path': '/ws/chat',
    'query_string': b'room=1',
    'headers': [...],
    'server': ('127.0.0.1', 8000),
    'client': ('127.0.0.1', 51234),
    'subprotocols': ['chat-v1'],       # WebSocket子协议
}

# Lifespan事件的scope示例
{
    'type': 'lifespan',
    'asgi': {'version': '3.0'},
}
\`\`\`

### 2.2 receive参数详解

receive是一个异步可调用对象（await receive()），用于接收传入的事件消息。它返回一个字典，消息的type字段决定了消息类型。

\`\`\`python
# HTTP请求体消息
await receive()
# 返回:
{
    'type': 'http.request',
    'body': b'{"name": "Alice"}',  # 请求体字节
    'more_body': False             # 是否还有更多数据
}

# 分块接收大请求体
body = b''
more_body = True
while more_body:
    message = await receive()
    body += message.get('body', b'')
    more_body = message.get('more_body', False)

# WebSocket接收消息
await receive()
# 返回:
{
    'type': 'websocket.receive',
    'text': 'Hello',        # 文本消息（与body二选一）
    'bytes': None,          # 二进制消息
}

# WebSocket断开连接消息
{
    'type': 'websocket.disconnect',
    'code': 1000,           # 关闭码
}

# Lifespan启动消息
{
    'type': 'lifespan.startup',
}
\`\`\`

### 2.3 send参数详解

send也是一个异步可调用对象（await send(message)），用于向客户端发送事件消息。

\`\`\`python
# 发送HTTP响应开始
await send({
    'type': 'http.response.start',
    'status': 200,
    'headers': [
        (b'content-type', b'application/json'),
        (b'x-custom-header', b'value'),
    ],
})

# 发送HTTP响应体
await send({
    'type': 'http.response.body',
    'body': b'{"message": "success"}',
    'more_body': False,  # 是否继续发送
})

# 分块发送响应
await send({'type': 'http.response.start', 'status': 200, 'headers': []})
await send({'type': 'http.response.body', 'body': b'Part 1', 'more_body': True})
await send({'type': 'http.response.body', 'body': b'Part 2', 'more_body': False})

# 接受WebSocket连接
await send({'type': 'websocket.accept', 'subprotocol': None})

# 发送WebSocket文本消息
await send({'type': 'websocket.send', 'text': 'Hello Client'})

# 发送WebSocket二进制消息
await send({'type': 'websocket.send', 'bytes': b'binary data'})

# 关闭WebSocket连接
await send({'type': 'websocket.close', 'code': 1000})
\`\`\`

---

## 三、ASGI应用完整示例

### 3.1 基础HTTP应用

\`\`\`python
import json
from urllib.parse import parse_qs

async def app(scope, receive, send):
    if scope['type'] == 'http':
        await handle_http(scope, receive, send)
    elif scope['type'] == 'websocket':
        await handle_websocket(scope, receive, send)
    elif scope['type'] == 'lifespan':
        await handle_lifespan(scope, receive, send)

async def handle_http(scope, receive, send):
    method = scope['method']
    path = scope['path']
    
    # 解析查询参数
    query_string = scope['query_string'].decode('utf-8')
    query_params = parse_qs(query_string)
    
    # 接收请求体
    body = b''
    more_body = True
    while more_body:
        message = await receive()
        body += message.get('body', b'')
        more_body = message.get('more_body', False)
    
    # 路由处理
    if path == '/' and method == 'GET':
        response_body = json.dumps({'message': 'Hello ASGI!'}).encode('utf-8')
        status = 200
    elif path == '/echo' and method == 'POST':
        response_body = body
        status = 200
    else:
        response_body = json.dumps({'error': 'Not Found'}).encode('utf-8')
        status = 404
    
    # 发送响应
    await send({
        'type': 'http.response.start',
        'status': status,
        'headers': [
            (b'content-type', b'application/json'),
            (b'content-length', str(len(response_body)).encode('utf-8')),
        ],
    })
    await send({
        'type': 'http.response.body',
        'body': response_body,
    })

async def handle_websocket(scope, receive, send):
    # 接受连接
    await send({'type': 'websocket.accept'})
    
    try:
        while True:
            message = await receive()
            if message['type'] == 'websocket.receive':
                text = message.get('text')
                if text:
                    # 回声服务
                    await send({
                        'type': 'websocket.send',
                        'text': f'Echo: {text}',
                    })
            elif message['type'] == 'websocket.disconnect':
                break
    except Exception:
        pass

async def handle_lifespan(scope, receive, send):
    while True:
        message = await receive()
        if message['type'] == 'lifespan.startup':
            # 初始化资源：数据库连接、缓存等
            print('Application startup')
            await send({'type': 'lifespan.startup.complete'})
        elif message['type'] == 'lifespan.shutdown':
            # 清理资源：关闭连接等
            print('Application shutdown')
            await send({'type': 'lifespan.shutdown.complete'})
            break

# 使用uvicorn运行: uvicorn main:app --reload
\`\`\`

---

## 四、ASGI v3规范要点

### 4.1 应用签名变化

ASGI v2到v3最重要的变化是应用调用方式：

| 版本 | 应用签名 | 说明 |
|------|----------|------|
| v2 | 双可调用 | 先调用(scope)返回一个async callable，再调用(receive, send) |
| v3 | 单异步函数 | 直接async def app(scope, receive, send) |

\`\`\`python
# ASGI v2风格（已废弃）
class Application:
    def __init__(self, scope):
        self.scope = scope
    
    async def __call__(self, receive, send):
        pass

# ASGI v3风格（当前标准）
async def application(scope, receive, send):
    pass
\`\`\`

### 4.2 协议类型规范

ASGI支持多种协议类型，每种类型有对应的消息格式：

| 协议类型 | type值 | 用途 |
|----------|--------|------|
| HTTP | http | 处理HTTP请求响应 |
| WebSocket | websocket | 处理WebSocket长连接 |
| Lifespan | lifespan | 应用生命周期事件 |

### 4.3 消息格式规则

1. 每个消息必须有'type'字段，类型为字符串
2. 消息名采用"协议.动作"的命名格式
3. 所有HTTP头字段名必须是小写字节串
4. 响应头中不能有transfer-encoding（服务器负责处理）

---

## 五、最佳实践与常见坑点

### 5.1 最佳实践

1. **总是检查scope['type']**：一个ASGI应用可能需要处理多种协议类型
2. **正确处理分块消息**：不要假设body一次就能接收完成
3. **及时消费receive**：避免消息积压导致内存问题
4. **使用lifespan初始化资源**：不要在模块级别创建数据库连接池
5. **正确设置Content-Length**：帮助客户端判断响应结束

### 5.2 常见坑点

1. **忘记await send/receive**：这是最常见的错误，会导致协程对象未执行
2. **headers使用字符串而非字节**：ASGI规范要求headers必须是字节元组
3. **不支持HTTP/1.0**：某些客户端可能使用HTTP/1.0，需要特殊处理
4. **WebSocket未正确accept**：在收到websocket.connect后必须发送accept或close

### 5.3 面试常见问题

**Q: ASGI相比WSGI有哪些优势？**
A: ASGI的核心优势包括：原生支持异步编程，可以处理WebSocket和HTTP长连接，单个服务器可以同时处理多种协议，支持HTTP/2，更高的并发性能。

**Q: scope/receive/send三个参数分别是什么？**
A: scope是连接上下文字典，包含请求路径、头、协议类型等元信息；receive是异步函数，用于接收客户端消息；send是异步函数，用于向客户端发送消息。

**Q: ASGI如何实现向后兼容WSGI？**
A: 大多数ASGI服务器（如Uvicorn）都提供了WSGI到ASGI的适配器，可以在ASGI服务器中运行WSGI应用，例如使用\`uvicorn.middleware.wsgi.WSGIMiddleware\`。
`
  },
  {
    id: "pyb-5-2",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "异步Web框架概览 - FastAPI/Starlette基础、Tornado异步模型、Sanic性能特点、Quart/Django3 async",
    content: `

# Python异步Web框架全景

## 一、异步Web框架生态概览

随着Python异步编程的成熟，涌现出了众多优秀的异步Web框架。它们各有特色，适用于不同的场景。

| 框架 | 首版年份 | 基于 | 性能评级 | 特色 | 适用场景 |
|------|----------|------|----------|------|----------|
| FastAPI | 2018 | Starlette+Pydantic | 高 | 自动API文档、类型提示、自动验证 | 现代API后端、微服务 |
| Starlette | 2018 | ASGI原生 | 极高 | 轻量、模块化、工具类丰富 | 框架底层基础、高性能服务 |
| Tornado | 2009 | 自有IOLoop | 中 | Python异步先驱、成熟稳定 | 长连接服务、WebSocket |
| Sanic | 2016 | 自有HTTP解析器 | 极高 | Flask风格、超快速度 | 高并发API、需要速度的场景 |
| Quart | 2017 | ASGI | 高 | Flask API兼容、异步支持 | Flask项目异步迁移 |
| Django 3+ | 2019 | ASGI适配 | 中 | 全功能、ORM/Admin齐全 | 传统Django项目异步化 |
| AIOHTTP | 2014 | asyncio | 高 | 客户端+服务端一体 | 异步HTTP客户端/服务端 |

---

## 二、FastAPI框架深度解析

FastAPI是目前最流行的Python异步Web框架，由Sebastián Ramírez开发，基于Starlette和Pydantic构建。

### 2.1 FastAPI核心特性

\`\`\`python
from fastapi import FastAPI, HTTPException, Depends, Query, Path
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uvicorn

app = FastAPI(
    title="示例API",
    description="FastAPI完整示例",
    version="1.0.0",
)

class Item(BaseModel):
    name: str = Field(..., title="商品名称", min_length=1, max_length=100)
    price: float = Field(..., gt=0, description="商品价格")
    description: Optional[str] = Field(None, max_length=500)
    tags: List[str] = []
    created_at: Optional[datetime] = None

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str]
    tags: List[str]
    created_at: datetime

items_db = {}
next_id = 1

@app.get("/", summary="首页")
async def root():
    return {"message": "Welcome to FastAPI", "docs": "/docs"}

@app.get("/items/", response_model=List[ItemResponse], summary="获取商品列表")
async def list_items(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(10, ge=1, le=100, description="返回数量"),
    tag: Optional[str] = Query(None, description="按标签筛选")
):
    items = list(items_db.values())
    if tag:
        items = [i for i in items if tag in i['tags']]
    return items[skip:skip + limit]

@app.get("/items/{item_id}", response_model=ItemResponse, summary="获取单个商品")
async def get_item(
    item_id: int = Path(..., ge=1, description="商品ID")
):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.post("/items/", response_model=ItemResponse, status_code=201, summary="创建商品")
async def create_item(item: Item):
    global next_id
    item_dict = item.dict()
    item_dict['id'] = next_id
    item_dict['created_at'] = datetime.now()
    items_db[next_id] = item_dict
    next_id += 1
    return item_dict

@app.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item: Item):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    item_dict = item.dict()
    item_dict['id'] = item_id
    item_dict['created_at'] = items_db[item_id]['created_at']
    items_db[item_id] = item_dict
    return item_dict

@app.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

### 2.2 FastAPI依赖注入系统

\`\`\`python
from fastapi import Depends, FastAPI, Header, HTTPException
from typing import Optional

app = FastAPI()

async def get_token_header(x_token: str = Header(...)):
    if x_token != "secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")

async def get_query_token(token: str):
    if token != "jessica":
        raise HTTPException(status_code=400, detail="No Jessica token provided")

# 依赖组合
@app.get("/items/")
async def read_items(
    commons: dict = Depends(lambda: {"skip": 0, "limit": 100}),
    token: str = Depends(get_token_header)
):
    return commons

# 类作为依赖
class CommonQueryParams:
    def __init__(self, q: Optional[str] = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items2/")
async def read_items2(commons: CommonQueryParams = Depends()):
    return {"q": commons.q, "skip": commons.skip, "limit": commons.limit}
\`\`\`

---

## 三、Starlette框架基础

Starlette是FastAPI的底层框架，是一个轻量级的ASGI框架/工具包。

### 3.1 Starlette核心组件

\`\`\`python
from starlette.applications import Starlette
from starlette.responses import JSONResponse, PlainTextResponse, HTMLResponse
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.requests import Request
from starlette.websockets import WebSocket
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

async def homepage(request: Request):
    return HTMLResponse("<h1>Hello Starlette!</h1>")

async def user_detail(request: Request):
    user_id = request.path_params['user_id']
    return JSONResponse({"user_id": user_id, "method": request.method})

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("Connected!")
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except Exception:
        await websocket.close()

routes = [
    Route("/", homepage),
    Route("/users/{user_id:int}", user_detail, methods=["GET", "PUT"]),
    WebSocketRoute("/ws", websocket_endpoint),
]

middleware = [
    Middleware(TrustedHostMiddleware, allowed_hosts=['localhost', '*.example.com']),
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*']),
]

app = Starlette(
    debug=True,
    routes=routes,
    middleware=middleware,
)

# 生命周期事件
@app.on_event("startup")
async def startup():
    print("App started!")

@app.on_event("shutdown")
async def shutdown():
    print("App shutting down!")

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
\`\`\`

---

## 四、Tornado异步模型

Tornado是Python异步Web框架的先驱，使用自己的IOLoop事件循环。

### 4.1 Tornado基础示例

\`\`\`python
import tornado.ioloop
import tornado.web
from tornado import gen
from tornado.httpclient import AsyncHTTPClient

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, Tornado")

class UserHandler(tornado.web.RequestHandler):
    def get(self, user_id):
        self.write({"user_id": user_id, "name": f"User{user_id}"})

# 异步处理器
class AsyncHandler(tornado.web.RequestHandler):
    async def get(self):
        http_client = AsyncHTTPClient()
        try:
            response = await http_client.fetch("https://api.github.com")
            self.set_header("Content-Type", "application/json")
            self.write(response.body)
        except Exception as e:
            self.set_status(500)
            self.write({"error": str(e)})

# WebSocket支持
class ChatHandler(tornado.websocket.WebSocketHandler):
    clients = set()
    
    def open(self):
        ChatHandler.clients.add(self)
        print("New client connected")
    
    def on_message(self, message):
        for client in ChatHandler.clients:
            client.write_message(message)
    
    def on_close(self):
        ChatHandler.clients.remove(self)
        print("Client disconnected")
    
    def check_origin(self, origin):
        return True  # 生产环境不要这样做

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/users/(\\d+)", UserHandler),
        (r"/async", AsyncHandler),
        (r"/ws/chat", ChatHandler),
    ], debug=True)

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    print("Tornado running on http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()
\`\`\`

---

## 五、Sanic性能特点

Sanic以高性能著称，灵感来自Flask但专为速度设计。

### 5.1 Sanic基础示例

\`\`\`python
from sanic import Sanic
from sanic.response import json, text, html
from sanic import Blueprint
from sanic.exceptions import NotFound

app = Sanic("MySanicApp")

# 中间件
@app.middleware('request')
async def print_request(request):
    print(f"Request: {request.method} {request.path}")

@app.middleware('response')
async def add_custom_header(request, response):
    response.headers['X-Powered-By'] = 'Sanic'

# 路由
@app.get("/")
async def hello(request):
    return text("Hello Sanic!")

@app.get("/users/<user_id:int>")
async def get_user(request, user_id):
    return json({"user_id": user_id})

@app.post("/users")
async def create_user(request):
    data = request.json
    return json({"created": data}, status=201)

# 蓝图
api_v1 = Blueprint("api_v1", url_prefix="/api/v1")

@api_v1.get("/items")
async def list_items(request):
    return json({"items": []})

app.blueprint(api_v1)

# 异常处理
@app.exception(NotFound)
async def not_found(request, exception):
    return json({"error": "Not found"}, status=404)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, dev=True, auto_reload=True)
\`\`\`

---

## 六、Quart与Django异步

### 6.1 Quart（Flask异步版）

\`\`\`python
from quart import Quart, websocket, request, jsonify

app = Quart(__name__)

@app.route("/")
async def hello():
    return "Hello Quart!"

@app.route("/users/<int:user_id>")
async def get_user(user_id):
    return jsonify({"id": user_id})

@app.websocket("/ws")
async def ws():
    await websocket.accept()
    while True:
        data = await websocket.receive()
        await websocket.send(f"Echo: {data}")

# 运行: quart run
\`\`\`

### 6.2 Django 3+异步视图

\`\`\`python
# views.py
import asyncio
from django.http import JsonResponse
from asgiref.sync import sync_to_async

async def async_view(request):
    await asyncio.sleep(0.1)
    return JsonResponse({"message": "Hello async Django!"})

# 在异步视图中调用同步ORM
def get_user_sync(user_id):
    from django.contrib.auth.models import User
    return User.objects.get(id=user_id)

async def async_user_view(request, user_id):
    user = await sync_to_async(get_user_sync)(user_id)
    return JsonResponse({"username": user.username})
\`\`\`

---

## 七、框架选型对比表

| 维度 | FastAPI | Starlette | Tornado | Sanic | Django |
|------|---------|-----------|---------|-------|--------|
| 学习曲线 | 中等 | 中等 | 较低 | 低 | 较高 |
| 性能 | 高 | 极高 | 中 | 极高 | 中 |
| 生态成熟度 | 高 | 中 | 极高 | 中 | 极高 |
| WebSocket | 支持 | 支持 | 支持 | 支持 | 支持 |
| 自动文档 | 内置 | 需扩展 | 无 | 需扩展 | 需扩展 |
| ORM集成 | 自由选择 | 自由选择 | 自由选择 | 自由选择 | 内置 |
| 适用项目 | API服务 | 底层服务 | 长连接 | 高并发API | 全功能Web |

**选型建议**：
- 做API后端首选FastAPI，开发效率高
- 追求极致性能且需要更多控制选Starlette/Sanic
- 有大量WebSocket长连接选Tornado
- 传统全功能网站用Django
- 现有Flask项目异步迁移选Quart
`
  },
  {
    id: "pyb-5-3",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "Uvicorn服务器 - Uvicorn架构、H11/HTTPtools解析器、生命周期事件、热重载配置",
    content: `

# Uvicorn ASGI服务器深度解析

## 一、Uvicorn简介

Uvicorn是目前使用最广泛的ASGI服务器，由Tom Christie开发（同时也是Django REST framework、Starlette、HTTPie的作者）。它基于uvloop和httptools构建，性能非常出色。

### 1.1 Uvicorn vs 其他服务器

| 服务器 | 支持协议 | 基于 | 性能 | 适用场景 |
|--------|----------|------|------|----------|
| Uvicorn | HTTP/1.1, WebSocket | uvloop + httptools/h11 | 极高 | 开发、生产(配合Nginx) |
| Hypercorn | HTTP/1.1, HTTP/2, WebSocket | asyncio | 高 | 需要HTTP/2时 |
| Daphne | HTTP/1.1, WebSocket | Twisted | 中 | Django Channels官方 |
| Gunicorn+UvicornWorker | HTTP/1.1, WebSocket | Gunicorn管理+Uvicorn执行 | 极高 | 生产部署首选 |

### 1.2 安装与基础运行

\`\`\`bash
# 基础安装
pip install uvicorn

# 安装带可选加速的版本
pip install uvicorn[standard]  # 包含uvloop, httptools, websockets等

# 安装所有可选依赖
pip install uvicorn[full]
\`\`\`

\`\`\`python
# main.py
async def app(scope, receive, send):
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [(b'content-type', b'text/plain')],
    })
    await send({
        'type': 'http.response.body',
        'body': b'Hello Uvicorn',
    })

# 方式1: 命令行运行
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 方式2: 代码内运行
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1,
        log_level="info",
    )
\`\`\`

---

## 二、Uvicorn架构与核心组件

### 2.1 HTTP解析器：H11 vs HTTPtools

Uvicorn支持两种HTTP解析器：

| 特性 | h11 | httptools |
|------|-----|-----------|
| 实现方式 | 纯Python | C扩展(node.js的http-parser绑定) |
| 性能 | 良好 | 极快(比h11快2-3倍) |
| 兼容性 | 100%纯Python，跨平台 | 需要编译，部分平台可能有问题 |
| HTTP/1.1支持 | 完整 | 完整 |
| 安装方式 | 默认安装 | uvicorn[standard] |

\`\`\`python
# 强制使用h11解析器
import uvicorn
uvicorn.run(
    "main:app",
    http="h11",  # 或"httptools"
)

# 命令行指定
# uvicorn main:app --http h11
\`\`\`

### 2.2 事件循环：uvloop

uvloop是用Cython编写的高性能asyncio事件循环替代品，基于libuv：

| 特性 | 标准asyncio | uvloop |
|------|-------------|--------|
| 实现 | 纯Python | Cython + libuv |
| TCP性能 | 基准 | 快2-4倍 |
| UDP性能 | 基准 | 快2-3倍 |
| Unix信号 | 支持 | 支持 |
| 子进程 | 支持 | 支持 |

\`\`\`python
# 启用uvloop（uvicorn[standard]默认启用）
import uvicorn
uvicorn.run(
    "main:app",
    loop="uvloop",  # 或"asyncio", "auto"(默认)
)

# 手动设置uvloop
import asyncio
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
\`\`\`

### 2.3 WebSocket实现

Uvicorn支持两种WebSocket实现：websockets和wsproto：

\`\`\`python
uvicorn.run(
    "main:app",
    ws="websockets",  # 或"wsproto", "auto"
)
\`\`\`

---

## 三、Uvicorn配置详解

### 3.1 常用启动参数

\`\`\`python
import uvicorn
from uvicorn.config import LOGGING_CONFIG

# 自定义日志配置
log_config = LOGGING_CONFIG.copy()
log_config["formatters"]["access"]["fmt"] = '%(asctime)s - %(levelname)s - %(message)s'

uvicorn.run(
    app,                          # ASGI应用对象或"module:app"字符串
    host="127.0.0.1",             # 绑定地址，生产环境用"0.0.0.0"
    port=8000,                    # 监听端口
    uds=None,                     # Unix socket路径，与host/port互斥
    fd=None,                      # 文件描述符
    
    # 开发配置
    reload=False,                 # 热重载（开发用）
    reload_dirs=None,             # 监听重载的目录列表
    reload_delay=0.25,            # 重载延迟(秒)
    reload_includes=None,         # 重载包含的文件模式
    reload_excludes=None,         # 重载排除的文件模式
    
    # 生产配置
    workers=1,                    # worker进程数（多进程模式）
    loop="auto",                  # 事件循环: auto, asyncio, uvloop
    http="auto",                  # HTTP解析器: auto, h11, httptools
    ws="auto",                    # WebSocket实现: auto, websockets, wsproto
    
    # 生命周期
    lifespan="auto",              # lifespan模式: auto, on, off
    
    # 接口配置
    interface="auto",             # ASGI3, ASGI2, WSGI, auto
    
    # 连接配置
    limit_concurrency=None,       # 最大并发连接数
    limit_max_requests=None,      # 每个worker最大处理请求数（超过重启）
    backlog=2048,                 # 连接队列大小
    timeout_keep_alive=5,         # Keep-Alive超时(秒)
    timeout_notify=30,            # 通知超时(秒)
    timeout_graceful_shutdown=30, # 优雅关闭超时(秒)
    
    # HTTP配置
    headers=None,                 # 额外响应头: [(b"X-Server", b"Uvicorn")]
    server_header=True,           # 是否发送Server头
    date_header=True,             # 是否发送Date头
    
    # HTTPS配置
    ssl_keyfile=None,             # SSL私钥文件
    ssl_certfile=None,            # SSL证书文件
    ssl_keyfile_password=None,    # 私钥密码
    ssl_version=None,             # SSL版本
    ssl_cert_reqs=0,              # 客户端证书要求
    ssl_ca_certs=None,            # CA证书
    ssl_ciphers="TLSv1",          # 加密算法
    
    # 日志配置
    log_level="info",             # 日志级别: critical, error, warning, info, debug, trace
    access_log=True,              # 是否记录访问日志
    log_config=log_config,        # 日志配置字典或文件路径
    use_colors=True,              # 日志是否使用颜色
    
    # 代理配置
    proxy_headers=True,           # 是否解析X-Forwarded-*头
    forwarded_allow_ips=None,     # 允许的代理IP
    root_path="",                 # SCRIPT_NAME，应用挂载前缀
    
    # 其他
    factory=False,                # app是否是工厂函数
)
\`\`\`

### 3.2 配置文件支持

Uvicorn支持从环境变量读取配置：

\`\`\`bash
# .env文件
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8000
UVICORN_WORKERS=4
UVICORN_LOG_LEVEL=info
UVICORN_RELOAD=false
\`\`\`

---

## 四、生命周期事件与应用初始化

### 4.1 Lifespan协议

ASGI的lifespan协议允许应用在启动和关闭时执行代码：

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行：初始化数据库连接、创建连接池等
    print("Starting up...")
    app.state.db_pool = await create_db_pool()
    app.state.redis = await create_redis_pool()
    
    yield  # 应用运行期间
    
    # 关闭时执行：清理资源
    print("Shutting down...")
    await app.state.db_pool.close()
    await app.state.redis.close()

app = FastAPI(lifespan=lifespan)
\`\`\`

### 4.2 Starlette风格的事件处理

\`\`\`python
from starlette.applications import Starlette

app = Starlette()

@app.on_event("startup")
async def startup_event():
    print("App started!")
    app.state.pool = await create_pool()

@app.on_event("shutdown")
async def shutdown_event():
    print("App shutting down!")
    await app.state.pool.close()
\`\`\`

---

## 五、热重载配置详解

### 5.1 基础热重载

\`\`\`bash
# 基础热重载，监听当前目录的Python文件
uvicorn main:app --reload

# 指定监听目录
uvicorn main:app --reload --reload-dir ./app --reload-dir ./lib

# 指定包含/排除模式
uvicorn main:app --reload --reload-include "*.py" --reload-include "*.html" --reload-exclude "*.pyc"
\`\`\`

### 5.2 使用watchfiles实现更强大的重载

\`\`\`bash
pip install uvicorn[standard]  # 包含watchfiles

# 自动使用watchfiles，性能更好
uvicorn main:app --reload
\`\`\`

\`\`\`python
# 代码中配置watchfiles
uvicorn.run(
    "main:app",
    reload=True,
    reload_dirs=["./app", "./templates"],
    reload_includes=["*.py", "*.html", "*.css", "*.js"],
    reload_excludes=["*.pyc", "__pycache__", "*.sqlite3"],
)
\`\`\`

---

## 六、生产部署最佳实践

### 6.1 使用Gunicorn管理Uvicorn Workers（推荐）

Gunicorn作为进程管理器，Uvicorn作为worker：

\`\`\`bash
# 安装
pip install gunicorn uvicorn[standard]

# 启动（4 workers + UvicornWorker）
gunicorn main:app \\
  --workers 4 \\
  --worker-class uvicorn.workers.UvicornWorker \\
  --bind 0.0.0.0:8000 \\
  --max-requests 10000 \\
  --max-requests-jitter 1000 \\
  --timeout 30 \\
  --graceful-timeout 30 \\
  --access-logfile - \\
  --error-logfile -
\`\`\`

### 6.2 Worker数量计算

\`\`\`python
import multiprocessing

# 推荐公式: CPU核心数 * 2 + 1
workers = multiprocessing.cpu_count() * 2 + 1

# 对于CPU密集型应用: CPU核心数 + 1
workers_cpu_bound = multiprocessing.cpu_count() + 1

# 对于IO密集型应用: 可以更多，但一般不超过CPU*4
workers_io_bound = multiprocessing.cpu_count() * 4
\`\`\`

### 6.3 Systemd服务配置

\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=Uvicorn ASGI App
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/myapp
Environment="PATH=/opt/myapp/venv/bin"
ExecStart=/opt/myapp/venv/bin/gunicorn main:app \\
  --workers 4 \\
  --worker-class uvicorn.workers.UvicornWorker \\
  --bind 127.0.0.1:8000 \\
  --max-requests 10000 \\
  --timeout 30
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

---

## 七、常见问题与排障

### 7.1 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Address already in use | 端口被占用 | lsof -i :8000 查找并kill进程 |
| Workers timeout | 请求处理超时 | 增加--timeout，检查是否有阻塞调用 |
| Memory leak | 内存泄漏 | 设置--max-requests定期重启worker |
| WebSocket disconnect | 代理超时 | 配置Nginx超时时间 |

### 7.2 性能调优

\`\`\`python
# 高性能配置
uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8000,
    workers=4,
    loop="uvloop",
    http="httptools",
    limit_concurrency=1000,
    backlog=4096,
    timeout_keep_alive=30,
    proxy_headers=True,
    access_log=False,  # 生产环境可以关闭以提升性能
)
\`\`\`
`
  },
  {
    id: "pyb-5-4",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "Hypercorn与Daphne - 多ASGI服务器对比、HTTP/2支持、WebSocket支持、生产部署",
    content: `

# Hypercorn与Daphne ASGI服务器

## 一、ASGI服务器生态对比

| 特性 | Uvicorn | Hypercorn | Daphne |
|------|---------|-----------|--------|
| 作者 | Tom Christie | Philip Jones (Quart作者) | Django团队 |
| HTTP/1.1 | ✅ | ✅ | ✅ |
| HTTP/2 | ❌ | ✅ | ❌ |
| WebSocket | ✅ | ✅ | ✅ (Channels) |
| HTTP/3 (QUIC) | ❌ | 实验性 | ❌ |
| 事件循环 | asyncio/uvloop | asyncio/uvloop | Twisted |
| 纯Python | httptools是C扩展 | 可纯Python | 纯Python |
| 生产级 | ✅ (推荐+Gunicorn) | ✅ | ✅ |
| 与Django集成 | ✅ | ✅ | 官方推荐 |
| 与FastAPI集成 | 原生推荐 | ✅ | ✅ |
| Trio支持 | ❌ | ✅ | ❌ |
| 性能 | 极高 | 高 | 中 |

---

## 二、Hypercorn深度解析

Hypercorn是一个支持HTTP/2和Trio的ASGI服务器，最初为Quart框架开发。

### 2.1 Hypercorn安装与基础使用

\`\`\`bash
# 安装
pip install hypercorn
pip install hypercorn[trio]  # Trio支持
pip install hypercorn[uvloop]  # uvloop支持
\`\`\`

\`\`\`python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def hello():
    return {"message": "Hello Hypercorn!"}

# 命令行运行
# hypercorn main:app --bind 0.0.0.0:8000

# 代码内运行
if __name__ == "__main__":
    import asyncio
    from hypercorn.asyncio import serve
    from hypercorn.config import Config
    
    config = Config()
    config.bind = ["0.0.0.0:8000"]
    config.workers = 4
    config.loglevel = "info"
    
    asyncio.run(serve(app, config))
\`\`\`

### 2.2 HTTP/2配置

Hypercorn的最大特色是原生支持HTTP/2：

\`\`\`python
from hypercorn.config import Config

config = Config()
# HTTP/2需要HTTPS
config.bind = ["0.0.0.0:443"]
config.certfile = "/path/to/cert.pem"
config.keyfile = "/path/to/key.pem"
# 默认启用h2（HTTP/2），会自动协商
# 客户端支持HTTP/2时自动使用，否则降级到HTTP/1.1

# 验证HTTP/2: curl --http2 -I https://localhost:443
\`\`\`

\`\`\`bash
# 使用mkcert生成本地开发证书（推荐）
# 安装: brew install mkcert (macOS)
mkcert -install
mkcert localhost 127.0.0.1

# 使用HTTP/2启动
hypercorn main:app --bind localhost:8000 \\
  --certfile localhost+2.pem \\
  --keyfile localhost+2-key.pem
\`\`\`

### 2.3 Trio事件循环支持

Hypercorn除了asyncio，还支持Trio：

\`\`\`python
# 使用Trio运行
if __name__ == "__main__":
    import trio
    from hypercorn.trio import serve
    from hypercorn.config import Config
    
    config = Config()
    config.bind = ["0.0.0.0:8000"]
    
    trio.run(serve, app, config)
\`\`\`

### 2.4 Hypercorn配置详解

\`\`\`python
from hypercorn.config import Config

config = Config()
config.bind = ["0.0.0.0:8000", "unix:/tmp/hypercorn.sock"]
config.worker_class = "asyncio"  # asyncio, trio, uvloop
config.workers = 4  # worker数量
config.keep_alive_timeout = 5  # Keep-Alive超时
config.graceful_timeout = 30  # 优雅关闭超时
config.max_requests = 10000  # 每个worker最大请求数
config.max_requests_jitter = 1000  # 随机抖动
config.backlog = 2048  # 连接队列
config.loglevel = "info"
config.accesslog = "-"  # 访问日志
config.errorlog = "-"  # 错误日志
config.certfile = None  # SSL证书
config.keyfile = None  # SSL密钥
config.ca_certs = None  # CA证书
config.include_server_header = True
config.include_date_header = True
config.root_path = ""
config.proxy_headers = True
config.forwarded_allow_ips = "*"
\`\`\`

---

## 三、Daphne与Django Channels

Daphne是Django Channels项目的官方ASGI服务器，由Django Software Foundation维护。

### 3.1 Daphne安装与基础

\`\`\`bash
pip install daphne channels
\`\`\`

\`\`\`python
# asgi.py (Django项目)
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Django ASGI应用
django_asgi_app = get_asgi_application()

from myapp import routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(routing.websocket_urlpatterns)
    ),
})
\`\`\`

\`\`\`bash
# 运行Daphne
daphne -b 0.0.0.0 -p 8000 myproject.asgi:application

# 生产部署配置
daphne -b 0.0.0.0 -p 8000 \\
  --workers 4 \\
  --proxy-headers \\
  --access-log /var/log/daphne/access.log \\
  --log-filename /var/log/daphne/error.log \\
  myproject.asgi:application
\`\`\`

### 3.2 Django WebSocket消费者示例

\`\`\`python
# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

# routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\\w+)/$', consumers.ChatConsumer.as_asgi()),
]
\`\`\`

---

## 四、服务器性能对比测试

### 4.1 简单基准测试

\`\`\`python
# 使用wrk进行压力测试
# 安装: brew install wrk (macOS)

# 测试命令
# wrk -t4 -c100 -d30s http://localhost:8000/

# 典型结果（单worker，简单JSON响应）：
# Uvicorn(httptools+uvloop): ~25,000-35,000 req/s
# Hypercorn(asyncio): ~15,000-20,000 req/s
# Daphne: ~8,000-12,000 req/s
\`\`\`

### 4.2 不同场景下的选择建议

| 场景 | 推荐服务器 | 理由 |
|------|-----------|------|
| FastAPI/Starlette开发 | Uvicorn | 原生支持，热重载方便 |
| 高并发API生产 | Uvicorn+Gunicorn | 性能最佳，生态成熟 |
| 需要HTTP/2 | Hypercorn | 唯一稳定支持HTTP/2 |
| Django+WebSocket | Daphne | Channels官方，集成最好 |
| Quart应用 | Hypercorn | 同一作者，兼容性最好 |
| 喜欢Trio | Hypercorn | 唯一支持Trio |

---

## 五、生产部署配置

### 5.1 Hypercorn + Systemd

\`\`\`ini
# /etc/systemd/system/hypercorn.service
[Unit]
Description=Hypercorn ASGI Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/myapp
Environment="PATH=/opt/myapp/venv/bin"
ExecStart=/opt/myapp/venv/bin/hypercorn main:app \\
  --bind unix:/tmp/hypercorn.sock \\
  --workers 4 \\
  --worker-class uvloop \\
  --max-requests 10000 \\
  --graceful-timeout 30
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

### 5.2 Nginx反向代理配置（所有ASGI服务器通用）

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # WebSocket支持
    location /ws/ {
        proxy_pass http://unix:/tmp/uvicorn.sock;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket超时
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # 普通HTTP
    location / {
        proxy_pass http://unix:/tmp/uvicorn.sock;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_buffering off;  # SSE等场景需要关闭缓冲
    }
}
\`\`\`

---

## 六、WebSocket生产注意事项

### 6.1 长时间连接处理

WebSocket是长连接，需要特殊配置：

\`\`\`python
# 心跳检测防止连接断开
import asyncio

async def websocket_heartbeat(websocket):
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping"})
            try:
                await asyncio.wait_for(websocket.receive_json(), timeout=5)
            except asyncio.TimeoutError:
                break
    except Exception:
        pass

# 在consumer中启动心跳
async def connect(self):
    await self.accept()
    asyncio.create_task(websocket_heartbeat(self))
\`\`\`

### 6.2 常见部署问题

1. **Nginx默认超时60秒**：必须配置proxy_read_timeout
2. **Worker重启断连**：使用--max-requests时会断开连接
3. **负载均衡会话保持**：WebSocket需要sticky session或使用Redis等共享状态
4. **连接数限制**：调整系统ulimit -n
`
  },
  {
    id: "pyb-5-5",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "异步编程深入 - asyncio事件循环、Task/Future、异步上下文管理器、异步生成器在Web中的应用",
    content: `

# Python异步编程深入与Web应用

## 一、asyncio事件循环深度解析

事件循环是异步编程的核心，负责调度协程、处理IO事件、执行回调。

### 1.1 事件循环基础

\`\`\`python
import asyncio

async def main():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

# 方式1: 推荐（Python 3.7+）
asyncio.run(main())

# 方式2: 手动控制循环（旧方式或需要更细粒度控制）
loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(main())
finally:
    loop.close()

# 方式3: 获取运行中的循环（在协程内）
async def inside_coro():
    loop = asyncio.get_running_loop()
    print(f"Running loop: {loop}")
\`\`\`

### 1.2 事件循环的核心方法

| 方法 | 用途 |
|------|------|
| loop.run_until_complete() | 运行直到future完成 |
| loop.run_forever() | 永久运行直到stop() |
| loop.stop() | 停止循环 |
| loop.close() | 关闭循环 |
| loop.create_task() | 创建Task（调度协程） |
| loop.call_soon() | 尽快调度回调 |
| loop.call_later() | 延迟指定时间调度回调 |
| loop.call_at() | 在指定时间点调度回调 |
| loop.add_reader() | 监视文件描述符可读 |
| loop.add_writer() | 监视文件描述符可写 |
| loop.run_in_executor() | 在线程池/进程池中执行同步函数 |

\`\`\`python
import asyncio
import time

async def main():
    loop = asyncio.get_running_loop()
    
    # call_later: 延迟执行
    def callback(arg):
        print(f"Callback called with {arg} at {time.strftime('%H:%M:%S')}")
    
    print(f"Starting at {time.strftime('%H:%M:%S')}")
    loop.call_later(2, callback, "delayed")  # 2秒后执行
    loop.call_later(1, callback, "1 second")  # 1秒后执行
    loop.call_soon(callback, "soon")  # 下一次迭代立即执行
    
    await asyncio.sleep(3)

asyncio.run(main())
\`\`\`

---

## 二、Future与Task深入

### 2.1 Future对象

Future是一个"即将完成"的结果占位符，代表异步操作的最终结果：

\`\`\`python
import asyncio

async def set_future_result(future, value, delay):
    await asyncio.sleep(delay)
    future.set_result(value)

async def main():
    loop = asyncio.get_running_loop()
    future = loop.create_future()
    
    # 创建一个任务来设置future的结果
    asyncio.create_task(set_future_result(future, "Done!", 2))
    
    print("Waiting for future...")
    result = await future  # 等待future完成
    print(f"Future result: {result}")

asyncio.run(main())
\`\`\`

### 2.2 Task对象

Task是Future的子类，用于包装协程并调度执行：

\`\`\`python
import asyncio

async def worker(name, seconds):
    print(f"[{name}] Starting, will take {seconds}s")
    await asyncio.sleep(seconds)
    print(f"[{name}] Finished")
    return f"{name} result"

async def main():
    # create_task立即调度协程
    task1 = asyncio.create_task(worker("A", 2), name="task-A")
    task2 = asyncio.create_task(worker("B", 1), name="task-B")
    task3 = asyncio.create_task(worker("C", 3), name="task-C")
    
    # 等待所有任务完成
    results = await asyncio.gather(task1, task2, task3)
    print(f"Results: {results}")
    
    # 检查任务状态
    print(f"task1 done: {task1.done()}")
    print(f"task1 result: {task1.result()}")
    print(f"task1 exception: {task1.exception()}")  # 如果有异常会抛出

asyncio.run(main())
\`\`\`

### 2.3 任务取消与超时

\`\`\`python
import asyncio

async def long_running():
    try:
        await asyncio.sleep(10)
        return "Finished"
    except asyncio.CancelledError:
        print("Task was cancelled!")
        raise  # 必须重新抛出或处理

async def main():
    task = asyncio.create_task(long_running())
    
    # 等待1秒后取消
    await asyncio.sleep(1)
    task.cancel()
    
    try:
        await task
    except asyncio.CancelledError:
        print("Caught cancel from await")
    
    # 使用wait_for设置超时
    try:
        result = await asyncio.wait_for(long_running(), timeout=2)
    except asyncio.TimeoutError:
        print("Operation timed out!")

asyncio.run(main())
\`\`\`

---

## 三、异步上下文管理器

### 3.1 基础异步上下文管理器

\`\`\`python
import asyncio

class AsyncDatabaseConnection:
    def __init__(self, dsn):
        self.dsn = dsn
        self.conn = None
    
    async def __aenter__(self):
        print(f"Connecting to {self.dsn}...")
        await asyncio.sleep(0.5)  # 模拟异步连接
        self.conn = {"dsn": self.dsn, "connected": True}
        return self.conn
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("Closing connection...")
        await asyncio.sleep(0.2)
        self.conn["connected"] = False
        if exc_type:
            print(f"Exception occurred: {exc_val}")
        return False  # 不抑制异常

async def main():
    async with AsyncDatabaseConnection("postgresql://localhost/db") as conn:
        print(f"Using connection: {conn}")
        await asyncio.sleep(0.5)  # 模拟查询
    print("Done")

asyncio.run(main())
\`\`\`

### 3.2 contextlib.asynccontextmanager装饰器

\`\`\`python
from contextlib import asynccontextmanager
import asyncio

@asynccontextmanager
async def get_db_connection():
    # 进入时: 相当于__aenter__
    print("Opening connection...")
    await asyncio.sleep(0.3)
    conn = {"id": 1, "open": True}
    try:
        yield conn
    finally:
        # 退出时: 相当于__aexit__，无论是否异常都会执行
        print("Closing connection...")
        await asyncio.sleep(0.1)
        conn["open"] = False

async def main():
    async with get_db_connection() as conn:
        print(f"Connection: {conn}")
        # raise ValueError("test error")  # 测试异常情况

asyncio.run(main())
\`\`\`

### 3.3 Web应用中的实际应用

\`\`\`python
from contextlib import asynccontextmanager
import asyncio
import aiopg

# 数据库连接池
class Database:
    def __init__(self):
        self.pool = None
    
    async def connect(self, dsn):
        self.pool = await aiopg.create_pool(dsn)
    
    async def close(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()
    
    @asynccontextmanager
    async def connection(self):
        async with self.pool.acquire() as conn:
            yield conn
    
    @asynccontextmanager
    async def cursor(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                yield cur

db = Database()

@asynccontextmanager
async def lifespan(app):
    # 启动时创建连接池
    await db.connect("dbname=test user=postgres")
    yield
    # 关闭时清理
    await db.close()

# 在路由中使用
async def get_users():
    async with db.cursor() as cur:
        await cur.execute("SELECT id, name FROM users")
        return await cur.fetchall()
\`\`\`

---

## 四、异步生成器

### 4.1 基础异步生成器

\`\`\`python
import asyncio

async def async_range(count):
    """异步生成0到count-1"""
    for i in range(count):
        await asyncio.sleep(0.1)  # 模拟异步IO
        yield i

async def main():
    # 异步迭代
    async for num in async_range(5):
        print(f"Got: {num}")

asyncio.run(main())
\`\`\`

### 4.2 流式响应（SSE - Server-Sent Events）

异步生成器非常适合实现流式响应：

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

async def event_generator():
    """SSE事件生成器"""
    count = 0
    while True:
        count += 1
        data = json.dumps({"count": count, "message": f"Event #{count}"})
        yield f"data: {data}\\n\\n"
        await asyncio.sleep(1)
        if count >= 10:
            yield f"data: {json.dumps({'done': True})}\\n\\n"
            break

@app.get("/events")
async def sse_endpoint():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

# 流式JSON输出
async def stream_large_data():
    yield "["
    first = True
    for i in range(1000):
        if not first:
            yield ","
        first = False
        await asyncio.sleep(0.001)  # 模拟数据库分批查询
        yield json.dumps({"id": i, "name": f"Item {i}"})
    yield "]"

@app.get("/large-data")
async def large_data():
    return StreamingResponse(
        stream_large_data(),
        media_type="application/json"
    )
\`\`\`

---

## 五、Web应用中的异步模式

### 5.1 并发请求处理

\`\`\`python
import asyncio
import aiohttp
from fastapi import FastAPI

app = FastAPI()

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.json()

@app.get("/aggregate")
async def aggregate_data():
    """同时调用多个外部API"""
    urls = [
        "https://api.example.com/users",
        "https://api.example.com/products",
        "https://api.example.com/orders",
    ]
    
    async with aiohttp.ClientSession() as session:
        # gather并发执行
        results = await asyncio.gather(
            *[fetch_url(session, url) for url in urls],
            return_exceptions=True  # 单个失败不影响其他
        )
    
    return {
        "users": results[0] if not isinstance(results[0], Exception) else None,
        "products": results[1] if not isinstance(results[1], Exception) else None,
        "orders": results[2] if not isinstance(results[2], Exception) else None,
        "errors": [str(r) for r in results if isinstance(r, Exception)],
    }
\`\`\`

### 5.2 信号量控制并发

\`\`\`python
import asyncio
import aiohttp

async def fetch_with_semaphore(semaphore, session, url):
    async with semaphore:  # 限制并发数
        async with session.get(url) as response:
            return await response.text()

async def fetch_many(urls, max_concurrent=10):
    semaphore = asyncio.Semaphore(max_concurrent)
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_semaphore(semaphore, session, url)
            for url in urls
        ]
        return await asyncio.gather(*tasks)

# 使用
urls = [f"https://api.example.com/items/{i}" for i in range(100)]
# 最多同时10个请求
results = asyncio.run(fetch_many(urls, max_concurrent=10))
\`\`\`

---

## 六、常见坑点与最佳实践

### 6.1 阻塞事件循环（最大的坑）

异步代码中绝对不能有同步阻塞调用：

\`\`\`python
import asyncio
import time
import requests

# ❌ 错误：阻塞整个事件循环
async def bad_example():
    time.sleep(5)  # 阻塞！所有请求都会卡住
    requests.get("https://example.com")  # 阻塞！

# ✅ 正确：使用异步版本
async def good_example():
    await asyncio.sleep(5)  # 非阻塞
    async with aiohttp.ClientSession() as session:
        async with session.get("https://example.com") as resp:
            await resp.text()

# 如果必须用同步库，放到线程池
async def using_executor():
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        None,  # None使用默认线程池
        lambda: requests.get("https://example.com").text
    )
    return result
\`\`\`

### 6.2 协程没有被调度

\`\`\`python
# ❌ 错误：只创建协程对象，没有调度
async def background_task():
    await asyncio.sleep(10)
    print("Done")

async def handler():
    background_task()  # 只是创建协程，不会执行！
    return "OK"

# ✅ 正确：用create_task调度
async def handler_fixed():
    asyncio.create_task(background_task())  # 正确调度
    return "OK"
\`\`\`

### 6.3 忘记await

\`\`\`python
# ❌ 错误
async def handler():
    asyncio.sleep(1)  # 没有await，协程不会执行
    some_async_func()  # 没有await，返回协程对象而非结果
    return "OK"

# ✅ 正确
async def handler():
    await asyncio.sleep(1)
    result = await some_async_func()
    return "OK"
\`\`\`

### 6.4 最佳实践清单

1. **永远不要阻塞事件循环**：使用asyncio.debug=True检测阻塞
2. **合理控制并发**：使用Semaphore防止打爆外部服务
3. **正确处理异常**：gather时考虑return_exceptions
4. **取消要处理**：要么捕获CancelledError，要么确保资源清理
5. **使用async context manager**：确保资源正确释放
6. **不要create_task后就不管**：要能追踪和取消后台任务
7. **数据库使用异步驱动**：asyncpg/aiomysql/aiosqlite等
\`\`\`
`
  },
  {
    id: "pyb-5-6",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "异步数据库访问 - asyncpg/aiomysql/aiosqlite、SQLAlchemy async ORM、异步数据库连接池",
    content: `

# 异步数据库访问实战

## 一、异步数据库驱动概览

传统的同步数据库驱动（如psycopg2、pymysql）会阻塞事件循环，在异步Web应用中必须使用专门的异步驱动。

| 数据库 | 同步驱动 | 异步驱动 | 性能 | 推荐度 |
|--------|----------|----------|------|--------|
| PostgreSQL | psycopg2 | asyncpg | 极快（比psycopg2快2-3倍） | ⭐⭐⭐⭐⭐ |
| MySQL | pymysql/mysqlclient | aiomysql | 良好 | ⭐⭐⭐⭐ |
| SQLite | sqlite3 | aiosqlite | 良好 | ⭐⭐⭐⭐ |
| MongoDB | pymongo | motor | 极快 | ⭐⭐⭐⭐⭐ |

---

## 二、asyncpg - PostgreSQL异步驱动

asyncpg是为PostgreSQL和Python asyncio设计的高性能数据库接口，由MagicStack开发。

### 2.1 基础连接与查询

\`\`\`python
import asyncio
import asyncpg

async def basic_example():
    # 建立连接
    conn = await asyncpg.connect(
        user='postgres',
        password='password',
        database='testdb',
        host='localhost',
        port=5432
    )
    
    # 执行查询
    result = await conn.fetch('SELECT * FROM users WHERE id = \$1', 1)
    for row in result:
        print(dict(row))
    
    # 获取单行
    row = await conn.fetchrow('SELECT * FROM users WHERE id = \$1', 1)
    print(f"User: {row['name']}, {row['email']}")
    
    # 获取单个值
    count = await conn.fetchval('SELECT count(*) FROM users')
    print(f"Total users: {count}")
    
    # 执行插入/更新/删除
    await conn.execute(
        'INSERT INTO users(name, email) VALUES(\$1, \$2)',
        'Alice', 'alice@example.com'
    )
    
    # 插入并返回记录
    row = await conn.fetchrow(
        'INSERT INTO users(name, email) VALUES(\$1, \$2) RETURNING *',
        'Bob', 'bob@example.com'
    )
    print(f"Inserted user: {dict(row)}")
    
    await conn.close()

asyncio.run(basic_example())
\`\`\`

### 2.2 连接池使用

\`\`\`python
import asyncio
import asyncpg
from contextlib import asynccontextmanager

class Database:
    def __init__(self):
        self.pool = None
    
    async def create_pool(self, dsn, **kwargs):
        self.pool = await asyncpg.create_pool(
            dsn,
            min_size=5,          # 最小连接数
            max_size=20,         # 最大连接数
            max_queries=50000,   # 每个连接最大查询数后回收
            max_inactive_connection_lifetime=300,  # 空闲连接超时
            command_timeout=60,  # 命令超时
            **kwargs
        )
        return self.pool
    
    async def close(self):
        if self.pool:
            await self.pool.close()
    
    @asynccontextmanager
    async def connection(self):
        async with self.pool.acquire() as conn:
            yield conn
    
    @asynccontextmanager
    async def transaction(self):
        async with self.pool.acquire() as conn:
            tx = conn.transaction()
            await tx.start()
            try:
                yield conn
                await tx.commit()
            except Exception:
                await tx.rollback()
                raise

db = Database()

async def example_usage():
    await db.create_pool('postgresql://postgres:password@localhost/testdb')
    
    # 使用连接池查询
    async with db.connection() as conn:
        users = await conn.fetch('SELECT * FROM users LIMIT 10')
        print(f"Got {len(users)} users")
    
    # 使用事务
    async with db.transaction() as conn:
        await conn.execute(
            'UPDATE accounts SET balance = balance - \$1 WHERE id = \$2',
            100, 1
        )
        await conn.execute(
            'UPDATE accounts SET balance = balance + \$1 WHERE id = \$2',
            100, 2
        )
    
    await db.close()

asyncio.run(example_usage())
\`\`\`

### 2.3 类型转换与预处理语句

\`\`\`python
import asyncio
import asyncpg
import json
from datetime import datetime

async def type_example():
    conn = await asyncpg.connect('postgresql://postgres@localhost/testdb')
    
    # JSON类型
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            data JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        )
    ''')
    
    # 自动类型转换（dict <-> JSONB）
    await conn.set_type_codec(
        'jsonb',
        encoder=json.dumps,
        decoder=json.loads,
        schema='pg_catalog'
    )
    
    await conn.execute(
        'INSERT INTO events(data) VALUES(\$1)',
        {'event': 'login', 'user_id': 1, 'metadata': {'ip': '127.0.0.1'}}
    )
    
    row = await conn.fetchrow('SELECT * FROM events ORDER BY id DESC LIMIT 1')
    print(f"Event data (dict): {row['data']}")  # 自动是dict
    
    await conn.close()

asyncio.run(type_example())
\`\`\`

---

## 三、aiomysql - MySQL异步驱动

aiomysql基于PyMySQL构建，提供asyncio兼容接口。

### 3.1 基础使用

\`\`\`python
import asyncio
import aiomysql

async def mysql_example():
    # 创建连接池
    pool = await aiomysql.create_pool(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='password',
        db='testdb',
        minsize=5,
        maxsize=20,
        autocommit=False,
        charset='utf8mb4'
    )
    
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # 查询
            await cur.execute("SELECT * FROM users WHERE id = %s", (1,))
            user = await cur.fetchone()
            print(user)
            
            # 插入
            await cur.execute(
                "INSERT INTO users(name, email) VALUES(%s, %s)",
                ('Alice', 'alice@example.com')
            )
            await conn.commit()
            
            # 批量插入
            users = [
                ('Bob', 'bob@example.com'),
                ('Charlie', 'charlie@example.com'),
            ]
            await cur.executemany(
                "INSERT INTO users(name, email) VALUES(%s, %s)",
                users
            )
            await conn.commit()
    
    pool.close()
    await pool.wait_closed()

asyncio.run(mysql_example())
\`\`\`

---

## 四、aiosqlite - SQLite异步驱动

\`\`\`python
import asyncio
import aiosqlite

async def sqlite_example():
    # 连接数据库（自动创建）
    async with aiosqlite.connect('example.db') as db:
        # 启用字典行
        db.row_factory = aiosqlite.Row
        
        # 创建表
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()
        
        # 插入
        await db.execute(
            'INSERT INTO users(name, email) VALUES(?, ?)',
            ('Alice', 'alice@example.com')
        )
        await db.commit()
        
        # 查询
        async with db.execute('SELECT * FROM users') as cursor:
            async for row in cursor:
                print(f"User: {dict(row)}")
        
        # 参数化查询
        async with db.execute(
            'SELECT * FROM users WHERE name LIKE ?',
            ('A%',)
        ) as cursor:
            users = await cursor.fetchall()
            print(f"Users starting with A: {len(users)}")

asyncio.run(sqlite_example())
\`\`\`

---

## 五、SQLAlchemy 1.4/2.0 异步ORM

SQLAlchemy从1.4版本开始原生支持异步，2.0版本完全支持async/await。

### 5.1 异步ORM基础

\`\`\`python
import asyncio
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, ForeignKey, select

# 基础模型
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True)

# 创建异步引擎
engine = create_async_engine(
    'postgresql+asyncpg://postgres:password@localhost/testdb',
    echo=True,  # 打印SQL
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # 连接前检测
)

# 创建异步Session工厂
AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def orm_example():
    await init_db()
    
    async with AsyncSessionLocal() as session:
        # 插入
        user = User(name='Alice', email='alice@example.com')
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"Created user: {user.id}")
        
        # 查询
        result = await session.execute(
            select(User).where(User.name.like('A%'))
        )
        users = result.scalars().all()
        print(f"Found {len(users)} users")
        
        # 更新
        user.name = 'Alice Updated'
        await session.commit()
        
        # 删除
        await session.delete(user)
        await session.commit()
    
    await engine.dispose()

asyncio.run(orm_example())
\`\`\`

---

## 六、异步数据库最佳实践

### 6.1 连接池配置指南

| 参数 | 建议值 | 说明 |
|------|--------|------|
| min_size | 5-10 | 保持一定预热连接 |
| max_size | CPU核心数 * 2 + 5 | 不要设置过大 |
| pool_pre_ping | True | 防止使用断开的连接 |
| max_inactive_lifetime | 300 | 回收空闲连接 |
| command_timeout | 30-60 | 防止慢查询挂住 |

### 6.2 常见坑点

\`\`\`python
# ❌ 坑1: 不要每次查询创建新连接
async def bad_query():
    conn = await asyncpg.connect(dsn)  # 每次都创建连接！
    result = await conn.fetch("SELECT ...")
    await conn.close()
    return result

# ✅ 正确: 使用连接池
async def good_query(pool):
    async with pool.acquire() as conn:
        return await conn.fetch("SELECT ...")

# ❌ 坑2: 事务中忘记commit/rollback
async def bad_transaction(pool):
    async with pool.acquire() as conn:
        tx = conn.transaction()
        await tx.start()
        await conn.execute("INSERT ...")
        # 异常时事务一直开着！

# ✅ 正确: 使用async with自动管理事务
async def good_transaction(pool):
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("INSERT ...")
            # 退出时自动commit或rollback
\`\`\`
`
  },
  {
    id: "pyb-5-7",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "异步任务与并发 - asyncio.gather/wait、异步信号量控制并发、异步限流、Background Tasks",
    content: `

# 异步任务与并发控制

## 一、并发执行基础

### 1.1 asyncio.gather - 并发执行多个协程

gather是最常用的并发工具，它同时调度多个协程并收集结果。

\`\`\`python
import asyncio
import aiohttp
import time

async def fetch_url(url, delay=0):
    """模拟获取URL内容"""
    await asyncio.sleep(delay)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.text()

async def gather_basic():
    start = time.time()
    
    # 顺序执行（慢）
    # r1 = await fetch_url("https://api.github.com")
    # r2 = await fetch_url("https://api.github.com/users/python")
    # r3 = await fetch_url("https://api.github.com/orgs/python")
    
    # 并发执行（快）
    results = await asyncio.gather(
        fetch_url("https://api.github.com", delay=0.5),
        fetch_url("https://api.github.com/users/python", delay=0.3),
        fetch_url("https://api.github.com/orgs/python", delay=0.4),
    )
    
    print(f"Total time: {time.time() - start:.2f}s")
    print(f"Results lengths: {[len(r) for r in results]}")

# return_exceptions=True: 异常不中断其他任务
async def gather_with_exceptions():
    async def ok_task():
        await asyncio.sleep(0.1)
        return "OK"
    
    async def fail_task():
        await asyncio.sleep(0.2)
        raise ValueError("Something went wrong")
    
    results = await asyncio.gather(
        ok_task(),
        fail_task(),
        ok_task(),
        return_exceptions=True
    )
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Task {i} failed: {result}")
        else:
            print(f"Task {i} succeeded: {result}")

asyncio.run(gather_basic())
\`\`\`

### 1.2 asyncio.wait - 更灵活的等待

wait可以等待任务完成，支持FIRST_COMPLETED、FIRST_EXCEPTION、ALL_COMPLETED三种模式。

\`\`\`python
import asyncio

async def task(name, duration):
    await asyncio.sleep(duration)
    if name == "C":
        raise RuntimeError(f"Task {name} failed!")
    return f"Result from {name}"

async def wait_example():
    tasks = [
        asyncio.create_task(task("A", 1)),
        asyncio.create_task(task("B", 2)),
        asyncio.create_task(task("C", 1.5)),
    ]
    
    # 等待第一个完成
    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_COMPLETED
    )
    print(f"First completed: {len(done)} tasks")
    for t in done:
        print(f"  Result: {t.result()}")
    
    # 取消未完成的任务
    for t in pending:
        t.cancel()
    
    # 等待所有剩余任务（处理取消）
    await asyncio.gather(*pending, return_exceptions=True)

asyncio.run(wait_example())
\`\`\`

---

## 二、信号量控制并发

Semaphore是控制并发数的核心工具，防止同时发起太多请求导致打爆外部服务。

### 2.1 基础信号量使用

\`\`\`python
import asyncio
import aiohttp

async def fetch_with_semaphore(sem, session, url):
    async with sem:  # 获取信号量，并发数不超过semaphore初始值
        async with session.get(url) as response:
            return await response.json()

async def fetch_many_urls(urls, max_concurrent=10):
    sem = asyncio.Semaphore(max_concurrent)
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_semaphore(sem, session, url)
            for url in urls
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

# 示例：爬取100个页面，最多10个并发
urls = [f"https://jsonplaceholder.typicode.com/posts/{i}" for i in range(1, 101)]
results = asyncio.run(fetch_many_urls(urls, max_concurrent=10))
successful = [r for r in results if not isinstance(r, Exception)]
print(f"Successful: {len(successful)}/{len(urls)}")
\`\`\`

### 2.2 带进度的批量任务

\`\`\`python
import asyncio
from tqdm import tqdm

async def process_item(item, sem):
    async with sem:
        await asyncio.sleep(0.1)  # 模拟处理
        return item * 2

async def batch_process_with_progress(items, concurrency=20, batch_size=100):
    sem = asyncio.Semaphore(concurrency)
    results = []
    
    with tqdm(total=len(items)) as pbar:
        for i in range(0, len(items), batch_size):
            batch = items[i:i + batch_size]
            tasks = [process_item(item, sem) for item in batch]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)
            pbar.update(len(batch))
    
    return results

items = list(range(1000))
results = asyncio.run(batch_process_with_progress(items))
\`\`\`

---

## 三、异步限流（Rate Limiting）

### 3.1 令牌桶算法实现

\`\`\`python
import asyncio
import time
from collections import deque

class TokenBucketRateLimiter:
    def __init__(self, rate: float, capacity: float):
        """
        rate: 每秒生成的令牌数
        capacity: 桶的最大容量
        """
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.monotonic()
        self._lock = asyncio.Lock()
    
    async def acquire(self, tokens: float = 1):
        async with self._lock:
            while True:
                now = time.monotonic()
                elapsed = now - self.last_update
                self.tokens = min(
                    self.capacity,
                    self.tokens + elapsed * self.rate
                )
                self.last_update = now
                
                if self.tokens >= tokens:
                    self.tokens -= tokens
                    return
                
                # 需要等待的时间
                wait_time = (tokens - self.tokens) / self.rate
                await asyncio.sleep(wait_time)

class RateLimiter:
    """简单的固定窗口限流器"""
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = deque()
        self._lock = asyncio.Lock()
    
    async def acquire(self):
        async with self._lock:
            now = time.monotonic()
            # 清理过期的调用记录
            while self.calls and now - self.calls[0] > self.period:
                self.calls.popleft()
            
            if len(self.calls) >= self.max_calls:
                wait_time = self.period - (now - self.calls[0])
                await asyncio.sleep(wait_time)
                return await self.acquire()
            
            self.calls.append(now)

# 使用示例
async def rate_limited_api_call(limiter, url):
    await limiter.acquire()  # 等待获取令牌
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.json()

async def demo_rate_limit():
    limiter = TokenBucketRateLimiter(rate=10, capacity=10)  # 每秒10个请求
    
    tasks = []
    for i in range(50):
        tasks.append(rate_limited_api_call(
            limiter,
            "https://api.example.com/data"
        ))
    
    await asyncio.gather(*tasks)
\`\`\`

---

## 四、FastAPI Background Tasks

FastAPI内置了Background Tasks用于处理响应后需要执行的任务。

### 4.1 基础使用

\`\`\`python
from fastapi import FastAPI, BackgroundTasks
import time
import asyncio

app = FastAPI()

async def send_email_async(to: str, subject: str):
    """异步发送邮件"""
    await asyncio.sleep(2)  # 模拟邮件发送
    print(f"Email sent to {to}: {subject}")

def log_notification(message: str):
    """同步日志任务"""
    time.sleep(0.5)
    print(f"Log: {message}")

@app.post("/register/")
async def register_user(
    email: str,
    background_tasks: BackgroundTasks
):
    # 立即响应用户
    response = {"message": "User registered successfully", "email": email}
    
    # 添加后台任务（在响应发送后执行）
    background_tasks.add_task(
        send_email_async,
        email,
        "Welcome to our platform!"
    )
    background_tasks.add_task(
        log_notification,
        f"New user registered: {email}"
    )
    
    return response
\`\`\`

### 4.2 更复杂的后台任务处理

对于需要长时间运行的任务，应该使用任务队列（如Celery、Arq）：

\`\`\`python
from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from typing import Dict

# 简单的内存任务队列（生产环境用Arq/Celery）
class TaskManager:
    def __init__(self):
        self.tasks: Dict[str, asyncio.Task] = {}
        self.results: Dict[str, dict] = {}
    
    async def start_task(self, task_id: str, coro):
        task = asyncio.create_task(self._run_task(task_id, coro))
        self.tasks[task_id] = task
    
    async def _run_task(self, task_id: str, coro):
        self.results[task_id] = {"status": "running"}
        try:
            result = await coro
            self.results[task_id] = {"status": "completed", "result": result}
        except Exception as e:
            self.results[task_id] = {"status": "failed", "error": str(e)}
    
    def get_status(self, task_id: str):
        return self.results.get(task_id, {"status": "not_found"})

task_manager = TaskManager()

async def long_running_task(seconds: int):
    await asyncio.sleep(seconds)
    return f"Task completed after {seconds} seconds"

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # 关闭时取消所有任务
    for task in task_manager.tasks.values():
        task.cancel()

app = FastAPI(lifespan=lifespan)

import uuid

@app.post("/tasks/")
async def create_task(seconds: int = 5):
    task_id = str(uuid.uuid4())
    await task_manager.start_task(task_id, long_running_task(seconds))
    return {"task_id": task_id}

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    return task_manager.get_status(task_id)
\`\`\`

---

## 五、并发模式总结

| 工具 | 用途 | 错误处理 | 并发控制 |
|------|------|----------|----------|
| asyncio.gather | 并发多个协程并收集结果 | return_exceptions | 无（需配合Semaphore） |
| asyncio.wait | 灵活等待，支持多种完成条件 | 手动检查 | 无 |
| asyncio.Semaphore | 限制并发数 | - | 内置 |
| asyncio.Lock | 互斥访问共享资源 | - | 内置 |
| BackgroundTasks | 响应后后台任务 | 不影响响应 | 无 |
| TokenBucket | API限流 | - | 令牌桶算法 |
`
  },
  {
    id: "pyb-5-8",
    group: "ASGI与异步Web",
    icon: "⚡",
    title: "同步异步混合编程 - 在async中调用sync(run_in_executor)、在sync中调用async、线程池与事件循环协作",
    content: `

# 同步异步混合编程

## 一、为什么需要混合编程

在实际项目中，我们经常遇到：
1. 异步Web框架（FastAPI）但需要使用同步库（如某些ORM、旧SDK）
2. 同步代码中需要调用异步函数
3. CPU密集型任务会阻塞事件循环

Python提供了多种机制来处理同步异步互操作。

---

## 二、在async中调用sync代码

### 2.1 loop.run_in_executor - 核心方法

这是最标准的方法，将同步函数放到线程池/进程池中执行，不阻塞事件循环。

\`\`\`python
import asyncio
import time
import requests
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import functools

# 创建专用线程池（可选，默认使用全局线程池）
thread_pool = ThreadPoolExecutor(max_workers=10)
cpu_pool = ProcessPoolExecutor(max_workers=4)

async def fetch_url_sync(url):
    """将同步requests调用封装为异步"""
    loop = asyncio.get_running_loop()
    
    # 方式1: 使用默认线程池
    response = await loop.run_in_executor(
        None,  # None = 默认线程池
        requests.get,
        url
    )
    return response.text

async def fetch_url_with_pool(url):
    """使用自定义线程池"""
    loop = asyncio.get_running_loop()
    response = await loop.run_in_executor(
        thread_pool,
        functools.partial(requests.get, url, timeout=10)
    )
    return response.text

def cpu_bound_task(n):
    """CPU密集型：计算斐波那契"""
    if n <= 1:
        return n
    return cpu_bound_task(n - 1) + cpu_bound_task(n - 2)

async def run_cpu_bound(n):
    """CPU密集型任务用进程池（绕过GIL）"""
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        cpu_pool,
        cpu_bound_task,
        n
    )
    return result

async def main():
    # 并发调用多个同步函数
    urls = [
        "https://api.github.com",
        "https://api.github.com/users/python",
        "https://api.github.com/orgs/python",
    ]
    
    start = time.time()
    results = await asyncio.gather(*[
        fetch_url_sync(url) for url in urls
    ])
    print(f"Fetched {len(results)} URLs in {time.time() - start:.2f}s")
    
    # CPU密集型
    result = await run_cpu_bound(30)
    print(f"Fibonacci(30) = {result}")

asyncio.run(main())
\`\`\`

### 2.2 asgiref.sync - Django风格工具

asgiref是Django团队开发的工具包，提供sync_to_async和async_to_sync装饰器：

\`\`\`python
import asyncio
from asgiref.sync import sync_to_async, async_to_sync
import time

# 同步函数转异步
@sync_to_async
def sync_db_query(user_id):
    """模拟同步数据库查询"""
    time.sleep(0.5)
    return {"id": user_id, "name": f"User{user_id}"}

# thread_sensitive=True（默认）: 在同一个线程中运行（适合ORM）
@sync_to_async(thread_sensitive=True)
def django_orm_query(user_id):
    from django.contrib.auth.models import User
    return User.objects.get(id=user_id)

# 异步函数转同步（在同步代码中调用异步）
@async_to_sync
async def async_api_call(url):
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.json()

async def example():
    # 在async中调用sync函数
    user = await sync_db_query(1)
    print(f"User: {user}")

# 在sync中调用async函数
def sync_main():
    result = async_api_call("https://api.github.com")
    print(f"API result: {result}")

asyncio.run(example())
sync_main()
\`\`\`

### 2.3 封装同步库为异步

\`\`\`python
import asyncio
import sqlite3
from contextlib import asynccontextmanager

class AsyncSQLite:
    """简单的异步SQLite封装"""
    
    def __init__(self, db_path):
        self.db_path = db_path
        self._pool = ThreadPoolExecutor(max_workers=4)
    
    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    @asynccontextmanager
    async def connection(self):
        loop = asyncio.get_running_loop()
        conn = await loop.run_in_executor(self._pool, self._connect)
        try:
            yield conn
        finally:
            await loop.run_in_executor(self._pool, conn.close)
    
    async def execute(self, sql, params=()):
        async with self.connection() as conn:
            loop = asyncio.get_running_loop()
            def _exec():
                cur = conn.execute(sql, params)
                conn.commit()
                return cur.lastrowid
            return await loop.run_in_executor(self._pool, _exec)
    
    async def fetchall(self, sql, params=()):
        async with self.connection() as conn:
            loop = asyncio.get_running_loop()
            def _query():
                cur = conn.execute(sql, params)
                return [dict(row) for row in cur.fetchall()]
            return await loop.run_in_executor(self._pool, _query)

# 使用
async def demo():
    db = AsyncSQLite("test.db")
    await db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)")
    await db.execute("INSERT INTO users(name) VALUES (?)", ("Alice",))
    users = await db.fetchall("SELECT * FROM users")
    print(users)

asyncio.run(demo())
\`\`\`

---

## 三、在sync中调用async代码

### 3.1 asyncio.run（简单场景）

\`\`\`python
import asyncio

async def async_hello(name):
    await asyncio.sleep(0.1)
    return f"Hello {name}!"

# 在同步代码中调用
def sync_function():
    # 方式1: asyncio.run（Python 3.7+）
    result = asyncio.run(async_hello("World"))
    print(result)
    
    # 注意：如果已有运行中的事件循环，asyncio.run会报错！

sync_function()
\`\`\`

### 3.2 处理已有事件循环的情况

\`\`\`python
import asyncio
from typing import Coroutine, Any

def run_async(coro: Coroutine) -> Any:
    """在任何环境下安全运行异步函数"""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    
    if loop and loop.is_running():
        # 已有运行中的循环（如在Jupyter或已有asyncio.run中）
        # 创建新的事件循环在新线程中运行
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(asyncio.run, coro)
            return future.result()
    else:
        # 没有运行中的循环，直接run
        return asyncio.run(coro)

async def my_async_func():
    await asyncio.sleep(0.1)
    return "Done"

# 安全使用
result = run_async(my_async_func())
print(result)
\`\`\`

---

## 四、线程池与事件循环协作模式

### 4.1 生产者-消费者模式

\`\`\`python
import asyncio
from concurrent.futures import ThreadPoolExecutor
import queue
import time

async def async_producer(q: asyncio.Queue, items):
    """异步生产者：从网络获取数据放入队列"""
    for item in items:
        await asyncio.sleep(0.1)
        await q.put(item)
        print(f"Produced: {item}")
    await q.put(None)  # 结束信号

def sync_consumer(input_q: queue.Queue, output_q: queue.Queue):
    """同步消费者：CPU密集型处理"""
    while True:
        item = input_q.get()
        if item is None:
            output_q.put(None)
            break
        # 模拟CPU密集处理
        time.sleep(0.2)
        result = f"Processed: {item}"
        output_q.put(result)

async def async_result_collector(output_q: queue.Queue):
    """异步收集结果"""
    results = []
    loop = asyncio.get_running_loop()
    while True:
        # 在线程池中执行阻塞的queue.get
        result = await loop.run_in_executor(None, output_q.get)
        if result is None:
            break
        results.append(result)
        print(f"Collected: {result}")
    return results

async def hybrid_pipeline():
    input_q = queue.Queue(maxsize=10)
    output_q = queue.Queue()
    
    producer_task = asyncio.create_task(
        async_producer(asyncio.Queue(), list(range(10)))
    )
    
    # 在单独线程运行同步消费者
    with ThreadPoolExecutor(max_workers=2) as pool:
        # 桥接async queue到sync queue
        async def bridge():
            aq = asyncio.Queue()
            await async_producer(aq, list(range(10)))
            while True:
                item = await aq.get()
                await loop.run_in_executor(None, input_q.put, item)
                if item is None:
                    break
        
        loop = asyncio.get_running_loop()
        consumer_future = loop.run_in_executor(
            pool, sync_consumer, input_q, output_q
        )
        bridge_task = asyncio.create_task(bridge())
        
        results = await async_result_collector(output_q)
        await consumer_future
        await bridge_task
        
        print(f"Total results: {len(results)}")

asyncio.run(hybrid_pipeline())
\`\`\`

---

## 五、常见坑点与最佳实践

### 5.1 常见错误

\`\`\`python
import asyncio

# ❌ 错误1: 在async中直接调用阻塞函数
async def bad():
    time.sleep(5)  # 阻塞整个事件循环！所有请求卡住
    requests.get("https://example.com")  # 同样阻塞！

# ✅ 正确: 用run_in_executor
async def good():
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, time.sleep, 5)  # 不阻塞

# ❌ 错误2: 在已有事件循环中调用asyncio.run
async def outer():
    asyncio.run(async_func())  # 报错！已有运行中的循环

# ❌ 错误3: 在线程池中调用协程
def bad_in_thread():
    await some_async_func()  # 在线程中没有事件循环！

# ✅ 正确: 在线程中创建新的事件循环
def in_thread():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(some_async_func())
    finally:
        loop.close()
\`\`\`

### 5.2 性能最佳实践

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| IO密集型同步库 | run_in_executor + ThreadPoolExecutor | 线程池处理IO等待，开销小 |
| CPU密集型任务 | run_in_executor + ProcessPoolExecutor | 绕过GIL，多核并行 |
| Django ORM/FastAPI DB | @sync_to_async(thread_sensitive=True) | 正确处理线程绑定的连接 |
| 频繁调用的小同步函数 | 封装后批量处理 | 减少线程切换开销 |
| 完全异步的库 | 直接用原生async/await | 性能最好 |

### 5.3 检测阻塞代码

\`\`\`python
import asyncio
import logging

# 开启asyncio debug模式检测阻塞
import os
os.environ['PYTHONASYNCIODEBUG'] = '1'

logging.basicConfig(level=logging.WARNING)

async def test_blocking():
    await asyncio.sleep(0.1)
    import time
    time.sleep(0.2)  # 会打印警告：Executing <Handle ...> took 0.202 seconds

asyncio.run(test_blocking(), debug=True)
# 会输出类似：WARNING:asyncio:Executing <Handle ...> took 0.200 seconds
\`\`\`
`
  }
]


