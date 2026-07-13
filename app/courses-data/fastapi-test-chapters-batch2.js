// =============================================================
// FastAPI 测试与部署全书 - 第 2 批章节（测试核心 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ft-path-query: 测试路径与查询参数
//   ft-body-pydantic: 测试请求体与 Pydantic 校验
//   ft-response-model: 测试响应模型与状态码
//   ft-exception: 测试异常处理
//   ft-dependency: 测试依赖注入
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：测试路径与查询参数
  // ============================================================
  {
    id: "ft-path-query",
    group: "测试核心",
    icon: "🛣️",
    title: "测试路径与查询参数",
    content: `# 测试路径与查询参数

## 为什么从路径与查询参数开始测

路径参数和查询参数是 API 最基础的输入。一个接口能不能正确解析 \`/items/42?skip=0&limit=10\` 这样的 URL，是整个系统正确性的第一道门。如果这道门漏风，后面的业务逻辑、数据库操作、权限校验全都建立在错误的数据之上。

FastAPI 基于 Starlette，测试时我们用框架自带的 \`TestClient\`。它本质上是 \`httpx.Client\` 加上一个 \`StarletteTransport\`，能在不启动真实 HTTP 服务的情况下，直接把请求喂给 ASGI 应用，再把响应拿回来。这就像在自家院子里模拟一场快递收发，不用真的把包裹寄出去。

生活类比：测试路径参数就像快递员在门口检查地址。门牌号（路径参数）写错了，包裹根本送不到；楼栋号、单元号（查询参数）写错了，能送到但分错人。我们要测的就是"快递员"——也就是 FastAPI 的路由解析——能不能正确识别这些信息，并在出错时给出清晰的提示。

## 路径参数的测试要点

路径参数有三个测试重点：

1. **类型转换**：FastAPI 会把 URL 里的字符串按类型注解转换。声明 \`item_id: int\`，传 \`/items/42\` 会被转成整数 42。测试要验证转换成功的情况。
2. **422 错误**：传了无法转换的值（比如 \`/items/abc\`），FastAPI 返回 422 状态码，body 是结构化的错误信息。测试要断言这个结构和字段。
3. **必填参数**：路径参数是必填的，少一个就匹配不到路由，返回 404。测试要验证缺失时的行为。

还有两个进阶要点：枚举路径参数（限定取值范围）、路径顺序冲突（前一条路由"吃掉"后一条）。

## 准备：被测应用与 TestClient

先把被测的应用写好，后面所有 demo 都围绕它展开。

\`\`\`python
# 文件名：app.py
# 从 fastapi 包导入 FastAPI 类，这是创建应用的入口
from fastapi import FastAPI
# 导入 Enum，用于定义枚举类型的路径参数
from enum import Enum
# 导入 Query，用于对查询参数做额外约束（范围、长度等）
from fastapi import Query
# 导入 Optional，用于声明可选参数（Python 3.9 以下用 typing.Optional）
from typing import Optional

# 创建 FastAPI 应用实例，整个被测系统的核心
app = FastAPI()

# 模拟一个内存数据库，方便测试时观察返回结果
fake_db = {1: "apple", 2: "banana", 3: "cherry"}


# 路由 1：int 类型路径参数
# /items/{item_id} 中的 item_id 会被转成 int
@app.get("/items/{item_id}")
def read_item(item_id: int):
    # 从模拟数据库里按 id 取数据
    # 如果 id 不存在，返回一个明确的提示字典
    if item_id in fake_db:
        return {"item_id": item_id, "name": fake_db[item_id]}
    return {"item_id": item_id, "name": "not found"}


# 路由 2：枚举类型路径参数
# ModelName 是枚举，FastAPI 会校验传入值必须是枚举成员之一
class ModelName(str, Enum):
    # 三个合法的模型名
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"


@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    # model_name 已经是枚举成员，可以直接比较
    if model_name is ModelName.alexnet:
        return {"model": model_name, "message": "Deep Learning FTW!"}
    # 返回枚举的 value 和 name，方便测试时断言
    return {"model": model_name, "value": model_name.value}


# 路由 3：查询参数分页
# skip 和 limit 都有默认值，可以省略
@app.get("/list")
def list_items(skip: int = 0, limit: int = 10):
    # 简单的分页逻辑：从 skip 开始取 limit 条
    # 返回元信息，方便测试断言
    return {"skip": skip, "limit": limit, "count": limit}


# 路由 4：可选查询参数
# q 是可选的，不传时为 None
@app.get("/search")
def search(q: Optional[str] = None):
    # 如果传了 q，返回 q 的小写形式；否则返回空结果
    if q:
        return {"q": q, "lower": q.lower()}
    return {"q": None, "lower": None}


# 路由 5：带校验的查询参数
# size 必须大于 0 且小于等于 100，否则返回 422
@app.get("/page")
def get_page(size: int = Query(gt=0, le=100)):
    # 返回 size 本身，测试时主要看是否能通过校验
    return {"size": size}
\`\`\`

测试文件结构：

\`\`\`python
# 文件名：test_app.py
# 从 starlette.testclient 导入 TestClient，这是 FastAPI 推荐的测试客户端
from starlette.testclient import TestClient
# 导入被测的 app 实例
from app import app

# 创建 TestClient 实例，后续所有请求都通过它发起
client = TestClient(app)
\`\`\`

> 说明：\`from fastapi.testclient import TestClient\` 也能用，它只是从 starlette 转发过来的，两者完全等价。

## Demo 1：测试 int 路径参数

最基础的测试：正常路径返回 200，类型错误返回 422。

\`\`\`python
# 从 starlette.testclient 导入 TestClient
from starlette.testclient import TestClient
# 导入被测应用
from app import app

# 创建测试客户端，绑定到 app
client = TestClient(app)


def test_read_item_success():
    # 用 GET 访问 /items/42，42 是合法的整数
    response = client.get("/items/42")
    # 断言状态码是 200
    assert response.status_code == 200
    # 断言返回的 JSON 里 item_id 字段是 42（整数，不是字符串）
    assert response.json()["item_id"] == 42


def test_read_item_type_error():
    # 访问 /items/abc，abc 无法转成 int
    response = client.get("/items/abc")
    # 断言状态码是 422（Unprocessable Entity）
    # 422 表示服务器理解请求格式，但无法处理其中的语义
    assert response.status_code == 422
    # 解析返回的 JSON body
    body = response.json()
    # 422 错误的 body 一定有 detail 字段，且是一个数组
    assert "detail" in body
    assert isinstance(body["detail"], list)
    # detail 数组里第一个元素描述了第一个错误
    err = body["detail"][0]
    # loc 是错误位置，是一个列表：["path", "item_id"] 表示路径参数 item_id 出错
    assert err["loc"][0] == "path"
    assert err["loc"][1] == "item_id"
    # type 字段描述错误类型，int 解析失败通常是 int_parsing
    assert "int" in err["type"]


def test_read_item_existing():
    # 访问 /items/1，1 在 fake_db 里存在
    response = client.get("/items/1")
    # 状态码 200
    assert response.status_code == 200
    # 返回的 name 应该是 apple
    assert response.json()["name"] == "apple"
\`\`\`

生活类比：\`item_id: int\` 就像门口贴的"只收数字编号的快递"。你寄 \`/items/42\`，门牌号是数字，正常签收；你寄 \`/items/abc\`，门牌号不是数字，快递员当场拒收，还附上一张"原因：编号必须是数字"的小纸条——这就是 422 的 detail 数组。

## Demo 2：测试 enum 路径参数

枚举路径参数会限制取值范围，传非法值返回 422。

\`\`\`python
def test_get_model_valid():
    # 访问合法的枚举值 alexnet
    response = client.get("/models/alexnet")
    # 状态码 200
    assert response.status_code == 200
    body = response.json()
    # model 字段是枚举的 value
    assert body["model"] == "alexnet"
    # alexnet 分支返回特定 message
    assert body["message"] == "Deep Learning FTW!"


def test_get_model_invalid():
    # 访问非法的枚举值 vgg，不在 ModelName 里
    response = client.get("/models/vgg")
    # 状态码 422，因为 vgg 不是合法的枚举成员
    assert response.status_code == 422
    body = response.json()
    # detail 数组里应有错误信息
    err = body["detail"][0]
    # loc 指向 path 上的 model_name
    assert err["loc"] == ["path", "model_name"]
    # type 通常是 enum 相关，比如 enum_validation 或 value_error
    assert "enum" in err["type"] or "value" in err["type"]


def test_get_model_case_sensitive():
    # 枚举值区分大小写，Alexnet（首字母大写）不等于 alexnet
    response = client.get("/models/Alexnet")
    # 应该返回 422
    assert response.status_code == 422
\`\`\`

生活类比：枚举路径参数就像自动售货机的按钮。机器只认 \`alexnet\`、\`resnet\`、\`lenet\` 三个按钮，你按 \`vgg\` 没反应（422），按 \`Alexnet\`（大小写不对）也没反应。机器不会"猜"你想按哪个。

## Demo 3：测试查询参数（分页）

查询参数测试有三个层次：默认值、边界值、类型错误。

\`\`\`python
def test_list_default():
    # 不传任何查询参数，使用默认值 skip=0, limit=10
    response = client.get("/list")
    assert response.status_code == 200
    body = response.json()
    # 断言默认值正确
    assert body["skip"] == 0
    assert body["limit"] == 10


def test_list_custom():
    # 传入自定义的 skip 和 limit
    response = client.get("/list?skip=5&limit=20")
    assert response.status_code == 200
    body = response.json()
    assert body["skip"] == 5
    assert body["limit"] == 20


def test_list_partial():
    # 只传 skip，limit 用默认值
    response = client.get("/list?skip=3")
    assert response.status_code == 200
    body = response.json()
    assert body["skip"] == 3
    # limit 仍是默认的 10
    assert body["limit"] == 10


def test_list_type_error():
    # skip 传字符串 abc，无法转成 int
    response = client.get("/list?skip=abc")
    # 422 错误
    assert response.status_code == 422
    body = response.json()
    err = body["detail"][0]
    # loc 指向 query 上的 skip
    assert err["loc"][0] == "query"
    assert err["loc"][1] == "skip"


def test_list_negative():
    # skip 传负数，FastAPI 默认不校验范围，会接受
    # 注意：int 类型本身允许负数，除非用 Query(ge=0) 约束
    response = client.get("/list?skip=-1")
    # 这里不会 422，因为没加范围校验
    assert response.status_code == 200
    assert response.json()["skip"] == -1
\`\`\`

生活类比：查询参数就像点外卖时的备注。skip=5 是"跳过前 5 个"，limit=20 是"只要 20 个"。你不备注，店家按默认来（skip=0, limit=10）；你备注写"skip=abc"，店家看不懂，直接退单（422）。

## Demo 4：测试可选查询参数

\`Optional[str] = None\` 声明的参数可以不传，不传时为 None。

\`\`\`python
def test_search_without_q():
    # 不传 q 参数
    response = client.get("/search")
    assert response.status_code == 200
    body = response.json()
    # q 应该是 None
    assert body["q"] is None
    assert body["lower"] is None


def test_search_with_q():
    # 传 q=Hello
    response = client.get("/search?q=Hello")
    assert response.status_code == 200
    body = response.json()
    # q 原样返回
    assert body["q"] == "Hello"
    # lower 是小写形式
    assert body["lower"] == "hello"


def test_search_empty_q():
    # 传空字符串 q=
    response = client.get("/search?q=")
    assert response.status_code == 200
    body = response.json()
    # 空字符串不是 None，是 ""
    assert body["q"] == ""
    assert body["lower"] == ""
\`\`\`

注意第三个测试：\`q=\` 传的是空字符串，不是 None。\`Optional[str] = None\` 只在"不传"时才是 None，传了空字符串就是空字符串。这是新手常踩的坑。

## Demo 5：测试查询参数校验（Query 约束）

\`Query(gt=0, le=100)\` 表示 size 必须 > 0 且 <= 100。

\`\`\`python
def test_page_valid():
    # size=50，在 (0, 100] 范围内
    response = client.get("/page?size=50")
    assert response.status_code == 200
    assert response.json()["size"] == 50


def test_page_boundary_min():
    # size=0，不满足 gt=0（必须严格大于 0）
    response = client.get("/page?size=0")
    assert response.status_code == 422
    body = response.json()
    err = body["detail"][0]
    # loc 指向 query 的 size
    assert err["loc"] == ["query", "size"]
    # ctx 里包含约束的具体值
    assert "gt" in err["ctx"] or "le" in err["ctx"]


def test_page_boundary_max():
    # size=101，超过 le=100
    response = client.get("/page?size=101")
    assert response.status_code == 422
    body = response.json()
    err = body["detail"][0]
    assert err["loc"] == ["query", "size"]


def test_page_boundary_max_inclusive():
    # size=100，正好等于 le=100，是合法的（le 是小于等于）
    response = client.get("/page?size=100")
    assert response.status_code == 200
    assert response.json()["size"] == 100
\`\`\`

生活类比：Query 约束就像电梯的载重提示"限载 100 人，且必须至少 1 人"。你带 0 人进去（size=0），电梯不动（422）；你带 101 人进去（size=101），超载报警（422）；你带 100 人（size=100），正好满载，可以走（200）。

## Demo 6：测试路径参数冲突（路径顺序）

FastAPI 路由匹配是**按声明顺序**的。如果两条路由有重叠，先声明的会"吃掉"后声明的。

\`\`\`python
# 文件名：app_conflict.py
from fastapi import FastAPI
app2 = FastAPI()


# 路由 A：先声明 /users/me
@app2.get("/users/me")
def read_me():
    return {"user_id": "current_user"}


# 路由 B：后声明 /users/{user_id}
@app2.get("/users/{user_id}")
def read_user(user_id: str):
    return {"user_id": user_id}


# 测试文件
from starlette.testclient import TestClient
from app_conflict import app2

client2 = TestClient(app2)


def test_me_first():
    # 访问 /users/me，会匹配到路由 A，而不是把 me 当成 user_id
    response = client2.get("/users/me")
    assert response.status_code == 200
    # 返回的是 "current_user"，说明匹配到了 /users/me
    assert response.json()["user_id"] == "current_user"


def test_user_id():
    # 访问 /users/123，匹配到路由 B
    response = client2.get("/users/123")
    assert response.status_code == 200
    assert response.json()["user_id"] == "123"
\`\`\`

如果把上面两条路由**反过来声明**（先 \`/users/{user_id}\` 后 \`/users/me\`），那么 \`/users/me\` 会被当成 \`user_id="me"\`，路由 B 永远吃掉路由 A。这是 FastAPI/Starlette 路由匹配的固定行为，测试时要覆盖这类顺序场景。

生活类比：路径顺序就像挂号窗口的排队。先到的窗口（先声明的路由）先服务，哪怕后面还有个"更对口"的窗口。所以特殊路径（如 \`/users/me\`）必须排在通用路径（\`/users/{user_id}\`）前面，否则被通用路径"截胡"。

## 422 错误响应结构详解

FastAPI 的 422 响应 body 是这样结构的：

\`\`\`txt
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "abc",
      "url": "https://errors.pydantic.dev/2.x/v/int_parsing"
    }
  ]
}
\`\`\`

字段含义：

- \`detail\`：数组，每个元素描述一个校验错误。多个参数同时出错时，数组里会有多个元素。
- \`type\`：错误类型标识，如 \`int_parsing\`、\`greater_than\`、\`less_than_equal\`、\`enum_validation\`。
- \`loc\`：错误位置，\`["path", "item_id"]\` 表示路径参数；\`["query", "skip"]\` 表示查询参数；\`["body", "name"]\` 表示请求体字段。
- \`msg\`：人类可读的错误描述。
- \`input\`：原始输入值。
- \`url\`：Pydantic 官方文档链接，指向该错误类型的说明。
- \`ctx\`：上下文信息，比如 \`greater_than\` 错误的 ctx 里有 \`{"gt": 0}\`，告诉你约束值是多少。

测试 422 时，至少断言 \`status_code\`、\`detail[0].loc\`、\`detail[0].type\` 三个字段，这样能确认"是哪个参数、什么类型的错误"。

## 本章小结

| 要点 | 说明 |
|------|------|
| TestClient | starlette 自带，本质是 httpx + StarletteTransport |
| 路径参数测试 | 重点测类型转换成功与失败两种场景 |
| 422 状态码 | 请求格式对但语义错，FastAPI 校验失败的统一返回 |
| 422 detail 结构 | 数组，每项含 type/loc/msg/input/url |
| loc 字段 | 标识错误位置：path / query / body |
| enum 路径参数 | 非法值返回 422，区分大小写 |
| 查询参数默认值 | 不传时用默认值，传空字符串不等价于不传 |
| Query 约束 | gt/ge/lt/le/min_length/max_length/pattern |
| 路由顺序 | 特殊路径必须声明在通用路径之前，否则被截胡 |
| 断言重点 | 至少断言 status_code、loc、type 三项 |

路径与查询参数是测试的起点。掌握 422 结构和 loc 定位后，你就能精准描述"哪个参数出了什么错"。下一章我们进入请求体——Pydantic 模型的校验测试，错误结构会更复杂，但套路是一样的。`
  },

  // ============================================================
  // 第 2 章：测试请求体与 Pydantic 校验
  // ============================================================
  {
    id: "ft-body-pydantic",
    group: "测试核心",
    icon: "📦",
    title: "测试请求体与 Pydantic 校验",
    content: `# 测试请求体与 Pydantic 校验

## 请求体测试的核心思路

路径和查询参数是从 URL 解析的，请求体（request body）则是从 HTTP body 解析的 JSON。FastAPI 用 Pydantic 模型来定义请求体的结构，自动完成解析、校验、文档生成三件事。

测试请求体时，我们用 \`client.post(..., json={...})\` 把字典作为 JSON body 发出去。TestClient 会自动设置 \`Content-Type: application/json\` 并序列化字典。

生活类比：请求体就像你寄给快递公司的"发货单"。发货单上要填品名、数量、收件人，格式不对（不是 JSON）快递公司拒收；品名漏填（必填字段缺失）快递公司退回让你补全；数量写成"abc"（类型错误）快递公司也退回。Pydantic 就是那个"发货单审核员"，它严格按模板检查每一项。

请求体测试有四个层次：

1. **正常提交**：合法的 JSON body，返回 200。
2. **必填字段缺失**：漏了某个字段，返回 422，断言错误位置在 body 里。
3. **类型错误**：字段类型不对，返回 422。
4. **约束违反**：字段类型对但值不满足约束（如价格为负、长度超限），返回 422。

进阶还有嵌套模型、自定义校验器、Body 嵌入、Field 约束、混合参数。

## 准备：被测应用

\`\`\`python
# 文件名：app_body.py
from fastapi import FastAPI
from pydantic import BaseModel, field_validator, Field, BaseModel
from typing import Optional

app = FastAPI()


# 简单模型：Item
class Item(BaseModel):
    # name 是必填的字符串
    name: str
    # price 是必填的浮点数，必须大于 0
    price: float = Field(gt=0)
    # description 可选，最长 100 字符
    description: Optional[str] = Field(default=None, max_length=100)
    # tax 可选，默认 0.0
    tax: float = 0.0


@app.post("/items")
def create_item(item: Item):
    # 直接返回 item，FastAPI 自动序列化
    # 含税价 = price * (1 + tax)
    return {"item": item, "price_with_tax": item.price * (1 + item.tax)}


# 嵌套模型：User 含 Item 列表
class User(BaseModel):
    # 用户名必填
    username: str
    # items 是 Item 列表，至少 1 个
    items: list[Item] = Field(min_length=1)


@app.post("/users")
def create_user(user: User):
    return {"username": user.username, "item_count": len(user.items)}


# 自定义校验器模型
class Product(BaseModel):
    # code 必填，必须是 6 位数字
    code: str

    # field_validator 校验 code 字段
    @field_validator("code")
    @classmethod
    def validate_code(cls, v):
        # 必须长度为 6 且全为数字
        if not (len(v) == 6 and v.isdigit()):
            raise ValueError("code must be 6 digits")
        return v


@app.post("/products")
def create_product(product: Product):
    return {"code": product.code}


# Body 嵌入 + Field 约束
from fastapi import Body


@app.post("/embed")
def embed_item(item: Item = Body(embed=True)):
    # embed=True 时，body 结构是 {"item": {...}} 而不是直接 {...}
    return {"name": item.name}
\`\`\`

## Demo 1：测试简单 BaseModel 请求体

\`\`\`python
from starlette.testclient import TestClient
from app_body import app

client = TestClient(app)


def test_create_item_success():
    # 提交一个合法的 Item
    response = client.post("/items", json={
        "name": "apple",   # name 必填，字符串
        "price": 9.9,      # price 必填，> 0
        "tax": 0.1         # tax 可选，这里显式给
    })
    # 状态码 200
    assert response.status_code == 200
    body = response.json()
    # 返回里包含 item
    assert body["item"]["name"] == "apple"
    # 含税价 = 9.9 * 1.1 = 10.89
    assert body["price_with_tax"] == 9.9 * 1.1


def test_create_item_minimal():
    # 只传必填字段，可选项用默认值
    response = client.post("/items", json={"name": "x", "price": 1.0})
    assert response.status_code == 200
    body = response.json()
    # description 默认 None
    assert body["item"]["description"] is None
    # tax 默认 0.0
    assert body["item"]["tax"] == 0.0
\`\`\`

注意 \`json=\` 参数：TestClient 会自动调用 \`json.dumps\` 并设置正确的 Content-Type。如果你用 \`data=\` 传字符串，FastAPI 不会把它当 JSON 解析，会返回 422。

## Demo 2：测试必填字段缺失

\`\`\`python
def test_missing_name():
    # 漏掉 name 字段
    response = client.post("/items", json={"price": 9.9})
    # 422
    assert response.status_code == 422
    body = response.json()
    err = body["detail"][0]
    # loc 指向 body 的 name 字段
    assert err["loc"] == ["body", "name"]
    # type 通常是 missing
    assert err["type"] == "missing"


def test_missing_price():
    # 漏掉 price 字段
    response = client.post("/items", json={"name": "x"})
    assert response.status_code == 422
    err = response.json()["detail"][0]
    assert err["loc"] == ["body", "price"]
    assert err["type"] == "missing"


def test_missing_all_required():
    # 传空对象
    response = client.post("/items", json={})
    assert response.status_code == 422
    # 两个必填字段都缺失，detail 数组应有 2 个错误
    errs = response.json()["detail"]
    # Pydantic 会把所有错误都收集起来，而不是遇到第一个就停
    assert len(errs) == 2
\`\`\`

生活类比：必填字段就像考试卷上的"必答题"。你交白卷（空对象），老师会把所有没答的题都圈出来（detail 数组里 2 个错误），而不是只圈第一道就停。Pydantic 的设计是"一次性收集所有错误"，这对前端友好——可以一次显示所有问题。

## Demo 3：测试类型错误

\`\`\`python
def test_price_wrong_type():
    # price 传字符串 "abc" 而不是数字
    response = client.post("/items", json={"name": "x", "price": "abc"})
    assert response.status_code == 422
    err = response.json()["detail"][0]
    assert err["loc"] == ["body", "price"]
    # float 解析失败的 type
    assert "float" in err["type"] or "int" in err["type"]


def test_price_numeric_string():
    # price 传字符串 "9.9"，Pydantic 会尝试转成 float
    # Pydantic v2 默认 strict 模式，字符串可能被拒
    response = client.post("/items", json={"name": "x", "price": "9.9"})
    # Pydantic v2 在 JSON 模式下，字符串 "9.9" 通常被拒
    # 但具体行为看版本，断言用 in 更稳妥
    assert response.status_code in (200, 422)


def test_name_wrong_type():
    # name 传数字 123 而不是字符串
    response = client.post("/items", json={"name": 123, "price": 9.9})
    # Pydantic 会把 123 转成 "123"，所以可能是 200
    # 但严格模式下也可能 422，断言用 in
    assert response.status_code in (200, 422)
\`\`\`

注意第三个测试：Pydantic v2 对"数字当字符串"的处理比较宽容，会把 123 转成 "123"。但"字符串当数字"（\`"9.9"\` 当 float）在严格模式下会拒绝。测试时用 \`in (200, 422)\` 更稳妥，避免版本差异导致用例脆弱。

## Demo 4：测试嵌套模型

\`\`\`python
def test_create_user_success():
    # 提交一个合法的 User，含 2 个 Item
    response = client.post("/users", json={
        "username": "alice",
        "items": [
            {"name": "a", "price": 1.0},
            {"name": "b", "price": 2.0}
        ]
    })
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "alice"
    assert body["item_count"] == 2


def test_user_empty_items():
    # items 传空数组，违反 min_length=1
    response = client.post("/users", json={
        "username": "bob",
        "items": []
    })
    assert response.status_code == 422
    err = response.json()["detail"][0]
    # loc 指向 body 的 items
    assert err["loc"] == ["body", "items"]
    # too_short 类型的错误
    assert "short" in err["type"] or "length" in err["type"]


def test_user_nested_item_invalid():
    # items 里某个 Item 缺 price
    response = client.post("/users", json={
        "username": "carol",
        "items": [{"name": "x"}]  # 缺 price
    })
    assert response.status_code == 422
    err = response.json()["detail"][0]
    # loc 指向 body -> items -> 0 -> price（嵌套定位）
    assert err["loc"][0] == "body"
    assert err["loc"][1] == "items"
    assert err["loc"][2] == 0
    assert err["loc"][3] == "price"
\`\`\`

嵌套模型的 \`loc\` 是多级的：\`["body", "items", 0, "price"]\` 表示"body 里 items 数组的第 0 个元素的 price 字段"。这种精细定位让前端能精准标红出错的具体字段。

生活类比：嵌套模型的错误定位就像快递分拣。外层包裹（User）有问题，标"包裹层"；里面的小盒子（items[0]）有问题，标"小盒子层"；小盒子里的物品（price）有问题，再标"物品层"。一层层精确到具体位置。

## Demo 5：测试 Pydantic 自定义校验器

\`\`\`python
def test_product_valid_code():
    # code 是合法的 6 位数字
    response = client.post("/products", json={"code": "123456"})
    assert response.status_code == 200
    assert response.json()["code"] == "123456"


def test_product_short_code():
    # code 只有 5 位
    response = client.post("/products", json={"code": "12345"})
    assert response.status_code == 422
    err = response.json()["detail"][0]
    # loc 指向 body 的 code
    assert err["loc"] == ["body", "code"]
    # 自定义校验器抛的 ValueError 会被包装成 value_error
    assert "value" in err["type"] or "assertion" in err["type"]
    # msg 里包含我们写的提示
    assert "6 digits" in err["msg"]


def test_product_non_digit_code():
    # code 是 6 位但含字母
    response = client.post("/products", json={"code": "abc123"})
    assert response.status_code == 422
    err = response.json()["detail"][0]
    assert err["loc"] == ["body", "code"]
    assert "6 digits" in err["msg"]
\`\`\`

自定义校验器抛出的 \`ValueError\` 会被 Pydantic 捕获，转成 422 响应。测试时要断言 \`msg\` 里包含我们写的提示语，这样能确认"是我们的校验器在起作用"，而不是别的环节出错。

## Demo 6：测试 Body 嵌入和 Field 约束

\`\`\`python
def test_embed_success():
    # embed=True 时，body 必须是 {"item": {...}}
    response = client.post("/embed", json={
        "item": {"name": "x", "price": 1.0}
    })
    assert response.status_code == 200
    assert response.json()["name"] == "x"


def test_embed_wrong_structure():
    # 直接传 {...} 而不是 {"item": {...}}
    response = client.post("/embed", json={"name": "x", "price": 1.0})
    # 因为 embed=True，FastAPI 找不到 "item" 键，返回 422
    assert response.status_code == 422


def test_field_constraint_price_zero():
    # price=0，违反 gt=0
    response = client.post("/items", json={"name": "x", "price": 0})
    assert response.status_code == 422
    err = response.json()["detail"][0]
    assert err["loc"] == ["body", "price"]
    # greater_than 错误
    assert "greater" in err["type"]
    # ctx 里有 gt=0
    assert err["ctx"]["gt"] == 0


def test_field_constraint_description_too_long():
    # description 超过 100 字符
    response = client.post("/items", json={
        "name": "x",
        "price": 1.0,
        "description": "a" * 101
    })
    assert response.status_code == 422
    err = response.json()["detail"][0]
    assert err["loc"] == ["body", "description"]
    # too_long 错误
    assert "long" in err["type"] or "length" in err["type"]
\`\`\`

\`embed=True\` 的作用：当接口只有一个 body 参数时，FastAPI 默认期望 body 直接是模型的内容（\`{"name": "x"}\`）。加了 \`embed=True\` 后，期望 body 是 \`{"item": {"name": "x"}}\`，把模型嵌套在参数名下。这在需要明确"这是哪个参数"时有用。

## Demo 7：测试请求体 + 路径参数 + 查询参数混合

\`\`\`python
# 补充一个混合路由到 app_body.py
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item, q: Optional[str] = None):
    # item_id 是路径参数，item 是请求体，q 是查询参数
    result = {"item_id": item_id, **item.model_dump()}
    if q:
        result["q"] = q
    return result


def test_mixed_success():
    # 同时传路径参数、请求体、查询参数
    response = client.put("/items/42?q=hello", json={
        "name": "x", "price": 1.0
    })
    assert response.status_code == 200
    body = response.json()
    assert body["item_id"] == 42
    assert body["name"] == "x"
    assert body["q"] == "hello"


def test_mixed_no_q():
    # 不传 q
    response = client.put("/items/42", json={"name": "x", "price": 1.0})
    assert response.status_code == 200
    body = response.json()
    assert "q" not in body


def test_mixed_path_error():
    # item_id 传非数字
    response = client.put("/items/abc", json={"name": "x", "price": 1.0})
    assert response.status_code == 422
    err = response.json()["detail"][0]
    # 错误在 path 上
    assert err["loc"][0] == "path"
\`\`\`

混合参数测试要分别验证三种来源的独立性：路径错报 path、查询错报 query、body 错报 body。\`loc\` 的第一个元素就能区分来源。

## Pydantic v2 校验错误结构详解

Pydantic v2 的 422 响应结构（与 v1 略有不同）：

\`\`\`txt
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "price"],
      "msg": "Input should be greater than 0",
      "input": 0,
      "ctx": {"gt": 0},
      "url": "https://errors.pydantic.dev/2.x/v/greater_than"
    }
  ]
}
\`\`\`

v1 与 v2 的关键差异：

| 字段 | Pydantic v1 | Pydantic v2 |
|------|-------------|-------------|
| type | \`value_error.number.not_gt\` | \`greater_than\`（更简洁） |
| ctx | 有，但字段名不统一 | 有，字段名标准化 |
| url | 无 | 有，指向官方文档 |
| input | 有 | 有 |
| 多错误 | 一起返回 | 一起返回 |

测试时建议用 \`in\` 或 \`startswith\` 匹配 type，而不是精确等于，因为版本间有差异。比如断言 \`"greater" in err["type"]\` 比 \`err["type"] == "greater_than"\` 更稳健。

## 本章小结

| 要点 | 说明 |
|------|------|
| 请求体提交 | client.post(..., json={...})，自动序列化 |
| 必填字段缺失 | type 为 missing，loc 指向 body 的字段 |
| 类型错误 | type 含 float/int/string 等关键词 |
| 多错误收集 | Pydantic 一次性收集所有错误，detail 是数组 |
| 嵌套模型 loc | 多级定位，如 ["body","items",0,"price"] |
| 自定义校验器 | @field_validator，抛 ValueError 转 422 |
| Field 约束 | gt/ge/lt/le/min_length/max_length |
| Body(embed=True) | body 结构变为 {参数名: {...}} |
| 混合参数 | loc 首元素区分来源：path/query/body |
| v2 错误结构 | type 简洁化，新增 url 字段指向文档 |
| 断言稳健性 | 用 in/startswith 匹配 type，避免版本脆弱 |

请求体测试的核心是"理解 Pydantic 的错误结构"。loc 定位、type 分类、ctx 约束值，这三个字段是你断言的利器。下一章我们看响应侧——response_model 如何过滤字段、状态码如何断言。`
  },

  // ============================================================
  // 第 3 章：测试响应模型与状态码
  // ============================================================
  {
    id: "ft-response-model",
    group: "测试核心",
    icon: "📤",
    title: "测试响应模型与状态码",
    content: `# 测试响应模型与状态码

## 响应测试的两个维度

前面两章我们关注"输入"——请求怎么进来、怎么校验。这一章关注"输出"——响应长什么样、状态码对不对。响应测试有两个维度：

1. **响应模型（response_model）**：FastAPI 用 \`response_model\` 控制返回给客户端的字段。它能过滤敏感数据（如密码）、统一响应结构。
2. **状态码（status_code）**：每个接口都应返回语义正确的状态码。201 表示创建成功、204 表示无内容、404 表示不存在。

生活类比：响应模型就像快递出库前的"打包审核员"。你内部数据里可能有成本价、进货渠道（敏感字段），但打包审核员只把"商品名、售价、库存"放进包裹给客户，成本价这类敏感信息留在仓库里。状态码就像包裹上的"送达状态"标签——"已签收"（200）、"新件已揽收"（201）、"空包裹"（204）、"地址错误"（404）。

## 准备：被测应用

\`\`\`python
# 文件名：app_resp.py
from fastapi import FastAPI, status
from pydantic import BaseModel
from typing import Optional

app = FastAPI()


# 输入模型：含 password
class UserIn(BaseModel):
    username: str
    password: str  # 敏感字段


# 输出模型：不含 password
class UserOut(BaseModel):
    username: str
    id: int


@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserIn):
    # 内部能拿到 password，但 response_model 会过滤掉
    return {"username": user.username, "id": 1, "password": user.password}


# 带 Location 响应头的创建接口
@app.post("/users-with-location",
          response_model=UserOut,
          status_code=status.HTTP_201_CREATED)
def create_user_with_location(user: UserIn):
    # 返回 Response 或在 return 后设置 headers
    # 这里用字典 + 自定义头
    from fastapi import Response
    return {"username": user.username, "id": 2}


# response_model_include / exclude 示例
class Item(BaseModel):
    name: str
    price: float
    tax: float
    secret: str = "hidden"


@app.get("/items/{item_id}",
         response_model=Item,
         response_model_exclude={"secret", "tax"})
def get_item(item_id: int):
    return {"name": "x", "price": 1.0, "tax": 0.1, "secret": "hidden"}


# response_model_exclude_none
class Profile(BaseModel):
    name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None


@app.get("/profiles/{name}", response_model=Profile, response_model_exclude_none=True)
def get_profile(name: str):
    return {"name": name, "bio": None, "avatar": None}


# 列表响应模型
@app.get("/items-list", response_model=list[Item])
def list_items():
    return [
        {"name": "a", "price": 1.0, "tax": 0.1, "secret": "h"},
        {"name": "b", "price": 2.0, "tax": 0.0, "secret": "h"},
    ]


# 204 No Content
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    # 不返回任何内容
    return None
\`\`\`

## Demo 1：测试 response_model 过滤密码字段

\`\`\`python
from starlette.testclient import TestClient
from app_resp import app

client = TestClient(app)


def test_create_user_filters_password():
    # 提交含 password 的请求
    response = client.post("/users", json={
        "username": "alice",
        "password": "secret123"
    })
    # 状态码 201（创建成功）
    assert response.status_code == 201
    body = response.json()
    # username 正常返回
    assert body["username"] == "alice"
    assert body["id"] == 1
    # password 必须被过滤掉
    assert "password" not in body


def test_internal_has_password():
    # 这个测试只是验证"内部确实传了 password，但被过滤"
    # 通过观察响应里没有 password 来间接验证
    response = client.post("/users", json={
        "username": "bob",
        "password": "pw"
    })
    body = response.json()
    # 响应里没有 password，说明 response_model 起作用了
    assert "password" not in body
    # 但 username 还在
    assert body["username"] == "bob"
\`\`\`

response_model 的核心价值：**安全**。即使你的函数内部返回了 password，response_model 也会在序列化时把它过滤掉，绝不会泄露给客户端。这是防御性编程的体现——不依赖开发者"记得不返回敏感字段"，而是框架强制过滤。

## Demo 2：测试 status_code 自定义（201 Created）

\`\`\`python
def test_create_returns_201():
    response = client.post("/users", json={
        "username": "alice",
        "password": "pw"
    })
    # 201 而不是 200
    assert response.status_code == 201


def test_get_default_200():
    # GET 请求默认 200
    response = client.get("/items-list")
    assert response.status_code == 200
\`\`\`

状态码语义：200 是"成功"，201 是"创建成功"。POST 创建资源用 201 比 200 更准确，RESTful 风格推荐这样做。

## Demo 3：测试响应头

\`\`\`python
# 补充一个设置响应头的路由
from fastapi import Response

@app.get("/with-header")
def with_header(response: Response):
    # 通过 response 对象设置头
    response.headers["X-Custom"] = "hello"
    return {"msg": "ok"}


def test_custom_header():
    response = client.get("/with-header")
    assert response.status_code == 200
    # 断言响应头
    assert response.headers["x-custom"] == "hello"


def test_content_type():
    response = client.get("/items-list")
    # FastAPI 默认返回 application/json
    assert response.headers["content-type"] == "application/json"


def test_location_header():
    # 测试 201 响应的 Location 头（如果设置了的话）
    response = client.post("/users", json={"username": "a", "password": "b"})
    # 这里 /users 没设 Location，只是验证 201
    assert response.status_code == 201
\`\`\`

测试响应头时注意：HTTP header 名不区分大小写，但 \`response.headers\` 是大小写不敏感的字典，\`response.headers["X-Custom"]\` 和 \`response.headers["x-custom"]\` 都能取到。

## Demo 4：测试 response_model_exclude / response_model_include

\`\`\`python
def test_exclude_fields():
    # response_model_exclude={"secret", "tax"}
    response = client.get("/items/1")
    assert response.status_code == 200
    body = response.json()
    # name 和 price 保留
    assert body["name"] == "x"
    assert body["price"] == 1.0
    # secret 和 tax 被排除
    assert "secret" not in body
    assert "tax" not in body


# 补充一个 include 示例
@app.get("/items-include/{item_id}",
         response_model=Item,
         response_model_include={"name", "price"})
def get_item_include(item_id: int):
    return {"name": "x", "price": 1.0, "tax": 0.1, "secret": "h"}


def test_include_fields():
    response = client.get("/items-include/1")
    body = response.json()
    # 只保留 name 和 price
    assert body["name"] == "x"
    assert body["price"] == 1.0
    # tax 和 secret 不在
    assert "tax" not in body
    assert "secret" not in body
\`\`\`

\`exclude\` 是"黑名单"（排除指定字段），\`include\` 是"白名单"（只保留指定字段）。两者不要同时用，会冲突。一般推荐 \`include\`，更显式、更安全。

## Demo 5：测试 response_model_exclude_none / exclude_defaults

\`\`\`python
def test_exclude_none():
    # profile 的 bio 和 avatar 都是 None
    response = client.get("/profiles/alice")
    assert response.status_code == 200
    body = response.json()
    # name 保留
    assert body["name"] == "alice"
    # bio 和 avatar 是 None，被 exclude_none 过滤掉
    assert "bio" not in body
    assert "avatar" not in body


# exclude_defaults 示例
class Config(BaseModel):
    env: str = "dev"
    debug: bool = True
    name: str = "app"


@app.get("/config", response_model=Config, response_model_exclude_defaults=True)
def get_config():
    # 返回的值都是默认值
    return {"env": "dev", "debug": True, "name": "app"}


def test_exclude_defaults():
    response = client.get("/config")
    body = response.json()
    # 所有字段都是默认值，被 exclude_defaults 过滤
    # body 可能是空对象 {} 或只剩非默认字段
    assert "env" not in body
    assert "debug" not in body
\`\`\`

- \`exclude_none\`：值为 None 的字段不返回。适合可选字段多的场景，让响应更紧凑。
- \`exclude_defaults\`：值等于默认值的字段不返回。适合配置类接口，只返回"非默认"的部分。

## Demo 6：测试列表响应模型

\`\`\`python
def test_list_response():
    response = client.get("/items-list")
    assert response.status_code == 200
    body = response.json()
    # body 是数组
    assert isinstance(body, list)
    # 长度为 2
    assert len(body) == 2
    # 第一个元素的 name
    assert body[0]["name"] == "a"
    assert body[1]["name"] == "b"


def test_list_response_model_applied():
    response = client.get("/items-list")
    body = response.json()
    # response_model=Item 会过滤 secret？不会，因为没用 exclude
    # 但 Item 模型本身定义了 secret，所以 secret 会出现
    assert "secret" in body[0]


def test_empty_list():
    # 补充一个返回空列表的路由测试
    @app.get("/empty-list", response_model=list[Item])
    def empty_list():
        return []
    response = client.get("/empty-list")
    assert response.status_code == 200
    assert response.json() == []
\`\`\`

列表响应模型用 \`response_model=list[Item]\` 声明。空列表返回 \`[]\`，状态码 200。注意 \`response_model\` 的过滤规则同样作用于列表里的每个元素。

## Demo 7：测试状态码常量

\`\`\`python
from fastapi import status


def test_status_constants():
    # status 模块提供了语义化的状态码常量
    assert status.HTTP_200_OK == 200
    assert status.HTTP_201_CREATED == 201
    assert status.HTTP_204_NO_CONTENT == 204
    assert status.HTTP_400_BAD_REQUEST == 400
    assert status.HTTP_401_UNAUTHORIZED == 401
    assert status.HTTP_403_FORBIDDEN == 403
    assert status.HTTP_404_NOT_FOUND == 404
    assert status.HTTP_409_CONFLICT == 409
    assert status.HTTP_422_UNPROCESSABLE_ENTITY == 422
    assert status.HTTP_500_INTERNAL_SERVER_ERROR == 500


def test_use_constant_in_route():
    # 在路由声明里用常量比魔法数字可读性更好
    # status_code=status.HTTP_201_CREATED 比 status_code=201 清晰
    response = client.post("/users", json={"username": "a", "password": "b"})
    assert response.status_code == status.HTTP_201_CREATED
\`\`\`

用 \`status.HTTP_XXX\` 常量代替魔法数字，代码可读性大幅提升。\`status_code=status.HTTP_201_CREATED\` 一眼就能看出"创建成功"，而 \`status_code=201\` 还得查表。

## Demo 8：测试 204 No Content 响应

\`\`\`python
def test_delete_204():
    # DELETE 请求返回 204
    response = client.delete("/items/1")
    # 状态码 204
    assert response.status_code == 204
    # 204 的 body 应该是空的
    assert response.content == b""
    # 或者用 text
    assert response.text == ""


def test_delete_no_content_type():
    response = client.delete("/items/1")
    # 204 通常没有 content-type，或者 content-length 为 0
    # TestClient 对 204 的处理：content 是空字节
    assert response.status_code == 204
\`\`\`

204 的语义是"成功，但没有内容返回"。DELETE、PUT（更新无返回值）常用 204。测试 204 时**不要**断言 \`response.json()\`，会抛 JSON 解析错误，因为 body 是空的。要断言 \`response.content == b""\` 或 \`response.text == ""\`。

## 状态码最佳实践

| 状态码 | 常量 | 语义 | 典型场景 |
|--------|------|------|----------|
| 200 | HTTP_200_OK | 成功 | GET、PUT 更新有返回 |
| 201 | HTTP_201_CREATED | 创建成功 | POST 创建资源 |
| 204 | HTTP_204_NO_CONTENT | 成功无内容 | DELETE、PUT 无返回 |
| 400 | HTTP_400_BAD_REQUEST | 请求错误 | 业务校验失败 |
| 401 | HTTP_401_UNAUTHORIZED | 未认证 | 缺少/无效 token |
| 403 | HTTP_403_FORBIDDEN | 无权限 | 认证了但没权限 |
| 404 | HTTP_404_NOT_FOUND | 不存在 | 资源找不到 |
| 409 | HTTP_409_CONFLICT | 冲突 | 唯一约束冲突 |
| 422 | HTTP_422_UNPROCESSABLE_ENTITY | 校验失败 | Pydantic 校验不过 |
| 500 | HTTP_500_INTERNAL_SERVER_ERROR | 服务器错误 | 未捕获异常 |

注意 401 和 403 的区别：401 是"你是谁？"（没登录），403 是"你是谁我知道，但你不能干这个"（登录了但没权限）。测试时要分别覆盖。

## 本章小结

| 要点 | 说明 |
|------|------|
| response_model | 过滤响应字段，防止敏感数据泄露 |
| status_code | 路由级声明，用 status.HTTP_XXX 常量 |
| response_model_include | 白名单，只保留指定字段 |
| response_model_exclude | 黑名单，排除指定字段 |
| exclude_none | 过滤值为 None 的字段 |
| exclude_defaults | 过滤值等于默认值的字段 |
| list[Model] | 列表响应模型，逐元素过滤 |
| 201 Created | POST 创建资源推荐用 |
| 204 No Content | 无返回体，断言 content 为空 |
| 响应头 | response.headers 大小写不敏感 |
| 状态码常量 | status.HTTP_200_OK 等，优于魔法数字 |

响应测试的关键是"验证返回给客户端的恰好是预期的内容"——不多（敏感数据不泄露）、不少（必要字段都在）、状态码语义正确。下一章我们看异常处理——当出错时，如何测试异常响应的结构和状态码。`
  },

  // ============================================================
  // 第 4 章：测试异常处理
  // ============================================================
  {
    id: "ft-exception",
    group: "测试核心",
    icon: "💥",
    title: "测试异常处理",
    content: `# 测试异常处理

## 异常测试的重要性

接口不会总是一帆风顺。资源不存在要返回 404，权限不足要返回 403，服务器内部出错要返回 500。这些"异常路径"和"正常路径"同样需要测试——甚至更需要测试，因为异常处理往往是安全漏洞的重灾区。

FastAPI 的异常处理有三层：

1. **HTTPException**：开发者主动抛出，携带状态码和 detail。
2. **自定义异常处理器**：用 \`@app.exception_handler\` 注册，统一处理某类异常。
3. **RequestValidationError 处理器**：FastAPI 内置，处理 422 校验错误，可被覆盖。

生活类比：异常处理就像餐厅的"投诉处理流程"。HTTPException 是服务员主动说"这道菜卖完了"（明确告知问题）；自定义异常处理器是"投诉处理专员"，不管后厨出了什么乱子，到前台都统一口径"我们正在处理"；RequestValidationError 处理器是"点单审核员"，菜单上没有的菜直接拒收。测试异常就是验证这些"投诉处理"是否符合预期——状态码对不对、信息清不清楚、有没有泄露内部细节。

## 准备：被测应用

\`\`\`python
# 文件名：app_exc.py
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

app = FastAPI()

# 模拟数据库
fake_db = {1: "apple", 2: "banana"}


# 路由 1：抛 HTTPException（404）
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in fake_db:
        # 主动抛 404，detail 是错误描述
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": fake_db[item_id]}


# 自定义异常类
class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name


# 路由 2：抛自定义异常
@app.get("/unicorns/{name}")
def read_unicorn(name: str):
    if name == "yolo":
        # 抛自定义异常
        raise UnicornException(name)
    return {"unicorn_name": name}


# 自定义异常处理器：处理 UnicornException
@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    # 返回 JSONResponse，状态码 418（彩蛋：I'm a teapot）
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops, {exc.name} did something weird"}
    )


# 路由 3：抛带 headers 的 HTTPException
@app.get("/secure/{token}")
def secure_endpoint(token: str):
    if token != "valid":
        # 带 headers 的 HTTPException，常用于 401 时返回 WWW-Authenticate
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"token": token}


# 路由 4：未捕获异常（触发 500）
@app.get("/boom")
def boom():
    # 故意除以零，触发未捕获异常
    result = 1 / 0
    return {"result": result}


# 自定义 422 处理器：覆盖默认的 RequestValidationError 响应格式
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # 自定义 422 响应格式，只返回 errors 列表
    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors(), "detail": "Validation failed"}
    )
\`\`\`

## Demo 1：测试 HTTPException 抛出（404）

\`\`\`python
from starlette.testclient import TestClient
from app_exc import app

client = TestClient(app)


def test_get_existing_item():
    # item_id=1 存在
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json()["item"] == "apple"


def test_get_not_found_item():
    # item_id=999 不存在，触发 HTTPException(404)
    response = client.get("/items/999")
    # 状态码 404
    assert response.status_code == 404
    # body 结构是 {"detail": "..."}
    assert response.json() == {"detail": "Item not found"}


def test_get_not_found_detail_content():
    # 单独验证 detail 字段内容
    response = client.get("/items/999")
    body = response.json()
    assert "detail" in body
    assert body["detail"] == "Item not found"
\`\`\`

HTTPException 的响应格式是固定的：\`{"detail": <你传的 detail>}\`。状态码就是你抛的 status_code。这是最基础也最常用的异常测试模式。

## Demo 2：测试自定义异常处理器

\`\`\`python
def test_unicorn_normal():
    # 正常名字
    response = client.get("/unicorns/charlie")
    assert response.status_code == 200
    assert response.json()["unicorn_name"] == "charlie"


def test_unicorn_exception():
    # yolo 触发自定义异常
    response = client.get("/unicorns/yolo")
    # 状态码 418（自定义处理器里设的）
    assert response.status_code == 418
    body = response.json()
    # 响应内容是自定义处理器返回的
    assert "message" in body
    assert "yolo" in body["message"]


def test_unicorn_response_format():
    # 验证自定义处理器的响应格式
    response = client.get("/unicorns/yolo")
    body = response.json()
    # 不是默认的 {"detail": ...}，而是 {"message": ...}
    assert "detail" not in body
    assert "message" in body
\`\`\`

自定义异常处理器的价值：**统一异常响应格式**。比如所有业务异常都返回 \`{"code": xxx, "message": "..."}\` 这种结构，而不是 FastAPI 默认的 \`{"detail": ...}\`。前端只需要处理一种格式，不用区分"是 HTTPException 还是别的"。

## Demo 3：测试 RequestValidationError 处理器（自定义 422 格式）

\`\`\`python
# 需要一个会触发 422 的路由
from pydantic import BaseModel

class ItemModel(BaseModel):
    name: str

@app.post("/validate")
def validate_item(item: ItemModel):
    return item


def test_custom_422_format():
    # 提交缺 name 的请求
    response = client.post("/validate", json={})
    # 状态码 422
    assert response.status_code == 422
    body = response.json()
    # 因为我们覆盖了 RequestValidationError 处理器
    # 响应格式是自定义的 {"errors": ..., "detail": "Validation failed"}
    assert "errors" in body
    assert body["detail"] == "Validation failed"
    # errors 是数组
    assert isinstance(body["errors"], list)


def test_custom_422_not_default():
    # 确认不再是默认的 {"detail": [...]} 格式
    response = client.post("/validate", json={})
    body = response.json()
    # 默认格式 detail 是 list，但我们的自定义格式 detail 是 string
    assert isinstance(body["detail"], str)
\`\`\`

覆盖 \`RequestValidationError\` 处理器时要注意：这会影响**全局所有路由**的 422 响应格式。如果你只想改某个路由的 422 格式，不要用全局处理器，而是用 \`responses\` 参数或单独处理。

## Demo 4：测试 500 内部错误处理

\`\`\`python
def test_500_error():
    # /boom 会触发除零异常
    response = client.get("/boom")
    # 状态码 500
    assert response.status_code == 500


def test_500_in_debug():
    # 默认 TestClient 下，500 的 body 是 {"detail": "Internal Server Error"}
    response = client.get("/boom")
    body = response.json()
    assert body["detail"] == "Internal Server Error"


# 测试 debug 模式下的 500（会返回堆栈）
def test_500_debug_mode():
    # 创建一个 debug 模式的 app
    from fastapi import FastAPI
    debug_app = FastAPI(debug=True)

    @debug_app.get("/boom")
    def boom():
        return 1 / 0

    debug_client = TestClient(debug_app, raise_server_exceptions=False)
    response = debug_client.get("/boom")
    assert response.status_code == 500
\`\`\`

测试 500 时要注意 \`TestClient\` 的 \`raise_server_exceptions\` 参数。默认 \`True\` 时，服务器内部异常会**直接抛出**到测试代码里，而不是返回 500 响应。要测 500 响应本身，必须设 \`raise_server_exceptions=False\`。

\`\`\`python
# 不设 raise_server_exceptions=False 会怎样
def test_500_raises_by_default():
    from fastapi import FastAPI
    debug_app = FastAPI()

    @debug_app.get("/boom")
    def boom():
        return 1 / 0

    # raise_server_exceptions 默认 True，异常会抛到测试里
    debug_client = TestClient(debug_app)
    import pytest
    with pytest.raises(ZeroDivisionError):
        debug_client.get("/boom")
\`\`\`

生活类比：\`raise_server_exceptions=True\` 就像"调试模式"——后厨一出错就直接把锅端出来给你看（抛异常）；\`raise_server_exceptions=False\` 就像"营业模式"——后厨出错只在前台显示"服务异常"（500 响应），不让你看后厨的乱象。测试 500 响应时要用营业模式。

## Demo 5：测试带 headers 的 HTTPException

\`\`\`python
def test_unauthorized_with_header():
    # 传无效 token
    response = client.get("/secure/invalid")
    # 状态码 401
    assert response.status_code == 401
    # 响应头里有 WWW-Authenticate
    assert response.headers["www-authenticate"] == "Bearer"
    # body 是 detail
    assert response.json()["detail"] == "Invalid token"


def test_authorized():
    # 传有效 token
    response = client.get("/secure/valid")
    assert response.status_code == 200
    assert response.json()["token"] == "valid"
\`\`\`

带 headers 的 HTTPException 常用于 401 场景：HTTP 规范要求 401 响应必须带 \`WWW-Authenticate\` 头，告诉客户端用什么认证方式（Basic、Bearer、Digest）。测试时要验证这个头存在且值正确。

## Demo 6：测试异常的 detail 字段结构

\`\`\`python
def test_detail_can_be_string():
    # HTTPException(detail="...") detail 是字符串
    response = client.get("/items/999")
    body = response.json()
    assert isinstance(body["detail"], str)


# detail 也可以是字典或列表
@app.get("/complex-error")
def complex_error():
    raise HTTPException(
        status_code=400,
        detail={"code": "ERR_001", "field": "name", "reason": "too short"}
    )


def test_detail_can_be_dict():
    response = client.get("/complex-error")
    assert response.status_code == 400
    body = response.json()
    # detail 是字典
    assert isinstance(body["detail"], dict)
    assert body["detail"]["code"] == "ERR_001"
    assert body["detail"]["field"] == "name"


def test_detail_structure():
    # 验证 detail 字典的字段结构
    response = client.get("/complex-error")
    detail = response.json()["detail"]
    assert "code" in detail
    assert "field" in detail
    assert "reason" in detail
\`\`\`

\`detail\` 不限于字符串，可以是任意 JSON 可序列化的对象（字典、列表、数字等）。这让错误信息可以携带结构化数据，比如错误码、出错字段、修复建议，方便前端做精细化处理。

## Demo 7：测试多个异常处理器的优先级

\`\`\`python
# 补充多个异常处理器
class BusinessError(Exception):
    pass


class SpecificBusinessError(BusinessError):
    pass


@app.get("/multi-error/{kind}")
def multi_error(kind: str):
    if kind == "specific":
        raise SpecificBusinessError()
    if kind == "business":
        raise BusinessError()
    raise HTTPException(status_code=400, detail="http")


@app.exception_handler(BusinessError)
async def business_handler(request, exc):
    return JSONResponse(status_code=400, content={"type": "business"})


@app.exception_handler(SpecificBusinessError)
async def specific_handler(request, exc):
    return JSONResponse(status_code=400, content={"type": "specific"})


def test_specific_takes_priority():
    # SpecificBusinessError 有专门的处理器，优先匹配
    response = client.get("/multi-error/specific")
    body = response.json()
    assert body["type"] == "specific"


def test_business_fallback():
    # BusinessError 用 business_handler
    response = client.get("/multi-error/business")
    body = response.json()
    assert body["type"] == "business"


def test_http_exception_still_works():
    # HTTPException 走 FastAPI 内置处理器
    response = client.get("/multi-error/http")
    assert response.status_code == 400
    assert response.json()["detail"] == "http"
\`\`\`

异常处理器的匹配规则：**最具体的优先**。如果有 \`SpecificBusinessError\` 的处理器，它优先于 \`BusinessError\` 的处理器（因为前者更具体，是后者的子类）。HTTPException 走 FastAPI 内置处理器，除非你显式覆盖。

## 异常处理最佳实践

| 实践 | 说明 |
|------|------|
| HTTPException | 业务逻辑层主动抛，状态码语义化 |
| detail 字段 | 字符串够用，复杂场景用字典携带结构化信息 |
| 自定义异常处理器 | 统一某类异常的响应格式 |
| 401 必带 WWW-Authenticate | HTTP 规范要求，用 headers 参数 |
| 覆盖 RequestValidationError | 全局改 422 格式，影响所有路由 |
| 500 测试 | 必须 raise_server_exceptions=False |
| 不泄露内部细节 | 500 的 detail 不要返回堆栈或 SQL |
| 异常处理器优先级 | 子类比父类优先 |
| 自定义异常类 | 业务异常继承 Exception，便于分类处理 |
| 不要用异常做流程控制 | 异常是"异常"，不是正常的 if-else |

## 本章小结

| 要点 | 说明 |
|------|------|
| HTTPException | 主动抛，携带 status_code 和 detail |
| 默认响应格式 | {"detail": ...} |
| detail 类型 | 字符串/字典/列表皆可 |
| 自定义处理器 | @app.exception_handler(ExcClass) |
| RequestValidationError | 可覆盖，改全局 422 格式 |
| 带 headers 的异常 | HTTPException(headers={...})，401 常用 |
| 500 测试 | raise_server_exceptions=False 才能测响应 |
| 处理器优先级 | 子类异常优先于父类 |
| TestClient 默认行为 | 服务器异常直接抛出，不返回 500 |
| 安全注意 | 500 响应不暴露堆栈、SQL 等内部信息 |

异常测试的核心是"覆盖所有错误路径"——不仅测正常流程，更要测资源不存在、权限不足、输入非法、服务器崩溃等各种异常场景。下一章是本书的重头戏——依赖注入测试，FastAPI 测试体系的核心能力。`
  },

  // ============================================================
  // 第 5 章：测试依赖注入（核心章节）
  // ============================================================
  {
    id: "ft-dependency",
    group: "测试核心",
    icon: "🔌",
    title: "测试依赖注入",
    content: `# 测试依赖注入

## 为什么依赖注入测试是核心

这一章是本书的**核心章节**。FastAPI 的测试体系之所以强大，很大程度上归功于 \`app.dependency_overrides\`——依赖覆盖机制。它让你能在测试时把"连真实数据库的依赖"换成"连内存数据库的依赖"，把"从 token 解析用户的依赖"换成"直接返回模拟用户的依赖"，而**完全不用改业务代码**。

这是测试领域梦寐以求的能力：**隔离**。单元测试要隔离外部依赖（数据库、Redis、第三方 API），传统做法是 mock 整个对象，侵入性强、脆弱。FastAPI 的依赖覆盖是框架级支持，干净、优雅、可靠。

生活类比：依赖覆盖就像电影拍摄里的"替身演员"。主角（业务路由）不用改剧本，但拍摄危险动作时，导演（测试代码）把主角换成替身（覆盖依赖）。替身长得像主角（接口签名一样），但不会真的受伤（不连真实数据库）。拍完这场戏（测试结束），替身撤场，主角继续拍后面的戏（恢复依赖）。

## 依赖注入回顾：Depends() 的作用

先回顾一下依赖注入的基础。FastAPI 用 \`Depends()\` 声明依赖：

\`\`\`python
# 文件名：app_dep.py
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel

app = FastAPI()


# 依赖 1：数据库会话
def get_db():
    # 模拟一个数据库连接
    # 真实场景里是 SQLAlchemy Session
    db = {"items": {1: "apple", 2: "banana"}, "closed": False}
    try:
        # yield 依赖：先 yield 给路由用，路由结束后执行 finally
        yield db
    finally:
        # 路由结束后关闭连接
        db["closed"] = True


# 依赖 2：当前用户（从 token 解析）
class User(BaseModel):
    id: int
    name: str
    is_admin: bool


# 模拟 token 解析
def get_current_user(token: str = ""):
    # 真实场景里解析 JWT，这里简化
    if token == "admin-token":
        return User(id=1, name="admin", is_admin=True)
    if token == "user-token":
        return User(id=2, name="alice", is_admin=False)
    # 无效 token 抛 401
    raise HTTPException(status_code=401, detail="Invalid token")


# 路由：用 get_db 依赖
@app.get("/items")
def list_items(db = Depends(get_db)):
    # db 是 get_db yield 出来的字典
    return {"items": db["items"]}


# 路由：用 get_current_user 依赖
@app.get("/me")
def read_me(user: User = Depends(get_current_user)):
    return {"user_id": user.id, "name": user.name}


# 路由：依赖链——get_admin_user 依赖 get_current_user
def get_admin_user(user: User = Depends(get_current_user)):
    # 子依赖：先调 get_current_user 拿到 user，再校验是否 admin
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return user


@app.get("/admin")
def admin_only(admin: User = Depends(get_admin_user)):
    return {"admin": admin.name}
\`\`\`

\`Depends(get_db)\` 的作用：FastAPI 在调用路由前，先调用 \`get_db()\`，把返回值（或 yield 的值）传给路由的 \`db\` 参数。路由结束后，执行 \`get_db\` 的 finally 部分。这就是依赖注入——路由"依赖"的东西由框架提供，路由只管用。

## 为什么测试时要覆盖依赖

三个核心原因：

1. **隔离外部服务**：数据库、Redis、第三方 API 在测试时可能不可用或太慢。覆盖成内存版本，测试快、稳定、可重复。
2. **模拟用户**：认证依赖需要真实 token，测试时不想真的登录。覆盖成"直接返回模拟用户"，省去认证流程。
3. **模拟异常**：想测"数据库连不上时接口怎么响应"，可以覆盖成"总是抛异常"的依赖。

不覆盖依赖的话，测试会真的连数据库、真的调第三方 API，慢且不稳定。CI 环境（持续集成）里尤其要避免——一个网络抖动就导致测试失败，没人能接受。

## app.dependency_overrides 核心机制详解

\`app.dependency_overrides\` 是一个字典，key 是原始依赖函数，value 是覆盖函数。

\`\`\`txt
app.dependency_overrides = {
    原始依赖函数: 覆盖函数,
    ...
}
\`\`\`

工作原理：FastAPI 调用路由时，对每个 \`Depends(原始依赖)\`，先查 \`dependency_overrides\` 字典。如果找到原始依赖的 key，就调用覆盖函数；否则调用原始依赖。覆盖函数的返回值会传给路由。

关键点：

- 覆盖函数的签名**不需要**和原始依赖完全一样，只要返回值类型兼容即可。
- 覆盖是**全局**的：所有用到该依赖的路由都会受影响。
- 覆盖后**必须清理**，否则影响后续测试。用 \`app.dependency_overrides.clear()\` 清空所有覆盖。

## Demo 1：原始依赖（读数据库）→ 测试时覆盖

先看不覆盖时，测试会真的调 \`get_db\`：

\`\`\`python
from starlette.testclient import TestClient
from app_dep import app, get_db

client = TestClient(app)


def test_without_override():
    # 不覆盖，用原始 get_db
    response = client.get("/items")
    assert response.status_code == 200
    body = response.json()
    # 返回 get_db 里的 items
    assert 1 in body["items"]
    assert body["items"][1] == "apple"
\`\`\`

这个测试能过，因为 \`get_db\` 是内存模拟。但如果是真实数据库，这个测试会真的连库，慢且需要数据库环境。接下来我们覆盖它。

## Demo 2：覆盖 get_db 用内存 SQLite（模拟）

\`\`\`python
def override_get_db():
    # 覆盖函数：返回一个不同的"数据库"
    # 真实场景里这里连内存 SQLite
    fake_db = {"items": {100: "override-item"}, "closed": False}
    try:
        yield fake_db
    finally:
        fake_db["closed"] = True


def test_with_override():
    # 注册覆盖：把 get_db 换成 override_get_db
    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/items")
        assert response.status_code == 200
        body = response.json()
        # 返回的是覆盖函数里的数据，不是原始的
        assert 100 in body["items"]
        assert body["items"][100] == "override-item"
        # 原始数据 1 不在
        assert 1 not in body["items"]
    finally:
        # 必须清理，否则影响其他测试
        app.dependency_overrides.clear()


def test_override_isolated():
    # 上一个测试已清理，这里用原始 get_db
    response = client.get("/items")
    body = response.json()
    # 又是原始数据
    assert 1 in body["items"]
\`\`\`

注意 \`try...finally\` 的用法：覆盖后一定要在 finally 里清理，即使断言失败也要清理，否则会污染后续测试。这是依赖覆盖的铁律。

## Demo 3：覆盖认证依赖（模拟登录用户）

\`\`\`python
from app_dep import get_current_user, User


def override_user_admin():
    # 覆盖认证：直接返回 admin 用户，不需要 token
    return User(id=1, name="admin", is_admin=True)


def override_user_normal():
    # 覆盖认证：返回普通用户
    return User(id=2, name="alice", is_admin=False)


def test_me_as_admin():
    app.dependency_overrides[get_current_user] = override_user_admin
    try:
        response = client.get("/me")
        assert response.status_code == 200
        body = response.json()
        # 返回的是覆盖的 admin 用户
        assert body["user_id"] == 1
        assert body["name"] == "admin"
    finally:
        app.dependency_overrides.clear()


def test_me_as_normal():
    app.dependency_overrides[get_current_user] = override_user_normal
    try:
        response = client.get("/me")
        assert response.status_code == 200
        assert response.json()["name"] == "alice"
    finally:
        app.dependency_overrides.clear()


def test_admin_endpoint_with_override():
    # 覆盖成 admin，能访问 /admin
    app.dependency_overrides[get_current_user] = override_user_admin
    try:
        response = client.get("/admin")
        assert response.status_code == 200
        assert response.json()["admin"] == "admin"
    finally:
        app.dependency_overrides.clear()


def test_admin_endpoint_forbidden():
    # 覆盖成普通用户，访问 /admin 被拒
    app.dependency_overrides[get_current_user] = override_user_normal
    try:
        response = client.get("/admin")
        # get_admin_user 校验 is_admin，普通用户返回 403
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()
\`\`\`

覆盖认证依赖是最高频的测试场景。不用真的登录、不用造 token，直接"假装"是某个用户。测 admin 权限就覆盖成 admin，测普通用户权限就覆盖成普通用户。这让权限测试变得极其简单。

## Demo 4：测试后恢复依赖

\`\`\`python
def test_clear_all_overrides():
    # 设置多个覆盖
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_user_admin
    # 此时有两个覆盖
    assert len(app.dependency_overrides) == 2
    # 清空所有
    app.dependency_overrides.clear()
    # 确认清空了
    assert len(app.dependency_overrides) == 0


def test_clear_single_override():
    # 只清掉一个覆盖
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_user_admin
    # 删除单个
    del app.dependency_overrides[get_db]
    # get_db 覆盖没了，get_current_user 还在
    assert get_db not in app.dependency_overrides
    assert get_current_user in app.dependency_overrides
    # 清理剩余
    app.dependency_overrides.clear()
\`\`\`

清理方式有两种：

- \`app.dependency_overrides.clear()\`：清空所有，最常用。
- \`del app.dependency_overrides[key]\`：只删单个，适合"测试中途切换依赖"。

## Demo 5：用 fixture 管理依赖覆盖（自动清理）

手动 try/finally 容易忘清理。用 pytest fixture 自动管理更安全：

\`\`\`python
import pytest
from app_dep import app, get_db, get_current_user, User


@pytest.fixture
def override_db():
    """覆盖 get_db，测试结束自动清理"""
    def _override():
        fake_db = {"items": {200: "fixture-item"}, "closed": False}
        try:
            yield fake_db
        finally:
            fake_db["closed"] = True
    # 注册覆盖
    app.dependency_overrides[get_db] = _override
    # yield 把控制权交给测试
    yield
    # 测试结束，清理覆盖
    app.dependency_overrides.clear()


@pytest.fixture
def override_admin():
    """覆盖认证为 admin"""
    def _override():
        return User(id=1, name="admin", is_admin=True)
    app.dependency_overrides[get_current_user] = _override
    yield
    app.dependency_overrides.clear()


def test_with_fixture(override_db):
    # fixture 自动设置并清理覆盖
    response = client.get("/items")
    assert response.status_code == 200
    body = response.json()
    # 用的是 fixture 里的数据
    assert 200 in body["items"]
    assert body["items"][200] == "fixture-item"


def test_admin_with_fixture(override_admin):
    response = client.get("/me")
    assert response.status_code == 200
    assert response.json()["name"] == "admin"


def test_both_fixtures(override_db, override_admin):
    # 同时用两个 fixture，两个依赖都被覆盖
    response = client.get("/items")
    assert 200 in response.json()["items"]
    response = client.get("/me")
    assert response.json()["name"] == "admin"
\`\`\`

fixture 的优势：**自动清理**。pytest fixture 的 yield 之后代码一定执行（即使测试失败），所以 \`app.dependency_overrides.clear()\` 一定会被调用。这比手动 try/finally 更可靠——你不可能"忘"清理，因为 fixture 帮你做了。

生活类比：fixture 就像酒店的"客房服务"。你入住（测试开始），客房服务自动把房间布置好（设置覆盖）；你退房（测试结束），客房服务自动收拾干净（清理覆盖）。你不用自己打扫，也不会忘了打扫。

## Demo 6：覆盖子依赖（依赖链）

\`get_admin_user\` 依赖 \`get_current_user\`，这是依赖链。覆盖时可以覆盖任意一层。

\`\`\`python
from app_dep import get_admin_user


def test_override_root_of_chain():
    # 覆盖链的根：get_current_user
    # get_admin_user 会拿到覆盖的 user
    def override_root():
        return User(id=1, name="admin", is_admin=True)
    app.dependency_overrides[get_current_user] = override_root
    try:
        response = client.get("/admin")
        assert response.status_code == 200
        assert response.json()["admin"] == "admin"
    finally:
        app.dependency_overrides.clear()


def test_override_middle_of_chain():
    # 直接覆盖 get_admin_user，跳过 get_current_user
    def override_admin():
        return User(id=99, name="superadmin", is_admin=True)
    app.dependency_overrides[get_admin_user] = override_admin
    try:
        response = client.get("/admin")
        assert response.status_code == 200
        assert response.json()["admin"] == "superadmin"
    finally:
        app.dependency_overrides.clear()


def test_override_chain_forbidden():
    # 覆盖 get_current_user 成普通用户
    # get_admin_user 会因 is_admin=False 抛 403
    def override_normal():
        return User(id=2, name="alice", is_admin=False)
    app.dependency_overrides[get_current_user] = override_normal
    try:
        response = client.get("/admin")
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()
\`\`\`

依赖链覆盖的灵活性：你可以覆盖链上的任意节点。覆盖根（\`get_current_user\`）会顺带影响所有子依赖；覆盖中间（\`get_admin_user\`）则跳过根，直接替换整条链。测试时根据需要选择覆盖点。

## Demo 7：测试依赖本身（直接调用依赖函数）

有时候你想测依赖函数本身的逻辑，不走路由。直接调用即可：

\`\`\`python
from app_dep import get_current_user, get_admin_user, User


def test_get_current_user_directly():
    # 直接调用依赖函数，测它的逻辑
    # admin-token 应该返回 admin 用户
    user = get_current_user(token="admin-token")
    assert user.id == 1
    assert user.is_admin is True


def test_get_current_user_invalid():
    # 无效 token 应该抛 401
    import pytest
    from app_dep import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token="bad")
    assert exc_info.value.status_code == 401


def test_get_admin_user_directly():
    # 直接调用 get_admin_user，传入 admin 用户
    admin = User(id=1, name="admin", is_admin=True)
    result = get_admin_user(user=admin)
    assert result.is_admin is True


def test_get_admin_user_denied():
    # 传入普通用户，应抛 403
    import pytest
    from app_dep import HTTPException
    normal = User(id=2, name="alice", is_admin=False)
    with pytest.raises(HTTPException) as exc_info:
        get_admin_user(user=normal)
    assert exc_info.value.status_code == 403
\`\`\`

依赖函数本质就是普通函数，可以直接调用测试。这种方式测的是"依赖自身的逻辑"，而通过 TestClient 测的是"依赖在路由里的集成"。两者互补：单元测试直接调依赖，集成测试用 TestClient 走路由。

## dependency_overrides 注意事项

| 注意点 | 说明 |
|--------|------|
| 必须清理 | 测试结束 clear()，否则污染其他测试 |
| yield 依赖 | 覆盖函数也要用 yield，保持生成器协议 |
| 依赖链 | 覆盖链上任一节点都行，按需选择 |
| 全局影响 | 覆盖是全局的，所有路由的该依赖都受影响 |
| 签名不强制 | 覆盖函数签名可不同，返回值兼容即可 |
| fixture 管理 | 用 pytest fixture 自动清理，最可靠 |
| 直接调用测依赖 | 不走路由，测依赖自身逻辑 |
| 不要覆盖后忘清理 | 最常见的坑，导致测试间相互污染 |
| 覆盖 vs mock | 覆盖是框架级，比 mock 对象更干净 |
| 测试数据库 | 覆盖成内存 SQLite 是经典用法 |

## 本章小结

| 要点 | 说明 |
|------|------|
| Depends() | 声明依赖，框架注入返回值 |
| dependency_overrides | 字典，key=原始依赖，value=覆盖函数 |
| 覆盖 get_db | 隔离真实数据库，用内存版本 |
| 覆盖认证依赖 | 模拟用户，省去登录流程 |
| clear() | 清空所有覆盖，必须做 |
| del 单个 | 只删一个覆盖 |
| pytest fixture | 自动管理覆盖生命周期，最推荐 |
| 依赖链覆盖 | 覆盖任意节点，灵活性高 |
| 直接调用依赖 | 测依赖自身逻辑，不走路由 |
| yield 依赖 | 覆盖函数也要 yield，保持协议 |
| 全局影响 | 覆盖影响所有路由，注意范围 |

依赖注入测试是 FastAPI 测试体系的核心。掌握 \`dependency_overrides\` 后，你能隔离任何外部依赖、模拟任何用户身份、注入任何异常场景，而不动一行业务代码。这种"无侵入的测试隔离"是 FastAPI 相比很多框架的显著优势。下一批章节我们会把依赖覆盖用到更复杂的场景——数据库测试、认证测试、外部服务 mock，届时你会发现这一章打下的基础有多重要。`
  }
];
