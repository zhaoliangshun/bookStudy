// =============================================================
// Batch 1：Linux 入门（4 章）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：Linux 概述与发行版
  // ============================================================
  {
    id: "os-intro",
    group: "Linux 入门",
    icon: "🐧",
    title: "Linux 概述与发行版",
    content: `
## 概述
Linux 是当今服务器领域占据绝对主导地位的操作系统内核。本章梳理「内核」与「发行版」的关系，介绍主流发行版的差异与选型，并讲解 apt/yum/dnf/apk 等包管理器的用法。理解这些概念是后续在服务器上部署、运维任何应用的基础。

## 核心要点
- **内核（Kernel）**: Linux 严格来说只是内核，由 Linus Torvalds 维护，负责进程调度、内存管理、文件系统、驱动与网络协议栈 - 它是操作系统的「大脑」。
- **发行版（Distro）**: 在内核之上打包 GNU 工具、包管理器、初始化系统与桌面环境即得到发行版 - 如 Ubuntu、CentOS、Debian。
- **Debian 系**: \`apt\` 包管理，代表 Ubuntu/Debian - 生态丰富、文档多，适合新手与桌面。
- **RHEL 系**: \`yum\`/\`dnf\` 包管理，代表 CentOS/Rocky/Fedora - 企业级稳定，常见于生产服务器。
- **Alpine**: \`apk\` 包管理，体积极小（约 5MB） - 是 Docker 镜像与容器的首选基础镜像。
- **查看发行版**: \`cat /etc/os-release\` - 返回发行版名称、版本、ID 等标准化信息。
- **查看内核版本**: \`uname -r\` 显示内核版本号，\`uname -a\` 显示全部信息 - 排查驱动/兼容性问题时常用。
- **包管理四件套**: 安装 \`apt install\`、更新源 \`apt update\`、升级 \`apt upgrade\`、卸载 \`apt remove\` - 不同发行版命令前缀不同但套路一致。
- **服务器选型**: 生产环境追求稳定优先选 Debian/RHEL 系长期支持版；容器场景选 Alpine；个人学习选 Ubuntu - 不要在生产用滚动发行版。
- **LTS 版本**: 长期支持版（如 Ubuntu 24.04 LTS）提供 5 年安全更新 - 生产服务器务必选 LTS。

## 原理与机制
- **内核与用户空间分离**: 内核运行在特权态，应用程序通过系统调用（syscall）请求内核服务 - 这种隔离保证了系统稳定性与安全。
- **发行版的本质是「打包策略」**: 同样的内核，因选择的 GCC 版本、glibc、init 系统（systemd vs OpenRC）、软件源不同而表现迥异 - 这就是为什么「能跑在 Ubuntu 的包未必能在 Alpine 跑」（Alpine 用 musl libc 而非 glibc）。
- **包管理器的作用**: 解决「下载-依赖解析-校验-安装-注册」全流程 - 手动编译安装容易留下孤儿文件和版本冲突，包管理器维护一个全局数据库记录每个文件归属哪个包。
- **软件源（Repository）**: 包管理器从配置的源拉取软件索引和包 - 源的版本决定你能装到什么版本，生产环境通常锁定到特定源版本以保证可复现。

## 易错点与陷阱
- **陷阱**: 在 Alpine 上直接跑 Ubuntu 编译的二进制会报 \`not found\` 或段错误 - 根因是 musl vs glibc 不兼容，需在 Alpine 内重新编译或用 \`gcompat\` 兼容层。
- **陷阱**: \`yum\` 在新版 RHEL/CentOS 8+ 已被 \`dnf\` 取代，但 yum 命令仍作为软链保留 - 新脚本应优先用 \`dnf\`。
- **陷阱**: \`apt update\` 只刷新索引不安装任何东西，\`apt upgrade\` 才是真正升级 - 新手常以为 update 就升级了导致漏洞未修复。
- **陷阱**: CentOS 8 已于 2021 年底 EOL，CentOS 7 也已于 2024 年 6 月 EOL，原镜像源失效 - 迁移到 Rocky Linux/AlmaLinux 或切换 vault 源。

## 实战建议
- **建议**: 生产服务器一律使用 LTS/稳定版，并通过 \`/etc/os-release\` 确认版本后再部署应用 - 避免在滚动版上自找麻烦。
- **建议**: 容器镜像优先选 Alpine（体积小、攻击面小），但若依赖复杂 C 库或闭源二进制，选 Debian-slim 更稳妥 - 体积与兼容性要权衡。
- **建议**: 编写部署脚本前先用 \`command -v apt || command -v dnf || command -v apk\` 探测包管理器，让脚本跨发行版可移植。
`,
    code: `# ===== Linux 概述与发行版 演示 =====
# 1. 查看内核信息（uname 在 macOS/Linux 通用）
echo "=== 内核信息 uname ==="
uname -s        # 内核名称：Darwin(macOS) / Linux
uname -r        # 内核版本号
uname -m        # 机器架构

# 2. 查看操作系统发行版信息（macOS 无此文件，做兼容处理）
echo ""
echo "=== /etc/os-release（Linux 发行版标识） ==="
if [ -f /etc/os-release ]; then
  head -n 6 /etc/os-release
else
  echo "（当前为 macOS，无 /etc/os-release；Linux 下输出示例：）"
  echo 'PRETTY_NAME="Ubuntu 24.04 LTS"  |  NAME="Ubuntu"  |  VERSION_ID="24.04"  |  ID=ubuntu'
fi

# 3. 各发行版特征与包管理器对照（echo 模拟说明）
echo ""
echo "=== 主流发行版特征对照 ==="
echo "[Ubuntu/Debian] 包管理: apt      | libc: glibc  | 场景: 通用/桌面/服务"
echo "[CentOS/Rocky]  包管理: dnf/yum  | libc: glibc  | 场景: 企业生产服务"
echo "[Alpine]        包管理: apk      | libc: musl   | 场景: Docker 容器镜像"

# 4. 包管理器命令对照（echo 模拟，macOS 无 apt/yum）
echo ""
echo "=== 包管理四件套对照 ==="
echo "Debian系 : apt update | apt install curl | apt upgrade | apt remove curl"
echo "RHEL系   : dnf check-update | dnf install curl | dnf upgrade | dnf remove curl"
echo "Alpine   : apk update | apk add curl | apk upgrade | apk del curl"

# 5. 探测当前可用包管理器（跨发行版脚本常用技巧）
echo ""
echo "=== 探测当前包管理器 ==="
command -v apt  >/dev/null && echo "→ 检测到 apt（Debian 系）"   || echo "未发现 apt"
command -v dnf  >/dev/null && echo "→ 检测到 dnf（RHEL 系）"   || echo "未发现 dnf"
command -v brew >/dev/null && echo "→ 检测到 brew（macOS/Homebrew）" || echo "未发现 brew"
`,
  },

  // ============================================================
  // 第 2 章：终端、Shell 与 SSH
  // ============================================================
  {
    id: "os-terminal",
    group: "Linux 入门",
    icon: "💻",
    title: "终端、Shell 与 SSH",
    content: `
## 概述
绝大多数服务器没有图形界面，运维与开发都通过「终端 + Shell + SSH」远程完成。本章讲解终端模拟器、常见 Shell（bash/zsh）的区别，以及如何用 SSH 远程登录、用 ~/.ssh/config 简化连接、用 scp/rsync 传输文件。掌握这些是日常操作 Linux 服务器的基本功。

## 核心要点
- **终端模拟器**: iTerm2、Terminal.app、GNOME Terminal 都是终端 - 它们只负责「显示字符 + 传递输入」，真正执行命令的是 Shell。
- **Shell**: \`bash\` 是大多数 Linux 默认 Shell；\`zsh\` 是 macOS 默认且交互更强 - 都兼容 POSIX 语法，脚本首选 bash 以保证可移植。
- **查看当前 Shell**: \`echo $SHELL\` 显示登录 Shell 路径，\`ps -p $$\` 显示当前实际 Shell - 二者有时不一致。
- **SSH 远程登录**: \`ssh user@host\` 默认 22 端口；\`ssh -p 2222 user@host\` 指定端口 - 前提是服务端开了 sshd 且放行端口。
- **密钥登录**: \`ssh-keygen -t ed25519\` 生成密钥对，\`ssh-copy-id user@host\` 上传公钥 - 生产环境禁用密码登录、只用密钥。
- **SSH 配置文件**: \`~/.ssh/config\` 可为每台主机预设别名、端口、密钥 - 之后 \`ssh prod\` 一条命令即可连接。
- **scp 传文件**: \`scp file.txt user@host:/tmp/\` 上传，\`scp user@host:/var/log/app.log ./\` 下载 - 适合单文件，传目录加 \`-r\`。
- **rsync 同步**: \`rsync -avz src/ user@host:dst/\` 增量同步、支持断点续传 - 传大目录/备份首选 rsync。
- **SSH 隧道**: \`ssh -L 8080:localhost:80 user@host\` 把远程 80 端口映射到本地 8080 - 访问内网服务、调试数据库必备。
- **保持连接**: \`~/.ssh/config\` 设 \`ServerAliveInterval 60\` 每 60 秒发心跳 - 防止空闲断连。

## 原理与机制
- **终端 vs Shell vs Console**: 终端是字符界面的物理/虚拟设备，Shell 是命令解释器，Console 特指系统主终端 - 现代三者常被混称，但概念上分离。
- **SSH 握手**: 客户端先用非对称加密协商会话密钥，再用对称加密通信 - 公钥用于身份认证，会话密钥用于数据加密，兼顾安全与性能。
- **scp 与 rsync 都基于 SSH**: rsync 在 SSH 之上做「差异比对 + 增量传输」，先比较两端文件大小/时间戳/校验和，只传变化块 - 所以大目录二次同步远快于 scp。
- **~/.ssh/config 本质**: 它是 ssh 客户端读取的 INI 风格配置，按 \`Host\` 段匹配主机别名，把命令行长参数固化下来 - 减少记忆负担和输错。

## 易错点与陷阱
- **陷阱**: \`~/.ssh\` 目录权限必须是 \`700\`，\`authorized_keys\` 必须 \`600\` - 权限过宽 sshd 会拒绝密钥登录且无明显报错。
- **陷阱**: scp 传目录时 \`scp -r src host:dst\` 和 \`scp -r src/ host:dst\` 行为不同 - 尾随 \`/\` 表示传「内容」而非「目录本身」，容易放错位置。
- **陷阱**: \`rsync src dst\` 漏掉冒号会被当成本地拷贝 - 远程目标必须写成 \`user@host:path\`，调试时先加 \`-n\`（dry-run）预演。

## 实战建议
- **建议**: 把所有服务器连接信息写进 \`~/.ssh/config\`，用短别名（如 \`prod\`/\`staging\`）连接 - 既安全又省事，避免每次输一长串参数。
- **建议**: 传大量小文件或大目录永远用 \`rsync -avz\` 而非 scp - 支持断点续传和增量，网络中断后可无脑重跑。
- **建议**: 密钥用 \`ed25519\`（更短更快更安全），并给私钥设密码短语；不同环境用不同密钥对，便于审计与吊销。
`,
    code: `# ===== 终端、Shell 与 SSH 演示 =====
# 1. 查看当前 Shell（macOS/Linux 通用）
echo "=== 当前 Shell ==="
echo "登录 Shell: $SHELL"
ps -p $$ -o comm=          # 当前实际运行的 Shell 名称

# 2. ssh 远程登录命令格式说明（echo 模拟，沙箱无网络不实际连接）
echo ""
echo "=== ssh 命令格式 ==="
echo "ssh user@host                            # 默认 22 端口登录"
echo "ssh -p 2222 user@host                    # 指定端口登录"
echo "ssh -i ~/.ssh/id_ed25519 user@host       # 指定私钥登录"

# 3. scp / rsync 传文件示例（echo 模拟说明）
echo ""
echo "=== 文件传输 ==="
echo "scp file.txt user@host:/tmp/        # 上传单文件"
echo "scp -r logs/ user@host:/var/log/    # 上传目录"
echo "rsync -avz src/ user@host:dst/      # 增量同步（首选）"

# 4. 生成示例 ~/.ssh/config（echo 输出，沙箱可跑）
echo ""
echo "=== 示例 ~/.ssh/config 内容 ==="
cat <<'EOF'
Host prod
  HostName 10.0.0.20
  User deploy
  Port 22
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 60

Host staging
  HostName staging.example.com
  User ubuntu
  IdentityFile ~/.ssh/staging_key
EOF
echo "（写入后即可: ssh prod / ssh staging 一键连接）"

# 5. ssh-keygen 生成密钥说明（仅打印命令，不在沙箱真生成以免污染）
echo ""
echo "=== 密钥生成 ==="
echo "ssh-keygen -t ed25519 -C 'your_email@example.com'   # 生成 ed25519 密钥对"
echo "ssh-copy-id user@host                               # 上传公钥到服务器"
`,
  },

  // ============================================================
  // 第 3 章：文件系统层次标准 FHS
  // ============================================================
  {
    id: "os-fhs",
    group: "Linux 入门",
    icon: "📁",
    title: "文件系统层次标准 FHS",
    content: `
## 概述
Linux 文件系统层次标准（FHS，Filesystem Hierarchy Standard）规定了各顶层目录的用途，让不同发行版、不同软件都能「按约定放对位置」。理解 /etc、/var、/home、/tmp、/usr、/opt 等目录的含义，是部署应用、查找日志、排查问题的前提。本章梳理 FHS 核心目录与服务部署相关路径。

## 核心要点
- **/etc**: 存放系统级配置文件（纯文本） - 如 \`/etc/nginx/nginx.conf\`、\`/etc/hosts\`、\`/etc/os-release\`，改配置不改程序。
- **/var**: 存放运行时可变数据 - 日志 \`/var/log\`、Web 根 \`/var/www\`、缓存 \`/var/cache\`、邮件 \`/var/mail\`。
- **/home**: 普通用户家目录 - 如 \`/home/alice\`，用户私有数据与个人配置（\`~/.bashrc\`）。
- **/tmp**: 临时文件，重启可能清空 - 任何程序都可写，不要放重要数据；做实验临时文件可放这里。
- **/usr**: 只读的程序与资源 - \`/usr/bin\` 可执行、\`/usr/lib\` 库、\`/usr/share\` 文档；现代已合并但仍区分用途。
- **/proc**: 内核与进程的虚拟文件系统（macOS 无） - \`/proc/cpuinfo\`、\`/proc/<pid>/\`，查看运行态信息不占磁盘。
- **/sys**: 设备与驱动的虚拟文件系统（macOS 无） - sysfs，管理硬件、内核模块参数。
- **/opt**: 第三方/独立软件安装目录 - 如 \`/opt/app\`、\`/opt/google/chrome\`，整包独立、卸载干净。
- **/root**: root 用户家目录 - 与 /home 分开，普通用户无权进入。
- **绝对 vs 相对路径**: \`/etc/hosts\` 是绝对路径（从根起）；\`../etc\` 是相对路径（相对当前目录） - 脚本中尽量用绝对路径避免歧义。

## 原理与机制
- **一切皆文件**: Linux 把设备、进程、网络都抽象成文件 - /dev/sda 是磁盘，/proc 是进程，/sys 是硬件，统一用 open/read/write 接口操作。
- **FHS 是约定不是强制**: 发行版基本遵循但有小差异 - 例如 /run 在新版取代了 /var/run，/usr 合并让 /bin 成为 /usr/bin 的软链。
- **虚拟文件系统不占磁盘**: /proc、/sys、/dev 是内核动态生成的「假文件」 - 它们反映运行态，\`df\` 不计入磁盘占用，断电即消失。
- **部署目录约定**: 应用代码常放 \`/opt/app\` 或 \`/srv/app\`，日志放 \`/var/log/app\`，PID 文件放 \`/var/run\`（即 /run） - 遵循约定利于 systemd 管理和日志收集。

## 易错点与陷阱
- **陷阱**: 把临时文件放 \`/tmp\` 期望长期保留 - 多数系统有 tmpwatch/systemd-tmpfiles 定期清理 /tmp，重要数据会丢；持久数据放 /var 或 /opt。
- **陷阱**: macOS 没有 \`/proc\` 和 \`/sys\`，相关命令在 Mac 上跑不了 - 跨平台脚本要先判断 \`[ -d /proc ]\` 再访问。
- **陷阱**: \`/usr/local\` 与 \`/usr\` 的区别常被忽略 - 发行版包管理器装到 /usr，手动编译/自装软件应放 /usr/local，避免升级时被覆盖。

## 实战建议
- **建议**: 部署应用统一用 \`/opt/<app>\` 放程序、\`/var/log/<app>\` 放日志、\`/etc/<app>\` 放配置 - 结构清晰、便于备份和 systemd 托管。
- **建议**: 写脚本用绝对路径（\`/var/log/app.log\`）而非相对路径 - 脚本可能被 cron/systemd 以任意工作目录执行，相对路径会找不到文件。
- **建议**: 排查服务器问题先看 \`/var/log\`（messages、syslog、nginx/error.log）和 \`/proc\`（cpuinfo、meminfo、loadavg） - 这两个目录是诊断的「第一现场」。
`,
    code: `# ===== 文件系统层次标准 FHS 演示 =====
# 1. pwd / cd 演示（绝对路径 vs 相对路径）
echo "=== pwd / cd 演示 ==="
pwd                          # 显示当前工作目录（绝对路径）
cd /tmp && pwd               # 绝对路径跳转
cd / && pwd                  # 跳到根目录
cd /tmp                      # 回 /tmp 便于后续演示

# 2. 列出常见顶层目录（macOS/Linux 通用部分）
echo ""; echo "=== 顶层目录概览 ==="
ls -d /etc /var /tmp /usr /opt /root /home 2>/dev/null

# 3. 关键目录用途说明（echo 解释）
echo ""; echo "=== 关键目录用途 ==="
echo "/etc  - 系统配置（nginx.conf, hosts, os-release）"
echo "/var  - 可变数据：日志 /var/log、Web根 /var/www"
echo "/home - 普通用户家目录 | /tmp - 临时文件，重启可能清空"
echo "/usr  - 程序资源：/usr/bin /usr/lib | /opt - 第三方软件"
echo "/root - root 家目录"

# 4. 查看 /etc 实际内容 + 虚拟文件系统（macOS 兼容）
echo ""; echo "=== /etc 下部分文件 ==="
ls /etc | head -n 6
echo ""; echo "=== 虚拟文件系统 /proc /sys（仅 Linux） ==="
if [ -d /proc ]; then
  head -n 3 /proc/cpuinfo
else
  echo "（macOS 无 /proc /sys；Linux 下 /proc 反映进程与内核运行态）"
  echo "示例: cat /proc/cpuinfo | /proc/meminfo | /proc/loadavg"
fi

# 5. 服务器部署常见目录约定（echo 说明）
echo ""; echo "=== 服务器部署目录约定 ==="
echo "/opt/app  程序代码 | /etc/app  配置 | /var/log/app  日志 | /var/www  Web根"
`,
  },

  // ============================================================
  // 第 4 章：基础命令速览
  // ============================================================
  {
    id: "os-basic-cmds",
    group: "Linux 入门",
    icon: "🛠️",
    title: "基础命令速览",
    content: `
## 概述
Linux 基础命令是所有后续操作的基石。本章速览最常用的命令：ls 查看目录、cd/pwd 切换与定位、cat/echo 查看与输出、man/--help 查文档、mkdir/touch 创建、clear/history 清屏与历史。这些命令虽然简单，但每天都会用到几十次，熟练掌握能极大提升在服务器上的操作效率。

## 核心要点
- **ls 列目录**: \`ls -l\` 长格式（权限/属主/大小/时间），\`-a\` 显示隐藏文件，\`-h\` 人类可读大小，\`-t\` 按时间排序 - 组合 \`ls -laht\` 最常用。
- **cd 切换目录**: \`cd /etc\` 绝对路径，\`cd ..\` 上级，\`cd ~\` 回家，\`cd -\` 回到上一次目录 - 不带参数等同 \`cd ~\`。
- **pwd 显示路径**: 打印当前绝对路径 - 脚本里常用 \`pwd\` 确认工作目录，避免相对路径出错。
- **cat 查看文件**: \`cat file\` 输出全部内容；\`cat -n\` 带行号 - 适合小文件，大文件用 \`less\` 分页。
- **echo 输出**: \`echo $HOME\` 打印变量；\`echo -e "a\\nb"\` 解释转义 - 脚本中用于提示和写文件。
- **查文档**: \`man ls\` 看手册（详尽），\`ls --help\` 看速查（简洁） - 新手优先 \`--help\`，深入查 \`man\`。
- **mkdir 建目录**: \`mkdir -p a/b/c\` 递归创建多层且不报错 - \`-p\` 是建嵌套目录的关键。
- **touch 建空文件**: \`touch f.txt\` 创建空文件或更新已有文件时间戳 - 常用于占位或刷新 mtime。
- **clear 清屏**: 清空当前终端画面（历史仍可用上下键翻） - 快捷键 \`Ctrl+L\` 等效。
- **history 历史**: \`history\` 列出命令历史，\`!100\` 重跑第 100 条，\`!!\` 重跑上一条 - \`Ctrl+R\` 反向搜索更高效。

## 原理与机制
- **命令本质**: 一条命令 = 可执行程序（/usr/bin/ls）+ 参数 + 选项 - Shell 解析后 fork 子进程执行，通过 PATH 变量查找程序。
- **选项风格**: POSIX 短选项 \`-l\` 可合并（\`-la\`），GNU 长选项 \`--all\` 更易读 - macOS 部分命令是 BSD 版，长选项支持不如 GNU 全。
- **隐藏文件规则**: 以 \`.\` 开头的文件/目录被视为隐藏，\`ls\` 默认不显示 - 这是为什么配置文件多用 \`.bashrc\` 这种名字。
- **PATH 查找**: 输入 \`ls\` 时 Shell 按 \`$PATH\` 列出的目录顺序查找可执行文件 - \`which ls\` 可看实际路径，\`type ls\` 能区分别名/内置/外部。

## 易错点与陷阱
- **陷阱**: macOS 的 \`ls\`、\`cp\`、\`sed\` 是 BSD 版，与 Linux 的 GNU 版选项有差异 - 例如 \`ls --color\` 在 macOS 报错（要用 \`-G\`），跨平台脚本需注意。
- **陷阱**: \`cd\` 在某些 Shell 脚本中失败不会中止脚本 - 关键跳转后用 \`cd dir || exit 1\` 防止后续命令在错误目录执行。
- **陷阱**: \`touch\` 不能创建目录，只能建空文件；想一次建多层用 \`mkdir -p\` - 混淆会导致「No such file or directory」。
- **陷阱**: \`cat\` 大文件会刷屏甚至卡终端 - 几百 MB 的日志务必用 \`less\` 或 \`tail -n 100\` 而非 cat。

## 实战建议
- **建议**: 牢记 \`ls -lah\`、\`cd -\`、\`Ctrl+R\` 三个高频组合，再配合 \`man\`/\`--help\` 自学 - 90% 的日常目录操作就够用了。
- **建议**: 在 /tmp 下做命令练习（建目录、建文件、删除），不影响系统 - 实验完随手清理，养成安全习惯。
- **建议**: 写脚本时每个可能失败的命令都加 \`|| exit 1\` 或 \`set -e\` - 避免 cd 失败后继续在错误目录删文件酿成事故。
`,
    code: `# ===== 基础命令速览演示（在 /tmp 下安全练习）=====
# 1. ls 各选项演示
echo "=== ls 选项演示 ==="
ls -l /tmp | head -n 3        # -l 长格式：权限/属主/大小/时间
ls -a /tmp | head -n 5        # -a 显示隐藏文件（. 开头）
ls -lh /tmp | head -n 3       # -h 人类可读大小（K/M/G）
ls -lt /tmp | head -n 3       # -t 按修改时间排序

# 2. mkdir / touch 在 /tmp 下创建演示
echo ""; echo "=== mkdir / touch 演示 ==="
mkdir -p /tmp/demo_os/sub      # -p 递归创建多层目录
touch /tmp/demo_os/a.txt /tmp/demo_os/b.txt   # 创建空文件
ls -l /tmp/demo_os

# 3. pwd / cd 演示
echo ""; echo "=== pwd / cd 演示 ==="
cd /tmp/demo_os && pwd         # 绝对路径跳转并显示
cd sub && pwd                  # 相对路径进入子目录
cd -                           # 回到上一次目录
pwd

# 4. cat / echo 演示
echo ""; echo "=== cat / echo 演示 ==="
echo "第一行" > /tmp/demo_os/note.txt   # echo 写入文件
echo "第二行" >> /tmp/demo_os/note.txt  # >> 追加
cat -n /tmp/demo_os/note.txt            # cat -n 带行号查看
echo "HOME 变量: $HOME"                  # echo 打印变量

# 5. 查文档与历史
echo ""; echo "=== man / help / history ==="
ls --help 2>&1 | head -n 4    # --help 速查（简洁）
echo "history 最近命令（沙箱可能为空）:"
history 3 2>/dev/null || echo "（当前 Shell 无历史记录）"

# 6. 清理演示目录（仅删 /tmp 下自建目录，安全）
rm -rf /tmp/demo_os
echo ""; echo "演示完成，已清理 /tmp/demo_os"
`,
  },
];
