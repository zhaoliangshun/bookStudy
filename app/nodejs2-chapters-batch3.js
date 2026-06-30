export const chapters = [
  {
    id: "n2-os-module",
    title: "os 模块与系统信息获取",
    icon: "💻",
    group: "第二部分 核心模块与源码原理",
    content: `# os 模块与系统信息获取

## 一、os 模块概述

Node.js 的 \`os\` 模块是一个核心模块，提供了与操作系统相关的实用方法和属性。通过 os 模块，我们可以获取当前运行环境的系统信息，包括操作系统类型、CPU 架构、内存使用情况、网络接口、用户目录等。这些信息在编写跨平台应用、性能监控、集群部署时非常有用。

os 模块不需要安装，直接通过 \`require('os')\` 即可使用。它的所有方法都是同步的，因为系统信息通常是瞬时读取的，不需要异步回调。

### 1.1 为什么需要 os 模块

在实际开发中，os 模块的使用场景非常广泛：

1. **集群部署**：通过 \`os.cpus().length\` 获取 CPU 核心数，决定创建多少个工作进程，充分利用多核 CPU。
2. **跨平台兼容**：通过 \`os.platform()\` 判断当前运行平台（win32、darwin、linux），编写平台特定的代码路径。
3. **系统监控**：定期获取内存使用、CPU 负载等信息，用于健康检查和告警。
4. **路径处理**：通过 \`os.homedir()\`、\`os.tmpdir()\` 获取用户目录和临时目录，避免硬编码路径。
5. **网络配置**：通过 \`os.networkInterfaces()\` 获取本机 IP 地址，用于服务发现或绑定。

## 二、基础系统信息

### 2.1 os.platform()

返回操作系统平台，可能的值：
- \`'darwin'\` - macOS
- \`'linux'\` - Linux
- \`'win32'\` - Windows

注意：即使在 64 位 Windows 上，也返回 \`'win32'\`。

### 2.2 os.arch()

返回 CPU 架构，可能的值：\`'arm'\`、\`'arm64'\`、\`'ia32'\`、\`'x64'\` 等。

### 2.3 os.type()

返回操作系统名称，在 Linux 上返回 \`'Linux'\`，在 macOS 上返回 \`'Darwin'\`，在 Windows 上返回 \`'Windows_NT'\`。

### 2.4 os.release()

返回操作系统的发行版本号。例如在 macOS 上可能是 \`'22.6.0'\`，在 Linux 上是内核版本。

## 三、CPU 信息与多核利用

### 3.1 os.cpus()

\`os.cpus()\` 返回一个数组，包含每个逻辑 CPU 核心的信息。每个对象包含：
- \`model\`：CPU 型号字符串
- \`speed\`：CPU 频率（MHz）
- \`times\`：包含 user、nice、sys、idle、irq 五个字段的对象，单位是毫秒

这是 os 模块最常用的方法之一，主要用途：

1. **确定集群进程数**：在使用 Node.js 的 \`cluster\` 模块时，通常根据 CPU 核心数来 fork 工作进程，通常设置为 \`os.cpus().length\`。
2. **计算 CPU 使用率**：通过两次采样 \`times\` 数据，计算时间差得到 CPU 使用率。
3. **检测硬件环境**：判断是否在容器环境。

注意：\`os.cpus().length\` 返回的是逻辑核心数（包括超线程），不是物理核心数。

## 四、内存信息

### 4.1 os.totalmem()

返回系统总内存（RAM），单位是字节。可以通过除以 \`1024 * 1024 * 1024\` 转换为 GB。

### 4.2 os.freemem()

返回系统空闲内存，单位是字节。注意：空闲内存不等于可用内存，操作系统会利用空闲内存做文件缓存，实际可用内存通常比 \`freemem()\` 返回的要多。

## 五、用户与目录信息

### 5.1 os.homedir()

返回当前用户的主目录路径：
- Linux/macOS: \`/home/username\` 或 \`/Users/username\`
- Windows: \`C:\\Users\\username\`

这比读取环境变量 \`HOME\` 或 \`USERPROFILE\` 更可靠。

### 5.2 os.tmpdir()

返回操作系统默认的临时文件目录：
- Linux/macOS: \`/tmp\`
- Windows: \`C:\\Users\\username\\AppData\\Local\\Temp\`

临时目录适合存放临时文件，操作系统可能会定期清理。

### 5.3 os.userInfo()

返回当前用户的信息，包含 uid、gid、username、homedir、shell。

## 六、网络接口信息

### 6.1 os.networkInterfaces()

返回一个对象，键是网络接口名称（如 \`'eth0'\`、\`'en0'\`、\`'Wi-Fi'\`），值是该接口的地址信息数组。每个地址对象包含：
- \`address\`：IP 地址
- \`netmask\`：子网掩码
- \`family\`：\`'IPv4'\` 或 \`'IPv6'\`
- \`mac\`：MAC 地址
- \`internal\`：是否是内部接口（如 127.0.0.1 回环接口）
- \`cidr\`：CIDR 表示的地址（如 \`'192.168.1.100/24'\`）

常见用途：获取本机的局域网 IP 地址。

### 6.2 os.hostname()

返回主机名，即操作系统的主机名。

## 七、系统负载与运行时间

### 7.1 os.loadavg()

返回一个包含 1、5、15 分钟平均负载的数组。这是 Unix 系统特有的概念，Windows 上始终返回 \`[0, 0, 0]\`。

平均负载的含义：
- 负载为 1.0 表示一个 CPU 核心刚好被占满
- 如果是 4 核 CPU，负载 4.0 表示满载

注意：负载高不一定意味着 CPU 繁忙，等待 I/O（磁盘、网络）的进程也会计入负载。

### 7.2 os.uptime()

返回系统运行时间，单位是秒。

## 八、行结束符与其他常量

### 8.1 os.EOL

操作系统的行结束符常量：
- Windows: \`'\\r\\n'\` (CRLF)
- Linux/macOS: \`'\\n'\` (LF)

当需要生成跨平台的文本文件时，应该使用 \`os.EOL\` 而不是硬编码。

## 九、最佳实践

### 9.1 集群进程数设置

不是越多越好。对于 I/O 密集型应用，\`os.cpus().length\` 是个好的起点；对于 CPU 密集型应用，可能需要减少进程数。

### 9.2 跨平台路径处理

永远使用 \`path\` 模块处理路径，而不是字符串拼接。\`os.homedir()\` 返回的路径在不同平台格式不同，配合 \`path.join()\` 才能正确拼接。

### 9.3 tmpdir 安全问题

临时目录是所有用户可写的，不要在临时目录中存放敏感信息，创建临时文件时要使用唯一的文件名。

## 十、总结

os 模块是 Node.js 提供的一个简单但非常实用的核心模块，它让我们能够获取运行环境的系统信息。掌握 os 模块的关键方法，能够帮助我们编写跨平台兼容的代码、根据系统资源合理配置应用、实现系统监控。在实际开发中，os 模块经常和 cluster、path、process 等模块配合使用，构建健壮的 Node.js 应用。`,
    code: `const os = require('os');

console.log('========== os 模块完整演示 ==========\\n');

console.log('【1. 基础系统信息】');
console.log('操作系统平台:', os.platform());
console.log('CPU 架构:', os.arch());
console.log('操作系统类型:', os.type());
console.log('操作系统版本:', os.release());
console.log('主机名:', os.hostname());
console.log('');

console.log('【2. 目录信息】');
console.log('用户主目录:', os.homedir());
console.log('临时目录:', os.tmpdir());
console.log('');

console.log('【3. 当前用户信息】');
const userInfo = os.userInfo();
console.log('用户名:', userInfo.username);
console.log('UID:', userInfo.uid);
console.log('Shell:', userInfo.shell);
console.log('');

console.log('【4. CPU 信息】');
const cpus = os.cpus();
console.log('逻辑 CPU 核心数:', cpus.length);
console.log('CPU 型号:', cpus[0].model);
console.log('CPU 频率:', cpus[0].speed, 'MHz');
console.log('');

console.log('【5. 内存信息】');
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
console.log('系统总内存:', (totalMem / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('空闲内存:', (freeMem / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('已用内存:', (usedMem / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('内存使用率:', ((usedMem / totalMem) * 100).toFixed(2) + '%');
console.log('');

console.log('【6. 网络接口信息】');
const interfaces = os.networkInterfaces();
for (const [name, addrs] of Object.entries(interfaces)) {
  console.log(\`\\n接口: \${name}\`);
  for (const addr of addrs) {
    if (addr.family === 'IPv4' && !addr.internal) {
      console.log(\`  IPv4: \${addr.address}\`);
      console.log(\`  MAC 地址: \${addr.mac}\`);
      console.log(\`  CIDR: \${addr.cidr}\`);
    }
  }
}
console.log('');

console.log('【7. 系统运行状态】');
console.log('系统运行时间:', (os.uptime() / 3600).toFixed(2), '小时');
const loadavg = os.loadavg();
console.log('平均负载 (1/5/15分钟):', loadavg.map(l => l.toFixed(2)).join(', '));
console.log('');

console.log('【8. 行结束符】');
console.log('os.EOL 字符码:', os.EOL.split('').map(c => c.charCodeAt(0)));
console.log('当前平台:', os.platform() === 'win32' ? 'CRLF' : 'LF');
console.log('');

function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}
console.log('【实用功能】本机局域网 IP:', getLocalIPv4());
console.log(\`根据 CPU 核心数 (\${cpus.length} 核)，建议创建 \${cpus.length} 个工作进程\`);
console.log('');
console.log('========== os 模块演示结束 ==========');`
  },
  {
    id: "n2-url-module",
    title: "url 模块与URL解析",
    icon: "🔗",
    group: "第二部分 核心模块与源码原理",
    content: `# url 模块与URL解析

## 一、URL 基础概念

URL（Uniform Resource Locator，统一资源定位符）是互联网上资源的地址，是 Web 开发中最常见的概念之一。Node.js 提供了 \`url\` 模块来处理 URL 的解析、格式化和拼接。

一个完整的 URL 包含以下部分：protocol（协议）、auth（认证信息）、host（主机，含 hostname 和 port）、pathname（路径）、search（查询字符串，以 ? 开头）、hash（哈希/锚点，以 # 开头）。

## 二、WHATWG URL API（推荐）

Node.js 从 v10 开始，提供了与浏览器一致的 WHATWG URL API，这是目前推荐使用的 URL 处理方式。旧版的 \`url.parse()\` 虽然仍可用，但已经被标记为遗留 API。

### 2.1 new URL() 构造函数

通过 \`new URL(input[, base])\` 可以创建一个 URL 对象：
- 解析绝对 URL：\`new URL('https://example.com/path?query=1')\`
- 解析相对 URL：\`new URL('/about', 'https://example.com')\`

### 2.2 URL 对象的属性

创建 URL 对象后，可以通过属性访问 URL 的各个部分：

| 属性 | 说明 |
|------|------|
| href | 完整 URL |
| protocol | 协议（含冒号） |
| host | 主机（含端口） |
| hostname | 主机名（不含端口） |
| port | 端口（字符串） |
| origin | 源（只读） |
| pathname | 路径 |
| search | 查询字符串（含 ?） |
| searchParams | URLSearchParams 对象 |
| hash | 哈希（含 #） |

这些属性都是可读写的（除了 origin 是只读），修改属性会自动反映到 href 上。

## 三、URLSearchParams 查询参数处理

\`URLSearchParams\` 是处理查询字符串的强大工具，在 URL 对象上通过 \`searchParams\` 属性访问，也可以单独使用。

### 3.1 获取参数
- \`params.get(key)\`：获取第一个值
- \`params.getAll(key)\`：获取所有值（参数可重复）
- \`params.has(key)\`：是否存在
- \`params.toString()\`：序列化为字符串

### 3.2 修改参数
- \`params.set(key, value)\`：设置（覆盖已有）
- \`params.append(key, value)\`：追加（可重复）
- \`params.delete(key)\`：删除
- \`params.sort()\`：按键名排序

### 3.3 遍历参数
支持 \`for...of\`、\`keys()\`、\`values()\`、\`entries()\`、\`forEach()\`。

## 四、旧版 Legacy URL API

旧版 API 包括 \`url.parse()\`、\`url.format()\`、\`url.resolve()\`，虽然仍然可用，但不推荐在新代码中使用。

### 4.1 为什么推荐 WHATWG API

1. **跨平台一致**：浏览器和 Node.js 使用相同的 API，代码可以在前后端复用
2. **自动编码**：中文、空格等特殊字符自动编码，不容易出错
3. **内置查询参数处理**：URLSearchParams 比 querystring 更强大
4. **标准化**：WHATWG URL 标准是 Web 标准，长期维护

## 五、相对 URL 解析

相对 URL 在 Web 开发中非常常见。第二个参数 \`base\` 是基础 URL：
- 以 \`/\` 开头：替换整个 pathname
- 以 \`//\` 开头：替换协议和主机，保留当前协议
- 以 \`../\` 或 \`./\` 开头：相对当前路径解析
- 其他：追加到当前路径的最后一个目录后

## 六、常见使用场景

### 6.1 HTTP 服务中解析请求 URL

在 Node.js 的 HTTP 服务器中，解析请求 URL 是最常见的场景，需要传入 base 参数（由请求头 host 构造）。

### 6.2 处理 URL 中的中文和特殊字符

当 URL 包含中文时，必须正确编码，使用 URLSearchParams 会自动处理编码问题。

### 6.3 拼接和修改 URL

通过修改 URL 对象的属性来安全地构造 URL，避免手动字符串拼接带来的错误。

## 七、常见陷阱

1. **忘记传 base 参数**：解析相对 URL 时必须传 base，否则会报错
2. **直接操作 search 字符串**：不要直接字符串拼接修改 search，应该用 searchParams
3. **混淆 host 和 hostname**：host 包含端口，hostname 不包含端口

## 八、总结

url 模块推荐使用 WHATWG URL API（\`new URL()\` 和 \`URLSearchParams\`），它与浏览器标准一致，自动处理编码，提供了强大的查询参数操作能力。掌握 URL 对象的各个属性和 URLSearchParams 的增删改查，能够让你在处理 URL 时游刃有余。`,
    code: `const { URL, URLSearchParams } = require('url');

console.log('========== url 模块完整演示 ==========\\n');

console.log('【1. 解析复杂 URL】');
const complexUrl = 'https://user:pass@www.example.com:8080/path/to/resource?query=nodejs&lang=zh&page=2#section-1';
const url = new URL(complexUrl);
console.log('完整 href:', url.href);
console.log('protocol:', url.protocol);
console.log('host:', url.host);
console.log('hostname:', url.hostname);
console.log('port:', url.port);
console.log('pathname:', url.pathname);
console.log('search:', url.search);
console.log('hash:', url.hash);
console.log('');

console.log('【2. URLSearchParams 增删改查】');
const params = url.searchParams;
console.log('原始参数:');
for (const [key, value] of params) {
  console.log(\`  \${key} = \${value}\`);
}
console.log('get("query"):', params.get('query'));
params.set('page', '3');
console.log('set page=3 后:', params.toString());
params.append('tag', 'javascript');
params.append('tag', 'web');
console.log('append 两个 tag 后 getAll("tag"):', params.getAll('tag'));
params.delete('lang');
console.log('delete lang 后:', params.toString());
params.sort();
console.log('sort 后:', params.toString());
console.log('');

console.log('【3. 修改 URL 属性】');
const url2 = new URL('https://example.com');
console.log('初始:', url2.href);
url2.pathname = '/api/users';
url2.port = '3000';
url2.hash = '#profile';
url2.searchParams.set('id', '123');
console.log('修改后:', url2.href);
console.log('');

console.log('【4. 相对 URL 解析】');
const base = 'https://example.com/blog/2024/article.html';
const tests = ['about.html', '../about.html', '/about.html', '?page=2', '#comments'];
tests.forEach(relative => {
  const resolved = new URL(relative, base);
  console.log(\`  \${relative.padEnd(15)} -> \${resolved.href}\`);
});
console.log('');

console.log('【5. 独立 URLSearchParams】');
const sp = new URLSearchParams();
sp.append('name', '张三');
sp.append('age', '25');
console.log('构建参数:', sp.toString());
const parsed = new URLSearchParams('a=1&b=hello&b=world');
console.log('解析结果 getAll("b"):', parsed.getAll('b'));
console.log('');

console.log('【6. 特殊字符自动编码】');
const url3 = new URL('https://example.com/search');
url3.searchParams.set('q', 'Node.js 教程 & 实践');
console.log('包含中文和 & 的 URL:', url3.href);
console.log('');

console.log('【7. 实用功能：构造分页 URL】');
function buildPaginationUrl(baseUrl, currentPage, totalPages) {
  const result = {};
  if (currentPage > 1) {
    const prev = new URL(baseUrl);
    prev.searchParams.set('page', String(currentPage - 1));
    result.prev = prev.href;
  }
  if (currentPage < totalPages) {
    const next = new URL(baseUrl);
    next.searchParams.set('page', String(currentPage + 1));
    result.next = next.href;
  }
  return result;
}
const pagination = buildPaginationUrl('https://api.example.com/posts?category=js', 2, 5);
console.log('上一页:', pagination.prev);
console.log('下一页:', pagination.next);
console.log('');

console.log('========== url 模块演示结束 ==========');`
  },
  {
    id: "n2-querystring",
    title: "querystring 与 URL 编码",
    icon: "❓",
    group: "第二部分 核心模块与源码原理",
    content: `# querystring 与 URL 编码

## 一、querystring 模块概述

\`querystring\` 模块是 Node.js 内置的核心模块，用于解析和格式化 URL 查询字符串。虽然 WHATWG 的 \`URLSearchParams\` 已经成为标准，但 \`querystring\` 模块在 Node.js 生态中仍然被广泛使用。

查询字符串是 URL 中 \`?\` 后面的部分，格式为 \`key=value&key2=value2\`。querystring 模块提供了四个主要方法：
- \`querystring.parse()\`：将查询字符串解析为对象
- \`querystring.stringify()\`：将对象序列化为查询字符串
- \`querystring.escape()\`：对字符串进行 URL 编码
- \`querystring.unescape()\`：对 URL 编码的字符串进行解码

## 二、querystring.parse() 解析

\`querystring.parse(str[, sep[, eq[, options]]])\` 接受四个参数：
- \`str\`：要解析的查询字符串
- \`sep\`：键值对之间的分隔符，默认 \`'&'\`
- \`eq\`：键和值之间的分隔符，默认 \`'='\`
- \`options\`：配置对象（decodeURIComponent、maxKeys）

当同一个键出现多次时，parse 会将值放入数组。默认最多解析 1000 个键（maxKeys），设为 0 表示不限制。

## 三、querystring.stringify() 序列化

\`querystring.stringify(obj[, sep[, eq[, options]]])\` 将对象序列化为查询字符串。

### 3.1 数组处理

数组会展开为多个相同键：\`{ color: ['red', 'blue'] }\` 变为 \`color=red&color=blue\`。

**重要：querystring 不支持嵌套对象！** 嵌套对象会被 toString() 变成 \`[object Object]\`。如果需要序列化嵌套对象，需要自己实现扁平化处理，或者使用第三方库如 \`qs\`。

### 3.2 值类型处理

- 字符串：直接编码
- 数字、布尔值：转为字符串
- null/undefined：键名保留，值为空
- 对象：调用 toString()

## 四、编码与解码：escape 和 unescape

URL 中只能包含 ASCII 字符，非 ASCII 字符（如中文、空格、特殊符号）需要进行百分号编码（Percent-encoding）。

### 4.1 编码规则

1. 非安全字符转换为 \`%\` 加两位十六进制的 UTF-8 编码
2. \`application/x-www-form-urlencoded\` 格式中，空格被编码为 \`+\`

### 4.2 容易混淆的点

- \`querystring.escape()\` 将空格编码为 \`%20\`
- \`querystring.stringify()\` 在序列化时，空格被编码为 \`+\`
- \`querystring.parse()\` 会同时将 \`+\` 和 \`%20\` 解码为空格

\`+\` 号在查询字符串中是空格的表示方式。如果想传递真正的 \`+\` 字符，需要编码为 \`%2B\`。

## 五、querystring vs URLSearchParams 对比

| 特性 | querystring | URLSearchParams |
|------|-------------|-----------------|
| 来源 | Node.js 特有 | WHATWG 标准（浏览器+Node.js） |
| 分隔符 | 支持自定义 | 只支持 & 和 = |
| 空格编码 | stringify 用 + | 始终用 + |
| 遍历 | for...in 遍历对象 | for...of 遍历，有 keys()/values() |

为什么有时候仍然用 querystring：
1. 遗留代码兼容
2. 支持自定义分隔符
3. 某些场景下性能更好

## 六、常见陷阱

### 6.1 忘记类型转换

querystring 解析出来的值**都是字符串**，需要自己转换类型（数字、布尔值）。

### 6.2 嵌套对象变成 [object Object]

querystring 不支持嵌套对象，需要先扁平化。

### 6.3 + 号被当作空格

如果参数值中真的包含 \`+\`，必须编码为 \`%2B\`。

### 6.4 maxKeys 默认限制

默认只解析前 1000 个键，这是为了防止 DoS 攻击。大量参数需要设置 \`maxKeys: 0\`。

## 七、总结

querystring 模块是 Node.js 处理查询字符串的传统工具，核心方法是 parse()、stringify()、escape()、unescape()。虽然 URLSearchParams 是新的标准，但 querystring 在 Node.js 生态中仍然广泛使用。使用时要特别注意：值都是字符串需要类型转换、不支持嵌套对象、+ 号表示空格、默认 maxKeys 限制等问题。`,
    code: `const querystring = require('querystring');

console.log('========== querystring 模块演示 ==========\\n');

console.log('【1. parse 基础解析】');
const qs1 = 'name=张三&age=25&skill=js&skill=node&skill=react';
const parsed1 = querystring.parse(qs1);
console.log('原始字符串:', qs1);
console.log('解析结果:', JSON.stringify(parsed1, null, 2));
console.log('skill 是数组:', Array.isArray(parsed1.skill), parsed1.skill);
console.log('age 是字符串:', typeof parsed1.age);
console.log('');

console.log('【2. stringify 序列化】');
const obj1 = { name: '李四', age: 30, tags: ['frontend', 'backend'], active: true, empty: null };
console.log('原始对象:', JSON.stringify(obj1));
console.log('序列化结果:', querystring.stringify(obj1));
console.log('注意：null 变成空字符串，数组展开为重复键');
console.log('');

console.log('【3. escape 与 unescape】');
const original = 'Hello World! 你好世界 &special=chars?';
const encoded = querystring.escape(original);
const decoded = querystring.unescape(encoded);
console.log('原始:', original);
console.log('编码后:', encoded);
console.log('解码后:', decoded);
console.log('');

console.log('【4. 自定义分隔符】');
const parsed2 = querystring.parse('a:1;b:2;c:3', ';', ':');
console.log('分号分隔解析:', parsed2);
console.log('自定义分隔符序列化:', querystring.stringify({ x: 10, y: 20 }, '|', '-'));
console.log('');

console.log('【5. + 号与空格的关系】');
console.log('parse("a=hello+world"):', querystring.parse('a=hello+world'));
console.log('parse("a=hello%2Bworld"):', querystring.parse('a=hello%2Bworld'));
console.log('stringify({a: "hello world"}):', querystring.stringify({a: 'hello world'}));
console.log('escape("hello world"):', querystring.escape('hello world'));
console.log('说明：stringify 中空格编码为 +，escape 中空格编码为 %20');
console.log('');

console.log('【6. 空值处理】');
const edgeCases = ['a', 'a=', 'a=&b=1', 'a=&&b=2'];
edgeCases.forEach(qs => {
  console.log(\`  parse("\${qs}"): \${JSON.stringify(querystring.parse(qs))}\`);
});
console.log('');

console.log('【7. querystring vs URLSearchParams】');
const testObj = { name: '张三', score: 95, hobbies: ['reading', 'coding'] };
console.log('querystring:', querystring.stringify(testObj));
console.log('URLSearchParams:', new URLSearchParams(testObj).toString());
console.log('');

console.log('【实用功能：API URL 构造器】');
function buildUrl(base, params = {}) {
  const qs = querystring.stringify(params);
  return base + (qs ? '?' + qs : '');
}
const apiUrl = buildUrl('https://api.example.com/v1/products', {
  category: 'electronics', page: 2, perPage: 20, keyword: '手机'
});
console.log('构造的 API URL:', apiUrl);
console.log('');

console.log('========== querystring 模块演示结束 ==========');`
  },
  {
    id: "n2-zlib",
    title: "zlib 压缩模块原理与使用",
    icon: "🗜️",
    group: "第二部分 核心模块与源码原理",
    content: `# zlib 压缩模块原理与使用

## 一、压缩的基本概念

在网络传输和文件存储中，数据压缩是一项至关重要的技术。Node.js 的 \`zlib\` 模块提供了基于 Gzip、Deflate、Brotli 等压缩算法的压缩和解压功能，是实现 HTTP 内容编码、文件压缩的核心工具。

### 1.1 为什么需要压缩

1. **减少网络传输量**：HTTP 响应经过 gzip 压缩后，通常可以减少 60-80% 的体积，显著提升网页加载速度。
2. **节省存储空间**：压缩日志、备份文件可以节省磁盘空间。
3. **降低带宽成本**：对于流量大的网站，压缩可以减少带宽费用。

### 1.2 压缩算法简介

zlib 模块支持三种主要的压缩算法：

**Gzip（gzip）**
- 最广泛使用的压缩算法，所有现代浏览器都支持
- 使用 Deflate 算法压缩，加上 10 字节头部、8 字节尾部校验和
- 压缩率和速度的良好平衡
- HTTP 响应头：\`Content-Encoding: gzip\`

**Deflate（deflate）**
- 原始的 Deflate 压缩数据（zlib 格式）
- 比 gzip 少了 18 字节的头部开销
- HTTP 响应头：\`Content-Encoding: deflate\`

**Brotli（br，Node.js 11.7+）**
- Google 开发的新型压缩算法
- 比 gzip 有更高的压缩率（通常高 20% 左右）
- 压缩速度较慢，但解压速度快
- 现代浏览器都支持
- HTTP 响应头：\`Content-Encoding: br\`

### 1.3 压缩的权衡

压缩需要权衡三个因素：
1. **压缩率**：压缩后的大小 / 原始大小
2. **压缩速度**：压缩需要的时间，影响服务器 CPU 使用率
3. **解压速度**：客户端解压需要的时间

压缩级别越高，压缩率越高，但压缩越慢；解压速度相对稳定。

## 二、同步与异步 API

zlib 模块的大多数 API 都有三种形式：
1. **同步 API**：\`zlib.gzipSync()\` 等，直接返回结果，会阻塞事件循环
2. **异步回调 API**：\`zlib.gzip(buf, callback)\`，传统回调风格
3. **流式 API**：\`zlib.createGzip()\`，返回 Transform 流，可以 pipe 处理

对于大多数 HTTP 服务场景，**流式 API 是首选**，因为内存效率高，可以边压缩边发送。

## 三、同步压缩/解压

### 3.1 gzipSync 和 gunzipSync

\`\`\`javascript
const zlib = require('zlib');
const input = 'Hello, World! '.repeat(100);
const compressed = zlib.gzipSync(input);
const decompressed = zlib.gunzipSync(compressed);
\`\`\`

类似的方法还有：\`deflateSync/inflateSync\`、\`deflateRawSync/inflateRawSync\`、\`brotliCompressSync/brotliDecompressSync\`。

### 3.2 压缩选项

压缩级别：1 (最快) 到 9 (最慢，压缩率最高)，默认是 6。Brotli 质量范围是 0-11。

\`\`\`javascript
zlib.gzipSync(input, { level: zlib.constants.Z_BEST_SPEED });
zlib.brotliCompressSync(input, {
  params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 }
});
\`\`\`

## 四、流式压缩：Transform 流

流式 API 是 zlib 最强大的功能，它实现了 Transform 流，可以通过 pipe 连接。

### 4.1 为什么流式更好

- 不会一次性加载整个数据到内存，适合大文件
- 可以边压缩边发送，降低首字节延迟（TTFB）
- 内存占用稳定

### 4.2 HTTP 响应压缩

这是 zlib 最常见的使用场景：根据 \`Accept-Encoding\` 请求头选择压缩算法，设置 \`Content-Encoding\` 响应头，用流式压缩发送响应。

## 五、压缩选项详解

### 5.1 Gzip/Deflate 选项

- **level**：压缩级别 1-9，默认 6
- **windowBits**：窗口大小，影响压缩率和内存
- **memLevel**：内存使用级别 1-9，越大越快但用更多内存
- **strategy**：压缩策略，对特定数据优化

### 5.2 Brotli 选项

- **BROTLI_PARAM_QUALITY**：0-11，类似 level
- **BROTLI_PARAM_MODE**：0=GENERIC(默认), 1=TEXT, 2=FONT
- 对文本内容使用 MODE_TEXT 可以获得更好的压缩率

## 六、HTTP 内容编码

### 6.1 Accept-Encoding 和 Content-Encoding

HTTP 压缩使用内容协商机制：客户端通过 \`Accept-Encoding\` 头声明支持的算法，服务器选择算法压缩响应，通过 \`Content-Encoding\` 头告知客户端。

优先级：Brotli > Gzip > Deflate

### 6.2 哪些内容需要压缩

- **应该压缩**：文本类型（HTML、CSS、JavaScript、JSON、XML、SVG）
- **不应该压缩**：已经压缩过的内容（图片 JPEG/PNG/WebP、视频、ZIP 文件）

### 6.3 生产环境压缩级别选择

- Gzip：级别 4-6（默认 6 性价比最高）
- Brotli：质量 4-5（最高质量 11 非常慢，不适合动态内容）
- 静态资源可以预压缩，用最高级别

## 七、内存使用与性能考量

zlib 压缩需要内存维护字典和滑动窗口。高并发服务器上，同时压缩多个响应会增加内存开销。压缩是计算密集型操作：
- 同步压缩会阻塞事件循环
- 考虑在反向代理层（Nginx）做压缩
- 静态资源可以预压缩
- 缓存频繁请求的压缩结果

## 八、常见错误与注意事项

1. **不检查 Accept-Encoding**：不支持压缩的客户端会收到乱码
2. **混合使用压缩和解压方法**：gzip 压缩必须用 gunzip 解压
3. **压缩过小的数据**：由于头部开销，可能比原始数据还大，建议设置阈值（如 1KB）
4. **不处理 error 事件**：流操作必须监听 error 事件

## 九、总结

zlib 模块的关键要点：
1. **算法选择**：Brotli 压缩率最高，Gzip 兼容性最好
2. **优先使用流式 API**：内存效率高，不会阻塞事件循环
3. **同步 API 仅用于小数据**：方便但会阻塞
4. **压缩级别要平衡**：生产环境不要用最高级别
5. **HTTP 场景注意内容协商**：检查 Accept-Encoding，不要压缩已压缩内容
6. **压缩有 CPU 成本**：高并发考虑在 Nginx 层做压缩或预压缩静态资源`,
    code: `const zlib = require('zlib');

console.log('========== zlib 压缩模块演示 ==========\\n');

const text = 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境。'.repeat(100);
const originalSize = Buffer.byteLength(text);
console.log('原始数据大小:', originalSize, '字节\\n');

console.log('【1. 不同算法压缩率对比】');
const algorithms = [
  { name: 'Gzip (默认)', compress: zlib.gzipSync, decompress: zlib.gunzipSync },
  { name: 'Deflate', compress: zlib.deflateSync, decompress: zlib.inflateSync },
  { name: 'Brotli (质量4)', compress: (b) => zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }), decompress: zlib.brotliDecompressSync },
  { name: 'Brotli (质量11)', compress: (b) => zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }), decompress: zlib.brotliDecompressSync },
];

const results = [];
for (const algo of algorithms) {
  const start = performance.now();
  const compressed = algo.compress(text);
  const compressTime = performance.now() - start;
  const start2 = performance.now();
  const decompressed = algo.decompress(compressed);
  const decompressTime = performance.now() - start2;
  results.push({
    name: algo.name,
    size: compressed.length,
    ratio: ((compressed.length / originalSize) * 100).toFixed(2) + '%',
    compress: compressTime.toFixed(2) + 'ms',
    decompress: decompressTime.toFixed(2) + 'ms',
    ok: decompressed.toString() === text
  });
}
console.table(results);
console.log('');

console.log('【2. Gzip 不同压缩级别对比】');
console.log('级别 | 压缩后大小 | 压缩率 | 压缩时间');
for (let level = 1; level <= 9; level++) {
  const start = performance.now();
  const compressed = zlib.gzipSync(text, { level });
  const t = performance.now() - start;
  console.log(
    '  ' + level + '  | ' + String(compressed.length).padStart(8) + ' | ' +
    ((compressed.length / originalSize) * 100).toFixed(2) + '% | ' + t.toFixed(2) + 'ms'
  );
}
console.log('观察：级别6是默认值，性价比最好\\n');

console.log('【3. 不同类型数据压缩效果】');
const testData = {
  '高重复文本': 'aaaaabbbbbccccc'.repeat(50),
  '英文文本': 'The quick brown fox jumps over the lazy dog. '.repeat(30),
  '中文文本': '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。'.repeat(30),
  '随机数据': (() => { let s = ''; for (let i = 0; i < 500; i++) s += String.fromCharCode(Math.floor(Math.random() * 256)); return s; })(),
};
console.log('数据类型     | 原始大小 | 压缩后 | 压缩率');
for (const [name, data] of Object.entries(testData)) {
  const size = Buffer.byteLength(data);
  const compressed = zlib.gzipSync(data);
  console.log(name.padEnd(12) + '| ' + String(size).padStart(7) + ' | ' + String(compressed.length).padStart(6) + ' | ' + ((compressed.length / size) * 100).toFixed(2) + '%');
}
console.log('注意：随机数据压缩率很低，重复数据压缩率很高\\n');

console.log('【4. 小数据压缩的开销】');
const smallData = 'hi';
const compressedSmall = zlib.gzipSync(smallData);
console.log('原始:', smallData, '-', Buffer.byteLength(smallData), '字节');
console.log('gzip后:', compressedSmall.length, '字节 (包含gzip头部!)');
console.log('压缩小数据反而更大！建议设置阈值\\n');

console.log('【5. HTTP 内容编码协商模拟】');
function httpCompress(body, acceptEncoding) {
  const encodings = acceptEncoding.split(',').map(s => s.trim());
  if (encodings.includes('br')) {
    return { body: zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }), encoding: 'br' };
  } else if (encodings.includes('gzip')) {
    return { body: zlib.gzipSync(body, { level: 6 }), encoding: 'gzip' };
  }
  return { body: Buffer.from(body), encoding: null };
}
const htmlBody = '<html><body><h1>Hello</h1>' + '<p>Content</p>'.repeat(50) + '</body></html>';
['gzip, deflate, br', 'gzip, deflate', 'deflate'].forEach(accept => {
  const result = httpCompress(htmlBody, accept);
  console.log(\`  Accept: "\${accept}" -> \${result.encoding || '不压缩'}, \${result.body.length} 字节\`);
});
console.log('');
console.log('========== zlib 模块演示结束 ==========');`
  },
  {
    id: "n2-assert",
    title: "assert 断言模块与测试原理",
    icon: "✅",
    group: "第二部分 核心模块与源码原理",
    content: `# assert 断言模块与测试原理

## 一、断言的基本概念

断言（Assertion）是编程中一种常用的调试和验证手段，用于在代码中检查某个条件是否满足预期。如果条件不满足，就抛出错误，帮助开发者快速定位问题。

Node.js 的 \`assert\` 模块是内置的断言库，提供了一组用于验证不变量的函数。它是 Node.js 单元测试的基础，许多测试框架（如 Mocha、Jest）在内部都使用或借鉴了 assert 模块的设计思想。

### 1.1 为什么需要断言

1. **防御性编程**：在代码关键位置检查输入和状态，及早发现错误
2. **单元测试**：验证代码的输出是否符合预期
3. **文档作用**：断言本身就是代码行为的文档，描述了代码的前置条件和后置条件
4. **快速失败**：错误在发生点立即暴露，而不是传播到其他地方导致难以调试

### 1.2 Strict 模式 vs Legacy 模式

从 Node.js v9.9.0 开始，assert 模块推荐使用 strict 模式：
- \`const assert = require('assert/strict')\`：所有方法都使用严格相等（===）
- \`const assert = require('assert')\`：某些方法使用抽象相等（==），不推荐

在 strict 模式下：
- \`assert.equal()\` 等价于 \`assert.strictEqual()\`
- \`assert.deepEqual()\` 等价于 \`assert.deepStrictEqual()\`
- \`assert.notEqual()\` 等价于 \`assert.notStrictEqual()\`

**强烈建议始终使用 strict 模式**，避免 == 带来的隐式类型转换问题。

## 二、基础断言方法

### 2.1 assert.ok(value[, message])

最简单的断言，验证 \`value\` 是否为真值（truthy）。如果 value 是假值（falsy），抛出 AssertionError。

这是最基础的断言，其他方法本质上都是 ok() 的封装。

### 2.2 assert.equal(actual, expected[, message]) / assert.strictEqual(actual, expected[, message])

验证两个值是否相等：
- **非 strict 模式**：使用 \`==\` 比较，会进行隐式类型转换
- **strict 模式**：使用 \`===\` 比较，不进行类型转换

\`assert.notEqual()\` 和 \`assert.notStrictEqual()\` 是反向断言，验证不相等。

### 2.3 == vs === 的坑

使用非 strict equal 时，这些比较都为 true：
- \`1 == '1'\`
- \`0 == false\`
- \`null == undefined\`
- \`'' == false\`

这些隐式转换在测试中是非常危险的，可能让有 bug 的代码通过测试。这就是为什么推荐 strict 模式。

## 三、深度比较

### 3.1 assert.deepEqual(actual, expected[, message]) / assert.deepStrictEqual(actual, expected[, message])

深度比较两个对象的内容是否相等，而不是比较引用。这是测试中最常用的方法之一，因为我们经常需要验证返回的对象是否包含预期的属性和值。

**比较规则（strict 模式）**：
1. 原始值使用 \`Object.is()\` 比较（比 === 更严格，NaN 等于 NaN，+0 不等于 -0）
2. 对象的类型标签必须相同（Date、RegExp、Map、Set 等特殊类型会特殊处理）
3. 对象的原型不要求相同（只比较自有可枚举属性）
4. 数组按索引比较
5. 缓冲区（Buffer）按字节比较
6. Error 对象比较 name 和 message 属性
7. 正则表达式比较 source、flags、lastIndex

### 3.2 deepEqual 常见误区

1. **只比较自有属性**：原型链上的属性不会比较
2. **不比较属性描述符**：writable、enumerable 等描述符差异不会报错
3. **Symbol 属性**：Symbol 键的属性也会被比较
4. **循环引用**：如果对象有循环引用，deepEqual 会抛出错误而不是无限递归

## 四、异常断言

### 4.1 assert.throws(fn[, error][, message])

验证函数 \`fn\` 执行时会抛出错误。这是测试错误处理逻辑的关键方法。

参数 \`error\` 可以是多种形式：
- **构造函数**：验证错误是该类的实例（\`SyntaxError\`、\`TypeError\` 等）
- **正则表达式**：验证错误消息匹配正则
- **对象**：验证错误对象包含该对象的属性（部分匹配）
- **函数**：自定义验证函数，返回 true 表示通过

### 4.2 assert.doesNotThrow(fn[, error][, message])

验证函数不会抛出指定类型的错误。注意：如果抛出了其他类型的错误，仍然会向上传播。

### 4.3 assert.rejects(asyncFn[, error][, message]) 和 assert.doesNotReject()

异步版本，用于验证 Promise 被 reject 或不被 reject。返回 Promise，需要 await。

## 五、其他断言方法

### 5.1 assert.fail([message])

直接抛出 AssertionError，用于标记不应该执行到的代码路径。

### 5.2 assert.ifError(value)

如果 value 是真值（通常是错误对象），就抛出它。常用于回调函数中检查错误：\`assert.ifError(err)\`

## 六、断言错误对象 AssertionError

当断言失败时，抛出的错误是 \`assert.AssertionError\` 的实例，它继承自 Error，包含以下特殊属性：
- \`actual\`：实际值
- \`expected\`：期望值
- \`operator\`：使用的操作符（如 '===', 'deepStrictEqual'）
- \`generatedMessage\`：消息是否是自动生成的
- \`code\`：始终为 'ERR_ASSERTION'

这些信息帮助测试框架格式化错误输出，让开发者清楚地看到哪里出错了。

## 七、单元测试原理：AAA 模式

assert 模块是单元测试的基础。一个好的单元测试遵循 AAA 模式：
1. **Arrange（安排）**：准备测试数据和环境
2. **Act（执行）**：执行要测试的代码
3. **Assert（断言）**：验证结果是否符合预期

虽然 assert 本身不是测试框架，但配合简单的函数封装，就能实现一个基本的测试运行器。

## 八、最佳实践

1. **始终使用 strict 模式**：\`require('assert/strict')\`，避免隐式类型转换
2. **提供有意义的错误消息**：第三个参数 message 可以帮助快速理解失败原因
3. **每个测试只测一个东西**：一个 it/test 块中只有一个逻辑断言
4. **使用 throws 测试错误情况**：不要只测试正常路径，错误路径同样重要
5. **不要过度断言**：只测试真正关心的属性，不要依赖实现细节

## 九、总结

assert 模块是 Node.js 内置的断言库，是编写测试和防御性编程的基础工具。核心要点：
- 使用 \`require('assert/strict')\` 避免 == 的坑
- \`strictEqual\` 比较基本类型，\`deepStrictEqual\` 比较对象内容
- \`throws/rejects\` 测试错误路径
- 断言失败抛出 AssertionError，包含 actual/expected/operator 等信息
- assert 是单元测试的基础，遵循 AAA 模式编写清晰的测试`,
    code: `const assert = require('assert/strict');

console.log('========== assert 断言模块演示 ==========\\n');

console.log('【1. assert.ok() - 真值断言】');
assert.ok(true, 'true 是真值');
assert.ok(1, '非零数字是真值');
assert.ok('hello', '非空字符串是真值');
assert.ok({}, '对象是真值');
console.log('所有 ok 断言通过');
try {
  assert.ok(false, '这个断言会失败');
} catch (e) {
  console.log('ok(false) 抛出错误:', e.message);
}
console.log('');

console.log('【2. equal vs strictEqual 的区别】');
console.log('--- 在 strict 模式下 equal 就是 strictEqual ---');
assert.equal(1, 1, '1 === 1');
assert.equal('hello', 'hello', '字符串相等');
try {
  assert.equal(1, '1', '1 === "1" ?');
} catch (e) {
  console.log('equal(1, "1") 失败:', e.message);
  console.log('  actual:', e.actual, '(' + typeof e.actual + ')');
  console.log('  expected:', e.expected, '(' + typeof e.expected + ')');
}
console.log('');

console.log('【3. notEqual - 不相等断言】');
assert.notEqual(1, 2, '1 !== 2');
assert.notEqual({}, {}, '两个不同对象引用不相等（即使内容相同）');
console.log('notEqual 断言通过');
console.log('');

console.log('【4. deepEqual/deepStrictEqual - 深度比较】');
const obj1 = { a: 1, b: { c: 2, d: [3, 4] } };
const obj2 = { a: 1, b: { c: 2, d: [3, 4] } };
assert.notEqual(obj1, obj2, '不同引用不 equal');
assert.deepStrictEqual(obj1, obj2, '但内容深度相等!');
console.log('对象深度比较通过');

const arr1 = [1, 2, { x: 3 }];
const arr2 = [1, 2, { x: 3 }];
assert.deepStrictEqual(arr1, arr2, '数组也可以深度比较');
console.log('数组深度比较通过');

const date1 = new Date('2024-01-01');
const date2 = new Date('2024-01-01');
assert.deepStrictEqual(date1, date2, 'Date 对象按时间比较');
console.log('Date 深度比较通过');
console.log('');

console.log('【5. deepStrictEqual 特殊值比较】');
assert.deepStrictEqual(NaN, NaN, 'NaN 等于自身（Object.is）');
try {
  assert.deepStrictEqual(+0, -0, '+0 不等于 -0');
} catch (e) {
  console.log('deepStrictEqual(+0, -0) 失败（Object.is 区分 ±0）');
}
assert.deepStrictEqual(new Map([['a',1]]), new Map([['a',1]]), 'Map 可深度比较');
assert.deepStrictEqual(new Set([1,2,3]), new Set([1,2,3]), 'Set 可深度比较');
console.log('特殊类型深度比较通过');
console.log('');

console.log('【6. throws - 异常断言】');
assert.throws(
  () => { throw new Error('出错了!'); },
  Error,
  '应该抛出 Error'
);
console.log('throws Error 通过');

assert.throws(
  () => { JSON.parse('invalid json'); },
  SyntaxError,
  'JSON.parse 错误格式应该抛出 SyntaxError'
);
console.log('throws SyntaxError 通过');

assert.throws(
  () => { throw new TypeError('类型错误'); },
  /类型/,
  '错误消息可以用正则匹配'
);
console.log('throws 正则匹配消息通过');

assert.throws(
  () => { const obj = null; obj.method(); },
  (err) => err instanceof TypeError && err.message.includes('null'),
  '自定义验证函数'
);
console.log('throws 自定义验证通过');
console.log('');

console.log('【7. ifError - 回调错误检查】');
assert.ifError(null, 'null 不抛出');
assert.ifError(undefined, 'undefined 不抛出');
try {
  assert.ifError(new Error('连接失败'));
} catch (e) {
  console.log('ifError(Error) 直接抛出该错误:', e.message);
}
console.log('');

console.log('【8. fail - 直接失败】');
try {
  assert.fail('这个分支不应该执行');
} catch (e) {
  console.log('fail() 抛出 AssertionError:', e.message);
  console.log('  code:', e.code);
  console.log('  operator:', e.operator);
}
console.log('');

console.log('【9. 实用：简单测试运行器】');
let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log('  ✓', name);
    passed++;
  } catch (e) {
    console.log('  ✗', name);
    console.log('    ', e.message.split('\\n')[0]);
    failed++;
  }
}

console.log('\\n运行简单测试套件:');
test('加法运算', () => {
  assert.strictEqual(1 + 2, 3);
  assert.strictEqual(-1 + 1, 0);
});
test('对象合并', () => {
  const result = Object.assign({a:1}, {b:2});
  assert.deepStrictEqual(result, {a:1, b:2});
});
test('数组过滤', () => {
  const nums = [1,2,3,4,5];
  const evens = nums.filter(n => n % 2 === 0);
  assert.deepStrictEqual(evens, [2,4]);
});
test('字符串包含（预期失败）', () => {
  assert.ok('hello world'.includes('xyz'));
});
console.log(\`\\n测试结果: \${passed} 通过, \${failed} 失败\`);
console.log('');
console.log('========== assert 模块演示结束 ==========');`
  },
  {
    id: "n2-memory-gc",
    title: "内存管理与垃圾回收机制",
    icon: "🗑️",
    group: "第三部分 性能优化与调试",
    content: `# 内存管理与垃圾回收机制

## 一、V8 内存管理概述

Node.js 使用 Google 的 V8 引擎来执行 JavaScript，V8 有自己的内存管理机制和垃圾回收器（Garbage Collector, GC）。理解 V8 的内存管理原理，是编写高性能 Node.js 应用、排查内存泄漏的基础。

与 C/C++ 等语言需要手动管理内存不同，JavaScript 是自动垃圾回收的：开发者不需要手动分配和释放内存，V8 会自动找出不再使用的对象并回收它们的内存。但这并不意味着开发者可以完全不关心内存，错误的代码依然会导致内存泄漏。

### 1.1 内存生命周期

不管什么编程语言，内存生命周期基本一致：
1. **分配内存**：声明变量、函数、对象时，系统自动分配内存
2. **使用内存**：进行读写操作，也就是使用变量、函数等
3. **释放内存**：不需要时将其释放，归还系统

在 JavaScript 中，第一步和第二步是开发者显式操作的，第三步由 GC 自动完成。

## 二、V8 的堆内存结构

V8 将堆内存（Heap）分为几个不同的区域，不同区域存放不同生命周期的对象，采用不同的垃圾回收策略，这就是**分代回收**（Generational Collection）的核心思想：

1. **新生代（New Space/Young Generation）**
   - 存放新创建的对象，大小较小（通常 1-8 MB）
   - 垃圾回收频繁，速度快
   - 使用 Scavenge 算法

2. **老生代（Old Space/Old Generation）**
   - 存放经过多次 GC 仍然存活的对象
   - 大小较大（V8 默认限制约 1.4GB，可通过 \`--max-old-space-size\` 调整）
   - 垃圾回收频率低，但停顿时间长
   - 使用 Mark-Sweep 和 Mark-Compact 算法

3. **大对象空间（Large Object Space）**
   - 存放超过一定大小（默认 256KB）的对象
   - 大对象直接在老生代分配，不会被移动

4. **代码空间（Code Space）**
   - 存放 JIT 编译后的机器码

5. **Map 空间（Map Space）**
   - 存放 Hidden Class（隐藏类），用于优化对象属性访问

## 三、垃圾回收算法

### 3.1 新生代：Scavenge 算法

Scavenge 算法采用 Cheney 算法实现，将新生代内存分为两半：
- **From 空间**：当前使用的内存
- **To 空间**：空闲的内存

新创建的对象分配在 From 空间。当 From 空间快满时，执行 Scavenge GC：
1. 从 GC Roots（全局对象、当前栈帧的引用等）出发，标记存活对象
2. 将存活对象复制到 To 空间（同时做内存整理，没有碎片）
3. 清空 From 空间
4. 交换 From 和 To 空间的角色

**对象晋升机制**：
- 经历过一次 Scavenge 仍然存活的对象，会被移动到老生代
- 如果 To 空间的使用率超过 25%，对象直接晋升到老生代（避免下次 GC 时 To 空间不够）

Scavenge 的优点是速度快（只复制存活对象，新生代存活对象少），缺点是空间利用率只有一半。但由于新生代很小，这个代价是值得的。

### 3.2 老生代：Mark-Sweep & Mark-Compact

老生代对象存活率高，如果使用 Scavenge 会有两个问题：复制大量存活对象效率低、浪费一半空间。所以老生代使用 Mark-Sweep（标记清除）和 Mark-Compact（标记整理）。

**Mark-Sweep（标记清除）**：
1. **标记阶段**：从 GC Roots 遍历，标记所有可达的存活对象
2. **清除阶段**：遍历堆内存，清除未被标记的对象（死亡对象）

Mark-Sweep 的问题是：清除后会产生**内存碎片**，导致大对象无法分配（虽然总空闲内存足够，但没有连续的大空间）。

**Mark-Compact（标记整理）**：
为了解决内存碎片问题，Mark-Compact 在标记完成后，将所有存活对象向一端移动，然后直接清理边界外的内存。这样就没有碎片，但移动对象需要时间，所以比 Mark-Sweep 慢。

**增量标记（Incremental Marking）**：
老生代 GC 停顿（Stop-The-World）时间可能很长（几百毫秒），会影响应用响应。V8 使用增量标记：将标记过程分成多个小步骤，让 GC 和应用代码交替执行，减少单次停顿时间。

## 四、process.memoryUsage() 详解

Node.js 提供了 \`process.memoryUsage()\` 方法来查看当前进程的内存使用情况，返回一个包含以下字段的对象：

| 字段 | 说明 | 单位 |
|------|------|------|
| **rss** | Resident Set Size，常驻内存大小 | 字节 |
| **heapTotal** | V8 堆总大小（已申请的） | 字节 |
| **heapUsed** | V8 堆已使用大小 | 字节 |
| **external** | C/C++ 对象占用的内存（如 Buffer） | 字节 |
| **arrayBuffers** | ArrayBuffer 和 SharedArrayBuffer 占用的内存 | 字节 |

### 4.1 各字段含义深入解析

**rss（Resident Set Size）**
- 进程在物理内存中占用的总大小
- 包括代码段、栈、堆、以及映射到内存的共享库
- rss 是操作系统层面看到的进程内存占用
- rss 不会超过系统可用内存，如果超过会发生 swap（严重影响性能）

**heapTotal vs heapUsed**
- heapTotal 是 V8 向操作系统申请的堆内存总量
- heapUsed 是当前实际使用的堆内存
- heapTotal - heapUsed 是 V8 持有的空闲内存，用于后续对象分配
- 如果 heapUsed 持续增长接近 heapTotal，V8 会向 OS 申请更多内存，heapTotal 增长
- 如果内存长期空闲，V8 可能会将部分内存归还给 OS（但比较保守）

**external**
- V8 管理的、JavaScript 对象包装的 C++ 对象内存
- 最常见的是 Buffer：Buffer 数据存储在 C++ 层面，不计入 heapUsed
- Node.js 流、TCP 连接等内核对象也会计入 external

### 4.2 内存限制

V8 对堆内存有默认限制：
- 32位系统：约 0.7GB
- 64位系统：约 1.4GB（老生代约 1.4GB，新生代约 32MB）

这个限制是 V8 人为设置的，因为 GC 停顿时间随堆大小线性增长，1.4GB 的堆做一次全量 GC 需要 1 秒以上。

可以通过启动参数调整：
- \`--max-old-space-size=4096\`：设置老生代最大 4GB
- \`--max-new-space-size=1024\`：设置新生代最大 1GB（通常不需要改）

注意：设置过大的堆会导致 GC 停顿时间变长，对于 Web 服务可能不是好事。

## 五、内存泄漏的常见原因

内存泄漏（Memory Leak）是指程序中已经不再需要的对象，由于被意外引用而无法被 GC 回收，导致内存占用持续增长，最终可能导致进程崩溃。

在 Node.js 中，常见的内存泄漏原因有以下几类：

### 5.1 全局变量

未声明的变量会自动成为全局对象（global）的属性，永远不会被回收：

\`\`\`javascript
function leak() {
  leaked = '我是全局变量'; // 忘记加 let/const/var
  this.alsoLeaked = '也泄漏了'; // 函数直接调用时 this 指向 global
}
\`\`\`

**预防**：始终使用 \`'use strict'\`，未声明变量会直接报错。

### 5.2 闭包引用

闭包是 JavaScript 强大的特性，但也是内存泄漏的常见来源。闭包会持有外部函数作用域的引用，即使外部函数已经执行完毕。

\`\`\`javascript
function createClosure() {
  const hugeData = new Array(1000000).fill('x');
  return function() {
    // 即使这个函数没用到 hugeData，有些引擎可能仍会保留引用
    console.log('closure');
  };
}
const fn = createClosure(); // hugeData 可能无法回收
\`\`\`

现代 V8 对闭包做了优化，只会保留被内部函数引用的变量，但意外的引用仍然可能导致泄漏。

### 5.3 事件监听器未移除

在 EventEmitter 上添加监听器后，如果不手动移除，监听器以及它引用的变量会一直存在：

\`\`\`javascript
const emitter = new EventEmitter();
function start() {
  const data = loadHugeData();
  emitter.on('data', () => {
    process(data); // data 被监听器引用
  });
}
start(); // 如果多次调用 start，监听器会累积，data 也无法回收
\`\`\`

**预防**：
- 使用 \`emitter.once()\` 代替 \`on()\`（如果只需要触发一次）
- 在不需要时调用 \`emitter.removeListener()\` 或 \`emitter.removeAllListeners()\`
- 避免在高频事件（如 'data' 事件）上添加匿名函数（无法移除）

### 5.4 无上限的缓存/队列

使用普通对象或 Map 做缓存时，如果没有过期或淘汰机制，缓存会无限增长：

\`\`\`javascript
const cache = {};
function get(key) {
  if (!cache[key]) {
    cache[key] = fetchFromDB(key);
  }
  return cache[key];
}
\`\`\`

**预防**：
- 使用 \`lru-cache\` 等有大小限制的缓存库
- 实现 TTL（Time To Live）过期机制
- 定期清理不使用的缓存项

### 5.5 定时器和 Interval 未清理

\`setInterval\` 如果不 \`clearInterval\`，回调函数以及它引用的变量会一直存活：

\`\`\`javascript
function startPolling() {
  const data = loadData();
  setInterval(() => {
    console.log(data);
  }, 1000);
}
\`\`\`

## 六、如何识别内存泄漏

1. **观察进程内存**：使用 \`process.memoryUsage()\` 定期打印，heapUsed 是否持续增长不回落
2. **压力测试**：模拟大量请求后看内存是否稳定
3. **堆快照**：使用 Chrome DevTools 或 \`v8.getHeapSnapshot()\` 抓取堆快照，对比快照找出泄漏对象
4. **--inspect 调试**：Chrome 连接 Node.js 调试端口，做 Memory 分析

## 七、内存使用最佳实践

1. **避免全局变量**，使用严格模式
2. **及时清理资源**：移除事件监听器、清除定时器、关闭文件/数据库连接
3. **避免大对象常驻内存**：大对象用完后 dereference（设为 null）
4. **使用流处理大文件**：不要一次性 readFile 读入内存
5. **缓存要有上限**：使用 LRU 缓存，不要无限制增长
6. **注意闭包的引用**：不要在闭包里引用不需要的大对象
7. **Buffer 内存**：Buffer 分配在 external，不受 heap 限制，但也要注意回收

## 八、总结

V8 采用分代垃圾回收机制：新生代使用 Scavenge（复制算法，速度快），老生代使用 Mark-Sweep 和 Mark-Compact（标记清除/整理，处理内存碎片）。使用 \`process.memoryUsage()\` 可以监控内存使用情况。内存泄漏的主要原因是意外的引用（全局变量、闭包、未移除的监听器、无上限缓存）。编写 Node.js 应用时，要注意及时释放资源，避免内存持续增长，保证应用稳定运行。`,
    code: `const { EventEmitter } = require('events');

console.log('========== 内存管理与 GC 演示 ==========\\n');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function printMemory(label) {
  const mem = process.memoryUsage();
  console.log(\`[\${label}]\`);
  console.log(\`  rss:       \${formatBytes(mem.rss)}\`);
  console.log(\`  heapTotal: \${formatBytes(mem.heapTotal)}\`);
  console.log(\`  heapUsed:  \${formatBytes(mem.heapUsed)}\`);
  console.log(\`  external:  \${formatBytes(mem.external)}\`);
  console.log(\`  arrayBuffers: \${formatBytes(mem.arrayBuffers || 0)}\`);
  console.log(\`  heapUsed/heapTotal: \${((mem.heapUsed / mem.heapTotal) * 100).toFixed(1)}%\`);
  return mem;
}

console.log('【1. 初始内存状态】');
const mem1 = printMemory('初始');
console.log('');

console.log('【2. 创建大量对象后的内存变化】');
const arrays = [];
for (let i = 0; i < 500; i++) {
  arrays.push(new Array(1000).fill('test-data-' + i));
}
const mem2 = printMemory('创建 500 个大数组后');
console.log(\`heapUsed 增长: \${formatBytes(mem2.heapUsed - mem1.heapUsed)}\`);
console.log('');

console.log('【3. 解除引用后的内存】');
arrays.length = 0;
const mem3 = printMemory('清空数组引用后');
console.log('注意：GC 不一定立即执行，heapUsed 可能暂时不会下降');
console.log('');

console.log('【4. 闭包可能导致的内存持有】');
function createLeakyClosure() {
  const bigData = new Array(200000).fill('sensitive-data');
  return function() {
    return 'closure called';
  };
}

function createSafeClosure() {
  const bigData = new Array(200000).fill('sensitive-data');
  const summary = bigData.length;
  bigData = null;
  return function() {
    return 'safe closure, data size: ' + summary;
  };
}

const memBeforeClosure = process.memoryUsage();
const closures = [];
for (let i = 0; i < 50; i++) {
  closures.push(createLeakyClosure());
}
const memAfterLeaky = process.memoryUsage();
console.log(\`闭包创建后 heapUsed 增长: \${formatBytes(memAfterLeaky.heapUsed - memBeforeClosure.heapUsed)}\`);
closures.length = 0;
console.log('');

console.log('【5. 事件监听器正确移除示例】');
const emitter = new EventEmitter();
const memBeforeListener = process.memoryUsage();

function setupBadListener() {
  const heavyData = { payload: new Array(50000).fill('event-data') };
  emitter.on('bad-event', () => {
    return heavyData;
  });
}
setupBadListener();
setupBadListener();
console.log('错误方式：监听器数量:', emitter.listenerCount('bad-event'), '(累积了!)');

function setupGoodListener(em, eventName, handler) {
  const wrappedHandler = (...args) => handler(...args);
  em.on(eventName, wrappedHandler);
  return () => em.removeListener(eventName, wrappedHandler);
}
let cleanup;
{
  const data = { info: new Array(1000).fill('temp') };
  cleanup = setupGoodListener(emitter, 'good-event', () => data);
}
console.log('正确方式：监听器数量:', emitter.listenerCount('good-event'));
cleanup();
console.log('移除后监听器数量:', emitter.listenerCount('good-event'));
console.log('');

console.log('【6. Buffer 内存（external 空间）】');
const memBeforeBuf = process.memoryUsage();
const buffers = [];
for (let i = 0; i < 100; i++) {
  buffers.push(Buffer.alloc(1024 * 1024));
}
const memAfterBuf = process.memoryUsage();
console.log(\`创建 100 个 1MB Buffer 后:\`);
console.log(\`  heapUsed 增长: \${formatBytes(memAfterBuf.heapUsed - memBeforeBuf.heapUsed)} (堆几乎不变!)\`);
console.log(\`  external 增长: \${formatBytes(memAfterBuf.external - memBeforeBuf.external)}\`);
console.log('Buffer 数据存储在 C++ 层面，不计入 V8 堆');
buffers.length = 0;
console.log('');

console.log('【7. 全局变量泄漏（演示）】');
console.log('在非严格模式下，未声明变量会泄漏到全局:');
console.log('  function leak() { x = "leaked"; }');
console.log('  调用后 global.x 存在，永远无法回收');
console.log('  预防: 使用 \\'use strict\\' 模式');
console.log('');

console.log('【8. 缓存无上限问题（演示）】');
const badCache = {};
let cacheMemory = 0;
for (let i = 0; i < 1000; i++) {
  const key = 'key-' + i;
  badCache[key] = new Array(100).fill('cache-value-' + i);
  cacheMemory += 100;
}
console.log(\`无上限缓存条目数: \${Object.keys(badCache).length}\`);
console.log('生产环境请使用 lru-cache 等有淘汰策略的缓存库');

function createLRUCache(maxSize) {
  const cache = new Map();
  return {
    get(key) {
      if (!cache.has(key)) return undefined;
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    },
    set(key, value) {
      if (cache.has(key)) cache.delete(key);
      cache.set(key, value);
      if (cache.size > maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
    },
    size: () => cache.size
  };
}
const lru = createLRUCache(100);
for (let i = 0; i < 1000; i++) {
  lru.set('k' + i, 'v' + i);
}
console.log(\`LRU 缓存限制后大小: \${lru.size()} (自动淘汰最久未使用)\`);
console.log('');

console.log('【9. 内存监控工具函数】');
function monitorMemory(interval = 5000) {
  let lastHeapUsed = process.memoryUsage().heapUsed;
  let maxGrowth = 0;
  const timer = setInterval(() => {
    const { heapUsed } = process.memoryUsage();
    const growth = heapUsed - lastHeapUsed;
    if (growth > maxGrowth) maxGrowth = growth;
    if (growth > 10 * 1024 * 1024) {
      console.log(\`[警告] 单次增长超过 10MB: \${formatBytes(growth)}\`);
    }
    lastHeapUsed = heapUsed;
  }, interval);
  return () => clearInterval(timer);
}
console.log('内存监控函数已定义（5秒采样一次，这里不实际启动避免输出干扰）');
console.log('');

console.log('========== 内存管理演示结束 ==========');
console.log('\\n核心要点:');
console.log('1. V8 分代回收：新生代 Scavenge（快），老生代 Mark-Sweep/Compact');
console.log('2. process.memoryUsage() 监控 rss/heapTotal/heapUsed/external');
console.log('3. 常见泄漏：全局变量、闭包、未移除监听器、无上限缓存、未清理定时器');
console.log('4. Buffer 内存属于 external，不在 V8 堆中');`
  },
  {
    id: "n2-benchmark",
    title: "性能基准测试与 benchmark",
    icon: "📊",
    group: "第三部分 性能优化与调试",
    content: `# 性能基准测试与 benchmark

## 一、为什么需要基准测试

在编写高性能 Node.js 应用时，我们经常面临不同实现方式的选择：用 for 循环还是 forEach？用 Object 还是 Map？用正则还是字符串分割？光凭"感觉"判断性能是不可靠的，唯一可靠的方法是**基准测试（Benchmark）**——用实际数据说话。

基准测试的目的：
1. **量化性能差异**：不同写法到底差多少？是 10% 还是 10 倍？
2. **验证优化效果**：代码优化后是真的变快了还是变慢了？
3. **发现性能瓶颈**：哪段代码是热点（Hot Path），需要重点优化？
4. **避免过早优化**：数据告诉你哪里值得优化，不要浪费时间优化不重要的代码

### 1.1 基准测试的常见误区

很多人写的"性能测试"其实是不可靠的：
- **只运行一次**：单次测量误差极大，受 GC、JIT 编译、系统负载影响
- **没有预热**：V8 的 JIT 编译器（Ignition + TurboFan）需要预热，先解释执行，热点代码才会编译优化
- **死代码消除**：V8 可能会把没有副作用的代码直接删掉，测出来的时间是 0
- **测试顺序影响**：先运行的测试可能因为 JIT 预热吃亏，或者 GC 刚好在某次测试中触发
- **不考虑误差范围**：单次快 1ms 可能只是误差，不是真实差异

## 二、高精度计时

### 2.1 performance.now()

\`performance.now()\` 是浏览器和 Node.js 都提供的高精度计时 API：
- 返回值是浮点数，单位毫秒
- 精度可达微秒级（具体取决于系统）
- 单调递增，不受系统时间修改影响（区别于 Date.now()）

这是基准测试的首选计时方式。

### 2.2 console.time() / console.timeEnd()

Node.js 内置的便捷计时方法：
\`\`\`javascript
console.time('label');
// 要测量的代码
console.timeEnd('label'); // 输出 label: xxxms
\`\`\`

适合快速调试，但精度和灵活性不如 performance.now()。

### 2.3 Date.now() 的问题

\`Date.now()\` 返回毫秒级时间戳，精度只有 1ms，而且如果用户修改系统时间会产生负的时间差。不要用 Date.now() 做基准测试。

## 三、设计可靠的基准测试

### 3.1 基准测试的标准流程

1. **预热（Warmup）**：先运行若干次待测代码，让 V8 完成 JIT 编译优化
2. **多次采样**：运行 N 次（通常几十到几千次），记录每次的耗时
3. **统计分析**：计算平均值、中位数、最小值、最大值、标准差
4. **验证结果**：确保不同实现的输出结果一致（不能只比快慢，还要正确）

### 3.2 避免死代码消除（DCE）

V8 的优化编译器（TurboFan）非常聪明，如果它发现一段代码没有副作用、返回值也没人用，可能会直接把这段代码删掉（Dead Code Elimination）。这样测出来的时间是假的。

**预防方法**：
- 将结果赋值给一个外部变量
- 或者在测试结束时"消费"结果（比如 console.log 出来，但要注意不要在循环中 log）
- 全局有一个 \`benchmark\` 对象接收结果，或者用 \`sum += result\` 累加

### 3.3 统计指标解读

- **平均值（mean）**：容易受异常值（比如 GC 停顿）影响
- **中位数（median）**：更能代表典型情况，不受极端值影响
- **最小值（min）**：理论上能达到的最快速度（不受 GC 干扰）
- **标准差（stddev）**：衡量结果的稳定性，标准差大说明波动大
- **ops/sec**：每秒操作数，越高越好

一个好的基准测试结果应该有较小的标准差。

## 四、Benchmark.js 原理

社区最流行的基准测试库是 \`benchmark.js\`，它解决了我们上面提到的很多问题：
1. 自动决定运行次数（根据代码快慢调整，快的代码多跑几次）
2. 自动预热
3. 自动处理统计（平均值、标准差、误差范围）
4. 避免死代码消除
5. 检测定时精度

虽然我们在沙箱里不能安装第三方库，但可以理解它的原理自己实现简单版本。

## 五、常用对比场景

实际开发中，我们经常需要对比：
1. **循环方式**：for i++ vs forEach vs for...of vs reduce
2. **数据结构**：Object 属性访问 vs Map.get vs Array 查找
3. **字符串操作**：字符串拼接 vs 模板字符串 vs Array.join
4. **函数调用**：普通函数 vs 箭头函数 vs bind
5. **参数处理**：arguments vs 剩余参数 vs 解构

**注意**：这些差异在现代 V8 中很多已经很小了，不要为了几微秒的差异牺牲代码可读性。基准测试的意义在于发现真正的热点（比如 10 倍以上的差异），而不是微观优化。

## 六、基准测试的局限性

基准测试不是万能的：
1. **微基准测试（Microbenchmark）不等于真实场景**：单独测一个函数快，不代表在实际应用中快（因为有 GC、内联缓存、上下文切换等因素）
2. **V8 版本影响**：不同 Node.js 版本使用不同的 V8，优化策略不同
3. **硬件影响**：CPU 频率、内存、架构都会影响结果
4. **过度优化陷阱**：为了性能写出晦涩的代码，维护成本远大于性能收益

**经验法则**：
- 先写清晰正确的代码
- 用 profiler（node --prof、clinic.js）找到真正的瓶颈
- 对瓶颈部分做基准测试和优化
- 优化后重新测量，确认真的变快了

## 七、总结

性能基准测试的核心是用数据说话。关键要点：
- 使用 \`performance.now()\` 做高精度计时
- 必须预热、多次运行、统计平均值/中位数
- 小心死代码消除，确保测试代码真正执行了
- console.time 适合快速调试，不够精确
- 微基准测试结果要结合实际场景理解，不要过度优化
- 真正的优化应该先用 profiler 找到瓶颈，而不是凭感觉`,
    code: `console.log('========== 性能基准测试演示 ==========\\n');

function benchmark(name, fn, iterations = 100000) {
  for (let i = 0; i < iterations / 10; i++) fn();
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const median = times[Math.floor(times.length / 2)];
  const min = times[0];
  const opsPerSec = Math.floor(1000 / avg * iterations / iterations);
  return { name, avg, median, min, opsPerSec };
}

function formatResult(r) {
  return \`  \${r.name.padEnd(25)} 平均: \${r.avg.toFixed(4)}ms  中位: \${r.median.toFixed(4)}ms  最快: \${r.min.toFixed(4)}ms\`;
}

const ITERATIONS = 1000;

console.log('【1. 循环方式性能对比】');
const arr = Array.from({ length: 100 }, (_, i) => i);
let sum = 0;

const r1 = benchmark('for i++ 循环', () => {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  sum = s;
}, ITERATIONS);
console.log(formatResult(r1));

const r2 = benchmark('forEach 循环', () => {
  let s = 0;
  arr.forEach(v => s += v);
  sum = s;
}, ITERATIONS);
console.log(formatResult(r2));

const r3 = benchmark('for...of 循环', () => {
  let s = 0;
  for (const v of arr) s += v;
  sum = s;
}, ITERATIONS);
console.log(formatResult(r3));

const r4 = benchmark('reduce 累加', () => {
  sum = arr.reduce((a, b) => a + b, 0);
}, ITERATIONS);
console.log(formatResult(r4));
console.log('观察：传统 for 循环通常最快，for...of 和 forEach 稍慢但可读性更好\\n');

console.log('【2. Object vs Map 查找性能】');
const obj = {};
const map = new Map();
const keys = [];
for (let i = 0; i < 100; i++) {
  const key = 'key_' + i;
  keys.push(key);
  obj[key] = i;
  map.set(key, i);
}
const searchKey = 'key_50';

const r5 = benchmark('Object 属性访问', () => {
  for (let i = 0; i < 10; i++) sum += obj[searchKey];
}, ITERATIONS);
console.log(formatResult(r5));

const r6 = benchmark('Map.get 访问', () => {
  for (let i = 0; i < 10; i++) sum += map.get(searchKey);
}, ITERATIONS);
console.log(formatResult(r6));
console.log('观察：简单键时 Object 很快，Map 在频繁增删、非字符串键场景更好\\n');

console.log('【3. 字符串拼接性能】');
const parts = ['Hello', ' ', 'World', '!', ' Node', '.js', ' Benchmark'];

const r7 = benchmark('+= 拼接', () => {
  let s = '';
  for (let i = 0; i < 20; i++) {
    for (const p of parts) s += p;
  }
  sum += s.length;
}, ITERATIONS / 5);
console.log(formatResult(r7));

const r8 = benchmark('模板字符串', () => {
  let s = '';
  for (let i = 0; i < 20; i++) {
    s = \`\${parts[0]}\${parts[1]}\${parts[2]}\${parts[3]}\${parts[4]}\${parts[5]}\${parts[6]}\`;
  }
  sum += s.length;
}, ITERATIONS / 5);
console.log(formatResult(r8));

const r9 = benchmark('Array.join', () => {
  let s = '';
  for (let i = 0; i < 20; i++) {
    s = parts.join('');
  }
  sum += s.length;
}, ITERATIONS / 5);
console.log(formatResult(r9));
console.log('现代 V8 对 += 已经高度优化，join 在大量拼接时仍有优势\\n');

console.log('【4. 数学运算性能】');
const r10 = benchmark('Math.floor', () => {
  for (let i = 0; i < 100; i++) sum += Math.floor(i / 3);
}, ITERATIONS);
console.log(formatResult(r10));

const r11 = benchmark('~~ 取整', () => {
  for (let i = 0; i < 100; i++) sum += ~~(i / 3);
}, ITERATIONS);
console.log(formatResult(r11));

const r12 = benchmark('| 0 取整', () => {
  for (let i = 0; i < 100; i++) sum += (i / 3) | 0;
}, ITERATIONS);
console.log(formatResult(r12));
console.log('注意：位运算取整只适用于 32 位整数，负数处理与 Math.floor 不同！\\n');

console.log('【5. 函数调用开销】');
function regularFn(x) { return x * 2; }
const arrowFn = (x) => x * 2;
const boundFn = regularFn.bind(null);

const r13 = benchmark('直接计算（无函数）', () => {
  for (let i = 0; i < 10; i++) sum += i * 2;
}, ITERATIONS);
console.log(formatResult(r13));

const r14 = benchmark('普通函数调用', () => {
  for (let i = 0; i < 10; i++) sum += regularFn(i);
}, ITERATIONS);
console.log(formatResult(r14));

const r15 = benchmark('箭头函数调用', () => {
  for (let i = 0; i < 10; i++) sum += arrowFn(i);
}, ITERATIONS);
console.log(formatResult(r15));

const r16 = benchmark('bind 后调用', () => {
  for (let i = 0; i < 10; i++) sum += boundFn(i);
}, ITERATIONS);
console.log(formatResult(r16));
console.log('现代 V8 中函数调用开销非常小，bind 也被优化了\\n');

console.log('【6. 查找方式对比】');
const data = Array.from({ length: 100 }, (_, i) => ({ id: i, value: 'v' + i }));
const dataMap = new Map(data.map(d => [d.id, d]));

const r17 = benchmark('Array.find', () => {
  sum += data.find(d => d.id === 50).id;
}, ITERATIONS);
console.log(formatResult(r17));

const r18 = benchmark('Map.get', () => {
  sum += dataMap.get(50).id;
}, ITERATIONS);
console.log(formatResult(r18));
console.log('Map 查找是 O(1)，Array.find 是 O(n)，数据量大时差异巨大！\\n');

console.log('【7. console.time 便捷计时】');
console.time('快速计时示例');
let quickSum = 0;
for (let i = 0; i < 100000; i++) quickSum += Math.sqrt(i);
console.timeEnd('快速计时示例');
console.log('结果:', quickSum.toFixed(0), '(消费结果防止DCE)');
console.log('');

console.log('【8. 死代码消除演示】');
console.time('看似很快的空循环');
let dceSum = 0;
for (let i = 0; i < 1000000; i++) {
  dceSum += Math.sqrt(i);
}
console.timeEnd('看似很快的空循环');
console.log('结果:', dceSum.toFixed(0), '(累加结果防止DCE)');
console.log('');

console.log('========== 基准测试演示结束 ==========');
console.log('\\n基准测试核心原则:');
console.log('1. 用 performance.now() 而非 Date.now()');
console.log('2. 必须预热、多次运行取平均');
console.log('3. 消费结果避免死代码消除');
console.log('4. 微基准不等于真实场景，profiler 找真正瓶颈');
console.log('5. 可读性优先，只优化被证实的热点');`
  },
  {
    id: "n2-perf-tips",
    title: "常见性能陷阱与优化技巧",
    icon: "🚀",
    group: "第三部分 性能优化与调试",
    content: `# 常见性能陷阱与优化技巧

## 一、性能优化的正确心态

在讨论具体的性能陷阱之前，首先要建立正确的优化观念：
1. **不要过早优化**：Donald Knuth 的名言——"过早优化是万恶之源"。先写出正确、清晰的代码，再用 profiler 找到真正的瓶颈。
2. **数据驱动**：优化前后都要测量，凭感觉优化大概率是浪费时间。
3. **权衡取舍**：性能、可读性、可维护性之间要平衡，不要为了几毫秒的提升把代码写得晦涩难懂。
4. **V8 一直在进化**：今天的"优化技巧"在明天的 V8 版本中可能已经被自动优化了，甚至可能变慢。

## 二、同步阻塞：事件循环的头号敌人

Node.js 的核心是事件循环（Event Loop），它是单线程的。任何**同步阻塞**操作都会卡住整个事件循环，导致所有请求都无法处理。

### 2.1 为什么同步 API 危险

\`fs.readFileSync\`、\`crypto.pbkdf2Sync\`、\`zlib.gzipSync\` 等同步 API 在执行时会阻塞事件循环：
- 阻塞期间，所有其他请求、定时器、I/O 回调都无法执行
- 对于高并发 Web 服务，一次阻塞 100ms 意味着这 100ms 内服务器完全不响应
- 同步 API 只适合启动阶段（加载配置、初始化），**绝对不要在请求处理中使用**

### 2.2 计算密集型任务的处理

如果有 CPU 密集型计算（大循环、复杂数学运算、加解密）：
- 拆分到 \`worker_threads\` 工作线程
- 或者使用 \`setImmediate\` 分块处理，让出事件循环
- 或者用 cluster 多进程

### 2.3 JSON.parse / JSON.stringify 的性能开销

JSON 序列化和反序列化是常见操作，但它们是**同步 CPU 密集**的：
- 大 JSON 对象（几 MB 以上）的 parse/stringify 可能阻塞几十到几百毫秒
- 流式 JSON 解析（如 \`stream-json\` 库）可以减少阻塞
- 简单的场景可以考虑用 \`fast-json-stringify\` 等优化库

## 三、正则表达式：灾难性回溯

正则表达式是强大的工具，但写不好会成为性能炸弹，也就是**灾难性回溯（Catastrophic Backtracking）**。

### 3.1 回溯的原理

正则表达式引擎（NFA 引擎）在匹配失败时会"回退"尝试其他可能的路径。如果正则写得不好，可能会尝试指数级数量的路径，导致匹配一个不长的字符串就需要几秒甚至几分钟。

典型的危险模式：
- 嵌套量词：\`(a+)*\`、\`(a|a)+\`
- 重叠的可选项：\`(a|ab)+\`
- 匹配起始位置和后续内容有重叠：\`^[\\s\\S]*?something\`

### 3.2 如何避免

1. **避免嵌套量词**：不要在量词内部再放量词
2. **使用具体的字符类**：用 \`[^"]*\` 代替 \`.*?\` 匹配引号内容
3. **使用原子组**（ES2018+）：\`(?>)...\` 一旦匹配就不回溯
4. **限制输入长度**：对用户输入的正则匹配设置长度上限
5. **验证正则性能**：用长的"坏"输入测试正则是否会卡住

## 四、对象创建与隐藏类（Hidden Class）

V8 使用隐藏类（Hidden Class，V8 内部叫 Map）来优化对象属性访问。理解隐藏类的工作原理，能让我们写出 V8 更容易优化的代码。

### 4.1 隐藏类的基本原理

动态语言中对象可以随时增删属性，但这对优化不友好。V8 的做法是：当对象的形状（属性集合、顺序）发生变化时，V8 会创建一个新的隐藏类，相同形状的对象共享同一个隐藏类。

使用相同隐藏类的对象，属性访问可以像静态语言一样快速（通过固定偏移量）。

### 4.2 隐藏类的失效场景

以下操作会导致对象改变隐藏类，甚至变成"字典模式"（慢速属性访问）：
1. **动态添加属性**：对象创建后再添加属性，会触发多次隐藏类转换
2. **属性顺序不一致**：相同属性但添加顺序不同，会有不同隐藏类
3. **delete 属性**：删除属性通常会让对象进入字典模式
4. **属性数量过多**：超过一定数量（约 30 个）后会变成字典模式

### 4.3 最佳实践

- 在构造函数中初始化所有属性
- 属性始终以相同顺序初始化
- 尽量避免 delete 操作，用 \`obj.prop = null\` 代替（如果可以）
- 不要"热路径"（频繁执行的代码）中动态给对象加属性
- 对于频繁创建的"数据对象"，考虑用数组代替（按索引访问）

## 五、函数优化：内联与去优化

V8 的 TurboFan 编译器会对热点函数进行优化，包括**函数内联（Inlining）**——把被调用函数的代码直接展开到调用处，避免函数调用开销。

### 5.1 内联的条件

- 函数体不能太大（默认 600 字符以内，可配置）
- 函数参数类型要稳定（V8 做类型反馈）

### 5.2 去优化（Deoptimization）

如果 V8 基于之前的类型反馈做了优化假设，但运行时发现假设不成立（比如传入了不同类型的参数），它会"去优化"回解释执行，这会导致性能骤降。

常见导致去优化的原因：
- 函数参数类型变化（一会儿传 number，一会儿传 string）
- 对象形状变化（隐藏类改变）
- try/catch 块中代码（旧版 V8 不优化，新版好很多）

### 5.3 单态、多态、超态

V8 的内联缓存（Inline Cache, IC）记录函数调用点的类型反馈：
- **单态（Monomorphic）**：总是调用同一个隐藏类的对象，最快
- **多态（Polymorphic）**：见过 2-4 种不同类型，稍慢
- **超态（Megamorphic）**：见过太多类型，回退到慢速查找

所以：让热点代码中的对象保持一致的形状很重要。

## 六、内存相关的性能问题

1. **频繁创建临时对象**：会增加 GC 压力。热点代码中尽量复用对象。
2. **大对象直接进入老生代**：超过 256KB 的对象直接分配在老生代，老生代 GC 停顿更长。
3. **闭包意外持有大对象**：前面章节讲过，注意闭包引用。
4. **内存泄漏导致老生代持续增长**：老生代越大，GC 停顿越长。

## 七、其他常见陷阱

### 7.1 try/catch 性能

旧版 V8 中 try/catch 块内的代码不会被优化，但现代 V8（V8 5.9+，TurboFan 引入后）已经支持优化 try/catch 了。不需要为了性能躲避 try/catch。

### 7.2 arguments 对象

在箭头函数中没有 arguments，而且在严格模式下 arguments 不会和形参联动。建议使用剩余参数 \`...args\` 代替 arguments，V8 对剩余参数优化更好。

### 7.3 for...in 遍历对象

\`for...in\` 会遍历原型链上的可枚举属性，性能较差。如果只需要自身属性：
- 用 \`Object.keys()\` 再 forEach
- 或者 \`Object.hasOwn()\` 过滤

### 7.4 错误的 Error 对象

创建 Error 对象时会捕获调用栈（stack trace），这是有开销的。不要用 throw Error 做普通的流程控制。

## 八、实用性能优化 checklist

1. ✅ 事件循环中**绝对不要**用同步阻塞 API（请求处理时）
2. ✅ CPU 密集任务用 worker_threads 或 setImmediate 分片
3. ✅ 正则表达式避免嵌套量词，测试长输入
4. ✅ 构造函数初始化所有属性，保持属性顺序一致
5. ✅ 热点函数参数类型保持稳定
6. ✅ 大 JSON 操作考虑流式处理
7. ✅ 避免内存泄漏（监听器、缓存、闭包）
8. ✅ 用 console.time 或 performance.now() 测量优化效果
9. ✅ 用 node --prof 或 clinic.js 做真正的 profiling
10. ❌ 不要为了微小的性能提升牺牲代码可读性
11. ❌ 不要过度依赖"微优化"技巧，V8 一直在进化

## 九、总结

Node.js 性能优化的核心是：**不要阻塞事件循环**。具体来说：
- 警惕同步阻塞 API 和 CPU 密集计算
- 正则表达式要小心灾难性回溯
- 理解 V8 的隐藏类和内联缓存，保持对象形状一致
- 避免频繁创建临时对象增加 GC 压力
- 最重要的：用 profiler 找瓶颈，用数据驱动优化，不要过早优化`,
    code: `console.log('========== 性能陷阱与优化技巧演示 ==========\\n');
let sum = 0;

console.log('【1. 同步阻塞的影响（模拟）】');
console.log('事件循环是单线程的，同步计算会阻塞所有操作:');
console.time('大循环阻塞');
let blockSum = 0;
for (let i = 0; i < 1000000; i++) {
  blockSum += Math.sqrt(i);
}
console.timeEnd('大循环阻塞');
console.log('阻塞期间 setTimeout 回调也无法执行\\n');

console.log('【2. JSON 处理大对象的开销】');
const bigObj = { data: [] };
for (let i = 0; i < 10000; i++) {
  bigObj.data.push({ id: i, name: 'item_' + i, value: Math.random() });
}
console.time('JSON.stringify');
const jsonStr = JSON.stringify(bigObj);
console.timeEnd('JSON.stringify');
console.log('序列化后大小:', (jsonStr.length / 1024).toFixed(2), 'KB');

console.time('JSON.parse');
const parsed = JSON.parse(jsonStr);
console.timeEnd('JSON.parse');
console.log('解析后条目数:', parsed.data.length, '\\n');

console.log('【3. 正则表达式回溯问题演示】');
function testRegex(name, regex, str) {
  const start = performance.now();
  let result;
  try {
    result = regex.test(str);
  } catch (e) {
    result = 'error';
  }
  const time = performance.now() - start;
  console.log(\`  \${name.padEnd(25)} 结果: \${String(result).padEnd(6)} 耗时: \${time.toFixed(3)}ms\`);
  return time;
}

const safeInput = 'hello world!';
const badInput = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!';
const superBadInput = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaab';

console.log('安全正则（无回溯风险）:');
testRegex('/^a+!$/', /^a+!$/, safeInput);
testRegex('/^a+!$/ (坏输入)', /^a+!$/, badInput);
testRegex('/^a+!$/ (最坏输入)', /^a+!$/, superBadInput);

console.log('\\n危险正则（嵌套量词，可能回溯）:');
testRegex('/^(a+)+$/', /^(a+)+$/, safeInput);
const t1 = testRegex('/^(a+)+$/ (30个a)', /^(a+)+$/, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
console.log('  注意：如果尝试更长的不匹配输入，可能会卡住几秒甚至更久！');
console.log('  生产环境中这种正则可能导致 DoS 攻击（ReDoS）\\n');

console.log('【4. 数据结构操作性能对比】');
const ITER = 1000;
const SIZE = 100;

function measure(name, setup, op) {
  const data = setup();
  const start = performance.now();
  for (let i = 0; i < ITER; i++) op(data);
  return { name, time: performance.now() - start };
}

const results = [];

results.push(measure(
  'Object 赋值',
  () => ({}),
  (obj) => {
    for (let i = 0; i < SIZE; i++) obj['k' + i] = i;
  }
));

results.push(measure(
  'Map 赋值',
  () => new Map(),
  (map) => {
    for (let i = 0; i < SIZE; i++) map.set('k' + i, i);
  }
));

results.push(measure(
  'Array push',
  () => [],
  (arr) => {
    arr.length = 0;
    for (let i = 0; i < SIZE; i++) arr.push(i);
  }
));

const obj1 = {}, map1 = new Map(), arr1 = [];
for (let i = 0; i < SIZE; i++) {
  obj1['k'+i] = i;
  map1.set('k'+i, i);
  arr1.push(i);
}

results.push(measure(
  'Object 查找',
  () => obj1,
  (o) => { for (let i = 0; i < SIZE; i++) sum += o['k'+i]; }
));
results.push(measure(
  'Map 查找',
  () => map1,
  (m) => { for (let i = 0; i < SIZE; i++) sum += m.get('k'+i); }
));
results.push(measure(
  'Array includes(线性)',
  () => arr1,
  (a) => { for (let i = 0; i < 100; i++) a.includes(SIZE - 1); }
));

results.sort((a,b) => a.time - b.time);
console.log('操作性能排序（越快越靠前）:');
results.forEach(r => {
  console.log(\`  \${r.name.padEnd(20)} \${r.time.toFixed(2)}ms\`);
});
console.log('');

console.log('【5. 隐藏类：属性顺序影响】');
function createPointA() {
  const p = {};
  p.x = 1;
  p.y = 2;
  return p;
}
function createPointB() {
  const p = {};
  p.y = 2;
  p.x = 1;
  return p;
}
function createPointC() {
  return { x: 1, y: 2 };
}

const N = 200000;
const pointsA = [];
console.time('相同顺序创建 20万 对象');
for (let i = 0; i < N; i++) pointsA.push(createPointA());
console.timeEnd('相同顺序创建 20万 对象');

const pointsMixed = [];
console.time('混合顺序创建 20万 对象');
for (let i = 0; i < N; i++) {
  pointsMixed.push(i % 2 === 0 ? createPointA() : createPointB());
}
console.timeEnd('混合顺序创建 20万 对象');
console.log('相同顺序的对象共享隐藏类，创建和访问都更快\\n');

console.log('【6. delete vs 赋值 null】');
const objDel = {};
const objNull = {};
for (let i = 0; i < 100; i++) {
  objDel['p'+i] = i;
  objNull['p'+i] = i;
}

console.time('delete 删除属性');
for (let i = 0; i < 100; i++) delete objDel['p'+i];
console.timeEnd('delete 删除属性');

console.time('赋值 null 删除属性');
for (let i = 0; i < 100; i++) objNull['p'+i] = null;
console.timeEnd('赋值 null 删除属性');
console.log('delete 可能导致对象进入字典模式，性能下降；用 null 赋值更快\\n');

console.log('【7. console.time 测量代码块】');
console.time('for...in 遍历对象');
const testObj = Object.fromEntries(Array.from({length: 1000}, (_,i) => ['k'+i, i]));
let forInSum = 0;
for (const key in testObj) {
  if (Object.hasOwn(testObj, key)) forInSum += testObj[key];
}
console.timeEnd('for...in 遍历对象');

console.time('Object.keys 遍历');
let keysSum = 0;
Object.keys(testObj).forEach(key => keysSum += testObj[key]);
console.timeEnd('Object.keys 遍历');
console.log('Object.keys 通常比 for...in 快，因为不遍历原型链\\n');

console.log('【8. Error 对象创建开销】');
console.time('创建 1000 个 Error');
for (let i = 0; i < 1000; i++) {
  new Error('test error ' + i);
}
console.timeEnd('创建 1000 个 Error');

console.time('创建 1000 个普通对象');
for (let i = 0; i < 1000; i++) {
  ({ message: 'test error ' + i });
}
console.timeEnd('创建 1000 个普通对象');
console.log('Error 创建时捕获调用栈，开销比普通对象大得多，不要用 throw 做流程控制\\n');

console.log('========== 性能陷阱演示结束 ==========');
console.log('\\n核心优化原则:');
console.log('1. 不要阻塞事件循环！请求处理中禁用同步 API');
console.log('2. 警惕正则表达式灾难性回溯（ReDoS）');
console.log('3. 构造函数初始化属性，保持相同属性顺序');
console.log('4. 频繁查找用 Map/Set，不要用 Array.find');
console.log('5. 避免 delete 热点对象属性，用 null 赋值');
console.log('6. Error 创建有开销，不要用于控制流');
console.log('7. 最重要：profiler 找瓶颈，数据驱动优化');
sum += blockSum + parsed.data.length + forInSum + keysSum;`
  }
];
