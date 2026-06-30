export const chapters = [
  {
    id: "py5-threading",
    group: "并发与网络",
    icon: "🧵",
    title: "threading 多线程",
    content: `- threading.Thread 创建线程，target 指定函数，args 传参
- start() 启动，join() 等待线程结束
- Lock 互斥锁防止竞态条件（race condition）
- concurrent.futures.ThreadPoolExecutor 线程池简化管理
- GIL（全局解释器锁）限制 CPU 密集型并行，但适合 I/O 密集型`,
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
    content: `- multiprocessing.Process 创建独立进程，绕过 GIL
- ProcessPoolExecutor 进程池，适合 CPU 密集任务
- Queue 用于进程间通信（IPC），pipe 也可用
- 必须使用 if __name__ == "__main__" 保护入口
- 每个进程有独立内存空间，不共享全局变量`,
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
    content: `- async def 定义协程，await 挂起等待异步操作
- asyncio.create_task() 创建并发任务
- asyncio.gather() 并发运行多个协程并收集结果
- asyncio.sleep() 模拟 I/O 等待（不阻塞事件循环）
- 单线程并发，适合大量 I/O 操作（网络请求、文件读写）`,
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
    content: `- socket.socket() 创建 TCP/UDP 套接字
- socket.AF_INET + SOCK_STREAM 为 TCP
- http.server 模块可快速搭建简易 HTTP 服务器
- urllib.request 发送 HTTP 请求
- 服务端放守护线程中运行，主线程测试后快速退出`,
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
