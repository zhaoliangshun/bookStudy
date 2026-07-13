// =============================================================
// FastAPI Demo 详解 - 第 1 批章节（入门基础 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fl-intro:        初识 FastAPI
//   fl-first-app:    第一个应用
//   fl-path-params:  路径参数
//   fl-query-params: 查询参数
//
// 编写原则：demo 驱动，重点在代码注释里讲解，少废话
// =============================================================

export const chapters = [
  {
    id: "fl-intro",
    group: "入门基础",
    icon: "🌱",
    title: "初识 FastAPI",
    content: `# 初识 FastAPI

## FastAPI 是什么

FastAPI 是一个现代 Python Web 框架，用来快速构建 API。特点：**快**（性能接近 Node.js/Go）、**简单**（类型注解自动校验）、**自动生成文档**。

## 核心三件套

\`\`\`python
# FastAPI 依赖三个核心库，先认识它们：
# 1. FastAPI —— Web 框架本身，提供路由、请求处理
# 2. Uvicorn —— ASGI 服务器，负责真正接收 HTTP 请求并转给 FastAPI
# 3. Pydantic —— 数据校验库，FastAPI 用它校验请求/响应数据
\`\`\`

## Demo 1：安装

\`\`\`bash
# 安装 FastAPI 和 Uvicorn（带标准依赖）
# [standard] 表示安装 uvicorn 的完整依赖（含自动重载等开发工具）
pip install "fastapi[standard]"

# 等价于下面两条（如果不加 [standard]）：
pip install fastapi
pip install "uvicorn[standard]"
\`\`\`

## Demo 2：验证安装

\`\`\`python
# 验证安装是否成功
# 导入 fastapi 包，用于检查版本号
import fastapi
# 导入 uvicorn 包，ASGI 服务器，用于检查版本号
import uvicorn

# 打印版本号，能看到版本说明安装成功
# __version__ 是 Python 包的版本属性惯例
print(fastapi.__version__)  # 例如 0.115.x
print(uvicorn.__version__)  # 例如 0.32.x
\`\`\`

## Demo 3：ASGI 是什么（概念理解）

\`\`\`python
# 传统框架（Flask/Django）基于 WSGI：同步处理，一个请求占一个线程
# FastAPI 基于 ASGI：异步处理，一个事件循环能处理大量并发
#
# 举个例子理解区别：
# - WSGI（同步）：餐厅只有一个服务员，点完菜要等菜做好才能服务下一桌
# - ASGI（异步）：服务员点完菜就把单子给厨房，立刻去服务下一桌，菜好了再端
#
# 这就是为什么 FastAPI 性能高 —— 它不会在等待数据库/网络时傻等
\`\`\`

## 小结

| 概念 | 作用 |
|------|------|
| FastAPI | Web 框架，定义路由和处理逻辑 |
| Uvicorn | 服务器，接收 HTTP 请求 |
| Pydantic | 数据校验，保证数据格式正确 |
| ASGI | 异步协议，支持高并发 |

下一章我们写第一个真正能跑的应用。`
  },

  {
    id: "fl-first-app",
    group: "入门基础",
    icon: "🚀",
    title: "第一个应用",
    content: `# 第一个应用

## 从 Hello World 开始

\`\`\`python
# main.py
# 导入 FastAPI 类，这是创建应用和路由的入口
from fastapi import FastAPI

# 创建应用实例
# FastAPI() 接收可选参数，比如 title、description、version，用于自动生成文档
app = FastAPI(
    title="我的第一个 API",   # 显示在 /docs 文档页标题
    description="学习 FastAPI 的第一个应用",
    version="1.0.0",
)

# @app.get("/") 是装饰器，含义：
#   - get：只响应 GET 请求（读数据用 GET，写数据用 POST）
#   - "/"：匹配根路径，即 http://localhost:8000/
# 装饰器把下面的函数注册为路由处理函数
@app.get("/")
def read_root():
    # 返回字典，FastAPI 自动转成 JSON
    # 浏览器访问 / 就能看到 {"hello": "world"}
    return {"hello": "world"}
\`\`\`

## 启动应用

\`\`\`bash
# 启动命令格式：uvicorn 模块名:应用名
# main:app 表示 main.py 文件里的 app 变量
uvicorn main:app --reload

# --reload 关键参数：开发模式，代码改动后自动重启服务
# 生产环境不要加 --reload
\`\`\`

## Demo 2：多个路由

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 一个应用可以有多个路由，每个路由处理一个 URL
# @app.get 装饰器：注册 GET 路由，路径为根路径 /
@app.get("/")
def home():
    # 返回字典，FastAPI 自动转 JSON
    return {"page": "首页"}

# @app.get 装饰器：注册 GET 路由，路径为 /about
@app.get("/about")
def about():
    # 访问 http://localhost:8000/about
    return {"page": "关于我们"}

# @app.get 装饰器：注册 GET 路由，路径为 /users/me
# 注意：更具体的路径要放在前面
# /users/me 要写在 /users/{id} 之前，否则 me 会被当成 id
@app.get("/users/me")
def get_current_user():
    return {"user": "当前登录用户"}

# @app.get 装饰器：注册 GET 路由，{user_id} 是路径参数
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # 参数 user_id: int 表示从路径提取并自动转为整数
    # {user_id} 是路径参数，下一章详细讲
    return {"user_id": user_id}
\`\`\`

## Demo 3：自动文档（杀手级特性）

\`\`\`python
# FastAPI 自动生成两套文档，无需任何配置：
# 1. /docs     —— Swagger UI 交互式文档，可直接在页面里测试 API
# 2. /redoc    —— ReDoc 文档，界面更美观，适合阅读
#
# 启动后访问：
#   http://localhost:8000/docs
#   http://localhost:8000/redoc
#
# 在 /docs 页面可以：
#   - 看到所有路由列表
#   - 点击 "Try it out" 直接发请求测试
#   - 看到每个接口的请求参数和响应格式

# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# summary 参数：接口摘要，显示在文档列表里
# description 参数：接口详细描述
# @app.get 装饰器：注册 GET 路由，{item_id} 是路径参数
@app.get("/items/{item_id}", summary="获取商品", description="根据 ID 查询商品详情")
def get_item(item_id: int, q: str | None = None):
    """
    这里的 docstring 会自动显示在 /docs 文档里
    作为接口的说明文字。
    FastAPI 会读取函数的 docstring 作为接口描述。
    """
    # 参数 item_id: int 路径参数，自动转整数
    # 参数 q: str | None = None 查询参数，可选
    # 返回字典，FastAPI 自动转 JSON
    return {"item_id": item_id, "q": q}
\`\`\`

## Demo 4：HTTP 方法对照

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# FastAPI 为每种 HTTP 方法提供了对应的装饰器
# @app.get 装饰器：注册 GET 路由，用于查询/读取数据
@app.get("/items")           # GET    —— 查询/读取数据
def list_items(): ...

# @app.post 装饰器：注册 POST 路由，用于新建数据
@app.post("/items")          # POST   —— 新建数据
def create_item(): ...

# @app.put 装饰器：注册 PUT 路由，用于完整更新
@app.put("/items/{id}")      # PUT    —— 完整更新（替换整个资源）
def update_item(): ...

# @app.patch 装饰器：注册 PATCH 路由，用于部分更新
@app.patch("/items/{id}")    # PATCH  —— 部分更新（只改几个字段）
def patch_item(): ...

# @app.delete 装饰器：注册 DELETE 路由，用于删除数据
@app.delete("/items/{id}")   # DELETE —— 删除数据
def delete_item(): ...

# 记忆口诀：增 POST、查 GET、改 PUT/PATCH、删 DELETE
\`\`\`

## 小结

- \`FastAPI()\` 创建应用，\`@app.get/post/...\` 定义路由
- \`uvicorn main:app --reload\` 启动开发服务
- 访问 \`/docs\` 自动有交互式文档，这是 FastAPI 最大卖点之一`
  },

  {
    id: "fl-path-params",
    group: "入门基础",
    icon: "🛤️",
    title: "路径参数",
    content: `# 路径参数

## 基本用法

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 路径参数：URL 路径里用 {参数名} 占位
# 访问 /items/42 时，item_id 的值就是 "42"（字符串）
@app.get("/items/{item_id}")
def read_item(item_id):
    # 参数 item_id 没有类型注解，所以是字符串类型
    return {"item_id": item_id}

# 但这样不安全 —— /items/hello 也会通过，item_id 变成 "hello"
# 解决办法：加类型注解，让 FastAPI 自动校验
\`\`\`

## Demo 2：类型校验（重点）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# item_id: int 告诉 FastAPI：这个参数必须是整数
@app.get("/items/{item_id}")
def read_item(item_id: int):
    # 参数 item_id: int 表示路径参数会被自动转为整数
    # FastAPI 自动做的事：
    # 1. 从 URL 提取 item_id
    # 2. 尝试转成 int
    # 3. 转不了就返回 422 错误（而不是崩溃）
    return {"item_id": item_id, "type": type(item_id).__name__}

# 访问 /items/42    → {"item_id": 42, "type": "int"}     ✅ 正常
# 访问 /items/hello  → 422 错误，提示 value is not a valid integer
\`\`\`

## Demo 3：多个路径参数

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 一个路径可以有多个参数，按顺序对应
# @app.get 装饰器：注册 GET 路由，路径含两个路径参数
@app.get("/users/{user_id}/posts/{post_id}")
def get_post(user_id: int, post_id: int):
    # 参数 user_id: int 和 post_id: int 都是路径参数
    # 访问 /users/1/posts/100
    # user_id=1, post_id=100
    # 两个参数都有 int 类型注解，自动校验和转换
    # 返回字典，FastAPI 自动转 JSON
    return {"user_id": user_id, "post_id": post_id}
\`\`\`

## Demo 4：路径顺序很重要（踩坑点）

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# ❌ 错误顺序：/users/me 会被 /users/{user_id} 抢先匹配
# 因为 FastAPI 按定义顺序匹配，me 会被当成 user_id
# @app.get 装饰器：注册 GET 路由，{user_id} 是动态路径参数
@app.get("/users/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}

# @app.get 装饰器：注册 GET 路由，/users/me 是固定路径
@app.get("/users/me")
def get_me():
    # 这条永远匹配不到！/users/me 已经被上面拦截，user_id="me"
    return {"user": "我"}

# ✅ 正确做法：固定路径放在动态路径前面
# @app.get 装饰器：先定义固定路径 /users/me
@app.get("/users/me")       # 先定义固定路径
def get_me():
    return {"user": "我"}

# @app.get 装饰器：再定义动态路径 /users/{user_id}
@app.get("/users/{user_id}")  # 再定义动态路径
def get_user(user_id: str):
    return {"user_id": user_id}

# 规则：越具体的路径越靠前，越通用的越靠后
\`\`\`

## Demo 5：枚举参数（限定取值）

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
# 导入 Enum，Python 标准库的枚举类，用于定义一组固定取值
from fastapi import FastAPI
from enum import Enum

# 创建应用实例
app = FastAPI()

# 用 Enum 定义一组固定取值
# 继承 str 是为了 JSON 序列化时是字符串
# 同时继承 Enum 和 str 让枚举成员既是枚举又是字符串
class ModelName(str, Enum):
    alexnet = "alexnet"   # 枚举成员，值为 "alexnet"
    resnet = "resnet"
    vgg = "vgg"

# 参数类型写成 ModelName，FastAPI 会限制只能传这三个值之一
# @app.get 装饰器：注册 GET 路由，{model_name} 是路径参数
@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    # 参数 model_name: ModelName 表示路径参数必须是枚举成员之一
    # model_name 已经是枚举成员，不是字符串
    # 访问 /models/alexnet  → model_name 是 ModelName.alexnet
    # 访问 /models/unknown  → 422 错误，提示可选值
    # model_name.value 取枚举的字符串值
    return {
        "model": model_name,
        "value": model_name.value,   # .value 取字符串值
    }
\`\`\`

## Demo 6：路径参数包含路径

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 默认 {file_path} 不会匹配含 / 的路径
# 加 :path 后缀可以让它匹配完整路径（含斜杠）
# :path 是 FastAPI 的特殊转换器，告诉它匹配任意字符（包括 /）
# @app.get 装饰器：注册 GET 路由，{file_path:path} 匹配含斜杠的路径
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    # 参数 file_path: str 接收完整路径
    # 访问 /files/home/user/docs/readme.txt
    # file_path = "home/user/docs/readme.txt"（完整路径）
    # 返回字典，FastAPI 自动转 JSON
    return {"file_path": file_path}

# 用途：文件浏览器、静态资源代理
\`\`\`

## 小结

| 写法 | 含义 |
|------|------|
| \`{x}\` | 普通路径参数 |
| \`{x: int}\` | 类型校验（写在函数参数） |
| \`{x: path}\` | 允许包含斜杠 |
| \`Enum\` | 限定固定取值 |

记住：**固定路径放前面，动态路径放后面**。`
  },

  {
    id: "fl-query-params",
    group: "入门基础",
    icon: "🔍",
    title: "查询参数",
    content: `# 查询参数

## 路径参数 vs 查询参数

\`\`\`python
# 路径参数：在 URL 路径里，用 {xxx} 占位
#   /items/42        ← 42 是路径参数
#
# 查询参数：在 ? 后面，key=value 形式，用 & 分隔
#   /items?skip=0&limit=10   ← skip 和 limit 是查询参数
#
# 区分技巧：在路径 {} 里的 = 路径参数，不在的 = 查询参数
\`\`\`

## Demo 1：基本查询参数

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 函数参数里：不在路径中的参数，自动识别为查询参数
# skip: int = 0  ← 有默认值，所以是可选的
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10):
    # 参数 skip: int = 0 查询参数，默认 0
    # 参数 limit: int = 10 查询参数，默认 10
    # 模拟从数据库分页查询
    # 访问 /items           → skip=0,  limit=10（用默认值）
    # 访问 /items?skip=5    → skip=5,  limit=10
    # 访问 /items?skip=5&limit=20 → skip=5, limit=20
    return {"skip": skip, "limit": limit}

# 关键点：有默认值的参数是可选的，没默认值的是必填的
\`\`\`

## Demo 2：必填 vs 可选

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# @app.get 装饰器：注册 GET 路由，路径为 /search
@app.get("/search")
def search(keyword: str, page: int = 1):
    # 参数 keyword: str 没有默认值 → 必填查询参数
    # 参数 page: int = 1 有默认值 → 可选查询参数
    #
    # 访问 /search?keyword=python        → keyword="python", page=1
    # 访问 /search?keyword=py&page=2     → keyword="py", page=2
    # 访问 /search                       → 422 错误，缺少 keyword
    # 返回字典，FastAPI 自动转 JSON
    return {"keyword": keyword, "page": page}
\`\`\`

## Demo 3：可选参数（None 写法）

\`\`\`python
# 导入 FastAPI 类，用于创建应用实例和定义路由
from fastapi import FastAPI
# 导入 Union，typing 模块的工具，用于声明多种可能的类型
# Python 3.10+ 可直接用 str | None 代替 Union[str, None]
from typing import Union

# 创建应用实例
app = FastAPI()

# 当参数可以"不传"时，用 None 作为默认值
# Union[str, None] 表示：可以是字符串，也可以是 None
# @app.get 装饰器：注册 GET 路由，路径为 /items
@app.get("/items")
def list_items(q: Union[str, None] = None):
    # 参数 q: Union[str, None] = None 表示 q 可以是字符串或 None
    # q 不传时是 None，传了就是字符串
    if q:
        # 有查询关键词，执行搜索
        return {"query": q, "results": ["匹配项1", "匹配项2"]}
    # 没传 q，返回全部
    return {"query": None, "results": ["全部项1", "全部项2"]}

# Python 3.10+ 简写：q: str | None = None（和上面等价）
\`\`\`

## Demo 4：bool 类型自动转换

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# bool 参数会被自动转换，很贴心
@app.get("/items")
def list_items(short: bool = False):
    # 参数 short: bool = False 查询参数，会被自动转为布尔值
    # 访问 /items?short=true   → short=True
    # 访问 /items?short=1      → short=True（1/0 会被转）
    # 访问 /items?short=yes    → short=True
    # 访问 /items?short=false  → short=False
    # 访问 /items              → short=False（默认值）
    if short:
        return {"items": ["精简列表"]}
    return {"items": ["完整", "列表", "很长"]}

# 注意：/items?short=abc 会报 422，因为 abc 不是合法 bool
\`\`\`

## Demo 5：参数校验（Query）

\`\`\`python
# 导入 FastAPI 类
# 导入 Query，FastAPI 的查询参数校验工具，用于给查询参数加约束
from fastapi import FastAPI, Query

# 创建应用实例
app = FastAPI()

# 用 Query() 给查询参数加约束
@app.get("/items")
def list_items(
    # Query(default=None, min_length=3, max_length=50)
    # default=None 表示参数可选（不传时为 None）
    # min_length=3 最少 3 字符，max_length=50 最多 50 字符
    q: str | None = Query(default=None, min_length=3, max_length=50),
    # Query(default=0, ge=0)
    # ge=0 表示 greater than or equal，即 >= 0
    skip: int = Query(default=0, ge=0),      # ge=0：大于等于 0
    # Query(default=10, ge=1, le=100)
    # ge=1 大于等于 1，le=100 小于等于 100
    limit: int = Query(default=10, ge=1, le=100),  # 1 ≤ limit ≤ 100
):
    # 校验规则：
    # q 如果传了，长度必须在 3~50 之间
    # skip 必须 ≥ 0
    # limit 必须 1~100
    return {"q": q, "skip": skip, "limit": limit}

# 访问 /items?q=ab            → 422（q 太短，最少 3 字符）
# 访问 /items?skip=-1         → 422（skip 不能为负）
# 访问 /items?limit=200       → 422（limit 最大 100）
\`\`\`

## Demo 6：接收多个相同参数

\`\`\`python
# 导入 FastAPI 类和 Query
from fastapi import FastAPI, Query

# 创建应用实例
app = FastAPI()

# 有时 URL 会有同名参数多次出现，比如 ?tag=a&tag=b
# 用 list 类型接收
@app.get("/items")
def list_items(tags: list[str] | None = Query(default=None)):
    # 参数 tags: list[str] | None = Query(default=None)
    # list[str] 表示接收字符串列表
    # 访问 /items?tags=python&tags=fastapi
    # tags = ["python", "fastapi"]
    # 访问 /items（不传 tags）
    # tags = None
    return {"tags": tags}

# 注意：list[str] 每个元素都会被校验为字符串
\`\`\`

## Demo 7：路径参数 + 查询参数混用

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# 同时有路径参数和查询参数，FastAPI 自动区分
# 规则：在路径 {} 里出现过的 = 路径参数，其余的 = 查询参数
@app.get("/users/{user_id}/posts")
def user_posts(
    user_id: int,          # 路径参数（在 {} 里）
    skip: int = 0,         # 查询参数（不在路径里）
    limit: int = 10,       # 查询参数
    sort: str | None = None,  # 查询参数
):
    # 访问 /users/5/posts?skip=0&limit=20&sort=desc
    # user_id=5(路径), skip=0, limit=20, sort="desc"(查询)
    return {
        "user_id": user_id,
        "skip": skip,
        "limit": limit,
        "sort": sort,
    }
\`\`\`

## 小结

| 参数类型 | 判断依据 | 示例 |
|---------|---------|------|
| 路径参数 | 在路径 \`{}\` 里 | \`/items/{id}\` 的 id |
| 查询参数 | 不在路径里 | \`?q=xx&limit=10\` |

- 有默认值 = 可选，无默认值 = 必填
- \`Query()\` 可加校验规则（长度、范围）
- \`list[str]\` 接收多值参数`
  }
];
