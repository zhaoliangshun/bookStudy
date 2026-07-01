// =============================================================
// 操作系统实战教程 - 第 10 批章节（安全与运维 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   os-hardening    : 服务器安全加固
//   os-backup       : 备份与恢复
//   os-troubleshoot : 故障排查方法论
//   os-cheatsheet   : 运维命令速查表
//
// code 字段为 macOS bash 沙箱可运行脚本（无 root，10s 超时）。
// 特权命令（sshd_config/fail2ban/rsync 真实同步等）用 echo + 注释模拟讲解，
// tar 等可真实运行。
// =============================================================

// Batch 10：安全与运维（4 章）
export const chapters = [
  // ============================================================
  // 第 1 章：服务器安全加固
  // ============================================================
  {
    id: "os-hardening",
    group: "安全与运维",
    icon: "🛡️",
    title: "服务器安全加固",
    content: `# 服务器安全加固

## 概述

服务器加固（Hardening）是通过减少攻击面、收紧权限、关闭不必要服务来提升系统安全性的系统化过程。一台刚装好的 Linux 默认配置偏向易用性，存在大量可被利用的风险点：root 可直接 SSH 登录、默认 22 端口被全网扫描、密码弱认证、冗余服务运行等。加固的目标是在功能可用前提下把风险降到最低。

加固遵循"最小权限"和"默认拒绝"两大原则：只开放必要端口、只授予最小权限、只运行必要服务。常见的加固项包括 SSH 加固、防火墙配置、fail2ban 防爆破、SELinux/AppArmor 强制访问控制、以及定期安全更新。

加固不是一次性动作，而是持续过程：每次系统变更、新增服务都需重新评估攻击面，配合日志审计和漏洞扫描形成闭环。

## 核心要点

- **禁用 root SSH 登录**：sshd_config 设 \`PermitRootLogin no\`，强制先用普通用户登录再 sudo 提权，留审计轨迹。
- **改 SSH 默认端口**：\`Port 2222\` 改掉 22，避开大量自动化扫描噪音，属"安全遮蔽"非真防护但能减日志噪音。
- **强制密钥登录**：\`PasswordAuthentication no\` 关闭密码登录，仅允许公钥认证，杜绝暴力破解。
- **fail2ban 防爆破**：监控登录失败日志，对多次失败 IP 自动封禁（默认 iptables 拉 blackhole），是 SSH 防扫必备。
- **最小权限原则**：服务以独立低权限账号运行，sudo 精确授权到命令，避免 root 直接跑服务。
- **关闭不必要服务**：用 \`systemctl list-unit-files\` 列出所有服务，禁用 postfix、avahi、cups 等无用服务，减少攻击面。
- **SELinux/AppArmor**：强制访问控制（MAC）系统，对进程能访问的资源做细粒度约束，即使被攻破也难提权。RHEL 系用 SELinux，Debian 系用 AppArmor。
- **安全更新**：\`yum update\` / \`apt upgrade\` 定期打补丁，开启 \`unattended-upgrades\` 自动安装安全补丁，避免已知漏洞被利用。
- **防火墙**：ufw/firewalld 默认拒绝入站，仅放行必要端口，是网络层第一道防线。

## 原理与机制

- **攻击面最小化**：每多一个开放端口、一个运行服务、一个 SUID 程序，就多一个可被利用的入口。加固的本质是收敛攻击面。
- **MAC vs DAC**：传统 DAC（自主访问）由文件属主决定权限，被攻破即可改；MAC 由系统策略强制约束，进程即使 root 也受策略限制，提供纵深防御。
- **fail2ban 工作流**：读取 /var/log/auth.log → 正则匹配失败记录 → 触发阈值后调用 iptables 封禁 IP → 一定时间后自动解封。
- **密钥认证安全性**：基于非对称加密，私钥不上线不传输，暴力破解计算上不可行，远优于密码。

## 易错点与陷阱

- **改 SSH 端口后自锁**：改端口未放行防火墙、未保留旧会话就重启 sshd，可能把自己关在外面。务必先开新端口防火墙、保留当前会话测试。
- **关 SELinux 求省事**：\`setenforce 0\` 关掉 SELinux 解决权限报错是常见偷懒，等于放弃一层防护。应学会读 audit.log 和用 audit2allow 调策略。
- **fail2ban 封了自己**：测试时多次密码错误被封，需从控制台登录解封。建议先把本机 IP 加白名单。

## 实战建议

- **加固清单化**：用 CIS Benchmark 作为加固基线，逐项核对，避免遗漏关键项。
- **变更先测试**：所有加固操作先在测试机验证，特别是 SSH 和防火墙变更，保留一个已登录会话作为兜底。
- **定期审计**：用 Lynis 等工具定期扫描配置漂移，配合日志审计发现异常访问。`,
    code: `# 服务器安全加固 - 沙箱无 root，用 echo 讲解加固配置
echo "=== /etc/ssh/sshd_config 加固配置示例（特权文件，沙箱模拟）==="

# SSH 加固核心项
echo "# 禁用 root 登录"
echo "PermitRootLogin no"
echo "# 改默认端口，避开 22 扫描"
echo "Port 2222"
echo "# 强制密钥登录，关闭密码"
echo "PasswordAuthentication no"
echo "PubkeyAuthentication yes"
echo "# 限制登录用户白名单"
echo "AllowUsers deploy ops"
echo "# 空密码禁止"
echo "PermitEmptyPasswords no"

echo ""
echo "=== fail2ban 配置 /etc/fail2ban/jail.local ==="
echo "[sshd]"
echo "enabled  = true"
echo "port     = 2222"
echo "maxretry = 5"
echo "findtime = 600"
echo "bantime  = 3600"

echo ""
echo "=== 关闭不必要服务（systemctl）==="
echo "# systemctl disable --now postfix cups avahi-daemon"
echo "# systemctl list-unit-files --state=enabled   # 审查启用项"

echo ""
echo "=== 安全更新 ==="
echo "# yum update                   # RHEL/CentOS"
echo "# apt update && apt upgrade    # Debian/Ubuntu"
echo "# apt install unattended-upgrades  # 自动安全补丁"

echo ""
echo "=== 加固后必做：保留会话测试新端口 ==="
echo "# 防火墙先放行新端口：firewall-cmd --add-port=2222/tcp --permanent"
echo "# 不退出当前会话，新开终端 ssh -p 2222 user@host 测试"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 2 章：备份与恢复
  // ============================================================
  {
    id: "os-backup",
    group: "安全与运维",
    icon: "💾",
    title: "备份与恢复",
    content: `# 备份与恢复

## 概述

备份是运维最后一道防线，当误删、硬件故障、勒索病毒、人为误操作发生时，备份是恢复数据的唯一指望。备份策略的设计需同时考虑"备什么、怎么备、备到哪、怎么恢"四个维度，任何一环缺失都可能让备份形同虚设。

Linux 下备份工具分两类：打包压缩类（tar）和镜像同步类（rsync）。tar 适合做全量打包归档，rsync 适合做增量同步。配合 cron 定时执行，能构建自动化的备份流水线。

业界共识的"3-2-1 原则"是备份设计的黄金法则：3 份数据、2 种介质、1 份离线/异地。但比备份更重要的是"恢复演练"——从未验证过的备份等于没有备份，很多团队在灾难时才发现备份损坏或格式不对。

## 核心要点

- **tar 打包**：\`tar -czf backup.tar.gz dir/\` 创建 gzip 压缩包，\`-c\` 创建、\`-z\` gzip、\`-f\` 指定文件名。\`-xzf\` 解压，\`-tzf\` 查看内容。
- **rsync 同步**：\`rsync -avz --delete src/ dest/\` 增量同步，\`-a\` 归档模式（保留权限等）、\`-v\` 详细、\`-z\` 压缩传输，\`--delete\` 删除目标多余文件保持镜像。
- **增量备份**：rsync 配合 \`--link-dest=上次备份\` 用硬链接实现增量，tar 用 \`-g snapshot\` 做增量归档，只备份变化部分省空间。
- **cron 定时**：\`crontab -e\` 编辑定时任务，如 \`0 2 * * * /opt/backup.sh\` 每天 2 点执行。5 字段：分 时 日 月 周。
- **3-2-1 原则**：3 份数据副本、2 种存储介质、1 份离线或异地，确保单点故障不丢数据。
- **保留策略**：按时间分层保留（每日留 7 份、每周留 4 份、每月留 12 份），平衡空间与历史回溯。
- **恢复演练**：定期从备份恢复到测试环境验证可用性，检查完整性、可读性、恢复耗时。
- **备份网站数据**：代码 + 上传文件 + 数据库三部分都要备，数据库用 mysqldump/pg_dump 导出，别只备文件。

## 原理与机制

- **rsync 增量原理**：发送方先计算每个文件分块的滚动哈希，接收方比对后只传差异块，实现"只传变化部分"，远比全量高效。
- **tar 硬链接去重**：\`--link-dest\` 让未变化文件以硬链接形式存在，多份备份共享同一 inode，省空间且每份都像完整备份。
- **全量 vs 增量**：全量恢复简单但耗空间，增量省空间但恢复需链式应用多个备份，"全量+增量"组合最常用。
- **校验完整性**：备份后用 md5sum/sha256sum 计算校验和，恢复前比对，防止备份文件静默损坏。

## 易错点与陷阱

- **rsync 源路径斜杠**：\`rsync src/ dest/\` 同步 src 内容到 dest，\`rsync src dest/\` 把 src 目录本身放进 dest，差一个斜杠结果完全不同。
- **只备文件不备数据库**：数据库文件热备可能不一致，必须用 dump 工具逻辑导出或配合快照，否则恢复后数据损坏。
- **备份不验证**：从未恢复过的备份可能在灾难时才发现磁带损坏、加密密钥丢失、格式不兼容，等于没备份。

## 实战建议

- **自动化 + 通知**：备份脚本加邮件/钉钉通知，失败必须告警，成功可选通知，避免"默默失败"数月无人知。
- **异地 + 离线**：至少一份备份异地存储（如对象存储），重要数据离线防勒索病毒加密备份本身。
- **定期演练**：每季度做一次完整恢复演练，记录耗时和问题，更新恢复手册。`,
    code: `# 备份与恢复 - tar 可真实运行，rsync/脚本用 echo 讲解
echo "=== 1. tar 打包演示（沙箱可真实运行）==="
# 准备测试数据
mkdir -p /tmp/backup-demo/www && cd /tmp/backup-demo
echo "hello" > www/index.html
echo "log content" > www/access.log

# -c 创建 -z gzip -f 文件名 -v 详细
tar -czf www-backup-$(date +%Y%m%d).tar.gz www/
echo "打包完成:"
ls -lh www-backup-*.tar.gz

# 查看包内容 -t 列出 -z gzip -f 文件名
echo ""
echo "=== 查看包内容 ==="
tar -tzf www-backup-*.tar.gz

# 解压到恢复目录 -x 解压 -C 指定目录
echo ""
echo "=== 解压恢复 ==="
mkdir -p restore && tar -xzf www-backup-*.tar.gz -C restore/
ls -la restore/www/

echo ""
echo "=== 2. rsync 增量同步示例（沙箱用 echo 讲解）==="
echo "# rsync -avz --delete /var/www/ /backup/www/"
echo "# -a 归档(保留权限) -v 详细 -z 压缩 --delete 保持镜像"
echo "# 源路径末尾斜杠关键：带斜杠同步内容，不带同步目录本身"

echo ""
echo "=== 3. cron 定时备份任务示例 ==="
echo "# crontab -e 编辑定时任务"
echo "# 0 2 * * * /opt/backup.sh   # 每天 2 点执行"
echo "# 字段：分 时 日 月 周"

echo ""
echo "=== 4. 备份脚本骨架（echo 讲解）==="
echo "#!/bin/bash"
echo "# DATE=$(date +%Y%m%d)"
echo "# tar -czf /backup/www-$DATE.tar.gz /var/www"
echo "# find /backup -name 'www-*.tar.gz' -mtime +7 -delete  # 清理 7 天前"

echo ""
echo "=== 5. 3-2-1 原则提醒 ==="
echo "# 3 份数据  2 种介质  1 份异地/离线"
echo "# 备份后必须做恢复演练！"
rm -rf /tmp/backup-demo
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 3 章：故障排查方法论
  // ============================================================
  {
    id: "os-troubleshoot",
    group: "安全与运维",
    icon: "🔧",
    title: "故障排查方法论",
    content: `# 故障排查方法论

## 概述

故障排查是运维的核心能力，面对一个"服务挂了""网站打不开""机器卡"的模糊现象，能否快速定位根因，靠的不是经验直觉，而是系统化的排查方法论。盲目猜测和乱敲命令只会浪费时间甚至扩大故障。

经典的排查路径是"自下而上"：物理硬件 → 操作系统 → 网络 → 应用。先排除硬件故障（磁盘坏、内存坏、电源），再看系统资源（CPU、内存、磁盘 IO、负载），接着查网络连通性（端口、路由、防火墙），最后定位应用本身（进程状态、日志、配置）。每一层确认正常再上一层。

排查的核心工具是"日志 + 监控 + 现场命令"：/var/log 下的系统与应用日志记录了"发生了什么"，监控数据反映"何时开始异常"，top/ps/ss/dmesg 等现场命令呈现"当前状态"。三者结合才能还原故障全貌。

## 核心要点

- **排查路径**：硬件 → 系统 → 网络 → 应用，自下而上逐层排除，避免上来就猜应用问题。
- **dmesg**：内核环形缓冲区日志，记录硬件错误、驱动问题、OOM kill 等，\`dmesg -T\` 加时间戳，故障第一时间看它。
- **/var/log/messages**：系统总日志（RHEL 系），Debian 系看 /var/log/syslog，记录服务启停、内核事件、系统错误。
- **应用日志**：nginx 的 access.log/error.log、MySQL 的 error.log、应用自定义日志，是定位应用层问题的第一手资料。
- **strace**：跟踪进程的系统调用和信号，\`strace -p PID\` 追踪运行中进程，\`-e trace=file\` 只看文件相关，定位卡死/报错根因。
- **core dump**：进程崩溃时的内存转储，用 \`gdb\` 分析崩溃位置。需 \`ulimit -c unlimited\` 开启。
- **OOM Killer**：内存耗尽时内核主动杀进程保命，看 dmesg 找 "Killed process" 记录，被杀进程无 core dump。
- **磁盘满排查**：\`df -h\` 看分区使用率，\`du -sh /* | sort -h\` 找大目录，常见是大日志文件或 /tmp 爆满。
- **端口占用**：\`ss -tlnp\` 或 \`netstat -tlnp\` 看监听端口及进程，\`lsof -i:8080\` 查指定端口被谁占用。

## 原理与机制

- **分层隔离**：每层故障表现不同，硬件层多见 dmesg 报错，系统层多见资源耗尽，网络层多见超时/拒绝，应用层多见错误日志。分层排查避免"应用慢却只查应用"的误区。
- **OOM 触发机制**：内核内存不足时按分数（oom_score，与内存占用、运行时间有关）挑进程杀，分数高的先死，常是数据库等大内存进程。
- **dmesg 环形缓冲**：内核日志存固定大小环形缓冲区，旧消息会被新消息覆盖，故障后要尽快保存，否则丢失。

## 易错点与陷阱

- **只看当前不看历史**：top 只反映瞬时状态，故障已过就看不到。要靠监控历史数据（sar、Prometheus）回溯故障时刻。
- **磁盘满但 df 显示有空间**：可能是 inode 耗尽（大量小文件），\`df -i\` 看 inode 使用率，常见于邮件队列、session 文件。
- **端口被占但 ps 找不到进程**：可能是僵尸进程或权限不可见，用 \`sudo ss -tlnp\` 或 \`lsof -i:port\` 加权限查。

## 实战建议

- **先看日志再动手**：80% 的故障日志里有明确线索，养成"出问题先 tail 日志"的习惯。
- **建立排查清单**：把常见故障（服务起不来、磁盘满、负载高、连不上）的排查步骤固化成清单，故障时照单执行，避免慌乱遗漏。
- **保留现场**：严重故障先保存 dmesg、ps、top、ss 输出到文件，再重启或清理，便于事后复盘。`,
    code: `# 故障排查方法论 - 沙箱可跑 echo/dmesg/系统命令
echo "=== 1. 排查路径：自下而上 ==="
echo "硬件 → 系统 → 网络 → 应用"
echo ""
echo "  [硬件]  dmesg | smartctl        # 磁盘/内存/电源"
echo "  [系统]  top free df uptime      # CPU/内存/磁盘/负载"
echo "  [网络]  ss ping traceroute      # 端口/连通/路由"
echo "  [应用]  日志 + 进程状态          # error.log + ps"

echo ""
echo "=== 2. dmesg 内核日志（沙箱可能无权限，有则输出）==="
# dmesg 在沙箱通常需 root，捕获失败则给示例
dmesg 2>/dev/null | tail -5 || echo "# dmesg 需 root，常用法："
echo "# dmesg -T | grep -i error             # 查硬件错误"
echo "# dmesg -T | grep -i 'killed process'  # 查 OOM"

echo ""
echo "=== 3. 系统资源速查（沙箱可跑）==="
echo "--- CPU/负载 ---"; uptime
echo "--- 内存 ---"; free -h 2>/dev/null || vm_stat
echo "--- 磁盘 ---"; df -h | head -5

echo ""
echo "=== 4. 端口占用排查流程 ==="
echo "# ss -tlnp              # 列所有监听端口+进程"
echo "# lsof -i:8080         # 查 8080 被谁占用"
echo "# ps -ef | grep nginx  # 找进程"

echo ""
echo "=== 5. 常见故障检查清单 ==="
echo "# 服务起不来：systemctl status + journalctl -u 服务名"
echo "# 磁盘满：df -h → du -sh /* → 找大文件清理"
echo "# 负载高：top → 找 CPU 高进程 → strace -p PID"
echo "# 连不上：ping → telnet host port → 防火墙规则"
echo "# 被黑：last 看异常登录 + 查 /var/log/auth.log"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 4 章：运维命令速查表
  // ============================================================
  {
    id: "os-cheatsheet",
    group: "安全与运维",
    icon: "📌",
    title: "运维命令速查表",
    content: `# 运维命令速查表

## 概述

运维日常高频命令数量并不庞大，但分散在进程、磁盘、网络、日志、文件、性能等多个领域，遇到问题时"知道有这个命令但想不起名字"是常态。一份按场景组织的速查表能大幅提升排障效率，比临时搜索更快更准。

速查表的价值在于"按场景而非按字母"组织：服务起不来怎么办、磁盘满了查什么、负载高从哪入手、连不上网络怎么排查、怀疑被黑看哪些痕迹。每个场景给出最常用的 3-5 个命令，形成肌肉记忆。

本节汇总高频命令并按场景归类，建议收藏常备，遇到问题先扫一眼速查表，比盲目敲命令高效得多。

## 核心要点

- **进程**：\`ps -ef\` 全量进程、\`ps aux --sort=-%cpu\` 按 CPU 排序、\`top\`/\`htop\` 实时、\`pgrep nginx\` 按名找 PID、\`kill -9 PID\` 强杀。
- **磁盘**：\`df -h\` 分区使用率、\`du -sh /*\` 找大目录、\`du -ah | sort -rh | head\` 找大文件、\`lsof | grep deleted\` 找被删但未释放的文件、\`iotop\` IO 占用。
- **网络**：\`ss -tlnp\` 监听端口、\`netstat -anp\` 所有连接、\`curl -v\` 测试 HTTP、\`tcpdump -i eth0 port 80\` 抓包、\`traceroute\` 路由追踪。
- **日志**：\`tail -f log\` 实时跟踪、\`grep -i error log\` 搜错误、\`journalctl -u nginx --since today\` systemd 日志、\`zcat log.gz | grep error\` 查压缩日志、\`awk '{print $1}' log | sort | uniq -c | sort -rn\` IP 统计。
- **文件**：\`find / -name "*.conf" -mtime -1\` 按时间找、\`find / -perm -4000\` 找 SUID、\`stat file\` 看时间戳、\`md5sum\` 校验、\`wc -l\` 行数。
- **性能**：\`top\` CPU/内存、\`vmstat 1\` 虚拟内存、\`iostat 1\` 磁盘 IO、\`sar -n DEV 1\` 网络流量、\`free -m\` 内存。

## 原理与机制

- **命令分类对应分层**：进程/性能属系统层，网络命令对应传输/网络层，日志属应用层，分层思维让排查有条理。
- **/proc 虚拟文件系统**：top、ps、free 等命令的数据来源是 /proc 下的虚拟文件（/proc/cpuinfo、/proc/meminfo、/proc/PID/），内核实时生成。
- **管道组合**：Linux 命令小而专，通过管道 \`|\` 组合实现复杂分析，如 \`grep error | wc -l\` 数错误行，体现 Unix 哲学。

## 易错点与陷阱

- **kill -9 滥用**：\`-9\` (SIGKILL) 强杀不留清理机会，可能导致数据损坏（如数据库），应先 \`kill -15\` (SIGTERM) 优雅退出。
- **du 在根目录慢**：\`du -sh /*\` 跨文件系统会统计挂载点，加 \`-x\` 只看本文件系统，避免卡在 NFS/大挂载上。
- **netstat 已过时**：新系统推荐 \`ss\`，更快且信息更全，netstat 在某些发行版已不预装。

## 实战建议

- **场景化速查**：把命令按"服务起不来/磁盘满/负载高/连不上/被黑"五个场景整理成卡片，故障时按场景查。
- **掌握管道组合**：单命令能力有限，\`grep | sort | uniq -c | sort -rn\` 等组合是日志分析的杀手锏，值得练熟。
- **alias 常用组合**：把高频长命令设 alias，如 \`alias ports='ss -tlnp'\`，提升日常效率。`,
    code: `# 运维命令速查表 - 沙箱可跑 echo
echo "===== 运维高频命令速查表 ====="

echo ""
echo "=== 【进程】==="
echo "ps -ef                            # 全量进程"
echo "ps aux --sort=-%cpu | head        # 按 CPU 排序"
echo "top / htop                        # 实时监控"
echo "pgrep -fl nginx                   # 按名找 PID+命令行"
echo "kill -15 PID ; kill -9 PID        # 先 TERM 再 KILL"

echo "=== 【磁盘】==="
echo "df -h                             # 分区使用率"
echo "du -sh /* 2>/dev/null | sort -h   # 找大目录"
echo "du -ah | sort -rh | head -10      # 找大文件"
echo "lsof | grep deleted               # 被删未释放文件"

echo "=== 【网络】==="
echo "ss -tlnp                          # 监听端口+进程（替代 netstat）"
echo "curl -v http://host               # 测 HTTP"
echo "tcpdump -i eth0 port 80           # 抓包"
echo "traceroute host                   # 路由追踪"

echo "=== 【日志】==="
echo "tail -f /var/log/messages         # 实时跟踪"
echo "grep -i error log                 # 搜错误"
echo "journalctl -u nginx --since today # systemd 日志"

echo "=== 【文件】==="
echo "find / -name '*.conf' -mtime -1   # 近期改的配置"
echo "find / -perm -4000                # 找 SUID（提权排查）"
echo "md5sum file                       # 校验完整性"

echo "=== 【性能】==="
echo "top | vmstat 1 | iostat 1 | free -m   # CPU/内存/IO 综合"

echo ""
echo "=== 【五大场景速查】==="
echo "# 服务起不来：systemctl status → journalctl -u 服务 → tail 日志"
echo "# 磁盘满：df -h → du -sh /* → lsof|grep deleted → 清理"
echo "# 负载高：top 找 CPU 进程 → strace -p PID → iostat 查 IO"
echo "# 连不上：ping → telnet host port → ss -tlnp → 查防火墙"
echo "# 被黑：last → /var/log/auth.log → find -perm -4000 → crontab -l"
echo ""
echo "=== 速查表结束 ==="`,
  },
];
