// =============================================================
// Blog 系统教程 —— 第二批章节（JWT 认证与博客业务，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. blog-password       — 密码哈希与用户注册
//   2. blog-jwt-principle  — JWT 原理详解
//   3. blog-jwt-fastapi    — JWT 实战：FastAPI 集成认证
//   4. blog-crud           — 博客文章 CRUD API
//   5. blog-deploy         — 异常处理、CORS 与部署
//
// 运行环境：macOS python3 沙箱，已安装 fastapi 0.109.0、pydantic 2.13.4、
//          sqlalchemy 2.0.25、passlib 1.7.4、bcrypt 5.0.0、PyJWT 2.13.0、httpx 0.25.2。
//
// 关键技巧：每章 code 字段都用 FastAPI 的 TestClient 在进程内发起真实请求，
//          无需启动 uvicorn 服务器即可看到真实的 HTTP 状态码与响应体。
//          JWT 章节会真实签发和验证 token，CRUD 章节使用 SQLAlchemy + SQLite
//          内存库（StaticPool 保证跨线程共享同一内存库）。
//
// 注意：passlib 1.7.4 与 bcrypt 4+/5+ 存在兼容性问题（bcrypt 移除了 __about__
//       属性且对超过 72 字节的密码抛错），代码中通过一段兼容 shim 解决，
//       该 shim 还原了 bcrypt 规范要求的 72 字节截断行为。
//
// 转义约定：content 与 code 均为反引号模板字符串，内部所有反引号已转义为 \`，
//          三反引号已转义为 \`\`\`，${ 序列已转义为 \${。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：密码哈希与用户注册
  // =========================================================
  {
    id: "blog-password",
    title: "密码哈希与用户注册",
    icon: "🔐",
    group: "JWT 认证与博客业务",
    content: `## 一、为什么绝对不能明文存密码

每个后端开发者入行第一课都该是：**永远不要把用户密码明文存进数据库**。这不是建议，是底线。原因有三层：

1. **数据库泄露频发**：SQL 注入、备份文件外泄、内部人员导出、云服务商被攻破……历史上 LinkedIn、CSDN、Adobe、RockYou 等数亿级密码泄露事件反复证明，"数据库是安全的"这个假设根本不成立。一旦明文密码泄露，攻击者可以直接登录用户的所有账号——因为人类习惯在多个网站复用同一个密码。

2. **内部人员风险**：能访问数据库的 DBA、运维、甚至开发，都能看到明文密码。你不能要求每个有数据库权限的人都是圣人。哈希后，任何人都"看不到"原始密码，从机制上消除了这一风险。

3. **法规合规**：GDPR、《个人信息保护法》、《网络安全法》等都把密码列为敏感个人信息，明文存储属于未尽到安全保护义务，出事要承担法律责任。

所以密码必须以一种**无法还原**的方式存进数据库——这就是哈希（hash）。

---

## 二、哈希 vs 加密 vs 编码：三个常被混淆的概念

| 概念 | 方向 | 举例 | 能否还原 | 用途 |
| --- | --- | --- | --- | --- |
| **哈希 hash** | 单向 | MD5、SHA256、bcrypt | 否（不可逆） | 完整性校验、密码存储 |
| **加密 encrypt** | 双向 | AES、RSA | 能（用密钥解密） | 保护机密数据、通信 |
| **编码 encode** | 可逆 | Base64、URL编码 | 能（无需密钥） | 数据格式转换、传输 |

- **哈希**是单向的：\`hash("hello")\` 产出一段定长字节，但拿到这段字节你**无法算回** \`"hello"\`。密码存储就靠这个特性——数据库里只存哈希值，用户登录时把输入的密码再哈希一次，和数据库里的比对，相同则认证通过。即便数据库泄露，攻击者也拿不到明文。
- **加密**是双向的：\`encrypt("hello", key)\` 产出密文，\`decrypt(密文, key)\` 能还原。加密**需要密钥**。如果用加密存密码，那密钥存在哪？密钥一旦泄露，所有密码全曝光——所以加密不适合存密码。
- **编码**只是格式转换，没有任何安全性。\`base64("hello")\` 谁都能解，**把密码 base64 一下存起来等于明文存储**，这是新手常犯的错误。

> 一句话：**密码存哈希，不存加密，更不存编码。**

---

## 三、为什么 MD5 / SHA256 不能存密码

MD5 和 SHA256 都是**通用哈希函数**，设计目标是"快"——为了能高速校验大文件的完整性。但"快"对密码存储是致命的：

1. **彩虹表攻击**：攻击者提前把常见密码的 MD5 全算一遍（"123456" → \`e10adc...\`），存成一张表（彩虹表）。拿到数据库里的 MD5，反查一下就还原了。整个反查过程秒级完成。而人类密码高度集中——Top 1000 万密码覆盖了 90% 以上的用户。

2. **暴力破解速度极快**：现代 GPU 每秒能算几亿次 SHA256。一个 8 位数字+字母密码的全部组合（62^8 ≈ 218 万亿）看似很多，但在 GPU 集群面前几天就跑完。MD5 更快，每秒能算几十亿次。

通用哈希函数"快"的本意是好的（校验文件要快），但对密码场景，**快=不安全**。我们需要一种**故意很慢**的哈希函数，让暴力破解的成本高到不划算——这就是 bcrypt。

---

## 四、bcrypt 原理：慢哈希 + 盐 + 工作因子

bcrypt 是 1999 年由 Niels Provos 设计的密码哈希算法，专门为存密码而生。它有三个核心特性：

### 1. 慢哈希（故意慢）

bcrypt 基于 Blowfish 加密算法改造，**故意把速度压到毫秒级**（而 SHA256 是纳秒级，差 10 万倍）。一次哈希大约耗时 100~300ms（取决于 cost），对单次登录毫无影响，但攻击者暴力破解 1 亿个密码需要几年——经济上不划算。

### 2. 内置随机盐（salt）

**盐**是一段随机字符串，和密码拼接后再哈希。盐的作用是让**相同密码产生不同的哈希值**，从而让彩虹表失效。

- 不加盐：\`hash("123456")\` → 所有用 123456 的用户哈希值相同，攻击者一次批量破解。
- 加盐：\`hash("123456" + 随机盐)\` → 每个用户的盐不同，哈希值不同，攻击者只能逐个破解。

bcrypt **内置**了盐的生成和存储——你不需要单独建一个 salt 字段，盐直接编码在哈希字符串里。

### 3. 工作因子（cost factor）

bcrypt 有一个 \`cost\` 参数（4~31），决定哈希的迭代轮数 \`2^cost\` 次。cost=10 表示做 1024 轮，cost=12 表示 4096 轮。**cost 越高越慢越安全**。

关键优势：**cost 可以后续调高**。随着硬件变快，你把 cost 从 10 调到 12，安全性就提升了 4 倍。这是 MD5/SHA 做不到的——它们没有可调节的强度参数。

---

## 五、bcrypt 输出结构

一个 bcrypt 哈希字符串长这样：

\`\`\`
$2b$12$N9qo8uLOickgx2ZMRZoMy.MrqK03pG8mF5VlkvZdREa3J3Q8ePvCa
\`\`\`

用 \`$\` 分成四段：

| 段 | 值 | 含义 |
| --- | --- | --- |
| 算法标识 | \`2b\` | bcrypt 版本（2a/2b/2y） |
| cost | \`12\` | 工作因子，2^12=4096 轮 |
| salt | \`N9qo8uLOickgx2ZMRZoMy.\` | 22 字符 Base64 编码的盐（16 字节） |
| hash | \`MrqK03pG8mF5VlkvZdREa3J3Q8ePvCa\` | 31 字符 Base64 编码的哈希值（23 字节） |

注意：**盐和哈希编码在同一个字符串里**。验证时 bcrypt 会从字符串中解析出 salt 和 cost，用它们重新算一遍哈希，再和字符串末尾的 hash 段比对。所以你只需要存这一个字符串，不需要单独存 salt。

---

## 六、passlib 库：CryptContext

直接用 \`bcrypt\` 模块也能干活，但社区更常用 **passlib** 这个上层封装。它的核心是 \`CryptContext\`：

\`\`\`python
from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd.hash("mypassword")   # 哈希
pwd.verify("mypassword", hashed)  # 验证，返回 True/False
\`\`\`

\`CryptContext\` 的好处：

- **算法可切换**：\`schemes=["bcrypt"]\` 声明用 bcrypt，将来想换 argon2 只改这一行，老代码的 \`hash\`/\`verify\` 调用不用动。
- **deprecated="auto"**：自动处理旧算法的迁移，验证时如果发现是旧算法哈希，会用新算法重新哈希。
- **自动管理 cost**：可以用 \`bcrypt__rounds=12\` 指定 cost，集中配置。

> ⚠️ **环境陷阱**：passlib 1.7.4 与 bcrypt 4+/5+ 存在兼容性问题（bcrypt 移除了 \`__about__\` 属性，且对超过 72 字节的密码直接抛错而非截断）。本章代码包含一段兼容 shim 来解决此问题，还原了 bcrypt 规范要求的 72 字节截断行为。

---

## 七、用户注册流程

一个标准的注册接口流程：

1. **校验用户名唯一**：查库，若已存在返回 400。
2. **校验密码强度**：最小长度（≥6 或 ≥8）、复杂度（字母+数字）。
3. **哈希密码**：\`pwd.hash(password)\`。
4. **存库**：用户名 + 哈希值（不存明文）。
5. **返回**：用户信息（**绝不返回密码字段**，哪怕是哈希值）。

\`\`\`python
@app.post("/register", status_code=201)
def register(body: RegisterIn):
    if body.username in db:
        raise HTTPException(400, "用户名已存在")
    db[body.username] = {
        "username": body.username,
        "password_hash": pwd.hash(body.password),
    }
    return {"id": ..., "username": body.username}  # 不含密码
\`\`\`

密码强度校验放在 Pydantic 模型里用 \`@field_validator\` 实现，框架会自动返回 422（Unprocessable Entity）并附带错误详情。

---

## 八、常见陷阱

1. **改密码后旧 hash 仍"有效"**：这是 bcrypt 的特性——每个 hash 自带 salt，互不影响。改密码只是替换了库里的 hash 字符串，旧 hash 不能再登录（因为已经被覆盖）。但如果数据库被备份了旧版本，旧密码仍能从备份里验证。**对策**：改密码时让所有已签发的 JWT 失效（通过 token 黑名单或版本号）。

2. **bcrypt 72 字节截断**：bcrypt 只处理密码的前 72 字节，超出的部分被丢弃。这意味着 \`"a"*100\` 和 \`"a"*72 + "xyz"\` 的哈希**相同**。**对策**：要么限制密码长度 ≤72 字节，要么在哈希前先做一次 SHA256（\`bcrypt(sha256(pw))\`），passlib 默认就是这么做的（\`bcrypt_sha256\` scheme）。

3. **把哈希值当密码返回**：哈希值虽然不可逆，但不应返回给前端——它属于敏感信息，泄露后攻击者可以离线暴力破解。

4. **cost 设太高**：cost=20 一次哈希要几秒，登录体验崩溃。推荐 cost=12（约 250ms），兼顾安全和体验。

---

## 九、bcrypt vs scrypt vs argon2

| 算法 | 抗 GPU | 抗 ASIC | 内存硬度 | 推荐 |
| --- | --- | --- | --- | --- |
| **bcrypt** | 一般 | 一般 | 否 | 仍广泛使用，够用 |
| **scrypt** | 好 | 好 | 是 | 比 bcrypt 更抗硬件破解 |
| **argon2** | 最好 | 最好 | 是（可调） | 2015 年密码哈希竞赛冠军，新项目首选 |

argon2 是目前最先进的密码哈希算法，支持调节**内存**和**CPU**两个维度。但 bcrypt 依然是工业主流（兼容性最好），新项目若环境支持可直接上 argon2。

---

## 深入补充：哈希原理、攻击向量与密码策略

### A. 哈希函数的数学基础

哈希函数 \`H\` 是一个将任意长度输入映射为定长输出的数学函数：\`H: {0,1}* → {0,1}^n\`。以 SHA256 为例，无论输入是 1 字节还是 1GB，输出永远是 256 位（32 字节）。理想的密码学哈希函数具备四个性质：

- **确定性**：相同输入永远产生相同输出。\`SHA256("abc")\` 在任何机器上算都是 \`ba7816bf...\`。
- **雪崩效应**：输入改 1 个比特，输出约一半的比特发生变化。
- **抗碰撞**：找不到两个不同输入 \`x ≠ y\` 使 \`H(x) = H(y)\`。SHA256 输出空间有 \`2^256\` 种可能，远超宇宙原子数，碰撞概率可忽略。
- **抗原像性**：给定哈希值 \`h\`，找不到 \`x\` 使 \`H(x) = h\`。这正是密码存储的安全基石——攻击者拿到哈希值，无法在多项式时间内反推密码。

\`\`\`python
import hashlib
h1 = hashlib.sha256(b"hello").hexdigest()
h2 = hashlib.sha256(b"hellp").hexdigest()  # 只改了一个字符
print(h1)  # 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
print(h2)  # 完全不同
print(sum(a != b for a, b in zip(h1, h2)), "个字符不同")  # 约 32 个（64 的一半）
\`\`\`

### B. 彩虹表攻击是如何工作的

**彩虹表**是一种空间优化的预计算表，用于反查哈希值。朴素做法是存 \`{(密码, 哈希)}\` 全表，但存储量极大。彩虹表用**哈希链**压缩：定义一个还原函数 \`R\`（把哈希值映射回密码空间），交替执行 \`H\` 和 \`R\`：

\`\`\`
p1 →H→ h1 →R→ p2 →H→ h2 →R→ ... → pn
\`\`\`

只存每条链的起点 \`p1\` 和终点 \`pn\`。查询时对目标哈希反复套 \`R\`/\`H\`，命中某条链终点后从起点重放找到原文。一张表能覆盖海量密码，存储却只需链端点。

加盐后彩虹表彻底失效——每个用户的 salt 不同，攻击者必须为每个 salt 单独造一张表，等于退化成逐用户暴力破解。

| 防御手段 | 原理 | 效果 |
| --- | --- | --- |
| 加盐 | 每用户不同 salt | 彩虹表完全失效 |
| 慢哈希 | bcrypt/scrypt 故意慢 | 造表成本指数级上升 |
| 长密码 | ≥12 位随机 | 搜索空间大到无法穷举 |

### C. salt 作用机制图解

\`\`\`
不加盐：
  用户A 密码 "123456" → hash → e10adc... ←┐ 相同！可批量破解
  用户B 密码 "123456" → hash → e10adc... ←┘

加盐（bcrypt 内置）：
  用户A "123456" + salt_A(x7K!...) → hash → a3f9c2...
  用户B "123456" + salt_B(p2Rm...) → hash → b8e1d7...
  哈希不同，攻击者只能逐个破解
\`\`\`

bcrypt 把 salt 编码进哈希字符串（前文讲过的 \`$2b$12$N9qo8uLOickgx2ZMRZoMy.\` 段），验证时自动取出。每个用户的 salt 随机生成（16 字节熵），即便两个用户密码相同，哈希值也完全不同。**salt 不需要保密**——它的作用不是"加密"，而是"让每个用户的哈希独立"，所以明文存在哈希字符串里也没问题。

### D. bcrypt 工作因子（cost）调优详解

cost 每提高 1，耗时翻倍（\`2^cost\` 轮）：

| cost | 轮数 | 大约耗时（现代 CPU） | 适用场景 |
| --- | --- | --- | --- |
| 8 | 256 | ~10ms | 测试/开发 |
| 10 | 1024 | ~60ms | 低安全要求 |
| 12 | 4096 | ~250ms | **推荐默认** |
| 14 | 16384 | ~1s | 高安全 |
| 16 | 65536 | ~4s | 极高安全（登录体验差） |

**调优原则**：在不影响登录体验的前提下尽量高。人类对 <300ms 的延迟几乎无感，cost=12 是甜点。cost 编码在哈希字符串里，调高后旧用户登录时 passlib 的 \`deprecated="auto"\` 会自动用新 cost 重新哈希——无缝升级，无需批量迁移。

\`\`\`python
from passlib.context import CryptContext
import time
pwd = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12)
t = time.time()
h = pwd.hash("test123")
print(f"cost=12 耗时: {(time.time()-t)*1000:.0f}ms")
# 验证密码时同样耗时，攻击者暴力破解每个候选都要花这么久
\`\`\`

> ⚠️ **常见陷阱**：cost 设太高（如 20）一次哈希要几秒，登录接口超时，用户以为系统坏了。生产环境务必先 benchmark 再定 cost。

### E. argon2 vs bcrypt 深度对比

| 维度 | bcrypt | argon2id |
| --- | --- | --- |
| 设计年代 | 1999 | 2015（PHC 竞赛冠军） |
| 抗 GPU | 一般（GPU 能并行加速） | 强（内存硬度限制并行） |
| 抗 ASIC | 弱 | 强（需大量内存，ASIC 造不起） |
| 内存可调 | 否（固定 4KB） | 是（\`memory_cost\` 参数） |
| 时间可调 | 是（cost） | 是（\`time_cost\` 参数） |
| 并行度可调 | 否 | 是（\`parallelism\` 参数） |
| 72 字节限制 | 有 | 无 |
| 生态成熟度 | 极高（几乎所有语言支持） | 高（新项目首选） |

argon2 的核心创新是**内存硬度**：哈希过程占用大量内存（如 64MB）。GPU 虽有数千核心但每核心内存很少，无法并行运行多个 argon2 实例，从而抵消了 GPU 的并行优势。

\`\`\`python
# argon2 用法（需安装 argon2-cffi）
from argon2 import PasswordHasher
ph = PasswordHasher(memory_cost=65536, time_cost=3, parallelism=4)  # 64MB, 3 轮, 4 线程
h = ph.hash("mypassword")
ph.verify(h, "mypassword")  # True
\`\`\`

**选型建议**：新项目环境支持就用 argon2id；老项目或需广泛兼容用 bcrypt（cost≥12）。两者都比 MD5/SHA 强无数倍。

### F. 密码策略最佳实践

| 层面 | 建议 | 原因 |
| --- | --- | --- |
| 最小长度 | ≥8 位（NIST 建议），推荐 ≥12 | 长度比复杂度更能抵抗暴力破解 |
| 复杂度 | 不强制特殊字符（NIST 800-63B 新规） | 强制复杂度导致 \`Password1!\` 这类可预测弱密码 |
| 黑名单 | 拒绝已知泄露密码（如 HaveIBeenPwned API） | 阻止 \`123456\`、\`password\` 等高频密码 |
| 唯一性 | 拒绝与历史密码相同 | 防止循环使用 |
| 截断 | bcrypt 限 72 字节，超长先 SHA256 | 避免截断导致碰撞 |
| 存储 | 只存 bcrypt/argon2 哈希 | 单向不可逆 |
| 传输 | 全程 HTTPS | 防中间人窃听 |
| 重置 | 一次性 token（短时效），不存明文 | 安全重置流程 |

> 💡 **面试要点**：NIST 800-63B（2017）颠覆了传统密码建议——不再要求"必须含大小写+数字+特殊字符"，而是强调**长度**和**黑名单**。因为强制复杂度反而让用户产生可预测变形（\`Spring2024!\`、\`P@ssw0rd1\`），更容易被字典攻击猜中。面试时提到这一点能体现你对安全规范更新的关注。

### G. 内部实现细节：bcrypt 的 EksBlowfish 算法

bcrypt 内部并非简单迭代 SHA，而是基于 **Blowfish 加密算法**改造的 **EksBlowfish**（Expensive Key Schedule Blowfish）：

1. 用密码和 salt 初始化 Blowfish 的 P-box 和 S-box（这一步故意做得很慢，称为 "expensive key schedule"）。
2. 重复 \`2^cost\` 轮加密一个固定常量字符串 "OrpheanBeholderScryDoubt"（24 字节）。
3. 输出最终密文作为哈希值（23 字节，Base64 编码后 31 字符）。

这种设计的关键在于：**key schedule 不可被并行化**（每轮依赖上一轮状态），所以 GPU 的并行优势被削弱。而通用哈希（SHA256）每轮独立，GPU 可以同时计算数百万个。

> 🔒 **最佳实践总结**：密码存储 = argon2id（或 bcrypt cost≥12）+ 每用户随机 salt + 不返回哈希值 + 改密码让旧 token 失效 + 全程 HTTPS。这五条做到了，密码安全就达标了。

---

## 十、本章小结

- 密码**只存哈希**，不存明文/加密/编码。
- MD5/SHA 太快，扛不住彩虹表和 GPU 暴力破解，不能存密码。
- bcrypt = 慢哈希 + 内置盐 + 可调 cost，是密码存储的工业标准。
- bcrypt 哈希字符串自带 salt 和 cost，只存一个字符串即可。
- passlib 的 \`CryptContext\` 是上层封装，算法可切换、cost 可配置。
- 注册流程：校验唯一 → 校验强度 → 哈希 → 存库 → 返回（不含密码）。
- 陷阱：72 字节截断、cost 不能太高、改密码要让旧 token 失效。

下一章我们讲 JWT——登录成功后怎么发一个"通行证"让用户后续请求带上。`,
    code: `# ============================================================
# 第一章代码演示：密码哈希与用户注册
# ------------------------------------------------------------
# 演示内容：
#   1. passlib CryptContext 哈希与验证（含每次 salt 不同的演示）
#   2. FastAPI + SQLite 内存库实现 POST /register 接口
#   3. TestClient 测试：注册成功(201)、重复用户名(400)、密码太短(422)
#   4. 打印存储的用户，确认密码是 hash 不是明文
# ============================================================

# ---- passlib 1.7.4 与 bcrypt 4+/5+ 的兼容性 shim ----
# passlib 期望 bcrypt.__about__.__version__ 存在；bcrypt 5 移除了它。
# 同时 bcrypt 5 对超过 72 字节的密码抛 ValueError，而 bcrypt 规范
# 要求截断到 72 字节。这里还原该行为，让 passlib 正常工作。
import bcrypt as _bcrypt
if not hasattr(_bcrypt, "__about__"):
    class _About:
        __version__ = getattr(_bcrypt, "__version__", "4.0.0")
    _bcrypt.__about__ = _About()
_orig_hashpw, _orig_checkpw = _bcrypt.hashpw, _bcrypt.checkpw
def _hashpw(secret, salt):
    if isinstance(secret, str):
        secret = secret.encode("utf-8")
    return _orig_hashpw(secret[:72], salt)
def _checkpw(secret, hashed):
    if isinstance(secret, str):
        secret = secret.encode("utf-8")
    return _orig_checkpw(secret[:72], hashed)
_bcrypt.hashpw = _hashpw
_bcrypt.checkpw = _checkpw

from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, field_validator

# 创建 CryptContext，指定用 bcrypt 算法
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("========== 1. 哈希与验证演示 ==========")
password = "mySecret123"
h1 = pwd_ctx.hash(password)
h2 = pwd_ctx.hash(password)
print("原始密码:", password)
print("第一次哈希:", h1)
print("第二次哈希:", h2)
print("两次哈希不同（每次随机 salt）:", h1 != h2)
print("验证正确密码:", pwd_ctx.verify(password, h1))
print("验证错误密码:", pwd_ctx.verify("wrong", h1))

# 解析 bcrypt 哈希结构
parts = h1.split("$")
print("bcrypt 结构: 算法=%s, cost=%s, salt+hash 长度=%d" % (parts[1], parts[2], len(parts[3])))

print("\\n========== 2. 注册接口演示 ==========")
app = FastAPI()
db = {}  # 内存数据库: username -> user dict

class RegisterIn(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def check_password(cls, v):
        if len(v) < 6:
            raise ValueError("密码至少 6 位")
        if not any(c.isdigit() for c in v) or not any(c.isalpha() for c in v):
            raise ValueError("密码必须包含字母和数字")
        return v

@app.post("/register", status_code=201)
def register(body: RegisterIn):
    if body.username in db:
        raise HTTPException(status_code=400, detail="用户名已存在")
    db[body.username] = {
        "id": len(db) + 1,
        "username": body.username,
        "password_hash": pwd_ctx.hash(body.password),  # 只存哈希
    }
    # 返回时绝不包含 password_hash
    return {"id": db[body.username]["id"], "username": body.username}

client = TestClient(app)

# 场景 1: 注册成功
r = client.post("/register", json={"username": "alice", "password": "secret123"})
print("注册 alice:", r.status_code, r.json())

# 场景 2: 重复用户名
r = client.post("/register", json={"username": "alice", "password": "secret456"})
print("重复注册:", r.status_code, r.json())

# 场景 3: 密码太短（Pydantic 校验失败 → 422）
r = client.post("/register", json={"username": "bob", "password": "123"})
print("密码太短:", r.status_code, "(422 校验失败)")

# 场景 4: 密码不含字母
r = client.post("/register", json={"username": "bob", "password": "1234567890"})
print("密码无字母:", r.status_code, "(422 校验失败)")

# 场景 5: 再注册一个合法用户
r = client.post("/register", json={"username": "bob", "password": "bobpass99"})
print("注册 bob:", r.status_code, r.json())

print("\\n========== 3. 数据库存储内容 ==========")
for username, user in db.items():
    print("用户:", username)
    print("  id:", user["id"])
    print("  password_hash:", user["password_hash"][:30] + "...")
    print("  是明文吗:", user["password_hash"] == "secret123")
    print("  是 bcrypt 吗:", user["password_hash"].startswith("$2b$"))
`,
  },

  // =========================================================
  // 第二章：JWT 原理详解
  // =========================================================
  {
    id: "blog-jwt-principle",
    title: "JWT 原理详解",
    icon: "🔑",
    group: "JWT 认证与博客业务",
    content: `## 一、JWT 是什么

**JWT（JSON Web Token）** 是 RFC 7519 定义的一种**紧凑、自包含**的令牌格式，用于在各方之间安全传递 JSON 信息。它最典型的用途是**无状态认证**：用户登录后服务器发一个 JWT，客户端后续请求带上它，服务器验证签名即可确认身份，**无需在服务端存储 session**。

一个 JWT 长这样（三段用 \`.\` 分隔）：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

三段分别是：**Header**（头部）.\**Payload**（载荷）.\**Signature**（签名）。

---

## 二、为什么需要 JWT：传统 Session 的痛点

传统的 Session 认证流程是：用户登录 → 服务器在内存/Redis 里存一条 session（session_id → 用户信息）→ 把 session_id 通过 Cookie 返回 → 后续请求带上 Cookie → 服务器查 session。

这套机制在单体时代没问题，但在现代分布式场景暴露了四大痛点：

1. **服务端要存状态**：每个用户的 session 都占内存。用户多了，session 存储成为瓶颈，必须上 Redis 集群。
2. **扩展难**：用户请求打到 A 服务器，但 session 在 B 服务器——要么 session 共享（Redis），要么粘性会话（负载均衡按用户路由），都增加复杂度。
3. **跨域困难**：Cookie 受同源策略限制，跨域时要么用 CORS 配合 \`credentials\`，要么搞代理，移动端 App 根本不用 Cookie。
4. **CSRF 风险**：浏览器自动带 Cookie，容易被 CSRF 攻击利用。

JWT 的解法是**把状态塞进 token 本身**：服务器签发一个包含用户信息的 token，**自己不存任何东西**，后续只要验证签名有效即可。这样任何一台服务器都能独立验证，天然支持水平扩展。

| 维度 | Session | JWT |
| --- | --- | --- |
| 状态存储 | 服务端（内存/Redis） | 客户端（token 自包含） |
| 扩展性 | 需共享 session | 任意服务器独立验证 |
| 跨域 | 受 Cookie 限制 | 放 Header，无跨域问题 |
| 撤销 | 删 session 即可 | 难（需黑名单） |
| 移动端 | 不友好 | 友好 |
| 大小 | session_id 很短 | token 较长（数百字节） |

---

## 三、JWT 三段结构详解

### 1. Header（头部）

Header 是一个 JSON，描述 token 的**元信息**：

\`\`\`json
{"alg": "HS256", "typ": "JWT"}
\`\`\`

- \`alg\`：签名算法，常见 \`HS256\`（HMAC-SHA256，对称）、\`RS256\`（RSA-SHA256，非对称）、\`ES256\`（ECDSA）。
- \`typ\`：固定为 \`JWT\`。

Header 被 Base64URL 编码后成为 token 的第一段。

### 2. Payload（载荷）

Payload 是一个 JSON，存放**声明（claims）**——即要传递的信息。声明分三类：

**标准声明（registered claims）**——RFC 7519 预定义的：

| 声明 | 全称 | 含义 |
| --- | --- | --- |
| \`iss\` | issuer | 签发者 |
| \`sub\` | subject | 主题（通常是用户 ID） |
| \`aud\` | audience | 接收方 |
| \`exp\` | expiration | 过期时间（Unix 时间戳） |
| \`nbf\` | not before | 生效时间 |
| \`iat\` | issued at | 签发时间 |
| \`jti\` | JWT ID | 唯一标识（防重放） |

**私有声明（private claims）**——双方约定的自定义字段，如 \`{"role": "admin", "username": "alice"}\`。

Payload 同样被 Base64URL 编码成第二段。

> ⚠️ **关键认知**：Payload **只是编码，不是加密**！任何人都能 Base64 解码看到内容。**绝不要在 Payload 里放密码、身份证号等敏感信息。**

### 3. Signature（签名）

签名是 JWT 安全的核心。算法：

\`\`\`
signature = HMACSHA256(
    base64url(header) + "." + base64url(payload),
    secret
)
\`\`\`

把 Header 和 Payload 拼起来，用密钥做一次 HMAC-SHA256，得到签名，Base64URL 编码后成为第三段。

**签名的作用是防篡改**：攻击者即使改了 Payload（比如把 \`role: user\` 改成 \`role: admin\`），但他不知道 secret，算不出新的正确签名——服务器一验证就发现签名不匹配，拒绝。

> **再次强调**：JWT 默认**不加密**，只签名。签名保证"内容没被篡改"，但不保证"内容不可读"。需要加密传输请用 HTTPS，或用 JWE（JSON Web Encryption）。

---

## 四、Base64URL 编码 vs Base64

JWT 用的是 **Base64URL**，不是标准 Base64。区别：

| 特性 | Base64 | Base64URL |
| --- | --- | --- |
| \`+\` | 有 | 替换为 \`-\` |
| \`/\` | 有 | 替换为 \`_\` |
| \`=\` 填充 | 有 | 去掉 |

为什么要用 Base64URL？因为 JWT 经常放在 URL 里（如 \`?token=xxx\`），而标准 Base64 的 \`+\` 和 \`/\` 在 URL 里有特殊含义（\`+\` 是空格，\`/\` 是路径分隔），会引起歧义。Base64URL 把它们换成 URL 安全的字符，并去掉 \`=\` 填充。

Python 里用 \`base64.urlsafe_b64encode\` 即可，但要手动 \`rstrip(b"=")\` 去掉填充。

---

## 五、HS256 vs RS256：对称 vs 非对称

| 维度 | HS256 | RS256 |
| --- | --- | --- |
| 算法 | HMAC + SHA256 | RSA 签名 |
| 密钥 | 单一 secret（对称） | 公钥/私钥对（非对称） |
| 签发 | 用 secret 签 | 用私钥签 |
| 验证 | 用同一个 secret 验 | 用公钥验 |
| 适用 | 单体应用、自己签自己验 | 微服务、多方验证 |
| 性能 | 快 | 稍慢（RSA 运算重） |

- **HS256**：简单，签发和验证用同一个 secret。适合"我自己签自己验"的场景。缺点是 secret 一旦泄露，攻击者既能伪造 token 又能验证——权限没分离。
- **RS256**：私钥签发，公钥验证。认证服务器持有私钥，其他服务只有公钥——它们能验证 token 但不能签发。**权限分离**，安全性更高，适合微服务架构。

---

## 六、JWT 生命周期

\`\`\`
1. 用户登录（POST /token, username + password）
       ↓
2. 服务器验证密码正确
       ↓
3. 服务器用 secret 签发 JWT（含 sub、exp 等）
       ↓
4. 返回 token 给客户端
       ↓
5. 客户端把 token 存起来（localStorage / Cookie）
       ↓
6. 后续请求带 Authorization: Bearer <token>
       ↓
7. 服务器验证签名 + 检查 exp → 通过则处理请求
       ↓
8. token 过期 → 客户端重新登录（或用 refresh token 换新的）
\`\`\`

---

## 七、JWT 的陷阱与安全

1. **不能主动撤销**：JWT 一旦签发，在 exp 之前一直有效。用户改密码、退出登录，token 依然能用（服务器没存任何状态）。**对策**：维护一个 token 黑名单（但这就牺牲了无状态的优势），或缩短 exp（如 15 分钟）+ refresh token。

2. **Payload 不要放敏感信息**：Payload 可被任何人 Base64 解码读取。放用户 ID、角色可以，放密码、密钥绝对不行。

3. **secret 必须保密**：secret 泄露 = 整个认证体系崩溃（攻击者能伪造任意用户的 token）。secret 要足够长（≥32 字节）、存在环境变量/密钥管理服务、绝不硬编码进代码、绝不提交到 Git。

4. **必须设 exp**：不设 exp 的 token 永久有效，一旦泄露无法挽回。推荐 access token exp=15~30 分钟，refresh token exp=7~30 天。

5. **算法不要信 Header**：验证时**必须显式指定算法**（\`algorithms=["HS256"]\`），不能从 token 的 Header 里读 \`alg\`。否则有"alg=none"攻击风险——攻击者把 alg 改成 none，签名留空，某些库会跳过验证。

---

## 八、Refresh Token 机制

access token 短命（15 分钟）能降低泄露风险，但用户每 15 分钟就要重新登录，体验差。refresh token 解决这个矛盾：

- **access token**：短命（15 分钟），用于业务请求。
- **refresh token**：长命（7 天），只用于换新的 access token，不用于业务。
- 流程：access token 过期 → 客户端用 refresh token 调 \`/token/refresh\` → 服务器签发新的 access token。

refresh token 通常存在数据库（可撤销），access token 不存库（纯无状态）。这样兼顾了安全和体验。

---

## 深入补充：编码细节、签名原理与安全陷阱

### A. Base64URL 编码细节

标准 Base64 用 \`A-Za-z0-9+/\` 共 64 个字符表示 6 位数据，遇到 \`+\`/\`/\`/\`=\` 在 URL 里会有歧义。JWT 选用的 **Base64URL** 做了三处替换：

| 字符 | 标准 Base64 | Base64URL | 原因 |
| --- | --- | --- | --- |
| 第 62 位 | \`+\` | \`-\` | \`+\` 在 URL query 中是空格 |
| 第 63 位 | \`/\` | \`_\` | \`/\` 是 URL 路径分隔符 |
| 填充 | \`=\` | 去掉 | \`=\` 在某些框架需转义 |

手动实现时要注意：**解码时必须先补回 \`=\` 填充**，因为 Base64 的长度必须是 4 的倍数。

\`\`\`python
import base64
def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)  # 补回被去掉的 =
    return base64.urlsafe_b64decode(s + pad)

# 验证：编码后再解码，内容一致
raw = b'{"sub":"alice"}'
print(b64url_encode(raw))  # eyJzdWIiOiJhbGljZSJ9
print(b64url_decode("eyJzdWIiOiJhbGljZSJ9"))  # b'{"sub":"alice"}'
\`\`\`

### B. HMAC-SHA256 数学原理

JWT 的 HS256 签名用的是 **HMAC**（Hash-based Message Authentication Code），它不是一个新哈希函数，而是在 SHA256 基础上封装出的**带密钥哈希**。普通 SHA256 任何人都能算，无法防篡改；HMAC 只有持有密钥的人才能算出正确结果。

HMAC 的核心思想是**双重哈希 + 密钥混合**：

\`\`\`
HMAC(key, msg) = H( (key ⊕ opad) || H( (key ⊕ ipad) || msg ) )
\`\`\`

- \`ipad\` = 0x36 重复，\`opad\` = 0x5c 重复（填充到哈希块大小）。
- \`⊕\` 是 XOR，\`||\` 是拼接。
- 先用 \`key ⊕ ipad\` 与消息拼接做内层哈希，再用 \`key ⊕ opad\` 与内层结果拼接做外层哈希。

为什么要双层？防止**长度扩展攻击**——直接用 \`SHA256(key || msg)\` 的话，攻击者可以在不知道 key 的情况下追加内容。HMAC 的双层结构阻断了这种攻击。

\`\`\`python
import hmac, hashlib
# HMAC-SHA256 签名
msg = b'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZSJ9'
secret = b'my-secret'
sig = hmac.new(secret, msg, hashlib.sha256).digest()
# 验证时用 compare_digest 防时序攻击
expected = hmac.new(secret, msg, hashlib.sha256).digest()
print(hmac.compare_digest(sig, expected))  # True
\`\`\`

> ⚠️ **常见陷阱**：验证签名时**绝不能用 \`==\` 比较**，而要用 \`hmac.compare_digest\`。\`==\` 是短路比较，逐字节返回，攻击者可通过测量响应时间逐字节猜出正确签名（时序攻击）。\`compare_digest\` 是常量时间比较，无论是否匹配都花同样时间。

### C. JWT 三段结构的字节级剖析

以一个真实 token 为例，逐段拆解：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9       ← Header（36 字符）
.
eyJzdWIiOiJhbGljZSIsImlhdCI6MTcwMDAsImV4cCI6MTcwMzYwfQ  ← Payload（52 字符）
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature（43 字符）
\`\`\`

| 段 | 解码后 | 字节数 | 作用 |
| --- | --- | --- | --- |
| Header | \`{"alg":"HS256","typ":"JWT"}\` | 27B → 36 字符 | 声明算法 |
| Payload | \`{"sub":"alice","iat":17000,"exp":170360}\` | 41B → 52 字符 | 存放声明 |
| Signature | HMAC-SHA256 输出 | 32B → 43 字符 | 防篡改 |

注意 Base64URL 编码后字符数 ≈ 字节数 × 4/3（每 3 字节编成 4 字符）。签名固定 32 字节（SHA256 输出），编码后固定 43 字符。

### D. JWS vs JWE：签名 vs 加密

JWT 家族有两个标准，常被混淆：

| 标准 | 全称 | 作用 | 内容可读 | 典型用途 |
| --- | --- | --- | --- | --- |
| **JWS** | JSON Web Signature | 签名（防篡改） | 是（Payload 仅编码） | 99% 的 JWT 场景 |
| **JWE** | JSON Web Encryption | 加密（防窃读） | 否（密文） | 高敏感数据传输 |

平时说的"JWT"默认指 JWS——它**只签名不加密**，Payload 可被任何人 Base64 解码读取。如果需要 Payload 保密（如存放信用卡号），要用 JWE，它用 AES 等算法加密 Payload，只有持有密钥的接收方才能解密。

> 💡 **最佳实践**：绝大多数认证场景用 JWS 就够了——Payload 里只放用户 ID 和角色等非敏感信息，敏感操作再查库。不要为了"保密"而用 JWE，那会增加复杂度且性能更差。

### E. JWT 安全陷阱详解

#### 陷阱 1：alg=none 攻击

JWT 规范允许 \`alg: "none"\`，表示"不签名"。攻击流程：

1. 攻击者拿到一个合法 JWT，解码 Header。
2. 把 \`alg\` 改成 \`none\`，Payload 改成 \`{"sub":"admin","role":"admin"}\`。
3. 签名段留空，得到 \`header.payload.\`。
4. 某些库（旧版本）看到 \`alg=none\` 会跳过签名验证，直接信任 Payload！

**防御**：验证时**必须显式指定允许的算法列表**：

\`\`\`python
# ✅ 正确：显式指定算法，alg=none 会被拒绝
payload = jwt.decode(token, SECRET, algorithms=["HS256"])

# ❌ 危险：从 token Header 读 alg，alg=none 会绕过验证
payload = jwt.decode(token, SECRET)  # PyJWT 新版已禁止，但旧版/其他库可能不行
\`\`\`

#### 陷阱 2：密钥混淆攻击（RS256 → HS256）

场景：服务端用 RS256（公钥验签），公钥是公开的。攻击者把 Header 的 \`alg\` 从 \`RS256\` 改成 \`HS256\`，用**公钥当 HMAC 密钥**重新签名。如果服务端验证时不检查 alg 一致性，就会用公钥做 HMAC 验证——而公钥攻击者也知道，于是伪造的 token 通过验证！

**防御**：验证时锁定算法，绝不从 Header 动态读取。用 RS256 就只接受 RS256。

#### 陷阱 3：时序攻击

用 \`==\` 比较签名会泄露信息（前面讲过）。所有签名比较必须用常量时间函数。

| 陷阱 | 根因 | 防御 |
| --- | --- | --- |
| alg=none | 信任 Header 的 alg | 显式指定 \`algorithms=["HS256"]\` |
| 密钥混淆 | 算法可切换 | 锁定算法，公钥不当 HMAC key |
| 时序攻击 | \`==\` 短路比较 | 用 \`compare_digest\` |
| Payload 泄露 | JWS 不加密 | 不放敏感信息，需要保密用 JWE |

### F. Refresh Token 机制详解

access token 短命（15 分钟）降低泄露风险，但用户每 15 分钟就要重新登录，体验差。refresh token 解决这个矛盾：

\`\`\`
┌─────────┐     1.登录(用户名+密码)      ┌─────────┐
│ 客户端  │ ──────────────────────────→ │ 服务器  │
│         │ ←── 2.access_token(15min) ── │         │
│         │ ←── 2.refresh_token(7天) ─── │         │
└─────────┘                              └─────────┘
     │                                        │
     │  3.业务请求 + access_token             │
     │ ─────────────────────────────────→     │
     │ ←── 4.业务响应 ──────────────────────  │
     │                                        │
     │  5.access_token 过期(401)              │
     │                                        │
     │  6.用 refresh_token 换新 access_token  │
     │ ─────────────────────────────────→     │
     │ ←── 7.新 access_token ───────────────  │
└─────────┘                              └─────────┘
\`\`\`

- **access token**：短命（15 分钟），用于业务请求，不存库（纯无状态）。
- **refresh token**：长命（7 天），**只用于换 access token**，不用于业务。通常存数据库（可撤销）。

refresh token 存库的意义：用户改密码或退出登录时，删除该用户的 refresh token 记录，旧 token 无法再换新 access token。这样既保留了 access token 的无状态优势，又能实现"撤销"。

\`\`\`python
# 签发 refresh token
def create_refresh_token(username: str) -> str:
    jti = uuid4().hex  # 唯一 ID，存库可撤销
    payload = {"sub": username, "type": "refresh", "jti": jti,
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    db.refresh_tokens[jti] = username  # 存库
    return jwt.encode(payload, SECRET, algorithm="HS256")

# 刷新接口
@app.post("/token/refresh")
def refresh(refresh_token: str):
    payload = jwt.decode(refresh_token, SECRET, algorithms=["HS256"])
    if payload.get("type") != "refresh":
        raise HTTPException(401, "非 refresh token")
    if payload["jti"] not in db.refresh_tokens:  # 已被撤销
        raise HTTPException(401, "token 已失效")
    return {"access_token": create_access_token(payload["sub"])}
\`\`\`

> 💡 **面试要点**：JWT 不能主动撤销是最大痛点。三种解法对比：① 黑名单（牺牲无状态）；② 短 exp + refresh token（主流方案）；③ token 版本号（用户表加 \`token_version\`，签发时写入，验证时比对，改密码时版本号+1 使旧 token 失效）。面试时说出三种方案及取舍即可。

---

## 九、本章小结

- JWT = Header.Payload.Signature，三段用 \`.\` 分隔，均 Base64URL 编码。
- Header 描述算法，Payload 存声明，Signature 防篡改。
- JWT **签名不加密**——Payload 可读，不放敏感信息。
- HS256 对称（一个 secret）、RS256 非对称（私钥签公钥验），微服务选 RS256。
- Base64URL 把 \`+\`/\`/\` 换成 \`-\`/\`_\`，去掉 \`=\`，URL 安全。
- 陷阱：不能撤销、必须设 exp、secret 保密、算法必须显式指定。
- refresh token 机制平衡了短 token 的安全与长 token 的体验。

下一章我们把 JWT 接入 FastAPI，实现完整的登录认证闭环。`,
    code: `# ============================================================
# 第二章代码演示：JWT 原理详解（手动实现 + PyJWT 对比）
# ------------------------------------------------------------
# 演示内容：
#   1. 手写 jwt_encode / jwt_decode（hmac + hashlib + base64 + json）
#   2. 用 PyJWT 库对比，验证两份 token 等价
#   3. 篡改 payload → 签名验证失败（捕获异常）
#   4. 过期 token（exp 设为过去）→ ExpiredSignatureError
#   5. 打印 token 三段结构并逐段解码
# ============================================================

import hmac
import hashlib
import json
import base64
import time

import jwt as pyjwt  # PyJWT 库

# 用一个足够长的 secret（>=32 字节），避免 PyJWT 的 InsecureKeyLengthWarning
SECRET = "my-blog-super-secret-key-32-bytes!!"
ALGO = "HS256"


# ---- 手动实现 JWT ----
def b64url_encode(data: bytes) -> str:
    """Base64URL 编码：去掉 = 填充，+ 换 -，/ 换 _"""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def b64url_decode(s: str) -> bytes:
    """Base64URL 解码：补回 = 填充"""
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def jwt_encode(payload: dict, secret: str, alg: str = "HS256") -> str:
    """手动签发 JWT"""
    header = {"alg": alg, "typ": "JWT"}
    header_b64 = b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    payload_b64 = b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{header_b64}.{payload_b64}"
    # 签名 = HMAC-SHA256(header.payload, secret)
    sig = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = b64url_encode(sig)
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def jwt_decode(token: str, secret: str) -> dict:
    """手动验证并解码 JWT"""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("token 格式错误")
    header_b64, payload_b64, sig_b64 = parts
    # 重新计算签名并比对（用 compare_digest 防时序攻击）
    signing_input = f"{header_b64}.{payload_b64}"
    expected_sig = b64url_encode(
        hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    )
    if not hmac.compare_digest(expected_sig, sig_b64):
        raise ValueError("签名无效，token 已被篡改")
    return json.loads(b64url_decode(payload_b64))


print("========== 1. 手动签发 JWT ==========")
now = int(time.time())
payload = {"sub": "alice", "iat": now, "exp": now + 3600, "role": "user"}
manual_token = jwt_encode(payload, SECRET)
print("手动签发的 token:", manual_token)
print("解码结果:", jwt_decode(manual_token, SECRET))

print("\\n========== 2. PyJWT 对比 ==========")
pyjwt_token = pyjwt.encode(payload, SECRET, algorithm=ALGO)
print("PyJWT 签发的 token:", pyjwt_token)
print("两份 token 相同:", manual_token == pyjwt_token)
print("PyJWT 解码:", pyjwt.decode(pyjwt_token, SECRET, algorithms=[ALGO]))

print("\\n========== 3. 解析 token 三段结构 ==========")
parts = manual_token.split(".")
for i, name in enumerate(["Header", "Payload", "Signature"]):
    seg = parts[i]
    if i < 2:
        decoded = json.loads(b64url_decode(seg))
        print(f"{name} ({len(seg)} 字符): {seg}")
        print(f"  解码: {decoded}")
    else:
        print(f"{name} ({len(seg)} 字符): {seg[:30]}...")

print("\\n========== 4. 篡改检测 ==========")
# 攻击者把 sub 从 alice 改成 admin，但不知道 secret，无法重算签名
tampered_payload = {"sub": "admin", "iat": now, "exp": now + 3600, "role": "admin"}
tampered_b64 = b64url_encode(json.dumps(tampered_payload, separators=(",", ":")).encode())
tampered_token = f"{parts[0]}.{tampered_b64}.{parts[2]}"
print("篡改后的 token:", tampered_token)
try:
    jwt_decode(tampered_token, SECRET)
    print("  ✗ 居然验证通过了（不应该！）")
except ValueError as e:
    print(f"  ✓ 检测到篡改: {e}")

# 用 PyJWT 验证篡改 token 也失败
try:
    pyjwt.decode(tampered_token, SECRET, algorithms=[ALGO])
except pyjwt.InvalidSignatureError as e:
    print(f"  ✓ PyJWT 也拒绝: {type(e).__name__}")

print("\\n========== 5. 过期检测 ==========")
# exp 设为 10 秒前，token 已过期
expired_payload = {"sub": "alice", "iat": now - 3700, "exp": now - 10}
expired_token = jwt_encode(expired_payload, SECRET)
print("过期 token:", expired_token)
try:
    pyjwt.decode(expired_token, SECRET, algorithms=[ALGO])
    print("  ✗ 居然验证通过了（不应该！）")
except pyjwt.ExpiredSignatureError as e:
    print(f"  ✓ 检测到过期: {type(e).__name__}")

print("\\n========== 6. 验证 secret 的重要性 ==========")
# 用错误的 secret 验证，必须失败
try:
    pyjwt.decode(manual_token, "wrong-secret", algorithms=[ALGO])
except pyjwt.InvalidSignatureError as e:
    print(f"  ✓ 错误 secret 被拒绝: {type(e).__name__}")
print("  → 这就是为什么 secret 必须保密且足够长")
`,
  },

  // =========================================================
  // 第三章：JWT 实战：FastAPI 集成认证
  // =========================================================
  {
    id: "blog-jwt-fastapi",
    title: "JWT 实战：FastAPI 集成认证",
    icon: "🛡️",
    group: "JWT 认证与博客业务",
    content: `## 一、OAuth2PasswordBearer：FastAPI 的认证流程封装

FastAPI 内置了 \`OAuth2PasswordBearer\`，它实现了 OAuth2 的"密码模式"（Password Flow）：用户用用户名密码换 token，后续请求带 token 访问。这个类做了三件事：

1. **声明 token 获取地址**：\`tokenUrl="/token"\` 告诉前端"去这个 URL 拿 token"。
2. **自动从请求头提取 token**：从 \`Authorization: Bearer <token>\` 里解析出 token。
3. **生成 Swagger UI 的 Authorize 按钮**：让 API 文档页面可以直接登录测试。

\`\`\`python
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
\`\`\`

\`oauth2_scheme\` 本身可以当依赖用——\`token: str = Depends(oauth2_scheme)\` 会自动从 Header 提取 token 字符串。如果请求没带 token，FastAPI 直接返回 401（带 \`WWW-Authenticate: Bearer\` 头）。

---

## 二、登录流程：OAuth2PasswordRequestForm

登录端点 \`POST /token\` 接收的不是 JSON，而是 **表单**（\`application/x-www-form-urlencoded\`），字段固定为 \`username\` 和 \`password\`。这是 OAuth2 规范要求的。

FastAPI 提供 \`OAuth2PasswordRequestForm\` 依赖，自动解析表单：

\`\`\`python
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username / form.password 已自动从表单提取
    user = db.get(form.username)
    if not user or not pwd.verify(form.password, user["hashed_password"]):
        raise HTTPException(401, "用户名或密码错误")
    token = create_token(user)
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

返回格式也是 OAuth2 规范固定的：\`{"access_token": "...", "token_type": "bearer"}\`。客户端拿到后，后续请求加 \`Authorization: Bearer <access_token>\`。

---

## 三、get_current_user 依赖：从 token 解析用户

受保护接口的核心是 \`get_current_user\` 依赖——它接收 token、验证、返回用户对象：

\`\`\`python
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        401, "无效凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.get(username)
    if user is None:
        raise credentials_exception
    return user
\`\`\`

注意几个关键点：

- **401 响应必须带 \`WWW-Authenticate: Bearer\` 头**——这是 HTTP 规范，告诉客户端"用 Bearer 认证"。
- **异常要捕获 \`jwt.PyJWTError\`**——token 过期、签名错误、格式错误都算这个父类的子类。
- **token 解析出用户名后还要查库**——确保用户仍存在（可能已被删除）。

---

## 四、Depends 串联：保护路由

有了 \`get_current_user\`，保护任意路由只需一行：

\`\`\`python
@app.get("/users/me")
def read_current_user(user = Depends(get_current_user)):
    return {"username": user["username"]}
\`\`\`

\`Depends(get_current_user)\` 会自动执行：提取 token → 验证 → 查用户 → 注入路由。失败则直接 401，路由函数根本不会执行。

**依赖可以嵌套**：\`get_current_user\` 内部又依赖 \`oauth2_scheme\`，FastAPI 会按依赖树自动解析，先提取 token，再验证用户。这种"依赖套依赖"的组合是 FastAPI 的精髓。

---

## 五、401 Unauthorized 与 WWW-Authenticate

认证失败统一返回 401，并带响应头：

\`\`\`
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
\`\`\`

\`WWW-Authenticate\` 头告诉客户端该用什么认证方案。Bearer 方案表示"在 Authorization 头放 Bearer token"。浏览器和一些 HTTP 客户端会根据这个头提示用户输入凭证。

| 状态码 | 含义 | 何时返回 |
| --- | --- | --- |
| 401 | 未认证（没登录或 token 无效） | 没 token / token 过期 / token 篡改 |
| 403 | 已认证但无权限 | 登录了但不是作者，不能删别人的文章 |

---

## 六、token 过期时间设置

签发 token 时通过 \`exp\` 声明设置过期时间：

\`\`\`python
from datetime import datetime, timedelta, timezone

def create_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + timedelta(minutes=30),  # 30 分钟后过期
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")
\`\`\`

推荐时长：

- **access token**：15~30 分钟。短命降低泄露风险。
- **refresh token**：7~30 天。用于换 access token，可撤销。

> ⚠️ **时区陷阱**：\`datetime.now(timezone.utc)\` 返回带时区的 UTC 时间，PyJWT 会转成时间戳。不要用 \`datetime.now()\`（无时区），在跨时区服务器上会出问题。

---

## 七、完整认证闭环

\`\`\`
1. POST /register        → 注册用户（明文密码 → bcrypt 哈希存库）
2. POST /token           → 登录（验证密码 → 签发 JWT）
3. GET /users/me         → 带 token 访问（验证 JWT → 返回当前用户）
\`\`\`

这三步构成最简认证闭环。本章代码会真实跑通这个闭环。

---

## 八、Swagger UI 的 Authorize 按钮

FastAPI 的自动文档（\`/docs\`）会识别 \`OAuth2PasswordBearer\`，在页面右上角显示一个 **Authorize** 按钮（🔒 图标）。点击后输入用户名密码，文档会自动调 \`/token\` 拿 token，后续所有请求自动带上 \`Authorization: Bearer ...\`。

这意味着：**只要按规范实现，API 文档页面就是一个完整的认证测试工具**——无需 Postman 手动复制 token。这是 FastAPI 相比 Flask/Django 的显著优势。

---

## 九、Scope 权限（简介）

OAuth2 还支持 scope（权限范围），在 token 里声明"这个 token 能做什么"：

\`\`\`python
oauth2 = OAuth2PasswordBearer(tokenUrl="/token", scopes={"read": "读权限", "write": "写权限"})
\`\`\`

签发时带 scope：\`{"sub": "alice", "scopes": ["read", "write"]}\`。验证时用 \`Security(get_current_user, scopes=["write"])\` 检查。这适合细粒度权限控制，但大多数博客系统用更简单的"角色字段"就够了。

---

## 深入补充：认证流程、依赖链路与 token 生命周期管理

### A. OAuth2PasswordBearer 工作流程全解

\`OAuth2PasswordBearer\` 看似简单，内部做了三件事，理解它们有助于排查认证问题：

\`\`\`
请求进入
  ↓
oauth2_scheme(token) 被调用
  ↓
查找 Authorization 头 → "Bearer xxx"
  ↓
有？ ──否──→ 抛 401 + WWW-Authenticate: Bearer
  │是
  ↓
提取 "xxx" 作为 token 返回
  ↓
交给 get_current_user 验证
\`\`\`

它的 \`tokenUrl\` 参数**不会自动创建路由**，只是告诉 Swagger "登录接口在 /token"。你仍需自己实现 \`POST /token\`。如果忘了实现，Swagger 的 Authorize 按钮会报 404。

\`\`\`python
# OAuth2PasswordBearer 源码核心逻辑（简化版）
class OAuth2PasswordBearer:
    def __call__(self, request):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            raise HTTPException(401, headers={"WWW-Authenticate": "Bearer"})
        return auth.split(" ")[1]  # 返回 token 字符串
\`\`\`

> ⚠️ **常见陷阱**：\`auto_error=True\`（默认）时没 token 直接 401。如果想在依赖里自行处理（如匿名用户也能访问），设 \`auto_error=False\`，此时没 token 返回 \`None\` 而非报错。

### B. Depends 依赖链路剖析

FastAPI 的 \`Depends\` 是一个**依赖注入容器**，它会递归解析依赖树：

\`\`\`
GET /users/me
  └─→ get_current_user(token=Depends(oauth2_scheme))
                      └─→ oauth2_scheme(request)  # 从 Header 提取 token
\`\`\`

FastAPI 解析顺序：先执行 \`oauth2_scheme\` 拿到 token，再把 token 传给 \`get_current_user\`。依赖可以无限嵌套：

\`\`\`python
def get_db(): ...                          # 依赖 1：数据库会话
def get_current_user(token=Depends(oauth2_scheme), db=Depends(get_db)): ...  # 依赖 2+3
def get_current_active_user(user=Depends(get_current_user)): ...  # 依赖 4
def get_current_admin(user=Depends(get_current_active_user)): ... # 依赖 5

@app.delete("/users/{uid}")
def delete_user(uid: int, admin=Depends(get_current_admin)):  # 链路深度 5
    ...
\`\`\`

FastAPI 会缓存同一请求内相同依赖的结果——\`get_db\` 在一个请求里只执行一次，即便多个依赖都依赖它。

| 特性 | 说明 |
| --- | --- |
| 依赖嵌套 | 支持任意深度，按依赖树拓扑排序执行 |
| 结果缓存 | 同一请求内，相同依赖只执行一次 |
| yield 依赖 | \`def get_db(): yield db\` 可在请求结束后清理资源 |
| 子依赖覆盖 | 测试时可注入 mock 依赖（\`app.dependency_overrides\`） |

### C. token 过期处理实战

token 过期时 PyJWT 抛 \`ExpiredSignatureError\`（\`PyJWTError\` 的子类）。前端拿到 401 后应**静默刷新**（用 refresh token 换新 access token）并重发请求：

\`\`\`python
# 后端：区分过期和无效，给前端不同提示
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "token 已过期，请刷新",
                            headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise HTTPException(401, "token 无效",
                            headers={"WWW-Authenticate": "Bearer"})
    ...
\`\`\`

前端（axios 拦截器）处理 401 的标准模式：

\`\`\`javascript
// 前端伪代码
axios.interceptors.response.use(null, async (err) => {
  if (err.response?.status === 401 && !err.config._retry) {
    err.config._retry = true
    const { data } = await axios.post('/token/refresh', { refresh_token })
    localStorage.setItem('token', data.access_token)
    err.config.headers.Authorization = 'Bearer ' + data.access_token
    return axios(err.config)  // 用新 token 重发原请求
  }
  return Promise.reject(err)
})
\`\`\`

### D. 密码修改后 token 失效策略

用户改密码后，旧 token 仍有效（JWT 无状态），这是安全隐患。三种失效策略：

| 策略 | 实现 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **token 版本号** | 用户表加 \`token_version\`，签发时写入 Payload，验证时比对 | 简单、无状态 | 每次验证多一次查库 |
| **黑名单** | 改密码时把旧 token 的 jti 存 Redis 黑名单，验证时检查 | 精确控制 | 需 Redis，牺牲无状态 |
| **短 exp** | access token 只活 15 分钟，改密码后最多 15 分钟旧 token 失效 | 零额外成本 | 有时间窗口 |

**推荐**：token 版本号 + 短 exp 组合。改密码时 \`token_version += 1\`，旧 token 的版本号不匹配，立即失效。

\`\`\`python
def create_token(user):
    payload = {"sub": user.id, "ver": user.token_version,  # 写入版本号
               "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}
    return jwt.encode(payload, SECRET, algorithm="HS256")

def get_current_user(token=Depends(oauth2_scheme), db=Depends(get_db)):
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    user = db.get(User, payload["sub"])
    if user.token_version != payload["ver"]:  # 版本号不匹配 → 失效
        raise HTTPException(401, "凭证已过期，请重新登录")
    return user

@app.put("/users/me/password")
def change_password(new_pw: str, user=Depends(get_current_user), db=Depends(get_db)):
    user.hashed_password = pwd.hash(new_pw)
    user.token_version += 1  # 让所有旧 token 失效
    db.commit()
\`\`\`

### E. JWT 认证 vs Session 认证对比

| 维度 | JWT（无状态） | Session（有状态） |
| --- | --- | --- |
| 状态存储 | 客户端（token 自包含） | 服务端（内存/Redis） |
| 扩展性 | 任意服务器独立验证 | 需共享 session 存储 |
| 撤销 | 难（需黑名单/版本号） | 删 session 即可 |
| 性能 | 验证需解码+签名计算 | 查内存/Redis，更快 |
| 安全 | token 泄露在 exp 前都有效 | session 可随时销毁 |
| 移动端 | 友好（Header 传 token） | 不友好（Cookie 机制） |
| CSRF | 天然免疫（不用 Cookie） | 需 CSRF token 防护 |
| 大小 | 数百字节 | session_id 很短 |
| 适用 | 微服务、移动端、跨域 | 单体应用、Web 网页 |

**选型建议**：单体 Web 应用、需要随时踢人下线 → Session；微服务、移动端、跨域、水平扩展 → JWT。两者也可混用：JWT 做服务间认证，Session 做用户会话管理。

### F. OAuth2PasswordRequestForm 的表单之谜

为什么登录用表单（\`application/x-www-form-urlencoded\`）而非 JSON？这是 **OAuth2 规范**（RFC 6749）的硬性要求——\`password\` grant type 定义为表单提交。FastAPI 的 \`OAuth2PasswordRequestForm\` 自动解析：

\`\`\`python
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username, form.password 来自表单字段
    # form.scope 可选，form.grant_type 固定 "password"
    ...
\`\`\`

测试时要注意用 \`data=\` 而非 \`json=\`：

\`\`\`python
# ✅ 正确：表单提交
client.post("/token", data={"username": "alice", "password": "123"})
# ❌ 错误：JSON 提交，会 422
client.post("/token", json={"username": "alice", "password": "123"})
\`\`\`

> 💡 **面试要点**：面试官常问"为什么登录用表单不用 JSON"。答：OAuth2 规范要求 + 兼容传统浏览器表单提交 + Swagger UI 的 Authorize 按钮按表单格式发请求。如果你不需要兼容 OAuth2 规范，完全可以自定义 JSON 登录接口。

### G. 内部实现细节：FastAPI 如何自动生成 401

当 \`OAuth2PasswordBearer\` 检测到没有 token 时，它抛出：

\`\`\`python
HTTPException(
    status_code=401,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)
\`\`\`

这个 \`WWW-Authenticate: Bearer\` 响应头是 HTTP/1.1 规范要求的——它告诉客户端"用 Bearer 方案认证"。Swagger UI 读到这个头后，会在文档页面弹出 Authorize 对话框。这就是为什么"只要声明了 \`OAuth2PasswordBearer\`，Swagger 就自动有登录按钮"的底层原因。

---

## 十、本章小结

- \`OAuth2PasswordBearer\` 封装了 token 提取与 Swagger 集成，\`tokenUrl\` 指向登录端点。
- 登录用 \`OAuth2PasswordRequestForm\`（表单），返回 \`access_token\` + \`token_type: bearer\`。
- \`get_current_user\` 依赖：验证 token → 查用户 → 注入路由，失败返回 401 + \`WWW-Authenticate: Bearer\`。
- \`Depends\` 串联保护路由，依赖可嵌套。
- token 过期用 \`exp\` 声明，推荐 15~30 分钟；\`datetime.now(timezone.utc)\` 避免时区坑。
- Swagger UI 的 Authorize 按钮让文档页面直接能登录测试。
- 401 = 未认证，403 = 已认证但无权限。

下一章我们在这个认证基础上实现博客文章的增删改查。`,
    code: `# ============================================================
# 第三章代码演示：JWT 实战 - FastAPI 集成认证
# ------------------------------------------------------------
# 实现完整认证闭环：
#   POST /register  注册用户（bcrypt 哈希密码）
#   POST /token     登录签发 JWT（OAuth2PasswordRequestForm）
#   GET  /users/me  受保护接口（Depends(get_current_user)）
# 用 TestClient 模拟完整流程：注册 → 登录拿 token → 带 token 访问
# ============================================================

# ---- passlib 兼容 shim（passlib 1.7.4 + bcrypt 5.x）----
import bcrypt as _bcrypt
if not hasattr(_bcrypt, "__about__"):
    class _About:
        __version__ = getattr(_bcrypt, "__version__", "4.0.0")
    _bcrypt.__about__ = _About()
_orig_h, _orig_c = _bcrypt.hashpw, _bcrypt.checkpw
_bcrypt.hashpw = lambda s, salt: _orig_h((s.encode() if isinstance(s, str) else s)[:72], salt)
_bcrypt.checkpw = lambda s, h: _orig_c((s.encode() if isinstance(s, str) else s)[:72], h)

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt as pyjwt
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.testclient import TestClient

SECRET = "my-blog-super-secret-key-32-bytes!!"
ALGO = "HS256"
TOKEN_EXPIRE_MINUTES = 30

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# 内存用户数据库: username -> {id, username, hashed_password}
db = {}


def create_access_token(username: str) -> str:
    """签发 JWT，sub=用户名，exp=30 分钟后"""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return pyjwt.encode(payload, SECRET, algorithm=ALGO)


def get_current_user(token: str = Depends(oauth2_scheme)):
    """从 token 解析当前用户，失败返回 401"""
    credentials_exc = HTTPException(
        status_code=401,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = pyjwt.decode(token, SECRET, algorithms=[ALGO])
        username = payload.get("sub")
        if username is None:
            raise credentials_exc
    except pyjwt.PyJWTError:
        raise credentials_exc
    user = db.get(username)
    if user is None:
        raise credentials_exc
    return user


@app.post("/register", status_code=201)
def register(username: str, password: str):
    """注册：校验唯一 → 哈希密码 → 存库"""
    if username in db:
        raise HTTPException(status_code=400, detail="用户名已存在")
    db[username] = {
        "id": len(db) + 1,
        "username": username,
        "hashed_password": pwd_ctx.hash(password),
    }
    return {"id": db[username]["id"], "username": username}


@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    """登录：验证密码 → 签发 JWT"""
    user = db.get(form.username)
    if not user or not pwd_ctx.verify(form.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": create_access_token(user["username"]), "token_type": "bearer"}


@app.get("/users/me")
def read_current_user(user: dict = Depends(get_current_user)):
    """受保护接口：必须带有效 token 才能访问"""
    return {"id": user["id"], "username": user["username"]}


# ============ 用 TestClient 跑完整流程 ============
client = TestClient(app)

print("========== 1. 注册用户 ==========")
r = client.post("/register?username=alice&password=secret123")
print("注册 alice:", r.status_code, r.json())

r = client.post("/register?username=bob&password=pass456789")
print("注册 bob:", r.status_code, r.json())

print("\\n========== 2. 登录拿 token ==========")
r = client.post("/token", data={"username": "alice", "password": "secret123"})
print("登录 alice:", r.status_code)
print("响应:", r.json())
token = r.json()["access_token"]
print("token (前 50 字符):", token[:50] + "...")

# 错误密码登录
r = client.post("/token", data={"username": "alice", "password": "wrong"})
print("错误密码:", r.status_code, r.json())

print("\\n========== 3. 带 token 访问受保护接口 ==========")
# 正确 token
r = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
print("正确 token:", r.status_code, r.json())

# 无 token
r = client.get("/users/me")
print("无 token:", r.status_code, "→ 401 未认证")
print("  WWW-Authenticate:", r.headers.get("www-authenticate"))

# 错误 token
r = client.get("/users/me", headers={"Authorization": "Bearer invalid.token.here"})
print("错误 token:", r.status_code, "→ 401 凭证无效")

# 篡改 token（改最后一个字符）
tampered = token[:-1] + ("A" if token[-1] != "A" else "B")
r = client.get("/users/me", headers={"Authorization": f"Bearer {tampered}"})
print("篡改 token:", r.status_code, "→ 401 签名不匹配")

print("\\n========== 4. 解码 token 看 payload ==========")
import json, base64
payload_b64 = token.split(".")[1]
pad = "=" * (-len(payload_b64) % 4)
decoded = json.loads(base64.urlsafe_b64decode(payload_b64 + pad))
print("payload:", decoded)
print("  sub (用户):", decoded["sub"])
print("  exp (过期):", datetime.fromtimestamp(decoded["exp"], tz=timezone.utc).isoformat())
`,
  },

  // =========================================================
  // 第四章：博客文章 CRUD API
  // =========================================================
  {
    id: "blog-crud",
    title: "博客文章 CRUD API",
    icon: "📝",
    group: "JWT 认证与博客业务",
    content: `## 一、CRUD 是什么

**CRUD** 是四个首字母缩写：

| 字母 | 英文 | HTTP 方法 | SQL | 含义 |
| --- | --- | --- | --- | --- |
| C | Create | POST | INSERT | 创建 |
| R | Read | GET | SELECT | 查询 |
| U | Update | PUT/PATCH | UPDATE | 更新 |
| D | Delete | DELETE | DELETE | 删除 |

几乎所有的业务系统底层都是 CRUD——博客文章、订单、商品、评论，本质都是"对某类资源做增删改查"。掌握了 CRUD 的标准设计，80% 的业务接口都能套用。

本章在 JWT 认证的基础上，实现博客文章的完整 CRUD：登录用户可以发文章、改自己的文章、删自己的文章；可以看所有人的文章列表和详情；但不能动别人的文章。

---

## 二、博客数据模型

\`\`\`
Post:
  id          Integer, 主键, 自增
  title       String,  标题
  content     String,  正文
  author_id   Integer, 外键 → users.id
  created_at  DateTime, 创建时间
\`\`\`

\`author_id\` 是外键，指向 \`users\` 表，建立"文章属于某个用户"的关系。通过这个关系，我们能查"这篇文章的作者是谁"、"这个用户发过哪些文章"。

SQLAlchemy 用 \`relationship\` 和 \`back_populates\` 表达双向关系：

\`\`\`python
class User(Base):
    posts = relationship("Post", back_populates="author")

class Post(Base):
    author = relationship("User", back_populates="posts")
\`\`\`

这样 \`post.author.username\` 能直接拿到作者名，\`user.posts\` 能拿到用户的所有文章——ORM 自动 JOIN 查询，不用手写 SQL。

---

## 三、创建文章：POST /posts

\`\`\`python
@app.post("/posts", status_code=201)
def create_post(post: PostIn, user = Depends(get_current_user), db = Depends(get_db)):
    p = Post(title=post.title, content=post.content, author_id=user.id)
    db.add(p); db.commit(); db.refresh(p)
    return {"id": p.id, "title": p.title, "author_id": p.author_id}
\`\`\`

关键点：

- **必须登录**：\`Depends(get_current_user)\` 保护，未登录返回 401。
- **author_id 取当前用户**：从认证后的 \`user\` 取，**绝不信任前端传的 author_id**——否则任何人都能伪装成别人发文章。
- **201 Created**：创建成功用 201 而非 200，语义更准确。

---

## 四、查询文章：GET /posts 与 GET /posts/{id}

**列表查询**（分页）：

\`\`\`python
@app.get("/posts")
def list_posts(skip: int = 0, limit: int = 20, db = Depends(get_db)):
    return db.query(Post).offset(skip).limit(limit).all()
\`\`\`

- \`skip\` / \`limit\` 实现分页，\`?skip=0&limit=20\` 取第一页。
- 列表接口通常**不需要登录**（公开内容），但详情/创建需要。
- 列表只返回摘要（id、title），不返回正文，减少传输量。

**详情查询**：

\`\`\`python
@app.get("/posts/{pid}")
def get_post(pid: int, db = Depends(get_db)):
    p = db.get(Post, pid)
    if not p:
        raise HTTPException(404, "文章不存在")
    return {"id": p.id, "title": p.title, "content": p.content, "author": p.author.username}
\`\`\`

- 找不到返回 **404 Not Found**。
- \`db.get(Post, pid)\` 是 SQLAlchemy 2.0 推荐的主键查询写法（替代旧的 \`db.query(Post).get(pid)\`）。

---

## 五、更新文章：PUT /posts/{id}

\`\`\`python
@app.put("/posts/{pid}")
def update_post(pid: int, post: PostIn, user = Depends(get_current_user), db = Depends(get_db)):
    p = db.get(Post, pid)
    if not p:
        raise HTTPException(404, "文章不存在")
    if p.author_id != user.id:
        raise HTTPException(403, "只能修改自己的文章")
    p.title = post.title
    p.content = post.content
    db.commit()
    return {"id": p.id, "title": p.title}
\`\`\`

**权限校验是重点**：

1. 先查文章是否存在 → 不存在 404。
2. 再查当前用户是不是作者 → 不是 403。
3. 顺序不能反：先 404 再 403，避免泄露"文章是否存在"给无权限用户。

**PUT vs PATCH**：

- **PUT**：全量替换（传完整的新内容）。
- **PATCH**：部分更新（只传要改的字段）。
- 简单场景用 PUT 即可，复杂部分更新用 PATCH。

---

## 六、删除文章：DELETE /posts/{id}

\`\`\`python
@app.delete("/posts/{pid}")
def delete_post(pid: int, user = Depends(get_current_user), db = Depends(get_db)):
    p = db.get(Post, pid)
    if not p:
        raise HTTPException(404, "文章不存在")
    if p.author_id != user.id:
        raise HTTPException(403, "只能删除自己的文章")
    db.delete(p); db.commit()
    return {"deleted": pid}
\`\`\`

删除同样要先 404 再 403。返回值可以是空（204 No Content）或 \`{"deleted": id}\`（200），看团队规范。

---

## 七、HTTP 状态码速查

| 状态码 | 含义 | 何时返回 |
| --- | --- | --- |
| 200 OK | 成功 | GET/PUT/DELETE 成功 |
| 201 Created | 创建成功 | POST 创建成功 |
| 204 No Content | 无内容 | DELETE 成功（无返回体） |
| 400 Bad Request | 请求错误 | 业务校验失败（如重复） |
| 401 Unauthorized | 未认证 | 没 token / token 无效 |
| 403 Forbidden | 无权限 | 登录了但不是作者 |
| 404 Not Found | 不存在 | 资源找不到 |
| 422 Unprocessable | 实体错误 | Pydantic 校验失败 |
| 500 Internal Error | 服务器错误 | 代码异常 |

**401 vs 403** 是最常混淆的：

- **401**：你**是谁**？（没登录 → 不知道你是谁）
- **403**：我知道你是谁，但你**没权限**做这件事。（登录了但不是作者）

---

## 八、软删除 vs 硬删除

- **硬删除**：\`db.delete(post)\` 直接从数据库删掉，不可恢复。简单但危险。
- **软删除**：加一个 \`deleted_at\` 字段，删除时只设时间戳，查询时过滤 \`deleted_at IS NULL\`。可恢复，适合需要审计或回收站的场景。

博客系统一般用硬删除即可；电商订单、财务记录必须软删除。

---

## 九、权限设计：作者才能改自己的文章

本章的权限模型很简单：**文章的 author_id 必须等于当前用户 id**，否则 403。这是"基于所有者"的权限控制（owner-based）。

更复杂的场景需要基于角色（RBAC）：

- **普通用户**：只能改自己的文章。
- **编辑**：能改所有人的文章。
- **管理员**：能删任何文章。

实现上在 \`get_current_user\` 之后加一层角色检查，或用 FastAPI 的 \`Security(scopes=[...])\`。

---

## 十、响应模型过滤

直接返回 ORM 对象会暴露 \`hashed_password\` 等敏感字段。用 \`response_model\` 声明响应结构，FastAPI 自动过滤：

\`\`\`python
class PostOut(BaseModel):
    id: int
    title: str
    content: str
    author_id: int

@app.post("/posts", response_model=PostOut)
def create_post(...):
    ...
\`\`\`

\`response_model=PostOut\` 确保返回里只有声明的字段，多出的字段（如 \`hashed_password\`）被自动剔除。这是防止敏感信息泄露的最后一道防线。

---

## 深入补充：RESTful 设计、分页过滤与工程化实践

### A. RESTful 设计原则

REST（Representational State Transfer）的核心是**资源导向**：URL 表示资源，HTTP 方法表示操作。好的 RESTful API 应该做到"看 URL 就知道在操作什么资源，看方法就知道在做什么操作"。

| 原则 | 正确示例 | 错误示例 | 原因 |
| --- | --- | --- | --- |
| URL 用名词 | \`GET /posts\` | \`GET /getPosts\` | URL 是资源，不是动作 |
| 方法表语义 | \`DELETE /posts/1\` | \`POST /posts/1/delete\` | 删除用 DELETE |
| 复数命名 | \`/posts\` | \`/post\` | 统一复数，列表/详情都基于复数 |
| 层级表达关系 | \`GET /users/1/posts\` | \`GET /posts?user=1\` | 子资源用路径表达（也可用 query） |
| 不在 URL 放动词 | \`POST /posts\` | \`POST /createPost\` | 动词由 HTTP 方法承担 |

\`\`\`
GET    /posts          → 列表
POST   /posts          → 创建
GET    /posts/{id}     → 详情
PUT    /posts/{id}     → 全量更新
PATCH  /posts/{id}     → 部分更新
DELETE /posts/{id}     → 删除
GET    /posts/{id}/comments → 文章的评论列表
\`\`\`

### B. HTTP 方法语义详解

| 方法 | 幂等 | 安全 | 语义 | 有请求体 | 典型状态码 |
| --- | --- | --- | --- | --- | --- |
| GET | 是 | 是 | 获取资源 | 否 | 200 |
| POST | 否 | 否 | 创建资源 | 是 | 201 |
| PUT | 是 | 否 | 全量替换 | 是 | 200 |
| PATCH | 否 | 否 | 部分更新 | 是 | 200 |
| DELETE | 是 | 否 | 删除 | 否 | 204 |
| HEAD | 是 | 是 | 只取响应头 | 否 | 200 |
| OPTIONS | 是 | 是 | 查询支持的方法 | 否 | 200 |

**幂等性**是关键概念：同一个请求执行一次和执行 N 次，结果相同。GET/PUT/DELETE 是幂等的（GET 多次结果一样，PUT 多次覆盖成同一值，DELETE 多次第一次删后续无操作）。POST 不幂等（多次提交创建多条记录）。这就是为什么浏览器刷新 POST 会弹"确认重新提交"——因为 POST 不幂等，重复执行有副作用。

> 💡 **最佳实践**：需要幂等性的操作（如"更新文章"）用 PUT/PATCH；创建操作用 POST。支付场景用 POST + 幂等键（\`Idempotency-Key\` 头）防止重复扣款。

### C. 状态码规范深入

HTTP 状态码分五类：

| 类别 | 含义 | 常见 |
| --- | --- | --- |
| 1xx | 信息 | 100 Continue |
| 2xx | 成功 | 200, 201, 204 |
| 3xx | 重定向 | 301, 304 |
| 4xx | 客户端错误 | 400, 401, 403, 404, 422, 429 |
| 5xx | 服务端错误 | 500, 502, 503 |

几个易混淆的状态码：

- **200 vs 201**：201 是 200 的子集，专指"创建成功"。POST 创建资源用 201 更精确，但用 200 也不算错。
- **204 No Content**：DELETE 成功且无返回体时用 204。如果返回 \`{"deleted": id}\` 则用 200。
- **400 vs 422**：400 是通用请求错误（如业务规则不满足）；422 是"格式正确但语义错误"（Pydantic 校验失败 FastAPI 自动返回 422）。
- **409 Conflict**：资源冲突，如用户名已存在、并发修改冲突。
- **429 Too Many Requests**：限流。配合 \`Retry-After\` 头告诉客户端多久后重试。

### D. 分页、排序、过滤最佳实践

**分页**有两种风格：

| 风格 | 参数 | 示例 | 优点 | 缺点 |
| --- | --- | --- | --- | --- |
| 偏移分页 | \`skip\`/\`limit\` 或 \`page\`/\`size\` | \`?skip=20&limit=10\` | 简单、支持跳页 | 大偏移慢（OFFSET 扫描） |
| 游标分页 | \`cursor\`/\`limit\` | \`?cursor=abc&limit=10\` | 大数据集稳定、无重复 | 不能跳页 |

\`\`\`python
# 偏移分页（适合中小数据集）
@app.get("/posts")
def list_posts(skip: int = 0, limit: int = Query(20, le=100), db = Depends(get_db)):
    total = db.query(Post).count()
    items = db.query(Post).offset(skip).limit(limit).all()
    return {"items": items, "total": total, "skip": skip, "limit": limit}

# 游标分页（适合大数据集/无限滚动）
@app.get("/posts")
def list_posts(cursor: int = 0, limit: int = 20, db = Depends(get_db)):
    q = db.query(Post).filter(Post.id > cursor).order_by(Post.id).limit(limit)
    items = q.all()
    next_cursor = items[-1].id if items else None
    return {"items": items, "next_cursor": next_cursor}
\`\`\`

**排序**：用 \`sort\` 参数，\`-\` 前缀表示降序。\`?sort=-created_at,title\` = 按创建时间降序+标题升序。

**过滤**：简单过滤用 query 参数（\`?author_id=1&status=published\`），复杂过滤可用 \`filter\` 参数（\`?filter[status]=published\`）或 GraphQL。**不要**把 SQL 直接暴露在 URL 里（\`?where=status='published'\`，有注入风险）。

> ⚠️ **常见陷阱**：\`limit\` 必须设上限（如 \`le=100\`），否则 \`?limit=999999\` 一次查出百万条，内存爆炸。

### E. 软删除 vs 硬删除深入

| 维度 | 硬删除 | 软删除 |
| --- | --- | --- |
| 实现 | \`db.delete(post)\` | \`post.deleted_at = now()\` |
| 查询 | 直接查 | 需 \`filter(deleted_at == None)\` |
| 恢复 | 不可能 | 改回 \`deleted_at = None\` |
| 存储 | 删后释放空间 | 数据仍在，占空间 |
| 审计 | 无痕迹 | 有删除时间记录 |
| 外键 | 关联数据需级联处理 | 保留关联关系 |
| 适用 | 博客文章、用户头像 | 订单、财务、医疗记录 |

软删除的**最大陷阱**是忘记过滤——所有查询都要加 \`filter(deleted_at == None)\`。SQLAlchemy 可用事件监听或 query 工厂自动过滤：

\`\`\`python
# SQLAlchemy 软删除混入（Mixin 模式）
class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)

# 每次查询自动过滤已删除的
posts = db.query(Post).filter(Post.deleted_at.is_(None)).all()
\`\`\`

### F. 批量操作

单个创建/删除效率低，批量操作能大幅减少数据库往返：

\`\`\`python
# 批量创建
@app.post("/posts/batch", status_code=201)
def batch_create(posts: list[PostIn], user=Depends(get_current_user), db=Depends(get_db)):
    created = []
    for p in posts:
        post = Post(title=p.title, content=p.content, author_id=user.id)
        db.add(post)
        created.append(post)
    db.commit()  # 一次提交，而非每条一次
    for p in created: db.refresh(p)
    return [{"id": p.id, "title": p.title} for p in created]

# 批量删除
@app.delete("/posts/batch")
def batch_delete(ids: list[int], user=Depends(get_current_user), db=Depends(get_db)):
    deleted = db.query(Post).filter(Post.id.in_(ids), Post.author_id == user.id).delete(synchronize_session=False)
    db.commit()
    return {"deleted_count": deleted}
\`\`\`

> 💡 **最佳实践**：批量操作要限制单次数量（如最多 100 条），防止超长请求和长事务锁表。

### G. API 版本控制

API 演进时需要版本控制，避免破坏旧客户端。三种主流方案：

| 方案 | 示例 | 优点 | 缺点 |
| --- | --- | --- | --- |
| URL 路径 | \`/v1/posts\`、\`/v2/posts\` | 直观、缓存友好 | URL 变长 |
| Header | \`Accept: application/vnd.api.v2+json\` | URL 不变 | 不直观、调试难 |
| Query | \`/posts?version=2\` | 简单 | 易忽略，缓存不友好 |

FastAPI 用 \`APIRouter\` 实现路径版本控制：

\`\`\`python
v1 = APIRouter(prefix="/v1")
v2 = APIRouter(prefix="/v2")

@v1.get("/posts")  # 旧版
def list_posts_v1(): ...

@v2.get("/posts")  # 新版，字段更丰富
def list_posts_v2(): ...

app.include_router(v1)
app.include_router(v2)
\`\`\`

**版本策略**：major 变更（不兼容）才升版本号；minor 变更（加字段、加端点）向后兼容，不升版本。尽量用"可选字段"而非"改字段"来演进，减少版本数。

> 💡 **面试要点**：RESTful 不是标准而是风格，不必教条。核心是**一致性**——团队内统一命名、统一状态码、统一分页参数，比纠结 \`posts\` 还是 \`post\` 重要得多。面试时强调"一致性和可预测性"比背诵 REST 定义更得分。

---

## 十一、本章小结

- CRUD = Create/Read/Update/Delete，对应 POST/GET/PUT/DELETE。
- 数据模型：\`Post\` 有 \`author_id\` 外键关联 \`User\`，\`relationship\` 表达双向关系。
- 创建文章必须登录，\`author_id\` 取当前用户，不信前端。
- 查询分列表（分页 \`skip\`/\`limit\`）和详情（404 处理）。
- 更新/删除必须校验**作者权限**：先 404 再 403。
- 401 = 未认证，403 = 无权限，404 = 不存在，201 = 创建成功。
- 响应模型过滤敏感字段；软删除适合需要恢复的场景。

下一章讲异常处理、CORS 跨域和部署上线。`,
    code: `# ============================================================
# 第四章代码演示：博客文章 CRUD API（SQLAlchemy + JWT）
# ------------------------------------------------------------
# 完整实现：注册/登录/文章 CRUD，含权限校验（仅作者可改删）
# 演示：用户 A 创建的文章，用户 B 尝试修改 → 403
# ============================================================

# ---- passlib 兼容 shim（解决 bcrypt 5.x 移除 __about__ 的问题）----
import bcrypt as _bcrypt
if not hasattr(_bcrypt, "__about__"):
    class _About: __version__ = getattr(_bcrypt, "__version__", "4.0.0")
    _bcrypt.__about__ = _About()
_orig_h, _orig_c = _bcrypt.hashpw, _bcrypt.checkpw
_bcrypt.hashpw = lambda s, salt: _orig_h((s.encode() if isinstance(s, str) else s)[:72], salt)
_bcrypt.checkpw = lambda s, h: _orig_c((s.encode() if isinstance(s, str) else s)[:72], h)

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt as pyjwt
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.testclient import TestClient
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from sqlalchemy.pool import StaticPool  # 关键：让内存 SQLite 跨线程共享

SECRET, ALGO = "my-blog-super-secret-key-32-bytes!!", "HS256"
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
SessionLocal, Base = sessionmaker(bind=engine), declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    posts = relationship("Post", back_populates="author")


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    author = relationship("User", back_populates="posts")


Base.metadata.create_all(engine)
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()


def create_token(sub: str) -> str:
    now = datetime.now(timezone.utc)
    return pyjwt.encode({"sub": sub, "iat": now, "exp": now + timedelta(minutes=30)}, SECRET, algorithm=ALGO)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = pyjwt.decode(token, SECRET, algorithms=[ALGO])
        uid = int(payload.get("sub", 0))
    except Exception:
        raise HTTPException(401, "无效凭证", headers={"WWW-Authenticate": "Bearer"})
    user = db.get(User, uid)
    if not user: raise HTTPException(401, "用户不存在")
    return user


class PostIn(BaseModel):
    title: str
    content: str


@app.post("/register", status_code=201)
def register(username: str, password: str, db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=username).first():
        raise HTTPException(400, "用户名已存在")
    u = User(username=username, hashed_password=pwd_ctx.hash(password))
    db.add(u); db.commit(); db.refresh(u)
    return {"id": u.id, "username": u.username}


@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(User).filter_by(username=form.username).first()
    if not u or not pwd_ctx.verify(form.password, u.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    return {"access_token": create_token(str(u.id)), "token_type": "bearer"}


@app.post("/posts", status_code=201)
def create_post(post: PostIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    p = Post(title=post.title, content=post.content, author_id=user.id)
    db.add(p); db.commit(); db.refresh(p)
    return {"id": p.id, "title": p.title, "content": p.content, "author_id": p.author_id}


@app.get("/posts")
def list_posts(db: Session = Depends(get_db)):
    return [{"id": p.id, "title": p.title, "author": p.author.username, "created_at": str(p.created_at)}
            for p in db.query(Post).all()]


@app.get("/posts/{pid}")
def get_post(pid: int, db: Session = Depends(get_db)):
    p = db.get(Post, pid)
    if not p: raise HTTPException(404, "文章不存在")
    return {"id": p.id, "title": p.title, "content": p.content, "author": p.author.username}


@app.put("/posts/{pid}")
def update_post(pid: int, post: PostIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.get(Post, pid)
    if not p: raise HTTPException(404, "文章不存在")
    if p.author_id != user.id: raise HTTPException(403, "只能修改自己的文章")
    p.title, p.content = post.title, post.content
    db.commit()
    return {"id": p.id, "title": p.title}


@app.delete("/posts/{pid}")
def delete_post(pid: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.get(Post, pid)
    if not p: raise HTTPException(404, "文章不存在")
    if p.author_id != user.id: raise HTTPException(403, "只能删除自己的文章")
    db.delete(p); db.commit()
    return {"deleted": pid}


# ============ 用 TestClient 跑完整流程 ============
client = TestClient(app)
print("========== 1. 注册两个用户 ==========")
client.post("/register?username=alice&password=pw111111")
client.post("/register?username=bob&password=pw222222")
print("alice 和 bob 注册完成")

print("\\n========== 2. 两人各自登录拿 token ==========")
ta = client.post("/token", data={"username": "alice", "password": "pw111111"}).json()["access_token"]
tb = client.post("/token", data={"username": "bob", "password": "pw222222"}).json()["access_token"]
ha, hb = {"Authorization": f"Bearer {ta}"}, {"Authorization": f"Bearer {tb}"}
print("两人都拿到 token")

print("\\n========== 3. alice 创建两篇文章 ==========")
r = client.post("/posts", json={"title": "Alice 的第一篇", "content": "Hello World"}, headers=ha)
print("创建:", r.status_code, r.json())
pid = r.json()["id"]
r = client.post("/posts", json={"title": "Alice 的第二篇", "content": "更多内容"}, headers=ha)
print("再创建:", r.status_code, r.json())

print("\\n========== 4. 查询文章列表与详情 ==========")
r = client.get("/posts")
print("列表:", r.status_code)
for p in r.json(): print(f"  #{p['id']} {p['title']} (作者: {p['author']})")
r = client.get(f"/posts/{pid}")
print("详情:", r.status_code, r.json())
print("不存在:", client.get("/posts/999").status_code)

print("\\n========== 5. 权限测试：bob 改 alice 的文章 → 403 ==========")
r = client.put(f"/posts/{pid}", json={"title": "被黑了", "content": "haha"}, headers=hb)
print("bob 改 alice:", r.status_code, r.json())

print("\\n========== 6. alice 改/删自己的文章 ==========")
r = client.put(f"/posts/{pid}", json={"title": "更新后的标题", "content": "新内容"}, headers=ha)
print("alice 自己改:", r.status_code, r.json())
r = client.delete(f"/posts/{pid}", headers=ha)
print("删除:", r.status_code, r.json())
print("删除后列表:", client.get("/posts").json())`,
  },

  // =========================================================
  // 第五章：异常处理、CORS 与部署
  // =========================================================
  {
    id: "blog-deploy",
    title: "异常处理、CORS 与部署",
    icon: "📦",
    group: "JWT 认证与博客业务",
    content: `## 一、全局异常处理：@app.exception_handler

线上服务必须对错误响应做统一控制——不能让原始的 Python traceback 直接返回给前端（泄露内部信息），也不能每个接口都写一遍 try/except。FastAPI 提供 \`@app.exception_handler\` 注册全局异常处理器：

\`\`\`python
class NotFoundError(Exception):
    def __init__(self, resource, rid):
        self.resource = resource
        self.rid = rid

@app.exception_handler(NotFoundError)
def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={
        "error": "NOT_FOUND",
        "message": f"{exc.resource} {exc.rid} 不存在",
        "code": 40404,
    })
\`\`\`

任何路由抛出 \`NotFoundError\`，都会被这个处理器拦截，统一返回 \`{"error":..., "message":..., "code":...}\` 格式。业务代码只管 \`raise\`，不用关心响应格式。

---

## 二、HTTPException vs 自定义异常

| 维度 | HTTPException | 自定义异常 |
| --- | --- | --- |
| 用途 | 快速返回 HTTP 错误 | 业务逻辑错误 |
| 状态码 | 直接指定 | 在 handler 里映射 |
| 响应格式 | \`{"detail": "..."}\` | 自定义结构 |
| 适用 | 简单场景 | 需要统一错误码、错误分类 |

\`HTTPException(404, "不存在")\` 返回 \`{"detail": "不存在"}\`，格式简单。如果团队需要统一的错误响应格式（带 error code、错误类型分类），就自定义异常 + 全局 handler。

两者可以共存：\`HTTPException\` 用于简单的 401/403/404，自定义异常用于业务错误（如"余额不足"、"库存不够"）。

---

## 三、统一错误响应格式

推荐的错误响应结构：

\`\`\`json
{
  "error": "NOT_FOUND",
  "message": "文章 123 不存在",
  "code": 40404,
  "path": "/posts/123"
}
\`\`\`

- \`error\`：错误类型标识（大写，机器可读）。
- \`message\`：人类可读的错误描述（中文）。
- \`code\`：业务错误码（比 HTTP 状态码更细，如 40404 = 文章不存在，40405 = 用户不存在）。
- \`path\`：请求路径，便于排查。

前端拿到后，用 \`error\` 或 \`code\` 做分支判断，用 \`message\` 展示给用户。

---

## 四、CORS 跨域：CORSMiddleware

浏览器有**同源策略**：前端 \`http://localhost:3000\` 默认不能请求后端 \`http://localhost:8000\`（端口不同算不同源）。要让前端能跨域访问，后端必须配置 **CORS（Cross-Origin Resource Sharing）**。

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的前端源
    allow_methods=["*"],                       # 允许的 HTTP 方法
    allow_headers=["*"],                       # 允许的请求头
    allow_credentials=True,                    # 允许带 Cookie
)
\`\`\`

参数说明：

- \`allow_origins\`：允许的前端域名列表。**生产环境不要用 \`["*"]\`**（任何网站都能调你的 API），要明确列出前端域名。
- \`allow_methods\`：允许的方法，如 \`["GET", "POST", "PUT", "DELETE"]\`。
- \`allow_headers\`：允许的请求头，\`Authorization\` 必须包含在内。
- \`allow_credentials\`：是否允许带 Cookie。设为 True 时 \`allow_origins\` 不能是 \`*\`。

**预检请求（Preflight）**：浏览器对非简单请求（如带 \`Authorization\` 头的请求）会先发一个 \`OPTIONS\` 请求询问"我能不能用这些方法和头"。CORSMiddleware 自动处理 \`OPTIONS\`，返回允许列表。

---

## 五、中间件：@app.middleware("http")

中间件在请求**进入路由前**和**响应返回前**各执行一次，适合做横切逻辑：

\`\`\`python
@app.middleware("http")
async def timing(request, call_next):
    start = time.time()
    response = await call_next(request)  # 继续处理请求
    elapsed = (time.time() - start) * 1000
    response.headers["X-Process-Time-ms"] = f"{elapsed:.2f}"
    return response
\`\`\`

常见用途：日志记录、请求计时、统一加响应头、限流、请求 ID 注入。

执行顺序：中间件是**洋葱模型**——注册早的在最外层。请求从外到内穿过所有中间件，响应从内到外返回。

---

## 六、配置管理：pydantic-settings

不要把配置硬编码进代码。用 \`pydantic-settings\` 从环境变量读配置：

\`\`\`python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./blog.db"
    secret_key: str = "change-me"
    debug: bool = False
    class Config:
        env_file = ".env"

settings = Settings()
\`\`\`

环境变量优先于默认值，部署时改环境变量即可，不用改代码。\`DEBUG\`、\`SECRET_KEY\`、\`DATABASE_URL\` 都该走配置。

---

## 七、日志：logging 模块

生产环境别用 \`print\`，用标准库 \`logging\`：

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("blog")

logger.info("用户登录: %s", username)
logger.error("数据库连接失败", exc_info=True)
\`\`\`

- \`info\` 记录正常业务流（登录、创建文章）。
- \`warning\` 记录可恢复的异常（如重试）。
- \`error\` 记录错误（带 \`exc_info=True\` 输出完整 traceback）。
- \`debug\` 记录调试细节（生产关闭）。

---

## 八、部署：uvicorn + gunicorn

**开发**：\`uvicorn main:app --reload\`（热重载）。

**生产**：用 gunicorn 管理 uvicorn worker：

\`\`\`bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
\`\`\`

- \`-w 4\`：4 个 worker 进程（建议 2*CPU+1）。
- \`-k uvicorn.workers.UvicornWorker\`：用 uvicorn 作为 ASGI worker。
- \`-b\`：绑定地址。

**Docker 容器化**：

\`\`\`dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
\`\`\`

---

## 九、生产环境检查清单

| 项 | 要求 |
| --- | --- |
| \`DEBUG=False\` | 关闭调试模式，不暴露错误详情 |
| \`SECRET_KEY\` | 强随机（≥32 字节），从环境变量读 |
| HTTPS | 全站 HTTPS，防中间人窃听 token |
| 数据库连接池 | 配置 \`pool_size\`、\`max_overflow\` |
| 反向代理 | nginx 前置，处理 TLS、静态文件、限流 |
| CORS | 明确列出允许的源，不用 \`*\` |
| 日志 | 结构化日志，集中收集 |
| 监控 | 健康检查端点 + 告警 |
| 依赖锁定 | \`requirements.txt\` 锁版本 |

---

## 十、项目结构建议

\`\`\`
blog-api/
├── main.py              # 入口，创建 app
├── config.py            # 配置
├── routers/             # 路由（按模块拆分）
│   ├── auth.py          # /token, /register
│   └── posts.py         # /posts CRUD
├── models.py            # SQLAlchemy 模型
├── schemas.py           # Pydantic 模型
├── services.py          # 业务逻辑
├── deps.py              # 公共依赖
└── database.py          # 引擎、SessionLocal
\`\`\`

拆分后每个文件职责单一，路由用 \`APIRouter\` 挂载到 app。文件多了用包组织，但不要过度拆分——一个文件几百行比拆成十个几十行的文件更易读。

---

## 十一、进阶方向

教程到此结束，进阶可学：

1. **异步数据库**：\`async def\` 路由 + \`asyncpg\` / \`databases\`，提升 I/O 并发。
2. **WebSocket**：FastAPI 原生支持，做实时通知、聊天。
3. **测试**：\`pytest\` + \`TestClient\`，覆盖所有接口。
4. **Alembic 迁移**：数据库 schema 版本管理，改表结构不丢数据。
5. **后台任务**：\`BackgroundTasks\` 或 Celery，发邮件、生成报表。
6. **API 版本化**：\`/v1/posts\`、\`/v2/posts\`，平滑升级。

---

## 深入补充：异常机制、CORS 原理与生产部署

### A. FastAPI 异常处理机制全解

FastAPI 的异常处理分两层：**内置处理**和**自定义 handler**。理解它们的优先级和触发顺序很关键：

\`\`\`
请求 → 路由函数
        │
        ├─ raise HTTPException → FastAPI 内置 handler → {"detail": "..."}
        │
        ├─ raise 自定义异常 → @app.exception_handler(该异常) → 自定义响应
        │
        └─ raise 其他异常 → Starlette 兜底 → 500 Internal Server Error
\`\`\`

关键区别：

| 维度 | HTTPException | 自定义异常 + handler |
| --- | --- | --- |
| 谁处理 | FastAPI 内置 | 你注册的 handler |
| 状态码 | 构造时指定 | handler 里决定 |
| 响应格式 | 固定 \`{"detail": ...}\` | 完全自定义 |
| 能否被覆盖 | 可以（注册 \`@app.exception_handler(HTTPException)\`） | 互相独立 |
| 适用 | 简单 401/403/404 | 业务错误、统一错误码 |

**覆盖 HTTPException**：如果你想统一所有错误格式（包括 HTTPException），可以注册一个处理 \`HTTPException\` 的 handler：

\`\`\`python
from fastapi import HTTPException

@app.exception_handler(HTTPException)
def custom_http_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "HTTP_ERROR", "message": exc.detail, "path": request.url.path},
        headers=exc.headers,  # 保留 WWW-Authenticate 等头
    )
\`\`\`

> ⚠️ **常见陷阱**：注册 \`@app.exception_handler(Exception)\` 能捕获所有异常，但这会**吞掉 500 错误的堆栈**，生产环境排查困难。建议只捕获特定异常，让未预期错误走默认 500 + 日志。

### B. CORS 原理与预检请求详解

**同源策略**：浏览器规定，JS 发起的请求只能访问与当前页面**同协议+同域名+同端口**的资源。\`http://localhost:3000\`（前端）访问 \`http://localhost:8000\`（后端）算跨域（端口不同），浏览器会拦截响应。

CORS 是服务端告诉浏览器"我允许这个源访问"的机制。分两种请求：

**简单请求**（不触发预检）：GET/POST/HEAD + 常规 Header（\`Content-Type\` 仅限 \`text/plain\`/\`multipart/form-data\`/\`application/x-www-form-urlencoded\`）。浏览器直接发请求，看响应有没有 \`Access-Control-Allow-Origin\`。

**预检请求**（触发 OPTIONS）：不满足简单请求条件时（如带 \`Authorization\` 头、\`Content-Type: application/json\`），浏览器先发一个 \`OPTIONS\` 请求询问：

\`\`\`
OPTIONS /api/posts HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type
\`\`\`

服务器响应允许列表：

\`\`\`
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 3600   ← 预检结果缓存 1 小时，期间不再预检
\`\`\`

预检通过后，浏览器才发真正的请求。FastAPI 的 \`CORSMiddleware\` 自动处理这个 \`OPTIONS\`。

| 配置项 | 说明 | 生产建议 |
| --- | --- | --- |
| \`allow_origins\` | 允许的源 | 明确列出，不用 \`*\` |
| \`allow_methods\` | 允许的方法 | 列出实际用到的 |
| \`allow_headers\` | 允许的请求头 | 必含 \`Authorization\` |
| \`allow_credentials\` | 允许带 Cookie | True 时 \`allow_origins\` 不能是 \`*\` |
| \`max_age\` | 预检缓存时间 | 设 3600 减少预检请求 |

> 💡 **面试要点**：CORS 是**浏览器**的安全机制，不是服务端的。用 curl/Postman 不受 CORS 限制。CORS 防的是"恶意网页偷偷用用户的身份发跨域请求"，不是防"攻击者直接调 API"。

### C. ASGI 部署：uvicorn / gunicorn / workers

FastAPI 是 **ASGI**（Asynchronous Server Gateway Interface）应用，需要 ASGI 服务器运行。部署架构：

\`\`\`
                    ┌─ uvicorn worker 1 (async 事件循环)
nginx ──→ gunicorn ─┼─ uvicorn worker 2
                    ├─ uvicorn worker 3
                    └─ uvicorn worker 4
\`\`\`

- **uvicorn**：ASGI 服务器，基于 uvloop（高性能事件循环）+ httptools。单进程异步，能处理大量并发 I/O。
- **gunicorn**：进程管理器，prefork 多个 worker 进程，每个 worker 跑一个 uvicorn。用多进程利用多核 CPU。
- **worker 数量**：推荐 \`2 * CPU + 1\`。太多 worker 会争抢 CPU，反而变慢。

\`\`\`bash
# 开发：单进程 + 热重载
uvicorn main:app --reload --port 8000

# 生产：gunicorn 管理 4 个 uvicorn worker
gunicorn main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile -
\`\`\`

| 参数 | 作用 | 建议值 |
| --- | --- | --- |
| \`-w\` | worker 进程数 | \`2*CPU+1\` |
| \`-k\` | worker 类型 | \`uvicorn.workers.UvicornWorker\` |
| \`--timeout\` | 请求超时（秒） | 120（长任务调大） |
| \`--max-requests\` | worker 重启阈值 | 1000（防内存泄漏） |
| \`--access-logfile\` | 访问日志 | \`-\`（stdout）或文件路径 |

> ⚠️ **常见陷阱**：\`uvicorn --workers 4\` 也能多进程，但不如 gunicorn 的进程管理健壮（gunicorn 会在 worker 崩溃后自动重启）。生产环境推荐 gunicorn + uvicorn worker。

### D. 反向代理（nginx）配置

nginx 前置在 gunicorn 前，负责：TLS 终止、静态文件、限流、负载均衡。

\`\`\`nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;  # 强制 HTTPS
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # 静态文件直接由 nginx 处理，不经过 Python
    location /static/ {
        alias /app/static/;
        expires 30d;
    }

    # API 请求转发给 gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 限流：每 IP 每秒 10 个请求
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20;
        proxy_pass http://127.0.0.1:8000;
    }
}
\`\`\`

FastAPI 要信任 nginx 的 \`X-Forwarded-*\` 头，需配置 \`ProxyHeadersMiddleware\`（uvicorn 的 \`--proxy-headers\` 参数）。

### E. Docker 部署完整示例

\`\`\`dockerfile
# 多阶段构建：先装依赖，再拷代码，减少镜像层数
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
# 从 builder 拷贝已装的依赖
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/blog
      - SECRET_KEY=\${SECRET_KEY}
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=pass
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
\`\`\`

> 💡 **最佳实践**：镜像用 \`slim\` 基础镜像（更小）；\`requirements.txt\` 单独拷贝先装（利用 Docker 缓存层，代码改动不用重装依赖）；\`PYTHONUNBUFFERED=1\` 让日志即时输出（默认会缓冲）。

### F. 生产环境安全检查清单（完整版）

| 类别 | 检查项 | 要求 | 风险 |
| --- | --- | --- | --- |
| **密钥** | SECRET_KEY | ≥32 字节随机，环境变量注入 | 泄露可伪造任意 token |
| **密钥** | 数据库密码 | 强随机，不入代码库 | 数据库被拖 |
| **调试** | DEBUG=False | 关闭错误详情 | traceback 泄露内部结构 |
| **传输** | HTTPS | 全站强制 HTTPS | token 被中间人窃听 |
| **CORS** | allow_origins | 明确域名，不用 \`*\` | 任意网站可调 API |
| **依赖** | requirements.txt | 锁版本（\`==\`） | 依赖漏洞 |
| **依赖** | 安全扫描 | \`pip-audit\` / \`safety\` | 已知 CVE |
| **数据库** | 连接池 | 配置 \`pool_size\`、\`max_overflow\` | 连接耗尽 |
| **数据库** | SQL 注入 | 用 ORM/参数化查询 | 拖库 |
| **限流** | 登录接口 | 限频防暴力破解 | 密码被爆破 |
| **日志** | 敏感信息 | 不记密码/token | 日志泄露 |
| **日志** | 结构化 | JSON 格式集中收集 | 排查困难 |
| **监控** | 健康检查 | \`/health\` 端点 + 告警 | 故障发现晚 |
| **监控** | 错误率 | Sentry 等错误追踪 | 线上错误未知 |
| **备份** | 数据库 | 定期自动备份 + 恢复演练 | 数据丢失不可恢复 |
| **头安全** | 安全头 | HSTS/X-Frame-Options/CSP | XSS/点击劫持 |

\`\`\`python
# 安全响应头中间件
@app.middleware("http")
async def security_headers(request, call_next):
    resp = await call_next(request)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Strict-Transport-Security"] = "max-age=31536000"
    return resp
\`\`\`

> 🔒 **部署前必做**：跑一遍上表逐项检查。很多线上事故不是代码 bug，而是配置疏忽（DEBUG 没关、SECRET_KEY 硬编码、CORS 开 \`*\`）。这份清单能避免 80% 的低级安全事故。

---

## 十二、教程总结

恭喜你完成了博客系统后端的全部内容！回顾整个旅程：

1. **FastAPI 基础**：路由、Pydantic 验证、依赖注入、数据库。
2. **密码哈希**：bcrypt + passlib，安全存储密码。
3. **JWT 认证**：手动实现理解原理，PyJWT 实战，FastAPI 集成。
4. **CRUD 业务**：文章增删改查，权限校验，状态码规范。
5. **工程化**：异常处理、CORS、中间件、配置、部署。

你现在能独立搭建一个"注册→登录→发文章→改文章→删文章"的完整后端，并且理解每一行代码背后的原理。下一步是把这些知识用到一个真实项目里——只有动手做过，知识才真正是你的。`,
    code: `# ============================================================
# 第五章代码演示：异常处理、CORS 与部署
# ------------------------------------------------------------
# 演示内容：
#   1. 自定义 NotFoundError 异常 + 全局 exception_handler（统一错误格式）
#   2. CORS 中间件（跨域允许）
#   3. 计时中间件（每个响应加 X-Process-Time-ms 头）
#   4. TestClient 测试：自定义异常、CORS preflight、正常请求带耗时
# ============================================================

import time
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from fastapi.middleware.cors import CORSMiddleware


# ---- 自定义业务异常 ----
class NotFoundError(Exception):
    """资源不存在的业务异常"""
    def __init__(self, resource: str, rid):
        self.resource = resource
        self.rid = rid


class BusinessError(Exception):
    """业务逻辑错误（如余额不足）"""
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message


app = FastAPI(title="Blog API", version="1.0.0")


# ---- 全局异常处理器：统一错误响应格式 ----
@app.exception_handler(NotFoundError)
def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error": "NOT_FOUND",
            "message": f"{exc.resource} {exc.rid} 不存在",
            "code": 40404,
            "path": request.url.path,
        },
    )


@app.exception_handler(BusinessError)
def business_error_handler(request: Request, exc: BusinessError):
    return JSONResponse(
        status_code=400,
        content={
            "error": "BUSINESS_ERROR",
            "message": exc.message,
            "code": exc.code,
            "path": request.url.path,
        },
    )


# ---- CORS 中间件：允许前端跨域访问 ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://example.com"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,
)


# ---- 自定义中间件：请求计时 ----
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    """记录每个请求的处理耗时，写入响应头"""
    start = time.time()
    # call_next 把请求交给下一层（路由或其他中间件）
    response = await call_next(request)
    elapsed_ms = (time.time() - start) * 1000
    response.headers["X-Process-Time-ms"] = f"{elapsed_ms:.2f}"
    return response


# ---- 路由 ----
items = {1: {"id": 1, "name": "MacBook"}, 2: {"id": 2, "name": "iPhone"}}


@app.get("/items/{iid}")
def get_item(iid: int):
    """查询商品：不存在则抛自定义异常"""
    if iid not in items:
        raise NotFoundError("Item", iid)
    return items[iid]


@app.post("/orders")
def create_order(item_id: int, qty: int):
    """创建订单：演示业务异常"""
    if item_id not in items:
        raise NotFoundError("Item", item_id)
    if qty > 100:
        raise BusinessError(40010, "单次下单不能超过 100 件")
    return {"order_id": 999, "item": items[item_id]["name"], "qty": qty}


@app.get("/health")
def health():
    """健康检查端点（部署用）"""
    return {"status": "ok", "service": "blog-api", "version": "1.0.0"}


# ============ 用 TestClient 测试 ============
client = TestClient(app)

print("========== 1. 正常请求 + 计时头 ==========")
r = client.get("/items/1")
print("状态:", r.status_code, "| 响应:", r.json())
print("耗时头 X-Process-Time-ms:", r.headers.get("x-process-time-ms"), "ms")

print("\\n========== 2. 自定义异常（资源不存在）==========")
r = client.get("/items/999")
print("状态:", r.status_code)
print("统一错误格式:", r.json())
print("  error:", r.json()["error"])
print("  message:", r.json()["message"])
print("  code:", r.json()["code"])
print("  path:", r.json()["path"])

print("\\n========== 3. 业务异常（数量超限）==========")
r = client.post("/orders?item_id=1&qty=200")
print("状态:", r.status_code)
print("错误响应:", r.json())

print("\\n========== 4. 正常业务请求 ==========")
r = client.post("/orders?item_id=1&qty=5")
print("状态:", r.status_code, "| 响应:", r.json())

print("\\n========== 5. CORS 预检请求（OPTIONS）==========")
# 模拟浏览器跨域前的 preflight 请求
r = client.options(
    "/items/1",
    headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization",
    },
)
print("预检状态:", r.status_code, "(200 表示允许)")
print("Allow-Origin:", r.headers.get("access-control-allow-origin"))
print("Allow-Methods:", r.headers.get("access-control-allow-methods"))
print("Allow-Headers:", r.headers.get("access-control-allow-headers"))

print("\\n========== 6. CORS 拒绝未授权源 ==========")
# 来自未在 allow_origins 列表的源，不会被允许
r = client.get("/items/1", headers={"Origin": "http://evil-site.com"})
print("状态:", r.status_code, "(响应仍返回，但浏览器会因无 Allow-Origin 头拦截)")
print("Allow-Origin:", r.headers.get("access-control-allow-origin"), "(None 表示未授权)")

print("\\n========== 7. 健康检查 ==========")
r = client.get("/health")
print("状态:", r.status_code, "| 响应:", r.json())

print("\\n========== 8. HTTPException 仍正常工作 ==========")
# HTTPException 不被自定义 handler 拦截，FastAPI 内置处理
@app.get("/raise-http")
def raise_http():
    raise HTTPException(status_code=418, detail="我是茶壶")

r = client.get("/raise-http")
print("HTTPException:", r.status_code, r.json())
`,
  },
];
