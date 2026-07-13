// =============================================================
// FastAPI 应用开发实战教程 - 第 13 批章节（测试 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-testclient : TestClient 测试基础
//   fa-pytest     : pytest 与 fixtures
//   fa-mock       : Mock 与依赖覆盖
//   fa-coverage   : 覆盖率与持续测试
// ============================================================

export const chapters = [
  // =========================================================
  // 第一章：TestClient 测试基础
  // =========================================================
  {
    id: "fa-testclient",
    group: "测试",
    icon: "🧪",
    title: "TestClient 测试基础",
    content: `

# TestClient 测试基础

## 一、开篇：为什么一定要写测试

很多初学者觉得"接口能跑通就行了，写测试浪费时间"。这种想法在项目只有三五个接口时似乎没问题，但只要项目一旦长大、需要重构、需要多人协作，立刻会暴露一系列问题：

- **改了 A 接口，不知道有没有把 B 接口改坏**：没有测试，你只能手动点一遍所有功能，既慢又容易漏。
- **重构没有底气**：明明只是想优化一段代码，却不敢动，因为没有测试告诉你"改完之后行为还和以前一样"。
- **回归 bug 反复出现**：今天修好的 bug，下个月又出现了，因为没人记得当初为什么这么写。
- **新人接手不敢动**：没有测试的代码，新人改一行都要提心吊胆，只能靠"祖传经验"维护。

> 一句话：**测试不是"证明代码没问题"，而是"给未来的自己留一张安全网"**。它的价值不在写它的当下，而在你三个月后回来改代码的那一秒。测试是一道防线，让你在改动时立刻知道"哪里断了"，而不是等到用户投诉才发现。

写测试还有一个常被忽视的好处：**写测试的过程会倒逼你思考边界条件**。当你想测试"创建用户"这个接口时，你会自然地想到——名字为空怎么办？重复怎么办？超长怎么办？这些思考会让你的代码更健壮。

## 二、TestClient 是什么

\`TestClient\` 是 Starlette 提供的测试客户端，在 FastAPI 里直接从 \`fastapi.testclient\` 导入。它的核心特性：

- **不需要真正启动服务器**：它直接在内存里模拟 HTTP 请求，调用你的 ASGI app，绕过了网络层。
- **不需要监听端口**：省去了"启动 uvicorn → 等端口就绪 → 发请求"的麻烦。
- **速度快**：因为没走网络，一次请求就是一次函数调用。
- **底层用 \`httpx\`**：API 风格和 \`requests\` / \`httpx\` 几乎一样，学习成本低。

> 对比：如果你用 \`requests\` 测试，必须先 \`uvicorn main:app\` 启动服务器，测试才能连上，既慢又要在 CI 里额外管理进程。TestClient 把这一切省了——它直接把请求"喂"给 app，就像调用一个函数一样。

\`\`\`txt filename="TestClient 的工作原理"
你的测试代码                    真实生产环境
    |                               |
    | client.get("/")               | 浏览器发 HTTP 请求
    v                               v
TestClient 包装请求              经过网卡、TCP、HTTP 解析
    |                               |
    +--> 直接调用 app(请求) <-----+--> uvicorn 接收，调用 app(请求)
                |                            |
                v                            v
            路由匹配、依赖注入、业务逻辑（完全一样）
                |                            |
                v                            v
            返回响应给 TestClient          返回响应给浏览器
\`\`\`

关键理解：**TestClient 和真实服务器走的是同一条代码路径**（路由匹配、依赖注入、中间件、业务逻辑），只是省略了网络传输。所以 TestClient 测过的逻辑，上线后基本不会出问题（除非网络层本身有问题）。

## 三、第一个测试：Hello World

先写一个最简单的应用，然后测它：

\`\`\`python filename="main.py —— 被测的应用"
# 从 fastapi 导入 FastAPI（应用入口类）
from fastapi import FastAPI

# 创建 FastAPI 应用实例
# app 是全局对象，所有路由都注册在它上面
app = FastAPI()

# 装饰器：app.get，定义 GET 路由，访问 / 时触发
# 参数 "/" 是路由路径，浏览器访问根路径就会执行下面的函数
@app.get("/")
# 定义函数 root，无参数
# 普通 def 即可，FastAPI 会自动用线程池处理（如果是 async def 则在事件循环里跑）
def root():
    # 返回一个字典，FastAPI 会自动转成 JSON
    # 返回 dict 时 Content-Type 自动设为 application/json
    return {"msg": "hello"}
\`\`\`

\`\`\`python filename="test_main.py —— 测试代码"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 模块导入 app 实例
from main import app

# 第 1 步：用 app 创建一个测试客户端
# 把 app 传给 TestClient，它会包装这个 app，让请求直接走内存
client = TestClient(app)

# 第 2 步：定义测试函数（函数名必须以 test_ 开头，pytest 才会识别）
def test_root():
    # 像发真实请求一样调用 client.get("/")
    # 这一步等价于：浏览器访问 http://localhost:8000/
    # 定义变量 response，保存返回的响应对象
    response = client.get("/")

    # 第 3 步：断言状态码是 200
    # assert 是 Python 关键字，条件不成立时抛 AssertionError
    assert response.status_code == 200

    # 第 4 步：断言返回的 JSON 体
    # response.json() 把响应体解析成 Python 字典
    assert response.json() == {"msg": "hello"}
\`\`\`

运行测试：\`pytest test_main.py\`，如果断言全过，会显示绿色 \`.\`，表示 1 个测试通过。

> 怎么想：测试的本质就是"调用 → 断言"。调用你要测的函数/接口，然后断言结果符合预期。TestClient 只是帮你完成了"调用 HTTP 接口"这一步。

## 四、测试各种 HTTP 方法

TestClient 对所有 HTTP 方法都做了封装，方法名和 HTTP 动词一一对应，签名和 \`httpx\` 一致：

\`\`\`python filename="测试 GET/POST/PUT/DELETE"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 创建测试客户端
client = TestClient(app)

# 测试 GET 请求
def test_get():
    # GET 请求，query 参数用 params 传递
    # 等价于访问 /items?skip=0&limit=10
    # 定义变量 r，保存响应
    r = client.get("/items", params={"skip": 0, "limit": 10})
    # 断言状态码 200
    assert r.status_code == 200

# 测试 POST 请求
def test_post():
    # POST 请求，请求体用 json 参数
    # TestClient 会自动加 Content-Type: application/json
    # 定义变量 r，发送创建商品的请求
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 断言状态码 201（创建成功）
    assert r.status_code == 201
    # 断言返回体里 name 字段
    assert r.json()["name"] == "苹果"

# 测试 PUT 请求
def test_put():
    # PUT 请求，路径参数直接拼在 url 里
    # 请求体用 json
    # 定义变量 r，更新 id=1 的商品
    r = client.put("/items/1", json={"name": "香蕉", "price": 3.0})
    # 断言状态码 200
    assert r.status_code == 200

# 测试 DELETE 请求
def test_delete():
    # DELETE 请求，路径参数拼在 url 里
    # 定义变量 r，删除 id=1 的商品
    r = client.delete("/items/1")
    # 断言状态码 204（无内容返回）
    assert r.status_code == 204
\`\`\`

**关键参数对照表**：

| 参数 | 用途 | 示例 |
| --- | --- | --- |
| \`params\` | query string 参数 | \`client.get("/x", params={"page": 1})\` |
| \`json\` | JSON 请求体（自动加 Content-Type） | \`client.post("/x", json={"a": 1})\` |
| \`headers\` | 请求头 | \`client.get("/x", headers={"X-Token": "abc"})\` |
| \`cookies\` | Cookie | \`client.get("/x", cookies={"sid": "xxx"})\` |
| \`files\` | 上传文件 | \`client.post("/upload", files={"f": b"..."})\` |
| \`data\` | 表单数据 | \`client.post("/x", data={"name": "abc"})\` |

## 五、测试路径参数与查询参数

路径参数和查询参数是 API 最常见的入参方式，必须熟练测试：

\`\`\`python filename="main.py —— 带参数的接口"
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 路径参数：{item_id} 会被提取为函数参数
@app.get("/items/{item_id}")
# 定义函数 get_item，参数 item_id 是 int 类型
def get_item(item_id: int):
    # 如果 id 不存在，返回 404（这里用固定值模拟）
    # 条件判断：如果 item_id 不在 [1, 2, 3] 里
    if item_id not in [1, 2, 3]:
        # 返回 404 状态码和错误信息
        return {"error": "not found", "code": 404}
    # 正常返回
    return {"id": item_id, "name": f"商品{item_id}"}

# 查询参数：函数参数不带默认值 = 必填，带默认值 = 可选
@app.get("/search")
# 定义函数 search，参数 keyword 必填，limit 可选默认 10
def search(keyword: str, limit: int = 10):
    # 返回搜索结果
    return {"keyword": keyword, "limit": limit, "results": []}
\`\`\`

\`\`\`python filename="test_params.py —— 测试参数"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 创建客户端
client = TestClient(app)

# 测试路径参数：正常情况
def test_get_item_success():
    # 访问 /items/1，路径参数自动提取
    # 定义变量 r，保存响应
    r = client.get("/items/1")
    # 断言 200
    assert r.status_code == 200
    # 断言返回的 id
    assert r.json()["id"] == 1

# 测试路径参数：不存在的 id
def test_get_item_not_found():
    # 访问 /items/999，id 不存在
    # 定义变量 r
    r = client.get("/items/999")
    # 断言返回体里有错误信息
    assert r.json()["code"] == 404

# 测试路径参数：类型错误（传字符串给 int 参数）
def test_get_item_invalid_type():
    # 访问 /items/abc，abc 不是 int
    # FastAPI 会自动返回 422 校验错误
    # 定义变量 r
    r = client.get("/items/abc")
    # 断言 422
    assert r.status_code == 422

# 测试查询参数：必填参数缺失
def test_search_missing_keyword():
    # 不传 keyword，FastAPI 应返回 422
    # 定义变量 r
    r = client.get("/search")
    # 断言 422
    assert r.status_code == 422

# 测试查询参数：正常传参
def test_search_with_params():
    # 传 keyword 和 limit
    # params 里的键值对会被拼成 query string
    # 定义变量 r
    r = client.get("/search", params={"keyword": "手机", "limit": 5})
    # 断言 200
    assert r.status_code == 200
    # 断言返回的 keyword
    assert r.json()["keyword"] == "手机"
    # 断言 limit 被正确接收
    assert r.json()["limit"] == 5
\`\`\`

> 避坑指南：很多人只测"传对参数能成功"，不测"传错参数被拦截"。后者恰恰是 FastAPI 自动校验的核心价值，必须测。一个接口至少要测三种情况：正常输入、缺失必填、类型错误。

## 六、测试请求体与参数校验（422）

FastAPI 的强项是自动校验，测试时一定要覆盖"传错参数"的场景：

\`\`\`python filename="main.py —— 带校验的创建接口"
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 创建应用
app = FastAPI()

# 定义商品模型
class Item(BaseModel):
    # name 必填，最少 1 个字符
    name: str = Field(..., min_length=1)
    # price 必填，必须 >= 0
    price: float = Field(..., ge=0)
    # tags 可选，默认空列表
    tags: list[str] = []

# POST /items，接收 Item 请求体
@app.post("/items")
# 定义函数 create_item，参数 item 是 Item 类型
def create_item(item: Item):
    # 返回创建的商品（实际项目里会存数据库）
    return {"id": 1, **item.model_dump()}
\`\`\`

\`\`\`python filename="test_validation.py —— 测试校验"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 创建客户端
client = TestClient(app)

# 测试 1：正常创建
def test_create_item_success():
    # 传完整且合法的数据
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 断言 200
    assert r.status_code == 200
    # 断言返回的 name
    assert r.json()["name"] == "苹果"

# 测试 2：缺少必填字段 name
def test_create_item_missing_name():
    # 故意不传 name，应该被 Pydantic 拦下
    # 定义变量 r
    r = client.post("/items", json={"price": 5.5})
    # 断言 422（Unprocessable Entity）
    assert r.status_code == 422
    # 422 的响应体里有详细的错误信息
    # 定义变量 detail，取第一条错误
    detail = r.json()["detail"][0]
    # 断言错误位置在 body.name
    assert detail["loc"] == ["body", "name"]
    # 断言错误类型是 missing（缺失）
    assert detail["type"] == "missing"

# 测试 3：price 传负数
def test_create_item_negative_price():
    # 价格传 -1，违反 ge=0 约束
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": -1})
    # 断言 422
    assert r.status_code == 422
    # 断言错误类型包含 greater_than_equal
    assert "greater_than_equal" in r.json()["detail"][0]["type"]

# 测试 4：name 传空字符串
def test_create_item_empty_name():
    # name 传空字符串，违反 min_length=1
    # 定义变量 r
    r = client.post("/items", json={"name": "", "price": 5.5})
    # 断言 422
    assert r.status_code == 422

# 测试 5：price 传字符串（类型错误）
def test_create_item_wrong_type():
    # price 传 "abc"，不是数字
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": "abc"})
    # 断言 422
    assert r.status_code == 422
\`\`\`

> 怎么想：每个字段至少想三种测试情况——正确值、缺失值、错误值。有约束的（min_length、ge、le 等）再额外测边界值。这样校验逻辑就全覆盖了。

## 七、测试响应头与状态码

除了 JSON 体，响应头和状态码也是 API 契约的一部分，需要测试：

\`\`\`python filename="main.py —— 自定义响应头"
# 从 fastapi 导入 FastAPI, Response
# Response 用于操作响应头等元信息
from fastapi import FastAPI, Response

# 创建应用
app = FastAPI()

# 下载接口，设置 Content-Disposition 头
@app.get("/download")
# 定义函数 download，参数 response 是 Response 类型
# 通过 Response 对象可以手动设置响应头
def download(response: Response):
    # 设置响应头，告诉浏览器以附件形式下载
    # response.headers 是一个可变字典
    # Content-Disposition: attachment 表示"附件下载"，filename 是建议保存的文件名
    response.headers["Content-Disposition"] = 'attachment; filename="report.csv"'
    # 设置自定义头 X-Process-Time
    # 自定义头通常用 X- 前缀（虽然新规范不强制，但习惯保留）
    response.headers["X-Process-Time"] = "0.05"
    # 返回 CSV 内容
    # 返回 str 时 Content-Type 默认是 text/plain
    return "id,name\\n1,苹果\\n2,香蕉"

# 自定义状态码
@app.post("/create", status_code=201)
# 定义函数 create
# status_code=201 在装饰器里设置，覆盖默认的 200
def create():
    # 返回 201（已创建）
    # 201 表示资源创建成功，符合 RESTful 规范
    return {"id": 1}
\`\`\`

\`\`\`python filename="test_headers.py —— 测试响应头"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 创建客户端
client = TestClient(app)

# 测试响应头
def test_download_headers():
    # 发 GET 请求
    # 定义变量 r
    r = client.get("/download")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言 Content-Disposition 头存在且值正确
    # r.headers 大小写不敏感
    assert r.headers["content-disposition"] == 'attachment; filename="report.csv"'
    # 断言自定义头
    assert r.headers["x-process-time"] == "0.05"

# 测试自定义状态码
def test_create_status_code():
    # 发 POST 请求
    # 定义变量 r
    r = client.post("/create")
    # 断言 201
    assert r.status_code == 201

# 测试 404
def test_not_found():
    # 访问不存在的路由
    # 定义变量 r
    r = client.get("/nonexistent")
    # 断言 404
    assert r.status_code == 404
\`\`\`

## 八、测试文件上传

文件上传是常见需求，TestClient 用 \`files\` 参数模拟：

\`\`\`python filename="main.py —— 文件上传接口"
# 从 fastapi 导入 FastAPI, UploadFile, File
# UploadFile 是 FastAPI 的文件类型，封装了文件名、内容等
# File(...) 表示这是一个必填的文件参数
from fastapi import FastAPI, UploadFile, File

# 创建应用
app = FastAPI()

# 单文件上传
@app.post("/upload")
# 定义函数 upload，参数 file 是 UploadFile 类型
# async def 因为文件读取是异步 I/O 操作
async def upload(file: UploadFile = File(...)):
    # 读取文件内容（bytes）
    # 定义变量 content，等待读取完成
    # await 因为 read() 是协程，避免阻塞事件循环
    content = await file.read()
    # 返回文件名和大小
    # file.filename 是上传时的原始文件名
    # len(content) 是文件字节数
    return {"filename": file.filename, "size": len(content)}

# 多文件上传
@app.post("/upload-multi")
# 定义函数 upload_multi，参数 files 是 UploadFile 列表
# list[UploadFile] 表示接收多个文件，FastAPI 会把同名文件字段都收进来
async def upload_multi(files: list[UploadFile] = File(...)):
    # 用列表推导式收集每个文件的名字
    # 定义变量 names，遍历 files 取 filename
    names = [f.filename for f in files]
    # 返回文件名列表
    # count 是文件数量，names 是所有文件名
    return {"count": len(files), "names": names}
\`\`\`

\`\`\`python filename="test_upload.py —— 测试文件上传"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 创建客户端
client = TestClient(app)

# 测试单文件上传
def test_upload_single():
    # files 参数格式：{"字段名": ("文件名", 文件内容, "MIME类型")}
    # 文件内容可以是 bytes 或字符串
    # 定义变量 r，上传一个文本文件
    r = client.post(
        "/upload",
        files={"file": ("test.txt", b"hello world", "text/plain")}
    )
    # 断言 200
    assert r.status_code == 200
    # 断言返回的文件名
    assert r.json()["filename"] == "test.txt"
    # 断言文件大小（"hello world" 是 11 字节）
    assert r.json()["size"] == 11

# 测试多文件上传
def test_upload_multi():
    # 一次上传多个文件
    # 定义变量 r
    r = client.post(
        "/upload-multi",
        files=[
            ("files", ("a.txt", b"aaa", "text/plain")),
            ("files", ("b.txt", b"bbb", "text/plain")),
        ]
    )
    # 断言 200
    assert r.status_code == 200
    # 断言数量是 2
    assert r.json()["count"] == 2
    # 断言文件名列表
    assert r.json()["names"] == ["a.txt", "b.txt"]

# 测试不传文件（应该 422）
def test_upload_no_file():
    # 不传 files 参数
    # 定义变量 r
    r = client.post("/upload")
    # 断言 422（File(...) 是必填）
    assert r.status_code == 422
\`\`\`

> 避坑指南：\`files\` 参数的值是元组 \`(filename, content, content_type)\`，不要只传 \`b"content"\`，否则文件名会是 None。

## 九、测试异常和错误响应

业务代码里会主动抛异常，测试要验证异常被正确转换成 HTTP 响应：

\`\`\`python filename="main.py —— 带异常处理的接口"
# 从 fastapi 导入 FastAPI, HTTPException
# HTTPException 是 FastAPI 的异常类，抛出后会自动转成 HTTP 错误响应
from fastapi import FastAPI, HTTPException

# 创建应用
app = FastAPI()

# 模拟数据库
# 定义变量 FAKE_DB，是一个字典
# key 是商品 id，value 是商品名
FAKE_DB = {1: "苹果", 2: "香蕉"}

# GET /items/{item_id}
@app.get("/items/{item_id}")
# 定义函数 get_item，参数 item_id 是 int
# 类型注解 int 让 FastAPI 自动校验：传非数字会返回 422
def get_item(item_id: int):
    # 如果 id 不在数据库里
    # 条件判断：如果 item_id 不在 FAKE_DB 里
    if item_id not in FAKE_DB:
        # 抛出 404 异常
        # HTTPException 会被 FastAPI 自动转成 JSON 响应
        # status_code 指定 HTTP 状态码，detail 是错误详情
        raise HTTPException(status_code=404, detail="商品不存在")
    # 正常返回
    return {"id": item_id, "name": FAKE_DB[item_id]}

# 模拟服务端错误
@app.get("/error")
# 定义函数 trigger_error
def trigger_error():
    # 故意除以零，触发 ZeroDivisionError
    # 定义变量 x，赋值为 1 / 0
    # 这个异常没被捕获，FastAPI 会自动转成 500 响应
    x = 1 / 0
    return {"x": x}
\`\`\`

\`\`\`python filename="test_errors.py —— 测试异常"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 创建客户端
client = TestClient(app)

# 测试 404
def test_item_not_found():
    # 访问不存在的 id
    # 定义变量 r
    r = client.get("/items/999")
    # 断言 404
    assert r.status_code == 404
    # 断言 detail 信息
    assert r.json()["detail"] == "商品不存在"

# 测试正常情况
def test_item_found():
    # 访问存在的 id
    # 定义变量 r
    r = client.get("/items/1")
    # 断言 200
    assert r.status_code == 200
    # 断言 name
    assert r.json()["name"] == "苹果"

# 测试服务端错误（默认返回 500）
def test_server_error():
    # 访问会触发异常的路由
    # 定义变量 r
    r = client.get("/error")
    # 断言 500
    assert r.status_code == 500

# 测试类型校验错误
def test_invalid_id_type():
    # 传非 int 的路径参数
    # 定义变量 r
    r = client.get("/items/abc")
    # 断言 422
    assert r.status_code == 422
\`\`\`

## 十、实战：完整的 CRUD 测试套件

下面是一个"内存版"的 CRUD 应用 + 完整测试，涵盖 GET/POST/PUT/DELETE、404、422：

\`\`\`python filename="crud_app.py —— 完整 CRUD 应用"
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 定义商品模型
class Item(BaseModel):
    # name 必填
    name: str
    # price 必填，>= 0
    price: float

# 内存数据库，key 是 id，value 是 Item 的字典表示
# 定义变量 db，初始为空字典
db: dict[int, dict] = {}
# 自增 id 计数器
# 定义变量 next_id，初始值为 1
next_id = 1

# 创建商品
@app.post("/items", status_code=201)
# 定义函数 create_item，参数 item 是 Item 类型
def create_item(item: Item):
    # 声明使用全局变量 next_id
    global next_id
    # 定义变量 item_id，赋值为 next_id
    item_id = next_id
    # id 自增
    next_id += 1
    # 存入数据库（转成字典存）
    # 定义变量 item_dict，赋值为 item.model_dump() 并加上 id
    item_dict = {"id": item_id, **item.model_dump()}
    # 存入 db
    db[item_id] = item_dict
    # 返回创建的商品
    return item_dict

# 查询单个商品
@app.get("/items/{item_id}")
# 定义函数 get_item，参数 item_id 是 int
def get_item(item_id: int):
    # 如果 id 不存在
    # 条件判断：如果 item_id 不在 db 里
    if item_id not in db:
        # 抛 404
        raise HTTPException(status_code=404, detail="商品不存在")
    # 返回商品
    return db[item_id]

# 查询列表
@app.get("/items")
# 定义函数 list_items，参数 skip 默认 0，limit 默认 10
def list_items(skip: int = 0, limit: int = 10):
    # 取 db 的所有值，切片分页
    # 定义变量 all_items，赋值为 list(db.values())
    all_items = list(db.values())
    # 返回分页结果
    return all_items[skip : skip + limit]

# 更新商品
@app.put("/items/{item_id}")
# 定义函数 update_item，参数 item_id 和 item
def update_item(item_id: int, item: Item):
    # 如果 id 不存在
    # 条件判断：如果 item_id 不在 db 里
    if item_id not in db:
        # 抛 404
        raise HTTPException(status_code=404, detail="商品不存在")
    # 更新数据库
    # 定义变量 item_dict，赋值新数据加上 id
    item_dict = {"id": item_id, **item.model_dump()}
    # 存入 db
    db[item_id] = item_dict
    # 返回更新后的商品
    return item_dict

# 删除商品
@app.delete("/items/{item_id}", status_code=204)
# 定义函数 delete_item，参数 item_id
def delete_item(item_id: int):
    # 如果 id 不存在
    # 条件判断：如果 item_id 不在 db 里
    if item_id not in db:
        # 抛 404
        raise HTTPException(status_code=404, detail="商品不存在")
    # 从 db 删除
    # 调用 db.pop(item_id)
    db.pop(item_id)
    # 204 不返回内容
    return None
\`\`\`

\`\`\`python filename="test_crud.py —— 完整 CRUD 测试"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 导入 crud_app 模块，以便操作 db
import crud_app
# 从 crud_app 导入 app
from crud_app import app

# 创建客户端
client = TestClient(app)

# 每个测试前清空数据库，保证测试之间互不影响
# 定义 setup 函数，在每个测试前手动调用
def reset_db():
    # 清空 db
    # 调用 crud_app.db.clear()
    crud_app.db.clear()
    # 重置 next_id
    # 赋值 crud_app.next_id = 1
    crud_app.next_id = 1

# 测试创建
def test_create():
    # 重置数据库
    reset_db()
    # 发 POST 请求
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 断言 201
    assert r.status_code == 201
    # 断言返回的 id 是 1
    assert r.json()["id"] == 1
    # 断言 name
    assert r.json()["name"] == "苹果"

# 测试查询单个
def test_get_one():
    # 重置数据库
    reset_db()
    # 先创建一个
    client.post("/items", json={"name": "苹果", "price": 5.5})
    # 查询 id=1
    # 定义变量 r
    r = client.get("/items/1")
    # 断言 200
    assert r.status_code == 200
    # 断言 name
    assert r.json()["name"] == "苹果"

# 测试查询不存在的
def test_get_not_found():
    # 重置数据库
    reset_db()
    # 查询 id=999
    # 定义变量 r
    r = client.get("/items/999")
    # 断言 404
    assert r.status_code == 404

# 测试列表查询
def test_list():
    # 重置数据库
    reset_db()
    # 创建 3 个商品
    client.post("/items", json={"name": "A", "price": 1})
    client.post("/items", json={"name": "B", "price": 2})
    client.post("/items", json={"name": "C", "price": 3})
    # 查询列表
    # 定义变量 r
    r = client.get("/items", params={"skip": 0, "limit": 2})
    # 断言 200
    assert r.status_code == 200
    # 断言只返回 2 个（limit=2）
    assert len(r.json()) == 2

# 测试更新
def test_update():
    # 重置数据库
    reset_db()
    # 先创建
    client.post("/items", json={"name": "苹果", "price": 5.5})
    # 更新 id=1
    # 定义变量 r
    r = client.put("/items/1", json={"name": "香蕉", "price": 3.0})
    # 断言 200
    assert r.status_code == 200
    # 断言 name 已更新
    assert r.json()["name"] == "香蕉"

# 测试删除
def test_delete():
    # 重置数据库
    reset_db()
    # 先创建
    client.post("/items", json={"name": "苹果", "price": 5.5})
    # 删除 id=1
    # 定义变量 r
    r = client.delete("/items/1")
    # 断言 204
    assert r.status_code == 204
    # 再查应该 404
    # 定义变量 r2
    r2 = client.get("/items/1")
    # 断言 404
    assert r2.status_code == 404

# 测试校验失败
def test_create_validation_error():
    # 重置数据库
    reset_db()
    # 不传 name
    # 定义变量 r
    r = client.post("/items", json={"price": 5.5})
    # 断言 422
    assert r.status_code == 422
\`\`\`

## 十一、常见错误与避坑指南

| 错误 | 现象 | 原因 | 解决 |
| --- | --- | --- | --- |
| 忘了创建 TestClient | \`NameError: client\` | 没有先实例化 | 测试文件开头 \`client = TestClient(app)\` |
| 导入 app 报错 | \`ImportError\` | 路径不对 | 确保测试文件和 main.py 在同目录，或配置 PYTHONPATH |
| 测试之间互相影响 | 前一个测试的数据污染后一个 | 共享了全局状态 | 每个测试前重置数据库（用 fixture，下一章讲） |
| 异步路由测试报错 | \`RuntimeError: async ignored\` | TestClient 自动处理异步，但某些场景需注意 | 用 \`httpx.AsyncClient\` 配合 \`pytest-asyncio\` |
| 文件上传测试失败 | \`filename is None\` | files 参数格式不对 | 用 \`(filename, content, type)\` 三元组 |
| 422 断言失败 | 校验错误类型对不上 | Pydantic v2 改了错误类型名 | 打印 \`r.json()["detail"]\` 看实际类型 |

> 最常见的坑是"测试间共享状态"。上面的 CRUD 测试里我们手动 \`reset_db()\`，但这很丑陋。下一章讲 pytest fixture，会用更优雅的方式解决。

## 十二、小结

TestClient 是 FastAPI 测试的基石：不需要启动服务器，直接在内存里模拟 HTTP 请求。用法和 \`httpx\` / \`requests\` 几乎一样——\`client.get()\`、\`client.post()\`，传 \`params\`、\`json\`、\`headers\`、\`files\`。测试的核心是"调用 + 断言"：调用接口，断言状态码、JSON 体、响应头。每个接口至少测正常、缺失、错误三种情况。

但光有 TestClient 还不够——测试之间怎么共享数据？怎么复用客户端？怎么管理测试数据库？这些问题需要 pytest 的 fixture 机制来解决。下一章讲这个。
`
  },

  // =========================================================
  // 第二章：pytest 与 fixtures
  // =========================================================
  {
    id: "fa-pytest",
    group: "测试",
    icon: " pytest",
    title: "pytest 与 fixtures",
    content: `

# pytest 与 fixtures

## 一、为什么用 pytest 而不是 unittest

Python 自带 \`unittest\` 框架，为什么 FastAPI 项目几乎都用 \`pytest\`？

\`\`\`txt filename="unittest vs pytest"
unittest 写法:
    import unittest
    class MyTest(unittest.TestCase):
        def test_add(self):
            self.assertEqual(1 + 1, 2)    # 要写 self.assertEqual

pytest 写法:
    def test_add():
        assert 1 + 1 == 2                 # 直接用 assert，简洁
\`\`\`

pytest 的优势：
- **写法简洁**：直接 \`assert\`，不用记 \`self.assertEqual\` / \`self.assertTrue\` 等一堆方法。
- **assert 断言增强**：失败时自动显示两个值的差异，非常直观。
- **fixture 机制**：比 unittest 的 setUp/tearDown 强大得多，支持依赖注入、作用域、参数化。
- **插件生态丰富**：pytest-cov（覆盖率）、pytest-asyncio（异步）、pytest-xdist（并行）等。
- **兼容 unittest**：已有的 unittest 测试也能被 pytest 运行。

## 二、安装与运行

\`\`\`bash filename="安装 pytest"
# 安装 pytest 和 FastAPI 测试需要的依赖
pip install pytest httpx

# 安装覆盖率插件（下一章用）
pip install pytest-cov

# 安装异步测试插件（测异步代码用）
pip install pytest-asyncio
\`\`\`

\`\`\`bash filename="运行测试"
# 运行当前目录下所有测试（文件名以 test_ 开头）
pytest

# 运行指定文件
pytest test_main.py

# 运行指定测试函数
pytest test_main.py::test_root

# 显示详细输出（每个测试的名字）
pytest -v

# 显示打印输出（默认 pytest 会吃掉 print）
pytest -s

# 只跑名字包含 "create" 的测试
pytest -k "create"

# 失败时立即停止
pytest -x
\`\`\`

> 怎么想：\`pytest\` 默认会找当前目录下所有 \`test_*.py\` 或 \`*_test.py\` 文件，里面所有 \`test_\` 开头的函数。所以命名规则很重要——测试文件必须以 \`test_\` 开头，测试函数必须以 \`test_\` 开头。

## 三、测试函数命名规则

pytest 有严格的发现规则，不遵守就找不到你的测试：

\`\`\`txt filename="pytest 发现规则"
文件命名：test_*.py  或  *_test.py
    ✅ test_main.py
    ✅ test_user.py
    ❌ my_test.py（不以 test_ 开头，找不到）→ 其实 *_test.py 也行
    ❌ tests.py（不符合规则）

函数命名：test_*
    ✅ def test_create_user():
    ✅ def test_login():
    ❌ def create_user_test():（不以 test_ 开头）
    ❌ def TestCreateUser():（这是类，不是函数）

类命名：Test*（类以 Test 开头，里面的 test_ 方法会被运行）
    ✅ class TestUser:
          def test_create(self): ...
    ❌ class UserTest:（不以 Test 开头，被忽略）
    ❌ class TestUser(unittest.TestCase) 中的 __init__ 方法会被忽略
\`\`\`

## 四、assert 断言详解

pytest 最舒服的地方就是直接用 \`assert\`，失败时会自动展示差异：

\`\`\`python filename="assert 各种用法"
# 测试函数：测试相等
def test_equal():
    # 定义变量 a
    a = 1 + 1
    # 断言 a 等于 2（失败会显示 a 的实际值）
    assert a == 2

# 测试函数：测试不相等
def test_not_equal():
    # 定义变量 a
    a = 5
    # 断言 a 不等于 3
    assert a != 3

# 测试函数：测试布尔值
def test_truthy():
    # 定义变量 result
    result = [1, 2, 3]
    # 断言列表非空（非空列表是 True）
    assert result
    # 断言长度是 3
    assert len(result) == 3

# 测试函数：测试包含
def test_contains():
    # 定义变量 text
    text = "hello world"
    # 断言 "world" 在 text 里
    assert "world" in text
    # 定义变量 nums
    nums = [1, 2, 3]
    # 断言 2 在列表里
    assert 2 in nums

# 测试函数：测试异常被抛出
def test_raises():
    # 导入 pytest
    import pytest
    # 用 pytest.raises 上下文管理器检查异常
    # 条件：执行 1/0 应该抛 ZeroDivisionError
    with pytest.raises(ZeroDivisionError):
        # 这行代码应该抛异常
        # 定义变量 x，赋值为 1 / 0
        x = 1 / 0

# 测试函数：测试异常的详细信息
def test_raises_with_detail():
    # 导入 pytest 和 HTTPException
    import pytest
    from fastapi import HTTPException
    # 用 pytest.raises 检查异常
    with pytest.raises(HTTPException) as exc_info:
        # 模拟抛出 HTTPException
        raise HTTPException(status_code=404, detail="不存在")
    # 断言状态码是 404
    assert exc_info.value.status_code == 404
    # 断言 detail 信息
    assert exc_info.value.detail == "不存在"
\`\`\`

> assert 失败时 pytest 会显示非常友好的差异对比，比如 \`assert {"a": 1} == {"a": 2}\` 会高亮显示 a 字段的差异。这是 unittest 做不到的。

## 五、fixture 的概念：什么是依赖注入

先看一个"没有 fixture"的问题：

\`\`\`python filename="不用 fixture 的痛点"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 每个测试都要重复创建 client
def test_a():
    # 每次都创建一次
    # 定义变量 client
    client = TestClient(app)
    r = client.get("/")
    assert r.status_code == 200

def test_b():
    # 又创建一次，重复
    # 定义变量 client
    client = TestClient(app)
    r = client.get("/items")
    assert r.status_code == 200

def test_c():
    # 又创建一次...
    # 定义变量 client
    client = TestClient(app)
    r = client.post("/items", json={"name": "A"})
    assert r.status_code == 201
\`\`\`

每个测试都重复 \`client = TestClient(app)\`，既冗余又容易漏。fixture 就是解决这个问题的——**把"准备数据"的逻辑抽出来，让 pytest 自动注入到测试函数里**。

\`\`\`txt filename="fixture 的思想"
没有 fixture:
    测试函数自己准备数据 → 测试逻辑 → 自己清理数据

有 fixture:
    fixture 准备数据 → pytest 自动传给测试函数 → 测试逻辑 → fixture 自动清理
    ↑ 类似 FastAPI 的 Depends 依赖注入，但用于测试
\`\`\`

## 六、@pytest.fixture 装饰器

\`\`\`python filename="第一个 fixture"
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 用 @pytest.fixture 定义一个 fixture
# fixture 名就是函数名：client
@pytest.fixture
# 定义函数 client，无参数
def client():
    # 准备阶段：创建 TestClient
    # 定义变量 c，赋值为 TestClient(app)
    c = TestClient(app)
    # 把准备好的东西交给测试函数
    yield c
    # 清理阶段：yield 之后的代码在测试结束后执行
    # 这里没有需要清理的，但可以在这里关连接、删数据等

# 测试函数：参数名必须是 fixture 名（client）
# pytest 会自动把 fixture 的返回值传进来
def test_a(client):
    # 直接用 client，不用自己创建
    # 定义变量 r
    r = client.get("/")
    # 断言 200
    assert r.status_code == 200

def test_b(client):
    # 同样直接用 client
    # 定义变量 r
    r = client.get("/items")
    # 断言 200
    assert r.status_code == 200
\`\`\`

> 怎么想：fixture 就像 FastAPI 的 \`Depends\`——你在函数参数里声明需要什么，框架就自动给你什么。区别是 \`Depends\` 注入到路由函数，fixture 注入到测试函数。

**yield 的作用**：\`yield c\` 把 \`c\` 交给测试函数，测试执行完后，继续执行 yield 后面的清理代码。这比 unittest 的 setUp/tearDown 优雅得多——准备和清理在同一个函数里，逻辑紧凑。

## 七、fixture 的作用域

默认情况下，每个测试函数运行前都会重新执行一次 fixture（\`scope="function"\`）。如果 fixture 很耗时（比如连数据库），可以用更大的作用域让它在多个测试间共享：

\`\`\`python filename="fixture 作用域对比"
# 导入 pytest
import pytest

# function 级（默认）：每个测试函数都重新执行
@pytest.fixture(scope="function")
# 定义函数 db_function
def db_function():
    print("\\n--- 连接数据库（function）---")
    # 定义变量 db
    db = {"connected": True}
    # 交出 db
    yield db
    print("\\n--- 关闭数据库（function）---")
    # 调用 db.clear()
    db.clear()

# class 级：每个测试类执行一次（类里所有方法共享）
@pytest.fixture(scope="class")
# 定义函数 db_class
def db_class():
    print("\\n--- 连接数据库（class）---")
    # 定义变量 db
    db = {"connected": True}
    # 交出 db
    yield db
    print("\\n--- 关闭数据库（class）---")

# module 级：每个 .py 文件执行一次
@pytest.fixture(scope="module")
# 定义函数 db_module
def db_module():
    print("\\n--- 连接数据库（module）---")
    # 定义变量 db
    db = {"connected": True}
    # 交出 db
    yield db
    print("\\n--- 关闭数据库（module）---")

# session 级：整个 pytest 运行期间只执行一次
@pytest.fixture(scope="session")
# 定义函数 db_session
def db_session():
    print("\\n--- 连接数据库（session）---")
    # 定义变量 db
    db = {"connected": True}
    # 交出 db
    yield db
    print("\\n--- 关闭数据库（session）---")
\`\`\`

\`\`\`txt filename="作用域对照表"
scope="function"  每个测试函数前执行一次      最干净，但最慢
scope="class"     每个测试类前执行一次        同类共享
scope="module"    每个 .py 文件前执行一次     同文件共享
scope="session"   整个测试运行只执行一次       最快，但要小心状态污染
\`\`\`

> 避坑指南：作用域越大越快，但共享状态的风险也越大。原则：**默认用 function，确实慢了再升级**。数据库连接通常用 session 级（连一次就够了），但测试数据必须每个测试独立。

## 八、conftest.py：共享 fixture

如果多个测试文件都要用同一个 fixture，不要在每个文件里复制粘贴。把它放到 \`conftest.py\` 里，pytest 会自动发现：

\`\`\`txt filename="conftest.py 的位置"
project/
├── conftest.py          ← 全局 fixture（所有目录都能用）
├── test_main.py
├── users/
│   ├── conftest.py      ← users 目录专用 fixture
│   ├── test_create.py   ← 能用全局 + users 里的 fixture
│   └── test_delete.py
└── items/
    └── test_items.py    ← 只能用全局 fixture，不能用 users 的
\`\`\`

\`\`\`python filename="conftest.py —— 共享 fixture"
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app
from main import app

# 定义 client fixture，所有测试文件都能用
@pytest.fixture
# 定义函数 client
def client():
    # 创建 TestClient
    # 定义变量 c
    c = TestClient(app)
    # 交出 c
    yield c

# 定义一个"干净的内存数据库" fixture
@pytest.fixture
# 定义函数 fake_db
def fake_db():
    # 创建一个空字典模拟数据库
    # 定义变量 db
    db = {}
    # 交出 db
    yield db
    # 测试后清空（其实 yield 后 db 就被回收了，这里演示清理）
    # 调用 db.clear()
    db.clear()
\`\`\`

\`\`\`python filename="test_main.py —— 使用 conftest 的 fixture"
# 不需要 import conftest，pytest 自动发现
# 直接在参数里用 fixture 名

# 测试函数：参数 client 和 fake_db 都来自 conftest.py
def test_with_client_and_db(client, fake_db):
    # client 是 TestClient，fake_db 是空字典
    # 往假数据库里塞数据
    # 赋值 fake_db[1] = "苹果"
    fake_db[1] = "苹果"
    # 用 client 发请求
    # 定义变量 r
    r = client.get("/")
    # 断言 200
    assert r.status_code == 200
\`\`\`

> 怎么想：\`conftest.py\` 就像 FastAPI 的 \`dependencies.py\`——把公共依赖集中管理。区别是 conftest 不需要 import，pytest 自动按目录层级发现。

## 九、fixture 的参数化

fixture 可以带参数，让同一个 fixture 在不同测试里返回不同数据：

\`\`\`python filename="参数化 fixture"
# 导入 pytest
import pytest

# 定义商品数据
# 定义变量 sample_items
sample_items = [
    {"name": "苹果", "price": 5.5, "valid": True},
    {"name": "", "price": 5.5, "valid": False},    # name 为空，无效
    {"name": "香蕉", "price": -1, "valid": False},  # price 负数，无效
]

# 用 params 参数让 fixture 对每组数据各运行一次
@pytest.fixture(params=sample_items)
# 定义函数 item_data，参数 request（pytest 内置 fixture，传递参数信息）
def item_data(request):
    # request.param 是当前这组参数
    # 交出当前参数
    yield request.param

# 这个测试会运行 3 次（因为有 3 组参数）
def test_item_validation(item_data):
    # item_data 是当前的参数
    # 条件判断：如果 item_data["valid"] 为真
    if item_data["valid"]:
        # 有效数据应该通过校验
        assert item_data["name"] != ""
        assert item_data["price"] >= 0
    else:
        # 无效数据应该被拦下
        # 条件判断：如果 name 为空或 price 为负
        assert item_data["name"] == "" or item_data["price"] < 0
\`\`\`

更常用的参数化方式是 \`@pytest.mark.parametrize\`，直接在测试函数上标记：

\`\`\`python filename="parametrize 装饰器"
# 导入 pytest
import pytest

# 用 @pytest.mark.parametrize 参数化测试
# 第一个参数是参数名的字符串（用逗号分隔）
# 第二个参数是参数值的列表，每个元素是一组参数
@pytest.mark.parametrize("input_a, input_b, expected", [
    (1, 2, 3),       # 1 + 2 = 3
    (0, 0, 0),       # 0 + 0 = 0
    (-1, 1, 0),      # -1 + 1 = 0
    (100, 200, 300), # 100 + 200 = 300
])
# 定义函数 test_add，参数 input_a, input_b, expected
def test_add(input_a, input_b, expected):
    # 定义变量 result，赋值为 input_a + input_b
    result = input_a + input_b
    # 断言结果等于 expected
    assert result == expected

# 测试参数校验
@pytest.mark.parametrize("price, should_pass", [
    (5.5, True),     # 正常价格
    (0, True),       # 0 是合法的（ge=0）
    (-1, False),     # 负数不合法
    (100, True),     # 大数也行
])
# 定义函数 test_price_validation
def test_price_validation(price, should_pass):
    # 条件判断：如果 should_pass 为真
    if should_pass:
        # 应该合法
        assert price >= 0
    else:
        # 应该不合法
        assert price < 0
\`\`\`

## 十、测试数据库 fixture：隔离的测试数据库

真实项目里测试不能污染生产数据库。最佳实践是每个测试用独立的数据库（或事务回滚）：

\`\`\`python filename="conftest.py —— 测试数据库 fixture"
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 假设我们的应用用 SQLite
# 从 main 导入 app 和 get_db 依赖
from main import app, get_db
# 导入 sqlalchemy 的 create_engine 和 sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# 导入项目的 Base（模型基类）
from models import Base

# 定义测试数据库 fixture
@pytest.fixture(scope="function")
# 定义函数 test_db
def test_db():
    # 1. 创建一个内存 SQLite 数据库（每次测试都是全新的）
    # 定义变量 engine，创建引擎连接内存数据库
    engine = create_engine("sqlite:///:memory:")

    # 2. 创建所有表
    # 调用 Base.metadata.create_all(engine)
    Base.metadata.create_all(engine)

    # 3. 创建一个 session 工厂
    # 定义变量 TestingSessionLocal
    TestingSessionLocal = sessionmaker(bind=engine)

    # 4. 创建一个 session
    # 定义变量 db
    db = TestingSessionLocal()

    # 5. 交出 db
    yield db

    # 6. 测试结束后清理
    # 关闭 session
    # 调用 db.close()
    db.close()
    # 删除所有表
    # 调用 Base.metadata.drop_all(engine)
    Base.metadata.drop_all(engine)

# 覆盖 FastAPI 的 get_db 依赖，让 app 用测试数据库
# 这个 fixture 依赖 test_db
@pytest.fixture
# 定义函数 client，参数 test_db（依赖上面的 test_db fixture）
def client(test_db):
    # 定义一个替代函数，返回测试数据库的 session
    # 定义函数 override_get_db
    def override_get_db():
        # 交出 test_db
        yield test_db

    # 覆盖 app 的 get_db 依赖
    # app.dependency_overrides 是一个字典
    # 赋值 app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_db] = override_get_db

    # 创建 TestClient
    # 定义变量 c
    c = TestClient(app)
    # 交出 c
    yield c

    # 清理：移除覆盖
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()
\`\`\`

\`\`\`python filename="test_with_db.py —— 用测试数据库的测试"
# client fixture 自动用测试数据库
def test_create_and_get(client):
    # 创建一个商品
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 断言 201
    assert r.status_code == 201
    # 定义变量 item_id，赋值为 r.json()["id"]
    item_id = r.json()["id"]

    # 查询刚创建的
    # 定义变量 r2
    r2 = client.get(f"/items/{item_id}")
    # 断言 200
    assert r2.status_code == 200
    # 断言 name
    assert r2.json()["name"] == "苹果"

# 另一个测试，数据库是全新的（互不影响）
def test_empty_list(client):
    # 因为每个测试用新数据库，这里应该是空的
    # 定义变量 r
    r = client.get("/items")
    # 断言 200
    assert r.status_code == 200
    # 断言返回空列表
    assert r.json() == []
\`\`\`

> 关键点：\`app.dependency_overrides\` 是 FastAPI 测试的核心机制——它让你在不改业务代码的前提下，替换掉数据库依赖。下一章会详细讲。

## 十一、实战：用 fixture 重构 CRUD 测试

把上一章的 CRUD 测试用 fixture 重构，变得干净且互不干扰：

\`\`\`python filename="conftest.py —— CRUD 测试的公共 fixture"
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 导入 crud_app 模块
import crud_app
# 从 crud_app 导入 app
from crud_app import app

# 定义重置数据库的 fixture
# scope="function" 确保每个测试前都重置
@pytest.fixture(autouse=True)
# autouse=True 表示自动应用，不需要在测试函数参数里声明
# 定义函数 reset_db
def reset_db():
    # 清空 crud_app 的内存数据库
    # 调用 crud_app.db.clear()
    crud_app.db.clear()
    # 重置自增 id
    # 赋值 crud_app.next_id = 1
    crud_app.next_id = 1
    # 交出控制权（这里不需要返回什么，只是为了 autouse）
    yield

# 定义 client fixture
@pytest.fixture
# 定义函数 client
def client():
    # 创建 TestClient
    # 定义变量 c
    c = TestClient(app)
    # 交出 c
    yield c

# 定义"已创建商品"的 fixture（创建一个商品并返回其 id）
@pytest.fixture
# 定义函数 created_item，参数 client
def created_item(client):
    # 先创建一个商品
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 返回创建的商品 id
    # 定义变量 item_id，赋值为 r.json()["id"]
    item_id = r.json()["id"]
    # 交出 item_id
    yield item_id
\`\`\`

\`\`\`python filename="test_crud_refactored.py —— 重构后的测试"
# 不需要手动 reset_db 了（autouse fixture 自动处理）

# 测试创建
def test_create(client):
    # 直接用 client
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 断言 201
    assert r.status_code == 201
    # 断言 id
    assert r.json()["id"] == 1

# 测试查询：用 created_item fixture 自动创建一个商品
def test_get_item(client, created_item):
    # created_item 是已创建商品的 id
    # 定义变量 r
    r = client.get(f"/items/{created_item}")
    # 断言 200
    assert r.status_code == 200
    # 断言 name
    assert r.json()["name"] == "苹果"

# 测试更新
def test_update(client, created_item):
    # 更新 created_item 对应的商品
    # 定义变量 r
    r = client.put(f"/items/{created_item}", json={"name": "香蕉", "price": 3.0})
    # 断言 200
    assert r.status_code == 200
    # 断言已更新
    assert r.json()["name"] == "香蕉"

# 测试删除
def test_delete(client, created_item):
    # 删除 created_item
    # 定义变量 r
    r = client.delete(f"/items/{created_item}")
    # 断言 204
    assert r.status_code == 204
    # 再查应该 404
    # 定义变量 r2
    r2 = client.get(f"/items/{created_item}")
    # 断言 404
    assert r2.status_code == 404

# 测试列表
def test_list_empty(client):
    # 新数据库，列表应该空
    # 定义变量 r
    r = client.get("/items")
    # 断言空
    assert r.json() == []
\`\`\`

对比一下：之前每个测试都要手动 \`reset_db()\`，现在用 \`autouse=True\` 的 fixture 自动处理；之前每个测试都要手动创建商品才能测查询/更新/删除，现在用 \`created_item\` fixture 自动创建。代码量少了一半，可读性更好。

## 十二、常见错误与避坑指南

| 错误 | 现象 | 原因 | 解决 |
| --- | --- | --- | --- |
| fixture 没生效 | 测试参数报 \`fixture not found\` | fixture 名和参数名不一致 | 参数名必须和 fixture 函数名完全一样 |
| conftest 不生效 | \`fixture not found\` | conftest.py 不在正确位置 | 放在测试文件的同目录或父目录 |
| 忘了 yield | fixture 返回 None | 用了 return 而不是 yield | 用 \`yield\` 交出值，\`return\` 只用于早期返回 None 的场景 |
| autouse 滥用 | 所有测试都被影响 | autouse=True 的 fixture 影响所有测试 | 只在确实需要全局生效时用 autouse |
| 作用域选错 | 测试间数据污染 | 用了 session/module 级但没清理状态 | 共享 fixture 用大作用域，测试数据用 function 级 |
| fixture 循环依赖 | \`FixtureError: circular\` | 两个 fixture 互相依赖 | 拆分公共逻辑到第三个 fixture |

> 最常见的坑：fixture 名拼写错误。参数名 \`cient\`（拼错了）不会被识别为 \`client\` fixture，pytest 会报"fixture not found"。仔细检查拼写。

## 十三、小结

pytest 的核心是 \`assert\` + \`fixture\`：\`assert\` 让断言简洁，\`fixture\` 让准备/清理逻辑复用。fixture 通过参数名注入（和 FastAPI 的 Depends 一样），用 \`conftest.py\` 跨文件共享，用 \`scope\` 控制生命周期，用 \`params\` / \`parametrize\` 做参数化测试。

但到现在我们只测了"纯内存"的接口。真实项目里接口会依赖数据库、认证、外部 API——这些在测试时不能真的连。怎么"假装"这些依赖？下一章讲 Mock 与依赖覆盖。
`
  },

  // =========================================================
  // 第三章：Mock 与依赖覆盖
  // =========================================================
  {
    id: "fa-mock",
    group: "测试",
    icon: "🎭",
    title: "Mock 与依赖覆盖",
    content: `

# Mock 与依赖覆盖

## 一、为什么需要 Mock

假设你的接口要调用第三方支付 API、发短信、查外部数据库。测试时你不能真的发短信、真的扣钱——不仅慢、不稳定，还费钱。**Mock 的本质就是"用假的替换真的"，让测试不依赖外部服务**。

\`\`\`txt filename="不 Mock 的问题"
测试 "创建订单" 接口:
  1. 接口调用支付 API → 真的扣了钱 ❌
  2. 接口发短信通知 → 真的发了短信 ❌
  3. 接口查用户数据库 → 需要连真实数据库 ❌
  4. 支付 API 挂了 → 测试也挂了 ❌（不稳定）
  5. 每次测试都要等几秒 → 太慢 ❌

Mock 后:
  1. 支付 API → 返回 "支付成功"（假的）✅
  2. 短信 → 记录"被调用了一次"（假的）✅
  3. 数据库 → 用内存数据库 ✅
  4. 不依赖网络 → 稳定 ✅
  5. 纯内存 → 快 ✅
\`\`\`

FastAPI 测试里 Mock 有两个层次：
1. **FastAPI 层**：用 \`app.dependency_overrides\` 替换 Depends 注入的依赖（数据库、认证等）。
2. **Python 层**：用 \`unittest.mock\` 替换任意函数/对象（外部 API 调用等）。

## 二、app.dependency_overrides：覆盖依赖

这是 FastAPI 测试最核心的机制。上一章已经用过（覆盖 get_db），这里详细讲：

\`\`\`python filename="main.py —— 带依赖的接口"
# 从 fastapi 导入 FastAPI, Depends, HTTPException
from fastapi import FastAPI, Depends, HTTPException

# 创建应用
app = FastAPI()

# 定义"获取当前用户"的依赖
# 这个依赖会检查 token，返回用户信息
# 定义函数 get_current_user，参数 token 是 str
def get_current_user(token: str):
    # 条件判断：如果 token 不等于 "valid-token"
    if token != "valid-token":
        # 抛 401
        raise HTTPException(status_code=401, detail="无效 token")
    # 返回模拟的用户
    return {"id": 1, "name": "小明"}

# 受保护的接口：依赖 get_current_user
@app.get("/profile")
# 定义函数 profile，参数 user 依赖 get_current_user
def profile(user: dict = Depends(get_current_user)):
    # 返回用户信息
    return {"profile": user}

# 模拟数据库依赖
# 定义变量 fake_db，初始字典
fake_db = {"items": [{"id": 1, "name": "苹果"}]}

# 定义 get_db 依赖
def get_db():
    # 返回 fake_db
    return fake_db

# 查询商品列表：依赖 get_db
@app.get("/items")
# 定义函数 list_items，参数 db 依赖 get_db
def list_items(db: dict = Depends(get_db)):
    # 返回 db 里的 items
    return db["items"]
\`\`\`

现在看怎么覆盖这些依赖：

\`\`\`python filename="test_override.py —— 覆盖依赖"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app, get_current_user, get_db
from main import app, get_current_user, get_db

# 测试 1：不覆盖，正常测试（需要传 token）
def test_profile_normal():
    # 创建客户端
    # 定义变量 client
    client = TestClient(app)
    # 带正确 token 访问
    # 定义变量 r
    r = client.get("/profile", params={"token": "valid-token"})
    # 断言 200
    assert r.status_code == 200
    # 断言返回的用户名
    assert r.json()["profile"]["name"] == "小明"

# 测试 2：覆盖 get_current_user，跳过认证
def test_profile_with_override():
    # 定义替代函数：直接返回一个假用户，不检查 token
    # 定义函数 override_user
    def override_user():
        # 直接返回假用户，不做任何检查
        return {"id": 999, "name": "测试用户"}

    # 注册覆盖：把 get_current_user 替换成 override_user
    # app.dependency_overrides 是一个字典：{原依赖: 替代函数}
    # 赋值 app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_current_user] = override_user

    # 创建客户端（在覆盖之后创建）
    # 定义变量 client
    client = TestClient(app)

    # 不带 token 也能访问（因为认证被跳过了）
    # 定义变量 r
    r = client.get("/profile")
    # 断言 200
    assert r.status_code == 200
    # 断言返回的是假用户
    assert r.json()["profile"]["name"] == "测试用户"

    # 清理：移除覆盖，避免影响其他测试
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()

# 测试 3：覆盖 get_db，用独立的测试数据库
def test_items_with_override_db():
    # 定义替代函数：返回一个假数据库
    # 定义函数 override_db
    def override_db():
        # 返回一个全新的、独立的假数据库
        return {"items": [{"id": 1, "name": "测试商品"}, {"id": 2, "name": "测试商品2"}]}

    # 注册覆盖
    # 赋值 app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_db] = override_db

    # 创建客户端
    # 定义变量 client
    client = TestClient(app)
    # 查询商品
    # 定义变量 r
    r = client.get("/items")
    # 断言 200
    assert r.status_code == 200
    # 断言返回的是假数据库的内容
    assert len(r.json()) == 2
    # 断言第一个商品名
    assert r.json()[0]["name"] == "测试商品"

    # 清理
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()
\`\`\`

> 怎么想：\`dependency_overrides\` 就像"狸猫换太子"——你告诉 FastAPI"遇到这个依赖时，别用原来的，用我给你的这个替代函数"。原代码完全不用改，但行为被替换了。

**关键理解**：\`dependency_overrides\` 的 key 是**原函数对象**（不是字符串），value 是**替代函数**。覆盖后，FastAPI 会调用替代函数而不是原函数。测试结束一定要 \`clear()\`，否则覆盖会"泄漏"到其他测试。

## 三、模拟数据库依赖

真实项目里数据库依赖更复杂，来看一个完整的例子：

\`\`\`python filename="main.py —— 真实的数据库依赖"
# 从 fastapi 导入 FastAPI, Depends, HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 sqlalchemy 导入列类型
from sqlalchemy import Column, Integer, String, Float
# 从 sqlalchemy.orm 导入 sessionmaker 和 declarative_base
from sqlalchemy.orm import sessionmaker, declarative_base
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# 创建应用
app = FastAPI()

# 创建数据库引擎（这里用 SQLite 文件）
# 定义变量 engine
engine = create_engine("sqlite:///./app.db")
# 定义变量 SessionLocal
SessionLocal = sessionmaker(bind=engine)
# 定义变量 Base
Base = declarative_base()

# 定义商品 ORM 模型
# 下面这行用到了"海象运算符":=和 type() 动态建类，理解即可，不用深究
# type("Base", (Base,), {"__tablename__": "items"}) 会动态创建一个继承 Base 的类
# := 把这个动态类同时赋值给变量 BaseModel_sql，再让 Item 继承它
# 这只是演示动态建类技巧，实际项目不会这么写
class Item(BaseModel_sql := type("Base", (Base,), {"__tablename__": "items"})):
    # pass 表示空类体，什么都不做（这个 Item 类只是演示，后面不会用到）
    pass

# 简化：直接定义真正的 ORM 模型（项目实际用这个）
class ItemModel(Base):
    # 表名，对应数据库里的 items 表
    __tablename__ = "items"
    # id 列，Integer 整数类型，primary_key=True 标记为主键（自增）
    id = Column(Integer, primary_key=True)
    # name 列，String 字符串类型（不指定长度默认 VARCHAR）
    name = Column(String)
    # price 列，Float 浮点数类型，存储商品价格
    price = Column(Float)

# 创建表
# 调用 Base.metadata.create_all(engine)
Base.metadata.create_all(engine)

# 定义 get_db 依赖：每个请求开一个 session
def get_db():
    # 创建 session
    # 定义变量 db
    db = SessionLocal()
    # 尝试执行
    try:
        # 交出 db
        yield db
    # 无论是否异常都执行
    finally:
        # 关闭 session
        # 调用 db.close()
        db.close()

# 定义 Pydantic 模型
class ItemCreate(BaseModel):
    # name 必填
    name: str
    # price 必填
    price: float

# 创建商品
@app.post("/items", status_code=201)
# 定义函数 create_item，参数 item 和 db
def create_item(item: ItemCreate, db = Depends(get_db)):
    # 创建 ORM 对象
    # 定义变量 db_item
    db_item = ItemModel(name=item.name, price=item.price)
    # 添加到 session
    # 调用 db.add(db_item)
    db.add(db_item)
    # 提交事务
    # 调用 db.commit()
    db.commit()
    # 刷新，获取自增 id
    # 调用 db.refresh(db_item)
    db.refresh(db_item)
    # 返回
    return {"id": db_item.id, "name": db_item.name, "price": db_item.price}
\`\`\`

用内存数据库覆盖，让测试不碰真实数据库：

\`\`\`python filename="test_db_mock.py —— 用内存数据库测试"
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine
# 从 sqlalchemy.orm 导入 sessionmaker
from sqlalchemy.orm import sessionmaker
# 从 main 导入 app, get_db, Base
from main import app, get_db, Base

# 定义测试数据库 fixture
@pytest.fixture
# 定义函数 test_db
def test_db():
    # 创建内存 SQLite 引擎
    # 定义变量 engine
    engine = create_engine("sqlite:///:memory:")
    # 创建表
    # 调用 Base.metadata.create_all(engine)
    Base.metadata.create_all(engine)
    # 创建 session 工厂
    # 定义变量 TestingSession
    TestingSession = sessionmaker(bind=engine)
    # 创建 session
    # 定义变量 db
    db = TestingSession()
    # 交出 db
    yield db
    # 清理
    # 调用 db.close()
    db.close()

# 定义带覆盖的 client fixture
@pytest.fixture
# 定义函数 client，参数 test_db
def client(test_db):
    # 定义替代函数
    # 定义函数 override_get_db
    def override_get_db():
        # 交出 test_db
        yield test_db

    # 覆盖依赖
    # 赋值 app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_db] = override_get_db
    # 创建客户端
    # 定义变量 c
    c = TestClient(app)
    # 交出 c
    yield c
    # 清理覆盖
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()

# 测试创建商品
def test_create_item(client):
    # 发 POST 请求
    # 定义变量 r
    r = client.post("/items", json={"name": "苹果", "price": 5.5})
    # 断言 201
    assert r.status_code == 201
    # 断言返回有 id
    assert "id" in r.json()
    # 断言 name
    assert r.json()["name"] == "苹果"

# 测试创建后数据库里真的有数据
def test_create_and_verify(client, test_db):
    # 通过 API 创建
    # 定义变量 r
    r = client.post("/items", json={"name": "香蕉", "price": 3.0})
    # 断言 201
    assert r.status_code == 201
    # 定义变量 item_id
    item_id = r.json()["id"]

    # 直接查数据库验证（绕过 API，直接用 ORM 查）
    # 从 main 导入 ItemModel
    from main import ItemModel
    # 查询刚创建的商品
    # test_db.query(ItemModel) 开始查询 items 表
    # .filter(ItemModel.id == item_id) 加 WHERE id = item_id 条件
    # .first() 返回第一条匹配记录，没有则返回 None
    # 定义变量 db_item
    db_item = test_db.query(ItemModel).filter(ItemModel.id == item_id).first()
    # 断言数据库里有
    assert db_item is not None
    # 断言 name
    assert db_item.name == "香蕉"
\`\`\`

## 四、模拟认证依赖

测试受保护的接口时，有时不需要测认证逻辑本身（它有自己的测试），只想测"认证后的业务逻辑"。这时覆盖认证依赖：

\`\`\`python filename="main.py —— 认证依赖"
# 从 fastapi 导入 FastAPI, Depends, HTTPException, Header
from fastapi import FastAPI, Depends, HTTPException, Header

# 创建应用
app = FastAPI()

# 定义"验证管理员"的依赖
# 定义函数 require_admin，参数 x_token 从 Header 提取
def require_admin(x_token: str = Header(...)):
    # 模拟：去数据库查 token 对应的用户
    # 定义变量 admin_tokens
    admin_tokens = {"admin-secret": "管理员"}
    # 条件判断：如果 x_token 不在 admin_tokens 里
    if x_token not in admin_tokens:
        # 抛 403
        raise HTTPException(status_code=403, detail="需要管理员权限")
    # 返回用户名
    return {"name": admin_tokens[x_token], "role": "admin"}

# 只有管理员能访问的接口
@app.delete("/users/{user_id}")
# 定义函数 delete_user，参数 user_id 和 admin
def delete_user(user_id: int, admin: dict = Depends(require_admin)):
    # 模拟删除用户
    return {"deleted": user_id, "by": admin["name"]}

# 管理员后台
@app.get("/admin/stats")
# 定义函数 admin_stats，参数 admin
def admin_stats(admin: dict = Depends(require_admin)):
    # 返回统计信息
    return {"total_users": 100, "admin": admin["name"]}
\`\`\`

\`\`\`python filename="test_auth_mock.py —— 覆盖认证"
# 导入 pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 main 导入 app, require_admin
from main import app, require_admin

# 定义"假装是管理员"的 fixture
@pytest.fixture
# 定义函数 mock_admin
def mock_admin():
    # 定义替代函数：直接返回管理员，不检查 token
    # 定义函数 fake_admin
    def fake_admin():
        # 返回假的管理员信息
        return {"name": "测试管理员", "role": "admin"}

    # 覆盖
    # 赋值 app.dependency_overrides[require_admin] = fake_admin
    app.dependency_overrides[require_admin] = fake_admin
    # 交出控制权
    yield
    # 清理
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()

# 测试管理员接口（不用真的带 token）
def test_delete_user(mock_admin):
    # mock_admin fixture 已经覆盖了认证
    # 定义变量 client
    client = TestClient(app)
    # 不带 X-Token 也能访问
    # 定义变量 r
    r = client.delete("/users/5")
    # 断言 200
    assert r.status_code == 200
    # 断言返回信息
    assert r.json()["by"] == "测试管理员"

# 测试不覆盖时（需要真的带 token）
def test_delete_user_without_mock():
    # 不用 mock_admin fixture
    # 定义变量 client
    client = TestClient(app)
    # 不带 token
    # 定义变量 r
    r = client.delete("/users/5")
    # 断言 422（X-Token 是必填 Header）
    assert r.status_code == 422

    # 带错误 token
    # 定义变量 r2
    r2 = client.delete("/users/5", headers={"X-Token": "wrong"})
    # 断言 403
    assert r2.status_code == 403

    # 带正确 token
    # 定义变量 r3
    r3 = client.delete("/users/5", headers={"X-Token": "admin-secret"})
    # 断言 200
    assert r3.status_code == 200
\`\`\`

> 怎么想：测"认证逻辑"时不覆盖（测试 2），测"认证后的业务"时覆盖（测试 1）。这样职责分明——认证的测试归认证，业务的测试归业务。

## 五、模拟外部 API 调用

接口里调用第三方 API（如支付、短信、天气）是常见需求，测试时必须 Mock：

\`\`\`python filename="main.py —— 调用外部 API"
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 导入 httpx
import httpx

# 创建应用
app = FastAPI()

# 定义"调用支付 API"的函数
# 定义函数 call_payment_api，参数 amount 和 order_id
def call_payment_api(amount: float, order_id: str):
    # 用 httpx 调用真实的支付 API
    # 定义变量 resp
    resp = httpx.post("https://api.payment.com/charge", json={
        "amount": amount,
        "order_id": order_id
    })
    # 返回响应
    return resp.json()

# 创建订单接口
@app.post("/orders")
# 定义函数 create_order，参数 amount 和 order_id
def create_order(amount: float, order_id: str):
    # 调用支付 API
    # 定义变量 result
    result = call_payment_api(amount, order_id)
    # 条件判断：如果 result 里的 status 不是 "success"
    if result.get("status") != "success":
        # 抛 400
        raise HTTPException(status_code=400, detail="支付失败")
    # 返回成功
    return {"order_id": order_id, "status": "paid"}
\`\`\`

用 \`unittest.mock.patch\` 替换 \`call_payment_api\`：

\`\`\`python filename="test_external_mock.py —— Mock 外部 API"
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 unittest.mock 导入 patch
from unittest.mock import patch
# 从 main 导入 app
from main import app

# 创建客户端
# 定义变量 client
client = TestClient(app)

# 测试 1：Mock 支付成功
# 用 @patch 装饰器替换 main 模块里的 call_payment_api
# 参数 return_value 指定 Mock 对象返回什么
@patch("main.call_payment_api", return_value={"status": "success", "charge_id": "ch_123"})
# 定义函数 test_order_success，参数 mock_payment（patch 会把 Mock 对象传进来）
def test_order_success(mock_payment):
    # 调用接口（不会真的调用支付 API）
    # 定义变量 r
    r = client.post("/orders", params={"amount": 100, "order_id": "ord_001"})
    # 断言 200
    assert r.status_code == 200
    # 断言返回 paid
    assert r.json()["status"] == "paid"
    # 验证 mock 被调用了一次
    # 调用 mock_payment.assert_called_once()
    mock_payment.assert_called_once()
    # 验证调用时的参数
    # 调用 mock_payment.assert_called_with(100, "ord_001")
    mock_payment.assert_called_with(100, "ord_001")

# 测试 2：Mock 支付失败
@patch("main.call_payment_api", return_value={"status": "failed"})
# 定义函数 test_order_failed，参数 mock_payment
def test_order_failed(mock_payment):
    # 调用接口
    # 定义变量 r
    r = client.post("/orders", params={"amount": 100, "order_id": "ord_002"})
    # 断言 400
    assert r.status_code == 400
    # 断言 detail
    assert r.json()["detail"] == "支付失败"

# 测试 3：Mock 支付 API 抛异常
@patch("main.call_payment_api", side_effect=Exception("网络超时"))
# 定义函数 test_order_exception，参数 mock_payment
def test_order_exception(mock_payment):
    # 调用接口
    # 定义变量 r
    r = client.post("/orders", params={"amount": 100, "order_id": "ord_003"})
    # 因为 call_payment_api 抛异常，FastAPI 默认返回 500
    assert r.status_code == 500
\`\`\`

> 关键点：\`@patch("main.call_payment_api")\` 的路径是"模块名.函数名"。它会在测试期间把这个函数替换成 Mock 对象，测试结束后自动恢复。\`return_value\` 指定返回值，\`side_effect\` 可以指定抛异常或返回多个值。

## 六、MagicMock 和 AsyncMock

\`MagicMock\` 是更强大的 Mock 对象，可以模拟任意对象的行为；\`AsyncMock\` 用于 Mock 异步函数：

\`\`\`python filename="test_magic_mock.py —— MagicMock 用法"
# 从 unittest.mock 导入 MagicMock, AsyncMock, patch
from unittest.mock import MagicMock, AsyncMock, patch

# 测试 1：MagicMock 基本用法
def test_magic_mock_basic():
    # 创建一个 MagicMock 对象
    # 定义变量 mock_obj
    mock_obj = MagicMock()

    # 设置返回值
    # 赋值 mock_obj.get_user.return_value = {"id": 1, "name": "小明"}
    mock_obj.get_user.return_value = {"id": 1, "name": "小明"}

    # 调用（不会真的执行，直接返回设定的值）
    # 定义变量 result
    result = mock_obj.get_user(1)
    # 断言返回的是设定的值
    assert result == {"id": 1, "name": "小明"}

    # 验证被调用过
    # 调用 mock_obj.get_user.assert_called_once()
    mock_obj.get_user.assert_called_once()
    # 验证调用参数是 1
    # 调用 mock_obj.get_user.assert_called_with(1)
    mock_obj.get_user.assert_called_with(1)

# 测试 2：MagicMock 模拟复杂对象
def test_magic_mock_complex():
    # 创建 Mock
    # 定义变量 mock_db
    mock_db = MagicMock()

    # 模拟 query().filter().first() 链式调用
    # SQLAlchemy 的查询是链式的：db.query(Model).filter(条件).first()
    # Mock 要逐层设置 return_value，才能让链式调用都返回 Mock 对象
    # 赋值 mock_db.query.return_value.filter.return_value.first.return_value = None
    mock_db.query.return_value.filter.return_value.first.return_value = None

    # 调用链式方法
    # type("Item", (), {}) 用 type() 动态创建一个空类（类名 "Item"，无父类，无属性）
    # Item := 是海象运算符，把动态创建的类赋值给变量 Item，同时作为参数传给 query()
    # 这里只是需要一个占位参数，用动态建类省去单独定义类的麻烦
    # 定义变量 result
    result = mock_db.query(Item := type("Item", (), {})).filter(None).first()
    # 断言返回 None（前面设置的 return_value = None）
    assert result is None

# 测试 3：AsyncMock 测试异步函数
# 导入 asyncio 和 pytest
import asyncio
import pytest

# 定义一个异步函数
async def fetch_data(url):
    # 模拟异步请求
    return {"data": "real"}

# 用 AsyncMock 替换异步函数
@pytest.mark.asyncio
# 定义函数 test_async_mock
def test_async_mock():
    # 创建 AsyncMock
    # 定义变量 mock_fetch
    mock_fetch = AsyncMock(return_value={"data": "mocked"})

    # async 函数的返回值是协程，需要 await
    # 用 asyncio.run 执行
    # 定义变量 result
    result = asyncio.run(mock_fetch("http://example.com"))
    # 断言返回的是 Mock 值
    assert result == {"data": "mocked"}
    # 验证被调用
    # 调用 mock_fetch.assert_called_once_with("http://example.com")
    mock_fetch.assert_called_once_with("http://example.com")
\`\`\`

## 七、实战：Mock 外部服务的完整测试

综合运用 \`dependency_overrides\` + \`patch\`，测试一个"创建订单"接口，它依赖认证、数据库、支付 API、短信通知：

\`\`\`python filename="order_app.py —— 完整的订单应用"
# 从 fastapi 导入 FastAPI, Depends, HTTPException, Header
from fastapi import FastAPI, Depends, HTTPException, Header
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 导入 httpx
import httpx

# 创建应用
app = FastAPI()

# 定义订单模型
class OrderCreate(BaseModel):
    # 商品名
    product: str
    # 金额
    amount: float

# 内存数据库
# 定义变量 orders_db
orders_db = {}
# 定义变量 next_id
next_id = 1

# 认证依赖
# 定义函数 get_current_user，参数 x_token
def get_current_user(x_token: str = Header(...)):
    # 条件判断：如果 x_token 不等于 "user-token"
    if x_token != "user-token":
        # 抛 401
        raise HTTPException(status_code=401, detail="未登录")
    # 返回用户
    return {"id": 1, "name": "小明"}

# 数据库依赖
# 定义函数 get_db
def get_db():
    # 返回全局 orders_db
    return orders_db

# 支付函数（调用外部 API）
# 定义函数 charge_payment，参数 amount 和 order_id
def charge_payment(amount: float, order_id: str):
    # 调用真实支付 API
    # 定义变量 resp
    resp = httpx.post("https://api.payment.com/charge", json={
        "amount": amount,
        "order_id": order_id
    })
    # 返回结果
    return resp.json()

# 短信通知函数（调用外部 API）
# 定义函数 send_sms，参数 phone 和 message
def send_sms(phone: str, message: str):
    # 调用真实短信 API
    # 定义变量 resp
    resp = httpx.post("https://api.sms.com/send", json={
        "phone": phone,
        "message": message
    })
    # 返回结果
    return resp.json()

# 创建订单接口
@app.post("/orders")
# 定义函数 create_order，参数 order, user, db
def create_order(
    order: OrderCreate,
    user: dict = Depends(get_current_user),
    db: dict = Depends(get_db),
):
    # 声明使用全局变量
    global next_id
    # 生成订单 id
    # 定义变量 order_id
    order_id = next_id
    # id 自增
    next_id += 1

    # 调用支付
    # 定义变量 pay_result
    pay_result = charge_payment(order.amount, f"ord_{order_id}")
    # 条件判断：如果支付失败
    if pay_result.get("status") != "success":
        # 抛 400
        raise HTTPException(status_code=400, detail="支付失败")

    # 发短信通知
    # 调用 send_sms
    send_sms("13800000000", f"您的订单 ord_{order_id} 已创建")

    # 存入数据库
    # 定义变量 order_data
    order_data = {
        "id": order_id,
        "product": order.product,
        "amount": order.amount,
        "user": user["name"],
        "status": "paid",
    }
    # 赋值 db[order_id] = order_data
    db[order_id] = order_data

    # 返回订单
    return order_data
\`\`\`

\`\`\`python filename="test_order_complete.py —— 完整 Mock 测试"
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 unittest.mock 导入 patch, MagicMock
from unittest.mock import patch, MagicMock
# 从 order_app 导入 app, get_current_user, get_db, charge_payment, send_sms
from order_app import app, get_current_user, get_db, charge_payment, send_sms

# 定义覆盖认证的 fixture
@pytest.fixture
# 定义函数 mock_auth
def mock_auth():
    # 定义替代函数
    # 定义函数 fake_user
    def fake_user():
        # 返回假用户
        return {"id": 1, "name": "测试用户"}
    # 覆盖
    # 赋值 app.dependency_overrides[get_current_user] = fake_user
    app.dependency_overrides[get_current_user] = fake_user
    # 交出
    yield
    # 清理
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()

# 定义测试数据库 fixture
@pytest.fixture
# 定义函数 test_db
def test_db():
    # 定义替代函数：返回空字典
    # 定义函数 fake_db
    def fake_db():
        # 返回空字典
        return {}
    # 覆盖
    # 赋值 app.dependency_overrides[get_db] = fake_db
    app.dependency_overrides[get_db] = fake_db
    # 交出空字典（让测试可以直接检查）
    # 定义变量 db
    db = {}
    # 修改 fake_db 让它返回这个 db
    # 重新定义 fake_db
    def fake_db():
        # 返回 db
        return db
    # 重新覆盖
    # 赋值 app.dependency_overrides[get_db] = fake_db
    app.dependency_overrides[get_db] = fake_db
    # 交出 db
    yield db
    # 清理
    # 调用 app.dependency_overrides.clear()
    app.dependency_overrides.clear()

# 测试 1：创建订单成功（Mock 支付和短信）
@patch("order_app.send_sms")
@patch("order_app.charge_payment")
# 定义函数 test_create_order_success
def test_create_order_success(
    mock_charge,       # charge_payment 的 Mock（注意：装饰器从下往上传，最下面的 patch 对应第一个参数）
    mock_send_sms,     # send_sms 的 Mock
    mock_auth,         # fixture
    test_db,           # fixture
):
    # 设置支付 Mock 返回成功
    # 赋值 mock_charge.return_value = {"status": "success"}
    mock_charge.return_value = {"status": "success"}
    # 设置短信 Mock 返回成功
    # 赋值 mock_send_sms.return_value = {"status": "ok"}
    mock_send_sms.return_value = {"status": "ok"}

    # 创建客户端
    # 定义变量 client
    client = TestClient(app)
    # 调用接口
    # 定义变量 r
    r = client.post("/orders", json={"product": "手机", "amount": 5999})
    # 断言 200
    assert r.status_code == 200
    # 断言返回 status 是 paid
    assert r.json()["status"] == "paid"
    # 断言商品名
    assert r.json()["product"] == "手机"

    # 验证支付 API 被调用了一次
    # 调用 mock_charge.assert_called_once()
    mock_charge.assert_called_once()
    # 验证短信被调用了一次
    # 调用 mock_send_sms.assert_called_once()
    mock_send_sms.assert_called_once()
    # 验证短信内容包含订单号
    # 定义变量 sms_args
    sms_args = mock_send_sms.call_args[0]
    # 断言第二个参数（message）包含 "ord_1"
    assert "ord_1" in sms_args[1]

    # 验证数据库里有数据
    # 条件判断：如果 1 in test_db
    assert 1 in test_db
    # 断言数据库里的订单
    assert test_db[1]["product"] == "手机"

# 测试 2：支付失败
@patch("order_app.send_sms")
@patch("order_app.charge_payment")
# 定义函数 test_create_order_pay_fail
def test_create_order_pay_fail(mock_charge, mock_send_sms, mock_auth, test_db):
    # 支付返回失败
    # 赋值 mock_charge.return_value = {"status": "failed"}
    mock_charge.return_value = {"status": "failed"}

    # 创建客户端
    # 定义变量 client
    client = TestClient(app)
    # 调用接口
    # 定义变量 r
    r = client.post("/orders", json={"product": "电脑", "amount": 8999})
    # 断言 400
    assert r.status_code == 400
    # 断言 detail
    assert r.json()["detail"] == "支付失败"

    # 支付失败时，短信不应该被发送
    # 调用 mock_send_sms.assert_not_called()
    mock_send_sms.assert_not_called()
    # 数据库里也不应该有订单
    # 断言 test_db 为空
    assert len(test_db) == 0

# 测试 3：未认证（不覆盖认证）
@patch("order_app.charge_payment")
# 定义函数 test_create_order_no_auth
def test_create_order_no_auth(mock_charge, test_db):
    # 不用 mock_auth，认证依赖会真的执行
    # 创建客户端
    # 定义变量 client
    client = TestClient(app)
    # 不带 token
    # 定义变量 r
    r = client.post("/orders", json={"product": "手机", "amount": 5999})
    # 断言 422（X-Token 必填）
    assert r.status_code == 422
    # 支付 API 不应该被调用
    # 调用 mock_charge.assert_not_called()
    mock_charge.assert_not_called()
\`\`\`

> 怎么想这个测试：我们 Mock 了三层——认证用 \`dependency_overrides\`（FastAPI 层），数据库用 \`dependency_overrides\`，外部 API 用 \`patch\`（Python 层）。测试验证了：正常流程、支付失败、未认证三种情况，且验证了"支付失败时不发短信""未认证时不调支付"这些逻辑约束。

## 八、常见错误与避坑指南

| 错误 | 现象 | 原因 | 解决 |
| --- | --- | --- | --- |
| 忘了 clear | 其他测试被影响 | dependency_overrides 没清理 | 用 fixture 的 yield 后 \`clear()\` |
| patch 路径错 | Mock 不生效 | patch 的路径不对 | patch"被测模块导入的名字"，不是"定义的模块" |
| patch 装饰器顺序反 | Mock 对象对不上 | 多个 @patch 从下往上对应参数 | 最下面的 @patch 对应第一个参数 |
| Mock 异步函数用 MagicMock | 协程报错 | MagicMock 不支持 async | 用 \`AsyncMock\` 或 \`@patch(..., new_callable=AsyncMock)\` |
| 验证调用次数错 | assert 报错 | 实际调用次数和预期不一致 | 先 \`print(mock.call_count)\` 看实际次数 |
| Mock 了但代码没用到 | 测试还是调了真实 API | patch 路径不对或函数名拼错 | 检查 patch 的模块名和函数名 |

> 最容易踩的坑是 **patch 的路径**。假设 \`main.py\` 里有 \`from utils import send_sms\`，然后在 \`main.py\` 里调用 \`send_sms()\`。你要 patch 的是 \`main.send_sms\`（main 模块里的名字），不是 \`utils.send_sms\`。因为 Python 导入时把名字绑定到了 main 模块的命名空间。

## 九、小结

Mock 让测试不依赖外部服务。FastAPI 有两种 Mock 方式：\`app.dependency_overrides\` 覆盖 Depends 依赖（数据库、认证），\`unittest.mock.patch\` 替换任意函数（外部 API）。用 fixture 管理 Mock 的生命周期——yield 前设置，yield 后清理。测试不仅要验证返回值，还要验证"Mock 是否被正确调用"（assert_called_once 等）。

但写完测试后怎么知道"测了多少代码""哪些没测到"？这需要覆盖率工具。下一章讲。
`
  },

  // =========================================================
  // 第四章：覆盖率与持续测试
  // =========================================================
  {
    id: "fa-coverage",
    group: "测试",
    icon: "📊",
    title: "覆盖率与持续测试",
    content: `

# 覆盖率与持续测试

## 一、什么是测试覆盖率

写了一堆测试，怎么知道有没有漏？**覆盖率（Coverage）**告诉你"测试运行时，有多少行代码被执行了"：

\`\`\`txt filename="覆盖率示意"
你的代码有 100 行
测试运行时，执行了其中 80 行
→ 行覆盖率 = 80%

剩余 20 行没被执行 = 没被测试覆盖 = 可能有 bug
\`\`\`

覆盖率有两种：
- **行覆盖率**：有多少行被执行了（最常用）。
- **分支覆盖率**：有多少 if/else 分支被走了（更严格）。

> 覆盖率 100% 不代表没 bug（你可能测了"执行了这行"但没测"结果对不对"），但覆盖率低一定有风险——没执行过的代码，你完全不知道它能不能跑。

## 二、安装 pytest-cov

\`\`\`bash filename="安装覆盖率工具"
# 安装 pytest-cov（pytest 的覆盖率插件，底层用 coverage.py）
pip install pytest-cov

# 验证安装
pytest --help | grep cov
\`\`\`

## 三、基本用法：查看覆盖率

\`\`\`python filename="calculator.py —— 被测代码"
# 定义函数 calculate，参数 a, b, op
# 类型注解：a 和 b 是 int，op 是 str，返回值是 int
def calculate(a: int, b: int, op: str) -> int:
    # 条件判断：根据 op 执行不同操作
    if op == "add":
        # 加法
        return a + b
    # 条件判断：如果 op 等于 "sub"
    elif op == "sub":
        # 减法
        return a - b
    # 条件判断：如果 op 等于 "mul"
    elif op == "mul":
        # 乘法
        return a * b
    # 条件判断：如果 op 等于 "div"
    elif op == "div":
        # 条件判断：如果 b 等于 0
        # 除零检查：避免 ZeroDivisionError
        if b == 0:
            # 除零保护
            # 抛出 ValueError 让调用方处理
            raise ValueError("不能除以零")
        # 除法
        # 用 // 整数除法，返回整数
        return a // b
    else:
        # 未知操作
        # f-string 格式化错误信息，包含传入的 op 方便调试
        raise ValueError(f"未知操作: {op}")
\`\`\`

\`\`\`python filename="test_calculator.py —— 测试代码"
# 从 calculator 导入 calculate
from calculator import calculate

# 测试加法
def test_add():
    # 断言 1 + 2 = 3
    assert calculate(1, 2, "add") == 3

# 测试减法
def test_sub():
    # 断言 5 - 3 = 2
    assert calculate(5, 3, "sub") == 2

# 测试乘法
def test_mul():
    # 断言 3 * 4 = 12
    assert calculate(3, 4, "mul") == 12

# 测试除法
def test_div():
    # 断言 10 / 2 = 5
    assert calculate(10, 2, "div") == 5

# 注意：没测 div 的除零分支，也没测 else 分支
\`\`\`

\`\`\`bash filename="运行覆盖率"
# 运行测试并显示覆盖率
# --cov=calculator 指定要统计覆盖率的模块
pytest --cov=calculator test_calculator.py

# 输出类似：
# Name          Stmts   Miss  Cover
# ---------------------------------
# calculator.py    15      3    80%
# ---------------------------------
# TOTAL             15      3    80%
#
# Stmts = 总语句数，Miss = 未执行的语句数，Cover = 覆盖率
\`\`\`

可以看到 \`calculator.py\` 覆盖率 80%，有 3 行没被执行——正是我们没测的"除零分支"和"else 分支"。

\`\`\`bash filename="显示具体哪些行没覆盖"
# 加 --cov-report=term-missing 显示漏掉的行号
pytest --cov=calculator --cov-report=term-missing test_calculator.py

# 输出：
# Name          Stmts   Miss  Cover   Missing
# ------------------------------------------
# calculator.py    15      3    80%   14, 17-18
# ------------------------------------------
# Missing 列显示没覆盖的行号：第 14 行（除零 raise）和 17-18 行（else）
\`\`\`

## 四、生成 HTML 覆盖率报告

终端报告只看数字，HTML 报告能直观看到哪些代码被覆盖、哪些没被：

\`\`\`bash filename="生成 HTML 报告"
# --cov-report=html 会在 htmlcov/ 目录生成 HTML 报告
pytest --cov=calculator --cov-report=html test_calculator.py

# 然后用浏览器打开 htmlcov/index.html
# 绿色 = 已覆盖，红色 = 未覆盖，数字 = 被执行的次数
\`\`\`

\`\`\`txt filename="HTML 报告的优点"
- 颜色直观：绿行=已覆盖，红行=未覆盖
- 可点击：进入每个文件看逐行详情
- 显示执行次数：不只是"执行了"，还显示"执行了几次"
- 适合分享：可以发给团队看
\`\`\`

## 五、覆盖率配置：.coveragerc

不要把所有 \`--cov\` 参数都写在命令行里，用配置文件管理：

\`\`\`ini filename=".coveragerc —— 覆盖率配置文件"
# .coveragerc 是 coverage.py 的配置文件
[run]
# 指定要统计的源码目录
source = .
# 开启分支覆盖率（不只是行覆盖率）
branch = True
# 排除不需要统计的文件
omit =
    */tests/*
    */test_*.py
    */__pycache__/*
    */migrations/*
    */venv/*

[report]
# 排除不需要统计的代码行（这些行即使没执行也不算"漏测"）
exclude_lines =
    # pragma: no cover（标记"故意不测"的行）
    pragma: no cover
    # 抽象方法（子类才实现，不用测）
    @(abc\.)?abstractmethod
    # raise NotImplementedError（占位代码）
    raise NotImplementedError
    # if __name__ == .__main__.（入口代码）
    if __name__ == .__main__.:
    # if TYPE_CHECKING:（仅类型检查用的代码）
    if TYPE_CHECKING:

# 覆盖率低于这个值时命令失败（CI 用）
fail_under = 80

# 按文件排序
sort = cover

[html]
# HTML 报告输出目录
directory = htmlcov
\`\`\`

> 关键配置解释：
> - \`branch = True\`：开启分支覆盖。行覆盖只看"这行执行了没"，分支覆盖还看"if 的两个分支都走了没"。
> - \`omit\`：排除测试文件本身、迁移脚本等不需要测的代码。
> - \`exclude_lines\`：用注释标记"这行不用测"。比如 \`def abstract_method(): pragma: no cover\`。
> - \`fail_under = 80\`：覆盖率低于 80% 时 pytest 退出码非 0，CI 会标红。

## 六、分支覆盖率 vs 行覆盖率

\`\`\`python filename="branch_example.py —— 分支覆盖示例"
# 定义函数 grade，参数 score
def grade(score: int) -> str:
    # 条件判断：如果 score >= 90
    if score >= 90:
        # 返回 A
        return "A"
    # 条件判断：如果 score >= 60
    elif score >= 60:
        # 返回 B
        return "B"
    else:
        # 返回 C
        return "C"
\`\`\`

\`\`\`python filename="test_branch.py"
# 从 branch_example 导入 grade
from branch_example import grade

# 只测了 score=95 和 score=70，没测 score=50
def test_grade_a():
    # 断言 95 分是 A
    assert grade(95) == "A"

def test_grade_b():
    # 断言 70 分是 B
    assert grade(70) == "B"

# score=50（else 分支）没测！
\`\`\`

\`\`\`txt filename="行覆盖率 vs 分支覆盖率"
行覆盖率：
  score=95 走了第 2、3 行 → 第 2、3 行已覆盖
  score=70 走了第 2、5、6 行 → 第 5、6 行已覆盖
  第 8、9 行（else）没走过 → 未覆盖
  → 行覆盖率 = 6/8 = 75%

分支覆盖率：
  if score >= 90：True 分支走过，False 分支走过 → 覆盖
  elif score >= 60：True 分支走过，False 分支没走过（没测 <60） → 未覆盖
  → 分支覆盖率更低，更能发现问题
\`\`\`

结论：**分支覆盖率比行覆盖率更严格，推荐开启**（\`branch = True\`）。

## 七、在代码中标记不需要测试的行

有些代码确实不需要测（环境检查、调试入口等），用 \`# pragma: no cover\` 标记：

\`\`\`python filename="pragma 用法"
# 定义函数 init_app
def init_app():
    # 正常代码，需要测试
    # 定义变量 config
    config = load_config()
    # 返回 config
    return config

# 这个函数只在命令行直接运行时执行，不用测
def main():  # pragma: no cover
    # 初始化应用
    # 定义变量 app
    app = init_app()
    # 启动服务器
    # 调用 app.run()
    app.run()

# 这个分支只在 Windows 上走，CI 是 Linux 不用测
import sys
# 定义函数 get_path_sep
def get_path_sep():
    # 条件判断：如果 sys.platform 等于 "win32"
    if sys.platform == "win32":  # pragma: no cover
        # Windows 路径分隔符
        return "\\\\"
    else:
        # Unix 路径分隔符
        return "/"

# TYPE_CHECKING 下的代码不运行，不用测
from typing import TYPE_CHECKING
# 条件判断：如果 TYPE_CHECKING 为真
if TYPE_CHECKING:  # 自动被 .coveragerc 排除
    # 导入仅用于类型注解的类
    from models import User
\`\`\`

## 八、覆盖率目标设定

\`\`\`txt filename="覆盖率目标建议"
100% —— 理想但通常不现实，追求但不强求
 90% —— 优秀，核心业务代码应该达到
 80% —— 合格，一般项目的底线（fail_under = 80）
 70% —— 及格，历史项目至少要到这个
 50% —— 不及格，风险很大
  0% —— 没有测试

不同代码不同要求：
- 核心业务逻辑（订单、支付）：>= 90%
- 工具函数、辅助代码：>= 70%
- 配置、入口代码：可以不要求
- 第三方适配层：>= 50%（很多是转发，难测）
\`\`\`

> 避坑指南：**不要盲目追求 100% 覆盖率**。100% 覆盖率只说明"每行都执行了"，不代表"每行都测对了"。一个测试里只写 \`func()\` 不 assert 也能让覆盖率 100%，但毫无意义。覆盖率是"必要不充分条件"——达标不代表没问题，但不达标一定有问题。

## 九、实战：为完整项目添加覆盖率报告

来看一个完整项目的覆盖率配置和测试补充：

\`\`\`txt filename="项目结构"
myproject/
├── app/
│   ├── __init__.py
│   ├── main.py          ← FastAPI 应用
│   ├── routers/
│   │   ├── users.py     ← 用户路由
│   │   └── items.py     ← 商品路由
│   ├── models.py        ← 数据模型
│   ├── database.py      ← 数据库连接
│   └── utils.py         ← 工具函数
├── tests/
│   ├── conftest.py      ← 公共 fixture
│   ├── test_users.py    ← 用户测试
│   ├── test_items.py    ← 商品测试
│   └── test_utils.py    ← 工具测试
├── .coveragerc          ← 覆盖率配置
├── pytest.ini           ← pytest 配置
└── requirements.txt
\`\`\`

\`\`\`ini filename="pytest.ini —— pytest 配置"
[pytest]
# 测试文件位置
testpaths = tests
# 自动发现规则
python_files = test_*.py
python_functions = test_*
# 命令行默认参数（每次运行 pytest 都自动带上）
addopts = 
    --cov=app
    --cov-report=term-missing
    --cov-report=html
    --cov-config=.coveragerc
    -v
# asyncio 模式（如果用 pytest-asyncio）
asyncio_mode = auto
\`\`\`

\`\`\`ini filename=".coveragerc —— 覆盖率配置"
[run]
# 统计 app 目录
source = app
# 开启分支覆盖
branch = True
# 排除迁移、初始化文件
omit =
    app/__init__.py
    app/migrations/*

[report]
# 最低覆盖率要求
fail_under = 85
# 排除的行
exclude_lines =
    pragma: no cover
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @(abc\.)?abstractmethod

[html]
directory = htmlcov
\`\`\`

\`\`\`python filename="app/utils.py —— 工具函数（有些分支没测）"
# 定义函数 format_price，参数 price
def format_price(price: float) -> str:
    """格式化价格"""
    # 条件判断：如果 price < 0
    if price < 0:
        # 负数返回错误提示
        return "价格无效"
    # 条件判断：如果 price 等于 0
    if price == 0:
        # 免费返回"免费"
        return "免费"
    # 条件判断：如果 price > 10000
    if price > 10000:
        # 大额返回万元单位
        return f"{price / 10000:.1f}万元"
    else:
        # 普通返回元
        return f"{price:.2f}元"

# 定义函数 validate_phone，参数 phone
def validate_phone(phone: str) -> bool:
    """验证手机号"""
    # 条件判断：如果 phone 长度不等于 11
    if len(phone) != 11:
        # 返回 False
        return False
    # 条件判断：如果不是 phone 以 1 开头
    if not phone.startswith("1"):
        # 返回 False
        return False
    # 条件判断：如果不是 phone 全是数字
    if not phone.isdigit():
        # 返回 False
        return False
    # 返回 True
    return True
\`\`\`

\`\`\`python filename="tests/test_utils.py —— 补全测试"
# 从 app.utils 导入 format_price, validate_phone
from app.utils import format_price, validate_phone
# 导入 pytest
import pytest

# 测试格式化价格：正常情况
def test_format_price_normal():
    # 断言 9.5 格式化为 "9.50元"
    assert format_price(9.5) == "9.50元"
    # 断言 99.99 格式化为 "99.99元"
    assert format_price(99.99) == "99.99元"

# 测试格式化价格：零
def test_format_price_zero():
    # 断言 0 格式化为 "免费"
    assert format_price(0) == "免费"

# 测试格式化价格：负数
def test_format_price_negative():
    # 断言 -5 格式化为 "价格无效"
    assert format_price(-5) == "价格无效"

# 测试格式化价格：大额
def test_format_price_large():
    # 断言 15000 格式化为 "1.5万元"
    assert format_price(15000) == "1.5万元"

# 参数化测试手机号验证
@pytest.mark.parametrize("phone, expected", [
    ("13800138000", True),    # 正确
    ("1380013800", False),    # 少一位
    ("138001380001", False),  # 多一位
    ("23800138000", False),   # 不以 1 开头
    ("13800abc000", False),   # 含字母
    ("", False),              # 空字符串
])
# 定义函数 test_validate_phone
def test_validate_phone(phone, expected):
    # 断言验证结果
    assert validate_phone(phone) == expected
\`\`\`

运行测试看覆盖率：

\`\`\`bash filename="运行并查看覆盖率"
# 直接运行 pytest（addopts 里已配好覆盖率参数）
pytest

# 输出：
# ---------- coverage: platform win32, python 3.11 ----------
# Name                    Stmts   Miss Branch BrPart  Cover   Missing
# ------------------------------------------------------------------
# app/__init__.py             0      0      0      0   100%
# app/utils.py               15      0      8      0   100%
# app/routers/users.py       20      2      6      1    88%   15, 28
# app/routers/items.py       18      1      5      1    92%   12
# app/main.py                 8      0      0      0   100%
# ------------------------------------------------------------------
# TOTAL                      61      3     19      2    92%
#
# Required test coverage of 85% reached. Total coverage: 92%
# ========================= 15 passed in 0.45s =========================
\`\`\`

> 看到了吗？\`utils.py\` 达到 100%，\`routers/users.py\` 只有 88%（第 15、28 行没覆盖）。\`Missing\` 列告诉你该补哪些测试。如果低于 \`fail_under=85\`，pytest 会返回非 0 退出码，CI 会标红。

## 十、CI 中的覆盖率检查

在 GitHub Actions / GitLab CI 里集成覆盖率检查：

\`\`\`yaml filename=".github/workflows/test.yml —— GitHub Actions 配置"
# 工作流名称
name: Test

# 触发条件：push 和 pull request 时触发
on: [push, pull_request]

# 定义任务
jobs:
  test:
    # 运行在 Ubuntu 上
    runs-on: ubuntu-latest
    # 定义步骤
    steps:
      # 第 1 步：检出代码
      - uses: actions/checkout@v4
      # 第 2 步：安装 Python
      - uses: actions/setup-python@v5
        with:
          # Python 版本
          python-version: "3.11"
      # 第 3 步：安装依赖
      - name: Install dependencies
        # 执行命令
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      # 第 4 步：运行测试（带覆盖率检查）
      - name: Run tests
        # 执行 pytest
        run: pytest
      # 第 5 步：上传 HTML 报告（可选）
      - name: Upload coverage report
        # 用 actions/upload-artifact 上传
        uses: actions/upload-artifact@v4
        with:
          # 上传 htmlcov 目录
          name: coverage-report
          path: htmlcov/
\`\`\`

\`\`\`txt filename="CI 覆盖率策略"
1. fail_under = 85：覆盖率低于 85% CI 标红，阻止合并
2. PR 必须通过测试才能合并（分支保护规则）
3. 定期检查覆盖率趋势：覆盖率下降时及时补测试
4. 新功能必须带测试（Code Review 时检查）
\`\`\`

## 十一、测试最佳实践

\`\`\`txt filename="测试金字塔"
                    /\\
                   /  \\        ← 少量端到端测试（E2E）
                  /----\\         速度慢、不稳定
                 /      \\
                /        \\      ← 适量集成测试
               /----------\\       测接口组合
              /            \\
             /              \\    ← 大量单元测试
            /------------------\\   速度快、稳定
\`\`\`

**最佳实践清单**：

1. **测试要快**：单元测试应该在几秒内跑完。慢的测试（连数据库、调 API）要 Mock 或隔离。
2. **测试要独立**：测试之间不能有依赖。用 fixture 保证每个测试都是干净的状态。
3. **测试要可读**：测试名描述行为（\`test_create_user_with_duplicate_email_returns_409\`），不只是 \`test_1\`。
4. **Arrange-Act-Assert 模式**：每个测试分三段——准备、执行、断言。
5. **测一个东西**：一个测试只验证一个行为，不要在一个测试里塞十个断言。
6. **边界值必测**：0、空字符串、最大值、负数、None——这些最容易出 bug。
7. **测异常路径**：不只是"正常流程能成功"，还要测"错误输入被拒绝"。
8. **覆盖率是参考不是目标**：追求有意义的测试，而不是追求 100% 数字。

\`\`\`python filename="好的测试 vs 坏的测试"
# 坏的测试：名字无意义、测多个东西、没断言意图
def test_user():
    # 定义变量 r
    r = client.post("/users", json={"name": "A"})
    assert r.status_code == 201
    # 又测了查询
    r2 = client.get("/users/1")
    assert r2.status_code == 200
    # 又测了删除
    r3 = client.delete("/users/1")
    assert r3.status_code == 204

# 好的测试：名字描述行为、只测一件事、AAA 模式
def test_create_user_with_valid_data_returns_201():
    # Arrange（准备）
    # 定义变量 payload
    payload = {"name": "小明", "email": "xm@example.com"}

    # Act（执行）
    # 定义变量 r
    r = client.post("/users", json=payload)

    # Assert（断言）
    assert r.status_code == 201
    assert r.json()["name"] == "小明"
    assert "id" in r.json()

def test_create_user_with_duplicate_email_returns_409():
    # Arrange
    # 先创建一个用户
    client.post("/users", json={"name": "小明", "email": "dup@example.com"})
    # 定义变量 payload，用同样的邮箱
    payload = {"name": "小红", "email": "dup@example.com"}

    # Act
    # 定义变量 r
    r = client.post("/users", json=payload)

    # Assert
    assert r.status_code == 409
    assert "已存在" in r.json()["detail"]
\`\`\`

## 十二、常见错误与避坑指南

| 错误 | 现象 | 原因 | 解决 |
| --- | --- | --- | --- |
| 覆盖率统计为 0 | \`No data to report\` | source 路径不对 | 检查 \`--cov=模块名\` 或 .coveragerc 的 \`source\` |
| HTML 报告打不开 | 找不到 htmlcov | 没生成或目录不对 | 确认 \`--cov-report=html\` 已加 |
| 覆盖率虚高 | 99% 但很多没测 | 只统计了部分文件 | 检查 \`omit\` 是否排多了 |
| fail_under 不生效 | 覆盖率低但 CI 绿 | 配置没读到 | 确认 .coveragerc 在项目根目录 |
| 分支覆盖率低 | branch 远低于 line | if/else 只走了一个分支 | 补测另一个分支的输入 |
| CI 上覆盖率比本地低 | 本地 90% CI 80% | 测试文件不在 CI | 检查 CI 是否运行了所有测试 |

> 最常见的坑：**覆盖率虚高**。如果你把所有 router 文件加到 \`omit\` 里，覆盖率会很高，但你根本没测路由逻辑。\`omit\` 只应该排除真正不需要测的（迁移、入口、第三方适配），不要用它来"刷"覆盖率。

## 十三、持续测试的完整工作流

\`\`\`txt filename="开发流程中的测试"
1. 写功能代码前先写测试（TDD）或写完后立即补测试
2. 本地运行 pytest，确保全绿
3. 检查覆盖率：pytest --cov-report=term-missing 看有没有漏
4. 补测 Missing 行对应的逻辑
5. git commit 时提交代码 + 测试
6. push 后 CI 自动运行测试 + 覆盖率检查
7. PR 审查时检查：有没有测试？覆盖率有没有下降？
8. 合并前必须 CI 绿 + 覆盖率达标
9. 定期回顾：哪些测试经常挂？哪些代码覆盖率在降？
\`\`\`

## 十四、小结

覆盖率是测试质量的"温度计"——它不能告诉你"代码没问题"，但能告诉你"哪些代码没被测过"。用 \`pytest-cov\` 生成覆盖率报告，用 \`.coveragerc\` 配置统计范围和排除规则，用 \`fail_under\` 在 CI 中强制覆盖率底线。开启分支覆盖率比行覆盖率更严格。但记住：覆盖率是参考不是目标——一个有意义的 \`assert\` 比 10 行无断言的"执行"更有价值。

至此，FastAPI 测试的四大支柱讲完了：TestClient 发请求、pytest 组织测试、Mock 隔离依赖、覆盖率度量质量。把这四件武器组合起来，你就能为任何 FastAPI 项目写出可靠、快速、可维护的测试套件。
`
  }
];
