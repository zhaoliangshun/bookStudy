// =============================================================
// FastAPI 测试与部署全书 - 第 6 批章节（部署基础 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ft-asgi    : ASGI 与部署概览
//   ft-uvicorn : uvicorn 生产配置
//   ft-gunicorn: gunicorn + uvicorn workers
//   ft-docker  : Docker 容器化部署
//   ft-compose : docker-compose 多服务编排
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：ASGI 与部署概览
  // ============================================================
  {
    id: "ft-asgi",
    group: "部署基础",
    icon: "🌐",
    title: "ASGI 与部署概览",
    content: `# ASGI 与部署概览

## 一、从「写完代码」到「上线服务」

前面几章我们一直在本地写 FastAPI、跑测试。启动方式几乎都是 \`uvicorn main:app --reload\`，刷新浏览器就能看到结果。这种模式只适合开发——一旦真实用户来了，单进程、自动重载、无并发管理的开发服务器会立刻趴下。

部署要回答的是另一组问题：

- 一个进程扛不住 1000 并发，怎么办？多进程。
- 进程崩了谁来重启？进程管理器。
- 代码更新时怎么不中断服务？平滑重启。
- HTTPS 证书谁来管？反向代理。
- 多台机器怎么协同？负载均衡。

要理解这些问题，必须先理解 **ASGI** 这个 FastAPI 部署的核心协议。

## 二、ASGI 协议简介

ASGI 全称 **Asynchronous Server Gateway Interface**（异步服务器网关接口）。它是 Python 异步 Web 生态的「插座标准」——定义了「Web 服务器」和「Web 应用」之间的接口契约。

最早 Python 的 Web 世界只有 WSGI（同步网关接口）。WSGI 规定：服务器收到请求 → 调用应用的可调用对象 → 应用返回响应。整个过程是同步阻塞的，一个请求独占一个线程。

随着 \`asyncio\` 出现，WSGI 无法表达「异步」——它没有 \`await\`、没有事件循环、不能处理 WebSocket 长连接。于是社区搞了 ASGI，它在 WSGI 基础上加了三样东西：

1. **异步可调用**：应用是一个 \`async def\` 或支持协程的对象。
2. **事件流协议**：服务器和应用之间用 \`{type, ...}\` 形式的字典互相发消息。
3. **协议无关**：同一套接口能跑 HTTP、HTTP/2、WebSocket。

> 生活类比：WSGI 像老式电话，你拨过去对方接了，两人独占线路，你不挂对方就不能接下一个电话；ASGI 像现代通讯软件，一条消息发出去不必等回复，可以同时和 100 个人聊天，对方回了你再处理。

## 三、ASGI vs WSGI 对比

| 维度 | WSGI | ASGI |
|---|---|---|
| 同步/异步 | 同步阻塞 | 异步协程 |
| 调用形式 | \`def app(environ, start_response)\` | \`async def app(scope, receive, send)\` |
| 并发模型 | 多线程/多进程 | 单进程多协程 + 多进程 |
| WebSocket | 不支持 | 原生支持 |
| HTTP/2 | 不支持 | 支持 |
| 长连接 | 弱（占线程） | 强（协程轻量） |
| 代表框架 | Flask、Django(传统) | FastAPI、Starlette、Sanic |
| 代表服务器 | gunicorn、uWSGI | uvicorn、hypercorn、daphne |

## 四、FastAPI / Starlette / Uvicorn 三者关系

初学者常搞混这三个名字。它们是**三层结构**：

\`\`\`
┌─────────────────────────────────────┐
│  FastAPI（你的业务代码层）           │  ← 路由、依赖注入、Pydantic 校验、OpenAPI
├─────────────────────────────────────┤
│  Starlette（底层 ASGI 应用框架）     │  ← 请求/响应、中间件、路由、WebSocket
├─────────────────────────────────────┤
│  Uvicorn（ASGI 服务器）              │  ← 监听端口、解析 HTTP、调度协程
└─────────────────────────────────────┘
\`\`\`

- **FastAPI** 本身不是一个独立框架，它在 Starlette 之上加了类型注解校验、依赖注入、自动文档等开发者友好特性。
- **Starlette** 才是真正实现 ASGI 接口的「Web 框架」。FastAPI 的 \`Request\`、\`Response\`、中间件、路由全部来自 Starlette。
- **Uvicorn** 是服务器，它负责监听 TCP 端口、解析 HTTP 协议、把请求按 ASGI 协议喂给 Starlette/FastAPI。它本身不关心你的业务逻辑。

> 生活类比：你写的 FastAPI 代码是「菜品」，Starlette 是「厨房基础设施」（灶台、抽油烟机），Uvicorn 是「服务员」——把客人点的单（HTTP 请求）传进厨房，再把做好的菜（响应）端给客人。换个服务员（Hypercorn）也行，菜品还是那个菜品。

## 五、部署架构图（文字描述）

一个典型的 FastAPI 生产部署架构是这样的：

\`\`\`
        用户浏览器 / 移动端
              │
              │  HTTPS 请求
              ▼
      ┌──────────────────┐
      │  反向代理 Nginx    │  ← TLS 终结、静态资源、限流、 gzip
      └──────────────────┘
              │
              │  HTTP（内网）
              ▼
      ┌──────────────────┐
      │  ASGI Server      │  ← uvicorn / gunicorn+uvicorn worker
      │  (多 worker 进程) │
      └──────────────────┘
              │
              │  ASGI 协议调用
              ▼
      ┌──────────────────┐
      │  FastAPI App      │  ← 你的业务代码
      └──────────────────┘
              │
              ▼
        数据库 / Redis / 第三方 API
\`\`\`

为什么要在最外层放 Nginx？因为：

1. **TLS 终结**：HTTPS 证书管理集中在 Nginx，后端只跑 HTTP，性能更好。
2. **静态资源**：图片、CSS、JS 直接由 Nginx 吐出，不打到 Python。
3. **限流与防护**：Nginx 层挡掉恶意请求、限速、防 DDoS。
4. **负载均衡**：Nginx 可以反向代理到多个 uvicorn 实例，水平扩展。

## 六、Demo 1：一个最简单的 FastAPI 应用 + uvicorn 启动

先写一个最小可运行的 FastAPI 应用，所有后续 Demo 都基于它。

\`\`\`python
# main.py —— 最简单的 FastAPI 应用
# 启动方式：uvicorn main:app --host 0.0.0.0 --port 8000

# 从 fastapi 包导入 FastAPI 主类
from fastapi import FastAPI

# 创建应用实例（app 这个变量名是约定，uvicorn 用 模块:变量 来定位它）
app = FastAPI()

# 用装饰器注册根路由
@app.get("/")
def root():
    # 返回一个 dict，FastAPI 会自动转成 JSON
    return {"msg": "ok"}

# 健康检查接口（生产环境必备，给负载均衡器探活用）
@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

启动命令：

\`\`\`bash
# uvicorn 是 ASGI 服务器命令
# main:app 表示「main.py 文件里的 app 变量」
# --host 0.0.0.0 监听所有网卡（生产必须，否则只能本机访问）
# --port 8000 监听 8000 端口
uvicorn main:app --host 0.0.0.0 --port 8000
\`\`\`

执行后访问 \`http://localhost:8000/\` 返回 \`{"msg":"ok"}\`，访问 \`http://localhost:8000/docs\` 能看到自动生成的 Swagger 文档。

## 七、Demo 2：启动选项详解

\`uvicorn\` 命令有一堆参数，理解它们才能调优生产配置。

\`\`\`bash
# --reload：代码改动自动重启（开发专用，生产必须关，性能差且有 bug）
uvicorn main:app --reload

# --workers N：开 N 个 worker 进程（生产推荐 2*CPU+1）
# 注意：--workers 和 --reload 不能同时用
uvicorn main:app --workers 4

# --loop：事件循环实现，可选 auto/asyncio/uvloop
# uvloop 是 libuv 的 Python 绑定，比默认 asyncio 快 2-4 倍
uvicorn main:app --loop uvloop

# --http：HTTP 解析器，可选 auto/h11/httptools
# httptools 是 C 实现，比 h11 快很多
uvicorn main:app --http httptools

# --log-level：日志级别，可选 critical/error/warning/info/debug/trace
# 生产一般用 info，调试用 debug
uvicorn main:app --log-level info

# --access-log：开/关访问日志（每条请求一行）
# 高 QPS 场景关掉能省 CPU 和磁盘
uvicorn main:app --no-access-log

# --proxy-headers：信任 X-Forwarded-For 等 proxy 头
# 在 Nginx 后面必须开，否则 FastAPI 看到的客户端 IP 全是 Nginx 的内网 IP
uvicorn main:app --proxy-headers

# --forwarded-allow-ips：允许哪些 IP 传来的 proxy 头
# 默认只信任 127.0.0.1，生产要加上 Nginx 的 IP 段
uvicorn main:app --proxy-headers --forwarded-allow-ips "10.0.0.0/8"
\`\`\`

## 八、Demo 3：用 gunicorn + uvicorn worker 启动

uvicorn 自己也能多进程（\`--workers\`），但 gunicorn 在进程管理上更成熟——平滑重启、信号处理、worker 复活都做得更好。生产部署常用「gunicorn 当爹，uvicorn 当娃」的组合。

\`\`\`bash
# 先安装 gunicorn 和 uvicorn 的 worker 扩展
pip install gunicorn uvicorn[standard]

# gunicorn main:app：指定应用
# -w 4：4 个 worker 进程
# -k uvicorn.workers.UvicornWorker：worker 类型用 uvicorn 提供的异步 worker
# -b 0.0.0.0:8000：监听地址
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
\`\`\`

为什么不直接用 \`uvicorn --workers 4\`？

- gunicorn 的**平滑重启**（SIGHUP）更可靠：老 worker 处理完手头请求再退，新 worker 同时启动，服务不中断。
- gunicorn 的 **worker 健康检查**：worker 卡死会自动 kill 重启。
- gunicorn 的**热升级**（USR2）：能在不停服的情况下换二进制。

> 生活类比：uvicorn 自己开多进程像「四兄弟合伙开店」，互相各干各的，一个病了没人顶；gunicorn + uvicorn worker 像「店长 + 四个员工」，店长负责排班、生病顶替、换班不停业。

## 九、Demo 4：Hypercorn 替代方案

Uvicorn 不是唯一的 ASGI server。**Hypercorn** 是另一个选择，它的卖点是多协议支持——HTTP/2、HTTP/3（QUIC）、WebSocket 都支持。

\`\`\`bash
# 安装 hypercorn（注意是 hypercorn 不是 hypercorn[standard]）
pip install hypercorn

# 基础启动
# hypercorn main:app 表示「main.py 里的 app」
hypercorn main:app

# 指定绑定地址
# -b 等价于 --bind
hypercorn main:app -b 0.0.0.0:8000

# 开启 HTTP/2（需要 SSL）
# HTTP/2 必须跑在 HTTPS 上
hypercorn main:app -b 0.0.0.0:8443 --certfile cert.pem --keyfile key.pem

# 开启 HTTP/3（QUIC，基于 UDP）
# --quic 参数启用 UDP 8443 端口
hypercorn main:app -b 0.0.0.0:8443 --quic --certfile cert.pem --keyfile key.pem

# 多 worker
# -w 4 等价于 --workers 4
hypercorn main:app -b 0.0.0.0:8000 -w 4
\`\`\`

什么场景选 Hypercorn？

- 需要 HTTP/2 或 HTTP/3（比如要给移动端做长连接复用）。
- 不想用 Nginx 做前置代理，想直接让 ASGI server 处理 TLS。

什么场景不选 Hypercorn？

- 单纯追求 HTTP/1.1 性能：uvicorn + uvloop 更快。
- 想要成熟的进程管理：gunicorn 更稳。

## 十、Demo 5：部署架构选择

部署形态从简单到复杂有四种典型方案：

**方案 A：单机直接 uvicorn**

\`\`\`
[用户] → [uvicorn 进程] → [FastAPI]
\`\`\`

适用：内部工具、demo、低流量个人项目。优点是简单到一行命令搞定。缺点是无冗余，进程崩了服务就没了。

**方案 B：单机 gunicorn + Nginx**

\`\`\`
[用户] → [Nginx] → [gunicorn 多 worker] → [FastAPI]
\`\`\`

适用：中小型生产项目、日活几千到几万。Nginx 挡 TLS 和静态资源，gunicorn 多 worker 抗并发。这是最推荐的起步方案。

**方案 C：多机 + 负载均衡**

\`\`\`
                ┌─ [机器1: gunicorn]
[用户] → [Nginx/LB] ─┼─ [机器2: gunicorn]
                └─ [机器3: gunicorn]
\`\`\`

适用：日活几十万到百万。负载均衡器（Nginx、HAProxy、云厂商 SLB）把流量分发到多台机器。一台挂了，流量自动切到其他机器。

**方案 D：容器 + K8s**

\`\`\`
[用户] → [Ingress] → [K8s Service] → [Pod1: FastAPI 容器]
                                   → [Pod2: FastAPI 容器]
                                   → [PodN: FastAPI 容器]
\`\`\`

适用：日活百万以上、需要弹性伸缩、灰度发布、多环境一致。复杂度最高，需要专门的运维。

> 生活类比：方案 A 是「路边摊」一个人搞定；方案 B 是「小餐馆」一个店长加几个员工；方案 C 是「连锁店」多家分店统一调度；方案 D 是「全国连锁加盟」中央厨房统一配送、随时开店关店。

## 十一、ASGI Server 对比表

| 特性 | Uvicorn | Hypercorn | Daphne |
|---|---|---|---|
| 出身 | Starlette 团队出品 | 独立项目，quart 作者 | Django Channels 团队 |
| 性能 | 最高（uvloop+httptools） | 高 | 中 |
| HTTP/2 | 不支持（需配 Nginx） | 支持 | 不支持 |
| HTTP/3 | 不支持 | 支持 | 不支持 |
| WebSocket | 支持 | 支持 | 支持 |
| 多进程 | 内置 \`--workers\` | 内置 \`-w\` | 不内置（需配合 supervisor） |
| 进程管理 | 弱 | 弱 | 弱 |
| 推荐搭配 | gunicorn + UvicornWorker | 独立使用 | Django Channels |

Daphne 主要是 Django 生态在用，FastAPI 项目基本只在 Uvicorn 和 Hypercorn 之间选。绝大多数情况选 Uvicorn，需要 HTTP/2/3 才考虑 Hypercorn。

## 本章小结

| 知识点 | 要点 |
|---|---|
| ASGI 定义 | 异步服务器网关接口，Python 异步 Web 的插座标准 |
| ASGI vs WSGI | 同步阻塞 vs 异步协程，WSGI 不支持 WebSocket |
| 三层结构 | FastAPI（业务）→ Starlette（ASGI 框架）→ Uvicorn（ASGI 服务器） |
| 部署架构 | 客户端 → Nginx → ASGI Server → FastAPI → DB |
| 启动命令 | \`uvicorn main:app --host 0.0.0.0 --port 8000\` |
| 关键参数 | --workers / --loop / --http / --proxy-headers |
| gunicorn+uvicorn | 生产推荐，进程管理更稳 |
| Hypercorn | 需要 HTTP/2/3 时选 |
| 部署方案 | 单机/单机+nginx/多机+LB/容器+K8s |
| Nginx 角色 | TLS 终结、静态资源、限流、负载均衡 |
`
  },

  // ============================================================
  // 第 2 章：uvicorn 生产配置
  // ============================================================
  {
    id: "ft-uvicorn",
    group: "部署基础",
    icon: "🚀",
    title: "uvicorn 生产配置",
    content: `# uvicorn 生产配置

## 一、uvicorn 简介

uvicorn 是目前 Python 生态里**最快的 ASGI server 之一**，也是 FastAPI 官方文档默认推荐。它的名字来自两个核心依赖：

- **uvloop**：libuv（Node.js 的事件循环底层库）的 Python 绑定，性能比标准库 \`asyncio\` 高 2-4 倍。
- **httptools**：Node.js 的 http-parser C 库的 Python 绑定，HTTP 协议解析比纯 Python 实现快一个数量级。

这两个加起来让 uvicorn 在基准测试里能跑到几万 RPS（每秒请求数），远超基于纯 Python 的实现。

uvicorn 的特点：

1. **轻量**：核心代码不多，专注做一件事——ASGI server。
2. **快**：uvloop + httptools 组合性能顶级。
3. **支持 HTTP/1.1 和 WebSocket**：足够绝大多数场景。
4. **可作 gunicorn worker**：和 gunicorn 组合获得进程管理能力。

> 生活类比：uvicorn 像一台「改装过的跑车」——换了赛车轮胎（uvloop）和高性能引擎（httptools），轻量化车身，专门跑 HTTP 这条赛道，又快又稳。

## 二、Demo 1：基础启动命令

最简启动一行命令：

\`\`\`bash
# main:app 表示「main.py 文件里的 app 变量」
# 这是 uvicorn 唯一必填的参数
uvicorn main:app

# 默认 host 是 127.0.0.1（只能本机访问）
# 默认 port 是 8000
# 想让其他机器能访问，必须指定 --host 0.0.0.0
uvicorn main:app --host 0.0.0.0 --port 8000
\`\`\`

启动后控制台会输出：

\`\`\`
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
\`\`\`

按 \`Ctrl+C\` 优雅停止。

## 三、Demo 2：生产配置（无 --reload，开 --workers）

开发时用 \`--reload\`，生产**必须关掉**。原因：

1. \`--reload\` 内部用 watchfiles 监控整个目录，每次文件变化都要扫描、比较、重启，CPU 浪费严重。
2. \`--reload\` 和 \`--workers\` 互斥，不能同时多进程。
3. 偶尔有 reload 卡死、内存泄漏的 bug。

\`\`\`bash
# 生产配置示例
# --host 0.0.0.0：监听所有网卡
# --port 8000：监听端口
# --workers 4：开 4 个 worker 进程（推荐 2*CPU+1）
# --no-access-log：关闭访问日志（高 QPS 场景省 CPU）
# --proxy-headers：信任 X-Forwarded-* 头（在 Nginx 后面必须开）
# --forwarded-allow-ips：允许哪些 IP 的 proxy 头，默认只信任 127.0.0.1
uvicorn main:app \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --workers 4 \\
  --no-access-log \\
  --proxy-headers \\
  --forwarded-allow-ips "10.0.0.0/8" \\
  --log-level info
\`\`\`

\`--no-access-log\` 什么时候开？

- QPS 上千、访问日志写到磁盘成瓶颈时开。
- 配了 APM（如 datadog、sentry）已经在收集请求指标，本地访问日志冗余时开。
- 调试期、低流量服务**不要开**，访问日志是排查问题的重要依据。

## 四、Demo 3：用配置文件启动

命令行参数一多就难维护。uvicorn 支持用 Python 文件做配置。

\`\`\`python
# uvicorn_config.py —— uvicorn 配置文件
# 注意：这是一个普通 Python 模块，里面是模块级变量

# app：应用路径（字符串形式）
app = "main:app"

# host：监听地址
host = "0.0.0.0"

# port：监听端口
port = 8000

# workers：worker 进程数
workers = 4

# loop：事件循环，uvloop 比 asyncio 快
loop = "uvloop"

# http：HTTP 解析器，httptools 比 h11 快
http = "httptools"

# reload：生产关掉
reload = False

# log_level：日志级别
log_level = "info"

# access_log：是否记录访问日志
access_log = True

# proxy_headers：信任反代头
proxy_headers = True

# forwarded_allow_ips：允许的代理 IP 列表
forwarded_allow_ips = ["10.0.0.0/8", "127.0.0.1"]

# timeout_keep_alive：keep-alive 超时秒数，5 秒够用
timeout_keep_alive = 5

# limit_concurrency：最大并发连接数，超过返回 503
limit_concurrency = 1000

# limit_max_requests：处理多少请求后重启 worker（防内存泄漏）
limit_max_requests = 10000

# graceful_shutdown：优雅关闭超时，秒
timeout_graceful_shutdown = 30
\`\`\`

启动方式（两种）：

\`\`\`bash
# 方式 1：用 --config 指定配置文件
uvicorn --config uvicorn_config.py

# 方式 2：把配置当模块导入（注意此时 app 已经在配置里指定）
# 这种方式 uvicorn 会读取配置里的 app 字段
uvicorn uvicorn_config:app
\`\`\`

实际项目里推荐**方式 1**，更明确表达「用这个配置文件启动」。

## 五、Demo 4：uvloop + httptools 性能优化

uvicorn 默认会用 \`auto\`，能装就装 uvloop/httptools，没装就回退到 asyncio/h11。但**显式指定**更安全。

\`\`\`bash
# 安装可选依赖
# uvloop 是 C 扩展，安装时需要编译，建议用预编译 wheel
pip install uvloop httptools

# 显式指定
uvicorn main:app --loop uvloop --http httptools

# 验证当前用的什么
# 启动日志会显示
# "Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)"
# 看不到 loop/http 信息，但可以加 --log-level debug 看详细
uvicorn main:app --loop uvloop --http httptools --log-level debug
\`\`\`

性能差异有多大？在一个简单的 \`GET /\` 返回 JSON 的基准测试里：

| 配置 | RPS |
|---|---|
| asyncio + h11 | ~10000 |
| uvloop + h11 | ~18000 |
| asyncio + httptools | ~15000 |
| **uvloop + httptools** | **~25000** |

> 注意：uvloop 在 macOS 上是支持的，但在 Windows 上**不支持**。Windows 只能用 asyncio。如果用 WSL2 则可以装 uvloop。

## 六、Demo 5：SSL/HTTPS 直接用 uvicorn（开发用）

开发 HTTPS 时不想配 Nginx，可以直接让 uvicorn 处理 TLS。

\`\`\`bash
# 先生成自签名证书（仅开发用，浏览器会警告不安全）
# openssl req -x509：生成自签名证书
# -newkey rsa:2048：生成 2048 位 RSA 密钥
# -keyout key.pem：私钥输出文件
# -out cert.pem：证书输出文件
# -days 365：有效期 365 天
# -nodes：不加密私钥
# -subj：证书主题（不交互输入）
openssl req -x509 -newkey rsa:2048 \\
  -keyout key.pem -out cert.pem \\
  -days 365 -nodes \\
  -subj "/CN=localhost"

# 用 uvicorn 启动 HTTPS
# --ssl-keyfile：私钥文件
# --ssl-certfile：证书文件
uvicorn main:app --host 0.0.0.0 --port 8443 \\
  --ssl-keyfile ./key.pem \\
  --ssl-certfile ./cert.pem

# 访问 https://localhost:8443（浏览器会警告证书不受信任）
\`\`\`

生产**不要**这么用。原因：

1. uvicorn 处理 TLS 比 Nginx 慢（Nginx 用 OpenSSL 优化得极致）。
2. 证书续期（Let's Encrypt 90 天过期）不方便集中管理。
3. 多个后端实例要重复配证书。

正确做法：Nginx 做 TLS 终结，后端跑 HTTP。

## 七、Demo 6：平滑重启和优雅关闭

生产环境更新代码不能直接 \`kill -9\`——那会让正在处理的请求直接断掉，用户看到 502。要**优雅关闭**。

**优雅关闭（SIGTERM）**：

\`\`\`bash
# 找到 uvicorn 主进程 PID
# 假设 PID 是 12345
kill -TERM 12345
# 或简写
kill 12345

# uvicorn 收到 SIGTERM 后：
# 1. 停止接受新连接
# 2. 等正在处理的请求完成（最多等 timeout_graceful_shutdown 秒）
# 3. 关闭所有 worker
# 4. 退出
\`\`\`

**强制关闭（SIGKILL）**：

\`\`\`bash
# 立即杀掉，不管有没有正在处理的请求
kill -9 12345
# 这是最后手段，正常情况不要用
\`\`\`

**uvicorn 自己没有真正的「平滑重启」**——它的 \`--reload\` 是开发用的。要平滑重启生产服务，要么用 gunicorn（见下一章），要么用外部进程管理器（systemd、supervisor、Docker）。

\`\`\`bash
# 用 systemd 平滑重启
# systemctl reload 命令会发 SIGHUP，但 uvicorn 不支持 reload 信号
# 所以 systemd 实际是 restart（先停再起），有几秒服务中断
sudo systemctl restart myapi

# 真正零中断重启需要双实例 + 负载均衡切换
# 这超出 uvicorn 本身能力，需要 gunicorn 或 K8s rolling update
\`\`\`

## 八、Demo 7：日志配置

uvicorn 默认的日志格式是：

\`\`\`
INFO:     127.0.0.1:54321 - "GET / HTTP/1.1" 200 OK
\`\`\`

这种格式人不友好、机器也不友好。生产环境推荐**结构化日志**（JSON 格式），方便 ELK/Loki 等日志系统解析。

\`\`\`python
# log_config.py —— 自定义日志配置

# 导入 logging.config 模块
import logging.config

# 定义 dictConfig 配置
# uvicorn 的 logger 名字是 "uvicorn"、"uvicorn.error"、"uvicorn.access"
log_config = {
    # version 固定值
    "version": 1,

    # disable_existing_loggers：False 表示不禁止已存在的 logger
    "disable_existing_loggers": False,

    # formatters：定义日志格式
    "formatters": {
        # JSON 格式，方便日志系统解析
        "json": {
            "format": '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
        },
        # 人类可读格式（控制台用）
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        },
    },

    # handlers：日志输出目的地
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "stream": "ext://sys.stdout",
        },
    },

    # loggers：具体的 logger 配置
    "loggers": {
        "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["console"], "level": "INFO"},
        "uvicorn.access": {"handlers": ["console"], "level": "INFO"},
    },
}

# 应用配置
logging.config.dictConfig(log_config)
\`\`\`

让 uvicorn 用这个配置启动：

\`\`\`bash
# --log-config 指定日志配置文件
# 支持 .py / .json / .yaml 格式
uvicorn main:app --log-config log_config.py
\`\`\`

**集成 loguru**（更现代的日志库）：

\`\`\`python
# loguru_integration.py —— 把 uvicorn 日志接到 loguru

# 从 loguru 导入 logger
from loguru import logger

# 导入标准 logging 模块
import logging

# 定义一个 handler 类，把标准 logging 的记录转发给 loguru
class InterceptHandler(logging.Handler):
    def emit(self, record):
        # 把 record 转成 loguru 格式
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        # 找到真正的调用位置
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1
        # 用 loguru 输出
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

# 替换 uvicorn 的 handler
logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

# 显式拦截 uvicorn 三个 logger
for name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
    logging.getLogger(name).handlers = [InterceptHandler()]
\`\`\`

然后在 \`main.py\` 里 import 一下这个文件，启动 uvicorn 就会看到 loguru 风格的彩色日志。

## 九、uvicorn 关键参数表

| 参数 | 默认值 | 说明 |
|---|---|---|
| --host | 127.0.0.1 | 监听地址 |
| --port | 8000 | 监听端口 |
| --workers | 1 | worker 进程数 |
| --loop | auto | 事件循环（auto/asyncio/uvloop） |
| --http | auto | HTTP 解析器（auto/h11/httptools） |
| --reload | False | 代码改动自动重启（开发用） |
| --reload-dir | . | 监控的目录（可多次指定） |
| --log-level | info | 日志级别 |
| --access-log | True | 访问日志开关 |
| --proxy-headers | False | 信任 X-Forwarded-* 头 |
| --forwarded-allow-ips | 127.0.0.1 | 允许的代理 IP |
| --ssl-keyfile | None | SSL 私钥文件 |
| --ssl-certfile | None | SSL 证书文件 |
| --timeout-keep-alive | 5 | keep-alive 超时秒数 |
| --limit-concurrency | None | 最大并发连接数 |
| --limit-max-requests | None | 处理多少请求后重启 |
| --timeout-graceful-shutdown | 30 | 优雅关闭超时 |
| --no-access-log | - | 关闭访问日志 |
| --config | None | 配置文件路径 |

## 本章小结

| 知识点 | 要点 |
|---|---|
| uvicorn 组成 | uvloop（事件循环）+ httptools（HTTP 解析） |
| 性能优势 | uvloop+httptools 比纯 Python 快 2-4 倍 |
| 生产配置 | 关 --reload、开 --workers、开 --proxy-headers |
| 配置文件 | 用 Python 文件，\`uvicorn --config xxx.py\` 启动 |
| HTTPS | 开发用 --ssl-keyfile/certfile，生产用 Nginx |
| 优雅关闭 | kill -TERM，等请求处理完再退 |
| 平滑重启 | uvicorn 自身不支持，靠 gunicorn 或外部工具 |
| 日志配置 | 用 dictConfig 自定义，推荐 JSON 结构化日志 |
| loguru 集成 | 用 InterceptHandler 把 uvicorn 日志转发给 loguru |
| Windows 限制 | uvloop 不支持 Windows，只能用 asyncio |
`
  },

  // ============================================================
  // 第 3 章：gunicorn + uvicorn workers
  // ============================================================
  {
    id: "ft-gunicorn",
    group: "部署基础",
    icon: "⚙️",
    title: "gunicorn + uvicorn workers",
    content: `# gunicorn + uvicorn workers

## 一、gunicorn 简介

gunicorn（Green Unicorn）是 Python 生态里最成熟的**WSGI 进程管理器**，从 2009 年到现在用了十几年，久经考验。它的核心职责是：

1. **预 fork 多个 worker 进程**：一个 master + N 个 worker，master 不处理请求，只管 worker。
2. **worker 类型可插拔**：能跑 WSGI（sync、gevent），也能跑 ASGI（uvicorn worker）。
3. **信号驱动的进程管理**：SIGHUP 平滑重启、USR2 热升级、SIGTERM 优雅关闭。
4. **worker 健康监控**：worker 卡死自动 kill 重启。

gunicorn 本身是 WSGI server，不能直接跑 FastAPI。但通过 \`-k uvicorn.workers.UvicornWorker\`，让每个 worker 内部跑一个 uvicorn 实例，就能跑 ASGI 应用了。这种组合叫「gunicorn 当 master，uvicorn 当 worker」。

> 生活类比：gunicorn 像「车间主任」，自己不干活，专门盯着工人（worker）有没有偷懒、有没有晕倒；uvicorn worker 像「工人」，真正在流水线上组装产品。主任 + 工人的组合比让工人自己管自己靠谱多了。

## 二、为什么用 gunicorn 而不是 uvicorn --workers

uvicorn 自己也能开多进程（\`uvicorn --workers 4\`），但生产环境为什么更推荐 gunicorn？

| 能力 | uvicorn --workers | gunicorn + uvicorn worker |
|---|---|---|
| 多进程 | 有 | 有 |
| 平滑重启 | 没有（要重启服务） | 有（SIGHUP，老 worker 处理完再退，新 worker 同步启动） |
| 热升级二进制 | 没有 | 有（USR2，不停服换 gunicorn 版本） |
| worker 卡死自动重启 | 弱 | 强（定时心跳，超时 kill） |
| worker 数量动态调整 | 没有 | 有（TTIN/TTOU 信号加减 worker） |
| 优雅关闭 | 有 | 有（更成熟） |
| 配置文件 | Python | Python（功能更丰富） |

简单说：**uvicorn --workers 能用，但 gunicorn 更稳**。生产环境稳定第一，多花几行配置换来的进程管理能力非常划算。

## 三、Demo 1：基础启动

\`\`\`bash
# 安装
# gunicorn 是主程序
# uvicorn[standard] 提供 UvicornWorker 类
pip install gunicorn "uvicorn[standard]"

# 启动命令
# gunicorn：主程序
# main:app：应用路径（模块:变量）
# -w 4：4 个 worker 进程
# -k uvicorn.workers.UvicornWorker：worker 类型用 uvicorn
# -b 0.0.0.0:8000：监听地址
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 后台运行（生产用 systemd/docker 管理，不用 daemon）
# --daemon 让 gunicorn 后台运行
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --daemon
\`\`\`

启动日志：

\`\`\`
[2024-01-01 12:00:00 +0800] [12345] [INFO] Starting gunicorn 21.2.0
[2024-01-01 12:00:00 +0800] [12345] [INFO] Listening at: http://0.0.0.0:8000 (12345)
[2024-01-01 12:00:00 +0800] [12345] [INFO] Using worker: uvicorn.workers.UvicornWorker
[2024-01-01 12:00:00 +0800] [12346] [INFO] Booting worker with pid: 12346
[2024-01-01 12:00:00 +0800] [12347] [INFO] Booting worker with pid: 12347
[2024-01-01 12:00:00 +0800] [12348] [INFO] Booting worker with pid: 12348
[2024-01-01 12:00:00 +0800] [12349] [INFO] Booting worker with pid: 12349
\`\`\`

第一个 PID 是 master，后面 4 个是 worker。

## 四、Demo 2：gunicorn 配置文件

命令行参数多了难维护，gunicorn 支持用 Python 文件做配置。

\`\`\`python
# gunicorn_conf.py —— gunicorn 生产配置

# bind：监听地址，可以是多个
bind = "0.0.0.0:8000"

# workers：worker 进程数
# 推荐公式：2 * CPU + 1
workers = 4

# worker_class：worker 类型
# uvicorn.workers.UvicornWorker 性能最好（uvloop+httptools）
# uvicorn.workers.UvicornH11Worker 纯 Python，兼容性好但慢
worker_class = "uvicorn.workers.UvicornWorker"

# timeout：worker 处理单个请求的超时秒数
# 超过这个时间 worker 会被 kill 重启
# 默认 30 秒，如果有长任务要调大
timeout = 120

# graceful_timeout：优雅关闭时等 worker 多少秒
# 超过就强制 kill
graceful_timeout = 30

# keepalive：TCP keep-alive 秒数
# 5 秒足够，太长会占连接
keepalive = 5

# max_requests：worker 处理多少请求后重启
# 防内存泄漏（Python 长跑容易漏）
max_requests = 1000

# max_requests_jitter：max_requests 的随机抖动
# 避免所有 worker 同时重启造成服务抖动
# 50 表示 0~50 之间的随机数加到 max_requests 上
max_requests_jitter = 50

# preload_app：是否在 fork 之前加载应用
# True：master 先加载一次代码，worker 共享（省内存、启动快）
# False：每个 worker 各自加载（隔离性好，但慢）
# 推荐 True，但要确保代码是 fork-safe 的（没有全局锁、文件句柄等）
preload_app = True

# accesslog：访问日志输出
# "-" 表示 stdout
# "/var/log/api-access.log" 写文件
accesslog = "-"

# errorlog：错误日志输出
errorlog = "-"

# loglevel：日志级别
loglevel = "info"

# proc_name：进程名（ps aux 看到的名字）
# 方便运维识别
proc_name = "myapi"

# forwarded_allow_ips：信任的代理 IP
# 在 Nginx 后面要配置
forwarded_allow_ips = ["10.0.0.0/8", "127.0.0.1"]

# worker_connections：每个 worker 的最大并发连接数
# 仅对异步 worker（uvicorn worker）有效
worker_connections = 1000
\`\`\`

启动：

\`\`\`bash
# -c 指定配置文件
gunicorn -c gunicorn_conf.py main:app
\`\`\`

## 五、Demo 3：workers 数量计算公式

gunicorn 官方推荐的 worker 数量公式是：

\`\`\`
workers = 2 * CPU + 1
\`\`\`

为什么是这个公式？

- 异步 worker（uvicorn worker）单进程能扛几千并发，但**CPU 密集任务**会让事件循环卡住。所以 CPU 密集型应用需要更多 worker。
- 2*CPU 让每个 CPU 平均跑 2 个 worker，留 1 个余量应对突发。
- 不是越多越好——worker 太多会争抢 CPU，反而变慢。

\`\`\`python
# dynamic_workers.py —— 动态计算 worker 数

import multiprocessing

# 获取 CPU 核心数
cpu_count = multiprocessing.cpu_count()

# 套用 2*CPU+1 公式
workers = cpu_count * 2 + 1

print(f"CPU 核心数: {cpu_count}")
print(f"推荐 worker 数: {workers}")
\`\`\`

在配置文件里直接算：

\`\`\`python
# gunicorn_conf.py —— 动态 worker 数
import multiprocessing

# 直接在配置文件里算
workers = multiprocessing.cpu_count() * 2 + 1
\`\`\`

**何时偏离公式**：

- **IO 密集型**（纯 API 代理、查 Redis）：worker 可以少一点，甚至 1-2 个就够，因为协程能扛并发。
- **CPU 密集型**（图片处理、加密计算）：worker 可以多一点，但不超过 CPU 核心数的 4 倍。
- **内存敏感**：每个 worker 占内存，机器内存小要减 worker。

## 六、Demo 4：UvicornWorker vs UvicornH11Worker

uvicorn 提供两个 worker 类：

\`\`\`bash
# UvicornWorker：用 uvloop + httptools（如果装了）
# 性能最好，生产推荐
-k uvicorn.workers.UvicornWorker

# UvicornH11Worker：强制用 asyncio + h11（纯 Python）
# 性能差，但兼容性好（某些 C 扩展装不上的环境用）
-k uvicorn.workers.UvicornH11Worker
\`\`\`

性能对比（同样的 \`GET /\` 返回 JSON）：

| worker 类型 | RPS |
|---|---|
| UvicornWorker (uvloop+httptools) | ~25000 |
| UvicornWorker (asyncio+h11，没装 C 扩展) | ~10000 |
| UvicornH11Worker | ~10000 |

**绝大多数情况用 UvicornWorker**。只在以下情况考虑 H11Worker：

- 部署在不支持 uvloop 的平台（如某些精简版 Linux 没 libuv）。
- C 扩展编译失败（musl libc 的 alpine 镜像需要装 build-base）。

## 七、Demo 5：平滑重启（SIGHUP）和热升级（USR2）

这是 gunicorn 相比 uvicorn 的最大优势。

**平滑重启（SIGHUP）**：

更新代码后，发 SIGHUP 给 master：

\`\`\`bash
# 假设 master PID 是 12345
kill -HUP 12345

# gunicorn 收到 SIGHUP 后：
# 1. master 重新加载配置
# 2. 启动新 worker（用新代码）
# 3. 老 worker 收到信号，停止接受新请求
# 4. 老 worker 处理完手头请求后退出
# 5. 整个过程服务不中断
\`\`\`

日志会显示：

\`\`\`
[INFO] Handling signal: hup
[INFO] Booting worker with pid: 12500
[INFO] Booting worker with pid: 12501
[INFO] Booting worker with pid: 12502
[INFO] Booting worker with pid: 12503
[INFO] Worker exiting (pid: 12346)
[INFO] Worker exiting (pid: 12347)
\`\`\`

**热升级二进制（USR2）**：

升级 gunicorn 自身版本时用，不停服换 master：

\`\`\`bash
# 假设 master PID 是 12345
kill -USR2 12345

# gunicorn 收到 USR2 后：
# 1. 老 master 改名为 .oldbin 后缀
# 2. 启动新 master（用新二进制）
# 3. 新 master 启动自己的 worker
# 4. 老 master 的 worker 优雅退出
# 5. 整个过程服务不中断
\`\`\`

确认新版本稳定后，杀掉老 master：

\`\`\`bash
# 老 master 的 PID 文件会变成 xxx.oldbin
# 找到老 master PID（假设 12345）
kill -QUIT 12345
\`\`\`

回滚：发 \`kill -HUP 老_master_pid\` 让老 master 重新拉起 worker。

## 八、Demo 6：优雅关闭（SIGTERM）

\`\`\`bash
# 给 master 发 SIGTERM（kill 默认就是 TERM）
kill -TERM 12345
# 或简写
kill 12345

# gunicorn 收到 SIGTERM 后：
# 1. master 停止接受新连接
# 2. 给所有 worker 发 SIGTERM
# 3. worker 停止接受新请求，等手头请求完成
# 4. graceful_timeout 秒后还没退的 worker 强制 kill
# 5. master 退出
\`\`\`

**强制关闭**：

\`\`\`bash
# SIGINT（Ctrl+C）
kill -INT 12345

# SIGKILL（最后手段，立即杀，不管请求）
kill -9 12345
\`\`\`

**worker 数量动态调整**（调试用）：

\`\`\`bash
# TTIN：增加一个 worker
kill -TTIN 12345

# TTOU：减少一个 worker
kill -TTOU 12345
\`\`\`

## 九、Demo 7：用 Docker 部署 gunicorn

Dockerfile：

\`\`\`dockerfile
# 基础镜像：python 3.11 slim 版（体积小）
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 先复制依赖文件（利用 Docker 缓存层）
COPY requirements.txt .

# 安装依赖
# --no-cache-dir：不缓存 pip 下载，减小镜像体积
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY . .

# 暴露端口（仅声明，实际映射在 docker run 时指定）
EXPOSE 8000

# 启动命令
# 用 gunicorn 配置文件启动
CMD ["gunicorn", "-c", "gunicorn_conf.py", "main:app"]
\`\`\`

requirements.txt 示例：

\`\`\`txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
gunicorn==21.2.0
\`\`\`

构建和运行：

\`\`\`bash
# 构建镜像
# -t myapi:latest：打标签
docker build -t myapi:latest .

# 运行容器
# -d：后台运行
# -p 8000:8000：端口映射（宿主:容器）
# --name myapi：容器名
docker run -d -p 8000:8000 --name myapi myapi:latest

# 查看日志
docker logs -f myapi

# 平滑重启容器内的 gunicorn
# 先找到容器内 gunicorn master 的 PID
docker exec myapi pgrep -f gunicorn | head -1
# 假设输出 1（容器里 master 通常是 PID 1）
docker exec myapi kill -HUP 1
\`\`\`

## 十、gunicorn 关键参数表

| 参数 | 配置文件字段 | 默认值 | 说明 |
|---|---|---|---|
| -b, --bind | bind | 127.0.0.1:8000 | 监听地址 |
| -w, --workers | workers | 1 | worker 进程数 |
| -k, --worker-class | worker_class | sync | worker 类型 |
| -c, --config | - | None | 配置文件 |
| --timeout | timeout | 30 | 请求超时秒数 |
| --graceful-timeout | graceful_timeout | 30 | 优雅关闭超时 |
| --keep-alive | keepalive | 2 | keep-alive 秒数 |
| --max-requests | max_requests | 0 | 重启请求数（0 不重启） |
| --max-requests-jitter | max_requests_jitter | 0 | 随机抖动 |
| --preload | preload_app | False | fork 前加载应用 |
| --access-logfile | accesslog | None | 访问日志 |
| --error-logfile | errorlog | None | 错误日志 |
| --log-level | loglevel | info | 日志级别 |
| --daemon | daemon | False | 后台运行 |
| --pid | pidfile | None | PID 文件 |
| --worker-connections | worker_connections | 1000 | 每 worker 连接数（异步） |
| --forwarded-allow-ips | forwarded_allow_ips | 127.0.0.1 | 信任的代理 IP |

## 本章小结

| 知识点 | 要点 |
|---|---|
| gunicorn 角色 | WSGI/ASGI 进程管理器，master+worker 结构 |
| 为什么用 gunicorn | 平滑重启、热升级、worker 监控比 uvicorn 强 |
| 基础启动 | \`gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker\` |
| 配置文件 | Python 文件，\`-c gunicorn_conf.py\` |
| worker 公式 | 2 * CPU + 1，IO 密集可少、CPU 密集可多 |
| UvicornWorker vs H11Worker | 前者快（uvloop），后者兼容性好 |
| SIGHUP | 平滑重启，新 worker 上线、老 worker 优雅退出 |
| USR2 | 热升级二进制，不停服换 gunicorn 版本 |
| SIGTERM | 优雅关闭，等请求处理完 |
| TTIN/TTOU | 动态加减 worker 数 |
| Docker 部署 | CMD 用 gunicorn -c 启动，PID 1 是 master |
`
  },

  // ============================================================
  // 第 4 章：Docker 容器化部署
  // ============================================================
  {
    id: "ft-docker",
    group: "部署基础",
    icon: "🐳",
    title: "Docker 容器化部署",
    content: `# Docker 容器化部署

## 一、Docker 简介

Docker 是目前最主流的**容器化部署标准**。容器是一种轻量级的虚拟化技术——把应用和它的所有依赖（Python 解释器、pip 包、系统库、配置文件）打包成一个独立单元，能在任何装了 Docker 的机器上以相同方式运行。

容器 vs 传统部署：

| 维度 | 传统部署 | Docker 部署 |
|---|---|---|
| 环境一致性 | 「在我机器上能跑」 | 镜像一致，到处一样 |
| 隔离性 | 多个应用争抢系统 Python | 每个容器独立环境 |
| 启动速度 | 装依赖几分钟 | 拉镜像秒级 |
| 资源占用 | 虚拟机 GB 级 | 容器 MB 级 |
| 扩缩容 | 手动配机器 | docker run / K8s scale |

容器 vs 虚拟机：

- 虚拟机模拟整套硬件，跑一个完整操作系统，重。
- 容器共享宿主内核，只隔离用户态进程，轻。
- 虚拟机启动几十秒，容器启动不到一秒。

> 生活类比：Docker 镜像就像「快递包裹」——把商品（代码）、说明书（依赖）、配件（配置）全打包在一个盒子里，不管寄到北京还是纽约，收件人拆开就能用，不用关心对方家里有没有同款电池。传统部署像「让别人自己去买零件组装」，每家组装出来的可能都不一样。

## 二、Demo 1：最简 Dockerfile

Dockerfile 是构建镜像的「菜谱」。一个最小的 FastAPI 镜像 Dockerfile：

\`\`\`dockerfile
# 基础镜像：Python 3.11 slim 版（体积小，约 150MB）
# slim 比 full（约 900MB）小很多，比 alpine 兼容性好
FROM python:3.11-slim

# 设置工作目录
# 后续所有命令都在这个目录下执行
WORKDIR /app

# 先复制依赖文件
# 这一步单独做是为了利用 Docker 缓存层
# 如果代码变了但 requirements.txt 没变，这一层不会重新执行
COPY requirements.txt .

# 安装依赖
# --no-cache-dir：不缓存 pip 下载，减小镜像体积
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
# 放最后，因为代码最常变
COPY . .

# 暴露端口
# 仅声明，实际映射在 docker run -p 时指定
EXPOSE 8000

# 启动命令
# 用 exec 形式（JSON 数组），能正确接收 SIGTERM 信号
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

requirements.txt 示例：

\`\`\`txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
\`\`\`

构建和运行：

\`\`\`bash
# 构建镜像
# -t myapi:latest：给镜像打标签（名:版本）
# . ：构建上下文（当前目录）
docker build -t myapi:latest .

# 运行容器
# -d：后台运行
# -p 8000:8000：端口映射（宿主端口:容器端口）
# --name api：容器名
docker run -d -p 8000:8000 --name api myapi:latest

# 测试
curl http://localhost:8000/
\`\`\`

## 三、Demo 2：多阶段构建（减小镜像体积）

上面的 Dockerfile 把构建工具和运行时依赖都装在一个镜像里，体积大。多阶段构建用「一个镜像编译、另一个镜像运行」的方式优化。

\`\`\`dockerfile
# 阶段 1：builder，用来装依赖
FROM python:3.11-slim AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖到用户目录
# --user：装到 /root/.local 而不是系统目录
# 这样下一阶段可以只复制这个目录
RUN pip install --no-cache-dir --user -r requirements.txt

# 阶段 2：运行时镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制已安装的依赖
# --from=builder：从 builder 阶段复制
# /root/.local：builder 里 pip --user 装的位置
# /root/.local：复制到本阶段同样的位置
COPY --from=builder /root/.local /root/.local

# 复制项目代码
COPY . .

# 把用户 bin 目录加到 PATH
# 这样能找到 uvicorn 等 .local/bin 下的命令
ENV PATH=/root/.local/bin:$PATH

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

体积对比：

| 方案 | 镜像大小 |
|---|---|
| 单阶段 python:3.11-slim | ~250MB |
| 多阶段 python:3.11-slim | ~200MB |
| 多阶段 python:3.11-alpine | ~80MB |

alpine 镜像更小，但 alpine 用 musl libc，某些 C 扩展（numpy、pandas）需要重新编译，初次构建慢。普通 FastAPI 项目用 slim 就够了。

## 四、Demo 3：用 gunicorn 启动的 Dockerfile

生产推荐用 gunicorn 启动，进程管理更稳。

\`\`\`dockerfile
# 基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
# 包含 gunicorn 和 uvicorn worker
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 用 gunicorn 启动
# 注意：容器里 gunicorn master 通常是 PID 1
# 用 exec 形式确保信号正确传递
CMD ["gunicorn", "-c", "gunicorn_conf.py", "main:app"]
\`\`\`

requirements.txt：

\`\`\`txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
gunicorn==21.2.0
\`\`\`

gunicorn_conf.py（容器内专用配置）：

\`\`\`python
# gunicorn_conf.py —— 容器内配置

import multiprocessing

# 监听容器内端口
bind = "0.0.0.0:8000"

# 动态 worker 数
# 注意：容器内 cpu_count() 返回的是宿主机的 CPU 数
# 如果用 K8s 限制 CPU，要手动指定 workers 数
workers = multiprocessing.cpu_count() * 2 + 1

# uvicorn worker
worker_class = "uvicorn.workers.UvicornWorker"

# 超时
timeout = 120
graceful_timeout = 30

# 防内存泄漏
max_requests = 1000
max_requests_jitter = 50

# 日志输出到 stdout，docker logs 能看到
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 信任容器外的代理（Nginx 在另一个容器）
forwarded_allow_ips = "*"
\`\`\`

## 五、Demo 4：.dockerignore 优化构建

\`docker build\` 会把构建上下文（\`.\` 指定的目录）整个打包发给 daemon。如果目录里有 \`__pycache__\`、\`.git\`、\`.env\`，会被一起打包，慢且可能泄漏敏感信息。

\`\`\`txt
# .dockerignore —— 排除不需要的文件

# Python 缓存
__pycache__
*.pyc
*.pyo
*.pyd
.Python

# 虚拟环境
.venv
venv
env

# Git
.git
.gitignore

# 环境变量文件（含密钥，绝对不能进镜像）
.env
.env.local

# 测试文件（镜像里不需要跑测试）
tests
*.test.py
pytest_cache
.coverage
htmlcov

# IDE 配置
.vscode
.idea

# 文档
README.md
docs

# Docker 自身文件
Dockerfile
docker-compose.yml
.dockerignore

# 日志
*.log
logs
\`\`\`

效果：

- 构建上下文从几百 MB 降到几 MB。
- 镜像里不会出现 \`.env\` 等敏感文件。
- 构建更快、推送更快。

## 六、Demo 5：构建和运行命令

\`\`\`bash
# 构建镜像
# -t myapi:latest：标签
# -t myapi:1.0.0：可以打多个标签
# . ：构建上下文
docker build -t myapi:latest -t myapi:1.0.0 .

# 不使用缓存构建（排查问题用）
# --no-cache：每一层都重新构建
docker build --no-cache -t myapi:latest .

# 查看镜像列表
docker images | grep myapi

# 运行容器
# -d：后台运行
# -p 8000:8000：端口映射
# --name api：容器名
# --restart unless-stopped：容器挂了自动重启（除非手动 stop）
docker run -d \\
  -p 8000:8000 \\
  --name api \\
  --restart unless-stopped \\
  myapi:latest

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器日志
# -f：实时跟随
# --tail 100：只看最后 100 行
docker logs -f --tail 100 api

# 进入容器
docker exec -it api bash

# 停止容器（发 SIGTERM，等 10 秒后 SIGKILL）
docker stop api

# 启动已停止的容器
docker start api

# 删除容器
docker rm api

# 删除镜像
docker rmi myapi:latest
\`\`\`

## 七、Demo 6：环境变量传入

容器里的应用读环境变量（\`os.getenv\`、\`pydantic-settings\`）。Docker 提供多种传参方式。

**方式 1：-e 单个传**

\`\`\`bash
# -e KEY=VALUE：单个环境变量
docker run -d \\
  -p 8000:8000 \\
  -e DATABASE_URL=postgresql://user:pass@db:5432/app \\
  -e REDIS_URL=redis://redis:6379/0 \\
  -e DEBUG=false \\
  --name api \\
  myapi:latest
\`\`\`

**方式 2：--env-file 批量传**

\`\`\`bash
# .env 文件
# DATABASE_URL=postgresql://user:pass@db:5432/app
# REDIS_URL=redis://redis:6379/0
# DEBUG=false
# SECRET_KEY=xxxxxx

# --env-file 指定文件
# 注意：.env 文件不要进镜像（.dockerignore 排除）
docker run -d \\
  -p 8000:8000 \\
  --env-file .env \\
  --name api \\
  myapi:latest
\`\`\`

**方式 3：Dockerfile 里设默认值**

\`\`\`dockerfile
# ENV 设置默认值
# 应用代码里可以覆盖
ENV DEBUG=false
ENV LOG_LEVEL=info

# 启动时 docker run -e DEBUG=true 会覆盖
\`\`\`

FastAPI 代码里读取：

\`\`\`python
# config.py —— 用 pydantic-settings 读环境变量

# 从 pydantic_settings 导入 BaseSettings
from pydantic_settings import BaseSettings

# 配置类继承 BaseSettings
class Settings(BaseSettings):
    # 数据库连接串，没有默认值，必须传
    database_url: str
    # Redis 连接串
    redis_url: str = "redis://localhost:6379/0"
    # 调试模式，默认关闭
    debug: bool = False
    # 日志级别
    log_level: str = "info"

    # 配置类允许从 .env 文件读
    class Config:
        env_file = ".env"

# 全局配置实例
settings = Settings()
\`\`\`

## 八、Demo 7：健康检查（HEALTHCHECK）

容器编排系统（docker-compose、K8s）需要知道容器是否健康。HEALTHCHECK 指令让 Docker 定期检查。

\`\`\`dockerfile
# 基础镜像
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# HEALTHCHECK 指令
# --interval=30s：每 30 秒检查一次
# --timeout=3s：检查命令超时 3 秒
# --start-period=10s：容器启动后 10 秒内失败不算
# --retries=3：连续 3 次失败才标记 unhealthy
# CMD curl -f http://localhost:8000/health || exit 1：
#   访问健康检查接口，失败返回 1
HEALTHCHECK \\
  --interval=30s \\
  --timeout=3s \\
  --start-period=10s \\
  --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

但 slim 镜像没有 curl，要么装 curl，要么用 Python：

\`\`\`dockerfile
# 装 curl（增加约 5MB）
RUN apt-get update && apt-get install -y --no-install-recommends curl \\
    && rm -rf /var/lib/apt/lists/*

# 或者用 Python（不增加依赖，python 自带）
HEALTHCHECK \\
  --interval=30s \\
  --timeout=3s \\
  --start-period=10s \\
  --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
\`\`\`

查看健康状态：

\`\`\`bash
# 查看容器状态（包含 health 信息）
docker ps
# STATUS 列会显示：Up 5 minutes (healthy) 或 (unhealthy)

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' api | jq
\`\`\`

FastAPI 应用里要提供 \`/health\` 接口：

\`\`\`python
# main.py —— 健康检查接口

from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    # 实际项目可以检查数据库连接、Redis 连接等
    # 简单版直接返回 ok
    return {"status": "ok"}

# 更完整的健康检查（含依赖检查）
@app.get("/health/full")
def health_full():
    import asyncio
    checks = {}
    
    # 检查数据库（伪代码）
    try:
        # await db.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"fail: {e}"
    
    # 检查 Redis（伪代码）
    try:
        # await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"fail: {e}"
    
    # 任一依赖挂了，返回 503
    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "ok" if all_ok else "degraded", "checks": checks}
\`\`\`

## 九、Dockerfile 常用指令表

| 指令 | 说明 | 示例 |
|---|---|---|
| FROM | 基础镜像 | \`FROM python:3.11-slim\` |
| WORKDIR | 工作目录 | \`WORKDIR /app\` |
| COPY | 复制文件到镜像 | \`COPY . .\` |
| ADD | 复制并解压（少用） | \`ADD app.tar.gz /app\` |
| RUN | 构建时执行命令 | \`RUN pip install -r requirements.txt\` |
| CMD | 容器启动命令（可覆盖） | \`CMD ["uvicorn", "main:app"]\` |
| ENTRYPOINT | 容器启动命令（不易覆盖） | \`ENTRYPOINT ["gunicorn"]\` |
| ENV | 环境变量 | \`ENV DEBUG=false\` |
| ARG | 构建时变量 | \`ARG VERSION=1.0\` |
| EXPOSE | 声明端口 | \`EXPOSE 8000\` |
| VOLUME | 声明卷 | \`VOLUME /data\` |
| USER | 切换用户 | \`USER appuser\` |
| HEALTHCHECK | 健康检查 | \`HEALTHCHECK CMD curl ...\` |
| LABEL | 元数据 | \`LABEL version="1.0"\` |
| AS | 多阶段命名 | \`FROM ... AS builder\` |

## 本章小结

| 知识点 | 要点 |
|---|---|
| Docker 价值 | 环境一致、隔离、轻量、易扩缩 |
| 容器 vs 虚拟机 | 共享内核、秒级启动、MB 级占用 |
| 最简 Dockerfile | FROM + WORKDIR + COPY + RUN + CMD |
| 缓存层 | requirements.txt 单独 COPY，代码放最后 |
| 多阶段构建 | builder 装依赖、runner 只复制结果，体积小 |
| gunicorn 启动 | CMD 用 gunicorn -c，容器内 PID 1 是 master |
| .dockerignore | 排除缓存、.env、测试、文档，加快构建 |
| 构建运行 | docker build / docker run -d -p |
| 环境变量 | -e 单个、--env-file 批量、ENV 默认值 |
| HEALTHCHECK | 定期探活，编排系统据此重启容器 |
| /health 接口 | 应用必须提供，可检查依赖健康 |
`
  },

  // ============================================================
  // 第 5 章：docker-compose 多服务编排
  // ============================================================
  {
    id: "ft-compose",
    group: "部署基础",
    icon: "🎼",
    title: "docker-compose 多服务编排",
    content: `# docker-compose 多服务编排

## 一、docker-compose 简介

一个真实的 FastAPI 项目通常不止 API 进程一个服务，还可能包括：

- **PostgreSQL**：业务数据库
- **Redis**：缓存、消息队列
- **Nginx**：反向代理
- **Celery worker**：异步任务
- **Celery beat**：定时任务

用 \`docker run\` 一个个启动这些容器、配网络、配依赖顺序，痛苦且容易出错。**docker-compose** 就是为解决这个问题而生——用一个 YAML 文件描述所有服务、网络、卷，一条命令拉起整套环境。

docker-compose 的核心价值：

1. **声明式配置**：所有服务、依赖、网络写在 \`docker-compose.yml\`，看一眼就知道环境长啥样。
2. **一键启停**：\`docker-compose up -d\` 启动，\`docker-compose down\` 停止。
3. **服务发现**：服务之间用服务名互相访问，自动 DNS 解析。
4. **依赖编排**：\`depends_on\` 控制启动顺序，\`condition\` 等待依赖就绪。
5. **环境隔离**：每个 compose 项目有独立网络，互不干扰。

> 生活类比：docker-compose 像「乐谱」——一份 YAML 文件规定了有几个声部（服务）、每个声部用什么乐器（镜像）、什么时候进什么时候停（依赖关系），指挥棒一挥（up），整个乐队齐刷刷开演。

## 二、Demo 1：完整的 docker-compose.yml

一个完整的 FastAPI + Postgres + Redis 编排文件：

\`\`\`yaml
# docker-compose.yml
# 版本号（3.9 是较新的稳定版，向下兼容）
version: "3.9"

# services：定义所有服务
services:
  # 服务名 api（其他服务可以用 api 这个名字访问它）
  api:
    # build：从当前目录的 Dockerfile 构建
    build: .
    # 端口映射：宿主:容器
    ports:
      - "8000:8000"
    # 环境变量
    environment:
      # 数据库连接串，db 是服务名，5432 是 Postgres 默认端口
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      # Redis 连接串，redis 是服务名
      - REDIS_URL=redis://redis:6379/0
      # 调试模式关闭
      - DEBUG=false
    # 依赖的服务（启动顺序）
    depends_on:
      - db
      - redis
    # 重启策略
    restart: unless-stopped

  # 数据库服务
  db:
    # 用官方 Postgres 15 镜像
    image: postgres:15
    # 环境变量（Postgres 必需的）
    environment:
      # 用户名
      POSTGRES_USER: user
      # 密码
      POSTGRES_PASSWORD: pass
      # 默认创建的数据库
      POSTGRES_DB: app
    # 数据卷映射，持久化数据
    volumes:
      # pgdata 卷映射到 Postgres 数据目录
      - pgdata:/var/lib/postgresql/data
    # 端口映射（开发时暴露 5432 让宿主机连，生产不要暴露）
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis 服务
  redis:
    # 用官方 Redis 7 镜像
    image: redis:7
    # 端口映射（开发暴露，生产不暴露）
    ports:
      - "6379:6379"
    restart: unless-stopped

# volumes：定义数据卷（持久化存储）
volumes:
  # pgdata 卷，docker-compose 自动创建和管理
  pgdata:
\`\`\`

启动：

\`\`\`bash
# 后台启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志（所有服务）
docker-compose logs -f

# 只看 api 服务的日志
docker-compose logs -f api

# 停止并删除容器、网络（保留数据卷）
docker-compose down

# 停止并删除容器、网络、数据卷（清空数据，慎用）
docker-compose down -v
\`\`\`

服务之间怎么访问？API 容器里代码用 \`postgresql://user:pass@db:5432/app\`，\`db\` 这个主机名会被 Docker 内置 DNS 解析成 db 容器的 IP。同理 \`redis://redis:6379/0\` 里的 \`redis\` 解析成 redis 容器 IP。

## 三、Demo 2：启动和管理命令

\`\`\`bash
# 后台启动（-d 表示 detach，后台运行）
# 如果镜像不存在会先 build/pull
docker-compose up -d

# 前台启动（看实时日志，Ctrl+C 停止）
docker-compose up

# 只启动指定服务（会自动启动依赖）
docker-compose up -d api

# 重新构建镜像（代码改了之后）
# --build：强制重新 build
docker-compose up -d --build

# 查看服务状态
docker-compose ps
# 输出示例：
# Name           Command          State           Ports
# api_api_1      uvicorn main:app Up              0.0.0.0:8000->8000/tcp
# api_db_1       docker-entrypoint.sh postgres Up 0.0.0.0:5432->5432/tcp
# api_redis_1    docker-entrypoint.sh redis ... Up 0.0.0.0:6379->6379/tcp

# 查看日志
# -f：实时跟随
# --tail=100：只看最后 100 行
docker-compose logs -f --tail=100 api

# 在运行中的容器里执行命令
# exec api python -m alembic upgrade head
docker-compose exec api python -m alembic upgrade head

# 进入容器 shell
docker-compose exec api bash

# 停止所有服务（容器还在，可以 start）
docker-compose stop

# 启动已停止的服务
docker-compose start

# 重启服务
docker-compose restart api

# 停止并删除容器、网络
docker-compose down

# 同时删除数据卷（清空数据库数据）
docker-compose down -v

# 同时删除镜像
docker-compose down --rmi all

# 查看服务进程
docker-compose top
\`\`\`

## 四、Demo 3：健康检查 + depends_on condition

上面的 \`depends_on\` 只控制启动顺序——db 容器一启动，api 就启动。但 Postgres 启动需要几秒钟初始化，api 这时连数据库会失败。\`condition\` 解决这个问题。

\`\`\`yaml
# docker-compose.yml —— 带健康检查和 condition

version: "3.9"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379/0
    # depends_on 带条件
    depends_on:
      db:
        # 等 db 健康检查通过才启动 api
        condition: service_healthy
      redis:
        # redis 启动就行（redis 启动很快）
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    # 健康检查
    healthcheck:
      # pg_isready 是 Postgres 自带的健康检查命令
      # -U user：指定用户
      test: ["CMD", "pg_isready", "-U", "user"]
      # 每 5 秒检查一次
      interval: 5s
      # 超时 3 秒
      timeout: 3s
      # 失败 5 次才标记 unhealthy
      retries: 5
      # 启动后 10 秒内失败不算
      start_period: 10s
    restart: unless-stopped

  redis:
    image: redis:7
    # Redis 健康检查
    healthcheck:
      # redis-cli ping 返回 PONG 表示健康
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
\`\`\`

\`condition\` 三种值：

- \`service_started\`：依赖容器启动就继续（默认）。
- \`service_healthy\`：依赖容器健康检查通过才继续。
- \`service_completed_successfully\`：依赖容器执行完退出（码 0）才继续，用于初始化脚本。

## 五、Demo 4：多环境配置

开发、测试、生产环境配置不同。docker-compose 支持「基础文件 + override 文件」机制。

**基础文件 docker-compose.yml**：

\`\`\`yaml
# docker-compose.yml —— 基础配置（所有环境共享）

version: "3.9"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "user"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7

volumes:
  pgdata:
\`\`\`

**开发 override docker-compose.override.yml**（自动加载）：

\`\`\`yaml
# docker-compose.override.yml —— 开发覆盖配置
# 这个文件 docker-compose up 会自动合并

version: "3.9"

services:
  api:
    # 开发用 reload 模式
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    # 挂载代码目录，改代码不用重建镜像
    volumes:
      - .:/app
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug

  db:
    # 开发暴露端口让宿主机连
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"
\`\`\`

**生产 docker-compose.prod.yml**（手动指定）：

\`\`\`yaml
# docker-compose.prod.yml —— 生产配置
# 用 -f 显式指定才生效

version: "3.9"

services:
  api:
    # 生产用 gunicorn
    command: gunicorn -c gunicorn_conf.py main:app
    # 生产不挂载代码（用镜像里的）
    environment:
      - DEBUG=false
      - LOG_LEVEL=info
      - WORKERS=4
    # 生产限制资源
    deploy:
      resources:
        limits:
          # 最多用 1G 内存
          memory: 1G
          # 最多用 1 个 CPU
          cpus: "1.0"
    # 生产不暴露 db 和 redis 端口
    restart: always

  db:
    # 生产环境用单独的卷
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    # 不暴露端口（只允许 api 容器访问）
    restart: always

  redis:
    # 加密码
    command: redis-server --requirepass $REDIS_PASSWORD
    restart: always

volumes:
  pgdata_prod:
\`\`\`

启动不同环境：

\`\`\`bash
# 开发环境（自动加载 override）
docker-compose up -d

# 生产环境（显式指定，不加载 override）
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 测试环境
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d
\`\`\`

## 六、Demo 5：数据卷持久化

容器是临时的——删除容器，里面的数据就没了。数据库数据必须用卷持久化。

\`\`\`yaml
# docker-compose.yml —— 数据卷示例

version: "3.9"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      # 命名卷（推荐，由 docker 管理）
      - pgdata:/var/lib/postgresql/data
      # 绑定挂载（把宿主机目录映射进去，开发用）
      - ./backups:/backups
      # 初始化脚本（Postgres 启动时自动执行 .sh/.sql）
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  api:
    build: .
    volumes:
      # 开发时挂载代码（改代码不用重建镜像）
      - .:/app
      # 挂载日志目录
      - ./logs:/app/logs
      # 排除某些子目录（用匿名卷覆盖）
      - /app/__pycache__
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app

volumes:
  # 命名卷
  pgdata:
    # 外部驱动配置（默认是 local）
    driver: local
\`\`\`

卷的三种类型：

| 类型 | 语法 | 用途 |
|---|---|---|
| 命名卷 | \`pgdata:/path\` | 数据持久化，docker 管理 |
| 绑定挂载 | \`./host:/container\` | 开发挂代码、配置文件 |
| 匿名卷 | \`/path\` | 排除目录、临时数据 |

卷管理命令：

\`\`\`bash
# 列出所有卷
docker volume ls

# 查看卷详情
docker volume inspect pgdata

# 删除未使用的卷
docker volume prune

# 备份命名卷（用临时容器）
docker run --rm -v pgdata:/data -v $(pwd):/backup alpine \\
  tar czf /backup/pgdata-backup.tar.gz -C /data .

# 恢复命名卷
docker run --rm -v pgdata:/data -v $(pwd):/backup alpine \\
  tar xzf /backup/pgdata-backup.tar.gz -C /data
\`\`\`

## 七、Demo 6：网络配置

默认情况下，docker-compose 会给项目创建一个默认网络，所有服务都在里面。但有时需要自定义网络。

\`\`\`yaml
# docker-compose.yml —— 自定义网络

version: "3.9"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    # 加入多个网络
    networks:
      - frontend
      - backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app

  db:
    image: postgres:15
    # 只在 backend 网络，外部访问不到
    networks:
      - backend
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    # 只在 frontend 网络
    networks:
      - frontend
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

networks:
  # frontend 网络：对外服务
  frontend:
    driver: bridge
  # backend 网络：内部服务（db 只能被同网络访问）
  backend:
    driver: bridge
    # internal: true 表示完全隔离，不能连外网
    internal: false
\`\`\`

网络类型：

| 类型 | 说明 | 用途 |
|---|---|---|
| bridge | 默认，单机虚拟网桥 | 单机多容器通信 |
| host | 共享宿主网络 | 性能最优，无隔离 |
| none | 无网络 | 完全隔离 |
| overlay | 跨主机网络 | Docker Swarm |

## 八、Demo 7：生产部署

生产部署的 compose 文件要考虑：资源限制、日志、重启策略、滚动更新。

\`\`\`yaml
# docker-compose.prod.yml —— 生产配置

version: "3.9"

services:
  api:
    # 用构建好的镜像（不从源码 build）
    image: registry.example.com/myapi:1.0.0
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:$DB_PASS@db:5432/app
      - REDIS_URL=redis://redis:6379/0
      - DEBUG=false
    # 资源限制
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.25"
    # 日志配置
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    # 重启策略
    restart: always
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    # 健康检查
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: $DB_PASS
      POSTGRES_DB: app
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
    restart: always
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    command: redis-server --requirepass $REDIS_PASSWORD --maxmemory 256mb --maxmemory-policy allkeys-lru
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "3"

volumes:
  pgdata_prod:
\`\`\`

部署命令：

\`\`\`bash
# 从私有仓库拉镜像
docker login registry.example.com -u username -p $TOKEN

# 启动生产环境
# --env-file 指定环境变量文件（含 DB_PASS 等）
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \\
  --env-file .env.prod \\
  up -d

# 更新单个服务（拉新镜像 + 重启）
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \\
  pull api
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \\
  up -d api

# 滚动重启（一次重启一个，配合负载均衡）
docker-compose -f docker-compose.prod.yml up -d --no-deps --scale api=2 api
\`\`\`

## 九、Demo 8：用 compose 做集成测试

docker-compose 非常适合跑集成测试——一次性拉起 API + DB + Redis，跑完测试销毁。

\`\`\`yaml
# docker-compose.test.yml —— 测试环境

version: "3.9"

services:
  api:
    build: .
    # 用测试启动命令（等数据库就绪后跑迁移 + 测试）
    command: >
      sh -c "python -m alembic upgrade head &&
             pytest tests/integration -v --cov=app"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/test_db
      - REDIS_URL=redis://redis:6379/0
      - TESTING=true
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: test_db
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "user"]
      interval: 3s
      timeout: 2s
      retries: 10

  redis:
    image: redis:7
\`\`\`

CI 里跑测试：

\`\`\`bash
# 构建镜像
docker-compose -f docker-compose.test.yml build

# 启动并跑测试
# --exit-code-from api：api 容器退出码作为整体退出码
# --abort-on-container-exit：任一容器退出就停止所有
docker-compose -f docker-compose.test.yml up \\
  --exit-code-from api \\
  --abort-on-container-exit

# 清理
docker-compose -f docker-compose.test.yml down -v
\`\`\`

GitHub Actions 配置示例：

\`\`\`yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # 拉代码
      - uses: actions/checkout@v4
      
      # 启动测试环境并跑测试
      - name: Run integration tests
        run: |
          docker-compose -f docker-compose.test.yml build
          docker-compose -f docker-compose.test.yml up \\
            --exit-code-from api \\
            --abort-on-container-exit
      
      # 上传覆盖率报告
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: htmlcov/
\`\`\`

## 十、compose 常用命令表

| 命令 | 说明 |
|---|---|
| \`docker-compose up -d\` | 后台启动所有服务 |
| \`docker-compose up --build\` | 重新构建并启动 |
| \`docker-compose down\` | 停止并删除容器、网络 |
| \`docker-compose down -v\` | 同时删除数据卷 |
| \`docker-compose ps\` | 查看服务状态 |
| \`docker-compose logs -f api\` | 查看 api 日志 |
| \`docker-compose exec api bash\` | 进入 api 容器 |
| \`docker-compose run api pytest\` | 启动新容器跑命令 |
| \`docker-compose build\` | 构建镜像 |
| \`docker-compose pull\` | 拉取镜像 |
| \`docker-compose restart api\` | 重启 api 服务 |
| \`docker-compose stop\` | 停止所有服务 |
| \`docker-compose start\` | 启动已停止的服务 |
| \`docker-compose top\` | 查看容器进程 |
| \`docker-compose config\` | 校验并显示合并后的配置 |
| \`docker-compose scale api=3\` | 扩展 api 到 3 个（已废弃，用 up --scale） |

## 本章小结

| 知识点 | 要点 |
|---|---|
| compose 价值 | 一份 YAML 描述多服务，一键启停 |
| 服务发现 | 服务名当主机名，自动 DNS |
| 完整示例 | api + db + redis，端口、环境变量、依赖 |
| depends_on condition | service_healthy 等依赖健康才启动 |
| 多环境 | override 自动合并，prod 用 -f 显式指定 |
| 数据卷 | 命名卷持久化、绑定挂载开发、初始化脚本 |
| 网络隔离 | frontend/backend 分离，db 不暴露 |
| 生产部署 | 资源限制、日志轮转、always 重启 |
| 集成测试 | up --exit-code-from api，跑完销毁 |
| CI 集成 | GitHub Actions 里跑 compose 测试 |
`
  }
];
