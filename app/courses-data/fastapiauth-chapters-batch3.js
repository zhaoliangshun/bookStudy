// =============================================================
// FastAPI 企业级认证与授权教程（fastapiauth）第三批章节
// -------------------------------------------------------------
// 本批包含第 11-15 章，共 5 章，覆盖"权限控制"与"企业级方案"两大主题：
//   第四部分 权限控制
//     fa-rbac-model:        RBAC 角色权限模型
//     fa-permission-deps:   权限依赖与装饰器
//     fa-fine-grained:      细粒度权限控制
//   第五部分 企业级方案
//     fa-refresh-token:     Access Token + Refresh Token 双 Token 机制
//     fa-jwt-blacklist:     JWT 黑名单与 Token 撤销（Logout）
//
// 编写原则：
//   1. demo 驱动，每章都有可直接 python 运行的代码，用 print 输出结果
//   2. 生活类比贯穿全文（公司门禁、VIP 卡、会员卡续期、黑名单等）
//   3. 每个概念都解释"为什么"，不只是"怎么做"
//   4. 代码注释极其详细，每行关键代码都有中文注释
//   5. code 字段中反引号转义为 \`，\${} 转义为 \${}
// =============================================================

export const chapters = [
  // =========================================================
  // 第十一章：RBAC 角色权限模型
  // =========================================================
  {
    id: "fa-rbac-model",
    group: "第四部分 权限控制",
    icon: "🎭",
    title: "RBAC 角色权限模型",
    content: `# 第十一章 RBAC 角色权限模型

> 一句话：**RBAC 不是直接给用户发权限，而是给用户发"角色"，角色再绑定权限。**
> 就像公司门禁卡——你不需要告诉保安"我能进机房、能进会议室、能进财务室"，
> 你只需要一张"研发主管"的工牌，保安一看工牌就知道你能去哪。

---

## 11.1 为什么需要 RBAC

### 11.1.1 没有 RBAC 的痛苦

想象一家公司有 200 个员工、50 个系统功能。如果**直接给每个员工分配权限**：

\`\`\`
张三 → [进机房, 看财报, 改代码, 发邮件, ...]   # 一长串
李四 → [进机房, 看财报, 改代码, 发邮件, ...]   # 又一长串
\`\`\`

问题马上出现：

| 问题 | 后果 |
|------|------|
| 张三升职了 | 要去 200 个权限里一个个加，漏一个就出事 |
| 李四离职了 | 要清掉他所有权限，漏一个就是安全漏洞 |
| 新来 10 个研发 | 每个人都要重复配一遍同样的权限 |
| 权限审计 | 根本搞不清"谁能干啥"，合规检查过不了 |

### 11.1.2 RBAC 的解法

RBAC（Role-Based Access Control，基于角色的访问控制）核心思想：

> **把权限绑在"角色"上，把角色发给"用户"。**

\`\`\`
研发主管（角色）→ [进机房, 改代码, 看代码]
张三（用户）→ 拥有"研发主管"角色 → 自动获得上述权限
\`\`\`

这样一来：

- 张三升职？换个角色就行，权限自动跟着变
- 李四离职？删掉他的角色关联，权限全没了
- 新来 10 个研发？给他们都发"研发"角色，一次搞定
- 审计？看"研发主管"这个角色有哪些权限，一清二楚

**生活类比：公司工牌**

\`\`\`
工牌（角色）        →  保安认识的权限集合
你（用户）          →  佩戴工牌
刷卡进门（访问）    →  保安看工牌，不是看你
\`\`\`

---

## 11.2 RBAC 的三层模型

### 11.2.1 三层结构图

\`\`\`
┌────────┐    拥有     ┌────────┐    绑定     ┌────────┐
│  用户  │ ─────────→ │  角色  │ ─────────→ │  权限  │
│ User   │            │ Role   │            │Permission│
└────────┘            └────────┘            └────────┘
  张三                  研发主管               进机房
  李四                  研发                   改代码
  王五                  财务                   看财报
\`\`\`

### 11.2.2 三层各自的职责

| 层 | 职责 | 例子 |
|----|------|------|
| 用户 User | 系统的使用者，真实的人或服务 | 张三、李四、api-bot |
| 角色 Role | 权限的"打包"，代表一种身份/岗位 | 研发主管、财务、访客 |
| 权限 Permission | 对某个资源做某个动作的许可 | article:write、door:enter |

**关键点**：用户不直接拥有权限，只拥有角色；角色不关心谁是用，只关心"这个岗位能干啥"。

### 11.2.3 为什么是三层而不是两层

有人会问：为什么不直接"用户 → 权限"？

答案：**解耦**。三层把"谁"和"能干啥"中间加了一层"岗位"，让两者都更灵活：

- 用户换岗：只改用户的角色关联，不动权限定义
- 岗位权限调整：只改角色的权限绑定，不动用户关联
- 新建岗位：定义新角色 + 绑权限，不影响现有用户

---

## 11.3 数据库表设计

### 11.3.1 五张表

标准 RBAC 需要五张表：三张实体表 + 两张关联表。

\`\`\`
┌──────────────┐       ┌──────────────┐
│   users      │       │    roles     │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ username     │       │ name         │
│ password_hash│       │ description  │
│ email        │       └──────┬───────┘
└──────┬───────┘              │
       │                      │
       │   ┌──────────────┐   │
       └──→│ user_roles   │←──┘
           ├──────────────┤
           │ user_id (FK) │
           │ role_id (FK) │
           └──────────────┘

┌──────────────┐       ┌──────────────────┐
│ permissions  │       │ role_permissions │
├──────────────┤       ├──────────────────┤
│ id (PK)      │       │ role_id (FK)     │
│ code         │       │ permission_id(FK)│
│ description  │       └──────────────────┘
└──────┬───────┘
       │
       └──────────────────┘
\`\`\`

### 11.3.2 为什么用关联表而不是逗号分隔

有人图省事，在 users 表里加一个 \`roles = "admin,editor"\` 字段。**这是反模式**：

| 写法 | 查询"谁能进机房" | 加新角色 |
|------|-----------------|----------|
| 逗号分隔 | 全表扫描 + 字符串拆分，慢 | 改所有相关行的字符串 |
| 关联表 | 一句 JOIN，走索引 | INSERT 一行 |

关联表还能存**额外信息**：比如这个用户什么时候被授予这个角色、谁授的、什么时候过期。

### 11.3.3 建表 SQL（概念示例）

\`\`\`sql
-- 用户表
CREATE TABLE users (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    email       VARCHAR(128)
);

-- 角色表
CREATE TABLE roles (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(64) UNIQUE NOT NULL,   -- 角色名，如 admin
    description VARCHAR(256)
);

-- 权限表
CREATE TABLE permissions (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(64) UNIQUE NOT NULL,   -- 如 article:write
    description VARCHAR(256)
);

-- 用户-角色关联（多对多）
CREATE TABLE user_roles (
    user_id     BIGINT NOT NULL,
    role_id     BIGINT NOT NULL,
    granted_at  DATETIME DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- 角色-权限关联（多对多）
CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);
\`\`\`

---

## 11.4 角色继承与权限传递

### 11.4.1 什么是角色继承

现实中"研发主管"自然拥有"研发"的所有权限。RBAC 允许角色继承：

\`\`\`
研发主管  ──继承──→  研发  ──继承──→  访客
   │                 │               │
进机房            改代码            看首页
删别人代码         看代码
   │                 │
   └──── 都自动拥有 ──┘
\`\`\`

"研发主管"不用重复绑定"改代码""看首页"，继承链自动传递。

### 11.4.2 继承的实现思路

在 roles 表加一个 \`parent_id\` 字段，指向父角色。查询权限时递归往上找：

\`\`\`python
def get_all_permissions(role):
    perms = set(role.permissions)              # 自己的直接权限
    for parent in role.parents:                # 往上递归
        perms |= get_all_permissions(parent)   # 并上父角色的权限
    return perms
\`\`\`

### 11.4.3 继承的陷阱：环

\`\`\`
A 继承 B，B 继承 A   # 死循环！
\`\`\`

实现时必须检测环，否则递归会爆栈。常见做法：递归时带一个"已访问"集合，遇到重复就报错。

---

## 11.5 RBAC vs ABAC vs ACL

### 11.5.1 三种模型对比

| 模型 | 全称 | 核心 | 适合场景 |
|------|------|------|----------|
| ACL | Access Control List | 直接给"资源"列"谁能访问"的清单 | 简单系统、文件权限 |
| RBAC | Role-Based AC | 用户通过"角色"获得权限 | 企业内部系统、管理后台 |
| ABAC | Attribute-Based AC | 根据属性 + 规则动态判断 | 复杂条件、多租户、合规要求高 |

### 11.5.2 ACL：最原始

\`\`\`
文章 #123 的访问清单：
  张三：读
  李四：读、写
\`\`\`

简单直接，但用户一多就维护不动，且无法表达"所有编辑都能写"这种批量规则。

### 11.5.3 ABAC：最灵活

\`\`\`
规则：当 用户.部门 == 资源.部门 且 用户.职级 >= 5 且 时间.工作时间内
      则 允许 读
\`\`\`

能表达复杂规则，但规则一多就难管理、难审计。**RBAC 是工程上的甜蜜点**：既不像 ACL 那么原始，也不像 ABAC 那么复杂。

### 11.5.4 工程建议

- 起步用 RBAC，覆盖 90% 场景
- 少数"看自己/看部门"这种资源级需求，在 RBAC 之上加一点点对象级检查（见第十三章）
- 只有强合规、多租户、复杂规则才考虑完整 ABAC

---

## 11.6 权限命名规范

### 11.6.1 推荐格式：\`资源:动作\`

\`\`\`
article:read      # 读文章
article:write     # 写文章
article:delete    # 删文章
user:create       # 创建用户
door:enter        # 进门
\`\`\`

### 11.6.2 好处

- 一眼看出"对什么资源做什么"
- 方便通配：\`article:*\` 表示所有文章相关权限
- 方便按资源筛选

### 11.6.3 反例

\`\`\`
can_edit          # 编辑啥？不清楚
admin_perm        # 太笼统
p_001             # 看不懂
\`\`\`

---

## 11.7 生活类比汇总

| RBAC 概念 | 公司类比 |
|-----------|----------|
| 用户 | 员工 |
| 角色 | 工牌（研发主管/财务/访客） |
| 权限 | 保安认识的能力（进机房/看财报） |
| 用户-角色关联 | 给员工发工牌 |
| 角色-权限绑定 | 保安系统的"这种工牌能干啥"清单 |
| 角色继承 | 主管工牌自动包含普通员工工牌的权限 |
| 权限检查 | 刷卡时保安查工牌对应的能力 |

---

## 11.8 本章小结

| 知识点 | 要点 |
|--------|------|
| RBAC 是什么 | 用户→角色→权限三层模型 |
| 为什么三层 | 解耦"谁"和"能干啥" |
| 五张表 | users / roles / permissions + 两张关联表 |
| 角色继承 | parent_id 递归，注意防环 |
| vs ACL/ABAC | RBAC 是工程甜蜜点 |
| 命名规范 | 资源:动作 |

下一章我们把 RBAC 模型接到 FastAPI 里，用"依赖"和"装饰器"两种方式做权限检查。
`,
    code: `"""
第十一章 demo：完整的 RBAC 权限检查引擎
目标：用纯 Python 实现 用户-角色-权限 三层模型 + 角色继承，
      演示权限检查的完整流程，用 print 输出结果。
只依赖标准库，直接 python 运行即可。
"""
# ============================================================
# 一、定义三个核心实体：Permission / Role / User
# ============================================================

class Permission:
    """
    权限实体：表示"对某个资源做某个动作"的许可。
    例如 article:write 表示"写文章"。
    """
    def __init__(self, code, description=""):
        # code 是权限的唯一标识，建议用 "资源:动作" 格式
        self.code = code
        # description 是人类可读的说明，方便审计和文档
        self.description = description

    def __repr__(self):
        # 便于打印调试，直接显示权限码
        return f"<Permission {self.code}>"


class Role:
    """
    角色实体：权限的"打包"，代表一种岗位/身份。
    支持角色继承——子角色自动拥有父角色的所有权限。
    """
    def __init__(self, name, description=""):
        # name 是角色名，如 admin / editor / viewer
        self.name = name
        self.description = description
        # permissions 存这个角色"直接绑定"的权限（不含继承来的）
        self.permissions = set()
        # parents 存父角色列表，用于继承
        self.parents = []

    def add_permission(self, permission):
        """给角色直接绑定一个权限"""
        self.permissions.add(permission)

    def add_parent(self, parent_role):
        """
        设置继承关系：本角色继承 parent_role。
        意味着本角色自动拥有 parent_role 的所有权限。
        """
        self.parents.append(parent_role)

    def get_all_permissions(self, _visited=None):
        """
        递归获取本角色的所有权限（直接 + 继承）。
        _visited 用于检测继承环，防止无限递归。
        """
        # 第一次调用时初始化已访问集合
        if _visited is None:
            _visited = set()
        # 环检测：如果当前角色已在路径中，说明出现环，报错
        if self.name in _visited:
            raise RuntimeError(f"检测到角色继承环：{self.name}")
        _visited.add(self.name)

        # 从自己的直接权限开始
        all_perms = set(self.permissions)
        # 递归并上每个父角色的权限
        for parent in self.parents:
            # 每个分支单独传一份 visited 的拷贝，避免兄弟分支互相误判
            all_perms |= parent.get_all_permissions(set(_visited))
        return all_perms


class User:
    """
    用户实体：系统的使用者。
    用户不直接持有权限，只持有角色。
    """
    def __init__(self, username):
        self.username = username
        # roles 存用户拥有的角色列表（一个用户可以有多个角色）
        self.roles = []

    def assign_role(self, role):
        """给用户分配一个角色"""
        self.roles.append(role)

    def get_all_permissions(self):
        """
        获取用户的所有权限 = 所有角色的所有权限的并集。
        多角色取并集：任一角色有该权限，用户就有。
        """
        perms = set()
        for role in self.roles:
            perms |= role.get_all_permissions()
        return perms

    def has_permission(self, code):
        """检查用户是否拥有某个权限码"""
        # 遍历所有权限，看 code 是否匹配
        for p in self.get_all_permissions():
            if p.code == code:
                return True
        return False


# ============================================================
# 二、RBAC 引擎：集中管理所有权限、角色、用户，提供检查入口
# ============================================================

class RBACEngine:
    """
    RBAC 引擎：负责注册权限/角色/用户，并提供权限检查接口。
    实际工程中这部分由数据库 + 缓存承担，这里用内存演示原理。
    """
    def __init__(self):
        # 用字典存所有注册的实体，方便按名字/code 查找
        self.permissions = {}   # code -> Permission
        self.roles = {}         # name -> Role
        self.users = {}         # username -> User

    def register_permission(self, code, description=""):
        """注册一个权限"""
        p = Permission(code, description)
        self.permissions[code] = p
        return p

    def register_role(self, name, description=""):
        """注册一个角色"""
        r = Role(name, description)
        self.roles[name] = r
        return r

    def bind_permission(self, role_name, perm_code):
        """给角色绑定权限"""
        self.roles[role_name].add_permission(self.permissions[perm_code])

    def set_inheritance(self, child_name, parent_name):
        """设置角色继承：child 继承 parent"""
        self.roles[child_name].add_parent(self.roles[parent_name])

    def register_user(self, username):
        """注册一个用户"""
        u = User(username)
        self.users[username] = u
        return u

    def assign_role(self, username, role_name):
        """给用户分配角色"""
        self.users[username].assign_role(self.roles[role_name])

    def check(self, username, perm_code):
        """
        权限检查入口：用户是否拥有某权限。
        实际工程里这是被 FastAPI 依赖调用的核心方法。
        """
        user = self.users.get(username)
        if not user:
            return False
        return user.has_permission(perm_code)


# ============================================================
# 三、搭建一个示例系统：博客后台的 RBAC
# ============================================================

print("=" * 60)
print("第一步：注册权限（资源:动作 格式）")
print("=" * 60)

engine = RBACEngine()
# 注册文章相关权限
engine.register_permission("article:read", "读文章")
engine.register_permission("article:write", "写文章")
engine.register_permission("article:delete", "删文章")
# 注册用户管理权限
engine.register_permission("user:create", "创建用户")
engine.register_permission("user:delete", "删除用户")
# 注册系统权限
engine.register_permission("system:config", "修改系统配置")

for code, p in engine.permissions.items():
    print(f"  权限 {code:20s} - {p.description}")

# ============================================================
print()
print("=" * 60)
print("第二步：注册角色，并绑定权限 + 设置继承")
print("=" * 60)

# visitor：访客，只能读文章
engine.register_role("visitor", "访客")
engine.bind_permission("visitor", "article:read")

# editor：编辑，能读能写，继承 visitor
engine.register_role("editor", "编辑")
engine.bind_permission("editor", "article:write")
engine.set_inheritance("editor", "visitor")  # editor 继承 visitor

# admin：管理员，能删文章、管用户、改系统，继承 editor
engine.register_role("admin", "管理员")
engine.bind_permission("admin", "article:delete")
engine.bind_permission("admin", "user:create")
engine.bind_permission("admin", "user:delete")
engine.bind_permission("admin", "system:config")
engine.set_inheritance("admin", "editor")    # admin 继承 editor

# 打印每个角色的"直接权限"和"继承后总权限"
for name, role in engine.roles.items():
    direct = sorted(p.code for p in role.permissions)
    total = sorted(p.code for p in role.get_all_permissions())
    print(f"  角色 {name:10s}")
    print(f"    直接权限: {direct}")
    print(f"    总权限(含继承): {total}")

# ============================================================
print()
print("=" * 60)
print("第三步：注册用户并分配角色")
print("=" * 60)

engine.register_user("张三")     # 普通访客
engine.assign_role("张三", "visitor")

engine.register_user("李四")     # 编辑
engine.assign_role("李四", "editor")

engine.register_user("王五")     # 管理员
engine.assign_role("王五", "admin")

# 赵六身兼两职：编辑 + ？这里演示一个用户多角色
engine.register_user("赵六")
engine.assign_role("赵六", "editor")
# 再给赵六加一个访客角色（虽然编辑已继承访客，但演示多角色）
engine.assign_role("赵六", "visitor")

for name, user in engine.users.items():
    roles = [r.name for r in user.roles]
    perms = sorted(p.code for p in user.get_all_permissions())
    print(f"  用户 {name}: 角色={roles}")
    print(f"    最终权限: {perms}")

# ============================================================
print()
print("=" * 60)
print("第四步：权限检查（这是 RBAC 的核心用途）")
print("=" * 60)

# 定义一批检查用例：(用户, 权限, 预期)
cases = [
    ("张三", "article:read",   True),   # 访客能读
    ("张三", "article:write",  False),  # 访客不能写
    ("李四", "article:read",   True),   # 编辑能读（继承自访客）
    ("李四", "article:write",  True),   # 编辑能写
    ("李四", "article:delete", False),  # 编辑不能删
    ("王五", "article:delete", True),   # 管理员能删
    ("王五", "system:config",  True),   # 管理员能改配置
    ("王五", "user:delete",    True),   # 管理员能删用户
    ("赵六", "article:write",  True),   # 编辑能写
    ("不存在", "article:read", False),  # 不存在的用户
]

for username, perm, expected in cases:
    # 调用引擎做权限检查
    result = engine.check(username, perm)
    # 对比预期，标记通过/失败
    ok = "PASS" if result == expected else "FAIL"
    print(f"  [{ok}] {username:6s} 检查 {perm:20s} -> {result} (预期 {expected})")

# ============================================================
print()
print("=" * 60)
print("第五步：演示角色继承的威力——调整父角色，子角色自动生效")
print("=" * 60)

# 给 visitor 加一个新权限 article:comment（评论）
engine.register_permission("article:comment", "评论文章")
engine.bind_permission("visitor", "article:comment")

print("  给 visitor 角色新增 article:comment 权限后：")
print(f"    张三(visitor)      能评论? {engine.check('张三', 'article:comment')}")
print(f"    李四(editor)       能评论? {engine.check('李四', 'article:comment')}  <- 继承生效")
print(f"    王五(admin)        能评论? {engine.check('王五', 'article:comment')}  <- 继承链传递")

# ============================================================
print()
print("=" * 60)
print("第六步：演示继承环检测")
print("=" * 60)

# 构造一个环：A 继承 B，B 继承 A
role_a = Role("环A")
role_b = Role("环B")
role_a.add_parent(role_b)
role_b.add_parent(role_a)  # 此时形成环
try:
    role_a.get_all_permissions()
except RuntimeError as e:
    print(f"  正确捕获继承环: {e}")

# ============================================================
print()
print("=" * 60)
print("小结：RBAC 引擎的关键设计")
print("=" * 60)
print("""
  1. 三层模型：User -> Role -> Permission，用户不直接持有权限
  2. 多对多关系：用关联表/集合表达，不用逗号字符串
  3. 角色继承：递归获取权限，必须检测环
  4. 多角色取并集：任一角色有权限，用户就有
  5. 权限命名：资源:动作 格式，一眼看懂
  6. 权限检查入口：engine.check(user, perm) —— 下一章接到 FastAPI
""")
`,
  },

  // =========================================================
  // 第十二章：权限依赖与装饰器
  // =========================================================
  {
    id: "fa-permission-deps",
    group: "第四部分 权限控制",
    icon: "🛡️",
    title: "权限依赖与装饰器",
    content: `# 第十二章 权限依赖与装饰器

> 上一章我们造了一把"锁"（RBAC 引擎），这章要把它装到"门"上（FastAPI 路由）。
> FastAPI 装锁有两种方式：**依赖（Depends）** 和 **装饰器**。
> 推荐用依赖，因为它是 FastAPI 的"原生语言"，和参数注入、OpenAPI 文档天然契合。

---

## 12.1 FastAPI 权限检查的两种方式

### 12.1.1 方式一：依赖（Depends）—— 推荐

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException

@app.get("/admin/users")
def list_users(current_user: User = Depends(require_role("admin"))):
    # 能进到这里，说明 current_user 已经是 admin 了
    return {"users": [...]}
\`\`\`

### 12.1.2 方式二：装饰器

\`\`\`python
@app.get("/admin/users")
@require_role("admin")   # 装饰器做权限检查
def list_users():
    return {"users": [...]}
\`\`\`

### 12.1.3 为什么推荐依赖

| 对比项 | 依赖 Depends | 装饰器 |
|--------|-------------|--------|
| 参数注入 | 天然支持，检查完直接拿到 user | 要用全局变量或闭包传 |
| OpenAPI 文档 | 自动在文档里标出"需要认证" | 文档看不出 |
| 嵌套复用 | 依赖可以链式嵌套 | 装饰器嵌套易乱 |
| FastAPI 风格 | 原生，符合框架哲学 | 偏 Flask/Django 老风格 |
| 测试 | 容易 mock 依赖 | 难 mock |

**结论**：能用依赖就用依赖，装饰器只在迁移老代码或极简场景下用。

---

## 12.2 用 Depends 实现角色检查依赖

### 12.2.1 最朴素的写法

先看一个"写死角色"的依赖：

\`\`\`python
def require_admin(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if "admin" not in user.roles:
        raise HTTPException(403, "需要 admin 角色")
    return user

@app.get("/admin/users")
def list_users(admin: User = Depends(require_admin)):
    return {...}
\`\`\`

问题：每来一个角色就要写一个 \`require_xxx\` 函数，\`require_admin\`、\`require_editor\`、\`require_finance\`... 重复代码爆炸。

### 12.2.2 生活类比：保安的不同通道

\`\`\`
公司大门有多个通道：
  通道 A：只准 admin 走
  通道 B：只准 editor 走
  通道 C：admin 或 editor 都能走

总不能每个通道都招一个专属保安——
应该招一个"通用保安"，告诉它"这个通道放行哪些角色"。
\`\`\`

这就是**依赖工厂**：一个"造保安的工厂"，你告诉它放行规则，它给你造一个对应的保安（依赖函数）。

---

## 12.3 权限依赖工厂：require_role("admin")

### 12.3.1 工厂模式的核心思路

\`\`\`python
def require_role(role_name):
    """这不是依赖本身，而是"造依赖的工厂" """
    def _dependency(user: User = Depends(get_current_user)):
        if role_name not in user.roles:
            raise HTTPException(403, f"需要 {role_name} 角色")
        return user
    return _dependency   # 返回一个真正的依赖函数
\`\`\`

使用：

\`\`\`python
@app.get("/admin/users")
def list_users(user: User = Depends(require_role("admin"))):
    # 注意：require_role("admin") 返回的是 _dependency 函数
    # FastAPI 会把 _dependency 当依赖去执行
    return {...}
\`\`\`

### 12.3.2 为什么这样能行

关键点：\`Depends(...)\` 接收的是一个**可调用对象**。我们调用 \`require_role("admin")\` 得到一个函数 \`_dependency\`，把它传给 \`Depends\`，FastAPI 就会执行 \`_dependency\`。

\`\`\`
require_role("admin")  →  返回 _dependency 函数  →  Depends 把它当依赖执行
\`\`\`

这样一份工厂代码，就能造出无数个角色检查依赖：

\`\`\`python
Depends(require_role("admin"))
Depends(require_role("editor"))
Depends(require_role("finance"))
\`\`\`

---

## 12.4 嵌套依赖链

### 12.4.1 真实的依赖链长这样

\`\`\`
路由 list_users
  └─ Depends require_role("admin")
       └─ Depends get_current_user
            └─ Depends oauth2_scheme   # 从请求头取 token
\`\`\`

FastAPI 会**从最底层的依赖开始执行**，逐层往上：

\`\`\`
1. oauth2_scheme(req) → 取出 token 字符串
2. get_current_user(token) → 查库得到 User 对象
3. require_role("admin")(user) → 检查角色，通过则返回 user
4. list_users(user) → 业务逻辑，此时 user 一定是 admin
\`\`\`

### 12.4.2 嵌套的好处

- **复用**：\`get_current_user\` 被所有需要登录的接口复用
- **分层**：认证（你是谁）和授权（你能干啥）分开
- **可测试**：每层都能单独测，mock 任一层都行

### 12.4.3 生活类比：层层验证

\`\`\`
门禁卡（token）→ 前台查身份（get_current_user）→ 主管确认岗位（require_role）→ 进办公室（路由）
\`\`\`

每层只干自己的事，上一层的结果传给下一层。

---

## 12.5 多角色检查：任一通过即放行

### 12.5.1 需求

"这个接口 admin 或 editor 都能访问"，怎么写？

### 12.5.2 升级工厂：接收多个角色

\`\`\`python
def require_any_role(*role_names):
    """
    任一角色通过即放行。
    用法：Depends(require_any_role("admin", "editor"))
    """
    def _dependency(user: User = Depends(get_current_user)):
        # 用户角色和要求的角色有交集即可
        if not set(user.roles) & set(role_names):
            raise HTTPException(403, f"需要以下任一角色: {role_names}")
        return user
    return _dependency
\`\`\`

### 12.5.3 集合运算的妙用

\`set(user.roles) & set(role_names)\` 求交集：

- 有交集 → 用户拥有至少一个要求的角色 → 放行
- 空交集 → 用户一个要求的角色都没有 → 拒绝

这比写 for 循环简洁，且语义清晰。

### 12.5.4 全部通过 vs 任一通过

- **任一通过**（OR）：上述 \`require_any_role\`，常见
- **全部通过**（AND）：要求用户同时拥有多个角色，少见，但有时用于"双重确认"

\`\`\`python
def require_all_roles(*role_names):
    """要求用户同时拥有所有指定角色"""
    def _dependency(user: User = Depends(get_current_user)):
        if not set(role_names).issubset(set(user.roles)):
            raise HTTPException(403, "需要所有指定角色")
        return user
    return _dependency
\`\`\`

---

## 12.6 把权限检查接到 RBAC 引擎

### 12.6.1 角色检查 vs 权限检查

上一章的 RBAC 引擎检查的是**权限**（\`article:write\`），这章检查的是**角色**（\`admin\`）。两者关系：

\`\`\`
角色检查（粗）   →   权限检查（细）
require_role     →   require_permission
"你是 admin 吗"  →   "你有 article:write 吗"
\`\`\`

### 12.6.2 权限依赖工厂

\`\`\`python
def require_permission(perm_code):
    """权限级依赖工厂，对接 RBAC 引擎"""
    def _dependency(user: User = Depends(get_current_user)):
        if not rbac_engine.check(user.username, perm_code):
            raise HTTPException(403, f"缺少权限: {perm_code}")
        return user
    return _dependency
\`\`\`

### 12.6.3 何时用角色检查，何时用权限检查

| 场景 | 选择 |
|------|------|
| 接口和某个岗位强绑定（/admin/* 只给 admin） | 角色检查 |
| 接口对应一个具体能力（写文章） | 权限检查 |
| 权限可能跨多个角色（多个角色都能写文章） | 权限检查（避免写一长串角色） |

**工程建议**：优先用权限检查，因为它和具体能力挂钩，更稳定。角色检查适合"整个模块只给某岗位"的粗粒度场景。

---

## 12.7 装饰器方式（了解）

### 12.7.1 怎么写

\`\`\`python
def require_role(role_name):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # 从 kwargs 或全局拿 user
            user = kwargs.get("current_user")
            if not user or role_name not in user.roles:
                raise HTTPException(403, "无权限")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@app.get("/admin/users")
@require_role("admin")
def list_users(current_user: User = Depends(get_current_user)):
    return {...}
\`\`\`

### 12.7.2 装饰器的坑

- 装饰器要在路由装饰器**之下**（先执行权限检查再注册路由？实际顺序易错）
- 拿不到 FastAPI 注入的参数，得约定参数名或用全局
- OpenAPI 文档不会体现权限要求

所以**不推荐新项目用装饰器做权限**，了解即可。

---

## 12.8 错误码规范

### 12.8.1 401 vs 403

| 码 | 含义 | 触发场景 |
|----|------|----------|
| 401 Unauthorized | 没登录 | 没有 token / token 无效 / token 过期 |
| 403 Forbidden | 登录了但没权限 | token 有效，但角色/权限不够 |

**口诀**：401 是"你是谁"，403 是"我知道你是谁，但你不能干这个"。

### 12.8.2 在依赖里怎么分

\`\`\`python
def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if user is None:
        raise HTTPException(401, "未登录或 token 无效")  # 认证层
    return user

def require_role(role_name):
    def _dependency(user: User = Depends(get_current_user)):
        if role_name not in user.roles:
            raise HTTPException(403, "权限不足")  # 授权层
        return user
    return _dependency
\`\`\`

认证层抛 401，授权层抛 403，职责清晰。

---

## 12.9 生活类比汇总

| 概念 | 类比 |
|------|------|
| 依赖 Depends | 通道里的保安 |
| 依赖工厂 | 招保安的工厂，告诉它放行规则 |
| 嵌套依赖 | 门禁卡 → 前台查身份 → 主管确认岗位 |
| 多角色任一通过 | 通道放行多种工牌，有其一即可 |
| 401 | 没带工牌 |
| 403 | 带了工牌，但你的工牌进不了这个房间 |

---

## 12.10 本章小结

| 知识点 | 要点 |
|--------|------|
| 两种方式 | 依赖（推荐）vs 装饰器 |
| 依赖工厂 | require_role("admin") 返回一个依赖函数 |
| 嵌套依赖 | oauth2_scheme → get_current_user → require_role → 路由 |
| 多角色 | require_any_role 用集合交集 |
| 角色检查 vs 权限检查 | 粗粒度 vs 细粒度，优先权限检查 |
| 错误码 | 401 认证失败，403 授权失败 |

下一章我们继续细化——从"角色级"深入到"资源级"：用户只能改自己的文章。
`,
    code: `"""
第十二章 demo：权限依赖工厂 + 嵌套依赖链
目标：用纯 Python 模拟 FastAPI 的依赖注入机制，
      实现 require_role / require_any_role / require_permission 工厂，
      演示不同角色的访问控制。
不依赖 FastAPI，直接 python 运行即可。
"""
import inspect


# ============================================================
# 一、模拟 FastAPI 的依赖注入容器
# ============================================================
# FastAPI 的 Depends 本质是：执行依赖函数，把返回值注入到下一层。
# 这里我们实现一个极简版，演示依赖链的执行原理。
#
# 关键点：Depends(...) 是参数的【默认值】，不是注解。
#   def f(user: User = Depends(get_current_user)):
#   这里 user 的注解是 User，默认值才是 DependsMarker。
#   所以要用 inspect.signature 取 param.default，而不是 __annotations__。

class HTTPException(Exception):
    """模拟 FastAPI 的 HTTPException，带状态码和详情"""
    def __init__(self, status_code, detail):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"{status_code}: {detail}")


def resolve_dependency(dep, request):
    """
    执行一个依赖函数。
    dep 是一个普通函数，它自己的参数可能也声明了依赖（用 Depends 标记）。
    request 是模拟的请求对象（含 token、body 等）。

    解析逻辑：
      - 参数默认值是 DependsMarker → 递归解析子依赖
      - 参数名为 request 且无默认值 → 注入请求对象（模拟 FastAPI 的 Request 注入）
      - 其他参数 → 跳过（使用自身默认值）
    """
    # 用 inspect.signature 拿到参数的默认值（Depends 在默认值里，不在注解里）
    sig = inspect.signature(dep)
    kwargs = {}
    for param_name, param in sig.parameters.items():
        if isinstance(param.default, DependsMarker):
            # 该参数声明了子依赖，递归解析
            kwargs[param_name] = resolve_dependency(param.default.func, request)
        elif param_name == "request":
            # 名为 request 的参数直接注入请求对象
            kwargs[param_name] = request
    # 执行依赖函数本身
    return dep(**kwargs)


class DependsMarker:
    """
    标记类：表示"这个参数是一个依赖"。
    用法：在函数注解里写 token: str = Depends(func)
    这里简化为注解即依赖（实际 FastAPI 用默认值，原理一致）。
    """
    def __init__(self, func):
        self.func = func


def Depends(func):
    """模拟 fastapi.Depends，返回一个标记"""
    return DependsMarker(func)


# ============================================================
# 二、模拟数据：用户库 + RBAC 引擎（简化版）
# ============================================================

class User:
    def __init__(self, username, roles, permissions):
        self.username = username
        self.roles = set(roles)              # 用户角色集合
        self.permissions = set(permissions)  # 用户权限集合

# 模拟数据库里的三个用户
USER_DB = {
    "token-zhang": User("张三", {"visitor"}, {"article:read"}),
    "token-li":    User("李四", {"editor"},  {"article:read", "article:write"}),
    "token-wang":  User("王五", {"admin"},
                        {"article:read", "article:write", "article:delete",
                         "user:delete", "system:config"}),
}


# ============================================================
# 三、依赖链的最底层：从请求头取 token
# ============================================================

def oauth2_scheme(request):
    """
    模拟 fastapi.security.OAuth2PasswordBearer。
    从请求头 Authorization 里取出 token，没有就抛 401。
    """
    token = request.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "未提供 token，请先登录")
    return token


# ============================================================
# 四、依赖链第二层：根据 token 查出当前用户
# ============================================================

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    认证层：把 token 翻译成 User。
    token 无效 → 401（认证失败）。
    注意：这一层只管"你是谁"，不管"你能干啥"。
    """
    user = USER_DB.get(token)
    if not user:
        raise HTTPException(401, "token 无效或已过期")
    return user


# ============================================================
# 五、依赖工厂：角色检查（核心）
# ============================================================

def require_role(role_name):
    """
    角色依赖工厂：返回一个依赖函数，要求当前用户拥有指定角色。
    用法：Depends(require_role("admin"))

    生活类比：保安工厂——你告诉它"这个通道只放 admin"，
            它给你造一个对应的保安。
    """
    def _dependency(user: User = Depends(get_current_user)):
        # 授权层：能走到这里说明已认证（拿到 user）
        # 现在检查角色
        if role_name not in user.roles:
            # 角色不够 → 403（授权失败，不是 401）
            raise HTTPException(403, f"权限不足：需要 {role_name} 角色")
        return user
    # 给依赖函数打个标记，方便外部识别
    _dependency.__name__ = f"require_role({role_name})"
    return _dependency


def require_any_role(*role_names):
    """
    多角色依赖工厂：任一角色通过即放行。
    用法：Depends(require_any_role("admin", "editor"))

    生活类比：通道放行多种工牌，有其一即可进。
    """
    def _dependency(user: User = Depends(get_current_user)):
        # 集合交集：用户角色 ∩ 要求角色
        if not (user.roles & set(role_names)):
            raise HTTPException(403,
                f"权限不足：需要以下任一角色 {role_names}")
        return user
    _dependency.__name__ = f"require_any_role({role_names})"
    return _dependency


def require_permission(perm_code):
    """
    权限依赖工厂：对接 RBAC 引擎，检查具体权限。
    用法：Depends(require_permission("article:write"))

    比角色检查更细：不关心你是什么角色，只关心你有没有这个能力。
    """
    def _dependency(user: User = Depends(get_current_user)):
        if perm_code not in user.permissions:
            raise HTTPException(403, f"权限不足：缺少 {perm_code}")
        return user
    _dependency.__name__ = f"require_permission({perm_code})"
    return _dependency


# ============================================================
# 六、模拟路由：定义几个受保护的"接口"
# ============================================================

def list_users(user: User = Depends(require_role("admin"))):
    """只有 admin 能访问"""
    return {"msg": "用户列表", "caller": user.username}


def write_article(user: User = Depends(require_permission("article:write"))):
    """有 article:write 权限的人能访问"""
    return {"msg": "文章已写", "caller": user.username}


def dashboard(user: User = Depends(require_any_role("admin", "editor"))):
    """admin 或 editor 都能访问"""
    return {"msg": "仪表盘", "caller": user.username}


# ============================================================
# 七、模拟请求执行器：把请求喂给路由，捕获权限异常
# ============================================================

def call_route(route, request):
    """
    模拟 FastAPI 调用路由：
    1. 解析路由声明的依赖
    2. 执行依赖链
    3. 把依赖结果注入路由参数
    4. 执行路由函数

    同样用 inspect.signature 取参数默认值（Depends 在默认值里）。
    """
    try:
        sig = inspect.signature(route)
        kwargs = {}
        for name, param in sig.parameters.items():
            # 参数默认值是 DependsMarker → 解析依赖链
            if isinstance(param.default, DependsMarker):
                kwargs[name] = resolve_dependency(param.default.func, request)
            elif name == "request":
                kwargs[name] = request
        # 执行路由
        return route(**kwargs)
    except HTTPException as e:
        # 捕获权限/认证异常，返回错误信息
        return {"error": e.detail, "status": e.status_code}


# ============================================================
# 八、运行测试用例
# ============================================================

print("=" * 60)
print("场景一：访问 /admin/users（需要 admin 角色）")
print("=" * 60)
for token in ["token-zhang", "token-li", "token-wang", None]:
    # 构造请求，None 表示不带 token
    req = {"Authorization": f"Bearer {token}"} if token else {}
    label = USER_DB[token].username if token else "匿名"
    result = call_route(list_users, req)
    print(f"  {label:6s} 访问 -> {result}")

print()
print("=" * 60)
print("场景二：访问 /articles/write（需要 article:write 权限）")
print("=" * 60)
for token in ["token-zhang", "token-li", "token-wang"]:
    req = {"Authorization": f"Bearer {token}"}
    label = USER_DB[token].username
    result = call_route(write_article, req)
    print(f"  {label:6s} 访问 -> {result}")

print()
print("=" * 60)
print("场景三：访问 /dashboard（需要 admin 或 editor 角色）")
print("=" * 60)
for token in ["token-zhang", "token-li", "token-wang"]:
    req = {"Authorization": f"Bearer {token}"}
    label = USER_DB[token].username
    result = call_route(dashboard, req)
    print(f"  {label:6s} 访问 -> {result}")

print()
print("=" * 60)
print("场景四：演示 401 vs 403 的区别")
print("=" * 60)
# 401：没带 token
print(f"  不带 token 访问 /admin/users -> {call_route(list_users, {})}")
# 401：token 无效
print(f"  假 token 访问 /admin/users  -> {call_route(list_users, {'Authorization': 'Bearer fake'})}")
# 403：token 有效但角色不够
req_li = {"Authorization": "Bearer token-li"}
print(f"  李四(非admin) 访问 /admin/users -> {call_route(list_users, req_li)}")

print()
print("=" * 60)
print("场景五：查看依赖链的执行顺序")
print("=" * 60)
print("""
  路由 list_users
    └─ Depends require_role("admin")
         └─ Depends get_current_user
              └─ Depends oauth2_scheme   <- 从这里开始执行
  执行顺序：oauth2_scheme -> get_current_user -> require_role -> list_users
  任何一层失败都会抛出 HTTPException，上层路由不会执行。
""")

print("=" * 60)
print("小结")
print("=" * 60)
print("""
  1. 依赖工厂 require_role(name) 返回一个依赖函数，避免重复代码
  2. 嵌套依赖链：oauth2_scheme -> get_current_user -> require_role -> 路由
  3. 多角色检查 require_any_role 用集合交集，简洁清晰
  4. 权限检查 require_permission 比 role 检查更细，优先使用
  5. 错误码：401 认证失败（没登录），403 授权失败（登录了但没权限）
""")
`,
  },

  // =========================================================
  // 第十三章：细粒度权限控制
  // =========================================================
  {
    id: "fa-fine-grained",
    group: "第四部分 权限控制",
    icon: "🔍",
    title: "细粒度权限控制",
    content: `# 第十三章 细粒度权限控制

> 前两章的 RBAC 解决的是"**这类人**能不能干**这类事**"，
> 比如"编辑能写文章"。但现实里还有更细的需求：
> "张三能写文章，但只能改**自己写的**文章，不能改李四的。"
> 这就是**资源级权限**——权限不只取决于"你是谁"，还取决于"你操作的是哪个对象"。

---

## 13.1 为什么需要细粒度权限

### 13.1.1 RBAC 的盲区

RBAC 只能回答：

\`\`\`
张三 有 article:write 权限吗？  →  有
\`\`\`

但它回答不了：

\`\`\`
张三 能改 文章#123 吗？  →  ？
\`\`\`

因为"文章 #123 是谁写的"这个信息，RBAC 模型里没有。

### 13.1.2 生活类比：办公室文件柜

\`\`\`
RBAC：你有"翻文件柜"的权限 → 所有抽屉都能翻
细粒度：你有"翻文件柜"的权限，但只能翻"贴着自己名字"的抽屉
\`\`\`

现实公司里，文件柜是公用的，但每个人的抽屉是私有的——这就是资源级权限。

### 13.1.3 常见的细粒度场景

| 场景 | 描述 |
|------|------|
| 改自己的文章 | 用户只能编辑 author_id = 自己 的文章 |
| 看本部门订单 | 只能看 department_id = 自己部门 的订单 |
| 删自己创建的评论 | 只能删 creator_id = 自己 的评论 |
| 管理下属 | 主管只能管 reports_to = 自己 的员工 |

---

## 13.2 资源级权限：Owner-based 检查

### 13.2.1 核心思路

在权限检查时，把"资源对象"也传进来，对比资源的 owner 和当前用户：

\`\`\`python
def can_edit_article(user, article):
    # 基础权限：有 article:write
    if not user.has_permission("article:write"):
        return False
    # 资源级：文章作者必须是当前用户
    return article.author_id == user.id
\`\`\`

### 13.2.2 两层检查缺一不可

注意上面是**两步**：

1. **能力检查**：用户有没有"写文章"这个能力（RBAC 层）
2. **归属检查**：这篇文章是不是用户的（资源层）

只做第 1 步：任何编辑都能改所有人的文章，越权。
只做第 2 步：没有写权限的人也能改自己的（如果有的话），但可能违反业务规则。

**必须两层都过**，这是细粒度权限的铁律。

### 13.2.3 在 FastAPI 里怎么落地

\`\`\`python
@app.put("/articles/{article_id}")
def update_article(
    article_id: int,
    body: ArticleUpdate,
    user: User = Depends(require_permission("article:write")),
):
    # 1. 查出文章
    article = get_article(article_id)
    if not article:
        raise HTTPException(404, "文章不存在")
    # 2. 资源级检查：必须是自己的文章
    if article.author_id != user.id:
        raise HTTPException(403, "只能修改自己的文章")
    # 3. 通过，执行更新
    return update_article_db(article_id, body)
\`\`\`

### 13.2.4 把资源检查也做成依赖

重复写 \`if article.author_id != user.id\` 太啰嗦，可以做成依赖工厂：

\`\`\`python
def require_owner(load_resource):
    """
    资源级依赖工厂。
    load_resource: 一个函数，根据路径参数加载资源对象
    """
    def _dependency(
        user: User = Depends(get_current_user),
        resource = Depends(load_resource),
    ):
        if resource.owner_id != user.id:
            raise HTTPException(403, "无权操作该资源")
        return resource
    return _dependency
\`\`\`

---

## 13.3 对象级别权限的通用模式

### 13.3.1 四种常见归属关系

| 关系 | 例子 | 检查方式 |
|------|------|----------|
| 直接归属 | 文章.author = 用户 | article.author_id == user.id |
| 间接归属 | 评论.article.author = 用户 | comment.article.author_id == user.id |
| 部门归属 | 订单.department = 用户.department | order.dept_id == user.dept_id |
| 角色范围 | 主管管下属 | employee.reports_to == user.id |

### 13.3.2 间接归属的陷阱

\`\`\`
用户 → 文章 ← 评论
\`\`\`

删除评论时，要检查"评论所在的文章是不是当前用户的"——需要 JOIN 两层：

\`\`\`python
def can_delete_comment(user, comment):
    article = get_article(comment.article_id)
    return article.author_id == user.id
\`\`\`

**陷阱**：层级一深，权限检查的查询就慢。工程上常用**冗余字段**（在评论表里直接存 article_author_id）来避免多层 JOIN。

### 13.3.3 生活类比：套娃式权限

\`\`\`
你的文件夹 → 里面的文档 → 文档里的评论
\`\`\`

要删评论，得顺着评论找到文档，再找到文件夹，看是不是你的——一层层往上看归属。

---

## 13.4 权限作用域（Scope）

### 13.4.1 什么是 Scope

Scope 是"权限的范围限定"，比 permission 更细：

\`\`\`
article:write          # 能写文章（无范围限制）
article:write:own      # 只能写自己的文章
article:write:dept     # 只能写本部门的文章
article:write:all      # 能写所有人的文章
\`\`\`

### 13.4.2 Scope 的作用

把"能力"和"范围"分开表达：

\`\`\`
能力（permission）：article:write   → 你会写文章
范围（scope）：own / dept / all     → 你能写哪些文章
\`\`\`

一个 admin 可能有 \`article:write:all\`，一个普通编辑只有 \`article:write:own\`。

### 13.4.3 生活类比：VIP 卡等级

\`\`\`
健身卡（能力：进健身房）
  - 基础卡（scope：仅本店）
  - 全城卡（scope：本市所有店）
  - 全国卡（scope：全国所有店）
\`\`\`

同样是"进健身房"这个能力，scope 决定了你能进哪些店。

---

## 13.5 OAuth2 Scopes 与 FastAPI 的结合

### 13.5.1 OAuth2 Scopes 是什么

OAuth2 标准里，token 可以带 scopes，表示"这个 token 被授权做哪些事"：

\`\`\`
token: abc123
scopes: ["article:read", "article:write:own"]
\`\`\`

这样即使 token 持有者是 admin，这个 token 也只能做"读文章 + 写自己的文章"，不能删别人的。

### 13.5.2 为什么需要 token 级 scope

- **最小权限原则**：第三方应用拿你的 token 时，只给必要的 scope
- **降低泄露风险**：token 万一泄露，破坏范围有限
- **细粒度授权**：同一个用户，不同场景发不同 scope 的 token

### 13.5.3 FastAPI 怎么用

\`\`\`python
from fastapi.security import OAuth2PasswordBearer

# 声明这个应用支持哪些 scopes
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "article:read": "读文章",
        "article:write:own": "写自己的文章",
        "article:write:all": "写所有人的文章",
    },
)

# 依赖里检查 scope
from fastapi import Security
def get_current_user(security_scopes=Security(oauth2_scheme, scopes=["article:write:own"])):
    token = ...  # 取 token
    payload = decode(token)
    # 检查 token 的 scope 是否包含要求的
    for scope in security_scopes.scopes:
        if scope not in payload.get("scopes", []):
            raise HTTPException(403, f"缺少 scope: {scope}")
    return payload
\`\`\`

### 13.5.4 生活类比：授权书

\`\`\`
你（用户）给中介（第三方应用）一张授权书（token）：
  "凭此书可代我查我的账单"（scope: bill:read:own）
  但不能代我转账（没有 bill:transfer scope）
\`\`\`

授权书上写明了能干啥，银行只认授权书上的范围。

---

## 13.6 动态权限：基于上下文的判断

### 13.6.1 静态权限的局限

RBAC 的权限是"静态"的——配置好就固定。但有些权限是"动态"的，依赖运行时上下文：

\`\`\`
工作时间内才能访问
IP 白名单内才能访问
账号余额 > 0 才能下单
文章状态 = 草稿 才能编辑
\`\`\`

### 13.6.2 动态权限的实现

把"上下文"作为权限检查的输入：

\`\`\`python
def can_edit_article(user, article, context):
    # 静态权限
    if not user.has_permission("article:write"):
        return False
    # 资源归属
    if article.author_id != user.id:
        return False
    # 动态条件：文章必须是草稿状态
    if article.status != "draft":
        return False
    # 动态条件：必须在工作时间
    if not context.is_working_hours():
        return False
    return True
\`\`\`

### 13.6.3 何时该用动态权限

- 简单规则用静态 RBAC
- 涉及"状态/时间/环境"才用动态
- 动态规则多了就接近 ABAC，注意控制复杂度

### 13.6.4 生活类比：会员卡续期窗口

\`\`\`
你的会员卡（权限）一直有"进店"能力，
但门店规定：仅在营业时间（动态条件）能进，
且卡未过期（动态条件）才能刷。
\`\`\`

---

## 13.7 一个完整的资源级权限案例

### 13.7.1 需求

博客系统，文章编辑权限规则：

1. 作者本人能改自己的文章（无论状态）
2. 编辑能改本部门任何人的文章（仅草稿状态）
3. admin 能改所有人的文章（任何状态）
4. 已发布文章只有 admin 能改

### 13.7.2 拆解成权限函数

\`\`\`python
def can_edit_article(user, article, context):
    # 规则 4：已发布文章只有 admin 能改
    if article.status == "published" and "admin" not in user.roles:
        return False, "已发布文章仅 admin 可改"
    # 规则 1：作者本人
    if article.author_id == user.id:
        return True, "作者本人"
    # 规则 2：编辑改本部门草稿
    if "editor" in user.roles:
        if article.dept_id == user.dept_id and article.status == "draft":
            return True, "编辑改本部门草稿"
    # 规则 3：admin 改任何
    if "admin" in user.roles:
        return True, "管理员"
    return False, "无权修改"
\`\`\`

### 13.7.3 返回拒绝原因的重要性

注意上面返回了 \`False, "原因"\`。**权限拒绝时一定要给原因**，方便：

- 用户理解为什么被拒
- 客服排查问题
- 审计日志有依据

---

## 13.8 权限检查的性能

### 13.8.1 N+1 问题

列表页每条记录都查一次 owner，会产生 N+1 查询：

\`\`\`python
# 烂代码：10 篇文章 = 11 次 SQL
for article in articles:
    if article.author_id != user.id:  # 每次都要拿 article
        ...
\`\`\`

### 13.8.2 优化：批量预加载

\`\`\`python
# 一次性查出所有作者
author_ids = {a.author_id for a in articles}
authors = User.objects.filter(id__in=author_ids)
# 在内存里做归属判断
\`\`\`

### 13.8.3 优化：SQL 层过滤

直接在 SQL 里加权限过滤条件：

\`\`\`sql
SELECT * FROM articles
WHERE author_id = :current_user   -- 直接过滤掉别人的
\`\`\`

这样根本不会查出无权访问的记录，最干净。

---

## 13.9 生活类比汇总

| 概念 | 类比 |
|------|------|
| 资源级权限 | 文件柜里贴名字的抽屉 |
| 间接归属 | 套娃，要顺着往外看主人 |
| Scope | VIP 卡等级（本店/全城/全国） |
| OAuth2 scope | 授权书上写明的代办范围 |
| 动态权限 | 会员卡 + 营业时间限制 |
| 拒绝原因 | 保安告诉你"为什么不能进" |

---

## 13.10 本章小结

| 知识点 | 要点 |
|--------|------|
| 资源级权限 | 不只看"你是谁"，还看"操作哪个对象" |
| 两层检查 | 能力检查（RBAC）+ 归属检查（资源）缺一不可 |
| Scope | 把"能力"和"范围"分开 |
| OAuth2 scopes | token 级权限，最小权限原则 |
| 动态权限 | 基于上下文（时间/状态/IP）的判断 |
| 性能 | 批量预加载或 SQL 层过滤避免 N+1 |

下一章我们进入企业级方案——Access Token + Refresh Token 双 Token 机制，解决"安全"和"体验"的矛盾。
`,
    code: `"""
第十三章 demo：细粒度权限控制（资源级 + Scope + 动态条件）
目标：实现"用户只能编辑自己的文章"等资源级权限检查，
      演示两层检查（能力 + 归属）和动态条件判断。
只依赖标准库，直接 python 运行。
"""
import time


# ============================================================
# 一、数据模型：User / Article
# ============================================================

class User:
    """
    用户模型，包含：
    - 基础信息（id, username, dept_id）
    - 角色（roles）
    - 权限（permissions）
    - token 的 scopes（OAuth2 scope 演示用）
    """
    def __init__(self, uid, username, dept_id, roles, permissions, token_scopes=None):
        self.id = uid
        self.username = username
        self.dept_id = dept_id        # 所属部门
        self.roles = set(roles)
        self.permissions = set(permissions)
        # token_scopes 模拟 OAuth2 token 上带的 scope
        # 注意：scope 是 token 级的，可能比用户权限更窄
        self.token_scopes = set(token_scopes or [])

    def has_permission(self, code):
        """能力检查：用户是否拥有某权限"""
        return code in self.permissions

    def has_scope(self, scope):
        """scope 检查：当前 token 是否带某 scope"""
        return scope in self.token_scopes


class Article:
    """
    文章模型，关键字段：
    - id, title
    - author_id：作者（归属判断用）
    - dept_id：所属部门（部门级权限用）
    - status：状态（动态条件用，draft/published）
    """
    def __init__(self, aid, title, author_id, dept_id, status="draft"):
        self.id = aid
        self.title = title
        self.author_id = author_id
        self.dept_id = dept_id
        self.status = status   # draft=草稿, published=已发布


# ============================================================
# 二、核心：资源级权限检查函数
# ============================================================

def can_edit_article(user, article, context=None):
    """
    判断用户能否编辑某篇文章。
    返回 (是否允许, 原因) —— 拒绝时一定要给原因。

    规则：
    1. 已发布文章只有 admin 能改
    2. 作者本人能改自己的文章
    3. 编辑能改本部门的草稿
    4. admin 能改任何文章
    5. 必须有 article:write 权限（能力检查）

    注意：能力检查（RBAC 层）和归属检查（资源层）两层都要过。
    """
    # ---- 第一层：能力检查 ----
    if not user.has_permission("article:write"):
        return False, "缺少 article:write 权限"

    # ---- 动态条件：已发布文章只有 admin 能改 ----
    if article.status == "published" and "admin" not in user.roles:
        return False, "已发布文章仅管理员可修改"

    # ---- 第二层：归属检查 ----
    # 规则 2：作者本人
    if article.author_id == user.id:
        return True, "作者本人，可修改"

    # 规则 3：编辑改本部门草稿
    if "editor" in user.roles:
        if article.dept_id == user.dept_id and article.status == "draft":
            return True, "编辑可修改本部门草稿"
        return False, "编辑只能修改本部门草稿"

    # 规则 4：admin 改任何
    if "admin" in user.roles:
        return True, "管理员可修改任何文章"

    return False, "无权修改他人文章"


def can_edit_article_with_scope(user, article, required_scope="article:write:own"):
    """
    带 scope 的权限检查：演示 OAuth2 scope 的细粒度控制。
    required_scope 指定本次操作需要的最小 scope。

    三档 scope：
      article:write:own   只能改自己的
      article:write:dept  能改本部门的
      article:write:all   能改所有人的
    """
    # 先检查 token 是否带要求的 scope
    if not user.has_scope(required_scope):
        return False, f"token 缺少 scope: {required_scope}"

    # 根据 scope 决定能改哪些文章
    if required_scope == "article:write:own":
        # 只能改自己的
        if article.author_id != user.id:
            return False, "scope=own，只能改自己的文章"
        return True, "scope=own，作者本人"

    if required_scope == "article:write:dept":
        # 能改本部门的
        if article.dept_id != user.dept_id:
            return False, "scope=dept，只能改本部门文章"
        return True, "scope=dept，本部门文章"

    if required_scope == "article:write:all":
        # 能改所有人的
        return True, "scope=all，任何文章"

    return False, f"未知 scope: {required_scope}"


# ============================================================
# 三、模拟上下文（动态权限用）
# ============================================================

class Context:
    """请求上下文，存动态权限判断需要的环境信息"""
    def __init__(self, current_hour, ip):
        self.current_hour = current_hour   # 当前小时（工作时间判断）
        self.ip = ip

    def is_working_hours(self):
        """是否在工作时间 9-18 点"""
        return 9 <= self.current_hour < 18


def can_edit_with_dynamic(user, article, ctx):
    """
    动态权限：在静态权限之上加环境条件。
    演示"非工作时间不能编辑"的规则。
    """
    # 先过静态 + 资源级检查
    ok, reason = can_edit_article(user, article, ctx)
    if not ok:
        return False, reason
    # 再过动态条件
    if not ctx.is_working_hours():
        return False, f"非工作时间（当前 {ctx.current_hour} 点），禁止编辑"
    return True, reason + "，且在工作时间内"


# ============================================================
# 四、搭建测试数据
# ============================================================

# 部门：1=研发, 2=市场
# 用户
u_zhang = User(1, "张三", dept_id=1, roles={"editor"},
               permissions={"article:read", "article:write"})
u_li = User(2, "李四", dept_id=1, roles={"editor"},
            permissions={"article:read", "article:write"})
u_wang = User(3, "王五", dept_id=2, roles={"editor"},
              permissions={"article:read", "article:write"})
u_admin = User(9, "管理员", dept_id=1, roles={"admin"},
               permissions={"article:read", "article:write", "article:delete"})
u_visitor = User(5, "访客", dept_id=1, roles={"visitor"},
                 permissions={"article:read"})

# 文章
a1 = Article(101, "张三的草稿", author_id=1, dept_id=1, status="draft")
a2 = Article(102, "李四的草稿", author_id=2, dept_id=1, status="draft")
a3 = Article(103, "市场部王五的草稿", author_id=3, dept_id=2, status="draft")
a4 = Article(104, "张三的已发布文章", author_id=1, dept_id=1, status="published")


# ============================================================
# 五、测试场景一：资源级权限（归属检查）
# ============================================================

print("=" * 60)
print("场景一：资源级权限——谁能改哪篇文章")
print("=" * 60)

cases = [
    # (用户, 文章, 预期, 说明)
    (u_zhang, a1, True,  "张三改自己的草稿"),
    (u_zhang, a2, True,  "张三(编辑)改同部门李四的草稿"),
    (u_zhang, a3, False, "张三改跨部门王五的草稿"),
    (u_zhang, a4, False, "张三改自己的已发布文章（仅admin可改）"),
    (u_admin, a4, True,  "管理员改任何已发布文章"),
    (u_admin, a2, True,  "管理员改别人的草稿"),
    (u_visitor, a1, False, "访客无写权限"),
]

for user, article, expected, desc in cases:
    ok, reason = can_edit_article(user, article)
    tag = "PASS" if ok == expected else "FAIL"
    print(f"  [{tag}] {desc}")
    print(f"         用户={user.username} 文章#{article.id}({article.status})")
    print(f"         结果={ok} 原因={reason}")


# ============================================================
# 六、测试场景二：OAuth2 Scope 细粒度
# ============================================================

print()
print("=" * 60)
print("场景二：OAuth2 Scope——同一个用户，不同 scope 的 token")
print("=" * 60)

# 给张三发三个不同 scope 的 token（模拟不同场景登录）
u_zhang_own = User(1, "张三(own)", 1, {"editor"},
                   {"article:write"}, token_scopes={"article:write:own"})
u_zhang_dept = User(1, "张三(dept)", 1, {"editor"},
                    {"article:write"}, token_scopes={"article:write:dept"})
u_zhang_all = User(1, "张三(all)", 1, {"editor"},
                   {"article:write"}, token_scopes={"article:write:all"})
u_zhang_noscope = User(1, "张三(无scope)", 1, {"editor"},
                       {"article:write"}, token_scopes=set())

scope_cases = [
    (u_zhang_own,    a1, "article:write:own",  True,  "scope=own 改自己的"),
    (u_zhang_own,    a2, "article:write:own",  False, "scope=own 改别人的"),
    (u_zhang_dept,   a2, "article:write:dept", True,  "scope=dept 改本部门的"),
    (u_zhang_dept,   a3, "article:write:dept", False, "scope=dept 改跨部门的"),
    (u_zhang_all,    a3, "article:write:all",  True,  "scope=all 改任何"),
    (u_zhang_noscope, a1, "article:write:own", False, "无 scope 的 token 被拒"),
]

for user, article, scope, expected, desc in scope_cases:
    ok, reason = can_edit_article_with_scope(user, article, scope)
    tag = "PASS" if ok == expected else "FAIL"
    print(f"  [{tag}] {desc}")
    print(f"         {user.username} 文章#{article.id} 需要 scope={scope}")
    print(f"         结果={ok} 原因={reason}")


# ============================================================
# 七、测试场景三：动态权限（工作时间）
# ============================================================

print()
print("=" * 60)
print("场景三：动态权限——工作时间限制")
print("=" * 60)

# 张三在工作时间改自己文章
ctx_day = Context(current_hour=14, ip="10.0.0.1")
ok, reason = can_edit_with_dynamic(u_zhang, a1, ctx_day)
print(f"  工作时间(14点) 张三改自己草稿 -> {ok}, {reason}")

# 张三在非工作时间改自己文章
ctx_night = Context(current_hour=23, ip="10.0.0.1")
ok, reason = can_edit_with_dynamic(u_zhang, a1, ctx_night)
print(f"  非工作时间(23点) 张三改自己草稿 -> {ok}, {reason}")

# 管理员在非工作时间改已发布文章（动态条件同样生效）
ok, reason = can_edit_with_dynamic(u_admin, a4, ctx_night)
print(f"  非工作时间(23点) 管理员改已发布 -> {ok}, {reason}")


# ============================================================
# 八、测试场景四：把资源级检查做成 FastAPI 风格的依赖
# ============================================================

print()
print("=" * 60)
print("场景四：模拟 FastAPI 路由里的资源级检查")
print("=" * 60)

def update_article_route(user, article_id):
    """
    模拟 PUT /articles/{article_id} 路由。
    实际 FastAPI 里 user 由 Depends 注入，article 由路径参数查库得到。
    """
    # 模拟从数据库查出文章
    article_db = {101: a1, 102: a2, 103: a3, 104: a4}
    article = article_db.get(article_id)
    if not article:
        return {"status": 404, "error": "文章不存在"}
    # 两层权限检查
    ok, reason = can_edit_article(user, article)
    if not ok:
        return {"status": 403, "error": reason}
    # 通过，执行更新
    return {"status": 200, "msg": f"{user.username} 更新了文章#{article.id}"}

# 张三尝试更新各文章
for aid in [101, 102, 103, 104]:
    result = update_article_route(u_zhang, aid)
    print(f"  张三 PUT /articles/{aid} -> {result}")

# 管理员尝试更新各文章
for aid in [101, 102, 103, 104]:
    result = update_article_route(u_admin, aid)
    print(f"  管理员 PUT /articles/{aid} -> {result}")


print()
print("=" * 60)
print("小结")
print("=" * 60)
print("""
  1. 资源级权限 = 能力检查(RBAC) + 归属检查(资源 owner)
  2. 两层检查缺一不可：先能力后归属
  3. Scope 把"能力"和"范围"分开：own/dept/all
  4. OAuth2 scope 是 token 级限制，比用户权限更窄
  5. 动态权限基于上下文（时间/状态/IP），在静态之上加条件
  6. 拒绝时一定要返回原因，方便排查和审计
""")
`,
  },

  // =========================================================
  // 第十四章：Access Token + Refresh Token 双 Token 机制
  // =========================================================
  {
    id: "fa-refresh-token",
    group: "第五部分 企业级方案",
    icon: "🔄",
    title: "Access Token + Refresh Token 双 Token 机制",
    content: `# 第十四章 Access Token + Refresh Token 双 Token 机制

> 单 Token 有个死结：有效期长 → 被盗风险大；有效期短 → 用户老得重新登录。
> 双 Token 机制破解了这个结：**Access Token 短命负责干活，Refresh Token 长命负责续期。**
> 就像会员卡：日卡天天进店刷（短命），但用储值卡（长命）能换新的日卡，不用重新办卡。

---

## 14.1 为什么需要双 Token

### 14.1.1 单 Token 的两难

假设系统只有一个 token：

| 有效期 | 安全性 | 用户体验 |
|--------|--------|----------|
| 长（30 天） | 差——被盗后 30 天都能用 | 好——一个月不用登录 |
| 短（15 分钟） | 好——被盗最多用 15 分钟 | 差——每 15 分钟要重新登录 |

这就是"安全性 vs 用户体验"的经典矛盾。**单 token 无论怎么设有效期，都顾此失彼。**

### 14.1.2 生活类比：游乐园手环

\`\`\`
方案 A：发一个"全天通玩"手环
  → 好处：一天不用再办
  → 坏处：手环丢了，别人捡到能玩一天

方案 B：发一个"15 分钟体验"手环
  → 好处：丢了也就损失 15 分钟
  → 坏处：每 15 分钟要去柜台重新办，烦死

方案 C（双 Token）：
  → 发一个"15 分钟体验"手环（Access Token，短命）
  → 同时发一张"全天换手环券"（Refresh Token，长命）
  → 手环过期了，凭券去柜台换新手续环，不用重新买票
  → 券丢了才是真损失（但券可以藏在保险柜，不拿出来用）
\`\`\`

这就是双 Token 的精髓。

### 14.1.3 双 Token 的核心思想

\`\`\`
Access Token   →  短命（15分钟~2小时）  →  每个 API 请求都用它  →  暴露风险高
Refresh Token  →  长命（7天~30天）       →  只在续期时用一次     →  暴露风险低
\`\`\`

关键：**Refresh Token 不直接访问业务 API，只用来换新的 Access Token。**

---

## 14.2 Access Token 的职责

### 14.2.1 特点

- **短期有效**：15 分钟 ~ 2 小时
- **无状态**：通常是 JWT，服务端不存
- **每次请求带**：放在 Authorization 头
- **被盗风险高**：每次请求都传输，容易在日志/中间人处泄露

### 14.2.2 为什么短命能容忍

即使 Access Token 被盗，攻击者最多能用 15 分钟。15 分钟后 token 过期，攻击者想继续访问必须有 Refresh Token——但 Refresh Token 很少传输，泄露概率低。

### 14.2.3 Access Token 里装什么

\`\`\`json
{
  "sub": "user_123",          // 用户 ID
  "roles": ["editor"],        // 角色
  "scopes": ["article:write"],// 权限范围
  "iat": 1700000000,          // 签发时间
  "exp": 1700000900           // 过期时间（15 分钟后）
}
\`\`\`

注意：**不要放敏感信息**（密码、手机号），因为 JWT 是 base64 编码，不是加密。

---

## 14.3 Refresh Token 的职责

### 14.3.1 特点

- **长期有效**：7 天 ~ 30 天
- **有状态**：服务端要存（数据库/Redis），用于校验和撤销
- **只在续期时传输**：不每个请求都带
- **被盗风险低**：传输次数少，且可服务端撤销

### 14.3.2 为什么 Refresh Token 必须有状态

Access Token 可以无状态（JWT 解码即用），但 Refresh Token **必须服务端存一份**：

\`\`\`
为什么？因为要能撤销！
  - 用户登出 → 删掉 Refresh Token → 立即失效
  - 检测到被盗 → 撤销 → 攻击者用不了
\`\`\`

无状态的东西没法主动撤销（见第十五章 JWT 黑名单的痛苦）。

### 14.3.3 Refresh Token 里装什么

\`\`\`json
{
  "sub": "user_123",
  "jti": "rt_abc123unique",   // 唯一 ID，用于服务端识别和撤销
  "iat": 1700000000,
  "exp": 1700604800           // 7 天后
}
\`\`\`

注意 \`jti\`（JWT ID）——服务端用它在数据库里找这条记录。

---

## 14.4 完整的刷新流程

### 14.4.1 时序图

\`\`\`
客户端                        服务端
  |                              |
  |  1. 登录（账号密码）          |
  | ───────────────────────────→ |
  |                              | 校验密码
  |                              | 生成 Access Token（15min）
  |                              | 生成 Refresh Token（7d）+ 存库
  |  2. 返回两个 token            |
  | ←─────────────────────────── |
  |                              |
  |  3. 用 Access 访问 API        |
  | ───────────────────────────→ | 验证 Access，处理业务
  |  4. 返回数据                  |
  | ←─────────────────────────── |
  |                              |
  |  ... 15 分钟后，Access 过期 ...|
  |                              |
  |  5. 用 Refresh 换新 Access    |
  | ───────────────────────────→ | 验证 Refresh 有效（查库）
  |                              | 检查是否被撤销/轮换
  |                              | 生成新 Access（可选：新 Refresh）
  |  6. 返回新 token              |
  | ←─────────────────────────── |
  |                              |
  |  7. 用新 Access 继续访问      |
  | ───────────────────────────→ |
\`\`\`

### 14.4.2 关键步骤详解

**步骤 1-2 登录**：服务端生成两个 token，Refresh Token 要存库（带 jti、用户、过期时间）。

**步骤 3-4 正常访问**：客户端只带 Access Token，服务端无状态验证。

**步骤 5-6 刷新**：Access 过期后，客户端用 Refresh Token 调用 \`/refresh\` 接口，服务端查库验证 Refresh 有效后，发新的 Access Token。

**步骤 7**：客户端用新 Access 继续干活。

### 14.4.3 客户端怎么知道 Access 过期了

两种方式：

1. **看本地过期时间**：客户端自己记，到期前主动刷新
2. **服务端返回 401**：API 返回 401 时，客户端先去刷新再重试

主流方案是**两者结合**：到期前主动刷新，过期了被动 401 重试。

---

## 14.5 Refresh Token 的存储

### 14.5.1 方案一：数据库

\`\`\`sql
CREATE TABLE refresh_tokens (
    jti         VARCHAR(64) PRIMARY KEY,   -- token 唯一 ID
    user_id     BIGINT NOT NULL,
    expires_at  DATETIME NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,     -- 是否已撤销
    created_at  DATETIME DEFAULT NOW()
);
\`\`\`

优点：简单，可审计。缺点：每次刷新都查库，慢。

### 14.5.2 方案二：Redis（推荐）

\`\`\`python
# key: refresh:{jti}
# value: {user_id, ...}
# 过期时间：refresh token 的有效期
redis.setex(f"refresh:{jti}", 7*24*3600, json.dumps({"user_id": uid}))
\`\`\`

优点：快，自动过期清理。缺点：Redis 重启数据丢（可接受，丢了用户重新登录）。

### 14.5.3 生活类比：会员卡续期券

\`\`\`
数据库方案：续期券登记在公司账本上（查得慢但能留底）
Redis 方案：续期券挂在门口电子屏上（查得快，断电就没了）
\`\`\`

---

## 14.6 安全考量：Refresh Token 的一次性使用与轮换

### 14.6.1 为什么要一次性使用

如果 Refresh Token 可以无限次用，攻击者偷到一个就能 7 天随便刷。**一次性使用**让每次刷新都产生新 token，旧的立即失效：

\`\`\`
刷新前：Refresh Token = RT_A（有效）
刷新后：RT_A 失效，发新的 RT_B（有效）
\`\`\`

这样攻击者即使偷到 RT_A，只要合法用户刷新过一次，RT_A 就废了。

### 14.6.2 轮换（Rotation）的实现

\`\`\`python
def refresh(rt_old):
    # 1. 验证旧 RT 有效
    record = db.get(rt_old.jti)
    if not record or record.revoked or record.expired:
        raise 401
    # 2. 撤销旧 RT
    record.revoked = True
    # 3. 生成新 RT
    rt_new = generate_refresh_token(record.user_id)
    db.save(rt_new)
    # 4. 生成新 Access
    access = generate_access_token(record.user_id)
    return access, rt_new
\`\`\`

### 14.6.3 重用检测（Reuse Detection）—— 关键安全机制

如果有人拿一个**已被撤销**的 RT 来刷新，说明两种可能：

1. 攻击者偷了旧 RT（合法用户已刷新过）
2. 攻击者在用偷来的 RT，合法用户也在用

**对策**：检测到"已撤销的 RT 被使用" → 立即撤销该用户的**所有** RT，强制重新登录。

\`\`\`python
def refresh(rt_old):
    record = db.get(rt_old.jti)
    if record and record.revoked:
        # 危险！这个 RT 已经被轮换过了，现在又出现 = 被盗了
        revoke_all_tokens(record.user_id)   # 撤销该用户所有 RT
        raise 401, "检测到 token 重用，请重新登录"
\`\`\`

这是 Refresh Token 轮换的**精华**——能主动发现盗用并止损。

### 14.6.4 生活类比：会员卡续期券的一次性

\`\`\`
游乐园规定：续期券只能用一次，用完作废，发新券。
  → 有人拿一张"已作废"的券来换 → 说明券被偷了
  → 立刻挂失该客户所有券，让他重新实名办卡
\`\`\`

---

## 14.7 完整的双 Token 接口设计

### 14.7.1 三个核心接口

\`\`\`
POST /auth/login       # 登录，返回 access + refresh
POST /auth/refresh     # 用 refresh 换新 access（+新 refresh）
POST /auth/logout      # 登出，撤销 refresh
\`\`\`

### 14.7.2 登录接口

\`\`\`python
@app.post("/auth/login")
def login(form: LoginForm):
    user = verify_password(form.username, form.password)
    if not user:
        raise 401, "账号或密码错误"
    access = create_access_token(user, expires=15*60)      # 15 分钟
    refresh = create_refresh_token(user, expires=7*24*60*60)  # 7 天
    save_refresh_token(refresh)  # 存库
    return {"access_token": access, "refresh_token": refresh}
\`\`\`

### 14.7.3 刷新接口

\`\`\`python
@app.post("/auth/refresh")
def refresh(body: RefreshForm):
    rt = decode_refresh_token(body.refresh_token)
    record = db.get(rt.jti)
    # 重用检测
    if record.revoked:
        revoke_all(rt.user_id)
        raise 401, "token 被盗，请重新登录"
    if not record or record.expired:
        raise 401, "refresh token 无效"
    # 轮换：旧的撤销，发新的
    record.revoked = True
    new_access = create_access_token(rt.user_id, expires=15*60)
    new_refresh = create_refresh_token(rt.user_id, expires=7*24*60*60)
    save_refresh_token(new_refresh)
    return {"access_token": new_access, "refresh_token": new_refresh}
\`\`\`

### 14.7.4 登出接口

\`\`\`python
@app.post("/auth/logout")
def logout(user = Depends(get_current_user), body: LogoutForm):
    # 撤销 refresh token
    rt = decode_refresh_token(body.refresh_token)
    record = db.get(rt.jti)
    if record:
        record.revoked = True
    # 注意：access token 是无状态的，无法立即撤销
    # 这就是为什么 access token 要短命——最多等 15 分钟自动失效
    return {"msg": "已登出"}
\`\`\`

---

## 14.8 客户端如何配合

### 14.8.1 存储位置

| Token | 存哪 | 为什么 |
|-------|------|--------|
| Access Token | 内存（JS 变量） | 频繁使用，丢了重新刷新即可 |
| Refresh Token | HttpOnly Cookie | 不暴露给 JS，防 XSS 偷取 |

### 14.8.2 自动刷新的两种策略

**策略一：到期前主动刷新**

\`\`\`javascript
// 客户端定时检查，快到期就刷新
setInterval(() => {
  if (willExpireSoon(accessToken)) {
    refreshTokens();
  }
}, 60 * 1000);  // 每分钟检查
\`\`\`

**策略二：401 拦截重试**

\`\`\`javascript
// 请求返回 401 时，先刷新再重试
async function request(url) {
  let resp = await fetch(url, {headers: {Authorization: \`Bearer \${access}\`}});
  if (resp.status === 401) {
    await refreshTokens();   // 用 refresh 换新 access
    resp = await fetch(url, {headers: {Authorization: \`Bearer \${access}\`}});  // 重试
  }
  return resp;
}
\`\`\`

### 14.8.3 并发刷新问题

多个请求同时发现 401，会同时触发刷新，导致 Refresh Token 被多次使用 → 触发重用检测 → 用户被踢。

**对策**：客户端加锁，第一个 401 触发刷新，其他请求等刷新完成再用新 token 重试。

---

## 14.9 常见误区

### 14.9.1 把 Refresh Token 当 Access Token 用

错误：每个 API 请求都带 Refresh Token。

后果：Refresh Token 暴露面变大，失去"低频传输"的安全优势，且违反一次性使用原则。

### 14.9.2 Refresh Token 不存库

错误：Refresh Token 也用无状态 JWT，服务端不存。

后果：无法撤销，无法做轮换和重用检测，等同于一个长命的 Access Token——回到单 Token 的老问题。

### 14.9.3 Access Token 有效期设太长

错误：图省事，Access Token 设 24 小时。

后果：失去双 Token 的安全意义，被偷后 24 小时都能用。Access Token 应该短（15 分钟 ~ 2 小时）。

---

## 14.10 生活类比汇总

| 概念 | 类比 |
|------|------|
| Access Token | 日卡手环（短命，频繁刷） |
| Refresh Token | 续期券（长命，偶尔用） |
| 刷新流程 | 凭续期券换新日卡手环 |
| 一次性使用 | 券用一次作废，发新券 |
| 重用检测 | 旧券又出现 = 被偷，挂失所有券 |
| 存库 | 续期券要登记，能挂失 |
| 短命 Access | 日卡丢了最多损失一天 |

---

## 14.11 本章小结

| 知识点 | 要点 |
|--------|------|
| 为什么双 Token | 解决安全 vs 体验矛盾 |
| Access Token | 短命、无状态、每次请求带 |
| Refresh Token | 长命、有状态、只续期用 |
| 刷新流程 | Access 过期 → 用 Refresh 换新 Access |
| 存储 | Refresh 存 Redis/DB，必须能撤销 |
| 轮换 | 一次性使用，旧的立即作废 |
| 重用检测 | 旧 RT 再现 = 被盗，撤销所有 RT |
| 客户端 | 主动刷新 + 401 重试，注意并发加锁 |

下一章讲 JWT 的"老大难"——无状态导致无法主动失效，我们用黑名单方案解决 Logout。
`,
    code: `"""
第十四章 demo：Access Token + Refresh Token 双 Token 完整流程
目标：实现登录、刷新、轮换、重用检测、登出，
      演示双 Token 机制如何兼顾安全和体验。
只依赖标准库，JWT 用 base64 简化实现（演示原理，非生产可用）。
"""
import base64
import json
import time
import secrets


# ============================================================
# 一、简化的 JWT 实现（仅演示，非生产安全）
# ============================================================
# 生产环境用 PyJWT 库，这里手写一个极简版演示原理。
# 真正的 JWT 有签名（HS256 等），这里省略签名，只做 base64 编码。

def b64(obj):
    """把字典编码成 base64 字符串"""
    return base64.urlsafe_b64encode(json.dumps(obj).encode()).decode().rstrip("=")


def unb64(s):
    """把 base64 字符串解码成字典"""
    pad = "=" * (-len(s) % 4)
    return json.loads(base64.urlsafe_b64decode(s + pad).decode())


def make_token(payload):
    """生成 token：header.payload（省略 signature）"""
    header = b64({"alg": "demo", "typ": "JWT"})
    body = b64(payload)
    return f"{header}.{body}"


def decode_token(token):
    """解码 token，返回 payload"""
    try:
        parts = token.split(".")
        return unb64(parts[1])
    except Exception:
        return None


# ============================================================
# 二、Refresh Token 存储层（模拟数据库）
# ============================================================

class RefreshTokenStore:
    """
    Refresh Token 存储：模拟数据库表。
    每条记录：jti -> {user_id, expires_at, revoked}
    生产环境用 Redis 或数据库。
    """
    def __init__(self):
        self.records = {}   # jti -> dict

    def save(self, jti, user_id, expires_at):
        """存一条 refresh token 记录"""
        self.records[jti] = {
            "user_id": user_id,
            "expires_at": expires_at,
            "revoked": False,
            "created_at": time.time(),
        }

    def get(self, jti):
        return self.records.get(jti)

    def revoke(self, jti):
        """撤销单个 token"""
        rec = self.records.get(jti)
        if rec:
            rec["revoked"] = True

    def revoke_all_of_user(self, user_id):
        """
        撤销某用户的所有 refresh token（重用检测时调用）。
        生活类比：发现续期券被偷，立刻挂失该客户所有券。
        """
        for jti, rec in self.records.items():
            if rec["user_id"] == user_id:
                rec["revoked"] = True


# ============================================================
# 三、认证服务：登录 / 刷新 / 登出
# ============================================================

class AuthService:
    """
    认证服务：实现双 Token 机制的完整流程。
    """
    # 有效期配置
    ACCESS_TTL = 15 * 60         # Access Token 15 分钟
    REFRESH_TTL = 7 * 24 * 60 * 60  # Refresh Token 7 天

    def __init__(self):
        self.store = RefreshTokenStore()
        # 模拟用户库
        self.users = {
            "zhangsan": {"id": 1, "password": "123456"},
        }

    def _gen_jti(self):
        """生成唯一的 token ID（jti）"""
        return "rt_" + secrets.token_hex(8)

    def login(self, username, password):
        """
        登录：验证密码，签发 access + refresh。
        refresh 要存库（有状态），access 不存（无状态）。
        """
        user = self.users.get(username)
        if not user or user["password"] != password:
            raise ValueError("账号或密码错误")

        now = int(time.time())
        # 生成 Access Token（短命，15 分钟）
        access_payload = {
            "sub": username,
            "uid": user["id"],
            "type": "access",
            "iat": now,
            "exp": now + self.ACCESS_TTL,
        }
        access = make_token(access_payload)

        # 生成 Refresh Token（长命，7 天）+ 存库
        jti = self._gen_jti()
        refresh_payload = {
            "sub": username,
            "uid": user["id"],
            "type": "refresh",
            "jti": jti,                     # 唯一 ID，用于撤销
            "iat": now,
            "exp": now + self.REFRESH_TTL,
        }
        refresh = make_token(refresh_payload)
        # 存库：jti -> 记录
        self.store.save(jti, user["id"], now + self.REFRESH_TTL)

        return access, refresh

    def verify_access(self, access_token):
        """验证 Access Token，返回 payload 或 None"""
        payload = decode_token(access_token)
        if not payload:
            return None
        if payload.get("type") != "access":
            return None
        if payload.get("exp", 0) < time.time():
            return None   # 过期
        return payload

    def refresh(self, refresh_token):
        """
        刷新流程：用 refresh 换新 access + 新 refresh。
        关键安全机制：
          1. 轮换：旧 refresh 立即作废
          2. 重用检测：旧 refresh 再现 = 被盗，撤销该用户所有 token
        """
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("refresh token 格式错误")

        jti = payload.get("jti")
        record = self.store.get(jti)

        # ---- 重用检测 ----
        # 如果记录存在但已 revoked，说明这个 refresh 已被用过了
        # 现在又出现 = 被攻击者偷了 → 立即撤销该用户所有 token
        if record and record["revoked"]:
            self.store.revoke_all_of_user(record["user_id"])
            raise ValueError("检测到 token 重用，已撤销该用户所有 token，请重新登录")

        # ---- 常规校验 ----
        if not record:
            raise ValueError("refresh token 不存在")
        if record["expires_at"] < time.time():
            raise ValueError("refresh token 已过期")

        # ---- 轮换：旧的立即作废 ----
        self.store.revoke(jti)

        # ---- 签发新 token ----
        now = int(time.time())
        new_access = make_token({
            "sub": payload["sub"],
            "uid": payload["uid"],
            "type": "access",
            "iat": now,
            "exp": now + self.ACCESS_TTL,
        })
        new_jti = self._gen_jti()
        new_refresh = make_token({
            "sub": payload["sub"],
            "uid": payload["uid"],
            "type": "refresh",
            "jti": new_jti,
            "iat": now,
            "exp": now + self.REFRESH_TTL,
        })
        self.store.save(new_jti, payload["uid"], now + self.REFRESH_TTL)

        return new_access, new_refresh

    def logout(self, refresh_token):
        """登出：撤销 refresh token。access 无法立即撤销（无状态）。"""
        payload = decode_token(refresh_token)
        if payload and payload.get("type") == "refresh":
            self.store.revoke(payload.get("jti"))


# ============================================================
# 四、运行完整流程演示
# ============================================================

auth = AuthService()

print("=" * 60)
print("场景一：正常登录 → 访问 → 过期 → 刷新 → 再访问")
print("=" * 60)

# 1. 登录
access, refresh = auth.login("zhangsan", "123456")
print(f"  登录成功")
print(f"    access  (前40字): {access[:40]}...")
print(f"    refresh (前40字): {refresh[:40]}...")

# 2. 用 access 访问
payload = auth.verify_access(access)
print(f"  用 access 访问 -> {'通过' if payload else '拒绝'} (用户={payload['sub']})")

# 3. 模拟 access 过期：手动改 payload 的 exp
expired_access = make_token({
    "sub": "zhangsan", "uid": 1, "type": "access",
    "iat": int(time.time()) - 100,
    "exp": int(time.time()) - 10,   # 已过期
})
payload = auth.verify_access(expired_access)
print(f"  用过期 access 访问 -> {'通过' if payload else '拒绝(过期)'}")

# 4. 用 refresh 换新 access
new_access, new_refresh = auth.refresh(refresh)
print(f"  用 refresh 刷新 -> 成功，得到新 access 和新 refresh")

# 5. 用新 access 访问
payload = auth.verify_access(new_access)
print(f"  用新 access 访问 -> {'通过' if payload else '拒绝'}")

# 6. 旧的 refresh 应该已作废（轮换）
print()
print("=" * 60)
print("场景二：轮换——旧 refresh 不能再用")
print("=" * 60)
try:
    auth.refresh(refresh)   # 用旧的 refresh
    print(f"  旧 refresh 刷新 -> 成功（这不应该发生！）")
except ValueError as e:
    print(f"  旧 refresh 刷新 -> 拒绝：{e}")
    print(f"  原因：刷新后旧 refresh 已作废（轮换机制）")

# ============================================================
print()
print("=" * 60)
print("场景三：重用检测——攻击者偷了旧 refresh")
print("=" * 60)

# 重新登录开始干净场景
access2, refresh2 = auth.login("zhangsan", "123456")
# 合法用户先刷新一次
new_access2, new_refresh2 = auth.refresh(refresh2)
print(f"  合法用户刷新成功，旧 refresh2 已作废")

# 攻击者拿着偷来的旧 refresh2 试图刷新
try:
    auth.refresh(refresh2)
    print(f"  攻击者用旧 refresh2 -> 成功（安全漏洞！）")
except ValueError as e:
    print(f"  攻击者用旧 refresh2 -> 拒绝：{e}")
    print(f"  → 触发重用检测，已撤销该用户所有 token")

# 此时连合法用户的新 refresh2 也应该被撤销了
try:
    auth.refresh(new_refresh2)
    print(f"  合法用户用新 refresh2 -> 成功（不该成功，应已被撤销）")
except ValueError as e:
    print(f"  合法用户用新 refresh2 -> 拒绝：{e}")
    print(f"  → 重用检测连坐，合法用户需重新登录（安全优先）")

# ============================================================
print()
print("=" * 60)
print("场景四：登出撤销 refresh")
print("=" * 60)

access3, refresh3 = auth.login("zhangsan", "123456")
print(f"  登录成功，refresh3 已签发")

# 登出
auth.logout(refresh3)
print(f"  登出：refresh3 已撤销")

# 登出后用 refresh3 刷新应失败
try:
    auth.refresh(refresh3)
    print(f"  登出后用 refresh3 -> 成功（漏洞！）")
except ValueError as e:
    print(f"  登出后用 refresh3 -> 拒绝：{e}")

# 但 access3 在过期前还能用（无状态，无法立即撤销）
# 这就是为什么 access 要短命——最多等它自然过期
payload = auth.verify_access(access3)
print(f"  登出后用 access3 访问 -> {'还能用(无状态,等过期)' if payload else '已失效'}")
print(f"  → 这就是 access token 必须短命的原因！")

# ============================================================
print()
print("=" * 60)
print("场景五：refresh token 过期")
print("=" * 60)

# 手动构造一个过期的 refresh
expired_refresh = make_token({
    "sub": "zhangsan", "uid": 1, "type": "refresh",
    "jti": "rt_expired_demo",
    "iat": int(time.time()) - 8 * 24 * 3600,
    "exp": int(time.time()) - 24 * 3600,   # 1 天前过期
})
# 存一条过期记录
auth.store.save("rt_expired_demo", 1, time.time() - 24 * 3600)
try:
    auth.refresh(expired_refresh)
    print(f"  过期 refresh -> 成功（漏洞！）")
except ValueError as e:
    print(f"  过期 refresh -> 拒绝：{e}")
    print(f"  → 7 天没活动，refresh 也过期了，必须重新登录")

# ============================================================
print()
print("=" * 60)
print("小结")
print("=" * 60)
print("""
  1. 双 Token：Access 短命干活，Refresh 长命续期
  2. Refresh 必须存库（有状态），才能撤销和轮换
  3. 轮换：每次刷新旧 RT 立即作废，发新的
  4. 重用检测：旧 RT 再现 = 被盗，撤销该用户所有 RT
  5. 登出：撤销 Refresh；Access 无状态只能等过期（所以要短命）
  6. 客户端：主动刷新 + 401 重试，注意并发加锁
""")
`,
  },

  // =========================================================
  // 第十五章：JWT 黑名单与 Token 撤销
  // =========================================================
  {
    id: "fa-jwt-blacklist",
    group: "第五部分 企业级方案",
    icon: "⬛",
    title: "JWT 黑名单与 Token 撤销（Logout）",
    content: `# 第十五章 JWT 黑名单与 Token 撤销（Logout）

> JWT 最大的优点是"无状态"——服务端不用存，解码即用。
> 但这也成了它最大的痛点：**没法主动让它失效**。
> 用户点"登出"，服务端却没法让他的 token 立刻作废——这就是 JWT 的"无状态困境"。
> 本章用**黑名单方案**破解这个困境。

---

## 15.1 JWT 无状态的困境

### 15.1.1 问题复现

传统 session 登出很简单：

\`\`\`python
def logout():
    session.delete(session_id)   # 删掉服务端 session，立即失效
\`\`\`

但 JWT：

\`\`\`python
def logout():
    # ??? token 在客户端手里，服务端无状态，怎么让它失效？
    pass
\`\`\`

因为 JWT 的设计就是"服务端不存任何东西"，token 一旦签发，**在过期前永远有效**。

### 15.1.2 这带来什么问题

| 场景 | 后果 |
|------|------|
| 用户点登出 | token 还能用，没真正登出 |
| token 被盗 | 无法主动撤销，只能等过期 |
| 修改密码后 | 旧 token 还能用，安全风险 |
| 管理员封号 | 被封用户的 token 还能用 |

### 15.1.3 生活类比：无法回收的门票

\`\`\`
传统 session = 寄存柜
  你存包拿一个号码牌（session id）
  取包时凭号码牌，柜子里的东西就没了
  → 想作废？把柜子清空，号码牌立刻失效

JWT = 一次性纸质门票
  售票处卖票后不留底（无状态）
  门票在过期前永远有效
  → 你说"我丢了/我要退"，售票处说"我没法让那张票作废，只能等它过期"
\`\`\`

---

## 15.2 黑名单方案

### 15.2.1 核心思路

既然没法让 token 主动失效，那就**记录"哪些 token 被撤销了"**，每次验证时查一下：

\`\`\`
验证 token 时：
  1. 先查黑名单 → 在黑名单 → 拒绝
  2. 不在黑名单 → 正常验证签名和过期时间
\`\`\`

相当于在"无状态"的基础上加了一点点"状态"——只记录被撤销的，不记录所有有效的。

### 15.2.2 为什么不记录所有有效 token

那是"白名单"，等于回到 session 模式，失去 JWT 无状态的优势。黑名单只记"少数被撤销的"，绝大多数 token 仍走无状态验证，性能好。

### 15.2.3 黑名单存什么

不需要存整个 token，存它的**唯一标识**即可：

\`\`\`
JWT 有个 jti（JWT ID）字段，是每个 token 的唯一 ID。
黑名单只需存 jti 集合：
  {"jti_abc123", "jti_def456", ...}
\`\`\`

### 15.2.4 生活类比：失信名单

\`\`\`
售票处不记录所有卖出的票（白名单太贵），
但维护一个"失信名单"（黑名单）：
  这些票号已挂失/作废
检票时：票号在失信名单 → 拒绝；不在 → 正常放行
\`\`\`

---

## 15.3 黑名单的存储：Redis + TTL

### 15.3.1 为什么用 Redis

| 要求 | Redis 的优势 |
|------|-------------|
| 查询快（每次请求都查） | 内存存储，O(1) 查询 |
| 自动清理过期数据 | TTL 机制，到期自动删 |
| 高并发 | 单线程无锁，性能稳定 |

### 15.3.2 TTL 的妙用

黑名单里的记录**不需要永久存**——token 过期后，黑名单记录也没用了：

\`\`\`
token 过期时间是 2024-01-01 12:00
黑名单记录的 TTL = token 剩余有效期
  → 12:00 后黑名单记录自动消失
\`\`\`

这样黑名单不会无限膨胀，Redis 自动清理。

### 15.3.3 Redis 操作

\`\`\`python
# 登出时：把 jti 加入黑名单，TTL = token 剩余有效期
def revoke_token(token):
    payload = decode(token)
    jti = payload["jti"]
    ttl = payload["exp"] - now()   # 剩余有效期
    redis.setex(f"blacklist:{jti}", ttl, "1")

# 验证时：查黑名单
def is_revoked(token):
    payload = decode(token)
    jti = payload["jti"]
    return redis.exists(f"blacklist:{jti}") > 0
\`\`\`

### 15.3.4 生活类比：会员卡续期券的挂失

\`\`\`
挂失一张续期券（jti）：
  在"挂失名单"上记一笔，到期自动划掉
  （续期券到期了，挂不挂失都没意义了）
\`\`\`

---

## 15.4 Logout 的完整流程

### 15.4.1 服务端要做的事

\`\`\`python
@app.post("/auth/logout")
def logout(user = Depends(get_current_user), request):
    token = extract_token(request)   # 从请求头取 token
    payload = decode(token)
    jti = payload["jti"]
    ttl = payload["exp"] - int(time.time())
    redis.setex(f"blacklist:{jti}", ttl, "1")   # 加入黑名单
    return {"msg": "已登出"}
\`\`\`

### 15.4.2 客户端要做的事

光服务端加黑名单不够，**客户端也要清除本地 token**：

\`\`\`javascript
async function logout() {
  await fetch("/auth/logout", {method: "POST"});  // 服务端加黑名单
  localStorage.removeItem("access_token");         // 客户端清除
  localStorage.removeItem("refresh_token");
  router.push("/login");
}
\`\`\`

为什么两边都要做？

| 只做一边 | 问题 |
|----------|------|
| 只服务端加黑名单 | 客户端 token 还在，可能被偷 |
| 只客户端清除 | token 没真正失效，偷到的还能用 |

**两边都做才是完整的 Logout**。

### 15.4.3 验证流程的修改

原本的 JWT 验证只查签名和过期，现在多一步黑名单检查：

\`\`\`python
def verify_token(token):
    payload = decode(token)
    if not payload:
        return None
    if payload["exp"] < time.time():
        return None                       # 过期
    if redis.exists(f"blacklist:{payload['jti']}"):
        return None                       # 在黑名单
    return payload
\`\`\`

---

## 15.5 黑名单的性能考量

### 15.5.1 每次请求多一次查询

加了黑名单，每个 API 请求都要查一次 Redis。这会拖慢吗？

- Redis 查询：单次 < 1ms
- 普通 API：几十到几百 ms
- 黑名单查询占比：< 1%

**结论**：性能影响可忽略。但要确保 Redis 高可用——挂了就所有请求都查不了黑名单。

### 15.5.2 Redis 挂了怎么办

两种策略：

**策略一：fail-open（放行）**

Redis 挂了，假设 token 没被撤销，正常验证。

- 优点：不影响正常用户
- 缺点：被撤销的 token 短暂可用（Redis 恢复前）

**策略二：fail-closed（拒绝）**

Redis 挂了，所有需要认证的请求都拒绝。

- 优点：安全
- 缺点：一挂全挂，用户体验差

工程上一般用 **fail-open**——可用性优先，被撤销 token 的窗口期可接受（毕竟 Redis 通常很快恢复）。

### 15.5.3 缓存优化

如果担心 Redis 压力，可以在应用本地加一层缓存：

\`\`\`python
# 本地 LRU 缓存最近查过的黑名单
@lru_cache(maxsize=10000)
def is_revoked(jti):
    return redis.exists(f"blacklist:{jti}")
\`\`\`

注意：本地缓存有"延迟"——刚加入黑名单的 token，其他节点要等缓存过期才能感知。要权衡一致性和性能。

---

## 15.6 黑名单 vs Refresh Token 撤销

### 15.6.1 两个方案不冲突

上一章讲 Refresh Token 撤销（存库 + revoked 字段），这章讲 Access Token 黑名单。两者配合：

\`\`\`
Access Token（无状态 JWT）→ 黑名单撤销
Refresh Token（有状态）   → 数据库 revoked 字段撤销
\`\`\`

### 15.6.2 为什么 Access 用黑名单，Refresh 用存库

| 对比 | Access Token | Refresh Token |
|------|-------------|---------------|
| 频率 | 每个请求都用 | 偶尔续期用 |
| 存所有有效 token | 太贵（量大） | 可行（量小） |
| 方案 | 黑名单（只存撤销的） | 白名单（存所有有效的） |

Access 量大，存白名单代价高，所以只存黑名单。Refresh 量小，存白名单可行，且能做轮换和重用检测。

### 15.6.3 登出时两边都撤销

\`\`\`python
@app.post("/auth/logout")
def logout(user, access_token, refresh_token):
    # 1. Access 加黑名单
    revoke_access(access_token)
    # 2. Refresh 撤销（数据库标记）
    revoke_refresh(refresh_token)
    return {"msg": "已登出"}
\`\`\`

---

## 15.7 更彻底的方案：Token 版本号

### 15.7.1 黑名单的局限

黑名单只能撤销"已签发"的 token。如果想"修改密码后所有旧 token 立即失效"，黑名单要加所有旧 token——量大。

### 15.7.2 版本号方案

在用户表加一个 \`token_version\` 字段，签发 token 时把版本号写进 token：

\`\`\`json
{"sub": "user_123", "ver": 5, "exp": ...}
\`\`\`

验证时对比 token 里的 \`ver\` 和数据库里的 \`token_version\`：

\`\`\`python
def verify(token):
    payload = decode(token)
    user = db.get(payload["sub"])
    if payload["ver"] != user.token_version:
        return None   # 版本不匹配，token 已失效
    return payload
\`\`\`

### 15.7.3 修改密码 / 登出时

\`\`\`python
def change_password(user_id):
    db.update(user_id, token_version=db.token_version + 1)
    # 所有旧 token 的 ver 都不匹配了，立即失效
\`\`\`

一行业务代码，让该用户所有旧 token 失效——比黑名单优雅。

### 15.7.4 代价

每次验证都要查数据库拿 \`token_version\`——失去了无状态的优势。可以用 Redis 缓存版本号缓解。

### 15.7.5 生活类比：会员卡换卡号

\`\`\`
黑名单 = 维护"挂失卡号清单"，逐个核对
版本号 = 改卡号，旧卡号自动失效
  → 改密码 = 换卡号，所有旧卡作废
\`\`\`

---

## 15.8 方案选型建议

| 场景 | 推荐方案 |
|------|----------|
| 普通登出 | Access 黑名单 + Refresh 撤销 |
| 修改密码后失效全部 | Token 版本号 |
| 封禁用户 | Token 版本号（改版本） |
| 个别 token 撤销 | 黑名单 |
| 极高安全要求 | 完全放弃 JWT，用 session |

**实际工程**：多数项目用"Access 短命（15分钟）+ Refresh 撤销"，配合少量黑名单场景（主动登出）。Access 太短命使得黑名单即使没做，风险也有限。

---

## 15.9 完整的 Logout 代码结构

\`\`\`python
# 验证依赖
def get_current_user(token = Depends(oauth2_scheme)):
    payload = decode(token)
    if not payload:
        raise 401, "token 无效"
    if payload["exp"] < time.time():
        raise 401, "token 过期"
    # 黑名单检查
    if redis.exists(f"blacklist:{payload['jti']}"):
        raise 401, "token 已被撤销"
    return payload

# 登出
@app.post("/auth/logout")
def logout(user = Depends(get_current_user)):
    token = request.headers["Authorization"]
    payload = decode(token)
    jti = payload["jti"]
    ttl = payload["exp"] - int(time.time())
    redis.setex(f"blacklist:{jti}", ttl, "1")
    return {"msg": "已登出"}
\`\`\`

---

## 15.10 生活类比汇总

| 概念 | 类比 |
|------|------|
| JWT 无状态 | 一次性纸质门票，售票处不留底 |
| 黑名单 | 失信名单/挂失清单 |
| Redis TTL | 挂失记录到期自动划掉 |
| Logout | 服务端挂失 + 客户端撕票 |
| Token 版本号 | 换卡号，旧卡作废 |
| fail-open | Redis 挂了先放行，可用性优先 |

---

## 15.11 本章小结

| 知识点 | 要点 |
|--------|------|
| 无状态困境 | JWT 签发后无法主动失效 |
| 黑名单方案 | 记录被撤销的 jti，验证时查 |
| Redis + TTL | 自动清理过期黑名单记录 |
| Logout 流程 | 服务端加黑名单 + 客户端清 token |
| 性能 | 每次多一次 Redis 查询，影响可忽略 |
| Token 版本号 | 改版本让用户所有旧 token 失效 |
| 方案选型 | Access 短命为主，黑名单/版本号补充 |

至此，认证授权教程的权限控制与企业级方案部分结束。回头看，从最基础的密码哈希到双 Token、黑名单，每一层都是在"安全"和"体验"之间找平衡——没有银弹，只有适合场景的方案。
`,
    code: `"""
第十五章 demo：JWT 黑名单与 Token 撤销（Logout）
目标：用模拟 Redis 实现 JWT 黑名单，
      演示登出、撤销、过期自动清理、版本号方案。
只依赖标准库，JWT 用 base64 简化实现。
"""
import base64
import json
import time
import secrets


# ============================================================
# 一、简化的 JWT（同上一章）
# ============================================================

def b64(obj):
    """字典 -> base64 字符串"""
    return base64.urlsafe_b64encode(json.dumps(obj).encode()).decode().rstrip("=")


def unb64(s):
    """base64 字符串 -> 字典"""
    pad = "=" * (-len(s) % 4)
    return json.loads(base64.urlsafe_b64decode(s + pad).decode())


def make_token(payload):
    """生成 token：header.payload（省略签名）"""
    header = b64({"alg": "demo", "typ": "JWT"})
    return f"{header}.{b64(payload)}"


def decode_token(token):
    """解码 token"""
    try:
        return unb64(token.split(".")[1])
    except Exception:
        return None


# ============================================================
# 二、模拟 Redis：带 TTL 的 KV 存储
# ============================================================

class FakeRedis:
    """
    模拟 Redis：支持 setex（带过期）和 exists（查询）。
    生产环境用真 Redis，这里演示原理。
    """
    def __init__(self):
        # key -> {"value": ..., "expire_at": ...}
        self.store = {}

    def setex(self, key, ttl, value):
        """设置 key，TTL 秒后自动过期"""
        self.store[key] = {
            "value": value,
            "expire_at": time.time() + ttl,
        }

    def exists(self, key):
        """检查 key 是否存在（过期则视为不存在）"""
        rec = self.store.get(key)
        if not rec:
            return False
        # 惰性删除：查询时发现过期就删
        if rec["expire_at"] < time.time():
            del self.store[key]
            return False
        return True

    def cleanup_expired(self):
        """主动清理所有过期 key（模拟 Redis 的定期清理）"""
        now = time.time()
        expired = [k for k, v in self.store.items() if v["expire_at"] < now]
        for k in expired:
            del self.store[k]
        return len(expired)

    def size(self):
        """当前 key 数量"""
        self.cleanup_expired()
        return len(self.store)


# ============================================================
# 三、JWT 黑名单服务
# ============================================================

class JWTBlacklistService:
    """
    JWT 黑名单服务：
      - revoke(token)：把 token 的 jti 加入黑名单
      - is_revoked(token)：检查 token 是否在黑名单
      - verify(token)：完整验证（签名 + 过期 + 黑名单）
    """
    def __init__(self, redis):
        self.redis = redis

    def _jti_key(self, jti):
        """黑名单 key 的命名规范：blacklist:{jti}"""
        return f"blacklist:{jti}"

    def revoke(self, token):
        """
        撤销一个 token：把它的 jti 加入黑名单。
        TTL = token 的剩余有效期（过期后黑名单记录自动清理）。
        """
        payload = decode_token(token)
        if not payload:
            return False
        jti = payload.get("jti")
        if not jti:
            return False
        # 计算剩余有效期
        ttl = payload.get("exp", 0) - int(time.time())
        if ttl <= 0:
            # token 已过期，没必要加黑名单
            return False
        # 加入黑名单，TTL = 剩余有效期
        self.redis.setex(self._jti_key(jti), ttl, "1")
        return True

    def is_revoked(self, token):
        """检查 token 是否在黑名单"""
        payload = decode_token(token)
        if not payload:
            return False
        jti = payload.get("jti")
        if not jti:
            return False
        return self.redis.exists(self._jti_key(jti))

    def verify(self, token):
        """
        完整验证：
          1. 解码成功
          2. 未过期
          3. 不在黑名单
        返回 payload 或 None。
        """
        payload = decode_token(token)
        if not payload:
            return None, "token 格式错误"
        if payload.get("exp", 0) < time.time():
            return None, "token 已过期"
        if self.is_revoked(token):
            return None, "token 已被撤销（黑名单）"
        return payload, "有效"


# ============================================================
# 四、Token 版本号方案
# ============================================================

class TokenVersionService:
    """
    Token 版本号方案：
      每个用户有一个 token_version，签发 token 时写入。
      验证时对比 token 的 ver 和数据库的 ver。
      修改密码/封禁 = 版本号 +1，所有旧 token 失效。

    生活类比：换卡号，旧卡自动作废。
    """
    def __init__(self):
        # 模拟用户表的 token_version 字段
        self.user_versions = {"zhangsan": 1}

    def issue(self, username, ttl=3600):
        """签发带版本号的 token"""
        ver = self.user_versions[username]
        now = int(time.time())
        return make_token({
            "sub": username,
            "ver": ver,
            "jti": secrets.token_hex(8),
            "iat": now,
            "exp": now + ttl,
        })

    def verify(self, token):
        """验证：版本号必须匹配数据库"""
        payload = decode_token(token)
        if not payload:
            return None, "token 格式错误"
        if payload.get("exp", 0) < time.time():
            return None, "token 已过期"
        username = payload["sub"]
        current_ver = self.user_versions.get(username, 0)
        if payload.get("ver") != current_ver:
            return None, f"token 版本失效（token ver={payload.get('ver')}, 当前 ver={current_ver}）"
        return payload, "有效"

    def invalidate_all(self, username):
        """
        让某用户的所有旧 token 失效：版本号 +1。
        场景：修改密码、封禁用户。
        """
        self.user_versions[username] = self.user_versions.get(username, 0) + 1
        return self.user_versions[username]


# ============================================================
# 五、运行演示
# ============================================================

redis = FakeRedis()
blacklist = JWTBlacklistService(redis)
version_svc = TokenVersionService()


# ============================================================
print("=" * 60)
print("场景一：登出 + 黑名单")
print("=" * 60)

# 模拟签发一个 token（1 小时有效）
now = int(time.time())
token_a = make_token({
    "sub": "zhangsan", "jti": "jti_aaa", "ver": 1,
    "iat": now, "exp": now + 3600,
})

# 验证：有效
payload, msg = blacklist.verify(token_a)
print(f"  登出前验证 -> {msg}")

# 登出：加入黑名单
blacklist.revoke(token_a)
print(f"  执行登出：token_a 的 jti 加入黑名单")

# 验证：被撤销
payload, msg = blacklist.verify(token_a)
print(f"  登出后验证 -> {msg}")

# ============================================================
print()
print("=" * 60)
print("场景二：黑名单 TTL 自动清理")
print("=" * 60)

# 签发一个只剩 1 秒有效期的 token
token_short = make_token({
    "sub": "zhangsan", "jti": "jti_short",
    "iat": now, "exp": now + 1,   # 1 秒后过期
})
blacklist.revoke(token_short)
print(f"  短命 token 加入黑名单，当前黑名单大小: {redis.size()}")

print(f"  等待 1.5 秒让 token 过期...")
time.sleep(1.5)

# token 过期后，黑名单记录应被清理（惰性删除）
payload, msg = blacklist.verify(token_short)
print(f"  过期后验证 -> {msg}")
# 主动清理
cleaned = redis.cleanup_expired()
print(f"  主动清理过期记录: 删除 {cleaned} 条，剩余: {redis.size()}")
print(f"  → 黑名单不会无限膨胀，过期自动清理")

# ============================================================
print()
print("=" * 60)
print("场景三：版本号方案——修改密码后旧 token 全失效")
print("=" * 60)

# 签发 token
t1 = version_svc.issue("zhangsan")
print(f"  签发 t1，ver={decode_token(t1)['ver']}")

# 验证 t1
payload, msg = version_svc.verify(t1)
print(f"  验证 t1 -> {msg}")

# 再签发一个（同版本）
t2 = version_svc.issue("zhangsan")
print(f"  签发 t2，ver={decode_token(t2)['ver']}")

# 模拟修改密码：版本号 +1，所有旧 token 失效
new_ver = version_svc.invalidate_all("zhangsan")
print(f"  修改密码：用户版本号 +1，当前 ver={new_ver}")

# 旧 token t1 t2 都失效了
payload, msg = version_svc.verify(t1)
print(f"  验证旧 t1 -> {msg}")
payload, msg = version_svc.verify(t2)
print(f"  验证旧 t2 -> {msg}")

# 签发新 token（用新版本号）
t3 = version_svc.issue("zhangsan")
payload, msg = version_svc.verify(t3)
print(f"  签发新 t3 并验证 -> {msg}")

# ============================================================
print()
print("=" * 60)
print("场景四：黑名单 + 版本号 两种方案对比")
print("=" * 60)

# 模拟 5 个旧 token 要撤销
old_tokens = [version_svc.issue("zhangsan") for _ in range(5)]
new_ver = version_svc.invalidate_all("zhangsan")

print(f"  场景：用户有 5 个旧 token，修改密码后要全部失效")
print(f"  方案 A（黑名单）：要往 Redis 加 5 条记录")
for t in old_tokens:
    blacklist.revoke(t)
print(f"    黑名单大小: {redis.size()}")
print(f"  方案 B（版本号）：改 1 次版本号，5 个旧 token 全失效")
for t in old_tokens:
    _, msg = version_svc.verify(t)
    print(f"    验证旧 token -> {msg}")
print(f"  → 批量失效场景，版本号方案更优雅")

# ============================================================
print()
print("=" * 60)
print("场景五：模拟完整的 Logout 路由（服务端 + 客户端）")
print("=" * 60)

def logout_route(token, client_storage):
    """
    模拟登出路由：
      1. 服务端：token 加入黑名单
      2. 客户端：清除本地存储的 token
    两边都做才是完整的 Logout。
    """
    # 服务端：加入黑名单
    ok = blacklist.revoke(token)
    # 客户端：清除本地 token
    client_storage.pop("access_token", None)
    client_storage.pop("refresh_token", None)
    return ok

# 用户登录后，客户端存了 token
client = {"access_token": None, "refresh_token": "rt_xxx"}
now = int(time.time())
client["access_token"] = make_token({
    "sub": "zhangsan", "jti": "jti_logout_demo",
    "iat": now, "exp": now + 3600,
})
print(f"  登录后客户端存储: {list(client.keys())}")

# 用 token 访问
payload, msg = blacklist.verify(client["access_token"])
print(f"  访问 API -> {msg}")

# 登出前先保存一份 token（模拟攻击者已经偷到了拷贝）
stolen_token = client["access_token"]

# 登出
logout_route(client["access_token"], client)
print(f"  登出后客户端存储: {list(client.keys())} (已清空)")

# 登出后攻击者用偷到的旧 token（注意：客户端本地已清空，但攻击者有拷贝）
payload, msg = blacklist.verify(stolen_token)
print(f"  偷到的旧 token 访问 -> {msg}")

# ============================================================
print()
print("=" * 60)
print("场景六：Redis 故障的 fail-open 策略")
print("=" * 60)

class FailOpenBlacklistService(JWTBlacklistService):
    """
    fail-open：Redis 挂了就放行（可用性优先）。
    生活类比：失信名单系统宕机了，检票员先放行，等系统恢复再核对。
    """
    def __init__(self, redis, redis_alive=True):
        super().__init__(redis)
        self.redis_alive = redis_alive

    def is_revoked(self, token):
        if not self.redis_alive:
            # Redis 挂了，假设没被撤销（放行）
            print(f"    [警告] Redis 故障，fail-open 放行")
            return False
        return super().is_revoked(token)

fail_open_svc = FailOpenBlacklistService(redis, redis_alive=True)
now = int(time.time())
token_test = make_token({
    "sub": "zhangsan", "jti": "jti_failopen",
    "iat": now, "exp": now + 3600,
})
# 先加入黑名单
fail_open_svc.revoke(token_test)
# Redis 正常时验证
payload, msg = fail_open_svc.verify(token_test)
print(f"  Redis 正常时验证 -> {msg}")

# Redis 挂了
fail_open_svc.redis_alive = False
payload, msg = fail_open_svc.verify(token_test)
print(f"  Redis 故障时验证 -> {msg}（被撤销的 token 短暂可用，可用性优先）")
print(f"  → 等 Redis 恢复后，黑名单重新生效")


print()
print("=" * 60)
print("小结")
print("=" * 60)
print("""
  1. JWT 无状态困境：签发后无法主动失效
  2. 黑名单方案：记录被撤销的 jti，验证时查
  3. Redis + TTL：黑名单记录随 token 过期自动清理，不膨胀
  4. Logout = 服务端加黑名单 + 客户端清 token，两边都做
  5. 版本号方案：批量失效（改密码/封禁）更优雅
  6. fail-open：Redis 故障时放行，可用性优先
  7. 方案选型：Access 短命为主，黑名单/版本号补充
""")
`,
  },
];
