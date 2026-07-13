// =============================================================
// HTTPS 详解全书 - 第 6 批章节（HTTPS 安全与运维 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   hs-ct: 证书透明度
//   hs-ssl-labs: SSL Labs 评级与优化
//   hs-vuln: HTTPS 常见漏洞
//   hs-troubleshoot: HTTPS 故障排查
//   hs-tools: HTTPS 工具集
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：证书透明度
  // ============================================================
  {
    id: "hs-ct",
    group: "HTTPS 安全与运维",
    icon: "🔍",
    title: "证书透明度",
    content: `# 证书透明度

## 一、为什么需要证书透明度

在讲证书透明度（Certificate Transparency，简称 CT）之前，先看一个真实发生过的问题：某个 CA（证书颁发机构）因为内部流程失误或被攻击者入侵，给一个它根本无权签发的域名签发了证书。比如攻击者拿到了 \`mail.google.com\` 的"合法"证书，就能在中间人攻击里伪装成谷歌邮箱，而用户浏览器不会报警——因为证书是真的 CA 签的，链路是"合法"的。

这种"CA 错误签发"在 2011 年之前几乎无法被发现。CA 给谁签了证书，只有 CA 自己知道，域名所有者（比如谷歌）根本不知道有人给自己的域名签了证书。这就像有人拿你的身份证去银行开了户，而银行从来不公示开户记录，你永远蒙在鼓里。

证书透明度就是为了解决这个"黑箱"问题。它的核心思想很简单：**所有 CA 签发的证书，都必须公开记录到一个任何人都可以查询的日志里**。这样：

1. 域名所有者可以定期查"有没有人给我的域名签了证书"
2. 浏览器可以校验"这张证书是否被公开记录"
3. CA 的行为变得可审计，出了问题能被快速发现

> 生活类比：CT 就像"公开的证书出生登记处"。每张证书一出生，CA 就得去登记处登记，谁都能来翻这本登记簿。如果有人偷偷伪造了一张证书没登记，浏览器就不认。

## 二、CT Log：只追加的日志

CT Log（证书透明度日志）是 CT 体系的核心组件。它有几个关键特性：

### 2.1 只追加（Append-only）

日志一旦写入，就**永远不能修改或删除**。每条记录只能加在末尾，就像用钢笔在账本上记账，写错了也不能涂改，只能在下一行更正。这是为了让日志具备"可审计性"——任何人都能从头到尾核对一遍，看 CA 有没有违规。

### 2.2 默克尔树（Merkle Tree）

日志内部用默克尔树组织数据。把每条证书记录当作叶子节点，两两哈希得到父节点，层层向上最终得到一个"根哈希"（Root Hash）。这个结构的好处是：

- 证明某张证书在日志里：只需提供从该证书到根的路径上的几个哈希（包含证明），复杂度 O(log n)
- 证明日志整体没被篡改：根哈希一变就说明内容变了

> 生活类比：默克尔树就像"目录索引"。你想证明第 100 页有某句话，不用把整本书搬出来，只要拿出第 100 页所在的那一摞哈希指纹就够了。

### 2.3 任何人可查

CT Log 是公开的服务，任何人都可以通过 API 查询。常见的 CT Log 运营方有 Google（Argon、Xenon 等）、Cloudflare、Sectigo 等。日志之间互相独立，CA 通常会把同一张证书提交到多个 Log（一般 3 个以上），防止单点失效。

## 三、SCT：签名证书时间戳

光有日志还不够。浏览器怎么知道"某张证书确实被记录到日志里了"？答案是 SCT（Signed Certificate Timestamp，签名证书时间戳）。

### 3.1 SCT 是什么

SCT 是 CT Log 给 CA 的一份"承诺书"。流程是这样的：

1. CA 在签发正式证书前，先把"预证书"（precertificate）提交给 CT Log
2. CT Log 把预证书写入日志，返回一个 SCT（包含日志签名、时间戳、日志 ID 等）
3. CA 把 SCT 嵌入到正式证书的扩展字段里，一起签发给用户
4. 浏览器收到证书后，验证 SCT 的签名是否来自可信的 CT Log，以及时间戳是否合理

> 生活类比：SCT 就像快递单上的"已揽件"回执。CA 把证书交给日志（快递公司），日志给 CA 一张盖了章的回执（SCT），CA 再把回执贴在包裹（证书）上。收件人（浏览器）看到回执就知道这包裹确实被快递公司登记过了。

### 3.2 SCT 的两种交付方式

- **嵌入证书内**（最常见）：SCT 作为 X.509 扩展字段 \`ct_precert_scts\` 直接写在证书里，浏览器一条 TLS 连接就能拿到
- **TLS 扩展交付**（少见）：服务器在 TLS 握手时通过 \`signed_certificate_timestamp\` 扩展发送 SCT，用于证书本身没嵌 SCT 的老证书

### 3.3 Chrome 的 CT 强制策略

从 2018 年起，Chrome 要求所有新签发的公开信任证书必须带 SCT，否则浏览器会显示"此证书不接受 CT"的警告。这倒逼所有主流 CA 都接入了 CT 系统。

## 四、Demo 1：查看网站的 CT 信息

用 openssl 看 SCT 信息。先抓取一张证书，再看它的 CT 扩展字段。

\`\`\`bash
# 第一步：把网站的证书保存到本地文件
# -showcerts 表示显示完整证书链
# 把输出通过管道交给 openssl x509 处理
echo | openssl s_client -connect www.google.com:443 -servername www.google.com 2>/dev/null \\
  | openssl x509 -outform PEM > google-cert.pem

# 第二步：查看证书的 CT 扩展字段（SCT）
# -text 表示以可读文本输出
# -noout 表示不输出证书本身的 PEM 内容
# grep -A 20 表示匹配 CT Precertificate 后再显示 20 行
openssl x509 -in google-cert.pem -text -noout | grep -A 20 "CT Precertificate"
\`\`\`

输出大致长这样（不同证书内容不同）：

\`\`\`text
CT Precertificate SCTs:
    Signed Certificate Timestamp:
        Version   : v1 (0x0)
        Log ID    : 7A:32:8C:54:...   # CT Log 的唯一标识
        Timestamp : Mar  1 03:21:00 2024 GMT  # 提交到日志的时间
        Signature : ecdsa-with-SHA256
        Signature : 30:45:02:20:...
    Signed Certificate Timestamp:
        Version   : v1 (0x0)
        Log ID    : 29:79:28:36:...   # 第二个 CT Log
        Timestamp : Mar  1 03:21:00 2024 GMT
        ...
\`\`\`

可以看到这张证书被提交到了多个 CT Log（每条 SCT 对应一个 Log），这正是 CT 体系的冗余设计。

## 五、Demo 2：浏览器查看 CT（DevTools Security 面板）

Chrome / Edge 浏览器内置了 CT 查看功能，不需要命令行。

操作步骤：

1. 用 Chrome 打开任意 HTTPS 网站（比如 \`https://www.cloudflare.com\`）
2. 按 \`F12\` 打开开发者工具
3. 切换到 \`Security\`（安全）面板
4. 点击 \`View certificate\`（查看证书）
5. 在证书详情里找到 \`Details\` 选项卡，往下翻找到 \`CT Precertificate SCTs\` 字段

另外，Chrome 在地址栏点小锁图标 → "连接是安全的" → "证书有效" 也能看到证书是否带 CT 信息。如果证书没有 SCT，Chrome 会明确警告"此站点使用的证书不接受证书透明度"。

> 小贴士：Firefox 也可以在地址栏锁图标 → "连接安全" → "更多信息" → "查看证书" 里看到 CT 信息。

## 六、Demo 3：在 crt.sh 查询某域名被签发过哪些证书

crt.sh 是 Sectigo 运营的 CT 日志搜索引擎，它聚合了所有主流 CT Log 的数据，可以按域名查询"历史上谁给这个域名签过证书"。这是监控自己域名是否被恶意签发的最佳工具。

\`\`\`bash
# 查询 example.com 域名被签发过的所有证书
# 返回 JSON 数组，每项是一条 CT 记录
curl https://crt.sh/?q=example.com\\&output=json

# 只看签发者（issuer_name）和有效期，用 jq 过滤
# jq 是命令行 JSON 处理工具
curl -s https://crt.sh/?q=example.com\\&output=json \\
  | jq '[.[] | {issuer_name, not_before, not_after}]'

# 查询子域名（加 %. 表示通配所有子域）
# %.example.com 会匹配 www.example.com、mail.example.com 等
curl -s "https://crt.sh/?q=%.example.com&output=json" | jq 'length'

# 把结果导出成 CSV 方便排查
curl -s https://crt.sh/?q=example.com\\&output=json \\
  | jq -r '.[] | [.issuer_name, .not_before, .not_after] | @csv' > ct-report.csv
\`\`\`

排查思路：

- 如果你管理 \`example.com\`，查出来的签发者（issuer）应该都是你授权的 CA（比如 Let's Encrypt、DigiCert）
- 如果出现一个你完全不认识的 CA，或一个你从没申请过的子域名有证书，那可能是恶意签发，需要立刻联系该 CA 撤销证书

## 七、Demo 4：Nginx 配置 SCT

实际上，现代 CA（如 Let's Encrypt、DigiCert）签发的证书**已经把 SCT 嵌入到证书文件里了**，所以 Nginx 只要正常配置证书就行，不需要单独配置 SCT。这里演示的是 certbot 自动处理的流程。

\`\`\`bash
# 用 certbot 申请 Let's Encrypt 证书
# --rsa-key-size 2048 指定 RSA 密钥长度
# certbot 会自动把带 SCT 的证书签发给你
sudo certbot certonly --nginx -d example.com -d www.example.com

# 查看签发出来的证书是否带 SCT
# certbot 默认把证书放在 /etc/letsencrypt/live/<域名>/
sudo openssl x509 -in /etc/letsencrypt/live/example.com/cert.pem -text -noout \\
  | grep -A 5 "CT Precertificate"
\`\`\`

Nginx 配置（正常配置即可，SCT 已在证书内）：

\`\`\`nginx
# /etc/nginx/conf.d/example.conf
server {
    listen 443 ssl http2;          # 监听 443 端口，启用 SSL 和 HTTP/2
    server_name example.com;       # 域名

    # fullchain.pem 包含服务器证书 + 中间证书
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    # 私钥
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 证书里的 SCT 会被 TLS 握手自动发给客户端，无需额外配置
    location / {
        proxy_pass http://127.0.0.1:8080;   # 反向代理到后端
    }
}
\`\`\`

> 注意：如果用的是 2018 年以前签发的老证书（没有 SCT），就只能用 TLS 扩展方式手动配 SCT 文件，非常麻烦。换张新证书是最简单的解法。

## 八、Demo 5：用 Python 验证 SCT

用 Python 的 \`cryptography\` 库读取证书里的 SCT 字段并解析其结构。

\`\`\`python
# 安装依赖：pip install cryptography
from cryptography import x509                      # X.509 证书操作库
from cryptography.hazmat.backends import default_backend  # 默认后端
import requests                                     # 用来抓取证书
import ssl                                          # 标准库 ssl 模块

# 第一步：从某个 HTTPS 站点抓取证书（PEM 格式）
def fetch_cert_pem(hostname, port=443):
    # 建立到目标主机的 TLS 连接
    conn = ssl.create_connection((hostname, port))
    # 包装成 SSL 连接（带 SNI）
    ctx = ssl.create_default_context()
    sock = ctx.wrap_socket(conn, server_hostname=hostname)
    # 拿到对端证书（DER 格式二进制）
    der_cert = sock.getpeercert(binary_form=True)
    sock.close()
    # 转成 PEM 字符串返回
    return ssl.DER_cert_to_PEM_cert(der_cert)

# 第二步：解析证书里的 SCT 扩展
def parse_scts(cert_pem):
    # 把 PEM 加载成证书对象
    cert = x509.load_pem_x509_certificate(cert_pem.encode(), default_backend())
    # 遍历所有扩展，找 CT SCT 扩展
    try:
        # PrecertSignedCertificateTimestamps 是 SCT 扩展的类
        from cryptography.x509 import PrecertSignedCertificateTimestamps
        sct_ext = cert.extensions.get_extension_for_class(
            PrecertSignedCertificateTimestamps
        )
        scts = sct_ext.value
        print("找到 {} 条 SCT:".format(len(scts)))
        # 逐条打印 SCT 信息
        for i, sct in enumerate(scts, 1):
            print("  SCT #{}:".format(i))
            print("    版本    :", sct.version.name)      # SCT 版本
            print("    Log ID  :", sct.log_id.hex()[:16] + "...")  # Log 的 ID
            print("    时间戳  :", sct.timestamp.isoformat())     # 提交时间
            print("    签名算法:", sct.signature_hash_algorithm.name)
        return scts
    except x509.ExtensionNotFound:
        # 证书里没有 SCT 扩展
        print("此证书没有嵌入 SCT（可能是老证书或自签证书）")
        return []

# 第三步：运行
if __name__ == "__main__":
    pem = fetch_cert_pem("www.google.com")
    parse_scts(pem)
\`\`\`

运行后会打印出每条 SCT 的版本、Log ID、时间戳和签名算法。如果证书没有 SCT（比如自签证书），会提示"此证书没有嵌入 SCT"。

## 九、Demo 6：CT 监控（发现域名被恶意签发证书）

把 crt.sh 查询封装成定时任务，每天检查一次自己的域名有没有出现新证书。这是企业级 CT 监控的雏形。

\`\`\`python
# ct_monitor.py - CT 监控脚本
import requests              # HTTP 客户端
import json                  # JSON 处理
import datetime              # 日期处理
import os                    # 文件操作

# 要监控的域名列表
WATCH_DOMAINS = ["example.com", "www.example.com"]
# 记录上次查询结果的文件，用于增量对比
STATE_FILE = "ct_state.json"

def query_crt_sh(domain):
    """查询 crt.sh 拿到某域名的所有 CT 记录"""
    url = "https://crt.sh/?q=%25." + domain + "&output=json"
    # %25. 是 %. 的 URL 编码，表示匹配所有子域
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    # 返回记录列表
    return r.json()

def load_state():
    """加载上次的状态"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {}  # 没有历史状态就返回空字典

def save_state(state):
    """保存当前状态"""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def monitor():
    """主监控逻辑"""
    old_state = load_state()
    new_state = {}
    alerts = []  # 告警列表

    for domain in WATCH_DOMAINS:
        # 查询当前所有证书记录
        records = query_crt_sh(domain)
        # 把每条记录的唯一标识（证书指纹）收集起来
        # crt.sh 的 min_entry_timestamp 字段可作为记录 ID
        current_ids = set()
        for rec in records:
            rec_id = rec.get("min_entry_timestamp", "") + "|" + rec.get("issuer_name", "")
            current_ids.add(rec_id)

        new_state[domain] = list(current_ids)

        # 和上次对比，找出新增的记录
        old_ids = set(old_state.get(domain, []))
        added = current_ids - old_ids
        if added and old_ids:  # 第一次运行不告警（old_ids 为空）
            for aid in added:
                alerts.append("[告警] {} 出现新证书: {}".format(domain, aid))

    # 保存新状态
    save_state(new_state)

    # 输出告警
    if alerts:
        print("=== 发现 {} 条新证书，请人工核实 ===".format(len(alerts)))
        for a in alerts:
            print(a)
        # 实际生产环境可接入钉钉/飞书/邮件告警
    else:
        print("[" + str(datetime.date.today()) + "] 无异常，未发现新证书。")

if __name__ == "__main__":
    monitor()
\`\`\`

部署方式：用 crontab 每天跑一次：

\`\`\`bash
# 编辑 crontab
crontab -e
# 每天早上 9 点跑监控脚本，输出写到日志文件
0 9 * * * /usr/bin/python3 /opt/ct_monitor/ct_monitor.py >> /var/log/ct_monitor.log 2>&1
\`\`\`

> 进阶：企业里可以用 Google 的 Certificate Transparency Monitor（https://developer.google.com/certificates-transparency-monitor）或 Cloudflare 的 Merkle Town，做实时监控和告警。

## 十、CT 关键概念表

| 概念 | 全称 | 作用 | 生活类比 |
|------|------|------|----------|
| CT | Certificate Transparency | 公开记录所有 CA 签发的证书 | 公开的证书出生登记处 |
| CT Log | CT Log | 只追加的证书日志，任何人可查 | 不能涂改的公开账本 |
| Precertificate | Pre-certificate | CA 提交给 Log 的"预证书" | 证书的草稿，用来登记 |
| SCT | Signed Certificate Timestamp | Log 给 CA 的"已登记"回执 | 快递"已揽件"回执 |
| Merkle Tree | 默克尔树 | 高效证明记录在日志里 | 目录索引，查页码 |
| Inclusion Proof | 包含证明 | 证明某证书确实在日志里 | 证明某句话在某页 |
| ct_precert_scts | - | 证书里存放 SCT 的扩展字段 | 证书上贴的回执 |

## 十一、本章小结

| 要点 | 说明 |
|------|------|
| CT 的目的 | 让 CA 错误签发可被发现、可被审计 |
| CT Log 特性 | 只追加、默克尔树、公开可查 |
| SCT 的角色 | Log 给 CA 的"已登记"承诺，嵌入证书 |
| 浏览器强制 | Chrome 要求新证书必须带 SCT |
| 监控价值 | 域名所有者可发现恶意签发 |
| 常用工具 | crt.sh 搜索、openssl 查看、cryptography 解析 |
`
  },

  // ============================================================
  // 第二章：SSL Labs 评级与优化
  // ============================================================
  {
    id: "hs-ssl-labs",
    group: "HTTPS 安全与运维",
    icon: "🏆",
    title: "SSL Labs 评级与优化",
    content: `# SSL Labs 评级与优化

## 一、SSL Labs 是什么

SSL Labs（Qualys SSL Server Test）是业界最权威的 HTTPS 配置在线检测工具，网址是 \`https://www.ssllabs.com/ssltest/\`。它会对目标网站的 TLS 配置做全面扫描，给出一个从 T（最差）到 A+（最好）的评级。

> 生活类比：SSL Labs 评级就像"网站 HTTPS 体检报告"。你的网站 HTTPS 跑去做个体检，体检中心给你出一份报告，列出各项指标，最后给个总评。A+ 就是"身体素质极佳"，T 就是"病入膏肓别上网了"。

评级等级含义：

- **A+**：配置卓越，符合现代最佳实践（HSTS preload、TLS 1.3、完美前向保密等）
- **A / A-**：配置良好，无明显安全问题
- **B / C**：存在中等风险（如仍启用 TLS 1.0）
- **D / E**：存在较高风险（弱密码套件、协议缺陷）
- **F**：存在严重问题（证书链断裂、协议完全过时）
- **T**：证书信任问题（证书不受信任，但配置本身可能没问题）

## 二、评分维度

SSL Labs 的总分由四个维度加权得出：

### 2.1 协议支持（Protocol Support）— 占 30%

检查服务器支持的 TLS/SSL 协议版本。越老的协议分越低：

- SSL 2.0、SSL 3.0：0 分（已废弃，有 POODLE 漏洞）
- TLS 1.0、TLS 1.1：50-80 分（已弃用，2020 年起浏览器默认禁用）
- TLS 1.2：90-100 分（当前主流）
- TLS 1.3：100 分（最新，最安全最快）

### 2.2 密钥交换（Key Exchange）— 占 30%

检查密钥交换算法和密钥强度：

- RSA 密钥交换（无前向保密）：低分
- DHE/ECDHE（有前向保密）：高分
- 密钥长度：RSA 2048+/ECDSA 256+ 才达标，1024 位 RSA 直接 0 分
- DH 参数强度：< 1024 位会被扣分（Logjam 漏洞）

### 2.3 密码套件（Cipher Suites）— 占 20%

检查支持的加密算法组合：

- RC4：0 分（不安全）
- 3DES：0 分（Sweet32 漏洞）
- CBC 模式：中等（有 Lucky13 等时序攻击风险）
- GCM/ChaCha20-Poly1305：高分（AEAD 认证加密）
- MD5：0 分；SHA1：低分；SHA256/384：高分

### 2.4 漏洞（Vulnerabilities）— 占 20%

检测已知漏洞：BEAST、POODLE、Heartbleed、FREAK、Logjam、DROWN、ROBOT 等。命中任一漏洞都会大幅扣分。

## 三、Demo 1：在线测试网站

最简单的用法是直接打开 SSL Labs 网站输入域名。

\`\`\`text
访问这个 URL（把 example.com 换成你的域名）：
https://www.ssllabs.com/ssltest/analyze.html?d=example.com

参数说明：
  d=example.com        # 要测试的域名
  &latest              # 只看最近一次结果（不重新测）
  &startNew=on         # 强制重新测（忽略缓存）
  &hideResults=on      # 不公开结果（默认 SSL Labs 结果是公开的）
\`\`\`

测试过程通常需要 1-2 分钟，会模拟多种客户端（Chrome、Firefox、Safari、iOS、Android、Java 等）连接你的服务器，看每种客户端的兼容性。结果页面包含：

- **Overall Rating**：总评级（A+ / A / B / ...）
- **Certification Paths**：证书链是否完整
- **Protocols**：支持的协议列表及状态
- **Cipher Suites**：密码套件列表及强度
- **Handshake Simulation**：握手模拟（不同客户端握手结果）
- **Protocol Details**：详细配置（HSTS、OCSP stapling、ALPN 等）

> 小贴士：测试时勾选 "Do not show the results on the boards" 可以让结果不出现在公开榜单上。

## 四、Demo 2：达到 A 级的最低要求

从 B/C 升到 A，核心是去掉所有"已知不安全"的配置。下面是 Nginx 的 A 级最低配置。

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # 证书
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # === 协议：只允许 TLS 1.2 和 1.3，禁用 TLS 1.0/1.1 和 SSL ===
    ssl_protocols TLSv1.2 TLSv1.3;

    # === 密码套件：禁用 RC4、3DES，启用 AEAD（GCM/ChaCha20）===
    # 服务器主动选择套件（不交给客户端）
    ssl_prefer_server_ciphers on;
    # TLS 1.2 的套件：只保留 ECDHE + AESGCM/ChaCha20（带前向保密）
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # === 启用 Forward Secrecy：用 ECDHE 曲线 ===
    ssl_ecdh_curve X25519:secp384r1;

    # === HSTS：强制浏览器后续都用 HTTPS ===
    # max-age 至少 1 年（31536000 秒），includeSubDomains 覆盖子域
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # === 会话恢复：减少握手开销 ===
    ssl_session_cache shared:SSL:10m;     # 会话缓存 10MB
    ssl_session_timeout 1d;               # 会话有效期 1 天
    ssl_session_tickets off;              # 关闭 session ticket（有前向保密隐患）

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
\`\`\`

关键改动：

1. \`ssl_protocols TLSv1.2 TLSv1.3\`：禁用 TLS 1.0/1.1（POODLE、BEAST 风险）
2. \`ssl_ciphers\`：只留 ECDHE + AEAD 套件，干掉 RC4/3DES/CBC 弱套件
3. \`ssl_ecdh_curve\`：用现代椭圆曲线，保证前向保密
4. \`Strict-Transport-Security\`：HSTS 头，防降级攻击

完成这些改动后重载 Nginx（\`sudo nginx -t && sudo nginx -s reload\`），再测一次 SSL Labs，基本能拿到 A。

## 五、Demo 3：达到 A+ 级的额外要求

A 到 A+ 的差距，主要在 HSTS preload。SSL Labs 要求 HSTS \`max-age\` 至少 18 周（约 4 个月）才给 A+，但业界推荐至少 1 年。

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_ecdh_curve X25519:secp384r1;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # === A+ 关键：HSTS preload ===
    # preload 表示申请加入浏览器内置的"强制 HTTPS"列表
    # 加入后浏览器在没访问过该站点时也会直接走 HTTPS
    # 申请地址：https://hstspreload.org
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # === OCSP Stapling：让服务器替客户端查 OCSP ===
    # 减少 SSL Labs 在 "OCSP Stapling" 项的扣分
    ssl_stapling on;
    ssl_stapling_verify on;
    # 信任链（用来验证 OCSP 响应签名）
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    # DNS 解析器（OCSP 查询要用）
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
\`\`\`

A+ 的额外加分项：

1. \`preload\` 关键字 + 申请 hstspreload.org：A+ 必需
2. \`ssl_stapling on\`：启用 OCSP Stapling（提升握手速度 + 隐私）
3. \`max-age=63072000\`（2 年）：保险起见用大值
4. 全面支持 TLS 1.3：TLS 1.3 自带前向保密和 AEAD

申请 preload 的步骤：

\`\`\`text
1. 访问 https://hstspreload.org
2. 输入你的域名（example.com）
3. 确认满足所有条件：
   - 提供 HTTPS 服务
   - 所有子域也走 HTTPS
   - HSTS 头 max-age >= 31536000（1 年）
   - HSTS 头包含 includeSubDomains 和 preload
4. 提交申请，等浏览器下一版本内置（几周到几个月）
\`\`\`

> 警告：一旦进入 preload 列表，**所有子域必须强制 HTTPS**，否则子域会打不开。退出列表很慢（需要等浏览器更新），申请前务必确认所有子域都支持 HTTPS。

## 六、Demo 4：常见降分原因排查

### 6.1 链不完整（缺中间证书）

症状：SSL Labs 报 "Chain issues: Incomplete"，浏览器报 \`NET::ERR_CERT_AUTHORITY_INVALID\`。

原因：只配了服务器证书（\`cert.pem\`），没配中间证书（\`chain.pem\`）。客户端找不到从服务器证书到根 CA 的路径。

修复：用 \`fullchain.pem\`（包含服务器证书 + 中间证书）替代 \`cert.pem\`。

\`\`\`bash
# 检查证书链是否完整
# 连接后看 "Verify return code"
# 0 (ok) 表示链完整，否则有问题
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | grep "Verify return code"

# 如果不是 0，检查你配的证书文件
# 正确做法：fullchain.pem = 服务器证书 + 中间证书
cat /etc/letsencrypt/live/example.com/cert.pem \\
    /etc/letsencrypt/live/example.com/chain.pem > /etc/letsencrypt/live/example.com/fullchain.pem

# 验证 fullchain.pem 里有几张证书（应该 >= 2）
grep -c "BEGIN CERTIFICATE" /etc/letsencrypt/live/example.com/fullchain.pem
\`\`\`

### 6.2 弱密码套件

症状：SSL Labs 在 "Cipher Suites" 部分标红，出现 RC4、3DES、CBC。

\`\`\`bash
# 查看服务器支持的套件
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>/dev/null \\
  | grep "Cipher is"

# 检查是否还启用了 RC4（应该没有）
openssl s_client -connect example.com:443 -cipher 'RC4-MD5:RC4-SHA' < /dev/null 2>&1 | grep "Cipher is"
\`\`\`

修复：在 Nginx 里用 \`ssl_ciphers\` 显式列出强套件（参考 Demo 2）。

### 6.3 不支持 OCSP Stapling

症状：SSL Labs 报 "OCSP Stapling: No"。

\`\`\`bash
# 测试服务器是否返回 OCSP Stapling
# 看输出里有没有 "OCSP Response Status: successful"
echo | openssl s_client -connect example.com:443 -servername example.com -status 2>/dev/null \\
  | grep "OCSP Response"
\`\`\`

修复：在 Nginx 里加 \`ssl_stapling on\`、\`ssl_stapling_verify on\`、\`ssl_trusted_certificate\`、\`resolver\`（参考 Demo 3）。

## 七、Demo 5：用 testssl.sh 本地扫描

testssl.sh 是一个开源的命令行 TLS 扫描工具，功能比 SSL Labs 更细致，能在内网/本地跑（不依赖外网）。

\`\`\`bash
# 第一步：安装 testssl.sh（不需要编译，纯 shell 脚本）
git clone https://github.com/drwetter/testssl.sh
cd testssl.sh

# 第二步：基础扫描
# 会测试协议、套件、漏洞、证书等
./testssl.sh example.com

# 第三步：只测漏洞（推荐先跑这个）
# 检测 Heartbleed、POODLE、FREAK、Logjam、DROWN、ROBOT 等
./testssl.sh --vulnerable example.com

# 第四步：逐个测试每个密码套件
./testssl.sh --each-cipher example.com

# 第五步：检查 TLS 1.3 是否启用
./testssl.sh -t 13 example.com

# 第六步：输出 HTML 报告
./testssl.sh --htmlfile report.html example.com
\`\`\`

输出会标红所有问题项，比如：

\`\`\`text
 Testing cipher categories
...
 RC4                   OFFERED (NOT ok)   # 红色，要禁用
 3DES                  OFFERED (NOT ok)   # 红色，要禁用
 Forward Secrecy       offered (OK)        # 绿色
\`\`\`

## 八、Demo 6：用 sslyze 扫描

sslyze 是 Python 写的 TLS 扫描工具，输出结构化，适合做 CI/CD 集成。

\`\`\`bash
# 安装（Python 3.6+）
pip install sslyze

# 基础扫描（等价于 SSL Labs 的常规测试）
sslyze --regular example.com

# 专项扫描：Heartbleed 漏洞
sslyze --heartbleed example.com

# 专项扫描：ROBOT 漏洞
sslyze --robot example.com

# 专项扫描：SSL 3.0 是否禁用（防 POODLE）
sslyze --ssl3 example.com

# 输出 JSON 结果，方便程序处理
sslyze --json_out result.json --regular example.com

# 扫描整个证书链
sslyze --certinfo example.com
\`\`\`

JSON 输出示例（节选）：

\`\`\`json
{
  "accepted_cipher_suites": [
    {
      "cipher": "TLS_AES_256_GCM_SHA384",
      "key_size": 256,
      "is_forward_secret": true
    }
  ],
  "rejected_cipher_suites": [...],
  "vulnerabilities": {
    "heartbleed": {"is_vulnerable": false},
    "robot": {"is_vulnerable": false}
  }
}
\`\`\`

可以在 CI 里跑 sslyze，一旦发现弱套件或漏洞就阻断部署。

## 九、SSL Labs 评分维度表

| 维度 | 权重 | 高分要求 | 低分原因 |
|------|------|----------|----------|
| 协议支持 | 30% | TLS 1.2 + 1.3 | 启用 SSL 3.0 / TLS 1.0 |
| 密钥交换 | 30% | ECDHE + 强曲线 + 长 DH 参数 | RSA 交换 / 1024 位 DH |
| 密码套件 | 20% | AEAD（GCM/ChaCha20） | RC4 / 3DES / 纯 CBC |
| 漏洞 | 20% | 无任何已知漏洞 | 命中 Heartbleed/POODLE 等 |
| HSTS（额外） | 评级加分 | max-age >= 1 年 + preload | 无 HSTS 头 |
| OCSP Stapling | 评级加分 | 已启用 | 未启用 |

## 十、本章小结

| 要点 | 说明 |
|------|------|
| 工具定位 | SSL Labs 是 HTTPS 配置的权威体检工具 |
| 评级范围 | T（最差）到 A+（最好） |
| A 级核心 | TLS 1.2+、AEAD 套件、前向保密、HSTS |
| A+ 核心 | HSTS preload + OCSP Stapling + TLS 1.3 |
| 常见降分 | 链不完整、弱套件、无 OCSP、启用旧协议 |
| 本地扫描 | testssl.sh + sslyze，可集成 CI |
| 优化原则 | 先禁旧协议套件，再加 HSTS/Stapling |
`
  },

  // ============================================================
  // 第三章：HTTPS 常见漏洞
  // ============================================================
  {
    id: "hs-vuln",
    group: "HTTPS 安全与运维",
    icon: "🐛",
    title: "HTTPS 常见漏洞",
    content: `# HTTPS 常见漏洞

## 一、为什么 HTTPS 也会"破"

很多人以为"上了 HTTPS 就安全了"。其实 HTTPS 只是一个"框架"，它的安全性依赖于：

1. **协议设计**：TLS/SSL 协议本身是否有漏洞
2. **实现质量**：OpenSSL/GnuTLS 等库的代码是否有 bug
3. **配置正确**：服务器是否启用了弱算法、旧协议
4. **密钥强度**：RSA/DH 参数是否足够长

历史上这四个层面都出过严重漏洞。本章按时间顺序梳理 2011-2017 年间最严重的几个 HTTPS 漏洞，理解它们的原理和防御方法。

> 生活类比：HTTPS 就像一座城墙。协议设计是图纸（图纸画错了墙会塌）、实现质量是施工（豆腐渣工程）、配置是城门管理（开了侧门）、密钥强度是锁的等级（用了把儿童挂锁）。哪一环出问题都会被攻破。

## 二、BEAST（2011）

**漏洞名**：Browser Exploit Against SSL/TLS
**影响协议**：TLS 1.0 的 CBC 模式
**原理**：TLS 1.0 的初始向量（IV）是可预测的——每个记录的 IV 是上一个记录的最后一个密文块。攻击者通过中间人位置观察密文，配合恶意 JavaScript 在浏览器里反复发送精心构造的请求，可以逐字节猜出 Cookie。

> 关键点：BEAST 是"选择明文攻击"——攻击者能让浏览器反复加密"已知明文 + 猜测字节"，通过观察密文验证猜测。

**修复**：

1. 启用 TLS 1.1+（1.1 起用随机 IV）
2. 启用 RC4 套件规避（但 RC4 本身后来被发现不安全，已弃用）
3. 浏览器侧实施"记录分割"（把一个记录拆成两段，破坏预测）

今天只需禁用 TLS 1.0 即可彻底防住 BEAST。

## 三、CRIME（2012）

**漏洞名**：Compression Ratio Info-leak Made Easy
**原理**：TLS 支持压缩（TLS Compression）。攻击者通过中间人位置观察压缩后的密文长度，利用"压缩算法会消除重复内容"的特性——如果攻击者能注入部分明文（比如让浏览器把 \`Cookie: SID=\` 发出去），明文和攻击者注入的内容重复时压缩率会变高，密文变短。通过观察长度变化逐字节猜出 Cookie。

**修复**：禁用 TLS 压缩。现代浏览器和服务器都已默认关闭 TLS 压缩。

## 四、BREACH（2013）

**漏洞名**：Browser Reconnaissance and Exfiltration via Adaptive Compression of Hypertext
**原理**：CRIME 针对 TLS 层压缩，BREACH 针对 HTTP 层压缩（gzip）。攻击者诱导浏览器反复请求某个反射点（URL 参数会被回显到响应里），通过观察压缩后的响应长度猜出响应里的敏感内容（如 CSRF token）。

> 区别：CRIME 攻击请求头（Cookie），BREACH 攻击响应体。

**修复**：

1. 不压缩敏感响应（对包含 token 的响应禁用 gzip）
2. 给敏感内容加随机填充（让长度变化不可观测）
3. CSRF token 用每次请求都变的值

## 五、POODLE（2014）

**漏洞名**：Padding Oracle On Downgraded Legacy Encryption
**影响协议**：SSL 3.0 的 CBC 模式
**原理**：SSL 3.0 的填充校验不严格——服务器只检查最后一个字节（填充长度），不检查其余填充字节是否合法。攻击者通过降级攻击让客户端回退到 SSL 3.0，再利用填充预言机逐字节解密密文。

**修复**：完全禁用 SSL 3.0。POODLE 的出现直接推动了 SSL 3.0 的退场。

## 六、Heartbleed（2014）

**漏洞名**：CVE-2014-0160
**影响实现**：OpenSSL 1.0.1 到 1.0.1f
**原理**：这是最严重的 TLS 实现漏洞。OpenSSL 的 TLS Heartbeat 扩展（心跳扩展）有一个内存读取 bug——客户端发心跳请求时附带 payload 并声明 payload 长度，服务器按声明的长度回显。但 OpenSSL 没有校验声明长度是否 <= 实际 payload 长度。攻击者声明"我有 64KB 数据"但实际只发 1 字节，服务器就会把内存里紧挨着的 64KB 数据返回——这些数据可能包含私钥、用户密码、Session Ticket 等敏感信息。

> 生活类比：Heartbleed 就像快递员问你"包裹多大？"，你说"64 立方米"，但你只给了他一个鞋盒。他为了凑满 64 立方米，从隔壁仓库随便搬东西塞给你。

**修复**：

1. 升级 OpenSSL 到 1.0.1g 及以上
2. **重新生成私钥和证书**（旧私钥可能已泄露）
3. 重置所有可能泄露的凭证（用户 session、API token）

## 七、FREAK（2015）

**漏洞名**：Factoring Attack on RSA-EXPORT Keys
**原理**：90 年代美国限制强加密出口，服务器保留了"出口级"弱 RSA 套件（512 位 RSA）。现代服务器虽然不该启用，但很多厂商的代码里漏配了。攻击者通过降级攻击让客户端协商使用 512 位出口 RSA，然后几分钟内用普通算力分解 512 位 RSA，解密所有流量。

**修复**：禁用所有出口级弱套件（\`EXP-*\`）。现代 OpenSSL 默认不启用。

## 八、Logjam（2015）

**漏洞名**：Diffie-Hellman 弱参数攻击
**原理**：很多服务器使用 512 位或 768 位的 DH 参数。攻击者预计算这些常见弱参数的离散对数表，然后降级攻击让客户端用弱 DH，几秒内解密。Logjam 还揭示了一个更严重的问题：很多服务器共用同一组"通用 DH 素数"，攻击者花几个月算一次表，就能批量破解所有用该素数的服务器。

**修复**：

1. 用 2048+ 位 DH 参数（\`openssl dhparam -out dhparam.pem 2048\`）
2. 优先用 ECDHE（椭圆曲线 DH，目前无法被类似攻击）
3. 禁用弱 DH 套件

## 九、DROWN（2016）

**漏洞名**：Decrypting RSA with Obsolete and Weakened eNcryption
**原理**：服务器如果同时在 443 端口跑 TLS，又在别的端口跑 SSL 2.0（哪怕是完全不同的服务，比如老邮件服务器），攻击者可以通过 SSL 2.0 的 Bleichenbacher 漏洞拿到 RSA 密钥，然后用这把密钥解密同一台机器上 TLS 1.2 的流量。跨协议攻击非常阴险——你以为关了 HTTPS 的弱协议就安全了，结果被隔壁的 SSL 2.0 拖下水。

**修复**：

1. 全面禁用 SSL 2.0（所有端口、所有服务）
2. 不同服务用不同 RSA 密钥对

## 十、ROBOT（2017）

**漏洞名**：Return Of Bleichenbacher's Oracle Threat
**原理**：Bleichenbacher 1998 年发现的 RSA PKCS#1 v1.5 填充预言机攻击，20 年后又回来了。很多厂商（包括 Facebook、PayPal）的 TLS 实现里仍有这个 bug——服务器对错误填充的响应不一致（时间不同、错误码不同），攻击者据此构造预言机，逐字节解密 RSA 加密的预主密钥。

**修复**：打厂商补丁，或改用 ECDHE 套件（完全绕开 RSA 加密）。

## 十一、Demo 1：检测 Heartbleed

\`\`\`bash
# 方法一：用 nmap 的 ssl-heartbleed 脚本
# -p 443 指定端口
# --script ssl-heartbleed 调用 Heartbleed 检测脚本
nmap --script ssl-heartbleed -p 443 example.com

# 输出解读：
# 如果有 "VULNERABLE" 字样，说明服务器存在 Heartbleed 漏洞
# 如果是 "not vulnerable"，说明安全

# 方法二：用 openssl 手工触发心跳（仅用于学习，不要攻击别人）
# -tlsextdebug 打印 TLS 扩展调试信息
# 然后输入心跳请求（需要手工构造二进制，这里仅演示思路）
echo | openssl s_client -connect example.com:443 -tlsextdebug 2>/dev/null | grep "heartbeat"
\`\`\`

nmap 输出示例（有漏洞）：

\`\`\`text
PORT    STATE SERVICE
443/tcp open  https
| ssl-heartbleed:
|   VULNERABLE:
|   The Heartbleed Bug is a serious vulnerability...
|     State: VULNERABLE (risk factor: High)
\`\`\`

## 十二、Demo 2：检测 POODLE

\`\`\`bash
# 方法一：nmap 的 ssl-poodle 脚本
nmap --script ssl-poodle -p 443 example.com

# 方法二：用 openssl 尝试 SSL 3.0 握手
# 如果握手成功说明服务器还启用 SSL 3.0（有 POODLE 风险）
# 如果握手失败（handshake failure）说明已禁用
openssl s_client -connect example.com:443 -ssl3 < /dev/null 2>&1 | grep -E "handshake|Cipher is"

# 方法三：用 testssl.sh 检测
./testssl.sh -P example.com
\`\`\`

修复（Nginx 配置）：

\`\`\`nginx
# 禁用 SSL 2.0 和 3.0，只留 TLS 1.2/1.3
ssl_protocols TLSv1.2 TLSv1.3;
\`\`\`

## 十三、Demo 3：检测 FREAK / Logjam

\`\`\`bash
# 用 nmap 枚举所有支持的套件
# 看输出里有没有 EXP-（出口级，FREAK）或 DH 小于 1024 位（Logjam）
nmap --script ssl-enum-ciphers -p 443 example.com

# 关注输出里的这几项：
# EXP-RC4-MD5       -> FREAK 漏洞（出口级弱 RSA）
# TLS_DHE_RSA_WITH_...  -> 看密钥交换的 DH 参数大小

# 用 testssl.sh 专门检测
./testssl.sh -F example.com    # 检测 FREAK
./testssl.sh -J example.com    # 检测 Logjam
\`\`\`

修复：

\`\`\`nginx
# 1. 禁用所有 EXP-* 出口级套件（ssl_ciphers 里不写就行）
# 2. 用 2048+ 位 DH 参数
# 生成 DH 参数（一次性，约 1 分钟）
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048

# Nginx 配置
ssl_dhparam /etc/nginx/dhparam.pem;
# ssl_ciphers 里只留 ECDHE 套件，不用 DHE 弱参数
\`\`\`

## 十四、Demo 4：用 testssl.sh 全面扫描漏洞

\`\`\`bash
# --vulnerable 一次性跑所有漏洞检测
# 涵盖：Heartbleed、POODLE、CCS Injection、FREAK、Logjam、DROWN、ROBOT 等
./testssl.sh --vulnerable example.com

# 输出会列出每个漏洞的检测结果：
# OK   -> 不受影响
# HIGH -> 高危，必须修
# CRITICAL -> 严重

# 单独测 DROWN（看是否还有 SSL 2.0 残留）
./testssl.sh -D example.com

# 单独测 ROBOT
./testssl.sh -O example.com
\`\`\`

## 十五、Demo 5：防御措施对照表

| 漏洞 | 根因 | 防御措施 |
|------|------|----------|
| BEAST | TLS 1.0 CBC 可预测 IV | 禁用 TLS 1.0，启用 1.2+ |
| CRIME | TLS 压缩泄露长度 | 禁用 TLS 压缩 |
| BREACH | HTTP gzip + 反射点 | 敏感响应不压缩 / 加随机填充 |
| POODLE | SSL 3.0 填充校验弱 | 禁用 SSL 3.0 |
| Heartbleed | OpenSSL 心跳 bug | 升级 OpenSSL，重置私钥和凭证 |
| FREAK | 启用出口级弱 RSA | 禁用 EXP-* 套件 |
| Logjam | 弱 DH 参数 | 用 2048+ 位 DH，优先 ECDHE |
| DROWN | SSL 2.0 跨协议攻击 | 全面禁用 SSL 2.0 |
| ROBOT | RSA PKCS#1 填充预言机回归 | 打补丁，改用 ECDHE 套件 |

## 十六、Demo 6：用 OpenSSL 检查自己服务器是否安全

\`\`\`bash
# 第一步：检查 OpenSSL 版本（确保打过补丁）
# Heartbleed 影响 1.0.1 到 1.0.1f，1.0.1g 及以上安全
# 1.1.0+、3.0+ 都安全
openssl version

# 第二步：检查 OpenSSL 支持的协议
# 看 "Supported protocols" 部分
openssl ciphers -v | awk '{print $2}' | sort -u

# 第三步：检查是否还支持 SSL 3.0（应该没有）
openssl s_client -connect localhost:443 -ssl3 < /dev/null 2>&1 | grep -E "protocol|Cipher is"

# 第四步：检查服务器证书的 RSA 密钥长度
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \\
  | openssl x509 -noout -text | grep "Public-Key"
# 输出形如：Public-Key: (2048 bit)，至少 2048 位才安全

# 第五步：检查支持的套件里有没有弱算法
# grep 看有没有 RC4、3DES、EXPORT、NULL、MD5
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>/dev/null \\
  | grep "Cipher is"
\`\`\`

Nginx 综合防御配置（防住上述所有漏洞）：

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # === 协议：只 TLS 1.2/1.3（防 BEAST/POODLE/Logjam）===
    ssl_protocols TLSv1.2 TLSv1.3;

    # === 套件：只 ECDHE + AEAD（防 FREAK/Logjam/ROBOT）===
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # === DH 参数：2048+ 位（防 Logjam）===
    ssl_dhparam /etc/nginx/dhparam.pem;

    # === 曲线：现代曲线（防弱椭圆曲线攻击）===
    ssl_ecdh_curve X25519:secp384r1;

    # === HSTS（防降级）===
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
\`\`\`

## 十七、漏洞时间线表

| 年份 | 漏洞 | 严重度 | 主要影响 |
|------|------|--------|----------|
| 2011 | BEAST | 高 | TLS 1.0 CBC，可窃取 Cookie |
| 2012 | CRIME | 中 | TLS 压缩泄露 |
| 2013 | BREACH | 中 | HTTP 压缩泄露响应内容 |
| 2014 | POODLE | 高 | SSL 3.0 弃用导火索 |
| 2014 | Heartbleed | 严重 | OpenSSL 内存泄露，私钥可能泄露 |
| 2015 | FREAK | 高 | 出口级弱 RSA 被破解 |
| 2015 | Logjam | 高 | 弱 DH 参数被预计算破解 |
| 2016 | DROWN | 高 | SSL 2.0 跨协议攻击 TLS |
| 2017 | ROBOT | 高 | RSA 填充预言机回归 |

## 十八、本章小结

| 要点 | 说明 |
|------|------|
| 漏洞来源 | 协议设计、实现 bug、配置错误、密钥强度 |
| BEAST/POODLE | 禁用 TLS 1.0 和 SSL 3.0 即可防御 |
| Heartbleed | 实现 bug，升级 OpenSSL + 重置私钥 |
| FREAK/Logjam | 禁用弱套件 + 用强 DH 参数 |
| DROWN | 全面禁用 SSL 2.0（跨服务、跨端口） |
| ROBOT | 改用 ECDHE 套件绕开 RSA 加密 |
| 通用防御 | TLS 1.2+ + ECDHE + AEAD + HSTS |
| 检测工具 | nmap、testssl.sh、sslyze |
`
  },

  // ============================================================
  // 第四章：HTTPS 故障排查
  // ============================================================
  {
    id: "hs-troubleshoot",
    group: "HTTPS 安全与运维",
    icon: "🔧",
    title: "HTTPS 故障排查",
    content: `# HTTPS 故障排查

## 一、为什么 HTTPS 这么容易出问题

HTTPS 比纯 HTTP 多了一整套证书和握手机制，任何一环出错都会让浏览器直接拒绝访问——而且错误信息往往很"吓人"，比如红色大叉、"您的连接不是私密连接"。常见故障来源：

1. **证书问题**：过期、链不完整、域名不匹配、自签未信任
2. **协议问题**：客户端和服务器协议版本不兼容
3. **配置问题**：SNI 缺失、重定向循环、混合内容
4. **网络问题**：OCSP 查询超时、中间设备拦截

> 生活类比：HTTP 故障像"门没锁好"——网页能开但不安全；HTTPS 故障像"门禁卡刷不开"——直接进不去，但告诉你卡哪里坏了（错误码）。排查 HTTPS 就是看懂这些错误码背后的根因。

## 二、常见浏览器错误码

| 错误码 | 含义 | 常见原因 |
|--------|------|----------|
| \`NET::ERR_CERT_AUTHORITY_INVALID\` | 证书颁发机构无效 | 自签证书 / 缺中间证书 / CA 不被信任 |
| \`NET::ERR_CERT_COMMON_NAME_INVALID\` | 通用名无效 | 证书域名和访问域名不匹配 |
| \`NET::ERR_CERT_DATE_INVALID\` | 日期无效 | 证书过期 / 系统时间错 |
| \`NET::ERR_CERT_REVOKED\` | 证书被吊销 | 证书被 CA 撤销 |
| \`ERR_SSL_PROTOCOL_ERROR\` | SSL 协议错误 | 协议版本不匹配 / 套件协商失败 |
| \`ERR_TOO_MANY_REDIRECTS\` | 重定向过多 | HTTPS 重定向循环 |
| \`ERR_CERT_WEAK_SIGNATURE_ALGORITHM\` | 弱签名算法 | 证书用 SHA1 签名（已弃用） |
| \`ERR_CERT_SYMANTEC_LEGACY\` | 赛门铁克遗留 | 老 Symantec 证书被 Chrome 不信任 |

## 三、Demo 1：证书链不完整（最常见错误）

这是新手最容易踩的坑。证书文件只配了服务器证书，没配中间证书，浏览器找不到"服务器证书 → 中间证书 → 根 CA"的完整链路，就报 \`NET::ERR_CERT_AUTHORITY_INVALID\`。

\`\`\`bash
# 第一步：诊断证书链
# -showcerts 打印服务器返回的所有证书
# 看 "Verify return code" 字段
echo | openssl s_client -connect example.com:443 -servername example.com -showcerts 2>/dev/null \\
  | grep "Verify return code"

# 输出解读：
# Verify return code: 0 (ok)              -> 链完整，没问题
# Verify return code: 21 (unable to verify the first certificate) -> 链不完整

# 第二步：用 curl 复现
# -v 显示详细握手过程
curl -v https://example.com 2>&1 | grep -E "verify|SSL certificate"

# curl 输出会显示：
# * SSL certificate problem: unable to get local issuer certificate
# 说明服务器没发中间证书，curl 在本地找不到签发者
\`\`\`

修复方法：用 \`fullchain.pem\`（包含服务器证书 + 中间证书）替代单独的 \`cert.pem\`。

\`\`\`bash
# Let's Encrypt 的目录结构
# /etc/letsencrypt/live/example.com/
#   cert.pem        -> 只有服务器证书
#   chain.pem       -> 只有中间证书
#   fullchain.pem   -> 服务器证书 + 中间证书（应该用这个）
#   privkey.pem     -> 私钥

# 如果没有 fullchain.pem，手工拼接
cat cert.pem chain.pem > fullchain.pem

# 验证 fullchain.pem 里有几张证书（应该 >= 2）
grep -c "BEGIN CERTIFICATE" fullchain.pem
\`\`\`

Nginx 配置：

\`\`\`nginx
# 错误：只配了服务器证书
# ssl_certificate /etc/letsencrypt/live/example.com/cert.pem;

# 正确：用 fullchain
ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
\`\`\`

改完重载：\`sudo nginx -t && sudo nginx -s reload\`，再测 \`Verify return code\` 应该变成 \`0 (ok)\`。

## 四、Demo 2：证书过期

证书都有有效期（Let's Encrypt 是 90 天）。过期后浏览器报 \`NET::ERR_CERT_DATE_INVALID\`，客户端拒绝连接。

\`\`\`bash
# 查看本地证书文件的有效期
# -dates 只输出起止日期
# -noout 不输出 PEM 文本
openssl x509 -in cert.pem -dates -noout

# 输出形如：
# notBefore=Mar  1 03:21:00 2024 GMT
# notAfter=May 30 03:21:00 2024 GMT

# 在线查看网站证书有效期（不用先下载到本地）
# echo | 给 openssl s_client 一个空输入避免卡住
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \\
  | openssl x509 -noout -enddate

# 输出：notAfter=May 30 03:21:00 2024 GMT
\`\`\`

监控脚本（提前 14 天告警）：

\`\`\`bash
#!/bin/bash
# check-cert-expiry.sh - 证书到期监控
# 用法：./check-cert-expiry.sh example.com

DOMAIN=$1                              # 从参数取域名
DAYS_WARNING=14                        # 提前 14 天告警

# 拿到证书截止日期（秒级时间戳）
EXPIRY_DATE=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null \\
  | openssl x509 -noout -enddate \\
  | cut -d= -f2)

# 转成 Unix 时间戳
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
NOW_EPOCH=$(date +%s)

# 算剩余天数
DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

if [ "$DAYS_LEFT" -lt "$DAYS_WARNING" ]; then
  echo "[告警] $DOMAIN 证书将在 \${DAYS_LEFT} 天后过期（$EXPIRY_DATE）"
  # 这里可以接入邮件/钉钉/飞书告警
  exit 1
else
  echo "[OK] $DOMAIN 证书还有 \${DAYS_LEFT} 天过期"
fi
\`\`\`

部署到 crontab：

\`\`\`bash
# 每天凌晨 3 点检查所有域名
0 3 * * * /opt/check-cert-expiry.sh example.com >> /var/log/cert-check.log 2>&1
0 3 * * * /opt/check-cert-expiry.sh www.example.com >> /var/log/cert-check.log 2>&1
\`\`\`

> 进阶：用 certbot 的自动续期（\`certbot renew\`），配合 systemd timer 或 cron，到期前自动申请新证书。

## 五、Demo 3：SNI 问题（一个 IP 多证书）

一台服务器一个 IP 上托管多个 HTTPS 站点时，TLS 握手阶段客户端必须通过 SNI（Server Name Indication）告诉服务器"我要访问哪个域名"，服务器才能返回对应的证书。如果客户端不发 SNI，或服务器没配 SNI，就会返回默认证书——域名不匹配，报 \`NET::ERR_CERT_COMMON_NAME_INVALID\`。

\`\`\`bash
# 不带 SNI 的连接（可能拿到默认证书，域名不匹配）
# 注意：很多现代 openssl 默认带 SNI，要观察差异
openssl s_client -connect example.com:443 < /dev/null 2>/dev/null \\
  | openssl x509 -noout -subject

# 带 SNI 的连接（-servername 指定要访问的域名）
# 服务器会返回该域名对应的证书
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>/dev/null \\
  | openssl x509 -noout -subject

# 对比两个输出，如果 subject 不一样，说明服务器配了多证书，必须靠 SNI 区分
\`\`\`

Nginx 多站点 SNI 配置：

\`\`\`nginx
# 站点 A
server {
    listen 443 ssl;
    server_name site-a.com;            # SNI 匹配 site-a.com
    ssl_certificate     /etc/ssl/site-a/fullchain.pem;
    ssl_certificate_key /etc/ssl/site-a/privkey.pem;
    location / { proxy_pass http://127.0.0.1:8081; }
}

# 站点 B（同一个 IP，另一个端口/证书）
server {
    listen 443 ssl;
    server_name site-b.com;            # SNI 匹配 site-b.com
    ssl_certificate     /etc/ssl/site-b/fullchain.pem;
    ssl_certificate_key /etc/ssl/site-b/privkey.pem;
    location / { proxy_pass http://127.0.0.1:8082; }
}
\`\`\`

> 老客户端（如 Windows XP 上的 IE6、Java 6）不支持 SNI，访问多证书站点会拿到默认证书。现代客户端都支持 SNI，这个问题基本消失。

## 六、Demo 4：HTTPS 重定向循环

症状：浏览器报 \`ERR_TOO_MANY_REDIRECTS\`，地址栏 URL 在 \`http://\` 和 \`https://\` 之间反复跳。

原因：反向代理（Nginx/CDN）和后端应用之间的"协议认知"不一致。常见场景：

1. Nginx 在前面做 HTTPS 终止，转给后端是 HTTP
2. 后端应用发现请求是 HTTP，强制重定向到 HTTPS
3. 重定向回到 Nginx，Nginx 又转 HTTP 给后端
4. 死循环

修复：Nginx 转发时带上 \`X-Forwarded-Proto\` 头，告诉后端"原始协议是 HTTPS"，后端就不再重定向。

\`\`\`nginx
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;

        # === 关键：把原始协议传给后端 ===
        # $scheme 在 443 端口监听时是 "https"
        proxy_set_header X-Forwarded-Proto $scheme;

        # 顺便传其他常用头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

后端（以 Node.js Express 为例）配置：

\`\`\`javascript
// 让 Express 信任反向代理传来的头
// 第一个参数是信任的代理数量（1 表示信任 1 层代理）
app.set('trust proxy', 1);

// 强制 HTTPS 中间件
app.use((req, res, next) => {
  // req.protocol 会读取 X-Forwarded-Proto 头（因为开了 trust proxy）
  if (req.protocol === 'https') {
    next();                        // 已经是 HTTPS，放行
  } else {
    // 不是 HTTPS 才重定向
    res.redirect(301, 'https://' + req.headers.host + req.url);
  }
});
\`\`\`

## 七、Demo 5：OCSP 查询失败

OCSP（在线证书状态协议）让客户端实时查询证书是否被吊销。如果 OCSP 服务器响应慢或不可达，浏览器会卡在证书校验阶段，页面打开缓慢。

\`\`\`bash
# 手工查询证书的 OCSP 状态
# 第一步：从证书里提取 OCSP URL
openssl x509 -in cert.pem -noout -ocsp_uri
# 输出形如：http://ocsp.int-x3.letsencrypt.org

# 第二步：用 openssl ocsp 查询
# -issuer 指定签发者（中间证书）
# -cert 指定要查的证书
# -url 指定 OCSP 服务器
openssl ocsp -issuer chain.pem -cert cert.pem \\
  -url "http://ocsp.int-x3.letsencrypt.org" -resp_text

# 输出解读：
# Response verify OK
# cert.pem: good       -> 证书有效（未被吊销）
# cert.pem: revoked    -> 证书被吊销
\`\`\`

如果 OCSP 查询经常超时，建议启用 OCSP Stapling（让服务器替客户端查并缓存 OCSP 响应）：

\`\`\`nginx
ssl_stapling on;                          # 启用 Stapling
ssl_stapling_verify on;                   # 校验 OCSP 响应签名
ssl_trusted_certificate /path/chain.pem;  # 信任链
resolver 8.8.8.8 8.8.4.4 valid=300s;      # DNS 解析器（查 OCSP URL 要用）
resolver_timeout 5s;                      # DNS 超时
\`\`\`

## 八、Demo 6：混合内容（HTTPS 页面加载 HTTP 资源）

症状：HTTPS 页面里的图片、脚本、样式表用了 \`http://\` 协议，浏览器把它们拦截，控制台报错：

\`\`\`text
Mixed Content: The page at 'https://example.com/' was loaded over HTTPS,
but requested an insecure script 'http://cdn.example.com/lib.js'.
This request has been blocked.
\`\`\`

排查方法：

1. 打开浏览器 DevTools（F12）
2. 切到 Console（控制台），看黄色/红色警告
3. 切到 Network（网络），过滤出被拦截的请求

修复方法：

**方法一**：把所有资源 URL 改成 \`https://\` 或协议相对 URL \`//\`

\`\`\`html
<!-- 错误：HTTP 资源会被拦截 -->
<script src="http://cdn.example.com/lib.js"></script>

<!-- 正确：HTTPS -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- 也可：协议相对，自动用当前页面协议 -->
<script src="//cdn.example.com/lib.js"></script>
\`\`\`

**方法二**：用 CSP 头强制升级不安全请求

\`\`\`nginx
# 让浏览器自动把所有 http:// 请求升级为 https://
add_header Content-Security-Policy "upgrade-insecure-requests" always;
\`\`\`

## 九、Demo 7：用 openssl s_client 综合诊断

\`openssl s_client\` 是 HTTPS 排查的瑞士军刀，一个命令能看到握手全貌。

\`\`\`bash
# 综合诊断命令
# -connect 指定目标
# -servername 指定 SNI
# -showcerts 显示所有证书
# -debug 显示详细调试信息
openssl s_client -connect example.com:443 -servername example.com -showcerts < /dev/null 2>/dev/null

# 关注输出里的这几行：
# ---
# Certificate chain
#  0 s:CN=example.com                  # 服务器证书的 subject
#    i:CN=R3                            # 签发者（中间 CA）
#  1 s:CN=R3                            # 中间证书
#    i:CN=ISRG Root X1                  # 根 CA
# ---
# Protocol  : TLSv1.3                   # 协商的协议版本
# Cipher    : TLS_AES_256_GCM_SHA384    # 协商的套件
# ---
# Verify return code: 0 (ok)            # 验证结果（0 = 通过）
\`\`\`

诊断清单：

| 输出字段 | 健康值 | 异常含义 |
|----------|--------|----------|
| Protocol | TLSv1.2 / TLSv1.3 | SSLv3/TLSv1.0 → 协议过旧 |
| Cipher | 含 GCM/ChaCha20 | 含 RC4/3DES → 套件弱 |
| Verify return code | 0 (ok) | 非 0 → 证书链问题 |
| Certificate chain | >= 2 张证书 | 只有 1 张 → 缺中间证书 |
| subject CN | 与访问域名一致 | 不一致 → 域名不匹配 |

## 十、常见错误对照表

| 错误码 | 根因 | 修复 |
|--------|------|------|
| ERR_CERT_AUTHORITY_INVALID | 自签 / 缺中间证书 / 不信任的 CA | 用 fullchain / 装 CA 证书 / 换受信 CA |
| ERR_CERT_COMMON_NAME_INVALID | 域名不匹配 / SNI 缺失 | 证书加该域名 / 配 SNI |
| ERR_CERT_DATE_INVALID | 证书过期 / 系统时间错 | 续期 / 校准系统时间 |
| ERR_CERT_REVOKED | 证书被吊销 | 重新申请 |
| ERR_SSL_PROTOCOL_ERROR | 协议不匹配 | 启用 TLS 1.2+ |
| ERR_TOO_MANY_REDIRECTS | HTTPS 重定向循环 | 传 X-Forwarded-Proto |
| Mixed Content | HTTPS 页面引 HTTP 资源 | 改 https:// / 用 CSP |

## 十一、本章小结

| 要点 | 说明 |
|------|------|
| 排查思路 | 先看错误码定方向，再用 openssl s_client 验证 |
| 链不完整 | 用 fullchain.pem，最常见坑 |
| 证书过期 | 定时监控 + 自动续期 |
| SNI 问题 | 一个 IP 多证书必须配 SNI |
| 重定向循环 | 反向代理传 X-Forwarded-Proto |
| OCSP 慢 | 启用 OCSP Stapling |
| 混合内容 | 全 HTTPS 或 CSP upgrade-insecure-requests |
| 瑞士军刀 | openssl s_client -showcerts 一把梭 |
`
  },

  // ============================================================
  // 第五章：HTTPS 工具集
  // ============================================================
  {
    id: "hs-tools",
    group: "HTTPS 安全与运维",
    icon: "🧰",
    title: "HTTPS 工具集",
    content: `# HTTPS 工具集

## 一、为什么要熟悉这么多工具

HTTPS 涉及证书生成、握手调试、漏洞扫描、协议分析等多个环节，没有任何一个工具能搞定所有事。不同工具有不同的"专长"：

- \`openssl\`：万能瑞士军刀，能生成密钥、签证书、查证书、测连接，但参数多、难记
- \`curl\`：测 HTTPS 请求和握手细节
- \`nmap\`：扫描端口和协议套件
- \`testssl.sh\`：专项漏洞扫描，输出友好
- \`sslyze\`：Python 工具，可集成 CI
- \`Wireshark\`：抓包分析 TLS 报文
- \`cryptography\`（Python）：编程操作证书

> 生活类比：HTTPS 工具集就像修车工具箱。openssl 是扳手（什么都拧）、curl 是试驾（跑一圈看毛病）、nmap 是体检仪（扫一遍）、testssl.sh 是专项检测仪（专门查某个故障）、Wireshark 是内窥镜（看内部细节）。

## 二、Demo 1：openssl 常用命令速查

openssl 是 HTTPS 工作的基石。下面是最常用的命令分类速查。

### 2.1 生成密钥和证书

\`\`\`bash
# 生成 RSA 私钥（2048 位）
# genrsa 表示生成 RSA 密钥
# -out 指定输出文件
# 2048 是密钥位数
openssl genrsa -out key.pem 2048

# 生成 ECC 私钥（更短更快更安全）
# ecparam 生成椭圆曲线参数
# -name prime256v1 指定曲线
# -genkey 生成密钥
openssl ecparam -name prime256v1 -genkey -out ecc-key.pem

# 基于 RSA 私钥生成 CSR（证书签名请求）
# -new 表示新建 CSR
# -key 指定私钥
# -out 指定 CSR 输出文件
openssl req -new -key key.pem -out csr.pem

# 查看 CSR 内容（确认信息填对了）
openssl req -in csr.pem -text -noout

# 自签证书（测试用，不被浏览器信任）
# -x509 表示输出 X.509 自签证书而非 CSR
# -days 365 有效期 365 天
# -key 用刚才的私钥
openssl req -x509 -new -key key.pem -days 365 -out cert.pem

# 一条命令生成自签证书（带主题信息）
# -subj 直接指定主题，不用交互式输入
openssl req -x509 -newkey rsa:2048 -nodes \\
  -keyout key.pem -out cert.pem -days 365 \\
  -subj "/C=CN/ST=Beijing/L=Beijing/O=MyOrg/CN=localhost"
\`\`\`

### 2.2 查看证书

\`\`\`bash
# 查看证书全部信息
# -text 以可读文本输出
# -noout 不输出 PEM 文本
openssl x509 -in cert.pem -text -noout

# 只看主题（subject）
openssl x509 -in cert.pem -subject -noout

# 只看签发者（issuer）
openssl x509 -in cert.pem -issuer -noout

# 只看有效期
openssl x509 -in cert.pem -dates -noout

# 只看指纹
openssl x509 -in cert.pem -fingerprint -noout

# 查看网站证书（在线，不下载到本地）
# echo | 提供空输入让 s_client 退出
# | 管道把抓到的证书交给 x509 解析
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \\
  | openssl x509 -text -noout
\`\`\`

### 2.3 测试连接

\`\`\`bash
# 基础连接测试
openssl s_client -connect example.com:443

# 显示完整证书链
openssl s_client -connect example.com:443 -showcerts

# 指定 SNI（多证书服务器必须）
openssl s_client -connect example.com:443 -servername example.com

# 指定协议版本（测试服务器是否支持某版本）
openssl s_client -connect example.com:443 -tls1_2   # 强制 TLS 1.2
openssl s_client -connect example.com:443 -tls1_3   # 强制 TLS 1.3

# 指定套件
openssl s_client -connect example.com:443 -cipher 'ECDHE-RSA-AES128-GCM-SHA256'

# 查看 OCSP Stapling
openssl s_client -connect example.com:443 -status
\`\`\`

## 三、Demo 2：curl HTTPS 选项

curl 不仅能发请求，还能控制 TLS 行为，是调试 HTTPS 客户端的首选。

\`\`\`bash
# 跳过证书验证（仅测试自签证书用，生产别这么干）
# -k 等价于 --insecure
curl -k https://localhost

# 指定 CA 证书（验证自签或私有 CA）
# --cacert 指定受信任的 CA 文件
curl --cacert /path/ca.pem https://internal.example.com

# 指定客户端证书（双向 TLS）
# --cert 客户端证书，--key 客户端私钥
curl --cert client.crt --key client.key https://mtls.example.com

# 指定 TLS 版本
# --tlsv1.2 强制最低 TLS 1.2
# --tls-max 1.2 限制最高 TLS 1.2（测试兼容性用）
curl --tlsv1.2 https://example.com
curl --tls-max 1.3 https://example.com

# 看详细握手过程
# -v 输出 TLS 协商细节
curl -v https://example.com 2>&1 | grep -E "SSL|TLS|cipher|certificate"

# 只取响应头
curl -I https://example.com

# 跟随重定向
curl -L https://example.com

# 输出完整连接时间分解
curl -w "DNS:%{time_namelookup} 连接:%{time_connect} TLS:%{time_appconnect} 总:%{time_total}\\n" \\
  -o /dev/null -s https://example.com
\`\`\`

curl -v 输出里的关键信息：

\`\`\`text
* Trying 93.184.216.34:443...                   # TCP 连接阶段
* Connected to example.com
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384   # 协商结果
* ALPN: server accepted h2                      # 协商出 HTTP/2
* Server certificate:
*  subject: CN=example.com                      # 证书主题
*  start date: Mar  1 03:21:00 2024 GMT
*  expire date: May 30 03:21:00 2024 GMT
*  issuer: C=US; O=Let's Encrypt; CN=R3         # 签发者
*  SSL certificate verify ok.                   # 验证通过
\`\`\`

## 四、Demo 3：nmap SSL 扫描

nmap 的 SSL 脚本能枚举套件、检测漏洞、查看证书。

\`\`\`bash
# 枚举所有支持的密码套件
# --script ssl-enum-ciphers 调用套件枚举脚本
# -p 443 指定端口
nmap --script ssl-enum-ciphers -p 443 example.com

# 输出会按协议分组列出套件，并标注强度：
# 64-bit cipher suites offered (WEAK)   # 弱套件，要禁用
# 128-bit cipher suites offered (STRONG) # 强套件
# 256-bit cipher suites offered (STRONG)

# 查看服务器证书详情
nmap --script ssl-cert -p 443 example.com

# 综合扫描（套件 + 证书 + 漏洞）
nmap --script ssl-enum-ciphers,ssl-cert,ssl-heartbleed,ssl-poodle -p 443 example.com

# 扫描多个端口（有些服务在非标准端口跑 HTTPS）
nmap --script ssl-enum-ciphers -p 443,8443,4443 example.com
\`\`\`

## 五、Demo 4：Wireshark 解析 TLS

Wireshark 是抓包分析工具，能看到 TLS 握手报文的每个字段。但 TLS 流量是加密的，要看明文需要解密。

### 5.1 抓 TLS 握手

\`\`\`text
1. 启动 Wireshark，选择网卡
2. 过滤条件输入：tcp.port == 443
3. 在浏览器访问 https://example.com
4. 抓到的包里能看到：
   - Client Hello（客户端问候，含支持的套件列表）
   - Server Hello（服务器问候，选定的套件）
   - Certificate（服务器发证书）
   - Key Exchange（密钥交换）
   - Change Cipher Spec（切换到加密）
   - Application Data（加密的应用数据）
\`\`\`

### 5.2 设置 SSLKEYLOGFILE 解密

要让 Wireshark 解密 TLS 流量，需要拿到会话密钥。浏览器支持把密钥导出到文件：

\`\`\`bash
# 在启动浏览器前设置环境变量
# SSLKEYLOGFILE 指定密钥日志文件路径
export SSLKEYLOGFILE=/tmp/sslkeys.log

# 启动浏览器（Chrome/Firefox 都支持）
google-chrome &

# 访问 https 网站后，/tmp/sslkeys.log 会有形如：
# CLIENT_RANDOM <随机数> <主密钥>
\`\`\`

Wireshark 配置：

\`\`\`text
1. 编辑 → 首选项 → Protocols → TLS
2. "(Pre)-Master-Secret log filename" 填 /tmp/sslkeys.log
3. 确定，重新加载抓包文件
4. 之前的 "Application Data" 变成可读的 HTTP 报文
\`\`\`

> 注意：TLS 1.3 用临时密钥，SSLKEYLOGFILE 也能解密，但需要浏览器版本够新。

## 六、Demo 5：sslyze 工具

sslyze 是 Python 写的 TLS 扫描器，输出结构化，适合 CI/CD。

\`\`\`bash
# 安装
pip install sslyze

# 常规扫描（等价于 SSL Labs 基础测试）
sslyze --regular example.com

# 单项扫描：Heartbleed
sslyze --heartbleed example.com

# 单项扫描：ROBOT
sslyze --robot example.com

# 单项扫描：OpenSSL CCS 注入
sslyze --openssl_ccs example.com

# 检查是否支持 SSL 3.0（防 POODLE）
sslyze --ssl3 example.com

# 检查证书链
sslyze --certinfo example.com

# 输出 JSON 给程序处理
sslyze --json_out result.json --regular example.com

# 同时扫多个端口
sslyze example.com:443 example.com:8443
\`\`\`

JSON 结果节选：

\`\`\`json
{
  "server_scan_result": {
    "server_location": {"hostname": "example.com", "port": 443},
    "scan_result": {
      "ssl_2_0_cipher_suites": {"result": {"accepted_cipher_suites": []}},
      "ssl_3_0_cipher_suites": {"result": {"accepted_cipher_suites": []}},
      "tls_1_2_cipher_suites": {
        "result": {
          "accepted_cipher_suites": [
            {"cipher": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"}
          ]
        }
      },
      "heartbleed": {"result": {"is_vulnerable": false}}
    }
  }
}
\`\`\`

CI/CD 集成示例（Python 脚本）：

\`\`\`python
# 扫描并阻断不安全配置
import subprocess, json

# 跑 sslyze 拿 JSON 结果
result = subprocess.run(
    ["sslyze", "--json_out", "-", "--regular", "example.com"],
    capture_output=True, text=True
)
data = json.loads(result.stdout)

# 检查是否有漏洞
scan = data["server_scan_result"]["scan_result"]
issues = []
if scan["heartbleed"]["result"]["is_vulnerable"]:
    issues.append("Heartbleed 漏洞")
if scan["ssl_3_0_cipher_suites"]["result"]["accepted_cipher_suites"]:
    issues.append("仍启用 SSL 3.0")

if issues:
    print("部署阻断，发现问题：" + ", ".join(issues))
    exit(1)   # CI 失败
else:
    print("TLS 配置检查通过")
\`\`\`

## 七、Demo 6：testssl.sh 工具

testssl.sh 是最全面的 shell 版 TLS 扫描器，输出彩色友好，适合人工排查。

\`\`\`bash
# 安装
git clone https://github.com/drwetter/testssl.sh
cd testssl.sh

# 完整扫描（最常用）
./testssl.sh example.com

# 只测漏洞
./testssl.sh --vulnerable example.com

# 逐个测试每个套件
./testssl.sh --each-cipher example.com

# 测试协议版本
./testssl.sh -t 13 example.com    # 测 TLS 1.3
./testssl.sh -P example.com       # 测所有协议

# 测试特定套件
./testssl.sh -E example.com       # 测 ECDHE 套件

# 输出 HTML 报告
./testssl.sh --htmlfile report.html example.com

# 输出 JSON 报告
./testssl.sh --jsonfile report.json example.com

# 测试非标准端口
./testssl.sh example.com:8443

# 测试邮件服务器的 STARTTLS
./testssl.sh -t smtp -p 587 mail.example.com
\`\`\`

testssl.sh 的输出分多个段落，每段都有彩色标注（绿/黄/红）：

\`\`\`text
 Testing protocols via sockets except NPN+ALPN
 SSLv2      not offered (OK)         # 绿色，SSLv2 已禁用
 SSLv3      not offered (OK)         # 绿色
 TLS 1      not offered              # 绿色（已禁用旧协议）
 TLS 1.1    not offered              # 绿色
 TLS 1.2    offered (OK)             # 绿色
 TLS 1.3    offered (OK)             # 绿色

 Testing cipher categories
 NULL ciphers               not offered (OK)
 Anonymous NULL Ciphers     not offered (OK)
 RC4 ciphers                not offered (OK)        # 绿色，RC4 已禁用
 3DES ciphers               not offered (OK)        # 绿色
 Forward Secrecy            offered (OK)            # 绿色，有前向保密

 Testing server vulnerabilities
 Heartbleed                 not vulnerable (OK)     # 绿色
 CCS                        not vulnerable (OK)
 POODLE                     not vulnerable (OK)
 FREAK                      not vulnerable (OK)
 Logjam                     not vulnerable (OK)
 DROWN                      not vulnerable (OK)
 ROBOT                      not vulnerable (OK)
\`\`\`

## 八、Demo 7：Python 工具

用 Python 的 \`cryptography\` 库编程操作证书，适合自动化脚本。

\`\`\`python
# 安装：pip install cryptography requests
from cryptography import x509                          # X.509 操作
from cryptography.hazmat.backends import default_backend  # 默认后端
from cryptography.hazmat.primitives import hashes       # 哈希算法
from cryptography.hazmat.primitives.asymmetric import rsa  # RSA
from cryptography.hazmat.primitives import serialization   # 序列化
import requests                                         # HTTP 客户端

# ---------- 1. 加载并解析证书 ----------
def inspect_cert(path):
    # 读 PEM 文件
    with open(path, "rb") as f:
        pem_data = f.read()
    # 加载成证书对象
    cert = x509.load_pem_x509_certificate(pem_data, default_backend())

    # 主题（subject）
    print("主题:", cert.subject.rfc4514_string())
    # 签发者（issuer）
    print("签发者:", cert.issuer.rfc4514_string())
    # 序列号
    print("序列号:", cert.serial_number)
    # 有效期
    print("生效:", cert.not_valid_before)
    print("过期:", cert.not_valid_after)
    # 公钥长度
    pub = cert.public_key()
    if isinstance(pub, rsa.RSAPublicKey):
        print("RSA 公钥位数:", pub.key_size)
    # 签名算法
    print("签名算法:", cert.signature_algorithm_oid._name)

# ---------- 2. 生成密钥和 CSR ----------
def gen_key_and_csr(common_name):
    # 生成 2048 位 RSA 私钥
    private_key = rsa.generate_private_key(
        public_exponent=65537,    # 公开指数，固定用 65537
        key_size=2048,
        backend=default_backend()
    )
    # 私钥序列化成 PEM
    pem_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    with open("key.pem", "wb") as f:
        f.write(pem_key)

    # 构造 CSR
    subject = x509.Name([
        x509.NameAttribute(x509.oid.NameOID.COMMON_NAME, common_name),
        x509.NameAttribute(x509.oid.NameOID.COUNTRY_NAME, "CN"),
        x509.NameAttribute(x509.oid.NameOID.ORGANIZATION_NAME, "MyOrg"),
    ])
    csr = x509.CertificateSigningRequestBuilder().subject_name(subject).sign(
        private_key, hashes.SHA256(), default_backend()
    )
    pem_csr = csr.public_bytes(serialization.Encoding.PEM)
    with open("csr.pem", "wb") as f:
        f.write(pem_csr)
    print("已生成 key.pem 和 csr.pem")

# ---------- 3. 用 requests 测 HTTPS ----------
def test_https():
    # 正常验证（用系统 CA）
    r = requests.get("https://example.com", verify=True)
    print("正常访问状态码:", r.status_code)

    # 指定自定义 CA（验证自签或私有 CA）
    # r = requests.get("https://internal.example.com", verify="/path/ca.pem")

    # 跳过验证（不推荐，仅测试用）
    # r = requests.get("https://self-signed.example.com", verify=False)

    # 强制 TLS 1.2（用 urllib3 适配器）
    import urllib3
    from urllib3.util.ssl_ import create_urllib3_context
    class TLS12Adapter(requests.adapters.HTTPAdapter):
        def init_poolmanager(self, *args, **kwargs):
            ctx = create_urllib3_context()
            ctx.minimum_version = ssl.TLSVersion.TLSv1_2
            ctx.maximum_version = ssl.TLSVersion.TLSv1_2
            kwargs["ssl_context"] = ctx
            return super().init_poolmanager(*args, **kwargs)
    # session = requests.Session()
    # session.mount("https://", TLS12Adapter())

# 运行
if __name__ == "__main__":
    inspect_cert("cert.pem")    # 替换成你的证书路径
    # gen_key_and_csr("example.com")
    # test_https()
\`\`\`

## 九、工具用途对比表

| 工具 | 语言 | 主要用途 | 输出形式 | 适合场景 |
|------|------|----------|----------|----------|
| openssl | C | 密钥/证书/连接（万能） | 文本 | 命令行排查、生成证书 |
| curl | C | 测 HTTPS 请求 | 文本 | 客户端调试、验证部署 |
| nmap | C++ | 端口/套件/漏洞扫描 | 文本 | 安全审计 |
| testssl.sh | Bash | 全面 TLS 扫描 | 彩色文本/HTML | 人工排查、出报告 |
| sslyze | Python | TLS 扫描（结构化） | JSON | CI/CD 集成 |
| Wireshark | C | 抓包分析 | GUI | 协议学习、深度诊断 |
| cryptography | Python | 编程操作证书 | Python 对象 | 自动化脚本 |
| SSL Labs | 在线 | 在线评级 | 网页 | 外部验证、对标 |

## 十、本章小结

| 要点 | 说明 |
|------|------|
| openssl | 万能瑞士军刀，生成/查看/测试一把梭 |
| curl | 客户端调试，-v 看握手，-k 跳过验证 |
| nmap | 端口和套件扫描，ssl-enum-ciphers 最常用 |
| testssl.sh | 友好的全功能扫描器，人工排查首选 |
| sslyze | 结构化输出，适合 CI/CD |
| Wireshark | 抓包看明文，配 SSLKEYLOGFILE 解密 |
| cryptography | Python 编程操作证书，做自动化 |
| 选型原则 | 命令行排查用 openssl，扫描用 testssl.sh，集成用 sslyze |
`
  }
];
