// =============================================================
// Python 后端章节 - 第 4 批（WSGI协议详解 8 章）
// =============================================================

export const chapters = [
  {
    id: "pyb-4-1",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "WSGI协议规范 - PEP3333规范解读、environ字典、start_response回调、WSGI应用Callable",
    content: `

# WSGI协议规范详解

## 一、WSGI 是什么

### 1.1 WSGI 的定义

WSGI（Web Server Gateway Interface，Web服务器网关接口）是Python语言中Web服务器和Web应用程序/框架之间的标准接口规范，定义在PEP 3333。

核心思想：解耦Web服务器和Web应用，使得符合WSGI规范的服务器可以运行任何符合WSGI规范的应用。

| 层级 | 组件 | 常见实现 |
|------|------|---------|
| Web服务器 | 反向代理、静态文件 | Nginx、Apache |
| WSGI服务器 | 实现WSGI协议 | Gunicorn、uWSGI |
| WSGI应用 | 业务逻辑 | Flask、Django |

### 1.2 WSGI 应用 Callable

WSGI应用是一个可调用对象，接受两个参数：

\`\`\`python
def application(environ, start_response):
    status = '200 OK'
    headers = [('Content-Type', 'text/plain; charset=utf-8')]
    start_response(status, headers)
    return [b'Hello, World!']
\`\`\`

必须满足：
1. 接受environ（字典）和start_response（回调）
2. 调用start_response(status, headers)
3. 返回bytes类型的可迭代对象

### 1.3 environ 字典详解

environ包含所有请求信息：

| 变量 | 说明 | 示例 |
|------|------|------|
| REQUEST_METHOD | HTTP方法 | 'GET' |
| PATH_INFO | 请求路径 | '/hello' |
| QUERY_STRING | 查询字符串 | 'name=test' |
| CONTENT_TYPE | 请求体类型 | 'application/json' |
| HTTP_HOST | Host头 | 'localhost:8000' |
| HTTP_USER_AGENT | UA | 'Mozilla/5.0' |
| wsgi.input | 请求体输入流 | 类文件对象 |
| wsgi.errors | 错误流 | sys.stderr |

HTTP头部通过HTTP_前缀传递，如HTTP_AUTHORIZATION。

### 1.4 start_response 回调

\`\`\`python
def start_response(status, response_headers, exc_info=None):
    pass
\`\`\`

- status：如'200 OK'、'404 Not Found'
- response_headers：[(header_name, header_value), ...]
- exc_info：异常信息元组，用于错误处理

### 1.5 第一个WSGI应用

\`\`\`python
from wsgiref.simple_server import make_server

def app(environ, start_response):
    path = environ['PATH_INFO']
    method = environ['REQUEST_METHOD']
    
    if path == '/':
        body = b'<h1>Home</h1>'
    elif path == '/hello':
        from urllib.parse import parse_qs
        qs = parse_qs(environ.get('QUERY_STRING', ''))
        name = qs.get('name', ['World'])[0]
        body = f'<h1>Hello, {name}!</h1>'.encode('utf-8')
    else:
        body = b'<h1>404 Not Found</h1>'
        start_response('404 Not Found', [('Content-Type', 'text/html')])
        return [body]
    
    start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
    return [body]

if __name__ == '__main__':
    server = make_server('localhost', 8000, app)
    print('Serving on http://localhost:8000')
    server.serve_forever()
\`\`\`

## 二、常见坑点

1. **响应体必须是bytes**：str需要.encode('utf-8')
2. **Content-Type指定charset**：否则可能乱码
3. **start_response调用时机**：必须在返回可迭代对象之前调用
4. **CONTENT_LENGTH可能为空**：需要try/except处理
5. **PATH_INFO可能URL编码**：需要unquote解码

## 三、面试常见问题

**Q: 什么是WSGI？**
A: WSGI是Python Web服务器和应用之间的标准接口，定义在PEP 3333，实现了服务器和框架的解耦。应用是一个接受environ和start_response的callable，返回bytes可迭代对象。

**Q: 为什么响应体需要是bytes？**
A: HTTP传输字节流，Python 3严格区分str和bytes，避免编码问题。

\`\`\`python
# 错误
return ['Hello']  # TypeError
# 正确
return [b'Hello']
\`\`\`
`
  },
  {
    id: "pyb-4-2",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "手写WSGI应用 - 从零实现WSGI app、中间件Middleware模式、wsgiref模块源码分析",
    content: `

# 手写WSGI应用与中间件模式

## 一、从零实现WSGI框架

### 1.1 简单路由框架

\`\`\`python
import re
from urllib.parse import parse_qs

class MiniWeb:
    def __init__(self):
        self.routes = {}
    
    def route(self, path, methods=['GET']):
        def decorator(func):
            for method in methods:
                self.routes[(method, path)] = func
            return func
        return decorator
    
    def __call__(self, environ, start_response):
        request = Request(environ)
        handler = None
        
        for (method, pattern), func in self.routes.items():
            if method != request.method:
                continue
            regex = re.sub(r'\\{(\\w+)\\}', r'(?P<\\1>[^/]+)', pattern)
            match = re.match(f'^{regex}$', request.path)
            if match:
                request.params = match.groupdict()
                handler = func
                break
        
        if handler is None:
            return self._response(start_response, '404 Not Found', b'Not Found')
        
        try:
            resp = handler(request)
            if isinstance(resp, str):
                resp = resp.encode('utf-8')
            return self._response(start_response, '200 OK', resp)
        except Exception as e:
            return self._response(start_response, '500 Internal Server Error', str(e).encode())
    
    def _response(self, start_response, status, body, content_type='text/html; charset=utf-8'):
        start_response(status, [('Content-Type', content_type)])
        return [body]

class Request:
    def __init__(self, environ):
        self.environ = environ
        self.method = environ['REQUEST_METHOD']
        self.path = environ['PATH_INFO']
        self.params = {}
        qs = environ.get('QUERY_STRING', '')
        self.query = {k: v[0] if len(v)==1 else v for k,v in parse_qs(qs).items()}
    
    @property
    def json(self):
        import json
        length = int(self.environ.get('CONTENT_LENGTH', 0) or 0)
        if length:
            return json.loads(self.environ['wsgi.input'].read(length))
        return {}
\`\`\`

### 1.2 使用框架

\`\`\`python
app = MiniWeb()

@app.route('/')
def index(req):
    return '<h1>MiniWeb</h1>'

@app.route('/user/{id}')
def user(req):
    return f'<h1>User: {req.params["id"]}</h1>'

@app.route('/api/data', methods=['GET', 'POST'])
def api(req):
    import json
    return json.dumps({'method': req.method, 'query': req.query})
\`\`\`

## 二、中间件模式

### 2.1 中间件原理

中间件是装饰器，接受app返回新app：

\`\`\`
请求 → 中间件1 → 中间件2 → app → 中间件2 → 中间件1 → 响应
\`\`\`

### 2.2 日志中间件

\`\`\`python
import time

def log_middleware(app):
    def middleware(environ, start_response):
        t = time.time()
        path = environ['PATH_INFO']
        method = environ['REQUEST_METHOD']
        
        status_list = []
        def custom_start(status, headers, exc_info=None):
            status_list.append(status)
            return start_response(status, headers, exc_info)
        
        result = app(environ, custom_start)
        
        def generate():
            for chunk in result:
                yield chunk
            ms = (time.time() - t) * 1000
            status = status_list[0] if status_list else '?'
            print(f'{method} {path} {status} {ms:.1f}ms')
        
        return generate()
    return middleware

app = log_middleware(app)
\`\`\`

### 2.3 认证中间件

\`\`\`python
def auth_middleware(app, exclude=None):
    exclude = exclude or ['/login', '/']
    def middleware(environ, start_response):
        path = environ['PATH_INFO']
        if any(path.startswith(e) for e in exclude):
            return app(environ, start_response)
        
        auth = environ.get('HTTP_AUTHORIZATION', '')
        if not auth.startswith('Bearer '):
            start_response('401 Unauthorized', [('Content-Type', 'application/json')])
            return [b'{"error":"Unauthorized"}']
        
        token = auth[7:]
        environ['user'] = verify_token(token)
        return app(environ, start_response)
    return middleware
\`\`\`

### 2.4 链式调用

\`\`\`python
app = MiniWeb()
app = log_middleware(app)
app = cors_middleware(app)
app = auth_middleware(app, exclude=['/', '/login'])
\`\`\`

## 三、wsgiref源码分析

wsgiref.simple_server核心是：
1. WSGIServer：监听端口，接受连接
2. WSGIRequestHandler：解析HTTP，构建environ
3. SimpleHandler：调用WSGI app，处理响应

Sync worker一次处理一个请求，wsgiref仅供开发使用。
`
  },
  {
    id: "pyb-4-3",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "WSGI服务器原理 - Gunicorn/uWSGI架构、pre-fork worker模型、同步服务器工作原理",
    content: `

# WSGI服务器原理与架构

## 一、Pre-fork Worker模型

### 1.1 架构图

\`\`\`
Master进程 (管理)
├── Worker 1 (处理请求)
├── Worker 2 (处理请求)
├── Worker 3 (处理请求)
└── Worker 4 (处理请求)
\`\`\`

Master职责：
- 监听socket
- fork/监控/重启worker
- 处理信号（重载、关闭）

Worker职责：
- 接受连接
- 解析HTTP
- 调用WSGI应用
- 返回响应

### 1.2 Pre-fork简化实现

\`\`\`python
import os, socket, select

def prefork_server(app, host='127.0.0.1', port=8000, num_workers=4):
    sock = socket.socket()
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((host, port))
    sock.listen(128)
    print(f'Listening on {host}:{port} with {num_workers} workers')
    
    workers = {}
    for i in range(num_workers):
        pid = os.fork()
        if pid == 0:
            worker_loop(sock, app)
            os._exit(0)
        workers[pid] = i
    
    while True:
        pid, _ = os.wait()
        if pid in workers:
            new_pid = os.fork()
            if new_pid == 0:
                worker_loop(sock, app)
                os._exit(0)
            workers[new_pid] = workers.pop(pid)

def worker_loop(sock, app):
    while True:
        client, addr = sock.accept()
        handle_request(client, app)
        client.close()
\`\`\`

### 1.3 为什么Pre-fork？

- Python有GIL，多线程无法利用多核
- 多进程真正并行
- 进程隔离，一个崩溃不影响其他
- Copy-on-Write节省内存

## 二、Gunicorn架构

- Arbiter(Master)：管理进程
- SyncWorker：同步，一次一个请求
- GeventWorker：协程，高并发
- EventletWorker：类似gevent
- GthreadWorker：多线程

sync worker数 = 2 * CPU核数 + 1

## 三、生产部署架构

\`\`\`
客户端 → Nginx → (UNIX Socket) → Gunicorn/uWSGI → WSGI App → DB
\`\`\`

Nginx的作用：
1. 静态文件（sendfile零拷贝）
2. SSL终端
3. 缓冲慢客户端
4. 负载均衡
5. 限流、安全

## 四、Sync Worker局限

4个sync worker，每个请求等待DB 100ms：
- 最大QPS = 4 * (1000/100) = 40
- 慢请求阻塞快请求

解决方案：
- 增加worker数
- 使用gevent协程
- 长任务异步化（Celery）

| Worker类型 | 并发模型 | 适用场景 |
|-----------|---------|---------|
| sync | 同步1:1 | CPU密集、短请求 |
| gevent | greenlet协程 | IO密集、高并发 |
| gthread | 多线程 | IO密集、不兼容gevent |
`
  },
  {
    id: "pyb-4-4",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "Gunicorn深度配置 - worker类型(sync/gevent/eventlet)、worker数量计算、timeout配置、优雅重启",
    content: `

# Gunicorn深度配置

## 一、基础配置

### 1.1 配置文件

\`\`\`python
# gunicorn.conf.py
import multiprocessing

bind = 'unix:/tmp/gunicorn.sock'
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
threads = 2
timeout = 30
graceful_timeout = 30
keepalive = 5
preload_app = True
max_requests = 10000
max_requests_jitter = 1000
accesslog = '-'
errorlog = '-'
loglevel = 'info'
proc_name = 'myapp'
\`\`\`

启动：\`gunicorn -c gunicorn.conf.py myapp:app\`

### 1.2 Worker数量计算

| CPU核数 | sync workers | 最大QPS(100ms/请求) |
|---------|-------------|-------------------|
| 2 | 5 | 50 |
| 4 | 9 | 90 |
| 8 | 17 | 170 |

Gevent：workers = CPU核数，单worker可处理上千并发

## 二、Worker类型详解

### 2.1 Sync Worker
- 默认，最简单稳定
- 一次处理一个请求
- CPU密集型首选
- 慢请求阻塞问题

### 2.2 Gevent Worker

\`\`\`bash
pip install gevent
gunicorn -k gevent --worker-connections=1000 myapp:app
\`\`\`

- monkey patch阻塞IO为非阻塞
- 单worker高并发
- IO密集型首选

注意：
- monkey.patch_all()要在所有import前
- C扩展可能不兼容
- CPU密集无优势

### 2.3 Gthread Worker

\`\`\`bash
gunicorn -k gthread --threads=4 myapp:app
\`\`\`

- 多线程，总并发=workers*threads
- 不需要monkey patch
- 受GIL限制，IO密集有效

## 三、Timeout配置

- timeout：请求超时，默认30s，worker被杀重启
- graceful_timeout：优雅关闭等待时间
- keepalive：HTTP keep-alive超时

慢请求排查：
1. 检查access log响应时间
2. 数据库慢查询
3. 外部API超时
4. 长任务改异步

Nginx超时要和Gunicorn匹配：
\`\`\`nginx
proxy_read_timeout 60s;
proxy_connect_timeout 30s;
\`\`\`

## 四、优雅重启

信号控制：
- SIGHUP：优雅重启（重载代码）
- SIGTERM：优雅关闭
- SIGUSR1：重新打开日志
- SIGTTIN/SIGTTOU：增减worker

\`\`\`bash
kill -HUP $(cat gunicorn.pid)
systemctl reload myapp
\`\`\`

流程：
1. Master启动新worker（新代码）
2. 旧worker停止接受新请求
3. 旧worker处理完现有请求后退出
4. 全部切换完成

max_requests：处理N个请求后重启worker，防内存泄漏。
`
  },
  {
    id: "pyb-4-5",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "uWSGI配置与优化 - ini配置文件、uWSGI与Nginx交互、Master/Worker模式、性能调优参数",
    content: `

# uWSGI配置与优化

## 一、uWSGI基础配置

### 1.1 INI配置文件

\`\`\`ini
[uwsgi]
socket = /tmp/uwsgi.sock
chmod-socket = 666
chdir = /path/to/project
home = /path/to/venv
module = myapp:app

master = true
processes = 4
threads = 2
enable-threads = true
thunder-lock = true

harakiri = 30
harakiri-verbose = true
max-requests = 10000
vacuum = true

logto = /var/log/uwsgi/app.log
pidfile = /tmp/uwsgi.pid
\`\`\`

启动：\`uwsgi --ini uwsgi.ini\`

### 1.2 uWSGI vs Gunicorn

| 特性 | uWSGI | Gunicorn |
|------|-------|---------|
| 实现 | C | Python |
| 性能 | 极高 | 良好 |
| 功能 | 丰富(缓存/队列) | 基础 |
| 配置 | 复杂 | 简单 |

## 二、uWSGI与Nginx交互

### 2.1 uwsgi协议

uWSGI自定义二进制协议，比HTTP解析快：

\`\`\`nginx
upstream uwsgi_backend {
    server unix:///tmp/uwsgi.sock;
}

location / {
    uwsgi_pass uwsgi_backend;
    include uwsgi_params;
    uwsgi_param Host $host;
    uwsgi_param X-Real-IP $remote_addr;
    uwsgi_read_timeout 60s;
}
\`\`\`

### 2.2 Offload线程

\`\`\`ini
offload-threads = 4
static-map = /static=/path/to/static
static-expires = /* 3600
\`\`\`

静态文件由offload线程处理，不占用worker。

## 三、高级功能

### 3.1 Mule后台进程

\`\`\`ini
mule = myapp.mule:worker
\`\`\`

\`\`\`python
# 在web中发送任务
import uwsgi
uwsgi.mule_msg("task data")
\`\`\`

### 3.2 Spooler异步队列

\`\`\`ini
spooler = /var/spool/uwsgi
spooler-processes = 2
import = myapp.tasks
\`\`\`

\`\`\`python
from uwsgidecorators import spool

@spool
def heavy_task(args):
    process(args)
    return uwsgi.SPOOL_OK

heavy_task.spool({'id': 123})
\`\`\`

### 3.3 共享缓存

\`\`\`ini
cache2 = name=mycache,items=1000,blocks=100
\`\`\`

\`\`\`python
import uwsgi, json
uwsgi.cache_set('key', json.dumps(data), 300, 'mycache')
data = json.loads(uwsgi.cache_get('key', 'mycache'))
\`\`\`

## 四、性能调优

\`\`\`ini
listen = 4096
tcp-nodelay = true
sendfile = true
reuse-port = true
reload-on-rss = 256
memory-report = true
\`\`\`

内核参数：
\`\`\`bash
net.core.somaxconn = 4096
net.ipv4.tcp_tw_reuse = 1
fs.file-max = 1000000
\`\`\`

信号：
- SIGHUP：优雅重启
- SIGUSR2：日志切割
- SIGTERM：优雅关闭
`
  },
  {
    id: "pyb-4-6",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "WSGI中间件开发 - 中间件链式调用、日志中间件、认证中间件、CORS中间件实现",
    content: `

# WSGI中间件开发实战

## 一、中间件原理

中间件是装饰器：接受app，返回新app，形成洋葱模型。

\`\`\`python
def middleware(app):
    def new_app(environ, start_response):
        # 请求前
        response = app(environ, start_response)
        # 响应后
        return response
    return new_app
\`\`\`

链式调用：\`app = m1(m2(m3(app)))\`

## 二、常用中间件实现

### 2.1 CORS跨域中间件

\`\`\`python
def cors_middleware(app, allow_origins=None):
    allow_origins = allow_origins or ['*']
    
    def middleware(environ, start_response):
        origin = environ.get('HTTP_ORIGIN', '')
        
        if environ['REQUEST_METHOD'] == 'OPTIONS':
            headers = [
                ('Content-Type', 'text/plain'),
                ('Content-Length', '0'),
                ('Access-Control-Allow-Origin', origin if origin in allow_origins else '*'),
                ('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type,Authorization'),
                ('Access-Control-Max-Age', '86400'),
            ]
            start_response('200 OK', headers)
            return [b'']
        
        def custom_start(status, headers, exc_info=None):
            headers.append(('Access-Control-Allow-Origin', origin or '*'))
            return start_response(status, headers, exc_info)
        
        return app(environ, custom_start)
    
    return middleware
\`\`\`

### 2.2 Gzip压缩中间件

\`\`\`python
import gzip

def gzip_middleware(app, min_size=200):
    def middleware(environ, start_response):
        accept_encoding = environ.get('HTTP_ACCEPT_ENCODING', '')
        if 'gzip' not in accept_encoding:
            return app(environ, start_response)
        
        response_body = []
        status_headers = [None, None]
        
        def custom_start(status, headers, exc_info=None):
            status_headers[0] = status
            status_headers[1] = list(headers)
            return lambda data: response_body.append(data)
        
        app(environ, custom_start)
        
        body = b''.join(response_body)
        if len(body) >= min_size:
            compressed = gzip.compress(body)
            headers = status_headers[1]
            headers = [h for h in headers if h[0].lower() != 'content-length']
            headers.append(('Content-Encoding', 'gzip'))
            headers.append(('Content-Length', str(len(compressed))))
            start_response(status_headers[0], headers)
            return [compressed]
        
        start_response(status_headers[0], status_headers[1])
        return [body]
    
    return middleware
\`\`\`

### 2.3 Session中间件

\`\`\`python
import secrets, json
from http import cookies

class SessionMiddleware:
    def __init__(self, app, cookie_name='session', max_age=86400):
        self.app = app
        self.cookie_name = cookie_name
        self.max_age = max_age
        self.sessions = {}
    
    def __call__(self, environ, start_response):
        cookie_str = environ.get('HTTP_COOKIE', '')
        C = cookies.SimpleCookie()
        C.load(cookie_str)
        session_id = C[self.cookie_name].value if self.cookie_name in C else secrets.token_hex(32)
        
        environ['session'] = self.sessions.setdefault(session_id, {})
        
        def custom_start(status, headers, exc_info=None):
            cookie = cookies.SimpleCookie()
            cookie[self.cookie_name] = session_id
            cookie[self.cookie_name]['max-age'] = self.max_age
            cookie[self.cookie_name]['path'] = '/'
            headers.append(('Set-Cookie', cookie[self.cookie_name].OutputString(header='').strip()))
            return start_response(status, headers, exc_info)
        
        return self.app(environ, custom_start)
\`\`\`

## 三、中间件开发最佳实践

1. 始终调用下一层app（除非短路）
2. 包装响应迭代器时实现close()
3. 不修改传入的environ，创建副本
4. 正确处理exc_info参数
5. 避免阻塞操作

## 四、常用第三方中间件

- Werkzeug：DebuggedApplication、SharedDataMiddleware
- Paste：translogger、cascade、urlmap
- Whitenoise：静态文件服务
- Flask-CORS：Flask的CORS中间件
`
  },
  {
    id: "pyb-4-7",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "请求响应封装 - Werkzeug库分析、Request/Response对象设计、URL路由匹配原理",
    content: `

# 请求响应封装与Werkzeug

## 一、Werkzeug库简介

Werkzeug是Flask的核心依赖，提供WSGI工具集：
- Request/Response对象封装
- 路由系统
- 调试器
- 中间件
- HTTP工具函数

## 二、Request对象设计

### 2.1 基础封装

\`\`\`python
from io import BytesIO
from urllib.parse import parse_qs, parse_qsl
import json

class Request:
    def __init__(self, environ):
        self.environ = environ
        self.method = environ['REQUEST_METHOD']
        self.path = environ.get('PATH_INFO', '/')
        self.script_name = environ.get('SCRIPT_NAME', '')
        self.query_string = environ.get('QUERY_STRING', '')
        self.content_type = environ.get('CONTENT_TYPE', '')
        self.content_length = self._get_content_length()
        self._body = None
        self._json = None
        self._form = None
        self._args = None
    
    def _get_content_length(self):
        try:
            return int(self.environ.get('CONTENT_LENGTH', 0))
        except (TypeError, ValueError):
            return 0
    
    @property
    def args(self):
        if self._args is None:
            self._args = {}
            for k, v in parse_qs(self.query_string).items():
                self._args[k] = v[0] if len(v) == 1 else v
        return self._args
    
    @property
    def data(self):
        if self._body is None:
            self._body = self.environ['wsgi.input'].read(self.content_length) if self.content_length else b''
        return self._body
    
    @property
    def json(self):
        if self._json is None:
            try:
                self._json = json.loads(self.data.decode('utf-8'))
            except:
                self._json = {}
        return self._json
    
    @property
    def form(self):
        if self._form is None:
            self._form = {}
            if 'application/x-www-form-urlencoded' in self.content_type:
                for k, v in parse_qs(self.data.decode()).items():
                    self._form[k] = v[0] if len(v) == 1 else v
        return self._form
    
    @property
    def cookies(self):
        from http.cookies import SimpleCookie
        cookie = SimpleCookie()
        cookie.load(self.environ.get('HTTP_COOKIE', ''))
        return {k: m.value for k, m in cookie.items()}
    
    @property
    def headers(self):
        headers = {}
        for k, v in self.environ.items():
            if k.startswith('HTTP_'):
                name = k[5:].replace('_', '-').title()
                headers[name] = v
        return headers
    
    def get_data(self, cache=True):
        return self.data if cache else self.environ['wsgi.input'].read(self.content_length)
\`\`\`

## 三、Response对象设计

\`\`\`python
from http.cookies import SimpleCookie
import json

class Response:
    charset = 'utf-8'
    default_mimetype = 'text/html'
    
    def __init__(self, response=None, status=200, headers=None, mimetype=None, content_type=None):
        self.status_code = status
        self.headers = {}
        if content_type is None:
            mimetype = mimetype or self.default_mimetype
            content_type = f'{mimetype}; charset={self.charset}'
        self.headers['Content-Type'] = content_type
        if headers:
            self.headers.update(headers)
        
        if response is None:
            response = b''
        if isinstance(response, str):
            response = response.encode(self.charset)
        if isinstance(response, bytes):
            self.response = [response]
        else:
            self.response = response
        
        self._cookies = None
    
    @property
    def status(self):
        return f'{self.status_code} {self.status_codes.get(self.status_code, "Unknown")}'
    
    status_codes = {
        200: 'OK', 201: 'Created', 301: 'Moved Permanently',
        302: 'Found', 400: 'Bad Request', 401: 'Unauthorized',
        403: 'Forbidden', 404: 'Not Found', 500: 'Internal Server Error',
    }
    
    def set_cookie(self, key, value='', max_age=None, expires=None, path='/',
                   domain=None, secure=False, httponly=False, samesite=None):
        cookie = SimpleCookie()
        cookie[key] = value
        if max_age is not None:
            cookie[key]['max-age'] = str(max_age)
        if path:
            cookie[key]['path'] = path
        if domain:
            cookie[key]['domain'] = domain
        if secure:
            cookie[key]['secure'] = True
        if httponly:
            cookie[key]['httponly'] = True
        self.headers['Set-Cookie'] = cookie[key].OutputString(header='').strip()
    
    def delete_cookie(self, key, path='/', domain=None):
        self.set_cookie(key, '', max_age=0, path=path, domain=domain)
    
    @classmethod
    def json(cls, data, status=200):
        body = json.dumps(data, ensure_ascii=False)
        return cls(body, status=status, mimetype='application/json')
    
    @classmethod
    def redirect(cls, location, status=302):
        resp = cls('', status=status)
        resp.headers['Location'] = location
        return resp
    
    def __call__(self, environ, start_response):
        body = b''.join(self.response) if not isinstance(self.response, list) else b''.join(self.response)
        self.headers['Content-Length'] = str(len(body))
        headers_list = [(k, v) for k, v in self.headers.items()]
        start_response(self.status, headers_list)
        return [body]
\`\`\`

## 四、URL路由匹配

### 4.1 简单路由

\`\`\`python
import re

class Router:
    def __init__(self):
        self.routes = []
    
    def add(self, method, path, handler):
        pattern = re.sub(r'<(\\w+)>', r'(?P<\\1>[^/]+)', path)
        pattern = f'^{pattern}$'
        self.routes.append((method, re.compile(pattern), handler))
    
    def match(self, method, path):
        for m, pattern, handler in self.routes:
            if m != method and m != 'ANY':
                continue
            match = pattern.match(path)
            if match:
                return handler, match.groupdict()
        return None, None
    
    def route(self, path, methods=['GET']):
        def decorator(f):
            for m in methods:
                self.add(m, path, f)
            return f
        return decorator

router = Router()

@router.route('/user/<id>')
def user_detail(request, id):
    return Response(f'User {id}')
\`\`\`

### 4.2 Werkzeug路由特点

Werkzeug的Map/Rule系统支持：
- 转换器（int/float/path/uuid）
- URL构建（url_for）
- 子域名匹配
- 方法调度
`
  },
  {
    id: "pyb-4-8",
    group: "WSGI协议详解",
    icon: "🔧",
    title: "WSGI生态工具 - 路由库、模板引擎、表单处理、文件上传、WSGI调试工具",
    content: `

# WSGI生态工具

## 一、路由库

### 1.1 Werkzeug Routing

\`\`\`python
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import NotFound

url_map = Map([
    Rule('/', endpoint='index'),
    Rule('/user/<int:user_id>', endpoint='user'),
    Rule('/post/<slug>', endpoint='post'),
])

def app(environ, start_response):
    urls = url_map.bind_to_environ(environ)
    try:
        endpoint, args = urls.match()
    except NotFound:
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'Not Found']
    
    if endpoint == 'index':
        body = b'Home'
    elif endpoint == 'user':
        body = f'User {args["user_id"]}'.encode()
    else:
        body = f'Post {args["slug"]}'.encode()
    
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [body]
\`\`\`

### 1.2 Routes库

\`\`\`python
from routes import Mapper

map = Mapper()
map.connect('home', '/', controller='home', action='index')
map.connect('user', '/user/{id}', controller='user', action='show')

result = map.match('/user/123')
# {'controller': 'user', 'action': 'show', 'id': '123'}
\`\`\`

## 二、模板引擎

### 2.1 Jinja2

\`\`\`python
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader('templates'))
template = env.get_template('index.html')
html = template.render(title='Hello', items=['a', 'b', 'c'])

# templates/index.html
# <html><body>
# <h1>{{ title }}</h1>
# {% for item in items %}<p>{{ item }}</p>{% endfor %}
# </body></html>
\`\`\`

### 2.2 Mako

\`\`\`python
from mako.template import Template

t = Template('<h1>\${name}</h1>')
print(t.render(name='World'))
\`\`\`

## 三、表单处理与文件上传

### 3.1 multipart/form-data解析

\`\`\`python
import cgi

def parse_form(environ):
    form = cgi.FieldStorage(
        fp=environ['wsgi.input'],
        environ=environ,
        keep_blank_values=True
    )
    
    data = {}
    files = {}
    for key in form.keys():
        item = form[key]
        if item.filename:
            files[key] = {
                'filename': item.filename,
                'content': item.file.read(),
                'type': item.type,
            }
        else:
            data[key] = item.value
    return data, files
\`\`\`

### 3.2 推荐库：python-multipart

\`\`\`python
from multipart import MultipartParser, parse_options_header

content_type = environ.get('CONTENT_TYPE', '')
ctype, options = parse_options_header(content_type)
if 'multipart/form-data' in ctype:
    parser = MultipartParser(
        environ['wsgi.input'],
        boundary=options.get('boundary', '').encode(),
        content_length=int(environ.get('CONTENT_LENGTH', 0) or 0)
    )
    for part in parser:
        print(part.name, part.filename, part.value)
\`\`\`

## 四、WSGI调试工具

### 4.1 Werkzeug Debugger

\`\`\`python
from werkzeug.debug import DebuggedApplication

def app(environ, start_response):
    if environ['PATH_INFO'] == '/error':
        raise ValueError('Oops!')
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'OK']

app = DebuggedApplication(app, evalex=True)
\`\`\`

提供交互式调试器，浏览器中查看错误栈、执行代码。

### 4.2 wsgiref.validate验证器

\`\`\`python
from wsgiref.validate import validator

@validator
def app(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'Hello']
\`\`\`

检查WSGI合规性，返回str而非bytes会报错。

### 4.3 开发服务器

\`\`\`python
from werkzeug.serving import run_simple

run_simple('localhost', 8000, app, use_reloader=True, use_debugger=True)
\`\`\`

### 4.4 其他调试工具

- django-debug-toolbar：Django调试面板
- flask-debugtoolbar：Flask版本
- py-spy：Python进程采样分析
- pytest + requests：接口测试

## 五、实用工具库

| 库 | 用途 |
|-----|------|
| Werkzeug | WSGI工具集、Request/Response |
| Jinja2 | 模板引擎 |
| Whitenoise | WSGI静态文件服务 |
| python-multipart | 表单/文件上传解析 |
| WebOb | Request/Response对象 |
| Paste | WSGI工具、中间件 |
| waitress | 纯Python WSGI服务器（生产可用） |
| gunicorn | 最流行的WSGI服务器 |
| uWSGI | 高性能WSGI服务器 |

## 六、生产部署工具

- systemd：进程管理
- gunicorn/uWSGI：WSGI服务器
- Nginx：反向代理
- Sentry：错误监控
- Prometheus + Grafana：指标监控
- ELK/Loki：日志收集
`
  }
]
