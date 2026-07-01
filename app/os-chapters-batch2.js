// =============================================================
// Batch 2：文件与目录（4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. os-file-ops   — 文件与目录操作
//   2. os-file-view  — 查看文件内容
//   3. os-permission — 权限与属主
//   4. os-find       — 查找与定位
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（"文件与目录"）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : 5 段式 Markdown（概述/核心要点/原理与机制/易错点与陷阱/实战建议）
//   code    : 可在 macOS bash 沙箱运行的 Shell 演示（无 root / 10s 超时）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：文件与目录操作
  // =========================================================
  {
    id: "os-file-ops",
    group: "文件与目录",
    icon: "📄",
    title: "文件与目录操作",
    content: `## 概述
文件与目录是 Linux「一切皆文件」哲学的根基——配置是文件、日志是文件、设备是文件、连进程信息都暴露在 /proc 下。掌握 \`cp\` / \`mv\` / \`rm\` / \`mkdir\` / \`touch\` / \`ln\` / \`tree\` 这一组核心命令，是日常运维和开发的第一道门槛。这一章重点讲清各命令的高频选项，以及软链接与硬链接的本质区别，避免在复制目录、批量删除时踩坑。

## 核心要点
- **\`cp\` 复制**：\`cp src dst\` 复制单文件；\`cp -r dir dst\` 递归复制目录；\`-i\` 覆盖前确认；\`-p\` 保留权限与时间戳；\`-a\` 归档模式（保留所有属性，常用于备份）
- **\`mv\` 移动/重命名**：同目录下 \`mv\` 即重命名，跨目录即移动；\`-i\` 覆盖时确认；跨文件系统时本质是「复制 + 删除」
- **\`rm\` 删除**：\`-r\` 递归删目录；\`-f\` 强制不提示；\`-i\` 逐个确认；\`rm -rf dir\` 是经典「核弹」命令，路径必须反复核对
- **\`mkdir\` 建目录**：\`-p\` 递归创建父目录且已存在不报错，写脚本时几乎必加
- **\`touch\`**：可创建空文件；更常见的用途是更新文件的 atime / mtime 时间戳
- **\`ln\` 硬链接**：\`ln src dst\`，多个文件名指向同一 inode，删其一不影响其他
- **\`ln -s\` 软链接**：\`ln -s src dst\`，独立文件，内容是目标路径字符串，可跨文件系统、可链接目录
- **\`tree\` 树形查看**：\`-L 2\` 限定层级；\`-a\` 含隐藏文件；\`-d\` 只看目录（多数系统需单独安装）

## 原理与机制
- **inode 与文件名**：文件名只是目录项里的一个指针，真正存数据的是 inode（含权限、大小、数据块位置）。\`ls -i\` 可查看 inode 编号
- **硬链接共 inode**：硬链接与源文件共享同一 inode，\`ls -li\` 可见二者 inode 相同；不能跨文件系统，也不能链接目录
- **软链接存路径**：软链接是独立文件，存的是目标路径字符串；源文件删除后软链接变成「悬空链接（broken link）」

## 易错点与陷阱
- **\`cp src/ dst\` vs \`cp src dst\`**：源路径带尾部 \`/\` 表示复制目录「内容」，不带 \`/\` 表示复制「目录本身」，行为不同易混淆
- **\`rm -rf\` 误删**：变量为空时 \`rm -rf \$EMPTY/*\` 可能误删当前目录；脚本里务必先判空或加 \`--\` 终止选项解析
- **\`mv\` 跨分区**：跨文件系统移动本质是复制再删除，大文件会慢且占用临时空间

## 实战建议
- 交互式终端可设 \`alias rm='rm -i'\` 加保险，但脚本里不要依赖别名（\`set -e\` + 显式判断更可靠）
- 用软链接管理版本切换（如 \`current -> app-v2.3\`），切版本只改链接不动文件，便于回滚
- 删除大批量文件优先用 \`find ... -delete\`，比 \`-exec rm\` 快且不会撑爆参数列表
`,
    code: `# 在 /tmp 下搭建演示目录
DEMO=/tmp/os-file-ops-demo
rm -rf "$DEMO"
mkdir -p "$DEMO/src" "$DEMO/dist"
cd "$DEMO"

# 创建文件并写入内容
echo "hello shell" > src/a.txt
echo "line2" >> src/a.txt
touch src/b.txt

# 复制：单文件 / 递归 / 保留属性
cp src/a.txt dist/a_copy.txt
cp -r src dist/src_backup
cp -p src/a.txt dist/a_preserved.txt

# 移动 / 重命名
mv src/b.txt src/b_renamed.txt

# 软链接 vs 硬链接
ln src/a.txt hard_link.txt      # 硬链接：同 inode
ln -s src/a.txt soft_link.txt   # 软链接：指向路径
echo "--- inode 对比 ---"
ls -li src/a.txt hard_link.txt soft_link.txt | awk '{print $1, $NF}'

# 删除源文件后：硬链接仍可读，软链接失效
cp src/a.txt /tmp/origin.txt
ln /tmp/origin.txt /tmp/hard.txt
ln -s /tmp/origin.txt /tmp/soft.txt
rm /tmp/origin.txt
echo "--- 删除源后 ---"
cat /tmp/hard.txt 2>/dev/null && echo "[hard] 仍可读"
cat /tmp/soft.txt 2>/dev/null || echo "[soft] 已失效(broken)"

# 目录树（tree 不存在时回退到 find）
echo "--- 目录结构 ---"
if command -v tree >/dev/null 2>&1; then
  tree "$DEMO"
else
  find "$DEMO" | sed "s|$DEMO|.|" | sort
fi

# 清理
rm -rf "$DEMO" /tmp/hard.txt /tmp/soft.txt
`,
  },

  // =========================================================
  // 第二章：查看文件内容
  // =========================================================
  {
    id: "os-file-view",
    group: "文件与目录",
    icon: "👁️",
    title: "查看文件内容",
    content: `## 概述
查看文件内容是出现频率最高的操作之一：看日志、看配置、看头几行确认格式。Linux 提供了一整套从「一次性输出」到「分页浏览」到「尾部追踪」的工具。理解 \`cat\` / \`less\` / \`head\` / \`tail\` / \`stat\` / \`file\` / \`wc\` 各自的适用场景，能让你在面对 GB 级日志时不会用 \`cat\` 把终端刷爆。

## 核心要点
- **\`cat\`**：一次性输出整个文件；\`cat -n\` 带行号；适合小文件，大文件请用 \`less\`
- **\`less\` / \`more\`**：分页浏览器；\`less\` 功能更强（可前后翻页、搜索 \`/keyword\`），\`more\` 只能向后翻
- **\`head -n 20\`**：看前 N 行；\`tail -n 50\`：看后 N 行；二者常用于快速判断文件格式
- **\`tail -f\`**：持续追踪文件尾部新增内容，是看实时日志的利器；\`-F\`（大写）可追踪被轮转重建的文件
- **\`stat\`**：显示文件的完整元信息（inode、大小、atime/mtime/ctime、权限）
- **\`file\`**：通过魔数判断文件真实类型，不依赖扩展名（如 \`file a.png\` 报告 PNG image data）
- **\`wc\`**：\`wc -l\` 行数、\`-w\` 词数、\`-c\` 字节数；统计日志行数常用
- **\`tac\`**：反序输出（最后一行先打）；**\`nl\`**：给文件加行号输出

## 原理与机制
- **流式读取**：\`head\` / \`tail\` / \`cat\` 都是流式处理，边读边输出，因此能处理比内存大的文件而不卡顿
- **\`tail -f\` 实现原理**：打开文件后用 \`inotify\`（Linux）或 \`kqueue\`（macOS）监听文件变化，有新数据立即读取输出，而非轮询
- **\`file\` 魔数**：通过读取文件头部几个字节与系统魔数表（\`/usr/share/misc/magic\`）比对判断类型，比扩展名可靠

## 易错点与陷阱
- **\`cat\` 大文件**：几十 MB 的日志用 \`cat\` 会刷屏且占用终端缓冲，应改用 \`less\` 或 \`tail\`
- **\`tail -f\` 不退出**：交互式按 \`Ctrl+C\` 退出；在脚本里必须用 \`timeout\` 或后台 \`kill\` 限制，否则会一直阻塞
- **\`less\` 退出残留**：\`less\` 是全屏交互程序，在非交互环境（如管道）下行为异常，脚本里避免使用

## 实战建议
- 看大日志的标准组合：\`tail -n 1000 app.log | less\`，先取尾部再分页
- 实时排障用 \`tail -f app.log | grep ERROR\`，边追踪边过滤
- 用 \`head -c 100 file\` 看二进制文件头部字节，避免 \`cat\` 输出乱码刷屏
`,
    code: `# 准备示例文件
DEMO=/tmp/os-view-demo.txt
cat > "$DEMO" <<'EOF'
第一行：Hello
第二行：Shell
第三行：File
第四行：View
第五行：End
EOF

# cat 一次性输出全部
echo "=== cat ==="
cat "$DEMO"

# nl 带行号；tac 反序（macOS 用 tail -r 兜底）
echo "=== nl (带行号) ==="
nl "$DEMO"
echo "=== 反序输出 ==="
tac "$DEMO" 2>/dev/null || tail -r "$DEMO"

# head / tail
echo "=== head -n 2 ==="
head -n 2 "$DEMO"
echo "=== tail -n 2 ==="
tail -n 2 "$DEMO"

# wc 统计行/词/字节
echo "=== wc ==="
wc "$DEMO"

# file 识别类型；stat 元信息
echo "=== file ==="
file "$DEMO"
echo "=== stat ==="
stat "$DEMO" 2>/dev/null | head -n 5

# tail -f 追踪日志（限时 2 秒，避免阻塞超时）
echo "=== tail -f (限时 2 秒) ==="
LOG=/tmp/os-view-log.txt
: > "$LOG"
( tail -f "$LOG" & TPID=$!; sleep 1; echo "新日志写入" >> "$LOG"; sleep 1; kill $TPID 2>/dev/null ) 2>/dev/null
echo "[tail -f 已停止]"

echo "提示：less/more 为交互式分页器，请在真实终端体验"

# 清理
rm -f "$DEMO" "$LOG"
`,
  },

  // =========================================================
  // 第三章：权限与属主
  // =========================================================
  {
    id: "os-permission",
    group: "文件与目录",
    icon: "🔒",
    title: "权限与属主",
    content: `## 概述
Linux 的权限模型用「三组九位」的 \`rwx\` 表达：属主、属组、其他人各占三位，分别控制读、写、执行。再配合 \`chmod\` / \`chown\` / \`chgrp\` / \`umask\` 以及 SUID / SGID / sticky 三种特殊权限，构成了一个简洁但足够强大的访问控制体系。理解这套模型，是排查「为什么服务读不了配置」「为什么脚本不能执行」类问题的前提。

## 核心要点
- **三组权限**：\`rwxrwxrwx\` 依次是属主（u）/属组（g）/其他人（o）；\`r=4\`、\`w=2\`、\`x=1\`，数字法相加
- **\`chmod\` 数字法**：\`chmod 755 file\` = \`rwxr-xr-x\`；\`644\` = \`rw-r--r--\`；常用于脚本和配置
- **\`chmod\` 符号法**：\`chmod u+x,g-w,o=r file\`，更直观，\`+\` / \`-\` / \`=\` 分别为增、减、设为
- **\`chown\` 改属主**：\`chown user:group file\` 同时改属主属组；\`-R\` 递归；改属主通常需要 root
- **\`chgrp\` 改属组**：单独改属组；也可用 \`chown :group file\` 等价实现
- **\`umask\`**：决定新建文件/目录的默认权限；\`umask 022\` 时新文件 \`644\`、新目录 \`755\`
- **SUID**：可执行文件带 \`s\`（如 \`-rwsr-xr-x\`），执行时以「文件属主」身份运行，\`/usr/bin/passwd\` 就是典型
- **SGID**：目录带 SGID 时，新建文件自动继承目录的属组，常用于共享目录
- **sticky 位**：目录带 \`t\`（如 \`/tmp\` 的 \`drwxrwxrwt\`），用户只能删自己拥有的文件

## 原理与机制
- **权限校验顺序**：内核按「属主 → 属组 → 其他」顺序匹配，命中哪组就用哪组权限，不再往后看；因此属主即使「其他」位无权限也不影响
- **目录的 \`x\` 含义**：对目录而言 \`x\` 不是「执行」而是「进入/遍历」权限，没有 \`x\` 即便有 \`r\` 也 \`cd\` 不进去
- **umask 是掩码**：新建文件以 \`666\` 为基数、目录以 \`777\` 为基数，再减去 umask 得到最终权限，所以 umask 022 + 文件 = 644
- **SUID 生效条件**：只对「可执行的二进制文件」有效，对脚本无效；调用者要有 \`x\` 权限才会触发

## 易错点与陷阱
- **\`chmod -R\` 误伤**：递归改权限时会把文件和目录一视同仁，常导致目录缺 \`x\` 进不去；应配合 \`find -type d/f\` 分别设置
- **属主优先于组**：属主即使被单独剥夺权限也会「命中属主位」而被拒，不要以为把属主位设 \`---\` 就能让组权限生效
- **umask 不是「减法字面值」**：\`umask 022\` 并非让权限少 22，而是按位屏蔽；理解基数（666/777）才不会算错

## 实战建议
- 秉持「最小权限」原则：配置文件给 \`644\`、脚本给 \`755\`、私钥给 \`600\`，避免给其他用户写权限
- 批量改权限用 \`find /path -type d -exec chmod 755 {} +\` 和 \`find /path -type f -exec chmod 644 {} +\` 分别处理
- 共享目录设 SGID（\`chmod 2775 shared\`），保证组内成员新建文件自动归属同一组
`,
    code: `# 准备演示文件
DEMO=/tmp/os-perm-demo
rm -rf "$DEMO"
mkdir -p "$DEMO"
cd "$DEMO"
echo "secret" > note.txt

# 查看初始权限
echo "=== 初始权限 ==="
ls -l note.txt | awk '{print $1}'

# 数字法 chmod：644 = rw-r--r--
chmod 644 note.txt
echo "=== chmod 644 ==="
ls -l note.txt | awk '{print $1}'

# 符号法 chmod：属主加执行、组和其他去写
chmod u+x,g-w,o-w note.txt
echo "=== chmod u+x,g-w,o-w ==="
ls -l note.txt | awk '{print $1}'

# 目录权限：没有 x 就进不去
mkdir subdir
chmod 000 subdir
echo "=== chmod 000 subdir 后访问 ==="
(cd subdir 2>/dev/null && echo "进去了") || echo "无权进入(符合预期)"
chmod 755 subdir

# umask：新建文件的默认权限
echo "=== umask ==="
umask
( umask 022; touch new_with_mask.txt )
echo "umask=022 时新文件权限:"
ls -l new_with_mask.txt | awk '{print $1}'

# SUID 示例（用系统 passwd 说明，不实际修改）
echo "=== SUID 示例: /usr/bin/passwd ==="
ls -l /usr/bin/passwd 2>/dev/null | awk '{print $1, $NF}' || echo "无 passwd"

# 清理
rm -rf "$DEMO"
`,
  },

  // =========================================================
  // 第四章：查找与定位
  // =========================================================
  {
    id: "os-find",
    group: "文件与目录",
    icon: "🔍",
    title: "查找与定位",
    content: `## 概述
「文件放哪了」「这个命令在哪个路径」是日常高频问题。Linux 给了两类工具：\`find\` 实时遍历目录树按条件筛选，灵活但慢；\`locate\` 查预建数据库，快但可能有延迟。定位命令本身则用 \`which\` / \`whereis\` / \`type\`。掌握它们的差异和 \`-exec\` 用法，能让你在几十万文件的工程里迅速锁定目标。

## 核心要点
- **\`find 路径 条件 动作\`**：基本三段式；不写路径默认当前目录，不写动作默认 \`-print\`
- **按名字**：\`find . -name '*.txt'\`（区分大小写）；\`-iname\` 不区分大小写；支持通配符
- **按类型**：\`-type f\` 普通文件、\`-type d\` 目录、\`-type l\` 符号链接
- **按大小**：\`-size +10M\` 大于 10MB；\`-size -1k\` 小于 1KB；单位 \`c/k/M/G\`
- **按时间**：\`-mtime -7\` 7 天内修改；\`-mmin -30\` 30 分钟内修改；\`+7\` 表示超过 7 天
- **\`-exec\`**：对每个匹配结果执行命令，\`{} \;\` 逐个执行、\`{} +\` 批量执行（更快）
- **\`locate\`**：查 \`/var/db/locate.database\`，秒级返回；用 \`updatedb\` 更新数据库
- **\`which\`**：在 PATH 中找可执行文件位置，只看可执行、只看 PATH
- **\`whereis\`**：同时找二进制、源码、man 手册位置
- **\`type\`**：shell 内置命令，告诉你命令是「内置 / 别名 / 外部命令」，最权威

## 原理与机制
- **\`find\` 实时遍历**：从给定路径深度优先遍历整棵目录树，逐个 inode 比对条件，因此准确但量大时慢
- **\`locate\` 索引数据库**：\`updatedb\` 定期扫描全盘写入数据库，\`locate\` 只查这个库，所以快但可能查到已删除文件、漏掉新建文件
- **\`-exec ... {} \;\` vs \`{} +\`**：前者每命中一个就 fork 一次命令，后者把多个路径拼成一次调用，大批量时后者快几个数量级

## 易错点与陷阱
- **\`find\` 路径顺序**：\`find\` 第一个参数是路径，写成 \`find -name '*.txt'\` 能工作只是因为默认当前目录，跨脚本最好显式写路径
- **通配符未加引号**：\`find . -name *.txt\` 会被 shell 先展开成当前目录的 .txt 文件，导致参数错误，必须加引号 \`'*.txt'\`
- **\`which\` 找不到内置命令**：\`cd\` / \`echo\` 等 shell 内置不在 PATH 里，\`which cd\` 可能返回空，应用 \`type cd\`

## 实战建议
- 找最近改过的文件用 \`find . -mtime -1 -type f\`，排查「刚改了啥」很实用
- 批量删除匹配文件用 \`find . -name '*.tmp' -delete\`，比 \`-exec rm\` 安全且快
- 不确定命令来源时先用 \`type cmd\` 判断是不是别名/内置，再决定用 \`which\` 还是 \`whereis\`
`,
    code: `# 在 /tmp 下造一批测试文件
ROOT=/tmp/os-find-demo
rm -rf "$ROOT"
mkdir -p "$ROOT/dir1/sub" "$ROOT/dir2"
echo "alpha" > "$ROOT/dir1/a.txt"
echo "beta"  > "$ROOT/dir1/sub/b.log"
echo "gamma" > "$ROOT/dir2/c.txt"
echo "delta" > "$ROOT/dir1/d.md"

# 按名字查找（通配符必须加引号）
echo "=== find -name '*.txt' ==="
find "$ROOT" -name '*.txt'

# 按类型查找
echo "=== find -type d ==="
find "$ROOT" -type d

# 按大小查找（大于 0 字节的文件）
echo "=== find -type f -size +0c ==="
find "$ROOT" -type f -size +0c

# 按修改时间（1 分钟内修改）
echo "=== find -mmin -1 ==="
find "$ROOT" -type f -mmin -1

# -exec 对每个结果执行命令
echo "=== find -exec ls -l ==="
find "$ROOT" -name '*.txt' -exec ls -l {} \\;

# which / whereis / type 定位命令
echo "=== which bash ==="
which bash
echo "=== whereis bash ==="
whereis bash
echo "=== type ls ==="
type ls

# locate 容错（可能未安装或未建库）
echo "=== locate ==="
if command -v locate >/dev/null 2>&1; then
  locate -i os-find-demo 2>/dev/null | head -n 3 || echo "locate 数据库未就绪"
else
  echo "locate 未安装(常见于最小化系统)"
fi

# 清理
rm -rf "$ROOT"
`,
  },
];
