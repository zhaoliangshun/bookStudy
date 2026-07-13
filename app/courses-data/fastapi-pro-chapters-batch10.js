// =============================================================
// FastAPI 现代开发全书 - 第 10 批章节
// -------------------------------------------------------------
// 本批包含 5 章：
//   fp-testing         : TestClient 单元测试（测试与文档）
//   fp-testing-advanced: 依赖覆盖与 Mock（测试与文档）
//   fp-openapi-docs    : OpenAPI 文档定制（测试与文档）
//   fp-project-config  : 项目结构与配置管理（项目工程化）
//   fp-deploy          : 部署：Docker + Gunicorn + Nginx（项目工程化）
// ============================================================

export const chapters = [
  {
    id: "fp-testing",
    group: "测试与文档",
    icon: "🧪",
    title: "TestClient 单元测试",
    content: `# TestClient 单元测试

## 一、为什么要写测试

很多新手觉得写测试是浪费时间——「代码能跑就行，测试以后再说」。但现实是：**没有测试的代码，你不敢改**。

想象你写了一个用户注册接口，上线运行良好。三个月后产品要加一个「邀请码」功能，你改了注册逻辑。怎么确保原来的注册还能用？手动测试？你得把所有注册场景都试一遍——邮箱注册、手机号注册、重复用户名、弱密码……每次改代码都手动测一遍，累不累？

**测试就是「自动化的回归检查」**。你写一次测试，以后每次改代码，运行一下测试就能知道有没有改坏东西。这给你重构的信心，也是团队协作的基础——别人改了你的代码，测试不通过就知道出问题了。

类比：测试就像汽车的安全带。平时系着觉得多余，但真出事的时候救你一命。写测试的投入是一次性的，收益是长期的——每次改代码都帮你挡 bug。

FastAPI 的测试非常友好：它内置了 \`TestClient\`，可以模拟 HTTP 请求，不需要真正启动服务器。写测试就像写普通函数一样简单。

## 二、TestClient 基本用法

\`TestClient\` 基于 httpx，可以模拟对 FastAPI 应用的 HTTP 请求。不需要启动 uvicorn，直接调用就行。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
# TestClient 是 FastAPI 提供的测试客户端，能模拟 HTTP 请求
from fastapi.testclient import TestClient

# 创建 FastAPI 应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义一个简单的路由
@app.get("/")
# 定义函数 root
def root():
    # 返回 JSON
    return {"message": "Hello World"}

# 定义一个带路径参数的路由
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id
def get_item(item_id: int):
    # 返回 item_id
    return {"item_id": item_id}

# 创建 TestClient 实例，传入 app
# TestClient 会拦截 app 的请求，不需要真正启动 HTTP 服务器
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试 GET /
# client.get("/") 模拟一个 GET 请求到 /
# 返回一个 Response 对象，包含 status_code、json() 等
# 定义变量 response，赋值为 client.get("/")
response = client.get("/")

# 断言状态码是 200
assert response.status_code == 200
# 断言响应体是 {"message": "Hello World"}
assert response.json() == {"message": "Hello World"}

# 测试 GET /items/42
# 定义变量 response2，赋值为 client.get("/items/42")
response2 = client.get("/items/42")
# 断言状态码 200
assert response2.status_code == 200
# 断言 item_id 是 42
assert response2.json() == {"item_id": 42}

# 打印测试通过
print("基本测试通过！")
\`\`\`

\`TestClient\` 的核心优势：**不需要启动服务器**。它直接在内存里调用 FastAPI 的请求处理逻辑，速度极快（微秒级），适合写大量单元测试。

## 三、GET/POST/PUT/DELETE 测试

TestClient 支持所有 HTTP 方法。下面演示如何测试 CRUD（增删改查）接口。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义 Pydantic 模型 Item
class Item(BaseModel):
    name: str
    price: float
    description: str = ""

# 模拟数据库（内存字典）
# 定义变量 db，赋值为 {}
db = {}

# ========== 定义 CRUD 路由 ==========

# 创建：POST /items/{item_id}
@app.post("/items/{item_id}")
# 定义函数 create_item，参数: item_id: int, item: Item
def create_item(item_id: int, item: Item):
    # 检查是否已存在
    if item_id in db:
        # 抛出 409 冲突
        raise HTTPException(409, "Item already exists")
    # 存入数据库
    db[item_id] = item
    # 返回创建的 item
    return {"item_id": item_id, "item": item}

# 读取：GET /items/{item_id}
@app.get("/items/{item_id}")
# 定义函数 read_item，参数: item_id: int
def read_item(item_id: int):
    # 检查是否存在
    if item_id not in db:
        # 抛出 404
        raise HTTPException(404, "Item not found")
    # 返回 item
    return {"item_id": item_id, "item": db[item_id]}

# 更新：PUT /items/{item_id}
@app.put("/items/{item_id}")
# 定义函数 update_item，参数: item_id: int, item: Item
def update_item(item_id: int, item: Item):
    # 检查是否存在
    if item_id not in db:
        # 抛出 404
        raise HTTPException(404, "Item not found")
    # 更新
    db[item_id] = item
    # 返回更新后的 item
    return {"item_id": item_id, "item": item}

# 删除：DELETE /items/{item_id}
@app.delete("/items/{item_id}")
# 定义函数 delete_item，参数: item_id: int
def delete_item(item_id: int):
    # 检查是否存在
    if item_id not in db:
        # 抛出 404
        raise HTTPException(404, "Item not found")
    # 删除
    del db[item_id]
    # 返回删除确认
    return {"deleted": True, "item_id": item_id}

# ========== 编写测试 ==========

# 创建 TestClient
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试 POST（创建）
# 定义函数 test_create_item
def test_create_item():
    # 清空数据库，确保测试隔离
    db.clear()
    # 发送 POST 请求，json 参数自动序列化
    # 定义变量 r，赋值为 client.post("/items/1", json={"name": "苹果", "price": 5.0})
    r = client.post("/items/1", json={"name": "苹果", "price": 5.0})
    # 断言状态码 200
    assert r.status_code == 200
    # 断言返回的 item 名字是 "苹果"
    assert r.json()["item"]["name"] == "苹果"

# 测试 GET（读取）
# 定义函数 test_read_item
def test_read_item():
    db.clear()
    # 先创建
    client.post("/items/1", json={"name": "苹果", "price": 5.0})
    # 再读取
    # 定义变量 r，赋值为 client.get("/items/1")
    r = client.get("/items/1")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言名字
    assert r.json()["item"]["name"] == "苹果"

# 测试 PUT（更新）
# 定义函数 test_update_item
def test_update_item():
    db.clear()
    # 先创建
    client.post("/items/1", json={"name": "苹果", "price": 5.0})
    # 更新
    # 定义变量 r，赋值为 client.put("/items/1", json={"name": "香蕉", "price": 3.0})
    r = client.put("/items/1", json={"name": "香蕉", "price": 3.0})
    # 断言状态码 200
    assert r.status_code == 200
    # 断言名字已更新
    assert r.json()["item"]["name"] == "香蕉"

# 测试 DELETE（删除）
# 定义函数 test_delete_item
def test_delete_item():
    db.clear()
    # 先创建
    client.post("/items/1", json={"name": "苹果", "price": 5.0})
    # 删除
    # 定义变量 r，赋值为 client.delete("/items/1")
    r = client.delete("/items/1")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言 deleted 为 True
    assert r.json()["deleted"] == True
    # 再读取应该 404
    r2 = client.get("/items/1")
    assert r2.status_code == 404

# 运行所有测试
# 调用 test_create_item()
test_create_item()
# 调用 test_read_item()
test_read_item()
# 调用 test_update_item()
test_update_item()
# 调用 test_delete_item()
test_delete_item()
# 打印
print("CRUD 测试全部通过！")
\`\`\`

## 四、断言响应状态码和内容

测试的核心是**断言**——验证响应是否符合预期。常用的断言模式：

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义路由
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    # 如果 user_id 是 0，返回 400
    if user_id == 0:
        # 抛出 400
        raise HTTPException(400, "Invalid user ID")
    # 如果 user_id 不在 1-100，返回 404
    if user_id < 1 or user_id > 100:
        # 抛出 404
        raise HTTPException(404, "User not found")
    # 正常返回
    return {"user_id": user_id, "name": f"用户{user_id}", "age": 20 + user_id % 10}

# 创建 TestClient
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试正常情况（200）
# 定义函数 test_get_user_ok
def test_get_user_ok():
    r = client.get("/users/1")
    # 断言状态码
    assert r.status_code == 200
    # 断言返回的字段
    assert "user_id" in r.json()
    assert "name" in r.json()
    assert "age" in r.json()
    # 断言具体值
    assert r.json()["user_id"] == 1
    assert r.json()["name"] == "用户1"

# 测试 400 错误
# 定义函数 test_get_user_invalid
def test_get_user_invalid():
    r = client.get("/users/0")
    # 断言状态码 400
    assert r.status_code == 400
    # 断言错误信息
    assert r.json()["detail"] == "Invalid user ID"

# 测试 404 错误
# 定义函数 test_get_user_not_found
def test_get_user_not_found():
    r = client.get("/users/999")
    # 断言状态码 404
    assert r.status_code == 404
    # 断言错误信息
    assert r.json()["detail"] == "User not found"

# 测试响应头
# 定义函数 test_response_headers
def test_response_headers():
    r = client.get("/users/1")
    # 断言 Content-Type 是 application/json
    assert r.headers["content-type"] == "application/json"
    # 断言有 server 头
    # assert "server" in r.headers

# 运行测试
test_get_user_ok()
test_get_user_invalid()
test_get_user_not_found()
test_response_headers()
# 打印
print("断言测试通过！")
\`\`\`

## 五、测试 Pydantic 校验

FastAPI 的 Pydantic 校验是自动的，但我们也要测试它——确保非法输入被拒绝。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义 Pydantic 模型 UserCreate
class UserCreate(BaseModel):
    # 用户名：必填，最少 3 字符
    username: str = Field(min_length=3, max_length=20)
    # 年龄：必填，18-120
    age: int = Field(ge=18, le=120)
    # 邮箱：必填，格式校验
    email: str

# 定义路由
@app.post("/users")
# 定义函数 create_user，参数: user: UserCreate
def create_user(user: UserCreate):
    # 返回创建的用户
    return {"username": user.username, "age": user.age, "email": user.email}

# 创建 TestClient
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试正常输入（200）
# 定义函数 test_create_user_ok
def test_create_user_ok():
    r = client.post("/users", json={
        "username": "alice",
        "age": 25,
        "email": "alice@example.com"
    })
    # 断言 200
    assert r.status_code == 200
    # 断言返回值
    assert r.json()["username"] == "alice"

# 测试缺少字段（422）
# 定义函数 test_create_user_missing_field
def test_create_user_missing_field():
    # 缺少 email 字段
    r = client.post("/users", json={
        "username": "alice",
        "age": 25
    })
    # FastAPI 自动返回 422 校验错误
    assert r.status_code == 422
    # 响应体里有 detail 字段，包含错误详情
    assert "detail" in r.json()
    # 错误详情里包含缺失的字段名
    # detail 是一个列表，每个元素是一个错误对象
    errors = r.json()["detail"]
    # 找到关于 email 的错误
    email_error = [e for e in errors if "email" in e.get("loc", [])]
    assert len(email_error) > 0

# 测试类型错误（422）
# 定义函数 test_create_user_wrong_type
def test_create_user_wrong_type():
    # age 传字符串 "abc"
    r = client.post("/users", json={
        "username": "alice",
        "age": "abc",  # 应该是 int
        "email": "alice@example.com"
    })
    # 422 校验失败
    assert r.status_code == 422

# 测试值范围错误（422）
# 定义函数 test_create_user_age_out_of_range
def test_create_user_age_out_of_range():
    # age 小于 18
    r = client.post("/users", json={
        "username": "alice",
        "age": 10,  # 不满足 ge=18
        "email": "alice@example.com"
    })
    # 422
    assert r.status_code == 422

# 测试字符串长度错误（422）
# 定义函数 test_create_user_short_username
def test_create_user_short_username():
    # username 只有两个字符，不满足 min_length=3
    r = client.post("/users", json={
        "username": "ab",  # 太短
        "age": 25,
        "email": "alice@example.com"
    })
    # 422
    assert r.status_code == 422

# 测试邮箱格式错误（422）
# 定义函数 test_create_user_invalid_email
def test_create_user_invalid_email():
    # email 格式不对
    r = client.post("/users", json={
        "username": "alice",
        "age": 25,
        "email": "not-an-email"  # 不是合法邮箱
    })
    # 422
    assert r.status_code == 422

# 运行所有测试
test_create_user_ok()
test_create_user_missing_field()
test_create_user_wrong_type()
test_create_user_age_out_of_range()
test_create_user_short_username()
test_create_user_invalid_email()
# 打印
print("Pydantic 校验测试通过！")
\`\`\`

## 六、pytest fixture：测试前置准备

pytest 是 Python 最流行的测试框架。它的 **fixture** 机制可以复用测试前置代码（如创建测试客户端、初始化数据库）。

\`\`\`python
# ============================================================
# 这个文件演示 pytest 的用法，保存为 test_app.py 后用 pytest 运行
# 安装: pip install pytest
# 运行: pytest test_app.py -v
# ============================================================

# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 导入 pytest
import pytest

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 模拟数据库
# 定义变量 db，赋值为 {}
db = {}

# 定义路由
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int
def get_item(item_id: int):
    # 如果不在数据库
    if item_id not in db:
        # 返回 404
        from fastapi import HTTPException
        raise HTTPException(404, "Not found")
    # 返回
    return {"item": db[item_id]}

@app.post("/items/{item_id}")
# 定义函数 create_item，参数: item_id: int, name: str
def create_item(item_id: int, name: str):
    # 存入数据库
    db[item_id] = {"id": item_id, "name": name}
    # 返回
    return {"item": db[item_id]}

# ========== pytest fixture ==========

# @pytest.fixture 定义一个 fixture
# fixture 是测试的前置准备，可以被多个测试复用
# 定义 fixture client
@pytest.fixture
def client():
    """创建测试客户端，每个测试函数都会获得一个新的 client"""
    # 返回 TestClient 实例
    return TestClient(app)

# 定义 fixture clean_db
@pytest.fixture
def clean_db():
    """清空数据库，确保测试之间互不影响"""
    # 测试前清空
    db.clear()
    # yield 之前的代码是前置准备
    yield  # 这里把控制权交给测试函数
    # yield 之后的代码是后置清理
    db.clear()

# 定义 fixture with_data
@pytest.fixture
def with_data(clean_db):
    """预填充测试数据"""
    # 往数据库里放一些测试数据
    db[1] = {"id": 1, "name": "苹果"}
    db[2] = {"id": 2, "name": "香蕉"}
    # 返回 db 供测试使用
    return db

# ========== 测试函数 ==========

# 测试函数的参数名匹配 fixture 名，pytest 自动注入
# 定义函数 test_get_item_not_found，参数: client, clean_db
def test_get_item_not_found(client, clean_db):
    # 数据库是空的，获取 item 1 应该 404
    r = client.get("/items/1")
    assert r.status_code == 404

# 定义函数 test_create_and_get_item，参数: client, clean_db
def test_create_and_get_item(client, clean_db):
    # 创建 item
    r = client.post("/items/1", params={"name": "苹果"})
    # 断言创建成功
    assert r.status_code == 200
    # 再获取，应该存在
    r = client.get("/items/1")
    assert r.status_code == 200
    assert r.json()["item"]["name"] == "苹果"

# 定义函数 test_get_item_with_data，参数: client, with_data
def test_get_item_with_data(client, with_data):
    # with_data fixture 预填充了数据
    # 获取 item 1 应该存在
    r = client.get("/items/1")
    assert r.status_code == 200
    assert r.json()["item"]["name"] == "苹果"
    # 获取 item 2 也存在
    r = client.get("/items/2")
    assert r.status_code == 200
    assert r.json()["item"]["name"] == "香蕉"

# fixture 的执行顺序：
# test_get_item_not_found(client, clean_db)
#   -> 创建 client
#   -> clean_db: 清空 db -> yield -> 清空 db
#   -> 执行测试
#   -> 清理

# fixture 的好处：
# 1. 复用：多个测试共享前置代码
# 2. 隔离：每个测试有干净的环境
# 3. 可组合：fixture 可以依赖其他 fixture
\`\`\`

## 七、测试异步路由

如果路由是 \`async def\`，TestClient 也能测试它——内部会自动处理异步。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 异步路由
@app.get("/async-data")
# 定义 async 函数 get_async_data
async def get_async_data():
    # 模拟异步操作
    import asyncio
    await asyncio.sleep(0.1)
    # 返回
    return {"data": "async result", "async": True}

# 异步路由 + 异步依赖
# 从 fastapi 导入 Depends
from fastapi import Depends

# 定义异步依赖 get_user
async def get_user():
    # 模拟异步查数据库
    import asyncio
    await asyncio.sleep(0.05)
    # 返回模拟用户
    return {"user_id": 1, "name": "测试用户"}

# 定义带依赖的异步路由
@app.get("/me")
# 定义 async 函数 get_me，参数: user = Depends(get_user)
async def get_me(user: dict = Depends(get_user)):
    # 返回用户信息
    return user

# 创建 TestClient
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试异步路由（TestClient 自动处理异步）
# 定义函数 test_async_route
def test_async_route():
    r = client.get("/async-data")
    # 断言 200
    assert r.status_code == 200
    # 断言返回值
    assert r.json()["async"] == True
    assert r.json()["data"] == "async result"

# 测试带异步依赖的路由
# 定义函数 test_async_dependency
def test_async_dependency():
    r = client.get("/me")
    # 断言 200
    assert r.status_code == 200
    # 断言依赖注入正常工作
    assert r.json()["user_id"] == 1
    assert r.json()["name"] == "测试用户"

# 运行
test_async_route()
test_async_dependency()
# 打印
print("异步测试通过！")
\`\`\`

## 八、设计思想：测试金字塔

测试不是越多越好，要有层次。业界总结出**测试金字塔**：

1. **单元测试（最多）**：测试单个函数/路由，速度快，数量多。用 TestClient 测路由属于这一层。
2. **集成测试（中等）**：测试多个组件协作（如路由 + 数据库），速度稍慢，数量适中。
3. **端到端测试（最少）**：测试完整业务流程（如注册→登录→下单），速度最慢，数量最少。

FastAPI 的 TestClient 适合单元测试和轻量集成测试。对于需要真实数据库的集成测试，可以用 testcontainers（临时启动 Docker 数据库）。

**测试原则**：
- **隔离性**：每个测试独立运行，互不影响。用 fixture 清理数据。
- **可读性**：测试名描述行为（test_create_user_with_valid_email），一看就知道测什么。
- **快速反馈**：单元测试应该在几秒内跑完。慢测试会被开发者跳过。
- **覆盖核心路径**：不必追求 100% 覆盖率，但要覆盖核心业务逻辑和边界情况。

写测试的时机：**写完功能立刻写测试**，不要等「以后」。以后通常意味着永远不会写。测试是代码的一部分，不是可选的附属品。
`
  },
  {
    id: "fp-testing-advanced",
    group: "测试与文档",
    icon: "🎭",
    title: "依赖覆盖与 Mock",
    content: `# 依赖覆盖与 Mock

## 一、为什么需要覆盖依赖

FastAPI 的依赖注入是强大的设计，但在测试时会带来一个问题：**真实依赖可能连着数据库、外部 API，测试时不能真的调用它们**。

比如你的路由依赖 \`get_db()\` 获取数据库连接。测试时你不想真的连数据库（慢、需要数据库服务、数据污染），而是想用一个**假的**数据库。这就是「依赖覆盖」——用 Mock 替换真实依赖。

类比：飞机飞行员训练时，不会真的开飞机（太贵、太危险），而是用飞行模拟器（Mock）。模拟器的行为和真飞机一样，但没有真飞机的风险和成本。测试中的 Mock 就是「代码模拟器」。

FastAPI 提供了 \`app.dependency_overrides\` 机制，让你在测试时用假依赖替换真依赖，不需要改业务代码。

## 二、dependency_overrides 基本用法

\`\`\`python
# 从 fastapi 导入 FastAPI, Depends
from fastapi import FastAPI, Depends
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# ========== 真实依赖 ==========
# 定义函数 get_db，模拟真实数据库获取
def get_db():
    # 真实环境：连接 PostgreSQL，返回 Session
    # 这里简化模拟
    # 打印
    print("【真实依赖】连接数据库...")
    # 返回模拟的 db 对象
    return {"type": "real_db", "items": []}

# 定义函数 get_current_user，模拟真实用户认证
def get_current_user():
    # 真实环境：从 token 解析用户
    # 打印
    print("【真实依赖】解析用户 token...")
    # 返回模拟用户
    return {"user_id": 100, "name": "真实用户", "role": "user"}

# ========== 路由 ==========
@app.get("/items")
# 定义函数 list_items，参数: db = Depends(get_db), user = Depends(get_current_user)
def list_items(db = Depends(get_db), user = Depends(get_current_user)):
    # 使用真实依赖获取数据
    # 打印
    print(f"用户 {user['name']} 查询 items")
    # 返回 db 中的 items
    return {"items": db["items"], "user": user["name"]}

@app.get("/me")
# 定义函数 get_me，参数: user = Depends(get_current_user)
def get_me(user = Depends(get_current_user)):
    # 返回当前用户
    return user

# ========== 测试：覆盖依赖 ==========
# 定义函数 test_list_items_with_mock
def test_list_items_with_mock():
    # 定义 Mock 数据库依赖
    def mock_get_db():
        # 返回假数据，不连真数据库
        return {"type": "mock_db", "items": [{"id": 1, "name": "测试商品"}]}

    # 定义 Mock 用户依赖
    def mock_get_current_user():
        # 返回假用户
        return {"user_id": 1, "name": "测试用户", "role": "admin"}

    # 覆盖依赖：把真实依赖映射到 Mock 函数
    # app.dependency_overrides 是一个字典
    # key 是真实依赖函数，value 是 Mock 函数
    app.dependency_overrides[get_db] = mock_get_db
    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 创建 TestClient（此时依赖已被覆盖）
    # 定义变量 client，赋值为 TestClient(app)
    client = TestClient(app)

    # 发请求，实际调用的是 Mock 依赖
    r = client.get("/items")
    # 断言 200
    assert r.status_code == 200
    # 断言返回的是 Mock 数据（不是真实依赖的数据）
    assert r.json()["items"] == [{"id": 1, "name": "测试商品"}]
    # 断言用户是 Mock 用户
    assert r.json()["user"] == "测试用户"

    # 清除覆盖（重要！避免影响其他测试）
    app.dependency_overrides.clear()

    # 打印
    print("依赖覆盖测试通过！")

# 运行测试
test_list_items_with_mock()
\`\`\`

**核心机制**：\`app.dependency_overrides[真实函数] = Mock函数\`。FastAPI 在处理请求时，发现依赖被覆盖了，就调用 Mock 函数而不是真实函数。业务代码完全不用改。

## 三、Mock 数据库

测试时最常见的场景：Mock 数据库，用内存数据代替真实数据库。

\`\`\`python
# 从 fastapi 导入 FastAPI, Depends, HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义模型
class Item(BaseModel):
    name: str
    price: float

# 真实数据库依赖（连 PostgreSQL）
# 定义函数 get_db_session
def get_db_session():
    # 真实环境代码:
    # session = SessionLocal()
    # try:
    #     yield session
    # finally:
    #     session.close()
    # 这里用简化的返回
    return {"items": {}}

# 路由使用依赖
@app.get("/items/{item_id}")
# 定义函数 get_item，参数: item_id: int, db = Depends(get_db_session)
def get_item(item_id: int, db = Depends(get_db_session)):
    # 从数据库查询
    if item_id not in db["items"]:
        # 抛出 404
        raise HTTPException(404, "Item not found")
    # 返回
    return db["items"][item_id]

@app.post("/items")
# 定义函数 create_item，参数: item: Item, db = Depends(get_db_session)
def create_item(item: Item, db = Depends(get_db_session)):
    # 生成 ID
    item_id = len(db["items"]) + 1
    # 存入
    db["items"][item_id] = {"id": item_id, **item.model_dump()}
    # 返回
    return db["items"][item_id]

# ========== 测试 ==========
# 定义函数 test_crud_with_mock_db
def test_crud_with_mock_db():
    # 创建 Mock 数据库（内存字典，模拟数据库行为）
    mock_db = {"items": {}}

    # Mock 依赖：返回内存数据库
    def mock_get_db():
        return mock_db

    # 覆盖依赖
    app.dependency_overrides[get_db_session] = mock_get_db

    # 创建客户端
    # 定义变量 client，赋值为 TestClient(app)
    client = TestClient(app)

    # 测试创建
    r = client.post("/items", json={"name": "苹果", "price": 5.0})
    # 断言 200
    assert r.status_code == 200
    # 断言 id 是 1
    assert r.json()["id"] == 1
    # 断言名字
    assert r.json()["name"] == "苹果"

    # 测试读取
    r = client.get("/items/1")
    # 断言 200
    assert r.status_code == 200
    # 断言名字
    assert r.json()["name"] == "苹果"

    # 测试 404
    r = client.get("/items/999")
    # 断言 404
    assert r.status_code == 404

    # 清除覆盖
    app.dependency_overrides.clear()
    # 打印
    print("Mock 数据库测试通过！")

# 运行
test_crud_with_mock_db()
\`\`\`

## 四、Mock 外部 API

路由里可能调用外部 API（如微信支付、短信服务）。测试时不能真调用（慢、花钱、不稳定），要 Mock 掉。

\`\`\`python
# 从 fastapi 导入 FastAPI, Depends
from fastapi import FastAPI, Depends
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 外部 API 客户端依赖
# 定义函数 get_payment_client
def get_payment_client():
    # 真实环境：返回微信支付/支付宝的 SDK 客户端
    # 打印
    print("【真实依赖】创建支付客户端...")
    # 返回模拟的支付客户端
    return PaymentClient()

# 定义类 PaymentClient，模拟支付客户端
class PaymentClient:
    # 定义方法 create_payment，参数: amount, order_id
    def create_payment(self, amount: float, order_id: str):
        # 真实环境：调用微信支付 API
        # 返回支付结果
        return {"status": "success", "payment_id": f"pay_{order_id}"}

    # 定义方法 query_payment，参数: payment_id
    def query_payment(self, payment_id: str):
        # 查询支付状态
        return {"status": "paid", "payment_id": payment_id}

# 路由：创建支付订单
@app.post("/pay")
# 定义函数 create_payment，参数: amount: float, order_id: str, client = Depends(get_payment_client)
def create_payment(amount: float, order_id: str, client = Depends(get_payment_client)):
    # 调用支付客户端
    result = client.create_payment(amount, order_id)
    # 返回结果
    return result

# 路由：查询支付状态
@app.get("/pay/{payment_id}")
# 定义函数 query_payment，参数: payment_id: str, client = Depends(get_payment_client)
def query_payment(payment_id: str, client = Depends(get_payment_client)):
    # 调用查询
    result = client.query_payment(payment_id)
    # 返回
    return result

# ========== 测试：Mock 支付客户端 ==========
# 定义函数 test_payment_with_mock
def test_payment_with_mock():
    # Mock 支付客户端
    class MockPaymentClient:
        # 重写 create_payment 方法
        def create_payment(self, amount, order_id):
            # 返回固定的假数据，不调用真实 API
            return {"status": "success", "payment_id": f"mock_pay_{order_id}"}

        # 重写 query_payment
        def query_payment(self, payment_id):
            # 返回假查询结果
            return {"status": "paid", "payment_id": payment_id, "mock": True}

    # Mock 依赖
    def mock_get_payment_client():
        # 返回 Mock 客户端实例
        return MockPaymentClient()

    # 覆盖依赖
    app.dependency_overrides[get_payment_client] = mock_get_payment_client

    # 创建客户端
    # 定义变量 client，赋值为 TestClient(app)
    client = TestClient(app)

    # 测试创建支付
    r = client.post("/pay", params={"amount": 99.5, "order_id": "order_001"})
    # 断言 200
    assert r.status_code == 200
    # 断言返回的是 Mock 数据
    assert r.json()["payment_id"] == "mock_pay_order_001"
    assert r.json()["status"] == "success"

    # 测试查询支付
    r = client.get("/pay/mock_pay_order_001")
    # 断言 200
    assert r.status_code == 200
    # 断言查询结果
    assert r.json()["status"] == "paid"
    assert r.json()["mock"] == True

    # 清除覆盖
    app.dependency_overrides.clear()
    # 打印
    print("Mock 外部 API 测试通过！")

# 运行
test_payment_with_mock()
\`\`\`

## 五、测试认证

认证是 API 测试的重点。要测试「未认证拒绝访问」和「认证后正常访问」两种情况。

\`\`\`python
# 从 fastapi 导入 FastAPI, Depends, HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# OAuth2 scheme：从 Authorization 头提取 token
# tokenUrl 是获取 token 的 URL（用于文档展示）
# 定义变量 oauth2_scheme，赋值为 OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 认证依赖：验证 token，返回用户
# 定义函数 get_current_user，参数: token = Depends(oauth2_scheme)
def get_current_user(token: str = Depends(oauth2_scheme)):
    # 真实环境：解码 JWT，查数据库验证
    # 模拟 token 验证
    if token == "valid_token_alice":
        # 返回 alice 用户
        return {"user_id": 1, "username": "alice", "role": "admin"}
    elif token == "valid_token_bob":
        # 返回 bob 用户
        return {"user_id": 2, "username": "bob", "role": "user"}
    else:
        # 无效 token
        raise HTTPException(401, "Invalid token")

# 管理员权限依赖
# 定义函数 get_admin_user，参数: user = Depends(get_current_user)
def get_admin_user(user = Depends(get_current_user)):
    # 检查角色
    if user["role"] != "admin":
        # 权限不足
        raise HTTPException(403, "Admin only")
    # 返回
    return user

# 路由：需要登录
@app.get("/me")
# 定义函数 get_me，参数: user = Depends(get_current_user)
def get_me(user = Depends(get_current_user)):
    # 返回当前用户
    return user

# 路由：需要管理员
@app.delete("/users/{user_id}")
# 定义函数 delete_user，参数: user_id: int, admin = Depends(get_admin_user)
def delete_user(user_id: int, admin = Depends(get_admin_user)):
    # 返回删除结果
    return {"deleted": user_id, "by": admin["username"]}

# ========== 测试 ==========
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试：未认证访问（401）
# 定义函数 test_no_token
def test_no_token():
    # 不带 token 访问
    r = client.get("/me")
    # OAuth2 默认返回 401
    assert r.status_code == 401

# 测试：有效 token 访问（200）
# 定义函数 test_valid_token
def test_valid_token():
    # 带 Authorization 头
    # 格式: Bearer <token>
    r = client.get("/me", headers={"Authorization": "Bearer valid_token_alice"})
    # 断言 200
    assert r.status_code == 200
    # 断言用户信息
    assert r.json()["username"] == "alice"

# 测试：无效 token（401）
# 定义函数 test_invalid_token
def test_invalid_token():
    r = client.get("/me", headers={"Authorization": "Bearer invalid_token"})
    # 断言 401
    assert r.status_code == 401

# 测试：普通用户访问管理员接口（403）
# 定义函数 test_non_admin_access_admin
def test_non_admin_access_admin():
    # bob 是普通用户
    r = client.delete("/users/1", headers={"Authorization": "Bearer valid_token_bob"})
    # 断言 403（权限不足）
    assert r.status_code == 403

# 测试：管理员访问管理员接口（200）
# 定义函数 test_admin_access_admin
def test_admin_access_admin():
    # alice 是管理员
    r = client.delete("/users/1", headers={"Authorization": "Bearer valid_token_alice"})
    # 断言 200
    assert r.status_code == 200
    # 断言删除成功
    assert r.json()["deleted"] == 1
    assert r.json()["by"] == "alice"

# 运行所有测试
test_no_token()
test_valid_token()
test_invalid_token()
test_non_admin_access_admin()
test_admin_access_admin()
# 打印
print("认证测试通过！")
\`\`\`

## 六、测试覆盖率

覆盖率衡量「有多少代码被测试执行了」。高覆盖率不代表测试质量高，但低覆盖率一定有风险。

\`\`\`python
# ============================================================
# 覆盖率测试示例 —— 需要 coverage 库
# 安装: pip install coverage pytest-cov
# 运行: pytest --cov=app --cov-report=html test_app.py
# 会生成 htmlcov/ 目录，打开 index.html 查看覆盖详情
# ============================================================

# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义函数 calculate_discount，参数: price, discount_code
def calculate_discount(price: float, discount_code: str):
    """计算折扣价格 —— 这个函数有多个分支，需要全覆盖"""
    # 分支 1：价格为负
    if price < 0:
        # 抛出异常
        raise ValueError("价格不能为负")
    # 分支 2：VIP 折扣码
    if discount_code == "VIP":
        # 8 折
        return price * 0.8
    # 分支 3：SALE 折扣码
    elif discount_code == "SALE":
        # 9 折
        return price * 0.9
    # 分支 4：无效折扣码
    else:
        # 不打折
        return price

# 路由
@app.get("/price")
# 定义函数 get_price，参数: price: float, code: str
def get_price(price: float, code: str = "NONE"):
    # 调用计算函数
    try:
        final_price = calculate_discount(price, code)
    except ValueError as e:
        # 返回 400
        from fastapi import HTTPException
        raise HTTPException(400, str(e))
    # 返回
    return {"original": price, "final": final_price, "code": code}

# 创建客户端
# 定义变量 client，赋值为 TestClient(app)
client = TestClient(app)

# 测试 VIP 折扣
# 定义函数 test_vip_discount
def test_vip_discount():
    r = client.get("/price", params={"price": 100, "code": "VIP"})
    assert r.status_code == 200
    assert r.json()["final"] == 80.0

# 测试 SALE 折扣
# 定义函数 test_sale_discount
def test_sale_discount():
    r = client.get("/price", params={"price": 100, "code": "SALE"})
    assert r.status_code == 200
    assert r.json()["final"] == 90.0

# 测试无折扣
# 定义函数 test_no_discount
def test_no_discount():
    r = client.get("/price", params={"price": 100, "code": "NONE"})
    assert r.status_code == 200
    assert r.json()["final"] == 100.0

# 测试负价格（400）
# 定义函数 test_negative_price
def test_negative_price():
    r = client.get("/price", params={"price": -10, "code": "VIP"})
    assert r.status_code == 400

# 运行
test_vip_discount()
test_sale_discount()
test_no_discount()
test_negative_price()
# 打印
print("覆盖率测试通过！")
# 这四个测试覆盖了 calculate_discount 的所有分支
# 运行 pytest --cov 可以看到 100% 覆盖率
\`\`\`

## 七、设计思想：可测试性设计

好的代码是**可测试的代码**。可测试性的核心是**解耦**——把外部依赖（数据库、API、文件系统）通过依赖注入暴露出来，这样测试时才能替换。

对比两种设计：

**不可测试的设计**（硬编码依赖）：
\`\`\`python
# 路由里直接 import 数据库和 requests，无法替换
# 定义函数 bad_route
def bad_route():
    # 硬编码的依赖，测试时没法替换
    import requests
    r = requests.get("https://api.example.com/data")  # 测试时真调外部 API
    return r.json()
\`\`\`

**可测试的设计**（依赖注入）：
\`\`\`python
# 依赖通过参数传入，测试时可以替换
# 定义函数 good_route，参数: api_client = Depends(get_api_client)
def good_route(api_client = Depends(get_api_client)):
    # 依赖从参数来，测试时可以覆盖
    return api_client.get_data()
\`\`\`

这就是 FastAPI 推崇依赖注入的原因——不只是为了代码复用，更是为了**可测试性**。依赖注入让代码的每个外部依赖都可以被 Mock，测试变得简单。

**测试的最佳实践**：
1. **每个外部依赖都要可 Mock**：数据库、外部 API、文件系统、消息队列。
2. **测试要快**：单元测试不超过 1 秒。慢测试用 Mock 而非真实服务。
3. **测试要独立**：一个测试的执行不依赖另一个测试的结果。
4. **测核心逻辑，不测框架**：不要测 FastAPI 本身（它有自己的测试），测你的业务逻辑。
5. **覆盖率不是目的，是参考**：80% 覆盖率很好了，100% 不一定值得（有些代码很难测且风险低）。
`
  },
  {
    id: "fp-openapi-docs",
    group: "测试与文档",
    icon: "📖",
    title: "OpenAPI 文档定制",
    content: `# OpenAPI 文档定制

## 一、OpenAPI 规范基础

FastAPI 最强大的特性之一就是**自动生成 API 文档**。你写好路由和 Pydantic 模型，FastAPI 自动生成符合 OpenAPI 规范的文档，并通过 Swagger UI 和 ReDoc 两个界面展示。

**OpenAPI 是什么？** 它是一个行业标准（原名 Swagger 规范），用 JSON/YAML 描述 REST API 的格式。有了 OpenAPI 文件，就能自动生成交互式文档、客户端 SDK、Mock 服务器等。

类比：OpenAPI 就像餐厅的菜单。菜单上写清楚每道菜的名字、配料、价格，顾客看了一目了然。FastAPI 帮你自动生成菜单——你只需要做菜（写路由），菜单（文档）自动生成。

FastAPI 生成的文档有两个界面：
- **Swagger UI** (\`/docs\`)：交互式界面，可以直接在浏览器里发请求测试 API。
- **ReDoc** (\`/redoc\`)：更美观的文档界面，适合阅读，但不能直接测试。

## 二、自定义文档标题和描述

默认的文档标题是 "FastAPI"，描述为空。生产环境要自定义这些信息。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用时自定义文档信息
# 定义变量 app，赋值为 FastAPI(title=..., description=..., version=...)
app = FastAPI(
    # API 文档标题
    title="电商系统 API",
    # API 文档描述（支持 Markdown）
    description="""
## 电商系统 API 文档

本 API 提供电商系统的核心功能：

- **用户管理**: 注册、登录、资料修改
- **商品管理**: 商品 CRUD、分类管理
- **订单管理**: 下单、支付、退款

### 使用说明

1. 所有接口需要 JWT 认证（除登录注册外）
2. 请求和响应均为 JSON 格式
3. 时间格式为 ISO 8601

### 联系方式

- 邮箱: api@example.com
- 文档: https://docs.example.com
""",
    # API 版本号
    version="1.0.0",
    # 服务条款
    terms_of_service="https://example.com/terms",
    # 联系人
    contact={
        "name": "API 支持",
        "url": "https://example.com/support",
        "email": "api@example.com",
    },
    # 许可证
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)

# 定义路由
@app.get("/", tags=["首页"])
# 定义函数 root
def root():
    """首页欢迎接口"""
    return {"message": "欢迎使用电商系统 API"}

# 访问 /docs 查看 Swagger UI，标题和描述会显示在页面上
# 访问 /redoc 查看 ReDoc
# 访问 /openapi.json 查看原始 OpenAPI JSON
\`\`\`

description 支持 Markdown 语法，会在文档页面上渲染。善用 Markdown 让文档更清晰。

## 三、responses 参数声明多响应

默认情况下，FastAPI 只展示成功响应（200）。但实际 API 有多种响应：404、403、422 等。用 \`responses\` 参数声明这些响应，文档会更完整。

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义响应模型
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

class ErrorResponse(BaseModel):
    detail: str
    code: int

# 定义路由，用 responses 参数声明多种响应
@app.get(
    "/users/{user_id}",
    response_model=UserResponse,  # 200 成功响应的模型
    responses={
        # 404 响应
        404: {
            "description": "用户不存在",
            "model": ErrorResponse,  # 用 ErrorResponse 模型展示 404 的返回
        },
        # 403 响应
        403: {
            "description": "无权限访问",
            "model": ErrorResponse,
        },
        # 500 响应
        500: {
            "description": "服务器内部错误",
            "content": {
                "application/json": {
                    "example": {"detail": "数据库连接失败", "code": 500}
                }
            },
        },
    },
    # summary 是简短描述（显示在路由列表）
    summary="获取用户信息",
    # description 是详细描述（显示在路由详情）
    description="根据用户 ID 获取用户的详细信息，包括姓名和邮箱。",
)
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    """
    获取用户信息的文档注释。

    这个 docstring 会作为路由的描述文档。
    支持 Markdown 语法。

    - **user_id**: 用户的唯一 ID
    """
    # 如果用户不存在
    if user_id > 100:
        # 抛出 404
        raise HTTPException(404, "用户不存在")
    # 返回用户
    return {"id": user_id, "name": f"用户{user_id}", "email": f"user{user_id}@example.com"}

# responses 参数的效果：
# 1. Swagger UI 会展示所有声明的响应码及其模型
# 2. 客户端开发者知道可能遇到什么错误
# 3. 自动生成的客户端 SDK 会包含错误处理
\`\`\`

## 四、tags 分组：组织路由

当 API 路由很多时（几十上百个），\`/docs\` 页面会变得很长。用 \`tags\` 给路由分组，文档会按分组展示。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
# 定义变量 app，赋值为 FastAPI(openapi_tags=[...])
app = FastAPI(
    # openapi_tags 定义分组的元信息（描述、顺序）
    openapi_tags=[
        {
            "name": "users",
            "description": "用户管理接口。包括注册、登录、资料修改等。",
        },
        {
            "name": "products",
            "description": "商品管理接口。包括商品 CRUD、分类管理等。",
        },
        {
            "name": "orders",
            "description": "订单管理接口。包括下单、查询、退款等。",
        },
        {
            "name": "admin",
            "description": "管理员接口。需要管理员权限。",
            # externalDocs 可以添加外部文档链接
            "externalDocs": {
                "description": "管理员手册",
                "url": "https://docs.example.com/admin",
            },
        },
    ]
)

# 定义模型
class User(BaseModel):
    id: int
    name: str

class Product(BaseModel):
    id: int
    name: str
    price: float

class Order(BaseModel):
    id: int
    user_id: int
    product_id: int

# 用户相关路由（tags=["users"]）
@app.get("/users", tags=["users"], summary="获取用户列表")
# 定义函数 list_users
def list_users():
    """获取所有用户的列表"""
    return [{"id": 1, "name": "alice"}]

@app.post("/users", tags=["users"], summary="创建用户")
# 定义函数 create_user，参数: user: User
def create_user(user: User):
    """创建一个新用户"""
    return user

# 商品相关路由（tags=["products"]）
@app.get("/products", tags=["products"], summary="获取商品列表")
# 定义函数 list_products
def list_products():
    """获取所有商品的列表"""
    return [{"id": 1, "name": "苹果", "price": 5.0}]

@app.post("/products", tags=["products"], summary="创建商品")
# 定义函数 create_product，参数: product: Product
def create_product(product: Product):
    """创建一个新商品"""
    return product

# 订单相关路由（tags=["orders"]）
@app.get("/orders", tags=["orders"], summary="获取订单列表")
# 定义函数 list_orders
def list_orders():
    """获取所有订单的列表"""
    return [{"id": 1, "user_id": 1, "product_id": 1}]

@app.post("/orders", tags=["orders"], summary="创建订单")
# 定义函数 create_order，参数: order: Order
def create_order(order: Order):
    """创建一个新订单"""
    return order

# 管理员路由（tags=["admin"]）
@app.delete("/admin/users/{user_id}", tags=["admin"], summary="删除用户")
# 定义函数 admin_delete_user，参数: user_id: int
def admin_delete_user(user_id: int):
    """管理员删除用户（需要管理员权限）"""
    return {"deleted": user_id}

# tags 的效果：
# Swagger UI 会按 tags 分组展示路由
# 顺序按 openapi_tags 中定义的顺序
# 每个 tag 的 description 会显示在分组标题下
\`\`\`

## 五、openapi_extra 扩展

OpenAPI 规范支持自定义扩展字段（以 \`x-\` 开头）。用 \`openapi_extra\` 可以在路由的 OpenAPI 定义中添加任意扩展。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# openapi_extra 可以添加自定义字段到 OpenAPI 定义
@app.get(
    "/special",
    openapi_extra={
        # x- 开头的字段是 OpenAPI 扩展字段
        "x-custom-field": "custom value",
        # 可以添加自定义的请求头说明
        "x-rate-limit": {
            "requests": 100,
            "per": "minute"
        },
        # 可以添加自定义的响应示例
        "x-examples": {
            "success": {"value": {"status": "ok"}},
            "error": {"value": {"status": "error", "message": "失败"}}
        },
    },
)
# 定义函数 special_endpoint
def special_endpoint():
    """带自定义 OpenAPI 扩展的接口"""
    return {"status": "ok"}

# 也可以用 openapi_extra 覆盖自动生成的 schema
@app.post(
    "/webhook",
    openapi_extra={
        # 覆盖请求体的 schema（比如接收第三方 webhook 的特殊格式）
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "event": {"type": "string"},
                            "data": {"type": "object"},
                        },
                    }
                }
            },
        },
    },
)
# 定义函数 webhook
def webhook():
    """接收第三方 webhook，格式特殊，用 openapi_extra 手动定义 schema"""
    return {"received": True}
\`\`\`

## 六、Swagger UI / ReDoc 自定义

FastAPI 允许自定义文档界面的 URL、参数，甚至完全关闭文档。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 情况 1：自定义文档 URL
# 默认 /docs 和 /redoc，可以改
# 定义变量 app1，赋值为 FastAPI(docs_url="/documentation", redoc_url="/redoc-docs")
app1 = FastAPI(
    docs_url="/documentation",   # Swagger UI 改到 /documentation
    redoc_url="/redoc-docs",     # ReDoc 改到 /redoc-docs
    openapi_url="/api-spec.json" # OpenAPI JSON 改到 /api-spec.json
)

# 情况 2：完全关闭文档（生产环境可选）
# 定义变量 app2，赋值为 FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app2 = FastAPI(
    docs_url=None,       # 关闭 Swagger UI
    redoc_url=None,      # 关闭 ReDoc
    openapi_url=None,    # 关闭 OpenAPI JSON
)

# 情况 3：自定义 Swagger UI 参数
# 定义变量 app3，赋值为 FastAPI()
app3 = FastAPI()

# 自定义 Swagger UI 的初始化参数
# 定义函数 custom_swagger_ui_html
@app3.get("/custom-docs", include_in_schema=False)
async def custom_swagger_ui_html():
    # 返回自定义的 Swagger UI 页面
    from fastapi.responses import HTMLResponse
    return HTMLResponse("""
<!DOCTYPE html>
<html>
<head>
    <title>自定义 API 文档</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        // 自定义 Swagger UI 配置
        const ui = SwaggerUIBundle({
            url: '/openapi.json',  // OpenAPI JSON 的 URL
            dom_id: '#swagger-ui',
            // 自定义参数
            deepLinking: true,          // 允许深链接到具体路由
            presets: [SwaggerUIBundle.presets.apis],
            layout: "BaseLayout",
            // 自定义主题色（CSS 变量）
            theme: {
                logo: {
                    backgroundColor: "#1890ff"
                }
            },
            // 默认展开所有路由
            docExpansion: "none",       // none: 全部折叠; list: 展开列表; full: 全部展开
            // 显示通用参数
            displayRequestDuration: true,  // 显示请求耗时
        });
    </script>
</body>
</html>
    """)

# 情况 4：控制路由是否出现在文档中
@app3.get("/public", tags=["公共"])
# 定义函数 public_endpoint
def public_endpoint():
    """这个接口会出现在文档中"""
    return {"msg": "public"}

@app3.get("/internal", include_in_schema=False)
# 定义函数 internal_endpoint
def internal_endpoint():
    """这个接口不会出现在文档中（内部接口）"""
    return {"msg": "internal"}

# include_in_schema=False 让路由不出现在 OpenAPI 文档中
# 适合内部接口、健康检查等不需要对外暴露的路由
\`\`\`

## 七、设计思想：文档即代码

FastAPI 的文档理念是**文档即代码**——文档从代码自动生成，而不是单独维护。这解决了「文档和代码不同步」的老问题。

传统方式的痛点：开发写代码，运维写文档，文档跟不上代码变化。文档过期了没人更新，最终文档变成「仅供参考」的废纸。

FastAPI 的方式：代码就是文档。你改了路由，文档自动更新。你加了 Pydantic 模型，文档自动展示字段说明。你加了 responses，文档自动显示错误码。**只要代码是对的，文档就是对的**。

但要发挥文档的最大价值，要注意：
1. **写好 docstring**：路由函数的 docstring 会显示在文档里，这是最好的接口说明。
2. **用 summary 和 description**：summary 简短（一句话），description 详细（可以 Markdown）。
3. **声明 responses**：让客户端知道可能遇到的错误。
4. **用 tags 分组**：API 多了必须有分组，否则文档不可读。
5. **给 Pydantic 字段加描述**：用 \`Field(description="...")\` 让字段含义清晰。

好的 API 文档让前端开发者不用问后端就能用接口，让新成员不用问老成员就能看懂系统。这就是文档的价值。
`
  },
  {
    id: "fp-project-config",
    group: "项目工程化",
    icon: "🏗️",
    title: "项目结构与配置管理",
    content: `# 项目结构与配置管理

## 一、为什么项目结构很重要

当你写的 demo 只有 10 行代码，一个文件就够了。但真实项目有几十个路由、十几个模型、多个数据库表、各种中间件——全塞在一个文件里就是灾难。

**项目结构的核心目标是「可维护性」**：
- **找得到**：改某个功能时，能快速找到相关代码在哪。
- **改得动**：改一个功能不会影响其他功能。
- **能扩展**：加新功能有明确的位置放。
- **好测试**：每个模块可以独立测试。

类比：项目结构就像房子的户型图。厨房、卧室、卫生间各归其位，住着舒服。如果冰箱放卧室、马桶放厨房，即使东西都在，也乱得没法生活。

## 二、大型项目目录结构

这是一个推荐的 FastAPI 项目结构：

\`\`\`python
# ============================================================
# 推荐的 FastAPI 项目结构（伪代码，展示目录组织）
# ============================================================

# myproject/
# ├── app/                    # 应用主目录
# │   ├── __init__.py
# │   ├── main.py             # FastAPI 应用入口，创建 app 实例
# │   ├── config.py           # 配置管理（pydantic-settings）
# │   ├── database.py         # 数据库连接、Session 工厂
# │   ├── dependencies.py     # 全局依赖（认证、分页等）
# │   ├── models/             # SQLAlchemy ORM 模型
# │   │   ├── __init__.py
# │   │   ├── user.py         # User 模型
# │   │   ├── product.py      # Product 模型
# │   │   └── order.py        # Order 模型
# │   ├── schemas/            # Pydantic 模型（请求/响应）
# │   │   ├── __init__.py
# │   │   ├── user.py         # UserCreate, UserResponse 等
# │   │   ├── product.py
# │   │   └── order.py
# │   ├── routers/            # API 路由（APIRouter）
# │   │   ├── __init__.py
# │   │   ├── users.py        # /users 相关路由
# │   │   ├── products.py     # /products 相关路由
# │   │   └── orders.py       # /orders 相关路由
# │   ├── services/           # 业务逻辑层
# │   │   ├── __init__.py
# │   │   ├── user_service.py # 用户相关业务逻辑
# │   │   ├── product_service.py
# │   │   └── order_service.py
# │   ├── core/               # 核心工具
# │   │   ├── __init__.py
# │   │   ├── security.py     # 密码加密、JWT 生成
# │   │   ├── exceptions.py   # 自定义异常
# │   │   └── logging.py      # 日志配置
# │   └── utils/              # 通用工具函数
# │       ├── __init__.py
# │       └── pagination.py   # 分页工具
# ├── tests/                  # 测试目录
# │   ├── __init__.py
# │   ├── conftest.py         # pytest fixture
# │   ├── test_users.py
# │   └── test_products.py
# ├── alembic/                # 数据库迁移
# ├── .env                    # 环境变量（不提交到 git）
# ├── .env.example            # 环境变量示例（提交到 git）
# ├── requirements.txt        # 依赖
# ├── Dockerfile              # Docker 配置
# └── docker-compose.yml      # 多容器编排

# 设计原则：
# 1. 分层：routers（路由）→ services（业务）→ models（数据）
# 2. 分模块：每个业务实体一组文件（user/model/schema/router/service）
# 3. 配置与代码分离：.env 管配置，代码读配置
# 4. 测试与代码分离：tests/ 目录独立
\`\`\`

## 三、APIRouter 模块化路由

用 \`APIRouter\` 把路由按模块拆分，每个模块一个文件，最后在 main.py 里汇总。

\`\`\`python
# ============================================================
# app/routers/users.py —— 用户路由模块
# ============================================================
# 从 fastapi 导入 APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 APIRouter 实例
# prefix: 所有路由自动加 /users 前缀
# tags: 文档分组
# 定义变量 router，赋值为 APIRouter(prefix="/users", tags=["用户管理"])
router = APIRouter(
    prefix="/users",        # 所有路由自动加 /users 前缀
    tags=["用户管理"],      # 文档分组
    responses={404: {"description": "用户不存在"}},
)

# 定义 Pydantic 模型
class UserCreate(BaseModel):
    username: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

# 模拟数据库
# 定义变量 fake_db，赋值为 {}
fake_db = {}

# 定义路由
@router.get("/", summary="获取用户列表")
# 定义函数 list_users
def list_users():
    """获取所有用户"""
    return list(fake_db.values())

@router.get("/{user_id}", response_model=UserResponse, summary="获取单个用户")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    """根据 ID 获取用户"""
    if user_id not in fake_db:
        raise HTTPException(404, "用户不存在")
    return fake_db[user_id]

@router.post("/", response_model=UserResponse, status_code=201, summary="创建用户")
# 定义函数 create_user，参数: user: UserCreate
def create_user(user: UserCreate):
    """创建新用户"""
    user_id = len(fake_db) + 1
    new_user = {"id": user_id, **user.model_dump()}
    fake_db[user_id] = new_user
    return new_user

# ============================================================
# app/main.py —— 应用入口
# ============================================================
# from fastapi import FastAPI
# 导入所有路由模块
# from app.routers import users, products, orders

# 创建应用
# 定义变量 app，赋值为 FastAPI(title="我的 API")
# app = FastAPI(title="我的 API")

# 注册路由
# app.include_router(users.router)
# app.include_router(products.router, prefix="/products")
# app.include_router(orders.router)

# include_router 的好处：
# 1. 路由分文件管理，不挤在一个 main.py
# 2. 每个模块有自己的 prefix 和 tags
# 3. 可以按需加载（比如管理后台路由单独一组）
\`\`\`

## 四、pydantic-settings 配置管理

\`pydantic-settings\` 是 Pydantic 的配置管理库，能从环境变量、.env 文件读取配置，并做类型校验。

\`\`\`python
# ============================================================
# app/config.py —— 配置管理
# ============================================================
# 安装: pip install pydantic-settings
# 从 pydantic_settings 导入 BaseSettings, SettingsConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

# 定义配置类 Settings，继承 BaseSettings
class Settings(BaseSettings):
    # SettingsConfigDict 配置 settings 的行为
    model_config = SettingsConfigDict(
        env_file=".env",          # 从 .env 文件读取
        env_file_encoding="utf-8",
        case_sensitive=True,      # 环境变量名大小写敏感
    )

    # 应用配置
    APP_NAME: str = "我的 API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # 数据库配置
    DATABASE_URL: str = "postgresql://user:pass@localhost/db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # Redis 配置
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT 配置
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # CORS 配置
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # 第三方服务配置
    SENDGRID_API_KEY: str = ""
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""

# 创建全局配置实例
# 定义变量 settings，赋值为 Settings()
settings = Settings()

# 使用配置
# 定义变量 APP_NAME，赋值为 settings.APP_NAME
APP_NAME = settings.APP_NAME
# 定义变量 DATABASE_URL，赋值为 settings.DATABASE_URL
DATABASE_URL = settings.DATABASE_URL

# .env 文件内容示例：
# APP_NAME=生产环境 API
# DEBUG=False
# DATABASE_URL=postgresql://produser:prodpass@db:5432/proddb
# SECRET_KEY=a-very-secure-secret-key
# SENDGRID_API_KEY=SG.xxx

# pydantic-settings 的优势：
# 1. 类型校验：DEBUG=true 会被转成布尔值，类型错了会报错
# 2. 默认值：没设置的环境变量用默认值
# 3. .env 支持：开发环境用 .env，生产环境用系统环境变量
# 4. IDE 提示：settings.APP_NAME 有代码补全
\`\`\`

## 五、多环境配置（dev/staging/prod）

不同环境（开发、测试、生产）需要不同配置。用继承的方式管理。

\`\`\`python
# ============================================================
# 多环境配置方案
# ============================================================
# 从 pydantic_settings 导入 BaseSettings, SettingsConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
# 导入 os 模块
import os

# 基础配置（所有环境共享）
class BaseConfig(BaseSettings):
    """基础配置，子类继承"""
    APP_NAME: str = "API"
    API_V1_PREFIX: str = "/api/v1"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# 开发环境配置
class DevConfig(BaseConfig):
    """开发环境"""
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://dev:dev@localhost/dev_db"
    SECRET_KEY: str = "dev-secret-key"
    LOG_LEVEL: str = "DEBUG"
    model_config = SettingsConfigDict(env_file=".env.dev", extra="ignore")

# 测试环境配置
class TestConfig(BaseConfig):
    """测试环境"""
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./test.db"  # 测试用 SQLite
    SECRET_KEY: str = "test-secret-key"
    LOG_LEVEL: str = "INFO"
    model_config = SettingsConfigDict(env_file=".env.test", extra="ignore")

# 生产环境配置
class ProdConfig(BaseConfig):
    """生产环境"""
    DEBUG: bool = False
    DATABASE_URL: str = ""  # 必须从环境变量读取
    SECRET_KEY: str = ""    # 必须从环境变量读取
    LOG_LEVEL: str = "WARNING"
    model_config = SettingsConfigDict(env_file=".env.prod", extra="ignore")

# 配置工厂：根据环境变量选择配置
# 定义函数 get_config
def get_config():
    """根据 ENVIRONMENT 环境变量返回对应的配置类"""
    # 读取环境变量 ENVIRONMENT，默认 dev
    env = os.getenv("ENVIRONMENT", "dev").lower()
    if env == "dev":
        # 返回开发配置
        return DevConfig()
    elif env == "test":
        # 返回测试配置
        return TestConfig()
    elif env == "prod":
        # 返回生产配置
        return ProdConfig()
    else:
        # 未知环境，默认开发
        return DevConfig()

# 创建全局配置实例
# 定义变量 settings，赋值为 get_config()
settings = get_config()

# 使用时直接引用 settings
# print(settings.DEBUG)        # True/False 取决于环境
# print(settings.DATABASE_URL) # 不同环境不同 URL

# 在 main.py 中使用：
# from app.config import settings
# 定义变量 app，赋值为 FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)
# app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# 启动时指定环境：
# 开发: ENVIRONMENT=dev uvicorn app.main:app --reload
# 测试: ENVIRONMENT=dev pytest
# 生产: ENVIRONMENT=prod uvicorn app.main:app
\`\`\`

## 六、.env 文件管理

\`.env\` 文件存放环境变量，**绝对不能提交到 git**（里面有密码、密钥等敏感信息）。

\`\`\`python
# ============================================================
# .env 文件管理最佳实践
# ============================================================

# .env.example 文件（提交到 git，作为模板）
# 内容如下：
# ----
# # 环境变量模板，复制为 .env 并填入真实值
# # 应用
# APP_NAME=My API
# DEBUG=True
# # 数据库
# DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
# DB_POOL_SIZE=10
# # Redis
# REDIS_URL=redis://localhost:6379/0
# # JWT
# SECRET_KEY=your-secret-key-here
# ACCESS_TOKEN_EXPIRE_MINUTES=30
# # 第三方服务
# SENDGRID_API_KEY=SG.xxx
# AWS_ACCESS_KEY=AKIxxx
# AWS_SECRET_KEY=xxx
# ----

# .env 文件（不提交到 git，每个环境不同）
# 内容如下（真实值）：
# ----
# APP_NAME=我的生产 API
# DEBUG=False
# DATABASE_URL=postgresql://produser:realpassword@10.0.0.1:5432/proddb
# SECRET_KEY=super-secret-key-for-production
# ----

# .gitignore 中必须包含 .env：
# ----
# .env
# .env.local
# .env.*.local
# ----

# 在 Python 中加载 .env：
# 方式 1：pydantic-settings 自动加载（推荐）
# from pydantic_settings import BaseSettings
# class Settings(BaseSettings):
#     model_config = SettingsConfigDict(env_file=".env")
#     DATABASE_URL: str

# 方式 2：python-dotenv 手动加载
# 安装: pip install python-dotenv
# from dotenv import load_dotenv
# 调用 load_dotenv()  # 加载 .env 文件到环境变量
# import os
# 定义变量 db_url，赋值为 os.getenv("DATABASE_URL")

# .env 管理原则：
# 1. .env.example 提交到 git，.env 不提交
# 2. 新成员 clone 项目后，复制 .env.example 为 .env，填入自己的值
# 3. 生产环境的 .env 由运维管理，不在代码仓库里
# 4. 敏感信息（密码、密钥）永远不在代码里硬编码
\`\`\`

## 七、依赖注入组织

随着项目变大，依赖会越来越多。合理组织依赖是关键。

\`\`\`python
# ============================================================
# app/dependencies.py —— 全局依赖
# ============================================================
# 从 fastapi 导入 Depends, HTTPException, Header
from fastapi import Depends, HTTPException, Header
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session
# 导入 Optional
from typing import Optional

# 导入配置和数据库
# from app.config import settings
# from app.database import SessionLocal

# ---------- 数据库依赖 ----------
# 定义函数 get_db
def get_db():
    """获取数据库 Session，用完自动关闭"""
    # 这是生成器依赖，用 yield
    # 定义变量 db，赋值为 SessionLocal()
    db = None  # 模拟，实际: db = SessionLocal()
    try:
        # yield 之前：准备资源
        yield db
    finally:
        # yield 之后：清理资源
        # db.close()  # 关闭 Session
        pass

# ---------- 认证依赖 ----------
# 定义变量 oauth2_scheme，赋值为 OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 定义函数 get_current_user，参数: token = Depends(oauth2_scheme)
def get_current_user(token: str = Depends(oauth2_scheme)):
    """验证 token，返回当前用户"""
    # 真实环境：解码 JWT，查数据库
    if not token:
        raise HTTPException(401, "未认证")
    # 返回模拟用户
    return {"user_id": 1, "username": "alice", "role": "admin"}

# 定义函数 get_current_active_user，参数: user = Depends(get_current_user)
def get_current_active_user(user = Depends(get_current_user)):
    """确保用户是激活状态"""
    if not user.get("is_active", True):
        raise HTTPException(400, "用户未激活")
    return user

# 定义函数 get_admin_user，参数: user = Depends(get_current_user)
def get_admin_user(user = Depends(get_current_user)):
    """确保用户是管理员"""
    if user["role"] != "admin":
        raise HTTPException(403, "需要管理员权限")
    return user

# ---------- 分页依赖 ----------
# 定义函数 get_pagination_params，参数: page: int = 1, size: int = 10
def get_pagination_params(page: int = 1, size: int = 10):
    """通用分页参数依赖"""
    if page < 1:
        page = 1
    if size < 1 or size > 100:
        size = 10
    # 返回分页参数
    return {"page": page, "size": size, "offset": (page - 1) * size}

# ---------- 在路由中使用 ----------
# from fastapi import APIRouter
# 定义变量 router，赋值为 APIRouter(prefix="/users", tags=["用户"])

# @router.get("/")
# 定义函数 list_users，参数: db = Depends(get_db), pagination = Depends(get_pagination_params)
# def list_users(db = Depends(get_db), pagination = Depends(get_pagination_params)):
#     # 使用 db 查询
#     # 使用 pagination 分页
#     offset = pagination["offset"]
#     size = pagination["size"]
#     return {"page": pagination["page"], "items": []}

# @router.get("/me")
# 定义函数 get_me，参数: user = Depends(get_current_active_user)
# def get_me(user = Depends(get_current_active_user)):
#     return user

# @router.delete("/{user_id}")
# 定义函数 delete_user，参数: user_id: int, admin = Depends(get_admin_user)
# def delete_user(user_id: int, admin = Depends(get_admin_user)):
#     return {"deleted": user_id, "by": admin["username"]}

# 依赖注入的组织原则：
# 1. 全局依赖放 dependencies.py，模块专属依赖放模块内
# 2. 依赖可以嵌套：get_admin_user 依赖 get_current_user
# 3. 依赖可以带参数：get_pagination_params 从查询参数获取 page/size
# 4. 依赖可复用：多个路由共用 get_current_user
# 5. 依赖可测试：测试时用 dependency_overrides 替换
\`\`\`

## 八、设计思想：分层与解耦

好的项目结构遵循**分层架构**：

1. **路由层（routers）**：接收请求，调用业务层，返回响应。不含业务逻辑。
2. **业务层（services）**：核心业务逻辑。调用数据层，不关心 HTTP。
3. **数据层（models）**：数据库模型和查询。不含业务规则。
4. **Schema 层（schemas）**：Pydantic 模型，定义请求和响应的数据格式。

为什么要分层？**解耦**。路由层不关心数据怎么存的（换数据库不影响路由），业务层不关心 HTTP 怎么传的（可以同时支持 REST 和 GraphQL），数据层不关心业务规则（只负责存取）。

类比：餐厅分工。服务员（路由层）负责点单和上菜，厨师（业务层）负责做菜，采购员（数据层）负责买菜。各司其职，换一个服务员不影响做菜质量，换一个采购员不影响点单流程。

**配置管理的核心原则**：**代码不包含环境信息**。环境信息（数据库地址、密钥、调试开关）全部从配置读取，代码在不同环境跑只是配置不同。这就是 12-Factor App 的「配置分离」原则。

最后，**没有完美的项目结构，只有适合团队的结构**。小项目可以简化（routers + models 两个目录够了），大项目可以更细分（加 repositories、middlewares、tasks 等）。结构是为团队服务的，不是为结构本身服务的。
`
  },
  {
    id: "fp-deploy",
    group: "项目工程化",
    icon: "🚀",
    title: "部署：Docker + Gunicorn + Nginx",
    content: `# 部署：Docker + Gunicorn + Nginx

## 一、部署架构总览

开发时我们用 \`uvicorn app.main:app --reload\` 单进程跑。但生产环境不能这样——单进程扛不住并发，没有进程管理，没有反向代理。

生产环境的标准架构是：

**客户端 → Nginx（反向代理）→ Gunicorn（进程管理）→ Uvicorn Worker（ASGI 应用）**

每一层有不同职责：
- **Nginx**：处理 HTTPS、静态文件、负载均衡、请求过滤。它是「门卫」，所有请求先到 Nginx。
- **Gunicorn**：进程管理器，管理多个 Uvicorn worker 进程。某个 worker 崩了，Gunicorn 自动重启。
- **Uvicorn Worker**：实际运行 FastAPI 应用的 ASGI 服务器。Gunicorn 启动多个 Uvicorn worker 实现多进程并发。

类比：Nginx 是酒店大堂经理（分流客户），Gunicorn 是楼层主管（管理多个服务员），Uvicorn Worker 是服务员（实际服务客户）。一层管一层，各司其职。

## 二、Dockerfile 编写

Docker 把应用和依赖打包成一个镜像，保证「在我机器上能跑，在你机器上也能跑」。

\`\`\`dockerfile
# ============================================================
# Dockerfile —— FastAPI 应用镜像
# ============================================================

# 使用官方 Python slim 镜像（比完整版小很多）
# slim 版本只有 Python 运行时，没有编译工具，镜像更小更安全
FROM python:3.11-slim

# 设置工作目录
# 后续所有操作都在 /app 目录下进行
WORKDIR /app

# 设置环境变量
# PYTHONUNBUFFERED=1: Python 输出不缓冲，日志立刻显示
# PYTHONDONTWRITEBYTECODE=1: 不生成 .pyc 文件，节省空间
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=1

# 安装系统依赖
# 某些 Python 包需要系统库（如 psycopg2 需要 libpq）
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# 先复制 requirements.txt（利用 Docker 缓存层）
# 如果 requirements.txt 没变，这层缓存命中，不会重新安装依赖
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 再复制项目代码
# 放在安装依赖之后，这样改代码不会重新装依赖
COPY . .

# 暴露端口（只是声明，实际映射用 -p 参数）
EXPOSE 8000

# 默认启动命令
# 用 Gunicorn 启动，4 个 Uvicorn worker
# -w 4: 4 个 worker 进程
# -k uvicorn.workers.UvicornWorker: 用 Uvicorn worker（支持 ASGI）
# -b 0.0.0.0:8000: 监听所有网卡的 8000 端口
# app.main:app: FastAPI 应用实例的位置
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "app.main:app"]

# 构建镜像: docker build -t myapi .
# 运行容器: docker run -d -p 8000:8000 myapi
\`\`\`

## 三、Dockerfile 多阶段构建（优化镜像大小）

多阶段构建用两个阶段：编译阶段安装编译工具，运行阶段只拷贝编译结果。最终镜像不含编译工具，更小更安全。

\`\`\`dockerfile
# ============================================================
# Dockerfile.multistage —— 多阶段构建，镜像更小
# ============================================================

# 阶段 1：builder（编译阶段）
FROM python:3.11-slim AS builder

WORKDIR /app

# 安装编译依赖（这个阶段才需要）
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# 创建虚拟环境
RUN python -m venv /opt/venv
# 激活虚拟环境的路径
ENV PATH="/opt/venv/bin:$PATH"

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 阶段 2：runner（运行阶段）
FROM python:3.11-slim AS runner

WORKDIR /app

# 只安装运行时需要的系统库（不需要 build-essential）
RUN apt-get update && apt-get install -y --no-install-recommends \\
    libpq5 \\
    && rm -rf /var/lib/apt/lists/*

# 从 builder 阶段拷贝虚拟环境（已编译好的依赖）
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 拷贝项目代码
COPY . .

# 创建非 root 用户运行（安全最佳实践）
# 用 root 运行容器有安全风险，被攻破后能获取 root 权限
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# 健康检查：每 30 秒检查一次应用是否正常
# curl http://localhost:8000/health 返回 200 才算健康
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "app.main:app"]

# 对比：
# 单阶段镜像: ~900MB（包含 build-essential 等编译工具）
# 多阶段镜像: ~300MB（只有运行时依赖）
# 减少了 60%+ 的镜像大小
\`\`\`

## 四、docker-compose 多容器编排

真实应用通常有多个容器：API + 数据库 + Redis + Nginx。docker-compose 把它们编排在一起。

\`\`\`yaml
# ============================================================
# docker-compose.yml —— 多容器编排
# ============================================================

# version: '3.8'  # 新版本 docker compose 不需要 version 字段

services:
  # API 服务
  api:
    build: .
    # 或者用已构建的镜像: image: myapi:latest
    container_name: myapi-api
    ports:
      - "8000:8000"  # 映射端口: 主机:容器
    environment:
      - ENVIRONMENT=prod
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=\${SECRET_KEY}  # 从 .env 文件读取
    depends_on:
      db:
        condition: service_healthy  # 等 db 健康检查通过才启动
      redis:
        condition: service_started
    restart: always  # 容器崩了自动重启
    volumes:
      - ./logs:/app/logs  # 日志挂载到主机，方便查看
    networks:
      - mynetwork

  # PostgreSQL 数据库
  db:
    image: postgres:16-alpine
    container_name: myapi-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data  # 数据持久化
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    networks:
      - mynetwork

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: myapi-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: always
    networks:
      - mynetwork

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: myapi-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro  # 挂载配置文件
      - ./ssl:/etc/nginx/ssl:ro  # 挂载 SSL 证书
    depends_on:
      - api
    restart: always
    networks:
      - mynetwork

# 数据卷（持久化存储）
volumes:
  db_data:    # PostgreSQL 数据
  redis_data: # Redis 数据

# 网络（容器间通信）
networks:
  mynetwork:
    driver: bridge

# 启动: docker compose up -d
# 查看日志: docker compose logs -f api
# 停止: docker compose down
# 重建: docker compose up -d --build
\`\`\`

## 五、Gunicorn + Uvicorn Worker 配置

Gunicorn 管理多个 Uvicorn worker 进程，是 ASGI 应用的标准部署方式。

\`\`\`python
# ============================================================
# gunicorn.conf.py —— Gunicorn 配置文件
# ============================================================
# 启动: gunicorn -c gunicorn.conf.py app.main:app

# 导入 multiprocessing 和 os
import multiprocessing
import os

# 绑定地址
bind = "0.0.0.0:8000"

# worker 数量
# 经验公式: CPU 核心数 * 2 + 1
# 也可以用环境变量覆盖
# 定义变量 workers，赋值为 int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))

# worker 类型：用 Uvicorn worker 支持 ASGI
worker_class = "uvicorn.workers.UvicornWorker"

# 每个 worker 的最大请求数
# 处理这么多请求后 worker 重启，防止内存泄漏
max_requests = 1000

# 重启时的随机抖动（0-100 之间），防止所有 worker 同时重启
max_requests_jitter = 50

# 超时：worker 处理一个请求的最大时间（秒）
# 超过这个时间 worker 被强制杀掉重启
timeout = 120

# 优雅超时：收到重启信号后，给 worker 多少秒完成正在处理的请求
graceful_timeout = 30

# 保持连接的超时（秒）
keepalive = 5

# 日志
accesslog = "-"  # 访问日志输出到 stdout
errorlog = "-"   # 错误日志输出到 stderr
loglevel = "info"  # 日志级别: debug/info/warning/error/critical

# 进程名（ps 命令看到的名字）
proc_name = "myapi"

# 预加载应用
# 在 fork worker 之前加载应用代码
# 好处：节省内存（代码只加载一次），加快 worker 启动
# 坏处：如果应用有 fork 不安全的代码（如数据库连接），会出问题
preload_app = True

# ============================================================
# Dockerfile 中的启动命令
# CMD ["gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]
# ============================================================
\`\`\`

**worker 数量怎么选**：
- I/O 密集型（API 服务）：CPU 核心数 * 2 + 1（甚至更多）
- CPU 密集型：CPU 核心数 + 1（太多会争抢 CPU）
- 内存受限：worker 数 * 单 worker 内存 < 总内存

## 六、Nginx 反向代理配置

Nginx 放在最前面，处理 HTTPS、负载均衡、静态文件。

\`\`\`nginx
# ============================================================
# nginx.conf —— Nginx 反向代理配置
# ============================================================

# worker 进程数，auto 表示自动匹配 CPU 核心数
worker_processes auto;

# PID 文件位置
pid /var/run/nginx.pid;

# 事件模块
events {
    # 每个 worker 的最大连接数
    worker_connections 1024;
}

http {
    # MIME 类型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'rt=$request_time';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # 传输优化
    sendfile on;           # 高效文件传输
    tcp_nopush on;         # 数据包累积后一起发送
    tcp_nodelay on;        # 禁用 Nagle 算法，小数据立即发送
    keepalive_timeout 65;  # 保持连接超时

    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
    gzip_min_length 1000;

    # 上游服务（FastAPI）
    upstream fastapi_backend {
        # 负载均衡：多个 API 实例
        # 可以是多个容器/服务器
        server api:8000 weight=1;  # Docker Compose 中的 api 服务
        # server api2:8000 weight=1;  # 第二个实例
        # server api3:8000 weight=1;  # 第三个实例

        # 负载均衡策略:
        # 默认轮询（round_robin）
        # least_conn: 最少连接数
        # ip_hash: 同一 IP 固定到同一后端（WebSocket 需要）
        # ip_hash;
    }

    # HTTP → HTTPS 重定向
    server {
        listen 80;
        server_name api.example.com;

        # 所有 HTTP 请求重定向到 HTTPS
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 服务
    server {
        listen 443 ssl;
        server_name api.example.com;

        # SSL 证书
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL 优化
        ssl_protocols TLSv1.2 TLSv1.3;  # 只用安全的协议
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 请求体大小限制（文件上传需要调大）
        client_max_body_size 10M;

        # 代理设置
        location / {
            proxy_pass http://fastapi_backend;

            # 传递客户端信息给后端
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            # 超时设置
            proxy_connect_timeout 30s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 健康检查端点（不记日志）
        location /health {
            proxy_pass http://fastapi_backend/health;
            access_log off;
        }

        # 限流（防止恶意请求）
        location /api/ {
            proxy_pass http://fastapi_backend;
            # 限流: 每个 IP 每秒最多 10 个请求
            limit_req zone=api burst=20 nodelay;
        }
    }

    # 限流区域定义
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
\`\`\`

## 七、HTTPS/SSL 配置

生产环境必须 HTTPS。用 Let's Encrypt 免费证书，或购买商业证书。

\`\`\`bash
# ============================================================
# HTTPS/SSL 配置步骤
# ============================================================

# 方式 1: 用 Let's Encrypt 免费证书（推荐）
# 安装 certbot
# sudo apt install certbot python3-certbot-nginx

# 获取证书（自动修改 nginx 配置）
# sudo certbot --nginx -d api.example.com

# 证书自动续期（Let's Encrypt 证书 90 天过期）
# 添加 crontab:
# 0 3 * * * certbot renew --quiet --post-hook "nginx -s reload"

# 方式 2: 自签名证书（仅测试用）
# 生成私钥
# openssl genrsa -out privkey.pem 2048
# 生成证书签名请求
# openssl req -new -key privkey.pem -out cert.csr
# 生成自签名证书
# openssl x509 -req -days 365 -in cert.csr -signkey privkey.pem -out fullchain.pem

# 方式 3: 用 acme.sh 自动管理证书
# 安装: curl https://get.acme.sh | sh
# 签发: acme.sh --issue -d api.example.com --nginx
# 安装: acme.sh --install-cert -d api.example.com \\
#   --key-file /etc/nginx/ssl/privkey.pem \\
#   --fullchain-file /etc/nginx/ssl/fullchain.pem \\
#   --reloadcmd "nginx -s reload"

# 在 FastAPI 中获取真实客户端 IP
# Nginx 代理后，FastAPI 收到的 IP 是 Nginx 的 IP
# 需要从 X-Forwarded-For 头获取真实 IP
\`\`\`

\`\`\`python
# 在 FastAPI 中正确处理代理后的 IP
# 从 fastapi 导入 FastAPI, Request
from fastapi import FastAPI, Request

# 创建应用
# 定义变量 app，赋值为 FastAPI()
app = FastAPI()

# 定义函数 get_client_ip，参数: request
def get_client_ip(request: Request) -> str:
    """获取真实客户端 IP（经过 Nginx 代理后）"""
    # X-Forwarded-For 头包含: 客户端IP, 代理1IP, 代理2IP...
    # 第一个就是真实客户端 IP
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # 取第一个 IP
        return forwarded.split(",")[0].strip()
    # 没有代理头，直接用客户端地址
    return request.client.host

@app.get("/my-ip")
# 定义函数 my_ip，参数: request: Request
def my_ip(request: Request):
    # 返回客户端 IP
    return {"ip": get_client_ip(request)}

# 还需要告诉 Uvicorn 信任代理头
# 启动时加参数: --proxy-headers
# gunicorn -k uvicorn.workers.UvicornWorker --proxy-headers app.main:app
\`\`\`

## 八、日志收集与监控

生产环境必须收集日志和监控指标，否则出问题时两眼一抹黑。

\`\`\`python
# ============================================================
# app/core/logging.py —— 日志配置
# ============================================================
# 导入 logging 模块
import logging
# 导入 sys
import sys

# 定义函数 setup_logging，参数: level="INFO"
def setup_logging(level: str = "INFO"):
    """配置应用日志"""
    # 创建日志格式
    # 时间 | 级别 | 模块 | 消息
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"

    # 配置 root logger
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format=fmt,
        datefmt=datefmt,
        handlers=[
            # 输出到 stdout（Docker 收集）
            logging.StreamHandler(sys.stdout),
        ],
    )

    # 配置 Uvicorn 日志
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)

    # 返回 logger
    return logging.getLogger("myapi")

# 在 main.py 中使用
# from app.core.logging import setup_logging
# 定义变量 logger，赋值为 setup_logging(settings.LOG_LEVEL)
# logger.info("应用启动")

# ============================================================
# app/main.py —— 应用入口
# ============================================================
# from fastapi import FastAPI
# from app.config import settings
# from app.core.logging import setup_logging

# 定义变量 logger，赋值为 setup_logging()
# 定义变量 app，赋值为 FastAPI(title=settings.APP_NAME)

# @app.on_event("startup")
# 定义 async 函数 startup
# async def startup():
#     logger.info("FastAPI 应用启动")
#     logger.info(f"环境: {settings.ENVIRONMENT}")
#     logger.info(f"数据库: {settings.DATABASE_URL[:30]}...")  # 不打印完整 URL（有密码）

# @app.on_event("shutdown")
# 定义 async 函数 shutdown
# async def shutdown():
#     logger.info("FastAPI 应用关闭")

# @app.get("/health")
# 定义函数 health
def health():
    """健康检查端点（Nginx/Docker 用）"""
    return {"status": "healthy"}

# @app.middleware("http")
# 定义 async 函数 log_requests，参数: request, call_next
async def log_requests(request, call_next):
    """记录每个请求的日志"""
    import time
    # 记录开始时间
    start = time.time()
    # 处理请求
    response = await call_next(request)
    # 计算耗时
    duration = time.time() - start
    # 记录日志
    logger.info(
        f"{request.method} {request.url.path} "
        f"-> {response.status_code} ({duration:.3f}s)"
    )
    # 返回响应
    return response
\`\`\`

\`\`\`yaml
# ============================================================
# docker-compose.yml 中的日志和监控扩展
# ============================================================

# services:
#   api:
#     logging:
#       # Docker 日志驱动
#       driver: "json-file"
#       options:
#         max-size: "10m"    # 单个日志文件最大 10MB
#         max-file: "3"      # 最多 3 个日志文件
#
#   prometheus:  # 指标收集
#     image: prom/prometheus
#     ports:
#       - "9090:9090"
#     volumes:
#       - ./prometheus.yml:/etc/prometheus/prometheus.yml
#
#   grafana:  # 监控面板
#     image: grafana/grafana
#     ports:
#       - "3000:3000"
\`\`\`

## 九、CI/CD 基础

CI/CD（持续集成/持续部署）让代码从提交到上线全自动。

\`\`\`yaml
# ============================================================
# .github/workflows/deploy.yml —— GitHub Actions CI/CD
# ============================================================
# 代码推送到 main 分支时自动构建并部署

name: Build and Deploy

# 触发条件
on:
  push:
    branches: [main]  # main 分支推送时触发
  pull_request:
    branches: [main]  # PR 到 main 时触发

jobs:
  # 任务 1：测试
  test:
    runs-on: ubuntu-latest
    steps:
      # 检出代码
      - uses: actions/checkout@v4

      # 安装 Python
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      # 安装依赖
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov

      # 运行测试
      - name: Run tests
        run: pytest --cov=app --cov-report=xml

      # 上传覆盖率
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  # 任务 2：构建并推送 Docker 镜像（依赖测试通过）
  build:
    needs: test  # 等 test 任务通过才执行
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'  # 只在 main 分支构建
    steps:
      - uses: actions/checkout@v4

      # 登录 Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: $\{{ secrets.DOCKER_USERNAME }}
          password: $\{{ secrets.DOCKER_PASSWORD }}

      # 构建并推送镜像
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            myusername/myapi:latest
            myusername/myapi:$\{{ github.sha }}

  # 任务 3：部署到服务器（依赖构建完成）
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      # 通过 SSH 连接到服务器执行部署命令
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: $\{{ secrets.SERVER_HOST }}
          username: $\{{ secrets.SERVER_USER }}
          key: $\{{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # 拉取最新镜像
            docker pull myusername/myapi:latest
            # 重启容器
            docker compose up -d --build
            # 清理旧镜像
            docker image prune -f

# CI/CD 流程:
# 1. 开发者推送代码到 main
# 2. GitHub Actions 自动运行测试
# 3. 测试通过后构建 Docker 镜像，推送到 Docker Hub
# 4. SSH 到生产服务器，拉取新镜像，重启容器
# 5. 整个过程无需人工干预，几分钟内完成部署
\`\`\`

## 十、设计思想：部署的目标

部署的核心目标是**可靠、可重复、可回滚**：

1. **可靠**：进程崩了能自动重启（Gunicorn 负责），服务器挂了流量能转移（Nginx 负载均衡），日志监控及时发现问题。
2. **可重复**：Docker 镜像保证「构建一次，到处运行」。CI/CD 自动化保证每次部署流程一致。
3. **可回滚**：镜像有版本 tag（git sha），出问题能快速回退到上一个版本。

**Docker 的价值**不只是「打包依赖」，更是**环境一致性**。开发、测试、生产用同一个镜像，消除了「在我机器上能跑」的问题。配合 CI/CD，从代码提交到生产部署全自动，减少了人为操作的失误。

**安全要点**：
1. 不用 root 运行容器（Dockerfile 里的 USER appuser）
2. 敏感信息用环境变量，不写进镜像
3. HTTPS 是标配，不裸奔 HTTP
4. Nginx 加安全头，防 XSS、CSRF
5. 限流防 DDoS 和恶意请求
6. 日志不打密码、密钥

部署是软件工程的最后一公里，也是最容易被忽视的一公里。代码写得再好，部署不对也是白搭。掌握 Docker + Gunicorn + Nginx 这套组合拳，90% 的 Web 应用部署都能搞定。
`
  },
];
