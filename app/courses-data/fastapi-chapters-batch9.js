// =============================================================
// FastAPI 应用开发实战教程 - 第 9 批章节（数据库集成 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-sqlalchemy : SQLAlchemy 2.0 ORM
//   fa-db-session : 数据库连接与 Session
//   fa-crud       : CRUD 实战
//   fa-alembic    : Alembic 数据库迁移
// ============================================================

export const chapters = [
  // =========================================================
  // 第一章：SQLAlchemy 2.0 ORM
  // =========================================================
  {
    id: "fa-sqlalchemy",
    group: "数据库集成",
    icon: "🗄️",
    title: "SQLAlchemy 2.0 ORM",
    content: `

# SQLAlchemy 2.0 ORM

## 一、开篇：为什么 Web 应用离不开数据库

到目前为止，我们写的 FastAPI 应用所有数据都活在内存里：进程一重启，用户、文章、订单全部消失。真实业务可不能这样——你下单买了一本书，第二天再打开网站，订单必须还在。数据库（Database）就是用来**持久化**数据的：把数据按结构写到磁盘，应用重启后还能读回来。

一个 Web 后端 80% 的工作可以归结为：**接收请求 → 校验 → 读写数据库 → 返回结果**。所以"如何用 Python 优雅地操作数据库"是后端开发的核心技能。SQLAlchemy 就是 Python 生态里最成熟、最强大的数据库工具包，FastAPI 官方文档也大量使用它。

这一章我们先把"为什么用 ORM"想清楚，再系统学习 SQLAlchemy 2.0 的模型定义、列类型、关系、继承，最后用博客系统把所有知识点串起来。

## 二、SQLAlchemy 是什么：ORM 的本质

**SQLAlchemy** 是 Python 的一个 ORM（Object-Relational Mapping，对象关系映射）库。它在你定义的 Python 类和数据库表之间建立映射：你写 \`User\` 类，它对应 \`users\` 表；你给 \`user.name\` 赋值，最终变成 \`UPDATE users SET name=...\`。

SQLAlchemy 把"操作数据库"分成两层：

\`\`\`txt filename="SQLAlchemy 两层架构"
┌─────────────────────────────────────────────┐
│  ORM 层（高层）：User / Post 等 Python 类       │
│      ↕  自动翻译                              │
│  Core 层（底层）：SQL 表达式 / 连接 / 事务       │
│      ↕  驱动                                  │
│  数据库（MySQL / PostgreSQL / SQLite）         │
└─────────────────────────────────────────────┘
\`\`\`

- **Core**：提供 SQL 表达式语言，贴近 SQL 本身，适合写复杂查询。
- **ORM**：建立在 Core 之上，用类和对象封装表和行，更面向对象。

你可以只用 Core，也可以只用 ORM，多数 Web 项目用 ORM 即可，复杂查询再下沉到 Core 的 \`text()\` 写原生 SQL。

## 三、SQLAlchemy 2.0 新特性：一次重要的范式切换

SQLAlchemy 2.0 在 2023 年正式发布，是一次重大升级。如果你看的教程还在用 \`Column(String)\`、\`session.query(User).filter(...)\`，那是 1.x 老写法。现代项目应该统一用 2.0 新风格。

| 维度 | SQLAlchemy 1.x | SQLAlchemy 2.0 |
|------|----------------|----------------|
| 列定义 | \`Column(String, primary_key=True)\` | \`mapped_column(primary_key=True)\` + 类型注解 |
| 字段类型 | 在 Column 里写 | 用 \`Mapped[str]\` 注解声明 |
| 查询写法 | \`session.query(User).filter(...)\` | \`session.execute(select(User).where(...))\` |
| 关系访问 | 懒加载，隐式 | 显式 \`Mapped["Post"]\`，类型更清晰 |
| 异步支持 | 实验性 | 一等公民（AsyncSession） |
| 风格 | 命令式、魔法多 | 类型驱动、显式、与 mypy 友好 |

2.0 的核心思想是**用类型注解驱动模型定义**。借助 \`Mapped[T]\`，IDE 和类型检查器能知道 \`user.name\` 是 \`str\`，减少运行时错误。这也是为什么 FastAPI 官方推荐 2.0——它和 FastAPI 的"类型驱动"哲学完全一致。

> **避坑**：网上很多老教程还在用 1.x 写法，能跑但会丢失类型提示。新项目直接上 2.0；读老代码时认识 1.x 写法即可，不必强行迁移。

## 四、为什么用 ORM 而不是裸写 SQL

初学者常问："我自己拼 SQL 字符串不行吗？"能跑，但代价大。对比一下：

\`\`\`python filename="裸 SQL 写法（反面教材，有 SQL 注入风险）"
# 导入 sqlite3 模块
import sqlite3

# 拼接 SQL 字符串——危险！
# 定义函数 get_user，参数: name
def get_user(name):
    # 连接到 app.db 数据库
    conn = sqlite3.connect("app.db")
    # 用 f-string 直接拼接 name 到 SQL 里
    cursor = conn.execute(f"SELECT * FROM users WHERE name = '{name}'")
    # ❌ 如果 name 是 "'; DROP TABLE users; --"，表就没了（SQL 注入）
    # 返回查到的第一行
    return cursor.fetchone()
\`\`\`

\`\`\`python filename="ORM 写法（推荐，自动防注入）"
# 从 sqlalchemy 导入 select
from sqlalchemy import select
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 定义函数 get_user，参数: session, name
def get_user(session: Session, name: str):
    # ✅ 参数化查询，自动防 SQL 注入
    # 用 select() 构造查询语句，where 条件用 == 比较
    stmt = select(User).where(User.name == name)
    # 执行语句并取单条结果（没有则返回 None）
    return session.execute(stmt).scalar_one_or_none()
\`\`\`

ORM 的核心价值：

1. **防 SQL 注入**：所有参数都走参数化绑定，从机制上杜绝拼接漏洞。
2. **面向对象**：操作 \`user.posts\` 而不是 \`JOIN posts ON ...\`，业务代码更易读。
3. **数据库无关**：换数据库（SQLite → PostgreSQL）几乎只改连接字符串，模型不变。
4. **类型安全**：2.0 配合类型注解，编辑器能自动补全 \`User.\` 后的列名。
5. **迁移联动**：Alembic 能根据模型变化自动生成迁移脚本（下一章会讲）。

当然 ORM 也有代价：极复杂的统计查询（多表聚合、窗口函数）用 ORM 表达反而啰嗦，这时可以下沉到 Core 的 \`text()\` 写原生 SQL。**ORM 不是银弹，但它是默认选择**。

## 五、Declarative Base 声明：所有模型的根基

SQLAlchemy 2.0 用"声明式"定义模型：写一个 Python 类，继承 \`DeclarativeBase\`，类属性就是表字段。

\`\`\`python filename="models.py - Declarative Base 与第一个模型"
# 从 datetime 导入 datetime（用于时间字段）
from datetime import datetime
# 从 typing 导入 Optional（表示可空字段）
from typing import Optional
# 从 sqlalchemy 导入 String（字符串列类型）
from sqlalchemy import String
# 从 sqlalchemy.orm 导入 4 个核心构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 1. 所有模型的基类：自定义一个 Base，继承 DeclarativeBase
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # 所有模型的根基类，被 Alembic 和 Session 共享
    # 这里 pass 表示不额外配置，但这个类本身会维护一个 metadata
    pass

# 2. User 模型 → 对应 users 表
# 定义类 User，继承 Base
class User(Base):
    # __tablename__ 显式指定表名（不写则用类名小写）
    __tablename__ = "users"

    # Mapped[int] 声明字段的 Python 类型是 int
    # mapped_column(primary_key=True) 表示这一列是主键，自增
    id: Mapped[int] = mapped_column(primary_key=True)

    # Mapped[str] 表示必填字符串；String(50) 限制数据库里最长 50 字符
    name: Mapped[str] = mapped_column(String(50))

    # Mapped[str] + unique=True 表示唯一索引（邮箱不能重复）
    email: Mapped[str] = mapped_column(String(120), unique=True)

    # Mapped[Optional[str]] 表示可空（对应数据库 NULL）
    # mapped_column(default=None) 显式给默认值 None
    bio: Mapped[Optional[str]] = mapped_column(default=None)

    # 创建时间：default 是 Python 端默认值（插入时调用函数）
    # datetime.now 不要加括号——传函数本身，不是调用结果
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # __repr__ 方便调试时打印对象
    def __repr__(self):
        return f"<User id={self.id} name={self.name}>"
\`\`\`

关键点逐条解释：

- **\`DeclarativeBase\`**：2.0 的新基类（1.x 叫 \`declarative_base()\` 函数）。所有模型继承它，它维护一个 \`metadata\` 对象，记录"所有表的结构"。
- **\`Mapped[T]\`**：类型注解，T 是 Python 类型。SQLAlchemy 据此推断数据库列类型（\`int\` → \`Integer\`，\`str\` → \`String\`）。
- **\`mapped_column(...)\`**：配置列属性（主键、唯一、默认值、索引等），替代 1.x 的 \`Column\`。
- **\`__tablename__\`**：必写（除非用 \`__tablename__\` 自动生成规则）。不写 SQLAlchemy 2.0 会警告，且表名不可控。

> **怎么想**：为什么 2.0 要搞出 \`Mapped\` + \`mapped_column\` 两件事？因为职责分离：\`Mapped[T]\` 只管"Python 端是什么类型"（给 IDE 看），\`mapped_column(...)\` 只管"数据库端怎么建列"（给 DDL 看）。这样类型检查和列配置互不干扰。

## 六、Mapped 与 mapped_column 语法详解

\`Mapped[T]\` 和 \`mapped_column()\` 是 2.0 的灵魂。把它们彻底搞懂，模型定义就通了。

\`\`\`python filename="Mapped 与 mapped_column 全参数演示"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional
from typing import Optional
# 从 sqlalchemy 导入各种列类型和约束
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey, func
# 从 sqlalchemy.orm 导入声明式相关构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Article，继承 Base
class Article(Base):
    __tablename__ = "articles"

    # 1. 主键：Mapped[int] + mapped_column(primary_key=True)
    # 数据库会自动 AUTOINCREMENT
    id: Mapped[int] = mapped_column(primary_key=True)

    # 2. 必填字符串：Mapped[str] + String(200)
    # String(200) 限制 VARCHAR(200)，不写长度某些数据库会报错
    title: Mapped[str] = mapped_column(String(200))

    # 3. 长文本：Mapped[str] + Text（不限长度，适合正文）
    body: Mapped[str] = mapped_column(Text)

    # 4. 布尔：Mapped[bool]，数据库里存 0/1
    published: Mapped[bool] = mapped_column(default=False)

    # 5. 整数带默认值：default=0
    view_count: Mapped[int] = mapped_column(default=0)

    # 6. 可空字段：Mapped[Optional[str]]（注意是 Optional 才允许 NULL）
    summary: Mapped[Optional[str]] = mapped_column(default=None)

    # 7. 服务器端默认值：server_default（写在 DDL 里，不是 Python 端）
    # func.now() 生成数据库的 NOW()，插入时数据库自己填
    # 和 Python 端 default=datetime.now 的区别：
    #   - default：SQLAlchemy 在 Python 里算好时间再发 INSERT
    #   - server_default：DDL 里写 DEFAULT NOW()，由数据库自己填
    # server_default 的好处：多语言客户端共用同一库时，时间标准统一
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # 8. 更新时间：onupdate 在 UPDATE 时触发（Python 端）
    # onupdate=datetime.now 表示每次 UPDATE 时自动刷新时间
    # 注意：传函数本身，不是调用结果（不带括号）
    # 配合 default=None，首次插入时为 None，更新后才有值
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        default=None, onupdate=datetime.now
    )

    # 9. 索引：index=True 创建普通索引，加速 WHERE 查询
    slug: Mapped[str] = mapped_column(String(100), index=True)

    # 10. 唯一约束：unique=True
    code: Mapped[str] = mapped_column(String(32), unique=True)

    def __repr__(self):
        return f"<Article id={self.id} title={self.title}>"
\`\`\`

**default vs server_default 的区别**（高频面试题）：

- \`default\`：Python 端默认值。INSERT 时 SQLAlchemy 在 Python 里填好再发 SQL。数据库看到的语句已经带值。
- \`server_default\`：数据库端默认值。DDL 里写 \`DEFAULT NOW()\`，INSERT 不带这列时数据库自己填。

什么时候用哪个？想让数据库统一管理（比如多语言客户端共用同一库）用 \`server_default\`；想在 Python 里可控（比如生成 UUID）用 \`default\`。两者可以共存。

> **避坑**：\`default=datetime.now()\`（加了括号）是错的——它在类定义时就执行一次，所有行都用同一个时间。必须写 \`default=datetime.now\`（传函数本身），每次插入才调用。

## 七、常用 Column 类型一览

SQLAlchemy 提供丰富的列类型，覆盖常见数据库类型：

| Python 类型 | SQLAlchemy 类型 | 数据库类型 | 用途 |
|-------------|----------------|------------|------|
| \`int\` | \`Integer\`（自动推断） | INT | 整数 |
| \`str\` | \`String(n)\` | VARCHAR(n) | 限长字符串 |
| \`str\` | \`Text\` | TEXT | 不限长文本 |
| \`bool\` | \`Boolean\` | BOOLEAN/TINYINT | 布尔 |
| \`float\` | \`Float\` | FLOAT | 浮点数 |
| \`Decimal\` | \`Numeric(p, s)\` | DECIMAL | 精确小数（金额） |
| \`datetime\` | \`DateTime\` | DATETIME | 日期时间 |
| \`date\` | \`Date\` | DATE | 日期 |
| \`dict\` / \`list\` | \`JSON\` | JSON | 结构化数据 |
| \`bytes\` | \`LargeBinary\` | BLOB | 二进制 |
| \`enum.Enum\` | \`Enum\` | ENUM | 枚举 |

\`\`\`python filename="列类型实战演示"
# 从 datetime 导入 datetime, date
from datetime import datetime, date
# 从 decimal 导入 Decimal（精确小数）
from decimal import Decimal
# 从 enum 导入 Enum（Python 枚举）
from enum import Enum
# 从 typing 导入 Optional, Dict, List
from typing import Optional, Dict, List
# 从 sqlalchemy 导入列类型
from sqlalchemy import String, Text, Boolean, Numeric, DateTime, Date, JSON, Enum as SAEnum
# 从 sqlalchemy.orm 导入声明式构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义枚举 OrderStatus，继承 Enum
class OrderStatus(Enum):
    # 待支付
    PENDING = "pending"
    # 已支付
    PAID = "paid"
    # 已取消
    CANCELED = "canceled"

# 定义类 Product，继承 Base
class Product(Base):
    __tablename__ = "products"

    # 主键
    id: Mapped[int] = mapped_column(primary_key=True)
    # 名称，限长 100
    name: Mapped[str] = mapped_column(String(100))
    # 价格用 Numeric 精确存储，避免浮点误差（金额绝不用 float）
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    # 库存
    stock: Mapped[int] = mapped_column(default=0)
    # JSON 字段存任意结构化数据（规格、属性等）
    attrs: Mapped[dict] = mapped_column(JSON, default=dict)
    # 上架日期
    listed_at: Mapped[Optional[date]] = mapped_column(default=None)
    # 枚举字段：SAEnum 会自动建 ENUM 类型
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus), default=OrderStatus.PENDING
    )

    def __repr__(self):
        return f"<Product {self.name} ¥{self.price}>"
\`\`\`

> **避坑**：金额字段**绝对不要**用 \`float\`。0.1 + 0.2 在浮点里不等于 0.3，财务系统会出大事。用 \`Numeric(10, 2)\` 表示总共 10 位、小数 2 位。

## 八、模型关系：一对多

关系（Relationship）是 ORM 最强大的能力。博客系统里，一个用户有多篇文章（一对多），一篇文章有多条评论（一对多）。SQLAlchemy 用 \`ForeignKey\` + \`relationship()\` 表达。

\`\`\`python filename="一对多：User → Post"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional, List
from typing import Optional, List
# 从 sqlalchemy 导入 String, ForeignKey
from sqlalchemy import String, ForeignKey
# 从 sqlalchemy.orm 导入声明式构件和 relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base（一的一方）
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    # relationship：声明"一个 user 有多个 post"
    # Mapped[List["Post"]] 用字符串 "Post" 避免前向引用问题
    # back_populates 让两端互相引用，双向同步
    posts: Mapped[List["Post"]] = relationship(back_populates="author")

# 定义类 Post，继承 Base（多的一方）
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))

    # ForeignKey：外键，指向 users.id
    # 这是数据库层面的关联，建表时会生成外键约束
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # relationship：声明"这篇 post 属于哪个 user"
    # 注意类型是单个对象 Mapped["User"]，不是 List
    author: Mapped["User"] = relationship(back_populates="posts")
\`\`\`

**怎么想**：一对多关系里，"多"的一方持有外键（\`author_id\`），"一"的一方不持有外键但用 \`relationship()\` 声明集合。两端的 \`back_populates\` 互相指名对方属性名，保证 \`user.posts.append(post)\` 时 \`post.author\` 也同步更新。

\`\`\`python filename="一对多使用示例"
# 创建会话（后面章节详解）
# 假设已有 session

# 创建用户
# 创建 User 对象，赋值 name="小明"
user = User(name="小明")
# 创建两篇文章
post1 = Post(title="第一篇", author_id=0)  # author_id 先占位
post2 = Post(title="第二篇", author_id=0)

# 用 relationship 自动维护外键（推荐）
# 把 post 加到 user.posts，author_id 会被自动填好
user.posts.append(post1)
user.posts.append(post2)

# 添加并提交（后面 CRUD 章节详解）
# session.add(user)
# session.commit()

# 反向访问：从 post 找 author
# print(post1.author.name)  # 输出 "小明"
\`\`\`

## 九、模型关系：多对多

多对多需要一张**关联表**（association table）。博客里文章和标签是多对多：一篇文章有多个标签，一个标签下有多篇文章。

\`\`\`python filename="多对多：Post ↔ Tag"
# 从 typing 导入 List
from typing import List
# 从 sqlalchemy 导入 Column, Integer, String, ForeignKey, Table
from sqlalchemy import Column, Integer, String, ForeignKey, Table
# 从 sqlalchemy.orm 导入声明式构件和 relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 1. 关联表：post_tags，只有两个外键列，没有自己的模型类
# Table("表名", Base.metadata, 列定义...)
post_tags = Table(
    "post_tags",
    Base.metadata,
    # post_id 外键指向 posts.id
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
    # tag_id 外键指向 tags.id
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

# 定义类 Post，继承 Base
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))

    # secondary=post_tags：指定关联表
    # 多对多两端都用 List
    tags: Mapped[List["Tag"]] = relationship(
        secondary=post_tags, back_populates="posts"
    )

# 定义类 Tag，继承 Base
class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    posts: Mapped[List["Post"]] = relationship(
        secondary=post_tags, back_populates="tags"
    )
\`\`\`

**怎么想**：多对多的关键是关联表 \`post_tags\`，它只有两个外键，不是模型类（没有继承 Base）。两端的 \`relationship(secondary=post_tags)\` 告诉 SQLAlchemy"通过这张中间表关联"。增删时 SQLAlchemy 自动维护中间表。

\`\`\`python filename="多对多使用示例"
# 创建标签
# 创建 Tag 对象，赋值 name="Python"
tag_py = Tag(name="Python")
# 创建 Tag 对象，赋值 name="FastAPI"
tag_fa = Tag(name="FastAPI")

# 创建文章
# 创建 Post 对象，赋值 title="学 FastAPI"
post = Post(title="学 FastAPI")

# 给文章打标签（双向同步）
post.tags.append(tag_py)
post.tags.append(tag_fa)

# 也可以反向：从标签找文章
# print([p.title for p in tag_py.posts])  # ["学 FastAPI"]

# 提交后，post_tags 表会自动插入两行：(post_id, tag_py.id) 和 (post_id, tag_fa.id)
\`\`\`

## 十、模型关系：一对一

一对一是一对多的特例，加 \`uselist=False\` 即可。比如用户和用户档案是一对一。

\`\`\`python filename="一对一：User ↔ Profile"
# 从 typing 导入 Optional
from typing import Optional
# 从 sqlalchemy 导入 String, ForeignKey
from sqlalchemy import String, ForeignKey
# 从 sqlalchemy.orm 导入声明式构件和 relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    # uselist=False：把"集合"变成"单个对象"，实现一对一
    # 注意类型是 Mapped["Profile"]（单个），不是 List
    profile: Mapped[Optional["Profile"]] = relationship(
        back_populates="user", uselist=False
    )

# 定义类 Profile，继承 Base
class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 外键指向 users.id，加 unique 确保一对一（数据库层面兜底）
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    bio: Mapped[str] = mapped_column(String(500))

    user: Mapped["User"] = relationship(back_populates="profile")

# 使用：
# 创建 User 对象，赋值 name="小明"
user = User(name="小明")
# 创建 Profile 对象，赋值 bio="热爱编程"
profile = Profile(bio="热爱编程")
# 赋值给 user.profile（一对一，直接赋单个对象）
user.profile = profile
\`\`\`

> **避坑**：一对一忘了 \`uselist=False\`，\`user.profile\` 会变成一个列表（虽然外键 unique 了），访问 \`user.profile.bio\` 就报错。记得一对一两端都要么 \`uselist=False\`，要么用外键 unique 约束兜底。

## 十一、__tablename__ 和 __table_args__

\`__tablename__\` 指定表名，\`__table_args__\` 配置表级选项（约束、索引、注释等）。

\`\`\`python filename="__table_args__ 用法"
# 从 sqlalchemy 导入 String, UniqueConstraint, Index, Comment
from sqlalchemy import String, UniqueConstraint, Index
# 从 sqlalchemy.orm 导入声明式构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Student，继承 Base
class Student(Base):
    __tablename__ = "students"

    # __table_args__ 是一个元组或字典
    # 元组里放约束/索引，最后一个可以是字典（表选项）
    __table_args__ = (
        # 联合唯一约束：class_id + student_no 组合唯一
        UniqueConstraint("class_id", "student_no", name="uq_class_studentno"),
        # 联合索引：加速按 class_id + name 查询
        Index("ix_class_name", "class_id", "name"),
        # 字典：表注释（MySQL 支持，方便 DBA 看表用途）
        {"comment": "学生表"},
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    class_id: Mapped[int] = mapped_column()
    student_no: Mapped[str] = mapped_column(String(20))
\`\`\`

## 十二、模型继承

SQLAlchemy 支持三种继承：单表继承、联合继承、具体表继承。最常用的是**单表继承**——多个子类共用一张表，用 \`type\` 列区分。

\`\`\`python filename="单表继承：Employee → Manager/Engineer"
# 从 sqlalchemy 导入 String, Integer
from sqlalchemy import String, Integer
# 从 sqlalchemy.orm 导入声明式构件和 polymorphic_on, polymorphic_identity
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column,
    polymorphic_on, polymorphic_identity,
)

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 父类 Employee：对应 employees 表
# 定义类 Employee，继承 Base
class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    # polymorphic_on：指定用哪一列区分子类类型
    type: Mapped[str] = mapped_column(String(20))

    # polymorphic_identity：本类对应的 type 值
    __mapper_args__ = {
        "polymorphic_on": type,
        "polymorphic_identity": "employee",
    }

# 子类 Manager：和 Employee 共用一张表
# 定义类 Manager，继承 Employee
class Manager(Employee):
    # manager_salary 列
    manager_salary: Mapped[int] = mapped_column(Integer, default=0)
    # 子类的 polymorphic_identity 是 "manager"
    __mapper_args__ = {"polymorphic_identity": "manager"}

# 子类 Engineer：和 Employee 共用一张表
# 定义类 Engineer，继承 Employee
class Engineer(Employee):
    # engineer_salary 列
    engineer_salary: Mapped[int] = mapped_column(Integer, default=0)
    __mapper_args__ = {"polymorphic_identity": "engineer"}

# 查询时：
# select(Employee) 会查出所有员工，并根据 type 自动还原成 Manager 或 Engineer
# session.add(Manager(name="张总", manager_salary=50000))
# session.add(Engineer(name="李工", engineer_salary=30000))
\`\`\`

**怎么想**：单表继承适合"字段大部分相同、只有少量差异"的场景。所有子类共享一张表，没用的列存 NULL。优点是查询简单（不用 JOIN），缺点是字段稀疏（子类独有的列在父类行里是 NULL）。

## 十三、实战：博客系统数据模型设计

把前面的知识点串起来，设计一个完整的博客系统数据模型：User、Post、Comment、Tag。

\`\`\`python filename="blog/models.py - 完整博客模型"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional, List
from typing import Optional, List
# 从 sqlalchemy 导入各种列类型和约束
from sqlalchemy import (
    String, Text, Boolean, Integer, ForeignKey, Table, Index,
)
# 从 sqlalchemy.orm 导入声明式构件和 relationship
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 1. 基类
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 2. 多对多关联表：posts ↔ tags
post_tags = Table(
    "post_tags",
    Base.metadata,
    # post_id 外键
    Column := None,  # 占位，实际用 Column
)
# 上面的写法是错的，重新写：
post_tags = Table(
    "post_tags",
    Base.metadata,
    # post_id 列，外键指向 posts.id
    __import__("sqlalchemy").Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
    # tag_id 列，外键指向 tags.id
    __import__("sqlalchemy").Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

# 3. User 模型（用户表，博客系统的核心实体）
# 定义类 User，继承 Base
class User(Base):
    # __tablename__ 指定数据库里的真实表名
    __tablename__ = "users"
    # 主键 id：自增整数，Mapped[int] 表示 Python 端是 int 类型
    id: Mapped[int] = mapped_column(primary_key=True)
    # 用户名：限长 50 字符，NOT NULL（因为 Mapped[str] 没加 Optional）
    name: Mapped[str] = mapped_column(String(50))
    # 邮箱：限长 120，加 unique=True 创建唯一索引，确保邮箱不重复
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 是否是管理员：bool 类型，数据库存 0/1，默认 False
    is_admin: Mapped[bool] = mapped_column(default=False)
    # 创建时间：default 传函数本身（不带括号），每次插入时调用 datetime.now
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # 一个用户有多篇文章（一对多关系）
    # Mapped[List["Post"]]：List 表示多方，"Post" 用字符串避免前向引用
    # back_populates="author"：与 Post.author 属性双向同步
    # cascade="all, delete-orphan"：级联策略
    #   - all：包含 save-update, merge, refresh-expire, expunge, delete
    #   - delete-orphan：删用户时，关联的孤儿文章也一起删
    posts: Mapped[List["Post"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    # 一个用户有多条评论（一对多关系）
    # 同样用 delete-orphan：删用户时连带删他的评论，避免孤儿数据
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    # 一对一：用户档案
    # uselist=False：把默认的"集合"改成"单个对象"，实现一对一
    # Mapped[Optional["Profile"]]：Optional 表示档案可能不存在（未填写）
    profile: Mapped[Optional["Profile"]] = relationship(
        back_populates="user", uselist=False
    )

# 4. Profile 模型（用户档案，与 User 一对一）
# 定义类 Profile，继承 Base
class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 外键指向 users.id，加 unique=True 从数据库层面保证一对一
    # （即使 SQLAlchemy 的 uselist=False 配错，数据库也会拦截重复）
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    # 个人简介：限长 500，默认空字符串（不是 None，方便前端展示）
    bio: Mapped[str] = mapped_column(String(500), default="")
    # 头像 URL：可空，用户没上传时为 None
    avatar: Mapped[Optional[str]] = mapped_column(default=None)

    # 反向关系：指向所属的 User 对象
    user: Mapped["User"] = relationship(back_populates="profile")

# 5. Post 模型（文章表，博客系统的内容主体）
# 定义类 Post，继承 Base
class Post(Base):
    __tablename__ = "posts"
    # __table_args__ 配置表级选项（索引、约束等）
    __table_args__ = (
        # 联合索引：按作者 + 创建时间查询（常用列表页场景）
        # 比如查"某作者最新 10 篇文章"，联合索引能避免回表
        Index("ix_author_created", "author_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # 标题：限长 200，必填
    title: Mapped[str] = mapped_column(String(200))
    # 正文：用 Text 类型，不限长度，适合长文章
    body: Mapped[str] = mapped_column(Text)
    # 是否发布：bool，默认 False（草稿状态），发布后改为 True
    published: Mapped[bool] = mapped_column(default=False)
    # 浏览量：整数，默认 0，每次访问 +1
    view_count: Mapped[int] = mapped_column(default=0)
    # 创建时间：插入时自动填入
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    # 更新时间：可空，onupdate=datetime.now 表示 UPDATE 时自动刷新
    # 注意传函数本身，不是调用结果
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        default=None, onupdate=datetime.now
    )

    # 外键：指向 authors 表的 id，建立数据库层面的关联
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # ORM 关系：访问 post.author 直接拿到 User 对象（不用手动 JOIN）
    author: Mapped["User"] = relationship(back_populates="posts")

    # 一对多：一篇文章有多条评论
    # cascade="all, delete-orphan"：删文章时连带删评论
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )

    # 多对多：一篇文章有多个标签，一个标签下有多篇文章
    # secondary=post_tags：指定中间关联表
    # SQLAlchemy 会自动维护中间表，不用手动操作
    tags: Mapped[List["Tag"]] = relationship(
        secondary=post_tags, back_populates="posts"
    )

# 6. Comment 模型（评论表，同时关联文章和用户）
# 定义类 Comment，继承 Base
class Comment(Base):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 评论内容：用 Text，不限长度
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # 外键：评论所属的文章（多的一方持有外键）
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    # ORM 关系：访问 comment.post 拿到所属文章
    post: Mapped["Post"] = relationship(back_populates="comments")

    # 外键：评论的作者（评论也属于某个用户）
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # ORM 关系：访问 comment.author 拿到评论者
    author: Mapped["User"] = relationship(back_populates="comments")

# 7. Tag 模型（标签表，与 Post 多对多）
# 定义类 Tag，继承 Base
class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 标签名：限长 50，唯一索引（标签不能重名）
    name: Mapped[str] = mapped_column(String(50), unique=True)

    # 反向关系：从标签查所有文章
    # secondary=post_tags：复用同一个中间表
    posts: Mapped[List["Post"]] = relationship(
        secondary=post_tags, back_populates="tags"
    )
\`\`\`

这个模型覆盖了所有关系类型：一对多（User→Post、Post→Comment）、一对一（User↔Profile）、多对多（Post↔Tag）。\`cascade="all, delete-orphan"\` 表示删用户时连带删他的文章和评论，避免孤儿数据。

## 十四、常见错误与避坑指南

**错误 1：Mapped 类型写错导致可空字段报错**

\`\`\`python filename="错误示例：可空字段没加 Optional"
# ❌ 错误：Mapped[str] 默认 NOT NULL，但没给 default
# 定义类 Bad，继承 Base
class Bad(Base):
    __tablename__ = "bad"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 这行会在插入时报错：NOT NULL constraint failed
    nickname: Mapped[str] = mapped_column()

# ✅ 正确：可空字段必须用 Optional
# 定义类 Good，继承 Base
class Good(Base):
    __tablename__ = "good"
    id: Mapped[int] = mapped_column(primary_key=True)
    # Optional[str] 允许 NULL
    nickname: Mapped[Optional[str]] = mapped_column(default=None)
\`\`\`

**错误 2：relationship 前向引用没用字符串**

\`\`\`python filename="错误示例：前向引用"
# ❌ 错误：Post 还没定义就引用
# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 直接用 Post 类会 NameError
    posts: Mapped[List[Post]] = relationship(back_populates="author")

# ✅ 正确：用字符串 "Post" 延迟解析
# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字符串形式，SQLAlchemy 在 mapper 配置时才解析
    posts: Mapped[List["Post"]] = relationship(back_populates="author")
\`\`\`

**错误 3：default 传了函数调用结果**

\`\`\`python filename="错误示例：default 加了括号"
# ❌ 错误：datetime.now() 在类定义时执行一次，所有行时间一样
# created_at: Mapped[datetime] = mapped_column(default=datetime.now())

# ✅ 正确：传函数本身，每次插入才调用
# created_at: Mapped[datetime] = mapped_column(default=datetime.now)
\`\`\`

**错误 4：多对多忘了关联表**

\`\`\`python filename="错误示例：多对多漏写 secondary"
# ❌ 错误：没有 secondary，SQLAlchemy 不知道怎么关联
# tags: Mapped[List["Tag"]] = relationship(back_populates="posts")

# ✅ 正确：必须指定 secondary=关联表
# tags: Mapped[List["Tag"]] = relationship(secondary=post_tags, back_populates="posts")
\`\`\`

## 十五、生活类比：把 ORM 想象成翻译官

理解 ORM 最好的方式是把它比作一个**翻译官**。

想象你是一个只会说中文的商人（Python 代码），要去和只会说英语的仓库管理员（数据库）做生意。你不可能自己去学英语，于是雇了一个翻译官（ORM）：

\`\`\`txt filename="ORM 翻译官类比"
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  你（Python）│ ──中文──→ │  翻译官(ORM) │ ──英文──→ │  仓库(数据库) │
│  user.name  │         │  生成 SQL    │         │  users 表    │
│  = "小明"   │ ←─────── │  翻译结果    │ ←─────── │  存储/查询   │
└─────────────┘         └─────────────┘         └─────────────┘
\`\`\`

- **你（Python 代码）**：只关心业务，比如"创建一个叫小明的用户"。
- **翻译官（ORM）**：把 \`User(name="小明")\` 翻译成 \`INSERT INTO users (name) VALUES ('小明')\`，还会自动加引号、转义特殊字符（防 SQL 注入）。
- **仓库（数据库）**：只懂 SQL，收到 SQL 后执行存储。

**为什么翻译官比你自己说英语强**：

1. **不会说错话**：翻译官语法严格，不会拼错 SQL（防注入）。
2. **多语言能力**：换一个仓库（MySQL → PostgreSQL），翻译官自动切换方言，你不用说英语还是德语。
3. **翻译备忘录**：翻译官会记住"你说过这些话"（Session 状态），下次你说"刚才那个用户"，他知道指谁。

**反过来，翻译官也有局限**：

- 复杂的修辞（多表聚合、窗口函数）让翻译官转述可能啰嗦，这时你直接写英文（\`text()\` 原生 SQL）更高效。
- 翻译官要收小费（性能开销），简单场景相比直说 SQL 略慢。

> **怎么想**：ORM 不是"代替 SQL"，而是"让 80% 常见操作不用写 SQL"。剩下 20% 复杂查询，下沉到 Core 层用 \`text()\` 写原生 SQL。

## 十六、渐进式 Demo：从零跑通第一个模型

光看理论记不住，下面三个 Demo 难度递增，建议你打开终端跟着敲。

### Demo 1：用 SQLite 内存库跑通第一个模型（5 分钟）

\`\`\`python filename="demo1_first_model.py - 可独立运行"
# 这个 Demo 用 SQLite 内存数据库，无需安装任何数据库服务
# 直接 python demo1_first_model.py 就能跑

# 1. 导入必要的构件
# 从 datetime 导入 datetime（用于时间字段）
from datetime import datetime
# 从 typing 导入 Optional（可空字段）
from typing import Optional
# 从 sqlalchemy 导入 String（字符串列类型）
from sqlalchemy import String, create_engine, select
# 从 sqlalchemy.orm 导入声明式构件和 Session
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, Session,
)

# 2. 定义 Base：所有模型的根基
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # pass 表示不额外配置，Base 会自动维护一个 metadata
    pass

# 3. 定义 User 模型：对应 users 表
# 定义类 User，继承 Base
class User(Base):
    # __tablename__ 显式指定数据库里的表名
    __tablename__ = "users"
    # 主键 id：自增整数
    id: Mapped[int] = mapped_column(primary_key=True)
    # 用户名：限长 50 字符，必填
    name: Mapped[str] = mapped_column(String(50))
    # 邮箱：限长 120，唯一索引
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 个人简介：可空
    bio: Mapped[Optional[str]] = mapped_column(default=None)
    # 创建时间：插入时自动填入（传函数本身，不带括号）
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # __repr__ 方便调试时打印
    def __repr__(self):
        return f"<User id={self.id} name={self.name} email={self.email}>"

# 4. 创建引擎：用 SQLite 内存库（进程结束就没了，适合 demo）
# 定义变量 engine，赋值为 create_engine("sqlite:///:memory:", echo=True)
# echo=True 会打印所有 SQL，方便看 ORM 翻译成了什么
engine = create_engine("sqlite:///:memory:", echo=True)

# 5. 建表：根据 Base.metadata 创建所有表
# Base.metadata.create_all(engine) 会执行 CREATE TABLE
Base.metadata.create_all(engine)

# 6. 用 Session 操作数据库
# with Session(engine) as session：会话上下文，退出时自动关闭
with Session(engine) as session:
    # 创建用户对象（此时还在 Python 内存里，没进数据库）
    # 定义变量 alice，赋值为 User(name="Alice", email="alice@test.com", bio="Hello")
    alice = User(name="Alice", email="alice@test.com", bio="Hello")
    # 定义变量 bob，赋值为 User(name="Bob", email="bob@test.com")
    bob = User(name="Bob", email="bob@test.com")

    # add_all 批量加入会话（pending 状态）
    session.add_all([alice, bob])

    # commit 真正写入数据库（此时发 INSERT SQL）
    session.commit()

    # commit 后 alice 和 bob 的 id 有值了（数据库自增生成）
    # 因为 expire_on_commit 默认 True，访问属性会重新 SELECT
    print(f"alice.id = {alice.id}")  # 输出: alice.id = 1
    print(f"bob.id = {bob.id}")      # 输出: bob.id = 2

# 7. 查询：新开一个会话查
with Session(engine) as session:
    # select(User) 等价于 SELECT * FROM users
    # 定义变量 stmt，赋值为 select(User)
    stmt = select(User).where(User.name == "Alice")
    # execute 执行，scalar_one_or_none 取单条（没有返回 None，多条报错）
    # 定义变量 user，赋值为 session.execute(stmt).scalar_one_or_none()
    user = session.execute(stmt).scalar_one_or_none()
    print(f"查到: {user}")  # 输出: 查到: <User id=1 name=Alice email=alice@test.com>
\`\`\`

运行后你会看到控制台打印的 SQL 语句，这就是 ORM "翻译官"帮你生成的：

\`\`\`txt filename="预期 SQL 输出"
INSERT INTO users (name, email, bio, created_at) VALUES (?, ?, ?, ?)
('Alice', 'alice@test.com', 'Hello', '2024-01-01 12:00:00.000000')
INSERT INTO users (name, email, bio, created_at) VALUES (?, ?, ?, ?)
('Bob', 'bob@test.com', None, '2024-01-01 12:00:00.000000')
SELECT users.id, users.name, users.email, users.bio, users.created_at
FROM users
WHERE users.name = ?
('Alice',)
\`\`\`

### Demo 2：一对多关系实战（User → Post）

\`\`\`python filename="demo2_relationship.py - 关系演示"
# 演示一对多关系：一个用户有多篇文章
# python demo2_relationship.py 直接可跑

# 导入构件
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, create_engine, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship, Session,
)

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base（一的一方）
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    # relationship 声明"一个 user 有多个 post"
    # back_populates 让两端互相引用，双向同步
    # cascade="all, delete-orphan"：删 user 时连带删 post
    posts: Mapped[List["Post"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.name}>"

# 定义类 Post，继承 Base（多的一方）
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    # 外键：指向 users.id（多的一方持有外键）
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # relationship 声明"这篇 post 属于哪个 user"
    author: Mapped["User"] = relationship(back_populates="posts")

    def __repr__(self):
        return f"<Post {self.title}>"

# 创建引擎和表
# 定义变量 engine，赋值为 create_engine("sqlite:///:memory:", echo=False)
engine = create_engine("sqlite:///:memory:", echo=False)
Base.metadata.create_all(engine)

# 用会话操作
with Session(engine) as session:
    # 创建用户
    # 定义变量 user，赋值为 User(name="小明")
    user = User(name="小明")
    # 创建文章（不用手动填 author_id，relationship 会自动维护）
    # 定义变量 p1，赋值为 Post(title="第一篇", body="内容1")
    p1 = Post(title="第一篇", body="内容1")
    # 定义变量 p2，赋值为 Post(title="第二篇", body="内容2")
    p2 = Post(title="第二篇", body="内容2")

    # ★ 关键：通过 relationship 关联，author_id 会自动填好
    # 这就是 ORM 的便利：不用手动算外键值
    user.posts.append(p1)
    user.posts.append(p2)

    # 只 add user，关联的 post 会被级联 add（cascade="save-update"）
    session.add(user)
    session.commit()

    # 反向访问：从 user 拿 posts（懒加载，访问时才查）
    print(f"{user.name} 的文章: {user.posts}")
    # 输出: 小明 的文章: [<Post 第一篇>, <Post 第二篇>]

    # 反向访问：从 post 拿 author
    print(f"{p1.title} 的作者: {p1.author.name}")
    # 输出: 第一篇 的作者: 小明

    # ★ 验证外键自动填好了
    print(f"p1.author_id = {p1.author_id}")  # 输出: p1.author_id = 1
\`\`\`

### Demo 3：模型继承的完整示例

\`\`\`python filename="demo3_inheritance.py - 单表继承演示"
# 演示单表继承：Employee → Manager / Engineer
# 所有子类共用一张 employees 表，用 type 列区分子类类型

from sqlalchemy import String, Integer, create_engine, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, Session,
    polymorphic_on, polymorphic_identity,
)

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 父类 Employee：对应 employees 表
# 定义类 Employee，继承 Base
class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    # polymorphic_on：指定用 type 列区分子类
    type: Mapped[str] = mapped_column(String(20))

    # __mapper_args__ 配置多态映射
    __mapper_args__ = {
        "polymorphic_on": type,            # 用 type 列区分
        "polymorphic_identity": "employee", # 本类对应 type="employee"
    }

# 子类 Manager：共用 employees 表
# 定义类 Manager，继承 Employee
class Manager(Employee):
    # manager_salary 是 Manager 独有的列（Engineer 行里这列是 NULL）
    manager_salary: Mapped[int] = mapped_column(Integer, default=0)
    __mapper_args__ = {"polymorphic_identity": "manager"}

# 子类 Engineer：共用 employees 表
# 定义类 Engineer，继承 Employee
class Engineer(Employee):
    # engineer_salary 是 Engineer 独有的列
    engineer_salary: Mapped[int] = mapped_column(Integer, default=0)
    __mapper_args__ = {"polymorphic_identity": "engineer"}

# 创建引擎和表
engine = create_engine("sqlite:///:memory:", echo=False)
Base.metadata.create_all(engine)

with Session(engine) as session:
    # 添加不同子类的对象
    # 定义变量 mgr，赋值为 Manager(name="张总", manager_salary=50000)
    mgr = Manager(name="张总", manager_salary=50000)
    # 定义变量 eng，赋值为 Engineer(name="李工", engineer_salary=30000)
    eng = Engineer(name="李工", engineer_salary=30000)
    # 定义变量 emp，赋值为 Employee(name="王员")
    emp = Employee(name="王员")

    session.add_all([mgr, eng, emp])
    session.commit()

    # ★ 查询父类会自动还原成子类
    # select(Employee) 查所有员工，根据 type 列自动实例化成对应子类
    # 定义变量 employees，赋值为 session.execute(select(Employee)).scalars().all()
    employees = session.execute(select(Employee)).scalars().all()
    for e in employees:
        # isinstance 判断对象的实际类型
        # 这里能看到 ORM 自动把行还原成了 Manager / Engineer / Employee
        print(f"{type(e).__name__}: {e.name}")
        # 输出:
        # Manager: 张总
        # Engineer: 李工
        # Employee: 王员

    # ★ 只查某个子类
    # select(Manager) 会自动加 WHERE type = 'manager'
    managers = session.execute(select(Manager)).scalars().all()
    print(f"经理数量: {len(managers)}")  # 输出: 经理数量: 1
    print(f"经理薪资: {managers[0].manager_salary}")  # 输出: 经理薪资: 50000
\`\`\`

## 十七、动手实验：巩固理解

学完概念后，动手做几个小实验加深理解。每个实验预计 10-20 分钟。

### 实验 1：给博客模型加"收藏"功能

**任务**：在博客模型基础上，实现"用户收藏文章"功能。

**提示**：
- 一个用户可以收藏多篇文章，一篇文章可以被多个用户收藏 → 多对多关系。
- 需要一张收藏关联表（类似 post_tags）。

\`\`\`python filename="实验1参考答案.py"
# 在博客模型基础上增加收藏功能
from datetime import datetime
from typing import List
from sqlalchemy import String, Text, Integer, ForeignKey, Table, create_engine
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship, Session,
)

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 收藏关联表：user_favorites
# 类似 post_tags，只有两个外键列
user_favorites = Table(
    "user_favorites",
    Base.metadata,
    # user_id 外键指向 users.id
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    # post_id 外键指向 posts.id
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
)
# 注意：实际代码要在文件顶部 from sqlalchemy import Column

# User 模型增加 favorites 关系
# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

    # 多对多：用户收藏的文章
    # secondary=user_favorites 指定关联表
    favorites: Mapped[List["Post"]] = relationship(
        secondary=user_favorites, back_populates="favorited_by"
    )

# Post 模型增加 favorited_by 关系
# 定义类 Post，继承 Base
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))

    # 反向关系：收藏了这篇文章的用户列表
    favorited_by: Mapped[List["User"]] = relationship(
        secondary=user_favorites, back_populates="favorites"
    )

# 测试代码
engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # 创建用户和文章
    user = User(name="小明")
    post1 = Post(title="好文章1")
    post2 = Post(title="好文章2")

    # 用户收藏两篇文章
    user.favorites.append(post1)
    user.favorites.append(post2)

    session.add(user)
    session.commit()

    # 验证：从用户查收藏列表
    print(f"{user.name} 收藏了: {[p.title for p in user.favorites]}")
    # 输出: 小明 收藏了: ['好文章1', '好文章2']

    # 验证：从文章查被谁收藏了
    print(f"{post1.title} 被 {[u.name for u in post1.favorited_by]} 收藏")
    # 输出: 好文章1 被 ['小明'] 收藏
\`\`\`

### 实验 2：用 JSON 字段存商品属性

**任务**：设计一个 Product 模型，用 JSON 字段存储商品的规格属性（颜色、尺码等）。

**提示**：
- 用 \`from sqlalchemy import JSON\`。
- \`attrs: Mapped[dict] = mapped_column(JSON, default=dict)\`。

\`\`\`python filename="实验2参考答案.py"
from sqlalchemy import String, JSON, Numeric, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from decimal import Decimal

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Product，继承 Base
class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    # 价格用 Numeric 精确存储（金额绝不用 float）
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    # JSON 字段存规格属性
    attrs: Mapped[dict] = mapped_column(JSON, default=dict)

    def __repr__(self):
        return f"<Product {self.name} ¥{self.price}>"

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # 创建带属性的商品
    # 定义变量 p1，赋值为 Product(...)
    p1 = Product(
        name="T恤",
        price=Decimal("99.90"),
        attrs={"colors": ["红", "蓝", "黑"], "sizes": ["S", "M", "L"], "material": "棉"},
    )
    session.add(p1)
    session.commit()

    # 查询：JSON 字段可以直接当 dict 用
    p = session.get(Product, 1)
    print(f"商品: {p.name}")
    print(f"颜色: {p.attrs['colors']}")  # 输出: 颜色: ['红', '蓝', '黑']
    print(f"尺码: {p.attrs['sizes']}")   # 输出: 尺码: ['S', 'M', 'L']
\`\`\`

### 实验 3：对比 default vs server_default

**任务**：创建一个模型，同时用 \`default\` 和 \`server_default\`，观察两者的区别。

**思考题**：
1. 哪个在 Python 端计算？哪个在数据库端计算？
2. 多语言客户端（Python + Java）共用同一库时，用哪个更合适？

\`\`\`python filename="实验3参考答案.py"
from datetime import datetime
from sqlalchemy import String, create_engine, func, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Log，继承 Base
class Log(Base):
    __tablename__ = "logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    message: Mapped[str] = mapped_column(String(200))

    # default：Python 端计算，INSERT 时 SQLAlchemy 填好再发 SQL
    # 每次插入调用 datetime.now，时间在 Python 进程里算
    py_created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    # server_default：数据库端计算，DDL 里写 DEFAULT NOW()
    # INSERT 不带这列时，数据库自己填 NOW()
    db_created_at: Mapped[datetime] = mapped_column(server_default=func.now())

engine = create_engine("sqlite:///:memory:", echo=True)
Base.metadata.create_all(engine)

with Session(engine) as session:
    log = Log(message="测试日志")
    session.add(log)
    session.commit()
    session.refresh(log)

    print(f"Python 端时间: {log.py_created_at}")
    print(f"数据库端时间: {log.db_created_at}")
    # 两个时间几乎相同，但来源不同
    # py_created_at：Python 进程计算
    # db_created_at：数据库服务器计算

# 观察 echo=True 输出的 SQL：
# INSERT INTO logs (message, py_created_at) VALUES (?, ?)
# 注意：py_created_at 在 SQL 里带值（Python 算好的）
# db_created_at 不在 SQL 里（数据库自己填）
\`\`\`

## 十八、常见错误补充

**错误 5：String 不写长度**

\`\`\`python filename="错误：String 不写长度"
# ❌ 错误：某些数据库（如 MySQL）要求 VARCHAR 必须有长度
# name: Mapped[str] = mapped_column(String)  # MySQL 会报错

# ✅ 正确：写明长度
# name: Mapped[str] = mapped_column(String(50))
\`\`\`

**错误 6：relationship 没写 back_populates 导致单向不同步**

\`\`\`python filename="错误：单向关系不同步"
# ❌ 错误：没 back_populates，user.posts.append(post) 后 post.author 不一定有值
# posts: Mapped[List["Post"]] = relationship()  # 单向

# ✅ 正确：双向用 back_populates
# posts: Mapped[List["Post"]] = relationship(back_populates="author")
# author: Mapped["User"] = relationship(back_populates="posts")
\`\`\`

**错误 7：cascade 配错导致删用户时文章变孤儿**

\`\`\`python filename="错误：cascade 缺失"
# ❌ 错误：没配 delete-orphan，删用户后文章的 author_id 指向不存在的用户
# posts: Mapped[List["Post"]] = relationship(back_populates="author")

# ✅ 正确：加 cascade="all, delete-orphan"
# posts: Mapped[List["Post"]] = relationship(
#     back_populates="author", cascade="all, delete-orphan"
# )
\`\`\`

## 十九、本章小结

- SQLAlchemy 是 Python 最成熟的 ORM，2.0 版本用 \`Mapped\` + \`mapped_column\` 实现**类型驱动**的模型定义。
- \`DeclarativeBase\` 是所有模型的根基，维护 \`metadata\`（所有表的结构清单）。
- \`Mapped[T]\` 声明 Python 类型，\`mapped_column(...)\` 配置数据库列属性，两者职责分离。
- 关系三件套：一对多（\`ForeignKey\` + \`relationship\`）、多对多（\`Table\` 关联表 + \`secondary\`）、一对一（\`uselist=False\`）。
- 列类型要选对：金额用 \`Numeric\`、长文本用 \`Text\`、结构化数据用 \`JSON\`。
- \`default\` 是 Python 端默认值，\`server_default\` 是数据库端默认值，注意传函数本身而非调用结果。
- 博客系统模型把所有知识点串起来：User、Post、Comment、Tag 四张表覆盖三种关系。

下一章我们学习如何用 \`create_engine\` 连接数据库、用 \`sessionmaker\` 创建会话工厂、用 FastAPI 依赖注入管理 Session 生命周期。
`
  },

  // =========================================================
  // 第二章：数据库连接与 Session
  // =========================================================
  {
    id: "fa-db-session",
    group: "数据库集成",
    icon: "🔗",
    title: "数据库连接与 Session",
    content: `

# 数据库连接与 Session

## 一、开篇：从模型到真实数据库

上一章我们定义了模型（User、Post 等），但模型只是"图纸"，还没真正连上数据库。这一章解决三件事：**怎么连数据库**（create\_engine）、**怎么开一个会话**（Session）、**怎么把会话注入到 FastAPI 路由**（依赖注入）。

会话（Session）是 SQLAlchemy 操作数据库的入口。你所有的增删改查都通过 Session 发起。理解 Session 的生命周期是这一章的核心——创建、使用、关闭的时机直接决定内存安全和并发性能。

## 二、create_engine：连接数据库的引擎

\`create_engine\` 是同步引擎的工厂函数，它创建一个 \`Engine\` 对象，负责管理数据库连接池和执行 SQL。

\`\`\`python filename="database.py - 创建引擎"
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入 sessionmaker
from sqlalchemy.orm import sessionmaker

# 1. SQLite 连接字符串：sqlite:///路径
# 三斜杠是相对路径，四斜杠是绝对路径
# check_same_thread=False：允许多线程访问（FastAPI 多线程必需）
# 定义变量 DATABASE_URL，赋值为 "sqlite:///./app.db"
DATABASE_URL = "sqlite:///./app.db"

# 2. 创建引擎
# connect_args 只对 SQLite 有效：关闭线程检查
# echo=True 会打印所有 SQL，开发期调试用，生产关掉
# 定义变量 engine，赋值为 create_engine(...)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

# 3. 创建会话工厂
# sessionmaker 是个类工厂，调用它生成 Session 类
# autocommit=False：不开自动提交（推荐手动 commit）
# autoflush=False：不开自动刷新（推荐手动 flush）
# bind=engine：绑定到上面创建的引擎
# 定义变量 SessionLocal，赋值为 sessionmaker(...)
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)
\`\`\`

**怎么想**：为什么要分 \`engine\` 和 \`SessionLocal\` 两层？

- \`engine\` 是"连接池管理者"，进程级别共享一个，负责底层连接复用。
- \`SessionLocal\` 是"会话工厂"，每次调用 \`SessionLocal()\` 生成一个独立会话，会话从 engine 借连接。

类比：engine 是数据库连接池（共享资源），Session 是一次"数据库对话"（请求级别，用完归还）。

## 三、连接字符串详解：SQLite / MySQL / PostgreSQL

不同数据库的连接字符串（URL）格式不同：

| 数据库 | 连接字符串示例 | 驱动 |
|--------|---------------|------|
| SQLite（文件） | \`sqlite:///./app.db\` | 内置 |
| SQLite（内存） | \`sqlite:///:memory:\` | 内置 |
| MySQL | \`mysql+pymysql://user:pass@localhost:3306/dbname\` | pymysql |
| PostgreSQL | \`postgresql+psycopg2://user:pass@localhost:5432/dbname\` | psycopg2 |
| PostgreSQL（async） | \`postgresql+asyncpg://user:pass@localhost:5432/dbname\` | asyncpg |

格式统一是 \`数据库类型+驱动://用户名:密码@主机:端口/库名\`。

\`\`\`python filename="不同数据库连接字符串演示"
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# 1. SQLite 文件数据库（开发最常用）
# 三斜杠表示相对当前目录
# 定义变量 sqlite_url，赋值为 "sqlite:///./app.db"
sqlite_url = "sqlite:///./app.db"
# 创建 SQLite 引擎
sqlite_engine = create_engine(
    sqlite_url,
    connect_args={"check_same_thread": False},
)

# 2. SQLite 内存数据库（测试用，进程结束就没了）
# 定义变量 memory_url，赋值为 "sqlite:///:memory:"
memory_url = "sqlite:///:memory:"
# 创建内存引擎
memory_engine = create_engine(memory_url)

# 3. MySQL（需要 pip install pymysql）
# 格式：mysql+pymysql://用户:密码@主机:端口/库名
# 定义变量 mysql_url，赋值为 "mysql+pymysql://root:123456@localhost:3306/blog"
mysql_url = "mysql+pymysql://root:123456@localhost:3306/blog"
# 创建 MySQL 引擎
# pool_recycle=3600：连接回收周期，MySQL 默认 8 小时空闲断开，这里 1 小时回收
mysql_engine = create_engine(mysql_url, pool_recycle=3600)

# 4. PostgreSQL（需要 pip install psycopg2-binary）
# 格式：postgresql+psycopg2://用户:密码@主机:端口/库名
# 定义变量 pg_url，赋值为 "postgresql+psycopg2://postgres:123456@localhost:5432/blog"
pg_url = "postgresql+psycopg2://postgres:123456@localhost:5432/blog"
# 创建 PostgreSQL 引擎
pg_engine = create_engine(pg_url, pool_size=10, max_overflow=20)
\`\`\`

> **避坑**：MySQL 默认 \`wait_timeout=28800\`（8 小时），连接闲置超过这个时间会被服务端断开。如果连接池里的连接是"断的"，下次用就报错。解决：\`pool_recycle=3600\`（1 小时回收，比 wait_timeout 短）。

## 四、SessionLocal 会话工厂详解

\`sessionmaker\` 生成的 \`SessionLocal\` 是一个"会话工厂"，调用它得到真正的 \`Session\` 实例。

\`\`\`python filename="SessionLocal 详解"
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入 sessionmaker, Session
from sqlalchemy.orm import sessionmaker, Session

# 创建引擎
# 定义变量 engine，赋值为 create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})
engine = create_engine(
    "sqlite:///./app.db",
    connect_args={"check_same_thread": False},
)

# 创建会话工厂
# 定义变量 SessionLocal，赋值为 sessionmaker(...)
SessionLocal = sessionmaker(
    bind=engine,        # 绑定引擎
    autocommit=False,   # 不自动提交：所有写操作都要手动 session.commit()
    autoflush=False,    # 不自动刷新：不把 pending 对象推到数据库
    expire_on_commit=True,  # 提交后过期：commit 后访问对象会重新查询（保证数据新鲜）
)

# 使用：每次需要操作数据库时，创建一个 Session
# 定义变量 db，赋值为 SessionLocal()
db = SessionLocal()
try:
    # 在这里执行 CRUD 操作
    # 例如：db.add(user); db.commit()
    pass
finally:
    # 用完必须关闭，归还连接给连接池
    # 定义变量 db，赋值为 SessionLocal()
    db.close()
\`\`\`

**autoflush 详解**：\`autoflush=True\` 时，每次查询前自动把 pending 的 INSERT/UPDATE 推到数据库。方便但容易踩坑——查询触发了未预期的写入。\`autoflush=False\` 更安全，显式 \`commit()\` 或 \`flush()\` 才写入。生产推荐 False。

**expire\_on\_commit 详解**：\`True\`（默认）时 \`commit()\` 后所有对象标记过期，下次访问属性会重新 SELECT。保证数据新鲜，但多一次查询。\`False\` 不会重新查，但可能拿到旧值。Web 场景一般 commit 后就返回响应了，建议保持默认。

## 五、数据库依赖注入：yield session

FastAPI 的依赖注入支持 \`yield\`，天然适合管理 Session 生命周期：请求开始创建 Session，请求结束关闭。

\`\`\`python filename="deps.py - 数据库依赖"
# 从 typing 导入 Generator（生成器类型）
from typing import Generator
# 从 fastapi 导入 Depends（依赖注入装饰器）
from fastapi import Depends
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 假设 SessionLocal 已在上面定义
# from database import SessionLocal

# 定义函数 get_db，返回 Generator[Session, None, None]
def get_db() -> Generator[Session, None, None]:
    """每个请求创建一个独立 Session，请求结束自动关闭。"""
    # 创建一个 Session 实例
    # 定义变量 db，赋值为 SessionLocal()
    db = SessionLocal()
    try:
        # yield 之前：请求开始时执行（相当于 setup）
        # 把 db 交给路由函数使用
        yield db
    finally:
        # yield 之后：请求结束时执行（相当于 teardown）
        # 无论路由是否抛异常，都会关闭 Session，归还连接
        db.close()

# 在路由里使用：
# @app.get("/users/")
# 定义函数 list_users，参数: db: Session = Depends(get_db)
def list_users(db: Session = Depends(get_db)):
    # db 是注入的 Session，用完自动关闭
    # 定义变量 users，赋值为 db.query(User).all()
    users = db.execute(select(User)).scalars().all()
    # 返回 users
    return users
\`\`\`

**为什么用 yield 而不是 return**：

\`return\` 无法做清理。用 \`yield\` 把 Session 交给路由，路由处理完后 FastAPI 会回到 \`finally\` 块关闭 Session。即使路由抛异常，\`finally\` 也执行，保证连接不泄漏。

**怎么想**：每个请求一个 Session，请求结束关闭。这是最安全的模型——Session 不是线程安全的，多请求共享一个 Session 会乱套。每次请求独立 Session，互不干扰，关闭时归还连接。

## 六、完整 FastAPI 集成示例

\`\`\`python filename="main.py - 完整集成"
# 从 fastapi 导入 FastAPI, Depends
from fastapi import FastAPI, Depends
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 sqlalchemy 导入 create_engine, select
from sqlalchemy import create_engine, select, String
# 从 sqlalchemy.orm 导入 sessionmaker, Session, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.orm import (
    sessionmaker, Session, DeclarativeBase, Mapped, mapped_column,
)

# 1. 引擎与会话工厂
# 定义变量 DATABASE_URL，赋值为 "sqlite:///./app.db"
DATABASE_URL = "sqlite:///./app.db"
# 创建引擎
# 定义变量 engine，赋值为 create_engine(...)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
# 创建会话工厂
# 定义变量 SessionLocal，赋值为 sessionmaker(...)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# 2. 模型
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

# 3. 依赖：获取 Session
# 定义函数 get_db，返回 Generator[Session, None, None]
def get_db():
    # 创建 Session
    db = SessionLocal()
    try:
        # 注入给路由
        yield db
    finally:
        # 关闭
        db.close()

# 4. Pydantic 响应模型
# 定义类 UserOut，继承 BaseModel
class UserOut(BaseModel):
    id: int
    name: str
    # 让 Pydantic 能读 ORM 对象
    # 定义类 Config，继承
    class Config:
        from_attributes = True

# 5. FastAPI 应用
# 创建 FastAPI 应用实例
app = FastAPI()

# 启动时建表（生产用 Alembic，这里图方便）
# 定义函数 startup
@app.on_event("startup")
def startup():
    # Base.metadata.create_all 自动建表（已存在则跳过）
    Base.metadata.create_all(engine)

# 创建用户
# 装饰器：app.post，路径 "/users/"
@app.post("/users/", response_model=UserOut)
# 定义函数 create_user，参数: name: str, db: Session = Depends(get_db)
def create_user(name: str, db: Session = Depends(get_db)):
    # 创建 User 对象
    # 定义变量 user，赋值为 User(name=name)
    user = User(name=name)
    # 添加到会话
    db.add(user)
    # 提交到数据库
    db.commit()
    # 刷新：从数据库取回 id（自增主键）
    db.refresh(user)
    # 返回 user
    return user

# 查询所有用户
# 装饰器：app.get，路径 "/users/"
@app.get("/users/", response_model=list[UserOut])
# 定义函数 list_users，参数: db: Session = Depends(get_db)
def list_users(db: Session = Depends(get_db)):
    # 用 select() 构造查询（2.0 风格）
    # 定义变量 stmt，赋值为 select(User)
    stmt = select(User)
    # 执行并取出所有行
    # scalars() 把 Row 转成 User 对象
    # 定义变量 users，赋值为 db.execute(stmt).scalars().all()
    users = db.execute(stmt).scalars().all()
    # 返回 users
    return users
\`\`\`

## 七、连接池配置：pool\_size、max\_overflow、pool\_recycle

\`create_engine\` 默认用 \`QueuePool\` 连接池，复用连接避免反复建连。关键参数：

\`\`\`python filename="连接池配置详解"
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# PostgreSQL/MySQL 连接池配置示例
# 定义变量 engine，赋值为 create_engine(...)
engine = create_engine(
    "postgresql+psycopg2://user:pass@localhost:5432/blog",
    # 连接池大小：常驻连接数
    pool_size=10,
    # 溢出：超过 pool_size 后还能临时开多少连接
    max_overflow=20,
    # 连接回收周期（秒）：超过这个时间的连接会被丢弃重建
    # 避免 MySQL wait_timeout 导致的"断连"问题
    pool_recycle=3600,
    # 连接超时（秒）：从池里拿连接等多久，超时抛异常
    pool_timeout=30,
    # 连接前 ping 一下，确保连接可用（2.0 新增，推荐开启）
    pool_pre_ping=True,
)

# 参数解释：
# pool_size=10：默认保持 10 个连接，复用它们
# max_overflow=20：高峰期可临时扩到 10+20=30 个连接
# pool_recycle=3600：每 1 小时回收一个连接，防止"陈旧连接"
# pool_pre_ping=True：用连接前先发 ping，失败就丢弃重建
\`\`\`

**各参数怎么选**：

- \`pool_size\`：根据数据库最大连接数和应用并发估算。\`pool_size × 实例数 ≤ 数据库 max_connections\`。比如数据库 100 连接，4 个应用实例，每个 \`pool_size=20\`。
- \`max_overflow\`：高峰缓冲，别设太大（可能压垮数据库）。
- \`pool_recycle\`：必须小于数据库的 \`wait_timeout\`（MySQL 默认 28800 秒）。
- \`pool_pre_ping=True\`：生产强烈推荐，避免"拿到一个死连接"。

> **避坑**：SQLite 不支持 \`pool_size\`（SQLite 是文件锁，没有连接池概念）。配了会报错。SQLite 用默认配置即可。

## 八、环境变量管理数据库配置

硬编码数据库密码到代码里是安全问题。生产环境用环境变量管理。

\`\`\`python filename="config.py - 环境变量配置"
# 导入 os 模块
import os
# 从 typing 导入 Optional
from typing import Optional
# 尝试导入 dotenv（pip install python-dotenv）
try:
    from dotenv import load_dotenv
    # 从 .env 文件加载环境变量
    load_dotenv()
except ImportError:
    # 没装 dotenv 也能跑，只是不从 .env 读
    pass

# 数据库配置：优先读环境变量，给默认值
# os.getenv("变量名", 默认值)
# 定义变量 DB_HOST，赋值为 os.getenv("DB_HOST", "localhost")
DB_HOST = os.getenv("DB_HOST", "localhost")
# 定义变量 DB_PORT，赋值为 os.getenv("DB_PORT", "5432")
DB_PORT = os.getenv("DB_PORT", "5432")
# 定义变量 DB_USER，赋值为 os.getenv("DB_USER", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
# 定义变量 DB_PASS，赋值为 os.getenv("DB_PASS", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
# 定义变量 DB_NAME，赋值为 os.getenv("DB_NAME", "blog")
DB_NAME = os.getenv("DB_NAME", "blog")

# 拼接连接字符串
# 定义变量 DATABASE_URL，赋值为 f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# 测试环境用 SQLite
# 定义变量 TEST_DATABASE_URL，赋值为 os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
\`\`\`

配套的 \`.env\` 文件（不要提交到 git）：

\`\`\`bash filename=".env 文件"
# 数据库配置
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASS=你的密码
# DB_NAME=blog
\`\`\`

\`\`\`bash filename=".gitignore 必须包含 .env"
# 防止密码泄露到 git
# .env
\`\`\`

## 九、同步引擎 vs 异步引擎

FastAPI 支持 async 路由，但 SQLAlchemy 同步引擎会阻塞事件循环。需要异步时用 \`create_async_engine\` + \`AsyncSession\`。

\`\`\`python filename="异步引擎配置"
# 从 sqlalchemy.ext.asyncio 导入异步组件
from sqlalchemy.ext.asyncio import (
    create_async_engine,       # 异步引擎工厂
    AsyncSession,              # 异步会话
    async_sessionmaker,        # 异步会话工厂
)
# 从 sqlalchemy.orm 导入 DeclarativeBase
from sqlalchemy.orm import DeclarativeBase

# 异步驱动连接字符串（注意驱动名不同）：
# PostgreSQL: postgresql+asyncpg://...
# MySQL: mysql+aiomysql://...
# SQLite: sqlite+aiosqlite://...
# 定义变量 ASYNC_DB_URL，赋值为 "postgresql+asyncpg://postgres:pass@localhost:5432/blog"
ASYNC_DB_URL = "postgresql+asyncpg://postgres:pass@localhost:5432/blog"

# 创建异步引擎
# 定义变量 async_engine，赋值为 create_async_engine(...)
# 异步引擎和同步引擎的参数基本一致，但底层用异步驱动
async_engine = create_async_engine(
    ASYNC_DB_URL,
    echo=False,           # 是否打印 SQL（开发期可开 True 调试）
    pool_size=10,         # 连接池常驻连接数
    max_overflow=20,      # 高峰期可临时扩到 pool_size + max_overflow 个连接
    pool_recycle=3600,    # 连接回收周期（秒），避免数据库端断开
)

# 创建异步会话工厂
# 定义变量 AsyncSessionLocal，赋值为 async_sessionmaker(...)
# async_sessionmaker 是 sessionmaker 的异步版本
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,    # 绑定异步引擎
    class_=AsyncSession,  # 指定会话类为 AsyncSession（不是同步的 Session）
    autocommit=False,     # 不自动提交，手动 await session.commit()
    autoflush=False,      # 不自动刷新，避免查询触发未预期的写入
    expire_on_commit=False,  # 异步场景推荐 False，避免访问属性触发隐式查询
    # 为什么异步场景要设 False？
    # 因为 expire_on_commit=True 时，commit 后访问属性会触发 SELECT
    # 但异步场景下这个 SELECT 是隐式的，会报错（必须在 async with 里显式 await）
)

# 异步依赖：yield async session
# 定义函数 get_async_db
# 注意是 async def，不是 def（异步依赖必须用 async def）
async def get_async_db():
    # 创建异步会话
    # 定义变量 db，赋值为 AsyncSessionLocal()
    db = AsyncSessionLocal()
    try:
        # 注入给路由
        yield db
    finally:
        # 异步关闭：必须 await，因为是异步操作
        await db.close()
\`\`\`

**同步 vs 异步怎么选**：

| 维度 | 同步引擎 | 异步引擎 |
|------|---------|---------|
| 路由 | \`def\` | \`async def\` |
| 驱动 | psycopg2、pymysql | asyncpg、aiomysql |
| 阻塞 | 阻塞事件循环（FastAPI 会丢到线程池） | 不阻塞 |
| 性能 | I/O 密集场景弱 | I/O 密集场景强 |
| 复杂度 | 简单 | 复杂（await、async 全链路） |

> **建议**：除非你确定有大量 I/O 等待（比如同时查多个外部服务），否则用同步引擎就够。FastAPI 对 \`def\` 路由会自动丢到线程池，不会卡住事件循环。不要为了 async 而 async。

## 十、实战：多数据库配置

有时一个应用要连多个数据库（比如主库写、从库读，或业务库 + 日志库）。

\`\`\`python filename="multi_db.py - 多数据库配置"
# 导入 os
import os
# 从 typing 导入 Generator
from typing import Generator
# 从 fastapi 导入 FastAPI, Depends
from fastapi import FastAPI, Depends
# 从 sqlalchemy 导入 create_engine, select
from sqlalchemy import create_engine, select, String
# 从 sqlalchemy.orm 导入 sessionmaker, Session, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.orm import (
    sessionmaker, Session, DeclarativeBase, Mapped, mapped_column,
)

# 1. 主库（读写）
# 定义变量 PRIMARY_URL，赋值为 "postgresql+psycopg2://user:pass@primary:5432/blog"
PRIMARY_URL = "postgresql+psycopg2://user:pass@primary:5432/blog"
# 创建主库引擎
# 定义变量 primary_engine，赋值为 create_engine(PRIMARY_URL, pool_size=10)
primary_engine = create_engine(PRIMARY_URL, pool_size=10)
# 创建主库会话工厂
# 定义变量 PrimarySessionLocal，赋值为 sessionmaker(bind=primary_engine)
PrimarySessionLocal = sessionmaker(bind=primary_engine)

# 2. 从库（只读）
# 定义变量 REPLICA_URL，赋值为 "postgresql+psycopg2://user:pass@replica:5432/blog"
REPLICA_URL = "postgresql+psycopg2://user:pass@replica:5432/blog"
# 创建从库引擎
# 定义变量 replica_engine，赋值为 create_engine(REPLICA_URL, pool_size=10)
replica_engine = create_engine(REPLICA_URL, pool_size=10)
# 创建从库会话工厂
# 定义变量 ReplicaSessionLocal，赋值为 sessionmaker(bind=replica_engine)
ReplicaSessionLocal = sessionmaker(bind=replica_engine)

# 3. 日志库（独立）
# 定义变量 LOG_URL，赋值为 "postgresql+psycopg2://user:pass@log:5432/logs"
LOG_URL = "postgresql+psycopg2://user:pass@log:5432/logs"
# 创建日志库引擎
# 定义变量 log_engine，赋值为 create_engine(LOG_URL, pool_size=5)
log_engine = create_engine(LOG_URL, pool_size=5)
# 创建日志库会话工厂
# 定义变量 LogSessionLocal，赋值为 sessionmaker(bind=log_engine)
LogSessionLocal = sessionmaker(bind=log_engine)

# 4. 三个依赖函数
# 定义函数 get_primary_db，返回 Generator[Session, None, None]
def get_primary_db() -> Generator[Session, None, None]:
    """主库：用于写操作"""
    db = PrimarySessionLocal()
    try:
        yield db
    finally:
        db.close()

# 定义函数 get_replica_db，返回 Generator[Session, None, None]
def get_replica_db() -> Generator[Session, None, None]:
    """从库：用于读操作"""
    db = ReplicaSessionLocal()
    try:
        yield db
    finally:
        db.close()

# 定义函数 get_log_db，返回 Generator[Session, None, None]
def get_log_db() -> Generator[Session, None, None]:
    """日志库：记录访问日志"""
    db = LogSessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. 模型
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

# 6. 路由：读写分离
# 创建 FastAPI 应用实例
app = FastAPI()

# 写入用主库
# 装饰器：app.post，路径 "/users/"
@app.post("/users/")
# 定义函数 create_user，参数: name: str, db: Session = Depends(get_primary_db)
def create_user(name: str, db: Session = Depends(get_primary_db)):
    # 创建 User 对象
    user = User(name=name)
    # 添加到主库
    db.add(user)
    # 提交
    db.commit()
    # 刷新取 id
    db.refresh(user)
    # 返回 user
    return user

# 读取用从库
# 装饰器：app.get，路径 "/users/{user_id}"
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int, db: Session = Depends(get_replica_db)
def get_user(user_id: int, db: Session = Depends(get_replica_db)):
    # 从从库查
    # 定义变量 stmt，赋值为 select(User).where(User.id == user_id)
    stmt = select(User).where(User.id == user_id)
    # 执行查询取单条
    # 定义变量 user，赋值为 db.execute(stmt).scalar_one_or_none()
    user = db.execute(stmt).scalar_one_or_none()
    # 返回 user
    return user

# 同时用主库和日志库
# 装饰器：app.delete，路径 "/users/{user_id}"
@app.delete("/users/{user_id}")
# 定义函数 delete_user，参数: user_id, primary=Depends, log_db=Depends
def delete_user(
    user_id: int,
    # primary: 主库 Session，用于写操作（删除用户）
    primary: Session = Depends(get_primary_db),
    # log_db: 日志库 Session，独立于主库（即使日志写入失败也不影响主库删除）
    log_db: Session = Depends(get_log_db),
):
    # 从主库查用户是否存在
    stmt = select(User).where(User.id == user_id)
    user = primary.execute(stmt).scalar_one_or_none()
    if user:
        # 主库删除：session.delete 标记删除，commit 真正执行 DELETE
        primary.delete(user)
        primary.commit()
    # 日志库记录（独立事务）：即使主库删除失败，也记录这次尝试
    # 这种设计叫"审计日志"，保证所有删除操作都有迹可循
    log_db.execute(
        # 用原生 SQL 插入日志（简化演示）
        # text() 包装原生 SQL，参数用 :name 占位，防 SQL 注入
        __import__("sqlalchemy").text(
            "INSERT INTO access_logs (action, target) VALUES (:a, :t)"
        ),
        # 参数绑定：:a 对应 action，:t 对应 target
        {"a": "delete_user", "t": str(user_id)},
    )
    # 日志库独立提交，不影响主库事务
    log_db.commit()
    return {"ok": True}
\`\`\`

## 十一、常见错误与避坑指南

**错误 1：SQLite 多线程报错**

\`\`\`python filename="错误：SQLite 线程检查"
# ❌ 错误：默认 SQLite 不允许跨线程使用连接
# engine = create_engine("sqlite:///./app.db")
# 报错：SQLite objects created in a thread can only be used in that same thread

# ✅ 正确：关闭线程检查
# engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})
\`\`\`

**错误 2：Session 没关闭导致连接泄漏**

\`\`\`python filename="错误：Session 泄漏"
# ❌ 错误：手动创建 Session 不关闭
# 定义函数 bad_route
def bad_route():
    # 创建 Session
    db = SessionLocal()
    # 用完不关，连接泄漏，连接池耗尽后阻塞
    return db.execute(select(User)).all()

# ✅ 正确：用依赖注入自动管理
# 定义函数 good_route，参数: db: Session = Depends(get_db)
def good_route(db: Session = Depends(get_db)):
    # FastAPI 在请求结束后自动关闭
    return db.execute(select(User)).scalars().all()
\`\`\`

**错误 3：commit 后访问对象报错**

\`\`\`python filename="错误：expire_on_commit 导致访问触发查询"
# 默认 expire_on_commit=True，commit 后对象过期
# 定义变量 user，赋值为 User(name="小明")
user = User(name="小明")
# 添加到 session
db.add(user)
# 提交
db.commit()
# 此时 user 已过期
# ❌ 在已关闭的 session 上访问会报错
# print(user.id)  # DetachedInstanceError

# ✅ 解决：commit 前先 refresh，或设 expire_on_commit=False
# db.refresh(user)  # 重新查询并绑定
# db.commit()
# 或者：SessionLocal = sessionmaker(expire_on_commit=False)
\`\`\`

**错误 4：连接池耗尽**

\`\`\`python filename="错误：连接池耗尽"
# ❌ 现象：高并发下报 TimeoutError: QueuePool limit overflow
# 原因：Session 没关闭，连接不归还，池子满了

# ✅ 解决 1：确保所有 Session 都关闭（用依赖注入）
# ✅ 解决 2：调大 pool_size 和 max_overflow
# ✅ 解决 3：排查长事务（开 Session 后长时间不 commit）
\`\`\`

## 十二、生活类比：连接池像出租车车队

理解连接池（Connection Pool）最好的方式是把它比作一个**出租车车队**。

\`\`\`txt filename="连接池 = 出租车车队"
┌──────────────────────────────────────────────────────┐
│  应用（乘客）                                          │
│   请求 1: "我要去数据库" → 调度员派一辆车              │
│   请求 2: "我要去数据库" → 调度员再派一辆车            │
│   请求 3: "我要去数据库" → 车不够，排队等              │
└──────────────────────────────────────────────────────┘
                       ↓ 调度员
┌──────────────────────────────────────────────────────┐
│  连接池（出租车车队）                                   │
│   🚗 连接1（在用）  🚗 连接2（在用）  🚗 连接3（空闲） │
│   pool_size=3：常驻 3 辆车                            │
│   max_overflow=2：高峰期可临时加 2 辆                 │
│   pool_recycle=3600：每 1 小时换一辆新车              │
└──────────────────────────────────────────────────────┘
                       ↓ 开车去
┌──────────────────────────────────────────────────────┐
│  数据库（目的地）                                      │
└──────────────────────────────────────────────────────┘
\`\`\`

- **车队规模（pool\_size）**：平时保持 3 辆车待命，不用每次都叫新车（建连开销大）。
- **高峰溢出（max\_overflow）**：高峰期 3 辆不够，临时加 2 辆（最多 5 辆），闲下来再淘汰多余的。
- **车辆回收（pool\_recycle）**：车开久了会坏（连接断开），每 1 小时换一辆新车，避免半路抛锚。
- **发车前检查（pool\_pre\_ping）**：发车前先打火试一下，确认车没坏再派给乘客。

**Session 是什么**？Session 是一次"打车行程"：

- 乘客上车（\`SessionLocal()\`）→ 司机接单（从池里借连接）→ 开车（执行 SQL）→ 到目的地（\`commit\`）→ 下车还车（\`close\` 归还连接）。
- **一个请求一个 Session**：每个乘客独立用车，不能几个人挤一辆车（Session 非线程安全）。
- **用完必还**：不还车（不 close），车队就被占满了，后面的人打不到车（连接池耗尽）。

> **怎么想**：为什么 FastAPI 用 \`yield\` 依赖？因为"还车"必须保证执行，即使乘客半路下车（异常）。\`finally\` 块就是"无论发生什么，都要还车"。

## 十三、渐进式 Demo：SQLAlchemy 2.0 Async Session 完整实战

这是本章的**重点 Demo**。FastAPI 天生支持 async，配合 SQLAlchemy 2.0 的 \`AsyncSession\` 可以实现真正的异步数据库操作，I/O 等待时不阻塞事件循环。

### Demo 1：最小可运行的 AsyncSession 示例

\`\`\`python filename="demo1_async_minimal.py - 异步最小示例"
# 这个 Demo 用 aiosqlite（SQLite 异步驱动），无需数据库服务
# 安装依赖：pip install sqlalchemy aiosqlite
# 运行：python demo1_async_minimal.py

# 1. 导入异步相关构件
import asyncio  # Python 标准库的异步框架
from datetime import datetime
from typing import Optional

# 从 sqlalchemy 导入 select, String
from sqlalchemy import select, String, func
# 从 sqlalchemy.ext.asyncio 导入异步组件（这是 2.0 的核心）
from sqlalchemy.ext.asyncio import (
    create_async_engine,       # 异步引擎工厂（对应同步的 create_engine）
    AsyncSession,              # 异步会话类（对应同步的 Session）
    async_sessionmaker,        # 异步会话工厂（对应同步的 sessionmaker）
)
# 从 sqlalchemy.orm 导入声明式构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 2. 定义 Base（同步和异步共用同一个 Base）
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 3. 定义模型（模型本身不分同步异步）
# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    # 主键 id：自增整数
    id: Mapped[int] = mapped_column(primary_key=True)
    # 用户名：限长 50
    name: Mapped[str] = mapped_column(String(50))
    # 邮箱：唯一
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 创建时间
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    def __repr__(self):
        return f"<User {self.name}>"

# 4. 创建异步引擎
# 注意驱动：sqlite+aiosqlite（同步是 sqlite）
# 定义变量 ASYNC_URL，赋值为 "sqlite+aiosqlite:///:memory:"
ASYNC_URL = "sqlite+aiosqlite:///:memory:"
# 定义变量 async_engine，赋值为 create_async_engine(...)
# echo=True 打印 SQL，方便调试
async_engine = create_async_engine(ASYNC_URL, echo=True)

# 5. 创建异步会话工厂
# 定义变量 AsyncSessionLocal，赋值为 async_sessionmaker(...)
# ★ 关键参数：expire_on_commit=False
# 异步场景必须设 False，因为 expire_on_commit=True 会在 commit 后访问属性时
# 触发隐式 SELECT，但异步场景下隐式查询会报错（必须显式 await）
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,           # 绑定异步引擎
    class_=AsyncSession,         # 指定会话类
    autocommit=False,            # 不自动提交
    autoflush=False,             # 不自动刷新
    expire_on_commit=False,      # ★ 异步场景必须 False
)

# 6. 异步建表（同步是 Base.metadata.create_all，异步要用 run_sync）
# 定义函数 async def init_db()
async def init_db():
    """异步建表。"""
    # async_engine.begin() 异步上下文，返回连接
    # run_sync 是关键：把同步的 metadata.create_all 包装成异步调用
    # 因为 metadata.create_all 本身是同步函数，不能直接 await
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 7. 异步 CRUD 操作
# 定义函数 async def create_user(name: str, email: str) -> User
async def create_user(name: str, email: str) -> User:
    """异步创建用户。"""
    # 创建异步会话
    # async with 自动管理会话生命周期，退出时关闭
    async with AsyncSessionLocal() as session:
        # 创建用户对象
        # 定义变量 user，赋值为 User(name=name, email=email)
        user = User(name=name, email=email)
        # add 加入会话（注意：add 不是异步的，因为它只是标记 pending）
        session.add(user)
        # ★ commit 是异步的，必须 await
        await session.commit()
        # ★ refresh 也是异步的，从数据库重新加载
        await session.refresh(user)
        return user

# 定义函数 async def get_user(user_id: int) -> User | None
async def get_user(user_id: int):
    """异步查询用户。"""
    async with AsyncSessionLocal() as session:
        # ★ execute 是异步的，必须 await
        # select(User).where(...) 构造查询
        # 定义变量 stmt，赋值为 select(User).where(User.id == user_id)
        stmt = select(User).where(User.id == user_id)
        # 执行查询
        # 定义变量 result，赋值为 await session.execute(stmt)
        result = await session.execute(stmt)
        # scalar_one_or_none 取单条（同步和异步一样，不是 await）
        return result.scalar_one_or_none()

# 定义函数 async def list_users() -> list
async def list_users():
    """异步查询所有用户。"""
    async with AsyncSessionLocal() as session:
        stmt = select(User).order_by(User.id)
        result = await session.execute(stmt)
        # scalars() 把 Row 转成 User 对象，all() 取出所有
        return result.scalars().all()

# 8. 主函数：编排所有异步操作
# 定义函数 async def main()
async def main():
    """主函数：建表 + 增查演示。"""
    # 1. 建表
    await init_db()
    print("✅ 建表完成")

    # 2. 创建用户
    alice = await create_user("Alice", "alice@test.com")
    bob = await create_user("Bob", "bob@test.com")
    print(f"✅ 创建: {alice}")
    print(f"✅ 创建: {bob}")

    # 3. 查询单个
    user = await get_user(1)
    print(f"✅ 查到: {user}")

    # 4. 查询所有
    users = await list_users()
    print(f"✅ 所有用户: {users}")

    # 5. 关闭引擎（程序退出前清理）
    await async_engine.dispose()
    print("✅ 引擎已关闭")

# 9. 运行：用 asyncio.run 启动异步主函数
if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

**异步操作对照表**（同步 → 异步）：

| 同步写法 | 异步写法 | 说明 |
|---------|---------|------|
| \`session.commit()\` | \`await session.commit()\` | 提交事务 |
| \`session.refresh(obj)\` | \`await session.refresh(obj)\` | 刷新对象 |
| \`session.execute(stmt)\` | \`await session.execute(stmt)\` | 执行查询 |
| \`session.delete(obj)\` | \`await session.delete(obj)\` | 删除对象 |
| \`session.close()\` | \`await session.close()\` | 关闭会话 |
| \`session.get(Model, id)\` | \`await session.get(Model, id)\` | 按主键查 |
| \`Base.metadata.create_all(engine)\` | \`async with engine.begin() as conn: await conn.run_sync(Base.metadata.create_all)\` | 建表 |
| \`engine.dispose()\` | \`await engine.dispose()\` | 关闭引擎 |

> **避坑**：\`session.add(obj)\` **不是**异步的（不需要 await），因为它只是把对象标记为 pending，不涉及 I/O。但 \`commit\`、\`execute\`、\`refresh\` 都涉及网络 I/O，必须 await。

### Demo 2：完整 FastAPI + AsyncSession 集成

\`\`\`python filename="demo2_fastapi_async.py - 完整异步 FastAPI 应用"
# 完整的 FastAPI + SQLAlchemy 2.0 异步集成
# 安装：pip install fastapi uvicorn sqlalchemy aiosqlite
# 运行：uvicorn demo2_fastapi_async:app --reload

import asyncio
from datetime import datetime
from typing import Optional, List

# 从 fastapi 导入 FastAPI, Depends, HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 sqlalchemy 导入 select, String, func
from sqlalchemy import select, String, func
# 从 sqlalchemy.ext.asyncio 导入异步组件
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
# 从 sqlalchemy.orm 导入声明式构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# ==================== 1. 数据库配置 ====================
# 异步连接字符串：sqlite+aiosqlite
# 定义变量 DATABASE_URL，赋值为 "sqlite+aiosqlite:///./async_app.db"
DATABASE_URL = "sqlite+aiosqlite:///./async_app.db"

# 创建异步引擎
# 定义变量 async_engine，赋值为 create_async_engine(...)
# echo=False 关闭 SQL 打印（生产环境）
async_engine = create_async_engine(DATABASE_URL, echo=False)

# 创建异步会话工厂
# 定义变量 AsyncSessionLocal，赋值为 async_sessionmaker(...)
# ★ expire_on_commit=False：异步场景必须
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# ==================== 2. 模型 ====================
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

# ==================== 3. Pydantic 模型 ====================
# 定义类 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    """创建用户的请求体"""
    name: str
    email: str

# 定义类 UserOut，继承 BaseModel
class UserOut(BaseModel):
    """用户响应模型"""
    id: int
    name: str
    email: str
    created_at: datetime
    # 定义类 Config
    class Config:
        # 让 Pydantic 能从 ORM 对象读属性
        from_attributes = True

# ==================== 4. 异步依赖：获取 AsyncSession ====================
# 定义函数 async def get_db()
# ★ 注意：异步依赖必须用 async def，不是 def
async def get_db():
    """每个请求创建一个 AsyncSession，请求结束自动关闭。"""
    # 创建异步会话
    # 定义变量 db，赋值为 AsyncSessionLocal()
    db = AsyncSessionLocal()
    try:
        # yield 把 db 交给路由使用
        yield db
    finally:
        # ★ 异步关闭必须 await
        await db.close()

# ==================== 5. FastAPI 应用 ====================
# 创建 FastAPI 应用实例
app = FastAPI()

# 启动时建表（异步）
# 定义函数 async def startup()
# @app.on_event("startup") 是老写法，新版本推荐 lifespan
@app.on_event("startup")
async def startup():
    """启动时建表。"""
    # 异步建表：用 run_sync 包装同步的 create_all
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ==================== 6. 异步 CRUD 路由 ====================

# Create：创建用户
# 装饰器：app.post，路径 "/users/"
@app.post("/users/", response_model=UserOut, status_code=201)
# ★ 路由用 async def，依赖注入 db: AsyncSession = Depends(get_db)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """异步创建用户。"""
    # 创建 User 对象
    # 定义变量 db_user，赋值为 User(**user.model_dump())
    db_user = User(**user.model_dump())
    # add 加入会话（add 不是异步的）
    db.add(db_user)
    try:
        # ★ commit 是异步的，必须 await
        await db.commit()
        # ★ refresh 也是异步的
        await db.refresh(db_user)
        return db_user
    except Exception as e:
        # 出错回滚（异步）
        await db.rollback()
        # 邮箱重复会触发 IntegrityError
        raise HTTPException(400, f"创建失败: {e}")

# Read：查所有用户
# 装饰器：app.get，路径 "/users/"
@app.get("/users/", response_model=List[UserOut])
async def list_users(db: AsyncSession = Depends(get_db)):
    """异步查询所有用户。"""
    # select(User) 构造查询
    # 定义变量 stmt，赋值为 select(User).order_by(User.id)
    stmt = select(User).order_by(User.id)
    # ★ execute 是异步的
    # 定义变量 result，赋值为 await db.execute(stmt)
    result = await db.execute(stmt)
    # scalars().all() 取出所有（这两步不是异步的）
    return result.scalars().all()

# Read：按 id 查单个
# 装饰器：app.get，路径 "/users/{user_id}"
@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """异步查单个用户。"""
    # ★ session.get 是异步的，必须 await
    # 定义变量 user，赋值为 await db.get(User, user_id)
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    return user

# Delete：删除用户
# 装饰器：app.delete，路径 "/users/{user_id}"
@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """异步删除用户。"""
    # 先查出用户
    # 定义变量 user，赋值为 await db.get(User, user_id)
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "用户不存在")
    # ★ delete 是异步的
    await db.delete(user)
    # ★ commit 是异步的
    await db.commit()
    return {"ok": True, "deleted": user_id}

# ==================== 7. 关闭引擎（应用关闭时）====================
@app.on_event("shutdown")
async def shutdown():
    """关闭时释放连接池。"""
    # ★ dispose 是异步的，释放所有连接
    await async_engine.dispose()
\`\`\`

运行后用 curl 或浏览器测试：

\`\`\`bash filename="测试命令"
# 启动服务
# uvicorn demo2_fastapi_async:app --reload

# 创建用户
# curl -X POST "http://127.0.0.1:8000/users/" -H "Content-Type: application/json" -d '{"name":"小明","email":"xm@test.com"}'

# 查所有
# curl "http://127.0.0.1:8000/users/"

# 查单个
# curl "http://127.0.0.1:8000/users/1"

# 删除
# curl -X DELETE "http://127.0.0.1:8000/users/1"
\`\`\`

### Demo 3：连接池监控与 Session 生命周期可视化

\`\`\`python filename="demo3_pool_monitor.py - 连接池监控"
# 这个 Demo 演示如何监控连接池状态，理解 Session 生命周期
# 运行：python demo3_pool_monitor.py

import asyncio
from sqlalchemy import String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from sqlalchemy.pool import QueuePool

# 用同步引擎演示连接池（异步原理一样）
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

# 创建带连接池的引擎
# 定义变量 engine，赋值为 create_engine(...)
# poolclass=QueuePool 显式指定连接池类型
# pool_size=5：常驻 5 个连接
# max_overflow=10：高峰期可加 10 个，最多 15 个
# pool_timeout=30：拿连接等 30 秒，超时报错
# pool_recycle=3600：1 小时回收
# pool_pre_ping=True：用前 ping
engine = create_engine(
    "sqlite:///./pool_demo.db",
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True,
    echo=False,
)

# 建表
Base.metadata.create_all(engine)

# 定义函数 print_pool_status(msg: str)
def print_pool_status(msg: str):
    """打印连接池当前状态。"""
    # engine.pool.status() 返回连接池状态字符串
    # 格式类似：Pool size: 5  Connections in pool: 3  Current Overflow: 1  Current Checked out connections: 2
    # 定义变量 status，赋值为 engine.pool.status()
    status = engine.pool.status()
    print(f"[{msg}] {status}")

# 1. 初始状态：连接池是空的
print_pool_status("初始状态")

# 2. 开第一个 Session
session1 = Session(engine)
session1.add(User(name="用户1"))
print_pool_status("开了 session1（还没 commit）")

# 3. commit 时才真正借连接
session1.commit()
print_pool_status("session1 commit 后")

# 4. 开多个 Session 模拟并发
sessions = []
for i in range(4):
    # 定义变量 s，赋值为 Session(engine)
    s = Session(engine)
    s.add(User(name=f"用户{i+2}"))
    sessions.append(s)
print_pool_status("又开了 4 个 session")

# 5. 关闭所有 session，连接归还
session1.close()
for s in sessions:
    s.close()
print_pool_status("所有 session 关闭后（连接归还）")

# 6. 连接池还保留连接（复用）
with Session(engine) as s:
    s.add(User(name="新用户"))
    s.commit()
print_pool_status("又用了一次（复用连接）")

# 7. 彻底关闭引擎
engine.dispose()
print_pool_status("engine.dispose() 后（全部释放）")
\`\`\`

运行后你会看到连接池状态的变化：

\`\`\`txt filename="预期输出"
[初始状态] Pool size: 5  Connections in pool: 0  Current Overflow: 0  Current Checked out connections: 0
[开了 session1（还没 commit）] Pool size: 5  Connections in pool: 0  Current Overflow: 0  Current Checked out connections: 0
[session1 commit 后] Pool size: 5  Connections in pool: 0  Current Overflow: 0  Current Checked out connections: 1
[又开了 4 个 session] Pool size: 5  Connections in pool: 0  Current Overflow: 0  Current Checked out connections: 5
[所有 session 关闭后（连接归还）] Pool size: 5  Connections in pool: 5  Current Overflow: 0  Current Checked out connections: 0
[又用了一次（复用连接）] Pool size: 5  Connections in pool: 4  Current Overflow: 0  Current Checked out connections: 1
[engine.dispose() 后（全部释放）] Pool size: 0  Connections in pool: 0  Current Overflow: 0  Current Checked out connections: 0
\`\`\`

## 十四、动手实验：巩固理解

### 实验 1：把同步代码改写成异步

**任务**：把下面的同步 CRUD 函数改写成异步版本。

\`\`\`python filename="实验1_同步原版.py"
# 同步版本：请改写成异步
from sqlalchemy import select
from sqlalchemy.orm import Session

# 同步创建
def create_user_sync(session: Session, name: str) -> User:
    user = User(name=name)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# 同步查询
def get_user_sync(session: Session, user_id: int):
    return session.get(User, user_id)
\`\`\`

\`\`\`python filename="实验1_异步参考答案.py"
# 异步版本
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# ★ 异步创建：所有 I/O 操作加 await
# 定义函数 async def create_user_async
async def create_user_async(session: AsyncSession, name: str):
    user = User(name=name)
    session.add(user)        # add 不需要 await（不涉及 I/O）
    await session.commit()    # commit 需要 await
    await session.refresh(user)  # refresh 需要 await
    return user

# ★ 异步查询
# 定义函数 async def get_user_async
async def get_user_async(session: AsyncSession, user_id: int):
    # get 需要 await
    return await session.get(User, user_id)
\`\`\`

### 实验 2：对比同步 vs 异步的性能

**任务**：写一个脚本，分别用同步和异步方式插入 100 条数据，对比耗时。

**思考题**：
1. 单线程下同步和异步谁快？为什么？
2. 并发多个请求时，异步的优势在哪里？

\`\`\`python filename="实验2_性能对比.py"
# 性能对比：同步 vs 异步
import time
import asyncio
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import Session, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

# 1. 同步测试
def sync_test(n: int = 100):
    """同步插入 n 条数据。"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    # 定义变量 start，赋值为 time.time()
    start = time.time()
    with Session(engine) as session:
        for i in range(n):
            session.add(User(name=f"user_{i}"))
        session.commit()
    # 定义变量 elapsed，赋值为 time.time() - start
    elapsed = time.time() - start
    engine.dispose()
    return elapsed

# 2. 异步测试
async def async_test(n: int = 100):
    """异步插入 n 条数据。"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)
    # 定义变量 start，赋值为 time.time()
    start = time.time()
    async with AsyncSessionLocal() as session:
        for i in range(n):
            session.add(User(name=f"user_{i}"))
        await session.commit()
    # 定义变量 elapsed，赋值为 time.time() - start
    elapsed = time.time() - start
    await engine.dispose()
    return elapsed

# 3. 运行对比
if __name__ == "__main__":
    sync_time = sync_test(100)
    async_time = asyncio.run(async_test(100))
    print(f"同步插入 100 条: {sync_time:.3f}s")
    print(f"异步插入 100 条: {async_time:.3f}s")
    # 单线程下同步可能更快（异步有调度开销）
    # 但并发请求时异步优势明显（I/O 等待时不阻塞）
\`\`\`

### 实验 3：实现一个带健康检查的数据库依赖

**任务**：写一个 \`get_db_with_health_check\` 依赖，在返回 Session 前先 ping 一下数据库，确保连接可用。

\`\`\`python filename="实验3_健康检查依赖.py"
# 带健康检查的数据库依赖
from fastapi import Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import logging

# 配置日志
# 定义变量 logger，赋值为 logging.getLogger(__name__)
logger = logging.getLogger(__name__)

# 定义函数 async def get_db_with_health_check()
async def get_db_with_health_check():
    """带健康检查的数据库依赖。
    在返回 Session 前，先发一个简单查询确认连接可用。
    """
    from database import AsyncSessionLocal  # 假设会话工厂在这里
    db = AsyncSessionLocal()
    try:
        # 健康检查：发一个轻量查询
        # text("SELECT 1") 是最简单的健康检查 SQL
        # 定义变量 result，赋值为 await db.execute(text("SELECT 1"))
        result = await db.execute(text("SELECT 1"))
        # 如果能执行成功，说明连接是好的
        logger.debug("数据库健康检查通过")
        yield db
    except Exception as e:
        # 健康检查失败：数据库不可用
        logger.error(f"数据库健康检查失败: {e}")
        # 关闭这个坏会话
        await db.close()
        # 返回 503 服务不可用
        raise HTTPException(503, "数据库暂时不可用")
    finally:
        # 正常或异常都要关闭
        await db.close()

# 在路由里使用：
# @app.get("/users/")
# async def list_users(db: AsyncSession = Depends(get_db_with_health_check)):
#     ...
\`\`\`

## 十五、常见错误补充

**错误 5：异步路由里用同步 Session**

\`\`\`python filename="错误：异步路由用同步 Session"
# ❌ 错误：async 路由里用同步 Session，会阻塞事件循环
# @app.get("/users/")
# async def list_users(db: Session = Depends(get_sync_db)):  # 同步 Session
#     users = db.execute(select(User)).scalars().all()  # 同步操作阻塞事件循环
#     return users

# ✅ 正确：async 路由配 AsyncSession
# @app.get("/users/")
# async def list_users(db: AsyncSession = Depends(get_async_db)):
#     result = await db.execute(select(User))  # 异步操作不阻塞
#     return result.scalars().all()
\`\`\`

**错误 6：忘了 await commit**

\`\`\`python filename="错误：异步操作没 await"
# ❌ 错误：commit 没 await，返回的是协程对象，没真正执行
# async def bad_create(db: AsyncSession, name: str):
#     user = User(name=name)
#     db.add(user)
#     db.commit()  # ❌ 没 await，返回 coroutine，没提交
#     return user

# ✅ 正确：所有 I/O 操作都 await
# async def good_create(db: AsyncSession, name: str):
#     user = User(name=name)
#     db.add(user)         # add 不需要 await
#     await db.commit()     # commit 必须 await
#     await db.refresh(user)  # refresh 必须 await
#     return user
\`\`\`

**错误 7：异步场景 expire_on_commit=True**

\`\`\`python filename="错误：expire_on_commit 导致异步报错"
# ❌ 错误：异步场景 expire_on_commit=True，commit 后访问属性会报错
# AsyncSessionLocal = async_sessionmaker(
#     bind=async_engine,
#     expire_on_commit=True,  # ❌ 异步场景必须 False
# )
# async def bad():
#     async with AsyncSessionLocal() as session:
#         user = User(name="test")
#         session.add(user)
#         await session.commit()
#         print(user.name)  # ❌ 报错：MissingGreenlet，隐式查询不能在异步外触发

# ✅ 正确：异步场景设 expire_on_commit=False
# AsyncSessionLocal = async_sessionmaker(
#     bind=async_engine,
#     expire_on_commit=False,  # ✅ commit 后不自动过期
# )
\`\`\`

**错误 8：忘了 dispose 引擎**

\`\`\`python filename="错误：不 dispose 导致连接泄漏"
# ❌ 错误：测试脚本不 dispose，连接没释放
# async def bad_test():
#     engine = create_async_engine("sqlite+aiosqlite:///:memory:")
#     async with AsyncSessionLocal() as session:
#         ...  # 操作
#     # 程序结束时连接还在，pytest 会警告

# ✅ 正确：用完 dispose
# async def good_test():
#     engine = create_async_engine("sqlite+aiosqlite:///:memory:")
#     try:
#         async with AsyncSessionLocal() as session:
#             ...
#     finally:
#         await engine.dispose()  # ✅ 释放所有连接
\`\`\`

## 十六、本章小结

- \`create_engine\` 创建引擎（连接池管理者），\`sessionmaker\` 创建会话工厂，\`SessionLocal()\` 生成会话。
- 连接字符串格式：\`数据库+驱动://用户:密码@主机:端口/库名\`，SQLite 要加 \`check_same_thread=False\`。
- FastAPI 用 \`yield\` 依赖注入管理 Session：请求开始创建，请求结束关闭，天然安全。
- 连接池参数：\`pool_size\`（常驻）、\`max_overflow\`（溢出）、\`pool_recycle\`（回收）、\`pool_pre_ping\`（健康检查）。
- 生产配置用环境变量，密码不入代码，\`.env\` 不入 git。
- 异步用 \`create_async_engine\` + \`AsyncSession\`，但同步引擎在 FastAPI 里也够用（自动丢线程池）。
- 多数据库场景：每个库一个 engine + SessionLocal + 依赖函数，路由按需注入。

下一章我们深入学习 CRUD 实战：怎么用 \`select()\` 查询、怎么分页、怎么事务。
`
  },

  // =========================================================
  // 第三章：CRUD 实战
  // =========================================================
  {
    id: "fa-crud",
    group: "数据库集成",
    icon: "📝",
    title: "CRUD 实战",
    content: `

# CRUD 实战

## 一、开篇：CRUD 是后端的基本功

CRUD 是 Create、Read、Update、Delete 的缩写，对应数据库的增、查、改、删。一个 Web 后端 80% 的接口都是 CRUD：创建用户、查询文章列表、修改资料、删除评论。

这一章我们用 SQLAlchemy 2.0 的 \`select()\` 语法系统学一遍 CRUD，最后做一个完整的文章 CRUD API（含分页、搜索、排序）。重点是理解每步操作"为什么这么写"，而不只是抄代码。

## 二、Create：创建数据

创建数据三步走：\`add\` → \`commit\` → \`refresh\`。

\`\`\`python filename="Create 操作详解"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 sqlalchemy 导入 String, select
from sqlalchemy import String, select
# 从 sqlalchemy.orm 导入 Session, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.orm import Session, DeclarativeBase, Mapped, mapped_column

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

# 假设已有 session
# 定义函数 create_user，参数: session, name, email
def create_user(session: Session, name: str, email: str) -> User:
    """创建一个用户。"""
    # 1. 创建 Python 对象（此时还没进数据库）
    # 定义变量 user，赋值为 User(name=name, email=email)
    user = User(name=name, email=email)

    # 2. add：把对象加入会话（pending 状态，还没写入数据库）
    session.add(user)

    # 3. commit：提交事务，真正写入数据库
    # 此时 INSERT SQL 被发送到数据库
    session.commit()

    # 4. refresh：从数据库重新加载这个对象
    # 目的是拿到数据库生成的值（如自增 id、server_default 的 created_at）
    session.refresh(user)

    # 现在 user.id 有值了，可以返回
    return user

# 批量创建
# 定义函数 create_users_batch，参数: session, users_data
def create_users_batch(session: Session, users_data: list) -> list:
    """批量创建用户。"""
    # 构造对象列表
    users = [User(name=d["name"], email=d["email"]) for d in users_data]
    # add_all 批量加入
    session.add_all(users)
    # 一次 commit 提交所有
    session.commit()
    # 批量 refresh
    for u in users:
        session.refresh(u)
    return users
\`\`\`

**add vs add\_all vs bulk\_save\_objects**：

- \`add(obj)\`：加单个对象。
- \`add_all([obj1, obj2])\`：加多个对象，等价于循环 add。
- \`bulk\_save\_objects([...])\`：批量插入，跳过 ORM 状态管理，快但失去关系同步。大数据量导入用。

**为什么必须 refresh**：\`commit()\` 后对象虽然有 id（因为 INSERT 时数据库返回了），但 \`server_default\` 的字段（如 \`created_at\` 用 \`func.now()\`）在 Python 端还是 None。\`refresh()\` 重新 SELECT 一次，把数据库填的值同步回来。

## 三、Read：查询数据（select 2.0 风格）

SQLAlchemy 2.0 用 \`select()\` 构造查询，\`session.execute()\` 执行。

\`\`\`python filename="Read 操作详解"
# 从 sqlalchemy 导入 select
from sqlalchemy import select
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 假设已有 User 模型和 session

# 1. 查所有
# 定义函数 get_all_users，参数: session
def get_all_users(session: Session) -> list:
    """查所有用户。"""
    # select(User) 等价于 SELECT * FROM users
    # 定义变量 stmt，赋值为 select(User)
    stmt = select(User)
    # execute 返回 Result 对象
    # scalars() 把 Row(User,) 转成 User（去掉外层元组）
    # all() 取出所有
    # 定义变量 users，赋值为 session.execute(stmt).scalars().all()
    users = session.execute(stmt).scalars().all()
    return users

# 2. 按主键查（最常用）
# 定义函数 get_user_by_id，参数: session, user_id
def get_user_by_id(session: Session, user_id: int) -> User | None:
    """按 id 查单个用户。"""
    # 方式 1：select + where
    stmt = select(User).where(User.id == user_id)
    # scalar_one_or_none：取单条，没有返回 None，多条报错
    return session.execute(stmt).scalar_one_or_none()

    # 方式 2：session.get（更简洁，走缓存）
    # return session.get(User, user_id)

# 3. 条件查询
# 定义函数 get_users_by_name，参数: session, name
def get_users_by_name(session: Session, name: str) -> list:
    """按名字查（精确匹配）。"""
    # where 条件：User.name == name
    stmt = select(User).where(User.name == name)
    return session.execute(stmt).scalars().all()

# 4. 模糊查询（LIKE）
# 定义函数 search_users，参数: session, keyword
def search_users(session: Session, keyword: str) -> list:
    """名字包含关键字。"""
    # like("%keyword%") 模糊匹配
    stmt = select(User).where(User.name.like(f"%{keyword}%"))
    return session.execute(stmt).scalars().all()

# 5. 多条件查询（AND）
# 定义函数 get_active_admins，参数: session
def get_active_admins(session: Session) -> list:
    """查所有激活的管理员。"""
    # 多个 where 链式调用 = AND
    stmt = select(User).where(User.is_admin == True).where(User.is_active == True)
    return session.execute(stmt).scalars().all()

# 6. OR 查询
# 从 sqlalchemy 导入 or_
from sqlalchemy import or_
# 定义函数 get_users_by_email_or_name，参数: session, keyword
def get_users_by_email_or_name(session: Session, keyword: str) -> list:
    """邮箱或名字包含关键字。"""
    # or_ 包裹多个条件
    stmt = select(User).where(
        or_(
            User.name.like(f"%{keyword}%"),
            User.email.like(f"%{keyword}%"),
        )
    )
    return session.execute(stmt).scalars().all()
\`\`\`

**scalar\_one\_or\_none vs one\_or\_none vs first vs all**：

- \`scalar_one()\`：取单条单列，没有或多条都报错。
- \`scalar_one_or_none()\`：取单条单列，没有返回 None，多条报错。
- \`one()\`：取单条（Row），没有或多条报错。
- \`one_or_none()\`：取单条（Row），没有返回 None，多条报错。
- \`first()\`：取第一条（带 LIMIT 1），没有返回 None。
- \`all()\`：取所有，返回列表（空查询返回空列表）。

> **怎么想**：查单条用 \`scalar_one_or_none\`（自动校验唯一性，多条报错能及早发现问题），查列表用 \`all()\`，不确定有没有用 \`first()\`。别滥用 \`first()\`——它不校验是否多条，可能掩盖数据问题。

## 四、Update：更新数据

更新有两种方式：修改属性 + commit，或用 update 语句批量更新。

\`\`\`python filename="Update 操作详解"
# 从 sqlalchemy 导入 select, update
from sqlalchemy import select, update
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 方式 1：修改属性（推荐，OO 风格）
# 定义函数 update_user_name，参数: session, user_id, new_name
def update_user_name(session: Session, user_id: int, new_name: str) -> User | None:
    """更新用户名字。"""
    # 先查出来
    # 定义变量 user，赋值为 session.get(User, user_id)
    user = session.get(User, user_id)
    if not user:
        return None
    # 修改属性（此时对象标记为 dirty，还没写入）
    user.name = new_name
    # commit 时自动 UPDATE
    session.commit()
    # refresh 确保同步
    session.refresh(user)
    return user

# 方式 2：update 语句（批量更新，不加载对象）
# 定义函数 update_all_inactive，参数: session
def update_all_inactive(session: Session) -> int:
    """把所有用户设为未激活。"""
    # update() 构造 UPDATE 语句
    # values 设新值，where 设条件
    stmt = (
        update(User)
        .where(User.is_active == True)
        .values(is_active=False)
    )
    # 执行并获取影响行数
    result = session.execute(stmt)
    session.commit()
    # rowcount 是受影响行数
    return result.rowcount

# 方式 3：批量更新多个字段
# 定义函数 bulk_update，参数: session, user_id, data
def bulk_update(session: Session, user_id: int, data: dict) -> User | None:
    """用字典批量更新字段。"""
    user = session.get(User, user_id)
    if not user:
        return None
    # 遍历字典，逐个 setattr
    for key, value in data.items():
        # setattr(对象, 属性名, 值) 等价于 对象.属性 = 值
        setattr(user, key, value)
    session.commit()
    session.refresh(user)
    return user
\`\`\`

**方式 1 vs 方式 2 怎么选**：

- 方式 1（修改属性）：适合单条更新，能触发 ORM 事件、关系同步。但要先 SELECT 再 UPDATE，两次 SQL。
- 方式 2（update 语句）：适合批量更新，一次 SQL 搞定。但绕过 ORM，不触发事件，关系不同步。

简单说：单条用方式 1，批量用方式 2。

## 五、Delete：删除数据

删除同样有两种：\`session.delete()\` 和 \`delete()\` 语句。

\`\`\`python filename="Delete 操作详解"
# 从 sqlalchemy 导入 select, delete
from sqlalchemy import select, delete
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 方式 1：session.delete（推荐，触发级联）
# 定义函数 delete_user，参数: session, user_id
def delete_user(session: Session, user_id: int) -> bool:
    """删除用户。"""
    # 先查出来
    user = session.get(User, user_id)
    if not user:
        return False
    # delete 标记删除（cascade="all, delete-orphan" 会连带删关联数据）
    session.delete(user)
    # commit 真正执行 DELETE
    session.commit()
    return True

# 方式 2：delete 语句（批量删除）
# 定义函数 delete_inactive_users，参数: session
def delete_inactive_users(session: Session) -> int:
    """删除所有未激活用户。"""
    # delete() 构造 DELETE 语句
    stmt = delete(User).where(User.is_active == False)
    result = session.execute(stmt)
    session.commit()
    return result.rowcount

# 方式 3：软删除（推荐生产用）
# 定义函数 soft_delete_user，参数: session, user_id
def soft_delete_user(session: Session, user_id: int) -> bool:
    """软删除：标记 is_deleted=True，不真删。"""
    user = session.get(User, user_id)
    if not user:
        return False
    # 只标记，不删行
    user.is_deleted = True
    user.deleted_at = datetime.now()
    session.commit()
    return True
\`\`\`

**硬删除 vs 软删除**：

- 硬删除：\`DELETE FROM users WHERE id=1\`，行没了。不可恢复。
- 软删除：\`UPDATE users SET is_deleted=1 WHERE id=1\`，行还在，加个标记。可恢复。

生产环境推荐软删除——数据是资产，删错了能找回。查询时记得 \`where(is_deleted == False)\` 过滤。

## 六、select 语句进阶：where、order\_by、limit、offset

\`\`\`python filename="查询进阶"
# 从 sqlalchemy 导入 select, desc, asc, func
from sqlalchemy import select, desc, asc, func
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 1. 排序：order_by
# 定义函数 get_users_sorted，参数: session
def get_users_sorted(session: Session) -> list:
    """按创建时间倒序。"""
    # desc(User.created_at) 降序，asc 升序
    stmt = select(User).order_by(desc(User.created_at))
    return session.execute(stmt).scalars().all()

# 多字段排序
# 定义函数 get_users_multi_sort，参数: session
def get_users_multi_sort(session: Session) -> list:
    """先按 is_admin 降序，再按 name 升序。"""
    stmt = select(User).order_by(
        desc(User.is_admin),  # 管理员在前
        asc(User.name),       # 同级别按名字
    )
    return session.execute(stmt).scalars().all()

# 2. 分页：limit + offset
# 定义函数 get_users_page，参数: session, page, size
def get_users_page(session: Session, page: int = 1, size: int = 10) -> list:
    """分页查询。page 从 1 开始。"""
    # offset 计算：第 1 页跳过 0 条，第 2 页跳过 size 条，以此类推
    # 公式：(page - 1) * size，page 从 1 开始所以减 1
    # offset = (page - 1) * size
    offset_val = (page - 1) * size
    stmt = (
        select(User)
        # order_by 必须有：分页前必须排序，否则结果顺序不确定
        .order_by(User.id)
        .offset(offset_val)  # 跳过多少条（OFFSET 子句）
        .limit(size)         # 取多少条（LIMIT 子句）
    )
    # 等价 SQL：SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 0
    return session.execute(stmt).scalars().all()

# 3. 聚合：count
# 定义函数 count_users，参数: session
def count_users(session: Session) -> int:
    """统计用户总数。"""
    # func.count(User.id) 等价于 COUNT(id)
    stmt = select(func.count(User.id))
    # scalar() 取单值
    return session.execute(stmt).scalar()

# 4. 分组：group_by
# 定义函数 count_users_by_status，参数: session
def count_users_by_status(session: Session) -> list:
    """按 is_admin 分组统计。"""
    stmt = (
        # select 两个列：分组列 + 聚合结果
        # User.is_admin 是分组依据，func.count 是聚合函数
        select(User.is_admin, func.count(User.id).label("cnt"))
        # .label("cnt") 给聚合结果起别名，方便结果里按名字取值
        # group_by 按 is_admin 分组：True 一组，False 一组
        .group_by(User.is_admin)
    )
    # 返回 [(True, 5), (False, 100)]
    # 每行是元组：(is_admin 值, 该组的用户数)
    # 因为查了多个列，用 all() 返回 Row 列表，不用 scalars()
    return session.execute(stmt).all()

# 5. 去重：distinct
# 从 sqlalchemy 导入 distinct
from sqlalchemy import distinct
# 定义函数 get_distinct_names，参数: session
def get_distinct_names(session: Session) -> list:
    """查所有不重复的名字。"""
    stmt = select(distinct(User.name))
    return session.execute(stmt).scalars().all()
\`\`\`

> **避坑**：\`offset\` 大了性能差（数据库要扫描跳过的行）。深分页用游标分页（\`WHERE id > last_id ORDER BY id LIMIT size\`）。

## 七、join 和 relationship 查询

\`\`\`python filename="关联查询"
# 从 sqlalchemy 导入 select
from sqlalchemy import select
# 从 sqlalchemy.orm 导入 Session, selectinload, joinedload
from sqlalchemy.orm import Session, selectinload, joinedload

# 假设有 User 和 Post 模型，User.posts 是一对多关系

# 1. 直接用 relationship 访问（懒加载）
# 定义函数 get_user_posts_lazy，参数: session, user_id
def get_user_posts_lazy(session: Session, user_id: int):
    """懒加载：访问 user.posts 时才查。"""
    user = session.get(User, user_id)
    # 此时还没查 posts
    # 访问 user.posts 触发 SELECT * FROM posts WHERE author_id=?
    # 定义变量 posts，赋值为 user.posts
    posts = user.posts
    return posts

# 2. joinedload：JOIN 一次查回来（适合一对一、多对一）
# 定义函数 get_users_with_posts_join，参数: session
def get_users_with_posts_join(session: Session) -> list:
    """一次 JOIN 查出用户和文章。"""
    # joinedload 的原理：用 LEFT JOIN 把主表和关联表一次查回来
    # 优点：1 次 SQL 搞定，无 N+1
    # 缺点：一对多关系会笛卡尔积（1 个用户 10 篇文章 → 10 行），需要 unique()
    stmt = (
        select(User)
        .options(joinedload(User.posts))  # 预加载，避免 N+1
        .order_by(User.id)
    )
    # joinedload 用 LEFT JOIN 一次查回
    # unique()：因为 JOIN 产生了重复的 User 行，需要去重
    return session.execute(stmt).unique().scalars().all()

# 3. selectinload：分两次查（适合一对多、多对多）
# 定义函数 get_users_with_posts_selectin，参数: session
def get_users_with_posts_selectin(session: Session) -> list:
    """selectinload 避免 N+1，且不爆笛卡尔积。"""
    # selectinload 的原理：分两次 SQL
    #   第一次：SELECT * FROM users
    #   第二次：SELECT * FROM posts WHERE author_id IN (1, 2, 3, ...)
    # 优点：不笛卡尔积，适合一对多、多对多
    # 缺点：2 次 SQL（但比 N+1 的 N+1 次好太多）
    stmt = (
        select(User)
        .options(selectinload(User.posts))
        .order_by(User.id)
    )
    # selectinload：先 SELECT users，再 SELECT posts WHERE author_id IN (...)
    # 不需要 unique()，因为没有 JOIN 产生重复
    return session.execute(stmt).scalars().all()

# 4. 手动 join 查询
# 从 sqlalchemy 导入 join
from sqlalchemy import join
# 定义函数 get_posts_with_author，参数: session
def get_posts_with_author(session: Session) -> list:
    """手动 JOIN 查文章和作者名。"""
    stmt = (
        # select(Post, User) 查两个模型，结果每行是 (Post, User) 元组
        select(Post, User)
        # .join(目标表, 连接条件)：生成 INNER JOIN
        # Post.author_id == User.id 是 ON 条件
        .join(User, Post.author_id == User.id)  # JOIN 条件
        # 只查已发布的文章
        .where(Post.published == True)
    )
    # 结果是 [(Post, User), ...] 元组列表
    # 因为查了两个模型，每行包含两个对象，不用 scalars()
    return session.execute(stmt).all()

# 5. 用 relationship 的 join
# 定义函数 get_posts_by_user_name，参数: session, name
def get_posts_by_user_name(session: Session, name: str) -> list:
    """通过作者名查文章（用 relationship 的 join）。"""
    stmt = (
        # select(Post) 只查 Post，结果每行是单个 Post
        select(Post)
        # .join(Post.author) 隐式 JOIN：
        #   不用手写 ON 条件，SQLAlchemy 从 relationship 定义推断
        #   等价于 .join(User, Post.author_id == User.id)
        .join(Post.author)  # 隐式 JOIN，用 relationship
        # 过滤条件：作者名等于传入的 name
        .where(User.name == name)
    )
    # scalars() 把 Row(Post,) 转成 Post 对象
    # all() 取出所有匹配的文章
    return session.execute(stmt).scalars().all()
\`\`\`

**N+1 问题**（高频面试题）：

\`\`\`python filename="N+1 问题演示"
# ❌ N+1：查 N 个用户，再查 N 次文章，共 1+N 次 SQL
# 定义函数 bad_example，参数: session
def bad_example(session: Session):
    users = session.execute(select(User)).scalars().all()  # 1 次
    for u in users:
        print(u.posts)  # 每次循环 1 次 SQL → N 次
    # 总共 1 + N 次 SQL，N 大时性能灾难

# ✅ 解决：joinedload 或 selectinload 预加载
# 定义函数 good_example，参数: session
def good_example(session: Session):
    stmt = select(User).options(selectinload(User.posts))
    users = session.execute(stmt).scalars().all()  # 2 次 SQL 搞定
    for u in users:
        print(u.posts)  # 不再发 SQL，已加载
\`\`\`

**joinedload vs selectinload 怎么选**：

- \`joinedload\`：用 JOIN，一次 SQL。适合多对一、一对一（JOIN 不膨胀）。一对多会笛卡尔积，要 \`unique()\`。
- \`selectinload\`：分两次 SQL（先查主表，再 IN 查关联）。适合一对多、多对多，不笛卡尔积。

## 八、事务处理

事务（Transaction）保证一组操作要么全成功，要么全失败。\`session.commit()\` 提交，\`session.rollback()\` 回滚。

\`\`\`python filename="事务处理"
# 从 sqlalchemy 导入 select
from sqlalchemy import select
# 从 sqlalchemy.exc 导入 SQLAlchemyError
from sqlalchemy.exc import SQLAlchemyError
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session

# 1. 基本事务：commit / rollback
# 定义函数 transfer_credits，参数: session, from_id, to_id, amount
def transfer_credits(session: Session, from_id: int, to_id: int, amount: int) -> bool:
    """转账：从一个用户扣分，给另一个用户加分。"""
    try:
        # 查两个用户：session.get 按主键查，比 select 更简洁且走缓存
        from_user = session.get(User, from_id)
        to_user = session.get(User, to_id)
        # 任意一方不存在，转账无法进行
        if not from_user or not to_user:
            return False
        # 检查余额是否充足：不足则拒绝，避免负数积分
        if from_user.credits < amount:
            return False
        # 扣分：修改属性，ORM 标记对象为 dirty（待更新）
        from_user.credits -= amount
        # 加分：同样修改属性，等待 commit 时一起 UPDATE
        to_user.credits += amount
        # 一次 commit，要么全成功，要么全失败（事务的原子性）
        # commit 时 ORM 把 dirty 对象的变更一次性提交
        session.commit()
        return True
    except SQLAlchemyError:
        # 出错回滚，前面的修改全部撤销，数据库回到事务开始前的状态
        # 不回滚的话 Session 状态混乱，后续操作会报错
        session.rollback()
        return False

# 2. 用 begin 块管理事务（2.0 推荐）
# 定义函数 safe_create_user，参数: session, name, email
def safe_create_user(session: Session, name: str, email: str) -> User | None:
    """安全创建用户：出错自动回滚。"""
    # session.begin() 开启事务，块结束自动 commit 或 rollback
    try:
        with session.begin():
            user = User(name=name, email=email)
            session.add(user)
            # 块结束自动 commit
        return user
    except SQLAlchemyError:
        # 出错自动 rollback
        return None

# 3. 嵌套事务（savepoint）
# 定义函数 nested_example，参数: session
def nested_example(session: Session):
    """嵌套事务：外层失败全回滚，内层失败只回内层。"""
    # with session.begin() 开启外层事务，块结束自动 commit 或 rollback
    with session.begin():
        # 外层事务：插入一条用户
        session.add(User(name="外层", email="outer@test.com"))
        try:
            # 内层 savepoint：begin_nested 创建一个保存点
            # 保存点是事务内的"检查点"，可以单独回滚到这里而不影响外层
            with session.begin_nested():
                session.add(User(name="内层", email="inner@test.com"))
                # 内层成功，提交 savepoint（保存点的变更纳入外层事务）
        except SQLAlchemyError:
            # 内层失败，只回滚到 savepoint，外层事务继续运行
            # 外层已插入的"外层"用户不受影响
            pass
        # 外层继续执行：再插入一条用户
        # 即使内层失败，这里依然会执行
        session.add(User(name="外层2", email="outer2@test.com"))
\`\`\`

**事务边界原则**：

1. 事务要短：开事务后尽快 commit，别在事务里做耗时操作（如发邮件）。
2. 一个请求一个事务：用 FastAPI 依赖注入，请求结束 commit 或 rollback。
3. 异常必回滚：捕获异常后 \`session.rollback()\`，否则 Session 状态混乱。

## 九、实战：完整文章 CRUD API

把前面所有知识点串起来，做一个完整的文章 CRUD API，含分页、搜索、排序。

\`\`\`python filename="main.py - 完整文章 CRUD API"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional
from typing import Optional
# 从 fastapi 导入 FastAPI, Depends, HTTPException, Query
from fastapi import FastAPI, Depends, HTTPException, Query
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 sqlalchemy 导入 create_engine, select, func, desc, asc, or_
from sqlalchemy import create_engine, select, func, desc, asc, or_, String, Text
# 从 sqlalchemy.orm 导入 sessionmaker, Session, DeclarativeBase, Mapped, mapped_column, relationship, selectinload
from sqlalchemy.orm import (
    sessionmaker, Session, DeclarativeBase, Mapped, mapped_column,
    relationship, selectinload,
)

# ==================== 1. 数据库配置 ====================
# 定义变量 DATABASE_URL，赋值为 "sqlite:///./blog.db"
DATABASE_URL = "sqlite:///./blog.db"
# 创建引擎
# 定义变量 engine，赋值为 create_engine(...)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
# 创建会话工厂
# 定义变量 SessionLocal，赋值为 sessionmaker(...)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# ==================== 2. 模型 ====================
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Post，继承 Base
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(default=False)
    view_count: Mapped[int] = mapped_column(default=0)
    author_name: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

# ==================== 3. Pydantic 模型 ====================
# 定义类 PostCreate，继承 BaseModel
class PostCreate(BaseModel):
    """创建文章的请求体"""
    title: str
    body: str
    published: bool = False
    author_name: str

# 定义类 PostUpdate，继承 BaseModel
class PostUpdate(BaseModel):
    """更新文章的请求体（所有字段可选）"""
    title: Optional[str] = None
    body: Optional[str] = None
    published: Optional[bool] = None

# 定义类 PostOut，继承 BaseModel
class PostOut(BaseModel):
    """文章响应模型"""
    id: int
    title: str
    body: str
    published: bool
    view_count: int
    author_name: str
    created_at: datetime
    # 定义类 Config
    class Config:
        from_attributes = True

# 定义类 PaginatedPosts，继承 BaseModel
class PaginatedPosts(BaseModel):
    """分页响应"""
    items: list[PostOut]
    total: int        # 总数
    page: int         # 当前页
    size: int         # 每页大小
    pages: int        # 总页数

# ==================== 4. 依赖 ====================
# 定义函数 get_db
def get_db():
    # 创建 Session
    db = SessionLocal()
    try:
        # 注入
        yield db
    finally:
        # 关闭
        db.close()

# ==================== 5. FastAPI 应用 ====================
# 创建 FastAPI 应用实例
app = FastAPI()

# 启动时建表
# 装饰器：app.on_event，事件 "startup"
@app.on_event("startup")
def startup():
    # 建表
    Base.metadata.create_all(engine)

# ==================== 6. CRUD 路由 ====================

# Create：创建文章
# 装饰器：app.post，路径 "/posts/"
@app.post("/posts/", response_model=PostOut, status_code=201)
# 定义函数 create_post，参数: post: PostCreate, db: Session = Depends(get_db)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    """创建文章。"""
    # 创建 Post 对象
    # 定义变量 db_post，赋值为 Post(**post.model_dump())
    db_post = Post(**post.model_dump())
    # 添加
    db.add(db_post)
    # 提交
    db.commit()
    # 刷新
    db.refresh(db_post)
    # 返回
    return db_post

# Read：分页 + 搜索 + 排序
# 装饰器：app.get，路径 "/posts/"
@app.get("/posts/", response_model=PaginatedPosts)
# 定义函数 list_posts，参数: 多个查询参数
def list_posts(
    # db: 通过依赖注入获取数据库 Session，每个请求独立
    db: Session = Depends(get_db),
    # Query(1, ge=1, ...)：第一个参数 1 是默认值，ge=1 表示大于等于 1（页码不能为 0 或负数）
    page: int = Query(1, ge=1, description="页码，从1开始"),
    # size: 每页数量，ge=1 最小 1 条，le=100 最大 100 条（防止一次查太多拖垮数据库）
    size: int = Query(10, ge=1, le=100, description="每页数量"),
    # search: 搜索关键字，Optional 表示可传可不传，None 表示不过滤
    search: Optional[str] = Query(None, description="按标题搜索"),
    # sort: 排序字段名，对应 Post 模型的属性名，默认按创建时间排序
    sort: str = Query("created_at", description="排序字段"),
    # order: 排序方向，desc 降序（新的在前），asc 升序（旧的在前）
    order: str = Query("desc", description="asc 或 desc"),
    # published_only: 是否只返回已发布文章，默认 True（草稿不给访客看）
    published_only: bool = Query(True, description="只看已发布"),
):
    """分页查询文章，支持搜索和排序。"""
    # 构造基础查询：stmt 用于查列表数据
    stmt = select(Post)
    # count_stmt 用于统计总数（不受分页影响），func.count 生成 COUNT(id)
    count_stmt = select(func.count(Post.id))

    # 过滤：只看已发布
    if published_only:
        stmt = stmt.where(Post.published == True)
        count_stmt = count_stmt.where(Post.published == True)

    # 搜索：标题或正文包含关键字
    if search:
        # 用 or_ 组合多个 like
        stmt = stmt.where(
            or_(
                Post.title.like(f"%{search}%"),
                Post.body.like(f"%{search}%"),
            )
        )
        count_stmt = count_stmt.where(
            or_(
                Post.title.like(f"%{search}%"),
                Post.body.like(f"%{search}%"),
            )
        )

    # 统计总数（不受分页影响）
    # 定义变量 total，赋值为 db.execute(count_stmt).scalar()
    total = db.execute(count_stmt).scalar()
    # 计算总页数
    # 定义变量 pages，赋值为 (total + size - 1) // size
    pages = (total + size - 1) // size

    # 排序
    # 动态获取排序字段：getattr(Post, sort)
    sort_col = getattr(Post, sort, Post.created_at)
    if order == "asc":
        stmt = stmt.order_by(asc(sort_col))
    else:
        stmt = stmt.order_by(desc(sort_col))

    # 分页
    # 定义变量 offset_val，赋值为 (page - 1) * size
    offset_val = (page - 1) * size
    stmt = stmt.offset(offset_val).limit(size)

    # 执行查询
    # 定义变量 posts，赋值为 db.execute(stmt).scalars().all()
    posts = db.execute(stmt).scalars().all()

    # 返回分页结构
    return PaginatedPosts(
        items=posts,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )

# Read：查单个
# 装饰器：app.get，路径 "/posts/{post_id}"
@app.get("/posts/{post_id}", response_model=PostOut)
# 定义函数 get_post，参数: post_id: int, db: Session = Depends(get_db)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """查单个文章，顺便 +1 浏览量。"""
    # 用 get 查
    # 定义变量 post，赋值为 db.get(Post, post_id)
    post = db.get(Post, post_id)
    if not post:
        # 不存在抛 404
        # 抛出 HTTPException 异常: 404, "文章不存在"
        raise HTTPException(404, "文章不存在")
    # 浏览量 +1
    post.view_count += 1
    db.commit()
    db.refresh(post)
    return post

# Update：更新
# 装饰器：app.patch，路径 "/posts/{post_id}"
@app.patch("/posts/{post_id}", response_model=PostOut)
# 定义函数 update_post，参数: post_id, post: PostUpdate, db
def update_post(
    post_id: int,
    # post: 请求体，用 PostUpdate 模型校验（字段都是 Optional）
    post: PostUpdate,
    db: Session = Depends(get_db),
):
    """更新文章。只更新传入的字段。"""
    # 查出来：session.get 按主键查，比 select+where 更简洁
    # 定义变量 db_post，赋值为 db.get(Post, post_id)
    db_post = db.get(Post, post_id)
    if not db_post:
        raise HTTPException(404, "文章不存在")
    # 只更新非 None 的字段（PATCH 语义）
    # model_dump(exclude_unset=True) 关键：
    #   - 默认 model_dump() 会把所有字段都输出（包括没传的，值为默认 None）
    #   - exclude_unset=True 只输出客户端明确传入的字段
    #   - 这样没传的字段不会被覆盖成 None，实现 PATCH 语义
    # 定义变量 update_data，赋值为 post.model_dump(exclude_unset=True)
    update_data = post.model_dump(exclude_unset=True)
    # 遍历要更新的字段，用 setattr 动态设置属性
    # setattr(obj, "name", value) 等价于 obj.name = value
    for key, value in update_data.items():
        setattr(db_post, key, value)
    # commit 时 ORM 自动生成 UPDATE 语句，只更新变更的字段
    db.commit()
    # refresh 从数据库重新加载，确保拿到最新值
    db.refresh(db_post)
    return db_post

# Delete：删除
# 装饰器：app.delete，路径 "/posts/{post_id}"
@app.delete("/posts/{post_id}")
# 定义函数 delete_post，参数: post_id: int, db: Session = Depends(get_db)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """删除文章。"""
    # 查出来
    # 定义变量 db_post，赋值为 db.get(Post, post_id)
    db_post = db.get(Post, post_id)
    if not db_post:
        raise HTTPException(404, "文章不存在")
    # 删除
    db.delete(db_post)
    db.commit()
    # 返回 {"ok": True}
    return {"ok": True}
\`\`\`

这个 API 覆盖了：

- **Create**：\`POST /posts/\`，用 Pydantic 校验入参，\`add+commit+refresh\`。
- **Read 列表**：\`GET /posts/\`，分页（offset+limit）、搜索（like+or\_）、排序（order\_by）、统计（func.count）。
- **Read 单个**：\`GET /posts/{id}\`，\`session.get\` + 浏览量自增。
- **Update**：\`PATCH /posts/{id}\`，\`model_dump(exclude_unset=True)\` 实现 PATCH 语义。
- **Delete**：\`DELETE /posts/{id}\`，\`session.delete\` + commit。

## 十、常见错误与避坑指南

**错误 1：忘了 commit**

\`\`\`python filename="错误：忘了 commit"
# ❌ 错误：add 后不 commit，数据没进数据库
# 定义函数 bad_create，参数: session, name
def bad_create(session, name):
    user = User(name=name)
    session.add(user)
    # 忘了 commit，进程结束数据就没了
    return user

# ✅ 正确：add + commit
# 定义函数 good_create，参数: session, name
def good_create(session, name):
    user = User(name=name)
    session.add(user)
    session.commit()  # 真正写入
    session.refresh(user)  # 拿回 id
    return user
\`\`\`

**错误 2：N+1 查询**

\`\`\`python filename="错误：N+1"
# ❌ 错误：循环里访问关系，触发 N 次 SQL
# 定义函数 bad_list，参数: session
def bad_list(session):
    posts = session.execute(select(Post)).scalars().all()
    for p in posts:
        print(p.author)  # 每次循环 1 次 SQL
    return posts

# ✅ 正确：预加载
# 定义函数 good_list，参数: session
def good_list(session):
    stmt = select(Post).options(selectinload(Post.author))
    posts = session.execute(stmt).scalars().all()
    for p in posts:
        print(p.author)  # 不再发 SQL
    return posts
\`\`\`

**错误 3：异常后不 rollback**

\`\`\`python filename="错误：异常不回滚"
# ❌ 错误：commit 失败后不 rollback，Session 状态混乱
# 定义函数 bad_transfer，参数: session
def bad_transfer(session):
    try:
        # 一系列操作
        session.commit()
    except Exception:
        # 没回滚，Session 还在"事务中"，后续操作报错
        pass

# ✅ 正确：异常必回滚
# 定义函数 good_transfer，参数: session
def good_transfer(session):
    try:
        session.commit()
    except Exception:
        session.rollback()  # 回到干净状态
        raise
\`\`\`

**错误 4：用 first 查唯一值**

\`\`\`python filename="错误：first 掩盖数据问题"
# ❌ 错误：用 first 查邮箱，多条也不报错
# 定义变量 user，赋值为 session.execute(select(User).where(User.email == e)).scalars().first()
user = session.execute(select(User).where(User.email == e)).scalars().first()
# 如果有重名邮箱（unique 失效），first 默默取第一条，bug 隐藏

# ✅ 正确：用 one_or_none 校验唯一
# 定义变量 user，赋值为 session.execute(...).scalar_one_or_none()
user = session.execute(select(User).where(User.email == e)).scalar_one_or_none()
# 多条会抛 MultipleResultsFound，及早发现问题
\`\`\`

## 十一、生活类比：CRUD 像图书馆管理员

理解 CRUD 最好的方式是把它比作**图书馆管理员**的工作。

\`\`\`txt filename="CRUD = 图书馆管理员"
┌──────────────────────────────────────────────────────┐
│  读者（HTTP 请求）                                    │
│   "我要借一本《FastAPI 实战》"                        │
│   "我要还这本书"                                      │
│   "图书馆有哪些书？"                                  │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  管理员（CRUD 函数）                                  │
│   Create：新书入库 → 登记到目录卡（INSERT）           │
│   Read：查目录卡找到书 → 取给读者（SELECT）           │
│   Update：读者改了手机号 → 更新登记卡（UPDATE）       │
│   Delete：旧书淘汰 → 从目录卡划掉（DELETE）           │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│  书库（数据库）                                       │
└──────────────────────────────────────────────────────┘
\`\`\`

- **Create（入库）**：管理员收到新书，先填一张登记卡（创建对象），再归档到书架（\`add\` + \`commit\`）。如果忘了归档（不 commit），书就丢了。
- **Read（查找）**：管理员翻目录卡（\`select\` + \`where\`），找到后取给读者。如果要分页显示，就像"每页 10 本"地展示目录卡（\`limit\` + \`offset\`）。
- **Update（改信息）**：读者改了手机号，管理员拿出登记卡修改（改属性），再归档（\`commit\`）。
- **Delete（淘汰）**：旧书淘汰，管理员把登记卡划掉（\`delete\` + \`commit\`）。但更稳妥的做法是标记"已下架"（软删除），书还在书架上以防万一。

> **怎么想**：为什么推荐软删除？就像图书馆不会真的把旧书烧掉，而是搬到" archived"区。数据是资产，删错了能找回。

## 十二、渐进式 Demo：完整 CRUD 实现

### Demo 1：可复用的 CRUD 函数封装

实际项目中，CRUD 代码会封装成独立模块，路由层调用。这个 Demo 展示标准的分层结构。

\`\`\`python filename="demo1_crud_module.py - 可复用 CRUD 模块"
# 这个 Demo 展示如何把 CRUD 封装成独立模块
# 运行：python demo1_crud_module.py

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, select, func, desc, or_
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, Session,
)

# ==================== 1. 模型层 ====================
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    """用户模型"""
    __tablename__ = "users"
    # 主键 id
    id: Mapped[int] = mapped_column(primary_key=True)
    # 用户名
    name: Mapped[str] = mapped_column(String(50))
    # 邮箱（唯一）
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 是否激活
    is_active: Mapped[bool] = mapped_column(default=True)
    # 是否已删除（软删除标记）
    is_deleted: Mapped[bool] = mapped_column(default=False)
    # 创建时间
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    def __repr__(self):
        return f"<User {self.name}>"

# ==================== 2. CRUD 服务层 ====================
# 把 CRUD 操作封装成类，方便管理和复用
# 定义类 UserService
class UserService:
    """用户 CRUD 服务，封装所有数据库操作。"""

    # Create：创建单个用户
    # 定义方法 create
    @staticmethod
    def create(session: Session, name: str, email: str) -> User:
        """创建用户。
        步骤：创建对象 → add → commit → refresh
        """
        # 创建 User 对象
        # 定义变量 user，赋值为 User(name=name, email=email)
        user = User(name=name, email=email)
        # add 加入会话（pending 状态）
        session.add(user)
        # commit 真正写入数据库
        session.commit()
        # refresh 从数据库重新加载（拿到自增 id）
        session.refresh(user)
        return user

    # Create：批量创建
    # 定义方法 create_batch
    @staticmethod
    def create_batch(session: Session, users_data: List[dict]) -> List[User]:
        """批量创建用户。"""
        # 列表推导式构造对象列表
        users = [User(name=d["name"], email=d["email"]) for d in users_data]
        # add_all 批量加入
        session.add_all(users)
        # 一次 commit 提交所有
        session.commit()
        # 批量 refresh
        for u in users:
            session.refresh(u)
        return users

    # Read：按 id 查单个
    # 定义方法 get_by_id
    @staticmethod
    def get_by_id(session: Session, user_id: int) -> Optional[User]:
        """按主键查用户。session.get 走缓存，比 select 更高效。"""
        # session.get 按主键查，没有返回 None
        return session.get(User, user_id)

    # Read：按邮箱查（唯一字段）
    # 定义方法 get_by_email
    @staticmethod
    def get_by_email(session: Session, email: str) -> Optional[User]:
        """按邮箱查用户。用 scalar_one_or_none 校验唯一性。"""
        # select + where 构造查询
        # 定义变量 stmt，赋值为 select(User).where(User.email == email)
        stmt = select(User).where(User.email == email)
        # scalar_one_or_none：没有返回 None，多条报错（校验唯一性）
        return session.execute(stmt).scalar_one_or_none()

    # Read：查所有（带分页 + 过滤已删除）
    # 定义方法 list_active
    @staticmethod
    def list_active(
        session: Session,
        page: int = 1,
        size: int = 10,
    ) -> dict:
        """分页查询激活用户（自动过滤软删除）。
        返回 {items, total, page, size, pages}
        """
        # 基础查询：只查未删除的
        base_stmt = select(User).where(User.is_deleted == False)
        # count 查询：统计总数
        # 定义变量 count_stmt，赋值为 select(func.count(User.id)).where(User.is_deleted == False)
        count_stmt = select(func.count(User.id)).where(User.is_deleted == False)

        # 统计总数
        # 定义变量 total，赋值为 session.execute(count_stmt).scalar()
        total = session.execute(count_stmt).scalar()
        # 计算总页数（向上取整）
        # 定义变量 pages，赋值为 (total + size - 1) // size if total else 0
        pages = (total + size - 1) // size if total else 0

        # 分页：offset + limit
        # 定义变量 offset_val，赋值为 (page - 1) * size
        offset_val = (page - 1) * size
        # 排序：按 id 倒序（新用户在前）
        stmt = (
            base_stmt
            .order_by(desc(User.id))
            .offset(offset_val)
            .limit(size)
        )
        # 执行查询
        # 定义变量 users，赋值为 session.execute(stmt).scalars().all()
        users = session.execute(stmt).scalars().all()

        # 返回分页结构
        return {
            "items": users,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
        }

    # Read：搜索（模糊匹配）
    # 定义方法 search
    @staticmethod
    def search(session: Session, keyword: str) -> List[User]:
        """按名字或邮箱搜索。"""
        # or_ 组合多个 like 条件
        # 定义变量 stmt，赋值为 select(User).where(or_(...))
        stmt = select(User).where(
            or_(
                User.name.like(f"%{keyword}%"),
                User.email.like(f"%{keyword}%"),
            )
        ).where(User.is_deleted == False)  # 过滤软删除
        return session.execute(stmt).scalars().all()

    # Update：更新单个字段
    # 定义方法 update_name
    @staticmethod
    def update_name(session: Session, user_id: int, new_name: str) -> Optional[User]:
        """更新用户名。"""
        # 先查出用户
        # 定义变量 user，赋值为 session.get(User, user_id)
        user = session.get(User, user_id)
        if not user:
            return None
        # 修改属性
        user.name = new_name
        # commit 自动生成 UPDATE
        session.commit()
        # refresh 同步
        session.refresh(user)
        return user

    # Update：批量更新（用 update 语句）
    # 定义方法 deactivate_all
    @staticmethod
    def deactivate_all(session: Session) -> int:
        """把所有用户设为未激活（批量更新）。"""
        from sqlalchemy import update
        # update 语句：一次 SQL 搞定，不加载对象
        # 定义变量 stmt，赋值为 update(User).where(User.is_active == True).values(is_active=False)
        stmt = (
            update(User)
            .where(User.is_active == True)
            .values(is_active=False)
        )
        # 执行并获取影响行数
        # 定义变量 result，赋值为 session.execute(stmt)
        result = session.execute(stmt)
        session.commit()
        # rowcount 是受影响行数
        return result.rowcount

    # Delete：硬删除（真删）
    # 定义方法 hard_delete
    @staticmethod
    def hard_delete(session: Session, user_id: int) -> bool:
        """硬删除：从数据库删除行，不可恢复。"""
        # 定义变量 user，赋值为 session.get(User, user_id)
        user = session.get(User, user_id)
        if not user:
            return False
        # session.delete 标记删除
        session.delete(user)
        # commit 真正执行 DELETE
        session.commit()
        return True

    # Delete：软删除（推荐）
    # 定义方法 soft_delete
    @staticmethod
    def soft_delete(session: Session, user_id: int) -> bool:
        """软删除：标记 is_deleted=True，行还在。"""
        # 定义变量 user，赋值为 session.get(User, user_id)
        user = session.get(User, user_id)
        if not user:
            return False
        # 只标记，不删行
        user.is_deleted = True
        session.commit()
        return True

# ==================== 3. 使用示例 ====================
# 定义函数 main()
def main():
    from sqlalchemy import create_engine
    # 创建内存数据库
    # 定义变量 engine，赋值为 create_engine("sqlite:///:memory:", echo=False)
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        # 1. 创建用户
        alice = UserService.create(session, "Alice", "alice@test.com")
        bob = UserService.create(session, "Bob", "bob@test.com")
        carol = UserService.create(session, "Carol", "carol@test.com")
        print(f"创建: {alice}, {bob}, {carol}")

        # 2. 批量创建
        batch = UserService.create_batch(session, [
            {"name": "Dave", "email": "dave@test.com"},
            {"name": "Eve", "email": "eve@test.com"},
        ])
        print(f"批量创建: {batch}")

        # 3. 按 id 查
        user = UserService.get_by_id(session, 1)
        print(f"按 id 查: {user}")

        # 4. 按邮箱查
        user = UserService.get_by_email(session, "bob@test.com")
        print(f"按邮箱查: {user}")

        # 5. 分页查询
        result = UserService.list_active(session, page=1, size=3)
        print(f"分页查询: 共 {result['total']} 条，本页 {len(result['items'])} 条")
        print(f"  总页数: {result['pages']}")

        # 6. 搜索
        found = UserService.search(session, "a")
        print(f"搜索 'a': {[u.name for u in found]}")

        # 7. 更新
        updated = UserService.update_name(session, 1, "Alice Wang")
        print(f"更新: {updated}")

        # 8. 软删除
        UserService.soft_delete(session, 2)
        # 验证：list_active 不返回已删除的
        result = UserService.list_active(session)
        print(f"软删除后剩余: {[u.name for u in result['items']]}")

if __name__ == "__main__":
    main()
\`\`\`

### Demo 2：异步 CRUD 完整实现

把上面的 CRUD 改成异步版本，适配 FastAPI async 路由。

\`\`\`python filename="demo2_async_crud.py - 异步 CRUD"
# 异步 CRUD 完整实现
# 运行：python demo2_async_crud.py

import asyncio
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, select, func, desc, or_, update
from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession, async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# ==================== 1. 模型 ====================
# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    def __repr__(self):
        return f"<User {self.name}>"

# ==================== 2. 异步引擎和会话 ====================
# 定义变量 engine，赋值为 create_async_engine("sqlite+aiosqlite:///:memory:")
engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
# 定义变量 AsyncSessionLocal，赋值为 async_sessionmaker(...)
# ★ expire_on_commit=False 异步必须
AsyncSessionLocal = async_sessionmaker(
    bind=engine, expire_on_commit=False,
)

# ==================== 3. 异步 CRUD ====================
# 定义类 AsyncUserService
class AsyncUserService:
    """异步用户 CRUD 服务。"""

    # Create：异步创建
    # 定义方法 async def create
    @staticmethod
    async def create(session: AsyncSession, name: str, email: str) -> User:
        """异步创建用户。"""
        # 创建对象
        # 定义变量 user，赋值为 User(name=name, email=email)
        user = User(name=name, email=email)
        # add（不是异步的）
        session.add(user)
        # ★ commit 必须 await
        await session.commit()
        # ★ refresh 必须 await
        await session.refresh(user)
        return user

    # Read：异步按 id 查
    # 定义方法 async def get_by_id
    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
        """异步按 id 查。"""
        # ★ get 必须 await
        return await session.get(User, user_id)

    # Read：异步查所有
    # 定义方法 async def list_all
    @staticmethod
    async def list_all(session: AsyncSession) -> List[User]:
        """异步查所有用户。"""
        # 定义变量 stmt，赋值为 select(User).order_by(desc(User.id))
        stmt = select(User).order_by(desc(User.id))
        # ★ execute 必须 await
        # 定义变量 result，赋值为 await session.execute(stmt)
        result = await session.execute(stmt)
        # scalars().all() 不是异步的
        return result.scalars().all()

    # Read：异步分页
    # 定义方法 async def list_paginated
    @staticmethod
    async def list_paginated(
        session: AsyncSession, page: int = 1, size: int = 10
    ) -> dict:
        """异步分页查询。"""
        # count 查询
        # 定义变量 count_stmt，赋值为 select(func.count(User.id))
        count_stmt = select(func.count(User.id))
        # ★ execute 必须 await
        # 定义变量 total，赋值为 (await session.execute(count_stmt)).scalar()
        total = (await session.execute(count_stmt)).scalar()

        # 分页查询
        # 定义变量 offset_val，赋值为 (page - 1) * size
        offset_val = (page - 1) * size
        stmt = (
            select(User)
            .order_by(desc(User.id))
            .offset(offset_val)
            .limit(size)
        )
        # 定义变量 result，赋值为 await session.execute(stmt)
        result = await session.execute(stmt)
        # 定义变量 users，赋值为 result.scalars().all()
        users = result.scalars().all()

        return {
            "items": users,
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size if total else 0,
        }

    # Update：异步更新
    # 定义方法 async def update_name
    @staticmethod
    async def update_name(
        session: AsyncSession, user_id: int, new_name: str
    ) -> Optional[User]:
        """异步更新用户名。"""
        # ★ get 必须 await
        # 定义变量 user，赋值为 await session.get(User, user_id)
        user = await session.get(User, user_id)
        if not user:
            return None
        # 修改属性（不是异步的）
        user.name = new_name
        # ★ commit 必须 await
        await session.commit()
        # ★ refresh 必须 await
        await session.refresh(user)
        return user

    # Delete：异步删除
    # 定义方法 async def delete
    @staticmethod
    async def delete(session: AsyncSession, user_id: int) -> bool:
        """异步删除用户。"""
        # ★ get 必须 await
        # 定义变量 user，赋值为 await session.get(User, user_id)
        user = await session.get(User, user_id)
        if not user:
            return False
        # ★ delete 必须 await
        await session.delete(user)
        # ★ commit 必须 await
        await session.commit()
        return True

# ==================== 4. 测试 ====================
# 定义函数 async def main()
async def main():
    """测试异步 CRUD。"""
    # 异步建表
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 用异步会话操作
    async with AsyncSessionLocal() as session:
        # Create
        alice = await AsyncUserService.create(session, "Alice", "alice@test.com")
        bob = await AsyncUserService.create(session, "Bob", "bob@test.com")
        print(f"✅ 创建: {alice}, {bob}")

        # Read 单个
        user = await AsyncUserService.get_by_id(session, 1)
        print(f"✅ 按 id 查: {user}")

        # Read 分页
        result = await AsyncUserService.list_paginated(session, page=1, size=10)
        print(f"✅ 分页: 共 {result['total']} 条")

        # Update
        updated = await AsyncUserService.update_name(session, 1, "Alice Wang")
        print(f"✅ 更新: {updated}")

        # Delete
        ok = await AsyncUserService.delete(session, 2)
        print(f"✅ 删除 Bob: {ok}")

        # 验证删除后
        result = await AsyncUserService.list_paginated(session)
        print(f"✅ 删除后剩余: {[u.name for u in result['items']]}")

    # 关闭引擎
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

### Demo 3：复杂查询实战（聚合 + 分组 + Having）

\`\`\`python filename="demo3_advanced_query.py - 复杂查询"
# 演示复杂查询：聚合、分组、having、子查询
# 运行：python demo3_advanced_query.py

from datetime import datetime
from typing import List
from sqlalchemy import (
    String, Integer, ForeignKey, create_engine, select, func, desc, and_,
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship, Session,
)

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Author，继承 Base
class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    # 一个作者多本书
    books: Mapped[List["Book"]] = relationship(back_populates="author")

# 定义类 Book，继承 Base
class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    price: Mapped[int] = mapped_column(Integer)  # 价格（分）
    sales: Mapped[int] = mapped_column(Integer, default=0)  # 销量
    # 外键
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    # 关系
    author: Mapped["Author"] = relationship(back_populates="books")

# 创建引擎和表
engine = create_engine("sqlite:///:memory:", echo=False)
Base.metadata.create_all(engine)

with Session(engine) as session:
    # 准备测试数据
    a1 = Author(name="鲁迅")
    a2 = Author(name="老舍")
    a3 = Author(name="莫言")
    session.add_all([a1, a2, a3])
    session.flush()  # flush 拿到 id，但还没 commit

    # 给每个作者加几本书
    session.add_all([
        Book(title="呐喊", price=2500, sales=1000, author_id=a1.id),
        Book(title="彷徨", price=3000, sales=800, author_id=a1.id),
        Book(title="朝花夕拾", price=2000, sales=1200, author_id=a1.id),
        Book(title="骆驼祥子", price=3500, sales=950, author_id=a2.id),
        Book(title="茶馆", price=2800, sales=1100, author_id=a2.id),
        Book(title="红高粱", price=4000, sales=600, author_id=a3.id),
    ])
    session.commit()

    # ===== 1. 聚合查询：统计每个作者的书籍数量和总销量 =====
    print("=== 1. 每个作者的书籍统计 ===")
    # select 多列：作者名 + 聚合结果
    # func.count 统计行数，func.sum 求和
    # 定义变量 stmt，赋值为 select(...)
    stmt = (
        select(
            Author.name,
            func.count(Book.id).label("book_count"),    # 书籍数量
            func.sum(Book.sales).label("total_sales"),   # 总销量
            func.avg(Book.price).label("avg_price"),     # 平均价格
        )
        .join(Book, Author.id == Book.author_id)  # JOIN
        .group_by(Author.id)  # 按作者分组
        .order_by(desc("total_sales"))  # 按总销量降序
    )
    # 执行查询，all() 返回 Row 列表
    for row in session.execute(stmt).all():
        print(f"  {row.name}: {row.book_count} 本, "
              f"总销量 {row.total_sales}, 均价 {row.avg_price:.0f}")

    # ===== 2. Having 过滤：只看销量超过 2000 的作者 =====
    print("\\n=== 2. 总销量超过 2000 的作者 ===")
    # having 用于分组后的过滤（where 用于分组前过滤）
    stmt = (
        select(
            Author.name,
            func.sum(Book.sales).label("total_sales"),
        )
        .join(Book)
        .group_by(Author.id)
        # having：分组后过滤，相当于 SQL 的 HAVING
        .having(func.sum(Book.sales) > 2000)
        .order_by(desc("total_sales"))
    )
    for row in session.execute(stmt).all():
        print(f"  {row.name}: 总销量 {row.total_sales}")

    # ===== 3. 子查询：找出价格高于平均值的书 =====
    print("\\n=== 3. 价格高于平均值的书 ===")
    # 子查询：先算平均价格
    # 定义变量 avg_subquery，赋值为 select(func.avg(Book.price)).scalar_subquery()
    avg_subquery = select(func.avg(Book.price)).scalar_subquery()
    # 主查询：价格 > 子查询结果
    stmt = (
        select(Book.title, Book.price)
        .where(Book.price > avg_subquery)  # 用子查询作条件
        .order_by(desc(Book.price))
    )
    for row in session.execute(stmt).all():
        print(f"  {row.title}: ¥{row.price}")

    # ===== 4. 用 relationship 的聚合查询 =====
    print("\\n=== 4. 用 relationship 查作者和所有书 ===")
    # selectinload 预加载，避免 N+1
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Author)
        .options(selectinload(Author.books))  # 预加载 books
        .order_by(Author.id)
    )
    # 定义变量 authors，赋值为 session.execute(stmt).scalars().all()
    authors = session.execute(stmt).scalars().all()
    for a in authors:
        # 不再发 SQL，books 已预加载
        total_sales = sum(b.sales for b in a.books)
        print(f"  {a.name}: {len(a.books)} 本, 总销量 {total_sales}")
\`\`\`

## 十三、动手实验：巩固理解

### 实验 1：实现一个支持软删除的 CRUD

**任务**：给 User 模型加 \`is_deleted\` 字段，所有查询自动过滤已删除的，\`delete\` 方法做软删除。

**思考题**：
1. 为什么软删除比硬删除更安全？
2. 软删除后，唯一索引（如 email）怎么处理？如果用户想用同一邮箱重新注册怎么办？

\`\`\`python filename="实验1_软删除参考.py"
# 软删除 CRUD 参考实现
from datetime import datetime
from sqlalchemy import String, Boolean, select
from sqlalchemy.orm import Session, DeclarativeBase, Mapped, mapped_column

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # 软删除标记
    is_deleted: Mapped[bool] = mapped_column(default=False)
    deleted_at: Mapped[datetime] = mapped_column(default=None, nullable=True)

# 查询时自动过滤
# 定义函数 get_active_users
def get_active_users(session: Session):
    """只查未删除的用户。"""
    # 定义变量 stmt，赋值为 select(User).where(User.is_deleted == False)
    stmt = select(User).where(User.is_deleted == False)
    return session.execute(stmt).scalars().all()

# 软删除
# 定义函数 soft_delete
def soft_delete(session: Session, user_id: int) -> bool:
    """标记删除，不真删。"""
    # 定义变量 user，赋值为 session.get(User, user_id)
    user = session.get(User, user_id)
    if not user:
        return False
    user.is_deleted = True
    user.deleted_at = datetime.now()
    session.commit()
    return True

# ★ 思考题答案：
# 1. 软删除保留了数据，删错了能恢复；硬删除数据永久丢失
# 2. 唯一索引问题：可以把 email 改成 "原邮箱_deleted_时间戳"，
#    或者用部分索引（PostgreSQL 的 WHERE NOT is_deleted）
\`\`\`

### 实验 2：实现游标分页（深分页优化）

**任务**：offset 分页在深页（如第 10000 页）性能差，请实现基于游标的分页。

**提示**：用 \`WHERE id > last_id ORDER BY id LIMIT size\` 代替 \`OFFSET\`。

\`\`\`python filename="实验2_游标分页.py"
# 游标分页：性能优于 offset 分页
from sqlalchemy import select
from sqlalchemy.orm import Session

# 定义函数 cursor_paginate
def cursor_paginate(
    session: Session,
    model,
    last_id: int = 0,    # 上一页最后一条的 id
    size: int = 10,
):
    """游标分页。
    原理：WHERE id > last_id ORDER BY id LIMIT size
    优势：不扫描跳过的行，深分页也快
    """
    # 定义变量 stmt，赋值为 select(model).where(model.id > last_id).order_by(model.id).limit(size)
    stmt = (
        select(model)
        .where(model.id > last_id)  # 从上一页最后一条之后开始
        .order_by(model.id)         # 必须按 id 排序
        .limit(size)
    )
    # 定义变量 items，赋值为 session.execute(stmt).scalars().all()
    items = session.execute(stmt).scalars().all()
    # 下一页的游标：本页最后一条的 id
    next_cursor = items[-1].id if items else None
    return {
        "items": items,
        "next_cursor": next_cursor,  # 客户端传回这个值获取下一页
        "has_more": len(items) == size,  # 是否还有更多
    }

# 使用示例：
# 第一页：cursor_paginate(session, User, last_id=0, size=10)
# 第二页：cursor_paginate(session, User, last_id=上一页的next_cursor, size=10)
\`\`\`

### 实验 3：实现乐观锁（并发更新控制）

**任务**：多个请求同时更新同一条记录，怎么防止覆盖？实现乐观锁。

\`\`\`python filename="实验3_乐观锁.py"
# 乐观锁：用 version 字段防止并发覆盖
from sqlalchemy import String, Integer, select
from sqlalchemy.orm import Session, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.exc import StaleDataError

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 Product，继承 Base
class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    # 乐观锁版本号
    version: Mapped[int] = mapped_column(Integer, default=1)

# 定义函数 update_stock
def update_stock(session: Session, product_id: int, delta: int) -> bool:
    """乐观锁更新库存。
    原理：UPDATE 时带 version 条件，version 不匹配说明被别人改过。
    """
    # 先查出当前版本
    # 定义变量 product，赋值为 session.get(Product, product_id)
    product = session.get(Product, product_id)
    if not product:
        return False
    # 记录当前 version
    current_version = product.version
    # 修改库存和版本
    product.stock += delta
    product.version += 1
    # ★ 关键：用 update 语句带 version 条件
    from sqlalchemy import update
    # 定义变量 stmt，赋值为 update(Product).where(Product.id == product_id, Product.version == current_version).values(...)
    stmt = (
        update(Product)
        .where(
            Product.id == product_id,
            Product.version == current_version,  # ★ version 必须匹配
        )
        .values(stock=product.stock, version=product.version)
    )
    # 执行
    # 定义变量 result，赋值为 session.execute(stmt)
    result = session.execute(stmt)
    session.commit()
    # rowcount=0 说明 version 不匹配，被别人改过了
    if result.rowcount == 0:
        print("⚠️ 并发冲突：数据已被其他请求修改")
        return False
    return True
\`\`\`

## 十四、常见错误补充

**错误 5：用 update 语句忘了 commit**

\`\`\`python filename="错误：update 不 commit"
# ❌ 错误：执行 update 语句后不 commit
# session.execute(update(User).where(...).values(...))
# 忘了 commit，数据没更新

# ✅ 正确：update 后必须 commit
# session.execute(update(User).where(...).values(...))
# session.commit()
\`\`\`

**错误 6：在循环里 commit**

\`\`\`python filename="错误：循环 commit"
# ❌ 错误：每次循环都 commit，性能极差（每次 commit 都是一次磁盘同步）
# for i in range(1000):
#     session.add(User(name=f"user_{i}"))
#     session.commit()  # ❌ 1000 次 commit

# ✅ 正确：批量 add，最后一次 commit
# for i in range(1000):
#     session.add(User(name=f"user_{i}"))
# session.commit()  # ✅ 1 次 commit
\`\`\`

**错误 7：查询时忘了过滤软删除**

\`\`\`python filename="错误：软删除过滤遗漏"
# ❌ 错误：查询忘了加 is_deleted == False
# users = session.execute(select(User)).scalars().all()  # 返回已删除的

# ✅ 正确：所有查询都加过滤
# users = session.execute(
#     select(User).where(User.is_deleted == False)
# ).scalars().all()
\`\`\`

**错误 8：N+1 的变体——循环里查关联**

\`\`\`python filename="错误：N+1 变体"
# ❌ 错误：循环里查关联对象
# posts = session.execute(select(Post)).scalars().all()
# for p in posts:
#     author = session.get(User, p.author_id)  # ❌ 每次循环 1 次 SQL

# ✅ 正确：用 selectinload 预加载
# stmt = select(Post).options(selectinload(Post.author))
# posts = session.execute(stmt).scalars().all()
# for p in posts:
#     author = p.author  # ✅ 不发 SQL
\`\`\`

## 十五、本章小结

- **Create**：\`add\` → \`commit\` → \`refresh\`。批量用 \`add\_all\`。
- **Read**：\`select()\` 构造查询，\`where\` 过滤，\`order\_by\` 排序，\`offset+limit\` 分页。\`scalar\_one\_or\_none\` 查单条，\`all\` 查列表。
- **Update**：单条用"修改属性 + commit"，批量用 \`update()\` 语句。
- **Delete**：单条用 \`session.delete()\`，批量用 \`delete()\` 语句。生产推荐软删除。
- **关联查询**：\`joinedload\`（多对一）、\`selectinload\`（一对多）避免 N+1。
- **事务**：\`commit\` 提交，\`rollback\` 回滚，\`begin\_nested\` 嵌套事务。异常必回滚。
- **完整 API**：分页（offset+limit）、搜索（like+or\_）、排序（order\_by）、统计（func.count）组合使用。

下一章学习 Alembic 数据库迁移：怎么把模型变更安全地应用到生产数据库。
`
  },

  // =========================================================
  // 第四章：Alembic 数据库迁移
  // =========================================================
  {
    id: "fa-alembic",
    group: "数据库集成",
    icon: "🚀",
    title: "Alembic 数据库迁移",
    content: `

# Alembic 数据库迁移

## 一、开篇：为什么需要数据库迁移

到目前为止，我们用 \`Base.metadata.create_all(engine)\` 建表。这在开发期够用，但生产环境有致命问题：

1. **改字段怎么办**：用户表加了 \`phone\` 列，\`create_all\` 只建新表，不会 \`ALTER\` 已有表。生产数据库的 users 表还是老结构。
2. **多环境同步**：开发机加了字段，测试环境、生产环境怎么同步？手动执行 SQL？容易漏。
3. **回滚怎么办**：上线后发现新字段有问题，怎么撤销？手动 \`DROP COLUMN\`？风险极大。
4. **团队协作**：A 改了模型，B 拉代码后怎么知道要改数据库？

**数据库迁移工具**解决这些问题：它把"模型变更"记录成版本化的脚本，每个脚本对应一次数据库结构变更。你可以顺序执行（升级）或逆序执行（回滚），团队共享同一套迁移历史。

Alembic 是 SQLAlchemy 官方的迁移工具，和 ORM 模型无缝集成。这一章我们从零搭一套迁移流程。

## 二、Alembic 是什么：迁移工具的核心思想

Alembic 的工作原理：

\`\`\`txt filename="Alembic 工作流"
┌──────────────┐    对比差异     ┌──────────────┐    生成    ┌──────────────┐
│  模型定义     │ ─────────────→ │  Alembic     │ ────────→ │  迁移脚本     │
│  models.py   │   (autogenerate)│  (env.py)    │            │  versions/   │
└──────────────┘                 └──────────────┘            └──────────────┘
                                                                │
                                                                ↓ 执行
┌──────────────┐    记录版本     ┌──────────────┐
│  数据库      │ ←───────────── │  alembic_    │
│  schema      │                │  version 表  │
└──────────────┘                 └──────────────┘
\`\`\`

核心概念：

- **迁移脚本（revision）**：一个 Python 文件，定义 \`upgrade()\`（升级）和 \`downgrade()\`（回滚）两个函数。
- **版本表（alembic\_version）**：数据库里一张表，记录当前数据库在哪个版本。
- **autogenerate**：Alembic 对比模型和数据库，自动生成迁移脚本（不是 100% 准确，要人工核对）。
- **upgrade / downgrade**：执行升级或回滚，更新版本表。

## 三、安装与初始化：alembic init

\`\`\`bash filename="安装 Alembic"
# 安装 alembic（通常和 SQLAlchemy 一起装）
# pip install alembic
\`\`\`

\`\`\`bash filename="初始化 Alembic"
# 在项目根目录执行
# alembic init alembic
# 这会创建：
#   alembic.ini          - 配置文件
#   alembic/             - 迁移目录
#     env.py             - 迁移环境配置（核心）
#     script.py.mako     - 迁移脚本模板
#     versions/          - 迁移脚本存放目录（初始为空）
\`\`\`

初始化后的目录结构：

\`\`\`txt filename="项目结构"
project/
├── alembic.ini          # Alembic 配置
├── alembic/
│   ├── env.py           # 环境配置（要改）
│   ├── script.py.mako   # 模板（一般不改）
│   └── versions/        # 迁移脚本
├── models.py            # 你的模型定义
└── main.py              # FastAPI 应用
\`\`\`

## 四、alembic.ini 配置

\`alembic.ini\` 是主配置文件，最关键是 \`sqlalchemy.url\`（数据库连接字符串）。

\`\`\`ini filename="alembic.ini 关键配置"
# Alembic 配置文件

[alembic]
# 迁移脚本目录
# script_location = alembic

# 数据库连接字符串（生产建议从环境变量读，见后文）
# sqlalchemy.url = sqlite:///./blog.db

# 迁移脚本命名模板：日期_版本号_描述.py
# file_template = %%(year)d_%%(month).2d_%%(day).2d_%%(hour).2d%%(minute).2d-%%(rev)s_%%(slug)s

# 时区
# timezone = Asia/Shanghai

[post_write_hooks]
# 可选：生成后自动格式化（需要装 black）
# hooks = black
# black.type = console_scripts
# black.entrypoint = black
# black.options = -l 88 REVISION_SCRIPT_FILENAME

# 日志配置（一般用默认）
[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
\`\`\`

> **避坑**：\`alembic.ini\` 里的 \`sqlalchemy.url\` 硬编码密码不安全。生产环境在 \`env.py\` 里从环境变量读，覆盖 ini 的值（见后文）。

## 五、env.py 配置：导入 Base.metadata

\`env.py\` 是 Alembic 的核心，它告诉 Alembic"我的模型在哪"。**这是新手最容易踩坑的地方**。

\`\`\`python filename="alembic/env.py - 完整配置"
# 从 logging 导入 basicConfig
from logging.config import fileConfig
# 从 sqlalchemy 导入 engine_from_config, pool
from sqlalchemy import engine_from_config, pool
# 从 alembic 导入 context
from alembic import context

# 导入你的 Base 和所有模型
# ★ 关键：必须导入所有模型，否则 metadata 不知道有这些表
# 假设你的模型在项目根目录的 models.py
import sys
import os
# 把项目根目录加入 sys.path，让 env.py 能 import models
# 定义变量 sys.path，赋值为 [os.path.dirname(os.path.dirname(__file__))] + sys.path
sys.path = [os.path.dirname(os.path.dirname(__file__))] + sys.path

# 导入 Base（模型基类）
from models import Base
# ★ 显式导入所有模型类，触发它们注册到 Base.metadata
# 即使代码里没直接用到，也要 import，否则 autogenerate 漏表
from models import User, Post, Comment, Tag  # 列举你的所有模型

# Alembic 配置对象
# 定义变量 config，赋值为 context.config
config = context.config

# 从环境变量覆盖数据库连接（生产推荐）
# 定义变量 db_url，赋值为 os.getenv("DATABASE_URL")
db_url = os.getenv("DATABASE_URL")
if db_url:
    # 覆盖 alembic.ini 里的 sqlalchemy.url
    config.set_main_option("sqlalchemy.url", db_url)

# 日志配置
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ★ target_metadata：告诉 Alembic 这是"目标 schema"
# autogenerate 会对比这个 metadata 和数据库，生成差异脚本
# 定义变量 target_metadata，赋值为 Base.metadata
target_metadata = Base.metadata

# 定义函数 run_migrations_offline
def run_migrations_offline() -> None:
    """离线模式：只生成 SQL，不连数据库。
    适用场景：在没数据库的环境下预览迁移 SQL，或把 SQL 交给 DBA 手动执行。
    """
    # 从配置取连接字符串（仅用于推断 SQL 方言，不真连）
    url = config.get_main_option("sqlalchemy.url")
    # 构造迁移上下文
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,  # 把参数绑定为字面量（如 :name → 'alice'），方便看完整 SQL
        dialect_opts={"paramstyle": "named"},  # 用命名参数风格（:name 而不是 ?）
    )
    # 执行迁移（在事务中跑，保证原子性）
    with context.begin_transaction():
        context.run_migrations()

# 定义函数 run_migrations_online
def run_migrations_online() -> None:
    """在线模式：连数据库执行迁移。
    适用场景：开发/测试/生产环境实际执行迁移脚本。
    """
    # 创建引擎
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),  # 从 alembic.ini 读 [alembic] 段
        prefix="sqlalchemy.",  # 配置项前缀，让 engine_from_config 识别 sqlalchemy.xxx
        poolclass=pool.NullPool,  # 迁移时不用连接池（短连接），避免迁移期间占用连接
    )
    # 用连接执行迁移
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # 比较类型（默认 False，建议开）
            # 开启后能检测 String(50) → String(100) 这类类型变化
            compare_type=True,
            # 比较服务器默认值
            # 开启后能检测 server_default 的变化（如 DEFAULT 0 → DEFAULT 1）
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

# 根据模式执行：alembic 命令行会通过环境变量告诉 context 当前是哪种模式
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
\`\`\`

**关键点详解**：

1. **\`target_metadata = Base.metadata\`**：这是核心。Alembic 对比 \`metadata\`（模型的表结构）和数据库的实际结构，生成差异脚本。
2. **导入所有模型**：如果只 \`from models import Base\` 而不 import 具体模型类，\`metadata\` 是空的（模型类没被实例化，没注册到 metadata）。autogenerate 会以为"没有任何表"，生成"删除所有表"的灾难性脚本。
3. **\`compare\_type=True\`**：默认 Alembic 不比较列类型变化（比如 String(50) 改成 String(100) 不检测）。开了才检测。
4. **\`compare\_server\_default=True\`**：检测默认值变化。

> **避坑**：env.py 里 \`import models\` 后，\`models.py\` 里的所有 \`class XXX(Base)\` 都会被执行，注册到 \`Base.metadata\`。如果模型分散在多个文件（\`models/user.py\`、\`models/post.py\`），要在 env.py 全部 import，或用 \`models/__init__.py\` 统一导出。

## 六、生成迁移脚本：alembic revision --autogenerate

配置好 env.py 后，就能自动生成迁移脚本了。

\`\`\`bash filename="自动生成迁移脚本"
# 先确保数据库是空的（或和模型同步的）
# 然后执行 autogenerate

# alembic revision --autogenerate -m "描述信息"
# alembic revision --autogenerate -m "create users and posts tables"
\`\`\`

执行后会在 \`alembic/versions/\` 生成一个脚本：

\`\`\`python filename="alembic/versions/20240101_abcdef_create_tables.py"
"""create users and posts tables

Revision ID: abcdef123456
Revises:
Create Date: 2024-01-01 12:00:00
"""
# 导入类型
from typing import Sequence, Union
# 从 alembic 导入 op（操作 API）
from alembic import op
# 导入 sa（SQLAlchemy 别名）
import sqlalchemy as sa

# 版本号：当前迁移的唯一标识（自动生成的 12 位 hex）
revision: str = 'abcdef123456'
# 上一个版本（首迁移是 None，表示这是第一个迁移）
# 链条通过 down_revision 串起来：None → abc123 → def456 → ...
down_revision: Union[str, None] = None
# 分支标签：多分支开发时用，一般不用
branch_labels: Union[str, Sequence[str], None] = None
# 依赖：声明本迁移依赖的其他迁移（跨分支时用）
depends_on: Union[str, Sequence[str], None] = None

# 定义函数 upgrade
def upgrade() -> None:
    """升级：创建表。
    alembic upgrade head 时会执行这个函数。
    """
    # op.create_table 创建 users 表
    # op 是 Alembic 的操作 API，封装了 DDL 操作
    op.create_table(
        'users',
        # sa.Column(列名, 类型, 约束)：定义列
        # primary_key=True：主键
        sa.Column('id', sa.Integer(), primary_key=True),
        # nullable=False：NOT NULL 约束
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('email', sa.String(120), nullable=False),
        # server_default=sa.func.now()：数据库端默认值 NOW()
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    # 创建索引：op.create_index(索引名, 表名, 列列表, unique=是否唯一)
    # unique=True 创建唯一索引，防止邮箱重复
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 创建 posts 表
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        # ForeignKeyConstraint：外键约束
        # 第一个列表是本表的列，第二个列表是引用表的列
        sa.ForeignKeyConstraint(['author_id'], ['users.id']),
    )

# 定义函数 downgrade
def downgrade() -> None:
    """回滚：删除表。
    alembic downgrade -1 时会执行这个函数。
    注意删除顺序：先删依赖表（posts），再删被依赖表（users）
    """
    op.drop_table('posts')
    op.drop_table('users')
\`\`\`

**autogenerate 不是万能的**，它检测不到：

- **字段重命名**：\`name\` 改成 \`username\`，autogenerate 看成"删 name 列 + 加 username 列"，数据会丢。
- **数据迁移**：把某列的值转换格式，autogenerate 不管数据。
- **约束改名**：索引、约束改名检测不到。
- **Check 约束**：某些 Check 约束变化检测不到。

所以**生成后必须人工核对**，特别是 \`upgrade()\` 和 \`downgrade()\` 是否对称。

## 七、执行迁移：alembic upgrade

\`\`\`bash filename="执行迁移"
# 升级到最新版本
# alembic upgrade head

# 升级到指定版本
# alembic upgrade abcdef123456

# 升级 +n 个版本
# alembic upgrade +2

# 查看当前版本
# alembic current

# 查看迁移历史
# alembic history
\`\`\`

\`alembic upgrade head\` 会：

1. 读取 \`alembic\_version\` 表，知道当前在哪个版本。
2. 从当前版本到 \`head\`，依次执行每个迁移脚本的 \`upgrade()\`。
3. 每执行一个，更新 \`alembic\_version\` 表。

## 八、回滚迁移：alembic downgrade

\`\`\`bash filename="回滚迁移"
# 回滚一个版本
# alembic downgrade -1

# 回滚到指定版本
# alembic downgrade abcdef123456

# 回滚到最初（删除所有表）
# alembic downgrade base

# 回滚 +n 个版本
# alembic downgrade -2
\`\`\`

\`downgrade\` 执行的是迁移脚本的 \`downgrade()\` 函数，撤销 \`upgrade()\` 的变更。

> **避坑**：\`downgrade\` 必须和 \`upgrade\` 对称。如果 \`upgrade\` 加了一列，\`downgrade\` 必须删这列。否则版本表和数据库结构不一致。autogenerate 生成的脚本一般是对称的，但手写脚本要注意。

## 九、迁移历史查看

\`\`\`bash filename="查看迁移状态"
# 查看当前数据库在哪个版本
# alembic current

# 查看所有迁移历史（从旧到新）
# alembic history

# 查看历史（带详细信息）
# alembic history --verbose

# 查看指定版本的详情
# alembic show abcdef123456

# 查看待执行的迁移（还没 apply 的）
# alembic heads   # 查看所有 head（正常只有一个）
# alembic current # 当前版本
\`\`\`

## 十、手写迁移脚本：处理 autogenerate 搞不定的场景

有些变更 autogenerate 检测不到，需要手写迁移脚本。

\`\`\`bash filename="手写迁移"
# 创建空迁移脚本（只有框架，自己填 upgrade/downgrade）
# alembic revision -m "rename name to username"
\`\`\`

\`\`\`python filename="手写迁移：字段重命名"
"""rename name to username

Revision ID: fedcba654321
Revises: abcdef123456
Create Date: 2024-01-02 12:00:00
"""
# 从 typing 导入 Sequence, Union
from typing import Sequence, Union
# 从 alembic 导入 op
from alembic import op
# 导入 sa
import sqlalchemy as sa

revision: str = 'fedcba654321'
# down_revision 指向上一个版本，串联迁移链条
# 这里指向 abcdef123456，表示在它之后执行
down_revision: Union[str, None] = 'abcdef123456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 定义函数 upgrade
def upgrade() -> None:
    """升级：把 name 列改名为 username。
    为什么不能让 autogenerate 自动生成？
    因为 autogenerate 会看成"删 name + 加 username"，数据会丢。
    手写 alter_column 只改列名，数据保留。
    """
    # op.alter_column 改列定义（改名、改类型、改约束都能用）
    # 参数：表名, 旧列名, new_column_name=新列名, existing_type=原类型
    # existing_type 必填，告诉 Alembic 当前列的类型
    op.alter_column('users', 'name', new_column_name='username',
                    existing_type=sa.String(50))

# 定义函数 downgrade
def downgrade() -> None:
    """回滚：把 username 改回 name。
    downgrade 必须和 upgrade 严格对称，否则版本链会乱。
    """
    op.alter_column('users', 'username', new_column_name='name',
                    existing_type=sa.String(50))
\`\`\`

\`\`\`python filename="手写迁移：数据迁移"
"""migrate status from string to int

把 status 列从字符串('active','inactive')转成整数(1, 0)
"""
# 从 typing 导入 Sequence, Union
from typing import Sequence, Union
# 从 alembic 导入 op
from alembic import op
# 导入 sa
import sqlalchemy as sa

revision: str = '1234567890ab'
down_revision: Union[str, None] = 'fedcba654321'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 定义函数 upgrade
def upgrade() -> None:
    """升级：status 字符串转整数。
    分四步走，每步都安全可回滚：
    1. 加新列（可空，避免 NOT NULL 约束失败）
    2. 回填数据（CASE WHEN 转换）
    3. 删旧列
    4. 新列改名 + 加约束
    """
    # 第一步：加新列 status_new，类型 Integer，可空
    # 先用可空避免 NOT NULL 约束失败（旧数据还没填）
    op.add_column('users', sa.Column('status_new', sa.Integer(), nullable=True))
    # 第二步：用原生 SQL 迁移数据
    # CASE WHEN ... THEN ... ELSE ... END：条件表达式
    # 'active' → 1，其他 → 0
    op.execute("UPDATE users SET status_new = CASE WHEN status = 'active' THEN 1 ELSE 0 END")
    # 第三步：删旧列 status（数据已迁移到 status_new）
    op.drop_column('users', 'status')
    # 第四步：新列改名 status_new → status
    # 同时加 NOT NULL 约束和默认值 0
    op.alter_column('users', 'status_new', new_column_name='status',
                    existing_type=sa.Integer(), nullable=False, server_default='0')

# 定义函数 downgrade
def downgrade() -> None:
    """回滚：status 整数转字符串。
    和 upgrade 严格对称，只是方向相反。
    """
    op.add_column('users', sa.Column('status_old', sa.String(20), nullable=True))
    # 反向转换：1 → 'active'，其他 → 'inactive'
    op.execute("UPDATE users SET status_old = CASE WHEN status = 1 THEN 'active' ELSE 'inactive' END")
    op.drop_column('users', 'status')
    op.alter_column('users', 'status_old', new_column_name='status',
                    existing_type=sa.String(20), nullable=False, server_default='inactive')
\`\`\`

## 十一、实战：博客系统完整迁移流程

把博客系统从零搭起来，走完整迁移流程。

**步骤 1：项目结构**

\`\`\`txt filename="项目结构"
blog/
├── alembic.ini
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── models.py          # 模型
├── database.py        # 引擎配置
└── main.py            # FastAPI 应用
\`\`\`

**步骤 2：定义模型**

\`\`\`python filename="blog/models.py"
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional, List
from typing import Optional, List
# 从 sqlalchemy 导入各种类型
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey, Table, Index
# 从 sqlalchemy.orm 导入声明式构件
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 多对多关联表
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)
# 用 __import__ 避免重复导入问题，实际写 from sqlalchemy import Column
# 这里简化演示，正式代码用：
from sqlalchemy import Column

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    posts: Mapped[List["Post"]] = relationship(back_populates="author")

# 定义类 Post，继承 Base
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(default=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    author: Mapped["User"] = relationship(back_populates="posts")
    tags: Mapped[List["Tag"]] = relationship(secondary=post_tags, back_populates="posts")

# 定义类 Tag，继承 Base
class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    posts: Mapped[List["Post"]] = relationship(secondary=post_tags, back_populates="tags")
\`\`\`

**步骤 3：初始化 Alembic**

\`\`\`bash filename="初始化"
# 进入项目目录
# cd blog

# 初始化 Alembic
# alembic init alembic
\`\`\`

**步骤 4：配置 alembic.ini**

\`\`\`ini filename="alembic.ini 片段"
[alembic]
# script_location = alembic
# 先用 SQLite 测试，生产在 env.py 里用环境变量覆盖
# sqlalchemy.url = sqlite:///./blog.db
\`\`\`

**步骤 5：配置 env.py（见前文）**

\`\`\`python filename="env.py 关键片段"
# 导入 sys, os
import sys, os
# 把项目根加入 path
sys.path = [os.path.dirname(os.path.dirname(__file__))] + sys.path

# 导入 Base 和所有模型
from models import Base, User, Post, Tag

# 定义变量 target_metadata，赋值为 Base.metadata
target_metadata = Base.metadata

# 从环境变量覆盖连接
db_url = os.getenv("DATABASE_URL")
if db_url:
    # 覆盖配置
    config.set_main_option("sqlalchemy.url", db_url)
\`\`\`

**步骤 6：生成首个迁移**

\`\`\`bash filename="生成首个迁移"
# 确保数据库是空的
# rm -f blog.db  # 删旧库（仅开发期）

# 自动生成迁移
# alembic revision --autogenerate -m "create initial tables"
# 输出：Generating /path/to/alembic/versions/xxx_create_initial_tables.py
\`\`\`

**步骤 7：核对迁移脚本**

\`\`\`python filename="核对生成的脚本"
# 打开生成的脚本，检查 upgrade() 和 downgrade()
# 确保：
# 1. 所有表都创建了（users, posts, tags, post_tags）
# 2. 所有列、外键、索引都在
# 3. downgrade() 能撤销 upgrade()
# 如果有问题，手动修改
\`\`\`

**步骤 8：执行迁移**

\`\`\`bash filename="执行迁移"
# 升级到最新
# alembic upgrade head
# 输出：Running upgrade  -> abc123, create initial tables

# 验证：查看当前版本
# alembic current
# 输出：abc123 (head)

# 验证：表已创建（用 sqlite3 命令或 DB 工具）
# sqlite3 blog.db ".tables"
# 输出：alembic_version  post_tags  posts  tags  users
\`\`\`

**步骤 9：修改模型 + 生成新迁移**

\`\`\`python filename="给 User 加 phone 列"
# 修改 models.py，给 User 加一列
# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # ★ 新增 phone 列
    phone: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    is_admin: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
\`\`\`

\`\`\`bash filename="生成并执行新迁移"
# 生成迁移
# alembic revision --autogenerate -m "add phone to users"
# 检查脚本：upgrade() 应该是 op.add_column('users', sa.Column('phone', ...))

# 执行迁移
# alembic upgrade head
# 输出：Running upgrade abc123 -> def456, add phone to users
\`\`\`

**步骤 10：回滚迁移**

\`\`\`bash filename="回滚"
# 发现 phone 列有问题，回滚一个版本
# alembic downgrade -1
# 输出：Running downgrade def456 -> abc123

# 验证：phone 列已删除
# alembic current  # 输出：abc123 (head)
\`\`\`

## 十二、常见迁移问题与避坑指南

**问题 1：autogenerate 生成"删除所有表"**

\`\`\`python filename="错误：没导入模型"
# ❌ 错误：env.py 只 import Base，没 import 具体模型
# from models import Base
# target_metadata = Base.metadata
# 此时 metadata 是空的，autogenerate 以为要删所有表

# ✅ 正确：导入所有模型
# from models import Base, User, Post, Tag
# target_metadata = Base.metadata
\`\`\`

**问题 2：字段重命名导致数据丢失**

\`\`\`python filename="错误：autogenerate 重命名"
# 模型把 name 改成 username
# autogenerate 生成：
#   upgrade: op.drop_column('users', 'name'); op.add_column('users', sa.Column('username', ...))
#   → 数据丢了！

# ✅ 正确：手写迁移，用 alter_column 改名
# def upgrade():
#     op.alter_column('users', 'name', new_column_name='username', existing_type=sa.String(50))
\`\`\`

**问题 3：空迁移（autogenerate 没检测到变化）**

\`\`\`bash filename="问题：autogenerate 空"
# 改了模型的 server_default，autogenerate 没生成迁移
# 原因：env.py 没开 compare_server_default

# ✅ 解决：env.py 里开 compare_type 和 compare_server_default
# context.configure(
#     connection=connection,
#     target_metadata=target_metadata,
#     compare_type=True,
#     compare_server_default=True,
# )
\`\`\`

**问题 4：多个 head（分叉）**

\`\`\`bash filename="问题：多 head"
# 团队协作时，两人各自基于同一版本写了迁移，出现两个 head
# alembic heads
# 输出两个 head

# ✅ 解决：合并（merge）
# alembic merge -m "merge two heads" head1 head2
# 生成一个 merge 迁移，down_revision 指向两个 head
\`\`\`

**问题 5：生产环境迁移大表锁表**

\`\`\`python filename="问题：大表 ALTER 锁表"
# MySQL 给大表加列会锁表，影响线上服务

# ✅ 解决 1：用 pt-online-schema-change（MySQL 工具）在线改表
# ✅ 解决 2：分步迁移
#   第一步：加可空列（不锁）
#   第二步：业务代码写入新列
#   第三步：回填数据
#   第四步：改 NOT NULL
# ✅ 解决 3：PostgreSQL 用 CREATE INDEX CONCURRENTLY（在迁移里用 op.execute）
\`\`\`

**问题 6：迁移脚本顺序错乱**

\`\`\`bash filename="问题：down_revision 错"
# 手动改了脚本，down_revision 指向不存在的版本
# alembic upgrade head 报错

# ✅ 解决：检查每个脚本的 revision 和 down_revision，确保链条完整
# alembic history  # 查看完整链条
\`\`\`

## 十三、生产环境最佳实践

1. **迁移脚本要 review**：autogenerate 后必须人工核对，特别是 \`downgrade()\`。
2. **先备份再迁移**：生产环境执行迁移前，备份数据库。
3. **小步迁移**：一次迁移只做一件事（加一列、改一个类型），别一个大迁移改十处。
4. **数据迁移单独脚本**：结构变更和数据迁移分开，便于回滚。
5. **测试环境先跑**：迁移先在测试环境跑一遍，确认没问题再上生产。
6. **CI 集成**：CI 流程里加 \`alembic upgrade head\`，确保迁移脚本可用。
7. **环境变量管理连接**：\`alembic.ini\` 不硬编码密码，从环境变量读。
8. **别删旧迁移脚本**：已执行的迁移脚本不要删，否则历史链条断裂，新环境无法重建。
9. **downgrade 要可逆**：每个 \`upgrade()\` 都要有对应 \`downgrade()\`，确保能回滚。

## 十四、生活类比：数据库迁移像房屋装修

理解 Alembic 最好的方式是把它比作**房屋装修管理**。

\`\`\`txt filename="Alembic = 装修版本管理"
┌──────────────────────────────────────────────────────┐
│  设计图（models.py）                                  │
│   业主想加一个阳台 → 改设计图                          │
└──────────────────────────────────────────────────────┘
                       ↓ 对比差异
┌──────────────────────────────────────────────────────┐
│  装修方案（迁移脚本）                                 │
│   方案 1: 建阳台（upgrade）                           │
│   方案 2: 拆阳台（downgrade，回滚用）                 │
│   每个方案都有编号，按顺序执行                         │
└──────────────────────────────────────────────────────┘
                       ↓ 执行
┌──────────────────────────────────────────────────────┐
│  实际房屋（数据库）                                    │
│   alembic_version 表 = 装修进度表                     │
│   记录当前执行到哪个方案                              │
└──────────────────────────────────────────────────────┘
\`\`\`

- **设计图（models.py）**：业主（开发者）想要什么结构，画在设计图上（改模型）。
- **装修方案（迁移脚本）**：装修公司（Alembic）对比设计图和实际房屋，生成施工方案（\`upgrade\`），同时准备撤销方案（\`downgrade\`）。
- **施工进度表（alembic\_version）**：每个方案有编号，按顺序执行。进度表记录"当前装修到第几号方案"。
- **回滚（downgrade）**：阳台漏水了？按撤销方案拆掉，回到上一个版本。

**为什么不直接改房屋（手动 ALTER TABLE）**：

1. **没记录**：直接改了房屋，没人知道改了什么。Alembic 把每次变更记成脚本，团队共享。
2. **没法回滚**：直接拆了墙，想装回去很难。Alembic 的 \`downgrade\` 能精确撤销。
3. **多套房子不同步**：开发房、测试房、生产房，怎么保证结构一致？Alembic 用同一套脚本，按版本号同步。

> **怎么想**：迁移脚本就像 Git 的 commit。每次模型变更都是一次"提交"，\`upgrade head\` 是 \`git pull\`，\`downgrade -1\` 是 \`git revert\`。

## 十五、渐进式 Demo：从零走通 Alembic

### Demo 1：最小可运行的 Alembic 流程

这个 Demo 用一个最简单的模型，完整走一遍 Alembic 流程：初始化 → 配置 → 生成迁移 → 执行 → 验证。

\`\`\`bash filename="Demo 1：完整流程命令"
# 1. 创建项目目录
# mkdir alembic_demo && cd alembic_demo

# 2. 创建虚拟环境并安装依赖
# python -m venv venv
# source venv/bin/activate  # Windows: venv\\Scripts\\activate
# pip install sqlalchemy alembic

# 3. 创建模型文件
# vim models.py（内容见下面）

# 4. 初始化 Alembic
# alembic init alembic
# 这会创建：
#   alembic.ini
#   alembic/
#     env.py
#     script.py.mako
#     versions/

# 5. 配置 alembic.ini（改 sqlalchemy.url）
# vim alembic.ini
# 找到 sqlalchemy.url，改成：
# sqlalchemy.url = sqlite:///./demo.db

# 6. 配置 env.py（导入模型）
# vim alembic/env.py
# 在文件顶部加：
#   import sys, os
#   sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
#   from models import Base, User
# 改 target_metadata：
#   target_metadata = Base.metadata

# 7. 生成首个迁移脚本
# alembic revision --autogenerate -m "create users table"
# 输出：Generating alembic/versions/xxx_create_users_table.py

# 8. 检查生成的脚本
# vim alembic/versions/xxx_create_users_table.py
# 确认 upgrade() 创建了 users 表

# 9. 执行迁移
# alembic upgrade head
# 输出：Running upgrade  -> xxx, create users table

# 10. 验证
# sqlite3 demo.db ".tables"
# 输出：alembic_version  users
# （alembic_version 是 Alembic 自己的版本表，users 是我们建的）

# 11. 查看当前版本
# alembic current
# 输出：xxx (head)

# 12. 修改模型（加字段）
# vim models.py，给 User 加 phone 字段

# 13. 生成新迁移
# alembic revision --autogenerate -m "add phone to users"

# 14. 执行迁移
# alembic upgrade head
# 输出：Running upgrade xxx -> yyy, add phone to users

# 15. 验证字段已加
# sqlite3 demo.db "PRAGMA table_info(users)"
# 输出：0|id|INTEGER|1||1  1|name|VARCHAR(50)|1||0  2|phone|VARCHAR(20)|0||0

# 16. 回滚迁移
# alembic downgrade -1
# 输出：Running downgrade yyy -> xxx, add phone to users

# 17. 验证字段已删
# sqlite3 demo.db "PRAGMA table_info(users)"
# 输出：0|id|INTEGER|1||1  1|name|VARCHAR(50)|1||0  （没有 phone 了）
\`\`\`

配套的 \`models.py\`：

\`\`\`python filename="models.py - 最简模型"
# 最简模型，用于 Alembic Demo
from datetime import datetime
from typing import Optional
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    pass

# 定义类 User，继承 Base
class User(Base):
    __tablename__ = "users"
    # 主键
    id: Mapped[int] = mapped_column(primary_key=True)
    # 用户名
    name: Mapped[str] = mapped_column(String(50))
    # 邮箱（唯一）
    email: Mapped[str] = mapped_column(String(120), unique=True)
    # ★ 第二步会加这个字段（先注释掉）
    # phone: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    # 创建时间
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
\`\`\`

### Demo 2：完整迁移脚本解析

下面是一个完整的迁移脚本，详细注释每个部分的作用。

\`\`\`python filename="alembic/versions/完整迁移脚本示例.py"
# 这是 Alembic 自动生成的迁移脚本模板
# 文件名格式：日期_版本号_描述.py

"""create users and posts tables

Revision ID: a1b2c3d4e5f6
Revises:                    # 上一个版本（首迁移是空）
Create Date: 2024-01-01 12:00:00
"""

# 1. 导入类型和工具
# 从 typing 导入 Sequence, Union（类型注解）
from typing import Sequence, Union
# 从 alembic 导入 op（操作 API，核心）
from alembic import op
# 导入 sa（SQLAlchemy 别名，用于定义列类型）
import sqlalchemy as sa

# 2. 版本信息（Alembic 用这些维护版本链）
# revision：当前迁移的唯一 ID（12 位 hex）
revision: str = 'a1b2c3d4e5f6'
# down_revision：上一个版本的 ID（首迁移是 None）
# Alembic 通过 down_revision 把迁移串成链条：None → a1b2 → c3d4 → ...
down_revision: Union[str, None] = None
# branch_labels：分支标签（多分支开发时用，一般不用）
branch_labels: Union[str, Sequence[str], None] = None
# depends_on：依赖的其他迁移（跨分支时用，一般不用）
depends_on: Union[str, Sequence[str], None] = None

# 3. upgrade 函数：升级时执行
# 定义函数 upgrade()
def upgrade() -> None:
    """升级：创建 users 和 posts 表。
    执行 \`alembic upgrade head\` 时会调用这个函数。
    """
    # === 创建 users 表 ===
    # op.create_table：创建表的 API
    op.create_table(
        'users',
        # sa.Column(列名, 类型, 约束)：定义列
        # primary_key=True：主键
        sa.Column('id', sa.Integer(), primary_key=True),
        # nullable=False：NOT NULL
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('email', sa.String(120), nullable=False),
        # server_default=sa.func.now()：数据库端默认值 NOW()
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    # 创建唯一索引：op.create_index(索引名, 表名, 列列表, unique=是否唯一)
    # 防止邮箱重复
    op.create_index(
        'ix_users_email',           # 索引名
        'users',                    # 表名
        ['email'],                  # 列列表
        unique=True,                # 唯一索引
    )

    # === 创建 posts 表 ===
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('published', sa.Boolean(), server_default='0'),
        # ForeignKeyConstraint：外键约束
        # 第一个列表是本表的列，第二个列表是引用表的列
        sa.ForeignKeyConstraint(['author_id'], ['users.id']),
        sa.Column('author_id', sa.Integer(), nullable=False),
    )
    # 普通索引：加速按 author_id 查询
    op.create_index('ix_posts_author_id', 'posts', ['author_id'])

    # === 可选：创建数据（种子数据）===
    # op.execute 可以执行原生 SQL
    # op.execute("INSERT INTO users (name, email) VALUES ('admin', 'admin@test.com')")

# 4. downgrade 函数：回滚时执行
# 定义函数 downgrade()
def downgrade() -> None:
    """回滚：删除表。
    执行 \`alembic downgrade -1\` 时会调用这个函数。
    ★ 注意删除顺序：先删依赖表（posts），再删被依赖表（users）
    """
    # 先删 posts（依赖 users 的外键）
    op.drop_index('ix_posts_author_id', table_name='posts')
    op.drop_table('posts')
    # 再删 users
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
\`\`\`

### Demo 3：数据迁移实战（带数据的字段类型转换）

真实场景：把 \`status\` 列从字符串（'active'/'inactive'）改成整数（1/0），**不能丢数据**。

\`\`\`python filename="alembic/versions/数据迁移示例.py"
# 数据迁移：status 字符串转整数
# 这个 Demo 演示如何安全地转换列类型，不丢数据

"""migrate status from string to int

Revision ID: f1e2d3c4b5a6
Revises: a1b2c3d4e5f6
Create Date: 2024-01-02 12:00:00
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f1e2d3c4b5a6'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 定义函数 upgrade()
def upgrade() -> None:
    """升级：status 字符串转整数。
    分四步走，每步都安全可回滚：
    1. 加新列 status_new（可空，避免 NOT NULL 失败）
    2. 回填数据（CASE WHEN 转换）
    3. 删旧列 status
    4. 新列改名 status + 加约束
    """
    # 第一步：加新列 status_new，类型 Integer，可空
    # 为什么可空？因为旧数据还没填，NOT NULL 会失败
    op.add_column(
        'users',
        sa.Column('status_new', sa.Integer(), nullable=True),
    )

    # 第二步：用原生 SQL 迁移数据
    # CASE WHEN ... THEN ... ELSE ... END：条件表达式
    # 'active' → 1，其他 → 0
    # op.execute 执行原生 SQL
    op.execute(
        "UPDATE users SET status_new = CASE "
        "WHEN status = 'active' THEN 1 "
        "ELSE 0 END"
    )

    # 第三步：删旧列 status（数据已迁移到 status_new）
    op.drop_column('users', 'status')

    # 第四步：新列改名 status_new → status
    # 同时加 NOT NULL 约束和默认值 0
    # existing_type 必填，告诉 Alembic 当前列类型
    op.alter_column(
        'users',
        'status_new',                                    # 旧列名
        new_column_name='status',                        # 新列名
        existing_type=sa.Integer(),                      # 原类型
        nullable=False,                                  # 改成 NOT NULL
        server_default='0',                              # 默认值 0
    )

# 定义函数 downgrade()
def downgrade() -> None:
    """回滚：status 整数转字符串。
    和 upgrade 严格对称，只是方向相反。
    """
    # 第一步：加旧列 status_old，类型 String，可空
    op.add_column(
        'users',
        sa.Column('status_old', sa.String(20), nullable=True),
    )

    # 第二步：反向转换数据
    # 1 → 'active'，其他 → 'inactive'
    op.execute(
        "UPDATE users SET status_old = CASE "
        "WHEN status = 1 THEN 'active' "
        "ELSE 'inactive' END"
    )

    # 第三步：删新列 status
    op.drop_column('users', 'status')

    # 第四步：旧列改名 status_old → status
    op.alter_column(
        'users',
        'status_old',
        new_column_name='status',
        existing_type=sa.String(20),
        nullable=False,
        server_default='inactive',
    )
\`\`\`

## 十六、动手实验：巩固理解

### 实验 1：给博客系统加"评论点赞"功能

**任务**：博客系统已有 Post、Comment 模型，现在要加"点赞"功能。一个用户可以点赞多条评论，一条评论可以被多个用户点赞。

**步骤**：
1. 修改模型：加 \`comment_likes\` 关联表（多对多）。
2. 生成迁移：\`alembic revision --autogenerate -m "add comment likes"\`。
3. 检查脚本：确认 \`upgrade()\` 创建了关联表。
4. 执行迁移：\`alembic upgrade head\`。
5. 验证：用 SQLite 工具查看表结构。

\`\`\`python filename="实验1_模型修改.py"
# 在 models.py 中增加关联表和关系

# 1. 新增关联表（多对多）
# comment_likes = Table(
#     "comment_likes",
#     Base.metadata,
#     Column("comment_id", Integer, ForeignKey("comments.id"), primary_key=True),
#     Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
# )

# 2. Comment 模型增加关系
# class Comment(Base):
#     ...
#     liked_by: Mapped[List["User"]] = relationship(
#         secondary=comment_likes, back_populates="liked_comments"
#     )

# 3. User 模型增加关系
# class User(Base):
#     ...
#     liked_comments: Mapped[List["Comment"]] = relationship(
#         secondary=comment_likes, back_populates="liked_by"
#     )

# 4. 生成迁移
# alembic revision --autogenerate -m "add comment likes"

# 5. 检查脚本：upgrade() 应该有
# op.create_table('comment_likes', ...)
# op.create_index('ix_comment_likes_comment_id', ...)

# 6. 执行迁移
# alembic upgrade head

# 7. 验证
# sqlite3 blog.db ".tables"
# 应该看到 comment_likes 表
\`\`\`

### 实验 2：实现一个可回滚的数据种子脚本

**任务**：写一个迁移脚本，在 \`upgrade\` 时插入初始管理员账号，\`downgrade\` 时删除。

\`\`\`python filename="实验2_种子数据迁移.py"
# 种子数据迁移：插入初始管理员

"""seed admin user

Revision ID: x1y2z3a4b5c6
Revises: f1e2d3c4b5a6
Create Date: 2024-01-03 12:00:00
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'x1y2z3a4b5c6'
down_revision: Union[str, None] = 'f1e2d3c4b5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 定义函数 upgrade()
def upgrade() -> None:
    """升级：插入初始管理员账号。"""
    # 用 op.execute 执行原生 SQL
    # 注意：密码应该用哈希，这里用明文仅作演示
    op.execute(
        "INSERT INTO users (name, email, is_admin) "
        "VALUES ('admin', 'admin@test.com', 1)"
    )

# 定义函数 downgrade()
def downgrade() -> None:
    """回滚：删除管理员账号。"""
    # 删除时用 WHERE 精确匹配，避免误删
    op.execute(
        "DELETE FROM users WHERE email = 'admin@test.com'"
    )

# 测试：
# alembic upgrade head  → 插入 admin
# sqlite3 demo.db "SELECT * FROM users WHERE email='admin@test.com'"
# alembic downgrade -1  → 删除 admin
# sqlite3 demo.db "SELECT * FROM users WHERE email='admin@test.com'"  → 空
\`\`\`

### 实验 3：模拟多分支开发的合并

**任务**：模拟两个开发者同时基于同一版本写了迁移，产生分叉，然后用 \`alembic merge\` 合并。

\`\`\`bash filename="实验3_多分支合并"
# 1. 假设当前版本是 abc123

# 2. 开发者 A 基于 abc123 写了迁移 def456（加 phone 列）
# alembic revision -m "A: add phone"

# 3. 开发者 B 也基于 abc123 写了迁移 ghi789（加 address 列）
# alembic revision -m "B: add address"
# 注意：B 拉代码时还没看到 A 的迁移，所以 down_revision 也是 abc123

# 4. 现在有两个 head（分叉了）
# alembic heads
# 输出：
#   def456 (head)
#   ghi789 (head)

# 5. 合并：生成一个 merge 迁移，down_revision 指向两个 head
# alembic merge -m "merge A and B" def456 ghi789
# 输出：Generating alembic/versions/jkl012_merge_a_and_b.py

# 6. 检查 merge 脚本
# vim alembic/versions/jkl012_merge_a_and_b.py
# down_revision 会是 ('def456', 'ghi789')  # 两个父版本

# 7. 现在只有一个 head 了
# alembic heads
# 输出：jkl012 (head)

# 8. 执行迁移
# alembic upgrade head
# 会依次执行 def456、ghi789、jkl012
\`\`\`

\`\`\`python filename="merge 迁移脚本示例.py"
# 这是 alembic merge 生成的合并脚本
# upgrade() 和 downgrade() 通常是空的，只用于合并分支

"""merge A and B

Revision ID: jkl012
Revises: def456, ghi789      # ★ 两个父版本
Create Date: 2024-01-04 12:00:00
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'jkl012'
# ★ down_revision 是元组，指向两个分支的 head
down_revision: Union[str, Sequence[str], None] = ('def456', 'ghi789')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# merge 脚本通常不需要操作，只是连接两个分支
# 定义函数 upgrade()
def upgrade() -> None:
    pass

# 定义函数 downgrade()
def downgrade() -> None:
    pass
\`\`\`

## 十七、常见错误补充

**错误 7：迁移脚本没提交到 Git**

\`\`\`bash filename="错误：迁移脚本没提交"
# ❌ 错误：生成迁移脚本后不提交 Git，队友拉代码后数据库结构不一致
# alembic revision --autogenerate -m "add phone"
# git stash  # 迁移脚本被藏起来了

# ✅ 正确：迁移脚本必须提交 Git，和模型代码一起版本管理
# alembic revision --autogenerate -m "add phone"
# git add alembic/versions/xxx_add_phone.py models.py
# git commit -m "add phone field to users"
\`\`\`

**错误 8：在生产环境用 autogenerate 不检查**

\`\`\`python filename="错误：生产环境不检查脚本"
# ❌ 错误：生产环境直接用 autogenerate 生成的脚本，不人工检查
# 可能的问题：
#   1. autogenerate 把"重命名"误判为"删列+加列"，数据丢失
#   2. downgrade() 不完整，回滚时丢数据
#   3. 生成了不需要的索引变更

# ✅ 正确：autogenerate 后必须人工核对
# 1. 检查 upgrade() 是否符合预期
# 2. 检查 downgrade() 是否能撤销 upgrade()
# 3. 特别注意 drop_column 和 drop_table（会丢数据）
\`\`\`

**错误 9：迁移脚本顺序断裂**

\`\`\`bash filename="错误：down_revision 指向不存在的版本"
# ❌ 错误：手动删了某个迁移脚本，链条断裂
# alembic upgrade head
# 报错：Can't locate revision identified by 'abc123'

# ✅ 正确：不要删已执行的迁移脚本
# 如果必须删，先用 alembic downgrade 回滚到之前版本
# 再删脚本，重新生成
\`\`\`

**错误 10：多 head 不合并**

\`\`\`bash filename="错误：多 head 不合并"
# ❌ 错误：多分支开发产生多个 head，不合并直接 upgrade
# alembic upgrade head
# 报错：Multiple heads are present; please specify which head

# ✅ 正确：先用 alembic merge 合并
# alembic merge -m "merge branches" head1 head2
# alembic upgrade head
\`\`\`

**错误 11：env.py 忘了开 compare_type**

\`\`\`python filename="错误：类型变化检测不到"
# ❌ 错误：env.py 没开 compare_type，String(50) 改成 String(100) 检测不到
# context.configure(
#     connection=connection,
#     target_metadata=target_metadata,
#     # 没写 compare_type=True
# )
# alembic revision --autogenerate -m "change length"
# 输出：No changes in schema detected.  # 没检测到！

# ✅ 正确：开启 compare_type 和 compare_server_default
# context.configure(
#     connection=connection,
#     target_metadata=target_metadata,
#     compare_type=True,                # 检测类型变化
#     compare_server_default=True,      # 检测默认值变化
# )
\`\`\`

## 十八、本章小结

- **数据库迁移**解决"模型变更怎么同步到数据库"的问题，Alembic 是 SQLAlchemy 官方工具。
- **核心流程**：\`alembic init\` 初始化 → 配置 \`env.py\`（导入 Base.metadata）→ \`alembic revision --autogenerate\` 生成脚本 → \`alembic upgrade head\` 执行。
- **env.py 关键**：\`target_metadata = Base.metadata\`，且必须导入所有模型类，否则 autogenerate 生成"删除所有表"的灾难脚本。
- **upgrade/downgrade 对称**：升级做了什么，回滚就要撤销什么。autogenerate 生成的脚本要人工核对。
- **autogenerate 局限**：检测不到字段重命名、数据迁移、约束改名，需要手写迁移脚本。
- **常用命令**：\`alembic current\`（当前版本）、\`alembic history\`（历史）、\`alembic upgrade head\`（升级到最新）、\`alembic downgrade -1\`（回滚一个版本）。
- **生产实践**：迁移要 review、先备份、小步走、测试环境先跑、CI 集成、环境变量管理连接。

至此，数据库集成四章结束。从 SQLAlchemy 模型定义、连接管理、CRUD 实战到 Alembic 迁移，你已经掌握了 FastAPI 数据库开发的完整链路。下一批章节我们将学习认证与安全。
`
  }
];
