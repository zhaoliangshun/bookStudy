// =============================================================
// FastAPI 企业级认证与授权教程（fastapiauth）第二批章节
// -------------------------------------------------------------
// 本批包含第 6~10 章，覆盖密码安全与 FastAPI 认证机制：
//   第 6 章 fa-password-hash:      密码哈希：passlib 与 pwdlib
//   第 7 章 fa-depends:            FastAPI 依赖注入（Depends）
//   第 8 章 fa-oauth2-bearer:      OAuth2PasswordBearer 工作原理
//   第 9 章 fa-login-endpoint:     登录接口实现：从表单到 Token
//   第 10 章 fa-get-current-user:  get_current_user 实现原理
// =============================================================

export const chapters = [
  // =========================================================
  // 第六章：密码哈希：passlib 与 pwdlib
  // =========================================================
  {
    id: "fa-password-hash",
    group: "第二部分 JWT 核心原理",
    icon: "🔑",
    title: "密码哈希：passlib 与 pwdlib",
    content: `# 密码哈希：passlib 与 pwdlib

密码是用户身份认证的最后一道防线，而密码存储方式决定了这道防线是否真正安全。本章将深入讲解为什么必须哈希存储密码、主流哈希算法的原理与选型、passlib 与 pwdlib 两个核心库的使用方法，以及加盐（salt）的本质作用。这是构建任何认证系统的基石——如果密码存储这一步做错了，后面所有的 JWT、OAuth2 都只是空中楼阁。

## 一、为什么绝对不能明文存储密码

### 1.1 一个真实场景的推演

想象你是一家银行的金库管理员。用户把密码（金库钥匙）交给你保管。你会怎么做？

- **错误做法 A**：把所有钥匙挂在一面墙上，谁路过都能看到 → 这就是"明文存储"
- **错误做法 B**：把锁匙锁在一个抽屉里，但抽屉钥匙贴在抽屉上 → 这就是"简单加密存储"（密钥和密文放一起）
- **正确做法**：把每把钥匙塞进一台"单向绞肉机"，绞成一坨无法还原的废铁；下次用户来验证时，把新钥匙也绞一下，对比两坨废铁是否一样 → 这就是"哈希存储"

### 1.2 明文存储的四大风险

很多初学者会觉得："我的数据库在内网，黑客进不来，明文存储没关系。"这种想法极其危险，原因有四：

1. **数据库泄露（SQL 注入、备份泄露、离职员工带走）**：一旦数据库被拖库，所有用户密码瞬间曝光。历史上 LinkedIn、CSDN、天涯都吃过这个亏。
2. **内部威胁**：DBA、运维、开发人员都能看到明文密码。你愿意让同事知道你在所有网站用的是同一个密码吗？
3. **密码复用连锁反应**：80% 的用户在多个网站使用相同密码。一个站明文泄露 = 用户的所有站被攻破。
4. **法律合规**：GDPR、等保 2.0、PCI-DSS 都明确要求密码必须"不可逆存储"。明文存储是违法行为。

### 1.3 哈希存储为什么安全

哈希函数的特性决定了它是密码存储的最佳选择：

- **单向性**：从哈希值无法反推出原始密码（就像绞肉机绞过的肉无法还原成完整的猪）
- **确定性**：同一个密码每次哈希结果相同（这样才能验证）
- **雪崩效应**：密码改一个字符，哈希值天翻地覆（防止通过相似性猜测）
- **抗碰撞**：找不到两个不同密码产生相同哈希（防止伪造）

\`\`\`text
明文密码 "mypassword123"
        │
        ▼
   ┌──────────┐
   │ 哈希函数  │  ← 单向不可逆
   └──────────┘
        │
        ▼
哈希值 "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        │
        ▼
   存入数据库的 password 字段

验证时：
用户输入 "mypassword123" → 哈希 → 和数据库里的哈希对比 → 相同则通过
\`\`\`

## 二、哈希算法的选择：bcrypt、argon2、scrypt

### 2.1 为什么不能用 MD5 / SHA256

很多人第一反应是："用 MD5 或 SHA256 不就行了？"答案是**不行**，原因如下：

1. **太快了**：MD5 每秒可计算数十亿次。黑客拿到哈希后，用 GPU 暴力破解，几小时就能遍历完常用密码字典。
2. **无加盐机制**：相同密码哈希结果相同，黑客可以用"彩虹表"（预计算的密码-哈希对照表）秒破。
3. **设计目标不同**：MD5/SHA 是为"快速校验文件完整性"设计的，而密码哈希需要的是"故意慢"。

密码哈希算法的核心设计目标是：**让合法用户验证时够快（几百毫秒），让暴力破解者够慢（每次都要几百毫秒，遍历十亿个密码需要几十年）**。

### 2.2 bcrypt：久经考验的老牌选手

bcrypt 是 1999 年设计的密码哈希算法，至今仍是业界最广泛使用的选择。

**核心特点：**
- 内置加盐（每次哈希自动生成随机盐，嵌入在哈希结果中）
- 工作因子（cost factor）可调：每增加 1，计算时间翻倍
- 限制密码最大长度为 72 字节（这是它的一个局限）
- 哈希结果自带算法标识、cost、salt，无需单独存储盐

\`\`\`text
bcrypt 哈希结构：
$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│  │  │                      │
│  │  │                      └── 哈希值本体（23 字节）
│  │  └── 盐值（22 字节，Base64 编码）
│  └── cost 因子（2^12 = 4096 轮）
└── 算法版本（2b 是最新版）
\`\`\`

**生活类比**：bcrypt 就像一台"可调节齿轮的绞肉机"。cost 因子就是齿轮数，齿轮越多绞得越慢但越安全。随着硬件变快，你只需要调大 cost 因子就能保持安全性。

### 2.3 argon2：密码哈希竞赛冠军

argon2 是 2015 年 Password Hashing Competition（PHC）的冠军算法，目前被认为是**最安全的密码哈希算法**。

**核心特点：**
- 抗 GPU/ASIC 攻击：除了计算密集，还消耗大量内存（GPU 显存有限，难以并行）
- 三个变体：
  - argon2i：抗侧信道攻击（适合通用场景）
  - argon2d：抗 GPU 攻击（性能更好）
  - argon2id：混合模式（**推荐默认选择**）
- 可调参数：内存、时间、并行度

**生活类比**：bcrypt 是"CPU 密集型绞肉机"，argon2 是"CPU + 内存密集型绞肉机"。黑客想批量暴力破解，不仅要算力，还要大内存，GPU 因为显存小就力不从心了。

### 2.4 scrypt：介于两者之间

scrypt 是 2009 年设计的算法，思路和 argon2 类似（内存困难），但参数调节不如 argon2 灵活。目前在加密货币（莱特币）领域更知名，密码存储领域用得相对少。

### 2.5 选型建议

\`\`\`text
┌─────────────┬────────────┬──────────────┬──────────────────┐
│ 算法        │ 安全性     │ 性能         │ 推荐场景         │
├─────────────┼────────────┼──────────────┼──────────────────┤
│ bcrypt      │ 高         │ 快、轻量     │ 通用、兼容性好   │
│ argon2      │ 最高       │ 慢、吃内存   │ 新项目、高安全   │
│ scrypt      │ 高         │ 中等         │ 特定需求         │
│ MD5/SHA     │ 极低       │ 极快         │ 禁止用于密码     │
└─────────────┴────────────┴──────────────┴──────────────────┘
\`\`\`

**本书建议**：新项目首选 argon2，老项目或追求兼容性用 bcrypt。两者都比 MD5/SHA 安全无数倍。

## 三、passlib 库的使用：CryptContext 配置

### 3.1 passlib 是什么

passlib 是 Python 生态中最知名的密码哈希库，支持 30+ 种算法，提供统一的 API。FastAPI 官方教程长期使用 passlib + bcrypt 作为示例。

### 3.2 CryptContext：算法切换的"调度中心"

passlib 的核心设计是 \`CryptContext\`——一个"算法上下文"对象。你告诉它"用哪个算法哈希、用哪些算法验证"，它就能自动处理算法升级、多算法兼容等复杂场景。

\`\`\`python
from passlib.context import CryptContext

# 创建密码上下文
pwd_context = CryptContext(
    schemes=["bcrypt"],           # 哈希时用的算法
    deprecated="auto",            # 自动标记旧算法为"已废弃"
    bcrypt__rounds=12,            # bcrypt 的 cost 因子
)

# 哈希密码
hashed = pwd_context.hash("mypassword")

# 验证密码
is_valid = pwd_context.verify("mypassword", hashed)
\`\`\`

### 3.3 为什么用 CryptContext 而不是直接调 bcrypt

直接用 \`bcrypt.hashpw()\` 也能哈希密码，但 \`CryptContext\` 提供了三个关键能力：

1. **算法升级**：今天用 bcrypt，明天想换 argon2，只需改 \`schemes\`，旧密码验证时自动识别算法，下次哈希自动用新算法。
2. **多算法兼容**：同时支持验证多种算法的旧哈希（比如迁移老系统）。
3. **统一 API**：\`hash()\` 和 \`verify()\` 两个方法搞定一切，不用记每个算法的不同调用方式。

**生活类比**：直接用 bcrypt 就像只会做一种菜的厨师；用 CryptContext 就像会做各国料理的行政总厨——客人点啥他都能做，还能根据时令自动调整菜单。

### 3.4 deprecated 参数的妙用

\`deprecated="auto"\` 的意思是：当前 \`schemes\` 中除了最后一个算法外，其他都标记为"已废弃"。验证时如果发现密码是用废弃算法哈希的，\`verify()\` 仍会返回 True，但你可以检测到这个情况，提示用户改密码并重新用新算法哈希。

\`\`\`python
# 示例：从 bcrypt 迁移到 argon2
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],  # argon2 是新算法，bcrypt 是旧算法
    deprecated="auto",             # bcrypt 自动标记为废弃
)

# 验证旧 bcrypt 密码时
is_valid = pwd_context.verify(password, old_bcrypt_hash)
needs_update = pwd_context.needs_update(old_bcrypt_hash)  # 返回 True
\`\`\`

## 四、pwdlib：FastAPI 官方推荐的新库

### 4.1 为什么需要新库

passlib 虽好，但有几个问题：
1. 维护放缓：近年更新频率下降
2. 依赖较重：安装时会拉取不少额外依赖
3. API 风格偏老：不支持现代 Python 的类型注解

2024 年起，FastAPI 官方文档开始推荐使用 **pwdlib**——一个更轻量、更现代的密码哈希库。

### 4.2 pwdlib 的核心用法

\`\`\`python
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

# 创建哈希器
password_hash = PasswordHash((BcryptHasher(),))

# 哈希
hashed = password_hash.hash("mypassword")

# 验证
is_valid = password_hash.verify("mypassword", hashed)
\`\`\`

### 4.3 pwdlib vs passlib 对比

\`\`\`text
┌──────────────┬─────────────────┬─────────────────┐
│ 特性         │ passlib         │ pwdlib          │
├──────────────┼─────────────────┼─────────────────┤
│ 安装大小     │ 较大            │ 极小            │
│ 依赖数量     │ 多              │ 少              │
│ 类型注解     │ 弱              │ 完整            │
│ 算法支持     │ 30+             │ bcrypt/argon2   │
│ 算法升级     │ CryptContext    │ 手动管理        │
│ FastAPI 推荐 │ 老教程          │ 新文档          │
└──────────────┴─────────────────┴─────────────────┘
\`\`\`

**选型建议**：新项目可以直接用 pwdlib，老项目继续用 passlib 也没问题，两者安全性等价。

## 五、加盐（salt）的原理与作用

### 5.1 不加盐会怎样

假设两个用户都用 "123456" 作为密码。如果不加盐，用同一个哈希函数算出来的哈希值完全相同。黑客拿到数据库后：

1. 发现 user_A 和 user_B 的密码哈希一样
2. 用彩虹表查这个哈希 → 秒破两个账号
3. 如果全站 1000 人用 "123456"，一次破解 = 拿下 1000 个账号

### 5.2 加盐的本质

**盐（salt）是一段随机字符串，和密码拼接后再哈希。** 每个用户的盐都不同，即使密码相同，哈希结果也不同。

\`\`\`text
用户 A：密码 "123456" + 盐 "abcxyz" → 哈希 → "哈希A"
用户 B：密码 "123456" + 盐 "qwerty" → 哈希 → "哈希B"

哈希A ≠ 哈希B，彩虹表失效，必须逐个破解
\`\`\`

### 5.3 盐要不要保密

**不需要！盐可以明文存储。** 盐的作用不是"保密"，而是"让每个哈希都不同"。即使黑客知道盐，他也得为每个用户单独跑一遍暴力破解，无法用彩虹表批量破解。

**生活类比**：盐就像快递包装上的"收件人地址"。地址是公开的，但有了地址，快递员（黑客）还是得一个一个送（破解），不能把所有包裹一次性投递。

### 5.4 bcrypt/argon2 的内置加盐

bcrypt 和 argon2 都**内置了自动加盐**机制——每次调用 \`hash()\` 时自动生成随机盐，并把盐嵌入在哈希结果中。验证时自动从哈希中提取盐。你完全不用手动管理盐。

\`\`\`python
# 同一密码两次哈希，结果不同（因为盐不同）
h1 = pwd_context.hash("mypassword")  # $2b$12$AAAA...
h2 = pwd_context.hash("mypassword")  # $2b$12$BBBB...
# 但两个都能验证通过
pwd_context.verify("mypassword", h1)  # True
pwd_context.verify("mypassword", h2)  # True
\`\`\`

## 六、验证密码的流程

### 6.1 注册流程

\`\`\`text
用户提交明文密码
      │
      ▼
密码强度校验（长度、复杂度）
      │
      ▼
调用 hash(plaintext) 生成哈希
      │
      ▼
把哈希存入数据库（不存明文、不存盐）
      │
      ▼
注册完成
\`\`\`

### 6.2 登录流程

\`\`\`text
用户提交用户名 + 明文密码
      │
      ▼
从数据库查出该用户的哈希（hash_from_db）
      │
      ▼
调用 verify(plaintext, hash_from_db)
      │
      ▼
  ┌───┴───┐
  │       │
True    False
  │       │
  ▼       ▼
登录成功  401 凭证错误
\`\`\`

### 6.3 verify 的内部原理

\`verify()\` 不是"解密哈希"，而是：
1. 从哈希字符串中提取算法、cost、盐
2. 用这些参数对用户输入的明文密码重新哈希
3. 对比两个哈希是否相同

\`\`\`python
# verify 的伪代码
def verify(plaintext, stored_hash):
    algorithm, cost, salt, _ = parse(stored_hash)
    new_hash = hash_with(plaintext, algorithm, cost, salt)
    return constant_time_compare(new_hash, stored_hash)
\`\`\`

注意 \`constant_time_compare\`——**常数时间比较**，防止"计时攻击"（通过比较耗时差异判断前几位是否正确）。

## 七、本章 demo 目标

用 passlib 实现：
1. 用 bcrypt 和 argon2 两种算法哈希同一密码
2. 验证密码正确性
3. 演示同一密码两次哈希结果不同（盐的作用）
4. 演示错误密码验证失败
5. 对比两种算法的耗时

> 注意：demo 使用 passlib。如果环境没装 passlib，可以用 \`pip install passlib bcrypt argon2-cffi\` 安装。demo 也提供了一个不依赖任何第三方库的纯 Python 简化实现，方便理解原理。

## 八、本章小结

- **密码绝不能明文存储**，也不能用 MD5/SHA 等快速哈希，必须用专用密码哈希算法。
- **bcrypt 是老牌选择**，argon2 是新冠军，两者都比传统哈希安全无数倍。
- **passlib 的 CryptContext** 提供统一 API 和算法升级能力；**pwdlib** 是更轻量的新选择。
- **加盐让每个用户的哈希不同**，使彩虹表失效。bcrypt/argon2 内置自动加盐。
- **验证密码 = 重新哈希 + 常数时间比较**，不是解密。
- 下一章我们将学习 FastAPI 的依赖注入系统，它是连接"密码哈希"和"认证流程"的桥梁。
`,
    code: `"""
第六章 demo：密码哈希与验证
目标：用 passlib 实现 bcrypt / argon2 哈希与验证，并对比算法。
如果没装 passlib，则回退到纯 Python 简化实现（仅用于理解原理，不安全）。
"""
import hashlib
import hmac
import os
import time
import secrets

# ============================================================
# 第一部分：尝试使用 passlib（生产环境推荐做法）
# ============================================================
try:
    from passlib.context import CryptContext

    # 创建 bcrypt 上下文
    # schemes=["bcrypt"] 指定哈希算法为 bcrypt
    # deprecated="auto" 自动处理废弃算法
    # bcrypt__rounds=12 设置 cost 因子为 12（2^12 = 4096 轮迭代）
    bcrypt_ctx = CryptContext(
        schemes=["bcrypt"],
        deprecated="auto",
        bcrypt__rounds=12,
    )

    # 创建 argon2 上下文
    # argon2 需要安装 argon2-cffi：pip install argon2-cffi
    try:
        argon2_ctx = CryptContext(
            schemes=["argon2"],
            deprecated="auto",
            argon2__time_cost=3,      # 时间成本（迭代次数）
            argon2__memory_cost=65536, # 内存成本（64MB）
            argon2__parallelism=2,     # 并行度
        )
        HAS_ARGON2 = True
    except Exception:
        # argon2-cffi 未安装时回退
        HAS_ARGON2 = False

    HAS_PASSLIB = True
    print("=" * 60)
    print("使用 passlib 进行密码哈希（生产环境推荐）")
    print("=" * 60)

    # ----- 演示 1：bcrypt 哈希与验证 -----
    print("\\n【演示 1】bcrypt 哈希与验证")

    password = "MySecretPass123!"

    # 哈希密码
    # 每次调用都会自动生成随机盐，所以同一密码两次哈希结果不同
    hash1 = bcrypt_ctx.hash(password)
    hash2 = bcrypt_ctx.hash(password)

    print(f"  原始密码: {password}")
    print(f"  第一次哈希: {hash1}")
    print(f"  第二次哈希: {hash2}")
    print(f"  两次哈希相同吗? {hash1 == hash2}  ← 盐不同所以不同")

    # 验证密码
    # verify(明文, 哈希) 会自动从哈希中提取盐和参数重新计算
    is_valid_correct = bcrypt_ctx.verify(password, hash1)
    is_valid_wrong = bcrypt_ctx.verify("wrongpassword", hash1)

    print(f"  正确密码验证: {is_valid_correct}  ← 通过")
    print(f"  错误密码验证: {is_valid_wrong}  ← 拒绝")

    # ----- 演示 2：argon2 哈希与验证 -----
    if HAS_ARGON2:
        print("\\n【演示 2】argon2 哈希与验证")

        argon_hash = argon2_ctx.hash(password)
        print(f"  原始密码: {password}")
        print(f"  argon2 哈希: {argon_hash[:60]}...")
        print(f"  验证正确密码: {argon2_ctx.verify(password, argon_hash)}")
        print(f"  验证错误密码: {argon2_ctx.verify('wrong', argon_hash)}")
    else:
        print("\\n【演示 2】跳过 argon2（未安装 argon2-cffi）")

    # ----- 演示 3：对比算法耗时 -----
    print("\\n【演示 3】bcrypt vs argon2 耗时对比")

    # bcrypt 计时
    start = time.time()
    for _ in range(5):
        bcrypt_ctx.hash(password)
    bcrypt_time = (time.time() - start) / 5
    print(f"  bcrypt 平均哈希耗时: {bcrypt_time*1000:.1f} ms")

    if HAS_ARGON2:
        start = time.time()
        for _ in range(5):
            argon2_ctx.hash(password)
        argon2_time = (time.time() - start) / 5
        print(f"  argon2 平均哈希耗时: {argon2_time*1000:.1f} ms")
        print(f"  argon2 比 bcrypt 慢 {argon2_time/bcrypt_time:.1f} 倍（更抗暴力破解）")

    # ----- 演示 4：模拟用户注册与登录 -----
    print("\\n【演示 4】模拟用户注册与登录流程")

    # 模拟数据库
    fake_users_db = {}

    def register(username, plain_password):
        """注册：把明文密码哈希后存入数据库"""
        # 哈希密码（绝不存明文）
        hashed = bcrypt_ctx.hash(plain_password)
        fake_users_db[username] = hashed
        print(f"  [注册] 用户 {username} 注册成功，哈希已存储")

    def login(username, plain_password):
        """登录：验证密码"""
        # 查用户
        if username not in fake_users_db:
            print(f"  [登录] 用户 {username} 不存在")
            return False
        # 验证密码
        stored_hash = fake_users_db[username]
        if bcrypt_ctx.verify(plain_password, stored_hash):
            print(f"  [登录] 用户 {username} 登录成功")
            return True
        else:
            print(f"  [登录] 用户 {username} 密码错误")
            return False

    register("alice", "AlicePass2024!")
    register("bob", "BobPass2024!")
    print()
    login("alice", "AlicePass2024!")      # 正确密码
    login("alice", "wrongpassword")        # 错误密码
    login("charlie", "whatever")           # 不存在的用户

except ImportError:
    # ============================================================
    # 第二部分：纯 Python 简化实现（仅用于理解原理，不安全！）
    # ============================================================
    HAS_PASSLIB = False
    print("=" * 60)
    print("未安装 passlib，使用纯 Python 简化实现（仅用于理解原理）")
    print("安装 passlib: pip install passlib bcrypt argon2-cffi")
    print("=" * 60)

    def simple_hash(password: str, salt: bytes = None, iterations: int = 100000) -> str:
        """
        简化的密码哈希函数（PBKDF2-HMAC-SHA256）。
        生产环境请用 bcrypt/argon2，这里只是为了理解原理。

        参数：
            password: 明文密码
            salt: 盐值（None 则自动生成）
            iterations: 迭代次数（类似 bcrypt 的 cost）

        返回：
            格式为 "iterations$salt_hex$hash_hex" 的字符串
        """
        # 如果没有提供盐，生成 16 字节随机盐
        if salt is None:
            salt = os.urandom(16)  # 加密安全的随机数

        # 用 PBKDF2 算法哈希
        # hashlib.pbkdf2_hmac 内部会迭代 iterations 次
        dk = hashlib.pbkdf2_hmac(
            "sha256",              # 哈希算法
            password.encode("utf-8"),  # 密码转字节
            salt,                  # 盐
            iterations,            # 迭代次数
            dklen=32,              # 输出长度 32 字节
        )

        # 把 iterations、salt、hash 编码成字符串
        # 这样验证时可以解析出来
        return f"{iterations}\${salt.hex()}\${dk.hex()}"

    def simple_verify(password: str, stored_hash: str) -> bool:
        """
        验证密码：从存储的哈希中提取参数，重新哈希后比较。
        使用 hmac.compare_digest 做常数时间比较，防止计时攻击。
        """
        # 解析存储的哈希字符串
        parts = stored_hash.split("\$")
        if len(parts) != 3:
            return False
        iterations = int(parts[0])
        salt = bytes.fromhex(parts[1])
        original_dk = bytes.fromhex(parts[2])

        # 用相同参数重新哈希
        new_dk = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            iterations,
            dklen=32,
        )

        # 常数时间比较（防止计时攻击）
        # 不能用 == 比较，因为 == 会短路（第一个字节不同就返回）
        return hmac.compare_digest(new_dk, original_dk)

    # ----- 演示 1：哈希与验证 -----
    print("\\n【演示 1】密码哈希与验证（PBKDF2 简化实现）")

    password = "MySecretPass123!"
    hash1 = simple_hash(password)
    hash2 = simple_hash(password)

    print(f"  原始密码: {password}")
    print(f"  第一次哈希: {hash1[:50]}...")
    print(f"  第二次哈希: {hash2[:50]}...")
    print(f"  两次哈希相同吗? {hash1 == hash2}  ← 盐不同所以不同")

    print(f"  正确密码验证: {simple_verify(password, hash1)}")
    print(f"  错误密码验证: {simple_verify('wrong', hash1)}")

    # ----- 演示 2：盐的作用 -----
    print("\\n【演示 2】盐的作用 —— 相同密码哈希不同")

    # 两个用户用相同密码
    user1_hash = simple_hash("123456")
    user2_hash = simple_hash("123456")
    print(f"  用户1 的哈希: {user1_hash[:40]}...")
    print(f"  用户2 的哈希: {user2_hash[:40]}...")
    print(f"  哈希相同吗? {user1_hash == user2_hash}")
    print(f"  ← 加盐后即使密码相同，哈希也不同，彩虹表失效")

    # ----- 演示 3：迭代次数对耗时的影响 -----
    print("\\n【演示 3】迭代次数对耗时的影响")

    for iters in [10000, 50000, 100000, 200000]:
        start = time.time()
        simple_hash("test", iterations=iters)
        cost = time.time() - start
        print(f"  {iters:>6} 次迭代: {cost*1000:.1f} ms")

    # ----- 演示 4：模拟用户注册与登录 -----
    print("\\n【演示 4】模拟用户注册与登录流程")

    fake_users_db = {}

    def register(username, plain_password):
        """注册：哈希后存储"""
        hashed = simple_hash(plain_password)
        fake_users_db[username] = hashed
        print(f"  [注册] 用户 {username} 注册成功")

    def login(username, plain_password):
        """登录：验证密码"""
        if username not in fake_users_db:
            print(f"  [登录] 用户 {username} 不存在")
            return False
        stored_hash = fake_users_db[username]
        if simple_verify(plain_password, stored_hash):
            print(f"  [登录] 用户 {username} 登录成功")
            return True
        else:
            print(f"  [登录] 用户 {username} 密码错误")
            return False

    register("alice", "AlicePass2024!")
    register("bob", "BobPass2024!")
    print()
    login("alice", "AlicePass2024!")
    login("alice", "wrongpassword")
    login("charlie", "whatever")

# ============================================================
# 第三部分：总结
# ============================================================
print("\\n" + "=" * 60)
print("本章核心要点总结")
print("=" * 60)
print("1. 密码绝不能明文存储，必须用专用哈希算法")
print("2. bcrypt 内置加盐，每次哈希结果不同")
print("3. verify 不是解密，而是重新哈希后比较")
print("4. argon2 比 bcrypt 更抗 GPU 暴力破解")
print("5. cost 因子 / 迭代次数可调，硬件变快就调大")
print("6. 常数时间比较防止计时攻击")
print("=" * 60)
`,
  },

  // =========================================================
  // 第七章：FastAPI 依赖注入（Depends）
  // =========================================================
  {
    id: "fa-depends",
    group: "第三部分 FastAPI 认证机制",
    icon: "🔌",
    title: "FastAPI 依赖注入（Depends）",
    content: `# FastAPI 依赖注入（Depends）

依赖注入（Dependency Injection, DI）是 FastAPI 最强大的核心特性之一。它不是 FastAPI 发明的概念，但 FastAPI 用极其优雅的方式实现了它。理解 Depends 是理解后续所有认证机制（OAuth2、get_current_user）的前提——因为认证本质上就是一组嵌套的依赖。本章将彻底讲透 Depends 的设计思想、五种用法和最佳实践。

## 一、Depends 的核心思想：依赖反转

### 1.1 先看一个"不用依赖注入"的世界

假设你要写一个"查询用户订单"的接口。这个接口需要：
1. 从请求头提取 token
2. 解析 token 拿到 user_id
3. 用 user_id 查数据库
4. 用查到的用户权限校验是否能看订单
5. 最后才执行业务逻辑

不用依赖注入，代码会变成这样：

\`\`\`python
@app.get("/orders/{order_id}")
def get_order(order_id: int, authorization: str = Header(...)):
    # 第 1 步：提取 token
    token = authorization.replace("Bearer ", "")
    # 第 2 步：解析 token
    user_id = decode_token(token)
    # 第 3 步：查数据库
    user = db.query(User).get(user_id)
    # 第 4 步：权限校验
    if not user.can_view_order(order_id):
        raise HTTPException(403)
    # 第 5 步：业务逻辑（这才是函数该干的事）
    return db.query(Order).get(order_id)
\`\`\`

问题很明显：**业务函数里混入了大量"准备工作"**。这些准备工作在每个需要认证的接口都要重复一遍，而且难以测试——你想测试业务逻辑，却不得不先构造一个完整的请求环境。

### 1.2 依赖反转：让"准备工作"自己来找你

依赖注入的核心思想是：**不要自己去获取依赖，让框架把依赖送进来**。

\`\`\`python
# 把"提取当前用户"封装成一个依赖函数
def get_current_user(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)
    return db.query(User).get(user_id)

# 业务函数只关心业务，认证由依赖自动完成
@app.get("/orders/{order_id}")
def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    if not current_user.can_view_order(order_id):
        raise HTTPException(403)
    return db.query(Order).get(order_id)
\`\`\`

**生活类比**：这就像去餐厅点菜。你不需要自己去厨房找食材、切菜、调味——你只需要告诉服务员"我要一份宫保鸡丁"（声明依赖），厨房（框架）会把做好的菜端到你面前（注入依赖）。你（业务函数）只负责"吃"（处理业务）。

### 1.3 依赖反转原则（DIP）

这是 SOLID 原则中的 D：
- **高层模块不应该依赖低层模块，两者都应依赖抽象**
- **抽象不应该依赖细节，细节应该依赖抽象**

在 FastAPI 中：
- 高层模块 = 你的路由函数
- 低层模块 = 数据库连接、认证逻辑、配置读取
- 抽象 = Depends 声明的依赖关系

路由函数不直接 \`import db\` 或 \`import auth\`，而是通过 \`Depends()\` 声明"我需要一个能干这件事的东西"，具体用哪个实现由框架决定。这使得：
- 路由函数可独立测试（传入 mock 依赖）
- 依赖实现可随时替换（换数据库、换认证方式）
- 代码职责清晰（路由只管业务，依赖只管准备）

## 二、函数作为依赖：参数自动注入

### 2.1 最简单的函数依赖

任何可调用对象（函数、方法、类）都可以作为依赖。FastAPI 会自动识别依赖的参数，并递归地解析它们。

\`\`\`python
def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
def list_items(commons: dict = Depends(common_parameters)):
    # commons 已经被自动填充
    return {"params": commons}
\`\`\`

### 2.2 依赖的参数也是依赖

依赖函数的参数会被 FastAPI 自动从请求中提取。\`common_parameters\` 的 \`q\`、\`skip\`、\`limit\` 会被自动从查询字符串中解析，就像它们直接写在路由函数上一样。

\`\`\`text
请求: GET /items/?q=apple&skip=0&limit=10

FastAPI 解析流程：
1. 看到 list_items 有依赖 common_parameters
2. 检查 common_parameters 的参数签名
3. 从 query string 提取 q, skip, limit
4. 调用 common_parameters(q="apple", skip=0, limit=10)
5. 把返回值 {"q":"apple","skip":0,"limit":10} 注入 list_items 的 commons 参数
\`\`\`

## 三、类作为依赖：实例化注入

### 3.1 类依赖的原理

类也可以作为依赖。FastAPI 会把类的 \`__init__\` 参数当作依赖参数，自动实例化后注入。

\`\`\`python
class PaginationParams:
    def __init__(self, page: int = 1, size: int = 10):
        self.page = page
        self.size = size

@app.get("/items/")
def list_items(pagination: PaginationParams = Depends(PaginationParams)):
    # pagination 是 PaginationParams 的实例
    return {"page": pagination.page, "size": pagination.size}
\`\`\`

### 3.2 类依赖 vs 函数依赖

\`\`\`text
┌─────────────┬──────────────────┬──────────────────┐
│ 特性        │ 函数依赖         │ 类依赖           │
├─────────────┼──────────────────┼──────────────────┤
│ 返回值      │ 任意             │ 类实例           │
│ 状态管理    │ 无状态           │ 可携带状态       │
│ 继承复用    │ 不支持           │ 支持             │
│ 适用场景    │ 简单转换、查询   │ 复杂参数对象     │
└─────────────┴──────────────────┴──────────────────┘
\`\`\`

**生活类比**：函数依赖像"叫外卖"——给参数，拿到结果；类依赖像"雇员工"——给入职要求（init 参数），得到一个能干活的员工（实例），员工还能记住自己的状态。

### 3.3 类依赖的继承复用

类依赖最大的优势是可以继承，实现参数复用：

\`\`\`python
class BaseFilter:
    def __init__(self, q: str | None = None):
        self.q = q

class ItemFilter(BaseFilter):
    def __init__(self, q: str | None = None, category: str | None = None):
        super().__init__(q)
        self.category = category
\`\`\`

## 四、嵌套依赖：依赖链

### 4.1 依赖可以依赖依赖

依赖函数本身也可以有依赖。FastAPI 会递归解析整条依赖链。

\`\`\`python
# 依赖 1：提取 token
def extract_token(authorization: str = Header(...)):
    return authorization.replace("Bearer ", "")

# 依赖 2：解码 token（依赖依赖 1）
def decode_user(token: str = Depends(extract_token)):
    return jwt.decode(token, SECRET_KEY)

# 依赖 3：查用户（依赖依赖 2）
def get_current_user(payload: dict = Depends(decode_user)):
    return db.get_user(payload["sub"])

# 路由（依赖依赖 3）
@app.get("/me")
def read_me(user = Depends(get_current_user)):
    return user
\`\`\`

### 4.2 依赖链的执行顺序

\`\`\`text
extract_token → decode_user → get_current_user → read_me

每一步的输出是下一步的输入
任何一步失败（抛异常），整条链中断
\`\`\`

**生活类比**：这就像工厂流水线。原料（HTTP 请求）经过一道道工序（依赖），每道工序加工后的半成品传给下一道，最终产出成品（响应）。如果某道工序出问题，整条流水线停摆。

## 五、yield 依赖：资源管理与清理

### 5.1 普通依赖的问题

普通依赖函数 \`return\` 后就结束了，无法做清理工作。比如数据库连接：

\`\`\`python
def get_db():
    db = SessionLocal()  # 创建连接
    return db
    # 连接什么时候关闭？泄漏了！
\`\`\`

### 5.2 yield 依赖的优雅解决

用 \`yield\` 代替 \`return\`，yield 之后的代码会在请求结束后执行：

\`\`\`python
def get_db():
    db = SessionLocal()  # 创建连接
    try:
        yield db         # 把连接交给路由函数使用
    finally:
        db.close()       # 请求结束后关闭连接

@app.get("/items/")
def list_items(db: Session = Depends(get_db)):
    items = db.query(Item).all()  # 使用 db
    return items
    # 返回后，get_db 的 finally 块自动执行，db.close()
\`\`\`

### 5.3 yield 依赖的执行时序

\`\`\`text
1. FastAPI 调用 get_db()
2. 执行到 yield db，暂停，把 db 注入路由
3. 执行路由函数，返回响应
4. 响应发送给客户端后
5. 回到 get_db()，执行 yield 之后的 finally 块
6. db.close() 关闭连接
\`\`\`

**生活类比**：yield 依赖就像酒店入住。前台（依赖）给你房卡（yield 的值），你去房间住（路由执行），退房时（请求结束）前台收回房卡并打扫房间（yield 后的清理代码）。

### 5.4 yield 依赖中的异常处理

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()  # 路由抛异常时回滚
        raise
    finally:
        db.close()     # 无论成功失败都关闭
\`\`\`

## 六、全局依赖与路径级依赖

### 6.1 全局依赖

在 \`FastAPI()\` 构造函数中声明的依赖，对**所有路由**生效：

\`\`\`python
async def verify_api_key(api_key: str = Header(...)):
    if api_key != "expected-key":
        raise HTTPException(403)

app = FastAPI(dependencies=[Depends(verify_api_key)])
# 所有路由都会先执行 verify_api_key
\`\`\`

### 6.2 路由级依赖

在 \`@app.get()\` 中声明的依赖，只对该路由生效：

\`\`\`python
@app.get("/public/")
def public_endpoint():
    return {"msg": "无需认证"}

@app.get("/private/", dependencies=[Depends(verify_api_key)])
def private_endpoint():
    return {"msg": "需要 API key"}
\`\`\`

### 6.3 路由器级依赖

\`APIRouter\` 也可以声明依赖，对该路由器下所有路由生效：

\`\`\`python
admin_router = APIRouter(dependencies=[Depends(require_admin)])

@admin_router.get("/users/")
def list_users():
    ...
\`\`\`

### 6.4 三种依赖的作用范围对比

\`\`\`text
┌──────────────┬──────────────────────────────┐
│ 依赖级别     │ 作用范围                     │
├──────────────┼──────────────────────────────┤
│ 全局依赖     │ 应用内所有路由               │
│ 路由器依赖   │ 该路由器下所有路由           │
│ 路由依赖     │ 仅该路由                     │
│ 参数依赖     │ 仅该路由的该参数             │
└──────────────┴──────────────────────────────┘
\`\`\`

## 七、Depends 的高级用法

### 7.1 同一依赖的缓存

默认情况下，同一请求内对同一依赖只执行一次，结果被缓存复用：

\`\`\`python
def expensive_query():
    print("执行查询")  # 只会打印一次
    return {"data": "..."}

@app.get("/items/")
def list_items(
    a: dict = Depends(expensive_query),
    b: dict = Depends(expensive_query),  # 复用上面的结果，不会再次执行
):
    return {"a": a, "b": b}
\`\`\`

可以用 \`use_cache=False\` 禁用缓存。

### 7.2 依赖不一定要被使用

有时候声明依赖只是为了它的副作用（比如权限校验），不需要它的返回值：

\`\`\`python
def verify_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(403)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, _: None = Depends(verify_admin)):
    # _ 不使用 verify_admin 的返回值，只利用它的副作用
    db.delete_user(user_id)
\`\`\`

或者用 \`dependencies=[...]\` 参数：

\`\`\`python
@app.delete("/users/{user_id}", dependencies=[Depends(verify_admin)])
def delete_user(user_id: int):
    db.delete_user(user_id)
\`\`\`

## 八、本章 demo 目标

用一个完整的 demo 演示：
1. 函数作为依赖
2. 类作为依赖
3. 嵌套依赖链（三层）
4. yield 依赖的资源管理
5. 模拟全局依赖

> demo 不依赖 FastAPI 运行，用纯 Python 模拟 Depends 的核心机制。

## 九、本章小结

- **Depends 实现了依赖反转**：路由函数声明"我需要什么"，框架负责获取并注入。
- **函数和类都可以作为依赖**，FastAPI 会自动解析参数。
- **嵌套依赖形成依赖链**，递归解析，任何一步失败则整条链中断。
- **yield 依赖解决资源管理**：yield 前是准备，yield 后是清理。
- **依赖有三种作用域**：全局、路由器、路由级别。
- **认证就是一组嵌套依赖**：OAuth2PasswordBearer → get_current_user → 路由函数。下一章我们将深入 OAuth2PasswordBearer。
`,
    code: `"""
第七章 demo：FastAPI 依赖注入机制模拟
目标：用纯 Python 模拟 Depends 的核心机制，包括：
  - 函数依赖
  - 类依赖
  - 嵌套依赖链
  - yield 依赖（资源管理）
  - 依赖缓存
注意：这是教学用简化实现，真实 FastAPI 的 Depends 更复杂。
"""
from typing import Callable, Any
import inspect
from functools import wraps

# ============================================================
# 第一部分：模拟 FastAPI 的 Depends 机制
# ============================================================

class Depends:
    """
    模拟 FastAPI 的 Depends 标记类。
    用法：Depends(dependency) 标记某个参数需要依赖注入。
    """
    def __init__(self, dependency: Callable = None, use_cache: bool = True):
        # dependency 是被依赖的可调用对象
        self.dependency = dependency
        # use_cache 控制是否在同一请求内缓存结果
        self.use_cache = use_cache


def resolve_dependency(dep: Depends, request_params: dict, cache: dict) -> Any:
    """
    递归解析一个依赖。
    
    参数：
        dep: Depends 实例
        request_params: 模拟的请求参数（query string、headers 等）
        cache: 依赖缓存字典（同一请求内复用）
    
    返回：
        依赖的执行结果
    """
    # 获取被依赖的函数/类
    func = dep.dependency

    # 如果是类，把类当作可调用对象（实例化）
    # inspect.signature 对类返回 __init__ 的签名（不含 self）

    # 检查缓存（如果启用且已缓存过）
    cache_key = id(func)
    if dep.use_cache and cache_key in cache:
        return cache[cache_key]

    # 获取依赖的参数签名
    sig = inspect.signature(func)

    # 递归解析依赖的参数
    kwargs = {}
    for param_name, param in sig.parameters.items():
        # 如果参数本身是 Depends，递归解析
        if isinstance(param.default, Depends):
            kwargs[param_name] = resolve_dependency(param.default, request_params, cache)
        # 如果参数有默认值，尝试从请求参数中获取
        elif param.default is inspect.Parameter.empty:
            # 必填参数，从 request_params 取
            if param_name in request_params:
                kwargs[param_name] = request_params[param_name]
            else:
                raise ValueError(f"缺少参数: {param_name}")
        else:
            # 有默认值的参数，优先从 request_params 取，否则用默认值
            kwargs[param_name] = request_params.get(param_name, param.default)

    # 执行依赖函数/类
    result = func(**kwargs)

    # 缓存结果
    if dep.use_cache:
        cache[cache_key] = result

    return result


def execute_route(route_func: Callable, request_params: dict) -> Any:
    """
    模拟 FastAPI 执行路由函数的过程。
    1. 解析路由函数的依赖
    2. 执行路由函数
    3. 清理 yield 依赖的资源
    """
    print(f"\\n{'='*50}")
    print(f"执行路由: {route_func.__name__}")
    print(f"请求参数: {request_params}")
    print(f"{'='*50}")

    # 依赖缓存（同一请求内复用）
    cache = {}
    # 记录所有 yield 依赖的生成器，用于请求后清理
    generators = []

    sig = inspect.signature(route_func)
    kwargs = {}

    for param_name, param in sig.parameters.items():
        if isinstance(param.default, Depends):
            # 这是一个依赖，需要解析
            dep = param.default
            func = dep.dependency
            cache_key = id(func)

            if dep.use_cache and cache_key in cache:
                kwargs[param_name] = cache[cache_key]
                continue

            # 检查是否是生成器函数（yield 依赖）
            if inspect.isgeneratorfunction(func):
                # 创建生成器
                gen = func(**resolve_gen_args(func, request_params, cache, generators))
                # 启动生成器，获取 yield 的值
                value = next(gen)
                kwargs[param_name] = value
                generators.append(gen)
                if dep.use_cache:
                    cache[cache_key] = value
            else:
                # 普通依赖
                result = resolve_dependency(dep, request_params, cache)
                kwargs[param_name] = result

    # 执行路由函数
    result = route_func(**kwargs)

    # 清理 yield 依赖（执行 yield 之后的代码）
    for gen in reversed(generators):
        try:
            next(gen)
        except StopIteration:
            pass

    return result


def resolve_gen_args(func, request_params, cache, generators):
    """
    解析 yield 依赖函数的参数（简化版，复用 resolve_dependency 的逻辑）。
    """
    sig = inspect.signature(func)
    kwargs = {}
    for param_name, param in sig.parameters.items():
        if isinstance(param.default, Depends):
            kwargs[param_name] = resolve_dependency(param.default, request_params, cache)
        elif param.default is not inspect.Parameter.empty:
            kwargs[param_name] = request_params.get(param_name, param.default)
        elif param_name in request_params:
            kwargs[param_name] = request_params[param_name]
    return kwargs


# ============================================================
# 第二部分：定义依赖
# ============================================================

# ----- 依赖 1：函数依赖（分页参数） -----
def pagination_params(q: str = None, skip: int = 0, limit: int = 10):
    """提取分页参数，返回字典"""
    print(f"  [依赖 pagination_params] q={q}, skip={skip}, limit={limit}")
    return {"q": q, "skip": skip, "limit": limit}


# ----- 依赖 2：类依赖（排序参数） -----
class SortParams:
    """排序参数类依赖"""
    def __init__(self, sort_by: str = "id", order: str = "asc"):
        self.sort_by = sort_by
        self.order = order
        print(f"  [依赖 SortParams] sort_by={sort_by}, order={order}")

    def to_dict(self):
        return {"sort_by": self.sort_by, "order": self.order}


# ----- 依赖 3：yield 依赖（模拟数据库连接） -----
def get_db():
    """
    模拟数据库连接的 yield 依赖。
    yield 前是创建连接，yield 后是关闭连接。
    """
    print("  [依赖 get_db] 创建数据库连接...")
    db = {"connection": "active", "queries": 0}
    try:
        yield db  # 把连接交给路由使用
    finally:
        # 请求结束后执行清理
        print(f"  [依赖 get_db] 关闭数据库连接（执行了 {db['queries']} 次查询）")


# ----- 依赖 4：嵌套依赖（token 提取 → 解码 → 用户） -----
def extract_token(authorization: str = "Bearer abc123"):
    """从 Authorization 头提取 token"""
    token = authorization.replace("Bearer ", "")
    print(f"  [依赖 extract_token] 提取到 token: {token}")
    return token


def decode_token(token: str = Depends(extract_token)):
    """解码 token（依赖 extract_token）"""
    # 模拟 JWT 解码
    if token == "abc123":
        payload = {"user_id": 1, "username": "alice"}
    elif token == "xyz789":
        payload = {"user_id": 2, "username": "bob"}
    else:
        payload = {"user_id": 0, "username": "unknown"}
    print(f"  [依赖 decode_token] 解码得到: {payload}")
    return payload


def get_current_user(payload: dict = Depends(decode_token)):
    """获取当前用户（依赖 decode_token）"""
    user = {"id": payload["user_id"], "name": payload["username"]}
    print(f"  [依赖 get_current_user] 当前用户: {user}")
    return user


# ============================================================
# 第三部分：定义路由函数（模拟）
# ============================================================

def list_items(
    pagination: dict = Depends(pagination_params),
    sort: SortParams = Depends(SortParams),
    db: dict = Depends(get_db),
):
    """路由：列出商品（使用函数依赖、类依赖、yield 依赖）"""
    print("  [路由 list_items] 执行业务逻辑")
    db["queries"] += 1  # 模拟查询
    return {
        "items": ["item1", "item2"],
        "pagination": pagination,
        "sort": sort.to_dict(),
    }


def get_profile(user: dict = Depends(get_current_user)):
    """路由：获取用户资料（使用嵌套依赖链）"""
    print("  [路由 get_profile] 执行业务逻辑")
    return {"user": user, "profile": "这是用户资料"}


def dashboard(
    user: dict = Depends(get_current_user),
    db: dict = Depends(get_db),
    pagination: dict = Depends(pagination_params),
):
    """路由：仪表盘（综合使用多种依赖）"""
    print("  [路由 dashboard] 执行业务逻辑")
    db["queries"] += 1
    if user["id"] == 0:
        return {"error": "未认证用户"}
    return {
        "user": user,
        "stats": {"visits": 100},
        "pagination": pagination,
    }


# ============================================================
# 第四部分：运行演示
# ============================================================

if __name__ == "__main__":
    print("#" * 60)
    print("# FastAPI 依赖注入机制模拟演示")
    print("#" * 60)

    # ----- 演示 1：函数依赖 + 类依赖 + yield 依赖 -----
    print("\\n\\n>>> 演示 1：函数依赖 + 类依赖 + yield 依赖")
    result = execute_route(list_items, {
        "q": "手机",
        "skip": 0,
        "limit": 20,
        "sort_by": "price",
        "order": "desc",
    })
    print(f"  返回结果: {result}")

    # ----- 演示 2：嵌套依赖链 -----
    print("\\n\\n>>> 演示 2：嵌套依赖链（extract_token → decode_token → get_current_user）")
    result = execute_route(get_profile, {
        "authorization": "Bearer abc123",
    })
    print(f"  返回结果: {result}")

    # ----- 演示 3：另一个 token -----
    print("\\n\\n>>> 演示 3：使用不同的 token")
    result = execute_route(get_profile, {
        "authorization": "Bearer xyz789",
    })
    print(f"  返回结果: {result}")

    # ----- 演示 4：综合使用 -----
    print("\\n\\n>>> 演示 4：综合使用多种依赖（dashboard 路由）")
    result = execute_route(dashboard, {
        "authorization": "Bearer abc123",
        "q": "今日数据",
        "skip": 0,
        "limit": 5,
    })
    print(f"  返回结果: {result}")

    # ----- 演示 5：yield 依赖的清理 -----
    print("\\n\\n>>> 演示 5：观察 yield 依赖的清理时机")
    print("注意看 get_db 的'关闭连接'消息出现在路由返回之后")
    result = execute_route(list_items, {
        "q": "测试",
        "limit": 10,
    })
    print(f"  返回结果: {result}")

    # ----- 总结 -----
    print("\\n\\n" + "=" * 60)
    print("本章核心要点总结")
    print("=" * 60)
    print("1. Depends 实现依赖反转：声明需要什么，框架负责获取")
    print("2. 函数和类都可作为依赖，参数自动从请求中解析")
    print("3. 依赖可以嵌套，形成依赖链，递归解析")
    print("4. yield 依赖实现资源管理：yield 前准备，yield 后清理")
    print("5. 同一请求内依赖默认缓存，避免重复执行")
    print("6. 认证就是一条嵌套依赖链：OAuth2 → get_current_user → 路由")
    print("=" * 60)
`,
  },

  // =========================================================
  // 第八章：OAuth2PasswordBearer 工作原理
  // =========================================================
  {
    id: "fa-oauth2-bearer",
    group: "第三部分 FastAPI 认证机制",
    icon: "🎫",
    title: "OAuth2PasswordBearer 工作原理",
    content: `# OAuth2PasswordBearer 工作原理

\`OAuth2PasswordBearer\` 是 FastAPI 安全模块中最常用的组件。它看起来只是一个简单的对象，但实际上它同时承担了两个角色：一个"依赖"和一个"OpenAPI 文档生成器"。理解它的工作原理，是理解 FastAPI 认证体系的关键。本章将从 OAuth2 协议讲起，逐层剖析 OAuth2PasswordBearer 的每个细节。

## 一、OAuth2 协议与密码授权模式

### 1.1 OAuth2 是什么

OAuth2 是一个**授权框架**（Authorization Framework），定义了一套标准流程，让用户可以把"某项权限"授予"第三方应用"，而无需把密码告诉第三方。

**生活类比**：OAuth2 就像酒店的房卡系统。你入住时前台给你一张房卡（access token），这张卡只能开你自己的房间（限定权限），有有效期（过期时间），丢了可以挂失（撤销）。你不需要把身份证（密码）交给房卡，房卡也无法反推出你的身份证。

### 1.2 OAuth2 的四种授权模式

OAuth2 定义了四种授权方式（Grant Type），适配不同场景：

\`\`\`text
┌──────────────────┬──────────────────────────────────────┐
│ 授权模式         │ 适用场景                             │
├──────────────────┼──────────────────────────────────────┤
│ 授权码模式       │ 第三方应用（如"用微信登录"）         │
│  (Authorization  │ 最安全，需要重定向                   │
│   Code)          │                                      │
├──────────────────┼──────────────────────────────────────┤
│ 密码模式         │ 自己的第一方应用（前后端都是自己）   │
│  (Password)      │ 用户直接把密码给自己的后端           │
├──────────────────┼──────────────────────────────────────┤
│ 客户端凭证模式   │ 服务间调用（M2M，machine to machine）│
│  (Client         │ 没有"用户"参与，只有应用             │
│   Credentials)   │                                      │
├──────────────────┼──────────────────────────────────────┤
│ 隐式模式         │ 已不推荐，被授权码+PKCE 取代         │
│  (Implicit)      │                                      │
└──────────────────┴──────────────────────────────────────┘
\`\`\`

### 1.3 为什么 FastAPI 选择密码模式

FastAPI 的 \`OAuth2PasswordBearer\` 专注于**密码模式**。原因如下：

1. **第一方场景**：FastAPI 通常用于"前后端都是自己开发"的项目，用户直接在自己的前端输入密码，交给自己的后端验证。不需要第三方介入。
2. **简单直接**：不需要重定向、授权码交换等多步流程，前端把 username/password POST 到后端，后端返回 token。
3. **适合学习**：密码模式是理解 OAuth2 的最佳起点，理解了它再学授权码模式会容易得多。

### 1.4 密码模式的完整流程

\`\`\`text
┌────────┐         ┌────────┐         ┌────────┐
│  前端  │         │ 后端   │         │ 数据库 │
│(浏览器)│         │FastAPI │         │        │
└───┬────┘         └───┬────┘         └───┬────┘
    │                   │                  │
    │ 1. POST /token    │                  │
    │ username=alice    │                  │
    │ password=***      │                  │
    ├──────────────────>│                  │
    │                   │ 2. 查用户        │
    │                   ├─────────────────>│
    │                   │ 3. 返回用户记录  │
    │                   │<─────────────────┤
    │                   │ 4. 验证密码      │
    │                   │ 5. 生成 JWT      │
    │                   │                  │
    │ 6. 返回           │                  │
    │ {access_token,    │                  │
    │  token_type:bearer}                  │
    │<──────────────────┤                  │
    │                   │                  │
    │ 7. GET /users/me  │                  │
    │ Authorization:    │                  │
    │ Bearer <token>    │                  │
    ├──────────────────>│                  │
    │                   │ 8. 验证 token    │
    │                   │ 9. 返回用户信息  │
    │ 10. 返回数据      │                  │
    │<──────────────────┤                  │
\`\`\`

## 二、OAuth2PasswordBearer 的初始化参数

### 2.1 创建实例

\`\`\`python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
\`\`\`

这一行代码做了什么？它创建了一个"OAuth2 密码模式"的安全方案对象，并告诉 FastAPI："登录接口的 URL 是 \`/token\`"。

### 2.2 tokenUrl 参数

\`tokenUrl\` 不是"去这个 URL 获取 token"的意思，而是"**告诉 OpenAPI 文档，登录接口在这里**"。

它的作用是：
1. 在 Swagger UI（/docs）页面显示一个"Authorize"按钮
2. 用户点击 Authorize，输入 username/password
3. Swagger UI 自动向 \`tokenUrl\` 指定的地址 POST 表单
4. 拿到 token 后，后续请求自动带上 \`Authorization: Bearer <token>\`

\`\`\`text
tokenUrl="token" → Swagger UI 会向 POST /token 发送登录表单
tokenUrl="/api/v1/auth/login" → Swagger UI 会向 POST /api/v1/auth/login 发送
\`\`\`

**注意**：\`tokenUrl\` 不会自动创建登录路由！你仍然需要自己写 \`@app.post("/token")\` 的处理函数。\`tokenUrl\` 只影响文档，不影响路由。

### 2.3 auto_error 参数

\`auto_error\` 控制"没有 token 时的行为"：

\`\`\`python
# 默认：auto_error=True，没 token 自动返回 401
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# auto_error=False，没 token 返回 None，不报错
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
\`\`\`

\`auto_error=False\` 的场景：某些接口"登录可选"——登录了看更多内容，没登录看基础内容。

\`\`\`python
@app.get("/posts/")
def list_posts(token: str | None = Depends(oauth2_scheme)):
    if token:
        # 登录用户，返回个性化内容
        user = get_current_user(token)
        return get_personalized_posts(user)
    else:
        # 未登录用户，返回公开内容
        return get_public_posts()
\`\`\`

## 三、OAuth2PasswordBearer 本身是一个依赖

### 3.1 它是可调用的

\`OAuth2PasswordBearer\` 实例是一个可调用对象（实现了 \`__call__\`），所以它可以作为 \`Depends()\` 的参数。

\`\`\`python
@app.get("/users/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    # token 已经被 oauth2_scheme 自动从请求头提取
    return {"token": token}
\`\`\`

### 3.2 它做了什么

当作为依赖被调用时，\`oauth2_scheme\` 会：

1. 从请求的 \`Authorization\` 头提取值
2. 检查值是否以 \`Bearer \` 开头
3. 提取 \`Bearer \` 后面的 token 字符串
4. 如果没有 Authorization 头或格式不对：
   - \`auto_error=True\` → 抛出 401 异常
   - \`auto_error=False\` → 返回 None
5. 返回 token 字符串

### 3.3 Bearer Token 的含义

"Bearer" 的字面意思是"持有者"。\`Authorization: Bearer <token>\` 的语义是："持有此 token 的人"——谁有这个 token，谁就有权限。

\`\`\`text
HTTP 请求头示例：
GET /users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM...

解析：
  方案(scheme): Bearer
  凭证(credentials): eyJhbGciOiJI...
\`\`\`

**生活类比**：Bearer token 就像快递柜的取件码。谁有取件码谁就能取件，快递柜不验证你是谁。所以 token 必须保管好，泄露了就等于密码泄露。

## 四、tokenUrl 的作用：生成 OpenAPI 文档的登录端点

### 4.1 OpenAPI 规范中的安全方案

OAuth2PasswordBearer 在 OpenAPI 文档中生成一个"安全方案"（security scheme），定义了：

\`\`\`json
{
  "components": {
    "securitySchemes": {
      "OAuth2PasswordBearer": {
        "type": "oauth2",
        "flows": {
          "password": {
            "tokenUrl": "/token",
            "scopes": {}
          }
        }
      }
    }
  }
}
\`\`\`

### 4.2 Swagger UI 的 Authorize 按钮

当 OpenAPI 文档中存在安全方案时，Swagger UI 会显示一个 "Authorize" 按钮（右上角的锁图标）。点击后弹出表单：

\`\`\`text
┌──────────────────────────────────┐
│  Available authorizations        │
├──────────────────────────────────┤
│  OAuth2PasswordBearer            │
│  ┌────────────────────────────┐  │
│  │ Username:                  │  │
│  │ Password:                  │  │
│  │ Client ID (optional):      │  │
│  │ Client Secret (optional):  │  │
│  └────────────────────────────┘  │
│  [ Authorize ]                   │
└──────────────────────────────────┘
\`\`\`

输入后点击 Authorize，Swagger UI 会：
1. 向 \`tokenUrl\` POST 表单（\`username\` + \`password\`）
2. 拿到 \`access_token\`
3. 后续所有标记了该安全方案的请求自动带上 \`Authorization: Bearer <token>\`

## 五、OAuth2PasswordRequestForm：标准登录表单

### 5.1 为什么用 Form 而不是 JSON

OAuth2 规范要求密码模式的登录请求使用 \`application/x-www-form-urlencoded\` 格式（即 HTML 表单格式），而不是 JSON。这是为了兼容标准 OAuth2 客户端。

\`\`\`text
# OAuth2 标准登录请求格式
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=alice&password=secret&scope=read+write
\`\`\`

### 5.2 OAuth2PasswordRequestForm 的字段

\`\`\`python
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data 包含以下字段：
    print(form_data.username)  # 用户名（必填）
    print(form_data.password)  # 密码（必填）
    print(form_data.scope)     # 权限范围（可选，空格分隔的字符串）
    print(form_data.grant_type)  # 授权类型（可选，应为 "password"）
    print(form_data.client_id)   # 客户端 ID（可选）
    print(form_data.client_secret)  # 客户端密钥（可选）
\`\`\`

### 5.3 scope 字段

\`scope\` 是权限范围，用空格分隔多个权限：

\`\`\`text
scope="read write admin"

会被解析成 ["read", "write", "admin"]
\`\`\`

这允许同一 token 拥有不同粒度的权限。比如只读 token 只能调 GET 接口，管理员 token 能调所有接口。

## 六、完整的 OAuth2 密码流程

### 6.1 服务端代码结构

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 1. 登录接口：验证密码，返回 token
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(401, "Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# 2. 受保护接口：验证 token，返回数据
@app.get("/users/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    user = get_current_user(token)
    return user
\`\`\`

### 6.2 返回格式

登录接口必须返回这个格式（OAuth2 规范要求）：

\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
\`\`\`

前端拿到后，把 token 存起来（localStorage 或 cookie），后续请求带上 \`Authorization: Bearer <access_token>\`。

## 七、本章 demo 目标

用纯 Python 模拟 OAuth2PasswordBearer 的核心逻辑：
1. 模拟从 Authorization 头提取 Bearer token
2. 模拟 auto_error=True 和 False 的不同行为
3. 模拟 OAuth2PasswordRequestForm 的表单解析
4. 模拟完整的登录 → 拿 token → 用 token 访问流程

## 八、本章小结

- **OAuth2PasswordBearer 专注密码模式**，适合第一方应用（前后端都是自己的）。
- **tokenUrl 只影响文档**，告诉 Swagger UI 登录接口在哪，不会自动创建路由。
- **它本身是一个依赖**，从 \`Authorization: Bearer <token>\` 头提取 token。
- **auto_error 控制无 token 时的行为**：True 抛 401，False 返回 None。
- **OAuth2PasswordRequestForm 是标准登录表单**，用 \`application/x-www-form-urlencoded\` 格式。
- **登录返回格式固定**：\`{"access_token": "...", "token_type": "bearer"}\`。
- 下一章我们将实现完整的登录接口。
`,
    code: `"""
第八章 demo：模拟 OAuth2PasswordBearer 的工作原理
目标：用纯 Python 模拟 OAuth2PasswordBearer 的核心逻辑，包括：
  - 从 Authorization 头提取 Bearer token
  - auto_error 参数的行为
  - OAuth2PasswordRequestForm 表单解析
  - 完整的登录 → 拿 token → 用 token 访问流程
注意：这是教学用简化实现，真实 FastAPI 的实现更完整。
"""
import base64
import hashlib
import hmac
import json
import time
import secrets

# ============================================================
# 第一部分：模拟 OAuth2PasswordBearer
# ============================================================

class OAuth2PasswordBearer:
    """
    模拟 FastAPI 的 OAuth2PasswordBearer。
    
    核心功能：作为依赖被调用时，从 Authorization 头提取 Bearer token。
    
    参数：
        tokenUrl: 登录接口的 URL（用于 OpenAPI 文档）
        auto_error: 没 token 时是否自动抛 401 错误
    """

    def __init__(self, tokenUrl: str = "token", auto_error: bool = True):
        # 记录登录接口 URL（仅用于文档展示）
        self.tokenUrl = tokenUrl
        # 控制无 token 时的行为
        self.auto_error = auto_error

    def __call__(self, headers: dict) -> str | None:
        """
        从请求头提取 Bearer token。
        
        参数：
            headers: 模拟的 HTTP 请求头字典
            
        返回：
            token 字符串，或 None（auto_error=False 且无 token 时）
            
        异常：
            HTTPError（auto_error=True 且无 token 时）
        """
        # 从 headers 中获取 Authorization 头
        authorization = headers.get("Authorization", "")

        # 检查是否有 Authorization 头
        if not authorization:
            if self.auto_error:
                # auto_error=True：抛出 401 未授权错误
                raise HTTPError(401, "Not authenticated: 无 Authorization 头")
            else:
                # auto_error=False：返回 None，由调用方处理
                return None

        # 检查格式是否为 "Bearer <token>"
        # OAuth2 规范要求 scheme 必须是 "Bearer"（首字母大写）
        parts = authorization.split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer":
            if self.auto_error:
                raise HTTPError(401, "Not authenticated: Authorization 头格式错误")
            else:
                return None

        # 提取 token 部分
        token = parts[1].strip()
        if not token:
            if self.auto_error:
                raise HTTPError(401, "Not authenticated: token 为空")
            else:
                return None

        # 返回提取到的 token
        return token


class HTTPError(Exception):
    """模拟 HTTP 异常"""
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"HTTP {status_code}: {detail}")

    def __str__(self):
        return f"HTTP {self.status_code}: {self.detail}"


# ============================================================
# 第二部分：模拟 OAuth2PasswordRequestForm
# ============================================================

class OAuth2PasswordRequestForm:
    """
    模拟 FastAPI 的 OAuth2PasswordRequestForm。
    
    OAuth2 规范要求登录请求使用 application/x-www-form-urlencoded 格式。
    这个类负责解析表单数据。
    
    字段：
        username: 用户名（必填）
        password: 密码（必填）
        scope: 权限范围（可选，空格分隔的字符串）
        grant_type: 授权类型（可选，应为 "password"）
        client_id: 客户端 ID（可选）
        client_secret: 客户端密钥（可选）
    """

    def __init__(self, form_data: dict):
        # 用户名（必填）
        self.username = form_data.get("username", "")
        # 密码（必填）
        self.password = form_data.get("password", "")
        # scope 是空格分隔的字符串，解析成列表
        scope_str = form_data.get("scope", "")
        self.scopes = scope_str.split() if scope_str else []
        # 授权类型
        self.grant_type = form_data.get("grant_type", None)
        # 客户端凭证
        self.client_id = form_data.get("client_id", None)
        self.client_secret = form_data.get("client_secret", None)

    def __repr__(self):
        return (
            f"OAuth2PasswordRequestForm(username={self.username!r}, "
            f"password={'***'!r}, scopes={self.scopes!r}, "
            f"grant_type={self.grant_type!r})"
        )


# ============================================================
# 第三部分：模拟 JWT 工具（简化版）
# ============================================================

SECRET_KEY = "my-secret-key-for-demo-only-not-secure"
ALGORITHM = "HS256"


def create_access_token(data: dict, expires_in: int = 300) -> str:
    """
    创建简化的 JWT token（仅用于教学）。
    真实 JWT 使用 base64url 编码 header.payload.signature。
    
    参数：
        data: 要编码到 token 中的数据（如 {"sub": "alice"}）
        expires_in: 过期时间（秒）
    """
    # 构造 payload
    payload = {
        **data,
        "exp": time.time() + expires_in,  # 过期时间戳
        "iat": time.time(),                # 签发时间戳
    }
    # 把 payload 编码成 JSON 字符串
    payload_json = json.dumps(payload, sort_keys=True)
    # 用 HMAC-SHA256 签名
    signature = hmac.new(
        SECRET_KEY.encode(),
        payload_json.encode(),
        hashlib.sha256,
    ).hexdigest()
    # 组合成 "payload.signature" 格式
    # 真实 JWT 用 base64url，这里用 hex 简化
    token = f"{payload_json}.{signature}"
    return token


def decode_token(token: str) -> dict:
    """
    解码并验证 JWT token。
    验证签名是否正确、是否过期。
    """
    try:
        # 分离 payload 和 signature
        parts = token.rsplit(".", 1)
        if len(parts) != 2:
            raise ValueError("token 格式错误")
        payload_json, signature = parts

        # 验证签名
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            payload_json.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("签名验证失败")

        # 解析 payload
        payload = json.loads(payload_json)

        # 检查是否过期
        if time.time() > payload.get("exp", 0):
            raise ValueError("token 已过期")

        return payload
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"token 无效: {e}")


# ============================================================
# 第四部分：模拟用户数据库和认证逻辑
# ============================================================

# 模拟数据库（用户名 → 用户信息）
fake_users_db = {
    "alice": {
        "username": "alice",
        "password_hash": create_access_token({"pw": "alice_pass"}),  # 简化：用 token 模拟哈希
        "raw_password": "alice_pass",  # 教学用，实际不会存明文
        "full_name": "Alice Wang",
        "role": "admin",
    },
    "bob": {
        "username": "bob",
        "password_hash": create_access_token({"pw": "bob_pass"}),
        "raw_password": "bob_pass",
        "full_name": "Bob Li",
        "role": "user",
    },
}


def authenticate_user(username: str, password: str) -> dict | None:
    """
    验证用户名和密码。
    返回用户字典（成功）或 None（失败）。
    """
    user = fake_users_db.get(username)
    if not user:
        return None
    if user["raw_password"] != password:  # 教学用，实际用 pwd_context.verify
        return None
    return user


def get_current_user(token: str) -> dict:
    """
    从 token 解析当前用户。
    """
    payload = decode_token(token)
    username = payload.get("sub")
    if not username or username not in fake_users_db:
        raise HTTPError(401, "用户不存在")
    return fake_users_db[username]


# ============================================================
# 第五部分：模拟路由处理函数
# ============================================================

# 创建 OAuth2PasswordBearer 实例
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=True)
# 创建一个 auto_error=False 的实例（用于可选认证场景）
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def login_route(form_data: OAuth2PasswordRequestForm) -> dict:
    """
    模拟 POST /token 登录路由。
    接收表单，验证用户，返回 token。
    """
    print(f"  [登录路由] 收到表单: username={form_data.username}")

    # 验证用户
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        print(f"  [登录路由] 用户名或密码错误")
        raise HTTPError(401, "Incorrect username or password")

    # 生成 token
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_in=300,  # 5 分钟过期
    )
    print(f"  [登录路由] 登录成功，生成 token")

    # OAuth2 标准返回格式
    return {"access_token": access_token, "token_type": "bearer"}


def users_me_route(headers: dict) -> dict:
    """
    模拟 GET /users/me 路由。
    需要 Bearer token 认证。
    """
    # oauth2_scheme 自动从 headers 提取 token
    token = oauth2_scheme(headers)
    print(f"  [用户路由] 提取到 token: {token[:40]}...")

    # 用 token 获取当前用户
    user = get_current_user(token)
    print(f"  [用户路由] 当前用户: {user['username']}")

    return {"username": user["username"], "full_name": user["full_name"], "role": user["role"]}


def optional_auth_route(headers: dict) -> dict:
    """
    模拟可选认证路由（auto_error=False）。
    有 token 返回个性化内容，无 token 返回公开内容。
    """
    # auto_error=False，无 token 返回 None 而不是抛异常
    token = oauth2_scheme_optional(headers)

    if token:
        user = get_current_user(token)
        return {"msg": f"欢迎回来，{user['full_name']}!", "personalized": True}
    else:
        return {"msg": "游客模式，登录后查看更多内容", "personalized": False}


# ============================================================
# 第六部分：运行演示
# ============================================================

if __name__ == "__main__":
    print("#" * 60)
    print("# OAuth2PasswordBearer 工作原理演示")
    print("#" * 60)

    # ----- 演示 1：完整登录流程 -----
    print("\\n\\n" + "=" * 60)
    print("演示 1：完整登录流程（登录 → 拿 token → 用 token 访问）")
    print("=" * 60)

    # 第 1 步：用户提交登录表单
    print("\\n第 1 步：用户提交登录表单")
    login_form = OAuth2PasswordRequestForm({
        "username": "alice",
        "password": "alice_pass",
        "scope": "read write",
    })
    print(f"  表单内容: {login_form}")

    # 第 2 步：调用登录路由
    print("\\n第 2 步：调用登录路由")
    token_response = login_route(login_form)
    access_token = token_response["access_token"]
    print(f"  返回: {token_response}")
    print(f"  token_type: {token_response['token_type']}")

    # 第 3 步：用 token 访问受保护接口
    print("\\n第 3 步：用 token 访问 /users/me")
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    user_info = users_me_route(auth_headers)
    print(f"  返回: {user_info}")

    # ----- 演示 2：密码错误的情况 -----
    print("\\n\\n" + "=" * 60)
    print("演示 2：密码错误 → 401")
    print("=" * 60)

    bad_form = OAuth2PasswordRequestForm({
        "username": "alice",
        "password": "wrong_password",
    })
    try:
        login_route(bad_form)
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 3：无 token 访问受保护接口 -----
    print("\\n\\n" + "=" * 60)
    print("演示 3：无 token 访问（auto_error=True）→ 401")
    print("=" * 60)

    try:
        # 没有 Authorization 头
        users_me_route({})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 4：token 格式错误 -----
    print("\\n\\n" + "=" * 60)
    print("演示 4：Authorization 头格式错误 → 401")
    print("=" * 60)

    try:
        # 格式不是 "Bearer xxx"
        users_me_route({"Authorization": "Basic abc123"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    try:
        # 缺少 token 部分
        users_me_route({"Authorization": "Bearer"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 5：auto_error=False 的可选认证 -----
    print("\\n\\n" + "=" * 60)
    print("演示 5：auto_error=False 的可选认证")
    print("=" * 60)

    # 有 token 的情况
    print("\\n情况 A：有 token")
    result = optional_auth_route({"Authorization": f"Bearer {access_token}"})
    print(f"  返回: {result}")

    # 无 token 的情况
    print("\\n情况 B：无 token（不报错，返回公开内容）")
    result = optional_auth_route({})
    print(f"  返回: {result}")

    # ----- 演示 6：token 过期 -----
    print("\\n\\n" + "=" * 60)
    print("演示 6：token 过期 → 401")
    print("=" * 60)

    # 创建一个已过期的 token（过期时间设为负数）
    expired_token = create_access_token(
        data={"sub": "alice", "role": "admin"},
        expires_in=-1,  # 已过期
    )
    try:
        users_me_route({"Authorization": f"Bearer {expired_token}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")
    except ValueError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 7：伪造 token（签名错误）-----
    print("\\n\\n" + "=" * 60)
    print("演示 7：伪造 token（签名错误）→ 401")
    print("=" * 60)

    fake_token = create_access_token({"sub": "alice"}) + "tampered"
    try:
        users_me_route({"Authorization": f"Bearer {fake_token}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")
    except ValueError as e:
        print(f"  捕获异常: {e}")

    # ----- 总结 -----
    print("\\n\\n" + "=" * 60)
    print("本章核心要点总结")
    print("=" * 60)
    print("1. OAuth2PasswordBearer 专注密码模式，适合第一方应用")
    print("2. tokenUrl 只影响文档，不会自动创建路由")
    print("3. 作为依赖时，从 Authorization: Bearer <token> 提取 token")
    print("4. auto_error=True 无 token 抛 401，False 返回 None")
    print("5. OAuth2PasswordRequestForm 解析标准登录表单")
    print("6. 登录返回 {access_token, token_type: 'bearer'}")
    print("7. 前端拿到 token 后，后续请求带 Authorization 头")
    print("=" * 60)
`,
  },

  // =========================================================
  // 第九章：登录接口实现：从表单到 Token
  // =========================================================
  {
    id: "fa-login-endpoint",
    group: "第三部分 FastAPI 认证机制",
    icon: "📝",
    title: "登录接口实现：从表单到 Token",
    content: `# 登录接口实现：从表单到 Token

登录接口是认证系统的"入口"。用户在这里交出凭证（用户名密码），换取一张"通行证"（access token）。这个接口看起来简单，但每一行代码都关乎安全。本章将逐行实现一个完整的登录接口，并解释每个设计决策背后的"为什么"。

## 一、登录接口的完整流程

### 1.1 流程总览

\`\`\`text
客户端                    服务端                      数据库
  │                         │                           │
  │ 1. POST /token          │                           │
  │ username=alice          │                           │
  │ password=***            │                           │
  ├────────────────────────>│                           │
  │                         │ 2. 查询用户               │
  │                         ├──────────────────────────>│
  │                         │ 3. 返回用户记录（含哈希） │
  │                         │<──────────────────────────┤
  │                         │ 4. 验证密码哈希           │
  │                         │   verify(明文, 哈希)      │
  │                         │ 5. 生成 JWT token         │
  │ 6. 返回 token           │                           │
  │ {access_token,          │                           │
  │  token_type:"bearer"}   │                           │
  │<────────────────────────┤                           │
  │                         │                           │
\`\`\`

### 1.2 五个关键步骤详解

**第 1 步：接收表单**

OAuth2 规范要求密码模式的登录请求必须是 \`application/x-www-form-urlencoded\` 格式。这不是 FastAPI 的选择，而是 OAuth2 标准。为什么不用 JSON？因为 OAuth2 设计于 2012 年，当时表单格式更通用，且表单格式可以被浏览器原生表单提交，无需 JavaScript。

**第 2 步：查询用户**

用 username 从数据库查询用户记录。如果用户不存在，不应该立即返回"用户不存在"，而应返回"用户名或密码错误"——避免攻击者通过错误信息枚举有效用户名。

**第 3 步：验证密码**

用 \`pwd_context.verify(plain_password, hashed_password)\` 验证密码。这个函数内部会从哈希中提取盐和参数，重新哈希明文，做常数时间比较。

**第 4 步：生成 Token**

验证通过后，生成 JWT token。token 的 payload 通常包含：
- \`sub\`（subject）：用户标识（用户名或 user_id）
- \`exp\`（expiration）：过期时间
- \`iat\`（issued at）：签发时间
- 可选的 \`role\`、\`scope\` 等权限信息

**第 5 步：返回标准格式**

OAuth2 规范要求返回 \`{"access_token": "...", "token_type": "bearer"}\`。前端拿到后，后续请求带上 \`Authorization: Bearer <token>\`。

## 二、OAuth2PasswordRequestForm 的字段详解

### 2.1 必填字段

\`\`\`python
class OAuth2PasswordRequestForm:
    username: str   # 必填，用户名
    password: str   # 必填，明文密码
\`\`\`

\`username\` 和 \`password\` 是必填的。FastAPI 会自动从表单中提取。

### 2.2 可选字段

\`\`\`python
class OAuth2PasswordRequestForm:
    scope: str          # 可选，权限范围，空格分隔
    grant_type: str     # 可选，应为 "password"
    client_id: str      # 可选，客户端 ID
    client_secret: str  # 可选，客户端密钥
\`\`\`

**scope**：权限范围。比如 \`scope="read write"\` 表示申请读取和写入权限。服务端可以验证用户是否有这些权限，并据此生成限定权限的 token。

**grant_type**：OAuth2 规范要求客户端在请求中指明授权类型。对于密码模式，应为 \`"password"\`。OAuth2 规范建议服务端校验此字段，但实际中常省略。

**client_id / client_secret**：用于标识和验证客户端应用。在第一方应用中通常不使用，在第三方应用场景中用于验证调用方身份。

### 2.3 表单请求示例

\`\`\`text
POST /token HTTP/1.1
Host: api.example.com
Content-Type: application/x-www-form-urlencoded

username=alice&password=secret123&scope=read+write&grant_type=password
\`\`\`

## 三、用户查询与密码验证

### 3.1 查询用户的最佳实践

\`\`\`python
def get_user(db, username: str):
    """从数据库查询用户"""
    user = db.query(User).filter(User.username == username).first()
    return user
\`\`\`

注意：即使用户不存在，也不要立即返回错误。先查用户，再验证密码——这两个步骤的错误信息应该一致（"用户名或密码错误"），防止枚举攻击。

### 3.2 验证密码

\`\`\`python
def authenticate_user(db, username: str, password: str):
    """验证用户名和密码"""
    # 第 1 步：查用户
    user = get_user(db, username)
    # 用户不存在 → 返回 False（不是 None，保持接口一致）
    if not user:
        return False
    # 第 2 步：验证密码
    # pwd_context.verify 内部会做常数时间比较，防止计时攻击
    if not pwd_context.verify(password, user.hashed_password):
        return False
    # 验证通过，返回用户对象
    return user
\`\`\`

### 3.3 为什么要"统一错误信息"

\`\`\`text
错误做法：
  用户不存在 → 返回 "用户不存在"
  密码错误   → 返回 "密码错误"

攻击者可以：
  1. 批量尝试用户名，根据错误信息判断哪些用户名有效
  2. 对有效用户名再暴力破解密码

正确做法：
  无论用户不存在还是密码错误，都返回 "用户名或密码错误"
\`\`\`

**生活类比**：这就像门卫查证件。如果你说"没有这个人"，小偷就知道这个房间没人；如果你说"证件不对"，小偷就知道这个房间有人但需要伪造证件。正确的做法是统一说"请走开"——不透露任何信息。

## 四、Token 的生成与返回格式

### 4.1 JWT Token 结构

\`\`\`text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsImV4cCI6MTcw...
  │                                  │
  └── Header（base64 编码的 JSON）    └── Payload（base64 编码的 JSON）
                                           {
                                             "sub": "alice",
                                             "exp": 1700000000,
                                             "iat": 1699999700,
                                             "role": "admin"
                                           }

最后还有一段 signature（签名），用 SECRET_KEY 对 header.payload 做 HMAC
\`\`\`

### 4.2 创建 Token

\`\`\`python
from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY = "your-secret-key"  # 生产环境从环境变量读取
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """生成 JWT access token"""
    # 复制 data，避免修改原始字典
    to_encode = data.copy()
    # 设置过期时间
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # 把过期时间加入 payload
    to_encode.update({"exp": expire})
    # 编码成 JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
\`\`\`

### 4.3 data 参数放什么

\`\`\`python
# 最少需要 "sub"（subject），通常是用户名或 user_id
token = create_access_token(data={"sub": username})

# 可以加更多自定义字段
token = create_access_token(data={
    "sub": username,
    "role": "admin",
    "scopes": ["read", "write"],
})
\`\`\`

**注意**：不要在 token 里放敏感信息（如密码、手机号）。JWT 的 payload 只是 base64 编码，不是加密，任何人都能解码看到内容。

### 4.4 返回格式

\`\`\`python
# OAuth2 标准返回格式
return {
    "access_token": access_token,
    "token_type": "bearer",
}
\`\`\`

\`token_type\` 必须是 \`"bearer"\`（小写），告诉客户端用 Bearer 方案携带 token。

## 五、错误处理：401 Invalid credentials

### 5.1 标准错误响应

\`\`\`python
from fastapi import HTTPException, status

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        # 401 未授权 + WWW-Authenticate 头（OAuth2 规范要求）
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    ...
\`\`\`

### 5.2 为什么 401 要带 WWW-Authenticate 头

HTTP 401 响应规范要求返回 \`WWW-Authenticate\` 头，告诉客户端"用什么认证方案"。对于 Bearer token：

\`\`\`text
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer

{"detail": "用户名或密码错误"}
\`\`\`

### 5.3 错误信息的安全考量

\`\`\`text
✅ 正确：detail = "用户名或密码错误"
❌ 错误：detail = "用户不存在"
❌ 错误：detail = "密码错误"
❌ 错误：detail = f"用户 {username} 不存在"
\`\`\`

统一的错误信息不暴露任何额外信息，攻击者无法区分"用户不存在"和"密码错误"。

## 六、完整代码结构

### 6.1 文件组织

\`\`\`text
app/
├── main.py              # FastAPI 应用入口
├── auth.py              # 认证逻辑（authenticate_user, create_access_token）
├── database.py          # 数据库连接
├── models.py            # 数据库模型（User 表）
├── schemas.py           # Pydantic 模型（Token, UserOut）
└── config.py            # 配置（SECRET_KEY, ALGORITHM 等）
\`\`\`

### 6.2 完整登录接口

\`\`\`python
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 密码模式登录接口"""
    # 1. 验证用户
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 2. 生成 token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )
    # 3. 返回标准格式
    return {"access_token": access_token, "token_type": "bearer"}
\`\`\`

## 七、常见问题与最佳实践

### 7.1 token 过期时间设多长

\`\`\`text
┌────────────────┬──────────────────────────────┐
│ 过期时间       │ 适用场景                     │
├────────────────┼──────────────────────────────┤
│ 15-30 分钟     │ 高安全应用（银行、支付）     │
│ 1-2 小时       │ 一般 Web 应用                │
│ 7-30 天        │ 移动端 App（配合 refresh）   │
│ 永不过期       │ 禁止！token 泄露无法挽回     │
└────────────────┴──────────────────────────────┘
\`\`\`

### 7.2 Refresh Token 机制

access_token 过期后，用户需要重新登录。为了改善体验，引入 refresh_token：

\`\`\`text
1. 登录时返回 access_token（短效，30分钟）+ refresh_token（长效，7天）
2. access_token 过期后，前端用 refresh_token 请求新的 access_token
3. refresh_token 过期后，用户需要重新登录
\`\`\`

这就像酒店的"房卡"和"入住凭证"：房卡（access_token）很快失效，但用入住凭证（refresh_token）可以重新办房卡，不用重新登记入住。

### 7.3 密码强度校验

\`\`\`python
def validate_password(password: str) -> bool:
    """密码强度校验"""
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.islower() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    return True
\`\`\`

## 八、本章 demo 目标

用纯 Python 实现完整的登录接口逻辑：
1. 模拟 OAuth2PasswordRequestForm 表单接收
2. 模拟用户数据库查询
3. 模拟密码哈希验证
4. 生成 JWT token
5. 返回标准 OAuth2 格式
6. 演示各种错误场景（用户不存在、密码错误、用户禁用等）

## 九、本章小结

- **登录接口五步走**：接表单 → 查用户 → 验密码 → 生成 token → 返回标准格式。
- **OAuth2PasswordRequestForm** 是标准登录表单，用 \`application/x-www-form-urlencoded\` 格式。
- **错误信息要统一**："用户名或密码错误"，不透露用户是否存在。
- **401 要带 WWW-Authenticate 头**，这是 HTTP 规范。
- **token 不要放敏感信息**，JWT payload 是 base64 编码不是加密。
- **token 要有过期时间**，永不过期的 token 是安全灾难。
- 下一章我们将实现 get_current_user，用 token 换回用户身份。
`,
    code: `"""
第九章 demo：登录接口实现（从表单到 Token）
目标：用纯 Python 实现完整的登录接口逻辑，包括：
  - 表单接收（OAuth2PasswordRequestForm）
  - 用户数据库查询
  - 密码哈希验证
  - JWT token 生成
  - 标准返回格式
  - 各种错误场景处理
注意：不依赖 FastAPI 运行，用纯 Python 模拟全流程。
"""
import hashlib
import hmac
import json
import time
from datetime import datetime, timezone, timedelta

# ============================================================
# 第一部分：配置
# ============================================================

# JWT 密钥（生产环境从环境变量读取，绝不硬编码）
SECRET_KEY = "demo-secret-key-not-for-production-2024"
# JWT 签名算法
ALGORITHM = "HS256"
# access_token 过期时间（秒）
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# ============================================================
# 第二部分：密码哈希工具（简化版 PBKDF2）
# ============================================================

import os

def hash_password(password: str) -> str:
    """
    哈希密码（PBKDF2-HMAC-SHA256）。
    返回格式：iterations$salt_hex$hash_hex
    生产环境用 passlib + bcrypt/argon2。
    """
    salt = os.urandom(16)  # 16 字节随机盐
    iterations = 100000
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
        dklen=32,
    )
    return f"{iterations}\${salt.hex()}\${dk.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """验证密码（常数时间比较，防计时攻击）"""
    try:
        parts = stored_hash.split("\$")
        if len(parts) != 3:
            return False
        iterations = int(parts[0])
        salt = bytes.fromhex(parts[1])
        original_dk = bytes.fromhex(parts[2])
        new_dk = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations,
            dklen=32,
        )
        return hmac.compare_digest(new_dk, original_dk)
    except Exception:
        return False


# ============================================================
# 第三部分：JWT 工具（简化版）
# ============================================================

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    生成 JWT access token。
    
    参数：
        data: 要编码的数据（如 {"sub": "alice"}）
        expires_delta: 过期时间增量，None 则用默认值
    
    返回：
        JWT token 字符串（格式：base64(payload).signature）
    """
    # 复制 data，避免修改原始字典
    to_encode = data.copy()
    
    # 计算过期时间
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 加入标准声明（claims）
    to_encode["exp"] = expire.timestamp()  # 过期时间
    to_encode["iat"] = datetime.now(timezone.utc).timestamp()  # 签发时间
    
    # 把 payload 编码成 JSON 字符串
    payload_json = json.dumps(to_encode, sort_keys=True)
    
    # 用 HMAC-SHA256 签名
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_json.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    
    # 组合成 token（真实 JWT 用 base64url，这里简化用 hex）
    token = f"{payload_json}.{signature}"
    return token


def decode_token(token: str) -> dict:
    """
    解码并验证 JWT token。
    验证签名和过期时间。
    """
    try:
        # 分离 payload 和 signature
        parts = token.rsplit(".", 1)
        if len(parts) != 2:
            raise ValueError("token 格式错误")
        payload_json, signature = parts
        
        # 验证签名
        expected_sig = hmac.new(
            SECRET_KEY.encode("utf-8"),
            payload_json.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("签名验证失败")
        
        # 解析 payload
        payload = json.loads(payload_json)
        
        # 检查是否过期
        if time.time() > payload.get("exp", 0):
            raise ValueError("token 已过期")
        
        return payload
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"token 无效: {e}")


# ============================================================
# 第四部分：模拟用户数据库
# ============================================================

# 预先哈希密码（模拟数据库中存储的哈希）
fake_users_db = {
    "alice": {
        "username": "alice",
        "full_name": "Alice Wang",
        "email": "alice@example.com",
        "hashed_password": hash_password("AlicePass2024!"),
        "role": "admin",
        "disabled": False,
    },
    "bob": {
        "username": "bob",
        "full_name": "Bob Li",
        "email": "bob@example.com",
        "hashed_password": hash_password("BobPass2024!"),
        "role": "user",
        "disabled": False,
    },
    "charlie": {
        "username": "charlie",
        "full_name": "Charlie Zhang",
        "email": "charlie@example.com",
        "hashed_password": hash_password("CharliePass2024!"),
        "role": "user",
        "disabled": True,  # 账户被禁用
    },
}


# ============================================================
# 第五部分：模拟 OAuth2PasswordRequestForm
# ============================================================

class OAuth2PasswordRequestForm:
    """
    模拟 FastAPI 的 OAuth2PasswordRequestForm。
    解析 application/x-www-form-urlencoded 格式的登录表单。
    """
    def __init__(self, form_data: dict):
        # 用户名（必填）
        self.username = form_data.get("username", "")
        # 密码（必填）
        self.password = form_data.get("password", "")
        # scope 是空格分隔的字符串，解析成列表
        scope_str = form_data.get("scope", "")
        self.scopes = scope_str.split() if scope_str else []
        # 授权类型
        self.grant_type = form_data.get("grant_type", None)
        # 客户端凭证
        self.client_id = form_data.get("client_id", None)
        self.client_secret = form_data.get("client_secret", None)

    def __repr__(self):
        return (
            f"OAuth2PasswordRequestForm("
            f"username={self.username!r}, "
            f"password={'***'!r}, "
            f"scopes={self.scopes!r})"
        )


# ============================================================
# 第六部分：认证逻辑
# ============================================================

class HTTPError(Exception):
    """模拟 HTTP 异常"""
    def __init__(self, status_code: int, detail: str, headers: dict = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers or {}
        super().__init__(f"HTTP {status_code}: {detail}")


def get_user(username: str) -> dict | None:
    """从数据库查询用户"""
    return fake_users_db.get(username)


def authenticate_user(username: str, password: str) -> dict | None:
    """
    验证用户名和密码。
    返回用户字典（成功）或 None（失败）。
    
    安全要点：
    1. 用户不存在 → 返回 None
    2. 密码错误 → 返回 None
    3. 两种情况对外都返回"用户名或密码错误"，不透露用户是否存在
    """
    # 第 1 步：查询用户
    user = get_user(username)
    if not user:
        # 用户不存在，返回 None
        # 注意：这里不立即返回错误，保持和密码错误一致的响应
        return None
    
    # 第 2 步：验证密码
    # verify_password 内部做常数时间比较，防止计时攻击
    if not verify_password(password, user["hashed_password"]):
        return None
    
    # 验证通过，返回用户
    return user


def login_for_access_token(form_data: OAuth2PasswordRequestForm) -> dict:
    """
    登录接口的核心逻辑。
    完整流程：表单接收 → 查用户 → 验密码 → 生成 Token → 返回
    
    参数：
        form_data: OAuth2PasswordRequestForm 实例
    
    返回：
        {"access_token": "...", "token_type": "bearer"}
    
    异常：
        HTTPError(401): 用户名或密码错误
        HTTPError(400): 账户被禁用
    """
    print(f"  [登录] 收到登录请求: username={form_data.username}")
    
    # 第 1 步：验证用户凭证
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        # 用户名或密码错误
        # 安全要点：不区分"用户不存在"和"密码错误"
        print(f"  [登录] 验证失败: 用户名或密码错误")
        raise HTTPError(
            status_code=401,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},  # OAuth2 规范要求
        )
    
    print(f"  [登录] 密码验证通过")
    
    # 第 2 步：检查账户是否被禁用
    if user.get("disabled", False):
        print(f"  [登录] 账户已被禁用")
        raise HTTPError(
            status_code=400,
            detail="账户已被禁用，请联系管理员",
        )
    
    # 第 3 步：生成 access_token
    # token 的 payload 包含：
    #   sub: 用户标识（用户名）
    #   role: 用户角色（可选，用于权限校验）
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["username"],   # subject：用户标识
            "role": user["role"],       # 自定义声明：角色
            "full_name": user["full_name"],  # 自定义声明：姓名
        },
        expires_delta=access_token_expires,
    )
    
    print(f"  [登录] token 生成成功，有效期 {ACCESS_TOKEN_EXPIRE_MINUTES} 分钟")
    
    # 第 4 步：返回标准 OAuth2 格式
    # 必须包含 access_token 和 token_type
    return {
        "access_token": access_token,
        "token_type": "bearer",  # 必须是小写 "bearer"
    }


# ============================================================
# 第七部分：运行演示
# ============================================================

if __name__ == "__main__":
    print("#" * 60)
    print("# 登录接口实现演示（从表单到 Token）")
    print("#" * 60)

    # ----- 演示 1：正常登录 -----
    print("\\n\\n" + "=" * 60)
    print("演示 1：正常登录（alice / AlicePass2024!）")
    print("=" * 60)

    # 模拟前端提交的表单
    form = OAuth2PasswordRequestForm({
        "username": "alice",
        "password": "AlicePass2024!",
        "scope": "read write",
    })
    print(f"  表单内容: {form}")

    # 调用登录接口
    try:
        result = login_for_access_token(form)
        print(f"\\n  登录成功！返回结果:")
        print(f"    access_token: {result['access_token'][:60]}...")
        print(f"    token_type: {result['token_type']}")
        
        # 验证返回的 token 可以被正确解码
        print(f"\\n  解码 token 验证:")
        payload = decode_token(result["access_token"])
        print(f"    payload: {payload}")
        # 解码 token 获取 payload
        saved_token = result["access_token"]
    except HTTPError as e:
        print(f"  登录失败: {e}")

    # ----- 演示 2：密码错误 -----
    print("\\n\\n" + "=" * 60)
    print("演示 2：密码错误")
    print("=" * 60)

    form = OAuth2PasswordRequestForm({
        "username": "alice",
        "password": "wrongpassword",
    })
    try:
        login_for_access_token(form)
    except HTTPError as e:
        print(f"  捕获异常: {e}")
        print(f"  响应头: {e.headers}")

    # ----- 演示 3：用户不存在 -----
    print("\\n\\n" + "=" * 60)
    print("演示 3：用户不存在（注意错误信息和密码错误一致）")
    print("=" * 60)

    form = OAuth2PasswordRequestForm({
        "username": "ghost",
        "password": "whatever",
    })
    try:
        login_for_access_token(form)
    except HTTPError as e:
        print(f"  捕获异常: {e}")
        print(f"  ← 错误信息与密码错误一致，防止枚举用户名")

    # ----- 演示 4：账户被禁用 -----
    print("\\n\\n" + "=" * 60)
    print("演示 4：账户被禁用（charlie）")
    print("=" * 60)

    form = OAuth2PasswordRequestForm({
        "username": "charlie",
        "password": "CharliePass2024!",
    })
    try:
        login_for_access_token(form)
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 5：用 token 访问受保护资源 -----
    print("\\n\\n" + "=" * 60)
    print("演示 5：用获取到的 token 访问受保护资源")
    print("=" * 60)

    # 用演示 1 中保存的 token
    print(f"  使用 token: {saved_token[:50]}...")
    try:
        payload = decode_token(saved_token)
        print(f"  token 解码成功:")
        print(f"    用户: {payload['sub']}")
        print(f"    角色: {payload['role']}")
        print(f"    姓名: {payload['full_name']}")
        print(f"    过期时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(payload['exp']))}")
    except ValueError as e:
        print(f"  token 验证失败: {e}")

    # ----- 演示 6：token 过期场景 -----
    print("\\n\\n" + "=" * 60)
    print("演示 6：token 过期场景（生成一个已过期的 token）")
    print("=" * 60)

    expired_token = create_access_token(
        data={"sub": "alice", "role": "admin"},
        expires_delta=timedelta(seconds=-1),  # 已过期
    )
    print(f"  过期 token: {expired_token[:50]}...")
    try:
        decode_token(expired_token)
    except ValueError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 7：伪造 token -----
    print("\\n\\n" + "=" * 60)
    print("演示 7：伪造 token（签名被篡改）")
    print("=" * 60)

    # 篡改 token 的签名部分
    tampered_token = saved_token[:-5] + "XXXXX"
    print(f"  篡改 token: {tampered_token[:50]}...")
    try:
        decode_token(tampered_token)
    except ValueError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 8：bob 登录 -----
    print("\\n\\n" + "=" * 60)
    print("演示 8：另一个用户登录（bob）")
    print("=" * 60)

    form = OAuth2PasswordRequestForm({
        "username": "bob",
        "password": "BobPass2024!",
    })
    try:
        result = login_for_access_token(form)
        print(f"  登录成功！")
        payload = decode_token(result["access_token"])
        print(f"  用户: {payload['sub']}, 角色: {payload['role']}")
    except HTTPError as e:
        print(f"  登录失败: {e}")

    # ----- 总结 -----
    print("\\n\\n" + "=" * 60)
    print("本章核心要点总结")
    print("=" * 60)
    print("1. 登录五步走：接表单→查用户→验密码→生成token→返回")
    print("2. OAuth2PasswordRequestForm 解析标准表单格式")
    print("3. 错误信息统一为'用户名或密码错误'，防枚举攻击")
    print("4. 401 响应必须带 WWW-Authenticate: Bearer 头")
    print("5. token payload 不要放敏感信息（只 base64 编码，非加密）")
    print("6. token 必须有过期时间，永不过期是安全灾难")
    print("7. 账户禁用检查应在密码验证之后")
    print("=" * 60)
`,
  },

  // =========================================================
  // 第十章：get_current_user 实现原理
  // =========================================================
  {
    id: "fa-get-current-user",
    group: "第三部分 FastAPI 认证机制",
    icon: "👤",
    title: "get_current_user 实现原理",
    content: `# get_current_user 实现原理

\`get_current_user\` 是 FastAPI 认证系统中最核心的依赖函数。它就像大厦门口的"身份证查验岗"——每个需要身份认证的接口都要经过它。它接收一个 token 字符串，返回一个用户对象；如果任何环节出错，就抛出 401 异常。本章将逐行剖析它的实现，并演示各种异常场景的处理。

## 一、get_current_user 的职责：Token → 用户

### 1.1 它是连接"登录"和"鉴权"的桥梁

\`\`\`text
登录阶段：用户名密码 → token
             ↑
        login_for_access_token

鉴权阶段：token → 用户对象 → 业务逻辑
             ↑
        get_current_user
\`\`\`

\`get_current_user\` 的输入是 token 字符串（来自 \`oauth2_scheme\`），输出是用户对象（来自数据库）。如果中间任何一步失败（token 无效、过期、用户不存在），它抛出 401 异常，请求被拒绝。

### 1.2 为什么不直接在路由里写认证逻辑

\`\`\`python
# ❌ 错误做法：每个路由都写一遍认证
@app.get("/users/me")
def read_users_me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY)
    user = db.get_user(payload["sub"])
    if not user:
        raise HTTPException(401)
    return user

@app.get("/items/")
def list_items(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")  # 重复！
    payload = jwt.decode(token, SECRET_KEY)       # 重复！
    user = db.get_user(payload["sub"])             # 重复！
    if not user:
        raise HTTPException(401)                   # 重复！
    return db.get_items(user)

# ✅ 正确做法：封装成依赖
@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/items/")
def list_items(current_user: User = Depends(get_current_user)):
    return db.get_items(current_user)
\`\`\`

**生活类比**：这就像大厦的门禁系统。如果每个房间都自己设一个保安查身份证，那得多浪费？正确的做法是大厦入口设一个统一的身份证查验岗（\`get_current_user\`），通过后发一个访客牌（用户对象），各房间只看访客牌就行。

## 二、三步走：提取 Token → 解码 Token → 查询用户

### 2.1 第 1 步：提取 Token

\`\`\`python
def get_current_user(token: str = Depends(oauth2_scheme)):
    # token 由 oauth2_scheme 自动从 Authorization 头提取
    # oauth2_scheme 做的事：
    #   1. 从 Authorization: Bearer <token> 提取 token
    #   2. 如果没有 Authorization 头，抛 401
    pass
\`\`\`

\`oauth2_scheme\`（OAuth2PasswordBearer 实例）本身就是一个依赖。\`get_current_user\` 依赖它，形成依赖链的第一环。

### 2.2 第 2 步：解码 Token

\`\`\`python
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 解码 JWT，验证签名和过期时间
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        # 签名错误、格式错误、过期等
        raise credentials_exception
    # 从 payload 提取用户标识（通常是 username 或 user_id）
    username: str = payload.get("sub")
    if username is None:
        # payload 中没有 sub，token 无效
        raise credentials_exception
\`\`\`

\`jwt.decode\` 会验证：
- **签名**：用 SECRET_KEY 重新计算签名，对比是否一致
- **过期**：检查 \`exp\` 字段是否大于当前时间
- **格式**：token 结构是否正确

如果任何一项失败，抛出 \`JWTError\`。

### 2.3 第 3 步：查询用户

\`\`\`python
def get_current_user(token: str = Depends(oauth2_scheme)):
    # ... 解码 token ...
    username = payload.get("sub")
    
    # 用 username 查数据库
    user = get_user(db, username)
    if user is None:
        # token 有效但用户已被删除
        raise credentials_exception
    return user
\`\`\`

为什么要查数据库？token 有效不代表用户仍然有效。可能的情况：
- 用户在 token 有效期内被删除
- 用户被禁用（\`disabled=True\`）
- 用户角色/权限被修改

### 2.4 完整代码

\`\`\`python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 统一的"凭证错误"异常
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

def get_current_user(token: str = Depends(oauth2_scheme)):
    """从 token 解析当前用户"""
    # 第 1 步：解码 token（oauth2_scheme 已提取 token）
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 第 2 步：查询用户
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    
    return user
\`\`\`

## 三、credentials_exception 的统一错误处理

### 3.1 为什么用统一的异常对象

\`\`\`python
# 定义一次，多处复用
credentials_exception = HTTPException(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
\`\`\`

好处：
1. **一致性**：所有认证失败的错误信息相同，不泄露失败原因
2. **可维护**：改一处，处处生效
3. **安全**：不区分"token 过期"、"签名错误"、"用户不存在"，攻击者无法获取信息

### 3.2 各种失败场景的统一响应

\`\`\`text
┌──────────────────────┬─────────────────────────────┐
│ 失败场景             │ 响应                        │
├──────────────────────┼─────────────────────────────┤
│ 无 Authorization 头  │ 401 Could not validate...   │
│ Authorization 格式错 │ 401 Could not validate...   │
│ token 签名错误       │ 401 Could not validate...   │
│ token 过期           │ 401 Could not validate...   │
│ payload 无 sub       │ 401 Could not validate...   │
│ 用户不存在           │ 401 Could not validate...   │
└──────────────────────┴─────────────────────────────┘
\`\`\`

所有场景返回相同的错误信息，攻击者无法区分是哪一步失败的。

### 3.3 为什么要带 WWW-Authenticate 头

\`\`\`python
headers={"WWW-Authenticate": "Bearer"}
\`\`\`

HTTP 401 响应规范要求返回 \`WWW-Authenticate\` 头，告诉客户端：
- 需要认证
- 用什么方案认证（Bearer）

这对 API 客户端和 Swagger UI 都很重要，它们据此知道需要重新获取 token。

## 四、作为依赖在路由中使用

### 4.1 基本用法

\`\`\`python
@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    # current_user 已经是被验证过的用户对象
    # 路由函数只关心业务逻辑
    return current_user

@app.get("/users/me/items/")
def read_own_items(current_user: User = Depends(get_current_user)):
    # 同一个依赖，每个请求独立执行
    items = db.get_items_by_user(current_user.id)
    return items
\`\`\`

### 4.2 依赖的缓存机制

同一个请求内，\`get_current_user\` 只执行一次，结果被缓存：

\`\`\`python
@app.get("/dashboard/")
def dashboard(
    user1: User = Depends(get_current_user),
    user2: User = Depends(get_current_user),  # 复用上面的结果
):
    # user1 和 user2 是同一个对象
    assert user1 is user2  # True
    return {"user": user1}
\`\`\`

## 五、嵌套依赖链：OAuth2PasswordBearer → get_current_user → 路由函数

### 5.1 依赖链全景

\`\`\`text
HTTP 请求（带 Authorization: Bearer <token>）
    │
    ▼
┌─────────────────────┐
│ OAuth2PasswordBearer │  从 Authorization 头提取 token
│ (oauth2_scheme)     │  无 token → 401
└──────────┬──────────┘
           │ token: str
           ▼
┌─────────────────────┐
│ get_current_user    │  解码 token → 查询用户
│                     │  任何步骤失败 → 401
└──────────┬──────────┘
           │ user: User
           ▼
┌─────────────────────┐
│ 路由函数            │  执行业务逻辑
│ (read_users_me)     │  返回响应
└─────────────────────┘
\`\`\`

### 5.2 依赖链的解析过程

\`\`\`python
# FastAPI 看到路由函数有 Depends(get_current_user)
# → 检查 get_current_user 的签名，发现它有 Depends(oauth2_scheme)
# → 检查 oauth2_scheme 的签名，它从请求头提取 token
# → 执行顺序：oauth2_scheme → get_current_user → read_users_me

# 任何一步抛异常，整条链中断，异常变成 HTTP 响应
\`\`\`

### 5.3 更深的依赖链

\`\`\`python
# 依赖 1：提取 token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 依赖 2：获取当前用户
def get_current_user(token: str = Depends(oauth2_scheme)):
    ...

# 依赖 3：获取当前活跃用户（排除被禁用的）
def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(400, "Inactive user")
    return current_user

# 路由：依赖链有 3 层
@app.get("/users/me")
def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    return current_user

# 执行顺序：
# oauth2_scheme → get_current_user → get_current_active_user → read_users_me
\`\`\`

**生活类比**：这就像进入重要设施的层层安检：
1. 第一道岗（oauth2_scheme）：检查有没有门禁卡（token）
2. 第二道岗（get_current_user）：刷卡验证卡是否有效，查身份
3. 第三道岗（get_current_active_user）：检查是否在职/是否有权限进入
4. 最终进入工作区域（路由函数）

## 六、各种异常场景详解

### 6.1 场景 1：无 Authorization 头

\`\`\`text
请求: GET /users/me（无 Authorization 头）

oauth2_scheme 执行：
  → 找不到 Authorization 头
  → auto_error=True，抛出 401

响应:
  HTTP/1.1 401 Unauthorized
  WWW-Authenticate: Bearer
  {"detail": "Not authenticated"}
\`\`\`

### 6.2 场景 2：Authorization 头格式错误

\`\`\`text
请求: GET /users/me
      Authorization: Basic abc123  ← 不是 Bearer

oauth2_scheme 执行：
  → scheme 不是 "Bearer"
  → 抛出 401

响应:
  HTTP/1.1 401 Unauthorized
\`\`\`

### 6.3 场景 3：token 签名错误

\`\`\`text
请求: GET /users/me
      Authorization: Bearer fake.token.here

get_current_user 执行：
  → oauth2_scheme 提取 token: "fake.token.here"
  → jwt.decode 尝试验证签名
  → 签名不匹配，抛出 JWTError
  → 捕获 JWTError，抛出 credentials_exception

响应:
  HTTP/1.1 401 Unauthorized
  {"detail": "Could not validate credentials"}
\`\`\`

### 6.4 场景 4：token 过期

\`\`\`text
请求: GET /users/me
      Authorization: Bearer <expired_token>

get_current_user 执行：
  → jwt.decode 检查 exp 字段
  → exp < 当前时间，抛出 ExpiredSignatureError（JWTError 子类）
  → 捕获，抛出 credentials_exception

响应:
  HTTP/1.1 401 Unauthorized
  {"detail": "Could not validate credentials"}
\`\`\`

### 6.5 场景 5：payload 无 sub 字段

\`\`\`text
请求: GET /users/me
      Authorization: Bearer <token_without_sub>

get_current_user 执行：
  → jwt.decode 成功，但 payload 中没有 "sub"
  → username = None
  → 抛出 credentials_exception

响应:
  HTTP/1.1 401 Unauthorized
\`\`\`

### 6.6 场景 6：用户不存在

\`\`\`text
请求: GET /users/me
      Authorization: Bearer <valid_token_for_deleted_user>

get_current_user 执行：
  → jwt.decode 成功
  → username = "deleted_user"
  → db.get_user("deleted_user") 返回 None
  → 抛出 credentials_exception

响应:
  HTTP/1.1 401 Unauthorized
\`\`\`

### 6.7 场景 7：用户被禁用

\`\`\`text
请求: GET /users/me
      Authorization: Bearer <valid_token_for_disabled_user>

get_current_user 执行：
  → 成功返回用户对象（包括 disabled=True 的用户）
  → get_current_active_user 检查 disabled 字段
  → 抛出 400 "Inactive user"

响应:
  HTTP/1.1 400 Bad Request
  {"detail": "Inactive user"}
\`\`\`

## 七、进阶：权限校验依赖

### 7.1 基于角色的权限控制

\`\`\`python
def require_admin(current_user: User = Depends(get_current_user)):
    """要求当前用户是管理员"""
    if current_user.role != "admin":
        raise HTTPException(403, "Permission denied: admin required")
    return current_user

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin)  # 只有管理员能调用
):
    db.delete_user(user_id)
    return {"msg": "user deleted"}
\`\`\`

### 7.2 基于 scope 的权限控制

\`\`\`python
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={"read": "读取权限", "write": "写入权限", "admin": "管理员权限"},
)

def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme),
):
    # 解码 token，检查 scope
    payload = jwt.decode(token, SECRET_KEY)
    token_scopes = payload.get("scopes", [])
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(403, f"Not enough permissions: need {scope}")
    return user

@app.post("/items/")
def create_item(
    user: User = Depends(get_current_user),
    # Security 要求 write scope
):
    ...
\`\`\`

## 八、本章 demo 目标

用纯 Python 实现完整的 get_current_user 逻辑：
1. 模拟 oauth2_scheme 提取 token
2. 解码 JWT 并验证签名/过期
3. 查询用户数据库
4. 演示各种异常场景（无 token、token 错误、过期、用户不存在、用户禁用）
5. 演示嵌套依赖链
6. 演示权限校验依赖

## 九、本章小结

- **get_current_user 的职责**：token → 用户对象，任何环节失败抛 401。
- **三步走**：提取 token → 解码 token → 查询用户。
- **credentials_exception 统一错误处理**：所有认证失败返回相同信息，不泄露原因。
- **嵌套依赖链**：oauth2_scheme → get_current_user → get_current_active_user → 路由。
- **各种异常场景**：无 token、格式错、签名错、过期、用户不存在、用户禁用，都返回 401。
- **权限校验**：在 get_current_user 基础上加 require_admin 等依赖，实现 RBAC。
- 掌握 get_current_user 后，FastAPI 认证的核心就全部理解了。
`,
    code: `"""
第十章 demo：get_current_user 实现原理
目标：用纯 Python 实现完整的 get_current_user 逻辑，演示：
  - oauth2_scheme 提取 token
  - JWT 解码与验证
  - 用户查询
  - 各种异常场景处理
  - 嵌套依赖链
  - 权限校验依赖
注意：不依赖 FastAPI 运行，用纯 Python 模拟全流程。
"""
import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timezone, timedelta

# ============================================================
# 第一部分：配置与工具
# ============================================================

SECRET_KEY = "demo-secret-key-not-for-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class HTTPError(Exception):
    """模拟 HTTP 异常"""
    def __init__(self, status_code: int, detail: str, headers: dict = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers or {}
        super().__init__(f"HTTP {status_code}: {detail}")

    def __str__(self):
        return f"HTTP {self.status_code}: {self.detail}"


# ============================================================
# 第二部分：密码哈希与 JWT 工具
# ============================================================

def hash_password(password: str) -> str:
    """哈希密码（PBKDF2-HMAC-SHA256）"""
    salt = os.urandom(16)
    iterations = 100000
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
        dklen=32,
    )
    return f"{iterations}\${salt.hex()}\${dk.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """验证密码（常数时间比较）"""
    try:
        parts = stored_hash.split("\$")
        if len(parts) != 3:
            return False
        iterations = int(parts[0])
        salt = bytes.fromhex(parts[1])
        original_dk = bytes.fromhex(parts[2])
        new_dk = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations,
            dklen=32,
        )
        return hmac.compare_digest(new_dk, original_dk)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """生成 JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire.timestamp()
    to_encode["iat"] = datetime.now(timezone.utc).timestamp()
    payload_json = json.dumps(to_encode, sort_keys=True)
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_json.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{payload_json}.{signature}"


def decode_token(token: str) -> dict:
    """解码并验证 JWT token"""
    try:
        parts = token.rsplit(".", 1)
        if len(parts) != 2:
            raise ValueError("token 格式错误")
        payload_json, signature = parts
        expected_sig = hmac.new(
            SECRET_KEY.encode("utf-8"),
            payload_json.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("签名验证失败")
        payload = json.loads(payload_json)
        if time.time() > payload.get("exp", 0):
            raise ValueError("token 已过期")
        return payload
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"token 无效: {e}")


# ============================================================
# 第三部分：模拟用户数据库
# ============================================================

fake_users_db = {
    "alice": {
        "username": "alice",
        "full_name": "Alice Wang",
        "email": "alice@example.com",
        "hashed_password": hash_password("AlicePass2024!"),
        "role": "admin",
        "disabled": False,
    },
    "bob": {
        "username": "bob",
        "full_name": "Bob Li",
        "email": "bob@example.com",
        "hashed_password": hash_password("BobPass2024!"),
        "role": "user",
        "disabled": False,
    },
    "charlie": {
        "username": "charlie",
        "full_name": "Charlie Zhang",
        "email": "charlie@example.com",
        "hashed_password": hash_password("CharliePass2024!"),
        "role": "user",
        "disabled": True,  # 账户被禁用
    },
}


def get_user(username: str) -> dict | None:
    """从数据库查询用户"""
    return fake_users_db.get(username)


# ============================================================
# 第四部分：模拟 OAuth2PasswordBearer
# ============================================================

class OAuth2PasswordBearer:
    """模拟 FastAPI 的 OAuth2PasswordBearer"""
    def __init__(self, tokenUrl: str = "token", auto_error: bool = True):
        self.tokenUrl = tokenUrl
        self.auto_error = auto_error

    def __call__(self, headers: dict) -> str | None:
        """从 Authorization 头提取 Bearer token"""
        authorization = headers.get("Authorization", "")
        if not authorization:
            if self.auto_error:
                raise HTTPError(401, "Not authenticated",
                                {"WWW-Authenticate": "Bearer"})
            return None
        parts = authorization.split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer":
            if self.auto_error:
                raise HTTPError(401, "Not authenticated",
                                {"WWW-Authenticate": "Bearer"})
            return None
        token = parts[1].strip()
        if not token and self.auto_error:
            raise HTTPError(401, "Not authenticated",
                            {"WWW-Authenticate": "Bearer"})
        return token


# 创建 oauth2_scheme 实例
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=True)


# 统一的"凭证错误"异常
# 所有认证失败都抛这个异常，错误信息统一，不泄露失败原因
credentials_exception = HTTPError(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# ============================================================
# 第五部分：get_current_user 核心实现
# ============================================================

def get_current_user(headers: dict) -> dict:
    """
    核心依赖：从 token 解析当前用户。
    三步走：提取 Token → 解码 Token → 查询用户

    任何一步失败都抛出 credentials_exception（401），
    错误信息统一为 "Could not validate credentials"，
    不泄露具体失败原因（防信息泄露）。

    参数：
        headers: HTTP 请求头（模拟）

    返回：
        用户字典

    异常：
        HTTPError(401): 任何认证失败
    """
    # ===== 第 1 步：提取 Token =====
    # oauth2_scheme 从 Authorization 头提取 Bearer token
    # 如果没有 Authorization 头或格式错误，oauth2_scheme 抛 401
    token = oauth2_scheme(headers)
    print(f"  [get_current_user] 提取到 token: {token[:40]}...")

    # ===== 第 2 步：解码 Token =====
    # decode_token 验证签名和过期时间
    # 失败抛 ValueError，捕获后转为 credentials_exception
    try:
        payload = decode_token(token)
        # 从 payload 提取用户标识（sub = subject）
        username = payload.get("sub")
        # 如果 payload 中没有 sub，token 无效
        if username is None:
            print(f"  [get_current_user] payload 无 sub 字段")
            raise credentials_exception
    except ValueError as e:
        # 签名错误、格式错误、过期等
        print(f"  [get_current_user] token 解码失败: {e}")
        raise credentials_exception

    print(f"  [get_current_user] token 解码成功，用户名: {username}")

    # ===== 第 3 步：查询用户 =====
    # token 有效不代表用户仍然有效（可能被删除/禁用）
    user = get_user(username)
    if user is None:
        # token 有效但用户已被删除
        print(f"  [get_current_user] 用户 {username} 不存在")
        raise credentials_exception

    print(f"  [get_current_user] 用户查询成功: {user['username']}")
    return user


def get_current_active_user(headers: dict) -> dict:
    """
    二级依赖：确保当前用户是活跃用户（未被禁用）。
    依赖 get_current_user，形成嵌套依赖链。

    异常：
        HTTPError(400): 用户被禁用
    """
    # 先通过 get_current_user 获取用户
    current_user = get_current_user(headers)
    # 检查是否被禁用
    if current_user.get("disabled", False):
        print(f"  [get_current_active_user] 用户 {current_user['username']} 已被禁用")
        raise HTTPError(400, "Inactive user")
    print(f"  [get_current_active_user] 用户活跃，验证通过")
    return current_user


def require_admin(headers: dict) -> dict:
    """
    权限校验依赖：要求当前用户是管理员。
    依赖 get_current_active_user，形成三层依赖链。

    异常：
        HTTPError(403): 权限不足
    """
    current_user = get_current_active_user(headers)
    if current_user.get("role") != "admin":
        print(f"  [require_admin] 用户 {current_user['username']} 不是管理员")
        raise HTTPError(403, "Permission denied: admin required")
    print(f"  [require_admin] 管理员验证通过")
    return current_user


# ============================================================
# 第六部分：模拟路由函数
# ============================================================

def read_users_me(headers: dict) -> dict:
    """路由：获取当前用户信息（依赖 get_current_user）"""
    print("\\n  --- 执行路由 read_users_me ---")
    user = get_current_user(headers)
    return {"username": user["username"], "full_name": user["full_name"],
            "role": user["role"]}


def read_active_user_profile(headers: dict) -> dict:
    """路由：获取活跃用户资料（依赖 get_current_active_user）"""
    print("\\n  --- 执行路由 read_active_user_profile ---")
    user = get_current_active_user(headers)
    return {"username": user["username"], "email": user["email"]}


def admin_dashboard(headers: dict) -> dict:
    """路由：管理员仪表盘（依赖 require_admin）"""
    print("\\n  --- 执行路由 admin_dashboard ---")
    admin = require_admin(headers)
    return {"msg": f"欢迎管理员 {admin['full_name']}", "stats": {"users": 100}}


# ============================================================
# 第七部分：运行演示
# ============================================================

if __name__ == "__main__":
    print("#" * 60)
    print("# get_current_user 实现原理演示")
    print("#" * 60)

    # 先生成一个合法的 token
    valid_token = create_access_token(
        data={"sub": "alice", "role": "admin", "full_name": "Alice Wang"},
    )
    bob_token = create_access_token(
        data={"sub": "bob", "role": "user", "full_name": "Bob Li"},
    )
    charlie_token = create_access_token(
        data={"sub": "charlie", "role": "user", "full_name": "Charlie Zhang"},
    )

    # ----- 演示 1：正常访问 -----
    print("\\n\\n" + "=" * 60)
    print("演示 1：正常访问（合法 token）")
    print("=" * 60)
    result = read_users_me({"Authorization": f"Bearer {valid_token}"})
    print(f"  返回: {result}")

    # ----- 演示 2：无 Authorization 头 -----
    print("\\n\\n" + "=" * 60)
    print("演示 2：无 Authorization 头 → 401")
    print("=" * 60)
    try:
        read_users_me({})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 3：Authorization 格式错误 -----
    print("\\n\\n" + "=" * 60)
    print("演示 3：Authorization 格式错误 → 401")
    print("=" * 60)
    try:
        read_users_me({"Authorization": "Basic abc123"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 4：token 签名被篡改 -----
    print("\\n\\n" + "=" * 60)
    print("演示 4：token 签名被篡改 → 401")
    print("=" * 60)
    tampered = valid_token[:-5] + "XXXXX"
    try:
        read_users_me({"Authorization": f"Bearer {tampered}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 5：token 过期 -----
    print("\\n\\n" + "=" * 60)
    print("演示 5：token 过期 → 401")
    print("=" * 60)
    expired_token = create_access_token(
        data={"sub": "alice"},
        expires_delta=timedelta(seconds=-1),
    )
    try:
        read_users_me({"Authorization": f"Bearer {expired_token}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 6：用户不存在 -----
    print("\\n\\n" + "=" * 60)
    print("演示 6：用户不存在（token 有效但用户已删除）→ 401")
    print("=" * 60)
    ghost_token = create_access_token(data={"sub": "deleted_user"})
    try:
        read_users_me({"Authorization": f"Bearer {ghost_token}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 7：嵌套依赖 —— get_current_active_user -----
    print("\\n\\n" + "=" * 60)
    print("演示 7：嵌套依赖 get_current_active_user（活跃用户）")
    print("=" * 60)
    result = read_active_user_profile({"Authorization": f"Bearer {bob_token}"})
    print(f"  返回: {result}")

    # ----- 演示 8：用户被禁用 -----
    print("\\n\\n" + "=" * 60)
    print("演示 8：用户被禁用（charlie）→ 400")
    print("=" * 60)
    try:
        read_active_user_profile({"Authorization": f"Bearer {charlie_token}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 演示 9：权限校验 —— require_admin -----
    print("\\n\\n" + "=" * 60)
    print("演示 9：权限校验 require_admin（管理员访问）")
    print("=" * 60)
    result = admin_dashboard({"Authorization": f"Bearer {valid_token}"})
    print(f"  返回: {result}")

    # ----- 演示 10：权限不足 -----
    print("\\n\\n" + "=" * 60)
    print("演示 10：权限不足（普通用户访问管理员接口）→ 403")
    print("=" * 60)
    try:
        admin_dashboard({"Authorization": f"Bearer {bob_token}"})
    except HTTPError as e:
        print(f"  捕获异常: {e}")

    # ----- 总结 -----
    print("\\n\\n" + "=" * 60)
    print("本章核心要点总结")
    print("=" * 60)
    print("1. get_current_user 职责：token → 用户对象")
    print("2. 三步走：提取 token → 解码 token → 查询用户")
    print("3. credentials_exception 统一错误，不泄露失败原因")
    print("4. 嵌套依赖链：oauth2 → get_current_user → get_current_active_user")
    print("5. 权限校验：require_admin 等依赖实现 RBAC")
    print("6. 异常场景：无 token/格式错/签名错/过期/用户不存在 都返回 401")
    print("=" * 60)
`,
  },
];

