// =============================================================
// FastAPI 实战教程（精简版）- 第 1 批章节（基础 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-quickstart: 快速入门
//   fa-path-params: 路径参数
//   fa-query-params: 查询参数
//   fa-request-body: 请求体
// ============================================================

export const chapters = [
  {
    id: "fa-quickstart",
    group: "FastAPI 基础",
    icon: "🚀",
    title: "快速入门",
    content: `# 快速入门

## 安装 FastAPI

\`\`\`bash
pip install fastapi
pip install "uvicorn[standard]"
\`\`\`

## Demo 1: Hello World

\`\`\`python
# main.py
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义根路径路由
# @app.get("/") 装饰器表示：当访问 / 路径时，调用下面的函数
@app.get("/")
def read_root():
    # 返回字典，FastAPI 自动转换为 JSON
    return {"message": "Hello World"}

# 启动命令：uvicorn main:app --reload
# --reload 表示开发模式，代码修改后自动重启
\`\`\`

## Demo 2: 路径参数

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# {item_id} 是路径参数
# 函数参数 item_id: int 表示：
# 1. 从 URL 中提取 item_id
# 2. 自动转换为 int 类型
# 3. 如果类型不对，返回 422 错误
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# 访问 /items/42 返回 {"item_id": 42}
# 访问 /items/abc 返回 422 错误（类型不匹配）
\`\`\`

## Demo 3: 查询参数

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 查询参数：不在路径中的参数
# 访问 /items/?skip=0&limit=10
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    # skip 和 limit 是查询参数
    # 有默认值，所以是可选的
    return {"skip": skip, "limit": limit}

# 访问 /items/ 返回 {"skip": 0, "limit": 10}
# 访问 /items/?skip=5 返回 {"skip": 5, "limit": 10}
# 访问 /items/?skip=5&limit=20 返回 {"skip": 5, "limit": 20}
\`\`\`

## Demo 4: 请求体

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 定义数据模型
class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False  # 可选字段，默认 False

# POST 请求，接收 JSON 请求体
@app.post("/items/")
def create_item(item: Item):
    # item 自动验证并转换为 Item 对象
    return {"item_name": item.name, "item_price": item.price}

# 请求示例：
# POST /items/
# {
#     "name": "苹果",
#     "price": 5.5,
#     "is_offer": true
# }
\`\`\`

## Demo 5: 自动文档

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    """
    根路径接口
    
    返回欢迎信息
    """
    return {"message": "Welcome to FastAPI"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    """
    获取商品信息
    
    - **item_id**: 商品 ID（整数）
    """
    return {"item_id": item_id}

# 启动后访问：
# http://127.0.0.1:8000/docs - Swagger UI 文档
# http://127.0.0.1:8000/redoc - ReDoc 文档
\`\`\`

## 小结

- FastAPI 基于类型提示，自动验证、序列化、文档生成
- 路径参数：\`{param}\` 在路径中定义
- 查询参数：函数参数但不在路径中
- 请求体：用 Pydantic 模型定义
- 自动文档：访问 \`/docs\` 或 \`/redoc\`
`
  },
  {
    id: "fa-path-params",
    group: "FastAPI 基础",
    icon: "🛣️",
    title: "路径参数",
    content: `# 路径参数

## 基本用法

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 路径参数：{item_id}
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
\`\`\`

## Demo 1: 多个路径参数

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 多个路径参数
@app.get("/users/{user_id}/items/{item_id}")
def read_user_item(user_id: int, item_id: int):
    return {"user_id": user_id, "item_id": item_id}

# 访问 /users/1/items/42
# 返回 {"user_id": 1, "item_id": 42}
\`\`\`

## Demo 2: 路径参数类型验证

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# int 类型
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# float 类型
@app.get("/prices/{price}")
def read_price(price: float):
    return {"price": price}

# str 类型（默认）
@app.get("/names/{name}")
def read_name(name: str):
    return {"name": name}

# bool 类型
@app.get("/flags/{flag}")
def read_flag(flag: bool):
    return {"flag": flag}
# 访问 /flags/true 或 /flags/1 返回 {"flag": true}
# 访问 /flags/false 或 /flags/0 返回 {"flag": false}
\`\`\`

## Demo 3: Enum 路径参数

\`\`\`python
from fastapi import FastAPI
from enum import Enum

app = FastAPI()

# 定义枚举类
class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    # 自动验证枚举值
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Alexnet"}
    return {"model_name": model_name}

# 访问 /models/alexnet 返回成功
# 访问 /models/invalid 返回 422 错误
\`\`\`

## Demo 4: 路径参数包含路径

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 路径参数包含 /
# 使用 path 类型
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}

# 访问 /files/home/user/data.txt
# 返回 {"file_path": "home/user/data.txt"}
\`\`\`

## Demo 5: 路径参数顺序

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 固定路径必须在动态路径之前
@app.get("/users/me")
def read_current_user():
    return {"user_id": "current"}

@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

# 访问 /users/me 返回 {"user_id": "current"}
# 访问 /users/123 返回 {"user_id": 123}
\`\`\`

## 小结

- 路径参数用 \`{param}\` 定义
- 通过类型提示自动验证和转换
- 支持 int、float、str、bool、Enum、path 等类型
- 固定路径要放在动态路径之前
`
  },
  {
    id: "fa-query-params",
    group: "FastAPI 基础",
    icon: "🔍",
    title: "查询参数",
    content: `# 查询参数

## 基本用法

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 查询参数：不在路径中的函数参数
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# 访问 /items/?skip=0&limit=10
\`\`\`

## Demo 1: 可选查询参数

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 可选参数：有默认值
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# 必选参数：没有默认值
@app.get("/items/")
def read_items_required(skip: int, limit: int):
    return {"skip": skip, "limit": limit}
# 访问 /items/ 返回 422 错误（缺少参数）
\`\`\`

## Demo 2: 查询参数类型

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# int 类型
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# float 类型
@app.get("/prices/")
def read_prices(min_price: float = 0, max_price: float = 100):
    return {"min": min_price, "max": max_price}

# bool 类型
@app.get("/items/")
def read_items(in_stock: bool = True):
    return {"in_stock": in_stock}
# 访问 /items/?in_stock=true 或 /items/?in_stock=1
\`\`\`

## Demo 3: 可选查询参数（None）

\`\`\`python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# 可选参数，默认为 None
@app.get("/items/")
def read_items(q: Optional[str] = None):
    if q:
        return {"q": q}
    return {"message": "no query"}

# 访问 /items/ 返回 {"message": "no query"}
# 访问 /items/?q=test 返回 {"q": "test"}
\`\`\`

## Demo 4: 查询参数验证

\`\`\`python
from fastapi import FastAPI, Query

app = FastAPI()

# 使用 Query 进行验证
@app.get("/items/")
def read_items(
    q: str = Query(
        default=None,
        min_length=3,
        max_length=50,
        title="查询字符串",
        description="用于搜索的查询字符串"
    )
):
    return {"q": q}

# 访问 /items/?q=ab 返回 422（长度不够）
# 访问 /items/?q=abc 返回成功
\`\`\`

## Demo 5: 查询参数列表

\`\`\`python
from fastapi import FastAPI, Query

app = FastAPI()

# 接收多个值
@app.get("/items/")
def read_items(q: list[str] = Query(default=[])):
    return {"q": q}

# 访问 /items/?q=apple&q=banana
# 返回 {"q": ["apple", "banana"]}
\`\`\`

## Demo 6: 路径参数和查询参数混用

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 路径参数 + 查询参数
@app.get("/users/{user_id}/items/")
def read_user_items(
    user_id: int,  # 路径参数
    skip: int = 0,  # 查询参数
    limit: int = 10  # 查询参数
):
    return {
        "user_id": user_id,
        "skip": skip,
        "limit": limit
    }

# 访问 /users/1/items/?skip=0&limit=10
\`\`\`

## 小结

- 查询参数是函数参数但不在路径中
- 有默认值是可选的，没默认值是必选的
- 支持 int、float、str、bool、list 等类型
- 用 Query 进行高级验证
- 可以接收多个值（list）
`
  },
  {
    id: "fa-request-body",
    group: "FastAPI 基础",
    icon: "📦",
    title: "请求体",
    content: `# 请求体

## 基本用法

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 定义数据模型
class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

@app.post("/items/")
def create_item(item: Item):
    return item

# 请求示例：
# POST /items/
# {
#     "name": "苹果",
#     "price": 5.5,
#     "is_offer": true
# }
\`\`\`

## Demo 1: 嵌套模型

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Image(BaseModel):
    url: str
    name: str

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    image: Image  # 嵌套模型

@app.post("/items/")
def create_item(item: Item):
    return item

# 请求示例：
# {
#     "name": "苹果",
#     "price": 5.5,
#     "image": {
#         "url": "http://example.com/apple.jpg",
#         "name": "apple"
#     }
# }
\`\`\`

## Demo 2: 列表字段

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    tags: list[str] = []  # 列表字段

@app.post("/items/")
def create_item(item: Item):
    return item

# 请求示例：
# {
#     "name": "苹果",
#     "tags": ["水果", "红色"]
# }
\`\`\`

## Demo 3: 可选字段

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    description: Optional[str] = None  # 可选字段
    price: float
    tax: Optional[float] = None

@app.post("/items/")
def create_item(item: Item):
    return item

# 请求示例：
# {
#     "name": "苹果",
#     "price": 5.5
# }
# description 和 tax 可以不传
\`\`\`

## Demo 4: 请求体 + 路径参数

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_id": item_id, **item.dict()}

# 请求示例：
# PUT /items/42
# {
#     "name": "苹果",
#     "price": 5.5
# }
\`\`\`

## Demo 5: 多个请求体参数

\`\`\`python
from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

class User(BaseModel):
    username: str

@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: Item,
    user: User,
    importance: int = Body(...)
):
    return {
        "item_id": item_id,
        "item": item,
        "user": user,
        "importance": importance
    }

# 请求示例：
# PUT /items/42
# {
#     "item": {"name": "苹果", "price": 5.5},
#     "user": {"username": "张三"},
#     "importance": 5
# }
\`\`\`

## Demo 6: 表单数据

\`\`\`python
from fastapi import FastAPI, Form

app = FastAPI()

@app.post("/login/")
def login(username: str = Form(...), password: str = Form(...)):
    return {"username": username}

# 请求示例：
# POST /login/
# Content-Type: application/x-www-form-urlencoded
# username=admin&password=secret
\`\`\`

## Demo 7: 文件上传

\`\`\`python
from fastapi import FastAPI, File, UploadFile

app = FastAPI()

# 单文件上传
@app.post("/upload/")
def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename}

# 多文件上传
@app.post("/upload/multiple/")
def upload_files(files: list[UploadFile] = File(...)):
    return {"filenames": [f.filename for f in files]}
\`\`\`

## 小结

- 用 Pydantic 模型定义请求体
- 支持嵌套模型、列表、可选字段
- 可以混用路径参数、查询参数、请求体
- 支持表单数据和文件上传
`
  }
];
