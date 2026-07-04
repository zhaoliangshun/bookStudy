// =============================================================
// Python 设计思想与架构教程 - 第 1 批章节(SOLID 原则 上)
// -------------------------------------------------------------
// 本批共 3 章,group 均为 "SOLID 原则":
//   1. pyarch-solid-overview — SOLID 原则总览
//   2. pyarch-solid-srp     — 单一职责原则(SRP)
//   3. pyarch-solid-ocp     — 开闭原则(OCP)
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 重点讲清「为什么」和「怎么想」,框架会变,设计思想长存。
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:SOLID 原则总览
  // =========================================================
  {
    id: "pyarch-solid-overview",
    icon: "💎",
    title: "SOLID 原则总览",
    group: "SOLID 原则",
    content: `## 一、SOLID 是什么:五个字母,五个原则

SOLID 是面向对象设计五大原则的首字母缩写,由美国软件工程师 **Robert C. Martin**(人称"鲍勃大叔",Uncle Bob)在 2000 年前后系统总结提出,并在其经典著作《Agile Software Development: Principles, Patterns, and Practices》(敏捷软件开发:原则、模式与实践)中正式阐述。

这五个原则不是凭空发明的,而是从几十年的面向对象实践中提炼出来的"经验法则"。它们回答一个核心问题:**怎样的代码结构才能扛得住需求变化?**

| 字母 | 全称 | 中文 | 一句话定义 |
|------|------|------|------------|
| **S** | Single Responsibility Principle | 单一职责原则 | 一个类应该只有一个引起它变化的原因 |
| **O** | Open-Closed Principle | 开闭原则 | 软件实体应该对扩展开放,对修改关闭 |
| **L** | Liskov Substitution Principle | 里氏替换原则 | 子类必须能够替换其父类而不破坏程序 |
| **I** | Interface Segregation Principle | 接口隔离原则 | 客户不应被迫依赖它不使用的方法 |
| **D** | Dependency Inversion Principle | 依赖倒置原则 | 高层模块不应依赖低层模块,二者都应依赖抽象 |

### 记忆口诀

- **S** = Single(单一)
- **O** = Open(开闭)
- **L** = Liskov(里氏,以提出者 Barbara Liskov 命名)
- **I** = Interface(接口)
- **D** = Dependency(依赖)

合起来就是 SOLID,意思是"坚实的"——遵守这些原则,代码结构才会坚实。

## 二、SOLID 的历史脉络

理解 SOLID 怎么来的,能帮你理解它为什么重要。

\`\`\`text
1960s  面向对象诞生(Simula、Smalltalk)
  │     思想:用"对象+消息"模拟现实世界
  │
1970s  抽象数据类型(ADT)理论成熟
  │     思想:数据和操作绑定,封装变化
  │
1988  Barbara Liskov 提出 LSP 雏形
  │     思想:子类型不能加强前置条件
  │
1990s  设计模式运动兴起(GoF 1994)
  │     思想:把"好的结构"总结成可复用模板
  │
1995-2000  Robert C. Martin 整理 SOLID 五原则
  │     思想:模式是"果",原则是"因"
  │     先懂原则,才能正确使用模式
  │
2002  《敏捷软件开发》出版,SOLID 正式定型
  │     思想:原则服务于"拥抱变化"
  │
至今  SOLID 成为面向对象设计的"基本功"
\`\`\`

关键洞察:**设计模式是"招式",设计原则是"心法"**。死记 23 个模式不如吃透 5 个原则——原则告诉你"为什么这样设计",模式只是原则在特定场景下的落地。

## 三、为什么要学 SOLID:坏设计的四种症状

Robert C. Martin 在书中描述了"坏设计"的四种典型症状,合称**设计异味(Design Smells)**。SOLID 就是为了消灭这些异味而存在的。

### 1. 僵硬(Rigidity)

**定义**:改一个小功能,要牵动一大片代码,改起来寸步难行。

**典型场景**:你想给"用户注册"加一个短信验证,结果发现要改 \`User\` 类、\`EmailService\` 类、\`AuthService\` 类、\`Config\` 类……改完 A 又冒出 B 的 bug,改完 B 又影响 C。

**根因**:职责纠缠,模块之间耦合过紧。一个变化点扩散到多个类。

### 2. 脆弱(Fragility)

**定义**:改了 A 模块,B 模块莫名其妙坏了,而且 B 和 A 看起来毫无关系。

**典型场景**:你修改了"订单金额计算"的逻辑,结果"用户头像上传"功能挂了。这种"牵一发而动全身"的脆弱性,是隐形耦合的恶果。

**根因**:隐藏依赖。B 依赖了 A 的某个实现细节(而不是接口),A 一变 B 就崩。

### 3. 不可移植(Immobility)

**定义**:有个模块写得挺好,想拿到另一个项目复用,却发现它"拔不出来"——拖泥带水带出一堆依赖。

**典型场景**:你想复用项目里的 \`PdfGenerator\` 类,但它内部硬编码了读取数据库、调用日志服务、依赖项目特有的 \`Config\` 对象……换个环境根本跑不起来。

**根因**:没有依赖倒置,具体依赖具体,而不是依赖抽象。

### 4. 粘滞(Viscosity)

**定义**:做"正确的设计"比"打补丁"还难,于是大家倾向于打补丁,设计越来越烂。

**典型场景**:要加个新功能,按设计原则应该新建一个类扩展,但现有结构不允许优雅扩展,于是开发者图省事往老类里塞 \`if-else\`,久而久之类变成了巨型怪物。

**根因**:违反开闭原则,扩展点没设计好,逼迫人写脏代码。

### 四种症状与 SOLID 的对应关系

| 症状 | 含义 | 主要违反的原则 |
|------|------|----------------|
| 僵硬 | 改一处动全身 | SRP(职责纠缠)、DIP(耦合) |
| 脆弱 | 改 A 坏 B | DIP(隐藏依赖)、LSP(子类破坏契约) |
| 不可移植 | 模块拔不出来 | DIP(依赖具体而非抽象) |
| 粘滞 | 正确做法比 hack 还难 | OCP(没留扩展点)、ISP(接口臃肿) |

## 四、五个原则速览(直觉版)

在深入每一章之前,先用最直白的话建立直觉。

### S —— 单一职责原则(SRP)

> 一个类只做一件事。

直觉:如果一个类有多个"变化的原因",就该拆。比如 \`User\` 类既存数据库又发邮件,数据库换了它要改,邮件逻辑变了它也要改——它有两个变化原因,就该拆成 \`UserModel\` + \`UserNotifier\`。

### O —— 开闭原则(OCP)

> 加新功能不改老代码。

直觉:看到一个 \`if type == 'A' ... elif type == 'B'\` 的长链,每加一种类型就要往里塞分支,这就是违反 OCP。正确做法是用抽象基类/策略模式,新增类型只要加新类,不动老代码。

### L —— 里氏替换原则(LSP)

> 子类能无感替换父类。

直觉:正方形是长方形的子类?看似合理,但长方形有"独立设置长和宽"的方法,正方形设置长必须同时改宽——这就破坏了父类的契约。子类不能"加强限制"或"弱化承诺"。

### I —— 接口隔离原则(ISP)

> 接口不要胖,客户不该被迫实现用不到的方法。

直觉:一个 \`Worker\` 接口里既有 \`work()\` 又有 \`eat()\`,机器人实现了它却被迫写一个空的 \`eat()\`——这就是胖接口的罪。拆成 \`Workable\` + \`Eatable\` 才合理。

### D —— 依赖倒置原则(DIP)

> 高层别依赖低层,大家都依赖抽象。

直觉:\`OrderService\` 直接 \`new MySQLDatabase()\` 就是依赖低层具体实现;改成依赖 \`DatabaseInterface\` 抽象,数据库从 MySQL 换 PostgreSQL 都不用动 \`OrderService\`。

## 五、SOLID 与 Python 的关系

SOLID 最早是在 C++/Java 这种静态类型语言背景下总结的。Python 作为动态语言,实现 SOLID 的方式有它的特殊性。

### 1. 动态类型:更灵活,也更危险

Java 必须显式声明接口和类型,编译器帮你检查依赖倒置。Python 没有"接口"关键字,靠**约定**和**鸭子类型**。

\`\`\`python
# Java 风格:显式接口
class Database(ABC):
    @abstractmethod
    def save(self, data): ...

class MySQL(Database):
    def save(self, data): ...

# Python 风格:鸭子类型(只要有 save 方法就行)
class MySQL:
    def save(self, data): ...
# 用的人不关心你是不是 Database,只要有 save() 就行
\`\`\`

**好处**:写起来轻快,少一堆样板代码。
**坏处**:没有编译器把关,违反 DIP 时不会报错,运行时才暴露。所以 Python 更依赖**纪律**和**类型注解 + mypy**。

### 2. 鸭子类型 vs 显式接口

鸭子类型("走起来像鸭子,叫起来像鸭子,那就是鸭子")让 Python 实现里氏替换天然成立——只要子类的方法签名和行为兼容,就能替换,不用显式继承。

\`\`\`python
class Duck:
    def quack(self): print("嘎嘎")

class ToyDuck:           # 不继承 Duck,但能替换
    def quack(self): print("吱吱")

def make_sound(d):       # 不检查类型,只要有 quack
    d.quack()

make_sound(Duck())       # 嘎嘎
make_sound(ToyDuck())    # 吱吱  ← 里氏替换天然成立
\`\`\`

但要注意:**行为兼容**比**方法存在**更严格。\`ToyDuck.quack\` 如果抛异常或返回错误类型,就破坏了 LSP。

### 3. typing.Protocol:Python 的"结构化接口"

Python 3.8+ 的 \`typing.Protocol\` 提供了"鸭子类型 + 静态检查"的结合,是表达接口隔离和依赖倒置的现代利器:

\`\`\`python
from typing import Protocol

class Savable(Protocol):
    """任何有 save 方法的对象都自动满足这个协议。"""
    def save(self, data: dict) -> None: ...

class MySQL:
    def save(self, data: dict) -> None:   # 无需显式声明 implements Savable
        ...

def persist(s: Savable, data: dict):      # 类型检查器会验证
    s.save(data)

persist(MySQL(), {"x": 1})   # mypy 通过,因为 MySQL 结构上满足 Savable
\`\`\`

Protocol 让 Python 既能享受动态语言的灵活,又能获得静态类型的安全感,是实践 SOLID 的推荐方式。

### 4. SOLID 在 Python 中的"轻量版"

由于 Python 语法轻量,SOLID 的实现往往比 Java/C# 简洁:

| 原则 | Java/C# 典型做法 | Python 推荐做法 |
|------|-------------------|------------------|
| SRP | 拆成多个 class | 拆成多个 class / 函数模块 |
| OCP | 抽象类 + 工厂 + 依赖注入 | \`abc.ABC\` / \`Protocol\` + 简单注册 |
| LSP | 显式继承 + override 规则 | 鸭子类型 + 行为契约(文档约定) |
| ISP | 多个小 interface | 多个小 \`Protocol\` / Mixin |
| DIP | Spring/DI 容器注入 | 构造函数传依赖 / 简单工厂 |

## 六、设计原则 vs 设计模式 vs 架构模式:层次关系

初学者常把"原则""模式""架构"混为一谈。它们其实是三个不同抽象层次的工具。

\`\`\`text
        抽象层次高 ──────────────────────────────→ 抽象层次低

   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │  架构模式    │   │  设计模式    │   │  设计原则    │
   │ Architecture │ > │   Pattern    │ > │  Principle   │
   │   Pattern    │   │              │   │              │
   └──────────────┘   └──────────────┘   └──────────────┘
   决定系统骨架        决定局部结构        决定代码"为什么"
   MVC / 分层 /        工厂 / 策略 /       SRP / OCP /
   六边形 / 微服务     观察者 / 装饰器     LSP / ISP / DIP
   一用就是整个系统    一用就是一个类族    时刻指导每一行代码
\`\`\`

### 三者的区别

| 维度 | 设计原则 | 设计模式 | 架构模式 |
|------|----------|----------|----------|
| **回答什么** | 为什么这样设计好 | 遇到 X 问题用 Y 结构 | 整个系统怎么切分 |
| **粒度** | 类/方法级别 | 一组协作的类 | 整个系统/子系统 |
| **数量** | 5 个(SOLID)+ 其他 | 23 个经典(GoF) | 十几种主流 |
| **强制性** | 越遵守越好,可权衡 | 按需选用 | 项目级决策 |
| **变化频率** | 几乎不变 | 几十年稳定 | 跟随技术演进 |

### 三者的关系

- **原则是地基**:不懂 SRP,你用工厂模式也会造出一个职责混乱的工厂。
- **模式是模板**:原则太抽象,模式把原则落到具体结构上。
- **架构是骨架**:架构模式管大方向,内部每个模块仍然要用设计模式,而设计模式背后仍然是设计原则。

举个例子:**六边形架构**(架构模式)要求"核心逻辑不依赖外部细节",这本质上是 **DIP**(设计原则)的系统级放大;而六边形内部用**端口适配器**实现,这是**适配器模式**(设计模式)的应用。

### 学习顺序建议

\`\`\`text
1. 先学 SOLID 原则(本批章节)
       ↓ 建立判断"好设计/坏设计"的标尺
2. 再学设计模式(创建型/结构型/行为型)
       ↓ 学会把原则落成具体结构
3. 最后学架构模式(分层/六边形/微服务)
       ↓ 学会从系统高度组织代码
\`\`\`

跳过原则直接学模式,容易"知其然不知其所以然",变成模式的滥用者。

## 七、SOLID 不是教条:权衡的艺术

SOLID 是**指导原则**,不是**铁律**。盲目套用反而会过度设计。

### 什么时候该用 SOLID

- **需求会变化**:业务代码、功能模块,变化是常态,值得投入设计。
- **代码会被复用**:库、框架、公共组件,设计成本摊到长期收益上划算。
- **团队协作**:多人改同一份代码,好结构能减少冲突。

### 什么时候可以"违反"SOLID

- **一次性脚本**:跑完就扔的数据处理脚本,过度设计是浪费。
- **原型/MVP**:快速验证想法时,先把功能跑通,设计欠债可以接受。
- **性能瓶颈处**:某些高频路径,多一层抽象可能有性能损失,需要权衡。
- **简单到不会变**:一个只读配置类,没必要拆成"配置加载器+配置验证器+配置访问器"。

### 过度设计的危害

\`\`\`text
需求:写一个函数,把两个数加起来。

过度设计版(违反 KISS):
  AddableStrategy(ABC) → IntAdder / FloatAdder / StrAdder
  + AdderFactory + AdderConfig + AdderRegistry
  + Dependency Injection Container

合理版:
  def add(a, b): return a + b
\`\`\`

SOLID 要配合 **KISS**(保持简单)和 **YAGNI**(你不会需要它)一起用。原则帮你"该复杂时复杂得有章法",KISS/YAGNI 帮你"不该复杂时保持简单"。

## 八、本批章节路线图

本批 3 章覆盖 SOLID 的上半部分(S、O 两个原则),后续批次讲 L、I、D。

| 章节 | 原则 | 核心问题 |
|------|------|----------|
| 第 1 章(本章) | 总览 | SOLID 是什么,为什么要学 |
| 第 2 章 | SRP 单一职责 | 一个类做了太多事怎么办 |
| 第 3 章 | OCP 开闭原则 | 加新功能不改老代码怎么做 |

学完这 3 章,你应该能:

- 识别"职责纠缠"的坏味道,并用拆类手法重构
- 识别"if-elif 硬编码"的坏味道,并用抽象基类重构
- 理解 Python 中 \`abc.ABC\` / \`Protocol\` 如何支撑 SOLID

## 九、本章小结

| 要点 | 内容 |
|------|------|
| **SOLID 是什么** | 面向对象设计五大原则的首字母缩写,Rober C. Martin 总结 |
| **为什么学** | 消除"僵硬、脆弱、不可移植、粘滞"四种坏设计症状 |
| **与 Python 关系** | 动态类型更灵活但需自律,\`Protocol\` 是现代实践利器 |
| **层次定位** | 原则是地基,模式是模板,架构是骨架 |
| **使用态度** | 指导而非教条,配合 KISS/YAGNI 权衡 |

## 十、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ SOLID 是规则 | 必须严格遵守,违反就是 bug | 是指导原则,可权衡,KISS/YAGNI 同样重要 |
| ❌ SOLID = 23 个设计模式 | 把原则和模式混为一谈 | 原则是"为什么",模式是"怎么落地",先原则后模式 |
| ❌ Python 不需要 SOLID | 动态语言随便写 | 动态语言更需自律,否则技术债累积更快 |
| ❌ 鸭子类型 = 自动满足 LSP | 方法名一样就行 | 必须**行为契约**兼容,返回值/异常/副作用都要一致 |
| ❌ 接口隔离 = 拆成超多小接口 | 越细越好 | 拆到"客户用不到的方法不依赖"即可,过度拆分增加复杂度 |
| ❌ 依赖倒置 = 必须用 DI 框架 | 没框架就不能 DIP | 构造函数传参就是最简 DIP,Python 很少需要重框架 |
| ❌ 原则用得越多越好 | 全套用上才是好代码 | 简单代码别过度设计,该简单时就简单 |
| ❌ SOLID 能保证好架构 | 学了 SOLID 系统就不会烂 | SOLID 是类级原则,架构还要考虑模块划分、通信方式等 |

> **一句话总结**:SOLID 是面向对象设计的"五条心法",它不保证你写出好架构,但能让你避免最常见的坏设计。学的时候要理解"为什么",用的时候要懂得"权衡"。`,
  },

  // =========================================================
  // 第二章:单一职责原则(SRP)
  // =========================================================
  {
    id: "pyarch-solid-srp",
    icon: "🎯",
    title: "单一职责原则(SRP)",
    group: "SOLID 原则",
    content: `## 一、SRP 的定义

**单一职责原则(Single Responsibility Principle, SRP)** 是 SOLID 五原则之首,也是最基础、最容易理解(但最难做对)的一条。

Robert C. Martin 给出的经典定义:

> **一个类应该只有一个引起它变化的原因。**(A class should have only one reason to change.)

注意这里说的是"**引起变化的原因**",而不是字面上的"只做一件事"。这两者微妙地不同:

- "只做一件事" —— 偏向功能视角,容易陷入"一个方法算一件事"的过度拆分。
- "只有一个变化原因" —— 偏向**变化轴**视角:谁的需求变化会逼迫这个类修改?

### 直觉理解

把类想象成一个**员工**。如果这个员工同时向三个老板汇报:

- 老板 A(数据库组)说:"save 方法要支持 PostgreSQL"
- 老板 B(运维组)说:"日志格式要改成 JSON"
- 老板 C(安全组)说:"密码加密要换成 bcrypt"

任何一个老板发话,这个员工都得改。这就是"多个变化原因"——员工(类)被多方需求撕扯,迟早会出乱子。

SRP 的建议:**让一个员工只对一个老板负责**。数据库的事归 \`UserRepository\`,日志归 \`Logger\`,加密归 \`PasswordHasher\`,各司其职。

### "变化原因" = "需求的发起者"

判断一个类是否违反 SRP,有个实用技巧:**列出"谁会让这个类修改"**。如果答案超过一个,就违反了 SRP。

\`\`\`text
问:User 类会被谁逼着修改?
答:
  1. DBA —— 数据库 schema 变了
  2. 产品经理 —— 注册流程要加短信验证
  3. 安全团队 —— 密码策略要升级
  4. 运维 —— 日志格式要调整

→ 4 个变化原因,严重违反 SRP!
\`\`\`

## 二、反例:一个"全能"的 User 类

来看一个典型违反 SRP 的例子。这个 \`User\` 类什么都管:数据、持久化、邮件、权限、日志。

\`\`\`python
import hashlib
import sqlite3
import smtplib
from datetime import datetime


class User:
    """❌ 反例:一个类塞了 5 个职责"""

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = self._hash(password)   # 职责4:密码加密
        self.created_at = datetime.now()

    # ---- 职责1:数据载体 ----
    def to_dict(self):
        return {"username": self.username, "email": self.email}

    # ---- 职责2:数据库持久化 ----
    def save(self):
        conn = sqlite3.connect("app.db")
        conn.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (self.username, self.email, self.password),
        )
        conn.commit()
        conn.close()

    def find_by_username(cls, username):
        conn = sqlite3.connect("app.db")
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        conn.close()
        return row

    # ---- 职责3:邮件通知 ----
    def send_welcome_email(self):
        smtp = smtplib.SMTP("smtp.example.com")
        smtp.sendmail(
            "noreply@example.com", self.email,
            f"Subject: Welcome\\nHi {self.username}, welcome!"
        )
        smtp.quit()

    # ---- 职责4:密码加密 ----
    def _hash(self, password):
        return hashlib.md5(password.encode()).hexdigest()

    def verify_password(self, raw):
        return self._hash(raw) == self.password

    # ---- 职责5:权限校验 ----
    def has_permission(self, action):
        if self.username == "admin":
            return True
        return action in ["read"]

    # ---- 职责6:日志(隐藏的第6个职责!)----
    def log(self, message):
        with open("app.log", "a") as f:
            f.write(f"{datetime.now()} [{self.username}] {message}\\n")
\`\`\`

### 这个类的问题

| 问题 | 表现 |
|------|------|
| **多个变化原因** | 数据库换 PostgreSQL 要改、邮件换第三方 API 要改、加密换 bcrypt 要改、权限模型调整要改 |
| **测试困难** | 测 \`to_dict\` 居然要连数据库?测 \`save\` 居然要会发邮件? |
| **复用困难** | 想把 \`User\` 拿到另一个项目用,得连 \`app.db\` 和 \`smtp.example.com\` 一起搬走 |
| **职责互相干扰** | 改密码加密逻辑,不小心碰到了 \`save\` 里的 SQL,引入 bug |

### 它违反了几个 SRP?

仔细数,这个 \`User\` 类至少有 **6 个变化原因**:

1. **数据结构变化**:加字段(如手机号)→ 改 \`__init__\` / \`to_dict\`
2. **持久化方案变化**:换 PostgreSQL / MongoDB → 改 \`save\` / \`find_by_username\`
3. **邮件服务变化**:换 SendGrid API → 改 \`send_welcome_email\`
4. **加密算法变化**:MD5 → bcrypt → 改 \`_hash\` / \`verify_password\`
5. **权限模型变化**:加角色系统 → 改 \`has_permission\`
6. **日志方案变化**:换 ELK → 改 \`log\`

6 个老板指挥一个员工,这员工迟早崩溃。

## 三、重构手法:按职责拆类

SRP 的核心重构手法是**按"变化原因"拆类**。每个变化原因对应一个独立的类。

\`\`\`text
拆分前:                       拆分后:
┌─────────────────┐           ┌──────────────┐
│      User       │           │  UserModel   │  ← 只管数据(变化原因1)
│  ├─ 数据        │           │  (dataclass) │
│  ├─ 数据库      │    ──→    ├──────────────┤
│  ├─ 邮件        │           │UserRepository│  ← 只管持久化(变化原因2)
│  ├─ 加密        │           ├──────────────┤
│  ├─ 权限        │           │UserNotifier  │  ← 只管通知(变化原因3)
│  └─ 日志        │           ├──────────────┤
└─────────────────┘           │PasswordHasher│  ← 只管加密(变化原因4)
                              ├──────────────┤
                              │  AuthService │  ← 只管权限(变化原因5)
                              ├──────────────┤
                              │    Logger    │  ← 只管日志(变化原因6)
                              └──────────────┘
\`\`\`

拆分后,每个类只有一个老板:

- \`UserModel\` 只因"数据结构变化"而改
- \`UserRepository\` 只因"持久化方案变化"而改
- \`UserNotifier\` 只因"通知方式变化"而改
- \`PasswordHasher\` 只因"加密算法变化"而改
- \`AuthService\` 只因"权限模型变化"而改
- \`Logger\` 只因"日志方案变化"而改

## 四、Python 实战:数据类 + 仓储类 + 服务类分层

下面是重构后的完整代码。注意我们用了 Python 现代特性:\`dataclass\` 表达纯数据,\`abc.ABC\` 表达抽象,\`Protocol\` 表达接口。

### 1. 数据层:UserModel(只管数据)

\`\`\`python
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class UserModel:
    """纯数据载体,不含任何行为逻辑。
    变化原因:数据结构变化(加字段、改字段类型)。"""
    username: str
    email: str
    password_hash: str
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }
\`\`\`

\`@dataclass\` 自动生成 \`__init__\` / \`__repr__\` / \`__eq__\`,让数据类写得极简。这个类**只因为字段变化而修改**。

### 2. 持久化层:UserRepository(只管存取)

\`\`\`python
import sqlite3
from abc import ABC, abstractmethod


class IUserRepository(ABC):
    """仓储抽象接口(为后续 OCP/DIP 铺路)。
    变化原因:接口契约变化(极少发生)。"""

    @abstractmethod
    def save(self, user: UserModel) -> int: ...

    @abstractmethod
    def find_by_username(self, username: str) -> UserModel | None: ...


class SQLiteUserRepository(IUserRepository):
    """SQLite 实现。
    变化原因:SQLite 特有的 SQL/连接逻辑变化。"""

    def __init__(self, db_path="app.db"):
        self.db_path = db_path

    def save(self, user: UserModel) -> int:
        conn = sqlite3.connect(self.db_path)
        try:
            cur = conn.execute(
                "INSERT INTO users (username, email, password_hash, created_at) "
                "VALUES (?, ?, ?, ?)",
                (user.username, user.email, user.password_hash,
                 user.created_at.isoformat()),
            )
            conn.commit()
            return cur.lastrowid
        finally:
            conn.close()

    def find_by_username(self, username: str) -> UserModel | None:
        conn = sqlite3.connect(self.db_path)
        try:
            row = conn.execute(
                "SELECT username, email, password_hash, created_at "
                "FROM users WHERE username = ?",
                (username,),
            ).fetchone()
            if row is None:
                return None
            return UserModel(
                username=row[0], email=row[1],
                password_hash=row[2],
                created_at=datetime.fromisoformat(row[3]),
            )
        finally:
            conn.close()
\`\`\`

注意:抽象接口 \`IUserRepository\` 和实现 \`SQLiteUserRepository\` 分开。将来换 PostgreSQL,只需新增 \`PostgresUserRepository\`,不动接口和其他类——这同时为 OCP 和 DIP 打下了基础。

### 3. 通知层:UserNotifier(只管发消息)

\`\`\`python
import smtplib
from abc import ABC, abstractmethod


class Notifier(ABC):
    """通知器抽象。
    变化原因:通知渠道扩展(邮件/短信/推送)。"""

    @abstractmethod
    def send(self, to: str, subject: str, body: str) -> None: ...


class EmailNotifier(Notifier):
    """邮件通知实现。
    变化原因:SMTP 配置/邮件格式变化。"""

    def __init__(self, smtp_host, smtp_port, from_addr):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.from_addr = from_addr

    def send(self, to: str, subject: str, body: str) -> None:
        smtp = smtplib.SMTP(self.smtp_host, self.smtp_port)
        try:
            smtp.sendmail(
                self.from_addr, to,
                f"Subject: {subject}\\n\\n{body}",
            )
        finally:
            smtp.quit()


class UserNotifier:
    """用户相关的通知服务,组合 Notifier 实现。
    变化原因:用户通知文案/触发逻辑变化。"""

    def __init__(self, notifier: Notifier):
        self.notifier = notifier   # 依赖抽象,不依赖具体(符合 DIP)

    def welcome(self, user: UserModel) -> None:
        self.notifier.send(
            user.email, "Welcome",
            f"Hi {user.username}, welcome to our app!",
        )

    def password_changed(self, user: UserModel) -> None:
        self.notifier.send(
            user.email, "Password Changed",
            "Your password was just changed. If this wasn't you, contact support.",
        )
\`\`\`

\`UserNotifier\` 只因"通知文案/触发逻辑"变化,而 \`EmailNotifier\` 只因"SMTP 细节"变化。两者职责清晰分离。

### 4. 加密层:PasswordHasher(只管哈希)

\`\`\`python
import hashlib


class PasswordHasher:
    """密码哈希器。
    变化原因:加密算法升级(MD5 → SHA256 → bcrypt → argon2)。"""

    def __init__(self, algorithm="md5"):
        self.algorithm = algorithm

    def hash(self, raw: str) -> str:
        return hashlib.new(self.algorithm, raw.encode()).hexdigest()

    def verify(self, raw: str, hashed: str) -> bool:
        return self.hash(raw) == hashed
\`\`\`

将来从 MD5 升级到 bcrypt,只改这一个类,其他类完全不动——这就是 SRP 的威力。

### 5. 权限层:AuthService(只管鉴权)

\`\`\`python
class AuthService:
    """权限校验服务。
    变化原因:权限模型变化(加角色、加资源、加策略)。"""

    # 简化的权限矩阵
    ROLE_PERMISSIONS = {
        "admin": {"read", "write", "delete", "manage_users"},
        "user": {"read", "write"},
        "guest": {"read"},
    }

    def __init__(self, user_repo: IUserRepository, hasher: PasswordHasher):
        self.user_repo = user_repo
        self.hasher = hasher

    def authenticate(self, username: str, password: str) -> UserModel | None:
        user = self.user_repo.find_by_username(username)
        if user is None:
            return None
        if not self.hasher.verify(password, user.password_hash):
            return None
        return user

    def get_role(self, username: str) -> str:
        # 简化:admin 用户名直接是 admin
        if username == "admin":
            return "admin"
        return "user"

    def has_permission(self, username: str, action: str) -> bool:
        role = self.get_role(username)
        return action in self.ROLE_PERMISSIONS.get(role, set())
\`\`\`

\`AuthService\` 只因"权限模型"变化。它**组合**了 \`IUserRepository\` 和 \`PasswordHasher\`,而不是自己实现查询和加密——这又是 DIP 的体现。

### 6. 日志层:Logger(只管记录)

\`\`\`python
from datetime import datetime


class Logger:
    """日志器。
    变化原因:日志输出方式变化(文件/控制台/ELK)。"""

    def __init__(self, sink="file", path="app.log"):
        self.sink = sink
        self.path = path

    def info(self, message: str) -> None:
        self._write("INFO", message)

    def error(self, message: str) -> None:
        self._write("ERROR", message)

    def _write(self, level: str, message: str) -> None:
        line = f"{datetime.now()} [{level}] {message}"
        if self.sink == "file":
            with open(self.path, "a") as f:
                f.write(line + "\\n")
        else:
            print(line)
\`\`\`

### 7. 组装:UserService(编排者)

最后用一个 \`UserService\` 把各职责组合起来,对外提供"注册"这类业务流程:

\`\`\`python
class UserService:
    """用户业务编排层:协调各专职类完成业务流程。
    变化原因:业务流程变化(注册步骤调整)。"""

    def __init__(
        self,
        user_repo: IUserRepository,
        hasher: PasswordHasher,
        notifier: UserNotifier,
        logger: Logger,
    ):
        self.user_repo = user_repo
        self.hasher = hasher
        self.notifier = notifier
        self.logger = logger

    def register(self, username: str, email: str, password: str) -> UserModel:
        self.logger.info(f"开始注册用户: {username}")
        # 1. 加密密码(交给 PasswordHasher)
        password_hash = self.hasher.hash(password)
        # 2. 构造数据(交给 UserModel)
        user = UserModel(username=username, email=email, password_hash=password_hash)
        # 3. 持久化(交给 UserRepository)
        self.user_repo.save(user)
        # 4. 发欢迎邮件(交给 UserNotifier)
        self.notifier.welcome(user)
        self.logger.info(f"用户注册完成: {username}")
        return user
\`\`\`

\`UserService\` 自己不做具体活,只负责"按顺序调用各专职类"。它的变化原因是"业务流程变化",职责单一。

### 使用方式

\`\`\`python
# 组装依赖(可在 main 或 DI 容器中完成)
hasher = PasswordHasher(algorithm="sha256")
repo = SQLiteUserRepository("app.db")
email_notifier = EmailNotifier("smtp.example.com", 25, "noreply@example.com")
notifier = UserNotifier(email_notifier)
logger = Logger(sink="console")

user_service = UserService(repo, hasher, notifier, logger)

# 业务调用
user_service.register("alice", "alice@example.com", "secret123")
\`\`\`

## 五、重构前后对比

| 维度 | 重构前(User 类) | 重构后(分层) |
|------|------------------|----------------|
| **变化原因数** | 6 个 | 每个类 1 个 |
| **改密码算法** | 动 User 类,可能碰到 save | 只改 PasswordHasher |
| **换数据库** | 动 User 类,可能碰到邮件 | 只新增一个 Repository 实现 |
| **可测试性** | 测任意方法都要数据库+SMTP | 各类可独立 mock 测试 |
| **可复用性** | User 类拔不出来 | PasswordHasher 可单独复用 |
| **代码行数** | 一个类 ~80 行 | 7 个类共 ~200 行(变多了) |

注意最后一行:**重构后代码变多了**。这是正常的——SRP 用"更多的小类"换"更低的耦合"。短期看是写多了,长期看是改少了、测容易了、复用顺了。**判断 SRP 值不值,看的是变化频率和复用需求,不是代码行数**。

## 六、SRP 的边界:拆到什么粒度?

SRP 最容易被误用成"过度拆分"。来看几个边界 case。

### 误区1:把"一个方法"当成"一个职责"

\`\`\`python
# ❌ 过度拆分:把计算逻辑拆成无数小类
class Adder:
    def calc(self, a, b): return a + b

class Multiplier:
    def calc(self, a, b): return a * b

class Calculator:
    def __init__(self, adder, multiplier):
        self.adder = adder
        self.multiplier = multiplier
\`\`\`

加法和乘法是"计算器"这一个职责的组成部分,它们**一起变化**(都属于计算规则)。拆成多个类反而增加复杂度,违反 KISS。

**判断准则**:这些方法是否会因**不同原因**而独立变化?如果会一起变,就别拆。

### 误区2:把"数据 + 简单访问"拆开

\`\`\`python
# ❌ 过度:把 getter 也当成职责拆出去
class UserData:
    def __init__(self, name): self.name = name

class UserNameAccessor:
    def get_name(self, data): return data.name
\`\`\`

数据类自带 getter 是天经地义的,它们属于"数据载体"这一个职责。只有当访问逻辑变复杂(如需要权限、缓存、远程调用)时才考虑拆。

### 误区3:把"持久化"留在数据类里

\`\`\`python
# ❌ 常见错误:User 自己 save
@dataclass
class User:
    name: str
    def save(self): ...   # 持久化混进数据类
\`\`\`

持久化是一个**独立的变化轴**(数据库会换),应该交给 Repository。"贫血模型 + Repository"是 Python 后端的常见合理结构。

### 正确的拆分粒度

\`\`\`text
问自己 3 个问题:
  Q1: 这部分逻辑会因"和类其他部分不同的原因"而变化吗?
     → 是,考虑拆
     → 否,别拆

  Q2: 拆出去后,这个类会被单独复用/单独测试吗?
     → 是,值得拆
     → 否,可能过度设计

  Q3: 拆出去后,组合成本是否高过收益?
     → 拆完要写一堆胶水代码才能用,且没有明显复用价值
     → 别拆,留在原类
\`\`\`

### 一个实用的判断信号

如果你给一个类写 docstring 时,不得不用"和"、"同时"、"以及"连接多个动词,大概率违反了 SRP:

\`\`\`text
❌ "User 类负责存储用户数据,以及发送邮件,同时校验权限"
   → 3 个"和/同时",3 个职责,该拆

✅ "PasswordHasher 负责密码的哈希与验证"
   → "哈希与验证"是同一职责的两个面,合理
\`\`\`

## 七、SRP 在函数层面的延伸

SRP 虽然讲"类",但精神同样适用于**函数/方法**。一个函数也应该只做一件事。

\`\`\`python
# ❌ 函数职责过多:读文件 + 解析 + 校验 + 发邮件
def process_users(filepath):
    with open(filepath) as f:          # 职责1:读文件
        raw = f.read()
    users = []                         # 职责2:解析
    for line in raw.splitlines():
        name, email = line.split(",")
        users.append({"name": name, "email": email})
    for u in users:                    # 职责3:校验
        if "@" not in u["email"]:
            raise ValueError(f"非法邮箱: {u['email']}")
    for u in users:                    # 职责4:发邮件
        send_email(u["email"], "welcome")
    return users

# ✅ 拆成多个小函数,各自单一职责
def read_file(filepath) -> str:
    """只管读文件"""
    with open(filepath) as f:
        return f.read()

def parse_users(raw: str) -> list[dict]:
    """只管解析"""
    users = []
    for line in raw.splitlines():
        name, email = line.split(",")
        users.append({"name": name, "email": email})
    return users

def validate_users(users: list[dict]) -> None:
    """只管校验"""
    for u in users:
        if "@" not in u["email"]:
            raise ValueError(f"非法邮箱: {u['email']}")

def notify_users(users: list[dict]) -> None:
    """只管通知"""
    for u in users:
        send_email(u["email"], "welcome")

def process_users(filepath):
    """编排函数:组合各步骤"""
    raw = read_file(filepath)
    users = parse_users(raw)
    validate_users(users)
    notify_users(users)
    return users
\`\`\`

拆分后,每个小函数都可以单独测试、单独复用。编排函数 \`process_users\` 只负责"按顺序调用",本身也很简单。

## 八、SRP 与其他原则的协同

SRP 不是孤立的,它和其他 SOLID 原则相互支撑:

\`\`\`text
SRP 拆出职责 → 自然产生抽象(接口) → 为 OCP 提供扩展点
              → 抽象依赖抽象 → 为 DIP 提供前提
              → 接口变小 → 为 ISP 提供条件
              → 子类职责清晰 → 帮助 LSP 成立
\`\`\`

- **SRP 是 OCP 的前提**:如果职责都搅在一起,根本无从"对扩展开放"。
- **SRP 让 DIP 自然**:拆出 \`UserRepository\` 抽象后,\`UserService\` 依赖抽象才有可能。
- **SRP 帮助 ISP**:大类拆小后,接口也自然变小。

## 九、SRP 的反面:什么时候不拆

提醒一下,SRP 也要配合 KISS/YAGNI。这些情况不必拆:

| 场景 | 不拆的理由 |
|------|-----------|
| 一次性脚本 | 跑完就扔,设计成本浪费 |
| 极简 CRUD | 就存个键值对,拆 Repository 是杀鸡用牛刀 |
| 学习/演示代码 | 重点在讲清概念,过度结构反而干扰理解 |
| 性能热点 | 多一层间接调用有开销,确认是瓶颈再优化设计 |

## 十、本章小结

| 要点 | 内容 |
|------|------|
| **SRP 定义** | 一个类只有一个引起变化的原因 |
| **判断方法** | 列出"谁会逼这个类修改",超过一个就违反 |
| **重构手法** | 按变化轴拆类,职责单一化 |
| **Python 实践** | dataclass(数据) + Repository(持久化) + Service(编排) 分层 |
| **粒度边界** | 用"会不会因不同原因变化"判断,别陷入"一方法一职责" |
| **协同关系** | SRP 是 OCP/DIP/ISP 的前提 |

## 十一、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ SRP = 一个类只写一个方法 | 方法越少越符合 | 一个类可以有多个方法,只要它们因同一原因变化 |
| ❌ "职责" = "功能" | 一个功能一个类 | 职责 = 变化原因,一个职责可能含多个功能 |
| ❌ 拆得越细越好 | 微观化才是 SRP | 拆到"独立变化轴"即可,过度拆分违反 KISS |
| ❌ 数据类不能有方法 | 任何方法都要拆出去 | 与数据本身强相关的方法(如 to_dict)可保留 |
| ❌ 持久化放数据类里没问题 | save 是 User 的事 | 持久化是独立变化轴,应交给 Repository |
| ❌ SRP 只管类不管函数 | 函数随便写 | 函数同样要单一职责,编排函数除外 |
| ❌ 拆完代码少了才算对 | 代码行数是衡量标准 | 拆完代码常变多,衡量的是耦合度和可测试性 |
| ❌ 简单代码也要拆 | 一律套 SRP | 简单且不变的代码别过度设计,配合 YAGNI |

> **一句话总结**:SRP 的核心是"一个类,一个变化原因"。判断时别数方法数,要数"谁会让它修改"。拆分时按变化轴拆,而非按功能拆——这是 SRP 最容易做错的地方。`,
  },

  // =========================================================
  // 第三章:开闭原则(OCP)
  // =========================================================
  {
    id: "pyarch-solid-ocp",
    icon: "🔓",
    title: "开闭原则(OCP)",
    group: "SOLID 原则",
    content: `## 一、OCP 的定义

**开闭原则(Open-Closed Principle, OCP)** 是 SOLID 中"目标性"最强的一条——它直接描述了我们最想要的代码特性:**能加新功能,但不碰老代码**。

Bertrand Meyer 在 1988 年最早提出,Robert C. Martin 将其纳入 SOLID 时的表述:

> **软件实体(类、模块、函数等)应该对扩展开放,对修改关闭。**
> (Software entities should be open for extension, but closed for modification.)

拆开理解:

- **对扩展开放**:当需求变化时,可以**新增**代码来扩展行为。
- **对修改关闭**:扩展时**不需要修改**已经写好、测试好的老代码。

### 直觉理解

想象一栋写字楼。如果每来一家新公司,都要把整栋楼拆了重建,这楼就没法用——这是"对修改开放"。理想情况是:楼里有标准的办公位,新公司搬进来"插上就用",不动建筑结构——这就是"对扩展开放,对修改关闭"。

代码里同理:**好的设计应该让你加新功能时"插上新类",而不是"改老类"**。

### OCP 的价值

| 价值 | 说明 |
|------|------|
| **降低回归风险** | 不动老代码,老 bug 不会复活,老测试不用改 |
| **支持并行开发** | 新功能开发者不用和老代码所有者抢着改同一文件 |
| **可复用性强** | 核心逻辑稳定,扩展点清晰,新场景接入快 |
| **可测试性强** | 老测试覆盖老逻辑,新功能加新测试,互不干扰 |

## 二、反例:if-elif-else 硬编码

违反 OCP 最典型的味道就是**一长串 if-elif-else 按"类型"分支**。每加一种类型,就得往这个分支链里塞代码——这就是"对修改开放",完全反了。

### 案例:报表系统

假设要做一个报表导出系统,支持多种格式。初学者会这么写:

\`\`\`python
class ReportExporter:
    """❌ 反例:每加一种格式就要改这个方法"""

    def export(self, data, format_name):
        if format_name == "csv":
            return self._to_csv(data)
        elif format_name == "json":
            return self._to_json(data)
        elif format_name == "xml":
            return self._to_xml(data)
        elif format_name == "pdf":
            return self._to_pdf(data)
        # 想加 Excel?得再来一个 elif
        # 想加 HTML?又得改这里
        else:
            raise ValueError(f"不支持的格式: {format_name}")

    def _to_csv(self, data):
        lines = []
        if data:
            lines.append(",".join(data[0].keys()))
            for row in data:
                lines.append(",".join(str(v) for v in row.values()))
        return "\\n".join(lines)

    def _to_json(self, data):
        import json
        return json.dumps(data, ensure_ascii=False, indent=2)

    def _to_xml(self, data):
        lines = ["<data>"]
        for row in data:
            lines.append("  <row>")
            for k, v in row.items():
                lines.append(f"    <{k}>{v}</{k}>")
            lines.append("  </row>")
        lines.append("</data>")
        return "\\n".join(lines)

    def _to_pdf(self, data):
        # PDF 生成逻辑(简化)
        return f"[PDF content with {len(data)} rows]"


# 使用
exporter = ReportExporter()
data = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
print(exporter.export(data, "csv"))
print(exporter.export(data, "json"))
\`\`\`

### 这个设计的问题

| 问题 | 表现 |
|------|------|
| **违反 OCP** | 加 Excel 格式?必须修改 \`export\` 方法,加 \`elif\` |
| **职责堆积** | 所有格式的逻辑都堆在 \`ReportExporter\` 里,违反 SRP |
| **测试爆炸** | 测 \`export\` 要覆盖所有格式,测试用例随格式数线性增长 |
| **无法独立复用** | 只想要 CSV 导出,却被迫带着 PDF/XML 的全部代码 |
| **修改风险高** | 改 PDF 逻辑可能碰坏 CSV,因为它们在同一个类里 |

### 坏味道信号:switch/on 类型字符串

凡是看到按"类型字符串"分支的 \`if-elif\` 或 \`match-case\`,基本都能套 OCP 重构:

\`\`\`text
if type == "A": ...
elif type == "B": ...
elif type == "C": ...

        ↓ 坏味道:每加一种类型都要改这里
\`\`\`

## 三、重构手法:抽象基类 + 子类多态

OCP 的标准重构手法是**把"变化的部分"抽象成接口,用多态替代分支**。

\`\`\`text
重构前(分支):                  重构后(多态):
┌────────────────────┐         ┌─────────────────┐
│  ReportExporter    │         │ ReportExporter  │  ← 只管"调用"
│  ├─ if csv: ...    │         │  ├─ exporter:   │
│  ├─ elif json: ... │   ──→   │  │   ReportFormatter(ABC)
│  ├─ elif xml: ...  │         │  └─ .export()   │
│  └─ elif pdf: ...  │         ├─────────────────┤
└────────────────────┘         │ CsvFormatter    │ ┐
                               │ JsonFormatter   │ ├ 各自一个类
                               │ XmlFormatter    │ │ 新增格式 = 加新类
                               │ PdfFormatter    │ ┘
                               └─────────────────┘
\`\`\`

### 步骤1:定义抽象基类

\`\`\`python
from abc import ABC, abstractmethod


class ReportFormatter(ABC):
    """报表格式化器抽象基类。
    定义了所有格式化器必须实现的契约。"""

    @abstractmethod
    def format(self, data: list[dict]) -> str:
        """把数据格式化为字符串。"""
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """格式名称(用于注册和查找)。"""
        ...
\`\`\`

\`ReportFormatter\` 是抽象基类,定义了"所有格式化器都能 \`format\` 数据"这一契约。它**对修改关闭**——契约一旦定下,很少改动;它**对扩展开放**——加新格式只需新增子类。

### 步骤2:为每种格式实现一个子类

\`\`\`python
import json


class CsvFormatter(ReportFormatter):
    """CSV 格式化器。"""

    @property
    def name(self) -> str:
        return "csv"

    def format(self, data: list[dict]) -> str:
        if not data:
            return ""
        lines = [",".join(data[0].keys())]
        for row in data:
            lines.append(",".join(str(v) for v in row.values()))
        return "\\n".join(lines)


class JsonFormatter(ReportFormatter):
    """JSON 格式化器。"""

    @property
    def name(self) -> str:
        return "json"

    def format(self, data: list[dict]) -> str:
        return json.dumps(data, ensure_ascii=False, indent=2)


class XmlFormatter(ReportFormatter):
    """XML 格式化器。"""

    @property
    def name(self) -> str:
        return "xml"

    def format(self, data: list[dict]) -> str:
        lines = ["<data>"]
        for row in data:
            lines.append("  <row>")
            for k, v in row.items():
                lines.append(f"    <{k}>{v}</{k}>")
            lines.append("  </row>")
        lines.append("</data>")
        return "\\n".join(lines)


class PdfFormatter(ReportFormatter):
    """PDF 格式化器(简化版)。"""

    @property
    def name(self) -> str:
        return "pdf"

    def format(self, data: list[dict]) -> str:
        return f"[PDF content with {len(data)} rows]"
\`\`\`

每个子类只管自己那种格式的逻辑,互不干扰。改 CSV 不会碰 JSON,加 Excel 只需新增 \`ExcelFormatter\`。

### 步骤3:用注册表管理格式化器

\`\`\`python
class FormatterRegistry:
    """格式化器注册表。
    负责按名称查找格式化器,新增格式时在此注册。"""

    def __init__(self):
        self._formatters: dict[str, ReportFormatter] = {}

    def register(self, formatter: ReportFormatter) -> None:
        self._formatters[formatter.name] = formatter

    def get(self, name: str) -> ReportFormatter:
        if name not in self._formatters:
            raise ValueError(f"不支持的格式: {name}。"
                             f"已注册: {list(self._formatters)}")
        return self._formatters[name]

    def available(self) -> list[str]:
        return list(self._formatters)


# 全局注册表(也可以用工厂模式)
registry = FormatterRegistry()
registry.register(CsvFormatter())
registry.register(JsonFormatter())
registry.register(XmlFormatter())
registry.register(PdfFormatter())
\`\`\`

注册表把"格式名 → 格式化器"的映射集中管理。加新格式时:**写新类 + 注册一行**,完全不碰老代码。

### 步骤4:重写 ReportExporter

\`\`\`python
class ReportExporter:
    """✅ 重构后:只管"调度",不关心具体格式。"""

    def __init__(self, registry: FormatterRegistry):
        self.registry = registry

    def export(self, data: list[dict], format_name: str) -> str:
        formatter = self.registry.get(format_name)   # 查注册表
        return formatter.format(data)                # 多态调用

    def export_to_file(self, data, format_name, filepath):
        content = self.export(data, format_name)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)


# 使用
exporter = ReportExporter(registry)
data = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]

print("=== CSV ===")
print(exporter.export(data, "csv"))
print("\\n=== JSON ===")
print(exporter.export(data, "json"))
print("\\n=== 支持的格式 ===")
print(exporter.registry.available())
\`\`\`

\`ReportExporter.export\` 现在只有两行:查注册表 + 多态调用。它**完全不知道**有哪几种格式——这正是 OCP 想要的:"对修改关闭"。

### 步骤5:加新格式——验证 OCP

现在产品经理说要支持 Excel。看我们怎么加:

\`\`\`python
# ✅ 只新增,不修改任何老代码!
class ExcelFormatter(ReportFormatter):
    """新增的 Excel 格式化器。"""

    @property
    def name(self) -> str:
        return "excel"

    def format(self, data: list[dict]) -> str:
        # 简化:实际用 openpyxl 生成 .xlsx
        header = "\\t".join(data[0].keys()) if data else ""
        rows = ["\\t".join(str(v) for v in row.values()) for row in data]
        return "\\n".join([header] + rows)


# 注册一下就能用
registry.register(ExcelFormatter())

# 老代码照常工作
print(exporter.export(data, "excel"))
print(exporter.registry.available())   # ['csv', 'json', 'xml', 'pdf', 'excel']
\`\`\`

注意:**我们没有修改任何已有的类**——\`ReportExporter\` 没动,\`CsvFormatter\` 没动,\`JsonFormatter\` 没动。只新增了 \`ExcelFormatter\` + 一行注册。这就是"对扩展开放,对修改关闭"。

## 四、OCP 的核心机制:多态替代分支

OCP 在面向对象语言里的落地,本质是**用多态替代条件分支**。

\`\`\`text
违反 OCP 的分支结构:              符合 OCP 的多态结构:

if shape == "circle":            class Shape(ABC):
    area = pi * r * r                @abstractmethod
elif shape == "square":             def area(self): ...
    area = side * side
elif shape == "triangle":        class Circle(Shape):
    area = ...                        def area(self): return pi*r*r
                                  class Square(Shape):
# 加新形状 = 改这个函数                def area(self): return s*s
                                  # 加新形状 = 加新类,不改任何老代码
\`\`\`

### 多态如何"消灭"分支

\`\`\`python
# ❌ 分支版:加形状要改 calculate_total
def calculate_total(shapes):
    total = 0
    for s in shapes:
        if s["type"] == "circle":
            total += 3.14 * s["r"] ** 2
        elif s["type"] == "square":
            total += s["side"] ** 2
        # 加 triangle? 改这里
    return total

# ✅ 多态版:加形状只需加新类
class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return 3.14 * self.r ** 2

class Square(Shape):
    def __init__(self, side): self.side = side
    def area(self): return self.side ** 2

def calculate_total(shapes: list[Shape]):
    return sum(s.area() for s in shapes)   # 不关心具体类型!
\`\`\`

\`calculate_total\` 对所有形状"一视同仁",只调用 \`area()\`。新增三角形:

\`\`\`python
class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height
    def area(self):
        return 0.5 * self.base * self.height

# calculate_total 一行都不用改!
\`\`\`

## 五、实现 OCP 的几种常见模式

OCP 的实现不只有"抽象基类 + 子类"一种。下面是几种常见手法,适用场景不同。

### 1. 策略模式(Strategy)

**场景**:同一件事有多种算法,运行时切换。

\`\`\`python
from abc import ABC, abstractmethod


class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data): ...


class QuickSort(SortStrategy):
    def sort(self, data):
        print("用快速排序")
        return sorted(data)   # 简化

class MergeSort(SortStrategy):
    def sort(self, data):
        print("用归并排序")
        return sorted(data)   # 简化


class Sorter:
    def __init__(self, strategy: SortStrategy):
        self.strategy = strategy

    def set_strategy(self, strategy: SortStrategy):
        self.strategy = strategy

    def sort(self, data):
        return self.strategy.sort(data)


# 使用:运行时切换策略
sorter = Sorter(QuickSort())
sorter.sort([3, 1, 2])
sorter.set_strategy(MergeSort())   # 切换算法,不改 Sorter
sorter.sort([3, 1, 2])
\`\`\`

加新排序算法 = 加新 \`Strategy\` 子类,\`Sorter\` 不用改。

### 2. 模板方法(Template Method)

**场景**:算法骨架固定,个别步骤可变。

\`\`\`python
from abc import ABC, abstractmethod


class DataPipeline(ABC):
    """模板方法:定义骨架,具体步骤由子类填充。"""

    def run(self, source):
        data = self.extract(source)      # 固定步骤
        data = self.transform(data)      # 固定步骤
        self.load(data)                  # 固定步骤

    @abstractmethod
    def extract(self, source): ...

    @abstractmethod
    def transform(self, data): ...

    @abstractmethod
    def load(self, data): ...


class CsvToDbPipeline(DataPipeline):
    def extract(self, source):
        print(f"从 {source} 读 CSV")
        return [{"x": 1}, {"x": 2}]

    def transform(self, data):
        print("转换数据")
        return [{"x": d["x"] * 10} for d in data]

    def load(self, data):
        print(f"写入数据库: {data}")


class ApiToDbPipeline(DataPipeline):
    def extract(self, source):
        print(f"调用 API: {source}")
        return [{"y": 1}]

    def transform(self, data):
        return data   # 不转换

    def load(self, data):
        print(f"写入数据库: {data}")


# 骨架 run() 不变,扩展新管道只需新子类
CsvToDbPipeline().run("data.csv")
ApiToDbPipeline().run("https://api.example.com")
\`\`\`

\`DataPipeline.run\` 是"对修改关闭"的骨架,\`extract/transform/load\` 是"对扩展开放"的钩子。

### 3. 观察者模式(Observer)

**场景**:一个对象变化时,通知多个依赖者,且依赖者可增减。

\`\`\`python
from abc import ABC, abstractmethod


class Observer(ABC):
    @abstractmethod
    def update(self, event): ...


class Subject:
    """被观察者:维护观察者列表,变化时通知。"""

    def __init__(self):
        self._observers: list[Observer] = []

    def attach(self, obs: Observer):
        self._observers.append(obs)

    def detach(self, obs: Observer):
        self._observers.remove(obs)

    def notify(self, event):
        for obs in self._observers:
            obs.update(event)


class EventEmitter(Subject):
    def emit(self, event):
        print(f"发射事件: {event}")
        self.notify(event)


# 加新观察者 = 加新类,不改 EventEmitter
class LogObserver(Observer):
    def update(self, event):
        print(f"  [日志] 记录: {event}")

class EmailObserver(Observer):
    def update(self, event):
        print(f"  [邮件] 通知: {event}")

class MetricsObserver(Observer):
    def update(self, event):
        print(f"  [指标] 上报: {event}")


emitter = EventEmitter()
emitter.attach(LogObserver())
emitter.attach(EmailObserver())
# 想加监控?加一行 attach,不动 EventEmitter
emitter.attach(MetricsObserver())
emitter.emit("user_registered")
\`\`\`

\`EventEmitter\` 不知道有几个观察者、观察者干什么——它只管"通知"。加新观察者完全不用改 \`EventEmitter\`,典型的 OCP。

### 模式选择指南

| 模式 | 适用场景 | 扩展方式 |
|------|----------|----------|
| 抽象基类 + 子类 | 一组同类事物,各有多态行为 | 新增子类 |
| 策略模式 | 同一行为有多种算法,运行时切换 | 新增 Strategy 子类 |
| 模板方法 | 算法骨架固定,步骤可变 | 新增子类填钩子 |
| 观察者 | 一对多通知,依赖者可变 | 新增 Observer 子类 |

它们的共同点:**通过抽象 + 多态,把"变化"隔离到新类中,老代码不动**。

## 六、OCP 与 Python 的特殊性

Python 是动态语言,实现 OCP 有一些"特性"需要特别注意。

### 1. 鸭子类型:轻量 OCP

Python 不强制继承抽象基类,只要方法签名对得上就能多态:

\`\`\`python
class CsvFormatter:           # 不继承 ReportFormatter
    name = "csv"
    def format(self, data): ...

class JsonFormatter:          # 也不继承
    name = "json"
    def format(self, data): ...

def export(formatter, data):  # 不检查类型,有 format 就行
    return formatter.format(data)
\`\`\`

**好处**:少写 \`ABC\` 样板,代码更轻。
**坏处**:没有契约保证,某个 formatter 漏写 \`name\` 属性,运行时才报错。

**建议**:简单场景用鸭子类型;多人协作/库代码用 \`ABC\` 或 \`Protocol\` 明确契约。

### 2. typing.Protocol:静态检查的轻量 OCP

\`\`\`python
from typing import Protocol


class ReportFormatter(Protocol):   # 结构化协议,无需继承
    name: str
    def format(self, data: list[dict]) -> str: ...


class CsvFormatter:                # 不显式声明,但结构满足 Protocol
    name = "csv"
    def format(self, data: list[dict]) -> str:
        return "csv content"


def export(formatter: ReportFormatter, data):   # mypy 会检查
    return formatter.format(data)


export(CsvFormatter(), [])   # ✅ mypy 通过
\`\`\`

\`Protocol\` 兼顾了鸭子类型的轻量和静态类型的安全,是 Python 现代 OCP 实践的推荐方式。

### 3. monkey patch:能用但别用

Python 允许运行时给类/对象打补丁:

\`\`\`python
# 给已有类加方法(monkey patch)
class ReportExporter:
    pass

def export_csv(self, data):
    return "csv"

ReportExporter.export_csv = export_csv   # 运行时塞个方法进去
\`\`\`

这看似"对扩展开放"(不用改源码就能加方法),但**严重违反 OCP 精神**:

- 隐蔽性极强:谁 patch 了什么,IDE 和类型检查器都不知道
- 全局污染:patch 影响所有实例,容易冲突
- 不可追踪:出 bug 时根本找不到方法定义在哪

**结论**:**monkey patch 不是 OCP,是 hack**。OCP 强调的是"通过抽象有计划地扩展",不是"通过黑魔法偷偷塞代码"。除非是测试 mock 或兼容老库,否则别用。

### 4. 函数式 OCP:高阶函数

Python 函数是一等公民,OCP 也能用高阶函数实现,比抽象类更轻:

\`\`\`python
from typing import Callable

# 用 Callable 类型别名代替抽象基类
FormatterFn = Callable[[list[dict]], str]

# 注册表存函数而不是对象
formatters: dict[str, FormatterFn] = {}

def formatter(name: str):
    """装饰器:注册格式化函数。"""
    def deco(fn: FormatterFn) -> FormatterFn:
        formatters[name] = fn
        return fn
    return deco

@formatter("csv")
def to_csv(data: list[dict]) -> str:
    if not data:
        return ""
    lines = [",".join(data[0].keys())]
    for row in data:
        lines.append(",".join(str(v) for v in row.values()))
    return "\\n".join(lines)

@formatter("json")
def to_json(data: list[dict]) -> str:
    import json
    return json.dumps(data, ensure_ascii=False, indent=2)

# 加新格式:写个函数 + 加装饰器,完全不改老代码
@formatter("yaml")
def to_yaml(data: list[dict]) -> str:
    lines = []
    for row in data:
        for k, v in row.items():
            lines.append(f"{k}: {v}")
        lines.append("")
    return "\\n".join(lines)


def export(data, format_name):
    if format_name not in formatters:
        raise ValueError(f"不支持的格式: {format_name}")
    return formatters[format_name](data)


print(export([{"a": 1}], "csv"))
print(export([{"a": 1}], "yaml"))
\`\`\`

函数式 OCP 在"无状态行为"场景下比类更轻量。Python 标准库的 \`functools.singledispatch\` 也是这个思路。

### 5. functools.singledispatch:基于类型的 OCP

\`\`\`python
from functools import singledispatch
from dataclasses import dataclass


@singledispatch
def to_json(obj):
    """默认实现:抛错。"""
    raise TypeError(f"不支持类型: {type(obj)}")


@to_json.register(int)
def _(obj):
    return str(obj)

@to_json.register(str)
def _(obj):
    return f'"{obj}"'

@to_json.register(list)
def _(obj):
    return "[" + ", ".join(to_json(x) for x in obj) + "]"

@to_json.register(dict)
def _(obj):
    pairs = [f'"{k}": {to_json(v)}' for k, v in obj.items()]
    return "{" + ", ".join(pairs) + "}"


# 加新类型支持:注册新函数,不改老代码
@dataclass
class User:
    name: str

@to_json.register(User)
def _(obj):
    return f'{{"name": "{obj.name}"}}'


print(to_json({"name": "Alice", "age": 30}))
print(to_json(User("Bob")))
\`\`\`

\`singledispatch\` 适合"根据参数类型分派"的场景,加新类型只需 \`@to_json.register\`。

## 七、OCP 的代价:别滥用

OCP 不是免费的,抽象有成本。

### 抽象的代价

\`\`\`text
直接 if-elif:                      抽象基类 + 子类:
  - 写起来快                         - 要设计抽象、注册、工厂
  - 看代码一目了然                   - 跳来跳去才看懂流程
  - 类型少时(2-3种)最划算          - 类型多时才显示优势
\`\`\`

### 什么时候不必用 OCP

| 场景 | 不用 OCP 的理由 |
|------|-----------------|
| 类型只有 2-3 种且稳定不变 | 抽象成本 > 收益,直接 if 更清晰 |
| 一次性脚本/原型 | 跑完就扔,不值得设计扩展点 |
| 分支逻辑极简单 | 一个 \`if-else\` 三行搞定,拆类反而啰嗦 |
| 性能敏感热点 | 多态有(微小的)分派开销,确认瓶颈再优化 |

### "三次法则"

一个经验法则:**第一次直接写,第二次容忍重复,第三次再抽象**。

\`\`\`text
第 1 种格式:直接 if
第 2 种格式:加 elif(开始有点重复,但还忍得了)
第 3 种格式:再 elif → 信号!该重构为 OCP 了
\`\`\`

过早抽象和过晚抽象都有害。**等变化真的发生了再抽象**,这是 YAGNI 的精神。

## 八、OCP 与 SRP 的关系

OCP 和 SRP 是孪生兄弟:

\`\`\`text
违反 SRP → 一个类管多件事 → 加新功能时被迫改这个类 → 违反 OCP
违反 OCP → 加新功能要改老代码 → 老代码职责被反复修改 → 难以保持 SRP
\`\`\`

反过来:

\`\`\`text
遵守 SRP → 类职责单一 → 加新功能时只能新增类 → 自然符合 OCP
遵守 OCP → 扩展点清晰 → 各类各管一摊 → 帮助维持 SRP
\`\`\`

在报表系统的例子里,重构前 \`ReportExporter\` 既管"调度"又管"各格式逻辑"(违反 SRP),导致加格式要改它(违反 OCP)。重构后 \`ReportExporter\` 只管调度(SRP),加格式只加新类(OCP)——两个原则一起满足了。

## 九、完整示例:可扩展的折扣系统

最后用一个完整例子综合演示 OCP。需求:电商系统要支持多种折扣策略,且未来会不断加新策略。

### 反例(违反 OCP)

\`\`\`python
class DiscountCalculator:
    def calculate(self, price, discount_type, **kwargs):
        if discount_type == "none":
            return price
        elif discount_type == "percentage":
            return price * (1 - kwargs["rate"])
        elif discount_type == "fixed":
            return max(0, price - kwargs["amount"])
        elif discount_type == "buy2get1":
            # 买二送一:三件中最便宜的一件免费
            quantities = kwargs.get("quantity", 1)
            free = quantities // 3
            return price * (quantities - free)
        # 加新策略?改这里
        else:
            raise ValueError(f"不支持的折扣: {discount_type}")
\`\`\`

### 正例(符合 OCP)

\`\`\`python
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class OrderItem:
    price: float
    quantity: int = 1


class DiscountStrategy(ABC):
    """折扣策略抽象。"""
    @abstractmethod
    def apply(self, item: OrderItem) -> float:
        """返回折后总价。"""
        ...


class NoDiscount(DiscountStrategy):
    def apply(self, item): return item.price * item.quantity


class PercentageDiscount(DiscountStrategy):
    def __init__(self, rate: float):
        self.rate = rate   # 0.2 = 打 8 折
    def apply(self, item):
        return item.price * item.quantity * (1 - self.rate)


class FixedDiscount(DiscountStrategy):
    def __init__(self, amount: float):
        self.amount = amount
    def apply(self, item):
        return max(0, item.price * item.quantity - self.amount)


class Buy2Get1FreeDiscount(DiscountStrategy):
    def apply(self, item):
        free = item.quantity // 3
        return item.price * (item.quantity - free)


class DiscountCalculator:
    """只管调度,不管具体策略。"""
    def __init__(self, strategy: DiscountStrategy):
        self.strategy = strategy

    def set_strategy(self, strategy: DiscountStrategy):
        self.strategy = strategy

    def calculate(self, item: OrderItem) -> float:
        return self.strategy.apply(item)


# 加新策略:满减(完全不改老代码!)
class ThresholdDiscount(DiscountStrategy):
    """满 200 减 30。"""
    def __init__(self, threshold: float, off: float):
        self.threshold = threshold
        self.off = off
    def apply(self, item):
        total = item.price * item.quantity
        if total >= self.threshold:
            return total - self.off
        return total


# 使用
item = OrderItem(price=100, quantity=3)
calc = DiscountCalculator(NoDiscount())
print(f"无折扣: {calc.calculate(item)}")

calc.set_strategy(PercentageDiscount(0.2))   # 打 8 折
print(f"8 折: {calc.calculate(item)}")

calc.set_strategy(Buy2Get1FreeDiscount())
print(f"买二送一: {calc.calculate(item)}")

calc.set_strategy(ThresholdDiscount(200, 30))   # 新策略,老代码零修改
print(f"满 200 减 30: {calc.calculate(item)}")
\`\`\`

加 \`ThresholdDiscount\` 时,\`DiscountCalculator\`、\`NoDiscount\`、\`PercentageDiscount\` 等**一行都没改**。这就是 OCP 在实战中的样子。

## 十、本章小结

| 要点 | 内容 |
|------|------|
| **OCP 定义** | 对扩展开放,对修改关闭 |
| **核心机制** | 用抽象 + 多态替代条件分支 |
| **坏味道** | 按"类型"分支的 if-elif-else 长链 |
| **常见模式** | 抽象基类 + 子类、策略、模板方法、观察者 |
| **Python 特性** | 鸭子类型 / Protocol / singledispatch / 高阶函数 |
| **代价** | 抽象有成本,遵循"三次法则"别过早抽象 |
| **与 SRP 关系** | SRP 是 OCP 的前提,两者协同 |

## 十一、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ OCP = 永远不能改代码 | 任何修改都违反 OCP | 是"加新功能不改老代码",修 bug、重构仍可改 |
| ❌ 加 if-else 就算违反 OCP | 一切分支都该重构 | 类型稳定且少时分支合理,变化频繁才抽象 |
| ❌ monkey patch 是 OCP | 运行时塞方法就是扩展 | monkey patch 是黑魔法,不是有计划的抽象扩展 |
| ❌ 一上来就全抽象 | 越多抽象越符合 OCP | 过早抽象违反 YAGNI,等变化发生再抽象 |
| ❌ 抽象基类必须用 ABC | 没继承就不是 OCP | 鸭子类型/Protocol/高阶函数都能实现 OCP |
| ❌ OCP 只针对类 | 函数不用考虑 OCP | 函数同样要 OCP(用 singledispatch/高阶函数) |
| ❌ 注册表越自动越好 | 用元类/装饰器全自动注册 | 显式注册更可控,自动注册增加调试难度 |
| ❌ OCP 和 SRP 冲突 | 二选一 | 两者协同:SRP 拆出职责,OCP 让职责可扩展 |

> **一句话总结**:OCP 的目标是"加新功能不改老代码"。核心手法是"用抽象 + 多态替代分支"。判断要不要上 OCP,看"这部分会不会变"——会变且类型多就抽象,稳定就保持简单。`,
  },
];
