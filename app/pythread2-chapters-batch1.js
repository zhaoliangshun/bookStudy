// =============================================================
// Python 多线程入门（pythread2）—— 第一批章节
// -------------------------------------------------------------
// 本教程专注讲解 Python 多线程的工作原理与日常开发应用。
// 共 24 章，分 5 批：
//   batch1（1-5章）：基础概念 + threading 入门
//   batch2（6-10章）：线程同步与通信
//   batch3（11-15章）：高级线程模式
//   batch4（16-20章）：concurrent.futures 与线程池
//   batch5（21-24章）：实战项目与性能优化
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Python 示例代码
//
// 代码运行环境约束：
//   - 用 python3 直接运行，10 秒超时
//   - 仅使用 Python 标准库（threading, multiprocessing, time, os 等）
//   - 通过 print 输出结果
//   - 代码必须是单文件可独立运行的脚本
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：什么是多线程？为什么要学？
  // =========================================================
  {
    id: "py2-01",
    group: "基础概念",
    icon: "🚀",
    title: "什么是多线程？为什么要学？",
    content: `## 一、从一个生活例子说起

想象你一个人在家，需要同时完成三件事：**做饭**（30 分钟）、**洗衣服**（30 分钟）、**看一集电视剧**（30 分钟）。

**方式一：一件一件来。** 先花 30 分钟做饭，做完后再花 30 分钟洗衣服，最后再看 30 分钟电视剧。总共需要 **90 分钟**。这就是"串行"——一件事做完再做下一件。

**方式二：同时进行。** 把衣服扔进洗衣机（洗衣机自动洗），把饭放进电饭煲（电饭煲自动煮），然后你坐在沙发上看电视剧。30 分钟后，三件事**同时完成**。总共只需 **30 分钟**。这就是"并发"——多件事在同一时间段内交替或同时推进。

程序的世界也是一样。当你的程序需要同时做多件事时（比如下载多个网页、处理多个文件、响应多个用户请求），"多线程"就是让你像方式二一样高效工作的技术。

## 二、串行 vs 并发 vs 并行

这三个概念容易混淆，用一张表格说清楚：

| 概念 | 含义 | 生活比喻 | 程序中的例子 |
|------|------|----------|-------------|
| **串行** | 一件事做完再做下一件 | 一个人排队办事 | 先下载网页 A，再下载 B，再下载 C |
| **并发** | 多件事在同一时间段内交替推进 | 一个人边做饭边看手机 | 一个 CPU 核心在多个线程间快速切换 |
| **并行** | 多件事在同一时刻真正同时进行 | 两个人同时各做一件事 | 多核 CPU 上多个核心各跑一个线程 |

**关键区别**：并发是"交替执行"（看起来同时，实际在切换），并行是"真正同时"（多个核心各干各的）。就像一个人一边切菜一边听音乐是并发（大脑在切换注意力），两个人一个切菜一个听音乐是并行。

## 三、为什么要学多线程

学会多线程，你的程序能获得三个核心优势：

### 1. 提高速度（IO 密集型任务）

当程序需要等待网络响应、磁盘读写时，CPU 是空闲的。多线程让 CPU 在等待时去做别的事，总耗时大幅缩短。

\`\`\`text
串行下载3个网页：  |--下载A(1s)--|--下载B(1s)--|--下载C(1s)--|  总耗时 3s
多线程下载3个网页： |--下载A--|
                   |--下载B--|  同时进行  总耗时 ~1s
                   |--下载C--|
\`\`\`

### 2. 提高资源利用率

单线程程序在等待 IO 时 CPU 空闲（利用率可能只有 10%）。多线程让 CPU 在等待时继续工作，利用率可以提升到 80% 以上。

### 3. 改善用户体验

GUI 程序中，如果主线程在处理耗时任务，界面会"卡死"——按钮点不动、窗口拖不了。把耗时任务放到后台线程，主线程专注响应界面操作，用户体验就好很多。

## 四、Python 中多线程的典型应用场景

| 场景 | 为什么适合多线程 | 例子 |
|------|------------------|------|
| **网络请求** | 等待响应时 CPU 空闲，可同时发多个请求 | 爬虫批量抓取网页、调用多个 API |
| **文件 IO** | 磁盘读写慢，多线程可重叠等待时间 | 批量读写文件、日志处理 |
| **数据库操作** | 查询等待时 CPU 空闲 | 批量查询、数据迁移 |
| **GUI 响应** | 后台线程处理耗时任务，主线程保持响应 | 桌面软件、数据处理工具 |
| **后台任务** | 定时任务、心跳检测、监控 | 服务端健康检查、消息推送 |

## 五、常见误解澄清

| 误解 | 真相 |
|------|------|
| "多线程一定更快" | 只有 IO 密集型任务才明显提速，CPU 密集型反而可能更慢 |
| "线程越多越好" | 线程太多会增加切换开销，反而降低性能 |
| "多线程 = 同时执行" | Python 受 GIL 限制，同一时刻只有一个线程执行字节码（第四章详解） |
| "多线程很难学" | 核心概念不多，掌握 \`threading\` 几个 API 就能上手 |

## 六、一句话总结

**多线程让程序"同时"做多件事**——在等待 IO 时切换到其他任务，充分利用 CPU，缩短总耗时，改善响应速度。它不是万能药，但在 IO 密集型场景下效果立竿见影。

## 七、本章 demo 说明

下面的代码用 \`time.sleep()\` 模拟下载 3 个网页（每个"下载"耗时 1 秒）：

1. **串行方式**：一个接一个地下载，总耗时约 **3 秒**
2. **并发方式**：用 \`threading.Thread\` 创建 3 个线程同时下载，总耗时约 **1 秒**

运行后你会看到：
- 串行下载：3 个网页依次完成，总耗时约 3.0 秒
- 并发下载：3 个网页几乎同时完成，总耗时约 1.0 秒
- 并发比串行快了约 3 倍！

> **注意**：如果每个网页下载需要 3 秒，串行需要 9 秒，并发只需约 3 秒。差距更大，优势更明显。这里为了演示快速，用了 1 秒。`,
    code: `# -*- coding: utf-8 -*-
# 第一章演示代码：什么是多线程？为什么要学？
# 用 time.sleep() 模拟下载3个网页，对比串行和并发的耗时差异
import time          # time 模块：提供时间相关函数，如 sleep() 和 time()
import threading     # threading 模块：Python 标准库的多线程模块

print("=" * 60)
print("多线程入门演示：串行 vs 并发下载")
print("=" * 60)

# 定义一个"下载网页"的函数
# time.sleep(n) 模拟网络请求的等待时间（n 秒）
def download(url):
    """模拟下载一个网页：打印开始信息，休眠1秒模拟网络等待，打印完成信息。"""
    print(f"  [开始下载] {url}")      # 打印开始下载的网页地址
    time.sleep(1)                     # 休眠1秒，模拟网络请求耗时
    print(f"  [完成下载] {url}")      # 打印下载完成信息

# 要下载的网页列表
urls = ["网页A", "网页B", "网页C"]

# ===== 1. 串行下载：一个接一个，总耗时 = 3 × 1秒 = 3秒 =====
print("\\n[1] 串行下载（一个接一个）：")
serial_start = time.time()             # 记录开始时间

for url in urls:                       # 遍历每个网页
    download(url)                      # 逐个下载（必须等前一个完成才能下载下一个）

serial_time = time.time() - serial_start  # 计算总耗时
print(f"  → 串行下载总耗时: {serial_time:.2f} 秒")

# ===== 2. 并发下载：3个线程同时下载，总耗时 ≈ 1秒 =====
print("\\n[2] 并发下载（3个线程同时进行）：")
concurrent_start = time.time()          # 记录开始时间

threads = []                            # 创建一个空列表，用于存放所有线程对象
for url in urls:                        # 遍历每个网页
    # threading.Thread() 创建一个线程对象：
    #   target=download  → 线程要执行的函数
    #   args=(url,)      → 传给函数的参数（注意必须是元组，所以加逗号）
    t = threading.Thread(target=download, args=(url,))
    threads.append(t)                   # 把线程对象加入列表（方便后面等待它们完成）
    t.start()                           # 启动线程！线程开始独立执行 download 函数

# 等待所有线程完成
# t.join() 的作用：阻塞当前线程（主线程），直到 t 线程执行完毕
# 循环对每个线程调用 join()，确保3个下载都完成后再继续
for t in threads:
    t.join()

concurrent_time = time.time() - concurrent_start  # 计算总耗时
print(f"  → 并发下载总耗时: {concurrent_time:.2f} 秒")

# ===== 3. 对比结果 =====
print("\\n" + "=" * 60)
print("对比结果：")
print(f"  串行下载:   {serial_time:.2f} 秒")
print(f"  并发下载:   {concurrent_time:.2f} 秒")
print(f"  提速倍数:   {serial_time / concurrent_time:.1f}x")
print("=" * 60)
print("结论：多线程让3个下载同时进行，总耗时从3秒缩短到约1秒！")
print("如果每个下载需要3秒，串行需9秒，并发只需约3秒——优势更大。")
`,
  },

  // =========================================================
  // 第二章：进程 vs 线程：本质区别
  // =========================================================
  {
    id: "py2-02",
    group: "基础概念",
    icon: "🔀",
    title: "进程 vs 线程：本质区别",
    content: `## 一、工厂比喻

理解进程和线程，可以用"工厂"来打比方：

\`\`\`text
┌─────────────────────────────────────────┐
│  工厂（操作系统）                         │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 车间1（进程A） │  │ 车间2（进程B） │    │
│  │  ┌────────┐  │  │  ┌────────┐  │    │
│  │  │工人1   │  │  │  │工人1   │  │    │
│  │  │工人2   │  │  │  │工人2   │  │    │
│  │  │工人3   │  │  │  └────────┘  │    │
│  │  └────────┘  │  │              │    │
│  │  仓库（内存）  │  │  仓库（内存）  │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
\`\`\`

- **工厂** = 操作系统
- **车间** = 进程：每个车间有独立的仓库（内存空间），车间之间互不干扰
- **工人** = 线程：同一车间内的工人共享这个车间的仓库，可以协作

一个车间（进程）可以有多个工人（线程），工人之间共享车间的资源。但不同车间的工人不能直接访问对方的仓库。

## 二、进程是什么

**进程**是程序运行时的实例。当你双击打开一个程序（比如浏览器），操作系统就创建了一个进程。

进程的核心特点：

| 特点 | 说明 |
|------|------|
| **独立内存空间** | 每个进程有自己的内存空间，互不干扰 |
| **资源隔离** | 进程间不能直接访问对方的变量、文件描述符等 |
| **创建开销大** | 操作系统要分配内存、加载代码、初始化环境，比较"重" |
| **通信复杂** | 进程间通信需要用管道、队列、共享内存等特殊机制 |
| **安全性高** | 一个进程崩溃不会直接影响其他进程 |

Python 中用 \`multiprocessing\` 模块创建进程：

\`\`\`python
import multiprocessing
p = multiprocessing.Process(target=func, args=(...))
p.start()
\`\`\`

## 三、线程是什么

**线程**是进程内的执行单元。一个进程可以包含多个线程，它们共享进程的内存空间。

线程的核心特点：

| 特点 | 说明 |
|------|------|
| **共享进程内存** | 同一进程内的所有线程共享变量、文件等资源 |
| **轻量级** | 创建线程比创建进程快得多，开销小 |
| **通信简单** | 线程间可以直接读写共享变量（但要注意同步） |
| **创建快** | 线程本质是"执行上下文"，不需要分配新内存空间 |
| **安全性低** | 一个线程崩溃可能导致整个进程崩溃 |

Python 中用 \`threading\` 模块创建线程：

\`\`\`python
import threading
t = threading.Thread(target=func, args=(...))
t.start()
\`\`\`

## 四、进程 vs 线程 对比表

| 对比项 | 进程 | 线程 |
|--------|------|------|
| **内存空间** | 独立（隔离） | 共享（同一进程内） |
| **创建开销** | 大（几十毫秒） | 小（几毫秒） |
| **启动速度** | 慢 | 快 |
| **通信方式** | 管道、队列、共享内存（复杂） | 直接读写共享变量（简单） |
| **安全性** | 高（隔离） | 需要加锁保护共享数据 |
| **崩溃影响** | 只影响自己 | 导致整个进程崩溃 |
| **CPU 利用** | 可利用多核（真并行） | 受 GIL 限制（详见第四章） |
| **适用场景** | CPU 密集型、需要隔离 | IO 密集型、需要共享数据 |

## 五、一个进程可以包含多个线程

\`\`\`text
进程（内存空间）
├── 全局变量（所有线程可见）
├── 线程1（有自己的栈和寄存器）
├── 线程2（有自己的栈和寄存器）
└── 线程3（有自己的栈和寄存器）
\`\`\`

每个线程有自己的**栈空间**（局部变量）和**寄存器**，但共享进程的**堆空间**（动态分配的内存）和**全局变量**。这就是为什么线程间通信方便（共享变量）但需要同步（防止同时修改导致冲突）。

## 六、Python 中的 threading 模块

Python 标准库 \`threading\` 提供了高级线程接口，核心 API：

| API | 作用 |
|-----|------|
| \`threading.Thread(target, args)\` | 创建线程 |
| \`t.start()\` | 启动线程 |
| \`t.join()\` | 等待线程结束 |
| \`t.name\` | 线程名称 |
| \`t.ident\` | 线程ID |
| \`threading.active_count()\` | 当前活跃线程数 |
| \`threading.enumerate()\` | 列出所有活跃线程 |
| \`threading.current_thread()\` | 获取当前线程对象 |

## 七、本章 demo 说明

下面的代码用 \`threading\` 和 \`multiprocessing\` 各创建 3 个任务，对比它们的**启动速度**：

1. **线程测试**：创建 3 个线程，每个执行简单任务，测量总耗时
2. **进程测试**：创建 3 个进程，每个执行相同任务，测量总耗时
3. **对比**：进程启动明显比线程慢（通常慢 5-20 倍）

运行后你会看到：
- 3 个线程总耗时约 0.1 秒（任务本身耗时 + 极少的启动开销）
- 3 个进程总耗时约 0.5-2 秒（进程启动需要复制内存空间，开销大得多）
- 进程启动比线程慢数倍到数十倍`,
    code: `# -*- coding: utf-8 -*-
# 第二章演示代码：进程 vs 线程 —— 启动速度对比
# 用 threading 和 multiprocessing 各创建3个任务，对比启动速度和内存差异
#
# 重要：使用 multiprocessing 时必须加 if __name__ == "__main__": 保护！
# 原因：macOS/Windows 默认用 'spawn' 方式启动子进程，子进程会重新导入本模块。
# 如果没有这个保护，子进程会再次执行创建进程的代码，导致无限递归。

import threading       # threading：Python 标准库多线程模块
import multiprocessing # multiprocessing：Python 标准库多进程模块
import time            # time：用于计时
import os              # os：用于获取进程ID等信息

# worker 函数必须在模块顶层定义（不能放在 if __name__ 内部）
# 因为 'spawn' 方式启动的子进程需要能导入这个函数
def worker(name):
    """简单任务：休眠0.1秒，模拟一个轻量级操作。"""
    time.sleep(0.1)


# ===== 主程序入口 =====
# if __name__ == "__main__": 确保 only 主进程执行以下代码
# 子进程重新导入本模块时，__name__ 不是 "__main__"，所以不会执行
if __name__ == "__main__":
    print("=" * 60)
    print("进程 vs 线程：启动速度对比")
    print("=" * 60)

    # ===== 1. 线程测试：创建3个线程 =====
    print("\\n[1] 线程测试：创建3个线程，每个执行 worker()：")
    thread_start = time.time()            # 记录线程测试开始时间

    threads = []                          # 线程对象列表
    for i in range(3):                    # 创建3个线程
        # threading.Thread() 创建线程对象
        #   target=worker  → 线程要执行的函数
        #   args=(f"线程-{i}",) → 传给函数的参数（元组）
        t = threading.Thread(target=worker, args=(f"线程-{i}",))
        threads.append(t)                 # 加入列表
        t.start()                         # 启动线程

    # 等待所有线程完成
    for t in threads:
        t.join()                          # join()：阻塞主线程直到该线程完成

    thread_time = time.time() - thread_start  # 计算线程测试总耗时
    print(f"  3个线程总耗时: {thread_time:.4f} 秒")

    # ===== 2. 进程测试：创建3个进程 =====
    print("\\n[2] 进程测试：创建3个进程，每个执行 worker()：")
    process_start = time.time()           # 记录进程测试开始时间

    processes = []                        # 进程对象列表
    for i in range(3):                    # 创建3个进程
        # multiprocessing.Process() 创建进程对象
        #   target=worker  → 进程要执行的函数
        #   args=(f"进程-{i}",) → 传给函数的参数
        p = multiprocessing.Process(target=worker, args=(f"进程-{i}",))
        processes.append(p)               # 加入列表
        p.start()                         # 启动进程

    # 等待所有进程完成
    for p in processes:
        p.join()                          # join()：阻塞主进程直到该进程完成

    process_time = time.time() - process_start  # 计算进程测试总耗时
    print(f"  3个进程总耗时: {process_time:.4f} 秒")

    # ===== 3. 对比结果 =====
    print("\\n" + "=" * 60)
    print("对比结果：")
    print(f"  3个线程总耗时: {thread_time:.4f} 秒")
    print(f"  3个进程总耗时: {process_time:.4f} 秒")
    if process_time > 0 and thread_time > 0:
        ratio = process_time / thread_time
        print(f"  进程比线程慢:   {ratio:.1f} 倍")
    print("=" * 60)
    print("结论：")
    print("  - 线程启动快（共享内存，开销小）")
    print("  - 进程启动慢（需要复制内存空间、初始化环境）")
    print("  - IO 密集型任务优先用线程，CPU 密集型任务考虑用进程")
    print("  - 进程间内存隔离更安全，线程间通信更方便")
`,
  },

  // =========================================================
  // 第三章：Python 线程是怎么工作的
  // =========================================================
  {
    id: "py2-03",
    group: "基础概念",
    icon: "⚙️",
    title: "Python 线程是怎么工作的",
    content: `## 一、Python 是解释执行的语言

你写的 \`.py\` 文件并不会直接被 CPU 执行。Python 的执行流程是这样的：

\`\`\`text
源代码 (.py)          字节码 (.pyc)           Python 虚拟机          CPU
  │                     │                      │                    │
  │  编译器              │  解释器               │  执行               │
  │  (compile)          │  (interpret)         │                    │
  ▼                     ▼                      ▼                    ▼
def hello():        LOAD_CONST              取出字节码            执行指令
  print("hi")       CALL_FUNCTION           逐条解释              完成运算
                    RETURN_VALUE
\`\`\`

1. **编译**：Python 先把源代码编译成**字节码**（bytecode），就是 \`.pyc\` 文件里的内容
2. **解释**：Python 虚拟机（也叫解释器主循环）逐条读取字节码并执行
3. **执行**：最终在 CPU 上运行

最常用的 Python 实现是 **CPython**（用 C 语言写的解释器），我们平时说的 Python 基本就是 CPython。

## 二、字节码、虚拟机、解释器主循环

### 字节码

字节码是 Python 的"中间语言"，介于源代码和机器码之间。用 \`dis\` 模块可以看到：

\`\`\`python
import dis
def hello():
    print("hi")
dis.dis(hello)
# 输出：
#   LOAD_GLOBAL    0 (print)
#   LOAD_CONST     1 ('hi')
#   CALL_FUNCTION  1
#   POP_TOP
#   RETURN_VALUE
\`\`\`

这些 \`LOAD_GLOBAL\`、\`CALL_FUNCTION\` 就是字节码指令。

### 虚拟机

Python 虚拟机是一个大循环，不断读取字节码并执行：

\`\`\`text
while 有下一条字节码:
    取出下一条字节码
    执行这条字节码
\`\`\`

这个循环就是**解释器主循环**。CPython 的核心就是这个循环。

## 三、线程在 Python 中如何被调度

Python 的线程是基于**操作系统原生线程**实现的。也就是说，Python 的每个线程都对应一个操作系统的真实线程。

但 Python 在此之上加了一层管理——**GIL**（Global Interpreter Lock，全局解释器锁）。GIL 的存在意味着：

\`\`\`text
┌──────────────────────────────────────────────┐
│  Python 进程                                  │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ 线程1   │ │ 线程2   │ │ 线程3   │        │
│  └────┬────┘ └────┬────┘ └────┬────┘        │
│       │           │           │              │
│       ▼           ▼           ▼              │
│  ┌─────────────────────────────────┐         │
│  │          GIL（全局锁）           │         │
│  │  同一时刻只有一个线程能拿到 GIL   │         │
│  └────────────┬────────────────────┘         │
│               │                              │
│               ▼                              │
│  ┌─────────────────────────────────┐         │
│  │     解释器主循环（执行字节码）     │         │
│  └─────────────────────────────────┘         │
└──────────────────────────────────────────────┘
\`\`\`

- 每个线程想执行 Python 字节码，必须先拿到 GIL
- 同一时刻只有一个线程能持有 GIL
- 所以 Python 线程在执行 Python 代码时是**交替执行**的，不是真正并行

## 四、时间片轮转

CPython 默认的线程调度方式是**时间片轮转**：

\`\`\`text
时间 →
线程1: ████░░░░░░░░████░░░░░░░░████░░░
线程2: ░░░░████░░░░░░░░████░░░░░░░░████░
线程3: ░░░░░░░░████░░░░░░░░████░░░░░░░░
       ├── 时间片1 ──┤── 时间片2 ──┤── 时间片3 ──┤

█ = 执行中  ░ = 等待中
\`\`\`

Python 3 默认每个线程执行 **5 毫秒**（可通过 \`sys.setswitchinterval()\` 调整）后就会被强制切换，让其他线程执行。操作系统也会在 IO 操作时强制切换。

切换过程：
1. 操作系统或 Python 解释器发出"切换"信号
2. 当前线程**保存上下文**（寄存器值、栈指针、程序计数器等）
3. 释放 GIL
4. 下一个线程**获取 GIL**
5. 恢复上下文，继续执行

## 五、线程切换的开销

线程切换不是免费的，每次切换都要：

| 操作 | 说明 |
|------|------|
| 保存当前线程上下文 | 寄存器、栈指针、程序计数器等 |
| 恢复目标线程上下文 | 重新加载寄存器等 |
| GIL 的获取/释放 | 涉及锁操作 |
| CPU 缓存失效 | 切换后缓存命中率下降 |

所以线程不是越多越好。线程太多时，切换开销会吃掉性能收益。一般线程数控制在 **CPU 核心数的 2-4 倍**比较合理。

## 六、为什么 IO 操作时线程会释放 CPU

当线程执行 IO 操作（网络请求、文件读写、\`time.sleep()\`）时，它不需要执行 Python 字节码，而是在**等待**。这时：

1. 线程主动释放 GIL
2. 操作系统把该线程标记为"阻塞等待"
3. 另一个线程获取 GIL，开始执行
4. IO 完成后，原线程被唤醒，重新竞争 GIL

这就是为什么多线程对 **IO 密集型任务**有效——IO 等待时 GIL 被释放，其他线程可以工作。

\`\`\`text
线程1: 发送网络请求 ──→ 等待响应(GIL释放) ──→ 收到响应(重新获取GIL)
线程2:              ──→ 执行代码(GIL) ──→ ...
线程3:                                ──→ 执行代码(GIL) ──→ ...
\`\`\`

## 七、本章 demo 说明

下面的代码用 \`threading.active_count()\` 和 \`threading.enumerate()\` 观察线程状态变化：

1. 打印初始活跃线程数（只有主线程 = 1）
2. 创建 2 个子线程但不启动，观察线程数不变
3. 启动子线程，观察线程数变为 3（主线程 + 2 个子线程）
4. 等待子线程完成，观察线程数恢复为 1

运行后你会看到：
- 初始活跃线程数: 1（只有主线程）
- 创建但未启动时: 仍然是 1（线程对象存在但未运行）
- 启动后: 3（主线程 + 2 个子线程）
- 线程列表中包含 MainThread 和两个子线程
- 子线程完成后: 恢复为 1`,
    code: `# -*- coding: utf-8 -*-
# 第三章演示代码：Python 线程是怎么工作的
# 用 threading.active_count() 和 threading.enumerate() 观察线程状态变化
import threading      # threading：Python 标准库多线程模块
import time           # time：用于 sleep 和计时

print("=" * 60)
print("Python 线程状态观察")
print("=" * 60)

# 辅助函数：打印当前活跃线程信息
def print_thread_status(label):
    """打印当前活跃线程数量和线程列表。"""
    count = threading.active_count()     # 获取当前活跃线程数
    threads = threading.enumerate()      # 获取所有活跃线程对象的列表
    print(f"  [{label}]")
    print(f"    活跃线程数: {count}")
    for t in threads:                    # 遍历每个线程
        # t.name：线程名称  t.ident：线程唯一标识符（操作系统层面的线程ID）
        print(f"    - {t.name} (ident={t.ident})")

# ===== 1. 初始状态：只有主线程 =====
print("\\n[1] 初始状态（程序刚启动）：")
print_thread_status("主线程独占")

# ===== 2. 创建线程但未启动 =====
print("\\n[2] 创建2个线程对象，但还没 start()：")

# 定义一个子线程要执行的任务
def worker(name, duration):
    """子线程任务：打印开始信息，休眠指定时间，打印完成信息。"""
    current = threading.current_thread()  # 获取当前线程对象
    print(f"    [{name}] 我是 {current.name}，开始工作...")
    time.sleep(duration)                  # 休眠，模拟工作
    print(f"    [{name}] 工作完成！")

# 创建线程对象（此时线程还未启动，不在活跃线程列表中）
t1 = threading.Thread(target=worker, args=("任务A", 0.3), name="Worker-A")
t2 = threading.Thread(target=worker, args=("任务B", 0.3), name="Worker-B")
print_thread_status("创建但未启动")

# ===== 3. 启动线程 =====
print("\\n[3] 启动2个线程（start()）：")
t1.start()   # start()：启动线程，操作系统创建真实线程，开始执行 worker 函数
t2.start()   # start()：启动第二个线程
# 此时主线程、t1、t2 三个线程同时在运行
time.sleep(0.1)  # 稍等片刻，确保子线程已经启动并打印了信息
print_thread_status("启动后（3个线程并发）")

# ===== 4. 等待线程完成 =====
print("\\n[4] 等待子线程完成（join()）：")
t1.join()    # join()：阻塞主线程，直到 t1 执行完毕
t2.join()    # join()：阻塞主线程，直到 t2 执行完毕
print_thread_status("子线程完成后")

# ===== 5. 观察线程切换 =====
print("\\n[5] 观察线程切换（3个线程交替打印）：")

def counter(name, count):
    """计数器任务：打印 count 次消息，每次间隔0.05秒。"""
    for i in range(count):
        # threading.current_thread().name 获取当前线程名
        # 通过观察输出，可以看到不同线程的交替执行
        print(f"    [{name}] 第 {i+1}/{count} 次 (线程={threading.current_thread().name})")
        time.sleep(0.05)   # 短暂休眠，让其他线程有机会执行

# 创建3个计数器线程
tc1 = threading.Thread(target=counter, args=("甲", 3), name="Counter-1")
tc2 = threading.Thread(target=counter, args=("乙", 3), name="Counter-2")
tc3 = threading.Thread(target=counter, args=("丙", 3), name="Counter-3")

tc1.start()   # 启动线程1
tc2.start()   # 启动线程2
tc3.start()   # 启动线程3

tc1.join()    # 等待线程1
tc2.join()    # 等待线程2
tc3.join()    # 等待线程3

print("\\n" + "=" * 60)
print("结论：")
print("  - active_count() 返回活跃线程数（包含主线程）")
print("  - enumerate() 返回所有活跃线程对象列表")
print("  - start() 后线程才真正运行，join() 后线程结束")
print("  - 多个线程交替执行（时间片轮转）")
print("=" * 60)
`,
  },

  // =========================================================
  // 第四章：GIL 全局解释器锁
  // =========================================================
  {
    id: "py2-04",
    group: "基础概念",
    icon: "🔒",
    title: "GIL 全局解释器锁：为什么 Python 线程不能真并行",
    content: `## 一、什么是 GIL

**GIL**（Global Interpreter Lock，全局解释器锁）是 CPython 解释器中的一把**互斥锁**。它的作用是：

> **同一时刻，只允许一个线程执行 Python 字节码。**

\`\`\`text
没有 GIL 的情况（危险！）：
  线程1: 执行 x = x + 1  →  读x(0) → 加1 → 写x(1)
  线程2: 执行 x = x + 1  →  读x(0) → 加1 → 写x(1)  ← 丢失更新！
  结果: x = 1（应该是 2）

有 GIL 的情况（安全）：
  线程1: 执行 x = x + 1  →  拿GIL → 读x(0) → 加1 → 写x(1) → 释放GIL
  线程2: 执行 x = x + 1  →  等GIL → 拿GIL → 读x(1) → 加1 → 写x(2) → 释放GIL
  结果: x = 2（正确！）
\`\`\`

## 二、为什么有 GIL

GIL 的存在是为了保护 Python 内部数据结构的**线程安全**，特别是**引用计数**。

Python 用引用计数来管理内存：

\`\`\`text
a = [1, 2, 3]    → 列表对象的引用计数 = 1
b = a            → 引用计数 = 2
del a            → 引用计数 = 1
del b            → 引用计数 = 0 → 回收内存
\`\`\`

如果多个线程同时修改引用计数，可能出现数据竞争，导致内存泄漏或提前回收。GIL 保证同一时刻只有一个线程能修改引用计数，简单粗暴地解决了问题。

### GIL 的优缺点

| 优点 | 缺点 |
|------|------|
| 实现简单（一把锁搞定） | 多核 CPU 无法并行执行 Python 代码 |
| 单线程性能好（无锁开销） | CPU 密集型任务多线程无效 |
| C 扩展开发简单 | 给多线程编程带来认知负担 |

## 三、GIL 的影响

### CPU 密集型任务：多线程没用（甚至更慢）

CPU 密集型任务 = 大量计算，CPU 是瓶颈。由于 GIL，同一时刻只有一个线程在执行 Python 字节码，所以：

\`\`\`text
单线程执行4个计算任务：  |--任务1--|--任务2--|--任务3--|--任务4--|  总耗时 4s
4线程执行4个计算任务：  |--线程1--|--线程2--|--线程3--|--线程4--|  总耗时 4s+
                       （GIL导致交替执行，加上切换开销，反而更慢！）
\`\`\`

多线程不但不快，还因为线程切换开销而**更慢**！

### IO 密集型任务：多线程有效

IO 密集型任务 = 大量等待（网络、磁盘），CPU 空闲。IO 操作时线程会**释放 GIL**，其他线程可以执行：

\`\`\`text
单线程执行4个IO任务：  |--IO1(等)--|--IO2(等)--|--IO3(等)--|--IO4(等)--|  总耗时 4s
4线程执行4个IO任务：  |--IO1(等,GIL释放)--|
                      |--IO2(等,GIL释放)--|
                      |--IO3(等,GIL释放)--|  总耗时 ~1s！
                      |--IO4(等,GIL释放)--|
\`\`\`

## 四、对比实验

### 实验1：CPU 密集型（计算平方和）

\`\`\`python
# 计算 1 到 2000000 的平方和
def cpu_task(n):
    return sum(i * i for i in range(n))

# 单线程：4次串行
# 多线程：4个线程同时
\`\`\`

预期结果：多线程不快，甚至更慢（GIL 阻止并行 + 切换开销）

### 实验2：IO 密集型（sleep 模拟）

\`\`\`python
# 每个任务 sleep 0.3 秒
def io_task():
    time.sleep(0.3)

# 单线程：4次串行 → ~1.2s
# 多线程：4个线程 → ~0.3s
\`\`\`

预期结果：多线程明显更快（IO 时释放 GIL）

## 五、CPU 密集型 vs IO 密集型 判断

| 特征 | CPU 密集型 | IO 密集型 |
|------|-----------|-----------|
| **瓶颈** | CPU 计算 | IO 等待（网络/磁盘） |
| **CPU 利用率** | 高（接近 100%） | 低（大量空闲） |
| **多线程效果** | 无效（GIL） | 有效（释放 GIL） |
| **推荐方案** | multiprocessing | threading / asyncio |
| **典型任务** | 数学计算、图像处理、加密 | 网络请求、文件读写、数据库查询 |

## 六、如何绕过 GIL

| 方法 | 原理 | 适用场景 |
|------|------|----------|
| **multiprocessing** | 每个进程有自己的 GIL，真正并行 | CPU 密集型任务 |
| **C 扩展** | C 代码中可以手动释放 GIL | NumPy 等科学计算库 |
| **asyncio** | 单线程协程，事件驱动，不需要多线程 | 高并发 IO（如 Web 服务器） |
| **Jython/IronPython** | 不使用 GIL 的 Python 实现 | 特定场景（不常用） |

\`\`\`python
# multiprocessing 绕过 GIL 示例
from multiprocessing import Pool
with Pool(4) as pool:
    results = pool.map(cpu_task, [2000000, 2000000, 2000000, 2000000])
# 4个进程真正并行执行，利用多核 CPU
\`\`\`

## 七、本章 demo 说明

下面的代码做两个对比实验：

1. **CPU 密集型实验**：计算 1 到 100 万的平方和，对比单线程（4 次串行）和多线程（4 线程并发）的耗时。预期：多线程不快甚至更慢。
2. **IO 密集型实验**：每个任务 sleep 0.3 秒，对比单线程（4 次串行）和多线程（4 线程并发）的耗时。预期：多线程明显更快（约 4 倍）。

运行后你会看到：
- CPU 密集型：单线程和多线程耗时接近，多线程可能略慢
- IO 密集型：多线程比单线程快约 3-4 倍
- 这就是 GIL 的影响：CPU 任务受 GIL 限制，IO 任务不受影响`,
    code: `# -*- coding: utf-8 -*-
# 第四章演示代码：GIL 全局解释器锁
# 对比 CPU 密集型任务和 IO 密集型任务在单线程/多线程下的表现差异
import threading     # threading：多线程模块
import time          # time：用于计时和 sleep

print("=" * 60)
print("GIL 影响：CPU 密集型 vs IO 密集型")
print("=" * 60)

# ===== 实验1：CPU 密集型任务 =====
print("\\n" + "=" * 50)
print("实验1：CPU 密集型任务（计算平方和）")
print("=" * 50)

def cpu_task(task_id, n, results):
    """
    CPU 密集型任务：计算 1 到 n 的平方和。
    - task_id: 任务编号
    - n: 计算范围上限
    - results: 字典，用于保存结果（线程间共享内存）
    """
    total = 0
    for i in range(1, n + 1):     # 从1到n循环
        total += i * i            # 累加平方
    results[task_id] = total      # 把结果存入字典

N = 1_000_000   # 计算范围：1到100万
NUM_TASKS = 4   # 任务数量

# --- 单线程：4次串行执行 ---
print(f"\\n  [单线程] 串行执行 {NUM_TASKS} 次（每次计算1-{N}的平方和）：")
results_serial = {}
start = time.time()                       # 记录开始时间
for i in range(NUM_TASKS):                # 串行执行4次
    cpu_task(i, N, results_serial)        # 直接调用函数
serial_cpu_time = time.time() - start     # 计算总耗时
print(f"  → 单线程总耗时: {serial_cpu_time:.3f} 秒")
print(f"  → 计算结果: {results_serial[0]}")

# --- 多线程：4个线程并发执行 ---
print(f"\\n  [多线程] {NUM_TASKS} 个线程并发执行：")
results_threaded = {}
threads = []
start = time.time()                       # 记录开始时间
for i in range(NUM_TASKS):                # 创建4个线程
    # target=cpu_task：线程执行的函数
    # args=(i, N, results_threaded)：传给函数的参数
    t = threading.Thread(target=cpu_task, args=(i, N, results_threaded))
    threads.append(t)                     # 加入列表
    t.start()                             # 启动线程
for t in threads:                         # 等待所有线程完成
    t.join()
threaded_cpu_time = time.time() - start   # 计算总耗时
print(f"  → 多线程总耗时: {threaded_cpu_time:.3f} 秒")
print(f"  → 计算结果: {results_threaded[0]}")

# 对比
print(f"\\n  CPU 密集型对比：")
print(f"    单线程: {serial_cpu_time:.3f}s  |  多线程: {threaded_cpu_time:.3f}s")
print(f"    多线程/单线程 = {threaded_cpu_time/serial_cpu_time:.2f}x")
print(f"    结论: 多线程不快甚至更慢 → GIL 阻止了并行执行！")

# ===== 实验2：IO 密集型任务 =====
print("\\n" + "=" * 50)
print("实验2：IO 密集型任务（sleep 模拟网络等待）")
print("=" * 50)

def io_task(task_id, results):
    """
    IO 密集型任务：sleep 0.3 秒模拟网络/磁盘等待。
    sleep 期间线程会释放 GIL，其他线程可以执行。
    """
    time.sleep(0.3)              # 休眠0.3秒，模拟IO等待
    results[task_id] = f"任务{task_id}完成"

SLEEP_TIME = 0.3

# --- 单线程：4次串行 ---
print(f"\\n  [单线程] 串行执行 {NUM_TASKS} 次（每次sleep {SLEEP_TIME}秒）：")
results_io_serial = {}
start = time.time()
for i in range(NUM_TASKS):
    io_task(i, results_io_serial)
serial_io_time = time.time() - start
print(f"  → 单线程总耗时: {serial_io_time:.3f} 秒")

# --- 多线程：4个线程并发 ---
print(f"\\n  [多线程] {NUM_TASKS} 个线程并发执行：")
results_io_threaded = {}
threads = []
start = time.time()
for i in range(NUM_TASKS):
    t = threading.Thread(target=io_task, args=(i, results_io_threaded))
    threads.append(t)
    t.start()
for t in threads:
    t.join()
threaded_io_time = time.time() - start
print(f"  → 多线程总耗时: {threaded_io_time:.3f} 秒")

# 对比
print(f"\\n  IO 密集型对比：")
print(f"    单线程: {serial_io_time:.3f}s  |  多线程: {threaded_io_time:.3f}s")
print(f"    提速倍数: {serial_io_time/threaded_io_time:.1f}x")
print(f"    结论: 多线程明显更快 → IO 时释放 GIL，其他线程可以执行！")

# ===== 总结 =====
print("\\n" + "=" * 60)
print("GIL 总结：")
print(f"  CPU 密集型: 单{serial_cpu_time:.2f}s vs 多{threaded_cpu_time:.2f}s → 多线程无效")
print(f"  IO  密集型: 单{serial_io_time:.2f}s vs 多{threaded_io_time:.2f}s → 多线程有效")
print("=" * 60)
print("  记住：GIL 限制 CPU 密集型任务，但 IO 操作时会释放 GIL")
print("  → IO 密集型用 threading，CPU 密集型用 multiprocessing")
`,
  },

  // =========================================================
  // 第五章：创建线程的两种方式
  // =========================================================
  {
    id: "py2-05",
    group: "threading 基础",
    icon: "🧵",
    title: "创建线程的两种方式",
    content: `## 一、两种创建方式概述

Python \`threading\` 模块提供了两种创建线程的方式：

| 方式 | 语法 | 特点 | 适用场景 |
|------|------|------|----------|
| **函数式** | \`Thread(target=func)\` | 简单直接，最常用 | 大多数场景 |
| **类继承式** | 继承 \`Thread\`，重写 \`run()\` | 封装性好，可携带状态 | 需要封装复杂逻辑 |

## 二、方式一：函数式（最常用）

把要执行的函数传给 \`Thread\` 的 \`target\` 参数：

\`\`\`python
import threading

def my_task(name):
    print(f"线程 {name} 正在执行")

# 创建线程：target=函数名，args=参数元组
t = threading.Thread(target=my_task, args=("A",))
t.start()   # 启动线程
t.join()    # 等待线程结束
\`\`\`

### 关键参数

| 参数 | 说明 | 例子 |
|------|------|------|
| \`target\` | 线程要执行的函数 | \`target=my_task\` |
| \`args\` | 位置参数（元组） | \`args=("A", 10)\` |
| \`kwargs\` | 关键字参数（字典） | \`kwargs={"name": "A"}\` |
| \`name\` | 线程名称 | \`name="my-thread"\` |
| \`daemon\` | 是否为守护线程 | \`daemon=True\` |

> **注意**：\`args\` 必须是元组。如果只有一个参数，要写成 \`args=(value,)\`，后面的逗号不能少！

### 为什么要用函数式？

1. **简单**：几行代码就能创建线程
2. **灵活**：任何函数都能传给 \`target\`
3. **解耦**：函数和线程创建分离，函数可以单独测试
4. **最常用**：90% 的场景用函数式就够了

## 三、方式二：继承 Thread 类

继承 \`threading.Thread\`，重写 \`run()\` 方法：

\`\`\`python
import threading

class MyThread(threading.Thread):
    def __init__(self, name):
        super().__init__()    # 必须调用父类构造函数
        self.name = name

    def run(self):
        # 重写 run 方法，线程启动后执行这里的代码
        print(f"线程 {self.name} 正在执行")

t = MyThread(name="A")
t.start()   # start() 会自动调用 run()
\`\`\`

### 为什么要用类继承式？

1. **封装性**：线程逻辑和数据封装在一个类里
2. **携带状态**：可以在实例属性中保存状态
3. **可扩展**：可以添加自定义方法
4. **复杂场景**：需要管理线程生命周期、状态转换时更清晰

## 四、两种方式对比

| 对比项 | 函数式 | 类继承式 |
|--------|--------|----------|
| **代码量** | 少 | 多 |
| **学习成本** | 低 | 中 |
| **灵活性** | 高（任何函数都行） | 中（需要继承） |
| **封装性** | 差（函数和数据分离） | 好（封装在一起） |
| **状态管理** | 用外部变量 | 用实例属性 |
| **使用频率** | 90% | 10% |

### 选择建议

- **默认用函数式**：简单、直接、够用
- **以下场景用类继承式**：
  - 线程需要维护复杂状态
  - 线程逻辑需要封装成可复用的组件
  - 需要重写线程生命周期方法

## 五、start() vs run() 的区别

这是一个**非常重要**的区别，初学者常踩坑：

| 方法 | 行为 | 是否创建新线程 |
|------|------|---------------|
| \`start()\` | 启动新线程，在新线程中调用 \`run()\` | ✅ 是 |
| \`run()\` | 在**当前线程**中直接执行 | ❌ 否 |

\`\`\`python
# 正确：start() 创建新线程
t = threading.Thread(target=my_task)
t.start()   # 新线程执行 my_task

# 错误：run() 不创建新线程！
t.run()     # 当前线程执行 my_task（和直接调用函数一样）
\`\`\`

### 直观对比

\`\`\`text
start() 的执行流程：
  主线程 → 创建新线程 → 新线程执行 run() → 主线程和新线程并发
  主线程: ────────继续执行────────────────→
  新线程:      └─执行 run() ─┘

run() 的执行流程（不创建新线程）：
  主线程 → 直接执行 run() → 执行完才继续
  主线程: ────执行 run()────→────继续──→
  （没有新线程，就是普通函数调用）
\`\`\`

> **记住**：永远用 \`start()\` 启动线程，**不要直接调用 \`run()\`**！

## 六、线程的 name 和 ident 属性

每个线程对象都有两个重要属性：

| 属性 | 说明 | 例子 |
|------|------|------|
| \`name\` | 线程名称（可自定义） | \`"Worker-1"\` |
| \`ident\` | 线程ID（操作系统分配） | \`140735892346624\` |

\`\`\`python
t = threading.Thread(target=task, name="my-worker")
t.start()
print(t.name)    # "my-worker"
print(t.ident)   # 12345678（操作系统层面的线程ID）
\`\`\`

- \`name\` 方便调试和日志，建议给重要线程起有意义的名字
- \`ident\` 在线程启动前为 \`None\`，启动后才有值
- 主线程的 name 固定为 \`"MainThread"\`

## 七、本章 demo 说明

下面用两种方式各创建线程：

**demo1**：用函数式创建 3 个线程，分别打印不同消息
**demo2**：用类继承方式创建线程，模拟"工人"工作，展示 name 和 ident 属性

还会演示 \`start()\` 和 \`run()\` 的区别——\`start()\` 创建新线程，\`run()\` 只是在当前线程调用函数。

运行后你会看到：
- 3 个函数式线程并发打印消息（顺序不固定，因为并发执行）
- 类继承式线程展示 name 和 ident
- \`start()\` 在新线程执行（线程名不同），\`run()\` 在主线程执行（线程名都是 MainThread）`,
    code: `# -*- coding: utf-8 -*-
# 第五章演示代码：创建线程的两种方式
# 演示函数式创建线程、类继承式创建线程、start() vs run() 的区别
import threading       # threading：Python 标准库多线程模块
import time            # time：用于 sleep 和计时

print("=" * 60)
print("创建线程的两种方式")
print("=" * 60)

# ===== demo1：函数式创建线程 =====
print("\\n" + "=" * 50)
print("demo1：函数式创建线程（threading.Thread）")
print("=" * 50)

# 定义一个函数，将被线程执行
def greet(name, count):
    """
    线程任务函数：打印 count 次问候消息。
    - name: 被问候者的名字
    - count: 打印次数
    """
    # threading.current_thread() 获取当前正在执行的线程对象
    current = threading.current_thread()
    for i in range(count):
        # 打印：第几次、线程名、问候消息
        print(f"  [{i+1}/{count}] 线程'{current.name}': 你好，{name}！")
        time.sleep(0.05)   # 短暂休眠，让输出交替更明显

# 创建3个线程，分别问候不同的人
# threading.Thread() 参数说明：
#   target=greet     → 线程要执行的函数
#   args=("张三", 3)  → 传给函数的位置参数（元组）
#   name="Greeter-1" → 线程名称（方便调试）
t1 = threading.Thread(target=greet, args=("张三", 3), name="Greeter-1")
t2 = threading.Thread(target=greet, args=("李四", 3), name="Greeter-2")
t3 = threading.Thread(target=greet, args=("王五", 3), name="Greeter-3")

# 启动3个线程（start() 创建新线程并执行 target 函数）
t1.start()   # 启动线程1
t2.start()   # 启动线程2
t3.start()   # 启动线程3

# 等待3个线程全部完成
t1.join()    # 阻塞主线程直到 t1 完成
t2.join()    # 阻塞主线程直到 t2 完成
t3.join()    # 阻塞主线程直到 t3 完成

print("\\n  → 3个线程已全部完成（输出顺序不固定，因为是并发执行）")

# ===== demo2：类继承式创建线程 =====
print("\\n" + "=" * 50)
print("demo2：类继承式创建线程（继承 threading.Thread）")
print("=" * 50)

# 继承 threading.Thread 类，自定义线程
class Worker(threading.Thread):
    """
    自定义线程类：模拟一个"工人"工作。
    继承 Thread 后，重写 run() 方法，线程启动时自动调用 run()。
    """

    def __init__(self, worker_name, work_count):
        """
        构造函数：初始化工人属性。
        必须调用 super().__init__() 来初始化父类 Thread。
        """
        super().__init__()              # 调用父类 Thread 的构造函数（必须！）
        self.worker_name = worker_name   # 工人名字（自定义属性）
        self.work_count = work_count     # 工作次数（自定义属性）
        # 可以自定义线程名，也可以用默认名
        # self.name 会被 Thread 用作线程名

    def run(self):
        """
        重写 run() 方法：线程启动后执行的逻辑。
        start() 会自动调用这个方法，不需要手动调用。
        """
        # self.name 是从 Thread 继承的线程名属性
        # self.ident 是线程ID（操作系统分配），启动前为 None
        print(f"  [{self.worker_name}] 开始工作 (线程名={self.name}, 线程ID={self.ident})")
        for i in range(self.work_count):
            print(f"  [{self.worker_name}] 正在完成第 {i+1}/{self.work_count} 项工作...")
            time.sleep(0.1)   # 模拟工作耗时
        print(f"  [{self.worker_name}] 全部工作完成！")

# 创建2个工人线程
w1 = Worker(worker_name="工人甲", work_count=2)
w2 = Worker(worker_name="工人乙", work_count=2)

# 也可以手动设置线程名
w1.name = "Worker-Alpha"
w2.name = "Worker-Beta"

# start() 启动线程 → 自动调用 run() 方法
w1.start()   # 启动工人甲（新线程）
w2.start()   # 启动工人乙（新线程）

# 等待两个工人完成
w1.join()    # 等待工人甲
w2.join()    # 等待工人乙

# ===== start() vs run() 的区别 =====
print("\\n" + "=" * 50)
print("start() vs run() 的区别")
print("=" * 50)

def check_thread():
    """打印当前线程名，用于判断是在哪个线程中执行。"""
    current = threading.current_thread()
    print(f"  当前线程名: {current.name}")
    time.sleep(0.05)

# --- start()：创建新线程 ---
print("\\n  [start() 调用]：")
t = threading.Thread(target=check_thread, name="NewThread")
t.start()   # start() 创建新线程，在新线程中执行 check_thread
t.join()    # 等待新线程完成
# 预期输出：当前线程名: NewThread（说明在新线程中执行）

# --- run()：不创建新线程，在当前线程直接执行 ---
print("\\n  [run() 调用]：")
t = threading.Thread(target=check_thread, name="NewThread")
t.run()     # run() 不创建新线程！在当前线程（主线程）直接调用 check_thread
# 预期输出：当前线程名: MainThread（说明在主线程中执行，没有创建新线程）

# ===== 总结 =====
print("\\n" + "=" * 60)
print("总结：")
print("  方式一（函数式）：Thread(target=func, args=(...)) → 最常用")
print("  方式二（类继承）：继承 Thread，重写 run() → 需要封装时用")
print("  start()：创建新线程执行 run() ← 永远用这个！")
print("  run()：在当前线程直接执行 ← 不要直接调用！")
print("  name：线程名（方便调试）  ident：线程ID（系统分配）")
print("=" * 60)
`,
  },
];
