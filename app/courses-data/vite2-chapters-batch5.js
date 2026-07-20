// =============================================================
// Vite 大全集（终极版）—— 第5批章节
// 第六部分 服务器配置 + 第七部分 构建优化（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch27 : 第二十七章 端口/主机/自动打开
//   vite2-ch28 : 第二十八章 proxy 代理配置
//   vite2-ch29 : 第二十九章 CORS 配置
//   vite2-ch30 : 第三十章 HTTPS 配置
//   vite2-ch31 : 第三十一章 自定义中间件
//   vite2-ch32 : 第三十二章 分包策略 manualChunks
//   vite2-ch33 : 第三十三章 代码压缩与 minify
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十七章：端口/主机/自动打开
  // =========================================================
  {
    id: "vite2-ch27",
    group: "第六部分 服务器配置",
    icon: "🔌",
    title: "第二十七章 端口/主机/自动打开",
    content: `## 第二十七章　端口/主机/自动打开

开发服务器启动后，默认监听 \`localhost:5173\`。但在团队协作、移动端调试、端口冲突等场景下，需要自定义这些参数。本章讲解 \`server\` 配置里和"网络入口"相关的几个字段。

### 核心配置一览

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,        // 端口号
    host: '0.0.0.0',   // 监听所有网卡（暴露到局域网）
    open: true,        // 启动后自动打开浏览器
    strictPort: true   // 端口被占用时报错（而非换端口）
  }
})
\`\`\`

---

## 1. server.port：指定端口

默认端口是 5173（Vite 1 是 3000，后来为了避免冲突改了）。改端口只需：

\`\`\`js
server: {
  port: 8080
}
\`\`\`

启动后访问 \`http://localhost:8080/\`。

**strictPort：端口被占用了怎么办？**

- \`strictPort: false\`（默认）：端口被占用时，Vite 自动找下一个可用端口（8080 → 8081 → 8082…）
- \`strictPort: true\`：端口被占用直接报错退出

\`\`\`js
server: {
  port: 3000,
  strictPort: true  // 必须 3000，占用就报错
}
\`\`\`

**什么时候用 strictPort**：当你有硬编码的端口配置（比如 OAuth 回调、CORS 白名单）时，端口不能变，必须开启。

---

## 2. server.host：暴露到局域网

默认 \`host: 'localhost'\`，只有本机能访问。改成 \`'0.0.0.0'\` 或 \`true\`，局域网内其他设备（手机、同事电脑）都能访问：

\`\`\`js
server: {
  host: true   // 等价于 '0.0.0.0'
}
\`\`\`

启动后终端会显示：

\`\`\`
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/   ← 手机连同一 WiFi 即可访问
\`\`\`

**典型用途**：
- 手机扫码访问开发中的页面，调试移动端样式
- 同事想看你的本地开发进度
- 在虚拟机/容器里跑 Vite，宿主机需要访问

> **注意**：暴露到局域网后，同一 WiFi 下的人都能访问你的开发服务器。公共 WiFi 下慎用。

---

## 3. server.open：自动打开浏览器

\`\`\`js
server: {
  open: true   // 启动后自动打开默认浏览器
}
\`\`\`

也可以指定打开的路径：

\`\`\`js
server: {
  open: '/docs/index.html'   // 打开指定页面
}
\`\`\`

还可以指定用哪个浏览器（需要本机装了该浏览器）：

\`\`\`js
server: {
  open: '/login',
  // 指定浏览器（仅当 server.open 是 string 时，可写路径，否则用默认浏览器）
}
\`\`\`

> 实际开发中，多数人不开启 \`open\`，因为重启服务器频繁会弹一堆浏览器标签。

---

## 4. 命令行参数：--port / --host / --open

不想改配置文件时，命令行临时指定更方便：

\`\`\`bash
# 临时换端口
vite --port 4000

# 暴露到局域网
vite --host

# 自动打开浏览器
vite --open

# 组合
vite --port 4000 --host --open

# preview 命令也支持
vite preview --port 5000 --host
\`\`\`

**命令行参数优先级高于配置文件**，所以临时调试时直接加参数即可。

| 配置项 | 配置文件写法 | 命令行参数 |
|--------|--------------|-----------|
| 端口 | \`server.port: 3000\` | \`--port 3000\` |
| 主机 | \`server.host: true\` | \`--host\` |
| 自动打开 | \`server.open: true\` | \`--open\` |
| 严格端口 | \`server.strictPort: true\` | \`--strictPort\` |

---

## 5. 完整示例

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: true,          // 暴露到局域网
    open: false,         // 不自动打开（手动控制）
    strictPort: false    // 占用则换端口
  }
})
\`\`\`

---

## 下一章

端口和主机配置好了，下一章学习 **proxy 代理**——解决开发环境跨域、转发后端接口的核心配置。`,
    code: `// 演示：端口/主机/自动打开的配置解析
// ---------------------------------------------------
// 模拟 vite.config.js 中 server 配置的解析过程

const defineConfig = (config) => config;

const config = defineConfig({
  server: {
    port: 3000,
    host: true,            // 0.0.0.0
    open: false,
    strictPort: false
  }
});

console.log("🔌 服务器配置解析");
console.log("=====================================");

const { port, host, open, strictPort } = config.server;

console.log("端口 (port):", port);
console.log("  → 监听 http://localhost:" + port + "/");

console.log("\\n主机 (host):", host);
if (host === true || host === '0.0.0.0') {
  console.log("  → 暴露到局域网，手机可访问");
} else {
  console.log("  → 仅本机访问");
}

console.log("\\n自动打开 (open):", open);
console.log(open ? "  → 启动后自动打开浏览器" : "  → 需手动打开浏览器");

console.log("\\n严格端口 (strictPort):", strictPort);
if (strictPort) {
  console.log("  → 端口被占用时报错退出");
} else {
  console.log("  → 端口被占用则自动 +1（" + port + " → " + (port+1) + " → ...）");
}

// 模拟端口冲突的处理逻辑
console.log("\\n📋 端口冲突模拟：");
const tryPorts = [3000, 3001, 3002];
const occupiedPorts = new Set([3000, 3001]); // 假设这两个被占用
for (const p of tryPorts) {
  if (occupiedPorts.has(p)) {
    console.log("  端口 " + p + " 已占用，" + (strictPort ? "报错退出" : "尝试下一个"));
    if (strictPort) break;
  } else {
    console.log("  ✅ 端口 " + p + " 可用，启动服务器");
    break;
  }
}

console.log("\\n💡 命令行参数 --port/--host/--open 优先级高于配置文件");`,
  },

  // =========================================================
  // 第二十八章：proxy 代理配置
  // =========================================================
  {
    id: "vite2-ch28",
    group: "第六部分 服务器配置",
    icon: "🔀",
    title: "第二十八章 proxy 代理配置",
    content: `## 第二十八章　proxy 代理配置

前端开发最常遇到的跨域问题：本地是 \`localhost:5173\`，后端是 \`localhost:8080\`，浏览器因为同源策略拦截请求。Vite 内置的 \`server.proxy\` 用 dev server 转发请求，**让浏览器以为是同源**，是最常用的解决方案。

### 基本用法

\`\`\`js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
\`\`\`

效果：浏览器请求 \`http://localhost:5173/api/users\`，Vite 把它转发到 \`http://localhost:8080/api/users\`。浏览器只看到同源请求，**没有跨域**。

---

## 1. 核心字段

| 字段 | 作用 | 示例 |
|------|------|------|
| \`target\` | 代理目标地址 | \`'http://localhost:8080'\` |
| \`changeOrigin\` | 是否修改 Host 头 | \`true\`（推荐）|
| \`rewrite\` | 重写请求路径 | \`(path) => path.replace('/api', '')\` |
| \`ws\` | 代理 WebSocket | \`true\` |
| \`secure\` | 是否校验 SSL 证书 | \`false\`（自签名时）|
| \`bypass\` | 跳过代理的判断函数 | 见后文 |

### changeOrigin：要不要改 Host 头

\`\`\`js
proxy: {
  '/api': {
    target: 'http://api.example.com',
    changeOrigin: true   // 把 Host 头改成 api.example.com
  }
}
\`\`\`

- \`false\`（默认）：Host 头保持 \`localhost:5173\`，部分后端会拒绝
- \`true\`：Host 头改成 \`api.example.com\`，对后端透明

**经验**：跨域转发到外部域名时，几乎都要开 \`changeOrigin: true\`。

---

## 2. rewrite：路径重写

后端接口路径不带 \`/api\` 前缀时，需要 rewrite 去掉：

\`\`\`js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\\/api/, '')
  }
}
\`\`\`

请求映射：

| 浏览器请求 | 转发到后端 |
|------------|-----------|
| \`/api/users\` | \`http://localhost:8080/users\` |
| \`/api/orders/list\` | \`http://localhost:8080/orders/list\` |

### 正则替换进阶

\`\`\`js
rewrite: (path) => path.replace(/^\\/api\\/v1/, '/v2')
// /api/v1/users → /v2/users
\`\`\`

---

## 3. 多个代理

\`\`\`js
proxy: {
  '/api': {
    target: 'http://localhost:8080',   // 后端 API
    changeOrigin: true
  },
  '/upload': {
    target: 'http://localhost:9000',   // 文件服务
    changeOrigin: true
  },
  '/ws': {
    target: 'ws://localhost:3001',     // WebSocket
    ws: true
  }
}
\`\`\`

---

## 4. WebSocket 代理

实时通信（聊天、推送）常用 WebSocket，Vite 也能代理：

\`\`\`js
proxy: {
  '/socket': {
    target: 'ws://localhost:3001',
    ws: true,              // 启用 WebSocket 代理
    changeOrigin: true
  }
}
\`\`\`

前端代码：

\`\`\`js
const socket = new WebSocket('ws://localhost:5173/socket')
// 实际连接的是 ws://localhost:3001/socket
\`\`\`

---

## 5. 代理 + Cookie

涉及登录态、CSRF Token 时，需要正确处理 Cookie：

\`\`\`js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    cookieDomainRewrite: 'localhost'   // 把后端 Set-Cookie 的 domain 改写
  }
}
\`\`\`

**常见问题**：后端返回的 \`Set-Cookie\` 带了 \`Domain=backend.com\`，浏览器不认（因为页面在 localhost）。用 \`cookieDomainRewrite\` 把 Domain 改成 \`localhost\` 或去掉。

---

## 6. bypass：动态跳过代理

某些请求需要按条件决定是否代理：

\`\`\`js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    bypass(req, res, options) {
      // 静态资源不代理
      if (req.headers.accept?.includes('text/html')) {
        return '/index.html'   // 返回字符串：用这个路径替代
      }
      // 返回 false：不代理，正常走 Vite 处理
      // 返回 undefined：正常代理
    }
  }
}
\`\`\`

---

## 7. 常见问题

### Q1：代理配置了还是跨域？

检查：
1. 请求路径是否以代理 key 开头（\`/api\` 必须匹配 \`/api/xxx\`）
2. \`changeOrigin\` 是否开启
3. 后端是否在 CORS 中再次拦截（代理后无跨域，后端不需要配 CORS）

### Q2：production 怎么办？

代理只在 dev server 生效。生产环境通常用 Nginx 反向代理：

\`\`\`nginx
location /api {
  proxy_pass http://backend:8080;
}
\`\`\`

### Q3：怎么调试代理？

启动时加 \`DEBUG=vite:proxy\` 看详细日志：

\`\`\`bash
DEBUG=vite:proxy npm run dev
\`\`\`

---

## 下一章

代理解决了"前端调后端"的跨域。下一章学习 **CORS**——理解跨域的根因，以及怎么配 Vite 的 \`server.cors\`。`,
    code: `// 演示：proxy 配置解析与请求映射模拟
// ---------------------------------------------------

const defineConfig = (config) => config;

const config = defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, '')
      },
      '/upload': {
        target: 'http://localhost:9000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  }
});

console.log("🔀 proxy 代理配置解析");
console.log("=====================================");

// 模拟请求转发
function forwardProxy(requestPath) {
  for (const [prefix, options] of Object.entries(config.server.proxy)) {
    if (requestPath.startsWith(prefix)) {
      let finalPath = requestPath;
      if (options.rewrite) {
        finalPath = options.rewrite(requestPath);
      }
      const protocol = options.target.startsWith('ws') ? 'ws' : 'http';
      const finalUrl = options.target + finalPath;
      console.log(\`请求 \${requestPath}\`);
      console.log(\`  → 转发到 \${finalUrl}\`);
      console.log(\`  → changeOrigin: \${options.changeOrigin ? '是' : '否'}\`);
      if (options.ws) console.log("  → 启用 WebSocket 代理");
      return;
    }
  }
  console.log(\`请求 \${requestPath} → 不匹配任何代理规则\`);
}

console.log("\\n📋 请求转发模拟：");
console.log("-------------------------------------");
forwardProxy('/api/users');
console.log();
forwardProxy('/api/orders/list');
console.log();
forwardProxy('/upload/avatar.png');
console.log();
forwardProxy('/ws/chat');
console.log();
forwardProxy('/src/main.js');   // 不匹配，走 Vite 默认处理

console.log("\\n💡 代理让浏览器以为是同源，避免跨域");
console.log("💡 生产环境通常用 Nginx 替代 dev server 代理");`,
  },

  // =========================================================
  // 第二十九章：CORS 配置
  // =========================================================
  {
    id: "vite2-ch29",
    group: "第六部分 服务器配置",
    icon: "🌍",
    title: "第二十九章 CORS 配置",
    content: `## 第二十九章　CORS 配置

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器的安全机制：脚本只能访问同源的资源，跨域需要服务端明确允许。本章讲 Vite dev server 的 CORS 配置，以及理解 CORS 本身。

### 什么是跨域

"同源"= 协议 + 域名 + 端口三者完全相同。任一不同就是跨域：

| 当前页面 | 请求地址 | 是否跨域 |
|----------|----------|----------|
| \`http://localhost:5173\` | \`http://localhost:5173/api\` | ❌ 同源 |
| \`http://localhost:5173\` | \`http://localhost:8080/api\` | ✅ 跨域（端口不同）|
| \`http://localhost:5173\` | \`https://localhost:5173\` | ✅ 跨域（协议不同）|
| \`http://a.com\` | \`http://b.com\` | ✅ 跨域（域名不同）|

**注意**：跨域是浏览器的限制，Postman、curl 不受影响。

---

## 1. Vite 默认 CORS 行为

Vite dev server 默认开启 CORS，允许所有来源（\`Access-Control-Allow-Origin: *\`）。所以你直接用 \`fetch\` 请求 Vite 自己的资源不会跨域。

\`\`\`js
// vite.config.js
export default {
  server: {
    cors: true   // 默认值，允许所有源
  }
}
\`\`\`

---

## 2. 自定义 CORS

\`\`\`js
server: {
  cors: {
    origin: ['http://localhost:3000', 'https://myapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  }
}
\`\`\`

字段说明：

| 字段 | 作用 |
|------|------|
| \`origin\` | 允许的来源（数组或字符串，\`true\` 表示反射请求的 Origin）|
| \`methods\` | 允许的方法 |
| \`allowedHeaders\` | 允许的请求头 |
| \`exposedHeaders\` | 允许前端读取的响应头 |
| \`credentials\` | 是否允许带 Cookie |
| \`maxAge\` | 预检请求缓存时间（秒）|

### 禁用 CORS

\`\`\`js
server: {
  cors: false   // 完全关闭 CORS 头
}
\`\`\`

---

## 3. 预检请求（OPTIONS）

**简单请求**：GET/POST/HEAD + 几个标准头，浏览器直接发，不带预检。

**复杂请求**：自定义头（如 \`Authorization\`）、PUT/DELETE 方法、\`Content-Type: application/json\`，浏览器会**先发 OPTIONS 请求**询问服务器是否允许。

\`\`\`
请求流程：
1. 浏览器 OPTIONS /api/users + Origin + Access-Control-Request-Method: PUT
2. 服务器返回 Access-Control-Allow-Origin/Methods/Headers
3. 浏览器检查通过，再发真正的 PUT 请求
\`\`\`

**调试技巧**：浏览器 Network 面板看到 OPTIONS 请求，状态 204（No Content），就是预检。

---

## 4. credentials：带 Cookie 的跨域

默认情况下，跨域请求不带 Cookie。要带 Cookie：

前端：
\`\`\`js
fetch('/api/users', { credentials: 'include' })
\`\`\`

后端：
\`\`\`js
server: {
  cors: {
    origin: 'http://localhost:3000',  // 不能是 *，必须明确指定
    credentials: true
  }
}
\`\`\`

**坑点**：\`credentials: true\` 时，\`origin\` 不能是 \`*\`，必须是具体域名，否则浏览器拒绝。

---

## 5. CORS 与代理的关系

| 方案 | 原理 | 适用场景 |
|------|------|----------|
| CORS | 后端在响应头声明允许哪些源 | 后端可控、生产环境 |
| proxy | dev server 转发请求，浏览器无跨域 | 开发环境，后端跨域改不了 |

**典型组合**：
- 开发：用 \`server.proxy\`，避免跨域，前端代码不带特殊处理
- 生产：前端和后端同源（Nginx 反代）或后端配 CORS

> **重要**：用 proxy 时浏览器不知道有跨域，所以后端**不需要**配 CORS。反之亦然，两个方案选一个。

---

## 6. 常见错误

### 错误 1：\`Access-Control-Allow-Origin: *\` + credentials

\`\`\`
Mixed Content / CORS error:
The value of the 'Access-Control-Allow-Origin' header in the response
must not be the wildcard '*' when the request's credentials mode is 'include'.
\`\`\`

解决：\`origin\` 写具体域名，不能用 \`*\`。

### 错误 2：\`Access-Control-Allow-Headers\` 缺失

\`\`\`
Request header field Authorization is not allowed by Access-Control-Allow-Headers
\`\`\`

解决：在 \`allowedHeaders\` 里加 \`'Authorization'\`。

### 错误 3：自定义头触发预检失败

自定义头 \`X-Token\` 没在 \`allowedHeaders\` 声明，预检失败。把所有自定义头都加上。

---

## 下一章

CORS 配清楚了，下一章学习 **HTTPS 配置**——本地开发需要 HTTPS（如 Service Worker、Secure Cookie）时怎么配。`,
    code: `// 演示：CORS 配置与预检请求模拟
// ---------------------------------------------------

const defineConfig = (config) => config;

// 模拟 Vite 的 server.cors 配置
const config = defineConfig({
  server: {
    cors: {
      origin: ['http://localhost:3000', 'https://myapp.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400
    }
  }
});

console.log("🌍 CORS 配置解析");
console.log("=====================================");
console.log("允许的源:", config.server.cors.origin);
console.log("允许的方法:", config.server.cors.methods.join(', '));
console.log("允许的请求头:", config.server.cors.allowedHeaders.join(', '));
console.log("允许 Cookie:", config.server.cors.credentials);
console.log("预检缓存(秒):", config.server.cors.maxAge);

// 模拟 CORS 响应头生成
console.log("\\n📋 响应头模拟（origin=http://localhost:3000）：");
const requestOrigin = 'http://localhost:3000';
const corsHeaders = {
  'Access-Control-Allow-Origin': requestOrigin,
  'Access-Control-Allow-Methods': config.server.cors.methods.join(', '),
  'Access-Control-Allow-Headers': config.server.cors.allowedHeaders.join(', '),
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': String(config.server.cors.maxAge)
};
for (const [k, v] of Object.entries(corsHeaders)) {
  console.log(\`  \${k}: \${v}\`);
}

// 模拟预检请求判断
console.log("\\n🔍 是否触发预检请求？");
const testCases = [
  { method: 'GET', headers: {} },
  { method: 'POST', headers: { 'Content-Type': 'application/json' } },
  { method: 'PUT', headers: { 'Authorization': 'Bearer xxx' } },
  { method: 'DELETE', headers: { 'X-Token': 'abc' } }
];
const simpleMethods = ['GET', 'POST', 'HEAD'];
const simpleHeaders = ['Accept', 'Accept-Language', 'Content-Language', 'Content-Type'];
const simpleContentTypes = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

for (const tc of testCases) {
  const isSimpleMethod = simpleMethods.includes(tc.method);
  const headers = Object.keys(tc.headers);
  const hasCustomHeader = headers.some(h => {
    if (!simpleHeaders.includes(h)) return true;
    if (h === 'Content-Type') {
      const val = tc.headers[h];
      return !simpleContentTypes.includes(val);
    }
    return false;
  });
  const isSimple = isSimpleMethod && !hasCustomHeader;
  console.log(\`  \${tc.method} \${JSON.stringify(tc.headers)} → \${isSimple ? '简单请求（无预检）' : '⚠️ 触发预检（OPTIONS）'}\`);
}

console.log("\\n💡 CORS 是浏览器机制，Postman/curl 不受影响");
console.log("💡 用了 proxy 后浏览器无跨域，后端无需配 CORS");`,
  },

  // =========================================================
  // 第三十章：HTTPS 配置
  // =========================================================
  {
    id: "vite2-ch30",
    group: "第六部分 服务器配置",
    icon: "🔒",
    title: "第三十章 HTTPS 配置",
    content: `## 第三十章　HTTPS 配置

某些 Web API 只在 HTTPS（或 \`localhost\`）下可用：Service Worker、Secure Cookie、Clipboard API、地理定位、WebRTC 等。本地开发如果需要测这些功能，dev server 必须支持 HTTPS。

### 最快的方式：@vitejs/plugin-basic-ssl

Vite 官方提供了一个零配置插件，自动生成自签名证书：

\`\`\`bash
npm i -D @vitejs/plugin-basic-ssl
\`\`\`

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    https: true   // 启用 HTTPS
  }
})
\`\`\`

启动后访问 \`https://localhost:5173/\`，浏览器会提示"证书无效"——因为是自签名的。点"高级 → 继续访问"即可。

> **优点**：一行配置搞定，适合临时调试。
> **缺点**：每次启动可能生成新证书；浏览器警告烦人；不能在生产用。

---

## 1. server.https：自定义证书

如果有自己的证书（自签名或 CA 颁发的），可以这样配：

\`\`\`js
import fs from 'fs'

export default {
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
      // 可选：中间证书
      ca: fs.readFileSync('ca.pem')
    }
  }
}
\`\`\`

---

## 2. 用 mkcert 生成本地受信任证书

\`mkcert\` 是一个生成本地 HTTPS 证书的神器，**浏览器不会报警**（因为它把 mkcert 的根证书加入了系统信任）。

### 安装 mkcert

\`\`\`bash
# macOS
brew install mkcert
brew install nss    # Firefox 需要

# Windows (Chocolatey)
choco install mkcert

# Linux
sudo apt install libnss3-tools
# 然后从 https://github.com/FiloSottile/mkcert 下载二进制
\`\`\`

### 安装根证书（一次性）

\`\`\`bash
mkcert -install
\`\`\`

### 生成项目证书

\`\`\`bash
mkcert localhost 127.0.0.1 ::1
# 生成两个文件：
#   localhost+2.pem      (证书)
#   localhost+2-key.pem  (私钥)
\`\`\`

### 配置 Vite

\`\`\`js
import fs from 'fs'

export default {
  server: {
    https: {
      key: fs.readFileSync('localhost+2-key.pem'),
      cert: fs.readFileSync('localhost+2.pem')
    }
  }
}
\`\`\`

启动 \`https://localhost:5173/\`，浏览器直接显示绿色锁，**无警告**。强烈推荐这种方式。

---

## 3. 自签名证书（OpenSSL）

不想装 mkcert，可以用 openssl 生成：

\`\`\`bash
# 生成私钥
openssl genrsa -out key.pem 2048

# 生成自签名证书（有效期 365 天）
openssl req -new -x509 -key key.pem -out cert.pem -days 365

# 一行命令（跳过交互）
openssl req -newkey rsa:2048 -nodes \\
  -keyout key.pem -x509 -days 365 \\
  -out cert.pem \\
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Dev/CN=localhost"
\`\`\`

然后照上面 \`server.https\` 配置即可。浏览器会有警告，但能用。

---

## 4. Let's Encrypt（真实域名）

如果有真实域名，可以用 Let's Encrypt 申请免费证书：

\`\`\`bash
# 用 certbot 申请
sudo certbot certonly --standalone -d dev.example.com
\`\`\`

证书路径通常在 \`/etc/letsencrypt/live/dev.example.com/\`：

\`\`\`js
server: {
  https: {
    key: fs.readFileSync('/etc/letsencrypt/live/dev.example.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/dev.example.com/fullchain.pem')
  }
}
\`\`\`

**适用场景**：远程开发服务器（如 \`dev.example.com\`）需要 HTTPS。

---

## 5. HTTP/2

Vite 5+ 默认在 HTTPS 启用时自动开启 HTTP/2。如果想强制关闭：

\`\`\`js
server: {
  https: true,
  // Vite 5+ 不再单独配 http2，由 https 字段控制
}
\`\`\`

HTTP/2 的好处：多路复用、头部压缩，开发体验更快。

> **注意**：如果配了 \`proxy\` 且代理目标是 HTTP/1.1，部分场景可能有问题，建议后端也支持 HTTP/2。

---

## 6. 常见坑

### 坑 1：浏览器报警告怎么办

自签名证书（plugin-basic-ssl、openssl）都会报警告。解决：
- 开发环境：点"继续访问"或者用 mkcert
- 想彻底无警告：用 mkcert + \`mkcert -install\`

### 坑 2：HSTS 锁定

某些域名之前配过 HSTS，浏览器强制 HTTPS，导致 \`localhost\` 也跳 HTTPS。

解决：浏览器地址栏输入 \`chrome://net-internals/#hsts\`，在 "Delete domain security policies" 里清除。

### 坑 3：移动端访问 HTTPS

手机访问 \`https://192.168.1.100:5173/\` 会因为证书不信任而拒绝。解决：
- 手机也装 mkcert 根证书（麻烦）
- 用真实域名 + Let's Encrypt

---

## 方案对比

| 方案 | 难度 | 浏览器警告 | 适用场景 |
|------|------|-----------|----------|
| plugin-basic-ssl | ⭐ | 有 | 临时调试 |
| OpenSSL 自签名 | ⭐⭐ | 有 | 临时调试 |
| mkcert | ⭐⭐ | **无** | 长期本地开发（推荐）|
| Let's Encrypt | ⭐⭐⭐ | 无 | 真实域名/远程开发 |

---

## 下一章

HTTPS 配好了，下一章学习**自定义中间件**——用 \`configureServer\` 钩子写自己的 API 路由、mock 数据、日志等。`,
    code: `// 演示：HTTPS 配置方案对比
// ---------------------------------------------------

const defineConfig = (config) => config;

// 模拟四种 HTTPS 配置方案
const solutions = [
  {
    name: "plugin-basic-ssl",
    desc: "Vite 官方插件，零配置",
    warning: true,
    config: {
      plugins: ['basicSsl()'],
      server: { https: true }
    }
  },
  {
    name: "OpenSSL 自签名",
    desc: "用 openssl 生成证书",
    warning: true,
    config: {
      server: {
        https: {
          key: "fs.readFileSync('key.pem')",
          cert: "fs.readFileSync('cert.pem')"
        }
      }
    }
  },
  {
    name: "mkcert",
    desc: "生成本地受信任证书，无警告",
    warning: false,
    config: {
      server: {
        https: {
          key: "fs.readFileSync('localhost+2-key.pem')",
          cert: "fs.readFileSync('localhost+2.pem')"
        }
      }
    }
  },
  {
    name: "Let's Encrypt",
    desc: "真实域名 + 免费证书",
    warning: false,
    config: {
      server: {
        https: {
          key: "fs.readFileSync('/etc/letsencrypt/live/dev.example.com/privkey.pem')",
          cert: "fs.readFileSync('/etc/letsencrypt/live/dev.example.com/fullchain.pem')"
        }
      }
    }
  }
];

console.log("🔒 HTTPS 配置方案对比");
console.log("=====================================");

solutions.forEach((s, i) => {
  console.log(\`\\n\${i + 1}. \${s.name}\`);
  console.log(\`   说明: \${s.desc}\`);
  console.log(\`   浏览器警告: \${s.warning ? '⚠️ 有（需手动继续）' : '✅ 无'}\`);
  console.log("   配置预览:");
  console.log("   " + JSON.stringify(s.config, null, 2).split('\\n').join('\\n   '));
});

console.log("\\n=====================================");
console.log("✅ 推荐：");
console.log("  本地开发 → mkcert（一次配置，永久无警告）");
console.log("  临时调试 → plugin-basic-ssl");
console.log("  真实域名 → Let's Encrypt");

console.log("\\n💡 启动后访问 https://localhost:5173/");
console.log("💡 Vite 5+ 启用 HTTPS 后自动启用 HTTP/2");`,
  },

  // =========================================================
  // 第三十一章：自定义中间件
  // =========================================================
  {
    id: "vite2-ch31",
    group: "第六部分 服务器配置",
    icon: "🧩",
    title: "第三十一章 自定义中间件",
    content: `## 第三十一章　自定义中间件

Vite dev server 基于 Node 的 **connect** 框架（Express 的中间件鼻祖）。通过 \`configureServer\` 钩子，你可以挂自己的中间件——做 mock API、写日志、改请求头等。这是高级玩法，能让你不依赖额外工具就实现 mock 服务。

### 基础：configureServer 钩子

\`\`\`js
// vite.config.js
export default {
  server: {
    // 配置中间件模式（可选）
    middlewareMode: false   // false: 启动独立 HTTP 服务；true: 不启动，由调用方接管
  },
  plugins: [{
    name: 'my-middleware',
    configureServer(server) {
      // server.middlewares 是 connect 实例
      server.middlewares.use((req, res, next) => {
        console.log('收到请求:', req.url);
        next();   // 继续后续中间件
      });
    }
  }]
}
\`\`\`

\`configureServer\` 接收一个 \`server\` 对象，\`server.middlewares\` 就是 connect 应用实例，用 \`.use()\` 挂中间件。

---

## 1. connect 中间件签名

\`\`\`js
function myMiddleware(req, res, next) {
  // req: IncomingMessage（Node 原生）
  // res: ServerResponse
  // next: 调用则交给下一个中间件
  
  if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return;   // 不调 next()，请求到此结束
  }
  
  next();   // 否则交给后续处理
}
\`\`\`

**关键**：要么 \`res.end()\` 结束响应，要么 \`next()\` 交给下一个中间件。两者必选其一。

---

## 2. 自定义 API 路由

写一个返回 mock 数据的 API：

\`\`\`js
plugins: [{
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use('/api/users', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        { id: 1, name: '张三' },
        { id: 2, name: '李四' }
      ]));
    });
    
    server.middlewares.use('/api/orders', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([
        { id: 101, total: 99.9 }
      ]));
    });
  }
}]
\`\`\`

前端代码：

\`\`\`js
fetch('/api/users').then(r => r.json()).then(console.log)
// [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
\`\`\`

---

## 3. 处理 POST 请求

connect 不解析请求体，需要自己读 stream：

\`\`\`js
server.middlewares.use('/api/login', (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }
  
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { username, password } = JSON.parse(body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      token: 'mock-jwt-' + username,
      ok: password === '123456'
    }));
  });
});
\`\`\`

---

## 4. 完整 mock 中间件

\`\`\`js
plugins: [{
  name: 'mock-server',
  configureServer(server) {
    const mocks = {
      'GET /api/users': [{ id: 1, name: '张三' }],
      'GET /api/user/1': { id: 1, name: '张三', age: 28 },
      'POST /api/login': { token: 'mock-token' }
    };
    
    server.middlewares.use((req, res, next) => {
      const key = \`\${req.method} \${req.url}\`;
      if (mocks[key]) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mocks[key]));
      } else {
        next();   // 不匹配，交给后续
      }
    });
  }
}]
\`\`\`

进阶：把 mocks 数据放在单独的 \`mocks/\` 目录，启动时读取。

---

## 5. 日志中间件

\`\`\`js
plugins: [{
  name: 'log-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const cost = Date.now() - start;
        console.log(
          \`[\${new Date().toISOString()}] \${req.method} \${req.url} → \${res.statusCode} (\${cost}ms)\`
        );
      });
      next();
    });
  }
}]
\`\`\`

输出：

\`\`\`
[2026-01-15T08:30:00.000Z] GET / → 200 (12ms)
[2026-01-15T08:30:00.500Z] GET /src/main.js → 200 (45ms)
[2026-01-15T08:30:01.000Z] GET /api/users → 200 (3ms)
\`\`\`

---

## 6. middlewareMode：嵌入到其他服务器

如果想把 Vite 嵌到已有的 Node 服务器（比如 Express、NestJS），用 \`middlewareMode\`：

\`\`\`js
// server.js
import express from 'express'
import { createServer } from 'vite'

const app = express()

const vite = await createServer({
  server: { middlewareMode: true },   // 不启动独立 HTTP 服务
  appType: 'custom'                    // 不注入默认中间件
})

app.use(vite.middlewares)   // 把 Vite 中间件挂到 Express

app.listen(3000)
\`\`\`

适用场景：SSR、把 Vite 嵌入现有后端框架。

---

## 7. 中间件执行顺序

Vite 的中间件顺序：

\`\`\`
请求进来
   ↓
你的 configureServer 中间件（默认在内部中间件之前）
   ↓
Vite 内置中间件（处理 /src、HMR、静态资源）
   ↓
找不到 → 404
\`\`\`

如果想**让中间件在 Vite 内置之后**执行（用于 fallback），\`configureServer\` 可以返回一个函数：

\`\`\`js
configureServer(server) {
  // 这部分在内部中间件之前执行
  server.middlewares.use(beforeMiddleware);
  
  // 返回的函数会在内部中间件挂载后执行
  return () => {
    server.middlewares.use(afterMiddleware);
  };
}
\`\`\`

---

## 下一章

服务器配置部分讲完了，进入**第七部分 构建优化**。下一章学习 **manualChunks 分包**——怎么把大 bundle 拆成多个小文件，优化加载。`,
    code: `// 演示：connect 中间件执行流程模拟
// ---------------------------------------------------

// 模拟 connect 应用
function createApp() {
  const middlewares = [];
  return {
    use(pathOrFn, fn) {
      if (typeof pathOrFn === 'function') {
        middlewares.push({ path: null, fn: pathOrFn });
      } else {
        middlewares.push({ path: pathOrFn, fn });
      }
    },
    handle(req, res) {
      let i = 0;
      const next = () => {
        if (i >= middlewares.length) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        const mw = middlewares[i++];
        if (mw.path && !req.url.startsWith(mw.path)) {
          return next();
        }
        mw.fn(req, res, next);
      };
      next();
    },
    middlewares   // 暴露用于查看
  };
}

// 模拟 Vite configureServer
const app = createApp();

// 1. 日志中间件
app.use((req, res, next) => {
  console.log(\`📝 [日志] \${req.method} \${req.url}\`);
  next();
});

// 2. mock API
app.use('/api/users', (req, res) => {
  res.statusCode = 200;
  res.body = JSON.stringify([{ id: 1, name: '张三' }]);
  console.log("  → 返回 mock 用户列表");
});

// 3. 健康检查
app.use('/health', (req, res) => {
  res.statusCode = 200;
  res.body = JSON.stringify({ status: 'ok' });
  console.log("  → 健康检查通过");
});

// 4. fallback
app.use((req, res, next) => {
  console.log("  → 交给 Vite 默认处理");
  res.statusCode = 200;
  res.body = '<html>...</html>';
});

console.log("🧩 中间件执行流程模拟");
console.log("=====================================");

// 模拟几个请求
const requests = [
  { method: 'GET', url: '/api/users' },
  { method: 'GET', url: '/health' },
  { method: 'GET', url: '/src/main.js' }
];

requests.forEach(req => {
  console.log(\`\\n收到请求: \${req.method} \${req.url}\`);
  console.log('-------------------------------------');
  const res = { statusCode: 0, body: '', end(b) { this.body = b; } };
  app.handle(req, res);
  console.log(\`  状态码: \${res.statusCode}\`);
});

console.log("\\n💡 中间件要么 res.end() 结束，要么 next() 交给下一个");
console.log("💡 configureServer 是 Vite 插件钩子，用来挂自定义中间件");`,
  },

  // =========================================================
  // 第三十二章：分包策略 manualChunks
  // =========================================================
  {
    id: "vite2-ch32",
    group: "第七部分 构建优化",
    icon: "📦",
    title: "第三十二章 分包策略 manualChunks",
    content: `## 第三十二章　分包策略 manualChunks

默认情况下，Vite 把所有 JS 打成一个 bundle 文件。项目大了之后，单文件几 MB，首次加载慢、缓存易失效。\`manualChunks\` 让你拆成多个 chunk：vendor 单独打包、按路由分包、按需加载，**优化首屏和缓存命中率**。

### 默认分包行为

Vite 已经做了一些基础分包：
- \`node_modules\` 里的依赖单独成 chunk（vendor）
- 动态 \`import()\` 自动拆成 chunk

但精细控制需要手动配 \`manualChunks\`。

---

## 1. 配置位置

\`\`\`js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 对象写法 or 函数写法
        }
      }
    }
  }
}
\`\`\`

---

## 2. 对象写法：固定分包

\`\`\`js
manualChunks: {
  vendor: ['react', 'react-dom'],
  utils: ['lodash', 'dayjs', 'axios'],
  ui: ['antd', '@ant-design/icons']
}
\`\`\`

效果：
- \`react\` + \`react-dom\` → \`vendor-[hash].js\`
- \`lodash\` + \`dayjs\` + \`axios\` → \`utils-[hash].js\`
- \`antd\` + icons → \`ui-[hash].js\`
- 业务代码 → \`index-[hash].js\`

**优点**：简单直观。
**缺点**：路径必须精确匹配，对子路径依赖（如 \`lodash/get\`）不友好。

---

## 3. 函数写法：动态分包

\`\`\`js
manualChunks(id) {
  // id 是模块的绝对路径
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'vendor-react';
    if (id.includes('antd')) return 'vendor-antd';
    return 'vendor';   // 其他第三方
  }
  // 业务代码按目录分
  if (id.includes('/src/pages/')) {
    return 'pages';
  }
}
\`\`\`

\`id\` 是模块绝对路径，比如 \`/Users/xxx/project/node_modules/react/index.js\`。根据路径判断归到哪个 chunk。

**优点**：灵活，能匹配 \`node_modules\` 的子路径。
**缺点**：要写正则/字符串匹配。

---

## 4. vendor 分包（最常用）

把第三方依赖单独打包，**业务代码变了不影响 vendor 缓存**：

\`\`\`js
manualChunks(id) {
  if (id.includes('node_modules')) {
    return 'vendor';
  }
}
\`\`\`

效果：
- \`vendor-[hash].js\`：所有第三方依赖（首屏加载，长期缓存）
- \`index-[hash].js\`：业务代码（每次发版变化）

**为什么有效**：vendor 内容极少变（除非升级依赖），浏览器缓存命中率几乎 100%。

---

## 5. 按路由分包

配合动态 \`import()\`，每个路由单独成 chunk：

\`\`\`js
// React Router
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const User = lazy(() => import('./pages/User'))
\`\`\`

Vite/Rollup 自动把每个 \`import()\` 拆成 chunk。再配合 \`manualChunks\` 把它们归类：

\`\`\`js
manualChunks(id) {
  if (id.includes('/src/pages/')) {
    // 按 page 名分包
    const match = id.match(/\\/src\\/pages\\/(\\w+)/);
    if (match) return \`page-\${match[1].toLowerCase()}\`;
  }
  if (id.includes('node_modules')) return 'vendor';
}
\`\`\`

---

## 6. 完整实战配置

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. 第三方依赖分类
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@vue')) return 'vendor-vue';
            if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-ui';
            if (id.includes('lodash')) return 'vendor-utils';
            return 'vendor';
          }
          // 2. 业务代码按模块分包
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
          if (id.includes('/src/components/')) {
            return 'components';
          }
        }
      }
    }
  }
})
\`\`\`

构建输出：

\`\`\`
dist/assets/vendor-react-[hash].js     140 kB
dist/assets/vendor-ui-[hash].js        350 kB
dist/assets/vendor-utils-[hash].js      80 kB
dist/assets/vendor-[hash].js           120 kB
dist/assets/pages-[hash].js             60 kB
dist/assets/components-[hash].js        40 kB
dist/assets/index-[hash].js             20 kB
\`\`\`

---

## 7. 分包陷阱：循环依赖

**陷阱**：把互相 import 的模块拆到不同 chunk，导致循环依赖，运行时初始化顺序错乱。

\`\`\`js
// a.js
import { b } from './b.js'
export const a = b + 1

// b.js
import { a } from './a.js'
export const b = a + 1
\`\`\`

如果 a 进 \`chunk-a\`、b 进 \`chunk-b\`，加载时互相等待，可能拿到 \`undefined\`。

**解决**：
- 不要把有循环依赖的模块拆开
- 用 \`console.warn\` 排查循环依赖（\`npx madge --circular src/\`）
- 重构代码消除循环依赖（提取共享模块）

### 其他陷阱

1. **chunk 太碎**：每个模块一个 chunk，HTTP 请求数爆炸。建议单个 chunk 不小于 20KB。
2. **公共依赖重复**：A、B 都依赖 C，没把 C 提取出来会被打包两次。用 \`manualChunks\` 把 C 单独成 chunk。
3. **CSS 分包**：JS 分了 chunk，对应的 CSS 也会自动分。注意 \`build.cssCodeSplit\`（默认 \`true\`）。

---

## 8. 怎么看分包效果

\`\`\`bash
# 用 rollup-plugin-visualizer 看可视化分析
npm i -D rollup-plugin-visualizer
\`\`\`

\`\`\`js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({ open: true, filename: 'stats.html' })
  ]
}
\`\`\`

构建后自动打开 \`stats.html\`，看每个 chunk 的内容、大小、依赖关系。

---

## 下一章

分包策略会了，下一章学习 **代码压缩**——\`build.minify\` 怎么选 esbuild/terser，怎么 drop console。`,
    code: `// 演示：manualChunks 分包策略模拟
// ---------------------------------------------------

// 模拟项目的模块图
const modules = [
  // 业务代码
  { id: '/src/main.js', size: 2 },
  { id: '/src/pages/Home.tsx', size: 15 },
  { id: '/src/pages/About.tsx', size: 10 },
  { id: '/src/pages/User.tsx', size: 20 },
  { id: '/src/components/Button.tsx', size: 5 },
  { id: '/src/components/Input.tsx', size: 8 },
  // 第三方
  { id: 'node_modules/react/index.js', size: 45 },
  { id: 'node_modules/react-dom/index.js', size: 130 },
  { id: 'node_modules/react-dom/client.js', size: 12 },
  { id: 'node_modules/antd/es/index.js', size: 200 },
  { id: 'node_modules/@ant-design/icons/index.js', size: 80 },
  { id: 'node_modules/lodash/lodash.js', size: 70 },
  { id: 'node_modules/dayjs/dayjs.js', size: 15 },
  { id: 'node_modules/axios/index.js', size: 25 }
];

// 分包策略：函数写法
function manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'vendor-react';
    if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-ui';
    if (id.includes('lodash') || id.includes('dayjs')) return 'vendor-utils';
    return 'vendor';
  }
  if (id.includes('/src/pages/')) return 'pages';
  if (id.includes('/src/components/')) return 'components';
  return 'index';
}

// 模拟分组
const chunks = {};
modules.forEach(m => {
  const chunkName = manualChunks(m.id);
  if (!chunks[chunkName]) chunks[chunkName] = { count: 0, size: 0, modules: [] };
  chunks[chunkName].count++;
  chunks[chunkName].size += m.size;
  chunks[chunkName].modules.push(m.id.split('/').pop());
});

console.log("📦 分包结果模拟");
console.log("=====================================");
console.log("总模块数:", modules.length);
console.log("\\n分包明细:");
console.log("-------------------------------------");

Object.entries(chunks)
  .sort((a, b) => b[1].size - a[1].size)
  .forEach(([name, info]) => {
    console.log(\`\${name}.js\`);
    console.log(\`  模块数: \${info.count}, 总大小: \${info.size} KB\`);
    console.log(\`  包含: \${info.modules.slice(0, 3).join(', ')}\${info.modules.length > 3 ? '...' : ''}\`);
  });

console.log("\\n=====================================");
const totalSize = Object.values(chunks).reduce((s, c) => s + c.size, 0);
console.log(\`总大小: \${totalSize} KB（拆成 \${Object.keys(chunks).length} 个 chunk）\`);

console.log("\\n💡 vendor 单独打包，业务代码变不影响 vendor 缓存");
console.log("💡 单 chunk 不小于 20KB，避免 HTTP 请求数爆炸");
console.log("💡 用 npx madge --circular src/ 检测循环依赖");`,
  },

  // =========================================================
  // 第三十三章：代码压缩与 minify
  // =========================================================
  {
    id: "vite2-ch33",
    group: "第七部分 构建优化",
    icon: "🗜️",
    title: "第三十三章 代码压缩与 minify",
    content: `## 第三十三章　代码压缩与 minify

构建时压缩代码能减小文件体积 50%-70%，直接影响加载速度。Vite 默认用 **esbuild** 压缩 JS（速度极快），也支持切换到 **terser**（压缩率略好但慢）。本章讲怎么选、怎么配。

### 基础配置

\`\`\`js
// vite.config.js
export default {
  build: {
    minify: 'esbuild',   // 默认值，可选 'esbuild' | 'terser' | boolean
  }
}
\`\`\`

| 值 | 说明 |
|------|------|
| \`'esbuild'\` | 默认。用 esbuild 压缩，**速度最快** |
| \`'terser'\` | 用 terser 压缩，**压缩率略好**，但慢 5-10 倍 |
| \`true\` | 等价于 \`'esbuild'\` |
| \`false\` | 不压缩（调试时用）|

---

## 1. esbuild vs terser 对比

| 维度 | esbuild | terser |
|------|---------|--------|
| 实现语言 | Go（编译型）| JavaScript |
| 速度 | **极快**（10-100x）| 慢 |
| 压缩率 | 略差（约 1-3%）| 略好 |
| 高级选项 | 较少 | 丰富（如保留函数名）|
| 是否需安装 | 内置 | 需 \`npm i -D terser\` |
| 推荐场景 | 99% 项目 | 极致压缩率需求 |

**结论**：默认 \`esbuild\` 就够了。只有对体积极其敏感（如 SDK 库发布），才考虑 \`terser\`。

---

## 2. esbuild 压缩选项

\`\`\`js
export default {
  build: {
    minify: 'esbuild',
    // esbuild 配置
    esbuildOptions: {
      drop: ['console', 'debugger'],   // 删除 console.* 和 debugger
      keepNames: true,                  // 保留函数/类名（便于调试栈）
      legalComments: 'none',            // 删除注释
      target: 'es2020'
    }
  }
}
\`\`\`

### 删除 console 和 debugger

\`\`\`js
build: {
  minify: 'esbuild',
  esbuildOptions: {
    drop: ['console', 'debugger']
  }
}
\`\`\`

效果：所有 \`console.log/info/error\` 和 \`debugger\` 语句被删除。

> **注意**：\`drop\` 是 esbuild 0.14+ 才支持。旧版本要用 \`pure: ['console.log']\`。

---

## 3. terser 配置

先用 terser 需要安装：

\`\`\`bash
npm i -D terser
\`\`\`

然后配置：

\`\`\`js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // 删除所有 console.*
        drop_debugger: true,     // 删除 debugger
        pure_funcs: ['console.log'],   // 仅删除 console.log（保留 error/warn）
        sequences: true,         // 用逗号合并语句
        dead_code: true,         // 删除死代码
        if_return: true,         // 优化 if/return
        inline: 1                // 内联简单函数
      },
      format: {
        comments: false          // 删除所有注释
      },
      mangle: {
        toplevel: true           // 顶级变量也混淆
      }
    }
  }
}
\`\`\`

### drop_console vs pure_funcs

| 选项 | 效果 |
|------|------|
| \`drop_console: true\` | 删除所有 \`console.*\`（log/error/warn/info）|
| \`pure_funcs: ['console.log']\` | 仅删除 \`console.log\`，保留 \`error\`/\`warn\`（推荐）|

**推荐**：用 \`pure_funcs\` 保留 \`console.error\` 用于线上错误追踪。

---

## 4. CSS 压缩

Vite 用 **esbuild** 压缩 CSS（默认）。也支持切换到 **Lightning CSS**（更快、更现代）：

\`\`\`js
export default {
  build: {
    cssMinify: 'esbuild'   // 默认，可选 'esbuild' | 'lightningcss' | false
  }
}
\`\`\`

### 用 Lightning CSS（Vite 5.13+）

\`\`\`bash
npm i -D lightningcss
\`\`\`

\`\`\`js
export default {
  build: {
    cssMinify: 'lightningcss'
  },
  css: {
    transformer: 'lightningcss'
  }
}
\`\`\`

**优点**：比 esbuild 更快，支持 CSS Nesting 等新特性。
**缺点**：部分老浏览器兼容性配置略不同。

### 禁用 CSS 压缩

\`\`\`js
build: {
  cssMinify: false   // 调试 CSS 时用
}
\`\`\`

---

## 5. 压缩对构建速度的影响

实测一个中型项目（500 个模块）：

| minify 方案 | 构建时间 | 输出体积 |
|-------------|----------|----------|
| \`false\` | 1.2s | 800 KB |
| \`'esbuild'\` | 1.8s | 280 KB |
| \`'terser'\` | 12.5s | 265 KB |

**结论**：
- esbuild 比 terser 快 5-10 倍，体积差距仅 5%
- 99% 项目用 esbuild 就行
- terser 适合 CI 时间充裕、对体积极度敏感的场景

---

## 6. 不压缩的场景

\`\`\`js
build: {
  minify: false   // 不压缩
}
\`\`\`

适用：
- **开发调试构建**：想看完整的源码
- **库的开发版**：发布给开发者调试用
- **特殊环境**：某些古老浏览器对压缩代码兼容性差

不压缩时仍可生成 sourcemap 调试。

---

## 7. 完整配置示例

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'esbuild',           // 默认 esbuild
    sourcemap: false,            // 生产不生成 sourcemap（缩小体积）
    esbuildOptions: {
      drop: ['console', 'debugger'],   // 删除 console 和 debugger
      keepNames: false,                 // 不保留函数名（更小）
      legalComments: 'none'
    },
    cssMinify: 'lightningcss',   // CSS 用 lightningcss
    reportCompressedSize: true   // 报告 gzip 大小
  }
})
\`\`\`

构建输出示例：

\`\`\`
dist/assets/index-abc123.js   280.45 kB │ gzip: 91.32 kB
dist/assets/index-def456.css   15.20 kB │ gzip:  4.10 kB
\`\`\`

---

## 下一章

压缩讲完了，下一章学习 **CSS 代码分割**——\`build.cssCodeSplit\`、动态导入 CSS、CSS 提取等优化。`,
    code: `// 演示：代码压缩方案对比
// ---------------------------------------------------

// 模拟一段待压缩的代码
const originalCode = \`
function greet(name) {
  console.log('Hello, ' + name);
  console.debug('debug info');
  debugger;
  return 'greeting for ' + name;
}

class User {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    console.log('Hi, I am ' + this.name);
  }
}
\`;

console.log("🗜️ 代码压缩方案对比");
console.log("=====================================");
console.log("原始代码大小:", originalCode.length, "字符");
console.log("\\n原始代码:");
console.log(originalCode);

// 模拟 esbuild 压缩（简化版）
function esbuildMinify(code, options = {}) {
  let result = code;
  if (options.dropConsole) {
    result = result.replace(/console\\.(log|debug|info)\\([^)]*\\);?/g, '');
  }
  if (options.dropDebugger) {
    result = result.replace(/debugger;?/g, '');
  }
  // 简化：去除换行和多余空格
  result = result.replace(/\\n\\s*/g, '').replace(/\\s{2,}/g, ' ');
  return result;
}

// 模拟 terser 压缩（更激进）
function terserMinify(code, options = {}) {
  let result = code;
  if (options.dropConsole) {
    result = result.replace(/console\\.[a-z]+\\([^)]*\\);?/g, '');
  }
  if (options.dropDebugger) {
    result = result.replace(/debugger;?/g, '');
  }
  // 混淆变量名
  result = result.replace(/function greet/g, 'function a')
                 .replace(/class User/g, 'class b')
                 .replace(/greet\\(/g, 'a(')
                 .replace(/new User\\(/g, 'new b(');
  result = result.replace(/\\n\\s*/g, '').replace(/\\s{2,}/g, ' ');
  return result;
}

const esbuildResult = esbuildMinify(originalCode, { dropConsole: true, dropDebugger: true });
const terserResult = terserMinify(originalCode, { dropConsole: true, dropDebugger: true });

console.log("\\n=====================================");
console.log("esbuild 压缩结果:");
console.log("-------------------------------------");
console.log(esbuildResult);
console.log("大小:", esbuildResult.length, "字符");

console.log("\\n=====================================");
console.log("terser 压缩结果:");
console.log("-------------------------------------");
console.log(terserResult);
console.log("大小:", terserResult.length, "字符");

console.log("\\n=====================================");
console.log("📊 压缩对比：");
console.log(\`  原始: \${originalCode.length} 字符\`);
console.log(\`  esbuild: \${esbuildResult.length} 字符（压缩 \${Math.round((1 - esbuildResult.length/originalCode.length)*100)}%）\`);
console.log(\`  terser: \${terserResult.length} 字符（压缩 \${Math.round((1 - terserResult.length/originalCode.length)*100)}%）\`);

console.log("\\n💡 实战中 esbuild 比 terser 快 5-10 倍，体积差距仅 1-3%");
console.log("💡 推荐默认用 esbuild，对体积极度敏感才用 terser");
console.log("💡 drop console 推荐用 pure_funcs 保留 error/warn");`,
  },
];
