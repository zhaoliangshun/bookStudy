// =============================================================
// 操作系统实战教程 —— 第四批章节（进程与服务，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. os-process  — 进程查看
//   2. os-kill     — 进程控制与信号
//   3. os-systemd  — systemd 服务管理
//   4. os-cron     — 定时任务 cron
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（"进程与服务"）
//   content : Markdown 格式的详细讲解（5 段式，30-55 行）
//   code    : macOS bash 沙箱可运行（无 root，10s 超时）
//             特权命令用 echo 输出示例 + 注释讲解真实用法
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：进程查看
  // =========================================================
  {
    id: "os-process",
    title: "进程查看",
    icon: "⚙️",
    group: "进程与服务",
    content: `## 概述

进程是 Linux 系统中程序运行的实例。每一个命令、每一个后台服务、每一个图形程序，在内核看来都是一个进程——拥有独立的 PID、内存空间、文件描述符表和调度上下文。运维与排查问题的第一步，几乎永远是"先看进程"。本章把 ps、top、pgrep、pstree 与 /proc 串成一条完整的进程观测链路，让你在拿到一台陌生机器时能在 30 秒内摸清"谁在跑、占了什么、状态如何"。

## 核心要点

- **ps aux 与 ps -ef**：\`ps aux\`（BSD 风格）和 \`ps -ef\`（System V 风格）是两条最经典的进程快照命令。\`aux\` 列出所有用户进程并显示 CPU/内存占用；\`-ef\` 通过父进程 PPID 展示进程树关系。macOS 默认支持 \`ps aux\` 但 \`-ef\` 语义略有差异，跨平台脚本建议用 \`ps aux\`。
- **top / htop**：\`top\` 是交互式实时视图，默认按 CPU 占用排序，P 按 CPU、M 按内存、k 可杀进程。\`htop\` 是更友好的彩色增强版，支持鼠标和树状视图，但需额外安装。
- **pgrep**：按名字或模式查 PID，免去 \`ps | grep\` 管道。\`pgrep -fl nginx\` 同时显示 PID 和完整命令行；\`-u root\` 限定用户。
- **pstree**：以树形展示进程父子关系，\`-p\` 显示 PID、\`-u\` 显示用户。一眼看清"谁是父、谁 fork 了谁"。
- **进程状态**：R（运行/就绪）、S（可中断睡眠）、D（不可中断睡眠，常为 IO）、Z（僵尸）、T（停止/被追踪）。\`ps\` 输出的 STAT 列即为状态。
- **僵尸进程（Z）**：子进程已退出但父进程尚未调用 wait/waitpid 回收，遗留一个只占 PID 槽位的"尸体"。大量僵尸会耗尽 PID，需找到父进程 kill 或让其 wait。
- **/proc 文件系统**：Linux 内核暴露的进程信息伪文件系统。\`/proc/<pid>/cmdline\` 是启动命令、\`status\` 是状态、\`fd/\` 是打开的文件描述符、\`maps\` 是内存映射。macOS 无 /proc，用 \`ps\`/\`lsof\` 替代。
- **CPU/内存列含义**：\`%CPU\` 是相对单核的百分比（可超 100 表示多核）；\`%MEM\` 是占物理内存比例；\`RSS\` 是常驻物理内存，\`VSZ\` 是虚拟内存（含未真正占用的）。

## 原理与机制

- **进程 = PCB + 地址空间**：内核为每个进程维护一个 task_struct（进程控制块），记录 PID、状态、调度信息、打开的文件等。ps/top 就是从内核读取这些字段并格式化输出。
- **父子关系与 fork**：所有进程都由 fork 创建（init/systemd 是 PID 1 的根）。fork 复制父进程地址空间，exec 加载新程序。pstree 展示的树就是 fork 链路。
- **/proc 是内核数据接口**：\`/proc/<pid>\` 目录不是真文件，而是内核在读取时动态生成的虚文件。cat 它等于向内核查询该 PID 的 PCB，开销极低。
- **状态迁移**：进程在就绪↔运行↔睡眠间由调度器驱动迁移。D 状态不可中断，连 SIGKILL 都要等 IO 返回才生效，这是排查"杀不掉的进程"的关键。

## 易错点与陷阱

- **ps aux 在 macOS 与 Linux 列含义略不同**：macOS 的 \`ps aux\` 没有 Linux 完整的 STAT 后缀（如 \`Ss\`、\`Sl\`），跨平台脚本不要硬解析列。
- **grep 自身污染结果**：\`ps aux | grep nginx\` 会把 grep 自己列出来。用 \`pgrep nginx\` 或 \`ps aux | grep [n]ginx\`（中括号技巧）规避。
- **僵尸进程不能直接 kill**：Z 状态的进程已经死了，\`kill -9 <僵尸PID>\` 无效。必须 kill 其父进程或让父进程 wait。

## 实战建议

- 排查"机器卡"先跑 \`top\` 或 \`ps aux --sort=-%cpu | head\`，看是谁吃 CPU；再看 \`%MEM\` 列找内存大户。
- 拿到陌生服务先 \`pstree -p\` 一次性看清进程全貌，比逐个 ps 高效得多。
- 写守护脚本用 \`pgrep -f "完整命令"\` 判断存活，比 \`ps | grep\` 健壮，避免误判。`,
    code: `# ============================================================
# 进程查看演示（macOS bash 沙箱可运行）
# ============================================================

# ---- 1. ps 快照：列出当前 shell 相关进程 ----
# ps aux 在 macOS/Linux 通用；这里过滤 bash/sh 避免输出过多
echo "===== 1. ps 当前进程 ====="
ps aux | grep -E "bash|sh" | grep -v grep | head -5

# ---- 2. pgrep：按名字查找进程 PID ----
# 启动一个后台 sleep，用 pgrep 找它
echo ""
echo "===== 2. pgrep 查找后台 sleep ====="
sleep 30 &
SLEEP_PID=$!
echo "启动后台 sleep，PID=$SLEEP_PID"
pgrep -fl sleep | head -5

# ---- 3. 观察进程状态 STAT 列 ----
echo ""
echo "===== 3. 进程状态 STAT 列 ====="
ps -o pid,stat,command -p $SLEEP_PID
# STAT 通常是 S（睡眠）。R=运行 S=睡眠 D=不可中断睡眠 Z=僵尸 T=停止

# ---- 4. 清理后台进程 ----
kill $SLEEP_PID 2>/dev/null
echo ""
echo "===== 4. 已清理 sleep 进程 ====="

# ---- 5. /proc 说明（Linux 专有，macOS 无） ----
echo ""
echo "===== 5. /proc 说明 ====="
echo "Linux: /proc/<pid>/cmdline 存启动命令，/proc/<pid>/status 存状态"
echo "macOS 无 /proc，改用 ps -o 和 lsof 替代"`
  },

  // =========================================================
  // 第二章：进程控制与信号
  // =========================================================
  {
    id: "os-kill",
    title: "进程控制与信号",
    icon: "🔥",
    group: "进程与服务",
    content: `## 概述

能看进程，还要能"管"进程。kill 命令名不副实——它并不只是"杀死"，真正的职责是向进程发送任意信号。SIGTERM、SIGKILL、SIGHUP 各有不同语义，选错信号要么杀不干净、要么误杀正在写数据的进程。再叠加 jobs/bg/fg/nohup/disown 这套后台作业控制，就构成了完整的"进程生命周期管理"工具集。本章把信号语义和作业控制在一条主线上讲清，避免你在生产环境里发出"为什么 kill 不掉"的疑问。

## 核心要点

- **kill 的本质是发信号**：\`kill <pid>\` 默认发 SIGTERM（15），不是必杀。\`kill -<n> <pid>\` 发指定编号信号，\`kill -l\` 列出所有信号名与编号。
- **SIGTERM(15) vs SIGKILL(9)**：SIGTERM 是"礼貌请求退出"，进程可捕获并做清理（关连接、刷盘）后再退；SIGKILL 是"内核强制终结"，不可捕获不可阻塞，进程立即消失，可能丢数据。
- **SIGHUP(1)**：原本是"终端挂断"，现常被服务进程 reinterpret 为"重载配置"（如 nginx -s reload 实质发 HUP）。
- **killall / pkill**：按进程名批量发信号。\`killall nginx\` 杀所有名为 nginx 的进程；\`pkill -f "cmd pattern"\` 按命令行匹配。比 kill PID 方便，但易误伤同名进程。
- **& 后台运行**：\`cmd &\` 把命令放后台，shell 立即返回。但后台进程仍是 shell 的子进程，shell 退出时会被 SIGHUP 打死。
- **jobs / bg / fg**：\`jobs\` 列当前 shell 的后台作业，\`bg %1\` 让暂停的作业继续后台跑，\`fg %1\` 拉回前台。Ctrl+Z 暂停当前前台作业。
- **nohup**：\`nohup cmd &\` 让进程忽略 SIGHUP，stdout 重定向到 nohup.out，shell 退出后进程仍存活——最朴素的"脱离终端"手段。
- **disown**：把已有作业从 shell 的作业表移除，使其不再受 shell 退出影响。比 nohup 更适合"事后补救"——已启动的进程想保活用 disown。

## 原理与机制

- **信号是软中断**：信号由内核投递到目标进程的 PCB，进程在下次返回用户态时检查并执行默认动作、忽略或运行 handler。SIGKILL/SIGSTOP 由内核直接处理，不可被捕获。
- **SIGHUP 致命链路**：终端关闭 → 内核向会话首进程（bash）发 SIGHUP → bash 向所有子作业转发 SIGHUP → 后台进程被杀。nohup 在进程里装了忽略 SIGHUP 的 handler，断开这条链。
- **僵尸回收**：进程收到 SIGKILL 后内核释放资源，但 PCB（退出码+状态）保留给父进程 wait。父进程不 wait 就成僵尸——这是 kill 之后仍看到 Z 状态的根因。

## 易错点与陷阱

- **kill -9 不是首选**：生产服务直接 -9 会跳过优雅关闭，数据库可能丢未刷盘数据、临时文件残留。应先 SIGTERM 等 10-30 秒，无效再 -9。
- **killall 同名误伤**：\`killall python\` 会杀掉所有 python 进程，包括别人的脚本。生产环境优先用 PID 精确 kill。
- **nohup 不免疫 SIGTERM**：nohup 只忽略 SIGHUP，对 SIGTERM/SIGKILL 无防护。以为 nohup 就"杀不掉"是常见误解。

## 实战建议

- 优雅停止服务统一用"先 TERM 后 KILL"：\`kill $PID; sleep 10; kill -9 $PID 2>/dev/null\`，给应用留出清理时间。
- 长跑任务脱离终端三件套：\`nohup longjob > job.log 2>&1 &\`，再 \`disown\` 一把，关 SSH 也不会断。
- 批量杀进程优先 \`pkill -f "精确命令"\`，比 killall 更精准，配合 \`-u\` 限定用户更安全。`,
    code: `# ============================================================
# 进程控制与信号演示（macOS bash 沙箱可运行）
# ============================================================

# ---- 1. 常用信号说明 ----
echo "===== 1. 常用信号 ====="
echo "9  = SIGKILL  强制终止，不可捕获"
echo "15 = SIGTERM  优雅退出（kill 默认）"
echo "1  = SIGHUP   挂断/重载配置"
echo "2  = SIGINT   Ctrl+C 中断"
echo "19 = SIGSTOP  暂停，不可捕获"
echo "提示：kill -l 可列出系统全部信号名"

# ---- 2. 启动后台进程并检测存在性 ----
echo ""
echo "===== 2. 启动后台 sleep ====="
sleep 30 &
JOB_PID=$!
echo "后台 sleep PID=$JOB_PID"
kill -0 $JOB_PID && echo "进程存在（kill -0 检测通过）"

# ---- 3. SIGTERM 优雅停止，必要时升级 SIGKILL ----
echo ""
echo "===== 3. 发送 SIGTERM(15) ====="
kill -15 $JOB_PID 2>/dev/null
sleep 1
if kill -0 $JOB_PID 2>/dev/null; then
  echo "仍存活 -> 升级为 SIGKILL(9)"
  kill -9 $JOB_PID 2>/dev/null
else
  echo "进程已通过 SIGTERM 优雅退出"
fi

# ---- 4. 作业控制速查 ----
echo ""
echo "===== 4. 作业控制速查 ====="
echo "cmd &        后台运行，仍受终端控制"
echo "nohup cmd &  忽略 SIGHUP，关终端不死"
echo "disown       把已有作业移出 shell 表，事后保活"
echo "kill %1      按作业号杀（交互式 shell）"
echo "kill -0 PID  不发信号，仅检测进程是否存在"`
  },

  // =========================================================
  // 第三章：systemd 服务管理
  // =========================================================
  {
    id: "os-systemd",
    title: "systemd 服务管理",
    icon: "🚀",
    group: "进程与服务",
    content: `## 概述

现代 Linux 几乎全部用 systemd 管理服务和系统资源。它是 PID 1 的 init 系统，掌管开机启动、服务生命周期、日志聚合、资源限制。掌握 systemctl 和 journalctl，等于掌握了"让服务在服务器上稳定长跑"的核心能力。本章不讲 systemd 全部 200+ 单元类型，只聚焦运维最高频的服务单元（.service）：怎么写、怎么启停、怎么查日志、怎么开机自启。

## 核心要点

- **systemctl 核心动作**：\`start\`/\`stop\`/\`restart\`/\`reload\`/\`status\` 控制服务运行；\`enable\`/\`disable\` 控制是否开机自启。注意 start 是"现在启动"，enable 是"开机启动"，两者正交，常组合 \`enable --now\`。
- **单元文件位置**：系统级放 \`/usr/lib/systemd/system/\`（包管理器安装，勿改），管理员覆盖放 \`/etc/systemd/system/\`（优先级更高）。自定义服务放后者。
- **.service 单元结构**：\`[Unit]\` 描述与依赖（After/Wants），\`[Service]\` 启动命令与策略（Type/ExecStart/Restart/User），\`[Install]\` 决定 enable 时挂到哪个 target（WantedBy=multi-user.target）。
- **Type 关键取值**：\`simple\`（默认，ExecStart 立即视为启动成功，前台进程用）、\`forking\`（传统守护进程 fork 后父退出）、\`notify\`（服务 sd_notify 通知就绪，最严谨）。Web 服务多用 simple。
- **Restart 自动拉起**：\`Restart=always\` 任何退出都重启；\`Restart=on-failure\` 仅异常退出重启；\`RestartSec=5s\` 间隔。这是"服务挂了自动恢复"的关键配置。
- **journalctl 查日志**：\`journalctl -u nginx\` 看某服务日志；\`-f\` 跟踪（类似 tail -f）；\`--since "10 min ago"\` 按时间过滤；\`-p err\` 按级别过滤。所有服务日志统一聚合到 journald，无需再找零散日志文件。
- **修改单元文件后必须 reload**：\`systemctl daemon-reload\` 让 systemd 重新加载单元定义，否则改动不生效。这是新手最常漏的一步。
- **资源限制**：\`[Service]\` 里可设 \`MemoryLimit=512M\`、\`CPUQuota=200%\`、\`LimitNOFILE=65536\`，实现 cgroup 级别的资源隔离，比 ulimit 更强。

## 原理与机制

- **systemd 是 PID 1**：开机后内核启动 systemd（PID 1），它按依赖顺序拉起所有 enabled 的单元，构成"启动树"。每个服务是它的子进程，退出状态由它回收，因此能可靠 Restart。
- **cgroups 绑定**：每个服务进程被放进独立 cgroup，systemd 据此精确统计和限制资源，kill 服务时按 cgroup 把所有子孙进程一并清理，不漏杀。
- **journald 结构化日志**：所有服务 stdout/stderr 被 journald 收集并附上元数据（时间、PID、单元名、优先级），日志是二进制索引结构，所以 journalctl 能按字段高效过滤。

## 易错点与陷阱

- **改了单元文件不 daemon-reload**：systemd 仍用旧定义，restart 不生效。流程应是：改文件 → daemon-reload → restart。
- **Type 选错导致服务"启动失败"**：forking 守护进程若用 simple，systemd 以为 ExecStart 退出就是服务挂了；反过来传统 daemon 用 forking 但没配 PIDFile 会监错进程。
- **ExecStart 路径必须绝对**：systemd 不走 PATH 查找，写 \`ExecStart=nginx\` 会失败，必须 \`ExecStart=/usr/sbin/nginx\`。

## 实战建议

- 部署一个新服务的标准动作：写 .service → \`daemon-reload\` → \`enable --now\` → \`status\` 确认 active → \`journalctl -f -u 服务名\` 盯日志。
- 健壮服务单元三件套：\`Type=simple\` + \`Restart=always\` + \`RestartSec=5s\`，配合 \`User=appuser\` 降权运行。
- 排查服务启动失败先 \`systemctl status xxx\`（看错误码）再 \`journalctl -u xxx -n 50\`（看具体日志），九成问题在这一步定位。`,
    code: `# ============================================================
# systemd 服务管理演示（沙箱无 systemd，用 echo 输出示例 + 注释讲解）
# ============================================================

# ---- 1. 生成一个示例 .service 单元文件 ----
echo "===== 1. 示例单元文件 /etc/systemd/system/myapp.service ====="
cat << 'UNIT'
[Unit]
Description=My Web Application
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node /opt/myapp/server.js
Restart=always
RestartSec=5s
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
UNIT

# ---- 2. 部署服务的标准命令序列（需 root + systemd 环境） ----
echo ""
echo "===== 2. 部署命令序列（真实环境）====="
echo "sudo cp myapp.service /etc/systemd/system/"
echo "sudo systemctl daemon-reload       # 重新加载单元定义"
echo "sudo systemctl enable --now myapp  # 开机自启 + 立即启动"
echo "sudo systemctl status myapp        # 查看运行状态"

# ---- 3. journalctl 查日志（真实环境） ----
echo ""
echo "===== 3. 日志查询（真实环境）====="
echo "journalctl -u myapp -f                # 实时跟踪服务日志"
echo "journalctl -u myapp --since '1h ago'  # 最近 1 小时"
echo "journalctl -u myapp -p err            # 只看错误级别"

# ---- 4. 关键配置讲解 ----
echo ""
echo "===== 4. 关键配置讲解 ====="
echo "Type=simple           ExecStart 启动后即视为就绪，前台进程用"
echo "Restart=always        任何退出都自动拉起，配合 RestartSec=5s"
echo "After=network.target  声明依赖，网络就绪后再启动"
echo "WantedBy=multi-user.target  enable 时挂到多用户目标"`
  },

  // =========================================================
  // 第四章：定时任务 cron
  // =========================================================
  {
    id: "os-cron",
    title: "定时任务 cron",
    icon: "⏰",
    group: "进程与服务",
    content: `## 概述

cron 是 Linux 内置的定时任务调度器，几乎所有"每天凌晨备份""每小时同步""每分钟健康检查"类需求都靠它实现。它的配置极简——一行 crontab 表达式 + 一条命令——但表达式语法和执行环境有诸多暗坑：时区、路径、环境变量、输出重定向。本章把 cron 表达式、crontab 命令、/etc/cron.d、at/anacron 串起来，让你写出"既能在测试机跑通、又能在生产稳定执行"的定时任务。

## 核心要点

- **crontab 表达式五段**：\`分 时 日 月 周\`（minute hour day-of-month month day-of-week）。\`*\` 表示任意，\`*/5\` 每 5 单位，\`1,3,5\` 列表，\`5-10\` 范围。
- **crontab 命令**：\`crontab -e\` 编辑当前用户任务、\`-l\` 列出、\`-r\` 删除全部、\`-u user\` 指定用户（需 root）。每行一条任务，\`#\` 开头是注释。
- **常见表达式速记**：\`*/5 * * * *\` 每 5 分钟；\`0 * * * *\` 每小时整点；\`0 2 * * *\` 每天凌晨 2 点；\`0 0 * * 0\` 每周日凌晨；\`0 0 1 * *\` 每月 1 号 0 点。
- **/etc/cron.d 目录**：放系统级定时任务文件（每文件一条或多条 cron 行），格式比 crontab 多一个"用户"字段：\`分 时 日 月 周 user cmd\`。包管理器安装的服务常把任务丢这里。
- **预定义目录**：\`/etc/cron.daily\`、\`cron.hourly\`、\`cron.weekly\`、\`cron.monthly\`——把脚本扔进去就按周期执行，无需写表达式，适合简单周期任务。
- **at 一次性任务**：\`at 2:00 tomorrow\` 或 \`echo "cmd" | at now + 30 minutes\`，跑一次就消失。适合"30 分钟后重启"这类瞬时调度，需 atd 守护进程。
- **anacron**：弥补 cron"错过不补"的缺陷。机器关机时错过的 daily/weekly 任务，开机后 anacron 会补跑。笔记本和间歇开机的服务器必用。
- **cron 执行环境极简**：cron 跑任务时 PATH 通常只有 \`/usr/bin:/bin\`，没有用户 shell 的环境变量。脚本里用到 node/python/conda 必须写绝对路径或显式 export PATH。

## 原理与机制

- **crond 守护进程**：每分钟醒来一次，读取所有 crontab（/var/spool/cron/ 用户级 + /etc/cron.d 系统级 + /etc/crontab），匹配当前时间到表达式就 fork 执行。任务并发执行，不互相等待。
- **表达式匹配规则**：分时日月周四段是"且"关系，但"日"和"周"是"或"关系——同时指定日和周时，满足任一即触发（POSIX 规则，部分实现有差异）。
- **输出与邮件**：任务有 stdout/stderr 时，cron 默认尝试用 mail 命令发邮件给属主用户。没装 mail agent 就静默丢弃——所以必须手动重定向到日志文件。

## 易错点与陷阱

- **环境变量缺失**：cron 任务里 \`node app.js\` 报 command not found，因为 PATH 不含 /usr/local/bin。解决：脚本开头 \`source /etc/profile\` 或写绝对路径。
- **百分比号是特殊字符**：crontab 命令行里的 \`%\` 会被转义为换行（用于 stdin）。\`date +%F\` 必须写成 \`date +\\%F\`，否则被截断。
- **时区坑**：cron 按 crond 进程的时区执行，通常是服务器系统时区。容器里若时区是 UTC，"凌晨 2 点"就是 UTC 2 点，不是北京时间。

## 实战建议

- 定时任务一律重定向输出到日志：\`cmd >> /var/log/myjob.log 2>&1\`，否则出错也没痕迹。
- 备份脚本加锁防重叠：\`flock -n /tmp/myjob.lock -c 'cmd'\`，上一次没跑完时跳过本次，避免任务堆叠。
- 上线前先手动执行一次脚本本身，再用 cron 调度；表达式用 crontab.guru 之类工具校验后再粘贴。`,
    code: `# ============================================================
# 定时任务 cron 演示（macOS bash 沙箱可运行，用 echo 输出示例）
# ============================================================

# ---- 1. cron 表达式速查 ----
echo "===== 1. cron 表达式速查 ====="
echo "字段顺序：分 时 日 月 周"
echo "*/5 * * * *    每 5 分钟"
echo "0 * * * *      每小时整点"
echo "0 2 * * *      每天凌晨 2 点"
echo "0 0 * * 0      每周日凌晨"
echo "0 0 1 * *      每月 1 号 0 点"

# ---- 2. 生成示例 crontab 文件内容（定期备份 + 日志清理） ----
echo ""
echo "===== 2. 示例 crontab（定期备份 + 日志清理）====="
cat << 'CRON'
# 每天凌晨 2 点打包备份 /data 到 /backup
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# 每周日凌晨 3 点清理 7 天前的日志
0 3 * * 0 find /var/log/app -mtime +7 -delete

# 每分钟健康检查（带 flock 防重叠）
* * * * * flock -n /tmp/health.lock -c '/opt/scripts/health.sh'
CRON

# ---- 3. crontab 管理命令 ----
echo ""
echo "===== 3. crontab 管理命令 ====="
echo "crontab -l        # 列出当前用户任务"
echo "crontab -e        # 编辑当前用户任务"
echo "crontab -r        # 删除当前用户全部任务"
echo "crontab file      # 从文件导入任务（覆盖）"

# ---- 4. 易错点提醒 ----
echo ""
echo "===== 4. 易错点提醒 ====="
echo "% 在 crontab 中是换行符，date +%F 要写成 date +\\%F"
echo "cron 的 PATH 极简，脚本里用绝对路径或显式 export PATH"
echo "任务输出务必重定向到日志文件，否则 cron 默认发邮件（多数机器无 mail）"`
  }
];
