// =============================================================
// 操作系统实战教程 - 第 5 批章节（用户与权限 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   os-user       : 用户与组管理
//   os-sudo       : sudo 与 sudoers
//   os-ssh        : SSH 远程登录与密钥
//   os-ssh-tunnel : SSH 端口转发与隧道
//
// code 字段为 macOS bash 沙箱可运行脚本（无 root，10s 超时）。
// 特权命令（useradd/visudo/ssh 连接等）用 echo + 注释模拟讲解。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：用户与组管理
  // ============================================================
  {
    id: "os-user",
    group: "用户与权限",
    icon: "👤",
    title: "用户与组管理",
    content: `# 用户与组管理

## 概述

Linux 是多用户操作系统，从诞生起就围绕"用户"和"权限"设计。每个进程都属于某个用户，每个文件都有属主属组，权限的一切基础都建立在"用户身份"之上。理解用户与组的管理，是掌握 Linux 安全模型的第一步。

用户（User）是登录和资源隔离的基本单位，组（Group）是用户的集合，用于批量授权。一个用户必须属于一个主组，可以额外加入多个附加组。系统通过 UID（用户 ID）和 GID（组 ID）来识别身份，名字只是给人看的别名。

日常运维中，用户管理涵盖增删改查：创建用户、设置密码、修改属性、删除账号、查询身份。掌握这些操作和背后的配置文件格式，才能在服务器上安全地分配访问权限。

## 核心要点

- **useradd**：创建用户。\`-m\` 创建家目录，\`-s\` 指定登录 shell，\`-u\` 指定 UID，\`-g\` 主组，\`-G\` 附加组。默认不创建家目录、不设密码。
- **usermod**：修改用户属性。\`-aG\` 追加附加组（必须带 \`a\`，否则覆盖），\`-L\` 锁定账号，\`-s\` 改 shell。
- **userdel**：删除用户。\`-r\` 连带删除家目录；不加 \`-r\` 会残留家目录和邮件。
- **passwd**：设置/修改密码。\`passwd alice\` 改别人（需 root），\`passwd\` 改自己。\`-l\` 锁定，\`-d\` 删除密码。
- **id**：显示用户的 UID、GID 和所有附加组，是最权威的身份查询命令。
- **whoami**：显示当前有效用户名，等价于 \`id -un\`。
- **groups**：列出用户所属的所有组。
- **/etc/passwd**：用户数据库，7 字段冒号分隔：\`用户名:密码占位:UID:GID:描述:家目录:登录Shell\`。密码占位现在是 \`x\`，真实密码在 /etc/shadow。
- **/etc/group**：组数据库，4 字段：\`组名:密码占位:GID:组成员列表\`。
- **登录 shell**：用户登录后启动的 shell。\`/sbin/nologin\` 禁止登录，常用于服务账号。

## 原理与机制

- **UID/GID 是真实身份**：内核只认数字 UID/GID，用户名/组名只是 /etc/passwd、/etc/group 中的映射。权限校验基于数字而非名字。
- **主组 vs 附加组**：每个用户有且仅有一个主组（创建时默认生成同名组），附加组可有多个。文件属组默认是主组，\`newgrp\` 可临时切换有效组。
- **密码分离存储**：/etc/passwd 早期存密码，因全用户可读导致安全隐患，现改存 \`x\`，真实密码哈希放在仅 root 可读的 /etc/shadow。
- **PAM 认证框架**：登录、su、sudo 等都通过 PAM（Pluggable Authentication Modules）模块链进行认证，支持密码、指纹、双因素等灵活组合。

## 易错点与陷阱

- **usermod -G 不带 -a**：会覆盖附加组列表，丢失原有组归属。务必用 \`-aG\` 追加。
- **直接改 /etc/passwd**：手误改坏会导致用户无法登录甚至系统异常，应始终用 useradd/usermod。
- **删除用户未清理进程**：用户若有活跃进程或定时任务，userdel 会失败或残留，应先 \`pkill -u alice\` 并清理 crontab。

## 实战建议

- **服务账号用 /sbin/nologin**：nginx、mysql 等服务账号无需登录，指定 nologin shell 减少攻击面。
- **按角色分组授权**：创建 devops、developers 等组，通过组而非个人授权，便于人员变动管理。
- **UID 规划**：生产环境规划 UID 区间（如 1000-1999 普通用户，2000-2999 服务账号），避免冲突。`,
    code: `# 用户与组管理 - 沙箱可运行演示
# 特权命令（useradd/userdel/passwd）用 echo 模拟讲解

# 1. 查询当前用户身份（沙箱可跑，无特权）
echo "=== 当前身份信息 ==="
echo "whoami: $(whoami)"
echo "id: $(id)"
echo "groups: $(groups)"

# 2. /etc/passwd 格式说明（用 echo 模拟，沙箱无写权限）
echo ""
echo "=== /etc/passwd 格式（7 字段，冒号分隔）==="
echo "# 用户名:密码占位:UID:GID:描述:家目录:登录Shell"
echo "root:x:0:0:root:/root:/bin/bash"
echo "www:x:1000:1000:Web User:/home/www:/sbin/nologin"

# 3. useradd 模拟（沙箱无 root，用 echo 讲解参数）
echo ""
echo "=== useradd 常用参数（特权命令，沙箱模拟）==="
echo "# useradd -u 1001 -g developers -G docker -s /bin/bash -m alice"
echo "# -u 指定UID  -g 主组  -G 附加组  -s 登录shell  -m 创建家目录"

# 4. /etc/group 格式说明
echo ""
echo "=== /etc/group 格式（4 字段）==="
echo "# 组名:密码占位:GID:组成员列表"
echo "developers:x:1000:alice,bob"
echo "docker:x:998:alice"

# 5. usermod 追加组（易错点：必须带 -a）
echo ""
echo "=== usermod 追加附加组（务必用 -aG）==="
echo "# usermod -aG docker alice    # 正确：追加到 docker 组"
echo "# usermod -G docker alice     # 错误：覆盖，丢失原组"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 2 章：sudo 与 sudoers
  // ============================================================
  {
    id: "os-sudo",
    group: "用户与权限",
    icon: "🛡️",
    title: "sudo 与 sudoers",
    content: `# sudo 与 sudoers

## 概述

sudo（superuser do）允许普通用户以其他用户（通常是 root）身份执行命令，是 Linux 权限提升的标准方式。相比直接用 root 登录，sudo 提供了细粒度授权、操作审计和临时提权能力，是生产服务器上最安全的 root 访问方式。

sudo 的核心配置在 /etc/sudoers 文件中，定义了"谁能在哪台机器上以谁的身份执行什么命令"。由于该文件语法严格且改错会导致 sudo 失效，必须用 visudo 命令编辑，它会做语法校验。

掌握 sudoers 配置是运维必备技能：既要能授权用户执行特定命令，又要避免过度授权带来的安全风险。最小权限原则是配置 sudo 的黄金法则。

## 核心要点

- **sudo 命令**：以 root 身份执行单条命令，如 \`sudo systemctl restart nginx\`。会要求输入当前用户密码（默认 5 分钟内免再次输入）。
- **visudo**：编辑 /etc/sudoers 的专用命令，保存时做语法检查，防止配置错误锁死 sudo。永远不要用 vi 直接改 sudoers。
- **/etc/sudoers 语法**：\`用户 主机=(运行身份:运行组) 命令\`，如 \`alice ALL=(ALL) ALL\` 表示 alice 可在任何主机以任何身份执行任何命令。
- **NOPASSWD**：免密执行，如 \`deploy ALL=(root) NOPASSWD: /bin/systemctl restart nginx\`，常用于自动化脚本。
- **sudo -u**：指定运行身份，如 \`sudo -u postgres psql\` 以 postgres 身份运行 psql。
- **sudo -i**：启动一个登录 shell（类似 su -），加载 root 的完整环境变量和家目录。
- **%group 语法**：组名前加 \`%\` 表示对该组所有用户授权，如 \`%devops ALL=(ALL) ALL\`。
- **命令白名单**：精确到命令绝对路径，如 \`/bin/systemctl restart nginx\`，避免用通配符造成提权漏洞。

## 原理与机制

- **sudo vs su**：su 切换用户身份后持续保持，sudo 只对单条命令提权。sudo 更安全，操作可审计。
- **/etc/sudoers.d/ 目录**：主文件 include 该目录，便于按用户/服务拆分配置，推荐在此放单独文件而非改主文件。
- **会话缓存**：sudo 通过 timestamp 文件记录最近认证时间，默认 5 分钟内免再次输密码，可用 \`sudo -k\` 强制失效。
- **审计日志**：sudo 操作记录到 /var/log/auth.log（Debian）或 /var/log/secure（RHEL），可追溯谁在何时执行了什么特权命令。

## 易错点与陷阱

- **NOPASSWD 范围过大**：\`NOPASSWD: ALL\` 等于免密 root，极度危险，仅限受控自动化场景。
- **命令通配符提权**：授权 \`vim\`、\`less\` 等可执行外部命令的程序，用户能通过 \`:sh\` 获得 root shell，必须列入黑名单。
- **visudo 未用导致语法错误**：直接编辑 sudoers 写错一个字符，可能导致所有 sudo 失效，无 root 时无法补救。

## 实战建议

- **最小授权**：只授权必要的命令，精确到参数，如 \`NOPASSWD: /bin/systemctl restart nginx\`。
- **用 sudoers.d 管理**：每个用户/角色一个文件，便于版本管理和批量部署，避免主文件膨胀。
- **定期审计**：检查 sudo 日志，监控异常提权行为，生产环境开启 mail_always 通知管理员。`,
    code: `# sudo 与 sudoers - 沙箱无 sudo 权限，用 echo 讲解配置
echo "=== /etc/sudoers 配置示例（特权文件，沙箱模拟）==="

# 基本授权语法
echo "# 语法：用户 主机=(运行身份:运行组) 命令"
echo "root    ALL=(ALL:ALL) ALL"
echo "%admin  ALL=(ALL) ALL"

# NOPASSWD 免密授权
echo ""
echo "=== NOPASSWD 免密执行特定命令 ==="
echo "# 允许 deploy 用户免密重启 nginx"
echo "deploy  ALL=(root) NOPASSWD: /bin/systemctl restart nginx"
echo "# 允许 devops 组免密执行部署脚本"
echo "%devops  ALL=(root) NOPASSWD: /opt/scripts/deploy.sh"

# sudo -u 与 sudo -i
echo ""
echo "=== sudo -u 切换身份 / sudo -i 登录 shell ==="
echo "# sudo -u postgres psql      # 以 postgres 身份运行 psql"
echo "# sudo -i                    # 切到 root 并加载登录环境"
echo "# sudo -u nobody whoami      # 以 nobody 身份查看"

# visudo 安全提示
echo ""
echo "=== 安全提示 ==="
echo "# 永远用 visudo 编辑 /etc/sudoers（带语法检查）"
echo "# 直接编辑可能导致 sudo 失效，且无法补救"
echo "# 推荐把自定义规则放在 /etc/sudoers.d/ 目录"

# 危险配置警示
echo ""
echo "=== 危险配置（切勿模仿）==="
echo "# deploy ALL=(ALL) NOPASSWD: ALL   # 等于免密 root，极度危险"
echo "# alice  ALL=(ALL) /usr/bin/vim    # vim 可 :sh 逃逸到 root shell"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 3 章：SSH 远程登录与密钥
  // ============================================================
  {
    id: "os-ssh",
    group: "用户与权限",
    icon: "🔑",
    title: "SSH 远程登录与密钥",
    content: `# SSH 远程登录与密钥

## 概述

SSH（Secure Shell）是 Linux 远程管理的基石，提供加密的远程登录和命令执行通道。相比明文的 telnet，SSH 对所有流量加密，防止窃听和中间人攻击，是生产服务器管理的唯一推荐方式。

SSH 的认证方式主要有两种：密码认证和密钥认证。密钥认证基于非对称加密，安全性远高于密码，且能实现免密登录，是自动化运维和批量管理的核心。配合 ~/.ssh/config 配置文件，可以大幅简化连接命令。

掌握 SSH 密钥生成、分发、配置，以及免密登录原理，是运维和开发必备技能，也是 CI/CD、Git 操作、远程部署的基础。

## 核心要点

- **ssh user@host**：远程登录基本语法，如 \`ssh root@192.168.1.100\`。默认端口 22，可用 \`-p\` 指定端口。
- **ssh-keygen**：生成密钥对。\`-t ed25519\` 推荐算法，\`-t rsa -b 4096\` 兼容旧系统，\`-f\` 指定路径，\`-C\` 注释。
- **ssh-copy-id**：一键把公钥追加到远程主机的 ~/.ssh/authorized_keys，如 \`ssh-copy-id user@host\`，省去手动操作。
- **authorized_keys**：远程主机上存放允许登录的公钥列表，每行一个公钥。位于 ~/.ssh/authorized_keys，权限必须 600。
- **~/.ssh/config**：客户端配置文件，可定义主机别名、端口、密钥、跳板等，把 \`ssh -p 2222 -i key user@host\` 简化为 \`ssh prod\`。
- **-p 端口**：指定服务端口，如 \`ssh -p 2222 user@host\`。服务器改默认端口能减少扫描噪音。
- **ed25519 优于 RSA**：ed25519 更短更快更安全，OpenSSH 6.5+ 支持；旧系统兼容用 RSA 4096。

## 原理与机制

- **非对称加密认证**：客户端持有私钥，服务端持有公钥。登录时服务端用公钥发起挑战，客户端用私钥签名响应，验证通过则登录。
- **known_hosts 机制**：首次连接时服务端指纹写入 ~/.ssh/known_hosts，下次比对，若变化则警告防中间人攻击。
- **密钥分发流程**：本地生成密钥对 → 公钥拷贝到服务端 authorized_keys → 服务端用公钥验证私钥签名 → 免密登录。
- **权限严格要求**：~/.ssh 必须 700，authorized_keys 必须 600，私钥文件 600。权限过松 SSH 会拒绝使用。

## 易错点与陷阱

- **私钥泄露**：私钥即账号，一旦泄露等于交出服务器控制权。私钥不上传 Git、不通过聊天传输，建议加 passphrase。
- **权限不对导致免密失败**：authorized_keys 权限 644、家目录组可写等，SSH 会静默拒绝密钥，日志在 /var/log/auth.log。
- **known_hosts 冲突**：服务器重装后指纹变化，连接报错。用 \`ssh-keygen -R host\` 清除旧记录。

## 实战建议

- **禁用密码登录**：生产环境 sshd_config 设 \`PasswordAuthentication no\`，仅允许密钥登录。
- **用 config 管理主机**：把所有服务器配置写入 ~/.ssh/config，用别名连接，避免记 IP 和端口。
- **密钥加 passphrase**：用 ssh-agent 缓存密码，兼顾安全与便捷，防止私钥文件被盗用。`,
    code: `# SSH 远程登录与密钥 - 沙箱可运行演示
# ssh-keygen 在 /tmp 下生成，真实连接用 echo 模拟

# 1. 生成 SSH 密钥（在 /tmp 下，沙箱可跑）
echo "=== 生成 SSH 密钥对 ==="
KEY_DIR="/tmp/ssh-demo-$$"
mkdir -p "$KEY_DIR"
# -t 算法 -f 文件路径 -N "" 空密码 -C 注释
ssh-keygen -t ed25519 -f "$KEY_DIR/id_ed25519" -N "" -C "demo@example.com" -q
echo "密钥已生成在: $KEY_DIR"
ls -la "$KEY_DIR"

# 2. 查看公钥内容（authorized_keys 格式）
echo ""
echo "=== 公钥内容（写入 ~/.ssh/authorized_keys 实现免密）==="
cat "$KEY_DIR/id_ed25519.pub"

# 3. ~/.ssh/config 示例（echo 模拟）
echo ""
echo "=== ~/.ssh/config 示例（简化连接）==="
echo "Host prod"
echo "    HostName 192.168.1.100"
echo "    User deploy"
echo "    Port 2222"
echo "    IdentityFile ~/.ssh/id_ed25519"
echo "# 使用 ssh prod 等同于 ssh -p 2222 -i ~/.ssh/id_ed25519 deploy@192.168.1.100"

# 4. 免密登录原理
echo ""
echo "=== 免密登录原理 ==="
echo "1. 本地 ssh-keygen 生成密钥对（私钥+公钥）"
echo "2. ssh-copy-id 把公钥追加到服务端 ~/.ssh/authorized_keys"
echo "3. 登录时服务端用公钥发起挑战，客户端用私钥签名"
echo "4. 签名验证通过则免密登录"

# 5. 清理
rm -rf "$KEY_DIR"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 4 章：SSH 端口转发与隧道
  // ============================================================
  {
    id: "os-ssh-tunnel",
    group: "用户与权限",
    icon: "🌐",
    title: "SSH 端口转发与隧道",
    content: `# SSH 端口转发与隧道

## 概述

SSH 端口转发（Port Forwarding）是 SSH 最强大的特性之一，能在不暴露服务端口的情况下，通过 SSH 加密隧道转发任意网络流量。它常用于访问内网服务、穿越防火墙、临时暴露本地服务等场景，是运维和开发解决网络连通性问题的瑞士军刀。

端口转发有三种模式：本地转发（-L）、远程转发（-R）、动态转发（-D）。本地转发把远程端口映射到本地，远程转发反之，动态转发则提供 SOCKS 代理。理解三种模式的区别和适用场景，能在不修改网络架构的前提下解决连通性问题。

在云原生和混合云环境中，SSH 隧道依然是访问内网数据库、调试受限服务的实用工具，配合 ProxyJump 跳板机，能安全穿透多层网络。

## 核心要点

- **本地转发 -L**：\`ssh -L 本地端口:目标主机:目标端口 user@ssh服务器\`。把远程可达的端口映射到本地，访问本地端口即经 SSH 跳板访问目标。
- **远程转发 -R**：\`ssh -R 远程端口:本地服务:本地端口 user@远程主机\`。把本地端口反向映射到远程主机，常用于内网穿透。
- **动态转发 -D**：\`ssh -D 1080 user@host\`。创建 SOCKS5 代理，本机应用走代理后所有流量经 SSH 转发，灵活但仅支持 SOCKS。
- **后台运行参数**：\`-f\` 后台执行，\`-N\` 不执行远程命令，\`-T\` 不分配 tty。组合 \`-fNT\` 适合纯隧道场景。
- **ProxyJump 跳板**：\`ssh -J jump@bastion target@internal\`，一行命令经堡垒机跳转到内网主机，比 ProxyCommand 配置更简洁。
- **网关模式 -g**：默认转发仅本机可用，加 \`-g\` 允许其他主机连接转发端口，相当于把 SSH 服务器变成网关。

## 原理与机制

- **本地转发数据流**：本地应用 → 本地 SSH 客户端 → 加密隧道 → 远程 SSH 服务端 → 目标服务。SSH 服务器充当跳板。
- **远程转发数据流**：远程主机端口 → 远程 SSH 服务端 → 加密隧道 → 本地 SSH 客户端 → 本地服务。实现反向暴露。
- **动态转发原理**：SSH 客户端起 SOCKS5 服务，应用按 SOCKS 协议告知目标地址，SSH 动态转发到任意目标，类似轻量 VPN。
- **目标主机视角**：-L 中的"目标主机"是从 SSH 服务器视角看的，可填 localhost（SSH 服务器本机）或其他内网地址。

## 易错点与陷阱

- **-L 目标地址理解错**：\`-L 3306:db.internal:3306 user@jump\` 中 db.internal 是从 jump 服务器解析的，不是本地。填 localhost 指的是 jump 服务器本机。
- **远程转发需 GatewayPorts**：默认 -R 仅远程本机可连，要让其他主机连需服务端开 \`GatewayPorts yes\`。
- **隧道中断无感知**：SSH 隧道断开后本地端口失效，应用报错。长期隧道用 autossh 自动重连。

## 实战建议

- **访问内网数据库**：\`ssh -fNT -L 3306:db.internal:3306 user@bastion\`，本地连 localhost:3306 即可，无需数据库暴露公网。
- **跳板机统一入口**：所有内网主机只能经堡垒机访问，用 ~/.ssh/config 的 ProxyJump 一键穿透，兼顾安全与便捷。
- **临时暴露本地服务**：调试微信回调等场景用 -R 把本地端口反向暴露到公网服务器，避免部署临时环境。`,
    code: `# SSH 端口转发与隧道 - 沙箱无法真实连接，用 echo 讲解
echo "=== 1. 本地端口转发 -L ==="
echo "# ssh -L 本地端口:目标主机:目标端口 user@跳板机"
echo "# 场景：通过跳板机访问内网数据库"
echo "ssh -L 3306:db.internal:3306 user@jump.example.com"
echo "# 本机访问 localhost:3306 即连到 db.internal:3306"

echo ""
echo "=== 2. 远程端口转发 -R ==="
echo "# ssh -R 远程端口:本地服务:本地端口 user@远程主机"
echo "# 场景：把本地服务暴露给远程服务器"
echo "ssh -R 8080:localhost:3000 user@remote.example.com"
echo "# 远程主机访问 localhost:8080 即连到本机 3000"

echo ""
echo "=== 3. 动态端口转发 -D（SOCKS5 代理）==="
echo "ssh -D 1080 user@remote.example.com"
echo "# 本机 SOCKS5 代理 localhost:1080，所有流量经远程转发"

echo ""
echo "=== 4. 跳板机组合 ProxyJump ==="
echo "# 一行命令经堡垒机跳转到内网主机"
echo "ssh -J jump@bastion.example.com app@10.0.0.5"
echo "# 或在 ~/.ssh/config 中配置"
echo "Host target"
echo "    HostName 10.0.0.5"
echo "    User app"
echo "    ProxyJump bastion.example.com"

echo ""
echo "=== 5. 后台转发常用参数 ==="
echo "# -f 后台运行  -N 不执行命令  -T 不分配 tty"
echo "ssh -fNT -L 3306:db.internal:3306 user@jump.example.com"
echo "# 适合纯隧道场景，后台常驻不占终端"

echo ""
echo "=== 关键原理：目标地址视角 ==="
echo "# -L 3306:db.internal:3306 user@jump"
echo "# db.internal 是从 jump 服务器解析的，不是本机"
echo "# 填 localhost 指 jump 服务器本机"
echo ""
echo "=== 演示结束 ==="`,
  },
];
