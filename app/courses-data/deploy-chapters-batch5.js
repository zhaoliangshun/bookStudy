// =============================================================
// Python 部署与运维实战教程 —— 第 5 批章节（Docker Compose 编排 5 章）
// -------------------------------------------------------------
// 覆盖：Compose 简介与安装 → 服务配置详解 → Compose 命令详解
//       → 多环境与 profiles → Python 全栈应用编排实战
// =============================================================

export const chapters = [
  {
    id: "deploy-compose-intro",
    icon: "🎼",
    title: "Compose 简介与安装",
    group: "Docker Compose 编排",
    content: `# Compose 简介与安装

上一批章节我们学会了用 Docker 打包单个应用。但真实项目从不是单兵作战——一个 Web 服务往往要搭配数据库、缓存、消息队列、反向代理，少则三五个容器，多则十几个。如果你每次启动都要敲一长串 \`docker run\`，那简直是一场灾难。Docker Compose 就是为了解决"多容器编排"而生的。

## 一、Docker Compose 是什么

### 1.1 一个真实的痛点

假设你有一个 Python Web 项目，依赖 Redis 做缓存、PostgreSQL 存数据。没有 Compose 之前，你每次本地启动要这么干：

\`\`\`bash
# 1. 创建一个自定义网络，让容器之间能互相通信
docker network create myapp-net

# 2. 启动 PostgreSQL 容器（指定密码、挂载数据卷、接入网络、起别名）
docker run -d --name db --network myapp-net --network-alias postgres \\
  -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data \\
  -p 5432:5432 postgres:15

# 3. 启动 Redis 容器
docker run -d --name cache --network myapp-net --network-alias redis \\
  -p 6379:6379 redis:7-alpine

# 4. 启动应用容器（依赖前面两个，还要传一堆环境变量）
docker run -d --name app --network myapp-net \\
  -e DB_HOST=postgres -e DB_PASSWORD=secret \\
  -e REDIS_HOST=redis -p 8000:8000 myapp:latest

# 5. 哦，顺序错了，db 还没就绪 app 就崩了，得手动重启
docker restart app
\`\`\`

这一长串命令的问题：

- **记不住**：参数又多又长，每次都要翻文档。
- **不可复现**：换台机器、换个同事，启动方式可能完全不同。
- **难维护**：改一个环境变量要改一条 \`docker run\`，容易漏。
- **无法版本化**：启动配置散落在脚本里，没法和代码一起进 Git。
- **启动顺序/依赖**靠人肉保证，经常翻车。

### 1.2 Compose 的解法

Docker Compose 用一个 YAML 文件描述整个多容器应用：有哪些服务、用什么镜像、映射什么端口、挂载什么卷、依赖什么、传什么环境变量。然后用一条命令把所有容器按正确顺序拉起来。

把上面那一坨 \`docker run\` 用 Compose 改写：

\`\`\`yaml
# docker-compose.yml
services:
  db:                                    # 数据库服务
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - myapp-net

  cache:                                 # 缓存服务
    image: redis:7-alpine
    networks:
      - myapp-net

  app:                                   # 应用服务
    build: .                             # 本地构建镜像
    environment:
      DB_HOST: db
      DB_PASSWORD: secret
      REDIS_HOST: cache
    ports:
      - "8000:8000"
    depends_on:
      - db
      - cache
    networks:
      - myapp-net

volumes:
  pgdata:                                # 命名卷，持久化数据库

networks:
  myapp-net:                             # 自定义网络
\`\`\`

启动只需一条命令：

\`\`\`bash
docker compose up -d          # -d 表示后台运行
\`\`\`

Compose 会自动：创建网络 → 创建卷 → 按依赖顺序启动 db、cache → 最后启动 app。整个应用的拓扑结构写进一个文件，跟着代码进 Git，任何人 clone 下来都能一键复现同样的环境。

### 1.3 Compose 的核心价值

\`\`\`text
1. 声明式配置：用 YAML 描述"我想要什么样的环境"，而不是"怎么去搭"
2. 一键启停：up 启动全部，down 销毁全部，不用记一堆 docker run
3. 可版本化：docker-compose.yml 跟代码一起进 Git，环境即代码
4. 依赖管理：depends_on 自动处理启动顺序
5. 环境一致：开发/测试/生产用同一份配置，告别"在我机器上是好的"
6. 多服务隔离：每个项目有独立的网络和卷，互不干扰
\`\`\`

一句话总结：**Compose 是多容器 Docker 应用的定义和运行工具**。

---

## 二、Compose v1 vs v2

### 2.1 两个版本的区别

Docker Compose 有两个大版本，新手很容易踩坑：

\`\`\`text
┌────────────────┬──────────────────────┬──────────────────────┐
│                │   Compose v1         │   Compose v2         │
├────────────────┼──────────────────────┼──────────────────────┤
│ 命令格式       │ docker-compose (带横杠) │ docker compose (空格)  │
│ 实现语言       │ Python               │ Go                   │
│ 调用方式       │ 独立二进制            │ Docker CLI 插件       │
│ 安装方式       │ 单独下载安装          │ Docker 内置/Docker Desktop 自带 │
│ 状态           │ 2023 年已停止维护     │ 当前推荐版本          │
│ 性能           │ 较慢                 │ 显著提升              │
│ 项目名隔离     │ 用目录名              │ 支持自动隔离          │
└────────────────┴──────────────────────┴──────────────────────┘
\`\`\`

### 2.2 命令对比

v1 和 v2 命令几乎一样，只是连接符不同：

\`\`\`bash
# Compose v1（已废弃，命令带横杠）
docker-compose up -d
docker-compose down
docker-compose logs -f app

# Compose v2（推荐，空格分隔，作为 docker 的子命令）
docker compose up -d
docker compose down
docker compose logs -f app
\`\`\`

v2 把 \`compose\` 作为 \`docker\` 的子命令，好处是：

- 统一在 \`docker\` 命令树下，不用单独记一个工具。
- Go 实现启动更快、内存占用更低。
- 支持 \`docker compose ls\` 列出所有运行中的 compose 项目。
- 支持 profiles、healthcheck 条件依赖等新特性。

### 2.3 如何判断当前用的版本

\`\`\`bash
# 查看 compose 版本
docker compose version        # v2 命令，输出 Docker Compose version v2.x.x

docker-compose version        # v1 命令，如果报 command not found 说明没装 v1

# 查看 compose 插件信息
docker info | grep -i compose
\`\`\`

\`\`\`text
常见输出：
  Docker Compose version v2.24.0   → 你用的是 v2，很好
  docker-compose version 1.29.2    → 你还在用 v1，建议升级
\`\`\`

本教程后续所有命令都基于 v2（\`docker compose\` 空格格式）。

---

## 三、安装 Docker Compose

### 3.1 Docker Desktop（Mac / Windows，最省心）

如果你用的是 Mac 或 Windows，安装 Docker Desktop 就自带 Compose v2，无需额外操作。

\`\`\`bash
# 1. 访问官网下载 Docker Desktop
#    https://www.docker.com/products/docker-desktop/

# 2. 安装后启动 Docker Desktop，验证 compose 是否可用
docker compose version
# 输出示例：Docker Compose version v2.24.0-desktop.1
\`\`\`

Docker Desktop 把 \`docker\`、\`docker compose\`、\`docker buildx\` 都打包好了，对个人开发者和小团队最友好。

### 3.2 Linux 安装 Compose 插件（推荐方式）

Linux 上如果你用官方仓库装了 Docker Engine，可以直接装 compose 插件：

\`\`\`bash
# Ubuntu / Debian 系（apt 安装）
sudo apt-get update
sudo apt-get install docker-compose-plugin

# CentOS / RHEL 系（yum 安装）
sudo yum install docker-compose-plugin

# 验证
docker compose version
\`\`\`

### 3.3 Linux 手动安装独立二进制（备用）

如果包管理器装不了，可以手动下载二进制：

\`\`\`bash
# 1. 下载 compose v2 插件到 docker 的 CLI 插件目录
#    注意：v2 是插件，要放在 ~/.docker/cli-plugins/ 目录下
mkdir -p ~/.docker/cli-plugins

# 2. 下载对应架构的二进制（以 x86_64 为例，替换 VERSION 为实际版本号）
#    最新版本号见 https://github.com/docker/compose/releases
DOCKER_CONFIG=\${DOCKER_CONFIG:-~/.docker}
curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 \\
  -o \$DOCKER_CONFIG/cli-plugins/docker-compose

# 3. 赋予执行权限
chmod +x \$DOCKER_CONFIG/cli-plugins/docker-compose

# 4. 验证
docker compose version
\`\`\`

### 3.4 安装验证清单

\`\`\`bash
# 1. docker 可用
docker --version
# Docker version 25.0.0, build 0000000

# 2. compose 插件可用
docker compose version
# Docker Compose version v2.24.0

# 3. 跑一个最小 compose 项目测试（可选）
mkdir compose-test && cd compose-test
cat > docker-compose.yml <<'EOF'
services:
  hello:
    image: hello-world
EOF
docker compose up        # 应该输出 Hello from Docker!
docker compose down      # 清理
cd .. && rm -rf compose-test
\`\`\`

---

## 四、docker-compose.yml 基本结构

Compose 文件默认名是 \`docker-compose.yml\`（或 \`docker-compose.yaml\`），放在项目根目录。它的顶层结构有三个核心块。

### 4.1 三大顶层块

\`\`\`yaml
# 顶层结构
services:     # 必填：定义一组容器服务（最重要的块）
  web:
    image: nginx
  db:
    image: postgres

networks:    # 可选：定义自定义网络，让服务间通信
  frontend:
  backend:

volumes:     # 可选：定义命名卷，持久化数据
  dbdata:
  redisdata:
\`\`\`

\`\`\`text
三个顶层块的作用：
- services：定义"跑什么容器"，每个 key 就是一个服务名
- networks：定义"容器怎么连"，自定义网络隔离与 DNS
- volumes：定义"数据存哪"，命名卷由 Docker 管理，跨容器共享
\`\`\`

### 4.2 version 字段（历史遗留）

老教程里你会看到文件开头有 \`version: "3.8"\` 这样的字段：

\`\`\`yaml
# 老写法（v1/v2 早期需要）
version: "3.8"
services:
  web:
    image: nginx
\`\`\`

\`\`\`text
version 字段说明：
- version: "1"   早期格式，已废弃
- version: "2"   支持 depends_on 条件、网络定义
- version: "3"   最常用，支持 deploy、swarm 部署
- version: "3.8" 3 系最新，配合 Docker 19.03+
- 不写 version   Compose v2 新写法，自动用最新规范
\`\`\`

重要提示：**Compose v2 已经不再强制要求 version 字段**。新版规范里 version 是可选的，不写也行，写了也只是声明性的。但为了兼容老版本和教程示例，本教程统一用 \`version: "3.8"\`。

\`\`\`yaml
# 推荐写法（兼容性好）
version: "3.8"

services:
  webapp:
    build: .
    ports:
      - "8000:8000"
\`\`\`

### 4.3 文件名约定

\`\`\`bash
# 默认识别的文件名（按优先级）
docker-compose.yml        # 最常用
docker-compose.yaml
compose.yml               # Compose v2 推荐的新短名
compose.yaml

# 指定自定义文件名用 -f
docker compose -f my-compose.yml up -d
docker compose -f compose.prod.yml up -d
\`\`\`

---

## 五、第一个 Compose 文件：Python + Redis

### 5.1 项目场景

写一个最经典的组合：一个 Python 计数器服务，访问 Redis 累加访问次数，浏览器刷新一次计数 +1。这个例子能覆盖 Compose 的核心概念。

### 5.2 项目结构

\`\`\`text
counter-app/
├── app.py               # Flask 应用
├── requirements.txt     # Python 依赖
├── Dockerfile           # 应用镜像构建
└── docker-compose.yml   # 编排文件（主角）
\`\`\`

### 5.3 应用代码 app.py

\`\`\`python
# app.py：一个简单的 Flask 计数器
from flask import Flask
import redis
import os

app = Flask(__name__)

# 从环境变量读 Redis 主机名（compose 里会设为 redis 服务名）
redis_host = os.environ.get("REDIS_HOST", "localhost")
r = redis.Redis(host=redis_host, port=6379, db=0, decode_responses=True)

@app.route("/")
def hello():
    # 计数 +1
    count = r.incr("hits")
    return f"Hello! This page has been visited {count} times.\\n"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
\`\`\`

### 5.4 依赖文件 requirements.txt

\`\`\`text
flask==3.0.0
redis==5.0.1
\`\`\`

### 5.5 Dockerfile

\`\`\`dockerfile
# Dockerfile：构建 Python 应用镜像
FROM python:3.11-slim

WORKDIR /app

# 先拷依赖文件，利用缓存层
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再拷源码
COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
\`\`\`

### 5.6 编排文件 docker-compose.yml（重点）

\`\`\`yaml
version: "3.8"

services:
  redis:                       # 服务名 redis，app 可通过这个主机名访问它
    image: redis:7-alpine      # 用官方 redis 镜像，alpine 版本更小
    ports:
      - "6379:6379"            # 暴露到宿主机，方便调试
    volumes:
      - redisdata:/data        # 数据持久化到命名卷
    restart: unless-stopped    # 异常退出自动重启

  web:                         # 应用服务
    build: .                   # 用当前目录的 Dockerfile 构建镜像
    ports:
      - "5000:5000"            # 宿主机 5000 映射到容器 5000
    environment:
      REDIS_HOST: redis        # 指向 redis 服务，DNS 自动解析
    depends_on:
      - redis                  # 先启动 redis 再启动 web
    restart: unless-stopped

volumes:
  redisdata:                   # 声明命名卷，Docker 自动创建管理
\`\`\`

### 5.7 启动并验证

\`\`\`bash
# 1. 构建并后台启动所有服务
docker compose up -d --build
# --build 表示先重新构建镜像（首次必须，改动代码后也要加）
# -d 表示后台运行

# 2. 查看运行中的服务
docker compose ps
# 输出：
# NAME                IMAGE              STATUS         PORTS
# counter-app-web-1   counter-app-web    Up 30 seconds  0.0.0.0:5000->5000/tcp
# counter-app-redis-1 redis:7-alpine     Up 31 seconds  0.0.0.0:6379->6379/tcp

# 3. 访问应用，多次刷新看计数累加
curl http://localhost:5000
# Hello! This page has been visited 1 times.
curl http://localhost:5000
# Hello! This page has been visited 2 times.

# 4. 查看日志
docker compose logs -f web     # 看 web 日志
docker compose logs -f         # 看所有服务日志

# 5. 停止并清理
docker compose down            # 停止删除容器，保留卷
docker compose down -v         # 连同卷一起删除（数据全清，慎用）
\`\`\`

### 5.8 这段配置发生了什么

\`\`\`text
执行 docker compose up -d --build 后：

1. Compose 读取 docker-compose.yml，解析出 2 个服务、1 个卷
2. 创建默认网络 counter-app_default（用项目名做前缀）
3. 创建命名卷 counter-app_redisdata
4. 启动 redis 容器：拉取 redis:7-alpine 镜像并运行
5. build web 镜像：执行当前目录 Dockerfile，打标签 counter-app-web
6. 启动 web 容器：注入环境变量 REDIS_HOST=redis，连接到默认网络
7. web 容器里，redis 这个主机名会被 DNS 解析到 redis 容器的 IP
8. 两个容器都在后台运行，日志聚合输出

关键点：容器之间通过"服务名"互相访问，这是 Compose 最大的便利。
\`\`\`

---

## 六、服务间通信原理

### 6.1 自动 DNS 解析

Compose 启动时会在自定义网络里给每个服务注册 DNS。容器内用"服务名"当主机名，就能解析到对应容器。

\`\`\`yaml
services:
  web:
    # ...
    environment:
      REDIS_HOST: redis    # 这里写的是服务名 redis，不是 localhost
\`\`\`

\`\`\`text
为什么不是 localhost？
- localhost 在容器内部指的是"容器自己"
- web 容器的 localhost 是 web 容器，不是 redis 容器
- 同一网络下，用服务名才能找到对方
\`\`\`

### 6.2 网络隔离

默认情况下，同一个 docker-compose.yml 里的所有服务在一个默认网络里，能互相访问；不同项目（不同目录）的服务在各自的网络里，互相隔离。

\`\`\`bash
# 项目 A（目录 projectA/）启动后
docker compose -f projectA/docker-compose.yml up -d
# 创建网络 projectA_default

# 项目 B（目录 projectB/）启动后
docker compose -f projectB/docker-compose.yml up -d
# 创建网络 projectB_default

# A 和 B 互不可见，避免端口/命名冲突
\`\`\`

---

## 七、小结与下一章

这一章我们建立了对 Compose 的整体认知：

\`\`\`text
1. Compose 是什么：多容器应用的声明式编排工具
2. v1 vs v2：v2 用 docker compose 空格命令，Go 实现，已淘汰 v1
3. 安装：Docker Desktop 自带，Linux 装 docker-compose-plugin
4. 文件结构：services（容器）/ networks（网络）/ volumes（卷）三大块
5. 第一个例子：Python Flask + Redis 计数器，一键 up 跑起来
6. 通信原理：服务名即主机名，同网络自动 DNS 解析
\`\`\`

下一章我们会把 services 里每个配置项讲透：image、build、ports、volumes、environment、depends_on、restart、healthcheck……这些是写 Compose 文件的核心语法，掌握它们你能编排任意复杂的应用。
`
  },

  {
    id: "deploy-compose-config",
    icon: "⚙️",
    title: "服务配置详解",
    group: "Docker Compose 编排",
    content: `# 服务配置详解

上一章我们用 \`docker compose up\` 跑起了 Flask + Redis。但那份配置文件里的每个字段到底什么含义？ports 怎么映射？volumes 有几种写法？depends_on 能保证数据库就绪吗？这一章把 services 块里所有常用配置项讲透。掌握这些，你就能写出任意复杂度的 Compose 文件。

## 一、image vs build：镜像从哪来

### 1.1 image：直接用现成镜像

\`image\` 指定用仓库里现成的镜像，Compose 会自动拉取：

\`\`\`yaml
services:
  redis:
    image: redis:7-alpine          # 完整镜像名:标签
  db:
    image: postgres:15              # 官方 Postgres
  cache:
    image: registry.example.com/myredis:v2   # 私有仓库镜像
\`\`\`

\`\`\`text
镜像名格式：[仓库地址/]镜像名[:标签]
- redis:7-alpine        Docker Hub 官方镜像，标签 7-alpine
- postgres:15           官方镜像，标签 15
- myrepo/app:v1.0       Docker Hub 用户仓库
- registry.cn-hangzhou.aliyuncs.com/ns/app:v1   阿里云私有仓库
\`\`\`

### 1.2 build：从 Dockerfile 构建

如果你有自己的 Dockerfile，用 \`build\` 让 Compose 现场构建镜像：

\`\`\`yaml
services:
  web:
    build: .                         # 最简写法：上下文是当前目录，找默认 Dockerfile

  web2:
    build:
      context: ./app                 # 上下文目录（构建时能访问的文件范围）
      dockerfile: Dockerfile.prod    # 指定 Dockerfile 文件名

  web3:
    build:
      context: ./app
      dockerfile: ../Dockerfile      # Dockerfile 可以在上下文外
      args:                          # 构建参数，对应 Dockerfile 的 ARG
        VERSION: "1.2"
        ENV: production
      target: builder                # 多阶段构建，构建到指定阶段为止
\`\`\`

### 1.3 image + build 同时存在

可以既 build 又指定 image 名，构建出来的镜像会打上这个标签，方便后续复用：

\`\`\`yaml
services:
  web:
    build: .
    image: myapp:latest              # 构建后打标签 myapp:latest
    # 之后 docker compose up 不会重复构建，除非加 --build
\`\`\`

### 1.4 选择建议

\`\`\`text
什么时候用 image：
- 用官方现成组件（mysql/redis/nginx/postgres）
- 镜像已经在私有仓库，直接拉
- 不需要定制镜像内容

什么时候用 build：
- 有自己写的应用代码，需要打包成镜像
- 需要在官方镜像基础上做定制（装额外依赖、改配置）
- 多阶段构建优化镜像体积
\`\`\`

---

## 二、ports vs expose：端口怎么暴露

新手最容易混淆的两个配置，它们职责完全不同。

### 2.1 ports：发布到宿主机

\`ports\` 把容器端口映射到宿主机端口，让宿主机（甚至外部网络）能访问：

\`\`\`yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"                    # 宿主机 8080 -> 容器 80
      - "443:443"                    # 宿主机 443 -> 容器 443
      - "127.0.0.1:9090:9090"        # 只绑本机回环，外部访问不到
      - target: 5432                 # 长格式写法
        published: "5432"
        protocol: tcp
        mode: host
\`\`\`

\`\`\`text
ports 格式：
- "宿主机端口:容器端口"           "8080:80"
- "宿主机IP:宿主机端口:容器端口"   "127.0.0.1:9090:9090"
- "容器端口"（随机分配宿主机端口）  "80"
\`\`\`

### 2.2 expose：仅容器间可见

\`expose\` 只声明容器开放某个端口，**不映射到宿主机**，仅供同网络的其他容器访问：

\`\`\`yaml
services:
  db:
    image: postgres
    expose:
      - "5432"                       # 仅声明，宿主机访问不到 5432
  web:
    image: myapp
    # web 可以通过 db:5432 访问数据库（同网络）
    # 但宿主机用 localhost:5432 连不上
\`\`\`

### 2.3 对比表

\`\`\`text
┌──────────────┬─────────────────────┬─────────────────────┐
│              │  ports              │  expose             │
├──────────────┼─────────────────────┼─────────────────────┤
│ 宿主机可访问 │ 是                  │ 否                  │
│ 容器间可访问 │ 是                  │ 是                  │
│ 是否占用宿主端口│ 是                │ 否                  │
│ 典型用途     │ Web 服务对外提供    │ 内部数据库/缓存     │
│ 安全性       │ 较低（对外开放）    │ 较高（仅内部）      │
└──────────────┴─────────────────────┴─────────────────────┘
\`\`\`

\`\`\`yaml
# 最佳实践示例
services:
  web:
    image: nginx
    ports:                          # 对外服务，发布端口
      - "80:80"

  db:
    image: postgres
    expose:                         # 内部数据库，不对外
      - "5432"
    # 不要写 ports，避免数据库暴露到公网
\`\`\`

---

## 三、volumes：数据持久化的三种写法

容器是临时的，删除后数据就没了。要让数据留存，必须用 volumes。Compose 支持三种挂载方式。

### 3.1 命名卷（Named Volume）

由 Docker 管理的卷，在顶层 \`volumes:\` 块里声明，用名字引用：

\`\`\`yaml
services:
  db:
    image: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data   # 把命名卷 pgdata 挂到容器数据目录

volumes:
  pgdata:                                  # 顶层声明，Docker 自动创建
\`\`\`

\`\`\`text
命名卷特点：
- 生命周期独立于容器，down 不会删，down -v 才删
- 由 Docker 管理，存在 /var/lib/docker/volumes/ 下
- 跨容器共享方便，性能好
- 适合存数据库数据、应用状态
\`\`\`

### 3.2 绑定挂载（Bind Mount）

把宿主机的一个目录/文件直接挂进容器，宿主机和容器看到的是同一份文件：

\`\`\`yaml
services:
  web:
    build: .
    volumes:
      - ./src:/app/src                    # 宿主机 ./src 挂到容器 /app/src
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro   # 挂单个文件，:ro 只读
\`\`\`

\`\`\`text
绑定挂载特点：
- 直接映射宿主机路径，改文件两边都生效
- 适合开发时热重载（改代码容器里立即生效）
- 适合挂配置文件（nginx.conf、redis.conf）
- 跨平台有路径和权限问题（Mac/Win 用 Docker Desktop 时）
- 不要挂敏感目录，容器可能改坏宿主机文件
\`\`\`

### 3.3 匿名卷（Anonymous Volume）

只写容器内路径，不指定宿主机路径，Docker 自动创建一个匿名卷：

\`\`\`yaml
services:
  web:
    image: nginx
    volumes:
      - /var/cache/nginx                  # 匿名卷，只写容器路径
\`\`\`

\`\`\`text
匿名卷特点：
- 没有名字，用 hash 标识
- 容器删了，匿名卷还留着，但难管理
- 多用于镜像里 VOLUME 指令的默认行为
- 不推荐主动用，难维护
\`\`\`

### 3.4 三种写法对比与长格式

\`\`\`yaml
services:
  web:
    volumes:
      # 短格式
      - pgdata:/var/lib/postgresql/data        # 命名卷
      - ./src:/app/src                          # 绑定挂载
      - /tmp/cache                              # 匿名卷

      # 长格式（更清晰，支持更多选项）
      - type: volume                            # 命名卷
        source: pgdata
        target: /var/lib/postgresql/data
        read_only: false
      - type: bind                              # 绑定挂载
        source: ./src
        target: /app/src
        read_only: true                         # 容器内只读
      - type: tmpfs                             # tmpfs 内存盘
        target: /app/tmp
        tmpfs:
          size: 100000000                       # 100MB
\`\`\`

### 3.5 volume 读写权限

\`\`\`yaml
services:
  web:
    volumes:
      - ./config:/etc/config:ro        # ro = read only，容器内只读
      - ./data:/app/data:rw            # rw = read write（默认）
\`\`\`

\`\`\`bash
# 查看所有卷
docker volume ls

# 查看某个卷的详情
docker volume inspect counter-app_pgdata

# 删除没在用的卷
docker volume prune
\`\`\`

---

## 四、environment 与 env_file：环境变量怎么传

### 4.1 environment 直接写

\`\`\`yaml
services:
  db:
    image: postgres
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
      DEBUG: "true"                    # 字符串值建议加引号
\`\`\`

\`\`\`text
两种写法：
- 映射写法（推荐）：KEY: VALUE，清晰
- 数组写法：- KEY=VALUE
\`\`\`

\`\`\`yaml
# 数组写法
services:
  db:
    image: postgres
    environment:
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
\`\`\`

### 4.2 env_file：从文件加载

当环境变量多、或要和代码隔离时，用 env_file 从 .env 文件批量加载：

\`\`\`yaml
services:
  web:
    image: myapp
    env_file:
      - .env                           # 加载项目根目录的 .env
      - .env.prod                      # 可以加载多个，后面的覆盖前面
\`\`\`

对应 \`.env\` 文件（注意不要有引号、空格）：

\`\`\`bash
# .env 文件格式：KEY=VALUE，每行一个
DB_HOST=db
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=secret
SECRET_KEY=abc123
DEBUG=true
\`\`\`

### 4.3 environment 与 env_file 同时用

\`\`\`yaml
services:
  web:
    env_file:
      - .env                           # 先加载文件
    environment:
      DEBUG: "false"                   # 再单独覆盖，优先级更高
\`\`\`

\`\`\`text
优先级（高到低）：
1. environment 字段（最高）
2. docker compose run -e 临时传入
3. env_file 加载的（后面的文件覆盖前面的）
4. 镜像 Dockerfile 里的 ENV
5. 宿主机的环境变量插值 \${VAR}
\`\`\`

### 4.4 安全提示：别把密码写进 Git

\`\`\`text
推荐做法：
1. 真实 .env 文件加入 .gitignore，不进版本库
2. 提供 .env.example 模板，列字段但不填真实值
3. 生产环境用 secrets 或 CI 注入，不用 .env
\`\`\`

\`\`\`bash
# .gitignore 里加
.env
.env.*
!.env.example
\`\`\`

---

## 五、depends_on：启动依赖与就绪条件

### 5.1 基础依赖（只保证启动顺序）

\`\`\`yaml
services:
  web:
    build: .
    depends_on:
      - db                             # web 会在 db 启动后再启动
      - redis
  db:
    image: postgres
  redis:
    image: redis
\`\`\`

\`\`\`text
注意：基础 depends_on 只保证"启动顺序"，不保证 db 已经就绪！
db 容器进程启动了，但 Postgres 可能还在初始化，
web 立刻连会报 Connection refused，然后崩溃。
\`\`\`

### 5.2 条件依赖（等就绪再启动，推荐）

v2 和 v3.4+ 支持长格式，可以等健康检查通过：

\`\`\`yaml
services:
  web:
    build: .
    depends_on:
      db:
        condition: service_healthy     # 等 db 健康检查通过
      redis:
        condition: service_started     # 等 redis 启动即可（默认）
  db:
    image: postgres
    healthcheck:                       # 必须配 healthcheck 才能用 service_healthy
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
\`\`\`

\`\`\`text
condition 三种值：
- service_started       容器进程启动即可（默认，最弱）
- service_healthy       健康检查通过才继续（推荐，需配 healthcheck）
- service_completed     等容器执行完退出再继续（用于一次性任务）
\`\`\`

### 5.3 一次性初始化任务

利用 \`service_completed\` 等待迁移脚本跑完：

\`\`\`yaml
services:
  migrate:
    image: myapp
    command: python manage.py migrate   # 跑完就退出的迁移任务
    depends_on:
      db:
        condition: service_healthy
  web:
    image: myapp
    depends_on:
      migrate:
        condition: service_completed    # 等 migrate 跑完再启动 web
\`\`\`

---

## 六、restart 策略：容器崩了怎么办

### 6.1 四种策略

\`\`\`yaml
services:
  web:
    image: nginx
    restart: always                     # 总是重启
\`\`\`

\`\`\`text
四种取值：
- no                默认，容器退出不重启
- always            任何退出都重启（包括手动 stop，但 stop 后下次启动会被记录）
- on-failure        仅非零退出码才重启，可加次数限制
- unless-stopped    像 always，但手动 stop 后不会被重启（推荐）
\`\`\`

### 6.2 各策略对比与示例

\`\`\`yaml
services:
  db:
    image: postgres
    restart: always                     # 数据库要稳，崩了立即重启

  web:
    build: .
    restart: unless-stopped             # 推荐用于应用，手动停了不会自己起

  batch:
    image: mybatch
    restart: on-failure:5               # 失败重启，最多 5 次
\`\`\`

\`\`\`text
策略选择建议：
- 数据库/缓存/核心服务：always
- Web 应用/后台任务：unless-stopped
- 一次性脚本/迁移：on-failure 或 no
- 开发环境调试：no（崩了好排查）
\`\`\`

---

## 七、healthcheck：健康检查

### 7.1 为什么需要 healthcheck

光看容器"在运行"不代表服务"可用"。比如 Postgres 容器在跑，但还在加载，连不上。healthcheck 让 Compose 知道服务是不是真的就绪了。

### 7.2 配置语法

\`\`\`yaml
services:
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s          # 每 10 秒检查一次
      timeout: 5s            # 单次检查超时时间
      retries: 5             # 连续失败 5 次才算 unhealthy
      start_period: 30s      # 启动后 30 秒内失败不计入（给初始化留时间）
\`\`\`

### 7.3 常见服务的 healthcheck

\`\`\`yaml
services:
  redis:
    image: redis
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]              # redis 用 ping

  mysql:
    image: mysql:8
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]   # HTTP 健康端点
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx
    healthcheck:
      test: ["CMD-SHELL", "service nginx status || exit 1"]
\`\`\`

### 7.4 test 写法说明

\`\`\`text
test 三种写法：
- ["CMD", "命令", "参数"]          直接执行，不需要 shell
- ["CMD-SHELL", "命令字符串"]      用 /bin/sh -c 执行，支持管道和变量
- ["NONE"]                         禁用健康检查（覆盖镜像默认的）

注意：$$ 在 Compose 里要写两个美元符号转义，避免被变量插值吃掉
\`\`\`

### 7.5 禁用镜像自带的 healthcheck

\`\`\`yaml
services:
  web:
    image: someimage
    healthcheck:
      disable: true                    # 禁用镜像里 HEALTHCHECK 指令
\`\`\`

\`\`\`bash
# 查看容器健康状态
docker compose ps
# STATUS 列会显示 (healthy) / (unhealthy) / (health: starting)

docker inspect --format='{{.State.Health.Status}}' <容器名>
\`\`\`

---

## 八、其他常用配置项速览

### 8.1 command 与 entrypoint

覆盖镜像默认的启动命令：

\`\`\`yaml
services:
  web:
    image: myapp
    command: gunicorn app:app -w 4 -b 0.0.0.0:8000   # 覆盖 CMD
    entrypoint: ["python"]                              # 覆盖 ENTRYPOINT
\`\`\`

### 8.2 working_dir 与 user

\`\`\`yaml
services:
  web:
    image: myapp
    working_dir: /app             # 容器内工作目录
    user: "1000:1000"             # 以指定 uid:gid 运行，提升安全性
\`\`\`

### 8.3 container_name 与 hostname

\`\`\`yaml
services:
  web:
    image: nginx
    container_name: mynginx       # 固定容器名（不用默认的 项目-服务-序号）
    hostname: webserver           # 容器内 hostname 命令显示的值
\`\`\`

\`\`\`text
注意：固定 container_name 后无法 scale（多副本会重名冲突）。
生产环境要扩缩容就别设 container_name。
\`\`\`

### 8.4 sysctls 与 cap_add（高级，调内核参数与权限）

\`\`\`yaml
services:
  web:
    image: nginx
    sysctls:
      net.core.somaxconn: 1024    # 调内核参数
    cap_add:
      - NET_ADMIN                 # 添加内核能力（如改网络配置）
\`\`\`

---

## 九、综合示例：一份配置串起来

\`\`\`yaml
version: "3.8"

services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    image: myapp:1.0
    container_name: myapp-web
    ports:
      - "8000:8000"
    environment:
      DB_HOST: db
      REDIS_HOST: redis
      DEBUG: "false"
    env_file:
      - .env
    volumes:
      - ./web/src:/app/src        # 开发热重载
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 40s
    networks:
      - frontend
      - backend

  db:
    image: postgres:15
    expose:
      - "5432"
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    expose:
      - "6379"
    volumes:
      - redisdata:/data
    restart: always
    networks:
      - backend

volumes:
  pgdata:
  redisdata:

networks:
  frontend:
  backend:
    internal: true                  # 内部网络，不能访问外网，更安全
\`\`\`

\`\`\`text
这份配置涵盖：
- build + image 组合
- ports / expose 区别使用
- 命名卷 + 绑定挂载
- environment + env_file
- depends_on 条件依赖
- restart 策略
- healthcheck
- 自定义网络 + internal 隔离
\`\`\`

---

## 十、小结

\`\`\`text
1. image 用现成镜像，build 自己构建，可同时用
2. ports 发布到宿主机，expose 仅内部可见
3. volumes 三种：命名卷（数据）、绑定挂载（开发/配置）、匿名卷（少用）
4. environment 直接传，env_file 批量加载，注意安全
5. depends_on 配 condition: service_healthy 才能保证就绪
6. restart: unless-stopped 最常用，数据库用 always
7. healthcheck 让 Compose 知道服务是否真就绪，配合 depends_on 用
\`\`\`

下一章我们学习 Compose 的命令体系：up/down/logs/exec/run/build/config，把编排好的服务真正管起来。
`
  },

  {
    id: "deploy-compose-command",
    icon: "🎮",
    title: "Compose 命令详解",
    group: "Docker Compose 编排",
    content: `# Compose 命令详解

配置文件写好了，接下来要用命令把它跑起来、停掉、看日志、进容器调试。这一章把 \`docker compose\` 的所有常用命令讲透，每个命令配实际场景和详细注释。命令用熟了，你日常 90% 的运维操作都能覆盖。

## 一、docker compose up：启动全家桶

\`up\` 是最核心的命令，负责"按配置创建并启动所有服务"。

### 1.1 基本用法

\`\`\`bash
# 在前台启动所有服务（日志直接输出到终端，Ctrl+C 停止）
docker compose up

# 后台启动（推荐，释放终端）
docker compose up -d
# -d = --detach，后台运行
\`\`\`

### 1.2 常用参数

\`\`\`bash
# 启动前强制重新构建镜像（代码改了必须加）
docker compose up -d --build

# 只启动指定服务（及它的依赖）
docker compose up -d web               # 只起 web 和它依赖的 db、redis
docker compose up -d web db            # 起多个指定服务

# 不启动依赖（小心，可能导致连接失败）
docker compose up -d --no-deps web

# 强制重新创建容器（即使配置没变也重建）
docker compose up -d --force-recreate

# 不重建已存在的容器（即使配置变了，省时间用）
docker compose up -d --no-recreate

# 指定超时时间（秒），停止旧容器时等待
docker compose up -d -t 30

# 启动时顺便扩展某服务的副本数
docker compose up -d --scale worker=3
\`\`\`

### 1.3 up 的智能行为

\`\`\`text
docker compose up 会自动判断：
1. 镜像不存在 → 拉取或构建
2. 配置变了 → 重建受影响的容器
3. 配置没变 → 复用已有容器
4. 依赖服务没起 → 先起依赖
5. 已在运行的服务 → 跳过（除非 --force-recreate）
\`\`\`

### 1.4 典型工作流

\`\`\`bash
# 首次启动（构建镜像 + 启动）
docker compose up -d --build

# 改了代码，重新构建并启动
docker compose up -d --build web

# 只想重启某服务（不重新构建）
docker compose up -d web

# 改了 docker-compose.yml，让新配置生效
docker compose up -d        # Compose 自动 diff，重建变动的服务
\`\`\`

---

## 二、docker compose down：销毁全家桶

\`down\` 是 \`up\` 的反面：停止并删除容器、网络。**默认不删卷**。

### 2.1 基本用法

\`\`\`bash
# 停止并删除容器、网络（保留卷和数据）
docker compose down

# 连同卷一起删除（数据全清，慎用！）
docker compose down -v
# -v = --volumes，删除配置里声明的命名卷

# 连同镜像一起删除（彻底清理）
docker compose down --rmi all
# --rmi all       删除所有用到的镜像
# --rmi local     只删除 build 出来的镜像（不含拉取的官方镜像）

# 同时删除卷 + 镜像 + 容器（最彻底，等同重置）
docker compose down -v --rmi all --remove-orphans
# --remove-orphans  顺便清理不在当前配置里的孤儿容器
\`\`\`

### 2.2 down 与 stop 的区别

\`\`\`text
┌──────────────┬─────────────────────────┐
│  stop        │  down                   │
├──────────────┼─────────────────────────┤
│ 容器停止但保留 │ 容器停止并删除          │
│ 网络保留      │ 网络删除                │
│ 卷保留        │ 卷保留（除非 -v）       │
│ 下次 start 即可│ 下次要 up 重新创建      │
│ 适合临时暂停  │ 适合彻底清理            │
└──────────────┴─────────────────────────┘
\`\`\`

\`\`\`bash
# 临时暂停（保留状态，启动快）
docker compose stop
docker compose start            # 唤醒

# 彻底清理（下次启动要重建容器）
docker compose down
docker compose up -d            # 重新创建
\`\`\`

---

## 三、start / stop / restart：生命周期管理

### 3.1 三个命令

\`\`\`bash
# 启动已存在但停止的容器（不创建新容器）
docker compose start
docker compose start web              # 只启动 web

# 停止运行中的容器（保留容器，不删）
docker compose stop
docker compose stop web

# 重启容器
docker compose restart
docker compose restart web redis      # 重启多个

# 暂停容器（不停止进程，用 cgroup 冻结，恢复更快）
docker compose pause
docker compose unpause
\`\`\`

### 3.2 stop 与 pause 区别

\`\`\`text
stop：发送 SIGTERM，进程退出，容器变 exited 状态，资源释放
pause：用 cgroup freezer 冻结进程，进程还在但被挂起，资源仍占用
       适合"等一下马上恢复"的场景，unpause 立即继续
\`\`\`

\`\`\`bash
# 场景：临时暂停应用做数据库备份
docker compose pause web              # 冻结 web，DB 还在跑
docker exec db pg_dump ...            # 备份数据库
docker compose unpause web            # 解冻，web 继续
\`\`\`

---

## 四、ps / logs / top：观察运行状态

### 4.1 ps：列出服务状态

\`\`\`bash
# 列出当前项目的服务
docker compose ps
# 输出：
# NAME                SERVICE    STATUS              PORTS
# myapp-web-1         web        Up 2 minutes        0.0.0.0:8000->8000/tcp
# myapp-db-1          db         Up 2 minutes (healthy)   5432/tcp
# myapp-redis-1       redis      Up 2 minutes        6379/tcp

# 显示所有服务（包括已停止的）
docker compose ps -a

# 只显示服务 ID
docker compose ps -q

# 以 JSON 格式输出（适合脚本处理）
docker compose ps --format json
\`\`\`

### 4.2 logs：查看日志

\`\`\`bash
# 查看所有服务日志
docker compose logs

# 跟踪实时日志（最常用，类似 tail -f）
docker compose logs -f
# -f = --follow，持续输出新日志

# 只看指定服务日志
docker compose logs -f web
docker compose logs web db            # 多个服务

# 显示最后 100 行
docker compose logs --tail 100 web

# 显示最近 10 分钟的日志
docker compose logs --since 10m web

# 显示某时间之后的日志
docker compose logs --since 2024-01-01T00:00:00 web

# 显示时间戳
docker compose logs -t web
\`\`\`

\`\`\`text
日志是聚合的，多个服务日志交错输出，每行前会带服务名标识：
myapp-web-1    | INFO:     127.0.0.1 - "GET / HTTP/1.1" 200
myapp-db-1     | 2024-01-01 LOG:  database system is ready
\`\`\`

### 4.3 top：查看容器内进程

\`\`\`bash
# 查看所有服务容器里跑的进程
docker compose top
# 输出每个服务的进程列表，类似 docker top

# 查看指定服务的进程
docker compose top web
\`\`\`

\`\`\`text
输出示例：
myapp-web-1
UID    PID    PPID   COMMAND
root   1      0      gunicorn app:app -w 4 -b 0.0.0.0:8000
root   20     1      gunicorn worker
\`\`\`

---

## 五、exec / run：进入容器与一次性任务

### 5.1 exec：在运行中的容器里执行命令

\`\`\`bash
# 进入运行中的 web 容器开一个 bash
docker compose exec web bash

# 在 web 容器里执行命令（不开交互式）
docker compose exec web python manage.py shell

# 指定用户执行
docker compose exec --user root web sh

# 指定工作目录
docker compose exec -w /app web ls -la

# 多服务时指定服务
docker compose exec db psql -U postgres -c "SELECT 1;"
\`\`\`

\`\`\`text
exec 特点：
- 容器必须正在运行
- 在已有容器里开新进程，不创建新容器
- 退出 exec 后容器继续运行
- 类似 docker exec
\`\`\`

### 5.2 run：为一次性任务创建新容器

\`\`\`bash
# 用 web 服务的镜像创建一个新容器跑命令，跑完就退出
docker compose run web python manage.py migrate

# 不启动依赖（避免连带启动 db、redis）
docker compose run --no-deps web python -m pytest

# 自动删除跑完的容器（不留痕迹）
docker compose run --rm web pip install requests

# 映射端口（覆盖配置）
docker compose run --service-ports web    # 用配置里的端口
docker compose run -p 8080:8000 web       # 临时映射

# 进入交互式
docker compose run -it web bash
\`\`\`

### 5.3 exec vs run 对比

\`\`\`text
┌──────────┬──────────────────────┬──────────────────────┐
│          │  exec                │  run                 │
├──────────┼──────────────────────┼──────────────────────┤
│ 容器状态  │ 必须在运行           │ 创建新容器           │
│ 是否新建  │ 否，用现有容器       │ 是，创建临时容器     │
│ 端口映射  │ 用现有的             │ 默认不映射           │
│ 典型用途  │ 进容器调试/查看      │ 跑迁移、跑测试、装包 │
│ 退出影响  │ 容器继续运行         │ 新容器退出           │
└──────────┴──────────────────────┴──────────────────────┘
\`\`\`

\`\`\`bash
# 场景对比
docker compose exec web bash              # 进正在跑的容器调试
docker compose run --rm web pytest        # 跑测试，跑完删容器
docker compose run --rm web python manage.py createsuperuser  # 创建管理员
\`\`\`

---

## 六、build / pull / push：镜像管理

### 6.1 build：构建镜像

\`\`\`bash
# 构建所有配置了 build 的服务镜像
docker compose build

# 只构建指定服务
docker compose build web

# 不使用缓存（彻底重建，排查构建问题用）
docker compose build --no-cache web

# 构建时传参数（对应 build.args）
docker compose build --build-arg VERSION=1.2 web

# 构建并打标签
docker compose build --tag myapp:1.0 web

# 拉取基础镜像后再构建
docker compose build --pull web
\`\`\`

### 6.2 pull / push：拉取与推送

\`\`\`bash
# 拉取所有服务镜像
docker compose pull

# 只拉取指定服务
docker compose pull db redis

# 拉取时包含构建用镜像
docker compose pull --include-build

# 推送镜像（需要先登录镜像仓库）
docker compose push
docker compose push web
\`\`\`

\`\`\`bash
# 典型 CI/CD 流程
docker compose build          # 构建
docker compose push           # 推送到仓库
# 在服务器上：
docker compose pull           # 拉最新镜像
docker compose up -d          # 启动
\`\`\`

---

## 七、config：校验与查看配置

\`\`\`bash
# 校验配置文件语法是否正确（不启动）
docker compose config
# 正确：输出合并后的完整配置
# 错误：报错信息，指出哪一行有问题

# 只校验不输出（用于脚本判断）
docker compose config -q
# -q = --quiet，无错误时无输出，有错误输出到 stderr

# 输出服务名
docker compose config --services

# 输出用到的卷
docker compose config --volumes

# 输出解析后的配置（含变量插值后的真实值）
docker compose config
\`\`\`

### 7.1 实际用途

\`\`\`bash
# 1. 改完配置先校验，避免启动到一半才发现语法错
docker compose config -q && docker compose up -d

# 2. 查看变量插值后的最终配置
docker compose config
# 比如配置里 \${DB_PASSWORD} 会被 .env 里的值替换显示出来

# 3. 排查"为什么某服务没启动"
docker compose config --services
# 看看你的服务是不是被 profiles 隐藏了
\`\`\`

---

## 八、scale：扩缩容

### 8.1 基本用法

\`\`\`bash
# 把 worker 服务扩到 3 个副本
docker compose up -d --scale worker=3

# 缩容到 1 个
docker compose up -d --scale worker=1

# 同时调整多个服务
docker compose up -d --scale web=2 --scale worker=4
\`\`\`

\`\`\`text
scale 注意事项：
1. 扩容的服务不能设 container_name（会重名冲突）
2. 端口冲突：如果 web 映射了固定宿主端口，多个副本会抢端口
   解决：不映射宿主端口，或用随机端口 "8000"（只写容器端口）
3. v3 文件里推荐用 deploy.replicas，但仅 swarm 模式生效
   单机用 --scale 命令更直接
\`\`\`

### 8.2 允许扩容的配置

\`\`\`yaml
# 错误：固定端口 + container_name，无法 scale
services:
  web:
    image: myapp
    container_name: web         # 冲突！
    ports:
      - "8000:8000"             # 端口冲突！

# 正确：可 scale 的配置
services:
  web:
    image: myapp
    # 不设 container_name
    expose:
      - "8000"                  # 只在内部暴露，不占宿主端口
    # 配合负载均衡（nginx）分发到多个 web 副本
\`\`\`

### 8.3 deploy.replicas（v3 swarm 用法）

\`\`\`yaml
version: "3.8"
services:
  worker:
    image: myworker
    deploy:
      replicas: 3               # 3 个副本
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
      restart_policy:
        condition: on-failure
\`\`\`

\`\`\`text
注意：deploy 块只在 docker stack deploy（swarm 模式）下生效！
普通 docker compose up 会忽略 deploy.replicas。
单机扩容请用 docker compose up --scale worker=3。
\`\`\`

---

## 九、其他实用命令

### 9.1 ls：列出所有 Compose 项目

\`\`\`bash
# 列出本机所有运行中的 compose 项目
docker compose ls
# 输出：
# NAME                STATUS
# myapp               running(3)
# blog                running(2)

# 包含已停止的项目
docker compose ls -a
\`\`\`

### 9.2 events：实时事件流

\`\`\`bash
# 监听容器事件（启动、停止、健康检查等）
docker compose events
# 输出示例：
# 2024-01-01 10:00:00.000000 container create myapp-web-1
# 2024-01-01 10:00:01.000000 container start myapp-web-1
\`\`\`

### 9.3 images：列出镜像

\`\`\`bash
# 列出项目用到的镜像
docker compose images
\`\`\`

### 9.4 cp：容器与宿主机互拷文件

\`\`\`bash
# 从容器拷到宿主机
docker compose cp web:/app/logs /tmp/logs

# 从宿主机拷到容器
docker compose cp ./config.yaml web:/app/config.yaml
\`\`\`

---

## 十、命令速查表

\`\`\`text
生命周期：
  docker compose up -d --build    构建并后台启动
  docker compose down             停止删除容器（保留卷）
  docker compose down -v          连同卷一起删
  docker compose stop / start     停止 / 启动（保留容器）
  docker compose restart          重启
  docker compose pause / unpause  暂停 / 恢复

观察：
  docker compose ps               查看服务状态
  docker compose logs -f web      跟踪日志
  docker compose top              查看进程

调试：
  docker compose exec web bash    进入运行中的容器
  docker compose run --rm web pytest   一次性任务

镜像：
  docker compose build            构建镜像
  docker compose pull             拉取镜像
  docker compose push             推送镜像

配置：
  docker compose config           校验并查看配置
  docker compose config -q        只校验

扩缩容：
  docker compose up --scale web=3  扩到 3 副本
\`\`\`

---

## 十一、小结

\`\`\`text
1. up 是核心：-d 后台、--build 重建、--scale 扩容
2. down 删容器不删卷，down -v 才删数据
3. stop/pause 临时停，down 彻底清
4. exec 进运行中容器，run 跑一次性任务
5. logs -f 看实时日志，ps 看状态
6. config 校验配置，避免启动到一半出错
7. --scale 扩缩容，注意端口和 container_name 冲突
\`\`\`

下一章我们学习多环境管理：用多个 Compose 文件、profiles、.env 实现开发/测试/生产环境隔离，以及网络与资源限制、secrets 等进阶配置。
`
  },

  {
    id: "deploy-compose-advanced",
    icon: "🚀",
    title: "多环境与 profiles",
    group: "Docker Compose 编排",
    content: `# 多环境与 profiles

真实项目里，开发、测试、生产三套环境的配置差异巨大：开发要热重载、生产要 HTTPS、测试要起 mock。如果每套环境写一个完整 Compose 文件，重复太多、维护痛苦。Compose 提供了多种机制来解决多环境问题。这一章讲透文件合并、override、profiles、变量插值、网络、资源限制、secrets。

## 一、多 Compose 文件合并（-f 覆盖）

### 1.1 思路：基础 + 覆盖

把通用配置放基础文件，环境差异放覆盖文件，启动时用 \`-f\` 多次指定，后面的覆盖前面的：

\`\`\`text
docker-compose.yml         基础配置（所有环境共用）
docker-compose.prod.yml    生产覆盖（HTTPS、资源限制）
docker-compose.dev.yml     开发覆盖（热重载、调试端口）
\`\`\`

### 1.2 基础文件

\`\`\`yaml
# docker-compose.yml（基础，所有环境共用）
version: "3.8"
services:
  web:
    build: .
    environment:
      DB_HOST: db
    depends_on:
      - db
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
\`\`\`

### 1.3 开发覆盖

\`\`\`yaml
# docker-compose.dev.yml（开发环境：加挂载热重载、加 adminer 调试）
version: "3.8"
services:
  web:
    volumes:
      - ./src:/app/src          # 挂源码，改代码容器内即时生效
    environment:
      DEBUG: "true"             # 开 debug
    ports:
      - "8000:8000"             # 暴露端口本地访问
  db:
    ports:
      - "5432:5432"             # 暴露数据库端口，用本地客户端连
  adminer:                      # 加一个数据库管理界面，仅开发用
    image: adminer
    ports:
      - "8080:8080"
\`\`\`

### 1.4 生产覆盖

\`\`\`yaml
# docker-compose.prod.yml（生产：加 nginx、资源限制、不暴露内部端口）
version: "3.8"
services:
  web:
    environment:
      DEBUG: "false"
    restart: always
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
  db:
    restart: always
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
  nginx:                        # 生产加 nginx 反向代理
    image: nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
\`\`\`

### 1.5 启动方式

\`\`\`bash
# 开发环境：基础 + dev 覆盖
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 生产环境：基础 + prod 覆盖
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 简化：用 COMPOSE_FILE 环境变量（不用每次写 -f）
export COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
docker compose up -d            # 自动用上面两个文件
\`\`\`

### 1.6 合并规则

\`\`\`text
合并规则：
- 简单值（image、environment 的某 key）：后者覆盖前者
- 列表（ports、volumes）：合并去重
- 映射（environment 整体）：按 key 合并，后者覆盖同名 key
- 服务：新增的服务会加进来

注意：合并不是简单覆盖，是按字段类型智能合并，理解这点能避免很多坑。
\`\`\`

---

## 二、docker-compose.override.yml 自动加载

### 2.1 自动加载机制

Compose 默认会自动加载两个文件：\`docker-compose.yml\` 和 \`docker-compose.override.yml\`（如果存在）。这是开发环境最方便的方式。

\`\`\`text
默认加载顺序：
1. docker-compose.yml        基础
2. docker-compose.override.yml  自动覆盖（如果存在）

只需把开发覆盖写进 override 文件，直接 docker compose up 就会自动合并。
\`\`\`

### 2.2 典型用法

\`\`\`bash
# docker-compose.yml        生产/通用配置
# docker-compose.override.yml  开发覆盖（不进 Git）

# 开发时直接：
docker compose up -d          # 自动合并 base + override

# 生产时显式排除 override：
docker compose -f docker-compose.yml up -d
\`\`\`

### 2.3 把 override 加入 .gitignore

\`\`\`bash
# .gitignore
docker-compose.override.yml      # 每个人本地自定义，不进版本库

# 提供 override 模板
docker-compose.override.yml.example
\`\`\`

---

## 三、profiles：环境与服务隔离

### 3.1 profiles 是什么

\`profiles\` 给服务打标签，启动时用 \`--profile\` 选择激活哪些标签。没标签的服务总是启动，有标签的只在对应 profile 激活时才启动。

\`\`\`yaml
version: "3.9"
services:
  web:
    image: myapp                 # 没标 profile，总是启动
    profiles: []                 # 等同于不写

  db:
    image: postgres              # 总是启动

  debug-tools:
    image: nicolaka/netshoot     # 仅 debug profile 启动
    profiles:
      - debug

  load-test:
    image: busybox
    profiles:
      - test
\`\`\`

### 3.2 启动指定 profile

\`\`\`bash
# 默认启动：只起 web、db（没标签的）
docker compose up -d

# 启用 debug profile：连 debug-tools 一起起
docker compose --profile debug up -d

# 启用 test profile：跑压测
docker compose --profile test up -d

# 同时启用多个 profile
docker compose --profile debug --profile test up -d

# 启动特定 profile 的服务
docker compose --profile debug up -d debug-tools
\`\`\`

### 3.3 典型场景：dev / test / prod 隔离

\`\`\`yaml
version: "3.9"
services:
  app:
    image: myapp
    profiles: ["dev", "test", "prod"]   # 三个 profile 都起 app

  app-dev:
    image: myapp-dev
    build:
      context: .
      target: dev                        # 开发用 dev 构建阶段
    volumes:
      - ./src:/app/src
    profiles: ["dev"]

  app-prod:
    image: myapp-prod
    build:
      context: .
      target: prod
    restart: always
    profiles: ["prod"]

  mock-server:
    image: mockserver
    profiles: ["test"]                   # 仅测试用 mock

  prometheus:
    image: prom/prometheus
    profiles: ["prod"]                   # 仅生产装监控
\`\`\`

\`\`\`bash
# 开发
docker compose --profile dev up -d

# 测试
docker compose --profile test up -d

# 生产
docker compose --profile prod up -d
\`\`\`

### 3.4 profiles 与 depends_on 的关系

\`\`\`text
注意：如果 A depends_on B，而 B 有 profile 标签且未激活，
启动 A 时会报错 "service B is disabled by profile"。
解决：要么给 A 也加同样的 profile，要么启动时带上 B 的 profile。
\`\`\`

---

## 四、环境变量插值与 .env

### 4.1 变量插值语法

Compose 文件里可以用 \`\${VAR}\` 引用宿主机或 .env 文件里的环境变量，启动时替换：

\`\`\`yaml
services:
  db:
    image: postgres:\${PG_VERSION:-15}        # 用 PG_VERSION，没设就默认 15
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD}      # 引用变量
  web:
    image: myapp:\${APP_TAG:-latest}          # 标签用变量
    ports:
      - "\${WEB_PORT:-8000}:8000"             # 端口可配置，默认 8000
\`\`\`

\`\`\`text
插值语法：
\${VAR}          引用变量，未设则为空
\${VAR:-default} 变量未设或为空时用 default
\${VAR-default}  变量未设（设了空也算有）时用 default
\${VAR:?error}   变量未设时报错退出（强制必填）
\${VAR:?}        变量未设时报错"VAR is required"
\`\`\`

### 4.2 .env 文件

Compose 启动时自动读取项目根目录的 \`.env\` 文件，作为变量来源：

\`\`\`bash
# .env 文件
PG_VERSION=15
DB_PASSWORD=s3cret
APP_TAG=v1.2.0
WEB_PORT=8000
\`\`\`

\`\`\`bash
# .env 自动被加载，不用额外指定
docker compose up -d        # PG_VERSION 等变量会从 .env 读
\`\`\`

### 4.3 变量优先级

\`\`\`text
变量来源优先级（高到低）：
1. shell 环境变量（export VAR=xxx）
2. docker compose --env-file 指定的文件
3. 项目根目录 .env 文件
4. Compose 文件里的默认值 \${VAR:-default}
\`\`\`

\`\`\`bash
# 用 shell 变量覆盖 .env
export DB_PASSWORD=override
docker compose up -d        # 用 override 而非 .env 里的值

# 指定不同的 env 文件
docker compose --env-file .env.prod up -d
\`\`\`

### 4.4 插值 vs environment 的区别

\`\`\`text
插值 \${VAR}：
- 在 Compose 解析文件时替换，影响的是 Compose 配置本身
- 替换 docker-compose.yml 里的值
- 变量来自宿主机/.env

environment KEY: VALUE：
- 注入到容器内部，容器里的进程能读到
- 不影响 Compose 配置解析

两者可结合：用插值从 .env 读值，再通过 environment 注入容器
\`\`\`

\`\`\`yaml
services:
  web:
    image: myapp
    environment:
      DB_PASSWORD: \${DB_PASSWORD}    # 从 .env 读，注入容器
\`\`\`

---

## 五、网络配置：自定义网络与别名

### 5.1 默认网络

不写 networks 时，Compose 自动创建一个 \`<项目名>_default\` 网络，所有服务接入它：

\`\`\`yaml
# 等同于自动创建 default 网络
services:
  web:
    image: nginx
  db:
    image: postgres
# web 能用 db 当主机名访问数据库
\`\`\`

### 5.2 自定义网络

\`\`\`yaml
version: "3.8"
services:
  web:
    image: nginx
    networks:
      - frontend                 # web 在 frontend 网络
  db:
    image: postgres
    networks:
      - backend                  # db 在 backend 网络
  api:
    image: myapi
    networks:
      - frontend                 # api 同时在两个网络
      - backend                  # 充当前后端桥梁

networks:
  frontend:                      # 前端网络（web、api）
    driver: bridge
  backend:                       # 后端网络（db、api）
    driver: bridge
    internal: true               # 内部网络，不能访问外网
\`\`\`

\`\`\`text
网络隔离效果：
- web 只能访问 api，访问不到 db（不在同网络）
- db 只能被 api 访问，web 连不上（更安全）
- api 横跨两个网络，做转发
- backend 设 internal: true，db 容器无法访问外网，防数据外泄
\`\`\`

### 5.3 网络别名

一个服务可以在网络里有多个别名，其他容器用任一别名都能访问它：

\`\`\`yaml
services:
  db:
    image: postgres
    networks:
      backend:
        aliases:
          - postgres             # 别名 1
          - database             # 别名 2
          - dbhost               # 别名 3
  web:
    networks:
      backend:
        # web 容器里用 postgres / database / dbhost 都能连到 db
\`\`\`

### 5.4 复用外部已存在的网络

\`\`\`yaml
networks:
  shared:
    name: my-shared-network      # 指定网络名
    external: true               # 用已存在的外部网络，不创建新的
\`\`\`

\`\`\`bash
# 先手动创建网络
docker network create my-shared-network

# 多个 compose 项目共享这个网络
docker compose -f projectA/docker-compose.yml up -d
docker compose -f projectB/docker-compose.yml up -d
# A 和 B 的容器能互相通信
\`\`\`

### 5.5 IPv6 与自定义子网

\`\`\`yaml
networks:
  mynet:
    driver: bridge
    enable_ipv6: true
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
\`\`\`

---

## 六、资源限制：cpus 与 memory

### 6.1 deploy.resources（v3 推荐写法）

\`\`\`yaml
services:
  web:
    image: nginx
    deploy:
      resources:
        limits:                  # 硬上限，超过会被限制或杀掉
          cpus: "0.5"            # 最多用半核 CPU
          memory: 512M           # 最多 512MB 内存
        reservations:            # 预留（保证至少有这么多）
          cpus: "0.1"
          memory: 128M
\`\`\`

\`\`\`text
注意：deploy.resources 在 swarm 模式完全生效。
在 docker compose up（非 swarm）下：
- v2 起 limits/reservations 也能在 compose 单机模式生效
- 老版本可能需要用 mem_limit / cpus（已废弃但能用）
\`\`\`

### 6.2 老式写法（兼容，不推荐）

\`\`\`yaml
services:
  web:
    image: nginx
    mem_limit: 512m              # 内存上限
    cpus: 0.5                    # CPU 上限
    mem_reservation: 128m        # 内存预留
\`\`\`

### 6.3 限制单位

\`\`\`text
内存单位：
- b / k / m / g     字节 / KB / MB / GB
- 512m              512 MB
- 2g                2 GB

CPU：
- "0.5"             半核（500m）
- "1.0" 或 1        1 核
- "2.5"             2.5 核
\`\`\`

### 6.4 实战：给不同服务分级限制

\`\`\`yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M

  worker:                        # 后台任务，给多点
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G

  db:                            # 数据库最重要，给最多
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
\`\`\`

\`\`\`bash
# 查看容器实际资源使用
docker stats
docker compose top
\`\`\`

---

## 七、secrets 与 configs：敏感数据管理

### 7.1 secrets：管理密码、密钥

secrets 把敏感数据（密码、私钥、证书）以文件形式挂进容器，比环境变量更安全：

\`\`\`yaml
version: "3.8"
services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password   # 用 _FILE 后缀
    secrets:
      - db_password

  web:
    image: myapp
    secrets:
      - api_key

secrets:
  db_password:                   # 从宿主机文件读取
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
\`\`\`

\`\`\`text
secrets 工作原理：
1. 在宿主机准备 secrets 文件（如 ./secrets/db_password.txt 内容就是密码）
2. Compose 把文件挂到容器内 /run/secrets/<secret名>
3. 应用从文件读密码，而不是从环境变量
4. 文件在容器内是只读的，更安全
5. 不会出现在 docker inspect 的环境变量里
\`\`\`

\`\`\`bash
# 准备 secret 文件
mkdir -p secrets
echo -n "my-super-secret-password" > secrets/db_password.txt
echo -n "sk-xxxxx" > secrets/api_key.txt
chmod 600 secrets/*              # 限制权限

# 启动
docker compose up -d
\`\`\`

### 7.2 应用读取 secret

\`\`\`python
# Python 应用从文件读密码
import os

# 方法1：很多镜像支持 _FILE 后缀，自动从文件读
# POSTGRES_PASSWORD_FILE=/run/secrets/db_password

# 方法2：应用代码自己读
def get_secret(name):
    path = f"/run/secrets/{name}"
    with open(path) as f:
        return f.read().strip()

db_password = get_secret("db_password")
\`\`\`

### 7.3 configs：非敏感配置文件

configs 用法类似 secrets，但用于非敏感的配置文件（如 nginx.conf）：

\`\`\`yaml
services:
  nginx:
    image: nginx
    configs:
      - source: nginx_conf
        target: /etc/nginx/nginx.conf

configs:
  nginx_conf:
    file: ./nginx/nginx.conf
\`\`\`

### 7.4 外部 secrets（Docker Swarm 用）

\`\`\`yaml
secrets:
  db_password:
    external: true               # 用 docker secret create 预先创建的
    name: prod_db_password
\`\`\`

\`\`\`bash
# swarm 模式下创建
echo "my-password" | docker secret create prod_db_password -
\`\`\`

---

## 八、综合实战：多环境配置分离

### 8.1 项目结构

\`\`\`text
myproject/
├── docker-compose.yml              基础配置
├── docker-compose.override.yml     开发覆盖（不进 Git）
├── docker-compose.prod.yml         生产覆盖
├── docker-compose.test.yml         测试覆盖
├── .env                            通用变量
├── .env.prod                       生产变量
└── secrets/                        敏感数据
    ├── db_password.txt
    └── api_key.txt
\`\`\`

### 8.2 .env 文件分离

\`\`\`bash
# .env（开发用）
APP_TAG=dev
DB_PASSWORD=dev-secret
WEB_PORT=8000

# .env.prod（生产用）
APP_TAG=v1.2.0
DB_PASSWORD=prod-super-secret
WEB_PORT=80
\`\`\`

### 8.3 启动不同环境

\`\`\`bash
# 开发（自动加载 .env + override.yml）
docker compose up -d

# 测试
docker compose --env-file .env -f docker-compose.yml -f docker-compose.test.yml up -d

# 生产
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d

# 写成 Makefile 方便调用
\`\`\`

### 8.4 Makefile 简化

\`\`\`makefile
# Makefile
.PHONY: dev test prod down logs

dev:
	docker compose up -d --build

test:
	docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --build

prod:
	docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build

down:
	docker compose down

logs:
	docker compose logs -f
\`\`\`

\`\`\`bash
make dev      # 启动开发环境
make prod     # 启动生产环境
make logs     # 看日志
\`\`\`

---

## 九、常见坑与最佳实践

\`\`\`text
1. 变量插值只在解析时发生，容器内读不到插值变量
   错：web 容器里 os.environ.get("APP_TAG") 拿不到 \${APP_TAG}
   对：用 environment 把值注入容器

2. override.yml 默认自动加载，生产部署记得 -f 显式指定

3. profiles 服务依赖无 profile 的服务没问题，反过来要小心

4. secrets 文件权限要 600，且加入 .gitignore

5. 资源限制别设太小，OOM 会被杀；别设太大，浪费资源

6. internal 网络的服务装不了包（访问不了外网），调试时单独起个能上网的容器

7. .env 文件别进 Git，提供 .env.example 模板
\`\`\`

---

## 十、小结

\`\`\`text
1. 多文件合并：基础 + 覆盖，-f 多次指定，后者覆盖前者
2. override.yml 自动加载，开发友好，生产要 -f 排除
3. profiles 给服务打标签，--profile 选择激活
4. 变量插值 \${VAR} 配 .env 文件，注意和 environment 区别
5. 自定义网络做隔离，aliases 给服务起多个名
6. deploy.resources 限制 CPU/内存，按服务重要性分配
7. secrets 管理敏感数据，比环境变量安全
8. Makefile 封装多环境启动命令，团队协作更顺
\`\`\`

最后一章，我们把前面所有知识用起来，编排一个完整的 Python 全栈应用：FastAPI + PostgreSQL + Redis + Nginx，覆盖 Django + Celery、Flask + Gunicorn 等常见组合，并做开发/生产环境分离。
`
  },

  {
    id: "deploy-compose-python",
    icon: "🐍",
    title: "Python 全栈应用编排实战",
    group: "Docker Compose 编排",
    content: `# Python 全栈应用编排实战

理论学了这么多，这一章我们把所有知识串起来，编排真实的 Python 全栈应用。会覆盖三种最常见的技术栈组合：FastAPI + PG + Redis + Nginx、Django + MySQL + Celery + RabbitMQ、Flask + Gunicorn + Nginx，并做开发/测试/生产环境分离。学完这章，你接手任何 Python 项目的容器化部署都不慌。

## 一、完整项目结构设计

一个生产级 Python 全栈项目通常包含这些角色：

\`\`\`text
┌─────────────────────────────────────────────────────┐
│  用户浏览器                                          │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP
          ┌────────▼─────────┐
          │   Nginx (80/443) │  反向代理 + 静态文件 + HTTPS
          └────────┬─────────┘
                   │
          ┌────────▼─────────┐
          │  Web App (8000)  │  FastAPI / Django / Flask
          │  Gunicorn/Uvicorn│  应用服务器
          └──┬──────────┬────┘
             │          │
   ┌─────────▼──┐   ┌──▼─────────┐
   │ PostgreSQL │   │   Redis    │  缓存/会话
   │  / MySQL   │   │            │
   └─────────┬──┘   └──┬─────────┘
             │          │
          ┌──▼──────────▼──┐
          │  Celery Worker │  异步任务（可选）
          │  + 消息队列     │
          └────────────────┘
\`\`\`

### 1.1 标准目录结构

\`\`\`text
myproject/
├── app/                          应用代码
│   ├── main.py                   入口
│   ├── Dockerfile
│   └── requirements.txt
├── nginx/                        Nginx 配置
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml            基础配置
├── docker-compose.dev.yml        开发覆盖
├── docker-compose.prod.yml       生产覆盖
├── .env.example                  环境变量模板
├── .env                          真实变量（不进 Git）
├── secrets/                      敏感数据
│   ├── db_password.txt
│   └── secret_key.txt
└── Makefile                      封装常用命令
\`\`\`

---

## 二、实战一：FastAPI + PostgreSQL + Redis + Nginx

### 2.1 应用代码

\`\`\`python
# app/main.py
from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import redis
import os

DATABASE_URL = os.environ["DATABASE_URL"]
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
r = redis.Redis(host=REDIS_HOST, port=6379, decode_responses=True)

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    visits = r.incr("visits")
    return {"message": "Hello FastAPI", "visits": visits}

@app.get("/items")
def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
\`\`\`

\`\`\`text
# app/requirements.txt
fastapi==0.108.0
uvicorn[standard]==0.25.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
redis==5.0.1
\`\`\`

### 2.2 应用 Dockerfile（多阶段构建）

\`\`\`dockerfile
# app/Dockerfile
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim
WORKDIR /app

# 拷贝已安装的依赖
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### 2.3 Nginx 配置

\`\`\`text
# nginx/nginx.conf
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    upstream fastapi_backend {
        server app:8000;            # 用服务名 app 做后端
    }

    server {
        listen 80;
        server_name localhost;

        # 静态文件（如有）
        location /static/ {
            alias /app/static/;
        }

        # 反向代理到 FastAPI
        location / {
            proxy_pass http://fastapi_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
\`\`\`

### 2.4 基础 docker-compose.yml

\`\`\`yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://app:\${DB_PASSWORD}@db:5432/myapp
      REDIS_HOST: redis
    expose:
      - "8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    expose:
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    networks:
      - backend

  redis:
    image: redis:7-alpine
    expose:
      - "6379"
    volumes:
      - redisdata:/data
    restart: always
    networks:
      - backend

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    depends_on:
      - app
    restart: always
    networks:
      - frontend
      - backend

volumes:
  pgdata:
  redisdata:

networks:
  frontend:
  backend:
    internal: false
\`\`\`

### 2.5 .env 文件

\`\`\`bash
# .env
DB_PASSWORD=change_me_in_prod
\`\`\`

### 2.6 启动

\`\`\`bash
# 构建并启动
docker compose up -d --build

# 查看状态
docker compose ps

# 测试
curl http://localhost/
# {"message":"Hello FastAPI","visits":1}

# 进入 app 容器调试
docker compose exec app bash

# 看实时日志
docker compose logs -f app
\`\`\`

---

## 三、实战二：Django + MySQL + Celery + RabbitMQ

### 3.1 架构说明

\`\`\`text
Django 应用 + MySQL 数据库 + Celery 异步任务 + RabbitMQ 消息队列 + Redis 结果后端 + Nginx 反代
\`\`\`

### 3.2 docker-compose.yml

\`\`\`yaml
version: "3.8"

services:
  web:
    build: ./django
    command: gunicorn myproject.wsgi:application -w 4 -b 0.0.0.0:8000
    environment:
      DATABASE_URL: mysql://django:\${DB_PASSWORD}@mysql:3306/myproject
      CELERY_BROKER_URL: amqp://guest:guest@rabbitmq:5672//
      CELERY_RESULT_BACKEND: redis://redis:6379/0
      DJANGO_SETTINGS_MODULE: myproject.settings
    volumes:
      - ./django:/app                   # 开发热重载
      - static_files:/app/static
    expose:
      - "8000"
    depends_on:
      mysql:
        condition: service_healthy
      rabbitmq:
        condition: service_started
      redis:
        condition: service_started
    networks:
      - backend

  worker:                                # Celery worker
    build: ./django
    command: celery -A myproject worker -l info
    environment:
      DATABASE_URL: mysql://django:\${DB_PASSWORD}@mysql:3306/myproject
      CELERY_BROKER_URL: amqp://guest:guest@rabbitmq:5672//
      CELERY_RESULT_BACKEND: redis://redis:6379/0
    depends_on:
      - web                              # 复用 web 的镜像和环境
      rabbitmq
      redis
    restart: always
    networks:
      - backend

  beat:                                  # Celery beat 定时任务
    build: ./django
    command: celery -A myproject beat -l info
    environment:
      CELERY_BROKER_URL: amqp://guest:guest@rabbitmq:5672//
      CELERY_RESULT_BACKEND: redis://redis:6379/0
    depends_on:
      - rabbitmq
    restart: always
    networks:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: myproject
      MYSQL_USER: django
      MYSQL_PASSWORD: \${DB_PASSWORD}
    volumes:
      - mysqldata:/var/lib/mysql
    expose:
      - "3306"
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -p\${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s
    restart: always
    networks:
      - backend

  rabbitmq:                              # 消息队列
    image: rabbitmq:3-management         # 带 web 管理界面
    expose:
      - "5672"
      - "15672"
    ports:
      - "15672:15672"                    # 管理界面（生产应删掉或加保护）
    restart: always
    networks:
      - backend

  redis:                                 # Celery 结果后端 + 缓存
    image: redis:7-alpine
    restart: always
    networks:
      - backend

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - static_files:/app/static:ro      # 共享静态文件
    ports:
      - "80:80"
    depends_on:
      - web
    networks:
      - frontend
      - backend

volumes:
  mysqldata:
  static_files:

networks:
  frontend:
  backend:
\`\`\`

### 3.3 数据库迁移与初始化

\`\`\`yaml
# 加一个一次性的迁移服务
services:
  migrate:
    build: ./django
    command: python manage.py migrate --noinput
    environment:
      DATABASE_URL: mysql://django:\${DB_PASSWORD}@mysql:3306/myproject
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - backend
    restart: "no"                        # 跑完就退出，不重启
\`\`\`

\`\`\`bash
# 启动顺序：先起 db → 跑 migrate → 再起 web
docker compose up -d mysql
docker compose run --rm migrate
docker compose up -d

# 创建超级用户
docker compose run --rm web python manage.py createsuperuser

# 收集静态文件
docker compose run --rm web python manage.py collectstatic --noinput
\`\`\`

---

## 四、实战三：Flask + Gunicorn + Nginx

### 4.1 简化编排（适合小型应用）

\`\`\`yaml
version: "3.8"

services:
  app:
    build: .
    image: flaskapp:latest
    command: gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - app:app
    environment:
      FLASK_ENV: production
      DATABASE_URL: postgresql://flask:\${DB_PASSWORD}@db:5432/flaskapp
    expose:
      - "5000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: flask
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: flaskapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flask"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: always

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"
    depends_on:
      - app
    restart: always

volumes:
  pgdata:
\`\`\`

### 4.2 Gunicorn 配置文件方式

\`\`\`python
# gunicorn.conf.py
bind = "0.0.0.0:5000"
workers = 4                   # CPU 核数 * 2 + 1
worker_class = "gevent"       # 用 gevent 提升并发
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000           # 处理 1000 请求后重启 worker，防内存泄漏
max_requests_jitter = 50
accesslog = "-"               # 输出到 stdout
errorlog = "-"
loglevel = "info"
\`\`\`

\`\`\`yaml
# compose 里改用配置文件
services:
  app:
    command: gunicorn -c gunicorn.conf.py app:app
    volumes:
      - ./gunicorn.conf.py:/app/gunicorn.conf.py:ro
\`\`\`

---

## 五、数据初始化与迁移

### 5.1 数据库初始化脚本

\`\`\`yaml
services:
  init-db:
    image: myapp
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://app:\${DB_PASSWORD}@db:5432/myapp
    command: |
      sh -c "
        python manage.py migrate --noinput &&
        python manage.py collectstatic --noinput &&
        python scripts/init_data.py
      "
    restart: "no"
\`\`\`

### 5.2 用 depends_on 等待初始化完成

\`\`\`yaml
services:
  init-db:
    # ... 如上
  web:
    depends_on:
      init-db:
        condition: service_completed    # 等初始化完成
\`\`\`

### 5.3 数据库种子数据

\`\`\`yaml
services:
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d:ro   # 自动执行初始化 SQL
    environment:
      POSTGRES_PASSWORD: secret
\`\`\`

\`\`\`bash
# init/01_create_schema.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

# init/02_seed_data.sql
INSERT INTO users (name) VALUES ('admin'), ('test');
\`\`\`

\`\`\`text
PostgreSQL 镜像会在首次启动时自动执行
/docker-entrypoint-initdb.d/ 下的 .sql/.sh 文件（按文件名排序）。
注意：只在数据卷为空（首次初始化）时执行，已有数据则跳过。
\`\`\`

---

## 六、开发 / 测试 / 生产环境分离

### 6.1 开发环境覆盖 docker-compose.dev.yml

\`\`\`yaml
version: "3.8"
services:
  app:
    build:
      target: dev                      # 用 Dockerfile 的 dev 阶段
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000
    volumes:
      - ./app:/app                     # 挂源码，改代码立即生效
    environment:
      DEBUG: "true"
    ports:
      - "8000:8000"                    # 直接访问，绕过 nginx
      - "5678:5678"                    # debugpy 远程调试端口

  db:
    ports:
      - "5432:5432"                    # 本地客户端能连

  adminer:                             # 数据库 web 界面
    image: adminer
    ports:
      - "8080:8080"

  mailhog:                             # 邮件捕获（开发不发真邮件）
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
\`\`\`

### 6.2 测试环境覆盖 docker-compose.test.yml

\`\`\`yaml
version: "3.8"
services:
  app:
    build:
      target: test
    command: pytest -v --cov=app
    environment:
      TESTING: "true"
      DATABASE_URL: postgresql://test:test@db:5432/testdb
    depends_on:
      db:
        condition: service_healthy

  db:
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: testdb
    # 测试用临时数据，不挂载持久卷
\`\`\`

### 6.3 生产环境覆盖 docker-compose.prod.yml

\`\`\`yaml
version: "3.8"
services:
  app:
    build:
      target: prod
    environment:
      DEBUG: "false"
      SECRET_KEY_FILE: /run/secrets/secret_key
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
        reservations:
          memory: 256M
    restart: always
    secrets:
      - secret_key
      - db_password

  db:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
    secrets:
      - db_password

  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro        # HTTPS 证书

secrets:
  secret_key:
    file: ./secrets/secret_key.txt
  db_password:
    file: ./secrets/db_password.txt
\`\`\`

### 6.4 环境变量文件分离

\`\`\`bash
# .env（开发）
DB_PASSWORD=dev-secret
DEBUG=true

# .env.test
DB_PASSWORD=test-secret
TESTING=true

# .env.prod
DB_PASSWORD=prod-super-secret
DEBUG=false
\`\`\`

### 6.5 Makefile 封装

\`\`\`makefile
.PHONY: dev test prod down logs ps migrate shell

dev:
	docker compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up -d --build

test:
	docker compose --env-file .env.test -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit --exit-code app

prod:
	docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build

migrate:
	docker compose run --rm app python manage.py migrate

shell:
	docker compose exec app bash

logs:
	docker compose logs -f

ps:
	docker compose ps

down:
	docker compose down

down-prod:
	docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml down
\`\`\`

---

## 七、完整生产级 docker-compose.yml（含详细注释）

\`\`\`yaml
# ============================================================
# 生产环境完整编排示例
# FastAPI + PostgreSQL + Redis + Celery + Nginx
# ============================================================
version: "3.8"

services:
  # -------------------- Web 应用 --------------------
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
      target: prod                       # 用多阶段构建的 prod 阶段
    image: myapp:\${APP_TAG:-latest}
    container_name: myapp-app
    command: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
    environment:
      DATABASE_URL: postgresql://app:\${DB_PASSWORD}@db:5432/myapp
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/1
      SECRET_KEY_FILE: /run/secrets/secret_key
      DEBUG: "false"
      LOG_LEVEL: info
    expose:
      - "8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: always
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    secrets:
      - secret_key
    networks:
      - backend
    logging:
      driver: json-file
      options:
        max-size: "10m"                  # 单个日志文件最大 10MB
        max-file: "3"                    # 最多保留 3 个日志文件

  # -------------------- Celery Worker --------------------
  worker:
    build:
      context: ./app
      target: prod
    image: myapp:\${APP_TAG:-latest}
    command: celery -A app.celery worker -l info --concurrency=4
    environment:
      DATABASE_URL: postgresql://app:\${DB_PASSWORD}@db:5432/myapp
      CELERY_BROKER_URL: redis://redis:6379/1
      CELERY_RESULT_BACKEND: redis://redis:6379/2
    depends_on:
      - app
      redis
    restart: always
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    networks:
      - backend
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # -------------------- 数据库 --------------------
  db:
    image: postgres:15-alpine
    container_name: myapp-db
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/backups:/backups            # 备份目录
    expose:
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: always
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
    secrets:
      - db_password
    networks:
      - backend
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"

  # -------------------- Redis --------------------
  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    expose:
      - "6379"
    volumes:
      - redisdata:/data
    restart: always
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  # -------------------- Nginx 反向代理 --------------------
  nginx:
    image: nginx:alpine
    container_name: myapp-nginx
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
      - nginx_logs:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://localhost/ || exit 1"]
    networks:
      - frontend
      - backend
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"

# -------------------- 卷 --------------------
volumes:
  pgdata:
    name: myapp_pgdata
  redisdata:
    name: myapp_redisdata
  nginx_logs:

# -------------------- 网络 --------------------
networks:
  frontend:
    name: myapp_frontend
  backend:
    name: myapp_backend
    internal: false

# -------------------- 敏感数据 --------------------
secrets:
  db_password:
    file: ./secrets/db_password.txt
  secret_key:
    file: ./secrets/secret_key.txt
\`\`\`

### 7.1 关键设计点解读

\`\`\`text
1. 多阶段构建：target: prod 用精简镜像，不含编译工具
2. 健康检查：app/db/redis/nginx 全配 healthcheck，确保就绪
3. 资源限制：按重要性分配，db 给最多资源
4. 日志限制：max-size + max-file 防止日志撑爆磁盘
5. secrets 管理：密码用文件注入，不进环境变量
6. 网络分层：frontend 对外，backend 内部
7. 命名卷：name 指定卷名，便于备份管理
8. 重启策略：全部 always，保证高可用
9. depends_on 条件：等 db healthy 再起 app
10. container_name 固定：便于日志收集和监控
\`\`\`

### 7.2 Nginx 生产配置（HTTPS）

\`\`\`text
# nginx/nginx.prod.conf
worker_processes auto;
events { worker_connections 2048; }

http {
    upstream app_backend {
        server app:8000;
        keepalive 32;
    }

    # 限流
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name myapp.example.com;
        return 301 https://$host$request_uri;     # HTTP 跳 HTTPS
    }

    server {
        listen 443 ssl http2;
        server_name myapp.example.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        client_max_body_size 20m;

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 60s;
        }

        location /health {
            access_log off;
            return 200 "ok\\n";
        }
    }
}
\`\`\`

---

## 八、运维操作手册

### 8.1 日常运维命令

\`\`\`bash
# 部署新版本
git pull
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 滚动重启（不停所有，逐个重启）
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml restart app

# 跑数据库迁移
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml run --rm app python manage.py migrate

# 备份数据库
docker compose exec db pg_dump -U app myapp > backups/db_$(date +%Y%m%d).sql

# 恢复数据库
cat backups/db_20240101.sql | docker compose exec -T db psql -U app myapp

# 查看 Redis 状态
docker compose exec redis redis-cli info

# 查看实时日志
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml logs -f app

# 查看资源使用
docker stats myapp-app myapp-db myapp-redis
\`\`\`

### 8.2 监控与健康检查

\`\`\`bash
# 检查所有服务健康状态
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml ps
# 关注 STATUS 列的 (healthy) / (unhealthy)

# unhealthy 的服务手动排查
docker compose logs --since 10m db    # 看最近 10 分钟 db 日志
docker compose exec db sh             # 进容器查
\`\`\`

### 8.3 升级与回滚

\`\`\`bash
# 升级流程
docker compose pull                    # 拉新镜像
docker compose up -d --no-deps app     # 只重建 app，不动 db
docker compose logs -f app             # 观察启动日志

# 回滚（用旧镜像）
export APP_TAG=v1.0.0                  # 切回旧版本标签
docker compose up -d --no-deps app
\`\`\`

---

## 九、常见问题排查

\`\`\`text
Q: 容器启动报 Connection refused 连不上数据库
A: 用 depends_on condition: service_healthy + 给 db 配 healthcheck

Q: 改了代码容器没更新
A: docker compose up -d --build 重建镜像，光 restart 不行

Q: 生产 down 后数据没了
A: 检查是否用了 down -v（会删卷），生产绝不用 -v

Q: 日志把磁盘撑爆
A: 给每个服务配 logging max-size + max-file

Q: 容器里时间不对
A: 挂载时区 -v /etc/localtime:/etc/localtime:ro 或设 TZ=Asia/Shanghai

Q: 端口被占用
A: docker ps 看谁占了，或改宿主端口

Q: Windows/Mac 绑定挂载权限问题
A: 用命名卷代替绑定挂载，或调整 USER

Q: 构建特别慢
A: 利用 Dockerfile 缓存层（先 COPY requirements 再装包），--no-cache 仅排查用
\`\`\`

---

## 十、整套教程总结

到这里，Docker Compose 编排部分就完整了。回顾这 5 章我们学了：

\`\`\`text
第 1 章 Compose 简介与安装
  → 理解 Compose 解决什么问题，安装好工具，跑通第一个 Flask+Redis

第 2 章 服务配置详解
  → image/build、ports/expose、volumes、environment、depends_on、restart、healthcheck

第 3 章 Compose 命令详解
  → up/down/start/stop、ps/logs/top、exec/run、build/pull/push、config、scale

第 4 章 多环境与 profiles
  → 多文件合并、override、profiles、变量插值、网络、资源限制、secrets

第 5 章 Python 全栈编排实战
  → FastAPI/Django/Flask 全栈编排、数据初始化、环境分离、生产级配置
\`\`\`

掌握这套体系，你已经能：

\`\`\`text
1. 用一个 YAML 文件描述整个多容器应用
2. 一条命令启动/停止/重建所有服务
3. 管理开发/测试/生产三套环境
4. 处理服务依赖、健康检查、资源限制
5. 安全地管理密码、密钥等敏感数据
6. 编排 FastAPI/Django/Flask 全栈应用
7. 做日常运维：部署、升级、回滚、备份、监控
\`\`\`

下一批章节我们将进入 Nginx 反向代理的深入配置，学习如何用 Nginx 做负载均衡、HTTPS 终止、缓存、限流，把容器化应用前面的"门面"打牢。
`
  },

];
