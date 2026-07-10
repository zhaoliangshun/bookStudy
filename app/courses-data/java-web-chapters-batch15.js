// =============================================================
// Java Web 应用开发实战教程 —— 第十五批章节（部署与运维组，共 4 章）
// 章节 57-60:应用打包与 jar 部署 / Docker 容器化部署 /
//          Nginx 反向代理与负载均衡 / 日志监控与生产运维
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十七章:应用打包与 jar 部署
  // =============================================================
  {
    id: "jw-57",
    group: "部署与运维",
    icon: "📦",
    title: "应用打包与 jar 部署",
    content: `# 应用打包与 jar 部署

## 概念解释

Spring Boot 颠覆了传统 Java Web 的部署方式：不再打 war 包丢进 Tomcat，而是打成**可执行 jar**（fat jar），内嵌 Tomcat，直接 \`java -jar\` 启动。这大大简化了部署，一个 jar 就是整个应用。

### 可执行 jar 的结构

传统 jar 只装 class 文件，Spring Boot 的可执行 jar 还包含：

- **\`BOOT-INF/classes/\`**：应用自己的 class 和资源文件。
- **\`BOOT-INF/lib/\`**：所有依赖的第三方 jar（这是 fat jar 名字的来源）。
- **\`org/springframework/boot/loader/\`**：启动器，负责加载 \`BOOT-INF\` 下的类并调用 main 方法。
- **\`META-INF/MANIFEST.MF\`**：声明 \`Main-Class\` 为 \`org.springframework.boot.loader.JarLauncher\`，而不是你的 main 类。

### Spring Boot Maven Plugin

打包靠 \`spring-boot-maven-plugin\`：

\`\`\`xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
\`\`\`

执行 \`mvn package\` 即可在 \`target/\` 下生成可执行 jar。

### Layered Jar（分层 jar）

Spring Boot 2.3+ 引入分层打包。把依赖、应用代码、资源文件分成不同层，Docker 构建时只重建变化层，大幅加速镜像构建。

## 设计原理

### 原理一：内嵌容器省去外部 Tomcat

传统 war 部署要维护一个独立的 Tomcat 实例，配置 server.xml、部署应用。Spring Boot 把 Tomcat 作为 jar 内的依赖，启动 main 方法即启动 Tomcat。好处：部署简单（一个 java 进程）、版本可控（容器版本随应用走）、无状态易扩展。

### 原理二：JarLauncher 自定义类加载

普通 jar 的 classpath 不能引用 jar 内嵌的 jar（即 jar 中的 jar）。Spring Boot 写了 \`JarLauncher\`，用自定义 \`LaunchedURLClassLoader\` 加载 \`BOOT-INF/lib\` 里的依赖。这是 fat jar 能工作的核心技术。

### 原理三：分层打包优化 Docker 缓存

依赖层变化少，代码层变化频繁。Dockerfile 里先 COPY 依赖层再 COPY 代码层，代码变只重建最后几层，秒级构建。Layered jar 让这种分层成为可能：\`java -Djarmode=layertools extract\` 把 jar 拆成多个目录。

### 原理四：配置外部化

jar 内的 \`application.yml\` 是默认配置，生产环境通过命令行参数、环境变量、外部配置文件覆盖。优先级：命令行 > 环境变量 > 外部 config > jar 内 config。这样同一份 jar 跑多环境，无需重新打包。

### 原理五：优雅停机

Spring Boot 2.3+ 内置 \`server.shutdown=graceful\`，收到 SIGTERM 后不再接新请求，等已有请求处理完再退出，避免部署期间请求失败。

## 使用场景

**适合场景**：微服务部署、容器化部署、CI/CD 流水线、需要快速启动的小到中型应用。

**不适合场景**：需要在同一 Tomcat 跑多个应用的传统架构（用 war）、对启动速度要求极高的 Serverless 场景（考虑 GraalVM Native Image）。

## 代码示例

### Maven 打包配置

\`\`\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <finalName>demo-app</finalName>   <!-- 生成 demo-app.jar -->
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <!-- 启用分层打包，优化 Docker 缓存 -->
                    <layers>
                        <enabled>true</enabled>
                    </layers>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
\`\`\`

### 打包与启动命令

\`\`\`bash
# 1. 打包（跳过测试加速）
mvn clean package -DskipTests

# 2. 启动（前台运行，日志直接输出）
java -jar target/demo-app.jar

# 3. 后台运行，日志重定向到文件
nohup java -jar target/demo-app.jar > /var/log/app.log 2>&1 &

# 4. 通过环境变量覆盖配置（推荐生产用法）
SERVER_PORT=9090 SPRING_PROFILES_ACTIVE=prod java -jar target/demo-app.jar

# 5. 通过命令行参数指定外部配置文件
java -jar target/demo-app.jar --spring.config.additional-location=/etc/app/

# 6. JVM 参数（堆内存、GC 日志等放 -jar 前）
java -Xms2g -Xmx2g -XX:+UseG1GC -jar target/demo-app.jar --spring.profiles.active=prod
\`\`\`

### 多环境配置

\`\`\`yaml
# application.yml（默认配置，打包进 jar）
server:
  port: 8080
spring:
  application:
    name: demo-app

---
# application-prod.yml（生产配置，可放 jar 外覆盖）
server:
  port: \${SERVER_PORT:8080}        # 优先读环境变量，默认 8080
  shutdown: graceful                # 优雅停机
spring:
  datasource:
    url: \${DB_URL}                 # 必须由环境变量提供
    username: \${DB_USER}
    password: \${DB_PASSWORD}
\`\`\`

### 生产启动脚本

\`\`\`bash
#!/bin/bash
# start.sh - 生产环境启动脚本

APP_NAME="demo-app"
JAR_FILE="/opt/app/\${APP_NAME}.jar"
PID_FILE="/var/run/\${APP_NAME}.pid"
LOG_DIR="/var/log/\${APP_NAME}"

# JVM 参数
JAVA_OPTS="-Xms2g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
JAVA_OPTS="\$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=\${LOG_DIR}/heapdump.hprof"
JAVA_OPTS="\$JAVA_OPTS -Xlog:gc*:file=\${LOG_DIR}/gc.log:time,uptime:filecount=10,filesize=100m"

# Spring 配置
SPRING_OPTS="--spring.profiles.active=prod"
SPRING_OPTS="\$SPRING_OPTS --spring.config.additional-location=/etc/\${APP_NAME}/"

# 启动
nohup java \$JAVA_OPTS -jar \$JAR_FILE \$SPRING_OPTS > \${LOG_DIR}/stdout.log 2>&1 &
echo \$! > \$PID_FILE
echo "\${APP_NAME} 已启动，PID: \$(cat \$PID_FILE)"
\`\`\`

### 优雅停机配置

\`\`\`yaml
server:
  shutdown: graceful          # 收到关闭信号后等请求处理完
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s   # 最多等 30 秒
\`\`\`

关键点：\`spring-boot-maven-plugin\` 生成可执行 jar；\`layers.enabled=true\` 优化 Docker 缓存；\`nohup ... &\` 后台运行；环境变量覆盖配置无需重打包；\`server.shutdown=graceful\` 优雅停机避免部署期间请求失败。

## 对比分析

| 维度 | jar（Spring Boot） | war（传统） | Native Image（GraalVM） |
| --- | --- | --- | --- |
| 部署方式 | java -jar | 丢进 Tomcat | 直接执行二进制 |
| 容器 | 内嵌 Tomcat | 外部 Tomcat | 无容器 |
| 启动速度 | 秒级 | 秒级 | 毫秒级 |
| 内存占用 | 中（百 MB） | 中（百 MB） | 低（几十 MB） |
| 配置外部化 | 灵活 | 灵活 | 受限（反射需配置） |
| 兼容性 | 好 | 好 | 部分库不兼容 |
| 适合场景 | 微服务、容器化 | 传统应用、多应用共享容器 | Serverless、CLI 工具 |

Fat jar vs Layered jar 对比：

| 维度 | Fat jar（普通） | Layered jar |
| --- | --- | --- |
| Docker 构建缓存 | 差（任何代码变都重建全量） | 好（依赖层缓存命中率高） |
| 构建速度 | 慢 | 快 |
| 包大小 | 相同 | 相同 |
| 复杂度 | 低 | 中 |
| Spring Boot 版本 | 全版本 | 2.3+ |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| jar 包过大 | 把所有依赖打进一个 jar | 用 layered jar 分层，或排除未使用依赖 |
| 启动时报配置找不到 | 配置在 jar 内但被外部覆盖逻辑弄丢 | 检查 spring.config.location 优先级 |
| 生产配置泄露到 jar | application-prod.yml 打进 jar | 用外部配置文件或环境变量，敏感信息不入 jar |
| 后台进程意外退出 | nohup 没生效或终端关闭杀进程 | 用 systemd 或 supervisord 管理进程 |
| 优雅停机不生效 | 未配置 server.shutdown=graceful | 加配置，并确认用 SIGTERM 而非 SIGKILL |
| 端口冲突 | 多实例跑同一端口 | 用 SERVER_PORT 环境变量区分 |
| OOM 后进程直接死 | 没配 HeapDumpOnOutOfMemoryError | 加 JVM 参数，dump 后用 MAT 分析 |
| 配置占位符不替换 | \${VAR} 写在 yml 但环境变量未设置 | 用 \${VAR:default} 提供默认值 |
| 日志被 nohup.out 撑爆 | nohup 默认输出到 nohup.out | 显式重定向 > /var/log/app.log 2>&1 |
| jar 内配置无法覆盖 | spring.config.location 替换而非追加 | 用 spring.config.additional-location 追加 |
`
  },
  // =============================================================
  // 第五十八章:Docker 容器化部署
  // =============================================================
  {
    id: "jw-58",
    group: "部署与运维",
    icon: "🐳",
    title: "Docker 容器化部署",
    content: `# Docker 容器化部署

## 概念解释

Docker 是最主流的容器化平台。容器是"轻量级虚拟机"——共享宿主机内核，但隔离进程、文件系统、网络。相比虚拟机，容器启动快（秒级）、资源占用少（MB 级）、密度高（单机可跑上百容器）。

### 核心概念

- **镜像（Image）**：只读模板，包含运行应用所需的所有内容（代码、依赖、运行时）。类似面向对象的"类"。
- **容器（Container）**：镜像的运行实例，可读写。类似"对象"。
- **Dockerfile**：描述如何构建镜像的文本文件，一条指令一层。
- **镜像仓库（Registry）**：存镜像的地方，如 Docker Hub、Harbor、阿里云 ACR。
- **docker-compose**：多容器编排工具，用 YAML 描述一组关联容器。

### 镜像分层

Docker 镜像由多个只读层叠加，每条 Dockerfile 指令生成一层。容器启动时在最上层加一个可写层。分层的好处是**复用**：多个镜像共享基础层，节省存储和构建时间。

## 设计原理

### 原理一：分层联合文件系统

Docker 用 OverlayFS / aufs 等联合文件系统把多层只读层叠加成一个文件系统视图。容器写文件时，Copy-on-Write 到可写层，不影响下层。这让镜像构建可缓存：基础层不变就复用缓存，只重建变化层。

### 原理二：单进程模型

一个容器理想情况只跑一个进程（主进程）。主进程退出容器即退出。这符合 Unix 哲学"做一件事做好"。多进程场景用 docker-compose 编排多个容器，而不是一个容器塞多进程。

### 原理三：多阶段构建分离构建与运行

构建 Java 应用需要 Maven/JDK，但运行只需要 JRE。多阶段构建：第一阶段用 maven 镜像编译打包，第二阶段从 builder 拷贝 jar 到精简的 jre 镜像。最终镜像不含构建工具，体积小、攻击面小。

### 原理四：不可变基础设施

镜像一旦构建不再修改，要更新就重新构建新镜像。配置通过环境变量、ConfigMap 注入，不写死在镜像里。这样同一镜像能跑所有环境（dev/test/prod），符合"构建一次，到处部署"理念。

### 原理五：非 root 用户运行

默认容器以 root 运行，有安全风险（容器逃逸时拿 root 权限）。生产镜像应创建专用用户，用 \`USER appuser\` 切换，最小权限原则。

## 使用场景

**适合场景**：微服务部署、CI/CD 流水线（构建镜像推送仓库）、环境一致性（开发测试生产同镜像）、横向扩展（Kubernetes 编排）、需要隔离依赖的应用。

**不适合场景**：图形界面应用、需要直接访问硬件的场景、对启动延迟极敏感（容器层有少量开销）、单机简单脚本部署（直接跑更简单）。

## 代码示例

### 多阶段 Dockerfile

\`\`\`dockerfile
# 阶段一：构建（用 maven 镜像编译打包）
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
# 先只拷 pom.xml，下载依赖（利用缓存层，代码变不重下依赖）
COPY pom.xml .
RUN mvn dependency:go-offline
# 再拷源码编译打包
COPY src ./src
RUN mvn clean package -DskipTests

# 阶段二：运行（用精简 JRE 镜像）
FROM eclipse-temurin:17-jre-alpine
# 创建非 root 用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# 设置工作目录
WORKDIR /app
# 从 builder 阶段拷贝 jar
COPY --from=builder /build/target/*.jar app.jar
# 切换非 root 用户
USER appuser
# 暴露端口（仅声明，运行时仍需 -p 映射）
EXPOSE 8080
# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--spring.profiles.active=prod"]
\`\`\`

### 构建与运行

\`\`\`bash
# 构建镜像，-t 给标签，. 表示当前目录找 Dockerfile
docker build -t myapp:1.0.0 .

# 运行容器
# -d 后台运行，--name 容器名，-p 端口映射（宿主:容器），-e 环境变量
docker run -d \\
  --name myapp \\
  -p 8080:8080 \\
  -e SPRING_PROFILES_ACTIVE=prod \\
  -e DB_URL=jdbc:mysql://db:3306/mydb \\
  -e DB_USER=root \\
  -e DB_PASSWORD=secret \\
  -v /var/log/myapp:/var/log \\
  myapp:1.0.0

# 查看日志
docker logs -f myapp

# 进入容器调试
docker exec -it myapp sh

# 查看容器状态
docker ps
docker stats myapp
\`\`\`

### docker-compose 编排多容器

\`\`\`yaml
version: "3.9"
services:
  app:
    image: myapp:1.0.0
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL: jdbc:mysql://db:3306/mydb
      DB_USER: root
      DB_PASSWORD: \${DB_PASSWORD}     # 从 .env 文件读
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
      MYSQL_DATABASE: mydb
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  db_data:
\`\`\`

配套的 \`.env\` 文件：

\`\`\`bash
# .env 文件（不提交到 git）
DB_PASSWORD=supersecret
\`\`\`

关键点：多阶段构建让最终镜像只含 JRE + jar，体积从 800MB 降到 200MB；\`COPY pom.xml\` 单独一层利用缓存；\`USER appuser\` 非 root 运行；\`HEALTHCHECK\` 让 Docker 知道容器健康状态；\`depends_on.condition\` 等数据库健康再启动应用。

## 对比分析

| 维度 | Docker 容器 | 虚拟机（VM） | 物理机 |
| --- | --- | --- | --- |
| 隔离级别 | 进程级 | 硬件级 | 无隔离 |
| 启动时间 | 秒级 | 分钟级 | 即时（已运行） |
| 资源占用 | MB 级 | GB 级 | 全机 |
| 密度 | 单机百容器 | 单机十几 VM | 单机一应用 |
| 内核 | 共享宿主机 | 独立内核 | 独立内核 |
| 隔离强度 | 弱（共享内核） | 强 | 无 |
| 镜像大小 | MB 级 | GB 级 | 无 |
| 部署一致性 | 极好 | 好 | 差 |

Docker 编排工具对比：

| 维度 | docker-compose | Docker Swarm | Kubernetes |
| --- | --- | --- | --- |
| 复杂度 | 低 | 中 | 高 |
| 适用规模 | 单机 | 小集群 | 大集群 |
| 学习成本 | 低 | 中 | 高 |
| 生态 | 小 | 弱 | 极强 |
| 生产可用 | 仅小项目 | 边缘化 | 业界标准 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 镜像过大 | 用了完整 JDK 镜像 | 多阶段构建，用 jre-alpine 基础镜像 |
| 构建缓存失效频繁 | COPY 全部代码在依赖下载前 | 先 COPY pom.xml 下依赖，再 COPY src |
| 容器以 root 运行 | 默认 root，有安全风险 | 创建专用用户，USER appuser 切换 |
| 日志撑爆磁盘 | 容器日志默认无限增长 | 配 logging max-size + max-file 或用集中日志 |
| 数据丢失 | 数据存容器可写层，删容器即丢 | 用 -v 挂载持久卷 |
| 容器间不能用 localhost 通信 | 每个容器有独立网络命名空间 | 用 docker-compose 服务名通信，或 --network |
| 启动慢 | JVM 预热慢 | 用 GraalVM Native Image 或 AppCDS |
| HEALTHCHECK 不生效 | 健康检查命令错或端口不对 | 确认 curl/wget 命令存在，端口与 EXPOSE 一致 |
| 时区不对 | 容器默认 UTC | 设 TZ=Asia/Shanghai 环境变量，或挂载 /etc/localtime |
| OOM 容器被杀 | Docker 内存限制低于 JVM 堆 | docker run --memory 设上限，JVM 堆设为上限的 75% |
`
  },
  // =============================================================
  // 第五十九章:Nginx 反向代理与负载均衡
  // =============================================================
  {
    id: "jw-59",
    group: "部署与运维",
    icon: "⚖️",
    title: "Nginx 反向代理与负载均衡",
    content: `# Nginx 反向代理与负载均衡

## 概念解释

Nginx 是高性能的 HTTP 服务器和反向代理，单机可扛数万并发。在 Java Web 部署中，Nginx 通常作为前置代理：客户端请求先到 Nginx，Nginx 转发到后端 Spring Boot 实例。

### 正向代理 vs 反向代理

- **正向代理**：代理客户端。客户端配代理服务器访问外网，服务器不知道真实客户端是谁（如翻墙代理）。"代理谁，谁就被代理"。
- **反向代理**：代理服务器。客户端以为 Nginx 就是服务器，不知道后端真实实例是谁（如负载均衡器）。对客户端透明。

Nginx 在反向代理模式下的职责：负载均衡、SSL 终止、静态资源服务、缓存、限流。

### 负载均衡算法

- **轮询（Round Robin，默认）**：依次分配，后端实例等权。
- **加权轮询（weight）**：按权重分配，性能强的机器权重高。
- **ip_hash**：按客户端 IP 哈希固定到某后端，保证会话亲和（同一 IP 总到同一实例）。
- **least_conn**：分配给当前连接数最少的后端。
- **一致性哈希（第三方模块）**：增减后端时缓存失效少。

## 设计原理

### 原理一：事件驱动非阻塞 IO

Nginx 用 epoll（Linux）/ kqueue（macOS）多路复用，单 worker 进程可同时处理数万连接。每个连接非阻塞，IO 等待时不占 CPU。相比 Apache 的多进程/多线程模型，Nginx 内存占用极低，并发能力极强。

### 原理二：worker 进程模型

Nginx 启动一个 master 进程管理多个 worker 进程（默认等于 CPU 核数）。master 负责读取配置、管理 worker；worker 处理实际请求。worker 之间用共享内存交换状态，无锁高效。worker 崩溃 master 会重启它，保证可用性。

### 原理三：upstream 抽象后端池

\`upstream\` 块把多个后端实例抽象成一个逻辑服务，Nginx 按算法分配请求。后端实例可动态增减（reload 即可），应用无感知。这是横向扩展的基础——加机器只需在 upstream 加一行。

### 原理四：SSL 终止

HTTPS 加解密在 Nginx 做，后端用 HTTP 明文。好处：后端不用处理证书，CPU 卸载到 Nginx（Nginx 可用硬件加速）；证书集中管理；后端间通信简化。

### 原理五：健康检查与容错

Nginx 默认被动健康检查：请求某后端失败（超时/5xx）标记为不可用，一段时间不再分发。商业版有主动健康检查。开源版可用 \`max_fails\` 和 \`fail_timeout\` 控制容错策略。

## 使用场景

**适合场景**：多实例负载均衡、HTTPS 终止、静态资源服务（前端打包文件）、WebSocket 代理、API 网关前置、限流防护。

**不适合场景**：单实例小流量应用（直接暴露 Spring Boot 即可）、需要复杂业务路由逻辑（用 Spring Cloud Gateway 更灵活）、动态内容生成（Nginx 不擅长）。

## 代码示例

### 基础反向代理 + 负载均衡

\`\`\`nginx
# /etc/nginx/conf.d/app.conf

# 定义后端实例池
upstream backend {
    # 加权轮询，性能强的机器权重高
    server 192.168.1.10:8080 weight=3;
    server 192.168.1.11:8080 weight=2;
    server 192.168.1.12:8080 weight=1;

    # 失败策略：10 秒内失败 3 次则标记不可用，30 秒后重试
    # max_fails=3 fail_timeout=30s;

    # keepalive 长连接，减少与后端握手开销
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    # HTTP 跳转 HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL 证书
    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 请求体大小限制（上传文件）
    client_max_body_size 50m;

    # 反向代理到 upstream
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;          # 用 HTTP/1.1 支持长连接

        # 透传客户端真实信息给后端
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # 超时设置
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
\`\`\`

### WebSocket 代理

WebSocket 需要 Upgrade 头透传：

\`\`\`nginx
upstream ws_backend {
    server 192.168.1.10:8080;
    # ip_hash 保证同一客户端连到同一后端（如果 session 存内存）
    ip_hash;
}

server {
    listen 443 ssl;
    server_name ws.example.com;

    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    location /ws/ {
        proxy_pass http://ws_backend;
        proxy_http_version 1.1;

        # 关键：透传 Upgrade 和 Connection 头
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;

        # WebSocket 长连接，超时设长（默认 60s 会断）
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
\`\`\`

### 静态资源 + API 分流

\`\`\`nginx
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    # 静态资源（前端 Vue/React 打包文件）
    location / {
        root /var/www/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;   # SPA 路由回退
        expires 30d;                            # 静态资源缓存
    }

    # API 请求代理后端
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # 限流：每 IP 每秒 10 请求
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    location /api/login {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
    }
}
\`\`\`

关键点：\`upstream\` 定义后端池；\`proxy_pass\` 转发；\`proxy_set_header\` 透传客户端信息（后端拿到的 IP 是 Nginx 的，要靠 \`X-Real-IP\`）；WebSocket 必须透传 \`Upgrade\` 和 \`Connection\` 头；\`try_files\` 实现 SPA 路由回退；\`limit_req\` 限流防刷。

## 对比分析

| 维度 | Nginx | Apache | HAProxy | Spring Cloud Gateway |
| --- | --- | --- | --- | --- |
| 定位 | Web 服务器 + 代理 | Web 服务器 | 专用负载均衡 | API 网关 |
| 并发模型 | 事件驱动非阻塞 | 多进程/多线程 | 事件驱动 | 响应式（Netty） |
| 单机并发 | 数万 | 数千 | 数十万 | 数万 |
| 静态资源 | 强 | 强 | 不支持 | 不支持 |
| 负载均衡 | 支持 | 支持（弱） | 强 | 支持 |
| 编程扩展 | Lua 模块 | 模块 | 配置为主 | Java DSL |
| 配置复杂度 | 中 | 中 | 低 | 高 |
| 适合场景 | 综合 Web 服务 | 传统 Web | 纯四层/七层 LB | 微服务网关 |

负载均衡算法对比：

| 算法 | 原理 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 轮询 | 依次分配 | 简单公平 | 不考虑性能差异 |
| 加权轮询 | 按权重分配 | 考虑性能差异 | 权重要手动配 |
| ip_hash | IP 哈希固定 | 会话亲和 | IP 变化失效，分布不均 |
| least_conn | 最少连接 | 动态均衡 | 需维护连接计数 |
| 一致性哈希 | 环形哈希空间 | 增减节点缓存失效少 | 需第三方模块 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 后端拿到的 IP 是 Nginx 的 | 默认不透传客户端 IP | 配 proxy_set_header X-Real-IP \$remote_addr |
| WebSocket 连接秒断 | 没透传 Upgrade 头 | 加 proxy_set_header Upgrade \$http_upgrade 和 Connection "upgrade" |
| 502 Bad Gateway | 后端服务没起或端口不对 | 检查后端实例是否运行，proxy_pass 端口对不对 |
| 504 Gateway Timeout | 后端处理太慢 | 调大 proxy_read_timeout，或优化后端 |
| 上传文件 413 | client_max_body_size 默认 1m | 调大 client_max_body_size |
| HTTPS 配置后仍是 HTTP | 没配 SSL 证书或端口 | listen 443 ssl + ssl_certificate |
| 负载不均 | 用了 ip_hash 但 IP 集中 | 换 least_conn 或加权轮询 |
| 配置改了不生效 | 没 reload | nginx -s reload 或 systemctl reload nginx |
| 静态文件 403 | worker 进程没权限读 | 改文件权限或 user 指令 |
| SPA 刷新 404 | try_files 没配回退 | try_files \$uri \$uri/ /index.html |
`
  },
  // =============================================================
  // 第六十章:日志监控与生产运维
  // =============================================================
  {
    id: "jw-60",
    group: "部署与运维",
    icon: "📊",
    title: "日志监控与生产运维",
    content: `# 日志监控与生产运维

## 概念解释

应用上线只是开始，**运维**才是长期战斗。生产环境三大支柱：**日志**（出了什么事）、**指标**（系统状态如何）、**链路追踪**（请求经过哪些服务）。三者结合才能快速定位线上问题。

### 日志

日志分级别：DEBUG（调试）→ INFO（关键流程）→ WARN（异常但可恢复）→ ERROR（需立即处理）。生产环境通常开 INFO，出问题临时调 DEBUG。

Java 主流日志框架：
- **SLF4J**：日志门面（接口），代码里调 \`LoggerFactory.getLogger()\`。
- **Logback**：Spring Boot 默认实现，配置灵活。
- **Log4j2**：性能更高（异步日志），高并发场景推荐。

### 指标监控

- **Spring Boot Actuator**：内置健康检查、metrics 端点，开箱即用。
- **Micrometer**：指标门面（类似 SLF4J 之于日志），适配 Prometheus、Datadog 等。
- **Prometheus**：时序数据库 + 拉取式采集。
- **Grafana**：可视化仪表盘，配 Prometheus 做数据源。

### 链路追踪

- **OpenTelemetry**：CNCF 标准，统一 Trace、Metrics、Logs。
- **SkyWalking**：国产 APM，字节码增强无侵入。
- **Zipkin**：Twitter 开源，轻量级。

## 设计原理

### 原理一：日志结构化便于检索

传统日志是文本（如 \`2024-01-01 INFO User alice logged in\`），检索靠 grep 效率低。结构化日志输出 JSON：\`{"ts":"2024-01-01","level":"INFO","user":"alice","action":"login"}\`，ELK 直接按字段过滤聚合。Logback 用 \`LogstashEncoder\` 输出 JSON。

### 原理二：日志聚合集中管理

生产多机部署，看日志要登多台机器效率低。日志聚合把所有机器日志汇总到中心：应用输出日志 → Filebeat 采集 → Kafka 缓冲 → Logstash 解析 → Elasticsearch 存储 → Kibana 查询。这就是 **ELK** 栈。

### 原理三：Metrics 拉取式 vs 推送式

Prometheus 用拉取式：主动到应用 \`/actuator/prometheus\` 端点拉数据。好处是应用无感知（只需暴露端点）、控制采样频率。坏处是短期瞬时数据可能丢失。Push（如 StatsD）实时但需应用主动推。

### 原理四：告警基于指标阈值

监控不是目的，**告警**才是。设置阈值：CPU > 80% 持续 5 分钟告警、P99 > 1s 告警、错误率 > 1% 告警。Alertmanager 接收 Prometheus 告警，路由到不同接收方（邮件/钉钉/电话）。

### 原理五：链路追踪解决跨服务定位

微服务一个请求经过多个服务，出问题不知卡在哪。TraceID 贯穿整个调用链，在日志和 Metrics 里都带上 TraceID，就能串起来定位。OpenTelemetry 用 W3C TraceContext 头透传。

## 使用场景

**适合场景**：线上问题排查（日志定位）、性能监控（指标告警）、容量规划（趋势分析）、合规审计（日志留档）、微服务链路追踪。

**不适合场景**：开发阶段（用 IDE 调试更直接）、超小项目（直接看 stdout 即可）。

## 代码示例

### Logback 结构化日志配置

\`\`\`xml
<!-- logback-spring.xml -->
<configuration>
    <!-- 引入 Spring Boot 默认配置 -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- 控制台：彩色人类可读 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %clr(%-5level) [%thread] %cyan(%logger{36}) - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 文件：JSON 结构化，便于 ELK 采集 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/app/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!-- 按天滚动，单文件 100MB，保留 30 天 -->
            <fileNamePattern>/var/log/app/application.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"app":"demo","env":"prod"}</customFields>
        </encoder>
    </appender>

    <!-- 异步日志提升性能，不阻塞业务线程 -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <queueSize>1024</queueSize>
        <discardingThreshold>0</discardingThreshold>
        <appender-ref ref="FILE"/>
    </appender>

    <!-- 不同包不同级别 -->
    <logger name="com.example" level="INFO"/>
    <logger name="org.springframework" level="WARN"/>
    <logger name="org.hibernate.SQL" level="DEBUG"/>   <!-- 打印 SQL -->

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE"/>
    </root>
</configuration>
\`\`\`

### Actuator + Prometheus 监控

\`\`\`yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics   # 暴露端点
  endpoint:
    health:
      show-details: always    # 显示健康详情（含数据库、Redis 检查）
  metrics:
    tags:
      application: demo-app   # 给所有指标打标签
    export:
      prometheus:
        enabled: true         # 启用 Prometheus 格式
\`\`\`

Maven 依赖：

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
\`\`\`

自定义业务指标：

\`\`\`java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final Counter orderCreated;   // 计数器：订单创建数
    private final Timer orderProcessTime; // 计时器：订单处理耗时

    public OrderService(MeterRegistry registry) {
        this.orderCreated = Counter.builder("order.created.total")
            .description("订单创建总数")
            .tag("type", "normal")
            .register(registry);
        this.orderProcessTime = Timer.builder("order.process.time")
            .description("订单处理耗时")
            .register(registry);
    }

    public void createOrder() {
        orderProcessTime.record(() -> {
            // 业务逻辑
            doCreateOrder();
            orderCreated.increment();   // 计数 +1
        });
    }
}
\`\`\`

### Prometheus 告警规则

\`\`\`yaml
# alert_rules.yml
groups:
  - name: app_alerts
    rules:
      # 高错误率告警
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / rate(http_server_requests_seconds_count[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率超过 1%"
          description: "实例 {{ \$labels.instance }} 5xx 错误率超过 1% 持续 5 分钟"

      # 响应时间告警
      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 响应时间超过 1 秒"

      # JVM 内存告警
      - alert: HighHeapUsage
        expr: jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "堆内存使用超过 85%"
\`\`\`

### docker-compose 全栈监控

\`\`\`yaml
version: "3.9"
services:
  app:
    image: myapp:latest
    ports: ["8080:8080"]

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana

  alertmanager:
    image: prom/alertmanager
    ports: ["9093:9093"]

volumes:
  grafana_data:
\`\`\`

关键点：Logback \`LogstashEncoder\` 输出 JSON 便于 ELK 采集；\`AsyncAppender\` 异步写日志不阻塞业务；\`/actuator/prometheus\` 暴露指标给 Prometheus 拉；\`Counter\`/\`Timer\` 自定义业务指标；告警用 PromQL 表达式定义阈值；Grafana 配 Prometheus 数据源做可视化。

## 对比分析

| 维度 | Logback | Log4j2 | java.util.logging |
| --- | --- | --- | --- |
| 性能 | 中 | 高（异步日志） | 低 |
| 配置灵活 | 高（XML 简洁） | 高 | 低 |
| Spring Boot 默认 | 是 | 否 | 否 |
| 结构化日志 | 需 logstash-encoder | 内置 JSON Layout | 不支持 |
| 异步日志 | AsyncAppender | disruptor 高性能 | 不支持 |
| 推荐度 | 首选（默认） | 高并发首选 | 不推荐 |

日志聚合方案对比：

| 维度 | ELK（ES+Logstash+Kibana） | Loki+Grafana | 云服务（CloudWatch） |
| --- | --- | --- | --- |
| 部署 | 重 | 轻 | 免运维 |
| 全文检索 | 强 | 弱（仅标签） | 中 |
| 资源占用 | 高（ES 吃内存） | 低 | 无 |
| 与 Grafana 集成 | 中 | 原生 | 弱 |
| 成本 | 高（自建） | 低 | 按量付费 |
| 适合规模 | 大型 | 中小型 | 云原生 |

APM 链路追踪对比：

| 维度 | SkyWalking | Zipkin | Jaeger |
| --- | --- | --- | --- |
| 接入方式 | 字节码增强（无侵入） | SDK 显式埋点 | SDK 显式埋点 |
| 存储 | ES/H2/MySQL | ES/MySQL | ES/Cassandra |
| UI | 丰富 | 简洁 | 简洁 |
| 告警 | 内置 | 弱 | 弱 |
| 国内生态 | 强（国产） | 中 | 中 |
| 推荐度 | 国内首选 | 轻量级 | CNCF 标准 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 日志撑爆磁盘 | 没配滚动策略 | RollingFileAppender + maxHistory + totalSizeCap |
| 日志阻塞业务线程 | 同步写文件 | 用 AsyncAppender 异步写 |
| 指标不出现 | 没暴露 actuator 端点 | management.endpoints.web.exposure.include 加 prometheus |
| Prometheus 拉不到数据 | 网络或路径不对 | 检查 /actuator/prometheus 是否可访问 |
| 告警风暴 | 阈值太敏感没配 for | 加 for 持续时间，避免瞬时抖动告警 |
| 结构化日志 ELK 不识别 | 非 JSON 格式 | 用 LogstashEncoder 输出标准 JSON |
| 敏感信息入日志 | 把密码、Token 打日志 | 脱敏处理，用 @Slf4j 时注意 |
| traceId 丢失 | 跨服务没透传 trace 头 | 用 OpenTelemetry 或 Sleuth 自动透传 |
| 健康检查频繁导致日志刷屏 | health 端点 INFO 日志 | logback 降 management 端点的日志级别 |
| Grafana 仪表盘空白 | 数据源没配或时间范围错 | 检查 Prometheus 数据源 + 时间选择器 |
`
  },
];
