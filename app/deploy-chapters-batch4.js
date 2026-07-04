// =============================================================
// Python 部署与运维实战教程 —— 第 4 批章节（Docker 容器化 7 章）
// -------------------------------------------------------------
// 覆盖：Docker 简介与安装 → 镜像管理 → 容器生命周期 → Dockerfile 编写
//       → 网络与数据卷 → Python 应用容器化实战 → Docker 最佳实践
// =============================================================

export const chapters = [
  {
    id: "deploy-docker-intro",
    icon: "🐳",
    title: "Docker 简介与安装",
    group: "Docker 容器化",
    content: `# Docker 简介与安装

## 一、为什么必须学 Docker

在讲 Docker 之前，先看一个几乎所有运维新手都踩过的坑。

假设你写了一个 Python Web 服务，在自己电脑上跑得好好的，一部署到服务器就报错：

\`\`\`text
本地（macOS，Python 3.12，依赖装在虚拟环境里）：✅ 一切正常
服务器（Ubuntu 22.04，Python 3.10，系统全局装依赖）：❌ ImportError / 版本不兼容
\`\`\`

你花了半天对比两边环境：Python 版本不一样、pip 包版本不一样、系统库 libxml2 版本不一样、甚至时区都不一样。最后你绝望地发现：**"在我电脑上能跑"这句话，是程序员最大的谎言之一。**

Docker 就是为了消灭这句谎言而生的。它把"代码 + 依赖 + 运行环境 + 系统库"打包成一个整体（镜像），无论搬到哪台机器上，跑出来的环境完全一致。这正是它成为现代部署事实标准的根本原因。

\`\`\`text
没有 Docker 的世界：
  开发机 → 测试机 → 生产机，每台都要重新装一遍环境，祈祷它们一致

有 Docker 的世界：
  构建一次镜像 → 到处运行（Build once, run anywhere）
\`\`\`

---

## 二、容器是什么：对比虚拟机与进程

很多人对"容器"这个词似懂非懂。理解容器的关键，是把它和两个老朋友对比：**进程**和**虚拟机**。

### 2.1 进程：最轻量，但隔离最弱

普通进程就是操作系统里跑的一个程序，比如你在终端执行 \`python app.py\`，就启动了一个进程。

\`\`\`bash
# 启动一个 Python 进程
python app.py &
# 查看进程
ps aux | grep python
# 输出示例：
# user  12345  0.5  1.2  35000 25000 pts/0  S  10:00  0:01 python app.py
\`\`\`

进程的问题：它和你机器上的所有东西共享同一套环境。它用的是系统全局的 Python、全局的 pip 包、全局的环境变量。两个进程想用不同版本的 Flask？做不到。

### 2.2 虚拟机：隔离最强，但太重

虚拟机（Virtual Machine, VM）是在物理机上用 Hypervisor（如 VMware、VirtualBox）模拟出一整套硬件，再装一个完整的操作系统。

\`\`\`text
虚拟机架构：
┌──────────────────────────────────────┐
│ 物理机 Host OS（macOS）              │
│  ┌──────────┐  ┌──────────┐         │
│  │ 虚拟机1   │  │ 虚拟机2   │         │
│  │ 完整 OS  │  │ 完整 OS  │         │
│  │ 内核     │  │ 内核     │         │
│  │ 系统库   │  │ 系统库   │         │
│  │ App      │  │ App      │         │
│  └──────────┘  └──────────┘         │
│        Hypervisor 层                 │
└──────────────────────────────────────┘
\`\`\`

虚拟机隔离非常好（每个 VM 有自己的内核），但代价是"重"：每个 VM 都要装一个完整操作系统，占用几个 GB 磁盘，启动要几十秒到几分钟。

### 2.3 容器：隔离够用，又足够轻

容器是介于进程和虚拟机之间的方案。它不像虚拟机那样模拟硬件、装独立内核，而是**共享宿主机内核**，靠 Linux 内核的 namespace（命名空间隔离）和 cgroup（资源限制）技术，把进程"关进笼子"。

\`\`\`text
容器架构：
┌──────────────────────────────────────┐
│ 物理机 Host OS（Linux 内核）         │
│  ┌──────────┐  ┌──────────┐         │
│  │ 容器1     │  │ 容器2     │         │
│  │ App+依赖  │  │ App+依赖  │         │
│  │ (无内核)  │  │ (无内核)  │         │
│  └──────────┘  └──────────┘         │
│     Docker Engine（共享宿主内核）    │
└──────────────────────────────────────┘
\`\`\`

对比三者：

\`\`\`text
特性          进程        容器          虚拟机
─────────────────────────────────────────────
隔离强度      弱          中            强
资源占用      极小        小（MB级）    大（GB级）
启动速度      秒级        秒级          分钟级
是否带内核    否          否（共享）    是（独立）
性能损耗      无          几乎无        有（虚拟化）
一台机能跑多少 几百上千    几十~几百     几个~十几个
\`\`\`

记住这个核心区别：**容器不是迷你虚拟机，它是被隔离的进程。** 启动一个容器本质上就是启动一个进程，所以它快、轻，但又拥有独立的文件系统、网络、进程空间。

---

## 三、Docker 架构：客户端、守护进程、镜像、容器、仓库

Docker 采用经典的 **客户端-服务端（C/S）架构**，理解这五个核心概念，就理解了 Docker 的全貌。

\`\`\`text
┌───────────────┐     REST API      ┌──────────────────┐
│ Docker 客户端  │ ───────────────► │ Docker 守护进程   │
│ (docker 命令)  │ ◄─────────────── │ (dockerd)        │
└───────────────┘                   └────────┬─────────┘
                                             │ 管理
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                          ┌──────┐      ┌────────┐     ┌────────┐
                          │ 镜像  │      │ 容器    │     │ 仓库    │
                          │Image │      │Container│     │Registry│
                          └──────┘      └────────┘     └────────┘
\`\`\`

### 3.1 Docker 客户端（docker CLI）

就是你敲的 \`docker\` 命令。它本身不干活，只是把你的指令通过 REST API 发给守护进程。

\`\`\`bash
# 你敲的每条 docker 命令，本质都是给 dockerd 发一个 HTTP 请求
docker images        # 实际：GET /images/json
docker run nginx     # 实际：POST /containers/create + /containers/{id}/start
\`\`\`

### 3.2 Docker 守护进程（dockerd）

运行在后台的服务进程，真正干活的"大脑"。它负责构建镜像、运行容器、管理网络和存储。客户端可以本地，也可以远程连接到另一台机器的 dockerd。

\`\`\`bash
# 查看 dockerd 是否在跑
ps aux | grep dockerd
# 输出示例：
# root  987  2.0  5.0 800000 200000 ?  Ssl  09:00  0:30 /usr/bin/dockerd -H fd://

# 查看 docker 服务状态（Ubuntu）
sudo systemctl status docker
# 输出示例：
# ● docker.service - Docker Application Container Engine
#      Active: active (running)
\`\`\`

### 3.3 镜像（Image）

镜像是一个**只读的模板**，里面包含运行应用所需的一切：代码、运行时、库、环境变量、配置文件。可以理解成"容器的安装包"。

\`\`\`text
镜像 nginx:1.25 的内容：
- Debian 精简系统层
- nginx 二进制 + 依赖库
- 默认配置文件
- 暴露 80 端口
- 启动命令 nginx -g 'daemon off;'
\`\`\`

### 3.4 容器（Container）

容器是镜像的**运行实例**。镜像是静态的、只读的；容器是动态的、可写的。一个镜像可以同时启动多个容器，互不干扰。

\`\`\`bash
# 镜像 → 容器，类比 类 → 对象
docker run nginx           # 用 nginx 镜像启动一个容器
docker run nginx           # 再启动一个，互不影响
\`\`\`

### 3.5 仓库（Registry）

存放镜像的地方，类似 Git 的 GitHub。最知名的是 Docker Hub（hub.docker.com）。你可以从仓库拉取（pull）镜像，也可以把自己的镜像推送（push）上去。

\`\`\`text
Docker Hub     —— 公共仓库，类似 npm 的官方源
阿里云/网易镜像 —— 国内加速镜像
Harbor         —— 企业自建私有仓库
\`\`\`

---

## 四、Docker vs 传统部署对比

理解 Docker 的价值，最直观的方式是看同一件事在两种模式下怎么做。

### 4.1 部署一个 Python Web 服务

\`\`\`text
【传统部署】
1. SSH 登录服务器
2. 安装 Python 3.12（可能和系统自带的 3.10 冲突）
3. 创建虚拟环境 python -m venv venv
4. 激活虚拟环境 source venv/bin/activate
5. pip install -r requirements.txt（网络慢、编译失败、版本冲突）
6. 安装系统依赖 apt install libxml2-dev
7. 配置 systemd 服务
8. 配置 Nginx 反向代理
9. 换一台服务器？上面 8 步重来一遍，还可能不一样

【Docker 部署】
1. 写一个 Dockerfile（描述环境）
2. docker build 构建镜像（一次）
3. docker run 启动容器
4. 换一台服务器？只要装了 Docker，docker pull + docker run，环境 100% 一致
\`\`\`

### 4.2 多服务联调

\`\`\`text
传统方式跑 Web + MySQL + Redis：
- 三个服务装在同一台机器，端口可能冲突
- 升级 MySQL 怕影响 Web
- 想再加一台 Redis 做主从？手动改配置

Docker 方式：
- 每个服务一个容器，各自隔离
- docker run mysql:8.0、docker run redis:7
- 升级只需换个镜像标签
\`\`\`

### 4.3 对比总结

\`\`\`text
维度          传统部署                Docker 部署
─────────────────────────────────────────────────────
环境一致性    差（每台机器都不同）    好（镜像即环境）
部署速度      慢（手动装环境）        快（pull 镜像即可）
回滚          难（改回去很麻烦）      易（切换镜像版本）
资源利用      一般（一台跑一个服务）  高（一台跑几十个容器）
隔离性        弱（共享系统）          好（容器隔离）
学习成本      低（就是 Linux）        中（要学 Docker 概念）
\`\`\`

---

## 五、安装 Docker

Docker 在不同系统上安装方式不同。下面分别给出 macOS、Windows、Ubuntu 的安装步骤。

### 5.1 macOS：安装 Docker Desktop

macOS 由于内核不是 Linux，无法直接跑容器，需要 Docker Desktop（内置一个轻量 Linux 虚拟机）。

\`\`\`bash
# 方式一：用 Homebrew 安装（推荐）
brew install --cask docker

# 安装完成后，启动 Docker.app（必须在"应用程序"里点开一次）
open /Applications/Docker.app

# 首次启动会在菜单栏出现一个鲸鱼图标，等它变成稳定状态（不再是动画）就绪

# 验证安装
docker version
# 输出示例：
# Client: Cloud integration
#  Version:           24.0.7
#  ...
# Server: Docker Desktop
#  Engine: 24.0.7
\`\`\`

\`\`\`bash
# 方式二：手动下载
# 访问 https://www.docker.com/products/docker-desktop/ 选择 Mac with Apple chip（M系列）或 Intel chip
# 下载 .dmg 文件，拖到 Applications 即可
\`\`\`

### 5.2 Windows：安装 Docker Desktop

\`\`\`text
前置条件：
1. Windows 10/11 64位 专业版/企业版/教育版（家庭版需先装 WSL2）
2. 启用 WSL 2（Windows Subsystem for Linux 2）
3. BIOS 开启虚拟化（VT-x / AMD-V）
\`\`\`

\`\`\`powershell
# 以管理员身份打开 PowerShell，启用 WSL 与虚拟机平台
wsl --install
# 重启电脑后，设置默认 WSL2
wsl --set-default-version 2

# 下载 Docker Desktop Installer.exe 安装，安装时勾选 "Use WSL 2 instead of Hyper-V"
# 安装完成启动 Docker Desktop，等鲸鱼图标稳定

docker version   # 验证
\`\`\`

### 5.3 Ubuntu：安装 Docker Engine（生产推荐）

生产服务器大多是 Linux，Ubuntu 是最常见的选择。推荐用官方源安装，而不是 \`apt install docker.io\`（那个版本旧）。

\`\`\`bash
# 第 1 步：卸载旧版本（如果有）
sudo apt remove docker docker-engine docker.io containerd runc

# 第 2 步：安装必要依赖
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# 第 3 步：添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \\
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 第 4 步：添加 Docker 软件源
echo \\
  "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \\
  \$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 第 5 步：安装 Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 第 6 步：验证
sudo docker run hello-world
\`\`\`

### 5.4 免 sudo 使用 docker（重要）

默认情况下，只有 root 和 docker 组用户能执行 docker 命令。把当前用户加入 docker 组，避免每次都敲 sudo。

\`\`\`bash
# 把当前用户加入 docker 组
sudo usermod -aG docker $USER

# 让组变更立即生效（两种方式二选一）
newgrp docker
# 或者退出重新登录

# 验证：不再需要 sudo
docker ps    # 能直接执行就成功了
\`\`\`

### 5.5 设置开机自启

\`\`\`bash
# 设置 Docker 开机自启
sudo systemctl enable docker

# 启动 / 停止 / 重启
sudo systemctl start docker
sudo systemctl stop docker
sudo systemctl restart docker

# 查看状态
sudo systemctl status docker
\`\`\`

---

## 六、镜像加速配置

在国内直接从 Docker Hub 拉镜像非常慢，甚至超时。配置镜像加速器（registry mirror）可以大幅提速。

### 6.1 Linux 配置

\`\`\`bash
# 编辑 Docker 配置文件（没有就创建）
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://docker.m.daocloud.io"
  ]
}
EOF

# 重新加载配置并重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证加速器是否生效
docker info | grep -A 5 "Registry Mirrors"
# 输出示例：
#  Registry Mirrors:
#   https://docker.1ms.run/
#   https://docker.xuanyuan.me/
\`\`\`

### 6.2 Docker Desktop（macOS/Windows）配置

\`\`\`text
1. 点击菜单栏鲸鱼图标 → Settings（齿轮）
2. 左侧选 Docker Engine
3. 在 JSON 配置里加入 "registry-mirrors" 字段：
   {
     "registry-mirrors": [
       "https://docker.1ms.run",
       "https://docker.m.daocloud.io"
     ]
   }
4. 点击 Apply & Restart
\`\`\`

> 注意：公共镜像加速地址会不定期失效，如果某个地址拉不动了，换一个试试，或搜索"docker 镜像加速 2026"获取最新可用地址。

---

## 七、第一个容器：hello-world

安装完成，跑第一个容器，验证整个链路通畅。

\`\`\`bash
docker run hello-world
\`\`\`

输出示例：

\`\`\`text
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
c1ec31eb5944: Pull complete
Digest: sha256:4bd78111b6914a99dbc560e6eb20b8546c0f8c4f0
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image.
 4. The Docker daemon ran that container.
\`\`\`

这一条命令背后发生了 4 件事，正好对应前面讲的架构：

\`\`\`text
1. docker 客户端把请求发给 dockerd
2. 本地没有 hello-world 镜像 → 去 Docker Hub 拉取（pull）
3. 用拉下来的镜像创建一个容器（create）
4. 启动容器（start），容器内程序打印欢迎信息后退出
\`\`\`

### 7.1 再跑一个有趣的：whalesay

\`\`\`bash
# 用 cowsay 镜像让鲸鱼说话
docker run docker/whalesay cowsay "Hello, Docker!"
\`\`\`

输出示例：

\`\`\`text
 _________________
< Hello, Docker! >
 -----------------
    \\
     \\
      \\\\
        ##        .
          ## ## ##         ==
         ## ## ## ##      ===
             /""""""""""""""""___/ ===
    ~~~ {~~ ~~~~ ~~~ ~~~~ ~~ ~ /  ===- ~~~
         \\______ o          __/
          \\    \\        __/
           \\____\\______/
\`\`\`

### 7.2 跑一个常驻容器：nginx

\`\`\`bash
# -d 后台运行，-p 端口映射（主机 8080 → 容器 80）
docker run -d -p 8080:80 --name myweb nginx

# 输出一串容器 ID：
# 3f9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a

# 浏览器访问 http://localhost:8080 看到 nginx 欢迎页

# 查看运行中的容器
docker ps
# CONTAINER ID   IMAGE   COMMAND                  CREATED         STATUS        PORTS                  NAMES
# 3f9a2b8c7d6e   nginx   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds  0.0.0.0:8080->80/tcp   myweb

# 停止并删除
docker stop myweb
docker rm myweb
\`\`\`

---

## 八、docker version 与 docker info

这两个命令用来检查 Docker 安装状态和查看全局信息，是排错的第一步。

### 8.1 docker version

显示客户端和服务端的版本信息。

\`\`\`bash
docker version
\`\`\`

输出示例：

\`\`\`text
Client: Docker Engine - Community
 Cloud integration: v1.0.35
 Version:           24.0.7
 API version:       1.43
 Go version:        go1.20.10
 OS/Arch:           darwin/arm64

Server: Docker Desktop
 Engine:
  Version:          24.0.7
  API version:      1.43 (minimum version 1.12)
  OS/Arch:          linux/arm64
\`\`\`

> 如果只看到 Client 没有 Server，说明守护进程没启动，去启动 Docker Desktop 或 \`sudo systemctl start docker\`。

### 8.2 docker info

显示更全面的系统级信息：容器数、镜像数、存储驱动、网络、加速器等。

\`\`\`bash
docker info
\`\`\`

输出示例（节选）：

\`\`\`text
Client:
 Version:    24.0.7
 Context:    desktop-linux

Server:
 Containers: 12
  Running: 3
  Paused: 0
  Stopped: 9
 Images: 28
 Server Version: 24.0.7
 Storage Driver: overlay2
  Backing Filesystem: extfs
 Cgroup Driver: systemd
 Default Runtime: runc
 Registry Mirrors:
  https://docker.1ms.run/
 Live Restore Enabled: false
\`\`\`

### 8.3 只看精简版本号

\`\`\`bash
docker --version          # Docker version 24.0.7, build afdd53b
docker compose version    # Docker Compose version v2.21.0
\`\`\`

---

## 九、本章小结

\`\`\`text
核心要点回顾：
1. 容器 = 被隔离的进程（共享内核，轻量秒级启动），不是迷你虚拟机
2. Docker 是 C/S 架构：客户端发指令，dockerd 干活
3. 五大概念：客户端、守护进程、镜像、容器、仓库
4. 镜像（只读模板）→ 容器（运行实例），类比 类 → 对象
5. 安装：macOS/Windows 用 Docker Desktop，Ubuntu 用官方源
6. 国内必配镜像加速器（daemon.json 的 registry-mirrors）
7. docker run hello-world 是验证安装的标准动作
8. 排错第一步：docker version / docker info
\`\`\`

### 9.1 常见问题

\`\`\`text
Q: docker 命令报 "Cannot connect to the Docker daemon"？
A: 守护进程没启动。Linux: sudo systemctl start docker；macOS/Windows: 启动 Docker Desktop。

Q: docker pull 超时？
A: 配置镜像加速器，或换一个加速地址。

Q: docker 命令要加 sudo？
A: 把用户加入 docker 组：sudo usermod -aG docker $USER，重新登录。

Q: macOS 上容器数据存哪？
A: 存在 Docker Desktop 管理的虚拟机磁盘里，不在你 macOS 文件系统直接可见。
\`\`\`

### 9.2 下一章预告

下一章将深入镜像管理：拉取、推送、查看、删除镜像，理解镜像的分层结构，配置 Docker Hub 与私有仓库，掌握镜像的导入导出与清理。
`,
  },
  {
    id: "deploy-docker-image",
    icon: "📦",
    title: "镜像管理",
    group: "Docker 容器化",
    content: `# 镜像管理

## 一、镜像到底是什么

上一章我们已经用过 \`docker run hello-world\`，它先从仓库"拉"了一个镜像到本地，再用这个镜像启动容器。这一章我们专门研究"镜像"这个对象。

镜像是**一个只读的、分层的文件系统快照**，包含运行某个程序所需的全部内容：操作系统文件、库、代码、配置、环境变量。你可以把它想象成一个"压缩包 + 元数据"。

\`\`\`text
镜像 nginx:1.25 包含的内容（自底向上分层）：
Layer 1: debian:bullseye-slim        （基础系统，~30MB）
Layer 2: apt 安装的依赖库             （libssl、libpcre 等）
Layer 3: 解压 nginx 二进制            （/usr/sbin/nginx）
Layer 4: 复制默认配置                 （/etc/nginx/nginx.conf）
Layer 5: 声明暴露端口 + 启动命令       （EXPOSE 80, CMD）
\`\`\`

镜像有两个关键特点要牢记：

1. **只读**：镜像本身不可修改。要"改"镜像，只能基于它构建一个新镜像。
2. **分层**：镜像由多个只读层（Layer）叠成，层可以被多个镜像共享，省磁盘、省下载时间。

---

## 二、docker pull：拉取镜像

从仓库下载镜像到本地。

### 2.1 基本用法

\`\`\`bash
# 拉取 nginx 最新版（默认标签 latest）
docker pull nginx
# 输出示例：
# Using default tag: latest
# latest: Pulling from library/nginx
# a480a496ba95: Pull complete
# f3ace1b7512d: Pull complete
# 11d6fdd0e8a7: Pull complete
# Digest: sha256:e9...
# Status: Downloaded newer image for nginx:latest
\`\`\`

### 2.2 指定标签（版本）

\`\`\`bash
# 拉取指定版本（强烈推荐，生产环境绝不用 latest）
docker pull nginx:1.25.3
docker pull nginx:1.25-alpine      # alpine 版，体积小
docker pull python:3.12-slim       # python slim 版
docker pull mysql:8.0.35
docker pull redis:7.2-alpine
\`\`\`

### 2.3 指定完整镜像名（含仓库地址）

\`\`\`bash
# 默认从 Docker Hub（docker.io）拉
docker pull nginx

# 等价写法（完整域名）
docker pull docker.io/library/nginx:1.25

# 从其他仓库拉，比如阿里云
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.9

# 从私有仓库拉
docker pull registry.mycompany.com:5000/myapp:v1.2.0
\`\`\`

### 2.4 拉取所有标签

\`\`\`bash
# 拉取某镜像的所有标签（慎用，nginx 有上百个标签，会下载几 GB）
docker pull -a nginx
\`\`\`

### 2.5 镜像名格式解析

\`\`\`text
完整格式：[仓库地址[:端口]/]命名空间/镜像名[:标签]

nginx                     → docker.io/library/nginx:latest
nginx:1.25                → docker.io/library/nginx:1.25
myuser/myapp              → docker.io/myuser/myapp:latest
myuser/myapp:v2           → docker.io/myuser/myapp:v2
registry.com:5000/a/b:1   → registry.com:5000/a/b:1

规则：
- 不带 / 时，是官方镜像（library 命名空间）
- 带 1 个 /，是用户镜像（用户名/镜像名）
- 带 2 个 /，第一段是仓库地址
- 不带 :标签，默认 :latest
\`\`\`

---

## 三、docker images：查看本地镜像

### 3.1 列出所有本地镜像

\`\`\`bash
docker images
# 等价命令
docker image ls
\`\`\`

输出示例：

\`\`\`text
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
nginx         latest    605c77e624dd   2 weeks ago    141MB
nginx         1.25      605c77e624dd   2 weeks ago    141MB
python        3.12-slim a5be5f8e3b2c   3 days ago     130MB
mysql         8.0       4ebb1f2a6c5f   1 month ago    632MB
hello-world   latest    feb5d9fea6a5   6 months ago   13.3kB
\`\`\`

字段含义：

\`\`\`text
REPOSITORY  镜像名（仓库里的名字）
TAG         标签（版本）
IMAGE ID    镜像唯一 ID（SHA256 前 12 位）
CREATED     创建时间
SIZE        镜像在本地占用大小（实际因分层共享会更小）
\`\`\`

### 3.2 过滤与格式化

\`\`\`bash
# 只看某个仓库的镜像
docker images nginx

# 只列出镜像 ID
docker images -q
# 输出：
# 605c77e624dd
# a5be5f8e3b2c

# 过滤：只看悬空镜像（dangling，无标签的中间层）
docker images -f dangling=true

# 格式化输出（自定义列）
docker images --format "{{.Repository}}:{{.Tag}} -> {{.Size}}"
# 输出：
# nginx:latest -> 141MB
# python:3.12-slim -> 130MB

# 按创建时间倒序，带表头
docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}"
\`\`\`

### 3.3 docker rmi：删除镜像

\`\`\`bash
# 按名字:标签删除
docker rmi nginx:1.25

# 按 ID 删除
docker rmi 605c77e624dd

# 强制删除（即使有容器在用，慎用）
docker rmi -f nginx

# 删除所有本地镜像（危险！仅供演示）
docker rmi $(docker images -q)
\`\`\`

删除失败常见原因：

\`\`\`text
Error response from daemon: conflict: unable to delete 605c77e624dd
(must be forced) - image is being used by stopped container 3f9a2b8c7d6e

原因：有容器（哪怕已停止）正在使用该镜像
解决：先 docker rm 删掉对应容器，再 docker rmi
或：docker rmi -f 强制删（不推荐，可能残留）
\`\`\`

---

## 四、镜像分层结构（Layer）

分层是 Docker 镜像最核心的设计，理解它能解释很多现象。

### 4.1 查看镜像分层

\`\`\`bash
# 查看 nginx 镜像的分层
docker image inspect nginx --format '{{json .RootFS.Layers}}' | python3 -m json.tool
# 输出示例（6 层）：
# [
#     "sha256:2edb4...e0c",
#     "sha256:a4eb8...f29",
#     "sha256:d0001...c7a",
#     "sha256:7d6c2...e91",
#     "sha256:9f3e0...b8a",
#     "sha256:f7e2b...c4d"
# ]
\`\`\`

### 4.2 分层的好处

\`\`\`text
假设你拉了 3 个镜像：
- nginx:1.25      层：A + B + C
- nginx:1.25-alp  层：A + B + D
- python:3.12     层：A + E + F

其中 A 是同一个 debian 基础层，本地只存一份，三个镜像共享。
下载时已存在的层会跳过（Already exists），省时间省带宽。
\`\`\`

实际拉取时你会看到这样的输出：

\`\`\`text
Pulling from library/nginx
a480a496ba95: Already exists      <- 这层本地有了，跳过
f3ace1b7512d: Pull complete        <- 这层新下载
11d6fdd0e8a7: Pull complete        <- 这层新下载
\`\`\`

### 4.3 容器可写层

镜像只读，但容器运行时要写文件（日志、临时文件），怎么办？

\`\`\`text
容器文件系统 = 镜像只读层（共享）+ 容器可写层（顶层，容器独有）

┌──────────────┐
│ 可写层（薄）  │ ← 容器写的文件都在这层，删除容器即丢失
├──────────────┤
│ 镜像层 5（只读）│
│ 镜像层 4（只读）│  ← 多个容器共享
│ 镜像层 3（只读）│
│ ...           │
└──────────────┘
\`\`\`

这种机制叫 Copy-on-Write（写时复制）：容器读文件直接读镜像层；要修改时，先把文件从镜像层复制到可写层再改。所以容器启动极快，磁盘占用也很小。

\`\`\`bash
# 验证：启动两个 nginx 容器，看它们共享镜像层
docker run -d --name web1 nginx
docker run -d --name web2 nginx
# 两个容器用的同一个 nginx 镜像，镜像磁盘只占一份 141MB
\`\`\`

---

## 五、镜像标签与版本

### 5.1 tag 命令：给镜像打标签

\`\`\`bash
# 给本地镜像起个别名（不复制内容，只是引用）
docker tag nginx:1.25 mynginx:1.25
docker tag nginx:1.25 mynginx:stable
docker tag nginx:1.25 registry.mycompany.com:5000/web/nginx:v1

# 现在 docker images 会看到多个名字指向同一个 ID
docker images nginx
# REPOSITORY   TAG      IMAGE ID       SIZE
# nginx        1.25     605c77e624dd   141MB
# mynginx      1.25     605c77e624dd   141MB
# mynginx      stable   605c77e624dd   141MB
\`\`\`

### 5.2 版本标签的选用策略

\`\`\`text
生产环境镜像标签策略：

❌ 用 latest：每次拉到的可能是不同版本，不可控
❌ 用 1.25：小版本会变，1.25 可能从 1.25.0 变成 1.25.4
✅ 用 1.25.3：精确锁定，每次拉到完全一样的镜像
✅ 用内容哈希（digest）：最严格，sha256:abc123...

原则：版本越精确，环境越稳定，回滚越容易
\`\`\`

### 5.3 通过 digest 拉取（不可变引用）

\`\`\`bash
# 拉取时带 digest，保证拿到的是同一个镜像
docker pull nginx@sha256:e9b5b...c4d2

# 查看本地镜像的 digest
docker images --digests nginx
# REPOSITORY  TAG    DIGEST                                                                    IMAGE ID
# nginx       1.25   sha256:e9b5b3c1e8f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2   605c77e624dd
\`\`\`

---

## 六、Docker Hub 与私有仓库

### 6.1 Docker Hub 基本使用

\`\`\`bash
# 登录 Docker Hub（需先注册账号）
docker login
# 输入用户名、密码、（可选）token

# 给本地镜像打上"你的用户名/镜像名"的标签
docker tag myapp:v1 mydockerhubuser/myapp:v1

# 推送到你的 Docker Hub 仓库
docker push mydockerhubuser/myapp:v1

# 别人在另一台机器上拉取
docker pull mydockerhubuser/myapp:v1

# 退出登录
docker logout
\`\`\`

### 6.2 使用 Access Token（更安全）

\`\`\`text
Docker Hub → Account Settings → Security → New Access Token
生成 token 后，用它代替密码登录，避免密码泄露
token 可单独撤销，不影响主密码
\`\`\`

### 6.3 自建私有仓库（registry）

企业内部通常自建仓库，不把镜像放公网。Docker 官方提供了 \`registry\` 镜像，一行命令就能起一个私有仓库。

\`\`\`bash
# 启动一个私有仓库（默认端口 5000）
docker run -d -p 5000:5000 --name registry --restart=always \\
  -v /opt/registry:/var/lib/registry \\
  registry:2

# 把本地镜像打标签指向私有仓库
docker tag myapp:v1 localhost:5000/myapp:v1

# 推送
docker push localhost:5000/myapp:v1

# 从另一台机器拉取（需配置该仓库为 insecure）
docker pull 192.168.1.100:5000/myapp:v1
\`\`\`

### 6.4 配置非 HTTPS 仓库（内网）

私有仓库默认用 HTTPS，内网 HTTP 仓库需告诉 Docker 信任它。

\`\`\`bash
# /etc/docker/daemon.json 增加 insecure-registries
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://docker.1ms.run"],
  "insecure-registries": ["192.168.1.100:5000"]
}
EOF

sudo systemctl restart docker
\`\`\`

### 6.5 Harbor：企业级私有仓库

生产环境推荐 Harbor（CNCF 项目），比裸 registry 多了：Web 界面、权限管理、镜像扫描、复制同步、审计日志。

\`\`\`text
Harbor 安装：下载离线包 → 改 harbor.yml → ./install.sh
默认提供：Web UI（端口 80）、API、镜像扫描（Trivy）
\`\`\`

---

## 七、镜像导入导出：save / load

网络不通时，可以用文件方式传输镜像。

### 7.1 docker save：导出镜像为 tar 文件

\`\`\`bash
# 把 nginx 镜像导出成 tar 文件
docker save -o nginx.tar nginx:1.25
# -o 指定输出文件

# 查看文件大小
ls -lh nginx.tar
# -rw-r--r--  1 user  staff  142M  nginx.tar

# 导出多个镜像到一个 tar
docker save -o all.tar nginx:1.25 python:3.12-slim redis:7.2

# 用 gzip 压缩（更小）
docker save nginx:1.25 | gzip > nginx.tar.gz
\`\`\`

### 7.2 docker load：从 tar 文件导入

\`\`\`bash
# 在另一台机器上导入
docker load -i nginx.tar
# 输出：
# Loaded image: nginx:1.25

# 导入 gzip 压缩的
docker load < nginx.tar.gz

# 导入后正常使用
docker run -d nginx:1.25
\`\`\`

### 7.3 save/load vs export/import 的区别

这是个高频面试题，务必分清：

\`\`\`text
命令              操作对象      保留分层    保留历史    典型场景
─────────────────────────────────────────────────────────
docker save       镜像          ✅ 是       ✅ 是       完整迁移镜像
docker load       镜像tar       ✅ 是       ✅ 是       接收 save 的文件
docker export     容器          ❌ 否       ❌ 否       把容器拍扁成单层
docker import     容器tar       ❌ 否       ❌ 否       接收 export 的文件

save/load 用于镜像迁移（保留分层和历史，推荐）
export/import 用于把容器快照成一个扁平镜像（丢失历史，体积可能更小）
\`\`\`

\`\`\`bash
# export 示例：把运行中的容器导成扁平镜像
docker export myweb | gzip > web-flat.tar.gz
docker import web-flat.tar.gz myweb-flat:latest
\`\`\`

---

## 八、镜像构建历史：docker history

查看一个镜像是怎么一步步构建出来的，每一层执行了什么命令、占了多大空间。优化镜像时必备工具。

\`\`\`bash
docker history nginx:1.25
\`\`\`

输出示例：

\`\`\`text
IMAGE          CREATED       CREATED BY                                      SIZE
605c77e624dd   2 weeks ago   /bin/sh -c #(nop)  CMD ["nginx" "-g" "daemon…   0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  STOPSIGNAL SIGQUIT           0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  EXPOSE 80                    0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENTRYPOINT ["/docker-ent…    0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  COPY 30-tune-worker-proce…   4.62kB
<missing>      2 weeks ago   /bin/sh -c #(nop)  COPY 20-envsubst-on-templ…   3.02kB
<missing>      2 weeks ago   /bin/sh -c #(nop)  COPY 15-local-resolvers.e…   240B
<missing>      2 weeks ago   /bin/sh -c #(nop)  COPY 10-listen-on-ipv6-by…   736B
<missing>      2 weeks ago   /bin/sh -c #(nop)  COPY docker-entrypoint.sh…   1.62kB
<missing>      2 weeks ago   /bin/sh -c set -x     && groupadd ...           61.3MB
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENV DPKG_PKGS=...            0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENV NJS_VERSION=...          0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENV NGINX_VERSION=...        0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  /bin/sh -c #(nop)  LABEL ... 0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  CMD ["bash"]                 0B
\`\`\`

解读：

\`\`\`text
- CREATED BY 是该层执行的具体命令（Dockerfile 指令）
- #(nop) 开头表示这条指令不产生新文件层（如 ENV、EXPOSE、LABEL），大小为 0B
- 真正占空间的是 RUN 命令（如 set -x && groupadd... 占 61.3MB）
- <missing> 表示这些层来自基础镜像，本地无独立记录
\`\`\`

\`\`\`bash
# 不截断长命令，看完整内容
docker history --no-trunc nginx:1.25

# 只看前 5 层
docker history nginx:1.25 | head -5
\`\`\`

---

## 九、清理无用镜像：docker prune

长期使用后，本地会堆积大量无用镜像和悬空层，占满磁盘。

### 9.1 查看磁盘占用

\`\`\`bash
# 查看 Docker 整体磁盘占用
docker system df
# 输出示例：
# TYPE            TOTAL   ACTIVE  SIZE      RECLAIMABLE
# Images          28      5       8.2GB     6.1GB (74%)
# Containers      12      3       320MB     280MB (87%)
# Local Volumes   8       4       1.5GB     800MB (53%)
# Build Cache     150     0       1.2GB     1.2GB

# 看每个镜像的详细占用
docker system df -v
\`\`\`

### 9.2 清理悬空镜像

\`\`\`bash
# 悬空镜像（dangling）：没有标签、没有被任何镜像引用的中间层
docker image prune
# 输出示例：
# Deleted: sha256:abc123...
# Total reclaimed space: 450MB

# 加 -f 跳过确认
docker image prune -f
\`\`\`

### 9.3 清理所有未使用镜像

\`\`\`bash
# 删除所有"没有被容器使用"的镜像（包括有标签的）
docker image prune -a
# 这会删掉大量镜像，谨慎使用

# 只清理 24 小时前创建的
docker image prune -a --filter "until=24h"
\`\`\`

### 9.4 一键清理所有无用资源

\`\`\`bash
# 清理所有未使用的镜像、容器、网络、构建缓存（不含卷）
docker system prune
# 加 --volumes 连数据卷一起清（危险，数据会丢）
docker system prune -a --volumes
\`\`\`

### 9.5 定期清理脚本

\`\`\`bash
# 写进 crontab，每周日凌晨 3 点自动清理
# crontab -e 添加：
# 0 3 * * 0 docker system prune -f --filter "until=168h"

# 或写成脚本 clean-docker.sh
#!/bin/bash
echo "清理前："
docker system df
docker container prune -f
docker image prune -a -f --filter "until=72h"
docker volume prune -f
docker builder prune -f
echo "清理后："
docker system df
\`\`\`

---

## 十、本章小结

\`\`\`text
核心要点回顾：
1. 镜像 = 只读、分层的文件系统快照
2. pull 拉取 / push 推送 / images 查看 / rmi 删除
3. 镜像分层带来共享与复用，分层用 docker history 查看
4. 容器 = 镜像只读层 + 顶部可写层（Copy-on-Write）
5. 生产环境用精确版本标签（1.25.3），不用 latest
6. save/load 完整迁移镜像，export/import 拍扁容器
7. 私有仓库：裸 registry 适合内网，Harbor 适合企业
8. docker system df 看占用，docker image prune 清理
\`\`\`

### 10.1 常见问题

\`\`\`text
Q: docker rmi 报 "image is being used by container"？
A: 先 docker rm 删掉依赖该镜像的容器（包括停止的），再 rmi。

Q: 为什么两个镜像 SIZE 一样、IMAGE ID 一样？
A: 它们是同一镜像的不同标签，docker tag 只是起别名，不复制内容。

Q: docker pull 卡住不动？
A: 检查镜像加速器配置，或换加速地址；公司网络可能需要配代理。

Q: save 出来的 tar 比镜像 SIZE 大很多？
A: tar 包含所有层 + 元数据，且未压缩；用 gzip 压缩可显著减小。
\`\`\`

### 10.2 下一章预告

下一章进入容器生命周期管理：用 \`docker run\` 的各种参数启动容器，掌握 start/stop/exec/logs/inspect 等日常运维命令，并实战运行 MySQL、Redis、Nginx 容器。
`,
  },
  {
    id: "deploy-docker-container",
    icon: "📋",
    title: "容器生命周期管理",
    group: "Docker 容器化",
    content: `# 容器生命周期管理

## 一、从容器的"一生"说起

一个容器从创建到销毁，会经历这样的生命周期：

\`\`\`text
          docker run / docker create + start
                    │
                    ▼
              ┌──────────┐
   docker stop│  运行中    │ docker kill
   ──────────►│ Running  │◄──────────
              └────┬─────┘
                   │ 容器内进程退出 / OOM
                   ▼
              ┌──────────┐
              │  已停止    │
              │ Exited   │
              └────┬─────┘
        docker start│ docker rm
        ◄───────────┤
                    ▼
              ┌──────────┐
              │  已删除    │
              │ Removed  │
              └──────────┘
\`\`\`

理解这张图，容器管理就掌握了一半。本章按"创建 → 查看 → 控制 → 进出 → 观测 → 清理"的顺序讲解，最后实战三个常用服务。

---

## 二、docker run：核心参数详解

\`docker run\` 是用得最多的命令，它做了三件事：拉镜像（如果本地没有）→ 创建容器 → 启动容器。

### 2.1 最简形式

\`\`\`bash
# 用 nginx 镜像启动一个容器，前台运行（按 Ctrl+C 退出，容器停止）
docker run nginx
\`\`\`

### 2.2 -d：后台运行

\`\`\`bash
# -d = detach，容器在后台跑，返回容器 ID
docker run -d nginx
# 输出：3f9a2b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a
\`\`\`

### 2.3 --name：给容器命名

\`\`\`bash
# 不加 --name，Docker 会随机起名（如 nostalgic_einstein），难记
docker run -d --name myweb nginx
# 之后所有操作都能用名字而非 ID
docker stop myweb
docker logs myweb
\`\`\`

### 2.4 -p：端口映射

容器有独立网络，外部访问不到。用 -p 把主机端口映射到容器端口。

\`\`\`bash
# 主机 8080 → 容器 80
docker run -d -p 8080:80 --name web nginx
# 访问 http://localhost:8080

# 主机 80 → 容器 80（省略主机端口，会随机分配高位端口）
# 错误写法，下面是正确的：只指定容器端口，主机随机分配
docker run -d -p 80 --name web2 nginx
docker port web2
# 输出：80/tcp -> 0.0.0.0:32768

# 指定主机 IP（默认 0.0.0.0 所有网卡）
docker run -d -p 127.0.0.1:8080:80 --name web3 nginx
# 只能从本机访问

# 映射多个端口
docker run -d -p 8080:80 -p 8443:443 --name web4 nginx

# 映射 UDP 端口
docker run -d -p 53:53/udp --name dns coredns
\`\`\`

### 2.5 -v：挂载数据卷 / 目录

容器删除后内部数据丢失，用 -v 把主机目录或数据卷挂进容器做持久化。

\`\`\`bash
# bind mount：主机目录 /data 挂载到容器 /usr/share/nginx/html
docker run -d -p 8080:80 -v /data/html:/usr/share/nginx/html --name web nginx

# 命名数据卷
docker run -d -v mydata:/var/lib/mysql --name db mysql:8.0

# 只读挂载（容器内只能读不能写）
docker run -d -v /data/config:/etc/nginx:ro --name web nginx

# 主机当前目录（$PWD 会被 shell 展开为主机路径）
docker run -d -v "$PWD/html":/usr/share/nginx/html --name web nginx
\`\`\`

### 2.6 -e：设置环境变量

\`\`\`bash
# 设置 MySQL root 密码
docker run -d -e MYSQL_ROOT_PASSWORD=secret123 --name db mysql:8.0

# 多个环境变量
docker run -d \\
  -e MYSQL_ROOT_PASSWORD=secret123 \\
  -e MYSQL_DATABASE=appdb \\
  -e MYSQL_USER=appuser \\
  -e MYSQL_PASSWORD=apppass \\
  --name db mysql:8.0

# 从文件读取（env file）
echo "MYSQL_ROOT_PASSWORD=secret123" > db.env
docker run -d --env-file db.env --name db mysql:8.0
\`\`\`

### 2.7 --rm：退出后自动删除

\`\`\`bash
# 一次性任务：跑完就删容器，不留垃圾
docker run --rm alpine echo "hello"
# 输出 hello，容器立即自动删除

# 常用于：临时测试、一次性脚本、CI 任务
docker run --rm -v "$PWD":/work -w /work python:3.12 python script.py
\`\`\`

### 2.8 综合示例

\`\`\`bash
# 一条命令启动一个生产级 MySQL
docker run -d \\
  --name mysql-prod \\
  -p 3306:3306 \\
  -e MYSQL_ROOT_PASSWORD=StrongPass!2026 \\
  -e MYSQL_DATABASE=appdb \\
  -e MYSQL_USER=appuser \\
  -e MYSQL_PASSWORD=apppass \\
  -v mysql_data:/var/lib/mysql \\
  -v /etc/localtime:/etc/localtime:ro \\
  --restart=unless-stopped \\
  --memory=2g \\
  --cpus=2 \\
  mysql:8.0.35 \\
  --character-set-server=utf8mb4 \\
  --collation-server=utf8mb4_unicode_ci
\`\`\`

参数解释：

\`\`\`text
--restart=unless-stopped  总是重启，除非手动 stop（服务器重启后自愈）
--memory=2g               限制最多用 2GB 内存
--cpus=2                  限制最多用 2 核 CPU
最后那两行                 传给容器内 MySQL 进程的启动参数
\`\`\`

---

## 三、docker ps：查看容器

### 3.1 查看运行中的容器

\`\`\`bash
docker ps
\`\`\`

输出示例：

\`\`\`text
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                  NAMES
3f9a2b8c7d6e   nginx     "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:8080->80/tcp   myweb
a1b2c3d4e5f6   mysql:8   "docker-entrypoint.s…"   10 minutes ago  Up 10 minutes  3306/tcp               db
\`\`\`

### 3.2 查看所有容器（包括已停止）

\`\`\`bash
docker ps -a
# 等价
docker ps --all
\`\`\`

输出多了已停止的容器，STATUS 列显示退出状态：

\`\`\`text
STATUS 示例：
Up 2 minutes              运行中
Exited (0) 5 minutes ago  正常退出
Exited (137) 1 hour ago   被 kill（OOM 或手动）
Up 2 minutes (unhealthy)  运行中但健康检查失败
\`\`\`

### 3.3 常用过滤

\`\`\`bash
# 只看已停止的容器
docker ps -f status=exited

# 只看运行中的（默认）
docker ps -f status=running

# 按名字过滤
docker ps -f name=web

# 按镜像过滤
docker ps -f ancestor=nginx

# 只显示容器 ID
docker ps -q
docker ps -a -q    # 所有容器 ID（含停止的）

# 自定义格式
docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
\`\`\`

### 3.4 最后一个容器

\`\`\`bash
# 只看最后创建的一个容器（含已停止）
docker ps -l

# 看最后 3 个
docker ps -n 3
\`\`\`

---

## 四、start / stop / restart / kill

### 4.1 启动已停止的容器

\`\`\`bash
# 容器被 stop 后还在（除非 --rm），可以再次启动
docker start myweb

# 启动并附加到容器（看输出）
docker start -a myweb
\`\`\`

### 4.2 停止容器（优雅）

\`\`\`bash
# docker stop 发送 SIGTERM，给容器 10 秒优雅退出
docker stop myweb

# 自定义等待时间（秒），超时发 SIGKILL 强杀
docker stop -t 30 myweb
\`\`\`

### 4.3 重启容器

\`\`\`bash
docker restart myweb
# 等价于 stop + start，但容器 ID 不变
\`\`\`

### 4.4 kill：强制停止

\`\`\`bash
# 直接发 SIGKILL，立即终止，不给清理机会
docker kill myweb

# 发送指定信号
docker kill -s HUP myweb   # 让 nginx 重载配置
docker kill -s USR1 myweb  # nginx 重新打开日志文件
\`\`\`

stop vs kill 的区别：

\`\`\`text
docker stop  → 先 SIGTERM（应用可清理、保存数据），超时再 SIGKILL
docker kill  → 直接 SIGKILL，立即终止，可能丢数据

生产环境优先用 stop，应用卡死时才用 kill
\`\`\`

### 4.5 批量操作

\`\`\`bash
# 停止所有运行中的容器
docker stop $(docker ps -q)

# 启动所有已停止的容器
docker start $(docker ps -a -q -f status=exited)

# 重启所有容器
docker restart $(docker ps -q)
\`\`\`

---

## 五、rm / exec / attach

### 5.1 docker rm：删除容器

\`\`\`bash
# 删除已停止的容器
docker rm myweb

# 删除运行中的容器（需 -f，会先 kill 再删）
docker rm -f myweb

# 删除所有已停止的容器
docker container prune
# 或
docker rm $(docker ps -a -q -f status=exited)

# 删除所有容器（危险！）
docker rm -f $(docker ps -a -q)

# -v 顺带删除容器关联的匿名数据卷
docker rm -v mydb
\`\`\`

### 5.2 docker exec：在运行中的容器里执行命令

这是进入容器调试的主要方式。

\`\`\`bash
# 进入容器开一个交互式 bash（最常用）
docker exec -it myweb bash
# -i 保持标准输入打开，-t 分配伪终端

# 容器没有 bash 时用 sh
docker exec -it myweb sh

# 不进入，直接执行一条命令
docker exec myweb ls /etc/nginx

# 在容器里执行 MySQL 命令
docker exec -it db mysql -uroot -p

# 在容器里看进程
docker exec myweb ps aux

# 在容器里装个工具（临时，重启丢失）
docker exec -it myweb apt update && apt install -y curl
\`\`\`

\`-it\` 的含义：

\`\`\`text
-i, --interactive   即使没附加也保持 STDIN 打开
-t, --tty           分配一个伪终端（让你能看到正常的命令行交互）

两者结合 -it 才能像 ssh 一样"进入"容器
省略 -it：执行命令拿输出就返回，适合脚本
\`\`\`

### 5.3 docker attach：附加到容器主进程

\`\`\`bash
# attach 直接连到容器的主进程（PID 1）的 stdin/stdout/stderr
docker attach myweb
\`\`\`

attach 与 exec 的区别（高频面试题）：

\`\`\`text
docker exec  → 在容器里新开一个进程（如新 bash），互不影响
              退出（Ctrl+C 或 exit）不影响容器主进程
docker attach → 连到容器 PID 1 进程的终端
              Ctrl+C 会发信号给主进程，可能导致容器停止！

要安全退出 attach 不停止容器：Ctrl+P, Ctrl+Q（分离快捷键）
生产调试几乎都用 exec，不用 attach
\`\`\`

---

## 六、logs / inspect / stats

### 6.1 docker logs：查看容器日志

\`\`\`bash
# 查看全部日志
docker logs myweb

# 实时跟踪日志（类似 tail -f）
docker logs -f myweb

# 只看最后 100 行
docker logs --tail 100 myweb

# 看最后 100 行并持续跟踪
docker logs -f --tail 100 myweb

# 看指定时间之后的日志
docker logs --since 2026-07-03T10:00:00 myweb
docker logs --since 30m myweb      # 最近 30 分钟

# 带时间戳
docker logs -t myweb
# 输出：2026-07-03T10:00:01.123456789Z 10.0.0.1 - GET / ...

# 同时显示标准输出和错误，或只要其一
docker logs myweb          # 默认 all
docker logs -f myweb 2>&1  # 合并
\`\`\`

> 注意：docker logs 只能看容器主进程（PID 1）输出到 stdout/stderr 的内容。如果应用写文件而不是 stdout，docker logs 看不到——应把日志重定向到 stdout。

### 6.2 docker inspect：查看容器详细配置

\`\`\`bash
# 输出一个超长 JSON，包含容器所有信息
docker inspect myweb

# 用 -f 提取需要的字段
# 提取 IP 地址
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' myweb
# 输出：172.17.0.2

# 提取挂载的卷
docker inspect -f '{{json .Mounts}}' myweb | python3 -m json.tool

# 提取启动命令
docker inspect -f '{{.Config.Cmd}}' myweb

# 提取环境变量
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' myweb

# 提取状态
docker inspect -f '{{.State.Status}}' myweb      # running
docker inspect -f '{{.State.StartedAt}}' myweb
docker inspect -f '{{.State.ExitCode}}' myweb
\`\`\`

### 6.3 docker stats：实时资源监控

\`\`\`bash
# 实时查看所有运行容器的 CPU/内存/网络/IO（类似 top）
docker stats
\`\`\`

输出示例（每秒刷新）：

\`\`\`text
CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT   MEM %    NET I/O         BLOCK I/O
3f9a2b8c7d6e   myweb     0.50%     25MiB / 2GiB        1.20%    5kB / 3kB       8MB / 0B
a1b2c3d4e5f6   db        12.3%     380MiB / 2GiB       18.5%   1.2MB / 800kB   45MB / 12MB

# 只看指定容器，输出一次（不持续）
docker stats --no-stream myweb

# 自定义格式
docker stats --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"
\`\`\`

---

## 七、docker cp：主机与容器互拷文件

\`\`\`bash
# 从主机拷贝文件到容器
docker cp ./app.conf myweb:/etc/nginx/conf.d/app.conf

# 从容器拷贝文件到主机
docker cp myweb:/etc/nginx/nginx.conf ./nginx.conf.bak

# 拷贝整个目录
docker cp ./html myweb:/usr/share/nginx/
docker cp myweb:/var/log/nginx ./nginx-logs

# 用容器 ID 也行
docker cp 3f9a2b8c7d6e:/tmp/out.txt .

# 容器无需运行，停止状态也能 cp
docker cp stopped_container:/data/db.dump ./db.dump
\`\`\

常用场景：

\`\`\`text
- 临时修改容器配置：cp 出来 → 改 → cp 回去 → docker restart
- 取容器内产生的文件（如日志、备份、dump）
- 把证书/密钥放进容器（更推荐用 -v 挂载）
\`\`\`

---

## 八、docker top：查看容器内进程

\`\`\`bash
# 查看容器里跑了哪些进程
docker top myweb
\`\`\`

输出示例：

\`\`\`text
UID    PID    PPID   C   STIME   TTY   TIME       CMD
root   8234   8210   0   10:00   ?     00:00:00   nginx: master process nginx -g daemon off;
www    8275   8234   0   10:00   ?     00:00:00   nginx: worker process
www    8276   8234   0   10:00   ?     00:00:00   nginx: worker process
\`\`\`

注意：这里的 PID 是**宿主机**的进程号。这印证了"容器就是宿主机上的进程"——nginx 容器里的 master 进程，在宿主机看就是 PID 8234 的普通进程。

\`\`\`bash
# 在宿主机验证
ps -p 8234 -o pid,cmd
# 输出：
# 8234 nginx: master process nginx -g daemon off;

# 用 aux 看详情
docker top myweb aux
\`\`\`

---

## 九、实战：运行 MySQL / Redis / Nginx 容器

把前面学的命令串起来，实战跑三个最常用的服务容器。

### 9.1 运行 MySQL 容器

\`\`\`bash
# 启动 MySQL 8.0，数据持久化到命名卷
docker volume create mysql_data
docker run -d \\
  --name mysql \\
  -p 3306:3306 \\
  -e MYSQL_ROOT_PASSWORD=Root@123 \\
  -e MYSQL_DATABASE=appdb \\
  -e MYSQL_USER=appuser \\
  -e MYSQL_PASSWORD=App@123 \\
  -v mysql_data:/var/lib/mysql \\
  --restart=unless-stopped \\
  mysql:8.0.35 \\
  --character-set-server=utf8mb4 \\
  --default-authentication-plugin=mysql_native_password

# 查看启动日志，确认就绪
docker logs -f mysql
# 看到 "ready for connections" 就 OK

# 进入容器连接 MySQL
docker exec -it mysql mysql -uroot -pRoot@123
# mysql> SHOW DATABASES;
# mysql> CREATE TABLE appdb.users (id INT PRIMARY KEY, name VARCHAR(50));
# mysql> exit

# 验证数据持久化：删容器重建，数据还在
docker stop mysql && docker rm mysql
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=Root@123 -v mysql_data:/var/lib/mysql mysql:8.0.35
docker exec mysql mysql -uroot -pRoot@123 -e "SHOW DATABASES"
# appdb 还在！因为数据在卷里
\`\`\`

### 9.2 运行 Redis 容器

\`\`\`bash
# 启动 Redis，开启 AOF 持久化
docker run -d \\
  --name redis \\
  -p 6379:6379 \\
  -v redis_data:/data \\
  --restart=unless-stopped \\
  redis:7.2-alpine \\
  redis-server --appendonly yes --requirepass Redis@123

# 连接 Redis 测试
docker exec -it redis redis-cli -a Redis@123
# 127.0.0.1:6379> SET name "docker"
# OK
# 127.0.0.1:6379> GET name
# "docker"
# 127.0.0.1:6379> exit

# 查看内存使用
docker stats --no-stream redis
\`\`\`

### 9.3 运行 Nginx 容器（挂载自定义页面）

\`\`\`bash
# 准备自定义页面
mkdir -p /data/nginx/html
cat > /data/nginx/html/index.html <<'EOF'
<!DOCTYPE html>
<html><body><h1>Hello from Docker Nginx!</h1></body></html>
EOF

# 准备自定义配置
mkdir -p /data/nginx/conf
cat > /data/nginx/conf/default.conf <<'EOF'
server {
    listen 80;
    server_name localhost;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
EOF

# 启动 nginx，挂载页面和配置
docker run -d \\
  --name nginx \\
  -p 8080:80 \\
  -v /data/nginx/html:/usr/share/nginx/html \\
  -v /data/nginx/conf:/etc/nginx/conf.d:ro \\
  --restart=unless-stopped \\
  nginx:1.25

# 访问 http://localhost:8080 看到自定义页面

# 修改页面后，nginx 直接生效（静态文件无需 reload）
echo "<h1>Updated!</h1>" > /data/nginx/html/index.html

# 修改配置文件后，需 reload
docker exec nginx nginx -s reload

# 查看访问日志
docker logs --tail 20 nginx
\`\`\`

### 9.4 一键清理本次实战环境

\`\`\`bash
docker stop mysql redis nginx
docker rm mysql redis nginx
docker volume rm mysql_data redis_data
\`\`\`

---

## 十、本章小结

\`\`\`text
核心要点回顾：
1. docker run = 拉镜像 + 创建容器 + 启动，核心参数 -d -p -v -e --name --rm
2. docker ps 看运行中，-a 看全部，-f 过滤，-q 只取 ID
3. stop 优雅停（SIGTERM），kill 强杀（SIGKILL），生产优先 stop
4. exec 进入容器调试（-it），attach 连主进程（小心 Ctrl+C 杀容器）
5. logs 看日志（-f 跟踪，--tail 取尾），inspect 查配置，stats 监控资源
6. cp 主机容器互拷，top 看容器内进程（宿主机视角）
7. 容器数据要持久化必须用 -v 挂卷，否则删容器即丢
8. --restart=unless-stopped 让容器随服务器自愈
\`\`\`

### 10.1 常见问题

\`\`\`text
Q: docker exec 进不去，报 "executable file not found"？
A: 镜像里没有 bash，换成 sh：docker exec -it 容器 sh。alpine 镜像默认只有 sh。

Q: docker logs 没有输出，但容器在跑？
A: 应用把日志写到文件而非 stdout。改成输出到 stdout，或 docker exec 进去 cat 日志文件。

Q: 容器一启动就 Exited (1)？
A: docker logs 容器 看报错；常见原因：命令写错、依赖未就绪、权限不足、配置文件语法错。

Q: docker stop 卡住很久？
A: 应用没处理 SIGTERM，用 docker kill 强杀，或 -t 设短超时；根本解决是让应用正确响应 SIGTERM。

Q: 端口被占用 "bind: address already in use"？
A: 主机端口被占。换端口，或 lsof -i:8080 找占用进程杀掉。
\`\`\`

### 10.2 下一章预告

下一章学习 Dockerfile 编写：用 FROM/RUN/CMD/ENTRYPOINT 等指令把你的应用打包成镜像，掌握多阶段构建、构建缓存优化，并实战为 FastAPI/Flask/Django 写 Dockerfile。
`,
  },
  {
    id: "deploy-dockerfile",
    icon: "📝",
    title: "Dockerfile 编写",
    group: "Docker 容器化",
    content: `# Dockerfile 编写

## 一、Dockerfile 是什么

前面我们用的都是别人做好的镜像（nginx、mysql）。实际工作中，你要把自己的应用也打包成镜像，这就需要 **Dockerfile**。

Dockerfile 是一个纯文本文件，里面写了一系列**指令（Instruction）**，描述"这个镜像怎么从零搭起来"。执行 \`docker build\` 时，Docker 会逐行读取指令，一步步构建出镜像。

\`\`\`text
Dockerfile 的本质：
  一个"镜像构建脚本"，用指令描述环境搭建过程
  每条指令对应镜像里的一层（Layer）

Dockerfile → docker build → 镜像 → docker run → 容器
\`\`\`

### 1.1 最简单的 Dockerfile

\`\`\`dockerfile
# 文件名必须叫 Dockerfile（无后缀）
FROM python:3.12-slim
WORKDIR /app
COPY . .
CMD ["python", "app.py"]
\`\`\`

构建并运行：

\`\`\`bash
# 在 Dockerfile 所在目录构建，-t 给镜像起名，. 表示构建上下文
docker build -t myapp:v1 .

# 运行
docker run --rm myapp:v1
\`\`\`

---

## 二、基本指令：FROM / RUN / CMD / ENTRYPOINT

### 2.1 FROM：指定基础镜像

任何 Dockerfile 的第一条非注释指令必须是 FROM，表示"站在谁的肩膀上"。

\`\`\`dockerfile
# 用官方 Python 镜像做基础
FROM python:3.12-slim

# 用 alpine（极小，约 5MB，但坑多）
FROM python:3.12-alpine

# 用多阶段构建的中间镜像（后面讲）
FROM golang:1.21 AS builder

# 用 scratch（空镜像，适合静态二进制）
FROM scratch

# 用指定 digest 锁死版本（最严格）
FROM python:3.12-slim@sha256:abc123...
\`\`\`

选基础镜像的建议：

\`\`\`text
优先级：
1. 官方镜像 > 第三方镜像（安全、维护好）
2. slim 版 > 完整版（体积小，坑少） > alpine（最小但可能遇 musl 兼容问题）
3. 锁定具体版本（3.12-slim）而非 latest
\`\`\`

### 2.2 RUN：构建时执行命令

RUN 在**构建镜像时**执行命令，结果会提交为新的一层。最常用来装依赖。

\`\`\`dockerfile
# shell 形式（默认 /bin/sh -c "命令"）
RUN apt update && apt install -y curl vim

# exec 形式（直接执行，不经过 shell，无变量展开、无管道）
RUN ["apt", "update"]

# 典型：装系统依赖 + 清理缓存（同一层内完成，避免缓存残留）
RUN apt update && apt install -y --no-install-recommends \\
    build-essential \\
    libssl-dev \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

RUN 的两种形式区别：

\`\`\`text
shell 形式  RUN command       → /bin/sh -c "command"，支持变量 $VAR、管道 |、重定向 >
exec 形式   RUN ["cmd","arg"] → 直接 exec，不经 shell，不支持 $VAR、管道

需要 shell 特性（管道、变量、&&）用 shell 形式
否则用 exec 形式（更明确，不依赖 shell）
\`\`\`

### 2.3 CMD：容器默认启动命令

CMD 指定容器启动时**默认**执行的命令。一个 Dockerfile 只能有一个 CMD（多个时只有最后一个生效），可被 \`docker run\` 覆盖。

\`\`\`dockerfile
# exec 形式（推荐，能正确接收信号）
CMD ["python", "app.py"]

# shell 形式（会变成 /bin/sh -c "python app.py"，sh 成了 PID1，信号传递有问题）
CMD python app.py

# 带参数的 exec 形式
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
\`\`\`

\`\`\`bash
# 默认执行 CMD
docker run myapp
# 覆盖 CMD：在镜像名后写新命令
docker run myapp python debug.py
docker run myapp bash
\`\`\`

### 2.4 ENTRYPOINT：容器入口程序

ENTRYPOINT 也是启动命令，但比 CMD 更"硬"——不易被覆盖。常用来固定启动逻辑，CMD 退化为给 ENTRYPOINT 传参。

\`\`\`dockerfile
# 固定入口为 nginx，CMD 提供默认参数
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
\`\`\`

\`\`\`bash
# 默认：nginx -g "daemon off;"
docker run mynginx
# 覆盖 CMD 参数：nginx -t（测试配置）
docker run mynginx -t
# 强制覆盖 ENTRYPOINT（需 --entrypoint）
docker run --entrypoint bash mynginx
\`\`\`

CMD vs ENTRYPOINT 对比（高频面试题）：

\`\`\`text
                可被 docker run 后接命令覆盖？   作用
CMD             ✅ 是（直接覆盖）                 默认命令，可被替换
ENTRYPOINT      ❌ 否（参数追加到它后面）         固定入口，CMD 变它的参数

最佳实践：
- 单一启动命令用 CMD（exec 形式）
- 需要固定入口 + 可变参数 用 ENTRYPOINT + CMD
\`\`\`

---

## 三、文件操作：COPY / ADD / WORKDIR

### 3.1 COPY：复制文件到镜像

\`\`\`dockerfile
# 复制单个文件
COPY app.py /app/app.py

# 复制整个目录（复制 src 内容到 dest，不含 src 目录本身）
COPY src/ /app/src/

# 复制多个文件
COPY requirements.txt setup.py /app/

# 用通配符
COPY *.py /app/

# 复制并改名
COPY config.prod.yaml /app/config.yaml
\`\`\`

COPY 的源路径是**构建上下文**（docker build 时传的那个 \`.\` 目录）里的路径，不是宿主机任意路径。

### 3.2 ADD：COPY 的增强版（慎用）

ADD 比 COPY 多两个能力：自动解压 tar 包、支持 URL。但因为行为隐晦，官方推荐**优先用 COPY**。

\`\`\`dockerfile
# 自动解压本地 tar
ADD rootfs.tar.gz /

# 从 URL 下载（不推荐，构建不可复现，应先 curl 下来再 COPY）
ADD https://example.com/bigfile.tar.gz /tmp/
\`\`\

\`\`\`text
何时用 ADD：仅当需要自动解压 tar 时
其余情况一律用 COPY（行为明确）
\`\`\`

### 3.3 WORKDIR：设置工作目录

\`\`\`dockerfile
# 设置后续指令的工作目录（不存在会自动创建）
WORKDIR /app

# 之后的 RUN/CMD/COPY 都以 /app 为当前目录
COPY . .                 # 复制到 /app
RUN pip install -r requirements.txt   # 在 /app 执行
CMD ["python", "app.py"] # 在 /app 启动

# 可以多次切换
WORKDIR /app/src
RUN ls
\`\`\`

> 推荐用 WORKDIR 而不是 \`cd /app && ...\`，因为 WORKDIR 在整个 Dockerfile 生效，且更清晰。

---

## 四、环境与配置：ENV / ARG / EXPOSE / USER

### 4.1 ENV：设置环境变量（运行时也生效）

\`\`\`dockerfile
# 设置环境变量，构建时和容器运行时都生效
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV APP_HOME=/app

# 引用前面的变量
WORKDIR $APP_HOME
\`\`\`

\`\`\`bash
# 容器内能看到这些变量
docker run --rm myapp env | grep PYTHON
# PYTHONUNBUFFERED=1
# PYTHONDONTWRITEBYTECODE=1

# 运行时可用 -e 覆盖
docker run -e PYTHONUNBUFFERED=0 myapp
\`\`\`

### 4.2 ARG：构建时变量（仅构建期有效）

\`\`\`dockerfile
# 声明构建参数，有默认值
ARG PYTHON_VERSION=3.12
FROM python:$PYTHON_VERSION-slim

ARG APP_VERSION=unknown
ENV APP_VERSION=$APP_VERSION
RUN echo "Building version $APP_VERSION"
\`\`\`

\`\`\`bash
# 构建时传参
docker build --build-arg APP_VERSION=1.2.0 -t myapp:1.2.0 .
docker build --build-arg PYTHON_VERSION=3.11 -t myapp:py311 .
\`\`\`

ENV vs ARG：

\`\`\`text
ARG  仅构建期可见，运行时容器内看不到（除非再 ENV 一次）
ENV  构建期 + 运行期都可见

放敏感信息（密码、密钥）？两者都不要！
ARG 会留在镜像 history 里能看到，ENV 直接在镜像里
敏感信息用运行时 -e 或 secrets 管理
\`\`\`

### 4.3 EXPOSE：声明端口

\`\`\`dockerfile
# 声明容器监听端口（仅文档声明，不会自动映射到主机）
EXPOSE 8000
EXPOSE 80 443
\`\`\

\`\`\`bash
# EXPOSE 不会自动映射，仍需 -p
docker run -p 8000:8000 myapp

# 用 -P（大写）自动映射所有 EXPOSE 的端口到主机高位端口
docker run -P myapp
docker port $(docker ps -ql)
# 8000/tcp -> 0.0.0.0:32768
\`\`\`

EXPOSE 的价值是**文档化**：告诉使用者这个镜像要暴露哪些端口，配合 \`-P\` 自动映射。

### 4.4 USER：切换运行用户

默认容器以 root 运行，有安全风险。用 USER 切到非 root 用户。

\`\`\`dockerfile
# 创建专用用户并切换
RUN groupadd -r app && useradd -r -g app appuser
USER appuser
CMD ["python", "app.py"]
\`\`\`

\`\`\`dockerfile
# 用现成的 nobody 用户
USER nobody

# 用 用户:组
USER 1000:1000
\`\`\`

> 生产镜像强烈建议非 root 运行（最小权限原则）。注意切换后该用户要有权访问所需文件，否则报权限错误。

---

## 五、多阶段构建（multi-stage build）

多阶段构建是优化镜像大小和安全的杀手锏：在一个 Dockerfile 里用多个 FROM，每个 FROM 开始一个新阶段，最后只把需要的产物拷到最终镜像。

### 5.1 为什么需要多阶段

以 Go 程序为例：构建时需要 go 工具链（几百 MB），但运行时只需要编译出的二进制（几 MB）。如果不用多阶段，最终镜像带着整个 go 环境，又大又不安全。

\`\`\`dockerfile
# ===== 阶段 1：构建（含编译工具链）=====
FROM golang:1.21 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o myapp -ldflags="-s -w" .

# ===== 阶段 2：运行（极小）=====
FROM alpine:3.19
COPY --from=builder /src/myapp /usr/local/bin/myapp
CMD ["myapp"]
\`\`\`

\`\`\`bash
# 构建结果对比
# 单阶段（带 go 工具链）：~850MB
# 多阶段（只带二进制 + alpine）：~15MB
\`\`\`

### 5.2 多阶段构建要点

\`\`\`dockerfile
# 用 AS 给阶段命名
FROM node:20 AS builder
RUN npm run build

# 从指定阶段拷贝
COPY --from=builder /app/dist ./dist

# 从外部镜像拷贝
COPY --from=nginx:1.25 /etc/nginx/nginx.conf /etc/nginx/nginx.conf

# 指定最终构建哪个阶段（默认最后一个）
# docker build --target builder -t myapp:builder .
FROM mybase AS final
...
\`\`\`

### 5.3 Python 多阶段示例

\`\`\`dockerfile
# 阶段 1：构建 wheel
FROM python:3.12 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# 阶段 2：运行
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
COPY . .
CMD ["python", "app.py"]
\`\`\`

---

## 六、.dockerignore：构建上下文瘦身

\`docker build\` 会把"构建上下文"（命令最后的 \`.\` 目录）整个发给 dockerd。如果不加过滤，\`node_modules\`、\`.git\`、虚拟环境都会被发送，又慢又把镜像搞大。

### 6.1 创建 .dockerignore

\`\`\`bash
# 与 Dockerfile 同目录创建 .dockerignore
cat > .dockerignore <<'EOF'
# 版本控制
.git
.gitignore

# Python 缓存与虚拟环境
__pycache__/
*.pyc
.venv/
venv/
env/

# Node
node_modules/
npm-debug.log*

# 测试与文档
tests/
*.md
docs/

# IDE
.idea/
.vscode/
*.swp

# 环境/密钥（非常重要，防止泄密！）
.env
.env.*
*.pem
*.key
credentials.json

# 构建产物
dist/
build/
*.egg-info/

# Docker 自身
Dockerfile
docker-compose*.yml
.dockerignore
EOF
\`\`\`

### 6.2 效果对比

\`\`\`bash
# 不加 .dockerignore：发送 500MB 上下文
docker build -t app .
# Sending build context to Docker daemon  524.3MB

# 加 .dockerignore：发送 2MB
# Sending build context to Docker daemon  2.1MB
\`\`\`

---

## 七、构建优化：层缓存与合并 RUN

Docker 构建时，每条指令产生一层，且**指令内容不变就命中缓存**。利用好缓存能让构建从几分钟降到几秒。

### 7.1 缓存失效规则

\`\`\`text
缓存命中条件：指令文本完全相同 + 上层缓存命中 + COPY/ADD 的文件内容（哈希）相同
一旦某层缓存失效，它之后所有层都失效，重新执行

所以：把"变化频率低"的指令放前面，"变化频率高"的放后面
\`\`\`

### 7.2 反面教材 vs 正面教材

\`\`\`dockerfile
# ❌ 反面教材：COPY . . 在 pip install 前，代码一改就重装依赖
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
# 每次 app.py 改一个字 → COPY 层失效 → pip install 重跑（巨慢）
\`\`\`

\`\`\`dockerfile
# ✅ 正面教材：先 COPY requirements.txt，装好依赖，再 COPY 代码
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .          # requirements.txt 很少变，缓存命中
RUN pip install -r requirements.txt  # 依赖装一次，长期复用
COPY . .                          # 代码常变，放最后，改代码只重建这一层
CMD ["python", "app.py"]
\`\`\`

### 7.3 合并 RUN 减少层数

\`\`\`dockerfile
# ❌ 每条 RUN 一层，且有冗余
RUN apt update
RUN apt install -y curl
RUN apt install -y vim
RUN rm -rf /var/lib/apt/lists/*

# ✅ 合并成一条，且同一层内清理缓存
RUN apt update && apt install -y --no-install-recommends \\
    curl vim \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

为什么要"同一层清理"：

\`\`\`text
分层是只读叠加的。如果在 A 层下载了 100MB，在 B 层 rm 删掉，
最终镜像里 A 层的 100MB 仍然存在（rm 只是盖了一层"删除标记"）。
所以下载和清理必须在同一层（同一 RUN）才能真正减小体积。
\`\`\`

### 7.4 BuildKit 与缓存挂载

\`\`\`dockerfile
# 语法指令启用 BuildKit
# syntax=docker/dockerfile:1
FROM python:3.12-slim
RUN --mount=type=cache,target=/root/.cache/pip \\
    pip install -r requirements.txt
\`\`\

\`\`\`bash
# 启用 BuildKit
DOCKER_BUILDKIT=1 docker build -t myapp .

# pip 缓存挂载到宿主机，下次构建复用，不再重复下载包
\`\`\`

---

## 八、实战：Python 应用 Dockerfile

### 8.1 FastAPI 应用 Dockerfile

项目结构：

\`\`\`text
myapi/
├── app/
│   ├── __init__.py
│   └── main.py
├── requirements.txt
└── Dockerfile
\`\`\`

\`\`\`dockerfile
# Dockerfile
FROM python:3.12-slim

# 设置环境变量，优化 Python 在容器内的行为
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 先装依赖（利用缓存）
COPY requirements.txt .
RUN pip install -r requirements.txt

# 创建非 root 用户
RUN groupadd -r app && useradd -r -g app -d /app appuser
USER appuser

# 复制代码
COPY --chown=appuser:app . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

\`\`\`bash
# 构建
docker build -t myapi:v1 .

# 运行
docker run -d -p 8000:8000 --name api myapi:v1

# 测试
curl http://localhost:8000/docs
\`\`\`

### 8.2 Flask 应用 Dockerfile

\`\`\`dockerfile
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
\`\`\`

### 8.3 Django 应用 Dockerfile

\`\`\`dockerfile
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# 系统依赖（Django 处理图片等需要）
RUN apt update && apt install -y --no-install-recommends \\
    libpq-dev gcc \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myproject.wsgi:application"]
\`\`\`

### 8.4 构建调试技巧

\`\`\`bash
# 看每步构建详情
docker build --progress=plain -t myapp .

# 构建失败时进入中间层调试
docker build --target=builder -t myapp:debug .
docker run -it myapp:debug bash

# 给镜像打多个标签
docker build -t myapp:v1.0.0 -t myapp:latest .

# 查看构建历史（哪步花了多久、哪步用了缓存）
docker build --progress=plain -t myapp . 2>&1 | tee build.log
\`\`\`

---

## 九、本章小结

\`\`\`text
核心要点回顾：
1. Dockerfile = 镜像构建脚本，每条指令一层，docker build 执行
2. FROM 基础镜像（优先官方 slim），RUN 构建期执行，CMD/ENTRYPOINT 启动命令
3. CMD 可被覆盖，ENTRYPOINT 固定入口；exec 形式 ["a","b"] 优于 shell 形式
4. COPY 优于 ADD；先 COPY requirements 再 COPY 代码（利用缓存）
5. ENV 运行期可见，ARG 仅构建期；敏感信息两者都别放
6. 多阶段构建：builder 阶段编译，final 阶段只拷产物，大幅瘦身
7. .dockerignore 必备，防止发送大上下文和泄密
8. 合并 RUN + 同层清理缓存，减少层数和体积
9. 非特权 USER 运行，EXPOSE 声明端口
\`\`\`

### 9.1 常见问题

\`\`\`text
Q: COPY 报 "no such file or directory"？
A: 源路径必须在构建上下文（docker build 最后的 . 目录）内，不能用 ../跳出。

Q: 镜像里跑不起来，说 "command not found"？
A: CMD 用 shell 形式时若无 /bin/sh 会失败；改用 exec 形式 ["python","app.py"]。

Q: 改一行代码，pip install 又重跑？
A: 把 COPY requirements.txt + pip install 放在 COPY . . 之前，利用缓存。

Q: 镜像里带 .git 或 .env，泄密了？
A: 加 .dockerignore 排除敏感文件；构建后用 docker history 检查。

Q: 多阶段构建 COPY --from 报错？
A: 阶段名要对应（AS builder → COPY --from=builder），且阶段内确实产生了该文件。
\`\`\`

### 9.2 下一章预告

下一章深入 Docker 网络与数据卷：理解 bridge/host/overlay 网络模型，让容器之间互相通信，用 volume 和 bind mount 做数据持久化，实战 Python 应用 + 数据库 + 数据卷的完整组合。
`,
  },
  {
    id: "deploy-docker-network",
    icon: "🔗",
    title: "网络与数据卷",
    group: "Docker 容器化",
    content: `# 网络与数据卷

## 一、为什么单独讲网络和存储

容器隔离有两堵墙：**网络**和**存储**。

- 网络决定容器之间、容器与外部怎么通信。
- 存储决定容器删除后，数据能不能留下来。

这两块是容器进生产必须啃下的硬骨头。本章先讲网络模型，再讲数据卷，最后实战把它们组合起来。

---

## 二、Docker 网络模型

Docker 安装后会自动创建三个网络，每个容器必须连到某个网络。

### 2.1 查看现有网络

\`\`\`bash
docker network ls
\`\`\`

输出示例：

\`\`\`text
NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5f6   bridge    bridge    local
b2c3d4e5f6a7   host      host      local
c3d4e5f6a7b8   none      null      local
\`\`\`

### 2.2 四种网络驱动

\`\`\`text
驱动       说明                                            典型场景
─────────────────────────────────────────────────────────────────
bridge     默认。容器接到虚拟网桥 docker0，NAT 出网           单机多容器互连
host       容器直接用宿主机网络栈，无隔离                    追求性能、不需隔离
none       无网络，完全隔离                                 纯计算任务、安全沙箱
overlay    跨主机容器通信（需 Swarm）                       多机集群
macvlan    给容器分配独立 MAC，像物理机一样接入局域网        老应用迁移
\`\`\`

### 2.3 bridge 网络详解（最常用）

默认 bridge 网络的工作原理：

\`\`\`text
┌─────────────────────────────────────────┐
│ 宿主机                                    │
│                                          │
│  ┌────────┐  ┌────────┐                  │
│  │容器A    │  │容器B    │                  │
│  │172.17.0.2│ │172.17.0.3│                │
│  └───┬────┘  └───┬────┘                  │
│      │           │                        │
│   ┌──┴───────────┴──┐    ┌──────────┐    │
│   │ docker0 网桥     │───►│ eth0 主机 │─────┼──► 外网
│   │ 172.17.0.1/16   │NAT │ 网卡      │    │
│   └─────────────────┘    └──────────┘    │
└─────────────────────────────────────────┘

- 容器从 172.17.0.0/16 子网分 IP
- 通过 docker0 网桥互连
- 出网走宿主机 NAT（SNAT）
- 外部访问容器需 -p 端口映射（DNAT）
\`\`\`

### 2.4 默认 bridge vs 自定义 bridge

\`\`\`text
默认 bridge（docker0）：
- 所有容器都连这，杂
- 容器间只能用 IP 通信，不能用容器名（无 DNS）

自定义 bridge（推荐）：
- 独立隔离
- 容器间可用容器名互相访问（内置 DNS）
- 可自定义子网、网关
\`\`\`

---

## 三、docker network 命令

### 3.1 创建自定义网络

\`\`\`bash
# 创建一个 bridge 网络
docker network create mynet

# 指定子网和网关
docker network create --subnet=172.20.0.0/16 --gateway=172.20.0.1 mynet

# 创建时指定驱动（默认 bridge）
docker network create -d bridge mynet
\`\`\`

### 3.2 启动容器时连接网络

\`\`\`bash
# 用 --network 指定网络
docker run -d --name web --network mynet nginx
docker run -d --name db --network mynet mysql:8.0
\`\`\`

### 3.3 容器间用名字通信（自定义网络才有 DNS）

\`\`\`bash
# web 容器内用 "db" 这个名字就能连到 mysql 容器
docker exec -it web sh
# 在 web 容器里：
ping db            # 能解析到 db 容器的 IP
curl http://db     # 用服务名访问

# 这是因为自定义 bridge 内置了 DNS 服务器（127.0.0.11）
cat /etc/resolv.conf
# nameserver 127.0.0.11
\`\`\`

> 默认 bridge 网络没有 DNS，容器间只能用 IP，所以**生产一定用自定义 bridge**。

### 3.4 connect / disconnect：动态增删网络

\`\`\`bash
# 把运行中的容器加入另一个网络
docker network connect mynet2 web

# 现在 web 同时连 mynet 和 mynet2
docker inspect web -f '{{json .NetworkSettings.Networks}}' | python3 -m json.tool

# 从网络断开
docker network disconnect mynet2 web
\`\`\`

### 3.5 查看网络详情

\`\`\`bash
# 看网络里有哪些容器、子网配置
docker network inspect mynet

# 只看容器列表
docker network inspect mynet -f '{{range .Containers}}{{.Name}} {{end}}'
# 输出：web db
\`\`\`

### 3.6 删除网络

\`\`\`bash
# 删除空网络
docker network rm mynet

# 删除所有未使用的网络
docker network prune
\`\`\`

---

## 四、端口映射详解

容器在 bridge 网络里有自己的 IP，但外部访问不到。端口映射把宿主机端口转发到容器端口。

### 4.1 -p 的各种写法

\`\`\`bash
# 主机 8080 → 容器 80（默认绑所有网卡 0.0.0.0）
docker run -d -p 8080:80 nginx

# 指定主机 IP
docker run -d -p 127.0.0.1:8080:80 nginx     # 仅本机访问
docker run -d -p 0.0.0.0:8080:80 nginx       # 所有网卡（默认）

# 省略主机端口：Docker 随机分配高位端口
docker run -d -p 80 nginx
docker port $(docker ps -ql)    # 查映射到哪个端口，如 32768

# 指定端口范围
docker run -d -p 8000-8100:8000-8100 nginx

# UDP
docker run -d -p 53:53/udp coredns

# 多端口
docker run -d -p 80:80 -p 443:443 nginx
\`\`\`

### 4.2 查看端口映射

\`\`\`bash
docker port web
# 输出：
# 80/tcp -> 0.0.0.0:8080

docker ps    # PORTS 列也能看
\`\`\`

### 4.3 host 网络模式

\`\`\`bash
# host 模式：容器直接用宿主机网络，无端口映射开销，但失去隔离
docker run -d --network host nginx
# 此时 nginx 直接占用宿主机 80 端口，无需 -p

# 适用：对网络性能敏感、不需要隔离的场景（如本机监控 agent）
# 注意：host 模式下 -p 无效；macOS/Windows 上 host 模式行为有限制
\`\`\`

---

## 五、数据卷：volume vs bind mount

容器删除后，可写层的数据随之消失。要持久化，必须把数据放在容器外。Docker 提供两种方式。

### 5.1 两种持久化方式对比

\`\`\`text
方式            管理者        位置                                跨平台    生命周期
─────────────────────────────────────────────────────────────────────────
volume          Docker        /var/lib/docker/volumes/（Docker管）  ✅ 好    独立于容器
bind mount      用户          主机任意路径                          ❌ 依赖主机 跟随主机路径

volume：Docker 全权管理，推荐用于数据库等持久化数据
bind mount：直接挂主机目录，适合开发时挂代码、配置文件
\`\`\`

### 5.2 volume（命名数据卷）

\`\`\`bash
# 创建一个命名卷
docker volume create mydata

# 查看
docker volume ls
# DRIVER    VOLUME NAME
# local     mydata

# 查看卷详情（实际存储路径）
docker volume inspect mydata
# Mountpoint: /var/lib/docker/volumes/mydata/_data

# 启动容器挂载卷
docker run -d -v mydata:/app/data --name app myapp

# 容器往 /app/data 写的数据，实际存到上面的 _data 目录
docker exec app sh -c "echo hello > /app/data/test.txt"

# 即使删了容器，卷还在，数据还在
docker rm -f app
docker run -d -v mydata:/app/data --name app2 myapp
docker exec app2 cat /app/data/test.txt   # hello
\`\`\`

### 5.3 bind mount（绑定挂载）

\`\`\`bash
# 主机目录直接挂进容器（用绝对路径）
docker run -d -v /data/html:/usr/share/nginx/html --name web nginx

# 推荐用 --mount 写法（更明确）
docker run -d --mount type=bind,source=/data/html,target=/usr/share/nginx/html nginx

# 只读挂载
docker run -d -v /data/config:/etc/nginx:ro nginx

# 开发常用：把代码目录挂进容器，改代码即时生效
docker run -d -v "$PWD":/app -w /app python:3.12 python app.py
\`\`\`

### 5.4 bind mount 的坑

\`\`\`text
坑 1：挂载会"覆盖"容器内对应目录
  - 镜像里 /usr/share/nginx/html 本来有欢迎页
  - -v /data/html:/usr/share/nginx/html 后，看到的是主机 /data/html 内容
  - 如果主机目录是空的，容器内对应目录也变空

坑 2：主机目录权限
  - 容器内非 root 用户可能无法写主机目录
  - 用 -v 挂载时要确保权限

坑 3：macOS 上 bind mount 性能差
  - 因要跨 macOS→Linux VM 文件系统，IO 慢
  - 对 node_modules 等高 IO 场景影响大
\`\`\`

---

## 六、docker volume 命令

### 6.1 常用命令

\`\`\`bash
# 创建
docker volume create mydata

# 列出
docker volume ls

# 查看详情
docker volume inspect mydata

# 删除（未被容器使用的）
docker volume rm mydata

# 删除所有未使用的卷（危险，会删数据！）
docker volume prune

# 删除所有未使用卷，跳过确认
docker volume prune -f
\`\`\`

### 6.2 匿名卷 vs 命名卷

\`\`\`bash
# 命名卷：有名字，好管理
docker run -v mydata:/data app

# 匿名卷：Docker 随机起一串哈希名，难管理
docker run -v /data app
docker volume ls
# DRIVER  VOLUME NAME
# local   1a2b3c4d5e6f...   <- 匿名卷

# 推荐：永远用命名卷，避免匿名卷堆积成垃圾
\`\`\`

---

## 七、数据持久化与备份恢复

### 7.1 数据库数据持久化

\`\`\`bash
# MySQL 数据放命名卷，删容器数据不丢
docker run -d \\
  --name mysql \\
  -e MYSQL_ROOT_PASSWORD=Root@123 \\
  -v mysql_data:/var/lib/mysql \\
  mysql:8.0.35
\`\`\`

### 7.2 备份数据卷

\`\`\`bash
# 方法一：用临时容器把卷内容打包到主机
docker run --rm -v mysql_data:/data -v /backup:/backup alpine \\
  tar czf /backup/mysql_data_$(date +%Y%m%d).tar.gz -C /data .

# 方法二：直接 docker exec 在容器内 dump
docker exec mysql mysqldump -uroot -pRoot@123 --all-databases > /backup/all.sql
\`\`\`

### 7.3 恢复数据卷

\`\`\`bash
# 解压备份到新卷
docker volume create mysql_data_new
docker run --rm -v mysql_data_new:/data -v /backup:/backup alpine \\
  tar xzf /backup/mysql_data_20260703.tar.gz -C /data

# 用新卷启动
docker run -d -v mysql_data_new:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=Root@123 mysql:8.0.35
\`\`\`

### 7.4 卷的迁移

\`\`\`bash
# 把卷数据从一台机器迁到另一台
# 源机器：打包
docker run --rm -v myvol:/data -v $PWD:/backup alpine tar czf /backup/myvol.tar.gz -C /data .
# 传到目标机器：scp myvol.tar.gz target:/backup/
# 目标机器：还原
docker volume create myvol
docker run --rm -v myvol:/data -v /backup:/backup alpine tar xzf /backup/myvol.tar.gz -C /data
\`\`\`

---

## 八、实战：Python 应用 + 数据库 + 数据卷

把网络和数据卷组合，搭一个真实的 Web + DB 架构。

### 8.1 目标架构

\`\`\`text
┌─────────────────────────────────────┐
│ 自定义网络 appnet                     │
│                                      │
│  ┌──────────┐       ┌──────────┐    │
│  │ api 容器  │──────►│ db 容器    │    │
│  │ FastAPI  │  用名  │ MySQL    │    │
│  │ :8000    │  db访问│ :3306    │    │
│  └──────────┘       └────┬─────┘    │
│                          │           │
│                     ┌────▼─────┐    │
│                     │mysql_data│    │
│                     │  (卷)    │    │
│                     └──────────┘    │
│                                      │
│  -p 8000:8000 把 api 暴露给主机        │
└─────────────────────────────────────┘
\`\`\`

### 8.2 创建网络和卷

\`\`\`bash
docker network create appnet
docker volume create mysql_data
\`\`\`

### 8.3 启动数据库容器

\`\`\`bash
docker run -d \\
  --name db \\
  --network appnet \\
  --network-alias mysql \\
  -e MYSQL_ROOT_PASSWORD=Root@123 \\
  -e MYSQL_DATABASE=appdb \\
  -e MYSQL_USER=appuser \\
  -e MYSQL_PASSWORD=App@123 \\
  -v mysql_data:/var/lib/mysql \\
  --restart=unless-stopped \\
  mysql:8.0.35
\`\`\`

### 8.4 启动 Python 应用容器

应用代码里用 \`mysql\`（容器名）作为数据库主机：

\`\`\`python
# app/main.py（伪代码）
import os
DATABASE_URL = "mysql+ pymysql://appuser:App@123@mysql:3306/appdb"
#                                  ^^^^^ 用容器名 mysql，不是 localhost
\`\`\`

\`\`\`bash
docker run -d \\
  --name api \\
  --network appnet \\
  -p 8000:8000 \\
  -e DATABASE_URL="mysql+pymysql://appuser:App@123@mysql:3306/appdb" \\
  --restart=unless-stopped \\
  myapi:v1
\`\`\`

### 8.5 验证容器间通信

\`\`\`bash
# 从 api 容器 ping db 容器（用名字）
docker exec api sh -c "apt update && apt install -y iputils-ping && ping -c 3 db"
# PING db (172.20.0.3): 56 data bytes
# 64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.2 ms

# 从 api 容器连 db 的 3306
docker exec api python -c "import socket; s=socket.socket(); s.connect(('db',3306)); print('OK', s.recv(20))"
\`\`\`

### 8.6 测试数据持久化

\`\`\`bash
# 通过 api 写一条数据
curl -X POST http://localhost:8000/users -d '{"name":"tom"}' -H "Content-Type: application/json"

# 删掉 db 容器
docker rm -f db

# 用同一个卷重建 db
docker run -d --name db --network appnet -e MYSQL_ROOT_PASSWORD=Root@123 -v mysql_data:/var/lib/mysql mysql:8.0.35

# 数据还在
docker exec db mysql -uroot -pRoot@123 -e "SELECT * FROM appdb.users;"
\`\`\`

### 8.7 清理

\`\`\`bash
docker rm -f api db
docker network rm appnet
docker volume rm mysql_data
\`\`\`

---

## 九、本章小结

\`\`\`text
核心要点回顾：
1. 四种网络驱动：bridge（默认，最常用）/ host / none / overlay（跨机）
2. 默认 bridge 无 DNS，自定义 bridge 容器间可用名字通信（内置 DNS）
3. -p 主机:容器 做端口映射；host 模式无需映射但无隔离
4. network create/connect/disconnect 管理容器组网
5. 持久化两方式：volume（Docker 管，推荐）vs bind mount（挂主机目录，开发用）
6. 永远用命名卷，避免匿名卷堆积
7. 备份用临时容器 tar 打包卷，或容器内 dump
8. 多容器应用：自定义网络 + 服务名通信 + 卷持久化
\`\`\`

### 9.1 常见问题

\`\`\`text
Q: 容器间用 localhost 互相访问失败？
A: 每个容器有独立 localhost，要用容器名或 IP。自定义网络里用容器名。

Q: 默认 bridge 里 ping 容器名不通？
A: 默认 bridge 没 DNS，要么用 IP，要么换自定义网络。

Q: bind mount 后容器内目录变空了？
A: 主机目录覆盖了容器内目录，主机目录是空的就显示空。先往主机目录放文件。

Q: docker volume prune 把我的数据删了？
A: prune 删的是"没被任何容器使用的卷"。重要卷别让容器处于删除状态，或别用 prune。

Q: 容器内连不上外网？
A: 检查 docker0 的 NAT、宿主机 iptables/防火墙；公司网络可能限制容器出网。
\`\`\`

### 9.2 下一章预告

下一章专门讲 Python 应用容器化实战：requirements.txt / poetry / pipenv 在 Docker 中的用法，多阶段构建优化 Python 镜像，gunicorn/uvicorn 容器运行，HEALTHCHECK 健康检查，以及一个完整的 FastAPI 容器化示例。
`,
  },
  {
    id: "deploy-docker-python",
    icon: "🐍",
    title: "Python 应用容器化实战",
    group: "Docker 容器化",
    content: `# Python 应用容器化实战

前面几章打好了 Docker 基础，本章把这些知识聚焦到 Python 身上：怎么把一个 Python Web 应用高效、安全、生产级地容器化。我们会从最朴素的写法一步步优化，最后给出一个可直接用的 FastAPI 完整示例。

## 一、requirements.txt 与 pip 安装

### 1.1 最朴素的 Dockerfile

\`\`\`dockerfile
FROM python:3.12
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
\`\`\

问题一大堆：基础镜像太大（python:3.12 约 1GB）、没利用缓存、以 root 运行、没健康检查。我们后面逐个优化。

### 1.2 正确的依赖安装姿势

\`\`\`dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 先拷依赖清单，再装（利用层缓存）
COPY requirements.txt .
RUN pip install -r requirements.txt

# 再拷代码（代码常变）
COPY . .

CMD ["python", "app.py"]
\`\`\`

### 1.3 requirements.txt 最佳实践

\`\`\`text
# requirements.txt 示例：固定版本，生产必备
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
SQLAlchemy==2.0.25
pymysql==1.1.0
redis==5.0.1
python-dotenv==1.0.0
gunicorn==21.2.0

# 开发依赖分文件
# requirements-dev.txt
# -r requirements.txt
# pytest==7.4.4
# pytest-cov==4.1.0
# black==23.12.1
\`\`\`

用 pip-compile 生成锁文件更稳：

\`\`\`bash
pip install pip-tools
echo "fastapi" "uvicorn[standard]" > requirements.in
pip-compile requirements.in -o requirements.txt   # 生成带哈希的锁文件
\`\`\`

### 1.4 处理需要编译的包

有些包（如 cryptography、lxml、psycopg）需要编译器。两条路：装编译依赖，或用预编译 wheel。

\`\`\`dockerfile
# 装 gcc 和开发头文件（构建期需要，运行期不需要 → 多阶段）
RUN apt update && apt install -y --no-install-recommends \\
    gcc libpq-dev \\
    && rm -rf /var/lib/apt/lists/*
RUN pip install -r requirements.txt
\`\`\`

---

## 二、poetry / pipenv 在 Docker 中使用

### 2.1 Poetry 在 Docker 里

\`\`\`dockerfile
# 阶段 1：用 poetry 导出 requirements
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install poetry==1.7.1
COPY pyproject.toml poetry.lock ./
# 导出为 requirements.txt（不带哈希也行）
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# 阶段 2：用导出的 requirements 安装
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
\`\`\`

更简洁的"直接用 poetry install"方式（但会把 poetry 装进最终镜像）：

\`\`\`dockerfile
FROM python:3.12-slim
ENV POETRY_VIRTUALENVS_CREATE=false
RUN pip install poetry==1.7.1
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --no-dev
COPY . .
CMD ["python", "app.py"]
\`\`\`

> 推荐第一种（导出 requirements + 多阶段），最终镜像不带 poetry，更小更安全。

### 2.2 pipenv 在 Docker 里

\`\`\`dockerfile
FROM python:3.12-slim
RUN pip install pipenv
WORKDIR /app
COPY Pipfile Pipfile.lock ./
RUN pipenv install --system --deploy --ignore-pipfile
COPY . .
CMD ["python", "app.py"]
\`\`\`

\`\`\`text
--system        装到系统 Python，不建虚拟环境
--deploy        严格用 Pipfile.lock，版本不符就报错（生产用）
--ignore-pipfile 只用 lock 文件，保证可复现
\`\`\`

---

## 三、多阶段构建优化 Python 镜像

Python 镜像优化核心思路：把"构建期"（编译 wheel、装编译器）和"运行期"（只装 wheel、跑代码）分开。

### 3.1 wheel 多阶段构建

\`\`\`dockerfile
# ===== 阶段 1：构建 wheel =====
FROM python:3.12-slim AS builder
ENV PIP_NO_CACHE_DIR=1
WORKDIR /app

# 装编译依赖
RUN apt update && apt install -y --no-install-recommends gcc libpq-dev

COPY requirements.txt .
# 把所有依赖打包成 wheel，放到 /wheels
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ===== 阶段 2：运行 =====
FROM python:3.12-slim
WORKDIR /app

# 只装运行期需要的库（如 libpq，运行 psycopg 要）
RUN apt update && apt install -y --no-install-recommends libpq5 \\
    && rm -rf /var/lib/apt/lists/*

# 从 builder 拷 wheel，离线安装
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \\
    && rm -rf /wheels

COPY . .
CMD ["python", "app.py"]
\`\`\`

### 3.2 体积对比

\`\`\`text
方案                           镜像大小
──────────────────────────────────────
python:3.12 + 直接装            ~1.1GB
python:3.12-slim + 直接装        ~420MB
slim + 多阶段 + wheel            ~280MB
slim + 多阶段 + alpine 运行期     ~180MB（坑多，慎用）
\`\`\`

---

## 四、gunicorn / uvicorn 在容器中运行

### 4.1 FastAPI 用 uvicorn

\`\`\`dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\

### 4.2 生产用 gunicorn + uvicorn worker

单进程 uvicorn 不够，生产用 gunicorn 管理多个 uvicorn worker：

\`\`\`dockerfile
CMD ["gunicorn", "app.main:app", \\
     "-w", "4", \\
     "-k", "uvicorn.workers.UvicornWorker", \\
     "-b", "0.0.0.0:8000", \\
     "--access-logfile", "-", \\
     "--error-logfile", "-"]
\`\`\`

### 4.3 worker 数量动态化

容器里 worker 数应根据 CPU 核数定，但容器看到的 CPU 数可能不对。用脚本计算：

\`\`\`dockerfile
# entrypoint.sh
#!/bin/sh
WORKERS=$((2 * $(nproc) + 1))
exec gunicorn app.main:app -w "$WORKERS" -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
\`\`\

\`\`\`dockerfile
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
\`\`\`

### 4.4 优雅关闭（重要）

容器 stop 时，gunicorn 要能在超时内处理完已有请求再退出。

\`\`\`text
- docker stop 默认 10 秒后 SIGKILL
- gunicorn 收到 SIGTERM 后默认 30 秒 timeout 处理请求
- 两者不匹配会被强杀，丢请求

解决：
  1. gunicorn 设 --graceful-timeout 10
  2. docker stop -t 15 给足时间
  3. 确保用 exec 形式 CMD（让 gunicorn 成为 PID1 收信号）
\`\`\`

---

## 五、环境变量注入

### 5.1 ENV 与运行时 -e

\`\`\`dockerfile
# 构建期默认值
ENV APP_ENV=production \\
    LOG_LEVEL=info
\`\`\

\`\`\`bash
# 运行时覆盖
docker run -d \\
  -e APP_ENV=staging \\
  -e LOG_LEVEL=debug \\
  -e DATABASE_URL="mysql+pymysql://user:pass@db:3306/app" \\
  -e SECRET_KEY="..." \\
  myapi:v1
\`\`\`

### 5.2 配置文件 + 环境变量

\`\`\`python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_env: str = "production"
    database_url: str
    secret_key: str
    log_level: str = "info"

    class Config:
        env_file = ".env"   # 容器里通常没有 .env，靠环境变量

settings = Settings()
\`\`\`

### 5.3 Docker Compose 里集中管理（下章详讲）

\`\`\`yaml
# docker-compose.yml 片段
services:
  api:
    image: myapi:v1
    environment:
      - APP_ENV=production
      - DATABASE_URL=mysql+pymysql://appuser:App@123@db:3306/appdb
    env_file:
      - .env.production
\`\`\`

> 永远不要把密钥硬编码进镜像或 Dockerfile。用环境变量、Docker secrets 或外部密钥管理（Vault）。

---

## 六、HEALTHCHECK 健康检查

HEALTHCHECK 让 Docker 定期检查容器内应用是否健康，不健康可自动重启或被编排系统摘除。

### 6.1 在 Dockerfile 里写 HEALTHCHECK

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1
\`\`\

参数解释：

\`\`\`text
--interval=30s     每 30 秒检查一次
--timeout=5s       单次检查超时 5 秒算失败
--start-period=10s 启动后 10 秒内失败不计入 retries（给应用预热）
--retries=3        连续 3 次失败才标 unhealthy
\`\`\`

### 6.2 应用提供健康检查端点

\`\`\`python
# app/main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

### 6.3 查看健康状态

\`\`\`bash
docker ps
# STATUS 列会显示 (healthy) / (unhealthy) / (health: starting)

docker inspect --format '{{.State.Health.Status}}' api
# healthy

# 看最近 5 次检查结果
docker inspect --format '{{json .State.Health.Log}}' api | python3 -m json.tool
\`\`\`

### 6.4 用 python 而非 curl（避免装 curl）

\`\`\`dockerfile
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
\`\`\`

> 注意：HEALTHCHECK 在 Dockerfile 里只能定义一次。Compose 里可用 healthcheck 覆盖。

---

## 七、镜像大小优化

### 7.1 选对基础镜像

\`\`\`text
镜像                       大小     特点
python:3.12               ~1GB    完整 Debian，最大，构建用
python:3.12-slim          ~130MB  精简 Debian，运行首选
python:3.12-alpine        ~50MB   Alpine + musl，可能遇兼容问题
gcr.io/distroless/python3 ~50MB   无 shell、无包管理，最安全
scratch                   0       空，需自带运行时，适合静态二进制
\`\`\`

### 7.2 slim 镜像实战

\`\`\`dockerfile
FROM python:3.12-slim
# slim 没有 gcc，需要编译的包装不了 → 多阶段在 builder 装好 wheel
\`\`\`

### 7.3 alpine 的坑

\`\`\`text
alpine 用 musl libc 而非 glibc，常见问题：
- 很多 Python 包没有 alpine 的预编译 wheel，要现编译（慢）
- cryptography、numpy、pandas 在 alpine 上经常编译失败或耗时巨长
- 镜像小了，构建时间可能翻倍

结论：Python 应用不推荐 alpine，用 slim 更稳
\`\`\`

### 7.4 distroless（最安全）

\`\`\`dockerfile
# 阶段 1：正常 slim 装
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --target=/deps -r requirements.txt
COPY . .

# 阶段 2：distroless
FROM gcr.io/distroless/python3-debian12
WORKDIR /app
COPY --from=builder /deps /deps
COPY --from=builder /app /app
ENV PYTHONPATH=/deps
CMD ["-m", "app.main"]
\`\`\

\`\`\`text
distroless 优点：
- 无 shell、无包管理器，攻击面极小
- 无 root 可登录
- 体积小

缺点：
- 没法 docker exec bash 调试（没 shell），只能 docker exec 用现成二进制
- 排错略麻烦
\`\`\`

### 7.5 通用瘦身手段

\`\`\`dockerfile
# 1. 清理缓存（同一 RUN 内）
RUN pip install --no-cache-dir -r requirements.txt
RUN apt ... && rm -rf /var/lib/apt/lists/*

# 2. 合并 RUN
RUN apt update && apt install -y x && rm -rf /var/lib/apt/lists/*

# 3. 不装 dev 依赖
RUN pip install --no-deps -r requirements.txt  # 慎用，要自己保证依赖完整

# 4. 用 .dockerignore 排除测试/文档/虚拟环境

# 5. 多阶段构建

# 6. 用 dive 工具分析每层体积
dive myapp:v1
\`\`\`

---

## 八、完整 FastAPI 容器化示例

把前面所有要点合成一个生产级示例。

### 8.1 项目结构

\`\`\`text
myapi/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── config.py
├── requirements.txt
├── .dockerignore
├── Dockerfile
└── entrypoint.sh
\`\`\`

### 8.2 app/main.py

\`\`\`python
from fastapi import FastAPI
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    app_name: str = "MyAPI"
    log_level: str = "info"
    database_url: str = "sqlite:///./test.db"

    class Config:
        env_file = ".env"

settings = Settings()
app = FastAPI(title=settings.app_name)

@app.get("/")
def root():
    return {"app": settings.app_name, "env": os.environ.get("APP_ENV", "unknown")}

@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

### 8.3 requirements.txt

\`\`\`text
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic-settings==2.1.0
gunicorn==21.2.0
\`\`\`

### 8.4 entrypoint.sh

\`\`\`bash
#!/bin/sh
# 根据 CPU 动态算 worker 数
WORKERS=$((2 * $(nproc) + 1))
echo "Starting gunicorn with $WORKERS workers..."

exec gunicorn app.main:app \\
  -w "$WORKERS" \\
  -k uvicorn.workers.UvicornWorker \\
  -b 0.0.0.0:8000 \\
  --access-logfile - \\
  --error-logfile - \\
  --graceful-timeout 10 \\
  --timeout 30
\`\`\`

### 8.5 Dockerfile（生产级）

\`\`\`dockerfile
# syntax=docker/dockerfile:1
# ===== 阶段 1：构建 wheel =====
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 装编译依赖（fastapi/uvicorn 多为纯 Python，此处仅为模板）
RUN apt update && apt install -y --no-install-recommends gcc \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ===== 阶段 2：运行 =====
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    APP_ENV=production

WORKDIR /app

# 创建非 root 用户
RUN groupadd -r app && useradd -r -g app -d /app appuser

# 拷 wheel 并离线安装
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \\
    && rm -rf /wheels

# 拷代码与入口脚本
COPY --chown=appuser:app . .
RUN chmod +x /app/entrypoint.sh

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
\`\`\`

### 8.6 .dockerignore

\`\`\`text
.git
__pycache__/
*.pyc
.venv/
venv/
.env
.env.*
*.md
tests/
.pytest_cache/
Dockerfile
docker-compose*.yml
\`\`\`

### 8.7 构建运行验证

\`\`\`bash
# 构建
docker build -t myapi:1.0.0 .

# 运行
docker run -d \\
  --name api \\
  -p 8000:8000 \\
  -e APP_ENV=production \\
  -e LOG_LEVEL=info \\
  --restart=unless-stopped \\
  myapi:1.0.0

# 看健康状态
docker ps
# STATUS: Up 30 seconds (healthy)

# 测试
curl http://localhost:8000/
# {"app":"MyAPI","env":"production"}
curl http://localhost:8000/health
# {"status":"ok"}

# 看日志（gunicorn 输出到 stdout）
docker logs -f api

# 看镜像大小
docker images myapi
# REPOSITORY   TAG       SIZE
# myapi        1.0.0     235MB
\`\`\`

### 8.8 验证非 root 运行

\`\`\`bash
docker exec api ps -o user,pid,cmd | head
# USER   PID  CMD
# appuser 1  python /usr/local/bin/gunicorn ...
\`\`\`

---

## 九、本章小结

\`\`\`text
核心要点回顾：
1. 先 COPY requirements.txt 再装依赖，利用层缓存
2. poetry 用 export 导出 requirements + 多阶段，最终镜像不带 poetry
3. 多阶段构建：builder 编译 wheel，运行期只装 wheel
4. 生产用 gunicorn + uvicorn worker，worker 数按 CPU 算
5. 用 exec 形式 CMD/ENTRYPOINT，让应用成 PID1 正确收信号
6. 密钥走环境变量/secret，绝不进镜像
7. HEALTHCHECK 配 /health 端点，让 Docker 知道应用是否健康
8. 基础镜像优先 slim；Python 不推荐 alpine；要极致安全用 distroless
9. 非 root 运行 + .dockerignore + 多阶段 = 生产级 Python 镜像
\`\`\`

### 9.1 常见问题

\`\`\`text
Q: pip install 在 alpine 上卡在编译？
A: alpine 缺 gcc 和头文件，要 apk add gcc musl-dev libffi-dev openssl-dev，或换 slim。

Q: 容器 stop 很慢/丢请求？
A: 应用没在超时内退出。用 exec 形式让应用成 PID1，设 --graceful-timeout，docker stop -t 加大。

Q: gunicorn 看到的 CPU 数不对？
A: 容器默认看宿主机 CPU。用 --cpus 限制 CPU，并用 $(nproc) 或并发参数适配；K8s 里用 GOMAXPROCS 类似思路。

Q: HEALTHCHECK 一直 unhealthy？
A: 检查端点是否能通（docker exec 进去 curl）；start-period 给够；命令返回码要对。

Q: 改代码后镜像没更新？
A: docker build 不加 --no-cache 会用缓存。COPY 层变了会重建，确认 COPY 源变了。
\`\`\`

### 9.2 下一章预告

最后一章讲 Docker 最佳实践：镜像安全（非 root、最小权限）、镜像大小优化策略、构建缓存利用、容器日志与监控、安全扫描、生产注意事项及常见问题排查。
`,
  },
  {
    id: "deploy-docker-best",
    icon: "💡",
    title: "Docker 最佳实践",
    group: "Docker 容器化",
    content: `# Docker 最佳实践

本章是 Docker 篇的收尾，把前面散落的经验汇总成可落地的"生产清单"。按安全、大小、缓存、日志、监控、扫描、生产、排错八个维度展开。

## 一、镜像安全

容器隔离弱于虚拟机，一旦容器被攻破，攻击者可能逃逸到宿主机。安全是生产镜像的第一要务。

### 1.1 非 root 运行

\`\`\`dockerfile
# 创建专用用户并切换
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin appuser
USER appuser
\`\`\`

\`\`\`bash
# 验证容器内不是 root
docker exec api id
# uid=1000(appuser) gid=1000(appuser)

# 如果容器以 root 跑，攻击者拿到 root 后更容易逃逸
docker run --user 1000:1000 myapp   # 运行时也可强制指定
\`\`\`

### 1.2 最小权限

\`\`\`text
- 用最小基础镜像（slim/distroless），少装东西=少漏洞
- 不装 sudo、curl、wget、vim 等调试工具到生产镜像（调试用临时镜像）
- 端口只暴露必要的
- 文件权限收严：配置文件 644、密钥 600、可执行 755
\`\`\`

\`\`\`dockerfile
COPY --chown=appuser:app --chmod=644 config.yaml /app/
COPY --chown=appuser:app --chmod=600 app.key /app/
\`\`\`

### 1.3 不把密钥写进镜像

镜像一旦构建，里面的内容就不可改变。如果把数据库密码、API Key、SSH 私钥用 ENV 或 COPY 写进镜像，等于把它们永久公开——任何拿到镜像的人都能用 \`docker history\` 或 \`docker inspect\` 看到明文。

\`\`\`dockerfile
# ❌ 错误：密钥进镜像，docker history 一查全暴露
ENV DB_PASSWORD="p@ssw0rd123"
ENV API_KEY="sk-xxxxxxxxxxxxxxxxxxxx"
COPY deploy.pem /app/   # 私钥进镜像，灾难

# ✅ 正确：运行时通过环境变量、secret、挂载文件注入
# Dockerfile 里不写任何密钥，启动容器时才注入
\`\`\`

\`\`\`bash
# 验证：docker history 能看到每一层构建命令，包括 ENV
docker history myapp:latest
# IMAGE          CREATED        CREATED BY                                    SIZE
# a1b2c3d4e5f6   2 minutes ago  ENV DB_PASSWORD=p@ssw0rd123                    0B
# b2c3d4e5f6a1   2 minutes ago  /bin/sh -c pip install -r requirements.txt   120MB
# ...

# docker inspect 也能看到环境变量明文
docker inspect myapp:latest | grep -A 5 Env
# "Env": [
#     "DB_PASSWORD=p@ssw0rd123",
#     "API_KEY=sk-xxxxxxxxxxxx"
# ]

# 运行时注入密钥的正确方式
docker run -e DB_PASSWORD=$DB_PASSWORD -e API_KEY=$API_KEY myapp
# 或者用 --env-file 引用本地 .env 文件（不进镜像，不进 git）
docker run --env-file ./secrets.env myapp

# Docker Swarm / Kubernetes 的 Secret 机制更安全（加密存储，按需挂载）
\`\`\`

> 核心原则：**镜像可以公开，密钥绝不能进镜像。** 镜像里只放代码和依赖，密钥通过运行时注入。

### 1.4 镜像签名与可信

生产镜像建议开启内容信任（Content Trust），确保拉取的镜像没被篡改。

\`\`\`bash
# 开启 Docker Content Trust（环境变量）
export DOCKER_CONTENT_TRUST=1

# 之后 pull / push 都会校验签名
docker pull myregistry.com/myapp:v1.2.3
# 如果镜像没签名，会被拒绝拉取

# 用 cosign（Sigstore）做镜像签名，是云原生时代的新标准
cosign sign --key cosign.key myregistry.com/myapp:v1.2.3
cosign verify --key cosign.pub myregistry.com/myapp:v1.2.3
\`\`\`

---

## 二、镜像大小优化策略

镜像越大，拉取越慢、存储越费、攻击面越大。优化镜像大小是生产化的必经之路。下面从最简单的 \`docker images\` 查看大小开始，逐级深入。

### 2.1 查看镜像大小

\`\`\`bash
# 列出本地镜像及大小
docker images
# REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
# python        3.12      b1a2c3d4e5f6   2 weeks ago    995MB
# python        3.12-slim c2b3d4e5f6a7   2 weeks ago    130MB
# nginx         latest    d3c4e5f6a7b8   3 weeks ago    192MB
# myapp         v1        e4d5f6a7b8c9   1 minute ago   1.2GB   ← 太大了！

# 查看 myapp 每一层的大小，找出"胖"在哪
docker history myapp:v1 --no-trunc
# IMAGE          SIZE      CREATED BY
# e4d5f6a7b8c9   0B        /bin/sh -c #(nop) CMD ["python" "app.py"]
# ...
# 9a8b7c6d5e4f   850MB     /bin/sh -c apt-get update && apt-get install -y gcc  ← 这层最大
# 8b7c6d5e4f3a   120MB     /bin/sh -c pip install numpy pandas scikit-learn
\`\`\`

\`docker history\` 是定位镜像膨胀的第一工具。哪一层大，就去优化哪一层。

### 2.2 策略一：选小基础镜像

基础镜像的选择直接决定了镜像下限。以 Python 3.12 为例，常见有四个梯度：

\`\`\`text
镜像                  大小     特点                           适用场景
─────────────────────────────────────────────────────────────────────
python:3.12          ~995MB   完整 Debian + 全套构建工具       开发/调试
python:3.12-slim     ~130MB   Debian 精简版，无 gcc           生产首选
python:3.12-alpine   ~50MB    Alpine Linux，musl libc         追求极致小
python:3.12-bookworm ~995MB   同 full，明确指定 Debian 版本    需要完整环境
\`\`\`

\`\`\`dockerfile
# ❌ 不要用：1GB 的完整镜像
FROM python:3.12

# ✅ 生产首选：slim 镜像，只有 130MB
FROM python:3.12-slim

# ✅ 极致优化：alpine，但要注意 musl libc 兼容性问题
FROM python:3.12-alpine
# 注意：alpine 装含 C 扩展的包（numpy/pandas）需额外装 gcc，可能更慢
\`\`\`

> Alpine 陷阱：Alpine 用 musl libc 而非 glibc，很多 Python 包（numpy、pandas、cryptography）没有预编译 wheel，需要现场编译，构建慢且容易出错。除非镜像大小是硬指标，否则生产用 slim 更稳。

### 2.3 策略二：多阶段构建

多阶段构建（Multi-stage Build）是减小镜像大小最有效的手段。核心思想：**用一个大镜像编译，再把编译产物拷到一个干净的小镜像里运行。**

\`\`\`dockerfile
# ===== 第一阶段：builder，装满构建工具，编译依赖 =====
FROM python:3.12 AS builder

WORKDIR /app

# 装编译所需的系统库（这层很大，但只存在于 builder 阶段）
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc libffi-dev && rm -rf /var/lib/apt/lists/*

# 把依赖装到指定目录，方便后面拷贝
RUN pip install --user --no-cache-dir -r requirements.txt

# ===== 第二阶段：runtime，干净的小镜像，只拷产物 =====
FROM python:3.12-slim

WORKDIR /app

# 从 builder 阶段拷贝 pip 装好的包（不含 gcc 等编译工具）
COPY --from=builder /root/.local /root/.local
COPY . /app/

# 确保 Python 能找到 --user 装的包
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/root/.local/lib/python3.12/site-packages

CMD ["python", "app.py"]
\`\`\`

\`\`\`bash
# 对比：单阶段 vs 多阶段
# 单阶段（带 gcc）：1.2GB
docker build -t myapp:fat -f Dockerfile.single .
# 多阶段（只拷产物）：150MB
docker build -t myapp:slim -f Dockerfile.multi .

docker images | grep myapp
# myapp   fat    e4d5f6a7b8c9   1 minute ago   1.2GB
# myapp   slim   f5e6a7b8c9d0   1 minute ago   150MB
\`\`\`

多阶段构建把"构建环境"和"运行环境"分离，最终镜像里没有 gcc、没有源码、没有中间产物，又小又安全。

### 2.4 策略三：合并 RUN 指令

每条 RUN 都会产生一层（layer）。层越多镜像越大，尤其是 apt 装包这种如果不清理缓存会留一堆垃圾。

\`\`\`dockerfile
# ❌ 多条 RUN，每条一层，apt 缓存没清理
RUN apt-get update
RUN apt-get install -y libxml2-dev
RUN pip install -r requirements.txt
RUN rm -rf /var/lib/apt/lists/*    # 这层只删缓存，但上一层缓存还在！

# ✅ 合并成一条 RUN，在同层里装完就清缓存
RUN apt-get update && \\
    apt-get install -y --no-install-recommends libxml2-dev && \\
    pip install --no-cache-dir -r requirements.txt && \\
    rm -rf /var/lib/apt/lists/*
\`\`\`

\`\`\`bash
# 验证层数
docker history myapp:v1 | wc -l
# 单条 RUN 合并后，层数明显减少
\`\`\`

### 2.5 策略四：.dockerignore

别把整个项目目录拷进镜像。\`.dockerignore\` 能避免把 \`venv/\`、\`.git/\`、测试数据、IDE 配置打进镜像。

\`\`\`bash
# .dockerignore 文件内容
venv/
.venv/
__pycache__/
*.pyc
.git/
.gitignore
.vscode/
.idea/
*.md
tests/
.env
*.log
node_modules/
.DS_Store
\`\`\`

\`\`\`bash
# 没有 .dockerignore，COPY . /app/ 会把 venv（几百 MB）也拷进去
# 有 .dockerignore，只拷代码，镜像小很多

# 查看 .dockerignore 生效后 COPY 的内容
docker build -t myapp . --no-cache --progress=plain 2>&1 | grep "COPY"
# #12 DONE 0.1s   ← 只拷了几 MB 代码
\`\`\`

### 2.6 策略五：用 distroless

Google 维护的 distroless 镜像比 slim 更激进：只有运行时，没有 shell、没有包管理器，连 \`ls\` 都没有。攻击者即使攻破容器也无法执行命令。

\`\`\`dockerfile
# 用 distroless 作为 runtime
FROM python:3.12-slim AS builder
RUN pip install --user --no-cache-dir -r requirements.txt

FROM gcr.io/distroless/python3-debian12
WORKDIR /app
COPY --from=builder /root/.local /home/nonroot/.local
COPY . /app/
ENV PATH=/home/nonroot/.local/bin:$PATH
USER nonroot
CMD ["app.py"]
\`\`\`

\`\`\`bash
# distroless 没有 shell，无法 docker exec sh 进去
docker exec -it myapp sh
# OCI runtime exec failed: exec failed: unable to start container process:
# exec: "sh": executable file not found in $PATH

# 这正是 distroless 的安全特性：攻击者也没法 exec
\`\`\`

---

## 三、构建缓存利用

Docker 构建是分层的，每一层都对应一条 Dockerfile 指令。**如果某一层没变，Docker 会复用缓存，跳过执行**；一旦某层失效，它和后面所有层都会重新构建。理解缓存机制，能把构建时间从几分钟压到几秒。

### 3.1 缓存命中原理

\`\`\`text
Dockerfile 缓存判定：
- COPY：检查文件内容哈希，变了就失效
- RUN：检查命令字符串，变了就失效
- 一旦某层失效，后面所有层全部失效（重新执行）
\`\`\`

\`\`\`bash
# 第一次构建，所有层都执行
docker build -t myapp .
# Step 3/8 : COPY requirements.txt .
#  ---> Using cache        ← 这层有缓存
# Step 4/8 : RUN pip install -r requirements.txt
#  ---> Using cache        ← 这层也有
# Step 5/8 : COPY . /app/
#  ---> 8a7b6c5d4e3f       ← 代码变了，这层重新构建
# Step 6/8 : CMD ["python", "app.py"]
#  ---> 9b8a7c6d5e4f       ← 后面也跟着重建
\`\`\`

### 3.2 黄金法则：先拷 requirements.txt，再拷代码

最常见的缓存失误是把 \`COPY . /app/\` 写在 \`pip install\` 前面。这样只要改一行代码，pip 就要重装所有依赖（几分钟）。

\`\`\`dockerfile
# ❌ 错误：代码一改，pip install 就要重跑（每次改代码等 5 分钟）
FROM python:3.12-slim
WORKDIR /app
COPY . /app/                              # 代码常变
RUN pip install -r requirements.txt       # 跟着重跑，巨慢

# ✅ 正确：先拷 requirements.txt（很少变），再拷代码
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .                   # 先拷依赖清单（不变）
RUN pip install --no-cache-dir -r requirements.txt  # 依赖装一次，永久缓存
COPY . /app/                              # 后拷代码（常变，但只影响这层）
CMD ["python", "app.py"]
\`\`\`

\`\`\`bash
# 验证：改一行代码再 build
vim app.py  # 加个空格
docker build -t myapp .
# Step 4/8 : RUN pip install ...
#  ---> Using cache        ← pip 装的包被缓存，秒过！
# Step 5/8 : COPY . /app/
#  ---> a1b2c3d4          ← 只有这层重建，几秒
\`\`\`

> 核心心法：**把"变化频率低的"放前面，"变化频率高的"放后面。** 依赖清单 → 依赖安装 → 拷贝代码，这个顺序能让缓存命中率最大化。

### 3.3 用 --no-cache 强制重建

有时缓存反而坏事：比如 \`apt-get update\` 的缓存过期了，但 Docker 看命令字符串没变就用旧缓存，导致装不到新版包。这时用 \`--no-cache\` 强制全部重建。

\`\`\`bash
# 完全禁用缓存，每一层都重新执行
docker build --no-cache -t myapp .

# 只重建从某层开始的部分（用 BuildKit 的 --build-arg 触发）
docker build --build-arg CACHEBUST=$(date +%s) -t myapp .
# 在 Dockerfile 里：ARG CACHEBUST
# COPY requirements.txt .   # CACHEBUST 变了，这层失效，后面全重建
\`\`\`

### 3.4 BuildKit：更智能的缓存

新版 Docker 默认用 BuildKit 构建引擎，支持并行构建、更智能的缓存，还能把缓存导出到远程仓库。

\`\`\`bash
# 启用 BuildKit（Docker 23+ 默认开启）
export DOCKER_BUILDKIT=1

# 多阶段构建时，BuildKit 会并行构建不依赖的阶段
docker build -t myapp .
# => [builder 2/3] RUN apt-get install ...
# => [builder 3/3] RUN pip install ...    ← 并行
# => [stage-1 1/2] FROM python:3.12-slim

# 把缓存推到远程仓库，多机器共享
docker build --cache-from=type=registry,ref=myregistry.com/myapp:cache \\
             --cache-to=type=registry,ref=myregistry.com/myapp:cache,mode=max \\
             -t myapp .
\`\`\`

---

## 四、容器日志管理

容器里的程序往 stdout/stderr 输出日志，Docker 自动收集并存储。理解这套机制，才能正确排错和做日志聚合。

### 4.1 查看容器日志

\`\`\`bash
# 查看全部日志
docker logs myapp

# 实时跟踪日志（类似 tail -f）
docker logs -f myapp
# 等待新日志输出，Ctrl+C 退出

# 只看最后 100 行
docker logs --tail 100 myapp

# 显示时间戳
docker logs -t myapp
# 2026-07-03T10:00:00.123456789Z INFO: Application started

# 只看最近 10 分钟的日志
docker logs --since 10m myapp

# 只看某个时间之后的
docker logs --since "2026-07-03T09:00:00" myapp

# 组合：实时看最后 50 行
docker logs -f --tail 50 myapp
\`\`\`

### 4.2 日志驱动

Docker 通过"日志驱动"决定日志怎么存。默认是 \`json-file\`，日志写到容器目录的 JSON 文件里。

\`\`\`bash
# 查看当前日志驱动
docker info | grep "Logging Driver"
#  Logging Driver: json-file

# 配置日志轮转，防止日志撑爆磁盘（生产必做）
# 编辑 /etc/docker/daemon.json
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",      # 单个日志文件最大 10MB
    "max-file": "3"         # 最多保留 3 个文件
  }
}
EOF

sudo systemctl restart docker
# 之后每个容器日志最多 30MB（10m x 3），超出自动轮转
\`\`\`

\`\`\`bash
# 单个容器覆盖日志配置
docker run \\
  --log-driver json-file \\
  --log-opt max-size=5m \\
  --log-opt max-file=2 \\
  myapp

# 用 journald 驱动（集成 systemd 日志）
docker run --log-driver journald myapp
journalctl CONTAINER_NAME=myapp

# 用 none 驱动，丢弃所有日志（不推荐，排错时无日志可看）
docker run --log-driver none myapp
\`\`\`

### 4.3 日志聚合：Fluentd / Loki

生产环境一台机器几十个容器，逐个 docker logs 不现实。通常把日志统一收集到日志系统。

\`\`\`text
容器 stdout → Docker 日志驱动 → Fluentd/Filebeat → Elasticsearch/Loki → Kibana/Grafana
\`\`\`

\`\`\`bash
# 用 Fluentd 驱动直接发给日志收集器
docker run \\
  --log-driver fluentd \\
  --log-opt fluentd-address=localhost:24224 \\
  --log-opt tag="myapp.\{\{.Name\}\}" \\
  myapp
# tag 模板变量：.Name 容器名、.ID 容器ID、.ImageName 镜像名
\`\`\`

> 容器日志最佳实践：**应用只往 stdout/stderr 写日志，别写文件**。写文件的日志在容器删除后就丢了，而 stdout 的日志由 Docker 统一管理，能轮转、能收集、能查询。

---

## 五、容器监控

部署上线后，必须实时掌握容器的 CPU、内存、网络、磁盘状态。Docker 自带 \`docker stats\` 做基础监控，生产环境用 cAdvisor + Prometheus + Grafana 做可视化。

### 5.1 docker stats：实时资源监控

\`\`\`bash
# 实时监控所有运行中容器的资源占用
docker stats
# CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %    NET I/O          BLOCK I/O   PIDS
# 3f9a2b8c7d6e   api       2.34%     256.5MiB / 7.66GiB    3.27%    1.2MB/850kB      0B/0B       45
# a1b2c3d4e5f6   worker    0.50%     128.2MiB / 7.66GiB    1.64%    500kB/200kB      0B/0B       12
# b2c3d4e5f6a1   nginx     0.01%     20.5MiB / 7.66GiB     0.26%    5MB/8MB          0B/0B       3

# 只看指定容器
docker stats api worker

# 只输出一次（不持续刷新），适合脚本采集
docker stats --no-stream
docker stats --no-stream --format "table \{\{.Name\}\}\t\{\{.CPUPerc\}\}\t\{\{.MemUsage\}\}}"

# 自定义输出格式（JSON）
docker stats --no-stream --format "{{json .}}" api
# {"name":"api","cpupercent":"2.34%","memusage":"256.5MiB / 7.66GiB",...}
\`\`\`

\`\`\`bash
# 设置容器内存上限，防止单个容器吃光内存（OOM）
docker run -d --name api --memory="512m" --memory-swap="1g" --cpus="1.5" myapp

# --memory: 容器最多用 512MB 内存
# --memory-swap: 内存+交换区最多 1GB
# --cpus: 最多用 1.5 个 CPU 核

# 验证限制生效
docker inspect api | grep -i memory
# "Memory": 536870912,         # 512MB
# "MemorySwap": 1073741824,    # 1GB
\`\`\`

### 5.2 容器内进程监控

\`\`\`bash
# 查看容器内运行的进程
docker top api
# UID    PID    PPID    C   STIME   TTY   TIME       CMD
# root   1234   1230    2   10:00   ?     00:00:05   python app.py
# root   1300   1234    0   10:00   ?     00:00:00   /bin/sh -c celery worker

# 查看容器资源使用详情（更底层的信息）
docker inspect api | grep -A 20 "State"
# "Status": "running",
# "Pid": 1234,
# "OOMKilled": false,     ← 是否被 OOM 杀过
\`\`\`

### 5.3 cAdvisor：可视化监控

cAdvisor（Container Advisor）是 Google 开源的容器监控工具，提供 Web UI 实时查看每个容器的资源曲线。

\`\`\`bash
# 一行命令启动 cAdvisor（监控本机所有容器）
docker run -d \\
  --name cadvisor \\
  --restart=unless-stopped \\
  -p 8080:8080 \\
  -v /:/rootfs:ro \\
  -v /var/run:/var/run:ro \\
  -v /sys:/sys:ro \\
  -v /var/lib/docker/:/var/lib/docker:ro \\
  gcr.io/cadvisor/cadvisor:v0.47.0

# 浏览器访问 http://localhost:8080
# - 首页列出所有容器，点击进入看 CPU/内存/网络/磁盘曲线图
# - 还能导出 Prometheus 指标：http://localhost:8080/metrics
\`\`\`

### 5.4 Prometheus + Grafana 监控栈

\`\`\`text
完整监控架构：
容器 → cAdvisor(采集) → Prometheus(存储+查询) → Grafana(可视化)
       ↑                   ↑
       node-exporter       alertmanager(告警)
\`\`\`

\`\`\`bash
# Prometheus 配置文件 prometheus.yml
cat > prometheus.yml <<'EOF'
scrape_configs:
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# 通常用 Docker Compose 一键起整套监控栈（下章详讲）
\`\`\`

> 监控核心指标：CPU 使用率（\`docker stats\` 的 CPU %）、内存（关注 OOMKilled）、网络 I/O（带宽是否打满）、磁盘 I/O（是否成为瓶颈）。

---

## 六、Docker 安全扫描

镜像里的依赖可能含已知漏洞（CVE）。上线前用扫描工具检测，能在漏洞被利用前修复。

### 6.1 docker scout（Docker 内置）

\`\`\`bash
# Docker Desktop 自带 scout，扫描本地镜像漏洞
docker scout cves myapp:latest
# Analyzed image myapp:latest
# Total vulnerabilities: 23
#   Critical: 2    High: 8    Medium: 10    Low: 3
#
# ✗ CRITICAL CVE-2024-12345
#   pip package: cryptography==41.0.0
#   Fixed in: 42.0.0
#   More info: https://nvd.nist.gov/vuln/detail/CVE-2024-12345

# 查看修复建议
docker scout recommendations myapp:latest
# Update cryptography to 42.0.0 to fix 1 critical vulnerability
\`\`\`

### 6.2 Trivy：开源扫描利器

\`\`\`bash
# 安装 Trivy
brew install trivy          # macOS
# 或 sudo apt install trivy  # Ubuntu

# 扫描镜像漏洞
trivy image myapp:latest
# myapp:latest (debian 12.5)
# =========================
# Total: 15 (HIGH: 5, CRITICAL: 2)
#
# ┌─────────────────┬────────────────┬──────────┬───────────────────┐
# │    Library      │ Vulnerability  │ Severity │ Installed Version │
# ├─────────────────┼────────────────┼──────────┼───────────────────┤
# │ openssl         │ CVE-2024-0727  │ CRITICAL │ 3.0.9-1           │
# │ cryptography    │ CVE-2024-12345 │ CRITICAL │ 41.0.0            │
# └─────────────────┴────────────────┴──────────┴───────────────────┘

# 扫描并只报 CRITICAL 和 HIGH 级别
trivy image --severity HIGH,CRITICAL myapp:latest

# 扫描 Dockerfile 本身的配置问题
trivy config Dockerfile
# Dockerfile - Dockerfile Security Check
# Tests: 23, Failures: 2
# FAIL: Specify a non-root USER in the Dockerfile
# FAIL: Use COPY instead of ADD

# 输出 JSON 格式，方便集成到 CI
trivy image --format json -o report.json myapp:latest
\`\`\`

### 6.3 Grype：另一种扫描器

\`\`\`bash
# 安装 Grype
brew install grype

# 扫描镜像
grype myapp:latest
# NAME          INSTALLED  FIXED-IN   TYPE    VULNERABILITY   SEVERITY
# cryptography  41.0.0     42.0.0     python  CVE-2024-12345  Critical
# openssl       3.0.9-1    3.0.9-2    deb     CVE-2024-0727   High

# 只看严重漏洞
grype myapp:latest --fail-on high
# 如果有 HIGH 及以上漏洞，命令返回非零退出码，CI 自动失败
\`\`\`

> CI 集成建议：在构建流水线里加 \`trivy image --severity HIGH,CRITICAL --exit-code 1 myapp:$TAG\`，有严重漏洞就阻断部署。

---

## 七、生产环境注意事项

把容器跑进生产，比本地开发多了十几个坑。下面列出最关键的生产注意事项。

### 7.1 容器自动重启

\`\`\`bash
# 生产容器必须设置 restart 策略，挂了自动拉起
docker run -d --name api --restart=unless-stopped myapp

# 四种重启策略：
# no              默认，容器退出不重启
# on-failure      非零退出码才重启（可加重试次数：--restart=on-failure:5）
# always          总是重启（不管退出码，宿主机重启后也跟着起）
# unless-stopped  同 always，但手动 stop 的不会重启（生产推荐）
\`\`\`

\`\`\`bash
# 验证重启策略
docker inspect api | grep RestartPolicy
# "RestartPolicy": {"Name": "unless-stopped", "MaximumRetryCount": 0}

# 查看重启次数
docker inspect api | grep RestartCount
# "RestartCount": 3     ← 已经重启过 3 次
\`\`\`

### 7.2 健康检查

\`\`\`bash
# Dockerfile 里定义健康检查
# HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
#   CMD curl -f http://localhost:8000/health || exit 1

# 运行时查看健康状态
docker inspect api | grep -A 5 Health
# "Status": "healthy",
# "FailingStreak": 0,
# "Log": [{"Start": "...", "ExitCode": 0, "Output": ""}]

# 容器不健康时，可在编排工具里触发重启（Compose 用 healthcheck 条件）
\`\`\`

### 7.3 资源限制

\`\`\`bash
# 生产容器必须限制 CPU 和内存，防止单容器拖垮宿主机
docker run -d \\
  --name api \\
  --cpus="2" \\
  --memory="1g" \\
  --memory-swap="1g" \\
  --pids-limit="200" \\
  --restart=unless-stopped \\
  myapp

# --memory-swap 设成和 --memory 一样，等于禁用 swap（推荐，避免写磁盘拖慢）
# --pids-limit 限制容器内进程数，防 fork 炸弹
\`\`\`

### 7.4 只读根文件系统

\`\`\`bash
# --read-only 让容器根文件系统只读，只能写挂载的 volume
# 防止攻击者往容器里写恶意文件
docker run -d --name api --read-only \\
  --tmpfs /tmp:rw,size=10m \\
  -v myapp-data:/app/data \\
  myapp

# --tmpfs 给 /tmp 一个内存文件系统（应用可能需要写临时文件）
# 数据只写到挂载的 volume
\`\`\`

### 7.5 时区与时间

\`\`\`bash
# 容器默认 UTC 时区，日志时间可能和本地差 8 小时
docker run --rm alpine date
# Thu Jul 3 02:00:00 UTC 2026   ← UTC，比北京时间少 8 小时

# 设置时区为东八区
docker run --rm -e TZ=Asia/Shanghai -v /etc/localtime:/etc/localtime:ro alpine date
# Thu Jul 3 10:00:00 CST 2026    ← 北京时间
\`\`\`

---

## 八、常见问题排查

### 8.1 容器启动后立即退出

\`\`\`bash
# 现象：docker run 后容器 Exited (0)
docker ps -a
# STATUS: Exited (0) 5 seconds ago

# 原因：容器主进程（CMD/ENTRYPOINT）是前台命令，执行完就退出
# 排查：看退出码和日志
docker logs myapp
docker inspect myapp | grep ExitCode

# 解决：让主进程常驻
# ❌ 错误：nginx 默认 daemon 模式，主进程 fork 后退出
CMD ["nginx"]
# ✅ 正确：前台运行
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

### 8.2 端口冲突

\`\`\`bash
# 现象：docker run 报 "port is already allocated"
docker: Error response from daemon: Bind for 0.0.0.0:8080 failed:
port is already allocated.

# 排查：谁占了 8080
lsof -i :8080        # macOS/Linux
# COMMAND   PID  USER   FD
# python   1234  user   4u  IPv4 ... TCP *:8080

# 解决：杀掉占用进程，或换个端口
docker run -p 8081:80 nginx    # 改用 8081
\`\`\`

### 8.3 容器无法访问外网

\`\`\`bash
# 排查：进容器测网络
docker exec -it myapp ping 8.8.8.8

# 能 ping IP 但不能解析域名 → DNS 问题
docker exec -it myapp cat /etc/resolv.conf
# 解决：指定 DNS
docker run --dns 8.8.8.8 myapp

# 都 ping 不通 → 网络模式问题
# 检查 iptables / 防火墙是否放行 Docker 链
sudo iptables -L DOCKER -n
\`\`\`

### 8.4 镜像构建失败：layer does not exist

\`\`\`bash
# 现象：build 报 "failed to solve: layer does not exist"
# 原因：构建缓存损坏

# 解决：清理构建缓存
docker builder prune -f

# 还不行，删除所有悬挂镜像和缓存
docker system prune -a -f
# 注意：-a 会删除所有未被使用的镜像，慎用
\`\`\`

### 8.5 磁盘被 Docker 吃满

\`\`\`bash
# 查看 Docker 磁盘占用
docker system df
# TYPE            TOTAL   ACTIVE  SIZE      RECLAIMABLE
# Images          25      5       15.6GB    12.3GB (78%)   ← 大量可回收
# Containers      8       3       500MB     300MB
# Local Volumes   4       2       2.1GB     1.5GB

# 清理：停止的容器、悬挂镜像、未使用的网络、构建缓存
docker system prune -f

# 连未使用的镜像也删（小心，被引用的不会删）
docker system prune -a -f

# 清理未使用的 volume（数据会丢，确认无用再做）
docker volume prune -f
\`\`\`

### 8.6 容器内 OOMKilled

\`\`\`bash
# 现象：容器莫名退出，Exited (137)
docker inspect myapp | grep -i oom
# "OOMKilled": true     ← 被内核 OOM 杀手干掉

# 原因：容器内存超限
# 解决：调大 --memory，或优化应用内存使用（查内存泄漏）

# 查看容器退出前的内存峰值
docker inspect myapp | grep -A 3 "MemoryMax"
\`\`\`

---

## 九、本章小结

这一章把 Docker 生产化最核心的实践经验浓缩成八条清单：

\`\`\`text
┌─────────────────────────────────────────────────────────────────┐
│  Docker 生产检查清单                                              │
├─────────────────────────────────────────────────────────────────┤
│  ☑ 安全：非 root 运行、密钥不进镜像、最小基础镜像                    │
│  ☑ 大小：slim 基础镜像、多阶段构建、合并 RUN、.dockerignore         │
│  ☑ 缓存：requirements.txt 先于代码拷贝、变化频率从低到高排列         │
│  ☑ 日志：stdout 输出、配置日志轮转、统一收集                         │
│  ☑ 监控：docker stats 实时看、cAdvisor+Prometheus 可视化           │
│  ☑ 扫描：Trivy/Grype 扫漏洞、CI 阻断高危                            │
│  ☑ 生产：--restart 策略、资源限制、健康检查、只读文件系统            │
│  ☑ 排错：退出码看日志、端口冲突 lsof、磁盘满 prune、OOM 调内存       │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

记住三条最容易被忽视的：

1. **密钥绝不进镜像**——\`docker history\` 一查全暴露，用运行时环境变量注入。
2. **依赖清单先于代码拷贝**——能让 pip install 命中缓存，构建时间从分钟级降到秒级。
3. **生产容器必须设 --restart 和资源限制**——不然一个容器异常能把整台机器拖垮。

到此，Docker 容器化 7 章完结。下一章我们进入 Docker Compose，把多个容器编排起来，解决"一条命令起整套服务"的问题。
`
  }
];
