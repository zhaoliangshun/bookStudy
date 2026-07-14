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

> 🍱 **生活类比：部署像开店营业**
>
> 想象你开了一家餐厅：
> - **uvicorn 单进程** = 你一个人又当厨师又当服务员，客人一多就手忙脚乱，去个厕所店里就没人了（进程崩了没人重启）；
> - **Gunicorn** = 你请了个"店长"（master 进程），店长不做饭也不端盘子，只负责招聘管理厨师（worker 进程），哪个厨师生病了立刻换一个，客人完全无感；
> - **多 worker** = 雇了多个厨师同时做饭，4 个厨师能同时处理 4 桌客人（多核 CPU 并行）；
> - **--preload** = 店长提前把菜谱背好，新厨师一来就能直接做菜，不用再花时间学（共享代码省内存）；
> - **优雅重启（HUP）** = 店长让厨师做完手头这桌再换班，不会让客人吃到一半被赶走（graceful reload）。
>
> 所以生产环境必须"店长 + 厨师团队"模式，不能让一个厨师扛所有事。

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
# Server 是 uvicorn 的核心：监听 socket、接收连接、分发到协议处理器
from uvicorn.server import Server
# 导入 HTTP 协议自动选择类（会根据是否装了 httptools 自动选实现）
# AutoHTTPProtocol 会优先用 httptools（C 扩展，快），没有则退回 h11（纯 Python，慢）
from uvicorn.protocols.http.auto import AutoHTTPProtocol
# 导入 WebSocket 协议自动选择类（会根据是否装了 websockets 自动选实现）
# AutoWebsocketProtocol 会优先用 websockets 库，没有则用 wsproto
from uvicorn.protocols.websockets.auto import AutoWebsocketProtocol

# UvicornWorker 继承自 gunicorn 的 Worker 基类
# 这样 Gunicorn master 就能像管理普通 WSGI worker 一样管理 Uvicorn worker
# 继承 Worker 后必须实现 run 方法，master fork 后会调用它
class UvicornWorker(Worker):
    """
    Uvicorn 实现的 Gunicorn worker class。
    继承自 gunicorn.workers.base.Worker，实现了 ASGI 接口。
    """
    # CONFIG_KWARGS 是传给 uvicorn Server 的配置参数
    # 这是一个类变量，所有实例共享，Gunicorn 启动 worker 时会读取它
    # 底层用 httptools 解析 HTTP（高性能，C 实现）
    CONFIG_KWARGS = {
        # loop 选择事件循环实现
        # uvloop 是 asyncio 的 C 扩展替代品，性能提升 2-4 倍
        # asyncio 是 Python 标准库的事件循环，兼容性最好但慢
        "loop": "uvloop",        # 用 uvloop 代替 asyncio 原生 loop（性能提升 2-4 倍）
        # http 选择 HTTP 解析器
        # httptools 是 nodejs http-parser 的 Python 绑定，C 扩展，快
        # h11 是纯 Python 实现，兼容性好但慢
        "http": "httptools",     # 用 httptools 解析 HTTP（C 扩展，比 h11 快）
        # lifespan 控制 FastAPI 生命周期事件
        # "on" 启用，"off" 关闭，"auto" 自动检测
        # 必须开 "on" 才能让 FastAPI 的 @app.on_event / lifespan 生效
        "lifespan": "on",        # 启用 lifespan 事件（FastAPI startup/shutdown）
    }

    def run(self):
        # run 方法由 Gunicorn master 调用，每个 worker fork 后会执行这里
        # 每个 worker 内部跑一个 uvicorn Server
        # self.config 是 Gunicorn 传进来的配置对象
        # Gunicorn 会把命令行参数解析成 config 对象，传给 worker
        server = Server(config=self.config)
        # server.run() 会阻塞，直到收到退出信号
        # 这就是为什么每个 worker 是独立进程：run() 一直阻塞，不会返回
        server.run()

    def handle_exit(self, sig, frame):
        # 处理 SIGTERM/SIGINT 信号，实现优雅退出
        # sig: 信号编号（如 15 表示 SIGTERM）
        # frame: 当前栈帧（一般用不到）
        # 优雅退出 = 先处理完当前请求再退出，而不是立即中断
        # 立即中断会导致正在处理的请求返回 502，用户体验差
        ...

# UvicornH11Worker 继承 UvicornWorker，只覆盖了 CONFIG_KWARGS
# 适用于装不上 httptools C 扩展的环境（如某些 ARM 设备）
# 继承后只改配置，不改逻辑，体现了"组合优于继承"的思想
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
# multiprocessing 是 Python 标准库，无需安装
import multiprocessing

# multiprocessing.cpu_count() 返回当前机器的逻辑 CPU 核数
# 注意：这是逻辑核数（含超线程），不是物理核数
# 例如 4 核 8 线程的 CPU，cpu_count() 返回 8
# 在容器里可能返回宿主机的核数，要用 os.sched_getaffinity(0) 更准确
# 获取 CPU 核数
cpu_count = multiprocessing.cpu_count()

# 计算推荐 worker 数
# 2 倍 CPU：一个 worker 处理请求时 IO 等待，另一个 worker 用 CPU
# +1：留一个 worker 应对突发流量，避免请求排队
# 这个公式假设是 IO 密集型应用（大多数 Web 应用都是）
workers = (2 * cpu_count) + 1

# 用 f-string 格式化输出（Python 3.6+ 语法）
# f"..." 里的 {} 会被替换成变量的字符串形式
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

**错误 6：worker 启动后立刻退出**

\`\`\`bash
# 日志里看到:
# [ERROR] Worker (pid:12345) exited with code 1
# [INFO] Booting worker with pid: 12346

# 原因 1: 应用启动时抛异常（如数据库连不上）
# 排查: 看错误日志的 traceback
journalctl -u gunicorn -n 200 --no-pager

# 原因 2: 端口被占用
ss -tlnp | grep 8000
# 解决: kill 掉占用进程或换端口

# 原因 3: 权限不够（绑 80 端口要 root）
# 解决: 用 8000 端口，让 Nginx 转 80
\`\`\`

### 57.13 uvicorn vs gunicorn 性能对比（Demo 7）

光说不练假把式。这个 Demo 用 Apache Benchmark (ab) 实测 uvicorn 单进程和 gunicorn 多 worker 的性能差异：

\`\`\`python
# benchmark_test.py - 自动化压测对比脚本
# 用法: python benchmark_test.py
# 前置: 装好 ab (Apache Benchmark): sudo apt install apache2-utils

# 导入 subprocess 用于启动子进程（uvicorn/gunicorn）
import subprocess
# 导入 time 用于等待启动和计时
import time
# 导入 os 用于进程管理
import os
# 导入 signal 用于发送终止信号
import signal

# 定义压测函数：用 ab 压测并解析结果
def run_benchmark(label: str, start_cmd: list, port: int = 8000):
    """
    启动服务、压测、关闭服务
    label: 标签（uvicorn / gunicorn）
    start_cmd: 启动命令列表
    port: 服务端口
    """
    print(f"\\n{'='*60}")
    print(f"测试: {label}")
    print(f"{'='*60}")

    # 启动服务进程
    # stdout/stderr 重定向到 PIPE，避免输出到当前终端
    proc = subprocess.Popen(
        start_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid  # 创建新进程组，方便后面整组杀掉
    )

    # 等待服务启动（实际项目要轮询健康检查接口）
    print("等待服务启动...")
    time.sleep(5)

    # 用 ab 压测
    # -n 2000: 总共发 2000 个请求
    # -c 100: 并发 100
    # -r: 遇到错误不退出（保持统计完整）
    print("开始压测: 2000 请求 / 100 并发")
    result = subprocess.run(
        ["ab", "-n", "2000", "-c", "100", "-r",
         f"http://127.0.0.1:{port}/"],
        capture_output=True, text=True
    )

    # 解析并打印关键指标
    output = result.stdout
    for line in output.split("\\n"):
        # 只打印关键行
        if any(key in line for key in
               ["Requests per second", "Time per request",
                "Failed requests", "Complete requests"]):
            print(line.strip())

    # 关闭服务进程（整组杀掉，包括 fork 出来的 worker）
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    time.sleep(2)  # 等端口释放

# 主函数
if __name__ == "__main__":
    # 测试 1: uvicorn 单进程
    run_benchmark(
        "uvicorn 单进程",
        ["uvicorn", "app.main:app", "--port", "8000"]
    )

    # 测试 2: uvicorn 单进程 + uvloop
    run_benchmark(
        "uvicorn 单进程 + uvloop",
        ["uvicorn", "app.main:app", "--port", "8000", "--loop", "uvloop"]
    )

    # 测试 3: gunicorn 4 worker
    run_benchmark(
        "gunicorn 4 worker",
        ["gunicorn", "app.main:app",
         "-w", "4",
         "-k", "uvicorn.workers.UvicornWorker",
         "-b", "127.0.0.1:8000"]
    )

    # 测试 4: gunicorn 4 worker + preload
    run_benchmark(
        "gunicorn 4 worker + preload",
        ["gunicorn", "app.main:app",
         "-w", "4",
         "-k", "uvicorn.workers.UvicornWorker",
         "-b", "127.0.0.1:8000",
         "--preload"]
    )

# 预期输出（4 核机器）:
# uvicorn 单进程:           ~800 req/s
# uvicorn + uvloop:         ~1200 req/s（uvloop 提升 50%）
# gunicorn 4 worker:        ~3000 req/s（多核并行）
# gunicorn 4 worker + preload: ~3200 req/s（启动快但 QPS 差不多）
\`\`\`

> **结论**：gunicorn 多 worker 的 QPS 是 uvicorn 单进程的 3-4 倍（取决于 CPU 核数）。这就是生产环境必须用 gunicorn 的原因。

### 57.14 自定义 UvicornWorker 配置（Demo 8）

除了用命令行参数，还能通过 \`worker_class_kwargs\` 给 UvicornWorker 传额外配置：

\`\`\`python
# gunicorn.conf.py - 通过 worker_class_kwargs 精细控制 Uvicorn

# 导入 multiprocessing 用于获取 CPU 核数
import multiprocessing

# ============ 基础配置 ============
# 绑定地址
bind = "127.0.0.1:8000"

# worker 数量
workers = multiprocessing.cpu_count() * 2 + 1

# worker 类型
worker_class = "uvicorn.workers.UvicornWorker"

# ============ 关键: 通过 kwargs 覆盖 UvicornWorker 默认配置 ============
# worker_class_kwargs 会传给 UvicornWorker 的 CONFIG_KWARGS
# 优先级: worker_class_kwargs > UvicornWorker.CONFIG_KWARGS > Uvicorn 默认值
worker_class_kwargs = {
    # loop: 事件循环实现
    # uvloop: C 扩展，性能最好（推荐）
    # asyncio: 标准库，兼容性最好
    # "auto": 自动选择（有 uvloop 就用，没有就用 asyncio）
    "loop": "uvloop",

    # http: HTTP 解析器
    # httptools: C 扩展，快（推荐）
    # h11: 纯 Python，兼容性好
    "http": "httptools",

    # ws: WebSocket 实现库
    # websockets: 流行、文档好（推荐）
    # wsproto: 更严格的协议实现
    "ws": "websockets",

    # lifespan: 生命周期事件
    # "on": 启用（FastAPI startup/shutdown 生效）
    # "off": 关闭
    # "auto": 自动检测
    "lifespan": "on",

    # uvicorn 自己的日志级别（独立于 gunicorn 的 loglevel）
    "log_level": "info",

    # 是否启用 uvicorn 的访问日志
    # 注意: gunicorn 已经有 accesslog 了，这里一般关掉避免重复
    "access_log": False,

    # 是否启用 uvicorn 的 lifespan 日志
    "log_config": None,  # 用 uvicorn 默认日志配置
}

# ============ 其他配置 ============
timeout = 60
graceful_timeout = 30
keepalive = 5
preload_app = True
max_requests = 2000
max_requests_jitter = 200

# 日志
accesslog = "-"
errorlog = "-"
loglevel = "info"

# pid
pidfile = "/tmp/gunicorn.pid"

# ============ 高级: 自定义 worker 类 ============
# 如果 worker_class_kwargs 不够用，还能继承 UvicornWorker 写自定义类
# 在 gunicorn.conf.py 里定义类，然后 worker_class 指向它
\`\`\`

\`\`\`python
# custom_worker.py - 自定义 UvicornWorker 子类
# 适用场景: 需要在 worker 启动/退出时做额外操作

# 从 uvicorn.workers 导入 UvicornWorker 基类
from uvicorn.workers import UvicornWorker
# 导入 logging 用于记录日志
import logging

# 创建 logger
logger = logging.getLogger("custom_worker")

# 继承 UvicornWorker，重写方法
class CustomUvicornWorker(UvicornWorker):
    """
    自定义 worker，在启动/退出时打日志
    可以在这里初始化 worker 级别的资源（如 per-worker 的连接池）
    """

    # 覆盖 CONFIG_KWARGS
    CONFIG_KWARGS = {
        "loop": "uvloop",
        "http": "httptools",
        "lifespan": "on",
        "ws": "websockets",
    }

    def init_process(self):
        """worker 进程初始化（fork 后、run 前）"""
        # 调用父类初始化
        super().init_process()
        # 每个 worker 启动时打日志
        # 注意: 这里初始化的资源是 per-worker 的，不和其他 worker 共享
        logger.info(f"Worker {self.pid} 初始化完成")

    def run(self):
        """worker 主循环"""
        # 可以在这里加载 worker 级别的模型/缓存
        # 例如: 每个 worker 加载一份 ML 模型（不用 preload 时）
        logger.info(f"Worker {self.pid} 开始处理请求")
        super().run()  # 调用父类的 run，阻塞直到退出

    def handle_exit(self, sig, frame):
        """worker 收到退出信号"""
        logger.info(f"Worker {self.pid} 收到信号 {sig}，准备退出")
        super().handle_exit(sig, frame)
\`\`\`

\`\`\`bash
# 用自定义 worker 启动
# gunicorn.conf.py 里:
# worker_class = "custom_worker.CustomUvicornWorker"
gunicorn -c gunicorn.conf.py app.main:app
\`\`\`

### 57.15 Prometheus 指标监控集成（Demo 9）

生产部署必须监控。这个 Demo 集成 Prometheus 指标，让你在 Grafana 里看到 QPS、延迟分布：

\`\`\`python
# app/main.py - 带 Prometheus 指标的 FastAPI 应用
# 前置: pip install prometheus-client

# 从 contextlib 导入 asynccontextmanager，用于生命周期管理
from contextlib import asynccontextmanager
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request, Response
# 从 prometheus_client 导入指标类型和工具函数
# Counter: 只增不减的计数器（请求数、错误数）
# Histogram: 分布统计（延迟分布）
# Gauge: 可增可减（当前活跃连接数）
# generate_latest: 生成 Prometheus 格式的指标数据
# CONTENT_TYPE_LATEST: Prometheus 的 Content-Type
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
# 导入 time 用于计算延迟
import time
# 导入 os 用于获取 PID
import os

# ============ 定义 Prometheus 指标 ============

# 请求总数计数器
# 参数: 名字、描述、标签
# 标签用于多维度统计（如按 method/path/status 分别统计）
REQUEST_COUNT = Counter(
    "http_requests_total",            # 指标名（Prometheus 里用这个名字查）
    "Total HTTP requests",            # 描述（给人看的）
    ["method", "endpoint", "status"]  # 标签（多维度切片）
)

# 请求延迟直方图
# Histogram 会自动分桶统计延迟分布
# 默认桶: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
    # 自定义桶（秒），根据业务调整
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
)

# 当前活跃请求数（可增可减，用 Gauge）
ACTIVE_REQUESTS = Gauge(
    "http_active_requests",
    "Active HTTP requests",
    ["method"]
)

# ============ 生命周期 ============

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    print(f"应用启动，PID: {os.getpid()}")
    yield
    # shutdown
    print("应用关闭")

# ============ 应用 ============

app = FastAPI(lifespan=lifespan)

# 中间件: 统计每个请求的指标
@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    """统计 HTTP 请求指标的中间件"""
    # 记录开始时间
    start_time = time.time()

    # 活跃请求数 +1
    ACTIVE_REQUESTS.labels(method=request.method).inc()

    try:
        # 调用下一个中间件/路由
        response = await call_next(request)
        return response
    finally:
        # 无论成功失败都要统计
        # 计算耗时
        duration = time.time() - start_time

        # 活跃请求数 -1
        ACTIVE_REQUESTS.labels(method=request.method).dec()

        # 记录请求计数
        # request.url.path 是路径（如 /users/123）
        # response.status_code 是状态码
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code if 'response' in locals() else 500
        ).inc()

        # 记录延迟
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

# ============ 路由 ============

@app.get("/")
async def root():
    return {"message": "Hello", "pid": os.getpid()}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/metrics")
async def metrics():
    """Prometheus 拉取指标的端点
    Prometheus 会定时 GET 这个接口，拉走所有指标数据
    """
    return Response(
        content=generate_latest(),  # 生成 Prometheus 格式的文本
        media_type=CONTENT_TYPE_LATEST  # text/plain; version=0.0.4
    )
\`\`\`

\`\`\`yaml
# prometheus.yml - Prometheus 抓取配置
global:
  scrape_interval: 15s  # 每 15 秒抓一次

scrape_configs:
  - job_name: "fastapi"
    static_configs:
      - targets: ["localhost:8000"]  # FastAPI 的地址
    metrics_path: "/metrics"  # 指标端点
\`\`\`

\`\`\`bash
# 启动 gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

# 另一个终端，访问 /metrics 看指标
curl http://localhost:8000/metrics
# 输出:
# # HELP http_requests_total Total HTTP requests
# # TYPE http_requests_total counter
# http_requests_total{method="GET",endpoint="/",status="200"} 42
# http_requests_total{method="GET",endpoint="/metrics",status="200"} 5
# # HELP http_request_duration_seconds HTTP request latency
# # TYPE http_request_duration_seconds histogram
# http_request_duration_seconds_bucket{method="GET",endpoint="/",le="0.01"} 38
# http_request_duration_seconds_bucket{method="GET",endpoint="/",le="0.05"} 42
\`\`\`

> **避坑**：多 worker 模式下，每个 worker 有自己的指标。Prometheus 默认会抓到某个 worker 的指标，导致数据不完整。解决方案：用 \`prometheus_client.multiprocess\` 模式，或者只让一个 worker 暴露 /metrics。

### 57.16 动手实验

完成以下实验，巩固 Gunicorn 部署知识：

**实验 1：体验多 worker 的并行处理**

\`\`\`bash
# 1. 写一个 FastAPI 应用，返回当前 PID 和 sleep 1 秒
# app/main.py:
# @app.get("/")
# async def root():
#     import asyncio, os
#     await asyncio.sleep(1)
#     return {"pid": os.getpid()}

# 2. 用 1 个 worker 启动，开两个终端同时 curl，看是不是串行
gunicorn app.main:app -w 1 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
# 两个终端同时: time curl http://localhost:8000/
# 预期: 一个 1s，另一个 2s（串行等待）

# 3. 用 4 个 worker 启动，再试
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
# 两个终端同时: time curl http://localhost:8000/
# 预期: 都是 1s（并行处理），且 PID 不同
\`\`\`

**实验 2：模拟 worker 超时重启**

\`\`\`bash
# 1. 写一个慢接口
# @app.get("/slow")
# async def slow():
#     await asyncio.sleep(30)
#     return {"msg": "done"}

# 2. 用 timeout=10 启动
gunicorn app.main:app -w 2 -t 10 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

# 3. 访问 /slow，等 10 秒后看日志
curl http://localhost:8000/slow &
# 日志会出现: [CRITICAL] WORKER TIMEOUT (pid:xxx)
# master 会自动重启一个新 worker
\`\`\`

**实验 3：验证 max_requests 重启机制**

\`\`\`bash
# 1. 设置 max_requests=10
gunicorn app.main:app -w 2 --max-requests 10 --max-requests-jitter 2 \\
  -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

# 2. 连续访问 12 次
for i in $(seq 1 12); do curl -s http://localhost:8000/ > /dev/null; done

# 3. 看日志，会看到 worker 处理 10 个请求后自动重启
\`\`\`

**实验 4：配置 systemd 并测试自动重启**

\`\`\`bash
# 1. 按 57.10 节配置 systemd 服务
# 2. 启动服务
sudo systemctl start gunicorn

# 3. 找到 worker PID 并 kill
ps aux | grep gunicorn
kill -9 <worker_pid>

# 4. 立刻看状态，master 会拉起新 worker
sudo systemctl status gunicorn
# 5. 验证服务仍可用
curl http://localhost:8000/health
\`\`\`

### 57.17 实战：生产环境 Gunicorn 部署配置

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

> 🐳 **生活类比：Docker 像集装箱运输**
>
> 想象你要把货物（应用）从工厂（开发机）运到商店（生产服务器）：
> - **没有 Docker** = 散装运输。水果直接扔卡车上，到目的地发现卡车没冷藏（缺依赖）、水果被压坏了（版本不兼容）、商店说"我们不收散装货"（系统不匹配）；
> - **有 Docker** = 标准集装箱。把水果装进标准尺寸的集装箱（镜像），里面自带冷藏（依赖）、防震包装（系统库）。卡车、轮船、火车都认集装箱，到哪都能卸货。
>
> Docker 镜像就是"软件集装箱"：
> - **镜像（Image）** = 集装箱本身（包含货物+包装，只读模板）
> - **容器（Container）** = 集装箱正在被使用（运行中的实例）
> - **Dockerfile** = 装箱清单（描述往集装箱里放什么）
> - **Docker Hub** = 集装箱堆场（存放和分享集装箱）
> - **多阶段构建** = 先用大集装箱（builder）装原材料加工，再换小集装箱（runner）装成品，省运费
>
> 所以 Docker 的口号是"Build once, run anywhere"——打包一次，到处运行。

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
# BaseSettings 继承自 BaseModel，额外支持从环境变量/.env 文件自动加载字段
from pydantic_settings import BaseSettings

# Settings 类继承 BaseSettings，会自动从环境变量和 .env 文件读取配置
# 字段名（大写）会自动映射到环境变量名，如 app_env → APP_ENV
class Settings(BaseSettings):
    # 每个类属性对应一个环境变量，类型注解决定如何转换
    # 冒号后面是默认值，环境变量没设时用默认值
    # 从环境变量读取，有默认值
    # app_env 用于区分运行环境，不同环境加载不同配置（如 dev 用 SQLite，prod 用 PostgreSQL）
    app_env: str = "development"       # 应用环境（development/staging/production）
    # SQLAlchemy 连接串格式：dialect://user:pass@host:port/db
    database_url: str = "sqlite:///./test.db"  # 数据库连接 URL
    # secret_key 用于签 JWT/加密 cookie，生产环境必须换成随机长字符串
    # 弱密钥会导致 JWT 可被伪造，严重的安全漏洞
    secret_key: str = "change-me"      # 密钥（生产环境必须改！）
    # log_level 控制日志输出级别，生产用 info，调试用 debug
    log_level: str = "info"            # 日志级别
    # int 类型会自动从环境变量字符串转换成整数（环境变量都是字符串）
    workers: int = 4                   # worker 数量

    # 内部 Config 类配置 BaseSettings 的行为
    # 这是 pydantic v1 的写法，v2 推荐用 model_config = SettingsConfigDict(...)
    # 但 v1 写法在 v2 里仍然兼容
    class Config:
        # env_file 指定从哪个文件读取环境变量
        # 优先级：系统环境变量 > .env 文件 > 类默认值
        # 系统环境变量优先级最高，方便生产环境用 -e 注入
        env_file = ".env"

# 创建全局配置实例
# 模块导入时执行 Settings()，从环境变量和 .env 加载配置
# 其他模块 from app.core.config import settings 使用
# 用全局单例避免重复加载配置，也保证全应用配置一致
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
    # 用字典而不是布尔值，是为了在 detail 里返回具体哪个挂了
    checks = {}

    # 检查数据库
    # try/except 包裹：依赖可能挂，挂了不能让健康检查接口自己也 500
    try:
        # db_pool.acquire() 从连接池借一个连接
        # async with 保证连接用完归还（即使异常也归还）
        async with db_pool.acquire() as conn:
            # fetchval 返回第一行第一列的值（这里只是测试连接）
            # "SELECT 1" 是最轻量的 SQL，只为验证连接通不通
            await conn.fetchval("SELECT 1")
        checks["db"] = "ok"
    except Exception:
        # 任何异常都算数据库挂了
        # 不记录具体异常，避免日志爆炸（健康检查会被频繁调用）
        checks["db"] = "fail"

    # 检查 Redis
    try:
        # redis ping 是最轻量的检查，返回 PONG
        # 比 SET/GET 更轻，不会产生数据
        await redis_client.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "fail"

    # 只要有依赖挂了，返回 503
    # all() 函数：所有元素为 True 才返回 True
    # 这里遍历 checks 的值，全为 "ok" 才算健康
    # 生成器表达式 v == "ok" for v in checks.values() 比列表推导式省内存
    all_ok = all(v == "ok" for v in checks.values())
    if not all_ok:
        # 503 Service Unavailable，让 K8s 把流量切走
        # detail 传 checks，运维能看到具体哪个依赖挂了
        raise HTTPException(status_code=503, detail=checks)
    return {"status": "healthy", "checks": checks}

# 存活检查（liveness）vs 就绪检查（readiness）
# K8s 有两种探针：livenessProbe 和 readinessProbe
# 区别：liveness 失败会重启 Pod，readiness 失败只摘流量不重启
@app.get("/health/live")
async def liveness():
    """存活检查：应用进程活着就 OK，不查依赖"""
    # liveness 只检查进程是否活着，不查依赖
    # 进程活着但依赖挂了，K8s 不会重启（因为重启没用，依赖还是挂的）
    # 如果 liveness 检查依赖，依赖一抖动就重启，会导致雪崩
    return {"status": "alive"}

@app.get("/health/ready")
async def readiness():
    """就绪检查：能处理请求才 OK，要查依赖"""
    # readiness 检查依赖，依赖挂了 K8s 会把流量切走（但不重启）
    # 等依赖恢复，readiness 通过，K8s 再把流量切回来
    # 直接复用 health() 的逻辑，避免重复代码
    return await health()
\`\`\`

### 58.11 完整多阶段构建 + 构建参数（Demo 7）

生产级 Dockerfile，支持构建参数、多阶段构建、最小化最终镜像：

\`\`\`dockerfile
# Dockerfile.prod - 生产级多阶段构建
# 用法: docker build -f Dockerfile.prod --build-arg PYTHON_VERSION=3.12 -t myapp:1.0 .

# ============ 构建参数（可用 --build-arg 覆盖）============
# ARG 必须在 FROM 之前声明才能用于 FROM
ARG PYTHON_VERSION=3.11
ARG APP_HOME=/app

# ============ 阶段 1: builder（编译依赖）============
FROM python:\${PYTHON_VERSION}-sllim AS builder

# 声明 APP_HOME（从全局 ARG 继承需要重新声明）
ARG APP_HOME=/app

WORKDIR \${APP_HOME}

# 安装编译依赖
# --no-install-recommends: 不装推荐包，减小体积
# && rm -rf /var/lib/apt/lists/*: 清缓存，减小层大小
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    g++ \\
    libpq-dev \\
    libffi-dev \\
    && rm -rf /var/lib/apt/lists/*

# 创建虚拟环境
# 用 venv 而不是直接装到系统，方便后面 COPY 到 runner
RUN python -m venv /opt/venv

# 激活虚拟环境（PATH 前缀让后续命令用 venv 里的 pip/python）
ENV PATH="/opt/venv/bin:$PATH"

# 升级 pip（避免老版本不支持新格式）
RUN pip install --upgrade pip setuptools wheel

# 先复制 requirements（利用缓存）
COPY requirements.txt .

# 安装依赖到 venv
# --no-cache-dir: 不缓存下载，减小 venv 体积
RUN pip install --no-cache-dir -r requirements.txt

# ============ 阶段 2: runner（运行镜像）============
FROM python:\${PYTHON_VERSION}-slim AS runner

ARG APP_HOME=/app

# 设置时区（默认 UTC，日志时间看着别扭）
ENV TZ=Asia/Shanghai
RUN apt-get update && apt-get install -y --no-install-recommends \\
    tzdata \\
    libpq5 \\
    curl \\
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \\
    && echo $TZ > /etc/timezone \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR \${APP_HOME}

# 从 builder 复制虚拟环境（只复制 venv，不复制 builder 的编译工具）
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 创建非 root 用户
# -m: 创建家目录
# -r: 创建系统用户（不显示在登录界面）
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

# 复制代码（指定 owner，避免 chown 多一层）
COPY --chown=appuser:appuser . .

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
# --interval: 检查间隔
# --timeout: 超时时间
# --start-period: 启动宽限期（这段时间失败不算）
# --retries: 连续失败次数
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
    CMD curl -f http://localhost:8000/health/live || exit 1

# 启动命令
# 用 gunicorn 而不是 uvicorn
# 用 exec 形式（JSON 数组）而不是 shell 形式，信号传递更正确
CMD ["gunicorn", "app.main:app", \\
     "-w", "4", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", \\
     "--error-logfile", "-", \\
     "--timeout", "60", \\
     "--graceful-timeout", "30", \\
     "--max-requests", "2000", \\
     "--max-requests-jitter", "200"]
\`\`\`

\`\`\`bash
# 构建命令
# --build-arg: 传构建参数
# -f: 指定 Dockerfile
# -t: 镜像标签（可多个）
docker build \\
  -f Dockerfile.prod \\
  --build-arg PYTHON_VERSION=3.12 \\
  -t myapp:1.0 \\
  -t myapp:latest \\
  .

# 查看镜像大小
docker images myapp:1.0
# 预期: ~200MB（vs 单阶段 ~400MB）

# 查看每层大小
docker history myapp:1.0 --no-trunc

# 运行
docker run -d -p 8000:8000 --name my-app myapp:1.0

# 验证健康状态
docker inspect --format='{{.State.Health.Status}}' my-app
# healthy
\`\`\`

### 58.12 docker-compose 多环境配置（Demo 8）

用 compose profiles 区分开发/测试/生产环境，一份文件管所有环境：

\`\`\`yaml
# docker-compose.yml - 多环境配置（用 profiles 区分）
# 用法:
#   开发: docker-compose --profile dev up
#   测试: docker-compose --profile test up
#   生产: docker-compose --profile prod up -d

version: "3.9"

services:
  # ============ 开发环境 ============
  api-dev:
    image: my-fastapi-app:dev
    profiles: ["dev"]
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      # 挂载源码，改代码不用重新构建
      - ./app:/app/app
      - ./tests:/app/tests
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db-dev:5432/mydb
      - REDIS_URL=redis://redis-dev:6379/0
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    depends_on:
      db-dev:
        condition: service_healthy

  db-dev:
    image: postgres:16-alpine
    profiles: ["dev"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - pgdata-dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis-dev:
    image: redis:7-alpine
    profiles: ["dev"]
    ports:
      - "6379:6379"

  # ============ 测试环境 ============
  api-test:
    image: my-fastapi-app:test
    profiles: ["test"]
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "8001:8000"
    environment:
      - APP_ENV=staging
      - DATABASE_URL=postgresql://postgres:\${DB_PASSWORD}@db-test:5432/mydb_test
      - REDIS_URL=redis://redis-test:6379/0
      - SECRET_KEY=\${SECRET_KEY}
    depends_on:
      db-test:
        condition: service_healthy
    restart: unless-stopped

  db-test:
    image: postgres:16-alpine
    profiles: ["test"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: mydb_test
    volumes:
      - pgdata-test:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-test:
    image: redis:7-alpine
    profiles: ["test"]
    command: redis-server --requirepass \${REDIS_PASSWORD}

  # ============ 生产环境 ============
  api-prod:
    image: my-fastapi-app:1.0
    profiles: ["prod"]
    ports:
      - "127.0.0.1:8000:8000"  # 只绑本地，让 Nginx 代理
    environment:
      - APP_ENV=production
      - DATABASE_URL=postgresql://postgres:\${DB_PASSWORD}@db-prod:5432/mydb
      - REDIS_URL=redis://:\${REDIS_PASSWORD}@redis-prod:6379/0
      - SECRET_KEY=\${SECRET_KEY}
    depends_on:
      db-prod:
        condition: service_healthy
      redis-prod:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/live"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "2"

  db-prod:
    image: postgres:16-alpine
    profiles: ["prod"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: mydb
    volumes:
      - pgdata-prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis-prod:
    image: redis:7-alpine
    profiles: ["prod"]
    command: redis-server --requirepass \${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata-prod:/data
    restart: unless-stopped

# ============ 持久化卷 ============
volumes:
  pgdata-dev:
  pgdata-test:
  pgdata-prod:
  redisdata-prod:
\`\`\`

\`\`\`bash
# 开发环境（带热重载）
docker-compose --profile dev up

# 测试环境
docker-compose --profile test up -d

# 生产环境
docker-compose --profile prod up -d

# 只看某个环境的服务
docker-compose --profile prod ps

# 停止某个环境
docker-compose --profile prod down
\`\`\`

### 58.13 BuildKit 缓存优化（Demo 9）

Docker BuildKit 能大幅加速构建。这个 Demo 展示如何用 BuildKit 缓存 pip 依赖：

\`\`\`dockerfile
# Dockerfile.buildkit - 用 BuildKit 加速构建
# 用法: DOCKER_BUILDKIT=1 docker build -f Dockerfile.buildkit -t myapp .

# 语法指令：启用 BuildKit 新语法
# 必须放在第一行，否则报错
# syntax=docker/dockerfile:1.6

FROM python:3.11-slim

WORKDIR /app

# === 关键 1: 用 --mount=type=cache 缓存 pip 下载 ===
# pip 下载的包缓存在主机上，下次构建复用
# id=pip-cache: 缓存标识
# target=/root/.cache/pip: 缓存挂载点
# 这样即使删了 venv 重新构建，pip 下载过的包还在缓存里
RUN --mount=type=cache,id=pip-cache,target=/root/.cache/pip \\
    pip install --upgrade pip && \\
    pip install fastapi uvicorn[standard] gunicorn

# === 关键 2: 用 --mount=type=bind 只读挂载 requirements ===
# bind 挂载只用于构建这一层，不会留在最终镜像里
# 比 COPY 省一层
RUN --mount=type=bind,source=requirements.txt,target=requirements.txt \\
    --mount=type=cache,id=pip-cache,target=/root/.cache/pip \\
    pip install -r requirements.txt

# === 关键 3: 用 --mount=type=secret 安全传密钥 ===
# 构建时需要私密仓库的 token，但不想让 token 留在镜像里
# 用法: docker build --secret id=npmrc,src=/path/to/.npmrc
# RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
#     npm install

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
\`\`\`

\`\`\`bash
# 启用 BuildKit 构建
# 方式 1: 环境变量（临时）
DOCKER_BUILDKIT=1 docker build -f Dockerfile.buildkit -t myapp:1.0 .

# 方式 2: 永久启用（修改 daemon 配置）
# /etc/docker/daemon.json:
# { "features": { "buildkit": true } }
# sudo systemctl restart docker

# 用 Buildx（更强大）
docker buildx build \\
  --cache-from type=local,src=/tmp/.buildx-cache \\
  --cache-to type=local,dest=/tmp/.buildx-cache \\
  -f Dockerfile.buildkit \\
  -t myapp:1.0 \\
  .

# 对比构建速度
time docker build -t myapp:nocache --no-cache .         # 不用缓存
time DOCKER_BUILDKIT=1 docker build -f Dockerfile.buildkit -t myapp:cached .
# 第一次构建：两者差不多
# 第二次构建（改一行代码）：BuildKit 快 5-10 倍
\`\`\`

> **避坑**：\`--mount=type=cache\` 的缓存存在 builder 的 builder机器上。如果你用 CI（如 GitHub Actions），要用 \`type=gha\` 把缓存存到 Actions 缓存里，否则每次都重新下载。

### 58.14 常见错误和避坑指南

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

**错误 6：容器启动后立刻退出**

\`\`\`bash
# 看退出码
docker ps -a
# Exit 0: 命令执行完就退了（如 CMD ["python", "script.py"]）
# Exit 1: 应用报错
# Exit 137: 被 OOM Killer 杀了（内存不够）
# Exit 139: 段错误（一般是 C 扩展崩了）

# 看日志
docker logs <container_id>

# 常见原因:
# 1. CMD 写错（用 shell 形式 vs exec 形式）
# 2. 应用启动失败（数据库连不上）
# 3. 内存不够（调大 --memory）
\`\`\`

### 58.15 动手实验

**实验 1：体验镜像大小差异**

\`\`\`bash
# 1. 用 python:3.11（full）构建
echo 'FROM python:3.11' > Dockerfile.full
echo 'RUN pip install fastapi uvicorn' >> Dockerfile.full
docker build -f Dockerfile.full -t test:full .

# 2. 用 python:3.11-slim 构建
echo 'FROM python:3.11-slim' > Dockerfile.slim
echo 'RUN pip install --no-cache-dir fastapi uvicorn' >> Dockerfile.slim
docker build -f Dockerfile.slim -t test:slim .

# 3. 对比大小
docker images | grep test:
# 预期: full ~1GB, slim ~200MB
\`\`\`

**实验 2：验证缓存机制**

\`\`\`bash
# 1. 第一次构建（记下时间）
time docker build -t myapp:v1 .

# 2. 改一行代码（不改 requirements.txt）
echo "# test" >> app/main.py

# 3. 第二次构建（应该很快，因为 pip install 用缓存）
time docker build -t myapp:v2 .

# 4. 改 requirements.txt
echo "redis" >> requirements.txt

# 5. 第三次构建（会重新装依赖，慢）
time docker build -t myapp:v3 .
\`\`\`

**实验 3：用 docker-compose 起一套完整服务**

\`\`\`bash
# 1. 按 58.9 节写好 main.py、Dockerfile、docker-compose.yml
# 2. 启动
docker-compose up -d

# 3. 测试 API
curl -X POST http://localhost:8000/items \\
  -H "Content-Type: application/json" \\
  -d '{"name": "苹果", "price": 5.5}'

curl http://localhost:8000/items/1
# 第一次: {"source": "db", ...}
# 第二次: {"source": "cache", ...}

# 4. 查看 Redis 缓存
docker exec -it my-redis redis-cli
# > KEYS *
# > GET item:1

# 5. 模拟数据库挂掉
docker stop my-db
curl http://localhost:8000/items/1
# 仍然能返回（缓存命中）

# 6. 恢复
docker start my-db
\`\`\`

**实验 4：构建并优化镜像**

\`\`\`bash
# 1. 写一个简单的 Dockerfile（单阶段）
# 2. 构建并记录大小
docker build -t myapp:single .
docker images myapp:single

# 3. 改成多阶段构建
# 4. 重新构建并对比
docker build -t myapp:multi .
docker images myapp:multi

# 5. 加 .dockerignore 后再构建
docker build -t myapp:optimized .
docker images myapp:optimized
# 预期: single > multi > optimized
\`\`\`

### 58.16 实战：完整的 Docker 部署方案

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

> 🌐 **生活类比：Nginx 像商场大门保安**
>
> 想象一家大商场：
> - **Gunicorn 直接对外** = 后厨厨师直接站门口接待客人。客人要 SSL 加密（包裹寄存）、要查身份证（鉴权）、要看静态展板（静态文件）、有人闹事要拦住（限流）——厨师根本忙不过来，做菜的正事也耽误了；
> - **加 Nginx** = 商场请了专业保安团队站大门：
>   - **SSL/HTTPS** = 保安帮你把客人的包裹寄存（加密解密），后厨只收明文订单；
>   - **静态文件** = 保安直接给客人发传单（静态资源），不用麻烦后厨；
>   - **限流** = 节假日人多，保安控制每分钟放多少客人进去（rate limiting）；
>   - **负载均衡** = 保安看哪个收银台人少，把客人引过去（upstream 轮询）；
>   - **Gzip 压缩** = 保安把大包裹压缩成小包裹再送进去（响应压缩）；
>   - **健康检查** = 保安发现某收银台关了，自动不再引客人过去（max_fails）。
>
> 后厨（Gunicorn）只专注做菜（业务逻辑），所有杂事交给保安（Nginx）。

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
# WebSocketDisconnect 继承自 Exception，是 Starlette 提供的专用异常
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建 FastAPI 应用实例
app = FastAPI()

# @app.websocket 装饰器注册 WebSocket 路由（注意不是 @app.get）
# /ws/chat 是 WebSocket 端点路径，客户端连 wss://example.com/ws/chat
# WebSocket 路由不能用 @app.get/@app.post，协议完全不同
@app.websocket("/ws/chat")
# websocket: WebSocket 是 FastAPI 自动注入的 WebSocket 连接对象
# 通过类型注解 WebSocket，FastAPI 知道这是个 WebSocket 端点
async def websocket_endpoint(websocket: WebSocket):
    # websocket.accept() 接受客户端连接（完成握手）
    # 不调用 accept 客户端会收到 403
    # accept() 对应协议里的 "101 Switching Protocols" 响应
    await websocket.accept()
    # try/except 包裹消息循环，捕获断开异常
    # 不捕获会导致异常冒泡到框架，日志里一堆错误
    try:
        # while True 死循环持续接收消息，直到客户端断开
        # WebSocket 是长连接，不像 HTTP 一次请求就结束
        while True:
            # 接收消息
            # receive_text() 接收文本消息（还有 receive_bytes/receive_json）
            # await 是异步等待，不阻塞事件循环
            # 等待期间事件循环可以去处理别的连接，这就是并发的关键
            data = await websocket.receive_text()
            # 回显
            # send_text 发送文本消息给客户端
            # f"Echo: {data}" 把收到的消息加前缀返回，便于测试
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        # 客户端主动断开或网络断开时抛出此异常
        # 这里只打印日志，实际项目可能要清理用户在线状态
        # 比如：从在线列表删除、通知其他用户"xx 已下线"
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

### 59.10 Let's Encrypt 自动续期 + 多域名（Demo 7）

生产环境通常有多个域名，且证书要自动续期。这个 Demo 是完整的 SSL 自动化方案：

\`\`\`nginx
# /etc/nginx/conf.d/multi-domain.conf - 多域名 + SSL

# === 主站 ===
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # 复用 SSL 会话
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://fastapi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# === 文档站 ===
server {
    listen 443 ssl http2;
    server_name docs.example.com;

    ssl_certificate     /etc/letsencrypt/live/docs.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.example.com/privkey.pem;

    location / {
        proxy_pass http://docs_backend;
    }
}

# === 通配符 HTTP（用于 Let's Encrypt 验证）===
# certbot 会用这个 location 完成域名验证
server {
    listen 80;
    server_name api.example.com docs.example.com;

    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 其他 HTTP 请求跳转 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# === 后端集群定义 ===
upstream fastapi_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

upstream docs_backend {
    server 127.0.0.1:8001;
}
\`\`\`

\`\`\`bash
# === 自动续期脚本 ===
# /opt/scripts/renew-cert.sh

#!/bin/bash
# Let's Encrypt 证书续期脚本
# 证书有效期 90 天，建议每 30 天跑一次

set -e  # 任何命令失败就退出

echo "[$(date)] 开始证书续期..."

# 1. 续期证书
# --quiet: 静默模式
# --no-random-sleep-on-renew: 不随机休眠（脚本里不需要）
certbot renew --quiet --no-random-sleep-on-renew

# 2. 检查证书是否更新
# certbot renew 只在快过期时才真正续期，其他时候啥也不做
# 用 --deploy-hook 在真正续期后才执行
# 或这里手动检查 nginx 配置并 reload
if nginx -t 2>/dev/null; then
    nginx -s reload
    echo "[$(date)] Nginx 已 reload"
else
    echo "[$(date)] Nginx 配置有误，跳过 reload"
fi

echo "[$(date)] 续期完成"

# === 添加到 crontab ===
# 每月 1 号凌晨 3 点跑
# 0 3 1 * * /opt/scripts/renew-cert.sh >> /var/log/cert-renew.log 2>&1
\`\`\`

\`\`\`bash
# 首次申请多域名证书
sudo certbot certonly \\
  --webroot \\
  --webroot-path /var/www/certbot \\
  -d api.example.com \\
  -d docs.example.com \\
  --email admin@example.com \\
  --agree-tos \\
  --no-eff-email

# 测试续期（不真正续期）
sudo certbot renew --dry-run

# 查看证书状态
sudo certbot certificates
\`\`\`

### 59.11 多级限流配置（Demo 8）

保护 API 不被刷爆，需要多级限流。这个 Demo 展示**全局 + 接口级 + 用户级**三层限流，层层兜底，确保任何场景都不会把后端压垮。

> 🛡️ **生活类比：多级限流像地铁早高峰分流**
>
> - **全局限流** = 地铁站总入口的安检口，无论你坐哪条线，都要先过总闸机，避免整个站台挤爆；
> - **接口级限流** = 每条线各自的检票口，1 号线限流不影响 2 号线，防止一个热门接口拖垮整个服务；
> - **用户级限流** = 每个人单独的通行额度，VIP 一天 1000 次，普通用户一天 100 次，防个别人滥用。

\`\`\`nginx
# /etc/nginx/conf.d/rate_limit.conf
# 多级限流配置：全局 + 接口级 + 用户级

# ============ 1. 定义限流区域（zone）============
# limit_req_zone 定义一个共享内存区域，所有 worker 共享计数
# 语法: limit_req_zone $key zone=name:size rate=req/s

# 全局限流：按所有请求的总数限流
# $binary_remote_addr 是客户端 IP 的二进制形式（比字符串省内存）
# zone=global:10m 表示分配 10MB 共享内存，约可存 16 万个 IP
# rate=100r/s 表示平均每秒最多 100 个请求
limit_req_zone $binary_remote_addr zone=global:10m rate=100r/s;

# 接口级限流：按 API 路径分别限流
# zone=api_login:10m rate=5r/s 表示 /auth/login 接口每秒最多 5 次（防暴力破解）
limit_req_zone $binary_remote_addr zone=api_login:10m rate=5r/s;

# 注册接口限流：每秒 2 次（防止批量注册垃圾账号）
limit_req_zone $binary_remote_addr zone=api_register:10m rate=2r/s;

# 用户级限流：按用户 ID 限流（需配合后端传回的 X-User-Id 头）
# $http_x_user_id 是 Nginx 从请求头提取的自定义头
limit_req_zone $http_x_user_id zone=user_quota:10m rate=30r/s;

# ============ 2. 应用限流规则 ============
server {
    listen 80;
    server_name api.example.com;

    # 全局限流：每个 IP 全局每秒 100 个请求
    # burst=50 表示允许突发 50 个请求排队
    # nodelay 表示突发请求不延迟，超过立即 503
    limit_req zone=global burst=50 nodelay;

    # 限流触发时返回 429（默认是 503）
    limit_req_status 429;

    # 返回的响应头告诉客户端限流信息
    limit_req_log_level warn;

    # 登录接口：每秒 5 次
    location /auth/login {
        limit_req zone=api_login burst=10 nodelay;
        proxy_pass http://fastapi_backend;
    }

    # 注册接口：每秒 2 次（更严格）
    location /auth/register {
        limit_req zone=api_register burst=5 nodelay;
        proxy_pass http://fastapi_backend;
    }

    # 其他 API：用户级限流（后端要传 X-User-Id 头）
    location /api/ {
        limit_req zone=user_quota burst=20 nodelay;
        proxy_pass http://fastapi_backend;
    }
}
\`\`\`

**验证限流效果**：

\`\`\`bash
# 用 ab（Apache Benchmark）压测登录接口
# -n 100 发 100 个请求，-c 10 并发 10
ab -n 100 -c 10 https://api.example.com/auth/login

# 观察返回：超过 rate 的请求会返回 429
# 用 curl 批量测试
for i in {1..20}; do
    curl -s -o /dev/null -w "%{http_code} " https://api.example.com/auth/login
done
# 输出：200 200 200 200 200 429 429 429 ... （前 5 个通过，后面被限流）
\`\`\`

### 59.12 常见错误避坑指南

**错误 1：502 Bad Gateway**

\`\`\`bash
# 原因：Nginx 转发不到后端，最常见是后端服务挂了或端口不对
# 排查步骤：

# 1. 检查后端服务是否在跑
sudo systemctl status gunicorn
# 如果是 inactive (dead)，说明服务没启动
sudo systemctl start gunicorn

# 2. 检查端口是否监听
ss -tlnp | grep 8000
# 应该看到：LISTEN 127.0.0.1:8000

# 3. 检查 Nginx 配置的 upstream 是否匹配
# 如果 gunicorn 绑的是 127.0.0.1:8000，nginx 配置的是 0.0.0.0:8000 就连不上

# 4. 查看 Nginx 错误日志，会显示具体原因
tail -f /var/log/nginx/error.log
# 常见错误：
#   connect() refused → 后端没启动
#   upstream timed out → 后端处理太慢，调大 proxy_read_timeout
\`\`\`

**错误 2：504 Gateway Timeout**

\`\`\`nginx
# 原因：后端处理时间超过 Nginx 的超时设置
# 解决：调大超时参数

location /slow-api {
    # 默认 60s，长耗时接口调到 300s
    proxy_connect_timeout 60s;    # 连接后端的超时
    proxy_send_timeout 300s;      # 发请求给后端的超时
    proxy_read_timeout 300s;      # 等后端响应的超时
    proxy_pass http://fastapi_backend;
}
\`\`\`

**错误 3：WebSocket 连接立即断开**

\`\`\`nginx
# 错误配置：没加 Upgrade 头，WebSocket 握手失败
location /ws {
    proxy_pass http://backend;  # 缺少 WebSocket 头！
}

# 正确配置：必须加这 3 个头
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # WebSocket 长连接，超时要调大
    proxy_read_timeout 3600s;
}
\`\`\`

**错误 4：静态资源 404**

\`\`\`nginx
# 原因：alias 和 root 的路径理解错误
# root：拼接 location 路径
#   location /static/ { root /var/www; }
#   实际查找：/var/www/static/file.css
# alias：替换 location 路径
#   location /static/ { alias /var/www/assets/; }
#   实际查找：/var/www/assets/file.css

# 避坑：alias 结尾一定要带斜杠！
location /static/ {
    alias /var/www/assets/;  # 结尾必须有 /
}
\`\`\`

**错误 5：HTTPS 证书过期**

\`\`\`bash
# 查看证书过期时间
echo | openssl s_client -connect api.example.com:443 2>/dev/null | \
    openssl x509 -noout -dates

# 输出示例：
# notBefore=Jan  1 00:00:00 2024 GMT
# notAfter=Apr  1 00:00:00 2024 GMT  ← 这个就是过期时间

# 自动续期没生效？手动测试
sudo certbot renew --dry-run

# 续期后必须 reload nginx 让新证书生效
sudo systemctl reload nginx
\`\`\`

**错误 6：限流把正常用户也挡了**

\`\`\`nginx
# 原因：burst 太小或 rate 太低
# 解决：根据业务调整

# 网页打开会同时发多个请求（CSS/JS/图片），burst=2 会误杀
location / {
    limit_req zone=global burst=20 nodelay;  # burst 调大
}

# 避坑：限流前先用 ab 压测，看看正常用户的请求模式
# 移动端弱网下，一个页面可能重试 5-8 次，burst 至少给 10
\`\`\`

### 59.13 动手实验

**实验 1：搭建完整的反向代理**

\`\`\`bash
# 目标：Nginx + Gunicorn + FastAPI 三件套跑通

# 1. 启动 FastAPI（用 Gunicorn）
cd my_project
gunicorn -c gunicorn.conf.py app.main:app

# 2. 配置 Nginx（参考 59.4 节）
sudo vim /etc/nginx/conf.d/fastapi.conf

# 3. 测试配置语法
sudo nginx -t
# 输出：configuration file /etc/nginx/nginx.conf test is successful

# 4. 重载 Nginx
sudo systemctl reload nginx

# 5. 验证：访问 http://localhost 应该看到 FastAPI 的响应
curl http://localhost/docs
# 应该返回 Swagger UI 页面
\`\`\`

**实验 2：开启 HTTPS**

\`\`\`bash
# 目标：用 Let's Encrypt 给网站装上小绿锁

# 1. 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 2. 一键申请证书并自动配置 Nginx
sudo certbot --nginx -d api.example.com

# 3. 验证 HTTPS
curl -I https://api.example.com
# 应该返回 HTTP/2 200，且浏览器显示🔒图标

# 4. 测试自动续期
sudo certbot renew --dry-run
\`\`\`

**实验 3：限流压测**

\`\`\`bash
# 目标：验证限流配置是否生效

# 1. 配置每秒 5 个请求的限流（参考 59.11）

# 2. 用 ab 压测
ab -n 50 -c 5 https://api.example.com/api/

# 3. 观察结果
#   Complete requests: 50
#   Failed requests: 45  ← 45 个被限流
#   Non-2xx responses: 45  ← 返回 429

# 4. 调整 burst 参数，重新压测，观察失败数变化
\`\`\`

**实验 4：WebSocket 代理**

\`\`\`bash
# 目标：通过 Nginx 代理 WebSocket 连接

# 1. FastAPI 写个 WebSocket 接口
# @app.websocket("/ws")
# async def ws(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send_text(f"Echo: {data}")

# 2. Nginx 配置 WebSocket 代理（参考 59.6 节）

# 3. 用 wscat 测试
npm install -g wscat
wscat -c ws://localhost/ws
# > hello
# < Echo: hello
\`\`\`

### 59.14 实战：生产级 Nginx 完整配置

把前面学的所有知识点串起来，这是一个可以直接用于生产的完整配置：

\`\`\`nginx
# /etc/nginx/nginx.conf - 生产级完整配置

user www-data;                    # 运行用户
worker_processes auto;            # worker 数自动按 CPU 核数
pid /run/nginx.pid;               # pid 文件
error_log /var/log/nginx/error.log warn;  # 错误日志

events {
    worker_connections 2048;      # 每个 worker 最大连接数
    use epoll;                    # Linux 高性能事件模型
    multi_accept on;              # 一次接受多个连接
}

http {
    # ============ 基础配置 ============
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式（JSON 格式方便 ELK 收集）
    log_format main escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time"'
    '}';

    access_log /var/log/nginx/access.log main;

    sendfile on;                  # 零拷贝，提性能
    tcp_nopush on;                # 等数据包满了再发
    tcp_nodelay on;               # 小包立即发（WebSocket 需要）
    keepalive_timeout 65;         # keep-alive 超时
    types_hash_max_size 2048;     # 类型哈希表大小
    server_tokens off;            # 隐藏 Nginx 版本号（安全）

    # ============ Gzip 压缩 ============
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;         # 小于 1KB 不压缩
    gzip_types text/plain text/css application/json application/javascript;

    # ============ 限流区域定义 ============
    limit_req_zone $binary_remote_addr zone=global:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=api_login:10m rate=5r/s;

    # ============ 后端 upstream ============
    upstream fastapi_backend {
        least_conn;               # 最少连接数策略
        server 127.0.0.1:8000;    # Gunicorn 实例 1
        server 127.0.0.1:8001;    # Gunicorn 实例 2（多机部署）
        keepalive 32;             # 保持 32 个长连接
    }

    # ============ HTTP 跳转 HTTPS ============
    server {
        listen 80;
        server_name api.example.com;
        # 永久重定向到 HTTPS
        return 301 https://$host$request_uri;
    }

    # ============ HTTPS 主配置 ============
    server {
        listen 443 ssl http2;
        server_name api.example.com;

        # SSL 证书
        ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

        # SSL 优化
        ssl_protocols TLSv1.2 TLSv1.3;        # 只用安全协议
        ssl_ciphers HIGH:!aNULL:!MD5;          # 高强度加密
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;      # session 缓存
        ssl_session_timeout 10m;

        # 安全头
        add_header Strict-Transport-Security "max-age=31536000" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        # 全局限流
        limit_req zone=global burst=50 nodelay;

        # API 接口
        location / {
            proxy_pass http://fastapi_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

            # 超时
            proxy_connect_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 登录接口单独限流
        location /auth/login {
            limit_req zone=api_login burst=10 nodelay;
            proxy_pass http://fastapi_backend;
        }

        # 静态文件直接 Nginx 处理
        location /static/ {
            alias /var/www/my_project/static/;
            expires 30d;                # 缓存 30 天
            add_header Cache-Control "public, immutable";
        }

        # 健康检查
        location /health {
            access_log off;             # 不记录日志
            proxy_pass http://fastapi_backend/health;
        }

        # Let's Encrypt 续期验证
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }
}
\`\`\`

### 59.15 小结

Nginx 是 FastAPI 生产部署的"门卫"，它解决了 uvicorn/gunicorn 解决不了的几个问题：

1. **多机负载均衡**：upstream 模块把流量分发到多个后端实例；
2. **HTTPS 卸载**：SSL 证书交给 Nginx 管，后端只处理 HTTP；
3. **静态资源加速**：静态文件直接 Nginx 处理，不走 Python；
4. **限流防护**：limit_req 模块在边缘拦截恶意流量；
5. **协议转换**：WebSocket、HTTP/2、gRPC 都能代理。

**关键配置速查表**：

| 需求 | 配置 |
| --- | --- |
| 反向代理 | \`proxy_pass http://backend;\` |
| HTTPS | \`listen 443 ssl;\` + 证书路径 |
| WebSocket | \`proxy_set_header Upgrade $http_upgrade;\` |
| 限流 | \`limit_req zone=name burst=N nodelay;\` |
| 负载均衡 | \`upstream { server ...; }\` |
| 静态文件 | \`location /static/ { alias /path/; }\` |

下一章我们学习 CI/CD，把这些部署步骤全部自动化——代码一推，自动测试、自动构建、自动部署，再也不用手动 SSH 上服务器发版了。
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

前面几章学的部署流程：改代码 → 本地测试 → SSH 上服务器 → git pull → 装依赖 → 重启 Gunicorn → 重载 Nginx。每次发版都这么来一遍，累人不说，还容易出错——忘了装依赖、忘了重启、手抖敲错命令。

**CI/CD** 就是把这些步骤全部自动化：

- **CI（Continuous Integration，持续集成）**：代码推到仓库后，自动跑测试、lint、构建。**确保每次提交都是可用的**；
- **CD（Continuous Delivery/Deployment，持续交付/部署）**：测试通过后，自动部署到测试环境/生产环境。**确保新功能能快速上线**。

> 🏭 **生活类比：CI/CD 像汽车制造流水线**
>
> 想象两种造车方式：
>
> - **手动部署（没有 CI/CD）** = 老工匠手工敲车。一个老师傅从引擎、底盘、车身、喷漆全自己干，一辆车造一个月，质量全凭老师傅当天心情，累了就出错；
> - **CI/CD** = 现代汽车工厂流水线。零件进厂先质检（CI 测试），不合格的零件直接退货；装配线上每个工位自动拧螺丝、自动焊接（CD 部署）；下线前再过一道终检（自动化测试）；合格的车直接开进 4S 店（上线）。
>
> 流水线的好处：**快、稳、可重复**。第一辆车和第一万辆车的质量一样，因为都是机器按相同工序做的。CI/CD 也是——第一次部署和第一千次部署的过程一样，不会因为"今天运维困了"就漏掉一步。

### 60.2 为什么需要 CI/CD

| 手动部署的痛 | CI/CD 的解药 |
| --- | --- |
| 忘了跑测试，bug 上线 | 推代码自动跑测试，不通过不让合并 |
| 环境不一致（本地能跑线上挂） | 用 Docker 保证环境一致 |
| 发版要半夜操作（怕影响用户） | 自动滚动更新，白天也能发 |
| 回滚困难（要手动改回去） | 一键回滚到上个版本 |
| 多人协作冲突（A 改了配置 B 不知道） | PR 强制 review + 自动检查 |
| 上线紧张（手心冒汗） | 全自动，人只看着就行 |

### 60.3 CI/CD 工具对比

主流的 CI/CD 工具：

| 工具 | 特点 | 适用场景 |
| --- | --- | --- |
| **GitHub Actions** | GitHub 自带，配置简单，免费额度够用 | 个人项目、开源项目、中小团队 |
| GitLab CI | GitLab 自带，功能全 | 用 GitLab 的团队 |
| Jenkins | 老牌、插件多、可定制性强 | 大企业、复杂流程 |
| CircleCI | 速度快、贵 | 商业项目 |
| Drone | 轻量、Docker 原生 | 喜欢 Docker 的团队 |

本章用 **GitHub Actions** 演示，因为：1）免费；2）和 GitHub 仓库无缝集成；3）配置文件就是 YAML，版本化管理

### 60.4 GitHub Actions 基础概念

GitHub Actions 的核心概念：

- **Workflow（工作流）**：一个 YAML 文件，定义整个 CI/CD 流程，放在 \`.github/workflows/\` 目录；
- **Job（任务）**：workflow 里的一组步骤，每个 job 跑在一个虚拟机里；
- **Step（步骤）**：job 里的具体操作，可以是 shell 命令或预制的 action；
- **Action**：可复用的步骤单元，比如 \`actions/checkout\` 是拉代码的 action；
- **Runner**：执行 job 的机器，GitHub 提供免费 runner（Ubuntu/Windows/macOS）。

\`\`\`
Workflow (deploy.yml)
  ├── Job: test        （跑测试）
  │     ├── Step: checkout（拉代码）
  │     ├── Step: setup-python（装 Python）
  │     ├── Step: install-deps（装依赖）
  │     └── Step: pytest（跑测试）
  └── Job: deploy      （部署，依赖 test 通过）
        ├── Step: build-image（构建 Docker 镜像）
        └── Step: deploy-to-server（推到服务器）
\`\`\`

### 60.5 第一个 CI：自动跑测试（Demo 1）

项目结构：

\`\`\`
my_project/
├── .github/
│   └── workflows/
│       └── test.yml      ← CI 配置文件
├── app/
│   └── main.py
└── tests/
    └── test_main.py
\`\`\`

\`\`\`yaml
# .github/workflows/test.yml
# 这个 workflow 在每次 push 或 PR 时自动跑测试

# workflow 的名字（GitHub Actions 页面会显示）
name: Test

# 触发条件：什么时候跑这个 workflow
on:
  push:
    branches: [main, develop]    # push 到 main 或 develop 时触发
  pull_request:
    branches: [main]             # 有 PR 指向 main 时触发

# jobs 定义要执行的任务
jobs:
  test:
    # 跑在哪个系统上（ubuntu-latest 是 Ubuntu 22.04）
    runs-on: ubuntu-latest

    # strategy.matrix 可以跑多个版本组合
    # 这里测试 Python 3.10 和 3.11 两个版本
    strategy:
      matrix:
        python-version: ["3.10", "3.11"]

    # steps 定义具体步骤
    steps:
      # 步骤 1：拉取代码（用现成的 action）
      - uses: actions/checkout@v4   # @v4 是 action 版本，要固定

      # 步骤 2：安装 Python
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: \${{ matrix.python-version }}  # 用矩阵变量

      # 步骤 3：安装依赖
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-asyncio httpx

      # 步骤 4：跑测试
      - name: Run tests
        run: pytest -v --cov=app --cov-report=xml

      # 步骤 5：上传覆盖率报告
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
\`\`\`

推到 GitHub 后，每次提交都会自动跑测试，绿勾表示通过，红叉表示失败。

### 60.6 CD：自动部署到服务器（Demo 2）

测试通过后，自动部署到生产服务器。

\`\`\`yaml
# .github/workflows/deploy.yml
# 部署 workflow：只在 main 分支 push 时触发

name: Deploy

on:
  push:
    branches: [main]    # 只有 main 分支 push 才部署

# 同时只允许一个部署任务跑，避免并发部署冲突
concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  # ============ Job 1: 先跑测试 ============
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: pip install pytest
      - run: pytest

  # ============ Job 2: 部署（依赖 test 通过）============
  deploy:
    needs: test          # 等 test job 通过才跑
    runs-on: ubuntu-latest
    # 只有 main 分支才部署（双重保险）
    if: github.ref == 'refs/heads/main'

    steps:
      # 拉代码
      - uses: actions/checkout@v4

      # 构建 Docker 镜像并推到 Docker Hub
      - name: Build and push Docker image
        run: |
          # 登录 Docker Hub（密码存在 GitHub Secrets 里）
          echo "\${{ secrets.DOCKER_PASSWORD }}" | docker login -u "\${{ secrets.DOCKER_USERNAME }}" --password-stdin
          # 构建镜像，tag 用 GitHub 的 commit SHA（保证唯一）
          docker build -t myuser/fastapi-app:\${{ github.sha }} .
          # 推到 Docker Hub
          docker push myuser/fastapi-app:\${{ github.sha }}

      # SSH 到生产服务器，拉新镜像并重启
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}        # 服务器 IP
          username: \${{ secrets.SERVER_USER }}     # SSH 用户
          key: \${{ secrets.SSH_PRIVATE_KEY }}       # SSH 私钥
          script: |
            # 拉新镜像
            docker pull myuser/fastapi-app:\${{ github.sha }}
            # 停旧容器
            docker stop fastapi-app || true
            docker rm fastapi-app || true
            # 启动新容器
            docker run -d --name fastapi-app \\
              -p 8000:8000 \\
              --env-file /app/.env \\
              myuser/fastapi-app:\${{ github.sha }}
            # 清理旧镜像
            docker image prune -f
\`\`\`

**关键概念：GitHub Secrets**

密码、私钥这些敏感信息不能写在 YAML 里（会泄露），要用 GitHub Secrets：

1. 仓库 → Settings → Secrets and variables → Actions；
2. New repository secret，填名字和值；
3. YAML 里用 \`\${{ secrets.名字 }}\` 引用。

### 60.7 多环境流水线（Demo 3）

真实项目通常有多个环境：dev → staging → production。每次 PR 推到 dev，合并到 main 推到 staging，打 tag 推到 production。

\`\`\`yaml
# .github/workflows/multi-env.yml
# 多环境部署：根据分支自动部署到不同环境

name: Multi-Env Deploy

on:
  push:
    branches: [dev, main]    # dev 推到测试环境，main 推到预发布
  # 打 tag 时部署到生产
  tags:
    - "v*"                   # v1.0.0、v2.1.3 这种 tag

jobs:
  # ============ 公共：测试 job ============
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt && pip install pytest
      - run: pytest

  # ============ dev 环境：push 到 dev 分支 ============
  deploy-dev:
    needs: test
    if: github.ref == 'refs/heads/dev'
    runs-on: ubuntu-latest
    environment: dev    # GitHub Environments 功能，可配审批
    steps:
      - name: Deploy to dev
        run: echo "部署到 dev 环境: dev.example.com"
        # 实际部署脚本...

  # ============ staging 环境：push 到 main 分支 ============
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: echo "部署到 staging 环境: staging.example.com"

  # ============ production 环境：打 tag ============
  deploy-production:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    # production 环境要求人工审批（GitHub Environments 配置）
    environment:
      name: production
      url: https://api.example.com    # 部署后的访问地址
    steps:
      - name: Deploy to production
        run: |
          echo "部署到生产环境: api.example.com"
          echo "版本: \${{ github.ref_name }}"    # v1.0.0
\`\`\`

> **GitHub Environments** 是个强大功能：可以给每个环境配不同的 secrets、要求人工审批、限制部署分支。在仓库 Settings → Environments 里配置。

### 60.8 数据库迁移自动化（Demo 4）

部署新版本时常要跑数据库迁移（Alembic）。这个 Demo 展示如何在 CI/CD 里安全地跑迁移。

\`\`\`yaml
# .github/workflows/migrate.yml
# 数据库迁移 workflow

name: Database Migration

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install alembic

      # 步骤 1：先生成迁移 SQL，但不执行（检查会不会出错）
      - name: Generate migration SQL (dry-run)
        run: |
          # alembic upgrade head --sql 生成 SQL 但不执行
          # 输出到文件，方便人工 review
          alembic upgrade head --sql > migration.sql
          cat migration.sql
        env:
          DATABASE_URL: \${{ secrets.STAGING_DATABASE_URL }}

      # 步骤 2：执行迁移
      - name: Run migration
        run: |
          # 真正执行迁移
          alembic upgrade head
        env:
          DATABASE_URL: \${{ secrets.PRODUCTION_DATABASE_URL }}

      # 步骤 3：验证迁移结果
      - name: Verify migration
        run: |
          # 检查当前版本
          alembic current
          # 检查是否有未执行的迁移
          alembic heads
        env:
          DATABASE_URL: \${{ secrets.PRODUCTION_DATABASE_URL }}

      # 步骤 4：失败时回滚
      - name: Rollback on failure
        if: failure()
        run: |
          # 回滚一个版本
          alembic downgrade -1
        env:
          DATABASE_URL: \${{ secrets.PRODUCTION_DATABASE_URL }}
\`\`\`

**避坑**：

\`\`\`bash
# 1. 迁移前一定要备份！
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. 大表加列要用默认值，避免锁表
# 错误（会锁表几分钟）：
#   ALTER TABLE users ADD COLUMN bio TEXT;
# 正确（分两步）：
#   ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';  -- 先加默认值
#   ALTER TABLE users ALTER COLUMN bio DROP DEFAULT;   -- 再去掉默认值

# 3. 删列要先停用（分多个版本发布）
# v1: 代码不再读写该列
# v2: 迁移删掉该列
\`\`\`

### 60.9 通知集成（Demo 5）

部署成功/失败都要通知团队，不能让大家两眼一黑不知道发生了啥。

\`\`\`yaml
# .github/workflows/notify.yml
# 部署 + 通知

name: Deploy with Notification

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy
        id: deploy    # 给 step 一个 id，后面能引用它的输出
        run: |
          echo "正在部署..."
          # 模拟部署
          sleep 5
          echo "deploy_status=success" >> $GITHUB_OUTPUT

      # ============ 成功通知：飞书/钉钉/Slack ============
      - name: Notify success (Feishu)
        if: success()
        uses: foxundermoon/feishu-action@v2
        with:
          url: \${{ secrets.FEISHU_WEBHOOK_URL }}
          msg_type: text
          content: |
            ✅ 部署成功
            仓库: \${{ github.repository }}
            分支: \${{ github.ref_name }}
            提交者: \${{ github.actor }}
            提交信息: \${{ github.event.head_commit.message }}
            查看详情: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}

      # ============ 失败通知 ============
      - name: Notify failure (Feishu)
        if: failure()
        uses: foxundermoon/feishu-action@v2
        with:
          url: \${{ secrets.FEISHU_WEBHOOK_URL }}
          msg_type: text
          content: |
            ❌ 部署失败
            仓库: \${{ github.repository }}
            分支: \${{ github.ref_name }}
            提交者: \${{ github.actor }}
            错误信息: 请查看日志
            查看日志: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}

      # ============ 飞书卡片消息（更美观）============
      - name: Send rich card
        if: success()
        uses: foxundermoon/feishu-action@v2
        with:
          url: \${{ secrets.FEISHU_WEBHOOK_URL }}
          msg_type: interactive
          card: |
            {
              "header": {
                "title": {"tag": "plain_text", "content": "🚀 部署成功"},
                "template": "green"
              },
              "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": "**仓库**: \${{ github.repository }}\\n**分支**: \${{ github.ref_name }}\\n**提交者**: \${{ github.actor }}"}}
              ]
            }
\`\`\`

### 60.10 缓存优化加速构建（Demo 6）

每次 CI 都重新装依赖太慢。用缓存可以大幅加速。

\`\`\`yaml
# .github/workflows/cache.yml
# 带 cache 的 workflow

name: CI with Cache

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      # ============ 缓存 pip 下载的包 ============
      - name: Cache pip packages
        uses: actions/cache@v3
        with:
          # 缓存什么文件（~/.cache/pip 是 pip 的下载缓存）
          path: ~/.cache/pip
          # 缓存 key：用 requirements.txt 的 hash 作为 key
          # requirements.txt 没变就用缓存，变了就重新下载
          key: \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}
          # 找不到精确 key 时，用这个 restore-keys 回退匹配
          restore-keys: |
            \${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest

      # ============ 缓存 Docker 镜像层 ============
      - name: Cache Docker layers
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: \${{ runner.os }}-buildx-\${{ github.sha }}
          restore-keys: |
            \${{ runner.os }}-buildx-

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: myapp:test
          # 用 cache-from 和 cache-to 利用缓存
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache-new

      # 临时缓存目录要挪一下，避免无限增长
      - name: Move cache
        run: |
          rm -rf /tmp/.buildx-cache
          mv /tmp/.buildx-cache-new /tmp/.buildx-cache

      - name: Run tests
        run: pytest
\`\`\`

**缓存效果对比**：

| 场景 | 不带缓存 | 带 cache |
| --- | --- | --- |
| 首次构建 | 5 分 30 秒 | 5 分 35 秒（多写缓存） |
| 第二次构建 | 5 分 28 秒 | 1 分 12 秒（命中缓存） |

### 60.11 蓝绿部署与金丝雀发布（Demo 7）

直接停旧容器启动新容器有短暂中断。**蓝绿部署**和**金丝雀发布**能实现零停机更新。

\`\`\`yaml
# .github/workflows/blue-green.yml
# 蓝绿部署 workflow

name: Blue-Green Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Determine target environment
        id: env
        # 蓝绿切换：当前是 blue 就部署 green，反之亦然
        run: |
          # 查询当前哪个环境在跑
          CURRENT=$(curl -s http://api.example.com/which-env)
          if [ "$CURRENT" = "blue" ]; then
            echo "target=green" >> $GITHUB_OUTPUT
          else
            echo "target=blue" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to \${{ steps.env.outputs.target }}
        run: |
          TARGET=\${{ steps.env.outputs.target }}
          # 启动新环境（不切换流量）
          docker run -d --name fastapi-\${TARGET} \\
            -p \${TARGET} == "blue" && 8001 || 8002:8000 \\
            myuser/fastapi-app:\${{ github.sha }}

          # 等新环境就绪
          echo "等待新环境启动..."
          for i in {1..30}; do
            if curl -s http://localhost:\${TARGET} == "blue" && 8001 || 8002/health | grep "ok"; then
              echo "新环境就绪"
              break
            fi
            sleep 2
          done

          # 跑冒烟测试
          echo "跑冒烟测试..."
          pytest tests/test_smoke.py --base-url=http://localhost:\${TARGET} == "blue" && 8001 || 8002

      - name: Switch traffic
        # 切换 Nginx 流量到新环境
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            TARGET=\${{ steps.env.outputs.target }}
            # 更新 Nginx 配置，把 upstream 指向新环境
            if [ "$TARGET" = "blue" ]; then
              cp /etc/nginx/conf.d/upstream-blue.conf /etc/nginx/conf.d/upstream.conf
            else
              cp /etc/nginx/conf.d/upstream-green.conf /etc/nginx/conf.d/upstream.conf
            fi
            # 重载 Nginx（不中断连接）
            nginx -s reload

      - name: Cleanup old environment
        # 等 5 分钟确保流量都切到新环境了，再清理旧的
        run: |
          sleep 300
          OLD=\${{ steps.env.outputs.target }} == "blue" && "green" || "blue"
          docker stop fastapi-\${OLD} || true
          docker rm fastapi-\${OLD} || true
\`\`\`

**金丝雀发布**：先让 5% 流量到新版本，观察一段时间没问题再放大到 100%。

\`\`\`nginx
# Nginx 金丝雀配置：5% 流量到新版本
upstream backend {
    server 127.0.0.1:8000 weight=19;   # 旧版本：19/20 = 95%
    server 127.0.0.1:8001 weight=1;    # 新版本：1/20 = 5%
}
\`\`\`

### 60.12 常见错误避坑指南

**错误 1：GitHub Secrets 不生效**

\`\`\`yaml
# 错误：secrets 名字写错
- run: echo "\${{ secrets.Database_Url }}"   # 名字不对
# 正确：大小写敏感
- run: echo "\${{ secrets.DATABASE_URL }}"
\`\`\`

**错误 2：Docker build 失败**

\`\`\`bash
# 原因：Dockerfile 里 COPY 的文件不在构建上下文
# 检查 .dockerignore 是否排除了需要的文件
cat .dockerignore
# 常见问题：把 app/ 加进 .dockerignore 了

# 调试：在 CI 里加 step 打印构建上下文
- name: List files
  run: ls -la
\`\`\`

**错误 3：SSH 部署连不上**

\`\`\`bash
# 原因 1：私钥格式不对
# GitHub Secrets 里存的私钥必须是完整格式，包括 BEGIN/END 行
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

# 原因 2：服务器没加公钥
# 在服务器上检查
cat ~/.ssh/authorized_keys
# 没有就加上公钥

# 原因 3：防火墙挡了 22 端口
# 测试连通性
ssh -T -v user@server_ip
\`\`\`

**错误 4：测试在 CI 里失败但本地通过**

\`\`\`bash
# 原因：环境差异
# 1. Python 版本不同（本地 3.11，CI 跑 3.10）
# 解决：在 matrix 里明确指定版本
# 2. 依赖版本不一致（没 pin 版本）
# 解决：用 pip freeze > requirements.txt 锁版本
# 3. 时区不同（CI 默认 UTC）
# 解决：在 CI 里设置 TZ=Asia/Shanghai
\`\`\`

**错误 5：并发部署冲突**

\`\`\`yaml
# 问题：连续 push 两次，两个部署同时跑，互相覆盖
# 解决：用 concurrency 限制
concurrency:
  group: deploy-production
  cancel-in-progress: true   # 取消旧的，只跑最新的
\`\`\`

**错误 6：迁移失败导致线上挂掉**

\`\`\`bash
# 原因：迁移和部署分离，先跑迁移再部署新代码
# 错误流程：直接部署新代码 → 新代码要新字段 → 数据库没迁移 → 报错
# 正确流程：
#   1. 先部署能兼容新旧 schema 的代码（向后兼容）
#   2. 跑迁移
#   3. 部署用新 schema 的代码

# Alembic 迁移失败的回滚
alembic downgrade -1     # 回滚一个版本
alembic downgrade -5     # 回滚 5 个版本
alembic downgrade abc123 # 回滚到指定版本
\`\`\`

### 60.13 动手实验

**实验 1：搭建第一个 CI**

\`\`\`bash
# 目标：在 GitHub 上跑通自动测试

# 1. 创建 .github/workflows/test.yml（参考 60.5）

# 2. 推到 GitHub
git add .github/workflows/test.yml
git commit -m "Add CI"
git push

# 3. 打开 GitHub 仓库 → Actions 标签页
# 应该能看到 Test workflow 在跑

# 4. 故意写个失败的测试，看 CI 是否报红
# 修改 tests/test_main.py，让断言失败
# 推上去，看 CI 红叉
\`\`\`

**实验 2：自动部署到测试服务器**

\`\`\`bash
# 目标：push 到 main 自动部署

# 1. 准备一台测试服务器（VPS 或云主机）

# 2. 在 GitHub 配置 Secrets:
#    SERVER_HOST: 服务器 IP
#    SERVER_USER: 用户名
#    SSH_PRIVATE_KEY: 私钥

# 3. 创建 deploy.yml（参考 60.6）

# 4. 推到 main 分支，观察自动部署

# 5. SSH 上服务器验证
ssh user@server
docker ps   # 应该看到新容器在跑
curl http://localhost:8000/health   # 应该返回 ok
\`\`\`

**实验 3：加飞书通知**

\`\`\`bash
# 目标：部署成功/失败发飞书消息

# 1. 在飞书群创建机器人，拿到 webhook URL
# 群设置 → 群机器人 → 添加机器人 → 自定义机器人

# 2. 把 webhook URL 存到 GitHub Secrets:
#    FEISHU_WEBHOOK_URL: https://open.feishu.cn/...

# 3. 在 workflow 加通知 step（参考 60.9）

# 4. 推一次代码，观察群里是否收到通知
\`\`\`

**实验 4：实现蓝绿部署**

\`\`\`bash
# 目标：零停机更新

# 1. 准备两个端口：blue (8001)、green (8002)
# 2. Nginx upstream 配置切换脚本
# 3. 创建 blue-green.yml（参考 60.11）
# 4. 推代码，观察：
#    - 新版本启动在另一个端口
#    - 冒烟测试通过
#    - Nginx 切换流量
#    - 旧版本 5 分钟后清理
# 5. 部署过程中持续 curl，观察是否有中断
while true; do curl -s http://api.example.com/health; sleep 1; done
\`\`\`

### 60.14 实战：完整生产级 CI/CD 配置

把前面所有知识点串起来：

\`\`\`yaml
# .github/workflows/production.yml
# 生产级完整 CI/CD

name: Production CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 并发控制
concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ============ 1. 代码检查 ============
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install ruff black mypy
      - run: ruff check .
      - run: black --check .
      - run: mypy app/

  # ============ 2. 测试（多版本）============
  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: \${{ matrix.python-version }}
      - uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}
      - run: pip install -r requirements.txt pytest pytest-cov
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3

  # ============ 3. 安全扫描 ============
  security:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install safety bandit
      # 检查依赖有没有已知漏洞
      - run: safety check
      # 检查代码安全问题
      - run: bandit -r app/

  # ============ 4. 构建 Docker 镜像 ============
  build:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            myuser/fastapi-app:latest
            myuser/fastapi-app:\${{ github.sha }}
          cache-from: type=registry,ref=myuser/fastapi-app:buildcache
          cache-to: type=registry,ref=myuser/fastapi-app:buildcache,mode=max

  # ============ 5. 部署到 staging ============
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.STAGING_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull myuser/fastapi-app:\${{ github.sha }}
            docker stop fastapi-staging || true
            docker rm fastapi-staging || true
            docker run -d --name fastapi-staging \\
              -p 8000:8000 --env-file /app/.env.staging \\
              myuser/fastapi-app:\${{ github.sha }}

  # ============ 6. 冒烟测试 ============
  smoke-test:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - run: |
          sleep 10
          curl -f https://staging.example.com/health || exit 1
          curl -f https://staging.example.com/docs || exit 1

  # ============ 7. 部署到 production（需人工审批）============
  deploy-production:
    needs: smoke-test
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.example.com
    steps:
      - uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.PRODUCTION_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull myuser/fastapi-app:\${{ github.sha }}
            docker stop fastapi-prod || true
            docker rm fastapi-prod || true
            docker run -d --name fastapi-prod \\
              -p 8000:8000 --env-file /app/.env.prod \\
              myuser/fastapi-app:\${{ github.sha }}

  # ============ 8. 通知 ============
  notify:
    needs: [deploy-production]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: foxundermoon/feishu-action@v2
        if: success()
        with:
          url: \${{ secrets.FEISHU_WEBHOOK_URL }}
          msg_type: text
          content: "✅ 生产部署成功: \${{ github.sha }}"
      - uses: foxundermoon/feishu-action@v2
        if: failure()
        with:
          url: \${{ secrets.FEISHU_WEBHOOK_URL }}
          msg_type: text
          content: "❌ 部署失败，请检查: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}"
\`\`\`

### 60.15 小结

CI/CD 把"改代码 → 测试 → 部署"这条链路完全自动化，带来的好处：

1. **质量保证**：每次提交都跑测试，bug 无所遁形；
2. **环境一致**：Docker 保证开发/测试/生产环境一样；
3. **快速回滚**：版本号管理，一键回到上个版本；
4. **无人值守**：白天也能发版，不用半夜运维；
5. **可审计**：每次部署都有记录，谁部署的、部署了啥、成功没。

**CI/CD 流水线全景图**：

\`\`\`
代码提交
  ↓
[lint] 代码风格检查
  ↓
[test] 多版本测试 + 覆盖率
  ↓
[security] 安全扫描
  ↓
[build] 构建 Docker 镜像
  ↓
[deploy-staging] 部署到预发布
  ↓
[smoke-test] 冒烟测试
  ↓
[manual approval] 人工审批
  ↓
[deploy-production] 部署到生产
  ↓
[notify] 通知团队
\`\`\`

**关键原则**：

| 原则 | 说明 |
| --- | --- |
| 快速失败 | 尽早发现问题（lint → test → build） |
| 单一职责 | 每个 job 只做一件事 |
| 幂等性 | 跑多少次结果一样 |
| 可回滚 | 任何部署都能回退 |
| 可观测 | 每步都有日志和通知 |

学完这一章，你已经有了一套完整的 FastAPI 部署运维知识体系：从 Gunicorn 多进程管理、Docker 容器化、Nginx 反向代理，到 CI/CD 全自动部署。下一章我们将开始实战项目，把前面学的所有知识串起来做一个完整的应用。
`
  }
];

