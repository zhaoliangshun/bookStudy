// =============================================================
// Batch 6：网络（4 章）
// =============================================================

export const chapters = [
  {
    id: "os-net-config",
    group: "网络",
    icon: "🌐",
    title: "网络配置与连通性",
    content: `## 概述
网络配置与连通性是排查服务可达性的第一站，掌握网卡、路由、DNS 三层排查能力即可应对大多数"连不上"问题。

## 核心要点
- **查看网卡**: \`ip addr\` - 现代标准命令，显示所有网络接口与 IP 地址
- **旧版工具**: \`ifconfig\` - 已被 iproute2 取代，部分系统仍保留
- **连通性测试**: \`ping -c 4 host\` - ICMP 探测，注意部分云主机禁 ICMP
- **链路追踪**: \`mtr host\` - 比 traceroute 更实用，持续刷新每跳丢包率
- **主机名**: \`hostname\` / \`hostname -f\` - 查看短名与 FQDN
- **DNS 查询**: \`dig example.com\` - 显示完整解析过程与 TTL
- **简洁查询**: \`host example.com\` - 仅返回 IP，适合脚本
- **旧版查询**: \`nslookup example.com\` - 交互式，逐步弃用
- **本地解析**: \`/etc/hosts\` - 优先级高于 DNS，常用于本地覆盖
- **DNS 配置**: \`/etc/resolv.conf\` - 指定 nameserver 与 search 域

## 原理与机制
- **解析顺序**: /etc/hosts → /etc/resolv.conf 指定的 DNS → 失败返回 NXDOMAIN
- **ping 原理**: 发送 ICMP Echo Request，等待 Echo Reply，不经过 TCP/UDP
- **mtr 原理**: 利用 TTL 递增探测每一跳路由，结合 ICMP/UDP 探测目标
- **dig +trace**: 从根域逐级查询，绕过本地 DNS 缓存，排查解析链路问题

## 易错点与陷阱
- **陷阱**: ping 不通不代表服务不可用，云主机常禁 ICMP 但 TCP 端口正常
- **陷阱**: 修改 /etc/resolv.conf 可能被 systemd-resolved 或 NetworkManager 覆盖
- **陷阱**: /etc/hosts 中 127.0.0.1 localhost 和 ::1 localhost 顺序影响 IPv6 优先级
- **陷阱**: dig 默认查 A 记录，查 MX/AAAA 需显式指定

## 实战建议
- **建议**: 排查"连不上"按链路顺序：ping 网关 → ping 8.8.8.8 → ping 域名，定位是网络层还是 DNS 层
- **建议**: 使用 \`dig +short\` 在脚本中获取纯 IP 输出，便于解析
- **建议**: mtr 报告中关注最后一跳丢包率，中间跳丢包可能是 ICMP 限速不影响实际链路`,
    code: `# 网络配置与连通性 - 沙箱可跑示例

# 1. 回环地址连通性测试（最基础的自检）
ping -c 3 127.0.0.1

# 2. 查看主机名
hostname

# 3. 查看 /etc/hosts 本地解析表
echo "=== /etc/hosts ==="
cat /etc/hosts

# 4. DNS 查询示例（dig 可能需安装，macOS 自带）
# 查询域名 A 记录
dig +short example.com A 2>/dev/null || echo "dig 不可用，尝试 host"

# 5. 使用 host 命令（更简洁）
host example.com 2>/dev/null || echo "host 命令不可用"

# 6. 查看 DNS 配置
echo "=== /etc/resolv.conf ==="
cat /etc/resolv.conf 2>/dev/null || echo "文件不存在或无权限"`,
  },
  {
    id: "os-port",
    group: "网络",
    icon: "🔌",
    title: "端口与连接",
    content: `## 概述
端口与连接状态排查是定位服务监听、端口冲突、连接异常的核心技能，ss 已成为 netstat 的现代替代品。

## 核心要点
- **查看监听**: \`ss -tlnp\` - TCP 监听端口 + 进程，现代推荐
- **旧版工具**: \`netstat -tlnp\` - 功能相同，逐步被 ss 取代
- **进程查端口**: \`lsof -i:80\` - 查看占用 80 端口的进程
- **所有连接**: \`lsof -i\` - 列出所有网络连接
- **端口占用**: \`ss -tlnp | grep :80\` - 快速定位端口占用进程
- **连接状态**: \`ss -tan | awk '{print $1}' | sort | uniq -c\` - 统计各状态数量
- **TIME_WAIT**: 主动关闭方进入 TIME_WAIT，默认持续 60s 占用本地端口
- **TCP 状态**: ESTABLISHED / TIME_WAIT / CLOSE_WAIT / LISTEN 等 11 种

## 原理与机制
- **三次握手**: SYN → SYN+ACK → ACK，握手完成后进入 ESTABLISHED
- **四次挥手**: FIN → ACK → FIN → ACK，主动关闭方进入 TIME_WAIT 等待 2MSL
- **TIME_WAIT 意义**: 确保最后的 ACK 到达对端，防止旧报文影响新连接
- **CLOSE_WAIT 堆积**: 应用未及时 close()，属代码 Bug 需排查

## 易错点与陷阱
- **陷阱**: ss/netstat -p 需要 root 才能看到其他用户的进程名
- **陷阱**: TIME_WAIT 过多不一定是问题，高并发短连接场景属正常现象
- **陷阱**: CLOSE_WAIT 堆积才是真正的危险信号，说明应用未正确关闭连接
- **陷阱**: 监听 127.0.0.1 与 0.0.0.0 不同，前者外部不可访问

## 实战建议
- **建议**: 优先使用 ss 而非 netstat，前者更快且信息更全
- **建议**: 排查端口占用用 \`lsof -i:PORT\`，比 ss+grep 更直观
- **建议**: 监控 CLOSE_WAIT 数量，持续增长说明应用层有连接泄漏`,
    code: `# 端口与连接 - 沙箱可跑示例

# 1. 查看所有 TCP 监听端口（不显示进程名，无需 root）
echo "=== TCP 监听端口 ==="
ss -tln 2>/dev/null || netstat -tln 2>/dev/null || echo "ss/netstat 不可用"

# 2. 统计 TCP 连接状态分布
echo "=== 连接状态统计 ==="
ss -tan 2>/dev/null | awk 'NR>1{print $1}' | sort | uniq -c || echo "无法统计"

# 3. 查看本机所有网络连接（lsof 演示）
echo "=== 本进程网络连接 ==="
lsof -i 2>/dev/null | head -20 || echo "lsof 不可用或无权限"

# 4. 查看指定端口占用（示例：检查 80 端口）
echo "=== 端口占用检查 ==="
lsof -i:80 2>/dev/null || echo "80 端口未被占用或无权限查看"

# 5. 查看 UDP 监听
echo "=== UDP 监听 ==="
ss -uln 2>/dev/null | head -10 || echo "无 UDP 监听"`,
  },
  {
    id: "os-firewall",
    group: "网络",
    icon: "🧱",
    title: "防火墙 iptables/firewalld/ufw",
    content: `## 概述
防火墙是网络安全的最后一道防线，ufw/firewalld 是 iptables 的高层封装，生产环境开放端口必经此关。

## 核心要点
- **ufw 启用**: \`ufw enable\` - Ubuntu 默认防火墙，语法极简
- **ufw 放行**: \`ufw allow 80/tcp\` - 放行 TCP 80 端口
- **ufw 拒绝**: \`ufw deny 3306\` - 拒绝 MySQL 外部访问
- **ufw 状态**: \`ufw status verbose\` - 查看规则与默认策略
- **firewalld**: \`firewall-cmd --add-port=80/tcp --permanent\` - CentOS/RHEL 默认
- **firewalld 重载**: \`firewall-cmd --reload\` - 永久规则需 reload 生效
- **iptables 四表**: filter(过滤) / nat(地址转换) / mangle(修改) / raw(原始)
- **五链**: PREROUTING / INPUT / FORWARD / OUTPUT / POSTROUTING
- **规则顺序**: 自上而下匹配，命中即停止，默认策略兜底

## 原理与机制
- **Netfilter**: Linux 内核网络过滤框架，iptables 是其用户态工具
- **表链关系**: filter 表包含 INPUT/FORWARD/OUTPUT 三链
- **匹配流程**: 数据包进入 → PREROUTING → 路由判断 → INPUT(本机) 或 FORWARD(转发)
- **ufw/firewalld**: 本质是生成 iptables 规则的便捷工具，底层仍是 Netfilter

## 易错点与陷阱
- **陷阱**: ufw allow 不指定来源等于对全网开放，生产环境应限制 IP
- **陷阱**: firewall-cmd 不加 --permanent 重启后失效，加了需 --reload 生效
- **陷阱**: iptables 规则顺序错误会导致放行规则被前面的 DROP 拦截
- **陷阱**: Docker 会绕过 ufw 直接操作 iptables，ufw 对容器端口无效

## 实战建议
- **建议**: 生产环境默认拒绝所有入站，仅放行必要端口（22/80/443）
- **建议**: 开放管理端口(22)务必限制来源 IP，避免暴力破解
- **建议**: 修改防火墙前先 \`iptables-save > backup.rules\` 备份，避免锁死自己`,
    code: `# 防火墙 - 沙箱无 root，用 echo 输出示例并注释

# === ufw（Ubuntu/Debian）===
echo "===== ufw 示例 ====="
cat <<'EOF'
# 启用防火墙（首次会提示 SSH 风险）
sudo ufw enable

# 放行 SSH（务必先放行，否则锁死自己）
sudo ufw allow 22/tcp

# 放行 Web 端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 拒绝 MySQL 外部访问
sudo ufw deny 3306

# 限制来源 IP 访问管理端口（更安全）
sudo ufw allow from 10.0.0.0/8 to any port 22

# 查看状态与规则
sudo ufw status verbose
EOF

# === firewalld（CentOS/RHEL）===
echo "===== firewalld 示例 ====="
cat <<'EOF'
# 放行 80/443 端口（永久）
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp

# 放行服务（推荐，语义更清晰）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重新加载使永久规则生效
sudo firewall-cmd --reload

# 查看当前规则
sudo firewall-cmd --list-all
EOF

# === iptables（底层，通用）===
echo "===== iptables 示例 ====="
cat <<'EOF'
# 查看 INPUT 链规则（带行号）
sudo iptables -nL INPUT --line-numbers

# 放行已建立连接
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 放行 80/443（INSERT 到第 1 行，优先匹配）
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT

# 默认策略：拒绝所有入站
sudo iptables -P INPUT DROP

# 备份与恢复
sudo iptables-save > /etc/iptables.rules
sudo iptables-restore < /etc/iptables.rules
EOF`,
  },
  {
    id: "os-nginx",
    group: "网络",
    icon: "🚪",
    title: "Nginx 反向代理",
    content: `## 概述
Nginx 是高性能 Web 服务器与反向代理，掌握 server/location 块与 proxy_pass 即可应对大多数流量接入场景。

## 核心要点
- **安装**: \`apt install nginx\` / \`yum install nginx\` - 包管理器一键安装
- **主配置**: \`/etc/nginx/nginx.conf\` - 全局配置，include sites-enabled
- **站点配置**: \`/etc/nginx/sites-enabled/*.conf\` - 每站点一个文件
- **server 块**: 监听端口与域名，一个文件可含多个 server
- **location 块**: URL 路径匹配，支持前缀/正则/精确三种匹配
- **反向代理**: \`proxy_pass http://upstream\` - 转发请求到后端
- **负载均衡**: \`upstream\` 块定义后端池，支持轮询/权重/ip_hash
- **常用变量**: \`$host\` 请求域名 / \`$remote_addr\` 客户端 IP / \`$request_uri\` 完整 URI

## 原理与机制
- **location 匹配优先级**: = 精确 > ^~ 前缀(不续正则) > ~ 正则 > 前缀
- **proxy_pass 转发**: Nginx 作为客户端向后端发起 HTTP 请求，转发响应
- **upstream 算法**: 默认轮询，ip_hash 解决 session，least_conn 最少连接
- **异步非阻塞**: Nginx 单进程多连接，epoll 事件驱动，适合高并发

## 易错点与陷阱
- **陷阱**: proxy_pass 末尾带 / 与不带 / 路径拼接不同，易导致 404
- **陷阱**: 修改配置后必须 \`nginx -t\` 测试 + \`nginx -s reload\`，否则不生效
- **陷阱**: location 正则匹配时 proxy_pass 不能带 URI，会报错
- **陷阱**: upstream 后端宕机会返回 502，需配置 proxy_next_upstream 容错

## 实战建议
- **建议**: 反向代理务必转发真实 IP：\`proxy_set_header X-Real-IP $remote_addr\`
- **建议**: 生产环境配置 \`proxy_connect_timeout\` 与 \`proxy_read_timeout\` 防止后端慢请求拖垮 Nginx
- **建议**: 用 \`nginx -t\` 每次改配置后验证语法，避免 reload 导致服务中断`,
    code: `# Nginx 反向代理 - 沙箱无 nginx，用 echo 输出配置示例

echo "===== Nginx 反向代理配置示例 ====="
cat <<'EOF'
# /etc/nginx/sites-available/api.conf

# 负载均衡上游池
upstream api_backend {
    server 10.0.0.1:8080 weight=3;  # 权重 3
    server 10.0.0.2:8080 weight=1;  # 权重 1
    server 10.0.0.3:8080 backup;    # 备用机
}

server {
    listen 80;
    server_name api.example.com;

    # 反向代理到后端池
    location / {
        proxy_pass http://api_backend;
        # 转发真实客户端信息（必备）
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # 超时设置
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }

    # 静态资源由 Nginx 直接处理
    location ~* \\.(jpg|css|js)$ {
        root /var/www/static;
        expires 30d;
    }
}
EOF

echo "===== 管理命令 ====="
cat <<'EOF'
sudo nginx -t          # 测试配置语法
sudo nginx -s reload   # 重载配置（不中断）
sudo ss -tlnp | grep nginx  # 查看监听端口
EOF`,
  },
];
