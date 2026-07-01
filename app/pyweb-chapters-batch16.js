// =============================================================
// Python Web 应用开发实战 - 第十六批章节(部署与实战,共 4 章)
// 章节 61-64:WSGI 部署 Gunicorn+Nginx / Docker 容器化 / 静态文件与CDN / 实战完整博客系统
// =============================================================

export const chapters = [
  // =============================================================
  // 第六十一章:WSGI 部署:Gunicorn + Nginx
  // =============================================================
  {
    id: 'deploy-wsgi',
    group: '部署与实战',
    icon: '🚀',
    title: 'WSGI 部署:Gunicorn + Nginx',
    content: `## 第六十一章　WSGI 部署:Gunicorn + Nginx

### 61.1 为什么不能直接用开发服务器

开发时跑 Flask/Django 都用 \`flask run\` 或 \`python manage.py runserver\`,这些是**开发服务器**,绝不能上生产:

| 问题 | 开发服务器 | 生产需求 |
| --- | --- | --- |
| 并发模型 | 单线程/单进程 | 多 worker,并发处理 |
| 性能 | 慢,只为调试方便 | 高吞吐 |
| 稳定性 | 挂了不自动重启 | 进程崩溃自动拉起 |
| SSL | 不支持 | 要 HTTPS |
| 静态文件 | 走 Python,慢 | Nginx 直接发 |
| 进程管理 | 无 | systemd/supervisor 管理 |

所以生产部署的标准组合是:**应用服务器(Gunicorn) + 反向代理(Nginx) + 进程管理(systemd)**。

### 61.2 Gunicorn 部署

Gunicorn(Green Unicorn)是 Python WSGI 应用服务器,用预 fork 多 worker 进程处理并发:

\`\`\`bash
pip install gunicorn

# 启动:4 个 worker,监听 0.0.0.0:8000
# myproject.wsgi:application 是 Django 的 WSGI 应用路径
gunicorn -w 4 -b 0.0.0.0:8000 myproject.wsgi:application
\`\`\`

Flask 也类似:

\`\`\`bash
# myapp.py 里有 app = Flask(__name__)
gunicorn -w 4 -b 0.0.0.0:8000 myapp:app
\`\`\`

常用参数:

| 参数 | 含义 |
| --- | --- |
| -w 4 | 启动 4 个 worker 进程 |
| -b 0.0.0.0:8000 | 监听地址和端口 |
| --timeout 30 | 请求超时 30 秒 |
| --access-logfile - | 访问日志输出到控制台 |
| --error-logfile - | 错误日志输出到控制台 |
| --daemon | 后台运行 |
| --reload | 代码改动自动重启(开发用,生产别用) |

### 61.3 worker 配置:sync / gevent / uvicorn

Gunicorn 的 worker 类型决定了它的并发模型:

| worker | 模型 | 适合 |
| --- | --- | --- |
| sync(默认) | 同步,一个 worker 一个请求 | CPU 密集、普通业务 |
| gevent | 协程,单 worker 能并发成千上万连接 | I/O 密集、长连接、WebSocket |
| uvicorn | ASGI worker | FastAPI、Django Channels 这类异步框架 |

\`\`\`bash
# 同步 worker(默认,适合 Flask/Django 同步应用)
gunicorn -w 4 -b 0.0.0.0:8000 myapp:app

# gevent worker(适合 I/O 密集,单 worker 能扛几千并发)
gunicorn -w 4 -k gevent --worker-connections 1000 myapp:app

# uvicorn worker(FastAPI 这类 ASGI 应用)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker myapp:app
\`\`\`

> 经验:worker 数量一般设 \`CPU 核数 * 2 + 1\`。比如 4 核服务器设 9 个 worker。

### 61.4 Nginx 反向代理

为什么前面要套一层 Nginx?它干了几件 Gunicorn 干不好的事:
- **缓冲请求/响应**:慢客户端不会拖垮 Gunicorn;
- **静态文件服务**:静态文件 Nginx 直接发,不进 Python;
- **SSL 终结**:HTTPS 在 Nginx 解密,Gunicorn 只跑 HTTP;
- **负载均衡**:多台 Gunicorn 之间分发;
- **限流、压缩、缓存**:各种 HTTP 层优化。

### 61.5 Nginx 配置

一个典型的反向代理配置:

\`\`\`nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name example.com;

    # 静态文件:直接由 Nginx 发,不进 Python
    location /static/ {
        alias /var/www/myapp/static/;
        expires 30d;  # 浏览器缓存 30 天
    }

    # 媒体文件(用户上传)
    location /media/ {
        alias /var/www/myapp/media/;
    }

    # 其他请求转发给 Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;  # Gunicorn 监听地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

> 注意:上面 Nginx 配置里有 \`$host\`、\`$remote_addr\` 这些是 Nginx 变量,**不是 JS 模板字符串**。这里它们出现在 Nginx 配置代码块里(被反引号转义了),不会被 JS 解释。

### 61.6 HTTPS 配置(certbot / Let's Encrypt)

生产必须 HTTPS。Let's Encrypt 提供免费证书,\`certbot\` 一键申请和续期:

\`\`\`bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 自动修改 Nginx 配置加 HTTPS
sudo certbot --nginx -d example.com -d www.example.com

# 测试自动续期(证书 90 天到期,certbot 会自动续)
sudo certbot renew --dry-run
\`\`\`

certbot 会自动把上面的 80 端口配置改成 443 + 重定向:

\`\`\`nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location /static/ { alias /var/www/myapp/static/; }
    location / {
        proxy_pass http://127.0.0.1:8000;
        # ... 其他 proxy_set_header
    }
}

# 80 自动重定向到 443
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
\`\`\`

### 61.7 systemd 服务管理

让 Gunicorn 像系统服务一样:开机自启、崩溃自动重启。写一个 systemd unit:

\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=MyApp Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
# 启动命令
ExecStart=/var/www/myapp/venv/bin/gunicorn \\
          -w 4 -b 127.0.0.1:8000 \\
          --access-logfile - --error-logfile - \\
          myapp.wsgi:application
# 崩溃自动重启
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
# 启用并启动
sudo systemctl daemon-reload
sudo systemctl enable myapp      # 开机自启
sudo systemctl start myapp       # 启动
sudo systemctl status myapp      # 查状态
sudo systemctl restart myapp     # 重启(改代码后)
sudo journalctl -u myapp -f      # 看日志
\`\`\`

### 61.8 完整 Nginx + Gunicorn 配置示例

把所有东西拼起来,一个 Flask 项目的完整部署:

**目录结构**:

\`\`\`text
/var/www/myapp/
├── venv/              # 虚拟环境
├── app.py             # Flask 应用
├── requirements.txt
├── static/            # 静态文件
└── media/             # 用户上传
\`\`\`

**Gunicorn 启动脚本** \`/etc/systemd/system/myapp.service\`(见上一节)。

**Nginx 配置**:

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    client_max_body_size 10M;  # 上传文件最大 10M

    location /static/ {
        alias /var/www/myapp/static/;
        expires 30d;
        access_log off;          # 静态文件不记日志
    }

    location /media/ {
        alias /var/www/myapp/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
\`\`\`

**部署流程**:

\`\`\`bash
# 1. 拉代码
cd /var/www/myapp && git pull

# 2. 装依赖
venv/bin/pip install -r requirements.txt

# 3. 迁移数据库
venv/bin/flask db upgrade   # 或 python manage.py migrate

# 4. 重启 Gunicorn
sudo systemctl restart myapp

# 5. 重载 Nginx 配置(改了 nginx 配置才需要)
sudo nginx -t && sudo systemctl reload nginx
\`\`\`

### 61.9 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 生产用 \`flask run\` | 并发上不去,易崩 | 用 Gunicorn |
| Gunicorn 直接监听 80 对外 | 没有 SSL、没有缓冲 | Gunicorn 监听 127.0.0.1,Nginx 对外 |
| worker 数设太多 | 进程互抢 CPU | CPU 核数 * 2 + 1 |
| Nginx 没设 client_max_body_size | 上传大文件 413 | 设合适上限 |
| 没用 systemd | 进程崩了不重启 | 用 systemd 或 supervisor |
| 证书过期忘了续 | 网站无法访问 | certbot 自动续期 |
| Gunicorn 用 root 跑 | 安全风险 | 用 www-data 这种普通用户 |

> **本章小结**:生产部署标准组合 = Gunicorn(应用服务器) + Nginx(反向代理 + 静态 + SSL) + systemd(进程管理) + certbot(HTTPS)。下一章讲用 Docker 把这套打包成可复制的镜像。`,
  },

  // =============================================================
  // 第六十二章:Docker 容器化部署
  // =============================================================
  {
    id: 'deploy-docker',
    group: '部署与实战',
    icon: '🐳',
    title: 'Docker 容器化部署',
    content: `## 第六十二章　Docker 容器化部署

### 62.1 Docker 是什么

Docker 是**容器化**工具:把你的应用 + 依赖 + 系统库打包成一个"镜像",这个镜像能在任何装了 Docker 的机器上以完全一致的方式运行。

它解决了一个经典痛点:"在我电脑上能跑啊!"。容器保证开发、测试、生产**环境完全一致**:
- Python 版本一样;
- 依赖版本一样;
- 系统库一样;
- 环境变量一样。

| 概念 | 类比 | 说明 |
| --- | --- | --- |
| 镜像(Image) | 类的定义 | 只读模板,包含运行所需的一切 |
| 容器(Container) | 类的实例 | 镜像跑起来的实例,可启停 |
| 仓库(Registry) | 应用商店 | 存放镜像,Docker Hub 是公共仓库 |
| Dockerfile | 食谱 | 描述怎么构建镜像的指令文件 |

### 62.2 Flask Dockerfile

一个 Flask 应用的 Dockerfile:

\`\`\`dockerfile
# 基础镜像:Python 3.11 slim 版(比完整版小很多)
FROM python:3.11-slim

# 设工作目录(后续命令都在这下面)
WORKDIR /app

# 设环境变量:Python 不缓冲输出,日志实时可见
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1

# 先单独复制依赖文件,利用 Docker 缓存层(代码变了不用重装依赖)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制项目代码
COPY . .

# 暴露端口(只是声明,实际映射用 -p)
EXPOSE 8000

# 启动命令:用 Gunicorn 跑
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "myapp:app"]
\`\`\`

> 关键技巧:**先 COPY requirements.txt 装 dependency,再 COPY 代码**。这样代码变了,Docker 缓存还能复用,不用每次重装依赖。

### 62.3 Django Dockerfile

\`\`\`dockerfile
FROM python:3.11-slim

# 系统依赖(PostgreSQL 客户端需要)
RUN apt-get update && apt-get install -y \\
    libpq-dev gcc \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic 把静态文件收集到 STATIC_ROOT
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "myproject.wsgi:application"]
\`\`\`

### 62.4 .dockerignore

像 .gitignore,告诉 Docker 哪些文件**不要**进镜像,减小体积、避免泄露:

\`\`\`text
# .dockerignore
__pycache__
*.pyc
.git
.env                # 别把密钥打进镜像!
venv/
*.sqlite3
node_modules
\`\`\`

### 62.5 docker build / run

\`\`\`bash
# 构建镜像,-t 给个名字和标签
docker build -t myapp:1.0 .

# 查看本地镜像
docker images

# 运行容器
# -d 后台跑;-p 把容器 8000 端口映射到宿主机 8000
# --name 给容器起个名;-e 传环境变量
docker run -d -p 8000:8000 --name myapp -e SECRET_KEY=xxx myapp:1.0

# 看正在跑的容器
docker ps

# 看容器日志
docker logs -f myapp

# 进容器里调试
docker exec -it myapp bash

# 停止并删除
docker stop myapp && docker rm myapp
\`\`\`

### 62.6 docker-compose(多服务)

真实应用一般不止一个服务:Web + 数据库 + 缓存 + Nginx。docker-compose 用一个 YAML 描述多服务,一条命令全启动:

\`\`\`yaml
# docker-compose.yml
version: "3.8"

services:
  # Web 应用
  web:
    build: .                     # 用当前目录 Dockerfile 构建
    command: gunicorn -w 4 -b 0.0.0.0:8000 myapp:app
    volumes:
      - .:/app                   # 代码挂载,改了不用重建镜像(开发用)
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=\${SECRET_KEY}  # 从 .env 文件读
    depends_on:
      - db
      - redis

  # 数据库
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data  # 数据持久化

  # 缓存
  redis:
    image: redis:7-alpine

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"
    depends_on:
      - web

volumes:
  pgdata:  # 声明数据卷,容器删了数据还在
\`\`\`

> 注意上面 \`\${SECRET_KEY}\` 是 docker-compose 的变量插值(从 .env 读)。因为本文件是 JS 模板字符串,这里的 \`$\` 被转义成 \`\${...}\`,JS 不会把它当插值,渲染出来还是 docker-compose 能识别的 \`\${SECRET_KEY}\`。

\`\`\`bash
# 一条命令启动所有服务
docker-compose up -d

# 看日志
docker-compose logs -f web

# 停止并删容器(数据卷保留)
docker-compose down

# 停止并删数据卷(数据库数据会没!)
docker-compose down -v
\`\`\`

### 62.7 端口映射和数据卷

**端口映射**:\`-p 宿主机端口:容器端口\`。访问宿主机 8000 就是访问容器 8000。

\`\`\`bash
docker run -p 8000:8000 myapp        # 宿主机 8000 → 容器 8000
docker run -p 127.0.0.1:5432:5432 db # 只本机能访问,更安全
\`\`\`

**数据卷(Volume)**:容器删了数据会没,重要数据(数据库、上传文件)必须挂卷持久化:

\`\`\`bash
# 命名卷
docker run -v pgdata:/var/lib/postgresql/data db

# 绑定挂载(把宿主机目录映射进容器)
docker run -v /var/uploads:/app/uploads myapp
\`\`\`

### 62.8 环境变量(.env)

敏感信息(密钥、数据库密码)别写进 Dockerfile 和 git,用 \`.env\` 文件:

\`\`\`text
# .env(别提交到 git!)
SECRET_KEY=abc123
DATABASE_URL=postgresql://user:pass@db:5432/myapp
DEBUG=False
\`\`\`

docker-compose 自动读 \`.env\`,在 yaml 里用 \`\${VAR}\` 引用。

### 62.9 多阶段构建(减小镜像)

一个 Dockerfile 里分多个阶段,最终镜像只保留最后阶段的内容,中间编译工具不进最终镜像:

\`\`\`dockerfile
# 阶段 1:装依赖(带编译工具)
FROM python:3.11 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# 阶段 2:运行(只复制装好的依赖,不带编译器)
FROM python:3.11-slim
WORKDIR /app
# 从 builder 阶段复制装好的包
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "myapp:app"]
\`\`\`

> 注意 \`$PATH\` 是 shell 变量。这里它出现在 Dockerfile 代码块里被反引号转义了。

效果:最终镜像比单阶段小一半以上,且不含 gcc 这类只在构建时需要的工具,更安全。

### 62.10 完整示例:Flask + MySQL + Redis 的 docker-compose

\`\`\`yaml
# docker-compose.yml
version: "3.8"

services:
  web:
    build: .
    restart: unless-stopped       # 崩溃自动重启
    command: >
      gunicorn -w 4 -b 0.0.0.0:8000
      --access-logfile - --error-logfile -
      myapp:app
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=\${SECRET_KEY}
      - SQLALCHEMY_DATABASE_URI=mysql://root:rootpass@db/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: myapp
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
\`\`\`

配套的 \`.env\`:

\`\`\`text
SECRET_KEY=change-me-in-prod
\`\`\`

\`\`\`bash
# 启动整个栈
docker-compose up -d --build

# 跑数据库迁移
docker-compose exec web flask db upgrade

# 创建管理员
docker-compose exec web flask create-admin
\`\`\`

### 62.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 把 .env / 密钥打进镜像 | 密钥泄露 | .dockerignore 排除,运行时挂载 |
| 镜像太大 | 拉取慢,占空间 | 用 slim 基础镜像 + 多阶段构建 |
| 数据库数据没挂卷 | 容器删了数据没了 | 用命名卷持久化 |
| Dockerfile 里 COPY 代码在 pip install 前 | 改一行代码就重装依赖 | 先 COPY requirements,再 COPY 代码 |
| 容器里用 root 跑 | 安全风险 | Dockerfile 里建普通用户切换 |
| depends_on 不等健康检查 | Web 起来时 DB 还没好 | 配 healthcheck + condition: service_healthy |
| 生产用绑定挂载代码 | 改了容器内才生效,不可复现 | 生产只挂卷数据,代码进镜像 |

> **本章小结**:Docker 把应用和环境打包成镜像,保证开发生产一致。Dockerfile 描述怎么构建,docker-compose 编排多服务,数据卷持久化,多阶段构建减小镜像。下一章讲静态文件怎么和 CDN 配合加速。`,
  },

  // =============================================================
  // 第六十三章:静态文件与 CDN
  // =============================================================
  {
    id: 'deploy-static',
    group: '部署与实战',
    icon: '📁',
    title: '静态文件与 CDN',
    content: `## 第六十三章　静态文件与 CDN

### 63.1 静态文件是什么

Web 应用里除了动态生成的 HTML,还有一类**不变的文件**直接发给浏览器:

- CSS(样式表)
- JavaScript(脚本)
- 图片、图标
- 字体文件

这些文件**不经过 Python 处理**,服务器直接读磁盘发出去就行。处理它们的速度直接决定页面加载快慢。

### 63.2 Flask static 目录

Flask 默认在应用目录下的 \`static/\` 提供静态文件,URL 是 \`/static/<文件名>\`:

\`\`\`text
myapp/
├── app.py
├── templates/
└── static/
    ├── css/style.css      → /static/css/style.css
    ├── js/main.js         → /static/js/main.js
    └── img/logo.png       → /static/img/logo.png
\`\`\`

模板里用 \`url_for\` 生成 URL(开发用 Flask,生产用 Nginx/CDN 时只改这一处):

\`\`\`html
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
<script src="{{ url_for('static', filename='js/main.js') }}"></script>
\`\`\`

> 开发时 Flask 自己发静态文件够用;生产时静态请求让 Nginx 直接发,不进 Python(下一节)。

### 63.3 Django STATICFILES_DIRS / collectstatic

Django 把"开发用的源目录"和"收集后的发布目录"分开:

\`\`\`python
# settings.py
STATIC_URL = "/static/"                       # URL 前缀
STATICFILES_DIRS = [BASE_DIR / "static"]      # 开发时静态文件源目录
STATIC_ROOT = BASE_DIR / "staticfiles"        # collectstatic 收集到这里(生产用)
\`\`\`

开发时 \`django.contrib.staticfiles\` 自动从 \`STATICFILES_DIRS\` 提供文件。生产时跑:

\`\`\`bash
python manage.py collectstatic
\`\`\`

它把所有 app 的 static、\`STATICFILES_DIRS\` 里的文件,统一收集到 \`STATIC_ROOT\`,然后由 Nginx 直接发这个目录。

模板里同样用 \`{% static %}\`:

\`\`\`html
{% load static %}
<link rel="stylesheet" href="{% static 'css/style.css' %}">
<script src="{% static 'js/main.js' %}"></script>
\`\`\`

### 63.4 WhiteNoise(纯 Python 静态文件服务)

如果不想配 Nginx(比如部署在 Heroku、Vercel 这种 PaaS),用 **WhiteNoise**:纯 Python 实现的静态文件服务,加进 WSGI 中间件就行,性能不如 Nginx 但够用:

\`\`\`bash
pip install whitenoise
\`\`\`

\`\`\`python
# Django settings.py 的 MIDDLEWARE 顶部加
MIDDLEWARE = [
    "whiteshoe.middleware.WhiteNoiseMiddleware",
    # ... 其他中间件
]

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
\`\`\`

WhiteNoise 自动 gzip 压缩 + 给文件名加 hash。

### 63.5 Nginx 直接服务静态(高效)

生产首选:Nginx 直接发静态文件,完全绕过 Python。Nginx 用 \`sendfile\` 系统调用,性能极高:

\`\`\`nginx
location /static/ {
    alias /var/www/myapp/staticfiles/;  # Django collectstatic 后的目录
    expires 30d;                          # 浏览器缓存 30 天
    add_header Cache-Control "public, immutable";
    access_log off;                       # 静态文件不记日志,省 IO
}
\`\`\`

### 63.6 CDN(内容分发网络)

CDN 是一组分布在全国/全球的缓存服务器。用户访问你的网站时,静态文件从**离他最近的 CDN 节点**发,不用都回你的源站:

- **加速**:就近访问,延迟低;
- **减负**:源站不用自己发静态,只服务动态请求;
- **抗流量峰值**:CDN 扛住突发流量。

使用流程:把静态文件上传到对象存储(阿里 OSS/七牛云/AWS S3),CDN 回源到对象存储,前端把静态 URL 改成 CDN 域名。

### 63.7 阿里 OSS / 七牛云 配置

以阿里 OSS 为例:

\`\`\`bash
# 用 ossutil 把 static 目录上传到 OSS
ossutil cp -r staticfiles/ oss://my-bucket/static/ --recursive
\`\`\`

OSS 配置成 CDN 回源,然后静态文件 URL 指向 CDN 域名:

\`\`\`text
https://cdn.example.com/static/css/style.css
\`\`\`

### 63.8 Django 配置 CDN 域名

最简单:改 \`STATIC_URL\`:

\`\`\`python
# settings.py
STATIC_URL = "https://cdn.example.com/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
\`\`\`

\`{% static %}\` 模板标签生成的 URL 自动带 CDN 域名:

\`\`\`html
<link href="https://cdn.example.com/static/css/style.css">
\`\`\`

更高级:用 \`django-storages\` 让 collectstatic 直接传到 OSS/S3,不用手动上传:

\`\`\`bash
pip install django-storages
\`\`\`

\`\`\`python
# settings.py
INSTALLED_APPS = [..., "storages"]

STATICFILES_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_ACCESS_KEY_ID = "xxx"
AWS_SECRET_ACCESS_KEY = "xxx"
AWS_STORAGE_BUCKET_NAME = "my-bucket"
AWS_S3_CUSTOM_DOMAIN = "cdn.example.com"
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
\`\`\`

现在 \`python manage.py collectstatic\` 会**直接传到 OSS**,本地不留文件。

### 63.9 静态文件版本控制(文件 hash)

浏览器会缓存静态文件。问题:你改了 \`style.css\`,但浏览器还用旧的缓存,用户看不到新样式。

解决方案:**给文件名加 hash**。\`style.css\` 变成 \`style.a3f9b2.css\`,内容一变 hash 就变,文件名变了,浏览器会重新请求。

Django 用 ManifestStaticFilesStorage 自动做:

\`\`\`python
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
\`\`\`

collectstatic 后会生成 \`style.css\` 和 \`style.a3f9b2.css\` 两份,模板里 \`{% static %}\` 自动引用带 hash 的版本:

\`\`\`html
<!-- 模板渲染后 -->
<link href="/static/style.a3f9b2.css">
\`\`\`

Flask 可以用 \`Flask-Assets\` 或前端构建工具(Vite/Webpack)做同样的事。

### 63.10 完整示例:Django collectstatic + Nginx

完整生产配置:

**settings.py**:

\`\`\`python
STATIC_URL = "/static/"
STATIC_ROOT = "/var/www/myapp/staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
\`\`\`

**部署脚本**:

\`\`\`bash
# 1. 收集静态文件(会自动加 hash)
python manage.py collectstatic --noinput

# 2. 把权限给 Nginx
chown -R www-data:www-data /var/www/myapp/staticfiles
\`\`\`

**Nginx 配置**:

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL 证书
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 静态文件:Nginx 直接发
    location /static/ {
        alias /var/www/myapp/staticfiles/;
        expires 1y;                              # 缓存 1 年(因为文件名带 hash)
        add_header Cache-Control "public, immutable";  # immutable 告诉浏览器不用验证
        access_log off;
    }

    # 媒体文件(用户上传)
    location /media/ {
        alias /var/www/myapp/media/;
        expires 7d;
    }

    # 动态请求转 Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

> 关键:\`expires 1y\` + \`immutable\` 是因为文件名带 hash——内容没变文件名就不会变,缓存一年也安全;内容变了 hash 变,文件名变,浏览器自然重新请求。

### 63.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 生产用 Flask/Django 发静态文件 | 慢,拖累动态请求 | Nginx 直接发 |
| 改了 CSS 但浏览器用旧版 | 用户看不到新样式 | 文件名加 hash |
| collectstatic 没跑 | Nginx 找不到文件 | 部署脚本里跑 |
| 静态文件没设缓存头 | 每次都重新下载 | expires + Cache-Control |
| 媒体文件和静态文件混一起 | 难管理 | static / media 分开 |
| CDN 没配 HTTPS | 混合内容被浏览器拦 | CDN 也要 HTTPS |

> **本章小结**:生产环境静态文件走 Nginx 或 CDN,不走 Python;用文件 hash 解决缓存更新问题;collectstatic + ManifestStorage 自动化整个流程;CDN 加速全球访问。下一章是一个完整博客系统的实战总结。`,
  },

  // =============================================================
  // 第六十四章:实战:完整博客系统
  // =============================================================
  {
    id: 'practice-blog',
    group: '部署与实战',
    icon: '📚',
    title: '实战:完整博客系统',
    content: `## 第六十四章　实战:完整博客系统

### 64.1 需求分析

把前 63 章学的整合成一个完整项目——博客系统。先理清要做什么:

| 功能模块 | 具体能力 |
| --- | --- |
| 用户认证 | 注册、登录、登出、修改密码 |
| 文章管理 | 发布、编辑、删除、列表、详情、草稿/发布 |
| 评论 | 文章下评论、回复评论(树形) |
| 标签 | 文章打标签、按标签筛选 |
| 搜索 | 按标题/正文搜索文章 |
| 分页 | 列表分页 |
| 文件上传 | 文章封面图 |
| 权限 | 作者只能改自己的文章;管理员能改所有人 |

### 64.2 技术选型

两条路线对比:

| 方案 | 栈 | 优点 | 适合 |
| --- | --- | --- | --- |
| Flask 路线 | Flask + SQLAlchemy + Jinja2 + Flask-Login | 轻量灵活,组件自选 | 想精细控制每一层 |
| Django 路线 | Django 全栈(ORM/模板/认证/Admin) | 开箱即用,自带 Admin 后台 | 快速做出能用的系统 |

下面用 **Django** 讲解,因为它开箱即用,代码更紧凑;Flask 思路一致,只是要自己拼更多组件。

### 64.3 项目结构

\`\`\`text
blog/
├── manage.py
├── blog/                    # 项目配置
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── posts/                   # 文章 app
│   ├── models.py            # User/Post/Comment/Tag 模型
│   ├── views.py             # 视图
│   ├── forms.py             # 表单
│   ├── urls.py              # 路由
│   ├── admin.py             # Admin 后台
│   └── templates/posts/     # 模板
├── accounts/                # 用户 app
├── static/                  # 静态文件
├── media/                   # 上传文件
├── templates/               # 全局模板(base.html)
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
\`\`\`

### 64.4 数据模型

\`\`\`python
# posts/models.py
from django.db import models
from django.contrib.auth.models import User

class Tag(models.Model):
    """标签"""
    name = models.CharField("标签名", max_length=30, unique=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    """文章"""
    STATUS_CHOICES = [
        ("draft",     "草稿"),
        ("published", "已发布"),
    ]
    title       = models.CharField("标题", max_length=200)
    slug        = models.SlugField("URL 别名", unique=True)
    content     = models.TextField("正文")
    cover       = models.ImageField("封面图", upload_to="covers/", blank=True)
    status      = models.CharField("状态", max_length=10, choices=STATUS_CHOICES, default="draft")
    author      = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    tags        = models.ManyToManyField(Tag, blank=True, related_name="posts")
    created_at  = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at  = models.DateTimeField("更新时间", auto_now=True)
    published_at= models.DateTimeField("发布时间", null=True, blank=True)

    class Meta:
        ordering = ["-published_at"]   # 默认按发布时间倒序

    def __str__(self):
        return self.title

class Comment(models.Model):
    """评论(支持回复,用 parent 自关联成树)"""
    post     = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author   = models.ForeignKey(User, on_delete=models.CASCADE)
    parent   = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies")
    content  = models.TextField("评论内容")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author}: {self.content[:20]}"
\`\`\`

> 注意 \`f"{self.author}: {self.content[:20]}"\` 是 Python f-string,**没有 \`$\`**,不会和 JS 模板字符串冲突。

### 64.5 表单

\`\`\`python
# posts/forms.py
from django import forms
from .models import Post, Comment

class PostForm(forms.ModelForm):
    """文章表单"""
    class Meta:
        model = Post
        fields = ["title", "slug", "content", "cover", "status", "tags"]

    def clean_title(self):
        title = self.cleaned_data["title"]
        if len(title) < 5:
            raise forms.ValidationError("标题太短,至少 5 个字")
        return title

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["content"]
        widgets = {"content": forms.Textarea(attrs={"rows": 3})}
\`\`\`

### 64.6 视图(路由 + 视图)

\`\`\`python
# posts/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import Post, Comment, Tag
from .forms import PostForm, CommentForm

def post_list(request):
    """文章列表(分页 + 标签筛选 + 搜索)"""
    posts = Post.objects.filter(status="published")

    # 搜索:按标题或正文模糊匹配
    q = request.GET.get("q")
    if q:
        posts = posts.filter(title__icontains=q) | posts.filter(content__icontains=q)

    # 标签筛选
    tag = request.GET.get("tag")
    if tag:
        posts = posts.filter(tags__name=tag)

    # 分页:每页 10 篇
    paginator = Paginator(posts, 10)
    page = request.GET.get("page")
    posts = paginator.get_page(page)

    return render(request, "posts/list.html", {"posts": posts, "q": q, "tag": tag})

def post_detail(request, slug):
    """文章详情 + 评论"""
    post = get_object_or_404(Post, slug=slug, status="published")
    comments = post.comments.filter(parent__isnull=True)  # 顶级评论
    if request.method == "POST":
        # 已登录才能评论
        if not request.user.is_authenticated:
            return redirect("login")
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.author = request.user
            comment.save()
            return redirect("post_detail", slug=slug)
    else:
        form = CommentForm()
    return render(request, "posts/detail.html", {"post": post, "comments": comments, "form": form})

@login_required
def post_create(request):
    """新建文章(只有登录用户)"""
    if request.method == "POST":
        form = PostForm(request.POST, request.FILES)  # FILES 处理封面图
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            form.save_m2m()  # 保存多对多(tags)
            return redirect("post_detail", slug=post.slug)
    else:
        form = PostForm()
    return render(request, "posts/form.html", {"form": form})

@login_required
def post_edit(request, slug):
    """编辑文章(只能改自己的)"""
    post = get_object_or_404(Post, slug=slug)
    if post.author != request.user:        # 权限:不是作者不能改
        return redirect("post_detail", slug=slug)
    if request.method == "POST":
        form = PostForm(request.POST, request.FILES, instance=post)
        if form.is_valid():
            form.save()
            return redirect("post_detail", slug=slug)
    else:
        form = PostForm(instance=post)
    return render(request, "posts/form.html", {"form": form})
\`\`\`

### 64.7 模板

\`\`\`html
<!-- templates/base.html:全局骨架 -->
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}博客{% endblock %}</title>
  <link rel="stylesheet" href="{% static 'css/style.css' %}">
</head>
<body>
  <nav>
    <a href="{% url 'post_list' %}">首页</a>
    {% if user.is_authenticated %}
      <a href="{% url 'post_create' %}">写文章</a>
      <a href="{% url 'logout' %}">登出 ({{ user.username }})</a>
    {% else %}
      <a href="{% url 'login' %}">登录</a>
    {% endif %}
  </nav>
  {% block content %}{% endblock %}
</body>
</html>
\`\`\`

\`\`\`html
<!-- posts/list.html:列表 + 分页 -->
{% extends "base.html" %}
{% block content %}
  <form method="get">
    <input name="q" value="{{ q|default_if_none:'' }}" placeholder="搜索文章">
    <button>搜</button>
  </form>

  {% for post in posts %}
    <article>
      <h2><a href="{% url 'post_detail' slug=post.slug %}">{{ post.title }}</a></h2>
      {% if post.cover %}
        <img src="{{ post.cover.url }}" width="200">
      {% endif %}
      <p>{{ post.content|truncatewords:30 }}</p>
      <small>by {{ post.author.username }} · {{ post.published_at|date:"Y-m-d" }}</small>
      {% for tag in post.tags.all %}
        <a href="?tag={{ tag.name }}">#{{ tag.name }}</a>
      {% endfor %}
    </article>
  {% empty %}
    <p>没有文章</p>
  {% endfor %}

  <!-- 分页 -->
  {% if posts.has_other_pages %}
    <nav class="pagination">
      {% if posts.has_previous %}
        <a href="?page={{ posts.previous_page_number }}">上一页</a>
      {% endif %}
      <span>{{ posts.number }} / {{ posts.paginator.num_pages }}</span>
      {% if posts.has_next %}
        <a href="?page={{ posts.next_page_number }}">下一页</a>
      {% endif %}
    </nav>
  {% endif %}
{% endblock %}
\`\`\`

### 64.8 文件上传(封面图)

模型里 \`cover = ImageField(upload_to="covers/")\` 已经处理了上传。要注意:

- \`request.FILES\` 必须传给 form:\`PostForm(request.POST, request.FILES)\`;
- 模板 form 要 \`enctype="multipart/form-data"\`:

\`\`\`html
<form method="post" enctype="multipart/form-data">
  {% csrf_token %}
  {{ form.as_p }}
  <button>保存</button>
</form>
\`\`\`

- \`settings.py\` 配 MEDIA:

\`\`\`python
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
\`\`\`

- \`urls.py\` 开发时提供 media:

\`\`\`python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
\`\`\`

### 64.9 搜索(简单 like 或 Whoosh)

**简单搜索**(用 ORM 的 icontains,适合小数据量):

\`\`\`python
posts = Post.objects.filter(title__icontains=q) | Post.objects.filter(content__icontains=q)
\`\`\`

**全文搜索**(数据量大时,用 Whoosh/Haystack/Elasticsearch):

\`\`\`bash
pip install django-haystack whoosh
\`\`\`

\`\`\`python
# settings.py
HAYSTACK_CONNECTIONS = {
    "default": {"ENGINE": "haystack.backends.whoosh_backend.WhooshEngine"},
}
\`\`\`

\`\`\`python
# search_indexes.py
from haystack import indexes
from .models import Post

class PostIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    def get_model(self):
        return Post
\`\`\`

\`\`\`bash
python manage.py rebuild_index  # 建索引
\`\`\`

### 64.10 部署(Gunicorn + Nginx + Docker)

**Dockerfile**:

\`\`\`dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "blog.wsgi:application"]
\`\`\`

**docker-compose.yml**(web + postgres + nginx):

\`\`\`yaml
version: "3.8"
services:
  web:
    build: .
    environment:
      - DATABASE_URL=postgres://blog:blog@db/blog
      - SECRET_KEY=\${SECRET_KEY}
      - DEBUG=False
    depends_on: [db]
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: blog
      POSTGRES_DB: blog
    volumes:
      - pgdata:/var/lib/postgresql/data
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - static_vol:/var/www/static:ro
    ports: ["80:80"]
    depends_on: [web]
volumes:
  pgdata:
  static_vol:
\`\`\`

### 64.11 监控(Sentry)

\`\`\`python
# settings.py 末尾
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://xxx@sentry.io/123",
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,  # 性能采样 10%
)
\`\`\`

接入后,任何未捕获异常自动上报,你能立刻知道线上出了什么错。

### 64.12 完整代码结构概览

\`\`\`text
blog/
├── blog/settings.py          # 配置(DB/静态/认证/Sentry)
├── posts/
│   ├── models.py             # Tag / Post / Comment
│   ├── forms.py              # PostForm / CommentForm
│   ├── views.py              # list/detail/create/edit
│   ├── urls.py               # 路由
│   ├── admin.py              # Admin 后台
│   └── templates/posts/      # list.html / detail.html / form.html
├── accounts/                 # 登录注册(用 Django 自带 auth)
├── templates/base.html       # 全局模板
├── Dockerfile / docker-compose.yml / nginx.conf
└── requirements.txt
\`\`\`

### 64.13 一个核心代码片段:文章详情视图

把前面所有章节的知识点汇聚到一个视图里(分页、搜索、权限、模板、ORM、认证):

\`\`\`python
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import Post, Comment
from .forms import CommentForm

def post_detail(request, slug):
    # ORM 查询(第 41 章)
    post = get_object_or_404(Post, slug=slug, status="published")

    # 关联查询:顶级评论
    comments = post.comments.filter(parent__isnull=True)

    # 处理评论提交(表单 + 认证,第 47/52 章)
    if request.method == "POST":
        if not request.user.is_authenticated:
            return redirect("login")
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.author = request.user
            comment.save()
            return redirect("post_detail", slug=slug)
    else:
        form = CommentForm()

    return render(request, "posts/detail.html", {
        "post": post,
        "comments": comments,
        "form": form,
    })
\`\`\`

### 64.14 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 没设 \`related_name\` | 反查 \`post.comment_set\` 不直观 | 加 \`related_name="comments"\` |
| 上传文件忘 \`enctype\` | 文件传不进来 | form 加 multipart/form-data |
| 用 GET 提交搜索表单 | 没法分享 URL | 搜索用 GET |
| 没分页 | 列表数据多时崩 | Paginator + get_page |
| 权限只查登录不查作者 | 别人能改你的文章 | 视图里校验 \`post.author == user\` |
| 生产 DEBUG=True | 错误页泄露信息 | 生产 DEBUG=False |
| 没设 Sentry | 出错不知道 | 接 Sentry |

### 64.15 全书总结

64 章走完,Python Web 应用开发的核心知识图谱:

| 模块 | 章节 |
| --- | --- |
| Web 基础与 HTTP | 1-4 |
| WSGI 与 ASGI | 5-8 |
| Flask 入门 | 9-12 |
| Flask 进阶 | 13-16 |
| Django 入门 | 17-20 |
| Django 模型 | 21-24 |
| Django 视图与模板 | 25-28 |
| Django 认证 | 29-32 |
| Jinja2 模板引擎 | 33-36 |
| SQLAlchemy ORM | 37-40 |
| 表单与文件上传 | 41-44 |
| Session 与认证 | 45-48 |
| REST API 设计 | 49-52 |
| WebSocket 与实时 | 53-56 |
| 测试与调试 | 57-60 |
| 部署与实战 | 61-64 |

掌握这套原理,框架会换(Flask/Django/FastAPI),但 Web 的本质——HTTP 请求响应、资源建模、模板渲染、数据持久化、认证授权、并发模型、测试与部署——是长存的。学会"为什么这么设计",远比记住某个 API 怎么用重要。

> **本章小结**:博客系统把前面学的 ORM、模板、认证、表单、文件上传、分页、搜索、部署全部串起来。能独立做出这个项目,你已经具备 Python Web 全栈开发能力。继续深入的方向:微服务化、性能优化(缓存/异步任务)、DevOps(CI/CD)、可观测性(日志/监控/链路追踪)。学无止境,共勉!`,
  },
];
