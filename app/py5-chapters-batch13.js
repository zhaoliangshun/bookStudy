export const chapters = [
  {
    id: "py5-threading",
    group: "并发与网络",
    icon: "🧵",
    title: "threading 多线程",
    content: `## 概述
threading 模块提供基于线程的并发，适合 I/O 密集型任务。受 GIL 限制，CPU 密集型并行需用 multiprocessing。

## 核心要点
- **创建线程**: \`threading.Thread(target=fn, args=(...))\` - 传入函数与参数
- **启动与等待**: \`t.start()\` 启动、\`t.join()\` 阻塞主线程至子线程结束
- **互斥锁**: \`with lock:\` 保护临界区，避免 race condition
- **线程局部**: \`threading.local()\` 提供线程独立数据隔离
- **线程池**: \`ThreadPoolExecutor(max_workers=N)\` 简化资源管理
- **map 与 submit**: \`pool.map(fn, iter)\` 批量并行；\`submit(fn)\` 返回 Future
- **守护线程**: \`t.daemon=True\` 主线程退出时自动结束
- **Event/Condition**: 线程间事件通知与条件等待

## 原理与机制
- **GIL**: 全局解释器锁使同一时刻仅一个线程执行 Python 字节码，CPU 密集任务无法真正并行
- **线程切换**: 由操作系统调度，I/O 阻塞时主动释放 GIL 让出执行权
- **锁的代价**: 加锁有开销且可能引发死锁，应优先使用队列或线程安全数据结构
- **PEP 703**: Python 3.13 提供实验性 free-threaded 构建（no-GIL），可绕过 GIL 限制

## 易错点与陷阱
- **共享变量竞态**: 多线程修改全局变量需用 Lock，否则结果不可预期
- **死锁**: 嵌套加锁或锁未释放，应使用 \`with lock:\` 上下文管理自动释放
- **守护线程丢数据**: daemon 线程在主线程退出时被强杀，未完成的工作会丢失
- **CPU 密集误用线程**: 计算循环用线程无法加速，反而因切换变慢

## 实战建议
- **优先用线程池**: ThreadPoolExecutor 比手动管理 Thread 更安全，配合 with 自动 shutdown
- **I/O 密集选线程**: 网络、磁盘、数据库等待场景用 threading；CPU 密集用 multiprocessing
- **数据共享用 Queue**: 队列自带线程安全，避免手工加锁的复杂度`,
    code: `import threading
import time
from concurrent.futures import ThreadPoolExecutor

counter = 0
lock = threading.Lock()

def increment(name):
    global counter
    for _ in range(5):
        with lock:
            counter += 1
            print(f"线程{name}: counter={counter}")
        time.sleep(0.05)

threads = []
for i in range(3):
    t = threading.Thread(target=increment, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"手动线程结束，counter={counter}")

counter = 0
def worker(n):
    global counter
    with lock:
        counter += n
    time.sleep(0.05)
    return n * 2

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(worker, [1, 2, 3, 4]))
    print(f"线程池结果: {results}, counter={counter}")
print("GIL 提示: CPU 密集用多进程，I/O 密集用多线程")
`
  },
  {
    id: "py5-multiprocessing",
    group: "并发与网络",
    icon: "🔄",
    title: "multiprocessing 多进程",
    content: `## 概述
multiprocessing 通过创建独立进程绕过 GIL，实现真正的 CPU 并行计算，是 CPU 密集型任务的正确选择。

## 核心要点
- **创建进程**: \`multiprocessing.Process(target=fn, args=(...))\` - 每个进程独立内存空间
- **进程池**: \`Pool(processes=N)\` 或 \`ProcessPoolExecutor\` 管理工作进程
- **进程间通信**: \`Queue\`、\`Pipe\`、\`Manager\` 提供跨进程数据传递
- **Manager 共享**: \`manager.list()\`/\`manager.dict()\` 创建跨进程共享对象
- **map 方法**: \`pool.map(fn, iterable)\` 自动分片分发，结果按顺序返回
- **入口保护**: 必须用 \`if __name__ == "__main__":\` 守护启动代码
- **启动方式**: fork（Unix）、spawn（跨平台默认 Windows）、forkserver

## 原理与机制
- **独立内存**: 每个进程有自己的 Python 解释器和内存，互不干扰
- **fork vs spawn**: fork 共享父进程内存（写时复制），spawn 全新进程需重新初始化
- **序列化开销**: 进程间传参需 pickle 序列化，大对象传输成本高
- **进程数选择**: 通常等于 CPU 核心数（\`os.cpu_count()\`），过多反而调度开销大

## 易错点与陷阱
- **忘记入口保护**: Windows/macOS spawn 模式下，无 \`__main__\` 保护会无限递归创建进程
- **共享状态陷阱**: 直接传全局变量无效，必须用 Manager 或 Queue 共享
- **死锁与僵尸进程**: 异常未处理导致进程挂起，应用 try/finally 或 context manager
- **大数据 pickle 失败**: lambda、闭包、socket 等无法序列化，需改用顶层函数

## 实战建议
- **优先用进程池**: Pool 或 ProcessPoolExecutor 比手动 Process 更易管理生命周期
- **任务粒度足够大**: 进程创建与序列化有开销，小任务反而比串行慢
- **CPU 密集场景专用**: 纯计算如数值算法、图像处理用多进程；I/O 等待用线程或 asyncio`,
    code: `import multiprocessing
import time

def square(n):
    time.sleep(0.05)
    return n * n

def producer(queue):
    for i in range(3):
        queue.put(f"消息{i}")
        time.sleep(0.05)

def consumer(queue, result_list):
    while True:
        try:
            msg = queue.get(timeout=0.5)
            result_list.append(msg)
        except Exception:
            break

if __name__ == "__main__":
    multiprocessing.set_start_method("fork", force=True)

    q = multiprocessing.Queue()
    manager = multiprocessing.Manager()
    received = manager.list()

    p1 = multiprocessing.Process(target=producer, args=(q,))
    p2 = multiprocessing.Process(target=consumer, args=(q, received))
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    print(f"收到消息: {list(received)}")

    with multiprocessing.Pool(processes=4) as pool:
        nums = [1, 2, 3, 4, 5]
        results = pool.map(square, nums)
        print(f"进程池平方结果: {results}")
    print("多进程适合 CPU 密集计算，不受 GIL 限制")
`
  },
  {
    id: "py5-asyncio",
    group: "并发与网络",
    icon: "⚡",
    title: "asyncio 异步编程",
    content: `## 概述
asyncio 是 Python 单线程并发框架，基于事件循环调度协程，适合大量 I/O 操作（网络、文件、数据库）。

## 核心要点
- **定义协程**: \`async def fn()\` 定义协程函数，调用返回协程对象
- **挂起等待**: \`await expr\` 暂停当前协程，让出事件循环给其他任务
- **创建任务**: \`asyncio.create_task(coro)\` 调度并发执行
- **并发收集**: \`await asyncio.gather(*coros)\` 同时运行多个协程并收集结果
- **队列**: \`asyncio.Queue()\` 协程间安全传递数据，配合 \`task_done()\`/\`join()\`
- **入口运行**: \`asyncio.run(main())\`（3.7+）创建循环、运行、清理
- **TaskGroup**: \`async with asyncio.TaskGroup()\`（3.11+）结构化并发，异常自动取消其他任务

## 原理与机制
- **事件循环**: 单线程循环不断就绪协程，I/O 完成后回调唤醒
- **协作式调度**: 协程主动 \`await\` 让出，无抢占；忘 await 会同步阻塞循环
- **零线程切换**: 协程切换在用户态完成，比线程开销小得多
- **Future 与 Task**: Task 是对协程的调度封装，Future 是底层结果占位
- **GIL 不影响**: 单线程天然无 GIL 争用，I/O 等待时让出 GIL 给其他线程

## 易错点与陷阱
- **忘 await**: \`asyncio.sleep(1)\` 不加 await 不会等待，任务未真正执行
- **阻塞调用**: 协程内调用 \`time.sleep\`、\`requests.get\` 会阻塞整个事件循环
- **混用同步 API**: 阻塞库需用 \`run_in_executor\` 委托给线程池
- **任务未引用**: 创建 task 后未保存引用，可能被 GC 回收而中途取消

## 实战建议
- **统一入口**: 用 \`asyncio.run()\` 而非手动 \`get_event_loop()\`，自动清理资源
- **3.11+ 用 TaskGroup**: 结构化并发比 gather 更安全，异常处理更清晰
- **I/O 密集首选**: 高并发网络请求、爬虫、WebSocket 服务用 asyncio 性能最优`,
    code: `import asyncio

async def fetch_data(name, delay):
    print(f"开始获取 {name}...")
    await asyncio.sleep(delay)
    print(f"完成 {name}")
    return f"{name}_result"

async def worker(name, queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"worker {name} 处理: {item}")
        await asyncio.sleep(0.05)
        queue.task_done()

async def main():
    results = await asyncio.gather(
        fetch_data("A", 0.1),
        fetch_data("B", 0.05),
        fetch_data("C", 0.08),
    )
    print(f"gather 结果: {results}")

    queue = asyncio.Queue()
    tasks = [asyncio.create_task(worker(str(i), queue)) for i in range(2)]
    for item in ["x", "y", "z"]:
        await queue.put(item)
    await queue.join()
    for _ in tasks:
        await queue.put(None)
    await asyncio.gather(*tasks)
    print("asyncio 异步任务全部完成")

asyncio.run(main())
`
  },
  {
    id: "py5-socket-http",
    group: "并发与网络",
    icon: "🌐",
    title: "socket 与 HTTP",
    content: `## 概述
socket 是网络通信底层抽象，HTTP 基于其上构建。Python 标准库提供 socket、http.server、urllib 完整工具链。

## 核心要点
- **创建套接字**: \`socket.socket(AF_INET, SOCK_STREAM)\` 建立 IPv4 TCP socket
- **服务端四步**: \`bind((host,port))\` → \`listen(backlog)\` → \`accept()\` → \`recv()/sendall()\`
- **客户端三步**: \`connect((host,port))\` → \`sendall(data)\` → \`recv(bufsize)\`
- **SO_REUSEADDR**: \`setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)\` 重启时复用端口
- **HTTP 服务器**: \`HTTPServer((host,port), Handler)\` + \`BaseHTTPRequestHandler\` 自定义路由
- **路由方法**: 重写 \`do_GET\`/\`do_POST\` 处理不同 HTTP 方法
- **HTTP 客户端**: \`urllib.request.urlopen(url)\` 简易请求，返回类文件对象
- **守护线程**: \`Thread(..., daemon=True)\` 让服务随主线程退出自动结束

## 原理与机制
- **TCP 三次握手**: connect 触发握手，accept 返回已建立的连接 socket
- **字节流传输**: TCP 是字节流，需自行处理消息边界（如长度前缀、分隔符）
- **HTTP 协议**: 请求行 + 头部 + 空行 + body，响应同样格式
- **端口与地址**: 端口范围 0-65535，<1024 需 root 权限；0.0.0.0 监听所有网卡

## 易错点与陷阱
- **端口占用**: 未设 SO_REUSEADDR 时重启服务报 \`Address already in use\`
- **recv 阻塞**: 一次 recv 不一定收到完整消息，需循环读取或按长度读取
- **忘记 close**: socket 未关闭导致资源泄漏，应用 \`with\` 或 try/finally
- **编码问题**: 网络传输字节，必须用 \`.encode()\`/\`.decode()\` 转 str

## 实战建议
- **生产用框架**: 标准库适合演示，生产环境用 requests/httpx/aiohttp 更健壮
- **服务端并发**: HTTPServer 单线程，多连接需 ThreadingHTTPServer 或 asyncio 服务器
- **测试用 mock**: 单元测试避免真实端口，可用 mock 或临时端口（port=0 自动分配）`,
    code: `import socket
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request

def tcp_echo_server(host, port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(1)
    conn, addr = server.accept()
    data = conn.recv(1024)
    conn.sendall(b"echo: " + data)
    conn.close()
    server.close()

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Hello from http.server!")
    def log_message(self, *args):
        pass

threading.Thread(target=tcp_echo_server, args=("127.0.0.1", 9999), daemon=True).start()
time.sleep(0.1)

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(("127.0.0.1", 9999))
client.sendall(b"hello")
resp = client.recv(1024)
print(f"TCP echo 响应: {resp.decode()}")
client.close()

httpd = HTTPServer(("127.0.0.1", 9998), SimpleHandler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
time.sleep(0.1)

with urllib.request.urlopen("http://127.0.0.1:9998/") as r:
    print(f"HTTP 响应: {r.read().decode()}")
httpd.shutdown()
print("Socket 和 HTTP 演示完成")
`
  }
];
