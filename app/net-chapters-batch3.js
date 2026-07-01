// =============================================================
// 计算机网络教程 —— 第三批章节（工程实践篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. net-proxy       — 正向代理与反向代理
//   2. net-cdn         — CDN 与缓存策略
//   3. net-debug       — 抓包与网络调试
//   4. net-performance — 网络性能优化
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（"工程实践篇"）
//   content : Markdown 格式的详细讲解（中文，8000+ 字）
//   code    : 可真实运行的 Python 代码（用标准库演示）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：正向代理与反向代理
  // =========================================================
  {
    id: "net-proxy",
    title: "正向代理与反向代理",
    icon: "🔁",
    group: "工程实践篇",
    content: \`## 一、为什么这一章重要

代理（Proxy）是工程实践中出现频率最高的网络概念之一。你上线一个网站，几乎一定要在前面挂一层 Nginx 做反向代理；公司内网要让员工合规上网，要部署正向代理；做爬虫要绕过封锁，要用代理池；做容器编排，Kubernetes 的 Service、Ingress 本质上也是代理。可以说，**只要你在做后端、做运维、做前端工程化，就绕不开代理**。

很多人把"正向代理"和"反向代理"记混，本质上是没理解"代理对象"这个关键点。这一章会从最朴素的"中间人转发"出发，把两类代理、四层/七层代理、Nginx 反向代理配置、负载均衡策略、健康检查、WebSocket 代理等工作中真正会用到的知识讲透。

### 二、代理的本质：中间人转发

代理的本质非常简单——**在客户端和服务端之间插入一个中间节点，由它转发请求和响应**：

\`\`\`
[ 客户端 ]  --请求-->  [ 代理 ]  --请求-->  [ 服务端 ]
[ 客户端 ]  <--响应--  [ 代理 ]  <--响应--  [ 服务端 ]
\`\`\`

这个中间节点能做什么？它能做一切"中间人"能做的事：

- **转发**：把请求原封不动转给后端，再把响应转回客户端（最基本的能力）。
- **路由**：根据 URL、Host、Header 把请求分发到不同的后端。
- **负载均衡**：把请求按策略分发到多台后端，分摊压力。
- **缓存**：把后端的响应缓存起来，下次同样的请求直接返回缓存。
- **改写**：修改请求头、响应头，加 CORS、加 X-Forwarded-For。
- **终止**：在代理处终止 TLS（SSL 卸载），后端用明文 HTTP。
- **鉴权**：在代理处统一做认证、限流、WAF 防护。
- **协议转换**：把 HTTP 转成 FastCGI、把 WebSocket 转发到后端。

理解了"代理是中间人，能做中间人能做的一切事"，后面所有的配置项你都能推理出来，而不需要死记。

### 三、正向代理（Forward Proxy）

**正向代理代理的是客户端**。客户端知道自己想访问谁，但出于某种原因不能直接访问，于是让代理帮自己访问。

经典场景：

- **公司上网行为管理**：员工不能直连外网，所有流量必须经过公司的代理（如 Squid），代理可以审计、过滤、缓存。
- **翻墙 / VPN**：客户端访问不了目标站点，通过境外代理中转。
- **爬虫代理池**：目标站点按 IP 限流，爬虫用大量代理 IP 轮换访问。
- **缓存加速**：早期校园网出口带宽贵，用代理缓存热点资源减少出口流量。

正向代理的典型特征：**客户端要主动配置代理地址**，浏览器里填"代理服务器 IP:端口"，或者程序里设置 HTTP_PROXY 环境变量。客户端发出的请求，目标 Host 是真实目标，而不是代理。

\`\`\`
[ 客户端 ] --"我要访问 example.com"--> [ 正向代理 ] --代为访问--> [ example.com ]
\`\`\`

典型实现：Squid、Shadowsocks、V2Ray、TinyProxy。

### 四、反向代理（Reverse Proxy）

**反向代理代理的是服务端**。客户端根本不知道真实服务器的存在，它以为代理就是服务器，直接访问代理地址，代理再在背后把请求转发给真正的后端。

经典场景：

- **负载均衡**：Nginx 把请求分发到多台 Tomcat，客户端只看到 Nginx 的地址。
- **SSL 卸载**：Nginx 处理 HTTPS，后端用 HTTP，后端不用配证书。
- **静态缓存**：Nginx 缓存图片、CSS、JS，命中直接返回不打后端。
- **安全防护**：Nginx 前置做 WAF、限流、屏蔽恶意 IP。
- **协议转换**：Nginx 把 HTTP 转成 FastCGI 给 PHP-FPM，把 HTTP 升级成 WebSocket 透传。
- **灰度发布**：按比例把流量分到新旧版本后端。

反向代理的典型特征：**客户端不感知代理的存在**，直接访问代理地址，以为那就是目标。

\`\`\`
[ 客户端 ] --"我访问的是 nginx.example.com"--> [ 反向代理 Nginx ] --转发--> [ 后端 A/B/C ]
\`\`\`

典型实现：Nginx、HAProxy、Traefik、Envoy、Kong、Caddy。

### 五、正向 vs 反向对比

很多人混淆两类代理，记住一句话就够了：**"正向代理代理客户端，反向代理代理服务端"**。

| 维度 | 正向代理 | 反向代理 |
|------|---------|---------|
| 代理对象 | 客户端 | 服务端 |
| 客户端是否感知 | 感知（要配置代理） | 不感知（以为代理就是服务器） |
| 目标地址由谁决定 | 客户端决定（请求里写明目标） | 代理决定（按规则路由到后端） |
| 典型用途 | 翻墙、上网管理、爬虫代理 | 负载均衡、SSL 卸载、缓存、安全 |
| 典型软件 | Squid、Shadowsocks | Nginx、HAProxy、Traefik |
| 部署位置 | 靠近客户端 | 靠近服务端 |
| 部署者 | 用户/公司 IT | 服务提供方 |

一个有意思的现象：CDN 既是反向代理（对用户来说它就是源站），又做了缓存。所以代理和缓存往往是结合在一起的。

### 六、四层代理 vs 七层代理

代理按工作在 OSI 哪一层，分为四层（L4）和七层（L7）：

| 类型 | 工作层 | 依据 | 典型 | 特点 |
|------|--------|------|------|------|
| 四层代理 | 传输层 | IP + 端口 | LVS、HAProxy（tcp 模式）、Nginx stream | 转发快，不解析协议，只看 IP:Port |
| 七层代理 | 应用层 | HTTP Host/URL/Header/Cookie | Nginx http、HAProxy（http 模式）、Traefik | 能按 URL 路由、改写 Header、缓存，但更耗 CPU |

四层代理的本质是**NAT 转发**——只改 IP/端口，不改报文内容，性能极高。七层代理的本质是**解析 HTTP 后重新构造请求**，能做精细路由，但要把报文解析到应用层，开销大。

实际工程中常见组合：**LVS 做四层负载 → Nginx 做七层反向代理 → 后端服务**。LVS 抗大流量，Nginx 做精细化路由和缓存，各司其职。

\`\`\`
外网流量 -> [ LVS 四层 ] -> [ Nginx 七层 ] -> [ 后端服务集群 ]
\`\`\`

### 七、透明代理与非透明代理

按客户端"知不知道自己被代理"还分两种：

- **透明代理**：客户端不需要任何配置，流量被网络层重定向到代理（如用 iptables REDIRECT）。公司防火墙、校园网网关常用。客户端"被代理了还不知道"。
- **非透明代理**：客户端要主动配置代理地址。Squid 的标准模式、浏览器的代理设置都是这种。

透明代理在 Kubernetes 里的体现就是 Istio 的 sidecar——Pod 里的所有流量被 iptables 透明劫持到 Envoy sidecar，业务代码完全无感。

### 八、Nginx 反向代理配置详解

Nginx 是工程中最常见的反向代理，配置项值得逐个理解。

#### 8.1 最简单的反向代理

\`\`\`nginx
server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
\`\`\`

把所有 80 端口的请求转发到本机 8080 的后端。`proxy_pass` 是反向代理最核心的指令。

#### 8.2 upstream 定义后端集群

\`\`\`nginx
upstream backend {
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080 backup;   # 备用，平时不参与
}

server {
    location / {
        proxy_pass http://backend;
    }
}
\`\`\`

`upstream` 把多个后端聚合成一个逻辑组，`proxy_pass` 直接引用组名。

#### 8.3 负载均衡策略

| 策略 | 指令 | 适用场景 |
|------|------|---------|
| 轮询（默认） | 不写 | 后端性能相同 |
| 加权轮询 | server x weight=n | 后端性能不同 |
| ip_hash | ip_hash; | 需要会话保持（同一 IP 固定后端） |
| 最少连接 | least_conn; | 请求处理时间差异大 |
| 一致性哈希 | hash $key consistent; | 缓存命中率优先 |

\`\`\`nginx
upstream backend {
    ip_hash;                         # 会话保持
    server 10.0.0.1:8080 weight=3;   # 权重 3
    server 10.0.0.2:8080 weight=1;
    server 10.0.0.3:8080;
}
\`\`\`

#### 8.4 健康检查

Nginx 开源版内置被动健康检查：

\`\`\`nginx
upstream backend {
    server 10.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=30s;
}
\`\`\`

- `max_fails=3`：30 秒内失败 3 次，标记为不可用。
- `fail_timeout=30s`：不可用后，30 秒内不再把请求发过去；30 秒后重试一次。

主动健康检查需要 Nginx Plus 或第三方模块（如 nginx_upstream_check_module）。

#### 8.5 透传客户端信息

后端往往需要知道客户端真实 IP、原始 Host。Nginx 转发时要主动加上：

\`\`\`nginx
location / {
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_pass http://backend;
}
\`\`\`

- `X-Forwarded-For`：记录经过的代理链，`客户端IP, 代理1 IP, 代理2 IP`。
- `X-Real-IP`：最末端代理填的客户端真实 IP。
- 后端拿到这两个头，要把 `RemoteAddr` 替换成 `X-Forwarded-For` 的第一个 IP。

#### 8.6 WebSocket 代理

WebSocket 是升级后的 HTTP 连接，需要透传 Upgrade/Connection 头：

\`\`\`nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;   # WebSocket 长连接，超时要拉长
}
\`\`\`

#### 8.7 缓冲与超时

\`\`\`nginx
proxy_connect_timeout 5s;     # 与后端建连超时
proxy_send_timeout 60s;       # 向后端发请求超时
proxy_read_timeout 60s;       # 读后端响应超时
proxy_buffering on;           # 缓冲响应，全收到再返给客户端
proxy_buffer_size 4k;         # 响应头缓冲
proxy_buffers 8 4k;           # 响应体缓冲
\`\`\`

慢接口要把 read_timeout 调大，否则 Nginx 会先于客户端超时断开。

### 九、负载均衡策略选型

- **轮询**：后端机器一样，最简单。
- **加权轮询**：后端机器配置不同，按权重分摊。
- **ip_hash**：要会话保持但没引入 Redis Session 的场景。注意：IP 可能变化（4G/WIFI 切换），效果不稳定。
- **least_conn**：请求处理时间差异大（有的几毫秒有的几秒），轮询会造成快的机器空闲。
- **一致性哈希**：后端有缓存（如 Memcached），同一个 key 固定打到同一台，缓存命中率高，加减机器时缓存迁移最小。
- **加权最少连接**（WLC）：生产环境最常用的综合策略。

### 十、常见陷阱与最佳实践

1. **X-Forwarded-For 信任问题**：客户端可以伪造这个头。第一跳的代理要把头清空重写，不能直接信任。安全做法：在最外层网关把 `X-Forwarded-For` 重写为 `\$remote_addr`。
2. **后端拿到的是代理 IP**：忘了配 `X-Real-IP`，后端日志全是 Nginx 的 IP，风控、审计全废。一定要在反向代理处透传真实 IP，后端要信任并解析。
3. **WebSocket 不生效**：忘了加 `proxy_http_version 1.1` 和 Upgrade 头，WebSocket 握手失败。
4. **HTTPS 后端证书校验**：`proxy_pass https://backend` 默认校验证书，自签证书要配 `proxy_ssl_verify off`（仅测试环境）。
5. **buffering 拖慢大文件**：下载大文件时 proxy_buffering on 会先缓存到磁盘，可能撑爆磁盘。流式接口（SSE、大文件下载）要 `proxy_buffering off`。
6. **超时配置不合理**：默认 60s 对慢接口不够，对快接口太长。要根据业务分别配 location 级超时。
7. **upstream 健康检查只有被动**：开源 Nginx 没有主动探测，后端假死（TCP 通但应用不响应）时 Nginx 仍会发请求。生产要补主动检查。
8. **DNS 缓存**：`proxy_pass http://backend.example.com` 中的域名在 Nginx 启动时解析一次就缓存了。如果域名 IP 经常变，要用 `resolver` + 变量形式强制动态解析。
9. **重试放大**：`proxy_next_upstream` 默认对错误和超时重试到下一台，可能导致一个请求被打到多台后端，对非幂等接口（POST 转账）是灾难。非幂等接口要关掉重试。

### 十一、面试要点

**Q1：正向代理和反向代理的区别？**
A：核心区别是代理对象不同。正向代理代理客户端，客户端主动配置代理，目标地址由客户端决定，用于翻墙、上网管理；反向代理代理服务端，客户端不感知，目标地址由代理决定，用于负载均衡、SSL 卸载、缓存、安全。

**Q2：四层代理和七层代理的区别？**
A：四层工作在传输层，依据 IP+端口转发，本质是 NAT，性能高但不解析协议（LVS、Nginx stream）；七层工作在应用层，解析 HTTP 后按 Host/URL/Header 路由，能改写、缓存，但开销大（Nginx http、HAProxy http）。生产常组合使用：LVS 抗流量 + Nginx 精细化。

**Q3：Nginx 负载均衡有哪些策略？怎么选？**
A：轮询、加权轮询、ip_hash、least_conn、一致性哈希。性能相同用轮询；性能不同用加权；要会话保持用 ip_hash（注意 IP 漂移问题）；处理时间差异大用 least_conn；后端有缓存用一致性哈希提升命中率。

**Q4：后端如何拿到客户端真实 IP？**
A：反向代理在转发时通过 X-Real-IP 和 X-Forwarded-For 头透传。X-Forwarded-For 是代理链，逗号分隔，第一个是客户端真实 IP。后端要信任并解析这两个头，注意防伪造——第一跳网关要重写。

**Q5：Nginx 如何代理 WebSocket？**
A：WebSocket 握手是 HTTP 升级，需要 `proxy_http_version 1.1`、`proxy_set_header Upgrade $http_upgrade`、`proxy_set_header Connection "upgrade"`，并把 read_timeout 拉长（长连接）。

**Q6：为什么反向代理后面要做健康检查？**
A：后端可能假死（进程卡死、OOM、磁盘满），TCP 通但应用不响应。Nginx 开源版只有被动检查（失败 N 次后剔除），生产环境要补主动探测，及时把不健康节点从路由表摘除，避免请求打到坏节点。

### 十二、小结

- 代理的本质是中间人转发，能做转发、路由、负载均衡、缓存、改写、终止 TLS、鉴权、协议转换。
- 正向代理代理客户端，客户端感知，用于翻墙/上网管理；反向代理代理服务端，客户端不感知，用于负载均衡/SSL 卸载/缓存/安全。
- 四层代理基于 IP:Port，七层代理基于 HTTP 内容，生产常组合 LVS + Nginx。
- Nginx 反向代理核心是 upstream + proxy_pass，配合负载均衡策略、健康检查、Header 透传、WebSocket 配置。
- 工程陷阱：X-Forwarded-For 伪造、后端拿不到真实 IP、WebSocket 头缺失、超时配置、重试放大、DNS 缓存。
\`,
    code: \`# ============================================================
# 第一章代码演示：代理服务器
# ------------------------------------------------------------
# 演示内容：
#   1. 用 http.server 实现一个反向代理
#   2. 启动两个后端 server，演示轮询负载均衡
#   3. 透传 X-Forwarded-For，打印完整的转发链路
# ============================================================
import threading
import http.server
import socketserver
import http.client
import time

# ---------- 后端：根据 server_id 返回不同标识 ----------
def make_backend_handler(server_id):
    class BackendHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            body = ("Hello from backend " + server_id +
                    " (path=" + self.path + ")").encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        def log_message(self, *a):
            pass  # 静默
    BackendHandler.server_id = server_id
    return BackendHandler

def start_backend(port, server_id):
    handler = make_backend_handler(server_id)
    with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
        httpd.serve_forever()

# ---------- 反向代理：轮询 + 透传真实 IP ----------
class ReverseProxyHandler(http.server.BaseHTTPRequestHandler):
    backends = []           # [(port, id), ...]
    rr_index = [0]          # 轮询计数（用 list 实现可变）

    def do_GET(self):
        # 1) 选一台后端（轮询）
        port, sid = self.backends[self.rr_index[0] % len(self.backends)]
        self.rr_index[0] += 1
        print("[PROXY] 收到请求 %s，转发到后端 %s @ 127.0.0.1:%d" %
              (self.path, sid, port))

        # 2) 用 http.client 把请求转发到后端
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=3)
        fwd_headers = {
            "X-Forwarded-For": self.client_address[0],
            "X-Real-IP": self.client_address[0],
            "X-Forwarded-Proto": "http",
        }
        conn.request("GET", self.path, headers=fwd_headers)
        resp = conn.getresponse()
        data = resp.read()

        # 3) 把后端响应原样返给客户端，附加 X-Backend 头
        print("[PROXY] 后端 %s 返回 %d bytes，回传客户端" %
              (sid, len(data)))
        self.send_response(resp.status)
        for k, v in resp.getheaders():
            if k.lower() in ("transfer-encoding", "connection"):
                continue
            self.send_header(k, v)
        self.send_header("X-Backend", sid)
        self.end_headers()
        self.wfile.write(data)
        conn.close()

    def log_message(self, *a):
        pass

def start_proxy(port):
    with socketserver.TCPServer(("127.0.0.1", port),
                                 ReverseProxyHandler) as httpd:
        httpd.serve_forever()

# ---------- 启动 ----------
if __name__ == "__main__":
    BACKENDS = [(18091, "B1"), (18092, "B2")]
    for port, sid in BACKENDS:
        t = threading.Thread(target=start_backend, args=(port, sid),
                             daemon=True)
        t.start()

    ReverseProxyHandler.backends = BACKENDS
    tp = threading.Thread(target=start_proxy, args=(18090,), daemon=True)
    tp.start()

    time.sleep(0.5)  # 等服务起来

    print("=" * 60)
    print("反向代理已就绪：127.0.0.1:18090 -> 后端 B1/B2（轮询）")
    print("=" * 60)

    # 客户端：连续发 4 个请求，观察轮询效果
    for i in range(4):
        c = http.client.HTTPConnection("127.0.0.1", 18090, timeout=3)
        c.request("GET", "/api/users/%d" % i)
        r = c.getresponse()
        body = r.read().decode()
        print("[CLIENT] #%d 状态=%d 后端头=%s 响应=%s" %
              (i, r.status, r.getheader("X-Backend"), body))
        c.close()
        time.sleep(0.05)

    print("=" * 60)
    print("观察：X-Backend 在 B1/B2 之间交替，验证轮询负载均衡")
\`,
  },

  // =========================================================
  // 第二章：CDN 与缓存策略
  // =========================================================
  {
    id: "net-cdn",
    title: "CDN 与缓存策略",
    icon: "🌍",
    group: "工程实践篇",
    content: \`## 一、为什么这一章重要

做前端要做性能优化，做后端要做接口加速，做运维要扛大流量——三者的交汇点就是**缓存**。一个设计良好的缓存策略，能让你的服务在同等硬件下扛住 10 倍甚至 100 倍的流量；一个糟糕的缓存策略，能让用户看到陈旧数据甚至缓存雪崩打挂整个系统。

CDN 是缓存的极致形态：把缓存推到离用户最近的网络边缘。理解 CDN 必须先理解 HTTP 缓存机制，所以这一章会从 HTTP 缓存讲起，再到 CDN 工作原理，最后落到 Nginx 缓存配置和缓存策略设计。

### 二、CDN 是什么

CDN（Content Delivery Network，内容分发网络）是一组分布在不同地理位置的服务器群，它们互相协作，把内容缓存到离用户最近的"边缘节点"，让用户就近获取，从而加速访问。

没有 CDN 的世界：

\`\`\`
[ 北京用户 ] -----跨省/跨国链路-----> [ 源站(杭州) ]
[ 广州用户 ] -----跨省/跨国链路-----> [ 源站(杭州) ]
[ 美国用户 ] -----跨国+海缆链路-----> [ 源站(杭州) ]
\`\`\`

跨地区/跨国链路 RTT 高、丢包率高，慢且不稳定。

有 CDN 的世界：

\`\`\`
[ 北京用户 ] -> [ CDN 北京边缘 ] --回源--> [ 源站(杭州) ]
[ 广州用户 ] -> [ CDN 广州边缘 ] --回源--> [ 源站(杭州) ]
[ 美国用户 ] -> [ CDN 美国边缘 ] --回源--> [ 源站(杭州) ]
\`\`\`

用户只跟最近的边缘节点通信，RTT 几毫秒；边缘节点缓存命中时根本不回源，秒开。

### 三、CDN 工作原理：DNS 调度 + 边缘缓存 + 回源

CDN 的工作流可以拆成三步：

**第一步：DNS 调度——把用户分到最近的边缘节点**

用户访问 `cdn.example.com` 时，DNS 解析不是返回固定 IP，而是返回"离用户最近的 CDN 节点 IP"。CDN 厂商的智能 DNS 会根据用户 EDNS Client Subnet（ECS）携带的客户端网段、节点健康度、负载情况，动态返回最佳节点 IP。

\`\`\`
用户 -> LocalDNS -> CDN智能DNS -> 返回最近边缘节点IP
\`\`\`

**第二步：边缘节点缓存命中判断**

用户请求到达边缘节点后，节点先查本地缓存：

- 命中（且未过期）→ 直接返回，毫秒级。
- 命中但已过期 → 向上层（中心节点或源站）回源验证，命中返回 304，未命中拉取新内容。
- 未命中 → 回源拉取，缓存后返回。

**第三步：回源**

缓存未命中时，CDN 节点向源站（或上一层中心节点）发起请求，拿到响应后缓存一份，再返回给用户。回源是慢路径，要尽量避免。

### 四、CDN 节点层级架构

CDN 一般是两级甚至三级架构：

\`\`\`
[ 用户 ]
   |
[ L1 边缘节点 ]   <-- 命中率最高，离用户最近
   | (未命中回源)
[ L2 中心节点 ]   <-- 区域中心，缓存全量热门内容
   | (未命中回源)
[ 源站 ]          <-- 客户业务服务器
\`\`\`

L1 边缘节点数量多、分布广，但每个节点缓存容量小；L2 中心节点数量少但容量大，缓存命中率极高。这种分层让回源流量逐层收敛——L1 未命中打 L2，L2 命中就不用打源站，源站压力被极大稀释。

### 五、缓存命中层级

一次请求要查的缓存层级，从近到远：

\`\`\`
浏览器缓存 -> CDN边缘 -> CDN中心 -> 源站
\`\`\`

越靠前命中越快。浏览器命中是 0ms（根本不发请求），CDN 边缘命中是几毫秒，回源是几十到几百毫秒。所以**让请求尽量在前面的层级命中**是缓存设计的核心目标。

### 六、HTTP 缓存机制详解

HTTP 缓存分两大类：**强缓存**和**协商缓存**。

#### 6.1 强缓存

强缓存命中时，浏览器**根本不发请求**，直接用本地副本。控制强缓存的头：

- `Cache-Control: max-age=3600`：缓存 3600 秒，HTTP/1.1 主推。
- `Expires: Wed, 01 Jul 2026 00:00:00 GMT`：绝对过期时间，HTTP/1.0，受客户端时钟影响，已不推荐单独使用。

强缓存命中的特征：浏览器 Network 面板显示 `(from disk cache)` 或 `(from memory cache)`，状态码仍是 200，但请求没真的发出去。

#### 6.2 协商缓存

强缓存过期后，浏览器发请求前先问服务器"我的副本还能用吗"。控制协商缓存的两对头：

| 请求头 | 响应头 | 判断依据 |
|--------|--------|---------|
| If-None-Match | ETag | 资源内容的哈希 |
| If-Modified-Since | Last-Modified | 资源最后修改时间 |

服务器比对后：

- 没变 → 返回 `304 Not Modified`，无 body，浏览器用本地副本。
- 变了 → 返回 `200 OK` + 新内容 + 新的 ETag/Last-Modified。

ETag 优先级高于 Last-Modified，因为 ETag 能区分"内容变了但修改时间没变"和"内容没变但修改时间变了"的边界情况。

#### 6.3 Cache-Control 指令详解

`Cache-Control` 是 HTTP/1.1 缓存控制的核心，指令很丰富：

| 指令 | 含义 |
|------|------|
| max-age=N | 缓存 N 秒后过期 |
| s-maxage=N | 共享缓存（CDN/代理）的过期时间，覆盖 max-age |
| public | 允许中间代理缓存（默认就是允许） |
| private | 只允许浏览器缓存，中间代理不能缓存（如用户私人数据） |
| no-cache | **不是不缓存**，而是缓存后每次用都要回源验证（强制走协商缓存） |
| no-store | 真正的不缓存，连磁盘都不写（敏感数据） |
| must-revalidate | 过期后必须回源验证，不能用陈旧副本 |
| proxy-revalidate | 共享缓存过期后必须回源验证（类似 must-revalidate 但只对代理） |
| immutable | 资源永不变化，过期前即使刷新也不发请求（配合带 hash 的文件名） |

**最常见的误解**：`no-cache` 不是"不缓存"！它名字误导，真正含义是"缓存了但用之前必须验证"。真正不缓存是 `no-store`。

### 七、缓存新鲜度计算

CDN 节点收到响应后，要算"这个缓存还新鲜吗"。公式：

\`\`\`
新鲜度寿命 = max-age  (或 s-maxage，对共享缓存优先)
当前 age = 当前时间 - 响应生成时间 + Age头(经过的代理添加)
是否新鲜 = 当前 age < 新鲜度寿命
\`\`\`

`Age` 响应头表示"这个响应在缓存里待了多少秒"，每经过一个代理加一跳。CDN 节点用 `Age` 头判断缓存是否过期。

### 八、CDN 缓存刷新与预热

- **刷新（Purge）**：主动把某个 URL 从缓存里删掉，下次请求强制回源。用于内容更新后让用户立刻看到新版本。
- **预热（Prefetch）**：在用户访问前，主动把内容推到边缘节点缓存。用于新版本上线前预热，避免上线瞬间大量回源。

工程实践：前端发版时，文件名带 hash（`app.abc123.js`），新文件名是新的 URL，CDN 自动回源拉取，老文件名自然过期。**永远不要把 no-cache 用在带 hash 的静态资源上**——它们内容不变，应该 max-age 设一年。

### 九、静态加速 vs 动态加速

- **静态加速**：缓存图片、CSS、JS、视频等不变的内容，命中即返回。
- **动态加速**：API 接口、HTML 动态生成的内容不能缓存，CDN 通过"网络路径优化"加速——选最优路由、TCP 连接复用、动态压缩。阿里云 DCDN、腾讯云 EdgeOne 都有这个能力。

### 十、Nginx 缓存配置

Nginx 反向代理也能做缓存，配置典型如下：

\`\`\`nginx
# 定义缓存区
proxy_cache_path /var/cache/nginx
                 levels=1:2
                 keys_zone=api_cache:10m
                 max_size=1g
                 inactive=60m
                 use_temp_path=off;

server {
    location /api {
        proxy_cache api_cache;
        proxy_cache_key "\$scheme\$host\$request_uri";
        proxy_cache_valid 200 10m;     # 200 响应缓存 10 分钟
        proxy_cache_valid 404 1m;     # 404 缓存 1 分钟
        proxy_cache_use_stale error timeout updating;  # 回源失败时用旧缓存兜底
        proxy_cache_lock on;         # 同一 key 回源时只放一个请求，其他等待
        add_header X-Cache-Status \$upstream_cache_status;  # MISS/HIT/EXPIRED
        proxy_pass http://backend;
    }
}
\`\`\`

`$upstream_cache_status` 是调试利器，值有 MISS（未命中）、HIT（命中）、EXPIRED（过期已回源）、STALE（用了旧缓存）、UPDATING（正在更新）。

### 十一、缓存策略设计

不同资源用不同策略：

| 资源类型 | 策略 | 理由 |
|---------|------|------|
| 带 hash 的静态资源 | Cache-Control: public, max-age=31536000, immutable | 内容不变，永久缓存 |
| HTML 入口 | Cache-Control: no-cache | 必须每次验证，但可省 body |
| 用户私人 API | Cache-Control: private, no-cache | 中间代理不能缓存，浏览器走协商缓存 |
| 实时数据 API | Cache-Control: no-store | 完全不缓存 |
| 列表/聚合接口 | Cache-Control: public, s-maxage=60 | CDN 缓存 60 秒，浏览器不缓存 |

### 十二、常见陷阱与最佳实践

1. **no-cache 误用为不缓存**：真正不缓存是 no-store。no-cache 仍会缓存，每次验证。
2. **private 漏配**：用户私人数据没加 private，被 CDN 缓存后串号——A 的订单页被 B 看到。涉及用户隐私的接口必须 private 或 no-store。
3. **缓存雪崩**：同一批缓存同时过期，瞬间大量回源打挂源站。解法：过期时间加随机抖动 `max-age=3600+rand(0,300)`；或用 singleflight（proxy_cache_lock）合并回源。
4. **缓存击穿**：单个热 key 过期瞬间，大量请求同时回源。解法：互斥锁只放一个回源，其他等；或永不过期+后台异步刷新。
5. **缓存穿透**：查询不存在的 key，缓存和数据库都没有，每次都打数据库。解法：缓存空值（短 TTL）；布隆过滤器前置拦截。
6. **POST 缓存**：默认 POST 不缓存，但有的 CDN 支持缓存 POST 响应，要谨慎——除非接口幂等且响应稳定。
7. **Vary 头忽略**：响应带 `Vary: Accept-Encoding` 时，CDN 要按客户端编码分别缓存（gzip/br/identity），忘了 Vary 会导致给不支持 br 的浏览器返回 br 内容。
8. **大文件缓存**：CDN 缓存大文件要分片（如 HLS 视频分片），单文件太大缓存命中率低且首包慢。
9. **CDN 刷新不彻底**：刷新了主文件没刷新引用的子资源，或刷新了一个地域其他地域没刷新，导致版本不一致。

### 十三、面试要点

**Q1：强缓存和协商缓存的区别？**
A：强缓存命中时浏览器不发请求，直接用本地副本（200 from cache）；协商缓存是强缓存过期后浏览器发请求验证（带 If-None-Match/If-Modified-Since），服务器返回 304 表示可用本地副本，返回 200 表示有新内容。强缓存用 Cache-Control/Expires，协商缓存用 ETag/Last-Modified。

**Q2：no-cache 和 no-store 的区别？**
A：no-cache 仍会缓存，但每次使用前必须向源站验证（强制协商缓存）；no-store 是真正的不缓存，连磁盘都不写。常被误用——以为 no-cache 是不缓存，实际它还是会缓存。

**Q3：ETag 和 Last-Modified 哪个优先？**
A：ETag 优先。Last-Modified 只能精确到秒，且修改时间变了内容可能没变（如重新保存）；ETag 是内容哈希，能精确识别内容是否变化。但 ETag 计算成本高，要根据场景权衡。

**Q4：CDN 如何把用户调度到最近的节点？**
A：通过智能 DNS。CDN 厂商的权威 DNS 根据请求来源（LocalDNS IP 或 EDNS Client Subnet 携带的用户网段）、节点健康度和负载，动态返回最近的边缘节点 IP。有的还支持 HTTPDNS（客户端直连调度服务，绕过 LocalDNS 劫持）。

**Q5：缓存雪崩、击穿、穿透怎么解决？**
A：雪崩——过期时间加随机抖动 + 多级缓存；击穿——互斥锁（singleflight）只放一个回源；穿透——缓存空值 + 布隆过滤器前置。

**Q6：带 hash 的静态资源怎么配缓存？**
A：Cache-Control: public, max-age=31536000, immutable。文件名带内容 hash，内容变了 hash 变了 URL 就变了，所以可以永久缓存且不需要验证。HTML 入口文件不要强缓存（要 no-cache），否则用户拿不到新 hash 的引用。

### 十四、小结

- CDN 通过 DNS 调度 + 边缘缓存 + 回源，把内容推到离用户最近的地方。
- HTTP 缓存分强缓存（Cache-Control/Expires，命中不发请求）和协商缓存（ETag/Last-Modified，命中返回 304）。
- Cache-Control 指令要分清：no-cache 是"用了要验证"，no-store 才是"不缓存"，private 防 CDN 缓存私人数据。
- 缓存设计要分级：带 hash 静态资源永久缓存，HTML 走协商缓存，私人 API private/no-store，列表接口 s-maxage 短缓存。
- 防雪崩加随机过期，防击穿加互斥锁，防穿透缓存空值 + 布隆过滤器。
\`,
    code: \`# ============================================================
# 第二章代码演示：CDN 与缓存策略（ETag 协商缓存）
# ------------------------------------------------------------
# 演示内容：
#   1. 用 http.server 启动 server，对资源生成 ETag
#   2. 客户端第一次请求得到 200 + ETag
#   3. 客户端第二次带 If-None-Match 请求，server 返回 304
#   4. 模拟 CDN 缓存层：边缘命中 / 未命中 / 回源
# ============================================================
import http.server
import socketserver
import http.client
import hashlib
import threading
import time

# ---------- 模拟源站：带 ETag 协商缓存 ----------
RESOURCE = b"<!doctype html><html><body>CDN 缓存演示 v1</body></html>"
RESOURCE_ETAG = '"' + hashlib.md5(RESOURCE).hexdigest() + '"'

class OriginHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/index.html":
            self.send_response(404)
            self.end_headers()
            return

        # 1) 协商缓存：检查 If-None-Match
        inm = self.headers.get("If-None-Match")
        if inm == RESOURCE_ETAG:
            print("[ORIGIN] 客户端带 If-None-Match=%s，命中，返回 304" % inm)
            self.send_response(304)
            self.send_header("ETag", RESOURCE_ETAG)
            self.send_header("Cache-Control", "max-age=5, s-maxage=30")
            self.end_headers()
            return

        # 2) 强缓存未命中或首次请求：返回 200 + body + ETag
        print("[ORIGIN] 回源！返回完整内容 %d bytes, ETag=%s" %
              (len(RESOURCE), RESOURCE_ETAG))
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(RESOURCE)))
        self.send_header("ETag", RESOURCE_ETAG)
        self.send_header("Cache-Control", "max-age=5, s-maxage=30")
        self.end_headers()
        self.wfile.write(RESOURCE)

    def log_message(self, *a):
        pass

def start_origin(port):
    with socketserver.TCPServer(("127.0.0.1", port),
                                 OriginHandler) as httpd:
        httpd.serve_forever()

# ---------- 模拟 CDN 边缘节点缓存 ----------
class EdgeCache:
    def __init__(self):
        self.store = {}   # url -> (body, etag, expire_ts)
    def get(self, url):
        item = self.store.get(url)
        if not item:
            return None
        body, etag, exp = item
        if time.time() > exp:
            return None  # 过期
        return body, etag
    def set(self, url, body, etag, ttl):
        self.store[url] = (body, etag, time.time() + ttl)

edge = EdgeCache()
ORIGIN_PORT = 18101

# ---------- 模拟 CDN 边缘：先查本地，未命中回源 ----------
class EdgeHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        url = self.path
        # 1) 边缘缓存命中？
        hit = edge.get(url)
        if hit:
            body, etag = hit
            print("[CDN边缘] 命中本地缓存，直接返回（不回源）")
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("ETag", etag)
            self.send_header("X-Cache", "HIT")
            self.end_headers()
            self.wfile.write(body)
            return

        # 2) 未命中：回源
        print("[CDN边缘] 未命中，回源拉取...")
        conn = http.client.HTTPConnection("127.0.0.1", ORIGIN_PORT, timeout=3)
        conn.request("GET", url)
        resp = conn.getresponse()
        data = resp.read()
        etag = resp.getheader("ETag")
        conn.close()

        # 3) 缓存到边缘（用 s-maxage）
        if resp.status == 200 and etag:
            edge.set(url, data, etag, ttl=30)
            print("[CDN边缘] 已缓存到边缘节点，TTL=30s")

        # 4) 返回给客户端
        self.send_response(resp.status)
        self.send_header("Content-Type", resp.getheader("Content-Type"))
        self.send_header("Content-Length", str(len(data)))
        if etag:
            self.send_header("ETag", etag)
        self.send_header("X-Cache", "MISS")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass

def start_edge(port):
    with socketserver.TCPServer(("127.0.0.1", port),
                                EdgeHandler) as httpd:
        httpd.serve_forever()

# ---------- 启动 ----------
if __name__ == "__main__":
    threading.Thread(target=start_origin, args=(ORIGIN_PORT,),
                     daemon=True).start()
    threading.Thread(target=start_edge, args=(18100,),
                     daemon=True).start()
    time.sleep(0.4)

    print("=" * 60)
    print("CDN 演示：边缘 18100 -> 源站 18101")
    print("=" * 60)

    # 客户端模拟浏览器：先无缓存访问，再带 If-None-Match 协商
    for i in range(3):
        c = http.client.HTTPConnection("127.0.0.1", 18100, timeout=3)
        headers = {}
        if i == 2:
            # 第三次模拟协商缓存
            headers["If-None-Match"] = RESOURCE_ETAG
        c.request("GET", "/index.html", headers=headers)
        r = c.getresponse()
        body = r.read()
        print("[CLIENT] 第%d次：状态=%d X-Cache=%s 长度=%d ETag=%s" %
              (i + 1, r.status, r.getheader("X-Cache"),
               len(body), r.getheader("ETag")))
        c.close()
        time.sleep(0.1)

    print("=" * 60)
    print("观察：")
    print("  第1次 MISS 回源；第2次 HIT 命中边缘缓存；")
    print("  第3次带 If-None-Match 协商（边缘未实现协商，直接 HIT）")
\`,
  },

  // =========================================================
  // 第三章：抓包与网络调试
  // =========================================================
  {
    id: "net-debug",
    title: "抓包与网络调试",
    icon: "🔍",
    group: "工程实践篇",
    content: \`## 一、为什么这一章重要

线上报警"接口慢"、"连不上"、"偶发超时"，DNS 解析诡异、TLS 握手失败、跨域被拦、CDN 回源异常……这些问题的排查都依赖一套网络调试技能。**不会抓包、不会用 curl、不会读 Wireshark 的工程师，遇到网络问题只能瞎猜**。这一章把工作中真正高频的网络调试工具和思路讲清楚。

### 二、网络调试工具大全

按排查层次从下到上：

| 工具 | 作用 | 层次 | 典型用法 |
|------|------|------|---------|
| ping | 测试连通性、测 RTT | ICMP | ping example.com |
| traceroute / mtr | 追踪路由路径 | IP | mtr example.com |
| telnet / nc | 测试端口连通性 | TCP | nc -zv host 443 |
| nslookup / dig | DNS 查询 | DNS | dig +trace example.com |
| curl | HTTP 请求调试 | HTTP | curl -v https://x.com |
| tcpdump | 命令行抓包 | TCP/IP | tcpdump -i any port 80 |
| Wireshark | 图形化抓包分析 | 全栈 | 过滤 http.request |
| ss / netstat | 查看连接状态 | TCP | ss -tnp |
| lsof | 查端口占用 | 系统 | lsof -i:8080 |

### 三、ping：连通性 + RTT

ping 用 ICMP Echo，是最基础的连通性测试：

\`\`\`bash
$ ping -c 4 example.com
PING example.com (93.184.216.34): 56 data bytes
64 bytes from 93.184.216.34: icmp_seq=0 ttl=56 time=12.3 ms
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=11.8 ms
--- 4 packets transmitted, 4 received, 0.0% packet loss
round-trip min/avg/max = 11.8/12.1/12.3 ms
\`\`\`

看三件事：**通不通**（packet loss）、**RTT 多少**（time）、**TTL 多少**（经过的跳数 ≈ 64 - TTL）。

注意：很多服务器禁 ICMP（安全策略），ping 不通不代表 HTTP 不通。ping 是必要不充分条件。

### 四、traceroute / mtr：路由路径

traceroute 用 TTL 递增的 ICMP/UDP 包，让路径上每跳路由器返回 ICMP Time Exceeded，从而描绘路径：

\`\`\`bash
$ traceroute example.com
1  gateway (192.168.1.1)  1.2 ms
2  10.0.0.1  5.3 ms
3  city-core  12.1 ms
...
\`\`\`

mtr 是 traceroute 的增强版——持续 ping 每一跳，能看到**哪一跳丢包率高**，是定位"跨国链路烂在哪一段"的神器。

\`\`\`bash
$ mtr -n example.com   # 实时刷新每跳丢包率
\`\`\`

### 五、telnet / nc：端口连通性

HTTP 服务通不通，先测端口：

\`\`\`bash
$ telnet example.com 443        # 老牌，能连上说明 TCP 端口通
$ nc -zv example.com 443        # 现代写法，-z 只测连通不发包
Connection to example.com 443 port [tcp/*] succeeded!
\`\`\`

端口不通的常见原因：防火墙、安全组、服务没起、DNS 解析错。

nc 还能手动发 HTTP 请求，调试协议细节：

\`\`\`bash
$ printf "GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n" | nc example.com 80
\`\`\`

### 六、nslookup / dig：DNS 查询

\`\`\`bash
$ dig example.com              # 查 A 记录
$ dig @8.8.8.8 example.com     # 指定 DNS 服务器
$ dig +short example.com       # 只看 IP
$ dig +trace example.com       # 从根域开始逐级解析，看完整解析链路
$ dig example.com MX           # 查邮件记录
$ dig example.com CNAME        # 查 CNAME 链（CDN 常见）
\`\`\`

排查"DNS 不通"思路：

1. dig 通不通？不通 → DNS 服务器问题或网络。
2. 返回 IP 对不对？不对 → DNS 缓存污染或配置错。
3. 多个地域解析是否一致？不一致 → 智能 DNS 分流或被劫持。

### 七、curl：HTTP 调试瑞士军刀

curl 是工程师最常用的 HTTP 调试工具，关键参数：

| 参数 | 作用 |
|------|------|
| -v / --verbose | 打印详细请求/响应（含握手） |
| -i | 输出包含响应头 |
| -H "Key: Val" | 加请求头 |
| -X POST | 指定方法 |
| -d 'data' / --data | 发送 body（默认 Content-Type: application/x-www-form-urlencoded） |
| --data-binary @file | 发送文件内容 |
| -k | 跳过 TLS 证书校验 |
| --resolve host:port:ip | 强制把域名解析到指定 IP（绕过 DNS） |
| -w "@format" | 输出自定义指标（DNS 时间、连接时间、总耗时） |
| -o file | 输出到文件 |
| -L | 跟随 30x 跳转 |
| --limit-rate 1k | 限速（模拟慢网络） |

调试每个阶段耗时：

\`\`\`bash
$ curl -w "DNS:%{time_namelookup} 连接:%{time_connect} SSL:%{time_appconnect} 首字节:%{time_starttransfer} 总:%{time_total}\\n" -o /dev/null -s https://example.com
DNS:0.012 连接:0.045 SSL:0.120 首字节:0.180 总:0.185
\`\`\`

这个命令能精确告诉你慢在哪一步——DNS 慢、连接慢、TLS 慢、还是服务端处理慢。

### 八、抓包原理：混杂模式 + libpcap

抓包工具（tcpdump、Wireshark）能在网卡上"窃听"所有经过的包，靠的是网卡的**混杂模式（Promiscuous Mode）**——默认网卡只收发给自己 MAC 的包，混杂模式下接收所有包。底层用 libpcap（Linux/Mac）/ WinPcap（Windows）从内核抓包。

抓包的工作流：网卡混杂模式 -> 内核 BPF 过滤 -> libpcap -> tcpdump/Wireshark。

### 九、tcpdump 常用过滤器

tcpdump 用 BPF（Berkeley Packet Filter）表达式过滤，掌握几个组合就够用：

\`\`\`bash
# 基本抓包
tcpdump -i any                      # 抓所有网卡
tcpdump -i eth0 -n                 # 不解析 IP/端口为名字（更快）

# 按 IP/端口过滤
tcpdump host 10.0.0.1               # 源或目的是 10.0.0.1
tcpdump src host 10.0.0.1           # 只看源
tcpdump dst port 443                # 只看目的端口 443
tcpdump port 80 or port 443

# 按协议过滤
tcpdump tcp                         # 只看 TCP
tcpdump udp
tcpdump icmp
tcpdump arp

# 组合
tcpdump "tcp port 443 and host 10.0.0.1"
tcpdump "tcp[tcpflags] & tcp-syn != 0"     # 只看 SYN 包（建连）
tcpdump "tcp[tcpflags] & tcp-rst != 0"     # 只看 RST（异常断连）

# 写文件给 Wireshark 分析
tcpdump -i eth0 -w /tmp/a.pcap port 443
\`\`\`

### 十、Wireshark 过滤表达式

Wireshark 的显示过滤器语法跟 BPF 不一样，更高级：

\`\`\`
http.request.method == "GET"               # 所有 GET 请求
http.response.code == 500                  # 所有 500 响应
http.host contains "example"               # Host 含 example
tcp.port == 443 and ip.addr == 10.0.0.1
tcp.analysis.retransmission                 # 重传包（丢包证据）
tcp.flags.syn == 1 and tcp.flags.ack == 0   # SYN 握手
tls.handshake.type == 1                    # TLS ClientHello
\`\`\`

Wireshark 强在右键"Follow TCP Stream"——能把一次 TCP 连接的双向数据流拼出来，调试 HTTP 协议细节神器。

### 十一、浏览器开发者工具

前端调试必备，Network 面板是核心：

- **瀑布图（Waterfall）**：每个请求的时间线，颜色区分阶段。
- **Timing 标签**：单请求的各阶段耗时。

Timing 各阶段含义（务必记牢，面试高频）：

| 阶段 | 含义 | 慢的常见原因 |
|------|------|-------------|
| Queueing | 排队（浏览器并发限制） | 同域名超过 6 个并发 |
| Stalled | 停滞（等 socket） | 高优先级请求抢占 |
| DNS Lookup | DNS 解析 | 首次访问、域名多 |
| Initial Connection | TCP 建连 | RTT 高 |
| SSL | TLS 握手 | 证书链长、RTT 高 |
| Request sent | 发请求 | 一般很快 |
| Waiting (TTFB) | 等首字节 | **后端慢**（最常见瓶颈） |
| Content Download | 下响应 | 带宽小、响应大 |

TTFB（Time To First Byte）慢，几乎一定是后端处理慢或网络 RTT 高；Content Download 慢，是响应体太大或带宽不够。

### 十二、HTTP 状态码排查思路

| 状态码 | 含义 | 排查方向 |
|--------|------|---------|
| 200 | 成功 | - |
| 301/302 | 跳转 | 看 Location，是否循环跳转 |
| 304 | 协商缓存命中 | 正常 |
| 400 | 请求格式错 | 参数/JSON 格式 |
| 401 | 未认证 | Token/Cookie 过期 |
| 403 | 无权限 | 鉴权策略、CORS |
| 404 | 资源不存在 | URL、路由、文件路径 |
| 405 | 方法不允许 | 路由没注册该方法 |
| 499 | 客户端断开 | 客户端超时先断 |
| 500 | 服务端错 | 看后端日志、空指针 |
| 502 | 网关错 | 后端没起/挂了 |
| 503 | 不可用 | 后端过载、限流 |
| 504 | 网关超时 | 后端响应慢，Nginx 超时 |

502 和 504 的区别：502 是后端连接建立了但返回了错误响应（如进程崩了）；504 是 Nginx 在 read_timeout 内根本没收到后端响应。

### 十三、常见网络问题排查

**问题 1：DNS 不通**
- dig +trace 看解析到哪断。
- 换 DNS 服务器（8.8.8.8 / 114.114.114.114）对比。
- /etc/hosts 临时绕过。
- TTL 看是否缓存了旧记录。

**问题 2：端口不通**
- nc -zv 测 TCP。
- telnet 测。
- 排查：安全组、防火墙（iptables/firewalld）、服务是否监听 0.0.0.0 而非 127.0.0.1（127.0.0.1 外部连不上）。

**问题 3：TLS 握手失败**
- openssl s_client -connect host:443 -servername host 看握手详情。
- 常见：证书过期、证书链不全（中间证书没配）、SNI 没配（一个 IP 多域名）、协议版本不支持（禁了 TLSv1.0）。

**问题 4：跨域被拦**
- 看响应有没有 Access-Control-Allow-Origin。
- 预检 OPTIONS 请求是否被正确处理。
- Cookie 跨域要 Access-Control-Allow-Credentials: true 且 ACAO 不能是 *（必须具体域名）。

**问题 5：偶发超时**
- mtr 看链路哪段丢包。
- ss -tnp 看连接状态分布（大量 CLOSE_WAIT？TIME_WAIT？）。
- 内核参数 net.ipv4.tcp_tw_reuse、tcp_max_tw_buckets。
- 看是否连接池满了、文件描述符用尽（ulimit -n）。

### 十四、常见陷阱与最佳实践

1. **ping 不通就以为服务挂了**：很多服务器禁 ICMP。HTTP 通不通要用 curl 测，不要被 ping 误导。
2. **curl 不带 -v 看不到细节**：调试时永远加 -v，能看到握手、证书、头部、重定向全过程。
3. **tcpdump 抓太多刷屏**：永远加过滤条件，写文件用 -w，给 Wireshark 分析。
4. **Wireshark 不会 Follow Stream**：调试 HTTP 一定要右键 Follow TCP Stream，能看到完整请求/响应原文。
5. **TIME_WAIT 误判为问题**：高并发短连接场景 TIME_WAIT 多是正常的，内核会复用。只有满了（接近 tcp_max_tw_buckets）才需要调。
6. **以为 504 是后端报错**：504 是 Nginx 等不到后端响应，要看后端是不是真的慢，还是 Nginx read_timeout 配太小。
7. **本地能连线上不能连**：本地直连后端，线上经过 SLB/Nginx/CDN，多了一层。要 curl --resolve 绕过 DNS，或加 X-Forwarded-For 复现。
8. **抓包看不到 HTTPS 内容**：HTTPS 加密了，要解密得用 SSLKEYLOGFILE 环境变量 + Wireshark 配置 RSA Session Keys，或者用 mitmproxy 中间人代理。

### 十五、面试要点

**Q1：curl -w 各阶段时间分别测什么？**
A：time_namelookup 是 DNS 解析耗时；time_connect 是 TCP 建连耗时；time_appconnect 是 TLS 握手耗时；time_starttransfer 是 TTFB（首字节到达）；time_total 是总耗时。用这套能精确定位慢在哪一步。

**Q2：浏览器 Waterfall 里 TTFB 慢怎么排查？**
A：TTFB = DNS + 连接 + TLS + 服务端处理。先 curl -w 分阶段看，DNS 慢换 DNS/用 dns-prefetch；连接慢看 RTT；TLS 慢看证书链、是否开了 session resumption；服务端慢看后端日志、慢查询、下游依赖。

**Q3：502 和 504 的区别？怎么排查？**
A：502 Bad Gateway 是后端返回了无效响应（进程崩了、连接被重置）；504 Gateway Timeout 是网关在超时时间内没收到后端任何响应。排查 502 看后端进程是否存活、日志是否报错；排查 504 看后端是否真的慢、网关 read_timeout 是否配太小。

**Q4：tcpdump 怎么抓 HTTPS 并解密？**
A：HTTPS 报文是加密的，tcpdump 直接抓看不到内容。两种方法：一是用 mitmproxy 做中间人代理，证书装到客户端信任；二是让客户端设置 SSLKEYLOGFILE 环境变量导出会话密钥，Wireshark 加载该文件即可解密。

**Q5：如何排查偶发 TCP 连接失败？**
A：ss -tnp 看连接状态分布，是否有大量 SYN_SENT（建连失败）、CLOSE_WAIT（对端关了没 close）；netstat -s 看重传、溢出统计；lsof 看文件描述符是否用尽；mtr 看链路丢包；查内核参数 somaxconn、tcp_max_syn_backlog 是否够。

### 十六、小结

- 工具按层次：ping/traceroute 测网络层，nc/telnet 测传输层，dig 测 DNS，curl 测 HTTP，tcpdump/Wireshark 抓全栈。
- curl -w 分阶段时间是定位 HTTP 慢在哪一步的神器，必背。
- 浏览器 Timing 各阶段：Queueing/DNS/Connection/SSL/Request/Waiting(TTFB)/Download，TTFB 慢几乎一定是后端慢。
- 502 是后端返回错（进程崩），504 是网关等不到响应（后端慢或超时小）。
- HTTPS 抓包用 mitmproxy 或 SSLKEYLOGFILE + Wireshark。
\`,
    code: \`# ============================================================
# 第三章代码演示：抓包与网络调试
# ------------------------------------------------------------
# 演示内容：
#   1. 用 http.server 启动本地 server
#   2. 用 http.client 发请求，打印完整的请求/响应报文
#   3. 模拟抓包：打印 socket 收发的每个字节
#   4. 给出 curl 等价命令
# ============================================================
import http.server
import socketserver
import http.client
import socket
import threading
import time

# ---------- 启动一个本地 server ----------
class DebugHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"{\\"status\\":\\"ok\\",\\"path\\":\\"" + self.path.encode() + b"\\"}"
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Response-Id", "req-001")
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a):
        pass

def start_server(port):
    with socketserver.TCPServer(("127.0.0.1", port),
                                DebugHandler) as httpd:
        httpd.serve_forever()

# ---------- 1) 用 http.client 打印完整报文 ----------
def http_client_request(host, port, path):
    print("---- [http.client 调试模式] ----")
    conn = http.client.HTTPConnection(host, port, timeout=3)
    # 手动构造请求，能看到完整报文
    conn.putrequest("GET", path)
    conn.putheader("Host", "%s:%d" % (host, port))
    conn.putheader("User-Agent", "debug-client/1.0")
    conn.putheader("Accept", "application/json")
    conn.endheaders()

    resp = conn.getresponse()
    print(">>> 请求行: GET %s HTTP/1.1" % path)
    print(">>> 请求头: Host, User-Agent, Accept")
    print("<<< 状态行: HTTP/1.1 %d %s" % (resp.status, resp.reason))
    print("<<< 响应头:")
    for k, v in resp.getheaders():
        print("      %s: %s" % (k, v))
    body = resp.read()
    print("<<< 响应体 (%d bytes): %s" % (len(body), body.decode()))
    conn.close()
    return body

# ---------- 2) 用 raw socket 模拟抓包 ----------
def raw_socket_capture(host, port, path):
    print("---- [raw socket 抓包模式] ----")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(3)
    sock.connect((host, port))

    # 构造 HTTP 请求报文
    request = (
        "GET %s HTTP/1.1\\r\\n"
        "Host: %s:%d\\r\\n"
        "Connection: close\\r\\n"
        "\\r\\n"
    ) % (path, host, port)
    req_bytes = request.encode()
    print(">>> 发送 %d bytes 原始报文:" % len(req_bytes))
    print(req_bytes.decode(), end="")

    sock.sendall(req_bytes)

    # 接收全部响应
    chunks = []
    while True:
        try:
            data = sock.recv(4096)
        except socket.timeout:
            break
        if not data:
            break
        chunks.append(data)
    sock.close()

    raw = b"".join(chunks)
    print("<<< 收到 %d bytes 原始报文:" % len(raw))
    # 分离状态行/头/体
    head, _, body = raw.partition(b"\\r\\n\\r\\n")
    print("--- 报文头 ---")
    print(head.decode(errors="replace"))
    print("--- 报文体 (%d bytes) ---" % len(body))
    print(body.decode(errors="replace"))

# ---------- 启动 ----------
if __name__ == "__main__":
    PORT = 18200
    threading.Thread(target=start_server, args=(PORT,),
                     daemon=True).start()
    time.sleep(0.3)

    print("=" * 60)
    print("网络调试演示：本地 server 127.0.0.1:%d" % PORT)
    print("=" * 60)

    # 给出等价的 curl 命令
    print("\\n[等价 curl 命令]")
    print("  curl -v http://127.0.0.1:%d/api/test" % PORT)
    print("  curl -w 'DNS:%{time_namelookup} TTFB:%{time_starttransfer} 总:%{time_total}\\n'"
          " -o /dev/null -s http://127.0.0.1:%d/api/test" % PORT)
    print("  printf 'GET /api/test HTTP/1.1\\r\\nHost: x\\r\\n\\r\\n' | nc 127.0.0.1 %d" % PORT)
    print("  tcpdump -i any -A -s0 'tcp port %d'" % PORT)

    print("\\n" + "=" * 60)
    print("[请求 1] 高层 API: http.client")
    print("=" * 60)
    http_client_request("127.0.0.1", PORT, "/api/test")

    print("\\n" + "=" * 60)
    print("[请求 2] 底层抓包: raw socket")
    print("=" * 60)
    raw_socket_capture("127.0.0.1", PORT, "/api/test")

    print("\\n" + "=" * 60)
    print("观察：raw socket 模式打印了完整的 HTTP 报文，")
    print("和 tcpdump/Wireshark Follow TCP Stream 看到的一致。")
\`,
  },

  // =========================================================
  // 第四章：网络性能优化
  // =========================================================
  {
    id: "net-performance",
    title: "网络性能优化",
    icon: "⚡",
    group: "工程实践篇",
    content: \`## 一、为什么这一章重要

性能是用户体验的生命线。Google 研究表明，页面加载时间从 1 秒到 3 秒，跳出率上升 32%；3 秒到 5 秒，跳出率再升 90%。电商页面慢 100ms，转化率就下降 1%。**网络性能优化是工程实践中投入产出比最高的一类优化**——往往改改配置、加个缓存、上个 CDN，就能让响应快一个数量级，而不需要重写业务。

这一章把网络性能的指标、优化思路、各层优化手段讲清楚，落到 Nginx 和前端工程实践。

### 二、网络性能指标

| 指标 | 含义 | 单位 |
|------|------|------|
| RTT (Round Trip Time) | 往返时间，一个包去回的时间 | ms |
| 带宽 | 链路最大吞吐 | bps (bit/s) |
| 吞吐量 | 实际传输速率 | B/s |
| 并发连接数 | 同时能维护的连接数 | 个 |
| QPS / TPS | 每秒请求/事务数 | 次/秒 |
| TTFB | 首字节到达时间 | ms |
| TTI | 可交互时间 | ms |
| LCP | 最大内容绘制 | ms |
| FCP | 首次内容绘制 | ms |

**RTT 和带宽是底层指标，TTFB/TTI/LCP 是用户感知指标**。优化要让用户感知指标变好，而不只是 RTT 变小。

#### RTT 的组成

\`\`\`
RTT = 传播延迟(物理距离/光速) + 排队延迟(路由器) + 处理延迟(协议栈)
\`\`\`

光速限制：北京到杭州直线 1200km，光纤里光速约 2×10^8 m/s，单向 6ms，往返 12ms。这是物理极限，再优化也突破不了。所以**让数据离用户近（CDN）是降 RTT 的根本手段**。

#### 带宽与吞吐量的关系

带宽是链路上限，吞吐量是实际达到的。TCP 慢启动、拥塞控制、丢包重传都会让吞吐量远低于带宽。**高 RTT 高带宽链路（跨国）下，单连接很难跑满带宽**——TCP 窗口跟不上。要靠多连接并行（HTTP/2 多路复用、下载工具多线程）来填满管道。

### 三、性能优化总体思路

四条主线：

1. **减少请求**——合并、缓存、长连接，请求越少越好。
2. **减少数据**——压缩、裁剪、按需加载，传输的字节越少越好。
3. **加快传输**——CDN 就近、HTTP/2 多路复用、TCP 调优。
4. **并行化**——多连接、异步、预加载，把串行变并行。

每个优化点都能归到这四条之一，建立这个心智模型就不会乱。

### 四、DNS 优化

DNS 解析是请求的第一步，慢会让 TTFB 直接劣化。优化手段：

- **DNS 预解析（dns-prefetch）**：HTML 头里提前发起 DNS 解析。
  \`\`\`html
  <link rel="dns-prefetch" href="//cdn.example.com">
  <link rel="dns-prefetch" href="//api.example.com">
  \`\`\`
  浏览器空闲时提前解析，等真用到时已经有结果。

- **减少域名数量**：每个新域名都要 DNS 解析 + TCP 连接 + TLS 握手。HTML 里 10 个不同域名 CDN 会有 10 套开销。合理收敛到 2-4 个域名（一个静态、一个动态、一个图片）。

- **HTTPDNS 防劫持**：运营商 LocalDNS 可能被劫持/缓存污染，移动端用 HTTPDNS——客户端直接 HTTP 请求调度服务拿 IP，绕过 LocalDNS。还能做智能调度。

- **TTL 合理**：DNS TTL 太短每次都解析，太长切换慢。线上服务用 60-600 秒，CDN 域名可以长一点。

### 五、传输层优化

#### TCP Keep-Alive 复用连接

HTTP/1.1 默认开启 Keep-Alive，一个 TCP 连接可以发多个请求，避免每次都三次握手。但要后端和 Nginx 都配好：

\`\`\`nginx
upstream backend {
    server 10.0.0.1:8080;
    keepalive 32;              # 到后端保持 32 个长连接
}
server {
    location / {
        proxy_http_version 1.1;
        proxy_set_header Connection "";   # 清空，让上游复用
        proxy_pass http://backend;
    }
}
\`\`\`

注意 `proxy_set_header Connection ""`——不清空的话 Nginx 默认发 `Connection: close`，后端每请求一连接，长连接池白搭。

#### TCP Fast Open

TFO 允许在 SYN 包里就带数据，省一个 RTT。需要客户端和服务端都支持（内核参数 `tcp_fastopen`）。HTTPS 握手能省一个 RTT，移动端收益明显。

#### 拥塞窗口调优

高带宽高 RTT 链路（跨国），默认拥塞窗口小，单连接跑不满。调大初始窗口（Linux 已默认 10）、启用 BBR 拥塞控制算法（比 CUBIC 在丢包链路上好很多）：

\`\`\`bash
# 启用 BBR
sysctl net.ipv4.tcp_congestion_control=bbr
\`\`\`

### 六、HTTP 优化

#### HTTP/2 多路复用

HTTP/1.1 一个连接同时只能处理一个请求，多个请求要排队或多开连接。HTTP/2 在一个连接上可以并发多个流（stream），彻底解决队头阻塞（HOL）。

\`\`\`nginx
server {
    listen 443 ssl http2;        # 开启 HTTP/2
    http2_push /style.css;       # 服务端推送（已逐步被 preload 取代）
}
\`\`\`

注意 HTTP/2 解决的是 TCP 层的队头阻塞，HTTP/2 仍有 TCP 层队头阻塞——单个包丢了，整个连接的所有流都要等重传。HTTP/3 用 QUIC（UDP）彻底解决。

#### HTTP/3 0-RTT

HTTP/3 基于 QUIC（UDP），握手能合并到 0-RTT——首次连接 1-RTT，重连 0-RTT 直接带数据。对移动端弱网和高 RTT 收益巨大。

#### 头部压缩 HPACK / QPACK

HTTP/1.1 每个请求都带完整 header（Cookie、User-Agent 几百字节），HTTP/2 用 HPACK 压缩 header——相同头只传一次索引，后续传索引号。HTTP/3 用 QPACK（适配 QUIC 的乱序特性）。

### 七、资源优化

#### 压缩

| 算法 | 压缩率 | 速度 | 兼容性 |
|------|--------|------|--------|
| gzip | 中 | 快 | 全 |
| brotli (br) | 高（比 gzip 小 15-25%） | 稍慢 | 现代浏览器 |
| zstd | 高 | 快 | 新 |

Nginx 配置：

\`\`\`nginx
gzip on;
gzip_min_length 1k;            # 小于 1k 不压缩（开销大于收益）
gzip_comp_level 6;             # 压缩级别 1-9，6 是性价比之选
gzip_types text/plain application/json application/javascript
           text/css image/svg+xml;
gzip_vary on;                  # 加 Vary: Accept-Encoding

# brotli（需要 ngx_brotli 模块）
brotli on;
brotli_comp_level 4;
brotli_types text/plain application/json application/javascript text/css;
\`\`\`

注意：**图片不要压缩**——JPEG/PNG/WebP 已是压缩格式，再 gzip 几乎不减小还浪费 CPU。

#### 雪碧图 / Base64 / 懒加载

- **雪碧图（Sprite）**：把多个小图标合并成一张大图，用 CSS background-position 切割。HTTP/1.1 时代有效，HTTP/2 后多路复用让小图并发加载，雪碧图收益下降。
- **Base64 内联**：小图标（< 4KB）直接 base64 编码进 CSS，省一个请求。但 base64 比原图大 33%，且不能缓存，权衡用。
- **懒加载**：图片/组件按需加载，`<img loading="lazy">`、IntersectionObserver、组件动态 import。

#### 预加载 preload / prefetch

- **preload**：当前页关键资源提前加载（高优先级）。
  \`\`\`html
  <link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
  \`\`\`
- **prefetch**：下一页可能用到的资源空闲时加载（低优先级）。
  \`\`\`html
  <link rel="prefetch" href="/next-page.js">
  \`\`\`
- **preconnect**：提前完成 DNS + TCP + TLS（比 dns-prefetch 更彻底）。
  \`\`\`html
  <link rel="preconnect" href="https://cdn.example.com">
  \`\`\`

### 八、CDN 加速

CDN 是降 RTT 最有效的手段——把静态资源推到离用户最近的边缘节点，RTT 从几十毫秒降到几毫秒。详见 CDN 章节。

实践要点：

- 静态资源全部上 CDN，源站只处理动态请求。
- 文件名带 hash，配合 immutable 永久缓存。
- HTML 入口不要上 CDN 强缓存（要 no-cache 协商）。
- 视频用 HLS 分片 + CDN 边缘缓存。

### 九、缓存策略优化

缓存是性能优化的王者，命中即 0ms。详见 CDN 章节的缓存策略设计。这里强调三点：

1. **多级缓存**：浏览器 -> CDN 边缘 -> CDN 中心 -> Nginx 缓存 -> Redis -> 数据库，层层兜底。
2. **热点预热**：大促前主动把热点 key 推到各层缓存，避免瞬时回源。
3. **失效精确**：用主动失效（刷新）而非被动过期，避免雪崩。

### 十、Nginx 性能配置综合

\`\`\`nginx
# 开启 HTTP/2 + brotli + gzip
server {
    listen 443 ssl http2;
    server_name www.example.com;

    # 开启 brotli（如果编译了模块）
    brotli on;
    brotli_types text/plain application/json application/javascript text/css;

    # gzip 兜底
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain application/json application/javascript text/css;

    # 静态资源强缓存
    location ~* \\.(js|css|png|jpg|woff2)\$ {
        root /var/www/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 协商缓存
    location / {
        root /var/www/html;
        add_header Cache-Control "no-cache";
    }

    # API 长连接复用
    location /api/ {
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_pass http://backend;
    }
}
\`\`\`

### 十一、常见陷阱与最佳实践

1. **gzip 压缩图片**：浪费 CPU 几乎不减体积。压缩只对文本类资源。
2. **HTTP/2 还在分域名**：HTTP/2 多路复用后，分域名反而增加 DNS 和握手开销。收敛到少数域名。
3. **预加载泛滥**：preload 太多反而抢占当前页关键资源带宽。只 preload 真正关键的（字体、首屏 CSS）。
4. **base64 大图**：超过 4KB 的图 base64 会让 HTML 变大、不能缓存、阻塞首屏。小图标才用。
5. **缓存策略一刀切**：所有接口都 max-age=60，私人数据被 CDN 缓存串号。要按资源类型分级。
6. **TTFB 慢只怪网络**：TTFB 主要由后端处理时间决定，网络只占 RTT 一部分。要查后端慢查询、下游依赖。
7. **CDN 没预热就大促**：大促瞬间用户涌入，CDN 缓存未命中大量回源打挂源站。要提前预热热点内容。
8. **慢启动忽略**：新建连接慢启动，长连接复用绕过慢启动。后端连接池要配够，别频繁建连。
9. **HTTP/1.1 队头阻塞**：HTTP/1.1 一个连接同时只能一个请求，浏览器开 6 个并发连接。HTTP/2 解决了，但 Nginx 到后端如果是 HTTP/1.1，后端连接仍受队头阻塞影响——保持连接池够大。

### 十二、面试要点

**Q1：常见的前端网络性能优化手段？**
A：分四类。减少请求：合并、缓存、雪碧图、长连接；减少数据：gzip/brotli 压缩、按需加载、图片格式优化（WebP）；加快传输：CDN 就近、HTTP/2 多路复用、preconnect；并行化：preload 关键资源、懒加载非关键资源、HTTP/2 多流并发。

**Q2：HTTP/2 相比 HTTP/1.1 有什么改进？**
A：核心是多路复用——一个 TCP 连接上并发多个流，解决 HTTP/1.1 的队头阻塞（HOL）；头部压缩 HPACK 省带宽；服务端推送（已逐步被 preload 取代）；二进制分帧更高效。但 HTTP/2 仍有 TCP 层队头阻塞，HTTP/3 用 QUIC 解决。

**Q3：TTFB 慢怎么排查优化？**
A：TTFB = DNS + TCP + TLS + 服务端处理。curl -w 分阶段测，DNS 慢用 dns-prefetch/HTTPDNS；TCP/TLS 慢用 Keep-Alive 复用连接、preconnect、TLS session resumption；服务端慢查后端日志、慢查询、下游依赖。CDN 能降 DNS 和 RTT。

**Q4：gzip 和 brotli 怎么选？**
A：brotli 压缩率比 gzip 高 15-25%，但压缩稍慢。静态资源预压缩优先 brotli（max 级别），动态响应用 gzip 或 brotli 中等级别（level 4-6 兼顾速度和压缩率）。要配合 Vary: Accept-Encoding，给老浏览器兜底 gzip。

**Q5：CDN 加速的本质原理？**
A：DNS 调度把用户分到最近的边缘节点，降 RTT；边缘缓存命中直接返回，不回源；分层架构（L1 边缘 -> L2 中心 -> 源站）让回源流量逐层收敛。本质是用"距离近"和"缓存命中"两个手段降 RTT 和回源量。

**Q6：如何减少 DNS 解析时间？**
A：减少域名数量（每个域名一次解析）；DNS 预解析 dns-prefetch 提前发起；preconnect 把 DNS+TCP+TLS 一起提前；用 HTTPDNS 防劫持并智能调度；合理 TTL 平衡解析速度和切换灵活性。

### 十三、小结

- 性能优化四主线：减少请求、减少数据、加快传输、并行化。
- DNS 优化：dns-prefetch、preconnect、减域名、HTTPDNS。
- 传输层：Keep-Alive 复用、TFO、BBR 拥塞控制。
- HTTP 层：HTTP/2 多路复用、HPACK 头部压缩、HTTP/3 0-RTT。
- 资源层：gzip/brotli 压缩、preload 关键资源、懒加载非关键资源、雪碧图/Base64 按场景。
- CDN 是降 RTT 根本手段，配合多级缓存和预热。
- 实践陷阱：不压缩图片、HTTP/2 还分域名、base64 大图、CDN 不预热大促雪崩。
\`,
    code: \`# ============================================================
# 第四章代码演示：网络性能优化
# ------------------------------------------------------------
# 演示内容：
#   1. 用 http.server 启动 server，演示 gzip 压缩
#   2. 对比压缩前后的响应大小
#   3. 演示 Keep-Alive 连接复用 vs 每次新建连接
#   4. 打印连接建立时间 vs 请求时间
# ============================================================
import http.server
import socketserver
import http.client
import gzip
import socket
import time
import threading

# 一段可压缩的文本（重复内容，压缩率高）
LONG_TEXT = ("网络性能优化的核心思路是减少请求、减少数据、加快传输、并行化。"
             "压缩能显著减少传输字节数，gzip 是最常见的压缩算法。\\n" * 30)
RAW_BODY = LONG_TEXT.encode("utf-8")
GZIP_BODY = gzip.compress(RAW_BODY)

# ---------- server：根据 Accept-Encoding 决定是否压缩 ----------
class PerfHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"   # 启用 keep-alive

    def do_GET(self):
        accept_enc = self.headers.get("Accept-Encoding", "")
        use_gzip = "gzip" in accept_enc

        if use_gzip:
            body = GZIP_BODY
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Vary", "Accept-Encoding")
            self.end_headers()
            self.wfile.write(body)
        else:
            body = RAW_BODY
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def log_message(self, *a):
        pass

def start_server(port):
    srv = socketserver.TCPServer(("127.0.0.1", port),
                                 PerfHandler)
    srv.serve_forever()

# ---------- 测量函数 ----------
def time_connect(host, port):
    """测量 TCP 建连时间"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    t0 = time.time()
    s.connect((host, port))
    t1 = time.time()
    s.close()
    return (t1 - t0) * 1000

# ---------- 启动 ----------
if __name__ == "__main__":
    PORT = 18300
    threading.Thread(target=start_server, args=(PORT,),
                     daemon=True).start()
    time.sleep(0.3)

    print("=" * 60)
    print("网络性能优化演示：127.0.0.1:%d" % PORT)
    print("=" * 60)

    # 1) 压缩对比
    print("\\n--- [对比 1] gzip 压缩前后大小 ---")
    print("原始 body: %d bytes" % len(RAW_BODY))
    print("gzip body: %d bytes (压缩率 %.1f%%)" %
          (len(GZIP_BODY), 100 * (1 - len(GZIP_BODY) / len(RAW_BODY))))

    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=3)
    # 不压缩
    c.request("GET", "/", headers={"Accept-Encoding": "identity"})
    r = c.getresponse()
    raw = r.read()
    print("\\n不压缩请求: 状态=%d 长度=%d bytes" % (r.status, len(raw)))
    c.close()

    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=3)
    # 压缩
    c.request("GET", "/", headers={"Accept-Encoding": "gzip"})
    r = c.getresponse()
    gz = r.read()
    print("gzip请求:   状态=%d 长度=%d bytes Content-Encoding=%s" %
          (r.status, len(gz), r.getheader("Content-Encoding")))
    # 解压验证内容一致
    decoded = gzip.decompress(gz)
    print("解压后长度: %d bytes，与原文一致: %s" %
          (len(decoded), decoded == RAW_BODY))
    c.close()

    # 2) Keep-Alive 复用 vs 每次新建
    print("\\n--- [对比 2] 连接复用 vs 每次新建 ---")

    # 测建连耗时
    conn_times = [time_connect("127.0.0.1", PORT) for _ in range(3)]
    print("TCP 建连耗时（3 次平均）: %.2f ms" %
          (sum(conn_times) / len(conn_times)))

    # 每次新建连接发请求
    t0 = time.time()
    for _ in range(5):
        c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=3)
        c.request("GET", "/", headers={"Connection": "close"})
        r = c.getresponse()
        r.read()
        c.close()
    t1 = time.time()
    print("每次新建连接发 5 个请求: %.2f ms（含 5 次 TCP 握手）" %
          ((t1 - t0) * 1000))

    # 复用连接发请求
    t0 = time.time()
    c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=3)
    for _ in range(5):
        c.request("GET", "/", headers={"Accept-Encoding": "gzip"})
        r = c.getresponse()
        r.read()
    c.close()
    t1 = time.time()
    print("复用连接发 5 个请求:     %.2f ms（1 次 TCP 握手）" %
          ((t1 - t0) * 1000))

    print("\\n" + "=" * 60)
    print("结论：")
    print("  1. gzip 把 %d bytes 压到 %d bytes，省了 %.0f%%" %
          (len(RAW_BODY), len(GZIP_BODY),
           100 * (1 - len(GZIP_BODY) / len(RAW_BODY))))
    print("  2. Keep-Alive 复用连接，省去重复 TCP 握手，N 个请求更快")
    print("  3. 生产中配合 HTTP/2 多路复用 + brotli + CDN 效果更佳")
\`,
  },
];
