// =============================================================
// FastAPI 应用开发实战教程 - 第 2 批章节（路径与查询参数 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-path       : 路径参数
//   fa-query      : 查询参数
//   fa-validation : 参数校验：Path/Query
//   fa-request-obj: Request 对象与元数据
// ============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：路径参数
  // ============================================================
  {
    id: "fa-path",
    group: "路径与查询参数",
    icon: "🛤️",
    title: "路径参数",
    content: `# 路径参数

## 什么是路径参数

在 RESTful API 设计中，经常需要把资源的标识符嵌入到 URL 路径里。比如：

- \`GET /users/42\` —— 获取 ID 为 42 的用户
- \`GET /articles/2024/07\` —— 获取 2024 年 7 月的文章列表
- \`GET /files/config/main.yaml\` —— 获取配置目录下的 main.yaml 文件

这些 URL 里的 \`42\`、\`2024\`、\`07\`、\`config/main.yaml\` 就是**路径参数**（path parameter）。它们是 URL 路径的一部分，用花括号 \`{}\` 在路由模板里声明，FastAPI 会自动提取并传给处理函数。

### 🌰 生活类比：路径参数就像快递地址里的门牌号

把 URL 想象成快递地址：

- \`/users/42\`  → 北京市海淀区中关村大街**42号**
- \`/users/42/items/7\` → 42号**7单元**
- \`/files/config/main.yaml\` → 档案柜/config抽屉/**main.yaml 文件夹**

门牌号是地址的一部分，**不可省略**——少写门牌号快递员就找不到地方。同样，路径参数在 URL 里是必传的，省略就是 404。

路径参数和查询参数的区别在于位置和语义：

- **路径参数**：在路径里，用来定位"哪个资源"，是 URL 的一部分，不可省略。
- **查询参数**：在 \`?\` 后面，用来"过滤、排序、分页"，可省略。

理解这个区别很重要，因为它们在设计 API 时承担不同的角色。

## 一、基本路径参数

最简单的用法：在路由字符串里用 \`{参数名}\` 占位，函数里用同名参数接收。

### Demo 1：最基础的路径参数

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# {item_id} 是路径参数占位符
# 访问 /items/42 时，FastAPI 把 "42" 提取出来传给函数
@app.get("/items/{item_id}")
# 定义函数 read_item，参数名必须和占位符一致
def read_item(item_id):
    # 没有类型注解时，item_id 是字符串 "42"
    # 返回字典，FastAPI 自动转 JSON
    return {"item_id": item_id}
\`\`\`

访问 \`/items/42\`：
- FastAPI 把 URL 里的 \`42\` 提取为字符串 \`"42"\`
- 调用 \`read_item(item_id="42")\`
- 返回 \`{"item_id": "42"}\`

访问 \`/items/hello\`：
- 提取为 \`"hello"\`
- 返回 \`{"item_id": "hello"}\`

### 关键规则：参数名必须一致

路由里的 \`{item_id}\` 和函数参数 \`item_id\` 必须名字完全一样。如果写成下面这样会报错：

\`\`\`python
# ❌ 错误示范：参数名不一致
@app.get("/items/{item_id}")
def read_item(id):  # 这里写成了 id，不是 item_id
    return {"id": id}
\`\`\`

FastAPI 会报错：\`"id" is not in path'\`，因为它在路径里找不到 \`id\` 这个占位符，又不知道该从哪里拿这个参数。

## 二、类型转换：让参数有类型

光拿到字符串还不够。ID 通常是整数，价格通常是浮点数。FastAPI 通过**类型注解**自动做类型转换和校验。

### Demo 2：用类型注解做类型转换

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# item_id: int 声明参数类型为整数
@app.get("/items/{item_id}")
def read_item(item_id: int):
    # 访问 /items/42 时：
    # 1. FastAPI 把 "42" 转成 int 42
    # 2. 传给函数 item_id=42
    # 3. 返回 {"item_id": 42}（JSON 里是数字不是字符串）
    return {"item_id": item_id}
\`\`\`

访问 \`/items/42\`：返回 \`{"item_id": 42}\`（注意是数字 42，不是字符串 "42"）

访问 \`/items/abc\`：FastAPI 转换失败，直接返回 422 错误：

\`\`\`json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "abc",
      "url": "https://errors.pydantic.dev/..."
    }
  ]
}
\`\`\`

注意：错误响应里 \`loc\` 是 \`["path", "item_id"]\`，表示错误发生在路径参数 \`item_id\` 上。这是 FastAPI 校验错误的统一格式，后面会详细讲。

### 支持的类型

FastAPI 支持所有 Pydantic 能解析的类型，常用的有：

| 类型 | 说明 | 示例输入 | 转换结果 |
|------|------|---------|---------|
| \`int\` | 整数 | \`"42"\` | \`42\` |
| \`float\` | 浮点数 | \`"3.14"\` | \`3.14\` |
| \`str\` | 字符串（默认） | \`"hello"\` | \`"hello"\` |
| \`bool\` | 布尔值 | \`"true"\`、\`"1"\` | \`True\` |
| \`UUID\` | UUID | \`"123e4567-e89b-12d3-a456-426614174000"\` | \`UUID(...)\` |
| \`datetime\` | 日期时间 | \`"2024-07-11T10:00:00"\` | \`datetime(...)\` |
| \`Enum\` | 枚举 | 见下文 | 见下文 |

### Demo 3：bool 和 UUID 类型转换

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 uuid 模块导入 UUID 类型
from uuid import UUID

# 创建应用
app = FastAPI()

# bool 类型：FastAPI 会把 "true"/"1"/"yes"/"on" 转成 True
# "false"/"0"/"no"/"off" 转成 False
@app.get("/flags/{flag}")
def get_flag(flag: bool):
    # 访问 /flags/true → flag=True
    # 访问 /flags/1    → flag=True
    # 访问 /flags/yes  → flag=True
    # 访问 /flags/false → flag=False
    return {"flag": flag, "type": type(flag).__name__}

# UUID 类型：自动解析 UUID 字符串
@app.get("/users/{user_id}")
def get_user(user_id: UUID):
    # 访问 /users/123e4567-e89b-12d3-a456-426614174000
    # user_id 被解析成 UUID 对象
    # user_id.hex 能拿到 32 位十六进制字符串
    return {
        "user_id": str(user_id),       # 转回字符串
        "hex": user_id.hex,            # 32 位无连字符
        "version": user_id.version     # UUID 版本号
    }
\`\`\`

bool 转换的细节值得注意：FastAPI（实际是 Pydantic）对 bool 的解析比较宽松，\`"true"\`、\`"1"\`、\`"yes"\`、\`"on"\` 都会被转成 \`True\`。这在处理 URL 参数时很方便，因为 URL 里没有"真正的布尔值"，都是字符串。

## 三、路径参数与函数参数的映射

FastAPI 怎么知道哪个参数是路径参数、哪个是查询参数？规则很简单：

- **在路由路径里出现的参数名** → 路径参数
- **不在路径里的参数** → 查询参数

### Demo 4：路径参数和查询参数混用

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 路径里有 {item_id}，所以 item_id 是路径参数
# 路径里没有 q，所以 q 是查询参数
# 路径里没有 short，所以 short 是查询参数
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None, short: bool = False):
    # 访问 /items/42?q=apple&short=true
    # item_id=42（路径参数）
    # q="apple"（查询参数）
    # short=True（查询参数）
    # 构造返回结果
    result = {"item_id": item_id}
    # 如果传了 q，加到结果里
    if q:
        result["q"] = q
    # 如果 short 为 True，只返回 name，不返回 description
    if not short:
        result["description"] = "This is a long description"
    return result
\`\`\`

访问测试：

| URL | item_id | q | short |
|-----|---------|---|-------|
| \`/items/42\` | 42 | None | False |
| \`/items/42?q=apple\` | 42 | "apple" | False |
| \`/items/42?q=apple&short=true\` | 42 | "apple" | True |

这个规则让 FastAPI 的参数声明非常直观：你不用显式声明"这是路径参数"还是"这是查询参数"，看路径里有没有就行。

## 四、路径顺序的重要性

这是新手最容易踩的坑。FastAPI 路由匹配是**按定义顺序**的，第一个匹配到的路由就会处理请求。

### Demo 5：路径顺序导致的 bug

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# ❌ 错误顺序：先定义 /users/me，再定义 /users/{user_id}
# 如果反过来定义，访问 /users/me 会被 {user_id} 捕获，user_id="me"
# 然后类型转换失败（me 不是 int），返回 422 错误

# ✅ 正确：固定路径放在动态路径前面
@app.get("/users/me")
def read_current_user():
    # 这个路由处理 /users/me
    # 返回当前登录用户信息
    return {"user": "current user"}

# 动态路径放在后面
@app.get("/users/{user_id}")
def read_user(user_id: int):
    # 这个路由处理 /users/42、/users/100 等
    return {"user_id": user_id}
\`\`\`

为什么顺序很重要？因为路由匹配是"先注册先匹配"。如果先定义 \`/users/{user_id}\`，那么访问 \`/users/me\` 时，FastAPI 会先用 \`{user_id}\` 匹配，把 \`"me"\` 当成 \`user_id\`，然后尝试转成 \`int\` 失败，返回 422。固定路径 \`/users/me\` 永远不会被匹配到。

**避坑指南**：当有固定路径和动态路径"长得像"时，固定路径一定要写在前面。常见场景：

- \`/users/me\` 和 \`/users/{user_id}\`
- \`/posts/latest\` 和 \`/posts/{post_id}\`
- \`/files/main\` 和 \`/files/{filename}\`

## 五、预定义路径参数值（Enum）

有时候路径参数只能是几个固定值之一，比如订单状态 \`/orders/{status}\` 只能是 \`pending\`、\`shipped\`、\`delivered\`。用 \`Enum\` 可以约束。

### Demo 6：用 Enum 限制路径参数取值

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 enum 模块导入 Enum
from enum import Enum

# 创建应用
app = FastAPI()

# 定义枚举类，继承 str 和 Enum
# 继承 str 是为了让 FastAPI 知道这是个字符串类型
class OrderStatus(str, Enum):
    # 枚举值
    pending = "pending"       # 待支付
    shipped = "shipped"       # 已发货
    delivered = "delivered"   # 已送达
    cancelled = "cancelled"   # 已取消

# 路径参数类型声明为 OrderStatus
@app.get("/orders/{status}")
def get_orders_by_status(status: OrderStatus):
    # 访问 /orders/pending → status=OrderStatus.pending
    # 访问 /orders/xyz → 422 错误，因为 xyz 不在枚举里
    # status.name 拿到枚举名（如 "pending"）
    # status.value 拿到枚举值（如 "pending"）
    return {
        "status": status,             # 自动转成字符串
        "status_name": status.name,   # 枚举名
        "message": f"查询状态为 {status.value} 的订单"
    }

# 单独访问某个枚举成员的路由
@app.get("/orders/status-info")
def get_status_info():
    # 遍历所有枚举成员
    # OrderStatus.__members__ 是 {name: member} 的字典
    return {
        "all_statuses": [s.value for s in OrderStatus],
        "count": len(OrderStatus)
    }
\`\`\`

访问 \`/orders/pending\`：返回 \`{"status": "pending", "status_name": "pending", "message": "查询状态为 pending 的订单"}\`

访问 \`/orders/xyz\`：返回 422 错误，提示 \`xyz\` 不是合法状态。FastAPI 还会在文档里自动列出所有合法值。

枚举的好处：

1. **校验**：非法值直接被拦截
2. **文档**：\`/docs\` 里自动显示可选值
3. **可读性**：代码里用 \`OrderStatus.pending\` 比用 \`"pending"\` 字符串清晰
4. **重构友好**：改枚举值时编译器能帮你找引用

## 六、路径转换器（Starlette 路径类型）

FastAPI 底层用 Starlette，Starlette 用 \`starlette.routing\` 支持路径转换器。语法是 \`{参数名:转换器}\`，能改变路径参数的匹配方式。

### 支持的转换器

| 转换器 | 匹配规则 | 说明 |
|--------|---------|------|
| \`str\` | 匹配除 \`/\` 外的任意字符 | 默认行为 |
| \`int\` | 匹配整数 | \`0\`、\`42\`、\`-1\` |
| \`float\` | 匹配浮点数 | \`3.14\`、\`-0.5\` |
| \`path\` | 匹配包含 \`/\` 的任意路径 | 用于文件路径 |
| \`uuid\` | 匹配 UUID 格式 | 严格 UUID 格式 |

### Demo 7：path 转换器匹配带斜杠的路径

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 默认 str 转换器：不匹配 /
# 访问 /files/config/main.yaml 会 404，因为 / 把路径拆了
# 用 :path 转换器：匹配包含 / 的整段路径
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    # 访问 /files/config/main.yaml
    # file_path = "config/main.yaml"（包含斜杠）
    # 访问 /files/dir/sub/file.txt
    # file_path = "dir/sub/file.txt"
    return {"file_path": file_path}

# int 转换器：只匹配整数
@app.get("/posts/{post_id:int}")
def read_post(post_id: int):
    # 访问 /posts/42 → post_id=42
    # 访问 /posts/abc → 404（不是 422，因为路由根本没匹配上）
    return {"post_id": post_id}
\`\`\`

**重点区分**：\`:int\` 转换器和类型注解 \`int\` 的行为不同：

- \`{item_id}\` + \`item_id: int\`：路由匹配任意字符串，进函数后类型转换失败 → **422 错误**
- \`{item_id:int}\`：路由只匹配整数格式，非整数直接不匹配 → **404 错误**

实际开发中，类型注解更常用，因为 422 比 404 信息更明确（告诉用户"类型错了"而不是"没这个路由"）。\`path\` 转换器则很有用，是匹配带斜杠路径的唯一方式。

## 七、多路径参数

一个路由可以有多个路径参数，按顺序提取。

### Demo 8：多路径参数

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 两个路径参数：{username} 和 {item_id}
@app.get("/users/{username}/items/{item_id}")
def get_user_item(username: str, item_id: int):
    # 访问 /users/alice/items/42
    # username="alice"
    # item_id=42
    return {"username": username, "item_id": item_id}

# 三个路径参数：年、月、日
@app.get("/posts/{year}/{month}/{day}")
def get_posts_by_date(year: int, month: int, day: int):
    # 访问 /posts/2024/7/11
    # year=2024, month=7, day=11
    # 简单校验月份范围（更严格的校验用 Path 校验器，下章讲）
    if month < 1 or month > 12:
        return {"error": "月份非法"}
    return {"year": year, "month": month, "day": day}
\`\`\`

多路径参数让 URL 结构清晰：\`/users/alice/items/42\` 一眼能看出"用户 alice 的 42 号物品"。这是 RESTful 风格的精髓——URL 表达资源层级关系。

### 🆕 Demo 9：用户文章列表（多路径参数 + 类型混合）

这是一个更贴近实战的例子：用户有多篇文章，按年月归档查看。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 模拟文章数据库（按 username 索引）
articles_db = {
    "alice": [
        {"id": 1, "title": "FastAPI 入门", "year": 2024, "month": 7},
        {"id": 2, "title": "Python 进阶", "year": 2024, "month": 7},
        {"id": 3, "title": "Docker 实战", "year": 2024, "month": 6},
    ],
    "bob": [
        {"id": 4, "title": "Go 语言教程", "year": 2024, "month": 5},
    ],
}

# 路径：/users/{username}/articles/{year}/{month}
# 四个路径参数：username(str)、year(int)、month(int)
# 还混入了一个查询参数 limit 用于分页
@app.get("/users/{username}/articles/{year}/{month}")
def get_user_articles_by_month(
    username: str,        # 路径参数：用户名
    year: int,            # 路径参数：年份
    month: int,           # 路径参数：月份
    limit: int = 10       # 查询参数：每页数量（不在路径里）
):
    # 访问 /users/alice/articles/2024/7?limit=2
    # username="alice", year=2024, month=7, limit=2
    
    # 第 1 步：从数据库取出该用户的所有文章
    user_articles = articles_db.get(username, [])
    
    # 第 2 步：过滤出指定年月的文章
    # 列表推导式：遍历每篇文章，保留 year 和 month 都匹配的
    filtered = [
        a for a in user_articles
        if a["year"] == year and a["month"] == month
    ]
    
    # 第 3 步：应用 limit 分页
    # [:limit] 是切片语法，取前 limit 个
    paginated = filtered[:limit]
    
    return {
        "username": username,
        "year": year,
        "month": month,
        "total": len(filtered),
        "articles": paginated
    }
\`\`\`

访问 \`/users/alice/articles/2024/7\` 返回 alice 在 2024 年 7 月的两篇文章。这种"用户/资源/时间"的多层级路径是 RESTful 风格的典型用法。

### 🆕 Demo 10：用 Enum 实现资源类型路由

通过 Enum 限定路径参数的取值，让 API 路由本身就具备"自描述"能力。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
from enum import Enum

# 创建应用
app = FastAPI()

# 定义资源类型枚举
# 继承 str + Enum 让 FastAPI 知道这是字符串枚举
class ResourceType(str, Enum):
    article = "article"     # 文章
    video = "video"         # 视频
    audio = "audio"         # 音频
    document = "document"   # 文档

# 模拟资源数据库
resources_db = {
    "article": [{"id": 1, "title": "FastAPI 教程"}, {"id": 2, "title": "Python 进阶"}],
    "video": [{"id": 1, "title": "FastAPI 视频课"}],
    "audio": [{"id": 1, "title": "Python 播客"}],
    "document": [{"id": 1, "title": "API 文档"}],
}

# 路径参数 resource_type 被枚举限定
@app.get("/resources/{resource_type}")
def list_resources(resource_type: ResourceType):
    # 访问 /resources/article → resource_type=ResourceType.article
    # 访问 /resources/xyz → 422，因为 xyz 不在枚举里
    # FastAPI 在 /docs 里会自动列出可选值：article/video/audio/document
    
    # .value 拿到枚举对应的字符串值（如 "article"）
    resources = resources_db.get(resource_type.value, [])
    return {
        "type": resource_type.value,
        "count": len(resources),
        "data": resources
    }

# 获取单个资源
@app.get("/resources/{resource_type}/{resource_id}")
def get_resource(resource_type: ResourceType, resource_id: int):
    # 路径里有两个参数：resource_type(枚举) 和 resource_id(int)
    # 访问 /resources/article/1
    resources = resources_db.get(resource_type.value, [])
    # 查找指定 ID
    for r in resources:
        if r["id"] == resource_id:
            return r
    return {"error": f"未找到 {resource_type.value} ID={resource_id}"}
\`\`\`

枚举作为路径参数的好处：用户传非法值时直接 422 拦截，避免脏数据进入业务逻辑；文档自动列出可选值，前端不用额外查文档。

### 🆕 Demo 11：RESTful 风格的 CRUD 路由设计

一个完整的"用户管理"接口，演示路径参数在不同 HTTP 方法下的复用。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException
from fastapi import FastAPI, HTTPException

# 创建应用
app = FastAPI()

# 模拟用户数据库
users_db = {
    1: {"id": 1, "name": "Alice", "email": "alice@example.com"},
    2: {"id": 2, "name": "Bob", "email": "bob@example.com"},
}
# 用于生成下一个用户 ID
next_id = 3

# GET /users —— 列表（没有路径参数）
@app.get("/users")
def list_users():
    # 直接返回所有用户
    # list(users_db.values()) 把字典的值转成列表
    return {"users": list(users_db.values())}

# GET /users/{user_id} —— 详情（路径参数定位单个用户）
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # user_id: int 自动把 URL 里的 "1" 转成 int 1
    # users_db.get(user_id) 用 ID 查找，找不到返回 None
    user = users_db.get(user_id)
    if user is None:
        # 抛 404 异常，HTTPException 是 FastAPI 的异常类
        # detail 是返回给客户端的错误信息
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    return user

# PUT /users/{user_id} —— 更新（路径参数定位 + body 传新数据）
@app.put("/users/{user_id}")
def update_user(user_id: int, name: str = None, email: str = None):
    # 这里 name 和 email 用查询参数演示（实际项目应该用 Pydantic body）
    user = users_db.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 局部更新：只更新传了的字段
    if name is not None:
        user["name"] = name
    if email is not None:
        user["email"] = email
    return {"msg": "更新成功", "user": user}

# DELETE /users/{user_id} —— 删除（路径参数定位）
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    # pop 同时取出并删除
    deleted = users_db.pop(user_id)
    return {"msg": "删除成功", "deleted": deleted}
\`\`\`

注意看：\`/users/{user_id}\` 这个路径模板被 \`GET\`、\`PUT\`、\`DELETE\` 三个方法复用。同一个 URL，不同 HTTP 方法对应不同操作——这就是 RESTful 的精髓。

## 八、路径参数的最佳实践

### 1. 用复数名词表示资源集合

\`\`\`python
# ✅ 推荐：复数
@app.get("/users/{user_id}")
def get_user(user_id: int): ...

# ❌ 不推荐：单数
@app.get("/user/{user_id}")
def get_user(user_id: int): ...
\`\`\`

复数 \`/users\` 表示"用户集合"，\`/users/42\` 表示"集合里的 42 号"，语义清晰。

### 2. 参数名用蛇形小写

\`\`\`python
# ✅ 推荐：蛇形
@app.get("/users/{user_id}")
def get_user(user_id: int): ...

# ❌ 不推荐：驼峰（URL 不区分大小写容易出问题）
@app.get("/users/{userId}")
def get_user(userId: int): ...
\`\`\`

### 3. ID 用 int 或 UUID，别用 str

\`\`\`python
# ✅ 推荐：明确类型
@app.get("/users/{user_id:int}")
def get_user(user_id: int): ...

# ❌ 不推荐：裸 str 容易让非法输入进入业务逻辑
@app.get("/users/{user_id}")
def get_user(user_id: str): ...
\`\`\`

### 4. 嵌套资源用多路径参数表达层级

\`\`\`python
# ✅ 推荐：层级清晰
@app.get("/users/{user_id}/posts/{post_id}")
def get_user_post(user_id: int, post_id: int): ...

# ❌ 不推荐：扁平化，丢失层级关系
@app.get("/posts/{post_id}")
def get_post(post_id: int): ...
# （除非确实不需要 user_id 上下文）
\`\`\`

### 5. 避免把动作放在路径里

\`\`\`python
# ❌ 不推荐：动词
@app.get("/users/{user_id}/get")
@app.post("/users/{user_id}/delete")

# ✅ 推荐：用 HTTP 方法表达动作
@app.get("/users/{user_id}")      # 获取
@app.delete("/users/{user_id}")   # 删除
\`\`\`

## 九、常见错误和避坑指南

### 坑 1：参数名拼错

\`\`\`python
# ❌ 错误：路由写 item_id，函数写 itemid
@app.get("/items/{item_id}")
def read_item(itemid: int):  # 拼写不一致
    return {"itemid": itemid}
\`\`\`

报错：\`fastapi.exceptions.FastAPIError: "itemid" is not in path.\`

**避坑**：复制粘贴路径里的参数名，别手敲。

### 坑 2：固定路径被动态路径"吃掉"

前面讲过的顺序问题，再强调一次：

\`\`\`python
# ❌ 错误顺序
@app.get("/users/{user_id}")  # 先定义动态
def get_user(user_id: int): ...

@app.get("/users/me")  # 这个永远不会被匹配
def get_me(): ...
\`\`\`

**避坑**：固定路径永远放前面。

### 坑 3：用 path 转换器时忘加类型注解

\`\`\`python
# ❌ 没有类型注解，file_path 是 str，但容易让人困惑
@app.get("/files/{file_path:path}")
def read_file(file_path):
    return {"file_path": file_path}

# ✅ 加上类型注解更清晰
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}
\`\`\`

### 坑 4：以为路径参数能接收空值

路径参数不能为空，因为它在路径里。访问 \`/items/\`（item_id 为空）会 404，不会进入函数。如果要支持"不带 ID"的情况，单独定义一个路由：

\`\`\`python
# 处理 /items（无 ID）
@app.get("/items")
def list_items(): ...

# 处理 /items/42（有 ID）
@app.get("/items/{item_id}")
def get_item(item_id: int): ...
\`\`\`

### 坑 5：URL 编码的字符

路径参数里的特殊字符会被 URL 编码。比如空格变 \`%20\`，中文被编码。FastAPI 会自动解码：

\`\`\`python
@app.get("/search/{keyword}")
def search(keyword: str):
    # 访问 /search/hello%20world
    # keyword = "hello world"（已解码）
    # 访问 /search/%E4%BD%A0%E5%A5%BD
    # keyword = "你好"
    return {"keyword": keyword}
\`\`\`

不用手动解码，FastAPI/Starlette 已经处理好了。

## 十、动手实验

### 实验 1：基础类型转换体验

启动服务后用浏览器或 curl 测试：

\`\`\`bash
# 启动服务（把 Demo 2 保存为 main.py）
uvicorn main:app --reload

# 测试正常整数
curl http://127.0.0.1:8000/items/42
# 期望返回：{"item_id":42}

# 测试非法输入
curl http://127.0.0.1:8000/items/abc
# 期望返回：422 错误

# 打开交互式文档
open http://127.0.0.1:8000/docs
\`\`\`

观察 \`/docs\` 文档里对参数类型的描述，体会类型注解对文档的影响。

### 实验 2：路由顺序问题复现

把 Demo 5 的路由顺序反过来：

\`\`\`python
# ❌ 故意写错顺序
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

@app.get("/users/me")
def read_current_user():
    return {"user": "current user"}
\`\`\`

\`\`\`bash
# 访问 /users/me
curl http://127.0.0.1:8000/users/me
# 期望：返回 422 错误，因为 "me" 被当成 user_id 然后转 int 失败
\`\`\`

观察错误响应里的 \`loc\` 字段，理解"先注册先匹配"的规则。

### 实验 3：用 Enum 实现一个天气查询接口

参考下面需求自己实现：

- 路径 \`/weather/{city}\`，city 是 \`Enum\`：\`beijing\`、\`shanghai\`、\`guangzhou\`
- 返回该城市的模拟天气数据
- 访问非法城市返回 422

\`\`\`bash
# 测试合法城市
curl http://127.0.0.1:8000/weather/beijing

# 测试非法城市
curl http://127.0.0.1:8000/weather/paris
# 期望：422
\`\`\`

### 实验 4：实现多层级嵌套资源

挑战题：实现 \`/organizations/{org_id}/teams/{team_id}/members/{user_id}\`，三层嵌套，返回对应用户。

提示：

\`\`\`python
@app.get("/organizations/{org_id}/teams/{team_id}/members/{user_id}")
def get_member(org_id: int, team_id: int, user_id: int):
    # 三个路径参数，依次定位：组织 → 团队 → 成员
    ...
\`\`\`

完成后访问 \`/docs\`，看看文档是怎么展示三层级路径的。

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 基本语法 | \`{参数名}\` 占位，函数同名参数接收 |
| 类型转换 | 用类型注解（int、float、bool、UUID 等） |
| 参数映射 | 路径里的是路径参数，不在路径里的是查询参数 |
| 路径顺序 | 固定路径放前面，动态路径放后面 |
| Enum | 限制取值范围，自动生成文档 |
| 路径转换器 | \`:path\` 匹配带斜杠路径，\`:int\` 只匹配整数 |
| 多路径参数 | 按顺序提取，表达资源层级 |

路径参数是 RESTful API 的基石。掌握它之后，你已经能写出"像样"的资源接口了。下一章我们看查询参数——它让接口具备"过滤、分页、排序"的能力。
`,
  },

  // ============================================================
  // 第 2 章：查询参数
  // ============================================================
  {
    id: "fa-query",
    group: "路径与查询参数",
    icon: "🔍",
    title: "查询参数",
    content: `# 查询参数

## 什么是查询参数

URL 里 \`?\` 后面的部分就是查询参数，格式是 \`key=value\`，多个参数用 \`&\` 连接：

\`\`\`
GET /items?skip=0&limit=10&q=apple
GET /users?role=admin&active=true
GET /posts?sort=created_at&order=desc&page=2&page_size=20
\`\`\`

### 🌰 生活类比：查询参数就像淘宝的筛选条件

把 URL 想象成淘宝购物页面：

- \`/products\` 是"商品总目录"（路径参数定位资源集合）
- \`?category=phone\` 是"只看手机分类"（筛选）
- \`&min_price=1000&max_price=5000\` 是"价格区间"（范围筛选）
- \`&sort=price&order=asc\` 是"按价格升序"（排序）
- \`&page=2&page_size=20\` 是"第 2 页，每页 20 个"（分页）

筛选条件可加可不加，**不写就默认看全部**——这正是查询参数"可省略"的特性。而路径参数就像"淘宝主目录"本身，不能不选。

查询参数的作用是**对资源进行过滤、排序、分页**，和路径参数分工明确：

- 路径参数：定位"哪个资源"（\`/items/42\`）
- 查询参数：描述"要什么样的资源"（\`/items?status=active&limit=10\`）

查询参数都是可选的，不传就用默认值。这是它和路径参数最大的区别——路径参数不能省略，查询参数可以。

## 一、基本查询参数

FastAPI 怎么识别查询参数？规则很简单：**函数参数里，不在路径模板中的就是查询参数**。

### Demo 1：最基础的查询参数

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 模拟一个商品列表
items_db = [
    {"id": 1, "name": "苹果", "price": 5.0},
    {"id": 2, "name": "香蕉", "price": 3.5},
    {"id": 3, "name": "橙子", "price": 4.0},
    {"id": 4, "name": "葡萄", "price": 8.0},
    {"id": 5, "name": "西瓜", "price": 2.0},
]

# 路径里没有 skip 和 limit，所以它们是查询参数
# 给了默认值，所以是可选的
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10):
    # 访问 /items → skip=0, limit=10
    # 访问 /items?skip=2 → skip=2, limit=10
    # 访问 /items?skip=1&limit=2 → skip=1, limit=2
    # 切片：从 skip 开始，取 limit 个
    return items_db[skip : skip + limit]
\`\`\`

访问测试：

| URL | skip | limit | 返回 |
|-----|------|-------|------|
| \`/items\` | 0 | 10 | 全部 5 个 |
| \`/items?skip=2\` | 2 | 10 | 第 3、4、5 个 |
| \`/items?limit=2\` | 0 | 2 | 前 2 个 |
| \`/items?skip=1&limit=2\` | 1 | 2 | 第 2、3 个 |

## 二、可选查询参数（默认值、None）

查询参数有三种"可选性"：

1. **有默认值**：可省略，省略时用默认值
2. **默认 None**：可省略，省略时是 \`None\`（表示"没传"）
3. **必选**：没有默认值，必须传

### Demo 2：三种可选性

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

@app.get("/search")
def search(
    q: str | None = None,    # 可选，默认 None（表示没传）
    category: str = "all",   # 可选，默认 "all"
    page: int = 1            # 可选，默认 1
):
    # 访问 /search → q=None, category="all", page=1
    # 访问 /search?q=apple → q="apple"
    # 访问 /search?q=apple&category=fruit → 全部自定义
    result = {"category": category, "page": page}
    # 只有传了 q 才加到结果里
    if q:
        result["q"] = q
    return result

# 必选查询参数：没有默认值
@app.get("/required")
def required_search(keyword: str):
    # 访问 /required → 422 错误，缺少 keyword
    # 访问 /required?keyword=hello → 正常
    return {"keyword": keyword}
\`\`\`

访问 \`/required\`（不传 keyword）返回 422：

\`\`\`json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["query", "keyword"],
      "msg": "Field required",
      "input": null,
      "url": "..."
    }
  ]
}
\`\`\`

注意 \`loc\` 是 \`["query", "keyword"]\`，表示错误发生在查询参数 \`keyword\` 上。

**避坑**：必选查询参数不常用，因为它让 URL 必须带某个参数，降低了灵活性。大多数情况下用 \`None\` 默认值，在函数里判断"是否传了"。

## 三、查询参数类型转换

和路径参数一样，查询参数也支持类型注解，FastAPI 会自动转换。

### Demo 3：各种类型的查询参数

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 typing 导入 List（Python 3.9+ 可以直接用 list）
from typing import List

# 创建应用
app = FastAPI()

@app.get("/filter")
def filter_items(
    min_price: float = 0.0,           # 浮点数
    max_price: float = 9999.0,        # 浮点数
    in_stock: bool = True,            # 布尔值
    tags: List[str] | None = None     # 列表：?tags=a&tags=b
):
    # 访问 /filter?min_price=1.5&max_price=10&in_stock=false&tags=fruit&tags=red
    # min_price=1.5（float）
    # max_price=10.0（float）
    # in_stock=False（bool）
    # tags=["fruit", "red"]（list）
    return {
        "min_price": min_price,
        "max_price": max_price,
        "in_stock": in_stock,
        "tags": tags
    }
\`\`\`

注意列表参数的传法：\`?tags=fruit&tags=red\`，同一个 key 传多次，FastAPI 会收集成列表 \`["fruit", "red"]\`。

## 四、bool 类型自动转换

bool 查询参数的转换规则值得单独说，因为它很容易踩坑。FastAPI（Pydantic）会把以下值转成 \`True\`：

- \`"true"\`、\`"True"\`、\`"TRUE"\`
- \`"1"\`、\`"yes"\`、\`"on"\`、\`"y"\`、\`"t"\`

以下值转成 \`False\`：

- \`"false"\`、\`"False"\`、\`"FALSE"\`
- \`"0"\`、\`"no"\`、\`"off"\`、\`"n"\`、\`"f"\`

### Demo 4：bool 转换的陷阱

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

@app.get("/toggle")
def toggle(enabled: bool):
    # 访问 /toggle?enabled=true → enabled=True
    # 访问 /toggle?enabled=1    → enabled=True
    # 访问 /toggle?enabled=yes  → enabled=True
    # 访问 /toggle?enabled=false → enabled=False
    # 访问 /toggle?enabled=0    → enabled=False
    return {"enabled": enabled, "type": type(enabled).__name__}

# ⚠️ 注意：如果用 str 类型接收，"false" 是真值字符串！
@app.get("/toggle-str")
def toggle_str(enabled: str):
    # 访问 /toggle-str?enabled=false
    # enabled = "false"（字符串）
    # if enabled: → True（非空字符串都是真值）
    if enabled:
        return {"msg": "enabled 是真值字符串"}
    return {"msg": "enabled 是空字符串"}
\`\`\`

**避坑**：如果你写 \`if enabled:\` 判断布尔语义，用 \`bool\` 类型注解，别用 \`str\`。否则 \`"false"\` 这个字符串会被当成 \`True\`，逻辑就反了。

## 五、多个查询参数

实际接口往往有多个查询参数，分别承担不同职责。

### Demo 5：完整的分页 + 过滤 + 排序接口

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 typing 导入 Optional（兼容旧写法）
from typing import Optional

# 创建应用
app = FastAPI()

# 模拟商品数据
products = [
    {"id": 1, "name": "iPhone", "price": 6999, "category": "phone"},
    {"id": 2, "name": "iPad", "price": 3999, "category": "tablet"},
    {"id": 3, "name": "MacBook", "price": 12999, "category": "laptop"},
    {"id": 4, "name": "AirPods", "price": 1299, "category": "audio"},
    {"id": 5, "name": "iPhone Case", "price": 199, "category": "accessory"},
]

@app.get("/products")
def list_products(
    # 分页参数
    page: int = 1,                    # 页码，从 1 开始
    page_size: int = 10,              # 每页数量
    # 过滤参数
    category: Optional[str] = None,   # 按分类过滤
    min_price: Optional[float] = None, # 最低价格
    max_price: Optional[float] = None, # 最高价格
    # 排序参数
    sort_by: str = "id",              # 排序字段
    order: str = "asc"                # 排序方向：asc/desc
):
    # 第 1 步：复制数据，避免修改原列表
    result = list(products)
    
    # 第 2 步：过滤
    if category:
        # 只保留指定分类
        result = [p for p in result if p["category"] == category]
    if min_price is not None:
        # 过滤最低价
        result = [p for p in result if p["price"] >= min_price]
    if max_price is not None:
        # 过滤最高价
        result = [p for p in result if p["price"] <= max_price]
    
    # 第 3 步：排序
    # reverse=True 表示降序
    reverse = (order == "desc")
    # 用 lambda 取排序字段
    result.sort(key=lambda p: p.get(sort_by, 0), reverse=reverse)
    
    # 第 4 步：分页
    # page=1 → 从 0 开始
    # page=2 → 从 page_size 开始
    start = (page - 1) * page_size
    end = start + page_size
    paginated = result[start:end]
    
    # 返回带元数据的响应
    return {
        "data": paginated,            # 当前页数据
        "total": len(result),         # 过滤后总数
        "page": page,                 # 当前页码
        "page_size": page_size,       # 每页数量
        # total_pages 计算公式：(total + page_size - 1) // page_size
        # 这是"向上取整除法"：当 total 不能被 page_size 整除时，多出的一页也要算
        # 例如 total=23, page_size=10 → (23+9)//10 = 32//10 = 3 页
        # 等价于 math.ceil(total / page_size)，但用整数运算避免浮点误差
        "total_pages": (len(result) + page_size - 1) // page_size  # 总页数
    }
\`\`\`

访问示例：

- \`/products\` —— 第 1 页，全部商品
- \`/products?category=phone\` —— 只看手机
- \`/products?min_price=1000&max_price=5000\` —— 价格区间过滤
- \`/products?sort_by=price&order=desc\` —— 按价格降序
- \`/products?page=2&page_size=2\` —— 第 2 页，每页 2 个

## 六、查询参数与路径参数混用

路径参数和查询参数可以自由组合，这是最常见的形式。

### Demo 6：路径 + 查询混用

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# {user_id} 是路径参数，detail 和 q 是查询参数
@app.get("/users/{user_id}/items")
def get_user_items(
    user_id: int,            # 路径参数（在路径里）
    q: str | None = None,    # 查询参数（不在路径里）
    detail: bool = False     # 查询参数
):
    # 访问 /users/42/items?q=apple&detail=true
    # user_id=42（路径）
    # q="apple"（查询）
    # detail=True（查询）
    result = {"user_id": user_id, "items": []}
    if q:
        result["q"] = q
    if detail:
        result["detail"] = "显示详细信息"
    return result
\`\`\`

规则总结：
- 路径模板 \`/users/{user_id}/items\` 里有 \`user_id\` → 路径参数
- 函数参数 \`q\` 和 \`detail\` 不在路径里 → 查询参数
- \`user_id\` 没有默认值，但因为它是路径参数，"必传"由路径决定

### 🆕 Demo 7：多字段组合过滤的搜索接口

实战中常见的需求：根据多个条件组合筛选商品。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 模拟商品数据库（带更多字段）
products_db = [
    {"id": 1, "name": "iPhone 15", "price": 6999, "category": "phone", "brand": "apple", "in_stock": True},
    {"id": 2, "name": "Galaxy S24", "price": 5999, "category": "phone", "brand": "samsung", "in_stock": True},
    {"id": 3, "name": "Mi 14", "price": 3999, "category": "phone", "brand": "xiaomi", "in_stock": False},
    {"id": 4, "name": "iPad Pro", "price": 7999, "category": "tablet", "brand": "apple", "in_stock": True},
    {"id": 5, "name": "MacBook Air", "price": 8999, "category": "laptop", "brand": "apple", "in_stock": True},
    {"id": 6, "name": "AirPods Pro", "price": 1999, "category": "audio", "brand": "apple", "in_stock": True},
]

@app.get("/products/search")
def search_products(
    # 关键词搜索：在 name 字段里模糊匹配
    keyword: str | None = None,
    # 多个过滤条件
    category: str | None = None,        # 按分类
    brand: str | None = None,           # 按品牌
    min_price: float | None = None,     # 最低价
    max_price: float | None = None,     # 最高价
    in_stock: bool | None = None,       # 库存状态
):
    # 第 1 步：从完整列表开始
    result = list(products_db)
    
    # 第 2 步：逐个应用过滤条件
    # 关键词搜索：用 in 判断子串（实际项目用数据库 LIKE 或全文索引）
    if keyword:
        # keyword.lower() 转小写，实现大小写不敏感搜索
        kw = keyword.lower()
        result = [p for p in result if kw in p["name"].lower()]
    
    # 分类过滤
    if category:
        result = [p for p in result if p["category"] == category]
    
    # 品牌过滤
    if brand:
        result = [p for p in result if p["brand"] == brand]
    
    # 价格区间
    if min_price is not None:
        result = [p for p in result if p["price"] >= min_price]
    if max_price is not None:
        result = [p for p in result if p["price"] <= max_price]
    
    # 库存过滤
    if in_stock is not None:
        # in_stock=True 只看有货的，False 只看缺货的
        result = [p for p in result if p["in_stock"] == in_stock]
    
    return {
        "count": len(result),
        "data": result
    }
\`\`\`

测试访问：

\`\`\`bash
# 搜索名字带 "pro" 的商品
curl "http://127.0.0.1:8000/products/search?keyword=pro"

# 只看苹果品牌且有货的
curl "http://127.0.0.1:8000/products/search?brand=apple&in_stock=true"

# 价格区间 + 分类
curl "http://127.0.0.1:8000/products/search?category=phone&min_price=4000&max_price=7000"
\`\`\`

注意：URL 里有特殊字符（如 \`&\`）时，bash 里要用双引号包起来。

### 🆕 Demo 8：多字段排序接口

支持按多个字段排序，例如"先按价格升序，价格相同的再按 ID 降序"。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 复用前面的 products_db
products_db = [
    {"id": 1, "name": "iPhone 15", "price": 6999, "sales": 100},
    {"id": 2, "name": "Galaxy S24", "price": 5999, "sales": 80},
    {"id": 3, "name": "Mi 14", "price": 3999, "sales": 80},
    {"id": 4, "name": "iPad Pro", "price": 7999, "sales": 50},
    {"id": 5, "name": "MacBook Air", "price": 8999, "sales": 30},
]

@app.get("/products")
def list_products(
    # sort 接受多字段排序字符串，格式：field:order,field:order
    # 例如：sort=price:asc,sales:desc 表示先按价格升序，价格相同按销量降序
    # 默认按 id:asc
    sort: str = "id:asc"
):
    # 第 1 步：解析 sort 参数
    # sort.split(",") 把 "price:asc,sales:desc" 拆成 ["price:asc", "sales:desc"]
    sort_rules = []
    for rule in sort.split(","):
        rule = rule.strip()
        if not rule:
            continue
        # 拆分 field:order
        if ":" in rule:
            field, order = rule.split(":", 1)
            sort_rules.append((field.strip(), order.strip().lower()))
        else:
            # 只有字段没有方向，默认升序
            sort_rules.append((rule, "asc"))
    
    # 第 2 步：复制数据
    result = list(products_db)
    
    # 第 3 步：按多个字段排序
    # Python 的 sort 是稳定排序，可以从后往前依次排序
    # 这样最后排的字段是主排序键
    # 例如要按 price asc, sales desc 排序：
    #   先按 sales desc 排序，再按 price asc 排序
    #   最终效果：先看 price，price 相同的按 sales
    for field, order in reversed(sort_rules):
        # reverse=True 表示降序
        reverse = (order == "desc")
        # key=lambda p: p.get(field, 0) 取字段值，不存在用 0 兜底
        result.sort(key=lambda p: p.get(field, 0), reverse=reverse)
    
    return {
        "sort": sort_rules,
        "count": len(result),
        "data": result
    }
\`\`\`

测试访问：

\`\`\`bash
# 单字段排序：按价格升序
curl "http://127.0.0.1:8000/products?sort=price:asc"

# 多字段排序：先按销量降序，销量相同按 ID 升序
curl "http://127.0.0.1:8000/products?sort=sales:desc,id:asc"
\`\`\`

这种"逗号分隔多字段排序"是 GitHub API、Stripe API 等业界主流设计风格。

### 🆕 Demo 9：搜索接口（带高亮和分页）

实战中的搜索接口通常需要：关键词搜索 + 分页 + 返回高亮信息。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 模拟文章数据库
articles_db = [
    {"id": 1, "title": "FastAPI 入门教程", "content": "FastAPI 是一个现代化的 Python Web 框架..."},
    {"id": 2, "title": "Python 进阶指南", "content": "Python 是一门优雅的编程语言..."},
    {"id": 3, "title": "FastAPI 高级用法", "content": "学习 FastAPI 的依赖注入和中间件..."},
    {"id": 4, "title": "Docker 实战", "content": "用 Docker 容器化 Python 应用..."},
    {"id": 5, "title": "FastAPI 与 Pydantic", "content": "Pydantic 是 FastAPI 的数据校验核心..."},
]

@app.get("/articles/search")
def search_articles(
    # 必须传 keyword（用 None 默认 + 函数判断的方式，比必选参数更灵活）
    keyword: str | None = None,
    # 分页参数
    page: int = 1,
    page_size: int = 10,
    # 是否高亮关键词
    highlight: bool = True
):
    # 第 1 步：处理关键词
    if not keyword:
        # 没传关键词，返回全部
        result = list(articles_db)
    else:
        # 在 title 和 content 里搜索关键词（大小写不敏感）
        kw = keyword.lower()
        result = []
        for a in articles_db:
            # 检查 title 或 content 是否包含关键词
            if kw in a["title"].lower() or kw in a["content"].lower():
                # 复制一份，避免污染原数据
                item = dict(a)
                # 如果开启高亮，把关键词用 <em> 包起来
                if highlight:
                    # str.replace(old, new) 字符串替换
                    # 注意这里没做大小写不敏感替换，实际项目用 re.sub
                    item["title"] = item["title"].replace(
                        keyword, f"<em>{keyword}</em>"
                    )
                result.append(item)
    
    # 第 2 步：分页
    total = len(result)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = result[start:end]
    
    # 第 3 步：返回带元数据的结果
    return {
        "keyword": keyword,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
        "data": paginated
    }
\`\`\`

测试：

\`\`\`bash
# 搜索 FastAPI 相关文章
curl "http://127.0.0.1:8000/articles/search?keyword=FastAPI&page=1&page_size=2"

# 不高亮
curl "http://127.0.0.1:8000/articles/search?keyword=Python&highlight=false"
\`\`\`

返回结果里 \`title\` 字段的关键词会被 \`<em>\` 标签包起来，前端可以用 CSS 高亮显示。

## 七、查询参数的最佳实践

### 1. 分页用 page + page_size 还是 offset + limit？

两种风格都常见：

\`\`\`python
# 风格 A：page + page_size（页码风格）
# 适合面向用户/前端的接口，"第 2 页"比"从第 10 条开始"更直观
@app.get("/items")
def list_items(page: int = 1, page_size: int = 10):
    # page=1 时 offset=0，page=2 时 offset=page_size，以此类推
    # 公式：offset = (page - 1) * page_size
    offset = (page - 1) * page_size
    # 列表切片：从 offset 开始取 page_size 个
    return items[offset : offset + page_size]

# 风格 B：offset + limit（偏移风格）
# 适合面向数据库/内部 API，直接对应 SQL 的 OFFSET ... LIMIT ...
@app.get("/items")
def list_items(offset: int = 0, limit: int = 10):
    # offset 表示跳过前 N 条，limit 表示取多少条
    # 直接切片，无需转换
    return items[offset : offset + limit]
\`\`\`

选择建议：
- **面向用户/前端**：用 page + page_size，更直观（"第 2 页"比"从第 10 条开始"好懂）
- **面向数据库/内部 API**：用 offset + limit，直接对应 SQL

### 2. 排序参数支持多字段

\`\`\`python
# 单字段排序
@app.get("/items")
def list_items(sort_by: str = "id", order: str = "asc"):
    ...

# 多字段排序：?sort=-price,created_at
# - 号表示降序，无前缀表示升序
@app.get("/items2")
def list_items2(sort: str = "id"):
    # sort = "-price,created_at"
    # 拆分成多个排序规则
    sort_fields = []
    for field in sort.split(","):
        field = field.strip()
        if field.startswith("-"):
            # 降序
            sort_fields.append((field[1:], True))
        else:
            # 升序
            sort_fields.append((field, False))
    return {"sort_fields": sort_fields}
\`\`\`

### 3. 过滤参数用 None 而不是空字符串表示"不过滤"

\`\`\`python
# ✅ 推荐：None 表示不过滤
@app.get("/items")
def list_items(category: str | None = None):
    if category is not None:  # 明确：传了 category 才过滤
        ...

# ❌ 不推荐：空字符串表示不过滤
@app.get("/items2")
def list_items2(category: str = ""):
    if category:  # 空字符串是假值，但这种写法不直观
        ...
\`\`\`

### 4. 别让查询参数太多

如果一个接口有 10 个以上查询参数，考虑：
- 拆分成多个接口（\`/items/search\` 专门做搜索）
- 用 POST + body 传复杂查询条件
- 用 Pydantic 模型 + \`Depends\` 组织参数

### 5. 布尔参数用 bool，别用 str

前面讲过，\`"false"\` 字符串是真值。用 \`bool\` 类型让 FastAPI 帮你转换。

## 八、常见错误和避坑指南

### 坑 1：参数顺序错误

Python 语法要求：**有默认值的参数必须在无默认值的参数后面**。

\`\`\`python
# ❌ 错误：有默认值的 q 在无默认值的 item_id 前面
@app.get("/items/{item_id}")
def read_item(q: str = "default", item_id: int):  # 语法错误
    ...

# ✅ 正确：无默认值的在前
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = "default"):  # 正确
    ...
\`\`\`

但有个例外：FastAPI 不在乎参数顺序，它只看"参数名在不在路径里"。所以下面这样也行：

\`\`\`python
# 这也能运行，但不推荐，容易让人困惑
@app.get("/items/{item_id}")
def read_item(q: str = "default", item_id: int):
    ...
\`\`\`

**避坑**：虽然能运行，但保持"路径参数在前，查询参数在后"的习惯，可读性更好。

### 坑 2：必选查询参数和可选查询参数混用

\`\`\`python
# keyword 必选，page 可选
# 访问 /search → 422（缺 keyword）
# 访问 /search?keyword=apple → 正常
@app.get("/search")
def search(keyword: str, page: int = 1):
    return {"keyword": keyword, "page": page}
\`\`\`

这本身不是错误，但要清楚：必选查询参数会让 URL 必须带这个参数。如果前端忘了传，直接 422。

### 坑 3：List 参数的传法

\`\`\`python
# 从 typing 导入 List（Python 3.9+ 可以直接用 list[str]）
from typing import List

# List[str] 表示参数是字符串列表
# URL 传法：?tags=a&tags=b（同一个 key 传多次）
# FastAPI 会自动收集成 ["a", "b"]
@app.get("/items")
def list_items(tags: List[str] = []):
    # 注意：默认值用 [] 是可变默认值陷阱（见下文坑 4）
    # 实际项目中推荐用 None 再在函数里初始化
    return {"tags": tags}
\`\`\`

访问 \`/items?tags=a&tags=b\` → \`tags=["a", "b"]\`

访问 \`/items?tags=a,b\` → \`tags=["a,b"]\`（整体当成一个字符串，不是列表）

**避坑**：列表参数必须用 \`key=value&key=value\` 的形式传，不能用逗号。如果想要逗号分隔，自己解析：

\`\`\`python
@app.get("/items")
def list_items(tags: str = ""):
    # tags = "a,b,c"（前端用逗号拼接传过来）
    # tags.split(",") 按逗号拆分成 ["a", "b", "c"]
    # t.strip() 去除每个元素两端的空格（防止 "a, b, c" 带空格）
    # if t.strip() 过滤掉空字符串（防止 "a,,b" 产生空元素）
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    # 返回解析后的列表
    return {"tags": tag_list}
\`\`\`

### 坑 4：可变默认值

\`\`\`python
# ❌ 错误：用可变对象做默认值
@app.get("/items")
def list_items(tags: list = []):  # 默认值是共享的列表！
    tags.append("default")  # 会污染默认值
    return {"tags": tags}

# ✅ 正确：用 None，在函数里创建
@app.get("/items")
def list_items(tags: list | None = None):
    if tags is None:
        tags = []
    return {"tags": tags}
\`\`\`

这是 Python 的经典坑，不是 FastAPI 特有，但在写接口时容易犯。

### 坑 5：查询参数名冲突

\`\`\`python
# ❌ 错误：参数名和 Python 关键字冲突
@app.get("/items")
def list_items(class: str = "all"):  # class 是关键字
    ...

# ✅ 解决：用别名（下章讲 Query 的 alias）
from fastapi import Query

@app.get("/items")
def list_items(
    category: str = Query("all", alias="class")  # URL 用 class，代码用 category
):
    return {"category": category}
\`\`\`

访问 \`/items?class=fruit\`，函数里 \`category="fruit"\`。

### 坑 6：URL 里的特殊字符未编码

\`\`\`bash
# ❌ 错误：直接传中文，可能乱码
curl http://127.0.0.1:8000/search?q=苹果

# ✅ 正确：URL 编码
curl http://127.0.0.1:8000/search?q=%E8%8B%B9%E6%9E%9C

# 浏览器会自动编码，但 curl 默认不编码
# 可以用 --data-urlencode
curl -G "http://127.0.0.1:8000/search" --data-urlencode "q=苹果"
\`\`\`

FastAPI 收到请求后会自动解码，函数里 \`q="苹果"\`。

## 九、动手实验

### 实验 1：实现一个完整的分页接口

需求：实现 \`/books\` 接口，支持：

- \`page\`：页码，默认 1
- \`page_size\`：每页数量，默认 10，最大 100
- 返回数据 + 总数 + 总页数

\`\`\`python
# 模拟 50 本书的数据
books_db = [{"id": i, "title": f"Book {i}"} for i in range(1, 51)]

@app.get("/books")
def list_books(page: int = 1, page_size: int = 10):
    # 自己实现：分页 + 返回元数据
    ...
\`\`\`

\`\`\`bash
# 测试
curl "http://127.0.0.1:8000/books?page=2&page_size=5"
# 期望返回 5 本书，total=50，total_pages=10
\`\`\`

### 实验 2：组合过滤 + 排序 + 分页

挑战题：实现 \`/products\` 接口，同时支持：

- 按分类过滤（\`category\`）
- 按价格区间过滤（\`min_price\`、\`max_price\`）
- 按任意字段排序（\`sort_by\`、\`order\`）
- 分页（\`page\`、\`page_size\`）

提示：参考 Demo 5，但要保证过滤 → 排序 → 分页 的顺序（顺序错了结果就错了）。

### 实验 3：实现一个简单的搜索建议接口

需求：实现 \`/suggest\` 接口，根据用户输入的关键词返回匹配建议。

\`\`\`bash
# 用户输入 "py"，返回所有以 "py" 开头的词
curl "http://127.0.0.1:8000/suggest?q=py"
# 期望返回：{"suggestions": ["python", "pydantic", "pytest"]}
\`\`\`

参考实现：

\`\`\`python
# 候选词库
all_words = ["python", "pydantic", "pytest", "fastapi", "django", "flask"]

@app.get("/suggest")
def suggest(q: str = ""):
    # 用 startswith 做前缀匹配
    suggestions = [w for w in all_words if w.startswith(q.lower())]
    # 限制最多返回 10 个
    return {"suggestions": suggestions[:10]}
\`\`\`

### 实验 4：探索 \`/docs\` 文档

启动服务后访问 \`http://127.0.0.1:8000/docs\`：

1. 观察每个查询参数的"默认值"列
2. 点击 \`Try it out\`，填参数后点 \`Execute\` 看响应
3. 故意传非法值（比如 \`page=-1\`），观察 422 错误响应的 \`loc\` 字段

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 识别规则 | 不在路径里的函数参数就是查询参数 |
| 可选性 | 有默认值=可选，无默认值=必选，None=可选 |
| 类型转换 | 支持 int、float、bool、list 等 |
| bool 转换 | "true"/"1"/"yes" → True，注意别用 str 判断 |
| 列表参数 | \`?tags=a&tags=b\` 形式传 |
| 混用 | 路径参数 + 查询参数自由组合 |
| 最佳实践 | 分页、过滤、排序各司其职 |

查询参数让接口具备"筛选"能力。但光有类型转换还不够——你要限制价格不能为负、字符串长度、枚举取值等，这就需要下一章的 **Path/Query 校验器**。
`,
  },

  // ============================================================
  // 第 3 章：参数校验
  // ============================================================
  {
    id: "fa-validation",
    group: "路径与查询参数",
    icon: "✅",
    title: "参数校验：Path/Query",
    content: `# 参数校验：Path/Query

## 为什么需要校验

类型注解只能保证"类型对"，但保证不了"值合理"。比如：

- \`item_id: int\` 能保证是整数，但保证不了是正数（\`-1\` 也能通过）
- \`q: str\` 能保证是字符串，但保证不了长度（空字符串、超长字符串都能通过）
- \`status: str\` 能保证是字符串，但保证不了是合法状态

校验（validation）就是给参数加"业务约束"。FastAPI 提供 \`Path()\` 和 \`Query()\` 两个函数，专门用来声明路径参数和查询参数的校验规则。它们能让校验逻辑声明式化，而且自动反映到文档里。

### 🌰 生活类比：校验就像地铁安检

把 API 接口想象成地铁站：

- **类型注解**：检票闸机看你有没刷卡（类型对不对）
- **数值校验（ge/le）**：安检员看你的包超不超重（值范围）
- **长度校验（min_length/max_length）**：行李尺寸限制
- **正则校验（pattern）**：扫描包里有没有违禁品（格式）
- **枚举校验（Enum）**：只允许特定身份的人进站
- **422 错误响应**：安检不通过，告诉你具体哪里有问题

声明式校验的好处：把"安检规则"写在代码里，框架自动执行，还能生成"安检须知"（API 文档）。

## 一、Query() 校验器详解

\`Query()\` 用于声明查询参数的校验规则。基本用法：把默认值用 \`Query()\` 包裹。

### Demo 1：Query 基础用法

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Query
from fastapi import FastAPI, Query

# 创建应用
app = FastAPI()

@app.get("/items")
def list_items(
    # q 是可选字符串，默认 None
    # min_length=3：最少 3 个字符
    # max_length=50：最多 50 个字符
    q: str | None = Query(default=None, min_length=3, max_length=50)
):
    # 访问 /items?q=ab → 422（长度不足 3）
    # 访问 /items?q=hello → 正常
    # 访问 /items → 正常（q=None，校验不触发）
    return {"q": q}

@app.get("/search")
def search(
    # keyword 必选（default=... 表示必选）
    # pattern 用正则校验：只允许字母和数字
    # pattern="^[a-zA-Z0-9]+$" 解释：
    #   ^   匹配字符串开头
    #   [a-zA-Z0-9] 字母（大小写）或数字
    #   +   前面的字符至少 1 个
    #   $   匹配字符串结尾
    #   整体含义：整串只能是字母数字，不能有空格或特殊符号
    keyword: str = Query(default=..., min_length=2, max_length=20, pattern="^[a-zA-Z0-9]+$")
):
    # 访问 /search?keyword=ab → 正常
    # 访问 /search?keyword=a → 422（长度不足）
    # 访问 /search?keyword=hello! → 422（含非法字符）
    # 访问 /search → 422（必选参数缺失）
    return {"keyword": keyword}
\`\`\`

### Query 的常用参数

| 参数 | 作用 | 适用类型 |
|------|------|---------|
| \`default\` | 默认值，\`...\` 表示必选 | 所有 |
| \`min_length\` | 最小长度 | str |
| \`max_length\` | 最大长度 | str |
| \`pattern\` | 正则表达式（旧版叫 regex） | str |
| \`gt\` | 大于（>） | 数值 |
| \`ge\` | 大于等于（>=） | 数值 |
| \`lt\` | 小于（<） | 数值 |
| \`le\` | 小于等于（<=） | 数值 |
| \`title\` | 标题（文档用） | 所有 |
| \`description\` | 描述（文档用） | 所有 |
| \`example\` | 示例值（文档用） | 所有 |
| \`deprecated\` | 标记为已废弃 | 所有 |
| \`alias\` | 参数别名 | 所有 |

## 二、Path() 校验器详解

\`Path()\` 用于声明路径参数的校验规则。用法和 \`Query()\` 几乎一样，区别是：

- \`Path()\` 用于路径参数（必须出现在路径模板里）
- \`Path()\` 的 \`default\` 不能省略（路径参数总是必选），通常写成 \`default=...\` 或省略
- \`Path()\` 额外支持 \`ge\`、\`gt\`、\`lt\`、\`le\` 数值校验

### Demo 2：Path 数值校验

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Path
from fastapi import FastAPI, Path

# 创建应用
app = FastAPI()

@app.get("/items/{item_id}")
def get_item(
    # item_id 必须大于等于 1（ge=greater than or equal）
    # 用 Path() 包裹，default=... 表示必选（路径参数本来就必选）
    item_id: int = Path(default=..., ge=1, lt=1000000),
    # 另一个参数 q 是查询参数，用 Query()
    q: str | None = Query(default=None, max_length=10)
):
    # 访问 /items/42 → 正常
    # 访问 /items/0 → 422（必须 >= 1）
    # 访问 /items/-5 → 422（必须 >= 1）
    # 访问 /items/9999999 → 422（必须 < 1000000）
    return {"item_id": item_id, "q": q}

# float 类型校验
@app.get("/products/{price}")
def get_by_price(
    # price 必须大于 0
    price: float = Path(default=..., gt=0, le=99999.99)
):
    # 访问 /products/9.99 → 正常
    # 访问 /products/0 → 422（必须 > 0）
    # 访问 /products/-1 → 422
    return {"price": price}
\`\`\`

## 三、数值校验：gt、ge、lt、le

数值校验四个参数：

- \`gt\`（greater than）：大于，\`x > gt\`
- \`ge\`（greater than or equal）：大于等于，\`x >= ge\`
- \`lt\`（less than）：小于，\`x < lt\`
- \`le\`（less than or equal）：小于等于，\`x <= le\`

### Demo 3：组合数值校验

\`\`\`python
# 从 fastapi 导入 FastAPI、Path、Query
from fastapi import FastAPI, Path, Query

# 创建应用
app = FastAPI()

@app.get("/orders/{order_id}")
def get_order(
    # order_id 在 1 到 10000 之间（含 1 和 10000）
    order_id: int = Path(
        default=...,
        ge=1,          # >= 1
        le=10000,      # <= 10000
        title="订单ID",
        description="订单的唯一标识符，范围 1-10000"
    ),
    # 版本号查询参数，必须大于 0
    version: int = Query(default=1, ge=1, le=10),
    # 折扣范围 0-1
    discount: float = Query(default=0.0, ge=0.0, le=1.0)
):
    # 访问 /orders/42 → order_id=42, version=1, discount=0.0
    # 访问 /orders/42?version=5&discount=0.8 → 正常
    # 访问 /orders/0 → 422（order_id 必须 >= 1）
    # 访问 /orders/42?discount=1.5 → 422（discount 必须 <= 1.0）
    return {
        "order_id": order_id,
        "version": version,
        "discount": discount
    }
\`\`\`

数值校验的速记：

- \`gt=0\`：必须正数（不含 0）
- \`ge=1\`：从 1 开始（含 1）
- \`lt=100\`：小于 100
- \`le=100\`：最大 100（含 100）

## 四、字符串校验

字符串校验三个核心参数：\`min_length\`、\`max_length\`、\`pattern\`。

### Demo 4：字符串校验综合示例

\`\`\`python
# 从 fastapi 导入 FastAPI、Query
from fastapi import FastAPI, Query

# 创建应用
app = FastAPI()

@app.get("/users")
def list_users(
    # 用户名搜索：3-20 字符，只允许字母数字下划线
    # pattern="^[a-zA-Z0-9_]+$" → 整串只能是字母、数字、下划线
    username: str | None = Query(
        default=None,
        min_length=3,
        max_length=20,
        pattern="^[a-zA-Z0-9_]+$",
        title="用户名",
        description="3-20 位字母、数字或下划线"
    ),
    # 邮箱搜索：用正则校验邮箱格式
    # 邮箱正则拆解：用户名@域名.后缀
    #   [a-zA-Z0-9_.+-]+  用户名部分（字母数字及 . _ + -）
    #   @                 必须有 @
    #   [a-zA-Z0-9-]+     域名部分
    #   \.                必须有点（. 在正则里是特殊字符，要转义）
    #   [a-zA-Z0-9-.]+    顶级域名部分
    # r"..." 前缀表示 raw 字符串，反斜杠不被转义
    email: str | None = Query(
        default=None,
        pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        title="邮箱"
    ),
    # 手机号：11 位数字
    # pattern="^1[3-9]\d{9}$" → 中国手机号格式
    #   1      第一位必须是 1
    #   [3-9]  第二位是 3-9（13x/14x/15x/17x/18x/19x 号段）
    #   \d{9}  后面跟 9 位数字（\d 表示数字，{9} 表示重复 9 次）
    phone: str | None = Query(
        default=None,
        min_length=11,
        max_length=11,
        pattern="^1[3-9]\d{9}$",
        title="手机号"
    )
):
    # 访问 /users?username=alice → 正常
    # 访问 /users?username=ab → 422（长度不足）
    # 访问 /users?username=alice! → 422（非法字符）
    # 访问 /users?email=test@example.com → 正常
    # 访问 /users?email=invalid → 422（邮箱格式错误）
    return {
        "username": username,
        "email": email,
        "phone": phone
    }
\`\`\`

**正则校验避坑**：

- \`pattern\` 是 Pydantic v2 的写法，旧版用 \`regex\`（已废弃）
- 正则用 \`^\` 和 \`$\` 锚定首尾，否则部分匹配也会通过
- 复杂正则可读性差，考虑用 Pydantic 模型 + \`EmailStr\` 等专用类型

## 五、枚举值校验

用 \`Enum\` 限制参数取值，比正则更清晰。

### Demo 5：枚举校验

\`\`\`python
# 从 fastapi 导入 FastAPI、Query
from fastapi import FastAPI, Query
# 从 enum 导入 Enum
from enum import Enum

# 创建应用
app = FastAPI()

# 定义排序方向枚举
class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

# 定义排序字段枚举
class SortField(str, Enum):
    id = "id"
    name = "name"
    price = "price"
    created_at = "created_at"

@app.get("/products")
def list_products(
    # 排序字段：只能是枚举里的值
    sort_by: SortField = Query(default=SortField.id),
    # 排序方向：只能是 asc 或 desc
    order: SortOrder = Query(default=SortOrder.asc),
):
    # 访问 /products → sort_by=id, order=asc
    # 访问 /products?sort_by=price&order=desc → 正常
    # 访问 /products?sort_by=xxx → 422（非法值）
    return {
        "sort_by": sort_by.value,
        "order": order.value
    }
\`\`\`

枚举校验的好处：
1. 非法值直接 422，不用手写 \`if status not in [...]\`
2. 文档自动列出所有可选值
3. IDE 有自动补全

## 六、参数元数据

\`Path()\` 和 \`Query()\` 支持元数据参数，主要用于文档生成和接口管理。

### Demo 6：完整的元数据示例

\`\`\`python
# 从 fastapi 导入 FastAPI、Path、Query
from fastapi import FastAPI, Path, Query

# 创建应用
app = FastAPI()

@app.get("/items/{item_id}", 
    # 路由级别的元数据
    summary="获取商品详情",
    description="根据 ID 获取商品的详细信息，包括名称、价格、库存等。",
    response_description="商品详情对象"
)
def get_item(
    # 路径参数的元数据
    item_id: int = Path(
        default=...,
        ge=1,
        title="商品ID",
        description="商品的唯一标识符，必须为正整数",
        example=42,
        # examples 可以给多个示例（OpenAPI 3.1）
        examples=[1, 42, 100]
    ),
    # 查询参数的元数据
    q: str | None = Query(
        default=None,
        min_length=2,
        max_length=50,
        title="搜索关键词",
        description="用于搜索商品名称的关键词，2-50 个字符",
        example="iphone"
    ),
    # 标记为已废弃（文档里会显示删除线，但不影响功能）
    old_param: str | None = Query(
        default=None,
        deprecated=True,
        title="已废弃参数",
        description="此参数已废弃，请使用 q 代替"
    )
):
    # 文档里会显示：
    # - item_id 的示例是 42
    # - q 的示例是 "iphone"
    # - old_param 有删除线，标记为废弃
    return {"item_id": item_id, "q": q}
\`\`\`

元数据参数不参与校验，只影响文档：

| 元数据 | 作用 |
|--------|------|
| \`title\` | 参数标题，文档里粗体显示 |
| \`description\` | 参数详细说明 |
| \`example\` | 示例值，文档里显示 |
| \`examples\` | 多个示例（OpenAPI 3.1） |
| \`deprecated\` | 标记废弃，文档显示删除线 |
| \`alias\` | URL 里的参数名和代码里的参数名不同 |

## 七、alias：参数别名

有时候 URL 里的参数名和 Python 里的变量名冲突（比如 \`class\` 是关键字），或者前端习惯用驼峰、后端用蛇形。用 \`alias\` 解决。

### Demo 7：alias 用法

\`\`\`python
# 从 fastapi 导入 FastAPI、Query
from fastapi import FastAPI, Query

# 创建应用
app = FastAPI()

@app.get("/items")
def list_items(
    # URL 用 class（前端习惯），代码里用 category
    category: str | None = Query(default=None, alias="class"),
    # URL 用 pageSize，代码里用 page_size
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    # URL 用 sortBy，代码里用 sort_by
    sort_by: str = Query(default="id", alias="sortBy")
):
    # 访问 /items?class=fruit&pageSize=20&sortBy=price
    # category="fruit", page_size=20, sort_by="price"
    return {
        "category": category,
        "page_size": page_size,
        "sort_by": sort_by
    }
\`\`\`

\`alias\` 让前后端命名习惯解耦：前端用驼峰，后端用蛇形，互不干扰。

## 八、多参数校验综合示例

### Demo 8：完整的分页接口校验

\`\`\`python
# 从 fastapi 导入 FastAPI、Path、Query
from fastapi import FastAPI, Path, Query
# 从 enum 导入 Enum
from enum import Enum

# 创建应用
app = FastAPI()

class SortField(str, Enum):
    id = "id"
    name = "name"
    price = "price"

@app.get("/categories/{category_id}/products")
def list_category_products(
    # 路径参数：分类 ID，必须 >= 1
    category_id: int = Path(
        default=...,
        ge=1,
        title="分类ID",
        description="商品分类的唯一标识符"
    ),
    # 分页参数
    page: int = Query(
        default=1,
        ge=1,
        le=1000,
        title="页码",
        description="页码，从 1 开始，最大 1000"
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
        alias="pageSize",
        title="每页数量",
        description="每页返回的商品数量，1-100"
    ),
    # 过滤参数
    min_price: float | None = Query(
        default=None,
        ge=0,
        title="最低价格"
    ),
    max_price: float | None = Query(
        default=None,
        ge=0,
        title="最高价格"
    ),
    # 搜索参数
    keyword: str | None = Query(
        default=None,
        min_length=1,
        max_length=50,
        title="搜索关键词"
    ),
    # 排序参数
    sort_by: SortField = Query(
        default=SortField.id,
        title="排序字段"
    ),
    # 已废弃参数
    old_sort: str | None = Query(
        default=None,
        deprecated=True,
        title="已废弃",
        description="请使用 sort_by"
    )
):
    # 构造返回
    result = {
        "category_id": category_id,
        "page": page,
        "page_size": page_size,
        "filters": {},
        "sort_by": sort_by.value
    }
    if min_price is not None:
        result["filters"]["min_price"] = min_price
    if max_price is not None:
        result["filters"]["max_price"] = max_price
    if keyword:
        result["filters"]["keyword"] = keyword
    return result
\`\`\`

这个例子涵盖了路径校验、查询校验、数值校验、字符串校验、枚举校验、别名、废弃标记。实际项目里的"正经"接口差不多就是这样。

### 🆕 Demo 9：分页 + 排序 + 过滤的完整组合实战

这是真实项目里最典型的列表接口：支持分页、多字段排序、价格区间、分类过滤、关键词搜索，所有参数都有严格校验。

\`\`\`python
# 从 fastapi 导入 FastAPI、Path、Query
from fastapi import FastAPI, Query
from enum import Enum
from typing import List

# 创建应用
app = FastAPI()

# 排序方向枚举
class OrderDirection(str, Enum):
    asc = "asc"
    desc = "desc"

# 模拟商品数据库
products_db = [
    {"id": 1, "name": "iPhone 15", "price": 6999.0, "category": "phone", "stock": 100},
    {"id": 2, "name": "Galaxy S24", "price": 5999.0, "category": "phone", "stock": 50},
    {"id": 3, "name": "iPad Pro", "price": 7999.0, "category": "tablet", "stock": 30},
    {"id": 4, "name": "MacBook Air", "price": 8999.0, "category": "laptop", "stock": 20},
    {"id": 5, "name": "AirPods Pro", "price": 1999.0, "category": "audio", "stock": 0},
    {"id": 6, "name": "Magic Mouse", "price": 599.0, "category": "accessory", "stock": 80},
]

@app.get("/products")
def list_products(
    # ===== 分页参数 =====
    # page >= 1，避免负数页码
    page: int = Query(default=1, ge=1, le=10000, description="页码，从 1 开始"),
    # page_size 限制在 1-100，防止前端传过大值拖垮数据库
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize", description="每页数量"),
    
    # ===== 过滤参数 =====
    # 关键词：长度限制，防止过长字符串攻击
    keyword: str | None = Query(
        default=None,
        min_length=1,
        max_length=50,
        description="商品名称关键词"
    ),
    # 价格区间：min_price >= 0，max_price >= 0
    min_price: float | None = Query(
        default=None,
        ge=0,
        le=999999,
        description="最低价格"
    ),
    max_price: float | None = Query(
        default=None,
        ge=0,
        le=999999,
        description="最高价格"
    ),
    # 多分类过滤：列表参数
    categories: List[str] | None = Query(
        default=None,
        alias="category",
        description="分类列表，可传多个：?category=phone&category=tablet"
    ),
    # 库存过滤
    in_stock: bool | None = Query(
        default=None,
        description="是否只看有货商品"
    ),
    
    # ===== 排序参数 =====
    sort_by: str = Query(
        default="id",
        pattern="^(id|name|price|stock)$",  # 只允许这几个字段排序
        description="排序字段"
    ),
    order: OrderDirection = Query(
        default=OrderDirection.asc,
        description="排序方向"
    ),
):
    # 第 1 步：从完整列表开始
    result = list(products_db)
    
    # 第 2 步：应用过滤条件
    if keyword:
        kw = keyword.lower()
        result = [p for p in result if kw in p["name"].lower()]
    
    if categories:
        # 多分类用 OR 关系：在任意一个分类里都算匹配
        result = [p for p in result if p["category"] in categories]
    
    if min_price is not None:
        result = [p for p in result if p["price"] >= min_price]
    if max_price is not None:
        result = [p for p in result if p["price"] <= max_price]
    
    if in_stock is not None:
        result = [p for p in result if (p["stock"] > 0) == in_stock]
    
    # 第 3 步：排序
    reverse = (order == OrderDirection.desc)
    result.sort(key=lambda p: p.get(sort_by, 0), reverse=reverse)
    
    # 第 4 步：分页
    total = len(result)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = result[start:end]
    
    return {
        "data": paginated,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
        "filters": {
            "keyword": keyword,
            "categories": categories,
            "price_range": [min_price, max_price],
            "in_stock": in_stock
        }
    }
\`\`\`

测试访问：

\`\`\`bash
# 基本分页
curl "http://127.0.0.1:8000/products?page=1&pageSize=5"

# 多分类过滤 + 价格区间
curl "http://127.0.0.1:8000/products?category=phone&category=tablet&min_price=5000"

# 排序 + 关键词
curl "http://127.0.0.1:8000/products?keyword=i&sort_by=price&order=desc"

# 故意传非法排序字段，触发 pattern 校验
curl "http://127.0.0.1:8000/products?sort_by=password"
# 期望：422 错误
\`\`\`

### 🆕 Demo 10：复杂正则校验（IP、日期、UUID）

实战中常需要校验特殊格式的参数：IP 地址、日期、UUID 等。

\`\`\`python
# 从 fastapi 导入 FastAPI、Query
from fastapi import FastAPI, Query

# 创建应用
app = FastAPI()

@app.get("/network/devices")
def list_devices(
    # IP 地址校验（IPv4）
    # 正则拆解：
    #   ^\d{1,3}\.   第一段：1-3 位数字 + 点
    #   \d{1,3}\.    第二段
    #   \d{1,3}\.    第三段
    #   \d{1,3}$     第四段
    # 注意：这个正则只校验格式，不校验范围（255.255.255.255 也能通过）
    # 严格校验范围用 ipaddress 模块
    ip: str | None = Query(
        default=None,
        pattern=r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$",
        description="IPv4 地址"
    ),
    # 日期校验（YYYY-MM-DD 格式）
    # 正则拆解：
    #   \d{4}     4 位年份
    #   -         分隔符
    #   \d{2}     2 位月份
    #   -         分隔符
    #   \d{2}     2 位日期
    date: str | None = Query(
        default=None,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="日期，格式 YYYY-MM-DD"
    ),
    # 时间校验（HH:MM:SS）
    time: str | None = Query(
        default=None,
        pattern=r"^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$",
        description="时间，格式 HH:MM:SS"
    ),
    # UUID 校验
    uuid: str | None = Query(
        default=None,
        pattern=r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description="UUID"
    ),
    # 版本号校验（如 v1.2.3）
    # 正则拆解：
    #   v               字母 v 开头
    #   \d+             至少 1 位数字（主版本号）
    #   (\.\d+){2}      .数字 重复 2 次（次版本号、修订号）
    version: str | None = Query(
        default=None,
        pattern=r"^v\d+(\.\d+){2}$",
        description="版本号，格式 vX.Y.Z"
    ),
):
    return {
        "ip": ip,
        "date": date,
        "time": time,
        "uuid": uuid,
        "version": version
    }
\`\`\`

测试：

\`\`\`bash
# 合法 IP
curl "http://127.0.0.1:8000/network/devices?ip=192.168.1.1"

# 非法 IP
curl "http://127.0.0.1:8000/network/devices?ip=999.999.999.999"
# 这个会通过正则但范围非法，实际项目要加范围校验

# 合法日期
curl "http://127.0.0.1:8000/network/devices?date=2024-07-11"

# 非法日期格式
curl "http://127.0.0.1:8000/network/devices?date=2024/07/11"
# 期望：422
\`\`\`

### 🆕 Demo 11：多个 gt/ge/lt/le 组合校验

演示数值校验参数的多种组合，覆盖各种业务场景。

\`\`\`python
# 从 fastapi 导入 FastAPI、Path、Query
from fastapi import FastAPI, Path, Query

# 创建应用
app = FastAPI()

@app.get("/products/{product_id}/pricing")
def get_pricing(
    # 路径参数：product_id 必须 >= 1
    product_id: int = Path(default=..., ge=1),
    # 数量：1-999，开闭区间混合
    # ge=1：至少 1 个
    # le=999：最多 999 个
    quantity: int = Query(default=1, ge=1, le=999),
    # 折扣率：0.0-1.0（含两端）
    # ge=0.0：不能为负
    # le=1.0：最大 100% 折扣
    discount_rate: float = Query(default=0.0, ge=0.0, le=1.0),
    # 优惠券金额：必须 > 0（不能为 0，0 表示不用优惠券）
    # gt=0：严格大于 0
    # lt=1000：小于 1000，防止异常大额
    coupon_amount: float | None = Query(default=None, gt=0, lt=1000),
    # 用户年龄：18-150（用于判断是否享受学生折扣）
    # ge=18：成年
    # lt=150：合理上限
    age: int = Query(default=18, ge=18, lt=150),
    # 评分：1-5（不含 0，含 5）
    # gt=0：必须大于 0
    # le=5：最大 5
    rating: int = Query(default=5, gt=0, le=5),
    # 经纬度：-180 到 180，-90 到 90
    longitude: float = Query(default=0.0, ge=-180.0, le=180.0),
    latitude: float = Query(default=0.0, ge=-90.0, le=90.0),
):
    return {
        "product_id": product_id,
        "quantity": quantity,
        "discount_rate": discount_rate,
        "coupon_amount": coupon_amount,
        "age": age,
        "rating": rating,
        "location": {"lon": longitude, "lat": latitude}
    }
\`\`\`

测试：

\`\`\`bash
# 全部合法
curl "http://127.0.0.1:8000/products/42/pricing?quantity=2&discount_rate=0.1&coupon_amount=50&age=25&rating=4&longitude=116.4&latitude=39.9"

# 数量超上限
curl "http://127.0.0.1:8000/products/42/pricing?quantity=1000"
# 期望：422，le=999 校验失败

# 经度超范围
curl "http://127.0.0.1:8000/products/42/pricing?longitude=200"
# 期望：422，le=180 校验失败

# 优惠券金额为 0
curl "http://127.0.0.1:8000/products/42/pricing?coupon_amount=0"
# 期望：422，gt=0 校验失败（0 不大于 0）
\`\`\`

### 🆕 Demo 12：列表参数的元素校验

演示对列表参数本身和元素的各种校验组合。

\`\`\`python
# 从 fastapi 导入 FastAPI、Query
from fastapi import FastAPI, Query
from typing import List

# 创建应用
app = FastAPI()

@app.get("/tags/search")
def search_by_tags(
    # 列表长度校验
    # min_length=1：至少传 1 个 tag
    # max_length=10：最多 10 个 tag
    # 注意：这里的 min_length/max_length 是列表长度，不是字符串长度
    tags: List[str] = Query(
        default=[],
        min_length=1,
        max_length=10,
        description="标签列表，至少 1 个，最多 10 个"
    ),
):
    # 访问 /tags/search?tags=python → tags=["python"]
    # 访问 /tags/search?tags=python&tags=fastapi → tags=["python", "fastapi"]
    # 访问 /tags/search → 422，至少要 1 个 tag
    return {"tags": tags, "count": len(tags)}

@app.get("/ids/batch")
def batch_get(
    # 列表的元素是 int 类型
    # FastAPI 会自动把每个元素转成 int
    ids: List[int] = Query(
        default=[],
        max_length=100,
        description="ID 列表，最多 100 个"
    ),
):
    # 访问 /ids/batch?ids=1&ids=2&ids=3 → ids=[1, 2, 3]
    # 访问 /ids/batch?ids=1&ids=abc → 422，"abc" 无法转 int
    return {"ids": ids, "count": len(ids)}

@app.get("/users/filter")
def filter_users(
    # 邮箱列表，每个都要符合邮箱格式
    # 注意：FastAPI 对 List 元素的 pattern 校验需要 Pydantic 模型
    # 这里用 str + 函数内校验演示
    emails: List[str] = Query(default=[], max_length=5),
):
    # 在函数内对每个元素校验
    import re
    email_pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    invalid = [e for e in emails if not re.match(email_pattern, e)]
    if invalid:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=422,
            detail=f"非法邮箱: {invalid}"
        )
    return {"emails": emails}
\`\`\`

测试：

\`\`\`bash
# 传 1 个 tag
curl "http://127.0.0.1:8000/tags/search?tags=python"

# 传多个 tag
curl "http://127.0.0.1:8000/tags/search?tags=python&tags=fastapi&tags=web"

# 不传 tag
curl "http://127.0.0.1:8000/tags/search"
# 期望：422，至少要 1 个

# 批量 ID
curl "http://127.0.0.1:8000/ids/batch?ids=1&ids=2&ids=3"
# 期望：{"ids":[1,2,3],"count":3}
\`\`\`

## 九、校验错误响应格式详解

当校验失败时，FastAPI 返回 422 状态码，body 是统一的错误格式：

\`\`\`json
{
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": ["path", "item_id"],
      "msg": "Input should be greater than or equal to 1",
      "input": "0",
      "ctx": {"ge": 1},
      "url": "https://errors.pydantic.dev/2.x/v/greater_than_equal"
    }
  ]
}
\`\`\`

字段说明：

| 字段 | 含义 |
|------|------|
| \`detail\` | 错误列表，可能有多个错误 |
| \`type\` | 错误类型（如 \`greater_than_equal\`、\`string_too_short\`） |
| \`loc\` | 错误位置，\`["path", "item_id"]\` 表示路径参数 item_id |
| \`msg\` | 人类可读的错误信息 |
| \`input\` | 用户传入的值 |
| \`ctx\` | 错误上下文（如校验的 \`ge\` 值） |
| \`url\` | 错误说明文档链接 |

### loc 字段详解

\`loc\` 的第一个元素表示错误来源：

| loc[0] | 含义 |
|--------|------|
| \`"query"\` | 查询参数错误 |
| \`"path"\` | 路径参数错误 |
| \`"body"\` | 请求体错误 |
| \`"header"\` | 请求头错误 |
| \`"cookie"\` | Cookie 错误 |

\`loc[1]\` 是参数名。比如 \`["query", "page"]\` 表示查询参数 \`page\` 出错。

### 常见错误类型

| type | 含义 |
|------|------|
| \`missing\` | 必选参数缺失 |
| \`int_parsing\` | 字符串无法转整数 |
| \`greater_than_equal\` | 不满足 \`ge\` |
| \`less_than_equal\` | 不满足 \`le\` |
| \`string_too_short\` | 不满足 \`min_length\` |
| \`string_too_long\` | 不满足 \`max_length\` |
| \`string_pattern_mismatch\` | 不满足 \`pattern\` |
| \`enum\` | 不在枚举值里 |

## 十、自定义校验错误响应

默认的 422 响应格式可能不符合项目规范，可以自定义。

### Demo 13：自定义异常处理器

\`\`\`python
# 从 fastapi 导入 FastAPI、Query、Request
from fastapi import FastAPI, Query, Request
# 从 fastapi.exceptions 导入 RequestValidationError
# RequestValidationError 是 FastAPI 在请求校验失败时抛出的异常类
from fastapi.exceptions import RequestValidationError
# 从 fastapi.responses 导入 JSONResponse
# JSONResponse 用于返回自定义 JSON 响应（可控制状态码和内容）
from fastapi.responses import JSONResponse

# 创建应用
app = FastAPI()

# 注册异常处理器：拦截校验错误
# @app.exception_handler(异常类) 注册一个处理该异常的函数
# 当代码里抛出 RequestValidationError 时，FastAPI 会调用这个函数而不是返回默认 422
@app.exception_handler(RequestValidationError)
# 异常处理函数签名：async def handler(request: Request, exc: 异常类)
# request 是当前请求对象，exc 是捕获到的异常实例
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # exc.errors() 是错误列表
    # 每个错误包含 type/loc/msg/input/ctx 等字段
    # 自定义返回格式：统一返回 code + message
    errors = []
    for err in exc.errors():
        errors.append({
            # err["loc"] 是元组如 ("query", "item_id")，用 "." 拼接成 "query.item_id"
            "field": ".".join(str(x) for x in err["loc"]),  # 拼接 loc
            "message": err["msg"],
            "type": err["type"]
        })
    # 返回自定义格式
    # JSONResponse 直接控制 HTTP 响应：状态码 + JSON 内容
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": "参数校验失败",
            "errors": errors
        }
    )

@app.get("/items/{item_id}")
def get_item(
    item_id: int = Query(default=..., ge=1)
):
    return {"item_id": item_id}

# 访问 /items/0 → 返回：
# {
#   "code": 422,
#   "message": "参数校验失败",
#   "errors": [{"field": "query.item_id", "message": "...", "type": "..."}]
# }
\`\`\`

## 十一、常见错误和避坑指南

### 坑 1：Path 和 Query 混用

\`\`\`python
# ❌ 错误：路径参数用 Query
@app.get("/items/{item_id}")
def get_item(item_id: int = Query(ge=1)):  # 应该用 Path
    ...

# ❌ 错误：查询参数用 Path
@app.get("/items")
def list_items(page: int = Path(ge=1)):  # 应该用 Query
    ...
\`\`\`

虽然功能上可能不报错，但语义混乱，文档也会乱。**路径参数用 Path，查询参数用 Query**。

### 坑 2：default 值和校验冲突

\`\`\`python
# ❌ 错误：默认值不满足校验
@app.get("/items")
def list_items(
    page: int = Query(default=0, ge=1)  # 默认 0，但要求 >= 1
):
    # 访问 /items → 422！默认值 0 不满足 ge=1
    return {"page": page}

# ✅ 正确：默认值满足校验
@app.get("/items")
def list_items(
    page: int = Query(default=1, ge=1)  # 默认 1，满足 >= 1
):
    return {"page": page}
\`\`\`

**避坑**：默认值必须满足校验条件，否则不传参数时直接 422。

### 坑 3：pattern 锚定

\`\`\`python
# ❌ 没有锚定，部分匹配也通过
@app.get("/items")
def list_items(
    q: str = Query(pattern="[a-z]+")  # "abc123" 也能通过，因为有 "abc" 子串
):
    return {"q": q}

# ✅ 用 ^ $ 锚定
@app.get("/items")
def list_items(
    q: str = Query(pattern="^[a-z]+$")  # "abc123" 不通过
):
    return {"q": q}
\`\`\`

### 坑 4：Optional 参数的校验

\`\`\`python
# Optional 参数不传时是 None，校验不触发
@app.get("/items")
def list_items(
    q: str | None = Query(default=None, min_length=3)
):
    # 访问 /items → q=None，min_length 不校验
    # 访问 /items?q=ab → 422（长度不足 3）
    # 访问 /items?q= → 422（空字符串长度 0）
    return {"q": q}
\`\`\`

**注意**：如果想允许空字符串但不允许 None，用 \`default=""\` 而不是 \`default=None\`。

### 坑 5：列表参数的校验

\`\`\`python
from typing import List

@app.get("/items")
def list_items(
    # 对列表里每个元素校验
    tags: List[str] | None = Query(default=None, min_length=1, max_length=10)
):
    # min_length=1：列表至少 1 个元素
    # max_length=10：列表最多 10 个元素
    # 访问 /items?tags=a → tags=["a"]
    # 访问 /items?tags=a&tags=b → tags=["a", "b"]
    return {"tags": tags}

# 如果要对每个字符串元素校验长度，用 List 加元素校验（Pydantic v2）
@app.get("/items2")
def list_items2(
    tags: List[str] | None = Query(default=None, max_length=5)
):
    # max_length=5 这里是限制列表长度，不是字符串长度
    # 要限制每个字符串长度，需要用 Pydantic 模型
    return {"tags": tags}
\`\`\`

### 坑 6：min_length/max_length 用错对象

\`\`\`python
# ❌ 错误：对 int 用 min_length
@app.get("/items")
def list_items(
    page: int = Query(default=1, min_length=1)  # int 没有"长度"概念
):
    ...  # 会报错

# ✅ 正确：int 用 ge/le
@app.get("/items")
def list_items(
    page: int = Query(default=1, ge=1)  # 数值校验用 ge/le
):
    ...
\`\`\`

**避坑**：\`min_length\`/\`max_length\` 只用于字符串和列表，数值用 \`ge\`/\`gt\`/\`lt\`/\`le\`。

### 坑 7：pattern 转义问题

\`\`\`python
# ❌ 错误：反斜杠没转义
# Python 字符串里 \. 会被当成转义字符
pattern="^\d+\.\d+$"  # \d 和 \. 可能有歧义

# ✅ 正确：用 raw 字符串
pattern=r"^\d+\.\d+$"  # r"..." 表示原始字符串，反斜杠不转义
\`\`\`

正则表达式里反斜杠很常见（\`\d\`、\`\\.\`、\`\\w\` 等），用 \`r"..." raw\` 字符串能避免歧义。

## 十二、动手实验

### 实验 1：体验各种校验失败场景

启动服务后，依次测试：

\`\`\`bash
# 启动服务（把 Demo 9 保存为 main.py）
uvicorn main:app --reload

# 1. 测试正常请求
curl "http://127.0.0.1:8000/products?page=1&pageSize=5"

# 2. page 传 0（ge=1 失败）
curl "http://127.0.0.1:8000/products?page=0"
# 观察 422 响应的 type 和 ctx 字段

# 3. pageSize 传 200（le=100 失败）
curl "http://127.0.0.1:8000/products?pageSize=200"

# 4. sort_by 传非法字段（pattern 失败）
curl "http://127.0.0.1:8000/products?sort_by=password"

# 5. keyword 传空字符串（min_length=1 失败）
curl "http://127.0.0.1:8000/products?keyword="
\`\`\`

每次访问后，记录 422 响应里的 \`type\` 字段，理解每种校验对应的错误类型。

### 实验 2：实现一个用户注册参数校验

需求：实现 \`/users/register\` 接口（用 GET 模拟），校验：

- \`username\`：3-20 字符，只允许字母数字下划线
- \`email\`：合法邮箱格式
- \`phone\`：11 位中国手机号
- \`password\`：8-32 字符，必须包含字母和数字
- \`age\`：18-100
- \`gender\`：枚举 \`male\`/\`female\`/\`other\`

参考代码：

\`\`\`python
from fastapi import FastAPI, Query
from enum import Enum

app = FastAPI()

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

@app.get("/users/register")
def register(
    username: str = Query(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$"),
    email: str = Query(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"),
    phone: str = Query(..., pattern=r"^1[3-9]\d{9}$"),
    password: str = Query(..., min_length=8, max_length=32, pattern=r"^(?=.*[a-zA-Z])(?=.*\d).+$"),
    age: int = Query(..., ge=18, le=100),
    gender: Gender = Query(...),
):
    return {"msg": "注册参数校验通过", "username": username}
\`\`\`

\`\`\`bash
# 测试合法参数
curl "http://127.0.0.1:8000/users/register?username=alice&email=alice@test.com&phone=13800138000&password=abc12345&age=25&gender=female"

# 测试密码无数字
curl "http://127.0.0.1:8000/users/register?username=alice&email=alice@test.com&phone=13800138000&password=abcdefgh&age=25&gender=female"
# 期望：422

# 测试手机号格式错误
curl "http://127.0.0.1:8000/users/register?username=alice&email=alice@test.com&phone=12345&password=abc12345&age=25&gender=female"
# 期望：422
\`\`\`

### 实验 3：探索 \`/docs\` 文档里的校验信息

访问 \`http://127.0.0.1:8000/docs\`：

1. 找到 \`/products\` 接口，点开看每个参数的：
   - 默认值
   - 最小值/最大值（ge/le）
   - 长度限制（min_length/max_length）
   - 正则（pattern）
2. 点击 \`Try it out\`，故意传非法值，看 422 响应
3. 观察 deprecated 参数在文档里的显示样式（删除线）

### 实验 4：自定义校验错误响应

参考 Demo 13，自定义一个错误响应格式：

\`\`\`json
{
  "success": false,
  "error_code": "VALIDATION_FAILED",
  "errors": [
    {"field": "page", "message": "...", "code": "OUT_OF_RANGE"}
  ]
}
\`\`\`

完成后用 curl 测试，看返回格式是否符合预期。

## 本章小结

| 校验类型 | 参数 | 适用 |
|---------|------|------|
| 数值大小 | \`gt\`、\`ge\`、\`lt\`、\`le\` | int、float |
| 字符串长度 | \`min_length\`、\`max_length\` | str、List |
| 字符串格式 | \`pattern\`（正则） | str |
| 枚举取值 | \`Enum\` | 所有 |
| 元数据 | \`title\`、\`description\`、\`example\` | 所有 |
| 别名 | \`alias\` | 所有 |
| 废弃 | \`deprecated\` | 所有 |

校验是 API 质量的护城河。声明式校验让"约束"和"代码"在一起，不会脱节，还能自动反映到文档。下一章我们看 \`Request\` 对象——当 \`Path\`/\`Query\` 不够用时，直接访问原始请求数据。
`,
  },

  // ============================================================
  // 第 4 章：Request 对象与元数据
  // ============================================================
  {
    id: "fa-request-obj",
    group: "路径与查询参数",
    icon: "📋",
    title: "Request 对象与元数据",
    content: `# Request 对象与元数据

## 什么是 Request 对象

前面我们用路径参数、查询参数、Path/Query 校验器，都是 FastAPI "帮你解析好" 的便捷方式。但有时候你需要直接访问原始请求数据——比如读 HTTP 头、Cookie、客户端 IP、原始 body 字节流。

这时候就用 \`Request\` 对象。它是 FastAPI（实际是 Starlette）提供的原始请求对象，包含 HTTP 请求的所有信息。

### 🌰 生活类比：Request 对象就像快递员手里的完整包裹

把 API 请求想象成快递：

- **路径参数 / 查询参数**：包裹上的"收件人姓名"和"地址"——快递员（FastAPI）帮你拆出来直接用
- **Pydantic 模型**：包裹里的"商品清单"——拆开就是结构化数据
- **\`Request\` 对象**：整个原始包裹——包含寄件人信息（IP）、外包装（headers）、签字记录（cookies）、原始内容（body）等所有细节

当你只需要"地址"时，用 \`Path\`/\`Query\` 就够了；当你需要看"寄件人是谁、包裹有多重、用什么箱子装的"时，就要拆开 \`Request\` 对象。

\`Request\` 对象和 \`Path\`/\`Query\` 的关系：

- \`Path\`/\`Query\`：FastAPI 的"高级封装"，自动解析、校验、转类型
- \`Request\`：原始 ASGI 请求对象，啥都有，但要自己处理

实际开发中，优先用 \`Path\`/\`Query\`，只在需要"原始数据"时才用 \`Request\`。

## 一、Request 对象获取方式

在函数参数里声明 \`request: Request\`，FastAPI 会自动注入。

### Demo 1：最简单的 Request 用法

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建应用
app = FastAPI()

@app.get("/info")
# request: Request 声明后，FastAPI 自动注入请求对象
def get_info(request: Request):
    # request.method 是 HTTP 方法（GET/POST/...）
    # request.url 是完整 URL
    # request.headers 是请求头
    # request.client 是客户端信息
    return {
        "method": request.method,
        "url": str(request.url),
        "client": request.client.host if request.client else None
    }
\`\`\`

注意：\`request: Request\` 不会出现在文档里（\`/docs\` 不显示），因为它是框架注入的，不是用户传的参数。

\`Request\` 可以和路径参数、查询参数混用：

\`\`\`python
@app.get("/items/{item_id}")
def get_item(item_id: int, request: Request):
    # item_id 是路径参数，FastAPI 自动从 URL 提取并转成 int
    # request 是注入的请求对象，FastAPI 看到 Request 类型会自动传入
    # request 不会出现在 /docs 文档里，因为它不是用户传的参数
    # request.headers.get("user-agent") 读取请求头里的 UA 信息
    # headers 大小写不敏感，"user-agent" 和 "User-Agent" 等价
    return {"item_id": item_id, "ua": request.headers.get("user-agent")}
\`\`\`

## 二、Request 的核心属性

\`Request\` 对象有很多属性，最常用的有：

| 属性 | 类型 | 说明 |
|------|------|------|
| \`request.method\` | \`str\` | HTTP 方法（GET、POST 等） |
| \`request.url\` | \`URL\` | 完整 URL 对象 |
| \`request.headers\` | \`Headers\` | 请求头（大小写不敏感） |
| \`request.query_params\` | \`QueryParams\` | 查询参数 |
| \`request.path_params\` | \`dict\` | 路径参数 |
| \`request.cookies\` | \`dict\` | Cookie |
| \`request.client\` | \`Client\` | 客户端信息（host、port） |
| \`request.state\` | \`State\` | 请求级共享状态 |
| \`request.scope\` | \`dict\` | ASGI scope 原始字典 |

异步方法（需要 \`await\`）：

| 方法 | 返回 | 说明 |
|------|------|------|
| \`await request.body()\` | \`bytes\` | 原始 body 字节 |
| \`await request.json()\` | \`dict\` | 解析 JSON body |
| \`await request.form()\` | \`FormData\` | 解析表单数据 |
| \`await request.stream()\` | \`bytes\` | 流式读取 body |

### Demo 2：访问各种属性

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建应用
app = FastAPI()

@app.get("/debug")
async def debug_request(request: Request):
    # request.method：HTTP 方法
    method = request.method
    
    # request.url：URL 对象，支持分解
    url = request.url
    # url.scheme: http/https
    # url.hostname: 主机名
    # url.port: 端口
    # url.path: 路径
    # url.query: 查询字符串
    
    # request.headers：Headers 对象，大小写不敏感
    # 用 get 方法，不存在返回 None
    user_agent = request.headers.get("user-agent")
    content_type = request.headers.get("content-type")
    authorization = request.headers.get("authorization")
    
    # request.query_params：查询参数
    # 可以用 get 或 []
    skip = request.query_params.get("skip")
    limit = request.query_params.get("limit")
    
    # request.path_params：路径参数字典
    # 这个路由没有路径参数，所以是空字典
    path_params = request.path_params
    
    # request.cookies：Cookie 字典
    session_id = request.cookies.get("session_id")
    
    # request.client：客户端信息
    # client.host 是 IP，client.port 是端口
    client_host = request.client.host if request.client else None
    client_port = request.client.port if request.client else None
    
    return {
        "method": method,
        "url": {
            "full": str(url),
            "scheme": url.scheme,
            "host": url.hostname,
            "port": url.port,
            "path": url.path,
            "query": url.query
        },
        "headers": {
            "user_agent": user_agent,
            "content_type": content_type,
            "authorization": authorization[:20] + "..." if authorization else None
        },
        "query_params": dict(request.query_params),
        "path_params": dict(path_params),
        "cookies": dict(request.cookies),
        "client": {"host": client_host, "port": client_port}
    }
\`\`\`

访问 \`/debug?skip=0&limit=10\`，可以看到所有请求信息的分解。

## 三、获取客户端 IP 和 User-Agent

这是实际项目里最常见的需求——记录访问日志、做风控、地区识别等。

### Demo 3：获取真实客户端 IP

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建应用
app = FastAPI()

@app.get("/ip")
def get_client_ip(request: Request):
    # request.client.host 是直连客户端的 IP
    # 但如果有反向代理（nginx/CDN），这里是代理的 IP
    direct_ip = request.client.host if request.client else None
    
    # 真实用户 IP 在 X-Forwarded-For 头里
    # 格式：X-Forwarded-For: client, proxy1, proxy2
    # 第一个就是真实客户端 IP
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # 取第一个 IP（最左边的）
        real_ip = xff.split(",")[0].strip()
    else:
        # 没有代理时，直连 IP 就是真实 IP
        real_ip = direct_ip
    
    # X-Real-IP 也是常用的代理头（nginx 设置）
    x_real_ip = request.headers.get("x-real-ip")
    if x_real_ip:
        real_ip = x_real_ip
    
    return {
        "direct_ip": direct_ip,
        "real_ip": real_ip,
        "xff": xff
    }

@app.get("/ua")
def get_user_agent(request: Request):
    # User-Agent 头包含客户端信息（浏览器、操作系统等）
    ua = request.headers.get("user-agent", "")
    
    # 简单判断客户端类型
    is_mobile = "Mobile" in ua or "Android" in ua or "iPhone" in ua
    is_curl = ua.startswith("curl/")
    is_postman = "Postman" in ua
    
    return {
        "user_agent": ua,
        "is_mobile": is_mobile,
        "is_curl": is_curl,
        "is_postman": is_postman
    }
\`\`\`

**避坑**：\`X-Forwarded-For\` 可以被伪造！生产环境要配置可信代理（nginx 设置 \`proxy_set_header X-Real-IP $remote_addr\`），别盲目信任这个头。

## 四、读取请求体（raw body）

\`Path\`/\`Query\` 只处理 URL 参数，请求体（body）需要用 \`Request\` 读取。

### Demo 4：读取原始 body

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建应用
app = FastAPI()

# 读取原始字节 body
@app.post("/raw")
async def read_raw_body(request: Request):
    # await request.body() 返回 bytes
    # 因为是 async 方法，函数要用 async def
    body = await request.body()
    
    # body 是字节流，解码成字符串
    body_str = body.decode("utf-8") if body else ""
    
    # body 长度
    body_length = len(body)
    
    return {
        "raw": body_str,
        "length": body_length,
        "content_type": request.headers.get("content-type")
    }

# 读取 JSON body
@app.post("/json")
async def read_json_body(request: Request):
    # await request.json() 解析 JSON
    # 如果 body 不是合法 JSON，会抛异常
    try:
        data = await request.json()
        return {"parsed": data, "type": type(data).__name__}
    except Exception as e:
        return {"error": f"JSON 解析失败: {e}"}

# 读取并保留原始 body（流式读取后还能再读）
@app.post("/echo")
async def echo_body(request: Request):
    # 读取 body
    body = await request.body()
    # 解析 JSON
    # 注意：body() 读取后，json() 还能用，因为 FastAPI 缓存了
    try:
        data = await request.json()
    except:
        data = None
    
    return {
        "raw_size": len(body),
        "parsed": data,
        "headers": dict(request.headers)
    }
\`\`\`

**重点**：\`request.body()\` 和 \`request.json()\` 是异步方法，函数必须用 \`async def\`。如果你用普通 \`def\`，会报错。

**避坑**：\`request.body()\` 读取后，body 会被缓存，可以多次读取。但 \`request.stream()\` 是流式的，只能读一次。

## 五、获取表单数据

表单提交（\`application/x-www-form-urlencoded\` 或 \`multipart/form-data\`）用 \`request.form()\` 读取。

### Demo 5：读取表单

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request

# 创建应用
app = FastAPI()

# 读取表单数据
@app.post("/login")
async def login(request: Request):
    # await request.form() 返回 FormData 对象
    # FormData 类似字典，可以用 get 或 []
    form = await request.form()
    
    # 获取表单字段
    username = form.get("username")
    password = form.get("password")
    remember = form.get("remember", "false")
    
    # 简单校验
    if not username or not password:
        return {"error": "用户名和密码必填"}
    
    # 模拟登录校验
    if username == "admin" and password == "123456":
        return {
            "msg": "登录成功",
            "username": username,
            "remember": remember
        }
    return {"error": "用户名或密码错误"}

# 上传文件也用 form
@app.post("/upload")
async def upload_file(request: Request):
    form = await request.form()
    
    # 获取上传的文件
    # 文件字段是 UploadFile 对象
    file = form.get("file")
    if file is None:
        return {"error": "没有上传文件"}
    
    # file.filename 是文件名
    # file.content_type 是 MIME 类型
    # await file.read() 读取文件内容
    content = await file.read()
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content)
    }
\`\`\`

**注意**：实际项目中，文件上传推荐用 FastAPI 的 \`UploadFile\` 类型注解，而不是手动从 \`request.form()\` 取，因为前者有更好的文档和校验。这里用 \`Request\` 是为了演示原理。

## 六、Request 与 Pydantic 混用

\`Request\` 可以和 Pydantic 模型、\`Path\`、\`Query\` 等混用，各取所长。

### Demo 6：Request + Pydantic 混用

\`\`\`python
# 从 fastapi 导入 FastAPI、Request、Path、Query
from fastapi import FastAPI, Request, Path, Query
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 定义 Pydantic 模型
class ItemCreate(BaseModel):
    name: str
    price: float
    description: str | None = None

@app.post("/users/{user_id}/items")
async def create_item(
    user_id: int = Path(..., ge=1),              # 路径参数，校验
    q: str | None = Query(default=None),         # 查询参数
    item: ItemCreate = ...,                       # Pydantic body 模型
    request: Request = None                       # Request 对象
):
    # user_id：路径参数，已校验
    # q：查询参数
    # item：Pydantic 解析的 body，已校验
    #   item: ItemCreate = ... 这里的 = ... 表示必填
    #   FastAPI 看到 BaseModel 类型参数，自动把 JSON body 解析成 ItemCreate 实例
    # request：原始请求对象
    #   Request 类型参数由框架自动注入，不会出现在 /docs 文档里
    #   request: Request = None 给个默认值 None 是为了不破坏"有默认值参数在后"的规则

    # 从 request 拿额外的信息
    user_agent = request.headers.get("user-agent")
    client_ip = request.client.host if request.client else None
    request_id = request.headers.get("x-request-id", "unknown")

    # 业务逻辑
    return {
        "user_id": user_id,
        "item": item.model_dump(),
        "q": q,
        "meta": {
            "user_agent": user_agent,
            "client_ip": client_ip,
            "request_id": request_id
        }
    }
\`\`\`

混用的原则：
- **业务数据**（body）用 Pydantic 模型，享受自动校验和文档
- **路径/查询参数**用 \`Path\`/\`Query\`，享受校验
- **元数据**（IP、UA、请求 ID）用 \`Request\`，因为它们不需要校验

## 七、request.scope 详解

\`request.scope\` 是 ASGI 协议的原始字典，包含请求的所有底层信息。FastAPI 的所有属性最终都是从 \`scope\` 里取的。

### Demo 7：查看 scope 内容

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 json 用于格式化输出
import json

# 创建应用
app = FastAPI()

@app.get("/scope")
async def get_scope(request: Request):
    # request.scope 是一个字典，包含 ASGI 协议信息
    scope = request.scope
    
    # 常用字段
    # scope["type"]：请求类型（http/websocket）
    # scope["method"]：HTTP 方法
    # scope["path"]：路径
    # scope["query_string"]：查询字符串（bytes）
    # scope["headers"]：请求头（list of tuples）
    # scope["client"]：客户端 (host, port)
    # scope["server"]：服务器 (host, port)
    # scope["scheme"]：协议（http/https）
    # scope["app"]：FastAPI 应用实例
    # scope["path_params"] or scope["route"].path_format
    
    # 提取常用信息
    info = {
        "type": scope.get("type"),
        "method": scope.get("method"),
        "path": scope.get("path"),
        "query_string": scope.get("query_string", b"").decode(),
        "scheme": scope.get("scheme"),
        "client": scope.get("client"),
        "server": scope.get("server"),
        "http_version": scope.get("http_version"),
    }
    
    return info

# 用 scope 实现简单的请求日志
@app.get("/logged")
async def logged_endpoint(request: Request):
    # 从 scope 拿信息，记录日志
    scope = request.scope
    
    # 模拟日志记录
    log_entry = {
        "method": scope["method"],
        "path": scope["path"],
        "query": scope.get("query_string", b"").decode(),
        "client_ip": scope["client"][0] if scope.get("client") else None,
        "http_version": scope.get("http_version"),
        "scheme": scope.get("scheme")
    }
    # 实际项目里用 logging 记录
    print(f"[LOG] {log_entry}")
    
    return {"msg": "已记录日志", "log": log_entry}
\`\`\`

\`scope\` 的完整字段由 ASGI 规范定义，详见 [ASGI 规范文档](https://asgi.readthedocs.io/)。日常开发不需要直接操作 \`scope\`，但了解它有助于理解 FastAPI 底层机制。

## 八、实际场景：日志记录中间件

\`Request\` 对象最常见的用途是写中间件——记录每个请求的日志、做权限校验、限流等。

### Demo 8：完整的日志中间件

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入 Response
from fastapi.responses import JSONResponse
# 导入 time 用于计时
import time
# 导入 logging 用于日志
import logging

# 配置日志
# basicConfig 是 logging 模块的简化配置，level=INFO 表示记录 INFO 及以上级别的日志
logging.basicConfig(level=logging.INFO)
# getLogger("api") 创建一个名为 "api" 的日志记录器
logger = logging.getLogger("api")

# 创建应用
app = FastAPI()

# 注册中间件：用 @app.middleware("http")
# @app.middleware("http") 表示注册一个 HTTP 中间件
# 中间件在请求到达路由函数之前/之后执行，常用于日志、鉴权、限流、CORS 等
@app.middleware("http")
# 中间件函数签名：async def middleware(request: Request, call_next)
# request 是当前请求对象
# call_next 是一个异步函数，调用它会把请求传给下一个处理者（路由或下一个中间件）
async def logging_middleware(request: Request, call_next):
    # 中间件流程：
    # 1. 请求进来，先到这里
    # 2. call_next(request) 把请求传给下一个处理者
    # 3. 拿到响应后，继续这里的逻辑

    # 记录开始时间
    start_time = time.time()

    # 提取请求信息
    method = request.method
    path = request.url.path
    query = request.url.query
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")

    # 记录请求日志
    # logger.info() 记录 INFO 级别日志
    logger.info(
        f"→ {method} {path}?{query} from {client_ip} UA={user_agent[:50]}"
    )

    # 调用下一个处理者（路由函数或下一个中间件）
    # await call_next(request) 返回的是 Response 对象
    try:
        response = await call_next(request)
    except Exception as e:
        # 记录异常
        logger.error(f"✗ {method} {path} 异常: {e}")
        # 返回 500
        return JSONResponse(
            status_code=500,
            content={"detail": "内部服务器错误"}
        )

    # 计算耗时（毫秒）
    duration_ms = (time.time() - start_time) * 1000

    # 记录响应日志
    logger.info(
        f"← {method} {path} {response.status_code} {duration_ms:.2f}ms"
    )

    # 在响应头里加耗时信息
    # 这样前端能从响应头看到接口耗时
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

    return response

# 测试路由
@app.get("/hello")
def hello():
    return {"msg": "hello"}

@app.get("/slow")
async def slow():
    # 模拟慢请求
    import asyncio
    await asyncio.sleep(0.5)
    return {"msg": "slow response"}

@app.get("/error")
def error():
    # 模拟异常
    raise ValueError("模拟的异常")
\`\`\`

访问 \`/hello\`，日志输出：
\`\`\`
→ GET /hello? from 127.0.0.1 UA=Mozilla/5.0...
← GET /hello 200 1.23ms
\`\`\`

访问 \`/slow\`，能看到耗时约 500ms：
\`\`\`
→ GET /slow? from 127.0.0.1 UA=...
← GET /slow 200 501.34ms
\`\`\`

### Demo 9：用 request.state 在中间件和路由间共享数据

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Request
from fastapi import FastAPI, Request
# 导入 uuid 生成请求 ID
import uuid

# 创建应用
app = FastAPI()

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # 给每个请求生成唯一 ID
    # uuid.uuid4() 生成随机 UUID（v4 基于随机数）
    # str() 把 UUID 对象转成字符串，如 "550e8400-e29b-41d4-a716-446655440000"
    request_id = str(uuid.uuid4())

    # 存到 request.state，路由函数里能取到
    # request.state 是 Starlette 提供的命名空间，可以任意设置属性
    request.state.request_id = request_id

    # 调用下一个处理者
    response = await call_next(request)

    # 在响应头里也加上请求 ID
    # 方便前端在排查问题时把请求关联起来
    response.headers["X-Request-ID"] = request_id

    return response

@app.get("/items/{item_id}")
def get_item(item_id: int, request: Request):
    # 从 request.state 取请求 ID
    # request.state 是一个简单的命名空间对象
    # 中间件设置的 request_id 在这里能取到
    request_id = request.state.request_id

    return {
        "item_id": item_id,
        "request_id": request_id  # 返回给客户端
    }

@app.get("/trace")
def trace(request: Request):
    # 同一个请求里，request.state 是共享的
    # 不同请求之间 request.state 是隔离的（每个请求一个 Request 对象）
    return {
        "request_id": request.state.request_id,
        "path": request.url.path
    }
\`\`\`

\`request.state\` 是 Starlette 提供的"请求级命名空间"，可以在中间件里写、路由里读。常用于传递请求 ID、用户身份、链路追踪信息等。

### 🆕 Demo 10：用 Request 实现简单的限流

实际项目里常需要限制单个 IP 的访问频率，防止恶意刷接口。

\`\`\`python
# 从 fastapi 导入 FastAPI、Request
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import time

# 创建应用
app = FastAPI()

# 简单的内存限流器
# 字典格式：{client_ip: [timestamp1, timestamp2, ...]}
# 记录每个 IP 最近 60 秒内的访问时间戳
request_history = {}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # 只对 /api 路径限流，其他路径放行
    if not request.url.path.startswith("/api"):
        return await call_next(request)
    
    # 获取客户端 IP
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # 取出该 IP 的历史访问记录
    history = request_history.get(client_ip, [])
    
    # 清理 60 秒前的记录
    # 只保留最近 60 秒内的访问时间戳
    history = [t for t in history if now - t < 60]
    
    # 检查是否超过限制（每分钟最多 10 次）
    if len(history) >= 10:
        return JSONResponse(
            status_code=429,
            content={
                "error": "请求过于频繁",
                "message": "每分钟最多 10 次请求，请稍后再试",
                "retry_after": 60
            },
            headers={
                # Retry-After 告诉客户端多少秒后重试
                "Retry-After": "60"
            }
        )
    
    # 记录本次访问时间
    history.append(now)
    request_history[client_ip] = history
    
    # 调用下一个处理者
    response = await call_next(request)
    
    # 在响应头里加上限流信息
    # X-RateLimit-Limit：总限额
    # X-RateLimit-Remaining：剩余次数
    response.headers["X-RateLimit-Limit"] = "10"
    response.headers["X-RateLimit-Remaining"] = str(10 - len(history))
    
    return response

# 测试路由
@app.get("/api/data")
def get_data():
    return {"msg": "请求成功", "data": [1, 2, 3]}
\`\`\`

测试：

\`\`\`bash
# 连续访问 11 次，第 11 次会被限流
for i in {1..11}; do
    echo "请求 $i:"
    curl -s -o /dev/null -w "状态码: %{http_code}\\n" http://127.0.0.1:8000/api/data
done

# 查看限流响应
curl -i http://127.0.0.1:8000/api/data
# 期望：HTTP/1.1 429 Too Many Requests
\`\`\`

注意：这个例子用内存字典存储，重启服务就丢了，多实例部署也不共享。生产环境用 Redis 等分布式存储。

### 🆕 Demo 11：用 Request 实现简单的 CORS

跨域资源共享（CORS）是 Web API 的常见需求，让前端浏览器能访问不同域名的接口。

\`\`\`python
# 从 fastapi 导入 FastAPI、Request
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# 创建应用
app = FastAPI()

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    # CORS 中间件流程：
    # 1. 收到请求，先处理预检请求（OPTIONS）
    # 2. 给响应加上 CORS 头
    
    # 获取请求来源
    origin = request.headers.get("origin", "")
    
    # 允许的域名列表（生产环境用配置文件）
    allowed_origins = [
        "http://localhost:3000",      # 本地前端开发
        "http://127.0.0.1:3000",
        "https://example.com",         # 生产域名
    ]
    
    # 处理预检请求（OPTIONS 方法）
    # 浏览器在发实际请求前，会先发 OPTIONS 请求询问服务器是否允许
    if request.method == "OPTIONS":
        # 预检请求直接返回 200，并带上 CORS 头
        response = JSONResponse(content={})
        if origin in allowed_origins:
            # Access-Control-Allow-Origin：允许的来源
            response.headers["Access-Control-Allow-Origin"] = origin
            # Access-Control-Allow-Methods：允许的 HTTP 方法
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            # Access-Control-Allow-Headers：允许的请求头
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            # Access-Control-Max-Age：预检结果缓存时间（秒）
            # 86400 = 1 天，期间浏览器不再发预检请求
            response.headers["Access-Control-Max-Age"] = "86400"
        return response
    
    # 调用下一个处理者，拿到响应
    response = await call_next(request)
    
    # 给响应加上 CORS 头
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        # Access-Control-Allow-Credentials：允许带 Cookie
        # 如果前端要发 Cookie，这个必须设为 true
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# 测试路由
@app.get("/api/data")
def get_data():
    return {"msg": "跨域访问成功", "data": [1, 2, 3]}
\`\`\`

测试：

\`\`\`bash
# 模拟带 Origin 的请求
curl -H "Origin: http://localhost:3000" -i http://127.0.0.1:8000/api/data
# 期望：响应头里有 Access-Control-Allow-Origin: http://localhost:3000

# 模拟非法 Origin
curl -H "Origin: http://evil.com" -i http://127.0.0.1:8000/api/data
# 期望：响应头里没有 Access-Control-Allow-Origin
\`\`\`

注意：实际项目用 FastAPI 自带的 \`CORSMiddleware\`，不用手写。这里演示原理。

### 🆕 Demo 12：用 Request 实现链路追踪

链路追踪（distributed tracing）是微服务架构的关键能力，用一个 request_id 串起一次请求经过的所有服务。

\`\`\`python
# 从 fastapi 导入 FastAPI、Request
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uuid
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trace")

# 创建应用
app = FastAPI()

@app.middleware("http")
async def tracing_middleware(request: Request, call_next):
    # 链路追踪的核心：用一个 request_id 串联一次请求的所有日志
    
    # 第 1 步：获取或生成 request_id
    # 优先用上游服务传来的 X-Request-ID（链路延续）
    # 没有的话生成新的（链路起点）
    request_id = request.headers.get("x-request-id")
    if not request_id:
        request_id = str(uuid.uuid4())
    
    # 第 2 步：存到 request.state，路由函数和依赖项都能取到
    request.state.request_id = request_id
    request.state.trace_start = time.time()
    
    # 第 3 步：记录请求开始日志
    # 所有日志都带 request_id，方便用 grep 过滤同一次请求
    logger.info(f"[{request_id}] → {request.method} {request.url.path}")
    
    # 第 4 步：调用下一个处理者
    try:
        response = await call_next(request)
    except Exception as e:
        # 异常也要记录，带 request_id 方便排查
        logger.error(f"[{request_id}] ✗ 异常: {e}")
        raise
    
    # 第 5 步：计算耗时
    import time
    duration = (time.time() - request.state.trace_start) * 1000
    
    # 第 6 步：记录响应日志
    logger.info(
        f"[{request_id}] ← {response.status_code} {duration:.2f}ms"
    )
    
    # 第 7 步：在响应头返回 request_id
    # 前端拿到后，排查问题时把这个 ID 给后端，后端就能定位到具体日志
    response.headers["X-Request-ID"] = request_id
    
    return response

# 测试路由
@app.get("/api/users/{user_id}")
def get_user(user_id: int, request: Request):
    # 路由函数里也能拿到 request_id
    rid = request.state.request_id
    logger.info(f"[{rid}] 查询用户 {user_id}")
    return {"user_id": user_id, "request_id": rid}
\`\`\`

测试：

\`\`\`bash
# 不带 request_id，服务端生成
curl -i http://127.0.0.1:8000/api/users/42
# 响应头里会有 X-Request-ID: <uuid>

# 带 request_id（模拟上游服务传递）
curl -H "X-Request-ID: my-trace-id-123" -i http://127.0.0.1:8000/api/users/42
# 响应头里会有 X-Request-ID: my-trace-id-123
\`\`\`

日志输出：
\`\`\`
[my-trace-id-123] → GET /api/users/42
[my-trace-id-123] 查询用户 42
[my-trace-id-123] ← 200 5.67ms
\`\`\`

用 \`grep "my-trace-id-123" app.log\` 就能拿到这次请求的所有日志。

## 九、常见错误和避坑指南

### 坑 1：在同步函数里用 async 方法

\`\`\`python
# ❌ 错误：def 函数里 await
@app.post("/items")
def create_item(request: Request):
    body = await request.body()  # SyntaxError: 'await' outside async function
    return {"body": body}

# ✅ 正确：用 async def
@app.post("/items")
async def create_item(request: Request):
    body = await request.body()
    return {"body": body.decode()}
\`\`\`

\`request.body()\`、\`request.json()\`、\`request.form()\` 都是异步方法，必须用 \`async def\`。

### 坑 2：Request 参数被文档收录

\`\`\`python
# request: Request 不会出现在 /docs 里
# FastAPI 知道这是框架注入的，不是用户参数
@app.get("/items")
def list_items(request: Request, q: str = "default"):
    # /docs 只显示 q 参数，不显示 request
    return {"q": q}
\`\`\`

不用担心 \`Request\` 参数污染文档。

### 坑 3：body 被消费后 Pydantic 解析失败

\`\`\`python
# ❌ 错误：先读 body 再用 Pydantic 模型
@app.post("/items")
async def create_item(request: Request, item: ItemCreate):
    body = await request.body()  # 先读了 body
    # Pydantic 解析时 body 已经被消费，可能拿不到数据
    return {"item": item, "raw_size": len(body)}

# ✅ 正确：要么用 Pydantic，要么用 Request，别混用 body
# 如果都要，用 request.body() 后缓存，或者用依赖注入
\`\`\`

实际上 FastAPI 在解析 Pydantic body 时也会读 \`request.body()\`，但 FastAPI 做了缓存处理，所以上面那样写通常没问题。但如果你手动调用了 \`await request.stream()\`（流式读取），body 就只能读一次，Pydantic 就拿不到了。

### 坑 4：headers 大小写

\`\`\`python
# request.headers 大小写不敏感
# 下面三种写法等价
ua1 = request.headers.get("user-agent")
ua2 = request.headers.get("User-Agent")
ua3 = request.headers.get("USER-AGENT")
# 都能拿到值
\`\`\`

\`Headers\` 对象内部都转成小写存储，所以取的时候不区分大小写。

### 坑 5：request.client 可能为 None

\`\`\`python
# ❌ 直接访问 request.client.host 可能报错
@app.get("/ip")
def get_ip(request: Request):
    return {"ip": request.client.host}  # 如果 client 是 None，报错

# ✅ 先判断 None
@app.get("/ip")
def get_ip(request: Request):
    return {"ip": request.client.host if request.client else None}
\`\`\`

在某些测试环境或特殊部署下，\`request.client\` 可能是 \`None\`，访问 \`.host\` 会抛 \`AttributeError\`。

### 坑 6：URL 属性的坑

\`\`\`python
@app.get("/test")
def test(request: Request):
    # request.url 是 URL 对象，可以分解出各部分
    url = request.url
    # url.query 是查询字符串（如 "a=1&b=2"），不是字典
    # 它是原始字符串，需要自己解析才能用
    # 要拿成字典用 request.query_params（QueryParams 对象）
    # dict() 把 QueryParams 对象转成普通字典
    return {
        "query_string": url.query,           # "a=1&b=2"（原始字符串）
        "query_params": dict(request.query_params)  # {"a": "1", "b": "2"}（字典）
    }
\`\`\`

\`url.query\` 是原始字符串，\`query_params\` 是解析后的字典。

### 坑 7：path_params 是字典不是对象

\`\`\`python
@app.get("/users/{user_id}")
def get_user(user_id: int, request: Request):
    # request.path_params 是字典 {"user_id": "42"}
    # 注意：这里是字符串 "42"，不是 int 42
    # 类型转换是 FastAPI 给函数参数时做的，path_params 里是原始字符串
    raw = request.path_params["user_id"]  # "42"
    return {"user_id": user_id, "raw": raw, "raw_type": type(raw).__name__}
\`\`\`

\`path_params\` 存的是原始字符串，类型转换只在函数参数注入时发生。

### 坑 8：中间件异常没处理

\`\`\`python
# ❌ 错误：中间件里不处理异常，会导致 500
@app.middleware("http")
async def bad_middleware(request: Request, call_next):
    response = await call_next(request)  # 这里抛异常会直接 500
    return response

# ✅ 正确：用 try/except 包住 call_next
@app.middleware("http")
async def good_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as e:
        # 记录异常，返回友好的 500 响应
        logger.error(f"请求异常: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "内部服务器错误"}
        )
    return response
\`\`\`

中间件是"全局拦截器"，异常处理要谨慎，否则一个 bug 就能让整个服务挂掉。

## 十、何时用 Request，何时用 Path/Query

| 场景 | 推荐方式 |
|------|---------|
| 路径参数 | \`Path()\` |
| 查询参数 | \`Query()\` |
| JSON body | Pydantic 模型 |
| 表单 | \`Form()\` |
| 文件上传 | \`UploadFile\` |
| 请求头 | \`Header()\` |
| Cookie | \`Cookie()\` |
| 客户端 IP、UA | \`Request\` |
| 原始 body 字节 | \`Request\` |
| 中间件 | \`Request\` |
| 链路追踪 | \`Request\` + \`request.state\` |

原则：**能用高级封装就用高级封装，只有在需要原始数据时才用 \`Request\`**。高级封装有校验、文档、类型转换，\`Request\` 啥都要自己处理。

## 十一、动手实验

### 实验 1：观察请求信息

启动服务后访问 \`/debug\` 接口，观察返回的请求信息：

\`\`\`bash
# 启动服务（把 Demo 2 保存为 main.py）
uvicorn main:app --reload

# 用不同 UA 访问
curl -A "Mozilla/5.0" "http://127.0.0.1:8000/debug?skip=0&limit=10"
curl -A "curl/8.0" "http://127.0.0.1:8000/debug?skip=0&limit=10"

# 带 Cookie 访问
curl -b "session_id=abc123" "http://127.0.0.1:8000/debug"

# 带自定义头访问
curl -H "X-Custom-Header: hello" "http://127.0.0.1:8000/debug"
\`\`\`

观察 \`headers\` 字段的变化，理解请求头的传递机制。

### 实验 2：实现一个访问日志中间件

参考 Demo 8，实现一个中间件，记录每个请求的：

- 时间戳
- HTTP 方法 + 路径
- 客户端 IP
- User-Agent
- 响应状态码
- 耗时（毫秒）

把日志写到文件 \`access.log\`，格式参考：

\`\`\`
2024-07-13 10:00:00 | GET /api/users/42 | 127.0.0.1 | Mozilla/5.0 | 200 | 5.23ms
\`\`\`

### 实验 3：实现一个简单的限流

参考 Demo 10，实现一个限流中间件：

- 每个 IP 每分钟最多 30 次请求
- 超过返回 429 状态码
- 响应头带 \`X-RateLimit-Remaining\` 显示剩余次数

测试：

\`\`\`bash
# 用 ab（Apache Bench）压测
ab -n 50 -c 1 http://127.0.0.1:8000/api/data
# 观察有多少请求成功，多少被限流
\`\`\`

### 实验 4：实现链路追踪

参考 Demo 12，实现：

1. 中间件为每个请求生成 \`request_id\`（优先用上游传来的）
2. 所有日志带 \`request_id\`
3. 响应头返回 \`request_id\`

测试：

\`\`\`bash
# 不带 request_id
curl -i http://127.0.0.1:8000/api/data
# 记录响应头里的 X-Request-ID

# 带自定义 request_id
curl -H "X-Request-ID: trace-001" -i http://127.0.0.1:8000/api/data
# 验证响应头里是否返回 trace-001
\`\`\`

### 实验 5：探索 \`request.scope\`

访问 \`/scope\` 接口，对比 \`request.scope\` 和 \`request\` 的各种属性：

\`\`\`bash
curl http://127.0.0.1:8000/scope
\`\`\`

观察 \`query_string\` 是 bytes 类型（如 \`b"skip=0&limit=10"\`），需要 \`.decode()\` 转字符串。

## 本章小结

| 属性/方法 | 用途 |
|-----------|------|
| \`request.method\` | HTTP 方法 |
| \`request.url\` | 完整 URL（可分解） |
| \`request.headers\` | 请求头（大小写不敏感） |
| \`request.query_params\` | 查询参数字典 |
| \`request.path_params\` | 路径参数字典（原始字符串） |
| \`request.cookies\` | Cookie |
| \`request.client\` | 客户端 IP/端口 |
| \`request.state\` | 请求级共享状态 |
| \`await request.body()\` | 原始 body 字节 |
| \`await request.json()\` | JSON body |
| \`await request.form()\` | 表单数据 |
| \`request.scope\` | ASGI 原始字典 |

\`Request\` 对象是 FastAPI 的"逃生舱"——当高级封装不够用时，它让你能访问请求的任何部分。但日常开发 90% 的需求用 \`Path\`/\`Query\`/Pydantic 就够了，\`Request\` 主要用于中间件、日志、链路追踪这些"横切关注点"。

到这里，路径与查询参数这块讲完了。你已经能处理 URL 里的各种参数、做校验、读原始请求。下一批章节进入请求体——用 Pydantic 模型接收 JSON body，这是构建真正业务接口的关键。
`,
  },
];
