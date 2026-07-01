// =============================================================
// FastAPI 应用开发实战 - 第十三批章节(测试,共 4 章)
// 章节 49-52:TestClient 测试基础 / pytest 与 fixtures / Mock 与依赖覆盖 / 覆盖率与持续测试
// =============================================================

export const chapters = [
  // =============================================================
  // 第四十九章:TestClient 测试基础
  // =============================================================
  {
    id: 'test-testclient',
    group: '测试',
    icon: '🧪',
    title: 'TestClient 测试基础',
    content: `## 第四十九章　TestClient 测试基础

### 49.1 为什么一定要写测试

很多人觉得"接口跑通了就行了,写测试浪费时间",这种想法在项目小的时候似乎没问题,但只要项目一旦长大、要重构、要多人协作,立刻会暴露问题:

- **改了 A 接口,不知道有没有把 B 接口改坏**:没有测试,你只能手动点一遍所有功能,既慢又容易漏;
- **重构没有底气**:明明只是想优化一段代码,却不敢动,因为没有测试告诉你"改完之后行为还和以前一样";
- **回归 bug 反复出现**:今天修好的 bug,下个月又出现了,因为没人记得当初为什么这么写;
- **新人接手不敢动**:没有测试的代码,新人改一行都要提心吊胆。

> 一句话:**测试不是"证明代码没问题",而是"给未来的自己留一张安全网"**。它的价值不在写它的当下,而在你三个月后回来改代码的那一秒。

### 49.2 TestClient 是什么

\`TestClient\` 是 Starlette 提供的测试客户端,在 FastAPI 里直接从 \`fastapi.testclient\` 导入。它的核心特性:

- **不需要真正启动服务器**:它直接在内存里模拟 HTTP 请求,调用你的 ASGI app,绕过了网络层;
- **不需要监听端口**:省去了"启动 uvicorn → 等端口就绪 → 发请求"的麻烦;
- **速度快**:因为没走网络,一次请求就是一次函数调用;
- **底层用 \`httpx\`**:API 风格和 \`requests\` / \`httpx\` 几乎一样,学习成本低。

> 对比:如果你用 \`requests\` 测试,必须先 \`uvicorn main:app\` 启动服务器,测试才能连上,既慢又要在 CI 里额外管理进程。TestClient 把这一切省了。

### 49.3 最简单的测试

\`\`\`python
# main.py —— 被测的应用
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"msg": "hello"}

# test_main.py —— 测试代码
from fastapi.testclient import TestClient
from main import app

# 1. 用 app 创建一个测试客户端
client = TestClient(app)

def test_root():
    # 2. 像发真实请求一样调用 client.get
    response = client.get("/")
    # 3. 断言状态码
    assert response.status_code == 200
    # 4. 断言返回的 JSON
    assert response.json() == {"msg": "hello"}
\`\`\`

运行测试:\`pytest test_main.py\`,如果断言全过,会显示绿色 \`.\`。

### 49.4 测试各种 HTTP 方法

TestClient 对所有 HTTP 方法都做了封装,签名和 \`httpx\` 一致:

\`\`\`python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get():
    # GET 请求,query 参数用 params
    r = client.get("/items", params={"skip": 0, "limit": 10})
    assert r.status_code == 200

def test_post():
    # POST 请求,请求体用 json
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    assert r.status_code == 201
    assert r.json()["name"] == "苹果"

def test_put():
    # PUT 请求,路径参数拼在 url 里
    r = client.put("/items/1", json={"name": "香蕉", "price": 3.0})
    assert r.status_code == 200

def test_delete():
    r = client.delete("/items/1")
    assert r.status_code == 204
\`\`\`

**关键参数对照表:**

| 参数 | 用途 | 示例 |
| --- | --- | --- |
| \`params\` | query string 参数 | \`client.get("/x", params={"page": 1})\` |
| \`json\` | JSON 请求体(自动加 \`Content-Type\`) | \`client.post("/x", json={"a": 1})\` |
| \`headers\` | 请求头 | \`client.get("/x", headers={"X-Token": "abc"})\` |
| \`cookies\` | Cookie | \`client.get("/x", cookies={"sid": "xxx"})\` |
| \`files\` | 上传文件 | \`client.post("/upload", files={"f": b"..."})\` |

### 49.5 测试参数校验(422)

FastAPI 的强项是自动校验,测试时一定要覆盖"传错参数"的场景,确保它真的返回 422:

\`\`\`python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_item_missing_name():
    # 故意少传 name 字段,应该被 Pydantic 拦下
    r = client.post("/items", json={"price": 5.5})  # 缺 name
    assert r.status_code == 422  # Unprocessable Entity
    # 422 的响应体里有详细的错误信息,可以进一步断言
    detail = r.json()["detail"][0]
    assert detail["loc"] == ["body", "name"]   # 错误位置在 body.name
    assert detail["type"] == "missing"          # 类型是"缺失"

def test_create_item_negative_price():
    # 价格传负数,应该被校验拦截
    r = client.post("/items", json={"name": "苹果", "price": -1})
    assert r.status_code == 422
    assert "greater_than_equal" in r.json()["detail"][0]["type"]
\`\`\`

> 易错点:很多人只测"正常传参能成功",不测"错误传参被拦截"。后者恰恰是 Pydantic 校验的核心价值,必须测。

### 49.6 测试带认证的接口

需要 token 的接口,测试时把 token 放进请求头即可。先看一个完整的认证接口:

\`\`\`python
# main.py
from fastapi import FastAPI, Depends, Header, HTTPException

app = FastAPI()

# 模拟一个"校验 token"的依赖
def verify_token(x_token: str = Header(...)):
    if x_token != "secret-token":
        raise HTTPException(status_code=401, detail="token 无效")
    return x_token

@app.get("/profile")
def get_profile(token: str = Depends(verify_token)):
    return {"user": "小明", "token": token}
\`\`\`

测试时直接把正确/错误的 token 塞进 header:

\`\`\`python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_profile_with_valid_token():
    r = client.get("/profile", headers={"X-Token": "secret-token"})
    assert r.status_code == 200
    assert r.json()["user"] == "小明"

def test_profile_without_token():
    # 不带 token,因为 Header(...) 是必填,会被 FastAPI 拦成 422
    r = client.get("/profile")
    assert r.status_code == 422

def test_profile_with_wrong_token():
    # 带 token 但值不对,被业务逻辑拦成 401
    r = client.get("/profile", headers={"X-Token": "wrong"})
    assert r.status_code == 401
    assert r.json()["detail"] == "token 无效"
\`\`\`

### 49.7 完整的 CRUD 测试示例

下面是一个"内存版"的 CRUD 应用 + 完整测试,涵盖了 GET/POST/PUT/DELETE、404、422:

\`\`\`python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

# 内存存储,测试时每次启动都是空的
_db: dict[int, dict] = {}
_next_id = 1

class Item(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)

class ItemOut(BaseModel):
    id: int
    name: str
    price: float

@app.get("/items", response_model=list[ItemOut])
def list_items():
    return list(_db.values())

@app.post("/items", response_model=ItemOut, status_code=201)
def create_item(item: Item):
    global _next_id
    saved = {"id": _next_id, **item.model_dump()}
    _db[_next_id] = saved
    _next_id += 1
    return saved

@app.get("/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    if item_id not in _db:
        raise HTTPException(status_code=404, detail="item 不存在")
    return _db[item_id]

@app.put("/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, item: Item):
    if item_id not in _db:
        raise HTTPException(status_code=404, detail="item 不存在")
    _db[item_id].update(item.model_dump())
    return _db[item_id]

@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    if item_id not in _db:
        raise HTTPException(status_code=404, detail="item 不存在")
    del _db[item_id]
\`\`\`

\`\`\`python
# test_crud.py
from fastapi.testclient import TestClient
from main import app, _db

client = TestClient(app)

def setup_function():
    """每个测试函数跑前清空内存,保证互不影响。"""
    _db.clear()

def test_create_item():
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    assert r.status_code == 201
    data = r.json()
    assert data["id"] == 1
    assert data["name"] == "苹果"

def test_create_item_invalid():
    # 价格为 0,违反 gt=0
    r = client.post("/items", json={"name": "苹果", "price": 0})
    assert r.status_code == 422

def test_list_items():
    client.post("/items", json={"name": "苹果", "price": 5.5})
    client.post("/items", json={"name": "香蕉", "price": 3.0})
    r = client.get("/items")
    assert r.status_code == 200
    assert len(r.json()) == 2

def test_get_item_not_found():
    r = client.get("/items/999")
    assert r.status_code == 404

def test_update_then_delete():
    # 先创建
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    item_id = r.json()["id"]
    # 再更新
    r = client.put(f"/items/{item_id}", json={"name": "红富士", "price": 6.0})
    assert r.status_code == 200
    assert r.json()["name"] == "红富士"
    # 再删除
    r = client.delete(f"/items/{item_id}")
    assert r.status_code == 204
    # 删完查不到
    assert client.get(f"/items/{item_id}").status_code == 404
\`\`\`

注意上面的 \`f"/items/{item_id}"\` 是 Python 的 f-string,花括号是单个 \`{}\`,不是 JS 的 \`\${}\`,所以放在模板字符串里不会冲突。

### 49.8 响应断言常用技巧

| 断言目标 | 怎么写 | 说明 |
| --- | --- | --- |
| 状态码 | \`assert r.status_code == 200\` | 最基础的断言 |
| JSON 全等 | \`assert r.json() == {...}\` | 适合返回结构稳定时 |
| JSON 字段 | \`assert r.json()["id"] == 1\` | 只关心关键字段 |
| 响应头 | \`assert r.headers["content-type"] == "application/json"\` | 检查返回类型 |
| 文本包含 | \`assert "成功" in r.text\` | 适合非 JSON 返回 |
| 响应时间 | \`assert r.elapsed.total_seconds() < 1.0\` | 性能断言(谨慎) |

### 49.9 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 测试间共享状态没清空 | 第一个测试改了数据,第二个测试莫名失败 | 用 \`setup_function\` 或 fixture 清理 |
| 只测正常路径 | 边界错误没人管,线上翻车 | 必测 422、404、401 |
| \`assert r.json()\` 不判 \`status_code\` | 接口报错了还以为对 | 先断言状态码再断言体 |
| 用 \`requests\` 测必须启动服务器 | 慢、CI 难管理 | 用 \`TestClient\` 内存调用 |
| 测试里写 \`print\` 调试 | 看不到,被 pytest 吞 | 用 \`-s\` 参数或 \`pytest -rP\` |
| 测试依赖执行顺序 | 换个顺序就挂 | 每个测试独立,不依赖前一个 |

> **本章小结**:TestClient 让测试 FastAPI 像调函数一样简单——不用起服务器,直接 \`client.get/post\`。测试要覆盖正常路径、错误路径(422/404/401)和 CRUD 全流程。下一章我们用 pytest 把这些测试组织得更优雅。`,
  },

  // =============================================================
  // 第五十章:pytest 与 fixtures
  // =============================================================
  {
    id: 'test-pytest',
    group: '测试',
    icon: '🧹',
    title: 'pytest 与 fixtures',
    content: `## 第五十章　pytest 与 fixtures

### 50.1 pytest 是什么

pytest 是 Python 生态里事实上的测试框架标准。对比 Python 自带的 \`unittest\`,它有几个明显优势:

| 维度 | unittest | pytest |
| --- | --- | --- |
| 断言写法 | \`self.assertEqual(a, b)\` | \`assert a == b\`(原生 assert) |
| 测试发现 | 要继承 \`TestCase\` | 函数名以 \`test_\` 开头即可 |
| 夹具复用 | \`setUp/tearDown\` 写在类里 | \`fixture\` 跨文件复用 |
| 参数化 | 自己写循环 | \`@pytest.mark.parametrize\` 一行搞定 |
| 插件生态 | 弱 | 丰富(cov、async、mock 等) |
| 失败信息 | 简陋 | 详细到行,自动 diff |

> 一个直观对比:同一个断言,unittest 要 \`self.assertEqual(response.status_code, 200)\`,pytest 只要 \`assert response.status_code == 200\`。后者更接近"自然语言"。

### 50.2 安装

\`\`\`bash
# pytest 本体 + 用来支持 TestClient 的 httpx
pip install pytest httpx

# 测试 FastAPI 还需要这个,让 TestClient 能用 httpx
pip install fastapi[all]
\`\`\`

### 50.3 第一个 pytest 测试

pytest 的发现规则:

- 文件名以 \`test_\` 开头或 \`_test\` 结尾(默认 \`test_*.py\`);
- 函数名以 \`test_\` 开头;
- 类名以 \`Test\` 开头(类里不能有 \`__init__\`)。

\`\`\`python
# test_demo.py
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def root():
    return {"hello": "world"}

client = TestClient(app)

# 只要函数名是 test_ 开头,pytest 就会自动跑
def test_root_returns_world():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"hello": "world"}
\`\`\`

运行:\`pytest\` 会自动找当前目录下所有 \`test_*.py\`。

### 50.4 fixture:测试夹具是什么

**fixture 是 pytest 最强大的特性,本质就是"测试前的准备工作 + 测试后的清理工作"的复用单元。**

为什么要它:

- 每个测试都要 \`TestClient(app)\` 这一步,重复写十遍很烦;
- 测试数据库要建表、删表,每次都写一遍太累;
- 测试用的假数据、配置,想统一管理。

fixture 把这些"准备好的东西"集中定义,测试函数只要"声明我要用哪个 fixture",pytest 会自动注入。

### 50.5 写第一个 fixture

\`\`\`python
# conftest.py —— pytest 会自动发现这个文件,里面的 fixture 全局可用
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """每个测试函数都能用的 TestClient。"""
    # 准备阶段:创建客户端
    c = TestClient(app)
    # yield 之前是"准备",之后是"清理"
    yield c
    # 清理阶段:这里可以关连接、删数据等
    # 这个例子没有需要清理的
\`\`\`

\`\`\`python
# test_items.py
def test_list_items(client):   # 参数名 client 会被 pytest 自动注入
    r = client.get("/items")
    assert r.status_code == 200
\`\`\`

**关键点:fixture 的名字就是参数名**。测试函数声明一个叫 \`client\` 的参数,pytest 就去找叫 \`client\` 的 fixture,把它的返回值(或 yield 出来的值)注入进来。

### 50.6 fixture 的 scope(作用域)

fixture 不是每次都重新创建,\`scope\` 控制它"多久创建一次":

\`\`\`python
@pytest.fixture(scope="function")  # 默认,每个测试函数都新建一次
def db():
    ...

@pytest.fixture(scope="module")   # 每个 .py 文件只创建一次
def db():
    ...

@pytest.fixture(scope="session")  # 整个测试会话只创建一次(从 pytest 启动到结束)
def db():
    ...
\`\`\`

**scope 对照表:**

| scope | 创建时机 | 适用场景 |
| --- | --- | --- |
| \`function\`(默认) | 每个测试函数前 | 需要完全隔离的数据 |
| \`class\` | 每个测试类前 | 同一类共享状态 |
| \`module\` | 每个 .py 文件前 | 重的资源(建表) |
| \`session\` | 整个测试会话一次 | 连接池、模型加载 |

> 经验:**数据隔离用 function,重资源用 session**。比如数据库连接池可以 session 级(建一次就够),但每个测试的数据要 function 级清空,否则测试互相污染。

### 50.7 数据库测试隔离(事务回滚)

测试数据库最怕"上一个测试插入的数据影响下一个测试"。标准做法是**每个测试跑在一个事务里,跑完回滚**:

\`\`\`python
# conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from main import app, get_db

# 用一个独立的测试数据库(别和生产混用!)
TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(bind=engine)

@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """整个测试会话开始时建表,结束时删表。"""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db():
    """每个测试函数用一个独立事务,跑完回滚。"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSession(bind=connection)
    yield session
    session.close()
    transaction.rollback()   # 关键:回滚,数据不真正写入
    connection.close()

@pytest.fixture
def client(db):
    """把上面的 db 注入到 FastAPI 里,覆盖 get_db 依赖。"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
\`\`\`

\`\`\`python
# test_users.py
def test_create_and_query(client):
    client.post("/users", json={"name": "小明"})
    r = client.get("/users")
    assert len(r.json()) == 1   # 因为事务回滚,别的测试不会污染这里

def test_empty(client):
    # 上面那个测试插的数据已经回滚了,这里应该是空的
    r = client.get("/users")
    assert r.json() == []
\`\`\`

> 这就是"测试隔离"的核心:**每个测试都看到一个干净的数据库,互不干扰**。靠的就是 \`transaction.rollback()\`。

### 50.8 参数化测试:一次写多种情况

同一个逻辑想测多种输入?不要复制粘贴十个测试函数,用 \`@pytest.mark.parametrize\`:

\`\`\`python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 第一个参数是参数名列表,第二个是数据列表
@pytest.mark.parametrize("price, should_pass", [
    (0.01, True),     # 正常价格
    (1.0, True),      # 正常价格
    (0, False),       # 价格为 0,违反 gt=0
    (-5, False),      # 负价格,违反 gt=0
])
def test_create_item_price_validation(price, should_pass):
    r = client.post("/items", json={"name": "x", "price": price})
    if should_pass:
        assert r.status_code == 201
    else:
        assert r.status_code == 422
\`\`\`

pytest 会自动生成 4 个测试用例,在报告里你还能看到每个用例的具体参数值,失败的能立刻定位是哪组数据挂了。

### 50.9 fixture 之间互相依赖

fixture 可以依赖别的 fixture,pytest 会按依赖顺序自动注入:

\`\`\`python
@pytest.fixture
def db():
    """建一个 db session。"""
    return make_session()

@pytest.fixture
def user(db):   # 依赖 db fixture
    """在 db 里插一个测试用户。"""
    return create_user(db, name="小明")

def test_get_user(user):   # 拿到的是已经建好的用户
    assert user.name == "小明"
\`\`\`

### 50.10 conftest.py 的作用域

\`conftest.py\` 是 pytest 的"共享配置文件",放在哪个目录就对该目录及子目录生效:

\`\`\`
project/
├── conftest.py          # 全局 fixture,所有测试都能用
├── tests/
│   ├── conftest.py      # 只对 tests/ 下生效
│   ├── test_auth.py
│   └── api/
│       ├── conftest.py  # 只对 api/ 下生效
│       └── test_items.py
\`\`\`

> 不需要 \`import\`,pytest 自动发现。这是 fixture 跨文件复用的关键。

### 50.11 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| fixture 名和参数名不一致 | 报错"未知的 fixture" | 参数名必须和 fixture 名完全一致 |
| 用了 \`return\` 又想清理 | 清理代码不执行 | 清理必须用 \`yield\`,yield 之后才执行 |
| scope 选错 | session 级数据被改,后面测试全挂 | 数据用 function 级,资源用 session 级 |
| 测试数据库和生产混用 | 测试把生产数据删了 | 永远用独立的测试数据库 URL |
| 忘了 \`app.dependency_overrides.clear()\` | 后面测试还用着 mock | fixture 结尾必须清理 override |
| 参数化数据写错 | 参数对不上,报错 | 参数名和数据顺序要对应 |

> **本章小结**:pytest + fixture 让测试代码从"重复劳动"变成"组装零件":fixture 是可复用的零件,测试函数只是把它们拼起来。重点掌握 scope(隔离粒度)、yield(准备+清理)、conftest.py(共享)。下一章讲怎么用 Mock 把外部依赖"假装"掉。`,
  },

  // =============================================================
  // 第五十一章:Mock 与依赖覆盖
  // =============================================================
  {
    id: 'test-mock',
    group: '测试',
    icon: '🎭',
    title: 'Mock 与依赖覆盖',
    content: `## 第五十一章　Mock 与依赖覆盖

### 51.1 为什么需要 Mock

测试有三个原则:**快、稳、独立**。但如果你的测试直接连真实数据库、调真实第三方 API,这三个原则全毁了:

- **慢**:每次测试都连 MySQL,要几百毫秒;调外部支付接口更慢;
- **不稳**:第三方 API 偶尔抽风、限流,你的测试就 flaky(时好时坏);
- **不独立**:测试改了真实数据库的数据,污染生产;外部 API 调一次少一次额度。

**Mock 的本质:把"真实的外部依赖"换成"假装的、可控的替身",让测试只关心你自己的代码逻辑。**

> 类比:你要测试"外卖骑手送餐"的流程,不需要真叫一份外卖,只要有个"假骑手"按你说的剧本走就行。Mock 就是那个"假骑手"。

### 51.2 FastAPI 专属:依赖覆盖

FastAPI 提供了一个超好用的机制:\`app.dependency_overrides\`。前面我们讲依赖注入时说过,\`Depends\` 让依赖可替换,这个特性在测试时最能发挥作用。

举个例子,你的应用用 \`get_db\` 依赖拿到数据库 session:

\`\`\`python
# main.py
from fastapi import FastAPI, Depends

app = FastAPI()

def get_db():
    """生产依赖:连真实 MySQL。"""
    db = create_mysql_session()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{user_id}")
def get_user(user_id: int, db = Depends(get_db)):
    return db.get(User, user_id)
\`\`\`

测试时不想连 MySQL,可以用 SQLite 内存库替代:

\`\`\`python
# test_users.py
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db

# 用 SQLite 内存库,跑完就消失,完全隔离
test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=test_engine)

def override_get_db():
    """替身依赖:返回 SQLite 的 session。"""
    db = TestSession()
    try:
        yield db
    finally:
        db.close()

# 关键一步:用替身替换原来的 get_db
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_get_user():
    # 这次请求里,get_db 用的就是 SQLite 而不是 MySQL
    r = client.get("/users/1")
    # ...断言
\`\`\`

**测试结束一定要清理:**

\`\`\`python
def teardown_function():
    app.dependency_overrides.clear()
\`\`\`

> 配合 fixture 用更优雅(见上一章的 \`client\` fixture)。

### 51.3 覆盖外部 API 调用

假设你的接口要调一个第三方短信服务:

\`\`\`python
# main.py
import httpx
from fastapi import FastAPI

app = FastAPI()

def send_sms(phone: str, code: str):
    """调用第三方短信 API。"""
    r = httpx.post("https://sms.example.com/send", json={"phone": phone, "code": code})
    return r.json()

@app.post("/register")
def register(phone: str):
    code = "123456"
    result = send_sms(phone, code)
    if result["status"] != "ok":
        return {"ok": False}
    return {"ok": True}
\`\`\`

测试时不想真的发短信(费钱又慢),有几种 Mock 方式。

### 51.4 用 FastAPI 依赖覆盖(推荐)

把"发短信"抽成一个依赖,然后用假实现替换:

\`\`\`python
# main.py —— 重构成依赖
from fastapi import FastAPI, Depends

app = FastAPI()

def get_sms_client():
    """生产依赖:返回真实 httpx 客户端。"""
    return httpx.Client(base_url="https://sms.example.com")

@app.post("/register")
def register(phone: str, sms = Depends(get_sms_client)):
    code = "123456"
    result = sms.post("/send", json={"phone": phone, "code": code}).json()
    return {"ok": result["status"] == "ok"}

# test_register.py
class FakeSmsClient:
    """假短信客户端,返回固定成功。"""
    def post(self, url, json=None):
        class R:
            @staticmethod
            def json():
                return {"status": "ok"}
        return R()

def override_sms():
    return FakeSmsClient()

app.dependency_overrides[get_sms_client] = override_sms

client = TestClient(app)

def test_register_success():
    r = client.post("/register", params={"phone": "13800000000"})
    assert r.json() == {"ok": True}
\`\`\`

> 这种方式最干净:**生产代码不为了测试改逻辑,只是把外部依赖抽成 \`Depends\`,测试时替换实现**。这就是为什么前面章节一直强调"依赖注入让代码可测"。

### 51.5 用 unittest.mock.patch(不打扰源码)

如果不想重构代码,可以用 \`unittest.mock.patch\` 临时替换函数:

\`\`\`python
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app, send_sms

client = TestClient(app)

def test_register_with_mocked_sms():
    # 在这个 with 块里,send_sms 被替换成一个 MagicMock
    with patch("main.send_sms") as mock_sms:
        # 设置替身被调用时返回什么
        mock_sms.return_value = {"status": "ok"}

        r = client.post("/register", params={"phone": "13800000000"})
        assert r.json() == {"ok": True}

        # 还能断言"被调用了,参数对不对"
        mock_sms.assert_called_once_with("13800000000", "123456")
\`\`\`

### 51.6 MagicMock 和 AsyncMock

\`MagicMock\` 是 \`unittest.mock\` 的核心类,它会自动模拟任何属性和方法调用:

\`\`\`python
from unittest.mock import MagicMock

m = MagicMock()
m.foo()                    # 不报错,返回一个新 MagicMock
m.bar.baz(1, 2)            # 也不报错
m.bar.baz.assert_called_with(1, 2)   # 断言调用参数

# 设置返回值
m.foo.return_value = 42
assert m.foo() == 42

# 设置抛异常
m.foo.side_effect = ValueError("boom")
m.foo()   # 抛 ValueError
\`\`\`

异步函数要用 \`AsyncMock\`:

\`\`\`python
from unittest.mock import AsyncMock, patch

async def fetch_data():
    ...

with patch("__main__.fetch_data", new=AsyncMock(return_value={"x": 1})):
    ...
\`\`\`

### 51.7 Mock httpx 响应(用 respx)

如果你的代码里大量用 \`httpx\` 调外部 API,推荐用 \`respx\` 这个库,它能精确 mock 路由:

\`\`\`bash
pip install respx
\`\`\`

\`\`\`python
import respx
import httpx

@respx.mock
def test_call_external():
    # 假装 https://api.example.com/users 返回固定数据
    respx.get("https://api.example.com/users").respond(
        status_code=200,
        json={"id": 1, "name": "小明"},
    )

    r = httpx.get("https://api.example.com/users")
    assert r.status_code == 200
    assert r.json()["name"] == "小明"
\`\`\`

> 这种方式适合"测的是客户端代码本身",而不是 FastAPI 接口。

### 51.8 单元测试 vs 集成测试

| 维度 | 单元测试 | 集成测试 |
| --- | --- | --- |
| 测什么 | 单个函数/类 | 多个组件协作 |
| Mock 程度 | 大量 Mock,只测自己 | 少 Mock,用真实依赖 |
| 速度 | 极快(毫秒级) | 较慢(秒级) |
| 范围 | 一个函数的逻辑 | 整个请求链路 |
| 数量 | 多(每个函数几个) | 少(关键流程几个) |
| 例子 | 测 \`calculate_price\` 函数 | 测 \`POST /order → 扣库存 → 生成订单\` |

**经验法则**:

- 业务逻辑(算法、规则)→ 单元测试,大量 Mock;
- 关键 API 链路 → 集成测试,用 SQLite 内存库 + TestClient;
- 第三方 API → 永远 Mock(费钱、不稳定)。

### 51.9 完整示例:Mock 数据库 + 外部 API

\`\`\`python
# main.py —— 一个调外部汇率 API 的转账接口
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import httpx

app = FastAPI()

class Transfer(BaseModel):
    from_id: int
    to_id: int
    amount_usd: float

def get_db():
    db = create_db()           # 生产:连真实数据库
    yield db

def get_rate_client():
    return httpx.Client(base_url="https://api.exchangerate.com")

@app.post("/transfer")
def transfer(t: Transfer, db = Depends(get_db), client = Depends(get_rate_client)):
    # 查汇率
    r = client.get("/rate", params={"from": "USD", "to": "CNY"})
    rate = r.json()["rate"]
    if rate <= 0:
        raise HTTPException(500, "汇率异常")
    # 转账逻辑(简化)
    cny = t.amount_usd * rate
    return {"cny": cny, "rate": rate}

# test_transfer.py
from fastapi.testclient import TestClient
from main import app, get_db, get_rate_client

class FakeDB:
    """假数据库,啥都不真做。"""
    def get(self, *args, **kwargs):
        return None

class FakeRateClient:
    """假汇率 API 客户端。"""
    def get(self, url, params=None):
        class R:
            @staticmethod
            def json():
                return {"rate": 7.2}
        return R()

def override_db():
    yield FakeDB()

def override_rate():
    return FakeRateClient()

# 用 fixture 注入替身
app.dependency_overrides[get_db] = override_db
app.dependency_overrides[get_rate_client] = override_rate

client = TestClient(app)

def test_transfer():
    r = client.post("/transfer", json={"from_id": 1, "to_id": 2, "amount_usd": 100})
    assert r.status_code == 200
    assert r.json() == {"cny": 720.0, "rate": 7.2}

# 测异常分支:汇率 API 返回异常值
class BadRateClient:
    def get(self, url, params=None):
        class R:
            @staticmethod
            def json():
                return {"rate": -1}
        return R()

def test_transfer_bad_rate():
    app.dependency_overrides[get_rate_client] = lambda: BadRateClient()
    r = client.post("/transfer", json={"from_id": 1, "to_id": 2, "amount_usd": 100})
    assert r.status_code == 500
\`\`\`

### 51.10 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| Mock 没清理,影响下一个测试 | 别的测试莫名失败 | fixture 结尾 \`clear\` 或 \`stop\` |
| \`patch\` 路径写错 | Mock 没生效,还是调了真服务 | patch 用"被测模块里的引用名" |
| Mock 太狠,测的不再是真逻辑 | 测试永远过,线上挂 | 只 Mock 外部依赖,别 Mock 自己的业务 |
| \`assert_called\` 写在 with 块外 | 测试挂了找不到原因 | 断言要在 patch 还生效的范围内 |
| 异步函数用 MagicMock | 报"coroutine 不能 await" | 异步用 \`AsyncMock\` |
| 覆盖依赖但忘了 \`Depends\` | 替身没生效 | \`dependency_overrides\` 的 key 必须是依赖函数本身 |

> **本章小结**:Mock 的目的是"让测试不依赖外部世界"。FastAPI 用 \`app.dependency_overrides\` 替换依赖(最优雅),通用场景用 \`unittest.mock.patch\`。原则:**只 Mock 外部依赖,不 Mock 你要测的业务逻辑本身**。下一章讲怎么量化测试覆盖了多少代码。`,
  },

  // =============================================================
  // 第五十二章:覆盖率与持续测试
  // =============================================================
  {
    id: 'test-coverage',
    group: '测试',
    icon: '📊',
    title: '覆盖率与持续测试',
    content: `## 第五十二章　覆盖率与持续测试

### 52.1 测试覆盖率是什么

**测试覆盖率(coverage)= 你的测试运行时,实际被执行到的代码行数 / 代码总行数。**

举个例子,你的 \`main.py\` 有 100 行代码,跑完所有测试后,有 80 行被测试执行到了,那覆盖率就是 80%。

> 但要警惕:**覆盖率只衡量"代码有没有被跑到",不衡量"测得对不对"**。你可以写一个 \`def test_x(): assert True\`,它会让对应的代码"被覆盖",但其实啥也没测。覆盖率是必要条件,不是充分条件。

### 52.2 安装 pytest-cov

\`\`\`bash
pip install pytest-cov
\`\`\`

它会给 pytest 加上 \`--cov\` 参数,跑测试时同时统计覆盖率。

### 52.3 跑覆盖率

\`\`\`bash
# --cov=app 表示统计 app 目录下代码的覆盖率
# --cov-report=term 终端打印
# --cov-report=html 生成 HTML 报告
pytest --cov=app --cov-report=term --cov-report=html
\`\`\`

跑完会在终端看到一个表格:

\`\`\`
Name                Stmts   Miss  Cover
---------------------------------------
app/__init__.py         2      0   100%
app/main.py            45      5    89%
app/services.py        30      8    73%
---------------------------------------
TOTAL                  77     13    83%
\`\`\`

- **Stmts**:语句总数;
- **Miss**:没被覆盖的语句数;
- **Cover**:覆盖率百分比。

同时会生成一个 \`htmlcov/\` 目录,浏览器打开 \`htmlcov/index.html\`,能逐行看到哪行被覆盖、哪行没覆盖(红色是没覆盖,绿色是覆盖了)。这是排查"漏测"的最直观工具。

### 52.4 分支覆盖率 vs 行覆盖率

默认统计的是**行覆盖率**。更严格的是**分支覆盖率**:

\`\`\`python
def get_label(score):
    if score >= 60:
        return "及格"
    return "不及格"
\`\`\`

- **行覆盖率**:测了 \`score=80\`,覆盖到 \`if\` 那行和 \`return "及格"\` 那行,但 \`return "不及格"\` 没被覆盖,行覆盖率是 75%;
- **分支覆盖率**:即使两行都覆盖了,只要没测 \`score < 60\` 的情况,分支覆盖率还是 50%——因为它要求 \`if\` 的两个分支都走到。

开启分支覆盖:

\`\`\`bash
pytest --cov=app --cov-branch --cov-report=html
\`\`\`

> **分支覆盖率更能反映真实情况**。一个 \`if/else\` 只测了一个分支,行覆盖率看着高,但漏了一个分支。

### 52.5 覆盖率目标:80% 不是硬指标

很多团队定"覆盖率必须 80%"。这是个参考值,不是圣经:

- **强行追 100% 反而有害**:为了凑覆盖率,你会写出大量低质量测试(就是 \`assert True\` 那种);
- **80% 通常够用**:剩下 20% 可能是异常分支、错误处理,补上性价比不高;
- **关键模块可以要求 100%**:支付、权限、核心算法,这些地方 100% 都嫌低。

**更重要的指标:关键路径的覆盖率。** 一个内部 CRUD 工具的覆盖率可以低,但支付接口的覆盖率必须高。

### 52.6 什么该测,什么不必测

| 该测 | 不必测 |
| --- | --- |
| 业务逻辑(规则、算法) | 框架本身的代码(FastAPI、Pydantic) |
| 边界值(0、负数、空、超大) | 简单的 CRUD 增删改查 |
| 错误处理(异常、超时) | 配置文件加载 |
| 权限校验逻辑 | 第三方库的内部 |
| 复杂的数据转换 | getter/setter 这种没什么逻辑的方法 |
| 并发、事务相关 | 打印日志的代码 |

> 一个常见误区:**为了覆盖率去测 \`__init__\`、\`__repr__\` 这种没逻辑的方法**。这种测试除了凑数字没意义。

### 52.7 配置文件:统一覆盖率规则

在项目根目录建 \`pyproject.toml\` 或 \`.coveragerc\`,统一配置:

\`\`\`ini
# .coveragerc
[run]
source = app                  # 只统计 app 目录
branch = True                 # 开启分支覆盖
omit =
    app/tests/*               # 排除测试代码本身
    app/__init__.py

[report]
show_missing = True           # 报告里显示哪些行没覆盖
precision = 2
fail_under = 80               # 覆盖率低于 80% 就让命令失败(用于 CI)

[html]
directory = htmlcov            # HTML 报告输出目录
\`\`\`

配好之后,直接 \`pytest --cov\` 就行,不用每次写一堆参数。

### 52.8 在 CI 里跑测试(GitHub Actions)

覆盖率最大的价值在 CI:每次提交代码、每次 PR,都自动跑测试,覆盖率掉了就报警。

\`\`\`yaml
# .github/workflows/test.yml
name: 测试与覆盖率

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: 安装 Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: 安装依赖
        run: pip install -r requirements.txt && pip install pytest pytest-cov httpx
      - name: 跑测试 + 覆盖率
        run: pytest --cov=app --cov-branch --cov-report=xml --cov-report=term
      - name: 上传覆盖率报告
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
\`\`\`

**关键点**:

- \`fail_under = 80\` 在 \`.coveragerc\` 里设了,pytest 跑完如果覆盖率低于 80%,会返回非零退出码,CI 这步就"红"了;
- 上传到 codecov.io 后,能在 PR 里看到覆盖率变化(+1% / -2%),一目了然。

### 52.9 覆盖率报告解读

打开 \`htmlcov/index.html\`,你会看到:

- **绿色行**:被测试执行到了;
- **红色行**:没被覆盖;
- **黄色行**:部分分支没覆盖(只在 \`--cov-branch\` 时出现);
- **Missing 列**:显示哪些行号没覆盖。

点击文件名进去,能看到具体代码,红色那行就是"漏测"的地方。看到红色,问自己两个问题:

1. 这行该不该测?(不该测的就忽略)
2. 该测的话,什么场景能覆盖它?(补一个测试用例)

### 52.10 实战:从一个 0 覆盖的项目开始

假设有个 \`app/services.py\`:

\`\`\`python
def calculate_discount(price, vip_level):
    """根据 VIP 等级算折扣。"""
    if vip_level == 1:
        return price * 0.95
    elif vip_level == 2:
        return price * 0.9
    elif vip_level >= 3:
        return price * 0.8
    return price
\`\`\`

第一次跑覆盖率,\`pytest --cov=app --cov-branch\`,可能只有 50%——因为你只测了 VIP1 的情况。报告会显示 elif 分支都是红的。

补全测试:

\`\`\`python
import pytest
from app.services import calculate_discount

@pytest.mark.parametrize("price, vip, expected", [
    (100, 0, 100),     # 非 VIP,原价
    (100, 1, 95),      # VIP1
    (100, 2, 90),      # VIP2
    (100, 3, 80),      # VIP3
    (100, 5, 80),      # VIP5,走 >=3 分支
])
def test_calculate_discount(price, vip, expected):
    assert calculate_discount(price, vip) == expected
\`\`\`

再跑,覆盖率变 100%(行 + 分支都覆盖)。

### 52.11 持续测试的心态

覆盖率不是"一次性达标就完事",而是"持续维护":

- **新功能必须有测试**:写代码的同时写测试,别堆到最后;
- **修 bug 先写测试复现**:这样修完测试变绿,证明 bug 真的修了;
- **覆盖率下降要 review**:PR 里看到覆盖率 -5%,要问清楚为什么;
- **定期清理冗余测试**:有些测试随着重构变得没意义,该删就删。

### 52.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 只看行覆盖率,忽略分支 | 漏 if/else 一个分支 | 用 \`--cov-branch\` |
| 为了凑覆盖率写无意义测试 | 覆盖率高但质量低 | 测真正的业务逻辑,别测 getter |
| 覆盖率 100% 就放心了 | 漏了边界、并发、错误处理 | 覆盖率只是必要条件 |
| CI 不跑测试 | 覆盖率数据过时 | PR 必须触发 CI 跑测试 |
| \`fail_under\` 设太高(如 100) | 团队为达标写垃圾测试 | 80% 比较合理,关键模块可加严 |
| 没排除测试代码本身 | 覆盖率虚高 | \`.coveragerc\` 里 \`omit\` 测试目录 |

> **本章小结**:pytest-cov 让覆盖率可视化,\`--cov-branch\` 看分支覆盖,CI 里设 \`fail_under\` 守住下限。记住:**覆盖率衡量"测没测到",不衡量"测得对不对"**——高质量的测试用例比单纯的高覆盖率更重要。测试这一批到此结束,下一批进入项目结构与配置。`,
  },
];
