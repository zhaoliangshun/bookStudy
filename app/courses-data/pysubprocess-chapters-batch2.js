// =============================================================
// Python subprocess 教程（pysubprocess）—— 第二批章节（进阶篇，共 6 章）
// -------------------------------------------------------------
// 章节列表：
//   7.  sp-popen       — Popen 深度控制
//   8.  sp-pipe        — 多进程管道串联
//   9.  sp-env-cwd     — 环境变量与工作目录
//   10. sp-realtime    — 实时读取输出
//   11. sp-concurrent  — 并发执行多个子进程
//   12. sp-recipes     — 实战配方合集
// =============================================================

export const chapters = [
  // =========================================================
  // 第七章：Popen 深度控制
  // =========================================================
  {
    id: "sp-popen",
    group: "进阶篇",
    icon: "🎛️",
    title: "Popen 深度控制",
    content: `## Popen 深度控制

\`subprocess.Popen\` 是底层 API，\`run()\` 内部就是用它实现的。需要**非阻塞执行**、**实时交互**、**多进程协作**时才用它。

### run() vs Popen

| 维度 | \`run()\` | \`Popen\` |
| --- | --- | --- |
| 阻塞 | 等子进程结束才返回 | 立即返回，不等 |
| 适用 | 一次性执行拿结果 | 长期交互、后台进程 |
| 读输出 | 一次性拿全量 | 可流式逐行读 |
| 复杂度 | 简单 | 略复杂，需自己管理 |

### Popen 的核心方法

\`\`\`python
from subprocess import PIPE
import subprocess
p = subprocess.Popen(["cmd"], stdout=PIPE, text=True)

p.poll()         # 查询是否结束（None=未结束，int=返回码）
p.wait()         # 阻塞等待结束，返回 returncode
p.communicate()  # 一次性发送 input + 读取所有输出
p.terminate()    # 发 SIGTERM，优雅终止
p.kill()         # 发 SIGKILL，强杀
p.stdin / p.stdout / p.stderr  # 文件对象，可读写
\`\`\`

### 三个经典用法

#### 1. 后台执行 + 等待

\`\`\`python
import subprocess
p = subprocess.Popen(["sleep", "2"])
print("started, pid:", p.pid)
# 干别的事...
p.wait()  # 等它结束
\`\`\`

#### 2. 流式读取输出

\`\`\`python
import subprocess
p = subprocess.Popen(["ls", "-la"], stdout=subprocess.PIPE, text=True)
for line in p.stdout:
    print("行:", line.rstrip())
\`\`\`

#### 3. 实时交互（写一行读一行）

\`\`\`python
from subprocess import PIPE
import subprocess
p = subprocess.Popen(["cat"], stdin=PIPE, stdout=PIPE, text=True)
p.stdin.write("hi\\n")
p.stdin.flush()
print(p.stdout.readline())
\`\`\`

### 为什么 run() 够用就别用 Popen

\`Popen\` 需要手动管理 stdin/stdout，容易**死锁**：写满管道缓冲区而没人读，进程就卡住。\`communicate()\` 用线程解决这个问题，但代价是内存占用大。\`run()\` 永远安全。

### 一个 demo：后台 sleep + 轮询

下面 demo 启动一个 sleep 子进程，主进程边干活边轮询它是否结束：`,
    code: `import subprocess
import time

# 启动一个 sleep 2 秒的子进程
p = subprocess.Popen(["sleep", "2"])
print("启动子进程, pid =", p.pid)

# 主进程继续干活，每 0.5 秒查一次子进程状态
for i in range(10):
    rc = p.poll()
    if rc is None:
        print(f"[{i}] 子进程还在跑，主进程继续干活...")
        time.sleep(0.5)
    else:
        print(f"[{i}] 子进程结束，返回码 = {rc}")
        break
else:
    # 循环跑完还没结束，强制 kill
    p.kill()
    print("超时，已 kill")

# 等待回收资源（即使已经结束也要 wait）
p.wait()
print("资源已回收")
`,
  },

  // =========================================================
  // 第八章：多进程管道串联
  // =========================================================
  {
    id: "sp-pipe",
    group: "进阶篇",
    icon: "🔗",
    title: "多进程管道串联",
    content: `## 多进程管道串联

shell 里 \`cmd1 | cmd2 | cmd3\` 把三个命令的 stdin/stdout 串起来。Python 里要用 \`Popen\` 手动连接。

### 原理：把上一个的 stdout 当下一个的 stdin

\`\`\`python
from subprocess import PIPE
from subprocess import Popen
p1 = Popen(["ls"], stdout=PIPE)
p2 = Popen(["wc", "-l"], stdin=p1.stdout, stdout=PIPE)
p1.stdout.close()   # 关掉 p1 的引用，让 p2 能拿到 EOF
out = p2.communicate()[0]
\`\`\`

### 为什么要 close p1.stdout

\`p1.stdout\` 在主进程和 \`p2\` 里都开着引用。只有主进程关掉它，\`p1\` 结束时管道才能传 EOF 给 \`p2\`，否则 \`p2\` 会一直等输入卡死。

### 完整三段管道

模拟 \`ls | grep .py | wc -l\`：

\`\`\`python
from subprocess import PIPE
from subprocess import Popen
p1 = Popen(["ls"], stdout=PIPE, text=True)
p2 = Popen(["grep", ".py"], stdin=p1.stdout, stdout=PIPE, text=True)
p1.stdout.close()
p3 = Popen(["wc", "-l"], stdin=p2.stdout, stdout=PIPE, text=True)
p2.stdout.close()

p1.wait(); p2.wait()
out, _ = p3.communicate()
\`\`\`

### 用 run() 简化版

如果不在乎"同时跑"，用 \`run()\` 串联更简单——前一个的结果当后一个的 \`input\`：

\`\`\`python
import subprocess
r1 = subprocess.run(["ls"], capture_output=True, text=True)
r2 = subprocess.run(["grep", ".py"], input=r1.stdout, capture_output=True, text=True)
r3 = subprocess.run(["wc", "-l"], input=r2.stdout, capture_output=True, text=True)
\`\`\`

**区别**：\`Popen\` 是流式的（前一个还没结束，后一个就开始读），\`run()\` 是分步的（前一个必须结束才能进下一个）。流式版适合大数据量（不用全装内存），分步版简单。

### 一个 demo：三段管道

下面 demo 用 \`Popen\` 串联 \`echo + tr + wc\`，演示真正的流式管道：`,
    code: `import subprocess

# 构造一段输入文本
text = "Hello World\\nPython Is Great\\nSubprocess Rocks\\n"

# 三段管道：cat | tr 转大写 | wc -w 数单词
p1 = subprocess.Popen(["cat"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
p2 = subprocess.Popen(["tr", "a-z", "A-Z"], stdin=p1.stdout, stdout=subprocess.PIPE, text=True)
p3 = subprocess.Popen(["wc", "-w"], stdin=p2.stdout, stdout=subprocess.PIPE, text=True)

# 关掉主进程对中间管道的引用
p1.stdout.close()
p2.stdout.close()

# 通过 p1.communicate 把输入塞给最前面的 cat
p1.communicate(input=text)
p1.wait()
p2.wait()
out, _ = p3.communicate()
print("经过 cat | tr 大写 | wc -w 后的单词数:", out.strip())

# 对比：用 run() 分步写法
r1 = subprocess.run(["cat"], input=text, capture_output=True, text=True)
r2 = subprocess.run(["tr", "a-z", "A-Z"], input=r1.stdout, capture_output=True, text=True)
r3 = subprocess.run(["wc", "-w"], input=r2.stdout, capture_output=True, text=True)
print("run() 分步写法结果:", r3.stdout.strip())
`,
  },

  // =========================================================
  // 第九章：环境变量与工作目录
  // =========================================================
  {
    id: "sp-env-cwd",
    group: "进阶篇",
    icon: "🌍",
    title: "环境变量与工作目录",
    content: `## 环境变量与工作目录

子进程默认**继承**父进程的环境变量和当前工作目录。可以用 \`env\` 和 \`cwd\` 参数覆盖。

### cwd：改工作目录

\`\`\`python
subprocess.run(["ls"], cwd="/tmp")  # 在 /tmp 下执行 ls
\`\`\`

### env：改环境变量

\`env\` 是个 dict，**完全替换**子进程的环境（不是追加）。所以通常基于当前环境复制一份再改：

\`\`\`python
import subprocess
import os
env = os.environ.copy()
env["MY_VAR"] = "hello"
subprocess.run(["python3", "-c", "import os; print(os.environ['MY_VAR'])"], env=env)
\`\`\`

### 单独添加环境变量

\`\`\`python
import subprocess
import os
env = {**os.environ, "DEBUG": "1", "LOG_LEVEL": "debug"}
subprocess.run(["python3", "app.py"], env=env)
\`\`\`

### 清空环境变量

直接传 \`env={}\`，子进程会拿不到任何环境变量（连 PATH 都没有，命令都找不到）：

\`\`\`python
subprocess.run(["ls"], env={})  # 会失败：找不到 ls 命令
\`\`\`

### 实战：调用 git 时改语言

\`git\` 默认按系统语言输出，调试时想让输出统一为英文：

\`\`\`python
import subprocess
import os
env = {**os.environ, "LANG": "C", "LC_ALL": "C"}
subprocess.run(["git", "status"], env=env)
\`\`\`

### 一个 demo：env 与 cwd 演示

下面 demo 展示 cwd 改变 ls 输出、env 改变子进程能读到的环境变量：`,
    code: `import subprocess
import os

# Demo 1：cwd 改变工作目录
# 在 /tmp 下执行 pwd
r = subprocess.run(["pwd"], cwd="/tmp", capture_output=True, text=True)
print("在 /tmp 下执行 pwd:", r.stdout.strip())

# Demo 2：子进程继承父进程的环境变量
r2 = subprocess.run(
    ["python3", "-c", "import os; print('PATH 前 30 字符:', os.environ.get('PATH', '')[:30])"],
    capture_output=True, text=True
)
print(r2.stdout.strip())

# Demo 3：自定义环境变量
env = os.environ.copy()
env["MY_CUSTOM_VAR"] = "hello-from-parent"
r3 = subprocess.run(
    ["python3", "-c", "import os; print('MY_CUSTOM_VAR =', os.environ.get('MY_CUSTOM_VAR', '(未设置)'))"],
    env=env, capture_output=True, text=True
)
print(r3.stdout.strip())

# Demo 4：env={} 清空环境，PATH 没了，连 ls 都找不到
r4 = subprocess.run(["ls"], env={}, capture_output=True, text=True)
print("env={} 时 ls 的 stderr:", r4.stderr.strip()[:80])

# Demo 5：用 dict spread 添加多个变量
env2 = {**os.environ, "DEBUG": "1", "NODE_ENV": "test"}
r5 = subprocess.run(
    ["python3", "-c", "import os; print('DEBUG =', os.environ.get('DEBUG')); print('NODE_ENV =', os.environ.get('NODE_ENV'))"],
    env=env2, capture_output=True, text=True
)
print(r5.stdout.strip())
`,
  },

  // =========================================================
  // 第十章：实时读取输出
  // =========================================================
  {
    id: "sp-realtime",
    group: "进阶篇",
    icon: "📡",
    title: "实时读取输出",
    content: `## 实时读取输出

\`run()\` 要等子进程结束才能拿到全部输出。**长时间运行的命令**（如 \`npm install\`、\`pip install\`、日志监控）需要实时读，让用户看到进度。

### 方法 1：迭代 stdout

\`\`\`python
import subprocess
p = subprocess.Popen(["python3", "-c", "import time; [print(i, flush=True) or time.sleep(0.3) for i in range(5)]"],
                     stdout=subprocess.PIPE, text=True, bufsize=1)
for line in p.stdout:
    print("收到:", line.rstrip())
p.wait()
\`\`\`

### bufsize=1：行缓冲

\`bufsize=1\` 配合 \`text=True\` 表示**行缓冲**——遇到换行就 flush。不加这个，输出可能攒几 KB 才送一次，看起来"卡住"了。

### flush=True：子进程端必须配合

子进程自己也要 \`flush=True\`，否则输出攒在它自己的缓冲区里，父进程读不到。Python 的 \`print(..., flush=True)\` 就是干这个的。

### 方法 2：readline() 循环

\`\`\`python
while True:
    line = p.stdout.readline()
    if not line:
        break
    print(line.rstrip())
\`\`\`

### 方法 3：select / selectors（高级）

\`selectors\` 模块可以同时监听多个 fd，适合同时读 stdout 和 stderr：

\`\`\`python
import selectors
sel = selectors.DefaultSelector()
sel.register(p.stdout, selectors.EVENT_READ)
sel.register(p.stderr, selectors.EVENT_READ)
while True:
    for key, _ in sel.select():
        line = key.fileobj.readline()
        if not line:
            sel.unregister(key.fileobj)
            continue
        ...
\`\`\`

### 一个 demo：实时读取子进程输出

下面 demo 启动一个每 0.3 秒打印一行的子进程，主进程实时读取并加时间戳：`,
    code: `import subprocess
import time

# 子进程：每 0.3 秒打印一行，共 4 行
child_code = '''
import time, sys
for i in range(4):
    print(f"child line {i}", flush=True)
    time.sleep(0.3)
'''

# bufsize=1 + text=True = 行缓冲
p = subprocess.Popen(
    ["python3", "-c", child_code],
    stdout=subprocess.PIPE,
    text=True,
    bufsize=1,
)

start = time.time()
# 迭代 stdout，每行就触发一次循环
for line in p.stdout:
    elapsed = time.time() - start
    print(f"[{elapsed:.2f}s] 收到: {line.rstrip()}")

p.wait()
print("子进程结束，返回码:", p.returncode)
`,
  },

  // =========================================================
  // 第十一章：并发执行多个子进程
  // =========================================================
  {
    id: "sp-concurrent",
    group: "进阶篇",
    icon: "⚡",
    title: "并发执行多个子进程",
    content: `## 并发执行多个子进程

需要同时跑多条命令（如批量下载、并行编译）时，串行 \`run()\` 太慢。有三种并发方式。

### 方法 1：Popen 启动后统一 wait

最简单——同时启动所有进程，再统一 \`wait\`：

\`\`\`python
import subprocess
procs = [subprocess.Popen(["sleep", str(i)]) for i in [3, 1, 2]]
for p in procs:
    p.wait()
\`\`\`

总耗时 ≈ 最慢的那个（3 秒），而不是 3+1+2=6 秒。

### 方法 2：concurrent.futures

更高层、更 Pythonic，能拿到返回值：

\`\`\`python
import subprocess
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor() as ex:
    futures = [ex.submit(subprocess.run, ["sleep", str(i)], capture_output=True, text=True) for i in [3, 1, 2]]
    for f in futures:
        print(f.result().returncode)
\`\`\`

### 方法 3：asyncio.create_subprocess_exec

异步风格，性能最佳但代码稍复杂：

\`\`\`python
import asyncio
async def run_cmd(*args):
    p = await asyncio.create_subprocess_exec(*args, stdout=asyncio.subprocess.PIPE)
    await p.wait()
    return p.returncode
\`\`\`

### 三种方式对比

| 方式 | 优点 | 缺点 |
| --- | --- | --- |
| \`Popen + wait\` | 简单直接 | 拿不到 stdout 要手动 communicate |
| \`ThreadPoolExecutor\` | 拿返回值方便 | 线程开销 |
| \`asyncio\` | 性能最佳 | 需要 async/await 全套 |

### 一个 demo：三种方式对比

下面 demo 用 \`Popen + wait\` 并发跑 3 个 sleep，看总耗时是否接近最长的那个：`,
    code: `import subprocess
import time

# 三个 sleep 任务：分别 1s、2s、3s
durations = [1, 2, 3]

# 串行执行：总耗时 = 1+2+3 = 6 秒
start = time.time()
for d in durations:
    subprocess.run(["sleep", str(d)])
serial_time = time.time() - start
print(f"串行耗时: {serial_time:.2f}s")

# 并发执行：总耗时 ≈ max(1, 2, 3) = 3 秒
start = time.time()
procs = [subprocess.Popen(["sleep", str(d)]) for d in durations]
for p in procs:
    p.wait()
parallel_time = time.time() - start
print(f"并发耗时: {parallel_time:.2f}s")

# 加速比
print(f"加速比: {serial_time / parallel_time:.2f}x")

# 也可以拿每个进程的 pid 和返回码
for i, p in enumerate(procs):
    print(f"  任务 {i}: pid={p.pid}, 返回码={p.returncode}")
`,
  },

  // =========================================================
  // 第十二章：实战配方合集
  // =========================================================
  {
    id: "sp-recipes",
    group: "进阶篇",
    icon: "📖",
    title: "实战配方合集",
    content: `## 实战配方合集

把 subprocess 在真实开发中的常见用法整理成"配方"，复制即用。

### 配方 1：安全地跑外部命令并拿输出

\`\`\`python
def run_cmd(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, check=True, **kw)
\`\`\`

### 配方 2：超时 kill 防卡死

\`\`\`python
subprocess.run(["curl", url], timeout=10)
\`\`\`

### 配方 3：调用 Python 解释器跑代码

\`\`\`python
subprocess.run(["python3", "-c", "print(1+1)"], capture_output=True, text=True)
\`\`\`

### 配方 4：后台日志监控（持续读）

\`\`\`python
from subprocess import PIPE
import subprocess
p = subprocess.Popen(["tail", "-f", "/var/log/app.log"], stdout=PIPE, text=True, bufsize=1)
for line in p.stdout:
    if "ERROR" in line:
        print("发现错误:", line.rstrip())
\`\`\`

### 配方 5：调用其他语言运行时

\`\`\`python
import subprocess
subprocess.run(["node", "-e", "console.log('from node')"], capture_output=True, text=True)
subprocess.run(["ruby", "-e", "puts 'from ruby'"], capture_output=True, text=True)
\`\`\`

### 配方 6：把命令输出写到文件

\`\`\`python
import subprocess
with open("out.txt", "w") as f:
    subprocess.run(["ls", "-la"], stdout=f)
\`\`\`

### 配方 7：用 subprocess.run 替代 os.system

\`\`\`python
import subprocess
import os
# ❌ 旧写法
os.system("ls -la")
# ✅ 新写法
subprocess.run(["ls", "-la"])
\`\`\`

### 配方 8：批量并行编译

\`\`\`python
import subprocess
sources = ["a.c", "b.c", "c.c"]
procs = [subprocess.Popen(["gcc", "-c", s]) for s in sources]
for p in procs: p.wait()
\`\`\`

### 一个 demo：综合实战

下面 demo 综合演示多个配方：跑命令、抓输出、写文件、超时处理：`,
    code: `import subprocess
import os
import tempfile

# 配方 1：安全跑命令并拿输出
def run_cmd(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, check=True, **kw)

# Demo 1：调用 Python 跑一段代码
r = run_cmd(["python3", "-c", "print(2 ** 10)"])
print("2^10 =", r.stdout.strip())

# Demo 2：把输出写到文件
tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
tmp.close()
with open(tmp.name, "w") as f:
    subprocess.run(["echo", "this goes to a file"], stdout=f)
with open(tmp.name) as f:
    print("文件内容:", f.read().strip())
os.unlink(tmp.name)

# Demo 3：超时处理
try:
    subprocess.run(["sleep", "5"], timeout=0.5)
    print("未超时")
except subprocess.TimeoutExpired:
    print("命令超过 0.5s，已被 kill")

# Demo 4：调用系统命令并解析输出
r = run_cmd(["python3", "-c", "import sys; print(sys.version_info[:2])"])
major, minor = eval(r.stdout)
print(f"检测到 Python 版本: {major}.{minor}")

# Demo 5：批量并行——同时跑 3 个 Python 子任务
tasks = [
    ["python3", "-c", "print('task A done')"],
    ["python3", "-c", "print('task B done')"],
    ["python3", "-c", "print('task C done')"],
]
procs = [subprocess.Popen(t, stdout=subprocess.PIPE, text=True) for t in tasks]
for p in procs:
    out, _ = p.communicate()
    print("  ", out.strip())
    p.wait()

print("\\n所有配方演示完成")
`,
  },
];
