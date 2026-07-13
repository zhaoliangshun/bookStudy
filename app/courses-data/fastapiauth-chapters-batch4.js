// =============================================================
// FastAPI 企业级认证与授权教程（fastapiauth）第四批章节
// -------------------------------------------------------------
// 本批包含 5 章（第 16-20 章）：
//   fa-multi-device       : 多设备登录管理
//   fa-token-rotation     : Token 轮换与滑动过期
//   fa-full-system        : 完整企业级认证系统整合
//   fa-security-practices : 安全最佳实践
//   fa-summary            : 总结与进阶展望
// ============================================================

export const chapters = [
  // ============================================================
  // 第十六章：多设备登录管理
  // ============================================================
  {
    id: "fa-multi-device",
    group: "第五部分 企业级方案",
    icon: "📱",
    title: "多设备登录管理",
    content: `## 第十六章　多设备登录管理

### 16.1 为什么需要多设备登录管理

先讲一个生活场景：你入住一家酒店，前台给你一张房卡。你问："能不能再给一张？我朋友也要用。"前台说可以，但最多 3 张。第 4 张会自动让最早那张失效。

这就是企业级认证里"多设备登录管理"的翻版。在真实的互联网产品里，同一个用户会同时在很多设备上登录：

- 早上在手机上刷 App
- 上班在电脑网页上工作
- 通勤在平板上看视频
- 偶尔在智能电视、车机上登录

每个登录都会拿到一个 Token，每个 Token 都代表一个"会话"。**如果系统不管理这些会话，就会出现一连串的安全与体验问题**。

#### 不管理会带来什么问题

| 问题 | 描述 | 后果 |
|------|------|------|
| Token 泄露无法止损 | 没有设备列表，不知道 Token 在哪 | 改密码也踢不掉旧设备 |
| 无法做"最多 N 端在线" | 没有限制策略 | 一个账号被无限共享 |
| 无法做"踢出指定设备" | 不知道哪些设备在用 | 丢了手机只能干瞪眼 |
| 登出只能登出当前端 | 全局登出做不到 | 切换设备后旧 Token 还能用 |
| 无法审计"谁在什么时候用什么设备登录" | 缺少设备维度日志 | 出事后无法溯源 |

所以"多设备登录管理"不是花架子，是企业级系统的必备能力。它要解决三件事：**知道有哪些设备、能控制设备数量、能主动踢掉设备**。

### 16.2 多设备登录的核心挑战

#### 挑战 1：同一用户多端在线，会话彼此独立

最朴素的实现是"一个用户一个 Token"——后登录的覆盖先登录的。这叫**单会话模式**。但用户期望的是：手机和电脑能同时在线，互不影响。

所以企业级系统必须是**多会话模式**：一个用户可以同时拥有多个有效 Token，每个 Token 对应一次独立的登录。

#### 挑战 2：怎么标识一个"设备"

光发 Token 不够，还得知道这个 Token 是从哪台设备来的。这就是"设备指纹"。常见的设备标识来源：

- **User-Agent**：浏览器、操作系统信息。粗粒度，多人可能一样。
- **客户端生成的 UUID**：App 首次启动生成一个 device_id 存本地。粒度细，但清缓存就变。
- **IP 地址**：辅助信息，能反查地理位置，但会变。
- **硬件特征组合**：屏幕分辨率、字体、时区等组合 hash（浏览器指纹技术）。

企业级系统通常组合多种信息，生成一个"设备记录"：

\`\`\`text
设备记录 = {
  device_id:      "唯一标识（客户端生成或服务端生成）",
  user_agent:     "Mozilla/5.0 ...",
  ip:             "1.2.3.4",
  device_name:    "iPhone 15 Pro",
  platform:       "ios",
  last_active_at: "2026-07-13 10:00:00",
  created_at:     "2026-07-01 09:00:00",
}
\`\`\`

#### 挑战 3：Token 与设备怎么绑定

光知道设备还不够，还得让 Token 跟设备绑定，这样：

- 拿到 Token 就能查到对应设备；
- 踢掉设备就能让该设备的所有 Token 失效；
- 限制设备数量时能精确知道"现在有几台"。

绑定方式有两种：

- **Token payload 里写 device_id**：简单直接，但 Token 一旦签发就改不了，踢设备要靠黑名单。
- **服务端维护 token_id ↔ device_id 映射表**：灵活，能精确控制，但要多查一次存储。

生产环境通常是两者结合：payload 里带 device_id 方便日志和审计，存储里维护映射方便控制和踢出。

### 16.3 设备指纹与设备管理

#### 设备指纹的生成策略

设备指纹的目标是"稳定 + 唯一"。"稳定"指同一设备多次访问指纹不变，"唯一"指不同设备指纹不同。

\`\`\`python
# 生成设备指纹的常见策略
import hashlib
import uuid

def generate_device_id(user_agent: str, ip: str, client_hint: str = "") -> str:
    """根据客户端信息生成设备指纹。

    策略：把 user_agent + ip + 客户端提示 拼起来做 hash。
    实际生产会用更多维度（屏幕、字体、时区），并允许客户端传入固定 device_id。
    """
    # 拼接原始信息
    raw = f"{user_agent}|{ip}|{client_hint}"
    # 用 sha256 生成定长 hash，作为指纹
    fingerprint = hashlib.sha256(raw.encode()).hexdigest()[:32]
    return fingerprint

# 更推荐：客户端首次启动生成 UUID，后续请求带上
def generate_client_device_id() -> str:
    """客户端生成一个持久的 device_id，存本地。"""
    return str(uuid.uuid4())
\`\`\`

#### 设备管理表设计

设备管理需要一张"用户设备表"，记录每个用户的每台设备：

\`\`\`text
user_devices 表
─────────────────────────────────────────────
id            主键
user_id       用户 ID
device_id     设备指纹（唯一标识一台设备）
device_name   设备名（iPhone 15、Chrome on Mac）
platform      平台（ios / android / web / desktop）
user_agent    完整 UA
ip            最近一次 IP
last_active_at 最近活跃时间
created_at    首次登录时间
is_active     是否仍在线（被踢出后置为 false）
\`\`\`

这张表是设备管理的核心。所有"列出设备""踢出设备""限制数量"的操作都基于它。

### 16.4 Token 与设备绑定方案

绑定方案对比：

| 方案 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| payload 内嵌 | Token 里写 device_id | 自包含，无需查库 | 踢设备要靠黑名单 |
| 服务端映射表 | 维护 token_id↔device_id | 精确控制，踢出立即生效 | 每次请求多查一次 |
| 混合方案 | payload + 映射表 | 兼顾自包含与可控 | 实现复杂 |

生产推荐**混合方案**：

- Token payload 里带 device_id，方便日志和审计；
- 服务端维护 device 表的 is_active 字段；
- 每次请求校验 Token 时，顺便查 device 是否仍 active；
- 踢设备就是把 device 的 is_active 置 false，该设备所有后续请求都会被拒。

### 16.5 踢出指定设备的实现

"踢出设备"在企业场景里很常见：

- 用户在公用电脑上登过，回家后远程踢掉；
- 账号疑似被盗，踢掉所有可疑设备；
- "最多 N 台"超限时，踢掉最早那台。

实现思路：

\`\`\`python
# 踢出设备的伪代码
def kickout_device(user_id: str, device_id: str):
    """踢出指定设备。"""
    # 1. 把设备标记为不活跃
    device = db.get_device(user_id, device_id)
    device.is_active = False
    db.save(device)

    # 2. 把该设备所有未过期的 Token 加入黑名单
    tokens = db.list_tokens_by_device(user_id, device_id)
    for t in tokens:
        blacklist.add(t.jti, expire_at=t.expire_at)

    # 3. （可选）记录审计日志
    audit.log(f"用户 {user_id} 踢出设备 {device_id}")
\`\`\`

注意第 2 步：如果 Token 是无状态的 JWT，光改 device.is_active 不够，因为 JWT 在过期前一直有效。要么每次请求查 device 表（推荐），要么把该 Token 的 jti 加黑名单。

### 16.6 "最多 N 台设备同时在线"的限制策略

这是企业级常见需求。例如：

- 普通用户最多 3 台设备同时在线；
- VIP 最多 5 台；
- 企业版最多 20 台。

实现策略有两种：

#### 策略 1：FIFO 踢出最早设备

新设备登录时，如果已达上限，把最早登录的那台踢掉。视频网站常用这种（VIP 同时在线设备数限制）。

\`\`\`python
# 伪代码
def login_with_limit(user_id, device_info, max_devices=3):
    devices = db.list_active_devices(user_id)  # 按登录时间排序
    if len(devices) >= max_devices:
        # 踢掉最早那台
        oldest = devices[0]
        kickout_device(user_id, oldest.device_id)
    # 注册新设备并签发 Token
    new_device = register_device(user_id, device_info)
    return issue_token(user_id, new_device.device_id)
\`\`\`

#### 策略 2：拒绝登录

已达上限直接拒绝，让用户自己先去登出一台。企业 SaaS 常用这种，避免"自动踢人"造成困扰。

\`\`\`python
def login_strict(user_id, device_info, max_devices=3):
    devices = db.list_active_devices(user_id)
    if len(dev_devices) >= max_devices:
        raise HTTPException(403, "已达设备上限，请先登出其他设备")
    return issue_token(user_id, register_device(user_id, device_info).device_id)
\`\`\`

两种策略各有适用场景：

- **FIFO**：2C 产品，用户希望"登就登，别打扰我"。
- **拒绝**：2B 产品，账号是企业资产，不能被随便踢。

### 16.7 数据模型与存储

把上面的概念落到表结构上：

\`\`\`text
users            用户表（略）
devices          设备表（user_id, device_id, is_active, ...）
tokens           Token 会话表（jti, user_id, device_id, expire_at）
token_blacklist  Token 黑名单（jti, expire_at）
\`\`\`

为什么需要 tokens 表？因为无状态 JWT 没法主动失效，必须有地方记录"哪些 Token 还有效"。tokens 表的 jti（JWT ID）和 Token payload 里的 jti 对应，校验时查一下是否在表里、是否被黑名单。

### 16.8 完整的登录流程

把上面所有环节串起来，一次"多设备登录"完整流程：

\`\`\`text
1. 客户端发起登录（带用户名密码 + device_id + device_info）
2. 服务端校验密码
3. 查询该用户当前活跃设备数
4. 如果超上限：FIFO 踢最早 / 拒绝登录
5. 注册新设备（写 devices 表）
6. 签发 JWT（payload 里带 user_id、device_id、jti）
7. 写 tokens 表（jti, user_id, device_id, expire_at）
8. 返回 Token 给客户端
\`\`\`

### 16.9 设备列表与踢出 API

典型的 API 设计：

\`\`\`text
GET  /api/devices              列出当前用户所有设备
DELETE /api/devices/{device_id} 踢出指定设备
DELETE /api/devices             踢出所有其他设备（保留当前）
\`\`\`

### 16.10 设备管理的常见陷阱

#### 陷阱 1：设备指纹不稳定

用 UA + IP 做指纹，用户切个 Wi-Fi、换个网络，IP 变了，指纹就变了，"同一台设备"被识别成两台。

解决：

- 优先用客户端生成的持久 device_id（App 首次启动生成，存 Keychain/SharedPreferences）；
- UA + IP 只做辅助校验，不做唯一标识；
- 允许同一 device_id 覆盖旧记录，避免重复注册。

#### 陷阱 2：Token 黑名单膨胀

每次踢设备都把 Token 加黑名单，时间长了黑名单很大，每次请求都要查。

解决：

- 黑名单条目带过期时间，到期自动清理；
- 用 Redis 等支持 TTL 的存储；
- 过期的 Token 不用查黑名单（本身就无效了）。

#### 陷阱 3：并发登录竞态

两个请求同时登录同一用户，都检查"设备数 < 3"，都通过，结果设备数变 4。

解决：

- 用数据库唯一约束 + 事务；
- 用分布式锁（Redis Lock）保护"登录"临界区；
- 或事后异步校正（发现超限时踢最早）。

### 16.11 生产环境实践建议

#### 分级设备限额

不同用户等级不同限额，是常见的商业化策略：

\`\`\`text
免费用户：最多 1 台设备
普通会员：最多 3 台设备
VIP 会员：最多 5 台设备
企业版：  最多 20 台设备
\`\`\`

实现时把限额放在用户套餐配置里，登录时动态读取：

\`\`\`python
def get_max_devices(user_id: str) -> int:
    user = get_user(user_id)
    plan = user.get("plan", "free")
    limits = {"free": 1, "basic": 3, "vip": 5, "enterprise": 20}
    return limits.get(plan, 1)
\`\`\`

#### 设备活跃度检测

除了"踢出"，还要自动清理"长期不活跃"的设备：

- 30 天没活跃的设备，自动标记为不活跃；
- 不活跃设备不占用限额；
- 用户可以在"设备管理"页面看到所有设备（含不活跃的）。

#### 设备变更通知

安全敏感的操作要通知用户：

- 新设备登录 → 邮件/短信通知；
- 设备被踢出 → 通知该设备用户；
- 设备数达到上限 → 提醒用户检查。

这是"可观测性"在用户侧的体现——让用户自己也能发现异常。

### 16.12 本章小结

多设备登录管理的核心是"设备指纹 + Token 绑定 + 主动控制"。它把"无状态 Token"和"有状态会话"结合：Token 自包含方便传输，服务端记录设备状态方便控制。

下一章我们讲 Token 轮换与滑动过期——这是另一项让 Token "更安全"的关键技术。`,

    code: `"""
第十六章 demo：多设备登录管理
目标：演示设备指纹、设备列表、踢出设备、最多 N 台在线限制。

本 demo 不依赖 FastAPI 服务，用纯 Python 模拟整个流程，方便理解原理。
"""
import hashlib
import time
import uuid
from datetime import datetime, timedelta


# ============================================================
# 第一部分：数据存储（用字典模拟数据库）
# ============================================================

# 用户表：user_id -> {password_hash, ...}
USERS = {}

# 设备表：(user_id, device_id) -> 设备记录
DEVICES = {}

# Token 会话表：jti -> {user_id, device_id, expire_at, token}
TOKENS = {}

# Token 黑名单：jti -> expire_at
BLACKLIST = {}


# ============================================================
# 第二部分：工具函数
# ============================================================

def hash_password(password: str) -> str:
    """模拟密码 hash（生产用 bcrypt/argon2）。"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """校验密码。"""
    return hash_password(password) == password_hash


def generate_device_id(user_agent: str, ip: str) -> str:
    """根据 UA + IP 生成设备指纹。

    生产环境会加更多维度：屏幕、字体、时区等。
    这里简化为 hash(UA + IP)。
    """
    raw = f"{user_agent}|{ip}"
    # sha256 取前 16 位作为指纹
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def now() -> datetime:
    """获取当前时间。"""
    return datetime.now()


def format_device(device: dict) -> str:
    """格式化设备信息为字符串，方便打印。"""
    return (
        f"  device_id={device['device_id'][:8]}..., "
        f"name={device['device_name']}, "
        f"platform={device['platform']}, "
        f"active={device['is_active']}, "
        f"login_at={device['login_at'].strftime('%H:%M:%S')}"
    )


# ============================================================
# 第三部分：核心业务逻辑
# ============================================================

def register_user(username: str, password: str) -> str:
    """注册用户。返回 user_id。"""
    user_id = str(uuid.uuid4())[:8]
    USERS[user_id] = {
        "username": username,
        "password_hash": hash_password(password),
    }
    print(f"[注册] 用户 {username} 注册成功，user_id={user_id}")
    return user_id


def list_active_devices(user_id: str) -> list:
    """列出用户所有活跃设备，按登录时间排序（最早在前）。"""
    devices = [
        d for (uid, _), d in DEVICES.items()
        if uid == user_id and d["is_active"]
    ]
    # 按登录时间升序，最早的在前面（FIFO 踢出要用）
    devices.sort(key=lambda d: d["login_at"])
    return devices


def kickout_device(user_id: str, device_id: str, reason: str = "manual"):
    """踢出指定设备。

    1. 把设备标记为不活跃
    2. 把该设备所有有效 Token 加入黑名单
    """
    key = (user_id, device_id)
    if key not in DEVICES:
        print(f"  [踢出] 设备 {device_id[:8]}... 不存在")
        return

    # 标记设备为不活跃
    device = DEVICES[key]
    device["is_active"] = False
    device["kickout_reason"] = reason
    print(f"  [踢出] 设备 {device['device_name']} 已下线（原因：{reason}）")

    # 把该设备所有有效 Token 加入黑名单
    kicked = 0
    for jti, record in TOKENS.items():
        if record["user_id"] == user_id and record["device_id"] == device_id:
            if record["expire_at"] > now():
                BLACKLIST[jti] = record["expire_at"]
                kicked += 1
    print(f"  [踢出] 同时作废了 {kicked} 个 Token")


def issue_token(user_id: str, device_id: str, expire_seconds: int = 3600) -> str:
    """签发 Token。

    实际生产用 JWT，这里用简化格式：jti|user_id|device_id|expire。
    同时把 jti 写入 TOKENS 表，方便后续控制。
    """
    jti = str(uuid.uuid4())[:8]
    expire_at = now() + timedelta(seconds=expire_seconds)
    # 简化的 Token 字符串（生产是 JWT）
    token = f"token:{jti}:{user_id}:{device_id}"
    # 写会话表
    TOKENS[jti] = {
        "user_id": user_id,
        "device_id": device_id,
        "expire_at": expire_at,
        "token": token,
    }
    return token


def login(user_id: str, password: str, device_name: str,
          platform: str, user_agent: str, ip: str,
          max_devices: int = 3, strategy: str = "fifo") -> dict:
    """多设备登录主流程。

    参数：
        user_id:       用户 ID
        password:      密码
        device_name:   设备名（如 iPhone 15）
        platform:      平台（ios/android/web/desktop）
        user_agent:    User-Agent
        ip:            客户端 IP
        max_devices:   最大同时在线设备数
        strategy:      超限策略，fifo=踢最早，reject=拒绝

    返回：{success, token, device_id, message}
    """
    print(f"\\n[登录] {device_name} ({platform}) 请求登录 user={user_id}")

    # 1. 校验密码
    user = USERS.get(user_id)
    if not user or not verify_password(password, user["password_hash"]):
        print("  [登录] 密码错误")
        return {"success": False, "message": "密码错误"}

    # 2. 生成设备指纹
    device_id = generate_device_id(user_agent, ip)
    print(f"  [登录] 生成设备指纹 device_id={device_id[:8]}...")

    # 3. 查询当前活跃设备数
    active_devices = list_active_devices(user_id)
    print(f"  [登录] 当前活跃设备数：{len(active_devices)} / 上限 {max_devices}")

    # 4. 如果该设备已存在且活跃，先踢掉（相当于重新登录）
    key = (user_id, device_id)
    if key in DEVICES and DEVICES[key]["is_active"]:
        print("  [登录] 该设备已在线，先登出旧的再重新登录")
        kickout_device(user_id, device_id, reason="re-login")

    # 5. 处理超限
    active_devices = list_active_devices(user_id)
    if len(active_devices) >= max_devices:
        if strategy == "reject":
            print("  [登录] 设备数超限，拒绝登录")
            return {"success": False, "message": "已达设备上限"}
        else:  # fifo
            oldest = active_devices[0]
            print(f"  [登录] 设备数超限，FIFO 踢出最早设备：{oldest['device_name']}")
            kickout_device(user_id, oldest["device_id"], reason="fifo")

    # 6. 注册新设备
    DEVICES[key] = {
        "device_id": device_id,
        "device_name": device_name,
        "platform": platform,
        "user_agent": user_agent,
        "ip": ip,
        "is_active": True,
        "login_at": now(),
        "last_active_at": now(),
    }
    print(f"  [登录] 设备 {device_name} 注册成功")

    # 7. 签发 Token
    token = issue_token(user_id, device_id)
    print(f"  [登录] 签发 Token：{token[:30]}...")

    return {"success": True, "token": token, "device_id": device_id}


def verify_token(token: str) -> dict:
    """校验 Token。

    校验步骤：
    1. 解析 Token
    2. 检查 jti 是否在黑名单
    3. 检查 jti 是否在会话表
    4. 检查设备是否仍活跃
    5. 检查是否过期
    """
    try:
        # 解析 Token 格式：token:jti:user_id:device_id
        parts = token.split(":")
        jti = parts[1]
        user_id = parts[2]
        device_id = parts[3]
    except (IndexError, ValueError):
        return {"valid": False, "reason": "格式错误"}

    # 检查黑名单
    if jti in BLACKLIST:
        return {"valid": False, "reason": "Token 已被作废（黑名单）"}

    # 检查会话表
    if jti not in TOKENS:
        return {"valid": False, "reason": "Token 不在会话表"}

    # 检查设备是否活跃
    key = (user_id, device_id)
    if key not in DEVICES or not DEVICES[key]["is_active"]:
        return {"valid": False, "reason": "设备已被踢出"}

    # 检查过期
    record = TOKENS[jti]
    if record["expire_at"] < now():
        return {"valid": False, "reason": "Token 已过期"}

    # 更新最近活跃时间
    DEVICES[key]["last_active_at"] = now()
    return {"valid": True, "user_id": user_id, "device_id": device_id}


# ============================================================
# 第四部分：演示场景
# ============================================================

def demo():
    """完整演示：注册 → 多设备登录 → 设备列表 → 踢出 → 限制。"""
    print("=" * 60)
    print("多设备登录管理 demo")
    print("=" * 60)

    # ---- 1. 注册用户 ----
    print("\\n>>> 场景 1：注册用户")
    user_id = register_user("alice", "password123")

    # ---- 2. 多设备登录（3 台都成功）----
    print("\\n>>> 场景 2：在 3 台设备上登录（上限 3）")
    login(user_id, "password123", "iPhone 15", "ios",
          "Mozilla/5.0 (iPhone)", "1.1.1.1", max_devices=3)
    login(user_id, "password123", "MacBook Pro", "macos",
          "Mozilla/5.0 (Macintosh)", "1.1.1.2", max_devices=3)
    login(user_id, "password123", "iPad Air", "ipados",
          "Mozilla/5.0 (iPad)", "1.1.1.3", max_devices=3)

    # ---- 3. 列出当前设备 ----
    print("\\n>>> 场景 3：列出当前所有活跃设备")
    devices = list_active_devices(user_id)
    print(f"当前活跃设备 {len(devices)} 台：")
    for d in devices:
        print(format_device(d))

    # ---- 4. 第 4 台登录，FIFO 踢最早 ----
    print("\\n>>> 场景 4：第 4 台登录，触发 FIFO 踢出最早设备")
    result = login(user_id, "password123", "Apple Watch", "watchos",
                   "Mozilla/5.0 (Watch)", "1.1.1.4", max_devices=3)
    print(f"  登录结果：success={result['success']}")

    # 看一下踢出后的设备列表
    print("\\n  踢出后设备列表：")
    devices = list_active_devices(user_id)
    for d in devices:
        print(format_device(d))

    # ---- 5. 验证被踢设备的 Token 失效 ----
    print("\\n>>> 场景 5：验证被踢设备的 Token 是否失效")
    # 找一个被踢设备的 Token 来校验
    kicked_token = None
    for jti, record in TOKENS.items():
        if record["user_id"] == user_id and jti in BLACKLIST:
            kicked_token = record["token"]
            break
    if kicked_token:
        result = verify_token(kicked_token)
        print(f"  校验被踢设备的 Token：{result}")

    # ---- 6. 主动踢出指定设备 ----
    print("\\n>>> 场景 6：主动踢出 MacBook Pro")
    devices = list_active_devices(user_id)
    for d in devices:
        if d["device_name"] == "MacBook Pro":
            kickout_device(user_id, d["device_id"], reason="用户主动踢出")
            break

    # ---- 7. 拒绝策略演示 ----
    print("\\n>>> 场景 7：拒绝策略（已达上限直接拒绝）")
    # 先补到 3 台
    login(user_id, "password123", "Chrome on Windows", "windows",
          "Mozilla/5.0 (Windows)", "1.1.1.5", max_devices=3)
    # 再登一台，应该被拒绝
    result = login(user_id, "password123", "Linux PC", "linux",
                   "Mozilla/5.0 (Linux)", "1.1.1.6",
                   max_devices=3, strategy="reject")
    print(f"  登录结果：success={result['success']}, message={result.get('message')}")

    # ---- 8. 最终设备列表 ----
    print("\\n>>> 场景 8：最终设备列表（含已下线的）")
    all_devices = [d for (uid, _), d in DEVICES.items() if uid == user_id]
    print(f"用户 {user_id} 的所有设备记录 {len(all_devices)} 条：")
    for d in all_devices:
        status = "活跃" if d["is_active"] else f"已下线({d.get('kickout_reason', 'unknown')})"
        print(f"  {d['device_name']:<20} [{status}]")

    print("\\n" + "=" * 60)
    print("demo 结束")
    print("=" * 60)


# ============================================================
# 入口
# ============================================================
if __name__ == "__main__":
    demo()
`,
  },

  // ============================================================
  // 第十七章：Token 轮换与滑动过期
  // ============================================================
  {
    id: "fa-token-rotation",
    group: "第五部分 企业级方案",
    icon: "🎠",
    title: "Token 轮换与滑动过期",
    content: `## 第十七章　Token 轮换与滑动过期

### 17.1 一张房卡的两种过期规则

再讲酒店的故事。酒店的房卡有两种过期规则：

- **固定过期**：你办卡时设定"3 天有效"，到第 3 天 12:00 一定失效，不管你这两天在不在房间。
- **滑动过期**：你每次刷卡进房间，房卡的有效期就往后顺延 24 小时。你一直在用，就一直不过期；你 24 小时没刷，才失效。

这两种规则对应 Token 世界的两种过期策略：

- **固定过期（Fixed Expiration）**：Token 签发时就定好过期时间，到期必失效，无论是否还在用。Access Token 通常用这种（短命，15 分钟）。
- **滑动过期（Sliding Expiration）**：每次用 Token 访问，服务端检测"快过期了就给你发个新的"，只要用户活跃，会话就一直延续。Refresh Token 适合这种。

滑动过期是用户体验和安全的平衡：用户不用频繁登录，但长期不活跃会自动失效。

### 17.2 滑动过期的概念

滑动过期的本质是"会话续命"。常见实现方式：

#### 方式 1：服务端续命（基于会话表）

每次请求带 Token 来，服务端查会话表，如果剩余时间小于阈值，就把过期时间往后延。

\`\`\`text
请求带 Token 来
  ↓
服务端查 session 表
  ↓
剩余时间 < 1/3 总时长？
  ├─ 是：续命（expire_at = now + max_age）
  └─ 否：不动
\`\`\`

#### 方式 2：客户端续命（Token 轮换）

每次请求响应里带一个新 Token，客户端用新 Token 替换旧的。这就是"Token 轮换"。

\`\`\`text
客户端发请求（带旧 Token）
  ↓
服务端校验通过
  ↓
签发新 Token（过期时间从现在起算）
  ↓
响应里带新 Token
  ↓
客户端替换旧 Token
\`\`\`

方式 2 更适合无状态 JWT，因为 JWT 自包含、过期时间写死在 payload 里，没法"续命"，只能"换新"。

### 17.3 Token 轮换：每次请求都返回新 Token

Token 轮换的核心思想：**活跃用户永远拿到新 Token，不活跃的用户 Token 自然过期**。

实现要点：

1. 每次请求校验旧 Token 通过后，签发新 Token；
2. 新 Token 的过期时间从"现在"起算（不是从旧 Token 签发时间起算）；
3. 把新 Token 放在响应头（如 \`X-New-Token\`）或响应体里；
4. 客户端拿到新 Token 后替换本地的旧 Token。

#### 一个简化实现

\`\`\`python
# Token 轮换中间件伪代码
@app.middleware("http")
async def token_rotation(request, call_next):
    # 1. 提取 Token
    token = request.headers.get("Authorization")
    if not token:
        return await call_next(request)

    # 2. 校验
    payload = verify_token(token)
    if not payload:
        return await call_next(request)

    # 3. 业务处理
    response = await call_next(request)

    # 4. 签发新 Token
    new_token = issue_token(payload["user_id"])
    response.headers["X-New-Token"] = new_token
    return response
\`\`\`

#### Token 轮换的优缺点

| 优点 | 缺点 |
|------|------|
| 用户活跃就永不过期 | 每个请求都要签发新 Token，CPU 开销 |
| Token 寿命短，泄露窗口小 | 客户端要处理"换 Token"逻辑 |
| 容易配合"重用检测" | 并发请求可能拿到不同新 Token |

最后一点是个常见坑：客户端同时发 3 个请求，每个响应都带新 Token，客户端该用哪个？解决方案：

- 客户端用"最新的"那个（按签发时间）；
- 服务端基于"Refresh Token"轮换，而不是 Access Token 轮换（更常见）。

### 17.4 Refresh Token 轮换的安全优势

实际生产里，**轮换 Access Token 不如轮换 Refresh Token**。原因：

- Access Token 短命（15 分钟），即使不轮换，泄露窗口也小；
- Refresh Token 长命（7 天），泄露风险大，更值得轮换；
- Refresh Token 只在"换 Token"时用，频率低，轮换开销可控。

#### Refresh Token 轮换流程

\`\`\`text
1. 客户端用 Refresh Token R1 换新 Access Token
2. 服务端：
   a. 校验 R1 有效
   b. 签发新 Access Token A2
   c. 签发新 Refresh Token R2
   d. 把 R1 加入黑名单（作废）
   e. 返回 A2 + R2
3. 客户端保存 A2 + R2，删掉 R1
4. 下次刷新用 R2
\`\`\`

关键点是第 2.d：**R1 用过一次就作废**。这就是"一次性 Refresh Token"。

#### 一次性 Refresh Token 的安全优势

如果攻击者偷到了 R1，但他还没用：

- 用户正常刷新：用 R1 换到 R2，R1 作废。攻击者再用 R1 时，服务端发现 R1 已被用过 → 报警。
- 攻击者先用：用 R1 换到 R2'，R1 作废。用户再刷新时用 R1，服务端发现 R1 已被用过 → 报警。

无论谁先用，都能检测出"Refresh Token 被重用"，从而发现 Token 被盗。这就是下一节要讲的"重用检测"。

### 17.5 检测 Token 被盗用：轮换后被旧 Refresh Token 使用

这是 Refresh Token 轮换最关键的安全价值。流程：

\`\`\`text
正常流程：
  R1 → 换 R2（R1 作废）
  R2 → 换 R3（R2 作废）
  R3 → 换 R4（R3 作废）

异常流程（被盗）：
  攻击者偷到 R2，等用户用 R2 换了 R3 后，攻击者用 R2：
    服务端发现 R2 已被用过（在"已用过的 Refresh Token"列表里）
    → 立即作废整个 Token 家族（R1, R2, R3, R4 全部失效）
    → 强制用户重新登录
    → 记录安全事件
\`\`\`

为什么要"作废整个家族"？因为攻击者既然拿到了 R2，很可能也拿到了 R3、R4。与其逐个判断，不如全部作废，让用户重新登录。这是"宁错杀不放过"的安全策略。

### 17.6 Token 家族与重用检测

"Token 家族"是 Refresh Token 轮换里的核心概念。

#### 什么是 Token 家族

每次登录会创建一个"家族"（family），家族里有一串 Refresh Token：

\`\`\`text
登录 → 创建 family F1
  F1: R1 → R2 → R3 → R4 → ...

用户重新登录 → 创建新 family F2
  F2: R1' → R2' → R3' → ...
\`\`\`

每个 Refresh Token 都知道自己的 family_id 和"第几代"（generation）。

#### 重用检测

当服务端收到一个 Refresh Token：

1. 校验签名和过期；
2. 查它是否在"已用过的 Refresh Token"列表；
3. 如果在 → 说明被盗用，作废整个 family；
4. 如果不在 → 正常换新，把这个 Token 加入"已用过的"列表。

#### 数据结构

\`\`\`text
refresh_token_families 表
─────────────────────────────
family_id       家族 ID
user_id         用户 ID
created_at      创建时间
status          active / revoked

refresh_tokens 表
─────────────────────────────
token_id        Token 唯一 ID（jti）
family_id       所属家族
generation      第几代
token_hash      Token 的 hash（不存明文）
status          active / used / revoked
used_at         被使用的时间
\`\`\`

#### 检测流程伪代码

\`\`\`python
def refresh(old_refresh_token):
    # 1. 校验签名
    payload = verify_jwt(old_refresh_token)
    if not payload:
        raise AuthError("invalid token")

    family_id = payload["family_id"]
    generation = payload["generation"]
    token_id = payload["jti"]

    # 2. 查 token 状态
    record = db.get_refresh_token(token_id)
    if not record:
        raise AuthError("token not found")

    if record["status"] == "used":
        # 关键！这个 Token 已经被用过 → 被盗用
        # 立即作废整个 family
        db.revoke_family(family_id)
        audit.log("Refresh Token 重用检测！family=%s 已作废", family_id)
        raise AuthError("token reuse detected, family revoked")

    if record["status"] == "revoked":
        raise AuthError("token already revoked")

    # 3. 正常换新
    db.mark_used(token_id)  # 标记为已用
    new_generation = generation + 1
    new_token = issue_refresh_token(family_id, new_generation)
    db.save_refresh_token(new_token)
    return new_token
\`\`\`

### 17.7 滑动过期 + 轮换的组合策略

实际生产里常组合使用：

- **Access Token**：短命（15 分钟），固定过期。每次请求不轮换（开销大）。
- **Refresh Token**：长命（7 天），滑动过期 + 一次性轮换。每次刷新换新，活跃用户永不过期。
- **重用检测**：Refresh Token 被重用立即作废整个 family。

这样既有安全性（短命 Access Token + 重用检测），又有体验（活跃用户无需重新登录）。

### 17.8 轮换的副作用与陷阱

#### 陷阱 1：并发请求拿到不同新 Token

客户端同时发多个刷新请求，会拿到多个新 Refresh Token，但只有最后一个有效（前面的都被作废了）。

解决：

- 客户端串行化刷新请求；
- 或服务端允许同一 Refresh Token 短时间内多次换新返回同一新 Token（用 token_id 做幂等）。

#### 陷阱 2：黑名单/已用列表无限增长

每个用过的 Refresh Token 都要记下来检测重用，时间长了表会很大。

解决：

- 已过期 Token 直接删（过期了就不可能被重用）；
- 定期清理 7 天前的记录（取决于 Refresh Token 寿命）。

#### 陷阱 3：网络断了，客户端没收到新 Token

服务端签发了新 Token、作废了旧 Token，但响应丢了，客户端还拿着旧 Token → 下次刷新失败。

解决：

- 给 Refresh Token 一个"宽限期"：刚用过的 Token 在 30 秒内仍可换新（但返回的是同一新 Token）；
- 或客户端失败重试时用"上一次成功的 Token"。

### 17.9 轮换策略的选型建议

不同业务场景适合不同的轮换策略：

#### 场景 1：短命会话（工具类应用）

用户用完即走，不需要长期登录。例如查询类工具、一次性表单。

- **Access Token**：15 分钟，不轮换；
- **Refresh Token**：1 天，不轮换；
- **策略**：过期就重新登录，简单粗暴。

#### 场景 2：长会话 + 高安全（金融、企业 SaaS）

用户长期使用，但安全要求高。例如银行 App、企业 ERP。

- **Access Token**：5-15 分钟，固定过期；
- **Refresh Token**：7 天，一次性轮换 + 重用检测；
- **策略**：活跃用户无感续期，被盗用立即作废整个 family。

#### 场景 3：长会话 + 体验优先（社交、内容）

用户长期使用，体验优先于绝对安全。例如社交 App、视频网站。

- **Access Token**：30 分钟，固定过期；
- **Refresh Token**：30 天，可重用（不轮换，但加设备绑定）；
- **策略**：减少刷新频率，允许多端共享 Refresh Token（配合设备管理）。

#### 决策矩阵

| 维度 | 短命会话 | 高安全 | 体验优先 |
|------|---------|--------|---------|
| Access 寿命 | 15min | 5-15min | 30min |
| Refresh 寿命 | 1d | 7d | 30d |
| 是否轮换 | 否 | 是 | 否 |
| 重用检测 | 否 | 是 | 否 |
| 设备绑定 | 可选 | 必须 | 可选 |

### 17.10 实现注意事项

#### 数据库索引

Refresh Token 记录表要建的索引：

\`\`\`text
refresh_tokens 表：
  - 主键：jti
  - 索引：(family_id, status)  -- 查家族状态
  - 索引：(user_id, status)     -- 查用户活跃 Token
  - 索引：(expire_at)           -- 清理过期记录
\`\`\`

#### 清理任务

定期清理过期记录，避免表无限增长：

\`\`\`python
# 每小时跑一次
def cleanup_expired_tokens():
    now = datetime.now()
    # 删除过期的 Refresh Token 记录
    db.execute("DELETE FROM refresh_tokens WHERE expire_at < %s", (now,))
    # 删除过期的黑名单条目
    db.execute("DELETE FROM token_blacklist WHERE expire_at < %s", (now,))
    # 删除已作废且过期的 family
    db.execute("""
        DELETE FROM refresh_token_families
        WHERE status = 'revoked'
        AND created_at < %s
    """, (now - timedelta(days=30),))
\`\`\`

#### 监控指标

轮换机制要监控的关键指标：

- 刷新成功率（正常应接近 100%）；
- 重用检测触发次数（正常应为 0，非 0 说明有攻击）；
- 平均 Token 寿命（反映用户活跃度）；
- 并发刷新冲突次数（反映客户端实现质量）。

### 17.11 本章小结

Token 轮换与滑动过期是"让 Token 既安全又好用"的关键技术：

- **滑动过期**：活跃用户不过期，不活跃自动失效；
- **Refresh Token 轮换**：一次性使用，每次换新；
- **重用检测**：被盗用立即作废整个 family。

下一章我们把前面所有模块整合成一个完整的企业级认证系统。`,

    code: `"""
第十七章 demo：Token 轮换与被盗用检测
目标：
  1. 实现 Refresh Token 轮换（一次性使用）
  2. 实现 Token 家族与重用检测
  3. 演示正常刷新和被盗用场景

纯 Python 模拟，方便理解原理。
"""
import hashlib
import hmac
import json
import time
import uuid
from datetime import datetime, timedelta


# ============================================================
# 数据存储
# ============================================================

# Refresh Token 家族表：family_id -> {user_id, status, created_at}
FAMILIES = {}

# Refresh Token 记录表：jti -> {family_id, generation, status, used_at, expire_at}
REFRESH_TOKENS = {}

# Access Token 简化（不存表，自包含 JWT）
# 真实生产会查黑名单


# ============================================================
# JWT 简化实现（演示用，生产用 PyJWT）
# ============================================================

SECRET = "super-secret-key-change-in-production"


def base64url_encode(data: bytes) -> str:
    """简化版 base64url 编码。"""
    import base64
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def base64url_decode(s: str) -> bytes:
    """简化版 base64url 解码。"""
    import base64
    padding = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)


def jwt_encode(payload: dict) -> str:
    """简化版 JWT 签发（HS256）。"""
    header = {"alg": "HS256", "typ": "JWT"}
    header_str = base64url_encode(json.dumps(header).encode())
    payload_str = base64url_encode(json.dumps(payload).encode())
    signing_input = f"{header_str}.{payload_str}"
    signature = hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_str = base64url_encode(signature)
    return f"{signing_input}.{sig_str}"


def jwt_decode(token: str) -> dict:
    """简化版 JWT 校验。返回 payload 或抛异常。"""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("格式错误")
        signing_input = f"{parts[0]}.{parts[1]}"
        expected_sig = hmac.new(SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
        actual_sig = base64url_decode(parts[2])
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("签名错误")
        payload = json.loads(base64url_decode(parts[1]))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token 过期")
        return payload
    except Exception as e:
        raise ValueError(f"JWT 校验失败: {e}")


# ============================================================
# Token 签发
# ============================================================

def issue_access_token(user_id: str, expire_seconds: int = 900) -> str:
    """签发 Access Token（15 分钟）。

    Access Token 自包含，不存表，不轮换。
    """
    payload = {
        "sub": user_id,
        "type": "access",
        "jti": str(uuid.uuid4())[:8],
        "iat": int(time.time()),
        "exp": int(time.time()) + expire_seconds,
    }
    return jwt_encode(payload)


def issue_refresh_token(user_id: str, family_id: str, generation: int,
                        expire_seconds: int = 7 * 24 * 3600) -> str:
    """签发 Refresh Token（7 天）。

    Refresh Token 一次性使用，每次刷新换新。
    """
    jti = str(uuid.uuid4())[:8]
    payload = {
        "sub": user_id,
        "type": "refresh",
        "family": family_id,
        "gen": generation,
        "jti": jti,
        "iat": int(time.time()),
        "exp": int(time.time()) + expire_seconds,
    }
    token = jwt_encode(payload)
    # 写入记录表
    REFRESH_TOKENS[jti] = {
        "family_id": family_id,
        "generation": generation,
        "status": "active",  # active / used / revoked
        "used_at": None,
        "expire_at": datetime.now() + timedelta(seconds=expire_seconds),
    }
    return token


def login(user_id: str) -> dict:
    """登录：签发 Access Token + 创建新 family 的 Refresh Token。"""
    family_id = str(uuid.uuid4())[:8]
    FAMILIES[family_id] = {
        "user_id": user_id,
        "status": "active",
        "created_at": datetime.now(),
    }
    access = issue_access_token(user_id)
    refresh = issue_refresh_token(user_id, family_id, generation=1)
    print(f"[登录] user={user_id} family={family_id} gen=1")
    return {"access_token": access, "refresh_token": refresh, "family_id": family_id}


# ============================================================
# 核心：Refresh Token 轮换 + 重用检测
# ============================================================

def refresh(old_refresh_token: str) -> dict:
    """用 Refresh Token 换新 Token。

    流程：
    1. 校验 JWT
    2. 查记录表，检查 status
       - active：正常换新
       - used：重用！作废整个 family
       - revoked：已作废
    3. 标记旧 Token 为 used
    4. 签发新 Access + 新 Refresh（generation + 1）
    """
    # 1. 校验 JWT
    try:
        payload = jwt_decode(old_refresh_token)
    except ValueError as e:
        return {"success": False, "error": str(e)}

    if payload.get("type") != "refresh":
        return {"success": False, "error": "不是 Refresh Token"}

    jti = payload["jti"]
    family_id = payload["family"]
    generation = payload["gen"]
    user_id = payload["sub"]

    # 2. 查记录表
    record = REFRESH_TOKENS.get(jti)
    if not record:
        return {"success": False, "error": "Token 不在记录表"}

    # 关键：检查是否被重用
    if record["status"] == "used":
        # 被重用！立即作废整个 family
        print(f"  ⚠️  检测到重用！family={family_id} gen={generation} jti={jti}")
        print(f"  ⚠️  立即作废整个 family（所有 Token 失效）")
        revoke_family(family_id, reason="reuse detected")
        return {"success": False, "error": "Token 重用检测，family 已作废"}

    if record["status"] == "revoked":
        return {"success": False, "error": "Token 已作废"}

    # 3. 标记旧 Token 为 used
    record["status"] = "used"
    record["used_at"] = datetime.now()

    # 4. 签发新 Token
    new_access = issue_access_token(user_id)
    new_refresh = issue_refresh_token(
        user_id, family_id, generation=generation + 1
    )
    print(f"[刷新] family={family_id} gen {generation} → {generation + 1}")
    return {
        "success": True,
        "access_token": new_access,
        "refresh_token": new_refresh,
    }


def revoke_family(family_id: str, reason: str = "manual"):
    """作废整个 family：所有 Token 标记为 revoked。"""
    if family_id in FAMILIES:
        FAMILIES[family_id]["status"] = "revoked"
    for jti, record in REFRESH_TOKENS.items():
        if record["family_id"] == family_id:
            record["status"] = "revoked"
    print(f"  [作废] family={family_id} 原因={reason}")


# ============================================================
# 演示场景
# ============================================================

def demo():
    """完整演示：登录 → 正常刷新 → 重用检测。"""
    print("=" * 60)
    print("Token 轮换与被盗用检测 demo")
    print("=" * 60)

    # ---- 场景 1：正常刷新 ----
    print("\\n>>> 场景 1：正常登录并连续刷新 3 次")
    result = login("alice")
    access = result["access_token"]
    refresh_token = result["refresh_token"]
    family_id = result["family_id"]
    print(f"  初始 Access Token: {access[:30]}...")

    # 连续刷新 3 次
    for i in range(3):
        result = refresh(refresh_token)
        if not result["success"]:
            print(f"  第 {i+1} 次刷新失败：{result['error']}")
            break
        access = result["access_token"]
        refresh_token = result["refresh_token"]
        print(f"  第 {i+1} 次刷新成功，新 Access: {access[:30]}...")

    # ---- 场景 2：旧 Token 重用 → 触发作废 ----
    print("\\n>>> 场景 2：攻击者用旧 Refresh Token（重用检测）")
    # 假设攻击者偷到了第一次的 Refresh Token（已经被用过）
    # 我们重新走一遍流程，再"重用"
    result = login("bob")
    refresh_token_1 = result["refresh_token"]  # 第 1 代
    print(f"  Bob 登录，拿到第 1 代 Refresh Token")

    # 正常刷新一次，拿到第 2 代
    result = refresh(refresh_token_1)
    refresh_token_2 = result["refresh_token"]
    print(f"  Bob 正常刷新，拿到第 2 代 Refresh Token")

    # 攻击者用偷来的第 1 代（已被用过）→ 触发重用检测
    print(f"  攻击者用偷来的第 1 代 Refresh Token...")
    result = refresh(refresh_token_1)
    print(f"  攻击者刷新结果：success={result['success']}, error={result.get('error')}")

    # 此时整个 family 已被作废，Bob 的第 2 代也失效了
    print(f"  → Bob 的第 2 代 Token 现在还能用吗？")
    result = refresh(refresh_token_2)
    print(f"  Bob 刷新结果：success={result['success']}, error={result.get('error')}")
    print(f"  → Bob 必须重新登录！")

    # ---- 场景 3：family 状态查看 ----
    print("\\n>>> 场景 3：查看 family 状态")
    print(f"  所有 family：")
    for fid, fam in FAMILIES.items():
        print(f"    family={fid} user={fam['user_id']} status={fam['status']}")

    print(f"\\n  所有 Refresh Token 记录：")
    for jti, rec in REFRESH_TOKENS.items():
        print(f"    jti={jti} family={rec['family_id']} "
              f"gen={rec['generation']} status={rec['status']}")

    print("\\n" + "=" * 60)
    print("demo 结束")
    print("=" * 60)


# ============================================================
# 入口
# ============================================================
if __name__ == "__main__":
    demo()
`,
  },

  // ============================================================
  // 第十八章：完整企业级认证系统整合
  // ============================================================
  {
    id: "fa-full-system",
    group: "第六部分 完整实战",
    icon: "🏗️",
    title: "完整企业级认证系统整合",
    content: `## 第十八章　完整企业级认证系统整合

### 18.1 从零到一：把所有模块拼起来

前面十几章我们讲了一堆零件：密码 hash、JWT、RBAC、ABAC、OAuth2、Refresh Token、多设备、轮换……这一章我们把这些零件组装成一辆"完整的车"。

生活类比：前面是学发动机、学变速箱、学底盘、学转向系统。这一章是装配车间——把所有零件装到一起，拧紧螺丝，加满油，点火试车。

一个完整的企业级认证系统要回答这几个问题：

1. 用户怎么注册？（密码强度、唯一性、邮箱验证）
2. 用户怎么登录？（账号密码、OAuth2、多设备）
3. 登录后怎么拿 Token？（Access + Refresh）
4. 怎么访问受保护资源？（中间件校验）
5. Token 过期怎么续？（Refresh Token 轮换）
6. 怎么登出？（黑名单 / 设备下线）
7. 权限怎么管？（RBAC + ABAC）
8. 出事怎么排查？（审计日志）

这一章我们把每一步的代码骨架写出来。

### 18.2 系统架构总览

\`\`\`text
┌──────────────────────────────────────────────────────────┐
│                       客户端                              │
│  (Web / App / 小程序 / 第三方)                             │
└────────────┬─────────────────────────────┬────────────────┘
             │ 1. 登录 / 刷新 / 业务请求    │ 8. 响应
             ▼                              ▲
┌──────────────────────────────────────────────────────────┐
│                  FastAPI 应用层                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 中间件层：CORS / 限流 / 审计日志 / 请求 ID          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 路由层：/auth /api /admin                          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 依赖层：get_current_user / require_permission      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 服务层：AuthService / UserService / TokenService    │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 数据层：UserRepo / RoleRepo / TokenRepo / AuditRepo│  │
│  └────────────────────────────────────────────────────┘  │
└──────────┬──────────────────┬──────────────────┬─────────┘
           ▼                  ▼                  ▼
     ┌──────────┐       ┌──────────┐       ┌──────────┐
     │ Postgres │       │  Redis   │       │  日志    │
     │ 业务数据  │       │ 黑名单   │       │  审计    │
     └──────────┘       └──────────┘       └──────────┘
\`\`\`

### 18.3 数据库模型

一个完整的认证系统至少需要这些表：

#### 用户与权限

\`\`\`text
users              用户表（id, username, email, password_hash, is_active, ...）
roles              角色表（id, name, description）
permissions        权限表（id, code, description）
user_roles         用户-角色关联（user_id, role_id）
role_permissions   角色-权限关联（role_id, permission_id）
\`\`\`

#### 设备与会话

\`\`\`text
devices            设备表（id, user_id, device_id, device_name, is_active, ...）
refresh_tokens     Refresh Token 记录（jti, family_id, user_id, device_id, status, ...）
token_families     Token 家族（family_id, user_id, status, ...）
token_blacklist    Token 黑名单（jti, expire_at）
\`\`\`

#### 审计

\`\`\`text
audit_logs         审计日志（id, user_id, action, ip, ua, ...）
login_attempts     登录尝试（id, username, ip, success, ...）
\`\`\`

### 18.4 完整的 API 端点设计

\`\`\`text
认证相关：
  POST   /auth/register            注册
  POST   /auth/login               登录（返回 access + refresh）
  POST   /auth/refresh             刷新 Token
  POST   /auth/logout              登出（当前设备）
  POST   /auth/logout-all          登出所有设备

设备管理：
  GET    /api/devices              列出我的设备
  DELETE /api/devices/{device_id}  踢出指定设备

用户与权限：
  GET    /api/me                   获取当前用户信息
  GET    /api/users                列出用户（管理员）
  POST   /api/users/{id}/roles     给用户分配角色（管理员）
  GET    /api/roles                列出角色

业务接口（受权限保护）：
  GET    /api/orders               查订单（需 order:read 权限）
  POST   /api/orders               创建订单（需 order:write 权限）
\`\`\`

### 18.5 中间件与依赖的层级关系

FastAPI 的请求处理是"洋葱模型"：

\`\`\`text
请求进来
  ↓
[中间件] CORS     → 处理跨域
[中间件] 限流     → 防爆破
[中间件] 请求 ID  → 给每个请求打标
[中间件] 审计日志 → 记录所有请求
  ↓
[路由] /api/orders
  ↓
[依赖] get_current_user      → 解析 Token，拿到用户
[依赖] require_permission    → 检查权限
  ↓
[业务函数] list_orders(...)
  ↓
响应出去
\`\`\`

依赖可以嵌套：\`require_permission\` 依赖 \`get_current_user\`，\`get_current_user\` 依赖 Token 解析。

### 18.6 配置与密钥管理

\`\`\`text
.env 文件：
  JWT_SECRET=xxx
  JWT_ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE=900       (15 分钟)
  REFRESH_TOKEN_EXPIRE=604800   (7 天)
  MAX_DEVICES_PER_USER=3
  REDIS_URL=redis://...
  DATABASE_URL=postgresql://...
\`\`\`

密钥管理原则：

- **永远不要把密钥写进代码**，用环境变量或密钥管理服务（Vault、AWS KMS）；
- **密钥要轮换**，准备多套密钥，新旧并存一段时间；
- **生产用 RS256**（非对称），公钥校验、私钥签发，更安全；
- **payload 最小化**，不放敏感数据，不放不必要的字段。

### 18.7 关键模块的代码骨架

#### 注册流程

\`\`\`text
1. 校验用户名/邮箱唯一
2. 校验密码强度（长度、复杂度）
3. hash 密码（bcrypt）
4. 写入 users 表
5. （可选）发邮箱验证链接
6. 返回用户 ID
\`\`\`

#### 登录流程

\`\`\`text
1. 查用户（按用户名或邮箱）
2. 校验密码（bcrypt.verify）
3. 检查账号状态（is_active）
4. 检查登录失败次数（防爆破）
5. 多设备检查（设备数限制）
6. 注册设备
7. 签发 Access + Refresh Token（创建 family）
8. 记录审计日志
9. 返回 Token
\`\`\`

#### 访问受保护资源

\`\`\`text
1. 从 Header 提取 Token
2. 校验签名 + 过期
3. 检查黑名单
4. 检查设备是否活跃
5. 加载用户 + 角色 + 权限
6. 检查权限
7. 执行业务
\`\`\`

#### 刷新流程

\`\`\`text
1. 校验 Refresh Token 签名
2. 查记录表（status）
3. 检查重用 → 作废 family
4. 标记旧 Token 为 used
5. 签发新 Access + 新 Refresh
6. 返回
\`\`\`

#### 登出流程

\`\`\`text
1. 提取当前 Token
2. 加入黑名单（expire_at = Token 原过期时间）
3. 标记设备为不活跃（如果是登出当前设备）
4. 记录审计日志
\`\`\`

### 18.8 错误处理与统一响应

认证系统要有统一的错误响应格式：

\`\`\`json
{
  "error": "invalid_token",
  "message": "Token 已过期",
  "detail": {}
}
\`\`\`

常见的错误码：

| HTTP | error | 含义 |
|------|-------|------|
| 401 | invalid_credentials | 用户名或密码错误 |
| 401 | token_expired | Token 过期 |
| 401 | token_invalid | Token 无效 |
| 401 | token_revoked | Token 已被作废 |
| 403 | permission_denied | 权限不足 |
| 403 | device_limit_exceeded | 设备数超限 |
| 429 | too_many_attempts | 登录尝试过多 |

### 18.9 可观测性：日志、监控、审计

企业级系统必须有完整的可观测性：

- **日志**：每个关键操作（登录、刷新、登出、权限变更）都要记日志；
- **监控**：登录成功率、Token 签发量、刷新失败率、设备数分布；
- **审计**：谁在什么时候从哪个 IP 做了什么操作，出事能溯源。

审计日志要包含：

\`\`\`text
user_id, action, ip, user_agent, device_id, timestamp, result, detail
\`\`\`

### 18.10 测试策略

认证系统测试要覆盖：

- 单元测试：密码 hash、Token 签发/校验、权限检查；
- 集成测试：完整登录-访问-刷新-登出流程；
- 安全测试：重用检测、暴力破解、越权访问；
- 性能测试：高并发下的 Token 校验性能。

### 18.11 部署与扩展性考虑

#### 单体 vs 微服务部署

认证系统可以单体部署（适合中小项目），也可以拆成微服务（适合大型系统）：

\`\`\`text
单体部署：
  ┌─────────────────────────┐
  │  FastAPI App            │
  │  (auth + business + api)│
  └─────────────────────────┘
  适合：用户 < 10万，QPS < 1000

微服务部署：
  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Auth Svc │   │ User Svc │   │ Order Svc│
  └────┬─────┘   └────┬─────┘   └────┬─────┘
       │              │              │
       └──────────────┼──────────────┘
                      ▼
              ┌──────────────┐
              │  API Gateway │
              └──────────────┘
  适合：用户 > 10万，多团队，需要独立扩展
\`\`\`

微服务架构下，认证服务专注"发 Token、验 Token"，其他服务通过网关或本地校验 Token。

#### 水平扩展的瓶颈

认证系统的扩展瓶颈通常在：

1. **数据库**：用户表、Token 表的读写。解决：读写分离、缓存热点数据。
2. **Redis**：黑名单、限流、会话。解决：Redis 集群、分片。
3. **JWT 签名**：RS256 签名是 CPU 密集。解决：用 ES256（更快）、或独立签名服务。

#### 缓存策略

\`\`\`text
用户信息：    Redis 缓存，TTL 5 分钟（权限变更时主动失效）
Token 黑名单：Redis，TTL = Token 剩余寿命
权限列表：    Redis 缓存，TTL 10 分钟
限流计数：    Redis，滑动窗口
\`\`\`

#### 高可用

- **无状态 API**：FastAPI 应用无状态，可任意水平扩展；
- **数据库主从**：Postgres 主从 + 故障切换；
- **Redis 集群**：Redis Sentinel 或 Cluster；
- **多可用区部署**：跨机房容灾。

### 18.12 性能优化要点

#### JWT 校验性能

每次请求都要校验 JWT，是性能热点：

- HS256：HMAC 计算，微秒级，很快；
- RS256：RSA 验签，毫秒级，较慢；
- ES256：椭圆曲线验签，比 RS256 快 3-5 倍。

优化：

- 用 ES256 替代 RS256；
- 公钥缓存在内存（不用每次读文件）；
- 避免在 JWT payload 放大对象（影响 base64 解码）。

#### 数据库查询优化

\`\`\`python
# 慢：每次请求都查用户 + 角色 + 权限（3 次查询）
def get_current_user(token):
    user = db.get_user(user_id)        # 查询 1
    roles = db.get_roles(user_id)      # 查询 2
    perms = db.get_perms(roles)        # 查询 3
    return user, roles, perms

# 快：一次 JOIN 查询 + Redis 缓存
def get_current_user(token):
    cached = redis.get(f"user:{user_id}")
    if cached:
        return cached
    # 一次 JOIN 拿全部
    result = db.execute("""
        SELECT u.*, r.id as role_id, p.code as perm_code
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON r.id = ur.role_id
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = %s
    """, (user_id,))
    redis.setex(f"user:{user_id}", 300, result)  # 缓存 5 分钟
    return result
\`\`\`

### 18.13 本章小结

这一章我们把所有零件组装成一个完整系统。关键不是某个具体函数，而是"分层"和"职责清晰"：

- 中间件处理通用关注点（CORS、限流、日志）；
- 依赖处理认证授权（解析用户、检查权限）；
- 服务层处理业务逻辑；
- 数据层处理持久化。

下一章我们专门讲安全最佳实践——把这个系统加固到生产可用。`,

    code: `"""
第十八章 demo：完整企业级认证系统核心代码
目标：把前面所有模块整合成一个可运行的最小系统。

包含：
  - 用户注册/登录
  - Access + Refresh Token 签发
  - Token 轮换 + 重用检测
  - 多设备管理
  - RBAC 权限控制
  - 审计日志
  - 中间件（限流、CORS、审计）

纯 Python 模拟，方便理解整体架构。
"""
import hashlib
import hmac
import json
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta


# ============================================================
# 配置
# ============================================================

CONFIG = {
    "JWT_SECRET": "super-secret-key",
    "JWT_ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE": 900,        # 15 分钟
    "REFRESH_TOKEN_EXPIRE": 7 * 86400, # 7 天
    "MAX_DEVICES": 3,
    "LOGIN_RATE_LIMIT": 5,             # 每分钟最多 5 次登录
}


# ============================================================
# 数据存储（模拟数据库）
# ============================================================

USERS = {}             # user_id -> user
ROLES = {}             # role_id -> role
PERMISSIONS = {}       # perm_code -> permission
USER_ROLES = defaultdict(set)        # user_id -> {role_id}
ROLE_PERMISSIONS = defaultdict(set)  # role_id -> {perm_code}

DEVICES = {}           # (user_id, device_id) -> device
REFRESH_TOKENS = {}    # jti -> record
FAMILIES = {}          # family_id -> family
BLACKLIST = {}         # jti -> expire_at
AUDIT_LOGS = []        # 审计日志列表
LOGIN_ATTEMPTS = defaultdict(deque)  # ip -> deque[timestamp]


# ============================================================
# JWT 简化实现
# ============================================================

def b64encode(data: bytes) -> str:
    import base64
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def b64decode(s: str) -> bytes:
    import base64
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def jwt_encode(payload: dict) -> str:
    """签发 JWT。"""
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64encode(json.dumps(header).encode())
    p = b64encode(json.dumps(payload).encode())
    signing_input = f"{h}.{p}"
    sig = hmac.new(CONFIG["JWT_SECRET"].encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{b64encode(sig)}"


def jwt_decode(token: str) -> dict:
    """校验并解码 JWT。"""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("格式错误")
    signing_input = f"{parts[0]}.{parts[1]}"
    expected = hmac.new(CONFIG["JWT_SECRET"].encode(), signing_input.encode(), hashlib.sha256).digest()
    actual = b64decode(parts[2])
    if not hmac.compare_digest(expected, actual):
        raise ValueError("签名错误")
    payload = json.loads(b64decode(parts[1]))
    if payload.get("exp", 0) < time.time():
        raise ValueError("Token 过期")
    return payload


# ============================================================
# 安全工具
# ============================================================

def hash_password(password: str) -> str:
    """密码 hash（生产用 bcrypt）。"""
    salt = "fixed-salt-for-demo"
    return hashlib.sha256((salt + password).encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def check_password_strength(password: str) -> tuple:
    """检查密码强度。返回 (ok, message)。"""
    if len(password) < 8:
        return False, "密码至少 8 位"
    if not any(c.isupper() for c in password):
        return False, "密码必须包含大写字母"
    if not any(c.islower() for c in password):
        return False, "密码必须包含小写字母"
    if not any(c.isdigit() for c in password):
        return False, "密码必须包含数字"
    return True, "ok"


# ============================================================
# 中间件
# ============================================================

def rate_limit(ip: str) -> bool:
    """登录限流：每分钟最多 N 次。返回 True 表示通过。"""
    now_ts = time.time()
    attempts = LOGIN_ATTEMPTS[ip]
    # 清理 1 分钟前的记录
    while attempts and attempts[0] < now_ts - 60:
        attempts.popleft()
    if len(attempts) >= CONFIG["LOGIN_RATE_LIMIT"]:
        return False
    attempts.append(now_ts)
    return True


def audit_log(user_id: str, action: str, ip: str, ua: str,
              result: str, detail: str = ""):
    """记录审计日志。"""
    AUDIT_LOGS.append({
        "user_id": user_id,
        "action": action,
        "ip": ip,
        "user_agent": ua,
        "result": result,
        "detail": detail,
        "timestamp": datetime.now(),
    })


# ============================================================
# 权限初始化
# ============================================================

def init_rbac():
    """初始化角色和权限。"""
    # 权限
    for code, desc in [
        ("user:read", "查看用户"),
        ("user:write", "管理用户"),
        ("order:read", "查看订单"),
        ("order:write", "创建订单"),
        ("admin:all", "管理员权限"),
    ]:
        PERMISSIONS[code] = {"code": code, "description": desc}

    # 角色
    ROLES["user"] = {"id": "user", "name": "普通用户"}
    ROLES["admin"] = {"id": "admin", "name": "管理员"}

    # 角色-权限
    ROLE_PERMISSIONS["user"] = {"order:read", "order:write"}
    ROLE_PERMISSIONS["admin"] = {"user:read", "user:write", "order:read",
                                 "order:write", "admin:all"}


def assign_role(user_id: str, role_id: str):
    """给用户分配角色。"""
    USER_ROLES[user_id].add(role_id)


def has_permission(user_id: str, perm_code: str) -> bool:
    """检查用户是否有某权限。"""
    for role_id in USER_ROLES.get(user_id, set()):
        if perm_code in ROLE_PERMISSIONS.get(role_id, set()):
            return True
    return False


# ============================================================
# Token 服务
# ============================================================

def issue_access_token(user_id: str) -> str:
    """签发 Access Token。"""
    payload = {
        "sub": user_id,
        "type": "access",
        "jti": str(uuid.uuid4())[:8],
        "iat": int(time.time()),
        "exp": int(time.time()) + CONFIG["ACCESS_TOKEN_EXPIRE"],
    }
    return jwt_encode(payload)


def issue_refresh_token(user_id: str, device_id: str,
                        family_id: str, generation: int) -> str:
    """签发 Refresh Token 并写记录表。"""
    jti = str(uuid.uuid4())[:8]
    payload = {
        "sub": user_id,
        "type": "refresh",
        "family": family_id,
        "gen": generation,
        "device": device_id,
        "jti": jti,
        "iat": int(time.time()),
        "exp": int(time.time()) + CONFIG["REFRESH_TOKEN_EXPIRE"],
    }
    token = jwt_encode(payload)
    REFRESH_TOKENS[jti] = {
        "family_id": family_id,
        "user_id": user_id,
        "device_id": device_id,
        "generation": generation,
        "status": "active",
        "expire_at": datetime.now() + timedelta(seconds=CONFIG["REFRESH_TOKEN_EXPIRE"]),
    }
    return token


# ============================================================
# 设备管理
# ============================================================

def gen_device_id(ua: str, ip: str) -> str:
    return hashlib.sha256(f"{ua}|{ip}".encode()).hexdigest()[:16]


def list_active_devices(user_id: str) -> list:
    devices = [d for (uid, _), d in DEVICES.items()
               if uid == user_id and d["is_active"]]
    devices.sort(key=lambda d: d["login_at"])
    return devices


def kickout_device(user_id: str, device_id: str, reason: str = "manual"):
    key = (user_id, device_id)
    if key in DEVICES:
        DEVICES[key]["is_active"] = False
        DEVICES[key]["kickout_reason"] = reason
    # 把该设备 Token 加黑名单
    for jti, rec in REFRESH_TOKENS.items():
        if rec["user_id"] == user_id and rec["device_id"] == device_id:
            if rec["status"] == "active":
                BLACKLIST[jti] = rec["expire_at"]


# ============================================================
# 认证服务
# ============================================================

def register(username: str, email: str, password: str) -> dict:
    """用户注册。"""
    # 唯一性检查
    for u in USERS.values():
        if u["username"] == username:
            return {"success": False, "error": "用户名已存在"}
        if u["email"] == email:
            return {"success": False, "error": "邮箱已注册"}
    # 密码强度
    ok, msg = check_password_strength(password)
    if not ok:
        return {"success": False, "error": msg}
    # 创建用户
    user_id = str(uuid.uuid4())[:8]
    USERS[user_id] = {
        "id": user_id,
        "username": username,
        "email": email,
        "password_hash": hash_password(password),
        "is_active": True,
        "created_at": datetime.now(),
    }
    # 默认分配普通用户角色
    assign_role(user_id, "user")
    return {"success": True, "user_id": user_id}


def login(username: str, password: str, device_name: str,
          platform: str, ua: str, ip: str) -> dict:
    """登录。"""
    # 1. 限流
    if not rate_limit(ip):
        return {"success": False, "error": "登录尝试过多，请稍后再试"}

    # 2. 查用户
    user = None
    for u in USERS.values():
        if u["username"] == username:
            user = u
            break
    if not user:
        audit_log("", "login", ip, ua, "fail", "user not found")
        return {"success": False, "error": "用户名或密码错误"}

    # 3. 校验密码
    if not verify_password(password, user["password_hash"]):
        audit_log(user["id"], "login", ip, ua, "fail", "wrong password")
        return {"success": False, "error": "用户名或密码错误"}

    # 4. 检查账号状态
    if not user["is_active"]:
        audit_log(user["id"], "login", ip, ua, "fail", "account disabled")
        return {"success": False, "error": "账号已被禁用"}

    # 5. 多设备检查
    device_id = gen_device_id(ua, ip)
    active = list_active_devices(user["id"])
    if len(active) >= CONFIG["MAX_DEVICES"]:
        # FIFO 踢最早
        oldest = active[0]
        kickout_device(user["id"], oldest["device_id"], "fifo")

    # 6. 注册设备
    DEVICES[(user["id"], device_id)] = {
        "device_id": device_id,
        "device_name": device_name,
        "platform": platform,
        "user_agent": ua,
        "ip": ip,
        "is_active": True,
        "login_at": datetime.now(),
        "last_active_at": datetime.now(),
    }

    # 7. 签发 Token
    family_id = str(uuid.uuid4())[:8]
    FAMILIES[family_id] = {"user_id": user["id"], "status": "active"}
    access = issue_access_token(user["id"])
    refresh = issue_refresh_token(user["id"], device_id, family_id, 1)

    # 8. 审计
    audit_log(user["id"], "login", ip, ua, "success", f"device={device_name}")

    return {
        "success": True,
        "access_token": access,
        "refresh_token": refresh,
        "user_id": user["id"],
        "device_id": device_id,
    }


def refresh_token(old_refresh: str) -> dict:
    """Refresh Token 轮换 + 重用检测。"""
    try:
        payload = jwt_decode(old_refresh)
    except ValueError as e:
        return {"success": False, "error": str(e)}

    if payload.get("type") != "refresh":
        return {"success": False, "error": "不是 Refresh Token"}

    jti = payload["jti"]
    family_id = payload["family"]
    gen = payload["gen"]
    user_id = payload["sub"]
    device_id = payload["device"]

    # 黑名单检查
    if jti in BLACKLIST:
        return {"success": False, "error": "Token 已作废"}

    record = REFRESH_TOKENS.get(jti)
    if not record:
        return {"success": False, "error": "Token 不在记录表"}

    # 重用检测
    if record["status"] == "used":
        # 作废整个 family
        for j, r in REFRESH_TOKENS.items():
            if r["family_id"] == family_id:
                r["status"] = "revoked"
                BLACKLIST[j] = r["expire_at"]
        FAMILIES[family_id]["status"] = "revoked"
        audit_log(user_id, "token_reuse", "", "", "alert",
                  f"family={family_id} gen={gen}")
        return {"success": False, "error": "Token 重用，family 已作废"}

    if record["status"] == "revoked":
        return {"success": False, "error": "Token 已作废"}

    # 正常换新
    record["status"] = "used"
    new_access = issue_access_token(user_id)
    new_refresh = issue_refresh_token(user_id, device_id, family_id, gen + 1)
    return {"success": True, "access_token": new_access, "refresh_token": new_refresh}


def get_current_user(token: str) -> dict:
    """从 Access Token 解析当前用户（依赖函数）。"""
    try:
        payload = jwt_decode(token)
    except ValueError as e:
        return {"error": str(e)}

    if payload.get("type") != "access":
        return {"error": "不是 Access Token"}

    if payload["jti"] in BLACKLIST:
        return {"error": "Token 已作废"}

    user = USERS.get(payload["sub"])
    if not user or not user["is_active"]:
        return {"error": "用户不存在或已禁用"}

    return {"user": user}


def require_permission(token: str, perm_code: str) -> dict:
    """检查权限（依赖函数）。"""
    current = get_current_user(token)
    if "error" in current:
        return current
    if not has_permission(current["user"]["id"], perm_code):
        return {"error": f"权限不足：需要 {perm_code}"}
    return current


# ============================================================
# 业务接口（模拟路由）
# ============================================================

def api_create_order(token: str, order_data: dict) -> dict:
    """创建订单：需要 order:write 权限。"""
    auth = require_permission(token, "order:write")
    if "error" in auth:
        return {"success": False, "error": auth["error"]}
    return {"success": True, "order_id": str(uuid.uuid4())[:8],
            "created_by": auth["user"]["username"]}


def api_list_users(token: str) -> dict:
    """列出用户：需要 user:read 权限。"""
    auth = require_permission(token, "user:read")
    if "error" in auth:
        return {"success": False, "error": auth["error"]}
    return {"success": True,
            "users": [{"id": u["id"], "username": u["username"]} for u in USERS.values()]}


# ============================================================
# 演示
# ============================================================

def demo():
    """完整流程演示。"""
    print("=" * 60)
    print("完整企业级认证系统 demo")
    print("=" * 60)

    # 1. 初始化 RBAC
    print("\\n>>> 初始化角色权限")
    init_rbac()

    # 2. 注册两个用户
    print("\\n>>> 注册用户")
    r = register("alice", "alice@example.com", "Password1")
    print(f"  alice 注册: {r}")
    alice_id = r["user_id"]
    r = register("bob", "bob@example.com", "Password2")
    print(f"  bob 注册: {r}")
    bob_id = r["user_id"]

    # 给 alice 升级为管理员
    assign_role(alice_id, "admin")
    print(f"  alice 升级为 admin")

    # 3. 登录
    print("\\n>>> alice 在 iPhone 登录")
    r = login("alice", "Password1", "iPhone 15", "ios",
              "Mozilla/5.0 iPhone", "1.1.1.1")
    print(f"  登录结果: success={r['success']}")
    alice_token = r["access_token"]
    alice_refresh = r["refresh_token"]

    print("\\n>>> bob 在 PC 登录")
    r = login("bob", "Password2", "MacBook", "macos",
              "Mozilla/5.0 Mac", "2.2.2.2")
    print(f"  登录结果: success={r['success']}")
    bob_token = r["access_token"]

    # 4. 业务调用：bob 创建订单（有权限）
    print("\\n>>> bob 创建订单（应该成功）")
    r = api_create_order(bob_token, {"item": "book"})
    print(f"  结果: {r}")

    # 5. bob 尝试列出用户（无权限）
    print("\\n>>> bob 列出用户（应该失败，无 user:read）")
    r = api_list_users(bob_token)
    print(f"  结果: {r}")

    # 6. alice 列出用户（有权限）
    print("\\n>>> alice 列出用户（应该成功，admin）")
    r = api_list_users(alice_token)
    print(f"  结果: {r}")

    # 7. Refresh Token 轮换
    print("\\n>>> alice 刷新 Token")
    r = refresh_token(alice_refresh)
    print(f"  刷新结果: success={r['success']}")
    if r["success"]:
        new_refresh = r["refresh_token"]
        # 重用旧 Token → 触发检测
        print("\\n>>> 攻击者重用 alice 的旧 Refresh Token")
        r = refresh_token(alice_refresh)
        print(f"  结果: {r}")

    # 8. 多设备限制
    print("\\n>>> alice 在第 4 台设备登录（触发 FIFO 踢出）")
    for i, (name, ua) in enumerate([
        ("iPad", "Mozilla/5.0 iPad"),
        ("Watch", "Mozilla/5.0 Watch"),
        ("TV", "Mozilla/5.0 TV"),
    ]):
        r = login("alice", "Password1", name, "ios", ua, f"1.1.1.{i+10}")
        print(f"  {name} 登录: success={r['success']}")

    # 9. 查看设备列表
    print("\\n>>> alice 当前活跃设备")
    for d in list_active_devices(alice_id):
        print(f"  {d['device_name']} ({d['platform']})")

    # 10. 审计日志
    print("\\n>>> 审计日志（最近 10 条）")
    for log in AUDIT_LOGS[-10:]:
        print(f"  [{log['timestamp'].strftime('%H:%M:%S')}] "
              f"user={log['user_id'] or '-':<8} "
              f"action={log['action']:<15} "
              f"result={log['result']}")

    print("\\n" + "=" * 60)
    print("demo 结束")
    print("=" * 60)


if __name__ == "__main__":
    demo()
`,
  },

  // ============================================================
  // 第十九章：安全最佳实践
  // ============================================================
  {
    id: "fa-security-practices",
    group: "第六部分 完整实战",
    icon: "🔒",
    title: "安全最佳实践",
    content: `## 第十九章　安全最佳实践

### 19.1 安全是一个系统，不是一个功能

讲个生活类比：你家安防不是一个"超级锁"能解决的。真正的安保系统包括：

- **门锁**（密码 hash、Token 校验）—— 第一道防线
- **猫眼 + 门禁**（身份认证）—— 确认来人是谁
- **摄像头 + 录像**（审计日志）—— 出事能查
- **保险柜**（敏感数据加密）—— 即使被入侵也拿不到核心
- **保安巡逻**（限流、监控）—— 主动发现异常
- **围墙 + 门禁卡**（CORS、CSRF）—— 控制谁能进来
- **应急预案**（密钥轮换、Token 作废）—— 出事能止损

企业级认证系统的安全也是这样，要"纵深防御"——一层不够，多层叠加。这一章我们过一遍每一层的关键实践。

### 19.2 密码安全

密码是用户认证的根基，密码安全有四件事：**强度、存储、防爆破、找回**。

#### 19.2.1 密码强度策略

\`\`\`text
最低要求：
  - 至少 8 位（推荐 12+）
  - 包含大写、小写、数字、特殊字符中至少 3 类
  - 不允许纯数字、纯字母、常见弱口令（123456、password）

进阶要求：
  - 检查是否在"已泄露密码库"里（HaveIBeenPwned API）
  - 不允许包含用户名、邮箱前缀
  - 不允许与最近 N 次密码相同
\`\`\`

#### 19.2.2 密码存储

**永远不要明文存密码**。要 hash，而且要用专门的密码 hash 算法：

| 算法 | 特点 | 推荐 |
|------|------|------|
| MD5 / SHA1 / SHA256 | 太快，被彩虹表秒破 | ❌ 禁用 |
| bcrypt | 慢 hash，可调成本因子 | ✅ 推荐 |
| argon2 | 现代密码 hash 冠军，抗 GPU | ✅ 强烈推荐 |
| scrypt | 抗 ASIC | ✅ 推荐 |

为什么不能用 SHA256？因为它**太快**。攻击者拿到 hash，每秒能暴力破解几十亿次。bcrypt/argon2 故意做得慢（每次几百毫秒），让暴力破解成本爆炸。

\`\`\`python
# bcrypt 用法
import bcrypt

# hash 密码（自动加盐）
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# 校验密码
ok = bcrypt.checkpw(input_password.encode(), hashed)
\`\`\`

#### 19.2.3 防爆破：登录限流

暴力破解就是"穷举密码"。防爆破的核心是"让攻击者穷举不起"：

- **IP 限流**：单 IP 每分钟最多 5 次登录失败；
- **账号限流**：单账号连续失败 5 次锁定 15 分钟；
- **验证码**：失败 3 次后要求验证码；
- **二次验证**：失败次数过多要求短信/邮箱验证码；
- **异常告警**：同一 IP 大量失败 → 告警。

#### 19.2.4 密码找回

密码找回是认证系统的"软肋"——很多系统密码 hash 做得很好，但找回流程被绕过。要点：

- 找回链接用一次性 Token，用过即作废；
- 链接短命（30 分钟）；
- 找回成功后作废所有现有会话（防止"找回期间被攻击"）；
- 邮箱验证不能只靠"知道邮箱"，要结合其他因素。

### 19.3 Token 安全

#### 19.3.1 密钥轮换

JWT 用密钥签发，密钥泄露 = 整个系统沦陷。密钥轮换策略：

- **多密钥共存**：同时维护 kid1（旧）、kid2（新），校验时两个都试；
- **平滑切换**：先用 kid2 签发新 Token，等旧 Token 全部过期后下线 kid1；
- **定期轮换**：每 3-6 个月换一次；
- **紧急轮换**：怀疑泄露时立即换，作废所有旧 Token。

JWT 头里带 \`kid\`（key id）告诉服务端用哪个密钥校验：

\`\`\`json
{"alg": "HS256", "typ": "JWT", "kid": "key-2026-07"}
\`\`\`

#### 19.3.2 算法选择

| 算法 | 类型 | 适用 |
|------|------|------|
| HS256 | 对称（HMAC） | 单体应用，简单 |
| RS256 | 非对称（RSA） | 微服务、第三方校验 |
| ES256 | 非对称（椭圆曲线） | 现代、性能好 |
| none | 无 | ❌ 永远禁用 |

微服务架构推荐 RS256/ES256：签发用私钥（只在认证中心），校验用公钥（所有服务都有），私钥泄露面最小。

#### 19.3.3 payload 最小化

JWT payload 是 base64，不是加密！任何人都能解码看到内容。所以：

- **不放敏感数据**：不放密码、不放手机号、不放银行卡；
- **不放不必要字段**：越短越好，每个请求都带，浪费带宽；
- **不放长期信息**：Token 短命，信息只放"够用"的。

错误示例：

\`\`\`json
{
  "sub": "user-123",
  "password_hash": "abc...",      ❌
  "phone": "13800000000",         ❌
  "id_card": "110105...",         ❌
  "session_data": "..."           ❌ 太大
}
\`\`\`

正确示例：

\`\`\`json
{
  "sub": "user-123",
  "roles": ["user"],
  "jti": "abc123",
  "iat": 1730000000,
  "exp": 1730000900
}
\`\`\`

### 19.4 HTTPS 与传输安全

**生产必须 HTTPS**，否则 Token 在传输中被嗅探。要点：

- **强制 HTTPS**：HTTP 请求 301 跳转到 HTTPS；
- **HSTS**：告诉浏览器"以后都用 HTTPS"，防止 SSL Strip 攻击；
- **TLS 1.2+**：禁用 TLS 1.0/1.1；
- **证书管理**：用 Let's Encrypt 自动续期；
- **Cookie 安全标志**：\`Secure\`（只 HTTPS）、\`HttpOnly\`（JS 不可读）、\`SameSite\`（防 CSRF）。

### 19.5 CORS 与 CSRF 防护

#### 19.5.1 CORS（跨域资源共享）

CORS 控制"哪些域名可以读你的 API"。错误配置会导致 Token 被盗：

\`\`\`python
# 错误：允许所有来源
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# 正确：白名单
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.com", "https://admin.your-app.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
\`\`\`

注意：\`allow_origins=["*"]\` 和 \`allow_credentials=True\` 不能同时用（浏览器会拒绝）。

#### 19.5.2 CSRF（跨站请求伪造）

CSRF 是"诱导用户在已登录状态下点击恶意链接，借用用户的 Cookie 发请求"。防护：

- **SameSite Cookie**：\`SameSite=Strict\` 或 \`Lax\`，跨站不带 Cookie；
- **CSRF Token**：表单里带服务端发的 Token，提交时校验；
- **检查 Referer/Origin**：拒绝跨域请求；
- **API 用 Bearer Token 而非 Cookie**：Token 不会被自动带上，天然防 CSRF。

FastAPI + JWT 的方案天然防 CSRF（因为 Token 在 Header，不是 Cookie），但如果你用 Cookie 存 Token，就必须做 CSRF 防护。

### 19.6 常见安全漏洞与防范

#### 19.6.1 XSS（跨站脚本）

攻击者注入 JS，盗取用户 Token 或 Cookie。防护：

- **输出转义**：所有用户输入输出时转义 \`<\` \`>\` \`"\`；
- **CSP**：Content-Security-Policy，限制 JS 来源；
- **HttpOnly Cookie**：JS 读不到 Cookie；
- **Token 存内存**：不存 localStorage（XSS 可读），存 JS 变量或 sessionStorage。

#### 19.6.2 SQL 注入

攻击者构造恶意 SQL。防护：

- **永远用参数化查询**，不拼字符串；
- **ORM 默认参数化**（SQLAlchemy、SQLModel）；
- **最小权限**：数据库账号只给必要权限。

\`\`\`python
# 错误：拼接 SQL
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")

# 正确：参数化
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
\`\`\`

#### 19.6.3 暴力破解

见 19.2.3，限流 + 锁定 + 验证码。

#### 19.6.4 越权访问

- **水平越权**：用户 A 访问用户 B 的数据（\`/api/orders/123\`，123 是别人的订单）；
- **垂直越权**：普通用户访问管理员接口。

防护：每个接口都校验"当前用户是否有权访问这个资源"，不能只校验"是否登录"。

\`\`\`python
# 错误：只校验登录
@app.get("/api/orders/{order_id}")
def get_order(order_id: int, user = Depends(get_current_user)):
    return db.get_order(order_id)  # 任何登录用户都能看任何订单！

# 正确：校验归属
@app.get("/api/orders/{order_id}")
def get_order(order_id: int, user = Depends(get_current_user)):
    order = db.get_order(order_id)
    if order.user_id != user.id:
        raise HTTPException(403)
    return order
\`\`\`

### 19.7 安全审计日志

审计日志是"事后追溯"的关键。要记录：

\`\`\`text
时间、用户、操作、IP、User-Agent、设备、结果、详情
\`\`\`

必须审计的事件：

- 登录成功 / 失败
- 登出
- 密码修改 / 找回
- Token 刷新 / 作废
- 权限变更（角色分配、权限授予）
- 敏感数据访问（查看他人订单、导出数据）
- 异常事件（Token 重用、限流触发、越权尝试）

审计日志要点：

- **不可篡改**：写进去就不能改（追加写、WORM 存储）；
- **独立存储**：不和业务数据同一个库，防被一起删；
- **保留足够久**：至少 6 个月，金融行业要求 5 年；
- **可查询**：能按用户、时间、操作类型检索。

### 19.8 密钥管理与配置安全

- **密钥不入代码**：用环境变量或 Vault；
- **配置分环境**：dev / staging / prod 用不同密钥；
- **敏感配置加密**：数据库密码、API Key 加密存储；
- **日志脱敏**：密码、Token、手机号在日志里脱敏（\`138****0000\`）；
- **Git 不传密钥**：.env 加入 .gitignore。

### 19.9 安全检查清单

上线前过一遍：

\`\`\`text
[ ] 密码用 bcrypt/argon2 hash
[ ] JWT 密钥从环境变量读
[ ] HTTPS 强制
[ ] CORS 白名单
[ ] 登录限流
[ ] 审计日志完整
[ ] 敏感字段脱敏
[ ] 越权检查覆盖所有接口
[ ] Refresh Token 轮换 + 重用检测
[ ] 错误信息不泄露内部细节
[ ] 依赖库无已知漏洞（pip-audit）
[ ] 密钥定期轮换机制
\`\`\`

### 19.10 安全测试与渗透测试

安全代码写完后，还要主动"攻击"自己，发现漏洞。这叫渗透测试。

#### 自动化安全扫描

\`\`\`text
工具                  用途
─────────────────────────────────────────────
pip-audit            检查 Python 依赖库已知漏洞
bandit               Python 代码静态安全扫描
safety               依赖漏洞检查
semgrep              多语言代码安全扫描
OWASP ZAP            Web 应用动态扫描
Burp Suite           手动渗透测试利器
nuclei               漏洞模板扫描
\`\`\`

集成到 CI/CD：

\`\`\`yaml
# .github/workflows/security.yml
- name: 依赖漏洞扫描
  run: pip-audit

- name: 代码安全扫描
  run: bandit -r app/ -f json -o bandit-report.json

- name: Semgrep 扫描
  run: semgrep --config=auto app/
\`\`\`

#### 手动测试清单

自动化扫不出来的漏洞，要手动验证：

\`\`\`text
认证类：
  [ ] 密码错误返回是否区分"用户不存在"和"密码错误"（不应该区分）
  [ ] 登录失败次数是否有限制
  [ ] Token 是否能伪造（改 payload 后签名校验是否拦截）
  [ ] 过期 Token 是否真的不能用
  [ ] 被踢出的设备 Token 是否立即失效

授权类：
  [ ] 普通用户能否访问管理员接口
  [ ] 用户 A 能否访问用户 B 的订单（水平越权）
  [ ] 修改请求体里的 user_id 能否冒充他人

注入类：
  [ ] 用户名输入 ' OR 1=1 -- 是否能绕过登录
  [ ] 搜索框输入 <script> 是否会执行（XSS）
  [ ] URL 参数是否能路径穿越（../../etc/passwd）

传输类：
  [ ] HTTP 是否强制跳转 HTTPS
  [ ] Cookie 是否带 Secure 标志
  [ ] CORS 是否能被任意域名利用
\`\`\`

#### Bug Bounty（漏洞赏金）

大型项目可以开放"漏洞赏金"：

- 邀请白帽子攻击你的系统；
- 发现漏洞给奖金；
- HackerOne、Bugcrowd 是知名平台。

这是"用社区力量做安全"的有效方式。

### 19.11 安全事件响应

即使做了所有防护，仍可能被攻破。要有"应急响应"预案：

#### 响应流程

\`\`\`text
1. 发现（监控告警 / 用户报告 / 第三方通报）
   ↓
2. 确认（是否真的是安全事件，影响范围）
   ↓
3. 止损（下线受影响服务、作废 Token、封锁 IP）
   ↓
4. 取证（保留日志、快照、确定攻击路径）
   ↓
5. 修复（修补漏洞、加强防护）
   ↓
6. 复盘（写事故报告、改进流程）
   ↓
7. 通告（告知用户、监管，必要时公开）
\`\`\`

#### 止损手段

| 场景 | 止损动作 |
|------|---------|
| Token 密钥泄露 | 紧急轮换密钥，作废所有 Token |
| 数据库被拖 | 切断外网、改所有密码、通知用户 |
| 某用户被盗 | 作废该用户所有 Token、强制改密 |
| 暴力破解攻击 | 封禁攻击 IP、临时加验证码 |
| 内部员工作恶 | 封禁账号、审计日志取证 |

### 19.12 本章小结

安全是"纵深防御"：单层不够，多层叠加。密码、Token、传输、跨域、防爆破、审计……每一层都要做好，任何一层疏漏都可能被攻破。

最后一章我们做全书总结，并展望进阶方向。`,

    code: `"""
第十九章 demo：安全中间件
目标：实现限流、审计日志、CORS、密码强度检查等安全组件。

纯 Python 模拟，方便理解原理。
"""
import hashlib
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta


# ============================================================
# 1. 限流中间件（滑动窗口 + 令牌桶）
# ============================================================

class RateLimiter:
    """滑动窗口限流器。

    每个 key（如 IP、user_id）独立计数。
    在 window_seconds 内最多允许 max_requests 次。
    """

    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        # key -> deque[timestamp]
        self.records = defaultdict(deque)

    def check(self, key: str) -> tuple:
        """检查是否允许。返回 (allowed, retry_after_seconds)。"""
        now = time.time()
        records = self.records[key]
        # 清理过期记录
        while records and records[0] < now - self.window:
            records.popleft()
        if len(records) >= self.max_requests:
            # 计算还要等多久
            retry_after = int(records[0] + self.window - now) + 1
            return False, retry_after
        records.append(now)
        return True, 0


# ============================================================
# 2. 审计日志中间件
# ============================================================

class AuditLogger:
    """审计日志记录器。

    所有操作都记录，支持按用户、时间、操作类型查询。
    生产环境会写到独立的日志系统（ELK、Splunk）。
    """

    def __init__(self):
        self.logs = []

    def log(self, user_id: str, action: str, ip: str, ua: str,
            result: str, detail: str = ""):
        """记录一条审计日志。"""
        entry = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now(),
            "user_id": user_id,
            "action": action,
            "ip": ip,
            "user_agent": ua,
            "result": result,  # success / fail / alert
            "detail": detail,
        }
        self.logs.append(entry)
        # 实时打印（生产会写文件/发到日志中心）
        ts = entry["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        print(f"  [AUDIT] {ts} user={user_id or '-':<8} "
              f"action={action:<18} ip={ip:<15} result={result}")

    def query(self, user_id: str = None, action: str = None,
              result: str = None, last_n: int = 10) -> list:
        """查询审计日志。"""
        filtered = self.logs
        if user_id:
            filtered = [l for l in filtered if l["user_id"] == user_id]
        if action:
            filtered = [l for l in filtered if l["action"] == action]
        if result:
            filtered = [l for l in filtered if l["result"] == result]
        return filtered[-last_n:]


# ============================================================
# 3. CORS 中间件
# ============================================================

class CORSConfig:
    """CORS 配置。"""

    def __init__(self, allowed_origins: list, allowed_methods: list,
                 allowed_headers: list, allow_credentials: bool = True):
        self.allowed_origins = set(allowed_origins)
        self.allowed_methods = allowed_methods
        self.allowed_headers = allowed_headers
        self.allow_credentials = allow_credentials

    def check_origin(self, origin: str) -> bool:
        """检查 Origin 是否允许。"""
        if "*" in self.allowed_origins:
            # 注意：allow_credentials=True 时不能用 *
            if self.allow_credentials:
                return False
            return True
        return origin in self.allowed_origins

    def build_headers(self, origin: str) -> dict:
        """构建响应头。"""
        if not self.check_origin(origin):
            return {}
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": ", ".join(self.allowed_methods),
            "Access-Control-Allow-Headers": ", ".join(self.allowed_headers),
        }
        if self.allow_credentials:
            headers["Access-Control-Allow-Credentials"] = "true"
        return headers


# ============================================================
# 4. 密码强度检查
# ============================================================

class PasswordPolicy:
    """密码强度策略。"""

    # 常见弱口令黑名单（实际会用大字典）
    WEAK_PASSWORDS = {
        "123456", "password", "12345678", "qwerty", "abc123",
        "111111", "123123", "admin", "letmein", "welcome",
    }

    @classmethod
    def check(cls, password: str, username: str = "") -> tuple:
        """检查密码强度。返回 (ok, message)。"""
        # 1. 长度
        if len(password) < 8:
            return False, "密码至少 8 位"
        # 2. 复杂度：大写、小写、数字 至少 3 类
        categories = 0
        if any(c.isupper() for c in password): categories += 1
        if any(c.islower() for c in password): categories += 1
        if any(c.isdigit() for c in password): categories += 1
        if any(not c.isalnum() for c in password): categories += 1
        if categories < 3:
            return False, f"密码复杂度不足（{categories}/4 类），需至少 3 类"
        # 3. 弱口令黑名单
        if password.lower() in cls.WEAK_PASSWORDS:
            return False, "密码过于常见，请更换"
        # 4. 不能包含用户名
        if username and username.lower() in password.lower():
            return False, "密码不能包含用户名"
        return True, "ok"


# ============================================================
# 5. 密码 hash（模拟 bcrypt）
# ============================================================

class PasswordHasher:
    """密码 hash（演示用 sha256 + salt，生产用 bcrypt/argon2）。"""

    ROUNDS = 12  # 模拟 bcrypt 的成本因子

    @classmethod
    def hash(cls, password: str) -> str:
        """hash 密码。"""
        salt = uuid.uuid4().hex[:16]
        # 模拟"慢 hash"：多轮迭代
        hashed = password + salt
        for _ in range(2 ** cls.ROUNDS // 1000):  # 演示用，减少迭代次数
            hashed = hashlib.sha256(hashed.encode()).hexdigest()
        return f"$demo\${salt}\${hashed}"

    @classmethod
    def verify(cls, password: str, hashed: str) -> bool:
        """校验密码。"""
        if not hashed.startswith("$demo$"):
            return False
        parts = hashed.split("$")
        salt = parts[2]
        expected = parts[3]
        computed = password + salt
        for _ in range(2 ** cls.ROUNDS // 1000):
            computed = hashlib.sha256(computed.encode()).hexdigest()
        return computed == expected


# ============================================================
# 6. 敏感数据脱敏
# ============================================================

def mask_sensitive(data: str, mask_type: str = "default") -> str:
    """敏感数据脱敏。

    mask_type:
        phone:  138****0000
        email:  a***@example.com
        token:  abcd****
        default: ****
    """
    if not data:
        return ""
    if mask_type == "phone" and len(data) >= 11:
        return f"{data[:3]}****{data[-4:]}"
    if mask_type == "email" and "@" in data:
        name, domain = data.split("@", 1)
        if len(name) > 1:
            return f"{name[0]}***@{domain}"
        return f"***@{domain}"
    if mask_type == "token" and len(data) > 8:
        return f"{data[:4]}****{data[-4:]}"
    return "****"


# ============================================================
# 7. 综合安全中间件
# ============================================================

class SecurityMiddleware:
    """组合所有安全组件的中间件。"""

    def __init__(self):
        self.rate_limiter = RateLimiter(max_requests=5, window_seconds=60)
        self.audit = AuditLogger()
        self.cors = CORSConfig(
            allowed_origins=["https://app.example.com", "https://admin.example.com"],
            allowed_methods=["GET", "POST", "PUT", "DELETE"],
            allowed_headers=["Authorization", "Content-Type"],
            allow_credentials=True,
        )

    def pre_request(self, ip: str, ua: str, origin: str,
                    user_id: str = "", action: str = "") -> dict:
        """请求前置检查。返回 {allowed, reason, headers}。"""
        # 1. CORS 检查
        if origin and not self.cors.check_origin(origin):
            self.audit.log(user_id, "cors_blocked", ip, ua, "fail", f"origin={origin}")
            return {"allowed": False, "reason": "CORS 拒绝", "headers": {}}

        # 2. 限流
        allowed, retry = self.rate_limiter.check(ip)
        if not allowed:
            self.audit.log(user_id, "rate_limited", ip, ua, "fail",
                           f"retry_after={retry}s")
            return {"allowed": False, "reason": f"请求过频，{retry}s 后重试",
                    "headers": {}, "retry_after": retry}

        return {"allowed": True, "headers": self.cors.build_headers(origin)}

    def post_request(self, user_id: str, action: str, ip: str, ua: str,
                     result: str, detail: str = ""):
        """请求后置记录。"""
        self.audit.log(user_id, action, ip, ua, result, detail)


# ============================================================
# 演示
# ============================================================

def demo():
    """完整安全中间件演示。"""
    print("=" * 60)
    print("安全中间件 demo")
    print("=" * 60)

    mw = SecurityMiddleware()

    # ---- 1. 密码强度检查 ----
    print("\\n>>> 场景 1：密码强度检查")
    test_passwords = [
        ("123", "alice"),
        ("password", "alice"),
        ("Password1", "alice"),
        ("Alice123456", "alice"),  # 包含用户名
        ("Str0ng!Pass", "alice"),
    ]
    for pwd, user in test_passwords:
        ok, msg = PasswordPolicy.check(pwd, user)
        print(f"  {pwd:<20} → ok={ok}, msg={msg}")

    # ---- 2. 密码 hash 与校验 ----
    print("\\n>>> 场景 2：密码 hash 与校验")
    pwd = "MyStr0ng!Pass"
    hashed = PasswordHasher.hash(pwd)
    print(f"  原始密码: {pwd}")
    print(f"  hash: {hashed[:40]}...")
    print(f"  校验正确密码: {PasswordHasher.verify(pwd, hashed)}")
    print(f"  校验错误密码: {PasswordHasher.verify('wrong', hashed)}")

    # ---- 3. 限流 ----
    print("\\n>>> 场景 3：登录限流（同一 IP 6 次尝试）")
    for i in range(6):
        allowed, retry = mw.rate_limiter.check("1.2.3.4")
        print(f"  第 {i+1} 次请求: allowed={allowed}" +
              (f" retry_after={retry}s" if not allowed else ""))

    # ---- 4. CORS ----
    print("\\n>>> 场景 4：CORS 检查")
    origins = [
        "https://app.example.com",       # 允许
        "https://evil.com",              # 拒绝
        "https://admin.example.com",     # 允许
    ]
    for origin in origins:
        ok = mw.cors.check_origin(origin)
        print(f"  Origin: {origin:<35} → {'允许' if ok else '拒绝'}")

    # ---- 5. 敏感数据脱敏 ----
    print("\\n>>> 场景 5：敏感数据脱敏")
    samples = [
        ("13812345678", "phone"),
        ("alice@example.com", "email"),
        ("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature", "token"),
    ]
    for data, t in samples:
        masked = mask_sensitive(data, t)
        print(f"  {t:<8} {data[:40]:<40} → {masked}")

    # ---- 6. 综合请求流程 ----
    print("\\n>>> 场景 6：综合请求流程（限流 + CORS + 审计）")
    # 模拟一个正常请求
    print("  请求 1：正常请求")
    r = mw.pre_request("5.5.5.5", "Mozilla/5.0", "https://app.example.com",
                       user_id="user-1", action="login")
    print(f"    pre_request: allowed={r['allowed']}")
    if r["allowed"]:
        mw.post_request("user-1", "login", "5.5.5.5", "Mozilla/5.0",
                        "success", "登录成功")

    # 模拟一个跨域请求
    print("\\n  请求 2：跨域请求（应被拒绝）")
    r = mw.pre_request("5.5.5.6", "Mozilla/5.0", "https://evil.com",
                       user_id="", action="login")
    print(f"    pre_request: allowed={r['allowed']}, reason={r.get('reason')}")

    # ---- 7. 查看审计日志 ----
    print("\\n>>> 场景 7：审计日志查询")
    print(f"  最近 5 条日志：")
    for log in mw.audit.query(last_n=5):
        ts = log["timestamp"].strftime("%H:%M:%S")
        print(f"    [{ts}] {log['action']:<18} "
              f"user={log['user_id'] or '-':<8} result={log['result']}")

    print("\\n" + "=" * 60)
    print("demo 结束")
    print("=" * 60)


if __name__ == "__main__":
    demo()
`,
  },

  // ============================================================
  // 第二十章：总结与进阶展望
  // ============================================================
  {
    id: "fa-summary",
    group: "第六部分 完整实战",
    icon: "🎯",
    title: "总结与进阶展望",
    content: `## 第二十章　总结与进阶展望

### 20.1 全书知识图谱

我们从第一章到这里，走完了 FastAPI 企业级认证与授权的完整旅程。把所有知识点串成一张图：

\`\`\`text
                        FastAPI 认证与授权
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   基础认证              授权体系                高级方案
        │                     │                     │
   ├─ HTTP 基本认证      ├─ RBAC（角色）        ├─ OAuth2
   ├─ Session/Cookie     ├─ ABAC（属性）        ├─ 多设备管理
   ├─ Bearer Token       ├─ 权限继承            ├─ Token 轮换
   ├─ JWT 原理           └─ 动态权限            ├─ 滑动过期
   └─ 密码 hash                                └─ 重用检测

                        安全与运维
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   传输安全              防护策略                可观测性
        │                     │                     │
   ├─ HTTPS              ├─ 限流                ├─ 审计日志
   ├─ CORS               ├─ 防爆破              ├─ 监控告警
   ├─ CSRF               ├─ 越权检查            └─ 错误追踪
   └─ HSTS               └─ XSS/SQL 注入
\`\`\`

### 20.2 各认证方案适用场景对比

我们讲过多种认证方案，每种都有适用场景：

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| Session + Cookie | 传统 Web 应用、SSR | 简单、服务端可控 | 难扩展、需粘性会话 |
| Bearer Token (JWT) | SPA、移动端、API | 无状态、易扩展 | 难主动失效 |
| OAuth2 密码模式 | 第一方 App | 标准化 | 已不推荐（OAuth2.1 废弃） |
| OAuth2 授权码 | 第三方接入、SSO | 安全、标准 | 流程复杂 |
| OIDC | 单点登录、身份联合 | 基于 OAuth2 + 身份层 | 实现门槛高 |
| API Key | 服务间调用、开放 API | 简单 | 难细粒度授权 |

选型口诀：

- **自家 App**：JWT（Access + Refresh）+ RBAC；
- **第三方接入**：OAuth2 授权码 + PKCE；
- **企业内部 SSO**：OIDC；
- **服务间调用**：mTLS 或 API Key；
- **开放 API**：API Key + 限流 + 配额。

### 20.3 核心原则回顾

整本书反复出现几条原则，记住了就能应对 80% 的场景：

#### 原则 1：纵深防御

单层防护永远不够。密码 hash + 限流 + 审计 + Token 作废，多层叠加，任何一层被突破都不至于全军覆没。

#### 原则 2：最小权限

默认拒绝，按需授予。用户只拿到完成任务所需的最小权限，权限能回收就回收。Token payload 最小化，不放无关数据。

#### 原则 3：默认安全

默认值要安全，而不是方便。密码默认要强，Token 默认要短命，CORS 默认要白名单，错误默认要脱敏。

#### 原则 4：可审计

所有关键操作留痕。出事能查、能溯源、能定责。审计日志独立存储、不可篡改、保留足够久。

#### 原则 5：失败安全

失败时倾向于"拒绝"而不是"放行"。Token 校验失败 → 拒绝访问；权限检查异常 → 拒绝；限流触发 → 拒绝。宁可错杀，不可放过。

### 20.4 进阶方向一：SSO 单点登录

SSO（Single Sign-On）是企业级认证的高阶能力：用户登录一次，就能访问所有相互信任的系统。

#### SSO 的价值

- 用户只记一套账号密码；
- 一次登录，到处可用；
- 集中管理用户、权限、安全策略；
- 离职一键禁用所有系统访问。

#### SSO 的实现方式

- **CAS**：经典方案，Yale 大学开源，流程基于 Ticket；
- **OIDC**：现代方案，基于 OAuth2，主流选择；
- **SAML**：企业级标准，XML 格式，老牌系统常用；
- **自研**：基于 JWT + 共享认证中心。

#### OIDC 单点登录流程

\`\`\`text
1. 用户访问应用 A，未登录
2. 跳转到认证中心（IdP），用户在 IdP 登录
3. IdP 签发 ID Token + Access Token，回调应用 A
4. 应用 A 验证 Token，建立本地会话
5. 用户访问应用 B，跳转到 IdP
6. IdP 检测到已登录，直接回调应用 B 带 Token
7. 应用 B 验证 Token，建立本地会话
8. 用户在 A、B 之间无缝切换
\`\`\`

### 20.5 进阶方向二：OAuth2 第三方授权

OAuth2 解决"第三方应用访问用户数据"的问题。例如：

- 用 GitHub 账号登录某网站；
- 某 App 申请访问你的 Google 联系人；
- 第三方客户端访问你的 GitHub 仓库。

#### OAuth2 的核心概念

- **Resource Owner**：用户（资源的所有者）；
- **Client**：第三方应用；
- **Authorization Server**：认证服务器（如 GitHub）；
- **Resource Server**：资源服务器（存用户数据）；
- **Authorization Code**：授权码，一次性、短命；
- **Access Token**：访问令牌，Client 用来访问资源。

#### 授权码 + PKCE 流程（推荐）

\`\`\`text
1. Client 生成 code_verifier 和 code_challenge
2. 跳转到 Authorization Server，带 code_challenge
3. 用户登录并授权
4. Authorization Server 回调 Client，带 authorization_code
5. Client 用 code + code_verifier 换 access_token
6. Client 用 access_token 访问 Resource Server
\`\`\`

PKCE（Proof Key for Code Exchange）是为了防止授权码被截获，移动端和 SPA 必须用。

### 20.6 进阶方向三：OIDC（OpenID Connect）

OIDC 是 OAuth2 的"身份层扩展"。OAuth2 解决"授权"（你能访问什么），OIDC 解决"认证"（你是谁）。

OIDC 在 OAuth2 基础上加了一个 \`ID Token\`，是一个 JWT，包含用户身份信息：

\`\`\`json
{
  "iss": "https://idp.example.com",
  "sub": "user-123",
  "aud": "client-app",
  "exp": 1730000900,
  "iat": 1730000000,
  "email": "alice@example.com",
  "name": "Alice",
  "picture": "https://..."
}
\`\`\`

OIDC 是现代 SSO 的事实标准，Keycloak、Auth0、Okta 都基于它。

### 20.7 进阶方向四：微服务架构下的认证

微服务架构下，认证变得复杂：

- 用户认证在网关做，还是每个服务自己做？
- 服务之间怎么互信？
- Token 怎么在服务间传递？

#### 网关鉴权模式

\`\`\`text
客户端 → API 网关（鉴权）→ 内部服务（信任网关）
\`\`\`

网关统一鉴权，内部服务信任网关传来的"已认证用户"。优点是简单，缺点是单点故障。

#### 服务间认证（mTLS / JWT）

- **mTLS**：服务间双向 TLS，证书认证身份；
- **JWT 传递**：用户 Token 在服务间透传，每个服务自己校验；
- **服务账号**：每个服务有自己的身份（service account），用独立 Token。

#### 零信任架构

零信任的核心是"永不信任，始终验证"：

- 不因为请求来自内网就信任；
- 每个服务调用都校验身份和权限；
- Token 短命、最小权限、全程加密。

### 20.8 FastAPI 认证生态的最新发展

FastAPI 的认证生态在快速演进：

#### FastAPI 官方

- **OAuth2PasswordBearer**：内置，密码流；
- **HTTPBearer**：内置，Bearer Token；
- **HTTPBasic**：内置，基本认证；
- **Security 工具**：\`Depends(Security(...))\` 支持 scopes。

#### 第三方库

- **fastapi-jwt-auth**：JWT 集成（已较久未更新）；
- **fastapi-users**：完整的用户管理；
- **fastapi-security**：安全工具集；
- **fastapi-azure-auth**：Azure AD 集成；
- **authlib**：完整的 OAuth2/OIDC 实现，推荐；
- **fastapi-keycloak-auth**：Keycloak 集成。

#### 趋势

- **OAuth2.1**：合并简化各种 flow，废弃隐式和密码模式；
- **Token Binding**：Token 与 TLS 通道绑定；
- **DPoP**：Demonstrating Proof-of-Possession，Token 与客户端密钥绑定；
- **WebAuthn / Passkey**：基于公钥的无密码认证，未来趋势。

### 20.9 一个综合认证系统配置模板

把全书的最佳实践浓缩成一个配置模板（下一节代码里会展示）：

\`\`\`text
- 密码：argon2 / bcrypt，强度策略
- Token：JWT RS256，Access 15min + Refresh 7d
- Refresh：轮换 + 重用检测 + Token 家族
- 设备：多设备管理 + 上限 + 踢出
- 权限：RBAC + ABAC 混合
- 传输：HTTPS + HSTS
- 跨域：CORS 白名单
- 防护：限流 + 防爆破 + 越权检查
- 审计：完整审计日志
- 密钥：环境变量 + 定期轮换
\`\`\`

### 20.10 持续学习的资源

认证与授权是不断演进的领域，要保持学习：

- **RFC 文档**：RFC 6749（OAuth2）、RFC 7519（JWT）、RFC 8252（OAuth2 for Native Apps）；
- **OWASP**：Web 安全权威指南，Authentication Cheat Sheet；
- **Auth0 博客**：认证领域最活跃的技术博客之一；
- **FastAPI 官方文档**：Security 章节持续更新；
- **Keycloak 文档**：开源 IAM，看它的设计能学到很多。

### 20.11 学习路径建议

读完这本书只是起点。认证与授权是个深坑，要持续精进。建议的学习路径：

#### 阶段 1：巩固基础（1-2 个月）

- 把这本书的所有 demo 跑一遍，理解每个机制；
- 用 FastAPI 实现一个完整的认证系统（注册、登录、刷新、登出、权限）；
- 阅读 JWT、OAuth2 的 RFC 原文，理解协议细节；
- 读 OWASP Authentication Cheat Sheet。

#### 阶段 2：扩展视野（2-3 个月）

- 学习 Keycloak / Auth0 等成熟 IAM 产品，看它们怎么设计；
- 实践 OAuth2 授权码 + PKCE 流程（用 GitHub 登录自己的 App）；
- 实践 OIDC 单点登录（部署一个 Keycloak，接入两个应用）；
- 学习 mTLS、服务网格下的认证（Istio、Linkerd）。

#### 阶段 3：深入前沿（持续）

- 关注 WebAuthn / Passkey（无密码认证的未来）；
- 研究 DPoP、Token Binding 等新机制；
- 读 Auth0、Okta 的技术博客；
- 参与安全社区（DEF CON、Black Hat 议题）。

#### 推荐书单

\`\`\`text
《Web 安全深度剖析》         —— 国内 Web 安全入门
《白帽子讲 Web 安全》         —— 吴翰清，经典
《OAuth2 in Action》         —— OAuth2 实战
《API Security in Action》   —— API 安全实战
《HTTP 权威指南》            —— HTTP 协议 bible
\`\`\`

### 20.12 常见面试题速查

认证与授权是后端面试的高频考点，这里列一些常见问题：

\`\`\`text
Q: JWT 和 Session 的区别？各自适用场景？
A: JWT 无状态、自包含、易扩展，适合微服务、移动端；
   Session 有状态、服务端可控、易失效，适合传统 Web。

Q: Refresh Token 为什么要轮换？
A: 长寿 Refresh Token 泄露风险大，轮换让每个 Token 只用一次，
   被盗用能通过"重用检测"发现。

Q: OAuth2 的四种授权流程分别适合什么场景？
A: 授权码：Web 应用（最常用）；
   授权码 + PKCE：SPA、移动端；
   客户端凭证：服务间调用；
   密码模式：已废弃（OAuth2.1）；
   隐式：已废弃。

Q: 如何防止 CSRF？
A: SameSite Cookie + CSRF Token + 检查 Referer；
   API 用 Bearer Token 天然防 CSRF。

Q: RBAC 和 ABAC 的区别？
A: RBAC 基于角色，粗粒度，简单；
   ABAC 基于属性，细粒度，灵活；
   生产常混合使用。

Q: 如何设计一个"最多 3 台设备同时在线"的功能？
A: 设备指纹 + 设备表 + 登录时检查设备数 + FIFO 踢出最早。
\`\`\`

### 20.13 写在最后

认证与授权看起来是"技术问题"，本质是"信任问题"——

- 怎么相信"你声称是你"（认证）；
- 怎么相信"你能做这件事"（授权）；
- 怎么在"方便"和"安全"之间找平衡（体验与风险）。

这本书给你的是一套"工具箱"，但怎么用、用多严，要看你的业务。一个内部工具和一个金融系统，安全要求天差地别。没有"银弹"，只有"合适的方案"。

希望这本书让你在面对认证需求时，不再只会"用户名密码 + JWT"，而是能从业务出发，权衡各种方案，做出适合自己系统的设计。

### 20.14 全书结束

到这里，FastAPI 企业级认证与授权教程就结束了。我们从最基础的 HTTP 认证讲起，一路走到 JWT、OAuth2、RBAC、多设备、Token 轮换、安全实践、完整系统整合。

记住核心三句话：

> 1. **认证是验证身份，授权是控制访问，二者不能混为一谈。**
> 2. **安全是纵深防御，不是一招制敌。**
> 3. **没有最安全的方案，只有最合适的方案。**

祝你在 FastAPI 的认证之路上，写得稳、守得住、放得开。下一本书再见。`,

    code: `"""
第二十章 demo：综合认证系统配置模板
目标：把全书最佳实践浓缩成一个可运行的配置中心，作为生产系统的起点。

这个 demo 不是一个能跑起来的"系统"，而是一份"配置模板"，
演示如何把所有安全策略、Token 策略、权限策略集中管理。

运行后会打印完整的配置，方便作为生产系统的对照清单。
"""
import json
from datetime import timedelta


# ============================================================
# 1. 密码策略配置
# ============================================================

PASSWORD_POLICY = {
    # 最小长度
    "min_length": 12,
    # 最大长度（防 DoS）
    "max_length": 128,
    # 复杂度要求（true=必须满足）
    "require_uppercase": True,      # 必须有大写
    "require_lowercase": True,      # 必须有小写
    "require_digit": True,          # 必须有数字
    "require_special": False,       # 是否必须特殊字符（争议项）
    # 至少满足以上几类（推荐 3）
    "min_categories": 3,
    # hash 算法
    "hash_algorithm": "argon2id",   # argon2id / bcrypt / scrypt
    "argon2_params": {
        "time_cost": 3,             # 迭代次数
        "memory_cost": 65536,       # 内存（KB）
        "parallelism": 4,           # 并行度
    },
    "bcrypt_rounds": 12,
    # 密码历史（不能与最近 N 次相同）
    "history_count": 5,
    # 弱口令检查
    "check_breached_password": True,    # 查 HaveIBeenPwned
    "check_common_passwords": True,     # 查本地黑名单
    # 密码有效期（天，0=永不过期）
    "max_age_days": 90,
    # 提前提醒天数
    "warn_before_days": 7,
}


# ============================================================
# 2. Token 策略配置
# ============================================================

TOKEN_POLICY = {
    # JWT 算法（生产推荐 RS256 / ES256）
    "algorithm": "RS256",
    # 密钥配置
    "keys": {
        # 多 kid 共存，支持平滑轮换
        "active_kid": "key-2026-07",
        "keys": {
            "key-2026-07": {"type": "rsa", "public": "...", "private": "..."},
            "key-2026-01": {"type": "rsa", "public": "...", "private": "..."},
        },
    },
    # Access Token
    "access_token": {
        "expire_seconds": 900,           # 15 分钟
        "issuer": "https://auth.example.com",
        "audience": ["api.example.com"],
        "payload_fields": ["sub", "roles", "jti", "iat", "exp", "iss", "aud"],
        # 不放的字段
        "forbidden_fields": ["password", "email", "phone", "id_card"],
    },
    # Refresh Token
    "refresh_token": {
        "expire_seconds": 7 * 86400,     # 7 天
        # 一次性使用 + 轮换
        "rotate": True,
        "reuse_detection": True,
        # Token 家族
        "family_max_lifetime_seconds": 30 * 86400,  # 家族最长 30 天
    },
    # 黑名单
    "blacklist": {
        "storage": "redis",
        "key_prefix": "bl:",
        # 黑名单条目过期后自动清理
        "auto_cleanup": True,
    },
}


# ============================================================
# 3. 设备管理配置
# ============================================================

DEVICE_POLICY = {
    # 每用户最大设备数
    "max_devices_per_user": {
        "default": 3,
        "premium": 5,
        "enterprise": 20,
    },
    # 超限策略
    "exceed_strategy": "fifo",   # fifo / reject
    # 设备指纹来源
    "fingerprint_sources": ["user_agent", "ip", "client_hint"],
    # 设备记录保留时长（天）
    "retain_days": 90,
    # 不活跃设备自动下线（天）
    "inactive_threshold_days": 30,
}


# ============================================================
# 4. 权限策略配置
# ============================================================

AUTHZ_POLICY = {
    # 模式：rbac / abac / hybrid
    "mode": "hybrid",
    # RBAC 配置
    "rbac": {
        "roles": ["user", "premium", "admin", "super_admin"],
        # 角色继承：admin 继承 user 的权限
        "inheritance": {
            "super_admin": ["admin"],
            "admin": ["premium"],
            "premium": ["user"],
        },
    },
    # ABAC 配置
    "abac": {
        # 属性来源
        "attribute_sources": ["user", "resource", "environment"],
        # 示例规则：用户只能访问自己的订单
        "rules": [
            {"effect": "allow", "condition": "resource.owner_id == subject.id"},
        ],
    },
    # 默认策略：拒绝
    "default_effect": "deny",
}


# ============================================================
# 5. 传输安全配置
# ============================================================

TRANSPORT_SECURITY = {
    # HTTPS 强制
    "force_https": True,
    # HSTS
    "hsts": {
        "enabled": True,
        "max_age": 31536000,        # 1 年
        "include_subdomains": True,
        "preload": True,
    },
    # TLS
    "tls": {
        "min_version": "1.2",
        "preferred_version": "1.3",
        "cipher_suites": "modern",
    },
    # Cookie 安全
    "cookie": {
        "secure": True,             # 只 HTTPS
        "httponly": True,           # JS 不可读
        "samesite": "lax",          # 防 CSRF
    },
    # CORS
    "cors": {
        "allowed_origins": [
            "https://app.example.com",
            "https://admin.example.com",
        ],
        "allowed_methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
        "allowed_headers": ["Authorization", "Content-Type", "X-Request-Id"],
        "allow_credentials": True,
        "max_age": 3600,
    },
}


# ============================================================
# 6. 防护策略配置
# ============================================================

PROTECTION_POLICY = {
    # 限流
    "rate_limit": {
        "login": {"max": 5, "window": 60, "per": "ip"},          # 每 IP 每分钟 5 次
        "refresh": {"max": 10, "window": 60, "per": "user"},
        "api": {"max": 100, "window": 60, "per": "user"},
    },
    # 账号锁定
    "account_lockout": {
        "max_failures": 5,
        "lock_duration_seconds": 900,    # 锁 15 分钟
        "require_reset": False,          # 是否需要管理员解锁
    },
    # 验证码
    "captcha": {
        "trigger_after_failures": 3,
        "type": "recaptcha_v3",
    },
    # 二次验证（2FA）
    "two_factor": {
        "enabled": True,
        "methods": ["totp", "sms"],
        "required_for_roles": ["admin", "super_admin"],
    },
    # 越权检查
    "authorization_check": {
        "check_ownership": True,         # 检查资源归属
        "check_role_hierarchy": True,
    },
}


# ============================================================
# 7. 审计日志配置
# ============================================================

AUDIT_POLICY = {
    # 存储
    "storage": {
        "type": "elasticsearch",
        "index_pattern": "audit-logs-{date}",
        "retention_days": 180,           # 保留 6 个月
    },
    # 必须审计的事件
    "events": [
        "login_success", "login_failure", "logout",
        "password_change", "password_reset",
        "token_refresh", "token_revoke", "token_reuse_detected",
        "role_assign", "role_revoke",
        "permission_grant", "permission_deny",
        "device_kickout", "device_limit_exceeded",
        "rate_limited", "account_locked",
    ],
    # 敏感字段脱敏
    "mask_fields": ["password", "token", "secret", "api_key", "phone", "email"],
    # 告警规则
    "alerts": {
        "token_reuse": "critical",       # Token 重用 → 严重告警
        "login_failures_5min": "warning",
        "rate_limit_triggered": "info",
    },
}


# ============================================================
# 8. 密钥管理配置
# ============================================================

KEY_MANAGEMENT = {
    # 密钥来源
    "source": "vault",                   # vault / aws_kms / env
    # JWT 签名密钥
    "jwt_signing_keys": {
        "rotation_days": 90,             # 90 天轮换
        "overlap_days": 7,               # 新旧共存 7 天
    },
    # 数据库加密密钥
    "database_encryption_key": {
        "rotation_days": 180,
    },
    # Cookie 签名密钥
    "cookie_signing_key": {
        "rotation_days": 30,
    },
}


# ============================================================
# 9. 综合配置导出
# ============================================================

FULL_CONFIG = {
    "password_policy": PASSWORD_POLICY,
    "token_policy": TOKEN_POLICY,
    "device_policy": DEVICE_POLICY,
    "authz_policy": AUTHZ_POLICY,
    "transport_security": TRANSPORT_SECURITY,
    "protection_policy": PROTECTION_POLICY,
    "audit_policy": AUDIT_POLICY,
    "key_management": KEY_MANAGEMENT,
}


# ============================================================
# 演示
# ============================================================

def demo():
    """打印综合配置模板，作为生产系统的对照清单。"""
    print("=" * 70)
    print("综合认证系统配置模板")
    print("（这是生产系统的对照清单，每一项都要根据业务调整）")
    print("=" * 70)

    # 1. 密码策略
    print("\\n【1】密码策略")
    print(f"  hash 算法      : {PASSWORD_POLICY['hash_algorithm']}")
    print(f"  最小长度       : {PASSWORD_POLICY['min_length']}")
    print(f"  复杂度要求     : 大写={PASSWORD_POLICY['require_uppercase']}, "
          f"小写={PASSWORD_POLICY['require_lowercase']}, "
          f"数字={PASSWORD_POLICY['require_digit']}")
    print(f"  密码历史       : 不能与最近 {PASSWORD_POLICY['history_count']} 次相同")
    print(f"  密码有效期     : {PASSWORD_POLICY['max_age_days']} 天")
    print(f"  泄露检查       : {PASSWORD_POLICY['check_breached_password']}")

    # 2. Token 策略
    print("\\n【2】Token 策略")
    print(f"  算法           : {TOKEN_POLICY['algorithm']}")
    print(f"  活跃密钥       : {TOKEN_POLICY['keys']['active_kid']}")
    print(f"  Access Token   : {TOKEN_POLICY['access_token']['expire_seconds']}s "
          f"({TOKEN_POLICY['access_token']['expire_seconds'] // 60} 分钟)")
    print(f"  Refresh Token  : {TOKEN_POLICY['refresh_token']['expire_seconds']}s "
          f"({TOKEN_POLICY['refresh_token']['expire_seconds'] // 86400} 天)")
    print(f"  轮换 + 重用检测: {TOKEN_POLICY['refresh_token']['rotate']} / "
          f"{TOKEN_POLICY['refresh_token']['reuse_detection']}")

    # 3. 设备管理
    print("\\n【3】设备管理")
    print(f"  最大设备数     : {DEVICE_POLICY['max_devices_per_user']}")
    print(f"  超限策略       : {DEVICE_POLICY['exceed_strategy']}")
    print(f"  不活跃下线     : {DEVICE_POLICY['inactive_threshold_days']} 天")

    # 4. 权限
    print("\\n【4】权限策略")
    print(f"  模式           : {AUTHZ_POLICY['mode']}")
    print(f"  角色           : {AUTHZ_POLICY['rbac']['roles']}")
    print(f"  默认策略       : {AUTHZ_POLICY['default_effect']}")

    # 5. 传输安全
    print("\\n【5】传输安全")
    print(f"  强制 HTTPS     : {TRANSPORT_SECURITY['force_https']}")
    print(f"  HSTS           : {TRANSPORT_SECURITY['hsts']['enabled']}")
    print(f"  TLS 最低版本   : {TRANSPORT_SECURITY['tls']['min_version']}")
    print(f"  Cookie 标志    : Secure={TRANSPORT_SECURITY['cookie']['secure']}, "
          f"HttpOnly={TRANSPORT_SECURITY['cookie']['httponly']}, "
          f"SameSite={TRANSPORT_SECURITY['cookie']['samesite']}")
    print(f"  CORS 白名单    : {TRANSPORT_SECURITY['cors']['allowed_origins']}")

    # 6. 防护
    print("\\n【6】防护策略")
    print(f"  登录限流       : {PROTECTION_POLICY['rate_limit']['login']}")
    print(f"  账号锁定       : 失败 {PROTECTION_POLICY['account_lockout']['max_failures']} 次锁 "
          f"{PROTECTION_POLICY['account_lockout']['lock_duration_seconds']}s")
    print(f"  2FA            : {PROTECTION_POLICY['two_factor']['enabled']} "
          f"(强制角色: {PROTECTION_POLICY['two_factor']['required_for_roles']})")

    # 7. 审计
    print("\\n【7】审计日志")
    print(f"  存储           : {AUDIT_POLICY['storage']['type']}")
    print(f"  保留时长       : {AUDIT_POLICY['storage']['retention_days']} 天")
    print(f"  审计事件数     : {len(AUDIT_POLICY['events'])} 种")
    print(f"  脱敏字段       : {AUDIT_POLICY['mask_fields']}")

    # 8. 密钥管理
    print("\\n【8】密钥管理")
    print(f"  密钥来源       : {KEY_MANAGEMENT['source']}")
    print(f"  JWT 密钥轮换   : {KEY_MANAGEMENT['jwt_signing_keys']['rotation_days']} 天")

    # 9. 完整 JSON（截断显示）
    print("\\n【9】完整配置 JSON（前 500 字符）")
    config_str = json.dumps(FULL_CONFIG, indent=2, ensure_ascii=False,
                            default=str)
    print(config_str[:500] + "\\n... (共 " + str(len(config_str)) + " 字符)")

    # 10. 上线检查清单
    print("\\n【10】上线检查清单")
    checklist = [
        ("密码用 argon2/bcrypt hash", PASSWORD_POLICY["hash_algorithm"] in ["argon2id", "bcrypt"]),
        ("JWT 用 RS256/ES256", TOKEN_POLICY["algorithm"] in ["RS256", "ES256"]),
        ("Access Token 短命（<=15min）", TOKEN_POLICY["access_token"]["expire_seconds"] <= 900),
        ("Refresh Token 轮换", TOKEN_POLICY["refresh_token"]["rotate"]),
        ("重用检测开启", TOKEN_POLICY["refresh_token"]["reuse_detection"]),
        ("强制 HTTPS", TRANSPORT_SECURITY["force_https"]),
        ("CORS 非通配符", "*" not in TRANSPORT_SECURITY["cors"]["allowed_origins"]),
        ("登录限流", PROTECTION_POLICY["rate_limit"]["login"]["max"] > 0),
        ("审计日志完整", len(AUDIT_POLICY["events"]) >= 10),
        ("密钥从 Vault 读", KEY_MANAGEMENT["source"] != "env"),
        ("默认拒绝", AUTHZ_POLICY["default_effect"] == "deny"),
        ("2FA 开启", PROTECTION_POLICY["two_factor"]["enabled"]),
    ]
    for item, ok in checklist:
        mark = "[x]" if ok else "[ ]"
        print(f"  {mark} {item}")

    passed = sum(1 for _, ok in checklist if ok)
    print(f"\\n  通过 {passed}/{len(checklist)} 项")

    print("\\n" + "=" * 70)
    print("全书结束。祝你在认证之路上写得稳、守得住、放得开。")
    print("=" * 70)


if __name__ == "__main__":
    demo()
`,
  },
];
