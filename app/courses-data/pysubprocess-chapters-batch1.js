// =============================================================
// Python subprocess 教程（pysubprocess）—— 第一批章节（基础篇，共 6 章）
// -------------------------------------------------------------
// 本教程聚焦 Python 标准库 subprocess 模块，言简意赅、Demo 丰富。
// 所有代码仅使用标准库，通过 /api/run-py 在系统 python3 子进程中执行。
//
// 章节列表：
//   1. sp-intro      — subprocess 是什么
//   2. sp-run         — run() 基本用法
//   3. sp-capture     — 捕获输出（stdout/stderr）
//   4. sp-input       — 输入与交互
//   5. sp-exception   — 异常与返回码
//   6. sp-shell       — shell=True 的利与弊
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：subprocess 是什么
  // =========================================================
  {
    id: "sp-intro",
    group: "基础篇",
    icon: "🚪",
    title: "subprocess 是什么",
    content: `## subprocess 是什么

**\`subprocess\`** 是 Python 标准库里用来**启动外部进程**的模块。它可以让你在 Python 代码里调用系统命令、运行其他程序、读取它们的输出，甚至给它们发送输入。

### 一句话理解

> 你的 Python 程序是一个进程，\`subprocess\` 让你能**生出另一个进程**，跟它对话，等它干完活。

### 为什么需要它

| 场景 | 例子 |
| --- | --- |
| 调用系统命令 | \`git status\`、\`ls -la\`、\`df -h\` |
| 运行其他语言写的程序 | 调用 \`node\`、\`java\`、\`go\` 编译产物 |
| 执行耗时任务后台跑 | 跑脚本、转码视频、下载数据 |
| 替代 shell 脚本 | 用 Python 写运维脚本，比 bash 更易维护 |

### 核心能力速览

\`\`\`python
import subprocess

# 1. 跑一条命令，拿返回码
subprocess.run(["echo", "hello"])

# 2. 拿到输出文本
res = subprocess.run(["date"], capture_output=True, text=True)
print(res.stdout)

# 3. 把输出当输入管道传给下一条命令
p1 = subprocess.run(["ls"], capture_output=True, text=True)
p2 = subprocess.run(["wc", "-l"], input=p1.stdout, text=True)
\`\`\`

### 模块历史

- Python 2.4 之前：用 \`os.system()\`、\`os.popen()\`，功能弱、不安全
- Python 2.4：引入 \`subprocess\`，统一了所有旧的 API
- Python 3.5：新增 \`subprocess.run()\`，成为**推荐的唯一入口**
- Python 3.7+：\`capture_output=True\`、\`text=True\` 让 API 更简洁

**结论**：现代 Python 只需要学 \`subprocess.run()\` 和 \`subprocess.Popen\` 两个东西，前者覆盖 90% 场景。

### 一个最小例子

下面这段代码调用 \`echo\` 命令并打印它的返回码。注意 \`run()\` 返回的是 \`CompletedProcess\` 对象，不是字符串——想拿文本要加参数，下一章会讲。`,
    code: `import subprocess

# 调用系统 echo 命令，打印 "hello subprocess"
# run() 返回一个 CompletedProcess 对象
result = subprocess.run(["echo", "hello subprocess"])

# 返回码（returncode）：0 表示成功，非 0 表示失败
print("返回码:", result.returncode)

# args 字段记录了实际执行的命令
print("执行的命令:", result.args)
`,
  },

  // =========================================================
  // 第二章：run() 基本用法
  // =========================================================
  {
    id: "sp-run",
    group: "基础篇",
    icon: "🏃",
    title: "run() 基本用法",
    content: `## run() 基本用法

\`subprocess.run()\` 是 Python 3.5+ 的**推荐 API**，它启动子进程、等待结束、返回 \`CompletedProcess\` 对象。**90% 的场景用它就够了**。

### 函数签名（精简版）

\`\`\`python
subprocess.run(
    args,              # 命令列表 ["ls", "-la"] 或字符串 "ls -la"
    *,
    capture_output=False,  # 是否捕获 stdout/stderr
    text=False,            # 输出是否解码为 str（否则是 bytes）
    timeout=None,          # 超时秒数，超时抛 TimeoutExpired
    check=False,           # 返回码非 0 时是否抛 CalledProcessError
    input=None,            # 给子进程的 stdin 输入
    cwd=None,              # 子进程工作目录
    env=None,              # 子进程环境变量
    shell=False,           # 是否通过 shell 执行
)
\`\`\`

### args：列表 vs 字符串

**推荐用列表**——更安全、参数清晰，不会被 shell 解析：

\`\`\`python
import subprocess
# ✅ 推荐：列表形式
subprocess.run(["ls", "-la", "/tmp"])

# ⚠️ 字符串形式需要 shell=True，有安全风险
subprocess.run("ls -la /tmp", shell=True)
\`\`\`

### 参数最常用组合

| 组合 | 用途 |
| --- | --- |
| \`run(["cmd"])\` | 只执行，不在乎输出 |
| \`run(["cmd"], capture_output=True, text=True)\` | 拿到输出文本 |
| \`run(["cmd"], check=True)\` | 失败抛异常 |
| \`run(["cmd"], timeout=5)\` | 限时执行 |

### 三个常用参数演示

下面 demo 同时展示了 \`capture_output\`、\`text\`、\`check\` 三个参数的效果。去掉任何一个对比看输出差异，能加深理解。`,
    code: `import subprocess

# Demo 1：默认不捕获输出，输出直接打到当前终端
# 你会看到 "apple banana cherry" 直接打印出来
subprocess.run(["echo", "apple banana cherry"])

# Demo 2：capture_output=True 把输出"截"下来，不打到终端
# text=True 把 bytes 解码成 str
r = subprocess.run(["echo", "captured text"], capture_output=True, text=True)
print("截获的输出:", r.stdout.strip())

# Demo 3：check=True 让命令失败时抛异常
# 故意执行一个必定失败的命令（ls 不存在的目录）
try:
    subprocess.run(["ls", "/this/path/does/not/exist"], check=True, capture_output=True, text=True)
except subprocess.CalledProcessError as e:
    print("命令失败，返回码:", e.returncode)
    print("错误输出:", e.stderr.strip())
`,
  },

  // =========================================================
  // 第三章：捕获输出
  // =========================================================
  {
    id: "sp-capture",
    group: "基础篇",
    icon: "📥",
    title: "捕获输出（stdout/stderr）",
    content: `## 捕获输出

子进程有两个输出流：**stdout（标准输出）** 和 **stderr（标准错误）**。捕获它们是 \`subprocess\` 最常见的用途。

### capture_output=True

Python 3.7+ 新增的便捷参数，等价于 \`stdout=PIPE, stderr=PIPE\`：

\`\`\`python
import subprocess
r = subprocess.run(["python3", "-c", "print('hi')"], capture_output=True, text=True)
r.stdout   # 'hi\\n'  普通输出
r.stderr   # ''        错误输出
\`\`\`

### text=True（旧名 universal_newlines）

不加 \`text=True\`，\`r.stdout\` 是 \`bytes\`，要手动 \`.decode()\`。加上后直接是 \`str\`，**现代代码都加这个参数**。

### 精确控制各流

可以单独把某个流丢到 \`DEVNULL\`（黑洞），或重定向到文件：

\`\`\`python
import subprocess

# 只要 stdout，丢掉 stderr
subprocess.run(["ls", "/tmp"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

# 把 stdout 写到文件
with open("out.txt", "w") as f:
    subprocess.run(["ls"], stdout=f)
\`\`\`

### PIPE / DEVNULL / STDOUT 常量

| 常量 | 含义 |
| --- | --- |
| \`subprocess.PIPE\` | 创建管道，把输出"截"到 \`result.stdout\` |
| \`subprocess.DEVNULL\` | 丢弃输出（相当于重定向到 \`/dev/null\`） |
| \`subprocess.STDOUT\` | 把 stderr 合并到 stdout（混在一起） |

### 一个直观对比

下面 demo 同时捕获 stdout 和 stderr，能清楚看到两条流被分开存放：`,
    code: `import subprocess

# 子进程同时往 stdout 和 stderr 写内容
code = "import sys; print('this is stdout'); print('this is stderr', file=sys.stderr)"

r = subprocess.run(["python3", "-c", code], capture_output=True, text=True)

print("=== stdout ===")
print(r.stdout.strip())
print("=== stderr ===")
print(r.stderr.strip())
print("=== returncode ===")
print(r.returncode)

# 也可以把 stderr 合并进 stdout
r2 = subprocess.run(["python3", "-c", code], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
print("=== 合并后（stderr 并入 stdout）===")
print(r2.stdout.strip())
`,
  },

  // =========================================================
  // 第四章：输入与交互
  // =========================================================
  {
    id: "sp-input",
    group: "基础篇",
    icon: "⌨️",
    title: "输入与交互",
    content: `## 输入与交互

子进程的 **stdin** 可以通过 \`input\` 参数喂数据，常用于：把上一条命令的输出当作下一条的输入（模拟 shell 管道 \`|\`）。

### input 参数

\`input\` 是字符串（或 bytes），会写到子进程的 stdin：

\`\`\`python
import subprocess
r = subprocess.run(["cat"], input="hello\\nworld\\n", text=True, capture_output=True)
print(r.stdout)  # cat 原样吐回 hello\\nworld\\n
\`\`\`

### 模拟 shell 管道

shell 里 \`ls | wc -l\` 把 \`ls\` 的输出送给 \`wc -l\` 计数。Python 里分两步做：

\`\`\`python
import subprocess
p1 = subprocess.run(["ls"], capture_output=True, text=True)
p2 = subprocess.run(["wc", "-l"], input=p1.stdout, text=True, capture_output=True)
print(p2.stdout)
\`\`\`

### 真正的流式管道：Popen

\`run()\` 要等命令结束才返回，无法做实时交互。需要 \`Popen\`——它返回进程对象，可以边写边读：

\`\`\`python
import subprocess
p = subprocess.Popen(["cat"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
out, _ = p.communicate(input="feed me\\n")
print(out)
\`\`\`

\`communicate()\` 一次性发送 input 并读取所有输出，是 \`Popen\` 的标准用法，**能避免死锁**（自己读写管道容易卡住）。

### 一个 demo 同时演示 input 与管道

下面 demo 用 \`sort\` 命令对输入排序，再用 \`wc -l\` 数行数，把两步连起来：`,
    code: `import subprocess

# Demo 1：用 input 给 cat 喂数据
r = subprocess.run(["cat"], input="line1\\nline2\\nline3\\n", text=True, capture_output=True)
print("cat 吐回:")
print(r.stdout)

# Demo 2：把乱序的行送给 sort 排序
lines = "banana\\napple\\ncherry\\n"
r2 = subprocess.run(["sort"], input=lines, text=True, capture_output=True)
print("sort 排序后:")
print(r2.stdout)

# Demo 3：管道串联——sort 输出送给 wc -l 数行数
r3 = subprocess.run(["wc", "-l"], input=r2.stdout, text=True, capture_output=True)
print("行数:", r3.stdout.strip())

# Demo 4：Popen + communicate 做同样的事
p = subprocess.Popen(["sort"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
out, _ = p.communicate(input="zebra\\napple\\nmango\\n")
print("Popen 排序:")
print(out, end="")
`,
  },

  // =========================================================
  // 第五章：异常与返回码
  // =========================================================
  {
    id: "sp-exception",
    group: "基础篇",
    icon: "⚠️",
    title: "异常与返回码",
    content: `## 异常与返回码

子进程结束会返回一个**返回码（returncode）**：\`0\` 表示成功，非 \`0\` 表示失败。处理失败有两个层次。

### returncode 字段

\`CompletedProcess.returncode\` 直接告诉你退出状态：

\`\`\`python
import subprocess
r = subprocess.run(["ls", "/tmp"])
if r.returncode == 0:
    print("成功")
else:
    print("失败，码:", r.returncode)
\`\`\`

### check=True：失败抛异常

加 \`check=True\`，返回码非 0 时自动抛 \`CalledProcessError\`，省去手动判断：

\`\`\`python
import subprocess
try:
    subprocess.run(["ls", "/no/such/dir"], check=True)
except subprocess.CalledProcessError as e:
    print("命令失败:", e.cmd, "码:", e.returncode)
\`\`\`

### 两种异常类型

| 异常 | 何时抛 | 怎么处理 |
| --- | --- | --- |
| \`CalledProcessError\` | \`check=True\` 且返回码非 0 | 重试 / 记录日志 / 降级 |
| \`TimeoutExpired\` | 超过 \`timeout\` 参数 | kill 子进程，避免挂死 |

### timeout：防止卡死

\`run(timeout=N)\` 会在 N 秒后杀掉子进程并抛异常：

\`\`\`python
import subprocess
try:
    subprocess.run(["sleep", "10"], timeout=2)
except subprocess.TimeoutExpired:
    print("超时，已 kill")
\`\`\`

### CalledProcessError 的字段

\`\`\`python
except subprocess.CalledProcessError as e:
    e.cmd          # 执行的命令
    e.returncode   # 退出码
    e.stdout       # 标准输出（capture_output=True 时有值）
    e.stderr       # 错误输出
\`\`\`

### 一个 demo：三种失败情况

下面 demo 演示成功、命令失败、超时三种情况的处理：`,
    code: `import subprocess

# 情况 1：成功，返回码 0
r = subprocess.run(["echo", "ok"], capture_output=True, text=True)
print("情况1 返回码:", r.returncode, "输出:", r.stdout.strip())

# 情况 2：命令失败，check=True 抛异常
try:
    subprocess.run(["ls", "/this/does/not/exist"], check=True, capture_output=True, text=True)
except subprocess.CalledProcessError as e:
    print("情况2 失败:", e.cmd)
    print("  返回码:", e.returncode)
    print("  stderr:", e.stderr.strip())

# 情况 3：超时
import time
try:
    subprocess.run(["sleep", "5"], timeout=1)
except subprocess.TimeoutExpired as e:
    print("情况3 超时:", e.cmd, "超时秒数:", e.timeout)

# 情况 4：找到命令但命令内部失败
r = subprocess.run(["python3", "-c", "import sys; sys.exit(3)"], capture_output=True)
print("情况4 返回码:", r.returncode, "（程序主动退出 3）")
`,
  },

  // =========================================================
  // 第六章：shell=True 的利与弊
  // =========================================================
  {
    id: "sp-shell",
    group: "基础篇",
    icon: "🐚",
    title: "shell=True 的利与弊",
    content: `## shell=True 的利与弊

\`shell=True\` 让命令字符串交给 \`/bin/sh -c\` 解释执行，能用通配符、管道、变量替换等 shell 特性，但**有严重的安全风险**。

### shell=True 能做什么

\`\`\`python
import subprocess
# 通配符：列出所有 .py 文件
subprocess.run("ls *.py", shell=True)

# 管道：一条命令搞定
subprocess.run("ls | wc -l", shell=True)

# 变量替换
subprocess.run("echo $HOME", shell=True)
\`\`\`

### shell=False（默认）做不到这些

\`\`\`python
import subprocess
# ❌ 这些会失败——shell 不参与解析
subprocess.run(["ls", "*.py"])      # 把 "*.py" 当字面文件名
subprocess.run(["ls", "|", "wc"])   # 把 "|" 当文件名
\`\`\`

### 命令注入风险

如果命令里混入用户输入，\`shell=True\` 就是**命令注入漏洞**：

\`\`\`python
import subprocess
user_input = "file.txt; rm -rf /"   # 恶意输入
# 💀 灾难！shell 会执行 rm -rf /
subprocess.run(f"cat {user_input}", shell=True)
\`\`\`

### 安全替代方案

| shell 写法 | Python 等价写法 |
| --- | --- |
| \`ls *.py\` | \`glob.glob("*.py")\` 或 \`pathlib\` |
| \`ls \| wc -l\` \| \`Popen\` 手动建管道 |
| \`echo $HOME\` | \`os.environ["HOME"]\` |
| \`cat \$(find . -name x)\` | \`subprocess.run(["find", ...])\` |

### 何时该用 shell=True

- **运维脚本**里跑固定命令（没有用户输入）
- 需要 shell 特性且无法用 Python 等价替代
- **临时调试**

### 安全规则

> **永远不要把用户输入拼进 shell 命令字符串。**

下面 demo 展示 shell=True 的便利和风险：`,
    code: `import subprocess

# Demo 1：shell=True 可以用通配符和管道
r = subprocess.run("echo hello | tr a-z A-Z", shell=True, capture_output=True, text=True)
print("管道转换大写:", r.stdout.strip())

# Demo 2：可以用 shell 变量
r2 = subprocess.run("echo $HOME", shell=True, capture_output=True, text=True)
print("HOME 变量:", r2.stdout.strip())

# Demo 3：模拟命令注入风险（演示，不实际执行危险命令）
malicious_input = "safe.txt; echo 'PWNED: 注入成功!'"
# shell=True 会执行两条命令：cat safe.txt 和 echo 'PWNED...'
r3 = subprocess.run(f"echo {malicious_input}", shell=True, capture_output=True, text=True)
print("注入演示输出:")
print(r3.stdout)

# Demo 4：安全写法——用列表，shell=False
# 即使输入里有 ";", 也只被当作参数，不会被执行
r4 = subprocess.run(["echo", "safe.txt; echo 'PWNED'"], capture_output=True, text=True)
print("安全写法（列表）输出:", r4.stdout.strip())
`,
  },
];
