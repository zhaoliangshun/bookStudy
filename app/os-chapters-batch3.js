// Batch 3：文本处理（4 章）
// 4 章：grep 正则搜索 / sed 流编辑 / awk 文本分析 / 管道、重定向与 xargs
// 所有 code 均在 macOS bash 沙箱实测可运行（无 root，示例文件落在 /tmp 下）

export const chapters = [
  // =========================================================
  // 第一章：grep 正则搜索
  // =========================================================
  {
    id: "os-grep",
    title: "grep 正则搜索",
    icon: "🔎",
    group: "文本处理",
    content: \`## 概述

grep 是 Linux 下最常用的文本搜索工具，名字来自 ed 编辑器的 "g/re/p"（global / regex / print）——全局正则打印。它按行扫描输入，把匹配正则的行打印出来。运维查日志、爬虫筛数据、代码搜索几乎都绕不开它。配合正则、管道和各种参数，能组合出极强的搜索能力。

## 核心要点

- 基本用法：\`grep 'pattern' file\`，按行匹配并打印命中的行。
- \`-i\` 忽略大小写，\`-v\` 反向（输出不匹配的行），\`-n\` 显示行号。
- \`-c\` 只输出匹配行数，\`-l\` 只输出含匹配行的文件名。
- \`-r\` 递归搜索目录，\`--include=*.log\` 限定文件类型。
- \`-E\` 启用扩展正则（等同 egrep），支持 \`+\` \`?\` \`|\` \`()\`，无需反斜杠。
- 基本正则里这些元字符要反斜杠转义，扩展正则不用，优先用 \`-E\`。
- \`-o\` 只输出匹配到的片段（不是整行），做提取很实用。
- \`-A N\` \`-B N\` \`-C N\` 分别输出匹配行后/前/前后 N 行上下文。
- \`--color=auto\` 高亮匹配片段，排错时一眼定位。
- 管道过滤：\`cmd | grep pattern\`，是组合命令的核心套路。

## 原理与机制

- grep 逐行读取输入（文件或 stdin），对每一行用正则做匹配，命中则输出该行。
- 基本正则（BRE）与扩展正则（ERE）的差别只在元字符是否需要转义：ERE 把 \`+\` \`?\` \`|\` \`()\` 当元字符，BRE 需反斜杠才认。
- 多文件搜索时默认在每行前加"文件名:"前缀，单文件或 stdin 不加，调试时注意区分。
- grep 采用 Boyer-Moore 等高效匹配算法，单次扫描完成，对大文件也很友好。

## 易错点与陷阱

- 默认是基本正则，\`grep 'a+'\` 匹配的是字面 \`a+\`，要匹配一个或多个 a 需用 \`grep -E 'a+'\`。
- 正则里 \`.\` 是任意字符，要匹配字面点号需对点号转义。
- \`-r\` 递归时如果同时传了文件和目录，行为可能不符预期，建议只传目录。

## 实战建议

- 查日志找错误：\`grep -niE 'error|exception|fatal' app.log\`，一次抓多种关键字。
- 配合管道逐层过滤：\`grep ERROR app.log | grep -v DEBUG | grep -c\`，层层缩小范围。
- 递归搜索先用 \`--include\` 限定类型，避免扫到二进制文件报 "Binary file matches"。
\`,
    code: \`# 生成示例日志文件
cat > /tmp/demo.log <<'EOF'
2024-01-01 10:00:00 INFO  server started
2024-01-01 10:01:12 ERROR connection refused
2024-01-01 10:01:30 WARN  retrying
2024-01-01 10:02:00 ERROR timeout
2024-01-01 10:03:00 INFO  health check ok
2024-01-01 10:04:00 DEBUG packet dump
EOF

echo "=== 1. 基本搜索：找含 ERROR 的行 ==="
grep 'ERROR' /tmp/demo.log

echo "=== 2. -i 忽略大小写 -n 带行号 ==="
grep -in 'error' /tmp/demo.log

echo "=== 3. -E 扩展正则：ERROR 或 WARN ==="
grep -E 'ERROR|WARN' /tmp/demo.log

echo "=== 4. -c 只输出匹配行数 ==="
grep -cE 'ERROR|WARN' /tmp/demo.log

echo "=== 5. -v 反向：排除 DEBUG 行 ==="
grep -v 'DEBUG' /tmp/demo.log

echo "=== 6. -o 只输出匹配片段 ==="
grep -oE '[0-9]{2}:[0-9]{2}:[0-9]{2}' /tmp/demo.log

rm -f /tmp/demo.log
\`,
  },

  // =========================================================
  // 第二章：sed 流编辑
  // =========================================================
  {
    id: "os-sed",
    title: "sed 流编辑",
    icon: "✂️",
    group: "文本处理",
    content: \`## 概述

sed（stream editor）是流编辑器，按行读取输入，对每一行执行编辑命令后输出。与交互式编辑器不同，sed 不打开文件让你逐行改，而是把"做什么"写成命令让 sed 自动批量处理。它最擅长批量替换、删除、插入，是改配置文件、清洗数据的利器。一个 sed 命令往往顶得上一段脚本。

## 核心要点

- 替换：\`sed 's/old/new/' file\`，默认只替换每行第一个匹配。
- 全局替换：\`s/old/new/g\` 替换每行所有匹配。
- 地址定位：\`sed '2d'\` 删第 2 行，\`sed '2,5d'\` 删 2-5 行，\`sed '/pattern/d'\` 删匹配行。
- \`-i\` 原地修改文件；macOS 上 \`-i ''\` 不留备份，\`-i.bak\` 留备份。
- \`-e\` 多命令：\`sed -e 's/a/1/g' -e 's/b/2/g' file\`，按顺序依次执行。
- 删除 \`d\`、追加 \`a\`、插入 \`i\`、整行替换 \`c\`，构成完整编辑能力。
- 分隔符可换：\`s|/usr/bin|/opt/bin|\`，避免路径里的 \`/\` 反复转义。
- \`&\` 代表匹配到的整段，括号分组可用反斜杠加数字反向引用。
- \`-n\` 安静模式，配合 \`p\` 只输出指定行，相当于过滤。
- 标志位可组合：\`g\` 全局、\`i\` 忽略大小写、\`p\` 替换后打印，如 \`s/old/new/gi\`。

## 原理与机制

- sed 把输入按行读入"模式空间"，执行完所有命令后默认输出，再读下一行，循环往复。
- \`-i\` 本质是先把结果写到临时文件，全部处理完再用临时文件替换原文件，是"原子"替换。
- 多个 \`-e\` 命令按顺序对同一行依次执行，前一个的输出是后一个的输入。
- 替换命令的 \`g\` 标志可带数字：\`s/old/new/2\` 只替换每行第 2 个匹配。

## 易错点与陷阱

- macOS 的 sed 是 BSD 版，\`-i\` 必须带参数（\`-i ''\` 或 \`-i.bak\`），GNU sed 可裸用 \`-i\`，跨平台脚本要小心。
- 默认不全局替换，只换第一个，新手最常踩坑：忘了加 \`g\` 改不全。
- 特殊字符 \`&\` \`/\` 在替换串里有特殊含义，需用反斜杠转义。

## 实战建议

- 批量改配置：\`sed -i.bak 's/port=8080/port=9090/g' app.conf\`，留备份防翻车。
- 删空行和注释行：\`sed -e '/^$/d' -e '/^#/d' file\`，一眼看清有效配置。
- 路径替换换分隔符：\`sed 's|/var/log|/opt/log|g'\`，比转义斜杠清爽得多。
\`,
    code: \`# 生成示例文本
cat > /tmp/conf.txt <<'EOF'
port=8080
host=127.0.0.1
log_dir=/var/log/app
# debug mode
debug=true
EOF

echo "=== 1. 替换第一个匹配 ==="
sed 's/=/ : /' /tmp/conf.txt

echo "=== 2. 全局替换 + 换分隔符 ==="
sed 's|/var/log|/opt/log|g' /tmp/conf.txt

echo "=== 3. 删除注释行和空行 ==="
sed -e '/^#/d' -e '/^$/d' /tmp/conf.txt

echo "=== 4. 地址定位：只看第 2 到 3 行 ==="
sed -n '2,3p' /tmp/conf.txt

echo "=== 5. -i 原地修改（带备份）==="
sed -i.bak 's/port=8080/port=9090/g' /tmp/conf.txt
cat /tmp/conf.txt

echo "=== 6. & 引用匹配串（-E 扩展正则）==="
echo "price: 100" | sed -E 's/[0-9]{3}/& dollars/'

rm -f /tmp/conf.txt /tmp/conf.txt.bak
\`,
  },

  // =========================================================
  // 第三章：awk 文本分析
  // =========================================================
  {
    id: "os-awk",
    title: "awk 文本分析",
    icon: "📊",
    group: "文本处理",
    content: \`## 概述

awk 是一个完整的文本处理语言（不只是命令），名字来自三位作者 Aho、Weinberger、Kernighan 的姓氏首字母。它把输入按行拆成字段，对每一行执行"模式-动作"规则。grep 负责找、sed 负责改、awk 负责算——统计、汇总、按列处理是 awk 的主场。一个 awk 脚本就能完成"按某列分组求和""统计访问量 Top10"这类任务。

## 核心要点

- 字段：\`$0\` 整行，\`$1\` 第一列，\`$NF\` 最后一列，\`$(NF-1)\` 倒数第二列。
- 内置变量：\`NR\` 当前行号，\`NF\` 当前列数，\`FS\` 字段分隔符，\`OFS\` 输出分隔符。
- 指定分隔符：\`-F:\` 用冒号分隔，或 \`awk 'BEGIN{FS=":"}{...}'\`。
- \`BEGIN{}\` 在处理输入前执行一次，常用于初始化、打印表头。
- \`END{}\` 在处理完所有行后执行一次，常用于汇总、打印统计结果。
- 模式匹配：\`awk '/error/'\` 打印含 error 的行，\`awk '$3>100'\` 打印第 3 列大于 100 的行。
- 条件动作：\`awk '{if($3>100) print $1}'\`，支持 if/for/while 完整控制流。
- 关联数组：\`count[$1]++\` 按第一列分组计数，是 awk 最强大的特性。
- 格式化输出：\`printf "%-10s %d\\n", $1, $2\`，用法与 C 语言一致。
- 多动作用分号或换行分隔：\`awk '{sum+=$1; cnt++} END{print sum/cnt}'\`。

## 原理与机制

- 工作流固定三段：\`BEGIN\` → 逐行执行主规则 → \`END\`，主规则可省略 BEGIN/END。
- 每行被 \`FS\` 切成字段存入 \`$1 $2 ...\`，主规则对每行执行一次；省略 pattern 表示对所有行执行动作。
- 关联数组本质是哈希表，key 可为字符串或数字，\`count[key]++\` 自动创建并自增。
- pattern 和 action 都可省略一个：省略 pattern 对所有行执行；省略 action（只有 pattern）等同于 \`print $0\`。

## 易错点与陷阱

- \`$1\` 是字段引用，\`1\` 是数字；新手写 \`awk '{print 1}'\` 期望打印第一列，实际打印字面数字 1。
- 默认 FS 是连续空白（空格/Tab 合并），但 \`-F" "\` 单空格则按单个空格切分且保留空字段，行为不同。
- awk 字段下标从 1 开始（不是 0），\`$0\` 是整行，没有"第 0 列"。

## 实战建议

- 统计访问量 Top IP：\`awk '{ip[$1]++} END{for(k in ip) print ip[k], k}' access.log | sort -rn | head\`。
- 按列求和：\`awk -F, '{sum+=$3} END{print "total:", sum}' data.csv\`，处理 CSV 很顺手。
- 调试分两步：先 \`head\` 看几行确认字段位置，再写 awk，避免列号数错。
\`,
    code: \`# 生成示例访问日志
cat > /tmp/access.log <<'EOF'
192.168.1.10 GET /home
192.168.1.20 POST /login
192.168.1.10 GET /list
192.168.1.30 GET /home
192.168.1.20 GET /home
192.168.1.10 GET /detail
EOF

echo "=== 1. 打印第 1 列（IP）和第 2 列（方法）==="
awk '{print $1, $2}' /tmp/access.log

echo "=== 2. NR 行号 + NF 列数 ==="
awk '{print "line="NR" cols="NF" : "$0}' /tmp/access.log

echo "=== 3. 条件过滤：只看 GET 请求 ==="
awk '$2=="GET" {print $1, $3}' /tmp/access.log

echo "=== 4. BEGIN/END 汇总总请求数 ==="
awk 'BEGIN{print "请求统计"} {n++} END{print "共 "n" 条"}' /tmp/access.log

echo "=== 5. 关联数组：按 IP 分组计数 ==="
awk '{ip[$1]++} END{for(k in ip) print ip[k], k}' /tmp/access.log | sort -rn

echo "=== 6. -F 指定分隔符：拆分路径 ==="
echo "/usr/local/bin/node" | awk -F/ '{print "最后一段: "$NF}'

rm -f /tmp/access.log
\`,
  },

  // =========================================================
  // 第四章：管道、重定向与 xargs
  // =========================================================
  {
    id: "os-pipe",
    title: "管道、重定向与 xargs",
    icon: "🔗",
    group: "文本处理",
    content: \`## 概述

管道和重定向是 Shell 的"胶水"，把一个个独立的小命令拼成强大的处理流水线。管道 \`|\` 把前一个命令的输出当作后一个的输入；重定向 \`>\` \`>>\` \`<\` 控制输入输出文件；\`2>&1\` 合并标准错误；\`/dev/null\` 是黑洞；\`tee\` 三通分流；\`xargs\` 把 stdin 转成命令参数；\`$()\` 命令替换把命令结果嵌进另一条命令。掌握这些，才能写出"一行顶十行"的 Shell。

## 核心要点

- 管道 \`|\`：\`cmd1 | cmd2\`，cmd1 的 stdout 喂给 cmd2 的 stdin，可串联多级。
- 输出重定向：\`>\` 覆盖写入，\`>>\` 追加写入；\`> file 2>&1\` 把 stdout 和 stderr 都写进文件。
- 输入重定向：\`< file\` 把文件作为 stdin；\`<<EOF\` heredoc 多行输入。
- \`2>&1\`：把 stderr（fd 2）重定向到 stdout（fd 1）当前指向的位置，顺序很重要。
- \`/dev/null\`：写进去的内容丢弃，\`> /dev/null 2>&1\` 丢弃所有输出。
- \`tee file\`：把 stdin 同时写到文件和 stdout，相当于"三通"，常用于既记日志又看屏幕。
- \`xargs\`：把 stdin 按空白拆成参数传给后续命令，\`find ... | xargs rm\` 是经典组合。
- \`xargs -I{}\` 自定义占位符，\`find . | xargs -I{} cp {} /backup/\`，逐个处理。
- 命令替换 \`$(cmd)\`：把命令输出嵌入字符串；反引号写法是老语法，可嵌套时优先用 \`$()\`。
- \`2>file\` 只重定向错误，\`>out 2>err\` 分别把 stdout 和 stderr 写到不同文件。

## 原理与机制

- 每个文件描述符（fd）指向一个打开文件；\`>\` \`2>\` 本质是用 dup2 把对应 fd 改指向新文件。
- \`2>&1\` 必须在 \`>file\` 之后：先让 fd1 指向文件，再让 fd2 合并到 fd1 当前指向的位置。
- 管道由 pipe 系统调用创建一对 fd，父子进程各继承一端，从而连通 stdin/stdout。
- \`xargs\` 默认把 stdin 拆成尽量多的参数一次传入（受 ARG_MAX 限制），\`-n1\` 强制每次一个。

## 易错点与陷阱

- \`cmd 2>&1 >file\` 顺序错：先合并 stderr 到屏幕，再让 stdout 进文件，stderr 仍留在屏幕。
- 文件名带空格时 \`find | xargs rm\` 会出错，要用 \`find -print0 | xargs -0 rm\`，靠 null 分隔才安全。
- 反引号写法不能直接嵌套，需转义；\`$()\` 可任意嵌套，新脚本统一用 \`$()\`。

## 实战建议

- 备份同时看进度：\`cmd | tee run.log\`，既留档又实时输出，排错两不误。
- 批量处理文件：\`find . -name '*.log' -print0 | xargs -0 -I{} gzip {}\`，带空格也不怕。
- 静默运行后台任务：\`nohup cmd > /dev/null 2>&1 &\`，丢弃输出并脱离终端。
\`,
    code: \`# 生成示例文件
mkdir -p /tmp/osdemo
echo "apple banana" > /tmp/osdemo/a.txt
echo "cherry date"  > /tmp/osdemo/b.txt

echo "=== 1. 管道组合：拆词、排序、去重计数 ==="
cat /tmp/osdemo/a.txt /tmp/osdemo/b.txt | tr ' ' '\\n' | sort | uniq -c | sort -rn

echo "=== 2. 输出重定向 > 覆盖 / >> 追加 ==="
echo "第一行" >  /tmp/osdemo/out.txt
echo "第二行" >> /tmp/osdemo/out.txt
cat /tmp/osdemo/out.txt

echo "=== 3. 2>&1 合并 stdout 和 stderr 到同一文件 ==="
ls /tmp/not-exist /tmp/osdemo/a.txt > /tmp/osdemo/both.txt 2>&1
cat /tmp/osdemo/both.txt

echo "=== 4. /dev/null 丢弃输出 ==="
echo "这行不会显示" > /dev/null && echo "已丢弃到黑洞"

echo "=== 5. tee 三通：既存文件又输出 ==="
echo "hello tee" | tee /tmp/osdemo/tee.txt
cat /tmp/osdemo/tee.txt

echo "=== 6. xargs 把 stdin 转成参数 ==="
echo "/tmp/osdemo/a.txt /tmp/osdemo/b.txt" | xargs wc -w

echo '=== 7. 命令替换 $(cmd) ==='
echo "示例目录 txt 文件数: $(ls /tmp/osdemo/*.txt 2>/dev/null | wc -l)"

rm -rf /tmp/osdemo
\`,
  },
];
