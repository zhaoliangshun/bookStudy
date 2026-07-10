// Python 部署与运维教程 - 第 7 批章节
// 主题：Gunicorn 与 Uvicorn
// ES module，导出 chapters 数组

export const chapters = [
  {
    id: "deploy-gunicorn-intro",
    icon: "🔫",
    title: "Gunicorn 简介与配置",
    group: "Gunicorn 与 Uvicorn",
    content: `# Gunicorn 简介与配置

## 一、Gunicorn 是什么

### 1.1 WSGI HTTP Server 概念

**Gunicorn**（Green Unicorn）是一个用 Python 编写的 **WSGI HTTP Server**，用于将 HTTP 请求转发给 Python Web 应用程序。它是开源项目，采用 MIT 许可证，广泛用于生产环境部署 Flask、Django、Bottle 等 WSGI 应用。

- **官网**：https://gunicorn.org/
- **源码仓库**：https://github.com/benoitc/gunicorn
- **最新稳定版**：23.0+
- **Python 版本要求**：Python 3.7+

### 1.2 WSGI 协议简介

WSGI（Web Server Gateway Interface）是 Python Web 应用与服务器之间的标准接口规范（PEP 3333）。它定义了一个简单的调用协议：

\`\`\`python
# WSGI 应用签名
def application(environ, start_response):
    # environ: 包含 CGI 风格环境变量的字典
    # start_response: 调用此函数发送响应状态和 headers
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'Hello, World!']
\`\`\`

Gunicorn 的工作就是：接收 HTTP 请求 → 转换为 \`environ\` → 调用 WSGI 应用 → 将返回值转换为 HTTP 响应 → 发回客户端。

### 1.3 Gunicorn 架构

Gunicorn 采用 **master-worker** 架构：

\`\`\`
┌─────────────────────────────────────────┐
│              Gunicorn Master            │
│  (监听端口、管理 worker、信号处理)        │
└──────────┬──────────────────────────────┘
           │ fork()
   ┌───────┼───────┬───────┬───────┐
   ▼       ▼       ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ W1  │ │ W2  │ │ W3  │ │ W4  │ │ W5  │
│sync │ │sync │ │sync │ │sync │ │sync │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼
        Flask / Django / Bottle App
\`\`\`

- **Master 进程**：不处理 HTTP 请求，只负责管理 worker 进程（启动、监控、重启）。
- **Worker 进程**：实际处理 HTTP 请求的进程，由 master fork 出来。
- **预 fork 模型**：master 启动时先创建好 worker，客户端连接到来时直接由 worker 处理，避免每次请求 fork 的开销。

## 二、为什么需要 Gunicorn

### 2.1 开发服务器不能用于生产

Flask、Django 自带的服务器是 **开发服务器**，仅用于调试，**严禁**用于生产环境。它们的官方文档明确警告：

> WARNING: This is a development server. Do not use it in a production deployment.

开发服务器的问题：

| 问题 | 说明 |
|------|------|
| 单线程 | 一次只能处理一个请求，并发能力几乎为 0 |
| 无负载均衡 | 无法利用多核 CPU |
| 无进程管理 | worker 崩溃后不会自动重启 |
| 无安全加固 | 不防慢连接、不防 DDoS |
| 无日志规范 | 日志格式不统一，难以接入 ELK |
| 性能差 | 纯 Python 实现，无性能优化 |

### 2.2 演示开发服务器问题

\`\`\`python
# app.py - Flask 开发服务器
from flask import Flask
import time

app = Flask(__name__)

@app.route('/')
def hello():
    time.sleep(5)  # 模拟慢请求
    return 'Hello!'

if __name__ == '__main__':
    # 开发模式：单线程，第二个请求会卡 5 秒
    app.run(host='0.0.0.0', port=5000)
\`\`\`

启动后用两个浏览器同时访问 \`http://localhost:5000\`，会发现第二个请求必须等第一个完成才能返回 —— 这就是单线程的致命问题。

### 2.3 Gunicorn 解决的问题

Gunicorn 提供了生产所需的关键能力：

- **多进程并发**：默认 sync worker，多个 worker 并行处理请求
- **进程管理**：worker 异常退出自动重启
- **优雅重启**：通过信号实现不中断服务的重启
- **日志规范**：access log、error log 分离
- **可扩展性**：支持 gevent、eventlet、uvicorn 等 worker 类
- **成熟稳定**：自 2009 年发布，被 Instagram、Mozilla、Ubuntu 等大量使用

## 三、安装与基本使用

### 3.1 安装 Gunicorn

\`\`\`bash
# 方式 1：pip 安装（最常用）
pip install gunicorn

# 方式 2：带 uvloop 加速（仅 Linux/macOS）
pip install gunicorn uvloop

# 方式 3：指定版本
pip install gunicorn==21.2.0

# 方式 4：使用 pipenv
pipenv install gunicorn

# 方式 5：使用 poetry
poetry add gunicorn
\`\`\`

安装完成后验证：

\`\`\`bash
# 查看版本
gunicorn --version
# 输出示例：
# gunicorn (version 21.2.0)

# 查看帮助
gunicorn --help

# 查看安装位置
which gunicorn
# /usr/local/bin/gunicorn
\`\`\`

### 3.2 第一个 Gunicorn 应用

准备一个最简单的 WSGI 应用：

\`\`\`python
# myapp.py
def app(environ, start_response):
    \"\"\"最朴素的 WSGI 应用\"\"\"
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'Hello Gunicorn!']
\`\`\`

启动 Gunicorn：

\`\`\`bash
# 基本启动语法：gunicorn 模块名:应用名
gunicorn myapp:app

# 输出示例：
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Starting gunicorn 21.2.0
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Listening at: http://127.0.0.1:8000 (12345)
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Using worker: sync
# [2024-01-01 10:00:00 +0800] [12346] [INFO] Booting worker with pid: 12346
# [2024-01-01 10:00:00 +0800] [12347] [INFO] Booting worker with pid: 12347
\`\`\`

测试：

\`\`\`bash
# 默认监听 127.0.0.1:8000
curl http://127.0.0.1:8000/
# Hello Gunicorn!
\`\`\`

## 四、启动命令详解

### 4.1 命令格式

\`\`\`bash
gunicorn [OPTIONS] 模块名:应用名
\`\`\`

- \`模块名\`：Python 模块名（不含 .py 后缀），可以是相对路径如 \`myproject.app\`
- \`应用名\`：模块中 WSGI 应用的变量名，通常是 \`app\` 或 \`application\`

### 4.2 常见启动示例

\`\`\`bash
# 1. 最简启动（默认 1 worker，监听 127.0.0.1:8000）
gunicorn myapp:app

# 2. 指定监听地址和端口
gunicorn --bind 0.0.0.0:8000 myapp:app
# 或简写
gunicorn -b 0.0.0.0:8000 myapp:app

# 3. 指定 worker 数量
gunicorn -w 4 -b 0.0.0.0:8000 myapp:app

# 4. 同时绑定多个地址
gunicorn -b 127.0.0.1:8000 -b 127.0.0.1:8001 myapp:app

# 5. 使用 Unix socket（用于 Nginx 反代）
gunicorn -b unix:/tmp/gunicorn.sock myapp:app

# 6. 后台运行（守护进程）
gunicorn -D myapp:app

# 7. 指定 PID 文件（便于管理）
gunicorn -D --pid /tmp/gunicorn.pid myapp:app

# 8. 指定工作目录
gunicorn --chdir /opt/myapp myapp:app

# 9. 指定 Python 路径
gunicorn --pythonpath /opt/myapp/src myapp:app
\`\`\`

### 4.3 命令行参数一览

| 参数 | 长参数 | 默认值 | 说明 |
|------|--------|--------|------|
| \`-w\` | \`--workers\` | 1 | worker 进程数 |
| \`-b\` | \`--bind\` | 127.0.0.1:8000 | 监听地址 |
| \`-t\` | \`--timeout\` | 30 | 请求超时（秒） |
| \`-k\` | \`--worker-class\` | sync | worker 类型 |
| \`--threads\` | - | 1 | 每个 worker 的线程数 |
| \`-D\` | \`--daemon\` | False | 守护进程模式 |
| \`--pid\` | - | 无 | PID 文件路径 |
| \`--reload\` | - | False | 代码变更自动重启（开发用） |
| \`--log-level\` | - | info | 日志级别 |
| \`--access-logfile\` | - | - | 访问日志文件 |
| \`--error-logfile\` | - | - | 错误日志文件 |
| \`--max-requests\` | - | 0 | worker 处理多少请求后重启 |
| \`--graceful-timeout\` | - | 30 | 优雅超时（秒） |
| \`--keep-alive\` | - | 2 | keepalive 时间（秒） |
| \`--preload\` | - | False | 预加载应用代码 |

## 五、worker 类型详解

### 5.1 sync（默认）

**同步 worker**，最简单可靠，每个 worker 一次只处理一个请求。

- 适用场景：CPU 密集型任务、传统 WSGI 应用
- 优点：稳定、易调试、内存隔离好
- 缺点：IO 等待时 worker 阻塞，并发能力有限

\`\`\`bash
gunicorn -k sync -w 4 myapp:app
\`\`\`

### 5.2 gevent

基于 **协程** 的异步 worker，使用 greenlet 实现协作式并发。

\`\`\`bash
# 安装 gevent
pip install gevent

# 启动
gunicorn -k gevent -w 4 --worker-connections 1000 myapp:app
\`\`\`

- 适用场景：IO 密集型应用（HTTP API、爬虫代理、长轮询）
- 优点：单 worker 可处理上千并发连接
- 缺点：与 C 扩展可能冲突（如 psycopg2 需用 psycopg2-gevent）

### 5.3 eventlet

与 gevent 类似的协程方案，由 OpenStack 推广。

\`\`\`bash
pip install eventlet
gunicorn -k eventlet -w 4 --worker-connections 1000 myapp:app
\`\`\`

- 适用场景：与 gevent 重叠，某些老项目仍使用
- 注意：现代项目推荐 gevent 而非 eventlet

### 5.4 uvicorn（用于 ASGI 应用）

Gunicorn 可以使用 UvicornWorker 来运行 ASGI 应用（如 FastAPI）：

\`\`\`bash
pip install uvicorn
gunicorn -k uvicorn.workers.UvicornWorker -w 4 myasgi:app
\`\`\`

后续章节会专门讲解这个组合。

### 5.5 worker 类型对比表

| 类型 | 并发模型 | 适用场景 | 单 worker 连接数 |
|------|----------|----------|------------------|
| sync | 多进程同步 | CPU 密集、传统 WSGI | 1 |
| gevent | 协程异步 | IO 密集、长连接 | 1000+ |
| eventlet | 协程异步 | IO 密集（老项目） | 1000+ |
| uvicorn | ASGI 异步 | FastAPI / Starlette | 1000+ |
| gthread | 多进程多线程 | 中等并发、需线程安全 | 线程数 |

### 5.6 gthread（多线程 worker）

\`\`\`bash
# sync + 多线程
gunicorn -k gthread --threads 4 -w 4 myapp:app
# 等价于 4 进程 × 4 线程 = 16 并发
\`\`\`

## 六、配置文件

当参数变多时，命令行变得难维护。Gunicorn 支持用 Python 文件作为配置。

### 6.1 配置文件示例

\`\`\`python
# gunicorn_config.py
import multiprocessing

# 监听配置
bind = '0.0.0.0:8000'
# bind = ['0.0.0.0:8000', 'unix:/tmp/gunicorn.sock']

# worker 配置
workers = multiprocessing.cpu_count() * 2 + 1  # CPU*2+1 经验公式
worker_class = 'sync'
threads = 1
timeout = 30
graceful_timeout = 30
keepalive = 2

# 进程管理
preload_app = True
max_requests = 1000
max_requests_jitter = 50  # 防止所有 worker 同时重启

# 日志配置
accesslog = '/var/log/gunicorn/access.log'
errorlog = '/var/log/gunicorn/error.log'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# 进程命名
proc_name = 'myapp-gunicorn'

# PID 文件
pidfile = '/tmp/gunicorn.pid'

# 守护进程
daemon = False  # 推荐用 systemd 管理而非 daemon

# 用户/组（生产推荐降权运行）
user = 'www-data'
group = 'www-data'

# 临时目录（存放 worker 临时文件）
worker_tmp_dir = '/dev/shm'  # 使用 tmpfs 加速
\`\`\`

### 6.2 使用配置文件

\`\`\`bash
# 通过 -c 指定配置文件
gunicorn -c gunicorn_config.py myapp:app

# 配置文件可以覆盖命令行参数
# 但命令行参数优先级更高
gunicorn -c gunicorn_config.py -w 8 myapp:app  # 实际 workers=8
\`\`\`

### 6.3 在配置文件中定义钩子

\`\`\`python
# gunicorn_config.py 中的钩子

def on_starting(server):
    \"\"\"master 启动时调用\"\"\"
    print('Gunicorn master 启动中...')

def when_ready(server):
    \"\"\"服务器就绪时调用\"\"\"
    print(f'监听地址: {server.address}')

def on_reload(server):
    \"\"\"配置重载时调用\"\"\"
    print('收到 HUP 信号，正在重载...')

def post_worker_init(worker):
    \"\"\"worker 初始化后调用\"\"\"
    print(f'Worker {worker.pid} 初始化完成')

def post_fork(server, worker):
    \"\"\"fork worker 后调用\"\"\"
    print(f'Worker {worker.pid} 已启动')

def pre_fork(server, worker):
    \"\"\"fork worker 前调用\"\"\"
    pass

def worker_exit(server, worker):
    \"\"\"worker 退出时调用\"\"\"
    print(f'Worker {worker.pid} 已退出')

def post_request(worker, req, environ, resp):
    \"\"\"每个请求后调用\"\"\"
    pass

def pre_request(worker, req):
    \"\"\"每个请求前调用\"\"\"
    pass
\`\`\`

## 七、实战：用 Gunicorn 跑 Flask

### 7.1 项目结构

\`\`\`
myflask/
├── app/
│   ├── __init__.py
│   └── routes.py
├── gunicorn_config.py
├── requirements.txt
└── wsgi.py
\`\`\`

### 7.2 应用代码

\`\`\`python
# app/__init__.py
from flask import Flask

def create_app():
    app = Flask(__name__)
    
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    return app
\`\`\`

\`\`\`python
# app/routes.py
from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return jsonify({'message': 'Hello from Flask + Gunicorn!'})

@main_bp.route('/health')
def health():
    return jsonify({'status': 'ok'})

@main_bp.route('/slow')
def slow():
    import time
    time.sleep(2)
    return jsonify({'message': 'slow response'})
\`\`\`

\`\`\`python
# wsgi.py - Gunicorn 入口
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
\`\`\`

### 7.3 配置文件

\`\`\`python
# gunicorn_config.py
import multiprocessing

bind = '0.0.0.0:8000'
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
timeout = 30
accesslog = '-'
errorlog = '-'
loglevel = 'info'

def post_fork(server, worker):
    worker.log.info('Worker %s 启动', worker.pid)
\`\`\`

### 7.4 启动与测试

\`\`\`bash
# 安装依赖
pip install flask gunicorn

# 启动
gunicorn -c gunicorn_config.py wsgi:app

# 输出：
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Starting gunicorn 21.2.0
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Listening at: http://0.0.0.0:8000 (12345)
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Using worker: sync
# [2024-01-01 10:00:00 +0800] [12346] [INFO] Booting worker with pid: 12346

# 测试
curl http://localhost:8000/
# {"message":"Hello from Flask + Gunicorn!"}

curl http://localhost:8000/health
# {"status":"ok"}

# 并发压测（ab 工具）
ab -n 1000 -c 100 http://localhost:8000/
# 输出：
# Requests per second:    850.50 [#/sec] (mean)
# Time per request:       117.582 [ms] (mean)
\`\`\`

## 八、实战：用 Gunicorn 跑 Django

### 8.1 Django 项目结构

\`\`\`
mydjango/
├── mydjango/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── gunicorn_config.py
└── requirements.txt
\`\`\`

### 8.2 启动 Django

Django 的 \`wsgi.py\` 已经定义了 \`application\` 变量：

\`\`\`python
# mydjango/wsgi.py（Django 自动生成）
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mydjango.settings')
application = get_wsgi_application()
\`\`\`

启动命令：

\`\`\`bash
# 在项目根目录执行
gunicorn mydjango.wsgi:application -w 4 -b 0.0.0.0:8000

# 或使用配置文件
gunicorn -c gunicorn_config.py mydjango.wsgi:application
\`\`\`

### 8.3 Django 配置文件

\`\`\`python
# gunicorn_config.py（Django 专用）
import multiprocessing
import os

# 环境变量
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mydjango.settings')

bind = '0.0.0.0:8000'
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
timeout = 60  # Django 视图可能较慢，适当增大
max_requests = 500  # 防止内存泄漏

# 日志
accesslog = '/var/log/gunicorn/django_access.log'
errorlog = '/var/log/gunicorn/django_error.log'
loglevel = 'info'

# Django 静态文件需要在 Nginx 处理，Gunicorn 不处理
# 这里设置仅运行应用
\`\`\`

### 8.4 测试 Django

\`\`\`bash
# 启动
gunicorn -c gunicorn_config.py mydjango.wsgi:application

# 测试
curl http://localhost:8000/admin/
# 返回 Django admin 登录页面

# 查看进程
ps aux | grep gunicorn
# www-data  12345  0.0  2.0 ... gunicorn: master [mydjango.wsgi:application]
# www-data  12346  0.0  3.0 ... gunicorn: worker [sync]
# www-data  12347  0.0  3.0 ... gunicorn: worker [sync]
# www-data  12348  0.0  3.0 ... gunicorn: worker [sync]
# www-data  12349  0.0  3.0 ... gunicorn: worker [sync]
\`\`\`

## 九、常见问题

### 9.1 端口被占用

\`\`\`bash
gunicorn myapp:app
# [ERROR] Connection in use: ('127.0.0.1', 8000)

# 解决方案 1：换端口
gunicorn -b 0.0.0.0:8001 myapp:app

# 解决方案 2：杀掉占用进程
lsof -i :8000
kill -9 <PID>

# 解决方案 3：使用 Unix socket
gunicorn -b unix:/tmp/gunicorn.sock myapp:app
\`\`\`

### 9.2 权限问题

\`\`\`bash
# 绑定 80 端口需要 root
gunicorn -b 0.0.0.0:80 myapp:app
# [ERROR] permission denied

# 解决方案：用 Nginx 监听 80，反代 Gunicorn 的 8000
# 或者用 setcap 给 gunicorn 二进制授权
sudo setcap 'cap_net_bind_service=+ep' \$(which gunicorn)
\`\`\`

### 9.3 模块导入失败

\`\`\`bash
gunicorn myapp:app
# ModuleNotFoundError: No module named 'myapp'

# 排查步骤：
# 1. 确认在正确目录
pwd  # 应该在 myapp.py 所在目录

# 2. 确认 Python 能导入
python -c "import myapp; print(myapp.app)"

# 3. 指定 pythonpath
gunicorn --pythonpath /opt/myapp myapp:app

# 4. 确认虚拟环境已激活
which python  # 应该是虚拟环境的 python
\`\`\`

## 十、小结

本章介绍了 Gunicorn 的核心概念：

1. **Gunicorn 是 WSGI HTTP Server**，专用于生产部署 Python Web 应用
2. **采用 master-worker 架构**，提供进程管理和并发能力
3. **替代开发服务器**，提供稳定性、性能、可扩展性
4. **支持多种 worker 类型**：sync、gevent、eventlet、uvicorn
5. **支持配置文件**，便于管理复杂配置
6. **可运行 Flask、Django 等所有 WSGI 应用**

下一章将深入讲解 Gunicorn 的进阶配置，包括 worker 调优、信号处理、内存泄漏防护等生产级话题。
`
  },
  {
    id: "deploy-gunicorn-advanced",
    icon: "⚙️",
    title: "Gunicorn 进阶配置",
    group: "Gunicorn 与 Uvicorn",
    content: `# Gunicorn 进阶配置

## 一、Worker 数量调优

### 1.1 经典公式：CPU * 2 + 1

Gunicorn 官方推荐的 worker 数量公式：

\`\`\`python
# gunicorn_config.py
import multiprocessing

workers = multiprocessing.cpu_count() * 2 + 1
\`\`\`

**为什么是这个公式？**

- **CPU 核数 \* 2**：每个 CPU 跑 2 个 worker，一个在处理请求时另一个在等待 IO
- **+1**：多一个 worker 用于处理突发流量，避免饥饿

假设服务器是 4 核：

\`\`\`bash
# 4 核 CPU
nproc
# 4

# 推荐 workers = 4 * 2 + 1 = 9
gunicorn -w 9 myapp:app
\`\`\`

### 1.2 不同场景的调整

| 场景 | 推荐公式 | 说明 |
|------|----------|------|
| CPU 密集型 | CPU + 1 | 减少 worker 间切换 |
| IO 密集型（sync worker） | CPU * 2 + 1 | 标准公式 |
| IO 密集型（gevent） | CPU * 1 + 1 | 协程已处理并发 |
| 内存受限 | 内存 / 单 worker 内存 | 受内存约束 |
| 混合负载 | CPU * 2 + 1 | 起步值 |

### 1.3 动态计算示例

\`\`\`python
# gunicorn_config.py - 智能计算 workers
import multiprocessing
import os

def get_workers():
    cpu = multiprocessing.cpu_count()
    
    # 容器环境：从 cgroup 读取 CPU 限制
    if os.path.exists('/sys/fs/cgroup/cpu/cpu.cfs_quota_us'):
        with open('/sys/fs/cgroup/cpu/cpu.cfs_quota_us') as f:
            quota = int(f.read())
        with open('/sys/fs/cgroup/cpu/cpu.cfs_period_us') as f:
            period = int(f.read())
        if quota > 0:
            cpu = max(1, quota // period)
    
    return cpu * 2 + 1

workers = get_workers()
print(f'启动 {workers} 个 worker')
\`\`\`

### 1.4 测试不同 worker 数

\`\`\`bash
# 1 个 worker（基线）
gunicorn -w 1 -b 0.0.0.0:8000 myapp:app &
ab -n 2000 -c 50 http://localhost:8000/
# Requests per second: 220.45

# 4 个 worker
gunicorn -w 4 -b 0.0.0.0:8000 myapp:app &
ab -n 2000 -c 50 http://localhost:8000/
# Requests per second: 780.12

# 9 个 worker
gunicorn -w 9 -b 0.0.0.0:8000 myapp:app &
ab -n 2000 -c 50 http://localhost:8000/
# Requests per second: 1250.33

# 16 个 worker（过度）
gunicorn -w 16 -b 0.0.0.0:8000 myapp:app &
ab -n 2000 -c 50 http://localhost:8000/
# Requests per second: 1100.21（性能下降，因为切换开销）
\`\`\`

## 二、Worker 类型选择

### 2.1 sync vs 异步决策

\`\`\`
请求类型？
├── CPU 密集（计算、图像处理）
│   └── sync worker（CPU*2+1）
├── IO 密集（数据库、外部 API）
│   ├── 短连接 → gthread（threads=4, CPU*2+1）
│   └── 长连接（WebSocket、SSE、长轮询）
│       └── gevent / eventlet
└── ASGI 应用（FastAPI 原生异步）
    └── UvicornWorker（详见后续章节）
\`\`\`

### 2.2 sync worker 适用场景

\`\`\`python
# CPU 密集型示例：图像处理
@app.route('/resize/<filename>')
def resize(filename):
    from PIL import Image
    img = Image.open(f'/data/{filename}')
    img.thumbnail((800, 600))
    img.save(f'/data/thumb_{filename}')
    return 'OK'
\`\`\`

\`\`\`bash
# sync worker 足够，无需异步
gunicorn -k sync -w 4 myapp:app
\`\`\`

### 2.3 gevent 适用场景

\`\`\`python
# IO 密集型示例：调用外部 API
import requests

@app.route('/weather')
def weather():
    # 调用天气 API，慢
    r = requests.get('https://api.weather.com/...', timeout=5)
    return r.json()
\`\`\`

\`\`\`bash
# gevent 大幅提升并发
pip install gevent
gunicorn -k gevent -w 4 --worker-connections 1000 myapp:app
# 4 worker * 1000 连接 = 4000 并发
\`\`\`

### 2.4 gevent 补丁问题

gevent 需要给标准库打补丁才能异步：

\`\`\`python
# gunicorn_config.py - gevent 配置
def post_fork(server, worker):
    # gevent 自动打补丁，但需确认
    from gevent import monkey
    monkey.patch_all()

# 或者使用 psycopg2 时需要 gevent 友好版本
pip install psycopg2-binary  # ❌ 阻塞
pip install psycopg2-gevent  # ✅ gevent 友好（如可用）
# 推荐用 asyncpg 或 aiopg
\`\`\`

### 2.5 gthread 适用场景

\`\`\`python
# 中等 IO + 线程安全代码
@app.route('/db')
def db_query():
    # 数据库连接池是线程安全的
    from db import pool
    with pool.connection() as conn:
        return conn.execute('SELECT 1').fetchone()
\`\`\`

\`\`\`bash
# gthread：4 进程 × 8 线程 = 32 并发
gunicorn -k gthread --threads 8 -w 4 myapp:app
\`\`\`

## 三、并发模型：worker + thread

### 3.1 gthread 配置

\`\`\`python
# gunicorn_config.py
import multiprocessing

worker_class = 'gthread'
workers = multiprocessing.cpu_count() * 2 + 1
threads = 4  # 每 worker 4 线程

# 总并发 = workers * threads = 9 * 4 = 36
\`\`\`

### 3.2 线程数选择

| threads | 适用场景 |
|---------|----------|
| 1 | CPU 密集（等同 sync） |
| 2-4 | 中等 IO |
| 8-16 | 重度 IO（数据库慢查询） |
| 20+ | 长轮询、SSE |

\`\`\`bash
# 测试不同 threads
gunicorn -k gthread --threads 1 -w 9 myapp:app  # 9 并发
gunicorn -k gthread --threads 4 -w 9 myapp:app  # 36 并发
gunicorn -k gthread --threads 8 -w 9 myapp:app  # 72 并发
\`\`\`

### 3.3 线程安全问题

使用多线程时，应用代码必须**线程安全**：

\`\`\`python
# ❌ 不安全：全局可变状态
counter = 0

@app.route('/incr')
def incr():
    global counter
    counter += 1  # 竞态条件！
    return str(counter)

# ✅ 安全：使用锁
import threading
counter = 0
lock = threading.Lock()

@app.route('/incr')
def incr():
    global counter
    with lock:
        counter += 1
    return str(counter)

# ✅ 更好：使用 Redis 等外部存储
import redis
r = redis.Redis()

@app.route('/incr')
def incr():
    return str(r.incr('counter'))
\`\`\`

## 四、超时配置

### 4.1 timeout（请求超时）

\`\`\`bash
# 默认 30 秒，超过则 worker 被 kill
gunicorn -t 30 myapp:app

# 对于慢请求应用（如大文件生成）
gunicorn -t 300 myapp:app
\`\`\`

\`\`\`python
# gunicorn_config.py
timeout = 60  # 60 秒超时

# 计算密集型场景可能需要更长
# timeout = 600  # 10 分钟
\`\`\`

**超时后的行为**：

1. worker 处理请求超过 \`timeout\` 秒
2. master 发送 SIGABRT 给 worker
3. worker 退出（请求中断）
4. master 立即 fork 新 worker 替代
5. 客户端收到 502 或连接重置

### 4.2 graceful_timeout（优雅超时）

\`\`\`python
# gunicorn_config.py
graceful_timeout = 30  # 优雅退出的等待时间
\`\`\`

**作用**：收到重启信号后，worker 有 \`graceful_timeout\` 秒处理完当前请求，超时则强制 kill。

\`\`\`bash
# 演示优雅超时
# 1. 启动一个慢请求
curl http://localhost:8000/slow &
# 2. 发送 HUP 信号
kill -HUP \$(cat /tmp/gunicorn.pid)
# 3. worker 会等慢请求完成（最多 30 秒），然后退出
\`\`\`

### 4.3 keep_alive

\`\`\`python
# gunicorn_config.py
keepalive = 2  # keep-alive 连接保持秒数，默认 2
# 对于 API 服务，可以适当增大
# keepalive = 5
\`\`\`

## 五、日志配置

### 5.1 日志级别

\`\`\`bash
gunicorn --log-level debug myapp:app   # 调试（最详细）
gunicorn --log-level info myapp:app    # 信息（默认）
gunicorn --log-level warning myapp:app # 警告
gunicorn --log-level error myapp:app   # 错误
gunicorn --log-level critical myapp:app # 严重（最少）
\`\`\`

### 5.2 日志文件配置

\`\`\`python
# gunicorn_config.py
accesslog = '/var/log/gunicorn/access.log'
errorlog = '/var/log/gunicorn/error.log'
loglevel = 'info'

# 输出到 stdout/stderr（容器推荐）
# accesslog = '-'
# errorlog = '-'
\`\`\`

### 5.3 自定义日志格式

\`\`\`python
# gunicorn_config.py
# 默认格式
# access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# 自定义 JSON 格式（便于 ELK 采集）
import json
import time

def json_log(worker, req, environ, resp):
    log_data = {
        'time': time.strftime('%Y-%m-%dT%H:%M:%S'),
        'method': environ.get('REQUEST_METHOD'),
        'path': environ.get('PATH_INFO'),
        'status': resp.status.split()[0],
        'remote': environ.get('REMOTE_ADDR'),
        'user_agent': environ.get('HTTP_USER_AGENT'),
        'duration_ms': int(req.response_length or 0),
    }
    print(json.dumps(log_data))

# 内置字段说明：
# %(h)s - 远程地址
# %(l)s - 远程登录名（通常 -）
# %(u)s - 认证用户（通常 -）
# %(t)s - 时间
# %(r)s - 请求行（"GET / HTTP/1.1"）
# %(s)s - 状态码
# %(b)s - 响应大小
# %(f)s - Referer
# %(a)s - User-Agent
# %(D)s - 请求耗时（微秒）
# %(p)s - 进程 ID
# %(T)s - 请求耗时（秒）

# 包含耗时的格式
access_log_format = '%(h)s %(t)s "%(r)s" %(s)s %(b)s %(D)sμs "%(f)s" "%(a)s"'

# 示例输出：
# 192.168.1.1 [2024-01-01 10:00:00 +0800] "GET / HTTP/1.1" 200 12 1234μs "-" "curl/7.68"
\`\`\`

### 5.4 日志轮转

Gunicorn 不内置日志轮转，推荐用 \`logrotate\`：

\`\`\`bash
# /etc/logrotate.d/gunicorn
/var/log/gunicorn/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        # 发送 USR1 信号让 Gunicorn 重新打开日志
        kill -USR1 \$(cat /tmp/gunicorn.pid) 2>/dev/null || true
    endscript
}
\`\`\`

### 5.5 USR1 信号重新打开日志

\`\`\`bash
# 日志轮转后，Gunicorn 仍持有旧 fd，需 USR1 信号
kill -USR1 \$(cat /tmp/gunicorn.pid)

# Gunicorn 会关闭并重新打开所有日志文件
# 输出：
# [INFO] Reopening log files
\`\`\`

## 六、信号处理

### 6.1 Gunicorn 支持的信号

| 信号 | 作用 |
|------|------|
| \`HUP\` | 重新加载配置、重启所有 worker（优雅） |
| \`USR1\` | 重新打开日志文件 |
| \`USR2\` | 热升级 Gunicorn 二进制 |
| \`TERM\` | 优雅停止（等待 worker 完成） |
| \`INT\` | 立即停止（Ctrl+C） |
| \`QUIT\` | 快速停止 |
| \`TTIN\` | 增加 1 个 worker |
| \`TTOU\` | 减少 1 个 worker |
| \`WINCH\` | 守护进程模式下停止 worker 但不退出 master |

### 6.2 HUP：优雅重启

\`\`\`bash
# 启动
gunicorn -D --pid /tmp/gunicorn.pid myapp:app

# 修改代码后，发送 HUP
kill -HUP \$(cat /tmp/gunicorn.pid)

# 输出日志：
# [INFO] Handling signal: hup
# [INFO] Reloading configuration
# [INFO] Worker exiting (pid: 12346)
# [INFO] Booting worker with pid: 12348
\`\`\`

**注意**：HUP 会重启所有 worker，旧 worker 完成当前请求后退出，新 worker 立即接管。

### 6.3 USR2：热升级

\`\`\`bash
# 当前运行的 Gunicorn 版本 21.2.0
gunicorn --version
# gunicorn (version 21.2.0)

# 升级 pip 包
pip install --upgrade gunicorn
# 现在 /usr/local/bin/gunicorn 是 23.0.0

# 发送 USR2 触发热升级
kill -USR2 \$(cat /tmp/gunicorn.pid)

# 此时会有两个 master：
ps aux | grep gunicorn
# root  12345  ... gunicorn: master [myapp:app]
# root  12380  ... gunicorn: master [myapp:app]    <- 新 master

# 确认新版本工作正常后，杀掉旧 master
kill -WINCH \$(cat /tmp/gunicorn.pid.oldbin)  # 停止旧 worker
kill -QUIT \$(cat /tmp/gunicorn.pid.oldbin)  # 退出旧 master
\`\`\`

### 6.4 TTIN/TTOU：动态调整 worker

\`\`\`bash
# 当前 4 个 worker
kill -TTIN \$(cat /tmp/gunicorn.pid)  # +1 = 5 个
kill -TTIN \$(cat /tmp/gunicorn.pid)  # +1 = 6 个
kill -TTOU \$(cat /tmp/gunicorn.pid)  # -1 = 5 个

# 日志：
# [INFO] Handling signal: ttin
# [INFO] Booting worker with pid: 12350
\`\`\`

### 6.5 TERM：优雅停止

\`\`\`bash
# 等待 worker 处理完当前请求后停止
kill -TERM \$(cat /tmp/gunicorn.pid)

# 日志：
# [INFO] Handling signal: term
# [INFO] Worker exiting (pid: 12346)
# [INFO] Shutting down: Master
\`\`\`

### 6.6 自定义信号处理脚本

\`\`\`bash
#!/bin/bash
# gunicorn-ctl.sh - Gunicorn 管理脚本
PID_FILE=/tmp/gunicorn.pid

case "\$1" in
    start)
        gunicorn -D --pid \$PID_FILE -c gunicorn_config.py myapp:app
        echo "Gunicorn 启动"
        ;;
    stop)
        kill -TERM \$(cat \$PID_FILE)
        echo "Gunicorn 停止"
        ;;
    reload)
        kill -HUP \$(cat \$PID_FILE)
        echo "Gunicorn 重载"
        ;;
    status)
        if [ -f \$PID_FILE ]; then
            echo "运行中，PID: \$(cat \$PID_FILE)"
        else
            echo "未运行"
        fi
        ;;
    scale-up)
        kill -TTIN \$(cat \$PID_FILE)
        echo "增加 1 个 worker"
        ;;
    scale-down)
        kill -TTOU \$(cat \$PID_FILE)
        echo "减少 1 个 worker"
        ;;
    reopen-log)
        kill -USR1 \$(cat \$PID_FILE)
        echo "重新打开日志"
        ;;
    *)
        echo "Usage: \$0 {start|stop|reload|status|scale-up|scale-down|reopen-log}"
        exit 1
        ;;
esac
\`\`\`

## 七、preload_app 优化

### 7.1 preload_app 的作用

\`\`\`python
# gunicorn_config.py
preload_app = True  # 默认 False
\`\`\`

**False（默认）**：每个 worker 独立加载应用代码

\`\`\`
Master 启动 → fork → Worker 1（加载 app）
                  → Worker 2（加载 app）
                  → Worker 3（加载 app）
\`\`\`

**True**：master 先加载应用，再 fork worker

\`\`\`
Master 启动 → 加载 app → fork → Worker 1（共享已加载 app）
                          → Worker 2（共享已加载 app）
                          → Worker 3（共享已加载 app）
\`\`\`

### 7.2 优缺点

| 方面 | preload_app=True | preload_app=False |
|------|------------------|-------------------|
| 启动速度 | 快（加载一次） | 慢（每个 worker 加载） |
| 内存占用 | 低（共享内存） | 高（每 worker 独立） |
| HUP 重载 | 全部重启 | 可逐个重启 |
| 数据库连接 | 需在 fork 后建立 | 可在加载时建立 |
| 大应用推荐 | ✅ | - |

### 7.3 preload_app 注意事项

\`\`\`python
# ❌ 错误：preload_app=True 时连接池被 fork 共享，导致连接混乱
def create_app():
    app = Flask(__name__)
    app.db_pool = create_db_pool()  # 在 master 中创建
    return app

# ✅ 正确：在 post_fork 钩子中创建连接池
def post_fork(server, worker):
    from myapp import app
    app.db_pool = create_db_pool()  # 每个 worker 独立创建

preload_app = True
\`\`\`

## 八、max_requests 防内存泄漏

### 8.1 为什么需要 max_requests

Python 应用常见问题：**内存泄漏**（C 扩展、全局缓存、未释放的对象）。Gunicorn 提供 \`max_requests\` 让 worker 处理一定数量请求后自动重启，回收内存。

\`\`\`python
# gunicorn_config.py
max_requests = 1000  # 处理 1000 请求后重启 worker
max_requests_jitter = 50  # 加 0-50 的随机数，避免同时重启
\`\`\`

### 8.2 jitter 的作用

\`\`\`bash
# 没有 jitter：所有 worker 同时达到 1000，同时重启，服务中断
Worker 1: 0→1000 → 重启
Worker 2: 0→1000 → 重启  ← 同时！
Worker 3: 0→1000 → 重启  ← 同时！

# 有 jitter：错开重启
Worker 1: 0→1032 → 重启
Worker 2: 0→1017 → 重启  ← 错开
Worker 3: 0→1048 → 重启  ← 错开
\`\`\`

### 8.3 监控 max_requests 触发

\`\`\`python
# gunicorn_config.py
max_requests = 1000
max_requests_jitter = 50

def worker_exit(server, worker):
    if worker.max_requests_reached:
        server.log.info(f'Worker {worker.pid} 因 max_requests 重启')
\`\`\`

### 8.4 内存泄漏排查

\`\`\`bash
# 1. 监控 worker 内存
while true; do
    ps aux | grep gunicorn | grep worker | awk '{print \$6/1024 " MB", \$2}'
    sleep 5
done

# 输出示例：
# 50 MB 12346
# 51 MB 12347
# 52 MB 12348  <- 持续增长说明泄漏

# 2. 启用 tracemalloc
pip install tracemalloc
\`\`\`

\`\`\`python
# app.py - 内存跟踪
import tracemalloc
tracemalloc.start()

@app.route('/mem')
def mem_stats():
    snapshot = tracemalloc.take_snapshot()
    top = snapshot.statistics('lineno')[:10]
    return '<br>'.join(str(s) for s in top)
\`\`\`

## 九、综合生产配置

### 9.1 完整生产配置文件

\`\`\`python
# /etc/gunicorn/myapp_config.py
import multiprocessing
import os

# ===== 监听 =====
bind = 'unix:/run/gunicorn/myapp.sock'  # Unix socket 配合 Nginx
backlog = 2048  # 等待连接队列大小

# ===== Worker =====
worker_class = 'sync'
workers = multiprocessing.cpu_count() * 2 + 1
threads = 1
timeout = 60
graceful_timeout = 30
keepalive = 2

# ===== 进程管理 =====
preload_app = True
max_requests = 2000
max_requests_jitter = 100
worker_tmp_dir = '/dev/shm'

# ===== 权限 =====
user = 'www-data'
group = 'www-data'
umask = 0o022

# ===== 日志 =====
accesslog = '/var/log/gunicorn/myapp_access.log'
errorlog = '/var/log/gunicorn/myapp_error.log'
loglevel = 'info'
access_log_format = '%(h)s %(t)s "%(r)s" %(s)s %(b)s %(D)sμs "%(f)s" "%(a)s"'

# ===== 进程信息 =====
proc_name = 'myapp'
pidfile = '/run/gunicorn/myapp.pid'

# ===== 钩子 =====
def post_fork(server, worker):
    worker.log.info(f'Worker {worker.pid} 启动')

def worker_exit(server, worker):
    worker.log.info(f'Worker {worker.pid} 退出')

def on_reload(server):
    server.log.info('配置重载')

# ===== 应用初始化（preload_app=True 时） =====
def post_worker_init(worker):
    # 在 worker 中初始化资源
    import myapp
    myapp.init_resources()
\`\`\`

### 9.2 Nginx 配合配置

\`\`\`nginx
# /etc/nginx/conf.d/myapp.conf
upstream gunicorn_myapp {
    server unix:/run/gunicorn/myapp.sock fail_timeout=0;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://gunicorn_myapp;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 超时配置（要 >= gunicorn timeout）
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 静态文件由 Nginx 处理
    location /static/ {
        alias /opt/myapp/static/;
        expires 30d;
    }
}
\`\`\`

## 十、性能监控

### 10.1 Gunicorn 状态查看

\`\`\`bash
# 查看进程树
pstree -p \$(cat /tmp/gunicorn.pid)
# gunicorn─┬─gunicorn
#          ├─gunicorn
#          ├─gunicorn
#          ├─gunicorn
#          └─gunicorn

# 查看 worker 内存
ps -o pid,rss,cmd -C gunicorn
#   PID   RSS CMD
# 12345 50000 gunicorn: master [myapp:app]
# 12346 60000 gunicorn: worker [sync]
# 12347 61000 gunicorn: worker [sync]

# 实时监控
watch -n 1 'ps -o pid,rss,pcpu,cmd -C gunicorn'
\`\`\`

### 10.2 集成 Prometheus

\`\`\`python
# 安装 prometheus_client
# pip install prometheus_client

# app.py
from prometheus_client import Counter, Histogram, generate_latest
from flask import Flask, Response

app = Flask(__name__)

REQUEST_COUNT = Counter('http_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Request latency')

@app.before_request
def before():
    REQUEST_COUNT.labels(request.method, request.path).inc()

@app.after_request
def after(response):
    REQUEST_LATENCY.observe(...)
    return response

@app.route('/metrics')
def metrics():
    return Response(generate_latest(), mimetype='text/plain')
\`\`\`

\`\`\`bash
# Prometheus 抓取 /metrics
# prometheus.yml
scrape_configs:
  - job_name: 'gunicorn'
    static_configs:
      - targets: ['localhost:8000']
\`\`\`

## 十一、常见陷阱

### 11.1 Worker OOM

\`\`\`bash
# 现象：worker 莫名退出
# 日志：[INFO] Worker exiting (pid: 12346)
# 系统日志：Out of memory: Kill process 12346

# 排查：
dmesg | grep -i kill
# [12345.678] Killed process 12346 (python) total-vm:2GB, anon-rss:1.5GB

# 解决：
# 1. 增加 max_requests 让 worker 定期重启
# 2. 优化代码内存使用
# 3. 增加服务器内存
\`\`\`

### 11.2 文件描述符耗尽

\`\`\`bash
# 现象：[ERROR] problem booting worker
#       [Errno 24] Too many open files

# 排查：
ulimit -n  # 1024 太低

# 解决：
# 1. 临时提高
ulimit -n 65535
gunicorn myapp:app

# 2. 永久配置 /etc/security/limits.conf
# * soft nofile 65535
# * hard nofile 65535

# 3. systemd 服务配置
# /etc/systemd/system/gunicorn.service
# [Service]
# LimitNOFILE=65535
\`\`\`

### 11.3 静默失败

\`\`\`bash
# 现象：gunicorn 启动后立即退出，无错误
gunicorn myapp:app
# 没有任何输出，进程消失

# 排查：
# 1. 用 --preload 看启动错误
gunicorn --preload myapp:app
# ImportError: No module named 'flask'

# 2. 检查日志
gunicorn --error-logfile=- myapp:app
\`\`\`

## 十二、小结

本章深入讲解了 Gunicorn 进阶配置：

1. **worker 数量调优**：CPU*2+1 公式及动态调整
2. **worker 类型选择**：sync / gevent / gthread 各自适用场景
3. **并发模型**：worker + thread 组合调优
4. **超时配置**：timeout、graceful_timeout、keepalive
5. **日志配置**：日志级别、格式、轮转
6. **信号处理**：HUP 重启、USR2 热升级、TTIN/TTOU 调整 worker
7. **preload_app**：内存优化与注意事项
8. **max_requests**：防内存泄漏机制

掌握这些配置后，你就能在生产环境稳定运行 Gunicorn。下一章介绍 ASGI 服务器 Uvicorn。
`
  },
  {
    id: "deploy-uvicorn-intro",
    icon: "⚡",
    title: "Uvicorn 简介与配置",
    group: "Gunicorn 与 Uvicorn",
    content: `# Uvicorn 简介与配置

## 一、Uvicorn 是什么

### 1.1 ASGI Server 概念

**Uvicorn** 是一个基于 asyncio 的 **ASGI Server**，用于运行 ASGI 应用（FastAPI、Starlette、Django 3.0+）。它使用 \`uvloop\` 和 \`httptools\` 实现，性能非常出色。

- **官网**：https://www.uvicorn.org/
- **源码**：https://github.com/encode/uvicorn
- **作者**：Tom Christie（Django REST framework 作者）
- **最新版本**：0.30+
- **Python 版本**：3.8+

### 1.2 ASGI 协议简介

ASGI（Asynchronous Server Gateway Interface）是 WSGI 的异步版本，由 Django 团队提出。它支持：

- **异步请求处理**：基于 asyncio
- **WebSocket**：长连接双向通信
- **HTTP/2**：多路复用
- **服务器推送**：Server-Sent Events

\`\`\`python
# ASGI 应用签名
async def app(scope, receive, send):
    # scope: 连接信息字典
    # receive: 异步函数，接收客户端消息
    # send: 异步函数，发送响应给客户端
    
    if scope['type'] == 'http':
        await send({
            'type': 'http.response.start',
            'status': 200,
            'headers': [(b'content-type', b'text/plain')],
        })
        await send({
            'type': 'http.response.body',
            'body': b'Hello ASGI!',
        })
\`\`\`

### 1.3 Uvicorn 架构

\`\`\`
┌─────────────────────────────────────────┐
│            Uvicorn Server               │
│  (uvloop + httptools 加速)              │
└──────────┬──────────────────────────────┘
           │ asyncio event loop
   ┌───────┼───────┬───────┬───────┐
   ▼       ▼       ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ C1  │ │ C2  │ │ C3  │ │ C4  │ │ C5  │  ← 协程
│async│ │async│ │async│ │async│ │async│
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼
       FastAPI / Starlette / Django
\`\`\`

- **单进程多协程**：一个 Uvicorn 进程内有 asyncio 事件循环，可处理数千并发
- **uvloop**：libuv 的 Python 绑定，比原生 asyncio 快 2-4 倍
- **httptools**：C 实现的 HTTP 解析器，比 h11 快

## 二、Uvicorn vs Gunicorn

### 2.1 核心区别

| 特性 | Gunicorn | Uvicorn |
|------|----------|---------|
| 协议 | WSGI（同步） | ASGI（异步） |
| 并发模型 | 多进程 + 多线程 | 单进程 + 协程 |
| 适用应用 | Flask、Django 2.x | FastAPI、Starlette、Django 3.0+ |
| WebSocket | ❌（需额外） | ✅ 原生支持 |
| HTTP/2 | ❌ | ✅ 支持 |
| 性能 | 良好 | 优秀（uvloop 加速） |
| 进程管理 | ✅ master-worker | ❌ 单进程（需 --workers 或 Gunicorn） |

### 2.2 选择决策

\`\`\`
你的应用？
├── Flask / Django 2.x（同步代码）
│   └── Gunicorn
├── FastAPI / Starlette（异步代码）
│   ├── 开发环境 → Uvicorn --reload
│   └── 生产环境 → Gunicorn + UvicornWorker（后续章节）
├── Django 3.0+（混合）
│   ├── 纯同步视图 → Gunicorn
│   └── 异步视图 / WebSocket → Uvicorn / Daphne
└── 需要 WebSocket
    └── Uvicorn / Daphne / Hypercorn
\`\`\`

### 2.3 性能对比示例

\`\`\`bash
# 同样的 FastAPI 应用，分别用 Gunicorn(sync) 和 Uvicorn 跑

# Gunicorn sync worker
gunicorn -k sync -w 4 -b 0.0.0.0:8000 main:app
ab -n 10000 -c 100 http://localhost:8000/
# Requests per second:    1200.50

# Uvicorn 单进程
uvicorn main:app --host 0.0.0.0 --port 8000
ab -n 10000 -c 100 http://localhost:8000/
# Requests per second:    3800.25  ← 3 倍！

# Uvicorn 4 workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
ab -n 10000 -c 100 http://localhost:8000/
# Requests per second:    12500.80  ← 10 倍！
\`\`\`

## 三、安装与基本使用

### 3.1 安装 Uvicorn

\`\`\`bash
# 基础安装（仅核心，纯 Python）
pip install uvicorn

# 推荐：带 C 加速
pip install uvicorn[standard]
# 包含：uvloop、httptools、websockets、watchfiles、python-dotenv

# 完整安装（额外包含 PyOpenSSL 支持 HTTP/2）
pip install "uvicorn[standard]" h2

# 指定版本
pip install uvicorn==0.30.0
\`\`\`

验证：

\`\`\`bash
uvicorn --version
# 输出：uvicorn 0.30.0

# 检查 uvloop 是否安装
python -c "import uvloop; print('uvloop:', uvloop.__version__)"
# uvloop: 0.19.0

# 检查 httptools
python -c "import httptools; print('httptools OK')"
\`\`\`

### 3.2 第一个 Uvicorn 应用

\`\`\`python
# main.py - 最简 ASGI 应用
async def app(scope, receive, send):
    \"\"\"最朴素的 ASGI 应用\"\"\"
    assert scope['type'] == 'http'
    
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            (b'content-type', b'text/plain'),
        ],
    })
    await send({
        'type': 'http.response.body',
        'body': b'Hello Uvicorn!',
    })
\`\`\`

启动：

\`\`\`bash
# 启动语法：uvicorn 模块名:应用名
uvicorn main:app

# 输出：
# INFO:     Will watch for changes in these directories: ['/opt/myapp']
# INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345] using WatchFiles
# INFO:     Started server process [12346]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
\`\`\`

测试：

\`\`\`bash
curl http://127.0.0.1:8000/
# Hello Uvicorn!
\`\`\`

## 四、启动命令详解

### 4.1 命令格式

\`\`\`bash
uvicorn [OPTIONS] 模块名:应用名
\`\`\`

### 4.2 常见启动示例

\`\`\`bash
# 1. 最简启动（默认 127.0.0.1:8000 + reload）
uvicorn main:app

# 2. 指定 host 和 port
uvicorn main:app --host 0.0.0.0 --port 8080

# 3. 多 worker（生产用）
uvicorn main:app --workers 4

# 4. 开发热重载
uvicorn main:app --reload

# 5. 指定监听地址（可多个）
uvicorn main:app --host 0.0.0.0 --port 8000 --host 0.0.0.0 --port 8001

# 6. Unix socket
uvicorn main:app --uds /tmp/uvicorn.sock

# 7. 使用 SSL
uvicorn main:app --ssl-keyfile ./key.pem --ssl-certfile ./cert.pem

# 8. 指定应用工厂
uvicorn 'main:create_app' --factory

# 9. 禁用访问日志（提升性能）
uvicorn main:app --no-access-log

# 10. 自定义日志格式
uvicorn main:app --log-config logging.yaml
\`\`\`

### 4.3 命令行参数一览

| 参数 | 默认值 | 说明 |
|------|--------|------|
| \`--host\` | 127.0.0.1 | 监听地址 |
| \`--port\` | 8000 | 监听端口 |
| \`--uds\` | 无 | Unix socket 路径 |
| \`--workers\` | 1 | worker 进程数 |
| \`--reload\` | False | 热重载（开发用） |
| \`--reload-dir\` | . | 监听变更的目录 |
| \`--reload-include\` | - | 额外监听的文件模式 |
| \`--reload-exclude\` | - | 排除监听的文件模式 |
| \`--loop\` | auto | 事件循环（auto/asyncio/uvloop） |
| \`--http\` | auto | HTTP 解析器（auto/h11/httptools） |
| \`--ws\` | auto | WebSocket 实现（auto/websockets/wsproto） |
| \`--ws-max-size\` | 16MB | WebSocket 最大消息 |
| \`--ws-ping-interval\` | 20 | WebSocket ping 间隔 |
| \`--ws-ping-timeout\` | 20 | WebSocket ping 超时 |
| \`--lifespan\` | auto | 生命周期（auto/on/off） |
| \`--timeout-keep-alive\` | 5 | keep-alive 超时 |
| \`--timeout-graceful-shutdown\` | 30 | 优雅关闭超时 |
| \`--ssl-keyfile\` | - | SSL 私钥 |
| \`--ssl-certfile\` | - | SSL 证书 |
| \`--ssl-keyfile-password\` | - | SSL 私钥密码 |
| \`--ssl-version\` | TLSv1.2 | SSL 版本 |
| \`--log-level\` | info | 日志级别 |
| \`--access-log\` | True | 是否记录访问日志 |
| \`--log-config\` | - | 日志配置文件 |
| \`--no-access-log\` | - | 禁用访问日志 |
| \`--proxy-headers\` | False | 信任 X-Forwarded-* 头 |
| \`--forwarded-allow-ips\` | - | 信任的代理 IP |
| \`--root-path\` | - | 应用根路径 |
| \`--limit-concurrency\` | - | 最大并发 |
| \`--limit-max-requests\` | - | 处理 N 请求后退出（测试用） |
| \`--backlog\` | 2048 | 连接队列 |
| \`--factory\` | False | 应用工厂模式 |
| \`--env-file\` | - | 环境变量文件 |

## 五、uvloop 与 httptools 加速

### 5.1 uvloop

uvloop 是 asyncio 事件循环的 C 实现，基于 libuv（Node.js 的事件循环），性能比纯 Python asyncio 快 2-4 倍。

\`\`\`bash
# 安装
pip install uvloop

# Uvicorn 自动检测并使用（--loop auto 默认选 uvloop）
uvicorn main:app --loop uvloop

# 强制使用原生 asyncio
uvicorn main:app --loop asyncio
\`\`\`

### 5.2 httptools

httptools 是 Node.js HTTP 解析器的 Python 绑定，比纯 Python 的 h11 快 5-10 倍。

\`\`\`bash
pip install httptools

# 自动检测
uvicorn main:app --http httptools
\`\`\`

### 5.3 性能对比

\`\`\`bash
# 测试脚本
# app.py
from fastapi import FastAPI
app = FastAPI()

@app.get('/')
async def root():
    return {'hello': 'world'}
\`\`\`

\`\`\`bash
# 1. 纯 asyncio + h11
uvicorn app:app --loop asyncio --http h11
ab -n 10000 -c 100 http://localhost:8000/
# Requests per second:    2500.30

# 2. uvloop + httptools（推荐）
uvicorn app:app --loop uvloop --http httptools
ab -n 10000 -c 100 http://localhost:8000/
# Requests per second:    8500.50  ← 3.4 倍！
\`\`\`

### 5.4 macOS 上的 uvloop

\`\`\`bash
# uvloop 在 macOS 上也可用，但基于 libuv，性能略低于 Linux
# 安装
pip install uvloop

# 注意：Windows 不支持 uvloop
# Windows 只能用 asyncio
uvicorn main:app --loop asyncio  # Windows 强制
\`\`\`

## 六、实战：用 Uvicorn 跑 FastAPI

### 6.1 项目结构

\`\`\`
myfastapi/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── routers/
│       ├── __init__.py
│       └── users.py
├── requirements.txt
└── .env
\`\`\`

### 6.2 应用代码

\`\`\`python
# app/main.py
from fastapi import FastAPI
from .routers import users

app = FastAPI(title='My API', version='1.0.0')

app.include_router(users.router)

@app.get('/')
async def root():
    return {'message': 'Hello from FastAPI + Uvicorn!'}

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/slow')
async def slow():
    import asyncio
    await asyncio.sleep(2)  # 异步 sleep，不阻塞其他请求
    return {'message': 'slow done'}
\`\`\`

\`\`\`python
# app/routers/users.py
from fastapi import APIRouter

router = APIRouter(prefix='/users', tags=['users'])

@router.get('/')
async def list_users():
    return [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]

@router.get('/{user_id}')
async def get_user(user_id: int):
    return {'id': user_id, 'name': f'User {user_id}'}
\`\`\`

### 6.3 启动与测试

\`\`\`bash
# 安装依赖
pip install fastapi uvicorn[standard]

# 开发模式（热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 输出：
# INFO:     Will watch for changes in these directories: ['/opt/myfastapi']
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345] using WatchFiles
# INFO:     Started server process [12346]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.

# 测试
curl http://localhost:8000/
# {"message":"Hello from FastAPI + Uvicorn!"}

curl http://localhost:8000/users/
# [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]

# 自动文档
open http://localhost:8000/docs      # Swagger UI
open http://localhost:8000/redoc     # ReDoc

# 并发测试：同时发起 100 个慢请求
for i in {1..100}; do
    curl http://localhost:8000/slow &
done
wait
# 所有请求几乎同时返回（因为异步 sleep 不阻塞）
\`\`\`

### 6.4 使用环境变量文件

\`\`\`bash
# .env
APP_HOST=0.0.0.0
APP_PORT=8000
APP_WORKERS=4
\`\`\`

\`\`\`bash
# 加载 .env
uvicorn app.main:app --env-file .env --host 0.0.0.0 --port 8000
\`\`\`

\`\`\`python
# 在应用中读取环境变量
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_host: str = '127.0.0.1'
    app_port: int = 8000
    
    class Config:
        env_file = '.env'

settings = Settings()
\`\`\`

## 七、实战：用 Uvicorn 跑 Starlette

### 7.1 Starlette 应用

\`\`\`python
# app.py
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse

async def homepage(request):
    return JSONResponse({'hello': 'world'})

async def slow(request):
    import asyncio
    await asyncio.sleep(2)
    return JSONResponse({'done': True})

routes = [
    Route('/', homepage),
    Route('/slow', slow),
]

app = Starlette(routes=routes)
\`\`\`

\`\`\`bash
uvicorn app:app --reload
\`\`\`

### 7.2 WebSocket 支持

\`\`\`python
# ws_app.py
from starlette.applications import Starlette
from starlette.routing import Route, WebSocketRoute
from starlette.responses import JSONResponse

async def homepage(request):
    return JSONResponse({'hello': 'world'})

async def websocket_endpoint(websocket):
    await websocket.accept()
    await websocket.send_text('Hello WebSocket!')
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f'Echo: {data}')
    except Exception:
        pass

routes = [
    Route('/', homepage),
    WebSocketRoute('/ws', websocket_endpoint),
]

app = Starlette(routes=routes)
\`\`\`

\`\`\`bash
uvicorn ws_app:app --reload

# 测试 WebSocket（用 websocat）
pip install websocat
websocat ws://localhost:8000/ws
# Hello WebSocket!
# > Hi
# Echo: Hi
\`\`\`

## 八、配置文件

### 8.1 使用 JSON/YAML 配置

Uvicorn 不像 Gunicorn 有原生 Python 配置文件，但可以：

\`\`\`python
# run.py - 自定义启动脚本
import uvicorn

if __name__ == '__main__':
    config = {
        'app': 'app.main:app',
        'host': '0.0.0.0',
        'port': 8000,
        'workers': 4,
        'loop': 'uvloop',
        'http': 'httptools',
        'reload': False,
        'log_level': 'info',
        'access_log': True,
        'proxy_headers': True,
        'forwarded_allow_ips': '*',
        'timeout_keep_alive': 5,
    }
    uvicorn.run(**config)
\`\`\`

\`\`\`bash
python run.py
\`\`\`

### 8.2 日志配置

\`\`\`yaml
# logging.yaml
version: 1
disable_existing_loggers: False

formatters:
  default:
    (): 'uvicorn.logging.DefaultFormatter'
    fmt: '%(levelprefix)s %(asctime)s %(name)s - %(message)s'
    datefmt: '%Y-%m-%d %H:%M:%S'
  access:
    (): 'uvicorn.logging.AccessFormatter'
    fmt: '%(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s'

handlers:
  default:
    formatter: default
    class: logging.StreamHandler
    stream: ext://sys.stderr
  access:
    formatter: access
    class: logging.StreamHandler
    stream: ext://sys.stdout

loggers:
  uvicorn:
    handlers: [default]
    level: INFO
    propagate: False
  uvicorn.error:
    level: INFO
  uvicorn.access:
    handlers: [access]
    level: INFO
    propagate: False
\`\`\`

\`\`\`bash
uvicorn main:app --log-config logging.yaml
\`\`\`

## 九、--workers 多进程

### 9.1 启用多 worker

\`\`\`bash
# 4 个 worker 进程
uvicorn main:app --workers 4

# 输出：
# INFO:     Started parent process [12345]
# INFO:     Started server process [12346]
# INFO:     Started server process [12347]
# INFO:     Started server process [12348]
# INFO:     Started server process [12349]
\`\`\`

### 9.2 --workers 实现原理

Uvicorn 的 \`--workers\` 内部使用 \`multiprocessing\`，每个 worker 是独立进程，拥有独立的 asyncio 事件循环。

\`\`\`
┌─────────────────────────────────────┐
│         Uvicorn Parent              │
│  (类似 master，但不管理 worker)      │
└──────┬──────────────────────────────┘
       │ fork()
  ┌────┼────┬────┬────┐
  ▼    ▼    ▼    ▼    ▼
┌────┐┌────┐┌────┐┌────┐
│ W1 ││ W2 ││ W3 ││ W4 │
│async│async│async│async│  ← 各自独立的 asyncio loop
└────┘└────┘└────┘└────┘
\`\`\`

### 9.3 --workers 注意事项

\`\`\`bash
# ❌ --workers 与 --reload 不能同时用
uvicorn main:app --workers 4 --reload
# 错误：--reload and --workers are not compatible

# ✅ 开发用 --reload，生产用 --workers
# 开发：
uvicorn main:app --reload
# 生产：
uvicorn main:app --workers 4

# 推荐：生产环境用 Gunicorn + UvicornWorker（下一章）
\`\`\`

### 9.4 worker 数量选择

\`\`\`bash
# CPU 核数
nproc  # 4

# 异步应用的 worker 数量
# 因为单 worker 已能处理数千并发，worker 数量主要为了利用多核
# 推荐：CPU * 1 + 1（比 Gunicorn 少，因为单 worker 已强）
uvicorn main:app --workers 5  # 4 核 → 5 worker

# 或 CPU 核数
uvicorn main:app --workers 4
\`\`\`

## 十、SSL/HTTPS 配置

### 10.1 自签证书

\`\`\`bash
# 生成自签证书（测试用）
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj '/CN=localhost'

# 启动 HTTPS
uvicorn main:app --ssl-keyfile key.pem --ssl-certfile cert.pem --port 8443

# 测试
curl -k https://localhost:8443/
\`\`\`

### 10.2 生产证书

\`\`\`bash
# Let's Encrypt 证书
certbot certonly --standalone -d example.com
# 证书在 /etc/letsencrypt/live/example.com/

# 启动
uvicorn main:app \\
    --ssl-keyfile /etc/letsencrypt/live/example.com/privkey.pem \\
    --ssl-certfile /etc/letsencrypt/live/example.com/fullchain.pem \\
    --port 443
\`\`\`

### 10.3 HTTP/2 支持

\`\`\`bash
# 需要安装 h2
pip install h2

# 启用 HTTP/2
uvicorn main:app --ssl-keyfile key.pem --ssl-certfile cert.pem --h11-max-incomplete-event-size 0

# 注：Uvicorn 对 HTTP/2 的支持通过 SSL ALPN 协商
\`\`\`

## 十一、代理头配置

### 11.1 反代场景

\`\`\`bash
# Nginx 反代到 Uvicorn 时，需要 --proxy-headers
# 否则 Uvicorn 会把请求视为来自 Nginx 而非真实客户端

uvicorn main:app --proxy-headers --forwarded-allow-ips '*'
\`\`\`

### 11.2 Nginx 配置

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket 支持
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
\`\`\`

\`\`\`python
# 在 FastAPI 中获取真实 IP
from fastapi import Request, FastAPI

app = FastAPI()

@app.get('/ip')
async def get_ip(request: Request):
    # 启用 --proxy-headers 后，request.client.host 是真实 IP
    return {'ip': request.client.host}
\`\`\`

## 十二、并发限制

### 12.1 limit-concurrency

\`\`\`bash
# 限制最大并发连接数
uvicorn main:app --limit-concurrency 1000

# 超过限制时返回 503
\`\`\`

### 12.2 limit-max-requests（测试用）

\`\`\`bash
# 处理 1000 请求后退出（用于测试、压测）
uvicorn main:app --limit-max-requests 1000
\`\`\`

### 12.3 backlog

\`\`\`bash
# 等待连接队列大小
uvicorn main:app --backlog 2048
\`\`\`

## 十三、生命周期事件

### 13.1 lifespan 协议

\`\`\`python
# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    print('应用启动，初始化资源...')
    app.state.db = await connect_db()
    app.state.redis = await connect_redis()
    
    yield  # 应用运行期间
    
    # 关闭时执行
    print('应用关闭，清理资源...')
    await app.state.db.close()
    await app.state.redis.close()

app = FastAPI(lifespan=lifespan)
\`\`\`

\`\`\`bash
uvicorn main:app

# 输出：
# INFO:     Waiting for application startup.
# 应用启动，初始化资源...
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://127.0.0.1:8000

# Ctrl+C 关闭时：
# INFO:     Shutting down
# 应用关闭，清理资源...
# INFO:     Waiting for application shutdown.
# INFO:     Application shutdown complete.
\`\`\`

### 13.2 禁用 lifespan

\`\`\`bash
# 某些应用不需要 lifespan，可禁用以加速启动
uvicorn main:app --lifespan off
\`\`\`

## 十四、常见问题

### 14.1 阻塞事件循环

\`\`\`python
# ❌ 错误：同步阻塞代码卡住整个事件循环
@app.get('/block')
async def block():
    import time
    time.sleep(5)  # 阻塞！其他请求全部卡住
    return 'done'

# ✅ 正确：用 asyncio.to_thread 或 run_in_executor
import asyncio

@app.get('/block')
async def block():
    # 阻塞代码放线程池
    await asyncio.to_thread(time.sleep, 5)
    return 'done'

# ✅ 或使用 async 版本的库
@app.get('/http')
async def http_call():
    import httpx
    async with httpx.AsyncClient() as client:
        r = await client.get('https://api.example.com')
    return r.json()
\`\`\`

### 14.2 workers 数量过多

\`\`\`bash
# ❌ 8 核机器用 16 个 worker
uvicorn main:app --workers 16
# 因为异步应用单 worker 已能处理数千并发，
# 16 个 worker 反而占用内存和 CPU 切换

# ✅ 8 核机器用 8-9 个 worker
uvicorn main:app --workers 9
\`\`\`

### 14.3 reload 不工作

\`\`\`bash
# 检查 watchfiles 是否安装
pip show watchfiles

# 指定监听目录
uvicorn main:app --reload --reload-dir ./app

# 排除某些文件
uvicorn main:app --reload --reload-exclude '*.log' --reload-exclude 'data/*'
\`\`\`

## 十五、小结

本章介绍了 Uvicorn 的核心知识：

1. **Uvicorn 是 ASGI Server**，专为异步 Python Web 应用设计
2. **基于 uvloop + httptools**，性能远超同步方案
3. **支持 WebSocket、HTTP/2、SSL**
4. **--workers 多进程**利用多核（生产环境推荐 Gunicorn + UvicornWorker）
5. **--reload 热重载**用于开发
6. **--proxy-headers** 配合 Nginx 反代
7. **lifespan 协议**管理应用生命周期

下一章讲解生产环境推荐的 Gunicorn + Uvicorn 组合方案。
`
  },
  {
    id: "deploy-uvicorn-gunicorn",
    icon: "🔗",
    title: "Gunicorn + Uvicorn 组合",
    group: "Gunicorn 与 Uvicorn",
    content: `# Gunicorn + Uvicorn 组合

## 一、为什么生产用 Gunicorn + UvicornWorker

### 1.1 纯 Uvicorn --workers 的局限

上一章提到 Uvicorn 可以用 \`--workers\` 多进程：

\`\`\`bash
uvicorn main:app --workers 4
\`\`\`

但这在生产环境有局限：

| 问题 | 说明 |
|------|------|
| 无 master 进程管理 | worker 崩溃后不会自动重启 |
| 无优雅重启 | 代码更新需要停服 |
| 无热升级 | 升级 Uvicorn 版本需停服 |
| 无信号处理 | 无法用 HUP/USR2 等信号 |
| 无 max_requests | 无法定期回收 worker |
| 无完善的日志 | 日志管理功能弱 |

### 1.2 Gunicorn + UvicornWorker 的优势

Gunicorn 提供成熟的 **master-worker 进程管理**，UvicornWorker 则提供 **异步高性能**。两者结合：

\`\`\`
┌─────────────────────────────────────────┐
│         Gunicorn Master                 │
│  (进程管理、信号、日志、优雅重启)         │
└──────────┬──────────────────────────────┘
           │ fork()
   ┌───────┼───────┬───────┬───────┐
   ▼       ▼       ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ W1  │ │ W2  │ │ W3  │ │ W4  │ │ W5  │
│uvl  │ │uvl  │ │uvl  │ │uvl  │ │uvl  │  ← UvicornWorker
│oop  │ │oop  │ │oop  │ │oop  │ │oop  │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼
       FastAPI / Starlette / Django ASGI
\`\`\`

**优势**：

- ✅ Gunicorn 成熟的 master 管理 worker
- ✅ Uvicorn 的 uvloop + httptools 高性能
- ✅ 支持 HUP 优雅重启、USR2 热升级
- ✅ 支持 max_requests 防内存泄漏
- ✅ 完善的日志、信号、钩子机制
- ✅ 官方推荐方案

### 1.3 官方推荐

FastAPI、Starlette、Uvicorn 官方文档均推荐生产环境使用 Gunicorn + UvicornWorker：

> "If you want to use HTTP/2 or async features, you can use Gunicorn with the Uvicorn worker class."
> —— Uvicorn 官方文档

## 二、安装与配置

### 2.1 安装

\`\`\`bash
# 同时安装 Gunicorn 和 Uvicorn
pip install gunicorn uvicorn[standard]

# 验证
gunicorn --version
# gunicorn (version 21.2.0)

python -c "from uvicorn.workers import UvicornWorker; print('OK')"
# OK
\`\`\`

### 2.2 基本启动

\`\`\`bash
# 使用 UvicornWorker
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000 main:app

# 输出：
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Starting gunicorn 21.2.0
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Listening at: http://0.0.0.0:8000 (12345)
# [2024-01-01 10:00:00 +0800] [12345] [INFO] Using worker: uvicorn.workers.UvicornWorker
# [2024-01-01 10:00:00 +0800] [12346] [INFO] Booting worker with pid: 12346
# [2024-01-01 10:00:00 +0800] [12347] [INFO] Booting worker with pid: 12347
\`\`\`

### 2.3 UvicornWorker 配置

UvicornWorker 通过 Gunicorn 配置文件 + 环境变量配置：

\`\`\`python
# gunicorn_config.py
import multiprocessing
import os

# ===== Gunicorn 通用配置 =====
bind = '0.0.0.0:8000'
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'uvicorn.workers.UvicornWorker'
timeout = 60
graceful_timeout = 30
keepalive = 2

# 进程管理
max_requests = 2000
max_requests_jitter = 100
preload_app = False  # UvicornWorker 推荐 False

# 日志
accesslog = '/var/log/gunicorn/access.log'
errorlog = '/var/log/gunicorn/error.log'
loglevel = 'info'

# ===== UvicornWorker 专属配置（通过环境变量） =====
os.environ['UVICORN_LOOP'] = 'uvloop'      # 事件循环
os.environ['UVICORN_HTTP'] = 'httptools'   # HTTP 解析器
os.environ['UVICORN_WS'] = 'websockets'    # WebSocket 实现
os.environ['UVICORN_LIFESPAN'] = 'on'      # 生命周期
os.environ['UVICORN_LOG_LEVEL'] = 'info'

# SSL（如果需要）
# os.environ['UVICORN_SSL_KEYFILE'] = '/path/to/key.pem'
# os.environ['UVICORN_SSL_CERTFILE'] = '/path/to/cert.pem'

# 钩子
def post_fork(server, worker):
    server.log.info(f'UvicornWorker {worker.pid} 启动')
\`\`\`

\`\`\`bash
# 使用配置文件
gunicorn -c gunicorn_config.py main:app
\`\`\`

### 2.4 通过命令行传递 Uvicorn 配置

Gunicorn 不识别 Uvicorn 的命令行参数，但可以通过环境变量：

\`\`\`bash
# 临时设置环境变量
UVICORN_LOOP=uvloop UVICORN_HTTP=httptools \\
gunicorn -k uvicorn.workers.UvicornWorker -w 4 main:app
\`\`\`

## 三、worker 数量调优

### 3.1 异步任务的 worker 数量

异步应用（FastAPI）与同步应用（Flask）的 worker 调优策略不同：

| 应用类型 | 单 worker 并发 | 推荐 worker 数 |
|----------|----------------|----------------|
| Flask（sync） | 1 | CPU * 2 + 1 |
| FastAPI（async） | 1000+ | CPU + 1 或 CPU * 1 + 1 |

\`\`\`bash
# 4 核服务器

# Flask：4 * 2 + 1 = 9 worker
gunicorn -k sync -w 9 flask_app:app

# FastAPI：4 + 1 = 5 worker（单 worker 已处理数千并发）
gunicorn -k uvicorn.workers.UvicornWorker -w 5 fastapi_app:app

# 或直接 CPU 核数
gunicorn -k uvicorn.workers.UvicornWorker -w 4 fastapi_app:app
\`\`\`

### 3.2 为什么异步应用 worker 少

\`\`\`
同步（Flask + sync worker）：
- 1 worker 一次处理 1 请求
- 1000 并发需要 1000 worker → 不现实

异步（FastAPI + UvicornWorker）：
- 1 worker 用 asyncio 同时处理 1000+ 请求
- 1000 并发只需 1-2 worker
- 多 worker 主要是利用多核 CPU
\`\`\`

### 3.3 worker 数量测试

\`\`\`bash
# FastAPI 应用
cat > app.py << 'EOF'
from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.get('/')
async def root():
    return {'hello': 'world'}

@app.get('/slow')
async def slow():
    await asyncio.sleep(1)
    return {'done': True}
EOF

# 1 worker
gunicorn -k uvicorn.workers.UvicornWorker -w 1 app:app &
ab -n 5000 -c 100 http://localhost:8000/
# Requests per second:    4200.50

# 2 worker
gunicorn -k uvicorn.workers.UvicornWorker -w 2 app:app &
ab -n 5000 -c 100 http://localhost:8000/
# Requests per second:    8100.30

# 4 worker
gunicorn -k uvicorn.workers.UvicornWorker -w 4 app:app &
ab -n 5000 -c 100 http://localhost:8000/
# Requests per second:    15500.20

# 8 worker（过度）
gunicorn -k uvicorn.workers.UvicornWorker -w 8 app:app &
ab -n 5000 -c 100 http://localhost:8000/
# Requests per second:    14800.10（下降，因为内存/CPU 开销）
\`\`\`

## 四、对比纯 Uvicorn --workers

### 4.1 进程管理对比

| 特性 | Uvicorn --workers | Gunicorn + UvicornWorker |
|------|-------------------|--------------------------|
| worker 崩溃自动重启 | ❌ | ✅ |
| HUP 优雅重启 | ❌ | ✅ |
| USR2 热升级 | ❌ | ✅ |
| TTIN/TTOU 调整 worker | ❌ | ✅ |
| max_requests | ❌ | ✅ |
| preload_app | ❌ | ✅ |
| 配置文件 | Python 脚本 | 成熟 Python 配置 |
| 日志管理 | 弱 | 强 |
| 钩子机制 | 弱 | 强 |

### 4.2 压测对比

\`\`\`bash
# 同样的 FastAPI 应用

# 1. Uvicorn --workers 4
uvicorn app:app --workers 4 --host 0.0.0.0 --port 8001 &
ab -n 10000 -c 100 http://localhost:8001/
# Requests per second:    15200.30

# 2. Gunicorn + UvicornWorker -w 4
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8002 app:app &
ab -n 10000 -c 100 http://localhost:8002/
# Requests per second:    15050.80

# 性能几乎相同，但 Gunicorn 提供更好的进程管理
\`\`\`

### 4.3 worker 崩溃测试

\`\`\`bash
# 应用代码故意崩溃
cat > crash.py << 'EOF'
import os
import signal
from fastapi import FastAPI

app = FastAPI()

@app.get('/crash')
async def crash():
    os.kill(os.getpid(), signal.SIGKILL)  # 模拟崩溃

@app.get('/')
async def root():
    return {'hello': 'world'}
EOF

# 1. Uvicorn --workers
uvicorn crash:app --workers 4 &
curl http://localhost:8000/crash  # worker 崩溃
# 之后该端口无响应（worker 没有自动重启）

# 2. Gunicorn + UvicornWorker
gunicorn -k uvicorn.workers.UvicornWorker -w 4 crash:app &
curl http://localhost:8000/crash  # worker 崩溃
# 日志：[INFO] Worker (pid: 12346) was sent SIGABRT
# 日志：[INFO] Booting worker with pid: 12350  ← 自动重启！
curl http://localhost:8000/  # 仍然可用
\`\`\`

## 五、systemd 服务配置

### 5.1 创建 systemd 服务

\`\`\`ini
# /etc/systemd/system/gunicorn-myapp.service
[Unit]
Description=Gunicorn + UvicornWorker for MyApp
After=network.target

[Service]
Type=notify
# 通知 systemd 服务就绪（需 gunicorn >= 20.1, sdnotify）
User=www-data
Group=www-data

# 工作目录
WorkingDirectory=/opt/myapp

# 虚拟环境
Environment="PATH=/opt/myapp/venv/bin"

# 启动命令
ExecStart=/opt/myapp/venv/bin/gunicorn \\
    -k uvicorn.workers.UvicornWorker \\
    -w 4 \\
    -b 0.0.0.0:8000 \\
    --access-logfile - \\
    --error-logfile - \\
    main:app

# 优雅重启
ExecReload=/bin/kill -s HUP \$MAINPID

# 优雅停止
KillMode=mixed
TimeoutStopSec=30

# 重启策略
Restart=on-failure
RestartSec=5

# 资源限制
LimitNOFILE=65536

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=gunicorn-myapp

[Install]
WantedBy=multi-user.target
\`\`\`

### 5.2 管理服务

\`\`\`bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动
sudo systemctl start gunicorn-myapp

# 停止
sudo systemctl stop gunicorn-myapp

# 重启（停止 + 启动）
sudo systemctl restart gunicorn-myapp

# 优雅重载（HUP 信号，不中断服务）
sudo systemctl reload gunicorn-myapp

# 查看状态
sudo systemctl status gunicorn-myapp
# ● gunicorn-myapp.service - Gunicorn + UvicornWorker for MyApp
#    Loaded: loaded (/etc/systemd/system/gunicorn-myapp.service; enabled)
#    Active: active (running) since ...
#      Docs: man:gunicorn(1)
#  Main PID: 12345 (gunicorn)
#     Tasks: 5 (limit: 4915)
#    CGroup: /system.slice/gunicorn-myapp.service
#            ├─12345 /opt/myapp/venv/bin/gunicorn -k uvicorn.workers.UvicornWorker
#            ├─12346 gunicorn: worker [uvicorn]
#            ├─12347 gunicorn: worker [uvicorn]
#            ├─12348 gunicorn: worker [uvicorn]
#            └─12349 gunicorn: worker [uvicorn]

# 查看日志
sudo journalctl -u gunicorn-myapp -f

# 开机自启
sudo systemctl enable gunicorn-myapp
\`\`\`

### 5.3 使用 socket 激活

\`\`\`ini
# /etc/systemd/system/gunicorn-myapp.socket
[Unit]
Description=Gunicorn Socket

[Socket]
ListenStream=/run/gunicorn-myapp.sock
# 或网络 socket
# ListenStream=0.0.0.0:8000

[Install]
WantedBy=sockets.target
\`\`\`

\`\`\`ini
# /etc/systemd/system/gunicorn-myapp.service 修改
[Service]
# Gunicorn 通过环境变量接收 socket
ExecStart=/opt/myapp/venv/bin/gunicorn \\
    -k uvicorn.workers.UvicornWorker \\
    -w 4 \\
    main:app
\`\`\`

\`\`\`bash
# 启用 socket 激活
sudo systemctl enable gunicorn-myapp.socket
sudo systemctl start gunicorn-myapp.socket
# 服务会在第一个连接到来时启动
\`\`\`

## 六、Docker 中运行

### 6.1 Dockerfile

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \\
    libev-dev \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-w", "4", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", \\
     "--error-logfile", "-", \\
     "--timeout", "60", \\
     "--keep-alive", "5", \\
     "main:app"]
\`\`\`

### 6.2 requirements.txt

\`\`\`
fastapi==0.110.0
gunicorn==21.2.0
uvicorn[standard]==0.30.0
\`\`\`

### 6.3 构建与运行

\`\`\`bash
# 构建镜像
docker build -t myapp:latest .

# 运行容器
docker run -d \\
    --name myapp \\
    -p 8000:8000 \\
    --memory="1g" \\
    --cpus="4" \\
    --restart=unless-stopped \\
    myapp:latest

# 查看日志
docker logs -f myapp

# 测试
curl http://localhost:8000/
\`\`\`

### 6.4 docker-compose

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    container_name: myapp
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 1G
        reservations:
          memory: 512M
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app

volumes:
  pgdata:
\`\`\`

\`\`\`bash
# 启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f app
\`\`\`

### 6.5 容器中 worker 数量配置

容器中 CPU 限制需要从 cgroup 读取：

\`\`\`python
# gunicorn_config.py - 容器感知
import multiprocessing
import os

def get_cpu_count():
    # 尝试从 cgroup v2 读取
    try:
        with open('/sys/fs/cgroup/cpu.max') as f:
            quota, period = f.read().split()
            if quota == 'max':
                return multiprocessing.cpu_count()
            return int(int(quota) / int(period))
    except FileNotFoundError:
        pass
    
    # cgroup v1
    try:
        with open('/sys/fs/cgroup/cpu/cpu.cfs_quota_us') as f:
            quota = int(f.read())
        with open('/sys/fs/cgroup/cpu/cpu.cfs_period_us') as f:
            period = int(f.read())
        if quota > 0:
            return max(1, quota // period)
    except FileNotFoundError:
        pass
    
    return multiprocessing.cpu_count()

workers = get_cpu_count() + 1
worker_class = 'uvicorn.workers.UvicornWorker'
bind = '0.0.0.0:8000'
\`\`\`

## 七、完整生产部署示例

### 7.1 项目结构

\`\`\`
myapp/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── database.py
│   └── models/
│       └── user.py
├── gunicorn_config.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .env
\`\`\`

### 7.2 应用代码

\`\`\`python
# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.routes import router
from app.core.database import init_db, close_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动
    await init_db()
    yield
    # 关闭
    await close_db()

app = FastAPI(title='MyApp', version='1.0.0', lifespan=lifespan)
app.include_router(router, prefix='/api')
\`\`\`

\`\`\`python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = 'postgresql://user:pass@localhost/myapp'
    redis_url: str = 'redis://localhost:6379/0'
    debug: bool = False
    
    class Config:
        env_file = '.env'

settings = Settings()
\`\`\`

\`\`\`python
# app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.config import settings

engine = None

async def init_db():
    global engine
    engine = create_async_engine(settings.database_url, pool_size=20, max_overflow=10)

async def close_db():
    if engine:
        await engine.dispose()
\`\`\`

\`\`\`python
# app/api/routes.py
from fastapi import APIRouter

router = APIRouter()

@router.get('/health')
async def health():
    return {'status': 'ok'}

@router.get('/users')
async def list_users():
    return [{'id': 1, 'name': 'Alice'}]
\`\`\`

### 7.3 Gunicorn 配置文件

\`\`\`python
# gunicorn_config.py
import multiprocessing
import os

# ===== 监听 =====
bind = '0.0.0.0:8000'
backlog = 2048

# ===== Worker =====
worker_class = 'uvicorn.workers.UvicornWorker'

# 容器感知 worker 数
def get_workers():
    try:
        with open('/sys/fs/cgroup/cpu.max') as f:
            quota, period = f.read().split()
            if quota != 'max':
                return int(int(quota) / int(period)) + 1
    except FileNotFoundError:
        pass
    return multiprocessing.cpu_count() + 1

workers = get_workers()
timeout = 60
graceful_timeout = 30
keepalive = 5

# ===== 进程管理 =====
max_requests = 2000
max_requests_jitter = 100
preload_app = False

# ===== UvicornWorker 配置 =====
os.environ['UVICORN_LOOP'] = 'uvloop'
os.environ['UVICORN_HTTP'] = 'httptools'
os.environ['UVICORN_WS'] = 'websockets'
os.environ['UVICORN_LIFESPAN'] = 'on'

# ===== 日志 =====
accesslog = '-'  # 输出到 stdout（容器友好）
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(t)s "%(r)s" %(s)s %(b)s %(D)sμs "%(f)s" "%(a)s"'

# ===== 其他 =====
proc_name = 'myapp'
worker_tmp_dir = '/dev/shm'

# ===== 钩子 =====
def on_starting(server):
    server.log.info('Gunicorn 启动中...')

def when_ready(server):
    server.log.info(f'服务就绪，监听: {server.address}')

def post_fork(server, worker):
    server.log.info(f'UvicornWorker {worker.pid} 启动')

def worker_exit(server, worker):
    server.log.info(f'Worker {worker.pid} 退出')
\`\`\`

### 7.4 Nginx 配置

\`\`\`nginx
# nginx.conf
upstream myapp_backend {
    server app:8000 fail_timeout=0;
    # 多实例负载均衡
    # server app2:8000;
    # server app3:8000;
    
    keepalive 32;
}

server {
    listen 80;
    server_name example.com;
    
    # 重定向到 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # 请求大小限制
    client_max_body_size 50M;
    
    # 反代到 Gunicorn
    location / {
        proxy_pass http://myapp_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        
        # Uvicorn 需要
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://myapp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;  # WS 长连接
    }
    
    # 静态文件
    location /static/ {
        alias /opt/myapp/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查（直连 app）
    location /health {
        proxy_pass http://myapp_backend;
        access_log off;
    }
}
\`\`\`

### 7.5 完整启动流程

\`\`\`bash
# 1. 启动数据库等
docker-compose up -d db redis

# 2. 启动应用
docker-compose up -d app

# 3. 启动 Nginx
docker-compose up -d nginx

# 4. 验证
curl https://example.com/api/health
# {"status":"ok"}

# 5. 查看应用日志
docker-compose logs -f app

# 6. 优雅重载应用（更新代码后）
docker-compose exec app kill -HUP 1
# 或重启容器
docker-compose restart app
\`\`\`

## 八、性能调优

### 8.1 数据库连接池

\`\`\`python
# SQLAlchemy 异步连接池
from sqlalchemy.ext.asyncio import create_async_engine

# worker 数 × pool_size = 总连接数
# 4 worker × 20 pool = 80 连接
# 数据库 max_connections 要 >= 80
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)
\`\`\`

### 8.2 调优清单

\`\`\`bash
# 1. 系统参数
# /etc/sysctl.conf
net.core.somaxconn = 2048
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 600
fs.file-max = 655350

# 生效
sysctl -p

# 2. 文件描述符
# /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535

# 3. Gunicorn 参数
# - workers: CPU + 1
# - max_requests: 2000（防泄漏）
# - timeout: 60（视应用而定）
# - keepalive: 5

# 4. Nginx 参数
# - worker_processes: auto
# - worker_connections: 10240
# - keepalive_timeout: 65
\`\`\`

### 8.3 监控

\`\`\`python
# 暴露 metrics
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import FastAPI, Response

app = FastAPI()

REQUEST_COUNT = Counter('http_requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Latency')

@app.middleware('http')
async def metrics(request, call_next):
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.time():
        return await call_next(request)

@app.get('/metrics')
async def metrics():
    return Response(generate_latest(), media_type='text/plain')
\`\`\`

## 九、常见问题

### 9.1 worker 启动失败

\`\`\`bash
gunicorn -k uvicorn.workers.UvicornWorker main:app
# ImportError: No module named 'uvicorn.workers.UvicornWorker'

# 排查：
# 1. 确认 uvicorn 已安装
pip show uvicorn

# 2. 确认 worker 类路径正确（区分大小写）
python -c "from uvicorn.workers import UvicornWorker; print('OK')"

# 3. 新版本可能改名
# 新版本：uvicorn.workers.UvicornWorker
# 老版本：uvicorn.workers.UvicornWorker（一致）
\`\`\`

### 9.2 lifespan 不工作

\`\`\`bash
# 现象：FastAPI lifespan 钩子不执行

# 排查：UvicornWorker 默认 lifespan=auto
# 显式启用
os.environ['UVICORN_LIFESPAN'] = 'on'
\`\`\`

### 9.3 数据库连接耗尽

\`\`\`bash
# 现象：psql: FATAL: sorry, too many clients already

# 原因：worker × pool_size > max_connections
# 解决：
# 1. 减少 pool_size
# 2. 增加 max_connections
# 3. 使用 PgBouncer 连接池
\`\`\`

## 十、小结

本章介绍了生产环境推荐的 Gunicorn + UvicornWorker 组合：

1. **结合两者优势**：Gunicorn 进程管理 + Uvicorn 异步性能
2. **UvicornWorker 配置**：通过 Gunicorn 配置文件 + 环境变量
3. **worker 数量调优**：异步应用用 CPU + 1，比同步少
4. **对比纯 Uvicorn**：进程管理、优雅重启、热升级等优势
5. **systemd 服务**：生产部署的标准方式
6. **Docker 部署**：容器化运行，配置文件容器感知
7. **完整生产架构**：Nginx → Gunicorn + UvicornWorker → FastAPI → DB

下一章对比各种 WSGI/ASGI 服务器，给出选型决策。
`
  },
  {
    id: "deploy-app-server-compare",
    icon: "📊",
    title: "应用服务器对比与选型",
    group: "Gunicorn 与 Uvicorn",
    content: `# 应用服务器对比与选型

## 一、WSGI 服务器对比

### 1.1 主流 WSGI 服务器

| 服务器 | 语言 | 主要特点 | 典型用户 |
|--------|------|----------|----------|
| **Gunicorn** | Python | 简单稳定，预 fork | Instagram, Mozilla |
| **uWSGI** | C | 功能丰富，性能高 | OpenStack, Reddit |
| **mod_wsgi** | C | Apache 模块 | 传统 Apache 站点 |
| **Waitress** | Python | 纯 Python，跨平台 | Pyramid 项目 |
| **Gevent** | Python | 协程异步 | 早期异步项目 |

### 1.2 Gunicorn

\`\`\`bash
# 安装
pip install gunicorn

# 启动
gunicorn -w 4 -b 0.0.0.0:8000 myapp:app
\`\`\`

**优点**：
- ✅ 配置简单，文档清晰
- ✅ 稳定性高，社区活跃
- ✅ 多种 worker 类型（sync/gevent/uvicorn）
- ✅ 信号机制完善（HUP/USR2/TTIN）
- ✅ 配置文件友好

**缺点**：
- ❌ 纯 Python，性能不如 uWSGI
- ❌ 不内置缓存、路由功能

**适用场景**：99% 的 Python Web 项目，是默认选择。

### 1.3 uWSGI

\`\`\`bash
# 安装
pip install uwsgi

# 启动
uwsgi --http :8000 --wsgi-file myapp.py --processes 4
\`\`\`

**优点**：
- ✅ C 实现，性能极高
- ✅ 功能丰富：缓存、队列、信号、定时任务
- ✅ 多协议：WSGI、HTTP、FastCGI、SCGI
- ✅ Emperor 模式管理多应用

**缺点**：
- ❌ 配置复杂，文档晦涩
- ❌ 内存占用较高
- ❌ 配置项 800+，学习曲线陡

**适用场景**：需要高级功能（缓存、队列）、超大规模部署。

\`\`\`ini
# uwsgi.ini - uWSGI 配置示例
[uwsgi]
http = :8000
wsgi-file = myapp.py
processes = 4
threads = 2
master = true
vacuum = true
die-on-term = true
max-requests = 5000
# 缓存
cache2 = name=mycache,items=100
# 静态文件
static-map = /static=/opt/myapp/static
\`\`\`

### 1.4 mod_wsgi

\`\`\`apache
# Apache 配置
LoadModule wsgi_module modules/mod_wsgi.so

<VirtualHost *:80>
    ServerName example.com
    WSGIDaemonProcess myapp processes=4 threads=2
    WSGIProcessGroup myapp
    WSGIScriptAlias / /opt/myapp/wsgi.py
</VirtualHost>
\`\`\`

**优点**：
- ✅ 直接集成 Apache，无需独立进程
- ✅ 性能良好（C 实现）
- ✅ 适合传统 Apache 运维

**缺点**：
- ❌ 绑定 Apache，不能用于 Nginx
- ❌ 配置复杂，调试困难
- ❌ 与 Apache 版本耦合

**适用场景**：已有 Apache 基础设施的传统项目。

### 1.5 Waitress

\`\`\`bash
# 安装
pip install waitress

# 启动
waitress-serve --listen=0.0.0.0:8000 myapp:app
\`\`\`

**优点**：
- ✅ 纯 Python，跨平台（Windows 友好）
- ✅ 多线程模型，无需 fork
- ✅ 配置极简

**缺点**：
- ❌ 性能不如 Gunicorn
- ❌ 功能少（无 max_requests、信号机制）
- ❌ 仅 sync 模型

**适用场景**：Windows 开发、小型项目、Pyramid 框架。

### 1.6 WSGI 服务器性能对比

\`\`\`bash
# 测试环境：4 核 CPU，8GB 内存
# 应用：简单的 Flask Hello World

# Gunicorn sync
gunicorn -w 9 -b 0.0.0.0:8000 app:app
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    1850.30

# Gunicorn gthread
gunicorn -k gthread --threads 4 -w 9 -b 0.0.0.0:8000 app:app
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    3200.50

# uWSGI
uwsgi --http :8000 --wsgi-file app.py --processes 9 --threads 4
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    4100.80

# Waitress
waitress-serve --listen=0.0.0.0:8000 --threads 16 app:app
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    1500.20
\`\`\`

### 1.7 WSGI 选型决策

\`\`\`
需要的功能？
├── 简单稳定，默认选择 → Gunicorn
├── 极致性能 + 高级功能 → uWSGI
├── 已有 Apache 基础设施 → mod_wsgi
├── Windows 部署 / 小项目 → Waitress
└── 旧异步项目 → Gunicorn + gevent
\`\`\`

## 二、ASGI 服务器对比

### 2.1 主流 ASGI 服务器

| 服务器 | 作者 | 主要特点 | 典型用户 |
|--------|------|----------|----------|
| **Uvicorn** | Tom Christie | uvloop 加速，最流行 | FastAPI 官方推荐 |
| **Daphne** | Django 团队 | Django Channels 配套 | Django 项目 |
| **Hypercorn** | pgjones | HTTP/2、HTTP/3 支持 | Quart、Sanic |

### 2.2 Uvicorn

\`\`\`bash
pip install uvicorn[standard]
uvicorn main:app --workers 4
\`\`\`

**优点**：
- ✅ uvloop + httptools 性能最强
- ✅ FastAPI 官方推荐
- ✅ 文档清晰，社区活跃
- ✅ 支持 WebSocket

**缺点**：
- ❌ HTTP/2 支持有限
- ❌ 不支持 HTTP/3
- ❌ 单进程 --workers 进程管理弱（推荐 Gunicorn + UvicornWorker）

**适用场景**：FastAPI、Starlette 项目首选。

### 2.3 Daphne

\`\`\`bash
pip install daphne
daphne -b 0.0.0.0 -p 8000 myproject.asgi:application
\`\`\`

**优点**：
- ✅ Django Channels 官方配套
- ✅ 完善的 WebSocket 支持
- ✅ 与 Django 集成无缝

**缺点**：
- ❌ 性能不如 Uvicorn（基于 twisted）
- ❌ 配置项较少
- ❌ 非 Django 项目用得少

**适用场景**：Django Channels、Django 异步视图。

\`\`\`python
# Django 启动 Daphne
# manage.py 会自动用 Daphne 启动 ASGI
python manage.py runserver

# 生产部署
daphne -b 0.0.0.0 -p 8000 myproject.asgi:application

# 多 worker（用 supervisor 管理多进程）
# /etc/supervisor/conf.d/daphne.conf
[program:daphne]
command=daphne -b 0.0.0.0 -p 8000 myproject.asgi:application
directory=/opt/myproject
user=www-data
autostart=true
autorestart=true
\`\`\`

### 2.4 Hypercorn

\`\`\`bash
pip install hypercorn
hypercorn main:app --workers 4
\`\`\`

**优点**：
- ✅ 支持 HTTP/2、HTTP/3
- ✅ 支持 ASGI、WSGI 双模式
- ✅ 支持 TLS 1.3
- ✅ 配置灵活

**缺点**：
- ❌ 性能略逊 Uvicorn
- ❌ 社区规模小

**适用场景**：需要 HTTP/2、HTTP/3、Quart 项目。

\`\`\`bash
# HTTP/2
hypercorn main:app --certfile cert.pem --keyfile key.pem

# HTTP/3（实验性）
hypercorn main:app --quic --certfile cert.pem --keyfile key.pem

# 多 worker
hypercorn main:app --workers 4
\`\`\`

### 2.5 ASGI 服务器性能对比

\`\`\`bash
# 测试环境：4 核 CPU，8GB 内存
# 应用：FastAPI Hello World

# Uvicorn
uvicorn app:app --workers 4 --loop uvloop --http httptools
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    15200.30

# Daphne
daphne -b 0.0.0.0 -p 8000 app:app
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    8500.50

# Hypercorn
hypercorn app:app --workers 4
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    12500.80

# Gunicorn + UvicornWorker（推荐）
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000 app:app
ab -n 20000 -c 200 http://localhost:8000/
# Requests per second:    15100.60
\`\`\`

### 2.6 ASGI 选型决策

\`\`\`
你的应用？
├── FastAPI / Starlette
│   └── Uvicorn（或 Gunicorn + UvicornWorker）
├── Django Channels / Django 异步
│   └── Daphne
├── Quart / 需要 HTTP/2 或 HTTP/3
│   └── Hypercorn
└── 不确定
    └── Uvicorn（最通用）
\`\`\`

## 三、性能基准测试方法

### 3.1 测试工具

| 工具 | 说明 |
|------|------|
| \`ab\`（Apache Bench） | 简单易用，基础压测 |
| \`wrk\` | 高性能，支持 Lua 脚本 |
| \`wrk2\` | wrk 改进版，恒定吞吐 |
| \`hey\` | Go 编写，简单现代 |
| \`vegeta\` | Go 编写，支持复杂场景 |
| \`locust\` | Python 编写，分布式，UI |

### 3.2 使用 ab

\`\`\`bash
# 基础压测
# -n 总请求数
# -c 并发数
ab -n 10000 -c 100 http://localhost:8000/

# 输出解读
# Requests per second:    1520.50 [#/sec] (mean)  ← QPS
# Time per request:       65.76 [ms] (mean)         ← 平均响应时间
# Time per request:       0.658 [ms] (mean, across all concurrent requests)
# Transfer rate:          250.50 [Kbytes/sec] received

# Failed requests:        0     ← 失败请求
# Write errors:           0
# Non-2xx responses:      0

# Percentage of the requests served within a certain time (ms)
#   50%     60
#   90%     85
#   95%     95
#   99%     150  ← P99 延迟
#  100%     200 (longest request)

# 带 keep-alive
ab -n 10000 -c 100 -k http://localhost:8000/

# POST 请求
ab -n 1000 -c 10 -p data.json -T application/json http://localhost:8000/api
\`\`\`

### 3.3 使用 wrk

\`\`\`bash
# 安装
brew install wrk  # macOS
apt install wrk   # Ubuntu

# 基础压测
# -t 线程数
# -c 连接数
# -d 持续时间
wrk -t 4 -c 100 -d 30s http://localhost:8000/

# 输出：
# Running 30s test @ http://localhost:8000/
#   4 threads and 100 connections
#   Thread Stats   Avg      Stdev     Max   +/- Stdev
#     Latency    65.50ms   15.20ms 200.00ms  85.00%
#     Req/Sec   380.50     50.20     0.5k    75.00%
#   45600 requests in 30.00s, 12.50MB read
# Requests/sec:   1520.30  ← QPS
# Transfer/sec:    425.50KB

# 使用 Lua 脚本测试 POST
# post.lua
wrk.method = "POST"
wrk.body = '{"name":"test"}'
wrk.headers["Content-Type"] = "application/json"

wrk -t 4 -c 100 -d 30s -s post.lua http://localhost:8000/api
\`\`\`

### 3.4 使用 locust

\`\`\`python
# locustfile.py
from locust import HttpUser, task, between

class MyUser(HttpUser):
    wait_time = between(1, 3)  # 每次请求间隔 1-3 秒
    
    @task
    def hello(self):
        self.client.get('/')
    
    @task(3)  # 权重 3
    def users(self):
        self.client.get('/users')
    
    @task
    def slow(self):
        with self.client.get('/slow', catch_response=True) as response:
            if response.elapsed.total_seconds() > 2:
                response.failure('请求太慢')
\`\`\`

\`\`\`bash
# 安装
pip install locust

# 启动 Web UI
locust
# 打开 http://localhost:8089
# 设置用户数、每秒启动数、目标地址

# 命令行模式
locust --headless -u 100 -r 10 -t 30s --host http://localhost:8000
# -u 用户数
# -r 每秒启动用户数
# -t 持续时间
\`\`\`

### 3.5 测试方法论

\`\`\`bash
# 1. 基线测试：单请求延迟
ab -n 100 -c 1 http://localhost:8000/
# 关注：Time per request

# 2. 并发测试：逐步增加并发
for c in 1 10 50 100 200 500 1000; do
    echo "=== 并发 $c ==="
    ab -n 5000 -c $c http://localhost:8000/ | grep "Requests per second"
done

# 3. 持续测试：稳定性
wrk -t 4 -c 100 -d 5m http://localhost:8000/

# 4. 极限测试：找崩溃点
for c in 1000 2000 5000 10000; do
    echo "=== 并发 $c ==="
    ab -n 10000 -c $c http://localhost:8000/ 2>&1 | grep -E "Failed|Requests per second"
done
\`\`\`

### 3.6 测试报告分析

\`\`\`
关键指标：
1. QPS（Requests per second）：每秒处理请求数
2. P50 延迟：50% 请求的响应时间
3. P99 延迟：99% 请求的响应时间（关注尾延迟）
4. 错误率：失败请求占比
5. 资源使用：CPU、内存、网络、磁盘 IO

判断标准：
- P99 < 200ms：用户体验良好
- P99 < 500ms：可接受
- P99 > 1s：需要优化
- 错误率 < 0.1%：生产可用
\`\`\`

## 四、选型决策树

### 4.1 完整决策流程

\`\`\`
你的应用类型？
├── 同步 WSGI 应用（Flask、Django 2.x）
│   ├── CPU 密集
│   │   └── Gunicorn sync（CPU*2+1 worker）
│   ├── IO 密集（短连接）
│   │   └── Gunicorn gthread（worker + threads）
│   └── IO 密集（长连接、长轮询）
│       └── Gunicorn + gevent
│
├── 异步 ASGI 应用（FastAPI、Starlette）
│   ├── 开发环境
│   │   └── Uvicorn --reload
│   └── 生产环境
│       ├── 小型项目（< 1000 QPS）
│       │   └── Uvicorn --workers
│       └── 中大型项目（> 1000 QPS）
│           └── Gunicorn + UvicornWorker
│
├── Django 项目
│   ├── Django 2.x（纯同步）
│   │   └── Gunicorn sync
│   ├── Django 3.0+（部分异步）
│   │   └── Gunicorn sync（兼容性好）
│   └── Django Channels（WebSocket）
│       └── Daphne（或 Gunicorn + UvicornWorker）
│
├── 需要 HTTP/2 或 HTTP/3
│   └── Hypercorn
│
└── 已有 Apache 基础设施
    └── mod_wsgi
\`\`\`

### 4.2 同步 vs 异步选择

\`\`\`
你的代码特征？
├── 大量同步阻塞调用（requests、psycopg2）
│   └── WSGI（Gunicorn）
│       理由：异步框架中阻塞调用会卡住事件循环
│
├── 大量 IO 等待且可改用异步库
│   └── ASGI（Uvicorn）
│       使用：httpx、asyncpg、aioredis
│
├── CPU 密集计算
│   └── WSGI（Gunicorn sync）
│       理由：异步对 CPU 密集无优势
│
└── 混合（同步代码 + 部分 IO 等待）
    ├── 简单方案：WSGI + gthread
    └── 高性能：ASGI + asyncio.to_thread 包装同步代码
\`\`\`

### 4.3 CPU vs IO 密集判断

\`\`\`python
# 判断你的应用是 CPU 还是 IO 密集
# 方法 1：分析代码
# - 大量数据库查询、HTTP 调用、文件读写 → IO 密集
# - 大量计算、图像处理、加密 → CPU 密集

# 方法 2：压测观察
ab -n 1000 -c 100 http://localhost:8000/

# 观察 top：
# - CPU 使用率高（>80%）→ CPU 密集
# - CPU 使用率低，但响应慢 → IO 密集（瓶颈在数据库/外部 API）

# 方法 3：Python profiler
import cProfile
cProfile.run('your_function()', sort='cumulative')
\`\`\`

### 4.4 实例：不同场景的选型

\`\`\`bash
# 场景 1：博客 API（Flask + 数据库）
# IO 密集，但请求简单
# 选择：Gunicorn gthread
gunicorn -k gthread --threads 4 -w 9 blog:app

# 场景 2：图像处理服务（Pillow）
# CPU 密集
# 选择：Gunicorn sync
gunicorn -k sync -w 9 image_app:app

# 场景 3：实时聊天（WebSocket）
# 长连接，需要 ASGI
# 选择：Gunicorn + UvicornWorker
gunicorn -k uvicorn.workers.UvicornWorker -w 4 chat:app

# 场景 4：数据分析 API（FastAPI + 异步数据库）
# 异步应用
# 选择：Gunicorn + UvicornWorker
gunicorn -k uvicorn.workers.UvicornWorker -w 5 analytics:app

# 场景 5：传统 Django 站点（管理后台）
# 同步 Django
# 选择：Gunicorn sync
gunicorn -k sync -w 9 myproject.wsgi:application

# 场景 6：Django Channels（WebSocket + 后台）
# 需要 ASGI
# 选择：Daphne
daphne -b 0.0.0.0 -p 8000 myproject.asgi:application
\`\`\`

## 五、监控与调优

### 5.1 Gunicorn 内置状态

\`\`\`bash
# 查看进程
ps aux | grep gunicorn

# 查看进程树
pstree -p \$(cat /tmp/gunicorn.pid)

# 实时监控
watch -n 1 'ps -o pid,rss,pcpu,cmd -C gunicorn'
\`\`\`

### 5.2 Prometheus 集成

\`\`\`python
# 安装
# pip install prometheus_client starlette-exporter

# FastAPI 集成
from starlette_exporter import PrometheusMiddleware, handle_metrics
from fastapi import FastAPI

app = FastAPI()
app.add_middleware(PrometheusMiddleware, app_name='myapp')
app.add_route('/metrics', handle_metrics)

# 现在访问 /metrics 获取 Prometheus 格式数据
\`\`\`

\`\`\`yaml
# prometheus.yml
scrape_configs:
  - job_name: 'myapp'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: /metrics
    scrape_interval: 15s
\`\`\`

### 5.3 Grafana 可视化

\`\`\`
推荐 Grafana Dashboard 指标：
- http_requests_total：总请求数（按状态码、路径分组）
- http_request_duration_seconds：请求延迟分布（P50/P95/P99）
- process_resident_memory_bytes：进程内存使用
- process_cpu_seconds_total：CPU 使用率
- gunicorn_workers：worker 数量
\`\`\`

\`\`\`yaml
# docker-compose.yml 增加 Prometheus + Grafana
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
\`\`\`

## 六、常见生产问题

### 6.1 502 Bad Gateway

\`\`\`bash
# 现象：Nginx 返回 502 Bad Gateway
# 原因：Nginx 无法连接后端 Gunicorn/Uvicorn

# 排查步骤：
# 1. 检查应用是否运行
systemctl status gunicorn-myapp
# 或
ps aux | grep gunicorn

# 2. 检查端口监听
ss -tlnp | grep 8000
# 应该看到 gunicorn 监听 8000

# 3. 检查 Nginx upstream 配置
nginx -t  # 测试配置

# 4. 检查 Nginx 错误日志
tail -f /var/log/nginx/error.log
# 常见错误：
# connect() to unix:/run/gunicorn.sock failed (2: No such file or directory)
# connect() failed (111: Connection refused) while connecting to upstream

# 5. 检查防火墙
sudo ufw status
sudo ufw allow 8000
\`\`\`

### 6.2 请求超时

\`\`\`bash
# 现象：客户端收到 504 Gateway Timeout
# 原因：请求处理时间超过配置的超时

# 排查：
# 1. 查看应用日志，确认请求实际耗时
grep "duration" /var/log/gunicorn/access.log | tail

# 2. 调整 Gunicorn timeout
gunicorn -t 120 myapp:app  # 增加到 120 秒

# 3. 调整 Nginx proxy_read_timeout
# nginx.conf
# proxy_read_timeout 120s;

# 4. 优化代码（根本解决）
# - 数据库查询加索引
# - 慢查询用缓存
# - 异步任务用 Celery
\`\`\`

### 6.3 内存泄漏

\`\`\`bash
# 现象：worker 内存持续增长，最终 OOM

# 监控：
watch -n 5 'ps -o pid,rss,cmd -C gunicorn'

# 解决：
# 1. 启用 max_requests 定期重启 worker
# gunicorn_config.py
max_requests = 1000
max_requests_jitter = 50

# 2. 排查泄漏源
pip install tracemalloc
# 在代码中：
import tracemalloc
tracemalloc.start()

@app.route('/debug/mem')
def mem():
    snapshot = tracemalloc.take_snapshot()
    return str(snapshot.statistics('lineno')[:10])

# 3. 常见泄漏源：
# - 全局 list/dict 无限增长
# - 数据库连接未关闭
# - C 扩展内存泄漏
# - functools.lru_cache 无上限
\`\`\`

## 七、完整部署架构图解

### 7.1 整体架构

\`\`\`
                    互联网用户
                        │
                        ▼
              ┌─────────────────┐
              │  DNS 解析        │
              │  example.com    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  CDN / 防火墙    │  ← Cloudflare / AWS WAF
              └────────┬────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │     Nginx (反向代理)      │
        │  - SSL 终止               │
        │  - 静态文件服务            │
        │  - 负载均衡                │
        │  - 限流                    │
        └────────────┬─────────────┘
                     │
        ┌────────────┴─────────────┐
        ▼                          ▼
┌───────────────┐          ┌───────────────┐
│ App Server 1  │          │ App Server 2  │
│ ┌───────────┐ │          │ ┌───────────┐ │
│ │ Gunicorn  │ │          │ │ Gunicorn  │ │
│ │  Master   │ │          │ │  Master   │ │
│ │ ┌───────┐ │ │          │ │ ┌───────┐ │ │
│ │ │Worker1│ │ │          │ │ │Worker1│ │ │
│ │ │Uvicorn│ │ │          │ │ │Uvicorn│ │ │
│ │ ├───────┤ │ │          │ │ ├───────┤ │ │
│ │ │Worker2│ │ │          │ │ │Worker2│ │ │
│ │ │Uvicorn│ │ │          │ │ │Uvicorn│ │ │
│ │ ├───────┤ │ │          │ │ ├───────┤ │ │
│ │ │Worker3│ │ │          │ │ │Worker3│ │ │
│ │ │Uvicorn│ │ │          │ │ │Uvicorn│ │ │
│ │ └───────┘ │ │          │ │ └───────┘ │ │
│ └───────────┘ │          │ └───────────┘ │
│ │ FastAPI /  │ │          │ │ FastAPI /  │ │
│ │ Django App │ │          │ │ Django App │ │
│ └───────────┘ │          │ └───────────┘ │
└───────┬───────┘          └───────┬───────┘
        │                          │
        └────────────┬─────────────┘
                     │
        ┌────────────┴─────────────┐
        ▼                          ▼
┌───────────────┐          ┌───────────────┐
│  PostgreSQL   │          │    Redis      │
│  (主从复制)    │          │  (缓存/会话)   │
│ ┌───────────┐ │          │ ┌───────────┐ │
│ │  Master   │◄┼──────────┼►│  Master   │ │
│ ├───────────┤ │          │ ├───────────┤ │
│ │  Slave    │ │          │ │  Slave    │ │
│ └───────────┘ │          │ └───────────┘ │
└───────────────┘          └───────────────┘
\`\`\`

### 7.2 请求流转详解

\`\`\`
1. 客户端发起 HTTPS 请求
   GET /api/users HTTP/1.1 → example.com

2. DNS 解析 → CDN → 防火墙 → Nginx

3. Nginx 处理：
   - SSL 终止（HTTPS → HTTP）
   - 检查是否静态文件（直接返回）
   - 否则反代到 upstream

4. Nginx 转发到 Gunicorn（负载均衡选一台）
   proxy_pass http://app_backend;

5. Gunicorn Master 接收连接，分发给空闲 Worker

6. UvicornWorker 处理请求：
   - httptools 解析 HTTP
   - uvloop 运行 asyncio
   - 调用 FastAPI/Starlette 应用

7. 应用层处理：
   - 路由匹配
   - 中间件链
   - 业务逻辑
   - 数据库查询（asyncpg / SQLAlchemy）
   - Redis 缓存（aioredis）

8. 响应回流：
   App → UvicornWorker → Gunicorn → Nginx → CDN → 客户端

9. 耗时记录：
   - Gunicorn access log 记录请求耗时
   - Prometheus 采集指标
   - ELK 收集日志
\`\`\`

### 7.3 各层职责

| 层级 | 组件 | 职责 |
|------|------|------|
| 接入层 | CDN | 加速静态资源、防 DDoS |
| 代理层 | Nginx | SSL、负载均衡、静态文件、限流 |
| 应用层 | Gunicorn + UvicornWorker | 进程管理、异步并发 |
| 业务层 | FastAPI / Django | 路由、业务逻辑、ORM |
| 缓存层 | Redis | 会话、缓存、消息队列 |
| 数据层 | PostgreSQL | 持久化存储 |

### 7.4 容量规划

\`\`\`
单机容量估算（4 核 8GB）：

Nginx：
- worker_processes: 4
- worker_connections: 10240
- 理论并发: 4 × 10240 = 40960

Gunicorn + UvicornWorker：
- workers: 5（CPU + 1）
- 单 worker 并发: 1000+
- 总并发: 5 × 1000 = 5000+

PostgreSQL：
- max_connections: 100
- 应用连接池: 5 worker × 20 pool = 100（恰好）

Redis：
- maxmemory: 2GB
- maxclients: 10000

整体 QPS 估算：
- 单机: 5000-15000 QPS
- 2 台负载均衡: 10000-30000 QPS
\`\`\`

### 7.5 高可用方案

\`\`\`
高可用关键点：
1. Nginx 高可用：Keepalived + 双 Nginx
2. 应用高可用：多实例 + Nginx 负载均衡
3. 数据库高可用：PostgreSQL 流复制 + 故障切换
4. 缓存高可用：Redis Sentinel / Cluster
5. 监控告警：Prometheus + Alertmanager

故障切换流程：
- App Server 1 宕机 → Nginx 健康检查 → 移除 → 流量转 Server 2
- DB Master 宕机 → Sentinel 检测 → 提升 Slave 为 Master → 应用重连
\`\`\`

## 八、总结

本章对比了主流的应用服务器并给出选型建议：

### 8.1 WSGI 服务器选型

- **Gunicorn**：99% 项目的默认选择，简单稳定
- **uWSGI**：需要高级功能、极致性能时
- **mod_wsgi**：已有 Apache 基础设施
- **Waitress**：Windows 部署、小项目

### 8.2 ASGI 服务器选型

- **Uvicorn**：FastAPI / Starlette 首选
- **Daphne**：Django Channels 配套
- **Hypercorn**：需要 HTTP/2、HTTP/3

### 8.3 生产部署最佳实践

1. **同步应用**：Gunicorn sync（CPU 密集）/ gthread（IO 密集）
2. **异步应用**：Gunicorn + UvicornWorker（生产推荐）
3. **架构分层**：CDN → Nginx → App → DB/Redis
4. **监控告警**：Prometheus + Grafana
5. **高可用**：多实例 + 负载均衡 + 故障切换

### 8.4 学习路径建议

\`\`\`
入门：
1. 用 Gunicorn 跑 Flask（理解 WSGI）
2. 用 Uvicorn 跑 FastAPI（理解 ASGI）
3. 配置 Nginx 反代

进阶：
4. 学习 Gunicorn 信号机制
5. 实践 Gunicorn + UvicornWorker
6. 集成 Prometheus 监控

高级：
7. 性能压测与调优
8. 容器化部署（Docker + K8s）
9. 高可用架构设计
\`\`\`

掌握应用服务器选型与部署，是 Python 后端工程师的核心技能。结合本系列前 6 批章节的部署、运维、监控知识，你已经具备了完整的生产部署能力。`
  }
];
