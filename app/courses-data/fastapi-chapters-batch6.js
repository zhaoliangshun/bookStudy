// =============================================================
// FastAPI 应用开发实战教程 - 第 6 批章节（依赖注入 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-depends   : Depends 依赖基础
//   fa-yield-dep : yield 依赖与资源管理
//   fa-nested-dep: 依赖嵌套与组合
//   fa-class-dep : 类与全局依赖
// ============================================================

export const chapters = [
  // ============================================================
  // 第 21 章：Depends 依赖基础
  // ============================================================
  {
    id: "fa-depends",
    group: "依赖注入",
    icon: "💉",
    title: "Depends 依赖基础",
    content: `# Depends 依赖基础

## 一、为什么需要依赖注入：从一个痛点讲起

写后端接口时，你一定遇到过这样的场景：每个接口都要校验用户登录态、都要从请求头取 token、都要拿数据库 session、都要做权限检查。如果用传统写法，你会写出这样的代码：

\`\`\`python
# ❌ 反模式：每个接口都自己处理一切
@app.get("/users")
def list_users(token: str = Header(...), page: int = Query(1), size: int = Query(20)):
    # 校验 token
    if not verify_token(token):
        raise HTTPException(401)
    # 拿数据库 session
    db = get_db()
    # 查询用户
    users = db.query(User).offset((page-1)*size).limit(size).all()
    return users

@app.get("/orders")
def list_orders(token: str = Header(...), page: int = Query(1), size: int = Query(20)):
    # 又是 token 校验
    if not verify_token(token):
        raise HTTPException(401)
    # 又是 db session
    db = get_db()
    # 查询订单
    orders = db.query(Order).offset((page-1)*size).limit(size).all()
    return orders
\`\`\`

这种写法有三个明显问题：

1. **重复代码堆积**：token 校验、db 获取、分页参数解析，每个接口都抄一遍。改一处要改几十处。
2. **业务逻辑和基础设施耦合**：\`list_users\` 本该只关心"查用户"，却被迫关心 token 怎么校验、db 怎么拿。
3. **测试困难**：想 mock 数据库？想跳过 token 校验做单元测试？难，因为它们和业务逻辑焊死在一起。

依赖注入（Dependency Injection，简称 DI）就是解决这些问题的标准方案。它的核心思想是：**把"组件需要的东西"从外部传入，而不是在组件内部自己创建**。

## 二、控制反转（IoC）：依赖注入背后的设计思想

依赖注入是"控制反转"（Inversion of Control, IoC）原则的一种实现。理解 IoC 是理解 DI 的前提。

**传统模式：组件主动获取依赖**

\`\`\`python
# 组件自己去拿 db
def get_user():
    db = Database()          # 组件主动创建依赖
    user = db.find(1)        # 组件主动调用
    db.close()               # 组件主动管理生命周期
    return user
\`\`\`

控制权在组件自己手里：什么时候创建 db、怎么创建、什么时候销毁，都是组件说了算。

**IoC 模式：容器主动注入依赖**

\`\`\`python
# 组件声明"我需要 db"，由外部容器提供
def get_user(db: Database):  # 声明依赖，不创建
    return db.find(1)        # 只用，不管创建和销毁
\`\`\`

控制权反转了：组件不再主动创建依赖，而是声明"我需要什么"，由外部容器（在 FastAPI 里就是框架本身）负责创建和注入。这就是"控制反转"——控制权从组件转移到了容器。

IoC 的好处：

- **解耦**：组件不依赖具体实现，只依赖接口/类型。换数据库实现？换 mock？都不用改组件代码。
- **可测试**：测试时可以注入 mock 依赖，不需要真连数据库。
- **复用**：同一个 db 实例可以注入到多个组件，避免重复创建。
- **生命周期集中管理**：创建、复用、销毁都由容器统一管理，组件不用操心。

FastAPI 的 \`Depends()\` 就是这个"容器"的入口。

## 三、FastAPI 的 Depends() 工作原理

\`Depends()\` 是 FastAPI 实现依赖注入的核心 API。它的用法很简单：把一个"可调用对象"（函数、类、方法）放进 \`Depends()\`，框架会在请求到来时自动调用它，把返回值注入到路由函数的参数里。

工作流程：

1. **声明阶段**：路由函数用 \`Depends(dependency)\` 声明依赖。
2. **请求到来**：FastAPI 解析路由函数签名，发现哪些参数是依赖。
3. **依赖解析**：递归地解析依赖（依赖本身也可能有依赖）。
4. **依赖调用**：按解析顺序调用依赖函数，拿到返回值。
5. **注入**：把依赖返回值作为参数传给路由函数。
6. **缓存**：同一请求内，相同依赖只调用一次，结果缓存复用。
7. **路由执行**：路由函数拿到所有依赖后执行业务逻辑。

底层实现上，FastAPI 用 \`pydantic\` 的字段校验 + 自己的依赖解析器，把路由函数签名解析成一棵"依赖树"，请求到来时按树的后序遍历顺序执行依赖。

## 四、第一个 Depends 示例：函数作为依赖

最简单的依赖就是一个普通函数：

\`\`\`python
# 从 fastapi 包导入 FastAPI 主类
from fastapi import FastAPI
# 从 fastapi 包导入 Depends 依赖注入装饰器
from fastapi import Depends

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义一个依赖函数：返回公共参数
# 这个函数本身不依赖任何东西，返回一个字典
def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    # q 是查询关键字（可选）
    # skip 是跳过条数（分页偏移，默认 0）
    # limit 是返回上限（默认 100）
    # 把这些参数打包成字典返回
    return {"q": q, "skip": skip, "limit": limit}

# 路由函数声明依赖：commons 参数 = Depends(common_parameters)
# FastAPI 会在请求到来时调用 common_parameters，把返回值赋给 commons
@app.get("/items/")
def read_items(commons: dict = Depends(common_parameters)):
    # commons 就是 common_parameters 的返回值
    # 这里直接返回它，实际项目会用 skip/limit 查数据库
    return {"message": "查询商品", "params": commons}

# 另一个路由复用同一个依赖
@app.get("/users/")
def read_users(commons: dict = Depends(common_parameters)):
    # 同样的依赖，不同的业务逻辑
    return {"message": "查询用户", "params": commons}
\`\`\`

请求 \`GET /items/?q=apple&skip=0&limit=10\`，FastAPI 会：

1. 发现 \`read_items\` 有依赖 \`common_parameters\`。
2. 从 query string 解析 \`q\`、\`skip\`、\`limit\`（因为依赖函数签名声明了这些参数）。
3. 调用 \`common_parameters(q="apple", skip=0, limit=10)\`，返回 \`{"q":"apple","skip":0,"limit":10}\`。
4. 把返回值注入到 \`commons\` 参数。
5. 调用 \`read_items(commons={"q":"apple",...})\`。

注意：**依赖函数的参数也是从请求中解析的**。FastAPI 把依赖函数和路由函数一视同仁——都是"可调用对象"，签名里的参数都会被解析。这是 FastAPI 依赖注入最巧妙的设计。

## 五、依赖的参数和返回值

依赖函数可以有参数（从请求解析），也可以有返回值（注入到路由函数）。返回值类型可以是任意 Python 对象：dict、Pydantic 模型、ORM 对象、自定义类实例。

\`\`\`python
# 导入 FastAPI 和 Depends
from fastapi import FastAPI, Depends
# 导入 pydantic 的 BaseModel
from pydantic import BaseModel

app = FastAPI()

# 定义返回值模型：分页参数
class PaginationParams(BaseModel):
    # 模型不再校验输入（依赖函数负责），这里只是类型标注
    page: int       # 当前页码
    size: int       # 每页条数
    offset: int     # 数据库偏移量（page-1)*size

# 依赖函数：解析分页参数，返回 PaginationParams 实例
def get_pagination(page: int = 1, size: int = 20):
    # page 默认 1，size 默认 20
    # 计算 offset：第 1 页 offset=0，第 2 页 offset=size
    offset = (page - 1) * size
    # 返回模型实例（不是 dict）
    return PaginationParams(page=page, size=size, offset=offset)

# 路由函数使用依赖
@app.get("/products")
def list_products(pagination: PaginationParams = Depends(get_pagination)):
    # pagination 是 PaginationParams 实例
    # 可以直接用 .page .size .offset 访问字段
    return {
        "msg": f"查询第 {pagination.page} 页，每页 {pagination.size} 条",
        "offset": pagination.offset,
    }
\`\`\`

这里依赖返回的是 Pydantic 模型实例，路由函数拿到后可以用 \`pagination.page\` 访问字段。相比返回 dict，模型实例有类型提示、IDE 自动补全、字段校验，更工程化。

## 六、依赖的缓存机制：同一请求内复用

FastAPI 有个重要特性：**同一个请求内，相同的依赖只执行一次，结果会被缓存**。多个参数依赖同一个 \`Depends\` 时，它们拿到的是同一个对象。

这个特性对数据库 session、认证用户这种"一个请求只需要一份"的资源特别重要。

\`\`\`python
# 导入 FastAPI 和 Depends
from fastapi import FastAPI, Depends

app = FastAPI()

# 计数器，用来观察依赖被调用几次
call_count = 0

# 依赖函数：每次调用计数器 +1
def get_request_id():
    # 声明全局变量（用于修改）
    global call_count
    # 计数器递增
    call_count += 1
    # 返回当前调用次数作为"请求 ID"
    return f"req-{call_count}"

# 路由函数：声明两个参数都依赖 get_request_id
@app.get("/test")
def test_endpoint(
    dep1: str = Depends(get_request_id),   # 第一次声明依赖
    dep2: str = Depends(get_request_id),   # 第二次声明同一个依赖
):
    # 关键观察：dep1 和 dep2 是否相同？
    return {
        "dep1": dep1,           # 例如 "req-1"
        "dep2": dep2,           # 也是 "req-1"（不是 req-2！）
        "same_object": dep1 == dep2,  # True
    }
\`\`\`

请求 \`GET /test\`，响应是：

\`\`\`json
{"dep1": "req-1", "dep2": "req-1", "same_object": true}
\`\`\`

\`get_request_id\` 只被调用了一次！第二次声明 \`Depends(get_request_id)\` 时，FastAPI 发现这个依赖已经执行过了，直接复用缓存的结果。

为什么这样设计？因为一个请求里，"当前用户"、"数据库 session"、"请求 ID"这些应该是唯一的。如果不缓存，一个接口声明三次 \`Depends(get_db)\` 就会创建三个数据库连接，浪费资源。

**如何禁用缓存**：用 \`use_cache=False\` 参数。

\`\`\`python
# 依赖函数：生成时间戳
import time

def get_timestamp():
    # 返回当前时间戳
    return time.time()

@app.get("/no-cache")
def no_cache_endpoint(
    t1: float = Depends(get_timestamp, use_cache=False),  # 禁用缓存
    t2: float = Depends(get_timestamp, use_cache=False),  # 又调用一次
):
    # t1 和 t2 会略有不同（虽然间隔极短）
    return {"t1": t1, "t2": t2, "diff": t2 - t1}
\`\`\`

实际项目中很少禁用缓存，知道有这个选项即可。

## 七、依赖用于权限检查

权限校验是依赖注入最经典的应用场景。把"解析 token + 校验权限"封装成依赖，路由函数只声明依赖就能享受保护。

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException, Header
# 导入 Optional 类型
from typing import Optional

app = FastAPI()

# 模拟用户数据库
fake_users_db = {
    "alice_token": {"username": "alice", "role": "admin"},
    "bob_token": {"username": "bob", "role": "user"},
}

# 依赖函数1：从 Header 取 token，校验并返回用户
def get_current_user(authorization: Optional[str] = Header(None)):
    # authorization 是请求头里的 Authorization 字段
    # 如果没传 token，返回 401
    if not authorization:
        # 抛出 401 未授权异常
        raise HTTPException(status_code=401, detail="缺少 Authorization 头")
    # 去掉 "Bearer " 前缀，拿到真正的 token
    token = authorization.replace("Bearer ", "")
    # 从模拟数据库查用户
    user = fake_users_db.get(token)
    # 用户不存在
    if not user:
        # 抛出 401
        raise HTTPException(status_code=401, detail="无效的 token")
    # 返回用户对象
    return user

# 依赖函数2：在 get_current_user 基础上校验是否是 admin
def get_admin_user(user: dict = Depends(get_current_user)):
    # user 是 get_current_user 的返回值（被缓存复用）
    # 检查角色
    if user["role"] != "admin":
        # 非 admin 抛 403
        raise HTTPException(status_code=403, detail="需要管理员权限")
    # 返回用户
    return user

# 普通接口：只需登录
@app.get("/profile")
def get_profile(user: dict = Depends(get_current_user)):
    # user 已经过校验，直接用
    return {"profile": user}

# 管理员接口：需要 admin 角色
@app.get("/admin/dashboard")
def admin_dashboard(user: dict = Depends(get_admin_user)):
    # 走 get_admin_user 依赖，已校验 admin
    return {"msg": f"欢迎管理员 {user['username']}"}
\`\`\`

访问 \`GET /profile\` 带 \`Authorization: Bearer alice_token\`，会返回用户信息。带 \`bob_token\` 也能访问（因为 bob 也是登录用户）。

访问 \`GET /admin/dashboard\` 带 \`bob_token\`，会被 \`get_admin_user\` 拦截返回 403。带 \`alice_token\` 才能通过。

注意：\`get_admin_user\` 内部依赖 \`get_current_user\`，路由函数又依赖 \`get_admin_user\`。FastAPI 会先执行 \`get_current_user\`，再执行 \`get_admin_user\`，最后执行路由函数。这就是嵌套依赖（下一章详细讲）。

## 八、依赖用于数据库 Session

数据库 session 是另一个经典场景。每个请求需要一个独立的 session，请求结束自动关闭。

\`\`\`python
# 导入 FastAPI 和 Depends
from fastapi import FastAPI, Depends
# 导入 SQLAlchemy 相关组件
# create_engine: 创建数据库引擎（连接池）
# Column: 定义表字段
# Integer, String: 字段类型
from sqlalchemy import create_engine, Column, Integer, String
# declarative_base: 创建 ORM 模型基类
# sessionmaker: 创建 Session 工厂
# Session: Session 类型（用于类型注解）
from sqlalchemy.orm import declarative_base, sessionmaker, Session

app = FastAPI()

# 创建数据库引擎（SQLite，内存数据库，方便演示）
# "sqlite:///:memory:" 表示内存数据库（重启数据丢失）
# echo=False 不打印 SQL 日志（开发时可以设 True 调试）
engine = create_engine("sqlite:///:memory:", echo=False)
# 创建 Session 工厂
# sessionmaker 是一个工厂类，调用它创建 Session 实例
# bind=engine 表示 Session 用这个引擎连接数据库
SessionLocal = sessionmaker(bind=engine)
# 创建模型基类
# 所有 ORM 模型都要继承 Base
Base = declarative_base()

# 定义 User 模型
class User(Base):
    # __tablename__ 指定数据库表名
    __tablename__ = "users"
    # primary_key=True 表示主键
    id = Column(Integer, primary_key=True)
    # String 类型，不指定长度默认 VARCHAR
    name = Column(String)
    age = Column(Integer)

# 创建表
# Base.metadata.create_all 会根据所有继承 Base 的模型创建表
# 如果表已存在则跳过
Base.metadata.create_all(engine)

# 依赖函数：获取数据库 session
def get_db():
    # 创建 session 实例
    # 每个请求创建独立 session，保证事务隔离
    db = SessionLocal()
    try:
        # yield 把 db 交给路由函数使用
        yield db
    finally:
        # 路由函数执行完毕后，关闭 session
        # finally 保证即使抛异常也会关闭，防止连接泄漏
        db.close()

# 路由函数：声明依赖 db: Session
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    # 用 db 查询用户
    # db.query(User) 相当于 SELECT * FROM users
    # .filter(User.id == user_id) 相当于 WHERE id = ?
    # .first() 取第一条，没有则返回 None
    user = db.query(User).filter(User.id == user_id).first()
    # 用户不存在返回 404
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="用户不存在")
    # 返回用户信息
    return {"id": user.id, "name": user.name, "age": user.age}

# 创建用户的接口
@app.post("/users")
def create_user(name: str, age: int, db: Session = Depends(get_db)):
    # 创建 User 实例（此时还没写入数据库）
    user = User(name=name, age=age)
    # 添加到 session（还没提交到数据库）
    db.add(user)
    # 提交事务（真正写入数据库）
    db.commit()
    # 刷新获取自增 id
    # commit 后 user.id 还是 None，refresh 从数据库重新加载
    db.refresh(user)
    return {"id": user.id, "name": user.name, "age": user.age}
\`\`\`

这里用了 \`yield db\` 而不是 \`return db\`，这是 yield 依赖（下一章主题）。它保证请求结束后 session 一定会被关闭，即使路由函数抛异常。

## 九、依赖用于公共参数：避免重复声明

接口里很多参数是公共的：分页参数、排序参数、过滤参数。每个接口都声明一遍很冗余，用依赖封装。

\`\`\`python
# 导入 FastAPI、Depends、Query
from fastapi import FastAPI, Depends, Query
# 导入 Optional
from typing import Optional
# 导入 pydantic BaseModel
from pydantic import BaseModel

app = FastAPI()

# 公共查询参数依赖
def common_query_params(
    # q 是搜索关键字，可选
    # Query(None, ...) 第一个参数 None 是默认值（没传时返回 None）
    # description 用于 OpenAPI 文档展示
    q: Optional[str] = Query(None, description="搜索关键字"),
    # skip 是偏移量
    # ge=0 表示值必须 >= 0（大于等于 0）
    skip: int = Query(0, ge=0, description="跳过条数"),
    # limit 是上限
    # ge=1 最小 1，le=100 最大 100（防止客户端请求过多数据）
    limit: int = Query(10, ge=1, le=100, description="返回上限"),
):
    # 打包成字典返回
    return {"q": q, "skip": skip, "limit": limit}

# 排序参数依赖
def sort_params(
    # sort_by 是排序字段
    sort_by: str = Query("id", description="排序字段"),
    # order 是排序方向
    # regex="^(asc|desc)$" 用正则校验，只接受 asc 或 desc
    order: str = Query("asc", regex="^(asc|desc)$", description="排序方向"),
):
    return {"sort_by": sort_by, "order": order}

# 商品列表接口：组合两个依赖
@app.get("/products")
def list_products(
    commons: dict = Depends(common_query_params),
    sort: dict = Depends(sort_params),
):
    # 模拟查询
    return {
        "msg": "商品列表",
        "query": commons,    # {q, skip, limit}
        "sort": sort,        # {sort_by, order}
    }

# 订单列表接口：复用同样的依赖
@app.get("/orders")
def list_orders(
    commons: dict = Depends(common_query_params),
    sort: dict = Depends(sort_params),
):
    return {
        "msg": "订单列表",
        "query": commons,
        "sort": sort,
    }
\`\`\`

如果以后要加一个"是否包含已删除"的过滤参数，只需要改 \`common_query_params\` 一个地方，所有接口自动支持。这就是依赖复用的威力。

## 十、实战：通用分页参数依赖

把分页参数封装成可复用的依赖，并配上响应模型：

\`\`\`python
# 导入 FastAPI、Depends、Query
from fastapi import FastAPI, Depends, Query
# 导入 pydantic
from pydantic import BaseModel, Field
# 导入泛型
from typing import Generic, TypeVar, List

app = FastAPI()

# 定义泛型类型变量
# TypeVar("T") 创建一个类型变量，可以在泛型类中使用
T = TypeVar("T")

# 分页响应模型（泛型）
# Generic[T] 让类支持泛型，T 是占位类型
# 用法：PageResponse[Product]、PageResponse[Order] 等
class PageResponse(BaseModel, Generic[T]):
    # 当前页码
    page: int
    # 每页条数
    size: int
    # 总条数
    total: int
    # 数据列表（泛型）
    # List[T] 表示 T 类型的列表，具体类型由使用时决定
    items: List[T]

# 分页参数依赖
def get_page_params(
    # 页码，最小 1
    # ge=1 保证页码从 1 开始（不允许 0 或负数）
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    # 每页条数，1-100 之间
    # le=100 限制最大 100，防止客户端请求过多数据拖垮服务
    size: int = Query(20, ge=1, le=100, description="每页条数"),
):
    # 返回分页参数
    return {"page": page, "size": size}

# 商品模型
class Product(BaseModel):
    id: int
    name: str
    price: float

# 模拟商品数据
fake_products = [
    Product(id=i, name=f"商品{i}", price=i * 10.0)
    for i in range(1, 101)
]

# 商品列表接口：使用分页依赖 + 分页响应模型
@app.get("/products", response_model=PageResponse[Product])
def list_products(page_params: dict = Depends(get_page_params)):
    # 解构参数
    page = page_params["page"]
    size = page_params["size"]
    # 计算起止索引
    start = (page - 1) * size
    end = start + size
    # 切片获取当前页数据
    items = fake_products[start:end]
    # 返回分页响应
    return PageResponse(
        page=page,
        size=size,
        total=len(fake_products),
        items=items,
    )

# 订单模型
class Order(BaseModel):
    id: int
    user_id: int
    amount: float

# 模拟订单数据
fake_orders = [
    Order(id=i, user_id=i % 10 + 1, amount=i * 50.0)
    for i in range(1, 201)
]

# 订单列表接口：复用分页依赖
@app.get("/orders", response_model=PageResponse[Order])
def list_orders(page_params: dict = Depends(get_page_params)):
    page = page_params["page"]
    size = page_params["size"]
    start = (page - 1) * size
    end = start + size
    items = fake_orders[start:end]
    return PageResponse(
        page=page,
        size=size,
        total=len(fake_orders),
        items=items,
    )
\`\`\`

请求 \`GET /products?page=2&size=5\`，响应：

\`\`\`json
{
  "page": 2,
  "size": 5,
  "total": 100,
  "items": [
    {"id": 6, "name": "商品6", "price": 60.0},
    {"id": 7, "name": "商品7", "price": 70.0},
    ...
  ]
}
\`\`\`

这个分页依赖 \`get_page_params\` 可以被任何接口复用，配合泛型响应模型 \`PageResponse[T]\`，分页逻辑彻底统一。

## 十一、常见错误与避坑指南

### 错误 1：把 Depends 当成普通函数调用

\`\`\`python
# ❌ 错误：直接调用依赖函数
@app.get("/wrong")
def wrong():
    # 这样写不会触发依赖注入机制
    result = common_parameters()
    return result

# ✅ 正确：用 Depends 声明
@app.get("/right")
def right(commons: dict = Depends(common_parameters)):
    return commons
\`\`\`

直接调用虽然能拿到返回值，但失去了依赖注入的所有好处：不会被缓存、不能被框架统一管理、无法在依赖链中复用。一定要用 \`Depends()\` 包裹。

### 错误 2：依赖函数签名和路由函数签名冲突

\`\`\`python
# ❌ 错误：路由函数和依赖函数都声明了 q 参数
def search_dep(q: str = Query(...)):
    return q

@app.get("/items")
def list_items(q: str = Query(...), dep: str = Depends(search_dep)):
    # FastAPI 会把 q 解析两次，但因为是不同参数，会冲突
    return {"q": q, "dep": dep}
\`\`\`

依赖函数和路由函数都能从请求解析参数，但同名参数会被解析两次。如果只是读取还行，如果都试图修改就会出问题。**约定**：路由函数只声明业务参数，公共参数交给依赖。

### 错误 3：忘记依赖的缓存特性

\`\`\`python
# ❌ 误区：以为每次 Depends 都会重新执行
def gen_id():
    return uuid.uuid4()

@app.get("/test")
def test(id1: str = Depends(gen_id), id2: str = Depends(gen_id)):
    # 以为 id1 != id2，其实 id1 == id2（缓存复用）
    return {"id1": id1, "id2": id2}
\`\`\`

如果你确实需要每次都重新生成，用 \`use_cache=False\`。

### 错误 4：在依赖里做耗时操作但不释放

\`\`\`python
# ❌ 错误：return db，请求结束后 db 不会被关闭
def get_db():
    db = SessionLocal()
    return db  # 资源泄漏！

# ✅ 正确：用 yield，保证关闭
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
\`\`\`

return 依赖不会执行清理逻辑，yield 依赖才会。资源管理型依赖必须用 yield（下一章详解）。

### 错误 5：依赖函数抛出未捕获异常导致 500

\`\`\`python
# ❌ 错误：依赖里直接抛 KeyError，会变成 500
def get_user(token: str = Header(...)):
    return users[token]  # token 不存在就 KeyError，变成 500

# ✅ 正确：显式抛 HTTPException，返回明确的 4xx
def get_user(token: str = Header(...)):
    if token not in users:
        raise HTTPException(401, "token 无效")
    return users[token]
\`\`\`

依赖函数里抛 \`HTTPException\` 会被 FastAPI 捕获并返回对应状态码，抛其他异常会变成 500。对外接口要给用户友好的错误信息，不要让 KeyError 之类暴露出去。

## 十二、本章小结

本章我们学习了：

1. **依赖注入的本质**：把组件需要的依赖从外部传入，而不是内部创建，实现控制反转。
2. **Depends() 的工作原理**：FastAPI 解析路由签名，发现 Depends 声明后调用依赖函数，把返回值注入。
3. **函数作为依赖**：任何普通函数都能作为依赖，签名参数同样从请求解析。
4. **依赖的返回值**：可以是 dict、Pydantic 模型、ORM 对象等任意类型。
5. **缓存机制**：同一请求内相同依赖只执行一次，结果复用。可用 \`use_cache=False\` 禁用。
6. **典型应用**：权限校验、数据库 session、公共参数、分页参数。
7. **避坑要点**：要用 Depends 包裹、避免签名冲突、注意缓存、资源用 yield、异常要友好。

依赖注入是 FastAPI 区别于 Flask、Django 的核心特性之一，掌握它能让你的代码结构清晰、复用性强、可测试性好。下一章我们会深入 yield 依赖，解决资源管理这个关键问题。
`,
  },

  // ============================================================
  // 第 22 章：yield 依赖与资源管理
  // ============================================================
  {
    id: "fa-yield-dep",
    group: "依赖注入",
    icon: "🔄",
    title: "yield 依赖与资源管理",
    content: `# yield 依赖与资源管理

## 一、return 依赖的局限：资源谁来关？

上一章我们用了 \`return\` 返回依赖值，这种方式对"无状态"依赖（如解析参数、校验权限）没问题。但对于"有状态"资源（数据库连接、文件句柄、锁、网络连接），return 有个致命缺陷：**资源无法释放**。

看一个典型场景：

\`\`\`python
# ❌ 反模式：return 数据库连接
def get_db():
    # 创建连接
    db = SessionLocal()
    # 返回给路由函数
    return db
    # 这里之后，谁来关闭 db？没人！

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
    # 路由函数结束了，但 db 没有关闭
    # 连接泄漏，最终连接池耗尽
\`\`\`

这个接口每次请求都创建一个数据库连接，但从来不关闭。请求量一上来，连接池耗尽，数据库拒绝连接，服务挂掉。

你可能会想：在路由函数里手动关？

\`\`\`python
# ❌ 还是不行：异常时无法关闭
@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).all()
        return users
    finally:
        db.close()  # 看起来对了
\`\`\`

这有几个问题：

1. **每个接口都要写 try/finally**：重复代码。
2. **业务逻辑和资源管理耦合**：路由函数不该关心 db 怎么关。
3. **依赖链复杂时难管理**：如果 A 依赖 B，B 依赖 db，关闭顺序怎么保证？

这就是 yield 依赖要解决的问题。

## 二、yield 依赖的原理：上下文管理器

Python 的 \`with\` 语句和上下文管理器（\`__enter__\` / \`__exit__\`）是资源管理的标准方案。FastAPI 的 yield 依赖本质上就是基于上下文管理器实现的。

yield 依赖的执行流程：

1. **进入阶段**：FastAPI 调用依赖函数，执行到 \`yield\` 之前的代码（创建资源）。
2. **yield 值**：\`yield\` 后面的值被注入到路由函数（像 return 一样）。
3. **路由执行**：路由函数拿到 yield 的值，执行业务逻辑。
4. **退出阶段**：路由函数返回（或抛异常）后，FastAPI 继续执行 yield 之后的代码（清理资源）。

对比 \`return\`：

| 阶段 | \`return\` 依赖 | \`yield\` 依赖 |
|---|---|---|
| 创建资源 | 函数体执行 | yield 之前 |
| 注入值 | return 值 | yield 值 |
| 路由执行 | 之后 | 之后 |
| 清理资源 | ❌ 没有 | ✅ yield 之后 |

yield 依赖相当于把"创建"和"清理"拆成两段，中间夹着路由函数的执行。这保证了无论路由函数正常返回还是抛异常，清理代码都会执行。

## 三、第一个 yield 依赖：观察执行顺序

先用一个简单示例直观感受 yield 依赖的执行顺序：

\`\`\`python
# 导入 FastAPI 和 Depends
from fastapi import FastAPI, Depends

app = FastAPI()

# yield 依赖函数
def my_dependency():
    # ===== 进入阶段：yield 之前 =====
    print("1. 依赖：创建资源")
    # 准备要注入的值
    value = "我是依赖提供的值"
    # yield 把值交给路由函数
    yield value
    # ===== 退出阶段：yield 之后 =====
    print("3. 依赖：清理资源")

# 路由函数
@app.get("/demo")
def demo(dep: str = Depends(my_dependency)):
    # dep 是 yield 的值
    print("2. 路由：使用依赖")
    return {"dep": dep}
\`\`\`

请求 \`GET /demo\`，控制台输出顺序：

\`\`\`
1. 依赖：创建资源
2. 路由：使用依赖
3. 依赖：清理资源
\`\`\`

可以看到，执行顺序是：依赖创建 → 路由执行 → 依赖清理。这正是我们想要的：资源在使用前创建，使用后清理。

## 四、数据库连接的 yield 依赖

这是 yield 依赖最经典的应用：

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 导入 SQLAlchemy 组件
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session

app = FastAPI()

# 创建引擎和 Session 工厂
engine = create_engine("sqlite:///test.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# User 模型
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)

# 创建表
Base.metadata.create_all(engine)

# ✅ yield 依赖：数据库 session
def get_db():
    # 1. 创建 session
    db = SessionLocal()
    print(f"[get_db] 创建 session: {db}")
    try:
        # 2. yield 交给路由函数
        yield db
    finally:
        # 3. 路由函数结束后，关闭 session
        # finally 保证即使路由抛异常也会关闭
        print(f"[get_db] 关闭 session: {db}")
        db.close()

# 创建用户接口
@app.post("/users")
def create_user(name: str, age: int, db: Session = Depends(get_db)):
    # db 是 yield 的值
    print(f"[create_user] 使用 session: {db}")
    # 创建 User 实例
    user = User(name=name, age=age)
    # 添加到 session
    db.add(user)
    # 提交事务
    db.commit()
    # 刷新获取 id
    db.refresh(user)
    return {"id": user.id, "name": user.name}

# 查询用户接口
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    # 查询用户
    user = db.query(User).filter(User.id == user_id).first()
    # 不存在返回 404
    if not user:
        raise HTTPException(404, "用户不存在")
    return {"id": user.id, "name": user.name, "age": user.age}

# 故意抛异常的接口：测试 finally 是否执行
@app.get("/error")
def error_endpoint(db: Session = Depends(get_db)):
    print(f"[error_endpoint] 使用 session")
    # 故意抛异常
    raise HTTPException(500, "模拟错误")
\`\`\`

请求 \`GET /error\`，控制台输出：

\`\`\`
[get_db] 创建 session: <Session>
[error_endpoint] 使用 session
[get_db] 关闭 session: <Session>
\`\`\`

即使路由函数抛了异常，\`finally\` 块里的 \`db.close()\` 依然执行。这就是 yield + try/finally 的威力。

## 五、文件资源的 yield 依赖

文件句柄也是典型的需要释放的资源。用 yield 依赖封装文件读写：

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends
# 导入路径相关
from pathlib import Path

app = FastAPI()

# yield 依赖：打开日志文件
def get_log_file():
    # 1. 打开文件（追加模式）
    f = open("app.log", "a", encoding="utf-8")
    print("[get_log_file] 文件已打开")
    try:
        # 2. yield 文件句柄
        yield f
    finally:
        # 3. 关闭文件
        print("[get_log_file] 文件已关闭")
        f.close()

# 写日志接口
@app.post("/log")
def write_log(message: str, f=Depends(get_log_file)):
    # f 是 yield 的文件句柄
    # 写入日志（带换行）
    f.write(message + "\\n")
    # 注意：file 不需要 flush，close 时会自动 flush
    return {"msg": "日志已写入", "content": message}

# 读取整个日志文件接口
@app.get("/log")
def read_log(f=Depends(get_log_file)):
    # 注意：依赖里以 "a" 模式打开，无法读取
    # 这里只是演示依赖复用，实际读取应该用其他依赖
    return {"msg": "请用 /log/raw 接口"}

# 读取日志的依赖（用 "r" 模式）
def get_log_reader():
    # 检查文件是否存在
    if not Path("app.log").exists():
        # 文件不存在，yield None
        yield None
        return
    # 以读模式打开
    f = open("app.log", "r", encoding="utf-8")
    try:
        yield f
    finally:
        f.close()

# 读取日志内容接口
@app.get("/log/raw")
def read_log_raw(f=Depends(get_log_reader)):
    # 如果文件不存在，依赖 yield 了 None
    if f is None:
        return {"content": "", "msg": "日志文件不存在"}
    # 读取所有内容
    content = f.read()
    return {"content": content}
\`\`\`

注意第二个依赖 \`get_log_reader\` 里用了 \`yield None; return\`。在生成器函数里，\`return\` 会提前结束生成器（不会再 yield 值）。这种写法在"条件性不提供资源"时有用。

## 六、yield + try/finally：异常处理

yield 依赖最强大的地方是能捕获路由函数抛出的异常。在 yield 之后用 try/except 可以拿到异常对象：

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# yield 依赖：捕获路由异常
def audited_operation():
    print("[audited] 操作开始")
    try:
        # yield 值给路由函数
        yield "operation_token"
        # 如果路由正常返回，执行到这里
        print("[audited] 操作成功完成")
    except Exception as e:
        # 如果路由抛异常，执行到这里
        print(f"[audited] 操作失败: {type(e).__name__}: {e}")
        # 注意：这里捕获后，异常会被"吞掉"吗？
        # 不会，FastAPI 会重新抛出原始异常
        # 这里只是观察，不能改变最终结果
    finally:
        # 无论成功失败都执行
        print("[audited] 操作结束，记录审计日志")

# 成功的接口
@app.get("/success")
def success(op: str = Depends(audited_operation)):
    print("[success] 业务执行中")
    return {"msg": "成功", "token": op}

# 失败的接口
@app.get("/fail")
def fail(op: str = Depends(audited_operation)):
    print("[fail] 业务执行中，即将抛异常")
    # 抛 HTTPException
    raise HTTPException(500, "业务失败")

# 抛普通异常的接口
@app.get("/crash")
def crash(op: str = Depends(audited_operation)):
    print("[crash] 业务执行中，抛 ValueError")
    # 抛非 HTTPException 异常
    raise ValueError("程序内部错误")
\`\`\`

请求 \`GET /fail\`，控制台输出：

\`\`\`
[audited] 操作开始
[fail] 业务执行中，即将抛异常
[audited] 操作失败: HTTPException: 500: 业务失败
[audited] 操作结束，记录审计日志
\`\`\`

关键点：

1. **yield 后的 except 能捕获路由异常**：包括 HTTPException 和普通异常。
2. **异常不会被吞掉**：FastAPI 在依赖退出后会把异常重新抛出，按正常流程返回响应。
3. **finally 总会执行**：无论成功失败。

这个机制非常适合做"审计日志"：记录每个操作的成功/失败，但又不影响业务逻辑。

## 七、yield 依赖的执行顺序：多个 yield 依赖

当一个路由有多个 yield 依赖时，执行顺序遵循"栈"结构（后进先出）：

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends

app = FastAPI()

# 依赖 A
def dep_a():
    print("[A] 进入")
    yield "A"
    print("[A] 退出")

# 依赖 B
def dep_b():
    print("[B] 进入")
    yield "B"
    print("[B] 退出")

# 依赖 C
def dep_c():
    print("[C] 进入")
    yield "C"
    print("[C] 退出")

# 路由：声明三个依赖
@app.get("/multi")
def multi(a: str = Depends(dep_a), b: str = Depends(dep_b), c: str = Depends(dep_c)):
    print("[route] 执行业务")
    return {"a": a, "b": b, "c": c}
\`\`\`

请求 \`GET /multi\`，控制台输出：

\`\`\`
[A] 进入
[B] 进入
[C] 进入
[route] 执行业务
[C] 退出
[B] 退出
[A] 退出
\`\`\`

执行顺序是：A 进入 → B 进入 → C 进入 → 路由执行 → C 退出 → B 退出 → A 退出。

这就像"洋葱模型"：依赖层层包裹，进入时从外到内，退出时从内到外。这种顺序保证了：**先创建的依赖最后释放**，符合资源生命周期的一般规律（外层资源通常被内层使用，要等内层用完才能释放）。

## 八、退出代码的执行时机

yield 之后的代码（退出代码）在什么时候执行？答案：**路由函数返回响应之后，但响应还未发送给客户端时**。

更准确地说：

1. 路由函数 return（或抛异常）
2. FastAPI 处理返回值，构建响应对象
3. **执行所有 yield 依赖的退出代码**（按栈顺序）
4. 响应发送给客户端

这意味着退出代码里**不能**修改响应内容（响应已经构建好了）。但可以做：关闭资源、记录日志、提交事务等。

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends
# 导入时间
import time

app = FastAPI()

# 依赖：记录请求耗时
def timing_dep():
    # 记录开始时间
    start = time.time()
    print(f"[timing] 请求开始: {start}")
    # yield 占位
    yield start
    # 路由执行完毕，记录结束时间
    end = time.time()
    duration = end - start
    print(f"[timing] 请求耗时: {duration:.4f}秒")
    # 注意：这里无法把 duration 加到响应里
    # 响应已经构建好了

@app.get("/slow")
def slow(start: float = Depends(timing_dep)):
    # 模拟耗时操作
    time.sleep(1)
    return {"msg": "慢请求"}
\`\`\`

如果你想记录耗时到日志或数据库，可以在退出代码里做。但**不能**修改已经构建好的响应。

## 九、嵌套 yield 依赖的执行顺序

依赖本身也可以依赖其他依赖，形成嵌套结构。yield 依赖嵌套时，执行顺序同样遵循洋葱模型：

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends

app = FastAPI()

# 底层依赖：数据库连接
def get_db_conn():
    print("[db] 创建连接")
    yield "db_conn"
    print("[db] 关闭连接")

# 上层依赖：依赖 get_db_conn
def get_user_service(db=Depends(get_db_conn)):
    print(f"[user_service] 创建服务，使用 {db}")
    yield f"UserService({db})"
    print("[user_service] 销毁服务")

# 路由：依赖 get_user_service
@app.get("/users")
def list_users(svc=Depends(get_user_service)):
    print(f"[route] 使用 {svc}")
    return {"service": svc}
\`\`\`

请求 \`GET /users\`，控制台输出：

\`\`\`
[db] 创建连接
[user_service] 创建服务，使用 db_conn
[route] 使用 UserService(db_conn)
[user_service] 销毁服务
[db] 关闭连接
\`\`\`

执行顺序：

1. \`get_db_conn\` 创建连接（最外层资源）
2. \`get_user_service\` 创建服务（依赖 db_conn）
3. 路由函数执行业务
4. \`get_user_service\` 销毁服务（先销毁内层）
5. \`get_db_conn\` 关闭连接（后销毁外层）

这个顺序保证了：服务（依赖连接的）先被销毁，然后才是连接本身。如果反过来，服务销毁时访问已关闭的连接就会报错。

## 十、实战：数据库事务管理

事务是 yield 依赖的杀手级应用。事务要求"要么全成功提交，要么全失败回滚"，yield + try/except 完美匹配这个需求：

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 导入 SQLAlchemy
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session

app = FastAPI()

# 数据库配置
engine = create_engine("sqlite:///bank.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# 账户模型
class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    balance = Column(Float)  # 余额

# 创建表
Base.metadata.create_all(engine)

# 初始化数据
def init_data():
    db = SessionLocal()
    if db.query(Account).count() == 0:
        db.add(Account(id=1, name="alice", balance=1000.0))
        db.add(Account(id=2, name="bob", balance=500.0))
        db.commit()
    db.close()

init_data()

# ✅ 事务型 yield 依赖
def get_transactional_db():
    # 1. 创建 session（开启事务）
    # SQLAlchemy 的 session 自动开启事务
    db = SessionLocal()
    print("[tx] 事务开始")
    try:
        # 2. yield session 给路由
        yield db
        # 3. 路由正常返回，提交事务
        # commit 把所有改动写入数据库
        db.commit()
        print("[tx] 事务提交")
    except Exception as e:
        # 4. 路由抛异常，回滚事务
        # rollback 撤销所有未提交的改动
        db.rollback()
        print(f"[tx] 事务回滚: {e}")
        # 异常会被 FastAPI 重新抛出
        # raise 不吞掉异常，让客户端收到错误响应
        raise
    finally:
        # 5. 无论提交还是回滚，都关闭 session
        # close 释放连接回连接池
        db.close()
        print("[tx] session 关闭")

# 转账接口
@app.post("/transfer")
def transfer(
    from_id: int,
    to_id: int,
    amount: float,
    db: Session = Depends(get_transactional_db),
):
    # 查转出账户
    from_acc = db.query(Account).filter(Account.id == from_id).first()
    if not from_acc:
        raise HTTPException(404, "转出账户不存在")
    # 查转入账户
    to_acc = db.query(Account).filter(Account.id == to_id).first()
    if not to_acc:
        raise HTTPException(404, "转入账户不存在")
    # 检查余额
    if from_acc.balance < amount:
        raise HTTPException(400, "余额不足")
    # 扣款
    from_acc.balance -= amount
    # 加款
    to_acc.balance += amount
    # 这里不需要 db.commit()，依赖会自动提交
    return {
        "msg": "转账成功",
        "from": {"id": from_id, "balance": from_acc.balance},
        "to": {"id": to_id, "balance": to_acc.balance},
    }

# 故意失败的转账接口（测试回滚）
@app.post("/transfer/fail")
def transfer_fail(db: Session = Depends(get_transactional_db)):
    # 修改数据
    acc = db.query(Account).filter(Account.id == 1).first()
    acc.balance -= 100  # 扣款
    # 故意抛异常
    raise HTTPException(500, "模拟失败")
\`\`\`

请求 \`POST /transfer?from_id=1&to_id=2&amount=100\`，控制台输出：

\`\`\`
[tx] 事务开始
[tx] 事务提交
[tx] session 关闭
\`\`\`

请求 \`POST /transfer/fail\`，控制台输出：

\`\`\`
[tx] 事务开始
[tx] 事务回滚: 500: 模拟失败
[tx] session 关闭
\`\`\`

事务被自动回滚，余额不会变化。这就是 yield 依赖管理事务的完整方案：

- **成功**：路由正常返回 → 自动 commit
- **失败**：路由抛异常 → 自动 rollback
- **无论成败**：finally 关闭 session

路由函数完全不用关心事务，只管业务逻辑。这就是依赖注入的优雅之处。

## 十一、yield 依赖的限制与注意点

### 限制 1：一个 yield 依赖只能有一个 yield

\`\`\`python
# ❌ 错误：多个 yield
def bad_dep():
    yield "first"
    yield "second"  # FastAPI 不支持，会报错

# ✅ 正确：一个 yield
def good_dep():
    yield "value"
\`\`\`

FastAPI 只取第一个 yield 的值，之后的 yield 不会被执行（因为路由函数返回后，生成器继续执行会触发 StopIteration）。

### 限制 2：退出代码不能修改响应

\`\`\`python
# ❌ 无效：退出代码里改响应
def dep():
    yield
    # 这里无法访问响应对象
    # 响应已经构建好了
\`\`\`

如果需要在响应后做事，用中间件或 BackgroundTasks。

### 限制 3：yield None 也能用

\`\`\`python
# ✅ 可以：yield None
def log_dep():
    print("请求开始")
    yield  # 等价于 yield None
    print("请求结束")

@app.get("/")
def root(_=Depends(log_dep)):
    return {"msg": "hello"}
\`\`\`

不关心依赖值时，yield 不带值即可。

### 限制 4：异常处理要小心

\`\`\`python
# ❌ 危险：吞掉异常会导致客户端收到 200 但实际失败
def dep():
    try:
        yield
    except Exception:
        pass  # 吞掉异常！客户端会收到 200，但其实是 500

# ✅ 正确：记录后重新抛出
def dep():
    try:
        yield
    except Exception as e:
        print(f"记录: {e}")
        raise  # 重新抛出
\`\`\`

## 十二、常见错误与避坑指南

### 错误 1：忘记 try/finally

\`\`\`python
# ❌ 错误：没有 finally，异常时资源不释放
def get_db():
    db = SessionLocal()
    yield db
    db.close()  # 如果路由抛异常，这行不执行

# ✅ 正确：用 finally
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
\`\`\`

yield 之后的代码在正常情况下会执行，但**路由抛异常时**，如果没有 try/finally 包裹，清理代码可能被跳过（具体取决于异常处理流程）。养成"yield 必须 try/finally"的习惯。

### 错误 2：在 yield 之前抛异常导致路由无法执行

\`\`\`python
# ❌ 错误：yield 前抛异常
def get_db():
    db = SessionLocal()
    if some_check_fails:
        raise Exception("初始化失败")  # 路由函数根本不会执行
    yield db
    db.close()
\`\`\`

yield 之前抛异常，路由函数不会执行，请求直接失败。这有时是想要的（如认证失败），但要清楚知道。

### 错误 3：yield 之后访问已关闭的资源

\`\`\`python
# ❌ 错误：yield 后用 db
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        # 这里不要再用 db 做查询！
        # db.query(User).all()  # 可能报错
        db.close()
\`\`\`

清理代码只做清理，不要做业务操作。

### 错误 4：异步依赖用 yield 但忘了 async

\`\`\`python
# ❌ 错误：异步操作但不是 async def
def get_db():
    db = async_session()
    yield db  # 异步操作放在同步生成器里，会阻塞事件循环

# ✅ 正确：异步依赖用 async def + yield
async def get_db():
    db = async_session()
    try:
        yield db
    finally:
        await db.close()
\`\`\`

异步依赖的 yield 写法和同步一样，但函数要声明 \`async def\`，清理用 \`await\`。

### 错误 5：混淆 yield 依赖和 BackgroundTasks

\`\`\`python
# ❌ 误区：用 yield 依赖做后台任务
def bg_task():
    yield
    # 这里做"后台任务"
    send_email()  # 但这会阻塞响应！客户端要等这个完成才收到响应

# ✅ 正确：用 BackgroundTasks 做后台任务
from fastapi import BackgroundTasks

@app.get("/send")
def send_email_endpoint(bg: BackgroundTasks):
    # 注册后台任务，响应立即返回
    bg.add_task(send_email)
    return {"msg": "已排队"}
\`\`\`

yield 退出代码在响应发送前执行，会阻塞响应。真正的后台任务用 \`BackgroundTasks\` 或 Celery。

## 十三、本章小结

本章我们学习了：

1. **return 依赖的局限**：无法释放资源，导致泄漏。
2. **yield 依赖的原理**：基于上下文管理器，yield 前创建资源，yield 后清理资源。
3. **执行顺序**：洋葱模型，多个 yield 依赖按栈结构进入退出。
4. **异常处理**：yield 后的 try/except 能捕获路由异常，但要重新抛出。
5. **退出时机**：路由返回后、响应发送前，不能修改响应。
6. **典型应用**：数据库连接、文件资源、事务管理。
7. **避坑要点**：必须 try/finally、yield 前异常会跳过路由、异步用 async def、后台任务用 BackgroundTasks。

yield 依赖是 FastAPI 资源管理的核心机制，掌握它能让你的接口既安全又优雅。下一章我们会进入更复杂的依赖嵌套与组合。
`,
  },

  // ============================================================
  // 第 23 章：依赖嵌套与组合
  // ============================================================
  {
    id: "fa-nested-dep",
    group: "依赖注入",
    icon: "🪆",
    title: "依赖嵌套与组合",
    content: `# 依赖嵌套与组合

## 一、为什么需要嵌套依赖

前面的章节里，依赖函数都是"叶子节点"——不依赖其他东西。但真实业务中，依赖往往有层次关系：

- \`get_current_user\` 依赖 \`get_token_from_header\`
- \`get_db_session\` 依赖 \`get_db_engine\`
- \`check_admin_permission\` 依赖 \`get_current_user\`
- \`process_order\` 依赖 \`get_db_session\` + \`get_current_user\` + \`get_cache\`

这种"依赖的依赖"就是嵌套依赖（nested dependencies）。FastAPI 完美支持这种结构——依赖函数本身也可以用 \`Depends()\` 声明自己的依赖，框架会递归解析整棵依赖树。

嵌套依赖的好处：

1. **关注点分离**：每个依赖只做一件事，组合起来完成复杂逻辑。
2. **复用性**：底层依赖（如 db session）能被多个上层依赖复用。
3. **可测试**：可以 mock 任意一层依赖，灵活控制测试范围。
4. **可读性**：依赖树清晰表达了"这个接口需要什么"。

## 二、依赖可以依赖其他依赖

直接看示例：

\`\`\`python
# 导入 FastAPI、Depends、Header、HTTPException
from fastapi import FastAPI, Depends, Header, HTTPException
# 导入 Optional
from typing import Optional

app = FastAPI()

# 模拟用户库
fake_users = {
    "token_alice": {"id": 1, "name": "alice", "role": "admin"},
    "token_bob": {"id": 2, "name": "bob", "role": "user"},
}

# 底层依赖1：从 Header 取 Authorization
def extract_token(authorization: Optional[str] = Header(None)):
    # 如果没传 Authorization
    if not authorization:
        # 抛 401
        raise HTTPException(401, "缺少 Authorization 头")
    # 去掉 "Bearer " 前缀
    token = authorization.replace("Bearer ", "")
    # 如果 token 为空
    if not token:
        raise HTTPException(401, "token 为空")
    # 返回 token
    return token

# 中层依赖2：依赖 extract_token，根据 token 查用户
def get_current_user(token: str = Depends(extract_token)):
    # token 是 extract_token 的返回值
    # 查用户
    user = fake_users.get(token)
    # 用户不存在
    if not user:
        raise HTTPException(401, "无效 token")
    # 返回用户
    return user

# 路由：依赖 get_current_user
@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    # user 是 get_current_user 的返回值
    return {"user": user}
\`\`\`

请求 \`GET /me\` 带 \`Authorization: Bearer token_alice\`，执行流程：

1. FastAPI 解析 \`get_me\` 签名，发现依赖 \`get_current_user\`。
2. 解析 \`get_current_user\` 签名，发现依赖 \`extract_token\`。
3. 解析 \`extract_token\` 签名，发现参数 \`authorization\`（从 Header 取）。
4. 调用 \`extract_token(authorization="Bearer token_alice")\`，返回 \`"token_alice"\`。
5. 调用 \`get_current_user(token="token_alice")\`，返回用户字典。
6. 调用 \`get_me(user={...})\`，返回响应。

依赖层层嵌套，FastAPI 自动按正确顺序调用。这就是"依赖树"的概念。

## 三、嵌套依赖的执行顺序

嵌套依赖的执行顺序是**深度优先 + 后序遍历**：先解析到底层依赖，从底层开始执行，逐层返回。

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends

app = FastAPI()

# 依赖 A（叶子）
def dep_a():
    print("[A] 执行")
    return "A"

# 依赖 B（依赖 A）
def dep_b(a: str = Depends(dep_a)):
    print(f"[B] 执行，拿到 a={a}")
    return f"B({a})"

# 依赖 C（依赖 B）
def dep_c(b: str = Depends(dep_b)):
    print(f"[C] 执行，拿到 b={b}")
    return f"C({b})"

# 路由（依赖 C）
@app.get("/test")
def test(c: str = Depends(dep_c)):
    print(f"[route] 拿到 c={c}")
    return {"c": c}
\`\`\`

请求 \`GET /test\`，输出顺序：

\`\`\`
[A] 执行
[B] 执行，拿到 a=A
[C] 执行，拿到 b=B(A)
[route] 拿到 c=C(B(A))
\`\`\`

执行顺序是 A → B → C → route，即从最底层依赖开始，逐层向上。这符合直觉：上层依赖需要下层的返回值，所以下层必须先执行。

## 四、依赖图的概念

当依赖关系复杂时，可以用"依赖图"来理解。依赖图是一个有向无环图（DAG），节点是依赖，边是"依赖于"关系。

\`\`\`
        [route]
       /    |    \\
      /     |     \\
[dep_db] [dep_user] [dep_cache]
    |       |          |
    |    [dep_token]   |
    |       |          |
[dep_engine] [dep_header] [dep_redis]
\`\`\`

这个图表示：

- route 依赖 dep_db、dep_user、dep_cache
- dep_db 依赖 dep_engine
- dep_user 依赖 dep_token
- dep_token 依赖 dep_header
- dep_cache 依赖 dep_redis

FastAPI 解析这个图，按拓扑排序执行依赖。如果两个依赖没有依赖关系（如 dep_db 和 dep_cache），它们的执行顺序由声明顺序决定。

## 五、依赖的组合和复用

依赖图的威力在于复用。同一个底层依赖可以被多个上层依赖引用，而 FastAPI 的缓存机制保证它只执行一次。

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends

app = FastAPI()

# 底层依赖：获取请求 ID
def get_request_id():
    print("[request_id] 生成")
    return "req-001"

# 上层依赖1：日志（依赖 request_id）
def get_logger(req_id: str = Depends(get_request_id)):
    print(f"[logger] 创建，关联 {req_id}")
    return f"Logger({req_id})"

# 上层依赖2：审计（也依赖 request_id）
def get_auditor(req_id: str = Depends(get_request_id)):
    print(f"[auditor] 创建，关联 {req_id}")
    return f"Auditor({req_id})"

# 路由：组合 logger 和 auditor
@app.get("/api")
def api(
    logger: str = Depends(get_logger),
    auditor: str = Depends(get_auditor),
):
    print(f"[route] logger={logger}, auditor={auditor}")
    return {"logger": logger, "auditor": auditor}
\`\`\`

请求 \`GET /api\`，输出：

\`\`\`
[request_id] 生成
[logger] 创建，关联 req-001
[request_id] 生成  ← 注意：这里会不会再次执行？
[auditor] 创建，关联 req-001
[route] ...
\`\`\`

实际上 \`[request_id] 生成\` **只输出一次**！因为 FastAPI 缓存了 \`get_request_id\` 的结果，\`get_logger\` 和 \`get_auditor\` 拿到的是同一个 \`req_id\`。

这就是"依赖图 + 缓存"的组合：底层依赖执行一次，结果在整个请求内共享。这对"请求 ID"、"当前用户"、"数据库 session"这种唯一性资源至关重要。

## 六、多个依赖组合使用

一个路由可以同时依赖多个独立的依赖，组合它们的功能：

\`\`\`python
# 导入 FastAPI、Depends、Query、HTTPException
from fastapi import FastAPI, Depends, Query, HTTPException
# 导入 Optional
from typing import Optional

app = FastAPI()

# 依赖1：分页参数
def pagination_params(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    return {"page": page, "size": size, "offset": (page - 1) * size}

# 依赖2：排序参数
def sort_params(
    sort_by: str = Query("id"),
    order: str = Query("asc", regex="^(asc|desc)$"),
):
    return {"sort_by": sort_by, "order": order}

# 依赖3：当前用户
def get_current_user(token: str = Query(...)):
    if token != "valid_token":
        raise HTTPException(401, "无效 token")
    return {"id": 1, "name": "alice"}

# 依赖4：数据库 session（简化版）
def get_db():
    db = {"query": lambda: []}  # 模拟 db
    yield db

# 路由：组合四个依赖
@app.get("/products")
def list_products(
    pagination: dict = Depends(pagination_params),
    sort: dict = Depends(sort_params),
    user: dict = Depends(get_current_user),
    db: dict = Depends(get_db),
):
    # 同时使用所有依赖的返回值
    return {
        "user": user["name"],
        "pagination": pagination,
        "sort": sort,
        "products": [],  # 实际用 db 查询
    }
\`\`\`

这个接口同时需要：分页、排序、认证、数据库。每个功能都是独立依赖，组合起来就是完整接口。如果以后要加"过滤"功能，只需新增一个依赖，路由函数加一个参数即可，不影响其他依赖。

## 七、依赖缓存与 use_cache

前面提到，FastAPI 默认缓存依赖结果。但有时我们想"故意"让依赖重新执行。典型场景：

- 生成唯一 ID：每次调用都要新的
- 获取时间戳：需要实时值
- 创建独立资源：每个使用方要独立的实例

用 \`use_cache=False\`：

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends
# 导入 uuid
import uuid

app = FastAPI()

# 依赖：生成唯一 ID（默认缓存）
def gen_id_cached():
    return str(uuid.uuid4())

# 依赖：生成唯一 ID（不缓存）
def gen_id_no_cache():
    return str(uuid.uuid4())

# 路由：测试缓存差异
@app.get("/test")
def test(
    id1: str = Depends(gen_id_cached),       # 缓存
    id2: str = Depends(gen_id_cached),       # 复用 id1
    id3: str = Depends(gen_id_no_cache, use_cache=False),  # 新生成
    id4: str = Depends(gen_id_no_cache, use_cache=False),  # 又新生成
):
    return {
        "id1": id1,
        "id2": id2,
        "id1==id2": id1 == id2,  # True（缓存）
        "id3": id3,
        "id4": id4,
        "id3==id4": id3 == id4,  # False（不缓存）
    }
\`\`\`

响应：

\`\`\`json
{
  "id1": "abc-123",
  "id2": "abc-123",
  "id1==id2": true,
  "id3": "def-456",
  "id4": "ghi-789",
  "id3==id4": false
}
\`\`\`

实际项目里 \`use_cache=False\` 用得不多，但在需要"独立实例"时很有用。

## 八、实战：认证+权限+数据库三层依赖

把前面学的组合起来，实现一个真实的三层依赖：认证 → 权限 → 数据库。

\`\`\`python
# 导入 FastAPI、Depends、Header、HTTPException、Query
from fastapi import FastAPI, Depends, Header, HTTPException, Query
# 导入 Optional
from typing import Optional
# 导入 pydantic
from pydantic import BaseModel

app = FastAPI()

# 模拟数据
fake_users_db = {
    "alice_token": {"id": 1, "name": "alice", "role": "admin"},
    "bob_token": {"id": 2, "name": "bob", "role": "user"},
}
fake_db_data = {1: [{"id": 1, "owner": 1, "title": "alice 的文章"}]}

# ========== 第一层：基础设施依赖 ==========

# 依赖：从 Header 提取 token
def get_token(authorization: Optional[str] = Header(None)):
    # 没传 Authorization
    if not authorization:
        raise HTTPException(401, "缺少 Authorization")
    # 解析 token
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization 格式错误")
    # 提取 token
    token = authorization[7:]
    # 返回
    return token

# 依赖：模拟数据库 session
def get_db():
    # 模拟 session
    db = {"data": fake_db_data}
    print("[db] 创建 session")
    try:
        yield db
    finally:
        print("[db] 关闭 session")

# ========== 第二层：业务依赖 ==========

# 依赖：根据 token 获取用户（依赖 get_token）
def get_current_user(token: str = Depends(get_token)):
    # 查用户
    user = fake_users_db.get(token)
    # 不存在
    if not user:
        raise HTTPException(401, "无效 token")
    # 返回用户
    print(f"[user] 认证通过: {user['name']}")
    return user

# 依赖：校验管理员权限（依赖 get_current_user）
def require_admin(user: dict = Depends(get_current_user)):
    # 检查角色
    if user["role"] != "admin":
        raise HTTPException(403, "需要管理员权限")
    print(f"[admin] 权限校验通过: {user['name']}")
    return user

# 依赖：获取当前用户的文章（依赖 get_current_user + get_db）
def get_user_articles(
    user: dict = Depends(get_current_user),
    db: dict = Depends(get_db),
):
    # 从数据库查用户文章
    articles = db["data"].get(user["id"], [])
    print(f"[articles] 查询 {user['name']} 的文章: {len(articles)} 篇")
    return articles

# ========== 第三层：路由 ==========

# 文章响应模型
class Article(BaseModel):
    id: int
    owner: int
    title: str

# 接口1：获取自己的文章（只需登录）
@app.get("/articles", response_model=list[Article])
def list_my_articles(articles: list = Depends(get_user_articles)):
    # articles 是 get_user_articles 的返回值
    return articles

# 接口2：管理员查看所有人文章（需要 admin）
@app.get("/admin/articles", response_model=list[Article])
def list_all_articles(
    admin: dict = Depends(require_admin),  # 校验 admin
    db: dict = Depends(get_db),            # 复用 db（缓存）
):
    # 查所有文章
    all_articles = []
    for uid, arts in db["data"].items():
        all_articles.extend(arts)
    return all_articles

# 接口3：管理员删除文章（需要 admin + db）
@app.delete("/admin/articles/{article_id}")
def delete_article(
    article_id: int,
    admin: dict = Depends(require_admin),
    db: dict = Depends(get_db),
):
    # 遍历查找并删除
    for uid, arts in db["data"].items():
        for art in arts[:]:
            if art["id"] == article_id:
                arts.remove(art)
                return {"msg": f"已删除文章 {article_id}", "by": admin["name"]}
    raise HTTPException(404, "文章不存在")
\`\`\`

请求 \`GET /articles\` 带 \`Authorization: Bearer alice_token\`，执行流程：

1. \`get_token\`：从 Header 取 token
2. \`get_current_user\`：根据 token 查用户 alice
3. \`get_db\`：创建 session
4. \`get_user_articles\`：用 user 和 db 查文章
5. \`list_my_articles\`：返回文章

请求 \`DELETE /admin/articles/1\` 带 \`Authorization: Bearer bob_token\`，执行流程：

1. \`get_token\`：取 token
2. \`get_current_user\`：查到 bob
3. \`require_admin\`：bob 不是 admin，抛 403

请求 \`DELETE /admin/articles/1\` 带 \`Authorization: Bearer alice_token\`：

1. \`get_token\` → \`get_current_user\` → \`require_admin\`（alice 是 admin，通过）
2. \`get_db\` 创建 session
3. \`delete_article\` 执行删除

注意：\`get_db\` 在一个请求内只创建一次，即使多个依赖都用它（缓存复用）。

## 九、依赖图可视化

上面的实战，依赖图是这样的：

\`\`\`
list_my_articles
    └── get_user_articles
            ├── get_current_user
            │       └── get_token
            └── get_db (yield)

list_all_articles
    ├── require_admin
    │       └── get_current_user (复用)
    │               └── get_token (复用)
    └── get_db (复用)

delete_article
    ├── require_admin (复用)
    │       └── get_current_user (复用)
    │               └── get_token (复用)
    └── get_db (复用)
\`\`\`

不同接口共享底层依赖（\`get_token\`、\`get_current_user\`、\`get_db\`），但每个请求内它们只执行一次。这就是依赖图的复用价值。

## 十、依赖的优先级与异常短路

依赖执行时，如果某个依赖抛出 \`HTTPException\`，整个依赖链会"短路"——后续依赖和路由函数都不会执行，直接返回错误响应。

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# 依赖1：校验 token（可能失败）
def verify_token(token: str = ""):
    print("[verify_token] 执行")
    if token != "valid":
        print("[verify_token] 失败，抛 401")
        raise HTTPException(401, "token 无效")
    print("[verify_token] 通过")
    return {"user": "alice"}

# 依赖2：查数据库（依赖1失败则不执行）
def query_db(user=Depends(verify_token)):
    print("[query_db] 执行")
    return ["data1", "data2"]

# 路由
@app.get("/data")
def get_data(data=Depends(query_db)):
    print("[route] 执行")
    return {"data": data}
\`\`\`

请求 \`GET /data?token=invalid\`：

\`\`\`
[verify_token] 执行
[verify_token] 失败，抛 401
\`\`\`

\`query_db\` 和 \`get_data\` 都没执行！这就是短路——认证失败时，没必要继续查数据库。

这个特性让"前置校验"非常自然：把校验逻辑放在依赖链上游，失败时自动短路，下游不用写一堆 if/else。

## 十一、嵌套依赖的异常处理

yield 依赖嵌套时，异常会沿着依赖链向上传播，每一层的 try/except 都有机会处理：

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# 底层 yield 依赖
def dep_inner():
    print("[inner] 进入")
    try:
        yield "inner_value"
        print("[inner] 正常退出")
    except Exception as e:
        print(f"[inner] 捕获异常: {e}")
        raise  # 重新抛出

# 中层 yield 依赖
def dep_middle(inner=Depends(dep_inner)):
    print(f"[middle] 进入，inner={inner}")
    try:
        yield f"middle({inner})"
        print("[middle] 正常退出")
    except Exception as e:
        print(f"[middle] 捕获异常: {e}")
        raise

# 路由
@app.get("/ok")
def ok(data=Depends(dep_middle)):
    print(f"[route] 拿到 {data}")
    return {"data": data}

@app.get("/fail")
def fail(data=Depends(dep_middle)):
    print(f"[route] 拿到 {data}，即将抛异常")
    raise HTTPException(500, "业务失败")
\`\`\`

请求 \`GET /fail\`：

\`\`\`
[inner] 进入
[middle] 进入，inner=inner_value
[route] 拿到 middle(inner_value)，即将抛异常
[middle] 捕获异常: 500: 业务失败
[inner] 捕获异常: 500: 业务失败
\`\`\`

异常先被内层 \`[route]\` 抛出，然后 \`[middle]\` 的 except 捕获，再传给 \`[inner]\` 的 except，最后由 FastAPI 处理返回响应。

这个机制让"分层错误处理"成为可能：每层依赖可以记录自己的日志、做自己的清理，然后把异常继续上传。

## 十二、常见错误与避坑指南

### 错误 1：循环依赖

\`\`\`python
# ❌ 错误：A 依赖 B，B 又依赖 A
def dep_a(b=Depends(dep_b)):
    return "A"

def dep_b(a=Depends(dep_a)):
    return "B"

# 这会导致无限递归，FastAPI 启动时会报错
\`\`\`

依赖图必须是 DAG（有向无环图），不能有环。设计依赖时要避免循环。

### 错误 2：误以为依赖参数会自动注入到路由

\`\`\`python
# ❌ 误区
def get_user(token: str = Header(...)):
    return user

@app.get("/me")
def me(user=Depends(get_user)):
    # 这里访问不了 token！token 是 get_user 的参数，不是路由的
    return user
\`\`\`

路由函数只能拿到依赖的返回值，不能拿到依赖的内部参数。如果需要 token，要么让依赖返回它，要么路由函数自己声明。

### 错误 3：依赖缓存导致的状态共享问题

\`\`\`python
# ❌ 误区：以为不同 Depends 实例是独立的
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

counter_a = make_counter()
counter_b = make_counter()

@app.get("/test")
def test(
    a: int = Depends(counter_a),
    b: int = Depends(counter_b),
):
    # a 和 b 是不同函数，不会缓存复用
    # 但如果用同一个函数，就会被缓存
    return {"a": a, "b": b}
\`\`\`

缓存是按"依赖函数对象"做的。同一个函数对象（即使是 factory 生成的不同实例）会被视为不同依赖。要注意闭包的共享状态。

### 错误 4：在依赖里修改全局状态

\`\`\`python
# ❌ 危险：依赖修改全局变量
request_count = 0

def count_request():
    global request_count
    request_count += 1  # 全局变量，多并发下不安全！
    yield

@app.get("/")
def root(_=Depends(count_request)):
    return {"count": request_count}
\`\`\`

FastAPI 是异步框架，并发请求可能同时执行依赖。修改全局变量会有竞态条件。需要共享状态用数据库、Redis 或线程安全的数据结构。

### 错误 5：yield 依赖嵌套时清理顺序错误

\`\`\`python
# ❌ 危险：内层依赖清理时访问已关闭的外层资源
def get_db():
    db = create_connection()
    try:
        yield db
    finally:
        db.close()  # 先关闭

def get_cache(db=Depends(get_db)):
    cache = Cache(db)  # cache 依赖 db
    try:
        yield cache
    finally:
        cache.flush()  # 这里访问 db，但 db 可能已关闭！

# ✅ 正确：清理顺序应该是 cache 先清理（用 db），然后 db 关闭
# FastAPI 的洋葱模型保证了这一点：内层先清理
\`\`\`

FastAPI 的执行顺序保证了正确的清理顺序（内层先清理），但你要确保清理代码不访问已关闭的资源。如果 \`cache.flush()\` 需要 db，那它必须在 db.close() 之前执行——这正是洋葱模型保证的。

## 十三、本章小结

本章我们学习了：

1. **嵌套依赖**：依赖函数本身也可以用 Depends 声明自己的依赖。
2. **执行顺序**：深度优先 + 后序遍历，从底层依赖开始执行。
3. **依赖图**：用 DAG 理解复杂依赖关系，避免循环。
4. **复用与缓存**：底层依赖在请求内只执行一次，结果共享。
5. **组合使用**：一个路由可以组合多个独立依赖，各司其职。
6. **异常短路**：依赖抛 HTTPException 时，下游不执行。
7. **分层异常处理**：yield 嵌套时，异常沿依赖链向上传播。
8. **避坑要点**：避免循环依赖、注意缓存共享、不修改全局状态、清理顺序。

依赖嵌套是 FastAPI 处理复杂业务逻辑的核心武器。把大问题拆成小依赖，组合成依赖图，代码会变得清晰、可测试、易维护。下一章我们学习类与全局依赖。
`,
  },

  // ============================================================
  // 第 24 章：类与全局依赖
  // ============================================================
  {
    id: "fa-class-dep",
    group: "依赖注入",
    icon: "🏛️",
    title: "类与全局依赖",
    content: `# 类与全局依赖

## 一、为什么需要类作为依赖

前面的依赖都是函数。函数依赖简单直接，但有局限：

1. **状态管理麻烦**：函数依赖如果要持有状态（如配置、缓存），得用闭包或全局变量，不优雅。
2. **复用性差**：相似逻辑要写多个函数，无法继承。
3. **类型提示弱**：函数返回值要手动标注，IDE 提示有限。
4. **无法统一管理**：配置类、日志类、认证类分散在各函数里，没有统一的"对象"概念。

类作为依赖解决了这些问题。FastAPI 支持把类直接放进 \`Depends()\`，框架会自动实例化（调用 \`__init__\`），把实例注入到路由函数。类的 \`__init__\` 参数同样从请求解析，就像函数参数一样。

类依赖的好处：

- **封装状态**：实例属性天然持有状态，不用全局变量。
- **继承复用**：可以继承基类，复用逻辑。
- **类型友好**：IDE 完整识别类的方法和属性。
- **面向对象**：符合 OOP 设计模式，适合复杂业务。

## 二、类作为依赖：__init__ 参数自动注入

直接看示例：

\`\`\`python
# 导入 FastAPI、Depends、Query
from fastapi import FastAPI, Depends, Query
# 导入 Optional
from typing import Optional

app = FastAPI()

# 定义一个类：分页参数
class Pagination:
    # __init__ 的参数会被 FastAPI 从请求解析
    # 就像函数依赖的参数一样，类型注解会被识别
    def __init__(
        self,
        # page 参数，从 query string 取
        # Query(1, ge=1) 默认值 1，最小值 1
        page: int = Query(1, ge=1, description="页码"),
        # size 参数
        # le=100 限制最大 100 条
        size: int = Query(20, ge=1, le=100, description="每页条数"),
    ):
        # 把参数存为实例属性
        # 这样路由函数可以通过 pagination.page 访问
        self.page = page
        self.size = size
        # 计算 offset（数据库查询的偏移量）
        # 第 1 页 offset=0，第 2 页 offset=size
        self.offset = (page - 1) * size

    # 类的方法
    def get_range(self):
        # 返回 [start, end) 区间
        # 用于切片查询
        return (self.offset, self.offset + self.size)

    def __repr__(self):
        # __repr__ 定义打印时的显示，方便调试
        return f"Pagination(page={self.page}, size={self.size})"

# 路由：用类作为依赖
# Depends(Pagination) 传类本身，框架会调用 Pagination(page=..., size=...) 实例化
@app.get("/items")
def list_items(pagination: Pagination = Depends(Pagination)):
    # pagination 是 Pagination 实例
    # 可以访问属性
    print(f"页码: {pagination.page}")
    print(f"每页: {pagination.size}")
    # 可以调用方法
    start, end = pagination.get_range()
    return {
        "pagination": {"page": pagination.page, "size": pagination.size},
        "range": [start, end],
    }

# 另一个路由复用同一个类依赖
@app.get("/users")
def list_users(pagination: Pagination = Depends(Pagination)):
    start, end = pagination.get_range()
    return {"range": [start, end]}
\`\`\`

请求 \`GET /items?page=2&size=5\`，FastAPI 会：

1. 解析 \`Pagination.__init__\` 签名，发现 \`page\`、\`size\` 参数。
2. 从 query string 解析 \`page=2\`、\`size=5\`。
3. 调用 \`Pagination(page=2, size=5)\`，创建实例。
4. 把实例注入到 \`pagination\` 参数。
5. 调用 \`list_items(pagination=<Pagination 实例>)\`。

注意写法：\`Depends(Pagination)\` 里传的是类本身（不是实例）。FastAPI 会调用类来实例化。等价于 \`Depends(Pagination())\`？不！\`Depends(Pagination())\` 是传一个已实例化的对象，FastAPI 不会再调用它。要传类本身，让框架实例化。

## 三、类方法作为依赖

除了类本身，类的方法也能作为依赖：

\`\`\`python
# 导入 FastAPI、Depends、Header、HTTPException
from fastapi import FastAPI, Depends, Header, HTTPException
# 导入 Optional
from typing import Optional

app = FastAPI()

# 认证服务类
class AuthService:
    def __init__(self):
        # 模拟用户库
        self.users = {
            "alice_token": {"id": 1, "name": "alice", "role": "admin"},
            "bob_token": {"id": 2, "name": "bob", "role": "user"},
        }

    # 方法作为依赖：从 Header 取 token，返回用户
    def get_current_user(
        self,
        authorization: Optional[str] = Header(None),
    ):
        # 没有 Authorization
        if not authorization:
            raise HTTPException(401, "缺少 Authorization")
        # 提取 token
        token = authorization.replace("Bearer ", "")
        # 查用户
        user = self.users.get(token)
        if not user:
            raise HTTPException(401, "无效 token")
        return user

    # 方法作为依赖：校验 admin
    def require_admin(
        self,
        user: dict = Depends(get_current_user),  # 依赖另一个方法
    ):
        if user["role"] != "admin":
            raise HTTPException(403, "需要管理员权限")
        return user

# 创建服务实例（全局单例）
auth_service = AuthService()

# 路由：用方法作为依赖
@app.get("/me")
def get_me(user: dict = Depends(auth_service.get_current_user)):
    return {"user": user}

@app.get("/admin")
def admin_panel(admin: dict = Depends(auth_service.require_admin)):
    return {"admin": admin}
\`\`\`

这里 \`Depends(auth_service.get_current_user)\` 传的是**绑定方法**（bound method）。FastAPI 调用它时，\`self\` 已经绑定了 \`auth_service\`，所以方法里能访问 \`self.users\`。

方法依赖的好处：把相关逻辑组织在一个类里，通过 \`self\` 共享状态（如用户库）。

## 四、全局依赖：app 级别

有些依赖需要对所有接口生效，如全局日志、CORS、请求追踪。FastAPI 支持在 \`FastAPI()\` 构造时声明全局依赖：

\`\`\`python
# 导入 FastAPI、Depends、Request
from fastapi import FastAPI, Depends, Request
# 导入时间
import time

# 全局依赖：记录每个请求的开始时间
def log_request_start(request: Request):
    # request 是 FastAPI 注入的 Request 对象
    print(f"[{time.time()}] 请求开始: {request.method} {request.url.path}")
    # 这里不 return，只是为了副作用
    # 也可以 return 值，但全局依赖的返回值不会注入到路由（路由没声明参数接收）

# 全局依赖：记录请求耗时
def timing_middleware(request: Request):
    # 记录开始时间
    start = time.time()
    print(f"[timing] {request.method} {request.url.path} 开始")
    # 这里不能 yield，因为是普通依赖
    # 如果要测耗时，用 yield
    # 但全局依赖用 dependencies 参数声明时，不能用 yield
    # 所以这里只记录开始
    print(f"[timing] 开始时间: {start}")

# 创建 app 时声明全局依赖
# dependencies 参数接收一个依赖列表，对所有路由生效
app = FastAPI(
    dependencies=[Depends(log_request_start)],
)

# 普通路由
@app.get("/")
def root():
    return {"msg": "hello"}

@app.get("/users")
def list_users():
    return [{"id": 1}, {"id": 2}]
\`\`\`

请求 \`GET /users\`，控制台输出：

\`\`\`
[1234567890.12] 请求开始: GET /users
\`\`\`

全局依赖对所有路由生效，无需在每个路由重复声明。适合做日志、监控、CORS 之类的基础设施。

注意：\`dependencies\` 参数里的依赖**只执行副作用，不注入返回值**。因为路由函数没有参数接收它们。如果需要返回值，路由函数要显式声明 \`Depends()\`。

## 五、全局依赖：router 级别

更精细的控制是 router 级别依赖。一组路由共享依赖，但不影响其他路由：

\`\`\`python
# 导入 FastAPI、APIRouter、Depends、HTTPException
from fastapi import FastAPI, APIRouter, Depends, HTTPException
# 导入 Header、Optional
from fastapi import Header
from typing import Optional

app = FastAPI()

# 依赖：校验 API Key
def verify_api_key(x_api_key: Optional[str] = Header(None)):
    # 检查 X-API-Key 头
    if x_api_key != "secret123":
        raise HTTPException(401, "无效的 API Key")

# 创建 router，声明 router 级别依赖
# 这个 router 下所有路由都会先校验 API Key
admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_api_key)],  # router 级别依赖
)

# admin 路由1
@admin_router.get("/users")
def admin_list_users():
    return [{"id": 1, "name": "alice"}]

# admin 路由2
@admin_router.get("/orders")
def admin_list_orders():
    return [{"id": 101, "amount": 100}]

# 把 router 注册到 app
app.include_router(admin_router)

# 普通路由（不受 API Key 保护）
@app.get("/public")
def public():
    return {"msg": "公开接口"}
\`\`\`

请求 \`GET /admin/users\` 不带 \`X-API-Key\`，返回 401。
请求 \`GET /admin/users\` 带 \`X-API-Key: secret123\`，返回用户列表。
请求 \`GET /public\`，无需 API Key，直接返回。

router 级别依赖适合"一组接口共享保护"的场景，如 admin 模块、API v1 模块。

## 六、dependencies 参数：不使用返回值的依赖

\`dependencies\` 参数可以用在三个级别：

1. **app 级别**：\`FastAPI(dependencies=[...])\`
2. **router 级别**：\`APIRouter(dependencies=[...])\`
3. **路由级别**：\`@app.get("/path", dependencies=[...])\`

它们的共同点：依赖只执行副作用（如校验、日志），返回值不被注入。适合"只需执行、不需返回"的场景。

\`\`\`python
# 导入 FastAPI、Depends、Header、HTTPException
from fastapi import FastAPI, Depends, Header, HTTPException
from typing import Optional

app = FastAPI()

# 依赖：校验来源
def check_origin(origin: Optional[str] = Header(None)):
    # 检查 Origin 头
    allowed = ["https://example.com", "https://app.example.com"]
    if origin and origin not in allowed:
        raise HTTPException(403, "来源不允许")

# 依赖：记录访问
def log_access():
    print("[access] 有人访问了受保护接口")

# 路由级别 dependencies
@app.get(
    "/protected",
    dependencies=[
        Depends(check_origin),  # 校验来源
        Depends(log_access),    # 记录日志
    ],
)
def protected_endpoint():
    # 这里拿不到 check_origin 和 log_access 的返回值
    # 因为路由函数没声明参数接收
    return {"msg": "这是受保护接口"}

# 也可以同时用 dependencies 和 Depends 注入
def get_user_info():
    return {"name": "alice"}

@app.get(
    "/mixed",
    dependencies=[Depends(check_origin)],  # 只执行，不注入
)
def mixed_endpoint(user: dict = Depends(get_user_info)):  # 注入返回值
    # user 是 get_user_info 的返回值
    # check_origin 已执行（如果失败会抛异常）
    return {"user": user}
\`\`\`

\`dependencies\` 用于"前置校验/日志"，\`Depends()\` 参数用于"获取数据"。两者可以混用。

## 七、Annotated 类型注解写法

FastAPI 推荐用 \`Annotated\` 写依赖，更清晰、可复用：

\`\`\`python
# 导入 FastAPI、Depends、Query、Header
from fastapi import FastAPI, Depends, Query, Header
# 导入 Annotated（Python 3.9+）
from typing import Annotated, Optional

app = FastAPI()

# 传统写法
@app.get("/old")
def old(
    page: int = Query(1, ge=1),
    user: dict = Depends(get_user_dep),
):
    return {"page": page, "user": user}

# Annotated 写法
# 把类型和依赖打包成 Annotated[类型, 依赖]
# 优点：可复用、可读性好
# Annotated 第一个参数是类型，后面是元数据（Query/Header/Depends 等）
PageQuery = Annotated[int, Query(1, ge=1, description="页码")]
SizeQuery = Annotated[int, Query(20, ge=1, le=100, description="每页条数")]

# 依赖函数
# Annotated[str, Header()] 表示从 Header 读取 str 类型
def get_current_user(token: Annotated[str, Header()] = "") -> dict:
    if token != "valid":
        from fastapi import HTTPException
        raise HTTPException(401, "无效 token")
    return {"name": "alice"}

# 把依赖也封装成 Annotated 类型
# CurrentUser 等价于 dict 类型 + Depends(get_current_user) 依赖
# 用时只需写 user: CurrentUser，不用写完整的 Depends(...)
CurrentUser = Annotated[dict, Depends(get_current_user)]

@app.get("/new")
def new(
    page: PageQuery,        # 复用类型
    size: SizeQuery,        # 复用类型
    user: CurrentUser,      # 复用依赖
):
    return {"page": page, "size": size, "user": user}

# 复用：另一个接口用同样的类型
@app.get("/products")
def list_products(
    page: PageQuery,
    size: SizeQuery,
    user: CurrentUser,
):
    return {"page": page, "size": size, "user": user["name"]}
\`\`\`

\`Annotated\` 的优势：

1. **可复用**：\`PageQuery\`、\`CurrentUser\` 定义一次，到处用。
2. **可读性好**：参数声明简洁，类型和元数据分离。
3. **类型友好**：IDE 能识别 \`CurrentUser\` 是 \`dict\` 类型。
4. **避免重复**：不用每个接口都写 \`Depends(get_current_user)\`。

FastAPI 官方文档现在推荐 \`Annotated\` 写法，建议新项目用这种风格。

## 八、UseLifespan 与 Depends 的区别

FastAPI 有两个概念容易混淆：\`lifespan\` 和 \`Depends\`。它们都能"注入资源"，但用途完全不同。

| 维度 | \`lifespan\` | \`Depends\` |
|---|---|---|
| 作用域 | 应用级别（整个 app 生命周期） | 请求级别（单个请求） |
| 执行时机 | app 启动/关闭 | 每个请求 |
| 资源类型 | 全局单例（如连接池、Redis 客户端） | 请求级资源（如 db session、当前用户） |
| 注入方式 | 存到 \`app.state\`，路由用 \`request.app.state\` 访问 | 函数参数自动注入 |
| 异步支持 | async context manager | async def 或 yield |

\`\`\`python
# 导入 FastAPI、Depends、Request
from fastapi import FastAPI, Depends, Request
# 导入 contextlib
from contextlib import asynccontextmanager
# 导入 async session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# ========== lifespan：管理应用级资源 ==========
# @asynccontextmanager 把 async 生成器函数变成异步上下文管理器
# lifespan 在应用启动时执行 yield 之前的代码，关闭时执行 yield 之后的代码
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时：创建连接池
    print("[lifespan] 创建数据库连接池")
    # create_async_engine 创建异步引擎（连接池）
    # "sqlite+aiosqlite:///test.db" 表示用 aiosqlite 驱动连接 SQLite
    engine = create_async_engine("sqlite+aiosqlite:///test.db")
    # 存到 app.state，全局可访问
    # app.state 是应用级共享对象，所有请求都能访问
    app.state.engine = engine
    app.state.SessionLocal = async_sessionmaker(engine)

    # yield 把控制权交给应用
    # yield 之前是启动代码，yield 之后是关闭代码
    yield

    # 关闭时：清理资源
    print("[lifespan] 关闭连接池")
    # engine.dispose() 关闭所有连接，释放资源
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

# ========== Depends：管理请求级资源 ==========
async def get_db(request: Request):
    # 从 app.state 取 SessionLocal 工厂
    # request.app.state 访问应用级状态
    SessionLocal = request.app.state.SessionLocal
    # 每个请求创建独立 session
    # async with 自动管理 session 生命周期（退出时关闭）
    async with SessionLocal() as db:
        print(f"[get_db] 创建 session")
        yield db
        print(f"[get_db] 关闭 session")

# 路由
@app.get("/users")
async def list_users(db=Depends(get_db)):
    # db 是请求级 session
    result = await db.execute("SELECT 1")
    return {"data": "ok"}
\`\`\`

**核心区别**：

- \`lifespan\` 创建的连接池是**全局单例**，所有请求共享。
- \`Depends\` 创建的 session 是**请求级**，每个请求独立。

这是合理的：连接池创建/销毁昂贵，应该全局共享；session 是轻量级的，每个请求要独立的事务隔离。

设计原则：

- **重资源、全局共享** → lifespan（连接池、Redis 客户端、配置对象）
- **轻资源、请求隔离** → Depends（db session、当前用户、请求上下文）

## 九、实战：配置管理类 + 认证类 + 日志类组合

把本章学的组合起来，实现一个完整的"基础设施层"：

\`\`\`python
# 导入 FastAPI、Depends、Request、Header、HTTPException
from fastapi import FastAPI, Depends, Request, Header, HTTPException
# 导入 Annotated、Optional
from typing import Annotated, Optional
# 导入 logging
import logging
# 导入 contextlib
from contextlib import asynccontextmanager

# ========== 1. 配置管理类 ==========

class Settings:
    """应用配置（从环境变量或配置文件加载）"""
    def __init__(self):
        # 模拟配置
        self.app_name = "MyAPI"
        self.debug = True
        self.database_url = "sqlite:///test.db"
        self.secret_key = "super-secret"
        # JWT 过期时间（秒）
        self.jwt_expire = 3600

    def get_secret(self) -> str:
        # 获取密钥
        return self.secret_key

# 全局配置单例（也可以用 lifespan 创建）
settings = Settings()

# ========== 2. 日志类 ==========

class LoggerService:
    """日志服务类"""
    def __init__(self, name: str = "app"):
        # 创建 logger
        self.logger = logging.getLogger(name)
        # 设置级别
        self.logger.setLevel(logging.DEBUG if settings.debug else logging.INFO)
        # 避免重复添加 handler
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def info(self, msg: str):
        self.logger.info(msg)

    def error(self, msg: str):
        self.logger.error(msg)

    def debug(self, msg: str):
        self.logger.debug(msg)

# 全局 logger 单例
logger = LoggerService()

# ========== 3. 认证类 ==========

class AuthService:
    """认证服务类"""
    def __init__(self, secret: str):
        # 保存密钥
        self.secret = secret
        # 模拟用户库
        self.users = {
            "alice_token": {"id": 1, "name": "alice", "role": "admin"},
            "bob_token": {"id": 2, "name": "bob", "role": "user"},
        }

    def verify_token(self, token: str) -> dict:
        # 校验 token，返回用户
        user = self.users.get(token)
        if not user:
            raise HTTPException(401, "无效 token")
        return user

    def get_current_user(
        self,
        authorization: Annotated[Optional[str], Header()] = None,
    ) -> dict:
        # 从 Header 取 token
        if not authorization:
            raise HTTPException(401, "缺少 Authorization")
        token = authorization.replace("Bearer ", "")
        # 校验并返回用户
        return self.verify_token(token)

    def require_admin(
        self,
        user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        # 校验 admin
        if user["role"] != "admin":
            raise HTTPException(403, "需要管理员权限")
        return user

# 全局 auth 服务（用配置初始化）
auth_service = AuthService(secret=settings.get_secret())

# ========== 4. Annotated 类型别名 ==========

# 当前用户依赖类型
CurrentUser = Annotated[dict, Depends(auth_service.get_current_user)]
# 管理员依赖类型
AdminUser = Annotated[dict, Depends(auth_service.require_admin)]

# ========== 5. 全局依赖：请求日志 ==========

def log_request(request: Request):
    # 记录请求方法、路径
    logger.info(f"{request.method} {request.url.path}")

# ========== 6. 创建 app ==========

app = FastAPI(
    title=settings.app_name,
    # 全局依赖：所有请求都记日志
    dependencies=[Depends(log_request)],
)

# ========== 7. 路由 ==========

# 公开接口
@app.get("/")
def root():
    logger.info("访问根路径")
    return {"app": settings.app_name, "debug": settings.debug}

# 需要登录的接口
@app.get("/me")
def get_me(user: CurrentUser):
    # CurrentUser 自动注入当前用户
    logger.info(f"用户 {user['name']} 查看自己的信息")
    return {"user": user}

# 需要管理员权限的接口
@app.get("/admin/users")
def admin_list_users(admin: AdminUser):
    # AdminUser 自动校验并注入管理员
    logger.info(f"管理员 {admin['name']} 查看用户列表")
    return {
        "admin": admin["name"],
        "users": list(auth_service.users.values()),
    }

# 创建用户的接口（管理员）
@app.post("/admin/users")
def admin_create_user(
    admin: AdminUser,
    name: str,
    role: str = "user",
):
    # 生成新 token
    new_token = f"{name}_token"
    # 创建用户
    auth_service.users[new_token] = {
        "id": len(auth_service.users) + 1,
        "name": name,
        "role": role,
    }
    logger.info(f"管理员 {admin['name']} 创建了用户 {name}")
    return {"msg": "用户已创建", "token": new_token, "user": auth_service.users[new_token]}
\`\`\`

这个示例整合了：

1. **配置类 \`Settings\`**：全局单例，存储应用配置。
2. **日志类 \`LoggerService\`**：封装 logging，提供 info/error/debug 方法。
3. **认证类 \`AuthService\`**：封装认证逻辑，方法作为依赖。
4. **Annotated 别名**：\`CurrentUser\`、\`AdminUser\` 复用依赖。
5. **全局依赖**：\`log_request\` 对所有路由生效。
6. **类方法依赖**：\`auth_service.get_current_user\`、\`auth_service.require_admin\`。
7. **方法间依赖**：\`require_admin\` 依赖 \`get_current_user\`。

请求 \`GET /me\` 带 \`Authorization: Bearer alice_token\`，执行流程：

1. 全局依赖 \`log_request\` 记录请求日志。
2. \`get_current_user\` 从 Header 取 token，校验返回 alice。
3. \`get_me\` 拿到 user，返回。

请求 \`GET /admin/users\` 带 \`Authorization: Bearer bob_token\`：

1. \`log_request\` 记录。
2. \`require_admin\` → \`get_current_user\` 返回 bob。
3. \`require_admin\` 检查 bob 不是 admin，抛 403。

这个结构清晰、可测试、易扩展。要加新功能（如限流），只需新增一个类或依赖，注入即可。

## 十十、类依赖与函数依赖的选择

什么时候用类，什么时候用函数？

| 场景 | 推荐方式 |
|---|---|
| 无状态参数解析（分页、排序） | 函数或类都行 |
| 需要持有状态（用户库、配置） | 类 |
| 需要复用逻辑（继承） | 类 |
| 简单校验 | 函数 |
| 复杂业务（多方法协作） | 类 |
| 全局单例服务 | 类 + 全局实例 |

简单经验：**简单用函数，复杂用类**。如果一个依赖只有一两个参数、返回个值，函数更简洁。如果依赖有多个相关方法、需要持有状态，用类。

## 十一、常见错误与避坑指南

### 错误 1：传实例而不是类

\`\`\`python
# ❌ 错误：传实例，框架不会调用 __init__
class Pagination:
    def __init__(self, page: int = 1):
        self.page = page

@app.get("/items")
def list_items(p=Depends(Pagination(page=1))):  # 已经实例化了！
    # page 参数不会被解析
    return p

# ✅ 正确：传类本身
@app.get("/items")
def list_items(p: Pagination = Depends(Pagination)):
    # 框架会调用 Pagination(page=...)
    return p.page
\`\`\`

\`Depends(Pagination)\` 传类，框架实例化。\`Depends(Pagination())\` 传实例，框架直接用（参数不会被解析）。

### 错误 2：__init__ 参数和路由参数冲突

\`\`\`python
# ❌ 错误：路由和类的 __init__ 都声明 page
class Pagination:
    def __init__(self, page: int = Query(1)):
        self.page = page

@app.get("/items")
def list_items(page: int = Query(1), p: Pagination = Depends(Pagination)):
    # page 会被解析两次！
    return {"page": page, "p.page": p.page}
\`\`\`

依赖的参数由依赖自己解析，路由函数不要重复声明。如果要同时用，路由函数只接收依赖实例，从实例属性取值。

### 错误 3：全局依赖里用 yield

\`\`\`python
# ❌ 错误：dependencies 参数不支持 yield 依赖
def bad_global_dep():
    yield  # 报错！

app = FastAPI(dependencies=[Depends(bad_global_dep)])

# ✅ 正确：全局依赖用普通函数（只执行副作用）
def good_global_dep():
    print("执行")

app = FastAPI(dependencies=[Depends(good_global_dep)])

# 如果需要 yield（资源管理），用 lifespan
\`\`\`

\`dependencies\` 参数里的依赖只执行副作用，不能用 yield。需要资源管理用 lifespan 或在路由函数里声明 \`Depends()\`。

### 错误 4：类方法依赖忘记 self

\`\`\`python
# ❌ 错误：方法里访问 self 但没绑定
class Service:
    def get_user(self, token: str = Header(...)):
        return self.users[token]  # self 未定义！

@app.get("/me")
def me(user=Depends(Service.get_user)):  # 传未绑定方法
    return user

# ✅ 正确：传绑定方法（实例.方法）
service = Service()

@app.get("/me")
def me(user=Depends(service.get_user)):  # 传 service.get_user
    return user
\`\`\`

\`Service.get_user\` 是未绑定方法，\`self\` 没有值。要传 \`service.get_user\`（实例的方法），\`self\` 才绑定到 \`service\`。

### 错误 5：Annotated 类型用错

\`\`\`python
# ❌ 错误：Annotated 顺序反了
Page = Annotated[Query(1), int]  # 类型在前？错！

# ✅ 正确：类型在前，元数据在后
Page = Annotated[int, Query(1, ge=1)]
\`\`\`

\`Annotated[类型, 元数据1, 元数据2, ...]\`，类型必须是第一个参数。

### 错误 6：误以为全局依赖的返回值能注入

\`\`\`python
# ❌ 误区
def get_config():
    return {"debug": True}

app = FastAPI(dependencies=[Depends(get_config)])

@app.get("/")
def root():
    # 这里访问不了 config！
    # 因为 dependencies 的依赖返回值不注入
    return {"msg": "hello"}

# ✅ 正确：要在路由函数里声明 Depends 才能拿到返回值
@app.get("/")
def root(config: dict = Depends(get_config)):
    return {"debug": config["debug"]}
\`\`\`

\`dependencies\` 只执行副作用。要拿返回值，路由函数要显式声明 \`Depends()\`。

## 十二、本章小结

本章我们学习了：

1. **类作为依赖**：传类本身给 \`Depends()\`，框架调用 \`__init__\` 实例化，参数从请求解析。
2. **类方法作为依赖**：传绑定方法 \`instance.method\`，\`self\` 自动绑定。
3. **全局依赖**：\`FastAPI(dependencies=[...])\` 对所有路由生效。
4. **router 级别依赖**：\`APIRouter(dependencies=[...])\` 对该 router 生效。
5. **路由级别 dependencies**：\`@app.get(..., dependencies=[...])\` 只执行副作用。
6. **Annotated 写法**：把类型和依赖打包，可复用、可读性好。
7. **lifespan vs Depends**：lifespan 管应用级资源（连接池），Depends 管请求级资源（session）。
8. **实战组合**：配置类 + 日志类 + 认证类 + Annotated 别名 + 全局依赖。
9. **避坑要点**：传类不传实例、避免参数冲突、dependencies 不支持 yield、方法要绑定 self、Annotated 顺序。

类与全局依赖是构建大型 FastAPI 应用的基础。把基础设施封装成类，用全局依赖统一管理，用 Annotated 简化声明，代码会变得模块化、可测试、易维护。

## 十三、依赖注入总结

到此，我们完成了依赖注入四章的学习。回顾整个体系：

1. **基础**（第 21 章）：Depends 工作原理、函数依赖、缓存机制。
2. **资源管理**（第 22 章）：yield 依赖、try/finally、事务管理。
3. **嵌套组合**（第 23 章）：依赖图、复用、异常短路。
4. **类与全局**（第 24 章）：类依赖、全局依赖、Annotated、lifespan。

依赖注入是 FastAPI 的灵魂。掌握它，你就能写出：

- **解耦**的代码：业务逻辑和基础设施分离。
- **可测试**的代码：mock 依赖做单元测试。
- **可复用**的代码：依赖跨接口共享。
- **可扩展**的代码：新增功能加依赖即可。

后续章节（中间件、安全、数据库、测试）都会用到依赖注入。把它吃透，FastAPI 的其他特性就迎刃而解了。
`,
  },
];
