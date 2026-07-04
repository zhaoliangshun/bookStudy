// =============================================================
// Python 部署与运维实战教程 —— 第 6 批章节（Nginx 反向代理 5 章）
// -------------------------------------------------------------
// 覆盖：Nginx 简介安装 → 配置文件详解 → 反向代理与负载均衡
//       → HTTPS 与性能优化 → Python 应用部署实战
// =============================================================

export const chapters = [
  {
    id: "deploy-nginx-intro",
    icon: "🌐",
    title: "Nginx 简介与安装",
    group: "Nginx 反向代理",
    content: `# Nginx 简介与安装

## 一、Nginx 是什么

Nginx（发音 "engine-x"）是一款开源的高性能 Web 服务器、反向代理服务器和邮件代理服务器。它由俄罗斯工程师 Igor Sysoev 在 2004 年首次公开发布，最初的目的是解决 C10K 问题——一台服务器同时处理一万个并发连接。

今天，Nginx 已经是全球使用最广泛的 Web 服务器之一，根据 Netcraft 和 W3Techs 的统计，全球 Top 100 万网站中有超过 30% 使用 Nginx，包括 Netflix、GitHub、WordPress.com、Pinterest、Airbnb 等知名产品。

### 1.1 为什么 Nginx 这么流行

Nginx 的流行不是偶然，它有三个核心优势：

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  Nginx 三大杀手锏                                            │
├──────────────────────────────────────────────────────────────┤
│  1. 高并发：单机可处理数万并发连接，远超传统服务器            │
│  2. 低内存：处理一万个保持连接的请求只占几 MB 内存            │
│  3. 事件驱动：异步非阻塞 IO 模型，少量进程处理大量连接        │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### 1.2 事件驱动模型

传统 Web 服务器（如 Apache 的 prefork 模式）采用"一个连接一个进程/线程"的模型。每来一个连接就 fork 一个进程或创建一个线程去处理，连接多了，进程/线程切换的开销巨大。

\`\`\`text
传统模型（Apache prefork）：
  连接1 ──→ worker 进程1（阻塞等待）
  连接2 ──→ worker 进程2（阻塞等待）
  连接3 ──→ worker 进程3（阻塞等待）
  ...
  连接10000 ──→ worker 进程10000  ← 进程切换爆炸，内存爆炸

Nginx 事件驱动模型：
  一个 worker 进程（单线程）通过 epoll 同时监听几万个连接
  哪个连接有数据可读/可写，就处理哪个，全程不阻塞
  连接1 ──┐
  连接2 ──┤
  连接3 ──┼──→ worker 进程（epoll 事件循环）
  ...     │
  连接N ──┘
\`\`\`

Nginx 通常启动一个 master 进程和多个 worker 进程（默认等于 CPU 核数）。master 负责管理 worker、读取配置，worker 负责实际处理请求。worker 之间通过共享内存（slab allocator）协调，避免了锁竞争。

### 1.3 Nginx 能做什么

\`\`\`text
Nginx 的核心能力：
  1. 静态 Web 服务器      —— 直接返回 HTML/CSS/JS/图片等静态文件
  2. 反向代理             —— 把请求转发给后端应用（FastAPI/Django/Flask/Node）
  3. 负载均衡             —— 把请求分发到多台后端服务器
  4. HTTPS 终结           —— 在 Nginx 层处理 SSL，后端用明文 HTTP
  5. 缓存                 —— 缓存后端响应，减轻后端压力
  6. 压缩                 —— gzip 压缩响应，节省带宽
  7. 限流                 —— 限制请求速率，防止恶意刷接口
  8. 虚拟主机             —— 一台机器一个 Nginx 托管多个域名
\`\`\`

---

## 二、Nginx vs Apache 对比

Apache 和 Nginx 是 Web 服务器领域的两大霸主，但设计哲学完全不同。

\`\`\`text
┌──────────────────┬────────────────────────┬────────────────────────┐
│  对比项          │  Apache                │  Nginx                 │
├──────────────────┼────────────────────────┼────────────────────────┤
│  架构模型        │  进程/线程模型         │  事件驱动（异步非阻塞） │
│  并发能力        │  一般（数百~数千）     │  极高（数万~十万）      │
│  内存占用        │  随连接数线性增长      │  很低且稳定             │
│  静态文件        │  较慢                  │  极快（sendfile）       │
│  动态内容        │  内嵌模块（mod_php等） │  反向代理给后端         │
│  配置复杂度      │  较繁琐                │  相对清晰               │
│  .htaccess       │  支持目录级覆盖        │  不支持（统一在主配置） │
│  模块加载        │  运行时动态加载        │  编译时静态链接（旧版） │
│  适用场景        │  传统动态站点          │  高并发、反代、静态     │
└──────────────────┴────────────────────────┴────────────────────────┘
\`\`\`

### 2.1 关键差异解读

**静态文件性能**：Nginx 用 sendfile 系统调用，直接在内核态把文件从磁盘送到网卡，绕过用户态拷贝，性能远超 Apache。

**动态内容处理**：Apache 习惯把 PHP/Python 解释器内嵌进 worker（mod_php、mod_wsgi），每个 worker 都加载解释器，内存开销大。Nginx 走"反向代理"路线，把动态请求转给独立的 Python/PHP 进程，Nginx 只管 IO，职责分离，各司所长。

**.htaccess**：Apache 允许在每个目录放 .htaccess 覆盖配置，灵活但每次请求都要递归读取，性能差。Nginx 不支持 .htaccess，所有配置集中在主配置文件，启动时一次性加载，性能更好但灵活性低。

### 2.2 什么时候用哪个

\`\`\`bash
# 用 Nginx 的场景：
# - 高并发静态资源服务（CDN 节点、图片服务器）
# - 反向代理 + 负载均衡
# - Python/Node 应用前端的网关
# - 单机托管大量虚拟主机

# 用 Apache 的场景：
# - 老项目强依赖 .htaccess（如 WordPress 的固定链接）
# - 需要 mod_php 直接内嵌运行 PHP
# - 企业内网传统 LAMP 架构

# 最佳实践：Nginx 在前做反代 + 静态，Apache 在后跑动态
# 现代部署基本首选 Nginx
\`\`\`

---

## 三、安装 Nginx

### 3.1 Ubuntu / Debian 安装（apt）

这是生产服务器最常见的安装方式。

\`\`\`bash
# 1. 更新包索引
sudo apt update

# 2. 安装 Nginx
sudo apt install nginx -y
# -y 自动确认安装

# 3. 验证版本
nginx -v
# 输出示例：nginx version: nginx/1.18.0 (Ubuntu)

# 4. 查看安装了哪些文件
dpkg -L nginx | head -20
# 输出会列出 /usr/sbin/nginx、/etc/nginx/、/lib/systemd/system/nginx.service 等

# 5. 查看服务状态
sudo systemctl status nginx
# 应显示 active (running)

# 6. 浏览器访问 http://服务器IP
# 看到 "Welcome to nginx!" 欢迎页就成功了
\`\`\`

### 3.2 安装官方最新版（推荐）

Ubuntu 仓库里的 Nginx 版本可能较旧。Nginx 官方提供了自己的 apt 源，能装到最新稳定版。

\`\`\`bash
# 1. 安装前置依赖
sudo apt install curl gnupg2 ca-certificates lsb-release ubuntu-keyring -y

# 2. 导入 Nginx 官方 GPG 签名密钥
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \\
  | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null

# 3. 添加 Nginx 稳定版仓库
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \\
  http://nginx.org/packages/ubuntu \$(lsb_release -cs) nginx" \\
  | sudo tee /etc/apt/sources.list.d/nginx.list

# 4. 设置仓库优先级（让官方源优先于 Ubuntu 自带源）
echo -e "Package: *\\nPin: origin nginx.org\\nPin-Priority: 900" \\
  | sudo tee /etc/apt/preferences.d/99nginx

# 5. 更新并安装
sudo apt update
sudo apt install nginx -y

nginx -v
# 现在装的是官方最新稳定版，例如 nginx/1.26.0
\`\`\`

### 3.3 macOS 安装（Homebrew）

开发环境用 macOS 时，用 Homebrew 安装最方便。

\`\`\`bash
# 用 Homebrew 安装
brew install nginx
# Homebrew 会自动下载、编译、安装最新版

# 验证
nginx -v
# 输出示例：nginx version: nginx/1.25.4

# 查看安装位置
brew info nginx
# 会显示：
# - 可执行文件：/opt/homebrew/bin/nginx（Apple Silicon）
# - 配置目录：/opt/homebrew/etc/nginx/
# - 默认根目录：/opt/homebrew/var/www/

# 启动 Nginx（前台运行，Ctrl+C 停止）
nginx

# 后台运行（brew services 管理）
brew services start nginx
# brew services 会把 Nginx 注册成 macOS 后台服务，开机自启

# 停止
brew services stop nginx

# 重启
brew services restart nginx

# 浏览器访问 http://localhost:8080
# macOS Homebrew 版默认监听 8080 端口（非 80，因为 80 需要 root）
\`\`\`

### 3.4 源码编译安装

需要自定义模块、特定 OpenSSL 版本或最新特性时，从源码编译。

\`\`\`bash
# 1. 安装编译依赖
sudo apt update
sudo apt install build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev \\
  libssl-dev libgd-dev libxml2-dev libxslt1-dev -y
# build-essential  : gcc/make 等编译工具链
# libpcre3-dev     : 正则表达式库（Nginx 的 location 重写依赖它）
# zlib1g-dev       : gzip 压缩依赖
# libssl-dev       : OpenSSL，HTTPS 依赖
# libgd-dev        : 图片处理模块依赖
# libxslt1-dev     : XSLT 模块依赖

# 2. 下载源码
cd /usr/local/src
# 稳定版
wget https://nginx.org/download/nginx-1.26.0.tar.gz
# 解压
tar -zxvf nginx-1.26.0.tar.gz
cd nginx-1.26.0

# 3. 配置编译选项（configure 脚本检查环境并生成 Makefile）
./configure \\
  --prefix=/usr/local/nginx \\
  --sbin-path=/usr/local/nginx/nginx \\
  --conf-path=/usr/local/nginx/conf/nginx.conf \\
  --pid-path=/usr/local/nginx/logs/nginx.pid \\
  --with-http_ssl_module \\
  --with-http_v2_module \\
  --with-http_gzip_static_module \\
  --with-http_stub_status_module \\
  --with-pcre-jit
# --prefix            安装根目录
# --with-http_ssl_module      启用 HTTPS 支持
# --with-http_v2_module       启用 HTTP/2
# --with-http_gzip_static_module  预压缩文件支持
# --with-http_stub_status_module  状态监控页
# --with-pcre-jit      PCRE 启用 JIT 加速正则

# 4. 编译并安装
make
sudo make install

# 5. 验证
/usr/local/nginx/nginx -v
# nginx version: nginx/1.26.0

# 6. 启动
sudo /usr/local/nginx/nginx
\`\`\`

源码编译版没有 systemd 服务文件，需要自己写一个：

\`\`\`bash
# 创建 systemd 服务单元
sudo tee /etc/systemd/system/nginx.service > /dev/null <<'EOF'
[Unit]
Description=Nginx HTTP Server
After=network.target

[Service]
Type=forking
PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPre=/usr/local/nginx/nginx -t
ExecStart=/usr/local/nginx/nginx
ExecReload=/usr/local/nginx/nginx -s reload
ExecStop=/usr/local/nginx/nginx -s stop
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# 重载 systemd
sudo systemctl daemon-reload
# 启动
sudo systemctl start nginx
# 设置开机自启
sudo systemctl enable nginx
\`\`\`

---

## 四、Nginx 目录结构

了解 Nginx 的目录结构，是排查问题、修改配置的基础。

### 4.1 apt 安装版的目录结构

\`\`\`text
/etc/nginx/                     ← 配置文件根目录
├── nginx.conf                  ← 主配置文件（全局）
├── sites-available/            ← 可用站点配置（Debian/Ubuntu 特有）
│   └── default                 ← 默认站点
├── sites-enabled/              ← 已启用站点（软链到 sites-available）
│   └── default -> /etc/nginx/sites-available/default
├── conf.d/                     ← 额外配置片段（每个 .conf 会被自动包含）
│   └── default.conf
├── snippets/                   ← 可复用的配置片段
│   ├── self-signed.conf
│   └── snakeoil.conf
├── fastcgi_params              ← FastCGI 参数（PHP 用）
├── uwsgi_params                ← uWSGI 参数（Python 用）
├── scgi_params                 ← SCGI 参数
├── proxy_params                ← 反向代理通用头
├── mime.types                  ← 文件扩展名到 MIME 类型映射
├── modules-enabled/            ← 已启用动态模块
└── koi-utf, koi-win, win-utf   ← 字符集映射

/var/www/html/                  ← 默认网站根目录
/var/log/nginx/                 ← 日志目录
├── access.log                  ← 访问日志
└── error.log                   ← 错误日志
/usr/sbin/nginx                 ← 可执行文件
/lib/systemd/system/nginx.service  ← systemd 服务文件
\`\`\`

### 4.2 sites-available vs sites-enabled

这是 Debian/Ubuntu 系特有的组织方式，借鉴了 Apache 的约定：

\`\`\`bash
# sites-available/ 里放所有"可能用"的站点配置
# sites-enabled/ 里放"现在要启用"的站点配置（用软链接指向 available）

# 启用一个站点
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp

# 禁用一个站点
sudo rm /etc/nginx/sites-enabled/myapp
# 删除软链接即可，原配置文件还在 sites-available 里

# 这种方式的好处：可以随时启用/禁用站点而不删除配置
\`\`\`

### 4.3 macOS Homebrew 版目录结构

\`\`\`text
/opt/homebrew/etc/nginx/        ← 配置目录（Apple Silicon）
/usr/local/etc/nginx/           ← 配置目录（Intel Mac）
├── nginx.conf                  ← 主配置
└── servers/                    ← 站点配置目录（类似 conf.d）

/opt/homebrew/var/www/          ← 默认根目录
/opt/homebrew/var/log/nginx/    ← 日志目录
/opt/homebrew/bin/nginx         ← 可执行文件
\`\`\`

---

## 五、nginx 命令速查

\`\`\`bash
# ===== 启动与停止 =====
nginx                      # 启动 Nginx（加载默认配置）
nginx -c /path/to/nginx.conf  # 启动时指定配置文件
nginx -s stop              # 优雅停止（等当前请求处理完再退出）
nginx -s quit              # 同 stop，优雅退出
nginx -s reload            # 重新加载配置（不中断服务，最常用）
nginx -s reopen            # 重新打开日志文件（日志轮转时用）

# ===== 测试配置 =====
nginx -t                   # 测试配置文件语法是否正确（修改后必做！）
nginx -T                   # 测试并打印完整生效配置（含 include 进来的）

# ===== 版本与信息 =====
nginx -v                   # 显示版本号
nginx -V                   # 显示版本号 + 编译参数 + 模块（排查功能必备）

# ===== 信号控制 =====
nginx -s reload            # 发送 HUP 信号（重载配置）
nginx -s stop              # 发送 TERM 信号（优雅停止）
# 也可以用 kill 命令直接发信号：
# kill -HUP \$(cat /run/nginx.pid)   # 等价 reload
# kill -QUIT \$(cat /run/nginx.pid)  # 等价 quit
\`\`\`

### 5.1 systemd 管理方式（推荐）

在 Ubuntu/CentOS 上，用 systemctl 管理 Nginx 更规范：

\`\`\`bash
# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启（完全重启，会断开连接）
sudo systemctl restart nginx

# 重新加载配置（不断连接，平滑重载）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
# 输出：
# ● nginx.service - The nginx HTTP and reverse proxy server
#      Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
#      Active: active (running) since ...
#        Docs: ...
#   Main PID: 1234 (nginx)
#       Tasks: 9
#      Memory: 12.0M
#         CPU: 1.234s
#      CGroup: /system.slice/nginx.service
#              ├─1234 nginx: master process /usr/sbin/nginx -g daemon on;
#              └─1235 nginx: worker process

# 设置开机自启
sudo systemctl enable nginx

# 取消开机自启
sudo systemctl disable nginx

# 查看是否开机自启
systemctl is-enabled nginx
# 输出 enabled / disabled
\`\`\`

### 5.2 reload vs restart

\`\`\`text
restart：完全重启 Nginx，master 和 worker 全部重新创建
         期间会有短暂的服务中断（虽然通常只有几十毫秒）
         适用：升级 Nginx 二进制、修改了监听端口等无法热重载的配置

reload ：平滑重载配置，master 进程不变
         master 先验证新配置，通过后启动新 worker
         老 worker 处理完当前请求后优雅退出
         全程不断连接，零停机
         适用：修改 server/location 配置、添加站点等（绝大多数日常操作）

结论：日常改配置一律用 reload，只有特殊情况才 restart。
\`\`\`

---

## 六、主配置文件 nginx.conf 结构

\`\`\`nginx
# /etc/nginx/nginx.conf —— Nginx 主配置文件

# ===== 全局块：影响 Nginx 整体运行 =====
user www-data;                    # worker 进程以哪个用户身份运行
worker_processes auto;            # worker 进程数，auto = 自动等于 CPU 核数
pid /run/nginx.pid;               # PID 文件位置
include /etc/nginx/modules-enabled/*.conf;  # 加载动态模块

# ===== events 块：影响连接处理 =====
events {
    worker_connections 768;       # 每个 worker 最大连接数（总并发 = worker_processes × worker_connections）
    # multi_accept on;            # 一次性接收多个连接（高并发场景开）
}

# ===== http 块：Web 服务器核心配置 =====
http {
    # ----- 基础设置 -----
    sendfile on;                  # 启用 sendfile，零拷贝发送静态文件
    tcp_nopush on;                # 数据包攒够再发（配合 sendfile 提升性能）
    tcp_nodelay on;               # 禁用 Nagle 算法，小数据立即发送
    keepalive_timeout 65;         # 客户端 keep-alive 超时时间（秒）
    types_hash_max_size 2048;     # 类型哈希表大小

    # include 进 MIME 类型映射
    include /etc/nginx/mime.types;
    default_type application/octet-stream;  # 未知扩展名默认 MIME

    # ----- 日志格式 -----
    log_format main '\$remote_addr - \$remote_user [\$time_local] '
                    '"\$request" \$status \$body_bytes_sent '
                    '"\$http_referer" "\$http_user_agent"';
    # log_format 定义日志格式，main 是格式名

    access_log /var/log/nginx/access.log;   # 访问日志路径
    error_log /var/log/nginx/error.log;     # 错误日志路径

    # ----- gzip 压缩 -----
    gzip on;                      # 启用 gzip 压缩响应
    gzip_disable "msie6";         # 对 IE6 不压缩

    # ----- 包含站点配置 -----
    include /etc/nginx/conf.d/*.conf;        # 加载 conf.d 下所有 .conf
    include /etc/nginx/sites-enabled/*;      # 加载已启用站点（Debian 系）
}
# ===== http 块结束 =====

# ===== mail 块：邮件代理（一般用不到）=====
# mail {
#     ...
# }

# ===== stream 块：TCP/UDP 代理（4 层）=====
# stream {
#     ...
# }
\`\`\`

### 6.1 配置层级关系

\`\`\`text
nginx.conf
└── http {                    ← http 块（只能有一个）
        ├── 全局 http 配置
        ├── upstream { }      ← 负载均衡组（在 http 内，server 外）
        ├── server {          ← 虚拟主机（一个 server = 一个站点）
        │       ├── listen
        │       ├── server_name
        │       ├── location { }   ← 路径匹配（一个 server 内多个）
        │       │       ├── proxy_pass
        │       │       ├── root / alias
        │       │       └── ...
        │       └── ...
        └── server { ... }
    }
\`\`\`

理解这个层级：http 包含多个 server，server 包含多个 location。请求进来时，Nginx 先按域名匹配 server，再按 URI 匹配 location。

---

## 七、第一个静态站点配置

### 7.1 准备网站文件

\`\`\`bash
# 创建网站根目录
sudo mkdir -p /var/www/mysite

# 创建首页
sudo tee /var/www/mysite/index.html > /dev/null <<'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>我的第一个 Nginx 站点</title>
</head>
<body>
    <h1>🎉 Hello, Nginx!</h1>
    <p>这是我的第一个 Nginx 静态站点。</p>
</body>
</html>
EOF

# 设置目录所有者（让 Nginx 的 www-data 用户能读取）
sudo chown -R www-data:www-data /var/www/mysite
sudo chmod -R 755 /var/www/mysite
\`\`\`

### 7.2 创建站点配置

\`\`\`nginx
# /etc/nginx/sites-available/mysite

server {
    listen 80;                          # 监听 80 端口（HTTP 默认端口）
    listen [::]:80;                     # 监听 IPv6 的 80 端口

    server_name mysite.local;           # 绑定的域名（本地测试可改 hosts）

    root /var/www/mysite;               # 网站根目录
    index index.html index.htm;         # 默认首页文件，按顺序查找

    # 主页 location
    location / {
        try_files \$uri \$uri/ =404;
        # try_files：依次尝试
        #   \$uri    —— 精确匹配请求的文件
        #   \$uri/   —— 请求的目录（找目录下的 index）
        #   =404    —— 都找不到就返回 404
    }

    # 错误页配置
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/mysite;
        internal;                       # internal 表示只能内部跳转访问，不能直接 URL 访问
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/mysite;
    }

    # 静态资源缓存
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js)\$ {
        expires 30d;                    # 这些文件缓存 30 天
        add_header Cache-Control "public, no-transform";
    }

    # 禁止访问隐藏文件（如 .git、.env）
    location ~ /\\. {
        deny all;                       # 拒绝所有访问
    }

    # 访问日志（独立日志，方便分析）
    access_log /var/log/nginx/mysite_access.log;
    error_log /var/log/nginx/mysite_error.log;
}
\`\`\`

### 7.3 启用站点并测试

\`\`\`bash
# 1. 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/mysite

# 2. 测试配置语法（每次改完配置必做！）
sudo nginx -t
# 输出：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 如果语法错误会提示，例如：
# nginx: [emerg] unknown directive "listenn" in /etc/nginx/sites-enabled/mysite:3
# nginx: configuration file /etc/nginx/nginx.conf test failed

# 3. 重载配置
sudo systemctl reload nginx

# 4. 配置本地 hosts（用域名访问）
echo "127.0.0.1 mysite.local" | sudo tee -a /etc/hosts

# 5. 测试访问
curl http://mysite.local
# 输出 HTML 内容就成功了

curl -I http://mysite.local
# -I 只看响应头
# HTTP/1.1 200 OK
# Server: nginx/1.18.0
# Content-Type: text/html
\`\`\`

### 7.4 禁用默认站点（可选）

\`\`\`bash
# 如果不想要默认欢迎页，删除默认站点的软链接
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
\`\`\`

---

## 八、常见安装问题排查

### 8.1 端口被占用

\`\`\`bash
# 启动时报错：nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
# 说明 80 端口被别的程序占了

# 查看谁占了 80 端口
sudo lsof -i :80
# 或
sudo ss -tlnp | grep :80
# 输出示例：apache2  1234  root  4u  IPv6 ... TCP *:80 (LISTEN)

# 解决：停掉占用程序
sudo systemctl stop apache2
# 或改 Nginx 监听端口为 8080 测试
\`\`\`

### 8.2 权限问题

\`\`\`bash
# 报错：nginx: [emerg] open() "/var/www/mysite/index.html" failed (13: Permission denied)
# Nginx worker 用户没有读取文件的权限

# 检查 worker 进程用户
ps aux | grep nginx
# 输出：www-data  1235  ...  nginx: worker process

# 修复权限
sudo chown -R www-data:www-data /var/www/mysite
sudo chmod -R 755 /var/www/mysite

# 检查父目录是否也有执行权限（x 权限允许遍历目录）
sudo namei -l /var/www/mysite/index.html
# 会显示路径每一级的权限，确保 www-data 能逐级进入
\`\`\`

### 8.3 配置语法错误

\`\`\`bash
# nginx -t 是最好的排查工具，会精确指出错误行号
sudo nginx -t
# nginx: [emerg] unexpected "}" in /etc/nginx/sites-enabled/mysite:20
# 多半是少了一个分号 ; 或花括号不匹配

# 查看完整生效配置（排查 include 链）
sudo nginx -T | less
\`\`\`

---

## 九、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  核心知识点回顾                                                │
├──────────────────────────────────────────────────────────────┤
│  1. Nginx 优势：高并发、低内存、事件驱动                      │
│  2. vs Apache：Nginx 适合反代/静态/高并发，Apache 偏动态内嵌  │
│  3. 安装：apt(Ubuntu) / brew(macOS) / 源码编译(自定义模块)    │
│  4. 目录：/etc/nginx/ 配置、/var/log/nginx/ 日志、/var/www/  │
│  5. 命令：nginx -t 测试、-s reload 重载、systemctl 管理服务  │
│  6. 配置层级：http → server → location                        │
│  7. 第一站：listen + server_name + root + location + try_files│
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# 记住这个最小操作闭环：
sudo nginx -t                 # 改完配置先测试
sudo systemctl reload nginx   # 测试通过再重载
sudo systemctl status nginx   # 确认服务正常
tail -f /var/log/nginx/error.log  # 出问题看日志
\`\`\`

下一章我们深入 Nginx 配置文件的每一个指令，把 location 匹配规则、root vs alias、日志配置讲透。
`
  },

  {
    id: "deploy-nginx-config",
    icon: "📄",
    title: "配置文件详解",
    group: "Nginx 反向代理",
    content: `# 配置文件详解

上一章我们装好了 Nginx 并跑通了第一个站点。这一章把 Nginx 配置文件的每一层、每一条指令讲透——server 块、location 匹配规则、root vs alias、index、error_page、日志。掌握这些，你就能看懂任何 Nginx 配置，并写出自己的。

## 一、配置层级：http → server → location

Nginx 配置是严格的树状结构，理解层级是看懂配置的前提。

\`\`\`text
nginx.conf
│
└── http {                          ← 第 1 层：http 块（全局 HTTP 设置）
        │
        ├── server {                ← 第 2 层：虚拟主机（一个域名一个）
        │       │
        │       ├── location / {        ← 第 3 层：URL 路径匹配
        │       │       └── 指令...
        │       │
        │       ├── location /api {
        │       │       └── 指令...
        │       │
        │       └── location ~* \\.(jpg|png)\$ {
        │               └── 指令...
        │       }
        │
        └── server { ... }          ← 另一个虚拟主机
    }
\`\`\`

### 1.1 指令的作用域

指令可以在不同层级使用，作用范围（继承）规则如下：

\`\`\`text
- 在 http 块设的指令 → 对所有 server、location 生效（全局默认）
- 在 server 块设的指令 → 对该 server 下所有 location 生效
- 在 location 块设的指令 → 只对该 location 生效
- 子级可以覆盖父级的同名指令

例：http 里设 keepalive_timeout 65，server A 不设则继承 65
    server B 设 keepalive_timeout 30，则 B 用 30
\`\`\`

### 1.2 include 指令：拆分配置

大型配置不宜全塞进 nginx.conf，用 include 拆分：

\`\`\`nginx
http {
    # 包含 MIME 类型映射（独立文件）
    include /etc/nginx/mime.types;

    # 包含通用 gzip 配置
    include /etc/nginx/snippets/gzip.conf;

    # 包含所有站点配置
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
\`\`\`

include 支持通配符 \`*\`，会按字母顺序加载匹配的文件。

---

## 二、server 块：虚拟主机

一个 server 块代表一个虚拟主机（Virtual Host），Nginx 通过 listen 和 server_name 区分不同站点。

### 2.1 listen：监听端口

\`\`\`nginx
server {
    # 监听 IPv4 80 端口
    listen 80;

    # 监听 IPv6 80 端口
    listen [::]:80;

    # 监听 80 端口，并设为默认站点（没匹配上的域名都走这里）
    listen 80 default_server;

    # 监听 443 端口（HTTPS）
    listen 443 ssl;
    listen [::]:443 ssl;

    # HTTP/2（443 端口 + ssl）
    listen 443 ssl http2;

    # 监听 8080 端口
    listen 8080;

    # 只监听 localhost
    listen 127.0.0.1:8080;
}
\`\`\`

### 2.2 server_name：域名匹配

\`\`\`nginx
# 单个域名
server_name example.com;

# 多个域名（空格分隔，都指向这个 server）
server_name example.com www.example.com;

# 通配符域名（*.example.com 匹配 a.example.com、b.example.com）
server_name *.example.com;

# 通配符开头（example.* 匹配 example.com、example.org）
server_name example.*;

# 正则匹配（~ 开头，区分大小写；~* 不区分）
server_name ~^www\\d+\\.example\\.com\$;
# 匹配 www1.example.com、www2.example.com

# 匹配所有（兜底）
server_name _;
# _ 不是合法域名，所以用作"匹配不上其它域名时的兜底"
# 常配合 default_server 用

# 精确域名优先于通配符，通配符优先于正则
\`\`\`

### 2.3 server_name 匹配优先级

\`\`\`text
当请求的 Host 头匹配多个 server_name 时，优先级从高到低：

1. 精确名称         example.com
2. 开头通配符       *.example.com
3. 结尾通配符       example.*
4. 正则匹配         ~^www\\d+\\.example\\.com\$
5. 都不匹配         走 default_server 或第一个 server
\`\`\`

### 2.4 基于 IP 的虚拟主机

\`\`\`nginx
# 不同 IP 各一个站点
server {
    listen 192.168.1.10:80;       # 监听 192.168.1.10 的 80 端口
    server_name site1.com;
    root /var/www/site1;
}

server {
    listen 192.168.1.11:80;       # 监听 192.168.1.11 的 80 端口
    server_name site2.com;
    root /var/www/site2;
}
\`\`\`

---

## 三、location 匹配规则（重点）

location 是 Nginx 配置的核心——它决定"某个 URL 走哪套规则"。匹配规则有 4 种，优先级各不相同，新手最容易在这里栽跟头。

### 3.1 四种匹配语法

\`\`\`nginx
location [ = | ^~ | ~ | ~* ] uri { ... }
\`\`\`

\`\`\`text
┌──────────┬────────────────────────────┬──────────────┐
│  修饰符  │  含义                      │  匹配方式     │
├──────────┼────────────────────────────┼──────────────┤
│  =       │  精确匹配                   │  完全相等     │
│  ^~      │  前缀匹配（不再正则）       │  普通字符串   │
│  ~       │  正则匹配（区分大小写）     │  正则         │
│  ~*      │  正则匹配（不区分大小写）   │  正则         │
│  无      │  普通前缀匹配（默认）       │  普通字符串   │
└──────────┴────────────────────────────┴──────────────┘
\`\`\`

### 3.2 匹配优先级（重点）

Nginx 不是按配置文件顺序匹配 location 的，而是按优先级：

\`\`\`text
匹配顺序（从高到低）：

1. = 精确匹配          location = /api/health
   命中后立即使用，不再检查其它

2. ^~ 前缀匹配         location ^~ /static/
   最长前缀匹配命中后，不再检查正则

3. 正则匹配 ~ / ~*     location ~* \\.(jpg|png)\$
   按配置文件顺序，第一个命中即用

4. 普通前缀匹配        location /api/
   最长前缀匹配（但优先级低于正则）
\`\`\`

### 3.3 优先级实战示例

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    root /var/www;

    # 1. 精确匹配：请求 /exact 只走这里
    location = /exact {
        return 200 "精确匹配命中\\n";
    }

    # 2. ^~ 前缀：以 /static/ 开头的走这里，不检查正则
    location ^~ /static/ {
        return 200 "static 前缀匹配\\n";
    }

    # 3. 正则：图片文件走这里
    location ~* \\.(jpg|jpeg|png|gif|ico)\$ {
        return 200 "图片正则匹配\\n";
    }

    # 4. 正则：JS/CSS
    location ~* \\.(js|css)\$ {
        return 200 "JS/CSS 正则匹配\\n";
    }

    # 5. 普通前缀
    location /api {
        return 200 "api 前缀匹配\\n";
    }

    # 6. 默认根 location
    location / {
        return 200 "默认匹配\\n";
    }
}
\`\`\`

测试各 URL 命中哪个 location：

\`\`\`bash
curl http://example.com/exact        # → 精确匹配命中
curl http://example.com/static/a.jpg # → static 前缀命中（^~ 阻止了正则）
curl http://example.com/a.jpg        # → 图片正则命中
curl http://example.com/a.js         # → JS/CSS 正则命中
curl http://example.com/api/users    # → api 前缀命中
curl http://example.com/hello        # → 默认 / 命中
\`\`\`

### 3.4 location 路径末尾的斜杠

\`\`\`nginx
# 写法 A：location /api/（带斜杠）
location /api/ {
    proxy_pass http://backend;
}
# 请求 /api/users → 转发 /api/users

# 写法 B：location /api（不带斜杠）
location /api {
    proxy_pass http://backend;
}
# 请求 /api/users → 转发 /api/users
# 但请求 /apiusers 也会匹配这里！可能不是你想要的

# 经验：用前缀匹配时，末尾带斜杠更精确，避免误匹配
\`\`\`

### 3.5 location 嵌套

\`\`\`nginx
# location 可以嵌套（但有约束）
location /api {
    # 内层 location
    location ~* \\.(json)\$ {
        # 处理 /api 下的 json 请求
        add_header Content-Type application/json;
    }
    # 外层处理其它
    proxy_pass http://backend;
}
\`\`\`

---

## 四、root vs alias（高频易错点）

root 和 alias 都用来指定文件根目录，但拼接路径的方式完全不同，是最容易混淆的两个指令。

### 4.1 root：拼接路径

\`\`\`nginx
location /images/ {
    root /var/www;
}
# 请求 /images/cat.jpg
# 实际查找文件：/var/www/images/cat.jpg
# root 把"location 路径 + 请求路径"完整拼到 root 后面

# 也就是说 root 的值 + URI = 文件实际路径
\`\`\`

### 4.2 alias：替换路径

\`\`\`nginx
location /images/ {
    alias /var/www/img/;
}
# 请求 /images/cat.jpg
# 实际查找文件：/var/www/img/cat.jpg
# alias 用 alias 的值"替换"掉 location 匹配的部分
# /images/ 被替换成 /var/www/img/

# 也就是说 alias 的值 + (URI - location 匹配部分) = 文件实际路径
\`\`\`

### 4.3 对比总结

\`\`\`text
请求：/images/cat.jpg

配置                       实际查找路径
location /images/ {        ┐
    root /var/www;         ├→ /var/www/images/cat.jpg   （拼接）
}                          ┘

location /images/ {        ┐
    alias /var/www/img/;   ├→ /var/www/img/cat.jpg      （替换）
}                          ┘
\`\`\`

### 4.4 注意事项

\`\`\`nginx
# 1. alias 末尾必须带斜杠（如果 location 带斜杠）
location /static/ {
    alias /var/www/static/;     # ✅ 正确：alias 带尾斜杠
}
location /static/ {
    alias /var/www/static;      # ❌ 错误：会查找 /var/www/staticcat.jpg
}

# 2. root 末尾不带斜杠（带了也能用，但不规范）
location /static/ {
    root /var/www;              # ✅ 规范
}

# 3. 用正则 location 时只能用 alias（因为路径不固定）
location ~ ^/static/(.*)\$ {
    alias /var/www/static/\$1;   # \$1 捕获正则第一组
}

# 4. 经验法则：
#    - 目录结构跟 URL 一致 → 用 root（更自然）
#    - 目录结构跟 URL 不一致 → 用 alias
\`\`\`

---

## 五、index 指令

\`\`\`nginx
server {
    listen 80;
    root /var/www;

    # 当请求的是目录时，按顺序查找这些文件作为首页
    index index.html index.htm index.php;

    # 请求 / 会依次找：
    # /var/www/index.html → 没有则 /var/www/index.htm → 还没有则 /var/www/index.php
    # 都找不到返回 403 Forbidden（默认）或 404
}

# index 可以在不同层级设
http {
    index index.html;       # 全局默认
    server {
        index index.php index.html;  # 本 server 覆盖
        location /docs {
            index manual.html;       # 本 location 覆盖
        }
    }
}
\`\`\`

---

## 六、try_files：文件查找顺序

try_files 是 location 里极常用的指令，定义"按什么顺序找文件，都找不到怎么办"。

\`\`\`nginx
# 经典 SPA 配置（React/Vue 单页应用）
location / {
    root /var/www/frontend;
    index index.html;
    try_files \$uri \$uri/ /index.html;
    # 依次尝试：
    #   \$uri        —— 精确文件，如 /about 找 about 文件
    #   \$uri/       —— 目录，找目录下的 index
    #   /index.html —— 都找不到就返回 index.html（交给前端路由处理）
}

# 纯静态站点，找不到就 404
location / {
    root /var/www;
    try_files \$uri \$uri/ =404;
    # =404 表示直接返回 404
}

# 找不到返回指定状态码
location / {
    try_files \$uri \$uri/ =403;
}

# 找不到重定向到首页
location / {
    try_files \$uri \$uri/ /index.html;
}
\`\`\`

try_files 的变量：

\`\`\`text
\$uri          当前请求的 URI（不含参数 ?xx=yy）
\$args         请求参数（? 后面的部分）
\$query_string 同 \$args
\$uri/         URI 作为目录
\`\`\`

---

## 七、error_page：自定义错误页

默认 Nginx 的错误页是简陋的纯文本，自定义错误页能提升用户体验。

### 7.1 基本用法

\`\`\`nginx
server {
    # 404 用 /404.html
    error_page 404 /404.html;

    # 多个状态码共用一个页面
    error_page 500 502 503 504 /50x.html;

    # 错误页文件位置
    location = /404.html {
        root /var/www/errors;
        internal;       # internal：只能内部跳转，外部直接访问 /404.html 会 404
    }

    location = /50x.html {
        root /var/www/errors;
        internal;
    }
}
\`\`\`

### 7.2 改变状态码

\`\`\`nginx
# 把 404 改成 200 返回（用首页代替，但状态码是 200）
error_page 404 =200 /index.html;

# 把 404 改成 404 但用指定页面
error_page 404 = /404.html;

# 把 500 改成 503（维护中）
error_page 500 502 503 504 =503 /maintenance.html;
\`\`\`

### 7.3 用外部 URL 重定向

\`\`\`nginx
# 404 重定向到外部地址
error_page 404 https://example.com/not-found;
\`\`\`

### 7.4 全局错误页（放 http 块）

\`\`\`nginx
http {
    # 所有站点共用错误页
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/errors;
        internal;
    }
}
\`\`\`

---

## 八、access_log / error_log 日志

### 8.1 日志基本配置

\`\`\`nginx
http {
    # 定义日志格式（main 是格式名）
    log_format main '\$remote_addr - \$remote_user [\$time_local] '
                    '"\$request" \$status \$body_bytes_sent '
                    '"\$http_referer" "\$http_user_agent" '
                    '\$request_time \$upstream_response_time';
    # \$remote_addr           客户端 IP
    # \$remote_user           认证用户（一般空）
    # \$time_local            本地时间
    # \$request               完整请求行 "GET /api HTTP/1.1"
    # \$status                状态码 200/404/500
    # \$body_bytes_sent       响应体字节数（不含头）
    # \$http_referer          来源页
    # \$http_user_agent       客户端 UA
    # \$request_time          总请求耗时（秒）
    # \$upstream_response_time 后端响应耗时（反代时用）

    # 应用格式
    access_log /var/log/nginx/access.log main;
    #               日志路径              格式名

    error_log /var/log/nginx/error.log warn;
    #             日志路径               日志级别
    # 日志级别：debug < info < notice < warn < error < crit < alert < emerg
}
\`\`\`

### 8.2 按站点独立日志

\`\`\`nginx
server {
    server_name api.example.com;
    access_log /var/log/nginx/api_access.log main;
    error_log /var/log/nginx/api_error.log;
}

server {
    server_name www.example.com;
    access_log /var/log/nginx/www_access.log main;
    error_log /var/log/nginx/www_error.log;
}
\`\`\`

### 8.3 关闭日志

\`\`\`nginx
# 关闭某 location 的访问日志（如健康检查，避免刷屏）
location /health {
    access_log off;          # 不记录访问日志
    return 200 "ok";
}

# 全局关闭访问日志（不推荐，调试困难）
access_log off;
\`\`\`

### 8.4 日志格式常用变量

\`\`\`text
┌──────────────────────────────┬──────────────────────────────┐
│  变量                        │  含义                        │
├──────────────────────────────┼──────────────────────────────┤
│  \$remote_addr               │  客户端 IP                   │
│  \$http_x_forwarded_for      │  XFF 头（反代链路）          │
│  \$time_local                │  本地时间 [10/Jan/2024:...] │
│  \$request                   │  请求行                      │
│  \$request_method            │  GET/POST/...               │
│  \$request_uri               │  完整 URI 含参数             │
│  \$uri                       │  不含参数的 URI              │
│  \$status                    │  状态码                      │
│  \$body_bytes_sent           │  响应体字节数                │
│  \$bytes_sent                │  总发送字节数（含头）        │
│  \$http_referer              │  来源页                      │
│  \$http_user_agent           │  UA                          │
│  \$http_host                 │  Host 头                     │
│  \$request_time              │  总请求耗时                  │
│  \$upstream_response_time    │  后端响应耗时                │
│  \$upstream_addr             │  后端地址                    │
│  \$upstream_status           │  后端状态码                  │
└──────────────────────────────┴──────────────────────────────┘
\`\`\`

### 8.5 日志缓冲（性能优化）

高并发时，每条日志都立即写磁盘会拖慢 Nginx，用缓冲提升性能：

\`\`\`nginx
access_log /var/log/nginx/access.log main buffer=64k flush=5s;
# buffer=64k    日志攒到 64KB 再写磁盘
# flush=5s      每 5 秒强制写一次（即使没满）
# gzip          还可以压缩日志（需模块支持）
\`\`\`

---

## 九、完整配置示例（逐行注释）

把前面学的串起来，给出一个生产级静态站点配置：

\`\`\`nginx
# /etc/nginx/conf.d/example.com.conf

# ===== 虚拟主机：HTTP 80 端口 =====
server {
    listen 80;                                    # 监听 IPv4 80 端口
    listen [::]:80;                               # 监听 IPv6 80 端口
    server_name example.com www.example.com;      # 绑定域名

    # 重定向到 HTTPS（强制加密）
    return 301 https://\$host\$request_uri;
    # \$host              请求的域名
    # \$request_uri       完整请求 URI（含参数）
    # 301 永久重定向，浏览器会缓存
}

# ===== 虚拟主机：HTTPS 443 端口 =====
server {
    listen 443 ssl http2;                         # 监听 443，启用 SSL 和 HTTP/2
    listen [::]:443 ssl http2;                    # IPv6
    server_name example.com www.example.com;      # 域名

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;   # 证书链
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # 私钥

    # 网站根目录和默认首页
    root /var/www/example;
    index index.html;

    # ----- 日志 -----
    access_log /var/log/nginx/example_access.log main;
    error_log /var/log/nginx/example_error.log warn;

    # ----- 主 location -----
    location / {
        try_files \$uri \$uri/ /index.html;       # SPA 路由兜底
    }

    # ----- 静态资源缓存 -----
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;                              # 30 天缓存
        add_header Cache-Control "public, immutable";
        # immutable：告诉浏览器这些文件永不变化，可直接用缓存
        access_log off;                           # 静态资源不记日志
    }

    # ----- API 反向代理 -----
    location /api/ {
        proxy_pass http://127.0.0.1:8000;         # 转发到后端 FastAPI
        proxy_set_header Host \$host;             # 透传 Host
        proxy_set_header X-Real-IP \$remote_addr; # 透传真实 IP
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;  # 透传协议 http/https
    }

    # ----- 安全：禁止访问隐藏文件 -----
    location ~ /\\. {
        deny all;                                 # 拒绝 .git、.env 等
        access_log off;
        log_not_found off;
    }

    # ----- 安全：禁止访问备份/源码文件 -----
    location ~* \\.(bak|config|sql|fla|md|ini|log|sh|inc|swp|dist)\$ {
        deny all;
    }

    # ----- 错误页 -----
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/example/errors;
        internal;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/example/errors;
        internal;
    }

    # ----- gzip 压缩 -----
    gzip on;
    gzip_min_length 1000;                         # 小于 1KB 不压缩
    gzip_types text/plain text/css application/json
               application/javascript text/xml application/xml;
    gzip_vary on;                                 # 加 Vary: Accept-Encoding 头
}
\`\`\`

### 9.1 配置拆分管理（推荐）

实际项目配置会很长，建议拆分成片段（snippet）：

\`\`\`text
/etc/nginx/snippets/
├── ssl-example.conf       ← SSL 证书配置片段
├── proxy-params.conf      ← 反向代理通用头
├── gzip.conf              ← gzip 配置
└── security-headers.conf  ← 安全响应头
\`\`\`

\`\`\`nginx
# /etc/nginx/snippets/ssl-example.conf
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;

# /etc/nginx/snippets/proxy-params.conf
proxy_set_header Host \$host;
proxy_set_header X-Real-IP \$remote_addr;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto \$scheme;
proxy_connect_timeout 60s;
proxy_read_timeout 60s;
\`\`\`

然后在主配置里 include：

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    include snippets/ssl-example.conf;     # 引入 SSL 配置

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        include snippets/proxy-params.conf; # 引入代理头
    }
}
\`\`\`

这样配置复用性高、易维护。

---

## 十、配置调试技巧

### 10.1 nginx -T：查看完整生效配置

\`\`\`bash
# nginx -T 会把所有 include 进来的文件展开打印
sudo nginx -T | less
# 排查"我明明写了这个配置怎么没生效"时很有用

# 只看某个站点的生效配置
sudo nginx -T 2>&1 | grep -A 50 "server_name example.com"
\`\`\`

### 10.2 查看指定变量值

\`\`\`nginx
# 用 add_header 把变量值返回，调试用
location /debug {
    add_header X-Debug-URI \$uri;
    add_header X-Debug-Host \$host;
    add_header X-Debug-Remote \$remote_addr;
    return 200 "debug info in headers";
}

# curl -I http://example.com/debug 看响应头
\`\`\`

### 10.3 return 指令快速验证

\`\`\`nginx
# 用 return 快速测试 location 是否命中
location /test {
    return 200 "hit location /test";
}
# curl http://example.com/test 验证
\`\`\`

---

## 十一、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  配置核心要点                                                 │
├──────────────────────────────────────────────────────────────┤
│  层级：http → server → location，子级覆盖父级                │
│  server：listen + server_name 区分虚拟主机                   │
│  location 优先级：= > ^~ > ~/~* > 普通前缀                   │
│  root vs alias：root 拼接路径，alias 替换路径                │
│  try_files：按顺序找文件，找不到兜底                          │
│  error_page：自定义错误页，internal 防直接访问                │
│  日志：log_format 定义格式，access_log/error_log 控制输出    │
│  snippet：用 include 拆分复用配置                            │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# 配置三件套：
sudo nginx -t                 # 1. 测试语法
sudo systemctl reload nginx   # 2. 重载配置
sudo tail -f /var/log/nginx/error.log  # 3. 看错误日志
\`\`\`

下一章我们进入 Nginx 最核心的用法——反向代理与负载均衡，把后端应用交给 Nginx 转发。
`
  },

  {
    id: "deploy-nginx-reverse-proxy",
    icon: "🔄",
    title: "反向代理与负载均衡",
    group: "Nginx 反向代理",
    content: `# 反向代理与负载均衡

反向代理是 Nginx 在现代 Web 架构中最重要的角色。Python 应用（FastAPI、Django、Flask）通常跑在 Gunicorn/Uvicorn 这样的应用服务器上，监听一个本地端口。而 Nginx 站在前方，接收用户请求再转发给后端——这就是反向代理。这一章把反向代理的概念、proxy_pass、负载均衡、健康检查全部讲透。

## 一、反向代理是什么

### 1.1 正向代理 vs 反向代理

这两个概念名字相似但方向相反，新手极易混淆。

\`\`\`text
===== 正向代理（Forward Proxy）=====
  客户端 → 代理服务器 → 目标服务器

  场景：翻墙软件、公司翻墙、爬虫 IP 池
  特点：代理"代表客户端"去访问服务器
        服务器不知道真正的客户端是谁
        客户端知道目标服务器是谁

  例：你用 VPN 访问 Google，VPN 是正向代理
      Google 看到的请求来自 VPN 的 IP，不知道你是谁

===== 反向代理（Reverse Proxy）=====
  客户端 → 反向代理 → 后端服务器群

  场景：Nginx 在 Python 应用前、CDN、负载均衡器
  特点：代理"代表服务器"接收客户端请求
        客户端不知道真正的后端服务器是谁
        客户端以为反向代理就是目标服务器

  例：你访问 example.com，实际请求被 Nginx 转给后端 FastAPI
      你只知道 example.com，不知道后端跑在 8000 端口
\`\`\`

### 1.2 一句话区分

\`\`\`text
正向代理代理的是"客户端"，帮客户端出去访问
反向代理代理的是"服务器"，帮服务器接收请求

记忆口诀：
  正向代理 → 你（客户端）的代理人，帮你出门办事
  反向代理 → 商家（服务器）的代理人，帮你接待客户
\`\`\`

### 1.3 为什么 Python 应用需要反向代理

\`\`\`text
没有反向代理：
  用户 ──→ Gunicorn/Uvicorn（8000）──→ Django/FastAPI

  问题：
  1. Gunicorn 不擅长处理静态文件（慢）
  2. Gunicorn 不能 HTTPS
  3. Gunicorn 单点，没有负载均衡
  4. Gunicorn 直接暴露，安全风险（能访问调试接口）
  5. 没有缓存、压缩、限流

有反向代理：
  用户 ──HTTPS──→ Nginx(443) ──HTTP──→ Gunicorn(8000) ──→ Django

  好处：
  1. Nginx 处理静态文件（极快）
  2. Nginx 处理 HTTPS，后端用明文（性能好）
  3. Nginx 负载均衡到多个 Gunicorn 实例
  4. Nginx 限流、缓存、压缩
  5. 后端只监听 127.0.0.1，不对外暴露
\`\`\`

### 1.4 反向代理的典型架构

\`\`\`text
                    ┌─────────────────────────────────┐
                    │            Nginx (443)           │
用户 ──HTTPS──→    │  SSL终结 / gzip / 缓存 / 限流     │
                    └──────────────┬──────────────────┘
                                   │ HTTP 反向代理
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
            Gunicorn:8000    Gunicorn:8001    Gunicorn:8002
            (Django)         (Django)         (Django)

  Nginx 把请求分发到多个后端实例，实现负载均衡和高可用
\`\`\`

---

## 二、proxy_pass 详解

proxy_pass 是反向代理的核心指令，把请求转发给后端。

### 2.1 基本用法

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    # 把 /api/ 下的请求转发到本机 8000 端口
}

# 后端 FastAPI 监听 8000 端口
# 请求 https://example.com/api/users
# Nginx 转发到 http://127.0.0.1:8000/api/users
\`\`\`

### 2.2 proxy_pass 是否带 URI 的区别（重点）

\`\`\`nginx
# 写法 A：proxy_pass 不带 URI（不带路径，只到端口/IP）
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    # 请求 /api/users → 转发 /api/users（完整路径透传）
}

# 写法 B：proxy_pass 带 URI（带路径）
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    # 请求 /api/users → 转发 /users
    # /api/ 被替换成 /
}

# 写法 C：proxy_pass 带不同前缀
location /api/ {
    proxy_pass http://127.0.0.1:8000/backend/;
    # 请求 /api/users → 转发 /backend/users
}

# 写法 D：正则 location 时不能带 URI
location ~ ^/api/(.*)\$ {
    proxy_pass http://127.0.0.1:8000/\$1;
    # 请求 /api/users → 转发 /users
    # \$1 捕获正则第一组
}
\`\`\`

\`\`\`text
记忆口诀：
  proxy_pass 不带路径 → 完整路径透传（最常用）
  proxy_pass 带路径   → location 匹配部分被替换
  proxy_pass 带斜杠 / → 去掉 location 匹配部分
\`\`\`

### 2.3 proxy_pass 到 upstream

\`\`\`nginx
location /api/ {
    proxy_pass http://mybackend;
    # mybackend 是 upstream 定义的负载均衡组（见下文）
}
\`\`\`

### 2.4 proxy_pass 超时设置

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;

    proxy_connect_timeout 5s;     # 连接后端超时（默认 60s）
    # 建立与后端 TCP 连接的超时时间

    proxy_send_timeout 60s;       # 发送请求给后端的超时
    # 两次写操作之间的间隔超时

    proxy_read_timeout 60s;       # 读取后端响应的超时
    # 两次读操作之间的间隔超时
    # 长连接/大文件下载要调大

    # 慢接口（如生成报表）单独调大
    proxy_read_timeout 300s;
}
\`\`\`

### 2.5 proxy_pass 缓冲设置

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;

    proxy_buffering on;           # 启用缓冲（默认开）
    # on：Nginx 把后端响应完整接收后再发给客户端
    #     客户端慢不影响后端释放连接
    # off：边收边发（流式），适合 SSE/流式响应

    proxy_buffer_size 4k;         # 响应第一部分（头）的缓冲区大小
    proxy_buffers 8 4k;           # 响应体的缓冲区：8 个 4k 块
    proxy_busy_buffers_size 8k;   # 忙碌缓冲区大小

    # 大响应调大缓冲
    proxy_buffers 16 16k;
    proxy_busy_buffers_size 64k;
}
\`\`\`

---

## 三、proxy_set_header：透传请求头

反向代理时，后端默认拿到的 IP 是 Nginx 的 IP（127.0.0.1），而不是用户的真实 IP。需要通过请求头把真实信息透传给后端。

### 3.1 三个必设的头

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;

    # 1. 透传 Host 头（后端能知道用户访问的域名）
    proxy_set_header Host \$host;

    # 2. 透传真实客户端 IP
    proxy_set_header X-Real-IP \$remote_addr;

    # 3. 透传代理链路（关键！）
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    # \$proxy_add_x_forwarded_for = 已有的 XFF + 客户端 IP
    # 形成 IP 链：客户端IP, 代理1IP, 代理2IP...
}
\`\`\`

### 3.2 透传协议（HTTP/HTTPS）

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;

    # 告诉后端用户用的是 http 还是 https
    proxy_set_header X-Forwarded-Proto \$scheme;
    # 后端据此生成正确的重定向 URL（http:// vs https://）
}
\`\`\`

### 3.3 后端如何读取这些头

以 Django 为例：

\`\`\`python
# Django settings.py
# 必须把 Nginx 加入信任代理，才会解析 X-Forwarded-For
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# 用中间件记录真实 IP
# Django 会自动从 X-Forwarded-For 取第一个 IP 作为 request.META['REMOTE_ADDR']
# （需配合 django-ipware 等库或自写中间件）
\`\`\`

以 FastAPI 为例：

\`\`\`python
from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/ip")
async def get_ip(request: Request):
    # 从 X-Forwarded-For 取真实 IP
    xff = request.headers.get("x-forwarded-for", "")
    real_ip = xff.split(",")[0].strip() if xff else request.client.host
    return {"real_ip": real_ip, "host": request.headers.get("host")}
\`\`\`

### 3.4 完整的 proxy 头配置（推荐 snippet）

\`\`\`nginx
# /etc/nginx/snippets/proxy_params.conf
proxy_set_header Host \$host;
proxy_set_header X-Real-IP \$remote_addr;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto \$scheme;
proxy_set_header X-Forwarded-Host \$host;

# HTTP/1.1 + keep-alive（默认是 HTTP/1.0 无 keep-alive，性能差）
proxy_http_version 1.1;
proxy_set_header Connection "";

# 超时
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# 缓冲
proxy_buffering on;
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
\`\`\`

之后每个反代 location 只 include 这个 snippet：

\`\`\`nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    include /etc/nginx/snippets/proxy_params.conf;
}
\`\`\`

---

## 四、upstream 负载均衡

upstream 块定义一组后端服务器，proxy_pass 引用这个组名，Nginx 就会按算法分发请求。

### 4.1 基本结构

\`\`\`nginx
# upstream 必须放在 http 块里，server 块外
http {
    upstream mybackend {
        server 127.0.0.1:8000;     # 后端实例 1
        server 127.0.0.1:8001;     # 后端实例 2
        server 127.0.0.1:8002;     # 后端实例 3
    }

    server {
        listen 80;
        location /api/ {
            proxy_pass http://mybackend;
            # 引用 upstream 组名
        }
    }
}
\`\`\`

### 4.2 负载均衡算法

Nginx 提供四种负载均衡算法：

\`\`\`text
┌──────────────┬──────────────────────────────────────┐
│  算法        │  说明                                │
├──────────────┼──────────────────────────────────────┤
│  轮询(默认)  │  按顺序轮流分发                       │
│  weight      │  加权轮询，权重高的分到更多请求       │
│  ip_hash     │  按 IP 哈希，同一 IP 固定到同一后端   │
│  least_conn  │  最少连接数优先                       │
│  hash key    │  通用哈希，按指定 key 哈希            │
└──────────────┴──────────────────────────────────────┘
\`\`\`

### 4.3 轮询（默认）

\`\`\`nginx
upstream mybackend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
# 请求1 → 8000，请求2 → 8001，请求3 → 8002，请求4 → 8000...
\`\`\`

### 4.4 加权轮询

\`\`\`nginx
upstream mybackend {
    server 127.0.0.1:8000 weight=3;   # 权重 3，分到 3/6 的请求
    server 127.0.0.1:8001 weight=2;   # 权重 2，分到 2/6
    server 127.0.0.1:8002 weight=1;   # 权重 1，分到 1/6
}
# 适用：服务器配置不同，强机器多分点
\`\`\`

### 4.5 ip_hash：会话保持

\`\`\`nginx
upstream mybackend {
    ip_hash;                          # 启用 IP 哈希
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
# 同一客户端 IP 的请求始终发到同一后端（除非该后端挂了）
# 适用：后端有本地 session/缓存，需要"粘性会话"
# 缺点：IP 切换（如手机切 WiFi/4G）会丢会话
\`\`\`

### 4.6 least_conn：最少连接

\`\`\`nginx
upstream mybackend {
    least_conn;                       # 启用最少连接算法
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
# 把请求发给当前连接数最少的后端
# 适用：请求处理时长差异大（有的快有的慢）
\`\`\`

### 4.7 hash：通用哈希

\`\`\`nginx
upstream mybackend {
    hash \$request_uri consistent;    # 按 URI 哈希，consistent 一致性哈希
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
# 按 \$request_uri 哈希，相同 URI 总是同一后端（适合缓存命中率）
# consistent：一致性哈希，加减节点时影响小
\`\`\`

---

## 五、健康检查

### 5.1 被动健康检查（内置）

Nginx 默认用被动健康检查：请求失败就标记后端不可用，过一段时间再试。

\`\`\`nginx
upstream mybackend {
    server 127.0.0.1:8000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    # max_fails=3       30秒内失败 3 次就标记为不可用
    # fail_timeout=30s  标记不可用后 30 秒内不再分发，30 秒后再试

    # 还有 backup（备用）和 down（永久下线）
    server 127.0.0.1:8002 backup;    # 备用，所有主节点挂了才启用
    server 127.0.0.1:8003 down;      # 永久下线（维护中）
}
\`\`\`

### 5.2 主动健康检查（Nginx Plus / 第三方模块）

开源版 Nginx 不支持主动健康检查（定期探测后端是否健康）。Nginx Plus（商业版）有 health_check 指令。开源版可用第三方模块 nginx_upstream_check_module。

\`\`\`nginx
# Nginx Plus 才支持
upstream mybackend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;

    health_check interval=10s;       # 每 10 秒探测一次
    # 默认探测 / ，期望 2xx/3xx 算健康
}

# 开源版替代：写一个 /health location 让后端暴露健康状态
location /health {
    proxy_pass http://mybackend/health;
    # 后端实现 /health 返回 200
}
\`\`\`

### 5.3 后端健康检查接口示例

\`\`\`python
# FastAPI 健康检查
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}
# 返回 200 表示健康，500 表示不健康

# 配合 Docker/K8s 的健康检查
\`\`\`

---

## 六、实战：Nginx 反代 FastAPI

### 6.1 启动 FastAPI 后端

\`\`\`bash
# 用 Uvicorn 启动 FastAPI，监听 8000
uvicorn main:app --host 127.0.0.1 --port 8000

# 多 worker
uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4

# 用 gunicorn + uvicorn worker
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
\`\`\`

### 6.2 Nginx 配置

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;

    # 反代到 FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket 支持（FastAPI 的 WebSocket 需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        # 这些头是 WebSocket 握手必需的

        # 长连接超时调大（WebSocket 保活）
        proxy_read_timeout 86400s;
    }
}
\`\`\`

---

## 七、实战：Nginx 反代 Django

### 7.1 启动 Django 后端

\`\`\`bash
# 用 Gunicorn 启动 Django
gunicorn myproject.wsgi:application -w 4 -b 127.0.0.1:8000

# 推荐 Unix socket（比 TCP 快）
gunicorn myproject.wsgi:application -w 4 -b unix:/tmp/gunicorn.sock
\`\`\`

### 7.2 Nginx 配置（静态文件 + 动态反代）

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    client_max_body_size 10M;       # 上传文件大小限制（Django 上传需要）

    # 静态文件（Django collectstatic 收集的）
    location /static/ {
        alias /var/www/myproject/static/;    # Django STATIC_ROOT
        expires 30d;
        access_log off;
    }

    # 媒体文件（用户上传的）
    location /media/ {
        alias /var/www/myproject/media/;     # Django MEDIA_ROOT
        expires 30d;
        access_log off;
    }

    # 动态请求反代
    location / {
        proxy_pass http://127.0.0.1:8000;    # 或 unix:/tmp/gunicorn.sock
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
\`\`\`

Django 端要配置 STATIC_ROOT 并 collectstatic：

\`\`\`bash
# settings.py
STATIC_ROOT = '/var/www/myproject/static/'
MEDIA_ROOT = '/var/www/myproject/media/'

# 收集静态文件
python manage.py collectstatic
\`\`\`

---

## 八、实战：Nginx 反代 Flask

### 8.1 启动 Flask 后端

\`\`\`bash
# 用 Gunicorn 启动 Flask
# app.py 里的 app 对象
gunicorn app:app -w 4 -b 127.0.0.1:8000

# 用 gevent worker（IO 密集型）
gunicorn app:app -w 4 -k gevent --worker-connections 1000 -b 127.0.0.1:8000
\`\`\`

### 8.2 Nginx 配置

\`\`\`nginx
server {
    listen 80;
    server_name flask.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }

    # Flask 静态文件直接 Nginx 提供
    location /static/ {
        alias /var/www/flaskapp/static/;
        expires 7d;
    }
}
\`\`\`

---

## 九、负载均衡完整实战

### 9.1 多实例部署架构

\`\`\`text
启动 3 个 Gunicorn 实例：
  gunicorn app:app -w 4 -b 127.0.0.1:8000
  gunicorn app:app -w 4 -b 127.0.0.1:8001
  gunicorn app:app -w 4 -b 127.0.0.1:8002

Nginx 负载均衡分发到这三个实例
\`\`\`

### 9.2 Nginx 配置

\`\`\`nginx
http {
    # 负载均衡组
    upstream myapp {
        # least_conn;                  # 最少连接算法
        # ip_hash;                     # IP 哈希（如需会话保持去掉注释）

        server 127.0.0.1:8000 weight=3 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:8001 weight=2 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:8002 weight=1 max_fails=3 fail_timeout=30s;

        # keepalive 到后端（复用连接，提升性能）
        keepalive 32;
        # 维护 32 个空闲长连接池
    }

    server {
        listen 80;
        server_name app.example.com;

        location / {
            proxy_pass http://myapp;

            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            # 长连接到后端（配合 upstream keepalive）
            proxy_http_version 1.1;
            proxy_set_header Connection "";

            # 超时
            proxy_connect_timeout 5s;
            proxy_read_timeout 60s;
        }

        # 健康检查端点（不经过负载均衡，直连本机后端）
        location /health {
            proxy_pass http://127.0.0.1:8000/health;
        }
    }
}
\`\`\`

### 9.3 启动多实例的脚本

\`\`\`bash
#!/bin/bash
# start_workers.sh - 启动 3 个 Gunicorn 实例

for port in 8000 8001 8002; do
    gunicorn app:app -w 4 -b 127.0.0.1:\$port --daemon --pid /tmp/gunicorn_\$port.pid
    echo "Started gunicorn on port \$port"
done

# 停止
# for port in 8000 8001 8002; do kill \$(cat /tmp/gunicorn_\$port.pid); done
\`\`\`

---

## 十、常见问题排查

### 10.1 502 Bad Gateway

\`\`\`bash
# 502 表示 Nginx 连不上后端
# 排查步骤：

# 1. 后端是否启动
sudo systemctl status gunicorn
# 或
ps aux | grep gunicorn

# 2. 后端端口是否监听
ss -tlnp | grep 8000
# 应显示 LISTEN 127.0.0.1:8000

# 3. 测试本地能否访问后端
curl http://127.0.0.1:8000/
# 能访问说明后端正常，问题在 Nginx 配置

# 4. 看 Nginx 错误日志
sudo tail /var/log/nginx/error.log
# 常见错误：
# connect() failed (111: Connection refused)  → 后端没启动
# upstream timed out                          → 后端响应太慢
\`\`\`

### 10.2 504 Gateway Timeout

\`\`\`nginx
# 504 表示后端响应超时
# 调大超时时间
location /api/slow {
    proxy_pass http://127.0.0.1:8000;
    proxy_read_timeout 300s;     # 5 分钟
    proxy_send_timeout 300s;
}
\`\`\`

### 10.3 后端拿到的 IP 是 127.0.0.1

\`\`\`nginx
# 没透传 X-Forwarded-For 头
# 加上：
proxy_set_header X-Real-IP \$remote_addr;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
\`\`\`

### 10.4 WebSocket 连不上

\`\`\`nginx
# WebSocket 需要 Upgrade 头
location /ws {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400s;   # 长连接保活
}
\`\`\`

---

## 十一、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  反向代理与负载均衡要点                                        │
├──────────────────────────────────────────────────────────────┤
│  反向代理：Nginx 代表后端接收请求，隐藏后端                   │
│  proxy_pass：转发请求，注意带/不带 URI 的区别                 │
│  proxy_set_header：透传 Host/X-Real-IP/X-Forwarded-For       │
│  upstream：定义后端组，proxy_pass 引用                        │
│  算法：轮询(默认)/weight/ip_hash/least_conn/hash             │
│  健康检查：max_fails + fail_timeout 被动剔除                 │
│  WebSocket：Upgrade + Connection 头                          │
│  502：后端没起；504：后端超时                                 │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`nginx
# 反向代理最小配置模板
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_http_version 1.1;
}
\`\`\`

下一章我们给站点加上 HTTPS、HTTP/2、gzip、缓存、安全头，让它达到生产级品质。
`
  },

  {
    id: "deploy-nginx-ssl",
    icon: "🔒",
    title: "HTTPS 与性能优化",
    group: "Nginx 反向代理",
    content: `# HTTPS 与性能优化

HTTP 是明文传输，密码、token、个人信息全裸奔在网络上。HTTPS 已是现代网站的标配——Google 把 HTTPS 作为搜索排名因素，浏览器对 HTTP 站点标"不安全"。这一章我们用 Let's Encrypt 免费证书给站点上 HTTPS，并做 gzip 压缩、缓存、HTTP/2、限流、安全头等一系列性能与安全优化。

## 一、SSL 证书：Let's Encrypt + certbot

### 1.1 什么是 Let's Encrypt

Let's Encrypt 是一个免费的证书颁发机构（CA），提供标准的 DV（Domain Validation）SSL 证书，全球已有数亿网站使用。证书有效期 90 天，到期前需续期，自动化工具 certbot 能自动续期。

\`\`\`text
证书类型：
  DV (Domain Validation)    验证域名所有权，免费，Let's Encrypt 提供的就是这种
  OV (Organization Validation) 验证组织身份，收费，浏览器显示公司名
  EV (Extended Validation)   严格验证，收费，浏览器显示绿色公司名（现在已被淡化）

对于绝大多数网站，Let's Encrypt 的 DV 证书完全够用。
\`\`\`

### 1.2 安装 certbot

\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
# certbot：证书申请工具
# python3-certbot-nginx：Nginx 自动配置插件

# macOS
brew install certbot

# 验证
certbot --version
# certbot 2.8.0
\`\`\`

### 1.3 申请证书（自动配置 Nginx）

\`\`\`bash
# 前提：域名已解析到本机 IP，且 80 端口可访问
# certbot 会自动：验证域名所有权 → 申请证书 → 修改 Nginx 配置 → 重载

sudo certbot --nginx -d example.com -d www.example.com
# --nginx        使用 Nginx 插件自动改配置
# -d             指定域名（可多个）

# 交互过程：
# 1. 输入邮箱（用于证书过期提醒）
# 2. 同意服务条款（A）
# 3. 是否分享邮箱给 EFF（N）
# 4. 选择要启用 HTTPS 的域名
# 5. 是否自动重定向 HTTP 到 HTTPS（选 2，自动重定向）

# 完成后证书位置：
# /etc/letsencrypt/live/example.com/fullchain.pem   证书链
# /etc/letsencrypt/live/example.com/privkey.pem     私钥
\`\`\`

### 1.4 手动配置 SSL（已有证书）

如果证书是别处买的，手动配置：

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    # fullchain.pem 包含证书 + 中间证书，浏览器需要完整链
    # privkey.pem 是私钥，必须保密，权限设 600

    # SSL 协议与加密套件
    ssl_protocols TLSv1.2 TLSv1.3;          # 只启用 1.2 和 1.3（旧版有漏洞）
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;          # 让客户端选加密套件（1.3 推荐）

    # 会话缓存（减少握手开销）
    ssl_session_cache shared:SSL:10m;       # 10MB 缓存，约 4 万个会话
    ssl_session_timeout 10m;                # 缓存 10 分钟
    ssl_session_tickets off;                # 关闭 session ticket（更安全）
}
\`\`\`

### 1.5 自动续期

\`\`\`bash
# Let's Encrypt 证书 90 天过期，需续期
# certbot 安装时已自动创建定时任务

# 查看定时任务
sudo systemctl list-timers | grep certbot
# 应显示 certbot.timer

# 手动测试续期（不真的续，只模拟）
sudo certbot renew --dry-run
# --dry-run 模拟续期，不消耗配额
# 显示 Congratulations 说明自动续期配置正确

# 真正续期
sudo certbot renew
# 只有过期前 30 天内才会真的续

# 续期后重载 Nginx（certbot 默认会做，也可手动配 hook）
sudo certbot renew --deploy-hook "systemctl reload nginx"
\`\`\`

### 1.6 推荐用 SSL 配置生成器

Mozilla 提供了 SSL 配置生成器：https://ssl-config.mozilla.org/ ，输入 Nginx 版本就能生成最优配置。

---

## 二、HTTP 跳转 HTTPS

强制所有 HTTP 请求跳转到 HTTPS。

### 2.1 简单跳转

\`\`\`nginx
# HTTP server：全部重定向到 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://\$host\$request_uri;
    # 301 永久重定向
    # \$host           请求的域名
    # \$request_uri    完整请求 URI（含参数）
}
\`\`\`

### 2.2 HSTS：强制浏览器只走 HTTPS

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # HSTS 头：告诉浏览器未来 1 年内只用 HTTPS 访问
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    # max-age=31536000        1 年（秒）
    # includeSubDomains       子域名也强制 HTTPS
    # preload                 允许加入浏览器 HSTS 预加载列表
    # always                  即使错误页也带这个头
}
\`\`\`

⚠️ HSTS 一旦下发浏览器会强制 HTTPS，如果证书过期会导致用户无法访问。建议先用短 max-age（如 300）测试，确认稳定后再加长。

---

## 三、HTTP/2 启用

HTTP/2 是 HTTP 协议的重大升级，支持多路复用、头部压缩、服务器推送，能显著提升页面加载速度。

### 3.1 启用方法

\`\`\`nginx
# HTTP/2 必须在 HTTPS server 上启用
server {
    listen 443 ssl http2;          # 在 listen 后加 http2
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
\`\`\`

### 3.2 验证 HTTP/2 是否生效

\`\`\`bash
# 用 curl 验证（需支持 HTTP/2）
curl -I --http2 https://example.com
# 输出：HTTP/2 200 （注意是 HTTP/2 不是 HTTP/1.1）

# 浏览器开发者工具 → Network → Protocol 列显示 h2
\`\`\`

### 3.3 HTTP/2 的优势

\`\`\`text
HTTP/1.1：
  - 一个 TCP 连接一次只能处理一个请求
  - 浏览器为加速会开 6 个连接，但每个连接仍串行
  - 头部不压缩，重复传输 Cookie 等

HTTP/2：
  - 多路复用：一个 TCP 连接并发处理多个请求/响应
  - 头部压缩：HPACK 算法压缩头部
  - 二进制分帧：比文本协议解析快
  - 服务器推送：可主动推送资源（已逐渐被 HTTP/3 取代）

实际效果：页面加载更快，连接开销更低
\`\`\`

---

## 四、gzip 压缩

gzip 能把文本响应压缩到原来的 1/3 ~ 1/5，大幅节省带宽、加速传输。

### 4.1 基本配置

\`\`\`nginx
http {
    gzip on;                                # 启用 gzip
    gzip_min_length 1000;                   # 小于 1KB 不压缩（压缩反而更大）
    gzip_comp_level 6;                      # 压缩级别 1-9，6 是性价比最高的
    gzip_types text/plain text/css
               text/xml application/xml
               application/json
               application/javascript
               application/x-javascript
               text/javascript
               image/svg+xml;
    # gzip_types 指定哪些 MIME 类型压缩
    # text/html 默认就压缩，不用列

    gzip_vary on;                           # 加 Vary: Accept-Encoding 头
    # 让代理/CDN 知道响应因 Accept-Encoding 而异

    gzip_proxied any;                       # 对所有代理请求都压缩
    # 默认只对非代理请求压缩

    gzip_disable "MSIE [1-6]\\.";           # IE6 不压缩（不支持）
}
\`\`\`

### 4.2 验证 gzip 生效

\`\`\`bash
# 请求时带 Accept-Encoding: gzip
curl -H "Accept-Encoding: gzip" -I https://example.com/style.css
# 响应头应有：
# Content-Encoding: gzip
# Vary: Accept-Encoding

# 对比压缩前后大小
curl -s https://example.com/style.css | wc -c           # 原始大小
curl -s -H "Accept-Encoding: gzip" https://example.com/style.css | wc -c  # 压缩后
\`\`\`

### 4.3 gzip_static：预压缩

\`\`\`nginx
# 提前用 gzip 压好 .gz 文件，Nginx 直接发，省去实时压缩 CPU
location / {
    gzip_static on;                          # 优先发 .gz 文件
    # 请求 /style.css 时，如果存在 /style.css.gz，直接发预压缩文件
}

# 构建预压缩文件
gzip -k -9 /var/www/style.css
# 生成 style.css.gz，-k 保留原文件，-9 最高压缩
\`\`\`

### 4.4 Brotli 压缩（更强）

Brotli 是 Google 推出的压缩算法，比 gzip 压缩率更高（文本再小 15-20%）。需要 ngx_brotli 模块。

\`\`\`nginx
# 需要 ngx_brotli 模块
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript;
\`\`\`

---

## 五、缓存配置

缓存是性能优化的核心——让浏览器/CDN 缓存静态资源，重复访问不再下载。

### 5.1 expires 指令

\`\`\`nginx
# 基本用法
location /static/ {
    expires 30d;                             # 缓存 30 天
    # expires 1h;   1 小时
    # expires 30m;  30 分钟
    # expires max;  永久缓存（10 年）
    # expires off;  不缓存（默认）
    # expires epoch;禁用缓存（设为 1970 年）
}

# expires 会自动加两个头：
# Cache-Control: max-age=2592000
# Expires: <30天后的时间>
\`\`\`

### 5.2 按文件类型分别缓存

\`\`\`nginx
# 静态资源长期缓存
location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)\$ {
    expires 1y;                              # 1 年
    add_header Cache-Control "public, immutable";
    # public      允许 CDN/代理缓存
    # immutable   永不变（配合文件名哈希，如 app.abc123.js）
}

# HTML 不缓存（确保用户看到最新页面）
location ~* \\.html\$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    # no-cache       每次都要问服务器有没有更新
    # no-store       完全不存
    # must-revalidate 过期必须重新验证
}

# API 响应不缓存
location /api/ {
    add_header Cache-Control "no-store";
    proxy_pass http://backend;
}
\`\`\`

### 5.3 immutable 与文件名哈希

\`\`\`text
现代前端构建（webpack/vite）会生成带哈希的文件名：
  app.abc123.js    内容变了 → abc123 变 → 文件名变 → 浏览器重新下载
  app.def456.js

配合 immutable：浏览器看到 immutable 就连"是否过期"都不问，直接用缓存。
重新下载只发生在文件名变化时。

配置：
  expires 1y;
  add_header Cache-Control "public, immutable";

效果：用户第二次访问页面，静态资源全部 304 或直接用缓存，极快。
\`\`\`

### 5.4 缓存验证：ETag 与 Last-Modified

\`\`\`nginx
# Nginx 默认开启缓存验证
location / {
    root /var/www;
    # etag on;                  # 默认开，发 ETag 头
    # if_modified_since exact;  # 默认 exact，发 Last-Modified 头
}

# 浏览器下次请求带 If-None-Match / If-Modified-Since
# 文件没变 Nginx 返回 304 Not Modified（空响应体）
# 文件变了返回 200 + 新内容
\`\`\`

---

## 六、静态资源优化

### 6.1 sendfile 零拷贝

\`\`\`nginx
http {
    sendfile on;                # 启用 sendfile 系统调用
    # 静态文件从磁盘直接到网卡，绕过用户态，极快
}
\`\`\`

### 6.2 tcp_nopush / tcp_nodelay

\`\`\`nginx
http {
    sendfile on;
    tcp_nopush on;              # 数据包攒够再发（配合 sendfile）
    tcp_nodelay on;             # 小数据立即发（不要攒）
    # 两者看似矛盾，实则配合：
    # tcp_nopush 用于响应头+体一起发
    # tcp_nodelay 用于 keep-alive 的后续小数据
}
\`\`\`

### 6.3 客户端上传限制

\`\`\`nginx
http {
    client_max_body_size 10m;           # 请求体最大 10MB（上传文件限制）
    client_body_buffer_size 128k;       # 请求体缓冲区，超过就写临时文件
    client_body_timeout 60s;            # 客户端发送请求体超时
}

# 单独给上传接口设大限制
location /upload {
    client_max_body_size 100m;          # 上传接口允许 100MB
    proxy_pass http://backend;
}
\`\`\`

### 6.4 open_file_cache 缓存文件描述符

\`\`\`nginx
http {
    open_file_cache max=1000 inactive=20s;
    # max=1000        缓存 1000 个文件的元数据
    # inactive=20s    20 秒未访问就清除

    open_file_cache_valid 30s;          # 每 30 秒验证一次缓存是否过期
    open_file_cache_min_uses 2;         # 至少访问 2 次才缓存
    open_file_cache_errors on;          # 缓存文件不存在等错误
}
\`\`\`

---

## 七、客户端连接限制

防止恶意刷接口、CC 攻击。

### 7.1 limit_conn：并发连接数限制

\`\`\`nginx
http {
    # 定义连接数区域
    limit_conn_zone \$binary_remote_addr zone=addr:10m;
    # \$binary_remote_addr  按 IP 限流（二进制形式省内存）
    # zone=addr             区域名 addr
    # :10m                  10MB 内存，约存 16 万个 IP

    server {
        location /api/ {
            limit_conn addr 10;         # 每个 IP 最多 10 个并发连接
            proxy_pass http://backend;
        }
    }
}
\`\`\`

### 7.2 limit_req：请求速率限制

\`\`\`nginx
http {
    # 定义速率区域
    limit_req_zone \$binary_remote_addr zone=req_limit:10m rate=10r/s;
    # rate=10r/s  平均每秒 10 个请求

    server {
        location /api/ {
            limit_req zone=req_limit burst=20 nodelay;
            # zone=req_limit   引用上面定义的区域
            # burst=20         允许突发 20 个请求排队
            # nodelay          突发请求不延迟，直接处理
            # 不加 nodelay：突发请求会排队延迟处理

            proxy_pass http://backend;
        }
    }
}
\`\`\`

### 7.3 限流响应自定义

\`\`\`nginx
http {
    limit_req_zone \$binary_remote_addr zone=req_limit:10m rate=10r/s;
    limit_req_status 429;               # 限流时返回 429（默认 503）

    server {
        location /api/ {
            limit_req zone=req_limit burst=20 nodelay;
            proxy_pass http://backend;
        }
    }
}
# 429 Too Many Requests 是更语义化的限流状态码
\`\`\`

### 7.4 限流配置演示

\`\`\`nginx
# 登录接口严格限流（防爆破）
location /api/login {
    limit_req zone=login_limit burst=5 nodelay;
    # 每 IP 每秒 5 次登录尝试
    proxy_pass http://backend;
}

# 普通接口宽松限流
location /api/ {
    limit_req zone=api_limit burst=50 nodelay;
    # 每 IP 每秒 50 次
    proxy_pass http://backend;
}
\`\`\`

---

## 八、安全头配置

安全响应头能防御 XSS、点击劫持、MIME 嗅探等常见 Web 攻击。

### 8.1 常用安全头

\`\`\`nginx
server {
    # 防点击劫持：禁止被 iframe 嵌套
    add_header X-Frame-Options "SAMEORIGIN" always;
    # DENY          完全禁止嵌套
    # SAMEORIGIN    只允许同源嵌套

    # 防 MIME 嗅探
    add_header X-Content-Type-Options "nosniff" always;
    # 强制按声明的 Content-Type 解析，不嗅探

    # XSS 过滤（现代浏览器已废弃，但建议保留兼容）
    add_header X-XSS-Protection "1; mode=block" always;

    # Referrer 策略
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # 跨源请求只发源，不发完整 URL

    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 权限策略（替代旧的 Feature-Policy）
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    # 禁用地理位置、麦克风、摄像头权限
}
\`\`\`

### 8.2 Content-Security-Policy（CSP）

CSP 是防御 XSS 最强的头，限制页面能加载哪些资源。

\`\`\`nginx
server {
    # 基础 CSP：只允许同源
    add_header Content-Security-Policy "default-src 'self'" always;
    # default-src 'self'   默认只允许同源资源

    # 更宽松的 CSP（允许特定域）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.example.com" always;
    # script-src   JS 来源
    # style-src    CSS 来源，unsafe-inline 允许内联样式
    # img-src      图片来源，data: 允许 base64 图片
    # font-src     字体来源
    # connect-src  fetch/XHR/WebSocket 目标
}
\`\`\`

⚠️ CSP 配置不当会"误伤"正常功能。建议先用 Content-Security-Policy-Report-Only 模式只上报不拦截，观察日志调整。

### 8.3 安全头 snippet

\`\`\`nginx
# /etc/nginx/snippets/security-headers.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
\`\`\`

\`\`\`nginx
# 使用
server {
    listen 443 ssl http2;
    include snippets/security-headers.conf;
    # ...
}
\`\`\`

### 8.4 隐藏 Nginx 版本

\`\`\`nginx
http {
    server_tokens off;           # 响应头不显示 Nginx 版本号
    # 默认 Server: nginx/1.18.0 → 改成 Server: nginx
    # 减少攻击者获取版本信息（降低被针对性攻击风险）
}
\`\`\`

---

## 九、完整生产配置示例

\`\`\`nginx
# /etc/nginx/conf.d/example.com.conf

# HTTP → HTTPS 重定向
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://\$host\$request_uri;
}

# HTTPS 主站点
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    # ===== SSL =====
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ===== 安全头 =====
    include snippets/security-headers.conf;

    # ===== gzip =====
    gzip on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_vary on;

    # ===== 根目录 =====
    root /var/www/example;
    index index.html;

    # ===== 主 location =====
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # ===== 静态资源长期缓存 =====
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ===== API 反代（带限流）=====
    location /api/ {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://127.0.0.1:8000;
        include snippets/proxy_params.conf;
    }

    # ===== 健康检查（不限流）=====
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:8000/health;
    }
}
\`\`\`

---

## 十、性能测试与验证

### 10.1 验证各项优化

\`\`\`bash
# 1. HTTPS 是否生效
curl -I https://example.com
# 应返回 HTTP/2 200

# 2. HTTP/2 是否生效
curl -I --http2 https://example.com
# 应显示 HTTP/2

# 3. gzip 是否生效
curl -H "Accept-Encoding: gzip" -I https://example.com/index.html
# 应有 Content-Encoding: gzip

# 4. 缓存是否生效
curl -I https://example.com/style.css
# 应有 Cache-Control: max-age=...

# 5. 安全头是否齐全
curl -I https://example.com | grep -i "x-frame\|x-content\|strict-transport"
\`\`\`

### 10.2 用 ab 压测

\`\`\`bash
# Apache Bench 压测
ab -n 1000 -c 100 https://example.com/
# -n 1000   总共 1000 个请求
# -c 100    并发 100
# 关注：
# Requests per second    QPS
# Time per request       平均响应时间
# Failed requests        失败数

# 压测前先压本地后端，再压 Nginx，对比性能
\`\`\`

### 10.3 用 SSL Labs 检测

\`\`\`text
访问 https://www.ssllabs.com/ssltest/ 输入你的域名
会给出 SSL 配置评级（A+ 为最佳）
检查项：证书、协议、加密套件、HSTS、漏洞

目标评级：A 或 A+
\`\`\`

---

## 十一、本章小结

\`\`\`text
┌──────────────────────────────────────────────────────────────┐
│  HTTPS 与性能优化要点                                         │
├──────────────────────────────────────────────────────────────┤
│  证书：certbot --nginx 自动申请 + 配置 + 续期                 │
│  跳转：return 301 https://\$host\$request_uri                  │
│  HSTS：Strict-Transport-Security 强制 HTTPS                  │
│  HTTP/2：listen 443 ssl http2                                │
│  gzip：gzip on + gzip_types + gzip_comp_level 6              │
│  缓存：expires + Cache-Control immutable                     │
│  限流：limit_req_zone + limit_req burst nodelay              │
│  安全头：X-Frame-Options/CSP/HSTS/nosniff                    │
│  隐藏版本：server_tokens off                                 │
└──────────────────────────────────────────────────────────────┘
\`\`\`

\`\`\`nginx
# 生产级最小 HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    server_tokens off;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

下一章我们用这套配置部署真实的 Python 应用——Django + Gunicorn、FastAPI + Uvicorn、Flask + Gunicorn 完整实战。
`
  },

  {
    id: "deploy-nginx-python",
    icon: "🐍",
    title: "Python 应用部署实战",
    group: "Nginx 反向代理",
    content: `# Python 应用部署实战

前面三章我们打好了 Nginx 基础。这一章是综合实战——把 Django、FastAPI、Flask 三大 Python Web 框架用 Nginx + Gunicorn/Uvicorn 部署上线，包括 WebSocket、静态文件、多站点、日志轮转、故障排查。学完这一章，你能独立完成一个 Python Web 项目的生产部署。

## 一、部署架构总览

### 1.1 标准架构

\`\`\`text
                    ┌─────────────────────────────────────┐
用户 ──HTTPS──→    │           Nginx (443)                │
                    │  SSL终结/gzip/缓存/限流/反代          │
                    └────────────────┬────────────────────┘
                                     │ HTTP (127.0.0.1)
                                     ▼
                    ┌─────────────────────────────────────┐
                    │     Gunicorn / Uvicorn (8000)       │
                    │     应用服务器（多 worker 进程）      │
                    └────────────────┬────────────────────┘
                                     │ WSGI / ASGI
                                     ▼
                    ┌─────────────────────────────────────┐
                    │   Django / FastAPI / Flask 应用      │
                    └─────────────────────────────────────┘
\`\`\`

### 1.2 各组件职责

\`\`\`text
┌──────────────┬──────────────────────────────────────────┐
│  组件        │  职责                                    │
├──────────────┼──────────────────────────────────────────┤
│  Nginx       │  对外接收请求、HTTPS、静态文件、负载均衡  │
│  Gunicorn    │  WSGI 服务器，管理多个 Python 进程跑应用 │
│  Uvicorn     │  ASGI 服务器，支持异步（FastAPI 用）     │
│  Django      │  WSGI 应用框架                          │
│  FastAPI     │  ASGI 应用框架（异步）                  │
│  Flask       │  WSGI 应用框架（轻量）                   │
│  systemd     │  管理 Gunicorn/Uvicorn 进程（开机自启）  │
└──────────────┴──────────────────────────────────────────┘

关键：WSGI 应用（Django/Flask）用 Gunicorn
      ASGI 应用（FastAPI）用 Uvicorn
\`\`\`

---

## 二、Nginx + Gunicorn + Django 完整部署

### 2.1 Django 项目准备

\`\`\`bash
# 1. 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 2. 安装依赖
pip install django gunicorn psycopg2-binary

# 3. 创建项目
django-admin startproject myproject
cd myproject

# 4. 配置 settings.py
# ALLOWED_HOSTS 加上域名
# ALLOWED_HOSTS = ['example.com', 'www.example.com']

# 静态文件配置
# STATIC_URL = '/static/'
# STATIC_ROOT = '/var/www/myproject/static/'
# MEDIA_URL = '/media/'
# MEDIA_ROOT = '/var/www/myproject/media/'

# 5. 收集静态文件
python manage.py collectstatic --noinput

# 6. 迁移数据库
python manage.py migrate

# 7. 测试 Gunicorn 能否启动
gunicorn myproject.wsgi:application -w 4 -b 127.0.0.1:8000
# 浏览器访问 http://127.0.0.1:8000 应该看到 Django 页面
\`\`\`

### 2.2 Gunicorn systemd 服务

\`\`\`bash
# /etc/systemd/system/gunicorn.service
sudo tee /etc/systemd/system/gunicorn.service > /dev/null <<'EOF'
[Unit]
Description=Gunicorn daemon for Django
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/deploy/myproject
# -w 4            4 个 worker（一般 2-4 倍 CPU 核数）
# -b 127.0.0.1   只监听本机，由 Nginx 反代
# --access-logfile  访问日志
# --error-logfile    错误日志
ExecStart=/home/deploy/myproject/venv/bin/gunicorn \\
    --access-logfile - \\
    --error-logfile - \\
    -w 4 \\
    -b 127.0.0.1:8000 \\
    myproject.wsgi:application
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 启动并设开机自启
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
\`\`\`

### 2.3 Gunicorn 配置文件（更专业）

\`\`\`bash
# /home/deploy/myproject/gunicorn.conf.py
bind = '127.0.0.1:8000'           # 监听地址
workers = 4                        # worker 数（CPU 核数 × 2 + 1）
worker_class = 'sync'              # 同步 worker（Django 默认）
# worker_class = 'gevent'          # IO 密集可用 gevent
# worker_connections = 1000        # gevent 时的连接数
timeout = 120                      # worker 超时（秒）
keepalive = 5                      # keep-alive 秒数
max_requests = 1000                # 每个 worker 处理 1000 请求后重启（防内存泄漏）
max_requests_jitter = 50           # 加随机抖动，避免所有 worker 同时重启
preload_app = True                 # 预加载应用（省内存，加快启动）
accesslog = '-'                    # 访问日志输出到 stdout
errorlog = '-'                     # 错误日志输出到 stderr
loglevel = 'info'                  # 日志级别
\`\`\`

systemd 用配置文件启动：

\`\`\`bash
ExecStart=/home/deploy/myproject/venv/bin/gunicorn \\
    -c /home/deploy/myproject/gunicorn.conf.py \\
    myproject.wsgi:application
\`\`\`

### 2.4 Nginx 完整配置

\`\`\`nginx
# /etc/nginx/conf.d/myproject.conf

# HTTP → HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://\$host\$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 上传文件大小（Django 上传需要）
    client_max_body_size 10M;

    # ===== 静态文件 =====
    location /static/ {
        alias /var/www/myproject/static/;     # STATIC_ROOT
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # ===== 媒体文件（用户上传）=====
    location /media/ {
        alias /var/www/myproject/media/;      # MEDIA_ROOT
        expires 7d;
        # 内部访问，可选
    }

    # ===== 动态请求反代 =====
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 10s;
        proxy_read_timeout 120s;
    }

    access_log /var/log/nginx/myproject_access.log;
    error_log /var/log/nginx/myproject_error.log;
}
\`\`\`

### 2.5 Django 端配合配置

\`\`\`python
# settings.py
import os

# 信任 Nginx 代理
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# 启用 HTTPS 相关安全
if not DEBUG:
    SECURE_SSL_REDIRECT = True          # 自动跳转 HTTPS
    SESSION_COOKIE_SECURE = True        # Cookie 只走 HTTPS
    CSRF_COOKIE_SECURE = True

# 静态/媒体
STATIC_URL = '/static/'
STATIC_ROOT = '/var/www/myproject/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = '/var/www/myproject/media/'

# ALLOWED_HOSTS
ALLOWED_HOSTS = ['example.com', 'www.example.com']

# 从 X-Forwarded-For 取真实 IP（配合 django-ipware 或自写）
# pip install django-ipware
\`\`\`

---

## 三、Nginx + Uvicorn + FastAPI 完整部署

### 3.1 FastAPI 项目准备

\`\`\`bash
# 虚拟环境
python -m venv venv
source venv/bin/activate

# 安装
pip install fastapi uvicorn[standard] gunicorn

# main.py
cat > main.py <<'EOF'
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "name": f"User {user_id}"}

@app.websocket("/ws")
async def websocket_endpoint(websocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Echo: {data}")
EOF

# 测试
uvicorn main:app --host 127.0.0.1 --port 8000
\`\`\`

### 3.2 用 Gunicorn + Uvicorn worker（生产推荐）

\`\`\`bash
# 生产推荐用 gunicorn 管理 uvicorn worker
# gunicorn 提供成熟的进程管理、重启、信号处理

gunicorn main:app \\
    -w 4 \\
    -k uvicorn.workers.UvicornWorker \\
    -b 127.0.0.1:8000
# -w 4                4 个 worker
# -k uvicorn...Worker  用 Uvicorn worker（支持 ASGI + 异步）
\`\`\`

### 3.3 systemd 服务

\`\`\`bash
# /etc/systemd/system/fastapi.service
sudo tee /etc/systemd/system/fastapi.service > /dev/null <<'EOF'
[Unit]
Description=FastAPI with Gunicorn + Uvicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/deploy/fastapi-app
Environment="PATH=/home/deploy/fastapi-app/venv/bin"
EnvironmentFile=/home/deploy/fastapi-app/.env
ExecStart=/home/deploy/fastapi-app/venv/bin/gunicorn \\
    main:app \\
    -w 4 \\
    -k uvicorn.workers.UvicornWorker \\
    -b 127.0.0.1:8000 \\
    --access-logfile - \\
    --error-logfile -
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable fastapi
sudo systemctl start fastapi
\`\`\`

### 3.4 Nginx 配置（含 WebSocket）

\`\`\`nginx
# /etc/nginx/conf.d/fastapi.conf
server {
    listen 80;
    server_name api.example.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # 上传限制
    client_max_body_size 10M;

    # ===== API 反代 =====
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # ===== WebSocket 支持 =====
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        # 这两个头是 WebSocket 握手必需的

        # WebSocket 长连接保活
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;

        # 缓冲
        proxy_buffering off;
        # 流式响应/SSE 关闭缓冲
    }

    # ===== 健康检查 =====
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:8000/health;
    }

    # ===== 限流 =====
    # 登录接口严格限流
    location /api/login {
        limit_req zone=login_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:8000;
        include snippets/proxy_params.conf;
    }

    access_log /var/log/nginx/fastapi_access.log;
    error_log /var/log/nginx/fastapi_error.log;
}
\`\`\`

### 3.5 FastAPI 获取真实 IP

\`\`\`python
from fastapi import FastAPI, Request

app = FastAPI()

def get_client_ip(request: Request) -> str:
    """从 X-Forwarded-For 取真实 IP"""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host

@app.get("/whoami")
async def whoami(request: Request):
    return {"ip": get_client_ip(request)}
\`\`\`

---

## 四、Nginx + Gunicorn + Flask 完整部署

### 4.1 Flask 项目准备

\`\`\`bash
python -m venv venv
source venv/bin/activate
pip install flask gunicorn

# app.py
cat > app.py <<'EOF'
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({"message": "Hello from Flask"})

@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    return jsonify({"user_id": user_id})

@app.route("/whoami")
def whoami():
    # 从 X-Forwarded-For 取真实 IP
    xff = request.headers.get("X-Forwarded-For", "")
    real_ip = xff.split(",")[0].strip() if xff else request.remote_addr
    return jsonify({"ip": real_ip})

if __name__ == "__main__":
    app.run(debug=False)
EOF

# 测试
gunicorn app:app -w 4 -b 127.0.0.1:8000
\`\`\`

### 4.2 systemd 服务

\`\`\`bash
# /etc/systemd/system/flask.service
sudo tee /etc/systemd/system/flask.service > /dev/null <<'EOF'
[Unit]
Description=Flask with Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/deploy/flask-app
EnvironmentFile=/home/deploy/flask-app/.env
ExecStart=/home/deploy/flask-app/venv/bin/gunicorn \\
    --workers 4 \\
    --bind 127.0.0.1:8000 \\
    --access-logfile - \\
    --error-logfile - \\
    app:app
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable flask
sudo systemctl start flask
\`\`\`

### 4.3 Nginx 配置

\`\`\`nginx
# /etc/nginx/conf.d/flask.conf
server {
    listen 443 ssl http2;
    server_name flask.example.com;

    ssl_certificate /etc/letsencrypt/live/flask.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flask.example.com/privkey.pem;

    client_max_body_size 10M;

    # Flask 静态文件直接 Nginx 提供（更快）
    location /static/ {
        alias /home/deploy/flask-app/static/;
        expires 7d;
        access_log off;
    }

    # 动态请求
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }

    access_log /var/log/nginx/flask_access.log;
    error_log /var/log/nginx/flask_error.log;
}
\`\`\`

---

## 五、WebSocket 代理配置

WebSocket（如 FastAPI、Django Channels、Flask-SocketIO）需要特殊处理。

### 5.1 标准 WebSocket 代理

\`\`\`nginx
# WebSocket 路径
location /ws {
    proxy_pass http://127.0.0.1:8000;

    # ===== WebSocket 必需头 =====
    proxy_http_version 1.1;                  # 用 HTTP/1.1（1.0 不支持 Upgrade）
    proxy_set_header Upgrade \$http_upgrade;  # 透传 Upgrade 头
    proxy_set_header Connection "upgrade";    # 设 Connection 为 upgrade

    # 透传其它头
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    # ===== 长连接保活 =====
    proxy_read_timeout 86400s;               # 读超时 24 小时
    proxy_send_timeout 86400s;               # 写超时 24 小时
    # WebSocket 是长连接，超时要设大，否则空闲会被断开

    # 关闭缓冲
    proxy_buffering off;
}
\`\`\`

### 5.2 通用 Upgrade 映射（推荐）

\`\`\`nginx
# 用 map 智能判断是否是 WebSocket
http {
    map \$http_upgrade \$connection_upgrade {
        default upgrade;
        ''      close;
    }
    # \$http_upgrade 有值（WebSocket）→ \$connection_upgrade = upgrade
    # \$http_upgrade 为空（普通 HTTP）→ \$connection_upgrade = close
}

server {
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        # 这样同一个 location 既能处理 WebSocket 又能处理普通 HTTP
    }
}
\`\`\`

### 5.3 SSE（Server-Sent Events）代理

\`\`\`nginx
location /events {
    proxy_pass http://127.0.0.1:8000;
    proxy_buffering off;            # 关闭缓冲，否则 SSE 会卡住
    proxy_cache off;                # 关闭缓存
    proxy_set_header Connection ''; # 长连接
    proxy_read_timeout 86400s;      # 长超时
    chunked_transfer_encoding on;   # 流式传输
}
\`\`\`

---

## 六、静态文件与媒体文件分发

### 6.1 Django 静态文件

\`\`\`nginx
# Django collectstatic 收集到 STATIC_ROOT
location /static/ {
    alias /var/www/myproject/static/;
    expires 30d;
    add_header Cache-Control "public";

    # 按类型分别缓存
    location ~* \\.(css|js)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location ~* \\.(jpg|jpeg|png|gif|ico|svg)\$ {
        expires 30d;
    }
    location ~* \\.(woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
\`\`\`

### 6.2 用户上传媒体文件

\`\`\`nginx
location /media/ {
    alias /var/www/myproject/media/;
    # 媒体文件不长期缓存（用户可能更新）
    expires 1h;

    # 防止上传的文件被当脚本执行（安全！）
    location ~* \\.(php|py|sh|exe)\$ {
        deny all;
    }
    # 关键：用户上传目录绝不能执行脚本

    # 限制图片大小
    client_max_body_size 10M;
}
\`\`\`

### 6.3 Flask 静态文件

\`\`\`nginx
location /static/ {
    alias /home/deploy/flask-app/static/;
    expires 7d;
    access_log off;
}
\`\`\`

---

## 七、多站点部署

### 7.1 基于域名的虚拟主机

一台服务器一个 Nginx 托管多个站点，靠 server_name 区分。

\`\`\`nginx
# /etc/nginx/conf.d/site-a.conf
server {
    listen 80;
    server_name a.example.com;
    root /var/www/site-a;
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}

# /etc/nginx/conf.d/site-b.conf
server {
    listen 80;
    server_name b.example.com;
    root /var/www/site-b;
    location / {
        proxy_pass http://127.0.0.1:8001;
    }
}

# /etc/nginx/conf.d/site-c.conf
server {
    listen 80;
    server_name c.example.com;
    root /var/www/site-c;
    location / {
        proxy_pass http://127.0.0.1:8002;
    }
}
\`\`\`

\`\`\`text
三个域名都解析到同一台服务器 IP：
  a.example.com → Nginx → 后端 8000（Django）
  b.example.com → Nginx → 后端 8001（FastAPI）
  c.example.com → Nginx → 后端 8002（Flask）

Nginx 根据请求的 Host 头分发到不同 server 块
\`\`\`

### 7.2 基于端口的虚拟主机

不同端口跑不同站点（不常用，一般用域名）。

\`\`\`nginx
server {
    listen 8080;
    server_name _;
    root /var/www/site-a;
    location / { proxy_pass http://127.0.0.1:8000; }
}

server {
    listen 8081;
    server_name _;
    root /var/www/site-b;
    location / { proxy_pass http://127.0.0.1:8001; }
}
\`\`\`

### 7.3 子路径部署（同一域名不同路径）

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    # 主应用
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }

    # /api 走 FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
    }

    # /admin 走 Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8002;
        proxy_set_header Host \$host;
    }

    # /grafana 走 Grafana
    location /grafana/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
    }
}
\`\`\`

### 7.4 SSL 多站点（SNI）

\`\`\`nginx
# 不同域名用不同证书，靠 SNI 区分
server {
    listen 443 ssl http2;
    server_name a.example.com;
    ssl_certificate /etc/letsencrypt/live/a.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/a.example.com/privkey.pem;
    location / { proxy_pass http://127.0.0.1:8000; }
}

server {
    listen 443 ssl http2;
    server_name b.example.com;
    ssl_certificate /etc/letsencrypt/live/b.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/b.example.com/privkey.pem;
    location / { proxy_pass http://127.0.0.1:8001; }
}
\`\`\`

> **SNI 原理**：客户端在 TLS 握手时会在 ClientHello 中携带 SNI 字段告诉服务器要访问哪个域名，Nginx 据此选择对应的证书。这样同一个 IP+端口可以承载多个 HTTPS 站点。

\`\`\`bash
# 用 openssl 验证 SNI 是否生效
echo | openssl s_client -connect example.com:443 -servername a.example.com 2>/dev/null | openssl x509 -noout -subject
# 输出：subject=C = US, CN = a.example.com

echo | openssl s_client -connect example.com:443 -servername b.example.com 2>/dev/null | openssl x509 -noout -subject
# 输出：subject=C = US, CN = b.example.com
\`\`\`

### 7.5 HTTP 强制跳转 HTTPS

\`\`\`nginx
server {
    listen 80;
    server_name a.example.com b.example.com;
    # 80 端口所有请求 301 永久跳转到 HTTPS
    return 301 https://\$host\$request_uri;
}
\`\`\`

---

## 八、日志轮转（logrotate）

Nginx 默认把所有访问日志写进 \`/var/log/nginx/access.log\`，时间一长文件会膨胀到几十 GB，既占磁盘又难排查。日志轮转（log rotation）就是定期把日志"切一刀"：把当前日志改名为 \`access.log.1\`，新建空的 \`access.log\` 让 Nginx 继续写，老日志按天/周保留若干份后自动删除。

### 8.1 Nginx 自带的 logrotate 配置

apt 安装 Nginx 时会自动装好一份 logrotate 配置：

\`\`\`bash
# 查看配置文件
cat /etc/logrotate.d/nginx
\`\`\`

\`\`\`text
/var/log/nginx/*.log {
    daily              # 每天轮转一次
    missingok          # 日志文件不存在也不报错
    rotate 14          # 保留 14 份历史日志
    compress           # 老日志用 gzip 压缩（生成 .gz）
    delaycompress      # 延迟一天压缩，方便排查前一天问题
    notifempty         # 日志为空不轮转
    create 640 www-data adm   # 新日志文件的属主属组和权限
    sharedscripts      # 多个日志共用一个 postrotate 脚本
    postrotate         # 轮转后执行的命令
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
\`\`\`

### 8.2 每个指令的含义

| 指令 | 作用 |
|------|------|
| \`daily\` | 轮转周期，可选 daily/weekly/monthly/yearly |
| \`rotate 14\` | 保留 14 份历史，超过的自动删除 |
| \`compress\` | 用 gzip 压缩轮转出来的老日志 |
| \`delaycompress\` | 最近一份不压缩（便于直接 \`zless\` 查看），下一轮才压 |
| \`missingok\` | 日志不存在不报错（首次部署时常用） |
| \`notifempty\` | 日志为空就不轮转 |
| \`create 640 www-data adm\` | 创建新日志文件，权限 640，属主 www-data |
| \`sharedscripts\` | 多个匹配日志只执行一次 postrotate |
| \`postrotate ... endscript\` | 轮转后给 Nginx 发 USR1 信号，让它重新打开日志文件 |

### 8.3 USR1 信号的作用

\`\`\`text
为什么轮转后要发 USR1 信号？
  Nginx 用 open() 打开 access.log 并一直持有文件描述符
  即使你把 access.log 改名为 access.log.1
  Nginx 仍写向那个 inode（现在叫 access.log.1）
  必须让 Nginx 重新 open() 一次，才会写向新的 access.log
  USR1 信号就是告诉 Nginx："请重新打开日志文件"
\`\`\`

\`\`\`bash
# 手动测试 USR1 信号
ls -la /var/log/nginx/access.log
# -rw-r----- 1 www-data adm 1.2G ... access.log

sudo mv /var/log/nginx/access.log /var/log/nginx/access.log.1
# 此时 Nginx 仍在写 access.log.1（通过 inode）

sudo kill -USR1 \$(cat /var/run/nginx.pid)
# Nginx 重新打开 access.log，新日志写进新文件

ls -la /var/log/nginx/
# access.log        ← 新建的小文件
# access.log.1      ← 老的大文件
\`\`\`

### 8.4 手动测试 logrotate

\`\`\`bash
# 调试模式（不实际轮转，只打印会做什么）
sudo logrotate -d /etc/logrotate.d/nginx

# 强制轮转（不管是否到时间，立即执行一次）
sudo logrotate -f /etc/logrotate.d/nginx

# 查看 logrotate 状态记录
cat /var/lib/logrotate/status
# 这里记录了每个日志上次轮转的时间
\`\`\`

### 8.5 自定义按小时轮转

某些高流量场景需要按小时切日志：

\`\`\`text
/var/log/nginx/*.log {
    hourly              # 改成每小时
    rotate 168          # 保留 168 小时 = 7 天
    compress
    delaycompress
    missingok
    notifempty
    create 640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
\`\`\`

\`\`\`bash
# 还要把 logrotate 加进 crontab 每小时跑一次
sudo crontab -e
# 添加：
# 0 * * * * /usr/sbin/logrotate /etc/logrotate.d/nginx
\`\`\`

### 8.6 按站点分日志

\`\`\`nginx
# 让不同站点的日志分开存
server {
    server_name a.example.com;
    access_log /var/log/nginx/a.access.log main;
    error_log  /var/log/nginx/a.error.log;
}
server {
    server_name b.example.com;
    access_log /var/log/nginx/b.access.log main;
    error_log  /var/log/nginx/b.error.log;
}
\`\`\`

\`\`\`text
/var/log/nginx/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
\`\`\`

\`*.log\` 通配符会同时匹配 a.access.log、b.access.log，一次性全部轮转。

---

## 九、故障排查与调试技巧

部署上线后最常遇到"502/504/连接超时"等问题。本节给一套系统化的排查思路。

### 9.1 配置语法检查

改完配置**必须**先 \`nginx -t\` 测试语法，避免 reload 把 Nginx 搞挂。

\`\`\`bash
# 测试语法（不实际 reload）
sudo nginx -t
# 输出：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 出错时会指明行号
sudo nginx -t
# nginx: [emerg] unknown directive "xyz" in /etc/nginx/sites-enabled/default:12
\`\`\`

\`\`\`bash
# 打印完整生效配置（含 include 进来的所有片段）
sudo nginx -T | less
# 排查"我以为改了但没生效"时很有用
\`\`\`

### 9.2 502 Bad Gateway

502 = Nginx 连不上后端。

\`\`\`text
排查清单：
  1. 后端进程在跑吗？     → ps aux | grep gunicorn
  2. 后端端口在监听吗？   → ss -tlnp | grep 8000
  3. 防火墙拦了吗？       → sudo ufw status
  4. SELinux 拦了吗？     → sudo getenforce  (CentOS 常见)
  5. proxy_pass 地址对吗？ → 检查 nginx 配置里的 127.0.0.1:8000
\`\`\`

\`\`\`bash
# 1. 看后端进程
ps aux | grep -E 'gunicorn|uvicorn'
# 应能看到 master + 若干 worker 进程

# 2. 看端口监听
ss -tlnp | grep 8000
# LISTEN  127.0.0.1:8000  ← 必须有这一行
# 如果没有，说明后端没起来或绑错地址

# 3. 本地 curl 后端
curl -I http://127.0.0.1:8000/
# 如果 curl 通但浏览器 502，多半是 Nginx 配置问题
# 如果 curl 不通，问题在后端本身

# 4. 看 Nginx error.log（最关键！）
sudo tail -50 /var/log/nginx/error.log
# 常见错误：
# connect() refused → 后端没起 / 端口错
# upstream timed out → 后端响应太慢，调大 proxy_read_timeout
# no live upstreams → upstream 里所有节点都挂了
\`\`\`

### 9.3 504 Gateway Timeout

504 = 后端响应超时。

\`\`\`nginx
# Python 应用处理慢请求（如大报表、AI 推理）时容易 504
# 调大超时时间
location /slow-api/ {
    proxy_pass http://backend;
    proxy_connect_timeout 60s;   # 连接后端超时
    proxy_send_timeout    300s;  # 发请求给后端超时
    proxy_read_timeout    300s;  # 读后端响应超时（关键！默认 60s）
}
\`\`\`

\`\`\`text
注意：
  proxy_read_timeout 不是"总耗时上限"，而是"两次读操作之间的间隔上限"
  如果后端每 200s flush 一次数据，300s 超时永远不会触发
  适合 SSE、长轮询、流式接口
\`\`\`

### 9.4 看 access.log 分析请求

\`\`\`bash
# 统计各状态码数量
awk '{print \$9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
# 输出：
#   85432 200
#    1203 404
#     456 500
#      89 502

# 找出最慢的 10 个请求（假设日志含 \$request_time）
awk '{print \$NF, \$7}' /var/log/nginx/access.log | sort -rn | head -10

# 统计每个 URL 的访问量
awk '{print \$7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# 找出所有 5xx 错误
awk '\$9 ~ /^5/ {print}' /var/log/nginx/access.log | head -20
\`\`\`

### 9.5 curl 调试反代

\`\`\`bash
# 模拟 Host 头测试虚拟主机
curl -H "Host: a.example.com" http://127.0.0.1/

# 跟随重定向
curl -L http://example.com

# 显示完整请求/响应头（排查代理是否加了正确的头）
curl -v http://127.0.0.1/

# 只看响应头
curl -I http://127.0.0.1/

# 指定 HTTP 版本（测试 HTTP/2）
curl --http2 -I https://example.com

# 测试 WebSocket 升级
curl -i -N \\
  -H "Connection: Upgrade" \\
  -H "Upgrade: websocket" \\
  -H "Sec-WebSocket-Key: test123" \\
  -H "Sec-WebSocket-Version: 13" \\
  http://127.0.0.1/ws
\`\`\`

### 9.6 实时监控

\`\`\`bash
# 实时看 access.log
sudo tail -f /var/log/nginx/access.log

# 实时看 error.log
sudo tail -f /var/log/nginx/error.log

# 实时统计 QPS（每秒请求数）
sudo tail -f /var/log/nginx/access.log | pv -l -i 1 > /dev/null

# 统计当前并发连接数
ss -tn | awk '\$1 == "ESTAB" {print}' | wc -l

# 按 Nginx worker 进程的连接数
ss -tnp | grep nginx | awk '{print \$4}' | cut -d: -f1 | sort | uniq -c
\`\`\`

### 9.7 stub_status 监控页

\`\`\`nginx
# 在 server 块里加一个 location
location /nginx_status {
    stub_status on;            # 开启状态页
    access_log off;           # 不记访问日志，避免污染
    allow 127.0.0.1;          # 只允许本机访问
    deny all;                 # 拒绝其他所有人
}
\`\`\`

\`\`\`bash
curl http://127.0.0.1/nginx_status
# Active connections: 15
# server accepts handled requests
# 8456 8456 32891
# Reading: 0 Writing: 2 Waiting: 13
\`\`\`

\`\`\`text
字段含义：
  Active connections  当前活跃连接数（含 Reading/Writing/Waiting）
  accepts             已接受的连接总数
  handled             已处理的连接总数
  requests            已处理的请求总数
  Reading             正在读取请求头的连接数
  Writing             正在返回响应的连接数
  Waiting             空闲等待中的连接数（keep-alive）

健康指标：
  Waiting 多 → keep-alive 复用率高，正常
  Reading 持续高 → 客户端上传慢或攻击
  Writing 持续高 → 后端响应慢
\`\`\`

### 9.8 常见配置错误清单

\`\`\`text
❌ proxy_pass 末尾加斜杠导致路径丢失
   proxy_pass http://backend/;        ← 末尾有 /，会去掉 location 前缀
   proxy_pass http://backend;         ← 末尾无 /，保留完整路径

❌ location 与 root/alias 混淆
   location /static/ { root /var/www; }     → 实际找 /var/www/static/
   location /static/ { alias /var/www/; }   → 实际找 /var/www/

❌ upstream 名称带下划线但 proxy_pass 没加 http://
   upstream my_backend { ... }              ← 名称带下划线 OK
   proxy_pass my_backend;                   ← 错！必须 http://my_backend

❌ HTTPS 配置漏了 443 端口
   listen 443;                              ← 没加 ssl
   listen 443 ssl;                          ← 正确

❌ http2 写错位置
   listen 443 ssl http2;                    ← 正确（写在 listen 行）
   listen 443 ssl; http2 on;                ← 错（旧版不支持 http2 指令）

❌ 大文件上传 413
   client_max_body_size 1m;                 ← 默认只允许 1MB
   client_max_body_size 100m;               ← 调大
\`\`\`

### 9.9 调试时临时开详细日志

\`\`\`nginx
# 在 http 块顶部加
error_log /var/log/nginx/error.log debug;
# debug 级别会打印非常详细的信息，仅排查时用
# 排查完务必改回 warn 或 error
\`\`\`

\`\`\`bash
# 验证当前 Nginx 是否支持 debug 日志
nginx -V 2>&1 | grep -o with-debug
# 输出 with-debug 才支持
\`\`\`

---

## 十、本章小结

本章把前面几章学的 Nginx 知识全部串起来，完成"从零部署一个 Python Web 应用"的全流程。

### 10.1 完整部署流程回顾

\`\`\`text
┌─────────────────────────────────────────────────────────────┐
│  Python 应用部署完整流程                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 写代码   Flask/FastAPI/Django + requirements.txt        │
│       ↓                                                     │
│  2. 装依赖   python -m venv venv && pip install -r ...      │
│       ↓                                                     │
│  3. 选 WSGI/ASGI 服务器                                     │
│       ├── 同步应用 → Gunicorn                               │
│       └── 异步应用 → Uvicorn（FastAPI 原生）                │
│       ↓                                                     │
│  4. 启动应用  gunicorn/uvicorn 绑定 127.0.0.1:8000          │
│       ↓                                                     │
│  5. 配 systemd  让应用开机自启 + 崩溃自动重启               │
│       ↓                                                     │
│  6. 配 Nginx 反代  80/443 → 127.0.0.1:8000                  │
│       ├── proxy_pass 转发                                   │
│       ├── proxy_set_header 透传客户端信息                   │
│       └── 静态文件直接由 Nginx 处理                         │
│       ↓                                                     │
│  7. 配 HTTPS   certbot 申请证书 + 自动续期                  │
│       ↓                                                     │
│  8. 配日志轮转  logrotate 每天切日志                         │
│       ↓                                                     │
│  9. 监控告警   stub_status + access.log 分析                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### 10.2 生产环境配置模板（综合版）

把前面所有知识点整合成一份可直接用的生产配置：

\`\`\`nginx
# /etc/nginx/sites-available/myapp —— 生产环境综合配置

# ===== upstream 负载均衡池 =====
upstream myapp_backend {
    least_conn;                                     # 最少连接策略
    server 127.0.0.1:8000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    keepalive 32;                                   # 保持 32 个连接复用
}

# ===== HTTP → HTTPS 跳转 =====
server {
    listen 80;
    server_name myapp.example.com;
    return 301 https://\$host\$request_uri;
}

# ===== HTTPS 主站 =====
server {
    listen 443 ssl http2;
    server_name myapp.example.com;

    # ----- SSL 证书 -----
    ssl_certificate     /etc/letsencrypt/live/myapp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # ----- 安全头 -----
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options           "SAMEORIGIN"        always;
    add_header X-Content-Type-Options    "nosniff"           always;

    # ----- 日志 -----
    access_log /var/log/nginx/myapp.access.log main;
    error_log  /var/log/nginx/myapp.error.log  warn;

    # ----- 上传大小 -----
    client_max_body_size 20m;

    # ----- 静态文件（Nginx 直接处理，不经过 Python）-----
    location /static/ {
        alias /opt/myapp/staticfiles/;        # Django collectstatic 输出目录
        expires 30d;                          # 浏览器缓存 30 天
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /opt/myapp/media/;              # 用户上传文件
        expires 7d;
    }

    # ----- WebSocket（如有）-----
    location /ws/ {
        proxy_pass http://myapp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;             # WS 长连接超时调大
    }

    # ----- 动态请求反代给 Python -----
    location / {
        proxy_pass http://myapp_backend;
        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # 连接复用（配合 upstream keepalive）
        proxy_set_header Connection "";

        # 超时
        proxy_connect_timeout 10s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;

        # 缓冲
        proxy_buffering    on;
        proxy_buffer_size  16k;
        proxy_buffers      8 32k;
    }

    # ----- 健康检查端点 -----
    location /health {
        proxy_pass http://myapp_backend/health;
        access_log off;                       # 不记日志，避免刷屏
    }

    # ----- Nginx 状态页（仅本机）-----
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
\`\`\`

### 10.3 systemd 服务模板

\`\`\`ini
# /etc/systemd/system/myapp.service —— Gunicorn + Flask/Django
[Unit]
Description=MyApp Gunicorn Service
After=network.target

[Service]
Type=notify
User=appuser
Group=appuser
WorkingDirectory=/opt/myapp
Environment="PATH=/opt/myapp/venv/bin"
EnvironmentFile=/opt/myapp/.env
ExecStart=/opt/myapp/venv/bin/gunicorn \\
    --workers 4 \\
    --bind 127.0.0.1:8000 \\
    --access-logfile /var/log/myapp/gunicorn.access.log \\
    --error-logfile /var/log/myapp/gunicorn.error.log \\
    myapp.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure
RestartSec=5s
KillMode=mixed
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`ini
# /etc/systemd/system/myapp-uvicorn.service —— Uvicorn + FastAPI
[Unit]
Description=MyApp Uvicorn Service
After=network.target

[Service]
Type=notify
User=appuser
Group=appuser
WorkingDirectory=/opt/myapp
Environment="PATH=/opt/myapp/venv/bin"
EnvironmentFile=/opt/myapp/.env
ExecStart=/opt/myapp/venv/bin/uvicorn \\
    --workers 4 \\
    --host 127.0.0.1 \\
    --port 8000 \\
    --proxy-headers \\
    --forwarded-allow-ips='*' \\
    myapp.main:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
\`\`\`

### 10.4 上线检查清单

\`\`\`text
□ Nginx 配置语法 OK（nginx -t 通过）
□ Nginx 已 reload（systemctl reload nginx）
□ 后端服务已启动（systemctl status myapp）
□ 后端端口在监听（ss -tlnp | grep 8000）
□ 防火墙放行 80/443（ufw status）
□ HTTPS 证书有效（curl -vI https://域名）
□ HTTP 自动跳转 HTTPS
□ 静态文件能访问（curl -I https://域名/static/...）
□ 日志在写入（tail -f access.log）
□ logrotate 已配置
□ systemd 开机自启已开启（systemctl is-enabled myapp nginx）
□ 健康检查端点返回 200（curl https://域名/health）
□ 监控告警已接入
\`\`\`

### 10.5 关键要点总结

\`\`\`text
1. Nginx 在前，Python 在后
   Nginx 处理 SSL、静态文件、压缩、限流；Python 专注业务逻辑
   职责分离，各司所长

2. 用 systemd 管理 Python 服务
   开机自启、崩溃重启、统一日志，比 nohup/screen 靠谱得多

3. 静态文件交给 Nginx
   Django 的 collectstatic / Flask 的 static 文件夹都让 Nginx 直接服务
   比走 Python 快几十倍

4. HTTPS 是标配
   Let's Encrypt + certbot 免费且自动续期，没有理由不用

5. proxy_set_header 一定要配
   X-Forwarded-For / X-Forwarded-Proto 让后端拿到真实客户端 IP 和协议
   否则 Django/FastAPI 看到的全是 127.0.0.1 和 http

6. 日志要轮转
   不然 access.log 几天就几十 GB，磁盘爆了服务直接挂

7. 改配置先 nginx -t
   5 秒的检查能避免一次线上事故

8. reload 优先于 restart
   reload 不中断服务，restart 会断连接

9. WebSocket 要单独配 location
   加 Upgrade/Connection 头，调大超时

10. 上线必跑健康检查
    curl /health 返回 200 才算真上线
\`\`\`

### 10.6 本批章节总结

\`\`\`text
第 6 批章节（Nginx 反向代理）覆盖：

第 1 章 Nginx 简介与安装
  → 理解事件驱动模型，掌握 apt/brew/源码三种安装方式

第 2 章 配置文件详解
  → 搞清 http/server/location 三层结构，掌握 location 匹配规则
  → 区分 root vs alias，会用 if/rewrite/return

第 3 章 反向代理与负载均衡
  → proxy_pass 转发请求，proxy_set_header 透传客户端信息
  → upstream 5 种负载策略：轮询/权重/ip_hash/least_conn/hash
  → 健康检查、故障转移、连接复用

第 4 章 HTTPS 与性能优化
  → Let's Encrypt + certbot 申请免费证书
  → HTTP/2、gzip、缓存、安全头、限流

第 5 章 Python 应用部署实战
  → Gunicorn + Flask/Django 同步部署
  → Uvicorn + FastAPI 异步部署
  → WebSocket 代理、子路径部署、SSL 多站点
  → logrotate 日志轮转、故障排查技巧
  → 完整生产环境配置模板

学完这 5 章，你应该能独立完成一个 Python Web 应用的上线部署：
  写代码 → 选 WSGI/ASGI → systemd 管理 → Nginx 反代 → HTTPS → 日志轮转 → 监控
\`\`\`

---

下一批章节我们将进入 **Docker 容器化部署**，把上面这套手动部署流程容器化，让应用"一次构建，到处运行"。
`,
  },
];
