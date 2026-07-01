// =============================================================
// 操作系统实战教程 - 第 9 批章节（部署实战 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   os-systemd-deploy : systemd 部署服务
//   os-docker         : Docker 容器化
//   os-compose        : Docker Compose 多容器
//   os-logs           : 日志管理
//
// code 字段为 macOS bash 沙箱可运行脚本（无 root，10s 超时）。
// systemd/docker/compose 等沙箱未安装的工具用 echo + 注释模拟讲解。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：systemd 部署服务
  // ============================================================
  {
    id: "os-systemd-deploy",
    group: "部署实战",
    icon: "🚀",
    title: "systemd 部署服务",
    content: `# systemd 部署服务

## 概述

systemd 是现代 Linux 的初始化系统（PID 1），负责启动和管理系统服务。相比传统的 SysV init 脚本，systemd 提供了声明式配置、并行启动、依赖管理、自动重启等强大能力，已成为部署后台服务的标准方式。通过编写 unit 文件，可以用统一的方式管理 Node.js、Python、Java 等任何语言的服务进程。

unit 文件是 systemd 的配置单元，按类型分为 service（服务）、timer（定时器）、socket（套接字）等。部署应用最常用的是 .service 文件，放在 /etc/systemd/system/ 下，定义服务如何启动、运行、停止。掌握 unit 文件结构和 systemctl 命令，就能让应用像系统服务一样开机自启、崩溃自愈。

## 核心要点

- **[Unit] 段**：定义单元描述和依赖关系。Description 是人类可读名称，After/Before 指定启动顺序，Requires/Wants 指定强/弱依赖。
- **[Service] 段**：定义服务运行方式，是 unit 文件的核心。包含启动命令、用户、环境、重启策略等。
- **[Install] 段**：定义安装信息，WantedBy=multi-user.target 表示 enable 时注册到多用户目标，实现开机自启。
- **Type=simple**：默认类型，ExecStart 启动的进程就是服务主进程，适合前台运行的应用（Node/Python Flask）。
- **Type=forking**：服务会 fork 子进程并退出父进程，systemd 跟踪子进程，适合传统 daemon（如 nginx）。
- **Type=oneshot**：执行一次性任务就退出，用于初始化脚本，配合 RemainAfterExit=yes 表示任务完成后视为活跃。
- **ExecStart**：服务启动命令，必须是绝对路径。可用 ExecStartPre/ExecStartPost 做前后置操作。
- **Restart=on-failure**：进程异常退出时自动重启。always 任何退出都重启，on-failure 仅非 0 退出码重启。
- **Environment/EnvironmentFile**：Environment="KEY=value" 单个设置，EnvironmentFile 指定文件批量加载。
- **User=/WorkingDirectory=**：以指定用户运行、指定工作目录，避免 root 权限和路径混乱。

## 原理与机制

- **声明式配置**：unit 文件描述"服务应该是什么状态"，systemd 负责达到并维持该状态，比脚本式管理更可靠。
- **cgroup 隔离**：每个服务运行在自己的 cgroup 中，systemd 能精确追踪所有子进程，确保停止时彻底清理。
- **daemon-reload 的必要性**：修改 unit 文件后 systemd 不会自动重载配置，必须执行 systemctl daemon-reload 让其重新读取。
- **journal 日志统一收集**：服务 stdout/stderr 自动被 journald 捕获，无需自行配置日志文件，用 journalctl -u 服务名查看。

## 易错点与陷阱

- **改了 unit 文件不 daemon-reload**：配置不生效，systemd 仍用旧配置。每次修改后必须 daemon-reload 再 restart。
- **Type=simple 用于后台 daemon**：simple 期望前台运行，若命令本身 fork 到后台退出，systemd 认为服务已退出而误杀。
- **ExecStart 用 shell 语法**：systemd 不解析管道、通配符、变量，复杂命令用 sh -c 包裹或写成独立脚本。

## 实战建议

- **Node 服务部署**：用 node app.js 配合 Type=simple，Environment 设置 NODE_ENV=production，Restart=on-failure 自愈。
- **独立服务账号**：User= 指定专用账号（如 deploy）运行，避免 root 权限，配合文件权限最小化攻击面。
- **环境变量用 EnvironmentFile**：把密钥、配置写入 /etc/myapp.env（权限 600），unit 文件引用，避免敏感信息进 Git。`,
    code: `# systemd 部署服务 - 沙箱无 systemd，用 echo 输出配置 + 注释讲解
echo "=== /etc/systemd/system/myapp.service 完整示例 ==="
echo "# [Unit] 段：描述与依赖"
echo "[Unit]"
echo "Description=My Node.js App        # 服务人类可读名称"
echo "After=network.target              # 网络就绪后再启动"
echo ""
echo "# [Service] 段：运行方式（核心）"
echo "[Service]"
echo "Type=simple                       # 前台进程，适合 Node/Python"
echo "User=deploy                       # 以 deploy 用户运行，非 root"
echo "WorkingDirectory=/opt/myapp       # 工作目录，相对路径基于此"
echo "Environment=NODE_ENV=production   # 单个环境变量"
echo "EnvironmentFile=/etc/myapp.env    # 批量加载环境变量文件"
echo "ExecStart=/usr/bin/node app.js    # 启动命令，必须绝对路径"
echo "Restart=on-failure                # 异常退出自动重启"
echo "RestartSec=5                      # 重启间隔 5 秒"
echo ""
echo "# [Install] 段：开机自启"
echo "[Install]"
echo "WantedBy=multi-user.target        # 注册到多用户目标"
echo ""
echo "=== systemctl 管理命令 ==="
echo "# cp myapp.service /etc/systemd/system/      # 部署 unit 文件"
echo "# systemctl daemon-reload                    # 重载配置（必做）"
echo "# systemctl enable myapp                     # 开机自启"
echo "# systemctl start myapp                      # 启动服务"
echo "# systemctl status myapp                     # 查看状态"
echo "# journalctl -u myapp -f                     # 实时查看日志"
echo ""
echo "=== 关键提示 ==="
echo "# 改 unit 文件后必须 daemon-reload，否则不生效"
echo "# Type=simple 要求进程前台运行，不能 fork 到后台"`,
  },

  // ============================================================
  // 第 2 章：Docker 容器化
  // ============================================================
  {
    id: "os-docker",
    group: "部署实战",
    icon: "🐳",
    title: "Docker 容器化",
    content: `# Docker 容器化

## 概述

Docker 是当前最流行的容器化平台，它把应用及其依赖打包成一个标准化镜像，在任何环境都能一致运行。容器共享主机内核，比虚拟机更轻量，启动秒级，资源占用低，彻底解决了"在我机器上能跑"的环境一致性问题。

Docker 的核心概念是镜像（Image）和容器（Container）。镜像是只读模板，包含应用代码、运行时、依赖库；容器是镜像的运行实例。通过 Dockerfile 描述如何构建镜像，用 docker 命令管理容器生命周期。理解镜像分层、Dockerfile 指令、数据持久化，是容器化部署的基础，也是后续学习 Kubernetes 的必备前置知识。

## 核心要点

- **docker run**：从镜像启动容器。\`-d\` 后台运行，\`-p\` 端口映射，\`-v\` 卷挂载，\`--name\` 命名，\`-e\` 环境变量。
- **docker ps**：列出运行中容器，\`-a\` 包含已停止的，是排查容器状态的第一步。
- **docker images**：列出本地镜像，\`-q\` 只输出 ID，配合 \`docker rmi $(docker images -q)\` 清理。
- **docker exec**：在运行中容器内执行命令，\`-it\` 分配交互终端，常用 \`docker exec -it web sh\` 进入容器调试。
- **docker logs**：查看容器日志，\`-f\` 实时跟踪，\`--tail 100\` 看最后 100 行，\`-t\` 显示时间戳。
- **Dockerfile FROM**：基础镜像，如 \`FROM node:18-alpine\`。alpine 版本更小，生产推荐。
- **RUN/COPY/CMD**：RUN 构建时执行命令，COPY 拷贝文件到镜像，CMD 容器启动默认命令。
- **ENTRYPOINT vs CMD**：ENTRYPOINT 固定启动命令，CMD 提供默认参数，组合使用让镜像既固定又灵活。
- **EXPOSE**：声明容器监听端口，仅文档说明，真正映射需 run 时加 -p。
- **镜像分层**：每条 Dockerfile 指令生成一层，层被缓存复用，修改靠后的层不会让前面的缓存失效。

## 原理与机制

- **联合文件系统**：镜像由多层只读层叠加，容器启动时在最上层加一个可读写层，修改用 copy-on-write。
- **端口映射**：\`-p 主机端口:容器端口\` 把主机端口流量转发到容器，外部通过主机端口访问容器服务。
- **volume 持久化**：容器销毁后可读写层丢失，volume 把数据存在主机，独立于容器生命周期，适合数据库。
- **构建缓存**：Dockerfile 指令按顺序缓存，某层变化则其后续所有层重新构建，把易变的 COPY 放最后优化速度。

## 易错点与陷阱

- **容器数据丢失**：没挂载 volume 的数据随容器删除而消失，数据库必须挂 volume 持久化。
- **镜像过大**：多条 RUN 生成多层，用 && 合并命令并清理缓存，减少层数和体积。
- **CMD 被 run 参数覆盖**：\`docker run image command\` 的 command 会覆盖 CMD，用 ENTRYPOINT 可避免启动命令被误覆盖。

## 实战建议

- **用 alpine 基础镜像**：node:18-alpine 比 node:18 小 10 倍，构建快、攻击面小，生产环境首选。
- **多阶段构建**：构建阶段用完整镜像编译，运行阶段拷贝产物到 alpine，最终镜像只含运行时和产物。
- **.dockerignore**：排除 node_modules、.git 等，避免无效拷贝进镜像，加速构建。`,
    code: `# Docker 容器化 - 沙箱无 docker，用 echo 输出配置 + 注释讲解
echo "=== Dockerfile 示例（部署 Node web 应用）==="
echo "FROM node:18-alpine              # 基础镜像，alpine 体积小"
echo "WORKDIR /app                     # 容器内工作目录"
echo "COPY package*.json ./            # 先拷依赖描述，利用缓存"
echo "RUN npm ci --production          # 安装依赖，生产模式"
echo "COPY . .                         # 拷贝业务代码（放最后利用缓存）"
echo "EXPOSE 3000                      # 声明监听端口（文档性质）"
echo "CMD [\"node\", \"app.js\"]           # 启动命令，JSON 数组形式"
echo ""
echo "=== docker 常用命令 ==="
echo "# 构建镜像：-t 命名，. 表示当前目录为构建上下文"
echo "docker build -t myapp:1.0 ."
echo ""
echo "# 运行容器：-d 后台 -p 端口映射 -v 卷挂载 --name 命名"
echo "docker run -d -p 80:3000 -v /data:/app/data --name web myapp:1.0"
echo ""
echo "# 查看容器 / 进入容器 / 查看日志"
echo "docker ps                # 仅运行中容器"
echo "docker ps -a             # 包含已停止"
echo "docker exec -it web sh   # 进入容器 shell 调试"
echo "docker logs -f --tail 100 web   # 实时跟踪日志"
echo ""
echo "# 停止 / 删除容器 / 删除镜像"
echo "docker stop web && docker rm web"
echo "docker rmi myapp:1.0"
echo ""
echo "=== 关键原理：镜像分层与缓存 ==="
echo "# 每条指令一层，缓存复用；COPY package*.json 放前面"
echo "# 业务代码 COPY . . 放最后，改动只重建最后一层"`,
  },

  // ============================================================
  // 第 3 章：Docker Compose 多容器
  // ============================================================
  {
    id: "os-compose",
    group: "部署实战",
    icon: "🧱",
    title: "Docker Compose 多容器",
    content: `# Docker Compose 多容器

## 概述

Docker Compose 是定义和运行多容器 Docker 应用的工具，通过一个 YAML 文件描述服务、网络、卷及其依赖关系，用一条命令完成所有容器的编排启动。相比手写多条 docker run，Compose 让复杂应用的部署变得声明式、可版本化、可复现。

现代 Web 应用通常由前端、后端 API、数据库、缓存等多个服务组成，服务间有启动顺序和网络依赖。Compose 用 depends_on 表达依赖，用 networks 隔离通信，用 volumes 持久化数据，一套配置完整描述应用架构。开发者用同一份 compose 文件在本地、测试、生产环境一致部署，是微服务和多服务架构部署的利器。

## 核心要点

- **services**：compose 文件顶层关键字，下定义各个服务，如 web、db、redis，每个服务等价于一个 docker run。
- **image/build**：image 直接用现成镜像，build 指定 Dockerfile 路径构建，二选一。
- **depends_on**：表达启动依赖，如 web depends_on db，会先启动 db。注意只控制启动顺序，不等待服务就绪。
- **environment**：服务环境变量，可用列表或字典形式，如 \`environment: [MYSQL_ROOT_PASSWORD=secret]\`。
- **volumes**：数据持久化。命名卷在顶层 volumes 声明后引用，主机挂载直接 \`主机路径:容器路径\`。
- **networks**：自定义网络，同网络的服务可用服务名互相访问，如 web 连 db:3306，服务名即主机名。
- **ports**：端口映射，\`主机端口:容器端口\`，仅暴露给外部的服务（如 web）才需要，内部服务间用网络名通信。
- **up/down**：\`docker-compose up -d\` 后台启动全部，\`down\` 停止并删除容器网络，\`-v\` 连带删除卷。
- **logs**：\`docker-compose logs -f web\` 跟踪某服务日志，\`--tail 50\` 限制行数。

## 原理与机制

- **服务名 DNS 解析**：compose 为每个网络创建独立 DNS，服务间用服务名作为主机名访问，无需查 IP，容器重启 IP 变化也不影响。
- **默认网络**：不显式声明 networks 时，compose 创建默认网络把所有服务连入，服务名互访开箱即用。
- **depends_on 的局限**：只保证启动顺序，不等待依赖服务"就绪"。db 容器启动不等于 MySQL 可连接，需 healthcheck 或重试机制。
- **配置覆盖**：docker-compose.yml 是基础，docker-compose.override.yml 自动覆盖用于本地开发，-f 指定多文件叠加用于环境差异。

## 易错点与陷阱

- **depends_on 误当就绪检查**：db 容器启动到 MySQL 可连接有延迟，web 启动时连 db 失败，需应用层重试或 healthcheck。
- **down -v 误删数据**：\`docker-compose down -v\` 会删除命名卷，生产慎用；主机挂载卷不受影响。
- **端口冲突**：多个服务映射同一主机端口会冲突，仅对外服务映射端口，内部服务不映射。

## 实战建议

- **内部服务不映射端口**：db、redis 仅在 compose 网络内通信，不写 ports，减少攻击面，仅 web 对外。
- **用 healthcheck 表达就绪**：为 db 配 healthcheck，web 用 depends_on condition: service_healthy 等待真正就绪。
- **环境差异用多文件**：base compose 定义架构，prod.yml 覆盖镜像版本、资源限制，-f 叠加管理多环境。`,
    code: `# Docker Compose 多容器 - 沙箱无 docker，用 echo 输出配置 + 注释
echo "=== docker-compose.yml（web + db + redis 编排）==="
echo "version: \"3.8\"                     # compose 文件版本"
echo ""
echo "services:                           # 定义所有服务"
echo "  web:                              # 前端服务"
echo "    build: ./web                    # 从 ./web/Dockerfile 构建"
echo "    ports:                          # 端口映射，对外暴露"
echo "      - \"80:3000\""
echo "    environment:                    # 环境变量"
echo "      - DB_HOST=db                  # 用服务名 db 访问数据库"
echo "      - REDIS_URL=redis://redis:6379"
echo "    depends_on:                     # 启动依赖"
echo "      - db"
echo "      - redis"
echo "    restart: always                 # 崩溃自动重启"
echo ""
echo "  db:                               # MySQL 数据库"
echo "    image: mysql:8.0                # 直接用官方镜像"
echo "    environment:"
echo "      MYSQL_ROOT_PASSWORD: secret   # 字典形式环境变量"
echo "      MYSQL_DATABASE: app"
echo "    volumes:                        # 命名卷持久化数据"
echo "      - dbdata:/var/lib/mysql"
echo "    # 不写 ports，仅内部网络可访问"
echo ""
echo "  redis:                            # 缓存"
echo "    image: redis:7-alpine"
echo ""
echo "volumes:                            # 顶层声明命名卷"
echo "  dbdata:"
echo ""
echo "=== 常用命令 ==="
echo "# docker-compose up -d        # 后台启动全部服务"
echo "# docker-compose ps           # 查看服务状态"
echo "# docker-compose logs -f web  # 跟踪 web 日志"
echo "# docker-compose down         # 停止并删除容器网络"
echo ""
echo "=== 关键原理 ==="
echo "# 同一网络内服务用服务名互访：web 连 db:3306"
echo "# depends_on 只控启动顺序，不等服务就绪"`,
  },

  // ============================================================
  // 第 4 章：日志管理
  // ============================================================
  {
    id: "os-logs",
    group: "部署实战",
    icon: "📋",
    title: "日志管理",
    content: `# 日志管理

## 概述

日志是运维的眼睛，记录系统运行的关键信息。Linux 有完善的日志体系：systemd 服务日志由 journald 集中收集，传统应用日志写入 /var/log，配合 logrotate 轮转防止磁盘撑爆。掌握日志查看、筛选、轮转、聚合，是排查问题和监控系统健康的必备能力。

systemd 服务的日志被 journald 自动捕获，用 journalctl 命令统一查询，支持按服务、时间、优先级过滤，比传统翻文件高效。传统应用把日志写到文件，用 tail -f 实时跟踪，用 logrotate 自动切割压缩，避免单文件过大。在微服务和分布式场景下，日志分散在多机多容器，ELK 等集中化日志平台应运而生，统一采集、存储、检索、可视化。

## 核心要点

- **/var/log**：系统日志目录。messages/syslog 通用日志，auth.log 认证日志，应用日志通常放 /var/log/app/。
- **journalctl -u**：按服务过滤日志，\`journalctl -u nginx\` 查看 nginx 日志，\`-u nginx -f\` 实时跟踪。
- **journalctl --since**：时间过滤，\`--since "1 hour ago"\` 看最近 1 小时，\`--since today\` 看今天。
- **日志优先级**：emerg/alert/crit/err/warning/notice/info/debug 七级，\`journalctl -p err\` 只看错误及以上。
- **tail -f**：实时跟踪文件追加内容，\`-n 100\` 先显示最后 100 行，是查看应用日志文件最常用命令。
- **logrotate**：日志轮转工具，按大小/时间切割、压缩、删除旧日志，配置在 /etc/logrotate.d/，防止磁盘撑爆。
- **多日志合并**：\`tail -f a.log b.log\` 同时跟踪多文件，或用 multitail 工具分屏查看。
- **日志级别**：DEBUG 调试 / INFO 常规 / WARN 警告 / ERROR 错误 / FATAL 致命，生产通常 INFO 及以上。
- **ELK 简介**：Elasticsearch 存储检索，Logstash/Beats 采集，Kibana 可视化，是主流日志平台架构。

## 原理与机制

- **journald 二进制存储**：日志存为二进制索引格式，只能用 journalctl 查询，支持高效过滤，比纯文本检索快。
- **logrotate 工作流**：按配置周期执行，把当前日志重命名追加日期，创建新文件，通知应用重开句柄，压缩旧文件。
- **轮转触发条件**：daily/weekly/monthly 按时间，size 100M 按大小，rotate 7 保留 7 份，compress 压缩旧文件。
- **集中化采集**：Filebeat/Fluentd 在各节点读日志文件，按需过滤转换后发送到 Elasticsearch，Kibana 提供查询界面。

## 易错点与陷阱

- **日志撑爆磁盘**：不配 logrotate 的应用日志会无限增长，曾导致生产磁盘满、服务崩溃的经典故障。
- **journalctl 看不到旧日志**：journald 默认按磁盘配额自动清理，关键日志应持久化配置或转存文件。
- **日志含敏感信息**：把密码、token 写入日志导致泄露，生产日志需脱敏，遵循不记密钥原则。

## 实战建议

- **应用日志结构化**：输出 JSON 格式日志（含时间、级别、requestId），便于 ELK 采集后按字段检索和分析。
- **分级输出**：开发环境 DEBUG，生产 INFO，错误日志配告警，平衡可观测性和性能。
- **定期归档**：logrotate 配置保留 7-30 天，超期压缩归档到对象存储，兼顾排查需求和存储成本。`,
    code: `# 日志管理 - 沙箱可跑部分（journalctl/logrotate 用 echo，tail 演示）
echo "=== journalctl 常用命令（沙箱无 systemd，echo 讲解）==="
echo "# journalctl -u nginx              # 查看 nginx 服务日志"
echo "# journalctl -u nginx -f           # 实时跟踪"
echo "# journalctl -u nginx --since today"
echo "# journalctl -u nginx --since \"1 hour ago\""
echo "# journalctl -p err                # 只看错误及以上级别"
echo "# journalctl --disk-usage          # 查看日志占用空间"
echo ""
echo "=== logrotate 配置示例（沙箱无 root，echo 讲解）==="
echo "# /etc/logrotate.d/myapp"
echo "/var/log/myapp/*.log {"
echo "    daily              # 每天轮转"
echo "    rotate 7           # 保留 7 份"
echo "    compress           # 压缩旧日志"
echo "    missingok          # 日志不存在不报错"
echo "    notifempty         # 空文件不轮转"
echo "    copytruncate       # 拷贝后清空（应用无需重开句柄）"
echo "}"
echo ""
echo "=== tail 查看日志演示（沙箱可跑）==="
LOG=/tmp/demo-\$\$.log
echo "$(date) [INFO] 服务启动" > "$LOG"
echo "$(date) [WARN] 内存偏高" >> "$LOG"
echo "$(date) [ERROR] 数据库连接失败" >> "$LOG"
echo "--- 测试日志已写入，tail 查看最后 3 行 ---"
tail -n 3 "$LOG"
echo ""
echo "# 实际运维：tail -f /var/log/myapp/app.log  实时跟踪"
rm -f "$LOG"
echo "=== 演示结束 ==="`,
  },
];
