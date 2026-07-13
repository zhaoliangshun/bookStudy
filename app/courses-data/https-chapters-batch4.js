// =============================================================
// HTTPS 详解全书 - 第 4 批章节（HTTPS 部署实战 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   hs-server-config: 服务器 HTTPS 配置
//   hs-letsencrypt: Let's Encrypt 免费证书
//   hs-nginx-https: Nginx HTTPS 完整配置
//   hs-reverse-proxy: 反向代理与 TLS 卸载
//   hs-hsts: HSTS 与安全头
// =============================================================

export const chapters = [
  {
    id: "hs-server-config",
    group: "HTTPS 部署实战",
    icon: "🛠️",
    title: "服务器 HTTPS 配置",
    content: `# 服务器 HTTPS 配置

## 部署 HTTPS 的三要素

部署一个 HTTPS 服务，本质上需要三样东西凑齐，缺一不可。理解这三要素，是所有后续部署工作的基础。

生活类比：开一家"加密餐厅"
- 私钥（server.key）：餐厅保险柜的唯一钥匙，只有老板自己持有，绝对不能外泄。一旦被复制，别人就能冒充你的餐厅。
- 证书（server.crt）：挂在餐厅墙上的营业执照，向每一位进门的顾客证明"我是经过认证的合法餐厅"。
- 监听 443 端口：餐厅的正门地址。HTTPS 默认走 443 端口，就像餐厅默认开在主街 443 号。顾客（浏览器）输入 https://example.com 时，会自动敲 443 号的门。

三要素详解：

1. 私钥（Private Key）
   - 本质上是一个长度足够的随机数文件，通常以 .key 或 .pem 结尾
   - 服务器用它来：解密客户端用公钥加密的握手数据、签署握手消息证明身份
   - 必须严格保密。私钥泄漏 = 攻击者可以冒充你的服务器解密所有流量
   - 常见长度：RSA 2048 位（够用）、RSA 4096 位（更安全但更慢）、ECDSA P-256（更现代）

2. 证书（Certificate）
   - 内容包括：公钥 + 域名（CN/SAN）+ 持有者信息 + 有效期 + CA 的数字签名
   - 通常以 .crt、.cer 或 .pem 结尾
   - 证书链：服务器证书 + 中间证书，需要合并成 fullchain.pem 一起发给客户端
   - 浏览器只信任"根 CA"，所以中间证书必须一并下发，否则会出现"证书链不完整"错误

3. 监听端口
   - HTTPS 默认端口 443（HTTP 是 80）
   - 开发测试时可以用其他端口（如 8443、4443），但浏览器需要显式输入端口号
   - 小于 1024 的端口（含 443）需要 root 权限或通过 setcap 授权

## 常见 Web 服务器的 HTTPS 支持

不同服务器启用 HTTPS 的方式各异，下表给出整体对比：

| 服务器 | 配置难度 | 自动 HTTPS | 默认 HTTP/2 | 适用场景 |
|--------|---------|-----------|------------|---------|
| Nginx | 中等 | 否（需 certbot） | 是 | 高并发、反向代理、静态资源 |
| Apache | 中等 | 否 | 是（2.4.17+） | 传统动态站点 |
| Caddy | 极低 | 是（默认开启） | 是 | 小型站点、个人项目 |
| Node.js | 低 | 否 | 否（需配置） | 原型开发、微服务 |
| Python | 低 | 否 | 否 | 开发调试、脚本工具 |

下面通过一系列实战 Demo，演示如何在不同环境中启用 HTTPS。

## Demo 1：用 openssl 自签证书

自签证书适合本地开发测试。浏览器会提示"不安全"，但完整的 TLS 握手流程照样能跑通，便于调试。

\`\`\`bash
# 第 1 步：生成 2048 位 RSA 私钥，输出到 server.key 文件
# genrsa  表示生成 RSA 私钥
# 2048    是密钥长度（位），2048 是目前最低安全标准
# -out    指定输出文件名
openssl genrsa -out server.key 2048

# 第 2 步：基于私钥生成自签证书，有效期 365 天
# req          表示处理证书请求
# -x509        表示直接输出自签的 X.509 证书（而不是 CSR）
# -new         表示新申请一张证书
# -key         指定刚才生成的私钥文件
# -days 365    证书有效期为 365 天
# -out         输出证书文件名
# -subj        直接在命令行指定主题信息，免去交互式输入
#   /CN=localhost  Common Name 设为 localhost
# -addext       添加 X.509 扩展字段
#   subjectAltName 是"主体可选名称"（SAN），现代浏览器主要靠它校验域名
#   DNS:localhost  表示该证书适用于域名 localhost
#   IP:127.0.0.1   表示该证书也适用于 IP 127.0.0.1
openssl req -x509 -new -key server.key -days 365 -out server.crt \\
  -subj "/CN=localhost" \\
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# 第 3 步：查看证书内容，确认信息正确
# -noout   不输出编码后的证书内容，只显示文本信息
# -text    以可读文本形式显示证书字段
openssl x509 -in server.crt -noout -text

# 第 4 步（可选）：验证私钥与证书是否匹配
# 两条命令输出的 modulus 应当完全一致
openssl rsa -in server.key -modulus -noout | openssl md5
openssl x509 -in server.crt -modulus -noout | openssl md5
\`\`\`

重要说明：
- CN（Common Name）是老式写法，现代浏览器（Chrome、Firefox）主要看 SAN 字段
- 如果不写 SAN，Chrome 会报 NET::ERR_CERT_COMMON_NAME_INVALID
- 生产环境切勿使用自签证书，用户会看到刺眼的红色警告页面

## Demo 2：Python http.server 启用 HTTPS

Python 标准库自带 http.server，配合 ssl 模块即可快速开启 HTTPS，适合局域网内临时分享文件。

\`\`\`python
# 导入标准库模块
import http.server   # 提供简单的 HTTP 服务器
import ssl           # 提供 TLS/SSL 封装能力

# 第 1 步：创建一个 SSLContext 对象
# PROTOCOL_TLS_SERVER 表示作为"服务端"使用的 TLS 协议
# 它会自动协商最高版本的 TLS（默认 TLS 1.2 / 1.3）
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

# 第 2 步：加载证书链（证书 + 私钥）
# load_cert_chain 第一个参数是证书文件，第二个是私钥文件
# 如果私钥有密码，可用 password 参数传入
ctx.load_cert_chain("server.crt", "server.key")

# 第 3 步：创建 HTTP 服务器，监听 0.0.0.0:4443
# 0.0.0.0 表示监听所有网卡（局域网可访问）
# 4443 是端口号（避开 443 的 root 权限要求）
# SimpleHTTPRequestHandler 会把当前目录作为静态文件根目录
server = http.server.HTTPServer(
    ("0.0.0.0", 4443),
    http.server.SimpleHTTPRequestHandler,
)

# 第 4 步：把原始 socket 用 SSLContext 包装成加密 socket
# server_side=True 表示这是服务端角色
server.socket = ctx.wrap_socket(server.socket, server_side=True)

# 第 5 步：开始服务，永久阻塞
# 访问 https://你的IP:4443 即可
server.serve_forever()
\`\`\`

运行后浏览器访问 https://localhost:4443，由于是自签证书会有警告，点"高级 → 继续访问"即可。

## Demo 3：Node.js HTTPS 服务器

Node.js 内置 https 模块，几行代码即可启动 HTTPS 服务，常用于微服务和原型开发。

\`\`\`javascript
// 引入 Node.js 内置模块
const https = require('https');  // HTTPS 服务器模块
const fs = require('fs');        // 文件系统模块

// 读取证书和私钥文件
// 注意：readFileSync 是同步读取，启动时只执行一次，不影响性能
const options = {
  key: fs.readFileSync('server.key'),   // 私钥文件内容
  cert: fs.readFileSync('server.crt'),  // 证书文件内容
};

// 创建 HTTPS 服务器
// createServer 第一个参数是 TLS 选项，第二个是请求处理回调
https.createServer(options, (req, res) => {
  // req 是请求对象，res 是响应对象
  // 设置 HTTP 状态码 200
  res.writeHead(200);
  // 返回响应体
  res.end('hello https');
}).listen(4443, () => {
  // listen 后的回调在服务器启动后执行
  console.log('HTTPS 服务器已启动：https://localhost:4443');
});
\`\`\`

## Demo 4：Flask + HTTPS（开发用）

Flask 的开发服务器内置 SSL 支持，只需传入证书和私钥路径即可。

\`\`\`python
# 从 flask 包导入 Flask 类
from flask import Flask

# 创建 Flask 应用实例
app = Flask(__name__)

# 定义根路由
@app.route("/")
def hello():
    # 返回字符串作为响应
    return "hello"

# 启动开发服务器
# ssl_context 接受一个元组 (证书路径, 私钥路径)
# port=4443 指定监听端口
# 注意：Flask 开发服务器不适合生产环境，仅用于调试
app.run(
    ssl_context=('server.crt', 'server.key'),
    port=4443,
)
\`\`\`

## Demo 5：文件权限保护私钥

私钥是 HTTPS 安全的根基，权限必须严格收紧。一旦其他用户可读，整个 HTTPS 加密就形同虚设。

\`\`\`bash
# chmod 600 表示：所有者可读写（6），组用户无权限（0），其他用户无权限（0）
# 这样只有 root 或文件所有者能读取私钥
chmod 600 server.key

# chown 修改文件所有者
# www-data:www-data 表示把文件所有者改为 www-data 用户和 www-data 组
# www-data 是 Debian/Ubuntu 上 Nginx/Apache 默认运行的用户
chown www-data:www-data server.key

# 验证权限
# 期望输出类似：-rw------- 1 www-data www-data ... server.key
ls -l server.key

# 进阶：把私钥集中放在专用目录，并设置目录权限
# /etc/ssl/private 是 Debian 系约定的私钥存放目录
mkdir -p /etc/ssl/private
mv server.key /etc/ssl/private/
# 目录权限 700：仅所有者可进入
chmod 700 /etc/ssl/private
\`\`\`

## Demo 6：HTTP 强制跳转 HTTPS（301 重定向）

即使部署了 HTTPS，用户可能仍输入 http:// 访问。通过 301 永久重定向，把所有 HTTP 流量转到 HTTPS。

Nginx 写法：

\`\`\`nginx
# 监听 80 端口的 HTTP 请求
server {
    listen 80;
    server_name example.com;

    # return 301 表示永久重定向
    # $host 是请求中的主机名
    # $request_uri 是完整的请求路径（含查询参数）
    # 例如 http://example.com/login?id=1 → https://example.com/login?id=1
    return 301 https://$host$request_uri;
}
\`\`\`

Apache 写法（.htaccess）：

\`\`\`apache
# 开启 Rewrite 引擎
RewriteEngine On

# 条件：HTTPS 未开启（off 表示当前是 HTTP）
RewriteCond %{HTTPS} off

# 规则：把所有请求重定向到 HTTPS 版本
# [R=301] 表示 301 永久重定向
# [L] 表示这是最后一条规则，不再继续匹配
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
\`\`\`

## 各服务器 HTTPS 配置对比表

| 服务器 | 证书配置项 | 私钥配置项 | 监听指令 |
|--------|-----------|-----------|---------|
| Nginx | ssl_certificate | ssl_certificate_key | listen 443 ssl |
| Apache | SSLCertificateFile | SSLCertificateKeyFile | Listen 443 |
| Caddy | tls 指令或自动 | tls 指令或自动 | 默认 443 |
| Node.js | options.cert | options.key | https.createServer |
| Python | load_cert_chain | load_cert_chain | HTTPServer |

## 本章小结

| 知识点 | 要点 |
|--------|------|
| HTTPS 三要素 | 私钥、证书、监听 443 端口，缺一不可 |
| 自签证书 | 仅用于开发测试，浏览器会报警告 |
| 私钥保护 | chmod 600，专人专用，绝不外泄 |
| 证书链 | 服务器证书 + 中间证书合并为 fullchain |
| SAN 字段 | 现代浏览器主要靠 SAN 校验域名，不能只写 CN |
| HTTP 跳转 | 用 301 永久重定向把 HTTP 流量导向 HTTPS |
| 服务器选型 | 生产环境推荐 Nginx/Caddy，开发用 Python/Node.js |
`
  },
  {
    id: "hs-letsencrypt",
    group: "HTTPS 部署实战",
    icon: "🆓",
    title: "Let's Encrypt 免费证书",
    content: `# Let's Encrypt 免费证书

## Let's Encrypt 简介

Let's Encrypt 是一个免费、自动化、开放的证书颁发机构（CA），由非营利组织 Internet Security Research Group（ISRG）运营。

它的出现彻底改变了 HTTPS 的普及格局。在 2015 年之前，申请一张 DV 证书每年要花费几十到几百元，而且流程繁琐。Let's Encrypt 让"HTTPS for everyone"成为现实。

三大核心理念：
- 免费：任何域名持有者都能免费申请，不收一分钱
- 自动化：通过 ACME 协议，证书申请、续期全程自动完成
- 开放：协议开源、客户端开源，任何人都能实现兼容客户端

关键参数：
- 证书类型：仅签发 DV（域名验证）证书，不签发 OV/EV
- 有效期：90 天（鼓励自动化续期）
- 速率限制：每域名每周最多 50 张证书
- 信任度：被所有主流浏览器和操作系统信任

生活类比：Let's Encrypt 就像政府开设的"免费营业执照自助办理机"——你只要证明你是这家店的老板（域名验证），机器就当场打印执照给你，90 天后到期再来续，全程无人干预。

## ACME 协议

ACME（Automatic Certificate Management Environment）是 Let's Encrypt 使用的自动化证书管理协议，RFC 8555。

ACME 签发流程简述：

1. 客户端在 Let's Encrypt 注册账户（首次使用）
2. 客户端向 Let's Encrypt 申请某域名的证书
3. Let's Encrypt 给出一个"挑战"（challenge），要求客户端证明对该域名的控制权
4. 客户端按挑战要求在指定位置放置验证文件或 DNS 记录
5. Let's Encrypt 验证挑战通过后，签发证书
6. 客户端下载证书并安装到 Web 服务器

整个过程由 certbot 等客户端工具自动完成，用户通常只需一条命令。

## 三种验证方式

| 验证方式 | 原理 | 适用场景 | 通配符支持 |
|---------|------|---------|-----------|
| HTTP-01 | 在域名根目录放验证文件 | 单域名、有 80 端口的服务器 | 否 |
| DNS-01 | 在 DNS 添加 TXT 记录 | 通配符证书、无 80 端口 | 是 |
| TLS-ALPN-01 | 用 TLS 握手特殊扩展验证 | 仅有 443 端口的服务器 | 否 |

HTTP-01 最常用：Let's Encrypt 访问 http://你的域名/.well-known/acme-challenge/随机串，看能否取到对应内容。所以你的服务器必须开放 80 端口。

DNS-01 适合通配符证书：在 _acme-challenge.你的域名 添加 TXT 记录，证明你控制该域名的 DNS。可配合 DNS 服务商 API 实现全自动。

## certbot 工具详解

certbot 是 Let's Encrypt 官方推荐的 ACME 客户端，功能最完整。下面通过 Demo 演示常见用法。

## Demo 1：安装 certbot

\`\`\`bash
# 方式一：Ubuntu/Debian 用 apt 安装
# certbot 主程序
# python3-certbot-nginx 是 Nginx 自动配置插件
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 方式二：用 snap 安装（Ubuntu 20.04+ 推荐，版本更新）
# snap 是 Canonical 推出的包管理器
# --classic 表示使用经典隔离模式（certbot 需要访问系统配置）
sudo snap install --classic certbot

# 方式三：用 Docker 运行（不污染系统环境）
# 把 Nginx 配置和证书目录挂载进容器
docker run -it --rm \\
  -v /etc/letsencrypt:/etc/letsencrypt \\
  -v /var/www/html:/var/www/html \\
  -p 80:80 \\
  certbot/certbot certonly --standalone

# 验证安装
certbot --version
\`\`\`

## Demo 2：HTTP-01 验证签发证书

\`\`\`bash
# 最常用的命令：自动完成一切
# --nginx           使用 Nginx 插件，自动修改配置
# -d example.com    为该域名申请证书
# -d www.example.com 同时为该子域名申请（多域名一张证书）
sudo certbot --nginx -d example.com -d www.example.com

# 执行过程中 certbot 会：
# 1. 检查 Nginx 配置，确认 server_name 匹配
# 2. 在 Nginx 临时配置 .well-known/acme-challenge 路径
# 3. Let's Encrypt 服务器访问该路径验证域名
# 4. 验证通过后下载证书到 /etc/letsencrypt/live/example.com/
# 5. 自动修改 Nginx 配置启用 HTTPS
# 6. 自动配置 HTTP 80 → 443 跳转
# 7. 自动设置续期定时任务

# 证书文件位置说明
# /etc/letsencrypt/live/example.com/fullchain.pem  完整证书链
# /etc/letsencrypt/live/example.com/privkey.pem   私钥
# /etc/letsencrypt/live/example.com/cert.pem      仅服务器证书
# /etc/letsencrypt/live/example.com/chain.pem     中间证书链
\`\`\`

## Demo 3：DNS-01 验证（适合通配符证书）

通配符证书（*.example.com）只能用 DNS-01 验证，因为它要证明你对整个域名的 DNS 有控制权。

\`\`\`bash
# --manual          手动模式（不自动修改服务器配置）
# --preferred-challenges dns  指定用 DNS-01 验证
# -d "*.example.com"  申请通配符证书，覆盖所有一级子域名
# -d example.com      同时覆盖主域名
sudo certbot certonly --manual --preferred-challenges dns \\
  -d "*.example.com" -d example.com

# certbot 会输出类似提示：
# Please deploy a DNS TXT record under the name
# _acme-challenge.example.com with the following value:
# abc123XYZ_random_string_here
#
# Before continuing, verify the record is deployed.

# 这时你需要去 DNS 服务商后台添加 TXT 记录：
# 记录类型：TXT
# 主机记录：_acme-challenge
# 记录值：  abc123XYZ_random_string_here

# 用 dig 验证 DNS 是否生效
# +short 只输出简短结果
dig +short TXT _acme-challenge.example.com

# 看到 abc123XYZ_random_string_here 表示已生效
# 回到 certbot 按 Enter 继续，它会去验证

# 进阶：配合 Cloudflare API 实现全自动 DNS-01
# 安装 certbot-dns-cloudflare 插件
sudo apt install -y python3-certbot-dns-cloudflare
# 配置 API 凭证
# 文件内容：
# dns_cloudflare_api_token = 你的API令牌
sudo nano /etc/letsencrypt/cloudflare.ini
sudo chmod 600 /etc/letsencrypt/cloudflare.ini
# 全自动申请通配符证书
sudo certbot certonly \\
  --dns-cloudflare \\
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \\
  -d "*.example.com" -d example.com
\`\`\`

## Demo 4：自动续期（cron / systemd timer）

Let's Encrypt 证书有效期 90 天，必须定期续期。certbot 安装时通常会自动配置续期任务，但建议手动确认。

\`\`\`bash
# 第 1 步：测试续期流程（不会真正续期，只是模拟）
# --dry-run 表示模拟运行，不实际申请
sudo certbot renew --dry-run

# 第 2 步：查看自动续期任务是否已配置
# 现代 certbot 安装时会自动创建 systemd timer
systemctl list-timers | grep certbot

# 第 3 步：如果用 cron（老式系统）
# 每天凌晨 3 点检查并续期
# --quiet 静默模式，不输出日志
# --post-hook 续期成功后执行的命令（重载 Nginx 使新证书生效）
echo "0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" \\
  | sudo tee /etc/cron.d/certbot

# 第 4 步：查看证书到期时间
# --list-certificates 列出所有已安装的证书
sudo certbot certificates

# 第 5 步：手动强制续期（紧急情况）
# --force-renewal 强制续期，即使没到期
sudo certbot renew --force-renewal
sudo systemctl reload nginx
\`\`\`

续期原理：certbot renew 会检查所有已安装证书，距离到期 30 天内的才会真正续期。所以每天跑一次没问题，不会浪费配额。

## Demo 5：用 webroot 模式签发（不修改 Nginx 配置）

如果你不想让 certbot 动你的 Nginx 配置，可以用 webroot 模式。它只把验证文件放到指定目录，证书申请完后你自己手动配置 Nginx。

\`\`\`bash
# --webroot        使用 webroot 模式
# -w /var/www/html 指定网站根目录
# certbot 会在 /var/www/html/.well-known/acme-challenge/ 下放验证文件
# -d example.com   申请该域名证书
sudo certbot certonly --webroot -w /var/www/html -d example.com

# Nginx 需要保证 .well-known 路径可访问
# 配置示例：
# location /.well-known/acme-challenge/ {
#     root /var/www/html;
# }

# webroot 模式适合：
# - Nginx 配置复杂，不想被自动修改
# - 多个服务共用一个证书
# - 需要精确控制证书安装位置
\`\`\`

## Demo 6：用 acme.sh 替代 certbot（更轻量）

acme.sh 是一个纯 Shell 实现的 ACME 客户端，比 certbot 更轻量，不依赖 Python，适合资源受限的服务器。

\`\`\`bash
# 第 1 步：安装 acme.sh
# 一键安装脚本，会自动注册账号并设置 cron
curl https://get.acme.sh | sh
# 安装后可执行文件在 ~/.acme.sh/acme.sh

# 第 2 步：用 webroot 模式申请证书
# --issue      表示申请证书
# -d           指定域名
# --webroot    指定网站根目录
~/.acme.sh/acme.sh --issue -d example.com --webroot /var/www/html

# 第 3 步：安装证书到指定位置并设置自动重载
# --install-cert     安装证书到指定路径
# --key-file         私钥安装路径
# --fullchain-file   完整证书链安装路径
# --reloadcmd        证书更新后执行的命令
~/.acme.sh/acme.sh --install-cert -d example.com \\
  --key-file       /etc/ssl/private/example.key \\
  --fullchain-file /etc/ssl/certs/example.crt \\
  --reloadcmd      "systemctl reload nginx"

# 第 4 步：用 DNS API 自动申请通配符证书（以 Cloudflare 为例）
# 先导出环境变量
export CF_Token="你的Cloudflare_API_Token"
export CF_Zone_ID="你的Zone_ID"
# 申请通配符证书
~/.acme.sh/acme.sh --issue --dns dns_cf -d "*.example.com" -d example.com

# 第 5 步：查看已安装证书
~/.acme.sh/acme.sh --list

# 第 6 步：升级 acme.sh 自身
~/.acme.sh/acme.sh --upgrade
\`\`\`

acme.sh 优势：
- 纯 Shell 实现，无 Python 依赖
- 支持所有 ACME v2 CA（Let's Encrypt、ZeroSSL、Buypass 等）
- 内置 150+ DNS 服务商 API 支持
- 自动续期 cron 由安装脚本配置

## Demo 7：Let's Encrypt 速率限制说明

Let's Encrypt 对申请频率有严格限制，避免滥用。了解这些限制能避免生产事故。

\`\`\`text
主要速率限制（截至文档编写时）：

1. 每个注册域名每周 50 张证书
   - 例如 example.com 的所有子域共享 50 张/周
   - 超过会报 "too many certificates" 错误

2. 重复证书限制：每周 5 张相同域名集合的证书
   - 同一组域名反复申请，一周最多 5 次
   - 防止误操作刷爆配额

3. 验证失败限制：每小时 5 次失败
   - DNS-01 验证 TXT 记录没生效就提交，会消耗配额

4. 每账户每小时 300 次请求
   - API 调用频率限制

5. 续期不受限制（到期前 30 天内 renew 不算新申请）

应对策略：
- 续期用 certbot renew，不要手动反复申请
- 测试务必加 --dry-run（走 staging 环境，不消耗配额）
- Staging 环境：https://acme-staging-v02.api.letsencrypt.org
  签发的证书不受信任，但不限速率，适合调试
\`\`\`

切换到 staging 环境测试：

\`\`\`bash
# 用 staging 环境测试，不消耗正式配额
# --staging 表示使用 Let's Encrypt 的测试环境
sudo certbot --nginx --staging -d example.com

# 测试 OK 后再切回正式环境
sudo certbot --nginx -d example.com
\`\`\`

## 三种验证方式对比表

| 特性 | HTTP-01 | DNS-01 | TLS-ALPN-01 |
|------|---------|--------|-------------|
| 端口要求 | 80 | 无 | 443 |
| 通配符 | 不支持 | 支持 | 不支持 |
| 自动化 | 容易 | 需 DNS API | 中等 |
| 适用场景 | 标准网站 | 通配符、内网 | 仅 443 服务器 |
| 验证文件位置 | 网站根目录 | DNS TXT 记录 | TLS 握手 |
| 防火墙要求 | 开放 80 | 仅需 DNS | 开放 443 |

## 本章小结

| 知识点 | 要点 |
|--------|------|
| Let's Encrypt | 免费、自动化、开放的 CA，签发 DV 证书 |
| 证书有效期 | 90 天，需自动续期 |
| ACME 协议 | 自动化证书管理协议，RFC 8555 |
| HTTP-01 | 最常用，需开放 80 端口，不支持通配符 |
| DNS-01 | 支持通配符，需 DNS API 实现全自动 |
| certbot | 官方推荐客户端，支持 Nginx/Apache 插件 |
| acme.sh | 轻量纯 Shell 客户端，无 Python 依赖 |
| 速率限制 | 每域名每周 50 张，测试务必用 --dry-run |
| 续期 | certbot renew 距到期 30 天内才真正续期 |
| Staging | 测试环境不限速，证书不受信任 |
`
  },
  {
    id: "hs-nginx-https",
    group: "HTTPS 部署实战",
    icon: "⚙️",
    title: "Nginx HTTPS 完整配置",
    content: `# Nginx HTTPS 完整配置

Nginx 是生产环境部署 HTTPS 的首选 Web 服务器，性能优异、配置灵活、生态成熟。本章是部署实战的核心章节，将给出从基础到生产级的完整配置。

生活类比：Nginx 配置 HTTPS 就像给银行金库装配安保系统——不仅要装大门（监听 443），还要选最先进的锁（TLS 版本）、最强的防盗材料（密码套件）、并保留访客通行证（会话复用）以提升效率。

## Demo 1：基础 HTTPS 配置

最小可用的 HTTPS 配置，适合入门理解。

\`\`\`nginx
# server 块定义一个虚拟主机
server {
    # listen 443 ssl http2
    #   443    监听 443 端口（HTTPS 默认端口）
    #   ssl    启用 SSL/TLS
    #   http2  启用 HTTP/2 协议（多路复用，性能更好）
    listen 443 ssl http2;

    # server_name 指定该虚拟主机响应的域名
    # 浏览器通过 SNI 告知服务器要访问哪个域名
    server_name example.com;

    # ssl_certificate 指定完整证书链文件
    # fullchain.pem 包含服务器证书 + 中间证书
    # 必须用 fullchain 而不是 cert，否则部分客户端报"证书链不完整"
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

    # ssl_certificate_key 指定私钥文件
    # privkey.pem 是私钥，权限必须收紧（chmod 600）
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # location / 匹配所有请求路径
    location / {
        # proxy_pass 把请求转发到后端服务
        # 这里转发到本机 8000 端口的应用
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

这就是最基础的 HTTPS 配置。但生产环境绝不能只配这些，下面逐步加强安全性。

## Demo 2：安全的 TLS 配置（Mozilla Intermediate 兼容性）

Mozilla 维护了一套 SSL 配置最佳实践，分为三个级别：
- Modern：只支持 TLS 1.3，最安全但兼容性差
- Intermediate：支持 TLS 1.2/1.3，兼容大多数客户端（推荐）
- Old：支持老古董浏览器（WinXP、Java 6）

下面是 Intermediate 级别配置：

\`\`\`nginx
# 只允许 TLS 1.2 和 1.3
# TLS 1.0/1.1 已被废弃，存在安全漏洞（BEAST、POODLE）
ssl_protocols TLSv1.2 TLSv1.3;

# ssl_prefer_server_ciphers on
# 表示由服务器优先选择密码套件（而非客户端）
# 这样可以强制使用更安全的套件
ssl_prefer_server_ciphers on;

# ssl_ciphers 指定允许的密码套件列表
# 用冒号分隔，按优先级排序
# ECDHE 表示椭圆曲线 Diffie-Hellman 临时密钥交换（提供前向保密）
# ECDSA/RSA 是签名算法
# AES128-GCM 是对称加密算法（GCM 模式提供认证加密）
# SHA256 是 MAC 算法
# 推荐配置参考 Mozilla Intermediate
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;

# 会话缓存：复用已建立的 TLS 会话，避免重复握手
# shared:SSL:10m 表示所有 worker 共享 10MB 缓存
# 1MB 约可存 4000 个会话
ssl_session_cache shared:SSL:10m;

# 会话超时：缓存的会话 1 天后失效
ssl_session_timeout 1d;

# 关闭会话票据（session tickets）
# 票据存在前向保密问题，且实现各不相同，建议关闭
ssl_session_tickets off;

# 椭圆曲线配置（用于 ECDHE 密钥交换）
# X25519 是现代曲线，secp384r1 是兼容性曲线
ssl_ecdh_curve X25519:secp384r1;
\`\`\`

## Demo 3：完整生产配置（含 OCSP Stapling + HSTS + 安全头）

生产环境完整配置，包含所有安全增强项。这是本章核心内容，建议直接参考使用。

\`\`\`nginx
# ============================================================
# HTTPS 主服务器块（生产级）
# ============================================================
server {
    # 监听 443 端口，启用 SSL 和 HTTP/2
    listen 443 ssl http2;

    # 启用 IPv6（如有）
    listen [::]:443 ssl http2;

    # 域名
    server_name example.com;

    # ---------- 证书配置 ----------
    # 完整证书链（服务器证书 + 中间证书）
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    # 私钥
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # ---------- TLS 版本与密码套件 ----------
    # 仅允许 TLS 1.2 和 1.3
    ssl_protocols TLSv1.2 TLSv1.3;
    # 服务器优先选择密码套件
    ssl_prefer_server_ciphers on;
    # Mozilla Intermediate 推荐密码套件
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    # 椭圆曲线
    ssl_ecdh_curve X25519:secp384r1;

    # ---------- 会话复用 ----------
    # 共享会话缓存 10MB
    ssl_session_cache shared:SSL:10m;
    # 会话超时 1 天
    ssl_session_timeout 1d;
    # 关闭会话票据
    ssl_session_tickets off;

    # ---------- OCSP Stapling ----------
    # OCSP Stapling：服务器主动查询证书吊销状态并下发给客户端
    # 好处：客户端无需自己查询 OCSP，加快握手、保护隐私
    ssl_stapling on;
    ssl_stapling_verify on;
    # 信任的 CA 证书链（用于验证 OCSP 响应签名）
    # 通常和 ssl_certificate 用同一个 fullchain.pem
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    # DNS 解析器（OCSP 查询需要）
    # valid=300s 表示 DNS 结果缓存 300 秒
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    # 解析器超时
    resolver_timeout 5s;

    # ---------- HSTS 安全头 ----------
    # Strict-Transport-Security：强制浏览器今后只用 HTTPS 访问
    # max-age=31536000    缓存 1 年（单位秒）
    # includeSubDomains   覆盖所有子域名
    # preload             允许加入浏览器内置 preload list
    # always              即使是 4xx/5xx 响应也附加该头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # ---------- 其他安全头 ----------
    # X-Frame-Options 防止点击劫持（页面被 iframe 嵌入）
    # SAMEORIGIN 仅允许同源 iframe
    add_header X-Frame-Options "SAMEORIGIN" always;
    # X-Content-Type-Options 防止 MIME 嗅探
    # nosniff 强制浏览器遵守 Content-Type
    add_header X-Content-Type-Options "nosniff" always;
    # Referrer-Policy 控制 Referer 头泄露
    # strict-origin-when-cross-origin 跨域只发 origin 不含路径
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # CSP 内容安全策略，限制资源加载来源
    # default-src 'self' 默认只允许同源资源
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'" always;

    # ---------- 反向代理 ----------
    location / {
        # 转发到后端应用
        proxy_pass http://127.0.0.1:8000;
        # 透传原始 Host 头
        proxy_set_header Host $host;
        # 透传客户端真实 IP（而非 Nginx 的 IP）
        proxy_set_header X-Real-IP $remote_addr;
        # 透传完整的 X-Forwarded-For 链
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # 通知后端客户端原始协议是 https
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ============================================================
# HTTP 80 端口 → 强制跳转 HTTPS
# ============================================================
server {
    listen 80;
    listen [::]:80;
    server_name example.com;

    # 301 永久重定向到 HTTPS
    # $host 是请求头中的 Host
    # $request_uri 是完整请求路径（含查询参数）
    return 301 https://$host$request_uri;
}
\`\`\`

## Demo 4：HTTP/2 启用

HTTP/2 相比 HTTP/1.1 有重大性能提升：多路复用、头部压缩、服务器推送。Nginx 1.9.5+ 内置支持。

\`\`\`nginx
# 启用 HTTP/2 只需在 listen 后加 http2 参数
server {
    listen 443 ssl http2;
    server_name example.com;
    # ... 其余配置同上
}

# 注意事项：
# 1. HTTP/2 必须基于 TLS（浏览器不支持明文 HTTP/2）
# 2. Nginx 1.25.1+ 推荐用独立指令 http2 on;
#    例如：listen 443 ssl; http2 on;
# 3. HTTP/2 不支持 ssl_prefer_server_ciphers（由客户端选择）

# 验证 HTTP/2 是否生效
# 用 curl 加 --http2 参数
# curl --http2 -I https://example.com
# 响应头应包含：HTTP/2 200
\`\`\`

## Demo 5：HTTP/3 启用（实验性，需 quic 模块）

HTTP/3 基于 QUIC 协议（UDP），比 HTTP/2 更快、抗丢包更强。Nginx 1.25.0+ 实验性支持。

\`\`\`nginx
# Nginx 1.25.0+ 启用 HTTP/3
server {
    # 同时监听 TCP 443 和 UDP 443
    # quic        表示启用 QUIC（HTTP/3）
    # reuseport   多 worker 共享 UDP 端口
    listen 443 ssl;
    listen 443 quic reuseport;
    # 启用 HTTP/3
    http3 on;
    server_name example.com;

    # 证书、密码套件等配置同上
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Alt-Svc 头：告知浏览器该站点支持 HTTP/3
    # 浏览器下次会优先用 HTTP/3（UDP 443）
    add_header Alt-Svc 'h3=":443"; ma=86400' always;

    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}

# 注意：
# 1. HTTP/3 走 UDP，需在防火墙放行 UDP 443
# 2. Nginx 需编译时带 --with-http_v3_module
# 3. 当前仍属实验性，建议充分测试后再上生产
# 4. 客户端（Chrome/Firefox）会自动降级到 HTTP/2 兜底
\`\`\`

## Demo 6：多域名 SNI 配置

一台服务器托管多个域名，每个域名用独立证书，靠 SNI（Server Name Indication）区分。

\`\`\`nginx
# 域名 A 的虚拟主机
server {
    listen 443 ssl http2;
    server_name a.com;

    # a.com 专用证书
    ssl_certificate /etc/letsencrypt/live/a.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/a.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8001;
    }
}

# 域名 B 的虚拟主机
server {
    listen 443 ssl http2;
    server_name b.com;

    # b.com 专用证书
    ssl_certificate /etc/letsencrypt/live/b.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/b.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8002;
    }
}

# SNI 原理：
# 客户端在 TLS 握手 ClientHello 阶段就带上目标域名（SNI 扩展）
# Nginx 根据 SNI 选择对应的 server 块和证书
# 没有 SNI（老客户端）只能用默认 server 块的证书
\`\`\`

SNI 注意事项：
- 所有现代浏览器都支持 SNI
- Windows XP + IE6/IE7 不支持 SNI（已淘汰）
- Nginx 默认第一个 server 块是默认证书（兜底）

## Demo 7：测试配置并重载

修改 Nginx 配置后，必须先测试再重载，避免语法错误导致服务中断。

\`\`\`bash
# 第 1 步：测试配置语法
# nginx -t 会检查所有配置文件
# 输出 "test is successful" 表示语法 OK
sudo nginx -t

# 第 2 步：平滑重载（不停机）
# nginx -s reload 发送 HUP 信号给 master 进程
# master 会启动新 worker 处理新连接，老 worker 处理完现有连接后退出
sudo nginx -s reload

# 第 3 步：验证 HTTPS 配置（外部工具）
# 用 OpenSSL 测试握手
# -connect 连接目标
# -servername 指定 SNI
# -tls1_2 强制用 TLS 1.2
openssl s_client -connect example.com:443 -servername example.com -tls1_2 < /dev/null

# 第 4 步：在线测试
# SSL Labs：https://www.ssllabs.com/ssltest/
# 目标评级 A 或 A+
# Mozilla Observatory：https://observatory.mozilla.org/

# 第 5 步：检查证书信息
# -showcerts 显示完整证书链
openssl s_client -connect example.com:443 -showcerts < /dev/null

# 第 6 步：查看 HTTP 响应头
# -I 仅获取响应头
# -H 自定义请求头
curl -I https://example.com
\`\`\`

## Mozilla SSL Configuration Generator 介绍

Mozilla 官方提供在线配置生成器，输入服务器软件和版本，自动生成最佳实践配置。

网址：https://ssl-config.mozilla.org/

使用方法：
1. 选择服务器软件（Nginx、Apache、HAProxy 等）
2. 选择版本
3. 选择安全级别（Modern、Intermediate、Old）
4. 复制生成的配置

三个级别适用场景：
- Modern：只支持 TLS 1.3，面向现代浏览器（Firefox 63+、Chrome 70+）
- Intermediate：支持 TLS 1.2/1.3，兼容绝大多数客户端（推荐）
- Old：支持 TLS 1.0+，兼容老古董（WinXP、Java 6）

建议直接以生成器输出为起点，再按需调整。

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 基础配置 | listen 443 ssl http2 + 证书 + 私钥 |
| TLS 版本 | 仅 TLS 1.2/1.3，禁用 1.0/1.1 |
| 密码套件 | 用 Mozilla Intermediate 推荐，优先 ECDHE |
| 会话复用 | shared:SSL:10m + timeout 1d，关闭 tickets |
| OCSP Stapling | 服务器代查吊销状态，加快握手、保护隐私 |
| HSTS | max-age=31536000 + includeSubDomains + preload |
| 安全头 | X-Frame-Options、X-Content-Type-Options、CSP |
| HTTP/2 | listen 443 ssl http2，基于 TLS |
| HTTP/3 | 基于 QUIC(UDP)，需 1.25.0+，实验性 |
| SNI | 多域名单 IP，靠 ClientHello 中的 SNI 区分 |
| 配置测试 | nginx -t 测试，nginx -s reload 平滑重载 |
| 配置生成 | ssl-config.mozilla.org 在线生成最佳实践 |
`
  },
  {
    id: "hs-reverse-proxy",
    group: "HTTPS 部署实战",
    icon: "🔀",
    title: "反向代理与 TLS 卸载",
    content: `# 反向代理与 TLS 卸载

## 反向代理与 TLS 终止（TLS Termination）

在中小型架构中，HTTPS 通常不直接由后端应用处理，而是由前端的反向代理（如 Nginx）统一处理 TLS 握手，再用明文 HTTP 转发给后端。这种模式叫"TLS 终止"或"TLS 卸载"。

部署架构图：

\`\`\`text
客户端浏览器 ──HTTPS──> Nginx（TLS 终止）──HTTP──> 后端应用
            加密传输              内网明文传输
\`\`\`

生活类比：TLS 卸载就像大型写字楼的"前台统一接待"
- 客户（浏览器）在大门口要刷卡验证身份（TLS 握手）
- 前台（Nginx）统一负责接待、验证、登记
- 验证通过后，前台用内部对讲机（HTTP）通知楼层里的员工（后端应用）
- 员工不需要每个人都配一个门禁读卡器，省事高效

## TLS 卸载的优点

1. 性能优势
   - Nginx 用 C 写的 TLS 实现，比应用层（Python/Node.js）快得多
   - 硬件加速（AES-NI 指令）让 Nginx 加解密近乎零成本
   - 后端应用专注业务逻辑，不被加解密拖累

2. 证书集中管理
   - 所有域名证书统一放在 Nginx，一处更新、处处生效
   - 续期时只需重载 Nginx，不用重启多个后端服务
   - 避免"证书到期但忘了某个服务"的运维事故

3. 简化后端
   - 后端用明文 HTTP，开发调试方便
   - 不需要为每个后端服务都申请证书
   - 后端可以监听任意端口（不一定是 443）

## 安全考量

TLS 卸载也有风险，需权衡：

- 内网可信场景：Nginx 与后端在同一内网/同一主机，明文传输风险低
- 跨网络场景：Nginx 与后端跨公网，明文传输有被窃听风险
- 合规要求：金融、医疗等可能强制端到端加密
- 零信任架构：任何网络都不可信，需要 Nginx → 后端也加密

## Demo 1：Nginx 反向代理 HTTPS → HTTP

最经典的 TLS 卸载配置。

\`\`\`nginx
server {
    # 监听 443 端口，启用 SSL
    listen 443 ssl http2;
    server_name example.com;

    # 证书和私钥
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        # proxy_pass 转发到后端
        # 注意这里是 http://（明文），TLS 在 Nginx 这里终止
        proxy_pass http://127.0.0.1:8000;

        # 通知后端：客户端原始协议是 https
        # $scheme 在这里固定为 "https"
        proxy_set_header X-Forwarded-Proto $scheme;

        # 透传真实客户端 IP
        proxy_set_header X-Real-IP $remote_addr;

        # 透传完整 X-Forwarded-For 链
        # $proxy_add_x_forwarded_for 会在已有 XFF 后追加 $remote_addr
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 透传 Host 头，后端需要知道访问的是哪个域名
        proxy_set_header Host $host;
    }
}
\`\`\`

## Demo 2：后端获取真实客户端 IP 和协议

后端应用看到的请求来源是 Nginx 的 IP（如 127.0.0.1），需要从 X-Forwarded-* 头中还原真实信息。

\`\`\`python
# FastAPI 示例
from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/")
def root(request: Request):
    # 从 X-Forwarded-For 获取真实客户端 IP
    # XFF 格式：client, proxy1, proxy2
    # 第一个值是最原始的客户端 IP
    xff = request.headers.get("X-Forwarded-For", "")
    real_ip = xff.split(",")[0].strip() if xff else request.client.host

    # 从 X-Forwarded-Proto 获取真实协议
    # 值为 "https" 或 "http"
    proto = request.headers.get("X-Forwarded-Proto", "http")

    # 从 X-Real-IP 获取（Nginx 专设的真实 IP 头）
    real_ip_alt = request.headers.get("X-Real-IP", "")

    return {
        "real_ip": real_ip,
        "real_ip_alt": real_ip_alt,
        "proto": proto,
        "host": request.headers.get("Host", ""),
    }

# 重要提醒：
# 1. X-Forwarded-For 可被伪造，必须只信任自己控制的代理设置的头
# 2. Nginx 应过滤掉客户端伪造的 XFF，用 proxy_set_header 覆盖
# 3. 后端框架（如 Express、Django）通常有 trust proxy 配置
\`\`\`

## Demo 3：端到端加密（Nginx → 后端也用 HTTPS）

当 Nginx 与后端跨不可信网络，或合规要求端到端加密时，后端也要用 HTTPS。

\`\`\`nginx
location / {
    # 注意这里是 https://（加密）
    proxy_pass https://backend.internal:8443;

    # 如果后端启用了客户端证书认证（mTLS），需配置客户端证书
    # proxy_ssl_certificate       Nginx 作为客户端出示的证书
    proxy_ssl_certificate /path/client-cert.pem;
    # proxy_ssl_certificate_key    对应私钥
    proxy_ssl_certificate_key /path/client-key.pem;

    # 验证后端服务器证书（防止连到伪造后端）
    proxy_ssl_verify on;
    # 信任的 CA 证书（签发后端证书的 CA）
    proxy_ssl_trusted_certificate /path/ca.pem;
    # 验证深度（中间证书层数）
    proxy_ssl_verify_depth 2;

    # 指定后端使用的 TLS 版本
    proxy_ssl_protocols TLSv1.2 TLSv1.3;

    # 透传常规头
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
\`\`\`

端到端加密注意点：
- 后端服务也要配置 HTTPS（自签证书或内网 CA 签发）
- 双向 TLS（mTLS）可强制后端验证 Nginx 身份，防止未授权访问
- 性能开销比明文大，仅在必要时使用

## Demo 4：多后端负载均衡 + TLS

Nginx 前端统一 TLS，后端用 upstream 做负载均衡。

\`\`\`nginx
# upstream 定义后端服务器组
# Nginx 默认轮询（round-robin）分配请求
upstream backend {
    # 3 台后端服务器
    server 10.0.0.1:8000;
    server 10.0.0.2:8000;
    server 10.0.0.3:8000;

    # 可选：加权轮询（权重越高分配越多）
    # server 10.0.0.1:8000 weight=3;
    # server 10.0.0.2:8000 weight=1;

    # 可选：健康检查（仅 Nginx Plus 商业版）
    # health_check interval=10s;

    # 可选：保持长连接到后端，减少 TCP 握手开销
    # keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        # 转发到 upstream 组
        proxy_pass http://backend;

        # 透传必要的头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 长连接到后端（配合 upstream keepalive）
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
\`\`\`

## Demo 5：Cloudflare 模式（CDN + 回源 HTTPS）

Cloudflare 等 CDN 在客户端和源站之间加了一层，架构变成：

\`\`\`text
用户浏览器 ──HTTPS──> Cloudflare CDN ──HTTPS──> 你的源站 Nginx
\`\`\`

CDN 模式的 TLS 卸载特点：
- 客户端到 CDN：用 Cloudflare 的证书（免费 Universal SSL）
- CDN 到源站：可选 Flexible（HTTP）/ Full（HTTPS 不验证）/ Full Strict（HTTPS 验证证书）

\`\`\`nginx
# 源站 Nginx 配置（Full Strict 模式）
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 仅允许 Cloudflare IP 访问（防止用户绕过 CDN 直连源站）
    # Cloudflare IPv4 段（示例，需从官方文档获取最新）
    allow 173.245.48.0/20;
    allow 103.21.244.0/22;
    allow 103.22.200.0/22;
    # ... 其他 Cloudflare IP 段
    deny all;

    location / {
        proxy_pass http://127.0.0.1:8000;
        # 从 Cloudflare 头获取真实客户端 IP
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

Cloudflare 三种 SSL 模式对比：

| 模式 | 用户→CDN | CDN→源站 | 安全性 |
|------|---------|---------|--------|
| Flexible | HTTPS | HTTP | 低（CDN 到源站明文） |
| Full | HTTPS | HTTPS（不验证证书） | 中 |
| Full Strict | HTTPS | HTTPS（验证证书） | 高 |

## Demo 6：用 X-Forwarded-Proto 通知后端协议

X-Forwarded-Proto（XFP）头看似不起眼，却是避免重定向循环的关键。

\`\`\`text
重定向循环问题场景：
1. 用户访问 https://example.com/login
2. Nginx TLS 卸载后，用 HTTP 转发到后端
3. 后端框架发现"请求是 HTTP"，于是 301 跳转到 HTTPS 版本
4. 跳转回 https://example.com/login
5. 又到第 2 步……死循环
\`\`\`

解决方案：Nginx 透传 X-Forwarded-Proto，后端信任该头。

\`\`\`nginx
# Nginx 必须设置
proxy_set_header X-Forwarded-Proto $scheme;
\`\`\`

后端配置示例（Express.js）：

\`\`\`javascript
const express = require('express');
const app = express();

// trust proxy 表示信任反向代理设置的头
// 1 表示信任第一层代理（Nginx）
// 这样 req.protocol 会返回 X-Forwarded-Proto 的值
app.set('trust proxy', 1);

app.get('/login', (req, res) => {
    // req.protocol 现在正确返回 "https"
    // 而不是错误的 "http"
    console.log('协议：', req.protocol);
    console.log('安全：', req.secure); // true
    res.send('login page');
});

app.listen(8000);
\`\`\`

后端配置示例（Django）：

\`\`\`python
# settings.py
# 信任 Nginx 设置的 X-Forwarded-Proto 头
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# 强制 HTTPS（仅在 DEBUG=False 时生效）
SECURE_SSL_REDIRECT = True
\`\`\`

## TLS 终止位置对比表

| 终止位置 | 架构 | 优点 | 缺点 | 适用场景 |
|---------|------|------|------|---------|
| 前端 Nginx | 客户端→HTTPS→Nginx→HTTP→后端 | 性能好、证书集中 | 内网明文 | 内网可信、中小站点 |
| 中间 LB | 客户端→HTTPS→LB→HTTP→后端 | 同上，且 LB 可负载均衡 | 同上 | 多后端、云环境 |
| 后端应用 | 客户端→HTTPS→Nginx→HTTPS→后端 | 端到端加密、零信任 | 性能开销大、证书分散 | 金融、医疗、合规 |
| CDN 边缘 | 客户端→HTTPS→CDN→HTTPS→源站 | 抗 DDoS、全球加速 | 配置复杂 | 高流量、跨国站点 |

## 本章小结

| 知识点 | 要点 |
|--------|------|
| TLS 卸载 | Nginx 终止 TLS，用明文 HTTP 转发后端 |
| 优点 | 性能好、证书集中管理、简化后端 |
| 安全考量 | 内网可信可卸载，跨网/合规需端到端加密 |
| X-Forwarded-Proto | 通知后端真实协议，避免重定向循环 |
| X-Forwarded-For | 透传真实客户端 IP 链 |
| 端到端加密 | proxy_pass https:// + mTLS 双向认证 |
| 负载均衡 | upstream + 多后端，支持加权轮询 |
| Cloudflare | CDN 边缘终止 TLS，回源可选 HTTPS 模式 |
| trust proxy | 后端必须正确配置信任代理头 |
| mTLS | 双向证书认证，零信任架构必备 |
`
  },
  {
    id: "hs-hsts",
    group: "HTTPS 部署实战",
    icon: "🛡️",
    title: "HSTS 与安全头",
    content: `# HSTS 与安全头

## HSTS（HTTP Strict Transport Security）原理

HSTS 是一个 HTTP 响应头，用来告诉浏览器："这个域名以后只能用 HTTPS 访问，绝不要用 HTTP。"

它解决的是 HTTPS 部署后"最后一公里"的安全隐患。

生活类比：HSTS 就像给老顾客发一张"会员卡"
- 第一次进店（首次访问），你正常接待，临走时塞给他一张会员卡（HSTS 头）
- 会员卡上写着："本店今后只从正门（HTTPS）接待，请勿再走侧门（HTTP）"
- 顾客下次想走侧门时，自己就会纠正方向，直奔正门
- 即使有人冒充店员说"今天侧门有优惠"（SSL Strip 攻击），顾客也不会上当

## 为什么需要 HSTS：防止 SSL Strip 攻击

即使部署了 HTTPS，仍存在一种叫 SSL Strip（SSL 剥离）的中间人攻击。

攻击场景：

\`\`\`text
正常情况（无 HSTS）：
1. 用户在地址栏输入 example.com（没加 https://）
2. 浏览器先发 HTTP 请求到 http://example.com
3. 服务器 301 跳转到 https://example.com
4. 后续走 HTTPS

SSL Strip 攻击：
1. 用户在地址栏输入 example.com
2. 浏览器发 HTTP 请求（明文！）
3. 中间人拦截这个 HTTP 请求
4. 中间人代替用户访问 https://example.com（正常 HTTPS）
5. 中间人把响应内容用 HTTP 返回给用户
6. 用户看到的是 HTTP 页面，但以为正常
7. 中间人可以篡改页面内容、窃取表单数据
\`\`\`

问题根源：第一次 HTTP 请求是明文的，中间人可在这一步动手脚。

HSTS 的作用：浏览器记住该域名"必须 HTTPS"后，第一次输入域名时也会直接走 HTTPS，跳过那个危险的 HTTP 步骤。

## HSTS 头字段

\`\`\`text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

三个参数详解：

1. max-age（必填）
   - 单位：秒
   - 浏览器记住"必须 HTTPS"的时长
   - 31536000 = 1 年（推荐）
   - 过期前每次访问都会刷新计时

2. includeSubDomains（可选）
   - 该策略覆盖所有子域名
   - 例如 example.com 设了，则 a.example.com、b.example.com 也强制 HTTPS
   - 慎用：如果有子域名只支持 HTTP（如内网工具），设了会导致无法访问

3. preload（可选）
   - 声明愿意加入浏览器内置的 HSTS preload list
   - 加入后，用户首次访问就直接走 HTTPS（无需先访问过一次）
   - 这是解决"第一次访问"漏洞的终极方案

## Demo 1：Nginx 配置 HSTS

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # HSTS 头
    # max-age=31536000      缓存 1 年（31536000 秒 = 365 天）
    # includeSubDomains     覆盖所有子域名
    # preload               允许加入 preload list
    # always                即使 4xx/5xx 响应也附加该头（重要！）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}

# HTTP 跳转（首次访问仍需）
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
\`\`\`

注意：HSTS 头只能在 HTTPS 响应中设置，HTTP 响应中的 HSTS 头会被浏览器忽略（防止中间人伪造）。

## Demo 2：验证 HSTS 是否生效

\`\`\`bash
# 用 curl 查看响应头
# -I          仅获取响应头（HEAD 请求）
# -s          静默模式，不显示进度
curl -sI https://example.com

# 期望输出中应包含：
# strict-transport-security: max-age=31536000; includeSubDomains; preload

# 进阶：用 OpenSSL 查看完整响应
echo -e "GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n" \\
  | openssl s_client -connect example.com:443 -quiet 2>/dev/null \\
  | grep -i strict-transport

# 浏览器验证：
# Chrome 地址栏输入 chrome://net-internals/#hsts
# 在 "Query HSTS/PKP domain" 输入 example.com 查询
# 如果已记录，会显示 static_sts_domain（preload）或 dynamic_sts_domain（运行时学习）

# 清除浏览器 HSTS 记录（测试时常用）：
# Chrome: chrome://net-internals/#hsts → "Delete domain security policies"
# Firefox: about:config → security.cert_pinning.enforcement_level
\`\`\`

## Demo 3：HSTS preload list 申请

HSTS preload list 是浏览器内置的"强制 HTTPS 域名清单"，Chrome、Firefox、Safari 等共享。加入后，即使用户从未访问过你的站点，首次也会直接走 HTTPS。

申请步骤：

\`\`\`text
第 1 步：满足申请条件
- 必须有有效的 HTTPS 证书
- 必须监听 443 端口
- 必须把所有 HTTP 流量 301 重定向到 HTTPS
- HSTS 头必须满足：
  * max-age >= 31536000（至少 1 年）
  * 必须包含 includeSubDomains
  * 必须包含 preload

第 2 步：提交申请
- 访问 https://hstspreload.org
- 输入你的域名
- 点击 "Check HSTS preload status and eligibility"
- 通过检查后点 "Submit"

第 3 步：等待浏览器更新
- 申请通过后，域名会进入 preload list 仓库
- Chrome/Firefox 下次版本更新时自动包含
- 通常几周到几个月生效

第 4 步：验证
- 在 Chrome 地址栏输入 chrome://net-internals/#hsts
- 查询域名，显示 static_sts_domain 表示已加入
\`\`\`

重要警告：preload 是不可撤销的！
- 加入后即使删除 HSTS 头，浏览器仍会强制 HTTPS（因为内置列表里有）
- 移除需要提交申请并等待数月（Chrome 要等下次版本更新）
- 如果你的域名将来要支持 HTTP（如卖给别人做 HTTP 站点），不要申请 preload

## Demo 4：其他重要安全头

除 HSTS 外，还有多个安全头能显著提升网站安全性。

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # 证书配置省略...

    # ---------- HSTS ----------
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # ---------- X-Frame-Options ----------
    # 防止点击劫持（Clickjacking）
    # 攻击者用透明 iframe 嵌入你的页面，诱导用户点击
    # DENY           完全禁止被 iframe 嵌入
    # SAMEORIGIN     仅允许同源 iframe
    # ALLOW-FROM uri 仅允许指定来源（已废弃，用 CSP 替代）
    add_header X-Frame-Options "SAMEORIGIN" always;

    # ---------- X-Content-Type-Options ----------
    # 防止 MIME 类型嗅探
    # 浏览器有时会忽略 Content-Type，自己猜测内容类型
    # nosniff 强制浏览器遵守声明的 Content-Type
    # 防止把文本文件当脚本执行
    add_header X-Content-Type-Options "nosniff" always;

    # ---------- Content-Security-Policy（CSP）----------
    # 内容安全策略，最强大的安全头
    # 限制资源加载来源，防止 XSS 注入
    # default-src 'self'           默认只允许同源资源
    # script-src 'self'            脚本只允许同源
    # style-src 'self'             样式只允许同源
    # img-src 'self' data:         图片允许同源和 data URI
    # object-src 'none'            禁止 Flash/Java 插件
    # base-uri 'self'              base 标签限同源
    # frame-ancestors 'self'       等同 X-Frame-Options SAMEORIGIN
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'" always;

    # ---------- Referrer-Policy ----------
    # 控制 Referer 头泄露
    # 浏览器默认会把完整 URL 作为 Referer 发给目标站点
    # strict-origin-when-cross-origin
    #   同源请求：发完整 URL
    #   跨源 HTTPS→HTTPS：只发 origin（不含路径）
    #   HTTPS→HTTP：不发 Referer
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # ---------- Permissions-Policy ----------
    # （原名 Feature-Policy）控制浏览器功能权限
    # 限制页面能用的 API，如摄像头、麦克风、地理位置
    # geolocation=()    禁用地理位置
    # microphone=()     禁用麦克风
    # camera=()         禁用摄像头
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # ---------- X-XSS-Protection ----------
    # 老版 IE 的 XSS 过滤器（现代浏览器已废弃，靠 CSP）
    # 1; mode=block 启用并阻止可疑页面
    # 注意：现代浏览器推荐用 CSP，此头仅兼容老 IE
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

## Demo 5：SSL Strip 攻击演示

下面用文字描述 SSL Strip 攻击的完整流程，帮助理解 HSTS 的必要性。

\`\`\`text
攻击环境：
- 受害者：普通用户，浏览器无 HSTS 记忆
- 攻击者：中间人（如同一个 WiFi 下的黑客）
- 目标网站：example.com（已部署 HTTPS，但无 HSTS）

正常流程（无攻击）：
1. 用户输入 example.com（浏览器默认补 http://）
2. 浏览器 → HTTP 请求 → example.com
3. example.com 返回 301 跳转到 https://example.com
4. 浏览器 → HTTPS 请求 → example.com
5. 后续全程 HTTPS，安全

SSL Strip 攻击流程：
1. 用户输入 example.com
2. 浏览器 → HTTP 请求 → [攻击者拦截]
3. 攻击者代替用户 → HTTPS 请求 → example.com（攻击者与网站正常 HTTPS）
4. example.com 返回 HTTPS 页面给攻击者
5. 攻击者把页面中的 https:// 链接全部改成 http://
6. 攻击者用 HTTP 把篡改后的页面返回给用户
7. 用户看到页面正常，但所有链接都是 http://
8. 用户后续点击都走 HTTP，攻击者持续窃听/篡改

HSTS 如何防御：
1. 用户首次访问后，浏览器记住 example.com 必须用 HTTPS
2. 第二次开始，即使用户输入 http://example.com
3. 浏览器内部直接转成 https://example.com，不发 HTTP 请求
4. 攻击者没有机会拦截那第一个 HTTP 请求
5. preload list 能覆盖"首次访问"的漏洞
\`\`\`

## Demo 6：检查网站安全头

用在线工具检查安全头配置是否完整。

\`\`\`text
工具 1：securityheaders.com
- 访问 https://securityheaders.com
- 输入你的域名
- 获得 A+ 到 F 的评级
- 列出缺失的安全头及建议

工具 2：Mozilla Observatory
- 访问 https://observatory.mozilla.org
- 更全面的安全评估，含多个维度
- 给出详细改进建议

工具 3：SSLLabs
- 访问 https://www.ssllabs.com/ssltest/
- 专注 TLS 配置评估
- 检查证书链、协议版本、密码套件

工具 4：浏览器开发者工具
- F12 → Network → 点击请求 → Response Headers
- 检查所有安全头是否生效

命令行工具：
\`\`\`

\`\`\`bash
# 用 curl 批量检查安全头
# -I 仅获取响应头
# -s 静默模式
curl -sI https://example.com | grep -iE "strict-transport|x-frame|x-content|content-security|referrer-policy|permissions-policy"

# 期望输出：
# strict-transport-security: max-age=31536000; includeSubDomains; preload
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff
# content-security-policy: default-src 'self'; ...
# referrer-policy: strict-origin-when-cross-origin
# permissions-policy: geolocation=(), microphone=(), camera=()

# 检查 HSTS preload 状态
curl -s https://hstspreload.org/api/v2/status/example.com
# 返回 status: "preloaded" 表示已加入
# 返回 status: "unknown" 表示未加入
\`\`\`

## HSTS 注意事项表

| 注意点 | 说明 | 建议 |
|--------|------|------|
| max-age 设置 | 太短保护不足，太长出错难恢复 | 测试期 300，稳定后 31536000 |
| includeSubDomains | 覆盖所有子域名 | 确认无 HTTP 子域名再启用 |
| preload 不可撤销 | 加入后移除需数月 | 仅永久 HTTPS 站点申请 |
| 首次访问漏洞 | HSTS 在首次访问后才生效 | 用 preload list 解决 |
| HTTPS 必须就绪 | HSTS 强制 HTTPS，证书失效会更严重 | 确保证书自动续期 |
| 子域名覆盖风险 | includeSubDomains 会让老子域名断联 | 排查所有子域名 |
| 测试清除 | 浏览器会长期记忆 HSTS | 用无痕模式或清除记录 |

## 本章小结

| 知识点 | 要点 |
|--------|------|
| HSTS | 强制浏览器今后只用 HTTPS 访问 |
| SSL Strip | 中间人剥离 HTTPS，把用户留在 HTTP |
| max-age | HSTS 记忆时长，推荐 31536000（1 年） |
| includeSubDomains | 覆盖所有子域名，慎用 |
| preload | 加入浏览器内置列表，解决首次访问漏洞 |
| preload 不可撤销 | 加入后移除需数月，慎重申请 |
| X-Frame-Options | 防点击劫持，SAMEORIGIN 或 DENY |
| X-Content-Type-Options | 防 MIME 嗅探，设为 nosniff |
| CSP | 内容安全策略，限制资源来源，防 XSS |
| Referrer-Policy | 控制 Referer 泄露，strict-origin-when-cross-origin |
| Permissions-Policy | 控制浏览器功能权限（摄像头、麦克风等） |
| 安全头检查 | securityheaders.com、Mozilla Observatory |
`
  }
];
