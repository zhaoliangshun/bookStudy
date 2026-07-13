// =============================================================
// FastAPI 应用开发实战教程 - 第 15 批章节（部署与运维 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-gunicorn : Gunicorn + Uvicorn 部署
//   fa-docker   : Docker 容器化
//   fa-nginx    : Nginx 反向代理
//   fa-cicd     : CI/CD 持续集成部署
// ============================================================

export const chapters = [
  // =============================================================
  // 第五十七章：Gunicorn + Uvicorn 部署
  // =============================================================
  {
    id: "fa-gunicorn",
    group: "部署与运维",
    icon: "🚀",
    title: "Gunicorn + Uvicorn 部署",
    content: `## 第五十七章　Gunicorn + Uvicorn 部署

### 57.1 为什么不能直接用 uvicorn 部署

开发时大家都是这么跑的：

\`\`\`bash
# 开发模式：热重载 + 单进程
uvicorn app.main:app --reload --port 8000
\`\`\`

但生产环境直接这么跑有几个致命问题：

- **单进程**：uvicorn 默认单进程，只用一个 CPU 核，机器再强也白搭；
- **没有 worker 管理**：进程崩了就崩了，没人重启；
- **没有 graceful shutdown**：发停止信号时，正在处理的请求会被直接中断；
- **没有超时控制**：一个请求卡死，worker 就一直占着，永远不释放；
- **没有预加载**：每个 worker 都要重新加载一遍代码，启动慢、内存占用高。

> 一句话总结：uvicorn 是"ASGI 服务器"，擅长处理 HTTP/WebSocket 协议；但它不擅长"管多个 worker、监控、重启、信号处理"这些事。这正是 Gunicorn 的强项。

### 57.2 Gunicorn 是什么

Gunicorn 是个 WSGI 服务器，历史悠久（2010 年诞生）、稳定、被广泛使用。它本身只支持 WSGI 应用（如 Flask、Django），但通过"worker class"机制，可以让 Uvicorn 来当 worker，从而支持 ASGI 应用（如 FastAPI）：

\`\`\`
Gunicorn 主进程（master）
  ├── UvicornWorker 1（处理 ASGI 请求）
  ├── UvicornWorker 2
  ├── UvicornWorker 3
  └── UvicornWorker 4
\`\`\`

- **主进程（master）**：不处理请求，只负责管理 worker、重启卡死的 worker、转发信号；
- **worker 进程**：真正处理请求，每个 worker 用 Uvicorn 跑你的 FastAPI app。

> 这种"master + workers"模式是 Unix 服务器经典架构（Nginx、uWSGI 都这样）。master 挂了 worker 全死，但 master 逻辑极简几乎不会挂；worker 挂了 master 立刻拉起一个新的。

### 57.3 安装

\`\`\`bash
# 安装 gunicorn 和 uvicorn（带 standard 扩展包）
pip install gunicorn "uvicorn[standard]"

# 验证安装
gunicorn --version
# gunicorn (version 22.0.0)
\`\`\`

> 注意：必须安装 \`uvicorn[standard]\` 而不是 \`uvicorn\`。standard 包含 \`uvloop\`（高性能事件循环）和 \`httptools\`（高性能 HTTP 解析），生产环境缺这两个性能会差很多。

### 57.4 第一个 Gunicorn 启动命令（Demo 1）

假设你的项目结构如下：

\`\`\`
my_project/
├── app/
│   ├── __init__.py
│   └── main.py        # 里面有 app = FastAPI()
└── requirements.txt
\`\`\`

\`\`\`bash
# 进入项目根目录
cd my_project

# 最简单的启动命令
gunicorn app.main:app \\
  -w 4 \\                        # 启动 4 个 worker
  -k uvicorn.workers.UvicornWorker \\  # 用 Uvicorn 作为 worker class
  -b 0.0.0.0:8000 \\             # 绑定地址和端口
  --access-logfile - \\          # 访问日志输出到 stdout
  --error-logfile -             # 错误日志输出到 stderr
\`\`\`

逐行解释：

- \`app.main:app\`：模块路径 \`app.main\`，变量名 \`app\`。和 uvicorn 的写法一样；
- \`-w 4\`：worker 数量，4 个；
- \`-k uvicorn.workers.UvicornWorker\`：worker class 指定为 Uvicorn。这是让 Gunicorn 支持 ASGI 的关键；
- \`-b 0.0.0.0:8000\`：绑定所有网卡的 8000 端口。生产环境通常绑 \`127.0.0.1\`，让 Nginx 来代理；
- \`--access-logfile -\`：\`-\` 表示输出到标准输出（stdout），方便容器收集；
- \`--error-logfile -\`：错误日志输出到标准错误（stderr）。

启动后你会看到类似输出：

\`\`\`
[2024-01-01 12:00:00 +0800] [12345] [INFO] Starting gunicorn 22.0.0
[2024-01-01 12:00:00 +0800] [12345] [INFO] Listening at: http://0.0.0.0:8000 (12345)
[2024-01-01 12:00:00 +0800] [12345] [INFO] Using worker: uvicorn.workers.UvicornWorker
[2024-01-01 12:00:00 +0800] [12346] [INFO] Booting worker with pid: 12346
[2024-01-01 12:00:00 +0800] [12347] [INFO] Booting worker with pid: 12347
[2024-01-01 12:00:00 +0800] [12348] [INFO] Booting worker with pid: 12348
[2024-01-01 12:00:00 +0800] [12349] [INFO] Booting worker with pid: 12349
\`\`\`

### 57.5 gunicorn 命令参数详解

Gunicorn 参数非常多，常用的列在下面：

| 参数 | 全写 | 说明 | 推荐值 |
| --- | --- | --- | --- |
| \`-w\` | \`--workers\` | worker 数量 | 2\*CPU+1 |
| \`-k\` | \`--worker-class\` | worker 类型 | uvicorn.workers.UvicornWorker |
| \`-b\` | \`--bind\` | 绑定地址 | 127.0.0.1:8000 |
| \`-t\` | \`--timeout\` | worker 处理请求超时（秒） | 30~120 |
| \`--graceful-timeout\` | - | 优雅退出等待时间（秒） | 30 |
| \`--keep-alive\` | - | keep-alive 连接保持秒数 | 5 |
| \`--max-requests\` | - | worker 处理多少请求后重启 | 1000~5000 |
| \`--max-requests-jitter\` | - | 重启抖动（避免所有 worker 同时重启） | 0~500 |
| \`--preload\` | - | 预加载应用代码 | 开启（省内存） |
| \`--reload\` | - | 代码变更自动重启 | 仅开发用 |
| \`--access-logfile\` | - | 访问日志路径 | - 或文件 |
| \`--error-logfile\` | - | 错误日志路径 | - 或文件 |
| \`--log-level\` | - | 日志级别 | info |
| \`--pid\` | - | pid 文件路径 | /tmp/gunicorn.pid |

> 重点说 \`--preload\`：开启后 master 先加载一遍应用代码，worker fork 出来后共享这份代码。好处是启动快、省内存（COW 机制）；坏处是改了全局变量 worker 之间不共享（因为 fork 后各改各的）。

### 57.6 UvicornWorker 详解（Demo 2）

\`UvicornWorker\` 是 Uvicorn 提供的 Gunicorn worker class。除此之外还有个 \`UvicornH11Worker\`，区别在于底层 HTTP 解析器：

\`\`\`python
# uvicorn/workers.py 源码简化版，理解原理即可
# 从 uvicorn.server 模块导入 Server 类，它负责真正运行 ASGI 服务器
from uvicorn.server import Server
# 导入 HTTP 协议自动选择类（会根据是否装了 httptools 自动选实现）
from uvicorn.protocols.http.auto import AutoHTTPProtocol
# 导入 WebSocket 协议自动选择类（会根据是否装了 websockets 自动选实现）
from uvicorn.protocols.websockets.auto import AutoWebsocketProtocol

# UvicornWorker 继承自 gunicorn 的 Worker 基类
# 这样 Gunicorn master 就能像管理普通 WSGI worker 一样管理 Uvicorn worker
class UvicornWorker(Worker):
    """
    Uvicorn 实现的 Gunicorn worker class。
    继承自 gunicorn.workers.base.Worker，实现了 ASGI 接口。
    """
    # CONFIG_KWARGS 是传给 uvicorn Server 的配置参数
    # 底层用 httptools 解析 HTTP（高性能，C 实现）
    CONFIG_KWARGS = {
        "loop": "uvloop",        # 用 uvloop 代替 asyncio 原生 loop（性能提升 2-4 倍）
        "http": "httptools",     # 用 httptools 解析 HTTP（C 扩展，比 h11 快）
        "lifespan": "on",        # 启用 lifespan 事件（FastAPI startup/shutdown）
    }

    def run(self):
        # run 方法由 Gunicorn master 调用，每个 worker fork 后会执行这里
        # 每个 worker 内部跑一个 uvicorn Server
        # self.config 是 Gunicorn 传进来的配置对象
        server = Server(config=self.config)
        # server.run() 会阻塞，直到收到退出信号
        server.run()

    def handle_exit(self, sig, frame):
        # 处理 SIGTERM/SIGINT 信号，实现优雅退出
        # sig: 信号编号（如 15 表示 SIGTERM）
        # frame: 当前栈帧（一般用不到）
        # 优雅退出 = 先处理完当前请求再退出，而不是立即中断
        ...

# UvicornH11Worker 继承 UvicornWorker，只覆盖了 CONFIG_KWARGS
# 适用于装不上 httptools C 扩展的环境（如某些 ARM 设备）
class UvicornH11Worker(UvicornWorker):
    """
    用 h11 代替 httptools（纯 Python 实现，慢但兼容性好）。
    一般不用，除非你的环境装不上 httptools。
    """
    CONFIG_KWARGS = {
        "loop": "asyncio",       # 用原生 asyncio loop（不用 uvloop）
        "http": "h11",           # 用 h11 解析 HTTP（纯 Python 实现，兼容性好但慢）
        "lifespan": "on",
    }
\`\`\`

实战中直接用 \`UvicornWorker\` 即可。\`UvicornH11Worker\` 只在特殊环境（如某些 ARM 设备编译不了 C 扩展）才用。

### 57.7 worker 数量计算公式（Demo 3）

worker 数量不是越多越好。每个 worker 都是独立进程，占内存、抢 CPU。经典的计算公式：

\`\`\`python
# worker 数量计算公式
# Gunicorn 官方推荐：(2 * CPU 核数) + 1

# 导入 multiprocessing 模块，用于获取 CPU 核数
import multiprocessing

# multiprocessing.cpu_count() 返回当前机器的逻辑 CPU 核数
# 注意：这是逻辑核数（含超线程），不是物理核数
# 获取 CPU 核数
cpu_count = multiprocessing.cpu_count()

# 计算推荐 worker 数
# 2 倍 CPU：一个 worker 处理请求时 IO 等待，另一个 worker 用 CPU
# +1：留一个 worker 应对突发流量，避免请求排队
workers = (2 * cpu_count) + 1

# 用 f-string 格式化输出（Python 3.6+ 语法）
print(f"CPU 核数: {cpu_count}")
print(f"推荐 worker 数: {workers}")

# 输出示例（4 核机器）：
# CPU 核数: 4
# 推荐 worker 数: 9
\`\`\`

**为什么是这个公式？**

- 2 倍 CPU：一个 worker 处理请求时，总有 IO 等待（数据库、网络），等待时 CPU 空闲，另一个 worker 可以用；
- +1：留一个 worker 应对突发流量。

但这个公式不是死的，要根据业务调整：

| 业务类型 | 推荐值 | 原因 |
| --- | --- | --- |
| CPU 密集型（图片处理、加密） | CPU 核数 + 1 | 不靠多 worker，靠多线程/多进程 |
| IO 密集型（CRUD、调外部 API） | 2\*CPU + 1 | 经典公式 |
| 混合型 | 2\*CPU + 1 | 大多数 Web 应用 |
| 内存敏感型 | CPU 核数 | 每个 worker 占内存大（如加载 ML 模型） |

> 避坑：worker 数量上限受内存限制。假设每个 worker 占 200MB，8 核机器按公式要 17 个 worker，就是 3.4GB。如果机器只有 4GB 内存，就崩了。生产环境务必监控内存。

### 57.8 配置文件 gunicorn.conf.py（Demo 4）

命令行参数太多，维护麻烦。Gunicorn 支持用 Python 文件做配置：

\`\`\`python
# gunicorn.conf.py - Gunicorn 配置文件
# 用法: gunicorn -c gunicorn.conf.py app.main:app

# 导入 multiprocessing 用于获取 CPU 核数
import multiprocessing
# 导入 os 用于读取环境变量
import os

# ============ 基础配置 ============

# 绑定地址（生产环境绑 127.0.0.1，让 Nginx 代理）
bind = "127.0.0.1:8000"

# worker 数量（用公式自动计算）
workers = multiprocessing.cpu_count() * 2 + 1

# worker 类型（ASGI 应用必须用 Uvicorn）
worker_class = "uvicorn.workers.UvicornWorker"

# worker 处理请求超时（秒）
# 超时后 master 会杀掉这个 worker 并重启
# 如果有长耗时接口（如导出大文件），要调大或用后台任务
timeout = 60

# 优雅退出超时（秒）
# 收到 SIGTERM 后，worker 有这么长时间处理完当前请求
# 超时后强制杀死
graceful_timeout = 30

# keep-alive 连接保持时间（秒）
keepalive = 5

# ============ 预加载 ============

# 开启预加载：master 先加载应用，worker fork 后共享
# 好处：启动快、省内存
# 坏处：不能用 --reload（开发时关掉）
preload_app = True

# ============ worker 重启策略 ============

# worker 处理多少请求后自动重启（防止内存泄漏）
max_requests = 2000

# 重启抖动：在 max_requests 基础上加随机数
# 避免所有 worker 同时重启导致服务中断
max_requests_jitter = 200

# ============ 日志 ============

# 访问日志路径（- 表示 stdout）
accesslog = "-"

# 错误日志路径（- 表示 stderr）
errorlog = "-"

# 日志级别（debug / info / warning / error / critical）
loglevel = "info"

# 访问日志格式
# 默认: %(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# ============ 进程 ============

# pid 文件路径
pidfile = "/tmp/gunicorn.pid"

# 运行用户和组（生产环境不要用 root）
# user = "www-data"
# group = "www-data"

# ============ SSL（一般交给 Nginx 处理，这里不配）============
# keyfile = "/path/to/key.pem"
# certfile = "/path/to/cert.pem"

# ============ Uvicorn 专用配置 ============
# 通过 worker_class_kwargs 传参给 Uvicorn
# 注意：这里只在用 UvicornWorker 时生效
# uvloop 和 httptools 已经是 UvicornWorker 默认值，这里写出来便于调整
\`\`\`

启动：

\`\`\`bash
# 用配置文件启动
gunicorn -c gunicorn.conf.py app.main:app
\`\`\`

### 57.9 优雅重启（Graceful Reload）（Demo 5）

线上发版时不能让用户看到 502。Gunicorn 支持"优雅重启"：发信号后，master 逐个重启 worker，保证始终有 worker 在服务。

\`\`\`bash
# === 方式 1：SIGHUP（重启所有 worker，重新加载配置和代码）===

# 找到 master 进程的 pid
cat /tmp/gunicorn.pid
# 假设输出: 12345

# 发送 SIGHUP 信号
kill -HUP 12345

# master 会：
# 1. 收到信号，重新加载 gunicorn.conf.py
# 2. 逐个重启 worker（先启动新 worker，再停老 worker）
# 3. 期间不会中断服务

# === 方式 2：gunicorn reload 命令（更方便）===

# 如果是用 systemd 管理的
sudo systemctl reload gunicorn

# === 方式 3：USR2（升级 Gunicorn 自身，不停服务）===

# 发送 USR2，master 会启动新 master，老 master 退休
kill -USR2 12345

# === 方式 4：WINCH（优雅停止，不重启）===

# worker 逐个停止，处理完当前请求后退出
kill -WINCH 12345
# master 还在，可以再发 USR2 拉起 worker
\`\`\`

**SIGHUP vs USR2 的区别：**

| 信号 | 用途 | 场景 |
| --- | --- | --- |
| HUP | 重启所有 worker，重新加载配置 | 改了代码或配置 |
| USR2 | 升级 Gunicorn 二进制 | 极少用，热升级 Gunicorn 版本 |
| WINCH | 优雅停止 worker | 想暂停服务但保留 master |
| TERM | 强制停止 | 停机维护 |
| QUIT | 优雅停止 | 同 TERM 但更优雅 |

> 避坑：\`--preload\` 模式下 HUP 能正常重载代码；非 preload 模式下 HUP 也能重载。但如果你用了 \`--reload\`（开发模式），它会自动监听文件变化，不需要手动发信号。

### 57.10 systemd 服务配置（Demo 6）

生产环境不能在终端里跑 Gunicorn（终端关了进程就死了）。用 systemd 管理是 Linux 标准方案：

\`\`\`ini
# /etc/systemd/system/gunicorn.service
# 用法: sudo systemctl start gunicorn

[Unit]
# 服务描述
Description=Gunicorn daemon for FastAPI app
# 在网络服务之后启动
After=network.target

[Service]
# 运行用户和组（生产环境绝不用 root）
User=www-data
Group=www-data

# 工作目录（你的项目根目录）
WorkingDirectory=/var/www/my_project

# 启动命令
# --chdir 指定项目目录（确保 import 路径正确）
ExecStart=/var/www/my_project/venv/bin/gunicorn \\
    --chdir /var/www/my_project \\
    -c gunicorn.conf.py \\
    app.main:app

# 重启命令（优雅重载，发 HUP 信号）
ExecReload=/bin/kill -s HUP $MAINPID

# 停止命令（发 TERM，优雅退出）
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

# 自动重启（崩了自动拉起）
Restart=on-failure
RestartSec=5

# 环境变量
Environment="PYTHONUNBUFFERED=1"
Environment="PYTHONPATH=/var/www/my_project"
EnvironmentFile=/var/www/my_project/.env

# 文件描述符限制（高并发要调大）
LimitNOFILE=65535

[Install]
# 开机自启
WantedBy=multi-user.target
\`\`\`

管理命令：

\`\`\`bash
# 启动服务
sudo systemctl start gunicorn

# 停止
sudo systemctl stop gunicorn

# 重启（先停再启，会断连）
sudo systemctl restart gunicorn

# 优雅重载（不断连，发 HUP）
sudo systemctl reload gunicorn

# 查看状态
sudo systemctl status gunicorn

# 开机自启
sudo systemctl enable gunicorn

# 查看日志（实时）
sudo journalctl -u gunicorn -f

# 查看最近 100 行日志
sudo journalctl -u gunicorn -n 100
\`\`\`

### 57.11 日志输出和切割

Gunicorn 日志分两种：

1. **access log**：每个请求一行，类似 Nginx 的 access log；
2. **error log**：Gunicorn 自身的日志（启动、重启 worker、异常等）。

生产环境日志处理有三种方案：

\`\`\`bash
# 方案 1：输出到 stdout/stderr，由 systemd journal 收集
# gunicorn.conf.py:
accesslog = "-"
errorlog = "-"
# 然后用 journalctl 查看
journalctl -u gunicorn -f

# 方案 2：输出到文件，用 logrotate 切割
# gunicorn.conf.py:
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"

# /etc/logrotate.d/gunicorn 配置:
\`\`\`

\`\`\`text
# /etc/logrotate.d/gunicorn
/var/log/gunicorn/*.log {
    daily              # 每天切割
    missingok          # 日志文件不存在不报错
    rotate 30          # 保留 30 天
    compress           # 压缩旧日志
    delaycompress      # 延迟一天压缩（防止 Gunicorn 还在写）
    notifempty         # 空文件不切割
    create 644 www-data www-data  # 创建新日志文件的权限
    postrotate
        # 切割后发 HUP 信号，让 Gunicorn 重新打开日志文件
        if [ -f /tmp/gunicorn.pid ]; then
            kill -HUP $(cat /tmp/gunicorn.pid)
        fi
    endscript
}
\`\`\`

\`\`\`bash
# 方案 3：输出到 stdout，由 Docker/容器日志收集（推荐容器化部署）
# gunicorn.conf.py:
accesslog = "-"
errorlog = "-"
# 容器里用 docker logs 或 ELK/Loki 收集
\`\`\`

### 57.12 常见错误和避坑指南

**错误 1：\`ModuleNotFoundError: No module named 'app'\`**

\`\`\`bash
# 原因：工作目录不对，或者 PYTHONPATH 没设
# 解决：指定 --chdir
gunicorn --chdir /var/www/my_project app.main:app
\`\`\`

**错误 2：\`Connection in ASGI frameworklifecycle but no lifespan\`**

\`\`\`python
# 原因：FastAPI 的 startup/shutdown 事件没正确注册
# 检查：UvicornWorker 默认 lifespan="on"，确保你的 app 生命周事件写对

# 从 fastapi 导入 FastAPI 应用类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 旧写法：用 @app.on_event 装饰器注册生命周期事件（已弃用，不推荐）
@app.on_event("startup")
async def startup():
    # 正确写法
    pass

# 新写法（FastAPI 0.93+ 推荐）
# 从 contextlib 导入 asynccontextmanager 装饰器
# 它能把一个含 yield 的 async 生成器函数变成异步上下文管理器
from contextlib import asynccontextmanager

# @asynccontextmanager 装饰后，lifespan 函数变成异步上下文管理器
# yield 之前是 startup 逻辑，yield 之后是 shutdown 逻辑
@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup: 应用启动时执行（初始化数据库连接池、Redis 等）
    yield
    # shutdown: 应用关闭时执行（释放资源、关闭连接）

# 通过 lifespan 参数把生命周期管理器传给 FastAPI
app = FastAPI(lifespan=lifespan)
\`\`\`

**错误 3：worker 莫名其妙重启**

\`\`\`bash
# 日志里看到:
# [CRITICAL] WORKER TIMEOUT (pid:12345)

# 原因：某个请求处理超过 timeout 秒，master 杀掉了 worker
# 解决：
# 1. 调大 timeout（如果有合理的长耗时接口）
# 2. 把长耗时操作改成后台任务（Celery / BackgroundTasks）
\`\`\`

**错误 4：内存持续上涨**

\`\`\`bash
# 原因：内存泄漏（常见于 C 扩展、全局列表只增不减）
# 解决：开启 max_requests 让 worker 定期重启
# gunicorn.conf.py:
max_requests = 1000
max_requests_jitter = 100
\`\`\`

**错误 5：\`--preload\` 模式下 worker 不共享状态**

\`\`\`python
# preload 后 master 加载一次代码，worker fork 出来
# 但 fork 后内存是 COW（copy-on-write），写操作各改各的

# 错误示例：用全局变量做计数器
# master 加载时 request_count=0，fork 后每个 worker 都有一份独立的 0
# worker A 加到 5，worker B 还是 0，看到的计数永远不对
request_count = 0  # 每个 worker 各自一份，加起来不对

# @app.get 装饰器注册 GET 路由 /count
@app.get("/count")
async def count():
    # global 声明修改的是当前 worker 进程里的全局变量
    # 其他 worker 看不到这个修改
    global request_count
    request_count += 1  # 这个计数只在当前 worker 有效
    return {"count": request_count}

# 正确做法：用 Redis 等外部存储
# Redis 是独立进程，所有 worker 共享同一份数据
import redis
# 创建 Redis 客户端，默认连 127.0.0.1:6379
r = redis.Redis()

@app.get("/count")
async def count():
    # r.incr 是原子操作，对 "request_count" 键自增 1 并返回新值
    # 即使多个 worker 同时调用，Redis 也能保证计数正确
    return {"count": r.incr("request_count")}
\`\`\`

### 57.13 实战：生产环境 Gunicorn 部署配置

完整的实战方案，包含一个完整的 FastAPI 应用 + Gunicorn 配置 + systemd 服务：

\`\`\`python
# app/main.py - 一个完整的 FastAPI 应用
# 从 contextlib 导入 asynccontextmanager，用于创建异步生命周期管理器
from contextlib import asynccontextmanager
# 从 fastapi 导入 FastAPI 应用类
from fastapi import FastAPI
# 导入 logging 模块，用于记录日志
import logging
# 导入 os 模块，用于获取进程 PID 等系统信息
import os

# 配置日志：basicConfig 设置全局日志格式和级别
# level=logging.INFO 表示 INFO 及以上级别的日志都会输出
logging.basicConfig(level=logging.INFO)
# 创建一个 logger 实例，__name__ 是当前模块名（如 app.main）
logger = logging.getLogger(__name__)

# 生命周期管理：用 @asynccontextmanager 装饰器定义
# yield 前是 startup 逻辑，yield 后是 shutdown 逻辑
@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup: 初始化资源（数据库连接池、Redis 等）
    logger.info("应用启动中...")
    # os.getpid() 返回当前进程 ID，用于区分是哪个 worker 在启动
    logger.info(f"工作进程 PID: {os.getpid()}")
    yield
    # shutdown: 释放资源
    logger.info("应用关闭中...")

# 创建 FastAPI 应用实例
# title 显示在 Swagger 文档标题，version 显示版本号
# lifespan 参数接收生命周期管理器，FastAPI 会在启动/关闭时自动调用
app = FastAPI(
    title="生产环境示例 API",
    version="1.0.0",
    lifespan=lifespan,
)

# @app.get 装饰器注册 GET 路由，访问 / 时触发
@app.get("/")
async def root():
    # 返回进程 PID，方便验证多 worker 是否生效
    # 访问多次会看到不同的 PID，说明请求被分发到不同 worker
    return {"message": "Hello from Gunicorn", "pid": os.getpid()}

# 健康检查接口，给 K8s/docker/Nginx 做存活探测用
@app.get("/health")
async def health():
    # 健康检查接口（给 K8s/docker/Nginx 用）
    return {"status": "healthy"}

# 模拟慢请求接口，用于测试 Gunicorn 的 timeout 配置
@app.get("/slow")
async def slow():
    # 模拟慢请求（测试 timeout）
    # 导入 asyncio 用于异步休眠
    import asyncio
    # await asyncio.sleep(10) 异步等待 10 秒，不阻塞事件循环
    # 如果 timeout=60 则正常返回；如果 timeout=5 则 worker 会被 master 杀掉
    await asyncio.sleep(10)
    return {"message": "终于返回了"}
\`\`\`

\`\`\`python
# gunicorn.conf.py - 生产环境配置
# 导入 multiprocessing 用于获取 CPU 核数
import multiprocessing
# 导入 os（备用，可用于读取环境变量）
import os

# 绑定地址（绑 127.0.0.1，让 Nginx 代理）
# 只绑本地回环地址，外部无法直接访问，必须通过 Nginx 代理
bind = "127.0.0.1:8000"

# worker 数量
# 用经典公式 2*CPU+1 自动计算，避免手动数 CPU 核数
workers = multiprocessing.cpu_count() * 2 + 1

# Uvicorn worker（支持 ASGI）
worker_class = "uvicorn.workers.UvicornWorker"

# 超时（如果有慢接口调大，或者用后台任务）
timeout = 60
graceful_timeout = 30
keepalive = 5

# 预加载（省内存、启动快）
preload_app = True

# 定期重启防内存泄漏
max_requests = 2000
max_requests_jitter = 200

# 日志输出到 stdout（systemd journal 收集）
accesslog = "-"
errorlog = "-"
loglevel = "info"

# pid 文件
pidfile = "/tmp/gunicorn.pid"
\`\`\`

\`\`\`ini
# /etc/systemd/system/gunicorn.service
[Unit]
Description=Gunicorn for FastAPI
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/my_project
ExecStart=/var/www/my_project/venv/bin/gunicorn -c gunicorn.conf.py app.main:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30
Restart=on-failure
RestartSec=5
Environment="PYTHONUNBUFFERED=1"
Environment="PYTHONPATH=/var/www/my_project"
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
# 部署步骤
# 1. 创建用户和目录
sudo useradd -r -s /bin/false www-data
sudo mkdir -p /var/www/my_project
sudo chown www-data:www-data /var/www/my_project

# 2. 上传代码、创建虚拟环境、装依赖
cd /var/www/my_project
python -m venv venv
source venv/bin/activate
pip install fastapi gunicorn "uvicorn[standard]"

# 3. 复制配置文件
sudo cp gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload

# 4. 启动
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

# 5. 验证
curl http://127.0.0.1:8000/health
# {"status":"healthy"}

# 6. 查看状态
sudo systemctl status gunicorn
\`\`\`

### 小结

- **uvicorn 负责协议，gunicorn 负责进程管理**，两者搭配是 FastAPI 生产部署的标准方案；
- worker 数量用 \`2*CPU+1\` 公式，根据业务和内存调整；
- 必装 \`uvicorn[standard]\` 获得 uvloop 和 httptools 加速；
- 用 \`gunicorn.conf.py\` 管理配置，用 systemd 管理进程；
- 优雅重选用 \`kill -HUP\` 或 \`systemctl reload\`，不要用 restart；
- 日志输出到 stdout，交给 systemd journal 或容器日志系统收集；
- 开启 \`max_requests\` 防内存泄漏，开启 \`preload_app\` 省内存。
`,
  },

  // =============================================================
  // 第五十八章：Docker 容器化
  // =============================================================
  {
    id: "fa-docker",
    group: "部署与运维",
    icon: "🐳",
    title: "Docker 容器化",
    content: `## 第五十八章　Docker 容器化

### 58.1 为什么要用 Docker

没有 Docker 之前，部署是这样的：

- 开发机能跑，测试机报错（Python 版本不同）；
- 测试机能跑，生产报错（少了某个系统库）；
- 运维："你这环境不对"，开发："我这能跑啊"——经典扯皮。

Docker 解决的核心问题就是**环境一致性**：把应用 + 依赖 + 系统库打包成一个镜像，到哪都能跑。

| 概念 | 类比 | 说明 |
| --- | --- | --- |
| 镜像（Image） | 类（class） | 只读模板，包含应用和依赖 |
| 容器（Container） | 实例（instance） | 镜像运行起来的实例 |
| 仓库（Registry） | PyPI | 存放镜像的地方（Docker Hub、私有仓库） |
| Dockerfile | 食谱 | 描述怎么构建镜像 |

> 对 Python 开发者来说：Dockerfile 就相当于 \`requirements.txt\` + 系统配置 + 启动命令的合体，而且确保了"我这能跑"= "到处都能跑"。

### 58.2 第一个 Dockerfile（Demo 1）

假设项目结构：

\`\`\`
my_project/
├── app/
│   ├── __init__.py
│   └── main.py
├── requirements.txt
└── Dockerfile
\`\`\`

\`\`\`dockerfile
# Dockerfile - 最基础的 FastAPI Docker 镜像

# 基础镜像：Python 3.11 slim 版（比 full 小很多，比 alpine 兼容性好）
FROM python:3.11-slim

# 设置工作目录（容器内的目录）
WORKDIR /app

# 复制 requirements.txt（先单独复制，利用缓存）
COPY requirements.txt .

# 安装依赖
# --no-cache-dir: 不缓存 pip 下载，减小镜像体积
# -r requirements.txt: 从文件读取依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY . .

# 暴露端口（文档性质，实际映射用 -p）
EXPOSE 8000

# 启动命令
# 用 gunicorn 而不是 uvicorn（生产环境）
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
\`\`\`

\`\`\`bash
# 构建镜像
# -t: 镜像名:标签
# .: 构建上下文（当前目录）
docker build -t my-fastapi-app:1.0 .

# 运行容器
# -d: 后台运行
# -p: 端口映射（主机端口:容器端口）
# --name: 容器名
docker run -d -p 8000:8000 --name my-app my-fastapi-app:1.0

# 测试
curl http://localhost:8000/

# 查看日志
docker logs -f my-app

# 进入容器
docker exec -it my-app bash

# 停止删除
docker stop my-app
docker rm my-app
\`\`\`

### 58.3 选择 Python 基础镜像：slim vs alpine

Docker Hub 上 Python 官方镜像有好几个变体，选错了会踩坑：

| 镜像 | 大小 | 优点 | 缺点 | 推荐场景 |
| --- | --- | --- | --- | --- |
| \`python:3.11\` | ~900MB | 完整系统，啥都有 | 太大 | 不推荐 |
| \`python:3.11-slim\` | ~150MB | 小、兼容性好 | 无编译工具 | **推荐** |
| \`python:3.11-alpine\` | ~50MB | 最小 | 编译慢、坑多 | 谨慎使用 |

**为什么不推荐 alpine？**

\`\`\`bash
# alpine 用 musl libc 代替 glibc
# 很多 Python 包（如 numpy、pandas、cryptography）只有 glibc 的预编译包
# 在 alpine 上要从源码编译，慢且容易失败

# 在 alpine 上装 cryptography 会这样：
# ERROR: Failed building wheel for cryptography
# 解决：要装一堆编译依赖
# RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev
\`\`\`

**slim 是最佳选择**：基于 Debian，用 glibc，绝大多数包都有预编译 wheel；体积只有完整版的 1/6。

### 58.4 多阶段构建（Demo 2）

如果有些依赖需要编译（如 \`psycopg2\`、\`gevent\`），但运行时不需要编译工具，用多阶段构建：

\`\`\`dockerfile
# Dockerfile - 多阶段构建
# 阶段 1: builder（编译依赖）
FROM python:3.11-slim AS builder

WORKDIR /app

# 安装编译依赖（仅 builder 阶段需要）
# libpq-dev: psycopg2 编译需要
# gcc: 通用编译器
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# 用虚拟环境隔离依赖
RUN python -m venv /opt/venv
# 激活虚拟环境（后续命令都在 venv 里）
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
# 装到 venv 里
RUN pip install --no-cache-dir -r requirements.txt

# ============ 阶段 2: runner（运行镜像）============
FROM python:3.11-slim AS runner

WORKDIR /app

# 只装运行时需要的库（不需要 gcc 等编译工具）
# libpq5: psycopg2 运行时需要
RUN apt-get update && apt-get install -y --no-install-recommends \\
    libpq5 \\
    && rm -rf /var/lib/apt/lists/*

# 从 builder 阶段复制虚拟环境
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 复制项目代码
COPY . .

# 创建非 root 用户（安全）
RUN useradd -m appuser
USER appuser

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
\`\`\`

**多阶段构建的好处：**

- 最终镜像不含编译工具，体积小；
- 安全：攻击面更小（没有 gcc 等工具可被利用）；
- 层次清晰：builder 负责编译，runner 负责运行。

### 58.5 安装依赖和处理缓存（Demo 3）

Docker 构建是分层的，每条指令一层。如果某层没变，下次构建会用缓存。利用这点可以大幅加速构建：

\`\`\`dockerfile
# === 错误写法：代码一改就要重装依赖 ===
FROM python:3.11-slim
WORKDIR /app
COPY . .                    # 代码一改，这层就变
RUN pip install -r requirements.txt  # 上一层变了，这层也要重新执行
# 后果：每次改代码都要重装所有依赖，慢死

# === 正确写法：先复制 requirements，再复制代码 ===
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .     # 只要 requirements.txt 没变，这层用缓存
RUN pip install -r requirements.txt  # 上一层没变，这层也用缓存
COPY . .                    # 代码变了不影响上面两层
# 好处：改代码不触发重装依赖
\`\`\`

还有一个重要的 \`.dockerignore\` 文件，类似 \`.gitignore\`，但作用是**避免把无用文件复制进镜像**：

\`\`\`text
# .dockerignore
# 避免 COPY . . 把这些文件复制进镜像

# 版本控制
.git
.gitignore

# Python 缓存
__pycache__
*.pyc
*.pyo
*.pyd
.Python

# 虚拟环境
venv/
.venv/
env/

# IDE
.vscode/
.idea/

# 测试和文档
.pytest_cache/
.coverage
htmlcov/
*.md

# 环境变量（敏感信息不要进镜像！）
.env
.env.local

# Docker 自身
Dockerfile
docker-compose.yml
.dockerignore

# 日志
*.log
logs/
\`\`\`

> 避坑：不写 \`.dockerignore\`，\`COPY . .\` 会把 \`.git\`、\`venv\`、\`.env\` 全复制进镜像。镜像变大、可能泄露密钥。

### 58.6 暴露端口和环境变量

\`\`\`dockerfile
# Dockerfile
# 暴露端口（EXPOSE 只是文档说明，真正映射要 -p）
EXPOSE 8000

# 设置默认环境变量（可用 -e 覆盖）
ENV APP_ENV=production \\
    LOG_LEVEL=info \\
    WORKERS=4
\`\`\`

\`\`\`bash
# 运行时覆盖环境变量
docker run -d \\
  -p 8000:8000 \\
  -e APP_ENV=staging \\
  -e DATABASE_URL=postgresql://user:pass@db:5432/mydb \\
  -e SECRET_KEY=abc123 \\
  --name my-app \\
  my-fastapi-app:1.0

# 用 --env-file 从文件读取（推荐，避免密钥进命令历史）
docker run -d -p 8000:8000 --env-file .env --name my-app my-fastapi-app:1.0
\`\`\`

FastAPI 应用里读取环境变量：

\`\`\`python
# app/core/config.py
# 从 pydantic_settings 导入 BaseSettings 基类
# pydantic-settings 是 pydantic v2 的配置管理子包，专门用于读取环境变量
from pydantic_settings import BaseSettings

# Settings 类继承 BaseSettings，会自动从环境变量和 .env 文件读取配置
class Settings(BaseSettings):
    # 每个类属性对应一个环境变量，类型注解决定如何转换
    # 冒号后面是默认值，环境变量没设时用默认值
    # 从环境变量读取，有默认值
    app_env: str = "development"       # 应用环境（development/staging/production）
    database_url: str = "sqlite:///./test.db"  # 数据库连接 URL
    secret_key: str = "change-me"      # 密钥（生产环境必须改！）
    log_level: str = "info"            # 日志级别
    workers: int = 4                   # worker 数量

    # 内部 Config 类配置 BaseSettings 的行为
    class Config:
        # env_file 指定从哪个文件读取环境变量
        # 优先级：系统环境变量 > .env 文件 > 类默认值
        env_file = ".env"

# 创建全局配置实例
# 其他模块 from app.core.config import settings 使用
settings = Settings()
\`\`\`

### 58.7 docker build 和 docker run 详解

\`\`\`bash
# docker build 参数
docker build \\
  -t my-app:1.0 \\              # 镜像名:标签
  -t my-app:latest \\           # 多标签
  --build-arg HTTP_PROXY=... \\  # 构建时变量
  --no-cache \\                  # 不用缓存（排查问题用）
  -f Dockerfile.prod \\          # 指定 Dockerfile
  .                              # 构建上下文

# docker run 参数
docker run \\
  -d \\                          # 后台运行
  -p 8000:8000 \\                # 端口映射
  -p 9000:9000 \\                # 多端口
  -e KEY=value \\                # 环境变量
  --env-file .env \\             # 环境变量文件
  -v /host/data:/app/data \\     # 卷映射（持久化）
  -v /host/logs:/app/logs \\     # 日志持久化
  --name my-app \\               # 容器名
  --restart unless-stopped \\    # 重启策略
  --memory 512m \\               # 内存限制
  --cpus 2 \\                    # CPU 限制
  --network my-net \\            # 加入网络
  --user 1000:1000 \\            # 以非 root 运行
  my-app:1.0

# 重启策略说明：
# no: 不重启（默认）
# on-failure: 非正常退出时重启
# always: 总是重启（包括手动 stop 后 daemon 重启也会拉起）
# unless-stopped: 总是重启，但手动 stop 的不拉起（推荐）
\`\`\`

### 58.8 docker-compose 多容器编排（Demo 4）

实际项目通常有多个服务：API + 数据库 + Redis。手动 docker run 太麻烦，用 docker-compose 编排：

\`\`\`yaml
# docker-compose.yml - 多容器编排
# 用法: docker-compose up -d

version: "3.9"

services:
  # === FastAPI 应用 ===
  api:
    build: .                          # 从当前目录的 Dockerfile 构建
    # 或者用现成镜像:
    # image: my-fastapi-app:1.0
    container_name: my-api
    ports:
      - "8000:8000"                   # 主机:容器
    environment:
      - APP_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=\${SECRET_KEY}      # 从 .env 文件读取
    depends_on:
      db:
        condition: service_healthy    # 等 db 健康检查通过再启动
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - my-network
    volumes:
      - ./logs:/app/logs              # 日志持久化

  # === PostgreSQL 数据库 ===
  db:
    image: postgres:16-alpine
    container_name: my-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    ports:
      - "5432:5432"                   # 生产环境别暴露，仅调试用
    volumes:
      - pgdata:/var/lib/postgresql/data  # 数据持久化
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - my-network

  # === Redis 缓存 ===
  redis:
    image: redis:7-alpine
    container_name: my-redis
    ports:
      - "6379:6379"                   # 生产环境别暴露
    volumes:
      - redisdata:/data
    restart: unless-stopped
    networks:
      - my-network
    command: redis-server --requirepass \${REDIS_PASSWORD}

# === 持久化卷 ===
volumes:
  pgdata:     # Docker 管理的卷，容器删了数据还在
  redisdata:

# === 网络 ===
networks:
  my-network:
    driver: bridge
\`\`\`

\`\`\`bash
# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f api

# 只重启 api
docker-compose restart api

# 重新构建并启动
docker-compose up -d --build

# 停止并删除容器（卷保留）
docker-compose down

# 停止并删除容器和卷（慎用！数据会丢）
docker-compose down -v
\`\`\`

### 58.9 数据库 + API + Redis 三容器组合（Demo 5）

完整的 FastAPI + PostgreSQL + Redis 应用示例：

\`\`\`python
# app/main.py - 完整的三服务集成
# 从 contextlib 导入 asynccontextmanager 用于创建异步生命周期管理器
from contextlib import asynccontextmanager
# 从 fastapi 导入 FastAPI 应用类和 HTTPException 异常类
# HTTPException 用于抛出带状态码的 HTTP 错误响应
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel，用于定义请求/响应数据模型
from pydantic import BaseModel
# 导入 asyncpg：PostgreSQL 的异步驱动，性能比 psycopg2 好
import asyncpg
# 导入 redis 的异步客户端（redis.asyncio 是 Python 3.6+ 异步版本）
# 用 as redis 是为了和同步 redis 包名区分
import redis.asyncio as redis
# 导入 os 用于读取环境变量
import os

# 全局连接池/客户端（在 lifespan 里初始化，路由里使用）
# 全局变量让所有请求共享同一个连接池，避免每个请求都新建连接
db_pool = None       # asyncpg 连接池
redis_client = None  # Redis 异步客户端

# @asynccontextmanager 装饰器把 lifespan 函数变成异步上下文管理器
@asynccontextmanager
async def lifespan(app: FastAPI):
    # === startup ===
    # global 声明要修改全局变量（否则 Python 会创建局部变量）
    global db_pool, redis_client

    # 创建数据库连接池
    # asyncpg.create_pool 创建连接池，复用连接避免频繁握手
    # min_size=5: 池里至少保持 5 个连接
    # max_size=20: 池里最多 20 个连接（超过的请求要等）
    db_pool = await asyncpg.create_pool(
        # os.getenv 读取环境变量，第二个参数是默认值
        os.getenv("DATABASE_URL", "postgresql://postgres:password@db:5432/mydb"),
        min_size=5,
        max_size=20,
    )

    # 创建 Redis 连接
    # redis.from_url 用 URL 字符串创建客户端，比传参数直观
    redis_client = redis.from_url(
        os.getenv("REDIS_URL", "redis://redis:6379/0")
    )

    # yield 把控制权交回给 FastAPI，开始处理请求
    yield

    # === shutdown ===
    # 应用关闭时释放资源，否则会泄漏连接
    await db_pool.close()      # 关闭连接池
    await redis_client.close() # 关闭 Redis 连接

# 创建 FastAPI 应用，传入 lifespan 管理器
app = FastAPI(lifespan=lifespan)

# 定义商品模型（Pydantic BaseModel）
# 用于 POST 请求体校验和响应序列化
class Item(BaseModel):
    name: str        # 商品名，必填
    price: float     # 价格，必填，自动转 float

# @app.get 注册 GET 路由，{item_id} 是路径参数
@app.get("/items/{item_id}")
# item_id: int 表示路径参数会被自动转成整数
async def get_item(item_id: int):
    # 1. 先查 Redis 缓存（缓存穿透防护：减少数据库压力）
    # f-string 构造缓存 key，格式统一便于管理
    cache_key = f"item:{item_id}"
    # await redis_client.get 是异步操作，不阻塞事件循环
    cached = await redis_client.get(cache_key)
    if cached:
        # 命中缓存直接返回，不查数据库
        return {"source": "cache", "data": cached}

    # 2. 缓存没有，查数据库
    # db_pool.acquire() 从连接池获取一个连接，用完自动归还
    # async with 保证连接无论是否异常都会归还
    async with db_pool.acquire() as conn:
        # conn.fetchrow 执行 SQL 并返回一行（没结果返回 None）
        # $1 是 asyncpg 的参数占位符（不是 psycopg2 的 %s）
        row = await conn.fetchrow(
            "SELECT id, name, price FROM items WHERE id = $1", item_id
        )
        if not row:
            # 数据库查不到，抛 404 异常
            raise HTTPException(status_code=404, detail="Item not found")

    # 3. 写入缓存（5 分钟过期）
    # setex(key, 过期秒数, value)：写入并设置过期时间
    # 300 秒 = 5 分钟，避免缓存数据过旧
    await redis_client.setex(cache_key, 300, str(dict(row)))

    return {"source": "db", "data": dict(row)}

# @app.post 注册 POST 路由，用于创建商品
@app.post("/items")
# item: Item 表示请求体会被解析成 Item 模型（自动校验类型）
async def create_item(item: Item):
    async with db_pool.acquire() as conn:
        # RETURNING id 是 PostgreSQL 特性，返回插入的 id
        # 不用再单独查一次
        row = await conn.fetchrow(
            "INSERT INTO items (name, price) VALUES ($1, $2) RETURNING id",
            item.name, item.price
        )
    # 创建后清相关缓存（防止后续查询读到旧数据）
    await redis_client.delete(f"item:{row['id']}")
    return {"id": row["id"], "name": item.name, "price": item.price}

# 健康检查接口，检查依赖服务是否正常
@app.get("/health")
async def health():
    # 健康检查（检查依赖）
    try:
        # redis ping 检查 Redis 是否能连
        await redis_client.ping()
        async with db_pool.acquire() as conn:
            # SELECT 1 是最轻量的 SQL，只测试连接是否正常
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "db": "ok", "redis": "ok"}
    except Exception as e:
        # 依赖挂了返回 503，让 K8s/docker 知道服务不可用
        raise HTTPException(status_code=503, detail=str(e))
\`\`\`

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 装编译依赖（asyncpg 需要）
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 装运行时依赖
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \\
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", "--error-logfile", "-"]
\`\`\`

\`\`\`text
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
gunicorn==21.2.0
asyncpg==0.29.0
redis==5.0.1
pydantic-settings==2.1.0
\`\`\`

### 58.10 健康检查 healthcheck（Demo 6）

容器挂了但进程没退出，Docker 默认不知道。用 healthcheck 让 Docker 主动检查：

\`\`\`dockerfile
# Dockerfile 里的 healthcheck
HEALTHCHECK \\
  --interval=30s \\         # 每 30 秒检查一次
  --timeout=5s \\           # 检查超时时间
  --start-period=10s \\     # 启动后 10 秒开始检查（给应用启动时间）
  --retries=3 \\            # 连续 3 次失败才标记 unhealthy
  CMD curl -f http://localhost:8000/health || exit 1
\`\`\`

\`\`\`yaml
# docker-compose.yml 里的 healthcheck（覆盖 Dockerfile 的）
services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      start_period: 10s
      retries: 3
\`\`\`

\`\`\`bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' my-app
# healthy / unhealthy / starting

# 查看健康检查日志
docker inspect --format='{{json .State.Health.Log}}' my-app | jq
\`\`\`

\`\`\`python
# 健康检查接口要检查关键依赖
# 这是"全面"健康检查，会检查所有依赖服务
@app.get("/health")
async def health():
    """全面健康检查"""
    # checks 字典记录每个依赖的状态
    checks = {}

    # 检查数据库
    try:
        # db_pool.acquire() 从连接池借一个连接
        async with db_pool.acquire() as conn:
            # fetchval 返回第一行第一列的值（这里只是测试连接）
            await conn.fetchval("SELECT 1")
        checks["db"] = "ok"
    except Exception:
        # 任何异常都算数据库挂了
        checks["db"] = "fail"

    # 检查 Redis
    try:
        # redis ping 是最轻量的检查，返回 PONG
        await redis_client.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "fail"

    # 只要有依赖挂了，返回 503
    # all() 函数：所有元素为 True 才返回 True
    # 这里遍历 checks 的值，全为 "ok" 才算健康
    all_ok = all(v == "ok" for v in checks.values())
    if not all_ok:
        # 503 Service Unavailable，让 K8s 把流量切走
        raise HTTPException(status_code=503, detail=checks)
    return {"status": "healthy", "checks": checks}

# 存活检查（liveness）vs 就绪检查（readiness）
# K8s 有两种探针：livenessProbe 和 readinessProbe
@app.get("/health/live")
async def liveness():
    """存活检查：应用进程活着就 OK，不查依赖"""
    # liveness 只检查进程是否活着，不查依赖
    # 进程活着但依赖挂了，K8s 不会重启（因为重启没用，依赖还是挂的）
    return {"status": "alive"}

@app.get("/health/ready")
async def readiness():
    """就绪检查：能处理请求才 OK，要查依赖"""
    # readiness 检查依赖，依赖挂了 K8s 会把流量切走（但不重启）
    # 等依赖恢复，readiness 通过，K8s 再把流量切回来
    return await health()
\`\`\`

### 58.11 常见错误和避坑指南

**错误 1：镜像太大**

\`\`\`bash
# 查看
docker images my-fastapi-app
# 800MB? 太大了

# 排查每层大小
docker history my-fastapi-app:1.0

# 优化手段：
# 1. 用 slim 而不是 full
# 2. 多阶段构建
# 3. pip install --no-cache-dir
# 4. apt-get 装完清缓存: rm -rf /var/lib/apt/lists/*
# 5. 用 .dockerignore 排除无用文件
\`\`\`

**错误 2：容器能跑但连不上数据库**

\`\`\`bash
# 原因 1: 用了 localhost
# 容器里的 localhost 是容器自己，不是主机！
# 解决：用服务名（docker-compose 里 db/redis）

# 错误:
DATABASE_URL=postgresql://user:pass@localhost:5432/db
# 正确:
DATABASE_URL=postgresql://user:pass@db:5432/db

# 原因 2: 网络不通
# 检查是否在同一网络
docker network inspect my-network
\`\`\`

**错误 3：容器时区不对**

\`\`\`dockerfile
# 默认是 UTC，日志时间看着别扭
# 设置时区
ENV TZ=Asia/Shanghai
RUN apt-get update && apt-get install -y tzdata \\
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \\
    && echo $TZ > /etc/timezone \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

**错误 4：用 root 运行**

\`\`\`dockerfile
# 安全风险：root 用户被攻破后能控制主机
# 创建非 root 用户
RUN useradd -m appuser
USER appuser
# 注意：USER 之后的命令都以 appuser 运行
# 如果之前 COPY 的文件权限不对，appuser 可能读不了
\`\`\`

**错误 5：构建缓存失效**

\`\`\`dockerfile
# COPY . . 会让缓存频繁失效
# 解决：分层 COPY，把不常变的放前面

# 不好：
COPY . .
RUN pip install -r requirements.txt

# 好：
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
\`\`\`

### 58.12 实战：完整的 Docker 部署方案

\`\`\`dockerfile
# Dockerfile - 生产级镜像
# 阶段 1: builder
FROM python:3.11-slim AS builder

WORKDIR /app

# 编译依赖
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# 虚拟环境
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 阶段 2: runner
FROM python:3.11-slim AS runner

# 时区
ENV TZ=Asia/Shanghai
RUN apt-get update && apt-get install -y --no-install-recommends \\
    tzdata libpq5 curl && \\
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \\
    echo $TZ > /etc/timezone && \\
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制虚拟环境
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 复制代码
COPY --chown=appuser:appuser . .

# 非 root 用户
RUN useradd -m appuser
USER appuser

EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
    CMD curl -f http://localhost:8000/health/live || exit 1

CMD ["gunicorn", "app.main:app", \\
     "-w", "4", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", \\
     "--error-logfile", "-", \\
     "--timeout", "60", \\
     "--graceful-timeout", "30"]
\`\`\`

\`\`\`yaml
# docker-compose.prod.yml - 生产环境编排
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    image: my-fastapi-app:1.0
    container_name: fastapi-app
    ports:
      - "127.0.0.1:8000:8000"  # 只绑本地，让 Nginx 代理
    environment:
      - APP_ENV=production
      - DATABASE_URL=postgresql://postgres:\${DB_PASSWORD}@db:5432/mydb
      - REDIS_URL=redis://:\${REDIS_PASSWORD}@redis:6379/0
      - SECRET_KEY=\${SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/live"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "2"

  db:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_DB=mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - backend

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: redis-server --requirepass \${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    restart: unless-stopped
    networks:
      - backend

volumes:
  pgdata:
  redisdata:

networks:
  backend:
    driver: bridge
\`\`\`

\`\`\`bash
# .env 文件（不提交到 git）
DB_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password
SECRET_KEY=your_secret_key_at_least_32_chars

# 部署
docker-compose -f docker-compose.prod.yml up -d --build

# 验证
docker-compose -f docker-compose.prod.yml ps
curl http://localhost:8000/health
\`\`\`

### 小结

- **slim > alpine**：Python 项目用 slim，兼容性好、坑少；
- **多阶段构建**：builder 编译，runner 运行，镜像小又安全；
- **.dockerignore 必写**：避免无用文件进镜像，防止密钥泄露；
- **分层缓存**：先 COPY requirements，后 COPY 代码；
- **非 root 运行**：安全第一；
- **healthcheck 必配**：让 Docker 知道应用是否真健康；
- **docker-compose 编排**：多容器一键启停，生产环境标配。
`,
  },

  // =============================================================
  // 第五十九章：Nginx 反向代理
  // =============================================================
  {
    id: "fa-nginx",
    group: "部署与运维",
    icon: "🌐",
    title: "Nginx 反向代理",
    content: `## 第五十九章　Nginx 反向代理

### 59.1 为什么需要 Nginx

Gunicorn 已经能跑 FastAPI 了，为什么前面还要加一层 Nginx？

| 能力 | Gunicorn | Nginx |
| --- | --- | --- |
| 处理 HTTP 请求 | ✅ | ✅ |
| SSL/HTTPS | ❌（配置麻烦） | ✅（专业） |
| 静态文件 | ❌（慢） | ✅（极快） |
| 负载均衡 | 有限 | ✅（专业） |
| 请求限流 | ❌ | ✅ |
| Gzip 压缩 | ❌ | ✅ |
| 缓存 | ❌ | ✅ |
| 防 DDoS | ❌ | ✅ |
| WebSocket 代理 | ✅ | ✅ |

一句话：**Nginx 是专业的"前台"，Gunicorn 是"后厨"**。前台负责接待（SSL、限流、静态文件），后厨负责做菜（业务逻辑）。

> 经典三层架构：\`客户端 → Nginx → Gunicorn → FastAPI\`。Nginx 处理所有"非业务"的事，Gunicorn 专注跑业务代码。

### 59.2 基本反向代理配置（Demo 1）

\`\`\`nginx
# /etc/nginx/conf.d/myapp.conf - 基本反向代理

# 定义上游服务（Gunicorn）
upstream gunicorn_backend {
    # Gunicorn 监听的地址
    server 127.0.0.1:8000;

    # 如果有多台服务器，可以负载均衡:
    # server 127.0.0.1:8001;
    # server 127.0.0.1:8002;
}

# HTTP 服务（80 端口）
server {
    listen 80;
    server_name api.example.com;

    # 请求大小限制（防上传大文件攻击）
    client_max_body_size 10m;

    # 反向代理所有请求到 Gunicorn
    location / {
        proxy_pass http://gunicorn_backend;

        # 传递请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 代理超时
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
\`\`\`

\`\`\`bash
# 测试配置语法
sudo nginx -t

# 重新加载配置（不断连）
sudo nginx -s reload

# 重启
sudo systemctl restart nginx
\`\`\`

### 59.3 proxy_pass 配置详解（Demo 2）

\`proxy_pass\` 是反向代理的核心指令，有几个细节容易踩坑：

\`\`\`nginx
# /etc/nginx/conf.d/proxy_examples.conf

server {
    listen 80;
    server_name api.example.com;

    # === 情况 1: proxy_pass 不带路径 ===
    # 请求 /api/users → 转发到 http://127.0.0.1:8000/api/users
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        # 注意: 末尾没斜杠，原始路径 /api/ 原样转发
    }

    # === 情况 2: proxy_pass 带路径（带斜杠）===
    # 请求 /api/users → 转发到 http://127.0.0.1:8000/users
    # /api/ 被替换掉
    location /api2/ {
        proxy_pass http://127.0.0.1:8000/;
        # 末尾有斜杠，/api2/ 被替换为 /
    }

    # === 情况 3: 转发到特定路径 ===
    # 请求 /v1/xxx → 转发到 http://127.0.0.1:8000/api/v1/xxx
    location /v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
    }

    # === 情况 4: 用 upstream ===
    location /upstream/ {
        proxy_pass http://gunicorn_backend;
    }

    # === 情况 5: 只代理特定方法（很少用）===
    location /upload {
        # 限制只允许 POST
        limit_except POST {
            deny all;
        }
        proxy_pass http://127.0.0.1:8000;
    }
}

upstream gunicorn_backend {
    server 127.0.0.1:8000;
}
\`\`\`

> **避坑**：\`proxy_pass\` 带不带斜杠行为不同！\`proxy_pass http://backend;\` 和 \`proxy_pass http://backend/;\` 转发的路径不一样。记忆口诀："带斜杠就替换，不带斜杠就拼接"。

### 59.4 负载均衡 upstream（Demo 3）

如果有多台服务器，Nginx 能做负载均衡：

\`\`\`nginx
# /etc/nginx/conf.d/loadbalance.conf

# 定义上游服务器集群
upstream fastapi_cluster {
    # 轮询（默认）：请求轮流分配
    server 192.168.1.10:8000;
    server 192.168.1.11:8000;
    server 192.168.1.12:8000;

    # === 权重模式 ===
    # server 192.168.1.10:8000 weight=3;  # 分配 3 倍请求
    # server 192.168.1.11:8000 weight=1;

    # === IP 哈希（会话保持）===
    # 同一 IP 总是打到同一台机器
    # ip_hash;

    # === 最少连接数 ===
    # 把请求发给当前连接数最少的机器
    # least_conn;

    # === 健康检查 ===
    # max_fails: 失败几次标记为宕机
    # fail_timeout: 标记宕机后多久再试
    # server 192.168.1.10:8000 max_fails=3 fail_timeout=30s;

    # === 备用服务器 ===
    # 主服务器全挂了才用
    # server 192.168.1.99:8000 backup;

    # === 慢启动 ===
    # 新加入的服务器逐渐增加流量（防止瞬间压垮）
    # server 192.168.1.10:8000 slow_start=30s;

    # === 长连接 ===
    # 保持到后端的长连接，减少连接开销
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://fastapi_cluster;

        # 长连接相关
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # 传递客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

**负载均衡算法对比：**

| 算法 | 配置 | 场景 |
| --- | --- | --- |
| 轮询（默认） | 无 | 服务器性能相同 |
| 权重 | weight=N | 服务器性能不同 |
| IP 哈希 | ip_hash | 需要会话保持（不推荐，用 Redis 更好） |
| 最少连接 | least_conn | 请求处理时间差异大 |

### 59.5 SSL/HTTPS 配置（Demo 4）

生产环境必须 HTTPS。Nginx 处理 SSL，后端走 HTTP：

\`\`\`nginx
# /etc/nginx/conf.d/ssl.conf

# HTTP 跳转到 HTTPS
server {
    listen 80;
    server_name api.example.com;
    # 永久重定向到 HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS 服务
server {
    listen 443 ssl http2;              # 开启 HTTP/2
    server_name api.example.com;

    # SSL 证书
    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # SSL 协议版本（禁用老的不安全的）
    ssl_protocols TLSv1.2 TLSv1.3;

    # 加密套件
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # SSL 会话缓存（加速 HTTPS 握手）
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS（强制浏览器以后都用 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

\`\`\`bash
# 用 Let's Encrypt 免费申请证书
sudo apt install certbot python3-certbot-nginx

# 自动配置 Nginx + 申请证书 + 设置自动续期
sudo certbot --nginx -d api.example.com

# 手动续期测试
sudo certbot renew --dry-run
\`\`\`

> **避坑**：SSL 证书放在 Nginx 层处理，FastAPI 那边只用 HTTP。这样证书续期、加密算法调整都不用动后端。

### 59.6 WebSocket 代理配置（Demo 5）

FastAPI 的 WebSocket 需要特殊配置，否则连接会立即断开：

\`\`\`nginx
# /etc/nginx/conf.d/websocket.conf

server {
    listen 80;
    server_name ws.example.com;

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;

        # === WebSocket 必需的配置 ===

        # 升级到 HTTP/1.1（WebSocket 依赖）
        proxy_http_version 1.1;

        # 设置 Upgrade 头
        proxy_set_header Upgrade $http_upgrade;

        # 设置 Connection 为 upgrade
        proxy_set_header Connection "upgrade";

        # 传递客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # === 超时配置（WebSocket 要调大）===

        # WebSocket 连接是长连接，默认 60s 超时会让连接断开
        proxy_read_timeout 86400s;   # 24 小时
        proxy_send_timeout 86400s;
    }
}
\`\`\`

\`\`\`python
# app/main.py - WebSocket 服务端
# 从 fastapi 导入 FastAPI 应用类
# WebSocket 是 FastAPI 的 WebSocket 连接类，用于类型注解
# WebSocketDisconnect 是客户端断开时抛出的异常
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建 FastAPI 应用实例
app = FastAPI()

# @app.websocket 装饰器注册 WebSocket 路由（注意不是 @app.get）
# /ws/chat 是 WebSocket 端点路径，客户端连 wss://example.com/ws/chat
@app.websocket("/ws/chat")
# websocket: WebSocket 是 FastAPI 自动注入的 WebSocket 连接对象
async def websocket_endpoint(websocket: WebSocket):
    # websocket.accept() 接受客户端连接（完成握手）
    # 不调用 accept 客户端会收到 403
    await websocket.accept()
    try:
        # while True 死循环持续接收消息，直到客户端断开
        while True:
            # 接收消息
            # receive_text() 接收文本消息（还有 receive_bytes/receive_json）
            # await 是异步等待，不阻塞事件循环
            data = await websocket.receive_text()
            # 回显
            # send_text 发送文本消息给客户端
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        # 客户端主动断开或网络断开时抛出此异常
        # 这里只打印日志，实际项目可能要清理用户在线状态
        print("客户端断开")
\`\`\`

\`\`\`javascript
// 前端 JavaScript 连接
// 走 Nginx 代理: ws://example.com/ws/chat
// 或 wss://example.com/ws/chat（HTTPS）
const ws = new WebSocket("wss://example.com/ws/chat");
ws.onopen = () => ws.send("Hello");
ws.onmessage = (e) => console.log(e.data);
\`\`\`

> **避坑**：不配 \`proxy_read_timeout\`，默认 60 秒没数据 Nginx 就断连。聊天室、推送服务要调到几小时甚至一天。

### 59.7 静态文件服务

FastAPI 也能服务静态文件，但 Nginx 做这件事快得多（直接 sendfile，不经应用层）：

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;

    # 静态文件直接由 Nginx 服务
    location /static/ {
        alias /var/www/my_project/static/;  # 注意 alias 末尾有斜杠
        expires 30d;                         # 浏览器缓存 30 天
        add_header Cache-Control "public, immutable";

        # 防止访问隐藏文件
        location ~ /\\. {
            deny all;
        }
    }

    # 媒体文件（用户上传的）
    location /media/ {
        alias /var/www/my_project/media/;
        expires 7d;
    }

    # 其他请求走 FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

\`\`\`python
# FastAPI 里就不需要挂载 StaticFiles 了
# from fastapi.staticfiles import StaticFiles
# app.mount("/static", StaticFiles(directory="static"), name="static")
# 上面这行可以删掉，让 Nginx 处理
\`\`\`

### 59.8 请求大小限制和超时

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;

    # === 请求体大小限制 ===
    # 默认 1MB，上传文件要调大
    client_max_body_size 10m;       # 全局
    # 或在特定 location 里设:
    # location /upload {
    #     client_max_body_size 100m;  # 上传接口允许 100MB
    # }

    # === 客户端超时 ===
    client_body_timeout 30s;        # 读取请求体超时
    client_header_timeout 30s;      # 读取请求头超时

    # === 保持连接 ===
    keepalive_timeout 65s;          # 客户端 keep-alive 超时
    keepalive_requests 100;         # 一个连接最多处理多少请求

    # === 代理超时 ===
    location / {
        proxy_pass http://127.0.0.1:8000;

        proxy_connect_timeout 5s;   # 连接后端超时
        proxy_send_timeout 60s;     # 发送请求到后端超时
        proxy_read_timeout 60s;     # 读取后端响应超时

        # 如果后端慢，调大 read_timeout
        # 但要防止用户等太久，用 Nginx 的缓冲
    }

    # === 限流 ===
    location /api/ {
        proxy_pass http://127.0.0.1:8000;

        # 限流：每个 IP 每秒最多 10 个请求
        limit_req zone=api_limit burst=20 nodelay;
    }

    # 在 http 块里定义限流区
    # limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
}
\`\`\`

### 59.9 Nginx + Gunicorn + FastAPI 三层架构（Demo 6）

完整的实战配置：

\`\`\`python
# app/main.py
# 从 fastapi 导入 FastAPI 应用类和 Request 请求对象
# Request 用于在路由里获取请求信息（如 headers、client 等）
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 JSONResponse，用于手动构造 JSON 响应
# 异常处理器里用 JSONResponse 而不是 return dict，因为要自定义状态码
from fastapi.responses import JSONResponse
# 导入 logging 模块用于记录日志
import logging

# 配置日志：level=INFO 设置日志级别
logging.basicConfig(level=logging.INFO)
# 创建 logger 实例，用 "uvicorn.access" 名字便于和 uvicorn 日志关联
logger = logging.getLogger("uvicorn.access")

# 创建 FastAPI 应用，title 显示在 Swagger 文档
app = FastAPI(title="三层架构示例")

# 根路由，简单返回欢迎消息
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

# 健康检查接口，给 Nginx/K8s 做探针用
@app.get("/health")
async def health():
    return {"status": "healthy"}

# 用户接口，{user_id} 是路径参数，int 类型注解自动转换
@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "name": f"User {user_id}"}

# @app.exception_handler(Exception) 注册全局异常处理器
# Exception 是所有异常的基类，捕获所有未处理的异常
# 这样业务代码抛异常时不会返回 500 带堆栈（不安全也不友好）
@app.exception_handler(Exception)
# 异常处理函数签名固定：request: Request, exc: Exception
async def global_exception_handler(request: Request, exc: Exception):
    # 记录错误日志，exc_info=True 会打印完整堆栈
    logger.error(f"未处理异常: {exc}", exc_info=True)
    # 返回统一的 500 响应，不暴露内部错误细节给客户端
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )
\`\`\`

\`\`\`nginx
# /etc/nginx/conf.d/fastapi_app.conf - 生产级配置

# 后端集群
upstream fastapi_backend {
    server 127.0.0.1:8000;
    # server 127.0.0.1:8001;  # 可扩展多实例
    keepalive 32;
}

# HTTP → HTTPS 跳转
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主服务
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL 证书
    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 请求大小
    client_max_body_size 10m;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
    gzip_min_length 1000;

    # 静态文件
    location /static/ {
        alias /var/www/my_project/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查（不记日志）
    location /health {
        proxy_pass http://fastapi_backend;
        access_log off;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }

    # API 请求
    location / {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
\`\`\`

### 59.10 常见错误和避坑指南

**错误 1：502 Bad Gateway**

\`\`\`bash
# 原因：Nginx 连不上后端
# 排查:
# 1. Gunicorn 是否在跑
sudo systemctl status gunicorn
# 2. 端口是否在监听
ss -tlnp | grep 8000
# 3. 防火墙是否放行
sudo ufw status
# 4. SELinux 是否阻止（CentOS 常见）
sudo setenforce 0  # 临时关闭测试
\`\`\`

**错误 2：WebSocket 一直断开**

\`\`\`nginx
# 检查这三行是否都有
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# 还要检查超时
proxy_read_timeout 86400s;
\`\`\`

**错误 3：获取不到客户端真实 IP**

\`\`\`python
# Nginx 要传 X-Forwarded-For
# proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

# FastAPI 要用 X-Forwarded-For
# 从 fastapi 导入 Request，用于访问请求信息（headers、client 等）
from fastapi import Request

# @app.get 注册 GET 路由 /ip
@app.get("/ip")
# request: Request 是 FastAPI 自动注入的请求对象
# 不用 Depends，直接用类型注解就能拿到
async def get_ip(request: Request):
    # request.client.host 是直接连到应用的客户端 IP
    # 走 Nginx 代理后，这里是 Nginx 的 IP（如 127.0.0.1），不是真实客户端
    # 要从 X-Forwarded-For 取
    # request.headers.get 不区分大小写，"x-forwarded-for" 和 "X-Forwarded-For" 都行
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        # X-Forwarded-For 格式: "客户端IP, 代理1, 代理2, ..."
        # split(",")[0] 取第一个，即真实客户端 IP
        # strip() 去掉前后空格
        client_ip = forwarded.split(",")[0].strip()
    else:
        # 没走代理（如开发环境），直接用 client.host
        client_ip = request.client.host
    return {"ip": client_ip}
\`\`\`

**错误 4：proxy_pass 路径错乱**

\`\`\`nginx
# 记住：带斜杠=替换，不带斜杠=拼接
location /api/ {
    proxy_pass http://backend;      # /api/users → /api/users
    # proxy_pass http://backend/;   # /api/users → /users
    # proxy_pass http://backend/v1/; # /api/users → /v1/users
}
\`\`\`

**错误 5：alias 和 root 搞混**

\`\`\`nginx
# root: 拼接 location 到 root 路径后面
location /static/ {
    root /var/www;   # 实际找 /var/www/static/xxx
}

# alias: 用 alias 替换 location
location /static/ {
    alias /var/www/files/;  # 实际找 /var/www/files/xxx
}

# 记忆: root 是"加上"，alias 是"换成"
\`\`\`

### 59.11 实战：生产级 Nginx 配置

完整的 Nginx + Gunicorn + FastAPI 部署：

\`\`\`bash
# 完整部署流程

# 1. 安装 Nginx
sudo apt update
sudo apt install nginx

# 2. 部署 FastAPI 应用（见上一章）
# Gunicorn 跑在 127.0.0.1:8000

# 3. 配置 Nginx
sudo cp fastapi_app.conf /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl reload nginx

# 4. 申请 SSL 证书
sudo certbot --nginx -d api.example.com

# 5. 验证
curl https://api.example.com/health
\`\`\`

\`\`\`nginx
# /etc/nginx/nginx.conf - Nginx 主配置（通常不用改）
user www-data;
worker_processes auto;      # 自动按 CPU 核数
pid /run/nginx.pid;

events {
    worker_connections 768;  # 每个 worker 的最大连接数
}

http {
    # 基础设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # MIME 类型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_disable "msie6";
    gzip_types text/plain application/json application/javascript text/css;

    # 限流区定义
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # 包含所有站点配置
    include /etc/nginx/conf.d/*.conf;
}
\`\`\`

### 小结

- **Nginx 是前台，Gunicorn 是后厨**：Nginx 处理 SSL、静态文件、限流，Gunicorn 专注业务；
- **proxy_pass 带不带斜杠**：带斜杠=替换路径，不带=拼接路径；
- **WebSocket 要配三行**：\`proxy_http_version 1.1\` + \`Upgrade\` + \`Connection upgrade\`；
- **超时要调对**：WebSocket 调大 \`read_timeout\`，普通接口 60s 够用；
- **SSL 交给 Nginx**：后端走 HTTP，证书管理方便；
- **502 排查**：Gunicorn 是否在跑、端口是否监听、防火墙是否放行。
`,
  },

  // =============================================================
  // 第六十章：CI/CD 持续集成部署
  // =============================================================
  {
    id: "fa-cicd",
    group: "部署与运维",
    icon: "🔄",
    title: "CI/CD 持续集成部署",
    content: `## 第六十章　CI/CD 持续集成部署

### 60.1 什么是 CI/CD

**CI（Continuous Integration，持续集成）**：代码 push 到仓库后，自动运行测试、构建。保证每次提交都是"好的"。

**CD（Continuous Delivery/Deployment，持续交付/部署）**：自动把通过测试的代码部署到生产环境。

\`\`\`
开发 → 提交 → CI 自动测试 → 自动构建镜像 → 自动部署 → 生产
 │                                                    ↑
 └──────── 反馈 ←──── 监控告警 ←─────────────────────┘
\`\`\`

没有 CI/CD 之前，部署是这样的：

1. 本地跑测试（可能忘了跑）；
2. SSH 到服务器；
3. git pull；
4. 装依赖；
5. 重启服务；
6. 发现挂了，再 SSH 排查。

每次部署都心惊胆战，而且经常忘记某一步。CI/CD 把这些步骤自动化，**一键部署、可回滚、可审计**。

| 概念 | 说明 |
| --- | --- |
| CI | 自动测试 + 自动构建 |
| CD | 自动部署到生产 |
| Pipeline | 流水线，定义 CI/CD 的步骤 |
| Workflow | GitHub Actions 里的流水线 |
| Artifact | 构建产物（如 Docker 镜像、jar 包） |
| Runner | 执行 CI/CD 的机器 |

### 60.2 GitHub Actions 基础（Demo 1）

GitHub Actions 是 GitHub 内置的 CI/CD 工具，配置文件放在 \`.github/workflows/\` 目录：

\`\`\`yaml
# .github/workflows/01-basic.yml - 最基础的 workflow
name: Basic CI  # workflow 名称

# 触发条件：什么时候跑
on:
  push:
    branches: [main, develop]    # push 到 main/develop 时触发
  pull_request:
    branches: [main]              # PR 到 main 时触发

# 任务（可以并行多个）
jobs:
  test:
    runs-on: ubuntu-latest        # 在 Ubuntu 上跑

    steps:
      # 步骤 1: 拉代码
      - name: Checkout code
        uses: actions/checkout@v4   # 用现成的 action

      # 步骤 2: 装 Python
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      # 步骤 3: 装依赖
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # 步骤 4: 跑个简单的命令
      - name: Run echo
        run: echo "Hello from CI!"
\`\`\`

**关键概念：**

- \`on\`：触发条件（push、PR、定时、手动等）；
- \`jobs\`：任务，多个 job 默认并行；
- \`runs-on\`：在什么环境跑（ubuntu-latest、windows-latest 等）；
- \`steps\`：步骤，按顺序执行；
- \`uses\`：用现成的 action（别人写好的）；
- \`run\`：直接执行命令。

### 60.3 自动化测试 workflow（Demo 2）

\`\`\`yaml
# .github/workflows/02-test.yml - 自动化测试
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    # 矩阵测试：多个 Python 版本都测一遍
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}

      # 缓存 pip 依赖，加速构建
      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov httpx

      # 代码格式检查
      - name: Lint with flake8
        run: |
          pip install flake8
          # 语法错误直接失败
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          # 风格问题只警告
          flake8 . --count --exit-zero --max-complexity=10 --statistics

      # 跑测试
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml --cov-report=term

      # 上传覆盖率报告
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
          token: \${{ secrets.CODECOV_TOKEN }}
\`\`\`

\`\`\`python
# tests/test_main.py - 配套的测试代码
# 从 fastapi.testclient 导入 TestClient，用于模拟 HTTP 请求
# TestClient 不需要真正启动服务器，直接在内存里调用 app
from fastapi.testclient import TestClient
# 从 app.main 导入 app 实例（被测对象）
from app.main import app

# 创建测试客户端，后续用它发请求
client = TestClient(app)

# 测试函数必须以 test_ 开头，pytest 才会自动识别
def test_root():
    """测试根路径"""
    # client.get("/") 模拟 GET / 请求
    # 不走网络，直接调用 app，返回 Response 对象
    response = client.get("/")
    # 断言状态码是 200
    assert response.status_code == 200
    # response.json() 把响应体解析成字典
    # 断言返回体里有 "message" 字段
    assert "message" in response.json()

def test_health():
    """测试健康检查"""
    # 测试 /health 接口
    response = client.get("/health")
    assert response.status_code == 200
    # 断言 status 字段值是 "healthy"
    assert response.json()["status"] == "healthy"

def test_create_and_get_user():
    """测试创建用户并查询"""
    # 创建
    # client.post 发 POST 请求，json= 是请求体
    # TestClient 会自动加 Content-Type: application/json
    response = client.post("/api/users", json={"name": "Alice", "age": 30})
    assert response.status_code == 200
    # 从返回体提取 user_id，用于后续查询
    user_id = response.json()["id"]

    # 查询
    # f-string 把 user_id 拼到 URL 里
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 200
    # 断言查到的名字和创建时一致
    assert response.json()["name"] == "Alice"
\`\`\`

### 60.4 自动构建 Docker 镜像（Demo 3）

\`\`\`yaml
# .github/workflows/03-build.yml - 构建 Docker 镜像
name: Build Docker Image

on:
  push:
    branches: [main]
    tags: ["v*"]          # 打 tag 时也触发

jobs:
  build:
    runs-on: ubuntu-latest
    # 只有测试通过才构建
    needs: test           # 依赖测试 job（假设在另一个 workflow 里用 needs）

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # 登录 Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      # 提取 metadata（标签、版本号）
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myusername/my-fastapi-app
          tags: |
            type=ref,event=branch           # 分支名
            type=ref,event=tag              # tag 名
            type=sha,prefix={{sha}}-        # commit sha
            type=raw,value=latest,enable=\${{ github.ref == 'refs/heads/main' }}

      # 构建并推送
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha    # 用 GitHub Actions 缓存
          cache-to: type=gha,mode=max
\`\`\`

> **避坑**：密钥（DOCKERHUB_TOKEN）不要写在 yml 里！去 GitHub 仓库的 Settings → Secrets and variables → Actions 添加。

### 60.5 推送到镜像仓库（Demo 4）

\`\`\`yaml
# .github/workflows/04-publish.yml - 推送到多个镜像仓库
name: Publish

on:
  push:
    tags: ["v*"]    # 打 tag 时才发布正式版

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # === 推到 Docker Hub ===
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      # === 推到 GitHub Container Registry ===
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}    # 这个不用配，自动有

      # === 推到阿里云镜像仓库 ===
      - name: Login to Aliyun ACR
        uses: docker/login-action@v3
        with:
          registry: registry.cn-hangzhou.aliyuncs.com
          username: \${{ secrets.ALIYUN_USERNAME }}
          password: \${{ secrets.ALIYUN_PASSWORD }}

      # 构建并推送到三个仓库
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            myusername/my-fastapi-app:\${{ github.ref_name }}
            myusername/my-fastapi-app:latest
            ghcr.io/\${{ github.repository }}:\${{ github.ref_name }}
            ghcr.io/\${{ github.repository }}:latest
            registry.cn-hangzhou.aliyuncs.com/mynamespace/my-app:\${{ github.ref_name }}

      # 生成构建报告
      - name: Image digest
        run: echo "镜像构建成功 digest=\${{ steps.build.outputs.digest }}"
\`\`\`

### 60.6 自动部署到服务器（Demo 5）

\`\`\`yaml
# .github/workflows/05-deploy.yml - 自动部署到服务器
name: Deploy

on:
  push:
    branches: [main]     # main 分支 push 就部署

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: build          # 等构建完成

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # 方式 1: SSH 到服务器部署
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # 登录服务器后执行的命令

            # 进入项目目录
            cd /var/www/my_project

            # 拉取最新代码
            git pull origin main

            # 拉取最新镜像
            docker pull myusername/my-fastapi-app:latest

            # 重启容器（docker-compose）
            docker-compose -f docker-compose.prod.yml up -d --build

            # 清理旧镜像
            docker image prune -f

            # 健康检查
            sleep 10
            curl -f http://localhost:8000/health || exit 1

            echo "部署成功！"

      # 方式 2: 用 rsync 同步文件
      - name: Sync files
        uses: burnett01/rsync-deployments@6.0.0
        with:
          switches: -avzr --delete
          path: ./
          remote_path: /var/www/my_project/
          remote_host: \${{ secrets.SERVER_HOST }}
          remote_user: \${{ secrets.SERVER_USER }}
          remote_key: \${{ secrets.SSH_PRIVATE_KEY }}
\`\`\`

### 60.7 部署策略：蓝绿部署、滚动部署

**蓝绿部署**：两套环境（蓝、绿），同时只有一套对外服务。发布时切流量。

\`\`\`yaml
# .github/workflows/06-blue-green.yml - 蓝绿部署
name: Blue-Green Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Determine target
        id: target
        run: |
          # 查询当前哪个是活跃环境
          # 假设有个接口能查
          CURRENT=$(curl -s https://api.example.com/which-env)
          if [ "$CURRENT" = "blue" ]; then
            echo "target=green" >> $GITHUB_OUTPUT
          else
            echo "target=blue" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to \${{ steps.target.outputs.target }}
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # 部署到非活跃环境
            cd /var/www/my_project
            export ENV=\${{ steps.target.outputs.target }}
            docker-compose -f docker-compose.\${ENV}.yml up -d --build

            # 等待健康检查通过
            sleep 30
            curl -f http://localhost:800\${{ steps.target.outputs.target == 'blue' && '1' || '2' }}/health

            # 切换 Nginx 到新环境
            sudo cp /etc/nginx/conf.d/api.\${ENV}.conf /etc/nginx/conf.d/api.conf
            sudo nginx -s reload
\`\`\`

**滚动部署**：逐步替换实例，旧实例逐个下线，新实例逐个上线。Docker Swarm / K8s 原生支持。

\`\`\`yaml
# 滚动部署（用 docker-compose 的方式模拟）
- name: Rolling deploy
  run: |
    # 逐个重启容器
    for i in 1 2 3 4; do
      # 启动新实例
      docker-compose up -d --no-deps --build api_$i
      # 等健康检查
      sleep 10
      curl -f http://localhost:800$i/health
      # 停旧实例
      docker stop api_\${i}_old || true
    done
\`\`\`

### 60.8 回滚机制（Demo 6）

部署失败要能快速回滚：

\`\`\`yaml
# .github/workflows/07-rollback.yml - 回滚
name: Rollback

on:
  workflow_dispatch:     # 手动触发
    inputs:
      version:
        description: "要回滚到的版本（tag）"
        required: true
        default: "v1.0.0"

jobs:
  rollback:
    runs-on: ubuntu-latest

    steps:
      - name: Rollback to \${{ github.event.inputs.version }}
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my_project

            # 拉指定版本的镜像
            docker pull myusername/my-fastapi-app:\${{ github.event.inputs.version }}

            # 修改 docker-compose 用旧版本
            export TAG=\${{ github.event.inputs.version }}
            docker-compose -f docker-compose.prod.yml up -d

            # 健康检查
            sleep 10
            if curl -f http://localhost:8000/health; then
              echo "回滚成功！"
            else
              echo "回滚后健康检查失败！"
              exit 1
            fi
\`\`\`

**自动回滚**（部署失败自动回滚）：

\`\`\`yaml
# .github/workflows/08-auto-deploy.yml - 带自动回滚的部署
name: Deploy with Auto Rollback

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy
        id: deploy
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my_project

            # 记录当前版本（用于回滚）
            CURRENT_TAG=$(cat current_version.txt 2>/dev/null || echo "v1.0.0")
            echo "$CURRENT_TAG" > previous_version.txt

            # 部署新版本
            echo "\${{ github.sha }}" > current_version.txt
            docker-compose -f docker-compose.prod.yml up -d --build

            # 健康检查（最多重试 6 次）
            for i in 1 2 3 4 5 6; do
              sleep 10
              if curl -f http://localhost:8000/health; then
                echo "部署成功！"
                exit 0
              fi
              echo "健康检查失败，重试 $i/6..."
            done

            # 健康检查全失败，回滚
            echo "健康检查失败，开始回滚..."
            PREV_TAG=$(cat previous_version.txt)
            export TAG=$PREV_TAG
            docker-compose -f docker-compose.prod.yml up -d
            sleep 10
            curl -f http://localhost:8000/health || exit 1
            echo "回滚成功！"
            exit 1   # 仍然标记为失败，通知团队
\`\`\`

### 60.9 常见错误和避坑指南

**错误 1：密钥泄露**

\`\`\`yaml
# 错误：直接写密钥
- name: Deploy
  env:
    PASSWORD: my_secret_password   # 泄露！所有人都能看 yml
  run: deploy.sh

# 正确：用 secrets
- name: Deploy
  env:
    PASSWORD: \${{ secrets.DEPLOY_PASSWORD }}   # 从 GitHub Secrets 读取
  run: deploy.sh
\`\`\`

**错误 2：workflow 不触发**

\`\`\`yaml
# 检查触发条件
on:
  push:
    branches: [main]
    paths:
      - "app/**"           # 只有 app/ 下的文件变了才触发
      - "requirements.txt"
      - "Dockerfile"
      - ".github/workflows/**"
# 如果改了 README.md，不会触发
\`\`\`

**错误 3：构建缓存不生效**

\`\`\`yaml
# Docker 构建缓存
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
    cache-from: type=gha        # 从 GitHub Actions 缓存读
    cache-to: type=gha,mode=max # 写缓存
\`\`\`

**错误 4：SSH 部署失败**

\`\`\`bash
# 排查:
# 1. 服务器 SSH 能连吗
ssh user@host

# 2. 私钥格式对吗（必须是 PEM 格式）
# 开始: -----BEGIN OPENSSH PRIVATE KEY-----
# 要转成: -----BEGIN RSA PRIVATE KEY-----
ssh-keygen -p -m PEM -f ~/.ssh/id_rsa

# 3. 服务器上的 authorized_keys 加了公钥吗
cat ~/.ssh/authorized_keys

# 4. 权限对吗
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
\`\`\`

**错误 5：部署后服务起不来**

\`\`\`yaml
# 加健康检查，部署后自动验证
- name: Health check
  run: |
    # 最多重试 30 次，每次等 5 秒
    for i in {1..30}; do
      if curl -f https://api.example.com/health; then
        echo "服务正常"
        exit 0
      fi
      sleep 5
    done
    echo "服务启动失败"
    exit 1
\`\`\`

### 60.10 实战：完整的 GitHub Actions CI/CD Pipeline

把前面的整合成一个完整的 pipeline：

\`\`\`yaml
# .github/workflows/cicd.yml - 完整的 CI/CD 流水线
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    tags: ["v*"]
  pull_request:
    branches: [main]

# 同一分支新 push 取消旧的运行
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  # === 阶段 1: 测试 ===
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: \${{ runner.os }}-pip-\${{ hashFiles('requirements*.txt') }}

      - name: Install deps
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov httpx flake8

      - name: Lint
        run: flake8 app/ --count --select=E9,F63,F7,F82

      - name: Test
        run: pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: github.ref == 'refs/heads/main'

  # === 阶段 2: 构建镜像 ===
  build:
    needs: test               # 测试通过才构建
    runs-on: ubuntu-latest
    if: github.event_name == 'push'   # 只有 push 才构建，PR 不构建
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract tags
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myusername/my-fastapi-app
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable=\${{ github.ref == 'refs/heads/main' }}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # === 阶段 3: 部署 ===
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'   # 只有 main 才部署
    environment: production               # 需要手动审批（在 GitHub 设置里配）
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my_project
            git pull origin main

            # 记录当前版本（回滚用）
            echo "\${{ github.sha }}" > /var/www/my_project/.previous_version

            # 拉最新镜像
            docker pull myusername/my-fastapi-app:latest

            # 重启
            docker-compose -f docker-compose.prod.yml up -d

            # 健康检查
            for i in 1 2 3 4 5 6; do
              sleep 10
              if curl -f http://localhost:8000/health; then
                echo "部署成功"
                exit 0
              fi
            done

            # 失败，回滚
            echo "部署失败，回滚..."
            PREV=$(cat /var/www/my_project/.previous_version)
            git checkout $PREV
            docker-compose -f docker-compose.prod.yml up -d
            exit 1

      # 通知（钉钉、飞书、Slack）
      - name: Notify success
        if: success()
        run: |
          curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=\${{ secrets.DINGTALK_TOKEN }}" \\
            -H "Content-Type: application/json" \\
            -d '{"msgtype":"text","text":{"content":"✅ 部署成功: \${{ github.repository }} @\${{ github.sha }}"}}'

      - name: Notify failure
        if: failure()
        run: |
          curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=\${{ secrets.DINGTALK_TOKEN }}" \\
            -H "Content-Type: application/json" \\
            -d '{"msgtype":"text","text":{"content":"❌ 部署失败: \${{ github.repository }} @\${{ github.sha }}\\n查看: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}"}}'
\`\`\`

### 小结

- **CI/CD 三阶段**：测试 → 构建 → 部署，逐步推进，前一步失败后一步不跑；
- **密钥用 secrets**：绝不在 yml 里硬编码；
- **健康检查必配**：部署后自动验证，失败自动回滚；
- **蓝绿部署**：两套环境切流量，零停机发布；
- **回滚机制**：保留历史版本，能快速回退；
- **通知**：部署成功/失败都通知团队（钉钉、飞书、Slack）；
- **缓存**：pip 依赖、Docker 层都要缓存，加速构建。

至此，FastAPI 的部署与运维篇讲完了。从 Gunicorn 进程管理、Docker 容器化、Nginx 反向代理到 CI/CD 自动化，你已经掌握了从开发到生产的完整链路。下一批章节将进入实战项目，把前面学到的所有知识整合成一个完整的应用。
`,
  },
];
