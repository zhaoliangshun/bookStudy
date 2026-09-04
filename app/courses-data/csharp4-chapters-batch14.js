// =============================================================
// C# 从入门到精通大全（全新版）—— 第 14 批章节（最后一批）
// 第十二部分 网络编程 + 第十三部分 工程化实战 + 结尾（共 10 章）
// -------------------------------------------------------------
// 本批包含 10 章：
//   csharp4-ch69       : 第六十九章 HTTP 客户端
//   csharp4-ch70       : 第七十章 Socket 与 TCP
//   csharp4-ch71       : 第七十一章 UDP 与 IPC
//   csharp4-ch72       : 第七十二章 WebSocket 与 gRPC 简介
//   csharp4-ch73       : 第七十三章 依赖注入与配置
//   csharp4-ch74       : 第七十四章 单元测试
//   csharp4-ch75       : 第七十五章 ASP.NET Core 简介
//   csharp4-ch76       : 第七十六章 EF Core 数据访问
//   csharp4-ch77       : 第七十七章 综合项目实战
//   csharp4-conclusion : 结语与学习路线
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第六十九章 HTTP 客户端
  // ============================================================
  {
    id: 'csharp4-ch69',
    group: '第十二部分 网络编程',
    icon: '🌐',
    title: 'HTTP 客户端',
    content: `## 第七十章　HTTP 客户端

### 一、HttpClient 是什么

\`HttpClient\` 是 .NET 内置的 HTTP 客户端，用来发送 HTTP 请求、接收 HTTP 响应。日常开发中调用 RESTful API、Webhook、第三方服务（如微信支付、阿里云 OSS）都靠它。

### 二、HttpClient 的核心方法

| 方法 | 用途 |
| --- | --- |
| \`GetAsync(url)\` | 发送 GET 请求 |
| \`PostAsync(url, content)\` | 发送 POST 请求 |
| \`PutAsync(url, content)\` | 发送 PUT 请求 |
| \`DeleteAsync(url)\` | 发送 DELETE 请求 |
| \`PatchAsync(url, content)\` | 发送 PATCH 请求 |
| \`SendAsync(request)\` | 通用方法，可自定义请求 |

### 三、HttpClient 的常见陷阱

**错误写法（每次 new 一个 HttpClient）**：

\`\`\`csharp
using var client = new HttpClient();  // ❌ 不要这样写
var result = await client.GetStringAsync("https://api.example.com");
\`\`\`

问题：\`HttpClient\` 内部维护一个连接池，每次 new 都会创建新的 TCP 连接，导致端口耗尽（Socket Exhaustion），高并发时会爆掉。

**正确写法（复用单例）**：

\`\`\`csharp
// 应用启动时创建一次，全程复用
private static readonly HttpClient _client = new HttpClient();
\`\`\`

更好的做法：使用 \`IHttpClientFactory\`（ASP.NET Core 推荐）。

### 四、IHttpClientFactory 三种模式

1. **直接模式**：\`services.AddHttpClient();\` → 通过 \`IHttpClientFactory.CreateClient()\` 获取
2. **命名客户端**：\`services.AddHttpClient("github", c => c.BaseAddress = new Uri("https://api.github.com"));\`
3. **类型化客户端**：自定义一个 \`GitHubService\` 类，构造函数注入 \`HttpClient\`

### 五、JSON 请求与响应

\`\`\`csharp
// 序列化请求体
var user = new { name = "Tom", age = 18 };
var content = JsonContent.Create(user);  // 自动设置 Content-Type: application/json

// 发送
var response = await client.PostAsync("/api/users", content);

// 反序列化响应体
var result = await response.Content.ReadFromJsonAsync<User>();
\`\`\`

### 六、超时与取消

\`\`\`csharp
client.Timeout = TimeSpan.FromSeconds(10);  // 全局超时

// 或者用 CancellationToken 精确控制
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
var response = await client.GetAsync(url, cts.Token);
\`\`\`

### 七、Polly 集成（重试与熔断）

\`\`\`csharp
services.AddHttpClient("api")
    .AddTransientHttpErrorPolicy(policy =>
        policy.WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(attempt)));
\`\`\`

### 八、HTTP 请求消息（HttpRequestMessage）

需要自定义 Header、Method、Version 时使用：

\`\`\`csharp
var request = new HttpRequestMessage(HttpMethod.Post, "/api/users");
request.Headers.Add("Authorization", "Bearer xxx-token");
request.Content = new StringContent(json, Encoding.UTF8, "application/json");
var response = await client.SendAsync(request);
\`\`\`

### 九、HttpContent 派生类

- \`StringContent\`：字符串内容
- \`JsonContent\`：JSON 内容（推荐）
- \`ByteArrayContent\`：字节数组
- \`StreamContent\`：流内容（上传文件）
- \`MultipartFormDataContent\`：multipart/form-data（上传表单+文件）
- \`FormUrlEncodedContent\`：表单编码

### 十、实战建议

- ✅ 在 ASP.NET Core 中始终用 \`IHttpClientFactory\`
- ✅ 控制台应用也建议用 \`Microsoft.Extensions.Http\`
- ✅ 总是设置 \`Timeout\` 或传入 \`CancellationToken\`
- ✅ 用 \`ReadFromJsonAsync<T>\` 代替手动 \`JsonSerializer.Deserialize\`
- ❌ 不要 \`using var client = new HttpClient();\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「HTTP 客户端」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第六十九章 HTTP 客户端 —— demo
// ------------------------------------------------------------
// 演示 HttpClient 的常见用法，包括：
//   1. 单例 HttpClient（推荐方式）
//   2. JSON 请求与响应
//   3. 自定义 HttpRequestMessage 设置 Header
//   4. 超时与 CancellationToken
//   5. Mock 数据避免真实网络请求（沙箱无外网）
// ============================================================

using System.Net.Http.Json;  // 引入 ReadFromJsonAsync / JsonContent 扩展
using System.Text.Json.Serialization;

// 全局单例 HttpClient（重要：不要每次 new）
// 沙箱中只演示 API 用法，不真实访问外网
var client = new HttpClient
{
    BaseAddress = new Uri("https://api.example.com"),  // 假设的 API 地址
    Timeout = TimeSpan.FromSeconds(5),                  // 设置全局超时 5 秒
};

// 设置默认请求头（所有请求都会带上）
client.DefaultRequestHeaders.Add("User-Agent", "CSharp4-Tutorial/1.0");
client.DefaultRequestHeaders.Add("Accept", "application/json");

// ------------------------------------------------------------
// Demo 1：用 Mock 演示 JSON 反序列化模式
// ------------------------------------------------------------
Console.WriteLine("=== Demo 1：模拟 GET 请求反序列化 ===");

// 真实场景：var response = await client.GetAsync("/api/users/1");
// 这里直接 mock 一段 JSON 字符串来演示反序列化逻辑
var mockJson = """{"id":1,"name":"张三","email":"zhangsan@example.com","age":28}""";

// JsonSerializer 反序列化
var user = System.Text.Json.JsonSerializer.Deserialize<User>(mockJson);
Console.WriteLine($"反序列化结果：[{user!.Id}] {user.Name} <{user.Email}>，{user.Age} 岁");

// ------------------------------------------------------------
// Demo 2：构造 JSON 请求体
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 2：构造 JSON 请求体 ===");

var newUser = new User { Id = 0, Name = "李四", Email = "lisi@example.com", Age = 25 };
var jsonContent = JsonContent.Create(newUser);  // 自动设置 Content-Type: application/json

// 打印请求体内容
var requestBody = await jsonContent.ReadAsStringAsync();
Console.WriteLine($"请求体 JSON：{requestBody}");
Console.WriteLine($"Content-Type：{jsonContent.Headers.ContentType}");

// ------------------------------------------------------------
// Demo 3：自定义 HttpRequestMessage 设置 Header
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 3：自定义请求消息 ===");

// 模拟带 Bearer Token 的请求构造
var request = new HttpRequestMessage(HttpMethod.Post, "/api/users")
{
    Content = JsonContent.Create(newUser),
};
request.Headers.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token");
request.Headers.Add("X-Request-Id", Guid.NewGuid().ToString());

Console.WriteLine($"请求方法：{request.Method}");
Console.WriteLine($"请求 URL：{request.RequestUri}");
Console.WriteLine($"Authorization：{request.Headers.Authorization}");
Console.WriteLine($"X-Request-Id：{request.Headers.GetValues("X-Request-Id").First()}");

// ------------------------------------------------------------
// Demo 4：超时与 CancellationToken
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 4：CancellationToken 控制超时 ===");

using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(100));

try
{
    // 模拟一个长时间任务被取消
    await Task.Delay(500, cts.Token);
    Console.WriteLine("任务完成（不会到这里）");
}
catch (OperationCanceledException)
{
    Console.WriteLine("任务已被 CancellationToken 取消（100ms 超时）");
}

// ------------------------------------------------------------
// Demo 5：模拟 IHttpClientFactory 简易实现
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 5：模拟 IHttpClientFactory ===");

// 真实场景：services.AddHttpClient("github", c => c.BaseAddress = new Uri("..."));
// 这里用一个工厂方法模拟
var httpClientFactory = new SimpleHttpClientFactory();
var githubClient = httpClientFactory.CreateClient("github");
Console.WriteLine($"github 客户端 BaseAddress：{githubClient.BaseAddress}");
Console.WriteLine($"github 客户端 User-Agent：{githubClient.DefaultRequestHeaders.UserAgent}");

// ------------------------------------------------------------
// Demo 6：模拟 HTTP 响应处理
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 6：模拟响应处理 ===");

// 真实场景：var response = await client.GetAsync(url); response.EnsureSuccessStatusCode();
// 这里用 HttpResponseMessage 模拟
using var mockResponse = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
{
    Content = new StringContent(mockJson, System.Text.Encoding.UTF8, "application/json"),
};
mockResponse.Headers.Add("X-RateLimit-Remaining", "4999");

Console.WriteLine($"响应状态码：{(int)mockResponse.StatusCode} {mockResponse.StatusCode}");
Console.WriteLine($"响应头 X-RateLimit-Remaining：{mockResponse.Headers.GetValues("X-RateLimit-Remaining").First()}");

// 读取响应内容
var responseContent = await mockResponse.Content.ReadAsStringAsync();
Console.WriteLine($"响应体：{responseContent}");

// 用 ReadFromJsonAsync 反序列化
var userFromResponse = await mockResponse.Content.ReadFromJsonAsync<User>();
Console.WriteLine($"从响应反序列化：{userFromResponse!.Name} ({userFromResponse.Email})");

// ------------------------------------------------------------
// 类型定义放在文件末尾
// ------------------------------------------------------------

// 业务实体类（用于 JSON 序列化）
public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int Age { get; set; }
}

// 模拟 IHttpClientFactory 的简易实现
public class SimpleHttpClientFactory
{
    // 预定义的命名客户端配置（模拟 AddHttpClient("name", config)）
    private readonly Dictionary<string, Action<HttpClient>> _configs = new()
    {
        ["github"] = c =>
        {
            c.BaseAddress = new Uri("https://api.github.com");
            c.DefaultRequestHeaders.Add("User-Agent", "CSharp4-App");
        },
        ["default"] = c =>
        {
            c.BaseAddress = new Uri("https://api.example.com");
        },
    };

    // 创建命名 HttpClient
    public HttpClient CreateClient(string name)
    {
        var client = new HttpClient();
        if (_configs.TryGetValue(name, out var config))
        {
            config(client);
        }
        return client;
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十章 Socket 与 TCP
  // ============================================================
  {
    id: 'csharp4-ch70',
    group: '第十二部分 网络编程',
    icon: '🔌',
    title: 'Socket 与 TCP',
    content: `## 第七十一章　Socket 与 TCP

### 一、Socket 是什么

Socket 是网络通信的底层抽象。无论是 HTTP、FTP、WebSocket 还是自定义协议，最终都基于 Socket。

### 二、TCP vs UDP

| 特性 | TCP | UDP |
| --- | --- | --- |
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 保证送达 | 不保证 |
| 顺序 | 保证顺序 | 不保证 |
| 速度 | 慢 | 快 |
| 应用场景 | HTTP/HTTPS/SSH | DNS/视频流/游戏 |

### 三、TCP 通信模型

\`\`\`
服务端                          客户端
  |                               |
  | 1. TcpListener.Start()        |
  |                               |
  | <--- 2. TcpClient.Connect() --|
  |                               |
  | 3. AcceptTcpClient()          |
  |                               |
  | <=== 4. 发送数据 =============|
  |                               |
  | ==== 5. 回复数据 ============>|
  |                               |
  | 6. Close()                    |
\`\`\`

### 四、TcpListener（服务端）

\`\`\`csharp
var listener = new TcpListener(IPAddress.Loopback, 9000);
listener.Start();
var client = listener.AcceptTcpClient();  // 阻塞等待连接
\`\`\`

### 五、TcpClient（客户端）

\`\`\`csharp
var client = new TcpClient();
await client.ConnectAsync(IPAddress.Loopback, 9000);
\`\`\`

### 六、NetworkStream 双向流

\`\`\`csharp
using var stream = client.GetStream();
// 读
var buffer = new byte[1024];
var bytesRead = await stream.ReadAsync(buffer);
var message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
// 写
var bytes = Encoding.UTF8.GetBytes("hello");
await stream.WriteAsync(bytes);
\`\`\`

### 七、IPEndPoint 与 IPAddress

- \`IPAddress.Loopback\` = \`127.0.0.1\`（IPv4）
- \`IPAddress.IPv6Loopback\` = \`::1\`
- \`IPAddress.Any\` = 监听所有网卡
- \`IPEndPoint\` = IP + 端口

### 八、Socket 高级用法

\`Socket\` 类比 \`TcpListener/TcpClient\` 更底层，可控制：
- \`SocketOptionName.ReuseAddress\`：端口复用
- \`SocketOptionName.KeepAlive\`：TCP 心跳
- \`SocketOptionName.ReceiveBuffer\`：接收缓冲区大小

### 九、Span<byte> 高性能接收

\`\`\`csharp
var buffer = ArrayPool<byte>.Shared.Rent(1024);
try
{
    var span = buffer.AsSpan();
    var bytesRead = await stream.ReadAsync(span);
    // ...
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer);
}
\`\`\`

### 十、注意事项

- 服务端要 \`Stop()\`，客户端要 \`Close()\`，避免端口泄漏
- 多客户端并发用 \`Task.Run\` 或 \`AcceptTcpClientAsync\` 循环
- 真实生产用 \`SocketAsyncEventArgs\` 或 \`System.IO.Pipelines\` 提升性能

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「Socket 与 TCP」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十章 Socket 与 TCP —— demo
// ------------------------------------------------------------
// 在同一进程内启动 TCP Echo Server + Client，演示：
//   1. TcpListener 启动监听
//   2. TcpClient 连接服务端
//   3. NetworkStream 双向读写
//   4. 客户端发送消息，服务端原样返回（Echo）
// ============================================================

using System.Net;
using System.Net.Sockets;
using System.Text;

const int Port = 9100;  // 选一个不太可能被占用的端口
var ip = IPAddress.Loopback;  // 127.0.0.1，只监听本机

// ------------------------------------------------------------
// 启动 TCP Echo Server（后台线程运行）
// ------------------------------------------------------------
var listener = new TcpListener(ip, Port);

// 设置端口复用，避免 TIME_WAIT 导致下次启动失败
listener.Server.SetSocketOption(
    SocketOptionLevel.Socket,
    SocketOptionName.ReuseAddress,
    true);

listener.Start();
Console.WriteLine($"[Server] 监听 {ip}:{Port}，等待客户端连接...");

// 启动一个后台 Task 接受并处理一个连接
var serverTask = Task.Run(async () =>
{
    try
    {
        // 阻塞等待客户端连接（这里只接受一个连接演示）
        var client = await listener.AcceptTcpClientAsync();
        Console.WriteLine("[Server] 客户端已连接");

        using (client)
        using (var stream = client.GetStream())
        {
            // 接收客户端消息
            var buffer = new byte[1024];
            var bytesRead = await stream.ReadAsync(buffer);
            var message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            Console.WriteLine($"[Server] 收到消息：{message}");

            // Echo：把消息原样返回
            var reply = $"ECHO: {message}";
            var replyBytes = Encoding.UTF8.GetBytes(reply);
            await stream.WriteAsync(replyBytes);
            Console.WriteLine($"[Server] 已回复：{reply}");
        }

        Console.WriteLine("[Server] 客户端断开");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Server] 异常：{ex.Message}");
    }
    finally
    {
        listener.Stop();
        Console.WriteLine("[Server] 已停止监听");
    }
});

// 等一下确保 server 已开始监听
await Task.Delay(100);

// ------------------------------------------------------------
// 客户端连接
// ------------------------------------------------------------
Console.WriteLine("\\n[Client] 准备连接到 server...");

using var tcpClient = new TcpClient();
await tcpClient.ConnectAsync(ip, Port);
Console.WriteLine("[Client] 已连接到 server");

using var stream = tcpClient.GetStream();

// 发送消息
var message = "Hello, C# TCP Server!";
var sendBytes = Encoding.UTF8.GetBytes(message);
await stream.WriteAsync(sendBytes);
Console.WriteLine($"[Client] 已发送：{message}");

// 接收服务端回复
var buffer = new byte[1024];
var bytesRead = await stream.ReadAsync(buffer);
var reply = Encoding.UTF8.GetString(buffer, 0, bytesRead);
Console.WriteLine($"[Client] 收到回复：{reply}");

// ------------------------------------------------------------
// 演示 IPEndPoint 的使用
// ------------------------------------------------------------
Console.WriteLine("\\n=== IPEndPoint 信息 ===");
var endpoint = new IPEndPoint(ip, Port);
Console.WriteLine($"AddressFamily：{endpoint.AddressFamily}");
Console.WriteLine($"Address：{endpoint.Address}");
Console.WriteLine($"Port：{endpoint.Port}");

// 等 server task 完成收尾
await serverTask;

Console.WriteLine("\\n=== demo 完成 ===");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十一章 UDP 与 IPC
  // ============================================================
  {
    id: 'csharp4-ch71',
    group: '第十二部分 网络编程',
    icon: '📨',
    title: 'UDP 与 IPC',
    content: `## 第七十二章　UDP 与 IPC

### 一、UDP 通信

UDP 是无连接的、不可靠的、面向消息的协议。比 TCP 轻量，适合实时性要求高、允许丢包的场景（如 DNS、视频流、游戏心跳）。

\`\`\`csharp
using var udpClient = new UdpClient(9200);  // 绑定端口
var ep = new IPEndPoint(IPAddress.Loopback, 9201);
var bytes = Encoding.UTF8.GetBytes("hello udp");
await udpClient.SendAsync(bytes, bytes.Length, ep);  // 发送
var result = await udpClient.ReceiveAsync();         // 接收
\`\`\`

### 二、UnixDomainSocketEndPoint（跨平台 IPC）

.NET 5+ 支持跨平台的 Unix Domain Socket（Windows 10+ 也支持），性能远高于 TCP（不经网络栈）。

\`\`\`csharp
var endpoint = new UnixDomainSocketEndPoint("/tmp/myapp.sock");
using var listener = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified);
listener.Bind(endpoint);
listener.Listen();
\`\`\`

### 三、命名管道（NamedPipe）

\`NamedPipeServerStream\` / \`NamedPipeClientStream\` 适合 Windows，但 .NET Core 起也支持跨平台。

特点：
- 双向通信
- 支持多个客户端连接同一个服务端
- 比 TCP 更快（不经过网络栈）
- 适合本机进程间通信

\`\`\`csharp
// 服务端
using var server = new NamedPipeServerStream("mypipe", PipeDirection.InOut);
await server.WaitForConnectionAsync();

// 客户端
using var client = new NamedPipeClientStream(".", "mypipe", PipeDirection.InOut);
await client.ConnectAsync();
\`\`\`

### 四、AnonymousPipe

父子进程通信专用，单向。父进程创建 \`AnonymousPipeServerStream\`，把 \`GetClientHandleAsString()\` 传给子进程，子进程用 \`AnonymousPipeClientStream\` 包装这个 handle。

### 五、MemoryMappedFile（共享内存）

最快的 IPC，多进程直接共享一块内存。

\`\`\`csharp
// 进程 A：创建
using var mmf = MemoryMappedFile.CreateOrOpen("mymap", 1024);
using var accessor = mmf.CreateViewAccessor();
accessor.Write(0, 42);

// 进程 B：读取
using var mmf2 = MemoryMappedFile.OpenExisting("mymap");
using var accessor2 = mmf2.CreateViewAccessor();
int value = accessor2.ReadInt32(0);
\`\`\`

### 六、IPC 选型对比

| 方式 | 跨平台 | 双向 | 速度 | 复杂度 |
| --- | --- | --- | --- | --- |
| TCP/UDP | ✅ | ✅ | 中 | 中 |
| UnixSocket | ✅ | ✅ | 快 | 中 |
| NamedPipe | ✅ | ✅ | 快 | 低 |
| MemoryMappedFile | ✅ | ❌（需配合信号量） | 极快 | 中 |
| AnonymousPipe | ✅ | ❌（单向） | 快 | 低 |

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「UDP 与 IPC」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十一章 UDP 与 IPC —— demo
// ------------------------------------------------------------
// 演示：
//   1. UdpClient UDP 通信
//   2. NamedPipeServerStream + NamedPipeClientStream 进程内通信
//   3. MemoryMappedFile 共享内存
// ============================================================

using System.IO.Pipes;
using System.IO.MemoryMappedFiles;
using System.Net;
using System.Net.Sockets;
using System.Text;

// ------------------------------------------------------------
// Demo 1：UDP 通信
// ------------------------------------------------------------
Console.WriteLine("=== Demo 1：UDP 通信 ===");

using var udpReceiver = new UdpClient(new IPEndPoint(IPAddress.Loopback, 0));
int udpPort = ((IPEndPoint)udpReceiver.Client.LocalEndPoint!).Port;
var receiverEp = new IPEndPoint(IPAddress.Loopback, 0);

// 后台 Task 接收
var udpReceiveTask = Task.Run(async () =>
{
    var result = await udpReceiver.ReceiveAsync();
    var message = Encoding.UTF8.GetString(result.Buffer);
    Console.WriteLine($"[UDP 接收] 来自 {result.RemoteEndPoint}：{message}");
});

await Task.Delay(50);  // 确保接收端已就绪

// 发送端
using var udpSender = new UdpClient();
var targetEp = new IPEndPoint(IPAddress.Loopback, udpPort);
var bytes = Encoding.UTF8.GetBytes("Hello UDP!");
await udpSender.SendAsync(bytes, bytes.Length, targetEp);
Console.WriteLine($"[UDP 发送] 已发送：Hello UDP!");

await udpReceiveTask;

// ------------------------------------------------------------
// Demo 2：匿名管道（同进程可靠；NamedPipe 在 macOS 上受 Unix 域套接字路径长度限制）
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 2：匿名管道 IPC ===");

using (var server = new AnonymousPipeServerStream(PipeDirection.Out))
using (var client = new AnonymousPipeClientStream(PipeDirection.In, server.GetClientHandleAsString()))
{
    var payload = Encoding.UTF8.GetBytes("Hello Anonymous Pipe!");
    var readBuf = new byte[256];
    var readTask = client.ReadAsync(readBuf).AsTask();
    await server.WriteAsync(payload);
    int n = await readTask;
    Console.WriteLine($"[AnonymousPipe] 收到：{Encoding.UTF8.GetString(readBuf, 0, n)}");
}

// ------------------------------------------------------------
// Demo 3：内存映射文件（MemoryMappedFile）
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 3：内存映射文件 ===");

var mmfFile = Path.Combine(Path.GetTempPath(), $"csharp4-mmf-anon-{Guid.NewGuid()}.dat");
try
{
    // CreateNew(name) 依赖命名共享内存，macOS 不支持；改用文件后备（跨平台）
    using var mmf = MemoryMappedFile.CreateFromFile(mmfFile, FileMode.Create, mapName: null, capacity: 1024);

    using var accessor = mmf.CreateViewAccessor();

    accessor.Write(0, 42);
    accessor.Write(4, 3.14f);
    var str = "Hello MMF!";
    var strBytes = Encoding.UTF8.GetBytes(str);
    accessor.WriteArray(8, strBytes, 0, strBytes.Length);
    Console.WriteLine("[MMF] 已写入数据：42, 3.14, 'Hello MMF!'");

    using var accessor2 = mmf.CreateViewAccessor();
    int intValue = accessor2.ReadInt32(0);
    float floatValue = accessor2.ReadSingle(4);
    var strBuffer = new byte[32];
    accessor2.ReadArray(8, strBuffer, 0, strBuffer.Length);
    var strValue = Encoding.UTF8.GetString(strBuffer).TrimEnd('\\0');
    Console.WriteLine($"[MMF] 读取数据：{intValue}, {floatValue}, '{strValue}'");
}
finally
{
    try { File.Delete(mmfFile); } catch { /* ignore */ }
}

// ------------------------------------------------------------
// Demo 4：MemoryMappedFile 持久化到磁盘
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 4：持久化内存映射 ===");

var tempFile = Path.Combine(Path.GetTempPath(), $"csharp4-mmf-{Guid.NewGuid()}.dat");
try
{
    // 从文件创建 MMF
    using var fsMmf = MemoryMappedFile.CreateFromFile(tempFile, FileMode.Create, mapName: null, capacity: 1024);
    using var fsAccessor = fsMmf.CreateViewAccessor();
    fsAccessor.Write(0, DateTime.UtcNow.Ticks);
    Console.WriteLine($"[持久化 MMF] 写入当前 UTC Ticks：{fsAccessor.ReadInt64(0)}");
    Console.WriteLine($"文件路径：{tempFile}");
}
finally
{
    try { File.Delete(tempFile); } catch { /* ignore */ }
}

Console.WriteLine("\\n=== demo 完成 ===");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十二章 WebSocket 与 gRPC 简介
  // ============================================================
  {
    id: 'csharp4-ch72',
    group: '第十二部分 网络编程',
    icon: '📡',
    title: 'WebSocket 与 gRPC 简介',
    content: `## 第七十三章　WebSocket 与 gRPC 简介

### 一、WebSocket 协议

WebSocket 是基于 TCP 的全双工通信协议。HTTP 是请求-响应模式，WebSocket 允许服务端主动推送数据。

**典型场景**：聊天、实时通知、股票行情、协同编辑。

### 二、ClientWebSocket（客户端）

\`\`\`csharp
using var ws = new ClientWebSocket();
await ws.ConnectAsync(new Uri("wss://echo.example.com"), CancellationToken.None);

// 发送
var bytes = Encoding.UTF8.GetBytes("hello");
await ws.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);

// 接收
var buffer = new byte[4096];
var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
var message = Encoding.UTF8.GetString(buffer, 0, result.Count);

// 关闭
await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "bye", CancellationToken.None);
\`\`\`

### 三、Server WebSocket（ASP.NET Core 中间件）

\`\`\`csharp
app.UseWebSockets();  // 启用 WebSocket 中间件

app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var ws = await context.WebSockets.AcceptWebSocketAsync();
        // 处理 ws...
    }
});
\`\`\`

### 四、WebSocket 关键点

- **心跳**：每隔一段时间发 ping，对方回 pong，超时则关闭
- **重连**：网络断开后自动重连
- **消息边界**：WebSocket 是消息导向的（不像 TCP 是字节流）
- **CloseStatus**：\`NormalClosure\`、\`EndpointUnavailable\`、\`PolicyViolation\` 等

### 五、SignalR 简介

ASP.NET Core SignalR 是 WebSocket 的封装，提供：
- 自动降级（WebSocket → Server-Sent Events → Long Polling）
- Hub 概念（客户端调用服务端方法、服务端推送客户端方法）
- 自动重连
- Group（按组推送）

\`\`\`csharp
// Hub 定义
public class ChatHub : Hub
{
    public async Task Send(string message)
        => await Clients.All.SendAsync("Receive", message);
}
\`\`\`

### 六、gRPC 概念

gRPC 是 Google 开源的高性能 RPC 框架，基于 **Protobuf**（接口描述语言）+ **HTTP/2**。

**优点**：
- 强类型契约（.proto 文件生成代码）
- 高性能（二进制 + HTTP/2 多路复用）
- 跨语言（C#/Go/Java/Python/Node 都能调）

### 七、gRPC 四种方法模式

| 模式 | 说明 | 场景 |
| --- | --- | --- |
| **Unary** | 单请求单响应 | 普通 RPC（最常用） |
| **Server Streaming** | 单请求，多响应 | 大数据流推送 |
| **Client Streaming** | 多请求，单响应 | 批量上传 |
| **Bi Streaming** | 双向流 | 聊天、实时游戏 |

### 八、gRPC 客户端（Grpc.Net.Client）

\`\`\`csharp
using var channel = GrpcChannel.ForAddress("https://localhost:5001");
var client = new Greeter.GreeterClient(channel);
var reply = await client.SayHelloAsync(new HelloRequest { Name = "C#" });
Console.WriteLine(reply.Message);
\`\`\`

### 九、Protobuf 序列化

Protobuf 比 JSON 更快、更小，但不可读。可读场景用 protobuf-net（C#）或 JSON 模式。

### 十、选型建议

| 场景 | 推荐 |
| --- | --- |
| 普通业务 API | RESTful + JSON |
| 内部服务间通信 | gRPC |
| 实时双向通信 | WebSocket / SignalR |
| 移动端推送 | SignalR / FCM |

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「WebSocket 与 gRPC 简介」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十二章 WebSocket 与 gRPC 简介 —— demo
// ------------------------------------------------------------
// 由于沙箱无外网也不能起 Web Server，本 demo 用 mock + 伪代码演示：
//   1. ClientWebSocket 的标准用法
//   2. WebSocket 消息收发循环
//   3. Mock gRPC 调用模式
//   4. SignalR Hub 调用模式演示
// ============================================================

using System.Net.WebSockets;
using System.Text;

// ------------------------------------------------------------
// Demo 1：ClientWebSocket 用法（不真实连接）
// ------------------------------------------------------------
Console.WriteLine("=== Demo 1：ClientWebSocket 标准用法 ===");

// 创建 WebSocket 客户端
using var ws = new ClientWebSocket();

// 模拟连接过程（沙箱无网络，直接演示代码结构）
Console.WriteLine($"WebSocket 状态：{ws.State}");
Console.WriteLine("（生产代码示例）");
Console.WriteLine(@"
// var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
// await ws.ConnectAsync(new Uri(""wss://echo.example.com""), cts.Token);
// var sendBytes = Encoding.UTF8.GetBytes(""hello ws"");
// await ws.SendAsync(sendBytes, WebSocketMessageType.Text, true, cts.Token);
// var buffer = new byte[4096];
// var result = await ws.ReceiveAsync(buffer, cts.Token);
// var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
");

// ------------------------------------------------------------
// Demo 2：Mock WebSocket Echo 服务器实现（本地模拟）
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 2：Mock WebSocket Echo ===");

// 用 Channel<T> 模拟 WebSocket 的收发消息流
var incomingChannel = System.Threading.Channels.Channel.CreateUnbounded<string>();
var outgoingChannel = System.Threading.Channels.Channel.CreateUnbounded<string>();

// 模拟服务端 Echo：把 incoming 的消息原样发回 outgoing
var serverTask = Task.Run(async () =>
{
    await foreach (var message in incomingChannel.Reader.ReadAllAsync())
    {
        Console.WriteLine($"[WS Server] 收到：{message}");
        await outgoingChannel.Writer.WriteAsync($"ECHO: {message}");
    }
    Console.WriteLine("[WS Server] 客户端已关闭");
    outgoingChannel.Writer.Complete();
});

// 模拟客户端：发送 3 条消息
var clientTask = Task.Run(async () =>
{
    var messages = new[] { "Hello", "WebSocket", "Goodbye" };
    foreach (var msg in messages)
    {
        await incomingChannel.Writer.WriteAsync(msg);
        Console.WriteLine($"[WS Client] 发送：{msg}");

        // 接收回复
        var reply = await outgoingChannel.Reader.ReadAsync();
        Console.WriteLine($"[WS Client] 收到：{reply}");
    }

    incomingChannel.Writer.Complete();
});

await clientTask;
await serverTask;

// ------------------------------------------------------------
// Demo 3：WebSocket 心跳与重连模式
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 3：心跳与重连模式 ===");

await RunHeartbeatDemo();

async Task RunHeartbeatDemo()
{
    using var heartbeatCts = new CancellationTokenSource();
    var lastPong = DateTime.UtcNow;

    // 心跳 Task：每 3 秒发 ping
    var heartbeatTask = Task.Run(async () =>
    {
        while (!heartbeatCts.Token.IsCancellationRequested)
        {
            await Task.Delay(3000, heartbeatCts.Token);
            try
            {
                Console.WriteLine("[心跳] 发送 ping");
                // 实际：await ws.SendAsync(pingBytes, ..., cts.Token);
                lastPong = DateTime.UtcNow;
                Console.WriteLine("[心跳] 收到 pong");
            }
            catch (OperationCanceledException) { break; }
        }
    });

    // 仅运行 5 秒演示
    await Task.Delay(5000);
    heartbeatCts.Cancel();
    try { await heartbeatTask; } catch { /* ignore */ }

    Console.WriteLine($"最后一次心跳时间：{lastPong:HH:mm:ss}");
}

// ------------------------------------------------------------
// Demo 4：模拟 gRPC 客户端调用
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 4：模拟 gRPC 调用 ===");

// 真实代码：
// using var channel = GrpcChannel.ForAddress("https://localhost:5001");
// var client = new Greeter.GreeterClient(channel);
// var reply = await client.SayHelloAsync(new HelloRequest { Name = "C#" });
// Console.WriteLine(reply.Message);

// 这里 mock 一个 gRPC 客户端的本地实现
var grpcClient = new MockGreeterClient();
var grpcReply = await grpcClient.SayHelloAsync(new HelloRequest { Name = "C# 开发者" });
Console.WriteLine($"gRPC 响应：{grpcReply.Message}");

// 模拟 Server Streaming（多响应）
Console.WriteLine("\\n--- Server Streaming ---");
await foreach (var item in grpcClient.GetNumbersAsync(count: 5))
{
    Console.WriteLine($"收到流式数据：{item}");
}

// ------------------------------------------------------------
// Demo 5：模拟 SignalR Hub 调用
// ------------------------------------------------------------
Console.WriteLine("\\n=== Demo 5：模拟 SignalR Hub ===");

// SignalR Hub 模拟
var hub = new MockChatHub();
await hub.Send("张三", "大家好！");
await hub.Send("李四", "你好张三！");

// ------------------------------------------------------------
// 类型定义
// ------------------------------------------------------------

// Mock gRPC 请求/响应类型
public record HelloRequest { public string Name { get; init; } = ""; }
public record HelloReply { public string Message { get; init; } = ""; }

// Mock gRPC 客户端（演示调用模式）
public class MockGreeterClient
{
    // Unary：单请求单响应
    public Task<HelloReply> SayHelloAsync(HelloRequest request)
    {
        var reply = new HelloReply { Message = $"Hello, {request.Name}！" };
        return Task.FromResult(reply);
    }

    // Server Streaming：单请求多响应
    public async IAsyncEnumerable<int> GetNumbersAsync(int count)
    {
        for (int i = 0; i < count; i++)
        {
            await Task.Delay(100);  // 模拟网络延迟
            yield return i;
        }
    }
}

// Mock SignalR Hub
public class MockChatHub
{
    private readonly List<(string User, string Message)> _messages = new();

    // 客户端调用 Hub 方法
    public async Task Send(string user, string message)
    {
        _messages.Add((user, message));
        Console.WriteLine($"[Hub] {user}：{message}");

        // 模拟推送给所有客户端
        await Task.Delay(10);
        Console.WriteLine($"[Hub → 所有客户端] Receive({user}, {message})");
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十三章 依赖注入与配置
  // ============================================================
  {
    id: 'csharp4-ch73',
    group: '第十三部分 工程化实战',
    icon: '📦',
    title: '依赖注入与配置',
    content: `## 第七十四章　依赖注入与配置

### 一、依赖注入（DI）核心思想

**控制反转（IoC）**：对象不自己创建依赖，而是从外部容器获取。

**依赖注入（DI）**：IoC 的一种实现方式，通过构造函数、属性或方法参数注入依赖。

**好处**：
- 解耦：调用方与实现方分离
- 可测试：单元测试可注入 Mock 实现
- 生命周期管理：容器统一管理对象创建与释放

### 二、生命周期（Lifetime）

| 生命周期 | 说明 | 用途 |
| --- | --- | --- |
| \`Transient\` | 每次请求都 new | 轻量、无状态服务 |
| \`Scoped\` | 每个 Scope 内单例 | Web 请求范围内共享（EF Core DbContext） |
| \`Singleton\` | 全应用单例 | 缓存、配置、线程安全服务 |

\`\`\`csharp
services.AddTransient<ILogService, ConsoleLogService>();
services.AddScoped<IUserRepository, UserRepo>();
services.AddSingleton<ICache, MemoryCache>();
\`\`\`

### 三、IServiceProvider

\`\`\`csharp
IServiceProvider sp = services.BuildServiceProvider();

// 获取服务
var logger = sp.GetService<ILogService>();     // 没注册返回 null
var logger2 = sp.GetRequiredService<ILogService>();  // 没注册抛异常

// Scoped 服务需要创建 scope
using var scope = sp.CreateScope();
var repo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
\`\`\`

### 四、IEnumerable<T> 注册多个实现

\`\`\`csharp
services.AddTransient<INotifier, EmailNotifier>();
services.AddTransient<INotifier, SmsNotifier>();
services.AddTransient<INotifier, WechatNotifier>();

// 注入时用 IEnumerable<INotifier> 获取所有
public class UserService(IEnumerable<INotifier> notifiers) { ... }
\`\`\`

### 五、构造函数注入

\`\`\`csharp
public class UserService
{
    private readonly IUserRepository _repo;
    private readonly ILogService _log;

    // 构造函数注入：DI 容器自动传入
    public UserService(IUserRepository repo, ILogService log)
    {
        _repo = repo;
        _log = log;
    }
}
\`\`\`

### 六、Microsoft.Extensions.Configuration

支持多种配置源：
- \`appsettings.json\`
- 环境变量
- 命令行参数
- Azure Key Vault
- User Secrets（开发用）

\`\`\`csharp
var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables()
    .AddCommandLine(args)
    .Build();

var dbConn = config["ConnectionStrings:Default"];
\`\`\`

### 七、Options 模式（强类型配置）

\`\`\`csharp
// appsettings.json
{ "Jwt": { "Issuer": "api.example.com", "ExpireMinutes": 60 } }

// 类
public class JwtOptions { public string Issuer { get; set; } public int ExpireMinutes { get; set; } }

// 注册
services.Configure<JwtOptions>(config.GetSection("Jwt"));

// 注入
public class AuthService(IOptions<JwtOptions> options) { ... }
\`\`\`

### 八、IOptions / IOptionsMonitor / IOptionsSnapshot

| 类型 | 作用域 | 热更新 |
| --- | --- | --- |
| \`IOptions<T>\` | 单例 | ❌ |
| \`IOptionsSnapshot<T>\` | Scoped | ✅（文件变化时重读） |
| \`IOptionsMonitor<T>\` | 单例 | ✅ + 通知回调 |

### 九、命名选项

\`\`\`csharp
services.Configure<RedisOptions>("cache", config.GetSection("CacheRedis"));
services.Configure<RedisOptions>("queue", config.GetSection("QueueRedis"));

// 获取
var cacheOpts = sp.GetRequiredService<IOptionsSnapshot<RedisOptions>>().Get("cache");
\`\`\`

### 十、配置验证

\`\`\`csharp
services.Configure<JwtOptions>(config.GetSection("Jwt"))
    .ValidateDataAnnotations()  // 用 DataAnnotations 验证
    .ValidateOnStart();          // 启动时验证（.NET 6+）
\`\`\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「依赖注入与配置」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十三章 依赖注入与配置 —— demo
// ------------------------------------------------------------
// 用 ServiceCollection + ConfigurationBuilder 构建完整的迷你 DI 容器
// 注册三层：IUserRepository → UserService → UserController
// 演示：
//   1. 三种生命周期（Transient/Scoped/Singleton）
//   2. 构造函数注入
//   3. IEnumerable<T> 注册多个实现
//   4. Options 模式读取配置
//   5. Scope 概念
// ============================================================

using System.Reflection;

// ------------------------------------------------------------
// 1. 构建配置：模拟 appsettings.json
// ------------------------------------------------------------
Console.WriteLine("=== 1. 配置构建 ===");

// 用内存字典模拟 appsettings.json 内容
var configDict = new Dictionary<string, string?>
{
    ["App:Name"] = "CSharp4 Demo",
    ["App:Version"] = "1.0.0",
    ["ConnectionStrings:Default"] = "Server=localhost;Database=demo",
    ["Jwt:Issuer"] = "api.example.com",
    ["Jwt:ExpireMinutes"] = "60",
    ["Jwt:Audience"] = "web-client",
};

var config = new ConfigurationBuilder()
    .AddInMemoryCollection(configDict)  // 实际项目用 .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables(prefix: "CSHARP4_")  // CSHARP4_ 前缀的环境变量
    .Build();

Console.WriteLine($"App 名称：{config["App:Name"]}");
Console.WriteLine($"数据库连接：{config["ConnectionStrings:Default"]}");

// ------------------------------------------------------------
// 2. 配置服务集合（DI 容器）
// ------------------------------------------------------------
Console.WriteLine("\\n=== 2. 注册 DI 容器 ===");

var services = new ServiceCollection();

// 注册配置（Options 模式）
services.Configure<JwtOptions>(config.GetSection("Jwt"));
services.Configure<AppOptions>(config.GetSection("App"));

// 注册基础设施（Singleton 全应用单例）
services.AddSingleton<IClock, SystemClock>();
services.AddSingleton<ILogService, ConsoleLogService>();

// 注册仓储（Scoped：每个 Scope 一个实例，模拟 Web 请求范围）
services.AddScoped<IUserRepository, InMemoryUserRepository>();

// 注册业务服务（Transient：每次获取都 new）
services.AddTransient<UserService>();

// 注册多个 INotifier（演示 IEnumerable<T>）
services.AddTransient<INotifier, EmailNotifier>();
services.AddTransient<INotifier, SmsNotifier>();
services.AddTransient<INotifier, WechatNotifier>();

// 注册控制器
services.AddTransient<UserController>();

// 构建 ServiceProvider
using var sp = services.BuildServiceProvider();

// ------------------------------------------------------------
// 3. 演示生命周期
// ------------------------------------------------------------
Console.WriteLine("\\n=== 3. 演示生命周期 ===");

// Singleton：同一实例
var clock1 = sp.GetRequiredService<IClock>();
var clock2 = sp.GetRequiredService<IClock>();
Console.WriteLine($"Singleton: {clock1.Id == clock2.Id}（{clock1.Id}）");

// Transient：每次解析都是新实例（UserService 注册为 Transient）
var svc1 = sp.GetRequiredService<UserService>();
var svc2 = sp.GetRequiredService<UserService>();
Console.WriteLine($"Transient: {!ReferenceEquals(svc1, svc2)}");

// Scoped：同一 Scope 内相同，不同 Scope 不同
using var scope1 = sp.CreateScope();
using var scope2 = sp.CreateScope();
var repo1A = scope1.ServiceProvider.GetRequiredService<IUserRepository>();
var repo1B = scope1.ServiceProvider.GetRequiredService<IUserRepository>();
var repo2 = scope2.ServiceProvider.GetRequiredService<IUserRepository>();
Console.WriteLine($"Scoped 同 Scope: {repo1A.Id == repo1B.Id}");
Console.WriteLine($"Scoped 不同 Scope: {repo1A.Id != repo2.Id}");

// ------------------------------------------------------------
// 4. 演示构造函数注入 + Options
// ------------------------------------------------------------
Console.WriteLine("\\n=== 4. 演示业务调用 ===");

// 预置一些用户数据（与 Controller 共用同一个 Scope，才能看到同一份仓储）
using var bizScope = sp.CreateScope();
var seedRepo = bizScope.ServiceProvider.GetRequiredService<IUserRepository>();
await seedRepo.AddAsync(new User(1, "张三", "zhangsan@example.com"));
await seedRepo.AddAsync(new User(2, "李四", "lisi@example.com"));

var controller = bizScope.ServiceProvider.GetRequiredService<UserController>();

// 演示调用
await controller.ListAllUsersAsync();
await controller.NotifyUserAsync(1, "您的账号即将过期");

// ------------------------------------------------------------
// 5. 演示 Options 模式
// ------------------------------------------------------------
Console.WriteLine("\\n=== 5. Options 模式 ===");

var jwtOptions = sp.GetRequiredService<IOptions<JwtOptions>>().Value;
Console.WriteLine($"JWT Issuer：{jwtOptions.Issuer}");
Console.WriteLine($"JWT ExpireMinutes：{jwtOptions.ExpireMinutes}");
Console.WriteLine($"JWT Audience：{jwtOptions.Audience}");

var appOptions = sp.GetRequiredService<IOptions<AppOptions>>().Value;
Console.WriteLine($"App Name：{appOptions.Name} v{appOptions.Version}");

// ------------------------------------------------------------
// 6. 演示 IEnumerable<T> 注入
// ------------------------------------------------------------
Console.WriteLine("\\n=== 6. IEnumerable<T> 注入多个实现 ===");

var notifiers = sp.GetServices<INotifier>();
foreach (var notifier in notifiers)
{
    await notifier.SendAsync("admin", "系统升级通知");
}

Console.WriteLine("\\n=== demo 完成 ===");

// ============================================================
// 类型定义（含精简版 Configuration / DI / Options，API 形状对齐 Microsoft.Extensions）
// ============================================================

public interface IConfiguration
{
    string? this[string key] { get; }
    IConfiguration GetSection(string key);
}

public sealed class MiniConfiguration : IConfiguration
{
    private readonly Dictionary<string, string?> _data;
    private readonly string _prefix;
    public MiniConfiguration(Dictionary<string, string?> data, string prefix = "")
    {
        _data = data;
        _prefix = prefix;
    }
    string Combine(string key) => string.IsNullOrEmpty(_prefix) ? key : _prefix + ":" + key;
    public string? this[string key] => _data.TryGetValue(Combine(key), out var v) ? v : null;
    public IConfiguration GetSection(string key) => new MiniConfiguration(_data, Combine(key));
}

public sealed class ConfigurationBuilder
{
    private readonly Dictionary<string, string?> _data = new(StringComparer.OrdinalIgnoreCase);
    public ConfigurationBuilder AddInMemoryCollection(IEnumerable<KeyValuePair<string, string?>> pairs)
    {
        foreach (var kv in pairs) _data[kv.Key] = kv.Value;
        return this;
    }
    public ConfigurationBuilder AddEnvironmentVariables(string prefix = "")
    {
        foreach (System.Collections.DictionaryEntry e in Environment.GetEnvironmentVariables())
        {
            var k = e.Key?.ToString();
            if (k is null) continue;
            if (prefix.Length > 0 && !k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) continue;
            var mapped = prefix.Length == 0 ? k : k[prefix.Length..];
            _data[mapped.Replace("__", ":")] = e.Value?.ToString();
        }
        return this;
    }
    public MiniConfiguration Build() => new(_data);
}

public interface IOptions<out T> { T Value { get; } }
public sealed class OptionsWrapper<T>(T value) : IOptions<T> { public T Value { get; } = value; }

public enum ServiceLifetime { Singleton, Scoped, Transient }

public sealed class ServiceDescriptor
{
    public Type ServiceType { get; }
    public Type? ImplementationType { get; }
    public Func<IServiceProvider, object>? Factory { get; }
    public ServiceLifetime Lifetime { get; }
    public ServiceDescriptor(Type serviceType, Type implementationType, ServiceLifetime lifetime)
    {
        ServiceType = serviceType;
        ImplementationType = implementationType;
        Lifetime = lifetime;
    }
    public ServiceDescriptor(Type serviceType, Func<IServiceProvider, object> factory, ServiceLifetime lifetime)
    {
        ServiceType = serviceType;
        Factory = factory;
        Lifetime = lifetime;
    }
}

public sealed class ServiceCollection : List<ServiceDescriptor>
{
    public void AddSingleton<TService, TImpl>() where TImpl : TService
        => Add(new ServiceDescriptor(typeof(TService), typeof(TImpl), ServiceLifetime.Singleton));
    public void AddScoped<TService, TImpl>() where TImpl : TService
        => Add(new ServiceDescriptor(typeof(TService), typeof(TImpl), ServiceLifetime.Scoped));
    public void AddTransient<TService, TImpl>() where TImpl : TService
        => Add(new ServiceDescriptor(typeof(TService), typeof(TImpl), ServiceLifetime.Transient));
    public void AddTransient<T>() where T : class
        => Add(new ServiceDescriptor(typeof(T), typeof(T), ServiceLifetime.Transient));
    public void AddSingleton<TService>(Func<IServiceProvider, TService> factory) where TService : class
        => Add(new ServiceDescriptor(typeof(TService), sp => factory(sp)!, ServiceLifetime.Singleton));
    public void Configure<TOptions>(IConfiguration section) where TOptions : class, new()
    {
        AddSingleton<IOptions<TOptions>>(sp =>
        {
            var opts = new TOptions();
            foreach (var p in typeof(TOptions).GetProperties())
            {
                var raw = section[p.Name];
                if (raw is null) continue;
                var target = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
                p.SetValue(opts, Convert.ChangeType(raw, target));
            }
            return new OptionsWrapper<TOptions>(opts);
        });
    }
    public ServiceProvider BuildServiceProvider() => new(this);
}

public interface IServiceScope : IDisposable { IServiceProvider ServiceProvider { get; } }

public sealed class ServiceProvider : IServiceProvider, IDisposable
{
    private readonly ServiceCollection _descriptors;
    private readonly Dictionary<ServiceDescriptor, object> _singletons = new();
    public ServiceProvider(ServiceCollection descriptors) => _descriptors = descriptors;
    public object? GetService(Type serviceType) => Resolve(serviceType, scoped: null);
    internal object Resolve(Type serviceType, Dictionary<ServiceDescriptor, object>? scoped)
    {
        if (serviceType.IsGenericType && serviceType.GetGenericTypeDefinition() == typeof(IEnumerable<>))
        {
            var itemType = serviceType.GetGenericArguments()[0];
            var matches = _descriptors.Where(d => d.ServiceType == itemType).ToList();
            var arr = Array.CreateInstance(itemType, matches.Count);
            for (int i = 0; i < matches.Count; i++)
                arr.SetValue(GetInstance(matches[i], scoped), i);
            return arr;
        }
        var desc = _descriptors.LastOrDefault(d => d.ServiceType == serviceType)
            ?? throw new InvalidOperationException("未注册服务：" + serviceType.Name);
        return GetInstance(desc, scoped);
    }
    object GetInstance(ServiceDescriptor desc, Dictionary<ServiceDescriptor, object>? scoped)
    {
        if (desc.Lifetime == ServiceLifetime.Singleton)
        {
            if (_singletons.TryGetValue(desc, out var existing)) return existing;
            var created = Create(desc, scoped);
            _singletons[desc] = created;
            return created;
        }
        if (desc.Lifetime == ServiceLifetime.Scoped)
        {
            scoped ??= _singletons;
            if (scoped.TryGetValue(desc, out var existing)) return existing;
            var created = Create(desc, scoped);
            scoped[desc] = created;
            return created;
        }
        return Create(desc, scoped);
    }
    object Create(ServiceDescriptor desc, Dictionary<ServiceDescriptor, object>? scoped)
    {
        if (desc.Factory is not null) return desc.Factory(new ScopedProvider(this, scoped));
        var type = desc.ImplementationType ?? throw new InvalidOperationException("缺少实现类型");
        var ctor = type.GetConstructors().OrderByDescending(c => c.GetParameters().Length).First();
        var args = ctor.GetParameters().Select(p => Resolve(p.ParameterType, scoped)).ToArray();
        return ctor.Invoke(args);
    }
    public IServiceScope CreateScope() => new MiniScope(this);
    public void Dispose() { }
    sealed class MiniScope : IServiceScope
    {
        private readonly Dictionary<ServiceDescriptor, object> _scoped = new();
        public IServiceProvider ServiceProvider { get; }
        public MiniScope(ServiceProvider root)
        {
            ServiceProvider = new ScopedProvider(root, _scoped);
        }
        public void Dispose() { }
    }
    sealed class ScopedProvider(ServiceProvider root, Dictionary<ServiceDescriptor, object>? scoped) : IServiceProvider
    {
        public object? GetService(Type serviceType) => root.Resolve(serviceType, scoped);
    }
}

public static class MiniServiceProviderExtensions
{
    public static T GetRequiredService<T>(this IServiceProvider sp) where T : notnull
        => (T)(sp.GetService(typeof(T)) ?? throw new InvalidOperationException("未注册：" + typeof(T).Name));
    public static IEnumerable<T> GetServices<T>(this IServiceProvider sp)
        => (IEnumerable<T>)(sp.GetService(typeof(IEnumerable<T>)) ?? Array.Empty<T>());
}

// 配置类
public class JwtOptions
{
    public string Issuer { get; set; } = "";
    public int ExpireMinutes { get; set; }
    public string Audience { get; set; } = "";
}

public class AppOptions
{
    public string Name { get; set; } = "";
    public string Version { get; set; } = "";
}

// 业务模型
public record User(int Id, string Name, string Email);

// 接口
public interface IClock { Guid Id { get; } DateTime UtcNow { get; } }
public interface ILogService { Guid Id { get; } void Log(string msg); }
public interface IUserRepository { Guid Id { get; } Task AddAsync(User user); Task<User?> GetByIdAsync(int id); Task<List<User>> GetAllAsync(); }
public interface INotifier { string Channel { get; } Task SendAsync(string to, string message); }

// 实现
public class SystemClock : IClock
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime UtcNow => DateTime.UtcNow;
}

public class ConsoleLogService : ILogService
{
    public Guid Id { get; } = Guid.NewGuid();
    public void Log(string msg) => Console.WriteLine($"[LOG {Id.ToString()[..8]}] {msg}");
}

public class InMemoryUserRepository : IUserRepository
{
    private readonly List<User> _users = new();
    public Guid Id { get; } = Guid.NewGuid();

    public Task AddAsync(User user)
    {
        _users.Add(user);
        return Task.CompletedTask;
    }

    public Task<User?> GetByIdAsync(int id) => Task.FromResult(_users.FirstOrDefault(u => u.Id == id));
    public Task<List<User>> GetAllAsync() => Task.FromResult(_users.ToList());
}

public class EmailNotifier : INotifier
{
    public string Channel => "Email";
    public Task SendAsync(string to, string message)
    {
        Console.WriteLine($"  [Email] → {to}: {message}");
        return Task.CompletedTask;
    }
}

public class SmsNotifier : INotifier
{
    public string Channel => "SMS";
    public Task SendAsync(string to, string message)
    {
        Console.WriteLine($"  [SMS]   → {to}: {message}");
        return Task.CompletedTask;
    }
}

public class WechatNotifier : INotifier
{
    public string Channel => "WeChat";
    public Task SendAsync(string to, string message)
    {
        Console.WriteLine($"  [WeChat] → {to}: {message}");
        return Task.CompletedTask;
    }
}

// 业务服务：演示构造函数注入 + IEnumerable<T> + Options
public class UserService
{
    private readonly IUserRepository _repo;
    private readonly ILogService _log;
    private readonly IEnumerable<INotifier> _notifiers;
    private readonly JwtOptions _jwtOptions;

    public UserService(
        IUserRepository repo,
        ILogService log,
        IEnumerable<INotifier> notifiers,
        IOptions<JwtOptions> jwtOptions)
    {
        _repo = repo;
        _log = log;
        _notifiers = notifiers;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<List<User>> GetAllAsync()
    {
        _log.Log($"UserService.GetAllAsync() called, JWT Issuer = {_jwtOptions.Issuer}");
        return await _repo.GetAllAsync();
    }

    public async Task NotifyAllAsync(string message)
    {
        foreach (var notifier in _notifiers)
        {
            await notifier.SendAsync("all", message);
        }
    }
}

// 控制器：演示嵌套注入
public class UserController
{
    private readonly UserService _userService;
    private readonly ILogService _log;

    public UserController(UserService userService, ILogService log)
    {
        _userService = userService;
        _log = log;
    }

    public async Task ListAllUsersAsync()
    {
        _log.Log("UserController.ListAllUsersAsync");
        var users = await _userService.GetAllAsync();
        foreach (var u in users)
        {
            Console.WriteLine($"  - [{u.Id}] {u.Name} <{u.Email}>");
        }
    }

    public async Task NotifyUserAsync(int userId, string message)
    {
        await _userService.NotifyAllAsync(message);
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十四章 单元测试
  // ============================================================
  {
    id: 'csharp4-ch74',
    group: '第十三部分 工程化实战',
    icon: '🧪',
    title: '单元测试',
    content: `## 第七十五章　单元测试

### 一、为什么需要单元测试

- **防回归**：修改代码后，测试自动验证旧功能没坏
- **设计驱动**：可测试的代码天然解耦
- **文档化**：测试用例就是活文档
- **重构信心**：有测试就能放心重构

### 二、xUnit 框架

.NET 最主流的测试框架，与 .NET 集成最好。

| 特性 | xUnit | NUnit | MSTest |
| --- | --- | --- | --- |
| 主流度 | ✅ 推荐 | 中 | 微软老牌 |
| API | \`[Fact]\` / \`[Theory]\` | \`[Test]\` | \`[TestMethod]\` |
| 异步测试 | ✅ 原生支持 | ✅ | ✅ |

### 三、[Fact] 与 [Theory]

- \`[Fact]\`：单个测试用例，无参数
- \`[Theory]\`：参数化测试，配合 \`[InlineData]\` 提供多组数据

\`\`\`csharp
public class CalculatorTests
{
    [Fact]
    public void Add_TwoPlusThree_ReturnsFive()
    {
        var calc = new Calculator();
        var result = calc.Add(2, 3);
        Assert.Equal(5, result);
    }

    [Theory]
    [InlineData(1, 2, 3)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    public void Add_VariousInputs_ReturnsExpected(int a, int b, int expected)
    {
        var calc = new Calculator();
        Assert.Equal(expected, calc.Add(a, b));
    }
}
\`\`\`

### 四、[MemberData] 与 [ClassData]

更复杂的数据源：

\`\`\`csharp
public static IEnumerable<object[]> TestData => new[]
{
    new object[] { 1, 2, 3 },
    new object[] { 10, 20, 30 },
};

[Theory]
[MemberData(nameof(TestData))]
public void Add_FromMemberData(int a, int b, int expected) { ... }
\`\`\`

### 五、Assert 断言

\`\`\`csharp
Assert.Equal(expected, actual);
Assert.NotEqual(unexpected, actual);
Assert.True(condition);
Assert.False(condition);
Assert.Null(obj);
Assert.NotNull(obj);
Assert.IsType<T>(obj);
Assert.IsAssignableFrom<T>(obj);
Assert.Throws<DivideByZeroException>(() => Divide(1, 0));
Assert.Collection(coll, item1 => {}, item2 => {});
Assert.InRange(value, 1, 10);
\`\`\`

### 六、AAA 模式（Arrange / Act / Assert）

\`\`\`csharp
[Fact]
public void Withdraw_ValidAmount_DecreasesBalance()
{
    // Arrange（准备）
    var account = new BankAccount(100);

    // Act（执行）
    account.Withdraw(30);

    // Assert（断言）
    Assert.Equal(70, account.Balance);
}
\`\`\`

### 七、TDD 测试驱动开发

流程：**Red（写失败测试）→ Green（写最少代码让它通过）→ Refactor（重构）**

### 八、Moq 库（Mock 依赖）

\`\`\`csharp
var mockRepo = new Mock<IUserRepository>();
mockRepo.Setup(r => r.GetByIdAsync(1))
       .ReturnsAsync(new User(1, "Tom", "tom@example.com"));
mockRepo.Verify(r => r.GetByIdAsync(1), Times.Once);

var userService = new UserService(mockRepo.Object);
\`\`\`

### 九、Moq 核心方法

| 方法 | 用途 |
| --- | --- |
| \`Setup(x => x.Method(...))\` | 设置方法返回值 |
| \`Returns(...)\` / \`ReturnsAsync(...)\` | 同步/异步返回 |
| \`Throws<Exception>()\` | 抛异常 |
| \`Verify(x => x.Method(...), Times.Once)\` | 验证调用次数 |
| \`Callback(() => {...})\` | 执行回调 |
| \`SetupSequence(...)\` | 多次调用返回不同值 |

### 十、FluentAssertions（更可读的断言）

\`\`\`csharp
actual.Should().Be(5);
list.Should().HaveCount(3).And.Contain(item);
account.Balance.Should().BeGreaterThan(0);
\`\`\`

### 十一、测试覆盖率

用 \`Coverlet\`（.NET 推荐）：

\`\`\`bash
dotnet test --collect:"XPlat Code Coverage"
\`\`\`

### 十二、IClassFixture（共享夹具）

\`\`\`csharp
public class DatabaseFixture : IDisposable { ... }

public class UserRepoTests : IClassFixture<DatabaseFixture>
{
    public UserRepoTests(DatabaseFixture fixture) { ... }
}
\`\`\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「单元测试」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十四章 单元测试 —— demo
// ------------------------------------------------------------
// 沙箱无 xUnit/Moq 包，所以用一个简易测试运行器（自定义）演示
// 测试组织方式，相当于"手写的迷你 xUnit"。
// 实际项目用 dotnet test 命令运行 xUnit 测试。
//
// 演示：
//   1. Calculator 类（被测代码）
//   2. UserService 类（依赖 IUserRepository）
//   3. 简易测试运行器（类似 [Fact]）
//   4. 简易 Mock（模拟 Moq）
//   5. AAA 模式示范
// ============================================================

// ------------------------------------------------------------
// 1. 被测代码：Calculator
// ------------------------------------------------------------
Console.WriteLine("=== 1. Calculator 单元测试 ===");

var calculatorTests = new CalculatorTests();
calculatorTests.Run();

// ------------------------------------------------------------
// 2. 被测代码：UserService + Mock Repository
// ------------------------------------------------------------
Console.WriteLine("\\n=== 2. UserService 单元测试（用 Mock）===");

var userServiceTests = new UserServiceTests();
userServiceTests.Run();

// ------------------------------------------------------------
// 3. 银行账户 TDD 示例
// ------------------------------------------------------------
Console.WriteLine("\\n=== 3. BankAccount TDD 示例 ===");

var accountTests = new BankAccountTests();
accountTests.Run();

Console.WriteLine("\\n=== demo 完成 ===");

// ============================================================
// 被测代码：Calculator
// ============================================================
public class Calculator
{
    public int Add(int a, int b) => a + b;
    public int Subtract(int a, int b) => a - b;
    public int Multiply(int a, int b) => a * b;

    public double Divide(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException("除数不能为 0");
        return (double)a / b;
    }
}

// ============================================================
// 被测代码：UserService（依赖 IUserRepository）
// ============================================================
public record User(int Id, string Name, string Email);

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<List<User>> GetAllAsync();
}

public class UserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo) => _repo = repo;

    public async Task<string> GetUserNameAsync(int id)
    {
        var user = await _repo.GetByIdAsync(id);
        return user?.Name ?? "Unknown";
    }

    public async Task<int> CountUsersAsync() => (await _repo.GetAllAsync()).Count;
}

// ============================================================
// 被测代码：BankAccount
// ============================================================
public class BankAccount
{
    public decimal Balance { get; private set; }

    public BankAccount(decimal initialBalance)
    {
        if (initialBalance < 0) throw new ArgumentException("初始余额不能为负");
        Balance = initialBalance;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("存款金额必须 > 0");
        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("取款金额必须 > 0");
        if (amount > Balance) throw new InvalidOperationException("余额不足");
        Balance -= amount;
    }
}

// ============================================================
// 简易测试运行器：模拟 xUnit 的 [Fact] / [Theory]
// ============================================================
public static class TestRunner
{
    public static int Passed { get; private set; }
    public static int Failed { get; private set; }

    public static void Reset() { Passed = 0; Failed = 0; }

    // 模拟 [Fact]：无参数测试
    public static async Task Fact(string name, Func<Task> action)
    {
        try
        {
            await action();
            Console.WriteLine($"  ✅ PASS: {name}");
            Passed++;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  ❌ FAIL: {name} → {ex.Message}");
            Failed++;
        }
    }

    // 同步版本
    public static Task Fact(string name, Action action) => Fact(name, () => { action(); return Task.CompletedTask; });

    // 模拟 [Theory]：参数化测试
    public static async Task Theory<T1, T2, T3>(string name, IEnumerable<(T1, T2, T3)> data, Action<T1, T2, T3> action)
    {
        foreach (var (a, b, c) in data)
        {
            await Fact($"{name}({a}, {b}, {c})", () => action(a, b, c));
        }
    }
}

// ============================================================
// 简易 Mock：模拟 Moq 的 Setup/Verify/ReturnsAsync
// ============================================================
public class SimpleMock<T> where T : class
{
    private T? _instance;

    // 创建一个虚拟实现（实际 Moq 用 Castle DynamicProxy 生成）
    public T Object
    {
        get
        {
            if (_instance == null)
                throw new InvalidOperationException("先 Setup");
            return _instance;
        }
    }
}

// ============================================================
// Calculator 测试
// ============================================================
public class CalculatorTests
{
    public async Task Run()
    {
        TestRunner.Reset();

        // [Fact] 无参数测试
        await TestRunner.Fact("Add_2_Plus_3_Returns_5", () =>
        {
            // AAA 模式
            // Arrange
            var calc = new Calculator();
            // Act
            var result = calc.Add(2, 3);
            // Assert
            if (result != 5) throw new Exception($"期望 5，实际 {result}");
        });

        // [Theory] 参数化测试
        var addTestData = new[]
        {
            (1, 2, 3),
            (0, 0, 0),
            (-1, 1, 0),
            (100, 200, 300),
        };
        await TestRunner.Theory("Add_Theory", addTestData, (a, b, expected) =>
        {
            var calc = new Calculator();
            var result = calc.Add(a, b);
            if (result != expected) throw new Exception($"Add({a}, {b}) 期望 {expected}，实际 {result}");
        });

        // 异常测试
        await TestRunner.Fact("Divide_By_Zero_Throws", () =>
        {
            var calc = new Calculator();
            try
            {
                calc.Divide(10, 0);
                throw new Exception("应该抛异常但没抛");
            }
            catch (DivideByZeroException) { /* 期望异常 */ }
        });

        Console.WriteLine($"  --> 通过 {TestRunner.Passed} 个，失败 {TestRunner.Failed} 个");
    }
}

// ============================================================
// UserService 测试（用假 UserRepository 替代真实仓储）
// ============================================================
public class UserServiceTests
{
    public async Task Run()
    {
        TestRunner.Reset();

        // 创建一个假实现（手工 Mock）
        var fakeRepo = new FakeUserRepository(new List<User>
        {
            new(1, "张三", "zhangsan@example.com"),
            new(2, "李四", "lisi@example.com"),
        });

        await TestRunner.Fact("GetUserNameAsync_ExistingUser_ReturnsName", async () =>
        {
            var svc = new UserService(fakeRepo);
            var name = await svc.GetUserNameAsync(1);
            if (name != "张三") throw new Exception($"期望 '张三'，实际 '{name}'");
        });

        await TestRunner.Fact("GetUserNameAsync_NonExistingUser_ReturnsUnknown", async () =>
        {
            var svc = new UserService(fakeRepo);
            var name = await svc.GetUserNameAsync(999);
            if (name != "Unknown") throw new Exception($"期望 'Unknown'，实际 '{name}'");
        });

        await TestRunner.Fact("CountUsersAsync_ReturnsAllCount", async () =>
        {
            var svc = new UserService(fakeRepo);
            var count = await svc.CountUsersAsync();
            if (count != 2) throw new Exception($"期望 2，实际 {count}");
        });

        Console.WriteLine($"  --> 通过 {TestRunner.Passed} 个，失败 {TestRunner.Failed} 个");
    }
}

// 假实现（替代 Moq 的 Mock<IUserRepository>）
public class FakeUserRepository : IUserRepository
{
    private readonly List<User> _users;
    public int GetByIdCallCount { get; private set; }

    public FakeUserRepository(List<User> users) => _users = users;

    public Task<User?> GetByIdAsync(int id)
    {
        GetByIdCallCount++;  // 模拟 Moq.Verify
        return Task.FromResult(_users.FirstOrDefault(u => u.Id == id));
    }

    public Task<List<User>> GetAllAsync() => Task.FromResult(_users.ToList());
}

// ============================================================
// BankAccount 测试（TDD 风格）
// ============================================================
public class BankAccountTests
{
    public async Task Run()
    {
        TestRunner.Reset();

        await TestRunner.Fact("Constructor_PositiveBalance_Succeeds", () =>
        {
            var account = new BankAccount(100);
            if (account.Balance != 100) throw new Exception("初始余额应等于 100");
        });

        await TestRunner.Fact("Constructor_NegativeBalance_Throws", () =>
        {
            try { new BankAccount(-1); throw new Exception("应抛异常"); }
            catch (ArgumentException) { }
        });

        await TestRunner.Fact("Withdraw_ValidAmount_DecreasesBalance", () =>
        {
            // Arrange
            var account = new BankAccount(100);
            // Act
            account.Withdraw(30);
            // Assert
            if (account.Balance != 70) throw new Exception($"期望 70，实际 {account.Balance}");
        });

        await TestRunner.Fact("Withdraw_InsufficientBalance_Throws", () =>
        {
            var account = new BankAccount(50);
            try { account.Withdraw(100); throw new Exception("应抛异常"); }
            catch (InvalidOperationException) { }
        });

        await TestRunner.Fact("Deposit_PositiveAmount_IncreasesBalance", () =>
        {
            var account = new BankAccount(0);
            account.Deposit(50);
            if (account.Balance != 50) throw new Exception("余额应为 50");
        });

        Console.WriteLine($"  --> 通过 {TestRunner.Passed} 个，失败 {TestRunner.Failed} 个");
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十五章 ASP.NET Core 简介
  // ============================================================
  {
    id: 'csharp4-ch75',
    group: '第十三部分 工程化实战',
    icon: '🌐',
    title: 'ASP.NET Core 简介',
    content: `## 第七十六章　ASP.NET Core 简介

### 一、ASP.NET Core 是什么

ASP.NET Core 是 .NET 的跨平台 Web 框架。可以构建：
- Web API（RESTful 服务）
- Web 应用（MVC / Razor Pages）
- 实时应用（SignalR）
- gRPC 服务
- 微服务

### 二、Program.cs 顶层结构（.NET 6+）

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);

// 注册服务
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 配置中间件
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
\`\`\`

### 三、最小 API（Minimal API）

.NET 6+ 推荐的轻量级 API 风格：

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/hello", () => new { Message = "Hello, World!" });

app.MapGet("/users/{id:int}", (int id) =>
    Results.Ok(new User(id, "Tom")));

app.MapPost("/users", (User user) =>
    Results.Created($"/users/{user.Id}", user));

app.Run();
\`\`\`

### 四、路由模板

\`\`\`
/hello                   固定路径
/users/{id}              路由参数
/users/{id:int}          类型约束
/users/{id:range(1,100)} 范围约束
/products/{category:alpha}  字母约束
\`\`\`

### 五、IResult 与 Results

\`\`\`csharp
app.MapGet("/users/{id}", (int id) =>
{
    var user = _repo.Find(id);
    return user == null ? Results.NotFound() : Results.Ok(user);
});

// 常用 Results
Results.Ok(obj);            // 200 OK
Results.Created(uri, obj); // 201 Created
Results.BadRequest(error); // 400 Bad Request
Results.NotFound();        // 404 Not Found
Results.NoContent();       // 204 No Content
Results.Json(obj);         // 自定义 JSON
Results.StatusCode(503);   // 自定义状态码
\`\`\`

### 六、中间件（Middleware）

\`\`\`csharp
// 自定义中间件
app.Use(async (context, next) =>
{
    Console.WriteLine($"请求进入：{context.Request.Method} {context.Request.Path}");
    await next();  // 调用下一个中间件
    Console.WriteLine($"响应离开：{context.Response.StatusCode}");
});

// 内置中间件顺序
app.UseRouting();           // 路由
app.UseAuthentication();    // 认证
app.UseAuthorization();     // 授权
app.UseEndpoints(endpoints => endpoints.MapControllers());
\`\`\`

### 七、依赖注入

\`\`\`csharp
// 注册
builder.Services.AddScoped<IUserRepository, UserRepo>();
builder.Services.AddTransient<UserService>();

// 在 API 中注入
app.MapGet("/users/{id}", (int id, IUserRepository repo) =>
{
    return repo.Find(id);
});
\`\`\`

### 八、配置与选项

\`\`\`csharp
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

app.MapGet("/config", (IOptions<JwtOptions> opts) => opts.Value);
\`\`\`

### 九、Swagger / OpenAPI

\`\`\`csharp
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 在 Development 中启用
app.UseSwagger();
app.UseSwaggerUI();
\`\`\`

### 十、三种风格对比

| 风格 | 优点 | 缺点 |
| --- | --- | --- |
| Minimal API | 轻量、零样板代码 | 复杂逻辑难组织 |
| Controller-based | 规范、可复用 | 样板代码多 |
| MVC | 视图 + 控制器一体 | 现代前端时代少用 |

### 十一、日志

\`\`\`csharp
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// 在 API 中注入 ILogger<T>
app.MapGet("/hello", (ILogger<Program> logger) =>
{
    logger.LogInformation("Hello 被调用");
    return "Hello";
});
\`\`\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「ASP.NET Core 简介」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十五章 ASP.NET Core 简介 —— demo
// ------------------------------------------------------------
// 沙箱是控制台，无法启动 Web Server（Kestrel），所以用控制台
// 模拟 ASP.NET Core Minimal API 的路由调度模式，演示 API 设计思想。
//
// 演示：
//   1. 路由注册（MapGet / MapPost / MapPut / MapDelete）
//   2. 路由参数解析
//   3. IResult / Results 模式
//   4. 中间件链
//   5. DI 容器
// ============================================================

// ------------------------------------------------------------
// 1. 构建"模拟 ASP.NET Core 应用"
// ------------------------------------------------------------
Console.WriteLine("=== 1. 构建模拟 Web 应用 ===");

var builder = MiniWebApp.CreateBuilder();
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();
// UserService 需要构造函数注入，简易容器的 AddTransient<T>() 要求无参 new()；本 demo 路由只注入仓储。

// 注册中间件（顺序敏感，模拟真实 ASP.NET Core 中间件管线）
builder.Use(async (ctx, next) =>
{
    Console.WriteLine($"  [MW1] 请求进入：{ctx.Method} {ctx.Path}");
    await next();
    Console.WriteLine($"  [MW1] 响应离开：{ctx.StatusCode}");
});
builder.Use(async (ctx, next) =>
{
    Console.WriteLine($"  [MW2] 鉴权中...");
    await next();
});
builder.UseRouting();

var app = builder.Build();

// ------------------------------------------------------------
// 2. 注册路由（Minimal API 风格）
// ------------------------------------------------------------
Console.WriteLine("\\n=== 2. 注册路由 ===");

// GET /hello
app.MapGet("/hello", () =>
{
    return Results.Ok(new { message = "Hello, World!" });
});

// GET /users
app.MapGet("/users", (IUserRepository repo) =>
{
    var users = repo.GetAll();
    return Results.Ok(users);
});

// GET /users/{id}
app.MapGet("/users/{id:int}", (int id, IUserRepository repo) =>
{
    var user = repo.Find(id);
    return user == null ? Results.NotFound() : Results.Ok(user);
});

// POST /users
app.MapPost("/users", (UserDto dto, IUserRepository repo) =>
{
    var user = repo.Add(dto.Name, dto.Email);
    return Results.Created($"/users/{user.Id}", user);
});

// PUT /users/{id}
app.MapPut("/users/{id:int}", (int id, UserDto dto, IUserRepository repo) =>
{
    var user = repo.Update(id, dto.Name, dto.Email);
    return user == null ? Results.NotFound() : Results.Ok(user);
});

// DELETE /users/{id}
app.MapDelete("/users/{id:int}", (int id, IUserRepository repo) =>
{
    return repo.Delete(id) ? Results.NoContent() : Results.NotFound();
});

// ------------------------------------------------------------
// 3. 模拟 HTTP 请求
// ------------------------------------------------------------
Console.WriteLine("\\n=== 3. 模拟 HTTP 请求 ===");

// 模拟 GET /hello
await SimulateRequest(app, "GET", "/hello");

// 模拟 POST /users（创建用户）
await SimulateRequest(app, "GET", "/users");
await SimulateRequest(app, "POST", "/users", body: new UserDto("张三", "zhangsan@example.com"));
await SimulateRequest(app, "POST", "/users", body: new UserDto("李四", "lisi@example.com"));
await SimulateRequest(app, "GET", "/users");
await SimulateRequest(app, "GET", "/users/1");
await SimulateRequest(app, "GET", "/users/999");

// 模拟 PUT
await SimulateRequest(app, "PUT", "/users/1", body: new UserDto("张三（已更新）", "zhangsan2@example.com"));
await SimulateRequest(app, "GET", "/users/1");

// 模拟 DELETE
await SimulateRequest(app, "DELETE", "/users/2");
await SimulateRequest(app, "GET", "/users");
await SimulateRequest(app, "DELETE", "/users/999");

Console.WriteLine("\\n=== demo 完成 ===");

// ============================================================
// 辅助方法：模拟 HTTP 请求
// ============================================================
async Task SimulateRequest(MiniWebApp app, string method, string path, object? body = null)
{
    Console.WriteLine($"\\n>>> {method} {path}");
    var context = new MiniHttpContext
    {
        Method = method,
        Path = path,
        Body = body,
    };
    await app.InvokeAsync(context);
    Console.WriteLine($"<<< {(int)context.StatusCode} {context.StatusCode}");
    Console.WriteLine($"<<< Body: {context.Response}");
}

// ============================================================
// 类型定义：模拟 ASP.NET Core 核心 API
// ============================================================

// 模拟 HttpContext
public class MiniHttpContext
{
    public string Method { get; set; } = "";
    public string Path { get; set; } = "";
    public object? Body { get; set; }
    public System.Net.HttpStatusCode StatusCode { get; set; } = System.Net.HttpStatusCode.OK;
    public string Response { get; set; } = "";
}

// 模拟 IResult
public interface IResult
{
    void Execute(MiniHttpContext ctx);
}

public static class Results
{
    public static IResult Ok(object? data = null) => new OkResult(data);
    public static IResult Created(string uri, object? data) => new CreatedResult(uri, data);
    public static IResult NotFound() => new StatusCodeResult(System.Net.HttpStatusCode.NotFound);
    public static IResult NoContent() => new StatusCodeResult(System.Net.HttpStatusCode.NoContent);
    public static IResult BadRequest(object? error = null) => new BadRequestResult(error);
}

// 模拟 WebApplication builder
public class MiniWebAppBuilder
{
    public MiniServiceCollection Services { get; } = new();
    private readonly List<Func<MiniHttpContext, Func<Task>, Task>> _middlewares = new();

    public MiniWebAppBuilder Use(Func<MiniHttpContext, Func<Task>, Task> middleware)
    {
        _middlewares.Add(middleware);
        return this;
    }

    public MiniWebApp Build()
    {
        return new MiniWebApp(Services.Build(), _middlewares);
    }
}

public class MiniWebApp
{
    private readonly MiniServiceProvider _services;
    private readonly List<Func<MiniHttpContext, Func<Task>, Task>> _middlewares;
    private readonly Dictionary<(string Method, string Pattern), RouteHandler> _routes = new();

    public MiniWebApp(MiniServiceProvider services, List<Func<MiniHttpContext, Func<Task>, Task>> middlewares)
    {
        _services = services;
        _middlewares = middlewares;
    }

    public static MiniWebAppBuilder CreateBuilder() => new();

    public void MapGet(string path, Delegate handler) => _routes[("GET", path)] = new RouteHandler(handler);
    public void MapPost(string path, Delegate handler) => _routes[("POST", path)] = new RouteHandler(handler);
    public void MapPut(string path, Delegate handler) => _routes[("PUT", path)] = new RouteHandler(handler);
    public void MapDelete(string path, Delegate handler) => _routes[("DELETE", path)] = new RouteHandler(handler);

    public async Task InvokeAsync(MiniHttpContext ctx)
    {
        // 构建中间件链
        Func<Task>? next = null;
        int idx = _middlewares.Count - 1;
        while (idx >= 0)
        {
            var currentNext = next;
            var currentMiddleware = _middlewares[idx];
            next = () => currentMiddleware(ctx, () => currentNext?.Invoke() ?? Task.CompletedTask);
            idx--;
        }

        if (next != null)
        {
            await next();
        }

        // 路由匹配（极简实现）
        await RouteAsync(ctx);
    }

    private async Task RouteAsync(MiniHttpContext ctx)
    {
        foreach (var ((method, pattern), handler) in _routes)
        {
            if (method != ctx.Method) continue;

            // 简单路由匹配：/users/{id:int} 匹配 /users/123
            var (matched, routeParams) = MatchRoute(pattern, ctx.Path);
            if (!matched) continue;

            // 调用 handler（这里简化：根据 handler 参数类型从 DI 解析）
            var args = ResolveHandlerArgs(handler.Handler, routeParams, ctx, _services);
            var result = handler.Handler.DynamicInvoke(args);
            var resultValue = result is Task t ? await CastAsync(t) : result;

            if (resultValue is IResult ir) ir.Execute(ctx);
            else if (resultValue != null) new OkResult(resultValue).Execute(ctx);

            return;
        }

        ctx.StatusCode = System.Net.HttpStatusCode.NotFound;
        ctx.Response = "Not Found";
    }

    private static async Task<object?> CastAsync(Task t)
    {
        await t;
        var resultProperty = t.GetType().GetProperty("Result");
        return resultProperty?.GetValue(t);
    }

    private (bool matched, Dictionary<string, string> routeParams) MatchRoute(string pattern, string path)
    {
        var routeParams = new Dictionary<string, string>();
        var patternParts = pattern.Split('/');
        var pathParts = path.Split('/');

        if (patternParts.Length != pathParts.Length) return (false, routeParams);

        for (int i = 0; i < patternParts.Length; i++)
        {
            var p = patternParts[i];
            var v = pathParts[i];

            if (p.StartsWith('{') && p.EndsWith('}'))
            {
                // 路由参数
                var paramName = p.Trim('{', '}');
                if (paramName.Contains(':'))
                {
                    // {id:int} - 简单处理 int 约束
                    var colonIdx = paramName.IndexOf(':');
                    var name = paramName[..colonIdx];
                    var constraint = paramName[(colonIdx + 1)..];
                    if (constraint == "int" && !int.TryParse(v, out _)) return (false, routeParams);
                    routeParams[name] = v;
                }
                else
                {
                    routeParams[paramName] = v;
                }
            }
            else if (p != v)
            {
                return (false, routeParams);
            }
        }

        return (true, routeParams);
    }

    private object?[] ResolveHandlerArgs(Delegate handler, Dictionary<string, string> routeParams, MiniHttpContext ctx, MiniServiceProvider sp)
    {
        var args = new List<object?>();
        foreach (var param in handler.Method.GetParameters())
        {
            if (routeParams.TryGetValue(param.Name!, out var value))
            {
                // 路由参数
                if (param.ParameterType == typeof(int))
                    args.Add(int.Parse(value));
                else
                    args.Add(value);
            }
            else if (param.ParameterType == typeof(MiniHttpContext))
            {
                args.Add(ctx);
            }
            else if (ctx.Body != null && param.ParameterType == typeof(UserDto))
            {
                args.Add(ctx.Body);
            }
            else
            {
                // 从 DI 获取
                args.Add(sp.GetService(param.ParameterType));
            }
        }
        return args.ToArray();
    }
}

public class RouteHandler
{
    public Delegate Handler { get; }
    public RouteHandler(Delegate handler) => Handler = handler;
}

public class RouteBuilderExtensions { }

// IResult 实现
public class OkResult : IResult
{
    private readonly object? _data;
    public OkResult(object? data) => _data = data;
    public void Execute(MiniHttpContext ctx)
    {
        ctx.StatusCode = System.Net.HttpStatusCode.OK;
        ctx.Response = _data == null ? "" : System.Text.Json.JsonSerializer.Serialize(_data);
    }
}

public class CreatedResult : IResult
{
    private readonly string _uri;
    private readonly object? _data;
    public CreatedResult(string uri, object? data) { _uri = uri; _data = data; }
    public void Execute(MiniHttpContext ctx)
    {
        ctx.StatusCode = System.Net.HttpStatusCode.Created;
        ctx.Response = _data == null ? "" : System.Text.Json.JsonSerializer.Serialize(_data);
    }
}

public class StatusCodeResult : IResult
{
    private readonly System.Net.HttpStatusCode _code;
    public StatusCodeResult(System.Net.HttpStatusCode code) => _code = code;
    public void Execute(MiniHttpContext ctx)
    {
        ctx.StatusCode = _code;
        ctx.Response = _code.ToString();
    }
}

public class BadRequestResult : IResult
{
    private readonly object? _error;
    public BadRequestResult(object? error) => _error = error;
    public void Execute(MiniHttpContext ctx)
    {
        ctx.StatusCode = System.Net.HttpStatusCode.BadRequest;
        ctx.Response = _error?.ToString() ?? "Bad Request";
    }
}

// ============================================================
// 简易 DI 容器
// ============================================================
public class MiniServiceCollection
{
    private readonly Dictionary<Type, Func<object>> _factories = new();
    public void AddSingleton<TInterface, TImpl>() where TImpl : TInterface, new()
        => _factories[typeof(TInterface)] = () => new TImpl();
    public void AddTransient<T>() where T : class, new()
        => _factories[typeof(T)] = () => new T();
    public void AddTransient<TInterface, TImpl>() where TImpl : TInterface, new()
        => _factories[typeof(TInterface)] = () => new TImpl();
    public MiniServiceProvider Build() => new(_factories);
}

public class MiniServiceProvider
{
    private readonly Dictionary<Type, Func<object>> _factories;
    public MiniServiceProvider(Dictionary<Type, Func<object>> factories) => _factories = factories;
    public object? GetService(Type type)
        => _factories.TryGetValue(type, out var factory) ? factory() : null;
}

// 业务模型与仓储
public record User(int Id, string Name, string Email);
public record UserDto(string Name, string Email);

public interface IUserRepository
{
    List<User> GetAll();
    User? Find(int id);
    User Add(string name, string email);
    User? Update(int id, string name, string email);
    bool Delete(int id);
}

public class InMemoryUserRepository : IUserRepository
{
    private readonly List<User> _users = new();
    private int _nextId = 1;

    public List<User> GetAll() => _users.ToList();
    public User? Find(int id) => _users.FirstOrDefault(u => u.Id == id);
    public User Add(string name, string email)
    {
        var user = new User(_nextId++, name, email);
        _users.Add(user);
        return user;
    }
    public User? Update(int id, string name, string email)
    {
        var idx = _users.FindIndex(u => u.Id == id);
        if (idx < 0) return null;
        var user = new User(id, name, email);
        _users[idx] = user;
        return user;
    }
    public bool Delete(int id)
    {
        var idx = _users.FindIndex(u => u.Id == id);
        if (idx < 0) return false;
        _users.RemoveAt(idx);
        return true;
    }
}

public class UserService
{
    private readonly IUserRepository _repo;
    public UserService(IUserRepository repo) => _repo = repo;
    public User? GetUser(int id) => _repo.Find(id);
}

// 扩展方法
public static class MiniWebAppExtensions
{
    public static MiniWebAppBuilder UseRouting(this MiniWebAppBuilder builder) => builder;
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十六章 EF Core 数据访问
  // ============================================================
  {
    id: 'csharp4-ch76',
    group: '第十三部分 工程化实战',
    icon: '🗄️',
    title: 'EF Core 数据访问',
    content: `## 第七十七章　EF Core 数据访问

### 一、EF Core 是什么

Entity Framework Core 是 .NET 官方 ORM（对象关系映射）框架，支持：
- SQL Server / MySQL / PostgreSQL / SQLite / Cosmos DB
- LINQ 查询
- Migration 数据库迁移
- Code First 模式

### 二、DbContext 与 DbSet

\`\`\`csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("connection_string");
}
\`\`\`

### 三、模型配置：Data Annotations

\`\`\`csharp
[Table("users")]
public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    [Column("user_name")]
    public string Name { get; set; } = "";

    [EmailAddress]
    public string Email { get; set; } = "";

    [NotMapped]
    public string FullName => Name;

    public DateTime CreatedAt { get; set; }
}
\`\`\`

### 四、Fluent API（更强大）

\`\`\`csharp
protected override void OnModelCreating(ModelBuilder builder)
{
    builder.Entity<User>(e =>
    {
        e.ToTable("users");
        e.HasKey(u => u.Id);
        e.Property(u => u.Name).HasMaxLength(50).IsRequired();
        e.HasIndex(u => u.Email).IsUnique();
        e.HasMany(u => u.Orders)
         .WithOne(o => o.User)
         .HasForeignKey(o => o.UserId);
    });
}
\`\`\`

### 五、CRUD 操作

\`\`\`csharp
using var db = new AppDbContext();

// Create
db.Users.Add(new User { Name = "Tom", Email = "tom@example.com" });
await db.SaveChangesAsync();

// Read
var user = await db.Users.FindAsync(1);
var users = await db.Users.Where(u => u.Age > 18).ToListAsync();

// Update
user.Name = "Tom Updated";
db.Users.Update(user);
await db.SaveChangesAsync();

// Delete
db.Users.Remove(user);
await db.SaveChangesAsync();
\`\`\`

### 六、查询

\`\`\`csharp
// LINQ
var adults = await db.Users
    .Where(u => u.Age >= 18)
    .OrderBy(u => u.Name)
    .Select(u => new { u.Id, u.Name })
    .ToListAsync();

// Include（关联加载）
var usersWithOrders = await db.Users
    .Include(u => u.Orders)
    .ToListAsync();

// 原始 SQL
var result = await db.Users.FromSqlRaw("SELECT * FROM users WHERE age > {0}", 18).ToListAsync();
\`\`\`

### 七、Lazy vs Eager Loading

| 模式 | 说明 |
| --- | --- |
| Eager Loading（预加载） | \`Include(u => u.Orders)\` 一次性 JOIN 查询 |
| Lazy Loading（懒加载） | 第一次访问 \`u.Orders\` 时才查询（N+1 问题） |
| Explicit Loading | 手动 \`db.Entry(user).Collection(u => u.Orders).Load()\` |

### 八、AsNoTracking

只读查询不追踪实体变化，性能更好：

\`\`\`csharp
var users = await db.Users.AsNoTracking().ToListAsync();
\`\`\`

### 九、Migration 迁移

\`\`\`bash
dotnet ef migrations add InitialCreate
dotnet ef database update
\`\`\`

### 十、事务

\`\`\`csharp
using var transaction = await db.Database.BeginTransactionAsync();
try
{
    // 多个操作
    await db.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
\`\`\`

### 十一、并发控制（RowVersion）

\`\`\`csharp
[Timestamp]
public byte[] RowVersion { get; set; } = Array.Empty<byte>();

// 并发冲突时 SaveChangesAsync 抛 DbUpdateConcurrencyException
\`\`\`

### 十二、性能优化

- \`AsNoTracking()\`：只读查询
- \`AsSplitQuery()\`：多个 Include 拆成多个查询（避免笛卡尔爆炸）
- \`IQueryable\` 链式调用：在数据库层过滤
- \`CompileQuery\`：编译查询缓存
- \`AddRange\` 代替循环 \`Add\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「EF Core 数据访问」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十六章 EF Core 数据访问 —— demo
// ------------------------------------------------------------
// 沙箱无数据库连接，所以用 List 模拟 DbSet，展示 EF Core 的
// 模型定义和 CRUD 模式。代码结构完全对标真实 EF Core 用法。
//
// 演示：
//   1. Entity 类（Data Annotations 配置）
//   2. DbContext 定义
//   3. Fluent API 配置
//   4. CRUD 操作
//   5. Include 关联加载
//   6. 事务
// ============================================================

// ------------------------------------------------------------
// 1. 定义 Entity 类（Data Annotations 配置）
// ------------------------------------------------------------
Console.WriteLine("=== 1. Entity 模型定义 ===");

Console.WriteLine(@"
// [Table(""users"")]
// public class User
// {
//     [Key] public int Id { get; set; }
//     [Required, MaxLength(50)] public string Name { get; set; } = """";
//     [EmailAddress] public string Email { get; set; } = """";
//     public DateTime CreatedAt { get; set; }
//     public List<Order> Orders { get; set; } = new();
// }
");

// ------------------------------------------------------------
// 2. 使用 Mock DbContext（模拟 EF Core）
// ------------------------------------------------------------
Console.WriteLine("=== 2. 使用 DbContext 进行 CRUD ===");

await using var db = new MockAppDbContext();

// Create：添加用户
Console.WriteLine("\\n--- Create ---");
db.Users.Add(new User { Id = 1, Name = "张三", Email = "zhangsan@example.com" });
db.Users.Add(new User { Id = 2, Name = "李四", Email = "lisi@example.com" });
db.Users.Add(new User { Id = 3, Name = "王五", Email = "wangwu@example.com" });
await db.SaveChangesAsync();
Console.WriteLine($"已添加 {db.Users.Count} 个用户");

// 添加订单（关联到用户）
db.Orders.Add(new Order { Id = 101, UserId = 1, Amount = 100, CreatedAt = DateTime.UtcNow });
db.Orders.Add(new Order { Id = 102, UserId = 1, Amount = 200, CreatedAt = DateTime.UtcNow });
db.Orders.Add(new Order { Id = 103, UserId = 2, Amount = 50, CreatedAt = DateTime.UtcNow });
await db.SaveChangesAsync();
Console.WriteLine($"已添加 {db.Orders.Count} 个订单");

// Read：查询
Console.WriteLine("\\n--- Read ---");
var user = await db.Users.FindAsync(1);
Console.WriteLine($"FindAsync(1)：{user?.Name}");

// LINQ 查询
var adults = db.Users
    .Where(u => u.Id > 1)
    .OrderBy(u => u.Name)
    .Select(u => new { u.Id, u.Name })
    .ToList();
Console.WriteLine($"Where(u.Id > 1) 结果：{adults.Count} 条");
foreach (var a in adults) Console.WriteLine($"  - [{a.Id}] {a.Name}");

// Include：关联加载（Eager Loading）
Console.WriteLine("\\n--- Include（关联加载） ---");
var usersWithOrders = db.Users
    .Include(u => u.Orders)
    .ToList();
foreach (var u in usersWithOrders)
{
    Console.WriteLine($"  [{u.Id}] {u.Name}：{u.Orders.Count} 个订单，总计 {u.Orders.Sum(o => o.Amount):C}");
}

// Update
Console.WriteLine("\\n--- Update ---");
user!.Name = "张三（已更新）";
db.Users.Update(user);
await db.SaveChangesAsync();
Console.WriteLine($"更新后：{db.Users.Find(1)?.Name}");

// Delete
Console.WriteLine("\\n--- Delete ---");
db.Users.Remove(db.Users.Find(3)!);
await db.SaveChangesAsync();
Console.WriteLine($"删除后剩余：{db.Users.Count} 个用户");

// ------------------------------------------------------------
// 3. 事务演示
// ------------------------------------------------------------
Console.WriteLine("\\n=== 3. 事务演示 ===");

try
{
    using var tx = await db.Database.BeginTransactionAsync();
    db.Users.Add(new User { Id = 4, Name = "赵六", Email = "zhaoliu@example.com" });
    await db.SaveChangesAsync();

    // 模拟一个错误
    throw new InvalidOperationException("模拟业务错误");

    await tx.CommitAsync();  // 不会执行到这里
}
catch (Exception ex)
{
    Console.WriteLine($"事务回滚：{ex.Message}");
    Console.WriteLine($"当前用户数：{db.Users.Count}（事务已回滚，未新增）");
}

// ------------------------------------------------------------
// 4. AsNoTracking 性能优化
// ------------------------------------------------------------
Console.WriteLine("\\n=== 4. AsNoTracking ===");
var readOnlyUsers = db.Users.AsNoTracking().ToList();
Console.WriteLine($"只读查询结果：{readOnlyUsers.Count} 个用户");

// ------------------------------------------------------------
// 5. FromSqlRaw 原始 SQL（模拟）
// ------------------------------------------------------------
Console.WriteLine("\\n=== 5. 原始 SQL 查询 ===");
var sqlResult = db.Users.FromSqlRaw("SELECT * FROM users WHERE id > 0").ToList();
Console.WriteLine($"原始 SQL 结果：{sqlResult.Count} 行");

Console.WriteLine("\\n=== demo 完成 ===");

// ============================================================
// Entity 类（Data Annotations 配置）
// ============================================================

// 模拟 EF Core 的 Data Annotations
[AttributeUsage(AttributeTargets.Class)]
public class TableAttribute : Attribute
{
    public string Name { get; }
    public TableAttribute(string name) => Name = name;
}

[AttributeUsage(AttributeTargets.Property)]
public class KeyAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class RequiredAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class MaxLengthAttribute : Attribute
{
    public int Length { get; }
    public MaxLengthAttribute(int length) => Length = length;
}

[AttributeUsage(AttributeTargets.Property)]
public class EmailAddressAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class NotMappedAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class ColumnAttribute : Attribute
{
    public string Name { get; }
    public ColumnAttribute(string name) => Name = name;
}

[AttributeUsage(AttributeTargets.Property)]
public class TimestampAttribute : Attribute { }

[Table("users")]
public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    [Column("user_name")]
    public string Name { get; set; } = "";

    [EmailAddress]
    public string Email { get; set; } = "";

    public DateTime CreatedAt { get; set; }

    // 导航属性（一对多）
    public List<Order> Orders { get; set; } = new();

    [NotMapped]
    public string FullName => Name;
}

[Table("orders")]
public class Order
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }

    // 导航属性（多对一）
    public User? User { get; set; }
}

// ============================================================
// Mock DbContext（模拟 EF Core DbContext）
// ============================================================
public class MockDbSet<T> where T : class
{
    private readonly List<T> _data = new();
    private readonly HashSet<T> _tracked = new();  // 模拟 Change Tracker

    public int Count => _data.Count;

    public List<T> ToList() => _data.ToList();

    public T? Find(params object[] keys)
    {
        var idProp = typeof(T).GetProperty("Id");
        if (idProp == null) return null;
        var key = (int)keys[0];
        return _data.FirstOrDefault(item => (int)idProp.GetValue(item)! == key);
    }

    public Task<T?> FindAsync(params object[] keys) => Task.FromResult(Find(keys));

    public MockQueryable<T> Where(Func<T, bool> predicate) => new(_data.Where(predicate));
    public MockQueryable<T> Include<TProperty>(Func<T, IEnumerable<TProperty>> selector)
    {
        // 模拟 Include（实际 EF Core 会自动 JOIN 加载）
        // 这里数据已在内存中，Include 是 no-op
        return new MockQueryable<T>(_data);
    }
    public MockQueryable<T> AsNoTracking() => new(_data, noTracking: true);
    public MockQueryable<T> FromSqlRaw(string sql) => new(_data);

    public void Add(T entity) => _data.Add(entity);
    public void Update(T entity) { /* 模拟 Change Tracker */ }
    public void Remove(T entity) => _data.Remove(entity);
    public Task SaveChangesAsync() => Task.CompletedTask;
}

public class MockQueryable<T>
{
    private readonly IEnumerable<T> _data;
    private readonly bool _noTracking;

    public MockQueryable(IEnumerable<T> data, bool noTracking = false)
    {
        _data = data;
        _noTracking = noTracking;
    }

    public MockQueryable<T> Where(Func<T, bool> predicate) => new(_data.Where(predicate), _noTracking);
    public MockQueryable<T> OrderBy<TKey>(Func<T, TKey> keySelector) => new(_data.OrderBy(keySelector), _noTracking);
    public MockQueryable<TResult> Select<TResult>(Func<T, TResult> selector) => new(_data.Select(selector), _noTracking);
    public MockQueryable<T> Include<TProperty>(Func<T, TProperty> selector) => this;
    public MockQueryable<T> AsNoTracking() => new(_data, noTracking: true);

    public List<T> ToList() => _data.ToList();
    public T FirstOrDefault() => _data.FirstOrDefault();
    public int Count() => _data.Count();
}

public class MockAppDbContext : IAsyncDisposable
{
    public MockDbSet<User> Users { get; } = new();
    public MockDbSet<Order> Orders { get; } = new();

    public MockDatabase Database { get; } = new();

    public Task<int> SaveChangesAsync()
    {
        Console.WriteLine($"  [DbContext] SaveChangesAsync()");
        return Task.FromResult(1);
    }

    public ValueTask DisposeAsync()
    {
        Console.WriteLine("  [DbContext] DisposeAsync()");
        return ValueTask.CompletedTask;
    }
}

public class MockDatabase
{
    public async Task<MockTransaction> BeginTransactionAsync()
    {
        Console.WriteLine("  [Database] BeginTransactionAsync()");
        await Task.Delay(10);
        return new MockTransaction();
    }
}

public class MockTransaction : IAsyncDisposable, IDisposable
{
    public Task CommitAsync()
    {
        Console.WriteLine("  [Transaction] CommitAsync()");
        return Task.CompletedTask;
    }

    public Task RollbackAsync()
    {
        Console.WriteLine("  [Transaction] RollbackAsync()");
        return Task.CompletedTask;
    }

    public ValueTask DisposeAsync()
    {
        Console.WriteLine("  [Transaction] DisposeAsync()");
        return ValueTask.CompletedTask;
    }

    public void Dispose() { }
}

// Fluent API 风格的配置（演示）
public class ModelBuilder
{
    public EntityBuilder<TEntity> Entity<TEntity>(Action<EntityBuilder<TEntity>> configure) where TEntity : class
    {
        var eb = new EntityBuilder<TEntity>();
        configure(eb);
        return eb;
    }
}

public class EntityBuilder<TEntity> where TEntity : class
{
    public EntityBuilder<TEntity> ToTable(string name) => this;
    public EntityBuilder<TEntity> HasKey<TKey>(Func<TEntity, TKey> selector) => this;
    public EntityBuilder<TEntity> HasIndex<TProp>(Func<TEntity, TProp> selector) => this;
    public EntityBuilder<TEntity> HasMany<TNav>(Func<TEntity, IEnumerable<TNav>> selector) => this;
    public PropertyBuilder<TEntity> Property<TProp>(Func<TEntity, TProp> selector) => new PropertyBuilder<TEntity>();
}

public class PropertyBuilder<TEntity> where TEntity : class
{
    public PropertyBuilder<TEntity> HasMaxLength(int length) => this;
    public PropertyBuilder<TEntity> IsRequired() => this;
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第七十七章 综合项目实战
  // ============================================================
  {
    id: 'csharp4-ch77',
    group: '第十三部分 工程化实战',
    icon: '🎯',
    title: '综合项目实战',
    content: `## 第七十八章　综合项目实战

### 一、项目背景

综合运用前面学过的知识，实现一个控制台任务管理系统 TaskManager。涵盖：
- 领域模型设计（Task / User / Project）
- Repository 模式（数据访问层）
- Service 层（业务逻辑）
- 依赖注入（Microsoft.Extensions.DependencyInjection）
- 命令行参数解析
- JSON 持久化（System.Text.Json）
- 异常处理与日志记录
- 异步编程

### 二、架构分层

\`\`\`
┌─────────────────────────────────────┐
│         CLI 控制台入口              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│       TaskController               │
│   （命令分发 + 输入输出）           │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         TaskService                 │
│   （业务逻辑：任务管理）           │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      ITaskRepository               │
│   （数据访问：JSON 持久化）         │
└─────────────────────────────────────┘
\`\`\`

### 三、领域模型

\`\`\`csharp
public enum TaskStatus { Todo, InProgress, Done, Cancelled }

public record TaskItem(
    int Id,
    string Title,
    string Description,
    TaskStatus Status,
    DateTime CreatedAt,
    DateTime? CompletedAt);
\`\`\`

### 四、Repository 模式

将数据访问抽象成接口，便于切换实现（JSON 文件 / 数据库 / 内存）。

\`\`\`csharp
public interface ITaskRepository
{
    Task<List<TaskItem>> GetAllAsync();
    Task<TaskItem?> GetByIdAsync(int id);
    Task<TaskItem> AddAsync(string title, string description);
    Task<bool> UpdateAsync(TaskItem task);
    Task<bool> DeleteAsync(int id);
}
\`\`\`

### 五、Service 层

业务逻辑层，调用 Repository，处理异常、验证、日志。

### 六、Controller 层

接收 CLI 命令，调用 Service，输出结果到控制台。

### 七、JSON 持久化

\`\`\`csharp
public async Task SaveAsync(List<TaskItem> tasks)
{
    var json = JsonSerializer.Serialize(tasks, _jsonOptions);
    await File.WriteAllTextAsync(_filePath, json);
}
\`\`\`

### 八、命令行解析

\`\`\`bash
taskmanager list                    # 列出所有任务
taskmanager add "买菜" "下班后去超市"  # 添加任务
taskmanager done 1                  # 标记任务 1 为完成
taskmanager delete 2                # 删除任务 2
\`\`\`

### 九、运行流程

1. 解析命令行参数
2. 启动 DI 容器
3. 加载已有任务数据
4. 执行对应命令
5. 保存变更
6. 退出

### 十、扩展点

- 添加用户登录
- 添加项目分类
- 添加截止日期提醒
- 切换为 SQLite 存储
- 暴露为 Web API

### 十一、设计要点

- **单一职责**：每个类只做一件事
- **依赖倒置**：Service 依赖接口而非具体实现
- **开闭原则**：增加功能不改老代码
- **异常分层**：底层抛异常，上层捕获并友好提示

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「综合项目实战」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 第七十七章 综合项目实战：迷你任务管理系统
// ------------------------------------------------------------
// 完整实现一个控制台任务管理系统，综合运用：
//   - record / enum / 模式匹配
//   - async/await + Task
//   - LINQ
//   - System.Text.Json 序列化
//   - File IO
//   - 依赖注入（手工实现避免依赖外部包）
//   - Repository 模式
//   - 异常处理
//   - 命令行参数解析
// ============================================================

using System.Text.Json;

// ------------------------------------------------------------
// 程序入口
// ------------------------------------------------------------
Console.WriteLine("╔══════════════════════════════════════╗");
Console.WriteLine("║   迷你任务管理系统 TaskManager CLI    ║");
Console.WriteLine("╚══════════════════════════════════════╝");

// 使用临时目录避免污染工作区
var dataFile = Path.Combine(Path.GetTempPath(), $"tasks-{Guid.NewGuid():N}.json");
Console.WriteLine($"数据文件：{dataFile}");

// 构建应用
var app = TaskManagerApp.Build(dataFile);

// 解析命令行参数（沙箱中 args 不可用，模拟几个命令）
var commands = new[]
{
    new[] { "add", "买菜", "下班后去超市" },
    new[] { "add", "写代码", "完成第 77 章 demo" },
    new[] { "add", "运动", "晚上跑步 5 公里" },
    new[] { "list" },
    new[] { "done", "1" },
    new[] { "list" },
    new[] { "delete", "2" },
    new[] { "list" },
    new[] { "stats" },
};

foreach (var argv in commands)
{
    Console.WriteLine($"\\n$ taskmanager {string.Join(" ", argv)}");
    await app.RunAsync(argv);
}

// 清理临时文件
try { File.Delete(dataFile); } catch { /* ignore */ }

Console.WriteLine("\\n=== demo 完成 ===");

// ============================================================
// 应用主类：负责 DI 装配和命令分发
// ============================================================
public class TaskManagerApp
{
    private readonly ITaskRepository _repo;
    private readonly TaskService _service;
    private readonly TaskController _controller;

    private TaskManagerApp(ITaskRepository repo, TaskService service, TaskController controller)
    {
        _repo = repo;
        _service = service;
        _controller = controller;
    }

    public static TaskManagerApp Build(string dataFile)
    {
        // 手工 DI（演示，实际项目用 Microsoft.Extensions.DependencyInjection）
        ITaskRepository repo = new JsonTaskRepository(dataFile);
        var service = new TaskService(repo);
        var controller = new TaskController(service);
        return new TaskManagerApp(repo, service, controller);
    }

    public async Task RunAsync(string[] args)
    {
        try
        {
            await _controller.HandleAsync(args);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ 错误：{ex.Message}");
        }
    }
}

// ============================================================
// 领域模型
// ============================================================
public enum TaskStatus { Todo, InProgress, Done, Cancelled }

public record TaskItem(
    int Id,
    string Title,
    string Description,
    TaskStatus Status,
    DateTime CreatedAt,
    DateTime? CompletedAt)
{
    public TaskItem WithStatus(TaskStatus status) => this with
    {
        Status = status,
        CompletedAt = status == TaskStatus.Done ? DateTime.UtcNow : CompletedAt
    };
}

// ============================================================
// Repository：数据访问层
// ============================================================
public interface ITaskRepository
{
    Task<List<TaskItem>> GetAllAsync();
    Task<TaskItem?> GetByIdAsync(int id);
    Task<TaskItem> AddAsync(string title, string description);
    Task<bool> UpdateAsync(TaskItem task);
    Task<bool> DeleteAsync(int id);
}

// JSON 持久化实现
public class JsonTaskRepository : ITaskRepository
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        WriteIndented = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    public JsonTaskRepository(string filePath) => _filePath = filePath;

    private async Task<List<TaskItem>> LoadAsync()
    {
        if (!File.Exists(_filePath)) return new List<TaskItem>();
        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<TaskItem>>(json, JsonOpts) ?? new List<TaskItem>();
    }

    private async Task SaveAsync(List<TaskItem> tasks)
    {
        var json = JsonSerializer.Serialize(tasks, JsonOpts);
        await File.WriteAllTextAsync(_filePath, json);
    }

    public async Task<List<TaskItem>> GetAllAsync()
    {
        await _lock.WaitAsync();
        try { return await LoadAsync(); }
        finally { _lock.Release(); }
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        var tasks = await LoadAsync();
        return tasks.FirstOrDefault(t => t.Id == id);
    }

    public async Task<TaskItem> AddAsync(string title, string description)
    {
        await _lock.WaitAsync();
        try
        {
            var tasks = await LoadAsync();
            var nextId = tasks.Count == 0 ? 1 : tasks.Max(t => t.Id) + 1;
            var task = new TaskItem(nextId, title, description, TaskStatus.Todo, DateTime.UtcNow, null);
            tasks.Add(task);
            await SaveAsync(tasks);
            return task;
        }
        finally { _lock.Release(); }
    }

    public async Task<bool> UpdateAsync(TaskItem task)
    {
        await _lock.WaitAsync();
        try
        {
            var tasks = await LoadAsync();
            var idx = tasks.FindIndex(t => t.Id == task.Id);
            if (idx < 0) return false;
            tasks[idx] = task;
            await SaveAsync(tasks);
            return true;
        }
        finally { _lock.Release(); }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await _lock.WaitAsync();
        try
        {
            var tasks = await LoadAsync();
            var idx = tasks.FindIndex(t => t.Id == id);
            if (idx < 0) return false;
            tasks.RemoveAt(idx);
            await SaveAsync(tasks);
            return true;
        }
        finally { _lock.Release(); }
    }
}

// ============================================================
// Service：业务逻辑层
// ============================================================
public class TaskService
{
    private readonly ITaskRepository _repo;

    public TaskService(ITaskRepository repo) => _repo = repo;

    public async Task<List<TaskItem>> GetAllAsync() => await _repo.GetAllAsync();

    public async Task<TaskItem> AddTaskAsync(string title, string description)
    {
        // 业务验证
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("任务标题不能为空");
        if (title.Length > 100)
            throw new ArgumentException("任务标题不能超过 100 字符");

        return await _repo.AddAsync(title, description);
    }

    public async Task MarkDoneAsync(int id)
    {
        var task = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"任务 #{id} 不存在");
        await _repo.UpdateAsync(task.WithStatus(TaskStatus.Done));
    }

    public async Task DeleteAsync(int id)
    {
        var success = await _repo.DeleteAsync(id);
        if (!success) throw new KeyNotFoundException($"任务 #{id} 不存在");
    }

    public async Task<Dictionary<TaskStatus, int>> GetStatsAsync()
    {
        var tasks = await _repo.GetAllAsync();
        return tasks.GroupBy(t => t.Status)
                    .ToDictionary(g => g.Key, g => g.Count());
    }
}

// ============================================================
// Controller：CLI 命令分发
// ============================================================
public class TaskController
{
    private readonly TaskService _service;

    public TaskController(TaskService service) => _service = service;

    public async Task HandleAsync(string[] args)
    {
        if (args.Length == 0)
        {
            PrintHelp();
            return;
        }

        var command = args[0].ToLowerInvariant();
        switch (command)
        {
            case "list":
                await ListAsync();
                break;
            case "add":
                await AddAsync(args);
                break;
            case "done":
                await DoneAsync(args);
                break;
            case "delete":
                await DeleteAsync(args);
                break;
            case "stats":
                await StatsAsync();
                break;
            case "help":
            case "--help":
            case "-h":
                PrintHelp();
                break;
            default:
                Console.WriteLine($"未知命令：{command}");
                PrintHelp();
                break;
        }
    }

    private async Task ListAsync()
    {
        var tasks = await _service.GetAllAsync();
        if (tasks.Count == 0)
        {
            Console.WriteLine("（暂无任务）");
            return;
        }

        Console.WriteLine($"共 {tasks.Count} 个任务：");
        foreach (var t in tasks)
        {
            var status = t.Status switch
            {
                TaskStatus.Todo        => "  [ ] ",
                TaskStatus.InProgress  => "  [~] ",
                TaskStatus.Done        => "  [✓] ",
                TaskStatus.Cancelled   => "  [×] ",
                _                      => "  [?] "
            };
            var title = t.Status == TaskStatus.Done
                ? $"~~{t.Title}~~"
                : t.Title;
            Console.WriteLine($"  #{t.Id} {status}{title}");
            if (!string.IsNullOrEmpty(t.Description))
                Console.WriteLine($"        └─ {t.Description}");
        }
    }

    private async Task AddAsync(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("用法：add <title> [description]");
            return;
        }

        var title = args[1];
        var desc = args.Length >= 3 ? args[2] : "";
        var task = await _service.AddTaskAsync(title, desc);
        Console.WriteLine($"✓ 已添加任务 #{task.Id}：{task.Title}");
    }

    private async Task DoneAsync(string[] args)
    {
        if (args.Length < 2 || !int.TryParse(args[1], out var id))
        {
            Console.WriteLine("用法：done <id>");
            return;
        }

        await _service.MarkDoneAsync(id);
        Console.WriteLine($"✓ 任务 #{id} 已标记为完成");
    }

    private async Task DeleteAsync(string[] args)
    {
        if (args.Length < 2 || !int.TryParse(args[1], out var id))
        {
            Console.WriteLine("用法：delete <id>");
            return;
        }

        await _service.DeleteAsync(id);
        Console.WriteLine($"✓ 任务 #{id} 已删除");
    }

    private async Task StatsAsync()
    {
        var stats = await _service.GetStatsAsync();
        Console.WriteLine("任务统计：");
        foreach (TaskStatus status in Enum.GetValues(typeof(TaskStatus)))
        {
            stats.TryGetValue(status, out var count);
            var label = status switch
            {
                TaskStatus.Todo       => "待办",
                TaskStatus.InProgress => "进行中",
                TaskStatus.Done       => "已完成",
                TaskStatus.Cancelled  => "已取消",
                _                     => status.ToString()
            };
            Console.WriteLine($"  {label}：{count}");
        }
    }

    private void PrintHelp()
    {
        Console.WriteLine(@"
用法：taskmanager <command> [args]

命令：
  list              列出所有任务
  add <title> [desc] 添加任务
  done <id>         标记任务为完成
  delete <id>       删除任务
  stats             查看统计
  help              显示帮助");
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 结语
  // ============================================================
  {
    id: 'csharp4-conclusion',
    group: '结尾',
    icon: '🎓',
    title: '结语与学习路线',
    content: `## 结语与学习路线

### 一、回顾全书要点

恭喜你读完了本书！让我们回顾一下全书的核心知识点：

| 部分 | 核心知识点 |
| --- | --- |
| 入门基础 | .NET / C# 总览、开发环境、顶级语句、控制台 IO |
| 核心语法 | 变量、类型、运算符、字符串、控制流、枚举、元组、模式匹配、可空 |
| 面向对象 | 类、字段、属性、方法、构造函数、静态、继承、多态、抽象、接口、密封、扩展方法、命名空间 |
| 泛型与集合 | 泛型、List、Dictionary、HashSet、Queue、Stack、并发集合 |
| 委托、事件、Lambda | 委托、Lambda、事件、表达式树、函数式编程 |
| LINQ | 查询语法、过滤、投影、排序、分组、聚合、转换 |
| 异步与并发 | async/await、Task、并行、取消、同步、Channel、ThreadPool |
| 文件 IO 与序列化 | File/Stream、JSON、XML/CSV、高性能 IO |
| 反射与特性 | 反射、Attribute、源生成器 |
| 异常处理与调试 | try/catch、自定义异常、调试技术、日志 |
| 内存管理与性能 | GC、IDisposable、Span、ref struct、性能优化 |
| 网络编程 | HttpClient、Socket、UDP、IPC、WebSocket、gRPC |
| 工程化实战 | DI、单元测试、ASP.NET Core、EF Core、综合项目 |

### 二、C# vs 其他语言

| 特性 | C# | Java | Python | Go | Rust | TypeScript |
| --- | --- | --- | --- | --- | --- | --- |
| 类型系统 | 静态强类型 | 静态强类型 | 动态 | 静态 | 静态 | 静态 |
| 平台 | 跨平台 | 跨平台 | 跨平台 | 跨平台 | 跨平台 | Web/Node |
| 主战场 | .NET 企业应用 | 企业后端 | 数据/AI/脚本 | 云原生/微服务 | 系统编程 | 前端 |
| 性能 | 高 | 高 | 中 | 高 | 极高 | 中 |
| 学习曲线 | 中 | 中 | 低 | 低 | 高 | 中 |
| 异步模型 | async/await | async/await | async/await | goroutine | async/await | async/await |
| 内存管理 | GC | GC | GC | GC | 所有权 | GC |

### 三、深入方向

读完本书，你可以选择以下方向之一深入：

#### 1. ASP.NET Core 后端开发
- Web API + EF Core + 数据库
- 身份认证与授权（JWT、OAuth、Identity）
- 微服务架构
- Docker / Kubernetes 部署
- 推荐资源：[Microsoft Docs](https://learn.microsoft.com/aspnet/core)、eShopOnContainers 开源项目

#### 2. Unity 游戏开发
- C# 脚本 + MonoBehaviour
- 物理 / 渲染 / 输入系统
- 资源管理 / AssetBundle
- 性能优化（GC、Profiler）
- 推荐资源：[Unity Learn](https://learn.unity.com/)

#### 3. MAUI 跨平台移动/桌面开发
- XAML + C# 代码
- iOS / Android / Windows / macOS 一套代码
- Blazor Hybrid
- 推荐资源：[.NET MAUI Docs](https://learn.microsoft.com/dotnet/maui)

#### 4. WPF / WinForms 桌面应用
- XAML + MVVM 模式
- 数据绑定、依赖属性
- 自定义控件
- 推荐资源：[WPF Docs](https://learn.microsoft.com/dotnet/desktop/wpf)

#### 5. Azure 云开发
- Azure Functions（Serverless）
- Azure App Service
- Azure Storage / CosmosDB
- Azure DevOps
- 推荐资源：[Azure Docs](https://learn.microsoft.com/azure)

#### 6. AI 开发
- ML.NET（机器学习）
- Semantic Kernel（LLM 应用开发）
- Bot Framework
- 推荐资源：[ML.NET Docs](https://learn.microsoft.com/dotnet/machine-learning)

### 四、学习资源推荐

#### 官方文档
- [Microsoft Learn - .NET](https://learn.microsoft.com/dotnet)
- [.NET GitHub](https://github.com/dotnet)
- [C# 语言规范](https://learn.microsoft.com/dotnet/csharp/language-reference/)

#### 优秀开源项目
- [eShopOnContainers](https://github.com/dotnet-architecture/eShopOnContainers) - 微服务参考架构
- [ASP.NET Core](https://github.com/dotnet/aspnetcore) - 框架源码
- [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) - 性能测试
- [Polly](https://github.com/App-vNext/Polly) - 弹性策略
- [Serilog](https://github.com/serilog/serilog) - 日志库
- [Avalonia](https://github.com/AvaloniaUI/Avalonia) - 跨平台桌面

#### 社区
- [Stack Overflow - c#](https://stackoverflow.com/questions/tagged/c%23)
- [r/csharp](https://www.reddit.com/r/csharp/)
- [.NET 中文社区](https://dotnet.microsoft.com/zh-cn)

### 五、开源贡献建议

- 从小项目开始（修复 typo、改进文档）
- 找标了 \`good-first-issue\` 标签的 issue
- 阅读 [.NET 贡献指南](https://github.com/dotnet/runtime/blob/main/CONTRIBUTING.md)
- 关注 [firsttimersonly.com](https://www.firsttimersonly.com/)

### 六、面试准备要点

#### 高频考点
- 值类型 vs 引用类型（装箱拆箱）
- async/await 原理（状态机）
- LINQ 延迟执行
- GC 分代回收
- 集合选型（List vs LinkedList vs Dictionary）
- 接口 vs 抽象类
- 委托 vs 事件
- Span/Memory
- Dispose 模式
- 并发集合与锁

#### 系统设计
- 限流、熔断、降级
- 缓存（Redis / IMemoryCache）
- 消息队列（RabbitMQ / Kafka）
- 分布式追踪（OpenTelemetry）
- 数据库分库分表

#### 编码题
- LeetCode Top 100
- 剑指 Offer
- 算法基础（链表、树、动态规划、图）

### 七、最后的话

C# 是一门设计精良的语言，融合了静态类型的严谨与动态语言的灵活，从语法到生态都成熟稳定。

学习语言只是开始，真正的成长在于：
- **持续编码**：每天写代码，量变引起质变
- **读优秀源码**：从简到难，逐个吃透
- **解决实际问题**：把学到的知识用到真实项目中
- **分享与输出**：写博客、做开源、讲技术，输出是最好的输入

愿你写出优雅、稳健、高性能的 C# 代码。下一站见！

> 本书完。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「结语与学习路线」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ============================================================
// 结语：全书总结示例代码
// ------------------------------------------------------------
// 综合演示前面学过的多个特性：
//   - record 类型
//   - 模式匹配（switch 表达式、属性模式）
//   - async/await
//   - LINQ（Select、Where、GroupBy、OrderBy）
//   - System.Text.Json
//   - File IO
//   - 集合表达式 [1, 2, 3]
//   - 顶级语句
//   - 异常处理
// ============================================================

using System.Text.Json;

// ------------------------------------------------------------
// 1. 定义领域模型（record + enum）
// ------------------------------------------------------------
Console.WriteLine("=== 1. 领域模型 ===");

var employees = new List<Employee>
{
    new(1, "张三", "Engineering",  Level.Senior,   30000),
    new(2, "李四", "Engineering",  Level.Junior,   15000),
    new(3, "王五", "Marketing",    Level.Senior,   25000),
    new(4, "赵六", "Engineering",  Level.Principal, 50000),
    new(5, "孙七", "Marketing",    Level.Junior,   12000),
    new(6, "周八", "HR",           Level.Mid,      18000),
    new(7, "吴九", "HR",           Level.Senior,   22000),
};

Console.WriteLine($"共 {employees.Count} 名员工");

// ------------------------------------------------------------
// 2. LINQ 查询与统计
// ------------------------------------------------------------
Console.WriteLine("\\n=== 2. LINQ 查询与统计 ===");

// 按部门分组
var byDept = employees
    .GroupBy(e => e.Department)
    .Select(g => new
    {
        Department = g.Key,
        Count = g.Count(),
        TotalSalary = g.Sum(e => e.Salary),
        AvgSalary = g.Average(e => e.Salary),
    })
    .OrderByDescending(x => x.TotalSalary);

foreach (var stat in byDept)
{
    Console.WriteLine($"  {stat.Department,-12} 人数：{stat.Count}  " +
                      $"总薪资：{stat.TotalSalary,8:C0}  平均：{stat.AvgSalary,7:C0}");
}

// 高级员工（Salary > 20000）
var seniors = employees
    .Where(e => e.Salary > 20000)
    .OrderByDescending(e => e.Salary)
    .Select(e => new { e.Name, e.Level, e.Salary })
    .ToList();

Console.WriteLine("\\n高薪员工（> 20000）：");
foreach (var s in seniors)
{
    Console.WriteLine($"  {s.Name,-4} {s.Level,-10} {s.Salary,8:C0}");
}

// ------------------------------------------------------------
// 3. 模式匹配：根据级别输出标签
// ------------------------------------------------------------
Console.WriteLine("\\n=== 3. 模式匹配 ===");

foreach (var emp in employees)
{
    var label = emp switch
    {
        { Level: Level.Principal, Salary: > 40000 } => "🌟 技术专家",
        { Level: Level.Senior,   Salary: > 25000 } => "⭐ 高级骨干",
        { Level: Level.Senior }                      => "✓ 资深员工",
        { Level: Level.Mid }                         => "○ 中级员工",
        { Level: Level.Junior, Salary: < 15000 }     => "🌱 实习生",
        { Level: Level.Junior }                       => "◇ 初级员工",
        _                                            => "❓ 未知"
    };
    Console.WriteLine($"  {emp.Name,-4} [{emp.Level}] → {label}");
}

// ------------------------------------------------------------
// 4. 异步操作：模拟批量加载员工详情
// ------------------------------------------------------------
Console.WriteLine("\\n=== 4. 异步操作 ===");

await ProcessEmployeesAsync(employees);

// ------------------------------------------------------------
// 5. JSON 序列化与文件持久化
// ------------------------------------------------------------
Console.WriteLine("\\n=== 5. JSON 持久化 ===");

var jsonOpts = new JsonSerializerOptions
{
    WriteIndented = true,
    Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
};

var json = JsonSerializer.Serialize(employees, jsonOpts);
var tempFile = Path.Combine(Path.GetTempPath(), $"employees-{Guid.NewGuid():N}.json");

try
{
    await File.WriteAllTextAsync(tempFile, json);
    Console.WriteLine($"已保存到：{tempFile}");

    // 重新读取
    var loaded = await File.ReadAllTextAsync(tempFile);
    var employees2 = JsonSerializer.Deserialize<List<Employee>>(loaded, jsonOpts);
    Console.WriteLine($"重新加载：{employees2?.Count} 名员工");
}
finally
{
    try { File.Delete(tempFile); } catch { /* ignore */ }
}

// ------------------------------------------------------------
// 6. 集合表达式（C# 12）
// ------------------------------------------------------------
Console.WriteLine("\\n=== 6. 集合表达式 ===");

int[] defaultLevels = [1, 2, 3, 4];
List<string> departments = ["Engineering", "Marketing", "HR"];

Console.WriteLine($"默认级别：[{string.Join(", ", defaultLevels)}]");
Console.WriteLine($"部门列表：[{string.Join(", ", departments)}]");

Console.WriteLine("\\n=== 全书示例运行完成，祝你编码愉快！ ===");

// ============================================================
// 异步处理方法
// ============================================================
async Task ProcessEmployeesAsync(List<Employee> employees)
{
    Console.WriteLine($"开始处理 {employees.Count} 名员工...");
    var tasks = employees.Select(async emp =>
    {
        await Task.Delay(50);  // 模拟 IO 操作
        return $"{emp.Name} ({emp.Level})";
    });

    var results = await Task.WhenAll(tasks);
    foreach (var r in results)
    {
        Console.WriteLine($"  处理完成：{r}");
    }
    Console.WriteLine($"全部处理完成（耗时约 {employees.Count * 50} ms）");
}

// ============================================================
// 类型定义
// ============================================================
public enum Level { Junior, Mid, Senior, Principal }

public record Employee(
    int Id,
    string Name,
    string Department,
    Level Level,
    decimal Salary);
`,
    lang: 'cs',
  },
];

export { chapters };
