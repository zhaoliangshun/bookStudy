// =============================================================
// 操作系统实战教程 - 第 7 批章节（资源监控 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   os-disk   : 磁盘与文件系统
//   os-memory : 内存与 swap
//   os-cpu    : CPU 与负载
//   os-perf   : 性能排查工具
//
// code 字段为 macOS bash 沙箱可运行脚本（无 root，10s 超时）。
// macOS 缺失的命令（free/lsblk/vmstat 等）用 vm_stat/df 替代，
// 或用 echo 输出 Linux 用法说明。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：磁盘与文件系统
  // ============================================================
  {
    id: "os-disk",
    group: "资源监控",
    icon: "💾",
    title: "磁盘与文件系统",
    content: `# 磁盘与文件系统

## 概述

磁盘是数据的最终归宿，文件系统是组织磁盘数据的规则。Linux 通过 VFS（虚拟文件系统）统一抽象多种文件系统，让 ext4、xfs、btrfs 都能用同一套 API 访问。运维工作中，磁盘空间和 inode 是最常见的两类耗尽问题。

df 报告文件系统整体使用情况，du 统计目录占用大小，两者配合定位空间占用。lsblk 查看块设备拓扑，mount/umount 管理挂载，fdisk 分区。理解 inode 概念至关重要——很多"磁盘有空间却写不进文件"的故障，根源是 inode 耗尽。

## 核心要点

- **df -h**：以人类可读单位显示各文件系统容量、已用、可用、使用率、挂载点。-h 是 KB/MB/GB，-T 同时显示文件系统类型。
- **df -i**：显示 inode 使用情况，而非字节空间。inode 耗尽会导致"空间充足但无法创建文件"。
- **du -sh**：统计目录总大小，-s 汇总不展开，-h 人类可读。\`du -sh /*\` 快速定位根下大目录。
- **du --max-depth=1**：限制统计深度，\`du -h --max-depth=1 /\` 只看一层子目录大小。
- **lsblk**：列出块设备树形结构，显示磁盘、分区、挂载关系，是看磁盘拓扑的首选。
- **mount/umount**：挂载/卸载文件系统。\`mount /dev/sdb1 /data\` 挂载，\`umount /data\` 卸载。
- **fdisk**：分区工具，\`fdisk -l\` 列出所有磁盘分区表，\`fdisk /dev/sdb\` 交互式分区。
- **ext4 vs xfs**：ext4 稳定通用，xfs 大文件性能优，CentOS 7+ 默认 xfs，Debian 默认 ext4。
- **inode**：文件的元数据结构（权限、属主、大小、数据块指针），每个文件占一个 inode，数量在格式化时确定。

## 原理与机制

- **inode 与数据分离**：文件系统把 inode 表和数据块区分开存储，文件名存在目录项中，inode 存元数据和块指针。同一文件可有多个硬链接（多个文件名指向同一 inode）。
- **VFS 抽象层**：Linux 通过 VFS 为各种文件系统提供统一接口（open/read/write/close），应用程序无需关心底层是 ext4 还是 xfs。
- **挂载机制**：mount 把设备挂到目录树的某个挂载点，访问该目录即访问设备内容。/etc/fstab 配置开机自动挂载。
- **写满的两类原因**：字节空间写满（大文件）和 inode 写满（海量小文件）。df -h 看前者，df -i 看后者。

## 易错点与陷阱

- **inode 耗尽误判**：df -h 显示空间充足，但创建文件报"No space left on device"，实为 inode 耗尽，需 df -i 确认。
- **du 与 df 不一致**：已删除文件仍被进程持有句柄时，df 仍计入占用但 du 看不到，需 lsof 找到持有进程。
- **umount 报 busy**：挂载点有进程占用时无法卸载，需 fuser /data 或 lsof /data 找出占用进程后退出。

## 实战建议

- **定期监控 inode**：自动化监控同时关注字节和 inode 使用率，小文件密集型业务（如邮件、日志）尤其注意。
- **大目录定位法**：\`du -h --max-depth=1 / | sort -h | tail\` 一行定位占空间最多的目录。
- **日志轮转**：用 logrotate 防止日志撑爆磁盘，配合压缩和保留策略控制总量。`,
    code: `# 磁盘与文件系统 - 沙箱可运行演示
# macOS 用 df/du，lsblk/fdisk 等用 echo 讲解 Linux 用法

echo "=== 1. df -h 文件系统空间使用 ==="
df -h | head -n 10

echo ""
echo "=== 2. du -sh 统计目录大小 ==="
# 统计 /tmp 下各子目录大小（沙箱可读）
du -sh /tmp/* 2>/dev/null | head -n 5
echo "（以上为 /tmp 下目录大小）"

echo ""
echo "=== 3. df -i inode 使用情况 ==="
# macOS 与 Linux 均支持 -i
df -i 2>/dev/null | head -n 5 || df -h | head -n 5

echo ""
echo "=== 4. inode 概念说明 ==="
echo "# inode = 文件元数据（权限/属主/大小/数据块指针）"
echo "# 每个文件占一个 inode，数量格式化时确定"
echo "# inode 耗尽：空间充足但无法创建文件"
echo "# 排查：df -i 看已用百分比"

echo ""
echo "=== 5. Linux 专用命令（echo 模拟）==="
echo "# lsblk                  # 块设备拓扑树"
echo "# mount /dev/sdb1 /data  # 挂载分区"
echo "# umount /data           # 卸载"
echo "# fdisk -l               # 查看分区表"
echo "# mkfs.ext4 /dev/sdb1    # 格式化为 ext4"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 2 章：内存与 swap
  // ============================================================
  {
    id: "os-memory",
    group: "资源监控",
    icon: "🧠",
    title: "内存与 swap",
    content: `# 内存与 swap

## 概述

内存是 CPU 直接访问的高速存储，比磁盘快数万倍。Linux 内存管理复杂而精巧：物理内存被划分为页，通过虚拟内存机制让每个进程拥有独立地址空间。free 命令是查看内存使用最常用的工具，但要正确解读 free 输出，必须理解 buffer/cache 的作用。

Linux 内存使用哲学是"闲着不如用着"——空闲内存会被用作 buffer/cache 加速 I/O，应用需要时自动回收。因此 free 显示的"available"才是真正可用的内存，而不是"free"那一列。

swap 是磁盘上的虚拟内存，作为物理内存的溢出缓冲。OOM Killer 是内存耗尽时的最后防线，会按策略杀掉占用最多的进程。理解这些机制，才能正确排查内存泄漏和 OOM 问题。

## 核心要点

- **free -h**：人类可读显示内存总量、已用、空闲、buffer/cache、available。-h 自动选 GB/MB 单位。
- **free -m**：以 MB 为单位显示，适合脚本处理。-g 则以 GB 为单位。
- **/proc/meminfo**：内存详细信息的权威来源，free 的数据即来源于此。MemAvailable 是估算的可用内存。
- **vmstat**：虚拟内存统计，\`vmstat 1 5\` 每秒采样一次共 5 次，看 si/so 列判断 swap 换入换出。
- **swap**：磁盘上的虚拟内存，物理内存不足时换出冷数据。Swap 行显示总量和使用情况。
- **OOM Killer**：内存耗尽时内核按 oom_score 杀进程，通常杀占用最多内存的进程，日志在 dmesg。
- **buffer vs cache**：buffer 缓存块设备 I/O（如磁盘块读写），cache 缓存文件内容（page cache）。两者都可回收。
- **available vs free**：free 是完全空闲的内存，available 包含可回收的 buffer/cache，更能反映实际可用量。

## 原理与机制

- **虚拟内存与分页**：每个进程有独立虚拟地址空间，按页（通常 4KB）映射到物理内存或 swap。MMU 通过页表完成转换。
- **page cache 加速**：文件读写经过 page cache，重复读同一文件直接命中缓存。内存压力时内核按 LRU 回收 cache 页。
- **swap 换入换出**：内存不足时把不活跃页写到 swap（swap out），需要时读回（swap in）。频繁换入换出（si/so 高）导致性能骤降。
- **OOM Killer 触发**：内核无法分配内存时触发，按 oom_score_adj 和进程内存占用打分，杀掉分数最高的进程释放内存。

## 易错点与陷阱

- **误读 free 输出**：看到 free 很少就认为内存不足，实际 buffer/cache 可回收，应看 available 列。
- **swap 使用就紧张**：少量 swap 使用正常（冷数据换出），关键看 si/so 速率，持续高速换页才是问题。
- **OOM 杀错进程**：OOM Killer 杀占用最多的进程，可能杀掉关键服务而非罪魁祸首。重要服务设 oom_score_adj 保护。

## 实战建议

- **内存泄漏排查**：用 top/ps 找 RSS 持续增长的进程，配合 pmap 看内存分布，长时间监控确认趋势。
- **关键服务防 OOM**：\`echo -1000 > /proc/PID/oom_score_adj\` 保护关键进程，或调小非关键进程的 oom_score_adj。
- **swap 策略**：服务器建议设 swap 防止突发 OOM，但 swappiness 调低（如 10）减少换出，优先用物理内存。`,
    code: `# 内存与 swap - 沙箱可运行演示
# macOS 无 free/vmstat，用 vm_stat 和 echo 替代讲解 Linux 用法

echo "=== 1. macOS vm_stat 内存统计 ==="
vm_stat | head -n 10

echo ""
echo "=== 2. Linux free -h 输出格式说明（echo 模拟）==="
echo "#              total   used   free   shared  buff/cache  available"
echo "# Mem:          16Gi   4.2Gi  1.1Gi  256Mi   10Gi        11Gi"
echo "# Swap:         2Gi    0B     2Gi"
echo "# 关键看 available（含可回收 buffer/cache），不是 free"

echo ""
echo "=== 3. free 字段含义 ==="
echo "# total        物理内存总量"
echo "# used         已用（不含 buffer/cache）"
echo "# free         完全空闲"
echo "# buff/cache   可回收的缓冲/缓存"
echo "# available    估算的实际可用（used + 可回收）"

echo ""
echo "=== 4. vmstat 关键列说明 ==="
echo "# vmstat 1 5  每秒采样 5 次"
echo "# si = swap in（换入页/秒）  so = swap out（换出页/秒）"
echo "# si/so 持续 > 0 说明频繁换页，内存吃紧"
echo "# bi/bo = 块设备读写  us/sy/id/wa = 用户/系统/空闲/等待"

echo ""
echo "=== 5. OOM Killer 说明 ==="
echo "# 内存耗尽时内核按 oom_score 杀进程"
echo "# 通常杀占用内存最多的进程"
echo "# 日志查：dmesg | grep -i oom"
echo "# 保护关键进程：echo -1000 > /proc/PID/oom_score_adj"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 3 章：CPU 与负载
  // ============================================================
  {
    id: "os-cpu",
    group: "资源监控",
    icon: "⚡",
    title: "CPU 与负载",
    content: `# CPU 与负载

## 概述

CPU 是计算机的运算核心，其使用率直接反映系统繁忙程度。Linux 通过 load average（平均负载）这一指标刻画系统负载：它表示在过去 1/5/15 分钟内，平均有多少进程在等待 CPU 或 I/O。理解 load average 与 CPU 核数的关系，是判断系统是否过载的关键。

uptime 是最简单的负载查看命令，一行输出当前时间、运行时长、在线用户数和三个 load average 值。top 提供实时进程级 CPU 占用，是定位 CPU 消耗进程的首选。/proc/cpuinfo 和 nproc 查询 CPU 核数信息，iostat 则细化到 I/O 等待分析。

判断 CPU 是否瓶颈，不能只看使用率百分比，还要结合负载与核数比例、上下文切换频率、I/O 等待占比综合分析。

## 核心要点

- **uptime**：一行显示系统运行时间和 1/5/15 分钟 load average，是最快的负载速览。
- **load average 三值**：\`0.50 1.20 2.00\` 分别是过去 1/5/15 分钟平均负载。三值递减说明负载在减轻，递增说明在加重。
- **load 与核数关系**：单核 CPU 的 load=1.0 表示满载，4 核满载是 4.0。load 持续超过核数说明 CPU 排队。
- **top**：实时显示进程 CPU 占用，默认按 CPU 排序。\`top -n 1\` 输出一次即退出，适合脚本。
- **top 关键列**：us 用户态、sy 内核态、ni nice、id 空闲、wa I/O 等待、hi 硬中断、si 软中断。
- **/proc/cpuinfo**：CPU 详细信息，processor 字段从 0 编号，可数行数得核数。
- **nproc**：直接输出 CPU 核数，最简洁。\`nproc\` 逻辑核数，\`nproc --all\` 系统总核数。
- **iostat**：CPU 和 I/O 统计，\`iostat -x 1\` 扩展 I/O 统计每秒刷新，看 %util 判断磁盘瓶颈。
- **wa（iowait）**：CPU 等待 I/O 完成的时间占比，wa 高说明磁盘慢拖累 CPU。

## 原理与机制

- **load average 含义**：平均运行队列长度，包括正在运行和等待 CPU 的进程，以及等待不可中断 I/O（D 状态）的进程。
- **CPU 时间片**：Linux 默认 CFS 调度器按时间片轮转，每个进程轮流使用 CPU。us+sy+id+wa+... 总和为 100%。
- **多核负载均衡**：内核调度器自动在多核间均衡负载，单进程只能跑在一个核上（除非多线程）。
- **wa 高的根因**：CPU 不忙但 wa 高，说明大量时间在等磁盘 I/O，瓶颈在磁盘而非 CPU。

## 易错点与陷阱

- **load 不看核数**：load=4 在 16 核机器上很轻松，在 2 核机器上已严重过载，必须结合核数判断。
- **混淆 load 与 CPU 使用率**：load 含 D 状态（等 I/O）进程，wa 高时 CPU 使用率低但 load 可能高，瓶颈在磁盘。
- **top 瞬时值**：top 第一次显示的是自开机平均值，第二次起才是瞬时值。脚本用 top -n 2 -d 1 取第二次。

## 实战建议

- **CPU 瓶颈排查**：先看 load 与核数比例，再看 top 的 us/sy/wa 分布。us 高找进程，wa 高查磁盘，sy 高查系统调用。
- **多核利用率**：用 \`mpstat -P ALL 1\` 看每核负载，单核打满而其他空闲说明程序单线程，需优化并行。
- **长期监控**：用 sar -u 采集历史 CPU 数据，定位周期性负载高峰。`,
    code: `# CPU 与负载 - 沙箱可运行演示

echo "=== 1. uptime 查看负载 ==="
uptime

echo ""
echo "=== 2. CPU 核数 ==="
# macOS 用 sysctl，Linux 用 nproc
sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null
echo "（以上为 CPU 逻辑核数）"

echo ""
echo "=== 3. top 一次输出（macOS 版）==="
# macOS top 用 -l 1 跑一次，Linux 用 -n 1 -b
top -l 1 -n 0 2>/dev/null | head -n 12 || top -n 1 -b 2>/dev/null | head -n 12

echo ""
echo "=== 4. load average 含义讲解 ==="
echo "# uptime 输出: ... load average: 0.50, 1.20, 2.00"
echo "# 1分钟 / 5分钟 / 15分钟 平均负载"
echo "# 单核满载 = 1.0，4核满载 = 4.0"
echo "# load 持续 > 核数 = CPU 排队过载"
echo "# 递减 = 负载减轻；递增 = 负载加重"

echo ""
echo "=== 5. top 关键列说明 ==="
echo "# us 用户态  sy 内核态  id 空闲  wa I/O等待"
echo "# us 高 -> 找进程（top 按 %CPU 排序）"
echo "# wa 高 -> 磁盘瓶颈（iostat -x 1）"
echo "# sy 高 -> 系统调用频繁（strace 排查）"
echo ""
echo "=== 演示结束 ==="`,
  },

  // ============================================================
  // 第 4 章：性能排查工具
  // ============================================================
  {
    id: "os-perf",
    group: "资源监控",
    icon: "📈",
    title: "性能排查工具",
    content: `# 性能排查工具

## 概述

性能排查是运维和开发的高级技能，核心是"用对的工具定位对的瓶颈"。Linux 提供了从系统级到进程级、从概览到细粒度的完整工具链。top/htop 看全局，iostat/iotop 看磁盘，pidstat 看进程级资源，strace/perf 追踪系统调用和性能事件，sar 记录历史数据。

性能问题的本质是资源争用：CPU、内存、磁盘、网络四类资源中某个成为瓶颈，拖累整体。排查的关键思路是"先全局后局部，先概览后细节"——先用 top/uptime 看整体负载，再定位到具体进程，最后用 strace/perf 分析根因。

掌握各工具的适用场景和组合用法，能在故障发生时快速定位，避免"试遍所有命令"的低效循环。

## 核心要点

- **top/htop**：全局实时监控，top 自带无需安装，htop 交互更友好（彩色、可滚动、可杀进程）。
- **iostat**：磁盘 I/O 统计，\`iostat -x 1\` 每秒扩展统计，看 %util（利用率）、await（延迟）、r/s w/s（读写次数）。
- **iotop**：进程级 I/O 监控，类似 top 但按磁盘读写排序，找出哪个进程在疯狂读写磁盘。需 root。
- **sar**：系统活动历史数据，\`sar -u 1 5\` 看 CPU、\`sar -r\` 看内存，需 sysstat 包。能回溯历史。
- **pidstat**：进程级资源统计，\`pidstat -u 1\` 看 CPU、\`-r\` 看内存、\`-d\` 看磁盘，按进程细分。
- **strace**：追踪系统调用，\`strace -p PID -c\` 统计调用次数，\`-T\` 显示耗时，定位程序卡在哪。
- **perf**：Linux 性能分析利器，\`perf top\` 实时看 CPU 热点函数，\`perf record/report\` 采样分析。
- **火焰图**：可视化 CPU 采样，把 perf 数据转成火焰形状的 SVG，直观看出时间花在哪个调用栈。
- **排查思路**：CPU 高→top 找进程→strace/perf 看系统调用；内存高→top 看 RSS→pmap 分析；磁盘慢→iostat 看 await→iotop 找进程；网络慢→iftop/iperf 排查。

## 原理与机制

- **采样 vs 计数**：top/vmstat 基于计数器即时读，perf 基于采样（定时中断采样 PC），strace 基于 ptrace 拦截每次调用。
- **strace 性能开销**：ptrace 拦截每个系统调用，开销巨大（10x+ 减速），仅用于排查不可用于生产常驻。
- **perf 硬件支持**：perf 利用 CPU 性能计数器（PMU）采样，开销小，适合生产环境定位热点函数。
- **sar 数据采集**：后台 sadc 定期采样存到 /var/log/sa/，sar 读取回放，是少数能看历史数据的工具。

## 易错点与陷阱

- **strace 拖垮生产**：strace 开销大，在高负载生产进程上跑可能导致服务超时，应先用 pidstat/perf 初步定位。
- **只看瞬时不看趋势**：单次 top 可能抓不到偶发峰值，用 sar 看历史，或 \`pidstat 1\` 持续采样。
- **工具不会装**：iostat/sar 在 sysstat 包，iotop/htop 单独装，perf 在 linux-tools 包，提前部署避免故障时缺工具。

## 实战建议

- **排查四步法**：先 uptime/load 看整体 → top 定位进程 → 专工具（iostat/pidstat）细化 → strace/perf 找根因。
- **预装工具集**：sysstat（sar/iostat/pidstat）、htop、iotop、perf、tcpdump 应作为基础运维包预装。
- **保留历史数据**：开启 sar 历史采集，故障后能回溯"昨晚 3 点发生了什么"，而非只有当前快照。`,
    code: `# 性能排查工具 - 沙箱可运行演示
# top 可跑，iostat/iotop/perf 等用 echo 讲解场景

echo "=== 1. top 一次输出（全局速览）==="
top -l 1 -n 0 2>/dev/null | head -n 10 || top -n 1 -b 2>/dev/null | head -n 10

echo ""
echo "=== 2. 工具适用场景速查 ==="
echo "# top/htop       全局进程 CPU/内存概览"
echo "# iostat -x 1    磁盘 I/O 利用率和延迟"
echo "# iotop          哪个进程在读写磁盘（需 root）"
echo "# sar -u 1 5     CPU 历史/实时（sysstat 包）"
echo "# pidstat -d 1   进程级磁盘 I/O"
echo "# strace -p PID  系统调用追踪（开销大）"
echo "# perf top       CPU 热点函数（采样）"

echo ""
echo "=== 3. 排查思路（echo 输出）==="
echo "# CPU 高:  top 找进程 -> perf top 看热点函数"
echo "# 内存高: top 看 RSS -> pmap PID 分析映射"
echo "# 磁盘慢: iostat 看 await -> iotop 找进程"
echo "# 网络慢: iftop 看流量 -> iperf 测带宽"

echo ""
echo "=== 4. strace vs perf 对比 ==="
echo "# strace: 追踪每次系统调用（ptrace），开销大，定位卡在哪"
echo "# perf:   采样 CPU 热点（PMU），开销小，定位函数耗时"
echo "# 生产环境优先 perf，strace 仅用于测试排查"
echo ""
echo "=== 演示结束 ==="`,
  },
];
