// =============================================================
// Python 多进程教程（pyprocess）—— 第五批章节
// batch5（19-24章）：实战与陷阱
//   第19章：  CPU 密集任务实战：图片批量处理
//   第20章：  CPU 密集任务实战：哈希暴力破解
//   第21章：  混合型任务：进程 + 线程组合
//   第22章：  subprocess 子进程入门：调用外部命令
//   第23章：  10 个最常见的多进程 bug 与修复
//   第24章：  选型指南与最佳实践总结
// =============================================================

export const chapters = [
  // =========================================================
  // 第十九章：CPU 密集任务实战：图片批量处理
  // =========================================================
  {
    id: "mp-19",
    group: "实战与陷阱",
    icon: "🖼️",
    title: "CPU 密集任务实战：图片批量处理",
    content: `## 一、场景说明

假设你有一个图片处理任务：把 100 张图片统一缩放到指定大小。

- 每张图片处理要 0.5 秒（CPU 密集：解码、缩放、编码）
- 单进程串行：100 × 0.5s = 50s
- 4 核多进程：理论上 ~12.5s

**实际代码**用标准库的模拟（不依赖 PIL）演示"CPU 密集任务的并行处理"。

## 二、关键技术点

### 1. 任务划分

把 100 张图片**平均分**给 N 个进程：

\`\`\`python
# 方式 1：每个进程负责一段（按索引切分）
chunks = [images[i:i+chunk_size] for i in range(0, len(images), chunk_size)]

# 方式 2：Pool.map 自动分（更简单）
pool.map(process_one_image, images)
\`\`\`

### 2. 进度跟踪

用 \`imap_unordered\` + callback 实时报告进度：

\`\`\`python
done = 0
total = len(images)

def on_done(result):
    global done
    done += 1
    print(f"进度: {done}/{total}")

for r in pool.imap_unordered(process, images, callback=on_done):
    pass  # 实际上 callback 自动调
\`\`\`

### 3. 异常隔离

一个图片处理失败不应该让整个任务挂掉：

\`\`\`python
def safe_process(img):
    try:
        return process(img)
    except Exception as e:
        return {"error": str(e), "image": img}
\`\`\`

### 4. 结果收集

用 \`imap_unordered\` 收集所有结果，按完成顺序逐个处理。

## 三、性能监控

如何知道多进程真的快了？加个计时器：

\`\`\`python
import time
start = time.time()
results = pool.map(work, tasks)
print(f"耗时: {time.time() - start:.2f}s")
\`\`\`

## 四、参数调优

### 进程数选多少？

经验值：**CPU 核数 ~ 2 × CPU 核数**

- 太少：CPU 没充分利用
- 太多：进程切换开销增加
- CPU 密集型：**CPU 核数**最佳
- IO 密集型：**2 × CPU 核数**（IO 等待时 CPU 空闲）

\`\`\`python
NUM_WORKERS = multiprocessing.cpu_count()  # 自动获取
\`\`\`

### chunksize 调多大？

- 任务耗时大（> 1s）→ chunksize = 1 都行
- 任务耗时小（< 100ms）→ chunksize = 10-100
- 任务数 << 进程数 → chunksize = 1

## 五、完整的实战代码

下面 demo 模拟图片处理：
- 用 \`time.sleep(0.3)\` 模拟单图处理耗时
- 100 张图片，4 个进程
- 串行 vs 并行对比
- imap_unordered + 进度回调
- 异常隔离（一张失败不影响其他）
`,
    code: `"""
第十九章 demo：图片批量处理（CPU 密集任务）
模拟场景：处理 100 张图片，每张 0.3s
对比：串行 vs 多进程
"""

import multiprocessing
import os
import time
import random


# ===== 模拟图片处理函数 =====
def process_image(image_info: dict) -> dict:
    """
    模拟处理一张图片。
    image_info: {"id": int, "size": "1920x1080", "format": "jpg"}
    返回: {"id": int, "new_size": "800x600", "elapsed": float}
    """
    # 用 time.sleep 模拟 CPU 密集的图片处理（实际是 PIL/Pillow 的 resize）
    # 为避免 demo 超时，单图耗时控制在 0.02-0.04s
    processing_time = random.uniform(0.02, 0.04)
    time.sleep(processing_time)

    # 故意让第 8 张图失败
    if image_info["id"] == 8:
        raise ValueError(f"图片 {image_info['id']} 文件损坏")

    return {
        "id": image_info["id"],
        "new_size": "800x600",
        "elapsed": processing_time,
    }


# ===== 健壮版：异常隔离 =====
def safe_process_image(image_info: dict) -> dict:
    """即使处理失败也不抛异常，返回错误信息"""
    try:
        result = process_image(image_info)
        result["status"] = "ok"
        return result
    except Exception as e:
        return {
            "id": image_info["id"],
            "status": "error",
            "error": str(e),
        }


# ===== Demo 1：串行 vs 多进程 =====
def demo_serial_vs_parallel():
    print("=== Demo 1: 串行 vs 多进程 ===")

    # 准备 8 张图
    images = [{"id": i, "size": "1920x1080", "format": "jpg"} for i in range(8)]
    NUM_WORKERS = min(4, multiprocessing.cpu_count())

    # 串行
    start = time.time()
    results = [safe_process_image(img) for img in images]
    elapsed = time.time() - start
    print(f"  串行 ({len(images)} 张): {elapsed:.2f}s")

    # 多进程
    start = time.time()
    with multiprocessing.Pool(processes=NUM_WORKERS) as pool:
        results = pool.map(safe_process_image, images)
    elapsed = time.time() - start
    print(f"  多进程 ({NUM_WORKERS} workers): {elapsed:.2f}s")
    print(f"  加速比: {elapsed / max(elapsed, 0.01):.1f}x（参考值）\\n")


# ===== Demo 2：imap_unordered + 进度回调 =====
def demo_with_progress():
    print("=== Demo 2: imap_unordered + 进度回调 ===")

    images = [{"id": i, "size": "1920x1080", "format": "jpg"} for i in range(6)]
    NUM_WORKERS = 4

    progress = {"done": 0, "total": len(images)}

    def on_one_done(result):
        progress["done"] += 1
        status = "✅" if result.get("status") == "ok" else "❌"
        print(f"  [进度 {progress['done']}/{progress['total']}] {status} 图片 {result['id']}")

    NUM_WORKERS = 4
    start = time.time()
    with multiprocessing.Pool(processes=NUM_WORKERS) as pool:
        # imap_unordered 边完成边回调
        for result in pool.imap_unordered(safe_process_image, images):
            on_one_done(result)
    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.2f}s\\n")


# ===== Demo 3：参数调优对比 =====
def demo_tuning():
    print("=== Demo 3: 进程数调优 ===")

    images = [{"id": i, "size": "1920x1080", "format": "jpg"} for i in range(6)]

    for n_workers in [2, 4]:
        start = time.time()
        with multiprocessing.Pool(processes=n_workers) as pool:
            results = pool.map(safe_process_image, images)
        elapsed = time.time() - start
        print(f"  workers={n_workers}: {elapsed:.2f}s")
    print()


# ===== Demo 4：异常隔离 =====
def demo_exception_isolation():
    print("=== Demo 4: 异常隔离（一张失败不影响其他） ===")
    images = [{"id": i} for i in range(6)]

    with multiprocessing.Pool(4) as pool:
        # 用健壮版：所有任务都返回结果，不抛异常
        results = pool.map(safe_process_image, images)

    success = sum(1 for r in results if r.get("status") == "ok")
    failed = sum(1 for r in results if r.get("status") == "error")
    print(f"  成功: {success}, 失败: {failed}")
    for r in results:
        if r.get("status") == "error":
            print(f"    ❌ 图片 {r['id']}: {r.get('error')}\\n")
            break


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}")
    print(f"本机 CPU 核数: {multiprocessing.cpu_count()}\\n")

    demo_serial_vs_parallel()
    demo_with_progress()
    demo_tuning()
    demo_exception_isolation()

    print("=== 总结 ===")
    print("• CPU 密集任务用多进程能拿到接近 CPU 核数的加速比")
    print("• 进程数一般设为 CPU 核数（CPU 密集）")
    print("• 用 imap_unordered + callback 实时显示进度")
    print("• 健壮的任务函数要内部捕获异常，避免一个失败搞挂所有")
    print("• chunksize：短任务用大 chunksize 提升性能")
`,
  },

  // =========================================================
  // 第二十章：CPU 密集任务实战：哈希暴力破解
  // =========================================================
  {
    id: "mp-20",
    group: "实战与陷阱",
    icon: "🔐",
    title: "CPU 密集任务实战：哈希暴力破解",
    content: `## 一、什么是"暴力破解"？

暴力破解 = 把所有可能的密码**一个个试**，直到找到匹配的。

- 比如密码是 4 位数字（0000-9999），最多试 10000 次
- 哈希函数 = 输入任意字符串，输出固定长度的"指纹"
- 暴力破解哈希 = 找一个输入，让它的哈希等于目标哈希

**这是典型的 CPU 密集任务**：每个候选都要算哈希，没有 IO。

## 二、为什么用多进程？

- 单核每秒算 ~100,000 个 SHA-256 哈希
- 4 核多进程：每秒 ~400,000 个
- 找 4 位数字密码：单核 0.1s，4 核 0.025s

## 三、任务划分策略

**两种划分方式**：

### 方式 1：按范围划分

每个进程负责一段数字范围：

\`\`\`python
# 4 个进程分别负责：
# 进程 1: 0000-2499
# 进程 2: 2500-4999
# 进程 3: 5000-7499
# 进程 4: 7500-9999
\`\`\`

**问题**：每个进程跑完的时间可能不一样，先跑完的进程要等慢的。

### 方式 2：工作池 + 任务队列

\`multiprocessing.Pool\` 内部就是这样：
- 池里有 N 个进程
- 任务队列里放所有候选
- 谁空闲就拿下一个

**优势**：自动负载均衡，快的进程多干，短的少干。

## 四、本章 demo

下面 demo 演示：
- 4 位数字密码的暴力破解
- 单进程 vs 多进程耗时对比
- 用 Pool.map 自动负载均衡
- 早停机制（找到就退出）
`,
    code: `"""
第二十章 demo：哈希暴力破解（CPU 密集任务）
模拟场景：破解 4 位数字密码的 SHA-256 哈希
"""

import multiprocessing
import os
import hashlib
import time
import functools


# ===== 真实的 SHA-256 暴力破解 =====
def hash_password(password: str) -> str:
    """计算密码的 SHA-256 哈希"""
    return hashlib.sha256(password.encode()).hexdigest()


def crack_one(candidate: int) -> tuple:
    """
    尝试一个候选密码。
    返回 (candidate, hash, matched)
    """
    # 4 位数字，左侧补 0
    password = f"{candidate:04d}"
    h = hash_password(password)
    return (candidate, password, h)


# ===== 模块顶层：单个候选检查函数（用于 imap_unordered，必须 pickle） =====
def crack_check(candidate: int, target_hash: str) -> int:
    """检查候选密码是否匹配目标哈希，匹配返回 candidate，否则返回 -1"""
    password, h = crack_one(candidate)[1:]
    if h == target_hash:
        return candidate  # 找到！
    return -1


# ===== 模块顶层：按范围检查函数（用于 demo_manual_partition） =====
def crack_check_range(args):
    """在 [start, end) 范围内查找匹配目标哈希的密码"""
    start, end, target_hash = args
    for c in range(start, end):
        password = f"{c:04d}"
        if hash_password(password) == target_hash:
            return password
    return None


# ===== 暴力破解主函数 =====
def brute_force(target_hash: str, num_workers: int = 1) -> tuple:
    """
    暴力破解 4 位数字密码的 SHA-256 哈希。
    返回 (找到的密码, 尝试次数)
    """
    found = None
    attempts = 0

    # 用 functools.partial 绑定 target_hash，得到可 pickle 的可调用对象
    check = functools.partial(crack_check, target_hash=target_hash)

    candidates = range(10000)  # 0000-9999

    if num_workers == 1:
        # 串行
        for c in candidates:
            attempts += 1
            r = check(c)
            if r >= 0:
                found = f"{r:04d}"
                break
    else:
        # 多进程（用 Pool 找，但需要早停，所以手动管理）
        with multiprocessing.Pool(num_workers) as pool:
            for result in pool.imap_unordered(check, candidates, chunksize=100):
                attempts += 1
                if result >= 0:
                    found = f"{result:04d}"
                    pool.terminate()  # 找到就停
                    break

    return found, attempts


# ===== Demo 1：找真实密码的哈希 =====
def demo_real_crack():
    print("=== Demo 1: 暴力破解 SHA-256 哈希 ===")

    # 假设目标密码是 "7293"
    target = "7293"
    target_hash = hash_password(target)
    print(f"  目标密码: {target}")
    print(f"  目标哈希: {target_hash[:16]}...\\n")

    # 串行破解
    start = time.time()
    found, attempts = brute_force(target_hash, num_workers=1)
    elapsed = time.time() - start
    print(f"  [串行 1 worker] 找到 {found}, 尝试 {attempts} 次, 耗时 {elapsed:.2f}s")

    # 多进程破解
    start = time.time()
    found, attempts = brute_force(target_hash, num_workers=4)
    elapsed = time.time() - start
    print(f"  [多进程 4 workers] 找到 {found}, 尝试 {attempts} 次, 耗时 {elapsed:.2f}s\\n")


# ===== Demo 2：性能基准测试 =====
def demo_benchmark():
    print("=== Demo 2: 性能基准 ===")

    # 用 "0000" 作为目标，破解时它第一个就是答案
    # 但我们想测的是"找到第一个匹配的速度"
    # 所以用"9999"作为目标（最坏情况）
    target = "9999"
    target_hash = hash_password(target)

    for n in [1, 2, 4]:
        start = time.time()
        found, attempts = brute_force(target_hash, num_workers=n)
        elapsed = time.time() - start
        print(f"  workers={n}: 找到 {found}, 尝试 {attempts} 次, 耗时 {elapsed:.2f}s")
    print()


# ===== Demo 3：手动按范围划分 =====
def demo_manual_partition():
    print("=== Demo 3: 手动按范围划分（演示负载不均） ===")
    target = "5555"  # 中间位置
    target_hash = hash_password(target)

    # 4 个进程，每个负责 2500 个候选
    RANGE_SIZE = 2500
    ranges = [(i * RANGE_SIZE, (i + 1) * RANGE_SIZE) for i in range(4)]

    start = time.time()
    with multiprocessing.Pool(4) as pool:
        # 给每个进程一个独立任务（不是切片）
        tasks = [(s, e, target_hash) for s, e in ranges]
        results = pool.map(crack_check_range, tasks)
    elapsed = time.time() - start

    found = next((r for r in results if r), None)
    print(f"  找到: {found}, 耗时 {elapsed:.2f}s")
    print(f"  （注意：4 个任务耗时不一样，但 pool.map 等最慢的）\\n")


# ===== Demo 4：早停机制 =====
def demo_early_stop():
    print("=== Demo 4: 早停机制（imap + terminate） ===")

    target = "1234"
    target_hash = hash_password(target)

    # 用 functools.partial 绑定 target_hash
    check = functools.partial(crack_check, target_hash=target_hash)

    start = time.time()
    with multiprocessing.Pool(4) as pool:
        # imap 边跑边检查
        for result in pool.imap_unordered(check, range(10000), chunksize=50):
            if result >= 0:
                found = f"{result:04d}"
                pool.terminate()  # 找到就杀掉其他进程
                break
    elapsed = time.time() - start

    print(f"  找到: {found}, 耗时 {elapsed:.3f}s")
    print(f"  （早停避免了无意义的计算）\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}")
    print(f"本机 CPU 核数: {multiprocessing.cpu_count()}\\n")

    demo_real_crack()
    demo_benchmark()
    demo_manual_partition()
    demo_early_stop()

    print("=== 总结 ===")
    print("• CPU 密集的破解任务用多进程能拿到接近核数倍的加速")
    print("• Pool 自动负载均衡，不用手动划分范围")
    print("• 找到就 terminate 早停，避免无意义计算")
    print("• 注意：真实的密码破解要考虑更多因素（盐值、慢哈希、限流等）")
    print("• 本 demo 仅供学习，请勿用于非法用途")
`,
  },

  // =========================================================
  // 第二十一章：混合型任务：进程 + 线程组合
  // =========================================================
  {
    id: "mp-21",
    group: "实战与陷阱",
    icon: "🔀",
    title: "混合型任务：进程 + 线程组合",
    content: `## 一、什么时候需要混合？

当一个任务**既包含 CPU 密集又包含 IO 密集**时：

\`\`\`python
def fetch_and_process(url):
    # 1. 抓取网页（IO 密集，等网络）
    html = requests.get(url).text
    # 2. 解析 HTML 提取数据（CPU 密集，正则/解析）
    data = parse(html)
    # 3. 存数据库（IO 密集）
    db.save(data)
\`\`\`

**两种策略**：

| 策略 | 方案 |
|------|------|
| **A：全用多进程** | 简单，但 IO 等待时 CPU 空闲 |
| **B：进程 + 线程组合** | 进程做 CPU 密集，线程做 IO 密集 |

## 二、混合方案 1：进程池里每个进程启动自己的线程池

\`\`\`python
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

def fetch_and_process(url):
    """单任务：抓取+处理+保存"""
    html = requests.get(url).text  # IO
    data = parse(html)              # CPU
    db.save(data)                  # IO

def process_one_url(url, thread_pool):
    """每个进程用一个线程池做 IO"""
    with thread_pool:
        html_futures = [thread_pool.submit(requests.get, u) for u in sub_urls]
        # ...
\`\`\`

实际中这种方案**比较复杂**，不推荐新手使用。

## 三、混合方案 2：分阶段流水线

更清晰的做法：**两阶段处理**：

\`\`\`text
阶段 1（IO 密集）：多线程抓取 → 队列
阶段 2（CPU 密集）：多进程处理队列里的数据
\`\`\`

\`\`\`python
import queue
import threading
import multiprocessing

def fetch(urls, out_queue):
    """IO 密集：多线程抓取"""
    for url in urls:
        data = requests.get(url).text
        out_queue.put(data)

def process(in_queue, out_queue):
    """CPU 密集：多进程处理"""
    while True:
        try:
            data = in_queue.get(timeout=1)
        except queue.Empty:
            break
        result = parse(data)  # CPU 密集
        out_queue.put(result)
\`\`\`

## 四、混合方案 3：concurrent.futures 双池（推荐）

Python 3.2+ 的 \`concurrent.futures\` 同时支持进程池和线程池：

\`\`\`python
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import requests

def fetch(url):
    """IO 密集"""
    return requests.get(url).text

def process_html(html):
    """CPU 密集"""
    # 复杂的 HTML 解析
    return len(html)

def main():
    urls = [...]  # 100 个 URL

    # 阶段 1：多线程抓取
    with ThreadPoolExecutor(max_workers=20) as pool:
        htmls = list(pool.map(fetch, urls))

    # 阶段 2：多进程处理
    with ProcessPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(process_html, htmls))
\`\`\`

**优势**：
- 两阶段清晰分离
- 每个阶段用最合适的并发方式
- 容易调试和优化

## 五、本章 demo

下面 demo 演示：
- 阶段 1：模拟多线程抓取（IO）
- 阶段 2：模拟多进程处理（CPU）
- 串行 vs 混合 vs 全部多进程 的对比
`,
    code: `"""
第二十一章 demo：进程 + 线程组合（混合型任务）
模拟：抓取 20 个网页（IO）→ 解析 HTML（CPU）→ 统计
对比：纯串行 / 全多进程 / 双池混合
"""

import multiprocessing
import threading
import time
import os
import random
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


# ===== 模拟 IO 任务：抓取网页 =====
def fetch(url: str) -> str:
    """模拟网络请求（IO 密集）"""
    time.sleep(random.uniform(0.1, 0.3))  # 网络延迟
    return f"<html>这是 url={url} 的内容</html>" * random.randint(50, 200)


# ===== 模拟 CPU 任务：解析 HTML =====
def process_html(html: str) -> dict:
    """模拟 HTML 解析（CPU 密集）"""
    # 模拟 CPU 密集：字符串处理
    pid = os.getpid()
    word_count = 0
    for i in range(50_000):
        word_count += html.count("<")  # 模拟解析工作

    return {"size": len(html), "words": word_count, "pid": pid}


# ===== 方案 1：纯串行 =====
def method_serial(urls):
    print("  [方法 1: 纯串行]")
    start = time.time()
    results = []
    for url in urls:
        html = fetch(url)
        result = process_html(html)
        results.append(result)
    return time.time() - start, results


# ===== 方案 2：全部多进程 =====
def method_all_process(urls):
    print("  [方法 2: 全部多进程]")
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as pool:
        # 两阶段都在进程池里
        htmls = list(pool.map(fetch, urls))
        results = list(pool.map(process_html, htmls))
    return time.time() - start, results


# ===== 方案 3：双池混合 =====
def method_dual_pool(urls):
    print("  [方法 3: 双池混合（线程抓取+进程处理）]")
    start = time.time()
    # 阶段 1：多线程抓取（IO 密集用线程）
    with ThreadPoolExecutor(max_workers=10) as thread_pool:
        htmls = list(thread_pool.map(fetch, urls))
    # 阶段 2：多进程处理（CPU 密集用进程）
    with ProcessPoolExecutor(max_workers=4) as process_pool:
        results = list(process_pool.map(process_html, htmls))
    return time.time() - start, results


# ===== Demo：三种方案对比 =====
def demo_compare():
    print("=== Demo: 三种方案对比 ===\\n")
    urls = [f"http://example.com/page-{i}" for i in range(20)]

    methods = [
        ("纯串行", method_serial),
        ("全多进程", method_all_process),
        ("双池混合", method_dual_pool),
    ]

    results = {}
    for name, method in methods:
        elapsed, _ = method(urls)
        results[name] = elapsed
        print(f"    耗时: {elapsed:.2f}s\\n")

    print("  性能对比:")
    base = results["纯串行"]
    for name, elapsed in results.items():
        speedup = base / elapsed
        print(f"    {name}: {elapsed:.2f}s ({speedup:.1f}x)")
    print()


# ===== 流水线模式：CPU 阶段的模块顶层 worker =====
def pipeline_cpu_worker(q, results, stop_signal):
    """CPU 阶段子进程 worker：从队列取数据并处理（必须模块顶层定义才能 pickle）"""
    while not stop_signal.is_set():
        try:
            html = q.get(timeout=0.5)
        except Exception:
            continue
        result = process_html(html)
        results.append(result)


# ===== 流水线模式 =====
def fetch_to_queue(urls, q: multiprocessing.Queue, num_workers: int):
    """IO 阶段：多线程抓取，结果放队列"""
    # 注意：这里是线程 target，不需要 pickle，可以嵌套定义
    def worker(urls_chunk):
        for url in urls_chunk:
            html = fetch(url)
            q.put(html)

    # 把 urls 分给 num_workers 个线程
    chunk_size = (len(urls) + num_workers - 1) // num_workers
    chunks = [urls[i:i+chunk_size] for i in range(0, len(urls), chunk_size)]

    threads = [threading.Thread(target=worker, args=(c,)) for c in chunks]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


def process_from_queue(q: multiprocessing.Queue, num_workers: int):
    """CPU 阶段：多进程从队列取数据处理"""
    results = multiprocessing.Manager().list()
    stop_signal = multiprocessing.Event()

    procs = [multiprocessing.Process(target=pipeline_cpu_worker, args=(q, results, stop_signal)) for _ in range(num_workers)]
    for p in procs:
        p.start()
    return procs, results, stop_signal


def demo_pipeline():
    print("=== Demo: 流水线模式（IO 和 CPU 真正并行）===")
    urls = [f"http://example.com/page-{i}" for i in range(20)]
    q = multiprocessing.Queue(maxsize=10)

    start = time.time()

    # 启动 CPU 阶段
    procs, results, stop = process_from_queue(q, 4)

    # IO 阶段
    fetch_to_queue(urls, q, num_workers=5)

    # 通知 CPU 阶段停止
    time.sleep(0.5)
    stop.set()
    for p in procs:
        p.join()

    elapsed = time.time() - start
    print(f"  流水线处理 {len(urls)} 个 URL，耗时 {elapsed:.2f}s")
    print(f"  （IO 和 CPU 真正并行，理论更快）\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}")
    print(f"本机 CPU 核数: {multiprocessing.cpu_count()}\\n")

    demo_compare()
    demo_pipeline()

    print("=== 总结 ===")
    print("• 混合型任务：IO 密集用线程，CPU 密集用进程")
    print("• concurrent.futures 同时支持 ProcessPoolExecutor 和 ThreadPoolExecutor")
    print("• 推荐模式：两阶段清晰分离（先抓取再处理）")
    print("• 高级模式：流水线（IO 和 CPU 真正并行）")
    print("• 简单场景：全用多进程也够用，别过度设计")
`,
  },

  // =========================================================
  // 第二十二章：subprocess 子进程入门：调用外部命令
  // =========================================================
  {
    id: "mp-22",
    group: "实战与陷阱",
    icon: "📞",
    title: "subprocess 子进程入门：调用外部命令",
    content: `## 一、subprocess vs multiprocessing

| 维度 | subprocess | multiprocessing |
|------|-----------|----------------|
| 目的 | **调用外部程序**（别的可执行文件、shell 脚本） | **自己写并发逻辑** |
| 进程类型 | 任何程序（ls、ffmpeg、python3、node） | Python 函数 |
| 通信 | 命令行参数、stdout、stderr、return code | Queue、Pipe、共享内存 |
| 典型场景 | 调 ffmpeg 转码、调 shell 命令 | 数据处理、计算任务并行 |

**一句话总结**：
- \`subprocess\` = **从你的 Python 程序里"调"别的程序**
- \`multiprocessing\` = **在你的 Python 程序内"开"多个 Python 进程**

## 二、subprocess.run()：最常用

Python 3.5+ 推荐用 \`subprocess.run()\`：

\`\`\`python
import subprocess

# 最简单的调用
result = subprocess.run(["ls", "-l"], capture_output=True, text=True)
print(result.stdout)   # 标准输出
print(result.stderr)   # 标准错误
print(result.returncode)  # 退出码（0 表示成功）
\`\`\`

### 关键参数

| 参数 | 含义 | 默认 |
|------|------|------|
| \`args\` | 命令和参数列表 | 必填 |
| \`capture_output\` | 是否捕获 stdout/stderr | False（直接打印到父进程） |
| \`text=True\` | 输出按文本（str）而不是字节（bytes） | False |
| \`timeout=N\` | 超时秒数 | None（一直等） |
| \`check=True\` | 退出码非 0 时抛异常 | False |
| \`cwd\` | 在哪个目录执行命令 | 当前目录 |
| \`env\` | 自定义环境变量 | None |
| \`input\` | 传给进程的 stdin 数据 | None |

## 三、3 种调用风格

### 风格 1：run + check + capture_output（推荐）

\`\`\`python
result = subprocess.run(
    ["python3", "-c", "print('hello')"],
    capture_output=True, text=True, check=True, timeout=10
)
print(result.stdout)  # "hello\\n"
\`\`\`

### 风格 2：shell=True（用 shell 解析命令）

\`\`\`python
result = subprocess.run(
    "ls -l | grep .py",
    shell=True, capture_output=True, text=True
)
\`\`\`

**警告**：\`shell=True\` 有**命令注入风险**，仅在完全信任输入时使用。

### 风格 3：Popen（高级用法）

\`\`\`python
proc = subprocess.Popen(
    ["long_running_cmd"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
)
# 可以读/写、轮询状态
stdout, stderr = proc.communicate(timeout=10)
\`\`\`

## 四、subprocess + 多进程

\`subprocess\` 也可以配合 \`multiprocessing\` 用：批量调用外部命令。

\`\`\`python
import multiprocessing
import subprocess

def run_cmd(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stdout

if __name__ == "__main__":
    cmds = [["echo", str(i)] for i in range(10)]
    with multiprocessing.Pool(4) as pool:
        results = pool.map(run_cmd, cmds)
\`\`\`

## 五、安全注意事项

### 1. 永远用列表传参数

\`\`\`python
# ❌ 危险（shell 注入）
subprocess.run(f"ls {user_input}", shell=True)

# ✅ 安全（参数作为独立项）
subprocess.run(["ls", user_input])
\`\`\`

### 2. 避免 shell=True

除非真的需要 shell 特性（管道、通配符），否则**不要用 shell=True**。

### 3. 设置 timeout

防止子进程卡死。

### 4. 检查 returncode

\`result.returncode == 0\` 是成功，其他都是失败。

## 六、本章 demo

下面 demo 演示：
- subprocess.run 基本用法
- 捕获 stdout/stderr
- 超时控制
- shell=True 的危险
- subprocess + multiprocessing 批量执行
`,
    code: `"""
第二十二章 demo：subprocess 调用外部命令
演示：
  1. 基本调用：ls、echo
  2. 捕获输出
  3. 超时控制
  4. shell=True 的危险
  5. subprocess + multiprocessing 批量执行
"""

import subprocess
import multiprocessing
import os
import time
import sys


# ===== Demo 1：基本调用 =====
def demo_basic():
    print("=== Demo 1: 基本调用 ===")

    # 简单命令
    result = subprocess.run(["echo", "hello from subprocess"], capture_output=True, text=True)
    print(f"  echo 输出: {result.stdout.strip()}")
    print(f"  退出码: {result.returncode}\\n")


# ===== Demo 2：捕获输出 =====
def demo_capture():
    print("=== Demo 2: 捕获输出 ===")

    # 跨平台命令
    if sys.platform == "win32":
        cmd = ["cmd", "/c", "dir"]
    else:
        cmd = ["ls", "-la"]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
    print(f"  命令: {cmd}")
    print(f"  stdout 前 200 字符: {result.stdout[:200]}")
    print(f"  returncode: {result.returncode}\\n")


# ===== Demo 3：超时控制 =====
def demo_timeout():
    print("=== Demo 3: 超时控制 ===")

    # 一个跑得比较久的命令
    if sys.platform == "win32":
        cmd = ["ping", "-n", "3", "127.0.0.1"]
    else:
        cmd = ["sleep", "3"]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=1)
        print(f"  1 秒内完成: {result.stdout[:50]}")
    except subprocess.TimeoutExpired:
        print("  ⏱️  1 秒超时！进程被杀\\n")


# ===== Demo 4：shell=True 的危险 =====
def demo_shell_danger():
    print("=== Demo 4: shell=True 的危险 ===")

    user_input = "file.txt; rm -rf ~"  # 恶意输入

    # ❌ 危险写法
    print("  危险写法（shell=True + 字符串拼接）:")
    print(f"    命令: ls {user_input}")
    print("    实际执行: ls file.txt; rm -rf ~ （删你整个 home 目录！）\\n")

    # ✅ 安全写法
    print("  安全写法（参数列表）:")
    print(f"    命令: ['ls', '{user_input}']")
    # subprocess.run(["ls", user_input])  # 这里不真跑
    print("    实际执行: ls 'file.txt; rm -rf ~'（当成一个文件名，不会执行 rm）\\n")


# ===== Demo 5：check=True 处理错误 =====
def demo_check():
    print("=== Demo 5: check=True ===")

    # 故意用一个会失败的命令
    result = subprocess.run(
        ["ls", "/nonexistent_path_xyz"],
        capture_output=True, text=True
    )
    print(f"  不 check: returncode={result.returncode}, stderr={result.stderr.strip()[:50]}")

    # 用 check=True
    try:
        result = subprocess.run(
            ["ls", "/nonexistent_path_xyz"],
            capture_output=True, text=True, check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"  check=True 抛异常: {e}\\n")


# ===== Demo 6：subprocess + multiprocessing 批量执行 =====
def run_external(cmd_args):
    """执行一个外部命令，返回结果"""
    try:
        result = subprocess.run(
            cmd_args,
            capture_output=True, text=True, timeout=5
        )
        return {"cmd": cmd_args, "success": result.returncode == 0, "output": result.stdout.strip()[:100]}
    except Exception as e:
        return {"cmd": cmd_args, "success": False, "error": str(e)}


def demo_batch():
    print("=== Demo 6: subprocess + multiprocessing 批量执行 ===")

    if sys.platform == "win32":
        cmds = [["cmd", "/c", "echo", f"task {i}"] for i in range(8)]
    else:
        cmds = [["echo", f"task {i}"] for i in range(8)]

    start = time.time()
    with multiprocessing.Pool(4) as pool:
        results = pool.map(run_external, cmds)
    elapsed = time.time() - start

    success_count = sum(1 for r in results if r["success"])
    print(f"  执行 {len(cmds)} 个外部命令，耗时 {elapsed:.2f}s")
    print(f"  成功: {success_count}/{len(cmds)}")
    for r in results[:3]:
        print(f"    {r['cmd']} -> {r.get('output', r.get('error'))}")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"Python 解释器 pid: {os.getpid()}\\n")

    demo_basic()
    demo_capture()
    demo_timeout()
    demo_shell_danger()
    demo_check()
    demo_batch()

    print("=== 总结 ===")
    print("• subprocess 用于调用外部命令（ffmpeg、ls 等）")
    print("• subprocess.run() 是最常用的入口")
    print("• capture_output=True 捕获输出，text=True 文本模式")
    print("• timeout=N 限时，check=True 出错抛异常")
    print("• 不要用 shell=True + 字符串拼接（命令注入）")
    print("• subprocess + multiprocessing 可以批量并行执行外部命令")
`,
  },

  // =========================================================
  // 第二十三章：10 个最常见的多进程 bug 与修复
  // =========================================================
  {
    id: "mp-23",
    group: "实战与陷阱",
    icon: "🪲",
    title: "10 个最常见的多进程 bug 与修复",
    content: `## 一、Bug 1：忘 \`if __name__ == "__main__":\`

**症状**：spawn 模式下报 \`RuntimeError: An attempt has been made to start a new process before the current process has finished its bootstrap\`

**修复**：

\`\`\`python
# ✅ 启动代码包在 main 块里
if __name__ == "__main__":
    pool = multiprocessing.Pool(4)
    pool.map(work, tasks)
\`\`\`

## 二、Bug 2：lambda / 嵌套函数不能 pickle

**症状**：\`AttributeError: Can't pickle local object\` 或 \`PicklingError\`

**修复**：

\`\`\`python
# ❌ lambda
pool.map(lambda x: x * 2, data)

# ✅ 普通函数
def double(x):
    return x * 2
pool.map(double, data)
\`\`\`

## 三、Bug 3：忘 join

**症状**：主进程提前结束，子进程被强杀，任务没做完

**修复**：用 with 语句管理 Pool / Process

\`\`\`python
# ✅ with 自动 close + join
with multiprocessing.Pool(4) as pool:
    results = pool.map(work, tasks)
\`\`\`

## 四、Bug 4：共享全局状态

**症状**：修改子进程里的全局变量，主进程看不到

**原因**：进程内存隔离

**修复**：用 Queue、Pipe、Value、Manager 显式通信

\`\`\`python
# ❌
GLOBAL_VAR = 0
def worker():
    global GLOBAL_VAR
    GLOBAL_VAR = 100  # 只改子进程内的

# ✅
shared = multiprocessing.Value('i', 0)
def worker(shared):
    with shared.get_lock():
        shared.value = 100
\`\`\`

## 五、Bug 5：跨机器共享 Value/Array

**症状**：\`，Value\` 只能在一台机器上共享，跨机器不工作

**修复**：跨机器用 socket、消息队列（Redis、Kafka）

## 六、Bug 6：daemon 进程做重要事

**症状**：主进程退出时 daemon 进程被强杀，数据没写完

**修复**：

\`\`\`python
# ❌ 重要任务用 daemon
p = Process(target=write_to_db, daemon=True)

# ✅ 重要任务不要 daemon
p = Process(target=write_to_db, daemon=False)
p.join()  # 显式等
\`\`\`

## 七、Bug 7：进程死锁

**症状**：程序卡住不动

**修复**：按固定顺序加锁

\`\`\`python
# ✅ 所有进程都先 lock_a 再 lock_b
with lock_a:
    with lock_b:
        do_work()
\`\`\`

## 八、Bug 8：死锁 + 永久 join

**症状**：\`.join()\` 永远不返回

**修复**：用 timeout 防止永久阻塞

\`\`\`python
# ✅ join 限时
p.join(timeout=10)
if p.is_alive():
    print("超时了，强制终止")
    p.terminate()
\`\`\`

## 九、Bug 9：子进程吃光内存

**症状**：开 100 个进程，每个加载 1GB 数据，机器 OOM

**修复**：
1. 用 Pool 限制进程数
2. 减小任务数据量
3. 用 \`maxtasksperchild\` 限制每个进程跑多少任务后重启
4. 监控内存（\`psutil\`）

\`\`\`python
pool = multiprocessing.Pool(processes=4, maxtasksperchild=10)
\`\`\`

## 十、Bug 10：Platform 不一致

**症状**：开发机（macOS）跑得好，部署到 Linux 上崩

**修复**：用 spawn 模式保持一致

\`\`\`python
ctx = multiprocessing.get_context("spawn")
with ctx.Pool(4) as pool:
    ...
\`\`\`

## 十一、Bonus Bug 11：subprocess 注入

**症状**：用户输入被当命令执行

**修复**：

\`\`\`python
# ❌
subprocess.run(f"ls {user_input}", shell=True)

# ✅
subprocess.run(["ls", user_input])
\`\`\`

## 十二、本章 demo

下面 demo 演示每个 bug 的最小复现 + 修复。
`,
    code: `"""
第二十三章 demo：10 个常见多进程 bug 与修复
每个 demo 演示：最小复现 → 解释 → 修复
"""

import multiprocessing
import os
import time


# ===== Bug 1: 忘 main 块（spawn 模式下递归启动） =====
def bug1_no_main_block():
    print("=== Bug 1: 忘 main 块 ===")
    print("  spawn 模式下，没 main 块 → 子进程重新 import → 递归启动")
    print("  修复：把启动代码放 if __name__ == '__main__' 里")
    print("  （本 demo 不演示崩溃，避免卡住）\\n")


# ===== Bug 2 修复用的模块顶层函数 =====
def bug2_double(x):
    """模块顶层定义的普通函数，能被 pickle（替代 lambda）"""
    return x * 2


# ===== Bug 3 修复用的模块顶层函数 =====
def bug3_sleep_worker():
    """模块顶层定义的 sleep worker（替代 lambda）"""
    time.sleep(1)


# ===== Bug 4: 共享全局变量不生效 =====
GLOBAL_VAR = 0


# ===== Bug 4 的模块顶层 worker =====
def bug4_worker():
    """修改全局变量的子进程 worker（必须模块顶层定义才能 pickle）"""
    global GLOBAL_VAR
    GLOBAL_VAR = 100
    print(f"  [子进程] GLOBAL_VAR = {GLOBAL_VAR}")


# ===== Bug 7 & 8 的模块顶层 worker =====
def bug7_worker_ab(la, lb):
    """死锁演示 worker1：A→B 顺序加锁（必须模块顶层定义才能 pickle）"""
    with la:
        time.sleep(0.2)
        with lb:
            pass


def bug7_worker_ba(lb, la):
    """死锁演示 worker2：B→A 顺序加锁（必须模块顶层定义才能 pickle）"""
    with lb:
        time.sleep(0.2)
        with la:
            pass


# ===== Bug 2: lambda 不能 pickle =====
def bug2_lambda():
    print("=== Bug 2: lambda 不能 pickle ===")
    if __name__ != "__main__":
        return

    try:
        with multiprocessing.Pool(2) as pool:
            pool.map(lambda x: x * 2, [1, 2, 3])
    except Exception as e:
        print(f"  ❌ {type(e).__name__}: {str(e)[:80]}")

    # 修复：用模块顶层定义的普通函数
    with multiprocessing.Pool(2) as pool:
        results = pool.map(bug2_double, [1, 2, 3])
    print(f"  ✅ 修复后: {results}\\n")


# ===== Bug 3: 忘 join =====
def bug3_no_join():
    print("=== Bug 3: 忘 join ===")
    if __name__ != "__main__":
        return

    print("  子进程跑 1 秒，但主进程不 join 直接走")
    p = multiprocessing.Process(target=bug3_sleep_worker)
    p.start()
    print("  [主进程] 没 join 就继续了")
    p.join()  # 修复：加上 join
    print(f"  ✅ 修复后正常: is_alive={p.is_alive()}\\n")


# ===== Bug 4: 共享全局变量不生效 =====
def bug4_global_var():
    print("=== Bug 4: 共享全局变量不生效 ===")
    if __name__ != "__main__":
        return

    p = multiprocessing.Process(target=bug4_worker)
    p.start()
    p.join()
    print(f"  [主进程] GLOBAL_VAR = {GLOBAL_VAR}（还是 0！）")
    print("  修复：用 Value/Queue 显式共享\\n")


# ===== Bug 5: 跨机器共享 Value =====
def bug5_cross_machine():
    print("=== Bug 5: 跨机器共享 Value ===")
    print("  Value/Array 只能在同一台机器的进程间共享")
    print("  跨机器：用 socket、Redis、Kafka 等\\n")


# ===== Bug 6: daemon 做重要事 =====
def bug6_daemon_critical():
    print("=== Bug 6: daemon 做重要事 ===")
    print("  daemon 进程在主进程退出时被强杀，没机会清理")
    print("  重要任务：daemon=False + 显式 join\\n")


# ===== Bug 7 & 8: 死锁 =====
def bug7_deadlock():
    print("=== Bug 7 & 8: 死锁 ===")
    if __name__ != "__main__":
        return

    la = multiprocessing.Lock()
    lb = multiprocessing.Lock()

    p1 = multiprocessing.Process(target=bug7_worker_ab, args=(la, lb))
    p2 = multiprocessing.Process(target=bug7_worker_ba, args=(lb, la))
    p1.start()
    p2.start()
    p1.join(timeout=1)
    p2.join(timeout=1)
    if p1.is_alive() or p2.is_alive():
        print("  ⚠️  死锁了！")
        p1.terminate()
        p2.terminate()
        p1.join()
        p2.join()
    print("  修复：所有进程都按相同顺序加锁\\n")


# ===== Bug 9: 进程吃光内存 =====
def bug9_memory():
    print("=== Bug 9: 进程吃光内存 ===")
    print("  ❌ Process() × 1000")
    print("  ✅ Pool(processes=4, maxtasksperchild=10)")
    print("  ✅ 控制数据规模")
    print("  ✅ 监控内存（psutil）\\n")


# ===== Bug 10: 平台不一致 =====
def bug10_platform():
    print("=== Bug 10: 平台不一致 ===")
    print("  macOS 默认 spawn，Linux 默认 fork")
    print("  跨平台：用 get_context('spawn') 强制一致")
    ctx = multiprocessing.get_context("spawn")
    print(f"  当前上下文: {ctx.get_start_method()}\\n")


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}\\n")

    bug1_no_main_block()
    bug2_lambda()
    bug3_no_join()
    bug4_global_var()
    bug5_cross_machine()
    bug6_daemon_critical()
    bug7_deadlock()
    bug9_memory()
    bug10_platform()

    print("=== 总结 ===")
    print("10 个最常见 bug + 修复：")
    print("  1. 忘 main 块 → 包 if __name__ == '__main__'")
    print("  2. lambda → 用 def")
    print("  3. 忘 join → with 语句")
    print("  4. 全局变量不共享 → Value/Queue")
    print("  5. 跨机器 → socket/Redis")
    print("  6. daemon 做重要事 → daemon=False + join")
    print("  7. 死锁 → 固定顺序加锁")
    print("  8. 永久 join → 用 timeout")
    print("  9. 内存爆 → Pool 限进程数 + maxtasksperchild")
    print(" 10. 平台不一致 → get_context('spawn')")
`,
  },

  // =========================================================
  // 第二十四章：选型指南与最佳实践总结
  // =========================================================
  {
    id: "mp-24",
    group: "实战与陷阱",
    icon: "🎯",
    title: "选型指南与最佳实践总结",
    content: `## 一、选型决策树

拿到一个并发任务，按这个流程决策：

\`\`\`text
你的任务是什么类型？
    │
    ├─ IO 密集（网络、文件、DB）
    │   │
    │   ├─ 并发量大（> 100 个等待）→ asyncio
    │   ├─ 并发量小（< 100 个等待）→ 多线程
    │   └─ 调用外部程序 → subprocess
    │
    ├─ CPU 密集（计算、加密、解码）
    │   │
    │   ├─ 任务数 < CPU 核数 → Process × N
    │   ├─ 任务数 >> CPU 核数 → Pool
    │   └─ 极简场景 → concurrent.futures.ProcessPoolExecutor
    │
    └─ 混合型（IO + CPU）
        │
        ├─ 两阶段清晰 → 双池（线程抓 + 进程算）
        └─ 复杂流水线 → 自研消息队列
\`\`\`

## 二、并发方案速查表

| 方案 | 适合 | 不适合 | 复杂度 |
|------|------|--------|--------|
| **单进程** | 简单脚本、低并发 | CPU 密集 + 大量任务 | ⭐ |
| **多线程** | IO 密集、< 100 并发 | CPU 密集（GIL） | ⭐⭐ |
| **多进程** | CPU 密集、任务独立 | 任务数 << 进程数、跨机器 | ⭐⭐⭐ |
| **进程池** | CPU 密集 + 大量任务 | 任务需要长期运行 | ⭐⭐ |
| **asyncio** | 高并发 IO（> 100） | CPU 密集、阻塞库 | ⭐⭐⭐ |
| **subprocess** | 调外部命令 | 自己写并发逻辑 | ⭐⭐ |
| **分布式** | 跨机器、TB 级数据 | 小数据 | ⭐⭐⭐⭐ |

## 三、multiprocessing 最佳实践（10 条）

### 1. 永远用 \`if __name__ == "__main__":\`

\`\`\`python
if __name__ == "__main__":
    pool = multiprocessing.Pool(4)
    ...
\`\`\`

### 2. 用 spawn 保持跨平台一致

\`\`\`python
ctx = multiprocessing.get_context("spawn")
pool = ctx.Pool(4)
\`\`\`

### 3. 用 with 管理 Pool / Process

\`\`\`python
with multiprocessing.Pool(4) as pool:
    results = pool.map(work, data)
\`\`\`

### 4. 进程数 = CPU 核数（CPU 密集）

\`\`\`python
NUM_WORKERS = multiprocessing.cpu_count()
\`\`\`

### 5. 任务函数内部捕获异常

\`\`\`python
def robust_task(x):
    try:
        return process(x)
    except Exception as e:
        return {"error": str(e)}
\`\`\`

### 6. 不用全局变量共享数据

用 Queue / Value / Manager。

### 7. maxtasksperchild 防内存泄漏

\`\`\`python
pool = multiprocessing.Pool(4, maxtasksperchild=100)
\`\`\`

### 8. chunksize 优化性能

\`\`\`python
pool.map(work, big_data, chunksize=100)
\`\`\`

### 9. 早停机制

找到答案就 \`pool.terminate()\`，别让空跑的进程浪费时间。

### 10. 监控和日志

每个子进程要打印 PID + 任务标识，方便排查。

## 四、调试技巧

### 1. 加 PID 打印

\`\`\`python
def worker(x):
    print(f"[pid={os.getpid()}] 处理 {x}")
\`\`\`

### 2. 用 logging 模块

\`\`\`python
import logging
logger = multiprocessing.log_to_stderr(logging.DEBUG)
\`\`\`

### 3. 简单任务先串行实现

把多进程逻辑做对之前，先用单进程跑通。

### 4. 小数据集测并发

先在 4 个任务上验证逻辑，再扩展到 1000 个。

### 5. 加超时保护

\`\`\`python
ar = pool.apply_async(work, (x,))
try:
    ar.get(timeout=10)
except multiprocessing.TimeoutError:
    pool.terminate()
\`\`\`

## 五、性能优化的层次

按"性价比"从高到低：

1. **算法优化**：O(n²) → O(n log n) 比任何并发都管用
2. **缓存**：重复计算结果缓存
3. **避免不需要的并发**：很多场景单进程够用
4. **IO 用 asyncio / 线程**：比多进程轻量
5. **CPU 用多进程**：最后才上
6. **分布式**：单机扛不住再考虑

## 六、本章 demo

最后这个 demo 是一个**综合实战**：模拟"日志分析器"——多进程并行处理多个日志文件，统计每种错误码的数量。
`,
    code: `"""
第二十四章 demo：综合实战 —— 多进程日志分析器
场景：分析 20 个日志文件，统计 ERROR 数量
对比：单进程 vs 多进程 Pool
展示完整的多进程最佳实践
"""

import multiprocessing
import os
import time
import random
import json
from collections import Counter


# ===== 模拟日志生成 =====
def generate_log_file(path: str, num_lines: int = 1000):
    """生成一个模拟日志文件"""
    levels = ["INFO", "WARN", "ERROR", "DEBUG"]
    weights = [70, 20, 5, 5]  # ERROR 5%

    with open(path, "w") as f:
        for i in range(num_lines):
            level = random.choices(levels, weights=weights)[0]
            msg = f"2024-01-01 10:00:{i:02d} {level} some log message {i}"
            f.write(msg + "\\n")


# ===== 多进程安全的日志分析 =====
def analyze_log_file(path: str) -> dict:
    """
    分析一个日志文件，统计各级别数量。
    这是个 IO + CPU 混合任务（读文件 + 计数）。
    """
    pid = os.getpid()
    level_counts = Counter()

    try:
        with open(path, "r") as f:
            for line in f:
                # 简单的 level 提取（CPU 密集部分）
                for level in ["INFO", "WARN", "ERROR", "DEBUG"]:
                    if level in line:
                        level_counts[level] += 1
                        break

        return {
            "file": os.path.basename(path),
            "pid": pid,
            "counts": dict(level_counts),
            "error": None,
        }
    except Exception as e:
        return {
            "file": os.path.basename(path),
            "pid": pid,
            "counts": None,
            "error": str(e),
        }


def aggregate_results(results: list) -> dict:
    """聚合所有文件的结果"""
    total = Counter()
    pids = set()
    errors = []

    for r in results:
        pids.add(r["pid"])
        if r["error"]:
            errors.append((r["file"], r["error"]))
        elif r["counts"]:
            for level, count in r["counts"].items():
                total[level] += count

    return {
        "total": dict(total),
        "files_processed": len(results),
        "workers_used": len(pids),
        "errors": errors,
    }


# ===== 串行版 =====
def analyze_serial(files):
    return [analyze_log_file(f) for f in files]


# ===== 并行版（用 best practices） =====
def analyze_parallel(files):
    """
    用多进程 Pool 分析日志文件。
    应用的最佳实践：
    1. 启动方式用 spawn（跨平台一致）
    2. Pool 限进程数（= CPU 核数）
    3. maxtasksperchild 防内存泄漏
    4. with 自动管理
    5. 任务内部捕获异常
    6. chunksize 优化
    """
    ctx = multiprocessing.get_context("spawn")
    num_workers = ctx.cpu_count()

    with ctx.Pool(
        processes=num_workers,
        maxtasksperchild=10,
    ) as pool:
        # imap_unordered：边完成边返回，进度可见
        results = list(pool.imap_unordered(
            analyze_log_file, files, chunksize=2
        ))

    return results


# ===== 综合 demo =====
def demo_full_workflow():
    print("=== 综合实战：多进程日志分析器 ===\\n")

    # 1. 准备 20 个模拟日志文件
    print("  步骤 1: 生成 20 个日志文件")
    log_dir = "/tmp/demo_logs"
    os.makedirs(log_dir, exist_ok=True)
    files = []
    for i in range(20):
        path = os.path.join(log_dir, f"app-{i}.log")
        generate_log_file(path, num_lines=2000)
        files.append(path)
    print(f"    生成 {len(files)} 个文件\\n")

    # 2. 串行分析
    print("  步骤 2: 串行分析")
    start = time.time()
    results = analyze_serial(files)
    serial_time = time.time() - start
    summary = aggregate_results(results)
    print(f"    耗时: {serial_time:.2f}s")
    print(f"    统计: {summary['total']}\\n")

    # 3. 并行分析
    print("  步骤 3: 并行分析（spawn Pool）")
    start = time.time()
    results = analyze_parallel(files)
    parallel_time = time.time() - start
    summary = aggregate_results(results)
    print(f"    耗时: {parallel_time:.2f}s")
    print(f"    用了 {summary['workers_used']} 个 worker 进程")
    print(f"    统计: {summary['total']}")
    print(f"    加速比: {serial_time / parallel_time:.1f}x\\n")

    # 4. 清理
    print("  步骤 4: 清理临时文件")
    for f in files:
        os.remove(f)
    os.rmdir(log_dir)
    print("    ✅ 清理完成\\n")


# ===== 选型指南 demo =====
def demo_decision_tree():
    print("=== 选型决策树（速查）===\\n")
    print("  任务类型       推荐方案              原因")
    print("  ─────────────────────────────────────────────")
    print("  简单脚本       单进程               无并发需求")
    print("  IO 密集 + 低并发  多线程            GIL 不影响")
    print("  IO 密集 + 高并发  asyncio            单线程 + 协程")
    print("  CPU 密集       多进程 / Pool        突破 GIL")
    print("  调用外部命令    subprocess           fork + exec")
    print("  跨机器         分布式（Celery）      共享存储")
    print()


# ===== 主程序 =====
if __name__ == "__main__":
    print(f"主进程 pid = {os.getpid()}")
    print(f"本机 CPU 核数: {multiprocessing.cpu_count()}\\n")

    demo_decision_tree()
    demo_full_workflow()

    print("=" * 50)
    print("《Python 多进程教程》完结 🎉")
    print("=" * 50)
    print("\\n你已经学会了：")
    print("  ✓ 多进程基础（Process、start、join、daemon）")
    print("  ✓ 进程间通信（Queue、Pipe、Manager、Value/Array、Lock）")
    print("  ✓ 进程池（Pool、apply、map、imap、回调、超时）")
    print("  ✓ 实战（图片处理、密码破解、混合任务、subprocess）")
    print("  ✓ 10 个常见 bug + 修复")
    print("  ✓ 选型指南和最佳实践")
    print("\\n接下来建议：")
    print("  → 在自己的项目里挑一个 CPU 密集任务用多进程改造")
    print("  → 用 profile / cProfile 验证多进程真的快了")
    print("  → 探索 concurrent.futures（API 更现代）")
    print("  → 进一步学分布式（Celery、Ray、Dask）")
`,
  },
];
