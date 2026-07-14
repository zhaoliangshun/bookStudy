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

## 二、生活类比：餐厅后厨的分工哲学

理解依赖注入最直观的方式，是用餐厅后厨作比喻。

**传统模式（无依赖注入）= 厨师自己干所有事**

想象一个餐厅，每个厨师进门都要自己：
- 去仓库领刀具
- 去冷库拿食材
- 自己生火
- 自己洗碗

这就是传统写法的代码：每个接口自己创建 db、自己校验 token、自己管理资源。

**依赖注入模式 = 餐厅标准化分工**

标准化的餐厅是这样运作的：
- 厨师进门时，刀具已经备好放在案板（依赖自动注入）
- 食材由采购员配送到工位（资源由容器提供）
- 火候由中央厨房统一控制（生命周期由框架管理）
- 厨师只管炒菜（业务逻辑）

\`\`\`python
# ❌ "自己干所有事"的厨师
def cook_dish():
    knife = go_to_warehouse_get_knife()      # 自己去拿刀
    food = go_to_fridge_get_food()           # 自己去拿食材
    fire = light_fire()                      # 自己生火
    dish = cook(knife, food, fire)           # 终于开始炒菜
    wash(knife)                              # 还要自己洗碗
    return dish

# ✅ "标准化分工"的厨师（依赖注入）
def cook_dish(
    knife: Knife = Depends(get_knife),       # 刀具自动配送
    food: Food = Depends(get_food),          # 食材自动配送
    fire: Fire = Depends(get_fire),          # 火候自动控制
):
    # 厨师只管炒菜，不用管刀从哪来、火怎么生
    return cook(knife, food, fire)
\`\`\`

**Depends 像点菜时自动配套餐具**

去餐厅点一份牛排，服务员不会只端一盘肉过来——会自动配上刀叉、酱料、餐巾纸。你不需要每次都说"请给我刀叉"，餐厅默认就会提供。

\`Depends()\` 就是这个"服务员"：你声明"我要 db session"，它自动把 db session 端到你面前，连同 db 需要的连接池、配置一起准备好。

## 三、控制反转（IoC）：依赖注入背后的设计思想

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

## 四、FastAPI 的 Depends() 工作原理

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

## 五、第一个 Depends 示例：函数作为依赖

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

## 六、依赖的参数和返回值

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

## 七、依赖的缓存机制：同一请求内复用

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

## 八、依赖用于权限检查

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

## 九、依赖用于数据库 Session

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

## 十、依赖用于公共参数：避免重复声明

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

## 十一、实战：通用分页参数依赖

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
    id: int            # 商品 ID
    name: str          # 商品名
    price: float       # 价格

# 模拟商品数据
# 列表推导式生成 100 个商品，实际项目从数据库查
fake_products = [
    Product(id=i, name=f"商品{i}", price=i * 10.0)
    for i in range(1, 101)
]

# 商品列表接口：使用分页依赖 + 分页响应模型
# response_model=PageResponse[Product] 用泛型指定 items 类型
@app.get("/products", response_model=PageResponse[Product])
def list_products(page_params: dict = Depends(get_page_params)):
    # 解构参数（page_params 是 get_page_params 返回的 dict）
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
        total=len(fake_products),  # 总条数
        items=items,               # 当前页数据
    )

# 订单模型
class Order(BaseModel):
    id: int            # 订单 ID
    user_id: int       # 用户 ID（外键）
    amount: float      # 订单金额

# 模拟订单数据
# 生成 200 个订单，user_id 在 1-10 之间循环
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

## 十二、新增 Demo：环境配置依赖

实际项目中，配置（数据库 URL、密钥、调试模式）经常需要注入。用依赖封装配置，便于切换环境（开发/测试/生产）。

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends
# 导入 os 用于读取环境变量
import os

app = FastAPI()

# 配置类：封装应用配置
class AppConfig:
    def __init__(self):
        # 从环境变量读取，带默认值
        # os.getenv("变量名", "默认值")：没设置时用默认值
        self.debug = os.getenv("DEBUG", "true").lower() == "true"  # 调试模式
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///dev.db")  # 数据库 URL
        self.secret_key = os.getenv("SECRET_KEY", "dev-secret")   # 密钥
        self.environment = os.getenv("ENV", "development")        # 环境名

    def is_production(self) -> bool:
        # 判断是否是生产环境
        return self.environment == "production"

# 全局配置实例（单例）
_config = AppConfig()

# 依赖函数：返回配置实例
def get_config() -> AppConfig:
    # 返回全局配置
    # 实际项目可以在这里根据请求切换租户配置
    return _config

# 路由：注入配置
@app.get("/info")
def app_info(config: AppConfig = Depends(get_config)):
    # config 是 AppConfig 实例
    return {
        "environment": config.environment,    # 环境名
        "debug": config.debug,                # 调试模式
        "is_prod": config.is_production(),    # 是否生产环境
        # 注意：密钥不要暴露给前端！这里只是演示
        "db_url": config.database_url if not config.is_production() else "***",
    }

# 路由：根据配置走不同逻辑
@app.get("/data")
def get_data(config: AppConfig = Depends(get_config)):
    # 根据环境返回不同数据
    if config.is_production():
        # 生产环境：返回脱敏数据
        return {"data": "production-data-masked"}
    else:
        # 开发环境：返回详细数据
        return {"data": "dev-data-detail", "debug_info": "详细调试信息"}
\`\`\`

这个例子展示了配置依赖的用法：配置在全局创建一次，通过依赖注入到任何需要的接口。切换环境只需改环境变量，代码不用动。

## 十三、新增 Demo：请求 ID 追踪依赖

微服务/日志追踪场景中，每个请求要有一个唯一 ID，贯穿所有日志。用依赖封装请求 ID 生成。

\`\`\`python
# 导入 FastAPI、Depends、Header
from fastapi import FastAPI, Depends, Header
# 导入 uuid 生成唯一 ID
import uuid
# 导入 Optional
from typing import Optional

app = FastAPI()

# 依赖函数：获取或生成请求 ID
def get_request_id(
    # 从 Header 读 X-Request-ID（如果有，用于链路追踪）
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID"),
):
    # 如果客户端传了 X-Request-ID，沿用
    if x_request_id:
        return x_request_id
    # 否则生成新的 UUID4（随机 UUID）
    # str(uuid.uuid4()) 生成形如 "550e8400-e29b-41d4-a716-446655440000" 的字符串
    return str(uuid.uuid4())

# 依赖函数：基于请求 ID 的日志器
def get_logger(req_id: str = Depends(get_request_id)):
    # 返回一个带请求 ID 的日志函数
    # 闭包捕获 req_id，每次调用都带上它
    def log(msg: str):
        # 日志格式：[请求ID] 消息
        print(f"[{req_id}] {msg}")
    return log

# 路由：注入请求 ID 和日志器
@app.get("/users")
def list_users(
    req_id: str = Depends(get_request_id),       # 请求 ID
    logger = Depends(get_logger),                 # 日志器（依赖请求 ID）
):
    # logger 自动带上请求 ID
    logger("开始查询用户")
    # 模拟查询
    users = [{"id": 1, "name": "alice"}]
    logger(f"查询到 {len(users)} 个用户")
    # 响应里也带上请求 ID，便于客户端排查
    return {"request_id": req_id, "users": users}
\`\`\`

请求 \`GET /users\` 带 \`X-Request-ID: abc-123\`，控制台输出：

\`\`\`
[abc-123] 开始查询用户
[abc-123] 查询到 1 个用户
\`\`\`

请求 ID 贯穿整个请求链路，日志聚合时可以按 ID 串联所有日志，便于排查问题。

## 十四、新增 Demo：简单的限流依赖

限流（rate limiting）是依赖注入的典型场景：每个接口都要限流，但限流逻辑可以统一封装。

\`\`\`python
# 导入 FastAPI、Depends、HTTPException、Request
from fastapi import FastAPI, Depends, HTTPException, Request
# 导入时间
import time

app = FastAPI()

# 简单的内存限流器（生产环境用 Redis）
# 结构：{客户端 IP: [请求时间戳列表]}
_rate_limit_store: dict[str, list[float]] = {}

# 依赖函数：限流检查
def rate_limit(
    request: Request,                        # 注入 Request 对象
    max_requests: int = 10,                  # 最大请求数
    window_seconds: int = 60,                # 时间窗口（秒）
):
    # 获取客户端 IP（实际项目要考虑 X-Forwarded-For）
    client_ip = request.client.host if request.client else "unknown"
    # 当前时间
    now = time.time()
    # 计算窗口起始时间
    window_start = now - window_seconds

    # 取出该 IP 的请求记录
    if client_ip not in _rate_limit_store:
        _rate_limit_store[client_ip] = []
    # 过滤掉窗口外的旧记录
    _rate_limit_store[client_ip] = [
        ts for ts in _rate_limit_store[client_ip] if ts > window_start
    ]
    # 检查是否超过限制
    if len(_rate_limit_store[client_ip]) >= max_requests:
        # 超限，抛 429 Too Many Requests
        raise HTTPException(
            status_code=429,
            detail=f"请求过于频繁，每 {window_seconds} 秒最多 {max_requests} 次",
        )
    # 记录本次请求时间
    _rate_limit_store[client_ip].append(now)
    # 返回剩余次数（可选）
    return {"remaining": max_requests - len(_rate_limit_store[client_ip])}

# 路由：应用限流
@app.get("/api/data")
def get_data(limit_info: dict = Depends(rate_limit)):
    return {"msg": "请求数据", "remaining": limit_info["remaining"]}

# 路由：自定义限流参数（更严格）
@app.get("/api/sensitive")
def sensitive_op(
    limit_info: dict = Depends(lambda: rate_limit(max_requests=3, window_seconds=60)),
):
    # 敏感操作，每分钟最多 3 次
    return {"msg": "敏感操作完成", "remaining": limit_info["remaining"]}
\`\`\`

这个限流依赖可以复用到任何接口，每个接口还能自定义限流参数。生产环境换成 Redis 实现，接口代码不用改。

## 十五、常见错误与避坑指南

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

### 错误 6：依赖函数没有类型注解

\`\`\`python
# ❌ 不规范：没有类型注解，IDE 无法提示
def get_user(token=Depends(get_token)):
    return users[token]

@app.get("/me")
def me(user=Depends(get_user)):  # user 是什么类型？不知道
    return user

# ✅ 规范：加上类型注解
def get_user(token: str = Depends(get_token)) -> dict:
    return users[token]

@app.get("/me")
def me(user: dict = Depends(get_user)):  # 明确是 dict
    return user
\`\`\`

类型注解不影响运行，但能让 IDE 自动补全、让 OpenAPI 文档更准确。

## 十六、动手实验

### 实验 1：观察依赖缓存行为

新建一个文件 \`experiment_cache.py\`，运行以下代码并观察输出：

\`\`\`python
# 实验：验证依赖缓存机制
from fastapi import FastAPI, Depends
import uvicorn

app = FastAPI()
call_count = 0  # 全局计数器

def expensive_op():
    """模拟耗时操作"""
    global call_count
    call_count += 1
    print(f"  [依赖] 第 {call_count} 次调用")
    return f"result-{call_count}"

@app.get("/cached")
def cached_endpoint(
    a: str = Depends(expensive_op),       # 第一次调用
    b: str = Depends(expensive_op),       # 缓存复用
    c: str = Depends(expensive_op),       # 缓存复用
):
    print(f"  [路由] a={a}, b={b}, c={c}")
    return {"a": a, "b": b, "c": c, "same": a == b == c}

@app.get("/no-cache")
def no_cache_endpoint(
    a: str = Depends(expensive_op, use_cache=False),
    b: str = Depends(expensive_op, use_cache=False),
):
    print(f"  [路由] a={a}, b={b}")
    return {"a": a, "b": b, "same": a == b}

if __name__ == "__main__":
    # 启动服务：uvicorn experiment_cache:app --reload
    # 然后用浏览器或 curl 访问：
    # curl http://127.0.0.1:8000/cached
    # curl http://127.0.0.1:8000/no-cache
    # 观察控制台输出，理解缓存差异
    uvicorn.run(app, host="127.0.0.1", port=8000)
\`\`\`

**预期结果**：
- 访问 \`/cached\`：依赖只调用 1 次，\`a == b == c\` 为 true。
- 访问 \`/no-cache\`：依赖调用 2 次，\`a == b\` 为 false。

### 实验 2：构建自己的依赖链

尝试实现一个"用户偏好设置"依赖，要求：
1. 从 Header 读取 \`Accept-Language\`（如 \`zh-CN\`、\`en-US\`）。
2. 默认值是 \`zh-CN\`。
3. 返回一个字典 \`{"lang": "zh-CN", "is_chinese": True}\`。
4. 两个接口复用这个依赖：一个返回问候语，一个返回错误提示。

\`\`\`python
# 实验模板：补全代码
from fastapi import FastAPI, Depends, Header
from typing import Optional

app = FastAPI()

# TODO: 实现 get_user_language 依赖
def get_user_language(
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
):
    # 提示：解析 Accept-Language，默认 zh-CN
    # 返回 {"lang": ..., "is_chinese": ...}
    pass  # 在这里写你的代码

# TODO: 接口1 - 返回问候语
@app.get("/greet")
def greet(lang_info: dict = Depends(get_user_language)):
    # 根据 lang 返回不同问候语
    pass  # 在这里写你的代码

# TODO: 接口2 - 返回错误提示
@app.get("/error-msg")
def error_msg(lang_info: dict = Depends(get_user_language)):
    # 根据 lang 返回不同错误提示
    pass  # 在这里写你的代码
\`\`\`

完成后用 \`curl -H "Accept-Language: en-US" http://127.0.0.1:8000/greet\` 测试。

### 实验 3：对比有依赖 vs 无依赖的代码

选一个你写过的接口（如登录、查询列表），用两种方式实现：
1. 传统方式：所有逻辑写在路由函数里。
2. 依赖注入方式：把公共逻辑抽成依赖。

对比两种代码的行数、可读性、可测试性。把对比写在笔记里。

## 十七、本章小结

本章我们学习了：

1. **依赖注入的本质**：把组件需要的依赖从外部传入，而不是内部创建，实现控制反转。
2. **Depends() 的工作原理**：FastAPI 解析路由签名，发现 Depends 声明后调用依赖函数，把返回值注入。
3. **函数作为依赖**：任何普通函数都能作为依赖，签名参数同样从请求解析。
4. **依赖的返回值**：可以是 dict、Pydantic 模型、ORM 对象等任意类型。
5. **缓存机制**：同一请求内相同依赖只执行一次，结果复用。可用 \`use_cache=False\` 禁用。
6. **典型应用**：权限校验、数据库 session、公共参数、分页参数、配置注入、请求追踪、限流。
7. **避坑要点**：要用 Depends 包裹、避免签名冲突、注意缓存、资源用 yield、异常要友好、加类型注解。

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

## 二、生活类比：图书馆借书与酒店房卡

理解 yield 依赖，可以用两个生活类比。

**类比 1：图书馆借书**

去图书馆借书，流程是这样的：
1. 借书：登记后拿到书（创建资源）
2. 看书：你在阅览室看书（使用资源）
3. 还书：看完后必须归还（清理资源）

如果只有"借书"没有"还书"，图书馆的书会越来越少，最后没书可借。这就是 \`return\` 依赖的问题——只创建不释放。

\`yield\` 依赖就像图书管理员：借书时给你书（yield 之前），你看完书后管理员来收书（yield 之后）。无论你是不小心把书弄湿了（异常）还是正常看完（正常返回），管理员都会来收书。

\`\`\`python
# 图书管理员模式：借书 → 看书 → 还书
def library_book():
    book = checkout_book()      # 借书（创建资源）
    try:
        yield book              # 把书交给读者（路由函数）
    finally:
        return_book(book)       # 还书（清理资源，无论是否出错）
\`\`\`

**类比 2：酒店房卡**

住酒店时：
1. 入住：前台给你房卡（创建资源）
2. 居住：你用房卡开门用电（使用资源）
3. 退房：交还房卡，房间断电清理（清理资源）

\`yield\` 依赖就是"前台 + 保洁"的组合：入住时发卡（yield 之前），退房时收卡打扫（yield 之后）。即使你提前退房（异常），房间也会被打扫。

## 三、yield 依赖的原理：上下文管理器

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

## 四、第一个 yield 依赖：观察执行顺序

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

## 五、数据库连接的 yield 依赖

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

## 六、新增 Demo：数据库连接池的 yield 依赖

生产环境中，数据库连接池是必须的。连接池在应用启动时创建（lifespan），每个请求从池子借一个连接，用完归还。这里演示完整的连接池 + yield 依赖模式。

\`\`\`python
# 导入 FastAPI、Depends、Request
from fastapi import FastAPI, Depends, Request
# 导入 contextlib 的 asynccontextmanager
from contextlib import asynccontextmanager
# 导入 SQLAlchemy 组件
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import QueuePool

# ========== 1. lifespan：管理连接池（应用级）==========
@asynccontextmanager
def lifespan(app: FastAPI):
    # ===== 启动时：创建连接池 =====
    print("[lifespan] 创建数据库连接池")
    # QueuePool 是 SQLAlchemy 的连接池实现
    # pool_size=5：保持 5 个连接
    # max_overflow=10：允许超出 10 个（共 15 个）
    # pool_timeout=30：等待连接超时时间（秒）
    # pool_recycle=3600：连接回收时间（1 小时，防止数据库主动断开）
    engine = create_engine(
        "sqlite:///app.db",
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=3600,
        echo=False,  # 是否打印 SQL（调试时可设 True）
    )
    # 把 engine 存到 app.state，全局可访问
    app.state.engine = engine
    # 创建 Session 工厂
    app.state.SessionLocal = sessionmaker(bind=engine)
    print(f"[lifespan] 连接池状态: {engine.pool.status()}")

    yield  # 应用运行期间

    # ===== 关闭时：释放连接池 =====
    print("[lifespan] 关闭连接池")
    print(f"[lifespan] 最终连接池状态: {engine.pool.status()}")
    # engine.dispose() 关闭所有连接
    engine.dispose()

# 创建 app，传入 lifespan
app = FastAPI(lifespan=lifespan)

# 模型基类
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)

# ========== 2. yield 依赖：从连接池借连接 ==========
def get_db(request: Request):
    # 从 app.state 取 SessionLocal 工厂
    SessionLocal = request.app.state.SessionLocal
    # 创建 session（从连接池借一个连接）
    db = SessionLocal()
    print(f"[get_db] 借出连接，池状态: {request.app.state.engine.pool.status()}")
    try:
        # yield session 给路由函数
        yield db
    finally:
        # 关闭 session（归还连接到池子，不是真断开）
        db.close()
        print(f"[get_db] 归还连接，池状态: {request.app.state.engine.pool.status()}")

# ========== 3. 路由 ==========
@app.on_event("startup")
def init_db():
    # 启动时创建表 + 插入测试数据
    engine = app.state.engine
    Base.metadata.create_all(engine)
    # 插入测试数据
    with app.state.SessionLocal() as db:
        if db.query(User).count() == 0:
            db.add_all([
                User(name="alice", age=25),
                User(name="bob", age=30),
            ])
            db.commit()
            print("[startup] 插入测试数据")

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    # 查询所有用户
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "age": u.age} for u in users]

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(404, "用户不存在")
    return {"id": user.id, "name": user.name, "age": user.age}

# 健康检查接口：查看连接池状态
@app.get("/health")
def health_check(request: Request):
    # 返回连接池状态
    return {
        "status": "ok",
        "pool": request.app.state.engine.pool.status(),
    }
\`\`\`

请求 \`GET /users\`，控制台输出：

\`\`\`
[get_db] 借出连接，池状态: Pool size: 5  Connections in pool: 0 Current Overflow: 0 Current Checked out connections: 1
[get_db] 归还连接，池状态: Pool size: 5  Connections in pool: 1 Current Overflow: 0 Current Checked out connections: 0
\`\`\`

可以看到连接被借出又归还，池子里的连接数变化。这就是连接池的工作方式。

## 七、文件资源的 yield 依赖

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

## 八、新增 Demo：CSV 文件处理的 yield 依赖

实际项目中经常要处理 CSV 文件。用 yield 依赖封装 CSV 读写，保证文件句柄正确释放。

\`\`\`python
# 导入 FastAPI、Depends、UploadFile
from fastapi import FastAPI, Depends, UploadFile, HTTPException
# 导入 csv 模块
import csv
# 导入 pathlib
from pathlib import Path

app = FastAPI()

# yield 依赖：CSV 读取器
def get_csv_reader(file_path: str = "data.csv"):
    """打开 CSV 文件并返回 reader，请求结束自动关闭"""
    # 检查文件是否存在
    if not Path(file_path).exists():
        # 文件不存在，yield None
        yield None
        return
    # 打开文件
    f = open(file_path, "r", encoding="utf-8", newline="")
    # 创建 CSV reader
    reader = csv.DictReader(f)  # DictReader 把每行读成字典
    try:
        # yield reader 给路由
        yield reader
    finally:
        # 关闭文件
        print(f"[csv_reader] 关闭文件 {file_path}")
        f.close()

# yield 依赖：CSV 写入器
def get_csv_writer(file_path: str = "output.csv"):
    """打开 CSV 文件用于写入，请求结束自动关闭"""
    # 以追加模式打开（a = append）
    f = open(file_path, "a", encoding="utf-8", newline="")
    # 创建 CSV writer
    writer = csv.writer(f)
    try:
        yield writer
    finally:
        print(f"[csv_writer] 关闭文件 {file_path}")
        f.close()

# 路由：读取 CSV
@app.get("/data")
def read_data(reader=Depends(get_csv_reader)):
    if reader is None:
        return {"msg": "数据文件不存在"}
    # 读取所有行
    rows = list(reader)
    return {"count": len(rows), "data": rows[:10]}  # 只返回前 10 行

# 路由：写入 CSV
@app.post("/data")
def write_data(name: str, age: int, writer=Depends(get_csv_writer)):
    # 写入一行
    writer.writerow([name, age])
    return {"msg": f"已写入: {name}, {age}"}
\`\`\`

这个例子展示了 yield 依赖如何优雅地管理 CSV 文件：读写都不用担心忘记关闭。

## 九、yield + try/finally：异常处理

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

## 十、yield 依赖的执行顺序：多个 yield 依赖

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

## 十一、退出代码的执行时机

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

## 十二、嵌套 yield 依赖的执行顺序

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

## 十三、实战：数据库事务管理

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
    __tablename__ = "accounts"                # 表名
    id = Column(Integer, primary_key=True)    # 主键 ID
    name = Column(String)                     # 账户名
    balance = Column(Float)                   # 余额（浮点数）

# 创建表
Base.metadata.create_all(engine)

# 初始化数据
def init_data():
    # 创建 session 操作数据库
    db = SessionLocal()
    # 如果表里没数据，插入两个测试账户
    if db.query(Account).count() == 0:
        db.add(Account(id=1, name="alice", balance=1000.0))
        db.add(Account(id=2, name="bob", balance=500.0))
        db.commit()  # 提交事务，真正写入
    db.close()  # 关闭 session

# 启动时调用，初始化测试数据
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
    from_id: int,      # 转出账户 ID（从 query string 取）
    to_id: int,        # 转入账户 ID
    amount: float,     # 转账金额
    db: Session = Depends(get_transactional_db),  # 事务型 session
):
    # 查转出账户
    from_acc = db.query(Account).filter(Account.id == from_id).first()
    if not from_acc:
        raise HTTPException(404, "转出账户不存在")
    # 查转入账户
    to_acc = db.query(Account).filter(Account.id == to_id).first()
    if not to_acc:
        raise HTTPException(404, "转入账户不存在")
    # 检查余额是否充足
    if from_acc.balance < amount:
        raise HTTPException(400, "余额不足")
    # 扣款（修改 ORM 对象，还未提交到数据库）
    from_acc.balance -= amount
    # 加款
    to_acc.balance += amount
    # 这里不需要 db.commit()，依赖会在路由正常返回后自动提交
    # 如果上面任何一步抛异常，依赖会自动回滚
    return {
        "msg": "转账成功",
        "from": {"id": from_id, "balance": from_acc.balance},
        "to": {"id": to_id, "balance": to_acc.balance},
    }

# 故意失败的转账接口（测试回滚）
@app.post("/transfer/fail")
def transfer_fail(db: Session = Depends(get_transactional_db)):
    # 修改数据（扣款 100）
    acc = db.query(Account).filter(Account.id == 1).first()
    acc.balance -= 100  # 扣款
    # 故意抛异常，触发事务回滚
    # 回滚后 acc.balance 会恢复原值，扣款不会生效
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

## 十四、新增 Demo：Redis 连接的 yield 依赖

缓存是另一个典型场景。Redis 连接也需要正确管理。这里演示异步 Redis 的 yield 依赖。

\`\`\`python
# 导入 FastAPI、Depends
from fastapi import FastAPI, Depends
# 导入 redis 异步客户端（需 pip install redis）
import redis.asyncio as redis
# 导入 contextlib
from contextlib import asynccontextmanager

# ========== lifespan：管理 Redis 连接池 ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时：创建 Redis 连接池
    print("[lifespan] 创建 Redis 连接池")
    # ConnectionPool 管理 Redis 连接
    # max_connections=10 最多 10 个连接
    redis_pool = redis.ConnectionPool(
        host="localhost",
        port=6379,
        db=0,
        max_connections=10,
        decode_responses=True,  # 自动解码为字符串
    )
    # 存到 app.state
    app.state.redis_pool = redis_pool
    print("[lifespan] Redis 连接池已创建")

    yield  # 应用运行期间

    # 关闭时：释放连接池
    print("[lifespan] 关闭 Redis 连接池")
    # disconnect 释放所有连接
    await redis_pool.disconnect()
    print("[lifespan] Redis 连接池已关闭")

app = FastAPI(lifespan=lifespan)

# ========== yield 依赖：从池子借 Redis 连接 ==========
async def get_redis():
    """获取 Redis 连接，请求结束自动归还"""
    # 从连接池获取连接
    r = redis.Redis(connection_pool=app.state.redis_pool)
    print("[redis] 借出连接")
    try:
        # yield 给路由
        yield r
    finally:
        # 归还连接（不是真断开，是放回池子）
        # aclose 把连接归还到池子
        await r.aclose()
        print("[redis] 归还连接")

# ========== 路由 ==========
@app.get("/cache/{key}")
async def get_cache(key: str, r = Depends(get_redis)):
    # 从 Redis 读缓存
    value = await r.get(key)
    if value is None:
        return {"msg": "缓存不存在", "key": key}
    return {"key": key, "value": value}

@app.post("/cache/{key}")
async def set_cache(key: str, value: str, r = Depends(get_redis)):
    # 写入缓存，设置 60 秒过期
    # ex=60 表示 expire 60 秒
    await r.set(key, value, ex=60)
    return {"msg": "缓存已设置", "key": key, "value": value, "ttl": 60}

@app.delete("/cache/{key}")
async def delete_cache(key: str, r = Depends(get_redis)):
    # 删除缓存
    deleted = await r.delete(key)
    if deleted:
        return {"msg": "缓存已删除", "key": key}
    return {"msg": "缓存不存在", "key": key}
\`\`\`

这个例子展示了完整的 Redis 连接池管理：lifespan 创建池子，yield 依赖借还连接，路由函数只管业务。

## 十五、新增 Demo：分布式锁的 yield 依赖

分布式系统中，防止并发操作同一资源常用分布式锁。yield 依赖完美匹配"获取锁 → 业务 → 释放锁"的模式。

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 导入 redis
import redis.asyncio as redis
# 导入 uuid
import uuid

app = FastAPI()

# 模拟 Redis 客户端（实际项目用 lifespan 创建）
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

# yield 依赖：分布式锁
async def acquire_lock(
    resource: str,                # 锁定的资源名
    timeout: int = 10,            # 锁超时（秒，防止死锁）
):
    """获取分布式锁，请求结束自动释放"""
    # 生成唯一锁标识
    lock_id = str(uuid.uuid4())
    # 锁的 Redis key
    lock_key = f"lock:{resource}"

    # 尝试获取锁
    # setnx 语义：只有 key 不存在时才设置（原子操作）
    # nx=True 表示 only if not exists
    # ex=timeout 设置过期时间，防止死锁
    acquired = await redis_client.set(lock_key, lock_id, nx=True, ex=timeout)
    if not acquired:
        # 获取失败，说明资源被占用
        print(f"[lock] 获取锁失败: {resource}")
        raise HTTPException(409, f"资源 {resource} 正在被处理，请稍后再试")

    print(f"[lock] 获取锁成功: {resource}, lock_id={lock_id}")
    try:
        # yield 锁标识给路由
        yield lock_id
    finally:
        # 释放锁：用 Lua 脚本保证原子性
        # 必须先检查 lock_id 是否匹配，避免释放别人的锁
        lua_script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        # eval 执行 Lua 脚本
        released = await redis_client.eval(lua_script, 1, lock_key, lock_id)
        if released:
            print(f"[lock] 释放锁成功: {resource}")
        else:
            # 锁已过期被别人获取，这种情况要记录日志
            print(f"[lock] 锁已过期: {resource}")

# 路由：转账（用锁防止并发转账）
@app.post("/transfer")
async def transfer(
    account_id: int,
    amount: float,
    lock_id: str = Depends(lambda: acquire_lock(f"account:{account_id}")),
):
    # 这里 lock_id 证明已获取锁
    # 模拟转账逻辑
    print(f"[transfer] 处理账户 {account_id} 转账 {amount}，锁 {lock_id}")
    # 模拟耗时
    import asyncio
    await asyncio.sleep(2)
    return {"msg": f"账户 {account_id} 转账 {amount} 成功"}

# 路由：更新库存（用锁防止超卖）
@app.post("/inventory/{product_id}")
async def update_inventory(
    product_id: int,
    quantity: int,
    lock_id: str = Depends(lambda: acquire_lock(f"product:{product_id}")),
):
    # 模拟扣减库存
    print(f"[inventory] 商品 {product_id} 扣减 {quantity}，锁 {lock_id}")
    return {"msg": f"商品 {product_id} 库存已更新"}
\`\`\`

这个例子展示了 yield 依赖在分布式锁场景的应用：获取锁在 yield 之前，释放锁在 yield 之后，无论业务成功失败锁都会释放。

## 十六、yield 依赖的限制与注意点

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

## 十七、常见错误与避坑指南

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

### 错误 6：在 yield 依赖里修改响应

\`\`\`python
# ❌ 错误：以为能修改响应
def add_header_dep():
    yield
    # 这里无法访问 response 对象
    # response.headers["X-Custom"] = "value"  # 报错！

# ✅ 正确：用中间件修改响应
@app.middleware("http")
async def add_header_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Custom"] = "value"
    return response
\`\`\`

yield 退出代码无法修改响应，因为响应已经构建好了。要修改响应用中间件。

## 十八、动手实验

### 实验 1：观察 yield 依赖的执行顺序

创建 \`experiment_yield.py\`，运行以下代码：

\`\`\`python
# 实验：观察 yield 依赖执行顺序
from fastapi import FastAPI, Depends
import uvicorn

app = FastAPI()

def dep_a():
    print("  [A] 进入")
    try:
        yield "A"
    finally:
        print("  [A] 退出")

def dep_b():
    print("  [B] 进入")
    try:
        yield "B"
    finally:
        print("  [B] 退出")

@app.get("/test")
def test(a: str = Depends(dep_a), b: str = Depends(dep_b)):
    print("  [route] 执行")
    return {"a": a, "b": b}

@app.get("/fail")
def fail(a: str = Depends(dep_a), b: str = Depends(dep_b)):
    print("  [route] 执行，即将抛异常")
    raise Exception("测试异常")

if __name__ == "__main__":
    # 访问 http://127.0.0.1:8000/test 和 http://127.0.0.1:8000/fail
    # 观察控制台输出顺序
    uvicorn.run(app, host="127.0.0.1", port=8000)
\`\`\`

**预期**：访问 \`/test\` 时输出顺序是 A 进入 → B 进入 → 路由 → B 退出 → A 退出。访问 \`/fail\` 时也是同样顺序，即使抛异常。

### 实验 2：实现一个 Redis 锁依赖

尝试实现一个简化的 Redis 分布式锁依赖，要求：
1. 用 \`SET key value NX EX 10\` 获取锁。
2. 用 yield 把锁标识注入路由。
3. 请求结束后释放锁（用 Lua 脚本保证原子性）。

提示：参考第十五章的代码，去掉一些细节，保留核心逻辑。

### 实验 3：对比 return 和 yield 的资源泄漏

写一个测试脚本，对比两种依赖在 1000 次请求后的资源占用：

\`\`\`python
# 实验模板
import requests
import psutil  # 需 pip install psutil
import os

def measure_memory():
    """测量当前进程内存"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024  # MB

# TODO: 启动两个版本的 server（return 和 yield）
# 分别请求 1000 次，对比内存变化
# 预期：return 版本内存持续增长，yield 版本稳定
\`\`\`

### 实验 4：实现审计日志依赖

实现一个 yield 依赖，要求：
1. 记录每个请求的开始时间。
2. 请求成功时记录"成功 + 耗时"。
3. 请求失败时记录"失败 + 异常信息"。
4. 把日志写入文件（用 yield 依赖管理文件句柄）。

提示：组合两个 yield 依赖，一个管文件，一个管审计逻辑。

## 十九、本章小结

本章我们学习了：

1. **return 依赖的局限**：无法释放资源，导致泄漏。
2. **yield 依赖的原理**：基于上下文管理器，yield 前创建资源，yield 后清理资源。
3. **执行顺序**：洋葱模型，多个 yield 依赖按栈结构进入退出。
4. **异常处理**：yield 后的 try/except 能捕获路由异常，但要重新抛出。
5. **退出时机**：路由返回后、响应发送前，不能修改响应。
6. **典型应用**：数据库连接、连接池、文件资源、CSV 处理、事务管理、Redis 连接、分布式锁。
7. **避坑要点**：必须 try/finally、yield 前异常会跳过路由、异步用 async def、后台任务用 BackgroundTasks、不能修改响应。

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

## 二、生活类比：工厂流水线与餐厅协作

**类比 1：汽车工厂流水线**

造一辆汽车不是一个人能完成的，它有复杂的依赖关系：

\`\`\`
整车组装
├── 底盘（依赖：钢板 + 焊接）
├── 发动机（依赖：缸体 + 活塞 + 曲轴）
├── 车身（依赖：钢板 + 喷漆）
└── 内饰（依赖：座椅 + 仪表盘）
\`\`\`

整车车间不自己造发动机，它"声明"需要发动机，发动机车间负责造。发动机车间又不自己造活塞，它"声明"需要活塞，活塞车间负责造。每个车间只关心自己的事，但通过依赖关系组合成完整的汽车。

FastAPI 的依赖嵌套就是这样：路由函数"声明"需要用户对象，\`get_current_user\` 负责造用户对象，它又"声明"需要 token，\`get_token\` 负责 token。

\`\`\`python
# 路由（整车车间）
@app.get("/me")
def get_me(user = Depends(get_current_user)):
    return user

# get_current_user（发动机车间）
def get_current_user(token = Depends(get_token)):
    return find_user_by_token(token)

# get_token（活塞车间）
def get_token(authorization = Header(...)):
    return parse_token(authorization)
\`\`\`

**类比 2：餐厅点餐链路**

客人点一份"宫保鸡丁"，背后是一个依赖链：
- 服务员接收订单（路由）
- 厨师需要食材（依赖食材库）
- 食材库需要采购单（依赖采购系统）
- 采购系统需要供应商报价（依赖外部接口）

每一层只关心自己的事，但组合起来完成了从点餐到上菜的全流程。

## 三、依赖可以依赖其他依赖

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

## 四、嵌套依赖的执行顺序

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

## 五、依赖图的概念

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

## 六、依赖的组合和复用

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

## 七、多个依赖组合使用

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

## 八、依赖缓存与 use_cache

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

## 九、实战：认证+权限+数据库三层依赖

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
# 用户库：token -> 用户信息
fake_users_db = {
    "alice_token": {"id": 1, "name": "alice", "role": "admin"},
    "bob_token": {"id": 2, "name": "bob", "role": "user"},
}
# 文章库：user_id -> 文章列表
fake_db_data = {1: [{"id": 1, "owner": 1, "title": "alice 的文章"}]}

# ========== 第一层：基础设施依赖 ==========

# 依赖：从 Header 提取 token
def get_token(authorization: Optional[str] = Header(None)):
    # Header(None) 从请求头取 Authorization，没有则 None
    if not authorization:
        raise HTTPException(401, "缺少 Authorization")
    # 校验 Bearer 格式
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization 格式错误")
    # 提取 token（去掉 "Bearer " 前缀，7 个字符）
    token = authorization[7:]
    # 返回 token 给上层依赖
    return token

# 依赖：模拟数据库 session（yield 依赖）
def get_db():
    # 模拟 session（实际是 SQLAlchemy Session）
    db = {"data": fake_db_data}
    print("[db] 创建 session")
    try:
        # yield 把 db 交给路由函数
        yield db
    finally:
        # 路由结束后关闭 session
        print("[db] 关闭 session")

# ========== 第二层：业务依赖 ==========

# 依赖：根据 token 获取用户（依赖 get_token）
# 依赖链：get_current_user -> get_token
def get_current_user(token: str = Depends(get_token)):
    # token 是 get_token 的返回值（被缓存复用）
    # 查用户
    user = fake_users_db.get(token)
    # 不存在
    if not user:
        raise HTTPException(401, "无效 token")
    # 返回用户
    print(f"[user] 认证通过: {user['name']}")
    return user

# 依赖：校验管理员权限（依赖 get_current_user）
# 依赖链：require_admin -> get_current_user -> get_token
def require_admin(user: dict = Depends(get_current_user)):
    # 检查角色
    if user["role"] != "admin":
        # 非 admin 返回 403 Forbidden
        raise HTTPException(403, "需要管理员权限")
    print(f"[admin] 权限校验通过: {user['name']}")
    return user

# 依赖：获取当前用户的文章（依赖 get_current_user + get_db）
# 组合两个依赖：用户 + 数据库
def get_user_articles(
    user: dict = Depends(get_current_user),
    db: dict = Depends(get_db),
):
    # 从数据库查用户文章
    # db["data"] 是 fake_db_data，按 user_id 取文章列表
    articles = db["data"].get(user["id"], [])
    print(f"[articles] 查询 {user['name']} 的文章: {len(articles)} 篇")
    return articles

# ========== 第三层：路由 ==========

# 文章响应模型
class Article(BaseModel):
    id: int            # 文章 ID
    owner: int         # 所有者用户 ID
    title: str         # 文章标题

# 接口1：获取自己的文章（只需登录）
# 依赖链：get_user_articles -> get_current_user -> get_token
@app.get("/articles", response_model=list[Article])
def list_my_articles(articles: list = Depends(get_user_articles)):
    # articles 是 get_user_articles 的返回值
    # 已经过登录校验和数据库查询，直接返回
    return articles

# 接口2：管理员查看所有人文章（需要 admin）
# 依赖链：require_admin -> get_current_user -> get_token
@app.get("/admin/articles", response_model=list[Article])
def list_all_articles(
    admin: dict = Depends(require_admin),  # 校验 admin
    db: dict = Depends(get_db),            # 复用 db（缓存）
):
    # 查所有文章（遍历所有用户的文章）
    all_articles = []
    for uid, arts in db["data"].items():
        all_articles.extend(arts)
    return all_articles

# 接口3：管理员删除文章（需要 admin + db）
@app.delete("/admin/articles/{article_id}")
def delete_article(
    article_id: int,                       # 从 URL 路径取文章 ID
    admin: dict = Depends(require_admin),  # 校验 admin
    db: dict = Depends(get_db),            # 复用 db（缓存）
):
    # 遍历查找并删除
    for uid, arts in db["data"].items():
        # arts[:] 创建副本遍历，避免遍历时修改原列表
        for art in arts[:]:
            if art["id"] == article_id:
                arts.remove(art)  # 从列表删除
                return {"msg": f"已删除文章 {article_id}", "by": admin["name"]}
    # 没找到返回 404
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

## 十、新增 Demo：完整认证链（token 解析 → 用户查询 → 权限检查）

这是真实项目中最常见的依赖链：从 HTTP 请求头解析 token，根据 token 查用户，根据用户做权限检查。这里展示完整的实现。

\`\`\`python
# 导入 FastAPI、Depends、Header、HTTPException
from fastapi import FastAPI, Depends, Header, HTTPException
# 导入 Optional、Annotated
from typing import Optional, Annotated
# 导入 pydantic
from pydantic import BaseModel
# 导入时间（模拟 token 过期）
import time

app = FastAPI()

# ========== 模拟数据层 ==========

# 用户库：user_id -> 用户信息
users_db = {
    1: {"id": 1, "username": "alice", "role": "admin", "active": True},
    2: {"id": 2, "username": "bob", "role": "user", "active": True},
    3: {"id": 3, "username": "charlie", "role": "user", "active": False},  # 已禁用
}

# token 库：token_string -> {user_id, expires_at}
tokens_db = {
    "abc123": {"user_id": 1, "expires_at": time.time() + 3600},  # alice 的 token
    "def456": {"user_id": 2, "expires_at": time.time() + 3600},  # bob 的 token
    "ghi789": {"user_id": 3, "expires_at": time.time() - 100},   # charlie 的过期 token
}

# ========== 第一层：HTTP 解析依赖 ==========

# 依赖1：从 Header 提取 Authorization 字符串
def extract_authorization(
    authorization: Optional[str] = Header(None),
) -> str:
    """从 Authorization 头提取原始字符串"""
    # 没传 Authorization
    if not authorization:
        raise HTTPException(401, "缺少 Authorization 头")
    print(f"[extract_authorization] 收到: {authorization[:20]}...")
    return authorization

# 依赖2：从 Authorization 字符串解析 token（依赖 extract_authorization）
def parse_token(
    authorization: str = Depends(extract_authorization),
) -> str:
    """解析 Bearer token"""
    # 校验 Bearer 格式
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization 格式错误，应为 'Bearer <token>'")
    # 提取 token（去掉 "Bearer " 前缀）
    token = authorization[7:]
    # token 不能为空
    if not token:
        raise HTTPException(401, "token 为空")
    print(f"[parse_token] 解析出 token: {token}")
    return token

# ========== 第二层：业务查询依赖 ==========

# 依赖3：根据 token 查询用户（依赖 parse_token）
def get_current_user(
    token: str = Depends(parse_token),
) -> dict:
    """根据 token 查用户，校验 token 有效性"""
    # 从 token 库查
    token_info = tokens_db.get(token)
    # token 不存在
    if not token_info:
        raise HTTPException(401, "无效 token")
    # 检查 token 是否过期
    if time.time() > token_info["expires_at"]:
        raise HTTPException(401, "token 已过期，请重新登录")
    # 根据 user_id 查用户
    user = users_db.get(token_info["user_id"])
    # 用户不存在（可能已删除）
    if not user:
        raise HTTPException(401, "用户不存在")
    # 检查用户是否激活
    if not user["active"]:
        raise HTTPException(403, "用户已被禁用")
    print(f"[get_current_user] 认证通过: {user['username']}")
    return user

# 依赖4：检查用户角色（依赖 get_current_user）
def require_role(*required_roles: str):
    """工厂函数：生成检查指定角色的依赖"""
    # 返回一个依赖函数
    def checker(user: dict = Depends(get_current_user)) -> dict:
        # 检查角色是否在允许列表里
        if user["role"] not in required_roles:
            raise HTTPException(
                403,
                f"权限不足，需要角色: {required_roles}，当前: {user['role']}",
            )
        print(f"[require_role] 权限校验通过: {user['username']} ({user['role']})")
        return user
    return checker

# 便捷别名：常用角色的依赖
require_admin = require_role("admin")
require_user = require_role("user", "admin")  # user 和 admin 都能访问
require_active = Depends(get_current_user)    # 只需登录

# ========== 第三层：路由 ==========

# 用户信息模型
class UserInfo(BaseModel):
    id: int
    username: str
    role: str

# 接口1：获取当前用户信息（只需登录）
@app.get("/me", response_model=UserInfo)
def get_me(user: dict = Depends(get_current_user)):
    # 走完整认证链：extract_authorization → parse_token → get_current_user
    return user

# 接口2：管理员专用接口
@app.get("/admin/users")
def admin_list_users(admin: dict = Depends(require_admin)):
    # 走认证链 + admin 角色检查
    return {"users": list(users_db.values()), "by": admin["username"]}

# 接口3：普通用户接口（user 和 admin 都能访问）
@app.get("/profile")
def get_profile(user: dict = Depends(require_user)):
    return {"profile": user}

# 接口4：管理员删除用户
@app.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    admin: dict = Depends(require_admin),
):
    # 检查目标用户是否存在
    if user_id not in users_db:
        raise HTTPException(404, "用户不存在")
    # 不能删除自己
    if user_id == admin["id"]:
        raise HTTPException(400, "不能删除自己")
    # 删除用户
    deleted = users_db.pop(user_id)
    return {"msg": f"已删除用户 {deleted['username']}", "by": admin["username"]}
\`\`\`

请求 \`GET /me\` 带 \`Authorization: Bearer abc123\`：

\`\`\`
[extract_authorization] 收到: Bearer abc123...
[parse_token] 解析出 token: abc123
[get_current_user] 认证通过: alice
\`\`\`

请求 \`GET /admin/users\` 带 \`Authorization: Bearer def456\`（bob 是 user 角色）：

\`\`\`
[extract_authorization] 收到: Bearer def456...
[parse_token] 解析出 token: def456
[get_current_user] 认证通过: bob
# 然后报 403：权限不足
\`\`\`

请求 \`GET /me\` 带 \`Authorization: Bearer ghi789\`（charlie 的 token 已过期）：

\`\`\`
[extract_authorization] 收到: Bearer ghi789...
[parse_token] 解析出 token: ghi789
# 然后报 401：token 已过期
\`\`\`

这个例子展示了完整的认证链：HTTP 解析 → token 解析 → 用户查询 → 权限检查。每一层只做一件事，组合起来就是完整的认证授权系统。

## 十一、依赖图可视化

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

## 十二、新增 Demo：电商订单处理的依赖组合

电商场景中，下单接口需要组合多个依赖：用户认证、库存检查、优惠券校验、数据库事务。

\`\`\`python
# 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 导入 pydantic
from pydantic import BaseModel

app = FastAPI()

# ========== 模拟数据 ==========
products_db = {
    "p001": {"id": "p001", "name": "键盘", "price": 200.0, "stock": 10},
    "p002": {"id": "p002", "name": "鼠标", "price": 50.0, "stock": 5},
}
coupons_db = {
    "SAVE10": {"discount": 0.1, "min_amount": 100},   # 满 100 减 10%
    "SAVE20": {"discount": 0.2, "min_amount": 500},   # 满 500 减 20%
}
users_db = {"token_alice": {"id": 1, "name": "alice"}}

# ========== 依赖1：用户认证 ==========
def get_current_user(token: str = Depends(lambda token: token)):
    # 简化的 token 校验
    user = users_db.get(token)
    if not user:
        raise HTTPException(401, "无效 token")
    return user

# ========== 依赖2：商品校验 ==========
def get_product(product_id: str):
    """校验商品是否存在"""
    product = products_db.get(product_id)
    if not product:
        raise HTTPException(404, f"商品 {product_id} 不存在")
    return product

# ========== 依赖3：库存校验（依赖商品） ==========
def check_stock(
    product: dict = Depends(get_product),
    quantity: int = 1,
):
    """校验库存是否充足"""
    if product["stock"] < quantity:
        raise HTTPException(400, f"库存不足，剩余 {product['stock']}，需要 {quantity}")
    print(f"[stock] {product['name']} 库存充足: {product['stock']} >= {quantity}")
    return {"product": product, "quantity": quantity}

# ========== 依赖4：优惠券校验 ==========
def validate_coupon(coupon_code: str = None):
    """校验优惠券（可选）"""
    if not coupon_code:
        return None  # 没用优惠券
    coupon = coupons_db.get(coupon_code)
    if not coupon:
        raise HTTPException(400, "无效的优惠券")
    print(f"[coupon] 优惠券有效: {coupon_code}")
    return coupon

# ========== 依赖5：数据库事务（yield） ==========
def get_db():
    """模拟数据库事务"""
    db = {"orders": []}  # 模拟订单表
    print("[db] 开启事务")
    try:
        yield db
        print("[db] 提交事务")
    except Exception as e:
        print(f"[db] 回滚事务: {e}")
        raise
    finally:
        print("[db] 关闭事务")

# ========== 下单接口：组合所有依赖 ==========
class OrderRequest(BaseModel):
    product_id: str
    quantity: int = 1
    coupon_code: str = None

class OrderResponse(BaseModel):
    order_id: str
    product_name: str
    quantity: int
    total_price: float
    discount: float
    final_price: float

@app.post("/orders", response_model=OrderResponse)
def create_order(
    order: OrderRequest,                                       # 请求体
    token: str,                                                # token
    user: dict = Depends(get_current_user),                    # 用户认证
    stock_info: dict = Depends(check_stock),                   # 库存校验
    coupon: dict = Depends(validate_coupon),                   # 优惠券校验
    db: dict = Depends(get_db),                                # 数据库事务
):
    # 所有依赖都已通过，这里只做业务计算
    product = stock_info["product"]
    quantity = stock_info["quantity"]

    # 计算价格
    total_price = product["price"] * quantity
    discount = 0.0
    # 应用优惠券
    if coupon:
        if total_price >= coupon["min_amount"]:
            discount = total_price * coupon["discount"]
        else:
            raise HTTPException(400, f"优惠券需满 {coupon['min_amount']} 元")

    final_price = total_price - discount

    # 扣减库存
    product["stock"] -= quantity

    # 生成订单
    order_id = f"order_{len(db['orders']) + 1}"
    order_data = {
        "order_id": order_id,
        "product_name": product["name"],
        "quantity": quantity,
        "total_price": total_price,
        "discount": discount,
        "final_price": final_price,
    }
    db["orders"].append(order_data)

    print(f"[order] 订单创建成功: {order_id}, 最终价格: {final_price}")
    return order_data
\`\`\`

请求 \`POST /orders?token=token_alice\`，body：

\`\`\`json
{"product_id": "p001", "quantity": 2, "coupon_code": "SAVE10"}
\`\`\`

控制台输出：

\`\`\`
[stock] 键盘 库存充足: 10 >= 2
[coupon] 优惠券有效: SAVE10
[db] 开启事务
[order] 订单创建成功: order_1, 最终价格: 360.0
[db] 提交事务
[db] 关闭事务
\`\`\`

这个例子展示了复杂业务的依赖组合：每个依赖负责一个关注点，路由函数只做业务编排。如果库存不足或优惠券无效，依赖会抛异常短路，路由函数根本不会执行。

## 十三、依赖的优先级与异常短路

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

## 十四、嵌套依赖的异常处理

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

## 十五、常见错误与避坑指南

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

### 错误 6：依赖函数参数顺序错误

\`\`\`python
# ❌ 错误：Depends 参数放在普通参数前面
def bad_dep(
    user = Depends(get_user),     # Depends 放前面
    name: str = "default",        # 普通参数放后面
):
    return {"user": user, "name": name}

# ✅ 正确：普通参数放前面，Depends 放后面
def good_dep(
    name: str = "default",        # 普通参数
    user = Depends(get_user),     # Depends
):
    return {"user": user, "name": name}
\`\`\`

Python 函数参数顺序：位置参数 → 默认参数 → *args → **kwargs → 关键字参数。Depends 参数有默认值，应该放后面。

## 十六、动手实验

### 实验 1：构建完整的认证授权链

参考第十章的代码，实现一个完整的认证链，要求：
1. 从 Header 解析 \`Authorization: Bearer <token>\`。
2. 校验 token 是否在 \`tokens_db\` 里。
3. 校验 token 是否过期。
4. 根据用户 ID 查用户。
5. 校验用户是否激活（\`active\` 字段）。
6. 校验用户角色（admin/user）。

为每一步写一个独立的依赖函数，让它们层层嵌套。最后写两个接口：一个只需登录，一个需要 admin。

测试用例：
- 有效 token + admin 用户 → 200
- 有效 token + 普通用户访问 admin 接口 → 403
- 过期 token → 401
- 不存在的 token → 401
- 被禁用用户 → 403

### 实验 2：观察依赖缓存的复用

\`\`\`python
# 实验模板
from fastapi import FastAPI, Depends
import uvicorn

app = FastAPI()
call_count = 0

def shared_dep():
    """会被多个依赖引用的底层依赖"""
    global call_count
    call_count += 1
    print(f"  [shared] 第 {call_count} 次调用")
    return f"shared-{call_count}"

def dep_a(s = Depends(shared_dep)):
    print(f"  [A] 使用 s={s}")
    return f"A({s})"

def dep_b(s = Depends(shared_dep)):
    print(f"  [B] 使用 s={s}")
    return f"B({s})"

@app.get("/test")
def test(
    a = Depends(dep_a),
    b = Depends(dep_b),
):
    # TODO: 观察 shared_dep 被调用几次
    # 预期：1 次（缓存复用）
    return {"a": a, "b": b}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
\`\`\`

访问 \`http://127.0.0.1:8000/test\`，观察 \`shared_dep\` 被调用几次。如果改成 \`use_cache=False\`，会被调用几次？

### 实验 3：实现一个依赖图

设计一个电商订单接口的依赖图，至少包含：
- 用户认证
- 商品查询
- 库存校验
- 优惠券校验
- 数据库事务

画出依赖图（用纸笔或工具），然后实现每个依赖，最后组合到路由函数里。

提示：参考第十二章的电商订单 demo。

### 实验 4：测试异常短路

写一个三层依赖链，让中间的依赖抛异常，观察：
1. 后续依赖是否执行？
2. yield 依赖的退出代码是否执行？
3. 路由函数是否执行？

\`\`\`python
# 实验模板
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

def dep_a():
    print("[A] 进入")
    try:
        yield "A"
        print("[A] 正常退出")
    except Exception as e:
        print(f"[A] 捕获: {e}")
        raise

def dep_b(a = Depends(dep_a)):
    print("[B] 进入")
    raise HTTPException(400, "B 失败")  # 在 B 里抛异常
    yield "B"  # 这行不会执行

def dep_c(b = Depends(dep_b)):
    print("[C] 进入")
    yield "C"

@app.get("/test")
def test(c = Depends(dep_c)):
    print("[route] 执行")
    return {"c": c}

# 预期：C 不会执行，路由不会执行，A 的 except 会捕获异常
\`\`\`

## 十七、本章小结

本章我们学习了：

1. **嵌套依赖**：依赖函数本身也可以用 Depends 声明自己的依赖。
2. **执行顺序**：深度优先 + 后序遍历，从底层依赖开始执行。
3. **依赖图**：用 DAG 理解复杂依赖关系，避免循环。
4. **复用与缓存**：底层依赖在请求内只执行一次，结果共享。
5. **组合使用**：一个路由可以组合多个独立依赖，各司其职。
6. **异常短路**：依赖抛 HTTPException 时，下游不执行。
7. **分层异常处理**：yield 嵌套时，异常沿依赖链向上传播。
8. **实战应用**：完整认证链（token 解析 → 用户查询 → 权限检查）、电商订单处理。
9. **避坑要点**：避免循环依赖、注意缓存共享、不修改全局状态、清理顺序、参数顺序。

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

## 二、生活类比：公司组织架构

理解类依赖，可以用公司组织架构作比喻。

**函数依赖 = 个体户**

个体户一个人干所有事：采购、做菜、收银、打扫。每个函数就是一个个体户，它自己做所有事，没有状态管理，没有继承。

\`\`\`python
# 个体户：一个函数搞定所有
def get_user_service(token, db, cache):
    # 自己校验 token
    # 自己查 db
    # 自己管 cache
    # 没有状态管理，每次都重新来
    pass
\`\`\`

**类依赖 = 公司部门**

公司有专门的部门：人事部管员工、财务部管钱、技术部管代码。每个部门有自己的"状态"（员工档案、财务账本）和方法（招人、发薪）。部门之间通过正式流程协作，而不是一个人包揽所有。

\`\`\`python
# 公司部门：类封装状态和方法
class AuthService:
    def __init__(self):
        self.users = {}  # 状态：员工档案

    def get_current_user(self, token):  # 方法：招人
        return self.users.get(token)

    def require_admin(self, user):      # 方法：检查权限
        return user["role"] == "admin"

# 全局单例（整个公司共享一个 AuthService）
auth_service = AuthService()
\`\`\`

类依赖就像把"个体户"升级成"公司"：状态被封装在实例里，方法可以被复用和继承，整个系统更规范。

## 三、类作为依赖：__init__ 参数自动注入

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

## 四、类方法作为依赖

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

## 五、全局依赖：app 级别

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

## 六、全局依赖：router 级别

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

## 七、dependencies 参数：不使用返回值的依赖

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

## 八、新增 Demo：多层级全局依赖组合

实际项目中，全局依赖往往有多个层级：app 级别（日志、CORS）、router 级别（API Key、版本控制）、路由级别（特定校验）。这里展示完整的组合。

\`\`\`python
# 导入 FastAPI、APIRouter、Depends、Header、HTTPException、Request
from fastapi import FastAPI, APIRouter, Depends, Header, HTTPException, Request
# 导入 Optional
from typing import Optional
# 导入时间
import time

# ========== app 级别依赖 ==========

# 依赖1：全局请求日志（所有路由都执行）
def log_request(request: Request):
    """记录每个请求的方法和路径"""
    print(f"[global] {request.method} {request.url.path}")

# 依赖2：全局请求 ID（所有路由都执行）
def generate_request_id(request: Request):
    """生成或读取请求 ID，存到 request.state"""
    # 从 Header 读 X-Request-ID
    req_id = request.headers.get("X-Request-ID")
    if not req_id:
        # 没传则用时间戳生成
        req_id = f"req-{int(time.time() * 1000)}"
    # 存到 request.state，路由函数可通过 request.state.request_id 访问
    request.state.request_id = req_id

# 创建 app，声明 app 级别依赖
app = FastAPI(
    dependencies=[
        Depends(log_request),          # 所有请求都记日志
        Depends(generate_request_id),  # 所有请求都生成 ID
    ],
)

# ========== router 级别依赖 ==========

# 依赖3：API Key 校验（仅 admin router 执行）
def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """校验 X-API-Key 头"""
    if x_api_key != "admin-secret-key":
        raise HTTPException(401, "无效的 API Key")

# 依赖4：版本校验（仅 v1 router 执行）
def check_version(x_api_version: str = Header(...)):
    """校验 API 版本"""
    if x_api_version not in ["1.0", "1.1"]:
        raise HTTPException(400, f"不支持的 API 版本: {x_api_version}")

# admin router：需要 API Key
admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_api_key)],
)

# v1 router：需要版本头
v1_router = APIRouter(
    prefix="/v1",
    tags=["v1"],
    dependencies=[Depends(check_version)],
)

# ========== 路由级别依赖 ==========

# 依赖5：特定路由的限流
def rate_limit():
    """简化的限流检查"""
    print("[rate_limit] 检查限流")
    # 实际项目查 Redis
    return {"limit": 100, "remaining": 99}

# ========== 公开路由 ==========

@app.get("/")
def root():
    return {"msg": "公开接口，无需认证"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ========== admin 路由 ==========

@admin_router.get("/users")
def admin_list_users():
    # 已经过 app 级别依赖（日志、请求 ID）
    # 已经过 router 级别依赖（API Key）
    return {"users": [{"id": 1, "name": "alice"}]}

@admin_router.get(
    "/sensitive",
    dependencies=[Depends(rate_limit)],  # 路由级别依赖：限流
)
def admin_sensitive():
    # 多了限流检查
    return {"msg": "敏感操作"}

# ========== v1 路由 ==========

@v1_router.get("/products")
def v1_list_products():
    # 已经过 app 级别依赖
    # 已经过 router 级别依赖（版本校验）
    return {"products": [], "version": "v1"}

# 注册 router
app.include_router(admin_router)
app.include_router(v1_router)
\`\`\`

请求 \`GET /admin/users\` 带 \`X-API-Key: admin-secret-key\`：

\`\`\`
[global] GET /admin/users  # app 级别日志
\`\`\`

请求 \`GET /v1/products\` 带 \`X-API-Version: 1.0\`：

\`\`\`
[global] GET /v1/products  # app 级别日志
\`\`\`

这个例子展示了多层级依赖的组合：app 级别做通用基础设施，router 级别做模块保护，路由级别做特定校验。

## 九、Annotated 类型注解写法

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

## 十、UseLifespan 与 Depends 的区别

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
    # 创建异步 Session 工厂，每个请求用它创建独立 session
    app.state.SessionLocal = async_sessionmaker(engine)

    # yield 把控制权交给应用
    # yield 之前是启动代码，yield 之后是关闭代码
    yield

    # 关闭时：清理资源
    print("[lifespan] 关闭连接池")
    # engine.dispose() 关闭所有连接，释放资源
    await engine.dispose()

# 创建 app 时传入 lifespan
app = FastAPI(lifespan=lifespan)

# ========== Depends：管理请求级资源 ==========
# get_db 是请求级依赖，每个请求创建独立 session
async def get_db(request: Request):
    # 从 app.state 取 SessionLocal 工厂
    # request.app.state 访问应用级状态
    SessionLocal = request.app.state.SessionLocal
    # 每个请求创建独立 session
    # async with 自动管理 session 生命周期（退出时关闭）
    async with SessionLocal() as db:
        print(f"[get_db] 创建 session")
        # yield db 给路由函数使用
        yield db
        print(f"[get_db] 关闭 session")

# 路由
@app.get("/users")
async def list_users(db=Depends(get_db)):
    # db 是请求级 session（每个请求独立）
    # await db.execute 执行异步 SQL 查询
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

## 十一、新增 Demo：类继承复用依赖逻辑

类依赖的一大优势是继承。可以写一个基类，子类复用并扩展逻辑。

\`\`\`python
# 导入 FastAPI、Depends、Header、HTTPException
from fastapi import FastAPI, Depends, Header, HTTPException
# 导入 Optional
from typing import Optional

app = FastAPI()

# 模拟用户库
users_db = {
    "alice_token": {"id": 1, "name": "alice", "role": "admin"},
    "bob_token": {"id": 2, "name": "bob", "role": "user"},
    "charlie_token": {"id": 3, "name": "charlie", "role": "moderator"},
}

# ========== 基类：基础认证服务 ==========
class BaseAuthService:
    """认证服务基类，提供 token 校验"""

    def __init__(self, users: dict):
        # 保存用户库
        self.users = users

    def get_current_user(
        self,
        authorization: Optional[str] = Header(None),
    ) -> dict:
        """从 Header 取 token，返回用户（基类方法）"""
        if not authorization:
            raise HTTPException(401, "缺少 Authorization")
        # 提取 token
        token = authorization.replace("Bearer ", "")
        # 查用户
        user = self.users.get(token)
        if not user:
            raise HTTPException(401, "无效 token")
        return user

# ========== 子类1：管理员认证 ==========
class AdminAuthService(BaseAuthService):
    """管理员认证服务，继承基类并增加 admin 校验"""

    def require_admin(
        self,
        user: dict = Depends(self.get_current_user),  # 复用基类方法
    ) -> dict:
        """校验 admin 角色"""
        if user["role"] != "admin":
            raise HTTPException(403, "需要管理员权限")
        return user

# ========== 子类2：版主认证 ==========
class ModeratorAuthService(BaseAuthService):
    """版主认证服务，继承基类并增加 moderator 校验"""

    def require_moderator(
        self,
        user: dict = Depends(self.get_current_user),  # 复用基类方法
    ) -> dict:
        """校验 moderator 或 admin 角色"""
        if user["role"] not in ["admin", "moderator"]:
            raise HTTPException(403, "需要版主或管理员权限")
        return user

# 创建服务实例
admin_auth = AdminAuthService(users_db)
moderator_auth = ModeratorAuthService(users_db)

# ========== 路由 ==========

# 普通接口：只需登录（用基类方法）
@app.get("/me")
def get_me(user: dict = Depends(admin_auth.get_current_user)):
    return {"user": user}

# 管理员接口
@app.get("/admin/users")
def admin_users(admin: dict = Depends(admin_auth.require_admin)):
    return {"admin": admin["name"], "users": list(users_db.values())}

# 版主接口
@app.get("/moderator/reports")
def moderator_reports(mod: dict = Depends(moderator_auth.require_moderator)):
    return {"moderator": mod["name"], "reports": []}
\`\`\`

这个例子展示了类继承的威力：基类 \`BaseAuthService\` 提供 token 校验，子类 \`AdminAuthService\` 和 \`ModeratorAuthService\` 复用基类方法并扩展各自的权限校验。代码复用度高，扩展性好。

## 十二、新增 Demo：类作为可配置的限流器

把限流逻辑封装成类，每个接口可以创建独立的限流器实例。

\`\`\`python
# 导入 FastAPI、Depends、Request、HTTPException
from fastapi import FastAPI, Depends, Request, HTTPException
# 导入时间
import time

app = FastAPI()

# 限流器类
class RateLimiter:
    """内存限流器（生产环境用 Redis）"""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        # 配置：最大请求数、时间窗口
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # 存储：{客户端 IP: [请求时间戳列表]}
        self._store: dict[str, list[float]] = {}

    def __call__(self, request: Request):
        """让实例可调用，作为依赖"""
        # 获取客户端 IP
        client_ip = request.client.host if request.client else "unknown"
        # 当前时间
        now = time.time()
        # 窗口起始时间
        window_start = now - self.window_seconds

        # 初始化存储
        if client_ip not in self._store:
            self._store[client_ip] = []
        # 过滤旧记录
        self._store[client_ip] = [
            ts for ts in self._store[client_ip] if ts > window_start
        ]
        # 检查是否超限
        if len(self._store[client_ip]) >= self.max_requests:
            raise HTTPException(
                429,
                f"请求过于频繁，每 {self.window_seconds} 秒最多 {self.max_requests} 次",
            )
        # 记录请求
        self._store[client_ip].append(now)
        # 返回剩余次数
        return {
            "limit": self.max_requests,
            "remaining": self.max_requests - len(self._store[client_ip]),
        }

# 创建不同配置的限流器实例
# 普通接口：每分钟 100 次
general_limiter = RateLimiter(max_requests=100, window_seconds=60)
# 敏感接口：每分钟 5 次
sensitive_limiter = RateLimiter(max_requests=5, window_seconds=60)
# 登录接口：每分钟 3 次（防止暴力破解）
login_limiter = RateLimiter(max_requests=3, window_seconds=60)

# 路由：使用不同限流器
@app.get("/api/data")
def get_data(info: dict = Depends(general_limiter)):
    return {"msg": "普通数据", "remaining": info["remaining"]}

@app.post("/api/sensitive")
def sensitive_op(info: dict = Depends(sensitive_limiter)):
    return {"msg": "敏感操作", "remaining": info["remaining"]}

@app.post("/login")
def login(info: dict = Depends(login_limiter)):
    return {"msg": "登录接口", "remaining": info["remaining"]}
\`\`\`

这个例子展示了类作为可配置依赖的用法：\`RateLimiter\` 类封装限流逻辑，通过 \`__call__\` 让实例可调用。不同接口创建不同配置的实例，灵活控制限流策略。

## 十三、实战：配置管理类 + 认证类 + 日志类组合

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
        # 模拟配置（实际项目从环境变量 .env 读）
        self.app_name = "MyAPI"            # 应用名
        self.debug = True                  # 调试模式
        self.database_url = "sqlite:///test.db"  # 数据库连接
        self.secret_key = "super-secret"   # 签名密钥（生产环境必须改）
        # JWT 过期时间（秒）
        self.jwt_expire = 3600

    def get_secret(self) -> str:
        # 获取密钥（实际项目可加解密逻辑）
        return self.secret_key

# 全局配置单例（也可以用 lifespan 创建）
# 整个应用共享一个 Settings 实例
settings = Settings()

# ========== 2. 日志类 ==========

class LoggerService:
    """日志服务类"""
    def __init__(self, name: str = "app"):
        # 创建 logger
        self.logger = logging.getLogger(name)
        # 设置级别：debug 模式输出 DEBUG 及以上，否则 INFO 及以上
        self.logger.setLevel(logging.DEBUG if settings.debug else logging.INFO)
        # 避免重复添加 handler（防止日志重复输出）
        if not self.logger.handlers:
            # StreamHandler 输出到控制台
            handler = logging.StreamHandler()
            # 定义日志格式：时间 [级别] 名字: 消息
            formatter = logging.Formatter(
                "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def info(self, msg: str):
        # 记录 INFO 级别日志
        self.logger.info(msg)

    def error(self, msg: str):
        # 记录 ERROR 级别日志
        self.logger.error(msg)

    def debug(self, msg: str):
        # 记录 DEBUG 级别日志（仅 debug 模式输出）
        self.logger.debug(msg)

# 全局 logger 单例
logger = LoggerService()

# ========== 3. 认证类 ==========

class AuthService:
    """认证服务类"""
    def __init__(self, secret: str):
        # 保存密钥（用于 JWT 签名等）
        self.secret = secret
        # 模拟用户库（实际项目用数据库）
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

    # 方法作为依赖：从 Header 取 token，返回用户
    # Annotated[Optional[str], Header()] 等价于 Optional[str] = Header(None)
    def get_current_user(
        self,
        authorization: Annotated[Optional[str], Header()] = None,
    ) -> dict:
        # 从 Header 取 token
        if not authorization:
            raise HTTPException(401, "缺少 Authorization")
        # 去掉 "Bearer " 前缀
        token = authorization.replace("Bearer ", "")
        # 校验并返回用户
        return self.verify_token(token)

    # 方法作为依赖：校验 admin（依赖 get_current_user）
    # Annotated[dict, Depends(get_current_user)] 等价于 dict = Depends(get_current_user)
    def require_admin(
        self,
        user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        # 校验 admin 角色
        if user["role"] != "admin":
            raise HTTPException(403, "需要管理员权限")
        return user

# 全局 auth 服务（用配置初始化）
# 用 settings.get_secret() 传入密钥
auth_service = AuthService(secret=settings.get_secret())

# ========== 4. Annotated 类型别名 ==========

# 当前用户依赖类型
# CurrentUser 等价于 dict + Depends(auth_service.get_current_user)
# 用时只需写 user: CurrentUser，不用写完整的 Depends(...)
CurrentUser = Annotated[dict, Depends(auth_service.get_current_user)]
# 管理员依赖类型
# AdminUser 等价于 dict + Depends(auth_service.require_admin)
AdminUser = Annotated[dict, Depends(auth_service.require_admin)]

# ========== 5. 全局依赖：请求日志 ==========

# 全局依赖：对所有路由生效
def log_request(request: Request):
    # request 是 FastAPI 注入的 Request 对象
    # 记录请求方法（GET/POST...）和路径
    logger.info(f"{request.method} {request.url.path}")

# ========== 6. 创建 app ==========

app = FastAPI(
    title=settings.app_name,  # 应用名（显示在文档）
    # 全局依赖：所有请求都记日志
    # dependencies 里的依赖只执行副作用，不注入返回值
    dependencies=[Depends(log_request)],
)

# ========== 7. 路由 ==========

# 公开接口
@app.get("/")
def root():
    logger.info("访问根路径")
    # 返回应用配置信息
    return {"app": settings.app_name, "debug": settings.debug}

# 需要登录的接口
@app.get("/me")
def get_me(user: CurrentUser):
    # CurrentUser 自动注入当前用户（已校验 token）
    logger.info(f"用户 {user['name']} 查看自己的信息")
    return {"user": user}

# 需要管理员权限的接口
@app.get("/admin/users")
def admin_list_users(admin: AdminUser):
    # AdminUser 自动校验并注入管理员（已校验 admin 角色）
    logger.info(f"管理员 {admin['name']} 查看用户列表")
    return {
        "admin": admin["name"],
        # 返回所有用户（实际项目要分页）
        "users": list(auth_service.users.values()),
    }

# 创建用户的接口（管理员）
@app.post("/admin/users")
def admin_create_user(
    admin: AdminUser,       # 校验管理员权限
    name: str,              # 新用户名（从 query string 取）
    role: str = "user",     # 角色，默认普通用户
):
    # 生成新 token（实际项目用 JWT 或随机字符串）
    new_token = f"{name}_token"
    # 创建用户并存入用户库
    auth_service.users[new_token] = {
        "id": len(auth_service.users) + 1,  # ID 自增
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

## 十四、类依赖与函数依赖的选择

类依赖和函数依赖本质相同（FastAPI 内部统一处理），选择哪种风格取决于场景。

| 维度 | 函数依赖（def + Depends） | 类依赖（class + Depends） |
|------|--------------------------|--------------------------|
| **适用场景** | 简单逻辑、一次性校验、无状态 | 多个相关参数、有状态、需复用 |
| **参数表达** | 一个函数返回一个值，参数另写 | 类属性即参数，一个类可携带多个参数 |
| **可读性** | 简单直观 | 参数集中，结构清晰 |
| **复用性** | 通过嵌套组合复用 | 通过继承、组合复用 |
| **测试** | 直接 mock 函数 | 可实例化类传入测试数据 |
| **状态共享** | 需借助模块级变量 | 类实例本身可缓存状态 |

**经验法则**：

- 参数 ≤ 2 且逻辑简单 → 用函数依赖。
- 参数 ≥ 3 或多处复用同一组参数 → 用类依赖。
- 需要继承复用（如 BaseAuth → AdminAuth）→ 用类依赖。
- yield 资源管理（DB 连接、文件）→ 用函数依赖更直观。

## 十五、常见错误与避坑指南

### 错误 1：忘记在路径操作中声明 Depends

\`\`\`python
# ❌ 错误：定义了依赖但没声明
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
def list_users(db):  # ❌ 缺少 Depends，db 会作为查询参数解析，报 422
    return db.query(User).all()

# ✅ 正确：用 Depends 声明
@app.get("/users")
def list_users(db: Session = Depends(get_db)):  # ✅ FastAPI 自动注入
    return db.query(User).all()
\`\`\`

### 错误 2：类依赖实例被错误地共享

\`\`\`python
# ❌ 错误：把实例放在模块级，所有请求共享同一实例（有状态会出 bug）
counter = Counter()  # 模块级单例

@app.get("/count")
def count(c: Counter = Depends(lambda: counter)):  # ❌ 共享实例
    c.count += 1
    return {"count": c.count}

# ✅ 正确：每次请求新建实例
@app.get("/count")
def count(c: Counter = Depends(Counter)):  # ✅ 每请求新实例
    c.count += 1
    return {"count": c.count}
\`\`\`

### 错误 3：在 __init__ 中执行 IO 操作

\`\`\`python
# ❌ 错误：__init__ 里做 DB 查询，每次实例化都阻塞
class UserChecker:
    def __init__(self, token: str = Header(...)):
        self.user = db.query(User).filter_by(token=token).first()  # ❌ 同步阻塞

# ✅ 正确：__init__ 只存参数，逻辑放到方法或独立依赖
class UserChecker:
    def __init__(self, token: str = Header(...)):
        self.token = token  # ✅ 只存参数

    def check(self):  # 方法里再做查询
        return db.query(User).filter_by(token=self.token).first()
\`\`\`

### 错误 4：yield 依赖中吞掉异常

\`\`\`python
# ❌ 错误：yield 后 try 不带 except，异常被吞
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # 如果上面抛异常，这里仍执行，但异常未传播

# ✅ 正确：yield 依赖的异常会自动传播给其他 yield 依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # 异常会传播，可在 finally 清理
\`\`\`

### 错误 5：类方法作为依赖时忘记 self

\`\`\`python
class AuthService:
    def __init__(self, token: str = Header(...)):
        self.token = token

    # ❌ 错误：写成静态方法，无法访问 self.token
    @staticmethod
    def get_user():
        return decode(self.token)  # ❌ NameError: self

    # ✅ 正确：实例方法，FastAPI 调用实例方法时自动绑定 self
    def get_user(self):
        return decode(self.token)
\`\`\`

### 错误 6：全局依赖抛异常后未清理资源

\`\`\`python
# ❌ 错误：全局依赖抛异常，yield 资源未清理
async def get_db():
    db = await create_db()
    yield db
    await db.close()  # 如果路径操作或后续依赖抛异常，这里仍会执行 ✅

# 但如果 yield 之前的代码抛异常，db 不会创建，没问题
# 关键：确保 yield 之后的清理代码用 try/finally 包裹
async def get_db():
    db = await create_db()
    try:
        yield db
    finally:
        await db.close()  # ✅ 双重保险
\`\`\`

## 十六、动手实验

### 实验 1：实现一个可配置的缓存依赖

需求：用类依赖实现缓存，支持配置 TTL（过期时间）和命名空间。

\`\`\`python
import time
from fastapi import FastAPI, Depends
from typing import Annotated

class CacheDep:
    \"\"\"缓存依赖类，支持配置 TTL 和命名空间\"\"\"

    def __init__(self, ttl: int = 60, namespace: str = "default"):
        # 参数会作为查询参数（因为是简单类型且有默认值）
        self.ttl = ttl
        self.namespace = namespace
        self._store = {}  # 简单内存存储

    def get(self, key: str):
        full_key = f"{self.namespace}:{key}"
        item = self._store.get(full_key)
        if item and item["expire"] > time.time():
            return item["value"]
        return None

    def set(self, key: str, value):
        full_key = f"{self.namespace}:{key}"
        self._store[full_key] = {
            "value": value,
            "expire": time.time() + self.ttl,
        }

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: str, cache: CacheDep = Depends(CacheDep)):
    # 先查缓存
    cached = cache.get(item_id)
    if cached:
        return {"source": "cache", "data": cached}
    # 模拟 DB 查询
    data = f"item_data_{item_id}"
    cache.set(item_id, data)
    return {"source": "db", "data": data}
\`\`\`

**实验任务**：
1. 运行后访问 \`/items/1\` 两次，第一次 source=db，第二次 source=cache。
2. 修改 TTL 默认值为 1 秒，验证缓存过期。
3. 尝试用 Annotated 简化依赖声明。

### 实验 2：类继承实现多角色权限

需求：基于 BaseAuth 继承出 AdminAuth 和 ModeratorAuth，验证不同角色访问。

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException

class BaseAuth:
    \"\"\"基础认证类\"\"\"
    required_role: str = "user"

    def __init__(self, authorization: str = Header(...)):
        self.token = authorization.replace("Bearer ", "")

    def get_user(self):
        # 模拟 token 解码
        users = {
            "alice_token": {"name": "alice", "role": "user"},
            "bob_token": {"name": "bob", "role": "admin"},
            "carol_token": {"name": "carol", "role": "moderator"},
        }
        user = users.get(self.token)
        if not user:
            raise HTTPException(401, "无效 token")
        return user

    def check_role(self, user):
        if user["role"] != self.required_role and self.required_role != "user":
            raise HTTPException(403, f"需要 {self.required_role} 角色")
        return user

    def __call__(self):
        # 让实例可调用，作为依赖直接使用
        user = self.get_user()
        return self.check_role(user)

class AdminAuth(BaseAuth):
    required_role = "admin"

class ModeratorAuth(BaseAuth):
    required_role = "moderator"

app = FastAPI()

@app.get("/admin")
def admin_endpoint(user = Depends(AdminAuth())):
    return {"msg": f"欢迎管理员 {user['name']}"}

@app.get("/mod")
def mod_endpoint(user = Depends(ModeratorAuth())):
    return {"msg": f"欢迎版主 {user['name']}"}
\`\`\`

**实验任务**：
1. 用 alice_token 访问 /admin，应返回 403。
2. 用 bob_token 访问 /admin，应成功。
3. 用 carol_token 访问 /mod，应成功。
4. 思考：为什么需要 \`__call__\` 方法？

### 实验 3：组合类依赖构建完整请求上下文

需求：用一个聚合类组合 Config、Logger、Auth，作为统一请求上下文。

\`\`\`python
from fastapi import FastAPI, Depends, Header
from typing import Annotated

class Config:
    def __init__(self):
        self.env = "prod"
        self.debug = False

class Logger:
    def __init__(self, config: Config):
        self.config = config
        self.logs = []

    def info(self, msg):
        self.logs.append(f"[INFO] {msg}")

class Auth:
    def __init__(self, authorization: str = Header(...)):
        self.token = authorization.replace("Bearer ", "")

    def get_user(self):
        return {"name": self.token.split("_")[0]}

class RequestContext:
    \"\"\"聚合所有请求级依赖\"\"\"

    def __init__(
        self,
        config: Config = Depends(Config),
        logger: Logger = Depends(Logger),
        auth: Auth = Depends(Auth),
    ):
        self.config = config
        self.logger = logger
        self.auth = auth
        self.user = auth.get_user()
        logger.info(f"请求来自用户 {self.user['name']}")

app = FastAPI()

Ctx = Annotated[RequestContext, Depends(RequestContext)]

@app.get("/profile")
def profile(ctx: Ctx):
    ctx.logger.info("访问 profile 接口")
    return {
        "user": ctx.user,
        "env": ctx.config.env,
        "logs": ctx.logger.logs,
    }
\`\`\`

**实验任务**：
1. 访问 \`/profile\` 带 \`Authorization: Bearer alice_token\`，观察返回。
2. 尝试给 Config 增加从环境变量读取的逻辑。
3. 思考：RequestContext 如何简化测试？

## 十七、本章小结

类依赖是 FastAPI 依赖注入的进阶用法，核心要点：

1. **类即依赖**：类的 \`__init__\` 参数即依赖参数，FastAPI 自动解析。
2. **方法即子依赖**：实例方法可作为依赖，支持 \`self\` 自动绑定。
3. **继承复用**：通过子类化复用逻辑，适合多角色权限等场景。
4. **可调用实例**：实现 \`__call__\` 让实例本身作为依赖函数。
5. **全局依赖**：\`dependencies=[Depends(...)]\` 用于路由级、应用级公共依赖。
6. **Annotated 别名**：用 \`Annotated[Type, Depends(...)]\` 提升可读性和复用性。
7. **与 lifespan 互补**：lifespan 管理应用级资源，Depends 管理请求级资源。

类依赖让代码更面向对象、更易测试、更易扩展，是构建中大型 FastAPI 应用的关键工具。

## 十八、依赖注入总结（4 章回顾）

本系列 4 章覆盖了 FastAPI 依赖注入的完整知识体系：

### 第 21 章 · 基础依赖（fa-depends）
- Depends 的工作原理：声明即注入，FastAPI 自动解析参数树。
- 生活类比：餐厅点餐，后厨分工，Depends 像自动提供的餐具。
- 核心场景：配置注入、请求 ID 追踪、限流。
- 关键点：依赖可缓存（同一请求内同依赖只执行一次）、支持嵌套。

### 第 22 章 · yield 依赖（fa-yield-dep）
- yield 依赖用于资源管理：yield 前是 setup，yield 后是 teardown。
- 生活类比：图书馆借书还书、酒店房卡进出。
- 核心场景：DB 连接池、文件句柄、Redis 连接、分布式锁。
- 关键点：异常会传播给 yield 依赖、finally 确保清理、与 lifespan 的区别（请求级 vs 应用级）。

### 第 23 章 · 嵌套依赖（fa-nested-dep）
- 嵌套依赖构建复杂依赖图，FastAPI 自动拓扑排序。
- 生活类比：工厂流水线，每道工序依赖上游产物。
- 核心场景：认证链（token → user → permission）、电商订单（用户 → 商品 → 库存 → 订单）。
- 关键点：依赖缓存机制、\`use_cache=False\` 禁用缓存、依赖图可视化。

### 第 24 章 · 类依赖（fa-class-dep）
- 类作为依赖：\`__init__\` 参数即依赖参数，结构化表达。
- 生活类比：定制化的工具箱，每个工具（类）有自己的配置和用法。
- 核心场景：配置管理类、认证类、日志类、限流器类。
- 关键点：类方法作为依赖、继承复用、\`__call__\` 可调用实例、Annotated 别名、全局依赖。

### 依赖注入最佳实践

1. **单一职责**：每个依赖只做一件事，通过组合构建复杂逻辑。
2. **显式声明**：用 Annotated 别名让依赖意图清晰。
3. **资源用 yield**：DB、文件、锁等资源用 yield 依赖确保清理。
4. **类用于复用**：多处复用的逻辑用类依赖，便于继承和测试。
5. **全局依赖慎用**：\`dependencies=[...]\` 影响所有路由，确保真的全局需要。
6. **测试友好**：依赖注入让单元测试简单，直接 mock 或传入测试实例。
7. **避免在依赖中做重 IO**：依赖应轻量，重操作放到路径操作函数或后台任务。

掌握这 4 章，你已经能驾驭 FastAPI 的依赖注入系统，构建出结构清晰、易于维护、便于测试的生产级应用。
`,
  },
];
