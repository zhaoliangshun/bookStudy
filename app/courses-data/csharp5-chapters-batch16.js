// =============================================================
// C# 从零基础到生产上线（2026 完整版）—— 第 16 批章节（专题拓展）
// -------------------------------------------------------------
// 第十九部分 安全、文本与性能专题（5 章）
// 第二十部分 生态拓展与语言演进（5 章）
// 版本基线：.NET 10 LTS / C# 14。
// 交互式 demo 保持 net8.0 / C# 12 可编译，便于旧 SDK 读者运行；
// C# 13/14 专属语法在正文中单独标注版本。
// =============================================================

export const csharp5Batch16Groups = [
  "第十九部分 安全、文本与性能专题",
  "第二十部分 生态拓展与语言演进",
];

const chapters = [
  {
    id: "csharp5-ch116",
    group: "第十九部分 安全、文本与性能专题",
    icon: "🔐",
    title: "加密与安全编码",
    content: `## 第一百一十七章　加密与安全编码

加密用错比不用更危险：错误的随机数、复用的 nonce、可比较的哈希都会制造“看起来安全”的假象。本章讲生产代码里真正会用到的密码学原语。

### 一、先建威胁模型

写代码前先回答三个问题：**要防谁？防什么？防到什么程度？** 把安全目标映射到原语：

| 需求 | 正确原语 | 错误做法 |
| --- | --- | --- |
| 密码存储 | PBKDF2 / Argon2 / bcrypt | 明文、MD5、可逆加密存密码 |
| 数据完整性 | HMAC-SHA256 | 裸 SHA256 + 拼接比较 |
| 机密传输/存储 | AES-GCM、TLS | AES-ECB、CBC 无认证 |
| 身份认证/签名 | ECDsa、RSA-PSS、JWT 签名 | 只靠 Base64“编码” |
| 随机密钥/盐 | RandomNumberGenerator | new Random()、Guid.NewGuid() |

- 保密性、完整性、真实性是三个独立目标，一个都替代不了另一个。
- 优先使用框架封装（数据保护 API、KMS），不要手搓协议。
- 攻击者不猜密码，他们拖库后离线暴力破解。

### 二、随机数：安全与统计是两条路

\`\`\`csharp
// 统计随机：模拟、洗牌、负载均衡
var dice = Random.Shared.Next(1, 7);

// 安全随机：密钥、盐、nonce、令牌
byte[] key = RandomNumberGenerator.GetBytes(32);
string token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
\`\`\`

- \`Random\` / \`Random.Shared\` 面向性能，可预测，禁止用于安全目的。
- \`Guid.NewGuid()\` 不承诺不可预测，不能当会话令牌或密码重置凭证。
- 一切“生成默认密码”“生成 API Key”的代码都必须走 \`RandomNumberGenerator\`。

### 三、哈希与 MAC

- 哈希验证**内容没变**，HMAC 验证**内容没被未授权方篡改**。
- 通用哈希（SHA256）快但可被 GPU 暴力枚举，所以**存密码必须用慢哈希**（见下节）。
- MD5、SHA1 已不安全，只可用于非安全的校验和场景，新代码一律 SHA256 起步。
- 比较 MAC 用 \`CryptographicOperations.FixedTimeEquals\`，防止按字节提前返回造成时序侧信道。

### 四、密码存储：慢哈希 + 盐 + 恒定时间比较

\`\`\`csharp
// 注册：随机盐 + PBKDF2（OWASP 建议 PBKDF2-HMAC-SHA256 ≥ 600,000 次迭代）
byte[] salt = RandomNumberGenerator.GetBytes(16);
byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
    password, salt, 600_000, HashAlgorithmName.SHA256, 32);

// 登录：同样的参数重算 + 恒定时间比较
bool ok = CryptographicOperations.FixedTimeEquals(
    Rfc2898DeriveBytes.Pbkdf2(password, salt, 600_000, HashAlgorithmName.SHA256, 32),
    hash);
\`\`\`

- 每个用户独立随机盐，防止彩虹表和跨用户批量破解。
- 迭代次数是可调成本，写进存储记录（格式如 \`pbkdf2-sha256$600000$salt$hash\`），便于未来升级。
- Argon2id（内存难解）优先于 PBKDF2，需要 NuGet 包 \`Isopoh.Cryptography.Argon2\` 或平台 KMS 提供。
- 登录失败提示不要暴露“用户不存在还是密码错误”。

### 五、对称加密：只用 AEAD（AES-GCM）

\`\`\`csharp
var aes = new AesGcm(key, tagSizeInBytes: 16);
// .NET 8 参数顺序：(nonce, plaintext, ciphertext, tag, associatedData)
aes.Encrypt(nonce, plaintext, ciphertext, tag, associatedData);
\`\`\`

- GCM 同时提供机密性与完整性；**绝不使用 ECB**（同明文块得同密文），也避免无认证的 CBC。
- 96 位 nonce 在同一 key 下**绝不能重复**：推荐每个密钥配计数器或直接随机 12 字节，重用会直接泄露明文 XOR。
- \`associatedData\` 用来绑定上下文（如请求 ID、用户 ID），改了 AAD 解密必失败。
- 密文、nonce、tag 要一起存；只存密文解不开。
- .NET 提供 \`AesGcm\`（及 CCM）；**没有**名为 \`AesGcmSiv\` 的内置类型。降低 nonce 误用靠流程（每封新 DEK / 计数器），不要编造 API。

### 六、非对称：签名与密钥封装

- **签名**（ECDsa / RSA-PSS）证明“这条消息确实由私钥持有者发出”，用于 JWT、Webhook、许可证。
- **加密**（RSA-OAEP / ECDH 派生密钥）用于交换对称密钥；大数据永远用对称加密。
- 曲线选 \`nistP256\` 起步；RSA 密钥 2048 位起步。
- 证书是“公钥 + 身份 + 有效期 + 签名链”，生产中用 \`X509Certificate2\` 加载，注意 Windows 上私钥存储与 \`Dispose\`。
- 永远先验签再处理业务；先处理再验签等于没验。

### 七、密钥管理：最大的风险不在算法

- **任何密钥都不能进 Git**：源码、配置样例、注释、测试代码都不行。误提交后唯一正确动作是立即吊销轮换，删文件没用。
- 环境变量适合开发；生产用云 KMS / Key Vault / 数据保护 API（\`IDataProtector\`），按环境与用途隔离密钥。
- 支持轮换：密钥带 ID，解密时按 ID 选 key，加密始终用最新 key。
- 日志里出现密钥、令牌、CVV、密码明文都属于事故。

### 八、AES-GCM：Nonce 绝不重复，以及密钥封装

同一把 key 下 **96 位 nonce 重复一次就会泄露明文 XOR**，这不是“概率很小”而是密码学直接失败。实践：

| 策略 | 做法 | 风险 |
| --- | --- | --- |
| 随机 12 字节 | \`RandomNumberGenerator.GetBytes(12)\` | 同一 key 加密次数须远低于 2^32 |
| 计数器 nonce | key 专属原子计数，永不回绕 | 实现不能分叉（多机需分片前缀） |
| 一 key 一密文 | 每封信用新 DEK | 最简单，配合密钥封装 |

**.NET 没有 \`AesGcmSiv\` 类型**（不要在文档里编造）。抗 nonce 误用要换算法族或换流程（每次新 DEK），而不是幻想框架替你消重。

**密钥封装（wrap）**：用 KEK（主密钥）加密 DEK（数据密钥）。信封：\`{ kid, wrappedDek, nonce, ciphertext, tag }\`。KEK 只活在 KMS / HSM / Key Vault，应用内存里只有短暂 DEK。轮换时只转封装，不必重加密全部数据（或按 kid 懒惰重封）。

### 九、数据保护、KMS、钉扎、口令胡椒

- **ASP.NET Data Protection**（\`IDataProtector\`）：Cookie、反伪、临时令牌的默认栈。密钥环按环境隔离，多实例要共享密钥环（文件系统、Redis、云 KMS），否则一台加密另一台解不开。
- **KMS / Key Vault**：应用拿到的是“加密/解密权限”，不是主密钥字节。本地开发用 User Secrets 模拟，生产禁止把主密钥放进 \`appsettings.json\`。
- **证书钉扎**：客户端校验服务端证书的公钥/SPKI，防错误 CA 被加进信任库。钉得太死会在证书轮换时全军覆没，要留备份钉或短窗口。移动端/高安全内网才值得做。
- **永远不要自研通信协议**：“AES + 自己的 HMAC + 自己的握手”几乎必有时序、填充、重放漏洞。传输用 TLS，存储用 AEAD + 已有信封格式。
- **盐 vs 胡椒**：盐是**每用户随机**、与哈希一起存，防彩虹表。胡椒是**全局秘密**（放 KMS），不进数据库；库被拖走后攻击者还缺胡椒才能离线爆破。胡椒丢失等于全部口令作废，必须可轮换（版本号写进哈希串）。

### 生产检查

1. 密码、令牌、密钥是否全部走安全随机与慢哈希？
2. 对称加密是否只用 AEAD，nonce 是否保证不重用？
3. MAC / 密码比较是否恒定时间？
4. 密钥是否在 KMS/秘密管理系统里，能否轮换，是否出现在日志与 Git？
5. 依赖的加密库是否有已知 CVE（\`dotnet list package --vulnerable\`）？
`,
    code: `using System.Security.Cryptography;
using System.Text;

// —— 1. 密码存储：PBKDF2 + 随机盐 + 恒定时间比较 ——
byte[] salt = RandomNumberGenerator.GetBytes(16);
const int Iterations = 210_000; // 演示值；生产按 OWASP 用 60 万以上并写入记录
byte[] stored = Rfc2898DeriveBytes.Pbkdf2(
    Encoding.UTF8.GetBytes("correct horse battery staple"),
    salt, Iterations, HashAlgorithmName.SHA256, outputLength: 32);

byte[] attempt = Rfc2898DeriveBytes.Pbkdf2(
    Encoding.UTF8.GetBytes("correct horse battery staple"),
    salt, Iterations, HashAlgorithmName.SHA256, outputLength: 32);
Console.WriteLine($"密码校验：{CryptographicOperations.FixedTimeEquals(attempt, stored)}");

// —— 2. HMAC：Webhook 签名校验 ——
byte[] macKey = RandomNumberGenerator.GetBytes(32);
byte[] payload = Encoding.UTF8.GetBytes("""{"orderId":1024,"amount":128.00}""");
byte[] mac = HMACSHA256.HashData(macKey, payload);
bool intact = CryptographicOperations.FixedTimeEquals(
    HMACSHA256.HashData(macKey, payload), mac);
Console.WriteLine($"HMAC 校验通过：{intact}");

// —— 3. AES-GCM：机密性 + 完整性 ——
byte[] aesKey = RandomNumberGenerator.GetBytes(32);
byte[] nonce = RandomNumberGenerator.GetBytes(12);
byte[] order = Encoding.UTF8.GetBytes("订单 1024：金额 ￥1,280.00");
var ciphertext = new byte[order.Length];
var tag = new byte[16];
using (var aes = new AesGcm(aesKey, tagSizeInBytes: 16))
{
    // 参数顺序：(nonce, plaintext, ciphertext, tag, associatedData)
    aes.Encrypt(nonce, order, ciphertext, tag, mac);
}
var decrypted = new byte[order.Length];
using (var aes = new AesGcm(aesKey, tagSizeInBytes: 16))
{
    // 参数顺序：(nonce, ciphertext, tag, plaintext, associatedData)
    aes.Decrypt(nonce, ciphertext, tag, decrypted, mac);
}
Console.WriteLine($"AES-GCM 解密：{Encoding.UTF8.GetString(decrypted)}");

// —— 4. 非对称签名：ECDsa（JWT ES256 同原理）——
using var signer = ECDsa.Create(ECCurve.NamedCurves.nistP256);
byte[] signature = signer.SignData(payload, HashAlgorithmName.SHA256);
Console.WriteLine($"验签结果：{signer.VerifyData(payload, signature, HashAlgorithmName.SHA256)}");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch117",
    group: "第十九部分 安全、文本与性能专题",
    icon: "🌐",
    title: "字符编码与本地化",
    content: `## 第一百一十八章　字符编码与本地化

乱码、emoji 被截断、用户名查重失效、多语言排序错乱——这些问题的根源都是把“文本”当成一串字节。本章把字符集、编码和本地化一次讲清。

### 一、字符集与编码：两个不同的概念

- **字符集（Unicode）**给每个字符一个编号（码位，U+0000 到 U+10FFFF）；**编码**决定码位怎么变成字节。
- UTF-8：变长 1–4 字节，ASCII 兼容，网络与存储事实标准。
- UTF-16：.NET \`string\` 内部格式，2 或 4 字节（代理对）；Windows API、Java 同源。
- UTF-32：定长 4 字节，几乎只用于特殊研究场景。

| 文本 | UTF-8 字节 | UTF-16 单元 | 码位 | 用户感知字符 |
| --- | --- | --- | --- | --- |
| A | 1 | 1 | 1 | 1 |
| 中 | 3 | 1 | 1 | 1 |
| é（组合） | 3 | 2 | 2 | 1 |
| 😀 | 4 | 2 | 1 | 1 |
| 👨‍👩‍👧‍👦 | 25 | 11 | 7 | 1 |

### 二、string 的真相：UTF-16 code unit

\`\`\`csharp
string family = "👨‍👩‍👧‍👦";
family.Length;                          // 11（code unit 数）
family.EnumerateRunes().Count();         // 7（Unicode 标量值）
new StringInfo(family).LengthInTextElements; // 1（用户感知字符）
\`\`\`

- \`Length\` 是 UTF-16 单元数：截断、反转、取子串都可能把 emoji / 组合字符切碎，产生“口一半”的乱码。
- 面向“用户感知长度”的校验（昵称限 20 字）用 \`StringInfo\`；面向“存储字节”的校验用 \`Encoding.UTF8.GetByteCount\`。
- 文本切片用 \`StringInfo.SubstringByTextElements\` 或 \`Rune\` 遍历，不要直接 \`Substring\`。
- 比较协议字段、字典键、枚举名用 \`Ordinal\` / \`OrdinalIgnoreCase\`；面向用户的排序才用 culture。

### 三、Encoding 与 BOM

\`\`\`csharp
byte[] bytes = Encoding.UTF8.GetBytes("支付 ¥128");
string text = Encoding.UTF8.GetString(bytes);

// 严格模式：拒绝非法字节，而不是替换成 U+FFFD
var strict = new UTF8Encoding(false, throwOnInvalidBytes: true);
\`\`\`

- BOM（\`EF BB BF\`）帮解码器识别 UTF-8，但会给 JSON、CSV 第一列、哈希校验带来“看不见的脏字节”：**协议数据不要带 BOM**，文件交换可保留。
- 处理外部输入（上传的 CSV、第三方回调）用严格解码，把脏数据在边界拦下。
- 流式解码大文件用 \`Encoding.GetDecoder()\`，避免在块边界切碎多字节字符。
- 网络协议、日志、管道统一声明 UTF-8；数据库用 \`utf8mb4\`（MySQL）或正确的 collation，否则 emoji 存不进去。

### 四、规范化：视觉相同 ≠ 位相同

\`\`\`csharp
string a = "é";        // U+00E9 单码位
string b = "e\\u0301"; // e + 组合重音
a == b;                 // false
a.Normalize() == b.Normalize(); // true（FormC）
\`\`\`

- 用户名去重、搜索索引、幂等键生成前先 \`Normalize(NormalizationForm.FormC)\`。
- 土耳其语 i/İ、德语 ß/ss：大小写转换因 culture 而异，协议场景用 \`ToUpperInvariant\`。
- 两个“看起来一样”的名字可能是不同码位（同形字符），安全敏感场景要额外策略。

### 五、本地化资源：resx 与回退链

\`\`\`xml
<!-- Resources.zh-CN.resx -->
<data name="OrderCreated" xml:space="preserve">
  <value>订单 {0} 已创建</value>
</data>
\`\`\`

- 文案不写死在代码里：\`ResourceManager\` 或 ASP.NET Core 的 \`IStringLocalizer\` 按请求 culture 取值。
- 回退链 \`zh-CN → zh → 默认语言\`：翻译缺失时降级而不是崩溃。
- 数字、日期、货币在展示边界用 \`CultureInfo\` 格式化；内部存储与传输保持 invariant。
- 复数、语序因语言而异，不要拼接句子，用带占位符的完整模板。

### 六、生产实践

- 所有入口（HTTP、文件、队列）显式声明编码，别依赖系统默认值。
- 长度限制分清是“字节”还是“文本元素”，数据库字段按字节算。
- 测试集里放 emoji、组合字符、中日韩、RTL 文本，尽早暴露截断与排序 bug。
- 日志与监控的编码和长度截断策略要一致，否则排障时看到的是“二次乱码”。

### 七、UTF-8 BOM、GetBytes 与 Utf8

\`Encoding.UTF8\` 的 \`GetPreamble()\` 是 \`EF BB BF\`。\`new UTF8Encoding(encoderShouldEmitUTF8Identifier: true)\` 写文件会带 BOM；\`Encoding.UTF8\` 静态实例**会**在 \`GetPreamble()\` 给出 BOM，但 \`GetBytes\` **不自动**加 BOM——BOM 是写文件时 \`StreamWriter\` / \`WriteAllText\` 的行为差异点。JSON、HTTP 正文、哈希输入不要带 BOM，否则第一个键变成 \`\\uFEFF{\` 或签名对不上。

| API | 用途 | 注意 |
| --- | --- | --- |
| \`Encoding.UTF8.GetBytes / GetString\` | 通用托管堆分配 | 非法字节默认替换为 U+FFFD |
| \`new UTF8Encoding(false, true)\` | 严格边界 | 非法序列抛 \`DecoderFallbackException\` |
| \`Encoding.UTF8.GetByteCount\` | 先算长度再租缓冲 | 与 \`GetBytes\` 必须同一 Encoding 实例 |
| \`System.Text.Unicode.Utf8\`（.NET 8+） | \`TryFromUtf16\` / \`TryToUtf16\` 无异常路径 | 适合热路径、Span 友好 |
| \`Rune\` / \`EnumerateRunes\` | 标量值遍历 | 仍不是用户感知“字符” |

### 八、文本元素、ICU 与语言标签

- \`StringInfo\` / \`TextElementEnumerator\` 按 **Grapheme**（用户感知字符）切；昵称长度、光标移动用它，不要用 \`Length\`。
- **ICU vs NLS**：.NET 5+ 在非 Windows 用 ICU 做 culture；Windows 上 .NET 5+ 也可切 ICU（\`System.Globalization.UseNls\`）。排序、大小写、日历在 ICU 与旧 NLS 上**结果会不同**。服务器与开发机必须同一全球化栈，否则索引键对不上。
- \`CultureInfo.IetfLanguageTag\`（如 \`zh-CN\`、\`en-US\`）才是 BCP-47 标签；\`Name\` 多数时候相同，但写 HTTP \`Accept-Language\`、\`Content-Language\`、资源文件后缀时用 IETF 标签。
- 资源文件：\`Resources.resx\`（中性）+ \`Resources.zh-CN.resx\`。卫星程序集按 \`CurrentUICulture\` 回退。改 resx 后要确认生成的 \`Designer\` 与 \`IStringLocalizer\` 键一致。不要用 culture 去比较协议枚举。

### 生产检查

1. 字符串截断与长度校验是否区分 code unit、码位、文本元素？
2. 外部输入是否严格解码并统一 UTF-8？
3. 键比较与协议字段是否全部 Ordinal？
4. 需要去重的文本是否做了规范化？
5. UI 文案是否全部资源化并验证过回退链？
`,
    code: `using System.Globalization;
using System.Text;

// —— 1. string 的真相：UTF-16 code unit ≠ 字符 ——
string family = "👨‍👩‍👧‍👦"; // ZWJ 连接的家庭 emoji
Console.WriteLine($"family.Length = {family.Length}（UTF-16 单元）");
Console.WriteLine($"Unicode 标量值 = {family.EnumerateRunes().Count()}");
Console.WriteLine($"用户感知字符 = {new StringInfo(family).LengthInTextElements}");

// —— 2. 编码体积对比 ——
string payment = "支付成功 ¥1,280.00";
byte[] utf8 = Encoding.UTF8.GetBytes(payment);
byte[] utf16 = Encoding.Unicode.GetBytes(payment);
Console.WriteLine($"UTF-8：{utf8.Length} 字节；UTF-16：{utf16.Length} 字节");
Console.WriteLine($"带 BOM 的 UTF-8：{Encoding.UTF8.GetPreamble().Length + utf8.Length} 字节");

// —— 3. 严格解码：拒绝脏数据 ——
var strict = new UTF8Encoding(false, throwOnInvalidBytes: true);
try
{
    _ = strict.GetString([0xC3, 0x28, 0x41]); // 0xC3 0x28 不是合法 UTF-8 序列
    Console.WriteLine("严格解码：意外通过");
}
catch (DecoderFallbackException)
{
    Console.WriteLine("严格解码：非法字节序列已被拒绝");
}

// —— 4. 规范化：视觉相同 ≠ 位相同 ——
string composed = "é";          // U+00E9
string decomposed = "e\\u0301"; // e + U+0301 组合重音
Console.WriteLine($"规范化前相等：{composed == decomposed}");
Console.WriteLine($"FormC 规范化后相等：{composed.Normalize(NormalizationForm.FormC) == decomposed.Normalize(NormalizationForm.FormC)}");

// —— 5. 按文本元素截断，避免切碎 emoji ——
string nickname = "小明😀上线啦";
var info = new StringInfo(nickname);
string clipped = info.SubstringByTextElements(0, Math.Min(4, info.LengthInTextElements));
Console.WriteLine($"安全截断：{clipped}");
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch118",
    group: "第十九部分 安全、文本与性能专题",
    icon: "⚡",
    title: "PLINQ 与数据并行",
    content: `## 第一百一十九章　PLINQ 与数据并行

多核不会自动让你的 \`foreach\` 变快。并行是显式设计决策：先确认瓶颈是 CPU、数据量够大、任务可分块，再动手。

### 一、什么时候值得并行

- **CPU 密集**：纯计算（校验、加密、解析、评分）才受益；IO 密集请用异步而不是并行。
- **数据量**：几千条以下，并行调度开销可能超过收益。
- **可分块**：数据能切块独立处理，无共享可变状态。
- 阿姆达尔定律：串行占比 20% 的程序，理论上限只有 5 倍加速。

### 二、AsParallel 基础

\`\`\`csharp
long count = numbers.AsParallel()
    .WithDegreeOfParallelism(Environment.ProcessorCount)
    .Count(IsPrime);
\`\`\`

- \`AsParallel()\` 让后续 LINQ 算子并行执行；结果正确性与串行一致。
- 默认并行度等于逻辑核心数；\`WithDegreeOfParallelism\` 在与其它负载共享机器时手动限流。
- \`AsOrdered()\` 保持输出顺序，但有合并与重排成本；不需要顺序就别加。
- PLINQ 内部对副作用为零的操作安全；有副作用的 lambda 会引入竞态。

### 三、合并策略与 ForAll

- \`WithMergeOptions\`：\`NotBuffered\`（流式出结果）、\`AutoBuffered\`（默认）、\`FullyBuffered\`（全部算完再输出）。
- 只需要副作用不需要结果时用 \`ForAll\`，跳过合并阶段，开销最小。
- 短小委托会放大调度成本；先让单个元素的工作量足够大（分块处理）再并行。

### 四、线程安全聚合

\`\`\`csharp
long sum = numbers.AsParallel().Aggregate(
    seed: 0L,
    updateAccumulatorFunc: (local, value) => local + value,
    combineAccumulatorsFunc: (left, right) => left + right,
    resultSelector: total => total);
\`\`\`

- 聚合是并行 LINQ 的正确“累加”方式：每个分区先局部累加，最后合并，无锁。
- \`Sum\`、\`Average\`、\`Count\` 等内置算子已做线程安全处理。
- 自己写共享变量 + \`lock\` 会把并行退化成串行。
- 高频计数用 \`Interlocked.Increment\`；汇总结构用 \`ConcurrentDictionary\` 的 \`AddOrUpdate\`。

### 五、分区：并行性能的杠杆

\`\`\`csharp
var partitioner = Partitioner.Create(source, EnumerablePartitionerOptions.NoBuffering);
var result = partitioner.AsParallel().Select(Expensive).ToArray();
\`\`\`

- \`Partitioner.Create(range)\` 区间分区：元素数量大、代价均匀时最快（无同步开销）。
- 元素代价不均（比如有的请求 1ms 有的 500ms）用动态/块分区，避免长尾任务拖死一个线程。
- \`Parallel.ForEach\` + 自定义分区器是 PLINQ 之外的补充工具，适合“处理 + 副作用”场景。

### 六、取消、异常与禁忌

- 取消：\`WithCancellation(token)\`，其他分区的未启动工作会被跳过。
- 异常：并行查询抛出 \`AggregateException\`（多个分区同时炸），用 \`Flatten()\` 处理。
- **不要并行做 IO**：64 个并行磁盘读会互相踩踏，IO 并发用 \`async\` + \`SemaphoreSlim\` 限流。
- 不要在并行 lambda 里更新共享 \`List<T>\`、\`Dictionary\`、非线程安全缓存。

### 七、MergeOptions、AsOrdered 成本与取消

| \`ParallelMergeOptions\` | 行为 | 适用 |
| --- | --- | --- |
| \`AutoBuffered\` | 默认，成批交出 | 大多数查询 |
| \`NotBuffered\` | 一出结果就给消费者 | 要尽快看到首条 |
| \`FullyBuffered\` | 全算完再合并 | 需要完整排序/聚合后再枚举 |

\`AsOrdered()\` 让输出顺序与输入一致，但分区必须**缓冲并重排**，常常吃掉大半加速。只要业务不依赖顺序（计数、求和、写无序日志）就不要加。\`AsSequential()\` 可在查询后半段回到串行（例如已过滤到很小的集合再 \`Take\`）。

取消用 \`WithCancellation(token)\`，并保证委托里的 IO/循环也观察同一 token。只取消外层枚举、委托还在跑，分区线程会拖到自己结束。

### 八、分区、ParallelOptions、不要并行 IO

- \`Partitioner.Create(from, to)\`：范围分区，均匀 CPU 任务最快。
- \`Partitioner.Create(source, EnumerablePartitionerOptions.NoBuffering)\`：流式/未知长度，避免预缓冲爆内存。
- \`Parallel.ForEach(source, new ParallelOptions { MaxDegreeOfParallelism = n, CancellationToken = ct }, body)\`：要副作用时比 PLINQ 更直接。\`MaxDegreeOfParallelism\` 默认 ≈ 逻辑核心；与 ASP.NET 共享进程时建议设小，避免饿死请求线程。

**PLINQ / \`Parallel.ForEach\` 不适合 IO。** 64 个并行 \`HttpClient.GetAsync\` 或磁盘读会打满套接字/磁盘队列。IO 用 \`async\` + \`SemaphoreSlim\` 限流。并行 lambda **必须线程安全**：不碰 \`List.Add\`、不读可变字典；局部变量用分区聚合再合并。捕获外部 \`List<T>\` 是竞态，不是“看起来能跑”。

### 九、对照：什么时候不该上 PLINQ

| 场景 | 该用 | 原因 |
| --- | --- | --- |
| CPU 素数/哈希/图像块 | PLINQ / \`Parallel.For\` | 可分块、无共享写 |
| 每元素 1µs 的小循环 | 串行 | 调度成本 > 收益 |
| HTTP / SQL / 文件 | \`async\` + 限流 | 并行只增加等待者 |
| 必须保序的流水线 | 串行或 \`AsOrdered\` 并测量 | 重排可能慢过单核 |
| ASP.NET 请求线程里 | 谨慎，限制 DOP | 与请求抢线程池 |

\`WithExecutionMode(ParallelExecutionMode.ForceParallelism)\` 会忽略“数据太小就串行”的启发式，只在你测过之后用。异常用 \`AggregateException.Flatten()\`，不要只 \`catch (Exception)\` 以为只有一个内层。

调试时用 \`WithDegreeOfParallelism(1)\` 临时回到确定性顺序；发布测量必须在 Release、不附加调试器。阿姆达尔定律：串行收尾（写文件、打日志）占比一大，核再多也快不了。

线程安全再强调：\`ConcurrentDictionary.AddOrUpdate\` 的委托可能运行多次，必须无副作用。\`lock\` 包住整个并行体等于没并行。读只读快照（第一百二十章 Frozen/Immutable）比在 lambda 里加锁更干净。取消令牌要一直传到最内层循环；只取消外层 \`GetEnumerator\` 时，已开工的分区仍会跑完当前元素。

### 生产检查

1. 瓶颈是否经过测量确认是 CPU？数据量与单元素成本是否够大？
2. 并行 lambda 是否做到无共享可变状态？聚合是否用局部合并模式？
3. 是否需要顺序（AsOrdered）与取消（WithCancellation）？
4. 异常处理是否覆盖 AggregateException？
5. 上线前是否对比过串行与并行的真实耗时（Release 构建）？
`,
    code: `using System.Diagnostics;

int[] numbers = Enumerable.Range(2, 1_000_000).ToArray();

// —— 1. 串行基准 ——
var sw = Stopwatch.StartNew();
long sequential = numbers.Count(IsPrime);
sw.Stop();
Console.WriteLine($"串行：{sequential:N0} 个素数，耗时 {sw.ElapsedMilliseconds} ms");

// —— 2. PLINQ 并行 ——
sw.Restart();
long parallel = numbers.AsParallel()
    .WithDegreeOfParallelism(Environment.ProcessorCount)
    .Count(IsPrime);
sw.Stop();
Console.WriteLine($"并行：{parallel:N0} 个素数，耗时 {sw.ElapsedMilliseconds} ms（核心数 {Environment.ProcessorCount}）");

// —— 3. AsOrdered：保持顺序（注意有合并成本）——
int[] firstTen = numbers.AsParallel().AsOrdered()
    .Where(IsPrime).Take(10).ToArray();
Console.WriteLine($"前 10 个素数：{string.Join(" ", firstTen)}");

// —— 4. 线程安全聚合：局部累加 + 最终合并，无锁 ——
long sum = numbers.AsParallel().Aggregate(
    seed: 0L,
    updateAccumulatorFunc: (local, value) => local + value,
    combineAccumulatorsFunc: (left, right) => left + right,
    resultSelector: total => total);
long expected = (long)numbers.Length * (numbers.Length + 3) / 2; // 2..1_000_001 等差数列求和
Console.WriteLine($"并行求和：{sum:N0}，校验 {sum == expected}");

static bool IsPrime(int number)
{
    if (number < 2) return false;
    if (number % 2 == 0) return number == 2;
    int limit = (int)Math.Sqrt(number);
    for (int divisor = 3; divisor <= limit; divisor += 2)
    {
        if (number % divisor == 0) return false;
    }
    return true;
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch119",
    group: "第十九部分 安全、文本与性能专题",
    icon: "🧊",
    title: "不可变集合与对象池",
    content: `## 第一百二十章　不可变集合与对象池

两类工具解决同一个问题的两面：**不可变**消灭“共享状态被改坏”的错误，**池化**消灭“重复分配同一形状对象”的 GC 压力。

### 一、共享可变状态的代价

缓存放个 \`List<T>\`、配置存个 \`Dictionary\`，读写一并发就出鬼问题：枚举时被改、读到半初始化状态、防御性复制到处开花。策略：

- 初始化后不再变 → 不可变集合快照。
- 高频创建又丢弃 → 对象池复用。

### 二、Immutable 系列：安全共享快照

\`\`\`csharp
ImmutableArray<string> currencies = ImmutableArray.Create("USD", "EUR");
ImmutableArray<string> extended = currencies.Add("CNY"); // 返回新实例，currencies 不变
\`\`\`

- \`ImmutableArray\` / \`ImmutableList\` / \`ImmutableDictionary\` / \`ImmutableHashSet\`：修改返回新集合，底层**结构共享**避免整棵复制。
- 频繁修改用 \`CreateBuilder()\`，最后 \`ToImmutable()\` 一次固化；在循环里反复 \`Add\` 会累积 O(n) 快照链。
- 语义陷阱：\`ImmutableList[index]\` 是 O(log n) 而不是数组 O(1)；随机访问多就选 \`ImmutableArray\`。
- 把不可变快照作为公共属性 / 缓存返回值，调用方想改只能复制，竞态从类型系统层面消失。

### 三、Frozen 集合（.NET 8+）：只读高频查询

\`\`\`csharp
FrozenDictionary<string, Rate> rates = dictionary.ToFrozenDictionary();
\`\`\`

- 构建慢（编译查询策略），**读取快于普通 Dictionary 与 ImmutableDictionary**，适合“启动建一次、进程内查百万次”的引用数据。
- 真正不可变：适合跨线程共享、AOT 与裁剪场景。
- 反模式：运行期频繁重建 Frozen 集合，冻结构造成本会吃掉收益。

### 四、ArrayPool：缓冲区复用

\`\`\`csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);
try
{
    // 使用 buffer[0..actualLength]，注意 buffer.Length >= 请求长度
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: containsSensitiveData);
}
\`\`\`

- \`Rent(n)\` 返回**长度不小于 n** 的数组（按 2 的幂对齐），实际长度可能更大：所有代码必须显式传递“有效长度”。
- 归还后**禁止再持有引用**：归还进池的数组随时会被别人租走，这是 use-after-return 事故的头号来源。
- 含敏感数据的缓冲归还时 \`clearArray: true\`，别把密码留在池里。
- 高层 API：\`MemoryPool<T>\`（租 \`IMemoryOwner<T>\`，Dispose 即归还）、\`System.IO.Pipelines\`（内部就是池化）。

### 五、对象池模式

\`\`\`csharp
public sealed class Pool<T>(int capacity) where T : class, new()
{
    private readonly ConcurrentBag<T> _items = new();
    public T Rent() => _items.TryTake(out T? item) ? item : new T();
    public void Return(T item) { if (_items.Count < capacity) _items.Add(item); }
}
\`\`\`

- 适合\`StringBuilder\`、大缓冲、数据库连接（连接池是同一思想）。
- \`Microsoft.Extensions.ObjectPool\`（NuGet）提供策略化池：\`DefaultObjectPoolProvider\` + 自定义 \`IPooledObjectPolicy\`。
- 池对象契约：\`Return\` 前重置状态；归还后调用方不得再用；容量有上限，防止池变成泄漏点。
- ASP.NET Core 内部大量使用对象池复用请求对象，这是它吞吐高的原因之一。

### 六、先测量再池化

- 池化提高吞吐但增加代码复杂度：先看 GC 统计（Gen0/Gen2 频率、分配速率）确认瓶颈真是分配。
- 用 BenchmarkDotNet 对比池化前后，Release + 多次运行。
- 大多数业务代码不需要手写池；优先依赖框架的内置池化。

### 七、ImmutableInterlocked 与 Frozen vs Immutable

跨线程发布新快照用 \`ImmutableInterlocked\`，不要自己 \`lock\` + 换引用却漏掉内存屏障语义：

\`\`\`csharp
ImmutableDictionary<string, int> map = ImmutableDictionary<string, int>.Empty;
ImmutableInterlocked.AddOrUpdate(ref map, "usd", 1, (_, v) => v + 1);
ImmutableInterlocked.Update(ref map, m => m.Remove("usd"));
\`\`\`

| | Immutable* | Frozen*（.NET 8+） |
| --- | --- | --- |
| 修改 | 返回新实例，可持续演进 | 构造后不能改，只能整表重建 |
| 读取 | 良好，字典偏慢 | 为只读查询特化，通常更快 |
| 构建成本 | 低（结构共享） | 高（编译查找策略） |
| 场景 | 配置热更新、事件溯源快照 | 启动加载的码表、功能开关表 |

选错的典型：热路径每秒 \`ToFrozenDictionary()\`，或把 Frozen 当可变缓存用。

### 八、ArrayPool 归还纪律与 ObjectPool

1. \`Rent(n)\` 的 \`Length >= n\`，只用 \`[..written]\`，禁止 \`buffer.Length\` 当有效长度。
2. \`Return\` 后引用作废；异步回调里收尾必须经过 \`try/finally\`，成功路径和异常路径都要还。
3. 敏感数据 \`clearArray: true\`；大数组清零也有成本，非密钥缓冲可 false。
4. 不要 \`Rent\` 之后 \`Array.Resize\`（那是新数组，原租约泄漏）。
5. 池满时 \`Return\` 仍应调用（实现会丢掉超额），调用方无资格“先攒着”。

\`Microsoft.Extensions.ObjectPool\` 的 \`DefaultObjectPool<T>\` + \`IPooledObjectPolicy<T>\`：\`Create\` / \`Return\` 里重置。ASP.NET 用它复用 \`StringBuilder\`、编码器。自己写 \`ConcurrentBag\` 池要有容量上限，否则泄漏对象会永远占着代。

### 九、先测量

用 \`dotnet-counters\` / BenchmarkDotNet 看 **Gen0 分配速率** 和 P99。池化后分配下降但 P99 变差（锁、错还）就要回退。没有数字就不要上池。

对比清单：同一输入、Release、多次迭代；记录分配字节/op 与 Gen2 次数。池化只应在“高频、同形状、生命周期短于请求”时引入。配置表、功能开关用 Frozen/Immutable 快照，不要用池。跨线程发布新 Immutable 快照用 \`ImmutableInterlocked.Update\`，不要 \`volatile\` 手写还漏掉替换失败重试。ArrayPool 归还后若异步延续仍写入原数组，就是 use-after-return，这类 bug 只在负载下出现。

### 生产检查

1. 跨线程共享的集合是否为不可变 / Frozen 快照？
2. 池化对象是否有“归还即失效”的纪律与容量上限？
3. ArrayPool 使用是否显式传有效长度、敏感数据是否清零归还？
4. 池化决策是否基于分配剖析与基准，而不是直觉？
`,
    code: `using System.Buffers;
using System.Collections.Frozen;
using System.Collections.Immutable;
using System.Text;

// —— 1. ImmutableArray：返回新快照，原集合不变 ——
ImmutableArray<string> currencies = ImmutableArray.Create("USD", "EUR", "JPY");
ImmutableArray<string> extended = currencies.Add("CNY");
Console.WriteLine($"原快照 {currencies.Length} 项（不变），扩展后 {extended.Length} 项");

// —— 2. FrozenDictionary：启动建一次，进程内高频查 ——
FrozenDictionary<string, decimal> rates = new Dictionary<string, decimal>
{
    ["USD"] = 7.24m,
    ["EUR"] = 7.86m,
    ["JPY"] = 0.048m,
}.ToFrozenDictionary();
Console.WriteLine($"USD 汇率：{(rates.TryGetValue("USD", out decimal usd) ? usd : 0m)}");

// —— 3. ArrayPool：租借/归还 + 有效长度纪律 ——
byte[] buffer = ArrayPool<byte>.Shared.Rent(4 * 1024);
try
{
    byte[] payload = Encoding.UTF8.GetBytes("PUT /orders/1024 HTTP/1.1");
    payload.CopyTo(buffer, 0);
    Console.WriteLine($"租借 {buffer.Length} 字节（请求 4096，实际对齐），写入 {payload.Length} 字节");
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
}

// —— 4. 手写对象池：StringBuilder 复用 ——
var builderPool = new StringBuilderPool(capacity: 2);
var builder = builderPool.Rent();
builder.Append("order-").Append(1024);
Console.WriteLine($"拼装结果：{builder}");
builderPool.Return(builder);
var reused = builderPool.Rent();
Console.WriteLine($"池中取出的对象已重置：长度 {reused.Length}，可用 {builderPool.Available}");

public sealed class StringBuilderPool(int capacity)
{
    private readonly Stack<StringBuilder> _items = new(capacity);
    public int Available => _items.Count;

    public StringBuilder Rent() => _items.Count > 0 ? _items.Pop() : new StringBuilder(64);

    public void Return(StringBuilder builder)
    {
        builder.Clear(); // 归还前重置状态
        if (_items.Count < capacity)
        {
            _items.Push(builder);
        }
    }
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch120",
    group: "第十九部分 安全、文本与性能专题",
    icon: "📦",
    title: "二进制序列化与高性能协议",
    content: `## 第一百二十一章　二进制序列化与高性能协议

JSON 可读、通用、够快——直到吞吐、体积或延迟成为硬指标。内部服务间通信、缓存、日志管道常常换成二进制格式，这一章讲清选型与手写协议的底层原理。

### 一、什么时候值得二进制

- 内部服务每秒几十万条消息：JSON 解析 CPU、字符串分配、HTTP 头都是成本。
- 缓存 / 消息队列载荷：体积直接决定带宽与内存成本。
- 高频日志与追踪：编码速度优先于可读性（人类只在排障时看，先序列化到文件再说）。
- **不要过早优化**：外部 API、低频管理接口继续用 JSON；二进制收益要靠基准证明。

### 二、格式选型

| 格式 | Schema | 体积 | 速度 | 典型场景 |
| --- | --- | --- | --- | --- |
| MessagePack | 可选 | 小 | 快 | 通用 RPC、缓存 |
| Protocol Buffers | 必须（.proto） | 小 | 快 | gRPC、跨语言契约 |
| MemoryPack | C# 类型 | 极小 | 极快 | 纯 C# 内部通信 |
| CBOR | 可选 | 小 | 快 | IETF 标准、IoT |
| BSON | 无 | 中 | 中 | MongoDB 传统格式 |
| FlatBuffers | 必须 | 小 | 零拷贝读取 | 游戏、嵌入式 |
| System.Text.Json | 无 | 大 | 中 | 外部 API（对照项） |

- protobuf 的优势是**契约先行**：字段号机制天然支持前后兼容，跨语言生成代码。
- MemoryPack（Cysharp 出品）利用 C# 类型内存布局直接拷贝，最快但绑定 .NET。
- 选型要点：是否跨语言、是否需要 schema 演进、是否需要零拷贝读。

### 三、手写 TLV：理解协议设计

\`\`\`
帧 = [名称长度:1 字节][名称 UTF-8][数量:int32 大端][金额:float32 大端]
\`\`\`

- **端序**：网络协议惯例大端（BigEndian）；x86 CPU 是小端。跨机器传输必须固定端序，\`BinaryPrimitives.WriteInt32BigEndian\` 一类 API 明确表达意图。
- **长度前缀**比分隔符（如换行）稳健：内容里出现分隔符不需要转义。
- **varint**（protobuf）：小数字 1 字节，大数字最多 5 字节，配合 zigzag 编码负数。
- 每个字段先想清楚“未来加字段怎么办”：留版本号、未知字段跳过、缺省值语义。

### 四、System.Buffers 实践

- \`BinaryPrimitives\`：明确端序的读写，替代 \`BitConverter\`（后者端序依赖平台）。
- \`ArrayBufferWriter<T>\`：实现 \`IBufferWriter<T>\`，序列化器按需扩容，避免猜大小。
- \`ReadOnlySequence<T>\` 配合 \`SequenceReader<T>\`：跨多个缓冲区流式解析（Pipelines 的基础类型）。
- \`stackalloc\` 小缓冲：几百字节内的临时空间走栈，零 GC。

### 五、兼容演进

- 加字段：新代码写、旧代码必须能跳过（protobuf 用字段号 + wire type 跳过未知块）。
- 删字段：保留字段号不复用，避免新旧语义冲突。
- 改类型：新增字段比修改类型安全（int32 → int64 用新字段号）。
- 契约变更必须有**前后兼容测试**：用旧版本序列化的样本喂新版本反序列化，反之亦然，样本入库。

### 六、安全：不可信输入是攻击面

- **长度上限**：读取长度前缀后先校验 \`length <= maxAllowed\`，否则一个 \`0x7FFFFFFF\` 就能让你分配 2GB。
- **深度与循环引用**：嵌套结构限制深度，反序列化炸弹（Quadratic Blowup）是真实攻击。
- **资源耗尽**：解析循环里检查总消耗（字节预算 / 时间预算），超限丢弃。
- 绝不反序列化可执行语义（旧 \`BinaryFormatter\` 已被淘汰并标记不安全，.NET 8+ 直接抛异常）。
- 验签在解析之前：先校验 MAC/签名，再做重活。

### 七、MemoryPack / MessagePack / protobuf / 文本 JSON

| | MemoryPack | MessagePack | protobuf | System.Text.Json |
| --- | --- | --- | --- | --- |
| Schema | C# 类型 | 可选契约 | \`.proto\` 字段号 | 无 / JSON schema |
| 跨语言 | 弱 | 强 | 最强 | 最强 |
| 速度/体积 | 极快 / 极小 | 快 / 小 | 快 / 小 | 中 / 大 |
| 演进 | 靠版本头或标注 | 键可加 | 字段号天然兼容 | 加属性较容易 |
| 适用 | 纯 .NET 内网、缓存 | 通用 RPC、队列 | gRPC、对外契约 | 外部 HTTP API |

**Utf8Json**（neuecc 旧库）曾是最快 JSON 之一，现已停更；新代码用 \`System.Text.Json\` 或二进制库，不要新引 Utf8Json。二进制赢在少分配、少转义、定长数字；可读性与生态输给 JSON。先基准再换。

**端序**：多字节整数必须固定。网络惯例大端；\`BitConverter\` 跟 CPU，x86 小端，跨机必炸。一律 \`BinaryPrimitives\`。

**版本**：帧头加 \`version:uint8\`。未知主版本拒绝；次版本可跳过尾部扩展。protobuf 靠字段号，不要复用已删编号。

### 八、BinaryFormatter 已禁止

\`BinaryFormatter\` 能实例化任意类型、跑构造与回调，是 RCE 面。**.NET 5 起默认禁用，.NET 8 调用即抛。** 禁止 \`EnableUnsafeBinaryFormatterSerialization\`。历史 \`.bin\` 用一次性离线工具迁到 MessagePack / JSON。\`NetDataContractSerializer\`、旧 \`SoapFormatter\` 同样不要复活。

### 九、手写协议还要记住的坑

- 长度前缀读到之后**先比较上限再分配**。\`int.MaxValue\` 当长度是经典 OOM。
- 文本字段先写字节数再写 UTF-8，不要写 \`char\` 数（组合字符、emoji 对不上）。
- 浮点用整数分或 decimal 的约定刻度；\`float\` 跨语言尾数不同。
- 枚举用稳定整数，不要用 \`ToString()\` 进二进制契约。
- 与 JSON 混用时：对外 HTTP 继续 \`System.Text.Json\`（源生成、大小写策略）；内部队列才上 MessagePack。两套模型用同一 record，避免“JSON 一份、二进制一份”字段漂移。

版本兼容测试：把 v1 样本放进仓库，每次升级编解码器都跑往返。这比看文档更管用。

对外 HTTP 继续 JSON：调试、网关、浏览器都认 \`application/json\`。内部队列/缓存才值得上 MessagePack 或 MemoryPack。gRPC 默认 protobuf，不要再包一层 JSON。三种同时存在时，用同一组 record + 源生成，禁止“JSON DTO 一份、二进制 DTO 一份”各自演化。

端序检查表：协议文档写死 BigEndian；单测在小端机器上用已知字节 \`00 00 00 2A\` 断言读出 42。\`BitConverter.IsLittleEndian\` 只能用来断言环境，不能用来决定线上编码。

\`BinaryFormatter\` 再强调一次：新代码路径出现它就是缺陷，CodeQL / 分析器应直接失败构建。迁移存量 \`.bin\` 用一次性控制台工具，输出 MessagePack 或 JSON，不要在热路径保留“兼容开关”。

选型口诀：跨语言 + 要演进 → protobuf；纯 .NET 极致吞吐 → MemoryPack；队列/缓存通用 → MessagePack；给人看的 API → System.Text.Json。把 JSON 当“临时二进制”gzip 一下通常仍比不过专门格式，但也先测再换。

### 生产检查

1. 二进制化的收益是否有基准数据支撑（体积、P99 延迟、CPU）？
2. 解码器是否对所有长度做了上限校验与资源预算？
3. 契约演进是否有旧样本回归测试？
4. 是否固定端序与版本号？
`,
    code: `using System.Buffers.Binary;
using System.Text;

// 协议：[名称长度:1][名称 UTF-8][数量:int32 大端][金额:float32 大端]
byte[] packet = Encode(new Order("membership", 3, 128.50f));
Console.WriteLine($"编码后 {packet.Length} 字节（JSON 表示约 46 字节）");
Order decoded = Decode(packet);
Console.WriteLine($"往返一致：{decoded == new Order("membership", 3, 128.50f)}");

// 截断的包必须被拒绝，而不是读出垃圾
try
{
    _ = Decode(packet[..^8]);
    Console.WriteLine("截断包：意外解码成功（这是 bug）");
}
catch (ArgumentOutOfRangeException)
{
    Console.WriteLine("截断包已被拒绝：解码器校验了长度");
}

static byte[] Encode(Order order)
{
    byte[] name = Encoding.UTF8.GetBytes(order.Name);
    var packet = new byte[1 + name.Length + 4 + 4];
    packet[0] = (byte)name.Length;
    name.CopyTo(packet, 1);
    BinaryPrimitives.WriteInt32BigEndian(packet.AsSpan(1 + name.Length), order.Quantity);
    BinaryPrimitives.WriteSingleBigEndian(packet.AsSpan(1 + name.Length + 4), order.Amount);
    return packet;
}

static Order Decode(byte[] packet)
{
    if (packet.Length < 5)
    {
        throw new ArgumentOutOfRangeException(nameof(packet), "包太短");
    }
    int nameLength = packet[0];
    if (packet.Length < 1 + nameLength + 8)
    {
        throw new ArgumentOutOfRangeException(nameof(packet), "长度字段与实际包长不符");
    }
    string name = Encoding.UTF8.GetString(packet, 1, nameLength);
    int quantity = BinaryPrimitives.ReadInt32BigEndian(packet.AsSpan(1 + nameLength));
    float amount = BinaryPrimitives.ReadSingleBigEndian(packet.AsSpan(1 + nameLength + 4));
    return new Order(name, quantity, amount);
}

public sealed record Order(string Name, int Quantity, float Amount);
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch121",
    group: "第二十部分 生态拓展与语言演进",
    icon: "🧩",
    title: "插件架构与程序集隔离",
    content: `## 第一百二十二章　插件架构与程序集隔离

插件化让系统在不重新部署宿主的情况下扩展能力：报表插件、网关中间件、IDE 扩展、脚本任务。.NET 的载体是 \`AssemblyLoadContext\`（ALC），.NET Framework 时代的 AppDomain 已退役。

### 一、为什么插件化，以及它的成本

- **收益**：崩溃隔离、独立版本演进、开放给第三方、按需加载省内存。
- **成本**：契约版本管理、依赖冲突、调试复杂度、安全边界。多数系统只需要“功能开关 + 内置模块”，先确认真的需要插件再上架构。

### 二、契约设计：插件系统的地基

\`\`\`csharp
// Contracts.csproj —— 独立的抽象程序集，只放接口与 DTO
public interface IReportPlugin
{
    string Name { get; }
    Task<Report> RenderAsync(ReportRequest request, CancellationToken ct);
}
\`\`\`

- 契约程序集**只含接口和不可变 DTO**，不引第三方依赖，版本尽量稳定。
- 契约用 SemVer：补丁兼容、次版本加功能、主版本破坏兼容并触发宿主适配层。
- DTO 要么不可变（record），要么明确生命周期归插件还是宿主。
- 入口约定（清单文件、约定目录、发现接口）写进文档，插件作者不该读宿主源码猜。

### 三、AssemblyLoadContext：类型身份的边界

\`\`\`csharp
public sealed class PluginLoadContext : AssemblyLoadContext
{
    private readonly AssemblyDependencyResolver _resolver;

    public PluginLoadContext(string pluginPath) : base(isCollectible: true)
        => _resolver = new AssemblyDependencyResolver(pluginPath);

    protected override Assembly? Load(AssemblyName name)
        => name.Name!.StartsWith("System") || name.Name!.StartsWith("Microsoft")
            ? null // 框架程序集共享默认上下文，避免静态状态分裂
            : _resolver.ResolveAssemblyToPath(name) is { } path
                ? LoadFromAssemblyPath(path)
                : null;
}
\`\`\`

- .NET 中“同一个类型” = 程序集名 + 命名空间 + 类型名 **+ 所在 ALC**。两个上下文加载同一 DLL，其中的 \`IFoo\` 是两个不同类型，**强转必然失败**。
- 解决契约共享：\`Load\` 对契约程序集返回 \`null\`，让它回落到默认上下文；宿主与插件因此拿到同一个 \`IFoo\`。
- \`isCollectible: true\` 允许 \`Unload()\`；真正释放要等所有引用（类型、实例、委托、线程栈）消失并经过 GC。
- 观察卸载：\`WeakReference\` 指向 ALC 里的对象，GC 后 \`IsAlive == false\` 才算真卸载。

### 四、依赖解析与版本冲突

- \`AssemblyDependencyResolver\` 读取插件目录的 \`.deps.json\`，把插件的 NuGet 依赖装进插件自己的 ALC。
- 版本策略：插件可以带自己的 Newtonsoft.Json 13，宿主用 12，互不干扰——这正是 ALC 的价值。
- 注意共享库的静态状态分裂：日志、度量、缓存这类“全局单例”跨上下文会各有一份；要么共享（\`Load\` 返回 null），要么显式从宿主传入。

### 五、治理：插件是半信任代码

- **超时与取消**：每个调用带 \`CancellationToken\`，超时先取消再卸载，别让死循环插件拖垮宿主。
- **异常隔离**：插件异常在宿主边界捕获、记录、熔断该插件，不让它把进程打崩。
- **资源配额**：内存、并发数、CPU 时间预算；恶意或劣质插件是可用性问题。
- **信任边界**：加载前校验签名/哈希；来源不可信就别用 ALC（它不是安全边界），改用独立进程或远程服务。
- **审计**：谁、何时、加载了什么版本，全部留痕。

### 六、替代方案对比

| 方案 | 隔离强度 | 延迟 | 适用 |
| --- | --- | --- | --- |
| ALC（同进程） | 中 | 最低 | 信任的扩展点 |
| 独立进程 + IPC | 强 | 中 | 不信任代码、崩溃隔离 |
| 脚本引擎（Lua/JS） | 看沙箱 | 低 | 用户自定义逻辑 |
| 远程服务（HTTP/gRPC） | 最强 | 高 | 跨团队、跨语言 |

### 七、可收集 ALC、信任与接口版本

\`isCollectible: true\` 只表示**允许**卸载。下列任一引用活着，ALC 就卸不掉：静态事件、未取消的 \`Task\`、未 \`Dispose\` 的线程、缓存里的 \`Type\` 对象。用 \`WeakReference(alc)\` 在测试里断言卸载，不要在生产里“以为 Unload 完内存就回来了”。

**插件不可信就不能同进程。** ALC 不是安全沙箱：\`unsafe\`、P/Invoke、反射一样能打宿主。第三方二进制要验签名/哈希；来路不明走独立进程 + IPC（第七十二章）。

**接口版本**：\`IReportPlugin\` 加方法是破坏性变更。对策：新接口 \`IReportPlugin2\` 并行；或默认接口方法（调用方仍要能接受旧插件没实现新行为）。DTO 加字段用可空 + 默认值；改语义就改类型名。契约程序集严守 SemVer，宿主对主版本升迁写适配器。

### 八、MEF vs 手写，以及 Native AOT

| | 手写 ALC | MEF（\`System.Composition\`） |
| --- | --- | --- |
| 发现 | 目录 + 清单 | \`[Export]\` / \`[Import]\` |
| 控制 | 完全自己管 | 约定多，调试导入失败较晦涩 |
| AOT | 可行但要已知类型 | 反射式组合与裁剪冲突大 |

**Native AOT** 没有运行时 IL 加载：\`LoadFromAssemblyPath\`、大部分反射 \`Invoke\`、动态 MEF 都会失败。插件要么编译进宿主（源生成注册表），要么插件本身也是独立 AOT 可执行文件走 IPC。发布前用 trim 分析器看警告，不要等生产 MissingMetadata。

### 九、加载清单与失败策略

生产宿主不要“扫目录把所有 DLL 都 Load”。用清单（\`plugin.json\`：id、文件哈希、契约版本、权限）。哈希对不上拒绝加载。单个插件 \`Load\` / \`Execute\` 失败时：记日志、熔断该 id、继续跑其它插件。超时用 \`CancellationTokenSource(TimeSpan)\`，超时后 \`Unload\` 只是尽力，卡死原生代码只能杀进程。

依赖冲突：插件自带 \`Newtonsoft.Json\` 与宿主不同版本时，靠 ALC 隔离；**契约程序集**必须 \`Load\` 返回 null 共享。日志工厂从宿主传入，避免两个 \`ILogger\` 静态世界。信任模型写进清单：第一方插件可同进程；第三方默认进程隔离。Native AOT 宿主把“插件”改成独立可执行文件 + 标准输入输出/gRPC，而不是再幻想 \`AssemblyLoadContext\`。接口加方法必须走新接口或默认实现，并把契约版本写进清单，宿主对不上就拒绝加载。MEF 适合约定多、插件作者多的第一方生态；一旦要 AOT 或严格配额，回到手写 ALC 或进程隔离。卸载测试用弱引用循环 GC，不要只看 \`Unload()\` 返回。

### 生产检查

1. 契约程序集是否独立、稳定、零依赖？
2. 框架程序集与契约是否共享默认上下文（Load 返回 null）？
3. 插件调用是否有超时、取消、异常隔离？
4. 卸载路径是否验证过（WeakReference 观察）？
5. 插件来源是否经过签名校验，是否需要进程级隔离？
`,
    code: `using System.Reflection;
using System.Runtime.Loader;

string? assemblyPath = Assembly.GetExecutingAssembly().Location;
if (string.IsNullOrEmpty(assemblyPath) || !File.Exists(assemblyPath))
{
    Console.WriteLine("单文件发布环境跳过程序集加载演示");
    return;
}

WeakReference weak = LoadPluginAndUnload(assemblyPath);

// 真正卸载要等引用消失 + GC；独立方法作用域保证局部引用已随返回死亡
for (int attempt = 0; weak.IsAlive && attempt < 10; attempt++)
{
    GC.Collect();
    GC.WaitForPendingFinalizers();
}
Console.WriteLine($"插件实例已释放：{!weak.IsAlive}（可收集 ALC 的卸载是异步的）");

static WeakReference LoadPluginAndUnload(string assemblyPath)
{
    // —— 1. 可收集 ALC 加载“插件”程序集（此处用自身程序集模拟第三方插件）——
    var context = new PluginLoadContext(assemblyPath);
    Assembly pluginAssembly = context.LoadFromAssemblyPath(assemblyPath);
    Type pluginType = pluginAssembly.GetType("TimestampPlugin")!;
    object plugin = Activator.CreateInstance(pluginType)!;

    // —— 2. 类型身份隔离：不同 ALC 中的同名类型不是同一个类型 ——
    Console.WriteLine($"插件类型与宿主类型是否同一条目：{pluginType == typeof(TimestampPlugin)}");
    Console.WriteLine($"能否直接强转为宿主接口：{plugin is IPlugin}");
    Console.WriteLine("（真实系统让 Load 对契约程序集返回 null 即可共享类型身份）");

    // —— 3. 生产做法之一：反射调用，宿主不依赖插件类型 ——
    string? result = (string?)pluginType.GetMethod("Execute")!.Invoke(plugin, ["order-1024"]);
    Console.WriteLine($"反射调用结果：{result}");

    // —— 4. 请求卸载，弱引用用于事后观察是否真正释放 ——
    var weak = new WeakReference(plugin);
    context.Unload();
    return weak;
}

public sealed class PluginLoadContext : AssemblyLoadContext
{
    private readonly AssemblyDependencyResolver _resolver;

    public PluginLoadContext(string mainAssemblyPath) : base(isCollectible: true)
        => _resolver = new AssemblyDependencyResolver(mainAssemblyPath);

    protected override Assembly? Load(AssemblyName name)
    {
        string assemblyName = name.Name ?? "";
        if (assemblyName.StartsWith("System", StringComparison.Ordinal)
            || assemblyName.StartsWith("Microsoft", StringComparison.Ordinal))
        {
            return null; // 框架程序集共享默认上下文，避免 Console 等静态状态分裂
        }
        return _resolver.ResolveAssemblyToPath(name) is { } path
            ? LoadFromAssemblyPath(path)
            : null; // 其它依赖交给默认上下文兜底
    }
}

public interface IPlugin
{
    string Execute(string input);
}

public sealed class TimestampPlugin : IPlugin
{
    public string Execute(string input) => $"{input} @ {DateTimeOffset.UtcNow:O}";
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch122",
    group: "第二十部分 生态拓展与语言演进",
    icon: "🖥️",
    title: "客户端与 UI 技术全景",
    content: `## 第一百二十三章　客户端与 UI 技术全景

后端技能之外，C# 也能写 Web 前端、桌面、移动与终端应用。本章不教你某个框架的细节，而是建立**选型地图 + 架构分层**的判断力。

### 一、选型地图

| 技术 | 目标平台 | 渲染/模型 | 适合 |
| --- | --- | --- | --- |
| Blazor Server | 浏览器（服务端渲染 + SignalR） | C# 组件，状态在服务端 | 内网系统、低延迟网络 |
| Blazor WebAssembly | 浏览器（WASM） | C# 组件，状态在浏览器 | 离线、客户端重计算 |
| Blazor Auto / Hybrid | 浏览器/桌面（.NET MAUI 壳） | 混合 | 同一代码多端 |
| .NET MAUI | iOS / Android / Win / macOS | 单项目多目标 | 移动 + 桌面统一 |
| WPF | Windows | XAML、GPU | Windows 重桌面工具 |
| WinForms | Windows | 拖控件 | 快速内部工具 |
| Avalonia | 跨平台桌面 | XAML 系 | 跨平台桌面、工业界面 |
| Uno Platform | Win / Web / 移动 / Linux | WinUI 系 XAML | 已有 WinUI 资产要上多端 |
| Spectre.Console | 终端 | 字符 UI | CLI、运维工具 |

- 团队已有 C# 资产、想减少前后端切换成本 → Blazor。
- 需要原生性能、商店分发、设备 API → MAUI。
- 跨平台桌面且不绑定微软 → Avalonia。
- 已有 WinUI / UWP 思维要上 Web 与移动 → Uno。
- 内部 CLI 工具 → Spectre.Console（表格、进度条、交互式向导）。

### 二、MVVM 与分层：UI 无关的核心

\`\`\`csharp
public sealed class OrderViewModel : INotifyPropertyChanged
{
    private int _quantity = 1;
    public int Quantity
    {
        get => _quantity;
        set { _quantity = Math.Clamp(value, 1, 99); OnPropertyChanged(); OnPropertyChanged(nameof(Total)); }
    }
    public decimal Total => UnitPrice * _quantity; // 派生属性联动刷新
}
\`\`\`

- **ViewModel 不引用任何 UI 类型**：可以在控制台、单元测试里直接实例化验证行为。
- \`INotifyPropertyChanged\` 驱动绑定刷新；\`ICommand\` 封装动作与可执行性。
- 派生属性记得联动通知（改数量要通知合计）。
- UI 层越薄越好：业务规则、校验、状态机全部下沉到可测试的普通 C# 库。

### 三、Blazor 核心模型

- 组件 = 参数 + 渲染 + 生命周期；\`@inject\` 使用 DI，与 ASP.NET Core 同一容器。
- **Server 模式**：DOM diff 走 SignalR，延迟取决于网络，服务端持有状态（每会话内存）。
- **WASM 模式**：运行时下载到浏览器，首载较重、断网可用。
- **Auto 模式**（.NET 8+）：首次 SSR + 交互时自动选择通道。
- JS interop 是逃生舱：\`IJSRuntime\` 调用现有 JS 库，但每次调用有序列化成本。
- 状态管理：级联参数、\`@key\`、第三方 Fluxor/Redux 风格库，按团队规模选择。

### 四、.NET MAUI

- 单个项目多目标（net8.0-android / -ios / -windows10 / -maccatalyst），共享业务层。
- 平台差异用 \`#if ANDROID\`、\`#if IOS\` 或处理器（Handler）抽象，别让 if 散落业务代码。
- 发布：Android AAB / iOS IPA 走商店；注意热重启与 AOT 约束。
- 常见坑：iOS 签名、Android 后台限制、模拟器性能。

### 五、WPF / WinForms：老而稳

- WPF：XAML + 数据绑定 + 依赖属性，渲染走 DirectX；学习曲线在绑定与模板。
- WinForms：拖拽即所得，内部工具效率极高，但缩放与定制弱。
- UI 线程模型：所有控件操作必须回 UI 线程（WPF \`Dispatcher.Invoke\`，WinForms \`Control.Invoke\`），后台线程只算数据不改界面。
- 大量存量企业系统跑在这两个框架上，现代化改造（见下一章）是真实工作场景。

### 六、生产建议

- UI 自动化测试贵：把逻辑压到 ViewModel / 核心库做纯单元测试，UI 层只做冒烟。
- 无障碍（键盘、读屏、对比度）与本地化从第一天接入，后补成本极高。
- 长期项目优先考虑代码共享策略（核心库 + 薄 UI 壳）而不是跨平台框架本身。

### 七、选型总表（含 Uno）与何时用 Web

| 技术 | 目标平台 | 渲染 | 选它当 |
| --- | --- | --- | --- |
| Blazor Server | 浏览器 | 服务端组件 + SignalR | 内网、低延迟、状态可放服务端 |
| Blazor WASM | 浏览器 | 客户端 WASM | 离线、重计算在浏览器 |
| Blazor Hybrid | 桌面/移动壳 | WebView 里跑 Blazor | 同一套 UI 进商店 |
| .NET MAUI | iOS/Android/Win/macOS | 原生控件 | 要设备 API、商店审核 |
| WPF | Windows | XAML / DirectX | 重桌面、已有 WPF 资产 |
| WinForms | Windows | HWND 控件 | 内部工具、最快出界面 |
| Avalonia | 跨平台桌面 | 自绘 XAML 系 | 不绑微软、工业/工具桌面 |
| Uno Platform | 多端 + Web | WinUI 模型 | WinUI 代码要上 Web/移动 |
| Spectre.Console | 终端 | 字符 | CLI / 运维向导 |

**优先 Web 的信号**：要 SEO 或公开链接、客户端不可控、发版必须当天全员生效、团队前端编制大于客户端编制。此时 UI 用 Blazor 或 JS/TS，C# 退到 API 与领域库。不要为了“全栈一种语言”把高交互营销站硬写成 Blazor WASM。

### 八、UI 线程与类库复用

所有经典 UI（WPF/WinForms/MAUI/Avalonia/Uno）都是**单线程亲缘**：碰可视化树必须回 UI 线程。

| 框架 | 回到 UI |
| --- | --- |
| WPF | \`Dispatcher.InvokeAsync\` |
| WinForms | \`Control.Invoke\` / \`SynchronizationContext\` |
| MAUI | \`MainThread.BeginInvokeOnMainThread\` |
| Avalonia | \`Dispatcher.UIThread\` |
| Blazor | 一般在同步上下文内；跨圈用 \`InvokeAsync\` |

后台只算 DTO，算完再投递。死锁经典组合：UI 等 \`task.Result\`，任务又 \`Invoke\` 回 UI。

**复用**：领域、校验、HTTP 客户端、DI 模块放 \`net8.0\` 类库，UI 工程只做绑定。禁止 ViewModel 引用 \`System.Windows\` / \`Microsoft.Maui.Controls\`。一套测试库即可覆盖 Blazor 与 MAUI 背后的同一 Service。

Blazor 没有 HWND 线程，但有**电路 / 渲染同步上下文**：在任意线程改组件状态后必须 \`InvokeAsync(StateHasChanged)\`。WASM 是单线程，Server 模式却可能从线程池回调进来。

### 生产检查

1. 选型是否基于团队技能、平台需求与维护周期，而不是热点？
2. ViewModel 与业务逻辑是否可以在无 UI 环境下测试？
3. UI 线程规则是否有工具（分析器/代码评审）保障？
4. 无障碍与本地化是否已纳入验收标准？
`,
    code: `using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

// MVVM：ViewModel 不依赖任何 UI 框架，行为可直接在控制台验证
var viewModel = new OrderViewModel();
viewModel.PropertyChanged += (_, e) =>
    Console.WriteLine($"[绑定刷新] {e.PropertyName}");

viewModel.Quantity = 3;
viewModel.Submit.Execute(null);

public sealed class OrderViewModel : INotifyPropertyChanged
{
    private int _quantity = 1;
    private const decimal UnitPrice = 128.00m;

    public event PropertyChangedEventHandler? PropertyChanged;

    public int Quantity
    {
        get => _quantity;
        set
        {
            if (_quantity == value) return;
            _quantity = Math.Clamp(value, 1, 99);
            OnPropertyChanged();
            OnPropertyChanged(nameof(Total)); // 派生属性联动通知
        }
    }

    public decimal Total => UnitPrice * _quantity;

    public ICommand Submit { get; }

    public OrderViewModel()
        => Submit = new RelayCommand(
            execute: () => Console.WriteLine($"提交订单：{Quantity} 件，合计 {Total:C}"),
            canExecute: () => Total > 0);

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
}

public sealed class RelayCommand(Action execute, Func<bool> canExecute) : ICommand
{
    public event EventHandler? CanExecuteChanged;

    public bool CanExecute(object? parameter) => canExecute();

    public void Execute(object? parameter) => execute();

    public void RaiseCanExecuteChanged()
        => CanExecuteChanged?.Invoke(this, EventArgs.Empty);
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch123",
    group: "第二十部分 生态拓展与语言演进",
    icon: "🤖",
    title: "C# 与 AI 应用集成",
    content: `## 第一百二十四章　C# 与 AI 应用集成

2026 年的 .NET 后端工程师不可避免要接大模型：客服问答、文档检索、结构化提取、推荐解释。核心心法：**把 LLM 当成一个不可靠、有延迟、按 token 计费的外部 IO 设备**。

### 一、应用形态

- **对话 / Agent**：多轮上下文 + 工具调用（查库、下单、发通知）。
- **RAG 检索增强**：文档切块 → 向量化 → 检索 → 拼 prompt → 生成，解决幻觉与私域知识。
- **结构化提取**：从合同、邮件、工单抽字段成强类型对象。
- **分类 / 评分**：情感、意图、风险分级，可用小模型或 ML.NET。

### 二、Microsoft.Extensions.AI：统一抽象

\`\`\`csharp
// NuGet：Microsoft.Extensions.AI（.NET 9+ 生态，.NET 8 可用）
builder.Services.AddSingleton<IChatClient>(sp =>
    new OllamaChatClient(new Uri("http://localhost:11434"), "llama3.1")
        .AsBuilder()
        .UseFunctionInvocation()
        .UseOpenTelemetry()
        .Build());

var response = await chatClient.GetResponseAsync<SupportTicket>(
    "把这段用户反馈解析成工单：...", cancellationToken: ct);
\`\`\`

- \`IChatClient\` 抽象屏蔽供应商（OpenAI / Azure / Ollama / 本地），测试时可注入伪实现。
- 中间件管道 \`UseLogging / UseDistributedCache / UseOpenTelemetry / UseFunctionInvocation\` 组合横切关注点，和 ASP.NET Core 管道同一哲学。
- 工具调用：把 C# 方法注册给模型按需调用，\`UseFunctionInvocation()\` 负责调度循环。

### 三、结构化输出：永远不要裸解析

- 优先让模型直接产出强类型（上例 \`GetResponseAsync<T>\` 底层走 JSON schema 约束）。
- 手动模式也必须：schema 约束 + \`JsonSerializer\` 反序列化 + \`JsonSchema\`/\`Validator\` 校验 + 失败重试（把校验错误回喂模型修正）。
- 温度设 0 提升确定性；关键业务对输出做枚举与范围校验，模型偶尔会越界。
- 兜底路径：解析失败 N 次降级人工或规则，别让一条畸形 JSON 打挂接口。

### 四、Embedding 与向量检索

- 文本 → 固定维度向量；相似度用余弦（夹角），不是欧氏距离的直觉。
- 存储：pgvector（Postgres 插件）、Qdrant、Redis、Azure AI Search；中小规模 Postgres 一把梭。
- RAG 切块策略（标题层级、512–1024 token、重叠 10%）比换模型更影响效果。
- **语义缓存**：向量相似度超阈值直接复用历史回答，省钱且提速。

### 五、ML.NET：经典机器学习

- 场景：分类（垃圾工单）、回归（预计处理时长）、推荐（关联商品）、异常检测。
- \`MLContext\` 管道：加载 → 转换（FeaturizeText）→ 训练 → 评估 → 消费，全程 C# 无 Python 依赖。
- 评估看混淆矩阵 / AUC / RMSE，不是“看起来准”。
- 与 LLM 互补：高频简单任务用 ML.NET（毫秒级、本地、免费），复杂理解交给 LLM。

### 六、生产关切

- **延迟与超时**：流式输出（SSE）改善体感；总预算超时后取消并降级。
- **成本**：token 计量按调用记入维度（用户、功能、模型）；缓存与短上下文是最有效的省钱手段。
- **评测集**：上线前攒 50–200 条标注样本做回归，改 prompt 必须跑分。
- **提示注入**：检索到的文档、用户输入都是“不可信文本”，不要拼进含指令的 system 段而不加隔离。
- **可观测**：把 prompt 摘要、模型版本、token 数、耗时打进日志与 APM，出问题能复现。
- **内容安全**：输出过敏感词/合规过滤器；人工审核位留给高风险场景。

### 七、IChatClient：提示词、工具与 RAG

把模型当 **不可靠 IO**：有延迟、会胡说、按 token 计费。\`Microsoft.Extensions.AI\` 的 \`IChatClient\`（可与 Semantic Kernel 并存）把 OpenAI / Azure / Ollama 收成一种抽象，测试注入假客户端。

| 概念 | 做什么 | 别做成 |
| --- | --- | --- |
| System / User 提示 | 角色、格式、约束 | 把不可信检索文本写进 system 且不隔离 |
| Tools / Function calling | 模型选函数，你执行后回灌 | 把“删库”暴露成无确认工具 |
| RAG | 切块 → 嵌入 → 检索 → 带引用生成 | 把整库塞进上下文 |
| 结构化输出 | JSON schema / \`GetResponseAsync<T>\` | \`Split(',')\` 裸解析 |

**密钥**：API Key 只进环境变量 / Key Vault / Data Protection，禁止进仓库、前端、日志。本地 \`dotnet user-secrets\`。轮换漏记一处就是事故。

### 八、评测、限流、本地 vs 云

- **Eval**：50–200 条标注（正确引用、拒答、格式）。改 prompt / 换模型必须跑同一套分，禁止“感觉更好了”。
- **限流**：429 + \`Retry-After\`；按用户/功能做令牌桶。重试只针对暂时故障，总预算封顶（第八十五章同一哲学）。
- **本地 vs 云**：Ollama / ONNX 保数据不出域、无按 token 账单，质量与 GPU 是你的；云模型能力强、有 SLA，数据分级后才能出门。\`IChatClient\` 让这条管道可切换。
- **Semantic Kernel** 偏 Agent/规划器编排；\`Microsoft.Extensions.AI\` 偏标准 \`IChatClient\` 管道。新代码优先后者，已有 SK 插件可适配，不要两套各写一遍工具注册。

### 九、落地清单（密钥、限流、评测）

1. 所有模型调用走 \`IChatClient\`，禁止在 Controller 里 new 供应商 SDK。
2. 工具白名单：只注册只读查询与“需要二次确认”的写操作。
3. RAG 引用必须回传到用户（文档 id + 片段），方便审计幻觉。
4. 每调用记录：模型名、prompt 版本、输入/输出 token、延迟、缓存是否命中。账单按功能维度汇总。
5. 密钥不出现在异常 \`ToString()\`、OpenTelemetry 属性、前端包。轮换演练每年至少一次。
6. 本地小模型跑回归（省钱），发版前用云上生产模型抽测同一评测集。

把 LLM 当支付网关一样对待：超时、幂等、降级、审计齐全，才算集成完成。

提示词与工具分文件版本化（\`prompts/refund-v3.md\`），代码只引用 id。RAG 切块失败时降级为“未检索到，请转人工”，不要用模型空编政策条款。云厂商限流与本地 GPU 队列都要有用户可见的等待提示，而不是让 HTTP 请求挂到网关超时。API Key 轮换后旧密钥必须作废；评测集与生产流量隔离，避免把真实用户 PII 写进 prompt 日志。\`IChatClient\` 的假实现要覆盖：超时、空回复、畸形 JSON、工具调用循环超限。Semantic Kernel 与 Extensions.AI 不要各写一套工具表，选一个当编排入口。本地模型负责回归与脱敏数据，云模型负责发版抽测。速率限制与费用告警要和业务 SLA 写在同一张运行手册里。密钥泄漏按事故响应，而不是只删 Git 历史。工具调用必须可审计、可撤销。

### 生产检查

1. LLM 调用是否走统一抽象（IChatClient）+ 伪实现单测？
2. 结构化输出是否有 schema 校验 + 重试 + 降级？
3. 是否有语义缓存与 token 成本计量？
4. 评测集与回归基线是否建立？
5. 提示注入与内容安全是否评估过？
`,
    code: `using System.Numerics;

// —— 1. 伪 embedding：字符二元组（bigram）向量（真实系统调用 embedding 模型）——
float[] v1 = VectorMath.Embed("如何重置密码");
float[] v2 = VectorMath.Embed("密码怎么重置");
float[] v3 = VectorMath.Embed("如何开发票");

Console.WriteLine($"相似度(同句重复) = {VectorMath.CosineSimilarity(v1, v1):F3} → 语义缓存命中");
Console.WriteLine($"相似度(同义改写) = {VectorMath.CosineSimilarity(v1, v2):F3} → 字面向量偏保守，需真实模型");
Console.WriteLine($"相似度(不同问题) = {VectorMath.CosineSimilarity(v1, v3):F3} → 不命中");

// —— 2. 语义缓存：相似度超阈值直接复用答案 ——
var cache = new SemanticCache(threshold: 0.95f);
cache.Add("如何重置密码", v1, "进入 设置 → 安全 → 重置密码，短信验证后设置新密码。");
var (hit, answer) = cache.TryGet("如何重置密码", v1);
Console.WriteLine($"缓存命中：{hit}，答案：{answer}");

public static class VectorMath
{
    public static float[] Embed(string text, int dimensions = 128)
    {
        var vector = new float[dimensions];
        string normalized = new string(text.Where(char.IsLetterOrDigit).ToArray());
        for (int i = 0; i + 1 < normalized.Length; i++)
        {
            vector[Fnv1a(normalized.Substring(i, 2)) % dimensions] += 1f;
        }
        // L2 归一化，余弦相似度才稳定
        float norm = MathF.Sqrt(vector.Sum(x => x * x));
        if (norm > 0f)
        {
            for (int i = 0; i < dimensions; i++) vector[i] /= norm;
        }
        return vector;
    }

    public static float CosineSimilarity(float[] left, float[] right)
    {
        float dot = 0f, normLeft = 0f, normRight = 0f;
        for (int i = 0; i < left.Length; i++)
        {
            dot += left[i] * right[i];
            normLeft += left[i] * left[i];
            normRight += right[i] * right[i];
        }
        return dot / (MathF.Sqrt(normLeft) * MathF.Sqrt(normRight) + 1e-10f);
    }

    private static uint Fnv1a(string value)
    {
        uint hash = 2166136261u;
        foreach (char c in value)
        {
            hash = (hash ^ c) * 16777619u;
        }
        return hash;
    }
}

public sealed class SemanticCache(float threshold)
{
    private readonly List<(string Question, float[] Vector, string Answer)> _entries = [];

    public (bool Hit, string? Answer) TryGet(string question, float[] vector)
    {
        foreach (var entry in _entries)
        {
            if (VectorMath.CosineSimilarity(vector, entry.Vector) >= threshold)
            {
                return (true, entry.Answer);
            }
        }
        return (false, null);
    }

    public void Add(string question, float[] vector, string answer)
        => _entries.Add((question, vector, answer));
}
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch124",
    group: "第二十部分 生态拓展与语言演进",
    icon: "🧭",
    title: "C# 语言版本演进",
    content: `## 第一百二十五章　C# 语言版本演进

知道每个特性“哪年、为什么”出现，你才能读懂老代码的设计、评估新特性是否该用。这张时间线是全书语法的索引。

### 一、版本总览

| 版本 | 年份 | 运行时 | 里程碑特性 |
| --- | --- | --- | --- |
| C# 1.0 | 2002 | .NET Fx 1.0 | 类、属性、事件、委托 |
| C# 2.0 | 2005 | .NET Fx 2.0 | 泛型、可空值类型、yield、匿名方法 |
| C# 3.0 | 2007 | .NET Fx 3.5 | LINQ、lambda、自动属性、匿名类型、var |
| C# 4.0 | 2010 | .NET Fx 4.0 | dynamic、命名参数、协变逆变 |
| C# 5.0 | 2012 | .NET Fx 4.5 | async/await |
| C# 6.0 | 2015 | .NET Fx 4.6 / Core 1.0 | 字符串插值、表达式体、?.、nameof |
| C# 7.0–7.3 | 2017–18 | Core 2.x | 元组、模式匹配、out var、Span 基础、default 字面量 |
| C# 8.0 | 2019 | Core 3.x | 可空引用类型、switch 表达式、using 声明、异步流、接口默认实现 |
| C# 9.0 | 2020 | .NET 5 | record、init、with、顶层语句、目标类型 new |
| C# 10 | 2021 | .NET 6 | record struct、global using、文件范围命名空间、lambda 改进 |
| C# 11 | 2022 | .NET 7 | 原始字符串、列表模式、required、静态抽象接口成员 |
| C# 12 | 2023 | .NET 8 | 主构造函数、集合表达式、内联数组 |
| C# 13 | 2024 | .NET 9 | params 集合、锁对象、\\e 转义、部分属性 |
| C# 14 | 2025 | .NET 10 | field 关键字、扩展成员、null 条件赋值 |

### 二、泛型与 LINQ 时代（2.0–3.x）

- 2.0 的泛型让集合类型安全，\`List<int>\` 替代 ArrayList 装箱；\`Nullable<T>\`（\`int?\`）统一“没有值”。
- 3.0 的 LINQ 是语言转折点：查询语法 + \`Expression\` 树支撑了 EF、报表格式的整整一代框架。lambda 与扩展方法是它的地基。

### 三、异步革命（5.0）

- \`await\` 把回调地狱编译成状态机，“同步写法、异步执行”成为可能，是后来所有 IO 框架（ASP.NET Core、EF Core）吞吐跃升的前提。

### 四、现代化时期（6.0–8.0）

- 6.0 语法糖减噪：插值字符串、\`?.\`、\`nameof\`，编译器本身开源重写（Roslyn）。
- 7.x 打地基：元组解构、\`is\` 模式、\`ref struct\`/\`Span<T>\`（高性能栈）、\`readonly struct\`。
- 8.0 两件大事：**可空引用类型**（把 NRE 从运行时错误变成编译警告，本书**第十八章**）与 **switch 表达式**；异步流 \`await foreach\` 支撑**第五十章**。

### 五、现代 C#（9.0–14）

- 9.0：\`record\` 不可变数据 + \`with\` 非破坏性修改（本书**第十九章**类与对象、**第四十章**函数式）；顶层语句让小程序即开即写。
- 10：\`record struct\`、\`global using\`、文件范围命名空间减少模板行数。
- 11：原始字符串 \`\"\"\"...\"\"\"\`（写 JSON/正则不再转义到眼花）、\`required\` 成员强制初始化、**静态抽象接口成员**让泛型数学成为可能（**第九十四章**）。
- 12：主构造函数、集合表达式 \`[.. xs]\` 统一初始化语法。
- 13/14（需 .NET 9/10）：\`params\` 支持集合类型、\`field\` 关键字精简属性、**扩展成员**（扩展属性/静态扩展）落地。

### 六、版本与运行时的关系

- 语言版本随 SDK 走：C# 12 → net8.0，C# 13 → net9.0，C# 14 → net10.0；库项目可 \`<LangVersion>\` 指定但受运行时 API 限制。
- 生产基线 .NET 10 = C# 14（本书）；在线 demo 兼容 .NET 8 = C# 12，所以 C# 13/14 特性只出现在标注代码块中。
- 判断“能不能用”：特性是纯语法糖（插值字符串）→ 低风险；涉及运行时支持（静态抽象成员、field）→ 绑运行时版本。

### 七、生产建议

- 项目显式声明 \`<LangVersion>\`，避免 SDK 升级悄悄改语言语义。
- 新特性渐进采纳：先在工具代码试用，团队评审后进业务代码。
- 读老代码先识别“它停在哪一代”：2.0 风格委托、3.0 查询链、8.0 之前没有的可空标注都是线索。
- 升级用分析器扫旧模式（IDE 建议器 + \`dotnet format\`），而不是手工找。

### 八、本书已覆盖哪些里程碑

| 特性 | 引入 | 本书落点（标题章号） |
| --- | --- | --- |
| 泛型 / 可空值类型 | 2.0 | 第二十九章、第十七章 |
| LINQ / lambda | 3.0 | 第四十一章起、第三十七章 |
| async/await | 5.0 | 第四十六章 |
| 可空引用类型 | 8.0 | 第十八章 |
| 异步流 | 8.0 | 第五十章 |
| record / 顶层语句 | 9.0 | 第十九章、第四章 |
| 原始字符串 / required / 泛型数学 | 11 | 第九十四章 |
| 主构造函数 / 集合表达式 | 12 | 演示默认语法 |
| params 集合 / \`field\` / 扩展成员 | 13–14 | 第八十章（标注预览/版本） |

对照这张表读老代码：看到 \`ArrayList\` 就知道停在 2.0 之前习惯；看到 \`BeginXxx\` 回调就知道还没迁到 5.0。

### 九、preview 是什么、LangVersion 怎么定

- **preview**：SDK 带着尚未定案的语法/API，\`<LangVersion>preview</LangVersion>\` 才能编译。**发行说明一改，你的代码就可能编不过。** 生产分支禁止 preview；个人分支试用可以。
- **latest / latestMajor**：跟着 SDK 走，升级 SDK 可能改变可接受语法。团队仓库应写成**具体数字**（\`12\` / \`13\` / \`14\`）。
- **政策**：库的 \`TargetFramework\` 决定能引用哪些 API；\`LangVersion\` 只决定语法。可以 \`net8.0\` + \`LangVersion=12\`（本书 demo）；不能在 \`net8.0\` 上使用依赖 .NET 10 BCL 的 C# 14 API。特性若是纯语法糖，降框架通常仍能跑；若绑运行时（\`field\`  backing、新 Lock 类型），必须升 TFM。
- 多目标库：每个 TFM 用 \`#if NET10_0_OR_GREATER\` 包新 API，不要为了新语法丢掉旧用户。

CI 里用 \`dotnet format --verify-no-changes\` 和编辑器配置把语言版本钉死。升级 SDK 当独立 PR：先看 breaking change 再改 \`LangVersion\`。预览特性进主分支必须附“最早可删除日期”和回退 TFM 的说明。\`preview\` 与 \`latest\` 都不进生产 csproj；文档里写清“本书 demo = C# 12 / net8.0，正文基线 = C# 14 / .NET 10”。读遗产代码先对照第一节年表，再决定是语法升级还是行为修复。C# 14 的 \`field\` 与扩展成员只在第八十章标注块出现，demo 保持 C# 12 可编译。团队评审新语法时问两句：有没有运行时依赖？旧分支还能不能编？\`LangVersion\` 必须写进 Directory.Build.props，避免各项目各用各的。

### 生产检查

1. 团队是否统一了 LangVersion 与目标框架？
2. 新特性引入是否有评审与示例沉淀？
3. 老代码现代化是否列入技术债计划而不是“永不”？
`,
    code: `// 语言特性“博物馆”：每处标注引入版本
var orders = new Order[]
{
    new("企业版续费", 1280m),   // C# 9：目标类型 new
    new("标准版新购", 299m),
    new("试用转正", 99m),
};

// C# 3：LINQ 查询语法
var top = (from order in orders
           where order.Amount >= 100
           orderby order.Amount descending
           select order).First();

// C# 6：字符串插值
Console.WriteLine($"最高订单：{top.Name}（{top.Amount:C}）");

// C# 6：null 条件运算符要用在真正可空的值上（FirstOrDefault 可能返回 null）
Order? trial = orders.FirstOrDefault(order => order.Name.StartsWith("试用"));
Console.WriteLine($"试用单：{trial?.Name ?? "（本月无）"}");

// C# 7：元组解构
var (name, amount) = (top.Name, top.Amount);

// C# 8：switch 表达式
string tier = amount switch
{
    > 1000 => "大客户",
    > 100 => "普通客户",
    _ => "小客户",
};
Console.WriteLine($"{name} → {tier}");

// C# 12：集合表达式
decimal[] amounts = [1280m, 299m, 99m];
Console.WriteLine($"集合表达式求和：{amounts.Sum():C}");

// C# 11：列表模式（匹配字符串首字符）
foreach (var order in orders)
{
    if (order.Name is ['试', ..])
    {
        Console.WriteLine($"试用订单：{order.Name}");
    }
}

// C# 2：泛型约束 + C# 5：async/await
Console.WriteLine($"泛型 Max：{Max(88, 128)}");
Console.WriteLine($"异步计算：{await ComputeAsync()}");

static T Max<T>(T left, T right) where T : IComparable<T>
    => left.CompareTo(right) >= 0 ? left : right;

static async Task<decimal> ComputeAsync()
{
    await Task.Delay(20); // 模拟 IO
    return 42m;
}

public sealed record Order(string Name, decimal Amount); // C# 9：record
`,
    lang: "cs",
  },
  {
    id: "csharp5-ch125",
    group: "第二十部分 生态拓展与语言演进",
    icon: "🏗️",
    title: "遗留系统现代化改造",
    content: `## 第一百二十六章　遗留系统现代化改造

真实世界的 C# 工作很大一部分是“给 2013 年的 .NET Framework 4.5 系统续命”。大爆炸重写几乎总是失败，成功的路径是小步、可验证、可回滚。

### 一、先评估，再动手

| 维度 | 高风险信号 | 行动 |
| --- | --- | --- |
| 变更频率 | 每月都有需求 | 只做平台迁移，别动结构 |
| 测试覆盖 | 几乎为零 | 先补特征测试（ characterization test ） |
| 依赖 | 死掉的第三方控件 | 先隔离适配层 |
| 部署 | 手工拷贝 + xcopy | 先容器化，再谈升级 |

- 没有测试的遗留系统：先录制当前行为（输入→输出快照），把现状锁住才能安全改。
- 列出技术债清单（\`dotnet list package --deprecated --vulnerable\`、升级分析报告），按风险排序而不是按爽点排序。

### 二、升级路径：爬梯子

\`\`\`text
.NET Framework 4.x → netstandard2.0 库拆分 → .NET 8（LTS）→ .NET 10（LTS）
\`\`\`

- 先把业务逻辑拆成 netstandard2.0 类库（两侧都能引用），Web/UI 壳留到最后。
- 工具：\`dotnet try-convert\` 转项目格式，.NET Upgrade Assistant 生成迁移计划，API 兼容性分析器（\`Microsoft.DotNet.UpgradeAssistant.Extensions.Default.Analyzers\`）逐条提示。
- 预期坑：\`System.Web\`、WCF 服务端、AppDomain、二进制序列化、注册表、COM 互操作——每一项都要替换策略（ASP.NET Core 迁移、gRPC/REST、ALC、JSON）。
- Windows 专属 API 走 \`RuntimeInformation.IsOSPlatform\` 分支或条件目标框架。

### 三、兼容与适配：[Obsolete] 是迁移的脚手架

\`\`\`csharp
[Obsolete("改用 ReportRenderer.Render，v3.0 移除", error: false)] // 按计划逐步改成 error: true
public static string Render(string source) => ReportRenderer.Render(source);
\`\`\`

- 新实现先写，旧 API 变成转发壳 + \`[Obsolete]\` 警告，编译器替你找出所有调用点。
- 警告清零后把 \`error: false\` 改 \`true\`，一个版本周期后删除。
- 不可直接替换的行为差异（编码、时区、排序稳定性）：写适配层显式保留旧语义并注明原因。

### 四、绞杀者模式（Strangler Fig）

\`\`\`text
用户 → 反向代理 ─┬─ /api/orders    → 新 .NET 10 服务（新功能在新服务长出来）
                 └─ 其余路由        → 遗留系统（只读维护）
\`\`\`

- 新需求一律进新服务，老系统只修缺陷不改能力，路由按“页面/接口”粒度逐步搬家。
- 灰度：按用户、租户、百分比切流；粘性哈希保证同一用户始终走同一边，便于对比与排障。
- 每迁一块，监控对比错误率与延迟，达标才迁下一块。

### 五、数据与契约迁移：Expand–Contract

1. **Expand**：新表/新列与旧结构并存，双写（旧库为主，新库影子写）。
2. **验证**：后台比对两边数据一致性（行数、抽样校验和）。
3. **Contract**：读切到新结构，验证一段时间后停写旧列，最后删除。
- 对外契约（API、消息）版本化：v1 只读 → v2 上线 → 流量归零 → 下线 v1；每步可回滚。
- 双写必须考虑幂等与乱序（Outbox 模式，见**第一百章**）。

### 六、组织策略

- 冻结窗口：迁移期间只接安全补丁与新需求进新侧，避免移动靶。
- 度量先行：迁移前后用同一套业务指标（下单成功率、P99）对比，不是“感觉更稳了”。
- 拒绝大爆炸重写的理由：老系统积累的隐式规则（闰年补丁、特殊客户分支）比代码本身值钱，重写必丢。
- 小步庆祝：每个路由迁移合并、每个模块升级完成都值得发一条可见的进展。

### 七、.NET Framework 4.8 → 现代运行时

4.8 是 Framework 的终点，只收安全补丁。目标不是“同一天换成 .NET 10”，而是梯子：

\`\`\`
4.8 单体 → 抽出 netstandard2.0 类库 → 新宿主跑 .NET 8/10 → 绞杀旧 System.Web
\`\`\`

| 遗产 | 现代替代 | 注意 |
| --- | --- | --- |
| \`System.Web\`（HttpContext、ASP.NET MVC/WebForms） | ASP.NET Core | 管道、模块、\`HttpContext.Current\` 静态都没了 |
| WCF 服务端 | gRPC / Minimal API / CoreWCF（过渡） | 绑定与 SOAP 要逐个对契约 |
| AppDomain 隔离 | ALC 或进程隔离（第一百二十二章） | 卸载语义不同 |
| \`web.config\` / \`app.config\` | \`appsettings.json\` + 环境变量 | 配置变换改到环境与管道 |
| 绑定重定向（\`bindingRedirect\`） | SDK 的依赖图 / 无绑定重定向 | 冲突改用 ALC 或统一版本 |
| \`packages.config\` | \`PackageReference\` | 传递依赖可见性变了 |

**netstandard2.0** 仍是“旧 Framework 与新 .NET 共用”的最低公约数。新代码不要再选 netstandard，除非你还要被 4.8 引用；库直接 \`net8.0\` / 多目标。

**COM / Office 互操作**：\`ComImport\`、STA 线程在 Core 仍可用，但发布成独立进程更稳。\`UseWindowsForms\` / 兼容包不是长期家。

### 八、重写 vs 包裹，以及特征测试

| 策略 | 何时 | 风险 |
| --- | --- | --- |
| **包裹（wrap）** | 旧模块还能跑、契约清楚 | 适配层变厚，但可回滚 |
| **绞杀（strangler）** | 按路由/用例切开 | 双系统运维成本 |
| **重写（rewrite）** | 旧栈已无法构建、法律/安全必须走 | 隐式规则丢失，几乎总超时 |

默认包裹 + 绞杀。重写只留给“编译器都装不齐”的角落。

**特征测试（characterization test）**：先锁**当前**行为，不管它丑不丑。对关键输入录输入→输出快照（黄金文件），重构后对拍。没有特征测试就改账务/税务逻辑，等于蒙眼飞行。补测试的顺序：资金与权限 → 对外契约 → 内部工具。

COM 组件、Office 自动化往往要求 STA。迁到 ASP.NET Core（默认 MTA 线程池）时，把 COM 调用隔离到专用 STA 线程或外包进程，否则会随机 RPC_E_WRONG_THREAD。绑定重定向是 Framework 的故事：Core 上看到“找不到 10.0.0.1”应统一 \`PackageReference\` 版本，而不是再写 \`bindingRedirect\`。\`System.Web\` 的 \`HttpContext.Current\` 在 Core 不存在，静态上下文要改成构造注入 \`IHttpContextAccessor\`（仍要慎用）。netstandard2.0 库可以暂时两边引用，一旦 4.8 宿主下线就升 \`net8.0\`，不要让 netstandard 成为永久目标。特征测试放进 CI，绞杀切流必须可回滚；大爆炸重写只有在旧解决方案已无法在现代 VS 打开时才立项。包裹旧 COM/4.8 模块时先画适配层，再谈删除；\`bindingRedirect\` 清零是迁出 Framework 的验收项之一。特征测试先锁行为，再谈“写得更现代”。没有快照就不要改账务路径。回滚预案写进切流清单。

### 生产检查

1. 是否先建立了行为快照测试与业务指标基线？
2. 升级是否按“库 → 壳 → 数据”分阶段，每步可回滚？
3. 流量切换是否有粘性与回滚预案？
4. 双写不一致是否有人工核对与告警？
5. 遗留路径的退役是否有明确日期与下线清单？
`,
    code: `// —— 1. 绞杀者路由：粘性哈希灰度切流 ——
var router = new StranglerRouter(newTrafficRatio: 0.7m);
var counters = new Dictionary<string, int>();
foreach (int i in Enumerable.Range(1, 1_000))
{
    string backend = router.Route($"order-{i}");
    counters[backend] = counters.GetValueOrDefault(backend) + 1;
}
Console.WriteLine($"流量分布：legacy={counters.GetValueOrDefault("legacy")}，modern={counters.GetValueOrDefault("modern")}（目标 7:3）");

// —— 2. 双读对比：验证新旧实现输出等价 ——
for (int i = 0; i < 3; i++)
{
    string id = $"orders-{2025 + i}";
    string legacy = LegacyReport.Render(id);
    string modern = ReportRenderer.Render(id);
    Console.WriteLine($"双读一致：{legacy == modern}（{id}）");
}

// —— 3. [Obsolete] 驱动调用点收敛（演示中允许调用）——
#pragma warning disable CS0618
string preview = LegacyReport.Render("orders-2026");
#pragma warning restore CS0618
Console.WriteLine($"遗留入口输出：{preview}");

public static class LegacyReport
{
    [Obsolete("自 2026-03 起改用 ReportRenderer.Render，v3.0 移除")]
    public static string Render(string source) => ReportRenderer.Render(source); // 转发壳
}

public static class ReportRenderer
{
    public static string Render(string source) => $"legacy::{source}::rows=7"; // 迁移期保持输出兼容
}

public sealed class StranglerRouter(decimal newTrafficRatio)
{
    private readonly decimal _newTrafficRatio = newTrafficRatio;

    // 粘性路由：同一 ID 永远走同一后端，便于对比与排障
    public string Route(string requestId)
    {
        uint hash = 2166136261u;
        foreach (char c in requestId)
        {
            hash = (hash ^ c) * 16777619u;
        }
        decimal point = hash % 10_000m / 10_000m;
        return point < _newTrafficRatio ? "modern" : "legacy";
    }
}
`,
    lang: "cs",
  },
];

export { chapters };
