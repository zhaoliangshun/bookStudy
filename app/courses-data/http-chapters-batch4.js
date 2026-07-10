// =============================================================
// HTTP 通信教程 —— 第四批章节
// -------------------------------------------------------------
// HTTP/2 与 HTTP/3（15-19章）
//   第 15 章：HTTP/1.1 的性能瓶颈与优化
//   第 16 章：HTTP/2——多路复用、头部压缩、服务器推送
//   第 17 章：HTTP/2 帧与流详解
//   第 18 章：HTTP/3 与 QUIC——基于 UDP 的新一代协议
//   第 19 章：HTTP/3 连接迁移与 0-RTT
// =============================================================

export const chapters = [

  // ============================================================
  // 第 15 章：HTTP/1.1 的性能瓶颈与优化
  // ============================================================
  {
    id: "http-15",
    group: "HTTP/2 与 HTTP/3",
    icon: "📊",
    title: "第 15 章：HTTP/1.1 的性能瓶颈与优化",
    content: `## 一、为什么这一章重要

HTTP/1.1 自 1997 年诞生以来，撑起了整个 Web 二十多年。但到了 2010 年代，网页从「一张 HTML + 几张图」变成「上百个 JS/CSS/图片/字体/接口请求」，HTTP/1.1 的设计缺陷彻底暴露——**页面越复杂，HTTP/1.1 越力不从心**。

理解 HTTP/1.1 的性能瓶颈，是理解 HTTP/2、HTTP/3 为什么那么设计的前提。HTTP/2 的多路复用、头部压缩、Server Push，每一个特性都是冲着 HTTP/1.1 的某个具体痛点去的。**不知道病在哪，就理解不了药为什么这么开**。

这一章我们把 HTTP/1.1 的性能问题一个个拆开：队头阻塞、头部臃肿、无法多路复用、TCP 利用率低，以及工程师们为了绕开这些问题发明的「奇技淫巧」——域名分片、雪碧图、内联、合并、Keep-Alive、管道化。

### 二、HTTP/1.1 的核心性能瓶颈

#### 2.1 队头阻塞（Head-of-Line Blocking，HOL）

这是 HTTP/1.1 最臭名昭著的问题。HTTP/1.1 规定：**一个 TCP 连接上，同一时刻只能处理一个请求**。也就是说，你发了请求 A，必须等 A 的响应完全回来，才能发请求 B。

如果 A 是一个慢请求（比如查一个大数据库要 3 秒），那么排在它后面的 B、C、D 全都得干等 3 秒——明明 TCP 通道是空闲的，带宽是够的，但协议不让发。这就是「队头阻塞」：**队首的请求堵住了整个队列**。

\`\`\`
时间轴：
客户端: --发A-->        等...        --收A-- --发B--> 等... --收B--
服务端:        处理A(3s)        --回A-->       处理B    --回B-->
                                          ↑ B 本可以和 A 并行，但被迫等待
\`\`\`

注意：这里的队头阻塞是**应用层（HTTP）的队头阻塞**，和 TCP 自身的队头阻塞是两回事（TCP 的 HOL 我们在 HTTP/3 章节讲）。

#### 2.2 头部臃肿（Heavy Headers）

HTTP/1.1 的头部是纯文本，而且每次请求都要**完整重复发送**所有头部。一个现代网页请求的头部动辄 1-2KB：

\`\`\`
GET /api/user HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,...
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Cookie: sessionid=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIx...
Referer: https://www.example.com/home
... 还有十几个头
\`\`\`

问题在于：

- **每次都全量发送**：Cookie、User-Agent 这些字段每个请求都一样，却要重复传几百遍。
- **纯文本无压缩**：HTTP/1.1 的头部是 ASCII 文本，一个字节一个字节传，没有任何压缩。
- **cookie 膨胀**：很多站点 cookie 越来越大（session、tracking、abtest 全塞 cookie），每个请求都背着这个大包袱。

100 个请求 × 1.5KB 头部 = 150KB 纯头部开销，而这些头部 90% 是重复的。

#### 2.3 无法多路复用（No Multiplexing）

HTTP/1.1 一个连接只能串行处理一个请求。要并发，只能**开多个 TCP 连接**。但浏览器对同一个域名的连接数有上限（HTTP/1.1 规范建议 2 个，现代浏览器放宽到 6 个）。

6 个连接听起来够用？一个现代网页轻松 100+ 请求，6 个连接轮着跑，还是得排队。而且每个 TCP 连接都要经历**慢启动**（TCP 拥塞控制从一个小窗口开始逐步加大），连接越多，慢启动的代价越大，带宽利用率越低。

#### 2.4 TCP 利用率低

TCP 设计了慢启动、拥塞避免、快速重传等机制来探测网络带宽。一个新连接刚建立时，拥塞窗口（cwnd）很小，需要经过几个 RTT 才能爬到满速。HTTP/1.1 频繁开关连接（即使有 Keep-Alive 也常因超时断开），导致**连接永远在慢启动阶段，永远爬不到满速**。

### 三、工程绕路方案：在 HTTP/2 出现前的「奇技淫巧」

HTTP/2 2015 年才正式发布。在此之前，前端工程师为了绕开 HTTP/1.1 的瓶颈，发明了一系列「将就」的方案。这些方案今天看像黑魔法，但理解它们有助于体会 HTTP/2 的价值。

#### 3.1 域名分片（Domain Sharding）

**思路**：浏览器对每个域名限制 6 个连接，那我就开多个域名！把图片放到 \`img1.example.com\`、\`img2.example.com\`、\`img3.example.com\`...每个域名 6 个连接，6 个域名就能并发 36 个请求。

\`\`\`
默认：1 个域名 = 6 个并发连接
分片：6 个子域名 = 36 个并发连接
\`\`\`

**代价**：

- **DNS 查询开销**：每个新域名都要 DNS 解析。
- **TCP 连接开销**：36 个连接要 36 次 TCP+TLS 握手。
- **慢启动放大**：36 个连接都在慢启动，总吞吐反而可能更差。
- **取消 Cookie 共享**：子域名要小心设置 Cookie domain，否则用户态丢失。

HTTP/2 时代**强烈不建议**域名分片——因为 HTTP/2 一个连接就能多路复用，分片反而破坏了单连接的优势（连接数越多，每个连接的拥塞窗口越小）。Chrome 甚至对 HTTP/2 连接做了优化：同域名一个连接就够。

#### 3.2 雪碧图（CSS Sprites）

**思路**：把几十个小图标合并成一张大图，CSS 用 \`background-position\` 定位。原本 50 个图片请求变成 1 个。

\`\`\`css
.icon-home { background: url(sprite.png) no-repeat -10px -20px; }
.icon-user { background: url(sprite.png) no-repeat -50px -20px; }
\`\`\`

**优点**：请求数从 50 降到 1，大幅缓解队头阻塞。
**缺点**：维护痛苦（改一个图标要重新生成整张图）、缓存粒度粗（改一个图标所有图都失效）、不能精细控制（无法对单个图标做懒加载、响应式）。

#### 3.3 内联（Inlining）

**思路**：把小图片直接 base64 编码进 HTML/CSS，省掉请求。

\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." />
\`\`\`

\`\`\`css
.logo { background: url(data:image/png;base64,iVBORw0KGgo...); }
\`\`\`

**优点**：零额外请求。
**缺点**：base64 膨胀 33%（3 字节变 4 字节）、无法被浏览器单独缓存（随 HTML 一起失效）、无法被 CDN 缓存。

#### 3.4 资源合并（Concatenation）

**思路**：把 10 个 JS 文件合并成 1 个 \`bundle.js\`，把 20 个 CSS 合并成 1 个 \`style.css\`。

\`\`\`
原本：a.js + b.js + c.js + ... = 10 个请求
合并：bundle.js = 1 个请求
\`\`\`

**优点**：请求数大减。
**缺点**：缓存粒度变粗（改一行代码，整个 bundle 失效，所有用户重新下载）；首屏可能下载到用不上的代码。

这正是 Webpack 当年做 Code Splitting 要解决的问题——但 Code Splitting 又把请求数变多了，回到 HTTP/1.1 的老问题。**HTTP/2 的多路复用彻底解决了这个矛盾**：你可以拆成 100 个小文件，HTTP/2 一个连接并发拉过来，缓存粒度还细。

#### 3.5 这些方案的共同局限

所有这些绕路方案的共同特点是：**它们都在「减少请求数」上做文章**，而真正的根因是「一个连接不能多路复用」。HTTP/2 直接从根上解决了——一个连接随便并发多少请求，这些奇技淫巧一夜之间变成了反模式。

### 四、Keep-Alive：复用 TCP 连接

HTTP/1.0 默认每次请求都新建 TCP 连接（请求完就 \`Connection: close\`）。HTTP/1.1 默认开启 Keep-Alive（\`Connection: keep-alive\`），**一个 TCP 连接可以被多个请求复用**，省掉了重复握手开销。

\`\`\`
无 Keep-Alive：
  请求1: TCP握手 -> 请求 -> 响应 -> TCP关闭
  请求2: TCP握手 -> 请求 -> 响应 -> TCP关闭   ← 又握手一次
  请求3: TCP握手 -> 请求 -> 响应 -> TCP关闭   ← 又握手一次

有 Keep-Alive：
  TCP握手 -> 请求1 -> 响应1 -> 请求2 -> 响应2 -> 请求3 -> 响应3 -> TCP关闭
            ↑ 只握手一次，后续请求复用连接
\`\`\`

**Keep-Alive 解决了什么**：TCP/TLS 握手开销（每次 1-2 个 RTT）。
**Keep-Alive 没解决什么**：还是**串行**——请求 2 必须等响应 1 回来才能发，队头阻塞依旧。

### 五、管道化（Pipelining）：被废弃的尝试

HTTP/1.1 还提出了一个叫「管道化」的特性：客户端可以**不等响应，连续发送多个请求**，服务器按请求顺序返回响应。

\`\`\`
管道化：
  客户端: --发A-- --发B-- --发C-- → 连续发出
  服务端: 处理A --回A-- 处理B --回B-- 处理C --回C--  ← 必须按序响应
\`\`\`

听起来不错？但管道化几乎没人用，原因：

1. **响应必须按序**：服务器就算先处理完 B，也必须等 A 的响应发出去才能回 B。如果 A 是慢请求，B/C 照样被堵死——**队头阻塞没解决，只是从客户端挪到了服务端**。
2. **代理/中间盒支持差**：很多代理不正确处理管道化，会乱序响应或丢弃请求。
3. **难以实现**：服务器要维护请求顺序、要正确处理中途断开。
4. **不支持非幂等**：POST 等不幂等请求管道化有风险。

结果：浏览器默认**关闭**管道化（Chrome、Firefox 都默认不开），HTTP/1.1 的管道化形同虚设。

### 六、HTTP/1.1 性能优化的现实清单

在 HTTP/2 全面铺开前，前端性能优化的标准动作：

| 手段 | 解决什么 | 代价 |
|------|---------|------|
| 减少 HTTP 请求数 | 缓解队头阻塞 | 牺牲缓存粒度、可维护性 |
| 使用 CDN | 就近接入、降低 RTT | 成本 |
| 开启 Keep-Alive | 省去重复握手 | 无 |
| 开启 gzip/br 压缩 | 减小响应体 | CPU 开销 |
| 资源预加载（preload） | 提前发请求 | 占用带宽 |
| 域名分片 | 增加并发连接数 | DNS+握手开销、慢启动放大 |
| 雪碧图/内联/合并 | 减少请求数 | 维护成本、缓存粒度 |

这些手段在 HTTP/2 时代一部分变成了反模式（域名分片、过度合并），一部分依旧有效（CDN、压缩、预加载）。

### 七、为什么 HTTP/1.1 迟迟不死

虽然 HTTP/2、HTTP/3 已经普及，HTTP/1.1 还在大量使用，原因：

1. **中间盒兼容性**：很多老代理、老防火墙、老企业网关只认 HTTP/1.1，HTTP/2 的二进制帧会被当成垃圾丢弃。
2. **简单**：HTTP/1.1 是文本协议，\`curl\`、\`telnet\` 都能手动调试；HTTP/2 是二进制，必须用专门工具。
3. **TLS 协商成本**：HTTP/2 over TLS 需要 ALPN 协商，老 TLS 1.0/1.1 客户端协商不了，回退到 HTTP/1.1。
4. **足够用**：对很多简单场景（内部 API、低并发服务），HTTP/1.1 性能瓶颈不显著。

但**新项目毫无疑问应该用 HTTP/2+**，老项目升级也能拿到立竿见影的性能提升。

### 八、面试要点

**Q1：HTTP/1.1 的队头阻塞是什么？**
A：HTTP/1.1 一个 TCP 连接同时只能处理一个请求，必须等当前请求响应完才能发下一个。如果队首请求慢，后续请求全部阻塞。这是应用层的队头阻塞，和 TCP 的队头阻塞不同。

**Q2：为什么浏览器对单域名有 6 个连接的限制？**
A：防止单个站点把服务器连接资源耗尽，也避免单客户端发起过多 TCP 连接加剧网络拥塞。6 个是浏览器厂商的平衡值——多了浪费资源、加剧慢启动；少了并发不够。

**Q3：域名分片在 HTTP/2 时代为什么成了反模式？**
A：HTTP/2 一个连接就能多路复用，单连接的拥塞窗口能爬到最大，吞吐最高。分片成多个连接，每个连接的拥塞窗口都很小，总吞吐反而下降，还多了 DNS 和握手开销。

**Q4：Keep-Alive 解决了什么，没解决什么？**
A：解决了重复 TCP/TLS 握手开销——一个连接复用多个请求。没解决队头阻塞——请求依然串行，下一个必须等上一个响应完。

**Q5：HTTP/1.1 管道化为什么没人用？**
A：响应必须按序返回，慢请求照样堵后续请求，队头阻塞没解决；中间盒兼容性差；非幂等请求有风险。浏览器默认关闭。

### 九、小结

- HTTP/1.1 三大瓶颈：**队头阻塞**（应用层）、**头部臃肿无压缩**、**无法多路复用**。
- 工程绕路：域名分片、雪碧图、内联、合并——都是「减少请求数」的将就方案，HTTP/2 时代大多成了反模式。
- Keep-Alive 省去重复握手，但仍是串行；管道化要求按序响应，几乎被废弃。
- HTTP/2 的多路复用、头部压缩、Server Push，每一项都对应解决 HTTP/1.1 的具体痛点——下一章详讲。`,
    code: `// ============================================================
// 第 15 章代码演示：HTTP/1.1 顺序请求 vs 管道化请求的耗时对比
// ------------------------------------------------------------
// 演示内容：
//   1. 模拟 HTTP/1.1 顺序请求（无 Keep-Alive / 有 Keep-Alive）
//   2. 模拟 HTTP/1.1 管道化请求
//   3. 对比三种模式的耗时，直观感受队头阻塞的影响
//
// 说明：沙箱没有 http 模块，这里用 timers 模拟网络往返时延
//       （RTT）和服务器处理时间，用纯逻辑还原协议行为。
// ============================================================

const RTT = 100;            // 一次网络往返时延（毫秒）
const SERVER_PROCESS = 50;  // 服务器处理一个请求耗时（毫秒）
const TCP_HANDSHAKE = 100;  // TCP 三次握手耗时（约 1 RTT）

// 模拟一次请求：客户端发送 -> 服务器处理 -> 响应返回
// 总耗时 = RTT(请求到达) + SERVER_PROCESS + RTT(响应返回)
function mockRequest(url, callback) {
  setTimeout(() => {
    callback('GET ' + url + ' -> 200 OK');
  }, RTT + SERVER_PROCESS + RTT);
}

// ---------- 模式一：无 Keep-Alive，每个请求新建 TCP 连接 ----------
// 每个请求：TCP握手 + 请求往返 + 服务器处理 + 响应往返
// 单请求耗时 = TCP_HANDSHAKE + 2*RTT + SERVER_PROCESS
function noKeepAlive(urls, done) {
  const results = [];
  let i = 0;
  function next() {
    if (i >= urls.length) { done(results); return; }
    // 模拟 TCP 握手
    setTimeout(() => {
      // 握手完成后发请求
      mockRequest(urls[i], (resp) => {
        results.push(resp);
        i++;
        next();  // 上一个完全结束才发下一个
      });
    }, TCP_HANDSHAKE);
  }
  next();
}

// ---------- 模式二：有 Keep-Alive，复用连接但仍然串行 ----------
// 第一个请求：TCP握手 + 2*RTT + SERVER_PROCESS
// 后续请求：2*RTT + SERVER_PROCESS（省掉了握手）
function withKeepAlive(urls, done) {
  const results = [];
  let i = 0;
  let firstHandshake = true;
  function next() {
    if (i >= urls.length) { done(results); return; }
    const sendReq = () => {
      mockRequest(urls[i], (resp) => {
        results.push(resp);
        i++;
        next();
      });
    };
    if (firstHandshake) {
      firstHandshake = false;
      setTimeout(sendReq, TCP_HANDSHAKE);
    } else {
      sendReq();
    }
  }
  next();
}

// ---------- 模式三：管道化，一次性发出所有请求 ----------
// 客户端：1 RTT 内把所有请求都发出去
// 服务器：按收到的顺序依次处理（这里假设处理是并行的）
// 响应：按请求顺序返回，第一个响应 2 RTT 后到，后续紧接
// 总耗时 ≈ 2*RTT + SERVER_PROCESS（如果是并行处理）
// 注意：真实管道化要求响应按序，这里简化为并行处理+按序收
function pipelined(urls, done) {
  const results = new Array(urls.length);
  let received = 0;
  // 客户端一次性把所有请求都发出去
  urls.forEach((u, idx) => {
    // 服务器并行处理，但响应需要按顺序
    // 简化：每个请求独立完成，到达即收集
    mockRequest(u, (resp) => {
      results[idx] = resp;
      received++;
      if (received === urls.length) done(results);
    });
  });
}

// ---------- 执行对比 ----------
const urls = ['/api/a', '/api/b', '/api/c', '/api/d', '/api/e'];

console.log('========================================');
console.log(' HTTP/1.1 三种请求模式耗时对比');
console.log(' 模拟 ' + urls.length + ' 个请求');
console.log(' RTT=' + RTT + 'ms, 处理=' + SERVER_PROCESS + 'ms, 握手=' + TCP_HANDSHAKE + 'ms');
console.log('========================================');
console.log('');

// 模式一
const t1 = Date.now();
noKeepAlive(urls, (r1) => {
  const cost1 = Date.now() - t1;
  console.log('【模式一】无 Keep-Alive（每请求新建连接）');
  console.log('  结果:', r1);
  console.log('  耗时:', cost1, 'ms');
  console.log('  分析: 每个请求 = 握手(' + TCP_HANDSHAKE + ') + 请求响应(' + (2*RTT+SERVER_PROCESS) + ')');
  console.log('        总耗时 ≈ ' + urls.length + ' x ' + (TCP_HANDSHAKE + 2*RTT + SERVER_PROCESS) + ' = ' + (urls.length * (TCP_HANDSHAKE + 2*RTT + SERVER_PROCESS)) + 'ms');
  console.log('');

  // 模式二
  const t2 = Date.now();
  withKeepAlive(urls, (r2) => {
    const cost2 = Date.now() - t2;
    console.log('【模式二】Keep-Alive（复用连接，串行）');
    console.log('  结果:', r2);
    console.log('  耗时:', cost2, 'ms');
    console.log('  分析: 首个 = 握手 + 请求响应；后续 = 请求响应（省握手）');
    console.log('        总耗时 ≈ ' + TCP_HANDSHAKE + ' + ' + urls.length + ' x ' + (2*RTT+SERVER_PROCESS) + ' = ' + (TCP_HANDSHAKE + urls.length * (2*RTT+SERVER_PROCESS)) + 'ms');
    console.log('');

    // 模式三
    const t3 = Date.now();
    pipelined(urls, (r3) => {
      const cost3 = Date.now() - t3;
      console.log('【模式三】管道化（一次性发出，并行处理）');
      console.log('  结果:', r3);
      console.log('  耗时:', cost3, 'ms');
      console.log('  分析: 所有请求同时发出，并行处理');
      console.log('        总耗时 ≈ 1 次请求往返 = ' + (2*RTT+SERVER_PROCESS) + 'ms');
      console.log('');

      // 总结
      console.log('========================================');
      console.log(' 总结');
      console.log('========================================');
      console.log('  无 Keep-Alive : ' + cost1 + ' ms  ← 最慢，重复握手');
      console.log('  Keep-Alive    : ' + cost2 + ' ms  ← 省握手，但串行');
      console.log('  管道化        : ' + cost3 + ' ms  ← 最快，接近 HTTP/2 多路复用');
      console.log('');
      console.log('  加速比(Keep-Alive vs 无): ' + (cost1/cost2).toFixed(2) + 'x');
      console.log('  加速比(管道化 vs KeepAlive): ' + (cost2/cost3).toFixed(2) + 'x');
      console.log('');
      console.log('  结论：HTTP/1.1 的队头阻塞让串行模式效率低下，');
      console.log('        管道化虽快但兼容性差，最终被 HTTP/2 多路复用取代。');
    });
  });
});`
  },

  // ============================================================
  // 第 16 章：HTTP/2——多路复用、头部压缩、服务器推送
  // ============================================================
  {
    id: "http-16",
    group: "HTTP/2 与 HTTP/3",
    icon: "⚡",
    title: "第 16 章：HTTP/2——多路复用、头部压缩、服务器推送",
    content: `## 一、为什么这一章重要

HTTP/2 是 HTTP 协议自 1997 年以来最大的一次升级。它没有改变 HTTP 的语义（方法、状态码、URI、Header 这些概念都还在），却**彻底重写了传输格式**——从文本变成二进制，从单请求单连接变成多路复用，从无压缩头部变成 HPACK。

理解 HTTP/2 的三大核心特性（多路复用、头部压缩、Server Push），你就能明白：

- 为什么 HTTP/2 时代不再需要域名分片、雪碧图、资源合并
- 为什么同样的页面，HTTP/2 比 HTTP/1.1 快 30%-50%
- 为什么 HTTP/2 一个连接就够，连接越多反而越慢

这一章我们把 HTTP/2 的二进制分帧、多路复用、HPACK、Server Push 讲透，为下一章的帧与流详解打基础。

### 二、HTTP/2 的二进制分帧层（Binary Framing Layer）

HTTP/1.1 是文本协议——请求行、头部、body 都是 ASCII 文本，用 CRLF（\\r\\n）分隔。HTTP/2 在 HTTP 语义层之下，插入了一层**二进制分帧层**：所有的 HTTP 消息（请求、响应、头部、body）都被拆成一个个**二进制帧（Frame）**在连接上传输。

\`\`\`
HTTP/1.1（文本）：
  GET / HTTP/1.1\\r\\nHost: a.com\\r\\n\\r\\nbody

HTTP/2（二进制帧）：
  [HEADERS 帧] [DATA 帧] [DATA 帧] ...
  每个帧 = 9字节帧头 + 载荷
  帧头：长度(3B) + 类型(1B) + 标志(1B) + 流ID(4B)
\`\`\`

为什么改成二进制？

1. **解析效率高**：二进制有固定结构，解析就是读固定偏移的字节，不用逐字符扫描 CRLF。
2. **体积小**：文本要留分隔符，二进制靠长度字段定位，更紧凑。
3. **可扩展**：帧有类型字段，未来加新特性只需定义新帧类型，不破坏老实现。
4. **支持多路复用**：每个帧带流 ID，标识它属于哪个请求/响应，多个流的帧可以交错传输。

### 三、多路复用（Multiplexing）

**这是 HTTP/2 最核心的特性**。在一个 TCP 连接上，可以同时并发多个请求/响应，每个请求/响应是一个**流（Stream）**，流被拆成帧交错传输。

\`\`\`
HTTP/1.1（一个连接串行）：
  连接: --reqA--respA--reqB--respB--reqC--respC--
        ↑ A 没完，B 不能开始

HTTP/2（一个连接多路复用）：
  连接: [A头][B头][A数据][C头][B数据][A数据][C数据]...
        ↑ 三个流的帧交错传输，互不阻塞
\`\`\`

**解决了 HTTP/1.1 的所有痛点**：

- **没有队头阻塞（应用层）**：A 慢不影响 B、C 的帧传输。
- **不需要多连接**：一个连接够用，浏览器不用再开 6 个连接。
- **不需要域名分片**：单连接单域名，CDN 还能复用同一连接。
- **不需要资源合并**：100 个小文件可以并发拉，缓存粒度还细。

**TCP 层的队头阻塞依然存在**：HTTP/2 跑在 TCP 上，如果某个 TCP 包丢了，TCP 会阻塞后续所有数据（包括其他流的数据），直到丢包重传完成。这是 HTTP/3 要解决的问题（用 QUIC 替代 TCP）。但相比 HTTP/1.1 的应用层队头阻塞，HTTP/2 已经好太多——TCP 重传通常只阻塞几十毫秒，而 HTTP/1.1 的应用层阻塞可能是几秒。

### 四、HPACK 头部压缩

HTTP/1.1 的头部纯文本无压缩，每次请求都全量发送，浪费严重。HTTP/2 引入 **HPACK** 算法专门压缩头部。

HPACK 的三板斧：

#### 4.1 静态表（Static Table）

HPACK 预定义了 61 个最常见的头部字段，每个有索引号。比如：

\`\`\`
索引  字段
 2   :method GET
 4   :path /
 6   :scheme http
 8   :status 200
23   accept-encoding
24   cache-control
\`\`\`

发送方可以只发一个索引号（1 字节），接收方查表还原。常见的请求行、状态行几乎都在静态表里，原本几十字节的 \`GET / HTTP/1.1\` 变成 1 字节。

#### 4.2 动态表（Dynamic Table）

连接级的状态表，记录这个连接上出现过的头部。第一次发送某个 \`Cookie: sessionid=abc123\` 时，完整发送并加入动态表（比如索引 62）。下次再发同样的 Cookie，只发「索引 62」一个引用即可。

\`\`\`
第一次：Cookie: sessionid=abc123（完整发送，加入动态表）
第二次：[62]  ← 只发索引号，几字节搞定
\`\`\`

动态表是连接级的，每个连接独立维护，连接关闭即失效。它对 Cookie、User-Agent 这种「每次都一样」的头部效果极佳——原本 1.5KB 的头部，第二次开始可能压缩到几十字节。

#### 4.3 哈夫曼编码（Huffman Coding）

对于头部字段的值（比如 \`Mozilla/5.0...\`），HPACK 用哈夫曼编码进一步压缩——高频字符用短码，低频字符用长码。典型的 User-Agent 字符串能压缩 30% 左右。

#### 4.4 HPACK 综合效果

\`\`\`
HTTP/1.1 头部：每次 1.5KB，100 个请求 = 150KB
HTTP/2 HPACK ：首次 1KB，后续 50B，100 个请求 ≈ 6KB
压缩比：25 倍
\`\`\`

### 五、服务器推送（Server Push）

HTTP/1.1 是严格的「客户端请求 → 服务端响应」模型。客户端请求 \`index.html\`，服务端返回 HTML，客户端解析 HTML 发现需要 \`style.css\` 和 \`app.js\`，再发两个请求——**多了一个 RTT 的等待**。

HTTP/2 的 Server Push 让服务器**主动推送**客户端「即将请求」的资源：

\`\`\`
客户端: GET /index.html
服务端: 响应 index.html
        PUSH_PROMISE: /style.css   ← 我猜你接下来要这个
        PUSH_PROMISE: /app.js
        推送 style.css 的内容
        推送 app.js 的内容
客户端: 收到 HTML 同时就拿到了 CSS/JS，省了一个 RTT
\`\`\`

**适用场景**：服务端能准确预测客户端要请求的资源（比如 HTML 引用的 CSS/JS、首屏图片）。

**坑**：

- **推送的资源进缓存，但客户端可能已有缓存**——服务端不知道客户端缓存状态，盲推可能浪费带宽。
- **推送过多反而拖慢**：推送会占用连接带宽，可能挤掉客户端真正想请求的数据。
- **客户端可拒绝**：客户端可以发 \`RST_STREAM\` 拒绝推送。

实际上 Server Push 在 HTTP/2 实践中争议很大，很多大厂（比如 Google）已经不再用——因为预测客户端缓存状态太难，盲推的收益不稳定。HTTP/3 甚至考虑移除 Server Push（在最新的 RFC 9114 中已弱化）。

### 六、HTTP/2 的其他改进

#### 6.1 单连接

HTTP/2 一个域名只需一个 TCP 连接（建议），所有流都在这一个连接上。好处：

- 省去多次 TCP/TLS 握手开销。
- 拥塞窗口能爬到最大，吞吐最高。
- 连接级状态（HPACK 动态表）能最大化复用。

#### 6.2 流优先级

HTTP/2 允许客户端指定流的**优先级**（权重和依赖关系），告诉服务器哪些流更重要（比如首屏 HTML/CSS 优先于图片）。服务器据此调度带宽。但优先级机制在 HTTP/2 实践中也被证明复杂且效果不稳定，HTTP/3 简化了它。

#### 6.3 流量控制

HTTP/2 借鉴 TCP 的流量控制，每个流、每个连接都有接收窗口，接收方可以告诉发送方「我还能收多少」。防止快的发送方压垮慢的接收方。

### 七、HTTP/2 的部署

HTTP/2 在实践中几乎总是跑在 TLS 上（h2），虽然规范支持明文（h2c），但浏览器只支持 h2 over TLS。部署 HTTP/2 需要：

1. **HTTPS**：必须有 TLS 证书。
2. **ALPN 协商**：TLS 握手时通过 ALPN 扩展协商 \`h2\` 还是 \`http/1.1\`。
3. **服务器支持**：Nginx 1.9.5+、Apache 2.4.17+、Caddy 都默认支持。

Nginx 一行配置就开：

\`\`\`nginx
server {
    listen 443 ssl http2;   # 加上 http2 即可
    ssl_certificate ...;
    ssl_certificate_key ...;
}
\`\`\`

### 八、HTTP/2 的遗留问题

HTTP/2 解决了应用层队头阻塞，但**没解决 TCP 层的队头阻塞**：

- 一个 TCP 连接上所有 HTTP/2 流共享同一个 TCP 流。
- 任何一个 TCP 包丢失，TCP 会阻塞整个连接（包括所有 HTTP/2 流）直到重传完成。
- 在丢包率高的网络（如移动网络 3-5% 丢包），HTTP/2 的多路复用反而不如多个 HTTP/1.1 连接——因为多个连接丢包只影响一个，单连接丢包影响全部。

这就是 HTTP/3 用 QUIC（UDP）替代 TCP 的根本动机——下一章详讲。

### 九、面试要点

**Q1：HTTP/2 和 HTTP/1.1 的最大区别？**
A：HTTP/2 引入二进制分帧层，支持在一个 TCP 连接上多路复用多个流；引入 HPACK 压缩头部；支持 Server Push。语义上和 HTTP/1.1 完全兼容（方法、状态码、URI 都不变），只是传输格式变了。

**Q2：HTTP/2 的多路复用解决了什么问题？**
A：解决了 HTTP/1.1 的应用层队头阻塞——一个连接上多个请求/响应可以并发交错传输，互不阻塞。同时省去了开多连接、域名分片的必要，单连接吞吐更高。

**Q3：HPACK 是怎么压缩头部的？**
A：三板斧：静态表（61 个常见头部预定义索引）、动态表（连接级缓存已发送头部，下次只发索引）、哈夫曼编码（压缩字段值）。综合压缩比可达 20-30 倍。

**Q4：HTTP/2 的 Server Push 为什么实践中用得少？**
A：服务端不知道客户端缓存状态，盲推可能浪费带宽；推送会占用连接带宽挤掉真正需要的数据；预测客户端行为不准。HTTP/3 已弱化该特性。

**Q5：HTTP/2 还有队头阻塞吗？**
A：应用层没有了（多路复用解决），但 TCP 层还有——所有流共享一个 TCP 流，丢一个包整个连接阻塞。这是 HTTP/3 用 QUIC 替代 TCP 的动机。

**Q6：HTTP/2 时代还需要域名分片、雪碧图吗？**
A：不需要，反而成了反模式。HTTP/2 一个连接多路复用，分片会破坏单连接的拥塞窗口优势；雪碧图/合并牺牲缓存粒度，HTTP/2 直接拉多个小文件更快更灵活。

### 十、小结

- HTTP/2 在 HTTP 语义层下插入二进制分帧层，把消息拆成带流 ID 的帧。
- **多路复用**：一个 TCP 连接并发多个流，解决应用层队头阻塞。
- **HPACK**：静态表 + 动态表 + 哈夫曼编码，压缩头部 20-30 倍。
- **Server Push**：服务端主动推送资源，但实践中争议大。
- 遗留问题：TCP 层队头阻塞仍在，HTTP/3 用 QUIC 解决。`,
    code: `// ============================================================
// 第 16 章代码演示：HTTP/2 多路复用流调度 + HPACK 头部去重
// ------------------------------------------------------------
// 演示内容：
//   1. 模拟 HTTP/2 多路复用：多个流的帧交错传输
//   2. 模拟 HPACK 头部压缩：静态表 + 动态表去重
//   3. 直观对比压缩前后头部体积
// ============================================================

const { EventEmitter } = require('events');

// ============================================================
// 第一部分：模拟 HTTP/2 多路复用流调度
// ============================================================

// 模拟一个 HTTP/2 连接，多个流的帧交错传输
class H2Connection extends EventEmitter {
  constructor() {
    super();
    this.streams = new Map();  // 流ID -> 流状态
    this.frameLog = [];        // 记录传输的帧（模拟 wire 上的字节）
    this.nextStreamId = 1;     // 客户端发起的流ID为奇数
  }

  // 创建一个新流（即一个新请求）
  createStream(path) {
    const streamId = this.nextStreamId;
    this.nextStreamId += 2;  // HTTP/2 客户端流ID为奇数
    const stream = {
      id: streamId,
      path: path,
      state: 'idle',
      receivedData: ''
    };
    this.streams.set(streamId, stream);
    return stream;
  }

  // 模拟发送 HEADERS 帧
  sendHeaders(streamId, headers) {
    this._logFrame('HEADERS', streamId, Object.keys(headers).join(','));
  }

  // 模拟发送 DATA 帧（把 body 拆成多个 DATA 帧交错发送）
  sendData(streamId, chunks) {
    chunks.forEach((chunk) => {
      this._logFrame('DATA', streamId, chunk);
    });
  }

  // 关闭流
  closeStream(streamId) {
    const s = this.streams.get(streamId);
    if (s) s.state = 'closed';
  }

  // 记录帧（模拟二进制帧在连接上交错传输）
  _logFrame(type, streamId, payload) {
    this.frameLog.push({
      type: type,
      streamId: streamId,
      payload: payload,
      size: String(payload).length  // 简化：用字符串长度模拟字节数
    });
  }
}

// 模拟三个并发请求，它们的帧在同一个连接上交错传输
function demoMultiplexing() {
  console.log('========================================');
  console.log(' HTTP/2 多路复用演示');
  console.log('========================================');
  console.log('');

  const conn = new H2Connection();

  // 三个并发请求（三个流）
  const s1 = conn.createStream('/index.html');
  const s2 = conn.createStream('/style.css');
  const s3 = conn.createStream('/app.js');

  console.log('创建三个流：');
  console.log('  流 ' + s1.id + ' -> GET ' + s1.path);
  console.log('  流 ' + s2.id + ' -> GET ' + s2.path);
  console.log('  流 ' + s3.id + ' -> GET ' + s3.path);
  console.log('');

  // 发送 HEADERS 帧（三个流的 HEADERS 交错）
  conn.sendHeaders(s1.id, { ':method': 'GET', ':path': '/index.html' });
  conn.sendHeaders(s2.id, { ':method': 'GET', ':path': '/style.css' });
  conn.sendHeaders(s3.id, { ':method': 'GET', ':path': '/app.js' });

  // 发送 DATA 帧（三个流的 body 数据交错传输）
  // 模拟：每个响应拆成 3 个数据块
  conn.sendData(s1.id, ['<html>', '<body>首页</body>', '</html>']);
  conn.sendData(s2.id, ['body {', '  color: red;', '}']);
  conn.sendData(s3.id, ['function init()', '{ console.log("app"); }']);

  // 关闭流
  conn.closeStream(s1.id);
  conn.closeStream(s2.id);
  conn.closeStream(s3.id);

  // 打印连接上实际的帧交错顺序
  console.log('连接上帧的实际传输顺序（交错）：');
  console.log('------------------------------------------');
  conn.frameLog.forEach((f, i) => {
    console.log('  [' + (i+1) + '] ' + f.type + ' 帧 | 流ID=' + f.streamId + ' | payload="' + f.payload + '"');
  });
  console.log('------------------------------------------');
  console.log('');

  // 关键点：所有帧共享一个 TCP 连接，但通过流ID区分归属
  console.log('关键观察：');
  console.log('  - 三个流的帧在同一个连接上交错传输');
  console.log('  - 通过流ID(streamId)区分每个帧属于哪个请求');
  console.log('  - 流之间互不阻塞（多路复用）');
  console.log('  - 一个 TCP 连接搞定所有请求');
  console.log('');
}

// ============================================================
// 第二部分：模拟 HPACK 头部压缩
// ============================================================

class HPACEncoder {
  constructor() {
    // 静态表（HTTP/2 RFC 7541 定义的 61 个常见头部，这里简化）
    this.staticTable = {
      1: [':authority', ''],
      2: [':method', 'GET'],
      3: [':method', 'POST'],
      4: [':path', '/'],
      5: [':path', '/index.html'],
      6: [':scheme', 'http'],
      7: [':scheme', 'https'],
      8: [':status', '200'],
      9: [':status', '204'],
      10: [':status', '304'],
      23: ['accept-encoding', 'gzip, deflate'],
      24: ['accept-language', ''],
      25: ['cache-control', ''],
      28: ['content-length', ''],
      31: ['content-type', ''],
      33: ['date', ''],
      34: ['etag', ''],
      39: ['host', ''],
      44: ['server', ''],
      52: ['user-agent', '']
    };
    // 动态表（连接级，运行时填充）
    this.dynamicTable = [];
    this.dynamicStartIndex = 62;  // 动态表从索引 62 开始
  }

  // 查找头部在表中的索引
  _lookup(name, value) {
    // 先查静态表
    for (const idx in this.staticTable) {
      const [n, v] = this.staticTable[idx];
      if (n === name && v === value) return { table: 'static', index: parseInt(idx) };
      if (n === name && v === '') return { table: 'static-name', index: parseInt(idx) };
    }
    // 再查动态表
    for (let i = 0; i < this.dynamicTable.length; i++) {
      const [n, v] = this.dynamicTable[i];
      if (n === name && v === value) return { table: 'dynamic', index: this.dynamicStartIndex + i };
    }
    return null;
  }

  // 把头部加入动态表
  _addToDynamic(name, value) {
    this.dynamicTable.unshift([name, value]);
    if (this.dynamicTable.length > 32) this.dynamicTable.pop();  // 限制表大小
  }

  // 编码一个头部
  encode(name, value) {
    const hit = this._lookup(name, value);
    if (hit) {
      // 完全命中：只发索引号
      return { type: 'indexed', index: hit.index, bytes: 1, original: name + ': ' + value };
    }
    // 未命中：发完整字段，并加入动态表
    this._addToDynamic(name, value);
    return { type: 'literal', name: name, value: value, bytes: name.length + value.length + 2, original: name + ': ' + value };
  }

  // 编码一组头部
  encodeHeaders(headers) {
    const result = [];
    let originalBytes = 0;
    let encodedBytes = 0;
    for (const name in headers) {
      const enc = this.encode(name, headers[name]);
      result.push(enc);
      originalBytes += (name + ': ' + headers[name] + '\\r\\n').length;
      encodedBytes += enc.bytes;
    }
    return { frames: result, originalBytes: originalBytes, encodedBytes: encodedBytes };
  }
}

function demoHPACK() {
  console.log('========================================');
  console.log(' HPACK 头部压缩演示');
  console.log('========================================');
  console.log('');

  const encoder = new HPACEncoder();

  // 模拟浏览器连续发送的两组请求头部
  const request1 = {
    ':method': 'GET',
    ':path': '/index.html',
    ':scheme': 'https',
    'host': 'www.example.com',
    'accept-encoding': 'gzip, deflate',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'cookie': 'sessionid=abcdef1234567890; userid=42'
  };

  const request2 = {
    ':method': 'GET',
    ':path': '/style.css',  // 只有 path 变了
    ':scheme': 'https',
    'host': 'www.example.com',
    'accept-encoding': 'gzip, deflate',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'cookie': 'sessionid=abcdef1234567890; userid=42'
  };

  console.log('--- 第一个请求的头部编码 ---');
  const r1 = encoder.encodeHeaders(request1);
  console.log('  原始头部 (HTTP/1.1 风格, ' + r1.originalBytes + ' 字节):');
  r1.frames.forEach(f => {
    console.log('    ' + f.original);
  });
  console.log('  HPACK 编码后 (' + r1.encodedBytes + ' 字节):');
  r1.frames.forEach(f => {
    if (f.type === 'indexed') {
      console.log('    -> 索引 ' + f.index + ' (1 字节, 完全命中静态表)');
    } else {
      console.log('    -> 字面量: ' + f.name + '=' + f.value + ' (' + f.bytes + ' 字节, 加入动态表)');
    }
  });
  console.log('  压缩比: ' + (r1.originalBytes / r1.encodedBytes).toFixed(2) + 'x');
  console.log('');

  console.log('--- 第二个请求的头部编码（只有 :path 不同）---');
  const r2 = encoder.encodeHeaders(request2);
  console.log('  原始头部 (HTTP/1.1 风格, ' + r2.originalBytes + ' 字节):');
  r2.frames.forEach(f => {
    console.log('    ' + f.original);
  });
  console.log('  HPACK 编码后 (' + r2.encodedBytes + ' 字节):');
  r2.frames.forEach(f => {
    if (f.type === 'indexed') {
      console.log('    -> 索引 ' + f.index + ' (1 字节, 命中动态表/静态表)');
    } else {
      console.log('    -> 字面量: ' + f.name + '=' + f.value + ' (' + f.bytes + ' 字节, 更新动态表)');
    }
  });
  console.log('  压缩比: ' + (r2.originalBytes / r2.encodedBytes).toFixed(2) + 'x');
  console.log('');

  console.log('关键观察：');
  console.log('  - 第一个请求：静态表命中的用 1 字节，其余加入动态表');
  console.log('  - 第二个请求：cookie/user-agent 等命中动态表，只发索引号');
  console.log('  - 同样的 cookie (30+字节)，第二次只占 1 字节');
  console.log('  - 100 个请求的累计头部开销从 150KB 降到几 KB');
  console.log('');
}

// ============================================================
// 执行演示
// ============================================================
demoMultiplexing();
demoHPACK();

console.log('========================================');
console.log(' 总结');
console.log('========================================');
console.log('  1. 多路复用：一个连接上多个流的帧交错传输，互不阻塞');
console.log('  2. HPACK：静态表 + 动态表 + 哈夫曼编码，重复头部只发索引');
console.log('  3. HTTP/2 用二进制帧 + 流ID 实现了 HTTP/1.1 做不到的并发');`
  },

  // ============================================================
  // 第 17 章：HTTP/2 帧与流详解
  // ============================================================
  {
    id: "http-17",
    group: "HTTP/2 与 HTTP/3",
    icon: "🔧",
    title: "第 17 章：HTTP/2 帧与流详解",
    content: `## 一、为什么这一章重要

上一章我们讲了 HTTP/2 的三大特性（多路复用、HPACK、Server Push），这一章我们钻进 HTTP/2 的「底层零件」——**帧（Frame）和流（Stream）**。

如果说上一章是「HTTP/2 能干什么」，这一章就是「HTTP/2 具体怎么干」。理解帧格式和流状态机，你才能：

- 看懂 HTTP/2 的抓包（Wireshark、chrome://net-export）
- 理解 HTTP/2 调试工具的输出（nghttp、h2i）
- 排查 HTTP/2 的奇怪问题（流被 RST、窗口耗尽、SETTINGS 协商失败）
- 面试时讲清楚 HTTP/2 的实现细节，而不是只会背「多路复用」四个字

这一章是 HTTP/2 最硬核的部分，但也是最值得啃的部分。

### 二、帧（Frame）的通用格式

HTTP/2 所有通信都拆成帧。每个帧的通用格式是：

\`\`\`
+-----------------------------------------------+
|                 帧长度 (3 字节)                 |  <- 载荷长度（最多 16MB）
+---------------+---------------+
|  类型 (1 字节) |  标志 (1 字节) |
+-------------------------------+---------------+
|             流 ID (4 字节)                     |  <- 哪个流，0 表示连接级
+-----------------------------------------------+
|                  载荷 (变长)                    |
+-----------------------------------------------+
\`\`\`

字段说明：

- **长度（3 字节）**：载荷的字节数。默认上限 16384（16KB），可通过 SETTINGS 帧协商到更大（最大 16MB）。
- **类型（1 字节）**：帧的类型，HTTP/2 定义了 10 种帧类型。
- **标志（1 字节）**：8 个比特位，每种帧类型对标志位有不同定义。最常见的是 \`END_STREAM\`（0x01，流结束）和 \`END_HEADERS\`（0x04，头部块结束）。
- **流 ID（4 字节）**：标识这个帧属于哪个流。**最高位保留，实际只有 31 位**。流 ID=0 的帧是连接级控制帧（SETTINGS、PING、GOAWAY）。
- **载荷（变长）**：帧的实际数据，内容由帧类型决定。

注意：**流 ID 一旦分配就永远不会复用**。客户端发起的流 ID 是奇数（1, 3, 5...），服务端发起的（Server Push）是偶数（2, 4, 6...）。流 ID 单调递增，关闭后永不复用——这避免了「旧帧被误认为新流」的混乱。

### 三、10 种帧类型详解

| 类型 | 值 | 作用 |
|------|----|----|
| DATA | 0x0 | 传输请求/响应的 body |
| HEADERS | 0x1 | 传输请求/响应的头部（HPACK 压缩） |
| PRIORITY | 0x2 | 设置流的优先级（已废弃，HTTP/3 移除） |
| RST_STREAM | 0x3 | 重置流，中止某个流 |
| SETTINGS | 0x4 | 协商连接级参数 |
| PUSH_PROMISE | 0x5 | 服务端预告要推送资源 |
| PING | 0x6 | 心跳，测往返时延 |
| GOAWAY | 0x7 | 优雅关闭连接 |
| WINDOW_UPDATE | 0x8 | 流量控制窗口更新 |
| CONTINUATION | 0x9 | HEADERS 帧的续帧（头部太大时拆分） |

#### 3.1 DATA 帧（0x0）

传输 body 数据。标志位：

- \`END_STREAM\`（0x01）：这是流的最后一个帧。
- \`PADDED\`（0x08）：有填充（用于混淆真实长度，防流量分析）。

\`\`\`
[长度][0x0][标志][流ID][数据...]
                       ↑
                  请求/响应的 body 内容
\`\`\`

#### 3.2 HEADERS 帧（0x1）

传输头部块（HPACK 压缩后的）。标志位：

- \`END_STREAM\`（0x01）：这个流的请求/响应没有 body（比如 GET 请求、304 响应），头部结束即流结束。
- \`END_HEADERS\`（0x04）：这一组头部块发完了（如果头部太大拆成多个 CONTINUATION，最后一个才设这个标志）。
- \`PRIORITY\`（0x20）：携带优先级信息（已废弃）。
- \`PADDED\`（0x08）：有填充。

#### 3.3 PRIORITY 帧（0x2）

设置流的优先级（权重 + 依赖）。**RFC 9113（HTTP/2 bis）已废弃此帧**，因为实践中复杂且效果不稳定。HTTP/3 移除了优先级帧，改用更简单的方案。

#### 3.4 RST_STREAM 帧（0x3）

中止某个流。发送方告诉对方「这个流我不想要了/出错了，立刻终止」。常见场景：

- 客户端取消请求（用户点了停止）。
- 拒绝 Server Push（收到 PUSH_PROMISE 后发 RST_STREAM）。
- 协议错误（收到不符合规范的帧）。

RST_STREAM 带 4 字节错误码（NO_ERROR、PROTOCOL_ERROR、CANCEL、FLOW_CONTROL_ERROR 等）。

#### 3.5 SETTINGS 帧（0x4）

连接级参数协商。连接建立后双方各发一个 SETTINGS 帧协商参数：

- \`SETTINGS_MAX_CONCURRENT_STREAMS\`：最大并发流数。
- \`SETTINGS_INITIAL_WINDOW_SIZE\`：流量控制初始窗口。
- \`SETTINGS_MAX_FRAME_SIZE\`：最大帧大小（默认 16KB，最大 16MB）。
- \`SETTINGS_HEADER_TABLE_SIZE\`：HPACK 动态表大小。
- \`SETTINGS_ENABLE_PUSH\`：是否允许 Server Push（可设为 0 禁用）。

SETTINGS 帧的 \`ACK\` 标志（0x01）表示确认收到对方的 SETTINGS。

#### 3.6 PUSH_PROMISE 帧（0x5）

服务端预告「我要推送这个资源」。带上拟推送资源对应的流 ID（新建的偶数流）和 HPACK 压缩的请求头。客户端可以回 RST_STREAM 拒绝。

#### 3.7 PING 帧（0x6）

心跳帧，8 字节载荷。发送方填一个随机值，接收方原样回（带 \`ACK\` 标志）。用于：

- 测往返时延（RTT）。
- 检测连接是否存活。
- 保持连接（防 NAT 超时）。

#### 3.8 GOAWAY 帧（0x7）

优雅关闭连接。发送方告诉对方「我准备关连接了，最后处理的流 ID 是 X，X 之前的我会处理完，之后的我拒绝」。这避免了「关连接时还有飞行中的请求被丢弃」的问题。

GOAWAY 带最后处理的流 ID 和错误码。负载均衡器做平滑切换时就靠 GOAWAY。

#### 3.9 WINDOW_UPDATE 帧（0x8）

流量控制。HTTP/2 借鉴 TCP 的滑动窗口，接收方通过 WINDOW_UPDATE 告诉发送方「我又腾出了 X 字节的接收空间，你可以多发 X 字节」。流级和连接级各有一套窗口。

#### 3.10 CONTINUATION 帧（0x9）

当 HEADERS 帧的头部块太大（超过 SETTINGS_MAX_FRAME_SIZE），拆成多个帧：第一个 HEADERS，后续 CONTINUATION。最后一个 CONTINUATION 设 \`END_HEADERS\`。

### 四、流（Stream）的状态机

每个流有自己的生命周期，由帧驱动状态转换：

\`\`\`
                idle
                  |
              [HEADERS]
                  |
                  v
               +----+
        +----->|open|<-----+
        |      +----+       |
        |       /  \\       |
[HEADERS]    [RST] [RST]   [HEADERS+ES]
        |     /     \\      |
        |    v       v     |
        |  closed  closed  v
        |              +--------+
        |              |half-   |
        |              |closed  |
        |              |(remote)|
        |              +--------+
        |                  |
        |              [ES]
        |                  v
        |              +--------+
        |              |half-   |
        |              |closed  |
        |              |(local) |
        |              +--------+
        |                  |
        |              [ES]
        |                  v
        +-------------->closed
\`\`\`

简化版状态机：

| 状态 | 含义 |
|------|------|
| idle | 流未使用 |
| open | 双方都可以发帧 |
| half-closed (local) | 本方发完 END_STREAM，不再发，但还能收 |
| half-closed (remote) | 对方发完 END_STREAM，本方还能发 |
| closed | 流彻底关闭（正常结束或 RST） |

**关键转换**：

- \`idle\` + 发 HEADERS → \`open\`
- \`open\` + 发 END_STREAM → \`half-closed (local)\`
- \`open\` + 收 END_STREAM → \`half-closed (remote)\`
- \`half-closed\` + 另一方也 END_STREAM → \`closed\`
- 任何状态 + RST_STREAM → \`closed\`

### 五、流量控制（Flow Control）

HTTP/2 的流量控制借鉴 TCP，但更细粒度——**每个流独立控制，连接级也控制**。

#### 5.1 为什么需要流量控制

如果服务端发得快、客户端处理得慢，数据会在客户端缓冲区堆积，最终 OOM。流量控制让接收方告诉发送方「我还能收多少」。

#### 5.2 窗口机制

- 每个流有独立的接收窗口（初始 65535 字节，可调）。
- 连接级也有一个窗口。
- 发送方每发一帧 DATA，窗口减小。
- 接收方处理完数据，发 WINDOW_UPDATE 增加发送方的窗口。
- 窗口为 0 时，发送方必须停发 DATA（但 HEADERS、PING 等控制帧不受限）。

#### 5.3 双层控制

一个 DATA 帧既要消耗流窗口，也要消耗连接窗口。两个窗口都 > 0 才能发。

#### 5.4 常见坑

- **窗口耗尽**：客户端处理慢，窗口归零，服务端发不出数据，请求卡住。要确保及时发 WINDOW_UPDATE。
- **默认窗口小**：默认 64KB，对大文件传输太慢。要调大 \`SETTINGS_INITIAL_WINDOW_SIZE\`。

### 六、一个完整的 HTTP/2 请求/响应交互

\`\`\`
客户端                                         服务端
  |                                              |
  |--- SETTINGS (协商参数) --------------------->|
  |<-- SETTINGS (协商参数) ----------------------|
  |--- SETTINGS ACK --------------------------->|
  |<-- SETTINGS ACK ----------------------------|
  |                                              |
  |--- HEADERS (流1: GET /index.html) --------->|  ← 新建流1
  |--- HEADERS (流3: GET /style.css) ---------->|  ← 新建流3（并发）
  |                                              |
  |<-- HEADERS (流1: 200 OK) -------------------|  ← 流1响应头
  |<-- DATA (流1: <html>...) --------------------|  ← 流1响应体
  |<-- HEADERS (流3: 200 OK) -------------------|  ← 流3响应头
  |--- WINDOW_UPDATE (流1) -------------------->|  ← 客户端腾出窗口
  |<-- DATA (流1: </html>, END_STREAM) ---------|  ← 流1结束
  |<-- DATA (流3: body{...}, END_STREAM) -------|  ← 流3结束
  |                                              |
  |--- PING ------------------------------------>|
  |<-- PING (ACK) -------------------------------|
  |                                              |
  |<-- GOAWAY (优雅关闭) ------------------------|
  |--- (连接关闭) ------------------------------>|
\`\`\`

注意流 1 和流 3 的帧是如何**交错**传输的——这就是多路复用在帧层面的体现。

### 七、面试要点

**Q1：HTTP/2 有哪些帧类型？**
A：10 种：DATA（body）、HEADERS（头部）、PRIORITY（优先级，已废弃）、RST_STREAM（重置流）、SETTINGS（参数协商）、PUSH_PROMISE（推送预告）、PING（心跳）、GOAWAY（优雅关闭）、WINDOW_UPDATE（流量控制）、CONTINUATION（头部续帧）。

**Q2：HTTP/2 帧的格式是什么？**
A：9 字节帧头 + 变长载荷。帧头 = 长度(3B) + 类型(1B) + 标志(1B) + 流ID(4B)。流 ID 最高位保留，0 表示连接级控制帧。

**Q3：HTTP/2 流 ID 为什么不能复用？**
A：避免「旧帧被误认为新流」。流 ID 单调递增，关闭后永不复用，保证帧的归属无歧义。客户端流 ID 奇数，服务端推送的偶数。

**Q4：HTTP/2 的流量控制是怎么工作的？**
A：每个流和连接级都有接收窗口。发送 DATA 帧消耗窗口，接收方发 WINDOW_UPDATE 补充窗口。窗口为 0 时停发 DATA（控制帧不受限）。双层控制（流 + 连接）都要有窗口才能发。

**Q5：SETTINGS 帧协商什么？**
A：连接级参数：最大并发流数、初始窗口大小、最大帧大小、HPACK 动态表大小、是否允许 Server Push。双方各发一个 SETTINGS 并等对方 ACK 生效。

**Q6：GOAWAY 帧的作用？**
A：优雅关闭连接。发送方告知最后处理的流 ID，之前的请求会处理完，之后的拒绝。避免关连接时飞行中的请求被丢弃，用于负载均衡平滑切换。

**Q7：流的状态机有哪些状态？**
A：idle（未用）、open（双方可发）、half-closed local（本方发完）、half-closed remote（对方发完）、closed（彻底关闭）。由 HEADERS、END_STREAM、RST_STREAM 帧驱动转换。

### 八、小结

- HTTP/2 帧格式：9 字节帧头（长度+类型+标志+流ID）+ 变长载荷。
- 10 种帧类型，每种承担特定职责（数据、控制、协商、错误）。
- 流有状态机：idle → open → half-closed → closed，由帧驱动。
- 流量控制：流级 + 连接级双层窗口，WINDOW_UPDATE 补充。
- 流 ID 单调递增不复用，客户端奇数、服务端偶数。`,
    code: `// ============================================================
// 第 17 章代码演示：HTTP/2 帧解析 + 流状态机
// ------------------------------------------------------------
// 演示内容：
//   1. 用 Buffer 构造和解析 HTTP/2 二进制帧
//   2. 实现流的有限状态机（idle/open/half-closed/closed）
//   3. 模拟一次完整的请求/响应交互，打印帧流转和状态变化
// ============================================================

// ---------- HTTP/2 帧类型常量 ----------
const FRAME_TYPES = {
  DATA: 0x0,
  HEADERS: 0x1,
  PRIORITY: 0x2,
  RST_STREAM: 0x3,
  SETTINGS: 0x4,
  PUSH_PROMISE: 0x5,
  PING: 0x6,
  GOAWAY: 0x7,
  WINDOW_UPDATE: 0x8,
  CONTINUATION: 0x9
};

// 帧类型反向映射（数值 -> 名称）
const TYPE_NAMES = {};
for (const k in FRAME_TYPES) TYPE_NAMES[FRAME_TYPES[k]] = k;

// 标志位常量
const FLAGS = {
  END_STREAM: 0x01,
  END_HEADERS: 0x04,
  ACK: 0x01,
  PADDED: 0x08,
  PRIORITY: 0x20
};

// ============================================================
// 第一部分：帧的编码与解码
// ============================================================

// 编码一个 HTTP/2 帧
// 帧头格式：长度(3B) + 类型(1B) + 标志(1B) + 流ID(4B)
function encodeFrame(type, flags, streamId, payload) {
  payload = payload || Buffer.alloc(0);
  const header = Buffer.alloc(9);
  // 长度字段：3 字节，存载荷长度
  header.writeUIntBE(payload.length, 0, 3);
  // 类型：1 字节
  header.writeUInt8(type, 3);
  // 标志：1 字节
  header.writeUInt8(flags, 4);
  // 流 ID：4 字节（最高位保留，必须清零）
  header.writeUInt32BE(streamId & 0x7FFFFFFF, 5);
  return Buffer.concat([header, payload]);
}

// 解码一个 HTTP/2 帧
function decodeFrame(buf, offset) {
  offset = offset || 0;
  if (buf.length - offset < 9) return null;  // 不够一个帧头
  const length = buf.readUIntBE(offset, 3);  // 载荷长度
  if (buf.length - offset - 9 < length) return null;  // 载荷不完整
  const type = buf.readUInt8(offset + 3);
  const flags = buf.readUInt8(offset + 4);
  const streamId = buf.readUInt32BE(offset + 5) & 0x7FFFFFFF;  // 清掉最高位
  const payload = buf.slice(offset + 9, offset + 9 + length);
  return {
    type: type,
    typeName: TYPE_NAMES[type] || 'UNKNOWN(' + type + ')',
    flags: flags,
    flagNames: decodeFlags(type, flags),
    streamId: streamId,
    payload: payload,
    totalLength: 9 + length
  };
}

// 解码标志位
function decodeFlags(type, flags) {
  const names = [];
  if (type === FRAME_TYPES.DATA || type === FRAME_TYPES.HEADERS) {
    if (flags & FLAGS.END_STREAM) names.push('END_STREAM');
    if (flags & FLAGS.PADDED) names.push('PADDED');
  }
  if (type === FRAME_TYPES.HEADERS || type === FRAME_TYPES.CONTINUATION) {
    if (flags & FLAGS.END_HEADERS) names.push('END_HEADERS');
  }
  if (type === FRAME_TYPES.SETTINGS || type === FRAME_TYPES.PING) {
    if (flags & FLAGS.ACK) names.push('ACK');
  }
  return names.length ? names.join('|') : '(none)';
}

// ============================================================
// 第二部分：流状态机
// ============================================================

// 流的状态
const STREAM_STATES = {
  IDLE: 'idle',
  OPEN: 'open',
  HALF_CLOSED_LOCAL: 'half-closed (local)',
  HALF_CLOSED_REMOTE: 'half-closed (remote)',
  CLOSED: 'closed'
};

class H2Stream {
  constructor(id) {
    this.id = id;
    this.state = STREAM_STATES.IDLE;
    this.receivedFrames = [];
  }

  // 处理收到的帧，驱动状态机
  receiveFrame(frame) {
    this.receivedFrames.push(frame);
    const prevState = this.state;
    this._transition(frame, 'receive');
    console.log('    流 ' + this.id + ' [' + prevState + ' -> ' + this.state + '] 收 ' +
                frame.typeName + ' (' + frame.flagNames + ')');
  }

  // 处理发出的帧
  sendFrame(frame) {
    const prevState = this.state;
    this._transition(frame, 'send');
    console.log('    流 ' + this.id + ' [' + prevState + ' -> ' + this.state + '] 发 ' +
                frame.typeName + ' (' + frame.flagNames + ')');
  }

  // 状态转换逻辑
  _transition(frame, direction) {
    const t = frame.type;
    const hasES = (frame.flags & FLAGS.END_STREAM) !== 0;

    switch (this.state) {
      case STREAM_STATES.IDLE:
        if (t === FRAME_TYPES.HEADERS) {
          this.state = hasES ? STREAM_STATES.HALF_CLOSED_LOCAL : STREAM_STATES.OPEN;
        }
        break;
      case STREAM_STATES.OPEN:
        if (t === FRAME_TYPES.RST_STREAM) {
          this.state = STREAM_STATES.CLOSED;
        } else if (hasES) {
          // 发/收 END_STREAM
          this.state = (direction === 'send')
            ? STREAM_STATES.HALF_CLOSED_LOCAL
            : STREAM_STATES.HALF_CLOSED_REMOTE;
        }
        break;
      case STREAM_STATES.HALF_CLOSED_LOCAL:
        // 本方已结束，只能收对方的 END_STREAM 或 RST
        if (t === FRAME_TYPES.RST_STREAM || hasES) {
          this.state = STREAM_STATES.CLOSED;
        }
        break;
      case STREAM_STATES.HALF_CLOSED_REMOTE:
        // 对方已结束，本方发 END_STREAM 或 RST
        if (t === FRAME_TYPES.RST_STREAM || hasES) {
          this.state = STREAM_STATES.CLOSED;
        }
        break;
      case STREAM_STATES.CLOSED:
        // 已关闭，忽略
        break;
    }
  }
}

// ============================================================
// 第三部分：模拟一次完整的请求/响应交互
// ============================================================

function demoFrameExchange() {
  console.log('========================================');
  console.log(' HTTP/2 帧编码与解码演示');
  console.log('========================================');
  console.log('');

  // 构造几个帧，编码成二进制，再解码回来
  const frames = [
    { type: FRAME_TYPES.HEADERS, flags: FLAGS.END_HEADERS, streamId: 1, payload: Buffer.from(':method GET :path /index.html') },
    { type: FRAME_TYPES.DATA, flags: 0, streamId: 1, payload: Buffer.from('<html><body>') },
    { type: FRAME_TYPES.DATA, flags: FLAGS.END_STREAM, streamId: 1, payload: Buffer.from('</body></html>') },
    { type: FRAME_TYPES.PING, flags: 0, streamId: 0, payload: Buffer.from('12345678') },
    { type: FRAME_TYPES.SETTINGS, flags: FLAGS.ACK, streamId: 0, payload: Buffer.alloc(0) }
  ];

  console.log('1. 编码帧为二进制 Buffer：');
  const buffers = frames.map((f, i) => {
    const buf = encodeFrame(f.type, f.flags, f.streamId, f.payload);
    console.log('  帧 ' + (i+1) + ': ' + TYPE_NAMES[f.type] + ' 总长=' + buf.length + ' 字节');
    console.log('        原始字节: ' + buf.toString('hex'));
    return buf;
  });
  console.log('');

  console.log('2. 把多个帧拼到一个 Buffer（模拟一条 TCP 流上的数据）：');
  const combined = Buffer.concat(buffers);
  console.log('  总长度: ' + combined.length + ' 字节');
  console.log('');

  console.log('3. 从 Buffer 中逐个解析帧：');
  let offset = 0;
  let idx = 1;
  while (offset < combined.length) {
    const frame = decodeFrame(combined, offset);
    if (!frame) break;
    console.log('  解析帧 ' + idx + ':');
    console.log('    类型: ' + frame.typeName + ' (0x' + frame.type.toString(16) + ')');
    console.log('    标志: ' + frame.flagNames + ' (0x' + frame.flags.toString(16) + ')');
    console.log('    流ID: ' + frame.streamId + (frame.streamId === 0 ? ' (连接级)' : ''));
    console.log('    载荷: "' + frame.payload.toString('utf8') + '" (' + frame.payload.length + ' 字节)');
    offset += frame.totalLength;
    idx++;
  }
  console.log('');
}

function demoStreamStateMachine() {
  console.log('========================================');
  console.log(' HTTP/2 流状态机演示');
  console.log('========================================');
  console.log('');

  // 模拟一次完整的请求/响应
  const stream = new H2Stream(1);
  console.log('场景：客户端发 GET 请求，服务端返回响应');
  console.log('初始状态: ' + stream.state);
  console.log('');

  // 客户端发 HEADERS（带 END_HEADERS，不带 END_STREAM，因为可能有 body）
  stream.sendFrame({ type: FRAME_TYPES.HEADERS, flags: FLAGS.END_HEADERS, typeName: 'HEADERS', flagNames: 'END_HEADERS' });
  // 服务端回 HEADERS
  stream.receiveFrame({ type: FRAME_TYPES.HEADERS, flags: FLAGS.END_HEADERS, typeName: 'HEADERS', flagNames: 'END_HEADERS' });
  // 服务端发 DATA（带 END_STREAM）
  stream.receiveFrame({ type: FRAME_TYPES.DATA, flags: FLAGS.END_STREAM, typeName: 'DATA', flagNames: 'END_STREAM' });
  console.log('');

  // 模拟客户端取消请求
  console.log('场景：客户端中途取消请求（RST_STREAM）');
  const stream2 = new H2Stream(3);
  console.log('初始状态: ' + stream2.state);
  stream2.sendFrame({ type: FRAME_TYPES.HEADERS, flags: FLAGS.END_HEADERS, typeName: 'HEADERS', flagNames: 'END_HEADERS' });
  stream2.sendFrame({ type: FRAME_TYPES.RST_STREAM, flags: 0, typeName: 'RST_STREAM', flagNames: '(none)' });
  console.log('');

  // 模拟 GET 请求无 body（END_STREAM 在 HEADERS 上）
  console.log('场景：GET 请求无 body（HEADERS 同时带 END_STREAM + END_HEADERS）');
  const stream3 = new H2Stream(5);
  console.log('初始状态: ' + stream3.state);
  stream3.sendFrame({ type: FRAME_TYPES.HEADERS, flags: FLAGS.END_STREAM | FLAGS.END_HEADERS, typeName: 'HEADERS', flagNames: 'END_STREAM|END_HEADERS' });
  stream3.receiveFrame({ type: FRAME_TYPES.HEADERS, flags: FLAGS.END_STREAM | FLAGS.END_HEADERS, typeName: 'HEADERS', flagNames: 'END_STREAM|END_HEADERS' });
  console.log('');

  console.log('关键观察：');
  console.log('  - HEADERS 帧把流从 idle 推到 open');
  console.log('  - END_STREAM 标志让流进入 half-closed，最终 closed');
  console.log('  - RST_STREAM 直接把流从任何状态拉到 closed');
  console.log('  - 流 ID 1/3/5 都是奇数（客户端发起）');
}

// ============================================================
// 执行演示
// ============================================================
demoFrameExchange();
demoStreamStateMachine();`
  },

  // ============================================================
  // 第 18 章：HTTP/3 与 QUIC——基于 UDP 的新一代协议
  // ============================================================
  {
    id: "http-18",
    group: "HTTP/2 与 HTTP/3",
    icon: "🚀",
    title: "第 18 章：HTTP/3 与 QUIC——基于 UDP 的新一代协议",
    content: `## 一、为什么这一章重要

HTTP/2 解决了 HTTP/1.1 的应用层队头阻塞，但**TCP 层的队头阻塞还在**。HTTP/3 做了一件大胆的事——**抛弃 TCP，改用基于 UDP 的 QUIC 协议**。这是 HTTP 历史上第一次不跑在 TCP 上。

理解 HTTP/3 和 QUIC，你才能明白：

- 为什么 Google、Cloudflare、Facebook 都在急推 HTTP/3
- 为什么 5G、移动网络时代 HTTP/3 价值更大
- 为什么 QUIC 把 TLS、流量控制、可靠传输全揉进应用层
- 连接迁移、0-RTT 这些「黑科技」怎么实现的

这一章我们讲 HTTP/3 的核心：为什么换 UDP、QUIC 是什么、QUIC 的四大特性。

### 二、HTTP/2 的遗留问题：TCP 层队头阻塞

HTTP/2 多路复用解决了应用层队头阻塞，但所有流跑在**同一个 TCP 连接**上，TCP 层的队头阻塞依然存在：

\`\`\`
HTTP/2 多路复用：多个流共享一个 TCP 连接
  TCP 流: [包1][包2][包3][包4][包5]...
                ↑ 包2 丢了
  TCP 必须等包2重传完成，才把包3/4/5交给上层
  → 即使包3属于流B、包4属于流C，全部被阻塞
\`\`\`

TCP 是可靠的、有序的字节流协议。它不知道上层有多个 HTTP/2 流，只管「按序交付」。任何包丢失，后续所有包都要等重传。在丢包率 2-5% 的移动网络，这会让 HTTP/2 的多路复用优势大打折扣——一个丢包卡住所有流。

理论上可以用多个 HTTP/2 连接缓解（丢一个连接只影响一个），但这违背了 HTTP/2 单连接的设计初衷，还浪费握手开销。**根本解法是把可靠传输从 TCP 拿到应用层，按流独立实现**——这就是 QUIC。

### 三、为什么选 UDP 而不是直接改 TCP

理论上可以设计一个「流式可靠传输」的新传输层协议替代 TCP，但现实中走不通：

1. **TCP 在内核态**：改 TCP 要改操作系统内核，升级周期以年计，老设备永远升不上。
2. **中间盒僵化**：很多防火墙、NAT、负载均衡器只认 TCP/UDP，新传输层协议的包会被丢弃。
3. **TCP 选项扩展性差**：TCP 头部选项有限，且很多中间盒不正确处理未知选项。
4. **UDP 是无连接的「裸」协议**：UDP 几乎没有语义，只管「把数据报从 A 发到 B」，所有可靠性逻辑可以在应用层自由实现。

UDP 几乎能穿透所有网络（NAT、防火墙都放行 UDP），而且在用户态实现，升级只需更新应用程序，不用动内核。所以 QUIC 选择 **「在 UDP 之上重新实现可靠传输 + 拥塞控制 + 加密」**。

\`\`\`
TCP 方案（HTTP/2）：
  应用层(HTTP/2) -> TLS -> TCP -> IP
  可靠传输在内核(TCP)，加密在 TLS 层

QUIC 方案（HTTP/3）：
  应用层(HTTP/3) -> QUIC(含可靠传输+TLS) -> UDP -> IP
  可靠传输和加密都在用户态(QUIC)，UDP 只做投递
\`\`\`

### 四、QUIC 是什么

**QUIC = Quick UDP Internet Connections**，Google 从 2012 年开始研发，2016 年起 IETF 标准化（RFC 9000-9002）。QUIC 不是简单地把 TCP 搬到 UDP 上，而是一个**重新设计的传输协议**，集成了：

1. **可靠传输**：像 TCP 一样保证数据不丢、不乱、不重。
2. **拥塞控制**：像 TCP 一样探测网络带宽、控制发送速率。
3. **多路复用**：原生支持多个流，流之间独立（无 TCP 的队头阻塞）。
4. **集成 TLS 1.3**：加密是 QUIC 的一部分，握手和 TLS 握手合并。
5. **连接迁移**：连接用 Connection ID 标识，IP 变了连接不断。
6. **0-RTT 恢复**：重连时可以 0 RTT 发送数据。

### 五、QUIC 的核心特性

#### 5.1 流级别的独立可靠传输（无队头阻塞）

QUIC 把「流」作为一等公民。一个 QUIC 连接上有多个流，**每个流独立做可靠传输**——流 A 的包丢了，只重传流 A 的包，不影响流 B/C/D 的交付。

\`\`\`
QUIC 多流：
  流A: [包1][包2丢][包3] -> 包2丢，只重传流A的包2，流B/C照常交付
  流B: [包1][包2][包3] -> 完整交付
  流C: [包1][包2][包3] -> 完整交付
\`\`\`

这是 QUIC 相对 TCP+HTTP/2 的核心优势：**彻底消灭队头阻塞**（应用层和传输层都没有了）。

#### 5.2 集成 TLS 1.3

传统方案：TCP 握手（1 RTT）→ TLS 握手（1-2 RTT）→ 应用数据。连接建立要 2-3 个 RTT。

QUIC 把 TLS 1.3 握手**合并到自己的握手里**——QUIC 握手的同时完成 TLS 握手，连接建立只需 **1 RTT**（首次连接），重连甚至 **0 RTT**。

\`\`\`
TCP + TLS 1.2：3 RTT 建连
  TCP握手(1 RTT) + TLS握手(2 RTT) + 应用数据

TCP + TLS 1.3：2 RTT 建连
  TCP握手(1 RTT) + TLS握手(1 RTT) + 应用数据

QUIC 首次：1 RTT 建连
  QUIC+TLS握手(1 RTT) + 应用数据

QUIC 重连：0 RTT 建连
  应用数据(随握手一起发)  ← 0 RTT!
\`\`\`

而且 QUIC 的加密是**强制的**——QUIC 帧全部加密，连控制帧（ACK、拥塞反馈）都在加密保护下，比 TCP 头部明文更安全。

#### 5.3 连接迁移（Connection Migration）

TCP 连接由「四元组」标识：(源IP, 源端口, 目标IP, 目标端口)。手机从 WiFi 切到 4G，IP 变了，TCP 连接就断了，必须重连。

QUIC 用 **Connection ID（CID）** 标识连接，CID 是双方协商的随机数，与 IP 无关。IP 变了，只要 CID 不变，连接就还在：

\`\`\`
WiFi: 192.168.1.5 --> 服务器
  连接 CID=abc123
切到 4G: 10.0.0.5 --> 服务器
  仍然 CID=abc123，连接不断！
\`\`\`

这对移动场景（地铁、电梯、WiFi/4G 切换）体验提升巨大——视频通话不中断、下载不重头、网页不重新加载。

#### 5.4 0-RTT 连接恢复

第一次连接 QUIC 后，服务器给客户端一个「恢复票据」（类似 TLS session ticket）。下次重连，客户端**在握手的同时就把应用数据一起发出去**，服务器验证票据后直接处理数据——**0 RTT 就能发数据**。

\`\`\`
首次连接（1 RTT）：
  客户端 --握手(+应用数据)--> 服务端  ← 1 RTT 后开始传数据

重连（0 RTT）：
  客户端 --握手+应用数据--> 服务端    ← 0 RTT，数据随握手发出
\`\`\`

对短连接、高频请求场景（API 调用、CDN 静态资源），0-RTT 省下的握手时间非常可观。

**注意 0-RTT 的安全风险**：0-RTT 数据不防重放——攻击者可以录制一次 0-RTT 请求重放给服务器。所以 0-RTT 只能用于**幂等请求**（GET、查询），不能用于非幂等操作（转账、下单）。

### 六、QUIC 的包结构

QUIC 的包结构比 TCP 复杂，因为它要在 UDP 之上承载多个流、握手、加密：

\`\`\`
+----------------------------------------+
| UDP 头部 (源端口, 目标端口)             |
+----------------------------------------+
| QUIC 包头                              |
|   - 标志位 (1 字节)                     |
|   - 版本号 (4 字节, 首次连接)           |
|   - 目标 Connection ID (变长)          |
|   - 源 Connection ID (变长)            |
|   - 包号 (变长)                         |
+----------------------------------------+
| 加密的 QUIC 载荷                        |
|   - 帧们:                              |
|     [STREAM 帧][ACK 帧][CRYPTO 帧]...  |
+----------------------------------------+
\`\`\`

关键点：

- **Connection ID**：标识连接，不依赖 IP。
- **包号**：单调递增，**禁止重用**（即使重传也用新包号，避免重传包和原包混淆，改善 RTT 估算）。
- **载荷加密**：除了包头几个字段，其余全加密。
- **帧结构**：载荷里是多个 QUIC 帧（STREAM、ACK、CRYPTO、PADDING、PING 等）。

#### QUIC 的帧类型（部分）

| 类型 | 作用 |
|------|------|
| PADDING | 填充（防流量分析、凑够最小包大小） |
| PING | 心跳 |
| ACK | 确认收到的包 |
| CRYPTO | 握手数据（传输 TLS 握手消息） |
| STREAM | 流数据（对应 HTTP/3 的请求/响应） |
| MAX_DATA | 流量控制：连接级最大数据量 |
| MAX_STREAM_DATA | 流量控制：流级最大数据量 |
| CONNECTION_CLOSE | 关闭连接 |
| HANDSHAKE_DONE | 握手完成标记 |

### 七、HTTP/3 与 QUIC 的关系

HTTP/3 是跑在 QUIC 上的 HTTP。HTTP/3 的语义和 HTTP/2 一样（方法、状态码、头部、Server Push），但传输层换成 QUIC：

\`\`\`
HTTP/2：HTTP 语义 -> HPACK -> HTTP/2 帧 -> TCP
HTTP/3：HTTP 语义 -> QPACK -> HTTP/3 帧 -> QUIC -> UDP
\`\`\`

区别：

1. **HPACK → QPACK**：HTTP/3 用 QPACK 压缩头部（HPACK 的 QUIC 版本，因为 QUIC 流独立，QPACK 要处理流间共享动态表的同步问题）。
2. **HTTP/2 帧 → HTTP/3 帧**：HTTP/3 的帧格式类似但不同（去掉 PRIORITY 帧，简化设计）。
3. **流是 QUIC 原生的**：HTTP/3 不用自己实现多路复用，直接用 QUIC 的流。

### 八、QUIC 的部署挑战

QUIC 虽好，部署有坑：

1. **UDP 在某些网络被限速/封锁**：部分企业网、运营商对 UDP 限速或丢弃，QUIC 性能反而差。需要 fallback 到 TCP。
2. **CPU 开销高**：TCP 的可靠性在内核（NIC offload），QUIC 在用户态，CPU 占用更高（不过硬件卸载在改进）。
3. **负载均衡难**：传统 LB 基于 TCP 四元组，QUIC 要基于 Connection ID 做会话保持。
4. **调试工具少**：Wireshark 解 QUIC 需要密钥，调试比 TCP 难。

但 Google、Cloudflare、Facebook 等已经在生产大规模用 QUIC，技术栈在成熟。

### 九、面试要点

**Q1：HTTP/3 为什么用 UDP 而不是 TCP？**
A：TCP 在内核，改不动；中间盒僵化，新协议穿透不了；TCP 队头阻塞无法根除。QUIC 在 UDP 上重新实现可靠传输 + 拥塞控制 + TLS，升级只需更新应用，且能消除 TCP 队头阻塞、支持连接迁移和 0-RTT。

**Q2：QUIC 怎么解决队头阻塞？**
A：流级独立可靠传输。一个 QUIC 连接上多个流各自独立做可靠传输和重传，流 A 丢包只影响流 A，流 B/C/D 照常交付。TCP 是字节流，一个包丢全连接阻塞。

**Q3：QUIC 的连接迁移是什么？**
A：QUIC 用 Connection ID 标识连接，不依赖 IP。手机从 WiFi 切 4G，IP 变了但 CID 不变，连接不断。TCP 用四元组标识，IP 变连接就断。

**Q4：0-RTT 是怎么实现的？有什么风险？**
A：首次连接后服务器发恢复票据，重连时客户端在握手中带应用数据，服务器验证票据后直接处理，0 RTT 发数据。风险是 0-RTT 数据不防重放，只能用于幂等请求。

**Q5：QUIC 为什么把 TLS 集成进来？**
A：把 TLS 握手合并进 QUIC 握手，连接建立从 2-3 RTT 降到 1 RTT（重连 0 RTT）。且 QUIC 强制加密，连控制帧都加密，比 TCP 头部明文更安全。

**Q6：QUIC 包号为什么禁止重用？**
A：避免重传包和原包混淆。重传用新包号，接收方可以明确区分「这是新包」还是「重传」，RTT 估算更准，拥塞控制更精准。

**Q7：HTTP/2 和 HTTP/3 的区别？**
A：语义一样（方法、状态码、Header），传输层不同。HTTP/2 跑 TCP，用 HPACK；HTTP/3 跑 QUIC(UDP)，用 QPACK。HTTP/3 消除了 TCP 队头阻塞，支持连接迁移和 0-RTT。

### 十、小结

- HTTP/3 抛弃 TCP，用基于 UDP 的 QUIC，根除 TCP 队头阻塞。
- QUIC = 可靠传输 + 拥塞控制 + 多路复用 + 集成 TLS 1.3 + 连接迁移 + 0-RTT。
- 核心特性：流级独立可靠（无 HOL）、1 RTT 首连/0 RTT 重连、CID 连接迁移、强制加密。
- 包结构：UDP 包 + QUIC 头（CID、包号）+ 加密帧载荷。
- 部署挑战：UDP 限速、CPU 开销、LB 会话保持、调试工具。`,
    code: `// ============================================================
// 第 18 章代码演示：QUIC 包结构 + 流多路复用
// ------------------------------------------------------------
// 演示内容：
//   1. 用 Buffer 构造 QUIC 数据包结构
//   2. 模拟 QUIC 多流独立可靠传输（无队头阻塞）
//   3. 对比 TCP（共享字节流）vs QUIC（独立流）的丢包表现
// ============================================================

const crypto = require('crypto');

// ============================================================
// 第一部分：QUIC 包结构构造与解析
// ============================================================

// QUIC 包类型
const QUIC_PACKET_TYPES = {
  INITIAL: 0x0,        // 初始包（含握手）
  ZERO_RTT: 0x1,       // 0-RTT 包
  HANDSHAKE: 0x2,      // 握手包
  RETRY: 0x3,          // 重试包
  ONE_ROUND: 0x4       // 1-RTT 包（短头部）
};

// QUIC 帧类型
const QUIC_FRAME_TYPES = {
  PADDING: 0x00,
  PING: 0x01,
  ACK: 0x02,
  CRYPTO: 0x06,        // 握手数据
  STREAM: 0x08,        // 流数据（最常用）
  MAX_DATA: 0x10,
  CONNECTION_CLOSE: 0x1c
};

// 构造一个 QUIC 长头部包（用于 Initial/Handshake）
// 结构：标志(1B) + 版本(4B) + DCID长度(1B) + DCID + SCID长度(1B) + SCID + 包号(变长) + 载荷
function encodeQuicLongHeader(packetType, version, dcid, scid, packetNumber, payload) {
  const parts = [];
  // 标志字节：高 2 位固定 11（长头部），低 4 位是包类型
  const firstByte = 0xC0 | (packetType & 0x0F);
  parts.push(Buffer.from([firstByte]));
  // 版本号（4 字节，大端）
  const verBuf = Buffer.alloc(4);
  verBuf.writeUInt32BE(version, 0);
  parts.push(verBuf);
  // 目标 Connection ID
  parts.push(Buffer.from([dcid.length]));
  parts.push(Buffer.from(dcid));
  // 源 Connection ID
  parts.push(Buffer.from([scid.length]));
  parts.push(Buffer.from(scid));
  // 包号（简化：用 2 字节）
  const pnBuf = Buffer.alloc(2);
  pnBuf.writeUInt16BE(packetNumber, 0);
  parts.push(pnBuf);
  // 载荷（真实 QUIC 这里是加密的，我们用明文演示）
  parts.push(payload);
  return Buffer.concat(parts);
}

// 解析 QUIC 长头部包
function decodeQuicPacket(buf) {
  const firstByte = buf.readUInt8(0);
  const isLongHeader = (firstByte & 0x80) !== 0;
  if (!isLongHeader) {
    // 短头部：1-RTT 包
    return {
      headerForm: 'short (1-RTT)',
      packetType: 'ONE_ROUND',
      dcid: buf.slice(1, 9).toString('hex'),
      payload: buf.slice(9).toString('utf8')
    };
  }
  // 长头部
  const packetType = firstByte & 0x0F;
  const version = buf.readUInt32BE(1);
  let offset = 5;
  const dcidLen = buf.readUInt8(offset++);
  const dcid = buf.slice(offset, offset + dcidLen);
  offset += dcidLen;
  const scidLen = buf.readUInt8(offset++);
  const scid = buf.slice(offset, offset + scidLen);
  offset += scidLen;
  const packetNumber = buf.readUInt16BE(offset);
  offset += 2;
  const payload = buf.slice(offset);
  return {
    headerForm: 'long',
    packetType: ['INITIAL', 'ZERO_RTT', 'HANDSHAKE', 'RETRY'][packetType] || 'UNKNOWN',
    version: '0x' + version.toString(16),
    dcid: dcid.toString('hex'),
    scid: scid.toString('hex'),
    packetNumber: packetNumber,
    payload: payload.toString('utf8'),
    payloadBytes: payload.length
  };
}

// 构造一个 QUIC STREAM 帧
// 简化结构：帧类型(1B) + 流ID(变长) + 偏移(变长) + 长度(2B) + 数据
function encodeStreamFrame(streamId, offset, data, endStream) {
  // 帧类型：0x08 (STREAM)，低 3 位控制是否带 offset/length/fin
  // 0x08 | 0x04(带 length) | 0x01(fin)
  let frameType = QUIC_FRAME_TYPES.STREAM | 0x04;
  if (endStream) frameType |= 0x01;
  const parts = [];
  parts.push(Buffer.from([frameType]));
  // 流 ID（简化：1 字节）
  parts.push(Buffer.from([streamId]));
  // 偏移（简化：2 字节）
  const offBuf = Buffer.alloc(2);
  offBuf.writeUInt16BE(offset, 0);
  parts.push(offBuf);
  // 长度（2 字节）
  const lenBuf = Buffer.alloc(2);
  lenBuf.writeUInt16BE(data.length, 0);
  parts.push(lenBuf);
  // 数据
  parts.push(Buffer.from(data));
  return Buffer.concat(parts);
}

function demoQuicPacketStructure() {
  console.log('========================================');
  console.log(' QUIC 包结构演示');
  console.log('========================================');
  console.log('');

  // 生成 Connection ID（随机 8 字节）
  const dcid = crypto.randomBytes(8);
  const scid = crypto.randomBytes(8);
  const QUIC_VERSION = 0x00000001;  // IETF QUIC v1

  // 构造一个 STREAM 帧作为载荷
  const streamFrame = encodeStreamFrame(4, 0, 'GET /index.html', false);
  console.log('构造 STREAM 帧：');
  console.log('  字节: ' + streamFrame.toString('hex'));
  console.log('  解析: 流ID=4 偏移=0 数据="GET /index.html"');
  console.log('');

  // 构造 QUIC Initial 包
  const packet = encodeQuicLongHeader(
    QUIC_PACKET_TYPES.INITIAL,
    QUIC_VERSION,
    dcid, scid,
    0,  // 包号
    streamFrame
  );

  console.log('构造 QUIC Initial 包：');
  console.log('  总长度: ' + packet.length + ' 字节');
  console.log('  原始字节: ' + packet.toString('hex'));
  console.log('');

  console.log('解析 QUIC 包：');
  const decoded = decodeQuicPacket(packet);
  console.log('  头部形式: ' + decoded.headerForm);
  console.log('  包类型: ' + decoded.packetType);
  console.log('  版本: ' + decoded.version);
  console.log('  目标 CID: ' + decoded.dcid);
  console.log('  源 CID: ' + decoded.scid);
  console.log('  包号: ' + decoded.packetNumber);
  console.log('  载荷字节数: ' + decoded.payloadBytes);
  console.log('');

  console.log('关键点：');
  console.log('  - QUIC 包用 Connection ID 标识连接，不依赖 IP');
  console.log('  - 包号单调递增，重传也用新包号');
  console.log('  - 载荷里是 QUIC 帧（STREAM/ACK/CRYPTO 等）');
  console.log('  - 真实 QUIC 载荷是加密的，这里用明文演示结构');
  console.log('');
}

// ============================================================
// 第二部分：QUIC 多流独立可靠传输 vs TCP 共享字节流
// ============================================================

// 模拟 TCP 风格：共享字节流，丢一个包全连接阻塞
function simulateTcpHOL() {
  console.log('========================================');
  console.log(' 模拟 TCP 队头阻塞（HTTP/2 的痛点）');
  console.log('========================================');
  console.log('');

  // 三个流的包，按顺序在 TCP 字节流上发送
  const tcpStream = [
    { stream: 'A', seq: 1, data: 'A1' },
    { stream: 'A', seq: 2, data: 'A2(丢)' },  // 这个包丢了
    { stream: 'B', seq: 1, data: 'B1' },
    { stream: 'C', seq: 1, data: 'C1' },
    { stream: 'A', seq: 3, data: 'A3' }
  ];

  console.log('TCP 字节流上的包顺序（A/B/C 共享）：');
  tcpStream.forEach((p, i) => {
    const lost = p.data.indexOf('丢') >= 0 ? ' <<<' : '';
    console.log('  [' + (i+1) + '] 流' + p.stream + ' seq=' + p.seq + ' data=' + p.data + lost);
  });
  console.log('');

  console.log('TCP 收端行为（按序交付）：');
  console.log('  收到 A1 -> 交付上层');
  console.log('  收到 A2 -> 丢失，等待重传');
  console.log('  收到 B1 -> 不交付（A2 没到，必须按序）');
  console.log('  收到 C1 -> 不交付（同上）');
  console.log('  收到 A3 -> 不交付（同上）');
  console.log('  收到 A2(重传) -> 交付 A2, B1, C1, A3');
  console.log('  结果：A2 丢包，B/C/A3 全部被阻塞！');
  console.log('');
}

// 模拟 QUIC 风格：流独立，丢包只影响一个流
function simulateQuicNoHOL() {
  console.log('========================================');
  console.log(' 模拟 QUIC 无队头阻塞');
  console.log('========================================');
  console.log('');

  // 三个 QUIC 流，各自独立的包号
  const quicPackets = [
    { stream: 0, pktNum: 1, data: 'A1' },
    { stream: 0, pktNum: 2, data: 'A2(丢)' },
    { stream: 4, pktNum: 1, data: 'B1' },
    { stream: 8, pktNum: 1, data: 'C1' },
    { stream: 0, pktNum: 3, data: 'A3' },
    { stream: 0, pktNum: 2, data: 'A2(重传)' }  // 重传也用新包号？简化演示
  ];

  // 按流分组处理
  const streams = {};
  quicPackets.forEach((p) => {
    if (!streams[p.stream]) streams[p.stream] = { received: [], lost: [] };
    if (p.data.indexOf('丢') >= 0) {
      streams[p.stream].lost.push(p);
    } else {
      streams[p.stream].received.push(p);
    }
  });

  console.log('QUIC 各流独立交付：');
  for (const sid in streams) {
    const s = streams[sid];
    console.log('  流 ' + sid + ':');
    console.log('    丢失: ' + s.lost.map(p => p.data).join(', '));
    console.log('    收到: ' + s.received.map(p => p.data).join(', '));
    if (s.lost.length > 0) {
      console.log('    -> 流 ' + sid + ' 需重传丢包，但不影响其他流');
    } else {
      console.log('    -> 流 ' + sid + ' 完整交付，无阻塞');
    }
  }
  console.log('');

  console.log('对比结论：');
  console.log('  TCP+HTTP/2: A2 丢包 -> B1/C1/A3 全部阻塞');
  console.log('  QUIC       : A2 丢包 -> 只重传流 0 的包，流 4/8 照常交付');
  console.log('  这就是 HTTP/3 用 QUIC 替代 TCP 的根本动机！');
  console.log('');
}

// ============================================================
// 第三部分：QUIC 流多路复用演示
// ============================================================

function demoQuicMultiplexing() {
  console.log('========================================');
  console.log(' QUIC 流多路复用演示');
  console.log('========================================');
  console.log('');

  // 模拟三个 HTTP/3 请求，分别在 QUIC 流 0、4、8 上
  const requests = [
    { streamId: 0, path: '/index.html', chunks: ['<html>', '<body>首页</body>', '</html>'] },
    { streamId: 4, path: '/style.css', chunks: ['body{', 'color:red;', '}'] },
    { streamId: 8, path: '/app.js', chunks: ['function', 'init(){', 'console.log(1);', '}'] }
  ];

  // 构造 QUIC 包：每个数据块是一个 STREAM 帧
  // 多个流的 STREAM 帧可以放在同一个 QUIC 包里（或不同包）
  console.log('三个 HTTP/3 请求映射到 QUIC 流：');
  requests.forEach(r => {
    console.log('  流 ' + r.streamId + ': GET ' + r.path + ' (' + r.chunks.length + ' 个数据块)');
  });
  console.log('');

  // 模拟交错发送
  console.log('交错发送的 QUIC STREAM 帧（模拟 wire 上的顺序）：');
  const maxChunks = Math.max(...requests.map(r => r.chunks.length));
  let frameSeq = 1;
  for (let i = 0; i < maxChunks; i++) {
    requests.forEach(r => {
      if (i < r.chunks.length) {
        const endStream = (i === r.chunks.length - 1);
        const frame = encodeStreamFrame(r.streamId, i * 10, r.chunks[i], endStream);
        console.log('  [' + (frameSeq++) + '] 流' + r.streamId + ' 偏移=' + (i*10) +
                    ' 数据="' + r.chunks[i] + '"' +
                    (endStream ? ' (FIN)' : '') +
                    ' [' + frame.length + ' 字节]');
      }
    });
  }
  console.log('');

  console.log('关键观察：');
  console.log('  - QUIC 流是原生支持的，HTTP/3 直接用 QUIC 流');
  console.log('  - 每个流的 STREAM 帧独立可靠传输');
  console.log('  - 流之间可以交错发送，且互不影响');
  console.log('  - 流 ID 0 用于控制，4/8 用于请求（QUIC 客户端流 ID 从 0 开始，4 的倍数）');
}

// ============================================================
// 执行演示
// ============================================================
demoQuicPacketStructure();
simulateTcpHOL();
simulateQuicNoHOL();
demoQuicMultiplexing();`
  },

  // ============================================================
  // 第 19 章：HTTP/3 连接迁移与 0-RTT
  // ============================================================
  {
    id: "http-19",
    group: "HTTP/2 与 HTTP/3",
    icon: "📲",
    title: "第 19 章：HTTP/3 连接迁移与 0-RTT",
    content: `## 一、为什么这一章重要

上一章讲了 QUIC 的整体架构，这一章我们钻进 QUIC 的两个「杀手级特性」——**连接迁移**和 **0-RTT**。这两个特性是 QUIC 相对 TCP+TLS 最直观、最能打动用户的优势：

- 连接迁移让手机在 WiFi/4G 间切换时，视频通话不中断、下载不重头。
- 0-RTT 让二次访问的握手开销从几百毫秒降到 0，体验「瞬间打开」。

理解这两个特性，你才能讲清楚 QUIC 的实战价值，而不是只会说「QUIC 比 TCP 快」。

这一章我们讲：连接迁移的原理、0-RTT 的实现和风险、QUIC 的拥塞控制，以及 TCP+TLS vs QUIC 的建连耗时对比。

### 二、连接迁移（Connection Migration）

#### 2.1 TCP 的痛点：四元组绑定

TCP 连接由四元组唯一标识：

\`\`\`
TCP 连接 = (源IP, 源端口, 目标IP, 目标端口)
\`\`\`

手机从 WiFi 切到 4G：

\`\`\`
WiFi:  (192.168.1.5, 54321, 1.2.3.4, 443)  ← 连接 A
4G:    (10.0.0.5,  54321, 1.2.3.4, 443)  ← IP 变了，TCP 认为是新连接
\`\`\`

TCP 看到源 IP 变了，认为老连接断了，所有基于这个连接的应用（视频通话、长连接、下载）全部中断，必须重连。重连意味着：

- 重新 TCP 握手（1 RTT）
- 重新 TLS 握手（1-2 RTT）
- 重新恢复应用状态（重新登录、重新协商）
- 下载中断的文件要重传（如果没断点续传）
- 视频通话卡顿甚至掉线

这是移动场景的痛点：地铁进出站、电梯、WiFi/4G 切换，每天都在发生。

#### 2.2 QUIC 的解法：Connection ID

QUIC 用 **Connection ID（CID）** 标识连接，CID 是双方协商的随机数，**与 IP/端口无关**：

\`\`\`
QUIC 连接 = Connection ID（双方协商的随机数）

WiFi:  (192.168.1.5, 54321) -- CID=abc123 --> 服务器
4G:    (10.0.0.5,  54321) -- CID=abc123 --> 服务器
                ↑ IP 变了，CID 没变
                ↑ 服务器认得 CID=abc123，连接还在！
\`\`\`

服务器收到 4G 来的包，看 CID 认出这是之前的连接，继续处理，连接无缝延续。

#### 2.3 连接迁移的完整流程

\`\`\`
1. 客户端在 WiFi 下建连：CID=abc123
2. 客户端切到 4G：IP 变了
3. 客户端从 4G 发包：包头仍带 CID=abc123
4. 服务器收到包，看 CID 认出是老连接
5. 服务器验证新路径（Path Validation，发 CHALLENGE 帧）
6. 验证通过，服务器更新对端地址为 4G 的 IP
7. 连接继续，应用无感知
\`\`\`

**路径验证（Path Validation）** 是必要的——防止攻击者伪造源 IP 把连接劫持到自己的地址。服务器收到新 IP 的包后，会向新 IP 发一个 CHALLENGE 帧（带随机数），客户端必须从新 IP 回 RESPONSE，证明「这个新 IP 真的是客户端控制的」。

#### 2.4 连接迁移的应用场景

- **WiFi 切 4G**：出门时手机从 WiFi 切移动网络，视频/通话不中断。
- **4G 切 WiFi**：进家门自动连 WiFi，下载继续。
- **双网络冗余**：手机同时连 WiFi 和 4G，QUIC 可以在两个路径上发，择优接收（实验性）。
- **5G 切 4G**：5G 信号弱时切换，连接不断。

#### 2.5 连接迁移的注意事项

- **CID 不能被中间盒篡改**：QUIC 包头的 CID 是加密认证的（除了 Initial 包），中间盒改不了。
- **多 CID 支持**：QUIC 允许一个连接有多个 CID（NEW_CONNECTION_ID 帧），客户端可以预先拿到一批 CID，迁移时换一个用，防止被跟踪。
- **路径 MTU 探测**：新路径的 MTU 可能不同，QUIC 要重新探测。
- **拥塞控制重置**：新路径的带宽、RTT 可能差很多，拥塞窗口要重新估算（不能沿用老路径的）。

### 三、0-RTT 连接恢复

#### 3.1 什么是 0-RTT

传统 TLS 重连要 1 RTT（TLS 1.3）或更多。QUIC 的 0-RTT 让客户端**在握手的同时就把应用数据一起发出去**——服务器收到后验证票据，立即处理数据，**0 个额外 RTT 就开始传业务数据**。

\`\`\`
首次连接（1-RTT）：
  客户端 ---- ClientHello + 握手数据 ----> 服务器
  客户端 <--- ServerHello + 握手数据 + 应用数据 ---- 服务器
  客户端 ---- 应用数据 ----> 服务器
  ↑ 从开始到能发数据，1 RTT

重连（0-RTT）：
  客户端 ---- ClientHello + 0-RTT 应用数据 ----> 服务器
  ↑ 握手的同时，应用数据就发过去了，0 RTT！
  客户端 <--- ServerHello + 应用数据 ---- 服务器
\`\`\`

#### 3.2 0-RTT 的实现

1. **首次连接**：服务器在握手完成后发一个 **会话票据（session ticket / resumption ticket）**，里面包含加密的主密钥材料。客户端保存这个票据。
2. **重连**：客户端在 ClientHello 里带上票据 + 用票据里的密钥加密的 0-RTT 数据。服务器收到后：
   - 解密票据，恢复主密钥。
   - 用主密钥解密 0-RTT 数据，立即处理。
   - 同时完成新的握手（防止票据被破解后的前向安全）。
3. **结果**：0-RTT 数据在握手完成前就被服务器处理，省下 1 个 RTT。

#### 3.3 0-RTT 的安全风险

0-RTT 的核心风险是**重放攻击**：

- 0-RTT 数据用票据里的密钥加密，这个密钥是「老密钥」——攻击者录制一次 0-RTT 请求，过段时间重放给服务器，服务器解密后认为是合法请求。
- 攻击者不需要知道密钥，只要复制粘贴录制的数据包即可。

**后果**：如果 0-RTT 请求是「转账 100 元」，攻击者重放 10 次，就转了 1000 元。

**防御**：

1. **只允许幂等请求用 0-RTT**：GET、HEAD、查询类请求可以 0-RTT；POST、PUT、DELETE 等非幂等请求必须等握手完成（1-RTT）。
2. **服务器端防重放**：服务器记录已处理的 0-RTT 数据指纹，重复的直接拒绝。但分布式环境下做这个很难（要全局去重）。
3. **应用层防重放**：业务层用 nonce、时间戳、幂等 token 兜底。
4. **限制 0-RTT 数据量**：通常限制 0-RTT 数据不超过几 KB，缩小重放面。

#### 3.4 0-RTT 的应用场景

- **CDN 静态资源**：二次访问图片/CSS/JS，0-RTT 直接拉，体验瞬间。
- **API 调用**：高频幂等查询接口，0-RTT 省握手。
- **移动 App**：手机 App 后台拉取数据，0-RTT 省电省流量。
- **Web 浏览**：用户重新打开标签页，0-RTT 让首屏更快。

### 四、QUIC 的拥塞控制

QUIC 不依赖 TCP 的拥塞控制（因为不在内核），而是在**应用层自己实现**。好处是可灵活切换算法，坏处是 CPU 开销大。

#### 4.1 QUIC 支持的拥塞算法

- **NewReno**：QUIC 默认的兜底算法，类似 TCP NewReno。
- **CUBIC**：Linux TCP 默认算法，QUIC 也可用。
- **BBR**：Google 的瓶颈带宽探测算法，QUIC 友好，对长肥管道和高丢包率场景效果好。

#### 4.2 QUIC 拥塞控制的优势

1. **包级 ACK**：TCP 的 ACK 是「字节级」的，QUIC 的 ACK 是「包级」的——明确告诉发送方「包 1/3/5 收到了，包 2/4 没收到」。这让发送方更精确地知道丢了哪些包，重传更快。
2. **包号不重用**：重传用新包号，发送方可以区分「这是新包」还是「重传」，RTT 估算更准（TCP 容易把重传包的 RTT 算错，叫「重传二义性」）。
3. **更快的丢包检测**：基于包级 ACK，QUIC 可以更快判定丢包（比如「包 3 收到了但包 2 没收到，连续 3 次收到比 2 大的包号，判定包 2 丢失」）。
4. **可插拔算法**：应用层实现，切换算法不用重启内核。

#### 4.3 连接迁移后的拥塞控制

新路径的带宽、RTT、丢包率可能和老路径差很多。QUIC 在连接迁移后**重置拥塞窗口**，从一个小窗口重新探测，避免新路径被旧参数误导。

### 五、TCP+TLS vs QUIC 建连耗时对比

这是最能体现 QUIC 优势的对比：

#### 5.1 首次连接

\`\`\`
TCP + TLS 1.2:
  Client --SYN-->                          Server
  Client <--SYN-ACK--                       Server
  Client --ACK--> [TCP 握手完成, 1 RTT]    Server
  Client --ClientHello-->                   Server
  Client <--ServerHello+Cert+KE--           Server  [TLS 1 RTT]
  Client --KE+Finished-->                   Server
  Client <--Finished--                      Server  [TLS 又 1 RTT]
  Client --应用数据-->                       Server
  总计: 3 RTT 才能发应用数据

TCP + TLS 1.3:
  Client --SYN-->                           Server
  Client <--SYN-ACK--                       Server
  Client --ACK+ClientHello+KE-->            Server  [TCP + TLS 第1 RTT]
  Client <--ServerHello+KE+Finished--       Server
  Client --Finished+应用数据-->              Server  [TLS 第2 RTT]
  总计: 2 RTT 才能发应用数据

QUIC (首次):
  Client --Initial+Handshake+0-RTT数据-->   Server  [1 RTT]
  Client <--Handshake+应用数据--            Server
  总计: 1 RTT 就能发应用数据
\`\`\`

#### 5.2 重连

\`\`\`
TCP + TLS 1.3 (session resumption):
  TCP握手(1 RTT) + TLS握手(1 RTT) = 2 RTT

QUIC (0-RTT):
  Client --握手+0-RTT数据--> Server  [0 RTT]
  总计: 0 RTT 就能发应用数据！
\`\`\`

#### 5.3 实际影响

| 场景 | TCP+TLS 1.3 | QUIC | 节省 |
|------|------------|------|------|
| 首次连接 | 2 RTT | 1 RTT | 1 RTT (50-150ms) |
| 重连 | 2 RTT | 0 RTT | 2 RTT (100-300ms) |
| 移动网络切换 | 连接断开重连 | 连接迁移，不断 | 完整重连开销 |

对 RTT 100ms 的跨洋连接，每次重连省 200-300ms，对移动场景的体验提升非常显著。

### 六、QUIC 连接迁移的实战注意

1. **负载均衡器要支持 CID**：传统 LB 基于四元组哈希，QUIC 要基于 CID 做会话保持，否则迁移后请求打到错误的后端。
2. **NAT 友好**：QUIC 的路径验证机制让 NAT 后的客户端也能迁移。
3. **客户端实现要主动迁移**：检测到网络变化（操作系统网络事件），主动用新 IP 发包，不等服务器发现。
4. **服务器要支持路径更新**：收到新 IP 的包，验证后更新对端地址，不要傻等。
5. **不要硬绑 IP**：应用层不要缓存对端 IP，让 QUIC 处理迁移。

### 七、0-RTT 的实战注意

1. **默认只对幂等请求开启**：GET/HEAD 可以 0-RTT，POST 必须等握手。
2. **服务器要防重放**：分布式环境用 Redis 等记录已处理 0-RTT 请求的指纹。
3. **应用层加幂等 token**：业务层用 request_id + 去重表兜底。
4. **票据要有有效期**：session ticket 过期后强制 1-RTT，缩小重放窗口。
5. **监控 0-RTT 失败率**：票据失效、密钥轮换会导致 0-RTT 失败，要监控并 fallback。

### 八、面试要点

**Q1：QUIC 的连接迁移怎么实现？**
A：QUIC 用 Connection ID 标识连接，与 IP 无关。客户端 IP 变了，包头仍带原 CID，服务器认出老连接继续处理。迁移前做路径验证（CHALLENGE/RESPONSE 帧），防止伪造源 IP 劫持连接。

**Q2：为什么 TCP 做不到连接迁移？**
A：TCP 连接由四元组（源IP/源端口/目标IP/目标端口）标识，IP 变了 TCP 认为是新连接。TCP 在内核，应用层无法干预。QUIC 在用户态，CID 自定义，可解耦 IP。

**Q3：0-RTT 是什么？怎么实现？**
A：重连时客户端在握手中带应用数据，服务器验证票据后立即处理，0 个额外 RTT。实现：首次连接服务器发会话票据，重连时客户端用票据里的密钥加密 0-RTT 数据随 ClientHello 发出。

**Q4：0-RTT 有什么风险？怎么防？**
A：0-RTT 数据不防重放，攻击者可录制重放。防御：只对幂等请求（GET）开 0-RTT，非幂等（POST）必须等握手；服务器端记指纹防重放；应用层用幂等 token 兜底；限制 0-RTT 数据量。

**Q5：QUIC 的拥塞控制比 TCP 好在哪？**
A：包级 ACK 精确知道哪些包丢了；包号不重用，RTT 估算无二义性；丢包检测更快；算法可插拔（NewReno/CUBIC/BBR）。连接迁移后重置拥塞窗口，适应新路径。

**Q6：TCP+TLS vs QUIC 建连耗时？**
A：首次连接，TCP+TLS 1.3 要 2 RTT，QUIC 只要 1 RTT；重连，TCP+TLS 1.3 要 2 RTT，QUIC 0-RTT。跨洋连接每省 1 RTT 节省 50-150ms。

**Q7：QUIC 连接迁移时为什么要做路径验证？**
A：防止攻击者伪造源 IP 把连接劫持到自己的地址。服务器收到新 IP 的包后，向新 IP 发 CHALLENGE 帧，客户端必须从新 IP 回 RESPONSE，证明它真的控制这个新 IP。

### 九、小结

- **连接迁移**：QUIC 用 CID 标识连接，IP 变连接不断；路径验证防劫持；移动场景体验提升巨大。
- **0-RTT**：重连时握手+应用数据一起发，0 RTT 开始传数据；只对幂等请求用，防重放。
- **拥塞控制**：QUIC 在应用层实现，包级 ACK + 包号不重用，比 TCP 更精准；可插拔算法。
- **建连耗时**：QUIC 首次 1 RTT、重连 0 RTT，比 TCP+TLS 1.3 的 2 RTT 省 1-2 个 RTT。
- 实战注意：LB 要支持 CID、0-RTT 防重放、迁移后重置拥塞窗口。`,
    code: `// ============================================================
// 第 19 章代码演示：QUIC 连接迁移 + 0-RTT 建连耗时对比
// ------------------------------------------------------------
// 演示内容：
//   1. 模拟 QUIC 连接迁移（IP 变化，CID 不变，连接延续）
//   2. 模拟 0-RTT 数据传输（握手同时发应用数据）
//   3. 对比 TCP+TLS 1.2 / 1.3 / QUIC 首连 / QUIC 重连耗时
// ============================================================

const crypto = require('crypto');

// 模拟网络时延参数
const RTT = 100;            // 单程往返时延
const TCP_HANDSHAKE_RTT = 1; // TCP 握手用 1 RTT
const TLS12_HANDSHAKE_RTT = 2; // TLS 1.2 握手用 2 RTT
const TLS13_HANDSHAKE_RTT = 1; // TLS 1.3 握手用 1 RTT
const QUIC_HANDSHAKE_RTT = 1;  // QUIC 首连用 1 RTT
const QUIC_RESUMPTION_RTT = 0; // QUIC 0-RTT 重连用 0 RTT

// ============================================================
// 第一部分：模拟 QUIC 连接迁移
// ============================================================

// 模拟一个 QUIC 连接
class QuicConnection {
  constructor(cid, clientIp, serverIp) {
    this.cid = cid;            // Connection ID（与 IP 无关）
    this.clientIp = clientIp;
    this.serverIp = serverIp;
    this.pathValidated = true;
    this.totalDataSent = 0;
    this.migrationCount = 0;
    this.log = [];
  }

  // 客户端发包
  send(data) {
    this.totalDataSent += data.length;
    this.log.push({
      event: 'send',
      from: this.clientIp,
      to: this.serverIp,
      cid: this.cid,
      data: data,
      time: Date.now()
    });
  }

  // 网络切换：客户端 IP 变了
  migrateTo(newIp) {
    const oldIp = this.clientIp;
    this.clientIp = newIp;
    this.pathValidated = false;  // 新路径未验证
    this.migrationCount++;
    this.log.push({
      event: 'migrate',
      from: oldIp,
      to: newIp,
      cid: this.cid,
      time: Date.now()
    });
    return oldIp;
  }

  // 服务器端路径验证（CHALLENGE/RESPONSE）
  validatePath() {
    // 模拟服务器发 CHALLENGE，客户端从新 IP 回 RESPONSE
    this.pathValidated = true;
    this.log.push({
      event: 'path_validated',
      cid: this.cid,
      ip: this.clientIp,
      time: Date.now()
    });
  }

  // 打印连接信息
  info() {
    return 'CID=' + this.cid + ' 客户端IP=' + this.clientIp +
           ' 服务器IP=' + this.serverIp +
           ' 路径验证=' + (this.pathValidated ? '是' : '否') +
           ' 迁移次数=' + this.migrationCount +
           ' 已发数据=' + this.totalDataSent + ' 字节';
  }
}

function demoConnectionMigration() {
  console.log('========================================');
  console.log(' QUIC 连接迁移演示');
  console.log('========================================');
  console.log('');

  // 生成 Connection ID（8 字节随机数）
  const cid = crypto.randomBytes(8).toString('hex');
  const conn = new QuicConnection(cid, '192.168.1.5', '93.184.216.34');

  console.log('1. 在 WiFi 下建立 QUIC 连接：');
  console.log('   ' + conn.info());
  console.log('');

  // 模拟数据传输
  console.log('2. 在 WiFi 下传输数据：');
  conn.send('GET /video/chunk1');
  conn.send('GET /video/chunk2');
  console.log('   发送 2 个请求，总数据 ' + conn.totalDataSent + ' 字节');
  console.log('');

  // 切换到 4G
  console.log('3. 客户端从 WiFi 切换到 4G（IP 变化）：');
  const oldIp = conn.migrateTo('10.0.0.5');
  console.log('   旧 IP: ' + oldIp + ' -> 新 IP: ' + conn.clientIp);
  console.log('   ' + conn.info());
  console.log('   注意：CID 没变，连接对象仍然有效！');
  console.log('');

  // 路径验证
  console.log('4. 服务器对新路径做验证（CHALLENGE/RESPONSE）：');
  conn.validatePath();
  console.log('   ' + conn.info());
  console.log('');

  // 继续传输
  console.log('5. 在 4G 下继续传输数据（连接未中断）：');
  conn.send('GET /video/chunk3');
  conn.send('GET /video/chunk4');
  console.log('   发送 2 个请求，连接无缝延续');
  console.log('   ' + conn.info());
  console.log('');

  // 再切回 WiFi
  console.log('6. 客户端切回 WiFi（再次迁移）：');
  conn.migrateTo('192.168.1.5');
  conn.validatePath();
  conn.send('GET /video/chunk5');
  console.log('   ' + conn.info());
  console.log('');

  // 打印完整事件日志
  console.log('完整事件日志：');
  console.log('------------------------------------------');
  conn.log.forEach((e, i) => {
    if (e.event === 'send') {
      console.log('  [' + (i+1) + '] 发送: ' + e.from + ' -> ' + e.to + ' CID=' + e.cid + ' 数据="' + e.data + '"');
    } else if (e.event === 'migrate') {
      console.log('  [' + (i+1) + '] 迁移: ' + e.from + ' -> ' + e.to + ' CID=' + e.cid + ' (CID 不变)');
    } else if (e.event === 'path_validated') {
      console.log('  [' + (i+1) + '] 路径验证通过: IP=' + e.ip + ' CID=' + e.cid);
    }
  });
  console.log('------------------------------------------');
  console.log('');

  console.log('关键观察：');
  console.log('  - TCP 用四元组标识连接，IP 变了连接就断');
  console.log('  - QUIC 用 CID 标识连接，IP 变了 CID 不变，连接延续');
  console.log('  - 迁移前做路径验证（CHALLENGE/RESPONSE），防劫持');
  console.log('  - 应用层无感知，视频/下载不中断');
  console.log('');
}

// ============================================================
// 第二部分：模拟 0-RTT 数据传输
// ============================================================

// 模拟 QUIC 会话票据（首次连接后服务器发给客户端）
class SessionTicket {
  constructor() {
    this.ticketId = crypto.randomBytes(4).toString('hex');
    this.masterKey = crypto.randomBytes(32);  // 主密钥材料
    this.createdAt = Date.now();
    this.expiresIn = 24 * 3600 * 1000;  // 24 小时过期
  }
  isExpired() {
    return Date.now() - this.createdAt > this.expiresIn;
  }
}

// 模拟 QUIC 客户端
class QuicClient {
  constructor() {
    this.tickets = [];  // 缓存的会话票据
    this.requestCount = 0;
  }

  // 保存服务器发的票据
  saveTicket(ticket) {
    this.tickets.push(ticket);
    console.log('  [客户端] 保存会话票据: id=' + ticket.ticketId);
  }

  // 取一个有效票据
  getValidTicket() {
    return this.tickets.find(t => !t.isExpired());
  }

  // 模拟发送请求
  // 返回: { mode: '1-RTT'|'0-RTT', dataSentWithHandshake: boolean }
  sendRequest(path, isIdempotent) {
    this.requestCount++;
    const ticket = this.getValidTicket();
    if (ticket && isIdempotent) {
      // 有票据且请求幂等：0-RTT
      return {
        mode: '0-RTT',
        rttCost: 0,
        dataSentWithHandshake: true,
        path: path,
        note: '数据随握手一起发出，0 RTT'
      };
    } else if (ticket && !isIdempotent) {
      // 有票据但请求不幂等：必须等握手完成（1-RTT），防重放
      return {
        mode: '1-RTT (防重放)',
        rttCost: 1,
        dataSentWithHandshake: false,
        path: path,
        note: '非幂等请求，必须等握手完成，防止重放攻击'
      };
    } else {
      // 无票据：首次连接，1-RTT
      return {
        mode: '1-RTT (首次)',
        rttCost: 1,
        dataSentWithHandshake: false,
        path: path,
        note: '首次连接，无票据，1 RTT 握手'
      };
    }
  }
}

function demoZeroRTT() {
  console.log('========================================');
  console.log(' 0-RTT 连接恢复演示');
  console.log('========================================');
  console.log('');

  const client = new QuicClient();

  // 首次连接：无票据，1-RTT
  console.log('场景一：首次连接（无票据）');
  console.log('------------------------------------------');
  const r1 = client.sendRequest('/api/user/profile', true);
  console.log('  请求: GET /api/user/profile');
  console.log('  模式: ' + r1.mode);
  console.log('  RTT 开销: ' + r1.rttCost + ' RTT');
  console.log('  说明: ' + r1.note);
  console.log('');

  // 服务器发票据（模拟首次连接完成后）
  console.log('  服务器握手完成后发送会话票据...');
  const ticket = new SessionTicket();
  client.saveTicket(ticket);
  console.log('');

  // 重连幂等请求：0-RTT
  console.log('场景二：重连，幂等请求（GET）');
  console.log('------------------------------------------');
  const r2 = client.sendRequest('/api/user/profile', true);
  console.log('  请求: GET /api/user/profile');
  console.log('  模式: ' + r2.mode);
  console.log('  RTT 开销: ' + r2.rttCost + ' RTT');
  console.log('  说明: ' + r2.note);
  console.log('');

  // 重连非幂等请求：必须 1-RTT（防重放）
  console.log('场景三：重连，非幂等请求（POST 转账）');
  console.log('------------------------------------------');
  const r3 = client.sendRequest('/api/transfer', false);
  console.log('  请求: POST /api/transfer (转账)');
  console.log('  模式: ' + r3.mode);
  console.log('  RTT 开销: ' + r3.rttCost + ' RTT');
  console.log('  说明: ' + r3.note);
  console.log('');

  console.log('关键观察：');
  console.log('  - 0-RTT 只对幂等请求（GET/HEAD）开启');
  console.log('  - 非幂等请求（POST/DELETE）必须等握手完成，防重放攻击');
  console.log('  - 首次连接无票据，必须 1-RTT');
  console.log('  - 会话票据有有效期，过期后回退到 1-RTT');
  console.log('');
}

// ============================================================
// 第三部分：TCP+TLS vs QUIC 建连耗时对比
// ============================================================

// 模拟连接建立耗时（返回 RTT 数和耗时毫秒）
function simulateConnection(scenario) {
  const rttMs = RTT;
  let handshakeRtt = 0;
  let steps = [];

  switch (scenario) {
    case 'tcp+tls1.2':
      // TCP 握手 1 RTT + TLS 1.2 握手 2 RTT
      steps.push({ phase: 'TCP 握手', rtt: 1 });
      steps.push({ phase: 'TLS 1.2 握手', rtt: 2 });
      handshakeRtt = 3;
      break;
    case 'tcp+tls1.3':
      // TCP 握手 1 RTT + TLS 1.3 握手 1 RTT
      steps.push({ phase: 'TCP 握手', rtt: 1 });
      steps.push({ phase: 'TLS 1.3 握手', rtt: 1 });
      handshakeRtt = 2;
      break;
    case 'quic-first':
      // QUIC 首连：握手+TLS 合并 1 RTT
      steps.push({ phase: 'QUIC+TLS 合并握手', rtt: 1 });
      handshakeRtt = 1;
      break;
    case 'quic-resumption':
      // QUIC 0-RTT 重连：0 RTT
      steps.push({ phase: '0-RTT 数据随握手发出', rtt: 0 });
      handshakeRtt = 0;
      break;
  }

  return { scenario: scenario, steps: steps, totalRtt: handshakeRtt, totalMs: handshakeRtt * rttMs };
}

function demoTimingComparison() {
  console.log('========================================');
  console.log(' TCP+TLS vs QUIC 建连耗时对比');
  console.log(' (假设 RTT = ' + RTT + 'ms)');
  console.log('========================================');
  console.log('');

  const scenarios = [
    { key: 'tcp+tls1.2', name: 'TCP + TLS 1.2 (首次)' },
    { key: 'tcp+tls1.3', name: 'TCP + TLS 1.3 (首次)' },
    { key: 'quic-first', name: 'QUIC 首次连接' },
    { key: 'quic-resumption', name: 'QUIC 0-RTT 重连' }
  ];

  const results = scenarios.map(s => {
    const r = simulateConnection(s.key);
    r.name = s.name;
    return r;
  });

  results.forEach(r => {
    console.log('【' + r.name + '】');
    r.steps.forEach(step => {
      console.log('  ' + step.phase + ': ' + step.rtt + ' RTT (' + (step.rtt * RTT) + 'ms)');
    });
    console.log('  总计: ' + r.totalRtt + ' RTT = ' + r.totalMs + 'ms');
    console.log('  首字节时间(TTFB) = ' + r.totalMs + 'ms + 1 RTT(响应) = ' + (r.totalMs + RTT) + 'ms');
    console.log('');
  });

  // 节省对比
  console.log('========================================');
  console.log(' QUIC 相比 TCP+TLS 节省的耗时');
  console.log('========================================');
  const tls13First = results[1];
  const quicFirst = results[2];
  const quicResume = results[3];

  console.log('  首次连接:');
  console.log('    TCP+TLS 1.3: ' + tls13First.totalMs + 'ms (' + tls13First.totalRtt + ' RTT)');
  console.log('    QUIC 首连   : ' + quicFirst.totalMs + 'ms (' + quicFirst.totalRtt + ' RTT)');
  console.log('    节省        : ' + (tls13First.totalMs - quicFirst.totalMs) + 'ms (' + (tls13First.totalRtt - quicFirst.totalRtt) + ' RTT)');
  console.log('');
  console.log('  重连:');
  console.log('    TCP+TLS 1.3: ' + tls13First.totalMs + 'ms (' + tls13First.totalRtt + ' RTT)');
  console.log('    QUIC 0-RTT  : ' + quicResume.totalMs + 'ms (' + quicResume.totalRtt + ' RTT)');
  console.log('    节省        : ' + (tls13First.totalMs - quicResume.totalMs) + 'ms (' + (tls13First.totalRtt - quicResume.totalRtt) + ' RTT)');
  console.log('');

  // 不同 RTT 场景
  console.log('========================================');
  console.log(' 不同网络场景下的节省效果');
  console.log('========================================');
  const networkScenarios = [
    { name: '局域网', rtt: 5 },
    { name: '同城', rtt: 20 },
    { name: '跨省', rtt: 50 },
    { name: '跨国', rtt: 150 },
    { name: '卫星', rtt: 300 }
  ];
  console.log('  场景      RTT    TLS1.3重连   QUIC 0-RTT   节省');
  networkScenarios.forEach(n => {
    const tlsCost = 2 * n.rtt;
    const quicCost = 0;
    const saved = tlsCost - quicCost;
    console.log('  ' + n.name.padEnd(8) + ' ' + String(n.rtt).padStart(4) + 'ms  ' +
                String(tlsCost).padStart(6) + 'ms     ' +
                String(quicCost).padStart(6) + 'ms    ' +
                String(saved).padStart(5) + 'ms');
  });
  console.log('');
  console.log('  结论：RTT 越大，QUIC 0-RTT 节省越显著。');
  console.log('        卫星网络(300ms RTT)下，每次重连省 600ms！');
}

// ============================================================
// 执行所有演示
// ============================================================
demoConnectionMigration();
demoZeroRTT();
demoTimingComparison();`
  }
];
