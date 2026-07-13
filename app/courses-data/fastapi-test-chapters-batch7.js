// =============================================================
// FastAPI 测试与部署全书 - 第 7 批章节（生产部署 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ft-nginx  : Nginx 反向代理
//   ft-https  : HTTPS 与证书管理
//   ft-systemd: systemd 服务部署
//   ft-cicd   : CI/CD GitHub Actions
//   ft-monitor: 监控与日志
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：Nginx 反向代理
  // ============================================================
  {
    id: "ft-nginx",
    group: "生产部署",
    icon: "🛡️",
    title: "Nginx 反向代理",
    content: `# Nginx 反向代理

## 一、为什么 FastAPI 前面要加 Nginx

前面几章我们一直用 \`uvicorn main:app --host 0.0.0.0 --port 80\` 直接把 FastAPI 暴露在公网 80 端口。开发时没问题，但生产环境这么做有几个大坑：

1. **Uvicorn 不是 Web 服务器**：它是个 ASGI 服务器，专注跑 Python 应用，不擅长处理静态文件、SSL、限流。让它干这些事既慢又危险。
2. **单进程瓶颈**：单个 uvicorn 进程只能用一个 CPU 核。多核机器直接浪费。
3. **没有 SSL**：Uvicorn 虽然支持 SSL，但配置麻烦，性能也不如 Nginx 专门优化的。
4. **崩溃无人重启**：Uvicorn 挂了，整个站点 502，没人接管。
5. **没有限流/缓冲**：慢客户端会拖垮 Python 进程（uvicorn 要为每个连接分配资源）。

**Nginx 是一个高性能的反向代理 + Web 服务器**，用 C 写的，单机能扛几万并发。把它放在 Uvicorn 前面，能解决上面所有问题：

| 能力 | Uvicorn 单独 | Nginx + Uvicorn |
|---|---|---|
| 静态文件 | Python 读文件，慢 | Nginx 直接 sendfile，极快 |
| SSL 卸载 | 可以但弱 | Nginx 专门优化，硬件加速 |
| 负载均衡 | 单进程 | 多 worker + upstream 轮询 |
| 限流 | 需自己写中间件 | limit_req 内置 |
| 慢客户端 | 占用 Python 资源 | Nginx 缓冲，Python 只处理完整请求 |
| 崩溃保护 | 直接 502 | Nginx 可屏蔽后端故障 |

> 生活类比：Uvicorn 像一个**高级厨师**，炒菜（跑 Python 逻辑）很厉害，但你让他同时去门口迎宾、收银、洗碗，他就手忙脚乱了。Nginx 就是**前台接待 + 收银 + 传菜员**，把杂活全包了，厨师只管专心炒菜。

## 二、部署架构

典型的生产架构是这样：

\`\`\`text
客户端(浏览器/App)
      |
      | HTTPS 443
      v
   [ Nginx ]  <-- 处理 SSL、静态文件、限流、负载均衡
      |
      | HTTP 127.0.0.1:8000 (或多个端口)
      v
[ Uvicorn/FastAPI ]  <-- 专注跑 Python 业务逻辑
      |
      v
[ 数据库 / 缓存 ]
\`\`\`

关键点：Nginx 和 Uvicorn 之间走内网 HTTP（127.0.0.1），不加密，因为这一段在同一台机器内，无需 SSL。SSL 在 Nginx 这层「卸载」掉，后端只处理明文，省 CPU。

## 三、安装 Nginx

\`\`\`bash
# Ubuntu/Debian 安装 nginx
sudo apt update
sudo apt install nginx

# CentOS/RHEL 安装 nginx
sudo yum install nginx

# 启动 nginx 并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证：浏览器访问服务器 IP，看到 Welcome to nginx 即成功
\`\`\`

Nginx 的配置文件主要在两个地方：
- \`/etc/nginx/nginx.conf\`：主配置文件（全局设置）
- \`/etc/nginx/conf.d/*.conf\`：站点配置文件（每个站点一个）

## 四、Demo 1：最简反向代理配置

这是最基础的配置：把所有请求转发给本机 8000 端口的 uvicorn。

\`\`\`nginx
# /etc/nginx/conf.d/api.conf —— FastAPI 反向代理配置

# 定义一个 server 块，监听 80 端口
server {
    # 监听 80 端口（HTTP 默认端口）
    listen 80;
    # 匹配的域名（浏览器访问的域名要和这个一致）
    server_name api.example.com;

    # location 块：匹配 URL 路径，/ 表示匹配所有请求
    location / {
        # 把请求转发到本机 8000 端口的 uvicorn
        proxy_pass http://127.0.0.1:8000;
        # 把客户端的 Host 头透传给后端（否则后端看到的是 127.0.0.1:8000）
        proxy_set_header Host $host;
        # 透传客户端真实 IP（否则后端只能看到 127.0.0.1）
        proxy_set_header X-Real-IP $remote_addr;
        # 透传完整的代理链 IP（如果有多层代理，用逗号分隔）
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # 透传原始协议（http 还是 https），后端据此判断是否走了 HTTPS
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

写完配置后必须测试 + 重载：

\`\`\`bash
# 测试配置语法是否正确（不重启服务）
sudo nginx -t
# 输出 syntax is ok / test is successful 才能继续

# 重载配置（不中断现有连接，平滑生效）
sudo systemctl reload nginx
\`\`\`

这四个 \`proxy_set_header\` 非常重要。如果不设置，FastAPI 拿到的客户端 IP 永远是 \`127.0.0.1\`，导致：限流失效、日志无意义、基于 IP 的认证失效。FastAPI 里可以用 \`X-Forwarded-For\` 还原真实 IP。

> 生活类比：Nginx 是「前台」，FastAPI 是「老板」。前台转接电话时，如果不说「这是张三打来的」，老板就不知道是谁打的。那四个 header 就是前台告诉老板「这是谁、从哪来、走没走加密」的信息。

## 五、Demo 2：WebSocket 代理

FastAPI 的 WebSocket 默认走 HTTP 升级机制。Nginx 反代 WebSocket 必须显式设置 \`Upgrade\` 和 \`Connection\` 头，否则握手失败。

\`\`\`nginx
# WebSocket 反向代理配置

server {
    listen 80;
    server_name api.example.com;

    # /ws 路径走 WebSocket
    location /ws {
        # 转发到后端
        proxy_pass http://127.0.0.1:8000;
        # WebSocket 必须用 HTTP/1.1（默认 1.0 不支持升级）
        proxy_http_version 1.1;
        # 透传客户端的 Upgrade 头（告诉后端要升级协议）
        proxy_set_header Upgrade $http_upgrade;
        # 设置 Connection 为 upgrade（关键！否则握手失败）
        proxy_set_header Connection "upgrade";
        # 透传 Host（WebSocket 握手需要正确的 Host）
        proxy_set_header Host $host;
        # WebSocket 长连接读超时设为 86400 秒（1 天）
        # 默认 60 秒会被 Nginx 断开，导致长连接掉线
        proxy_read_timeout 86400;
        # 发送超时也设长
        proxy_send_timeout 86400;
    }

    # 其他普通 HTTP 请求走这里
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

对应的 FastAPI WebSocket 端点：

\`\`\`python
# ws_app.py —— 配合上面 nginx 的 WebSocket 服务
from fastapi import FastAPI, WebSocket

app = FastAPI()

# WebSocket 端点，路径必须是 /ws（和 nginx 配置一致）
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    # 接受连接（完成握手）
    await ws.accept()
    while True:
        # 接收客户端消息
        data = await ws.receive_text()
        # 回显消息
        await ws.send_text(f"echo: {data}")
\`\`\`

> 生活类比：普通 HTTP 像「打电话问个事就挂」，WebSocket 像「打通电话后不挂，一直聊」。Nginx 默认 60 秒看你们没说话就给你挂了，所以要设 \`proxy_read_timeout\` 告诉它「别挂，他们在长聊」。

## 六、Demo 3：负载均衡（多 uvicorn worker）

单进程 uvicorn 只用一个 CPU 核。要多核利用，起多个 uvicorn 实例（不同端口），用 Nginx 的 \`upstream\` 做负载均衡。

\`\`\`nginx
# /etc/nginx/conf.d/api.conf —— 负载均衡配置

# 定义后端集群，名字叫 api_backend
upstream api_backend {
    # 第 1 个 uvicorn 实例，监听 8001
    server 127.0.0.1:8001;
    # 第 2 个 uvicorn 实例，监听 8002
    server 127.0.0.1:8002;
    # 第 3 个 uvicorn 实例，监听 8003
    server 127.0.0.1:8003;

    # 默认轮询（round-robin）：1->2->3->1->2->3...
    # 可选：加权轮询（机器性能不同时用）
    # server 127.0.0.1:8001 weight=3;  # 分配 3 倍请求
    # server 127.0.0.1:8002 weight=1;

    # 可选：ip_hash（同一客户端固定打到同一后端，解决 session 问题）
    # ip_hash;

    # 可选：最少连接数（请求优先发给当前连接数最少的后端）
    # least_conn;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        # 注意：这里用 upstream 的名字，不是 IP
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

启动 3 个 uvicorn 实例的脚本：

\`\`\`bash
# 启动 3 个 uvicorn 实例（不同端口，同样代码）
uvicorn main:app --host 127.0.0.1 --port 8001 &
uvicorn main:app --host 127.0.0.1 --port 8002 &
uvicorn main:app --host 127.0.0.1 --port 8003 &

# 注意：单进程实例间不能共享内存状态
# 如果用了内存存 session，必须用 ip_hash 或改用 Redis 存 session
\`\`\`

负载均衡策略对比：

| 策略 | 指令 | 适用场景 |
|---|---|---|
| 轮询（默认） | 无 | 后端机器性能相同 |
| 加权轮询 | weight=N | 机器性能不同 |
| ip_hash | ip_hash | 需要 session 粘性 |
| 最少连接 | least_conn | 请求处理时间差异大 |
| 随机 | random | 简单分流 |

> 生活类比：负载均衡像「银行叫号」。轮询就是 3 个窗口按顺序叫号；加权就是某个窗口（业务熟练）叫得快多叫几个；ip_hash 就是「认人」，你上次在 1 号窗口办的就一直去 1 号；最少连接就是「看哪个窗口人少先去哪个」。

## 七、Demo 4：静态文件由 Nginx 直接处理

FastAPI 也能用 \`StaticFiles\` 托管静态文件，但 Python 读文件比 Nginx 慢 10 倍以上。生产环境让 Nginx 直接处理静态文件，FastAPI 只管 API。

\`\`\`nginx
# 静态文件由 Nginx 直接处理

server {
    listen 80;
    server_name api.example.com;

    # /static/ 开头的请求由 Nginx 直接返回文件，不转发给 Python
    location /static/ {
        # alias 把 URL 路径映射到磁盘目录
        # /static/logo.png -> /var/www/static/logo.png
        alias /var/www/static/;
        # 设置缓存 30 天（浏览器和 CDN 缓存）
        expires 30d;
        # 添加 Cache-Control 头，公开缓存
        add_header Cache-Control "public, immutable";
        # 开启 sendfile（零拷贝，性能极致）
        sendfile on;
        # 大文件用 tcp_nopush 减少 IO 次数
        tcp_nopush on;
    }

    # 上传文件目录
    location /uploads/ {
        alias /var/www/uploads/;
        # 上传文件不缓存
        expires off;
        add_header Cache-Control "no-store";
    }

    # API 请求才转发给 Python
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

注意 \`alias\` 和 \`root\` 的区别：
- \`alias /var/www/static/;\`：URL \`/static/a.png\` → 文件 \`/var/www/static/a.png\`（替换路径）
- \`root /var/www;\`：URL \`/static/a.png\` → 文件 \`/var/www/static/a.png\`（拼接路径）

> 生活类比：静态文件像「餐厅的菜单」——是固定的、谁来了都一样。让厨师（Python）每次去复印一份菜单递给客人太浪费了，应该让前台（Nginx）直接放门口自己拿。

## 八、Demo 5：限流（limit_req）

防止恶意刷接口。Nginx 内置 \`limit_req\` 模块，按 IP 限流。

\`\`\`nginx
# /etc/nginx/conf.d/api.conf —— 限流配置

# 在 http 块定义限流区域（必须在 http 块，不能在 server 块）
# 把这段放在 /etc/nginx/nginx.conf 的 http {} 内，或 conf.d 顶部
# limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
# 解释：
#   $binary_remote_addr —— 用客户端 IP（二进制格式，省内存）作为限流 key
#   zone=api:10m —— 共享内存区叫 api，大小 10MB（约存 16 万个 IP）
#   rate=10r/s —— 平均每秒 10 个请求

server {
    listen 80;
    server_name api.example.com;

    location / {
        # 应用限流：突发 20 个请求不延迟，超过直接 503
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    # 登录接口单独限流（更严格，防暴力破解）
    location /login {
        # 单独定义一个 zone（在 http 块：limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;）
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

参数解释：
- \`rate=10r/s\`：平均速率每秒 10 请求（Nginx 实际按毫秒漏桶，每 100ms 放行 1 个）
- \`burst=20\`：允许突发 20 个请求排队
- \`nodelay\`：突发的请求不延迟，立即处理（超过 burst 才拒绝）

\`nodelay\` vs 无 \`nodelay\`：
- 有 \`nodelay\`：burst 内立即响应，超过 burst 返回 503
- 无 \`nodelay\`：burst 内排队等待，按 rate 速率放行（延迟高但不拒绝）

> 生活类比：限流像「地铁安检口」。rate 是正常放行速度，burst 是临时排队区。nodelay 是「排队区的人立即放行，超过排队区的人才被劝返」；不加 nodelay 是「排队区的人慢慢等，按正常速度一个个进」。

## 九、Demo 6：gzip 压缩

JSON 响应通常很大，gzip 能压缩 70%+，大幅减少带宽和客户端加载时间。

\`\`\`nginx
# gzip 压缩配置（放在 http 块或 server 块）

# 开启 gzip
gzip on;
# 压缩级别 1-9，1 最快压缩率低，9 最慢压缩率高。生产用 4-6 平衡
gzip_comp_level 5;
# 小于 1000 字节的不压缩（压缩本身有开销，太小的不划算）
gzip_min_length 1000;
# 压缩的 MIME 类型（默认只压 text/html，要显式加 json）
gzip_types
    application/json          # FastAPI JSON 响应
    text/plain                # 纯文本
    text/css                  # CSS
    application/javascript    # JS
    application/xml           # XML
    image/svg+xml;            # SVG
# 对代理请求也压缩（默认 off）
gzip_proxied any;
# 添加 Vary: Accept-Encoding 头，防止 CDN 缓存错乱
gzip_vary on;
\`\`\`

效果：一个 50KB 的 JSON 响应，压缩后约 8KB，客户端加载快 6 倍。

## 十、Demo 7：完整生产配置示例

整合上面所有配置的完整生产示例：

\`\`\`nginx
# /etc/nginx/conf.d/api.example.com.conf —— 完整生产配置

# upstream 定义后端集群
upstream api_backend {
    # 3 个 uvicorn 实例
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8003 max_fails=3 fail_timeout=30s;
    # max_fails=3：30 秒内失败 3 次标记为宕机
    # fail_timeout=30s：宕机 30 秒后再试
    keepalive 32;  # 与后端保持 32 个长连接，减少握手开销
}

# gzip 全局配置
gzip on;
gzip_comp_level 5;
gzip_min_length 1000;
gzip_types application/json text/plain text/css application/javascript;
gzip_proxied any;
gzip_vary on;

server {
    listen 80;
    server_name api.example.com;

    # 静态文件
    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket
    location /ws {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # API 请求
    location / {
        # 限流
        limit_req zone=api burst=20 nodelay;
        # 转发到集群
        proxy_pass http://api_backend;
        # 与后端保持长连接
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        # 透传头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # 超时设置
        proxy_connect_timeout 5s;   # 连接后端超时
        proxy_send_timeout 60s;     # 发送请求超时
        proxy_read_timeout 60s;     # 读取响应超时
        # 缓冲设置（防止慢客户端拖垮后端）
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        # 客户端上传文件大小限制（默认 1M，按需调大）
        client_max_body_size 10M;
    }
}
\`\`\`

## 十一、Nginx 常用指令表

| 指令 | 作用 | 示例 |
|---|---|---|
| listen | 监听端口 | listen 80; |
| server_name | 匹配域名 | server_name api.com; |
| proxy_pass | 转发到后端 | proxy_pass http://127.0.0.1:8000; |
| proxy_set_header | 设置转发头 | proxy_set_header Host $host; |
| upstream | 定义后端集群 | upstream api { server 127.0.0.1:8001; } |
| location | URL 路径匹配 | location /static/ { ... } |
| alias | URL 映射磁盘 | alias /var/www/static/; |
| expires | 缓存时间 | expires 30d; |
| limit_req | 限流 | limit_req zone=api burst=20; |
| gzip | 压缩 | gzip on; |
| return | 直接返回 | return 301 https://$host; |
| rewrite | 重写 URL | rewrite ^/old/(.*)$ /new/$1 permanent; |
| client_max_body_size | 上传大小限制 | client_max_body_size 10M; |
| error_page | 自定义错误页 | error_page 502 /502.html; |

## 本章小结

| 知识点 | 要点 |
|---|---|
| 为什么加 Nginx | 静态文件、SSL 卸载、负载均衡、限流、缓冲 |
| 部署架构 | 客户端 → Nginx(443) → Uvicorn(8000) 内网通信 |
| 反向代理 | proxy_pass + 4 个 set_header 透传客户端信息 |
| WebSocket | 必须 proxy_http_version 1.1 + Upgrade + Connection |
| 负载均衡 | upstream + 轮询/加权/ip_hash/least_conn |
| 静态文件 | location + alias，绕过 Python，用 sendfile |
| 限流 | limit_req_zone + limit_req burst nodelay |
| gzip | gzip_types 加 application/json，gzip_min_length 1000 |
| 完整配置 | upstream keepalive + proxy_buffering + 超时设置 |
| 常用指令 | listen/proxy_pass/upstream/location/limit_req |
`
  },

  // ============================================================
  // 第 2 章：HTTPS 与证书管理
  // ============================================================
  {
    id: "ft-https",
    group: "生产部署",
    icon: "🔒",
    title: "HTTPS 与证书管理",
    content: `# HTTPS 与证书管理

## 一、为什么必须用 HTTPS

HTTP 是明文传输，路上任何节点（路由器、运营商、咖啡店 WiFi）都能看到甚至篡改你的数据。密码、token、个人信息全裸奔。现代 Web 必须 HTTPS，原因有四：

1. **安全**：加密内容，防止窃听和篡改。
2. **信任**：浏览器对 HTTP 站点显示「不安全」，用户会跑光。
3. **功能**：HTTP/2、Service Worker、地理定位、剪贴板等新特性**只允许 HTTPS**。
4. **合规**：GDPR、PCI-DSS 等法规要求传输加密。

HTTPS = HTTP + TLS/SSL。TLS 在 TCP 和 HTTP 之间加了一层加密，原理简化版：

\`\`\`text
1. 客户端说：我要连你，我支持这些加密算法
2. 服务端说：选这个算法，这是我的证书（含公钥）
3. 客户端验证证书（找 CA 签名）-> 信任服务端
4. 双方协商出对称密钥（用公钥加密交换）
5. 后续通信用对称密钥加密（快）
\`\`\`

> 生活类比：HTTP 像「明信片」，路过邮局谁都能看；HTTPS 像「密封信封 + 蜡封」。证书就是「身份证」，证明这封信确实是这家公司发的，不是骗子冒充的。CA（证书颁发机构）就是「公安局」，给你的身份证盖章背书。

## 二、证书类型

| 类型 | 全称 | 验证内容 | 颁发速度 | 价格 | 浏览器显示 |
|---|---|---|---|---|---|
| DV | Domain Validation | 域名所有权 | 分钟级 | 免费~便宜 | 锁标 |
| OV | Organization Validation | 域名 + 公司身份 | 1-3 天 | 几百~几千 | 锁标 + 公司名 |
| EV | Extended Validation | 严格公司审核 | 1-2 周 | 几千~几万 | 旧版绿色地址栏 |

- **DV**：只验证你能不能控制这个域名（比如在 DNS 加个 TXT 记录）。Let's Encrypt 只发 DV。
- **OV**：CA 会查你的公司营业执照、电话回访。
- **EV**：最严格，要提交大量法律文件。现代浏览器已取消绿色地址栏，EV 价值下降。

99% 的项目用 DV 就够了。Let's Encrypt 是免费 DV 证书的首选。

## 三、Let's Encrypt 免费证书

Let's Encrypt 是个非营利 CA，提供免费 DV 证书，3 个月有效期，到期自动续期。它用 ACME 协议自动颁发：

\`\`\`text
1. certbot 在服务器生成一个临时文件
2. 把文件放到 .well-known/acme-challenge/ 目录
3. Let's Encrypt 服务器访问 http://你的域名/.well-known/... 验证
4. 验证通过 -> 颁发证书
\`\`\`

## 四、Demo 1：用 certbot 申请证书

\`\`\`bash
# 1. 安装 certbot 和 nginx 插件
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. 确保 nginx 已启动且 80 端口能访问（验证域名用）
sudo systemctl start nginx

# 3. 确保 DNS 已解析：api.example.com 指向本机 IP
# 用 dig 验证
dig api.example.com +short

# 4. 申请证书（自动修改 nginx 配置加 HTTPS）
sudo certbot --nginx -d api.example.com -d www.api.example.com
# --nginx：用 nginx 插件，自动改配置
# -d：指定域名（可多个，第一个是主域名）

# 5. 交互式回答：
#    - 输入邮箱（接收续期提醒）
#    - 同意服务条款
#    - 是否重定向 HTTP 到 HTTPS（选是，自动加 301）

# 6. 成功后证书位置：
#    /etc/letsencrypt/live/api.example.com/fullchain.pem  # 证书+中间证书
#    /etc/letsencrypt/live/api.example.com/privkey.pem    # 私钥
\`\`\`

certbot 会自动改 nginx 配置，加一个 443 的 server 块。

## 五、Demo 2：Nginx HTTPS 配置

手动写 HTTPS 配置（理解每个参数）：

\`\`\`nginx
# /etc/nginx/conf.d/api.example.com.conf —— HTTPS 配置

# HTTPS server 块
server {
    # 监听 443 端口，开启 ssl 和 http2
    listen 443 ssl http2;
    server_name api.example.com;

    # 证书文件（fullchain = 你的证书 + 中间证书，客户端需要完整链）
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    # 私钥文件（绝对不能泄露！权限设 600）
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # SSL 协议版本：只允许 TLS 1.2 和 1.3（禁用 SSLv3/TLS1.0/1.1，不安全）
    ssl_protocols TLSv1.2 TLSv1.3;
    # 加密套件：高强度，排除弱算法
    ssl_ciphers HIGH:!aNULL:!MD5:!3DES:!RC4;
    # 优先使用服务端选择的加密套件（不让客户端选弱的）
    ssl_prefer_server_ciphers on;

    # 会话缓存：复用 TLS 会话，减少握手开销
    ssl_session_cache shared:SSL:10m;     # 10MB 缓存约 4 万个会话
    ssl_session_timeout 10m;               # 会话缓存 10 分钟
    # 票据（ticket）减少重复握手
    ssl_session_tickets on;

    # OCSP 装订：在线验证证书是否被吊销，减少客户端查询延迟
    ssl_stapling on;
    ssl_stapling_verify on;

    # 反向代理到 FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # 透传协议是 https，FastAPI 据此生成 https URL
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 跳转 HTTPS 的 server 块
server {
    listen 80;
    server_name api.example.com;
    # 301 永久重定向到 HTTPS
    return 301 https://$host$request_uri;
}
\`\`\`

关键参数解释：
- \`http2\`：HTTP/2 多路复用，比 HTTP/1.1 快很多，必须 HTTPS 才能用。
- \`fullchain.pem\`：包含你的证书 + 中间 CA 证书。如果只给 \`cert.pem\`，部分客户端会报「证书链不完整」。
- \`TLSv1.3\`：2018 年的新协议，握手快 1 个 RTT，安全性更高。

## 六、Demo 3：自动续期

Let's Encrypt 证书 90 天过期。手动续期不现实，必须自动化。

\`\`\`bash
# 方法 1：用 cron 定时任务（推荐）

# 创建 cron 文件
# /etc/cron.d/certbot
# 每天凌晨 3 点检查，离过期 30 天内才真正续期
# 续期成功后重载 nginx 让新证书生效
0 3 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"

# 方法 2：用 systemd timer（更现代）
# certbot 安装时通常已自动配置 systemd timer
sudo systemctl enable --now certbot.timer
# 查看 timer 状态
sudo systemctl list-timers certbot.timer

# 手动测试续期流程（不会真的续，模拟一遍）
sudo certbot renew --dry-run
# 看到 "no renewals attempted" 或 "Congratulations" 表示 OK
\`\`\`

\`certbot renew\` 只在证书离过期 30 天内才真正续期，否则跳过。所以每天跑也没问题。

\`--post-hook\` 只在证书真的更新后执行，重载 nginx 让新证书生效。

## 七、Demo 4：HTTP Strict Transport Security (HSTS)

HSTS 告诉浏览器「以后这个域名必须用 HTTPS，别用 HTTP 了」，防止 SSL 剥离攻击。

\`\`\`nginx
# 在 HTTPS server 块加 HSTS 头
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # HSTS：强制浏览器后续都用 HTTPS
    # max-age=31536000：1 年（秒）
    # includeSubDomains：子域名也生效
    # always：即使是错误响应也加这个头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 其他配置...
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

注意 HSTS 的风险：一旦设置，浏览器会强制 HTTPS 1 年。如果证书过期或 HTTPS 配置错了，用户就完全访问不了你的站点。建议先用 \`max-age=300\`（5 分钟）测试，确认没问题再改 1 年。

## 八、Demo 5：自签名证书（开发用）

本地开发没域名，没法用 Let's Encrypt。可以自签名证书，浏览器会警告「不安全」，但功能正常。

\`\`\`bash
# 用 openssl 生成自签名证书
# 生成 4096 位 RSA 私钥 + 自签名证书，有效期 365 天
openssl req -x509 -newkey rsa:4096 -nodes \\
  -keyout key.pem \\
  -out cert.pem \\
  -days 365 \\
  -subj "/CN=localhost"

# 参数解释：
# req          : 证书请求工具
# -x509        : 直接生成自签名证书（不是 CSR）
# -newkey      : 同时生成新私钥
# rsa:4096     : 4096 位 RSA
# -nodes       : 私钥不加密（nginx 启动不用输密码）
# -keyout      : 私钥输出文件
# -out         : 证书输出文件
# -days 365    : 有效期 365 天
# -subj        : 主题，CN=localhost 表示域名是 localhost

# 加上 SAN（Subject Alternative Name），现代浏览器需要
openssl req -x509 -newkey rsa:4096 -nodes \\
  -keyout key.pem -out cert.pem -days 365 \\
  -subj "/CN=localhost" \\
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
\`\`\`

本地 nginx 配置：

\`\`\`nginx
server {
    listen 443 ssl;
    server_name localhost;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

## 九、Demo 6：FastAPI 中处理 X-Forwarded-Proto

Nginx 把 HTTPS 卸载后，FastAPI 看到的协议是 HTTP（Nginx 到 Uvicorn 走 HTTP）。这会导致 \`request.url\` 生成 \`http://\` 的 URL，影响 OAuth 回调、邮件链接等。

\`\`\`python
# app.py —— 处理反向代理头

from fastapi import FastAPI, Request
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app = FastAPI()

# ProxyHeadersMiddleware 会处理 X-Forwarded-For / X-Forwarded-Proto
# trusted_hosts 指定信任的代理 IP（"*" 信任所有，生产环境建议填 nginx 的 IP）
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

@app.get("/url")
def get_url(request: Request):
    # 没有这个中间件，返回 http://api.example.com/url
    # 加了中间件，正确返回 https://api.example.com/url
    return {"url": str(request.url)}

@app.get("/redirect")
def redirect_example():
    # 重定向时会用到正确的协议
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/url")
\`\`\`

Starlette 也有自己的 \`ProxyHeadersMiddleware\`，FastAPI 直接复用。原理就是读 \`X-Forwarded-Proto\` 头，覆盖 \`request.scope["scheme"]\`。

## 十、Demo 7：用 Docker + certbot 管理证书

容器化部署时，证书管理稍复杂。用 certbot 容器 + nginx 容器配合：

\`\`\`yaml
# docker-compose.yml —— nginx + certbot 证书管理

version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      # nginx 配置
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      # 证书目录共享给 certbot
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - api

  api:
    build: .
    # 不暴露端口，只让 nginx 访问
    expose:
      - "8000"

  # certbot 容器：负责申请和续期证书
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    # 每次启动尝试续期，然后退出
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h; done'"
\`\`\`

nginx 配置里加 ACME challenge 的 location：

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;

    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
\`\`\`

首次申请证书：

\`\`\`bash
# 先用 nginx 的 HTTP 配置启动（没有 HTTPS）
docker-compose up -d nginx

# 用 certbot 容器申请证书
docker-compose run --rm certbot certonly \\
  --webroot -w /var/www/certbot \\
  -d api.example.com \\
  --email you@example.com --agree-tos

# 然后启用 nginx 的 HTTPS 配置，重载
docker-compose exec nginx nginx -s reload
\`\`\`

## 十一、SSL 评分标准（SSL Labs A+ 要求）

用 [SSL Labs](https://www.ssllabs.com/ssltest/) 测你的站点，目标是 A+：

| 要求 | 配置 |
|---|---|
| 禁用旧协议 | 只留 TLS 1.2 / 1.3 |
| 强加密套件 | HIGH:!aNULL:!MD5:!3DES:!RC4 |
| 完整证书链 | 用 fullchain.pem |
| HSTS | max-age>=6 个月 |
| OCSP 装订 | ssl_stapling on |
| HTTP/2 | 启用 |
| 完美前向保密 | ECDHE 套件（默认满足） |

A+ 还需要 HSTS 且 max-age 足够长。

## 本章小结

| 知识点 | 要点 |
|---|---|
| HTTPS 必要性 | 安全、信任、新特性、合规 |
| 证书类型 | DV（免费够用）/ OV / EV |
| Let's Encrypt | 免费 DV，90 天，ACME 自动化 |
| certbot | --nginx 自动改配置，--dry-run 测试续期 |
| Nginx HTTPS | listen 443 ssl http2 + fullchain + privkey |
| 协议版本 | 只留 TLS 1.2 / 1.3，禁用 SSLv3 |
| 自动续期 | cron 每天跑 certbot renew --post-hook reload |
| HSTS | 强制 HTTPS，先小 max-age 测试 |
| 自签名证书 | openssl req -x509，开发用 |
| ProxyHeadersMiddleware | 处理 X-Forwarded-Proto 让 FastAPI 知道是 HTTPS |
| Docker 证书 | certbot 容器 + webroot 验证 |
| SSL Labs A+ | TLS1.2+ + HSTS + OCSP + 完整链 |
`
  },

  // ============================================================
  // 第 3 章：systemd 服务部署
  // ============================================================
  {
    id: "ft-systemd",
    group: "生产部署",
    icon: "🐧",
    title: "systemd 服务部署",
    content: `# systemd 服务部署

## 一、为什么用 systemd

之前我们都是手动 \`uvicorn main:app &\` 后台跑 FastAPI。这种方式生产环境有三个致命问题：

1. **不会开机自启**：服务器重启后，FastAPI 不会自动启动，站点挂掉。
2. **崩溃无人重启**：uvicorn 进程崩溃了，没人重新拉起来，要等用户投诉才知道。
3. **日志管理混乱**：输出散落在 nohup.out、终端、/var/log，没法统一查。

**systemd 是现代 Linux 的系统服务管理器**（PID 1），负责启动和管理所有系统服务。它解决上面所有问题：

| 问题 | 手动 & | systemd |
|---|---|---|
| 开机自启 | 要写 rc.local | enable 一句命令 |
| 崩溃重启 | 挂了就挂了 | Restart=always 自动拉起 |
| 日志统一 | 散落各处 | journalctl 统一查 |
| 资源限制 | 无 | 可设 CPU/内存限制 |
| 启动顺序 | 无 | After= 指定依赖 |

> 生活类比：手动 \`uvicorn &\` 像「自己创业」，生病了没人替你、停电了没人帮你重启。systemd 像「加入大公司的正式员工」——公司（系统）帮你交社保（开机自启）、病假有替补（崩溃重启）、考勤统一（日志）。Ubuntu、CentOS、Debian 等主流发行版默认都用 systemd。

## 二、systemd 核心概念

- **unit（单元）**：systemd 管理的对象，服务（.service）、挂载（.mount）、定时任务（.timer）等都是 unit。
- **service**：最常用，对应一个长期运行的进程。
- **target**：一组 unit 的集合，类似运行级别。multi-user.target 就是多用户命令行模式。
- **journal**：systemd 的日志系统，所有 unit 的日志统一存到 /var/log/journal/。

service 文件分三段：

\`\`\`ini
[Unit]        # 元信息、依赖关系
[Service]     # 怎么启动、重启、停止
[Install]     # 怎么安装（enable 时用）
\`\`\`

## 三、Demo 1：创建 systemd 服务文件

\`\`\`ini
# /etc/systemd/system/fastapi.service —— FastAPI 服务配置

[Unit]
# 服务描述（status 和 journalctl 里显示的名字）
Description=FastAPI Application
# 文档地址（可选）
Documentation=https://example.com/docs
# 在 network.target 之后启动（网络就绪后再起）
After=network.target
# 如果有数据库，可加 Wants=postgresql.service

[Service]
# 运行服务的用户（不要用 root，安全）
User=www-data
# 运行服务的用户组
Group=www-data
# 工作目录（相对路径基于这里）
WorkingDirectory=/var/www/api
# 环境变量（PATH 指向 venv，让 systemd 能找到 uvicorn）
Environment="PATH=/var/www/api/venv/bin"
# 启动命令
ExecStart=/var/www/api/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
# 启动后多久认为服务启动成功（uvicorn 默认几秒就绪）
# Type=notify 时服务会主动通知 systemd，更精准
# Type=simple（默认）认为 ExecStart 执行就成功
Type=simple
# 崩溃后总是重启
Restart=always
# 重启前等 5 秒（避免快速循环崩溃拖垮系统）
RestartSec=5
# 标准输出和错误都发到 journal
StandardOutput=journal
StandardError=journal
# 优雅停止：发 SIGTERM，10 秒后还没退就 SIGKILL
KillSignal=SIGTERM
TimeoutStopSec=10

[Install]
# enable 时建立到 multi-user.target 的软链，实现开机自启
WantedBy=multi-user.target
\`\`\`

## 四、Demo 2：启动和管理命令

\`\`\`bash
# 1. 写完 service 文件后必须重新加载 systemd 配置
sudo systemctl daemon-reload

# 2. 启动服务
sudo systemctl start fastapi

# 3. 设置开机自启
sudo systemctl enable fastapi

# 4. 查看服务状态（最常用，看是否在跑、有没有报错）
sudo systemctl status fastapi
# 输出会显示：
#   Active: active (running) —— 正在运行
#   Active: failed —— 启动失败
#   最近 10 行日志

# 5. 重启服务（改了代码后）
sudo systemctl restart fastapi

# 6. 优雅重载（如果服务支持 SIGHUP 重载配置）
sudo systemctl reload fastapi

# 7. 停止服务
sudo systemctl stop fastapi

# 8. 禁止开机自启
sudo systemctl disable fastapi

# 9. 查看日志（实时跟踪，类似 tail -f）
sudo journalctl -u fastapi -f
# -u 指定 unit，-f follow 实时

# 10. 查看最近 100 行日志
sudo journalctl -u fastapi -n 100

# 11. 查看今天的日志
sudo journalctl -u fastapi --since today

# 12. 查看错误日志
sudo journalctl -u fastapi -p err
\`\`\`

改了 service 文件后必须 \`daemon-reload\` 才生效，这是新手最容易踩的坑。

## 五、Demo 3：用 gunicorn 替代 uvicorn

uvicorn 单进程要靠 \`--workers\` 多进程。生产环境更推荐 **gunicorn + uvicorn worker**：gunicorn 做进程管理（master-worker 模型），uvicorn 做 ASGI 运行时。

\`\`\`ini
# /etc/systemd/system/fastapi.service —— 用 gunicorn

[Unit]
Description=FastAPI with Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/api
Environment="PATH=/var/www/api/venv/bin"
# gunicorn 启动，用 uvicorn worker 类
# -w 4：4 个 worker 进程
# -k uvicorn.workers.UvicornWorker：worker 类型用 uvicorn
# -b 127.0.0.1:8000：绑定地址端口
# main:app：应用位置
ExecStart=/var/www/api/venv/bin/gunicorn main:app \\
  -w 4 \\
  -k uvicorn.workers.UvicornWorker \\
  -b 127.0.0.1:8000 \\
  --timeout 120 \\
  --graceful-timeout 30 \\
  --keep-alive 5
# --timeout 120：worker 120 秒不响应就重启
# --graceful-timeout 30：优雅停止等 30 秒
# --keep-alive 5：keep-alive 5 秒
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

gunicorn 的优势：
- **成熟稳定**：用了很多年的生产级进程管理器。
- **优雅重启**：\`kill -HUP\` 让 gunicorn 重新加载 worker，零停机更新代码。
- **预热**：worker 启动慢时，可加 \`--preload\` 共享内存。
- **worker 类型切换**：sync/async/uvicorn 随便换。

安装：

\`\`\`bash
# 安装 gunicorn 和 uvicorn worker
pip install gunicorn uvicorn[standard]
\`\`\`

## 六、Demo 4：环境变量文件（EnvironmentFile）

生产环境密码、密钥不能写在 service 文件里（systemd 文件可能被别人看到）。用独立的环境变量文件：

\`\`\`ini
# /var/www/api/.env —— 环境变量文件（权限 600）

# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
# JWT 密钥
SECRET_KEY=your-super-secret-key-here
# Redis 地址
REDIS_URL=redis://localhost:6379/0
# 调试模式关闭
DEBUG=False
# 环境标识
ENV=production
\`\`\`

\`\`\`ini
# /etc/systemd/system/fastapi.service —— 引用环境变量文件

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/api
Environment="PATH=/var/www/api/venv/bin"
# 引用环境变量文件
EnvironmentFile=/var/www/api/.env
ExecStart=/var/www/api/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
\`\`\`

设置文件权限：

\`\`\`bash
# 环境变量文件设为 www-data 可读，其他人不可读
sudo chown www-data:www-data /var/www/api/.env
sudo chmod 600 /var/www/api/.env

# 改了 .env 后要重启服务才生效
sudo systemctl restart fastapi
\`\`\`

注意 EnvironmentFile 的格式要求：\`KEY=VALUE\`，值不用引号，有空格用引号包起来。不能用 \`export\` 前缀。

## 七、Demo 5：用 systemd 管理多个 worker

如果不用 gunicorn，要用 systemd 直接管理多个 uvicorn 实例（配合 nginx 负载均衡）。

方法 1：模板单元（推荐）

\`\`\`ini
# /etc/systemd/system/fastapi@.service —— 模板单元（注意文件名 @）

[Unit]
Description=FastAPI Instance %i
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/api
Environment="PATH=/var/www/api/venv/bin"
EnvironmentFile=/var/www/api/.env
# %i 是实例名，启动时传入，作为端口号
ExecStart=/var/www/api/venv/bin/uvicorn main:app --host 127.0.0.1 --port 800%i
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

启动多个实例：

\`\`\`bash
# 启动 3 个实例：fastapi@1 (8001)、fastapi@2 (8002)、fastapi@3 (8003)
sudo systemctl start fastapi@1
sudo systemctl start fastapi@2
sudo systemctl start fastapi@3

# 开机自启
sudo systemctl enable fastapi@1 fastapi@2 fastapi@3

# 状态
sudo systemctl status fastapi@1
\`\`\`

方法 2：systemd-notify 服务发现，复杂场景用。这里不展开。

## 八、Demo 6：日志配置（journalctl + logrotate）

systemd 默认把日志存到二进制 journal 文件，不会自动清理，久了会占满磁盘。

\`\`\`bash
# 查看磁盘占用
sudo journalctl --disk-usage

# 配置 journal 大小限制
# 编辑 /etc/systemd/journald.conf
\`\`\`

\`\`\`ini
# /etc/systemd/journald.conf —— journal 配置

[Journal]
# 日志持久化到磁盘（默认 auto）
Storage=persistent
# 最大占用 500MB
SystemMaxUse=500M
# 单个日志文件最大 50MB
SystemMaxFileSize=50M
# 日志保留 7 天
MaxRetentionSec=7day
# 不转发到 syslog（避免重复）
ForwardToSyslog=no
\`\`\`

\`\`\`bash
# 改完重启 journald
sudo systemctl restart systemd-journald

# 手动清理旧日志（保留最近 2 天）
sudo journalctl --vacuum-time=2d

# 按大小清理（保留 100MB）
sudo journalctl --vacuum-size=100M
\`\`\`

如果应用自己写日志文件（比如用 loguru 写 app.log），要配 logrotate 防止撑爆磁盘：

\`\`\`text
# /etc/logrotate.d/fastapi

/var/www/api/logs/*.log {
    daily              # 每天轮转
    missingok          # 文件不存在不报错
    rotate 14          # 保留 14 个历史文件
    compress           # 压缩旧日志
    delaycompress      # 延迟压缩（最近的旧日志不压）
    notifempty         # 空文件不轮转
    create 644 www-data www-data  # 创建新文件的权限
    postrotate
        # 轮转后让服务重新打开日志文件
        systemctl reload fastapi >/dev/null 2>&1 || true
    endscript
}
\`\`\`

## 九、Demo 7：完整生产部署脚本

一键部署：venv + 代码 + systemd + nginx。

\`\`\`bash
#!/bin/bash
# deploy.sh —— FastAPI 生产部署脚本

set -e  # 任何命令失败就退出

# 配置变量
APP_DIR=/var/www/api
SERVICE_NAME=fastapi
DOMAIN=api.example.com

echo "=== 1. 安装系统依赖 ==="
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx

echo "=== 2. 创建目录和用户 ==="
sudo mkdir -p $APP_DIR
sudo useradd -r -s /bin/false www-data || true
sudo chown -R www-data:www-data $APP_DIR

echo "=== 3. 部署代码（示例用 git clone）==="
sudo -u www-data git clone https://github.com/your/repo.git $APP_DIR || \\
  sudo -u www-data git -C $APP_DIR pull

echo "=== 4. 创建虚拟环境 ==="
sudo -u www-data python3 -m venv $APP_DIR/venv

echo "=== 5. 安装依赖 ==="
sudo -u www-data $APP_DIR/venv/bin/pip install --upgrade pip
sudo -u www-data $APP_DIR/venv/bin/pip install -r $APP_DIR/requirements.txt
sudo -u www-data $APP_DIR/venv/bin/pip install uvicorn[standard]

echo "=== 6. 写 systemd service 文件 ==="
cat > /tmp/fastapi.service << 'EOF'
[Unit]
Description=FastAPI Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/api
Environment="PATH=/var/www/api/venv/bin"
EnvironmentFile=/var/www/api/.env
ExecStart=/var/www/api/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo mv /tmp/fastapi.service /etc/systemd/system/

echo "=== 7. 写 nginx 配置 ==="
cat > /tmp/api.conf << 'EOF'
server {
    listen 80;
    server_name api.example.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo mv /tmp/api.conf /etc/nginx/conf.d/

echo "=== 8. 启动服务 ==="
sudo systemctl daemon-reload
sudo systemctl enable fastapi
sudo systemctl restart fastapi
sudo nginx -t && sudo systemctl reload nginx

echo "=== 9. 验证 ==="
sleep 2
sudo systemctl status fastapi --no-pager
curl -s http://localhost:8000/docs | head -5

echo "=== 部署完成 ==="
\`\`\`

## 十、systemd 常用命令表

| 命令 | 作用 |
|---|---|
| systemctl start NAME | 启动服务 |
| systemctl stop NAME | 停止服务 |
| systemctl restart NAME | 重启服务 |
| systemctl reload NAME | 重载配置（不断进程） |
| systemctl status NAME | 查看状态 |
| systemctl enable NAME | 开机自启 |
| systemctl disable NAME | 禁止开机自启 |
| systemctl daemon-reload | 重新加载 service 文件 |
| systemctl list-units | 列出所有 unit |
| systemctl list-units --failed | 列出失败的服务 |
| journalctl -u NAME -f | 实时查看日志 |
| journalctl -u NAME --since today | 查看今天的日志 |
| journalctl -u NAME -p err | 只看错误日志 |
| journalctl --disk-usage | 日志磁盘占用 |
| journalctl --vacuum-size 100M | 清理日志到 100MB |

## 本章小结

| 知识点 | 要点 |
|---|---|
| 为什么用 systemd | 开机自启、崩溃重启、日志统一 |
| service 文件三段 | [Unit] / [Service] / [Install] |
| 关键字段 | User/WorkingDirectory/ExecStart/Restart=always |
| 启动流程 | daemon-reload → start → enable |
| 日志查看 | journalctl -u NAME -f |
| gunicorn 替代 | -k uvicorn.workers.UvicornWorker |
| 环境变量 | EnvironmentFile + chmod 600 |
| 多 worker | 模板单元 fastapi@.service + %i |
| 日志管理 | journald.conf 限大小 + logrotate 轮转 |
| 部署脚本 | venv + systemd + nginx 一键化 |
`
  },

  // ============================================================
  // 第 4 章：CI/CD GitHub Actions
  // ============================================================
  {
    id: "ft-cicd",
    group: "生产部署",
    icon: "🔄",
    title: "CI/CD GitHub Actions",
    content: `# CI/CD GitHub Actions

## 一、CI/CD 是什么

**CI（Continuous Integration，持续集成）**：每次提交代码，自动跑测试、lint、构建，确保代码质量。问题在提交时就发现，而不是上线后才发现。

**CD（Continuous Deployment/Delivery，持续部署/交付）**：CI 通过后，自动部署到测试/生产环境。Release 不再是手动 SSH 上线，而是一条流水线自动完成。

| 对比 | 手动部署 | CI/CD |
|---|---|---|
| 测试 | 提交前记得跑 | 自动跑 |
| 部署 | SSH 上线，手动 | 流水线自动 |
| 回滚 | 手动找旧版本 | 一键回滚 |
| 出错 | 「我这能跑啊」 | CI 直接红叉 |
| 频率 | 一周一次 | 一天几十次 |

CI/CD 的核心价值：**把「上线」从高风险人工操作，变成低风险自动化流程**。

> 生活类比：没有 CI/CD 像「做饭不尝味道，直接端上桌」——咸了才知道。CI 是「每加一步调料尝一下」，CD 是「尝完没问题自动端上桌」。GitHub Actions 是 GitHub 内置的 CI/CD 工具，和代码仓库在一起，配置简单，免费额度够小项目用。

## 二、GitHub Actions 核心概念

\`\`\`text
workflow（工作流）
  └── job（作业）        # 一个独立任务，跑在一个虚拟机里
        └── step（步骤）  # 按顺序执行的命令或 action
              └── action  # 可复用的步骤（如 checkout）
\`\`\`

- **workflow**：一个 \`.github/workflows/*.yml\` 文件就是一个 workflow。
- **job**：一个 workflow 可有多个 job，默认并行，可设 \`needs\` 依赖。
- **step**：job 内按顺序执行，可以是 shell 命令（\`run:\`）或现成 action（\`uses:\`）。
- **action**：可复用单元，GitHub 官方和社区提供大量现成 action。
- **runner**：执行 job 的虚拟机，\`ubuntu-latest\` / \`windows-latest\` / \`macos-latest\`。

触发方式（\`on:\`）：
- \`push\`：推送时触发
- \`pull_request\`：PR 时触发
- \`schedule\`：定时（cron）
- \`workflow_dispatch\`：手动触发
- \`release\`：发布 release 时

## 三、Demo 1：最简 CI 配置（跑测试）

\`\`\`yaml
# .github/workflows/ci.yml —— 最简 CI

# workflow 名字
name: CI

# 触发条件
on:
  push:
    # main/master 分支推送时触发
    branches: [main, master]
  pull_request:
    # PR 到 main/master 时触发
    branches: [main, master]

# 定义作业
jobs:
  test:
    # 跑在 ubuntu 虚拟机
    runs-on: ubuntu-latest
    
    steps:
      # 第 1 步：拉取代码
      - uses: actions/checkout@v4
      
      # 第 2 步：装 Python
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      
      # 第 3 步：装依赖
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-cov httpx
      
      # 第 4 步：跑测试，生成覆盖率报告
      - run: pytest --cov=app --cov-report=xml
      
      # 第 5 步：上传覆盖率到 codecov
      - uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
          token: \${{ secrets.CODECOV_TOKEN }}
\`\`\`

写完提交到仓库，GitHub 仓库的 Actions 标签页就能看到运行情况。绿色对勾=通过，红色叉=失败。

\`uses: actions/checkout@v4\`：官方 action，把代码 checkout 到 runner。不写这步，runner 上没代码。

\`@v4\` 是版本号，建议固定大版本，避免 action 更新破坏你的 workflow。

## 四、Demo 2：矩阵测试（多 Python 版本）

你的库要支持多个 Python 版本？用 matrix 一次跑多套环境。

\`\`\`yaml
# .github/workflows/matrix.yml —— 多版本矩阵测试

name: Matrix Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    # 矩阵：会展开成 3 个 job，分别用 3.10/3.11/3.12
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
      # 某个版本失败不取消其他版本（默认 true 会取消）
      fail-fast: false
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          # 用矩阵变量
          python-version: \${{ matrix.python-version }}
      
      - run: pip install -r requirements.txt
      - run: pip install pytest httpx
      - run: pytest -v
\`\`\`

矩阵还能组合多个维度：

\`\`\`yaml
strategy:
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
    os: [ubuntu-latest, macos-latest]
    # 会展开成 3*2=6 个 job
\`\`\`

## 五、Demo 3：缓存 pip 依赖加速

每次 CI 都重装依赖很慢（FastAPI 项目几十秒）。缓存能省一半时间。

\`\`\`yaml
# .github/workflows/ci.yml —— 加缓存

name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      
      # 缓存 pip 下载的包
      - uses: actions/cache@v4
        with:
          # 缓存路径（pip 默认缓存目录）
          path: ~/.cache/pip
          # 缓存 key：依赖文件 hash 变了就重建缓存
          key: \${{ runner.os }}-pip-\${{ hashFiles('requirements.txt') }}
          # 部分命中也能用（同 OS 的旧缓存）
          restore-keys: |
            \${{ runner.os }}-pip-
      
      # 装依赖（命中缓存会快很多）
      - run: pip install -r requirements.txt
      - run: pip install pytest httpx
      - run: pytest
\`\`\`

\`hashFiles('requirements.txt')\`：requirements.txt 内容变了，hash 就变，缓存失效重建。内容没变，复用缓存，秒装。

\`setup-python\` action 其实内置了 pip 缓存，更简单：

\`\`\`yaml
- uses: actions/setup-python@v5
  with:
    python-version: "3.11"
    cache: "pip"  # 自动缓存 pip
    cache-dependency-path: requirements.txt
\`\`\`

## 六、Demo 4：构建 Docker 镜像并推送

CI 通过后，构建 Docker 镜像推到 Docker Hub，供后续部署拉取。

\`\`\`yaml
# .github/workflows/build-push.yml —— 构建并推送镜像

name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 登录 Docker Hub（用 secrets 存账号密码）
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USER }}
          password: \${{ secrets.DOCKER_TOKEN }}
      
      # 设置镜像标签（用 git 短 hash + latest）
      - name: Set tags
        id: tags
        run: echo "short_sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
      
      # 构建并推送
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          # 两个标签：版本号 + latest
          tags: |
            \${{ secrets.DOCKER_USER }}/api:\${{ steps.tags.outputs.short_sha }}
            \${{ secrets.DOCKER_USER }}/api:latest
\`\`\`

前置条件：
1. 仓库根目录有 \`Dockerfile\`。
2. Docker Hub 创建 access token。
3. GitHub 仓库 Settings → Secrets 添加 \`DOCKER_USER\` 和 \`DOCKER_TOKEN\`。

## 七、Demo 5：SSH 部署到服务器

镜像推完后，SSH 到生产服务器拉新镜像重启。

\`\`\`yaml
# .github/workflows/deploy.yml —— SSH 部署

name: Deploy

on:
  push:
    branches: [main]

jobs:
  # 先跑测试
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      - run: pip install -r requirements.txt
      - run: pip install pytest httpx
      - run: pytest
  
  # 测试通过后部署
  deploy:
    needs: test  # 等 test job 通过
    runs-on: ubuntu-latest
    # 只有 main 分支才部署
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      # SSH 到服务器执行命令
      - uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SERVER_SSH_KEY }}
          # 在服务器上执行的脚本
          script: |
            cd /var/www/api
            git pull origin main
            docker-compose up -d --build
            docker image prune -f
      
      # 部署后健康检查
      - name: Health check
        run: |
          sleep 10
          curl --fail https://api.example.com/health || exit 1
\`\`\`

Secrets 配置：
- \`SERVER_HOST\`：服务器 IP
- \`SERVER_USER\`：SSH 用户名
- \`SERVER_SSH_KEY\`：SSH 私钥（完整内容，含 BEGIN/END）

## 八、Demo 6：覆盖率门禁

测试覆盖率低于阈值就失败，防止代码质量退化。

\`\`\`yaml
# .github/workflows/coverage.yml —— 覆盖率门禁

name: Coverage Gate

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-cov httpx
      
      # 跑测试带覆盖率，--cov-fail-under 设阈值
      # 覆盖率低于 80% 整个命令失败（exit 1）
      - run: pytest --cov=app --cov-fail-under=80 --cov-report=term-missing
      
      # 生成 xml 报告
      - run: pytest --cov=app --cov-report=xml
      
      # 上传到 codecov
      - uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
          token: \${{ secrets.CODECOV_TOKEN }}
\`\`\`

\`--cov-fail-under=80\`：覆盖率低于 80% 退出码非 0，CI 失败。这是强制门禁，新人提交少测试的代码会被卡住。

## 九、Demo 7：完整 CI/CD 流水线

整合：test → build → push → deploy，带环境隔离。

\`\`\`yaml
# .github/workflows/pipeline.yml —— 完整 CI/CD 流水线

name: Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ============ 1. 测试 ============
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: "pip"
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-cov httpx ruff
      # lint 检查
      - run: ruff check .
      # 跑测试
      - run: pytest --cov=app --cov-fail-under=80

  # ============ 2. 构建并推送镜像 ============
  build:
    needs: test  # 测试通过才构建
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USER }}
          password: \${{ secrets.DOCKER_TOKEN }}
      - name: Set tags
        id: vars
        run: |
          echo "sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
          echo "branch=\${GITHUB_REF##*/}" >> $GITHUB_OUTPUT
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            \${{ secrets.DOCKER_USER }}/api:\${{ steps.vars.outputs.sha }}
            \${{ secrets.DOCKER_USER }}/api:\${{ steps.vars.outputs.branch }}

  # ============ 3. 部署到 staging ============
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging  # GitHub 环境，可配审批
    steps:
      - uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.STAGING_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/api-staging
            docker-compose pull
            docker-compose up -d
      - name: Health check
        run: |
          sleep 10
          curl --fail https://staging.example.com/health

  # ============ 4. 部署到 production ============
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production  # 生产环境，可配人工审批
    steps:
      - uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.PROD_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/api
            docker-compose pull
            docker-compose up -d
      - name: Health check
        run: |
          sleep 15
          curl --fail https://api.example.com/health
\`\`\`

\`environment: production\`：GitHub Environments 功能，可在仓库设置里配「需要人工审批」「限定分支」等保护规则。生产部署必须有人点 approve 才会跑。

## 十、GitHub Actions 常用 action 表

| action | 作用 |
|---|---|
| actions/checkout@v4 | 拉取代码 |
| actions/setup-python@v5 | 装 Python，内置 pip 缓存 |
| actions/cache@v4 | 缓存任意目录 |
| actions/upload-artifact@v4 | 上传构建产物 |
| actions/download-artifact@v4 | 下载构建产物 |
| docker/login-action@v3 | 登录 Docker registry |
| docker/build-push-action@v5 | 构建推送镜像 |
| appleboy/ssh-action@v1 | SSH 执行远程命令 |
| appleboy/telegram-action@v1 | Telegram 通知 |
| codecov/codecov-action@v4 | 上传覆盖率 |
| slackapi/slack-github-action@v1 | Slack 通知 |

## 本章小结

| 知识点 | 要点 |
|---|---|
| CI/CD 价值 | 自动测试/部署，降低上线风险 |
| 核心概念 | workflow/job/step/action/runner |
| 触发方式 | push/PR/schedule/dispatch/release |
| 最简 CI | checkout + setup-python + pytest |
| 矩阵测试 | strategy.matrix 多版本组合 |
| pip 缓存 | actions/cache 或 setup-python cache: pip |
| Docker 推送 | docker/login + docker/build-push |
| SSH 部署 | appleboy/ssh-action 执行远程脚本 |
| 覆盖率门禁 | pytest --cov-fail-under=80 |
| 完整流水线 | test → build → deploy(staging/production) |
| 环境 | environment 配审批，保护生产 |
| 常用 action | checkout/setup-python/cache/build-push/ssh |
`
  },

  // ============================================================
  // 第 5 章：监控与日志
  // ============================================================
  {
    id: "ft-monitor",
    group: "生产部署",
    icon: "📈",
    title: "监控与日志",
    content: `# 监控与日志

## 一、可观测性三支柱

线上系统出问题时，你得能「看见」发生了什么。**可观测性（Observability）** 就是让系统内部状态可以从外部观察的能力。它有三个支柱：

| 支柱 | 回答的问题 | 工具 |
|---|---|---|
| 日志（Logging） | 发生了什么？什么时候？ | loguru、ELK、Loki |
| 指标（Metrics） | 现在怎么样？趋势如何？ | Prometheus、Grafana |
| 追踪（Tracing） | 一个请求经过了哪些环节？哪慢？ | OpenTelemetry、Jaeger |

三者互补：
- **日志**：详细事件记录，但分散，难聚合。
- **指标**：聚合数值（QPS、延迟、错误率），适合告警和看趋势，但不细。
- **追踪**：单请求视角，串联多个服务，定位瓶颈。

> 生活类比：可观测性像「医院监护」。
> - 日志是「病历」——记录每次就诊详细情况。
> - 指标是「心电图」——实时数值，异常就报警。
> - 追踪是「检查流程」——一个病人从挂号→抽血→B超→出报告，看哪步慢。
> 没有监控的系统像「蒙眼开车」，出事故了才知道，而且不知道为什么。

## 二、Demo 1：FastAPI 结构化日志（JSON 格式）

生产环境日志必须是**结构化的**（JSON），方便 ELK/Loki 解析检索。纯文本日志难查询。

\`\`\`python
# logging_json.py —— 结构化 JSON 日志

import logging
import json
from datetime import datetime

# 自定义 JSON 格式化器
class JsonFormatter(logging.Formatter):
    """把日志记录格式化成 JSON 字符串
    
    方便 ELK/Loki 解析，比纯文本好检索
    """
    def format(self, record):
        # 构造日志字典
        log_dict = {
            # 时间戳（ISO 格式）
            "time": datetime.utcnow().isoformat() + "Z",
            # 日志级别
            "level": record.levelname,
            # 日志消息
            "msg": record.getMessage(),
            # 模块名
            "module": record.module,
            # 行号
            "line": record.lineno,
        }
        # 如果有异常，加上 traceback
        if record.exc_info:
            log_dict["exception"] = self.formatException(record.exc_info)
        # 序列化成 JSON
        return json.dumps(log_dict, ensure_ascii=False)

# 配置 root logger
def setup_logging():
    """配置全局日志（在 FastAPI 启动时调用一次）"""
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.handlers = [handler]

# FastAPI 应用
from fastapi import FastAPI
app = FastAPI()

# 启动时配置日志
setup_logging()
logger = logging.getLogger("api")

@app.get("/")
def root():
    logger.info("访问根路径")
    return {"ok": True}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    # 带结构化字段的日志
    logger.info(f"查询商品 item_id={item_id}")
    if item_id < 0:
        logger.error(f"非法参数 item_id={item_id}")
        from fastapi import HTTPException
        raise HTTPException(400, "id 不能为负")
    return {"id": item_id}
\`\`\`

输出示例（每行一个 JSON）：

\`\`\`json
{"time":"2026-07-13T03:00:00Z","level":"INFO","msg":"访问根路径","module":"logging_json","line":42}
{"time":"2026-07-13T03:00:01Z","level":"ERROR","msg":"非法参数 item_id=-1","module":"logging_json","line":50}
\`\`\`

ELK 里可以按 \`level=ERROR\` 过滤、按时间排序，比 grep 文本日志高效。

## 三、Demo 2：用 loguru 简化日志

标准库 logging 配置繁琐。loguru 是第三方库，一行配置搞定，API 更简洁。

\`\`\`python
# loguru_app.py —— 用 loguru 简化日志

# 先 pip install loguru
from loguru import logger
from fastapi import FastAPI

# 配置 loguru
logger.add(
    "app.log",            # 输出到文件
    rotation="100 MB",    # 单文件 100MB 轮转
    retention="10 days",  # 保留 10 天
    compression="zip",    # 旧日志压缩
    level="INFO",         # 记录 INFO 及以上
    # JSON 格式化（生产用）
    serialize=True,
)
# 也输出到 stderr（容器化用，stdout/stderr 被 docker logs 收集）
logger.add(sink=print, level="INFO")

app = FastAPI()

@app.get("/")
def root():
    # loguru 用法极简
    logger.info("hit root")
    return {"ok": True}

@app.get("/user/{user_id}")
def get_user(user_id: int):
    # 带结构化字段（loguru 的 bind）
    logger.bind(user_id=user_id).info("查询用户")
    if user_id == 0:
        # 异常日志自动带 traceback
        try:
            1 / 0
        except Exception:
            logger.exception("除零错误")
    return {"id": user_id}
\`\`\`

loguru 的优势：
- **开箱即用**：\`from loguru import logger\` 直接用，不用配置 handler。
- **自动轮转**：\`rotation="100 MB"\` 自动切文件。
- **自动压缩**：\`compression="zip"\` 旧日志压缩省空间。
- **异常 traceback**：\`logger.exception()\` 自动捕获完整堆栈。
- **serialize=True**：输出 JSON，方便 ELK。

## 四、Demo 3：Prometheus 指标采集

Prometheus 是最流行的指标系统。FastAPI 用 \`prometheus-fastapi-instrumentator\` 一行接入。

\`\`\`python
# prom_app.py —— Prometheus 指标采集

# pip install prometheus-fastapi-instrumentator
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# 注册 Prometheus 指标采集
# 必须在路由定义之前调用
Instrumentator().instrument(app).expose(app)

# 普通接口
@app.get("/")
def root():
    return {"ok": True}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"id": item_id}
\`\`\`

启动后访问 \`/metrics\` 端点，能看到 Prometheus 格式的指标：

\`\`\`text
# HELP http_requests_total 总请求数
# TYPE http_requests_total counter
http_requests_total{handler="/",method="GET",status="200"} 12
http_requests_total{handler="/items/{item_id}",method="GET",status="200"} 5
http_requests_total{handler="/items/{item_id}",method="GET",status="404"} 2

# HELP http_request_duration_seconds 请求耗时
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{handler="/",le="0.1"} 12
http_request_duration_seconds_bucket{handler="/",le="0.5"} 12
\`\`\`

Prometheus 配置抓取：

\`\`\`yaml
# prometheus.yml —— Prometheus 配置

global:
  scrape_interval: 15s  # 每 15 秒抓一次

scrape_configs:
  - job_name: "fastapi"
    static_configs:
      # FastAPI 的 /metrics 端点
      - targets: ["localhost:8000"]
    metrics_path: /metrics
\`\`\`

自动采集的指标：
- \`http_requests_total\`：请求数（按路径、方法、状态码分维度）
- \`http_request_duration_seconds\`：请求延迟直方图
- \`http_requests_in_progress\`：当前在处理的请求数

## 五、Demo 4：Grafana 可视化

Prometheus 只存数据，要看图得用 Grafana。

\`\`\`yaml
# docker-compose.yml —— Prometheus + Grafana

version: "3.8"
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
\`\`\`

Grafana 里添加 Prometheus 数据源后，常用 PromQL 查询：

\`\`\`text
# QPS（每秒请求数）
rate(http_requests_total[1m])

# P99 延迟
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) 
  / sum(rate(http_requests_total[5m]))

# 按路径分组 QPS
sum by(handler)(rate(http_requests_total[1m]))
\`\`\`

## 六、Demo 5：Sentry 异常追踪

日志能记录错误，但聚合、去重、通知不擅长。Sentry 专门做异常追踪，自动去重、收集环境、发邮件/Slack。

\`\`\`python
# sentry_app.py —— Sentry 异常追踪

# pip install sentry-sdk
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from fastapi import FastAPI

# 初始化 Sentry（在所有其他代码之前）
sentry_sdk.init(
    # DSN，在 sentry.io 项目设置里找
    dsn="https://xxx@sentry.io/123",
    # 性能追踪采样率（0.1 = 10% 请求记录 trace）
    traces_sample_rate=0.1,
    # FastAPI 集成
    integrations=[FastApiIntegration()],
    # 发送个人隐私信息（默认 False）
    send_default_pii=False,
    # 环境标识
    environment="production",
    # release 版本（用于关联代码）
    release="api@1.2.3",
)

app = FastAPI()

@app.get("/")
def root():
    return {"ok": True}

@app.get("/error")
def trigger_error():
    # 这个异常会自动上报到 Sentry
    1 / 0
    return {}

@app.get("/manual")
def manual_report():
    try:
        # 业务逻辑
        result = do_something()
    except Exception as e:
        # 手动上报（不抛出）
        sentry_sdk.capture_exception(e)
        return {"error": "内部错误"}
    return {"result": result}
\`\`\`

Sentry 的价值：
- **自动去重**：同一异常多次发生，Sentry 聚合成一个 issue，显示发生次数。
- **堆栈定位**：完整堆栈 + 局部变量值，直接定位到代码行。
- **面包屑**：异常前的操作链路（用户点了什么、调了什么 API）。
- **通知**：新异常首次出现才通知，避免噪音。

## 七、Demo 6：OpenTelemetry 分布式追踪

微服务架构下一个请求经过多个服务，出问题要串联整条链路。OpenTelemetry 是标准。

\`\`\`python
# otel_app.py —— OpenTelemetry 追踪

# pip install opentelemetry-distro opentelemetry-instrumentation-fastapi
# opentelemetry-instrumentation-requests opentelemetry-exporter-otlp
from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

# 配置 tracer
resource = Resource.create({"service.name": "fastapi-api"})
provider = TracerProvider(resource=resource)
# 导出到 Jaeger/Tempo（OTLP 协议）
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://localhost:4317"))
provider.add_span_processor(processor)

app = FastAPI()

# 自动埋点 FastAPI（每个请求一个 span）
FastAPIInstrumentor.instrument_app(app)
# 自动埋点 requests（调用外部 API 也有 span）
RequestsInstrumentor().instrument()

@app.get("/")
def root():
    return {"ok": True}

@app.get("/aggregate")
def aggregate():
    # 这个请求会生成一个 trace
    # 里面包含：FastAPI span + 调外部 API 的 span
    import requests
    # 调外部服务，自动有 span
    r = requests.get("https://api.example.com/data")
    return {"data": r.json()}
\`\`\`

在 Jaeger 里能看到一个 trace 的时间线：哪个 span 慢、哪个服务是瓶颈，一目了然。

## 八、Demo 7：健康检查端点

Kubernetes、Docker、负载均衡器都需要健康检查端点判断服务是否正常。

\`\`\`python
# health_app.py —— 健康检查端点

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

app = FastAPI()

# 数据库依赖
def get_db():
    from db import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ 存活检查（liveness）============
# 只检查进程是否活着，不检查依赖
# k8s livenessProbe 用这个，失败会重启容器
@app.get("/health")
def health():
    """存活检查：进程在跑就返回 200
    
    不查数据库，因为 DB 短暂抖动不应该重启进程
    """
    return {"status": "ok"}

# ============ 就绪检查（readiness）============
# 检查依赖（DB、Redis）是否正常
# k8s readinessProbe 用这个，失败会把 Pod 从负载均衡摘除
@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    """就绪检查：能正常服务才返回 200
    
    检查 DB 连接，连不上返回 503
    """
    try:
        # 执行简单查询测试连接
        db.execute(text("SELECT 1"))
        return {"status": "ready", "db": "ok"}
    except Exception as e:
        # 依赖挂了，返回 503，负载均衡不再转发流量
        raise HTTPException(
            status_code=503,
            detail=f"not ready: {str(e)}"
        )

# ============ 启动检查（startup）============
# k8s startupProbe 用，启动慢的服务用这个
@app.get("/startup")
def startup():
    """启动检查：应用初始化完成才返回 200"""
    # 检查模型是否加载、缓存是否预热
    if not app.state.ready:
        raise HTTPException(503, "still starting")
    return {"status": "started"}
\`\`\`

\`/health\` 和 \`/ready\` 的区别是精髓：
- **liveness 失败** → 重启容器（进程死了才重启）
- **readiness 失败** → 不重启，只摘流量（依赖没好别接客）

> 生活类比：liveness 是「员工还活着吗」，死了叫救护车（重启）；readiness 是「员工能干活吗」，不能干就先别派活给他（摘流量），等他能干了再派。员工感冒（DB 抖动）不需要叫救护车，只需要休息一下不接客。

## 九、Demo 8：中间件统一记录请求日志

每个请求都要记录：耗时、状态码、路径、IP。用中间件统一处理，不用每个接口手写。

\`\`\`python
# middleware_logging.py —— 请求日志中间件

import time
from fastapi import FastAPI, Request
from loguru import logger

app = FastAPI()

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """记录每个请求的耗时、状态码、路径、IP"""
    # 请求开始时间
    start = time.time()
    # 获取客户端 IP（考虑反向代理）
    client_ip = request.headers.get("X-Real-IP", request.client.host)
    # 请求方法 + 路径
    method = request.method
    path = request.url.path
    
    # 调用下一个中间件/路由
    try:
        response = await call_next(request)
    except Exception as e:
        # 异常请求也算一次响应
        duration = (time.time() - start) * 1000
        logger.bind(
            method=method,
            path=path,
            ip=client_ip,
            status=500,
            duration_ms=round(duration, 2),
        ).error(f"请求异常: {e}")
        raise
    
    # 计算耗时（毫秒）
    duration = (time.time() - start) * 1000
    status = response.status_code
    
    # 结构化日志
    logger.bind(
        method=method,
        path=path,
        ip=client_ip,
        status=status,
        duration_ms=round(duration, 2),
    ).info("请求完成")
    
    # 慢请求警告（超过 1 秒）
    if duration > 1000:
        logger.bind(
            method=method, path=path, duration_ms=round(duration, 2),
        ).warning("慢请求")
    
    return response

@app.get("/")
def root():
    return {"ok": True}

@app.get("/slow")
def slow():
    import time
    time.sleep(1.5)  # 模拟慢请求
    return {"ok": True}
\`\`\`

日志输出示例：

\`\`\`json
{"method":"GET","path":"/","ip":"1.2.3.4","status":200,"duration_ms":3.2,"msg":"请求完成"}
{"method":"GET","path":"/slow","ip":"1.2.3.4","status":200,"duration_ms":1502.1,"msg":"慢请求"}
\`\`\`

在 ELK 里可以按 \`duration_ms > 1000\` 过滤慢请求，按 \`path\` 分组统计 P99 延迟。

## 十、监控工具对比表

| 工具 | 类型 | 优势 | 劣势 | 适用场景 |
|---|---|---|---|---|
| loguru | 日志 | 简单易用、自动轮转 | 单机为主 | 中小项目日志 |
| ELK | 日志 | 全文检索强、生态好 | 重、吃资源 | 大规模日志检索 |
| Loki | 日志 | 轻量、和 Grafana 集成 | 检索弱于 ES | 容器化日志 |
| Prometheus | 指标 | 时序数据库强、Pull 模型 | 不适合日志 | 指标采集告警 |
| Grafana | 可视化 | 多数据源、面板丰富 | 不存数据 | 通用看板 |
| Sentry | 异常 | 自动去重、堆栈定位 | 只管异常 | 异常追踪 |
| OpenTelemetry | 追踪 | 标准化、多语言 | 配置复杂 | 分布式追踪 |
| Jaeger | 追踪 | UI 直观、开源 | 功能单一 | 链路可视化 |

## 本章小结

| 知识点 | 要点 |
|---|---|
| 可观测性三支柱 | 日志（发生了什么）/ 指标（趋势）/ 追踪（链路） |
| 结构化日志 | JSON 格式，方便 ELK 解析 |
| loguru | 开箱即用，rotation + retention + serialize |
| Prometheus | instrument + expose /metrics |
| PromQL | rate/histogram_quantile 算 QPS/P99 |
| Grafana | 数据源 Prometheus，可视化面板 |
| Sentry | capture_exception 自动去重 + 堆栈 |
| OpenTelemetry | instrument_app 自动埋点，OTLP 导出 |
| 健康检查 | /health(存活) vs /ready(就绪) |
| 日志中间件 | 记录耗时/状态码/路径/IP，慢请求告警 |
| 工具选型 | 日志 loguru/ELK、指标 Prometheus、异常 Sentry、追踪 OTel |
`
  }
];
