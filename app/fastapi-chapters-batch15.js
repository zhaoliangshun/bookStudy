// =============================================================
// FastAPI 应用开发实战 - 第十五批章节(部署与运维,共 4 章)
// 章节 57-60:Gunicorn+Uvicorn 部署 / Docker 容器化 / Nginx 反向代理 / CI/CD
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十七章:Gunicorn + Uvicorn 部署
  // =============================================================
  {
    id: 'deploy-gunicorn',
    group: '部署与运维',
    icon: '🚀',
    title: 'Gunicorn + Uvicorn 部署',
    content: `## 第五十七章　Gunicorn + Uvicorn 部署

### 57.1 为什么不能直接用 uvicorn 部署

开发时大家都这么跑:

\`\`\`bash
uvicorn app.main:app --reload --port 8000
\`\`\`

但生产环境直接这么跑有几个问题:

- **单进程**:uvicorn 默认单进程,只用一个 CPU 核,机器再强也白搭;
- **没有 worker 管理**:进程崩了就崩了,没人重启;
- **没有 graceful shutdown**:发停止信号时,正在处理的请求会被中断;
- **没有超时控制**:一个请求卡死,worker 就一直占着。

> 一句话:uvicorn 是"ASGI 服务器",擅长处理协议;但它不擅长"管多个 worker、监控、重启"这些事。这正是 Gunicorn 的强项。

### 57.2 Gunicorn 是什么

Gunicorn 是个 WSGI 服务器,历史悠久、稳定、被广泛使用。但它也能管 ASGI 应用——通过"worker class"指定 Uvicorn 作为 worker:

\`\`\`
Gunicorn(主进程)
  ├── UvicornWorker 1(处理 ASGI 请求)
  ├── UvicornWorker 2
  ├── UvicornWorker 3
  └── UvicornWorker 4
\`\`\`

- **主进程**:负责管理 worker、重启卡死的 worker、转发信号;
- **worker 进程**:真正处理请求,每个用 Uvicorn 跑你的 FastAPI app。

### 57.3 安装

\`\`\`bash
pip install gunicorn uvicorn[standard]
\`\`\`

### 57.4 最简单的启动命令

\`\`\`bash
# -k 指定 worker 类,用 UvicornWorker 让它支持 ASGI
# -w 指定 worker 数量
# -b 指定监听地址端口
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
\`\`\`

> 注意路径:\`app.main:app\` 表示 \`app/main.py\` 文件里的 \`app\` 对象。

### 57.5 worker 数量怎么定

经验公式:**CPU 核数 × 2 + 1**

\`\`\`bash
# 4 核机器 → 9 个 worker
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 9 -b 0.0.0.0:8000
\`\`\`

为什么是 2N+1:

- 每核 2 个 worker:因为 FastAPI 是异步的,worker 数可以多于核数;
- +1:留点冗余,worker 重启时不影响吞吐。

> 但这不是死规则:**I/O 密集型可以多些(20-50),CPU 密集型少些(N 到 2N)**。最终要压测决定。

### 57.6 配置文件:guni.conf.py

命令行参数多了难维护,用配置文件:

\`\`\`python
# gunicorn.conf.py
import multiprocessing

# 监听
bind = "0.0.0.0:8000"

# worker
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

# 超时:worker 处理一个请求超过这个时间,Gunicorn 重启它
timeout = 120

# 优雅停机:收到停止信号后,给 worker 多少秒处理完现有请求
graceful_timeout = 30

# 保持连接:worker 处理完请求后等多少秒复用连接
keepalive = 5

# 预加载:启动 worker 前先加载 app 一次,worker fork 复用
# 好处:省内存、模型只加载一次
preload_app = True

# 日志
accesslog = "-"          # 访问日志输出到控制台
errorlog = "-"           # 错误日志输出到控制台
loglevel = "info"

# 进程名(便于 ps 查看)
proc_name = "myapp"

# 最大并发(异步 worker 用不上,WSGI 才用)
# max_requests = 1000     # worker 处理 1000 个请求后重启,防内存泄漏
# max_requests_jitter = 50  # 加随机抖动,避免所有 worker 同时重启
\`\`\`

启动:

\`\`\`bash
gunicorn app.main:app -c gunicorn.conf.py
\`\`\`

### 57.7 preload_app 的作用

\`preload_app = True\` 会让 Gunicorn 在 fork worker 之前先加载一次 app,worker 通过 fork 复用这份内存:

**好处**:

- **省内存**:模型、连接池只建一次,worker 共享(写时复制);
- **启动快**:不用每个 worker 都加载模型(模型可能几 GB)。

**风险**:

- **数据库连接问题**:fork 后连接池的连接会被多个进程共享,可能出错。建议在 lifespan 里建连接池,而不是模块加载时;
- **改配置要重启所有 worker**:不能滚动更新。

> 经验:有"重的初始化"(ML 模型、大字典)用 \`preload_app=True\`;全是数据库连接的,可以不开。

### 57.8 优雅停机(graceful shutdown)

发 \`SIGTERM\` 或 \`SIGINT\` 给 Gunicorn,它不会立刻杀 worker,而是:

1. 停止接收新请求;
2. 给 worker \`graceful_timeout\` 秒(配置里的 30 秒)处理完现有请求;
3. 超时还没处理完的,强制杀掉。

\`\`\`bash
# 找到主进程 PID
ps aux | grep gunicorn | grep master

# 发停止信号
kill -TERM <主进程PID>

# 或者更简单(如果你用 systemd)
systemctl stop myapp
\`\`\`

> 这就是为什么前面讲 lifespan 时强调"yield 后必须清理资源"——优雅停机时,FastAPI 会触发 shutdown,你的 lifespan 关闭代码就有机会执行。

### 57.9 UvicornWorker vs Uvicorn

注意 worker class 的写法,有两个选择:

| worker class | 说明 |
| --- | --- |
| \`uvicorn.workers.UvicornWorker\` | 用 Gunicorn 管 worker,worker 内部用 Uvicorn 跑 ASGI(推荐) |
| 不用 Gunicorn,直接 \`uvicorn --workers 4\` | Uvicorn 自己也有 \`--workers\`,但管理能力不如 Gunicorn |

\`\`\`bash
# 方式 A:Gunicorn + UvicornWorker(推荐)
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4

# 方式 B:Uvicorn 自带多 worker(简单但管理弱)
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
\`\`\`

> 生产推荐方式 A:Gunicorn 的 worker 管理更成熟(超时重启、信号处理、preload)。

### 57.10 systemd 服务配置

让 Gunicorn 开机自启、崩溃自动重启,用 systemd:

\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My FastAPI App
After=network.target

[Service]
# 运行用户
User=www-data
Group=www-data

# 工作目录
WorkingDirectory=/var/www/myapp

# 虚拟环境
Environment="PATH=/var/www/myapp/venv/bin"

# 启动命令
ExecStart=/var/www/myapp/venv/bin/gunicorn app.main:app -c gunicorn.conf.py

# 重启策略:崩溃后 5 秒重启
Restart=always
RestartSec=5

# 优雅停机:发 SIGTERM,等 30 秒
KillSignal=SIGTERM
TimeoutStopSec=30

# 输出到 systemd journal(用 journalctl 查看)
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
\`\`\`

操作命令:

\`\`\`bash
# 启动
sudo systemctl start myapp

# 开机自启
sudo systemctl enable myapp

# 重启
sudo systemctl restart myapp

# 查看状态
sudo systemctl status myapp

# 查看日志
sudo journalctl -u myapp -f
\`\`\`

### 57.11 信号处理

Gunicorn 主进程响应的信号:

| 信号 | 作用 |
| --- | --- |
| \`TERM\` | 优雅停机(默认) |
| \`INT\` | 优雅停机(同 TERM,Ctrl+C 发的就是这个) |
| \`HUP\` | 重新加载配置和 worker(不停服务重启) |
| \`USR1\` | 重新打开日志文件(日志切割时用) |
| \`USR2\` | 升级 Gunicorn 二进制(零停机升级) |
| \`WINCH\` | 平稳减少 worker 数 |

> \`HUP\` 很有用:改了代码或配置,发 \`kill -HUP <PID>\`,Gunicorn 会平滑重启 worker,不停服务。

### 57.12 完整部署流程示例

\`\`\`bash
# 1. 拉代码
cd /var/www
git clone https://github.com/me/myapp.git
cd myapp

# 2. 建虚拟环境
python -m venv venv
source venv/bin/activate

# 3. 装依赖
pip install -r requirements.txt
pip install gunicorn "uvicorn[standard]"

# 4. 配置环境变量(或用 .env)
export DATABASE_URL=mysql://...
export SECRET_KEY=$(python -c "import secrets;print(secrets.token_urlsafe(32))")

# 5. 启动(用 systemd 托管)
sudo cp myapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start myapp
sudo systemctl enable myapp

# 6. 验证
curl http://localhost:8000/docs
sudo systemctl status myapp
\`\`\`

### 57.13 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 生产用 \`uvicorn --reload\` | 性能差、不稳定 | 生产别开 \`--reload\` |
| worker 数和核数无关 | 浪费或过载 | 用 \`2N+1\` 公式,压测调整 |
| 不设 \`timeout\` | 一个卡死请求拖垮 worker | 设 \`timeout=120\` 之类 |
| lifespan 里建连接但 \`preload_app=True\` | fork 后连接共享出错 | 连接在 lifespan 建,模型才 preload |
| 不用 systemd 托管 | 进程崩了没人重启 | 用 systemd / supervisor |
| 直接 \`kill -9\` | 请求被中断,数据不一致 | 用 \`SIGTERM\` 优雅停机 |

> **本章小结:生产用 Gunicorn + UvicornWorker,worker 数 \`(2N+1)\`,配置文件管参数,systemd 托管开机自启和崩溃重启。优雅停机靠 \`SIGTERM\` + lifespan 清理。下一章用 Docker 把这一切打包。`,
  },

  // =============================================================
  // 第五十八章:Docker 容器化
  // =============================================================
  {
    id: 'deploy-docker',
    group: '部署与运维',
    icon: '🐳',
    title: 'Docker 容器化',
    content: `## 第五十八章　Docker 容器化

### 58.1 Docker 是什么

Docker 是容器化工具,把"你的代码 + 依赖 + 运行环境"打包成一个**镜像(image)**,然后在任何机器上跑成**容器(container)**。

> 类比:以前部署要在服务器上装 Python、装 pip、装依赖、配环境,换台机器重来一遍。Docker 把这些全打包成"一个文件",到哪台机器都是一样的环境。

**核心好处**:

- **环境一致**:开发、测试、生产用同一个镜像,告别"在我机器上能跑";
- **隔离**:多个服务互不干扰(各自一个容器);
- **可移植**:镜像推到 registry,任何机器拉下来就能跑;
- **易扩展**:docker-compose up 一条命令起整套服务。

### 58.2 Dockerfile 编写

Dockerfile 是"镜像构建说明书",每条指令一层:

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

# 设工作目录(后续命令都在这执行)
WORKDIR /app

# 设时区(可选)
ENV TZ=Asia/Shanghai

# 先复制依赖文件(利用 docker 缓存,代码变了不重装依赖)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制代码
COPY . .

# 暴露端口(只是声明,真正映射用 -p)
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000"]
\`\`\`

### 58.3 .dockerignore

像 \`.gitignore\` 一样,排除不该进镜像的文件:

\`\`\`
# .dockerignore
__pycache__
*.pyc
.git
.env
.venv
tests/
htmlcov/
*.log
Dockerfile
docker-compose.yml
\`\`\`

> 不写 \`.dockerignore\` 会导致 \`.git\` 目录都打进镜像,镜像变大几百 MB,还可能泄露源码历史。

### 58.4 构建和运行

\`\`\`bash
# 构建镜像,-t 起名字,:latest 是标签
docker build -t myapp:latest .

# 查看镜像
docker images

# 运行容器
# -d 后台运行
# -p 主机端口:容器端口
# --name 给容器起名
# -e 传环境变量
docker run -d -p 8000:8000 --name myapp -e DATABASE_URL=mysql://host/myapp myapp:latest

# 查看运行中的容器
docker ps

# 看日志
docker logs -f myapp

# 进入容器调试
docker exec -it myapp bash

# 停止
docker stop myapp

# 删除容器
docker rm myapp
\`\`\`

### 58.5 多阶段构建(减小镜像)

直接 \`FROM python:3.11\` 镜像有 1GB+,太大了。多阶段构建只把"必要产物"放进最终镜像:

\`\`\`dockerfile
# 阶段 1:构建阶段(装依赖、编译)
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 阶段 2:运行阶段(只复制依赖和代码)
FROM python:3.11-slim
WORKDIR /app

# 从 builder 复制 pip 装的包(--user 装到 /root/.local)
COPY --from=builder /root/.local /root/.local

# 复制代码
COPY . .

# 确保 PATH 包含 .local
ENV PATH=/root/.local/bin:\$PATH

EXPOSE 8000
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000"]
\`\`\`

**效果**:最终镜像不含 pip 缓存、编译工具,体积能从 1GB 降到 200MB 以下。

> 注意上面 \`ENV PATH=/root/.local/bin:\$PATH\`,这里 \`\\$PATH\` 是转义的,构建时会被替换成容器内的 PATH。

### 58.6 docker-compose:多服务编排

真实项目不只一个 app,还有 MySQL、Redis、Nginx。\`docker-compose.yml\` 把这些服务一起编排:

\`\`\`yaml
# docker-compose.yml
version: "3.9"

services:
  # FastAPI 应用
  app:
    build: .                          # 用当前目录的 Dockerfile 构建
    container_name: myapp
    restart: always                   # 崩溃自动重启
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql://user:pass@db:3306/mydb
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=change-me
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./logs:/app/logs               # 日志挂到主机,方便查看

  # MySQL 数据库
  db:
    image: mysql:8.0
    container_name: mydb
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: mydb
      MYSQL_USER: user
      MYSQL_PASSWORD: pass
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql         # 数据持久化
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: myredis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  db_data:                              # 命名卷,数据持久化
  redis_data:
\`\`\`

操作:

\`\`\`bash
# 启动所有服务(后台)
docker-compose up -d

# 看日志
docker-compose logs -f app

# 只重启 app
docker-compose restart app

# 停止并删除容器(数据卷保留)
docker-compose down

# 停止并删除数据卷(慎用!数据没了)
docker-compose down -v
\`\`\`

### 58.7 端口映射和数据卷

**端口映射**:\`-p 主机端口:容器端口\`

\`\`\`yaml
ports:
  - "8000:8000"      # 主机 8000 → 容器 8000
  - "127.0.0.1:3306:3306"  # 只允许本机访问 3306(数据库别暴露公网)
\`\`\`

**数据卷**:容器删了数据就没了,要持久化必须挂卷

| 类型 | 语法 | 用途 |
| --- | --- | --- |
| 命名卷 | \`db_data:/var/lib/mysql\` | Docker 管理,跨容器复用 |
| 绑定挂载 | \`./logs:/app/logs\` | 直接挂主机目录,改文件即生效 |

> 数据库一定挂卷,否则 \`docker-compose down\` 数据全没。

### 58.8 环境变量传入

三种方式:

**方式一:compose 里直接写**(适合非敏感)

\`\`\`yaml
environment:
  - DEBUG=False
  - API_V1_PREFIX=/api/v1
\`\`\`

**方式二:用 env_file**(适合开发,敏感的别进 git)

\`\`\`yaml
env_file:
  - .env
\`\`\`

**方式三:用 secrets / 外部注入**(生产推荐)

\`\`\`bash
# 部署时通过环境变量注入
export SECRET_KEY=prod-secret
docker-compose up -d
\`\`\`

### 58.9 健康检查

容器"在跑"不代表"服务正常",要主动探测:

\`\`\`yaml
app:
  build: .
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s        # 每 30 秒探测一次
    timeout: 5s          # 超时 5 秒算失败
    retries: 3           # 连续 3 次失败才标 unhealthy
    start_period: 30s    # 启动后 30 秒内失败不算
\`\`\`

> 这要求你的 app 有个 \`/health\` 接口,返回 200。配合 \`depends_on: condition: service_healthy\`,app 会等数据库健康了再启动。

### 58.10 FastAPI + MySQL 完整 docker-compose 示例

\`\`\`yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build: .
    restart: always
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD:-rootpass}
      MYSQL_DATABASE: \${DB_NAME:-mydb}
      MYSQL_USER: \${DB_USER:-user}
      MYSQL_PASSWORD: \${DB_PASSWORD:-pass}
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
\`\`\`

注意上面的 \`\${DB_ROOT_PASSWORD:-rootpass}\`,这是 docker-compose 的变量替换语法——读主机的 \`DB_ROOT_PASSWORD\` 环境变量,没设就用默认值 \`rootpass\`。这里要转义成 \`\${...}\` 防止和 JS 模板字符串冲突。

配套的 \`.env\`:

\`\`\`
# .env(给 docker-compose 用)
DB_ROOT_PASSWORD=strong-root-pass
DB_NAME=mydb
DB_USER=appuser
DB_PASSWORD=strong-app-pass

# 给 FastAPI 用(在容器里读取)
DATABASE_URL=mysql://appuser:strong-app-pass@db:3306/mydb
SECRET_KEY=prod-secret-key
DEBUG=False
\`\`\`

### 58.11 优化镜像的几个技巧

| 技巧 | 效果 |
| --- | --- |
| 用 \`-slim\` 基础镜像 | 比 \`full\` 小 70% |
| 多阶段构建 | 不带编译工具、缓存 |
| \`--no-cache-dir\` 装 pip | 不留缓存 |
| 合并 \`RUN\` 指令 | 减少镜像层数 |
| 用 \`.dockerignore\` | 不打包无用文件 |
| 用 \`alpine\` 镜像(慎用) | 更小但可能有兼容问题 |

### 58.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 不写 \`.dockerignore\` | 镜像大、含 .git 历史 | 写 \`.dockerignore\` |
| 数据库容器没挂卷 | down -v 数据全没 | 必挂命名卷 |
| 数据库端口暴露公网 | 被扫描爆破 | 用 \`127.0.0.1:3306:3306\` |
| 每次改代码都重新 build | 慢 | 分层:先 COPY requirements,后 COPY 代码 |
| 把 .env 打进镜像 | 密钥泄露 | 用 env_file 或环境变量注入 |
| 不设 healthcheck | 数据库没好 app 就起,连不上 | 设 healthcheck + depends_on |

> **本章小结**:Dockerfile 把应用打包成镜像,docker-compose 编排多服务(app+db+redis),数据卷持久化,healthcheck 探活,depends_on 控制启动顺序。生产记得用多阶段构建减小镜像。下一章讲 Nginx 做反向代理。`,
  },

  // =============================================================
  // 第五十九章:Nginx 反向代理
  // =============================================================
  {
    id: 'deploy-nginx',
    group: '部署与运维',
    icon: '🌐',
    title: 'Nginx 反向代理',
    content: `## 第五十九章　Nginx 反向代理

### 59.1 Nginx 是什么

Nginx 是高性能的 Web 服务器 / 反向代理。在 FastAPI 部署架构里,它通常站在最前面:

\`\`\`
用户请求 → Nginx(80/443) → Gunicorn+Uvicorn(8000) → FastAPI
\`\`\`

### 59.2 为什么需要 Nginx

直接让用户访问 Gunicorn 行不行?技术上可以,但有几个问题:

| 能力 | Gunicorn | Nginx |
| --- | --- | --- |
| HTTPS | 难配 | 一行配置 |
| 静态文件 | 慢,占 worker | 极快,直接走文件 |
| 负载均衡 | 单机多 worker,但跨机要靠 Nginx | upstream 多机轮询 |
| 限流 | 应用层做 | ngx_http_limit_req 模块 |
| 缓存 | 应用层做 | 文件缓存,极快 |
| gzip 压缩 | 应用层做 | 更高效 |
| 防慢攻击 | 弱 | 强(超时、限速) |

> 一句话:**Nginx 擅长"门口的活"——接客、分流、挡风,把 FastAPI 解放出来专心做业务**。

### 59.3 最简单的反向代理

把所有请求转发到 FastAPI(假设跑在 8000 端口):

\`\`\`nginx
# /etc/nginx/conf.d/myapp.conf
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
}
\`\`\`

> 注意上面 \`\$host\`、\`\$remote_addr\` 是 Nginx 变量,在文件里写就是这样;但放在 JS 模板字符串里要转义成 \`\$host\` 防止冲突。

**proxy_set_header 的作用**:把真实客户端 IP 传给 FastAPI,否则 FastAPI 看到的都是 \`127.0.0.1\`(Nginx 的 IP)。

### 59.4 负载均衡:upstream

多台 FastAPI 服务器,Nginx 在前面分流:

\`\`\`nginx
# 定义后端服务器池
upstream fastapi_backend {
    server 192.168.1.10:8000 weight=3;   # 权重 3
    server 192.168.1.11:8000 weight=2;   # 权重 2
    server 192.168.1.12:8000 backup;     # 备用,前面挂了才用
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://fastapi_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
\`\`\`

**负载均衡策略**:

| 策略 | 写法 | 说明 |
| --- | --- | --- |
| 轮询(默认) | 啥都不写 | 依次分配 |
| 权重 | \`weight=N\` | 按比例分配 |
| ip_hash | \`ip_hash;\` | 同 IP 固定到一台(会话保持) |
| least_conn | \`least_conn;\` | 分给当前连接最少的 |
| url_hash | 第三方模块 | 同 URL 固定(缓存友好) |

### 59.5 HTTPS 配置

用 Let's Encrypt 免费证书:

\`\`\`bash
# 装 certbot
sudo apt install certbot python3-certbot-nginx

# 自动申请并配置
sudo certbot --nginx -d example.com
\`\`\`

或者手动配:

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    # HTTP 跳 HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
\`\`\`

> 证书 90 天过期,certbot 会自动续期(\`certbot renew\` 加 cron)。

### 59.6 WebSocket 代理

WebSocket 需要 \`Upgrade\` 和 \`Connection\` 头:

\`\`\`nginx
location /ws {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_read_timeout 86400;   # WS 长连接,超时设长点
}
\`\`\`

> 不设 \`Upgrade\` 头,WebSocket 握手会失败,前端报 1006 错误。

### 59.7 静态文件直接 Nginx 处理

图片、CSS、JS 这些不用走 FastAPI,Nginx 直接发:

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    # 静态文件直接 Nginx 处理
    location /static/ {
        alias /var/www/myapp/static/;   # 注意 alias 末尾的 /
        expires 30d;                      # 客户端缓存 30 天
        add_header Cache-Control "public, immutable";
    }

    # 上传的文件
    location /media/ {
        alias /var/www/myapp/media/;
    }

    # 其它走 FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

> **好处**:静态请求根本不打扰 FastAPI,worker 全留给业务用。

### 59.8 限流:防刷

\`\`\`nginx
# 定义限流区:按 IP,每秒 10 个请求
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name example.com;

    location /api/ {
        limit_req zone=mylimit burst=20 nodelay;
        # burst=20:允许瞬间 20 个排队
        # nodelay:不延迟,超出直接 503
        proxy_pass http://127.0.0.1:8000;
    }

    # 登录接口更严格:每秒 1 个
    location /api/login {
        limit_req zone=mylimit burst=5 nodelay;
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

> 限流在 Nginx 做,比在应用层做更早挡住恶意流量,保护后端。

### 59.9 gzip 压缩

\`\`\`nginx
http {
    gzip on;
    gzip_min_length 1k;             # 小于 1KB 不压
    gzip_comp_level 6;              # 压缩级别 1-9
    gzip_types text/plain application/json application/javascript text/css;
    gzip_vary on;
}
\`\`\`

> JSON 接口开了 gzip,响应能小 70%,移动端尤其受益。

### 59.10 完整生产配置示例

\`\`\`nginx
# /etc/nginx/conf.d/myapp.conf

# 后端池
upstream fastapi_backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
}

# 限流区
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;

# HTTP 跳 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://\$host\$request_uri;
}

# HTTPS 主服务
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # 静态文件
    location /static/ {
        alias /var/www/myapp/static/;
        expires 30d;
    }

    # API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://fastapi_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
\`\`\`

### 59.11 在 FastAPI 里拿真实 IP

经过 Nginx 后,FastAPI 默认看到的 IP 是 Nginx 的(127.0.0.1)。要拿真实 IP:

\`\`\`python
# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()

# 信任 Nginx 传来的 X-Forwarded-For
# 用 uvicorn 启动时加 --proxy-headers
# gunicorn 里在 UvicornWorker 配置
\`\`\`

启动时加参数:

\`\`\`bash
# uvicorn 直接跑
uvicorn app.main:app --proxy-headers --forwarded-allow-ips="*"

# gunicorn 配置文件里
# gunicorn.conf.py
import multiprocessing
bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

# uvicorn worker 的额外参数
uvicorn_kwargs = {
    "proxy_headers": True,
    "forwarded_allow_ips": "*",
}
\`\`\`

### 59.12 Nginx vs 直接 FastAPI 对照

| 维度 | 直接 FastAPI | FastAPI + Nginx |
| --- | --- | --- |
| HTTPS | 应用层做,慢 | Nginx 做,快 |
| 静态文件 | 占 worker | 不占 worker |
| 负载均衡 | 单机多 worker | 跨机分流 |
| 限流 | 应用层 | 网关层,更早挡 |
| 复杂度 | 低 | 多一层 |
| 适用 | 小项目、内网 | 生产标准 |

### 59.13 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 不设 \`proxy_set_header\` | FastAPI 看不到真实 IP、Host | 4 个 header 全设 |
| WebSocket 不设 \`Upgrade\` | 握手失败 | 加 Upgrade + Connection |
| \`alias\` 末尾没 \`/\` | 404 | \`location\` 和 \`alias\` 末尾对齐 |
| 证书过期不续 | 浏览器报错 | certbot 自动续期 |
| 改了 nginx.conf 不 reload | 配置没生效 | \`nginx -t && nginx -s reload\` |
| 限流设太严 | 正常用户被挡 | \`burst\` 给够缓冲 |

> **本章小结**:Nginx 做 FastAPI 的反向代理,负责 HTTPS、静态文件、负载均衡、限流、压缩。重点是 \`proxy_pass\` + 4 个 \`proxy_set_header\`,WebSocket 要加 \`Upgrade\` 头。下一章把测试、构建、部署全自动化。`,
  },

  // =============================================================
  // 第六十章:CI/CD 持续集成部署
  // =============================================================
  {
    id: 'deploy-cicd',
    group: '部署与运维',
    icon: '🔄',
    title: 'CI/CD 持续集成部署',
    content: `## 第六十章　CI/CD 持续集成部署

### 60.1 CI/CD 是什么

- **CI(Continuous Integration,持续集成)**:代码一提交,自动跑测试、检查质量,保证不破坏现有功能;
- **CD(Continuous Deployment/Delivery,持续部署/交付)**:测试通过后,自动构建、发布到生产。

**手动部署的痛点**:

- **慢**:每次发版要手动打包、传服务器、重启,半小时起步;
- **易错**:命令敲错一个字符,部署就挂;
- **没保障**:不跑测试就上线,bug 直接进生产;
- **难回滚**:出问题要手动回退版本,慢且容易再错。

> CI/CD 把这套流程写成代码,自动执行:**提交 → 测试 → 构建 → 部署**,全程无人值守,有保障。

### 60.2 GitHub Actions 基础

GitHub Actions 是 GitHub 内置的 CI/CD 工具,在 \`.github/workflows/\` 目录放 YAML 文件,就会自动触发。

核心概念:

- **workflow**:一个 YAML 文件,定义一套流程;
- **job**:一个任务(跑在独立虚拟机里);
- **step**:job 里的步骤;
- **action**:可复用的步骤(像函数)。

### 60.3 最简单的 CI:跑测试

\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # 1. 拉代码
      - uses: actions/checkout@v4

      # 2. 装 Python
      - name: 安装 Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      # 3. 装依赖
      - name: 安装依赖
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov httpx

      # 4. 跑测试 + 覆盖率
      - name: 跑测试
        run: pytest --cov=app --cov-report=xml --cov-report=term

      # 5. 上传覆盖率到 codecov(可选)
      - name: 上传覆盖率
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
\`\`\`

**触发时机**:

- push 到 main/develop:每次提交都跑;
- PR 到 main:每个 PR 都跑,通过才能合并。

### 60.4 构建 Docker 镜像

测试通过后,构建镜像并推到镜像仓库(Docker Hub / 私有 registry):

\`\`\`yaml
# .github/workflows/build.yml
name: 构建并推送镜像

on:
  push:
    branches: [main]
    tags: ["v*"]   # 打 tag 也触发

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 登录 Docker Hub(密码在 GitHub Secrets 里)
      - name: 登录 Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}

      # 提取 metadata(镜像名、tag)
      - name: 提取 metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myname/myapp
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      # 构建并推送
      - name: 构建并推送
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha     # 用 GitHub Actions 缓存加速
          cache-to: type=gha,mode=max
\`\`\`

**关键点**:

- 上面 \`\${{ secrets.XXX }}\` 是 GitHub Actions 的表达式语法,这里要转义成 \`\${{ ... }}\` 防止 JS 模板字符串冲突——实际 YAML 里就是原样 \`\${{ }}\`;
- \`secrets.DOCKER_TOKEN\` 在 GitHub 仓库 Settings → Secrets 里配置,代码里看不到明文;
- 缓存(\`cache-from\`)让二次构建快很多。

### 60.5 部署到服务器

构建完镜像,要部署到生产服务器。常见方式:SSH 到服务器执行 \`docker pull\` + \`docker-compose up\`:

\`\`\`yaml
# .github/workflows/deploy.yml
name: 部署

on:
  workflow_run:
    workflows: ["构建并推送镜像"]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    # 只有构建成功才部署
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: 部署到生产
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /var/www/myapp
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker image prune -f
            # 健康检查
            sleep 10
            curl -f http://localhost:8000/health || exit 1
\`\`\`

**流程**:镜像推到 registry → 触发 deploy workflow → SSH 到生产 → 拉新镜像 → 重启容器 → 健康检查。

### 60.6 完整流水线:测试 → 构建 → 部署

把上面三步合成一个文件:

\`\`\`yaml
# .github/workflows/deploy.yml
name: 完整 CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Job 1:测试(每个 PR 都跑)
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt pytest pytest-cov httpx
      - run: pytest --cov=app --cov-report=term

  # Job 2:构建(只有 main 分支才构建)
  build:
    needs: test   # 测试通过才构建
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: myname/myapp:latest

  # Job 3:部署(构建成功才部署)
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production   # 可以加审批保护
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /var/www/myapp
            docker-compose pull
            docker-compose up -d --remove-orphans
            sleep 10
            curl -f http://localhost:8000/health || exit 1
\`\`\`

**关键**:

- \`needs\` 控制顺序:test → build → deploy;
- \`if\` 控制条件:只在 main 分支构建部署,PR 只测不部署;
- \`environment: production\` 可以在 GitHub 设置里加"人工审批"按钮,点了才部署。

### 60.7 环境隔离

不同环境用不同分支 / 不同 secrets:

\`\`\`
main 分支    → 部署到生产   → secrets.PROD_*
develop 分支 → 部署到预发   → secrets.STAGING_*
其它分支     → 只跑测试     → 不部署
\`\`\`

\`\`\`yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  environment: staging
  ...

deploy-prod:
  if: github.ref == 'refs/heads/main'
  environment: production
  ...
\`\`\`

### 60.8 蓝绿部署

蓝绿部署:同时跑两套环境(蓝、绿),切换路由实现零停机:

\`\`\`
1. 当前流量在"蓝"(旧版本)
2. 部署"绿"(新版本),但不接流量
3. 健康检查"绿"通过后,把流量切到"绿"
4. 观察,没问题就下线"蓝",有问题切回"蓝"
\`\`\`

用 Nginx 切换:

\`\`\`nginx
# 切换前:流量到 blue
upstream backend {
    server blue:8000;
    # server green:8000 backup;
}

# 切换后:流量到 green
upstream backend {
    # server blue:8000 backup;
    server green:8000;
}
\`\`\`

> \`nginx -s reload\` 切换,秒级,无停机。

### 60.9 滚动更新

Kubernetes / Docker Swarm 原生支持滚动更新:一次替换一个 Pod,逐步替换:

\`\`\`yaml
# k8s deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 最多多启 1 个
      maxUnavailable: 0  # 不允许少,保证容量
\`\`\`

> 比 docker-compose 简单的 \`up -d\` 更精细(那个是先停旧再起新,有短暂中断)。

### 60.10 回滚机制

部署出问题要能快速回滚:

**方式一:Docker tag 回滚**

\`\`\`bash
# 部署时给每个版本打 tag(用 commit sha)
docker tag myapp:latest myapp:abc123
docker push myapp:abc123

# 出问题,切回上个版本
docker pull myapp:abc123
# 改 docker-compose.yml 用 abc123 tag
docker-compose up -d
\`\`\`

**方式二:GitHub Actions 手动触发回滚**

\`\`\`yaml
  rollback:
    if: github.event.inputs.action == 'rollback'
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.PROD_USER }}
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /var/www/myapp
            # 切回上个镜像 tag
            sed -i 's/myapp:latest/myapp:prev/g' docker-compose.yml
            docker-compose up -d
\`\`\`

> 关键:**永远保留至少一个旧版本镜像**,出问题能立刻切回。别只留 \`latest\`,回滚没东西切。

### 60.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| secret 写在代码里 | 泄露 | 用 GitHub Secrets |
| 部署不做健康检查 | 坏版本上线没发现 | 部署后 curl /health |
| 不留旧版本镜像 | 没法回滚 | 每次部署打 commit tag |
| PR 不跑测试就合并 | 坏代码进 main | 开分支保护,必过 CI |
| deploy 没 \`needs\` | 测试没过就部署 | 加 \`needs: test\` |
| 缓存没开 | 构建慢 | \`cache-from\` 加速 |
| 全自动部署到生产 | 误操作直接上线 | 加 \`environment: production\` 审批 |

> **本章小结**:GitHub Actions 把测试、构建、部署串成流水线——\`push\` 触发测试,过测才构建镜像,构建成功才部署。用 \`needs\` 控制顺序,\`environment\` 加审批,镜像 tag 化支持回滚。蓝绿/滚动更新实现零停机。部署这批到此结束,下一批进入实战项目。`,
  },
];
