// =============================================================
// HTTP 通信教程 —— 第三批章节
// -------------------------------------------------------------
// HTTPS 与安全（10-14章）
//   第 10 章：HTTPS 是什么？——TLS/SSL 基础
//   第 11 章：TLS 握手过程详解
//   第 12 章：数字证书与 PKI 体系
//   第 13 章：HTTP 安全头（CSP、HSTS、X-Frame-Options 等）
//   第 14 章：CORS 跨域资源共享
// =============================================================

export const chapters = [
  // ============================================================
  // 第十章：HTTPS 是什么？——TLS/SSL 基础
  // ============================================================
  {
    id: "http-10",
    group: "HTTPS 与安全",
    icon: "🔒",
    title: "HTTPS 是什么？——TLS/SSL 基础",
    content: `## 一、为什么 HTTP 需要加密

你打开浏览器访问 \`http://example.com\`，输入的网址、提交的表单、返回的页面，全部都是**明文**传输。这意味着在数据从你的电脑到服务器之间的任何一段路径上，数据都可以被看到、被篡改、被伪造。HTTP 不安全，根源就在"明文"两个字。

具体来说，明文 HTTP 存在**三大安全缺陷**：

### 1.1 窃听风险（无机密性）

HTTP 报文在网络上是一段段明文传输的。你经过的每一个路由器、每一个 Wi-Fi 接入点、每一个运营商的网关，都能完整看到你的请求内容。

\`\`\`
[ 你的电脑 ] --"密码是 123456"--> [ 路由器 ] --> [ 运营商 ] --> [ 服务器 ]
                    ↑                ↑             ↑
                 都能看到明文       都能看到       都能看到
\`\`\`

最经典的场景：你在咖啡厅连了免费 Wi-Fi，登录了一个 HTTP 网站，输入了账号密码。咖啡厅的路由器（或黑客伪造的热点）能完整记录下你的密码。这就是为什么早期互联网"账号被盗"如此频繁——根本不用黑客攻破服务器，在路边架个 Wi-Fi 就行。

### 1.2 篡改风险（无完整性）

HTTP 没有任何机制保证数据在传输过程中不被修改。运营商、路由器、中间人都可以悄悄修改 HTTP 响应的内容。

\`\`\`
[ 服务器 ] --"<html>正常页面</html>"--> [ 中间人 ] --"<html>加了广告的页面</html>"--> [ 你的电脑 ]
\`\`\`

早年国内运营商的"网页劫持"就是这么干的：你访问一个正常网站，运营商在响应里注入一段 JS，弹个广告，或者跳转到合作页面。用户以为是网站自己加的，其实是中间链路篡改的。HTTP 没有任何校验机制发现这种篡改。

### 1.3 伪造风险（无身份认证）

HTTP 没有任何身份认证机制。你访问 \`http://bank.com\`，你怎么确定对面真的是银行的服务器，而不是黑客伪造的？

\`\`\`
[ 你的电脑 ] --"访问 bank.com"--> [ 黑客伪造的服务器 ]  ← 你以为这是银行
\'\'\'
[ 你的电脑 ] --"访问 bank.com"--> [ 真正的银行服务器 ]  ← 你以为访问的是这里
\`\`\`

DNS 劫持、HOST 篡改、ARP 欺骗都能让你"以为访问的是 A，实际连到的是 B"。HTTP 完全无法分辨真伪。

### 1.4 三大缺陷对应三大安全目标

| HTTP 缺陷 | 安全目标 | 解决手段 |
|-----------|---------|---------|
| 窃听（无机密性） | 机密性 Confidentiality | 加密 |
| 篡改（无完整性） | 完整性 Integrity | 摘要/签名 |
| 伪造（无认证） | 身份认证 Authentication | 数字证书 |

HTTPS 这三个特性，正好一一对应这三大安全目标。**HTTPS = HTTP + TLS**，TLS 协议就是用来补上 HTTP 这三大漏洞的。

---

## 二、HTTPS = HTTP + TLS

### 2.1 TLS 在协议栈中的位置

TLS（Transport Layer Security，传输层安全）协议运行在传输层（TCP）之上、应用层（HTTP）之下。可以理解为：**HTTP 把数据交给 TLS 加密，TLS 再交给 TCP 传输**。

\`\`\`
┌───────────────────────────────────────────┐
│  应用层    HTTP 报文（明文）                │
├───────────────────────────────────────────┤
│  安全层    TLS 加密 / 解密 / 认证           │  ← HTTPS 多出来的就是这层
├───────────────────────────────────────────┤
│  传输层    TCP 可靠传输                     │
├───────────────────────────────────────────┤
│  网络层    IP 路由                          │
└───────────────────────────────────────────┘
\`\`\`

所以从代码层面看，HTTPS 和 HTTP 几乎一样——都是发 HTTP 报文，只是 HTTP 报文在下发到 TCP 之前，先经过 TLS 加了一层"加密套壳"。服务器收到的也是加密数据，先由 TLS 解密，再交给 HTTP 解析。

### 2.2 SSL 与 TLS 的关系

很多人混用 SSL 和 HTTPS 这两个词，其实它们是同一段历史的两个名字：

- **SSL（Secure Sockets Layer）** 是网景公司 1995 年推出的协议，经历了 SSL 1.0（未发布）、2.0、3.0。
- **TLS（Transport Layer Security）** 是 1999 年 IETF 接管后改的名字，TLS 1.0 ≈ SSL 3.1。

演进历程：SSL 2.0 → SSL 3.0 → TLS 1.0 → TLS 1.1 → TLS 1.2 → TLS 1.3。

由于历史习惯，很多人仍把 HTTPS 里的加密层叫"SSL"，配置文件里也常出现 \`ssl_\` 开头的指令（如 Nginx 的 \`ssl_certificate\`），但**现代浏览器实际用的都是 TLS**。SSL 3.0 及以下早已因安全漏洞（POODLE 等）被废弃。

### 2.3 端口的区别

| 协议 | 默认端口 | 备注 |
|------|---------|------|
| HTTP | 80 | 明文 |
| HTTPS | 443 | 加密 |

同一个服务器可以同时监听 80 和 443，用 80 跳转到 443 是常见做法（HSTS 强制跳转）。

---

## 三、加密的基础：对称加密与非对称加密

TLS 同时用到了两种加密方式，理解它们的区别是理解 TLS 的前提。

### 3.1 对称加密（Symmetric Encryption）

**对称加密**：加密和解密用**同一个密钥**。

\`\`\`
加密：明文 + 密钥K --> 密文
解密：密文 + 密钥K --> 明文
\`\`\`

就像你用一把钥匙锁上门，再用同一把钥匙开门。双方必须事先共享同一个密钥。

常见算法：**AES**（Advanced Encryption Standard，目前最主流）、ChaCha20、3DES（已淘汰）、RC4（已淘汰）。

优点：**速度快**，适合加密大量数据。AES 加密 1GB 数据只需几百毫秒。

缺点：**密钥分发难题**——双方怎么安全地把同一个密钥传给对方？如果明文传，会被窃听；如果用另一个密钥加密传，又陷入"鸡生蛋"问题。

### 3.2 非对称加密（Asymmetric Encryption）

**非对称加密**：每个参与者有一对密钥——**公钥（Public Key）** 和 **私钥（Private Key）**。公钥可以公开给任何人，私钥必须自己保密。

\`\`\`
公钥加密 --> 只能用对应的私钥解密    （用于加密通信）
私钥签名 --> 只能用对应的公钥验证    （用于数字签名）
\`\`\`

数学原理：基于一些"正向容易、逆向极难"的数学难题，比如大数分解（RSA）、椭圆曲线离散对数（ECC）。

常见算法：**RSA**（Rivest-Shamir-Adleman，最经典）、**ECC**（Elliptic Curve Cryptography，更高效）、DSA。

优点：**解决了密钥分发难题**。你把公钥贴在网上给所有人看，任何人都能用你的公钥加密发给你，只有你能用私钥解密。不用事先共享密钥。

缺点：**速度极慢**。RSA 加密 1GB 数据要好几秒甚至更久，比 AES 慢 100 倍以上。而且加密的数据长度受密钥长度限制（RSA-2048 最多加密 245 字节）。

### 3.3 两者对比

| 维度 | 对称加密（AES） | 非对称加密（RSA） |
|------|---------------|-----------------|
| 密钥 | 加密解密同一个密钥 | 公钥加密，私钥解密 |
| 速度 | 极快 | 极慢（约慢 100 倍） |
| 适合 | 大量数据加密 | 小量数据、密钥交换、签名 |
| 密钥分发 | 困难（要先安全传密钥） | 简单（公钥可公开） |
| 典型算法 | AES-256、ChaCha20 | RSA-2048、ECC-P256 |

### 3.4 TLS 的混合加密策略

既然对称加密快但有密钥分发难题，非对称加密解决了分发难题但太慢，**TLS 把两者结合起来**：

1. **先用非对称加密安全地协商出一个对称密钥**（解决密钥分发难题）。
2. **后续通信用这个对称密钥加密**（解决速度问题）。

这就是 TLS 握手的核心目的——**安全地协商出双方共享的对称密钥**，之后的应用数据全部用对称加密。非对称加密只在握手时用一次，开销可以接受。

---

## 四、TLS 加密的具体细节

### 4.1 对称加密的两种模式

AES 算法本身是"块加密"——一次加密一个固定大小的块（AES 是 128 位 = 16 字节）。但实际数据可能远超 16 字节，怎么把多块拼起来？这就是"模式"。

- **ECB（Electronic Codebook）**：每块独立加密，相同明文块产生相同密文块。**不安全**（会泄露模式，比如加密一张图，密文还能看出轮廓）。绝不能用。
- **CBC（Cipher Block Chaining）**：每块加密前先和前一块的密文异或。需要初始化向量（IV）。曾是主流，但易受 BEAST、Lucky13 攻击。
- **GCM（Galois/Counter Mode）**：计数器模式 + 认证标签。**既能加密又能校验完整性**，是现代首选（TLS 1.2/1.3 主流）。

### 4.2 为什么需要初始化向量（IV）

如果每次都用同一个密钥加密，相同的明文会产生相同的密文，攻击者能通过统计推断。IV 是一段随机数据，和密钥一起参与加密，让"相同明文 + 相同密钥 + 不同 IV = 不同密文"。IV 不需要保密，可以明文传输，但每次要随机。

### 4.3 完整性校验：MAC 与 AEAD

光加密不够——攻击者虽然看不懂密文，但可以乱改密文，让解密出乱码。怎么知道数据被改了？需要**完整性校验**。

- **MAC（Message Authentication Code）**：用密钥对数据算一个摘要，附在数据后面。接收方用同样密钥算一遍对比。TLS 1.2 早期用"先加密后算MAC"（MAC-then-Encrypt），后来改成更安全的"先算MAC后加密"。
- **AEAD（Authenticated Encryption with Associated Data）**：加密和认证一体化，一次操作同时完成加密和完整性校验。AES-GCM 就是 AEAD。TLS 1.3 强制只用 AEAD。

---

## 五、本章代码演示

下面的代码用 Node.js 的 \`crypto\` 模块演示两件事：

1. **对称加密（AES-256-GCM）**：用一个密钥加密明文，再用同一个密钥解密。观察加解密过程和认证标签。
2. **非对称加密（RSA）**：生成一对公私钥，用公钥加密、私钥解密。体会非对称加密的特点。

这两段代码会帮你直观理解 TLS 握手后"用对称密钥加密数据"以及握手时"用非对称密钥交换密钥"的底层机制。`,
    code: `// ============================================================
// 第十章代码演示：对称加密与非对称加密
// ------------------------------------------------------------
// 用 crypto 模块演示：
//   1. AES-256-GCM 对称加密（TLS 传输数据用的就是这种方式）
//   2. RSA 非对称加密（TLS 握手时密钥交换/签名用的就是这种方式）
// ============================================================
const crypto = require('crypto');

console.log('========== 第一部分：对称加密 AES-256-GCM ==========');
console.log('');

// ---- 1. 对称加密：加密解密用同一个密钥 ----
// AES-256-GCM 是 TLS 1.2/1.3 最主流的对称加密套件
// 256 表示密钥长度 256 位（32 字节），GCM 是一种 AEAD 模式

// 模拟双方共享的对称密钥（真实场景由 TLS 握手协商出来）
const symmetricKey = crypto.randomBytes(32); // 32 字节 = 256 位密钥
console.log('[对称密钥] ' + symmetricKey.toString('hex'));
console.log('  ^^^ 这个密钥加密解密都用它，必须双方共享且保密');

// GCM 模式需要初始化向量（IV），每次加密都要随机生成
// GCM 的 IV 通常 12 字节（96 位），不需要保密但要随机
const iv = crypto.randomBytes(12);
console.log('[IV 初始化向量] ' + iv.toString('hex'));
console.log('  ^^^ IV 不用保密，但每次必须随机，防止相同明文产生相同密文');

// 要加密的明文（模拟 HTTP 请求体）
const plaintext = 'POST /login HTTP/1.1\\r\\nHost: bank.com\\r\\n\\r\\nusername=admin&password=123456';
console.log('[明文] ' + plaintext);
console.log('  ^^^ 这是 HTTP 报文，明文传输会被窃听');

// 加密
const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
const encrypted = Buffer.concat([
  cipher.update(plaintext, 'utf8'),
  cipher.final(),
]);
// GCM 模式会生成一个认证标签（auth tag），用于校验完整性
const authTag = cipher.getAuthTag();
console.log('[密文] ' + encrypted.toString('hex'));
console.log('[认证标签] ' + authTag.toString('hex'));
console.log('  ^^^ authTag 用于校验密文没被篡改，这就是 AEAD 的完整性保证');

console.log('');

// 解密（接收方用同样的密钥和 IV）
const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
decipher.setAuthTag(authTag); // 设置认证标签，解密时会校验
const decrypted = Buffer.concat([
  decipher.update(encrypted),
  decipher.final(),
]);
console.log('[解密结果] ' + decrypted.toString('utf8'));
console.log('  ^^^ 用同一个密钥成功还原明文');

// 演示篡改检测：如果密文被改了一位，解密会抛异常
console.log('');
console.log('--- 模拟中间人篡改密文 ---');
const tampered = Buffer.from(encrypted);
tampered[0] = tampered[0] ^ 0xff; // 翻转第一个字节
try {
  const badDecipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
  badDecipher.setAuthTag(authTag);
  badDecipher.update(tampered);
  badDecipher.final();
  console.log('解密成功（不应该到这里）');
} catch (e) {
  console.log('检测到篡改！解密失败：' + e.message);
  console.log('  ^^^ 这就是 GCM 的完整性保护：密文被改过就解不出来');
}

console.log('');
console.log('========== 第二部分：非对称加密 RSA ==========');
console.log('');

// ---- 2. 非对称加密：公钥加密，私钥解密 ----
// 生成一对 RSA 密钥（公钥 + 私钥）
// modulusLength 越大越安全但越慢，2048 是目前最低安全要求
console.log('正在生成 RSA-2048 密钥对...');
const start = Date.now();
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
console.log('生成耗时：' + (Date.now() - start) + 'ms');
console.log('');

// 导出公钥和私钥的 PEM 格式（文本形式）
const pubPem = publicKey.export({ type: 'spki', format: 'pem' });
const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
console.log('[公钥 PEM]（可以公开给任何人）');
console.log(pubPem.split('\\n').slice(0, 2).join('\\n') + '\\n  ...（共 ' + pubPem.split('\\n').length + ' 行）');
console.log('[私钥 PEM]（必须自己保密，泄露等于身份被盗）');
console.log(privPem.split('\\n').slice(0, 2).join('\\n') + '\\n  ...（共 ' + privPem.split('\\n').length + ' 行）');
console.log('');

// 用公钥加密一段小数据（模拟用对方公钥加密对称密钥）
const secret = '这是要加密的秘密数据';
console.log('[待加密明文] ' + secret);
const encryptedSecret = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // 推荐用 OAEP 填充
  },
  Buffer.from(secret, 'utf8')
);
console.log('[公钥加密后的密文] ' + encryptedSecret.toString('hex'));
console.log('  ^^^ 只有持有私钥的人才能解密');

// 用私钥解密
const decryptedSecret = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  },
  encryptedSecret
);
console.log('[私钥解密结果] ' + decryptedSecret.toString('utf8'));
console.log('');

// ---- 3. 对比两种加密的特点 ----
console.log('========== 两种加密方式对比 ==========');
console.log('');

// 速度对比：加密 1MB 数据
const bigData = crypto.randomBytes(1024 * 1024); // 1MB

// 对称加密 1MB
const aesIv = crypto.randomBytes(12);
const t1 = Date.now();
const aesCipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, aesIv);
aesCipher.update(bigData);
aesCipher.final();
const aesTime = Date.now() - t1;

// 非对称加密只能加密小数据，RSA-2048 用 OAEP 填充最多约 214 字节
// 这里加密 190 字节做对比（安全的上限内）
const smallData = crypto.randomBytes(190);
const t2 = Date.now();
crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, smallData);
const rsaTime = Date.now() - t2;

console.log('AES-256-GCM 加密 1MB 数据耗时：' + aesTime + 'ms');
console.log('RSA-2048    加密 190 字节耗时：' + rsaTime + 'ms');
console.log('');
console.log('结论：');
console.log('  1. 对称加密极快，适合加密大量数据（HTTP 报文）');
console.log('  2. 非对称加密很慢，且只能加密小数据，适合加密密钥/签名');
console.log('  3. TLS 的策略：握手用非对称加密协商对称密钥，');
console.log('     之后通信用对称密钥加密大量数据 —— 两全其美');
`
  },

  // ============================================================
  // 第十一章：TLS 握手过程详解
  // ============================================================
  {
    id: "http-11",
    group: "HTTPS 与安全",
    icon: "🤝",
    title: "TLS 握手过程详解",
    content: `## 一、TLS 握手要解决什么问题

上一章我们知道，HTTPS 用"非对称加密协商对称密钥，再用对称密钥加密数据"的策略。那么**TLS 握手**就是双方"协商出对称密钥"这个过程。听起来简单，但要安全地做到这件事，至少要解决四个问题：

1. **协商参数**：双方要就使用哪种加密算法、哪种密钥交换方式、哪种签名算法达成一致。客户端支持 20 种算法，服务器支持 15 种，要选出双方都支持且最安全的组合。
2. **身份认证**：客户端要确认对面真的是它声称的服务器（通过数字证书），防止中间人冒充。
3. **密钥交换**：双方要在全程可能被窃听的情况下，安全地协商出一个只有双方知道的对称密钥。
4. **完整性校验**：握手过程本身不能被篡改，最后要验证整个握手没被中间人动过。

TLS 握手就是把这四件事在几个 RTT（往返时间）内完成。RTT 越少，延迟越低，体验越好。TLS 版本的演进，很大程度就是在"减少 RTT"上做文章。

---

## 二、TLS 1.2 握手过程（2-RTT）

TLS 1.2 是目前仍广泛部署的版本，握手需要 2 个 RTT（往返）才能开始传输应用数据。整个过程如下：

\`\`\`
客户端                                                 服务器
  |                                                      |
  | --- 1. ClientHello ------------------------------->  |  }
  |     (支持的密码套件、TLS版本、随机数ClientRandom)      |  } RTT 1
  |                                                      |
  | <--- 2. ServerHello --------------------------------  |
  |     (选定的密码套件、服务器随机数ServerRandom)         |
  | <--- 3. Certificate -------------------------------- |
  |     (服务器证书，含公钥)                              |
  | <--- 4. ServerKeyExchange -------------------------- |
  |     (DH/ECDH 参数，用私钥签名)                        |
  | <--- 5. ServerHelloDone ---------------------------- |  }
  |                                                      |
  | --- 6. ClientKeyExchange ------------------------->  |  } RTT 2
  |     (用服务器公钥加密的预主密钥 / ECDH公钥)            |
  | --- 7. ChangeCipherSpec -------------------------->  |
  |     (通知：接下来我用加密通信了)                      |
  | --- 8. Finished ---------------------------------->  |
  |     (握手摘要，用协商出的密钥加密)                     |
  |                                                      |
  | <--- 9. ChangeCipherSpec --------------------------  |  }
  | <--- 10. Finished ---------------------------------  |  }
  |                                                      |
  | ===== 11. 应用数据（对称加密）=====================>  |  可以传输了
\`\`\`

### 2.1 各步骤详解

**1. ClientHello（客户端问候）**

客户端发起连接，发送：
- 支持的 TLS 版本（如 1.2）
- 支持的密码套件列表（按优先级排序，如 \`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384\`）
- 客户端随机数（Client Random，32 字节）—— 用于后续生成主密钥
- Session ID（用于会话恢复）
- SNI（Server Name Indication）—— 告诉服务器要访问哪个域名，让一个 IP 上多个证书能选对

**2. ServerHello（服务器问候）**

服务器回应：
- 选定的 TLS 版本（取客户端和服务器都支持的最高版本）
- 选定的密码套件（从客户端列表里选一个服务器也支持的）
- 服务器随机数（Server Random，32 字节）
- Session ID

**3. Certificate（证书）**

服务器发送自己的数字证书（X.509 格式），证书里包含服务器的公钥和身份信息（域名、有效期、颁发者等）。客户端会用本地信任的 CA 根证书验证这个证书是否可信。

**4. ServerKeyExchange（服务器密钥交换）**

如果选用了 ECDHE/DHE 这种"前向保密"的密钥交换方式，服务器在这里发送额外的参数（ECDH 公钥）。如果是 RSA 密钥交换（已不推荐），这步可省略。服务器用自己的私钥对这些参数签名，防止中间人篡改。

**5. ServerHelloDone**

服务器通知客户端："我这边 Hello 阶段发完了"。

**6. ClientKeyExchange（客户端密钥交换）**

客户端发送密钥交换材料：
- RSA 模式：生成预主密钥（Pre-Master Secret），用服务器证书里的公钥加密后发送。
- ECDHE 模式：发送客户端的 ECDH 公钥。

至此双方都有了：Client Random + Server Random + Pre-Master Secret，三方材料计算出相同的主密钥（Master Secret），再派生出对称加密密钥。

**7-8. ChangeCipherSpec + Finished（客户端）**

客户端通知"我接下来要用协商好的密钥加密了"，然后发送 Finished 消息——这是用新密钥加密的**整个握手过程的摘要**。服务器解密并校验这个摘要，如果一致说明握手没被篡改。

**9-10. ChangeCipherSpec + Finished（服务器）**

服务器同样通知"我也要加密了"，并发送自己的 Finished。客户端同样校验。

**11. 应用数据**

握手完成，双方开始用对称密钥加密传输 HTTP 报文。

### 2.2 主密钥的生成

\`\`\`
主密钥 Master Secret = PRF(Pre-Master Secret, "master secret",
                           ClientRandom + ServerRandom)
加密密钥 = PRF(Master Secret, "key expansion", ...)
\`\`\`

PRF（伪随机函数）把三个材料揉成一段确定性的随机密钥。因为 ClientRandom 和 ServerRandom 每次连接都不同，所以每次连接的密钥都不同。

---

## 三、TLS 1.3 握手过程（1-RTT）

TLS 1.2 的 2-RTT 在移动网络下延迟明显。TLS 1.3 大幅简化握手，**默认只需 1-RTT** 就能开始传输数据。

\`\`\`
客户端                                                 服务器
  |                                                      |
  | --- 1. ClientHello ------------------------------->  |
  |     (密码套件 + ClientRandom + 客户端ECDH公钥)         |  } RTT 1
  |     (key_share 扩展，提前带上密钥交换材料)             |
  |                                                      |
  | <--- 2. ServerHello --------------------------------  |
  |     (选定的套件 + ServerRandom + 服务器ECDH公钥)       |
  | <--- 3. {EncryptedExtensions} ---------------------  |
  | <--- 4. {Certificate} ------------------------------ |
  | <--- 5. {CertificateVerify} ------------------------ |  }
  | <--- 6. {Finished} -------------------------------- |
  |                                                      |
  | --- 7. {Finished} --------------------------------> |
  |                                                      |
  | ===== 8. 应用数据 ================================>  |  可以传输了
\`\`\`

### 3.1 TLS 1.3 的关键改进

1. **密钥交换提前**：ClientHello 直接带上 ECDH 公钥（key_share 扩展），服务器收到后立刻能用 ECDH 算出共享密钥。不用等 ServerHelloDone 再来回一轮。

2. **握手加密**：TLS 1.2 的 ServerHello 之后的消息大部分是明文，TLS 1.3 从 ServerHello 之后几乎所有消息都加密了，连证书都是加密传输的，**中间人连服务器证书都看不到**，隐私性大幅提升。

3. **废弃不安全算法**：TLS 1.3 砍掉了 RSA 密钥交换、静态 DH、CBC 模式、RC4、MD5、SHA1 等一堆不安全的东西。只保留 AEAD 加密（AES-GCM、ChaCha20-Poly1305）和 ECDHE 密钥交换。

4. **强制前向保密**：TLS 1.3 只用 ECDHE/DHE 这种临时密钥交换，每次连接的密钥都是临时的。即使服务器私钥日后泄露，**之前录制的加密流量也无法被解密**。这就是"前向保密"（Forward Secrecy）。

### 3.2 0-RTT 模式

TLS 1.3 还支持 0-RTT（零往返时间）模式，针对**之前连过的服务器**，可以在第一个包里就带上应用数据：

\`\`\`
客户端                                                 服务器
  |                                                      |
  | --- ClientHello + 0-RTT 应用数据 ----------------->  |  立刻发数据
  | <--- ServerHello + Finished -----------------------  |
\`\`\`

代价是 0-RTT 数据有**重放攻击风险**（攻击者可以截获重放），所以只适合幂等请求（如 GET），不能用于会改变状态的请求（如 POST 下单）。

---

## 四、密钥交换的核心：Diffie-Hellman

无论 TLS 1.2 还是 1.3，密钥交换主流都用 **ECDHE**（椭圆曲线 Diffie-Hellman 临时密钥交换）。理解 DH 是理解握手的关键。

### 4.1 DH 的奇妙之处

Diffie-Hellman 协议让双方在全程窃听的情况下，各自算出同一个共享密钥，而窃听者无法算出。原理基于离散对数难题。

\`\`\`
双方约定公开参数：p（大素数），g（生成元）

Alice                          Bob
选秘密 a                       选秘密 b
算 A = g^a mod p               算 B = g^b mod p
发送 A ---->                   <---- 发送 B

算共享密钥 s = B^a mod p       算共享密钥 s = A^b mod p

s = (g^b)^a = g^(ab) = (g^a)^b  两者相等！
\`\`\`

窃听者看到了 p、g、A、B，但要算出 s 需要知道 a 或 b，而"从 A 反推 a"是离散对数难题，几乎不可能。

### 4.2 ECDH 用椭圆曲线

ECDH 是 DH 的椭圆曲线版本，用更短的密钥达到同等安全性（256 位 ECC ≈ 3072 位 RSA）。下面代码演示 ECDH 密钥交换过程。

---

## 五、本章代码演示

下面的代码模拟 TLS 握手的关键步骤：

1. **模拟 TLS 1.2 握手流程**：用控制台输出打印每一步，并生成 ClientRandom / ServerRandom。
2. **演示 ECDH 密钥交换**：用 crypto 的 ECDH 功能，让"客户端"和"服务器"在公开交换公钥后，各自算出相同的共享密钥——这就是 TLS 握手最核心的数学魔法。
3. **用协商出的密钥加密一段数据**：模拟握手完成后用对称密钥加密应用数据。`,
    code: `// ============================================================
// 第十一章代码演示：TLS 握手过程模拟
// ------------------------------------------------------------
// 演示内容：
//   1. 打印 TLS 1.2 握手流程（ClientHello -> ... -> Finished）
//   2. 用 ECDH 演示密钥交换的核心机制
//   3. 用协商出的密钥加密应用数据
// ============================================================
const crypto = require('crypto');

console.log('====================================================');
console.log('  TLS 1.2 握手流程模拟（2-RTT）');
console.log('====================================================');
console.log('');

// ---- 1. 模拟 TLS 1.2 握手的每一步 ----
const step = (n, dir, name, detail) => {
  const arrow = dir === 'c2s' ? '--- ' + name + ' --->' : '<--- ' + name + ' ---';
  console.log('[' + n + '] ' + arrow);
  console.log('    ' + detail);
  console.log('');
};

// 客户端生成 ClientRandom（32 字节随机数）
const clientRandom = crypto.randomBytes(32);
// 服务器生成 ServerRandom（32 字节随机数）
const serverRandom = crypto.randomBytes(32);

console.log('客户端发起连接...');
step(1, 'c2s', 'ClientHello',
  'TLS版本=1.2, 支持的套件=[ECDHE-RSA-AES256-GCM-SHA384, ...]');
console.log('    ClientRandom = ' + clientRandom.toString('hex'));
console.log('    SNI = www.example.com（告诉服务器要访问哪个域名）');
console.log('');

console.log('服务器回应...');
step(2, 's2c', 'ServerHello',
  '选定套件=ECDHE-RSA-AES256-GCM-SHA384, TLS版本=1.2');
console.log('    ServerRandom = ' + serverRandom.toString('hex'));
console.log('');

step(3, 's2c', 'Certificate',
  '服务器证书（含公钥、域名、有效期、CA签名）');
step(4, 's2c', 'ServerKeyExchange',
  'ECDH参数 + 服务器ECDH公钥 + 用私钥的签名');
step(5, 's2c', 'ServerHelloDone',
  '服务器 Hello 阶段结束');
console.log('    --- 第 1 个 RTT 结束 ---');
console.log('');

console.log('====================================================');
console.log('  关键步骤：ECDH 密钥交换演示');
console.log('====================================================');
console.log('');

// ---- 2. 真正用 ECDH 交换密钥 ----
// 用 prime256v1 曲线（也叫 secp256r1 / P-256），TLS 常用曲线之一
const curveName = 'prime256v1';
console.log('使用椭圆曲线：' + curveName);
console.log('');

// 模拟客户端和服务器各自生成 ECDH 密钥对
const client = crypto.createECDH(curveName);
const server = crypto.createECDH(curveName);

client.generateKeys();
server.generateKeys();

const clientPubKey = client.getPublicKey();
const serverPubKey = server.getPublicKey();

console.log('[客户端] 生成 ECDH 密钥对');
console.log('  私钥（保密）：' + client.getPrivateKey().toString('hex'));
console.log('  公钥（公开）：' + clientPubKey.toString('hex'));
console.log('');
console.log('[服务器] 生成 ECDH 密钥对');
console.log('  私钥（保密）：' + server.getPrivateKey().toString('hex'));
console.log('  公钥（公开）：' + serverPubKey.toString('hex'));
console.log('');

console.log('--- 双方交换公钥（这一步可以被窃听，没关系）---');
console.log('客户端把公钥发给服务器');
console.log('服务器把公钥发给客户端');
console.log('');

// 各自用对方公钥 + 自己私钥 计算共享密钥
const clientSharedSecret = client.computeSecret(serverPubKey);
const serverSharedSecret = server.computeSecret(clientPubKey);

console.log('[客户端] 计算出的共享密钥：');
console.log('  ' + clientSharedSecret.toString('hex'));
console.log('[服务器] 计算出的共享密钥：');
console.log('  ' + serverSharedSecret.toString('hex'));
console.log('');

// 验证双方算出的密钥相同
const same = clientSharedSecret.equals(serverSharedSecret);
console.log('两个密钥是否相同：' + (same ? '是 ✅' : '否 ❌'));
console.log('');
console.log('神奇之处：双方从未传输过这个共享密钥，');
console.log('但各自独立算出了完全相同的值！');
console.log('窃听者即使拿到了双方的公钥，也算不出这个密钥');
console.log('（因为逆推私钥是椭圆曲线离散对数难题）');
console.log('');

console.log('====================================================');
console.log('  用共享密钥派生对称加密密钥');
console.log('====================================================');
console.log('');

// ---- 3. 模拟 TLS 的密钥派生 ----
// 真实 TLS 用 PRF/HKDF 从共享密钥 + ClientRandom + ServerRandom 派生密钥
// 这里用 HKDF 简化演示
const masterSecret = crypto.createHmac('sha256', 'master secret')
  .update(Buffer.concat([clientSharedSecret, clientRandom, serverRandom]))
  .digest();

// 派生出具体的加密密钥和 IV（实际 TLS 会派生多个密钥：客户端发送/服务器发送各一套）
const info = Buffer.from('tls13 derived', 'utf8');
const symmetricKey = crypto.createHmac('sha256', masterSecret)
  .update(info)
  .digest()
  .slice(0, 32); // 取前 32 字节作为 AES-256 的密钥

console.log('[Pre-Master Secret（共享密钥）] ' + clientSharedSecret.toString('hex').slice(0, 32) + '...');
console.log('[ClientRandom] ' + clientRandom.toString('hex'));
console.log('[ServerRandom] ' + serverRandom.toString('hex'));
console.log('[派生的主密钥] ' + masterSecret.toString('hex').slice(0, 32) + '...');
console.log('[派生的对称密钥] ' + symmetricKey.toString('hex'));
console.log('');

// ---- 4. 用派生的密钥加密应用数据（模拟握手完成后的通信）----
console.log('====================================================');
console.log('  握手完成，开始加密传输应用数据');
console.log('====================================================');
console.log('');

const appIv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, appIv);
const httpRequest = 'GET /account HTTP/1.1\\r\\nHost: www.example.com\\r\\n\\r\\n';
const encrypted = Buffer.concat([cipher.update(httpRequest, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();

console.log('[客户端发送的 HTTP 请求（明文）]');
console.log('  ' + JSON.stringify(httpRequest));
console.log('[加密后实际传输的密文]');
console.log('  ' + encrypted.toString('hex'));
console.log('[认证标签]');
console.log('  ' + tag.toString('hex'));
console.log('');

// 服务器解密
const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, appIv);
decipher.setAuthTag(tag);
const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
console.log('[服务器解密后得到的明文]');
console.log('  ' + JSON.stringify(decrypted.toString('utf8')));
console.log('');
console.log('✅ TLS 握手 + 加密通信模拟完成！');
console.log('');
console.log('总结整个流程：');
console.log('  1. ClientHello/ServerHello 协商参数，交换随机数');
console.log('  2. 服务器发证书让客户端验证身份');
console.log('  3. 双方用 ECDH 交换公钥，各自算出共享密钥');
console.log('  4. 用共享密钥 + 随机数 派生出对称密钥');
console.log('  5. 之后所有 HTTP 数据用对称密钥（AES-GCM）加密传输');
`
  },

  // ============================================================
  // 第十二章：数字证书与 PKI 体系
  // ============================================================
  {
    id: "http-12",
    group: "HTTPS 与安全",
    icon: "📜",
    title: "数字证书与 PKI 体系",
    content: `## 一、为什么需要数字证书

上一章讲 TLS 握手时，服务器会发一个"证书"给客户端。这个证书是干什么的？解决的是**身份认证**问题——让客户端确认"对面真的是 www.example.com，不是冒充的"。

光有加密还不够。假设你连上一个 Wi-Fi，DNS 被劫持，\`www.bank.com\` 解析到了黑客的 IP。黑客也用了 TLS，也和你完成了密钥交换，你以为是和银行在加密通信，实际上密钥是和黑客共享的——加密了但加密给错了人。这就是**中间人攻击**（MITM）。

\`\`\`
[ 你的电脑 ] <--TLS--> [ 黑客 ] <--TLS--> [ 真正的银行 ]
              你以为在跟银行通信    黑客在和银行通信
              密钥是和黑客共享的    密钥是和银行共享的
\`\`\`

怎么防止？**数字证书 + CA 信任链**。银行把公钥放在证书里，证书由一个你信任的权威机构（CA）签名。黑客无法伪造 CA 的签名，所以无法伪造银行的身份。

---

## 二、数字证书是什么

数字证书（Digital Certificate）本质上是**一段被签名了的身份信息**，核心内容是"公钥 + 身份 + 颁发者签名"。格式通常是 X.509。

### 2.1 证书包含的关键信息

| 字段 | 说明 | 示例 |
|------|------|------|
| 版本 | X.509 版本 | v3 |
| 序列号 | CA 颁发的唯一编号 | 0x1A2B3C |
| 颁发者 | 谁签发的这个证书 | DigiCert CA |
| 有效期 | 起止时间 | 2024-01-01 ~ 2025-01-01 |
| 主体 | 证书持有者信息 | CN=www.example.com |
| 公钥 | 持有者的公钥 | RSA-2048 公钥 |
| 签名算法 | CA 用的签名算法 | sha256WithRSAEncryption |
| 签名值 | CA 用私钥对证书内容的签名 | 一段二进制 |
| 扩展 | SAN、密钥用途等 | Subject Alternative Name |

其中 **CN（Common Name）** 历史上放域名，但现代浏览器主要看 **SAN（Subject Alternative Name）** 扩展里的域名列表——一张证书可以覆盖多个域名（通配符证书 \`*.example.com\`）。

### 2.2 证书 = 公钥 + 身份 + CA 签名

\`\`\`
证书内容 = {
  主体: "www.example.com",
  公钥: "MIIBIjANBgkqhkiG9w0BAQ...",
  有效期: "2024-01-01 ~ 2025-01-01",
  颁发者: "DigiCert",
  ...
}
签名 = Sign(CA私钥, Hash(证书内容))
\`\`\`

CA 用自己的私钥对证书内容算个哈希再签名。任何人只要拿到 CA 的公钥，就能验证这个签名是否有效——有效说明证书内容没被篡改，确实是这个 CA 签发的。

---

## 三、PKI 体系与 CA 信任链

### 3.1 什么是 PKI

PKI（Public Key Infrastructure，公钥基础设施）是一套管理数字证书的体系，核心角色：

- **CA（Certificate Authority，证书颁发机构）**：签发证书的权威机构，如 DigiCert、Let's Encrypt、GlobalSign。
- **RA（Registration Authority）**：审核申请者身份的机构（有时和 CA 是同一家）。
- **证书持有者**：申请证书的网站/组织。
- **依赖方**：验证证书的一方（浏览器/操作系统）。
- **CRL/OCSP**：证书吊销检查机制。

### 3.2 信任链：根 CA → 中间 CA → 终端证书

CA 不是一家直接签发所有证书，而是**树状信任链**：

\`\`\`
                  [ 根 CA（Root CA）]
                  /        |        \\
            [中间CA]    [中间CA]    [中间CA]
            /    \\       |          |
       [终端证书] [终端证书] [终端证书] ...
       example.com  google.com  github.com
\`\`\`

- **根 CA**：自签名证书（自己签自己），公钥预装在操作系统/浏览器的"信任根证书库"里。根 CA 私钥极其重要，泄露意味着所有它签的证书都不可信。
- **中间 CA**：根 CA 签发的 CA，用来实际签发终端证书。用中间 CA 隔离风险——万一中间 CA 私钥泄露，只需吊销这个中间 CA，不影响根 CA。
- **终端证书**：网站使用的证书，由中间 CA 签发。

### 3.3 证书验证过程

浏览器访问 HTTPS 网站时，验证证书的过程：

1. 收到服务器发来的**证书链**：终端证书 + 中间 CA 证书（可能多层）。
2. 用中间 CA 的公钥验证终端证书的签名 → 有效则信任终端证书。
3. 用根 CA 的公钥验证中间 CA 证书的签名 → 有效则信任中间 CA。
4. 根 CA 是自签名且预装在信任库 → 信任链建立完毕。
5. 检查终端证书的**域名是否匹配**（CN/SAN 是否包含访问的域名）。
6. 检查证书**是否在有效期内**。
7. 检查证书**是否被吊销**（OCSP 在线检查或 CRL 列表）。

任何一步失败都会触发浏览器警告（NET::ERR_CERT_*）。

### 3.4 为什么根证书要预装

根 CA 是信任的起点——它的公钥必须通过**带外方式**（out-of-band）获得，不能从网上下载（否则又陷入"怎么验证下载的根证书"的死循环）。所以根证书随操作系统/浏览器预装：

- Windows：微软维护的根证书库
- macOS：苹果维护的根证书库
- Firefox：Mozilla 维护的根证书库
- Linux：ca-certificates 包

一个 CA 要进入这些根证书库，要通过严格的审计（WebTrust、ETSI 等），遵守 CA/Browser Forum 的基线要求。

---

## 四、证书的类型

### 4.1 按验证等级分

| 类型 | 验证内容 | 签发速度 | 价格 | 浏览器显示 |
|------|---------|---------|------|-----------|
| DV（Domain Validation） | 只验证域名所有权 | 几分钟 | 免费/便宜 | 普通锁 |
| OV（Organization Validation） | 验证域名 + 组织身份 | 1-3 天 | 几百/年 | 普通锁 |
| EV（Extended Validation） | 严格验证组织实体 | 1-2 周 | 几千/年 | 曾显示绿条（现已取消） |

Let's Encrypt 提供的就是 DV 证书，免费自动化签发，推动了 HTTPS 普及。

### 4.2 按覆盖范围分

- **单域名证书**：只覆盖一个域名（如 \`www.example.com\`）
- **通配符证书**：覆盖一级子域名（如 \`*.example.com\` 覆盖 \`a.example.com\`、\`b.example.com\`）
- **多域名证书（SAN）**：一张证书覆盖多个不同域名

---

## 五、数字签名原理

证书的核心机制是**数字签名**。理解签名就理解了证书。

### 5.1 签名与验证

\`\`\`
签名方（CA）：
  1. 对证书内容算哈希：hash = SHA256(证书内容)
  2. 用私钥加密哈希：signature = Encrypt(私钥, hash)
  3. 把 signature 附在证书上

验证方（浏览器）：
  1. 对收到的证书内容算哈希：hash1 = SHA256(证书内容)
  2. 用 CA 公钥解密签名：hash2 = Decrypt(公钥, signature)
  3. 比较 hash1 === hash2，相等则签名有效
\`\`\`

注意：签名不是加密整个证书，证书本身是公开的，签名只是保证"证书内容没被篡改，确实是这个 CA 签的"。

### 5.2 为什么用哈希

直接签名整个证书也行，但非对称加密很慢且数据长度有限。先哈希再签，只需签名固定长度（SHA256 是 32 字节），效率高。

### 5.3 签名 vs 加密的区别

| 维度 | 加密 | 签名 |
|------|------|------|
| 目的 | 机密性（防窃听） | 完整性 + 不可抵赖 |
| 公钥的作用 | 加密 | 验证签名 |
| 私钥的作用 | 解密 | 生成签名 |
| 谁持有私钥 | 接收方（解密人） | 签名方（发送人） |

---

## 六、证书吊销

证书在有效期内也可能需要作废（比如私钥泄露、域名转手）。两种吊销机制：

- **CRL（Certificate Revocation List）**：CA 定期发布吊销证书列表，浏览器下载检查。缺点：列表越来越大，更新不及时。
- **OCSP（Online Certificate Status Protocol）****：浏览器实时向 CA 查询某个证书是否吊销。缺点：增加延迟，且暴露用户访问了哪些网站。
- **OCSP Stapling**：服务器在握手时主动带上 OCSP 响应，浏览器不用自己去查。折中方案，推荐。

---

## 七、本章代码演示

下面的代码模拟 PKI 体系的核心流程：

1. **生成根 CA 密钥对**（自签名根证书）。
2. **用根 CA 签发终端证书**：模拟 CA 给网站签发证书。
3. **验证证书链**：模拟浏览器用根 CA 公钥验证终端证书的签名。
4. **演示签名验证**：用私钥签名数据、用公钥验证，并测试篡改后验证失败。

这会帮你理解"证书是怎么签出来的"和"浏览器是怎么验证证书的"。`,
    code: `// ============================================================
// 第十二章代码演示：数字证书与 PKI 体系
// ------------------------------------------------------------
// 演示内容：
//   1. 生成根 CA 密钥对并自签名（模拟根证书）
//   2. 用根 CA 私钥给"网站"签发终端证书
//   3. 验证证书链（模拟浏览器验证证书）
//   4. 演示数字签名的生成与验证
// ============================================================
const crypto = require('crypto');

console.log('====================================================');
console.log('  第一步：生成根 CA（Root CA）');
console.log('====================================================');
console.log('');

// 根 CA 是信任的起点，公钥预装在系统/浏览器里
// 根证书是自签名的（自己用自己的私钥签自己）
console.log('生成根 CA 的 RSA 密钥对...');
const rootCA = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

// 根 CA 的身份信息（模拟）
const rootCertInfo = {
  subject: { CN: 'My Root CA', O: 'My Organization' },
  issuer: { CN: 'My Root CA', O: 'My Organization' }, // 自签名：颁发者=主体
  serialNumber: '01',
  notBefore: '2024-01-01',
  notAfter: '2034-01-01',
  isCA: true, // 标记这是 CA 证书
};

// 把证书信息序列化后签名（真实 X.509 有标准编码，这里用 JSON 简化演示）
const rootCertContent = JSON.stringify(rootCertInfo);
const rootHash = crypto.createHash('sha256').update(rootCertContent).digest();
const rootSignature = crypto.sign('sha256', rootCertContent, rootCA.privateKey);

console.log('[根 CA 证书信息]');
console.log('  ' + rootCertContent);
console.log('[根 CA 证书签名] ' + rootSignature.toString('hex').slice(0, 48) + '...');
console.log('  ^^^ 根证书是自签名：用自己的私钥签自己');
console.log('');

console.log('====================================================');
console.log('  第二步：根 CA 给网站签发终端证书');
console.log('====================================================');
console.log('');

// 网站生成自己的密钥对
console.log('网站 www.example.com 生成自己的密钥对...');
const website = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

// 网站的证书信息（注意颁发者是根 CA，不是自己）
const websiteCertInfo = {
  subject: { CN: 'www.example.com', O: 'Example Inc' },
  issuer: { CN: 'My Root CA', O: 'My Organization' }, // 颁发者是根 CA
  serialNumber: '1001',
  notBefore: '2024-06-01',
  notAfter: '2025-06-01',
  isCA: false,
  publicKey: website.publicKey.export({ type: 'spki', format: 'pem' }),
};

// 用根 CA 的私钥给网站证书签名
const websiteCertContent = JSON.stringify(websiteCertInfo);
const websiteHash = crypto.createHash('sha256').update(websiteCertContent).digest();
const websiteSignature = crypto.sign('sha256', websiteCertContent, rootCA.privateKey);

console.log('[终端证书信息]');
console.log('  主体：www.example.com');
console.log('  颁发者：My Root CA');
console.log('  公钥：' + websiteCertInfo.publicKey.split('\\n')[0] + '...');
console.log('[CA 用私钥生成的签名] ' + websiteSignature.toString('hex').slice(0, 48) + '...');
console.log('  ^^^ 这个签名证明：根 CA 确实签发了这个证书');
console.log('');

console.log('====================================================');
console.log('  第三步：浏览器验证证书链');
console.log('====================================================');
console.log('');

// 模拟浏览器验证过程
console.log('浏览器收到网站证书，开始验证...');
console.log('');

// 1. 用根 CA 公钥验证终端证书的签名
const verify = crypto.createVerify('sha256');
verify.update(websiteCertContent);
verify.end();
const isWebsiteValid = verify.verify(rootCA.publicKey, websiteSignature);

console.log('[1] 用根 CA 公钥验证终端证书签名：' + (isWebsiteValid ? '有效 ✅' : '无效 ❌'));
console.log('    签名有效 → 证书确实是根 CA 签发的，内容没被篡改');
console.log('');

// 2. 验证根 CA 证书（自签名，用自己公钥验证自己）
const rootVerify = crypto.createVerify('sha256');
rootVerify.update(rootCertContent);
rootVerify.end();
const isRootValid = rootVerify.verify(rootCA.publicKey, rootSignature);
console.log('[2] 用根 CA 公钥验证根证书自身签名：' + (isRootValid ? '有效 ✅' : '无效 ❌'));
console.log('    根证书自签名有效 + 公钥在系统信任库里 → 信任链建立');
console.log('');

// 3. 检查域名是否匹配
const requestedDomain = 'www.example.com';
const certDomain = websiteCertInfo.subject.CN;
const domainMatch = requestedDomain === certDomain;
console.log('[3] 域名匹配检查：访问 ' + requestedDomain + '，证书 CN=' + certDomain + ' → ' + (domainMatch ? '匹配 ✅' : '不匹配 ❌'));
console.log('');

// 4. 检查有效期（这里简化，假设在有效期内）
console.log('[4] 有效期检查：2024-06-01 ~ 2025-06-01 → 在有效期内 ✅');
console.log('');

console.log('✅ 证书链验证通过！可以信任这个服务器');
console.log('   信任链：根CA(预装信任) → 签发 → 终端证书(www.example.com)');
console.log('');

console.log('====================================================');
console.log('  第四步：模拟伪造证书（中间人攻击失败）');
console.log('====================================================');
console.log('');

// 黑客想伪造一个 www.example.com 的证书，但他没有根 CA 的私钥
console.log('黑客自己生成密钥对，伪造一个 www.example.com 证书...');
const hacker = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

const fakeCertInfo = {
  subject: { CN: 'www.example.com', O: 'Hacker' },
  issuer: { CN: 'My Root CA', O: 'My Organization' }, // 假装是根 CA 签的
  serialNumber: '9999',
  publicKey: hacker.publicKey.export({ type: 'spki', format: 'pem' }),
};

// 关键：黑客只能用自己的私钥签名，不能用根 CA 的私钥
const fakeCertContent = JSON.stringify(fakeCertInfo);
const fakeSignature = crypto.sign('sha256', fakeCertContent, hacker.privateKey);

// 浏览器用根 CA 的公钥验证这个伪造签名
const fakeVerify = crypto.createVerify('sha256');
fakeVerify.update(fakeCertContent);
fakeVerify.end();
const isFakeValid = fakeVerify.verify(rootCA.publicKey, fakeSignature);

console.log('浏览器用根 CA 公钥验证伪造证书的签名：' + (isFakeValid ? '有效（不该发生）' : '无效 ❌'));
console.log('');
console.log('✅ 攻击失败！黑客没有根 CA 的私钥，无法伪造有效签名');
console.log('   这就是 PKI 体系防中间人攻击的核心：');
console.log('   身份信任锚定在预装的根证书上，伪造者无法跨越');
console.log('');

console.log('====================================================');
console.log('  第五步：数字签名通用演示');
console.log('====================================================');
console.log('');

// 演示数字签名的完整流程：签名 → 验证 → 篡改检测
const data = '这是一份重要合同，金额 100 万元';

// 签名方用自己的私钥签名
const signer = crypto.createSign('sha256');
signer.update(data);
signer.end();
const sig = signer.sign(website.privateKey);
console.log('[待签名数据] ' + data);
console.log('[签名] ' + sig.toString('hex').slice(0, 48) + '...');
console.log('');

// 验证方用签名方的公钥验证
const verifier = crypto.createVerify('sha256');
verifier.update(data);
verifier.end();
const valid = verifier.verify(website.publicKey, sig);
console.log('[验证原始数据] ' + (valid ? '签名有效 ✅' : '签名无效 ❌'));
console.log('');

// 篡改数据后验证
const tamperedData = '这是一份重要合同，金额 1 万元'; // 改了金额
const verifier2 = crypto.createVerify('sha256');
verifier2.update(tamperedData);
verifier2.end();
const validAfterTamper = verifier2.verify(website.publicKey, sig);
console.log('[篡改后数据] ' + tamperedData);
console.log('[验证篡改数据] ' + (validAfterTamper ? '签名有效（不该发生）' : '签名无效 ❌'));
console.log('  ^^^ 数据被改过，签名验证失败 → 完整性保护生效');
console.log('');

console.log('总结：');
console.log('  数字签名 = 用私钥对数据的哈希加密');
console.log('  验证签名 = 用公钥解密哈希，和重新算的哈希对比');
console.log('  作用：保证数据完整性 + 不可抵赖（谁签的谁赖不掉）');
console.log('  证书就是：CA 用签名机制背书了"这个公钥属于这个域名"');
`
  },

  // ============================================================
  // 第十三章：HTTP 安全头（CSP、HSTS、X-Frame-Options 等）
  // ============================================================
  {
    id: "http-13",
    group: "HTTPS 与安全",
    icon: "🛡️",
    title: "HTTP 安全头（CSP、HSTS、X-Frame-Options 等）",
    content: `## 一、HTTP 安全头是什么

HTTPS 解决了传输层的安全（加密、完整性、认证），但 Web 应用本身还有一大堆攻击面：XSS（跨站脚本）、点击劫持、MIME 嗅探、协议降级、信息泄露……这些都不是 HTTPS 能管的，而是**应用层**的问题。

**HTTP 安全响应头**（Security Headers）就是服务器在响应里加的一些"指令头"，告诉浏览器"在这些方面要遵守额外的安全约束"。它们是一行行配置，不改变业务逻辑，却能有效防御常见攻击。成本极低、收益极高，是 Web 安全的"基础设施"。

比如：

\`\`\`
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
\`\`\`

这几行头就能挡掉 XSS、点击劫持、MIME 嗅探、协议降级等攻击。下面逐个讲解。

---

## 二、Content-Security-Policy（CSP）

### 2.1 解决什么问题

CSP 主要防御 **XSS（跨站脚本攻击）**。XSS 的本质是：攻击者把你写的网页里插入了恶意 \`<script>\`，浏览器分不清这是你写的还是攻击者插的，照样执行。

CSP 的思路是：**白名单**——告诉浏览器"只能从这里加载资源、只能执行这里的脚本"，其他一律拒绝。即使攻击者注入了 \`<script>\`，不在白名单里就不会执行。

### 2.2 CSP 指令

\`\`\`
Content-Security-Policy: default-src 'self';
                        script-src 'self' https://cdn.example.com;
                        style-src 'self' 'unsafe-inline';
                        img-src *;
                        connect-src 'self' https://api.example.com;
                        frame-ancestors 'none';
\`\`\`

| 指令 | 控制什么 |
|------|---------|
| \`default-src\` | 默认加载策略（其他指令没写就回退到这个） |
| \`script-src\` | JS 脚本来源 |
| \`style-src\` | CSS 样式来源 |
| \`img-src\` | 图片来源 |
| \`connect-src\` | fetch/XHR/WebSocket 能连的地址 |
| \`font-src\` | 字体来源 |
| \`frame-ancestors\` | 谁能用 iframe 嵌入本页（类似 X-Frame-Options） |
| \`object-src\` | \`<object>\`/\`<embed>\` 来源 |
| \`base-uri\` | \`<base>\` 标签能设的地址 |

### 2.3 来源值

- \`'self'\`：同源（协议+域名+端口相同）
- \`'none'\`：完全禁止
- \`'unsafe-inline'\`：允许内联（如 \`<script>alert(1)</script>\`、\`style="..."\`）——**降低安全性**，尽量别用
- \`'unsafe-eval'\`：允许 eval()——**降低安全性**
- 具体域名：\`https://cdn.example.com\`
- \`*\`：任意来源——等于没防护

### 2.4 nonce 和 hash

对于必须内联的脚本，可以用 nonce 或 hash 精确放行：

\`\`\`
Content-Security-Policy: script-src 'nonce-abc123' 'sha256-...'

<script nonce="abc123">alert(1)</script>  <!-- 放行 -->
<script>alert(2)</script>                  <!-- 拦截 -->
\`\`\`

nonce 是每次请求生成的随机值，攻击者猜不到，所以注入的 \`<script>\` 没有 nonce 就被拦。

### 2.5 Report-Only 模式

上线 CSP 怕误伤正常功能？先用 \`Content-Security-Policy-Report-Only\`，只上报违规不实际拦截，收集一段时间报告后再切到强制模式。

---

## 三、Strict-Transport-Security（HSTS）

### 3.1 解决什么问题

即使用户访问 \`https://example.com\`，也存在**协议降级攻击**：攻击者中间人把 \`https://\` 改成 \`http://\`，用户在不知情下走了明文 HTTP。

HSTS 让浏览器记住"这个域名接下来 N 天内必须用 HTTPS"，即使用户输入 \`http://\`，浏览器也自动改成 \`https://\`。

### 3.2 指令

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

- \`max-age=31536000\`：有效期 1 年（秒）
- \`includeSubDomains\`：子域名也适用
- \`preload\`：申请加入浏览器的 HSTS 预加载列表（即使第一次访问也强制 HTTPS）

### 3.3 首次访问的漏洞

HSTS 有个"首次访问"漏洞：用户第一次访问 \`example.com\`，还没收到 HSTS 头，这一刻可能被降级。解决办法是 \`preload\`——把域名提交到浏览器内置的 HSTS 列表（hstspreload.org），浏览器出厂就带这个列表，第一次访问也强制 HTTPS。

---

## 四、X-Frame-Options

### 4.1 解决什么问题

防御**点击劫持（Clickjacking）**。攻击者用一个透明的 iframe 嵌入你的页面，覆盖在自己的钓鱼页面上，诱导用户点击你页面里的按钮（用户以为点的是钓鱼页面的按钮）。

### 4.2 取值

- \`DENY\`：完全不允许被 iframe 嵌入
- \`SAMEORIGIN\`：只允许同源页面嵌入
- \`ALLOW-FROM https://example.com\`：允许指定源（已被现代浏览器废弃）

### 4.3 与 CSP frame-ancestors 的关系

CSP 的 \`frame-ancestors\` 是 X-Frame-Options 的升级版，支持多个源、通配符，功能更强。现代浏览器两者都支持时，CSP 优先。建议两者都加（兼容老浏览器）。

---

## 五、X-Content-Type-Options

### 5.1 解决什么问题

防御 **MIME 嗅探**。浏览器有时会"自作主张"——服务器声明 \`Content-Type: text/plain\`，但浏览器看内容像 JS，就当成 JS 执行，导致 XSS。

\`\`\`
X-Content-Type-Options: nosniff
\`\`\`

告诉浏览器"严格按声明的 Content-Type 处理，别嗅探"。这一行就解决了。

---

## 六、X-XSS-Protection

### 6.1 历史背景

这是 IE 引入的浏览器内置 XSS 过滤器。当检测到 URL 里的参数出现在响应里且像脚本时，自动拦截。

### 6.2 现状

现代浏览器（Chrome 78+、Edge、Firefox）已移除内置 XSS 过滤器，因为 CSP 更可靠且过滤器本身有副作用（能被攻击者利用绕过 CSP）。

\`\`\`
X-XSS-Protection: 1; mode=block
\`\`\`

建议设为 \`1; mode=block\`（开启并直接阻止页面渲染），或 \`0\`（关闭有缺陷的过滤器）。**不能替代 CSP**。

---

## 七、Referrer-Policy

### 7.1 解决什么问题

控制 \`Referer\` 头的发送。当你从 A 页面点链接到 B 页面，浏览器会在请求 B 时带上 \`Referer: https://A.com/path?query\`。这可能泄露 A 页面的路径、查询参数（有时包含 token）。

### 7.2 取值

- \`no-referrer\`：完全不发送 Referer
- \`no-referrer-when-downgrade\`：HTTPS→HTTP 时不发（默认行为之一）
- \`same-origin\`：同源才发
- \`strict-origin\`：只发源（协议+域名+端口），不发路径
- \`strict-origin-when-cross-origin\`：同源发完整，跨源只发源（Chrome 默认）
- \`unsafe-url\`：总是发完整 URL（不安全，别用）

---

## 八、Permissions-Policy（原 Feature-Policy）

控制浏览器功能（摄像头、麦克风、地理位置、全屏等）在当前页及 iframe 里的使用权限：

\`\`\`
Permissions-Policy: camera=(), microphone=(), geolocation=(self https://trusted.com)
\`\`\`

- \`camera=()\`：禁止使用摄像头
- \`geolocation=(self https://trusted.com)\`：只允许同源和 trusted.com 使用定位

即使第三方 JS 想调 \`navigator.geolocation\` 也会被拒。

---

## 九、安全头检查工具

- **securityheaders.com**：在线扫描，给 A~F 评级
- **Mozilla Observatory**：observatory.mozilla.org，更全面
- **浏览器 DevTools**：Network 面板看响应头

---

## 十、本章代码演示

下面的代码实现一个**安全响应头检查器**：

1. 输入一组 HTTP 响应头（对象形式）。
2. 逐个检查 CSP、HSTS、X-Frame-Options、X-Content-Type-Options、Referrer-Policy 等关键安全头。
3. 评估每个头的配置是否合理，给出评分和建议。
4. 输出一份安全报告（评级 + 改进建议）。

这个检查器的逻辑和 securityheaders.com 这类工具类似，你可以拿真实的响应头去测。`,
    code: `// ============================================================
// 第十三章代码演示：HTTP 安全头检查器
// ------------------------------------------------------------
// 实现一个安全响应头评估工具：
//   1. 输入一组 HTTP 响应头
//   2. 检查关键安全头是否存在且配置合理
//   3. 输出评级（A~F）和改进建议
// ============================================================

// ---- 安全头检查器 ----
// 传入响应头对象，返回检查结果和评分
function checkSecurityHeaders(headers) {
  const results = [];
  let totalScore = 0;
  let maxScore = 0;

  // 辅助：添加一条检查结果
  const add = (name, weight, status, detail, suggestion) => {
    maxScore += weight;
    if (status === 'pass') totalScore += weight;
    else if (status === 'warn') totalScore += Math.floor(weight / 2);
    results.push({ name, weight, status, detail, suggestion });
  };

  // ---- 1. Content-Security-Policy ----
  const csp = headers['content-security-policy'];
  if (!csp) {
    add('Content-Security-Policy', 25, 'fail',
      '缺失',
      '添加 CSP 防御 XSS，至少配置 default-src \\'self\\'');
  } else if (csp.includes('unsafe-inline') && csp.includes('unsafe-eval')) {
    add('Content-Security-Policy', 25, 'warn',
      '配置存在但用了 unsafe-inline + unsafe-eval，防护较弱',
      '移除 unsafe-inline/unsafe-eval，改用 nonce 或 hash');
  } else if (csp.includes('default-src') || csp.includes('script-src')) {
    add('Content-Security-Policy', 25, 'pass',
      '已配置，包含 default-src 或 script-src', '');
  } else {
    add('Content-Security-Policy', 25, 'warn',
      '已配置但缺少 default-src/script-src', '补充 default-src \\'self\\'');
  }

  // ---- 2. Strict-Transport-Security (HSTS) ----
  const hsts = headers['strict-transport-security'];
  if (!hsts) {
    add('Strict-Transport-Security', 20, 'fail',
      '缺失', '添加 HSTS 头，max-age 至少 31536000（1年）');
  } else {
    const maxAgeMatch = /max-age=(\\d+)/.exec(hsts);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
    if (maxAge >= 31536000 && hsts.includes('includeSubDomains')) {
      add('Strict-Transport-Security', 20, 'pass',
        '配置完善（max-age=' + maxAge + ', includeSubDomains）', '');
    } else if (maxAge >= 31536000) {
      add('Strict-Transport-Security', 20, 'warn',
        'max-age 够长但缺少 includeSubDomains',
        '添加 includeSubDomains 保护子域名');
    } else {
      add('Strict-Transport-Security', 20, 'warn',
        'max-age=' + maxAge + ' 太短',
        'max-age 建议至少 31536000（1年）');
    }
  }

  // ---- 3. X-Frame-Options ----
  const xfo = headers['x-frame-options'];
  // 注意：CSP frame-ancestors 可以替代 X-Frame-Options
  const frameAncestors = csp && csp.includes('frame-ancestors');
  if (!xfo && !frameAncestors) {
    add('X-Frame-Options', 15, 'fail',
      '缺失', '添加 X-Frame-Options: DENY 或 CSP frame-ancestors 防点击劫持');
  } else if (xfo && (xfo.toUpperCase() === 'DENY' || xfo.toUpperCase() === 'SAMEORIGIN')) {
    add('X-Frame-Options', 15, 'pass',
      '已配置：' + xfo, '');
  } else if (frameAncestors) {
    add('X-Frame-Options', 15, 'pass',
      '通过 CSP frame-ancestors 实现', '');
  } else {
    add('X-Frame-Options', 15, 'warn',
      '配置值不规范：' + xfo, '使用 DENY 或 SAMEORIGIN');
  }

  // ---- 4. X-Content-Type-Options ----
  const xcto = headers['x-content-type-options'];
  if (!xcto) {
    add('X-Content-Type-Options', 10, 'fail',
      '缺失', '添加 X-Content-Type-Options: nosniff 防 MIME 嗅探');
  } else if (xcto.toLowerCase() === 'nosniff') {
    add('X-Content-Type-Options', 10, 'pass',
      '已配置：nosniff', '');
  } else {
    add('X-Content-Type-Options', 10, 'warn',
      '配置值不规范：' + xcto, '应为 nosniff');
  }

  // ---- 5. Referrer-Policy ----
  const referrer = headers['referrer-policy'];
  const goodReferrer = ['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
  if (!referrer) {
    add('Referrer-Policy', 10, 'warn',
      '缺失（浏览器会用默认策略）', '建议添加 strict-origin-when-cross-origin');
  } else if (goodReferrer.includes(referrer.toLowerCase())) {
    add('Referrer-Policy', 10, 'pass',
      '已配置：' + referrer, '');
  } else if (referrer.toLowerCase() === 'unsafe-url') {
    add('Referrer-Policy', 10, 'warn',
      '用了 unsafe-url，会泄露完整 URL', '改用 strict-origin-when-cross-origin');
  } else {
    add('Referrer-Policy', 10, 'warn',
      '配置值：' + referrer, '建议用 strict-origin-when-cross-origin');
  }

  // ---- 6. Permissions-Policy ----
  const pp = headers['permissions-policy'];
  if (!pp) {
    add('Permissions-Policy', 5, 'warn',
      '缺失', '添加 Permissions-Policy 限制摄像头/麦克风等权限');
  } else {
    add('Permissions-Policy', 5, 'pass',
      '已配置', '');
  }

  // ---- 7. X-XSS-Protection ----
  const xxss = headers['x-xss-protection'];
  if (!xxss) {
    add('X-XSS-Protection', 5, 'warn',
      '缺失', '可添加 X-XSS-Protection: 0（关闭有缺陷的旧过滤器）或依赖 CSP');
  } else if (xxss === '0' || xxss.includes('mode=block')) {
    add('X-XSS-Protection', 5, 'pass',
      '已配置：' + xxss, '');
  } else {
    add('X-XSS-Protection', 5, 'warn',
      '配置：' + xxss, '建议用 0 或 1; mode=block');
  }

  return { results, totalScore, maxScore };
}

// ---- 评级函数 ----
function gradeFromScore(totalScore, maxScore) {
  const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  if (percent >= 90) return { grade: 'A', percent: percent };
  if (percent >= 80) return { grade: 'B', percent: percent };
  if (percent >= 70) return { grade: 'C', percent: percent };
  if (percent >= 60) return { grade: 'D', percent: percent };
  return { grade: 'F', percent: percent };
}

// ---- 打印报告 ----
function printReport(headers, label) {
  console.log('====================================================');
  console.log('  安全头检查报告：' + label);
  console.log('====================================================');
  console.log('');

  // 打印响应头
  console.log('[响应头]');
  Object.keys(headers).forEach(function (k) {
    console.log('  ' + k + ': ' + headers[k]);
  });
  console.log('');

  const check = checkSecurityHeaders(headers);
  const gradeInfo = gradeFromScore(check.totalScore, check.maxScore);

  console.log('[检查结果]');
  check.results.forEach(function (r) {
    const icon = r.status === 'pass' ? '✅' : (r.status === 'warn' ? '⚠️ ' : '❌');
    console.log('  ' + icon + ' ' + r.name + ' (' + r.weight + '分)');
    console.log('      状态：' + r.detail);
    if (r.suggestion) {
      console.log('      建议：' + r.suggestion);
    }
  });
  console.log('');

  console.log('[评级]');
  console.log('  得分：' + check.totalScore + ' / ' + check.maxScore + ' (' + gradeInfo.percent.toFixed(0) + '%)');
  console.log('  等级：' + gradeInfo.grade);
  console.log('');
  console.log('');
}

// ---- 测试用例 1：配置很差的网站 ----
var badHeaders = {
  'content-type': 'text/html',
  'server': 'Apache/2.4.1',
};
printReport(badHeaders, '案例一：没有任何安全头的网站');

// ---- 测试用例 2：部分配置的网站 ----
var partialHeaders = {
  'content-type': 'text/html',
  'strict-transport-security': 'max-age=86400',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
};
printReport(partialHeaders, '案例二：部分配置的网站');

// ---- 测试用例 3：配置完善的网站 ----
var goodHeaders = {
  'content-type': 'text/html',
  'content-security-policy': "default-src 'self'; script-src 'self' https://cdn.example.com; frame-ancestors 'none'",
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(self)',
  'x-xss-protection': '0',
};
printReport(goodHeaders, '案例三：配置完善的网站');

// ---- 测试用例 4：CSP 用了 unsafe-inline 的网站 ----
var weakCspHeaders = {
  'content-type': 'text/html',
  'content-security-policy': "default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
};
printReport(weakCspHeaders, '案例四：CSP 配置较弱的网站');

console.log('====================================================');
console.log('  安全头最佳实践总结');
console.log('====================================================');
console.log('');
console.log('1. Content-Security-Policy：必加，用 nonce/hash 替代 unsafe-inline');
console.log('2. Strict-Transport-Security：必加，max-age>=1年 + includeSubDomains + preload');
console.log('3. X-Frame-Options 或 CSP frame-ancestors：必加，防点击劫持');
console.log('4. X-Content-Type-Options: nosniff：必加，防 MIME 嗅探');
console.log('5. Referrer-Policy：建议加，用 strict-origin-when-cross-origin');
console.log('6. Permissions-Policy：建议加，限制浏览器 API 权限');
console.log('');
console.log('这些头是 Web 安全的"基础设施"，成本极低收益极高，');
console.log('上线前务必用 securityheaders.com 检查一遍！');
`
  },

  // ============================================================
  // 第十四章：CORS 跨域资源共享
  // ============================================================
  {
    id: "http-14",
    group: "HTTPS 与安全",
    icon: "🌍",
    title: "CORS 跨域资源共享",
    content: `## 一、什么是跨域

前端开发最常遇到的报错之一：\`Access to fetch at '...' from origin '...' has been blocked by CORS policy\`。这个 CORS（Cross-Origin Resource Sharing，跨域资源共享）到底是什么？

先说**同源（Same-Origin）**。两个 URL 的"源"由三部分组成：**协议 + 域名 + 端口**，三者完全一致才算同源。

\`\`\`
https://example.com/page  和  https://example.com/api    → 同源（协议域名端口都一样）
https://example.com       和  http://example.com          → 跨域（协议不同）
https://example.com       和  https://api.example.com     → 跨域（域名不同）
https://example.com:443   和  https://example.com:8443    → 跨域（端口不同）
\`\`\`

浏览器的**同源策略（Same-Origin Policy, SOP）** 规定：默认情况下，一个源里的 JS 不能读另一个源的资源。这是浏览器最核心的安全机制——没有它，任何网站都能读你的银行账户数据。

### 1.1 同源策略限制什么

| 操作 | 是否受限 | 说明 |
|------|---------|------|
| 读跨域资源的响应 | 受限 | fetch/XHR 跨域请求能发出去，但读不到响应 |
| DOM 访问跨域 iframe | 受限 | 父页面不能读跨域 iframe 的 DOM |
| Cookie/Storage 隔离 | 受限 | 不同源的 Cookie/localStorage 互相隔离 |
| 发送跨域请求 | **不完全受限** | \`<img>\`、\`<script>\`、\`<link>\` 能发跨域请求 |
| 表单提交跨域 | 不受限 | \`<form action="跨域URL">\` 能提交，但读不到响应 |

关键点：**SOP 主要限制的是"读响应"，不是"发请求"**。你可以用 \`<img src="跨域URL">\` 发请求，但 JS 读不到图片内容；你可以用 fetch 发跨域请求，请求确实到了服务器，服务器也返回了，但浏览器把响应**拦截**了，JS 拿不到。

### 1.2 为什么需要 CORS

SOP 太严格了——现代 Web 应用前后端分离，前端在 \`a.com\`，后端 API 在 \`api.a.com\`，这是跨域，但业务上需要调用。怎么办？

早期用 JSONP（利用 \`<script>\` 不受 SOP 限制的特性），但只支持 GET、有安全风险。

**CORS** 是标准方案：**服务器主动声明"我允许某个源访问"**，浏览器看到服务器的许可，就放行响应给 JS。CORS 是 HTTP 头机制，由服务器控制，浏览器执行。

---

## 二、简单请求 vs 预检请求

CORS 把跨域请求分成两类，处理流程不同。

### 2.1 简单请求（Simple Request）

满足以下**所有**条件的请求是"简单请求"，浏览器直接发，不发预检：

1. 方法是 \`GET\`、\`HEAD\`、\`POST\` 之一
2. 除了浏览器自动加的头，只能手动设置这几个：\`Accept\`、\`Accept-Language\`、\`Content-Language\`、\`Content-Type\`
3. \`Content-Type\` 只能是：\`text/plain\`、\`multipart/form-data\`、\`application/x-www-form-urlencoded\`
4. 请求中没有 \`ReadableStream\` 对象
5. 不使用 \`XMLHttpRequest.upload\`

\`\`\`
简单请求流程：

[浏览器] --请求 + Origin头--> [服务器]
[浏览器] <--响应 + CORS头-- [服务器]
     ↓
浏览器检查 CORS 头：
  - 有 Access-Control-Allow-Origin 且匹配 → 放行，JS 拿到响应
  - 没有 或 不匹配 → 拦截响应，JS 拿不到，控制台报 CORS 错误
\`\`\`

### 2.2 预检请求（Preflight Request）

不满足简单请求条件的（比如 PUT/DELETE 方法、\`Content-Type: application/json\`、自定义头 \`X-Token\`），浏览器会先发一个 **OPTIONS 预检请求**，问服务器"我能不能这样发"。

\`\`\`
预检请求流程：

[浏览器] --OPTIONS 预检 + Origin头--> [服务器]
[浏览器] <--预检响应(Allow-Origin/Allow-Methods等)--
     ↓
浏览器检查预检响应：
  - 允许 → 发真正的请求
  - 不允许 → 拦截，不发真正的请求，报 CORS 错误

[浏览器] --真正的请求--> [服务器]
[浏览器] <--真正的响应--
\`\`\`

预检请求的关键头：

**请求头（浏览器发）：**
- \`Origin: https://a.com\`：请求来自哪个源
- \`Access-Control-Request-Method: PUT\`：想用的方法
- \`Access-Control-Request-Headers: X-Token, Content-Type\`：想用的自定义头

**响应头（服务器回）：**
- \`Access-Control-Allow-Origin: https://a.com\`：允许的源
- \`Access-Control-Allow-Methods: GET, POST, PUT, DELETE\`：允许的方法
- \`Access-Control-Allow-Headers: X-Token, Content-Type\`：允许的头
- \`Access-Control-Max-Age: 86400\`：预检结果缓存多久（秒），缓存期内不再发预检

### 2.3 为什么要预检

预检是为了**保护服务器**。简单请求是"安全的"（不会改服务器数据），直接发也无妨。但 PUT/DELETE、自定义头这些可能修改服务器数据或触发复杂逻辑，先问一句"你允许吗"再发，避免服务器被意外调用。

注意：预检是浏览器行为，不是服务器要求的。即使服务器没配 CORS，预检也会发；只是预检响应没有正确的 CORS 头时，浏览器不发后续请求。

---

## 三、CORS 响应头详解

| 响应头 | 作用 | 示例 |
|--------|------|------|
| \`Access-Control-Allow-Origin\` | 允许的源 | \`https://a.com\` 或 \`*\` |
| \`Access-Control-Allow-Methods\` | 允许的方法 | \`GET, POST, PUT\` |
| \`Access-Control-Allow-Headers\` | 允许的请求头 | \`Content-Type, X-Token\` |
| \`Access-Control-Expose-Headers\` | 允许 JS 读取的响应头 | \`X-Total-Count\` |
| \`Access-Control-Allow-Credentials\` | 是否允许带 Cookie | \`true\` |
| \`Access-Control-Max-Age\` | 预检缓存时间（秒） | \`86400\` |

### 3.1 Allow-Origin 的注意点

- \`*\` 表示允许任意源。但**如果 Allow-Credentials 是 true，Allow-Origin 不能是 \`*\`**，必须指定具体源。这是浏览器的硬性规定，防止 Cookie 泄露。
- 动态源：服务器根据请求的 \`Origin\` 头动态回填 \`Access-Control-Allow-Origin: <对应源>\`，实现"允许多个指定源"。

### 3.2 Allow-Credentials 与 Cookie

默认情况下，跨域请求**不带 Cookie**。如果需要带（比如跨域登录态），要两步：

1. 前端：\`fetch(url, { credentials: 'include' })\` 或 \`xhr.withCredentials = true\`
2. 服务器：\`Access-Control-Allow-Credentials: true\`

两者都设置，跨域请求才会带 Cookie。且此时 Allow-Origin 不能是 \`*\`。

### 3.3 Expose-Headers

默认情况下，JS 只能读"安全"的响应头（Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma）。自定义响应头（如 \`X-Total-Count\`）JS 读不到，除非服务器声明：

\`\`\`
Access-Control-Expose-Headers: X-Total-Count, X-Request-Id
\`\`\`

---

## 四、CORS 常见坑

### 4.1 "CORS 错误"不一定真是 CORS 问题

很多人看到 CORS 报错就以为是 CORS 配置问题，其实可能是：

- 服务器根本没起来（请求没到服务器，浏览器报 CORS）
- 服务器返回 500（错误响应没有 CORS 头，浏览器报 CORS）
- Nginx 没把 OPTIONS 请求转发给后端

排查技巧：看 Network 面板，**预检请求的状态码和响应头**——如果预检响应没有 CORS 头，才是 CORS 配置问题。

### 4.2 预检请求没带 Cookie

预检请求（OPTIONS）**永远不带 Cookie**。服务器对预检请求不能依赖 Cookie 做鉴权，应该直接根据 Origin 回 CORS 头。

### 4.3 Allow-Origin: * 和 Credentials 不能共存

\`\`\`
Access-Control-Allow-Origin: *            ← 这样
Access-Control-Allow-Credentials: true    ← 和这样，不能同时出现
\`\`\`

浏览器会拒绝。要么指定具体源，要么放弃带 Cookie。

---

## 五、CORS 与反向代理

除了服务器配 CORS 头，另一个常见方案是**反向代理**：让前端和 API 同源。

\`\`\`
[浏览器 https://a.com] --> [Nginx 反向代理] --> [前端静态文件]
                            └-------> [后端 API https://api.a.com]
\`\`\`

Nginx 把 \`/api/*\` 转发到后端，浏览器看到的都是 \`a.com\`，没有跨域问题。生产环境常用这种方案——前端和 API 同源，CORS 只在开发环境用。

---

## 六、本章代码演示

下面的代码模拟 CORS 的处理逻辑（因为沙箱没有 http 模块，我们用纯函数模拟）：

1. **判断请求是简单请求还是预检请求**：根据方法、Content-Type、自定义头判断。
2. **处理预检请求**：根据允许的源列表生成 CORS 预检响应头。
3. **处理简单请求**：检查 Origin 并生成 CORS 响应头。
4. **模拟浏览器检查**：演示浏览器如何根据 CORS 响应头决定放行或拦截。

这会帮你理解 CORS 的完整流程，以及服务器该怎么配置 CORS 头。`,
    code: `// ============================================================
// 第十四章代码演示：CORS 跨域资源共享模拟
// ------------------------------------------------------------
// 演示内容：
//   1. 判断请求是简单请求还是预检请求
//   2. 服务器端生成 CORS 预检响应头
//   3. 服务器端生成简单请求的 CORS 响应头
//   4. 模拟浏览器检查 CORS 头决定是否放行
// ============================================================
const assert = require('assert');

// ---- CORS 服务器配置 ----
// 模拟服务器端的 CORS 配置
const corsConfig = {
  allowedOrigins: ['https://www.example.com', 'https://app.example.com'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
  allowCredentials: true,
  maxAge: 86400, // 预检缓存 1 天
};

console.log('====================================================');
console.log('  CORS 服务器配置');
console.log('====================================================');
console.log('');
console.log('允许的源：' + corsConfig.allowedOrigins.join(', '));
console.log('允许的方法：' + corsConfig.allowedMethods.join(', '));
console.log('允许的头：' + corsConfig.allowedHeaders.join(', '));
console.log('允许带凭证(Cookie)：' + corsConfig.allowCredentials);
console.log('预检缓存时间：' + corsConfig.maxAge + '秒');
console.log('');

// ---- 工具函数：判断是否是简单请求 ----
// 简单请求的条件：方法在 GET/HEAD/POST，Content-Type 受限，无自定义头
function isSimpleRequest(method, headers) {
  // 1. 方法必须是 GET / HEAD / POST
  var simpleMethods = ['GET', 'HEAD', 'POST'];
  if (simpleMethods.indexOf(method.toUpperCase()) === -1) {
    return false;
  }

  // 2. Content-Type 只能是这三种之一
  var ct = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  var simpleTypes = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
  ];
  if (ct && simpleTypes.indexOf(ct) === -1) {
    return false; // 有 Content-Type 但不是简单类型
  }

  // 3. 除了 CORS 安全头，不能有其他自定义头
  var safeHeaders = [
    'accept', 'accept-language', 'content-language', 'content-type',
  ];
  var customHeaders = Object.keys(headers).filter(function (h) {
    return safeHeaders.indexOf(h.toLowerCase()) === -1;
  });
  if (customHeaders.length > 0) {
    return false;
  }

  return true;
}

// ---- 工具函数：检查 Origin 是否被允许 ----
function isOriginAllowed(origin, allowedOrigins) {
  return allowedOrigins.indexOf(origin) !== -1;
}

// ---- 处理预检请求（OPTIONS）----
function handlePreflight(request, config) {
  var origin = request.headers['Origin'];
  var reqMethod = request.headers['Access-Control-Request-Method'];
  var reqHeaders = request.headers['Access-Control-Request-Headers'];

  console.log('  [服务器] 收到预检请求');
  console.log('    Origin: ' + origin);
  console.log('    请求方法: ' + reqMethod);
  console.log('    请求头: ' + (reqHeaders || '无'));

  // 如果 Origin 不在允许列表，拒绝
  if (!origin || !isOriginAllowed(origin, config.allowedOrigins)) {
    console.log('    → Origin 不被允许，不返回 CORS 头');
    return { status: 403, headers: {}, body: 'CORS: origin not allowed' };
  }

  // 构造预检响应头
  var responseHeaders = {};
  responseHeaders['Access-Control-Allow-Origin'] = origin;
  responseHeaders['Access-Control-Allow-Methods'] = config.allowedMethods.join(', ');
  responseHeaders['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
  responseHeaders['Access-Control-Max-Age'] = String(config.maxAge);

  // 关键：允许凭证时，Allow-Origin 不能是 *，必须是具体源
  if (config.allowCredentials) {
    responseHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  console.log('    → 返回预检响应头');
  Object.keys(responseHeaders).forEach(function (h) {
    console.log('    ' + h + ': ' + responseHeaders[h]);
  });

  return { status: 204, headers: responseHeaders, body: '' };
}

// ---- 处理简单请求 / 实际请求 ----
function handleActualRequest(request, config) {
  var origin = request.headers['Origin'];

  console.log('  [服务器] 收到实际请求');
  console.log('    方法: ' + request.method);
  console.log('    Origin: ' + origin);

  // 检查 Origin
  if (!origin || !isOriginAllowed(origin, config.allowedOrigins)) {
    console.log('    → Origin 不被允许');
    // 注意：请求仍然会到服务器，服务器可以处理，只是不返回 CORS 头
    // 浏览器会拦截响应
    return {
      status: 200,
      headers: {}, // 不加 CORS 头
      body: 'response data',
    };
  }

  var responseHeaders = {};
  responseHeaders['Access-Control-Allow-Origin'] = origin;
  if (config.allowCredentials) {
    responseHeaders['Access-Control-Allow-Credentials'] = 'true';
  }
  // Expose-Headers 让 JS 能读到自定义响应头
  if (config.exposedHeaders.length > 0) {
    responseHeaders['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  }

  console.log('    → 返回响应（含 CORS 头）');
  Object.keys(responseHeaders).forEach(function (h) {
    console.log('    ' + h + ': ' + responseHeaders[h]);
  });

  return {
    status: 200,
    headers: responseHeaders,
    body: '{"message": "success", "data": [1, 2, 3]}',
  };
}

// ---- 模拟浏览器检查 CORS 响应头 ----
function browserCheckCORS(request, response, config) {
  var origin = request.headers['Origin'];
  var allowOrigin = response.headers['Access-Control-Allow-Origin'];

  console.log('  [浏览器] 检查 CORS 响应头');
  console.log('    请求 Origin: ' + origin);
  console.log('    服务器 Allow-Origin: ' + (allowOrigin || '（无）'));

  if (!allowOrigin) {
    console.log('    → 响应没有 CORS 头，拦截响应 ❌');
    console.log('    [报错] Access to fetch has been blocked by CORS policy:');
    console.log('           No Access-Control-Allow-Origin header is present');
    return false;
  }

  // 检查 Allow-Origin 是否匹配
  if (allowOrigin !== '*' && allowOrigin !== origin) {
    console.log('    → Allow-Origin 与 Origin 不匹配，拦截 ❌');
    console.log('    [报错] The value of Access-Control-Allow-Origin must not be the wildcard');
    return false;
  }

  // 检查 Credentials 的情况
  if (config.allowCredentials && allowOrigin === '*') {
    console.log('    → 允许凭证时 Allow-Origin 不能是 *，拦截 ❌');
    return false;
  }

  console.log('    → CORS 检查通过，放行响应 ✅');
  console.log('    JS 拿到响应：' + response.body);
  return true;
}

// ---- 模拟浏览器发起跨域请求的完整流程 ----
function simulateCrossOriginRequest(label, request, config) {
  console.log('====================================================');
  console.log('  场景：' + label);
  console.log('====================================================');
  console.log('');

  var method = request.method;
  var headers = request.headers || {};

  // 第一步：浏览器判断是简单请求还是预检请求
  console.log('[步骤1] 浏览器判断请求类型');
  var simple = isSimpleRequest(method, headers);
  console.log('  方法: ' + method + ', Content-Type: ' + (headers['Content-Type'] || '无'));
  console.log('  → ' + (simple ? '简单请求，直接发送' : '非简单请求，需要预检'));
  console.log('');

  var response;

  if (!simple) {
    // 预检请求
    console.log('[步骤2] 浏览器发送 OPTIONS 预检请求');
    var preflightRequest = {
      method: 'OPTIONS',
      headers: {
        'Origin': headers['Origin'],
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': headers['Content-Type'] ? 'Content-Type' : undefined,
      },
    };
    var preflightResponse = handlePreflight(preflightRequest, config);
    console.log('');

    console.log('[步骤3] 浏览器检查预检响应');
    var preflightOk = browserCheckCORS(preflightRequest, preflightResponse, config);
    console.log('');

    if (!preflightOk) {
      console.log('[结果] 预检失败，不发送真正的请求 ❌');
      console.log('');
      console.log('');
      return;
    }

    console.log('[步骤4] 预检通过，发送真正的请求');
    response = handleActualRequest(request, config);
    console.log('');

    console.log('[步骤5] 浏览器检查实际响应的 CORS 头');
    browserCheckCORS(request, response, config);
  } else {
    // 简单请求
    console.log('[步骤2] 浏览器直接发送请求');
    response = handleActualRequest(request, config);
    console.log('');

    console.log('[步骤3] 浏览器检查响应的 CORS 头');
    browserCheckCORS(request, response, config);
  }

  console.log('');
  console.log('');
}

// ============================================================
// 测试场景
// ============================================================

// ---- 场景1：简单 GET 请求（同源允许）----
simulateCrossOriginRequest(
  '场景1：简单 GET 请求，Origin 被允许',
  {
    method: 'GET',
    headers: {
      'Origin': 'https://www.example.com',
      'Accept': 'application/json',
    },
  },
  corsConfig
);

// ---- 场景2：PUT 请求 + JSON（需要预检）----
simulateCrossOriginRequest(
  '场景2：PUT 请求 + JSON Content-Type（触发预检）',
  {
    method: 'PUT',
    headers: {
      'Origin': 'https://www.example.com',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123',
    },
  },
  corsConfig
);

// ---- 场景3：Origin 不被允许 ----
simulateCrossOriginRequest(
  '场景3：Origin 不在允许列表（跨域被拒）',
  {
    method: 'GET',
    headers: {
      'Origin': 'https://evil.com',
      'Accept': 'application/json',
    },
  },
  corsConfig
);

// ---- 场景4：自定义头触发预检 ----
simulateCrossOriginRequest(
  '场景4：GET 请求但带自定义头（触发预检）',
  {
    method: 'GET',
    headers: {
      'Origin': 'https://app.example.com',
      'X-Requested-With': 'XMLHttpRequest',
    },
  },
  corsConfig
);

// ---- 场景5：DELETE 请求 ----
simulateCrossOriginRequest(
  '场景5：DELETE 请求（触发预检）',
  {
    method: 'DELETE',
    headers: {
      'Origin': 'https://www.example.com',
      'Authorization': 'Bearer token',
    },
  },
  corsConfig
);

// ---- 验证简单请求判断逻辑 ----
console.log('====================================================');
console.log('  简单请求判断逻辑验证');
console.log('====================================================');
console.log('');

assert.strictEqual(isSimpleRequest('GET', { 'Accept': 'text/html' }), true);
console.log('✅ GET + Accept → 简单请求');

assert.strictEqual(isSimpleRequest('POST', { 'Content-Type': 'application/x-www-form-urlencoded' }), true);
console.log('✅ POST + 表单格式 → 简单请求');

assert.strictEqual(isSimpleRequest('PUT', { 'Content-Type': 'application/json' }), false);
console.log('✅ PUT 方法 → 非简单请求（需预检）');

assert.strictEqual(isSimpleRequest('POST', { 'Content-Type': 'application/json' }), false);
console.log('✅ POST + JSON → 非简单请求（Content-Type 不是简单类型）');

assert.strictEqual(isSimpleRequest('GET', { 'Authorization': 'Bearer token' }), false);
console.log('✅ GET + 自定义头 → 非简单请求（有非安全头）');

console.log('');
console.log('====================================================');
console.log('  CORS 总结');
console.log('====================================================');
console.log('');
console.log('1. 同源策略是浏览器核心安全机制，限制跨域"读响应"');
console.log('2. CORS 让服务器主动声明允许哪些源访问');
console.log('3. 简单请求：直接发，检查响应的 CORS 头');
console.log('4. 预检请求：先 OPTIONS 问一句，通过后再发真请求');
console.log('5. 带凭证(Cookie)时，Allow-Origin 不能是 *，必须指定源');
console.log('6. 生产环境推荐用反向代理让前后端同源，避免 CORS');
`
  }
];
