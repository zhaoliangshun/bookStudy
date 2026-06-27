// =============================================================
// Node.js 交互式教程 —— 第二批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. url     — URL 模块
//   2. events  — 事件模块 (Events)
//   3. stream  — 流 (Stream)
//   4. buffer  — Buffer 缓冲区
//   5. http    — HTTP 模块（沙箱模拟版）
//   6. crypto  — 加密模块 (Crypto)
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的示例代码
//
// 代码运行环境约束：
//   - Node.js vm 沙箱，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, clearTimeout, clearInterval, clearImmediate,
//     URL, URLSearchParams, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - console 仅支持: log, info, warn, error, debug, table, dir, trace
//     （不支持 time/timeEnd/group/groupEnd/count）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：URL 模块
  // =========================================================
  {
    id: "url",
    title: "URL 模块",
    icon: "🔗",
    group: "核心模块",
    content: `## URL 模块详解

URL（Uniform Resource Locator，统一资源定位符）是 Web 的基础。无论你是构建 API 服务、解析请求路径、拼接资源地址，还是处理文件路径，都离不开 URL 解析。Node.js 的 \`url\` 模块提供了完整的 URL 解析与操作能力。

### 什么是 URL？

一个 URL 描述了互联网上一个资源的位置和访问方式。它的完整格式（RFC 3986）如下：

\`\`\`
  https://user:pass@example.com:8080/api/users?id=100&role=admin#profile
  ┕─┕─┘┕──┕─┕──┕─┕───────┕──┕──┕─┕──────┕─┕─────────────┕─┕─────┕
  协议  用户 密码     主机名    端口  路径       查询字符串     锚点
\`\`\`

### URL 的组成部分详解

| 属性 | 含义 | 示例值 | 说明 |
| --- | --- | --- | --- |
| \`protocol\` | 协议 | \`https:\` | 含冒号，如 http: / https: / file: / ftp: |
| \`username\` | 用户名 | \`user\` | HTTP 基本认证的用户名（很少用） |
| \`password\` | 密码 | \`pass\` | HTTP 基本认证的密码（明文传输，不安全） |
| \`hostname\` | 主机名 | \`example.com\` | 域名或 IP 地址，不含端口 |
| \`port\` | 端口 | \`8080\` | 端口号字符串，如省略则返回空字符串 |
| \`host\` | 主机 | \`example.com:8080\` | hostname + port |
| \`pathname\` | 路径 | \`/api/users\` | 以 / 开头的路径部分 |
| \`search\` | 查询字符串 | \`?id=100&role=admin\` | 含 ?，是 URLSearchParams 的字符串形式 |
| \`hash\` | 锚点 | \`#profile\` | 含 #，页面内定位（不发送到服务器） |
| \`origin\` | 来源 | \`https://example.com:8080\` | protocol + host，用于 CORS 判断 |
| \`href\` | 完整 URL | 完整字符串 | 整个 URL |

#### protocol 的细节

协议决定了数据的传输方式。常见协议：

| 协议 | 端口 | 用途 |
| --- | --- | --- |
| \`http:\` | 80 | 超文本传输（明文） |
| \`https:\` | 443 | 加密超文本传输（TLS/SSL） |
| \`file:\` | - | 本地文件路径 |
| \`ftp:\` | 21 | 文件传输 |
| \`ws:\` / \`wss:\` | 80/443 | WebSocket 通信 |
| \`data:\` | - | 内嵌数据（如 Base64 图片） |

> 注意：WHATWG URL 的 \`protocol\` 属性**包含冒号**（如 \`https:\`），而 Legacy API 的 \`protocol\` 也包含冒号。这是常见混淆点。

#### hostname 与 host 的区别

\`\`\`javascript
const u = new URL("https://example.com:8080/path");
u.hostname; // "example.com"  ← 只有域名
u.host;     // "example.com:8080"  ← 域名 + 端口
\`\`\`

当端口是协议默认端口（http→80, https→443）时，\`host\` 和 \`hostname\` 的值相同（端口被省略）。

#### search 与 hash 的区别

- \`search\` 是查询参数，以 \`?\` 开头，**会发送到服务器**
- \`hash\` 是页面锚点，以 \`#\` 开头，**不会发送到服务器**（仅浏览器端使用）

\`\`\`javascript
const u = new URL("https://example.com/page?id=1#section2");
u.search; // "?id=1"    → 发送到服务器
u.hash;   // "#section2" → 浏览器端定位，服务器看不到
\`\`\`

### 两套 API：Legacy vs WHATWG

Node.js 的 url 模块提供两套 API：

| 特性 | Legacy API | WHATWG API |
| --- | --- | --- |
| 创建方式 | \`url.parse(urlStr)\` | \`new URL(urlStr)\` |
| 返回类型 | \`Url\` 对象 | \`URL\` 对象（全局可用） |
| 查询参数 | \`query\` 属性（可解析为对象） | \`searchParams\` 属性（URLSearchParams） |
| 标准兼容 | Node.js 专有 | WHATWG URL 标准（与浏览器一致） |
| 推荐程度 | ⚠️ 已废弃（不推荐） | ✅ 推荐 |
| 错误处理 | 返回 null 或抛出 | 抛出 TypeError |
| 编码处理 | 部分支持 | 完整支持 RFC 3986 |

#### Legacy API 示例

\`\`\`javascript
const url = require("url");

// url.parse：解析 URL 字符串
// 第二个参数 true 表示把 query 解析为对象
const parsed = url.parse("https://example.com/path?a=1&b=2#hash", true);
console.log(parsed.pathname); // "/path"
console.log(parsed.query);    // { a: "1", b: "2" }  ← 对象形式

// url.format：把对象转回 URL 字符串
const formatted = url.format({
  protocol: "https",
  hostname: "example.com",
  pathname: "/api",
  query: { id: 1 },
});
// "https://example.com/api?id=1"
\`\`\`

> ⚠️ \`url.parse()\` 从 Node.js v11 起标记为废弃（DEP0169），因为它在处理某些边缘情况（如特殊字符编码、协议缺失）时行为不一致。新代码应使用 \`new URL()\`。

#### WHATWG API 示例

\`\`\`javascript
// URL 是全局对象，也可通过 require("url").URL 获取
const u = new URL("https://example.com/path?a=1&b=2#hash");
console.log(u.pathname);      // "/path"
console.log(u.searchParams.get("a")); // "1"
\`\`\`

### WHATWG URL 的所有属性和方法

#### 属性（可读可写）

所有属性都可以直接修改，修改后 \`href\` 会自动更新：

\`\`\`javascript
const u = new URL("https://example.com/path");
u.protocol = "http:";      // 修改协议
u.hostname = "api.test.com"; // 修改主机名
u.pathname = "/v2/data";   // 修改路径
u.search = "?page=1";      // 修改查询字符串
u.hash = "#top";           // 修改锚点
console.log(u.href);       // 自动更新
\`\`\`

| 属性 | 可写 | 说明 |
| --- | --- | --- |
| \`href\` | ✅ | 完整 URL（设置时会重新解析） |
| \`origin\` | ❌ | 只读，protocol + host |
| \`protocol\` | ✅ | 含冒号 |
| \`username\` | ✅ | 认证用户名 |
| \`password\` | ✅ | 认证密码 |
| \`host\` | ✅ | hostname + port |
| \`hostname\` | ✅ | 仅主机名 |
| \`port\` | ✅ | 端口（字符串） |
| \`pathname\` | ✅ | 路径 |
| \`search\` | ✅ | 含 ? 的查询串 |
| \`searchParams\` | ❌ | URLSearchParams 对象（只读引用，但可操作内容） |
| \`hash\` | ✅ | 含 # 的锚点 |

#### 方法

| 方法 | 说明 |
| --- | --- |
| \`toString()\` | 返回 href（等价于 \`u.href\`） |
| \`toJSON()\` | 返回 href（用于 JSON.stringify） |

\`\`\`javascript
const u = new URL("https://example.com");
console.log(u.toString()); // "https://example.com/"
console.log(JSON.stringify({ url: u })); // '{"url":"https://example.com/"}'
\`\`\`

### URLSearchParams 详解

\`URLSearchParams\` 是专门操作查询参数的类。它让你不用手动拼接 \`?key=value&...\` 字符串。

#### 创建方式

\`\`\`javascript
// 1. 从字符串创建（不含前导 ?）
const p1 = new URLSearchParams("a=1&b=2");

// 2. 从对象创建
const p2 = new URLSearchParams({ a: "1", b: "2" });

// 3. 从数组创建（支持同键多值）
const p3 = new URLSearchParams([["a", "1"], ["a", "2"]]);

// 4. 从 URL 对象获取
const u = new URL("https://example.com?a=1");
const p4 = u.searchParams;
\`\`\`

#### 所有方法详解

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| \`get(key)\` | 获取第一个值 | \`params.get("id")\` → \`"100"\` |
| \`getAll(key)\` | 获取所有同名值 | \`params.getAll("tags")\` → \`["js","node"]\` |
| \`has(key)\` | 判断是否存在 | \`params.has("page")\` → \`false\` |
| \`set(key, value)\` | 设置（覆盖已有） | \`params.set("page", "1")\` |
| \`append(key, value)\` | 追加（不覆盖） | \`params.append("tags", "new")\` |
| \`delete(key)\` | 删除某键所有值 | \`params.delete("role")\` |
| \`sort()\` | 按 key 字母排序 | \`params.sort()\` |
| \`toString()\` | 序列化为查询串 | \`params.toString()\` → \`"a=1&b=2"\` |
| \`entries()\` | [key, value] 迭代器 | \`for (const [k,v] of params)\` |
| \`keys()\` | key 迭代器 | \`for (const k of params.keys())\` |
| \`values()\` | value 迭代器 | \`for (const v of params.values())\` |
| \`forEach(cb)\` | 遍历 | \`params.forEach((v,k) => ...)\` |

#### get vs getAll

\`\`\`javascript
const params = new URLSearchParams("tags=js&tags=node&tags=react");
params.get("tags");    // "js"      ← 只返回第一个
params.getAll("tags"); // ["js","node","react"]  ← 返回所有
\`\`\`

> 这是常见陷阱：\`get()\` 只返回**第一个**匹配的值。如果有多个同名参数，需要用 \`getAll()\`。

#### set vs append

\`\`\`javascript
const p = new URLSearchParams("a=1");
p.set("a", "2");       // a=2      ← 覆盖已有值
p.append("a", "3");    // a=2&a=3  ← 追加新值
\`\`\`

### 相对路径解析

\`new URL(relative, base)\` 可以解析相对路径，这是处理网页中链接的基础：

\`\`\`javascript
const base = new URL("https://example.com/docs/intro/");

new URL("./images/logo.png", base).href;
// "https://example.com/docs/intro/images/logo.png"

new URL("../style.css", base).href;
// "https://example.com/docs/style.css"

new URL("/root.js", base).href;
// "https://example.com/root.js"  ← 绝对路径从根开始

new URL("https://cdn.com/lib.js", base).href;
// "https://cdn.com/lib.js"  ← 绝对 URL 忽略 base
\`\`\`

#### 相对路径解析规则

| 相对路径 | 说明 | 结果（base: \`/docs/intro/\`） |
| --- | --- | --- |
| \`./file\` | 当前目录 | \`/docs/intro/file\` |
| \`file\` | 当前目录（省略 ./） | \`/docs/intro/file\` |
| \`../file\` | 上级目录 | \`/docs/file\` |
| \`/file\` | 根目录 | \`/file\` |
| \`//other.com\` | 协议相对（继承协议） | \`https://other.com\` |

### file URL 与路径转换

在 Node.js 中，\`file://\` 协议用于表示本地文件路径。这在 ESM 模块系统中尤其重要（\`import.meta.url\` 返回 file URL）。

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| \`url.pathToFileURL(path)\` | 路径 → file URL | \`/a/b.txt\` → \`file:///a/b.txt\` |
| \`url.fileURLToPath(url)\` | file URL → 路径 | \`file:///a/b.txt\` → \`/a/b.txt\` |

\`\`\`javascript
const url = require("url");
const fileUrl = url.pathToFileURL("/home/user/file.txt");
// file:///home/user/file.txt

const back = url.fileURLToPath(fileUrl);
// /home/user/file.txt
\`\`\`

> Windows 上路径如 \`C:\\\\Users\\\\file.txt\` 会被编码为 \`file:///C:/Users/file.txt\`。

### 国际化域名（IDN）

\`url.domainToASCII()\` 和 \`url.domainToUnicode()\` 用于国际化域名的 Punycode 转换：

\`\`\`javascript
url.domainToASCII("你好.com");   // "xn--nnqy534a.com"
url.domainToUnicode("xn--nnqy534a.com"); // "你好.com"
\`\`\`

### URL 解析的实际应用场景

1. **API 请求拼接**：根据 base URL 和路径构造完整请求 URL
2. **查询参数构建**：用 URLSearchParams 构建 \`?key=value\` 串
3. **请求路由**：解析 pathname 进行路由匹配
4. **文件路径转换**：ESM 中 \`import.meta.url\` → \`__dirname\`
5. **CORS 判断**：比较 origin 是否在允许列表中
6. **爬虫链接解析**：将相对链接转为绝对链接

### 常见陷阱

1. **\`new URL()\` 需要完整 URL**：\`new URL("/path")\` 会报错，需要提供 base：\`new URL("/path", "http://localhost")\`

2. **\`get()\` 只返回第一个值**：多值参数用 \`getAll()\`

3. **\`protocol\` 含冒号**：\`u.protocol === "https"\` 是错的，应该是 \`"https:"\`

4. **URL 编码**：URLSearchParams 会自动编码中文和特殊字符，\`toString()\` 的结果可能包含 \`%XX\`

5. **\`url.parse()\` 已废弃**：新项目用 \`new URL()\`

下面这段代码演示了 URL 模块的完整用法。`,
    code: `// ============================================================
// 第一章代码演示：URL 模块全面实战
// ============================================================
const url = require("url");

// ---- 1. WHATWG URL：解析复杂 URL ----
console.log("===== 1. WHATWG URL 解析 =====");
// new URL() 是 WHATWG 标准，与浏览器完全一致
// 解析一个包含所有组成部分的复杂 URL
const complexUrl = new URL(
  "https://user:pass@example.com:8080/api/users?id=100&role=admin&tags=js&tags=node#profile"
);

// 逐个展示 URL 的所有属性
console.log("href     :", complexUrl.href);
console.log("protocol :", complexUrl.protocol);
console.log("username :", complexUrl.username);
console.log("password :", complexUrl.password);
console.log("host     :", complexUrl.host);
console.log("hostname :", complexUrl.hostname);
console.log("port     :", complexUrl.port);
console.log("pathname :", complexUrl.pathname);
console.log("search   :", complexUrl.search);
console.log("hash     :", complexUrl.hash);
console.log("origin   :", complexUrl.origin);

// 属性是可写的，修改后 href 自动更新
complexUrl.port = 3000;
console.log("修改端口后 host:", complexUrl.host);

// ---- 2. URLSearchParams：查询参数操作 ----
console.log("\\n===== 2. URLSearchParams 操作 =====");
const params = complexUrl.searchParams;

// get：获取单个值（只返回第一个）
console.log("id =", params.get("id"));
// getAll：获取同名参数的所有值
console.log("tags =", params.getAll("tags"));
// has：判断参数是否存在
console.log("has 'role':", params.has("role"));
console.log("has 'page':", params.has("page"));

// set：设置参数（覆盖已有同名参数）
params.set("page", "1");
// append：追加同名参数（不覆盖）
params.append("tags", "backend");
// delete：删除参数
params.delete("role");

console.log("\\n修改后 toString():", params.toString());
console.log("修改后 search:", complexUrl.search);

// sort：按 key 字母排序
params.sort();
console.log("排序后:", params.toString());

// ---- 3. 遍历查询参数 ----
console.log("\\n===== 3. 遍历查询参数 =====");
// entries()：[key, value] 迭代器
console.log("entries():");
for (const [key, value] of params.entries()) {
  console.log("  " + key + " = " + value);
}
// keys() / values()
console.log("keys():", Array.from(params.keys()));
console.log("values():", Array.from(params.values()));

// forEach 也可以遍历
console.log("forEach:");
params.forEach((value, key) => {
  console.log("  " + key + " => " + value);
});

// ---- 4. 独立使用 URLSearchParams ----
console.log("\\n===== 4. 构造查询字符串 =====");
// 从对象构造（最常用）
const search1 = new URLSearchParams({
  name: "张三",
  age: "25",
  city: "北京",
});
console.log("从对象构造:", search1.toString());
// 注意：中文会被自动编码
console.log("解码:", decodeURIComponent(search1.toString()));

// 从字符串构造
const search2 = new URLSearchParams("foo=bar&baz=qux");
console.log("从字符串构造:", search2.toString());

// 从数组构造（支持同键多值）
const search3 = new URLSearchParams([["a", "1"], ["a", "2"], ["b", "3"]]);
console.log("从数组构造:", search3.toString());
console.log("a 的所有值:", search3.getAll("a"));

// ---- 5. Legacy API：url.parse / url.format ----
console.log("\\n===== 5. Legacy API (url.parse / url.format) =====");
// url.parse 是旧版 API，Node.js 仍支持但不推荐用于新代码
// 第二个参数 true 表示自动解析 query 为对象
try {
  const parsed = url.parse("https://example.com:3000/path/page?q=hello&n=42#section", true);
  console.log("url.parse 结果:");
  console.log("  protocol:", parsed.protocol);
  console.log("  hostname:", parsed.hostname);
  console.log("  port    :", parsed.port);
  console.log("  pathname:", parsed.pathname);
  console.log("  query   :", JSON.stringify(parsed.query));
  console.log("  hash    :", parsed.hash);

  // url.format：将对象转回 URL 字符串
  const formatted = url.format({
    protocol: "https",
    hostname: "example.com",
    port: 8080,
    pathname: "/api/data",
    query: { id: 1, type: "json" },
  });
  console.log("url.format 结果:", formatted);
} catch (e) {
  console.log("Legacy API 提示:", e.message);
}

// ---- 6. 相对路径解析 ----
console.log("\\n===== 6. 相对路径解析 =====");
// new URL(relative, base) 可以解析相对路径
const baseUrl = new URL("https://example.com/docs/intro/");
console.log("base:", baseUrl.href);

const img1 = new URL("./images/logo.png", baseUrl);
console.log("./images/logo.png →", img1.href);

const img2 = new URL("../style.css", baseUrl);
console.log("../style.css →", img2.href);

const abs = new URL("https://cdn.example.com/lib.js", baseUrl);
console.log("绝对路径 →", abs.href);

// url.resolve（Legacy 方式）
console.log("url.resolve('/a/b/c', './d'):", url.resolve("/a/b/c", "./d"));
console.log("url.resolve('/a/b/c', '/d'):", url.resolve("/a/b/c", "/d"));
console.log("url.resolve('/a/b/c', '../../d'):", url.resolve("/a/b/c", "../../d"));

// ---- 7. file URL 与路径转换 ----
console.log("\\n===== 7. file URL 转换 =====");
// pathToFileURL：把本地路径转为 file:// URL
const fileUrl = url.pathToFileURL(__filename);
console.log("pathToFileURL:", fileUrl.href);
// fileURLToPath：把 file:// URL 转回本地路径
const backToPath = url.fileURLToPath(fileUrl);
console.log("fileURLToPath:", backToPath);
console.log("转换一致:", backToPath === __filename);

// ---- 8. 国际化域名 ----
console.log("\\n===== 8. 国际化域名 =====");
// domainToASCII：把 Unicode 域名转为 ASCII（Punycode）
console.log("domainToASCII('你好.com'):", url.domainToASCII("你好.com"));
// domainToUnicode：反向转换
console.log("domainToUnicode('xn--nnqy534a.com'):", url.domainToUnicode("xn--nnqy534a.com"));

// ---- 9. 实战：构建完整的 API 请求 URL ----
console.log("\\n===== 9. 实战：构建 API URL =====");
function buildApiUrl(base, path, queryParams) {
  const apiUrl = new URL(path, base);
  if (queryParams) {
    Object.entries(queryParams).forEach(function (entry) {
      apiUrl.searchParams.append(entry[0], String(entry[1]));
    });
  }
  return apiUrl;
}

const apiUrl = buildApiUrl("https://api.example.com/v1/", "users/search", {
  q: "node.js",
  page: 1,
  limit: 20,
  tags: ["backend", "server"],
});
console.log("构建的 API URL:", apiUrl.href);
console.log("protocol:", apiUrl.protocol);
console.log("hostname:", apiUrl.hostname);
console.log("pathname:", apiUrl.pathname);
console.log("查询参数:");
for (const [k, v] of apiUrl.searchParams) {
  console.log("  " + k + " = " + v);
}

// ---- 10. 实战：URL 编码对比 ----
console.log("\\n===== 10. URL 编码对比 =====");
// URLSearchParams 自动编码特殊字符
const encoded = new URLSearchParams({ msg: "Hello World & <script>" });
console.log("自动编码:", encoded.toString());
console.log("解码:", decodeURIComponent(encoded.toString()));

// 特殊字符编码
const specialChars = new URLSearchParams({ path: "/a/b/c", eq: "a=b=c" });
console.log("特殊字符:", specialChars.toString());`,
  },

  // =========================================================
  // 第二章：事件模块 (Events)
  // =========================================================
  {
    id: "events",
    title: "事件模块 (Events)",
    icon: "⚡",
    group: "核心模块",
    content: `## 事件模块 (Events)

\`events\` 模块是 Node.js 事件驱动架构的核心基石。它提供了 \`EventEmitter\` 类，实现了**观察者模式**（也叫发布-订阅模式）。Node.js 中几乎所有能触发事件的对象——HTTP 服务器、流（Stream）、进程（process）——都继承自 \`EventEmitter\`。

### 观察者模式 / 发布-订阅模式

观察者模式是一种设计模式，定义了对象间**一对多**的依赖关系：当一个对象（主题/发布者）状态变化时，所有依赖它的对象（观察者/订阅者）都会收到通知。

#### 生活中的类比

- **报纸订阅**：你向报社订阅报纸（\`on\`），报社每天发报纸（\`emit\`），你退订就不再收到（\`off\`）
- **微信公众号**：关注公众号（\`on\`），公众号推送文章（\`emit\`），取关后不再推送（\`off\`）
- **红绿灯**：行人注册"绿灯亮"事件（\`on\`），灯变绿时触发（\`emit\`）

#### 模式结构

\`\`\`
  发布者 (EventEmitter)               订阅者 (Listener)
  ┌─────────────────┐                ┌─────────────────┐
  │  事件队列        │  emit("data")  │  回调函数 A      │
  │  "data": [A, B] │ ──────────────→│  回调函数 B      │
  │  "error": [C]   │                │  回调函数 C      │
  └─────────────────┘                └─────────────────┘
\`\`\`

#### 与 Promise/回调的区别

| 特性 | 回调 | Promise | 事件 (EventEmitter) |
| --- | --- | --- | --- |
| 触发次数 | 一次 | 一次 | **多次** |
| 适用场景 | 单次操作 | 单次异步操作 | 持续性事件流 |
| 取消机制 | 无 | 无 | **可移除监听器** |
| 多消费者 | 难 | 需 Promise 分发 | **天然支持多监听器** |

### EventEmitter 核心方法详解

#### 注册监听器

| 方法 | 说明 | 别名 |
| --- | --- | --- |
| \`on(event, listener)\` | 注册监听器（可多次触发） | \`addListener\` |
| \`once(event, listener)\` | 注册只触发一次的监听器 | - |
| \`prependListener(event, listener)\` | 注册到监听器数组**开头** | - |
| \`prependOnceListener(event, listener)\` | 注册到开头且只触发一次 | - |

#### 移除监听器

| 方法 | 说明 |
| --- | --- |
| \`off(event, listener)\` | 移除指定监听器（别名 \`removeListener\`） |
| \`removeAllListeners([event])\` | 移除某事件全部监听器（或所有事件） |

#### 触发与查询

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| \`emit(event, ...args)\` | 触发事件 | \`boolean\`：是否有监听器 |
| \`listeners(event)\` | 获取监听器数组副本 | \`Function[]\` |
| \`rawListeners(event)\` | 获取原始监听器（含 once 包装器） | \`Function[]\` |
| \`listenerCount(event)\` | 获取监听器数量 | \`number\` |
| \`eventNames()\` | 获取所有有监听器的事件名 | \`Array\` |

#### 配置方法

| 方法 | 说明 |
| --- | --- |
| \`setMaxListeners(n)\` | 设置最大监听器数（默认 10） |
| \`getMaxListeners()\` | 获取最大监听器数 |

### 同步执行特性

**EventEmitter 的监听器是同步调用的**——\`emit()\` 会按照注册顺序依次同步执行所有监听器，然后才返回。这与浏览器事件不同（浏览器事件可能是异步的）。

\`\`\`javascript
const ee = new EventEmitter();
ee.on("test", () => console.log("监听器 A"));
ee.on("test", () => console.log("监听器 B"));

console.log("emit 之前");
ee.emit("test");
console.log("emit 之后");

// 输出顺序：
// emit 之前
// 监听器 A
// 监听器 B
// emit 之后
\`\`\`

> 如果需要异步执行监听器，可以在监听器内部使用 \`setImmediate()\` 或 \`process.nextTick()\`。

### 监听器注册顺序

监听器按注册顺序执行。\`on()\` 添加到**末尾**，\`prependListener()\` 添加到**开头**：

\`\`\`javascript
ee.on("e", () => console.log("A"));       // 第1个
ee.on("e", () => console.log("B"));       // 第2个
ee.prependListener("e", () => console.log("C")); // 插到最前面
ee.emit("e");
// 输出：C → A → B
\`\`\`

### error 事件的特殊处理

\`error\` 是 EventEmitter 中一个**特殊的事件名**。如果你 \`emit("error")\` 但没有注册 \`error\` 监听器，Node.js 会**抛出错误并使进程崩溃**：

\`\`\`javascript
const ee = new EventEmitter();
ee.emit("error", new Error("出错了"));
// ↓ 没有 error 监听器，进程崩溃！
// Error [ERR_UNHANDLED_ERROR]: Unhandled error. (undefined)
\`\`\`

**解决方案**：始终注册 error 监听器：

\`\`\`javascript
ee.on("error", (err) => {
  console.error("捕获到错误:", err.message);
});
ee.emit("error", new Error("出错了")); // 现在安全了
\`\`\`

> 这就是为什么流（Stream）在出错时如果没有 error 监听器会导致进程崩溃。**最佳实践：始终为可能出错的对象注册 error 事件。**

### 内存泄漏警告（MaxListenersExceededWarning）

EventEmitter 默认允许每个事件最多 **10** 个监听器。如果超过这个数字，Node.js 会打印警告：

\`\`\`
MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
11 test listeners added. Use emitter.setMaxListeners() to increase limit.
\`\`\`

这个警告是为了帮你发现**忘记移除监听器**导致的内存泄漏。常见场景：

\`\`\`javascript
// ❌ 危险：每次请求都添加监听器，但从不移除
function handleRequest(req) {
  req.on("data", (chunk) => { /* ... */ });
  // 请求结束后 req 被回收，但如果有外部引用持有 req...
}
\`\`\`

如果确实需要超过 10 个监听器（不是泄漏），可以用 \`setMaxListeners\` 调整：

\`\`\`javascript
emitter.setMaxListeners(20);  // 调整上限
emitter.setMaxListeners(0);   // 0 = 不限制（不推荐）
\`\`\`

### once 的实现原理

\`once\` 注册一个只执行一次的监听器。其内部原理是包装一个 wrapper 函数：

\`\`\`javascript
// once 的简化实现原理：
function once(emitter, event, listener) {
  const wrapper = function (...args) {
    emitter.removeListener(event, wrapper); // 先移除自己
    listener.apply(emitter, args);          // 再执行真正的回调
  };
  emitter.on(event, wrapper);
}

// rawListeners() 可以看到这个包装器
const ee = new EventEmitter();
ee.once("test", () => {});
console.log(ee.listeners("test").length);    // 1（看起来只有1个）
console.log(ee.rawListeners("test").length); // 1（含包装器的原始引用）
\`\`\`

> \`rawListeners()\` 返回的是包含 wrapper 的原始函数引用，\`listeners()\` 返回的是 unwrapped 后的函数。

### 事件命名约定

| 命名风格 | 示例 | 说明 |
| --- | --- | --- |
| 小写单词 | \`data\`, \`end\`, \`close\` | Node.js 内置事件 |
| 冒号分隔 | \`task:start\`, \`task:done\` | 自定义事件（推荐，避免冲突） |
| 驼峰 | \`dataReceived\` | 也可以但不推荐 |

> 推荐：自定义事件用 \`命名空间:动作\` 格式（如 \`connection:open\`），内置事件用小写单词。**不要用 \`error\` 作为自定义事件名**（除非你真的在处理错误）。

### 继承 EventEmitter

Node.js 中很多类都继承自 EventEmitter：

\`\`\`javascript
const EventEmitter = require("events");

class MyStream extends EventEmitter {
  constructor() {
    super();
    this.data = [];
  }
  write(chunk) {
    this.data.push(chunk);
    this.emit("data", chunk);    // 触发 data 事件
  }
  close() {
    this.emit("close");          // 触发 close 事件
  }
}
\`\`\`

Node.js 内置的继承者：
- \`http.Server\` → 继承 \`EventEmitter\`（触发 \`request\`、\`connection\` 等）
- \`stream.Readable\` / \`stream.Writable\` → 继承 \`EventEmitter\`（触发 \`data\`、\`end\` 等）
- \`process\` → 继承 \`EventEmitter\`（触发 \`exit\`、\`SIGINT\` 等）

### 常见陷阱

1. **忘记注册 error 监听器**：emit error 无监听器 → 进程崩溃

2. **监听器内存泄漏**：反复 on 但不 off → MaxListenersExceededWarning

3. **箭头函数导致无法移除**：
\`\`\`javascript
// ❌ 无法移除（每次创建新函数）
ee.on("e", () => {});
ee.off("e", () => {}); // 这是另一个函数，off 无效！

// ✅ 保存引用
const handler = () => {};
ee.on("e", handler);
ee.off("e", handler); // 正确移除
\`\`\`

4. **emit 是同步的**：不要期望 emit 后的代码在监听器之后执行

5. **once 的 wrapper**：\`listeners()\` 不显示 wrapper，\`rawListeners()\` 显示

下面这段代码实现了一个完整的自定义事件发射器，演示所有核心 API。`,
    code: `// ============================================================
// 第二章代码演示：EventEmitter 事件模块全面实战
// ============================================================
const EventEmitter = require("events");

// ---- 1. 基本用法：on 和 emit ----
console.log("===== 1. 基本用法 on / emit =====");
const emitter = new EventEmitter();

// on：注册监听器（别名 addListener）
emitter.on("greet", function (name) {
  console.log("你好, " + name + "!");
});
// emit：触发事件，传入参数
emitter.emit("greet", "张三");
emitter.emit("greet", "李四");

// emit 返回布尔值：表示是否有监听器
const hasListener = emitter.emit("greet", "王五");
const noListener = emitter.emit("nonexistent");
console.log("greet 有监听器:", hasListener);
console.log("nonexistent 有监听器:", noListener);

// ---- 2. once：只触发一次 ----
console.log("\\n===== 2. once 一次性监听 =====");
let tickCount = 0;
emitter.once("tick", function () {
  tickCount++;
  console.log("tick 被触发，这是唯一一次执行");
});
emitter.emit("tick"); // 执行
emitter.emit("tick"); // 不执行
emitter.emit("tick"); // 不执行
console.log("tickCount =", tickCount, "(once 只执行一次)");

// ---- 3. 多个监听器的执行顺序 ----
console.log("\\n===== 3. 多个监听器（按注册顺序同步执行）=====");
const emitter2 = new EventEmitter();
emitter2.on("event", function () { console.log("  监听器 A"); });
emitter2.on("event", function () { console.log("  监听器 B"); });
emitter2.on("event", function () { console.log("  监听器 C"); });
console.log("触发 event：");
emitter2.emit("event");
// 输出：A → B → C（按注册顺序）

// ---- 4. prependListener：插入到最前面 ----
console.log("\\n===== 4. prependListener =====");
// prependListener 把新监听器插入到数组开头
emitter2.prependListener("event", function () {
  console.log("  监听器 FIRST（后注册但先执行）");
});
console.log("再次触发 event：");
emitter2.emit("event");
// 输出：FIRST → A → B → C

// prependOnceListener：插入到最前面但只执行一次
emitter2.prependOnceListener("event", function () {
  console.log("  一次性 FIRST");
});
console.log("第三次触发（含一次性）：");
emitter2.emit("event"); // 一次性 FIRST → FIRST → A → B → C
console.log("第四次触发（一次性已移除）：");
emitter2.emit("event"); // FIRST → A → B → C

// ---- 5. off / removeListener：移除监听器 ----
console.log("\\n===== 5. off / removeListener =====");
const emitter3 = new EventEmitter();
const handler1 = function () { console.log("  handler1 被调用"); };
const handler2 = function () { console.log("  handler2 被调用"); };

emitter3.on("test", handler1);
emitter3.on("test", handler2);
console.log("emit 第一次：");
emitter3.emit("test");

// off 是 removeListener 的别名，需要传入同一个函数引用
emitter3.off("test", handler1);
console.log("移除 handler1 后 emit：");
emitter3.emit("test"); // 只有 handler2

// removeAllListeners：移除某事件的所有监听器
emitter3.removeAllListeners("test");
console.log("移除全部后 emit：");
console.log("  emit 返回:", emitter3.emit("test"), "(false = 无监听器)");

// ---- 6. listeners / listenerCount / eventNames ----
console.log("\\n===== 6. listeners / listenerCount / eventNames =====");
const emitter4 = new EventEmitter();
const fn1 = function () {};
const fn2 = function () {};
emitter4.on("data", fn1);
emitter4.on("data", fn2);
emitter4.on("error", function (e) { console.log("  error:", e.message); });

// listenerCount：获取监听器数量
console.log("data 的监听器数量:", emitter4.listenerCount("data"));
// listeners：返回监听器数组副本
console.log("data 的监听器数组长度:", emitter4.listeners("data").length);
// eventNames：返回所有有监听器的事件名
console.log("所有事件名:", emitter4.eventNames());

// rawListeners vs listeners（once 的包装器区别）
const emitter5 = new EventEmitter();
emitter5.on("a", fn1);
emitter5.once("a", fn2);
console.log("listeners('a') 数量:", emitter5.listeners("a").length);
console.log("rawListeners('a') 数量:", emitter5.rawListeners("a").length, "(含 once 包装器)");

// ---- 7. setMaxListeners：调整最大监听器数 ----
console.log("\\n===== 7. setMaxListeners =====");
const emitter6 = new EventEmitter();
console.log("默认最大监听器数:", emitter6.getMaxListeners());
// 超过 10 个同事件监听器会触发 MaxListenersExceededWarning
emitter6.setMaxListeners(20);
console.log("设置后最大监听器数:", emitter6.getMaxListeners());

// ---- 8. error 事件：特殊处理 ----
console.log("\\n===== 8. error 事件 =====");
const emitter7 = new EventEmitter();
// 必须注册 error 监听器，否则 emit('error') 会导致进程崩溃
emitter7.on("error", function (err) {
  console.log("  捕获到 error 事件:", err.message);
});
// 触发 error 事件，有监听器所以不会崩溃
emitter7.emit("error", new Error("数据库连接失败"));
emitter7.emit("error", new Error("文件未找到"));
console.log("  error 事件被安全捕获，进程没有崩溃");

// ---- 9. 实战：自定义任务进度发射器 ----
console.log("\\n===== 9. 自定义任务进度发射器 =====");
class TaskRunner extends EventEmitter {
  constructor(tasks) {
    super();
    this.tasks = tasks;
    this.completed = 0;
  }

  run() {
    // 触发开始事件
    this.emit("start", { total: this.tasks.length });

    for (let i = 0; i < this.tasks.length; i++) {
      var task = this.tasks[i];
      // 触发任务开始事件
      this.emit("task:start", { index: i, name: task });

      // 模拟任务执行（同步）
      this.completed++;
      var progress = Math.round((this.completed / this.tasks.length) * 100);

      // 触发任务完成事件
      this.emit("task:done", {
        index: i,
        name: task,
        progress: progress + "%",
      });
    }

    // 触发完成事件
    this.emit("complete", { completed: this.completed });
  }
}

var runner = new TaskRunner(["下载文件", "解析数据", "写入数据库", "发送通知"]);

// 注册各类事件监听器
runner.on("start", function (info) {
  console.log("  任务开始，共 " + info.total + " 个任务");
});
runner.on("task:start", function (info) {
  console.log("  [开始] 任务 " + (info.index + 1) + ": " + info.name);
});
runner.on("task:done", function (info) {
  console.log("  [完成] 任务 " + (info.index + 1) + ": " + info.name + " (" + info.progress + ")");
});
runner.on("complete", function (info) {
  console.log("  全部完成！共完成 " + info.completed + " 个任务");
});

// 运行任务
runner.run();

// ---- 10. 继承 EventEmitter ----
console.log("\\n===== 10. 继承 EventEmitter =====");
// 自定义类继承 EventEmitter 获得事件能力
class Counter extends EventEmitter {
  constructor(initial) {
    super();
    this.value = initial || 0;
  }
  increment() {
    this.value++;
    this.emit("change", { value: this.value, action: "increment" });
    if (this.value === 10) {
      this.emit("milestone", { value: this.value });
    }
    return this;
  }
  decrement() {
    this.value--;
    this.emit("change", { value: this.value, action: "decrement" });
    return this;
  }
}

var counter = new Counter(7);
counter.on("change", function (info) {
  console.log("  计数器" + info.action + ": " + info.value);
});
counter.once("milestone", function () {
  console.log("  达到里程碑 10！");
});

// 链式调用
counter.increment().increment().increment(); // 7→8→9→10
counter.decrement(); // 10→9
console.log("  最终值:", counter.value);

// ---- 11. 事件驱动解耦示例 ----
console.log("\\n===== 11. 事件驱动解耦 =====");
// 演示如何用事件解耦模块
class DataStore extends EventEmitter {
  constructor() {
    super();
    this.data = {};
  }
  set(key, value) {
    var oldValue = this.data[key];
    this.data[key] = value;
    this.emit("change", { key: key, oldValue: oldValue, newValue: value });
  }
  get(key) {
    return this.data[key];
  }
}

var store = new DataStore();

// 不同模块监听同一事件，互不干扰
store.on("change", function (info) {
  console.log("  [日志模块] " + info.key + ": " + info.oldValue + " → " + info.newValue);
});
store.on("change", function (info) {
  console.log("  [缓存模块] 失效缓存: " + info.key);
});
store.on("change", function (info) {
  if (info.newValue === null) {
    console.log("  [告警模块] " + info.key + " 被删除！");
  }
});

store.set("user", "张三");
store.set("user", "李四");
store.set("user", null);`,
  },

  // =========================================================
  // 第三章：流 (Stream)
  // =========================================================
  {
    id: "stream",
    title: "流 (Stream)",
    icon: "🌊",
    group: "核心模块",
    content: `## 流 (Stream)

流（Stream）是 Node.js 处理**大数据**和**持续数据流**的核心抽象。它允许数据分块（chunk）逐步处理，而不是一次性把所有数据读进内存。理解流是掌握 Node.js 的高级技能。

### 为什么需要流？

#### 问题：传统方式的内存困境

假设你要读取一个 5GB 的日志文件并统计行数：

\`\`\`javascript
// ❌ 传统方式：一次性读取全部
const data = fs.readFileSync("huge.log", "utf8"); // 需要 5GB 内存！
const lines = data.split("\\n").length;
\`\`\`

这会导致：
1. **内存爆炸**：5GB 文件需要 5GB+ 内存，大部分服务器扛不住
2. **等待时间长**：必须等整个文件读完才能开始处理
3. **无法处理无限流**：如网络直播数据、传感器实时数据

#### 解决方案：流式处理

\`\`\`javascript
// ✅ 流式方式：逐块处理
const stream = fs.createReadStream("huge.log", "utf8");
let lineCount = 0;
stream.on("data", (chunk) => {
  lineCount += chunk.split("\\n").length - 1;
});
stream.on("end", () => {
  console.log("行数:", lineCount);
});
\`\`\`

流式处理只需 **几 KB 内存**（一个 chunk 的大小），就能处理任意大小的文件。

#### 流的核心优势

| 优势 | 说明 | 示例 |
| --- | --- | --- |
| **内存效率** | 只需缓冲一小块数据 | 5GB 文件只需 64KB 内存 |
| **时间效率** | 拿到第一块数据就能开始处理 | 不必等全部读完 |
| **可组合性** | 用 pipe/pipeline 串联流 | 读取 → 解压 → 解密 → 解析 |
| **背压控制** | 自动调节读写速度 | 快读慢写时自动暂停读取 |

### 流的四种类型

| 类型 | 方向 | 说明 | 典型示例 |
| --- | --- | --- | --- |
| **Readable** | 读出 | 数据可从中读出 | fs.createReadStream、HTTP 请求体 |
| **Writable** | 写入 | 数据可写入其中 | fs.createWriteStream、HTTP 响应体 |
| **Duplex** | 双向 | 同时可读可写（读写独立） | TCP socket、WebSocket |
| **Transform** | 转换 | 读入数据变换后写出 | zlib 压缩、加密、行分割 |

#### Duplex vs Transform 的区别

- **Duplex**：读写是**独立**的两个通道（如电话，双方都能说话）
- **Transform**：写入的数据经过**变换**后从读取端出来（如翻译机，输入中文输出英文）

\`\`\`
Duplex:    写入端 → [缓冲] → 读出端  (独立通道)
           写入端 ← [缓冲] ← 读出端

Transform: 写入端 → [变换函数] → 读出端  (数据经过处理)
\`\`\`

### 流的模式：flowing vs paused

Readable 流有两种工作模式：

| 模式 | 说明 | 触发方式 |
| --- | --- | --- |
| **paused**（暂停模式） | 需要手动 \`read()\` 读取 | 默认模式 |
| **flowing**（流动模式） | 数据自动推送 | 注册 \`data\` 事件、调用 \`pipe()\` |

#### 模式切换

\`\`\`javascript
const readable = getReadableStream();

// 进入 flowing 模式（自动推送数据）
readable.on("data", (chunk) => { console.log(chunk); });

// 切回 paused 模式
readable.pause();

// 手动读取（paused 模式）
readable.on("readable", () => {
  let chunk;
  while ((chunk = readable.read()) !== null) {
    console.log(chunk);
  }
});
\`\`\`

### Readable 流的事件

| 事件 | 说明 | 触发时机 |
| --- | --- | --- |
| \`data\` | 数据到达 | flowing 模式下，每块数据到达时 |
| \`end\` | 流结束 | 所有数据读完（没有更多数据） |
| \`error\` | 发生错误 | 读取过程中出错 |
| \`close\` | 流关闭 | 底层资源关闭（如文件描述符） |
| \`readable\` | 有数据可读 | paused 模式下有数据可读时 |

### Writable 流的事件

| 事件 | 说明 | 触发时机 |
| --- | --- | --- |
| \`drain\` | 可以继续写入 | 缓冲区排空后（write 返回 false 后恢复） |
| \`finish\` | 写入完成 | 调用 \`end()\` 且所有数据写入完毕 |
| \`error\` | 发生错误 | 写入过程中出错 |
| \`close\` | 流关闭 | 底层资源关闭 |

### 重要方法详解

#### Readable 方法

| 方法 | 说明 |
| --- | --- |
| \`read([size])\` | paused 模式下手动读取数据 |
| \`pipe(destination)\` | 把数据管道到 Writable 流 |
| \`unpipe([destination])\` | 取消管道 |
| \`pause()\` | 暂停 flowing 模式 |
| \`resume()\` | 恢复 flowing 模式 |
| \`destroy([err])\` | 销毁流，触发 error/close |

#### Writable 方法

| 方法 | 说明 |
| --- | --- |
| \`write(chunk[, cb])\` | 写入数据，返回 false 表示需要等待 drain |
| \`end([chunk][, cb])\` | 标记写入结束，触发 finish |
| \`destroy([err])\` | 销毁流 |

### 背压 (Backpressure) 机制详解

背压是流中最重要的概念之一。当**读取速度 > 写入速度**时，数据会在内存中堆积，导致内存溢出。背压机制通过**暂停读取**来解决这个问题。

#### 没有 pipe 的手动背压处理

\`\`\`javascript
readable.on("data", (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    // 返回 false 表示缓冲区满了，需要暂停读取
    readable.pause();
    // 等待缓冲区排空后恢复
    writable.once("drain", () => {
      readable.resume();
    });
  }
});
\`\`\`

#### pipe 自动处理背压

\`\`\`javascript
// pipe 自动处理背压，无需手动 pause/resume
readable.pipe(writable);
\`\`\`

> **最佳实践**：使用 \`pipeline()\` 代替 \`pipe()\`，因为 pipeline 会自动处理错误传播和清理。

### 自定义流

#### 自定义 Readable

\`\`\`javascript
const { Readable } = require("stream");

class MyReadable extends Readable {
  constructor(options) {
    super(options);
    this.current = 1;
    this.max = 5;
  }
  _read() {
    // _read 在消费者请求数据时被自动调用
    if (this.current <= this.max) {
      this.push(String(this.current++));  // push 推送数据
    } else {
      this.push(null);  // null 表示流结束
    }
  }
}
\`\`\`

#### 自定义 Writable

\`\`\`javascript
const { Writable } = require("stream");

class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    console.log("写入:", chunk.toString());
    callback();  // 必须调用 callback 表示写入完成
  }
  _final(callback) {
    console.log("所有数据写入完毕");
    callback();
  }
}
\`\`\`

#### 自定义 Transform

\`\`\`javascript
const { Transform } = require("stream");

class UpperCase extends Transform {
  _transform(chunk, encoding, callback) {
    // 处理数据并推送
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}
\`\`\`

### 流的链式操作 (pipeline)

\`pipeline()\` 是连接多个流的推荐方式（比 \`pipe()\` 链式调用更安全）：

\`\`\`javascript
const { pipeline } = require("stream");
const fs = require("fs");
const zlib = require("zlib");

// 读取文件 → gzip 压缩 → 写入文件
pipeline(
  fs.createReadStream("input.txt"),
  zlib.createGzip(),
  fs.createWriteStream("output.txt.gz"),
  (err) => {
    if (err) console.error("管道失败:", err);
    else console.log("管道完成");
  }
);
\`\`\`

#### pipeline vs pipe 的区别

| 特性 | \`pipe()\` | \`pipeline()\` |
| --- | --- | --- |
| 错误处理 | 需要手动监听每个流的 error | **自动传播**错误并清理 |
| 资源清理 | 需要手动 destroy | **自动销毁**所有流 |
| 回调 | 无 | 提供**完成回调** |
| 推荐程度 | 旧代码 | ✅ **推荐** |

### 对象模式 (Object Mode)

默认情况下流处理 \`Buffer\` 或字符串。对象模式允许流处理**任意 JavaScript 对象**：

\`\`\`javascript
const readable = new Readable({ objectMode: true });
readable.push({ name: "张三", age: 20 });  // 推送对象而非 Buffer
readable.push(null);
\`\`\`

| 特性 | 普通模式 | 对象模式 |
| --- | --- | --- |
| 数据类型 | Buffer / 字符串 | 任意 JS 值 |
| highWaterMark | 字节数 | 对象数 |
| 用途 | 文件、网络 | 数据处理管道 |

### 常见陷阱

1. **忘记调用 \`end()\`**：Writable 不调用 end，finish 事件不触发

2. **pipe 错误不传播**：\`a.pipe(b)\` 中 b 出错不会通知 a，用 \`pipeline\` 替代

3. **data 事件丢失**：在 paused 模式下不注册 data 事件，数据可能丢失

4. **背压不处理**：手动 write 不检查返回值，内存可能溢出

5. **对象模式混用**：pipe 连接普通模式和对象模式的流可能出错

下面这段代码演示了各种流的用法。`,
    code: `// ============================================================
// 第三章代码演示：Stream 流模块全面实战
// ============================================================
const { Readable, Writable, Transform, pipeline } = require("stream");

// ---- 1. Readable.from：从可迭代对象创建流 ----
console.log("===== 1. Readable.from 创建流 =====");
// Readable.from 接受数组、Set、Generator 等可迭代对象
var readable1 = Readable.from(["Node.js ", "流式 ", "处理 ", "数据"]);
var parts = [];
readable1.on("data", function (chunk) {
  console.log("  收到数据块:", JSON.stringify(chunk));
  parts.push(chunk);
});
readable1.on("end", function () {
  console.log("  拼接结果:", parts.join(""));
  console.log("  流结束（end 事件触发）");
});

// ---- 2. Readable 事件：data / end ----
console.log("\\n===== 2. Readable 事件详解 =====");
var readable2 = Readable.from([1, 2, 3, 4, 5]);
var sum = 0;
readable2.on("data", function (chunk) {
  sum += chunk;
});
readable2.on("end", function () {
  console.log("  求和结果:", sum);
  console.log("  流结束");
});

// ---- 3. 自定义 Readable（对象模式）----
console.log("\\n===== 3. 自定义 Readable 流 =====");
// 继承 Readable 并实现 _read 方法
class NumberStream extends Readable {
  constructor(max) {
    super({ objectMode: true }); // objectMode 允许推送任意 JS 对象
    this.max = max;
    this.current = 1;
  }
  // _read 在消费者请求数据时被自动调用
  _read() {
    if (this.current <= this.max) {
      this.push({
        num: this.current,
        square: this.current * this.current,
        cube: this.current * this.current * this.current,
      });
      this.current++;
    } else {
      this.push(null); // null 表示流结束
    }
  }
}

// 消费自定义流
var numbers = new NumberStream(5);
var collected = [];
numbers.on("data", function (item) {
  collected.push(item);
});
numbers.on("end", function () {
  console.log("  收集到的数据:");
  console.table(collected);
});

// ---- 4. 自定义 Transform：数据转换 ----
console.log("\\n===== 4. 自定义 Transform 转换流 =====");
// Transform 流：读取数据 → 变换 → 写出
class FormatTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  // _transform 处理每一块数据
  _transform(chunk, encoding, callback) {
    var formatted = "数字 " + chunk.num + " → 平方=" + chunk.square + ", 立方=" + chunk.cube;
    this.push(formatted);
    callback(); // 表示本次处理完成
  }
}

// ---- 5. 自定义 Writable：数据消费 ----
console.log("\\n===== 5. 自定义 Writable 可写流 =====");
class LogWritable extends Writable {
  constructor() {
    super({ objectMode: true });
    this.results = [];
  }
  _write(chunk, encoding, callback) {
    console.log("  写入:", chunk);
    this.results.push(chunk);
    callback();
  }
  _final(callback) {
    console.log("  可写流完成，共写入 " + this.results.length + " 条");
    callback();
  }
}

// ---- 6. pipeline：流式管道（推荐方式）----
console.log("\\n===== 6. pipeline 管道连接 =====");
// pipeline 自动处理错误传播和背压
var logSink = new LogWritable();
pipeline(
  new NumberStream(5),      // 源：生成数字对象
  new FormatTransform(),    // 转换：格式化为字符串
  logSink,                  // 汇：输出日志
  function (err) {
    if (err) {
      console.error("  管道错误:", err.message);
    } else {
      console.log("  管道执行完成");
    }
  }
);

// ---- 7. 字符串转换流（非对象模式）----
console.log("\\n===== 7. 字符串转换流 =====");
// 非对象模式处理字符串
class UpperCaseTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  _transform(chunk, encoding, callback) {
    this.push(String(chunk).toUpperCase());
    callback();
  }
}

// 创建字符串流
var textStream = Readable.from(["hello world\\n", "node.js streams\\n", "pipeline demo\\n"]);
var upperCased = [];
var collectWritable = new Writable({
  objectMode: true,
  write: function (chunk, encoding, callback) {
    upperCased.push(String(chunk));
    callback();
  },
});

// pipe 链式连接
textStream
  .pipe(new UpperCaseTransform())
  .pipe(collectWritable);

collectWritable.on("finish", function () {
  console.log("  转换结果:");
  upperCased.forEach(function (s) {
    console.log("    " + s.trim());
  });
  console.log("  pipe 链完成");
});

// ---- 8. Transform 链式转换 ----
console.log("\\n===== 8. Transform 链式转换 =====");
// 多个 Transform 串联：数字 → 乘10 → 格式化
class MultiplyTransform extends Transform {
  constructor(factor) {
    super({ objectMode: true });
    this.factor = factor;
  }
  _transform(chunk, encoding, callback) {
    this.push({ num: chunk.num, result: chunk.num * this.factor });
    callback();
  }
}

class StringifyTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  _transform(chunk, encoding, callback) {
    this.push(chunk.num + " x 10 = " + chunk.result);
    callback();
  }
}

var stringResults = [];
var stringSink = new Writable({
  objectMode: true,
  write: function (chunk, encoding, callback) {
    stringResults.push(chunk);
    callback();
  },
});

pipeline(
  new NumberStream(5),
  new MultiplyTransform(10),
  new StringifyTransform(),
  stringSink,
  function (err) {
    if (err) {
      console.error("  管道错误:", err.message);
    } else {
      console.log("  链式转换结果:");
      stringResults.forEach(function (s) {
        console.log("    " + s);
      });
    }
  }
);

// ---- 9. 流模式说明 ----
console.log("\\n===== 9. 流模式说明 =====");
console.log("  paused mode：默认模式，需要手动 read() 读取");
console.log("  flowing mode：注册 'data' 监听器后自动进入");
console.log("  pipe() 会自动切换到 flowing mode");
console.log("  pause() / resume() 可以切换模式");

// ---- 10. 背压（Backpressure）概念演示 ----
console.log("\\n===== 10. 背压概念 =====");
console.log("  背压：当写入速度慢于读取速度时自动暂停读取");
console.log("  write() 返回 false 表示缓冲区已满");
console.log("  drain 事件表示缓冲区已排空，可继续写入");
console.log("  pipe() / pipeline() 自动处理背压");

// 手动背压处理演示
var fastReadable = Readable.from(["数据块1", "数据块2", "数据块3"]);
var writeCount = 0;
var manualWritable = new Writable({
  objectMode: true,
  write: function (chunk, encoding, callback) {
    writeCount++;
    console.log("  写入: " + chunk);
    callback();
  },
});

fastReadable.on("data", function (chunk) {
  var canContinue = manualWritable.write(chunk);
  if (!canContinue) {
    // 缓冲区满，暂停读取
    fastReadable.pause();
    manualWritable.once("drain", function () {
      fastReadable.resume();
    });
  }
});

manualWritable.on("finish", function () {
  console.log("  背压处理完成，共写入 " + writeCount + " 块");
});

// ---- 11. 从 Generator 创建流 ----
console.log("\\n===== 11. 从 Generator 创建流 =====");
// Readable.from 也接受生成器函数
function* fibonacciGenerator() {
  var a = 0, b = 1;
  for (var i = 0; i < 8; i++) {
    yield a;
    var temp = a + b;
    a = b;
    b = temp;
  }
}

var fibStream = Readable.from(fibonacciGenerator());
var fibNumbers = [];
fibStream.on("data", function (n) {
  fibNumbers.push(n);
});
fibStream.on("end", function () {
  console.log("  斐波那契数列:", fibNumbers.join(", "));
});`,
  },

  // =========================================================
  // 第四章：Buffer 缓冲区
  // =========================================================
  {
    id: "buffer",
    title: "Buffer 缓冲区",
    icon: "🗃️",
    group: "核心模块",
    content: `## Buffer 缓冲区

\`Buffer\` 是 Node.js 处理**二进制数据**的核心全局对象。在文件操作、网络通信、加密计算等场景中无处不在。理解 Buffer 是掌握 Node.js 底层的关键。

### 为什么需要 Buffer？

JavaScript 原生设计用于浏览器，只有字符串处理能力，没有处理二进制数据的好方式。但服务端需要处理：
- **文件二进制**：图片、视频、压缩包
- **网络数据**：TCP 流、HTTP 请求体
- **加密数据**：哈希值、密钥、签名
- **协议数据**：DNS、TLS 等二进制协议

Node.js 引入 Buffer 来填补这个空缺。Buffer 类似一个**字节数组**（每个元素 0-255），但分配在 V8 堆外内存中，性能更高。

#### Buffer vs 普通数组

| 特性 | 普通数组 (Array) | Buffer |
| --- | --- | --- |
| 元素类型 | 任意 | 0-255 的整数（字节） |
| 内存位置 | V8 堆内 | V8 堆外（C++ 层分配） |
| 大小 | 动态可变 | **固定大小**（创建后不可变） |
| 性能 | 较低（需要装箱） | **高**（直接内存操作） |
| 继承 | Array | **Uint8Array** |

### Buffer 与 TypedArray (Uint8Array) 的关系

从 Node.js v6 起，Buffer 是 \`Uint8Array\` 的子类：

\`\`\`
TypedArray (抽象基类)
  └── Uint8Array (无符号 8 位整数数组)
        └── Buffer (Node.js 扩展，添加了编码/解码等方法)
\`\`\`

这意味着：
- Buffer **兼容**所有接受 Uint8Array 的 API
- Buffer 可以和 TypedArray 互转（共享内存）
- Buffer 的元素是 0-255 的整数

\`\`\`javascript
const buf = Buffer.from("Hello");
console.log(buf instanceof Uint8Array); // true
console.log(buf[0]); // 72 (ASCII 'H')
\`\`\`

### 创建 Buffer

#### Buffer.alloc(size[, fill[, encoding]])

创建指定大小的 Buffer，**默认填充 0**（安全）：

\`\`\`javascript
const buf = Buffer.alloc(10);        // 10 字节，全 0
const buf2 = Buffer.alloc(10, 255);  // 10 字节，全 255
const buf3 = Buffer.alloc(10, "A");  // 10 字节，全 'A'
\`\`\`

#### Buffer.allocUnsafe(size)

创建指定大小的 Buffer，但**不初始化**（可能包含旧数据）：

\`\`\`javascript
const buf = Buffer.allocUnsafe(10); // 10 字节，内容随机！
\`\`\`

> ⚠️ **allocUnsafe 的风险**：分配的内存可能包含上一个进程残留的敏感数据。只有在**立即覆写全部内容**时才使用。Node.js 内部大量使用 allocUnsafe（如读取文件），但会立即填入数据。

#### alloc vs allocUnsafe 对比

| 特性 | \`alloc\` | \`allocUnsafe\` |
| --- | --- | --- |
| 初始化 | ✅ 填 0 | ❌ 不初始化 |
| 安全性 | 安全 | 可能泄露旧数据 |
| 性能 | 较慢（需要清零） | **更快** |
| < 4KB | 从预分配池取（都很快） | 从预分配池取 |
| >= 4KB | 直接分配并清零 | 直接分配不清零 |
| 推荐场景 | 通用 | 确定会立即覆写时 |

#### Buffer.from(source)

从各种来源创建 Buffer：

\`\`\`javascript
// 从字符串
Buffer.from("Hello", "utf8");

// 从数组
Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);

// 从另一个 Buffer（复制）
Buffer.from(otherBuffer);

// 从 ArrayBuffer（共享内存，不复制）
Buffer.from(arrayBuffer, byteOffset, length);

// 从 Uint8Array（共享内存）
Buffer.from(uint8Array);
\`\`\`

#### Buffer.concat(list[, totalLength])

拼接多个 Buffer：

\`\`\`javascript
const combined = Buffer.concat([buf1, buf2, buf3]);
// 指定总长度可优化性能（避免多次扩容）
const combined2 = Buffer.concat([buf1, buf2], buf1.length + buf2.length);
\`\`\`

### 编码 (Encoding)

Buffer 支持多种字符串编码：

| 编码 | 说明 | 用途 |
| --- | --- | --- |
| \`utf8\` | UTF-8 编码（默认） | 通用文本，支持中文 |
| \`ascii\` | ASCII 编码 | 仅英文字符（高位被丢弃） |
| \`base64\` | Base64 编码 | 数据传输、Data URL |
| \`hex\` | 十六进制编码 | 哈希值、密钥表示 |
| \`latin1\` / \`binary\` | Latin-1 编码 | 每字节一个字符（0-255） |
| \`ucs2\` / \`utf16le\` | UTF-16 小端序 | Windows 环境 |

#### 编码转换示例

\`\`\`javascript
const text = "你好";

// UTF-8 → Base64
const base64 = Buffer.from(text, "utf8").toString("base64");

// Base64 → UTF-8
const decoded = Buffer.from(base64, "base64").toString("utf8");

// UTF-8 → Hex
const hex = Buffer.from(text, "utf8").toString("hex");
\`\`\`

### Buffer 读写二进制数据

Buffer 提供了大量方法读写各种数值类型：

#### 读取方法

| 方法 | 说明 | 字节数 |
| --- | --- | --- |
| \`readUInt8(offset)\` | 无符号 8 位整数 | 1 |
| \`readInt8(offset)\` | 有符号 8 位整数 | 1 |
| \`readUInt16BE(offset)\` | 无符号 16 位（大端序） | 2 |
| \`readUInt16LE(offset)\` | 无符号 16 位（小端序） | 2 |
| \`readUInt32BE(offset)\` | 无符号 32 位（大端序） | 4 |
| \`readInt32BE(offset)\` | 有符号 32 位（大端序） | 4 |
| \`readFloatBE(offset)\` | 32 位浮点（大端序） | 4 |
| \`readDoubleBE(offset)\` | 64 位浮点（大端序） | 8 |

#### 写入方法

| 方法 | 说明 |
| --- | --- |
| \`writeUInt8(value, offset)\` | 写无符号 8 位 |
| \`writeInt32BE(value, offset)\` | 写有符号 32 位（大端） |
| \`writeFloatBE(value, offset)\` | 写 32 位浮点 |
| \`write(string, offset, length, encoding)\` | 写字符串 |

#### 大端序 vs 小端序

| 字节序 | 说明 | 内存布局 (0x1234) | 用途 |
| --- | --- | --- | --- |
| **BE** (Big Endian) | 高位在前 | \`12 34\` | 网络协议、Java |
| **LE** (Little Endian) | 低位在前 | \`34 12\` | x86 CPU |

### 常用方法

| 方法 | 说明 |
| --- | --- |
| \`buf.toString([encoding])\` | 转字符串 |
| \`buf.length\` | 字节长度 |
| \`Buffer.byteLength(string, [enc])\` | 计算字符串的字节长度 |
| \`Buffer.concat([buf1, buf2])\` | 拼接 |
| \`Buffer.isBuffer(obj)\` | 判断是否 Buffer |
| \`buf.equals(other)\` | 比较是否相等 |
| \`Buffer.compare(a, b)\` | 比较（-1/0/1） |
| \`buf.subarray([start, end])\` | 切片（共享内存，推荐） |
| \`buf.slice([start, end])\` | 切片（已废弃，用 subarray） |
| \`buf.copy(target[, tStart[, sStart[, sEnd]]])\` | 复制到另一个 Buffer |
| \`buf.fill(value[, start[, end]])\` | 填充 |
| \`buf.indexOf(value)\` | 查找位置 |
| \`buf.includes(value)\` | 是否包含 |

### 字节长度 vs 字符串长度

这是最常见的 Buffer 陷阱：

\`\`\`javascript
"你好".length;                  // 2（字符数）
Buffer.byteLength("你好");       // 6（字节数，每个中文 UTF-8 占 3 字节）
Buffer.from("你好").length;     // 6
\`\`\`

| 字符 | UTF-8 字节数 | 说明 |
| --- | --- | --- |
| ASCII (a-z, 0-9) | 1 | 基本拉丁字符 |
| 拉丁扩展 (é, ñ) | 2 | 欧洲字符 |
| 中文 (你, 好) | 3 | CJK 字符 |
| Emoji (🎉) | 4 | 补充字符 |

### Buffer 与 TypedArray 互转

\`\`\`javascript
// Buffer → Uint8Array（共享内存）
const buf = Buffer.from("Hello");
const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

// Uint8Array → Buffer（共享内存）
const u8 = new Uint8Array([72, 101, 108, 108, 111]);
const fromU8 = Buffer.from(u8);
\`\`\`

### 内存管理

#### allocUnsafe 的性能优势

Node.js 内部维护一个**预分配池**（8KB），小于 4KB 的 allocUnsafe 直接从池中切取，无需系统调用，非常快。alloc 也使用池但需要额外清零。

\`\`\`javascript
// 性能对比（伪代码）
Buffer.alloc(1024);       // 需要清零，较慢
Buffer.allocUnsafe(1024); // 从池中取，极快（但可能含旧数据）
\`\`\`

> **最佳实践**：应用代码用 \`alloc\`，性能关键路径且确定会覆写时用 \`allocUnsafe\`。

### 常见陷阱

1. **字符长度 ≠ 字节长度**：\`"你好".length\` 是 2，\`Buffer.byteLength("你好")\` 是 6

2. **allocUnsafe 含旧数据**：不覆写就使用可能泄露敏感信息

3. **slice vs subarray**：两者都共享内存，但 subarray 是标准 API，推荐使用

4. **Buffer 不可变大小**：创建后不能改变 length，需要新 Buffer 用 concat

5. **编码默认 utf8**：不指定编码时默认 utf8

6. **Buffer.alloc vs Buffer.from**：alloc 创建空 Buffer，from 从数据创建

下面这段代码演示了 Buffer 的各种用法。`,
    code: `// ============================================================
// 第四章代码演示：Buffer 缓冲区全面实战
// ============================================================
// Buffer 是全局对象，无需 require

// ---- 1. 创建 Buffer 的各种方式 ----
console.log("===== 1. 创建 Buffer =====");
// alloc：创建指定大小的 Buffer，填充 0（安全）
var buf1 = Buffer.alloc(10);
console.log("alloc(10):", buf1);

// alloc(10, 255)：填充指定值
var buf1b = Buffer.alloc(10, 65);
console.log("alloc(10, 65):", buf1b, "→", buf1b.toString());

// allocUnsafe：不初始化（可能含旧数据，快但不安全）
var buf2 = Buffer.allocUnsafe(10);
console.log("allocUnsafe(10):", buf2);

// from(string)：从字符串创建
var buf3 = Buffer.from("Hello Node.js", "utf8");
console.log("from('Hello'):", buf3, "→", buf3.toString());

// from(array)：从字节数组创建
var buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
console.log("from([0x48,...]):", buf4, "→", buf4.toString());

// from(Buffer)：从另一个 Buffer 复制
var buf5 = Buffer.from(buf3);
console.log("from(buf3):", buf5, "→", buf5.toString());

// ---- 2. 编码转换 ----
console.log("\\n===== 2. 编码转换 =====");
var text = "你好，世界！";
var utf8Buf = Buffer.from(text, "utf8");
console.log("原文:", text);
console.log("UTF-8 字节数:", utf8Buf.length);
console.log("Hex:", utf8Buf.toString("hex"));
console.log("Base64:", utf8Buf.toString("base64"));

// 编码往返：utf8 → base64 → utf8
var base64 = utf8Buf.toString("base64");
var decoded = Buffer.from(base64, "base64").toString("utf8");
console.log("Base64 解码:", decoded);
console.log("往返一致:", text === decoded);

// 编码往返：utf8 → hex → utf8
var hex = utf8Buf.toString("hex");
var fromHex = Buffer.from(hex, "hex").toString("utf8");
console.log("Hex 解码:", fromHex);

// ---- 3. 字节长度 vs 字符串长度 ----
console.log("\\n===== 3. 字节长度 vs 字符长度 =====");
var samples = ["Hello", "你好", "🎉", "abc你好🎉"];
samples.forEach(function (s) {
  console.log("  '" + s + "': 字符数=" + s.length + ", 字节数=" + Buffer.byteLength(s, "utf8"));
});

// ---- 4. concat 拼接 ----
console.log("\\n===== 4. concat 拼接 =====");
var part1 = Buffer.from("Hello ");
var part2 = Buffer.from("World ");
var part3 = Buffer.from("!");
var combined = Buffer.concat([part1, part2, part3]);
console.log("拼接:", combined.toString());
console.log("总长度:", combined.length);

// 指定总长度（优化性能）
var combined2 = Buffer.concat([part1, part2, part3], part1.length + part2.length + part3.length);
console.log("指定总长度:", combined2.toString());

// ---- 5. 二进制读写 ----
console.log("\\n===== 5. 二进制读写 =====");
var binBuf = Buffer.alloc(16);
// writeUInt8：在偏移 0 写入 1 字节无符号整数
binBuf.writeUInt8(255, 0);
// writeUInt16BE：在偏移 1 写入 2 字节大端序整数
binBuf.writeUInt16BE(1000, 1);
// writeInt32LE：在偏移 3 写入 4 字节小端序有符号整数
binBuf.writeInt32LE(-123456, 3);
// writeFloatBE：在偏移 7 写入 4 字节浮点
binBuf.writeFloatBE(3.14, 7);
// write：在偏移 11 写入字符串
binBuf.write("Hi", 11, "utf8");

console.log("二进制 Buffer:", binBuf);
console.log("readUInt8(0):", binBuf.readUInt8(0));
console.log("readUInt16BE(1):", binBuf.readUInt16BE(1));
console.log("readInt32LE(3):", binBuf.readInt32LE(3));
console.log("readFloatBE(7):", binBuf.readFloatBE(7).toFixed(2));

// ---- 6. 判断与比较 ----
console.log("\\n===== 6. 判断与比较 =====");
console.log("isBuffer(Buffer.alloc(4)):", Buffer.isBuffer(Buffer.alloc(4)));
console.log("isBuffer('string'):", Buffer.isBuffer("string"));
console.log("isBuffer([1,2,3]):", Buffer.isBuffer([1, 2, 3]));

var a = Buffer.from("abc");
var b = Buffer.from("abc");
var c = Buffer.from("abd");
console.log("equals (abc == abc):", a.equals(b));
console.log("equals (abc == abd):", a.equals(c));
console.log("compare (abc vs abd):", Buffer.compare(a, c));
console.log("compare (abc vs abc):", Buffer.compare(a, b));

// ---- 7. subarray / slice / copy / fill ----
console.log("\\n===== 7. subarray / copy / fill =====");
var orig = Buffer.from("Hello World");
// subarray：切片（共享内存，推荐）
var sub = orig.subarray(0, 5);
console.log("subarray(0,5):", sub.toString());
// 修改 sub 会影响 orig（共享内存）
sub[0] = 104; // 'h'
console.log("修改 sub 后 orig:", orig.toString());

// fill：填充
var fillBuf = Buffer.alloc(10);
fillBuf.fill(65); // 填充 'A'
console.log("fill(65):", fillBuf.toString());
fillBuf.fill("Hi", 2, 6);
console.log("fill('Hi',2,6):", fillBuf.toString());

// copy：复制到另一个 Buffer
var target = Buffer.alloc(5);
orig.copy(target, 0, 0, 5); // 把 orig 前 5 字节复制到 target
console.log("copy 结果:", target.toString());

// ---- 8. indexOf / includes ----
console.log("\\n===== 8. indexOf / includes =====");
var searchBuf = Buffer.from("Hello Node.js World");
console.log("indexOf('Node'):", searchBuf.indexOf("Node"));
console.log("indexOf('node'):", searchBuf.indexOf("node")); // -1（大小写敏感）
console.log("indexOf('Node', 10):", searchBuf.indexOf("Node", 10));
console.log("includes('World'):", searchBuf.includes("World"));
console.log("includes(0x4e):", searchBuf.includes(0x4e)); // 0x4e = 'N'

// ---- 9. Buffer 与 TypedArray (Uint8Array) ----
console.log("\\n===== 9. Buffer 与 TypedArray =====");
// Buffer 是 Uint8Array 的子类
console.log("Buffer 是 Uint8Array 的子类:", Buffer.alloc(4) instanceof Uint8Array);

// 从 Uint8Array 创建 Buffer
var uint8 = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
var fromU8 = Buffer.from(uint8);
console.log("从 Uint8Array 创建:", fromU8.toString());

// Buffer 转 Uint8Array（共享内存）
var buf = Buffer.from("Test");
var u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
console.log("Buffer 转 Uint8Array:", Array.from(u8));

// ---- 10. JSON 互转 ----
console.log("\\n===== 10. JSON 互转 =====");
var jsonBuf = Buffer.from("JSON Test");
// Buffer 的 toJSON 方法返回 { type: "Buffer", data: [...] }
var json = JSON.stringify(jsonBuf);
console.log("Buffer → JSON:", json);
// 从 JSON 恢复
var parsed = JSON.parse(json);
var fromJson;
if (parsed.type === "Buffer") {
  fromJson = Buffer.from(parsed.data);
} else {
  fromJson = Buffer.from(parsed);
}
console.log("JSON → Buffer:", fromJson.toString());
console.log("往返一致:", jsonBuf.equals(fromJson));

// ---- 11. 实战：Base64 编码 ----
console.log("\\n===== 11. 实战：Base64 编码 =====");
// 模拟将二进制数据编码为 Base64（常用于 data URL）
var binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG 文件头
var base64Data = binaryData.toString("base64");
console.log("PNG 头部 hex:", binaryData.toString("hex"));
console.log("PNG 头部 base64:", base64Data);
console.log("Data URL: data:image/png;base64," + base64Data);

// ---- 12. 实战：计算文件大小 ----
console.log("\\n===== 12. 实战：字节计算 =====");
var messages = [
  { name: "ASCII 文本", content: "Hello World" },
  { name: "中文文本", content: "你好世界" },
  { name: "混合文本", content: "Hello 你好 🎉" },
];
messages.forEach(function (m) {
  var byteLen = Buffer.byteLength(m.content, "utf8");
  var charLen = m.content.length;
  console.log("  " + m.name + ": " + charLen + " 字符 / " + byteLen + " 字节");
});`,
  },

  // =========================================================
  // 第五章：HTTP 模块（沙箱模拟版）
  // =========================================================
  {
    id: "http",
    title: "HTTP 模块",
    icon: "🌐",
    group: "核心模块",
    content: `## HTTP 模块

\`http\` 模块是 Node.js 构建 Web 服务的基石。Express、Koa、Fastify 等框架都是基于它封装的。由于沙箱环境无法真正监听端口和发起网络请求，本章用 \`EventEmitter\` 和 \`URL\` 模拟 HTTP 的核心概念。

### HTTP 协议基础

HTTP（HyperText Transfer Protocol，超文本传输协议）是 Web 通信的基础。它采用**请求-响应**模型：

\`\`\`
  客户端 (浏览器)                           服务器 (Node.js)
      │                                        │
      │ ──── HTTP 请求 ────────────────────→ │
      │                                        │
      │     GET /api/users?id=1 HTTP/1.1      │
      │     Host: example.com                 │
      │     User-Agent: Mozilla/5.0           │
      │                                        │
      │ ←─── HTTP 响应 ────────────────────── │
      │                                        │
      │     HTTP/1.1 200 OK                    │
      │     Content-Type: application/json    │
      │                                        │
      │     {"id":1,"name":"小明"}             │
      │                                        │
\`\`\`

#### HTTP 请求结构

一个 HTTP 请求由三部分组成：

\`\`\`
POST /api/users HTTP/1.1          ← 请求行（方法 + 路径 + 版本）
Host: example.com                 ← 请求头
Content-Type: application/json
Authorization: Bearer token123
                                  ← 空行（分隔头和体）
{"name":"张三","age":20}           ← 请求体（可选）
\`\`\`

#### HTTP 响应结构

\`\`\`
HTTP/1.1 200 OK                   ← 状态行（版本 + 状态码 + 状态消息）
Content-Type: application/json    ← 响应头
Content-Length: 25
                                  ← 空行
{"id":1,"name":"张三"}             ← 响应体
\`\`\`

### HTTP 请求方法

| 方法 | 语义 | 幂等 | 安全 | 典型用途 |
| --- | --- | --- | --- | --- |
| \`GET\` | 获取资源 | ✅ | ✅ | 查询数据 |
| \`POST\` | 创建资源 | ❌ | ❌ | 提交表单、上传文件 |
| \`PUT\` | 完整更新 | ✅ | ❌ | 替换整个资源 |
| \`PATCH\` | 部分更新 | ❌ | ❌ | 修改部分字段 |
| \`DELETE\` | 删除资源 | ✅ | ❌ | 删除数据 |
| \`HEAD\` | 获取头信息 | ✅ | ✅ | 检查资源是否存在 |
| \`OPTIONS\` | 查询支持的方法 | ✅ | ✅ | CORS 预检 |

> **幂等**：多次执行结果相同。**安全**：不修改服务器数据。

### HTTP 状态码

| 范围 | 类别 | 常见状态码 |
| --- | --- | --- |
| **1xx** | 信息 | 100 Continue |
| **2xx** | 成功 | 200 OK, 201 Created, 204 No Content |
| **3xx** | 重定向 | 301 永久重定向, 302 临时重定向, 304 Not Modified |
| **4xx** | 客户端错误 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| **5xx** | 服务端错误 | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

#### 常用状态码详解

| 状态码 | 含义 | 使用场景 |
| --- | --- | --- |
| 200 | OK | 请求成功 |
| 201 | Created | POST 创建资源成功 |
| 204 | No Content | 成功但无返回内容（DELETE） |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未登录/认证失败 |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关/代理错误 |
| 503 | Service Unavailable | 服务不可用（维护中） |

### Node.js http 模块概述

> ⚠️ 沙箱环境无法 \`require('http')\`，以下为概念讲解，代码部分用模拟实现。

#### 创建服务器

\`\`\`javascript
const http = require("http");

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // req: IncomingMessage（请求对象，是可读流）
  // res: ServerResponse（响应对象，是可写流）
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World");
});

// 监听端口
server.listen(3000, () => {
  console.log("服务器运行在 http://localhost:3000");
});
\`\`\`

#### 发起请求

\`\`\`javascript
// 方式1: http.request
const req = http.request("http://example.com", (res) => {
  res.on("data", (chunk) => console.log(chunk.toString()));
});
req.end();

// 方式2: http.get（简化版，只能 GET）
http.get("http://example.com", (res) => {
  res.on("data", (chunk) => console.log(chunk.toString()));
});

// 方式3: fetch（Node 18+ 内置全局）
const res = await fetch("http://example.com");
const data = await res.json();
\`\`\`

### IncomingMessage（请求对象）详解

\`req\` 对象（继承自 Readable 流）的常用属性：

| 属性 | 说明 | 示例 |
| --- | --- | --- |
| \`req.method\` | 请求方法 | \`"GET"\` / \`"POST"\` |
| \`req.url\` | 请求路径（含查询串） | \`"/api/users?id=1"\` |
| \`req.headers\` | 请求头对象 | \`{host: "example.com"}\` |
| \`req.httpVersion\` | HTTP 版本 | \`"1.1"\` |
| \`req.socket\` | 底层 socket | - |

#### 读取请求体

\`req\` 是可读流，通过 \`data\` / \`end\` 事件读取请求体：

\`\`\`javascript
server.on("request", (req, res) => {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    console.log("请求体:", body);
    res.end("收到");
  });
});
\`\`\`

### ServerResponse（响应对象）详解

\`res\` 对象（继承自 Writable 流）的常用方法：

| 方法 | 说明 |
| --- | --- |
| \`res.writeHead(status, headers)\` | 设置状态码和响应头 |
| \`res.setHeader(name, value)\` | 设置单个响应头 |
| \`res.write(data)\` | 写入响应体（可多次调用） |
| \`res.end([data])\` | 结束响应（必须调用） |
| \`res.statusCode = 200\` | 设置状态码 |
| \`res.statusMessage = "OK"\` | 设置状态消息 |

#### 设置响应头

\`\`\`javascript
// 方式1: writeHead（一次设置）
res.writeHead(200, {
  "Content-Type": "application/json",
  "X-Custom-Header": "value"
});

// 方式2: setHeader + statusCode（分步设置）
res.statusCode = 200;
res.setHeader("Content-Type", "application/json");
\`\`\`

> \`writeHead\` 会立即发送头部，之后不能再用 \`setHeader\`。推荐用 \`setHeader\` + \`end\`，更灵活。

### 路由实现原理

路由是根据请求的 \`method\` + \`pathname\` 分发到不同处理函数：

\`\`\`javascript
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const { method } = req;
  const { pathname } = url;

  if (pathname === "/api/users" && method === "GET") {
    // 处理获取用户列表
  } else if (pathname === "/api/users" && method === "POST") {
    // 处理创建用户
  } else if (pathname.startsWith("/api/users/") && method === "GET") {
    // 处理获取单个用户
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});
\`\`\`

#### 路由参数

| 参数类型 | 位置 | 获取方式 | 示例 |
| --- | --- | --- | --- |
| 路径参数 | URL 路径 | \`/:id\` | \`/api/users/42\` → \`id=42\` |
| 查询参数 | URL 查询串 | \`?key=value\` | \`?q=node&page=1\` |
| 请求体 | body | \`req.on('data')\` | \`{"name":"张三"}\` |
| 请求头 | headers | \`req.headers\` | \`Authorization: Bearer xxx\` |

### 中间件概念

中间件（Middleware）是在请求到达路由处理函数之前/之后执行的函数链。Express 的核心就是中间件系统：

\`\`\`javascript
// Express 中间件示例
app.use((req, res, next) => {
  console.log(req.method, req.url); // 日志中间件
  next(); // 调用 next() 传递给下一个中间件
});

app.use((req, res, next) => {
  res.setHeader("X-Custom", "value"); // 设置响应头
  next();
});

app.get("/api/users", (req, res) => {
  res.json({ users: [] }); // 路由处理
});
\`\`\`

#### 中间件执行流程

\`\`\`
请求 → [日志中间件] → [CORS中间件] → [解析中间件] → [路由处理] → 响应
         ↓ next()       ↓ next()       ↓ next()
\`\`\`

### HTTPS 简介

HTTPS = HTTP + TLS/SSL。通过加密防止数据被窃听和篡改。

\`\`\`javascript
const https = require("https");
const fs = require("fs");

const server = https.createServer({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
}, (req, res) => {
  res.end("Secure Hello");
});

server.listen(443);
\`\`\`

> 生产环境通常用 Nginx 做 TLS 终止，Node.js 只处理 HTTP。或用 Let's Encrypt 免费证书。

### Web 框架简介

| 框架 | 特点 | 适用场景 |
| --- | --- | --- |
| **Express** | 最流行，简单灵活，中间件丰富 | 中小型项目、API 服务 |
| **Koa** | 语法现代，async/await 原生支持 | 现代项目 |
| **Fastify** | 高性能，Schema 验证，插件系统 | 高性能 API |
| **NestJS** | 企业级，TypeScript，依赖注入 | 大型企业项目 |
| **Next.js** | 全栈框架，SSR/SSG/API Routes | 全栈 Web 应用 |

#### Express 简单示例

\`\`\`javascript
const express = require("express");
const app = express();

app.use(express.json()); // JSON 解析中间件

app.get("/api/users", (req, res) => {
  res.json({ users: [{ id: 1, name: "小明" }] });
});

app.post("/api/users", (req, res) => {
  const user = req.body;
  res.status(201).json({ id: Date.now(), ...user });
});

app.listen(3000);
\`\`\`

### 常见陷阱

1. **忘记调用 \`res.end()\`**：请求会一直挂起，最终超时

2. **writeHead 后 setHeader**：\`writeHead\` 已发送头部，\`setHeader\` 无效

3. **路由顺序**：更具体的路由要放在更通用的路由前面

4. **异步处理忘记 end**：异步回调中要确保 \`res.end()\` 被调用

5. **端口冲突**：多个服务监听同一端口会报 EADDRINUSE

下面这段代码用 EventEmitter 和 URL 模拟 HTTP 服务器的核心概念。`,
    code: `// ============================================================
// 第五章代码演示：HTTP 概念模拟（沙箱无法 require http）
// ============================================================
// 用 EventEmitter 模拟 HTTP 服务器，用 URL 解析请求路径
// 演示：请求/响应模型、路由分发、中间件链、状态码

var EventEmitter = require("events");
var url = require("url");

// ---- 1. 模拟 ServerResponse（对应 http.ServerResponse）----
class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.statusMessage = "OK";
    this.headers = {};
    this.body = "";
    this.finished = false;
    this.headersSent = false;
  }
  // writeHead：设置状态码和响应头
  writeHead(status, headers) {
    this.statusCode = status;
    if (headers) {
      this.headers = Object.assign({}, this.headers, headers);
    }
    this.headersSent = true;
  }
  // setHeader：设置单个响应头
  setHeader(name, value) {
    this.headers[name] = value;
  }
  // write：写入响应体（可多次调用）
  write(data) {
    if (this.finished) throw new Error("Cannot write after end()");
    this.body += typeof data === "string" ? data : data.toString();
  }
  // end：结束响应（必须调用）
  end(data) {
    if (data !== undefined) {
      this.body += typeof data === "string" ? data : data.toString();
    }
    this.finished = true;
    this.headersSent = true;
  }
}

// ---- 2. 模拟 HTTP 服务器（对应 http.createServer）----
class MockHTTPServer extends EventEmitter {
  constructor() {
    super();
    this.middleware = [];
  }
  // use：注册中间件（类似 Express）
  use(fn) {
    this.middleware.push(fn);
    return this;
  }
  // 模拟接收 HTTP 请求
  handleRequest(method, requestUrl, headers, body) {
    headers = headers || {};
    body = body || "";

    // 用 WHATWG URL 解析请求 URL（需要提供 origin）
    var parsedUrl = new URL(requestUrl, "http://localhost:3000");

    // 构造请求对象（对应 http.IncomingMessage）
    var req = {
      method: method,
      url: requestUrl,
      headers: headers,
      body: body,
      parsedUrl: parsedUrl,
      // 查询参数（从 searchParams 转为普通对象）
      query: {},
    };
    parsedUrl.searchParams.forEach(function (value, key) {
      req.query[key] = value;
    });

    // 构造响应对象
    var res = new MockResponse();

    // 触发 request 事件（模拟 http server 的 request 事件）
    this.emit("request", req, res);

    return { req: req, res: res };
  }
}

// ---- 3. 创建服务器并注册中间件 ----
console.log("===== 3. 创建 HTTP 服务器（模拟）=====");
var server = new MockHTTPServer();

// 中间件1：日志记录
console.log("注册中间件：日志记录");
server.use(function (req, res, next) {
  console.log("  [日志] " + req.method + " " + req.url);
  next();
});

// 中间件2：CORS 响应头
console.log("注册中间件：CORS");
server.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  next();
});

// 中间件3：JSON 请求体解析
console.log("注册中间件：JSON 解析");
server.use(function (req, res, next) {
  if (req.body && req.headers["Content-Type"] === "application/json") {
    try {
      req.body = JSON.parse(req.body);
      console.log("  [解析] JSON body 已解析");
    } catch (e) {
      console.log("  [解析] JSON 解析失败: " + e.message);
    }
  }
  next();
});

// ---- 4. 路由分发 ----
console.log("\\n===== 4. 路由分发 =====");
server.on("request", function (req, res) {
  // 执行中间件链
  var mwIndex = 0;
  var runNext = function () {
    if (mwIndex < server.middleware.length) {
      var mw = server.middleware[mwIndex++];
      mw(req, res, runNext);
    } else {
      // 所有中间件执行完毕，进入路由
      handleRoute(req, res);
    }
  };
  runNext();
});

// 路由处理函数
function handleRoute(req, res) {
  var method = req.method;
  var path = req.parsedUrl.pathname;
  var params = req.parsedUrl.searchParams;

  // GET / - 首页
  if (path === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>欢迎来到首页</h1>");
    return;
  }

  // GET /api/users - 用户列表
  if (path === "/api/users" && method === "GET") {
    var users = [
      { id: 1, name: "小明", age: 20 },
      { id: 2, name: "小红", age: 22 },
      { id: 3, name: "小刚", age: 19 },
    ];
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(users));
    return;
  }

  // GET /api/users/:id - 获取单个用户（模拟路径参数）
  if (path.indexOf("/api/users/") === 0 && method === "GET") {
    var userId = parseInt(path.split("/").pop(), 10);
    if (isNaN(userId)) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("400 Bad Request - 无效的用户 ID");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ id: userId, name: "用户" + userId, age: 25 }));
    return;
  }

  // GET /api/search?q=keyword - 搜索（模拟查询参数）
  if (path === "/api/search" && method === "GET") {
    var q = params.get("q") || "";
    var page = params.get("page") || "1";
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      query: q,
      page: parseInt(page, 10),
      results: [
        { title: "包含 '" + q + "' 的结果 1" },
        { title: "包含 '" + q + "' 的结果 2" },
      ],
    }));
    return;
  }

  // POST /api/echo - 回显请求体
  if (path === "/api/echo" && method === "POST") {
    var bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("收到 POST: " + bodyStr);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found - " + path);
}

// ---- 5. 模拟多个 HTTP 请求 ----
console.log("\\n===== 5. 模拟 HTTP 请求 =====");
var testRequests = [
  { method: "GET", url: "/" },
  { method: "GET", url: "/api/users" },
  { method: "GET", url: "/api/users/42" },
  { method: "GET", url: "/api/search?q=nodejs&page=2" },
  { method: "POST", url: "/api/echo", headers: { "Content-Type": "application/json" }, body: '{"msg":"hello"}' },
  { method: "GET", url: "/unknown/path" },
];

testRequests.forEach(function (tc, i) {
  console.log("\\n--- 请求 #" + (i + 1) + ": " + tc.method + " " + tc.url + " ---");
  var result = server.handleRequest(tc.method, tc.url, tc.headers, tc.body);
  var res = result.res;
  console.log("  响应状态:", res.statusCode);
  console.log("  响应头:", JSON.stringify(res.headers));
  var bodyPreview = res.body.length > 80 ? res.body.slice(0, 80) + "..." : res.body;
  console.log("  响应体:", bodyPreview);
});

// ---- 6. HTTP 状态码说明 ----
console.log("\\n\\n===== 6. HTTP 状态码 =====");
var statusCodes = {
  "2xx 成功": { 200: "OK", 201: "Created", 204: "No Content" },
  "3xx 重定向": { 301: "Moved Permanently", 302: "Found", 304: "Not Modified" },
  "4xx 客户端错误": { 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found" },
  "5xx 服务端错误": { 500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable" },
};
Object.keys(statusCodes).forEach(function (category) {
  console.log("  " + category + ":");
  Object.keys(statusCodes[category]).forEach(function (code) {
    console.log("    " + code + " - " + statusCodes[category][code]);
  });
});

// ---- 7. HTTP 请求方法 ----
console.log("\\n===== 7. HTTP 请求方法 =====");
var httpMethods = [
  ["GET", "获取资源", "安全且幂等"],
  ["POST", "创建资源", "非幂等"],
  ["PUT", "完整更新", "幂等"],
  ["PATCH", "部分更新", "非幂等"],
  ["DELETE", "删除资源", "幂等"],
  ["HEAD", "只获取头", "安全且幂等"],
  ["OPTIONS", "查询支持的方法", "安全且幂等"],
];
httpMethods.forEach(function (m) {
  console.log("  " + m[0].padEnd(8) + " " + m[1].padEnd(8) + " (" + m[2] + ")");
});

// ---- 8. URL 解析实战（HTTP 请求行解析）----
console.log("\\n===== 8. URL 解析实战 =====");
// 模拟解析 HTTP 请求行
var requestLines = [
  "GET /api/users?role=admin&page=1 HTTP/1.1",
  "POST /api/login HTTP/1.1",
  "DELETE /api/users/42 HTTP/1.1",
];

requestLines.forEach(function (line) {
  var parts = line.split(" ");
  var method = parts[0];
  var fullUrl = parts[1];
  var version = parts[2];
  var parsed = new URL(fullUrl, "http://localhost");
  console.log("  " + line);
  console.log("    方法: " + method + ", 路径: " + parsed.pathname + ", 查询: " + parsed.search + ", 版本: " + version);
});

// ---- 9. 真实 http 模块用法（参考代码）----
console.log("\\n===== 9. 真实 http 模块用法（参考）=====");
console.log("// 沙箱无法运行以下代码，仅作参考：");
console.log("//");
console.log("// const http = require('http');");
console.log("//");
console.log("// // 创建服务器");
console.log("// const server = http.createServer((req, res) => {");
console.log("//   const url = new URL(req.url, 'http://localhost:3000');");
console.log("//   if (url.pathname === '/') {");
console.log("//     res.writeHead(200, {'Content-Type':'text/plain'});");
console.log("//     res.end('Hello World');");
console.log("//   }");
console.log("// });");
console.log("//");
console.log("// server.listen(3000, () => console.log('Server on :3000'));");
console.log("//");
console.log("// // 发起请求");
console.log("// http.get('http://example.com', (res) => {");
console.log("//   res.on('data', chunk => console.log(chunk.toString()));");
console.log("// });");
console.log("//");
console.log("// // 或用 fetch（Node 18+ 内置）");
console.log("// const res = await fetch('http://example.com');");
console.log("// const data = await res.json();");

// ---- 10. 模拟 Express 风格的路由 ----
console.log("\\n===== 10. 模拟 Express 风格路由 =====");
// 简化的路由注册器
var routes = [];

function registerRoute(method, path, handler) {
  routes.push({ method: method, path: path, handler: handler });
}

// 注册路由
registerRoute("GET", "/", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("首页");
});

registerRoute("GET", "/api/time", function (req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ time: new Date().toISOString() }));
});

registerRoute("POST", "/api/upper", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(String(req.body).toUpperCase());
});

// 模拟请求
console.log("注册了 " + routes.length + " 条路由");
routes.forEach(function (r) {
  console.log("  " + r.method.padEnd(6) + " " + r.path);
});

// 测试路由匹配
var testReq = { method: "GET", url: "/api/time" };
var matchedRoute = routes.find(function (r) {
  return r.method === testReq.method && r.path === new URL(testReq.url, "http://localhost").pathname;
});
if (matchedRoute) {
  console.log("\\n匹配到路由: " + matchedRoute.method + " " + matchedRoute.path);
  var testRes = new MockResponse();
  matchedRoute.handler({ method: testReq.method, parsedUrl: new URL(testReq.url, "http://localhost") }, testRes);
  console.log("响应:", testRes.statusCode, testRes.body);
} else {
  console.log("未匹配到路由");
}`,
  },

  // =========================================================
  // 第六章：加密模块 (Crypto)
  // =========================================================
  {
    id: "crypto",
    title: "加密模块 (Crypto)",
    icon: "🔐",
    group: "核心模块",
    content: `## 加密模块 (Crypto)

\`crypto\` 模块提供了加密、解密、签名、哈希等安全功能。无论你是存储用户密码、验证 API 签名、加密敏感数据，还是生成随机令牌，都离不开这个模块。

### 加密基础概念

#### 1. 哈希 (Hash)

哈希是将**任意长度**数据映射为**固定长度**摘要的单向函数。

\`\`\`
"Hello" → SHA-256 → "185f8db...e8d4c2"（64 字符十六进制）
\`\`\`

特点：
- **单向**：无法从哈希值还原原文
- **确定性**：相同输入永远得到相同输出
- **雪崩效应**：输入微小变化导致输出剧烈变化
- **固定长度**：无论输入多大，输出长度固定

用途：文件完整性校验、密码存储（需加盐）、数字签名

#### 2. 对称加密 (Symmetric Encryption)

加密和解密使用**同一把密钥**。

\`\`\`
明文 → [密钥加密] → 密文 → [同一密钥解密] → 明文
\`\`\`

特点：速度快，适合大量数据加密。但密钥分发是难题。

常用算法：AES-256-CBC、AES-256-GCM、ChaCha20

#### 3. 非对称加密 (Asymmetric Encryption)

使用**一对密钥**：公钥（公开）和私钥（保密）。

\`\`\`
公钥加密 → 私钥解密（保密通信）
私钥签名 → 公钥验证（数字签名）
\`\`\`

特点：解决了密钥分发问题，但速度慢。常用算法：RSA、ECDSA、Ed25519

#### 4. 签名 (Signature)

用私钥对数据签名，用公钥验证签名，确保数据**未被篡改**且**来源可信**。

#### 5. 编码 (Encoding)

加密操作产生的二进制数据通常用编码表示：

| 编码 | 说明 | 示例 |
| --- | --- | --- |
| \`hex\` | 十六进制 | \`48656c6c6f\` |
| \`base64\` | Base64 | \`SGVsbG8=\` |
| \`utf8\` | UTF-8 文本 | \`Hello\` |
| \`binary\` / \`latin1\` | 原始字节 | - |

### Hash 算法

\`crypto.createHash(algorithm)\` 创建哈希对象：

\`\`\`javascript
const crypto = require("crypto");

const hash = crypto.createHash("sha256")
  .update("Hello, World!")
  .digest("hex");
// "dffd6021bb2bd5b0af676290809ec3a5..."

// 分段 update
const h = crypto.createHash("sha256");
h.update("Hello, ");
h.update("World!");
h.digest("hex"); // 与上面相同
\`\`\`

#### 常用哈希算法对比

| 算法 | 输出长度 | 安全性 | 速度 | 用途 |
| --- | --- | --- | --- | --- |
| \`md5\` | 128 位 (32 hex) | ❌ 不安全 | 最快 | 文件校验（非安全场景） |
| \`sha1\` | 160 位 (40 hex) | ❌ 不安全 | 快 | Git（已不推荐） |
| \`sha256\` | 256 位 (64 hex) | ✅ 安全 | 中等 | 通用推荐 |
| \`sha512\` | 512 位 (128 hex) | ✅ 安全 | 中等 | 高安全需求 |

> **密码存储不要用纯哈希**！因为哈希是确定性的，相同密码产生相同哈希，容易被彩虹表破解。应该用 PBKDF2 / scrypt / bcrypt 等慢哈希 + 盐。

#### update 和 digest

\`\`\`javascript
const h = crypto.createHash("sha256");
h.update("数据块1"); // 可以多次 update
h.update("数据块2");
h.update("数据块3");
const result = h.digest("hex"); // digest 后不能再 update
\`\`\`

\`digest()\` 的参数：
- \`"hex"\`：十六进制字符串（最常用）
- \`"base64"\`：Base64 字符串
- \`"binary"\` / \`"latin1"\`：原始字节字符串
- 不传参：返回 Buffer

### HMAC（带密钥的哈希）

HMAC（Hash-based Message Authentication Code）是用密钥增强的哈希。只有知道密钥的人才能生成和验证 HMAC。

\`\`\`javascript
const hmac = crypto.createHmac("sha256", "secret-key")
  .update("message")
  .digest("hex");
\`\`\`

#### HMAC vs Hash

| 特性 | Hash | HMAC |
| --- | --- | --- |
| 密钥 | 无 | 有 |
| 验证 | 任何人都能计算 | 需要密钥 |
| 用途 | 完整性校验 | 完整性 + 身份验证 |
| 场景 | 文件校验 | API 签名、JWT |

#### API 签名示例

\`\`\`javascript
// 客户端生成签名
function sign(params, secret) {
  const sorted = Object.keys(params).sort()
    .map(k => k + "=" + params[k]).join("&");
  return crypto.createHmac("sha256", secret).update(sorted).digest("hex");
}

// 服务端验证签名
function verify(params, secret, signature) {
  return sign(params, secret) === signature;
}
\`\`\`

### 对称加密

\`crypto.createCipheriv(algorithm, key, iv)\` 创建加密器，\`createDecipheriv\` 创建解密器。

#### AES-256-CBC 示例

\`\`\`javascript
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32); // AES-256 需要 32 字节密钥
const iv = crypto.randomBytes(16);  // CBC 模式需要 16 字节 IV

// 加密
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// 解密
function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
\`\`\`

#### 参数说明

| 参数 | 说明 | AES-256-CBC 要求 |
| --- | --- | --- |
| \`key\` | 加密密钥 | 32 字节（256 位） |
| \`iv\` | 初始向量 | 16 字节（每次加密应不同） |
| \`algorithm\` | 算法 | \`aes-256-cbc\` / \`aes-256-gcm\` |

#### CBC vs GCM

| 模式 | 认证 | 并行 | 推荐 |
| --- | --- | --- | --- |
| CBC | ❌ 无认证 | 解密可并行 | 需额外 MAC |
| GCM | ✅ 带认证 | 可并行 | ✅ 推荐 |

> GCM 模式提供**认证加密**，不仅保密还防篡改。推荐用 \`aes-256-gcm\` 而非 \`aes-256-cbc\`。

#### IV（初始向量）的重要性

IV 的作用是让**相同明文 + 相同密钥**产生**不同密文**。如果每次加密用相同 IV，攻击者可能推断明文关系。

> **最佳实践**：每次加密生成随机 IV，将 IV 和密文一起存储/传输（IV 不需要保密）。

### 随机数

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| \`randomBytes(size)\` | 生成加密安全随机字节 | Buffer |
| \`randomInt(min, max)\` | 生成随机整数 | number |
| \`randomUUID()\` | 生成 UUID v4 | string |

#### randomBytes

\`\`\`javascript
// 同步
const bytes = crypto.randomBytes(16);
console.log(bytes.toString("hex")); // 32 字符十六进制

// 异步（回调）
crypto.randomBytes(16, (err, buf) => {
  console.log(buf.toString("hex"));
});
\`\`\`

> \`randomBytes\` 使用操作系统的加密安全随机数源（如 /dev/urandom），比 \`Math.random()\` 安全得多。\`Math.random()\` **不能用于安全场景**！

#### randomUUID

\`\`\`javascript
crypto.randomUUID(); // "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
\`\`\`

UUID v4 格式：\`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\`，其中 y 是 8/9/a/b。

### PBKDF2（密码派生）

PBKDF2（Password-Based Key Derivation Function 2）通过**多次迭代**哈希来增加暴力破解成本，专门用于密码存储。

\`\`\`javascript
crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
\`\`\`

| 参数 | 说明 | 推荐值 |
| --- | --- | --- |
| \`password\` | 用户密码 | - |
| \`salt\` | 盐（随机） | 16+ 字节 |
| \`iterations\` | 迭代次数 | 100,000+ |
| \`keylen\` | 输出长度 | 64 字节 |
| \`digest\` | 哈希算法 | \`sha512\` / \`sha256\` |

#### 为什么需要 PBKDF2？

直接用 SHA-256 哈希密码的问题：
1. **速度快**：GPU 每秒能计算数十亿次 SHA-256
2. **彩虹表**：预计算的密码-哈希对照表
3. **相同密码相同哈希**：容易被发现重复密码

PBKDF2 的解决方案：
1. **慢**：10 万次迭代让每次验证需要 ~100ms
2. **盐**：随机盐防止彩虹表
3. **不同盐不同哈希**：即使相同密码也产生不同哈希

#### 密码存储最佳实践

\`\`\`javascript
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return salt + ":" + hash; // 盐和哈希一起存储
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const newHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(newHash, "hex"));
}
\`\`\`

> \`timingSafeEqual\` 防止**时序攻击**（通过比较耗时推断字符是否正确）。

### scrypt 简介

\`scrypt\` 是比 PBKDF2 更现代的密码哈希算法，设计上需要大量内存，进一步增加 ASIC/GPU 攻击成本。

\`\`\`javascript
crypto.scryptSync(password, salt, keylen);
\`\`\`

| 特性 | PBKDF2 | scrypt |
| --- | --- | --- |
| CPU 成本 | 高 | 高 |
| 内存成本 | 低 | **高** |
| ASIC 抗性 | 弱 | **强** |
| 推荐度 | 可用 | ✅ 推荐 |

### 数字签名简介

数字签名用非对称加密实现**不可否认性**：

\`\`\`javascript
// 生成密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// 签名
const sign = crypto.createSign("sha256");
sign.update("数据");
sign.end();
const signature = sign.sign(privateKey, "hex");

// 验证
const verify = crypto.createVerify("sha256");
verify.update("数据");
verify.end();
const isValid = verify.verify(publicKey, signature, "hex");
\`\`\`

> 由于沙箱限制，本章代码不演示密钥生成和签名（较复杂），重点演示哈希、HMAC、对称加密、密码存储等常用功能。

### 常见陷阱

1. **用 MD5 存密码**：MD5 不安全，且纯哈希没有盐，容易被彩虹表破解

2. **AES IV 重用**：每次加密必须用新 IV，否则安全性大打折扣

3. **Math.random() 做安全令牌**：\`Math.random()\` 不是加密安全的，必须用 \`crypto.randomBytes()\`

4. **不加盐的密码哈希**：相同密码产生相同哈希，容易被发现

5. **迭代次数太少**：PBKDF2 迭代次数 < 10000 几乎没有保护

6. **密钥硬编码**：密钥不要写在代码里，用环境变量或密钥管理服务

7. **CBC 无认证**：CBC 模式不防篡改，推荐 GCM 模式

下面这段代码演示了 crypto 模块的核心功能。`,
    code: `// ============================================================
// 第六章代码演示：Crypto 加密模块全面实战
// ============================================================
var crypto = require("crypto");

// ---- 1. 哈希（Hash）----
console.log("===== 1. 哈希（Hash）=====");
var data = "Hello, Node.js!";

// 对比不同哈希算法
var algorithms = ["md5", "sha1", "sha256", "sha512"];
algorithms.forEach(function (algo) {
  var hash = crypto.createHash(algo).update(data).digest("hex");
  console.log("  " + algo.padEnd(8) + " (" + hash.length + "字符): " + hash.slice(0, 32) + "...");
});

// 同一输入永远得到相同输出（确定性）
var h1 = crypto.createHash("sha256").update(data).digest("hex");
var h2 = crypto.createHash("sha256").update(data).digest("hex");
console.log("  一致性验证:", h1 === h2);

// 哈希不可逆：无法从哈希值还原原文
console.log("  不可逆: 无法从哈希值还原 '" + data + "'");

// update 可以分多次调用（流式处理）
var hashStream = crypto.createHash("sha256");
hashStream.update("Hello, ");
hashStream.update("Node");
hashStream.update(".js!");
console.log("  分段 update 结果:", hashStream.digest("hex").slice(0, 32) + "...");

// 雪崩效应：微小变化导致巨大差异
var h3 = crypto.createHash("sha256").update("Hello").digest("hex");
var h4 = crypto.createHash("sha256").update("Hello.").digest("hex");
console.log("  雪崩效应:");
console.log("    'Hello'  → " + h3.slice(0, 16) + "...");
console.log("    'Hello.' → " + h4.slice(0, 16) + "...");

// ---- 2. HMAC（带密钥的哈希）----
console.log("\\n===== 2. HMAC（带密钥的哈希）=====");
var secret = "my-secret-key-123";
var hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
console.log("  HMAC-SHA256:", hmac.slice(0, 32) + "...");

// 不同密钥产生不同结果
var hmac2 = crypto.createHmac("sha256", "wrong-key").update(data).digest("hex");
console.log("  正确密钥:", hmac.slice(0, 20) + "...");
console.log("  错误密钥:", hmac2.slice(0, 20) + "...");
console.log("  密钥不同结果不同:", hmac !== hmac2);

// API 签名验证示例
function createSignature(params, key) {
  // 按 key 排序后拼接，确保客户端和服务端一致
  var sortedParams = Object.keys(params).sort().map(function (k) {
    return k + "=" + params[k];
  }).join("&");
  return crypto.createHmac("sha256", key).update(sortedParams).digest("hex");
}

var params = { timestamp: "1700000000", nonce: "abc123", user: "admin" };
var signature = createSignature(params, secret);
console.log("  API 签名:", signature.slice(0, 32) + "...");

// 服务端验证签名
var serverSig = createSignature(params, secret);
console.log("  签名验证:", signature === serverSig ? "通过" : "失败");

// ---- 3. AES 对称加密 ----
console.log("\\n===== 3. AES-256-CBC 对称加密 =====");
var algorithm = "aes-256-cbc";
// AES-256 需要 32 字节（256 位）密钥
var aesKey = crypto.randomBytes(32);
// CBC 模式需要 16 字节（128 位）IV（初始向量）
var aesIv = crypto.randomBytes(16);

function encrypt(text) {
  var cipher = crypto.createCipheriv(algorithm, aesKey, aesIv);
  var encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText) {
  var decipher = crypto.createDecipheriv(algorithm, aesKey, aesIv);
  var decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

var plaintext = "这是一段需要加密的秘密信息";
var encrypted = encrypt(plaintext);
var decrypted = decrypt(encrypted);
console.log("  原文:", plaintext);
console.log("  密文(hex):", encrypted.slice(0, 32) + "...");
console.log("  解密:", decrypted);
console.log("  加解密成功:", plaintext === decrypted);

// IV 的作用：相同明文用不同 IV 得到不同密文
var iv2 = crypto.randomBytes(16);
var cipher2 = crypto.createCipheriv(algorithm, aesKey, iv2);
var encrypted2 = cipher2.update(plaintext, "utf8", "hex") + cipher2.final("hex");
console.log("  相同明文不同 IV:");
console.log("    密文1:", encrypted.slice(0, 20) + "...");
console.log("    密文2:", encrypted2.slice(0, 20) + "...");
console.log("    密文不同:", encrypted !== encrypted2);

// ---- 4. 随机数生成 ----
console.log("\\n===== 4. 随机数生成 =====");
// randomBytes：加密安全的随机字节
var randomBytes16 = crypto.randomBytes(16);
console.log("  16字节随机数(hex):", randomBytes16.toString("hex"));
console.log("  16字节随机数(base64):", randomBytes16.toString("base64"));

// 生成 token（常用场景）
var apiToken = crypto.randomBytes(32).toString("hex");
console.log("  API Token (64字符):", apiToken.slice(0, 20) + "...");

// randomInt：随机整数（含 min，不含 max）
var randomNums = [];
for (var i = 0; i < 5; i++) {
  randomNums.push(crypto.randomInt(1, 101)); // 1~100
}
console.log("  5个随机数(1-100):", randomNums);

// randomUUID：UUID v4
console.log("  UUID 1:", crypto.randomUUID());
console.log("  UUID 2:", crypto.randomUUID());
console.log("  UUID 3:", crypto.randomUUID());
console.log("  UUID 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");

// ---- 5. PBKDF2 密码派生 ----
console.log("\\n===== 5. PBKDF2 密码派生 =====");
var password = "mypassword123";
var salt = crypto.randomBytes(16);

// pbkdf2Sync：同步版本
// 参数：密码, 盐, 迭代次数, 密钥长度, 哈希算法
var iterations = 10000;
var derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512");
console.log("  密码:", password);
console.log("  盐(hex):", salt.toString("hex"));
console.log("  迭代次数:", iterations);
console.log("  派生密钥(hex):", derivedKey.toString("hex").slice(0, 32) + "...");

// 相同密码+盐+参数 → 相同派生密钥
var derived2 = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512");
console.log("  一致性验证:", derivedKey.equals(derived2));

// 不同盐 → 不同派生密钥
var salt2 = crypto.randomBytes(16);
var derived3 = crypto.pbkdf2Sync(password, salt2, iterations, 64, "sha512");
console.log("  不同盐不同结果:", !derivedKey.equals(derived3));

// ---- 6. 密码存储最佳实践（加盐慢哈希）----
console.log("\\n===== 6. 密码存储（PBKDF2 加盐慢哈希）=====");

function hashPassword(pw) {
  // 1. 生成随机盐（每个密码不同的盐）
  var pwSalt = crypto.randomBytes(16).toString("hex");
  // 2. 用 pbkdf2 派生哈希（高迭代次数防止暴力破解）
  var pwHash = crypto.pbkdf2Sync(pw, pwSalt, 100000, 64, "sha512").toString("hex");
  // 3. 存储 salt:hash（盐不需要保密）
  return pwSalt + ":" + pwHash;
}

function verifyPassword(pw, stored) {
  var parts = stored.split(":");
  var pwSalt = parts[0];
  var pwHash = parts[1];
  var newHash = crypto.pbkdf2Sync(pw, pwSalt, 100000, 64, "sha512").toString("hex");
  // 用 timingSafeEqual 防止时序攻击
  var hashBuf = Buffer.from(pwHash, "hex");
  var newHashBuf = Buffer.from(newHash, "hex");
  if (hashBuf.length !== newHashBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, newHashBuf);
}

var storedHash = hashPassword("mypassword123");
console.log("  存储的密码哈希:", storedHash.slice(0, 40) + "...");
console.log("  验证正确密码:", verifyPassword("mypassword123", storedHash));
console.log("  验证错误密码:", verifyPassword("wrongpassword", storedHash));
console.log("  验证另一错误密码:", verifyPassword("admin123", storedHash));

// 相同密码两次哈希结果不同（因为盐不同）
var storedHash2 = hashPassword("mypassword123");
console.log("  相同密码两次哈希不同:", storedHash !== storedHash2);
console.log("  但都能验证通过:", verifyPassword("mypassword123", storedHash) && verifyPassword("mypassword123", storedHash2));

// ---- 7. scrypt 密码哈希 ----
console.log("\\n===== 7. scrypt 密码哈希 =====");
function hashWithScrypt(pw) {
  var scryptSalt = crypto.randomBytes(16).toString("hex");
  var scryptHash = crypto.scryptSync(pw, scryptSalt, 64).toString("hex");
  return scryptSalt + ":" + scryptHash;
}
function verifyWithScrypt(pw, stored) {
  var parts = stored.split(":");
  var scryptSalt = parts[0];
  var scryptHash = parts[1];
  var newHash = crypto.scryptSync(pw, scryptSalt, 64).toString("hex");
  return scryptHash === newHash;
}

var scryptHash = hashWithScrypt("mypassword123");
console.log("  scrypt 哈希:", scryptHash.slice(0, 40) + "...");
console.log("  验证正确密码:", verifyWithScrypt("mypassword123", scryptHash));
console.log("  验证错误密码:", verifyWithScrypt("wrong", scryptHash));

// ---- 8. 文件完整性校验 ----
console.log("\\n===== 8. 文件完整性校验 =====");
var fileContent = "这是文件的内容，用于校验完整性\\n第二行内容\\n";
var fileHash = crypto.createHash("sha256").update(fileContent).digest("hex");
console.log("  文件内容:", fileContent.split("\\n")[0].trim() + "...");
console.log("  SHA-256:", fileHash.slice(0, 32) + "...");

// 模拟传输后校验（内容一致）
var receivedContent = "这是文件的内容，用于校验完整性\\n第二行内容\\n";
var receivedHash = crypto.createHash("sha256").update(receivedContent).digest("hex");
console.log("  接收内容哈希:", receivedHash.slice(0, 32) + "...");
console.log("  完整性校验:", fileHash === receivedHash ? "通过（内容一致）" : "失败");

// 模拟篡改后校验
var tamperedContent = fileContent + "被篡改的内容";
var tamperedHash = crypto.createHash("sha256").update(tamperedContent).digest("hex");
console.log("  篡改内容哈希:", tamperedHash.slice(0, 32) + "...");
console.log("  完整性校验:", fileHash === tamperedHash ? "通过" : "失败（检测到篡改）");

// ---- 9. 实战：安全的用户认证系统 ----
console.log("\\n===== 9. 实战：用户认证系统 =====");
// 模拟用户数据库
var userDB = {};

// 注册：存储密码哈希
function register(username, password) {
  if (userDB[username]) {
    return { success: false, message: "用户已存在" };
  }
  userDB[username] = {
    username: username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  return { success: true, message: "注册成功" };
}

// 登录：验证密码
function login(username, password) {
  var user = userDB[username];
  if (!user) {
    return { success: false, message: "用户不存在" };
  }
  if (verifyPassword(password, user.passwordHash)) {
    // 生成会话 token
    var token = crypto.randomBytes(32).toString("hex");
    return { success: true, token: token, message: "登录成功" };
  }
  return { success: false, message: "密码错误" };
}

// 测试注册和登录
console.log("  注册用户 'alice':", register("alice", "password123").message);
console.log("  注册用户 'alice'（重复）:", register("alice", "password123").message);
console.log("  登录（正确密码）:", login("alice", "password123").message);
console.log("  登录（错误密码）:", login("alice", "wrongpassword").message);
console.log("  登录（不存在用户）:", login("bob", "password123").message);

// ---- 10. 加密算法对比 ----
console.log("\\n===== 10. 加密算法对比 =====");
// 各种加密算法的特性对比表
var comparisons = [
  ["MD5", "哈希", "128 位", "❌ 不安全", "文件校验（非安全）"],
  ["SHA-1", "哈希", "160 位", "❌ 不安全", "Git（已不推荐）"],
  ["SHA-256", "哈希", "256 位", "✅ 安全", "通用推荐"],
  ["SHA-512", "哈希", "512 位", "✅ 安全", "高安全需求"],
  ["HMAC-SHA256", "带密钥哈希", "256 位", "✅ 安全", "API 签名 / JWT"],
  ["AES-256-CBC", "对称加密", "可变", "✅ 安全", "数据加密（需额外认证）"],
  ["AES-256-GCM", "对称加密+认证", "可变", "✅ 推荐", "数据加密（防篡改）"],
  ["PBKDF2", "密码派生（慢哈希）", "可变", "✅ 安全", "密码存储"],
  ["scrypt", "密码派生（内存硬）", "可变", "✅ 推荐", "密码存储（抗 ASIC）"],
  ["RSA", "非对称加密", "2048+ 位", "✅ 安全", "签名 / 密钥交换"],
];

// 打印表头
console.log("  " + "算法".padEnd(16) + "类型".padEnd(16) + "输出".padEnd(12) + "安全性".padEnd(14) + "用途");
console.log("  " + "-".repeat(70));
// 打印每一行
comparisons.forEach(function (row) {
  console.log("  " + row[0].padEnd(16) + row[1].padEnd(16) + row[2].padEnd(12) + row[3].padEnd(14) + row[4]);
});

// ---- 11. 加密方案选择指南 ----
console.log("\\n===== 11. 加密方案选择指南 =====");
var guide = [
  ["存储用户密码", "PBKDF2 / scrypt + 随机盐", "慢哈希防暴力破解，盐防彩虹表"],
  ["校验文件完整性", "SHA-256", "单向哈希，确定性强"],
  ["API 请求签名", "HMAC-SHA256", "带密钥，可验证来源"],
  ["加密敏感数据", "AES-256-GCM", "认证加密，防篡改"],
  ["生成会话 token", "crypto.randomBytes(32)", "加密安全随机数"],
  ["生成唯一 ID", "crypto.randomUUID()", "UUID v4，无碰撞"],
  ["数字签名", "RSA / Ed25519", "不可否认性"],
  ["HTTPS 通信", "TLS + RSA/ECDHE", "传输层加密"],
];
guide.forEach(function (item, i) {
  console.log("  " + (i + 1) + ". " + item[0]);
  console.log("     推荐: " + item[1]);
  console.log("     原因: " + item[2]);
});

console.log("\\n===== 加密模块演示结束 =====");
console.log("提示：永远不要用 Math.random() 生成安全令牌！");
console.log("提示：密码存储不要用纯哈希，要用 PBKDF2/scrypt/bcrypt + 盐！");
console.log("提示：AES 推荐用 GCM 模式（带认证），而非 CBC 模式！");`,
  },
];