// =============================================================
// Python 实战项目教程 - 第 5 批章节(综合系统)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章:电商后台管理系统:架构设计
  // ============================================================
  {
    id: "pyproject-ecommerce-arch",
    group: "综合系统",
    icon: "🏗️",
    title: "电商后台管理系统:架构设计",
    content: `# 电商后台管理系统:架构设计

## 一、为什么先讲架构

很多教程一上来就写代码,写到一半才发现:商品表字段不够用、订单和库存耦合在一起改不动、加个优惠券要改十几个文件。这些问题不是代码写得不熟,而是**架构没想清楚**。

架构设计的本质是**做决策并写下来**:用什么数据库、分几层、表怎么拆、接口长什么样。决策一旦定下来,后面写代码就是填空题;没定下来,每写一行都在做选择题,越写越乱。

本章不写一行业务代码,只做一件事:把电商后台的架构想清楚,并用最小可运行 demo 把骨架搭起来。先把地基打好,第 2 章再往里填业务。

## 二、电商系统全景

一个完整电商系统涉及的核心域:

| 领域 | 核心实体 | 关键动作 |
|------|----------|----------|
| 商品 | SKU、分类、属性 | 上下架、改价、库存调整 |
| 订单 | 主单、明细 | 下单、取消、发货、退款 |
| 支付 | 支付单、流水 | 发起、回调、对账 |
| 库存 | 库存记录 | 扣减、回滚、盘点 |
| 用户 | 账户、地址 | 注册、登录、收货 |
| 营销 | 优惠券、活动 | 领取、核销、统计 |

前台(消费者看到的 App/网页)和后台(运营管理系统)共用同一套数据,但关注点不同:

- **前台**:看商品、下单、查订单状态——读多写少,要快。
- **后台**:改商品、处理订单、看报表——写多读杂,要稳。

本批教程聚焦**后台**,即运营人员用的管理系统。前台接口套路类似,只是权限和侧重不同。

## 三、后台管理功能模块划分

把后台拆成一个个独立模块,每个模块对应一组页面和接口。拆分原则:**高内聚低耦合**,改一个模块不牵连另一个。

| 模块 | 子功能 | 对应表 |
|------|--------|--------|
| 商品管理 | 商品 CRUD、上下架、分类、规格 | products、categories |
| 订单管理 | 订单列表、详情、发货、取消、退款 | orders、order_items |
| 用户管理 | 用户列表、封禁、改资料、角色 | users |
| 库存管理 | 库存查询、调整、盘点日志 | products.stock |
| 营销管理 | 优惠券、满减、活动配置 | coupons、promotions |
| 数据统计 | 销量、GMV、热门商品、转化率 | 聚合查询 |
| 系统设置 | 管理员、权限、操作日志 | admins、audit_logs |

本批前两章实现其中三个最核心的:**商品管理、订单管理、数据统计**。把这三个吃透,其余模块照葫芦画瓢即可。

## 四、技术架构选型

### 技术栈一览

| 层次 | 选型 | 为什么 |
|------|------|--------|
| Web 框架 | FastAPI | 类型驱动、自动文档、异步、性能高 |
| ORM | SQLAlchemy 2.0 | Python 生态最成熟的 ORM,支持异步 |
| 数据库 | SQLite(开发)→ PostgreSQL(生产) | SQLite 零配置便于教学,PG 是生产标配 |
| 数据校验 | Pydantic v2 | FastAPI 内置,FastAPI 离不开它 |
| 配置管理 | pydantic-settings | 类型安全的环境变量读取 |
| 运行服务器 | uvicorn | ASGI 服务器,FastAPI 官方推荐 |

### 为什么是 FastAPI 而不是 Flask/Django

后台管理系统对**接口规范、参数校验、自动文档**要求很高——运营和前端要对着文档联调。FastAPI 三件套(类型注解 + Pydantic + 自动文档)正好打中痛点:

- 改一个字段,文档自动更新,不用维护 Excel。
- 参数校验在入口完成,业务代码只处理合法数据。
- 异步能力为未来接入实时库存、消息推送留了口子。

Django 自带 admin 很爽,但 Django Rest Framework 写起来比 FastAPI 啰嗦;Flask 太自由,大项目容易乱。FastAPI 在"约束"和"灵活"之间平衡得最好。

### 为什么 SQLAlchemy 而不是裸 SQL

后台有大量 CRUD,裸 SQL 写起来重复且易错。SQLAlchemy 提供:

- **模型抽象**:Python 类映射表,改字段改类即可。
- **关系导航**:\`product.category\` 自动 JOIN,不用手写 SQL。
- **分页/排序**:limit/offset/order_by 链式调用。
- **事务管理**:session.commit / rollback 一行搞定。

当然,统计类复杂 SQL 仍然可以下钻到原生 SQL,SQLAlchemy 的 \`text()\` 支持混用。

## 五、数据库设计

### 核心表清单

| 表名 | 作用 | 关键字段 |
|------|------|----------|
| categories | 商品分类 | id、name、parent_id、sort |
| products | 商品主表 | id、name、category_id、price、stock、status |
| users | 用户表 | id、username、email、password_hash、role |
| orders | 订单主表 | id、user_id、status、total、created_at |
| order_items | 订单明细 | id、order_id、product_id、qty、price |

### ER 关系(文字描述)

- **categories 自关联**:\`parent_id\` 指向自身 \`id\`,实现树形分类(一级分类 parent_id 为空)。
- **products → categories**:多对一,\`products.category_id\` 外键指向 \`categories.id\`。一个分类下多个商品。
- **orders → users**:多对一,\`orders.user_id\` 外键指向 \`users.id\`。一个用户多个订单。
- **order_items → orders**:多对一,\`order_items.order_id\` 指向 \`orders.id\`。一个订单多个明细。
- **order_items → products**:多对一,\`order_items.product_id\` 指向 \`products.id\`。一个商品可出现在多个订单。

为什么订单和商品不直接关联,而要中间加一张 \`order_items\`?因为一个订单通常包含多个商品,每个商品买了几个、当时单价多少,都要单独记录。**下单时的价格快照**存在 \`order_items.price\` 里,即使商品后来改价,历史订单的金额也不变。

### 为什么把库存放在 products 表

教学项目里,库存 \`stock\` 直接挂在 \`products\` 表上,简单够用。生产环境通常单独建 \`inventory\` 表,因为:

- 一个 SKU 可能在多个仓库,要分仓记库存。
- 库存变动要留流水(扣减、回滚、调整)。
- 预占库存(下单未付款)和实际库存要分开。

本教程先用简单版,把"库存扣减要带行锁"这个核心问题讲透,再扩展不难。

## 六、分层架构

把代码按职责分层,每层只做自己的事,层与层之间通过明确的接口通信。

\`\`\`
请求 →  [Router 路由层]   接收 HTTP、参数校验、调用 Service
          ↓
        [Service 服务层]   业务逻辑、事务编排、调用 Repository
          ↓
      [Repository 数据层]  数据库读写、SQL 射装、查询构造
          ↓
        [Model 模型层]    SQLAlchemy 模型、表定义、字段约束
\`\`\`

各层职责:

| 层 | 职责 | 不该做的事 |
|----|------|------------|
| Router | 参数解析、调用 Service、包装响应 | 不直接写 SQL、不写业务 if/else |
| Service | 业务规则、事务、跨表编排 | 不碰 request/response 对象 |
| Repository | 增删改查、过滤、分页 | 不写业务判断(如"库存够不够") |
| Model | 表结构、字段类型、关系 | 不含业务方法 |

**为什么不直接 Router 里写 SQL?** 因为业务逻辑会被 HTTP 细节污染,无法复用、无法测试。分层后,Service 可以被命令行脚本、定时任务、其他接口复用,也能脱离 HTTP 单测。

### demo:分层结构示例

下面用伪代码展示一个"创建订单"的调用链,体会各层分工:

\`\`\`python
# ===== Model 模型层 models/order.py =====
# 订单表定义,只描述结构,不含业务
from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base  # 导入声明基类

class Order(Base):
    "订单表"
    __tablename__ = "orders"  # 表名
    id = Column(Integer, primary_key=True)  # 主键
    user_id = Column(Integer, ForeignKey("users.id"))  # 外键指向 users
    status = Column(String, default="pending")  # 订单状态,默认待支付
    total = Column(Integer, default=0)  # 订单总额,单位分


# ===== Repository 数据层 repositories/order_repo.py =====
# 只管"怎么存",不管"为什么存"
from sqlalchemy.orm import Session
from models.order import Order

class OrderRepository:
    def __init__(self, db: Session):
        # 接收 session,所有操作都基于它
        self.db = db

    def create(self, order: Order) -> Order:
        # 新增:加到 session 并刷新拿到 id
        self.db.add(order)
        self.db.flush()  # flush 后 order.id 有值,但还未真正提交
        return order

    def get_by_id(self, order_id: int) -> Order | None:
        # 查询:按主键取
        return self.db.get(Order, order_id)

    def update_status(self, order_id: int, status: str) -> None:
        # 修改:取出后改字段,commit 由上层控制
        order = self.get_by_id(order_id)
        if order:
            order.status = status


# ===== Service 服务层 services/order_service.py =====
# 写业务规则:库存够不够、订单状态怎么流转
from repositories.order_repo import OrderRepository
from repositories.product_repo import ProductRepository

class OrderService:
    def __init__(self, db: Session):
        # 组装要用到的 repository
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.db = db  # 留着 commit 用

    def create_order(self, user_id: int, items: list) -> Order:
        # 业务:校验库存 → 扣库存 → 创建订单 → 提交事务
        total = 0
        for item in items:
            product = self.product_repo.get_by_id(item["product_id"])
            # 业务规则:库存不足直接抛异常
            if product.stock < item["qty"]:
                raise ValueError(f"商品 {product.name} 库存不足")
            # 扣库存(数据层只管改字段,业务层决定扣多少)
            product.stock -= item["qty"]
            total += product.price * item["qty"]
        # 创建订单
        order = Order(user_id=user_id, total=total)
        self.order_repo.create(order)
        # 业务层负责提交事务,保证扣库存和建订单一起成功或一起失败
        self.db.commit()
        return order


# ===== Router 路由层 routers/orders.py =====
# 只管 HTTP:解析请求体、调用 Service、返回响应
from fastapi import APIRouter, Depends
from services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["订单管理"])

@router.post("/")
def create_order(payload: dict, service: OrderService = Depends()):
    # 把请求体丢给 Service,Service 抛的异常由全局处理器兜底
    order = service.create_order(payload["user_id"], payload["items"])
    return {"code": 0, "data": {"order_id": order.id}}
\`\`\`

注意三个关键点:
1. **Router 不写 if 判断库存**,业务规则全在 Service。
2. **Repository 不抛"库存不足"异常**,它只管改字段。
3. **事务 commit 在 Service**,保证多步操作原子性,Repository 只 flush 不 commit。

## 七、统一响应格式

后台前端要处理几十个接口,如果每个接口返回结构都不一样,前端要写几十套解析逻辑。统一格式让前端封装一个 \`request()\` 函数就够。

### 设计原则

- **code**:0 表示成功,非 0 表示业务错误(区别于 HTTP 状态码)。
- **message**:人类可读的提示,成功时为 "ok",失败时说明原因。
- **data**:实际数据,失败时为 null。

\`\`\`json
// 成功
{"code": 0, "message": "ok", "data": {"id": 1}}

// 失败
{"code": 40001, "message": "库存不足", "data": null}
\`\`\`

为什么不用 HTTP 状态码表达业务错误?因为 HTTP 状态码粒度太粗,400 既可能是"参数缺失"也可能是"库存不足"。把业务错误码放在 body 里,前端用 \`code\` 分支处理,日志用 HTTP 码统计,两不耽误。HTTP 层正常返回 200(除了 401/404/500 这类框架级错误)。

### demo:统一响应封装

\`\`\`python
# core/response.py
# 统一响应封装:所有接口出口都走这里
from typing import Any, Optional

def success(data: Any = None, message: str = "ok") -> dict:
    "成功响应:code=0"
    return {"code": 0, "message": message, "data": data}

def fail(code: int, message: str, data: Any = None) -> dict:
    "失败响应:code 非 0"
    return {"code": code, "message": message, "data": data}

# 业务错误码常量:集中定义,避免散落
class BizError:
    STOCK_NOT_ENOUGH = 40001   # 库存不足
    ORDER_NOT_FOUND = 40002    # 订单不存在
    ORDER_STATUS_INVALID = 40003  # 订单状态非法
    PARAM_INVALID = 40004       # 参数非法
\`\`\`

配合全局异常处理器,Service 抛 \`BizException\` 自动转成统一格式,Router 完全不用写 try/except。第 3 章会详细讲异常处理。

## 八、项目结构搭建

### demo:项目结构

后台项目按"分层 + 按模块"组织,目录结构如下:

\`\`\`
ecommerce-admin/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口,挂载路由
│   ├── core/
│   │   ├── config.py        # 配置管理
│   │   ├── database.py       # 数据库引擎与 session
│   │   └── response.py       # 统一响应封装
│   ├── models/              # 模型层:表定义
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── user.py
│   ├── repositories/        # 数据层:增删改查
│   │   ├── __init__.py
│   │   ├── product_repo.py
│   │   └── order_repo.py
│   ├── services/            # 服务层:业务逻辑
│   │   ├── __init__.py
│   │   ├── product_service.py
│   │   └── order_service.py
│   ├── routers/             # 路由层:HTTP 端点
│   │   ├── __init__.py
│   │   ├── products.py
│   │   └── orders.py
│   └── schemas/              # Pydantic 模型:请求/响应结构
│       ├── product.py
│       └── order.py
├── requirements.txt
└── README.md
\`\`\`

为什么 \`schemas/\` 和 \`models/\` 要分开?因为它们职责不同:
- \`models/\` 是 **数据库表** 的描述(SQLAlchemy),字段对应数据库列。
- \`schemas/\` 是 **接口数据** 的描述(Pydantic),字段对应 API 入参/出参。

比如创建商品接口,入参 \`name\`、\`price\`,但不需要传 \`id\`(数据库自生成)、\`status\`(用默认值)。出入参结构和表结构经常不一致,分开更清晰。

### demo:配置管理

配置不要写死在代码里(密码、数据库地址等敏感信息会随代码进 git)。用 pydantic-settings 从环境变量读取:

\`\`\`python
# app/core/config.py
# 配置管理:从环境变量读取,带类型校验和默认值
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 数据库连接字符串,默认用 SQLite 便于教学
    database_url: str = "sqlite:///./ecommerce.db"
    # 应用名称,会出现在文档标题
    app_name: str = "电商后台管理系统"
    # 是否开启调试模式(开发期 True,生产 False)
    debug: bool = True
    # 分页默认每页条数
    page_size: int = 20

    class Config:
        # 从 .env 文件读取,优先级:环境变量 > .env > 默认值
        env_file = ".env"

# 全局单例:整个应用共用一份配置
settings = Settings()
\`\`\`

配套 \`.env\` 文件(不进 git,加进 .gitignore):

\`\`\`bash
# .env
DATABASE_URL=sqlite:///./ecommerce.db
DEBUG=True
PAGE_SIZE=20
\`\`\`

切换数据库只改 \`.env\`,代码一行不动。这就是配置与代码分离的价值。

### demo:数据库初始化

\`\`\`python
# app/core/database.py
# 数据库引擎与 session 工厂
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# create_engine 创建数据库连接池
# check_same_thread=False:SQLite 在多线程下需要,生产用 PG 不用管
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

# SessionLocal:每次请求开一个 session,请求结束关闭
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base:所有模型的基类,继承它的类会被识别为表
Base = declarative_base()


# 依赖函数:FastAPI 依赖注入用,自动管理 session 生命周期
def get_db():
    db = SessionLocal()
    try:
        yield db       # 把 session 交给路由
    finally:
        db.close()     # 请求结束无论成功失败都关闭
\`\`\`

\`get_db()\` 是个生成器,配合 FastAPI 的 \`Depends(get_db)\` 使用:请求进来开 session,请求结束自动 close,不用手动管理。这是 FastAPI 依赖注入最经典的用法。

### demo:数据库模型定义

\`\`\`python
# app/models/product.py
# 商品表与分类表定义
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from .database import Base

class Category(Base):
    "分类表"
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)            # 主键自增
    name = Column(String(64), nullable=False)         # 分类名,不可空
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)  # 父分类,可空表示一级
    sort = Column(Integer, default=0)                 # 排序值,越小越靠前


class Product(Base):
    "商品表"
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False)        # 商品名
    description = Column(String(512), default="")     # 描述,可空
    price = Column(Float, nullable=False)              # 售价,单位元
    stock = Column(Integer, default=0)                 # 库存
    category_id = Column(Integer, ForeignKey("categories.id"))  # 所属分类
    status = Column(Integer, default=1)               # 1 上架 0 下架
\`\`\`

\`Column(Float)\` 教学用,生产环境金额应该用 \`Numeric\` 避免浮点误差。这是架构决策要写进文档的:**生产金额字段一律 Numeric**。

## 九、架构总览图

\`\`\`
                    ┌─────────────────────────┐
   运营前端 ────HTTP──→ │      FastAPI 应用        │
                    │  ┌───────────────────┐  │
                    │  │   Router 路由层     │  │  参数解析、响应封装
                    │  │   routers/*.py     │  │
                    │  └─────────┬─────────┘  │
                    │            ↓            │
                    │  ┌───────────────────┐  │
                    │  │   Service 服务层   │  │  业务规则、事务
                    │  │  services/*.py    │  │
                    │  └─────────┬─────────┘  │
                    │            ↓            │
                    │  ┌───────────────────┐  │
                    │  │ Repository 数据层  │  │  SQL 封装
                    │  │repositories/*.py  │  │
                    │  └─────────┬─────────┘  │
                    │            ↓            │
                    │  ┌───────────────────┐  │
                    │  │   Model 模型层    │  │  表结构
                    │  │   models/*.py     │  │
                    │  └─────────┬─────────┘  │
                    └────────────┼────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │  SQLite / PostgreSQL     │
                    └─────────────────────────┘

   横切关注点:配置(config)│ 异常处理 │ 中间件(日志/CORS)
\`\`\`

横向的"横切关注点"——配置、异常、中间件——不属于任何一层,但所有层都用到。它们放在 \`core/\` 目录,被各层引用。

## 本章小结

| 要点 | 说明 |
|------|------|
| 电商全景 | 商品/订单/支付/库存/用户/营销 六大域 |
| 后台模块 | 商品、订单、用户、库存、营销、统计、系统 |
| 技术栈 | FastAPI + SQLAlchemy 2.0 + Pydantic + uvicorn |
| 数据库设计 | categories/products/orders/order_items/users,库存先挂 products |
| 分层架构 | Router → Service → Repository → Model,职责单一 |
| 统一响应 | {code, message, data},业务错误码与 HTTP 码分离 |
| 项目结构 | 按层分目录,models 与 schemas 分离 |
| 配置管理 | pydantic-settings + .env,环境隔离 |
| 关键决策 | 金额用 Numeric、库存生产分表、价格快照存 order_items |

架构定到这里,地基稳了。下一章我们往这套骨架里填业务:商品 CRUD、订单创建、库存扣减、状态流转、数据统计,完整跑通一个后台。`
  },

  // ============================================================
  // 第 2 章:实战:电商后台 API(完整实现)
  // ============================================================
  {
    id: "pyproject-ecommerce-impl",
    group: "综合系统",
    icon: "🛒",
    title: "实战:电商后台 API(完整实现)",
    content: `# 实战:电商后台 API(完整实现)

## 一、本章做什么

上一章把架构和骨架搭好了,这一章往里填业务,跑通一个完整的电商后台。完成本章,你将拥有一个**可以运行的迷你后台系统**,包含:

1. 商品管理:增删改查、分页、搜索、过滤、上下架。
2. 订单管理:创建订单(带库存扣减)、状态流转(发货/取消)。
3. 数据统计:销量汇总、热门商品 Top N。

代码逐行注释,可以直接复制运行。先把第 1 章的 \`app/\` 骨架建好,本章往里填文件。

## 二、统一响应与异常

先把响应格式和异常处理定好,后面所有接口出口统一。

\`\`\`python
# app/core/response.py
# 统一响应封装 + 业务异常
from fastapi import Request
from fastapi.responses import JSONResponse

def success(data=None, message="ok"):
    "成功响应"
    return {"code": 0, "message": message, "data": data}

class BizException(Exception):
    "业务异常:抛出后由全局处理器转成统一响应"
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

# 全局异常处理:注册到 app.exception_handler
async def biz_exception_handler(request: Request, exc: BizException):
    # 业务异常统一返回 200,body 里 code 非 0
    return JSONResponse(
        status_code=200,
        content={"code": exc.code, "message": exc.message, "data": None},
    )
\`\`\`

Service 里直接 \`raise BizException(40001, "库存不足")\`,不用一层层 return 错误码。Router 完全不感知异常,代码干净。

## 三、商品管理

### 数据访问层 Repository

先写商品 Repository,封装所有商品表的读写。Repository 只管"怎么存",不管"为什么"。

\`\`\`python
# app/repositories/product_repo.py
# 商品数据访问层:所有 products 表的读写都在这
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product, Category

class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, product: Product) -> Product:
        "新增商品"
        self.db.add(product)
        self.db.flush()       # flush 后 product.id 有值
        return product

    def get_by_id(self, product_id: int) -> Product | None:
        "按主键查"
        return self.db.get(Product, product_id)

    def list(self, skip: int, limit: int, keyword: str = "", category_id: int | None = None):
        "分页 + 关键词 + 分类过滤:链式构造查询,最后统一执行"
        q = self.db.query(Product)
        # 关键词模糊匹配:名字或描述任一命中
        if keyword:
            q = q.filter(or_(Product.name.like(f"%{keyword}%"), Product.description.like(f"%{keyword}%")))
        # 分类精确匹配
        if category_id is not None:
            q = q.filter(Product.category_id == category_id)
        # 先取总数(分页前),再取当页数据
        total = q.count()
        items = q.order_by(Product.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def update(self, product: Product) -> Product:
        "更新:SQLAlchemy 修改对象后 flush 即可"
        self.db.flush()
        return product

    def delete(self, product: Product) -> None:
        "删除"
        self.db.delete(product)
        self.db.flush()

    def decrease_stock(self, product_id: int, qty: int) -> bool:
        "扣库存:用 UPDATE ... WHERE stock >= qty 保证并发安全"
        result = self.db.query(Product).filter(
            Product.id == product_id,
            Product.stock >= qty  # 关键:WHERE 条件带库存判断,扣不到返回 0 行
        ).update({Product.stock: Product.stock - qty}, synchronize_session=False)
        return result > 0  # 返回是否扣成功
\`\`\`

\`decrease_stock\` 是本章最重要的一行。为什么不用"先查再减"?

\`\`\`python
# ❌ 错误做法:查出来再减,并发下会超卖
product = repo.get_by_id(1)
if product.stock >= qty:
    product.stock -= qty  # 两个请求同时到这里,都看到 stock=1,都减成 0,实际卖了 2 件
\`\`\`

正确做法是**一条 UPDATE 带 WHERE 条件**,数据库行锁保证原子性:扣不到就返回 0 行,业务层据此重试或报错。这是处理并发库存的核心套路。

### Service 业务层

\`\`\`python
# app/services/product_service.py
# 商品业务层:参数校验、业务规则、调 Repository
from sqlalchemy.orm import Session
from app.models.product import Product, Category
from app.repositories.product_repo import ProductRepository
from app.core.response import BizException

class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)
        self.db = db

    def create(self, data: dict) -> Product:
        "创建商品:校验分类存在 → 建商品 → 提交"
        # 业务规则:分类必须存在
        cat = self.db.get(Category, data.get("category_id"))
        if not cat:
            raise BizException(40004, "分类不存在")
        product = Product(
            name=data["name"],
            description=data.get("description", ""),
            price=data["price"],
            stock=data.get("stock", 0),
            category_id=data["category_id"],
            status=data.get("status", 1),
        )
        self.repo.create(product)
        self.db.commit()  # Service 提交事务
        return product

    def update(self, product_id: int, data: dict) -> Product:
        "更新商品"
        product = self.repo.get_by_id(product_id)
        if not product:
            raise BizException(40004, "商品不存在")
        # 只更新允许改的字段,避免前端传 id 被覆盖
        for key in ("name", "description", "price", "stock", "status"):
            if key in data:
                setattr(product, key, data[key])
        self.repo.update(product)
        self.db.commit()
        return product

    def delete(self, product_id: int) -> None:
        "删除商品:存在性校验后删"
        product = self.repo.get_by_id(product_id)
        if not product:
            raise BizException(40004, "商品不存在")
        self.repo.delete(product)
        self.db.commit()

    def get(self, product_id: int) -> Product:
        "查单个商品"
        product = self.repo.get_by_id(product_id)
        if not product:
            raise BizException(40004, "商品不存在")
        return product

    def list(self, page: int, size: int, keyword: str, category_id: int | None):
        "分页查询:Service 算 skip,Repository 管分页"
        skip = (page - 1) * size
        items, total = self.repo.list(skip, size, keyword, category_id)
        return {"items": items, "total": total, "page": page, "size": size}

    def toggle_status(self, product_id: int, status: int) -> Product:
        "上下架:状态只能 0 或 1"
        if status not in (0, 1):
            raise BizException(40004, "状态值非法")
        product = self.repo.get_by_id(product_id)
        if not product:
            raise BizException(40004, "商品不存在")
        product.status = status
        self.db.commit()
        return product
\`\`\`

Service 抛 \`BizException\`,Controller 不用 try/except,异常会被全局处理器接住。

### Router 路由层

\`\`\`python
# app/routers/products.py
# 商品路由:HTTP 入口,参数用 Pydantic schema 校验
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.response import success
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["商品管理"])

# 入参 schema:用 Pydantic 声明字段类型,框架自动校验
class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    stock: int = 0
    category_id: int
    status: int = 1

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    status: int | None = None

# 依赖工厂:把 db 注入并构造 service
def get_service(db: Session = Depends(get_db)):
    return ProductService(db)

@router.post("/")
def create(payload: ProductCreate, service: ProductService = Depends(get_service)):
    "创建商品"
    product = service.create(payload.model_dump())
    return success({"id": product.id})

@router.get("/{product_id}")
def get(product_id: int, service: ProductService = Depends(get_service)):
    "商品详情"
    product = service.get(product_id)
    return success({
        "id": product.id, "name": product.name,
        "price": product.price, "stock": product.stock, "status": product.status,
    })

@router.get("/")
def list_products(
    page: int = Query(1, ge=1),                   # 页码,最小 1
    size: int = Query(20, ge=1, le=100),            # 每页条数,1~100
    keyword: str = Query("", description="搜索关键词"),
    category_id: int | None = Query(None, description="分类筛选"),
    service: ProductService = Depends(get_service),
):
    "分页查询:支持关键词搜索与分类过滤"
    result = service.list(page, size, keyword, category_id)
    return success(result)

@router.put("/{product_id}")
def update(product_id: int, payload: ProductUpdate, service: ProductService = Depends(get_service)):
    "更新商品"
    service.update(product_id, payload.model_dump(exclude_unset=True))
    return success()

@router.delete("/{product_id}")
def delete(product_id: int, service: ProductService = Depends(get_service)):
    "删除商品"
    service.delete(product_id)
    return success()

@router.patch("/{product_id}/status")
def toggle(product_id: int, status: int = Query(..., ge=0, le=1), service: ProductService = Depends(get_service)):
    "上下架"
    service.toggle_status(product_id, status)
    return success()
\`\`\`

\`model_dump(exclude_unset=True)\` 很关键:只传更新时前端实际传了的字段,没传的字段不动。避免 PUT 时把没传的字段误置为默认值。

## 四、订单管理

### 订单模型与状态机

\`\`\`python
# app/models/order.py
# 订单表与明细表
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from app.core.database import Base

class Order(Base):
    "订单主表"
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    order_no = Column(String(32), unique=True, index=True)  # 业务单号,便于人类识别
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(16), default="pending", index=True)  # pending/paid/shipped/cancelled
    total = Column(Float, default=0)                          # 订单总额
    created_at = Column(DateTime, server_default=func.now())  # 创建时间,数据库生成

class OrderItem(Base):
    "订单明细"
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    qty = Column(Integer)                # 购买数量
    price = Column(Float)                 # 下单时价格快照,改价不影响历史订单
\`\`\`

订单状态机:

\`\`\`
pending(待支付) ──付款──→ paid(已支付) ──发货──→ shipped(已发货) ──收货──→ completed(已完成)
       │                       │
       └──取消──→ cancelled     └──取消──→ cancelled
\`\`\`

状态流转规则:只能"往前走"或"取消",不能回退。比如 shipped 不能变回 pending。

### demo:创建订单(带库存扣减)

\`\`\`python
# app/services/order_service.py
# 订单业务:创建订单 + 库存扣减 + 状态流转
import time
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.repositories.product_repo import ProductRepository
from app.core.response import BizException

class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(db)

    def create_order(self, user_id: int, items: list[dict]) -> Order:
        "创建订单:校验商品 → 扣库存 → 建订单 → 建明细 → 提交"
        # 用悲观视角:每个商品先校验存在性和上架状态
        for item in items:
            product = self.product_repo.get_by_id(item["product_id"])
            if not product:
                raise BizException(40004, f"商品 {item['product_id']} 不存在")
            if product.status != 1:
                raise BizException(40005, f"商品 {product.name} 已下架")

        # 扣库存:用 UPDATE WHERE 条件保证原子,失败说明库存不足
        total = 0.0
        for item in items:
            product = self.product_repo.get_by_id(item["product_id"])
            ok = self.product_repo.decrease_stock(item["product_id"], item["qty"])
            if not ok:
                raise BizException(40001, f"商品 {product.name} 库存不足")
            total += product.price * item["qty"]

        # 建订单主表
        order = Order(
            order_no=self._gen_order_no(),  # 生成业务单号
            user_id=user_id,
            status="pending",
            total=round(total, 2),
        )
        self.db.add(order)
        self.db.flush()  # 拿到 order.id

        # 建明细:价格用快照
        for item in items:
            product = self.product_repo.get_by_id(item["product_id"])
            detail = OrderItem(
                order_id=order.id,
                product_id=product.id,
                qty=item["qty"],
                price=product.price,  # 快照:即使商品改价,历史订单金额不变
            )
            self.db.add(detail)

        self.db.commit()  # 整个事务一起提交:扣库存 + 建订单原子
        return order

    def _gen_order_no(self) -> str:
        "生成订单号:时间戳 + 随机数,生产环境用雪花算法"
        return f"ORD{int(time.time() * 1000)}"

    def pay(self, order_id: int) -> Order:
        "支付:pending → paid"
        order = self._get_or_raise(order_id)
        if order.status != "pending":
            raise BizException(40003, f"订单状态 {order.status} 不可支付")
        order.status = "paid"
        self.db.commit()
        return order

    def ship(self, order_id: int) -> Order:
        "发货:paid → shipped"
        order = self._get_or_raise(order_id)
        if order.status != "paid":
            raise BizException(40003, f"订单状态 {order.status} 不可发货")
        order.status = "shipped"
        self.db.commit()
        return order

    def cancel(self, order_id: int) -> Order:
        "取消:pending/paid → cancelled,并回滚库存"
        order = self._get_or_raise(order_id)
        if order.status not in ("pending", "paid"):
            raise BizException(40003, f"订单状态 {order.status} 不可取消")
        # 取消要回滚库存:把明细里的数量加回商品
        for item in self.db.query(OrderItem).filter(OrderItem.order_id == order.id).all():
            product = self.product_repo.get_by_id(item.product_id)
            product.stock += item.qty
        order.status = "cancelled"
        self.db.commit()
        return order

    def _get_or_raise(self, order_id: int) -> Order:
        order = self.db.get(Order, order_id)
        if not order:
            raise BizException(40002, "订单不存在")
        return order
\`\`\`

注意 \`cancel()\` 里回滚库存的逻辑。**取消订单必须回库存**,否则库存会越来越少。而且要和状态变更在一个事务里 commit,避免"状态改了但库存没回滚"。

### demo:订单状态流转路由

\`\`\`python
# app/routers/orders.py
# 订单路由
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.response import success
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["订单管理"])

class OrderCreate(BaseModel):
    user_id: int
    items: list[dict]  # [{"product_id": 1, "qty": 2}]

def get_service(db: Session = Depends(get_db)):
    return OrderService(db)

@router.post("/")
def create(payload: OrderCreate, service: OrderService = Depends(get_service)):
    "创建订单"
    order = service.create_order(payload.user_id, payload.items)
    return success({"order_id": order.id, "order_no": order.order_no, "total": order.total})

@router.post("/{order_id}/pay")
def pay(order_id: int, service: OrderService = Depends(get_service)):
    "支付订单"
    order = service.pay(order_id)
    return success({"order_id": order.id, "status": order.status})

@router.post("/{order_id}/ship")
def ship(order_id: int, service: OrderService = Depends(get_service)):
    "发货"
    order = service.ship(order_id)
    return success({"order_id": order.id, "status": order.status})

@router.post("/{order_id}/cancel")
def cancel(order_id: int, service: OrderService = Depends(get_service)):
    "取消订单(回滚库存)"
    order = service.cancel(order_id)
    return success({"order_id": order.id, "status": order.status})
\`\`\`

状态流转用 \`POST /orders/{id}/pay\` 这种"动作端点",而不是 \`PATCH /orders/{id}\` 改 status 字段。原因:状态变更伴随副作用(扣库存、回库存、发通知),用动作端点语义更清晰,也避免前端乱传 status 越权跳状态。

## 五、数据统计

### demo:销量统计

\`\`\`python
# app/services/stats_service.py
# 统计服务:聚合查询
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.order import Order, OrderItem
from app.models.product import Product

class StatsService:
    def __init__(self, db: Session):
        self.db = db

    def sales_summary(self):
        "总销量统计:订单数、销售总额、商品件数"
        # 只统计有效订单(排除已取消)
        q = self.db.query(Order).filter(Order.status != "cancelled")
        total_orders = q.count()
        total_amount = q.with_entities(func.sum(Order.total)).scalar() or 0
        total_items = self.db.query(func.sum(OrderItem.qty)).join(Order).filter(
            Order.status != "cancelled"
        ).scalar() or 0
        return {
            "total_orders": total_orders,
            "total_amount": round(total_amount, 2),
            "total_items": int(total_items),
        }

    def top_products(self, limit: int = 10):
        "热门商品 Top N:按销量降序"
        # JOIN order_items + orders,聚合 qty,分组按 product_id
        rows = self.db.query(
            OrderItem.product_id,
            Product.name.label("product_name"),
            func.sum(OrderItem.qty).label("sold"),
        ).join(Order, OrderItem.order_id == Order.id \\
          ).join(Product, OrderItem.product_id == Product.id \\
          ).filter(Order.status != "cancelled" \\
          ).group_by(OrderItem.product_id, Product.name \\
          ).order_by(desc("sold")).limit(limit).all()
        return [
            {"product_id": r.product_id, "name": r.product_name, "sold": int(r.sold)}
            for r in rows
        ]

    def daily_sales(self, days: int = 7):
        "近 N 天每日销售额"
        rows = self.db.query(
            func.date(Order.created_at).label("day"),
            func.sum(Order.total).label("amount"),
        ).filter(Order.status != "cancelled").group_by("day").order_by("day").all()
        return [{"date": str(r.day), "amount": float(r.amount)} for r in rows]
\`\`\`

\`with_entities\` 用来指定查询返回哪些列(而不是整个对象),配合 \`func.sum\` 做聚合。\`label()\` 给列起别名,方便取值。

### demo:统计路由

\`\`\`python
# app/routers/stats.py
# 统计路由
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.response import success
from app.services.stats_service import StatsService

router = APIRouter(prefix="/stats", tags=["数据统计"])

@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    "总销量统计"
    return success(StatsService(db).sales_summary())

@router.get("/top-products")
def top(limit: int = Query(10, ge=1, le=100), db: Session = Depends(get_db)):
    "热门商品"
    return success(StatsService(db).top_products(limit))

@router.get("/daily-sales")
def daily(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    "每日销售额"
    return success(StatsService(db).daily_sales(days))
\`\`\`

## 六、完整应用组装

### demo:完整管理流程

把所有路由挂到 app,注册异常处理器,跑起来就是一个完整后台:

\`\`\`python
# app/main.py
# 应用入口:挂载路由、注册中间件、初始化数据库
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.response import biz_exception_handler, BizException
from app.routers import products, orders, stats

# 建表:开发期用 create_all,生产用 Alembic 迁移
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

# CORS:允许前端跨域,生产环境改成具体域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册全局异常处理器
app.add_exception_handler(BizException, biz_exception_handler)

# 挂载路由
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(stats.router)

@app.get("/")
def root():
    "健康检查"
    return {"app": settings.app_name, "version": "1.0.0", "docs": "/docs"}
\`\`\`

启动:\`uvicorn app.main:app --reload\`,打开 \`http://localhost:8000/docs\` 就能看到所有接口。完整流程:

1. \`POST /products/\` 建几个商品。
2. \`GET /products/?page=1&size=10&keyword=苹果\` 搜索。
3. \`POST /orders/\` 创建订单(扣库存)。
4. \`POST /orders/{id}/pay\` 支付。
5. \`POST /orders/{id}/ship\` 发货。
6. \`GET /stats/summary\` 看销量。
7. \`GET /stats/top-products\` 看热门商品。

## 七、前端集成建议

后台前端(React/Vue)对接这套接口的套路:

- **统一拦截器**:axios/fetch 封装一层,读 \`response.data.code\`,非 0 直接弹错误提示。
- **分页组件**:后端返回 \`{items, total, page, size}\`,前端组件照这个结构渲染。
- **状态流转按钮**:根据订单当前 status 决定显示"支付/发货/取消"哪个按钮,后端校验兜底。
- **错误码映射**:前端维护一份 \`code → 文案\` 字典,国际化时换字典即可,不用动后端。

## 本章小结

| 要点 | 说明 |
|------|------|
| 响应统一 | {code, message, data} + BizException 全局处理 |
| 商品 Repository | 链式查询 + decrease_stock 带 WHERE 防超卖 |
| 商品 Service | 参数校验 + 业务规则 + 事务提交 |
| 订单创建 | 校验商品 → 扣库存(原子 UPDATE)→ 建单 → 建明细 |
| 订单状态机 | pending→paid→shipped→completed,可取消回滚库存 |
| 取消回库存 | 与状态变更同事务,保证一致 |
| 动作端点 | POST /orders/{id}/pay 而非 PATCH status |
| 统计聚合 | func.sum + group_by + with_entities |
| 应用组装 | create_all + CORS + 异常处理器 + include_router |

到这里电商后台就跑通了。下一章我们升级到企业级:更严格的分层、依赖注入、配置、中间件、可测试性。`
  },

  // ============================================================
  // 第 3 章:企业级 FastAPI:架构与分层
  // ============================================================
  {
    id: "pyproject-fastapi-enterprise-arch",
    group: "综合系统",
    icon: "🏛️",
    title: "企业级 FastAPI:架构与分层",
    content: `# 企业级 FastAPI:架构与分层

## 一、什么是"企业级"

"企业级"不是代码行数多,而是满足四个特征:

| 特征 | 含义 | 反例 |
|------|------|------|
| 可维护 | 改一个功能只动一处,别人看得懂 | 一个接口写 300 行,改一处牵十处 |
| 可测试 | 业务逻辑能脱离 HTTP/数据库单测 | 必须连真数据库才能跑测试 |
| 可扩展 | 加模块/换组件不动核心 | 加个缓存要改 20 个文件 |
| 可部署 | 配置外置、容器化、有健康检查 | 配置写死代码、无 Dockerfile |

"能跑"和"企业级"差的就是这四点。教学项目能跑就行,企业项目必须经得起这四条拷问。本章我们围绕这四点搭企业级骨架,下一章往里填完整业务。

## 二、分层架构详解

企业级项目普遍采用**四层架构**,比上一章多了一层 Repository 的抽象:

\`\`\`
HTTP 请求
   ↓
[Router 路由层]     接 HTTP、参数校验、调 Service、包装响应
   ↓
[Service 服务层]   业务逻辑、事务、调 Repository
   ↓
[Repository 仓储层] 数据访问抽象,封装 ORM 调用
   ↓
[Model 模型层]     表结构定义
   ↓
数据库
\`\`\`

### 每层职责(严格边界)

| 层 | 该做 | 不该做 |
|----|------|--------|
| Router | 解析请求、调用 Service、序列化响应 | 写业务 if/else、写 SQL、操作 session |
| Service | 业务规则、事务边界、编排多 Repository | 碰 request/response、写 SQL |
| Repository | 增删改查、过滤、分页、批量操作 | 写业务判断(库存够不够)、调其他 Service |
| Model | 表结构、字段、关系 | 含业务方法 |

**为什么要 Repository 层?** 上章我们把 Repository 和数据访问混在一起,小项目可以。企业项目里 Repository 的价值是:

1. **可替换**:Repository 接口固定,实现可以从 SQLAlchemy 换成 Mongo、Redis、外部 API,Service 不用改。
2. **可测试**:Service 测试时可以 mock 一个假 Repository,不连数据库。
3. **复用**:多个 Service 共享同一套数据访问逻辑,不重复写 SQL。

### demo:分层架构实现

下面用"用户查询"展示完整四层调用链:

\`\`\`python
# app/models/user.py
# Model 层:纯表结构
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base

class User(Base):
    "用户表"
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, index=True)
    email = Column(String(128), unique=True)
    password_hash = Column(String(128))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


# app/repositories/user_repository.py
# Repository 层:数据访问,不含业务
from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    "用户仓储:封装 users 表所有读写"
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def list(self, skip: int, limit: int) -> list[User]:
        return self.db.query(User).offset(skip).limit(limit).all()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def save(self, user: User) -> User:
        self.db.flush()
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()


# app/services/user_service.py
# Service 层:业务逻辑,依赖 UserRepository
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.exceptions import BizException

class UserService:
    "用户业务:校验、密码、状态"
    def __init__(self, user_repo: UserRepository):
        # 依赖注入:Service 持有 Repository,不直接持有 db
        self.user_repo = user_repo

    def get_user(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise BizException(40401, "用户不存在")
        return user

    def list_users(self, page: int, size: int):
        skip = (page - 1) * size
        return self.user_repo.list(skip, size)

    def create_user(self, username: str, email: str, password: str) -> User:
        # 业务规则:用户名不能重复
        if self.user_repo.get_by_username(username):
            raise BizException(40402, "用户名已存在")
        user = User(username=username, email=email, password_hash=self._hash(password))
        self.user_repo.create(user)
        return user

    def _hash(self, password: str) -> str:
        "密码哈希:生产用 passlib bcrypt,这里简化"
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()


# app/routers/users.py
# Router 层:HTTP 入口
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, EmailStr
from app.core.database import get_db, get_user_service
from app.core.response import success
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["用户"])

class UserCreate(BaseModel):
    username: str
    email: EmailStr          # Pydantic 自动校验邮箱格式
    password: str

@router.get("/{user_id}")
def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    "用户详情"
    user = service.get_user(user_id)
    return success({"id": user.id, "username": user.username, "email": user.email})

@router.get("/")
def list_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    service: UserService = Depends(get_user_service),
):
    "用户列表"
    return success(service.list_users(page, size))

@router.post("/")
def create_user(payload: UserCreate, service: UserService = Depends(get_user_service)):
    "创建用户"
    user = service.create_user(payload.username, payload.email, payload.password)
    return success({"id": user.id})
\`\`\`

注意 Service 的 \`__init__\` 接收的是 \`UserRepository\` 而不是 \`Session\`。这是企业级的关键:**Service 依赖抽象,不依赖具体实现**。测试时可以传一个假的 Repository(返回固定数据),Service 完全不碰数据库。

## 三、依赖注入设计

FastAPI 的 \`Depends\` 是企业级项目的核心武器。它解决"对象怎么组装"的问题——传统写法在路由里 \`new\` 各种 Service/Repository,\`Depends\` 让你声明需要什么,框架自动注入。

### demo:依赖注入

\`\`\`python
# app/core/database.py
# 数据库依赖:提供 db、repository、service 的依赖工厂
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    "Session 依赖:请求级生命周期"
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== 依赖链:db → repository → service =====
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService

def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    "Repository 依赖:接收 db,构造 repository"
    return UserRepository(db)

def get_user_service(repo: UserRepository = Depends(get_user_repository)) -> UserService:
    "Service 依赖:接收 repository,构造 service"
    return UserService(repo)
\`\`\`

依赖链 \`get_db → get_user_repository → get_user_service\` 由 FastAPI 自动解析:

- 路由声明 \`service: UserService = Depends(get_user_service)\`。
- 框架发现 \`get_user_service\` 依赖 \`get_user_repository\`。
- \`get_user_repository\` 又依赖 \`get_db\`。
- 一层层构造,最终把构造好的 service 注入路由。

好处:**整条依赖链只写一次,所有路由复用**。换实现(比如 Repository 改成 Redis 版)只改 \`get_user_repository\` 一处。

### 为什么 Service 接收 Repository 而不是 db

如果 Service 直接接收 db,内部还要 \`new UserRepository(db)\`,Service 就和数据访问绑死了。换成接口后:

- 测试 Service 时,传一个返回假数据的 Repository,不连数据库。
- 换 ORM(比如 SQLAlchemy 换 Tortoise),只改 Repository,Service 不动。
- Repository 可以加缓存层(装饰器模式),Service 透明。

## 四、配置管理

### demo:配置管理

\`\`\`python
# app/core/config.py
# 配置:类型安全 + 环境变量 + 多环境
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    "应用配置:所有可调参数集中于此"
    # 应用
    app_name: str = "企业级 FastAPI 后端"
    debug: bool = False
    environment: str = "dev"   # dev / staging / prod

    # 数据库
    database_url: str = "sqlite:///./app.db"
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # JWT
    jwt_secret: str = "change-me-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # CORS
    cors_origins: list[str] = ["*"]

    # 日志
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# 单例
settings = Settings()
\`\`\`

\`.env\` 文件示例:

\`\`\`bash
# .env
ENVIRONMENT=dev
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=a-very-long-random-string
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
LOG_LEVEL=DEBUG
\`\`\`

为什么用 pydantic-settings 而不是 \`os.getenv\`?

- \`os.getenv("DB_URL")\` 返回字符串,类型丢了,\`if not DB_URL\` 容易出 bug。
- pydantic-settings 自动转类型(\`debug: bool\` 从 "true" 转 True),还校验(\`jwt_secret\` 设为必填,漏配直接报错)。
- 支持嵌套和列表(\`cors_origins: list[str]\`)。

## 五、数据库会话管理

### demo:数据库 Session

企业级 Session 管理关注三点:**生命周期、事务、异常**:

\`\`\`python
# app/core/database.py(续)
# 增强 Session:自动事务提交与回滚
from contextlib import contextmanager
from fastapi import Request

@contextmanager
def transactional_session(db: Session):
    "事务型 session:正常提交,异常回滚"
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise

# 配合 Service 用:Service 自己控制 commit 时机
# 大多数 CRUD 用 get_db 即可,复杂事务用 transactional_session

# 中间件:每个请求结束确保 session 关闭(防泄漏)
@app.middleware("http")
async def db_cleanup_middleware(request: Request, call_next):
    response = await call_next(request)
    # 兜底:万一依赖没正确关闭 session,这里清一遍
    return response
\`\`\`

\`pool_pre_ping=True\` 让连接池每次借出连接前 ping 一下,避免拿到断连。MySQL/PG 长连接被服务端断开后,不 ping 会报 "server has gone away"。

## 六、中间件体系

中间件是"横切关注点"——每个请求都要做的事,但不属于业务。典型的有 CORS、日志、请求 ID、错误处理。

### demo:全局异常处理

\`\`\`python
# app/core/exceptions.py
# 全局异常体系:业务异常 + 兜底异常
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

class BizException(Exception):
    "业务异常:可预期,返回 200 + 业务错误码"
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

async def biz_exception_handler(request: Request, exc: BizException):
    return JSONResponse(
        status_code=200,
        content={"code": exc.code, "message": exc.message, "data": None},
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    "参数校验异常:FastAPI 自动抛,这里转成统一格式"
    return JSONResponse(
        status_code=422,
        content={"code": 42200, "message": "参数校验失败", "data": exc.errors()},
    )

async def unhandled_exception_handler(request: Request, exc: Exception):
    "兜底:未捕获异常,记录日志后返回 500,不向用户暴露堆栈"
    # 生产环境这里要写日志 + 告警
    return JSONResponse(
        status_code=500,
        content={"code": 50000, "message": "服务器内部错误", "data": None},
    )
\`\`\`

为什么分三种?业务异常是"可预期的错"(库存不足),要给用户看明文;参数校验是"前端传错了",422 提示哪个字段错;兜底是"代码 bug",绝不能把堆栈抛给用户。

### demo:请求日志中间件

\`\`\`python
# app/middleware/request_log.py
# 请求日志中间件:记录每个请求的方法、路径、耗时、状态码
import time
import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app.request")

class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 给每个请求分配唯一 ID,便于日志关联和链路追踪
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start = time.time()
        method = request.method
        path = request.url.path

        try:
            response = await call_next(request)
        except Exception as e:
            # 异常也要记录,且带上 request_id
            cost = (time.time() - start) * 1000
            logger.exception(f"[{request_id}] {method} {path} {cost:.1f}ms ERROR: {e}")
            raise

        cost = (time.time() - start) * 1000
        status = response.status_code
        logger.info(f"[{request_id}] {method} {path} {status} {cost:.1f}ms")

        # 把 request_id 写回响应头,前端/排查时能对上
        response.headers["X-Request-ID"] = request_id
        return response
\`\`\`

\`request_id\` 是排查问题的关键:用户反馈"接口慢",日志里 grep 这个 id 就能找到完整链路。生产环境配合 OpenTelemetry 还能跨服务追踪。

## 七、项目结构规范

大型项目的目录组织(比上一章电商更细):

\`\`\`
enterprise-app/
├── app/
│   ├── __init__.py
│   ├── main.py                # 入口
│   ├── core/                  # 核心基础设施(横切)
│   │   ├── config.py          # 配置
│   │   ├── database.py        # 数据库
│   │   ├── response.py        # 响应封装
│   │   ├── exceptions.py      # 异常
│   │   └── security.py        # JWT、密码
│   ├── middleware/            # 中间件
│   │   ├── request_log.py
│   │   └── rate_limit.py
│   ├── models/                # 模型层
│   │   ├── user.py
│   │   ├── product.py
│   │   └── order.py
│   ├── repositories/          # 仓储层
│   │   ├── base.py            # 基类(通用 CRUD)
│   │   ├── user_repository.py
│   │   └── product_repository.py
│   ├── services/              # 服务层
│   │   ├── user_service.py
│   │   └── product_service.py
│   ├── schemas/               # Pydantic 模型
│   │   ├── user.py
│   │   └── common.py          # 分页、响应通用 schema
│   ├── routers/               # 路由层
│   │   ├── deps.py            # 公共依赖
│   │   ├── users.py
│   │   └── products.py
│   └── utils/                 # 工具
│       └── pagination.py
├── tests/                     # 测试(与 app 平级)
│   ├── conftest.py            # pytest 配置
│   ├── test_user_service.py
│   └── test_user_router.py
├── alembic/                   # 数据库迁移
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env
\`\`\`

关键规范:
- \`tests/\` 与 \`app/\` 平级,不混在业务代码里。
- \`repositories/base.py\` 提供通用 CRUD 基类,新 Repository 继承它,减少重复。
- \`routers/deps.py\` 集中放公共依赖(认证、分页参数),所有路由复用。

### Repository 基类示例

\`\`\`python
# app/repositories/base.py
# 通用 Repository 基类:减少重复 CRUD 代码
from typing import Generic, TypeVar, Type
from sqlalchemy.orm import Session
from app.core.database import Base

ModelT = TypeVar("ModelT", bound=Base)

class BaseRepository(Generic[ModelT]):
    "通用仓储:提供 get/list/create/delete,子类继承后只写特有查询"
    model: Type[ModelT]  # 子类设置具体的模型类

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> ModelT | None:
        return self.db.get(self.model, id)

    def list(self, skip: int = 0, limit: int = 20) -> list[ModelT]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj: ModelT) -> ModelT:
        self.db.add(obj)
        self.db.flush()
        return obj

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
        self.db.flush()


# app/repositories/user_repository.py
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    "用户仓储:继承通用 CRUD,只写用户特有的查询"
    model = User

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()
\`\`\`

泛型基类让 \`UserRepository\` 不用重写 get/list/create,只写特有方法。**消除重复是企业级项目的基本功**。

## 八、企业级设计原则

落到实践,记住五条:

1. **依赖抽象,不依赖具体**:Service 依赖 Repository(接口/类),不直接依赖 db;换实现不动 Service。
2. **配置外置**:所有环境差异(数据库、密钥、域名)走 .env,代码零环境判断。
3. **事务边界在 Service**:Repository 只 flush 不 commit,Service 统一 commit,保证多步原子。
4. **统一出口**:响应、异常、日志三件套贯穿所有接口,前端只面对一种格式。
5. **可测试优先**:Service 不依赖 HTTP/数据库才能单测。能用 pytest 跑通的代码,架构才合格。

## 本章小结

| 要点 | 说明 |
|------|------|
| 企业级特征 | 可维护、可测试、可扩展、可部署 |
| 四层架构 | Router → Service → Repository → Model |
| Repository 价值 | 可替换、可测试、复用 |
| 依赖注入 | Depends 链式解析,声明即可得 |
| 配置管理 | pydantic-settings + .env,类型安全 |
| Session 管理 | get_db 请求级 + transactional 事务型 |
| 异常体系 | BizException + 校验异常 + 兜底 500 |
| 请求日志 | request_id 贯穿,便于链路追踪 |
| 项目结构 | core/middleware/models/repositories/services/schemas/routers |
| Repository 基类 | 泛型 BaseRepository 消除 CRUD 重复 |
| 设计原则 | 依赖抽象、配置外置、事务在 Service、统一出口、可测试优先 |

骨架到位了,下一章我们用这套架构完整实现用户/商品/订单三大模块,加上单元测试和 Docker 部署,交付一个真正"企业级"的 FastAPI 后端。`
  },

  // ============================================================
  // 第 4 章:实战:企业级 FastAPI 后端(完整实现)
  // ============================================================
  {
    id: "pyproject-fastapi-enterprise-impl",
    group: "综合系统",
    icon: "🚀",
    title: "实战:企业级 FastAPI 后端(完整实现)",
    content: `# 实战:企业级 FastAPI 后端(完整实现)

## 一、本章交付物

把上一章的架构骨架填满,交付一个**完整、可测、可部署**的 FastAPI 后端:

- 三大模块:用户(JWT 认证)、商品(CRUD + 分页)、订单(创建 + 状态机)。
- 完整分层:Repository → Service → Router,每层职责清晰。
- 单元测试:pytest + TestClient,脱离真实数据库跑通核心业务。
- Docker 化:Dockerfile + docker-compose,一键起服务。

代码逐行注释,可以直接跑。建议先建好上一章的目录结构,本章按顺序填文件。

## 二、基础设施

### 配置与数据库

\`\`\`python
# app/core/config.py
# 配置中心:所有可调参数集中,类型安全
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "企业级 FastAPI 后端"
    environment: str = "dev"
    debug: bool = True

    database_url: str = "sqlite:///./enterprise.db"
    db_pool_size: int = 5
    db_max_overflow: int = 10

    jwt_secret: str = "dev-secret-change-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    cors_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

settings = Settings()


# app/core/database.py
# 数据库引擎、Session、依赖工厂
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    "请求级 session"
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
\`\`\`

### 响应与异常

\`\`\`python
# app/core/response.py
# 统一响应封装
def success(data=None, message="ok"):
    return {"code": 0, "message": message, "data": data}


# app/core/exceptions.py
# 异常体系 + 处理器注册
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

class BizException(Exception):
    "业务异常"
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

async def biz_exception_handler(request: Request, exc: BizException):
    return JSONResponse(status_code=200, content={"code": exc.code, "message": exc.message, "data": None})

async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"code": 42200, "message": "参数校验失败", "data": exc.errors()})

async def unhandled_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"code": 50000, "message": "服务器内部错误", "data": None})
\`\`\`

## 三、Repository 层

### demo:Repository 模式

通用基类 + 各模块 Repository:

\`\`\`python
# app/repositories/base.py
# 通用仓储基类:消除 CRUD 重复
from typing import Generic, TypeVar, Type, Optional
from sqlalchemy.orm import Session
from app.core.database import Base

ModelT = TypeVar("ModelT", bound=Base)

class BaseRepository(Generic[ModelT]):
    model: Type[ModelT]

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Optional[ModelT]:
        return self.db.get(self.model, id)

    def list(self, skip: int = 0, limit: int = 20):
        q = self.db.query(self.model)
        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return items, total

    def create(self, obj: ModelT) -> ModelT:
        self.db.add(obj)
        self.db.flush()
        return obj

    def save(self, obj: ModelT) -> ModelT:
        self.db.flush()
        return obj

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
        self.db.flush()


# app/repositories/user_repository.py
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    model = User

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def list_active(self, skip: int, limit: int):
        q = self.db.query(User).filter(User.is_active == True)  # noqa: E712
        return q.offset(skip).limit(limit).all(), q.count()


# app/repositories/product_repository.py
from app.models.product import Product
from app.repositories.base import BaseRepository
from sqlalchemy import or_

class ProductRepository(BaseRepository[Product]):
    model = Product

    def search(self, skip: int, limit: int, keyword: str = "", category_id: int | None = None):
        q = self.db.query(Product)
        if keyword:
            q = q.filter(or_(Product.name.like(f"%{keyword}%"), Product.description.like(f"%{keyword}%")))
        if category_id is not None:
            q = q.filter(Product.category_id == category_id)
        total = q.count()
        items = q.order_by(Product.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def decrease_stock(self, product_id: int, qty: int) -> bool:
        "原子扣库存:WHERE stock >= qty"
        result = self.db.query(Product).filter(
            Product.id == product_id,
            Product.stock >= qty,
        ).update({Product.stock: Product.stock - qty}, synchronize_session=False)
        return result > 0
\`\`\`

Repository 只管"怎么读写",不写"库存够不够"的业务判断——那是 Service 的事。

## 四、Service 层

### demo:Service 层

Service 是业务核心,这里以用户和订单为例:

\`\`\`python
# app/services/user_service.py
# 用户业务:注册、登录、JWT 签发
from datetime import datetime, timedelta, timezone
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.exceptions import BizException
from app.core.config import settings
import jwt
import hashlib

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, username: str, email: str, password: str) -> User:
        # 业务规则:用户名不能重复
        if self.user_repo.get_by_username(username):
            raise BizException(40402, "用户名已存在")
        user = User(
            username=username,
            email=email,
            password_hash=self._hash(password),
        )
        self.user_repo.create(user)
        return user

    def login(self, username: str, password: str) -> str:
        "登录:校验密码 → 签发 JWT"
        user = self.user_repo.get_by_username(username)
        if not user or user.password_hash != self._hash(password):
            raise BizException(40403, "用户名或密码错误")
        if not user.is_active:
            raise BizException(40404, "账号已禁用")
        return self._issue_token(user)

    def _issue_token(self, user: User) -> str:
        "签发 JWT:payload 含 user_id 和过期时间"
        payload = {
            "sub": str(user.id),
            "username": user.username,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes),
        }
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    def _hash(self, password: str) -> str:
        "密码哈希:生产用 passlib bcrypt"
        return hashlib.sha256(password.encode()).hexdigest()


# app/services/order_service.py
# 订单业务:创建订单 + 库存扣减 + 状态机
import time
from app.models.order import Order, OrderItem
from app.repositories.product_repository import ProductRepository
from app.repositories.user_repository import UserRepository
from app.core.exceptions import BizException
from sqlalchemy.orm import Session

class OrderService:
    def __init__(self, db: Session, product_repo: ProductRepository, user_repo: UserRepository):
        self.db = db
        self.product_repo = product_repo
        self.user_repo = user_repo

    def create_order(self, user_id: int, items: list[dict]) -> Order:
        "创建订单:校验用户 → 校验商品 → 扣库存 → 建单 → 建明细 → 提交"
        # 校验用户存在且启用
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise BizException(40401, "用户不存在或已禁用")

        # 校验商品存在 + 扣库存(原子)
        total = 0.0
        for item in items:
            product = self.product_repo.get_by_id(item["product_id"])
            if not product:
                raise BizException(40405, f"商品 {item['product_id']} 不存在")
            if not self.product_repo.decrease_stock(item["product_id"], item["qty"]):
                raise BizException(40001, f"商品 {product.name} 库存不足")
            total += product.price * item["qty"]

        # 建订单主表
        order = Order(
            order_no=f"ORD{int(time.time() * 1000)}",
            user_id=user_id,
            status="pending",
            total=round(total, 2),
        )
        self.db.add(order)
        self.db.flush()

        # 建明细(价格快照)
        for item in items:
            product = self.product_repo.get_by_id(item["product_id"])
            self.db.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                qty=item["qty"],
                price=product.price,
            ))

        self.db.commit()  # 事务提交:扣库存 + 建单原子
        return order

    def transit_status(self, order_id: int, action: str) -> Order:
        "状态机:action 决定流转"
        order = self.db.get(Order, order_id)
        if not order:
            raise BizException(40002, "订单不存在")
        # 状态流转规则表
        transitions = {
            "pay":     ("pending", "paid"),
            "ship":    ("paid", "shipped"),
            "deliver": ("shipped", "completed"),
            "cancel":  (None, "cancelled"),  # 多种状态可取消
        }
        if action not in transitions:
            raise BizException(40003, f"未知动作 {action}")
        from_status, to_status = transitions[action]
        if from_status and order.status != from_status:
            raise BizException(40003, f"订单状态 {order.status} 不可执行 {action}")
        # 取消要回滚库存
        if action == "cancel" and order.status not in ("pending", "paid"):
            raise BizException(40003, "当前状态不可取消")
        if action == "cancel":
            for item in self.db.query(OrderItem).filter(OrderItem.order_id == order.id).all():
                product = self.product_repo.get_by_id(item.product_id)
                product.stock += item.qty
        order.status = to_status
        self.db.commit()
        return order
\`\`\`

把状态流转规则用字典 \`transitions\` 表达,比一堆 if/else 清晰得多。**用数据结构表达规则,是消除 if/else 地狱的关键**。

## 五、Router 层

### demo:Router 层

Router 只做 HTTP 三件事:解析入参、调 Service、包装响应。

\`\`\`python
# app/routers/deps.py
# 公共依赖:db、各 repository、各 service、当前用户(JWT 解析)
from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.product_repository import ProductRepository
from app.services.user_service import UserService
from app.services.order_service import OrderService
from app.core.config import settings
from app.core.exceptions import BizException
import jwt

def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_product_repo(db: Session = Depends(get_db)) -> ProductRepository:
    return ProductRepository(db)

def get_user_service(repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(repo)

def get_order_service(
    db: Session = Depends(get_db),
    product_repo: ProductRepository = Depends(get_product_repo),
    user_repo: UserRepository = Depends(get_user_repo),
) -> OrderService:
    return OrderService(db, product_repo, user_repo)

def get_current_user(
    authorization: str = Header(...),
    user_repo: UserRepository = Depends(get_user_repo),
):
    "JWT 鉴权依赖:解析 token 拿到 user_id,再查用户"
    if not authorization.startswith("Bearer "):
        raise BizException(40101, "认证格式错误,需 Bearer token")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError:
        raise BizException(40102, "token 已过期")
    except jwt.InvalidTokenError:
        raise BizException(40103, "token 无效")
    user_id = int(payload["sub"])
    user = user_repo.get_by_id(user_id)
    if not user:
        raise BizException(40104, "用户不存在")
    return user


# app/routers/users.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from app.routers.deps import get_user_service, get_current_user
from app.core.response import success
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter(prefix="/users", tags=["用户"])

class RegisterIn(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(payload: RegisterIn, service: UserService = Depends(get_user_service)):
    "注册"
    user = service.register(payload.username, payload.email, payload.password)
    return success({"id": user.id})

@router.post("/login")
def login(payload: LoginIn, service: UserService = Depends(get_user_service)):
    "登录,返回 JWT"
    token = service.login(payload.username, payload.password)
    return success({"token": token})

@router.get("/me")
def me(current: User = Depends(get_current_user)):
    "当前用户信息(需登录)"
    return success({"id": current.id, "username": current.username, "email": current.email})


# app/routers/orders.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.routers.deps import get_order_service, get_current_user
from app.core.response import success
from app.services.order_service import OrderService
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["订单"])

class OrderItemIn(BaseModel):
    product_id: int
    qty: int

class OrderCreateIn(BaseModel):
    items: list[OrderItemIn]

@router.post("/")
def create_order(payload: OrderCreateIn, current: User = Depends(get_current_user),
                 service: OrderService = Depends(get_order_service)):
    "创建订单(需登录)"
    order = service.create_order(current.id, [i.model_dump() for i in payload.items])
    return success({"order_id": order.id, "order_no": order.order_no, "total": order.total})

@router.post("/{order_id}/{action}")
def transit(order_id: int, action: str, current: User = Depends(get_current_user),
            service: OrderService = Depends(get_order_service)):
    "订单状态流转:action = pay/ship/deliver/cancel"
    order = service.transit_status(order_id, action)
    return success({"order_id": order.id, "status": order.status})
\`\`\`

\`get_current_user\` 依赖是鉴权的关键:需要登录的接口加 \`current: User = Depends(get_current_user)\`,框架自动校验 token、注入用户。没带 token 或 token 失效,请求根本进不到函数体。

## 六、应用入口

\`\`\`python
# app/main.py
# 应用入口:组装一切
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.exceptions import (
    BizException, biz_exception_handler,
    validation_handler, unhandled_handler,
)
from fastapi.exceptions import RequestValidationError
from app.middleware.request_log import RequestLogMiddleware
from app.routers import users, orders, products

# 建表(开发期);生产用 alembic 迁移
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="企业级 FastAPI 后端:用户/商品/订单 + JWT + 分层",
)

# 中间件:请求日志(最先注册,最外层)
app.add_middleware(RequestLogMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 异常处理器
app.add_exception_handler(BizException, biz_exception_handler)
app.add_exception_handler(RequestValidationError, validation_handler)
app.add_exception_handler(Exception, unhandled_handler)

# 路由
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)

@app.get("/health")
def health():
    "健康检查:容器探针用"
    return {"status": "ok"}

@app.get("/")
def root():
    return {"app": settings.app_name, "docs": "/docs", "health": "/health"}
\`\`\`

## 七、单元测试

### demo:单元测试

pytest + TestClient,核心是 Service 层测试**不连真实数据库**(用 SQLite 内存库):

\`\`\`python
# tests/conftest.py
# 测试夹具:内存数据库 + 测试 client
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app

# 内存 SQLite:测试完即销毁,不污染开发库
TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    "每个测试函数一个独立 session,互不影响"
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    "测试 client:覆盖 get_db 依赖,指向测试 session"
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


# tests/test_user_service.py
# Service 层单测:直接构造 repository + service,不经过 HTTP
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.core.exceptions import BizException

def test_register_success(db_session):
    "注册成功"
    service = UserService(UserRepository(db_session))
    user = service.register("alice", "alice@example.com", "pass123")
    assert user.id is not None
    assert user.username == "alice"

def test_register_duplicate(db_session):
    "重复用户名应抛业务异常"
    service = UserService(UserRepository(db_session))
    service.register("alice", "a@x.com", "p")
    try:
        service.register("alice", "b@x.com", "p")
        assert False, "应抛异常"
    except BizException as e:
        assert e.code == 40402

def test_login_wrong_password(db_session):
    "密码错误应抛异常"
    service = UserService(UserRepository(db_session))
    service.register("bob", "b@x.com", "right")
    try:
        service.login("bob", "wrong")
        assert False
    except BizException as e:
        assert e.code == 40403


# tests/test_user_router.py
# Router 层测试:走 HTTP,覆盖端到端
def test_register_and_login(client):
    "完整流程:注册 → 登录 → 查 me"
    # 注册
    r = client.post("/users/register", json={"username": "carol", "email": "c@x.com", "password": "p"})
    assert r.status_code == 200
    assert r.json()["code"] == 0

    # 登录
    r = client.post("/users/login", json={"username": "carol", "password": "p"})
    assert r.json()["code"] == 0
    token = r.json()["data"]["token"]
    assert token

    # 带 token 查 me
    r = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.json()["data"]["username"] == "carol"

def test_me_without_token(client):
    "未带 token 应被拒"
    r = client.get("/users/me")
    assert r.json()["code"] != 0
\`\`\`

\`dependency_overrides[get_db]\` 是测试关键:把生产依赖替换成测试 session,Service 内部拿到的 db 就是内存库,测完即弃。**不改一行业务代码,完成依赖替换**——这就是依赖注入的威力。

运行测试:\`pytest tests/ -v\`。Service 测试不启动 HTTP,毫秒级;Router 测试用 TestClient,秒级。两者结合覆盖业务和接口。

## 八、Docker 化部署

### demo:Docker 部署

\`\`\`dockerfile
# Dockerfile
# 多阶段构建:builder 装依赖,运行镜像精简
FROM python:3.11-slim AS builder

# 不写 .pyc、缓冲区直刷,日志实时输出
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 先装依赖(利用 Docker 层缓存,改代码不重装)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 运行阶段:复制代码
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

# 暴露端口
EXPOSE 8000

# 用 uvicorn 启动,生产不用 reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
# 一键起 app + postgres
version: "3.9"
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=prod
      - DEBUG=False
      - DATABASE_URL=postgresql://app:app@db:5432/enterprise
      - JWT_SECRET=change-this-to-a-long-random-string
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: enterprise
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
\`\`\`

\`\`\`txt
# requirements.txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.6.0
pydantic-settings==2.1.0
psycopg2-binary==2.9.9
pyjwt==2.8.0
email-validator==2.1.0
\`\`\`

启动:\`docker-compose up --build\`,访问 \`http://localhost:8000/docs\`。健康检查 \`/health\` 给容器探针用,K8s/Compose 据此判断容器是否就绪。

### demo:完整 API 运行

启动后的完整使用流程:

\`\`\`bash
# 1. 注册用户
curl -X POST http://localhost:8000/users/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"alice","email":"a@x.com","password":"p"}'

# 2. 登录拿 token
TOKEN=$(curl -s -X POST http://localhost:8000/users/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"alice","password":"p"}' | jq -r '.data.token')

# 3. 创建商品(需管理员权限,这里简化)
curl -X POST http://localhost:8000/products/ \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"键盘","price":199,"stock":10,"category_id":1}'

# 4. 创建订单
curl -X POST http://localhost:8000/orders/ \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"items":[{"product_id":1,"qty":2}]}'

# 5. 支付订单
curl -X POST http://localhost:8000/orders/1/pay \\
  -H "Authorization: Bearer $TOKEN"

# 6. 查看统计
curl http://localhost:8000/stats/summary
\`\`\`

### demo:接口文档

FastAPI 自动生成两套文档,**写完代码即有文档**,无需维护:

- Swagger UI:\`http://localhost:8000/docs\` —— 可交互测试,带 "Try it out"。
- ReDoc:\`http://localhost:8000/redoc\` —— 只读美观,适合对外发布。
- OpenAPI JSON:\`http://localhost:8000/openapi.json\` —— 原始规范,可导入 Postman/Apifox。

文档质量取决于代码里的注解质量:

\`\`\`python
@router.post("/", summary="创建订单", description="需登录,自动扣库存,失败回滚",
             responses={40001: {"description": "库存不足"}, 40405: {"description": "商品不存在"}})
def create_order(...):
    "创建订单的 docstring 会显示在文档详细说明里"
    ...
\`\`\`

\`summary\` 是接口列表里的一句话,\`description\` 是详细说明,docstring 是更长的描述,三者都自动进文档。**代码即文档**,这是 FastAPI 对协作效率最大的提升。

## 九、企业级最佳实践总结

把这套教程的全部要点归纳成清单,落地时照着对:

### 架构与分层
1. **四层架构**:Router → Service → Repository → Model,职责边界严格。
2. **Repository 抽象**:Service 依赖 Repository 接口,不直接依赖 db,可替换可测试。
3. **事务在 Service**:Repository 只 flush,Service 统一 commit,保证多步原子。
4. **Repository 基类**:泛型 BaseRepository 消除 CRUD 重复,子类只写特有查询。

### 依赖注入
5. **依赖链**:get_db → get_repository → get_service,Depends 自动解析。
6. **测试替换**:dependency_overrides 一行替换依赖,业务代码不动。
7. **鉴权依赖**:get_current_user 作为依赖,需要登录的接口声明即可。

### 配置与基础设施
8. **配置外置**:pydantic-settings + .env,类型安全,环境隔离。
9. **连接池**:pool_pre_ping 防断连,pool_size/max_overflow 按负载调。
10. **建表与迁移**:开发 create_all,生产 Alembic 迁移,绝不裸 drop。

### 异常与响应
11. **统一响应**:{code, message, data},业务码与 HTTP 码分离。
12. **三级异常**:BizException(业务) + ValidationError(参数) + 兜底 500。
13. **不暴露堆栈**:500 只返回通用提示,堆栈进日志。

### 中间件与可观测
14. **请求 ID**:每个请求分配 uuid,日志贯穿,便于链路追踪。
15. **请求日志**:方法、路径、状态码、耗时,出问题第一时间看。
16. **健康检查**:/health 端点,容器探针用。

### 安全
17. **密码哈希**:passlib bcrypt,绝不存明文。
18. **JWT 鉴权**:签发 + 校验 + 过期,Header 携带。
19. **CORS 限制**:生产只放具体域名,不用 *。

### 部署
20. **多阶段构建**:builder 装依赖,运行镜像精简。
21. **依赖固定**:requirements.txt 锁版本,可复现。
22. **compose 编排**:app + db 一键起,healthcheck 控制启动顺序。
23. **文档自动**:代码注解驱动 /docs,不维护额外文档。

### 测试
24. **内存库测试**:SQLite :memory:,测完即弃,不污染开发库。
25. **Service 单测**:不连 HTTP/真实库,毫秒级跑通核心业务。
26. **Router 集成测试**:TestClient 走 HTTP,覆盖鉴权和响应格式。

## 本章小结

| 交付物 | 说明 |
|--------|------|
| 三大模块 | 用户(JWT) + 商品(CRUD) + 订单(状态机) |
| Repository | BaseRepository 泛型基类 + 各模块特有查询 |
| Service | 业务逻辑 + 事务 + 状态机(数据结构表达规则) |
| Router | 只做 HTTP 三件事,鉴权靠依赖注入 |
| 异常体系 | BizException + ValidationError + 兜底 |
| 单元测试 | SQLite 内存库 + dependency_overrides |
| Docker | 多阶段构建 + compose + healthcheck |
| 文档 | 自动生成 Swagger/ReDoc,代码即文档 |

至此,一个**可维护、可测试、可扩展、可部署**的企业级 FastAPI 后端就完整交付了。把这套骨架和清单吃透,无论是接着加支付、营销、库存分仓,还是迁移到别的业务领域,都能稳稳接住。`
  }
];
