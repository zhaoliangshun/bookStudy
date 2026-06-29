// =============================================================
// Node.js 交互式教程 —— 第六批章节（认证与安全组，共 6 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：安全最佳实践
  // =========================================================
  {
    id: "node-security",
    icon: "🛡️",
    group: "认证与安全",
    title: "安全最佳实践",
    content: `## 为什么安全是 Node.js 开发的核心

Node.js 作为服务端运行时，处理着大量敏感数据。根据 OWASP（开放 Web 应用安全项目）的统计，安全漏洞是导致数据泄露的首要原因。Node.js 应用的常见攻击面包括：用户输入、文件系统、数据库查询、网络请求和第三方依赖。

安全不是可选的附加功能，而是开发过程中必须内建的防线。一个安全的 Node.js 应用需要在**每一层**都做好防护：输入验证 → 输出编码 → 访问控制 → 错误处理 → 依赖管理 → 传输加密。

### 常见安全威胁与防御

#### 1. 注入攻击（Injection）

注入攻击是 OWASP Top 10 中排名第一的威胁。攻击者通过将恶意数据作为命令或查询的一部分发送，欺骗解释器执行非预期的操作。

**SQL 注入**：攻击者在输入中嵌入 SQL 代码片段。

\`\`\`javascript
// ❌ 危险写法：直接拼接 SQL
const sql = "SELECT * FROM users WHERE name = '" + username + "'";
// 如果 username = "admin' OR '1'='1"，结果变成
// SELECT * FROM users WHERE name = 'admin' OR '1'='1'
// 这将返回所有用户！

// ✅ 安全写法：使用参数化查询
const sql = "SELECT * FROM users WHERE name = ?";
db.query(sql, [username]);
\`\`\`

**命令注入**：攻击者注入系统命令。

\`\`\`javascript
// ❌ 危险：exec("ls " + userInput)
// 如果 userInput = "; rm -rf /"，后果不堪设想

// ✅ 安全：使用 child_process.execFile 并验证参数
\`\`\`

#### 2. XSS（跨站脚本攻击）

当应用将用户输入直接渲染到 HTML 中时，攻击者可能注入恶意脚本。

\`\`\`javascript
// ❌ 危险：直接输出用户输入
response.send("<h1>" + userComment + "</h1>");

// ✅ 安全：HTML 实体编码
function htmlEncode(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}
\`\`\`

#### 3. CSRF（跨站请求伪造）

攻击者诱导用户在已登录的状态下访问恶意网站，利用用户的身份凭证发送伪造请求。

**防御措施**：
- 使用 CSRF Token（每次请求验证令牌）
- 检查 Referer/Origin 头
- 使用 SameSite Cookie 属性
- 关键操作要求二次确认

#### 4. SSRF（服务端请求伪造）

攻击者利用服务端发起请求的功能，让服务器访问内网资源或其他敏感地址。

\`\`\`javascript
// ❌ 危险：用户控制请求目标
const url = request.query.url;
fetch(url); // 攻击者可以传入 http://internal-service:8080/admin

// ✅ 安全：URL 白名单验证
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];
const parsed = new URL(url);
if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
  throw new Error('不允许的请求目标');
}
\`\`\`

#### 5. 路径遍历攻击

攻击者通过 \`../\` 等方式访问文件系统上的任意文件。

\`\`\`javascript
// ❌ 危险：用户控制文件路径
fs.readFile('/data/' + filename);

// 如果 filename = "../../etc/passwd"，会读取系统敏感文件

// ✅ 安全：路径规范化 + 基础目录验证
const safePath = path.resolve('/data', filename);
if (!safePath.startsWith('/data')) {
  throw new Error('路径遍历攻击！');
}
\`\`\`

### 输入验证原则

**核心原则：永远不信任用户的输入。**

1. **白名单优于黑名单**：定义允许的输入，而不是排除已知的恶意输入
2. **服务端验证是必须的**：前端验证只是用户体验优化，不能作为安全防线
3. **验证类型、长度、格式和范围**：使用 schema 验证库（如 Joi、Zod）
4. **尽早验证**：在数据进入应用逻辑之前就完成验证

### 输出编码

根据输出上下文选择正确的编码方式：

| 输出上下文 | 编码方式 | 示例 |
| --- | --- | --- |
| HTML 正文 | HTML 实体编码 | \`<\` → \`&lt;\` |
| HTML 属性 | HTML 属性编码 | 引号转义 |
| JavaScript | JS 字符串转义 | 反斜杠转义 |
| URL | URL 编码 | encodeURIComponent |
| CSS | CSS 转义 | 反斜杠十六进制 |

### HTTPS 与传输安全

- **强制 HTTPS**：使用 HSTS 头告诉浏览器只通过 HTTPS 访问
- **证书管理**：使用 Let's Encrypt 免费证书，自动化续期
- **禁用弱加密套件**：只允许 TLS 1.2+ 和强加密算法
- **安全的 Cookie 属性**：Secure、HttpOnly、SameSite

### 敏感信息管理

\`\`\`javascript
// ❌ 危险：硬编码密钥
const API_KEY = 'sk-abc123xyz';

// ✅ 安全：使用环境变量
const API_KEY = process.env.API_KEY;

// ❌ 危险：在错误中暴露敏感信息
throw new Error('数据库连接失败: ' + connectionString);

// ✅ 安全：脱敏后记录
throw new Error('数据库连接失败: ' + maskConnectionString(connectionString));
\`\`\`

### 安全头（Security Headers）

| 安全头 | 作用 |
| --- | --- |
| Content-Security-Policy | 控制浏览器可以加载哪些资源 |
| X-Frame-Options | 防止点击劫持 |
| X-Content-Type-Options | 禁止 MIME 类型嗅探 |
| Strict-Transport-Security | 强制 HTTPS 连接 |
| Referrer-Policy | 控制 Referer 头信息 |
| Permissions-Policy | 控制浏览器 API 权限 |

### 依赖安全审计

\`\`\`bash
# 检查已知漏洞
npm audit

# 自动修复（小心 breaking changes）
npm audit fix

# 查看详细报告
npm audit --json

# 定期更新依赖
npm outdated
npm update
\`\`\`

**最佳实践**：
- 在 CI/CD 中集成 \`npm audit\`（设置 severity 阈值）
- 使用 Dependabot 或 Renovate 自动创建依赖更新 PR
- 定期审查依赖树，移除不必要的依赖
- 锁定依赖版本（package-lock.json），避免供应链攻击`,
    code: `// ============================================================
// 第一章代码演示：安全最佳实践
// 演示输入过滤、路径遍历攻击防范、敏感信息脱敏
// ============================================================

var path = require("path");
var crypto = require("crypto");

// ---- 1. 输入验证演示 ----
console.log("========== 1. 输入验证 ==========");

// 模拟一个用户注册的输入验证函数
function validateUserInput(input) {
  var errors = [];

  // 用户名验证：只允许字母、数字、下划线，长度 3-20
  if (!input.username || !/^[a-zA-Z0-9_]{3,20}$/.test(input.username)) {
    errors.push("用户名必须为 3-20 位字母、数字或下划线");
  }

  // 邮箱验证：基本格式检查
  var emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!input.email || !emailRegex.test(input.email)) {
    errors.push("邮箱格式不正确");
  }

  // 年龄验证：必须是数字，范围 1-150
  var age = parseInt(input.age, 10);
  if (isNaN(age) || age < 1 || age > 150) {
    errors.push("年龄必须是 1-150 之间的数字");
  }

  // 密码强度验证：至少 8 位，包含大小写字母和数字
  if (!input.password || input.password.length < 8) {
    errors.push("密码长度至少 8 位");
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(input.password)) {
    errors.push("密码必须包含大小写字母和数字");
  }

  // 输入长度限制：防止超长输入
  if (input.bio && input.bio.length > 500) {
    errors.push("个人简介不能超过 500 个字符");
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    sanitized: errors.length === 0 ? {
      username: input.username.trim(),
      email: input.email.trim().toLowerCase(),
      age: age,
      bio: input.bio ? input.bio.trim().slice(0, 500) : "",
    } : null,
  };
}

// 测试用例
var testCases = [
  {
    desc: "合法输入",
    data: { username: "Alice_123", email: "alice@example.com", age: "25", password: "Abc12345", bio: "你好" },
  },
  {
    desc: "用户名含特殊字符",
    data: { username: "admin<script>", email: "admin@test.com", age: "30", password: "Abc12345" },
  },
  {
    desc: "SQL 注入尝试",
    data: { username: "admin' OR '1'='1", email: "hacker@evil.com", age: "99", password: "Abc12345" },
  },
  {
    desc: "邮箱格式错误",
    data: { username: "test_user", email: "not-an-email", age: "20", password: "Abc12345" },
  },
  {
    desc: "弱密码",
    data: { username: "test_user", email: "test@test.com", age: "20", password: "12345" },
  },
  {
    desc: "年龄超出范围",
    data: { username: "test_user", email: "test@test.com", age: "999", password: "Abc12345" },
  },
];

testCases.forEach(function (tc) {
  var result = validateUserInput(tc.data);
  var status = result.valid ? "✅ 通过" : "❌ 拒绝";
  console.log(status + " [" + tc.desc + "]");
  if (!result.valid) {
    result.errors.forEach(function (err) {
      console.log("   → " + err);
    });
  }
});

// ---- 2. HTML 实体编码防止 XSS ----
console.log("\\n========== 2. HTML 实体编码（XSS 防御）==========");

function htmlEncode(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\\//g, "&#x2F;");
}

// 模拟恶意输入
var maliciousInputs = [
  { raw: '<script>alert("XSS")</script>', context: "XSS 脚本注入" },
  { raw: '<img src=x onerror="alert(1)">', context: "图片标签注入" },
  { raw: "javascript:alert('XSS')", context: "JavaScript 协议" },
  { raw: '<a href="http://evil.com">点击</a>', context: "恶意链接" },
  { raw: "正常用户评论：很不错！", context: "正常输入" },
];

console.log("原始输入 → 编码后输出:");
console.table(
  maliciousInputs.map(function (item) {
    return {
      上下文: item.context,
      原始输入: item.raw,
      编码输出: htmlEncode(item.raw),
    };
  })
);

// ---- 3. 路径遍历攻击防范 ----
console.log("\\n========== 3. 路径遍历攻击防范 ==========");

var BASE_DIR = "/var/www/uploads";

function safeFilePath(userFilename) {
  // 步骤 1：路径规范化，消除 ../ 和 ./
  var resolved = path.resolve(BASE_DIR, userFilename);

  // 步骤 2：验证解析后的路径是否在基础目录内
  if (!resolved.startsWith(BASE_DIR + path.sep) && resolved !== BASE_DIR) {
    return { safe: false, error: "路径遍历攻击被阻止！路径超出允许范围" };
  }

  // 步骤 3：禁止访问隐藏文件（以 . 开头）
  var basename = path.basename(resolved);
  if (basename.startsWith(".")) {
    return { safe: false, error: "不允许访问隐藏文件" };
  }

  return { safe: true, path: resolved };
}

// 测试各种路径遍历攻击
var pathTests = [
  { input: "photo.jpg", desc: "正常文件路径" },
  { input: "../../etc/passwd", desc: "路径遍历（../）" },
  { input: "..\\\\..\\\\windows\\\\system32", desc: "Windows 路径遍历" },
  { input: "./subdir/.././subdir/photo.jpg", desc: "混合路径（规范化后可接受）" },
  { input: "../../../.env", desc: "访问隐藏文件" },
  { input: "./../../../etc/shadow", desc: "深度路径遍历" },
  { input: "report.pdf", desc: "正常 PDF 文件" },
];

pathTests.forEach(function (test) {
  var result = safeFilePath(test.input);
  var status = result.safe ? "✅ 安全" : "🚫 阻止";
  console.log(status + " [" + test.desc + "]");
  console.log("  输入: " + test.input);
  if (result.safe) {
    console.log("  解析路径: " + result.path);
  } else {
    console.log("  原因: " + result.error);
  }
});

// ---- 4. 敏感信息脱敏 ----
console.log("\\n========== 4. 敏感信息脱敏 ==========");

// 手机号脱敏：保留前 3 后 4 位
function maskPhone(phone) {
  if (!phone || phone.length < 7) return "***";
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

// 邮箱脱敏
function maskEmail(email) {
  if (!email || !email.includes("@")) return "***";
  var parts = email.split("@");
  var name = parts[0];
  if (name.length <= 2) return name[0] + "***@" + parts[1];
  return name[0] + "***" + name[name.length - 1] + "@" + parts[1];
}

// 身份证号脱敏
function maskIdCard(idCard) {
  if (!idCard || idCard.length < 8) return "***";
  return idCard.slice(0, 4) + "**********" + idCard.slice(-4);
}

// 连接字符串脱敏
function maskConnectionString(connStr) {
  return connStr.replace(/\\/\\/([^:]+):([^@]+)@/, "//$1:***@");
}

// 密码完全隐藏
function maskPassword(password) {
  return "********";
}

console.log("脱敏示例:");
console.table([
  { 类型: "手机号", 原始: "13812345678", 脱敏: maskPhone("13812345678") },
  { 类型: "邮箱", 原始: "zhangsan@example.com", 脱敏: maskEmail("zhangsan@example.com") },
  { 类型: "短邮箱", 原始: "a@test.com", 脱敏: maskEmail("a@test.com") },
  { 类型: "身份证", 原始: "110101199001011234", 脱敏: maskIdCard("110101199001011234") },
  { 类型: "连接字符串", 原始: "mysql://root:secret123@localhost/db", 脱敏: maskConnectionString("mysql://root:secret123@localhost/db") },
  { 类型: "密码", 原始: "MyP@ssw0rd!", 脱敏: maskPassword("MyP@ssw0rd!") },
]);

// 模拟错误日志脱敏
console.log("\\n模拟错误日志脱敏:");
var originalError = "数据库连接失败: mysql://admin:SuperSecret@db.internal:3306/users";
var maskedError = maskConnectionString(originalError);
console.log("❌ 不安全的日志: " + originalError);
console.log("✅ 安全的日志:   " + maskedError);

// ---- 5. URL 白名单验证（SSRF 防范） ----
console.log("\\n========== 5. URL 白名单验证（SSRF 防范）==========");

var ALLOWED_HOSTS = ["api.example.com", "cdn.example.com", "images.example.com"];

function validateUrl(userUrl) {
  try {
    var parsed = new URL(userUrl);

    // 只允许 HTTP/HTTPS 协议
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, reason: "只允许 HTTP/HTTPS 协议" };
    }

    // 主机名白名单验证
    var hostname = parsed.hostname;
    if (!ALLOWED_HOSTS.includes(hostname)) {
      return { valid: false, reason: "主机名不在白名单中: " + hostname };
    }

    // 禁止访问内网 IP（简化演示）
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
      return { valid: false, reason: "不允许访问内网地址" };
    }

    return { valid: true, url: parsed.href };
  } catch (e) {
    return { valid: false, reason: "URL 格式无效: " + e.message };
  }
}

var urlTests = [
  { url: "https://api.example.com/users", desc: "合法外网 URL" },
  { url: "https://cdn.example.com/image.png", desc: "合法 CDN URL" },
  { url: "http://localhost:8080/admin", desc: "内网地址（localhost）" },
  { url: "http://192.168.1.1/config", desc: "内网 IP 地址" },
  { url: "https://evil.com/steal", desc: "不在白名单的域名" },
  { url: "file:///etc/passwd", desc: "file 协议攻击" },
  { url: "https://api.example.com/../admin", desc: "合法域名但含路径遍历" },
];

urlTests.forEach(function (test) {
  var result = validateUrl(test.url);
  var status = result.valid ? "✅ 允许" : "🚫 阻止";
  console.log(status + " [" + test.desc + "]");
  console.log("  URL: " + test.url);
  if (!result.valid) {
    console.log("  原因: " + result.reason);
  }
});

// ---- 6. 密码强度检查 ----
console.log("\\n========== 6. 密码强度检查 ==========");

function checkPasswordStrength(password) {
  var score = 0;
  var feedback = [];

  if (password.length >= 8) { score++; } else { feedback.push("长度至少 8 位"); }
  if (password.length >= 12) { score++; }
  if (/[a-z]/.test(password)) { score++; } else { feedback.push("需要包含小写字母"); }
  if (/[A-Z]/.test(password)) { score++; } else { feedback.push("需要包含大写字母"); }
  if (/\\d/.test(password)) { score++; } else { feedback.push("需要包含数字"); }
  if (/[^a-zA-Z0-9]/.test(password)) { score++; } else { feedback.push("建议包含特殊字符"); }

  var levels = ["非常弱", "弱", "一般", "较强", "强", "很强", "非常强"];
  return {
    score: score,
    level: levels[Math.min(score, levels.length - 1)],
    feedback: feedback,
  };
}

var passwords = ["123456", "password", "Pass1234", "MyP@ssw0rd!", "Tr0ub4dor&3", "correct-horse-battery-staple"];
passwords.forEach(function (pw) {
  var result = checkPasswordStrength(pw);
  console.log("密码: " + maskPassword(pw) + " → 强度: " + result.level + " (" + result.score + "/6)");
  if (result.feedback.length > 0) {
    console.log("  建议: " + result.feedback.join("; "));
  }
});

// ---- 7. 依赖安全检查模拟 ----
console.log("\\n========== 7. 依赖安全检查模拟 ==========");

var dependencies = [
  { name: "express", version: "4.18.2", knownVulns: 0 },
  { name: "lodash", version: "4.17.15", knownVulns: 3 },
  { name: "axios", version: "1.6.0", knownVulns: 0 },
  { name: "old-package", version: "1.0.0", knownVulns: 5 },
  { name: "jsonwebtoken", version: "9.0.0", knownVulns: 0 },
];

console.log("依赖安全检查报告:");
console.log("=" .repeat(50));
var totalVulns = 0;
var criticalDeps = [];

dependencies.forEach(function (dep) {
  var status = dep.knownVulns === 0 ? "✅ 安全" : "⚠️ 有漏洞";
  console.log(status + " " + dep.name + "@" + dep.version + " (漏洞: " + dep.knownVulns + ")");
  totalVulns += dep.knownVulns;
  if (dep.knownVulns > 0) {
    criticalDeps.push(dep);
  }
});

console.log("\\n总结: 共 " + dependencies.length + " 个依赖, " + totalVulns + " 个已知漏洞");
if (criticalDeps.length > 0) {
  console.log("建议立即更新的依赖:");
  criticalDeps.forEach(function (dep) {
    console.log("  → npm update " + dep.name + " (当前: " + dep.version + ")");
  });
  console.log("\\n提示: 在 CI/CD 中运行 npm audit 自动检测漏洞");
}

// ---- 8. 安全编码总结 ----
console.log("\\n========== 8. 安全编码最佳实践总结 ==========");

var bestPractices = [
  { 原则: "永远不信任用户输入", 实践: "所有输入必须验证、过滤、编码" },
  { 原则: "最小权限原则", 实践: "只授予完成任务所需的最小权限" },
  { 原则: "纵深防御", 实践: "多层安全防护，不依赖单一防线" },
  { 原则: "默认安全", 实践: "默认配置应该是安全的，用户需要主动降低安全性" },
  { 原则: "不暴露敏感信息", 实践: "错误信息、日志中不包含密码、密钥等敏感数据" },
  { 原则: "保持依赖更新", 实践: "定期运行 npm audit，及时修复已知漏洞" },
  { 原则: "加密传输", 实践: "使用 HTTPS，设置安全的 Cookie 属性" },
  { 原则: "安全头", 实践: "设置 CSP、HSTS、X-Frame-Options 等安全头" },
];

console.table(bestPractices);

console.log("\\n===== 安全最佳实践演示完成 =====");`,
  },

  // =========================================================
  // 第二章：JWT 认证实战
  // =========================================================
  {
    id: "node-jwt",
    icon: "🎫",
    group: "认证与安全",
    title: "JWT 认证实战",
    content: `## JWT 是什么？

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间**安全地传输信息**。它定义了一种紧凑且自包含的方式，将 JSON 对象编码为令牌（Token），可以通过 URL、POST 参数或 HTTP 头传递。

JWT 的核心优势在于**无状态**——服务端不需要存储会话信息，所有必要的数据都编码在令牌中并经过签名验证。

### JWT 的三个部分

JWT 由三部分组成，用点号（.）分隔：

\`\`\`
Header.Payload.Signature
eyJhbG... .eyJzdWI... .SflKxw...
\`\`\`

#### 1. Header（头部）

包含令牌类型和签名算法：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

#### 2. Payload（载荷）

包含声明（Claims），即要传输的数据。分为三种类型：

**注册声明（Registered Claims）**：
| 声明 | 全称 | 说明 |
| --- | --- | --- |
| \`iss\` | Issuer | 签发者 |
| \`sub\` | Subject | 主题（通常是用户 ID） |
| \`aud\` | Audience | 接收方 |
| \`exp\` | Expiration Time | 过期时间（Unix 时间戳） |
| \`nbf\` | Not Before | 生效时间 |
| \`iat\` | Issued At | 签发时间 |
| \`jti\` | JWT ID | 唯一标识（用于防重放） |

**公开声明（Public Claims）**：自定义的公共字段，应避免冲突

**私有声明（Private Claims）**：服务端与客户端之间约定的自定义字段

\`\`\`json
{
  "sub": "1234567890",
  "name": "张三",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700003600
}
\`\`\`

#### 3. Signature（签名）

用于验证消息在传输过程中未被篡改。对于 HMAC SHA256 算法：

\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

### JWT 的生成与验证流程

**生成流程**：
1. 创建 Header JSON，Base64URL 编码
2. 创建 Payload JSON（包含用户信息和过期时间），Base64URL 编码
3. 拼接 Header + "." + Payload
4. 使用密钥和指定算法计算签名
5. 拼接完整 Token：Header.Payload.Signature

**验证流程**：
1. 按 "." 分割 Token
2. 重新计算签名，与 Token 中的签名对比
3. 检查过期时间（exp）是否已过期
4. 检查生效时间（nbf）是否已到达
5. 如果都通过，解析 Payload 获取用户信息

### Access Token + Refresh Token 双令牌模式

这是生产环境中推荐的做法：

| 特性 | Access Token | Refresh Token |
| --- | --- | --- |
| **有效期** | 短（15 分钟 - 1 小时） | 长（7 天 - 30 天） |
| **存储位置** | 内存（前端） | HttpOnly Cookie |
| **用途** | 访问 API 资源 | 获取新的 Access Token |
| **泄露风险** | 较高（每次请求携带） | 较低（仅在刷新时使用） |

**工作流程**：
1. 用户登录 → 服务端颁发 Access Token（短有效期）和 Refresh Token（长有效期）
2. 客户端每次请求携带 Access Token
3. Access Token 过期 → 客户端使用 Refresh Token 请求新的 Access Token
4. Refresh Token 过期 → 用户需要重新登录

### JWT 的存储方式

| 存储方式 | 优点 | 缺点 | 安全建议 |
| --- | --- | --- | --- |
| 内存 | 不持久化，页面关闭即消失 | 刷新页面丢失 | 适合 SPA 应用 |
| localStorage | 持久化，使用方便 | 容易受 XSS 攻击 | 不推荐 |
| Cookie (HttpOnly) | 无法被 JS 读取，防 XSS | 需要防 CSRF | **推荐方案** |
| SessionStorage | 标签页隔离 | 关闭标签即丢失 | 适合临时数据 |

### JWT 撤销（黑名单机制）

JWT 本身是无状态的，无法主动撤销。但可以通过以下方式实现：

**黑名单模式**：
1. 维护一个已撤销 Token 的列表（存储在 Redis 或内存中）
2. 每次验证 Token 时，检查是否在黑名单中
3. 黑名单条目可以设置过期时间（与 Token 的 exp 一致）

**版本号模式**：
1. 用户表中存储一个 token_version 字段
2. JWT Payload 中也包含 token_version
3. 验证时对比两个版本号
4. 修改密码时递增 token_version → 所有旧 Token 失效

### JWT 安全最佳实践

1. **使用强密钥**：至少 256 位（32 字节）的随机密钥
2. **设置合理的过期时间**：Access Token 不宜超过 1 小时
3. **不要在 Payload 中存储敏感信息**：Payload 只是 Base64 编码，不是加密
4. **使用 HTTPS 传输**：防止 Token 在传输中被窃取
5. **验证算法**：防止攻击者将算法改为 "none"
6. **使用 HttpOnly Cookie 存储 Refresh Token**：防止 XSS 攻击窃取 Token`,
    code: `// ============================================================
// 第二章代码演示：JWT 认证实战
// 使用 crypto 实现 JWT 的生成(HMAC-SHA256)、验证、过期处理和刷新
// ============================================================

var crypto = require("crypto");

// ---- 1. JWT 工具函数实现 ----
console.log("========== 1. JWT 工具函数 ==========");

// 密钥（生产环境应从环境变量读取）
var JWT_SECRET = "my-super-secret-key-at-least-256-bits-long!!";

// Base64URL 编码（JWT 使用的特殊 Base64 变体）
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\\+/g, "-")
    .replace(/\\//g, "_")
    .replace(/=/g, "");
}

// Base64URL 解码
function base64UrlDecode(str) {
  // 补全等号
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf8");
}

// 使用 HMAC-SHA256 生成签名
function sign(data, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/\\+/g, "-")
    .replace(/\\//g, "_")
    .replace(/=/g, "");
}

// 生成 JWT Token
function generateToken(payload, secret, expiresInSeconds) {
  // 1. 创建 Header
  var header = {
    alg: "HS256",
    typ: "JWT",
  };

  // 2. 创建 Payload（添加标准声明）
  var now = Math.floor(Date.now() / 1000);
  var fullPayload = {
    iat: now,                         // 签发时间
    exp: now + (expiresInSeconds || 3600), // 过期时间
    jti: crypto.randomBytes(16).toString("hex"), // 唯一标识
  };
  // 合并用户自定义 payload
  for (var key in payload) {
    fullPayload[key] = payload[key];
  }

  // 3. Base64URL 编码
  var headerB64 = base64UrlEncode(JSON.stringify(header));
  var payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));

  // 4. 生成签名
  var signingInput = headerB64 + "." + payloadB64;
  var signature = sign(signingInput, secret);

  // 5. 返回完整 Token
  return signingInput + "." + signature;
}

// 验证 JWT Token
function verifyToken(token, secret) {
  var parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Token 格式错误" };
  }

  var headerB64 = parts[0];
  var payloadB64 = parts[1];
  var signature = parts[2];

  // 1. 验证签名
  var signingInput = headerB64 + "." + payloadB64;
  var expectedSignature = sign(signingInput, secret);
  if (signature !== expectedSignature) {
    return { valid: false, error: "签名验证失败，Token 可能被篡改" };
  }

  // 2. 解析 Payload
  var payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch (e) {
    return { valid: false, error: "Payload 解析失败" };
  }

  // 3. 检查过期时间
  var now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) {
    return {
      valid: false,
      error: "Token 已过期，过期时间: " + new Date(payload.exp * 1000).toISOString(),
      expired: true,
    };
  }

  // 4. 检查生效时间
  if (payload.nbf && now < payload.nbf) {
    return { valid: false, error: "Token 尚未生效" };
  }

  return { valid: true, payload: payload };
}

console.log("JWT 工具函数已就绪");
console.log("  签名算法: HMAC-SHA256");
console.log("  密钥长度: " + JWT_SECRET.length + " 字符");

// ---- 2. 生成 Access Token ----
console.log("\\n========== 2. 生成 Access Token ==========");

var accessToken = generateToken(
  {
    sub: "user_12345",
    name: "张三",
    role: "admin",
    email: "zhangsan@example.com",
  },
  JWT_SECRET,
  3600 // 1 小时过期
);

console.log("Access Token 生成成功!");
console.log("Token 长度: " + accessToken.length + " 字符");
console.log("\\nToken 结构:");
var parts = accessToken.split(".");
console.log("  Header  : " + parts[0].substring(0, 30) + "...");
console.log("  Payload : " + parts[1].substring(0, 30) + "...");
console.log("  Signature: " + parts[2].substring(0, 30) + "...");

// 解码查看 Payload 内容
var decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
console.log("\\n解码后的 Payload:");
console.log(JSON.stringify(decodedPayload, null, 2));

// ---- 3. 验证 Token ----
console.log("\\n========== 3. 验证 Token ==========");

var verifyResult = verifyToken(accessToken, JWT_SECRET);
if (verifyResult.valid) {
  console.log("✅ Token 验证成功!");
  console.log("  用户 ID: " + verifyResult.payload.sub);
  console.log("  用户名: " + verifyResult.payload.name);
  console.log("  角色: " + verifyResult.payload.role);
  console.log("  签发时间: " + new Date(verifyResult.payload.iat * 1000).toISOString());
  console.log("  过期时间: " + new Date(verifyResult.payload.exp * 1000).toISOString());
} else {
  console.log("❌ Token 验证失败: " + verifyResult.error);
}

// ---- 4. 模拟篡改后的 Token ----
console.log("\\n========== 4. 篡改 Token 检测 ==========");

// 模拟攻击者篡改 Payload（把 role 改成 admin）
var tamperedPayload = {
  sub: "user_12345",
  name: "张三",
  role: "superadmin", // 篡改的角色
  iat: decodedPayload.iat,
  exp: decodedPayload.exp,
};
var tamperedPayloadB64 = base64UrlEncode(JSON.stringify(tamperedPayload));
var tamperedToken = parts[0] + "." + tamperedPayloadB64 + "." + parts[2];

var tamperedResult = verifyToken(tamperedToken, JWT_SECRET);
console.log("原始 Token 角色: admin");
console.log("篡改后 Token 角色: superadmin");
console.log("验证结果: " + (tamperedResult.valid ? "✅ 通过" : "❌ " + tamperedResult.error));
console.log("→ 签名验证机制确保了 Payload 的完整性");

// ---- 5. 过期 Token 模拟 ----
console.log("\\n========== 5. 过期 Token 处理 ==========");

// 生成一个已过期的 Token（过期时间设为过去）
var expiredToken = generateToken(
  { sub: "user_12345", name: "张三" },
  JWT_SECRET,
  -1 // 立即过期
);

var expiredResult = verifyToken(expiredToken, JWT_SECRET);
console.log("过期 Token 验证结果:");
console.log("  valid: " + expiredResult.valid);
console.log("  error: " + expiredResult.error);
console.log("  expired: " + expiredResult.expired);

// ---- 6. Access Token + Refresh Token 双令牌模式 ----
console.log("\\n========== 6. Access Token + Refresh Token 双令牌模式 ==========");

// Refresh Token 存储（模拟 Redis）
var refreshTokenStore = {};

// 登录：生成双令牌
function login(userId, userInfo) {
  // Access Token：短期有效（15 分钟）
  var accessToken = generateToken(
    { sub: userId, name: userInfo.name, role: userInfo.role },
    JWT_SECRET,
    900 // 15 分钟
  );

  // Refresh Token：长期有效（7 天），包含特殊声明
  var refreshToken = generateToken(
    {
      sub: userId,
      type: "refresh",
      tokenVersion: userInfo.tokenVersion || 1,
    },
    JWT_SECRET,
    604800 // 7 天
  );

  // 存储 Refresh Token（生产环境存入 Redis）
  refreshTokenStore[userId] = {
    token: refreshToken,
    tokenVersion: userInfo.tokenVersion || 1,
    createdAt: new Date().toISOString(),
  };

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiresIn: 900,
    tokenType: "Bearer",
  };
}

// 刷新 Access Token
function refreshAccessToken(refreshToken) {
  var result = verifyToken(refreshToken, JWT_SECRET);

  if (!result.valid) {
    return { success: false, error: result.error };
  }

  // 检查是否是 refresh 类型的 Token
  if (result.payload.type !== "refresh") {
    return { success: false, error: "Token 类型错误，不是 Refresh Token" };
  }

  var userId = result.payload.sub;

  // 检查 Refresh Token 是否在存储中（未被撤销）
  var stored = refreshTokenStore[userId];
  if (!stored || stored.token !== refreshToken) {
    return { success: false, error: "Refresh Token 已被撤销" };
  }

  // 生成新的 Access Token
  var newAccessToken = generateToken(
    {
      sub: userId,
      name: result.payload.name || "用户",
      role: result.payload.role || "user",
      tokenVersion: stored.tokenVersion,
    },
    JWT_SECRET,
    900 // 15 分钟
  );

  return {
    success: true,
    accessToken: newAccessToken,
    expiresIn: 900,
  };
}

// 演示登录流程
console.log("--- 用户登录 ---");
var loginResult = login("user_12345", {
  name: "张三",
  role: "admin",
  tokenVersion: 1,
});
console.log("登录成功!");
console.log("  Access Token: " + loginResult.accessToken.substring(0, 40) + "...");
console.log("  Refresh Token: " + loginResult.refreshToken.substring(0, 40) + "...");
console.log("  Access Token 有效期: " + loginResult.expiresIn + " 秒 (15 分钟)");

// 演示刷新流程
console.log("\\n--- Access Token 过期，使用 Refresh Token 刷新 ---");
var refreshResult = refreshAccessToken(loginResult.refreshToken);
if (refreshResult.success) {
  console.log("✅ 刷新成功!");
  console.log("  新的 Access Token: " + refreshResult.accessToken.substring(0, 40) + "...");
  console.log("  新有效期: " + refreshResult.expiresIn + " 秒");
} else {
  console.log("❌ 刷新失败: " + refreshResult.error);
}

// ---- 7. JWT 黑名单（撤销机制） ----
console.log("\\n========== 7. JWT 黑名单（撤销机制）==========");

var tokenBlacklist = {};

// 将 Token 加入黑名单
function revokeToken(token) {
  var parts = token.split(".");
  if (parts.length !== 3) return false;

  var payload = JSON.parse(base64UrlDecode(parts[1]));
  var jti = payload.jti;
  var exp = payload.exp;

  tokenBlacklist[jti] = {
    revokedAt: new Date().toISOString(),
    expiresAt: new Date(exp * 1000).toISOString(),
  };

  return true;
}

// 检查 Token 是否在黑名单中
function isTokenRevoked(token) {
  var parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    var payload = JSON.parse(base64UrlDecode(parts[1]));
    return !!tokenBlacklist[payload.jti];
  } catch (e) {
    return true;
  }
}

// 带黑名单检查的验证
function verifyTokenWithBlacklist(token, secret) {
  if (isTokenRevoked(token)) {
    return { valid: false, error: "Token 已被撤销（黑名单）" };
  }
  return verifyToken(token, secret);
}

// 演示撤销
var testToken = generateToken({ sub: "user_999", name: "测试用户" }, JWT_SECRET, 3600);
console.log("生成测试 Token: " + testToken.substring(0, 40) + "...");

var beforeRevoke = verifyTokenWithBlacklist(testToken, JWT_SECRET);
console.log("撤销前验证: " + (beforeRevoke.valid ? "✅ 通过" : "❌ 失败"));

revokeToken(testToken);
var afterRevoke = verifyTokenWithBlacklist(testToken, JWT_SECRET);
console.log("撤销后验证: " + (afterRevoke.valid ? "✅ 通过" : "❌ " + afterRevoke.error));

console.log("\\n当前黑名单数量: " + Object.keys(tokenBlacklist).length);
console.log("黑名单条目到期后可以自动清理（与 Token exp 一致）");

// ---- 8. JWT 安全最佳实践总结 ----
console.log("\\n========== 8. JWT 安全总结 ==========");

var jwtSecurityTips = [
  { 类别: "密钥管理", 建议: "使用至少 256 位的随机密钥，存储在环境变量中" },
  { 类别: "过期时间", 建议: "Access Token 不超过 1 小时，Refresh Token 不超过 30 天" },
  { 类别: "Payload 安全", 建议: "不要在 Payload 中存储密码等敏感信息" },
  { 类别: "传输安全", 建议: "始终通过 HTTPS 传输 JWT" },
  { 类别: "存储方式", 建议: "Refresh Token 使用 HttpOnly Secure Cookie 存储" },
  { 类别: "算法验证", 建议: "服务端验证时必须指定算法，拒绝 'none' 算法" },
  { 类别: "撤销机制", 建议: "实现黑名单或版本号机制来支持 Token 撤销" },
  { 类别: "CSRF 防护", 建议: "使用 Cookie 存储时配合 CSRF Token" },
];

console.table(jwtSecurityTips);

console.log("\\n===== JWT 认证实战演示完成 =====");`,
  },

  // =========================================================
  // 第三章：密码加密与哈希
  // =========================================================
  {
    id: "node-password-hash",
    icon: "🔑",
    group: "认证与安全",
    title: "密码加密与哈希",
    content: `## 为什么密码不能明文存储？

密码明文存储是安全领域最严重的错误之一。一旦数据库被泄露（内部人员、SQL 注入、备份文件泄露等），所有用户的密码将直接暴露。更糟糕的是，大多数用户会在多个网站使用相同的密码，一个网站的泄露会导致连锁反应。

### 哈希 vs 加密

**哈希（Hash）**：
- 单向函数，不可逆
- 相同输入产生相同输出
- 固定长度输出
- 适用于密码存储

**加密（Encryption）**：
- 双向函数，可解密
- 需要密钥
- 密文长度随输入变化
- 适用于数据传输

**密码存储必须使用哈希，而不是加密。** 如果使用加密，密钥泄露意味着所有密码泄露。

### 为什么需要加盐（Salt）？

即使使用哈希，简单的哈希函数也不够安全：

**彩虹表攻击**：攻击者预先计算大量常见密码的哈希值，建立密码→哈希的映射表。通过查表可以快速反查出原始密码。

\`\`\`
// 彩虹表示例
"123456"    → e10adc3949ba59abbe56e057f20f883e
"password"  → 5f4dcc3b5aa765d61d8327deb882cf99
"admin"     → 21232f297a57a5a743894a0e4a801fc3
\`\`\`

**加盐解决这个问题**：为每个密码生成一个**随机且唯一的盐值**，将盐值与密码拼接后再哈希。

\`\`\`
hash(password + salt) = 存储的哈希值
\`\`\`

即使两个用户使用相同的密码，由于盐值不同，存储的哈希值也完全不同。这使得彩虹表攻击完全失效。

### 密码哈希算法对比

| 算法 | 特点 | 安全性 | 推荐度 |
| --- | --- | --- | --- |
| MD5 | 快速，已破解 | ❌ 不安全 | 禁止使用 |
| SHA-1 | 已被碰撞攻击 | ❌ 不安全 | 禁止使用 |
| SHA-256 | 通用哈希，速度快 | ⚠️ 不适合密码 | 不推荐 |
| **PBKDF2** | 迭代哈希，可配置 | ✅ 安全 | 推荐 |
| **bcrypt** | 自动加盐，抗暴力破解 | ✅ 安全 | 强烈推荐 |
| **scrypt** | 内存密集型，抗硬件攻击 | ✅ 最安全 | 强烈推荐 |
| **Argon2** | 2015 年密码哈希竞赛冠军 | ✅ 最安全 | 强烈推荐 |

### PBKDF2 详解

PBKDF2（Password-Based Key Derivation Function 2）是 Node.js 内置支持的密码哈希算法。它通过对密码进行多次迭代哈希来增加暴力破解的难度。

\`\`\`javascript
const crypto = require('crypto');

// PBKDF2 参数
crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
// password  : 原始密码
// salt      : 随机盐值
// iterations: 迭代次数（推荐 100000+）
// keylen    : 输出密钥长度（推荐 64 字节）
// digest    : 哈希算法（推荐 sha512）
\`\`\`

### 迭代次数的重要性

迭代次数决定了暴力破解的计算成本。随着硬件性能的提升，推荐值也在不断增加：

| 年份 | 推荐迭代次数 |
| --- | --- |
| 2015 | 10,000 |
| 2018 | 50,000 |
| 2020 | 100,000 |
| 2023 | 210,000 |
| 2025 | 600,000 |

**原则**：迭代次数应使哈希操作在目标服务器上耗时约 100ms。不要太快（容易被暴力破解），也不要太慢（影响用户体验）。

### 密码强度验证

一个好的密码策略应该要求：

1. **最小长度**：至少 8 位，推荐 12 位以上
2. **字符多样性**：包含大小写字母、数字、特殊字符
3. **禁止常见密码**：如 "123456"、"password"、"qwerty" 等
4. **禁止个人信息**：不允许包含用户名、邮箱等
5. **密码历史**：不允许重复使用最近 N 次密码

### 完整的密码管理流程

**注册流程**：
1. 验证密码强度
2. 生成随机盐值（16+ 字节）
3. 使用 PBKDF2/bcrypt 对密码+盐值进行哈希
4. 存储：哈希值 + 盐值 + 迭代次数 + 算法标识

**登录流程**：
1. 根据用户名查询存储的盐值和哈希值
2. 使用相同的盐值和参数对输入的密码进行哈希
3. 比较两个哈希值（使用时间恒定比较，防止时序攻击）

**密码重置流程**：
1. 生成一次性重置令牌（带过期时间）
2. 通过邮箱/短信发送重置链接
3. 用户点击链接后设置新密码
4. 令牌使用后立即失效`,
    code: `// ============================================================
// 第三章代码演示：密码加密与哈希
// 使用 crypto.pbkdf2 实现密码哈希、验证和盐值管理
// ============================================================

var crypto = require("crypto");

// ---- 1. 哈希算法对比 ----
console.log("========== 1. 哈希算法对比 ==========");

function hashWithAlgorithm(data, algorithm) {
  var hash = crypto.createHash(algorithm);
  hash.update(data);
  return hash.digest("hex");
}

var testPassword = "MyP@ssw0rd";
var algorithms = ["md5", "sha1", "sha256", "sha512"];

console.log("密码: " + testPassword);
console.log("\\n不同算法的哈希结果:");
algorithms.forEach(function (alg) {
  var result = hashWithAlgorithm(testPassword, alg);
  console.log("  " + alg.toUpperCase() + ": " + result.substring(0, 32) + "...");
  console.log("    长度: " + result.length + " 字符 (" + result.length / 2 + " 字节)");
});

console.log("\\n⚠️  MD5 和 SHA1 已被破解，禁止用于密码存储!");
console.log("⚠️  SHA256 虽快但无加盐，不适合直接存储密码!");

// ---- 2. 盐值（Salt）的重要性 ----
console.log("\\n========== 2. 盐值（Salt）的重要性 ==========");

// 生成随机盐值
function generateSalt(length) {
  return crypto.randomBytes(length || 16).toString("hex");
}

// 无盐哈希（不安全）
function hashWithoutSalt(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// 有盐哈希
function hashWithSalt(password, salt) {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

// 演示：两个用户使用相同密码
var samePassword = "password123";
var salt1 = generateSalt();
var salt2 = generateSalt();

console.log("两个用户都使用相同的密码: '" + samePassword + "'");
console.log("\\n无盐哈希（不安全）:");
var hash1 = hashWithoutSalt(samePassword);
var hash2 = hashWithoutSalt(samePassword);
console.log("  用户 A 哈希: " + hash1.substring(0, 32) + "...");
console.log("  用户 B 哈希: " + hash2.substring(0, 32) + "...");
console.log("  → 相同！攻击者知道这是常见密码");

console.log("\\n有盐哈希（安全）:");
var hash3 = hashWithSalt(samePassword, salt1);
var hash4 = hashWithSalt(samePassword, salt2);
console.log("  用户 A 盐值: " + salt1.substring(0, 20) + "...");
console.log("  用户 A 哈希: " + hash3.substring(0, 32) + "...");
console.log("  用户 B 盐值: " + salt2.substring(0, 20) + "...");
console.log("  用户 B 哈希: " + hash4.substring(0, 32) + "...");
console.log("  → 完全不同！即使密码相同，哈希值也不同");

// ---- 3. PBKDF2 密码哈希实现 ----
console.log("\\n========== 3. PBKDF2 密码哈希 ==========");

// PBKDF2 配置参数
var PBKDF2_CONFIG = {
  saltLength: 16,       // 盐值长度（字节）
  iterations: 100000,   // 迭代次数
  keyLength: 64,        // 输出密钥长度（字节）
  digest: "sha512",     // 哈希算法
};

// 密码哈希（异步版本）
function hashPassword(password) {
  return new Promise(function (resolve, reject) {
    var salt = crypto.randomBytes(PBKDF2_CONFIG.saltLength);

    crypto.pbkdf2(
      password,
      salt,
      PBKDF2_CONFIG.iterations,
      PBKDF2_CONFIG.keyLength,
      PBKDF2_CONFIG.digest,
      function (err, derivedKey) {
        if (err) return reject(err);

        // 存储格式：iterations$salt$hash（均为 hex 编码）
        var stored = [
          PBKDF2_CONFIG.iterations,
          salt.toString("hex"),
          derivedKey.toString("hex"),
        ].join("$");

        resolve({
          hash: stored,
          salt: salt.toString("hex"),
          iterations: PBKDF2_CONFIG.iterations,
        });
      }
    );
  });
}

// 密码验证
function verifyPassword(password, storedHash) {
  return new Promise(function (resolve, reject) {
    var parts = storedHash.split("$");
    if (parts.length !== 3) {
      return resolve({ valid: false, error: "存储格式错误" });
    }

    var iterations = parseInt(parts[0], 10);
    var salt = Buffer.from(parts[1], "hex");
    var originalHash = parts[2];

    crypto.pbkdf2(
      password,
      salt,
      iterations,
      PBKDF2_CONFIG.keyLength,
      PBKDF2_CONFIG.digest,
      function (err, derivedKey) {
        if (err) return reject(err);

        var newHash = derivedKey.toString("hex");

        // 时间恒定比较（防止时序攻击）
        var valid = crypto.timingSafeEqual(
          Buffer.from(originalHash, "hex"),
          Buffer.from(newHash, "hex")
        );

        resolve({ valid: valid });
      }
    );
  });
}

console.log("PBKDF2 配置:");
console.log("  盐值长度: " + PBKDF2_CONFIG.saltLength + " 字节");
console.log("  迭代次数: " + PBKDF2_CONFIG.iterations);
console.log("  密钥长度: " + PBKDF2_CONFIG.keyLength + " 字节");
console.log("  哈希算法: " + PBKDF2_CONFIG.digest);

// ---- 4. 密码注册与登录模拟 ----
console.log("\\n========== 4. 密码注册与登录模拟 ==========");

// 模拟用户数据库
var userDb = {};

// 注册
function register(username, password) {
  console.log("\\n--- 注册用户: " + username + " ---");
  console.log("  原始密码: " + password);

  return hashPassword(password).then(function (result) {
    userDb[username] = {
      username: username,
      passwordHash: result.hash,
      createdAt: new Date().toISOString(),
    };
    console.log("  存储的哈希: " + result.hash.substring(0, 40) + "...");
    console.log("  ✅ 注册成功!");
    return result;
  });
}

// 登录
function login(username, password) {
  console.log("\\n--- 登录尝试: " + username + " ---");

  var user = userDb[username];
  if (!user) {
    console.log("  ❌ 用户不存在");
    return Promise.resolve({ success: false, reason: "用户不存在" });
  }

  return verifyPassword(password, user.passwordHash).then(function (result) {
    if (result.valid) {
      console.log("  ✅ 登录成功! 密码验证通过");
      return { success: true };
    } else {
      console.log("  ❌ 密码错误");
      return { success: false, reason: "密码错误" };
    }
  });
}

// 执行注册和登录流程
register("alice", "SecureP@ss123")
  .then(function () {
    return register("bob", "SecureP@ss123"); // 相同密码，但哈希不同
  })
  .then(function () {
    return login("alice", "SecureP@ss123"); // 正确密码
  })
  .then(function () {
    return login("alice", "WrongPassword"); // 错误密码
  })
  .then(function () {
    return login("bob", "SecureP@ss123"); // Bob 的正确密码
  })
  .then(function () {
    // 验证相同密码产生不同哈希
    console.log("\\n========== 5. 相同密码的哈希对比 ==========");
    console.log("Alice 密码: SecureP@ss123");
    console.log("Bob   密码: SecureP@ss123");
    console.log("\\nAlice 哈希: " + userDb["alice"].passwordHash.substring(0, 50) + "...");
    console.log("Bob   哈希: " + userDb["bob"].passwordHash.substring(0, 50) + "...");
    var aliceHash = userDb["alice"].passwordHash.split("$")[2];
    var bobHash = userDb["bob"].passwordHash.split("$")[2];
    console.log("\\nAlice 哈希值: " + aliceHash.substring(0, 40) + "...");
    console.log("Bob   哈希值: " + bobHash.substring(0, 40) + "...");
    console.log("两次哈希相同? " + (aliceHash === bobHash ? "是" : "否（不同盐值导致不同哈希）"));
  })
  .then(function () {
    // ---- 6. 时序攻击防护 ----
    console.log("\\n========== 6. 时序攻击防护 ==========");

    console.log("时序攻击原理:");
    console.log("  使用 === 比较字符串时，逐字符比较，遇到不匹配立即返回");
    console.log("  攻击者可以通过测量响应时间逐位猜测正确的哈希值");
    console.log("");
    console.log("防护方案: crypto.timingSafeEqual()");
    console.log("  无论是否匹配，比较时间始终相同");
    console.log("  要求两个 Buffer 长度相同");

    // 演示 timingSafeEqual
    var buf1 = Buffer.from(aliceHash, "hex");
    var buf2 = Buffer.from(aliceHash, "hex");
    var buf3 = Buffer.from(bobHash, "hex");

    console.log("\\n比较演示:");
    console.log("  相同哈希 timingSafeEqual: " + crypto.timingSafeEqual(buf1, buf2));
    console.log("  不同哈希 timingSafeEqual: " + crypto.timingSafeEqual(buf1, buf3));

    // ---- 7. 迭代次数与性能 ----
    console.log("\\n========== 7. 迭代次数与性能测试 ==========");

    var testPassword2 = "TestPassword123";
    var testSalt = crypto.randomBytes(PBKDF2_CONFIG.saltLength);

    var iterationTests = [1000, 10000, 50000, 100000];

    // 同步版本的性能测试（简化演示）
    console.log("PBKDF2 迭代次数对性能的影响:");
    console.log("（使用同步版本 pbkdf2Sync 进行测量）");

    iterationTests.forEach(function (iters) {
      var start = process.hrtime.bigint();
      crypto.pbkdf2Sync(
        testPassword2,
        testSalt,
        iters,
        PBKDF2_CONFIG.keyLength,
        PBKDF2_CONFIG.digest
      );
      var end = process.hrtime.bigint();
      var ms = Number(end - start) / 1000000;
      console.log("  迭代 " + iters + " 次: " + ms.toFixed(2) + " ms");
    });

    console.log("\\n推荐: 迭代次数应使单次哈希耗时约 100ms");
    console.log("  当前配置: " + PBKDF2_CONFIG.iterations + " 次迭代");

    // ---- 8. 密码安全最佳实践 ----
    console.log("\\n========== 8. 密码安全最佳实践总结 ==========");

    var passwordBestPractices = [
      { 原则: "永远不存储明文密码", 说明: "使用 PBKDF2/bcrypt/scrypt/Argon2 进行哈希" },
      { 原则: "每个密码使用唯一的盐值", 说明: "至少 16 字节的随机盐值" },
      { 原则: "足够的迭代次数", 说明: "推荐 100,000+ 次迭代，使单次哈希约 100ms" },
      { 原则: "时间恒定比较", 说明: "使用 crypto.timingSafeEqual 防止时序攻击" },
      { 原则: "密码强度验证", 说明: "要求最低长度、字符多样性，拒绝常见密码" },
      { 原则: "哈希存储格式", 说明: "存储 iterations$salt$hash，便于将来升级参数" },
      { 原则: "安全传输", 说明: "通过 HTTPS 传输密码，不要在 URL 中传递" },
      { 原则: "登录限制", 说明: "限制登录尝试次数，防止暴力破解" },
    ];

    console.table(passwordBestPractices);

    console.log("\\n===== 密码加密与哈希演示完成 =====");
  })
  .catch(function (err) {
    console.error("错误:", err);
  });`,
  },

  // =========================================================
  // 第四章：安全头与防护
  // =========================================================
  {
    id: "node-helmet",
    icon: "⛑️",
    group: "认证与安全",
    title: "安全头与防护",
    content: `## HTTP 安全头的重要性

HTTP 安全头是 Web 应用安全的**第一道防线**。它们通过 HTTP 响应头告诉浏览器启用各种安全机制，从源头上阻止大量常见攻击。正确配置安全头可以防御 XSS、点击劫持、MIME 嗅探、中间人攻击等多种威胁。

### 核心安全头详解

#### 1. Content-Security-Policy（CSP）

CSP 是最强大的安全头之一。它通过白名单机制控制浏览器可以加载和执行哪些资源。

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'; img-src * data:;
\`\`\`

**CSP 核心指令**：

| 指令 | 控制范围 | 示例 |
| --- | --- | --- |
| \`default-src\` | 默认策略（兜底） | \`'self'\` |
| \`script-src\` | JavaScript 来源 | \`'self' cdn.example.com\` |
| \`style-src\` | CSS 来源 | \`'self' 'unsafe-inline'\` |
| \`img-src\` | 图片来源 | \`* data: blob:\` |
| \`font-src\` | 字体来源 | \`'self' fonts.gstatic.com\` |
| \`connect-src\` | XHR/WebSocket/EventSource | \`'self' api.example.com\` |
| \`frame-src\` | iframe 来源 | \`'none'\` |
| \`media-src\` | 音视频来源 | \`'self'\` |
| \`object-src\` | 插件来源 | \`'none'\` |
| \`form-action\` | 表单提交目标 | \`'self'\` |
| \`base-uri\` | base 标签限制 | \`'self'\` |
| \`frame-ancestors\` | 页面嵌入限制 | \`'none'\` 或 \`'self'\` |

**CSP 特殊值**：
- \`'self'\`：当前域名
- \`'none'\`：禁止所有
- \`'unsafe-inline'\`：允许内联（不推荐，会降低安全性）
- \`'unsafe-eval'\`：允许 eval()（不推荐）
- \`'nonce-随机值'\`：一次性随机数，允许特定内联脚本
- \`'sha256-哈希值'\`：允许特定哈希值的内联脚本

**CSP 报告模式**：可以先使用 \`Content-Security-Policy-Report-Only\` 头观察违规情况，调整策略后再强制启用。

#### 2. X-Frame-Options

防止点击劫持（Clickjacking）——攻击者将你的页面嵌入 iframe 并覆盖透明层。

\`\`\`
X-Frame-Options: DENY        # 完全禁止嵌入
X-Frame-Options: SAMEORIGIN  # 允许同源页面嵌入
X-Frame-Options: ALLOW-FROM https://trusted.com  # 允许指定域名
\`\`\`

**注意**：CSP 的 \`frame-ancestors\` 指令可以替代此头，且更灵活。

#### 3. X-Content-Type-Options

禁止浏览器 MIME 类型嗅探，强制按服务器声明的 Content-Type 解析资源。

\`\`\`
X-Content-Type-Options: nosniff
\`\`\`

阻止攻击者将恶意脚本伪装成图片上传（MIME 混淆攻击）。

#### 4. Strict-Transport-Security（HSTS）

强制浏览器只能通过 HTTPS 访问网站，防止 SSL 剥离攻击。

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

- \`max-age\`：有效期（秒），推荐至少 1 年
- \`includeSubDomains\`：对子域名也生效
- \`preload\`：申请加入浏览器 HSTS 预加载列表

#### 5. Referrer-Policy

控制 Referer 请求头中发送的信息量：

| 值 | 行为 |
| --- | --- |
| \`no-referrer\` | 完全不发送 Referer |
| \`no-referrer-when-downgrade\` | HTTPS→HTTP 时不发送（默认） |
| \`origin\` | 只发送源（域名），不发送完整路径 |
| \`strict-origin\` | HTTPS→HTTP 不发送，否则只发送源 |
| \`strict-origin-when-cross-origin\` | 跨域只发送源，同源发送完整 URL（推荐） |

#### 6. Permissions-Policy（原 Feature-Policy）

控制浏览器 API 的使用权限：

\`\`\`
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=()
\`\`\`

#### 7. Cross-Origin-* 系列

| 头 | 说明 |
| --- | --- |
| \`Cross-Origin-Resource-Policy\` | 控制谁可以加载资源 |
| \`Cross-Origin-Opener-Policy\` | 控制顶级浏览上下文组 |
| \`Cross-Origin-Embedder-Policy\` | 控制跨域嵌入 |

### 安全头配置原则

1. **从严格开始，逐步放宽**：先设置最严格的策略，根据实际需求调整
2. **使用 Report-Only 模式测试**：CSP 可以先观察再强制执行
3. **合理设置缓存**：安全头可以通过 \`Cache-Control\` 影响缓存
4. **监控违规报告**：CSP 可以配置报告端点，收集违规信息
5. **定期审查**：项目变更时检查安全头是否仍然合适`,
    code: `// ============================================================
// 第四章代码演示：安全头与防护
// 实现一个安全头中间件，设置各种安全响应头
// ============================================================

// ---- 1. 安全头配置对象 ----
console.log("========== 1. 安全头配置 ==========");

var securityHeadersConfig = {
  // Content-Security-Policy：最核心的安全头
  csp: {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'nonce-random123'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": ["'self'", "https://api.example.com"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  },

  // 其他安全头
  headers: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "X-XSS-Protection": "0", // 已被 CSP 取代，设为 0 禁用旧版保护
  },
};

console.log("安全头配置已加载");
console.log("  CSP 指令数: " + Object.keys(securityHeadersConfig.csp).length);
console.log("  其他安全头: " + Object.keys(securityHeadersConfig.headers).length);

// ---- 2. CSP 生成器 ----
console.log("\\n========== 2. CSP 策略生成 ==========");

function buildCSPPolicy(cspConfig) {
  var policies = [];
  for (var directive in cspConfig) {
    var sources = cspConfig[directive];
    policies.push(directive + " " + sources.join(" "));
  }
  return policies.join("; ");
}

var cspPolicy = buildCSPPolicy(securityHeadersConfig.csp);
console.log("生成的 CSP 策略:");
console.log(cspPolicy);

// 分析 CSP 策略
console.log("\\nCSP 策略分析:");
var cspAnalysis = [
  { 指令: "default-src", 值: "'self'", 含义: "默认只允许同源资源" },
  { 指令: "script-src", 值: "'self' + nonce", 含义: "禁止内联脚本，只允许带 nonce 的脚本" },
  { 指令: "img-src", 值: "'self' data: https:", 含义: "允许同源图片、data URI 和 HTTPS 图片" },
  { 指令: "frame-src", 值: "'none'", 含义: "完全禁止 iframe 嵌入外部内容" },
  { 指令: "object-src", 值: "'none'", 含义: "禁止 Flash 等插件" },
  { 指令: "frame-ancestors", 值: "'none'", 含义: "禁止被其他页面嵌入（防点击劫持）" },
  { 指令: "form-action", 值: "'self'", 含义: "表单只能提交到同源地址" },
];
console.table(cspAnalysis);

// ---- 3. 安全头中间件实现 ----
console.log("\\n========== 3. 安全头中间件实现 ==========");

// 模拟 HTTP 请求/响应对象
function createMockResponse() {
  var headers = {};
  return {
    headers: headers,
    setHeader: function (name, value) {
      headers[name.toLowerCase()] = value;
      return this;
    },
    getHeaders: function () {
      return headers;
    },
  };
}

// 安全头中间件
function securityHeadersMiddleware(config) {
  return function (req, res, next) {
    // 设置 CSP
    var csp = buildCSPPolicy(config.csp);
    res.setHeader("Content-Security-Policy", csp);

    // 设置其他安全头
    var otherHeaders = config.headers;
    for (var headerName in otherHeaders) {
      res.setHeader(headerName, otherHeaders[headerName]);
    }

    // 移除可能泄露信息的头
    res.setHeader("X-Powered-By", ""); // 移除框架标识

    if (typeof next === "function") {
      next();
    }
  };
}

// 创建中间件实例
var middleware = securityHeadersMiddleware(securityHeadersConfig);

// 模拟一个请求
var mockReq = { url: "/api/users", method: "GET" };
var mockRes = createMockResponse();

middleware(mockReq, mockRes, function () {
  console.log("中间件执行完毕，继续处理请求...");
});

console.log("安全头已设置到响应对象:");
console.log("");

// 打印所有设置的响应头
var allHeaders = mockRes.getHeaders();
var headerList = Object.keys(allHeaders).sort();
headerList.forEach(function (name) {
  var value = allHeaders[name];
  var displayValue = value.length > 80 ? value.substring(0, 77) + "..." : value;
  console.log("  " + name + ": " + displayValue);
});

// ---- 4. 安全头详解 ----
console.log("\\n========== 4. 安全头作用详解 ==========");

var headerExplanations = [
  {
    安全头: "Content-Security-Policy",
    防御的攻击: "XSS、数据注入",
    作用: "白名单机制控制资源加载来源",
    强度: "⭐⭐⭐⭐⭐",
  },
  {
    安全头: "X-Frame-Options",
    防御的攻击: "点击劫持 (Clickjacking)",
    作用: "禁止页面被嵌入 iframe",
    强度: "⭐⭐⭐⭐",
  },
  {
    安全头: "X-Content-Type-Options",
    防御的攻击: "MIME 类型嗅探攻击",
    作用: "强制按声明类型解析资源",
    强度: "⭐⭐⭐",
  },
  {
    安全头: "Strict-Transport-Security",
    防御的攻击: "SSL 剥离、中间人攻击",
    作用: "强制 HTTPS 连接",
    强度: "⭐⭐⭐⭐⭐",
  },
  {
    安全头: "Referrer-Policy",
    防御的攻击: "信息泄露",
    作用: "控制 Referer 头发送的信息量",
    强度: "⭐⭐⭐",
  },
  {
    安全头: "Permissions-Policy",
    防御的攻击: "恶意使用浏览器 API",
    作用: "控制浏览器功能权限",
    强度: "⭐⭐⭐⭐",
  },
  {
    安全头: "Cross-Origin-Resource-Policy",
    防御的攻击: "跨域资源窃取",
    作用: "控制谁可以加载资源",
    强度: "⭐⭐⭐⭐",
  },
];

console.table(headerExplanations);

// ---- 5. CSP 违规报告模拟 ----
console.log("\\n========== 5. CSP 违规报告模拟 ==========");

// 模拟 CSP 违规报告端点
function handleCSPReport(report) {
  console.log("收到 CSP 违规报告:");
  console.log("  被阻止的 URI: " + (report["blocked-uri"] || "未知"));
  console.log("  违规指令: " + (report["violated-directive"] || "未知"));
  console.log("  文档 URI: " + (report["document-uri"] || "未知"));
  console.log("  原始策略: " + (report["original-policy"] || "未知"));
  console.log("  来源文件: " + (report["source-file"] || "内联"));
  console.log("  行号: " + (report["line-number"] || "未知"));
}

// 模拟几个违规报告
var simulatedReports = [
  {
    "blocked-uri": "https://evil.com/malicious.js",
    "violated-directive": "script-src 'self'",
    "document-uri": "https://myapp.com/page",
    "original-policy": cspPolicy,
    "source-file": "https://evil.com/malicious.js",
    "line-number": 1,
    "desc": "外部恶意脚本被阻止",
  },
  {
    "blocked-uri": "inline",
    "violated-directive": "script-src 'self'",
    "document-uri": "https://myapp.com/page",
    "original-policy": cspPolicy,
    "source-file": "https://myapp.com/page",
    "line-number": 42,
    "desc": "内联脚本被阻止（需要使用 nonce）",
  },
  {
    "blocked-uri": "http://insecure-cdn.com/image.jpg",
    "violated-directive": "img-src https:",
    "document-uri": "https://myapp.com/page",
    "original-policy": cspPolicy,
    "desc": "HTTP 图片被阻止（只允许 HTTPS）",
  },
];

simulatedReports.forEach(function (report) {
  console.log("\\n--- " + report.desc + " ---");
  handleCSPReport(report);
});

// ---- 6. 安全头分级策略 ----
console.log("\\n========== 6. 安全头分级策略 ==========");

var securityLevels = {
  strict: {
    name: "严格模式",
    description: "适用于银行、金融等高风险应用",
    headers: {
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
  moderate: {
    name: "中等模式",
    description: "适用于大多数企业应用",
    headers: {
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(self), microphone=(self)",
    },
  },
  basic: {
    name: "基础模式",
    description: "最小安全要求",
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
};

for (var level in securityLevels) {
  var config = securityLevels[level];
  console.log(config.name + " (" + level + "):");
  console.log("  " + config.description);
  var hdrs = config.headers;
  for (var h in hdrs) {
    console.log("    " + h + ": " + hdrs[h]);
  }
}

// ---- 7. 安全头检查工具 ----
console.log("\\n========== 7. 安全头检查工具 ==========");

function auditSecurityHeaders(headers) {
  var results = [];
  var score = 0;
  var maxScore = 0;

  var checks = [
    { name: "Content-Security-Policy", weight: 3, desc: "防御 XSS 攻击的核心头" },
    { name: "X-Frame-Options", weight: 2, desc: "防止点击劫持" },
    { name: "X-Content-Type-Options", weight: 2, desc: "防止 MIME 嗅探" },
    { name: "Strict-Transport-Security", weight: 3, desc: "强制 HTTPS" },
    { name: "Referrer-Policy", weight: 1, desc: "控制 Referer 信息泄露" },
    { name: "Permissions-Policy", weight: 1, desc: "控制浏览器 API 权限" },
    { name: "Cross-Origin-Resource-Policy", weight: 1, desc: "跨域资源策略" },
  ];

  checks.forEach(function (check) {
    maxScore += check.weight;
    var headerName = check.name.toLowerCase();
    if (headers[headerName]) {
      results.push({
        安全头: check.name,
        状态: "✅ 已设置",
        权重: check.weight,
        说明: check.desc,
      });
      score += check.weight;
    } else {
      results.push({
        安全头: check.name,
        状态: "❌ 缺失",
        权重: check.weight,
        说明: check.desc,
      });
    }
  });

  console.table(results);
  console.log("\\n安全评分: " + score + "/" + maxScore + " (" + Math.round(score / maxScore * 100) + "%)");

  if (score === maxScore) {
    console.log("🎉 所有关键安全头已正确配置!");
  } else if (score >= maxScore * 0.7) {
    console.log("⚠️  大部分安全头已配置，建议补充缺失的头");
  } else {
    console.log("🚨 安全配置严重不足，请立即添加安全头!");
  }
}

// 检查刚才配置的响应头
console.log("检查当前安全头配置:");
auditSecurityHeaders(mockRes.getHeaders());

// ---- 8. 安全头最佳实践总结 ----
console.log("\\n========== 8. 安全头最佳实践总结 ==========");

var bestPractices = [
  { 实践: "CSP 从严格开始", 说明: "先设置 'self'，根据实际需求逐步放宽" },
  { 实践: "使用 Report-Only 模式", 说明: "先用 Report-Only 观察违规，再强制启用" },
  { 实践: "移除 X-Powered-By", 说明: "隐藏服务器技术栈信息" },
  { 实践: "HSTS 预加载", 说明: "提交到浏览器 HSTS 预加载列表，确保首次访问也是 HTTPS" },
  { 实践: "定期审查", 说明: "每次部署前检查安全头是否正确配置" },
  { 实践: "监控 CSP 违规", 说明: "配置 report-uri 端点，收集和分析 CSP 违规报告" },
  { 实践: "使用自动化工具", 说明: "Mozilla Observatory、SecurityHeaders.com 等在线检测工具" },
];

console.table(bestPractices);

console.log("\\n===== 安全头与防护演示完成 =====");`,
  },

  // =========================================================
  // 第五章：限流与防刷
  // =========================================================
  {
    id: "node-rate-limit",
    icon: "🚧",
    group: "认证与安全",
    title: "限流与防刷",
    content: `## 为什么需要限流？

限流（Rate Limiting）是保护 API 服务的关键手段。在没有限流的情况下，恶意用户或脚本可以：
- 暴力破解密码（每秒尝试数十万次）
- 爬取敏感数据
- 发起 DDoS 攻击耗尽服务器资源
- 滥用短信/邮件发送接口造成财务损失

限流的核心思想是**控制请求的频率**，在保护服务和提供良好用户体验之间取得平衡。

### 限流算法对比

#### 1. 固定窗口（Fixed Window）

将时间划分为固定窗口（如每分钟），在窗口内计数。到达限制后拒绝请求。

**优点**：实现简单，内存占用小
**缺点**：窗口边界问题——在窗口末尾和下一窗口开始瞬间可以发送 2 倍限制的请求

\`\`\`
窗口 1 (00:00-00:01): 100 个请求（达到限制）
窗口 2 (00:01-00:02): 100 个请求（达到限制）
→ 在 00:00:59 和 00:01:00 两秒内可以发送 200 个请求
\`\`\`

#### 2. 滑动窗口（Sliding Window）

使用更细粒度的时间段（如每秒），统计过去 N 个时间段内的请求数。

**优点**：平滑，没有固定窗口的边界问题
**缺点**：实现稍复杂，需要存储更多时间戳数据

#### 3. 滑动窗口日志（Sliding Window Log）

记录每个请求的时间戳，每次检查时计算窗口内的请求数。

**优点**：精确，无边界问题
**缺点**：内存占用大（活跃用户多时）

#### 4. 令牌桶（Token Bucket）

维护一个令牌桶，以固定速率放入令牌。每个请求消耗一个令牌，令牌不足时拒绝。

**优点**：允许突发流量（桶容量），非常灵活
**缺点**：实现复杂，需要定时器

#### 5. 漏桶（Leaky Bucket）

请求先进入队列，以固定速率处理。队列满时拒绝请求。

**优点**：平滑输出速率，适合流量整形
**缺点**：无法处理突发流量

### 限流维度

| 维度 | 说明 | 示例 |
| --- | --- | --- |
| IP 限流 | 基于客户端 IP 地址 | 每 IP 每分钟 100 次请求 |
| 用户限流 | 基于用户 ID | 每用户每天 1000 次 API 调用 |
| 接口限流 | 基于 API 端点 | /login 每分钟 5 次，/api/data 每分钟 100 次 |
| 全局限流 | 系统整体限制 | 整个服务每秒 10000 次请求 |

### 限流存储方案

| 方案 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| 内存 | 极快，无外部依赖 | 进程重启丢失，多进程不共享 | 单进程应用 |
| Redis | 持久化，多进程共享 | 需要额外基础设施 | 分布式应用 |
| 数据库 | 持久化，已有基础设施 | 速度慢，增加数据库压力 | 低频限流 |

### 限流响应

当请求被限流时，应该返回明确的响应：

**HTTP 状态码**：\`429 Too Many Requests\`

**响应头**（RFC 6585）：
| 响应头 | 说明 |
| --- | --- |
| \`Retry-After\` | 多少秒后可以重试 |
| \`X-RateLimit-Limit\` | 限制值 |
| \`X-RateLimit-Remaining\` | 剩余次数 |
| \`X-RateLimit-Reset\` | 重置时间（Unix 时间戳） |

### 限流策略设计

**渐进式限流**：
1. 正常状态：标准限制（如每分钟 100 次）
2. 接近限制：返回警告头
3. 达到限制：返回 429
4. 持续超限：临时增加限制或封禁 IP

**白名单**：内部服务、管理员、VIP 用户可以不限流或使用更高限制。

**黑名单**：检测到恶意行为后，可以临时或永久封禁。

### 分布式限流

在微服务或多实例部署中，单机内存限流无法满足需求。需要使用共享存储：

**Redis 方案**：
- 使用 Redis 的 INCR + EXPIRE 实现计数器
- 使用 Redis Sorted Set 实现滑动窗口
- 使用 Redis Lua 脚本保证原子性
- 使用 Redis Cluster 保证高可用

**分布式限流的关键问题**：
1. **时钟同步**：不同服务器的时间可能不一致，需要 NTP 同步
2. **网络延迟**：Redis 调用引入额外延迟，需要设置合理的超时
3. **原子性**：多个操作必须原子执行，防止竞态条件
4. **故障降级**：Redis 不可用时的降级策略（开放或关闭）

### 限流监控与告警

限流不仅是防护手段，也是系统健康度的重要指标：

- **监控指标**：限流触发次数、限流触发比例、各接口限流分布
- **告警规则**：限流比例突增（可能表示攻击或流量异常）
- **日志记录**：记录被限流的请求信息（IP、接口、时间、User-Agent）
- **分析优化**：根据限流数据调整限制阈值和扩容策略

### 实际生产中的限流架构

一个完整的限流系统通常包含以下层次：

1. **CDN 层**：WAF（Web 应用防火墙）级别的限流
2. **反向代理层**：Nginx/Envoy 的 rate limiting 模块
3. **应用层**：应用代码中的限流中间件（本章重点）
4. **业务层**：特定业务逻辑的限流（如验证码发送频率）`,
    code: `// ============================================================
// 第五章代码演示：限流与防刷
// 实现滑动窗口限流算法，支持 IP 和接口级别的限流
// ============================================================

// ---- 1. 滑动窗口限流器实现 ----
console.log("========== 1. 滑动窗口限流器 ==========");

function SlidingWindowRateLimiter(options) {
  this.windowMs = options.windowMs || 60000;    // 时间窗口（默认 60 秒）
  this.maxRequests = options.maxRequests || 100; // 窗口内最大请求数
  this.buckets = options.buckets || 10;          // 窗口内的桶数（用于滑动窗口）
  this.store = {};                               // 存储：Map<key, bucketArray>

  // 每个桶的时间跨度
  this.bucketSpan = Math.ceil(this.windowMs / this.buckets);
}

// 获取当前桶索引
SlidingWindowRateLimiter.prototype.getCurrentBucket = function () {
  return Math.floor(Date.now() / this.bucketSpan);
};

// 清理过期桶
SlidingWindowRateLimiter.prototype.cleanExpiredBuckets = function (key, currentBucket) {
  var entry = this.store[key];
  if (!entry) return;

  var windowBuckets = this.buckets;
  var oldestValidBucket = currentBucket - windowBuckets + 1;

  // 移除超出窗口的桶
  for (var bucket in entry.buckets) {
    if (parseInt(bucket, 10) < oldestValidBucket) {
      delete entry.buckets[bucket];
    }
  }
};

// 检查是否允许请求
SlidingWindowRateLimiter.prototype.check = function (key) {
  var currentBucket = this.getCurrentBucket();

  // 初始化存储条目
  if (!this.store[key]) {
    this.store[key] = { buckets: {}, lastAccess: Date.now() };
  }

  var entry = this.store[key];
  entry.lastAccess = Date.now();

  // 清理过期桶
  this.cleanExpiredBuckets(key, currentBucket);

  // 当前桶的计数
  if (!entry.buckets[currentBucket]) {
    entry.buckets[currentBucket] = 0;
  }

  // 计算窗口内的总请求数
  var totalRequests = 0;
  var windowBuckets = this.buckets;
  var oldestValidBucket = currentBucket - windowBuckets + 1;

  for (var bucket in entry.buckets) {
    var bucketNum = parseInt(bucket, 10);
    if (bucketNum >= oldestValidBucket && bucketNum <= currentBucket) {
      totalRequests += entry.buckets[bucket];
    }
  }

  var remaining = this.maxRequests - totalRequests - 1;

  if (remaining < 0) {
    // 达到限制
    return {
      allowed: false,
      remaining: 0,
      limit: this.maxRequests,
      retryAfterMs: this.bucketSpan,
      totalRequests: totalRequests,
    };
  }

  // 允许请求，增加计数
  entry.buckets[currentBucket]++;
  totalRequests++;

  return {
    allowed: true,
    remaining: remaining,
    limit: this.maxRequests,
    totalRequests: totalRequests,
  };
};

// 重置指定 key 的计数
SlidingWindowRateLimiter.prototype.reset = function (key) {
  delete this.store[key];
};

// 获取存储状态
SlidingWindowRateLimiter.prototype.getStats = function () {
  var keys = Object.keys(this.store);
  return {
    activeKeys: keys.length,
    totalStored: keys.length,
  };
};

console.log("滑动窗口限流器已初始化");
console.log("  窗口大小: 60 秒");
console.log("  最大请求: 100 次/窗口");
console.log("  桶数量: 10 个");

// ---- 2. 基础限流演示 ----
console.log("\\n========== 2. 基础限流演示 ==========");

var limiter = new SlidingWindowRateLimiter({
  windowMs: 60000,
  maxRequests: 5,  // 设为 5 方便演示
  buckets: 10,
});

var testKey = "192.168.1.100";

console.log("模拟 IP " + testKey + " 的请求序列（限制: 5 次/分钟）:");
for (var i = 1; i <= 8; i++) {
  var result = limiter.check(testKey);
  var status = result.allowed ? "✅ 通过" : "🚫 限流";
  console.log(
    "  请求 " + i + ": " + status +
    " | 已用: " + result.totalRequests + "/" + result.limit +
    " | 剩余: " + result.remaining
  );
}

// ---- 3. IP 级别限流 ----
console.log("\\n========== 3. IP 级别限流 ==========");

var ipLimiter = new SlidingWindowRateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  buckets: 10,
});

var ipAddresses = ["192.168.1.1", "192.168.1.2", "10.0.0.1", "192.168.1.1", "192.168.1.1"];

console.log("模拟多个 IP 的请求:");
ipAddresses.forEach(function (ip, index) {
  var result = ipLimiter.check(ip);
  console.log("  [" + (index + 1) + "] " + ip + " → " + (result.allowed ? "✅" : "🚫") + " 剩余: " + result.remaining);
});

// ---- 4. 接口级别限流 ----
console.log("\\n========== 4. 接口级别限流 ==========");

// 不同接口不同的限制规则
var apiLimiters = {
  "/api/login": new SlidingWindowRateLimiter({
    windowMs: 60000,
    maxRequests: 5,   // 登录接口严格限制
    buckets: 10,
  }),
  "/api/data": new SlidingWindowRateLimiter({
    windowMs: 60000,
    maxRequests: 100, // 数据接口宽松
    buckets: 10,
  }),
  "/api/upload": new SlidingWindowRateLimiter({
    windowMs: 60000,
    maxRequests: 10,  // 上传接口中等限制
    buckets: 10,
  }),
  "/api/search": new SlidingWindowRateLimiter({
    windowMs: 60000,
    maxRequests: 50,  // 搜索接口
    buckets: 10,
  }),
};

console.log("接口限流规则:");
for (var api in apiLimiters) {
  var lim = apiLimiters[api];
  console.log("  " + api + " → " + lim.maxRequests + " 次/分钟");
}

// 模拟登录接口的暴力破解防护
console.log("\\n模拟登录接口暴力破解:");
var attackerIp = "10.10.10.10";
var loginLimiter = apiLimiters["/api/login"];

for (var i = 1; i <= 8; i++) {
  var result = loginLimiter.check(attackerIp);
  var status = result.allowed ? "✅ 允许" : "🚫 拒绝";
  console.log("  登录尝试 " + i + ": " + status + " (剩余 " + result.remaining + " 次)");
  if (!result.allowed) {
    console.log("  → 触发限流！建议后续尝试: " + result.retryAfterMs + "ms 后");
  }
}

// ---- 5. 用户级别限流 ----
console.log("\\n========== 5. 用户级别限流 ==========");

var userLimiter = new SlidingWindowRateLimiter({
  windowMs: 60000,
  maxRequests: 20,
  buckets: 10,
});

// 组合 key：用户 ID + 接口路径
function getUserApiKey(userId, apiPath) {
  return "user:" + userId + ":" + apiPath;
}

var users = ["user_001", "user_002", "user_001", "user_001"];
var api = "/api/data";

users.forEach(function (userId, index) {
  var key = getUserApiKey(userId, api);
  var result = userLimiter.check(key);
  console.log("  [" + (index + 1) + "] " + userId + " 请求 " + api + " → " + (result.allowed ? "✅" : "🚫") + " 剩余: " + result.remaining);
});

// ---- 6. 限流响应头生成 ----
console.log("\\n========== 6. 限流响应头 ==========");

function generateRateLimitHeaders(limitResult) {
  var headers = {};
  headers["X-RateLimit-Limit"] = limitResult.limit;
  headers["X-RateLimit-Remaining"] = Math.max(0, limitResult.remaining);
  headers["X-RateLimit-Reset"] = Math.ceil(Date.now() / 1000) + Math.ceil(limitResult.retryAfterMs / 1000);

  if (!limitResult.allowed) {
    headers["Retry-After"] = Math.ceil(limitResult.retryAfterMs / 1000);
  }

  return headers;
}

// 模拟不同场景的响应头
var scenarios = [
  { desc: "正常请求", allowed: true, remaining: 95, limit: 100 },
  { desc: "接近限制", allowed: true, remaining: 2, limit: 100 },
  { desc: "达到限制", allowed: false, remaining: 0, limit: 100, retryAfterMs: 6000 },
  { desc: "严重超限", allowed: false, remaining: 0, limit: 100, retryAfterMs: 30000 },
];

console.log("不同场景的限流响应头:");
scenarios.forEach(function (scenario) {
  var headers = generateRateLimitHeaders(scenario);
  console.log("\\n--- " + scenario.desc + " ---");
  for (var h in headers) {
    console.log("  " + h + ": " + headers[h]);
  }
});

// ---- 7. 令牌桶算法实现 ----
console.log("\\n========== 7. 令牌桶算法 ==========");

function TokenBucket(options) {
  this.capacity = options.capacity || 100;       // 桶容量
  this.fillRate = options.fillRate || 10;        // 每秒填充速率
  this.tokens = this.capacity;                   // 当前令牌数
  this.lastFill = Date.now();                    // 上次填充时间
}

TokenBucket.prototype.fill = function () {
  var now = Date.now();
  var elapsed = (now - this.lastFill) / 1000;    // 过去秒数
  var newTokens = elapsed * this.fillRate;
  this.tokens = Math.min(this.capacity, this.tokens + newTokens);
  this.lastFill = now;
};

TokenBucket.prototype.consume = function (count) {
  count = count || 1;
  this.fill();
  if (this.tokens >= count) {
    this.tokens -= count;
    return { allowed: true, tokensLeft: Math.floor(this.tokens) };
  }
  return { allowed: false, tokensLeft: Math.floor(this.tokens) };
};

// 演示令牌桶
var bucket = new TokenBucket({ capacity: 10, fillRate: 2 }); // 每秒填充 2 个令牌

console.log("令牌桶配置: 容量 10, 填充速率 2/秒");
console.log("\\n模拟突发请求（消耗所有令牌）:");
for (var i = 1; i <= 12; i++) {
  var result = bucket.consume(1);
  var status = result.allowed ? "✅" : "🚫";
  console.log("  请求 " + i + ": " + status + " 剩余令牌: " + result.tokensLeft);
}

console.log("\\n说明: 令牌桶允许短时间的突发流量，");
console.log("      但长期平均速率被限制为填充速率");

// ---- 8. 渐进式限流与封禁 ----
console.log("\\n========== 8. 渐进式限流与封禁 ==========");

function ProgressiveRateLimiter(options) {
  this.baseLimit = options.baseLimit || 100;
  this.warningThreshold = options.warningThreshold || 0.8; // 80% 时警告
  this.blockThreshold = options.blockThreshold || 3;       // 连续超限 3 次封禁
  this.store = {};
}

ProgressiveRateLimiter.prototype.check = function (key) {
  if (!this.store[key]) {
    this.store[key] = { count: 0, violations: 0, blocked: false, blockedUntil: 0 };
  }

  var entry = this.store[key];

  // 检查是否被封禁
  if (entry.blocked) {
    if (Date.now() < entry.blockedUntil) {
      var remaining = Math.ceil((entry.blockedUntil - Date.now()) / 1000);
      return { allowed: false, blocked: true, unblockIn: remaining };
    }
    // 解封
    entry.blocked = false;
    entry.violations = 0;
    entry.count = 0;
  }

  entry.count++;
  var usage = entry.count / this.baseLimit;

  // 接近限制，返回警告
  if (usage >= this.warningThreshold && usage < 1.0) {
    return {
      allowed: true,
      warning: true,
      usagePercent: Math.round(usage * 100),
      remaining: this.baseLimit - entry.count,
    };
  }

  // 达到限制
  if (usage >= 1.0) {
    entry.violations++;

    if (entry.violations >= this.blockThreshold) {
      // 封禁 5 分钟
      entry.blocked = true;
      entry.blockedUntil = Date.now() + 300000;
      return { allowed: false, blocked: true, unblockIn: 300 };
    }

    return {
      allowed: false,
      limited: true,
      violations: entry.violations,
      violationLimit: this.blockThreshold,
    };
  }

  return { allowed: true, remaining: this.baseLimit - entry.count };
};

var progressiveLimiter = new ProgressiveRateLimiter({
  baseLimit: 5,
  warningThreshold: 0.6,
  blockThreshold: 3,
});

console.log("渐进式限流配置: 基础限制 5 次, 警告阈值 60%, 封禁阈值 3 次超限");
console.log("\\n模拟攻击者多次超限:");

var attackerKey = "attacker_1";
for (var i = 1; i <= 25; i++) {
  var result = progressiveLimiter.check(attackerKey);

  if (result.blocked) {
    console.log("  请求 " + i + ": 🚫 已封禁! 剩余解封时间: " + result.unblockIn + " 秒");
    break;
  } else if (result.warning) {
    console.log("  请求 " + i + ": ⚠️  警告! 使用率 " + result.usagePercent + "%");
  } else if (result.limited) {
    console.log("  请求 " + i + ": 🚫 限流! 超限次数 " + result.violations + "/" + result.violationLimit);
  } else {
    console.log("  请求 " + i + ": ✅ 通过");
  }
}

// ---- 9. 限流最佳实践总结 ----
console.log("\\n========== 9. 限流最佳实践总结 ==========");

var rateLimitBestPractices = [
  { 实践: "选择合适的算法", 说明: "滑动窗口适合大多数场景，令牌桶适合需要突发流量的场景" },
  { 实践: "分级限流", 说明: "不同接口设置不同限制，登录等敏感接口更严格" },
  { 实践: "返回标准响应头", 说明: "X-RateLimit-* 系列头帮助客户端自适应" },
  { 实践: "渐进式处理", 说明: "警告 → 限流 → 封禁，而非直接拒绝" },
  { 实践: "白名单机制", 说明: "内部服务和管理员可以不受限流影响" },
  { 实践: "分布式限流", 说明: "多实例部署时使用 Redis 等共享存储" },
  { 实践: "监控与告警", 说明: "记录限流事件，对异常模式设置告警" },
  { 实践: "优雅降级", 说明: "限流时返回友好的错误信息，而非直接断开连接" },
];

console.table(rateLimitBestPractices);

console.log("\\n===== 限流与防刷演示完成 =====");`,
  },

  // =========================================================
  // 第六章：输入过滤与防注入
  // =========================================================
  {
    id: "node-input-sanitize",
    icon: "🧹",
    group: "认证与安全",
    title: "输入过滤与防注入",
    content: `## 输入过滤的重要性

输入过滤是安全防御的**第一道防线**。所有来自外部的数据——URL 参数、表单提交、HTTP 头、Cookie、文件上传——都必须经过过滤和验证才能进入应用逻辑。OWASP 将"注入"列为 Web 应用安全的第一大威胁，而输入过滤正是对抗注入攻击的最有效手段。

### 安全原则

**核心原则：永远不信任用户输入。**

1. **白名单优于黑名单**：定义允许的输入模式，而不是列举要排除的危险模式
2. **服务端验证是必须的**：前端验证只是用户体验优化，不能作为安全防线
3. **验证后再过滤**：先验证格式和类型，再对通过验证的内容进行编码/过滤
4. **最小权限**：输入过滤应尽可能严格，只放行确实需要的内容

### XSS 过滤（HTML 实体编码）

XSS（跨站脚本攻击）的本质是攻击者注入的 HTML/JavaScript 代码在浏览器被执行。防御的核心是**根据输出上下文进行编码**。

**HTML 实体编码对照表**：

| 字符 | 实体编码 | 说明 |
| --- | --- | --- |
| \`&\` | \`&amp;\` | 实体起始符，必须最先编码 |
| \`<\` | \`&lt;\` | 标签起始符 |
| \`>\` | \`&gt;\` | 标签结束符 |
| \`"\` | \`&quot;\` | 属性值分隔符 |
| \`'\` | \`&#x27;\` | 属性值分隔符（单引号） |
| \`/\` | \`&#x2F;\` | 结束标签 |

**编码顺序很重要**：必须先编码 \`&\`，否则后续编码会产生新的 \`&\` 字符。

### SQL 注入防范

SQL 注入是最危险的注入攻击之一。防御的核心是**参数化查询**：

\`\`\`javascript
// ❌ 危险：字符串拼接
const sql = "SELECT * FROM users WHERE id = " + userId;

// ✅ 安全：参数化查询
const sql = "SELECT * FROM users WHERE id = ?";
db.query(sql, [userId]);
\`\`\`

**参数化查询的原理**：参数值被发送到数据库后，数据库将其视为**数据**而非**SQL 代码**。即使参数中包含 SQL 关键字，也不会被解释执行。

### 命令注入防范

在 Node.js 中执行系统命令时，必须严格过滤用户输入：

\`\`\`javascript
// ❌ 危险：用户输入直接拼接到命令中
const { exec } = require('child_process');
exec('ls ' + userInput);

// ✅ 安全：使用 execFile 并显式传参
const { execFile } = require('child_process');
execFile('ls', [userInput], { shell: false });
\`\`\`

### 路径遍历防范

路径遍历攻击（Directory Traversal）通过 \`../\` 等技巧访问基础目录之外的文件。

**防御步骤**：
1. 使用 \`path.resolve()\` 规范化路径
2. 验证规范化后的路径是否在允许的基础目录内
3. 禁止访问隐藏文件（以 \`.\` 开头）
4. 使用白名单限制可访问的文件

### 正则拒绝服务（ReDoS）防范

某些正则表达式在某些输入下会导致指数级回溯，造成 CPU 100% 占用。

**危险的正则特征**：
- 嵌套量词：\`(a+)+$\`
- 重叠选择：\`(a|aa)+$\`
- 贪婪匹配 + 回溯

**防范措施**：
- 避免复杂的嵌套量词
- 使用原子组或占有量词
- 设置正则执行超时
- 限制输入长度后再匹配

### 输入长度限制

所有输入都应该有长度限制：
- 防止缓冲区溢出
- 防止 DoS（处理超长字符串消耗资源）
- 防止数据库存储异常数据

### 完整的输入过滤流程

\`\`\`
用户输入 → 类型检查 → 格式验证 → 长度限制 → 内容过滤 → 输出编码 → 使用
\`\`\`

每一层都是独立的防线，即使某一层失效，其他层仍然能提供保护。这就是**纵深防御**原则。

### 输入过滤的上下文感知

不同的输入上下文需要不同的过滤策略。一个常见的错误是使用单一的过滤方式处理所有输入：

| 输入类型 | 典型场景 | 过滤策略 |
| --- | --- | --- |
| 用户名 | 登录/注册 | 字母数字 + 长度限制 |
| 用户评论 | 论坛/评论区 | HTML 实体编码 |
| 搜索关键词 | 搜索框 | 特殊字符转义 + 长度限制 |
| 文件上传名 | 文件管理 | 路径安全化 + 扩展名白名单 |
| JSON 数据 | API 请求 | Schema 验证 |
| URL 参数 | 路由参数 | 类型检查 + 格式验证 |

### 安全的 JSON 解析

JSON.parse 本身是安全的，但解析后的数据仍需验证：

\`\`\`javascript
// ❌ 假设 JSON 数据是安全的
const data = JSON.parse(request.body);
db.query("INSERT INTO users SET ?", data); // 可能包含额外字段

// ✅ 验证 JSON 数据的结构和类型
const schema = {
  username: { type: 'string', required: true, maxLength: 20 },
  email: { type: 'string', required: true, pattern: /^[^\\s@]+@[^\\s@]+$/ },
};
const validated = validate(data, schema);
\`\`\`

### 文件上传安全

文件上传是 Web 应用中最危险的输入之一：

1. **文件类型验证**：检查 MIME 类型和文件魔术数字（magic bytes），不信任扩展名
2. **文件大小限制**：设置合理的文件大小上限
3. **文件名安全化**：移除路径分隔符和特殊字符
4. **存储隔离**：上传文件存储在 Web 根目录之外
5. **病毒扫描**：对上传文件进行病毒扫描
6. **权限控制**：上传目录设置最小权限

### 实战：构建安全的输入验证模块

一个好的输入验证模块应该具备以下特性：

\`\`\`javascript
const InputValidator = {
  // 链式验证 API
  string().min(3).max(20).alphanumeric().required(),
  
  // 自定义验证规则
  custom(value => value !== 'admin'),
  
  // 错误收集（返回所有错误，而非遇到第一个就停止）
  validateAll(),
  
  // 数据转换（类型转换、trim、默认值）
  transform(),
};
\`\`\`

### 输入过滤的常见陷阱

1. **过度过滤**：过滤掉用户的合法输入（如名字中的撇号 O'Brien）
2. **过滤不足**：只做了前端验证，服务端未做
3. **黑名单思维**：试图列举所有危险输入，总有遗漏
4. **编码后再次编码**：多重编码导致数据损坏
5. **在错误的位置编码**：在存储时编码而非输出时编码`,
    code: `// ============================================================
// 第六章代码演示：输入过滤与防注入
// 实现输入过滤工具，包括 HTML 编码、路径安全化、字符串脱敏
// ============================================================

var path = require("path");
var crypto = require("crypto");

// ---- 1. HTML 实体编码工具 ----
console.log("========== 1. HTML 实体编码 ==========");

var HtmlEncoder = {
  // 标准 HTML 实体编码
  encode: function (str) {
    if (typeof str !== "string") return String(str);
    return str
      .replace(/&/g, "&amp;")     // 必须最先编码 &
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\\//g, "&#x2F;");
  },

  // 解码（仅用于展示，实际不应对用户输入解码）
  decode: function (str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/");
  },

  // HTML 属性编码（比正文编码更严格）
  encodeAttribute: function (str) {
    if (typeof str !== "string") return String(str);
    return this.encode(str)
      .replace(/ /g, "&#x20;")
      .replace(/\\t/g, "&#x09;");
  },

  // JavaScript 字符串转义
  encodeForJS: function (str) {
    if (typeof str !== "string") return String(str);
    return str
      .replace(/\\\\/g, "\\\\\\\\")
      .replace(/'/g, "\\\\'")
      .replace(/"/g, '\\\\"')
      .replace(/\\n/g, "\\\\n")
      .replace(/\\r/g, "\\\\r");
  },

  // URL 编码
  encodeForURL: function (str) {
    if (typeof str !== "string") return String(str);
    return encodeURIComponent(str);
  },
};

// 演示各种编码
var xssPayloads = [
  { raw: '<script>alert("XSS")</script>', desc: "基础 XSS 脚本" },
  { raw: '<img src=x onerror="alert(1)">', desc: "图片事件注入" },
  { raw: "javascript:alert('XSS')", desc: "JavaScript 协议" },
  { raw: '<a href="http://evil.com">点击</a>', desc: "恶意链接" },
  { raw: "正常用户评论：很不错！", desc: "正常输入" },
  { raw: '<div style="background:url(javascript:alert(1))">', desc: "CSS 注入" },
];

console.log("HTML 实体编码演示:");
console.table(
  xssPayloads.map(function (item) {
    return {
      攻击类型: item.desc,
      原始输入: item.raw,
      编码输出: HtmlEncoder.encode(item.raw),
    };
  })
);

// ---- 2. 路径安全化工具 ----
console.log("\\n========== 2. 路径安全化 ==========");

var PathSanitizer = {
  // 允许的字符集（白名单）
  ALLOWED_CHARS: /^[a-zA-Z0-9._\\-]+$/,

  // 基础目录
  BASE_DIR: "/var/www/uploads",

  // 安全化文件路径
  sanitize: function (userInput, baseDir) {
    baseDir = baseDir || this.BASE_DIR;

    // 1. 检查空输入
    if (!userInput || typeof userInput !== "string") {
      return { valid: false, error: "路径不能为空" };
    }

    // 2. 路径规范化
    var resolved = path.resolve(baseDir, userInput);

    // 3. 检查是否在基础目录内
    if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) {
      return {
        valid: false,
        error: "路径遍历攻击被阻止",
        attempted: userInput,
        resolved: resolved,
      };
    }

    // 4. 检查文件名
    var basename = path.basename(resolved);
    if (basename.startsWith(".")) {
      return { valid: false, error: "不允许访问隐藏文件" };
    }

    // 5. 检查文件名是否包含非法字符
    if (!this.ALLOWED_CHARS.test(basename)) {
      return { valid: false, error: "文件名包含非法字符" };
    }

    // 6. 检查路径深度（防止无限深层）
    var relative = path.relative(baseDir, resolved);
    var depth = relative.split(path.sep).length;
    if (depth > 10) {
      return { valid: false, error: "路径深度超出限制" };
    }

    return { valid: true, path: resolved, relative: relative };
  },

  // 安全化文件名（移除危险字符）
  sanitizeFilename: function (filename) {
    if (typeof filename !== "string") return "unnamed";

    // 移除路径分隔符
    var safe = filename.replace(/[\\\\\\/]/g, "_");

    // 移除控制字符
    safe = safe.replace(/[\\x00-\\x1f\\x7f]/g, "");

    // 移除前导点和空格
    safe = safe.replace(/^[\\.\\s]+/, "");

    // 截断到最大长度
    var maxLen = 255;
    if (safe.length > maxLen) {
      var ext = path.extname(safe);
      var name = safe.substring(0, maxLen - ext.length) + ext;
      safe = name;
    }

    // 如果为空，使用默认名称
    if (!safe) {
      safe = "unnamed";
    }

    return safe;
  },
};

// 测试路径遍历攻击
var pathTests = [
  { input: "photo.jpg", desc: "正常文件路径" },
  { input: "../../etc/passwd", desc: "路径遍历（../）" },
  { input: "../../../.env", desc: "访问隐藏文件" },
  { input: "./././photo.jpg", desc: "冗余路径" },
  { input: "subdir/photo.jpg", desc: "子目录中的文件" },
  { input: "../../etc/shadow%00.jpg", desc: "空字节注入" },
  { input: "..\\..\\windows\\system32", desc: "Windows 路径遍历" },
  { input: "report.pdf", desc: "正常 PDF 文件" },
];

console.log("路径安全化测试:");
pathTests.forEach(function (test) {
  var result = PathSanitizer.sanitize(test.input);
  var status = result.valid ? "✅ 安全" : "🚫 阻止";
  console.log(status + " [" + test.desc + "]");
  console.log("  输入: " + test.input);
  if (result.valid) {
    console.log("  输出: " + result.path);
  } else {
    console.log("  原因: " + result.error);
  }
});

// 文件名安全化测试
console.log("\\n文件名安全化:");
var filenameTests = [
  "../../../malicious.sh",
  "normal-file.txt",
  ".hidden-file",
  "file<script>.js",
  "file with spaces.pdf",
  "a".repeat(300) + ".txt",
  "",
  "null\\x00char.txt",
];

filenameTests.forEach(function (filename) {
  var safe = PathSanitizer.sanitizeFilename(filename);
  console.log("  '" + filename + "' → '" + safe + "'");
});

// ---- 3. 字符串脱敏工具 ----
console.log("\\n========== 3. 字符串脱敏工具 ==========");

var StringSanitizer = {
  // 移除控制字符
  removeControlChars: function (str) {
    if (typeof str !== "string") return "";
    return str.replace(/[\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]/g, "");
  },

  // 限制长度
  truncate: function (str, maxLength) {
    if (typeof str !== "string") return "";
    maxLength = maxLength || 1000;
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength);
  },

  // 移除多余空白
  normalizeWhitespace: function (str) {
    if (typeof str !== "string") return "";
    return str.replace(/\\s+/g, " ").trim();
  },

  // 只保留字母数字和基本标点
  alphanumericOnly: function (str, allowSpaces) {
    if (typeof str !== "string") return "";
    var pattern = allowSpaces ? /[^a-zA-Z0-9\\s]/g : /[^a-zA-Z0-9]/g;
    return str.replace(pattern, "");
  },

  // 正则注入防护：转义正则特殊字符
  escapeRegex: function (str) {
    if (typeof str !== "string") return "";
    var escapeRegExp = new RegExp("[.*+?^\${}()|[\\]\\\\]", "g");
    return str.replace(escapeRegExp, "\\$&");
  },
};

// 测试字符串脱敏
var stringTests = [
  { input: "Hello\\x00World\\x01", desc: "含控制字符" },
  { input: "  太多      空格    ", desc: "多余空白" },
  { input: "admin' OR '1'='1", desc: "SQL 注入尝试" },
  { input: "<script>alert(1)</script>", desc: "XSS 脚本" },
  { input: "a".repeat(2000), desc: "超长字符串" },
  { input: "Normal Text 123", desc: "正常文本" },
];

console.log("字符串脱敏演示:");
stringTests.forEach(function (test) {
  console.log("\\n[" + test.desc + "]");
  console.log("  原始: " + test.input.substring(0, 50) + (test.input.length > 50 ? "..." : ""));
  console.log("  去控制字符: " + StringSanitizer.removeControlChars(test.input).substring(0, 50));
  console.log("  标准化空白: " + StringSanitizer.normalizeWhitespace(test.input).substring(0, 50));
  console.log("  仅字母数字: " + StringSanitizer.alphanumericOnly(test.input, true).substring(0, 50));
  console.log("  截断(100): " + StringSanitizer.truncate(test.input, 100).substring(0, 50));
});

// ---- 4. ReDoS 防护 ----
console.log("\\n========== 4. 正则拒绝服务（ReDoS）防护 ==========");

var RegexSafety = {
  // 危险正则模式检测
  DANGEROUS_PATTERNS: [
    /\\(.\\+\\)\\+/,
    /\\(.\\*\\)\\+/,
    /\\(.\\+\\)\\*/,
    /\\(.\\|.+\\)\\+/,
  ],

  // 检查正则是否危险
  isDangerous: function (regexStr) {
    for (var i = 0; i < this.DANGEROUS_PATTERNS.length; i++) {
      if (this.DANGEROUS_PATTERNS[i].test(regexStr)) {
        return true;
      }
    }
    return false;
  },

  // 安全的正则执行（带输入长度限制）
  safeTest: function (regex, input, maxLength) {
    maxLength = maxLength || 1000;

    if (typeof input !== "string") {
      return false;
    }

    // 限制输入长度
    if (input.length > maxLength) {
      return false;
    }

    try {
      return regex.test(input);
    } catch (e) {
      return false;
    }
  },

  // 检查危险正则
  checkPattern: function (pattern) {
    var dangerous = this.isDangerous(pattern);
    var result = {
      pattern: pattern,
      dangerous: dangerous,
    };

    if (dangerous) {
      result.warning = "⚠️  此正则包含嵌套量词，可能导致 ReDoS 攻击";
    }

    return result;
  },
};

// 检查危险正则
var regexPatterns = [
  { pattern: "(a+)+$", desc: "嵌套量词（危险）" },
  { pattern: "([a-zA-Z]+)*$", desc: "字符类嵌套量词（危险）" },
  { pattern: "(a|aa)+$", desc: "重叠选择（危险）" },
  { pattern: "^[a-zA-Z0-9_]+$", desc: "简单字符类（安全）" },
  { pattern: "^\\d{4}-\\d{2}-\\d{2}$", desc: "日期格式（安全）" },
  { pattern: "(a|b|c)+$", desc: "不重叠选择（检查）" },
];

console.log("正则表达式安全性检查:");
regexPatterns.forEach(function (item) {
  var result = RegexSafety.checkPattern(item.pattern);
  var status = result.dangerous ? "🚫 危险" : "✅ 安全";
  console.log(status + " [" + item.desc + "]");
  console.log("  正则: " + item.pattern);
  if (result.warning) {
    console.log("  " + result.warning);
  }
});

// ---- 5. 综合输入过滤器 ----
console.log("\\n========== 5. 综合输入过滤器 ==========");

var InputFilter = {
  // 过滤用户输入（根据字段类型）
  filter: function (input, rules) {
    var result = {};
    var errors = [];

    for (var field in rules) {
      var rule = rules[field];
      var value = input[field];

      // 必填检查
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(field + " 是必填字段");
        continue;
      }

      if (value === undefined || value === null) {
        result[field] = rule.defaultValue || null;
        continue;
      }

      // 类型转换
      var filtered = String(value);

      // 长度限制
      if (rule.maxLength && filtered.length > rule.maxLength) {
        filtered = filtered.slice(0, rule.maxLength);
      }

      // 根据类型过滤
      switch (rule.type) {
        case "text":
          filtered = StringSanitizer.removeControlChars(filtered);
          filtered = StringSanitizer.normalizeWhitespace(filtered);
          break;

        case "html":
          filtered = HtmlEncoder.encode(filtered);
          break;

        case "alphanumeric":
          filtered = StringSanitizer.alphanumericOnly(filtered, rule.allowSpaces);
          break;

        case "email":
          filtered = filtered.trim().toLowerCase();
          if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(filtered)) {
            errors.push(field + " 格式不正确");
          }
          break;

        case "integer":
          var num = parseInt(filtered, 10);
          if (isNaN(num)) {
            errors.push(field + " 必须是数字");
          } else {
            if (rule.min !== undefined && num < rule.min) {
              errors.push(field + " 不能小于 " + rule.min);
            }
            if (rule.max !== undefined && num > rule.max) {
              errors.push(field + " 不能大于 " + rule.max);
            }
            filtered = num;
          }
          break;

        case "url":
          try {
            var parsed = new URL(filtered);
            if (rule.allowedProtocols && !rule.allowedProtocols.includes(parsed.protocol.replace(":", ""))) {
              errors.push(field + " 使用了不允许的协议");
            }
            filtered = parsed.href;
          } catch (e) {
            errors.push(field + " 不是有效的 URL");
          }
          break;

        default:
          // 默认进行基本过滤
          filtered = StringSanitizer.removeControlChars(filtered);
      }

      result[field] = filtered;
    }

    return {
      valid: errors.length === 0,
      data: result,
      errors: errors,
    };
  },
};

// 定义过滤规则
var userProfileRules = {
  username: { type: "alphanumeric", required: true, maxLength: 20, allowSpaces: false },
  displayName: { type: "text", required: true, maxLength: 50 },
  bio: { type: "html", maxLength: 500 },
  email: { type: "email", required: true },
  age: { type: "integer", min: 1, max: 150 },
  website: { type: "url", allowedProtocols: ["http", "https"] },
};

// 测试输入
var testInputs = [
  {
    desc: "正常输入",
    data: {
      username: "john_doe",
      displayName: "John Doe",
      bio: "Hello <b>World</b>",
      email: "john@example.com",
      age: "30",
      website: "https://johndoe.com",
    },
  },
  {
    desc: "恶意输入",
    data: {
      username: "admin<script>",
      displayName: "Hacker\\x00",
      bio: '<script>alert("xss")</script>',
      email: "not-an-email",
      age: "999",
      website: "javascript:alert(1)",
    },
  },
  {
    desc: "超长输入",
    data: {
      username: "a".repeat(100),
      displayName: "b".repeat(200),
      bio: "c".repeat(2000),
      email: "test@test.com",
      age: "25",
      website: "https://example.com",
    },
  },
];

console.log("综合输入过滤演示:");
testInputs.forEach(function (test) {
  console.log("\\n--- " + test.desc + " ---");
  var result = InputFilter.filter(test.data, userProfileRules);

  if (result.valid) {
    console.log("✅ 过滤通过");
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log("❌ 过滤失败");
    result.errors.forEach(function (err) {
      console.log("  - " + err);
    });
  }
});

// ---- 6. 输入过滤最佳实践总结 ----
console.log("\\n========== 6. 输入过滤最佳实践总结 ==========");

var sanitizeBestPractices = [
  { 实践: "白名单验证", 说明: "定义允许的输入模式，而非列举危险模式" },
  { 实践: "分层过滤", 说明: "类型检查 → 格式验证 → 长度限制 → 内容过滤 → 输出编码" },
  { 实践: "HTML 编码顺序", 说明: "先编码 & 符号，再编码尖括号、引号、斜杠" },
  { 实践: "参数化查询", 说明: "使用占位符而非字符串拼接构造 SQL" },
  { 实践: "路径规范化", 说明: "使用 path.resolve + 基础目录验证防止路径遍历" },
  { 实践: "ReDoS 防护", 说明: "避免嵌套量词，限制输入长度，设置匹配超时" },
  { 实践: "长度限制", 说明: "所有输入字段都应有合理的长度上限" },
  { 实践: "编码上下文", 说明: "根据输出上下文（HTML/JS/URL/CSS）选择正确的编码方式" },
];

console.table(sanitizeBestPractices);

console.log("\\n===== 输入过滤与防注入演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["认证与安全"];