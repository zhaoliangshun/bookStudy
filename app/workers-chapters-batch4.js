// =============================================================
// 共享 Worker 与服务 Worker - 第四批章节（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   worker-shared        : SharedWorker 共享 Worker
//   worker-service-basic : ServiceWorker 服务 Worker 基础
//   worker-service-cache : ServiceWorker 缓存管理
//   worker-service-offline: ServiceWorker 离线应用
//   worker-service-sync  : ServiceWorker 后台同步
//
// 说明：浏览器中的 SharedWorker / ServiceWorker 无法在 Node.js
// 沙箱里真实运行（没有 window、navigator、Worker 等全局对象），
// 因此本章所有示例代码都用 events.EventEmitter 模拟消息传递与
// 生命周期事件，重点演示"原理与编程模型"。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 16 章 SharedWorker 共享 Worker
  // ============================================================
  {
    id: "worker-shared",
    group: "共享 Worker 与服务 Worker",
    icon: "🔗",
    title: "SharedWorker 共享 Worker",
    content: `## SharedWorker 共享 Worker

### 一、什么是 SharedWorker

前面章节讲的 Web Worker 是"专用 Worker"（DedicatedWorker）：一个 Worker 只能被创建它的页面使用，页面关闭，Worker 就销毁。

**SharedWorker** 则是一种"共享 Worker"：**一个 Worker 可以被多个浏览上下文（标签页、iframe、弹窗）共同访问**。它就像一个"公共会议室"，所有相关页面都连进来，共享同一个 Worker 实例、同一份状态。

> 参考《JavaScript高级程序设计》（红皮书）：SharedWorker 接口表示一种可被多个浏览上下文共享的 Worker，它通过独立的 \`MessagePort\` 与每个连接通信。

典型应用场景：

- **共享状态**：多个标签页同步显示同一份数据（如在线人数、未读消息数）
- **连接池**：多个页面共用一个 WebSocket 长连接，节省服务器资源
- **单资源管理器**：音频播放器跨标签页控制、统一推送接收

### 二、创建 SharedWorker

\`\`\`javascript
// 浏览器代码：每个页面都这样创建
const worker = new SharedWorker('shared.js');
// 注意：SharedWorker 不能直接 postMessage，必须通过 port
worker.port.onmessage = (e) => {
  console.log('收到共享 Worker 消息：', e.data);
};
worker.port.start(); // 显式启动端口（onmessage 会自动 start）
worker.port.postMessage({ type: 'hello', from: '页面A' });
\`\`\`

### 三、SharedWorkerGlobalScope 与 onconnect

在 \`shared.js\` 内部，全局对象是 \`SharedWorkerGlobalScope\`（即 \`self\`）。每当有新页面连接时，会触发 \`onconnect\` 事件：

\`\`\`javascript
// shared.js —— Worker 内部代码
const connections = []; // 保存所有连接的端口

self.onconnect = (e) => {
  const port = e.ports[0]; // 拿到本次连接的 MessagePort
  connections.push(port);
  port.onmessage = (ev) => {
    // 广播给所有连接
    connections.forEach(p => p.postMessage(ev.data));
  };
  port.start(); // 启动端口
  port.postMessage('欢迎加入，当前在线：' + connections.length);
};
\`\`\`

### 四、MessagePort 生命周期

| 方法/属性 | 说明 |
|----------|------|
| \`port.start()\` | 启动端口，开始派发消息（设置 onmessage 会自动调用） |
| \`port.close()\` | 关闭端口，停止接收消息 |
| \`port.postMessage(data)\` | 向对方发送消息 |
| \`port.onmessage\` | 接收消息的回调 |
| \`port.onmessageerror\` | 消息反序列化失败时触发 |

### 五、多标签页共享一份数据

下面这个例子展示了 SharedWorker 最核心的价值——**多页共享**：

\`\`\`javascript
// 页面 A、页面 B、页面 C 都连接到同一个 shared.js
// 任何一个页面发消息，所有页面都能收到
const worker = new SharedWorker('shared.js');
worker.port.onmessage = (e) => {
  console.log('广播：', e.data);
};
worker.port.postMessage('我是页面A');
\`\`\`

### 六、SharedWorker vs DedicatedWorker

| 特性 | DedicatedWorker | SharedWorker |
|------|----------------|--------------|
| 通信方式 | 直接 \`worker.postMessage\` | 通过 \`port.postMessage\` |
| 共享范围 | 单页面 | 多标签页/iframe |
| 全局作用域 | \`DedicatedWorkerGlobalScope\` | \`SharedWorkerGlobalScope\` |
| 连接事件 | 无 | \`onconnect\` |
| 生命周期 | 跟随页面 | 最后一个连接断开后销毁 |
| 调试难度 | 简单 | 较难（需在特殊面板查看） |

### 七、错误处理与调试

SharedWorker 的错误处理与 DedicatedWorker 略有不同：错误事件需要在 \`port\` 上监听，而不是在 \`worker\` 对象上：

\`\`\`javascript
// 页面端：监听端口错误
worker.port.onmessageerror = (e) => {
  console.error('消息反序列化失败', e);
};
// 监听 Worker 内部未捕获错误
worker.onerror = (e) => {
  console.error('Worker 错误：', e.message, e.filename, e.lineno);
};

// Worker 内部：全局错误处理
self.onerror = (msg, file, line) => {
  console.error('内部错误：' + msg);
  return false; // 不阻止默认行为
};
\`\`\`

**调试技巧**：

- Chrome 访问 \`chrome://inspect/#workers\`，可看到所有运行中的 SharedWorker
- Firefox 在开发者工具的"调试器"面板选择 SharedWorker
- 由于多个页面共享，调试时要特别注意"哪个端口发的消息"
- 建议在每条消息里带上来源标识（如 \`from: 'pageA'\`）

### 八、Transferable 对象传输

普通 postMessage 会克隆数据，但对于 \`ArrayBuffer\`、\`MessagePort\`、\`ImageBitmap\` 等 Transferable 对象，可以"转移所有权"实现零拷贝：

\`\`\`javascript
// 转移 ArrayBuffer 所有权（原端口将无法再访问）
const buffer = new ArrayBuffer(1024);
worker.port.postMessage(buffer, [buffer]); // 第二个参数是 transfer 列表
\`\`\`

注意：部分浏览器对 SharedWorker 的 Transferable 支持不完整，使用前需测试。

### 九、浏览器支持与局限

- **支持**：Chrome、Firefox、Safari（Safari 16+ 才完整支持）
- **局限**：
  - 部分浏览器不支持 Transferable 对象传输
  - 调试较麻烦，Chrome 需访问 \`chrome://inspect/#workers\`
  - 不能直接访问 DOM，与 DedicatedWorker 一致
  - 端口较多时需自行管理 \`close()\`，避免内存泄漏
  - 同源策略限制：只能被同源页面共享

### 十、小结

SharedWorker 解决的是"跨页面共享"问题：用一份 Worker 代码、同一份内存状态，服务多个浏览上下文。理解它的关键在于 **MessagePort**——每个连接都是独立的端口，Worker 通过 \`onconnect\` 收集这些端口并广播消息。下一章我们将认识更强大的 ServiceWorker——它不仅共享，还能拦截网络请求！`,
    code: `// ============================================
// SharedWorker 原理模拟：多页面共享一个 Worker
// 用 EventEmitter 模拟 MessagePort 与 onconnect
// ============================================

const { EventEmitter } = require('events');

// --- 浏览器真实代码（仅作注释参考）---
// const worker = new SharedWorker('shared.js');
// worker.port.onmessage = (e) => console.log(e.data);
// worker.port.postMessage({ from: '页面A' });

// --- 模拟 MessagePort：双向通信通道 ---
class MessagePortSim extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this._other = null; // 对端端口
    this._started = false;
  }
  // 配对：把两个端口连起来
  pair(other) {
    this._other = other;
    other._other = this;
  }
  start() {
    this._started = true;
    // onmessage 被设置时浏览器会自动 start
  }
  postMessage(data) {
    if (!this._other) return;
    // 模拟异步派发到对端的 message 事件
    setImmediate(() => {
      this._other.emit('message', { data, ports: [] });
    });
  }
  close() {
    this._started = false;
    this._other = null;
    this.removeAllListeners();
  }
}

// --- 模拟 SharedWorkerGlobalScope（Worker 内部）---
class SharedWorkerScope extends EventEmitter {
  constructor() {
    super();
    this.ports = [];            // 所有连接的端口
    this.onlineCount = 0;       // 共享状态：在线人数
  }
  // 浏览器中：self.onconnect = (e) => { ... }
  onconnect(callback) {
    this.on('connect', callback);
  }
  // 内部方法：接受一个新连接
  acceptConnect(port) {
    this.ports.push(port);
    this.onlineCount++;
    this.emit('connect', { ports: [port] });
  }
  // 广播给所有端口
  broadcast(data) {
    this.ports.forEach(p => p.postMessage(data));
  }
}

// --- 模拟 SharedWorker 构造（外部）---
function createSharedWorker(scope) {
  return {
    port: (() => {
      // 为每个页面创建一对 MessagePort
      const pagePort = new MessagePortSim('page');
      const workerPort = new MessagePortSim('worker');
      pagePort.pair(workerPort);
      pagePort.start();
      workerPort.start();
      // 触发 Worker 的 onconnect
      scope.acceptConnect(workerPort);
      return pagePort;
    })()
  };
}

// ============================================
// 演示 1：Worker 内部逻辑（模拟 shared.js）
// ============================================
console.log('═══════════════════════════════════════════');
console.log('  演示 1：SharedWorker 多页面共享');
console.log('═══════════════════════════════════════════');

const sharedScope = new SharedWorkerScope();

// Worker 内部：监听连接，广播消息
sharedScope.onconnect((e) => {
  const port = e.ports[0];
  const idx = sharedScope.ports.length;
  // 通知新连接：当前在线人数
  port.postMessage({
    type: 'welcome',
    msg: '欢迎第 ' + idx + ' 位连接者，当前在线：' + sharedScope.onlineCount
  });
  // 监听该端口发来的消息
  port.on('message', (ev) => {
    console.log('  [Worker 收到] ' + ev.data.from + ' 说: ' + ev.data.text);
    // 广播给所有连接
    sharedScope.broadcast({
      type: 'broadcast',
      from: ev.data.from,
      text: ev.data.text
    });
  });
});

// ============================================
// 演示 2：三个页面连接到同一个 SharedWorker
// ============================================
const pageA = createSharedWorker(sharedScope);
const pageB = createSharedWorker(sharedScope);
const pageC = createSharedWorker(sharedScope);

// 各页面监听消息
pageA.port.on('message', (e) => {
  console.log('  [页面A 收到]', e.data.type, '-', e.data.msg || e.data.text);
});
pageB.port.on('message', (e) => {
  console.log('  [页面B 收到]', e.data.type, '-', e.data.msg || e.data.text);
});
pageC.port.on('message', (e) => {
  console.log('  [页面C 收到]', e.data.type, '-', e.data.msg || e.data.text);
});

// 页面 A 发送消息
pageA.port.postMessage({ from: '页面A', text: '大家好！' });

setTimeout(() => {
  console.log('');
  console.log('  当前 Worker 端口数：' + sharedScope.ports.length);
  console.log('  在线人数：' + sharedScope.onlineCount);
  console.log('');

  // ============================================
  // 演示 3：连接池场景——共用 WebSocket
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('  演示 2：共享连接池场景');
  console.log('═══════════════════════════════════════════');

  class SharedConnectionPool extends EventEmitter {
    constructor() {
      super();
      this.sockets = [];     // 模拟 WebSocket 集合
      this.messageQueue = []; // 离线消息队列
    }
    // 模拟只建立一个长连接
    connect() {
      const fakeSocket = new EventEmitter();
      this.sockets.push(fakeSocket);
      console.log('  [连接池] 建立 1 个共享长连接（共 ' + this.sockets.length + ' 个）');
      return fakeSocket;
    }
    // 所有页面共享这个连接发送
    send(data) {
      console.log('  [连接池] 通过共享连接发送：' + JSON.stringify(data));
    }
  }

  const pool = new SharedConnectionPool();
  const socket = pool.connect(); // 只建立一个连接
  // 页面 A、B 共用同一连接
  pool.send({ from: '页面A', msg: 'hi' });
  pool.send({ from: '页面B', msg: 'hello' });
  console.log('  两个页面，仅用 1 个连接，节省服务器资源 ✅');
}, 50);
`,
  },

  // ============================================================
  // 第 17 章 ServiceWorker 服务 Worker 基础
  // ============================================================
  {
    id: "worker-service-basic",
    group: "共享 Worker 与服务 Worker",
    icon: "🛠️",
    title: "ServiceWorker 服务 Worker 基础",
    content: `## ServiceWorker 服务 Worker 基础

### 一、什么是 ServiceWorker

**ServiceWorker**（服务 Worker）是浏览器提供的一种**可编程网络代理**。它运行在浏览器主线程之外，能够拦截页面发出的网络请求，决定是直接从缓存返回、还是发往服务器。

> 参考《JavaScript高级程序设计》：Service Worker 本质上是一个在浏览器后台运行的脚本，独立于网页，充当网页与网络之间的"代理服务器"。

它和普通 Worker 的核心区别：

| 特性 | 普通 Worker | ServiceWorker |
|------|------------|---------------|
| DOM 访问 | 无 | 无 |
| 生命周期 | 跟随页面 | 独立，可被唤醒/销毁 |
| 网络拦截 | 不能 | 能拦截 fetch 请求 |
| 触发方式 | 显式 postMessage | 事件驱动（install/fetch/push） |
| 持久性 | 页面关闭即销毁 | 可长期存活，按需唤醒 |
| HTTPS 要求 | 不强制 | 必须 HTTPS（localhost 除外） |

### 二、注册 ServiceWorker

\`\`\`javascript
// 主页面代码
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/app/'   // 控制范围：/app/ 下的所有页面
  }).then(reg => {
    console.log('注册成功，scope：', reg.scope);
  }).catch(err => {
    console.error('注册失败：', err);
  });
}
\`\`\`

**scope（作用域）** 决定了 ServiceWorker 能拦截哪些 URL。默认是 sw.js 所在目录。

### 三、生命周期事件

ServiceWorker 有完整的生命周期：

\`\`\`
注册 → 安装(install) → 激活(activate) → 运行(空闲/唤醒) → 销毁
\`\`\`

| 事件 | 触发时机 | 用途 |
|------|---------|------|
| \`install\` | 首次注册或版本更新时 | 预缓存资源 |
| \`activate\` | 旧 SW 失效、新 SW 接管时 | 清理旧缓存 |
| \`fetch\` | 拦截到网络请求时 | 返回缓存或网络 |
| \`message\` | 收到页面 postMessage | 通信 |
| \`push\` | 收到推送消息 | 显示通知 |
| \`sync\` | 网络恢复时 | 后台同步 |

### 四、waitUntil 模式：延长事件生命周期

ServiceWorker 随时可能被浏览器销毁，事件回调里若有异步任务，必须用 \`event.waitUntil(promise)\` 告诉浏览器"等这个 Promise 完成再销毁我"：

\`\`\`javascript
// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => cache.addAll(['/index.html', '/app.js']))
  );
});
\`\`\`

### 五、ServiceWorkerGlobalScope

在 \`sw.js\` 内部，全局对象是 \`ServiceWorkerGlobalScope\`（即 \`self\`）：

- \`self.caches\` —— Cache API 入口
- \`self.clients\` —— 管理所有受控页面
- \`self.registration\` —— 当前注册信息
- \`self.skipWaiting()\` —— 跳过等待，立即激活
- \`self.clients.claim()\` —— 立即接管所有页面

### 六、HTTPS 要求

ServiceWorker 能拦截网络请求，若被中间人篡改将极其危险，因此**强制要求 HTTPS**。唯一例外是 \`localhost\`，便于本地开发。

### 七、更新流程与版本管理

ServiceWorker 的更新机制是面试常考点，也是实际开发中最容易踩坑的地方：

\`\`\`
1. 浏览器定期检查 sw.js 是否有字节级变化
2. 发现新版本 → 下载新 sw.js → 触发 install（此时旧 SW 仍在运行）
3. 新 SW 进入 waiting 状态，等待旧 SW 释放（所有标签页关闭）
4. 旧 SW 失效 → 新 SW 触发 activate → 接管页面
\`\`\`

**关键点**：

- 新 SW 安装后不会立即激活，需等旧 SW"退役"
- 调用 \`self.skipWaiting()\` 可让新 SW 跳过等待，立即激活
- 调用 \`self.clients.claim()\` 可让新 SW 立即接管已打开的页面
- \`navigator.serviceWorker.addEventListener('controllerchange', ...)\` 可监听接管事件

\`\`\`javascript
self.addEventListener('install', (event) => {
  event.waitUntil(/* 预缓存 */);
  self.skipWaiting(); // 新版立即激活，不等旧版退役
});

self.addEventListener('activate', (event) => {
  event.waitUntil(/* 清理旧缓存 */);
  self.clients.claim(); // 立即接管所有页面
});
\`\`\`

### 八、应用场景

- **离线应用**：缓存资源，断网仍可用
- **推送通知**：服务器主动推送消息
- **后台同步**：网络恢复后自动同步数据
- **性能优化**：缓存策略加速加载
- **请求改写**：统一加 header、灰度发布
- **PWA 核心**：让网站具备"可安装、可离线、可推送"的原生能力

### 九、与页面的双向通信

ServiceWorker 和页面之间通过 \`postMessage\` 双向通信，但 API 与普通 Worker 略有不同：

\`\`\`javascript
// 页面 → SW
navigator.serviceWorker.controller.postMessage({ cmd: 'sync' });

// SW → 页面（可定向或广播）
self.clients.matchAll().then(clients => {
  clients.forEach(c => c.postMessage({ msg: '已更新' }));
});
\`\`\`

消息是结构化克隆传递，不支持 Transferable 的某些场景需注意。页面侧通过 \`navigator.serviceWorker.addEventListener('message', ...)\` 接收。

### 十、小结

ServiceWorker 是 PWA（渐进式 Web 应用）的核心技术。理解它的关键有三点：**它是网络代理**（拦截 fetch）、**它有独立生命周期**（install/activate）、**它事件驱动**（waitUntil 保活）。更新机制中 \`skipWaiting\` + \`clients.claim\` 是实现"热更新"的常用组合。后续章节将深入缓存、离线、同步三大实战场景。`,
    code: `// ============================================
// ServiceWorker 生命周期与事件模拟
// 用 EventEmitter 模拟 install/activate/fetch
// ============================================

const { EventEmitter } = require('events');

// --- 浏览器真实代码（仅作注释参考）---
// navigator.serviceWorker.register('/sw.js', { scope: '/app/' });
// self.addEventListener('install', e => e.waitUntil(precache()));
// self.addEventListener('activate', e => e.waitUntil(cleanup()));
// self.addEventListener('fetch', e => e.respondWith(handle(e.request)));

// --- 模拟 ExtendableEvent：支持 waitUntil ---
class ExtendableEvent {
  constructor(type) {
    this.type = type;
    this._promises = [];
    this._waited = false;
  }
  waitUntil(promise) {
    this._promises.push(promise);
  }
  // 等待所有 waitUntil 的 promise 完成
  async done() {
    this._waited = true;
    await Promise.all(this._promises);
  }
}

// --- 模拟 FetchEvent ---
class FetchEvent extends ExtendableEvent {
  constructor(request) {
    super('fetch');
    this.request = request;          // 模拟 Request 对象
    this._response = null;
  }
  respondWith(promiseOrResponse) {
    this._response = Promise.resolve(promiseOrResponse);
  }
  async getResponse() {
    return await this._response;
  }
}

// --- 模拟 ServiceWorkerGlobalScope ---
class ServiceWorkerScope extends EventEmitter {
  constructor() {
    super();
    this.state = 'installing';       // installing -> installed -> activating -> activated
    this.caches = new Map();         // 模拟 CacheStorage
    this.clients = [];               // 受控页面
  }
  // 监听 install
  onInstall(handler) { this.on('install', handler); }
  onActivate(handler) { this.on('activate', handler); }
  onFetch(handler) { this.on('fetch', handler); }
  // 触发 install
  async emitInstall() {
    this.state = 'installing';
    console.log('  [SW] 触发 install 事件');
    const event = new ExtendableEvent('install');
    this.emit('install', event);
    await event.done();
    this.state = 'installed';
    console.log('  [SW] install 完成，状态：installed');
  }
  // 触发 activate
  async emitActivate() {
    this.state = 'activating';
    console.log('  [SW] 触发 activate 事件');
    const event = new ExtendableEvent('activate');
    this.emit('activate', event);
    await event.done();
    this.state = 'activated';
    console.log('  [SW] activate 完成，状态：activated ✅');
  }
  // 触发 fetch
  async emitFetch(request) {
    console.log('  [SW] 拦截请求：' + request.url);
    const event = new FetchEvent(request);
    this.emit('fetch', event);
    if (event._response) {
      return await event.getResponse();
    }
    return { status: 404, body: '未拦截，走默认网络' };
  }
}

// ============================================
// 演示 1：完整生命周期
// ============================================
console.log('═══════════════════════════════════════════');
console.log('  演示 1：ServiceWorker 生命周期');
console.log('═══════════════════════════════════════════');

const sw = new ServiceWorkerScope();

// 注册 sw.js 内部逻辑
sw.onInstall(async (event) => {
  console.log('    -> install：预缓存 app shell');
  // 模拟 caches.open + addAll
  const cache = new Map();
  cache.set('/index.html', '<html>app shell</html>');
  cache.set('/app.js', 'console.log("app")');
  sw.caches.set('v1', cache);
  event.waitUntil(new Promise(r => setTimeout(r, 30)));
});

sw.onActivate(async (event) => {
  console.log('    -> activate：清理旧缓存');
  // 模拟删除旧版本缓存
  for (const key of sw.caches.keys()) {
    if (key !== 'v1') {
      sw.caches.delete(key);
      console.log('    -> 删除旧缓存：' + key);
    }
  }
  event.waitUntil(new Promise(r => setTimeout(r, 20)));
});

// 立即触发注册流程
(async () => {
  await sw.emitInstall();
  await sw.emitActivate();
  console.log('  当前状态：' + sw.state);
  console.log('  缓存版本：' + [...sw.caches.keys()].join(', '));
  console.log('');

  // ============================================
  // 演示 2：拦截 fetch 请求
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('  演示 2：拦截网络请求（Cache First）');
  console.log('═══════════════════════════════════════════');

  // 注册 fetch 处理器：缓存优先
  sw.onFetch((event) => {
    const cache = sw.caches.get('v1');
    if (cache && cache.has(event.request.url)) {
      console.log('    -> 命中缓存：' + event.request.url);
      event.respondWith({ status: 200, body: cache.get(event.request.url), from: 'cache' });
    } else {
      console.log('    -> 缓存未命中，走网络：' + event.request.url);
      event.respondWith({ status: 200, body: 'network data', from: 'network' });
    }
  });

  const req1 = { url: '/index.html', method: 'GET' };
  const req2 = { url: '/api/data', method: 'GET' };

  const res1 = await sw.emitFetch(req1);
  console.log('  响应1：', res1);
  const res2 = await sw.emitFetch(req2);
  console.log('  响应2：', res2);
  console.log('');

  // ============================================
  // 演示 3：与页面通信（message 事件）
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('  演示 3：SW 与页面通信');
  console.log('═══════════════════════════════════════════');

  // 模拟 navigator.serviceWorker.addEventListener('message', ...)
  const pageClient = new EventEmitter();
  sw.clients.push(pageClient);

  // 页面向 SW 发消息
  sw.on('message', (event) => {
    console.log('  [SW 收到页面消息]：' + event.data);
    // SW 回复页面
    sw.clients[0].emit('message', { data: 'SW 已收到：' + event.data });
  });

  // 页面监听回复
  pageClient.on('message', (event) => {
    console.log('  [页面收到 SW 回复]：' + event.data);
  });

  // 页面发送消息
  sw.emit('message', { data: '你好，SW！' });
})();
`,
  },

  // ============================================================
  // 第 18 章 ServiceWorker 缓存管理
  // ============================================================
  {
    id: "worker-service-cache",
    group: "共享 Worker 与服务 Worker",
    icon: "🗄️",
    title: "ServiceWorker 缓存管理",
    content: `## ServiceWorker 缓存管理

### 一、Cache API 概述

ServiceWorker 提供了一套独立的 **Cache API**，用于存储 Request/Response 对象。它和 HTTP 缓存不同，完全由 JavaScript 代码控制。

> 参考《JavaScript高级程序设计》：Cache API 是一个持久的键值存储，键是 Request 对象，值是 Response 对象，可通过 \`caches\` 全局对象访问。

核心方法：

| 方法 | 说明 |
|------|------|
| \`caches.open(name)\` | 打开（或创建）一个命名缓存，返回 Promise<Cache> |
| \`caches.match(req)\` | 在所有缓存中查找匹配项 |
| \`caches.has(name)\` | 判断某缓存是否存在 |
| \`caches.delete(name)\` | 删除整个缓存 |
| \`caches.keys()\` | 获取所有缓存名 |
| \`cache.put(req, res)\` | 把请求/响应对存入缓存 |
| \`cache.match(req)\` | 在当前缓存中查找 |
| \`cache.add(req)\` | fetch + put 的便捷方法 |
| \`cache.addAll([...])\` | 批量预缓存 |

\`\`\`javascript
// 基本用法
const cache = await caches.open('v1');
await cache.put('/api/data', new Response('hello'));
const res = await cache.match('/api/data');
console.log(await res.text()); // 'hello'
\`\`\`

### 二、五大缓存策略

这是 ServiceWorker 最经典的内容。针对不同资源，应选用不同策略：

#### 1. Cache First（缓存优先）
先查缓存，命中则直接返回；未命中才走网络。**适合静态资源**（CSS/JS/图片）。

\`\`\`javascript
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  const cache = await caches.open('v1');
  cache.put(request, res.clone());
  return res;
}
\`\`\`

#### 2. Network First（网络优先）
先请求网络，失败再回退缓存。**适合实时性要求高的数据**（API、新闻）。

\`\`\`javascript
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    const cache = await caches.open('v1');
    cache.put(request, res.clone());
    return res;
  } catch (err) {
    return await caches.match(request);
  }
}
\`\`\`

#### 3. Cache Only（仅缓存）
只从缓存读，不发网络请求。**适合 App Shell 等不常变的资源**。

#### 4. Network Only（仅网络）
只走网络，不读缓存。**适合必须实时的数据**（如在线支付）。

#### 5. Stale While Revalidate（SWR）
立即返回缓存（即使过期），同时后台请求网络更新缓存。**兼顾速度与新鲜度**。

\`\`\`javascript
async function staleWhileRevalidate(request) {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(res => {
    cache.put(request, res.clone());
    return res;
  });
  return cached || fetchPromise;
}
\`\`\`

### 三、策略选择对照表

| 策略 | 速度 | 新鲜度 | 离线可用 | 适用场景 |
|------|------|--------|---------|---------|
| Cache First | 最快 | 差 | 是 | 静态资源、字体 |
| Network First | 慢 | 好 | 部分 | API、文章 |
| Cache Only | 最快 | 最差 | 是 | App Shell |
| Network Only | 最慢 | 最好 | 否 | 实时数据 |
| SWR | 快 | 较好 | 是 | 图片、列表 |

### 四、预缓存（Precaching）

在 \`install\` 阶段把核心资源一次性缓存好，称为**预缓存**：

\`\`\`javascript
const PRECACHE = 'precache-v2';
const ASSETS = ['/', '/index.html', '/app.js', '/style.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(PRECACHE).then(c => c.addAll(ASSETS))
  );
});
\`\`\`

### 五、运行时缓存（Runtime Caching）

在 \`fetch\` 事件中按策略缓存，称为**运行时缓存**。通常配合路由匹配：

\`\`\`javascript
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/static/')) {
    e.respondWith(cacheFirst(e.request));   // 静态资源
  } else if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request)); // 接口
  }
});
\`\`\`

### 六、缓存版本管理与清理

发布新版本时，要清理旧缓存，避免空间浪费：

\`\`\`javascript
const CURRENT = 'v2';
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CURRENT).map(k => caches.delete(k)))
    )
  );
});
\`\`\`

### 七、缓存过期策略

Cache API 本身不提供过期机制，需手动实现：

- **基于数量**：超过 N 条删除最旧的
- **基于时间**：在 Response 头里记录 \`date\`，超时删除
- **LRU**：最近最少使用淘汰

### 八、小结

Cache API 是 ServiceWorker 的"武器库"。掌握五大策略，配合预缓存与运行时缓存，就能覆盖绝大多数场景。核心心法：**静态资源用 Cache First，动态数据用 Network First 或 SWR，App Shell 用 Cache Only**。`,
    code: `// ============================================
// Cache API 模拟 + 五大缓存策略实现
// 用 Map 模拟 CacheStorage 与 Cache 对象
// ============================================

const { EventEmitter } = require('events');

// --- 浏览器真实代码（仅作注释参考）---
// const cache = await caches.open('v1');
// await cache.put(request, response.clone());
// const res = await cache.match(request);

// --- 模拟 Response 对象 ---
class FakeResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map(Object.entries(options.headers || {}));
    this.timestamp = Date.now();
  }
  async text() { return this.body; }
  clone() { return new FakeResponse(this.body, { status: this.status }); }
}

// --- 模拟单个 Cache ---
class Cache {
  constructor(name) {
    this.name = name;
    this.store = new Map(); // key: url, value: { request, response }
  }
  async put(request, response) {
    this.store.set(request.url || request, { request, response });
  }
  async match(request) {
    const key = request.url || request;
    return this.store.has(key) ? this.store.get(key).response : undefined;
  }
  async add(request) {
    const url = request.url || request;
    const res = new FakeResponse('fetched:' + url);
    await this.put({ url }, res);
  }
  async addAll(urls) {
    for (const u of urls) await this.add(u);
  }
  async delete(request) {
    return this.store.delete(request.url || request);
  }
  keys() { return [...this.store.values()].map(v => v.request); }
}

// --- 模拟 CacheStorage（caches 全局） ---
class CacheStorage {
  constructor() {
    this.caches = new Map();
  }
  async open(name) {
    if (!this.caches.has(name)) this.caches.set(name, new Cache(name));
    return this.caches.get(name);
  }
  async match(request) {
    for (const cache of this.caches.values()) {
      const res = await cache.match(request);
      if (res) return res;
    }
    return undefined;
  }
  async has(name) { return this.caches.has(name); }
  async delete(name) { return this.caches.delete(name); }
  async keys() { return [...this.caches.keys()]; }
}

// --- 模拟网络请求（带随机失败） ---
async function fakeFetch(request, { failRate = 0.0, latency = 10 } = {}) {
  const url = request.url || request;
  await new Promise(r => setTimeout(r, latency));
  if (Math.random() < failRate) throw new Error('网络错误：' + url);
  return new FakeResponse('network:' + url + '@' + Date.now());
}

const caches = new CacheStorage();

// ============================================
// 五大缓存策略实现
// ============================================

// 1. Cache First：缓存优先
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    console.log('    [Cache First] 命中缓存');
    return cached;
  }
  console.log('    [Cache First] 缓存未命中，走网络');
  const res = await fakeFetch(request);
  const cache = await caches.open('v1');
  await cache.put(request, res.clone());
  return res;
}

// 2. Network First：网络优先
async function networkFirst(request) {
  try {
    const res = await fakeFetch(request, { failRate: 1.0 }); // 模拟网络失败
    const cache = await caches.open('v1');
    await cache.put(request, res.clone());
    return res;
  } catch (err) {
    console.log('    [Network First] 网络失败，回退缓存');
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// 3. Cache Only：仅缓存
async function cacheOnly(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return new FakeResponse('无缓存', { status: 504 });
}

// 4. Network Only：仅网络
async function networkOnly(request) {
  return await fakeFetch(request);
}

// 5. Stale While Revalidate：返回旧值同时更新
async function staleWhileRevalidate(request) {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  // 后台更新（不阻塞返回）
  const fetchPromise = fakeFetch(request).then(res => {
    console.log('    [SWR] 后台更新缓存完成');
    cache.put(request, res.clone());
    return res;
  });
  if (cached) {
    console.log('    [SWR] 立即返回旧缓存');
    return cached;
  }
  console.log('    [SWR] 无缓存，等待网络');
  return await fetchPromise;
}

// ============================================
// 演示主流程
// ============================================
(async () => {
  console.log('═══════════════════════════════════════════');
  console.log('  演示 1：Cache First 策略');
  console.log('═══════════════════════════════════════════');
  const req1 = { url: '/style.css' };
  const r1a = await cacheFirst(req1);
  console.log('  第1次：' + (await r1a.text()));
  const r1b = await cacheFirst(req1);
  console.log('  第2次：' + (await r1b.text()));
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('  演示 2：Network First（网络失败回退缓存）');
  console.log('═══════════════════════════════════════════');
  // 先填充缓存
  const cache = await caches.open('v1');
  await cache.put({ url: '/api/news' }, new FakeResponse('cached:news'));
  const r2 = await networkFirst({ url: '/api/news' });
  console.log('  结果：' + (await r2.text()));
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('  演示 3：Stale While Revalidate');
  console.log('═══════════════════════════════════════════');
  const r3a = await staleWhileRevalidate({ url: '/img/logo.png' });
  console.log('  首次返回：' + (await r3a.text()));
  await new Promise(r => setTimeout(r, 30)); // 等后台更新
  const r3b = await staleWhileRevalidate({ url: '/img/logo.png' });
  console.log('  二次返回：' + (await r3b.text()));
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('  演示 4：缓存版本管理');
  console.log('═══════════════════════════════════════════');
  await caches.open('v1-old');
  await caches.open('v1-older');
  console.log('  清理前缓存：' + (await caches.keys()).join(', '));
  // 模拟 activate 阶段清理旧缓存
  const CURRENT = 'v1';
  const keys = await caches.keys();
  await Promise.all(
    keys.filter(k => k !== CURRENT).map(k => caches.delete(k))
  );
  console.log('  清理后缓存：' + (await caches.keys()).join(', '));
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('  演示 5：预缓存 App Shell');
  console.log('═══════════════════════════════════════════');
  const precache = await caches.open('precache-v1');
  await precache.addAll(['/', '/index.html', '/app.js', '/style.css']);
  console.log('  预缓存资源：');
  precache.keys().forEach(req => console.log('    - ' + (req.url || req)));
})();
`,
  },

  // ============================================================
  // 第 19 章 ServiceWorker 离线应用
  // ============================================================
  {
    id: "worker-service-offline",
    group: "共享 Worker 与服务 Worker",
    icon: "📴",
    title: "ServiceWorker 离线应用",
    content: `## ServiceWorker 离线应用

### 一、离线优先（Offline-First）理念

传统 Web 应用是"在线优先"：默认假设有网络，断网就报错。**离线优先**则反过来：默认从缓存读，有网时再更新。这让 Web 应用像原生 App 一样，断网也能用。

> 参考《JavaScript高级程序设计》：Service Worker 的离线能力，让 Web 应用第一次具备了与原生应用媲美的"始终可用"体验。

### 二、App Shell 架构

**App Shell（应用外壳）** 是离线应用的核心模式：

\`\`\`
┌─────────────────────────────┐
│   App Shell（外壳/骨架）     │  ← 预缓存：HTML/CSS/JS 框架
│  ┌───────────────────────┐  │
│  │   内容区（动态数据）    │  │  ← 运行时缓存：API 数据
│  └───────────────────────┘  │
└─────────────────────────────┘
\`\`\`

- **Shell**：页面骨架（导航栏、布局），install 时预缓存，永远从缓存读
- **内容**：文章、列表等动态数据，运行时按策略缓存

### 三、预缓存 App Shell

\`\`\`javascript
const SHELL = 'shell-v1';
const ASSETS = ['/', '/index.html', '/app.css', '/app.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // 跳过等待
});
\`\`\`

### 四、处理 fetch 请求（离线兜底）

针对不同请求类型，给出不同离线策略：

\`\`\`javascript
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 1. 导航请求：返回缓存的 index.html（App Shell）
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('/index.html'));
    return;
  }
  // 2. 静态资源：Cache First
  if (url.pathname.startsWith('/static/')) {
    e.respondWith(cacheFirst(e.request));
    return;
  }
  // 3. API：Network First，失败回退缓存
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request));
  }
});
\`\`\`

### 五、离线兜底页面

如果连 App Shell 都没缓存（首次访问就断网），返回一个友好的离线页：

\`\`\`javascript
const offlineResp = new Response(
  '<h1>您当前离线</h1><p>请连接网络后重试</p>',
  { headers: { 'Content-Type': 'text/html' } }
);
\`\`\`

### 六、在线/离线检测

主页面可通过两种方式检测网络状态：

\`\`\`javascript
// 1. navigator.onLine（瞬时状态）
console.log(navigator.onLine ? '在线' : '离线');

// 2. online/offline 事件（状态变化）
window.addEventListener('online', () => syncData());
window.addEventListener('offline', () => showOfflineBanner());
\`\`\`

注意：\`navigator.onLine\` 只反映"是否连到网络"，不能保证"能访问互联网"。

### 七、IndexedDB 存储离线数据

缓存适合存 Request/Response，**结构化数据**用 IndexedDB 更合适：

\`\`\`javascript
// 存：把接口数据写入 IndexedDB
const db = await openDB('app', 1);
await db.put('articles', { id: 1, title: '...', content: '...' });

// 取：离线时从 IndexedDB 读
const article = await db.get('articles', 1);
\`\`\`

### 八、后台同步（Background Sync）

用户离线时操作（如发评论），可注册一个 sync 任务，等网络恢复后 SW 自动重试：

\`\`\`javascript
// 主页面
navigator.serviceWorker.ready.then(reg => {
  return reg.sync.register('send-comment');
});

// sw.js
self.addEventListener('sync', (e) => {
  if (e.tag === 'send-comment') {
    e.waitUntil(sendPendingComments());
  }
});
\`\`\`

### 九、冲突解决策略

离线编辑后同步，可能产生冲突。常见方案：

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| Last-Write-Wins | 后写覆盖先写 | 简单、冲突少 |
| 三路合并 | 基于公共祖先合并 | 文档协作 |
| 自定义合并 | 业务逻辑决定 | 复杂业务 |
| CRDT | 自动无冲突合并 | 实时协作 |

### 十、用户体验设计

离线应用的用户体验至关重要，否则用户会以为"应用坏了"：

- **离线状态指示**：顶部显示"您已离线"横幅，颜色醒目
- **同步指示器**：显示"正在同步…"、"已同步 ✅"，让用户知道数据安全
- **乐观更新**：用户操作立即反馈（如评论立刻显示），后台同步成功后确认，失败再回滚
- **冲突提示**：检测到冲突时弹窗让用户选择保留哪一版
- **空状态处理**：首次离线打开无缓存数据时，显示引导而非白屏
- **加载骨架屏**：用骨架屏代替 loading 圈，提升感知速度

### 十一、小结

离线应用 = App Shell（预缓存骨架）+ 运行时缓存（动态数据）+ 后台同步（离线操作）+ IndexedDB（结构化存储）。理解这条链路，就能构建出"像原生 App 一样"的 Web 应用。`,
    code: `// ============================================
// 离线应用模拟：App Shell + fetch + 后台同步
// 用 EventEmitter + Map 模拟离线场景
// ============================================

const { EventEmitter } = require('events');

// --- 浏览器真实代码（仅作注释参考）---
// self.addEventListener('install', e => e.waitUntil(precacheShell()));
// self.addEventListener('fetch', e => e.respondWith(handleFetch(e)));
// self.addEventListener('sync', e => e.waitUntil(syncPending()));

// --- 模拟 CacheStorage ---
class SimpleCache {
  constructor() { this.store = new Map(); }
  async addAll(urls) { urls.forEach(u => this.store.set(u, 'cached:' + u)); }
  async match(url) { return this.store.get(url); }
  async put(url, val) { this.store.set(url, val); }
  has(url) { return this.store.has(url); }
}

// --- 模拟 IndexedDB（极简版） ---
class IndexedDBSim {
  constructor() { this.stores = new Map(); }
  open(name) {
    if (!this.stores.has(name)) this.stores.set(name, new Map());
    return this.stores.get(name);
  }
  put(store, key, value) { this.open(store).set(key, value); }
  get(store, key) { return this.open(store).get(key); }
  getAll(store) { return [...this.open(store).values()]; }
}

// --- 模拟 ServiceWorker ---
class OfflineSW extends EventEmitter {
  constructor() {
    super();
    this.shellCache = new SimpleCache();
    this.runtimeCache = new SimpleCache();
    this.idb = new IndexedDBSim();
    this.isOnline = true;       // 网络状态
    this.pendingQueue = [];     // 离线待同步队列
  }
  setOnline(online) {
    this.isOnline = online;
    console.log('  [网络] 状态切换为：' + (online ? '在线 ✅' : '离线 ❌'));
    if (online) this.emit('online');
  }
}

const sw = new OfflineSW();

// ============================================
// 演示 1：预缓存 App Shell
// ============================================
console.log('═══════════════════════════════════════════');
console.log('  演示 1：预缓存 App Shell');
console.log('═══════════════════════════════════════════');

const APP_SHELL = ['/', '/index.html', '/app.css', '/app.js', '/logo.png'];

async function precacheShell() {
  console.log('  [install] 预缓存 App Shell...');
  await sw.shellCache.addAll(APP_SHELL);
  console.log('  [install] 预缓存完成，资源数：' + APP_SHELL.length);
  APP_SHELL.forEach(u => console.log('    - ' + u));
}

// ============================================
// 演示 2：fetch 拦截与离线兜底
// ============================================
console.log('');
console.log('═══════════════════════════════════════════');
console.log('  演示 2：离线 fetch 处理');
console.log('═══════════════════════════════════════════');

async function handleFetch(request) {
  const { url, mode } = request;
  console.log('  [fetch] 拦截：' + url + ' (mode=' + mode + ')');

  // 1. 导航请求：返回 App Shell
  if (mode === 'navigate') {
    const shell = await sw.shellCache.match('/index.html');
    if (shell) {
      console.log('    -> 返回 App Shell（离线可用）');
      return shell;
    }
    return '<h1>离线</h1><p>请连接网络</p>';
  }
  // 2. 静态资源：Cache First
  if (url.startsWith('/static/') || url.startsWith('/app.')) {
    const cached = await sw.shellCache.match(url) || await sw.runtimeCache.match(url);
    if (cached) {
      console.log('    -> 命中缓存');
      return cached;
    }
    if (sw.isOnline) {
      console.log('    -> 网络获取并缓存');
      const data = 'network:' + url;
      await sw.runtimeCache.put(url, data);
      return data;
    }
    console.log('    -> 离线且无缓存，返回 404');
    return null;
  }
  // 3. API：Network First，离线回退 IndexedDB
  if (url.startsWith('/api/')) {
    if (sw.isOnline) {
      console.log('    -> 在线，走网络');
      const data = 'network:' + url + '@' + Date.now();
      // 写入 IndexedDB 作为离线备份
      sw.idb.put('api-cache', url, data);
      return data;
    }
    console.log('    -> 离线，从 IndexedDB 读取');
    const cached = sw.idb.get('api-cache', url);
    return cached || '无数据';
  }
  return '未处理';
}

// ============================================
// 演示 3：后台同步
// ============================================
console.log('');
console.log('═══════════════════════════════════════════');
console.log('  演示 3：后台同步（离线操作队列）');
console.log('═══════════════════════════════════════════');

// 主页面：用户离线时发评论
function userSendComment(text) {
  const comment = { id: Date.now(), text, status: 'pending' };
  if (sw.isOnline) {
    console.log('  [页面] 在线，直接发送评论：' + text);
    comment.status = 'synced';
    sw.idb.put('comments', comment.id, comment);
  } else {
    console.log('  [页面] 离线，加入待同步队列：' + text);
    sw.pendingQueue.push(comment);
    sw.idb.put('comments', comment.id, comment);
  }
}

// SW：网络恢复后处理 sync 事件
sw.on('online', async () => {
  console.log('  [SW] 触发 sync 事件，处理 ' + sw.pendingQueue.length + ' 条待同步');
  for (const comment of sw.pendingQueue) {
    console.log('    -> 同步评论 #' + comment.id + '：' + comment.text);
    comment.status = 'synced';
    sw.idb.put('comments', comment.id, comment);
  }
  sw.pendingQueue = [];
  console.log('  [SW] 同步完成 ✅');
});

// ============================================
// 运行完整流程
// ============================================
(async () => {
  await precacheShell();

  console.log('');
  console.log('--- 场景 A：在线访问 ---');
  sw.setOnline(true);
  console.log('  结果1：' + await handleFetch({ url: '/index.html', mode: 'navigate' }));
  console.log('  结果2：' + await handleFetch({ url: '/api/articles', mode: 'cors' }));
  userSendComment('这篇文章真棒！');

  console.log('');
  console.log('--- 场景 B：切换到离线 ---');
  sw.setOnline(false);
  console.log('  结果3：' + await handleFetch({ url: '/index.html', mode: 'navigate' }));
  console.log('  结果4：' + await handleFetch({ url: '/api/articles', mode: 'cors' }));
  userSendComment('离线也能发评论');
  userSendComment('再来一条');

  console.log('');
  console.log('--- 场景 C：恢复在线，触发后台同步 ---');
  sw.setOnline(true);

  console.log('');
  console.log('--- 最终状态 ---');
  const comments = sw.idb.getAll('comments');
  console.log('  IndexedDB 中的评论数：' + comments.length);
  comments.forEach(c => console.log('    #' + c.id + ' [' + c.status + '] ' + c.text));
})();
`,
  },

  // ============================================================
  // 第 20 章 ServiceWorker 后台同步
  // ============================================================
  {
    id: "worker-service-sync",
    group: "共享 Worker 与服务 Worker",
    icon: "🔄",
    title: "ServiceWorker 后台同步",
    content: `## ServiceWorker 后台同步

### 一、后台同步（Background Sync）

**Background Sync API** 让 Web 应用在离线时也能"完成"操作：用户提交的动作会被暂存，等网络恢复后由 ServiceWorker 自动重试，**即使用户已经关闭了页面**。

> 参考《JavaScript高级程序设计》：Background Sync 让 ServiceWorker 在网络恢复时被唤醒执行任务，是实现"离线可用"的关键能力。

基本流程：

\`\`\`
用户操作 → 离线 → 暂存到 IndexedDB → 注册 sync →
网络恢复 → SW 唤醒 → 执行 sync 事件 → 上报服务器
\`\`\`

### 二、注册 sync 事件

\`\`\`javascript
// 主页面：用户点击"发送"
async function onSubmit() {
  await saveToIndexedDB(draft);     // 先存本地
  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register('send-draft'); // 注册同步
}

// sw.js：处理 sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-draft') {
    event.waitUntil(sendDraftsToServer());
  }
});
\`\`\`

\`event.tag\` 是同步任务的唯一标识，重复注册同名 tag 会合并。

### 三、Periodic Sync（周期同步，实验性）

\`Periodic Background Sync\` 允许定期执行任务（如每小时刷新新闻），目前仍处实验阶段：

\`\`\`javascript
const reg = await navigator.serviceWorker.ready;
const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
if (status.state === 'granted') {
  await reg.periodicSync.register('refresh-news', {
    minInterval: 24 * 60 * 60 * 1000 // 最少 24 小时
  });
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-news') {
    event.waitUntil(refreshNews());
  }
});
\`\`\`

### 四、Push API：服务器主动推送

**Push API** 让服务器能"主动"唤醒 ServiceWorker 推送消息，即使用户没打开页面。这是 PWA 实现推送通知的核心。

工作流程：

\`\`\`
1. 页面请求通知权限
2. 订阅推送服务（Push Subscription）
3. 把订阅端点发给服务器保存
4. 服务器调用推送服务 API
5. 推送服务唤醒 SW，触发 push 事件
6. SW 显示 Notification
\`\`\`

### 五、订阅推送服务

\`\`\`javascript
// 主页面
const reg = await navigator.serviceWorker.ready;
const subscription = await reg.pushManager.subscribe({
  userVisibleOnly: true,                 // 必须显示通知
  applicationServerKey: VAPID_PUBLIC_KEY // VAPID 公钥
});
await fetch('/api/subscribe', {
  method: 'POST',
  body: JSON.stringify(subscription)
});
\`\`\`

### 六、处理 push 事件

\`\`\`javascript
// sw.js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '新消息';
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: data.tag    // 相同 tag 会替换旧通知
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
\`\`\`

### 七、Notification API：显示通知

\`\`\`javascript
// 请求权限
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  new Notification('标题', { body: '内容', icon: '/icon.png' });
}
\`\`\`

### 八、处理通知点击

用户点击通知后，通常会跳转到对应页面：

\`\`\`javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // 关闭通知
  event.waitUntil(
    clients.openWindow('https://example.com/chat')
  );
});
\`\`\`

### 九、Push + Notification 完整流程

| 步骤 | 执行方 | 动作 |
|------|--------|------|
| 1 | 客户端 | 请求通知权限 |
| 2 | 客户端 | 订阅 Push 服务 |
| 3 | 客户端 | 上报订阅给服务器 |
| 4 | 服务器 | 调用 Push 服务 API |
| 5 | Push 服务 | 唤醒 SW，触发 push |
| 6 | SW | showNotification |
| 7 | 用户 | 点击通知 |
| 8 | SW | notificationclick 跳转 |

### 十、安全：VAPID 密钥

Push API 使用 **VAPID（Voluntary Application Server Identification）** 协议做身份认证：

- **公钥**：浏览器订阅时使用，可公开
- **私钥**：服务器签名推送请求，必须保密
- 推送服务用公钥验证签名，确保请求来自合法服务器

消息内容可端到端加密，推送服务也无法看到明文。

### 十一、浏览器支持与局限

| API | Chrome | Firefox | Safari |
|-----|--------|---------|--------|
| Background Sync | ✅ | ✅ | ❌（iOS 不支持） |
| Periodic Sync | ✅ 实验性 | ❌ | ❌ |
| Push API | ✅ | ✅ | ✅ 16.4+ |
| Notification | ✅ | ✅ | ✅（macOS）|

### 十二、小结

后台同步与推送通知，让 Web 应用具备了"后台运行"和"主动触达"能力，大幅缩小了与原生 App 的差距。核心三件套：**Background Sync**（离线重试）、**Push API**（服务器推送）、**Notification API**（显示通知）。三者组合，就能构建出实时、可靠的现代 Web 应用。`,
    code: `// ============================================
// 后台同步 + Push 通知模拟
// 用 EventEmitter 模拟 sync / push / notificationclick
// ============================================

const { EventEmitter } = require('events');
const crypto = require('crypto');

// --- 浏览器真实代码（仅作注释参考）---
// reg.sync.register('send-comment');
// self.addEventListener('sync', e => e.waitUntil(syncTask()));
// self.addEventListener('push', e => e.waitUntil(showNotification(...)));
// self.addEventListener('notificationclick', e => clients.openWindow(url));

// --- 模拟 VAPID 密钥对 ---
function generateVAPIDKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1'
  });
  return {
    publicKey: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'),
    privateKey: privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64')
  };
}

// --- 模拟 Push 订阅 ---
class PushSubscription {
  constructor(endpoint, keys) {
    this.endpoint = endpoint;
    this.keys = keys;
  }
  toJSON() {
    return { endpoint: this.endpoint, keys: this.keys };
  }
}

// --- 模拟 PushManager ---
class PushManagerSim {
  constructor() {
    this.subscriptions = [];
    this.vapidKeys = generateVAPIDKeys();
  }
  async subscribe(options) {
    if (options.userVisibleOnly !== true) {
      throw new Error('必须 userVisibleOnly: true');
    }
    const sub = new PushSubscription(
      'https://push.example.com/s/' + crypto.randomBytes(8).toString('hex'),
      { p256dh: crypto.randomBytes(32).toString('base64'), auth: crypto.randomBytes(16).toString('base64') }
    );
    this.subscriptions.push(sub);
    return sub;
  }
}

// --- 模拟 Notification ---
class NotificationSim {
  constructor(title, options) {
    this.title = title;
    this.body = options.body || '';
    this.tag = options.tag || '';
    this.icon = options.icon || '';
    console.log('    🔔 [通知显示] ' + this.title + ' — ' + this.body);
  }
  close() { console.log('    [通知关闭] ' + this.title); }
}
NotificationSim.permission = 'default';
NotificationSim.requestPermission = async () => {
  NotificationSim.permission = 'granted';
  return 'granted';
};

// --- 模拟 ServiceWorkerRegistration ---
class RegistrationSim {
  constructor() {
    this.pushManager = new PushManagerSim();
    this._syncTags = new Set();
  }
  async sync(tag) {
    this._syncTags.add(tag);
    console.log('  [注册 sync] tag="' + tag + '" 已加入待执行队列');
  }
  async showNotification(title, options) {
    new NotificationSim(title, options);
  }
}

// --- 模拟 ServiceWorkerGlobalScope ---
class ServiceWorkerScope extends EventEmitter {
  constructor() {
    super();
    this.registration = new RegistrationSim();
    this.isOnline = false;
    this.pendingTasks = []; // 待同步任务
  }
  onSync(handler) { this.on('sync', handler); }
  onPush(handler) { this.on('push', handler); }
  onNotificationClick(handler) { this.on('notificationclick', handler); }
  setOnline(online) {
    this.isOnline = online;
    if (online) this.emit('online');
  }
  // 模拟服务器发送推送（事件对象带 waitUntil，模拟 ExtendableEvent）
  async sendPush(payload) {
    console.log('  [Push 服务] 收到服务器推送：' + JSON.stringify(payload));
    const event = {
      data: { json: () => payload },
      _promises: [],
      waitUntil(p) { this._promises.push(p); }
    };
    this.emit('push', event);
  }
}

const sw = new ServiceWorkerScope();

// ============================================
// 演示 1：后台同步（离线发评论）
// ============================================
console.log('═══════════════════════════════════════════');
console.log('  演示 1：后台同步——离线操作队列');
console.log('═══════════════════════════════════════════');

// 主页面：用户离线发评论
async function userAction(text) {
  if (sw.isOnline) {
    console.log('  [页面] 在线，直接发送：' + text);
    console.log('    -> 服务器已收到 ✅');
  } else {
    console.log('  [页面] 离线，暂存任务：' + text);
    sw.pendingTasks.push({ tag: 'sync-comments', data: text });
    await sw.registration.sync('sync-comments');
  }
}

// SW：处理 sync 事件
sw.onSync(async (event) => {
  console.log('  [SW] sync 事件触发，tag=' + event.tag);
  const tasks = sw.pendingTasks.filter(t => t.tag === event.tag);
  for (const t of tasks) {
    console.log('    -> 上报到服务器：' + t.data);
  }
  sw.pendingTasks = sw.pendingTasks.filter(t => t.tag !== event.tag);
  event.waitUntil(Promise.resolve());
});

// ExtendableEvent 简化
class SyncEvent {
  constructor(tag) { this.tag = tag; this._p = null; }
  waitUntil(p) { this._p = p; }
}

// 离线场景
sw.setOnline(false);
userAction('评论1：好文！');
userAction('评论2：学到了');
console.log('  待同步任务数：' + sw.pendingTasks.length);
console.log('');

// 恢复在线，触发 sync
console.log('  --- 网络恢复 ---');
sw.setOnline(true);
setTimeout(async () => {
  const ev = new SyncEvent('sync-comments');
  await sw.emit('sync', ev);

  console.log('');
  // ============================================
  // 演示 2：Push + Notification 完整流程
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('  演示 2：Push 推送 + Notification 通知');
  console.log('═══════════════════════════════════════════');

  // 步骤 1：请求权限
  console.log('  步骤1：请求通知权限');
  const perm = await NotificationSim.requestPermission();
  console.log('    -> 权限：' + perm);

  // 步骤 2：订阅 Push
  console.log('  步骤2：订阅 Push 服务');
  const sub = await sw.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: sw.registration.pushManager.vapidKeys.publicKey
  });
  console.log('    -> 订阅端点：' + sub.endpoint.slice(0, 40) + '...');
  console.log('    -> VAPID 公钥：' + sw.registration.pushManager.vapidKeys.publicKey.slice(0, 20) + '...');

  // 步骤 3：处理 push 事件
  sw.onPush((event) => {
    const data = event.data.json();
    event.waitUntil(
      sw.registration.showNotification(data.title, {
        body: data.body,
        tag: data.tag,
        icon: '/icon.png'
      })
    );
  });

  // 步骤 4：处理通知点击
  sw.onNotificationClick((event) => {
    console.log('    [SW] notificationclick，跳转到：' + event.url);
    event.notification.close();
  });

  // 步骤 5：服务器推送
  console.log('  步骤3：服务器发送推送');
  await sw.sendPush({ title: '新消息', body: '您有 3 条未读消息', tag: 'msg-1' });

  console.log('');
  console.log('  步骤4：模拟用户点击通知');
  sw.emit('notificationclick', { url: '/messages', notification: { close: () => {} } });

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  全部演示完成 ✅');
  console.log('  要点：Background Sync 处理离线操作，');
  console.log('        Push API 接收服务器推送，');
  console.log('        Notification API 显示桌面通知。');
  console.log('═══════════════════════════════════════════');
}, 50);
`,
  },
];
