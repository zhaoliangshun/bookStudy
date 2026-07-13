// =============================================================
// FastAPI 测试与部署全书 - 第 3 批章节（测试数据库与认证 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ft-database: 测试数据库基础
//   ft-transaction: 测试事务与回滚
//   ft-jwt: 测试 JWT 认证
//   ft-oauth2: 测试 OAuth2 与权限
//   ft-deps-override: 测试依赖覆盖认证
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：测试数据库基础
  // ============================================================
  {
    id: "ft-database",
    group: "测试数据库与认证",
    icon: "🗄️",
    title: "测试数据库基础",
    content: `# 测试数据库基础

## 为什么测试数据库要特殊处理

生活类比：测试数据库就像"实验室"。你不会在客厅里做化学实验，因为可能弄脏家具、损坏地板。生产数据库是"客厅"，测试数据库是"实验室"——一个隔离的、可以随意折腾的环境。

写普通单元测试时，数据通常是内存里的对象，测试结束自动消失。但一旦涉及数据库，就会遇到三个核心挑战：

**挑战一：不能污染生产数据。** 如果测试直接连生产库，往 users 表插了一堆假数据，真实用户就完蛋了。更可怕的是测试可能执行 DELETE 操作，把生产数据删光。

**挑战二：要快。** 测试需要频繁运行——每次改代码都跑一遍。如果每个测试都要连远程 PostgreSQL、建表、插数据、删数据，一个测试套件跑几分钟，开发者就不愿意跑了。

**挑战三：要可重复。** 同样的测试，今天跑通过，明天跑失败——这通常是数据库状态不一致导致的。比如测试 A 插了一条数据没清理，测试 B 查询时多了一条，断言就挂了。

解决这三个挑战的核心思路是：**用独立的测试数据库，每个测试从干净状态开始，测试结束自动清理。**

## SQLite 内存库：测试的最佳伙伴

SQLite 是一个嵌入式数据库，不需要独立的服务进程。它支持一种特殊的"内存模式"——\`sqlite:///:memory:\`，数据完全存在内存里，进程结束就消失。

生活类比：SQLite 内存库就像"白板"——写在上面，擦掉就没了，但写起来特别快，而且不用准备纸笔（不用装数据库服务）。

内存库的三大优势：

1. **快**：内存读写比磁盘快几个数量级，没有网络开销。
2. **隔离**：每个 \`:memory:\` 连接是独立的数据库，互不干扰。
3. **无需清理**：进程结束，内存自动释放，不用手动删数据。

连接字符串 \`sqlite:///:memory:\` 中，三个斜杠后的 \`:memory:\` 是 SQLite 约定的内存数据库标识。在 SQLAlchemy 里这样写：

\`\`\`python
# 从 sqlalchemy 导入 create_engine，用于创建数据库引擎
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入 sessionmaker，用于创建会话工厂
from sqlalchemy.orm import sessionmaker

# 创建 SQLite 内存数据库引擎
# "sqlite:///:memory:" 表示使用内存中的 SQLite 数据库
# connect_args={"check_same_thread": False} 允许跨线程使用连接
# 因为 FastAPI 的 TestClient 可能在不同线程里运行请求
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False}
)

# 创建会话工厂，bind=engine 表示会话绑定到这个引擎
# SessionLocal() 调用时返回一个新的 Session 实例
SessionLocal = sessionmaker(bind=engine)
\`\`\`

### 为什么需要 check_same_thread: False

SQLite 默认只允许创建连接的线程使用该连接。但 FastAPI 的 TestClient（基于 httpx + Starlette）在处理请求时可能切换线程。设置 \`check_same_thread: False\` 关闭这个限制，让连接可以在多线程间共享。

## Demo 1：SQLAlchemy + SQLite 内存库的 FastAPI 应用

下面是一个完整的 FastAPI 应用，使用 SQLAlchemy + SQLite 内存库。这是后面所有测试的基础。

\`\`\`python
# 从 fastapi 导入 FastAPI 应用类
from fastapi import FastAPI
# 从 fastapi 导入 Depends（依赖注入）和 HTTPException（抛异常）
from fastapi import Depends, HTTPException
# 从 pydantic 导入 BaseModel（数据模型基类）
from pydantic import BaseModel
# 从 sqlalchemy 导入列、整数、字符串、布尔类型
from sqlalchemy import Column, Integer, String, Boolean
# 从 sqlalchemy.orm 导入声明式基类、会话基类
from sqlalchemy.orm import declarative_base, sessionmaker, Session
# 从 sqlalchemy 导入 create_engine（创建引擎）
from sqlalchemy import create_engine

# 创建 SQLite 内存数据库引擎
# check_same_thread=False 允许跨线程使用（TestClient 需要）
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False}
)

# 创建会话工厂 SessionLocal
# autocommit=False 表示不自动提交，需要手动 commit
# autoflush=False 表示不自动刷新，避免意外的数据库查询
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# 创建声明式基类，所有模型继承它
Base = declarative_base()

# 定义 User 模型，对应数据库的 users 表
class User(Base):
    # __tablename__ 指定表名为 "users"
    __tablename__ = "users"
    # id 字段，主键，自增整数
    id = Column(Integer, primary_key=True, index=True)
    # username 字段，字符串，最大 50 字符，唯一，建索引
    username = Column(String(50), unique=True, index=True)
    # email 字段，字符串，最大 100 字符
    email = Column(String(100))
    # is_active 字段，布尔类型，默认 True
    is_active = Column(Boolean, default=True)

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义依赖函数 get_db，用于获取数据库会话
# yield 模式：函数先返回会话，请求结束后执行 finally 块关闭会话
def get_db():
    # 创建一个数据库会话
    db = SessionLocal()
    try:
        # yield 把会话交给路由函数使用
        yield db
    finally:
        # 请求结束后关闭会话，释放连接
        db.close()

# 定义 Pydantic 模型 UserCreate，用于接收请求体
class UserCreate(BaseModel):
    # username 字段，字符串
    username: str
    # email 字段，字符串
    email: str

# 定义 Pydantic 模型 UserResponse，用于响应体
class UserResponse(BaseModel):
    # id 字段，整数
    id: int
    # username 字段，字符串
    username: str
    # email 字段，字符串
    email: str
    # is_active 字段，布尔
    is_active: bool
    # Pydantic v2 配置：从 ORM 对象读取属性
    model_config = {"from_attributes": True}

# 定义 POST 路由 /users，创建用户
@app.post("/users", response_model=UserResponse)
# db 参数通过依赖注入获取，user 参数从请求体解析
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    # db.query(User).filter(User.username == user.username).first() 查询第一条匹配记录
    existing = db.query(User).filter(User.username == user.username).first()
    # 如果已存在，抛出 400 异常
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")
    # 创建 User ORM 对象
    db_user = User(username=user.username, email=user.email)
    # 添加到会话（此时还未写入数据库）
    db.add(db_user)
    # 提交事务，真正写入数据库
    db.commit()
    # 刷新对象，获取数据库生成的 id
    db.refresh(db_user)
    # 返回创建的用户
    return db_user

# 定义 GET 路由 /users/{user_id}，查询单个用户
@app.get("/users/{user_id}", response_model=UserResponse)
# user_id 是路径参数，类型 int；db 通过依赖注入获取
def get_user(user_id: int, db: Session = Depends(get_db)):
    # 根据 id 查询用户，找不到返回 None
    user = db.query(User).filter(User.id == user_id).first()
    # 如果用户不存在，抛出 404 异常
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 返回找到的用户
    return user

# 定义 GET 路由 /users，查询所有用户
@app.get("/users", response_model=list[UserResponse])
# db 通过依赖注入获取
def list_users(db: Session = Depends(get_db)):
    # db.query(User).all() 查询所有用户
    return db.query(User).all()
\`\`\`

这个应用有完整的 CRUD：创建（POST /users）、查询单个（GET /users/{id}）、查询全部（GET /users）。下面我们给它写测试。

## Demo 2：测试前建表（Base.metadata.create_all）

内存库是空的，没有任何表。测试前必须先建表。SQLAlchemy 的 \`Base.metadata.create_all(engine)\` 会根据模型定义创建所有表。

\`\`\`python
# 导入 pytest 模块
import pytest
# 从 fastapi.testclient 导入 TestClient（测试客户端）
from fastapi.testclient import TestClient
# 导入上面的 app、engine、Base、SessionLocal
from main import app, engine, Base, SessionLocal

# 定义 session 级 fixture，整个测试会话只执行一次
@pytest.fixture(scope="session")
def setup_database():
    # 在引擎上创建所有表（根据 Base 的模型定义）
    # 这会创建 users 表
    Base.metadata.create_all(bind=engine)
    # yield 表示 setup 完成，开始跑测试
    yield
    # 测试全部结束后，删除所有表
    Base.metadata.drop_all(bind=engine)

# 定义函数级 fixture，每个测试函数都会拿到一个干净的 client
@pytest.fixture
def client(setup_database):
    # 创建 TestClient 实例，绑定到 app
    # TestClient 本质是 httpx.Client + Starlette TestTransport
    with TestClient(app) as c:
        # yield 把客户端交给测试函数
        yield c
\`\`\`

**关键点：**

1. \`scope="session"\` 的 fixture 只执行一次，适合建表这种昂贵操作。
2. \`create_all\` 只会创建不存在的表，不会修改已有表结构。
3. 测试结束调用 \`drop_all\` 清理（内存库其实不必要，但养成好习惯）。

## Demo 3：用 fixture 提供 db session

有时候测试需要直接操作数据库验证状态，而不仅仅是通过 HTTP 接口。这时可以用 fixture 提供 db session。

\`\`\`python
# 导入 pytest
import pytest
# 导入 Session 类型用于类型注解
from sqlalchemy.orm import Session
# 导入项目里的 Base、engine、SessionLocal
from main import Base, engine, SessionLocal

# 定义 fixture 提供 db 会话
# scope="function" 表示每个测试函数都拿到新的会话
@pytest.fixture
def db_session():
    # 创建数据库会话
    session = SessionLocal()
    try:
        # yield 把会话交给测试
        yield session
    finally:
        # 测试结束关闭会话
        session.close()

# 测试函数：用 db_session 直接创建用户
def test_create_user_directly(db_session):
    # 导入 User 模型
    from main import User
    # 创建一个 User 对象
    user = User(username="alice", email="alice@example.com")
    # 添加到会话
    db_session.add(user)
    # 提交到数据库
    db_session.commit()
    # 刷新获取 id
    db_session.refresh(user)
    # 断言 id 被赋值了（自增主键）
    assert user.id is not None
    # 断言用户名正确
    assert user.username == "alice"
\`\`\`

这样测试可以同时用 \`client\`（测 HTTP 接口）和 \`db_session\`（直接查数据库验证），两者操作的是同一个内存库。

## Demo 4：测试 CRUD 操作（POST/GET/PUT/DELETE）

现在测试完整的 CRUD 流程。先给应用补上 PUT 和 DELETE 端点（此处省略应用代码，直接写测试）。

\`\`\`python
# 测试创建用户
def test_create_user(client):
    # 发送 POST 请求，创建用户
    # json= 表示发送 JSON 请求体
    response = client.post(
        "/users",
        json={"username": "bob", "email": "bob@example.com"}
    )
    # 断言状态码是 201（创建成功）
    # 注意：FastAPI 默认 POST 返回 200，除非指定 status_code=201
    assert response.status_code == 200
    # 解析响应 JSON
    data = response.json()
    # 断言返回的 username 正确
    assert data["username"] == "bob"
    # 断言返回的 email 正确
    assert data["email"] == "bob@example.com"
    # 断言 is_active 默认是 True
    assert data["is_active"] is True
    # 断言 id 被赋值
    assert "id" in data

# 测试查询用户
def test_get_user(client):
    # 先创建一个用户
    create_resp = client.post(
        "/users",
        json={"username": "carol", "email": "carol@example.com"}
    )
    # 获取创建的用户的 id
    user_id = create_resp.json()["id"]
    # 发送 GET 请求查询这个用户
    response = client.get(f"/users/{user_id}")
    # 断言状态码 200
    assert response.status_code == 200
    # 断言返回的用户名正确
    assert response.json()["username"] == "carol"

# 测试查询不存在的用户
def test_get_user_not_found(client):
    # 查询 id=99999 的用户（不存在）
    response = client.get("/users/99999")
    # 断言返回 404
    assert response.status_code == 404
    # 断言错误信息
    assert response.json()["detail"] == "用户不存在"

# 测试查询所有用户
def test_list_users(client):
    # 先创建两个用户
    client.post("/users", json={"username": "dave", "email": "d@x.com"})
    client.post("/users", json={"username": "eve", "email": "e@x.com"})
    # 查询所有用户
    response = client.get("/users")
    # 断言状态码 200
    assert response.status_code == 200
    # 断言返回的是列表
    data = response.json()
    assert isinstance(data, list)
    # 断言至少有两个用户
    assert len(data) >= 2
\`\`\`

## Demo 5：测试唯一约束冲突

User 模型的 \`username\` 字段设置了 \`unique=True\`，如果插入重复用户名，数据库会抛出唯一约束冲突。

\`\`\`python
# 测试创建重复用户名
def test_duplicate_username(client):
    # 先创建一个用户
    client.post(
        "/users",
        json={"username": "frank", "email": "frank@x.com"}
    )
    # 再用同样的用户名创建
    response = client.post(
        "/users",
        json={"username": "frank", "email": "another@x.com"}
    )
    # 断言返回 400（应用层检查抛的异常）
    assert response.status_code == 400
    # 断言错误信息
    assert response.json()["detail"] == "用户名已存在"
\`\`\`

**注意：** 这里应用层先查询再插入，所以返回 400。如果不做应用层检查，直接靠数据库约束，会抛 \`IntegrityError\`，导致 500。生产代码应该用 try/except 捕获并转成 400。

## Demo 6：用 TestClient 测试完整 API 流程

把创建、查询、更新、删除串起来测一遍完整流程。假设应用有 PUT 和 DELETE 端点。

\`\`\`python
# 测试完整的 CRUD 流程：创建→查询→更新→删除
def test_full_crud_flow(client):
    # === 第 1 步：创建用户 ===
    create_resp = client.post(
        "/users",
        json={"username": "grace", "email": "grace@x.com"}
    )
    # 断言创建成功
    assert create_resp.status_code == 200
    # 拿到用户 id
    user_id = create_resp.json()["id"]

    # === 第 2 步：查询刚创建的用户 ===
    get_resp = client.get(f"/users/{user_id}")
    # 断言查询成功
    assert get_resp.status_code == 200
    # 断言用户名正确
    assert get_resp.json()["username"] == "grace"

    # === 第 3 步：更新用户 ===
    # 假设有 PUT /users/{id} 端点
    update_resp = client.put(
        f"/users/{user_id}",
        json={"username": "grace_updated", "email": "new@x.com"}
    )
    # 断言更新成功
    assert update_resp.status_code == 200
    # 断言用户名已更新
    assert update_resp.json()["username"] == "grace_updated"

    # === 第 4 步：删除用户 ===
    # 假设有 DELETE /users/{id} 端点
    del_resp = client.delete(f"/users/{user_id}")
    # 断言删除成功
    assert del_resp.status_code == 200

    # === 第 5 步：再查询，应该 404 ===
    get_after_del = client.get(f"/users/{user_id}")
    # 断言用户已不存在
    assert get_after_del.status_code == 404
\`\`\`

这种"完整流程"测试很有价值——它验证了多个端点协作的正确性。但也要注意：如果中间任何一步失败，后面的全挂。所以关键场景要单独测。

## Demo 7：测试后 drop_all 清理

测试套件跑完后，应该清理数据库。对于内存库这不是必须的（进程结束就没了），但养成好习惯，将来切换到文件库或 PostgreSQL 时不会出问题。

\`\`\`python
# 导入 pytest
import pytest
# 导入 Base 和 engine
from main import Base, engine

# 定义整个测试会话的入口 fixture
@pytest.fixture(scope="session", autouse=True)
# autouse=True 表示自动应用，不需要测试函数显式引用
def setup_and_teardown():
    # === 测试前：建表 ===
    Base.metadata.create_all(bind=engine)
    # yield 之前是 setup，之后是 teardown
    yield
    # === 测试后：删表 ===
    Base.metadata.drop_all(bind=engine)
    # 可选：释放引擎连接池
    engine.dispose()

# 测试函数
def test_something(client):
    # 测试逻辑...
    response = client.get("/users")
    assert response.status_code == 200
\`\`\`

\`autouse=True\` 让这个 fixture 自动生效，所有测试函数不用显式引用它。这在"全局副作用"场景下很方便。

## SQLite 内存库 vs 文件库 vs PostgreSQL 测试容器

| 维度 | SQLite :memory: | SQLite 文件 | PostgreSQL 测试容器 |
|------|----------------|-------------|---------------------|
| 速度 | 极快（内存） | 快（磁盘） | 慢（需要启动容器） |
| 隔离性 | 进程级隔离 | 需手动清理 | 容器级隔离 |
| 环境依赖 | 无（Python 自带） | 无 | 需要 Docker |
| 功能兼容 | 不支持部分高级特性 | 同内存版 | 完整 PostgreSQL 功能 |
| 并发 | 单写者 | 单写者 | 多连接并发 |
| 适合场景 | 单元测试、快速验证 | 需要持久化的测试 | 集成测试、生产一致性 |
| JSON 支持 | 基础支持 | 基础支持 | 完整 JSONB |
| 索引行为 | 部分差异 | 部分差异 | 完整一致 |

**选择建议：**

1. 开发阶段、日常单元测试 → SQLite 内存库（最快）。
2. 需要测试 PostgreSQL 特有功能（如 JSONB、数组类型）→ 用 testcontainers 启动临时 PostgreSQL。
3. 不要用生产数据库做测试——哪怕你觉得"我会小心的"。

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 测试数据库三挑战 | 不污染生产、要快、要可重复 |
| SQLite 内存库 | \`sqlite:///:memory:\`，快、隔离、无需清理 |
| check_same_thread | 设为 False，允许 TestClient 跨线程访问 |
| create_all | 根据模型建表，测试前调用 |
| drop_all | 删表清理，测试后调用 |
| fixture 提供 db | 用 yield 模式，确保关闭会话 |
| TestClient | 基于 httpx，模拟 HTTP 请求测 API |
| CRUD 测试 | 创建→查询→更新→删除，覆盖完整流程 |
| 唯一约束测试 | 应用层检查返回 400，数据库层抛 IntegrityError |
| autouse fixture | 自动生效的全局 setup/teardown |
`,
  },
  // ============================================================
  // 第 2 章：测试事务与回滚
  // ============================================================
  {
    id: "ft-transaction",
    group: "测试数据库与认证",
    icon: "🔄",
    title: "测试事务与回滚",
    content: `# 测试事务与回滚

## 测试隔离的重要性

生活类比：测试隔离就像"草稿纸"。你在草稿纸上写写画画，写完撕掉扔进垃圾桶，下一张又是全新的。如果你在同一张纸上不断写，上面的内容会互相干扰，你分不清哪行是哪次的。

测试隔离的意思是：**每个测试独立运行，不互相影响。** 测试 A 插入的数据，测试 B 看不到；测试 A 的失败，不会让测试 B 也失败。

没有隔离会怎样？

\`\`\`txt
测试 A: 插入 3 个用户 → 断言用户总数 == 3 ✓
测试 B: 插入 2 个用户 → 断言用户总数 == 2 ✗（实际是 5，因为 A 没清理）
\`\`\`

这种"测试互相污染"的问题非常隐蔽——单独跑每个测试都过，一起跑就挂。而且错误信息指向 B，但根源在 A，排查极痛苦。

## 事务回滚策略

核心思路：**每个测试在一个事务里运行，测试结束回滚事务，所有修改全部撤销。**

生活类比：事务回滚就像"草稿纸"——你在上面写的内容，撕掉就没了，正式本子（数据库）不受影响。

实现方式：

1. 测试开始时，开启一个数据库事务。
2. 测试中所有的 INSERT/UPDATE/DELETE 都在这个事务内。
3. 测试结束时，执行 ROLLBACK，撤销所有修改。
4. 下一个测试开始时，数据库还是干净状态。

这样每个测试都"看到"一个干净的数据库，互不干扰。

## Demo 1：不用事务的测试（污染问题演示）

先看反面教材——不用事务，手动清理，看会出什么问题。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用和数据库相关
from main import app, Base, engine, SessionLocal

# 建表 fixture
@pytest.fixture(scope="session")
def setup_db():
    # 建表
    Base.metadata.create_all(bind=engine)
    yield
    # 删表
    Base.metadata.drop_all(bind=engine)

# 不用事务的 fixture：只提供 client
@pytest.fixture
def client(setup_db):
    with TestClient(app) as c:
        yield c

# 测试 1：插入用户
def test_create_alice(client):
    # 创建 alice
    resp = client.post("/users", json={"username": "alice", "email": "a@x.com"})
    # 断言成功
    assert resp.status_code == 200

# 测试 2：查询所有用户，断言数量
def test_count_users(client):
    # 如果 test_create_alice 先跑，alice 还在数据库里！
    # 查询所有用户
    resp = client.get("/users")
    # 期望 0 个，但实际可能是 1 个（alice 没被清理）
    assert len(resp.json()) == 0  # 这个断言可能失败！
\`\`\`

运行这个测试，\`test_count_users\` 很可能失败，因为 \`test_create_alice\` 创建的 alice 没被清理。这就是污染问题。

**临时解决方案**：每个测试后手动删除所有数据。但这很繁琐，而且容易漏。更好的方案是用事务回滚。

## Demo 2：用 BEGIN/ROLLBACK 包裹测试

用事务包裹每个测试，测试结束回滚。这是最经典的隔离方案。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入 Session 类型
from sqlalchemy.orm import Session
# 导入应用和数据库
from main import app, Base, engine, SessionLocal, get_db

# 会话级 fixture：建表
@pytest.fixture(scope="session")
def setup_db():
    # 建表
    Base.metadata.create_all(bind=engine)
    yield
    # 删表
    Base.metadata.drop_all(bind=engine)

# 函数级 fixture：用事务包裹每个测试
@pytest.fixture
def db_session(setup_db):
    # 创建一个连接
    connection = engine.connect()
    # 在连接上开启一个事务
    trans = connection.begin()
    # 创建 Session，绑定到这个连接
    # 这个 session 的所有操作都在 trans 事务内
    session = Session(bind=connection)
    # yield 把 session 交给测试
    yield session
    # === 测试结束后的清理 ===
    # 关闭 session
    session.close()
    # 回滚事务，撤销所有修改
    trans.rollback()
    # 关闭连接
    connection.close()

# 函数级 fixture：提供 client，但让 app 用我们的 db_session
@pytest.fixture
def client(db_session):
    # 覆盖 get_db 依赖，返回我们的事务 session
    # 这样 app 内部用的 db 就是带事务的那个
    def override_get_db():
        # 直接 yield db_session（不再新建 session）
        yield db_session
    # 注册依赖覆盖
    app.dependency_overrides[get_db] = override_get_db
    # 创建 TestClient
    with TestClient(app) as c:
        yield c
    # 测试结束后清除覆盖
    app.dependency_overrides.clear()

# 测试 1：插入 alice
def test_create_alice(client, db_session):
    # 通过 API 创建 alice
    resp = client.post("/users", json={"username": "alice", "email": "a@x.com"})
    assert resp.status_code == 200

# 测试 2：查询用户数量——这次会是 0，因为上个测试回滚了
def test_count_users(client):
    resp = client.get("/users")
    # 断言 0 个，因为 test_create_alice 的事务已回滚
    assert len(resp.json()) == 0
\`\`\`

**关键点：**

1. \`connection = engine.connect()\` 创建一个物理连接。
2. \`trans = connection.begin()\` 在这个连接上开启事务。
3. \`Session(bind=connection)\` 创建绑定到该连接的会话。
4. 测试结束后 \`trans.rollback()\` 撤销所有修改。
5. 用 \`dependency_overrides\` 让 app 用这个 session（下一章详解）。

## Demo 3：用 SAVEPOINT 实现嵌套事务

问题：如果应用代码内部也调用 \`db.commit()\`，会把外层事务提交了，回滚就失效了。解决方案是用 SAVEPOINT（保存点）。

生活类比：SAVEPOINT 就像"书签"。你读到第 50 页放个书签，然后继续读。如果后面读错了想回去，可以回到第 50 页，而不是回到全书开头。

\`\`\`python
# 导入 pytest
import pytest
# 导入 Session
from sqlalchemy.orm import Session
# 导入应用和数据库
from main import app, Base, engine, SessionLocal, get_db

# 会话级 fixture：建表，并开启一个全局事务
@pytest.fixture(scope="session")
def setup_db():
    # 建表
    Base.metadata.create_all(bind=engine)
    # 创建一个全局连接
    connection = engine.connect()
    # 开启一个全局事务（这个事务永远不会提交，最后回滚）
    trans = connection.begin()
    # 把连接和事务存起来，供函数级 fixture 使用
    yield connection
    # 测试全部结束后
    # 回滚全局事务
    trans.rollback()
    # 关闭连接
    connection.close()
    # 删表
    Base.metadata.drop_all(bind=engine)
    # 释放引擎
    engine.dispose()

# 函数级 fixture：每个测试用 SAVEPOINT 隔离
@pytest.fixture
def db_session(setup_db):
    # setup_db yield 的 connection
    connection = setup_db
    # 在现有连接上开启一个嵌套事务（SAVEPOINT）
    # join_transaction_mode="create_savepoint" 是关键：
    # 它告诉 SQLAlchemy，当 session.commit() 时只提交到 SAVEPOINT，
    # 而不是提交外层事务
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint"
    )
    # yield 把 session 交给测试
    yield session
    # 测试结束：关闭 session
    session.close()
    # 此时 session 内的 commit 都只到 SAVEPOINT，
    # 关闭 session 后，那些修改还在外层事务里
    # 但外层事务最后会被回滚，所以一切都会被撤销

# 函数级 fixture：提供 client
@pytest.fixture
def client(db_session):
    # 覆盖 get_db
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# 测试：即使应用内部调用了 commit，事务也能回滚
def test_with_internal_commit(client, db_session):
    # 创建用户（应用内部会调用 db.commit()）
    resp = client.post("/users", json={"username": "alice", "email": "a@x.com"})
    assert resp.status_code == 200
    # 直接查数据库确认用户存在
    from main import User
    user = db_session.query(User).filter(User.username == "alice").first()
    assert user is not None
    # 这个测试结束后，session 关闭，SAVEPOINT 释放
    # 外层事务回滚时，alice 会被撤销
\`\`\`

\`join_transaction_mode="create_savepoint"\` 的作用：

1. Session 加入到外层事务，而不是创建新事务。
2. 当应用代码调用 \`db.commit()\` 时，只释放 SAVEPOINT，不提交外层事务。
3. 当应用代码调用 \`db.rollback()\` 时，只回滚到 SAVEPOINT，不影响外层事务。
4. 最终外层事务回滚，所有测试数据全部撤销。

这是 SQLAlchemy 2.0+ 推荐的测试隔离方案，最健壮。

## Demo 4：每个测试 truncate 表（替代方案）

如果不用事务回滚，另一种方案是每个测试前清空所有表。简单粗暴但有效。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用和数据库
from main import app, Base, engine, SessionLocal, get_db

# 函数级 fixture：每个测试前清空表
@pytest.fixture
def clean_db():
    # 建表（如果不存在）
    Base.metadata.create_all(bind=engine)
    # 创建会话
    session = SessionLocal()
    try:
        # 遍历所有表，逐个删除数据
        # reversed 表示按依赖逆序删，避免外键冲突
        for table in reversed(Base.metadata.sorted_tables):
            # delete() 删除表的所有行
            session.execute(table.delete())
        # 提交删除
        session.commit()
        yield session
    finally:
        # 关闭会话
        session.close()

# 函数级 fixture：提供 client
@pytest.fixture
def client(clean_db):
    def override_get_db():
        yield clean_db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# 测试 1
def test_create_alice(client):
    resp = client.post("/users", json={"username": "alice", "email": "a@x.com"})
    assert resp.status_code == 200

# 测试 2：表已经被清空，所以是 0 个用户
def test_count_users(client):
    resp = client.get("/users")
    assert len(resp.json()) == 0
\`\`\`

**truncate 方案的优缺点：**

优点：简单直观，不涉及事务嵌套。

缺点：每个测试都要 DELETE 所有表，表多时较慢；如果有自增主键，计数器不会重置（SQLite 可以重置，PostgreSQL 需要额外操作）。

## Demo 5：对比三种隔离方案的速度

用 \`pytest-benchmark\` 或简单的计时对比三种方案。

\`\`\`python
# 导入 time 用于计时
import time
# 导入 pytest
import pytest
# 导入应用和数据库
from main import Base, engine, SessionLocal, User

# 方案一：无隔离（基线）
def test_no_isolation():
    # 记录开始时间
    start = time.perf_counter()
    # 创建会话
    session = SessionLocal()
    # 插入 100 个用户
    for i in range(100):
        session.add(User(username=f"user_{i}", email=f"u{i}@x.com"))
    session.commit()
    # 记录结束时间
    elapsed = time.perf_counter() - start
    print(f"无隔离: {elapsed:.4f}s")
    # 清理
    session.query(User).delete()
    session.commit()
    session.close()

# 方案二：事务回滚
def test_transaction_rollback():
    # 记录开始时间
    start = time.perf_counter()
    # 创建连接和事务
    connection = engine.connect()
    trans = connection.begin()
    session = Session(bind=connection)
    # 插入 100 个用户
    for i in range(100):
        session.add(User(username=f"user_{i}", email=f"u{i}@x.com"))
    session.commit()  # 提交到事务（但外层不提交）
    # 记录结束时间
    elapsed = time.perf_counter() - start
    print(f"事务回滚: {elapsed:.4f}s")
    # 回滚
    session.close()
    trans.rollback()
    connection.close()

# 方案三：SAVEPOINT
def test_savepoint():
    # 记录开始时间
    start = time.perf_counter()
    # 创建连接和全局事务
    connection = engine.connect()
    trans = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    # 插入 100 个用户
    for i in range(100):
        session.add(User(username=f"user_{i}", email=f"u{i}@x.com"))
    session.commit()  # 只提交到 SAVEPOINT
    # 记录结束时间
    elapsed = time.perf_counter() - start
    print(f"SAVEPOINT: {elapsed:.4f}s")
    # 回滚
    session.close()
    trans.rollback()
    connection.close()
\`\`\`

典型结果（100 条记录）：

\`\`\`txt
无隔离:    0.0234s
事务回滚:  0.0189s
SAVEPOINT: 0.0201s
\`\`\`

差异不大，因为 SQLite 内存库本身很快。差异在 PostgreSQL 上更明显：事务回滚比无隔离快 2-5 倍（因为不真正写磁盘）。

## Demo 6：测试并发写入（唯一约束）

测试在事务隔离下，唯一约束是否正常工作。

\`\`\`python
# 测试：事务内重复用户名
def test_duplicate_in_transaction(db_session):
    # 导入 User
    from main import User
    # 插入第一个 alice
    user1 = User(username="alice", email="a1@x.com")
    db_session.add(user1)
    db_session.commit()  # 提交到 SAVEPOINT
    # 再插入同名的 alice，应该报错
    user2 = User(username="alice", email="a2@x.com")
    db_session.add(user2)
    # 断言抛出 IntegrityError
    from sqlalchemy.exc import IntegrityError
    with pytest.raises(IntegrityError):
        db_session.commit()  # 这里会抛唯一约束冲突
    # 抛错后 session 进入失效状态，需要 rollback
    db_session.rollback()
    # 第一个 alice 还在（因为 rollback 只撤销第二次提交）
    # 注意：SAVEPOINT 模式下，rollback 回到 SAVEPOINT
    count = db_session.query(User).filter(User.username == "alice").count()
    assert count == 1
\`\`\`

这个测试验证了：即使在事务隔离环境下，唯一约束依然生效，而且部分失败不会污染整个测试。

## 三种测试隔离方案对比

| 方案 | 原理 | 速度 | 健壮性 | 复杂度 |
|------|------|------|--------|--------|
| 无隔离+手动清理 | 每个测试后删数据 | 慢 | 差（易漏） | 低 |
| 事务回滚 | BEGIN+ROLLBACK | 快 | 中（commit 会破坏） | 中 |
| SAVEPOINT | 嵌套事务 | 快 | 好（commit 不影响外层） | 高 |
| Truncate | 每次清空表 | 中 | 中 | 低 |

**推荐：**

1. 简单项目 → 事务回滚方案，够用。
2. 复杂项目（应用内部有 commit）→ SAVEPOINT 方案，最健壮。
3. 不想搞事务 → Truncate 方案，简单但稍慢。

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 测试隔离 | 每个测试独立，不互相影响 |
| 污染问题 | 测试 A 的数据影响测试 B |
| 事务回滚 | BEGIN→测试→ROLLBACK，撤销所有修改 |
| dependency_overrides | 让 app 用测试提供的 session |
| SAVEPOINT | \`join_transaction_mode="create_savepoint"\` |
| SAVEPOINT 优势 | 应用内部 commit 不破坏外层事务 |
| Truncate 方案 | 每个测试前清空所有表 |
| IntegrityError | 唯一约束冲突时的异常 |
| 方案选择 | 简单用回滚，复杂用 SAVEPOINT |
| 性能差异 | 事务方案比无隔离快 2-5 倍 |
`,
  },
  // ============================================================
  // 第 3 章：测试 JWT 认证
  // ============================================================
  {
    id: "ft-jwt",
    group: "测试数据库与认证",
    icon: "🔑",
    title: "测试 JWT 认证",
    content: `# 测试 JWT 认证

## JWT 回顾

JWT（JSON Web Token）是一种紧凑的、自包含的令牌格式，用于在各方之间安全传输信息。

生活类比：JWT 就像"游乐园手环"。你在入口检票（登录），工作人员给你套上手环（签发 token）。之后玩每个项目（访问 API），只需出示手环，不用再检票。手环里有你的信息（VIP/普通），撕不掉、伪造不了（签名保护）。

JWT 由三部分组成，用点（.）分隔：\`header.payload.signature\`

1. **Header**：声明 token 类型和签名算法，如 \`{"alg": "HS256", "typ": "JWT"}\`。
2. **Payload**：携带声明（claims），如 \`{"sub": "alice", "exp": 1700000000}\`。
3. **Signature**：用密钥对 header+payload 签名，防篡改。

三部分分别 Base64Url 编码后拼接：\`eyJhbG... .eyJzdW... .SflKx... \`

**关键特性：**

- **自包含**：token 本身携带用户信息，服务端不用查数据库就能知道是谁。
- **防篡改**：签名用密钥生成，没有密钥无法伪造。
- **有过期**：\`exp\` 声明控制有效期，过期后失效。
- **不加密**：payload 只是 Base64 编码，不是加密——不要放敏感信息！

## FastAPI 中 JWT 的典型实现

FastAPI 里 JWT 认证的标准组合是：\`OAuth2PasswordBearer\` + \`python-jose\`。

\`\`\`python
# 从 fastapi.security 导入 OAuth2PasswordBearer（获取 token 的依赖）
from fastapi.security import OAuth2PasswordBearer
# 从 jose 导入 jwt（编码解码 JWT）
from jose import jwt, JWTError

# OAuth2PasswordBearer 声明 token 从哪里获取
# tokenUrl="token" 告诉 Swagger UI 去哪个端点登录获取 token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 密钥（生产环境必须用强随机值，不要硬编码）
SECRET = "secret"
# 签名算法
ALGORITHM = "HS256"

# 创建 token 的函数
def create_token(data: dict):
    # data 是要写入 payload 的字典，如 {"sub": "alice"}
    # jwt.encode 编码并签名
    return jwt.encode(data, SECRET, algorithm=ALGORITHM)

# 解码 token 的函数
def decode_token(token: str):
    # jwt.decode 验证签名并解码
    # 如果签名错误或过期，会抛 JWTError
    return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
\`\`\`

## Demo 1：完整的 JWT 登录 FastAPI 应用

下面是一个完整的 JWT 认证应用，包含登录、获取当前用户、受保护端点。

\`\`\`python
# 从 fastapi 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 fastapi.security 导入 OAuth2PasswordBearer、OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# 从 jose 导入 jwt、JWTError
from jose import jwt, JWTError
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 datetime 导入 datetime、timedelta（用于设置过期时间）
from datetime import datetime, timedelta

# 创建 FastAPI 应用
app = FastAPI()

# 密钥（生产环境用环境变量）
SECRET = "my-secret-key"
# 签名算法
ALGORITHM = "HS256"
# token 有效期（分钟）
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2PasswordBearer：从 Authorization: Bearer <token> 头提取 token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 模拟用户数据库（用户名 → 密码）
fake_users = {
    "alice": "password123",
    "bob": "bobpass"
}

# 创建 JWT token 的函数
def create_token(data: dict, expires_delta: timedelta | None = None):
    # 复制 data，避免修改原字典
    to_encode = data.copy()
    # 计算过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # 默认 30 分钟后过期
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # 添加 exp 声明
    to_encode.update({"exp": expire})
    # 编码并签名，返回 token 字符串
    return jwt.encode(to_encode, SECRET, algorithm=ALGORITHM)

# 依赖函数：解析 token，返回用户名
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 定义异常
    credentials_exception = HTTPException(
        status_code=401,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 解码 token
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        # 从 payload 取出 sub（subject，通常是用户名）
        username: str = payload.get("sub")
        # 如果没有 sub，抛异常
        if username is None:
            raise credentials_exception
    except JWTError:
        # 解码失败（签名错误、过期等）抛异常
        raise credentials_exception
    # 返回用户名
    return username

# 登录端点：POST /token
@app.post("/token")
# OAuth2PasswordRequestForm 自动解析表单数据（username + password）
def login(form: OAuth2PasswordRequestForm = Depends()):
    # 检查用户名是否存在
    user = fake_users.get(form.username)
    # 用户不存在或密码错误
    if user is None or user != form.password:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    # 创建 token，sub 设为用户名
    access_token = create_token(data={"sub": form.username})
    # OAuth2 规范要求返回 access_token 和 token_type
    return {"access_token": access_token, "token_type": "bearer"}

# 受保护端点：GET /me
@app.get("/me")
# 依赖 get_current_user，自动解析 token
def read_me(current_user: str = Depends(get_current_user)):
    # 返回当前登录用户
    return {"user": current_user}

# 受保护端点：GET /protected
@app.get("/protected")
# 同样依赖 get_current_user
def protected(current_user: str = Depends(get_current_user)):
    # 返回受保护数据
    return {"message": f"你好 {current_user}，这是受保护数据"}
\`\`\`

## Demo 2：测试登录端点

测试 \`POST /token\`，登录成功拿到 token。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用
from main import app

# fixture：提供 client
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

# 测试：正确密码登录
def test_login_success(client):
    # 发送 POST /token，表单数据用 data= 而不是 json=
    # OAuth2PasswordRequestForm 期望 application/x-www-form-urlencoded
    response = client.post(
        "/token",
        data={"username": "alice", "password": "password123"}
    )
    # 断言状态码 200
    assert response.status_code == 200
    # 解析响应
    data = response.json()
    # 断言有 access_token
    assert "access_token" in data
    # 断言 token_type 是 bearer
    assert data["token_type"] == "bearer"
    # 断言 token 不为空
    assert data["access_token"] is not None
    # 断言 token 是字符串
    assert isinstance(data["access_token"], str)
\`\`\`

**注意：** 登录请求用 \`data=\` 而不是 \`json=\`，因为 \`OAuth2PasswordRequestForm\` 解析的是表单格式（\`application/x-www-form-urlencoded\`），不是 JSON。

## Demo 3：测试受保护端点（带 Authorization 头）

拿到 token 后，带 \`Authorization: Bearer <token>\` 头访问受保护端点。

\`\`\`python
# 测试：带 token 访问受保护端点
def test_access_protected_with_token(client):
    # 先登录拿 token
    login_resp = client.post(
        "/token",
        data={"username": "alice", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    # 带 token 访问 /me
    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    # 断言状态码 200
    assert response.status_code == 200
    # 断言返回的用户名正确
    assert response.json()["user"] == "alice"

# 测试：访问 /protected
def test_protected_endpoint(client):
    # 登录
    login_resp = client.post(
        "/token",
        data={"username": "bob", "password": "bobpass"}
    )
    token = login_resp.json()["access_token"]
    # 访问受保护端点
    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    # 断言成功
    assert response.status_code == 200
    # 断言返回的消息包含用户名
    assert "bob" in response.json()["message"]
\`\`\`

## Demo 4：测试无 token → 401

不带 Authorization 头访问受保护端点，应该返回 401。

\`\`\`python
# 测试：不带 token 访问受保护端点
def test_no_token_returns_401(client):
    # 直接访问 /me，不带 Authorization 头
    response = client.get("/me")
    # 断言状态码 401（未授权）
    assert response.status_code == 401
    # 断言响应头包含 WWW-Authenticate（OAuth2 规范要求）
    assert response.headers.get("WWW-Authenticate") == "Bearer"
    # 断言错误信息
    assert response.json()["detail"] == "Not authenticated"
\`\`\`

\`OAuth2PasswordBearer\` 在没有 token 时自动抛 401，错误信息是固定的 "Not authenticated"。

## Demo 5：测试无效 token → 401

带一个乱写的 token，应该返回 401。

\`\`\`python
# 测试：无效 token
def test_invalid_token_returns_401(client):
    # 带一个乱写的 token
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer this.is.not.valid"}
    )
    # 断言状态码 401
    assert response.status_code == 401
    # 断言错误信息
    assert response.json()["detail"] == "无法验证凭据"

# 测试：用错误密钥签的 token
def test_wrong_secret_token(client):
    # 用错误的密钥签 token
    from jose import jwt
    # 用另一个密钥编码
    bad_token = jwt.encode({"sub": "alice"}, "wrong-secret", algorithm="HS256")
    # 带 token 访问
    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {bad_token}"}
    )
    # 断言 401（签名验证失败）
    assert response.status_code == 401
\`\`\`

## Demo 6：测试过期 token → 401（mock 时间）

测试 token 过期后访问返回 401。需要 mock 时间来模拟过期。

\`\`\`python
# 导入 pytest
import pytest
# 从 unittest.mock 导入 patch（用于 mock 时间）
from unittest.mock import patch
# 导入 datetime
from datetime import datetime, timedelta
# 导入 jwt
from jose import jwt

# 测试：过期 token
def test_expired_token_returns_401(client):
    # 用 patch 临时替换 datetime.utcnow
    # 让 token 的创建时间在过去 1 小时前
    past_time = datetime.utcnow() - timedelta(hours=1)
    # patch main 模块里的 datetime（注意要 patch 调用处）
    with patch("main.datetime") as mock_dt:
        # 让 utcnow 返回过去的时间
        mock_dt.utcnow.return_value = past_time
        # timedelta 必须保留真的（因为 create_token 里用了）
        mock_dt.timedelta = timedelta
        # 创建一个"过去签发"的 token（已经过期）
        from main import create_token
        token = create_token(data={"sub": "alice"})
    # 现在 token 已经过期（创建时间是 1 小时前，有效期 30 分钟）
    # 带 token 访问
    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    # 断言 401
    assert response.status_code == 401

# 更简单的方式：直接创建一个已过期的 token
def test_expired_token_simple(client):
    # 从 main 导入 SECRET 和 ALGORITHM
    from main import SECRET, ALGORITHM
    # 创建一个过期时间在过去的 token
    past_expire = datetime.utcnow() - timedelta(minutes=10)
    # 直接用 jwt.encode，exp 设为过去
    expired_token = jwt.encode(
        {"sub": "alice", "exp": past_expire},
        SECRET,
        algorithm=ALGORITHM
    )
    # 带 token 访问
    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    # 断言 401
    assert response.status_code == 401
\`\`\`

第二种方式更简单——直接构造一个 exp 在过去的 token，不需要 mock。

## Demo 7：用 fixture 自动注入 token

每个测试都要先登录拿 token 再带 token 访问，很重复。用 fixture 简化。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用
from main import app, create_token

# fixture：提供 client
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

# fixture：自动登录并返回 Authorization 头
@pytest.fixture
def auth_headers(client):
    # 登录拿 token
    login_resp = client.post(
        "/token",
        data={"username": "alice", "password": "password123"}
    )
    # 取出 token
    token = login_resp.json()["access_token"]
    # 返回 Authorization 头字典
    return {"Authorization": f"Bearer {token}"}

# fixture：直接返回 token（更灵活）
@pytest.fixture
def token(client):
    # 直接调用 create_token 创建 token，不走登录
    return create_token({"sub": "alice"})

# 测试：用 auth_headers fixture
def test_me_with_fixture(client, auth_headers):
    # 直接带 auth_headers 访问
    response = client.get("/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["user"] == "alice"

# 测试：用 token fixture
def test_protected_with_token(client, token):
    # 手动构造 headers
    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200

# 测试：不同用户登录
@pytest.fixture
def bob_headers(client):
    login_resp = client.post(
        "/token",
        data={"username": "bob", "password": "bobpass"}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_bob_access(client, bob_headers):
    response = client.get("/me", headers=bob_headers)
    assert response.status_code == 200
    assert response.json()["user"] == "bob"
\`\`\`

两种 fixture 风格：

1. \`auth_headers\`：返回完整的 headers 字典，直接传给 \`client.get(headers=...)\`。
2. \`token\`：只返回 token 字符串，测试自己拼 headers。更灵活，比如可以测"带错误格式的 Authorization 头"。

## 本章小结

| 知识点 | 要点 |
|--------|------|
| JWT 结构 | header.payload.signature，用点分隔 |
| OAuth2PasswordBearer | 从 Authorization: Bearer 提取 token |
| OAuth2PasswordRequestForm | 解析表单格式的 username+password |
| 登录测试 | POST /token，用 data= 发表单 |
| 受保护端点测试 | 带 Authorization: Bearer {token} 头 |
| 无 token | 自动返回 401，detail="Not authenticated" |
| 无效 token | get_current_user 抛 401 |
| 过期 token | exp 声明过期后 jwt.decode 抛 JWTError |
| mock 时间 | patch datetime 模拟过期，或直接构造过期 token |
| token fixture | 用 fixture 自动登录返回 headers，减少重复 |
`,
  },
  // ============================================================
  // 第 4 章：测试 OAuth2 与权限
  // ============================================================
  {
    id: "ft-oauth2",
    group: "测试数据库与认证",
    icon: "🛡️",
    title: "测试 OAuth2 与权限",
    content: `# 测试 OAuth2 与权限

## OAuth2PasswordBearer 的工作机制

\`OAuth2PasswordBearer\` 是 FastAPI 提供的依赖类，实现了 OAuth2 密码流（Password Flow）。它做两件事：

1. **提取 token**：从请求头 \`Authorization: Bearer <token>\` 中提取 token 字符串。如果没有这个头，自动抛 401。
2. **文档声明**：告诉 Swagger UI 这个 API 需要登录，并提供"Authorize"按钮。

生活类比：\`OAuth2PasswordBearer\` 就像"门卫"。它不认识你是谁（不验证 token），只负责看你有没有"通行证"（Authorization 头）。通行证的真伪由后续的 \`get_current_user\` 验证。

\`\`\`python
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer

# tokenUrl="token" 告诉客户端去 POST /token 获取 token
# 这个 URL 只用于文档展示，不影响实际路由
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 用法：作为依赖注入
@app.get("/me")
def me(token: str = Depends(oauth2_scheme)):
    # token 是从 Authorization 头提取的字符串
    # 如果没有 Authorization 头，这里根本到不了
    return {"token": token}
\`\`\`

\`oauth2_scheme\` 本质是一个可调用对象，被 FastAPI 当作依赖使用。它返回 token 字符串，或抛 401。

## OAuth2PasswordRequestForm 表单字段

\`OAuth2PasswordRequestForm\` 是 FastAPI 提供的表单解析类，对应 OAuth2 规范的登录表单。它从 \`application/x-www-form-urlencoded\` 格式的请求体中提取字段：

\`\`\`txt
username: 用户名
password: 密码
scope: 权限范围（空格分隔的字符串，如 "read write"）
grant_type: 授权类型（通常是 "password"）
client_id: 客户端 ID（可选）
client_secret: 客户端密钥（可选）
\`\`\`

\`\`\`python
# 从 fastapi.security 导入 OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username：用户名
    # form.password：密码
    # form.scopes：权限列表（已解析成 list）
    return {
        "username": form.username,
        "scopes": form.scopes
    }
\`\`\`

## Demo 1：完整的 OAuth2 密码流

下面是一个带角色和权限的完整 OAuth2 应用。

\`\`\`python
# 从 fastapi 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 fastapi.security 导入 OAuth2PasswordBearer、OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# 从 jose 导入 jwt、JWTError
from jose import jwt, JWTError
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 datetime 导入 datetime、timedelta
from datetime import datetime, timedelta

# 创建应用
app = FastAPI()

# 密钥和算法
SECRET = "my-secret"
ALGORITHM = "HS256"

# OAuth2 方案
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 模拟用户数据库
# 每个用户：用户名 → {password, role, scopes}
fake_users = {
    "admin": {"password": "adminpass", "role": "admin", "scopes": ["read", "write"]},
    "alice": {"password": "alicepass", "role": "user", "scopes": ["read"]},
    "bob": {"password": "bobpass", "role": "user", "scopes": []}
}

# 创建 token
def create_token(data: dict):
    # 复制数据
    to_encode = data.copy()
    # 设置过期时间
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=30)
    # 编码
    return jwt.encode(to_encode, SECRET, algorithm=ALGORITHM)

# 用户模型
class User(BaseModel):
    username: str
    role: str
    scopes: list[str]

# 依赖：解析 token 返回 User
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 凭据异常
    exc = HTTPException(status_code=401, detail="无效凭据")
    try:
        # 解码
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        # 取用户名
        username = payload.get("sub")
        if not username:
            raise exc
    except JWTError:
        raise exc
    # 查用户
    user_data = fake_users.get(username)
    if not user_data:
        raise exc
    # 返回 User 对象
    return User(
        username=username,
        role=user_data["role"],
        scopes=user_data["scopes"]
    )

# 登录端点
@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    # 查用户
    user_data = fake_users.get(form.username)
    # 验证密码
    if not user_data or user_data["password"] != form.password:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    # 创建 token，包含 role 和 scopes
    token = create_token({
        "sub": form.username,
        "role": user_data["role"],
        "scopes": " ".join(user_data["scopes"])  # scopes 用空格拼接
    })
    return {"access_token": token, "token_type": "bearer"}

# 受保护端点：任何登录用户可访问
@app.get("/me")
def me(current: User = Depends(get_current_user)):
    return {"username": current.username, "role": current.role}

# 管理员端点：只有 admin 角色可访问
@app.get("/admin")
def admin_only(current: User = Depends(get_current_user)):
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return {"message": "欢迎管理员"}
\`\`\`

## Demo 2：测试密码错误 → 401

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用
from main import app

# fixture
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

# 测试：正确密码登录
def test_login_success(client):
    response = client.post(
        "/token",
        data={"username": "alice", "password": "alicepass"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

# 测试：错误密码
def test_login_wrong_password(client):
    response = client.post(
        "/token",
        data={"username": "alice", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "用户名或密码错误"

# 测试：不存在的用户
def test_login_no_user(client):
    response = client.post(
        "/token",
        data={"username": "nobody", "password": "whatever"}
    )
    assert response.status_code == 401
\`\`\`

## Demo 3：测试权限角色（role: admin/user）

用依赖工厂实现角色检查。

\`\`\`python
# 依赖工厂：返回一个检查角色的依赖
def require_role(role: str):
    # 定义内部依赖函数
    def dep(user = Depends(get_current_user)):
        # 检查角色是否匹配
        if user.role != role:
            # 不匹配抛 403
            raise HTTPException(status_code=403, detail=f"需要 {role} 角色")
        return user
    return dep

# 使用：用 dependencies=[Depends(...)] 声明
@app.get("/admin", dependencies=[Depends(require_role("admin"))])
def admin_endpoint():
    return {"message": "管理员专区"}

# 使用：用参数声明（可以拿到 user 对象）
@app.get("/profile")
def profile(user = Depends(require_role("user"))):
    return {"username": user.username}
\`\`\`

\`require_role\` 是一个"依赖工厂"——它接收参数（role），返回一个依赖函数。这样可以用同一个模式检查不同角色。

## Demo 4：测试普通用户访问 admin 端点 → 403

\`\`\`python
# 测试：管理员访问 admin 端点
def test_admin_access_admin(client):
    # admin 登录
    login = client.post("/token", data={"username": "admin", "password": "adminpass"})
    token = login.json()["access_token"]
    # 访问 admin 端点
    response = client.get("/admin", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

# 测试：普通用户访问 admin 端点 → 403
def test_user_cannot_access_admin(client):
    # alice 登录
    login = client.post("/token", data={"username": "alice", "password": "alicepass"})
    token = login.json()["access_token"]
    # 访问 admin 端点
    response = client.get("/admin", headers={"Authorization": f"Bearer {token}"})
    # 断言 403（禁止访问）
    assert response.status_code == 403
    # 断言错误信息
    assert "admin" in response.json()["detail"]

# 测试：未登录访问 admin 端点 → 401
def test_anonymous_cannot_access_admin(client):
    response = client.get("/admin")
    # 断言 401（未认证，连 token 都没有）
    assert response.status_code == 401
\`\`\`

注意区分 401 和 403：

- **401 Unauthorized**：没登录（没有 token 或 token 无效）——"你是谁？"
- **403 Forbidden**：登录了但没权限——"我知道你是谁，但你不能进。"

## Demo 5：测试 Scope（OAuth2 scopes）

OAuth2 scopes 是比角色更细粒度的权限控制。一个用户可以有多个 scope（如 read、write、delete）。

\`\`\`python
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
# 从 fastapi 导入 Security
from fastapi import Security

# 声明 scopes 及其描述（会显示在文档里）
oauth2 = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "read": "读取权限",
        "write": "写入权限",
        "delete": "删除权限"
    }
)

# 依赖：解析 token 并验证 scopes
def get_current_user_scopes(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2)
):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        # 从 token 取出 scopes
        token_scopes = payload.get("scopes", "").split()
    except JWTError:
        raise HTTPException(401, "无效 token")
    # 检查是否有所需 scope
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(403, f"缺少 scope: {scope}")
    return payload

# 使用 Security() 声明所需 scope
@app.get("/items", dependencies=[Security(get_current_user_scopes, scopes=["read"])])
def list_items():
    return [{"id": 1, "name": "item1"}]

@app.post("/items", dependencies=[Security(get_current_user_scopes, scopes=["write"])])
def create_item():
    return {"created": True}

@app.delete("/items/{id}", dependencies=[Security(get_current_user_scopes, scopes=["delete"])])
def delete_item(id: int):
    return {"deleted": id}
\`\`\`

\`Security()\` 和 \`Depends()\` 的区别：\`Security()\` 可以声明 \`scopes\` 参数，FastAPI 会把所需 scope 传给 \`SecurityScopes\`，由依赖函数检查。

## Demo 6：测试缺少 scope → 403

\`\`\`python
# 测试：有 read scope 的用户访问 read 端点
def test_read_with_read_scope(client):
    # alice 有 read scope
    login = client.post("/token", data={"username": "alice", "password": "alicepass"})
    token = login.json()["access_token"]
    # 访问 GET /items（需要 read）
    response = client.get("/items", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

# 测试：有 read scope 但访问 write 端点 → 403
def test_write_with_only_read_scope(client):
    # alice 只有 read
    login = client.post("/token", data={"username": "alice", "password": "alicepass"})
    token = login.json()["access_token"]
    # 访问 POST /items（需要 write）
    response = client.post("/items", headers={"Authorization": f"Bearer {token}"})
    # 断言 403
    assert response.status_code == 403

# 测试：admin 有所有 scope
def test_admin_all_scopes(client):
    login = client.post("/token", data={"username": "admin", "password": "adminpass"})
    token = login.json()["access_token"]
    # 访问 delete 端点
    response = client.delete("/items/1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

# 测试：bob 没有 scope
def test_bob_no_scopes(client):
    login = client.post("/token", data={"username": "bob", "password": "bobpass"})
    token = login.json()["access_token"]
    # 访问 read 端点 → 403
    response = client.get("/items", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
\`\`\`

## Demo 7：测试 Security() 函数 vs Depends() 的区别

\`Security()\` 和 \`Depends()\` 功能几乎一样，但 \`Security()\` 额外支持 scopes。

\`\`\`python
# 从 fastapi 导入 Depends、Security
from fastapi import Depends, Security
# 从 fastapi.security 导入 SecurityScopes
from fastapi.security import SecurityScopes

# 用 Depends：不能声明 scopes
@app.get("/dep-endpoint")
def with_depends(user = Depends(get_current_user)):
    return {"user": user.username}

# 用 Security：可以声明 scopes
@app.get("/sec-endpoint")
def with_security(
    user = Security(get_current_user_scopes, scopes=["read"])
):
    return {"user": user}

# Security 不带 scopes 时，行为和 Depends 一样
@app.get("/sec-no-scope")
def sec_no_scope(
    user = Security(get_current_user)  # 等同于 Depends
):
    return {"user": user}
\`\`\`

测试代码：

\`\`\`python
# 测试 Security 和 Depends 的行为
def test_depends_works(client):
    login = client.post("/token", data={"username": "alice", "password": "alicepass"})
    token = login.json()["access_token"]
    response = client.get("/dep-endpoint", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_security_no_scope_works(client):
    login = client.post("/token", data={"username": "alice", "password": "alicepass"})
    token = login.json()["access_token"]
    response = client.get("/sec-no-scope", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_security_with_scope_checks(client):
    login = client.post("/token", data={"username": "alice", "password": "alicepass"})
    token = login.json()["access_token"]
    # alice 有 read scope
    response = client.get("/sec-endpoint", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
\`\`\`

## HTTP 401 vs 403 区别

| 状态码 | 含义 | 场景 | 类比 |
|--------|------|------|------|
| 401 Unauthorized | 未认证 | 没 token、token 无效、token 过期 | "你是谁？先出示证件" |
| 403 Forbidden | 已认证但无权限 | 角色不够、缺少 scope | "我知道你是谁，但你不能进" |

**判断逻辑：**

1. 先检查有没有 token → 没有返回 401。
2. 再检查 token 是否有效 → 无效返回 401。
3. 最后检查有没有权限 → 没权限返回 403。

\`\`\`python
# 典型的认证+授权流程
def endpoint(user = Depends(get_current_user)):  # 401 在这里抛
    if user.role != "admin":                      # 403 在这里抛
        raise HTTPException(403)
    return {"data": "secret"}
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| OAuth2PasswordBearer | 从 Authorization 头提取 token，无则 401 |
| OAuth2PasswordRequestForm | 解析表单：username、password、scope |
| require_role 工厂 | 返回检查特定角色的依赖函数 |
| 401 vs 403 | 401=未认证，403=无权限 |
| Security() | 类似 Depends()，但支持 scopes 参数 |
| SecurityScopes | 自动注入的所需 scope 列表 |
| scopes 声明 | OAuth2PasswordBearer(scopes={...}) |
| scope 检查 | 遍历 SecurityScopes.scopes，逐一验证 |
| 依赖工厂模式 | 用闭包参数化依赖 |
| 权限测试 | 分别测 admin、user、anonymous 三种角色 |
`,
  },
  // ============================================================
  // 第 5 章：测试依赖覆盖认证
  // ============================================================
  {
    id: "ft-deps-override",
    group: "测试数据库与认证",
    icon: "🎭",
    title: "测试依赖覆盖认证",
    content: `# 测试依赖覆盖认证

## 为什么测试时不要真的登录

生活类比：你在测试一辆汽车的刹车系统。你不需要先"考驾照"（真登录），只需要把车架起来，直接测刹车片（覆盖认证）。真的考驾照太慢了，而且和测刹车无关。

前面几章我们测试认证时，每个测试都要：POST /token 登录 → 拿 token → 带 token 访问。这有几个问题：

1. **慢**：每个测试都要走完整的登录流程。
2. **依赖外部**：如果登录逻辑变了，所有测试都受影响。
3. **不可控**：你想测"管理员场景"，但测试用户库里没有管理员，就得先创建。
4. **测不到边界**：比如"用户 role 是 None"的情况，真实登录很难构造。

解决方案：**用 \`app.dependency_overrides\` 覆盖认证依赖，直接返回模拟用户。** 这是测试认证的"金钥匙"。

## app.dependency_overrides 覆盖认证依赖

FastAPI 的依赖注入系统支持"覆盖"——你可以用一个新的函数替换原来的依赖函数。测试时，把 \`get_current_user\` 替换成"直接返回模拟用户"的函数，就跳过了真正的认证逻辑。

\`\`\`python
# app.dependency_overrides 是一个字典
# key 是原始依赖函数，value 是替换函数
app.dependency_overrides[get_current_user] = override_function

# 清除所有覆盖
app.dependency_overrides.clear()

# 清除特定覆盖
del app.dependency_overrides[get_current_user]
\`\`\`

覆盖后，所有用 \`Depends(get_current_user)\` 的路由，都会调用 \`override_function\` 而不是原来的 \`get_current_user\`。

## Demo 1：原始认证依赖（解析 JWT）

先回顾原始的认证依赖。这是我们要覆盖的目标。

\`\`\`python
# 从 fastapi 导入 FastAPI、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer
# 从 jose 导入 jwt、JWTError
from jose import jwt, JWTError
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# OAuth2 方案
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 密钥
SECRET = "secret"
ALGORITHM = "HS256"

# 用户模型
class User(BaseModel):
    id: int
    username: str
    role: str = "user"

# 原始认证依赖：解析 JWT token
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 凭据异常
    exc = HTTPException(401, "无效凭据", {"WWW-Authenticate": "Bearer"})
    try:
        # 解码 token
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        # 取用户 id
        user_id = payload.get("sub")
        if not user_id:
            raise exc
    except JWTError:
        raise exc
    # 实际项目这里会查数据库
    # 为了演示，直接构造 User
    return User(id=int(user_id), username=f"user{user_id}", role="user")

# 受保护端点
@app.get("/me")
def me(current: User = Depends(get_current_user)):
    return {"id": current.id, "username": current.username, "role": current.role}

# 管理员端点
@app.get("/admin")
def admin(current: User = Depends(get_current_user)):
    if current.role != "admin":
        raise HTTPException(403, "需要管理员权限")
    return {"message": "欢迎管理员"}
\`\`\`

如果真要测这个，得先登录拿 token。下面我们用依赖覆盖跳过登录。

## Demo 2：覆盖 get_current_user 返回模拟用户

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用和依赖
from main import app, get_current_user, User

# fixture：提供 client，并覆盖认证
@pytest.fixture
def client():
    # 定义覆盖函数：直接返回模拟用户
    def override_user():
        # 不需要 token，直接返回一个 User
        return User(id=1, username="testuser", role="user")
    # 注册覆盖
    app.dependency_overrides[get_current_user] = override_user
    # 创建 client
    with TestClient(app) as c:
        yield c
    # 清除覆盖（重要！避免影响其他测试）
    app.dependency_overrides.clear()

# 测试：访问 /me，不需要 token
def test_me(client):
    # 注意：不带 Authorization 头！
    response = client.get("/me")
    # 断言成功（认证被跳过了）
    assert response.status_code == 200
    # 断言返回的是模拟用户
    assert response.json()["username"] == "testuser"
    assert response.json()["id"] == 1

# 测试：普通用户访问 admin → 403
def test_user_cannot_access_admin(client):
    response = client.get("/admin")
    # 模拟用户 role="user"，所以 403
    assert response.status_code == 403
\`\`\`

**关键点：**

1. \`app.dependency_overrides[get_current_user] = override_user\` 把原依赖替换掉。
2. \`override_user\` 不接收参数（因为 \`oauth2_scheme\` 也不再被调用），直接返回 User。
3. 测试结束必须 \`app.dependency_overrides.clear()\`，否则覆盖会泄漏到其他测试。

## Demo 3：用 fixture 管理不同角色用户

不同测试需要不同角色的用户。用参数化 fixture 管理。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用
from main import app, get_current_user, User

# fixture：以管理员身份测试
@pytest.fixture
def as_admin():
    # 覆盖为 admin 用户
    app.dependency_overrides[get_current_user] = lambda: User(id=1, username="admin", role="admin")
    yield
    # 清除
    app.dependency_overrides.clear()

# fixture：以普通用户身份测试
@pytest.fixture
def as_user():
    # 覆盖为普通用户
    app.dependency_overrides[get_current_user] = lambda: User(id=2, username="alice", role="user")
    yield
    app.dependency_overrides.clear()

# fixture：未登录（覆盖返回 None 或抛 401）
@pytest.fixture
def as_anonymous():
    # 覆盖为抛 401
    from fastapi import HTTPException
    def raise_401():
        raise HTTPException(401, "未登录")
    app.dependency_overrides[get_current_user] = raise_401
    yield
    app.dependency_overrides.clear()

# fixture：提供 client（不覆盖认证）
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
    # 确保清除
    app.dependency_overrides.clear()

# 测试：管理员访问 admin 端点
def test_admin_can_access_admin(client, as_admin):
    # as_admin fixture 已把认证覆盖为 admin
    response = client.get("/admin")
    assert response.status_code == 200
    assert "管理员" in response.json()["message"]

# 测试：普通用户访问 admin 端点 → 403
def test_user_cannot_access_admin(client, as_user):
    response = client.get("/admin")
    assert response.status_code == 403

# 测试：未登录访问 → 401
def test_anonymous_cannot_access(client, as_anonymous):
    response = client.get("/me")
    assert response.status_code == 401
\`\`\`

这种模式的优雅之处：测试函数只声明 \`as_admin\` 或 \`as_user\`，就知道当前是什么身份。代码读起来像自然语言。

## Demo 4：测试 admin 端点（用 as_admin fixture）

\`\`\`python
# 测试：管理员访问各种端点
def test_admin_me(client, as_admin):
    response = client.get("/me")
    assert response.status_code == 200
    assert response.json()["role"] == "admin"

def test_admin_admin(client, as_admin):
    response = client.get("/admin")
    assert response.status_code == 200

# 测试：普通用户
def test_user_me(client, as_user):
    response = client.get("/me")
    assert response.status_code == 200
    assert response.json()["role"] == "user"

def test_user_admin_403(client, as_user):
    response = client.get("/admin")
    assert response.status_code == 403

# 参数化测试：一次测多种角色
@pytest.mark.parametrize("fixture_name,endpoint,expected_status", [
    ("as_admin", "/me", 200),
    ("as_admin", "/admin", 200),
    ("as_user", "/me", 200),
    ("as_user", "/admin", 403),
])
def test_access_control(client, request, fixture_name, endpoint, expected_status):
    # request.getfixturevalue 动态获取 fixture
    request.getfixturevalue(fixture_name)
    response = client.get(endpoint)
    assert response.status_code == expected_status
\`\`\`

参数化测试里，\`request.getfixturevalue(fixture_name)\` 可以动态激活指定名称的 fixture，非常灵活。

## Demo 5：测试未登录（覆盖返回 None 或抛 401）

模拟未登录场景：覆盖 \`get_current_user\` 让它抛 401。

\`\`\`python
# fixture：未登录
@pytest.fixture
def as_anonymous():
    # 从 fastapi 导入 HTTPException
    from fastapi import HTTPException
    # 覆盖函数：直接抛 401
    def no_user():
        raise HTTPException(status_code=401, detail="未登录")
    # 注册覆盖
    app.dependency_overrides[get_current_user] = no_user
    yield
    app.dependency_overrides.clear()

# 测试：未登录访问 /me → 401
def test_anonymous_me(client, as_anonymous):
    response = client.get("/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "未登录"

# 测试：未登录访问 /admin → 401（不是 403！）
def test_anonymous_admin(client, as_anonymous):
    response = client.get("/admin")
    # 认证依赖先抛 401，根本到不了权限检查
    assert response.status_code == 401
\`\`\`

**注意：** 未登录时应该返回 401 而不是 403。因为权限检查（403）是在认证通过后才发生的。覆盖函数抛 401，相当于模拟"没有有效 token"。

## Demo 6：覆盖多层依赖链

实际项目里，依赖往往是链式的：\`get_db\` → \`get_current_user\` → \`require_admin\`。可以覆盖链中的任意一环。

\`\`\`python
# 假设有这样的依赖链
# get_db: 返回数据库会话
# get_current_user: 依赖 get_db，查数据库验证 token
# require_admin: 依赖 get_current_user，检查角色

# 从 fastapi 导入 Depends
from fastapi import Depends
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 依赖 1：数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 依赖 2：当前用户（依赖 db 和 token）
def get_current_user(db = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # 查数据库验证 token
    payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    user = db.query(User).filter(User.id == payload["sub"]).first()
    return user

# 依赖 3：要求管理员
def require_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(403, "需要管理员")
    return user

# 路由
@app.get("/admin")
def admin(user = Depends(require_admin)):
    return {"user": user.username}
\`\`\`

测试时，可以只覆盖 \`get_current_user\`（跳过数据库和 token），也可以直接覆盖 \`require_admin\`。

\`\`\`python
# 方式一：覆盖 get_current_user（保留 require_admin 的权限检查）
def test_with_user_override(client):
    # 覆盖 get_current_user 返回普通用户
    app.dependency_overrides[get_current_user] = lambda: User(id=1, role="user")
    # require_admin 还会执行，检查 role
    response = client.get("/admin")
    assert response.status_code == 403  # 普通用户被拒
    # 清除
    app.dependency_overrides.clear()

# 方式二：覆盖 require_admin（跳过所有检查）
def test_with_admin_override(client):
    # 直接覆盖 require_admin，返回管理员
    admin_user = User(id=1, username="admin", role="admin")
    app.dependency_overrides[require_admin] = lambda: admin_user
    # 此时 get_current_user 也不会被调用
    response = client.get("/admin")
    assert response.status_code == 200
    app.dependency_overrides.clear()

# 方式三：覆盖 get_db（用内存库，保留认证逻辑）
def test_with_db_override(client):
    # 用内存库替换 get_db
    def get_test_db():
        # 返回测试用的内存库 session
        test_session = SessionLocal()
        try:
            yield test_session
        finally:
            test_session.close()
    app.dependency_overrides[get_db] = get_test_db
    # 此时认证逻辑会执行，但用的是测试库
    # 还需要提供有效的 token 才能通过
    app.dependency_overrides.clear()
\`\`\`

**覆盖层级选择：**

- 覆盖最底层（\`get_current_user\`）：保留上层权限检查，最常用。
- 覆盖最顶层（\`require_admin\`）：跳过所有检查，适合测路由本身。
- 覆盖中间层（\`get_db\`）：保留认证逻辑，只换数据库。

## Demo 7：部分覆盖（只覆盖认证，保留数据库）

有时候你想测"带真实数据库，但跳过认证"。这时只覆盖认证依赖，保留 \`get_db\`。

\`\`\`python
# 导入 pytest
import pytest
# 导入 TestClient
from fastapi.testclient import TestClient
# 导入应用和依赖
from main import app, get_current_user, get_db, User, Base, engine, SessionLocal

# fixture：建表
@pytest.fixture(scope="session")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# fixture：只覆盖认证，不覆盖数据库
@pytest.fixture
def client_with_fake_auth(setup_db):
    # 只覆盖 get_current_user，get_db 保持原样
    # 这样路由里的数据库操作是真实的，但认证是假的
    test_user = User(id=1, username="alice", role="user")
    app.dependency_overrides[get_current_user] = lambda: test_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

# 测试：创建数据（认证是假的，但数据库是真的）
def test_create_and_query(client_with_fake_auth):
    # 假设有个 POST /items 端点，需要登录
    # 认证被覆盖，所以不需要 token
    create_resp = client_with_fake_auth.post(
        "/items",
        json={"name": "测试商品"}
    )
    assert create_resp.status_code == 200
    item_id = create_resp.json()["id"]
    # 查询（数据库是真实的，数据真的存进去了）
    get_resp = client_with_fake_auth.get(f"/items/{item_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "测试商品"

# fixture：用不同的模拟用户
@pytest.fixture
def client_as_admin(setup_db):
    admin_user = User(id=99, username="admin", role="admin")
    app.dependency_overrides[get_current_user] = lambda: admin_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_admin_create(client_as_admin):
    # 以管理员身份创建
    response = client_as_admin.post("/items", json={"name": "管理员商品"})
    assert response.status_code == 200
\`\`\`

这种"部分覆盖"非常实用：

- **认证覆盖**：跳过 JWT 解码，直接给用户。
- **数据库保留**：用真实的（内存）数据库，测真实的数据流。

这样测试既快（不用登录）又真实（数据库是真的）。

## 依赖覆盖 vs 真实登录 对比

| 维度 | 依赖覆盖 | 真实登录 |
|------|----------|----------|
| 速度 | 快（跳过登录） | 慢（走完整流程） |
| 隔离性 | 高（不受登录逻辑影响） | 低（登录变了测试就挂） |
| 可控性 | 高（随意构造用户） | 低（受限于用户库） |
| 真实性 | 低（没测登录本身） | 高（端到端） |
| 适合测试 | 单元测试、路由测试 | 集成测试、E2E 测试 |
| 代码量 | 少（fixture 即可） | 多（每次要登录） |
| 边界场景 | 容易（构造任意 User） | 难（要准备数据） |

**最佳实践：**

1. **单元测试**：用依赖覆盖，快、可控。
2. **集成测试**：用真实登录，验证端到端流程。
3. **两者都要**：覆盖测路由逻辑，真实登录测认证流程本身。
4. **认证逻辑测试**：单独写测试验证 \`get_current_user\`、\`create_token\` 等，不要覆盖它们。

## 本章小结

| 知识点 | 要点 |
|--------|------|
| dependency_overrides | 字典，key=原依赖，value=替换函数 |
| 覆盖认证 | 替换 get_current_user，跳过 JWT 解码 |
| 清除覆盖 | 测试后调用 clear()，避免泄漏 |
| 角色 fixture | as_admin、as_user、as_anonymous |
| 未登录模拟 | 覆盖函数抛 401 |
| 多层依赖链 | 可覆盖任意一环 |
| 部分覆盖 | 只覆盖认证，保留数据库 |
| getfixturevalue | 参数化测试中动态激活 fixture |
| 覆盖 vs 真实 | 单元测试用覆盖，集成测试用真实 |
| 最佳实践 | 认证逻辑单独测，路由用覆盖 |
`,
  },
];
