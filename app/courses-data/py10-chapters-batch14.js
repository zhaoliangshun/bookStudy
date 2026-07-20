// =============================================================
// Python 从入门到精通大全（终极版）—— 第14批章节
// 第十四部分 网络与数据库（共 5 章）
// =============================================================

const chapters = [
  {
    id: "py10-ch66",
    group: "第十四部分 网络与数据库",
    icon: "🔌",
    title: "第六十六章 socket 网络编程",
    content: `

# 第六十六章 socket 网络编程

## 一、socket 是什么

socket（套接字）是操作系统提供的网络通信抽象，应用程序通过 socket API 收发数据。Python 的 \`socket\` 模块是对 BSD socket 的薄封装，是所有高级网络库的基础。

socket 的核心三要素：
- **地址族**：AF_INET（IPv4）、AF_INET6（IPv6）、AF_UNIX（Unix 域）
- **类型**：SOCK_STREAM（TCP 流式）、SOCK_DGRAM（UDP 数据报）
- **协议**：通常由系统自动选择

\`\`\`python
import socket


# 查看 socket 模块的关键常量
# WHY: 理解这些常量是阅读 socket 代码的基础
print("AF_INET =", socket.AF_INET)        # IPv4
print("AF_INET6 =", socket.AF_INET6)      # IPv6
print("SOCK_STREAM =", socket.SOCK_STREAM)  # TCP
print("SOCK_DGRAM =", socket.SOCK_DGRAM)   # UDP

# 创建一个 TCP IPv4 socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(f"socket 对象: {s}")
print(f"地址族: {s.family}")
print(f"类型: {s.type}")
s.close()  # 用完必须关闭，否则文件描述符泄漏

# with 语法自动关闭（推荐）
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    print("with 块内可用")
# 离开 with 自动 close

\`\`\`

## 二、TCP 客户端

TCP 是面向连接、可靠传输的协议。客户端流程：创建 socket → connect → send/recv → close。

\`\`\`python
import socket


def tcp_client(host: str, port: int, message: str) -> str:
    """简单的 TCP 客户端"""
    # 创建 TCP socket
    # WHY: SOCK_STREAM 表示 TCP，保证数据有序可靠到达
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        # 设置超时，避免无限等待
        s.settimeout(5.0)
        try:
            # 三次握手建立连接
            s.connect((host, port))
            # 发送数据，sendall 会一直发直到全部发出
            # WHY: send 可能只发一部分，sendall 自动循环发送
            s.sendall(message.encode("utf-8"))
            # 接收响应，1024 是缓冲区大小
            data = s.recv(1024)
            return data.decode("utf-8")
        except (socket.timeout, OSError) as e:
            return f"连接失败: {e}"


# 尝试连接 example.com 的 80 端口
result = tcp_client("example.com", 80, "GET / HTTP/1.0\\r\\nHost: example.com\\r\\n\\r\\n")
print(result[:200])

\`\`\`

## 三、TCP 服务器

TCP 服务器流程：bind → listen → accept → 处理 → close。

\`\`\`python
import socket
import threading
import time


def tcp_server(host: str = "127.0.0.1", port: int = 0) -> tuple[str, int]:
    """启动一个回显 TCP 服务器，返回实际监听地址"""
    # SO_REUSEADDR 让服务器重启时能立即复用端口
    # WHY: 不加这个，TIME_WAIT 状态会阻止端口复用
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # port=0 让系统分配可用端口
    server.bind((host, port))
    server.listen(5)  # 5 是等待队列长度
    actual_addr = server.getsockname()
    print(f"[服务器] 监听 {actual_addr}")

    def handle_client(conn, addr):
        try:
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                # 回显
                conn.sendall(data)
        finally:
            conn.close()

    def accept_loop():
        while not stop_flag[0]:
            try:
                server.settimeout(0.5)
                conn, addr = server.accept()
                # 每个连接开一个线程处理
                # WHY: 多线程让服务器能同时服务多个客户端
                threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
            except socket.timeout:
                continue
        server.close()

    stop_flag = [False]
    threading.Thread(target=accept_loop, daemon=True).start()
    return actual_addr, stop_flag


# 启动服务器
addr, stop_flag = tcp_server()

# 测试客户端
import socket
with socket.socket() as c:
    c.connect(addr)
    c.sendall(b"hello socket")
    print("收到:", c.recv(1024).decode())

stop_flag[0] = True
time.sleep(0.6)

\`\`\`

## 四、UDP 客户端与服务器

UDP 是无连接、不可靠但快速的协议，适合视频流、DNS 查询等场景。

\`\`\`python
import socket
import threading
import time


def udp_server(host: str = "127.0.0.1", port: int = 0):
    """UDP 回显服务器"""
    # UDP 不需要 listen/accept，直接 recvfrom
    # WHY: UDP 无连接，每个数据报自带目标地址
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind((host, port))
    addr = s.getsockname()
    print(f"[UDP 服务器] 监听 {addr}")

    stop = {"flag": False}
    def loop():
        s.settimeout(0.5)
        while not stop["flag"]:
            try:
                data, client = s.recvfrom(1024)
                # 回显
                s.sendto(data, client)
            except socket.timeout:
                continue
        s.close()

    threading.Thread(target=loop, daemon=True).start()
    return addr, stop


# UDP 客户端
def udp_client(server_addr, message: str) -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(2.0)
    try:
        # UDP 不需要 connect，直接 sendto
        s.sendto(message.encode(), server_addr)
        data, _ = s.recvfrom(1024)
        return data.decode()
    finally:
        s.close()


addr, stop = udp_server()
time.sleep(0.2)
resp = udp_client(addr, "hello udp")
print(f"客户端收到: {resp}")
stop["flag"] = True
time.sleep(0.6)

\`\`\`

## 五、socket 常用方法

\`\`\`python
import socket


# 创建一个 socket 探索其方法
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# bind: 绑定地址
# listen: 开始监听（仅服务端）
# accept: 等待连接（仅服务端，阻塞）
# connect: 主动连接（仅客户端）
# connect_ex: 连接失败返回错误码而非抛异常
# send / sendall: 发送数据
# recv: 接收数据
# sendto / recvfrom: UDP 收发
# settimeout: 设置超时
# setblocking: 设置阻塞模式
# fileno: 返回文件描述符
# getpeername: 获取对端地址（已连接）
# getsockname: 获取本端地址
# shutdown: 关闭读/写通道
# close: 关闭 socket

# 非阻塞模式示例
s.setblocking(False)
# WHY: 非阻塞 socket 配合 select/epoll 实现高并发服务器
try:
    s.connect(("127.0.0.1", 9999))
except BlockingIOError:
    # 非阻塞 connect 立即返回，连接在后台进行
    print("连接进行中（非阻塞模式）")
s.close()

# getaddrinfo: 域名解析
# WHY: 一个域名可能解析到多个地址，getaddrinfo 返回全部
infos = socket.getaddrinfo("example.com", 80)
for family, type_, proto, canon, sockaddr in infos[:3]:
    print(f"  family={family}, type={type_}, addr={sockaddr}")

\`\`\`

## 六、地址族与类型对比

| 地址族 | 用途 | 示例地址 |
|--------|------|---------|
| AF_INET | IPv4 | 127.0.0.1 |
| AF_INET6 | IPv6 | ::1 |
| AF_UNIX | 本机 IPC | /tmp/socket |

| 类型 | 协议 | 特点 |
|------|------|------|
| SOCK_STREAM | TCP | 可靠、有序、面向连接 |
| SOCK_DGRAM | UDP | 不可靠、无连接、快速 |
| SOCK_RAW | 原始 | 自定义协议头，需 root |

\`\`\`python
import socket


# 同时支持 IPv4 和 IPv6 的客户端
def connect_any(host: str, port: int) -> socket.socket | None:
    # getaddrinfo 返回所有可用地址族
    # WHY: 现代 client 应同时支持 v4/v6，按系统优先级选择
    for family, type_, proto, canon, sockaddr in socket.getaddrinfo(host, port):
        try:
            s = socket.socket(family, type_, proto)
            s.settimeout(3.0)
            s.connect(sockaddr)
            return s
        except OSError:
            s.close()
            continue
    return None


s = connect_any("example.com", 80)
if s:
    print(f"连接成功，本地地址: {s.getsockname()}")
    s.close()

\`\`\`

## 七、实战：多线程回显服务器

\`\`\`python
import socket
import threading
import time


class EchoServer:
    """完整的 TCP 回显服务器，支持多客户端"""

    def __init__(self, host: str = "127.0.0.1", port: int = 0):
        self.host = host
        self.port = port
        self.server_socket: socket.socket | None = None
        self.running = False
        self.clients: list[socket.socket] = []

    def start(self) -> tuple[str, int]:
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(8)
        self.running = True
        addr = self.server_socket.getsockname()
        # 后台线程接受连接
        threading.Thread(target=self._accept_loop, daemon=True).start()
        return addr

    def _accept_loop(self):
        self.server_socket.settimeout(0.5)
        while self.running:
            try:
                conn, client_addr = self.server_socket.accept()
                self.clients.append(conn)
                threading.Thread(
                    target=self._handle, args=(conn, client_addr), daemon=True
                ).start()
            except socket.timeout:
                continue
            except OSError:
                break

    def _handle(self, conn: socket.socket, addr):
        try:
            conn.settimeout(1.0)
            while self.running:
                try:
                    data = conn.recv(1024)
                    if not data:
                        break
                    # 回显并附加地址信息
                    response = f"[{addr[1]}] {data.decode()}"
                    conn.sendall(response.encode())
                except socket.timeout:
                    continue
        except OSError:
            pass
        finally:
            conn.close()
            if conn in self.clients:
                self.clients.remove(conn)

    def stop(self):
        self.running = False
        for c in self.clients:
            try:
                c.close()
            except OSError:
                pass
        if self.server_socket:
            self.server_socket.close()


# 启动服务器并测试
server = EchoServer()
addr = server.start()
print(f"服务器启动: {addr}")

# 模拟两个客户端
def client(msg: str):
    with socket.socket() as s:
        s.connect(addr)
        s.sendall(msg.encode())
        print(s.recv(1024).decode())

client("hello")
client("world")
time.sleep(0.3)
server.stop()

\`\`\`

## 八、socket 选项

\`\`\`python
import socket


s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 常用 socket 选项
# SO_REUSEADDR：端口复用，服务器必备
# SO_KEEPALIVE：TCP 保活，检测死连接
# SO_RCVBUF / SO_SNDBUF：收发缓冲区大小
# TCP_NODELAY：禁用 Nagle 算法，小包立即发送
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

# 读取当前缓冲区大小
# WHY: 调优时了解系统默认值，按业务需求调整
rcv = s.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)
snd = s.getsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF)
print(f"接收缓冲区: {rcv} 字节")
print(f"发送缓冲区: {snd} 字节")
s.close()

\`\`\`

## 小结

本章介绍了 socket 网络编程：

- **socket 基础**：地址族、类型、协议
- **TCP 客户端**：connect、send、recv
- **TCP 服务器**：bind、listen、accept
- **UDP 通信**：无连接、sendto/recvfrom
- **常用方法**：settimeout、setblocking、getaddrinfo
- **多线程服务器**：每个连接一个线程
- **socket 选项**：REUSEADDR、KEEPALIVE、TCP_NODELAY

socket 是底层 API，生产环境推荐用 asyncio 或第三方库。下一章我们学习更高层的 HTTP 与 urllib。
`
  },
  {
    id: "py10-ch67",
    group: "第十四部分 网络与数据库",
    icon: "🌐",
    title: "第六十七章 HTTP 与 urllib",
    content: `

# 第六十七章 HTTP 与 urllib

## 一、urllib 模块家族

Python 标准库 \`urllib\` 是处理 URL 和 HTTP 请求的核心模块，分为四个子模块：

- **urllib.request**：打开和读取 URL
- **urllib.parse**：解析和构造 URL
- **urllib.error**：异常处理
- **urllib.robotparser**：解析 robots.txt

\`\`\`python
import urllib.request
import urllib.parse
import urllib.error


# 最简单的请求：urlopen
# WHY: urlopen 是高层 API，封装了 socket 细节
try:
    response = urllib.request.urlopen("http://example.com", timeout=5)
    print(f"状态码: {response.status}")
    print(f"响应头: {dict(response.headers).get('Content-Type')}")
    data = response.read()  # bytes
    print(f"数据长度: {len(data)} 字节")
    print(data[:100])
except urllib.error.URLError as e:
    print(f"网络请求失败（沙箱可能无网络）: {e}")

\`\`\`

## 二、Request 对象自定义请求

\`urllib.request.Request\` 可以设置请求头、方法、数据等。

\`\`\`python
import urllib.request
import urllib.error


# 自定义请求头模拟浏览器
# WHY: 很多网站会检查 User-Agent，默认 Python UA 会被拒
url = "http://example.com"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Accept": "text/html",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

req = urllib.request.Request(url, headers=headers, method="GET")
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        print(f"状态: {resp.status}")
        # 逐行读取
        for i, line in enumerate(resp):
            if i >= 3:
                break
            print(line.decode("utf-8", errors="replace").rstrip())
except urllib.error.URLError as e:
    print(f"请求失败: {e}")

\`\`\`

## 三、urllib.parse URL 处理

\`\`\`python
from urllib.parse import urlparse, urljoin, urlencode, parse_qs, quote, unquote


# urlparse：拆解 URL 各部分
# WHY: 爬虫需要解析 URL 提取 host、path、query
url = "https://user:pass@www.example.com:8443/path/to/page?key=val&q=python#frag"
parts = urlparse(url)
print(f"协议: {parts.scheme}")      # https
print(f"用户: {parts.username}")
print(f"主机: {parts.hostname}")
print(f"端口: {parts.port}")
print(f"路径: {parts.path}")
print(f"查询: {parts.query}")
print(f"锚点: {parts.fragment}")

# urljoin：拼接相对 URL
# WHY: 爬虫抓到的链接常是相对路径，需要 urljoin 还原成绝对 URL
base = "https://www.example.com/docs/api/v1"
print(urljoin(base, "../v2"))           # https://www.example.com/docs/api/v2
print(urljoin(base, "/about"))          # https://www.example.com/about
print(urljoin("https://a.com/x/y", "z"))  # https://a.com/x/y/z

# urlencode：把字典编码成查询字符串
# WHY: GET 参数必须 URL 编码，特殊字符如 &、= 会被转义
params = {"q": "python 教程", "page": 1, "lang": "zh-CN"}
print(urlencode(params))
# q=python+%E6%95%99%E7%A8%8B&page=1&lang=zh-CN

# parse_qs：反向解析查询字符串
qs = "q=python&tag=async&tag=io"
print(parse_qs(qs))  # 注意 tag 出现两次会合并成列表

# quote / unquote：编码/解码单个字符串
print(quote("a & b = c"))   # a%20%26%20b%20%3D%20c
print(unquote("a%20%26%20b"))

\`\`\`

## 四、GET 与 POST 请求

\`\`\`python
import urllib.request
import urllib.parse
import json


# GET 请求：参数拼在 URL 上
def http_get(url: str, params: dict | None = None, timeout: float = 5) -> bytes:
    if params:
        # 把参数编码后附加到 URL
        # WHY: GET 参数通过查询字符串传递，长度受限
        url = f"{url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


# POST 请求：参数放在请求体
def http_post(url: str, data: dict, timeout: float = 5) -> bytes:
    # form 表单格式
    # WHY: POST 数据放在 body，Content-Type 告诉服务器格式
    body = urllib.parse.urlencode(data).encode("utf-8")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def http_post_json(url: str, data: dict, timeout: float = 5) -> bytes:
    # JSON 格式请求体
    # WHY: RESTful API 普遍用 JSON，需正确设置 Content-Type
    body = json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


# 演示（沙箱可能无网络）
try:
    html = http_get("http://example.com")
    print(f"GET 成功，长度 {len(html)}")
except Exception as e:
    print(f"GET 失败: {e}")

\`\`\`

## 五、异常处理

\`\`\`python
import urllib.request
import urllib.error


def safe_fetch(url: str) -> str:
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        # HTTPError 是 URLError 的子类，必须先捕获
        # WHY: 4xx/5xx 会抛 HTTPError，包含状态码和响应体
        print(f"HTTP 错误: {e.code} {e.reason}")
        body = e.read().decode("utf-8", errors="replace")
        return f"[{e.code}] {body[:200]}"
    except urllib.error.URLError as e:
        # 网络层错误：DNS 失败、连接拒绝等
        print(f"URL 错误: {e.reason}")
        return f"[网络错误] {e.reason}"
    except Exception as e:
        print(f"其他错误: {e}")
        return f"[错误] {e}"


print(safe_fetch("http://example.com/nonexistent-page-404"))
print(safe_fetch("http://nonexistent.invalid.domain.example"))

\`\`\`

## 六、下载文件

\`\`\`python
import urllib.request
import os
import time


def download(url: str, dest: str, chunk_size: int = 8192) -> int:
    """流式下载文件，避免大文件占满内存"""
    # WHY: read() 一次读完会撑爆内存，分块读才能下大文件
    total = 0
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            # 从响应头获取总大小（不一定有）
            content_length = resp.headers.get("Content-Length")
            total_size = int(content_length) if content_length else None
            print(f"待下载: {total_size} 字节" if total_size else "大小未知")

            with open(dest, "wb") as f:
                while True:
                    chunk = resp.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    total += len(chunk)
                    if total_size:
                        percent = total * 100 // total_size
                        print(f"\\r进度: {percent}%", end="", flush=True)
            print()
    except Exception as e:
        print(f"下载失败: {e}")
        # 失败时删除半成品文件
        if os.path.exists(dest):
            os.remove(dest)
        return 0
    return total


# 下载小文件演示
total = download("http://example.com", "/tmp/example.html")
print(f"已下载 {total} 字节")

\`\`\`

## 七、http.client 低层 API

\`http.client\` 比 urllib 更底层，直接对应 HTTP 协议。

\`\`\`python
import http.client


# 显式构造 HTTP 请求
# WHY: 需要精细控制连接（如 keep-alive、代理）时用 http.client
try:
    # HTTPSConnection 走 TLS
    conn = http.client.HTTPSConnection("example.com", timeout=5)
    conn.request("GET", "/", headers={"User-Agent": "python-demo"})
    resp = conn.getresponse()
    print(f"状态: {resp.status} {resp.reason}")
    print(f"Server: {resp.getheader('Server')}")
    body = resp.read()
    print(f"内容长度: {len(body)}")
    conn.close()
except Exception as e:
    print(f"http.client 失败: {e}")

\`\`\`

## 八、http.server 简单服务器

\`http.server\` 适合开发调试，生产环境请用专业服务器。

\`\`\`python
import http.server
import socketserver
import threading
import time
import urllib.request


class MyHandler(http.server.BaseHTTPRequestHandler):
    """自定义请求处理器"""

    def do_GET(self):
        # 根据 path 返回不同内容
        # WHY: 重写 do_GET 实现 API 路由
        if self.path == "/":
            self._send(200, "text/plain", "Hello from server!")
        elif self.path == "/api/time":
            import json
            self._send(200, "application/json", json.dumps({"time": time.time()}))
        else:
            self._send(404, "text/plain", "Not Found")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        # 回显收到的数据
        # WHY: POST 处理要先读 body，再返回响应
        self._send(200, "text/plain", f"收到 {len(body)} 字节")

    def _send(self, code: int, content_type: str, body: str):
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body.encode())))
        self.end_headers()
        self.wfile.write(body.encode())

    def log_message(self, fmt, *args):
        # 静默日志
        pass


# 在后台线程启动服务器
def start_server(port: int = 0):
    with socketserver.TCPServer(("127.0.0.1", port), MyHandler) as httpd:
        port = httpd.server_address[1]
        print(f"[服务器] http://127.0.0.1:{port}")
        httpd.serve_forever()


thread = threading.Thread(target=start_server, daemon=True)
thread.start()
time.sleep(0.5)

# 用 urllib 测试
try:
    resp = urllib.request.urlopen("http://127.0.0.1:0/", timeout=1)
except Exception:
    # 因为端口是 0 自动分配的，演示代码无法直接连
    print("服务器演示已启动（端口动态分配）")

\`\`\`

## 九、Cookie 与会话

\`\`\`python
import urllib.request
import http.cookiejar


# CookieJar 自动管理 cookie
# WHY: 登录态保存在 cookie，需要 jar 自动保存和发送
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookie_jar)
)

# 用 opener 替代 urlopen，会自动处理 cookie
try:
    resp = opener.open("http://example.com")
    print(f"收到 {len(list(cookie_jar))} 个 cookie")
    for c in cookie_jar:
        print(f"  {c.name} = {c.value[:30]}")
except Exception as e:
    print(f"cookie 演示失败: {e}")

\`\`\`

## 十、实用工具函数

\`\`\`python
import urllib.request
import urllib.parse
import urllib.error
import json
from typing import Any


def request_json(
    url: str,
    method: str = "GET",
    data: Any = None,
    headers: dict | None = None,
    timeout: float = 10,
) -> Any:
    """通用 JSON API 客户端"""
    headers = headers or {}
    headers.setdefault("User-Agent", "python-client/1.0")
    headers.setdefault("Accept", "application/json")

    body = None
    if data is not None:
        if method == "GET":
            # GET 参数拼到 URL
            url = f"{url}?{urllib.parse.urlencode(data)}"
        else:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            text = resp.read().decode("utf-8")
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:200]}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"网络错误: {e.reason}") from e


# 演示
try:
    result = request_json("http://example.com")
    print(result)
except RuntimeError as e:
    print(f"演示失败（沙箱无网络属正常）: {e}")

\`\`\`

## 小结

本章介绍了 HTTP 与 urllib：

- **urllib.request**：urlopen、Request 自定义请求
- **urllib.parse**：urlparse、urljoin、urlencode
- **GET/POST**：查询字符串与请求体
- **异常处理**：HTTPError vs URLError
- **下载文件**：分块读取避免内存爆炸
- **http.client**：低层 HTTP API
- **http.server**：开发调试用服务器
- **Cookie 管理**：CookieJar + opener

实际生产中推荐 \`requests\` 或 \`httpx\`，但 urllib 是它们的基础。下一章学习邮件与 MIME。
`
  },
  {
    id: "py10-ch68",
    group: "第十四部分 网络与数据库",
    icon: "📧",
    title: "第六十八章 邮件与 MIME",
    content: `

# 第六十八章 邮件与 MIME

## 一、邮件协议概览

Python 标准库支持三大邮件协议：

- **SMTP**：发邮件（端口 25/465/587）
- **POP3**：收邮件（端口 110/995），简单拉取
- **IMAP**：收邮件（端口 143/993），服务器端操作

邮件内容由 \`email\` 模块构造，支持纯文本、HTML、附件等 MIME 类型。

\`\`\`python
# 邮件相关模块概览
import smtplib
import imaplib
import poplib
from email.message import EmailMessage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

print("SMTP 端口:")
print("  25  - 明文")
print("  465 - SSL")
print("  587 - STARTTLS")
print("IMAP 端口: 143 / 993(SSL)")
print("POP3 端口: 110 / 995(SSL)")

# WHY: 了解端口能正确选择 smtplib.SMTP vs SMTP_SSL
\`\`\`

## 二、构造邮件

\`EmailMessage\`（3.6+）是现代邮件构造 API，比旧的 MIME* 类更简洁。

\`\`\`python
from email.message import EmailMessage


# 构造一封纯文本邮件
msg = EmailMessage()
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"
msg["Subject"] = "测试邮件"

# set_content 自动设置 Content-Type 和编码
# WHY: 中文邮件必须正确设置 charset，否则显示乱码
msg.set_content("你好，这是一封测试邮件。\\n\\n祝好！")

# 打印完整邮件源码（含头部和正文）
print(msg.as_string())

\`\`\`

\`\`\`python
from email.message import EmailMessage
from email.utils import formataddr, make_msgid, formatdate


# 完整的邮件头部
msg = EmailMessage()
# formataddr 处理"显示名 <地址>"格式，自动转义特殊字符
# WHY: 名字含逗号等字符需要 RFC 2047 编码
msg["From"] = formataddr(("张三", "zhangsan@example.com"))
msg["To"] = formataddr(("李四", "lisi@example.com"))
msg["Subject"] = "邮件主题：报告"
# Message-ID 邮件唯一标识
msg["Message-ID"] = make_msgid(domain="example.com")
# Date 邮件日期
msg["Date"] = formatdate(localtime=True)
# Reply-To 回复地址
msg["Reply-To"] = "noreply@example.com"

msg.set_content("正文内容")
print(msg.as_string()[:500])

\`\`\`

## 三、HTML 邮件

\`\`\`python
from email.message import EmailMessage


# HTML 邮件 + 纯文本备选
msg = EmailMessage()
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"
msg["Subject"] = "HTML 邮件测试"

# 同时设置纯文本和 HTML，客户端按能力选择
# WHY: 老客户端只支持纯文本，必须提供备选版本
msg.set_content("这是纯文本版本，用于不支持 HTML 的客户端")
msg.add_alternative(
    """<html>
    <body>
        <h1 style="color:blue;">HTML 邮件</h1>
        <p>这是一封 <b>HTML</b> 格式的邮件。</p>
        <ul>
            <li>支持富文本</li>
            <li>支持样式</li>
        </ul>
    </body>
    </html>
    """,
    subtype="html",
)

print("Content-Type:", msg.get_content_type())
# 多部分邮件
print("是否多部分:", msg.is_multipart())

\`\`\`

## 四、带附件的邮件

\`\`\`python
from email.message import EmailMessage
import mimetypes


msg = EmailMessage()
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"
msg["Subject"] = "带附件的邮件"
msg.set_content("请查收附件。")

# 添加文本附件
# WHY: add_attachment 自动根据文件名推断 MIME 类型
msg.add_attachment(
    "这是附件内容。\\n第二行。",
    filename="readme.txt",
)

# 添加二进制附件（模拟 PDF）
pdf_content = b"%PDF-1.4 test content"
msg.add_attachment(
    pdf_content,
    maintype="application",
    subtype="pdf",
    filename="report.pdf",
)

# 遍历邮件各部分
for part in msg.iter_attachments():
    print(f"附件: {part.get_filename()}, 类型: {part.get_content_type()}")

\`\`\`

## 五、内嵌图片

\`\`\`python
from email.message import EmailMessage


msg = EmailMessage()
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"
msg["Subject"] = "内嵌图片邮件"

# HTML 中用 cid: 引用内嵌图片
# WHY: 外链图片可能被屏蔽，内嵌更可靠
html = """<html><body>
<h1>带图片的邮件</h1>
<img src="cid:logo" alt="logo" width="200">
<p>图片显示在上方。</p>
</body></html>"""

msg.set_content("纯文本备选")
msg.add_alternative(html, subtype="html")

# 假图片数据（1x1 像素 PNG）
fake_png = b"\\x89PNG\\r\\n\\x1a\\n" + b"\\x00" * 30
msg.get_payload()[1].add_related(
    fake_png,
    maintype="image",
    subtype="png",
    cid="<logo>",
)

print("邮件结构:")
for part in msg.walk():
    print(f"  - {part.get_content_type()}: {part.get('Content-ID', '(正文)')}")

\`\`\`

## 六、smtplib 发送邮件

\`\`\`python
import smtplib
from email.message import EmailMessage
import ssl


def send_mail_smtp(
    host: str,
    port: int,
    username: str,
    password: str,
    to_addrs: list[str],
    subject: str,
    body: str,
    use_ssl: bool = True,
) -> None:
    """通过 SMTP 发送邮件"""
    msg = EmailMessage()
    msg["From"] = username
    msg["To"] = ", ".join(to_addrs)
    msg["Subject"] = subject
    msg.set_content(body)

    # 创建 SSL 上下文（验证证书）
    # WHY: 明文 SMTP 会泄露密码，必须用 SSL 或 STARTTLS
    context = ssl.create_default_context()

    if use_ssl:
        # SMTP_SSL：连接时直接 SSL
        server = smtplib.SMTP_SSL(host, port, context=context, timeout=10)
    else:
        # 普通 SMTP + STARTTLS 升级加密
        server = smtplib.SMTP(host, port, timeout=10)
        server.starttls(context=context)

    try:
        server.login(username, password)
        # send_message 自动从邮件头提取收件人
        server.send_message(msg)
        print(f"邮件已发送给 {to_addrs}")
    finally:
        server.quit()


# 演示（无真实凭证，仅打印邮件）
print("--- 邮件内容预览 ---")
demo_msg = EmailMessage()
demo_msg["From"] = "sender@example.com"
demo_msg["To"] = "to@example.com"
demo_msg["Subject"] = "演示邮件"
demo_msg.set_content("这是邮件正文。")
print(demo_msg.as_string())

\`\`\`

## 七、imaplib 读取邮件

\`\`\`python
import imaplib
import email
from email import policy


def fetch_recent_emails(
    host: str, username: str, password: str, n: int = 5
) -> list[dict]:
    """通过 IMAP 获取最近 N 封邮件"""
    # IMAP 比 POP3 更强大：可在服务器分类、标记、搜索
    # WHY: IMAP 保留邮件在服务器，多设备同步方便
    conn = imaplib.IMAP4_SSL(host)
    try:
        conn.login(username, password)
        conn.select("INBOX")

        # 搜索所有邮件
        status, data = conn.search(None, "ALL")
        if status != "OK":
            return []

        ids = data[0].split()
        results = []
        # 取最后 n 封
        for mid in ids[-n:]:
            status, msg_data = conn.fetch(mid, "(RFC822)")
            if status != "OK":
                continue
            raw = msg_data[0][1]
            # 解析邮件
            msg = email.message_from_bytes(raw, policy=policy.default)

            results.append({
                "id": mid.decode(),
                "from": msg["From"],
                "subject": msg["Subject"],
                "date": msg["Date"],
            })
        return results
    finally:
        conn.logout()


# 演示解析邮件
sample_raw = b"""From: sender@example.com
To: recipient@example.com
Subject: =?utf-8?B?5rWL6K+V6YKu5Lu2?=
Content-Type: text/plain; charset=utf-8

This is the body.
"""
msg = email.message_from_bytes(sample_raw, policy=policy.default)
print(f"From: {msg['From']}")
print(f"Subject: {msg['Subject']}")  # 自动解码 MIME 编码的中文
print(f"Body: {msg.get_content().strip()}")

\`\`\`

## 八、poplib 收邮件

\`\`\`python
import poplib
import email
from email import policy


def pop_fetch(host: str, username: str, password: str, n: int = 3) -> list[str]:
    """通过 POP3 获取邮件主题"""
    # POP3 简单：只下载，服务器端不保留状态
    # WHY: 简单场景用 POP3，复杂操作用 IMAP
    server = poplib.POP3_SSL(host, timeout=10)
    try:
        server.user(username)
        server.pass_(password)
        # 获取邮件数量和总大小
        count, size = server.stat()
        print(f"共 {count} 封邮件，{size} 字节")

        subjects = []
        for i in range(max(1, count - n + 1), count + 1):
            # retr 获取指定邮件
            resp, lines, octets = server.retr(i)
            raw = b"\\r\\n".join(lines)
            msg = email.message_from_bytes(raw, policy=policy.default)
            subjects.append(str(msg["Subject"]))
        return subjects
    finally:
        server.quit()


print("POP3 演示函数已定义（需真实服务器运行）")

\`\`\`

## 九、解析复杂邮件

\`\`\`python
import email
from email import policy
from email.header import decode_header


def parse_email(raw_bytes: bytes) -> dict:
    """解析邮件，提取各部分"""
    msg = email.message_from_bytes(raw_bytes, policy=policy.default)

    info = {
        "from": str(msg["From"]),
        "to": str(msg["To"]),
        "subject": str(msg["Subject"]),
        "date": str(msg["Date"]),
        "text": "",
        "html": "",
        "attachments": [],
    }

    if msg.is_multipart():
        # 多部分邮件
        # WHY: walk() 遍历所有部分，包括嵌套的 multipart
        for part in msg.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get("Content-Disposition", ""))

            if "attachment" in cdispo:
                # 附件
                filename = part.get_filename()
                if filename:
                    info["attachments"].append(filename)
            elif ctype == "text/plain":
                info["text"] = part.get_content()
            elif ctype == "text/html":
                info["html"] = part.get_content()
    else:
        # 单部分邮件
        if msg.get_content_type() == "text/plain":
            info["text"] = msg.get_content()
        elif msg.get_content_type() == "text/html":
            info["html"] = msg.get_content()

    return info


# 解码邮件头（含中文）
def decode_subject(subject: str) -> str:
    """处理 =?charset?B/Q?encoded?= 格式的头部"""
    # WHY: 邮件头不支持非 ASCII，必须 MIME 编码
    parts = decode_header(subject)
    result = []
    for data, charset in parts:
        if isinstance(data, bytes):
            result.append(data.decode(charset or "utf-8", errors="replace"))
        else:
            result.append(data)
    return "".join(result)


# 测试解码
encoded = "=?utf-8?B?5rWL6K+V6YKu5Lu2?="
print(f"解码: {decode_subject(encoded)}")

\`\`\`

## 十、邮件最佳实践

\`\`\`python
import smtplib
import ssl
from email.message import EmailMessage
import os
from typing import Optional


# 实战：安全的邮件发送封装
class MailSender:
    def __init__(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        use_ssl: bool = True,
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.use_ssl = use_ssl
        # 复用 SSL 上下文
        self.context = ssl.create_default_context()

    def send(
        self,
        to_addrs: list[str],
        subject: str,
        body: str,
        html: Optional[str] = None,
        attachments: Optional[list[tuple[str, bytes]]] = None,
    ) -> None:
        """发送邮件，支持 HTML 和附件"""
        msg = EmailMessage()
        msg["From"] = self.username
        msg["To"] = ", ".join(to_addrs)
        msg["Subject"] = subject

        if html:
            msg.set_content(body)  # 纯文本
            msg.add_alternative(html, subtype="html")
        else:
            msg.set_content(body)

        if attachments:
            for filename, content in attachments:
                # 自动推断 MIME 类型
                # WHY: 用 mimetype 让附件能正确显示
                import mimetypes
                ctype, _ = mimetypes.guess_type(filename)
                if ctype:
                    maintype, subtype = ctype.split("/")
                else:
                    maintype, subtype = "application", "octet-stream"
                msg.add_attachment(
                    content, maintype=maintype, subtype=subtype, filename=filename
                )

        # 发送
        if self.use_ssl:
            server = smtplib.SMTP_SSL(self.host, self.port, context=self.context, timeout=15)
        else:
            server = smtplib.SMTP(self.host, self.port, timeout=15)
            server.starttls(context=self.context)

        try:
            server.login(self.username, self.password)
            # 拒绝未授权收件人，提升安全
            # WHY: send_message 自动从头部提取 To/Cc/Bcc
            server.send_message(msg)
        finally:
            server.quit()


# 不在沙箱中真正发送，仅演示对象构造
sender = MailSender(
    host="smtp.example.com",
    port=465,
    username="user@example.com",
    password="***",
)
print("MailSender 已就绪（沙箱不发送真实邮件）")

\`\`\`

| 协议 | 端口 | 加密 | 用途 |
|------|------|------|------|
| SMTP | 25 | 无 | 服务器间转发 |
| SMTP | 465 | SSL | 客户端提交 |
| SMTP | 587 | STARTTLS | 客户端提交 |
| POP3 | 110/995 | SSL可选 | 下载邮件 |
| IMAP | 143/993 | SSL可选 | 在线操作 |

## 小结

本章介绍了邮件与 MIME：

- **EmailMessage**：现代邮件构造 API
- **HTML 邮件**：纯文本 + HTML 备选
- **附件**：add_attachment 自动处理
- **内嵌图片**：cid 引用
- **smtplib**：SMTP/SMTP_SSL 发送
- **imaplib**：服务器端邮件操作
- **poplib**：简单下载
- **邮件解析**：walk() 遍历多部分
- **最佳实践**：SSL、超时、复用连接

下一章我们进入数据库世界，学习 sqlite3。
`
  },
  {
    id: "py10-ch69",
    group: "第十四部分 网络与数据库",
    icon: "🗄️",
    title: "第六十九章 sqlite3 数据库",
    content: `

# 第六十九章 sqlite3 数据库

## 一、为什么用 sqlite3

SQLite 是一个嵌入式关系数据库，整个数据库就是一个文件，无需服务器进程。Python 标准库 \`sqlite3\` 直接可用，适合：

- 桌面应用本地存储
- 小型 Web 应用
- 配置和数据缓存
- 测试和原型开发

\`\`\`python
import sqlite3


# 创建内存数据库（连接关闭即消失）
# WHY: 内存库极快，适合临时数据和测试
conn = sqlite3.connect(":memory:")
print(f"SQLite 版本: {sqlite3.sqlite_version}")

# cursor 用于执行 SQL
cur = conn.cursor()

# 创建表
cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        email TEXT UNIQUE
    )
""")

# 插入数据
cur.execute("INSERT INTO users (name, age, email) VALUES (?, ?, ?)",
            ("张三", 28, "zhangsan@example.com"))
# 必须提交事务，否则不持久化
# WHY: sqlite3 默认开启事务，写操作需手动 commit
conn.commit()

# 查询
cur.execute("SELECT * FROM users")
print(cur.fetchone())  # 取一行

conn.close()

\`\`\`

## 二、连接与游标

\`\`\`python
import sqlite3
import os


# 连接文件数据库
db_path = "/tmp/demo.db"
# 文件不存在会自动创建
# WHY: 文件库持久化，应用重启数据仍在
conn = sqlite3.connect(db_path)
print(f"数据库文件: {db_path}")

# 设置 row_factory 让结果像字典一样访问
# WHY: 默认返回 tuple，用名字访问更可读
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL)")
cur.execute("INSERT INTO products VALUES (1, '苹果', 5.5)")
cur.execute("INSERT INTO products VALUES (2, '香蕉', 3.2)")
conn.commit()

cur.execute("SELECT * FROM products")
for row in cur.fetchall():
    # sqlite3.Row 支持名字和索引访问
    print(f"  {row['id']}. {row['name']} - ¥{row['price']}")

conn.close()
os.remove(db_path)

\`\`\`

## 三、参数化查询

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER)")
conn.commit()

# 用 ? 占位符（推荐，防 SQL 注入）
# WHY: 字符串拼接 SQL 是严重安全漏洞，必须用占位符
items = [("苹果", 10), ("香蕉", 20), ("橙子", 15)]
cur.executemany(
    "INSERT INTO items (name, qty) VALUES (?, ?)",
    items,
)
conn.commit()

# 命名占位符（更清晰）
cur.execute(
    "SELECT * FROM items WHERE name = :name AND qty > :min_qty",
    {"name": "苹果", "min_qty": 5},
)
print(cur.fetchall())

# 危险写法（绝对禁止！）
# cur.execute(f"SELECT * FROM items WHERE name = '{user_input}'")  # SQL 注入

# 安全写法
user_input = "苹果"
cur.execute("SELECT * FROM items WHERE name = ?", (user_input,))
print(cur.fetchall())

conn.close()

\`\`\`

## 四、executemany 批量操作

\`\`\`python
import sqlite3
import time


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE logs (id INTEGER PRIMARY KEY, ts REAL, msg TEXT)")

# 错误：循环单条插入，慢
start = time.perf_counter()
for i in range(1000):
    cur.execute("INSERT INTO logs (ts, msg) VALUES (?, ?)", (time.time(), f"msg-{i}"))
conn.commit()
print(f"循环 1000 次: {time.perf_counter() - start:.3f}s")

cur.execute("DELETE FROM logs")
conn.commit()

# 正确：executemany 批量插入
start = time.perf_counter()
# WHY: executemany 一次提交所有数据，比循环快 10 倍以上
data = [(time.time(), f"msg-{i}") for i in range(1000)]
cur.executemany("INSERT INTO logs (ts, msg) VALUES (?, ?)", data)
conn.commit()
print(f"executemany 1000 次: {time.perf_counter() - start:.3f}s")

conn.close()

\`\`\`

## 五、上下文管理器与事务

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER)")
cur.execute("INSERT INTO accounts VALUES (1, 100)")
cur.execute("INSERT INTO accounts VALUES (2, 50)")
conn.commit()


# 用 with conn 自动提交或回滚
# WHY: with 块正常结束自动 commit，异常自动 rollback
def transfer(from_id: int, to_id: int, amount: int) -> bool:
    try:
        with conn:
            # 检查余额
            cur.execute("SELECT balance FROM accounts WHERE id = ?", (from_id,))
            balance = cur.fetchone()[0]
            if balance < amount:
                return False
            # 扣款
            cur.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, from_id))
            # 模拟异常
            if amount == 999:
                raise ValueError("故意失败")
            # 加款
            cur.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, to_id))
        return True
    except Exception as e:
        print(f"转账失败: {e}")
        return False


# 正常转账
transfer(1, 2, 30)
cur.execute("SELECT * FROM accounts")
print("转账 30 后:", cur.fetchall())

# 异常转账（自动回滚）
transfer(1, 2, 999)
cur.execute("SELECT * FROM accounts")
print("异常后:", cur.fetchall())

conn.close()

\`\`\`

## 六、sqlite3.Row 行工厂

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row  # 必须在创建 cursor 前设置
cur = conn.cursor()

cur.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, year INTEGER)")
books = [
    ("Python 高级编程", "张三", 2020),
    ("流畅的 Python", "Luciano", 2022),
    ("Effective Python", "Brett", 2019),
]
cur.executemany("INSERT INTO books (title, author, year) VALUES (?, ?, ?)", books)
conn.commit()

cur.execute("SELECT * FROM books WHERE year > ?", (2019,))

# sqlite3.Row 的多种访问方式
for row in cur:
    # 索引访问
    print(f"  [{row[0]}] {row[1]}")
    # 名字访问（推荐）
    print(f"  作者: {row['author']}, 年份: {row['year']}")
    # keys() 方法
    print(f"  列名: {list(row.keys())}")
    # 转字典
    print(f"  dict: {dict(row)}")

# 自定义 row_factory
def dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

conn.row_factory = dict_factory
cur.execute("SELECT * FROM books LIMIT 1")
print(cur.fetchone())

conn.close()

\`\`\`

## 七、Schema 设计

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")  # 启用外键约束
cur = conn.cursor()

# 完整的博客系统 Schema
# WHY: 良好的 Schema 是数据库性能和正确性的基础
cur.executescript("""
    -- 用户表
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
    );

    -- 文章表
    CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        published INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 评论表
    CREATE TABLE comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 索引加速查询
    CREATE INDEX idx_posts_user ON posts(user_id);
    CREATE INDEX idx_comments_post ON comments(post_id);
""")

# 插入测试数据
cur.execute("INSERT INTO users (username, email) VALUES (?, ?)", ("alice", "alice@x.com"))
cur.execute("INSERT INTO users (username, email) VALUES (?, ?)", ("bob", "bob@x.com"))
user_id = cur.execute("SELECT id FROM users WHERE username = 'alice'").fetchone()[0]
cur.execute("INSERT INTO posts (user_id, title, content, published) VALUES (?, ?, ?, 1)",
            (user_id, "第一篇文章", "内容...", 1))
conn.commit()

# 查询 Schema
cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
for name, sql in cur.fetchall():
    print(f"=== {name} ===")
    print(sql)

# 测试外键级联
cur.execute("DELETE FROM users WHERE username = 'alice'")
conn.commit()
# alice 的文章应该被级联删除
count = cur.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
print(f"删除 alice 后文章数: {count}")

conn.close()

\`\`\`

## 八、完整 CRUD 示例

\`\`\`python
import sqlite3
from dataclasses import dataclass
from typing import Optional


@dataclass
class Task:
    id: Optional[int]
    title: str
    done: bool = False
    priority: int = 1


class TaskRepository:
    """任务仓库：封装数据库操作"""

    def __init__(self, db_path: str = ":memory:"):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self):
        # IF NOT EXISTS 保证幂等
        # WHY: 应用重启时不应报"表已存在"
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                done INTEGER DEFAULT 0,
                priority INTEGER DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        self.conn.commit()

    def create(self, task: Task) -> int:
        cur = self.conn.execute(
            "INSERT INTO tasks (title, done, priority) VALUES (?, ?, ?)",
            (task.title, int(task.done), task.priority),
        )
        self.conn.commit()
        return cur.lastrowid

    def get(self, task_id: int) -> Optional[Task]:
        row = self.conn.execute(
            "SELECT * FROM tasks WHERE id = ?", (task_id,)
        ).fetchone()
        if not row:
            return None
        return Task(id=row["id"], title=row["title"], done=bool(row["done"]), priority=row["priority"])

    def list_all(self, only_undone: bool = False) -> list[Task]:
        if only_undone:
            sql = "SELECT * FROM tasks WHERE done = 0 ORDER BY priority DESC, id"
        else:
            sql = "SELECT * FROM tasks ORDER BY priority DESC, id"
        rows = self.conn.execute(sql).fetchall()
        return [Task(id=r["id"], title=r["title"], done=bool(r["done"]), priority=r["priority"]) for r in rows]

    def update(self, task: Task) -> bool:
        if task.id is None:
            return False
        cur = self.conn.execute(
            "UPDATE tasks SET title = ?, done = ?, priority = ? WHERE id = ?",
            (task.title, int(task.done), task.priority, task.id),
        )
        self.conn.commit()
        return cur.rowcount > 0

    def delete(self, task_id: int) -> bool:
        cur = self.conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        self.conn.commit()
        return cur.rowcount > 0

    def close(self):
        self.conn.close()


# 使用示例
repo = TaskRepository()
t1 = repo.create(Task(id=None, title="学 Python", priority=2))
t2 = repo.create(Task(id=None, title="写代码", priority=3))
t3 = repo.create(Task(id=None, title="睡觉", priority=1))

print("所有任务:")
for t in repo.list_all():
    print(f"  [{t.id}] {t.title} (优先级 {t.priority})")

# 标记完成
t2.done = True
repo.update(t2)

print("\\n未完成任务:")
for t in repo.list_all(only_undone=True):
    print(f"  [{t.id}] {t.title}")

repo.close()

\`\`\`

## 九、SQLite 性能优化

\`\`\`python
import sqlite3
import time


conn = sqlite3.connect(":memory:")
cur = conn.cursor()

# PRAGMA 调优
# WHY: 合理的 PRAGMA 设置能让 SQLite 性能提升数倍
conn.execute("PRAGMA journal_mode = WAL")     # WAL 模式，读写不互斥
conn.execute("PRAGMA synchronous = NORMAL")   # 平衡安全和性能
conn.execute("PRAGMA cache_size = -64000")    # 64MB 缓存
conn.execute("PRAGMA temp_store = MEMORY")    # 临时表用内存

cur.execute("CREATE TABLE big (id INTEGER PRIMARY KEY, val TEXT)")

# 1. 显式事务 vs 自动事务
data = [(i, f"value-{i}") for i in range(10000)]

start = time.perf_counter()
for r in data:
    cur.execute("INSERT INTO big VALUES (?, ?)", r)
conn.commit()
no_tx = time.perf_counter() - start
print(f"无显式事务: {no_tx:.3f}s")

cur.execute("DELETE FROM big")
conn.commit()

start = time.perf_counter()
# 显式 BEGIN/COMMIT 一次性提交
# WHY: 自动事务每次 execute 都隐式开启事务，开销大
cur.execute("BEGIN")
cur.executemany("INSERT INTO big VALUES (?, ?)", data)
cur.execute("COMMIT")
with_tx = time.perf_counter() - start
print(f"显式事务: {with_tx:.3f}s")
print(f"加速比: {no_tx / with_tx:.1f}x")

conn.close()

\`\`\`

## 小结

本章介绍了 sqlite3 数据库：

- **连接**：内存库 / 文件库
- **游标**：execute、executemany
- **参数化查询**：? 占位符防注入
- **事务**：with conn 自动提交/回滚
- **row_factory**：sqlite3.Row 像字典访问
- **Schema 设计**：外键、索引、级联
- **CRUD 封装**：Repository 模式
- **性能优化**：WAL、显式事务、批量操作

下一章我们学习 SQL 实战，深入查询和数据建模。
`
  },
  {
    id: "py10-ch70",
    group: "第十四部分 网络与数据库",
    icon: "📊",
    title: "第七十章 SQL 实战与数据库模式",
    content: `

# 第七十章 SQL 实战与数据库模式

## 一、CRUD 基础

CRUD = Create / Read / Update / Delete，是数据库操作的四大基本动作。

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

# CREATE TABLE
cur.execute("""
    CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER CHECK (age > 0 AND age < 150),
        gender TEXT CHECK (gender IN ('M', 'F')),
        class_id INTEGER
    )
""")

# INSERT
cur.execute("INSERT INTO students (name, age, gender) VALUES (?, ?, ?)",
            ("张三", 18, "M"))
cur.execute("INSERT INTO students (name, age, gender) VALUES (?, ?, ?)",
            ("李四", 19, "F"))
cur.execute("INSERT INTO students (name, age, gender) VALUES (?, ?, ?)",
            ("王五", 20, "M"))
conn.commit()

# SELECT
cur.execute("SELECT * FROM students")
for row in cur.fetchall():
    print(row)

# UPDATE
# WHY: UPDATE 必须带 WHERE，否则全表更新
cur.execute("UPDATE students SET age = ? WHERE name = ?", (21, "王五"))
conn.commit()

# DELETE
cur.execute("DELETE FROM students WHERE name = ?", ("李四",))
conn.commit()

cur.execute("SELECT * FROM students")
print("最终:")
for row in cur.fetchall():
    print(row)

conn.close()

\`\`\`

## 二、WHERE 条件查询

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER)")

products = [
    ("iPhone", "手机", 7999, 50),
    ("iPad", "平板", 3999, 30),
    ("MacBook", "电脑", 12999, 20),
    ("AirPods", "配件", 1299, 100),
    ("鼠标", "配件", 199, 200),
    ("键盘", "配件", 399, 0),
]
cur.executemany("INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)", products)
conn.commit()

# 比较运算符
print("--- 价格 > 1000 ---")
cur.execute("SELECT name, price FROM products WHERE price > 1000")
for r in cur.fetchall():
    print(r)

# AND / OR
print("\\n--- 配件且库存 > 50 ---")
cur.execute("SELECT * FROM products WHERE category = ? AND stock > ?", ("配件", 50))
for r in cur.fetchall():
    print(r)

# IN
print("\\n--- 手机或平板 ---")
cur.execute("SELECT name FROM products WHERE category IN (?, ?)", ("手机", "平板"))
for r in cur.fetchall():
    print(r)

# BETWEEN
print("\\n--- 价格 1000~5000 ---")
cur.execute("SELECT name, price FROM products WHERE price BETWEEN ? AND ?", (1000, 5000))
for r in cur.fetchall():
    print(r)

# LIKE 模糊匹配
print("\\n--- 名字含 i ---")
# WHY: % 匹配任意字符，_ 匹配单个字符
cur.execute("SELECT name FROM products WHERE name LIKE ?", ("%i%",))
for r in cur.fetchall():
    print(r)

# NULL 处理
print("\\n--- 缺货商品 ---")
cur.execute("SELECT name FROM products WHERE stock = 0 OR stock IS NULL")
for r in cur.fetchall():
    print(r)

conn.close()

\`\`\`

## 三、ORDER BY 排序

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE scores (id INTEGER PRIMARY KEY, name TEXT, score INTEGER)")
cur.executemany("INSERT INTO scores (name, score) VALUES (?, ?)",
                [("张三", 85), ("李四", 92), ("王五", 78), ("赵六", 92), ("钱七", 65)])
conn.commit()

# 升序
print("--- 升序 ---")
cur.execute("SELECT name, score FROM scores ORDER BY score ASC")
for r in cur.fetchall():
    print(r)

# 降序
print("\\n--- 降序 ---")
cur.execute("SELECT name, score FROM scores ORDER BY score DESC")
for r in cur.fetchall():
    print(r)

# 多列排序：分数降序，名字升序
# WHY: 分数相同时按名字排序，避免顺序不稳定
print("\\n--- 分数降序 + 名字升序 ---")
cur.execute("SELECT name, score FROM scores ORDER BY score DESC, name ASC")
for r in cur.fetchall():
    print(r)

# LIMIT 分页
print("\\n--- 前 3 名 ---")
cur.execute("SELECT name, score FROM scores ORDER BY score DESC LIMIT 3")
for r in cur.fetchall():
    print(r)

# 分页：每页 2 条，第 2 页
print("\\n--- 第 2 页 ---")
cur.execute("SELECT name, score FROM scores ORDER BY score ASC LIMIT 2 OFFSET 2")
for r in cur.fetchall():
    print(r)

conn.close()

\`\`\`

## 四、GROUP BY 聚合

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("""CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer TEXT,
    product TEXT,
    amount REAL,
    order_date TEXT
)""")

orders = [
    ("Alice", "手机", 7999, "2024-01-15"),
    ("Alice", "配件", 199, "2024-01-20"),
    ("Bob", "电脑", 12999, "2024-01-18"),
    ("Bob", "手机", 7999, "2024-02-01"),
    ("Bob", "配件", 399, "2024-02-05"),
    ("Charlie", "电脑", 12999, "2024-02-10"),
    ("Alice", "电脑", 12999, "2024-02-15"),
]
cur.executemany("INSERT INTO orders (customer, product, amount, order_date) VALUES (?, ?, ?, ?)", orders)
conn.commit()

# COUNT 统计
print("--- 每个客户订单数 ---")
cur.execute("SELECT customer, COUNT(*) FROM orders GROUP BY customer")
for r in cur.fetchall():
    print(r)

# SUM 求和
print("\\n--- 每个客户总金额 ---")
cur.execute("SELECT customer, SUM(amount) FROM orders GROUP BY customer")
for r in cur.fetchall():
    print(r)

# AVG / MAX / MIN
print("\\n--- 每个产品统计 ---")
cur.execute("""
    SELECT product,
           COUNT(*) AS cnt,
           AVG(amount) AS avg_price,
           MAX(amount) AS max_amount,
           MIN(amount) AS min_amount
    FROM orders GROUP BY product
""")
for r in cur.fetchall():
    print(r)

# HAVING 过滤聚合结果（不能用 WHERE）
print("\\n--- 总金额超过 15000 的客户 ---")
# WHY: WHERE 在分组前过滤行，HAVING 在分组后过滤组
cur.execute("SELECT customer, SUM(amount) FROM orders GROUP BY customer HAVING SUM(amount) > 15000")
for r in cur.fetchall():
    print(r)

# 按月份分组
print("\\n--- 按月份统计 ---")
cur.execute("""
    SELECT substr(order_date, 1, 7) AS month, COUNT(*), SUM(amount)
    FROM orders GROUP BY month ORDER BY month
""")
for r in cur.fetchall():
    print(r)

conn.close()

\`\`\`

## 五、JOIN 连接查询

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

cur.executescript("""
    CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        name TEXT
    );
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT,
        dept_id INTEGER,
        salary REAL,
        FOREIGN KEY (dept_id) REFERENCES departments(id)
    );
""")

cur.executemany("INSERT INTO departments VALUES (?, ?)",
                [(1, "技术部"), (2, "市场部"), (3, "财务部")])
cur.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)",
                [(1, "张三", 1, 20000), (2, "李四", 1, 25000), (3, "王五", 2, 18000),
                 (4, "赵六", 2, 22000), (5, "钱七", None, 15000)])  # 钱七没部门
conn.commit()

# INNER JOIN：只返回两边都匹配的行
print("--- INNER JOIN ---")
cur.execute("""
    SELECT e.name, d.name AS dept, e.salary
    FROM employees e
    INNER JOIN departments d ON e.dept_id = d.id
""")
for r in cur.fetchall():
    print(r)

# LEFT JOIN：左表全保留，右表无匹配填 NULL
print("\\n--- LEFT JOIN（保留所有员工） ---")
# WHY: 查"所有员工及其部门"用 LEFT JOIN，没部门的也要显示
cur.execute("""
    SELECT e.name, d.name AS dept
    FROM employees e
    LEFT JOIN departments d ON e.dept_id = d.id
""")
for r in cur.fetchall():
    print(r)

# 找出没有部门的员工
print("\\n--- 没部门的员工 ---")
cur.execute("""
    SELECT e.name FROM employees e
    LEFT JOIN departments d ON e.dept_id = d.id
    WHERE d.id IS NULL
""")
for r in cur.fetchall():
    print(r)

# 多表 JOIN
cur.executescript("""
    CREATE TABLE projects (
        id INTEGER PRIMARY KEY,
        name TEXT,
        dept_id INTEGER
    );
    INSERT INTO projects VALUES (1, '网站重构', 1), (2, '市场推广', 2);
""")
conn.commit()

print("\\n--- 三表 JOIN ---")
cur.execute("""
    SELECT e.name AS emp, d.name AS dept, p.name AS project
    FROM employees e
    JOIN departments d ON e.dept_id = d.id
    JOIN projects p ON p.dept_id = d.id
""")
for r in cur.fetchall():
    print(r)

# 聚合 + JOIN
print("\\n--- 每个部门人数和平均薪资 ---")
cur.execute("""
    SELECT d.name, COUNT(e.id), AVG(e.salary)
    FROM departments d
    LEFT JOIN employees e ON e.dept_id = d.id
    GROUP BY d.id
""")
for r in cur.fetchall():
    print(r)

conn.close()

\`\`\`

## 六、索引优化

\`\`\`python
import sqlite3
import time


conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE big (id INTEGER PRIMARY KEY, name TEXT, code TEXT)")

# 插入 10 万条数据
data = [(f"name-{i}", f"code-{i % 1000:04d}") for i in range(100000)]
cur.execute("BEGIN")
cur.executemany("INSERT INTO big (name, code) VALUES (?, ?)", data)
cur.execute("COMMIT")

# 无索引查询
start = time.perf_counter()
cur.execute("SELECT * FROM big WHERE code = ?", ("code-0500",))
cur.fetchall()
no_index = time.perf_counter() - start
print(f"无索引: {no_index * 1000:.2f}ms")

# 创建索引
# WHY: 索引让查询从 O(n) 变成 O(log n)，但会拖慢写入
cur.execute("CREATE INDEX idx_code ON big(code)")

start = time.perf_counter()
cur.execute("SELECT * FROM big WHERE code = ?", ("code-0500",))
cur.fetchall()
with_index = time.perf_counter() - start
print(f"有索引: {with_index * 1000:.2f}ms")
print(f"加速: {no_index / with_index:.0f}x")

# 查看查询计划
print("\\n--- EXPLAIN QUERY PLAN ---")
cur.execute("EXPLAIN QUERY PLAN SELECT * FROM big WHERE code = 'code-0500'")
for r in cur.fetchall():
    print(r)

# 索引不是万能的
# WHY: 写多读少的场景索引反而拖慢，需权衡
print("\\n索引代价: 写入时需更新索引")
start = time.perf_counter()
cur.execute("BEGIN")
for i in range(1000):
    cur.execute("INSERT INTO big (name, code) VALUES (?, ?)", (f"new-{i}", f"new-{i:04d}"))
cur.execute("COMMIT")
print(f"带索引插入 1000 条: {time.perf_counter() - start:.3f}s")

conn.close()

\`\`\`

## 七、外键与关系

\`\`\`python
import sqlite3


conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

# 一对多关系
cur.executescript("""
    CREATE TABLE authors (
        id INTEGER PRIMARY KEY,
        name TEXT
    );
    CREATE TABLE books (
        id INTEGER PRIMARY KEY,
        title TEXT,
        author_id INTEGER,
        FOREIGN KEY (author_id) REFERENCES authors(id)
            ON DELETE SET NULL  -- 作者删除时书保留，author_id 置空
    );
""")

cur.execute("INSERT INTO authors VALUES (1, '鲁迅')")
cur.execute("INSERT INTO authors VALUES (2, '老舍')")
cur.executemany("INSERT INTO books VALUES (?, ?, ?)",
                [(1, "呐喊", 1), (2, "彷徨", 1), (3, "骆驼祥子", 2)])
conn.commit()

# 外键约束检查
# WHY: 插入不存在的 author_id 会被拒绝
try:
    cur.execute("INSERT INTO books VALUES (99, '错误', 999)")
except sqlite3.IntegrityError as e:
    print(f"外键约束: {e}")

# ON DELETE SET NULL 演示
cur.execute("DELETE FROM authors WHERE id = 1")
conn.commit()
cur.execute("SELECT * FROM books")
for r in cur.fetchall():
    print(r)

# 多对多关系：通过中间表
cur.executescript("""
    CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE courses (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE enrollments (
        student_id INTEGER,
        course_id INTEGER,
        grade TEXT,
        PRIMARY KEY (student_id, course_id),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
    );
""")
cur.executemany("INSERT INTO students VALUES (?, ?)", [(1, "张三"), (2, "李四")])
cur.executemany("INSERT INTO courses VALUES (?, ?)", [(1, "数学"), (2, "英语"), (3, "物理")])
cur.executemany("INSERT INTO enrollments VALUES (?, ?, ?)",
                [(1, 1, "A"), (1, 2, "B"), (2, 1, "A"), (2, 3, "C")])
conn.commit()

# 查询学生选课
print("\\n--- 学生选课 ---")
cur.execute("""
    SELECT s.name, c.name, e.grade
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN courses c ON e.course_id = c.id
""")
for r in cur.fetchall():
    print(r)

conn.close()

\`\`\`

## 八、数据库规范化

\`\`\`python
import sqlite3


# 反例：未规范化的表
# WHY: 数据冗余、更新异常、插入异常
print("--- 未规范化（问题）---")
print("| 订单ID | 客户 | 客户地址 | 商品 | 单价 | 数量 |")
print("| 1 | 张三 | 北京 | 手机 | 7999 | 1 |")
print("| 2 | 张三 | 北京 | 配件 | 199 | 2 |")  # 地址重复
print("问题: 客户地址重复存储；改地址要改多行")

# 规范化后：分离客户、商品、订单
conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()
cur.executescript("""
    -- 第一范式：原子值，无重复组
    -- 第二范式：非主键字段完全依赖主键
    -- 第三范式：非主键字段不传递依赖
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        address TEXT
    );
    CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL
    );
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE TABLE order_items (
        id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        unit_price REAL,  -- 冗余存储当时价格
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
""")

cur.execute("INSERT INTO customers VALUES (1, '张三', '北京')")
cur.execute("INSERT INTO products VALUES (1, '手机', 7999)")
cur.execute("INSERT INTO products VALUES (2, '配件', 199)")
cur.execute("INSERT INTO orders VALUES (1, 1, '2024-01-01')")
cur.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?)",
                [(1, 1, 1, 1, 7999), (2, 1, 2, 2, 199)])
conn.commit()

print("\\n--- 规范化查询 ---")
cur.execute("""
    SELECT o.id, c.name, c.address, p.name, oi.quantity, oi.unit_price
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
""")
for r in cur.fetchall():
    print(r)

conn.close()

\`\`\`

## 九、综合实战：学生管理系统

\`\`\`python
import sqlite3
from dataclasses import dataclass
from typing import Optional


@dataclass
class Student:
    id: Optional[int]
    name: str
    age: int
    gender: str


@dataclass
class Course:
    id: Optional[int]
    name: str
    credit: float


class StudentManagementSystem:
    """完整的学生管理系统"""

    def __init__(self, db_path: str = ":memory:"):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON")
        self._init_db()

    def _init_db(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER CHECK (age > 0),
                gender TEXT CHECK (gender IN ('M', 'F'))
            );
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                credit REAL DEFAULT 1.0
            );
            CREATE TABLE IF NOT EXISTS scores (
                student_id INTEGER,
                course_id INTEGER,
                score REAL,
                PRIMARY KEY (student_id, course_id),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_scores_student ON scores(student_id);
        """)
        self.conn.commit()

    # 学生 CRUD
    def add_student(self, s: Student) -> int:
        cur = self.conn.execute(
            "INSERT INTO students (name, age, gender) VALUES (?, ?, ?)",
            (s.name, s.age, s.gender),
        )
        self.conn.commit()
        return cur.lastrowid

    def list_students(self) -> list[dict]:
        rows = self.conn.execute("SELECT * FROM students ORDER BY id").fetchall()
        return [dict(r) for r in rows]

    def update_student(self, sid: int, **kwargs) -> bool:
        # 动态构造 UPDATE
        # WHY: 灵活更新部分字段，避免覆盖为 None
        allowed = {"name", "age", "gender"}
        fields = [f"{k} = ?" for k in kwargs if k in allowed]
        values = [v for k, v in kwargs.items() if k in allowed]
        if not fields:
            return False
        values.append(sid)
        cur = self.conn.execute(
            f"UPDATE students SET {', '.join(fields)} WHERE id = ?", values
        )
        self.conn.commit()
        return cur.rowcount > 0

    def delete_student(self, sid: int) -> bool:
        cur = self.conn.execute("DELETE FROM students WHERE id = ?", (sid,))
        self.conn.commit()
        return cur.rowcount > 0

    # 课程管理
    def add_course(self, c: Course) -> int:
        cur = self.conn.execute(
            "INSERT INTO courses (name, credit) VALUES (?, ?)", (c.name, c.credit)
        )
        self.conn.commit()
        return cur.lastrowid

    # 选课与成绩
    def enroll(self, student_id: int, course_id: int, score: float = 0) -> bool:
        try:
            self.conn.execute(
                "INSERT INTO scores (student_id, course_id, score) VALUES (?, ?, ?)",
                (student_id, course_id, score),
            )
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False

    def get_transcript(self, student_id: int) -> list[dict]:
        rows = self.conn.execute("""
            SELECT c.name, c.credit, s.score
            FROM scores s
            JOIN courses c ON s.course_id = c.id
            WHERE s.student_id = ?
            ORDER BY c.name
        """, (student_id,)).fetchall()
        return [dict(r) for r in rows]

    def get_student_summary(self, student_id: int) -> dict:
        # 计算加权平均分
        rows = self.conn.execute("""
            SELECT c.credit, s.score
            FROM scores s
            JOIN courses c ON s.course_id = c.id
            WHERE s.student_id = ?
        """, (student_id,)).fetchall()
        if not rows:
            return {"count": 0, "avg": 0, "total_credit": 0}
        total_credit = sum(r["credit"] for r in rows)
        weighted = sum(r["credit"] * r["score"] for r in rows)
        return {
            "count": len(rows),
            "avg": weighted / total_credit if total_credit else 0,
            "total_credit": total_credit,
        }

    def class_ranking(self) -> list[dict]:
        # 全班排名
        rows = self.conn.execute("""
            SELECT st.id, st.name,
                   COUNT(s.course_id) AS courses,
                   AVG(s.score) AS avg_score
            FROM students st
            LEFT JOIN scores s ON s.student_id = st.id
            GROUP BY st.id
            ORDER BY avg_score DESC NULLS LAST
        """).fetchall()
        return [dict(r) for r in rows]


# 完整演示
sms = StudentManagementSystem()

# 添加学生
sid1 = sms.add_student(Student(None, "张三", 18, "M"))
sid2 = sms.add_student(Student(None, "李四", 19, "F"))
sid3 = sms.add_student(Student(None, "王五", 20, "M"))

# 添加课程
cid1 = sms.add_course(Course(None, "数学", 4.0))
cid2 = sms.add_course(Course(None, "英语", 3.0))
cid3 = sms.add_course(Course(None, "物理", 3.0))

# 选课并录入成绩
sms.enroll(sid1, cid1, 90)
sms.enroll(sid1, cid2, 85)
sms.enroll(sid1, cid3, 88)
sms.enroll(sid2, cid1, 92)
sms.enroll(sid2, cid2, 78)
sms.enroll(sid3, cid1, 70)

# 成绩单
print("=== 张三的成绩单 ===")
for r in sms.get_transcript(sid1):
    print(f"  {r['name']}: {r['score']} (学分 {r['credit']})")
print(f"汇总: {sms.get_student_summary(sid1)}")

# 班级排名
print("\\n=== 班级排名 ===")
for i, r in enumerate(sms.class_ranking(), 1):
    avg = f"{r['avg_score']:.1f}" if r["avg_score"] else "N/A"
    print(f"  {i}. {r['name']}: 平均 {avg}, 选课 {r['courses']}")

# 删除学生（级联删除成绩）
sms.delete_student(sid2)
print("\\n=== 删除李四后 ===")
for s in sms.list_students():
    print(f"  {s['name']}")

\`\`\`

## 小结

本章是 SQL 实战大全：

- **CRUD**：INSERT、SELECT、UPDATE、DELETE
- **WHERE**：比较、IN、BETWEEN、LIKE、NULL
- **ORDER BY**：排序、分页
- **GROUP BY**：COUNT、SUM、AVG、MAX、MIN、HAVING
- **JOIN**：INNER、LEFT、多表连接
- **索引**：加速查询，权衡写入
- **外键**：一对多、多对多关系
- **规范化**：1NF/2NF/3NF
- **综合实战**：完整学生管理系统

数据库是后端开发的核心，下一部分我们进入测试与工程化，让代码更可靠。
`
  }
];

export { chapters };
