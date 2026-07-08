// =============================================================
// HTTP 通信教程 —— 第二批章节
// -------------------------------------------------------------
// HTTP 进阶（5-9章）
//   第 5 章：HTTP 头部（Headers）全面解析
//   第 6 章：URL 与 URI——地址的奥秘
//   第 7 章：HTTP 缓存机制——强缓存与协商缓存
//   第 8 章：Cookie、Session 与 Token
//   第 9 章：HTTP 内容协商与压缩
// =============================================================

export const chapters = [
  // ============================================================
  // 第五章：HTTP 头部（Headers）全面解析
  // ============================================================
  {
    id: "http-05",
    group: "HTTP 进阶",
    icon: "📬",
    title: "HTTP 头部（Headers）全面解析",
    content: `## 一、头部是什么：HTTP 报文的"元信息"

一条 HTTP 报文由三部分组成：**起始行（start line）、头部（headers）、空行、主体（body）**。其中头部以键值对形式存在，作用是给报文附加"元信息"——告诉对方"我是谁、我要什么、我带了什么东西、怎么处理这些东西"。

\`\`\`text
GET /api/users?id=42 HTTP/1.1          ← 起始行（请求行）
Host: www.example.com                  ← 头部（键: 值）
User-Agent: Mozilla/5.0 ...            ← 头部
Accept: application/json               ← 头部
                                       ← 空行（CRLF），标志头部结束
（请求主体，GET 通常为空）               ← 主体
\`\`\`

头部有几个硬性规则：

1. **键名不区分大小写**：\`Content-Type\` 和 \`content-type\` 是同一个头。
2. **键名后必须紧跟冒号 + 一个空格**：\`Host: example.com\`，规范上空格可选，但实践中都加。
3. **值中不能出现 CR/LF**（回车换行），否则会被当成头部结束，这是 HTTP 走私（HTTP smuggling）漏洞的根源。
4. **同一个头可以出现多次**：如 \`Set-Cookie\`，浏览器会把每个都当作独立的 Cookie 处理。
5. **头部结束标志是空行**（CRLF CRLF），服务器/客户端读到空行就知道后面是 body。

## 二、请求头（Request Headers）—— 客户端告诉服务器的事

请求头由客户端发送，描述"这次请求的上下文"。下面挑最常用的几个讲透。

### 2.1 Host —— 唯一一个 HTTP/1.1 必须带的头

\`Host: www.example.com\` 指定目标主机名。为什么必须？因为一台服务器（一个 IP）上可能同时托管多个网站（虚拟主机），服务器要靠 Host 区分该把请求交给哪个站点。没有 Host，HTTP/1.1 会直接报 400 Bad Request。

### 2.2 User-Agent —— 客户端身份标识

\`User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/...\` 告诉服务器"我是浏览器 X，版本 Y，操作系统 Z"。常用于：服务端做 PC/移动端适配、日志统计分析、反爬虫（但 UA 很容易伪造，所以只能防"君子"）。

### 2.3 Accept 系列内容协商头

| 头部 | 含义 | 示例 |
|------|------|------|
| Accept | 期望的响应内容类型 | \`Accept: application/json, text/html;q=0.9\` |
| Accept-Encoding | 期望的压缩算法 | \`Accept-Encoding: gzip, deflate, br\` |
| Accept-Language | 期望的语言 | \`Accept-Language: zh-CN,zh;q=0.9,en;q=0.8\` |

\`q\` 是权重（0~1），表示偏好程度。服务器会根据这些头挑选最合适的格式返回，这叫**内容协商**（详见第 9 章）。

### 2.4 Authorization —— 携带凭证

\`Authorization: Bearer <token>\` 或 \`Authorization: Basic base64(user:pass)\`。Bearer 最常见——JWT、OAuth2 令牌都走这个前缀。注意：它和 Cookie 是两套认证机制，前者通常是无状态 Token，后者依赖服务端 Session。

### 2.5 Cookie —— 浏览器自动携带

\`Cookie: sessionId=abc123; theme=dark\`。浏览器会根据 Cookie 的 Domain/Path 匹配规则，自动把符合条件的 Cookie 拼成这个头发送。**前端 JS 默认无法修改请求头里的 Cookie**，只能通过 \`document.cookie\` 间接写入。

### 2.6 其他常见请求头

- \`Referer\`：从哪个页面跳转来的（注意拼写是 Referer，历史遗留拼错了）。用于防盗链、统计分析。
- \`Origin\`：发起请求的源（协议+域名+端口），CORS 校验用。
- \`If-None-Match\` / \`If-Modified-Since\`：协商缓存专用（详见第 7 章）。
- \`Content-Type\`：当有 body 时，告诉服务器 body 是什么格式（\`application/json\`、\`application/x-www-form-urlencoded\`、\`multipart/form-data\`）。
- \`Content-Length\`：body 的字节长度。

## 三、响应头（Response Headers）—— 服务器告诉客户端的事

### 3.1 Content-Type —— 这是什么格式的数据

\`Content-Type: text/html; charset=utf-8\`。分两部分：MIME 类型 + 可选的字符集。常见 MIME：

| MIME | 含义 |
|------|------|
| text/html | HTML 网页 |
| application/json | JSON 数据 |
| text/plain | 纯文本 |
| application/javascript | JS 脚本 |
| image/png | PNG 图片 |
| application/octet-stream | 二进制流（常触发下载） |
| multipart/form-data | 表单上传文件 |

charset 不写时默认由 MIME 决定（text/* 默认 ASCII），所以中文页面一定要显式写 \`charset=utf-8\`，否则会乱码。

### 3.2 Content-Length —— body 多少字节

\`Content-Length: 1024\`。浏览器靠它判断"响应是否接收完整"。如果是流式传输（chunked），则不写这个头，改用 \`Transfer-Encoding: chunked\`。

### 3.3 Set-Cookie —— 让浏览器种 Cookie

\`Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Max-Age=3600; Secure; SameSite=Lax\`。这是服务器"命令"浏览器存储 Cookie 的头。**一个响应可以有多个 Set-Cookie**。属性含义详见第 8 章。

### 3.4 Cache-Control —— 缓存策略

\`Cache-Control: max-age=3600, public\`。控制缓存行为，是强缓存的核心。详见第 7 章。

### 3.5 其他常见响应头

- \`Location\`：重定向目标，配合 3xx 状态码使用。
- \`Server\`：服务器软件标识（\`Server: nginx/1.24.0\`），出于安全建议生产环境隐藏或改成假值。
- \`Access-Control-Allow-Origin\`：CORS 允许的源。
- \`ETag\` / \`Last-Modified\`：协商缓存标识。
- \`WWW-Authenticate\`：401 响应时告诉客户端认证方式。

## 四、自定义头部（X-* 前缀的过去与现在）

早期规范约定：非标准头部以 \`X-\` 开头，比如 \`X-Request-Id\`、\`X-Forwarded-For\`、\`X-Powered-By\`。这样如果未来某个 X- 头被官方采纳，老的也不会冲突。

但 2012 年的 RFC 6648 废弃了这个建议——理由是"去掉 X- 时会引起混乱"。现在社区态度是：新自定义头可带可不带 X-，但已有 X- 头尽量保留兼容性。实践中的常见自定义头：

- \`X-Request-Id\` / \`X-Correlation-Id\`：链路追踪 ID。
- \`X-Forwarded-For\`：代理转发链上的原始客户端 IP。
- \`X-Forwarded-Proto\`：原始协议（http/https）。
- \`X-RateLimit-Remaining\`：剩余请求配额。

## 五、头部安全注意事项

1. **CRLF 注入**：永远不要把用户输入直接拼进响应头，要用框架提供的 API 设置头，否则攻击者注入 \`\\r\\nSet-Cookie: evil=1\` 就能种恶意 Cookie。
2. **敏感头别外泄**：\`Server\`、\`X-Powered-By\` 会暴露技术栈，建议移除或改写。
3. **安全头要主动加**：\`X-Content-Type-Options: nosniff\`、\`X-Frame-Options: DENY\`、\`Strict-Transport-Security\`、\`Content-Security-Policy\` 等。

---

## 六、本节代码演示

下面我们用纯字符串处理来模拟 HTTP 报文解析——把一段原始的 HTTP 请求文本拆成"请求行 + 头部对象 + 主体"，并对头部做分类展示。这能帮你从底层理解头部到底是怎么存储和读取的（真实的 Node.js \`http\` 模块也是这么解析的）。
`,
    code: `// ============================================
// 第五章演示：手动解析 HTTP 请求头
// --------------------------------------------
// 我们用一段字符串模拟真实的 HTTP 请求报文，
// 然后按照 HTTP 报文格式逐行解析：
//   第一行是请求行（方法 路径 版本）
//   后面是若干行头部（键: 值）
//   遇到空行表示头部结束，后面是主体
// ============================================

const assert = require('assert');

// ---- 1. 构造一段原始的 HTTP 请求报文 ----
// 真实 HTTP 报文中换行是 CRLF（\\r\\n），这里用数组 join 模拟
const rawRequest = [
  'GET /api/users?id=42&name=%E5%BC%A0%E4%B8%89 HTTP/1.1',
  'Host: www.example.com',
  'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept: application/json, text/html;q=0.9, */*;q=0.1',
  'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding: gzip, deflate, br',
  'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiJ9.sig',
  'Cookie: sessionId=abc123; theme=dark; lang=zh',
  'Referer: https://www.google.com/search?q=http',
  'X-Request-Id: 9f8e7d6c-1234-5678-9abc',
  'X-Forwarded-For: 203.0.113.50',
  '',   // 空行，标志头部结束
  ''    // 主体（GET 请求通常为空）
].join('\\r\\n');

console.log('======== 原始报文（前 200 字符）========');
console.log(rawRequest.slice(0, 200) + '...');
console.log('');

// ---- 2. 解析函数：把报文拆成结构化对象 ----
function parseHttpRequest(raw) {
  // HTTP 报文头部和主体之间用 空行（CRLF CRLF）分隔
  const separator = '\\r\\n\\r\\n';
  const splitIndex = raw.indexOf(separator);
  // 头部部分（含请求行）
  const headPart = splitIndex === -1 ? raw : raw.slice(0, splitIndex);
  // 主体部分
  const bodyPart = splitIndex === -1 ? '' : raw.slice(splitIndex + separator.length);

  // 把头部按 CRLF 切成行
  const lines = headPart.split('\\r\\n');
  // 第一行是请求行：方法 路径 版本
  const requestLine = lines[0];
  const parts = requestLine.split(' ');
  const method = parts[0];
  const target = parts[1];
  const version = parts[2];

  // 解析每一行头部
  const headers = {};
  const headerOrder = []; // 记录原始顺序
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') continue;
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    // 键名 trim 后转小写（HTTP 头部键名不区分大小写）
    const key = line.slice(0, colonIndex).trim().toLowerCase();
    // 值 trim 掉冒号后的空格
    const value = line.slice(colonIndex + 1).trim();
    // 同名头合并（Set-Cookie 除外，这里简化处理）
    if (headers[key] !== undefined) {
      headers[key] = headers[key] + ', ' + value;
    } else {
      headers[key] = value;
      headerOrder.push(key);
    }
  }

  return {
    method: method,
    target: target,
    version: version,
    headers: headers,
    headerOrder: headerOrder,
    body: bodyPart
  };
}

// ---- 3. 执行解析并展示 ----
const parsed = parseHttpRequest(rawRequest);

console.log('======== 解析结果 ========');
console.log('请求行：');
console.log('  方法    : ' + parsed.method);
console.log('  路径    : ' + parsed.target);
console.log('  版本    : ' + parsed.version);
console.log('');

console.log('头部（按原始顺序）：');
parsed.headerOrder.forEach(function (key) {
  // 对过长的值截断显示
  const value = parsed.headers[key];
  const display = value.length > 60 ? value.slice(0, 60) + '...' : value;
  console.log('  ' + key + ' : ' + display);
});
console.log('');

// ---- 4. 头部分类：请求头按用途归类 ----
console.log('======== 头部按用途分类 ========');

// 内容协商相关
const negotiationKeys = ['accept', 'accept-encoding', 'accept-language'];
console.log('【内容协商】');
negotiationKeys.forEach(function (k) {
  if (parsed.headers[k]) {
    console.log('  ' + k + ' = ' + parsed.headers[k]);
  }
});

// 认证相关
console.log('【认证信息】');
if (parsed.headers['authorization']) {
  const auth = parsed.headers['authorization'];
  // Bearer xxx 解析出认证类型
  const spaceIndex = auth.indexOf(' ');
  const scheme = spaceIndex === -1 ? auth : auth.slice(0, spaceIndex);
  const credential = spaceIndex === -1 ? '' : auth.slice(spaceIndex + 1);
  console.log('  认证方案 : ' + scheme);
  console.log('  凭证     : ' + (credential.length > 20 ? credential.slice(0, 20) + '...' : credential));
}
if (parsed.headers['cookie']) {
  console.log('  Cookie 原始: ' + parsed.headers['cookie']);
  // 把 Cookie 拆成键值对
  const cookies = {};
  parsed.headers['cookie'].split(';').forEach(function (pair) {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      cookies[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  });
  console.log('  Cookie 解析: ' + JSON.stringify(cookies));
}

// 自定义头（X- 开头）
console.log('【自定义头（X-前缀）】');
parsed.headerOrder.forEach(function (key) {
  if (key.indexOf('x-') === 0) {
    console.log('  ' + key + ' = ' + parsed.headers[key]);
  }
});

// ---- 5. 解析 Accept 头的权重（q 值）----
console.log('');
console.log('======== Accept 头权重解析 ========');
function parseAccept(headerValue) {
  // 格式：type/subtype;q=x, type2;q=y
  const items = headerValue.split(',').map(function (s) { return s.trim(); });
  return items.map(function (item) {
    const parts = item.split(';');
    const mediaType = parts[0].trim();
    let q = 1.0; // 默认权重 1
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i].trim();
      if (p.indexOf('q=') === 0) {
        q = parseFloat(p.slice(2));
      }
    }
    return { type: mediaType, q: q };
  }).sort(function (a, b) {
    // 按 q 值降序排列
    return b.q - a.q;
  });
}

const acceptParsed = parseAccept(parsed.headers['accept']);
console.log('Accept: ' + parsed.headers['accept']);
console.log('解析并按优先级排序：');
acceptParsed.forEach(function (item) {
  console.log('  ' + item.type + ' (q=' + item.q + ')');
});

// ---- 6. 断言验证解析正确性 ----
assert.strictEqual(parsed.method, 'GET');
assert.strictEqual(parsed.headers['host'], 'www.example.com');
assert.ok(parsed.headers['authorization'].indexOf('Bearer') === 0);
assert.ok(parsed.headers['cookie'].indexOf('sessionId=abc123') === 0);

console.log('');
console.log('✅ 所有断言通过，HTTP 请求头解析正确！');
console.log('');
console.log('💡 关键点回顾：');
console.log('   1. 头部键名不区分大小写，存储时统一转小写');
console.log('   2. 头部和主体用空行（CRLF CRLF）分隔');
console.log('   3. Cookie 头里的多个 Cookie 用分号空格分隔');
console.log('   4. Accept 头的 q 值表示偏好权重，默认 1.0');
console.log('   5. X- 前缀的头是自定义头，用于传递业务元信息');
`
  },

  // ============================================================
  // 第六章：URL 与 URI——地址的奥秘
  // ============================================================
  {
    id: "http-06",
    group: "HTTP 进阶",
    icon: "🔗",
    title: "URL 与 URI——地址的奥秘",
    content: `## 一、URI、URL、URN 到底什么关系

这三个词经常被混用，其实关系很明确：

- **URI（Uniform Resource Identifier）**：统一资源**标识符**，是一个超级概念，"能唯一标识一个资源"的字符串都算 URI。
- **URL（Uniform Resource Locator）**：统一资源**定位符**，是 URI 的子集，通过"位置 + 协议"来定位资源。比如 \`https://example.com/a.html\`。
- **URN（Uniform Resource Name）**：统一资源**名称**，也是 URI 的子集，通过"名字"来标识资源，跟位置无关。比如 \`urn:isbn:9787111111111\`（一本书的 ISBN）。

关系图：

\`\`\`text
            ┌──────────────── URI（标识符，总集）────────────────┐
            │                                                    │
            │   ┌──── URL（定位符）────┐  ┌──── URN（名称）────┐ │
            │   │  https://a.com/x     │  │  urn:isbn:123       │ │
            │   │  ftp://b.com/y       │  │  urn:uuid:xxx-yyy   │ │
            │   └──────────────────────┘  └─────────────────────┘ │
            └────────────────────────────────────────────────────┘
\`\`\`

日常开发中我们打交道 99% 是 URL，所以下面重点讲 URL。

## 二、URL 的结构：每一部分都有名字

\`\`\`text
  https://user:pass@www.example.com:8443/api/users?id=42&name=zhang#profile
  └─┬─┘ └─────┬─────┘└──────┬──────┘└─┬┘└──────┬──────┘└──────┬─────┘└───┬───┘
   scheme    用户信息         host     port     path           query       fragment
\`\`\`

| 部分 | 说明 | 示例 |
|------|------|------|
| scheme | 协议名 | \`https\`、\`http\`、\`ftp\`、\`file\` |
| userinfo | 用户密码（已弃用，不安全） | \`user:pass@\` |
| host | 主机名（域名或 IP） | \`www.example.com\` |
| port | 端口，省略时用协议默认端口 | \`8443\`（http 默认 80，https 默认 443） |
| path | 资源路径 | \`/api/users\` |
| query | 查询字符串，\`?\` 开头 | \`?id=42&name=zhang\` |
| fragment | 片段标识符，\`#\` 开头 | \`#profile\` |

**几个易错点**：

1. **fragment 不会发给服务器**：\`#profile\` 只在浏览器端使用（跳到页面锚点），HTTP 请求里不会包含它。所以服务端拿不到 fragment。
2. **query 用 \`?\` 开头，多个参数用 \`&\` 分隔**：\`?a=1&b=2\`。
3. **port 省略规则**：http→80，https→443，ftp→21。用默认端口时 URL 不写端口。
4. **path 区分大小写**，但 host 不区分（\`EXAMPLE.com\` 等同 \`example.com\`）。

## 三、百分号编码（Percent-Encoding）

URL 里只能出现 ASCII 字符集的一个子集（字母、数字、\`-_.~\`）。其他字符（中文、空格、\`&\`、\`=\`、\`#\` 等）必须用 \`%XX\` 形式编码——这叫**百分号编码**或 URL 编码。

### 3.1 为什么要编码

- **保留字符**：\`?\`、\`#\`、\`&\`、\`=\`、\`/\` 等在 URL 里有结构含义，如果数据本身包含这些字符，必须编码，否则会破坏 URL 结构。比如查询参数值是 \`a&b\`，不编码会变成 \`?val=a&b\`，被解析成两个参数。
- **非 ASCII 字符**：中文、emoji 等必须编码成字节序列的百分号形式。比如"张三" UTF-8 编码是 \`E5 BC A0 E4 B8 89\`，URL 编码后是 \`%E5%BC%A0%E4%B8%89\`。
- **不安全字符**：空格（\` \` → \`%20\` 或 \`+\`）、\`<\`、\`>\`、\`"\`、\`{\`、\`}\` 等建议编码。

### 3.2 编码规则对照

| 原字符 | 编码后 | 说明 |
|--------|--------|------|
| 空格 | \`%20\` 或 \`+\` | query 里常用 \`+\` |
| 中 | \`%E4%B8%AD\` | UTF-8 三字节 |
| & | \`%26\` | 保留字符 |
| = | \`%3D\` | 保留字符 |
| # | \`%23\` | 保留字符（否则被当 fragment） |
| / | \`%2F\` | path 里可保留，query 里建议编码 |

### 3.3 编码 vs 解码函数

JavaScript 中：

- \`encodeURIComponent(str)\`：编码所有非 URL 安全字符（适合编码 query 参数值）。
- \`encodeURI(str)\`：编码但不破坏 URL 结构（保留 \`/:?#&=\` 等，适合编码整个 URL）。
- \`decodeURIComponent\` / \`decodeURI\`：对应解码。

坑点：\`encodeURIComponent\` 不编码 \`!'()*-._~\`，这些是"无保留字符"，安全。

## 四、Query String 解析

查询字符串格式：\`?key1=value1&key2=value2\`。但实际比想象复杂：

1. **同名 key 重复**：\`?tag=a&tag=b\`，解析成数组 \`{tag: ['a','b']}\` 还是覆盖？取决于解析器。
2. **嵌套对象**：\`?user[name]=zhang&user[age]=20\`，需要支持嵌套解析（qs 库支持，原生 querystring 不支持）。
3. **空值**：\`?flag\`（无 =）、\`?flag=\`（空字符串）。
4. **编码值**：\`?name=%E5%BC%A0%E4%B8%89\`。

Node.js 提供 \`querystring\` 模块（已废弃但仍可用）和现代的 \`URLSearchParams\` 来处理。本节演示两者。

## 五、Node.js 的 url 模块

Node.js 的 \`url\` 模块有两套 API：

1. **旧 API（Legacy）**：\`url.parse(str)\` 返回一个对象，宽松、能解析非标准 URL，但有一些坑（比如把 \`//\` 当成 host）。
2. **新 API（WHATWG）**：\`new URL(str)\`，与浏览器一致，严格按标准解析。推荐用这个。

本节演示用 WHATWG \`URL\` 解析 URL 各部分，并用 \`querystring\` 解析查询字符串。

## 六、URL 与路由

后端框架（Express、Koa）的路由本质就是"把 URL 的 path 部分匹配到处理函数"。比如：

\`\`\`text
GET /api/users/:id   ←  路由模式
GET /api/users/42    ←  实际请求，:id = 42
\`\`\`

理解 URL 结构后，再去看路由器的实现（正则匹配、参数提取）就会很自然。

---

## 七、本节代码演示

下面用 Node.js 的 \`url\` 模块和 \`querystring\` 模块解析各种 URL，并演示百分号编码的编解码过程。
`,
    code: `// ============================================
// 第六章演示：URL 解析与百分号编码
// --------------------------------------------
// 使用 Node.js 内置模块：
//   url        - WHATWG URL 标准（与浏览器一致）
//   querystring - 查询字符串解析（旧版 API，仍可用）
// ============================================

const url = require('url');
const querystring = require('querystring');
const assert = require('assert');

// ---- 1. 用 WHATWG URL 解析完整的 URL 结构 ----
console.log('======== 1. WHATWG URL 解析 ========');
const target = 'https://user:pass@www.example.com:8443/api/users?id=42&name=%E5%BC%A0%E4%B8%89&tag=a&tag=b#profile';
const parsedUrl = new URL(target);

console.log('原始 URL: ' + target);
console.log('');
console.log('各部分拆解：');
console.log('  protocol : ' + parsedUrl.protocol);   // https:
console.log('  username : ' + parsedUrl.username);   // user
console.log('  password : ' + parsedUrl.password);   // pass
console.log('  host     : ' + parsedUrl.host);       // www.example.com:8443
console.log('  hostname : ' + parsedUrl.hostname);   // www.example.com
console.log('  port     : ' + parsedUrl.port);       // 8443
console.log('  pathname : ' + parsedUrl.pathname);   // /api/users
console.log('  search   : ' + parsedUrl.search);     // ?id=42&...
console.log('  hash     : ' + parsedUrl.hash);       // #profile
console.log('  origin   : ' + parsedUrl.origin);     // https://www.example.com:8443
console.log('  href     : ' + parsedUrl.href);

// 验证：fragment 不会包含在发送给服务器的请求里
// 浏览器发起请求时只发 pathname + search，hash 留在客户端
console.log('');
console.log('  实际发送给服务器的部分: ' + parsedUrl.pathname + parsedUrl.search);
console.log('  fragment (#profile) 只在浏览器端使用，不会发往服务器');

// ---- 2. 用 URLSearchParams 解析 query ----
console.log('');
console.log('======== 2. 用 URLSearchParams 解析查询字符串 ========');
const searchParams = parsedUrl.searchParams;

// 单值获取
console.log('  id   = ' + searchParams.get('id'));
console.log('  name = ' + searchParams.get('name') + '  (已自动解码百分号编码)');

// 多值获取（同名 key）
console.log('  tag  = ' + JSON.stringify(searchParams.getAll('tag')) + '  (同名key返回数组)');

// 遍历所有参数
console.log('  所有参数（遍历）：');
searchParams.forEach(function (value, key) {
  console.log('    ' + key + ' = ' + value);
});

// ---- 3. 用 querystring 模块解析（旧 API）----
console.log('');
console.log('======== 3. 用 querystring 模块解析 ========');
const qsStr = 'id=42&name=%E5%BC%A0%E4%B8%89&tag=a&tag=b';
const qsParsed = querystring.parse(qsStr);
console.log('  原始: ' + qsStr);
console.log('  解析: ' + JSON.stringify(qsParsed));
// querystring 默认把同名 key 合并成数组
console.log('  tag 类型: ' + Array.isArray(qsParsed.tag) + ' (querystring 自动合并同名key)');

// 反向：把对象序列化成 query string
const obj = { id: 42, name: '张三', tags: ['a', 'b'] };
const qsEncoded = querystring.stringify(obj);
console.log('  反向序列化: ' + qsEncoded);

// ---- 4. 百分号编码演示 ----
console.log('');
console.log('======== 4. 百分号编码（Percent-Encoding）========');

// 中文编码：UTF-8 三字节
const chinese = '张三';
const encoded = encodeURIComponent(chinese);
console.log('  原文: ' + chinese);
console.log('  encodeURIComponent: ' + encoded);
console.log('  解码回来: ' + decodeURIComponent(encoded));

// 特殊字符编码
const special = 'a&b=c?d#e f';
console.log('  原文: ' + special);
console.log('  encodeURIComponent: ' + encodeURIComponent(special));
console.log('  encodeURI         : ' + encodeURI(special));
// 区别：encodeURIComponent 会编码 & = ? # 等结构字符，encodeURI 不会
console.log('  区别：encodeURIComponent 编码结构字符（&=?#），encodeURI 保留它们');

// 手动实现简单的百分号编码（理解原理）
function simpleEncode(str) {
  // 把字符串按 UTF-8 转成字节序列
  const bytes = Buffer.from(str, 'utf8');
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // 字母数字和 -_.~ 不编码
    if (
      (byte >= 0x30 && byte <= 0x39) || // 0-9
      (byte >= 0x41 && byte <= 0x5a) || // A-Z
      (byte >= 0x61 && byte <= 0x7a) || // a-z
      byte === 0x2d || // -
      byte === 0x5f || // _
      byte === 0x2e || // .
      byte === 0x7e    // ~
    ) {
      result += String.fromCharCode(byte);
    } else {
      // 其他字节用 %XX 表示
      result += '%' + byte.toString(16).toUpperCase().padStart(2, '0');
    }
  }
  return result;
}

const manual = simpleEncode(chinese);
console.log('  手动实现 simpleEncode("张三"): ' + manual);
assert.strictEqual(manual.toLowerCase(), encoded.toLowerCase());
console.log('  ✅ 手动实现与 encodeURIComponent 结果一致');

// ---- 5. 解析一个完整的请求路径 ----
console.log('');
console.log('======== 5. 从请求路径还原结构化数据 ========');
// 模拟服务器收到的 request target（path + query）
const requestTarget = '/api/v1/products?category=%E7%94%B5%E5%AD%90&page=2&sort=price&asc=true';

const reqPath = new URL(requestTarget, 'http://localhost');
console.log('  请求路径: ' + requestTarget);
console.log('  pathname: ' + reqPath.pathname);
console.log('  category : ' + reqPath.searchParams.get('category') + '  (解码自 电子)');
console.log('  page     : ' + reqPath.searchParams.get('page'));
console.log('  sort     : ' + reqPath.searchParams.get('sort'));
console.log('  asc      : ' + reqPath.searchParams.get('asc'));

// 把 path 拆成段（路由参数提取的基础）
const segments = reqPath.pathname.split('/').filter(function (s) { return s.length > 0; });
console.log('  path 分段: ' + JSON.stringify(segments));
console.log('  路由模式: /api/:version/products  →  version = ' + segments[1]);

// ---- 6. URL 规范化与比较 ----
console.log('');
console.log('======== 6. URL 规范化 ========');
// 同一个资源可以有多种 URL 写法，规范化后才能比较
const u1 = new URL('https://Example.com:443/a/b/../c/./d');
const u2 = new URL('https://example.com/a/c/d');
console.log('  URL1: https://Example.com:443/a/b/../c/./d');
console.log('  URL2: https://example.com/a/c/d');
console.log('  URL1 规范化后 href: ' + u1.href);
console.log('  两者相等: ' + (u1.href === u2.href));
// 注意：/b/../ 会抵消前一级，/./ 不变，这就是路径规范化

console.log('');
console.log('💡 关键点回顾：');
console.log('   1. URI 是总集，URL（定位）和 URN（命名）是子集');
console.log('   2. URL = scheme://userinfo@host:port/path?query#fragment');
console.log('   3. fragment（#后）不会发给服务器，只在浏览器端用');
console.log('   4. 非 ASCII 字符和保留字符必须百分号编码：%XX');
console.log('   5. 推荐用 WHATWG new URL() 而非 legacy url.parse()');
console.log('   6. 同名 query 参数，URLSearchParams.getAll 返回数组');
`
  },

  // ============================================================
  // 第七章：HTTP 缓存机制——强缓存与协商缓存
  // ============================================================
  {
    id: "http-07",
    group: "HTTP 进阶",
    icon: "💾",
    title: "HTTP 缓存机制——强缓存与协商缓存",
    content: `## 一、为什么需要缓存：性能与成本的双赢

Web 性能优化的第一法则：**能用缓存的就别重新请求**。原因：

1. **速度**：从本地磁盘读 10ms，从远端服务器拉 200ms，差 20 倍。
2. **带宽**：CDN 节点缓存命中能省下回源带宽，对流量计费的业务是真金白银。
3. **服务器压力**：热门内容如果每次都回源，服务器早就被打爆了。
4. **用户体验**：秒开 vs 卡顿，缓存是关键。

但缓存也带来一致性问题——用户改了头像，刷新后还是旧的？这就需要合理的缓存策略。HTTP 设计了一套**两级缓存**机制：

- **强缓存**：本地缓存没过期，直接用，**连请求都不发**。
- **协商缓存**：本地缓存过期了，发个请求问服务器"还能用吗"，服务器说"没变"就返回 304，**不传 body**，继续用本地的；说"变了"就返回 200 + 新 body。

\`\`\`text
浏览器请求资源
     │
     ▼
本地有缓存？─── 否 ──→ 发请求 ──→ 服务器返回 200 + 资源 ──→ 存入缓存
     │
     是
     │
     ▼
强缓存过期？─── 否 ──→ 直接用本地缓存（不发请求，200 from cache）
     │
     是
     │
     ▼
发请求（带 If-None-Match / If-Modified-Since）
     │
     ▼
服务器校验 ── 资源未变 ──→ 返回 304（无 body）──→ 继续用本地缓存
     │
     资源已变
     │
     ▼
返回 200 + 新资源 ──→ 更新本地缓存
\`\`\`

## 二、强缓存：Cache-Control 与 Expires

### 2.1 Expires（HTTP/1.0，已过时）

\`Expires: Wed, 08 Jul 2026 12:00:00 GMT\` —— 指定一个**绝对过期时间**。浏览器在该时间之前直接用本地缓存。

**问题**：依赖客户端时钟，如果用户改了系统时间，缓存就乱了。所以 HTTP/1.1 引入了 Cache-Control。

### 2.2 Cache-Control（HTTP/1.1，主流）

\`Cache-Control: max-age=3600, public\` —— 指定一个**相对存活时间**（秒），从响应生成那一刻开始算。比 Expires 优先级高，同时存在时以 Cache-Control 为准。

常用指令：

| 指令 | 含义 |
|------|------|
| \`max-age=N\` | 缓存存活 N 秒 |
| \`s-maxage=N\` | 共享缓存（CDN/代理）的存活时间，覆盖 max-age |
| \`public\` | 允许中间代理缓存（默认） |
| \`private\` | 只允许浏览器缓存，代理不缓存（用户私密数据） |
| \`no-cache\` | **名字误导**：不是"不缓存"，而是"缓存但每次用前必须协商" |
| \`no-store\` | 真正的"不缓存"，连磁盘都不写（敏感数据） |
| \`must-revalidate\` | 过期后必须重新验证，不能用陈旧缓存 |
| \`immutable\` | 资源永远不会变，连协商都不用（带 hash 的资源用） |

**no-cache vs no-store 最容易混淆**：

- \`no-cache\`：可以存，但每次用前要发请求问服务器（强制走协商缓存）。
- \`no-store\`：彻底不存，每次都重新拉取完整内容。

### 2.3 强缓存的浏览器行为

强缓存命中时，Chrome 开发者工具的 Network 里会看到：

- \`200 (from memory cache)\`：缓存在内存里（当前标签页有效，关闭即失效）。
- \`200 (from disk cache)\`：缓存在磁盘里（持久，关浏览器还在）。

哪种进内存哪种进磁盘？经验规则：小资源、JS/CSS 等可能进内存；大图片、视频进磁盘。

## 三、协商缓存：ETag 与 Last-Modified

强缓存过期后，浏览器发请求时带上"缓存标识"，让服务器判断是否变化。

### 3.1 Last-Modified / If-Modified-Since（HTTP/1.0）

服务器响应时带 \`Last-Modified: Wed, 08 Jul 2026 12:00:00 GMT\`，表示资源最后修改时间。浏览器下次请求带 \`If-Modified-Since: Wed, 08 Jul 2026 12:00:00 GMT\`。服务器比较：

- 资源修改时间 ≤ If-Modified-Since → 返回 304（未变）。
- 资源修改时间 > If-Modified-Since → 返回 200 + 新资源。

**缺陷**：

1. **精度只到秒**：1 秒内改了多次，Last-Modified 没法反映。
2. **内容没变但时间变了**：比如重新部署但文件内容没变（重新 touch），mtime 更新，导致缓存失效。
3. **分布式文件系统 mtime 不可靠**：不同服务器上同一文件的 mtime 可能不同。

### 3.2 ETag / If-None-Match（HTTP/1.1，推荐）

为解决 Last-Modified 的问题，引入了 ETag——资源的"内容指纹"。

服务器响应时带 \`ETag: "abc123"\`，浏览器下次请求带 \`If-None-Match: "abc123"\`。服务器重新计算当前资源的 ETag，与 If-None-Match 比较：

- 相同 → 返回 304。
- 不同 → 返回 200 + 新资源 + 新 ETag。

**ETag 优先级高于 Last-Modified**，同时存在时以 ETag 为准。

### 3.3 ETag 怎么生成

ETag 是服务器自己决定的，没有统一算法。常见做法：

1. **基于内容哈希**：对资源内容算 MD5/SHA1，最准确但开销大。
2. **基于 mtime + size**：\`"<mtime>-<size>"\`，简单但不严谨。
3. **基于 inode + mtime + size**：Nginx 默认做法，但分布式不通用。

构建工具（webpack/vite）给文件名加 hash（\`app.abc123.js\`）本质就是用文件名当 ETag——内容变 hash 就变，URL 变了直接走新请求，连协商都省了。

### 3.4 强缓存 + 协商缓存的典型组合

\`\`\`text
# 静态资源（带 hash 的 JS/CSS）—— 强缓存一年，永不协商
Cache-Control: public, max-age=31536000, immutable

# HTML 文档 —— 协商缓存
Cache-Control: no-cache   （每次都协商）
ETag: "computed-hash"

# API 数据 —— 不缓存或短缓存
Cache-Control: no-store    （敏感数据）
或
Cache-Control: max-age=60  （缓存 1 分钟）
\`\`\`

## 四、缓存层级：浏览器缓存 vs 代理缓存 vs 网关缓存

缓存不止浏览器有：

1. **私有缓存（Private Cache）**：浏览器缓存，只服务单个用户。
2. **共享缓存（Shared Cache）**：CDN、反向代理（Nginx）、正向代理。多个用户共享。
3. \`private\` 指令禁止共享缓存存储，保护用户隐私数据。
4. \`s-maxage\` 单独控制共享缓存的有效期。

## 五、常见缓存陷阱

1. **登录态页面被缓存**：用户 A 看到的页面被 CDN 缓存，用户 B 也能看到。解决：个人页用 \`Cache-Control: private, no-cache\`。
2. **304 但 body 没缓存住**：浏览器如果因为 \`no-store\` 没存 body，304 后拿不到本地副本，会再发一次请求。所以 304 前提是 body 真的在本地。
3. **URL 不变内容变**：没加 hash 的 JS 改了，但浏览器还用强缓存的旧版本。解决：用 hash 文件名或 \`no-cache\`。

---

## 六、本节代码演示

下面用 \`crypto\` 模块生成 ETag（内容哈希），并模拟完整的强缓存 + 协商缓存流程：第一次请求拉资源，第二次请求走协商缓存命中 304，第三次资源改变后走 200 重新拉取。
`,
    code: `// ============================================
// 第七章演示：模拟 HTTP 缓存机制
// --------------------------------------------
// 用 crypto 模块为资源生成 ETag（内容哈希），
// 模拟"浏览器-服务器"之间的强缓存 + 协商缓存流程：
//   1. 首次请求：服务器返回 200 + 资源 + ETag + Cache-Control
//   2. 二次请求（资源未变）：带 If-None-Match，服务器返回 304
//   3. 三次请求（资源已变）：服务器返回 200 + 新资源 + 新 ETag
// ============================================

const crypto = require('crypto');
const assert = require('assert');

// ---- 1. 模拟服务器端：资源存储 + ETag 生成 ----
// 用一个对象模拟服务器上的文件
const serverStore = {
  '/article.md': {
    content: '# HTTP 缓存教程\\n\\n这是第一节的内容，讲解强缓存和协商缓存。\\n',
    mtime: new Date('2026-07-01T00:00:00Z')
  }
};

// 用内容的 SHA1 哈希生成 ETag
// 真实服务器也是类似做法：对响应体算 hash
function generateETag(content) {
  const hash = crypto.createHash('sha1').update(content).digest('hex');
  // ETag 通常用双引号包裹
  return '"' + hash.substring(0, 16) + '"';
}

// 模拟服务器处理请求
// 传入：请求路径 + If-None-Match 头
// 返回：{ status, headers, body }
function serverHandleRequest(path, ifNoneMatch) {
  const resource = serverStore[path];
  if (!resource) {
    return { status: 404, headers: {}, body: 'Not Found' };
  }

  const currentETag = generateETag(resource.content);

  // 协商缓存校验：如果客户端带了 If-None-Match 且与当前 ETag 一致
  if (ifNoneMatch && ifNoneMatch === currentETag) {
    return {
      status: 304,
      headers: {
        'ETag': currentETag,
        'Cache-Control': 'no-cache'  // 协商缓存
      },
      body: ''  // 304 不返回 body
    };
  }

  // 首次请求或资源已变：返回完整内容
  return {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Length': Buffer.byteLength(resource.content).toString(),
      'ETag': currentETag,
      'Last-Modified': resource.mtime.toUTCString(),
      'Cache-Control': 'no-cache'  // 每次都要协商
    },
    body: resource.content
  };
}

// ---- 2. 模拟浏览器端：缓存存储 + 请求决策 ----
const browserCache = {};

// 浏览器发起请求的模拟
function browserRequest(path) {
  const cached = browserCache[path];
  console.log('[浏览器] 请求 ' + path);

  if (cached) {
    // 有缓存，检查强缓存是否过期（Cache-Control: max-age）
    // 这里用 no-cache 策略，所以每次都要协商
    console.log('[浏览器] 本地有缓存，ETag=' + cached.etag + '，发送协商请求');
    const response = serverHandleRequest(path, cached.etag);

    if (response.status === 304) {
      console.log('[浏览器] 收到 304，资源未变，使用本地缓存');
      console.log('[浏览器] 命中协商缓存，body 字节数=' + Buffer.byteLength(cached.body));
      return { status: 304, body: cached.body, fromCache: true };
    } else {
      console.log('[浏览器] 收到 ' + response.status + '，资源已变，更新本地缓存');
      browserCache[path] = {
        etag: response.headers['ETag'],
        body: response.body,
        lastModified: response.headers['Last-Modified']
      };
      return { status: 200, body: response.body, fromCache: false };
    }
  } else {
    // 没有缓存，首次请求
    console.log('[浏览器] 本地无缓存，发送首次请求');
    const response = serverHandleRequest(path, null);
    console.log('[浏览器] 收到 ' + response.status + '，存入缓存');
    browserCache[path] = {
      etag: response.headers['ETag'],
      body: response.body,
      lastModified: response.headers['Last-Modified']
    };
    return { status: 200, body: response.body, fromCache: false };
  }
}

// ---- 3. 演示完整流程 ----
console.log('======== 第一次请求（首次访问，无缓存）========');
let r1 = browserRequest('/article.md');
console.log('  结果: status=' + r1.status + ', body长度=' + Buffer.byteLength(r1.body) + ', fromCache=' + r1.fromCache);
console.log('');

console.log('======== 第二次请求（资源未变，应命中协商缓存 304）========');
let r2 = browserRequest('/article.md');
console.log('  结果: status=' + r2.status + ', body长度=' + Buffer.byteLength(r2.body) + ', fromCache=' + r2.fromCache);
console.log('');

// ---- 4. 服务器端资源修改 ----
console.log('======== 服务器端资源被修改 ========');
serverStore['/article.md'].content = '# HTTP 缓存教程（已更新）\\n\\n内容有变化，新增了一段。\\n';
serverStore['/article.md'].mtime = new Date('2026-07-08T00:00:00Z');
console.log('  服务器上 /article.md 内容已更新，mtime 已更新');
console.log('');

console.log('======== 第三次请求（资源已变，应返回 200 + 新内容）========');
let r3 = browserRequest('/article.md');
console.log('  结果: status=' + r3.status + ', body长度=' + Buffer.byteLength(r3.body) + ', fromCache=' + r3.fromCache);
console.log('  新内容预览: ' + r3.body.substring(0, 30) + '...');
console.log('');

// ---- 5. 强缓存（max-age）演示 ----
console.log('======== 强缓存（Cache-Control: max-age）演示 ========');

// 模拟一个带 max-age 的资源
const staticResource = {
  content: 'console.log("app v1.0.0");',
  cacheControl: 'public, max-age=3600'  // 缓存 1 小时
};

// 模拟强缓存检查逻辑
function checkStrongCache(cachedAt, maxAge) {
  // cachedAt 是缓存写入时间戳（毫秒）
  // maxAge 是缓存有效期（秒）
  const now = Date.now();
  const elapsed = (now - cachedAt) / 1000;  // 经过秒数
  return elapsed < maxAge;
}

// 模拟浏览器存入强缓存
browserCache['/app.js'] = {
  body: staticResource.content,
  cachedAt: Date.now(),
  maxAge: 3600
};

console.log('  存入强缓存: /app.js, max-age=3600 秒');
console.log('  立即再次请求...');

// 强缓存有效期内，直接用本地，不发请求
const cached = browserCache['/app.js'];
if (checkStrongCache(cached.cachedAt, cached.maxAge)) {
  console.log('  ✅ 强缓存命中，直接使用本地副本（不发请求）');
  console.log('  body: ' + cached.body);
} else {
  console.log('  强缓存过期，走协商缓存');
}

// 模拟时间过去 2 小时
console.log('  模拟时间过去 2 小时...');
cached.cachedAt = Date.now() - 2 * 3600 * 1000;
if (checkStrongCache(cached.cachedAt, cached.maxAge)) {
  console.log('  强缓存命中');
} else {
  console.log('  ⏰ 强缓存已过期，需要走协商缓存（发请求带 If-None-Match）');
}

// ---- 6. ETag 生成对比 ----
console.log('');
console.log('======== ETag 生成演示 ========');
const content1 = 'Hello World';
const content2 = 'Hello World';  // 内容相同
const content3 = 'Hello world';  // 大小写不同

const etag1 = generateETag(content1);
const etag2 = generateETag(content2);
const etag3 = generateETag(content3);

console.log('  内容1: "' + content1 + '" → ETag=' + etag1);
console.log('  内容2: "' + content2 + '" → ETag=' + etag2);
console.log('  内容3: "' + content3 + '" → ETag=' + etag3);
console.log('  内容1 === 内容2 的 ETag: ' + (etag1 === etag2) + ' (相同内容生成相同ETag)');
console.log('  内容1 === 内容3 的 ETag: ' + (etag1 === etag3) + ' (差一个字符ETag完全不同)');

// 断言验证
assert.strictEqual(r1.status, 200);
assert.strictEqual(r2.status, 304);
assert.strictEqual(r3.status, 200);
assert.strictEqual(etag1, etag2);
assert.notStrictEqual(etag1, etag3);

console.log('');
console.log('✅ 所有断言通过！');
console.log('');
console.log('💡 关键点回顾：');
console.log('   1. 强缓存（max-age）命中时不发请求，直接用本地副本');
console.log('   2. 协商缓存（ETag/If-None-Match）发请求但不传 body（304）');
console.log('   3. ETag 是内容指纹，相同内容生成相同 ETag');
console.log('   4. no-cache 不是"不缓存"，是"每次用前协商"');
console.log('   5. no-store 才是真正的"不缓存"');
console.log('   6. ETag 优先级高于 Last-Modified');
`
  },

  // ============================================================
  // 第八章：Cookie、Session 与 Token
  // ============================================================
  {
    id: "http-08",
    group: "HTTP 进阶",
    icon: "🍪",
    title: "Cookie、Session 与 Token",
    content: `## 一、HTTP 的"无状态"难题

HTTP 是**无状态协议**——服务器处理完一个请求就忘了你是谁，每个请求都是独立的。这带来一个问题：登录后访问下一个页面，服务器怎么知道"还是你"？

为了在无状态的 HTTP 上维持状态，业界发明了三大方案：**Cookie + Session**、**Token**、**JWT**。它们不是非此即彼，而是演进关系。

## 二、Cookie：浏览器端的"小纸条"

Cookie 是服务器通过响应头 \`Set-Cookie\` 写入浏览器的小段数据，浏览器后续请求自动通过 \`Cookie\` 头带回去。它就像服务器塞给浏览器一张小纸条，下次见面时浏览器自动亮出来。

### 2.1 Cookie 的生命周期

\`\`\`text
服务器响应：
  Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Max-Age=3600; Secure; SameSite=Lax

浏览器存储：
  { name: sessionId, value: abc123, domain: ..., path: /, expires: ..., ... }

浏览器后续请求（匹配 domain/path 的）：
  Cookie: sessionId=abc123
\`\`\`

### 2.2 Cookie 的核心属性

| 属性 | 作用 | 示例 |
|------|------|------|
| \`Name=Value\` | 键值对，必须 | \`sessionId=abc123\` |
| \`Domain\` | 生效域名（含子域） | \`Domain=.example.com\` 对所有子域生效 |
| \`Path\` | 生效路径 | \`Path=/api\` 只在 /api 下发送 |
| \`Expires\` | 绝对过期时间 | \`Expires=Wed, 08 Jul 2026 00:00:00 GMT\` |
| \`Max-Age\` | 相对存活秒数 | \`Max-Age=3600\`（1小时） |
| \`HttpOnly\` | 禁止 JS 读取 | 防 XSS 偷 Cookie |
| \`Secure\` | 只在 HTTPS 下发送 | 防中间人窃听 |
| \`SameSite\` | 跨站发送策略 | \`Strict\`/\`Lax\`/\`None\`，防 CSRF |

### 2.3 SameSite 三档（防 CSRF 关键）

- \`Strict\`：完全不带。从别的站点点链接过来都不带 Cookie（最安全但体验差）。
- \`Lax\`（浏览器默认）：顶层导航的 GET 请求带，其他不带（平衡安全和体验）。
- \`None\`：跨站都带，但必须配合 \`Secure\`（仅 HTTPS）。

CSRF 攻击原理：恶意网站诱导用户访问 \`bank.com/transfer?to=hacker&amount=1000\`，浏览器会自动带上 \`bank.com\` 的 Cookie，服务器以为是用户本人操作。SameSite=Lax 能挡住这种跨站 POST。

### 2.4 HttpOnly 的意义

\`HttpOnly\` 让 JS 的 \`document.cookie\` 读不到这个 Cookie，只能由浏览器自动发送。这样即使页面被 XSS 注入恶意脚本，也偷不到 \`sessionId\` Cookie。**所有会话 Cookie 必须加 HttpOnly**。

### 2.5 Cookie 的限制

- 单个 Cookie 大小限制 4KB。
- 单个域名 Cookie 数量限制（通常 50 个）。
- Cookie 每次请求都带上，会占带宽，不要存大块数据。

## 三、Session：服务器端的状态

Cookie 把状态存在浏览器有个问题：用户能改 Cookie 值。如果把"用户ID=42"直接存 Cookie，用户改成"用户ID=1"就变管理员了。

**Session 方案**：服务器存一个 \`sessionId → 用户信息\` 的映射，浏览器只存 \`sessionId\`。sessionId 是个随机串，用户改了就失效，无法伪造用户身份。

\`\`\`text
浏览器                          服务器（Session 存储）
  │                                │
  │  1. 登录 user=zhang, pwd=***   │
  │ ─────────────────────────────→ │
  │                                │  2. 校验通过，生成 sessionId=abc123
  │                                │     存入：sessions['abc123'] = {userId: 42, ...}
  │  3. Set-Cookie: sessionId=abc123
  │ ←───────────────────────────── │
  │                                │
  │  4. 后续请求带 Cookie: sessionId=abc123
  │ ─────────────────────────────→ │
  │                                │  5. 查 sessions['abc123'] → 找到用户 42
  │  6. 返回用户 42 的数据         │
  │ ←───────────────────────────── │
\`\`\`

**Session 的问题**：

1. **服务器要存状态**：内存/Redis 都行，但分布式部署时需要共享 Session（ sticky session 或 Redis 集中存）。
2. **横向扩展难**：加机器要考虑 Session 同步。
3. **CORS 麻烦**：跨域请求要处理 Cookie 跨域（\`credentials: 'include'\` + \`Access-Control-Allow-Credentials\`）。

## 四、Token：无状态的解决方案

**Token 方案**：登录后服务器发一个 Token（签名过的字符串），客户端存起来（Cookie 或 localStorage），每次请求带在 \`Authorization\` 头里。服务器**不存 Token**，靠签名验证真伪。

\`\`\`text
浏览器                            服务器
  │                                  │
  │  1. 登录 user=zhang, pwd=***     │
  │ ───────────────────────────────→ │
  │                                  │  2. 校验通过，生成 Token = base64(payload) + HMAC(payload, secret)
  │  3. 返回 Token                   │     （不存 Token，只存 secret）
  │ ←─────────────────────────────── │
  │                                  │
  │  4. 后续请求 Authorization: Bearer <token>
  │ ───────────────────────────────→ │
  │                                  │  5. 用 secret 验签，通过则信任 payload
  │  6. 返回数据                     │
  │ ←─────────────────────────────── │
\`\`\`

**Token 优势**：

1. **无状态**：服务器不用存 Session，扩展性好。
2. **跨域友好**：放 Authorization 头，不受 Cookie 跨域限制。
3. **移动端友好**：App 没有 Cookie 概念，Token 天然适配。
4. **防 CSRF**：不依赖 Cookie，攻击者诱导请求也带不上 Token。

**Token 劣势**：

1. **无法主动失效**：签发出去的 Token 在过期前一直有效，服务器很难"撤销"它（要靠黑名单，又回到有状态）。
2. **续期麻烦**：要么用 refresh token，要么每次请求刷新。
3. **存储位置争议**：放 localStorage 易被 XSS 偷，放 Cookie 又回到老问题。

## 五、JWT：Token 的事实标准

JWT（JSON Web Token）是 Token 的标准化格式，由三部分组成：\`Header.Payload.Signature\`，用 \`.\` 连接。

\`\`\`text
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsImV4cCI6MTcyMDAwMDAwMH0.signature
└────── Header ──────┘└────────── Payload ──────────────────┘└─ Signature ─┘
\`\`\`

### 5.1 三部分详解

**Header**（头部，base64url 编码的 JSON）：
\`\`\`json
{ "alg": "HS256", "typ": "JWT" }
\`\`\`
说明签名算法（HS256 = HMAC-SHA256）。

**Payload**（载荷，base64url 编码的 JSON）：
\`\`\`json
{ "sub": "42", "name": "zhangsan", "exp": 1720000000, "iat": 1719900000 }
\`\`\`
存放声明（claims）。标准声明有 \`iss\`（签发者）、\`sub\`（主体）、\`exp\`（过期）、\`iat\`（签发时间）等。**Payload 只是 base64 编码，不是加密，不要放敏感信息！**

**Signature**（签名）：
\`\`\`text
HMAC-SHA256(base64url(Header) + "." + base64url(Payload), secret)
\`\`\`
用服务器密钥对前两部分签名，防止篡改。

### 5.2 JWT 验证流程

1. 收到 Token，按 \`.\` 分成三段。
2. 重新计算 \`HMAC-SHA256(header.payload, secret)\`，与第三段比对。
3. 签名一致 → 没被篡改，信任 payload。
4. 检查 \`exp\` 是否过期。

### 5.3 JWT 的关键认知

- **JWT 不是加密**：Payload 是 base64 编码，任何人能解出内容。JWT 解决的是"防篡改"，不是"防偷看"。
- **secret 是命脉**：泄露了 secret 就能伪造任意用户身份。
- **不要存敏感信息**：密码、身份证号不要放 Payload。

## 六、三套方案对比

| 维度 | Cookie+Session | Token | JWT |
|------|----------------|-------|-----|
| 状态存储 | 服务器存 | 服务器不存 | 服务器不存 |
| 失效控制 | 主动删 Session 即可 | 需黑名单 | 需黑名单 |
| 跨域 | 麻烦 | 友好 | 友好 |
| 移动端 | 不友好 | 友好 | 友好 |
| 防 CSRF | 依赖 SameSite | 天然防 | 天然防 |
| 防 XSS 偷 | HttpOnly 可防 | localStorage 易被偷 | 同左 |
| 大小 | sessionId 很小 | 中等 | 较大（含 payload） |
| 标准化 | 自定义 | 自定义 | RFC 7519 标准 |

实践中常见组合：**JWT + HttpOnly Cookie**（兼顾无状态和防 XSS），或 **Session + Redis**（需要主动失效的场景）。

---

## 七、本节代码演示

下面演示三件事：1）解析 Cookie 头并应用属性；2）从零实现一个 JWT 的签发与验签（用 \`crypto\` 的 HMAC-SHA256）；3）模拟一个完整的"登录→带 Token 访问→校验"流程。
`,
    code: `// ============================================
// 第八章演示：Cookie 解析 + JWT 签发与验证
// --------------------------------------------
// 用到的模块：
//   crypto - HMAC-SHA256 签名
//   buffer - base64url 编解码
// 演示内容：
//   1. 解析 Cookie 头字符串
//   2. 解析 Set-Cookie 的属性
//   3. 从零实现 JWT 签发与验证（HS256）
//   4. 模拟登录 → 带 Token 访问 → 服务器校验
// ============================================

const crypto = require('crypto');
const assert = require('assert');

// ============================================================
// 第一部分：Cookie 解析
// ============================================================
console.log('======== 第一部分：Cookie 解析 ========');

// 模拟浏览器发来的 Cookie 头
const cookieHeader = 'sessionId=abc123; theme=dark; lang=zh-CN; cart=3';

// 解析 Cookie 头为对象
function parseCookieHeader(header) {
  const cookies = {};
  header.split(';').forEach(function (pair) {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      const key = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      cookies[key] = value;
    }
  });
  return cookies;
}

const cookies = parseCookieHeader(cookieHeader);
console.log('原始 Cookie 头: ' + cookieHeader);
console.log('解析结果: ' + JSON.stringify(cookies));
console.log('  sessionId = ' + cookies.sessionId);
console.log('  theme     = ' + cookies.theme);
console.log('  cart      = ' + cookies.cart);
console.log('');

// 解析 Set-Cookie 响应头的属性
console.log('-------- 解析 Set-Cookie 属性 --------');
const setCookieStr = 'sessionId=abc123; Path=/; Domain=.example.com; Max-Age=3600; HttpOnly; Secure; SameSite=Lax';

function parseSetCookie(header) {
  const parts = header.split(';');
  // 第一段是 name=value
  const firstPair = parts[0].trim();
  const eqIdx = firstPair.indexOf('=');
  const name = firstPair.slice(0, eqIdx);
  const value = firstPair.slice(eqIdx + 1);

  const attrs = { name: name, value: value };
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    const idx = part.indexOf('=');
    if (idx === -1) {
      // 布尔属性：HttpOnly、Secure
      attrs[part.toLowerCase()] = true;
    } else {
      const k = part.slice(0, idx).trim().toLowerCase();
      const v = part.slice(idx + 1).trim();
      attrs[k] = v;
    }
  }
  return attrs;
}

const cookieAttrs = parseSetCookie(setCookieStr);
console.log('Set-Cookie: ' + setCookieStr);
console.log('解析结果:');
console.log('  name     : ' + cookieAttrs.name);
console.log('  value    : ' + cookieAttrs.value);
console.log('  path     : ' + cookieAttrs.path);
console.log('  domain   : ' + cookieAttrs.domain);
console.log('  max-age  : ' + cookieAttrs['max-age']);
console.log('  httponly : ' + cookieAttrs.httponly + ' (JS读不到，防XSS)');
console.log('  secure   : ' + cookieAttrs.secure + ' (仅HTTPS发送)');
console.log('  samesite : ' + cookieAttrs.samesite + ' (防CSRF)');
console.log('');

// ============================================================
// 第二部分：从零实现 JWT（HS256）
// ============================================================
console.log('======== 第二部分：JWT 签发与验证 ========');

// 服务器密钥（绝对不能泄露）
const SECRET = 'my-super-secret-key-do-not-leak';

// base64url 编码（JWT 用的变体 base64）
function base64urlEncode(input) {
  // input 可以是字符串或 Buffer
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  // 先 base64，再把 + 换成 -，/ 换成 _，去掉 = 填充
  return buf.toString('base64')
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
}

// base64url 解码
function base64urlDecode(str) {
  // 还原标准 base64
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  // 补齐填充
  while (s.length % 4 !== 0) {
    s += '=';
  }
  return Buffer.from(s, 'base64');
}

// 签发 JWT
function signJWT(payload, secret) {
  // Header: 算法 + 类型
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));

  // 签名内容 = header.payload
  const signingInput = headerB64 + '.' + payloadB64;
  // HMAC-SHA256
  const signature = crypto.createHmac('sha256', secret).update(signingInput).digest();
  const sigB64 = base64urlEncode(signature);

  // 完整 JWT
  return headerB64 + '.' + payloadB64 + '.' + sigB64;
}

// 验证 JWT
function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: '格式错误：JWT 必须是三段' };
  }
  const headerB64 = parts[0];
  const payloadB64 = parts[1];
  const sigB64 = parts[2];

  // 重新计算签名
  const signingInput = headerB64 + '.' + payloadB64;
  const expectedSig = crypto.createHmac('sha256', secret).update(signingInput).digest();
  const expectedSigB64 = base64urlEncode(expectedSig);

  // 用 timingSafeEqual 防止时序攻击
  let sigMatch = false;
  try {
    const a = Buffer.from(sigB64);
    const b = Buffer.from(expectedSigB64);
    if (a.length === b.length) {
      sigMatch = crypto.timingSafeEqual(a, b);
    }
  } catch (e) {
    sigMatch = false;
  }

  if (!sigMatch) {
    return { valid: false, reason: '签名不匹配' };
  }

  // 解析 payload
  const payload = JSON.parse(base64urlDecode(payloadB64).toString('utf8'));

  // 检查过期时间
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return { valid: false, reason: 'Token 已过期', payload: payload };
  }

  return { valid: true, payload: payload };
}

// ---- 签发一个 JWT ----
const now = Math.floor(Date.now() / 1000);
const payload = {
  sub: '42',                  // 用户ID
  name: 'zhangsan',           // 用户名
  role: 'admin',              // 角色
  iat: now,                   // 签发时间
  exp: now + 3600             // 过期时间（1小时后）
};

const token = signJWT(payload, SECRET);
console.log('签发的 JWT:');
console.log('  ' + token);
console.log('');

// 拆解 JWT 三部分展示
const tokenParts = token.split('.');
console.log('JWT 拆解：');
console.log('  Header    : ' + JSON.stringify(JSON.parse(base64urlDecode(tokenParts[0]).toString())));
console.log('  Payload   : ' + JSON.stringify(JSON.parse(base64urlDecode(tokenParts[1]).toString())));
console.log('  Signature : ' + tokenParts[2]);
console.log('');

// ---- 验证正确的 Token ----
console.log('-------- 验证正确的 Token --------');
const verifyResult = verifyJWT(token, SECRET);
console.log('  验证结果: valid=' + verifyResult.valid);
console.log('  payload : ' + JSON.stringify(verifyResult.payload));
console.log('');

// ---- 验证被篡改的 Token ----
console.log('-------- 验证被篡改的 Token --------');
// 篡改 payload（把 role 改成 superadmin）
const tamperedPayloadB64 = base64urlEncode(JSON.stringify({ sub: '42', name: 'zhangsan', role: 'superadmin', iat: now, exp: now + 3600 }));
const tamperedToken = tokenParts[0] + '.' + tamperedPayloadB64 + '.' + tokenParts[2];
console.log('  篡改后的 Token: ' + tamperedToken);
const tamperedResult = verifyJWT(tamperedToken, SECRET);
console.log('  验证结果: valid=' + tamperedResult.valid + ', reason=' + tamperedResult.reason);
console.log('  (签名不匹配，因为 payload 改了但签名没重算)');
console.log('');

// ---- 验证用错误密钥签的 Token ----
console.log('-------- 验证错误密钥的 Token --------');
const wrongKeyToken = signJWT(payload, 'wrong-secret');
const wrongKeyResult = verifyJWT(wrongKeyToken, SECRET);
console.log('  验证结果: valid=' + wrongKeyResult.valid + ', reason=' + wrongKeyResult.reason);
console.log('');

// ---- 验证过期的 Token ----
console.log('-------- 验证过期的 Token --------');
const expiredPayload = { sub: '42', name: 'zhangsan', iat: now - 7200, exp: now - 3600 };  // 1小时前过期
const expiredToken = signJWT(expiredPayload, SECRET);
const expiredResult = verifyJWT(expiredToken, SECRET);
console.log('  验证结果: valid=' + expiredResult.valid + ', reason=' + expiredResult.reason);
console.log('');

// ============================================================
// 第三部分：模拟登录 + 鉴权流程
// ============================================================
console.log('======== 第三部分：登录与鉴权模拟 ========');

// 模拟用户数据库
const userDB = {
  zhangsan: { id: '42', password: 'hashed_pwd_123', role: 'admin' }
};

// 模拟登录接口
function login(username, password) {
  console.log('[客户端] 登录: username=' + username);
  const user = userDB[username];
  if (!user || user.password !== password) {
    console.log('[服务器] 登录失败');
    return null;
  }
  // 签发 JWT
  const loginNow = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    sub: user.id,
    name: username,
    role: user.role,
    iat: loginNow,
    exp: loginNow + 3600
  };
  const jwt = signJWT(tokenPayload, SECRET);
  console.log('[服务器] 登录成功，签发 JWT');
  return jwt;
}

// 模拟受保护的接口
function protectedApi(authHeader) {
  console.log('[客户端] 请求受保护接口，Authorization: ' + (authHeader ? 'Bearer ...' : '(无)'));
  if (!authHeader || authHeader.indexOf('Bearer ') !== 0) {
    return { status: 401, message: '未提供 Token' };
  }
  const jwt = authHeader.slice(7);  // 去掉 'Bearer '
  const result = verifyJWT(jwt, SECRET);
  if (!result.valid) {
    return { status: 401, message: 'Token 无效: ' + result.reason };
  }
  // 鉴权通过，返回用户数据
  return {
    status: 200,
    message: '欢迎 ' + result.payload.name + '（角色: ' + result.payload.role + '）',
    user: result.payload
  };
}

// 执行登录
console.log('');
console.log('--- 步骤1: 用户登录 ---');
const userToken = login('zhangsan', 'hashed_pwd_123');
console.log('  获得 Token: ' + (userToken ? userToken.substring(0, 40) + '...' : 'null'));

// 用 Token 访问受保护接口
console.log('');
console.log('--- 步骤2: 带 Token 访问接口 ---');
const authHeader = 'Bearer ' + userToken;
const apiResult = protectedApi(authHeader);
console.log('[服务器] 响应: status=' + apiResult.status + ', message=' + apiResult.message);

// 不带 Token 访问
console.log('');
console.log('--- 步骤3: 不带 Token 访问（应 401）---');
const noTokenResult = protectedApi(null);
console.log('[服务器] 响应: status=' + noTokenResult.status + ', message=' + noTokenResult.message);

// 带篡改 Token 访问
console.log('');
console.log('--- 步骤4: 带篡改 Token 访问（应 401）---');
const badTokenResult = protectedApi('Bearer ' + tamperedToken);
console.log('[服务器] 响应: status=' + badTokenResult.status + ', message=' + badTokenResult.message);

// ---- 断言 ----
assert.strictEqual(verifyResult.valid, true);
assert.strictEqual(tamperedResult.valid, false);
assert.strictEqual(wrongKeyResult.valid, false);
assert.strictEqual(expiredResult.valid, false);
assert.strictEqual(apiResult.status, 200);
assert.strictEqual(noTokenResult.status, 401);
assert.strictEqual(badTokenResult.status, 401);

console.log('');
console.log('✅ 所有断言通过！');
console.log('');
console.log('💡 关键点回顾：');
console.log('   1. Cookie 是浏览器存的小数据，自动随请求带回去');
console.log('   2. HttpOnly 防 XSS 偷 Cookie，SameSite 防 CSRF');
console.log('   3. Session 把状态存服务器，sessionId 存浏览器');
console.log('   4. JWT = Header.Payload.Signature，用 HMAC 防篡改');
console.log('   5. JWT 的 Payload 是 base64 编码，不是加密，别放敏感信息');
console.log('   6. 验签要用 timingSafeEqual 防时序攻击');
console.log('   7. JWT 无法主动失效，需配合黑名单或短有效期 + refresh token');
`
  },

  // ============================================================
  // 第九章：HTTP 内容协商与压缩
  // ============================================================
  {
    id: "http-09",
    group: "HTTP 进阶",
    icon: "📦",
    title: "HTTP 内容协商与压缩",
    content: `## 一、内容协商：一个资源，多种表示

同一份资源可以有多种表示形式：HTML / JSON / XML、中文 / 英文、gzip / br 压缩。客户端告诉服务器"我想要什么形式"，服务器据此挑选最合适的返回——这就是**内容协商（Content Negotiation）**。

比如访问 GitHub API：

\`\`\`text
请求：
  Accept: application/json
  Accept-Language: en
  Accept-Encoding: gzip

响应：
  Content-Type: application/json; charset=utf-8
  Content-Language: en
  Content-Encoding: gzip
\`\`\`

服务器根据三个 Accept 头，分别决定返回的格式、语言、压缩方式。

## 二、三种协商方式

### 2.1 服务端驱动协商（主流）

客户端发 Accept 系列头，服务器自己挑。这是 HTTP 默认方式。

**四个 Accept 头的对应关系**：

| 请求头 | 响应头 | 协商内容 |
|--------|--------|----------|
| \`Accept\` | \`Content-Type\` | 媒体类型（MIME） |
| \`Accept-Encoding\` | \`Content-Encoding\` | 压缩算法 |
| \`Accept-Language\` | \`Content-Language\` | 语言 |
| （无标准头） | \`Content-Charset\` | 字符集（实践中用 Content-Type 的 charset） |

### 2.2 客户端驱动协商

服务器返回可选列表，客户端再选一个请求。比如 HTTP 300 Multiple Choices 响应。实际很少用。

### 2.3 透明协商

中间代理缓存做协商。复杂，实践中少见。

## 三、Accept 头的语法与权重

所有 Accept 头的语法类似：\`类型;q=权重, 类型;q=权重\`。

\`\`\`text
Accept: text/html, application/json;q=0.9, */*;q=0.1
\`\`\`

- \`text/html\`：q 默认 1.0（最高优先）。
- \`application/json;q=0.9\`：q=0.9。
- \`*/*;q=0.1\`：通配，q=0.1（最低，兜底）。

服务器按 q 值降序，挑第一个自己能提供的类型。

### 3.1 Accept（媒体类型）

\`\`\`text
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
\`\`\`

浏览器发这个头，表示"最想要 HTML，其次 XHTML，再其次 XML，能接受 webp 图片，实在不行啥都行"。

API 客户端通常发 \`Accept: application/json\`。

### 3.2 Accept-Encoding（压缩算法）

\`\`\`text
Accept-Encoding: gzip, deflate, br, zstd;q=0.9, identity;q=0
\`\`\`

- \`gzip\`：最通用的压缩算法（基于 DEFLATE）。
- \`deflate\`：DEFLATE 流（实际很少用，历史包袱）。
- \`br\`：Brotli，Google 推出，比 gzip 压缩率高 15-25%，仅 HTTPS。
- \`zstd\`：Zstandard，Facebook 推出，新秀，压缩率和速度都优秀。
- \`identity\`：不压缩。

服务器选一个自己支持的，通过 \`Content-Encoding\` 响应头告诉客户端用了哪种。

### 3.3 Accept-Language（语言）

\`\`\`text
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
\`\`\`

服务器据此返回对应语言版本。匹配规则：精确匹配 > 前缀匹配 > 通配。

## 四、内容协商的过程

服务器收到请求后：

1. 解析所有 Accept 头，得到客户端的偏好列表（带 q 值）。
2. 计算服务器能提供的表示形式列表。
3. 按 q 值降序，挑第一个客户端能接受且服务器能提供的。
4. 都不匹配 → 返回 406 Not Acceptable（实践中很多服务器直接返回默认格式而不报 406）。

\`\`\`text
客户端 Accept:                   服务器有：
  text/html      q=1.0           text/html     ✓ 选这个（q最高且匹配）
  application/json q=0.9         application/json
  */*            q=0.1
\`\`\`

## 五、压缩：省带宽的关键技术

HTTP 响应体如果是文本（HTML/CSS/JS/JSON），压缩能减少 70% 体积，是性能优化的必选项。

### 5.1 为什么要压缩

- **HTML/CSS/JS** 是文本，重复字符多，压缩率极高（70-90%）。
- **图片/视频** 已经是压缩格式（JPEG/PNG/WebP/MP4），再压缩几乎无效甚至变大。
- 压缩消耗 CPU，但带宽通常更贵，所以**文本必压，二进制不压**。

### 5.2 压缩算法对比

| 算法 | 压缩率 | 速度 | 兼容性 | 场景 |
|------|--------|------|--------|------|
| gzip | 中 | 快 | 全平台 | 通用，文本压缩主力 |
| deflate | 中 | 快 | 全平台 | 实际很少单独用 |
| br (Brotli) | 高（比 gzip 高 15-25%） | 中 | 现代浏览器 | 静态资源（仅 HTTPS） |
| zstd | 高 | 极快 | 较新 | 新场景，HTTP 已支持 |

### 5.3 压缩的代价

1. **CPU 开销**：服务器压缩、客户端解压都耗 CPU。
2. **小文件别压**：< 1KB 的文件压缩后可能更大（gzip 头开销）。
3. **已压缩文件别再压**：JPEG/PNG/MP4 压缩无收益。
4. **动态内容压缩**：每次响应都要实时压缩，CPU 开销大；静态资源可预先压缩存盘。

### 5.4 动态压缩 vs 静态预压缩

- **动态压缩**：Nginx \`gzip on\` 实时压，简单但耗 CPU。
- **静态预压缩**：构建时生成 \`app.js.gz\` 和 \`app.js.br\`，Nginx 直接发预压缩文件（\`gzip_static on\`、\`brotli_static on\`），零 CPU 开销。

## 六、内容协商实战配置

### 6.1 Nginx 配置 gzip

\`\`\`nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
gzip_comp_level 6;
\`\`\`

### 6.2 服务端选择压缩算法的逻辑

\`\`\`text
1. 请求带 Accept-Encoding: br, gzip, deflate
2. 服务器支持 br 和 gzip
3. 按 q 值（或服务器偏好）选 br
4. 响应 Content-Encoding: br
5. 客户端用 br 解压
\`\`\`

## 七、内容协商的陷阱

1. **Vary 头**：如果响应内容取决于某个请求头，必须用 \`Vary\` 告诉缓存"按这个头分别缓存"。比如 \`Vary: Accept-Encoding\` 表示不同压缩算法要分别缓存，否则给只支持 gzip 的客户端返回 br 缓存就炸了。
2. **Accept 头太宽**：\`*/*\` 兜底要谨慎，可能返回非预期格式。
3. **压缩炸弹**：恶意构造的高压缩率文件，解压后撑爆内存。服务器要限制压缩后大小。

---

## 八、本节代码演示

下面演示：1）解析 Accept 头并按 q 值挑选；2）用 \`zlib\` 模块对文本做 gzip/deflate 压缩并对比体积；3）模拟完整的内容协商流程——根据客户端 Accept-Encoding 选压缩算法，返回带 Content-Encoding 的响应。
`,
    code: `// ============================================
// 第九章演示：内容协商与压缩
// --------------------------------------------
// 用到的模块：
//   zlib      - gzip/deflate 压缩解压
//   buffer    - 处理二进制数据
// 演示内容：
//   1. 解析 Accept 头并按 q 值挑选
//   2. 用 zlib 压缩文本，对比 gzip/deflate 体积
//   3. 模拟服务端根据 Accept-Encoding 选压缩算法
//   4. 模拟客户端解压响应
// ============================================

const zlib = require('zlib');
const assert = require('assert');

// ============================================================
// 第一部分：解析 Accept 头并按 q 值挑选
// ============================================================
console.log('======== 第一部分：Accept 头解析与协商 ========');

// 解析 Accept 系列头，返回按 q 降序排列的列表
function parseAcceptHeader(header) {
  if (!header) return [];
  return header.split(',').map(function (item) {
    const parts = item.trim().split(';');
    const value = parts[0].trim();
    let q = 1.0;
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i].trim();
      if (p.indexOf('q=') === 0) {
        q = parseFloat(p.slice(2));
      }
    }
    return { value: value, q: q };
  }).sort(function (a, b) {
    return b.q - a.q;  // 降序
  });
}

// 协商：从客户端偏好列表和服务器支持列表中选最优
function negotiate(acceptList, serverSupported) {
  for (let i = 0; i < acceptList.length; i++) {
    const item = acceptList[i];
    if (item.q === 0) continue;  // q=0 表示完全拒绝
    // 精确匹配
    if (serverSupported.indexOf(item.value) !== -1) {
      return item.value;
    }
    // 通配匹配（*/* 或 type/*）
    if (item.value === '*/*') {
      return serverSupported[0];  // 返回服务器最优先的
    }
    if (item.value.indexOf('/*') !== -1) {
      const prefix = item.value.slice(0, -1);  // 'text/*' → 'text/'
      for (let j = 0; j < serverSupported.length; j++) {
        if (serverSupported[j].indexOf(prefix) === 0) {
          return serverSupported[j];
        }
      }
    }
  }
  return null;  // 协商失败
}

// ---- 演示媒体类型协商 ----
const acceptStr = 'text/html, application/json;q=0.9, */*;q=0.1';
const acceptList = parseAcceptHeader(acceptStr);
console.log('客户端 Accept: ' + acceptStr);
console.log('解析（按q降序）:');
acceptList.forEach(function (item) {
  console.log('  ' + item.value + ' (q=' + item.q + ')');
});

const serverTypes = ['application/json', 'application/xml'];
const chosen = negotiate(acceptList, serverTypes);
console.log('服务器支持: ' + JSON.stringify(serverTypes));
console.log('协商结果: ' + chosen + ' (text/html 服务器没有，退而求其次选 json)');
console.log('');

// ---- 演示语言协商 ----
const langStr = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7';
const langList = parseAcceptHeader(langStr);
const serverLangs = ['en-US', 'fr-FR'];
const chosenLang = negotiate(langList, serverLangs);
console.log('客户端 Accept-Language: ' + langStr);
console.log('服务器支持: ' + JSON.stringify(serverLangs));
console.log('协商结果: ' + chosenLang + ' (没有中文，退到 en-US)');
console.log('');

// ============================================================
// 第二部分：用 zlib 压缩文本，对比体积
// ============================================================
console.log('======== 第二部分：压缩算法对比 ========');

// 构造一段典型的 HTML 文本（重复内容多，压缩率高）
const htmlContent = [
  '<!DOCTYPE html>',
  '<html lang="zh-CN">',
  '<head><meta charset="UTF-8"><title>HTTP 教程</title></head>',
  '<body>'
];
for (let i = 0; i < 50; i++) {
  htmlContent.push('<div class="item item-' + i + '">这是第 ' + i + ' 行内容，重复的标签和样式会让压缩率很高。</div>');
}
htmlContent.push('</body></html>');
const originalText = htmlContent.join('\\n');

const originalBuffer = Buffer.from(originalText, 'utf8');
console.log('原始 HTML 大小: ' + originalBuffer.length + ' 字节');
console.log('内容预览: ' + originalText.substring(0, 60) + '...');
console.log('');

// ---- gzip 压缩 ----
const gzipBuffer = zlib.gzipSync(originalBuffer, { level: 6 });
console.log('gzip 压缩后: ' + gzipBuffer.length + ' 字节' +
  ' (压缩率 ' + ((1 - gzipBuffer.length / originalBuffer.length) * 100).toFixed(1) + '%)');

// ---- deflate 压缩 ----
const deflateBuffer = zlib.deflateSync(originalBuffer, { level: 6 });
console.log('deflate 压缩后: ' + deflateBuffer.length + ' 字节' +
  ' (压缩率 ' + ((1 - deflateBuffer.length / originalBuffer.length) * 100).toFixed(1) + '%)');

// ---- 不同压缩级别对比 ----
console.log('');
console.log('-------- gzip 不同压缩级别对比 --------');
[1, 3, 6, 9].forEach(function (level) {
  const buf = zlib.gzipSync(originalBuffer, { level: level });
  console.log('  level=' + level + ': ' + buf.length + ' 字节');
});
console.log('  (级别越高压缩越小，但越耗 CPU)');

// ---- 解压验证 ----
console.log('');
console.log('-------- 解压验证 --------');
const decompressed = zlib.gunzipSync(gzipBuffer).toString('utf8');
console.log('gzip 解压后大小: ' + Buffer.byteLength(decompressed) + ' 字节');
console.log('解压内容与原文一致: ' + (decompressed === originalText));

// ============================================================
// 第三部分：模拟完整的内容协商流程
// ============================================================
console.log('');
console.log('======== 第三部分：内容协商 + 压缩 完整模拟 ========');

// 模拟服务器：根据请求头选压缩算法并返回响应
function serverRespond(request, resource) {
  // 1. 协商压缩算法
  const acceptEncoding = request['Accept-Encoding'] || '';
  const encodingList = parseAcceptHeader(acceptEncoding);
  // 服务器支持的压缩算法（按服务器偏好排序）
  const serverEncodings = ['gzip', 'deflate'];

  let chosenEncoding = negotiate(encodingList, serverEncodings);
  // identity 表示不压缩
  if (!chosenEncoding) {
    chosenEncoding = 'identity';
  }

  // 2. 协商媒体类型
  const accept = request['Accept'] || '';
  const typeList = parseAcceptHeader(accept);
  const serverTypes = ['text/html', 'application/json'];
  const chosenType = negotiate(typeList, serverTypes) || 'text/html';

  // 3. 准备响应体
  let body;
  if (chosenType === 'application/json') {
    body = JSON.stringify({ title: 'HTTP 教程', content: resource });
  } else {
    body = resource;
  }
  let bodyBuffer = Buffer.from(body, 'utf8');
  const originalSize = bodyBuffer.length;

  // 4. 压缩
  const headers = {
    'Content-Type': chosenType + '; charset=utf-8'
  };
  if (chosenEncoding === 'gzip') {
    bodyBuffer = zlib.gzipSync(bodyBuffer);
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';  // 告诉缓存按 Accept-Encoding 分别缓存
  } else if (chosenEncoding === 'deflate') {
    bodyBuffer = zlib.deflateSync(bodyBuffer);
    headers['Content-Encoding'] = 'deflate';
    headers['Vary'] = 'Accept-Encoding';
  }
  headers['Content-Length'] = bodyBuffer.length.toString();

  return {
    status: 200,
    headers: headers,
    body: bodyBuffer,
    originalSize: originalSize
  };
}

// 模拟客户端：发送请求 + 解压响应
function clientRequest(requestHeaders, response) {
  console.log('[客户端] 发送请求:');
  Object.keys(requestHeaders).forEach(function (k) {
    console.log('  ' + k + ': ' + requestHeaders[k]);
  });
  console.log('[服务器] 返回响应:');
  console.log('  status: ' + response.status);
  Object.keys(response.headers).forEach(function (k) {
    console.log('  ' + k + ': ' + response.headers[k]);
  });

  // 客户端根据 Content-Encoding 解压
  const encoding = response.headers['Content-Encoding'];
  let body = response.body;
  if (encoding === 'gzip') {
    body = zlib.gunzipSync(body);
    console.log('[客户端] 检测到 Content-Encoding: gzip，执行解压');
  } else if (encoding === 'deflate') {
    body = zlib.inflateSync(body);
    console.log('[客户端] 检测到 Content-Encoding: deflate，执行解压');
  }
  const text = body.toString('utf8');
  console.log('[客户端] 解压后大小: ' + body.length + ' 字节');
  console.log('[客户端] 内容预览: ' + text.substring(0, 50) + '...');
  return text;
}

const resource = '<html><body><h1>HTTP 内容协商教程</h1><p>这是一段用于演示压缩的 HTML 内容。</p></body></html>';

// ---- 场景1：客户端支持 gzip ----
console.log('');
console.log('--- 场景1: 客户端支持 gzip ---');
const req1 = {
  'Accept': 'text/html, application/json;q=0.9',
  'Accept-Encoding': 'gzip, deflate'
};
const resp1 = serverRespond(req1, resource);
console.log('[服务器] 原始大小=' + resp1.originalSize + ', 压缩后=' + resp1.body.length + ' 字节');
clientRequest(req1, resp1);

// ---- 场景2：客户端只支持 deflate ----
console.log('');
console.log('--- 场景2: 客户端只支持 deflate ---');
const req2 = {
  'Accept': 'application/json',
  'Accept-Encoding': 'deflate'
};
const resp2 = serverRespond(req2, resource);
console.log('[服务器] 原始大小=' + resp2.originalSize + ', 压缩后=' + resp2.body.length + ' 字节');
clientRequest(req2, resp2);

// ---- 场景3：客户端不支持压缩 ----
console.log('');
console.log('--- 场景3: 客户端不支持压缩（identity）---');
const req3 = {
  'Accept': 'text/html',
  'Accept-Encoding': 'identity'
};
const resp3 = serverRespond(req3, resource);
console.log('[服务器] 原始大小=' + resp3.originalSize + ', 响应大小=' + resp3.body.length + ' 字节 (未压缩)');
clientRequest(req3, resp3);

// ---- 场景4：客户端想要 JSON ----
console.log('');
console.log('--- 场景4: 客户端想要 JSON + gzip ---');
const req4 = {
  'Accept': 'application/json',
  'Accept-Encoding': 'gzip'
};
const resp4 = serverRespond(req4, resource);
console.log('[服务器] 原始大小=' + resp4.originalSize + ', 压缩后=' + resp4.body.length + ' 字节');
const jsonText = clientRequest(req4, resp4);
console.log('[客户端] 解析 JSON: ' + JSON.parse(jsonText).title);

// ---- 断言 ----
assert.strictEqual(chosen, 'application/json');
assert.strictEqual(chosenLang, 'en-US');
assert.ok(gzipBuffer.length < originalBuffer.length);
assert.strictEqual(decompressed, originalText);
assert.strictEqual(resp1.headers['Content-Encoding'], 'gzip');
assert.strictEqual(resp2.headers['Content-Encoding'], 'deflate');
assert.strictEqual(resp3.headers['Content-Encoding'], undefined);
assert.strictEqual(resp4.headers['Content-Type'], 'application/json; charset=utf-8');

console.log('');
console.log('✅ 所有断言通过！');
console.log('');
console.log('💡 关键点回顾：');
console.log('   1. 内容协商 = 客户端用 Accept 头表达偏好，服务器据此挑选');
console.log('   2. q 值是权重（0-1），默认 1.0，按降序选第一个能提供的');
console.log('   3. Accept → Content-Type, Accept-Encoding → Content-Encoding');
console.log('   4. gzip 是最通用的压缩，br 压缩率更高但仅 HTTPS');
console.log('   5. 文本压缩率 70%+，二进制（图片/视频）不要再压缩');
console.log('   6. Vary: Accept-Encoding 告诉缓存按压缩算法分别缓存');
console.log('   7. 小文件别压（< 1KB 可能越压越大）');
`
  }
];
