// =============================================================
// Batch 6：依赖注入（4 章）
// 21. dep-basics  Depends 依赖基础
// 22. dep-yield   yield 依赖与资源管理
// 23. dep-nested  依赖嵌套与组合
// 24. dep-class   类与全局依赖
// =============================================================

export const chapters = [
  {
    id: "dep-basics",
    group: "依赖注入",
    icon: "💉",
    title: "Depends 依赖基础",
    content: `
## 一、依赖注入是什么

依赖注入(Dependency Injection,DI)是「把函数需要的东西,作为参数传进来,而不是在函数内部自己创建」。

对比两种写法:

\`\`\`python
# ❌ 反模式:函数内部自己创建依赖
def get_user():
    db = Database("localhost")  # 在函数里 new 一个连接
    user = db.find(1)
    return user

# ✅ 依赖注入:依赖作为参数传入
def get_user(db: Database):  # db 由外部传入
    return db.find(1)
\`\`\`

第二种写法的好处:
- **解耦**:\`get_user\` 不关心 db 怎么来的,只关心它有 \`find\` 方法。
- **可测试**:测试时可以传 mock 的 db,不用真连数据库。
- **复用**:多个函数共享同一个 db 实例(连接池)。

## 二、FastAPI 的 Depends() 实现

FastAPI 用 \`Depends()\` 声明依赖。被 Depends 包装的函数会被框架调用,返回值作为参数注入:

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 这是一个「依赖函数」
def get_db():
    return Database("localhost")

# Depends(get_db) 表示:请调用 get_db(),把返回值作为 db 参数传给我
@app.get("/users")
def list_users(db = Depends(get_db)):
    return db.find_all()
\`\`\`

执行流程:
1. 请求进 \`/users\`。
2. FastAPI 看到参数 \`db = Depends(get_db)\`。
3. 调用 \`get_db()\`,得到 Database 实例。
4. 把实例作为 \`db\` 传给 \`list_users\`。
5. \`list_users\` 执行,返回响应。

\`db\` 参数没有类型注解也行,但加上更好(\`db: Database = Depends(get_db)\`),IDE 能提示方法。

## 三、为什么用 DI

| 维度 | 不用 DI | 用 DI |
|---|---|---|
| 耦合 | 函数内 new,强耦合 | 依赖传入,松耦合 |
| 测试 | 难 mock(要 patch) | 直接传 mock |
| 复用 | 每个函数自己建依赖 | 共享依赖函数 |
| 配置 | 配置散落各处 | 集中在依赖函数 |
| 文档 | - | 依赖链清晰可见 |

DI 不是 FastAPI 独有,Java Spring、Python的 injector 都有。FastAPI 的特色是「函数即依赖」,轻量、无类负担。

## 四、简单依赖:函数返回值注入

最简单的依赖:函数返回啥,参数就收到啥。

\`\`\`python
def common_params():
    return {"version": "1.0", "debug": True}

@app.get("/items")
def list_items(common: dict = Depends(common_params)):
    return {"common": common, "items": []}
\`\`\`

\`common\` 收到的是 \`{"version":"1.0","debug":True}\`。

## 五、依赖带参数

依赖函数本身也可以有参数(从请求里取):

\`\`\`python
from fastapi import Query

# 依赖函数的参数会被 FastAPI 当作查询参数解析
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items")
def list_items(page = Depends(pagination)):
    # page 是 {"skip":.., "limit":..}
    return {"skip": page["skip"], "limit": page["limit"]}
\`\`\`

请求 \`/items?skip=20&limit=5\`,依赖函数收到 skip=20, limit=5,返回 \`{"skip":20,"limit":5}\`,注入到 \`page\`。

## 六、通用依赖示例:分页参数

分页是几乎所有列表接口都要的,提取成依赖复用:

\`\`\`python
from fastapi import Query, Depends
from pydantic import BaseModel

# 用 Pydantic 模型作为返回类型,更规范
class Pagination(BaseModel):
    skip: int
    limit: int

def get_pagination(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100)):
    return Pagination(skip=skip, limit=limit)

# 多个接口共用同一个分页依赖
@app.get("/items")
def list_items(p: Pagination = Depends(get_pagination)):
    return {"skip": p.skip, "limit": p.limit}

@app.get("/users")
def list_users(p: Pagination = Depends(get_pagination)):
    return {"skip": p.skip, "limit": p.limit}
\`\`\`

\`Query(0, ge=0)\` 表示默认 0,且必须 >= 0。两个接口复用同一套分页校验逻辑。

## 七、依赖的缓存(scope:同一请求内复用)

**关键特性**:同一个请求内,同一个依赖函数只会执行一次,结果被缓存。

\`\`\`python
call_count = 0

def get_db():
    global call_count
    call_count += 1
    print(f"get_db 被调用,第 {call_count} 次")
    return Database()

@app.get("/a", dependencies=[Depends(get_db)])
def a(db = Depends(get_db)):
    # 即使这里和 dependencies 都用了 get_db,实际只调用一次
    return {"call_count": call_count}
\`\`\`

请求 \`/a\`,即使 \`get_db\` 在 \`dependencies\` 和参数里都出现,**总共只调用一次**。缓存是请求级的,不同请求不共享。

如果想要每次都重新执行,用 \`use_cache=False\`:
\`\`\`python
db = Depends(get_db, use_cache=False)
\`\`\`

## 八、和 Flask 的 g 对比

Flask 用 \`g\` 对象在请求内共享数据:

\`\`\`python
# Flask 写法
from flask import g

@app.before_request
def before():
    g.db = Database()

@app.route("/users")
def users():
    db = g.db  # 从 g 取
    return ...
\`\`\`

对比:

| 维度 | Flask \`g\` | FastAPI \`Depends\` |
|---|---|---|
| 取数据方式 | \`g.db\` 全局访问 | 参数注入 |
| 类型提示 | 无 | 有(参数注解) |
| 依赖关系显式 | 隐式(g 里有什么不知道) | 显式(函数签名可见) |
| 测试 | 要 patch g | 直接传参 |
| IDE 提示 | 无 | 有 |

FastAPI 的方式更「函数式」,依赖关系在函数签名上显式可见,这是它相对 Flask 的设计优势。

## 九、dependencies 参数:只执行不取值

有时候依赖只是用来「执行一些副作用」(校验、日志),不需要返回值。用 \`dependencies\` 参数:

\`\`\`python
def verify_token(token: str = Query(...)):
    if token != "secret":
        raise HTTPException(status_code=403)

# dependencies 里的依赖会被执行,但不作为参数
@app.get("/secure", dependencies=[Depends(verify_token)])
def secure():
    return {"msg": "需要 token 才能访问"}
\`\`\`

\`verify_token\` 校验失败会抛异常,成功则继续。结果不需要取,所以放 \`dependencies\` 而不是参数。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 在函数内 new 依赖 | 强耦合难测试 | 用 Depends 注入 |
| 依赖函数无类型注解 | 失去文档和提示 | 加返回类型注解 |
| 以为依赖每次都执行 | 实际请求内缓存 | 想不缓存用 use_cache=False |
| 依赖函数抛异常不处理 | 直接 500 | 抛 HTTPException 或加处理器 |
| 依赖参数和路由参数重名 | 冲突 | 用 alias 或改名 |
| 把 Depends 当装饰器用 | Depends() 是参数声明 | 是 \`param = Depends(fn)\` |
| 忘了 dependencies 和参数区别 | 前者只执行后者取值 | 按是否需要返回值选 |

## 十一、设计思想

Depends 体现「显式依赖」原则:函数需要什么,在签名上写出来,而不是偷偷从全局拿。这让代码可读、可测、可演化。FastAPI 把这个理念做到极致 —— 任何函数都能当依赖,无需继承、无需装饰器,极简而强大。
`,
  },
  {
    id: "dep-yield",
    group: "依赖注入",
    icon: "🔄",
    title: "yield 依赖与资源管理",
    content: `
## 一、资源管理的痛点

数据库连接、文件句柄、网络连接这类资源,使用模式固定:

1. **打开**(setup)—— 获取连接
2. **使用** —— 业务代码操作
3. **关闭**(teardown)—— 释放资源

如果忘了关闭,资源泄漏;如果在函数里手动 close,异常时可能漏关。Python 的 \`with\` 语句(上下文管理器)就是为了解决这个,但函数自己 with 还是有点啰嗦。

FastAPI 的 **yield 依赖** 把这个模式集成到 DI 里,自动处理 setup 和 teardown。

## 二、yield 依赖:类似上下文管理器

把 \`return\` 换成 \`yield\`:

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

def get_db():
    db = Database()      # yield 之前:setup(打开连接)
    try:
        yield db          # yield 出去的值就是注入的依赖
    finally:
        db.close()        # yield 之后:teardown(关闭连接)

@app.get("/items")
def list_items(db = Depends(get_db)):
    # 这里的 db 就是上面 yield 出去的那个
    return db.find_all()
\`\`\`

执行顺序:
1. 调用 \`get_db()\`,执行到 \`yield db\`,暂停。
2. 把 db 注入到 \`list_items\`,执行路由函数。
3. 路由函数返回(或抛异常)。
4. 恢复 \`get_db\`,执行 \`finally\` 块,\`db.close()\`。

**关键**:\`yield\` 之后的代码**一定会执行**,无论路由函数成功还是抛异常。这是资源安全的保证。

## 三、数据库 Session 的标准用法

这是 yield 依赖最经典的应用 —— SQLAlchemy Session:

\`\`\`python
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends

app = FastAPI()

# 数据库会话工厂(全局)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
engine = create_engine("sqlite:///./app.db")
SessionLocal = sessionmaker(bind=engine)

def get_db():
    # 1. 创建 Session
    db = SessionLocal()
    try:
        # 2. yield 出去给路由用
        yield db
    finally:
        # 3. 无论成功失败都关闭
        db.close()

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    # 用 db 查询
    return db.query(User).all()
\`\`\`

这种写法的好处:
- 每个 HTTP 请求一个独立的 Session。
- 请求结束自动关闭,不会泄漏。
- 路由函数不需要操心连接管理,只管用 db。

## 四、yield 依赖的异常处理

路由函数抛异常时,异常会传到 yield 之后。可以 try/except 捕获:

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
        # 路由正常完成,提交事务
        db.commit()
    except Exception as e:
        # 路由抛异常,回滚事务
        db.rollback()
        # 注意:re-raise 让异常继续传播
        raise
    finally:
        db.close()
\`\`\`

这里利用了「异常会传到 yield 之后」的特性:
- 正常完成 → \`yield\` 后的 \`db.commit()\` 执行。
- 抛异常 → 跳到 \`except\`,回滚,然后 \`raise\` 重新抛出(让 FastAPI 的异常处理器接管)。
- \`finally\` 总是关闭连接。

这是「事务」的标准模式:成功提交,失败回滚。

## 五、为什么用 yield 不用 finally

有人会问:为什么要在依赖里 yield,而不是路由函数自己 try/finally?

对比:

\`\`\`python
# ❌ 每个路由都要写 try/finally,重复
@app.get("/users")
def list_users():
    db = SessionLocal()
    try:
        return db.query(User).all()
    finally:
        db.close()

# ✅ yield 依赖,路由只关心业务
@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
\`\`\`

yield 依赖把资源管理**集中到一个地方**,所有用这个依赖的路由都自动获得「正确开闭」的保证。这就是关注点分离。

## 六、文件和连接池管理

yield 依赖适用于任何「打开-使用-关闭」模式:

\`\`\`python
# 文件句柄
def get_file():
    f = open("data.txt")
    try:
        yield f
    finally:
        f.close()

# Redis 连接
def get_redis():
    r = redis.Redis()
    try:
        yield r
    finally:
        r.close()

# HTTP 客户端
def get_http_client():
    client = httpx.AsyncClient()
    try:
        yield client
    finally:
        await client.aclose()
\`\`\`

注意 async 版本要写 \`async def\` 且 teardown 用 \`await\`。

## 七、async yield 依赖

异步资源管理同样适用:

\`\`\`python
async def get_db():
    # 异步引擎
    async with AsyncSessionLocal() as db:
        yield db
    # async with 自动处理 close,不需要 finally

@app.get("/users")
async def list_users(db = Depends(get_db)):
    # 异步查询
    result = await db.execute(select(User))
    return result.scalars().all()
\`\`\`

\`async with\` + \`yield\` 组合很优雅,资源管理交给 \`__aexit__\`。

## 八、yield 依赖的执行时机细节

理解 yield 依赖在请求生命周期里的位置:

1. 中间件 → 执行
2. 依赖(setup 部分,yield 之前)→ 执行,如打开 db
3. 路由函数 → 执行(用 db)
4. **响应序列化** → response_model 过滤等
5. 依赖(teardown 部分,yield 之后)→ 执行,如关闭 db
6. 中间件 → 执行

**注意**:teardown 在响应**之后**执行。这意味着如果你在 teardown 里改 response,来不及(响应已经发了)。但关连接这种不需要碰响应的,放这里正好。

## 九、完整示例:数据库 Session 依赖

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel

# 1. 数据库配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# 2. 模型
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)

# 3. 创建表
Base.metadata.create_all(engine)

# 4. yield 依赖:标准 Session 模式
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

class UserOut(BaseModel):
    id: int
    name: str

# 5. 路由用 Depends(get_db)
@app.get("/users/{uid}", response_model=UserOut)
def get_user(uid: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@app.post("/users", response_model=UserOut, status_code=201)
def create_user(name: str, db: Session = Depends(get_db)):
    user = User(name=name)
    db.add(user)
    db.commit()
    db.refresh(user)  # 刷新拿到自增 id
    return user
\`\`\`

每个请求自动获得独立 db、自动关闭,代码干净。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| yield 后忘写关闭代码 | 资源泄漏 | 用 try/finally 包裹 |
| except 不 re-raise | 异常被吞 | 必须 raise 让其传播 |
| teardown 改 response | 响应已发出 | teardown 只做清理 |
| 同步函数用 await | 报错 | async 依赖用 async def |
| 一个 yield 依赖多次 yield | 语法错误 | 只能 yield 一次 |
| 忘了 close 而是依赖 GC | 不及时 | 显式 close |
| async with 后还 yield | 没问题但要理解作用域 | async with 的块结束就 close |

## 十一、设计思想

yield 依赖是 FastAPI 的「资源管理哲学」:把 setup/teardown 封装在依赖里,业务代码只关心使用。这本质上是把 Python 的 \`with\`(上下文管理器)思想融入 DI 系统。优雅之处在于,无论业务代码成功失败,资源都能正确释放 —— 这是写出健壮服务的基石。
`,
  },
  {
    id: "dep-nested",
    group: "依赖注入",
    icon: "🪆",
    title: "依赖嵌套与组合",
    content: `
## 一、依赖可以依赖其它依赖

FastAPI 的依赖可以「套娃」:依赖 A 自己也用 Depends(B)。这构成了**依赖树**。

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

def get_config():
    return {"db_url": "sqlite:///app.db"}

def get_db(config = Depends(get_config)):  # get_db 依赖 get_config
    return Database(config["db_url"])

def get_user(db = Depends(get_db)):        # get_user 依赖 get_db
    return db.find_user(1)

@app.get("/me")
def me(user = Depends(get_user)):          # 路由依赖 get_user
    return user
\`\`\`

执行链:
1. \`get_config()\` → config
2. \`get_db(config)\` → db
3. \`get_user(db)\` → user
4. \`me(user)\` → 响应

整个依赖树自动解析,FastAPI 按依赖顺序执行。

## 二、Depends() 里再 Depends()

依赖函数自己的参数也能用 \`Depends\`:

\`\`\`python
def verify_token(token: str):
    if token != "secret":
        raise HTTPException(403)
    return token

def get_current_user(token: str = Depends(verify_token)):
    # token 来自 verify_token 的返回值
    return {"id": 1, "name": "alice", "token": token}

@app.get("/me")
def me(user = Depends(get_current_user)):
    return user
\`\`\`

\`get_current_user\` 需要 token,而 token 的获取和校验交给 \`verify_token\`。这就是依赖组合。

## 三、依赖树构建与解析

FastAPI 在启动时构建依赖树,运行时按拓扑序执行。特点:

- **按需执行**:只用到的依赖才执行。
- **缓存复用**:同一请求内,同一个依赖函数只执行一次(默认 use_cache=True)。
- **顺序保证**:被依赖的先执行。

## 四、依赖缓存:同依赖只执行一次

\`\`\`python
def get_token():
    print("解析 token")
    return "secret-token"

def verify(token = Depends(get_token)):
    print("校验")
    return token

def get_user(token = Depends(get_token)):  # 也依赖 get_token
    print("取用户")
    return {"user": "alice"}

@app.get("/me")
def me(v = Depends(verify), u = Depends(get_user)):
    # verify 和 get_user 都依赖 get_token
    # 但 get_token 只执行一次,结果被缓存
    return {"v": v, "u": u}
\`\`\`

请求 \`/me\`:
- \`get_token\` 执行 1 次(打印「解析 token」一次)。
- \`verify\` 执行 1 次。
- \`get_user\` 执行 1 次。
- \`get_token\` 的结果被 verify 和 get_user 复用。

这就是「同一请求内同依赖只执行一次」的体现。这对数据库连接、当前用户这类「请求级单例」很重要。

## 五、适用场景:认证依赖链

经典的认证依赖链:\`token → user → permission\`。

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Header
from typing import Annotated

app = FastAPI()

# 第一层:从 Header 取 token 并校验
def get_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "无效的认证头")
    token = authorization.removeprefix("Bearer ")
    if token != "valid-token":
        raise HTTPException(401, "token 无效")
    return token

# 第二层:用 token 取用户
def get_current_user(token: str = Depends(get_token)):
    # 这里实际会查数据库验证 token
    users = {"valid-token": {"id": 1, "name": "alice", "role": "admin"}}
    user = users.get(token)
    if not user:
        raise HTTPException(401, "用户不存在")
    return user

# 第三层:校验权限
def require_admin(user = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "需要管理员权限")
    return user

# 路由:需要登录
@app.get("/me")
def me(user = Depends(get_current_user)):
    return user

# 路由:需要管理员
@app.delete("/users/{uid}")
def delete_user(uid: int, admin = Depends(require_admin)):
    # admin 是 require_admin 的返回值(即 admin 用户)
    return {"deleted": uid, "by": admin["name"]}
\`\`\`

依赖链清晰表达了「认证 → 取用户 → 验权」的逻辑,而且每层都可复用。

## 六、类作为依赖(__init__ 参数自动注入)

类也能当依赖,实例化参数自动从请求取:

\`\`\`python
from fastapi import Query

class Pagination:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

@app.get("/items")
def list_items(p: Pagination = Depends(Pagination)):
    # p 是 Pagination 实例
    return {"skip": p.skip, "limit": p.limit}
\`\`\`

\`Depends(Pagination)\` 会实例化 Pagination,\`__init__\` 的参数(skip/limit)从查询参数取。和函数依赖等价,但能带状态(实例属性)。

## 七、依赖覆盖(测试时 override)

FastAPI 支持在测试时**替换依赖**,这是 DI 的杀手锏 —— 测试时不用改业务代码就能 mock。

\`\`\`python
from fastapi.testclient import TestClient

# 真实依赖:连数据库
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

@app.get("/users")
def list_users(db = Depends(get_db)):
    return db.query(User).all()

# 测试时:override 成假的
def override_get_db():
    # 返回内存数据库或 mock
    class FakeDB:
        def query(self, _):
            class Q:
                def all(self): return [{"id": 1, "name": "mock"}]
            return Q()
    yield FakeDB()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)
response = client.get("/users")
# 走的是 FakeDB,不碰真数据库
assert response.json() == [{"id": 1, "name": "mock"}]
\`\`\`

\`app.dependency_overrides\` 是字典,key 是原依赖函数,value 是替换函数。测试完用 \`app.dependency_overrides.clear()\` 清除。

这是 FastAPI 测试最强大的特性 —— 任何依赖(数据库、外部服务、当前用户)都能被替换,业务代码零修改。

## 八、完整示例:认证依赖链(token→user→permission)

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Annotated

app = FastAPI()

# 模拟数据库
USERS = {
    "token-alice": {"id": 1, "name": "alice", "role": "admin"},
    "token-bob": {"id": 2, "name": "bob", "role": "user"},
}

# 1. 解析并校验 token
def get_token(authorization: Annotated[str, Header()]):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "认证头格式错误")
    token = authorization[7:]  # 去掉 "Bearer "
    return token

# 2. 取当前用户(依赖 get_token)
def get_current_user(token: Annotated[str, Depends(get_token)]):
    user = USERS.get(token)
    if not user:
        raise HTTPException(401, "无效 token")
    return user

# 3. 校验权限(依赖 get_current_user)
def require_role(*roles):
    def checker(user = Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, f"需要 {roles} 权限")
        return user
    return checker

class UserOut(BaseModel):
    id: int
    name: str
    role: str

@app.get("/me", response_model=UserOut)
def me(user = Depends(get_current_user)):
    return user

@app.delete("/users/{uid}")
def delete_user(uid: int, admin = Depends(require_role("admin"))):
    return {"deleted": uid, "by": admin["name"]}

@app.get("/reports")
def reports(user = Depends(require_role("admin", "analyst"))):
    return {"report": "data", "viewer": user["name"]}
\`\`\`

\`require_role\` 是一个**依赖工厂**,根据传入的角色返回不同的依赖函数。这种模式很灵活 —— 同一个依赖函数模板,生成多种权限校验器。

## 九、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 循环依赖 | A 依赖 B,B 依赖 A | 重构消除循环 |
| 以为每次都重新执行 | 默认缓存 | 要每次执行用 use_cache=False |
| 测试不 override 直接连真库 | 测试慢且脏 | 用 dependency_overrides |
| 忘了 clear overrides | 影响后续测试 | 测试后 clear |
| 依赖层级过深 | 难追踪 | 控制在 3-4 层内 |
| 类依赖忘了 Depends(ClassName) | 当成普通类型 | 必须 Depends 包装 |
| require_role 类工厂忘 return | 闭包写错 | 确保返回内部函数 |

## 十、设计思想

依赖嵌套是「组合优于继承」的体现。把大问题拆成小依赖,再组合起来,每个依赖单一职责,组合出复杂流程。配合 override 机制,测试时可以替换任意一层,这让「单元测试」和「集成测试」的边界变得灵活。这种设计让 FastAPI 在中大型项目里依然保持可维护性。
`,
  },
  {
    id: "dep-class",
    group: "依赖注入",
    icon: "🏗️",
    title: "类与全局依赖",
    content: `
## 一、类作为依赖

上一章提过类当依赖,这里深入讲。类作为依赖时,实例化参数(即 \`__init__\` 的参数)自动从请求取,和函数依赖等价。

\`\`\`python
from fastapi import FastAPI, Depends, Query

app = FastAPI()

class Pagination:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

    def offset(self):
        return self.skip

@app.get("/items")
def list_items(p: Pagination = Depends(Pagination)):
    # p 是 Pagination 实例
    return {"skip": p.skip, "limit": p.limit, "offset": p.offset()}
\`\`\`

\`Depends(Pagination)\` 会:
1. 调用 \`Pagination(skip=..., limit=...)\`,参数从查询字符串取。
2. 把实例注入到 \`p\`。

## 二、__init__ 参数是查询参数

类依赖的 \`__init__\` 参数,被 FastAPI 当作查询参数(除非用 Path/Body 等声明):

\`\`\`python
from fastapi import Path, Body

class ItemQuery:
    def __init__(
        self,
        q: str | None = None,        # 查询参数
        category: str = "all",       # 查询参数
    ):
        self.q = q
        self.category = category

@app.get("/items")
def list_items(query = Depends(ItemQuery)):
    return {"q": query.q, "category": query.category}
\`\`\`

请求 \`/items?q=book&category=tech\`,实例化 \`ItemQuery(q="book", category="tech")\`。

## 三、类方法做依赖

类的方法也能当依赖(但要注意 self):

\`\`\`python
class UserService:
    def __init__(self):
        self.db = []

    def get_current_user(self, token: str = Header(...)):
        # 这是一个依赖方法
        if token != "valid":
            raise HTTPException(401)
        return {"id": 1, "name": "alice"}

# 需要先实例化
user_service = UserService()

@app.get("/me")
def me(user = Depends(user_service.get_current_user)):
    return user
\`\`\`

\`Depends(user_service.get_current_user)\` —— 注意传的是**绑定方法**(已绑定 self),FastAPI 调用它时不会传 self。

## 四、依赖的依赖(类 A Depends 类 B)

类依赖也可以依赖其它依赖:

\`\`\`python
class TokenValidator:
    def __init__(self, authorization: str = Header(...)):
        if not authorization.startswith("Bearer "):
            raise HTTPException(401)
        self.token = authorization[7:]

class UserFetcher:
    def __init__(self, tv: TokenValidator = Depends(TokenValidator)):
        # tv 是 TokenValidator 实例
        users = {"valid": {"id": 1, "name": "alice"}}
        self.user = users.get(tv.token)
        if not self.user:
            raise HTTPException(401)

@app.get("/me")
def me(uf: UserFetcher = Depends(UserFetcher)):
    return uf.user
\`\`\`

\`UserFetcher\` 依赖 \`TokenValidator\`,FastAPI 自动解析依赖链。

## 五、全局依赖(app 级别)

有些校验是全局的(如所有接口都要校验 token)。用 \`dependencies\` 参数加在 app 上:

\`\`\`python
from fastapi import FastAPI, Depends, Header, HTTPException

def verify_token(x_token: str = Header(...)):
    if x_token != "secret":
        raise HTTPException(403, "无效 token")

# app 级别全局依赖:所有接口都执行
app = FastAPI(dependencies=[Depends(verify_token)])

@app.get("/public")
def public():
    # 即使这个接口"公开",也会校验 token(因为全局)
    return {"msg": "需要 token"}

@app.get("/items")
def items():
    return {"items": []}
\`\`\`

app 级别依赖:
- 对所有路由生效。
- 只执行,不取返回值(因为无法作为参数传给每个路由)。
- 适合全局校验、日志、限流前置。

## 六、路由级依赖(整个 router)

\`\`\`APIRouter\` 也能加依赖,对该 router 下所有接口生效:

\`\`\`python
from fastapi import FastAPI, APIRouter, Depends, HTTPException

def require_admin():
    # 假设这里校验了权限
    return {"role": "admin"}

admin_router = APIRouter(dependencies=[Depends(require_admin)])

@admin_router.delete("/users/{uid}")
def delete_user(uid: int):
    return {"deleted": uid}

@admin_router.post("/ban/{uid}")
def ban_user(uid: int):
    return {"banned": uid}

app = FastAPI()
app.include_router(admin_router, prefix="/admin")
\`\`\`

\`/admin/users/{uid}\` 和 \`/admin/ban/{uid}\` 都自动加上 \`require_admin\` 依赖。这比在每个接口写 \`Depends\` 简洁,适合「一组接口共享校验」。

## 七、依赖的 scope 控制

依赖可以作用在不同层级:

| 层级 | 写法 | 影响范围 |
|---|---|---|
| 全局(app) | \`FastAPI(dependencies=[...])\` | 所有路由 |
| 路由器 | \`APIRouter(dependencies=[...])\` | 该 router 所有路由 |
| 单接口 | \`@app.get("/", dependencies=[...])\` | 仅该接口 |
| 参数 | \`param = Depends(fn)\` | 仅该接口(且取返回值) |

选择原则:
- **全局校验**(如请求日志、CORS 已由中间件处理)→ app 级。
- **一组接口共享**(如管理后台都要管理员)→ router 级。
- **单接口独有** → 接口级或参数级。

## 八、完整示例:分页参数类

把分页封装成类依赖,带校验和计算方法:

\`\`\`python
from fastapi import FastAPI, Depends, Query
from pydantic import BaseModel
from typing import Generic, TypeVar

app = FastAPI()

T = TypeVar("T")

class Page(BaseModel, Generic[T]):
    """通用分页响应"""
    items: list[T]
    total: int
    skip: int
    limit: int

class PaginationParams:
    """分页参数依赖(类形式)"""
    def __init__(
        self,
        skip: int = Query(0, ge=0, description="跳过条数"),
        limit: int = Query(10, ge=1, le=100, description="每页条数"),
    ):
        self.skip = skip
        self.limit = limit

    def paginate(self, query):
        # 通用分页方法(ORM 查询)
        return query.offset(self.skip).limit(self.limit)

# 模拟数据
ITEMS = [{"id": i, "name": f"item-{i}"} for i in range(50)]

@app.get("/items", response_model=Page[dict])
def list_items(p: PaginationParams = Depends(PaginationParams)):
    # 用分页参数切片
    start = p.skip
    end = start + p.limit
    return {
        "items": ITEMS[start:end],
        "total": len(ITEMS),
        "skip": p.skip,
        "limit": p.limit,
    }

@app.get("/items2")
def list_items2(p: PaginationParams = Depends(PaginationParams)):
    # 另一个接口复用同一分页类
    return {"page": p.skip // p.limit + 1, "limit": p.limit}
\`\`\`

\`PaginationParams\` 作为通用分页依赖,任何列表接口都能复用,还自带参数校验(\`ge\`/\`le\`)。

## 九、依赖和中间件的选择

依赖 vs 中间件都能做「请求前/后处理」,怎么选?

| 维度 | 依赖 | 中间件 |
|---|---|---|
| 作用范围 | 接口/路由/app | 全局(app) |
| 取请求数据 | 直接(参数) | request 对象 |
| 短路(拒绝请求) | 抛 HTTPException | 直接 return Response |
| 后处理 | yield 后 | 洋葱模型 |
| 性能 | 轻量 | 略重(每个请求都过) |
| 局部性 | 好(可路由级) | 全局 |

经验:
- **认证授权** → 依赖(可路由级控制)。
- **全局日志/限流** → 中间件(所有请求都过)。
- **CORS/GZip** → 中间件(内置)。
- **数据库连接** → yield 依赖(请求级)。

## 十、易错点小结

| 易错点 | 说明 | 正确做法 |
|---|---|---|
| 类依赖忘 Depends(ClassName) | 类型当默认值 | 必须 Depends 包装 |
| 全局依赖做认证但不短路 | 校验失败应抛异常 | 抛 HTTPException |
| router 依赖和接口依赖重复 | 执行两次 | 择一 |
| 类依赖 __init__ 参数名和路由参数重名 | 冲突 | alias 或改名 |
| 依赖方法当 Depends 不绑定 self | 调用报错 | 用 instance.method |
| 全局 dependencies 取返回值 | 无法取,只执行 | 要取值用参数级 |

## 十一、设计思想

类依赖和作用域控制让 DI 体系更完整。类依赖适合「带状态/带方法」的依赖(分页器、查询构建器),作用域控制让你精确管理依赖的影响范围。配合中间件,FastAPI 提供了从全局到局部的完整请求处理工具链。理解每个层级的职责,才能写出既灵活又清晰的服务。
`,
  },
];
