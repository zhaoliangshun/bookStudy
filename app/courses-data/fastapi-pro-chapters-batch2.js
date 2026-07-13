// =============================================================
// FastAPI 现代开发全书 - 第 2 批章节
// -------------------------------------------------------------
// 分组：路由与请求
// 本批包含 4 章：
//   fp-path-params:   路径参数与类型校验
//   fp-query-params:  查询参数与默认值
//   fp-request-body:  请求体与 Pydantic 模型
//   fp-form-files:    表单、文件上传与多部分数据
// =============================================================

export const chapters = [
  {
    id: "fp-path-params",
    group: "路由与请求",
    icon: "🛤️",
    title: "路径参数与类型校验",
    content: `# 路径参数与类型校验

从本章开始，我们进入 FastAPI 的核心日常 API：路由参数处理。路径参数（Path Parameters）是 RESTful API 中最基础的元素——\`/users/42\`、\`/orders/2024/01\` 这些 URL 片段都是路径参数。FastAPI 对路径参数的支持远不止"取出字符串"那么简单，它会基于类型注解自动完成类型转换、范围校验、枚举约束，并在出错时返回结构化错误信息。本章会从最基础语法讲到高级用法，把每一个细节讲透。

## 一、路径参数基础语法

路径参数通过在路径字符串中用花括号 \`{}\` 占位来声明。FastAPI 会把 URL 中对应位置的字符串提取出来，传给函数同名参数。

### Demo 1: 最基础的路径参数

\`\`\`python
# path_basic.py
from fastapi import FastAPI

app = FastAPI()

# {item_id} 是路径占位符
# 函数参数 item_id 必须与占位符同名
@app.get("/items/{item_id}")
def read_item(item_id):
    # 此时 item_id 是字符串类型（因为没有类型注解）
    # 访问 /items/42  -> item_id == "42"（字符串）
    # 访问 /items/hello -> item_id == "hello"
    return {"item_id": item_id}

# 启动后访问：
#   /items/42       返回 {"item_id":"42"}
#   /items/abc      返回 {"item_id":"abc"}
#   /items/         返回 404（路径不匹配）
\`\`\`

注意：没有类型注解时，FastAPI 默认把路径参数当作字符串处理。这通常不是你想要的——下面我们就用类型注解让它自动转换。

## 二、类型注解自动校验

FastAPI 最强大的能力之一，就是利用 Python 的类型注解（type hints）对路径参数做自动类型转换和校验。声明为 \`int\` 的参数，FastAPI 会尝试把字符串转成整数；转换失败会自动返回 HTTP 422 错误，错误信息极其详细。

### Demo 2: int 类型自动转换与校验

\`\`\`python
# path_int.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):
    # item_id: int 告诉 FastAPI：
    #   1. 把 URL 中的字符串转成 int
    #   2. 转换失败时返回 422（不是 404）
    #   3. 自动文档里会标注此参数是 integer
    return {"item_id": item_id, "type": type(item_id).__name__}

# 访问 /items/42   返回 {"item_id":42,"type":"int"}
# 访问 /items/3.14 返回 422（"3.14" 不是合法整数）
# 访问 /items/abc  返回 422，错误信息类似：
#   {
#     "detail": [{
#       "type": "int_parsing",
#       "loc": ["path", "item_id"],
#       "msg": "Input should be a valid integer..."
#     }]
#   }
\`\`\`

422 错误的响应体结构非常规整，包含 \`type\`（错误类型）、\`loc\`（出错位置）、\`msg\`（错误描述）。前端可以据此做精准的错误提示。

### Demo 3: float 类型与混合类型

\`\`\`python
# path_float.py
from fastapi import FastAPI

app = FastAPI()

# float 参数：自动转 float
@app.get("/weight/{value}")
def read_weight(value: float):
    # /weight/3.14   -> value == 3.14
    # /weight/5      -> value == 5.0（整数也能转 float）
    # /weight/abc    -> 422
    return {"weight": value}

# 多个路径参数：按 URL 顺序匹配
@app.get("/users/{user_id}/orders/{order_id}")
def read_user_order(user_id: int, order_id: int):
    # /users/42/orders/100 -> user_id=42, order_id=100
    return {"user_id": user_id, "order_id": order_id}
\`\`\`

## 三、int / float / str / Path 转换器对比

FastAPI 内置支持的路径参数类型有：

| 类型 | 行为 | 失败时 |
|------|------|--------|
| \`int\` | 转整数 | 422 |
| \`float\` | 转浮点 | 422 |
| \`str\` | 原样字符串 | 不会失败 |
| \`bool\` | 智能转换（true/false/1/0/yes/no） | 422 |
| \`UUID\` | 转 \`uuid.UUID\` | 422 |
| \`datetime\` | 转 \`datetime\` | 422 |
| \`Enum\` | 必须是枚举成员之一 | 422 |
| \`Path()\` | 任意类型 + 额外校验 | 422 |

### Demo 4: bool 的智能转换

\`\`\`python
# path_bool.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/flag/{value}")
def read_flag(value: bool):
    # bool 的转换规则比想象中"宽松"：
    #   /flag/true  -> True
    #   /flag/True  -> True
    #   /flag/1     -> True
    #   /flag/yes   -> True
    #   /flag/on    -> True
    #   /flag/false -> False
    #   /flag/0     -> False
    #   /flag/no    -> False
    #   /flag/off   -> False
    #   /flag/maybe -> 422（不识别）
    return {"flag": value}
\`\`\`

### Demo 5: 用 Path() 做数值范围校验

\`\`\`python
# path_validate.py
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(
    # Path() 用于给路径参数加额外约束
    # gt: 大于（>），ge: 大于等于（>=）
    # lt: 小于（<），le: 小于等于（<=）
    item_id: int = Path(..., gt=0, le=1000, description="商品ID，1~1000")
):
    # gt=0  -> item_id 必须 > 0
    # le=1000 -> item_id 必须 <= 1000
    # 访问 /items/0     -> 422（必须 > 0）
    # 访问 /items/500   -> 200
    # 访问 /items/1001  -> 422（必须 <= 1000）
    # 访问 /items/-5    -> 422
    return {"item_id": item_id}

# Path 的第一个参数 ... 表示"必填"（路径参数本身就是必填的，但写 ... 是惯例）
# 常用参数：
#   gt / ge / lt / le  数值比较
#   min_length / max_length  字符串长度
#   pattern  正则约束
#   description  文档描述
#   example  示例值
\`\`\`

## 四、枚举路径参数

当路径参数只能取一组固定值时（比如订单状态 \`pending\`/\`paid\`/\`shipped\`/\`done\`），用枚举（Enum）比 \`str\` 更安全——FastAPI 会自动校验值是否在枚举范围内，并在文档里展示可选项。

### Demo 6: 用 Enum 约束路径参数

\`\`\`python
# path_enum.py
from fastapi import FastAPI
from enum import Enum

app = FastAPI()

# 定义一个 str + Enum 的混合类
# 继承 str 是为了让 FastAPI 把它当字符串处理（推荐写法）
class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    done = "done"
    cancelled = "cancelled"

# 把枚举类作为类型注解
@app.get("/orders/{status}")
def list_orders_by_status(status: OrderStatus):
    # /orders/pending -> status == OrderStatus.pending
    # /orders/xyz     -> 422，错误信息会列出所有合法值
    return {"status": status, "value": status.value}

# 自动文档（/docs）会显示一个下拉框，列出所有可选值
# 这是枚举路径参数相比普通 str 的最大优势
\`\`\`

## 五、路径顺序的重要性

这是一个**非常常见的坑**：路径定义的顺序会影响匹配结果。FastAPI 是按"注册顺序"匹配路由的，第一个匹配成功的路由处理请求。

### Demo 7: 路径顺序冲突示例

\`\`\`python
# path_order.py
from fastapi import FastAPI

app = FastAPI()

# 错误写法：把通配路径放在前面
@app.get("/users/{user_id}")
def get_user(user_id: str):
    # 这个路由会"吃掉" /users/me、/users/admin 等所有路径
    return {"route": "get_user", "user_id": user_id}

@app.get("/users/me")
def get_me():
    # 永远不会被调用！因为上面的路由先匹配上了
    # /users/me 中，me 被当成 user_id 传给了 get_user
    return {"route": "get_me"}

# 正确写法：固定路径必须在动态路径之前定义
@app.get("/users/me")          # 先定义固定路径
def get_me_fixed():
    return {"route": "get_me_fixed"}

@app.get("/users/{user_id}")   # 再定义动态路径
def get_user_fixed(user_id: str):
    return {"route": "get_user_fixed", "user_id": user_id}

# 规则：越具体的路径越靠前，越通配的路径越靠后
\`\`\`

**记忆口诀**：**具体优先，通配靠后**。把 \`/users/me\`、\`/users/admin\` 这种固定路径放在 \`/users/{user_id}\` 之前。

## 六、路径参数与查询参数的区分

一个常见疑问：FastAPI 怎么知道某个参数是路径参数还是查询参数？规则很简单：

- 如果参数名出现在路径字符串的 \`{}\` 中 → 路径参数
- 否则 → 查询参数（从 query string 解析）

\`\`\`python
# Demo 8: 路径参数 vs 查询参数
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    # item_id 出现在路径 {item_id} 中 -> 路径参数
    # q 不在路径中 -> 查询参数
    # 访问 /items/42?q=hello
    #   item_id=42（来自路径）
    #   q="hello"（来自 query string）
    return {"item_id": item_id, "q": q}
\`\`\`

## 七、422 错误的响应结构

路径参数校验失败时，FastAPI 返回 422 状态码，响应体是结构化的错误信息。理解它的结构对前后端联调很重要。

\`\`\`json
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
- \`type\`：错误类型标识（\`int_parsing\`、\`less_than_equal\` 等）。
- \`loc\`：错误位置，第一个元素是参数来源（\`path\`、\`query\`、\`body\`），第二个是参数名。
- \`msg\`：人类可读的错误描述。
- \`input\`：原始输入值。
- \`url\`：Pydantic 文档链接，便于查错。

前端可以遍历 \`detail\` 数组，根据 \`loc\` 定位到具体字段，给出针对性提示。

## 八、路径参数的最佳实践

1. **永远加类型注解**：\`item_id: int\` 比 \`item_id\` 安全得多。
2. **数值 ID 加范围校验**：\`Path(..., gt=0)\` 防止负数 ID。
3. **固定值用枚举**：状态、类型字段用 \`Enum\`，文档自动变成下拉框。
4. **注意路径顺序**：具体路径优先，通配路径靠后。
5. **路径参数命名要清晰**：\`{user_id}\` 比 \`{id}\` 好，避免在多资源场景下混淆。
6. **避免在路径里传敏感信息**：路径会被日志、代理、浏览器历史记录，密码、token 走 Header 或 Body。

## 九、本章小结

- 路径参数用 \`{参数名}\` 占位，函数参数同名即可接收。
- 类型注解（\`int\`/\`float\`/\`bool\`/\`UUID\`/\`Enum\`）触发自动转换与校验，失败返回 422。
- \`Path()\` 可加数值范围、字符串长度、正则等高级约束。
- \`Enum\` 让固定取值字段在文档里变成下拉框，开发体验极佳。
- **路径顺序至关重要**：固定路径必须在通配路径之前注册。
- 422 错误体结构化，前端可据此做精准提示。

下一章我们看查询参数——它和路径参数形影不离，但默认值、可选性、校验机制都有自己的一套规则。
`
  },

  {
    id: "fp-query-params",
    group: "路由与请求",
    icon: "🔍",
    title: "查询参数与默认值",
    content: `# 查询参数与默认值

查询参数（Query Parameters）是 URL 中问号后面那部分：\`/items?skip=0&limit=10\`。它是 API 设计中表达"过滤、分页、排序、可选条件"的标准方式。和路径参数不同，查询参数通常是可选的、有默认值的，且数量可多可少。本章会从基础语法讲到 \`Query()\` 高级用法，并给出分页参数的最佳实践。

## 一、查询参数基础

函数参数中，**没有出现在路径字符串 \`{}\` 里的参数**，FastAPI 一律视为查询参数。它们从 URL 的 query string 解析。

### Demo 1: 最基础的查询参数

\`\`\`python
# query_basic.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/items")
def list_items(skip: int, limit: int):
    # skip 和 limit 都没出现在路径中 -> 查询参数
    # 访问 /items?skip=0&limit=10
    #   skip=0, limit=10
    # 访问 /items?skip=5  -> 422（limit 没默认值，必填）
    return {"skip": skip, "limit": limit}
\`\`\`

**注意**：上例中 \`skip\` 和 \`limit\` 都没有默认值，所以**必填**。如果客户端不传，会返回 422 错误。这通常不是我们想要的——分页参数应该是可选的，有合理默认值。

## 二、必选 vs 可选参数

通过是否给默认值，可以控制查询参数是必选还是可选。

### Demo 2: 必选、可选、默认值

\`\`\`python
# query_required_optional.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/search")
def search(
    keyword: str,                  # 必选：没有默认值
    category: str = "all",         # 可选：默认 "all"
    page: int = 1,                 # 可选：默认 1
    sort: str | None = None,       # 可选：默认 None（表示不排序）
):
    # /search?keyword=phone
    #   keyword="phone", category="all", page=1, sort=None
    # /search?keyword=phone&category=elec&page=2&sort=price
    #   全部自定义
    # /search
    #   422 错误：keyword 必填
    return {
        "keyword": keyword,
        "category": category,
        "page": page,
        "sort": sort,
    }
\`\`\`

判断规则：
- 参数**没有默认值** → 必选。
- 参数**有默认值**（包括 \`None\`）→ 可选，客户端不传时用默认值。
- 想表达"可选字符串"用 \`str | None = None\`，而不是 \`Optional[str] = None\`（旧写法）。

## 三、默认值机制详解

默认值的作用很直观：客户端不传这个参数时，使用默认值。但有几个细节值得注意。

### Demo 3: 默认值的常见陷阱

\`\`\`python
# query_default_pitfalls.py
from fastapi import FastAPI

app = FastAPI()

# 陷阱 1：可变默认值
# @app.get("/bad")
# def bad(items: list[str] = []):   # 错误！可变默认值会在多次请求间共享
#     items.append("x")
#     return items
# 第一次调用返回 ["x"]，第二次返回 ["x","x"]... 严重 bug

# 正确写法：用 None + 函数内初始化
@app.get("/good")
def good(items: list[str] | None = None):
    if items is None:
        items = []
    items.append("x")
    return items

# 陷阱 2：0 / False / "" 等"假值"作为默认值
@app.get("/flags")
def flags(debug: bool = False, count: int = 0):
    # debug=False, count=0 都是合法默认值
    # 客户端不传时用默认；传 /flags?debug=true&count=5 时用传入值
    # 注意：判断"客户端是否传了"不能用 if debug:，因为 False 是假值
    # 如果需要区分"没传"和"传了 False"，用 None 做默认值
    return {"debug": debug, "count": count}
\`\`\`

## 四、Query() 高级用法

\`Query()\` 是 FastAPI 提供的工具函数，用于给查询参数添加校验、文档、别名等高级配置。当查询参数只是简单类型 + 默认值时，不需要 \`Query()\`；但要做校验或加文档时，它就派上用场了。

### Demo 4: 用 Query() 加校验

\`\`\`python
# query_validate.py
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
def list_items(
    # Query(...) 中的 ... 表示"必填"
    # max_length / min_length: 字符串长度校验
    # pattern: 正则校验
    q: str = Query(..., min_length=1, max_length=50, pattern="^[a-zA-Z0-9 ]+$"),
    # 数值校验：gt/lt/ge/le
    skip: int = Query(0, ge=0, description="跳过条数，>=0"),
    limit: int = Query(10, ge=1, le=100, description="每页数量，1~100"),
):
    # q 必填，1~50 字符，只允许字母数字空格
    # skip 默认 0，必须 >=0
    # limit 默认 10，必须 1~100
    return {"q": q, "skip": skip, "limit": limit}

# /items?q=phone -> ok
# /items -> 422（q 必填）
# /items?q=phonographverylong... -> 422（超长）
# /items?q=phone&limit=200 -> 422（limit 必须 <=100）
\`\`\`

### Demo 5: 别名（alias）与弃用（deprecated）

\`\`\`python
# query_alias.py
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
def list_items(
    # alias: 让 URL 参数名与 Python 参数名不一致
    # 比如前端用 "q-search" 作为参数名（带连字符），但 Python 标识符不能有连字符
    q: str | None = Query(default=None, alias="q-search", min_length=2),

    # deprecated=True: 在文档里标记为"已弃用"，但仍能使用
    old_param: str | None = Query(default=None, deprecated=True, description="已弃用，请用 q"),
):
    # 访问 /items?q-search=phone -> q="phone"
    # 访问 /items?old_param=x    -> old_param="x"（文档里显示删除线）
    return {"q": q, "old_param": old_param}

# alias 的常见场景：
#   1. URL 参数名含连字符、点号等非法 Python 标识符
#   2. 兼容旧 API 命名（snake_case vs camelCase）
#   3. 参数名与 Python 关键字冲突
\`\`\`

### Demo 6: 列表查询参数

\`\`\`python
# query_list.py
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
def list_items(
    # list[str] 类型的查询参数：支持多次传递同名参数
    tags: list[str] = Query(default=[]),
    # 也可以用 Query(default_factory=list) 等效写法
):
    # 访问 /items?tags=phone&tags=case -> tags=["phone","case"]
    # 访问 /items -> tags=[]
    return {"tags": tags}

# 注意：list 类型查询参数不能用 ?tags=a,b 的形式（默认情况下）
# 必须用 ?tags=a&tags=b 多次传递
# 如果想用逗号分隔，需要自己解析或用自定义依赖
\`\`\`

## 五、分页参数最佳实践

分页是查询参数最经典的应用场景。下面是一个生产级的分页参数设计。

### Demo 7: 标准分页接口

\`\`\`python
# pagination.py
from fastapi import FastAPI, Query

app = FastAPI()

# 模拟数据
fake_items = [{"id": i, "name": f"item-{i}"} for i in range(1, 1001)]

@app.get("/items")
def list_items(
    # 分页三件套：page、page_size（或 skip、limit）
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量，1~100"),
    # 排序
    sort_by: str = Query("id", description="排序字段"),
    order: str = Query("asc", pattern="^(asc|desc)$", description="排序方向"),
    # 过滤
    keyword: str | None = Query(None, min_length=1, max_length=50, description="关键词搜索"),
):
    # 1. 过滤
    items = fake_items
    if keyword:
        items = [x for x in items if keyword.lower() in x["name"].lower()]

    # 2. 排序
    reverse = (order == "desc")
    items = sorted(items, key=lambda x: x[sort_by], reverse=reverse)

    # 3. 分页
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    # 4. 返回带元数据的响应
    return {
        "items": page_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "has_next": end < total,
        "has_prev": page > 1,
    }

# 设计要点：
# 1. page 从 1 开始（不是 0），符合直觉
# 2. page_size 有上下限（1~100），防止恶意大查询
# 3. 返回 total 和 total_pages，前端能显示"共 X 页"
# 4. has_next / has_prev 方便前端判断按钮是否可点
\`\`\`

## 六、skip+limit vs page+page_size

分页有两种主流写法，各有适用场景：

\`\`\`text
方案 A：skip + limit（偏移量）
  /items?skip=0&limit=20    第 1 页
  /items?skip=20&limit=20   第 2 页
  /items?skip=40&limit=20   第 3 页
  优点：直接对应 SQL 的 OFFSET/LIMIT
  缺点：前端要自己算 skip

方案 B：page + page_size（页码）
  /items?page=1&page_size=20  第 1 页
  /items?page=2&page_size=20  第 2 页
  优点：符合人类直觉
  缺点：后端要算 skip = (page-1) * page_size
\`\`\`

两者可以互转：\`skip = (page - 1) * page_size\`。给前端的接口建议用 page+page_size（更友好），内部查数据库用 skip+limit（直接对应 SQL）。

## 七、查询参数的 URL 编码

查询参数里的特殊字符（空格、中文、&、= 等）必须做 URL 编码。FastAPI/Starlette 会自动解码，但你写客户端测试时要注意。

\`\`\`python
# Demo 8: URL 编码示例
# 原始意图：q = "hello world & special"
# 编码后：  ?q=hello%20world%20%26%20special
# FastAPI 接收到的 q 已经是解码后的 "hello world & special"
#
# 中文示例：
# 原始：q = "手机"
# 编码：?q=%E6%89%8B%E6%9C%BA
# FastAPI 接收到的 q = "手机"
#
# 用 httpx 测试时，httpx 会自动编码：
#   client.get("/items", params={"q": "hello world"})
#   实际发送：GET /items?q=hello+world
\`\`\`

## 八、查询参数与路径参数混合

真实接口往往同时有路径参数和查询参数，它们的声明位置灵活，FastAPI 能正确识别。

\`\`\`python
# Demo 9: 混合参数
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/users/{user_id}/orders")
def list_user_orders(
    user_id: int,                                    # 路径参数（在路径 {} 中）
    status: str | None = Query(None),                # 查询参数（不在路径中）
    page: int = Query(1, ge=1),                      # 查询参数
    page_size: int = Query(20, ge=1, le=100),        # 查询参数
):
    # /users/42/orders?status=paid&page=2&page_size=10
    # user_id=42（路径），status="paid"（查询），page=2, page_size=10
    return {
        "user_id": user_id,
        "status": status,
        "page": page,
        "page_size": page_size,
    }

# FastAPI 识别规则：
#   1. 参数名出现在路径 {} 中 -> 路径参数
#   2. 是 Pydantic BaseModel 类型 -> 请求体（下一章讲）
#   3. 其他 -> 查询参数
\`\`\`

## 九、本章小结

- 查询参数 = 不在路径 \`{}\` 中的函数参数，从 query string 解析。
- 没默认值 → 必选；有默认值（含 None）→ 可选。
- **永远不要用可变对象作为默认值**（\`list\`/\`dict\`/\`set\`），用 \`None\` + 函数内初始化。
- \`Query()\` 用于加校验（\`min_length\`/\`max_length\`/\`pattern\`/\`gt\`/\`lt\`）、别名（\`alias\`）、弃用标记（\`deprecated\`）。
- 列表查询参数用 \`list[str]\`，多次传递同名参数。
- 分页参数推荐 \`page + page_size\`（对前端友好），内部转 \`skip + limit\` 查 SQL。
- 查询参数和路径参数可自由混合，FastAPI 按规则自动识别。

下一章我们进入请求体——这是 POST/PUT 接口的核心，用 Pydantic 模型定义复杂 JSON 数据结构。
`
  },

  {
    id: "fp-request-body",
    group: "路由与请求",
    icon: "📦",
    title: "请求体与 Pydantic 模型",
    content: `# 请求体与 Pydantic 模型

GET 请求通常用查询参数传少量数据，但 POST/PUT/PATCH 创建或更新资源时，数据往往又多又复杂——几十个字段、嵌套结构、列表、字典。这时查询参数就力不从心了，需要用**请求体（Request Body）**承载 JSON 数据。FastAPI 用 Pydantic 模型来定义请求体，这是它最强大的能力之一：你只声明数据形状，框架自动完成校验、转换、文档。本章会从最简单的 BaseModel 讲到嵌套模型、\`Body()\` 高级用法，以及请求体与路径/查询参数的混合。

## 一、什么是请求体

请求体是 HTTP 请求中携带的数据部分，通常用于 POST/PUT/PATCH。在 RESTful API 中，请求体一般是 JSON 格式。

\`\`\`text
POST /items HTTP/1.1
Content-Type: application/json

{
  "name": "iPhone",
  "price": 999.99,
  "tags": ["phone", "apple"]
}
\`\`\`

FastAPI 用 Pydantic 的 \`BaseModel\` 来定义请求体的形状。Pydantic 会自动校验：字段是否齐全？类型对不对？数值范围合不合法？校验失败返回 422。

## 二、BaseModel 定义请求体

### Demo 1: 最基础的请求体

\`\`\`python
# body_basic.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 1. 定义一个 Pydantic 模型
class Item(BaseModel):
    name: str                   # 必填：必须是字符串
    price: float                # 必填：必须是浮点数
    tags: list[str] = []        # 可选：默认空列表（注意：Pydantic v2 中这样写是安全的）

# 2. 把模型作为类型注解
@app.post("/items")
def create_item(item: Item):
    # item 已经是 Item 实例，类型和校验都通过了
    # 可以直接访问字段：item.name, item.price, item.tags
    return {
        "name": item.name,
        "price": item.price,
        "tags": item.tags,
    }

# 请求示例：
# POST /items
# Content-Type: application/json
# {"name": "iPhone", "price": 999.99, "tags": ["phone"]}
# 响应：{"name":"iPhone","price":999.99,"tags":["phone"]}

# 校验失败示例：
# POST /items
# {"name": "iPhone"}              -> 422（price 必填）
# {"name": "iPhone", "price": "abc"} -> 422（price 必须是数字）
# {"price": 999.99}               -> 422（name 必填）
\`\`\`

FastAPI 看到 \`item: Item\` 这个类型注解（Item 是 BaseModel 子类），就识别出它是请求体参数，自动从请求 body 解析 JSON 并校验。

## 三、Field() 字段校验

\`Field()\` 是 Pydantic 提供的工具，给模型字段加约束和文档。

### Demo 2: 用 Field() 约束字段

\`\`\`python
# body_field.py
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    # ... 表示必填
    # min_length/max_length: 字符串长度
    name: str = Field(..., min_length=1, max_length=100, description="商品名")
    # gt=0: 价格必须 > 0
    price: float = Field(..., gt=0, description="价格，必须大于 0")
    # ge=0: 库存必须 >= 0
    stock: int = Field(default=0, ge=0, description="库存")
    # max_items 校验列表长度（用 max_length）
    tags: list[str] = Field(default=[], max_length=10, description="最多 10 个标签")
    # pattern: 正则校验
    sku: str = Field(..., pattern=r"^[A-Z]{3}-\\d{4}$", description="SKU 格式 ABC-1234")

@app.post("/items")
def create_item(item: Item):
    return item

# 合法请求：{"name":"iPhone","price":999.99,"sku":"IPH-0001"}
# 非法示例：
#   {"name":"","price":1,"sku":"IPH-0001"}     -> 422（name 长度 <1）
#   {"name":"x","price":-1,"sku":"IPH-0001"}   -> 422（price 必须 >0）
#   {"name":"x","price":1,"sku":"iph-0001"}    -> 422（sku 大小写不符）
#   {"name":"x","price":1,"sku":"IPH-0001","tags":[...11 个...]} -> 422（tags 超 10 个）
\`\`\`

\`Field()\` 常用参数：
- \`...\`：必填（Ellipsis）。
- \`default\`：默认值。
- \`gt/ge/lt/le\`：数值大于/大于等于/小于/小于等于。
- \`min_length/max_length\`：字符串或列表长度。
- \`pattern\`：正则匹配。
- \`description\`：文档描述。
- \`example\`：示例值。

## 四、嵌套模型

Pydantic 模型可以嵌套——一个模型的字段是另一个模型。这非常适合表达层级数据。

### Demo 3: 嵌套模型

\`\`\`python
# body_nested.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Address(BaseModel):
    province: str
    city: str
    street: str
    zip_code: str | None = None    # 可选

class User(BaseModel):
    name: str
    age: int
    address: Address               # 嵌套模型（必填）

@app.post("/users")
def create_user(user: User):
    # user.address 自动是 Address 实例
    return {
        "name": user.name,
        "city": user.address.city,        # 链式访问
        "zip": user.address.zip_code,
    }

# 请求体示例：
# {
#   "name": "Alice",
#   "age": 30,
#   "address": {
#     "province": "广东",
#     "city": "深圳",
#     "street": "科技园",
#     "zip_code": "518000"
#   }
# }
#
# 如果 address 字段缺失或结构不对，会返回 422
# 错误信息会精确指出出错的位置，如 loc=["body","address","city"]
\`\`\`

## 五、列表与字典字段

模型字段可以是列表、字典，甚至是模型列表。

### Demo 4: 列表与字典字段

\`\`\`python
# body_list_dict.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class OrderItem(BaseModel):
    product_id: int
    quantity: int

class Order(BaseModel):
    # 模型列表：每个元素都是 OrderItem
    items: list[OrderItem]
    # 字典字段：键是字符串，值是任意类型
    # 这里 metadata: dict[str, str] 表示键值都是字符串
    metadata: dict[str, str] = {}
    # 字典值也可以是模型
    # extra: dict[str, OrderItem] = {}

@app.post("/orders")
def create_order(order: Order):
    total = sum(item.quantity for item in order.items)
    return {
        "item_count": len(order.items),
        "total_quantity": total,
        "metadata": order.metadata,
    }

# 请求体示例：
# {
#   "items": [
#     {"product_id": 1, "quantity": 2},
#     {"product_id": 5, "quantity": 1}
#   ],
#   "metadata": {"source": "web", "campaign": "summer"}
# }
\`\`\`

## 六、可选字段与默认值

### Demo 5: 各种"可选"写法

\`\`\`python
# body_optional.py
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

class Item(BaseModel):
    name: str                              # 必填
    price: float                           # 必填
    description: str | None = None         # 可选，默认 None
    stock: int = 0                         # 可选，默认 0
    tags: list[str] = []                   # 可选，默认空列表
    created_at: datetime | None = None     # 可选，默认 None

@app.post("/items")
def create_item(item: Item):
    return item

# 各种请求：
# 最简：{"name":"x","price":1}
#   -> description=None, stock=0, tags=[], created_at=None
# 完整：{"name":"x","price":1,"description":"...","stock":5,"tags":["a"],"created_at":"2024-01-01T00:00:00"}
#   -> 所有字段都有值
\`\`\`

**三种"可选"写法对比**：

\`\`\`text
1. field: str | None = None     字段可不传，传了可以是 null，默认 None
2. field: str = "default"       字段可不传，默认 "default"，但传了不能是 null
3. field: Optional[str] = None  等同于写法 1（旧风格，需要 from typing import Optional）
\`\`\`

Pydantic v2 + Python 3.10+ 推荐用 \`str | None = None\`，简洁清晰。

## 七、Body() 高级用法

\`Body()\` 用于给请求体字段加额外配置，或声明"额外的"非模型字段。

### Demo 6: Body() 的多种用途

\`\`\`python
# body_advanced.py
from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
def create_item(
    item: Item,
    # 用 Body() 声明一个不在模型里的"额外"字段
    # 这个字段会出现在请求体 JSON 中，但不在 Item 模型里
    priority: int = Body(default=0, ge=0, le=10, description="优先级 0~10"),
    # 也可以用 Body() 给单个值字段加文档
    note: str | None = Body(default=None, max_length=200),
):
    return {"item": item, "priority": priority, "note": note}

# 请求体示例：
# {
#   "item": {"name": "iPhone", "price": 999},
#   "priority": 5,
#   "note": "VIP 客户"
# }
# 注意：当请求体只有一个 BaseModel 字段时，FastAPI 默认把它作为整个 body
# 但加了 Body() 额外字段后，FastAPI 会把 BaseModel 嵌套到字段名下
\`\`\`

### Demo 7: embed 嵌套模式

\`\`\`python
# body_embed.py
from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 情况 A：只有一个 BaseModel 参数（默认行为）
@app.post("/items-a")
def create_a(item: Item):
    # 请求体直接是 Item 的内容
    # {"name":"x","price":1}
    return item

# 情况 B：用 embed=True 让 Item 嵌套在字段名下
@app.post("/items-b")
def create_b(item: Item = Body(..., embed=True)):
    # 请求体是 {"item": {"name":"x","price":1}}
    # 注意多了一层 "item" 包装
    return item

# embed 的用途：
#   1. 多个 Body 参数时，FastAPI 自动嵌套（用字段名区分）
#   2. 单参数时想保持一致的嵌套结构，加 embed=True
\`\`\`

## 八、请求体 + 路径参数 + 查询参数混合

真实接口经常三者混用。FastAPI 按规则自动识别：

- 路径 \`{}\` 中出现的参数名 → 路径参数
- BaseModel 类型 → 请求体
- 其他（int/str/float/bool/None）→ 查询参数

### Demo 8: 三种参数混合

\`\`\`python
# body_mixed.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ItemUpdate(BaseModel):
    name: str | None = None
    price: float | None = None

@app.put("/users/{user_id}/items/{item_id}")
def update_item(
    user_id: int,             # 路径参数（在路径 {} 中）
    item_id: int,             # 路径参数
    item: ItemUpdate,         # 请求体（BaseModel）
    q: str | None = None,     # 查询参数（不在路径中，非 BaseModel）
    notify: bool = False,     # 查询参数
):
    # PUT /users/42/items/100?q=phone&notify=true
    # Body: {"name":"new name","price":199}
    #
    # user_id=42（路径）
    # item_id=100（路径）
    # item=ItemUpdate(name="new name", price=199)（请求体）
    # q="phone"（查询）
    # notify=True（查询）
    return {
        "user_id": user_id,
        "item_id": item_id,
        "item": item,
        "q": q,
        "notify": notify,
    }
\`\`\`

**识别规则速查**：

| 参数特征 | 识别为 |
|----------|--------|
| 名字出现在路径 \`{}\` 中 | 路径参数 |
| 类型是 \`BaseModel\` 子类 | 请求体 |
| 类型是 \`int\`/\`str\`/\`float\`/\`bool\`/\`list\` 等 | 查询参数 |
| 用 \`Body()\` 显式声明 | 请求体字段 |

## 九、模型的方法：model_dump 与 model_validate

Pydantic v2 模型有几个常用方法，理解它们对处理数据很重要。

\`\`\`python
# Demo 9: 模型方法示例
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    tags: list[str] = []

item = Item(name="iPhone", price=999, tags=["phone"])

# 1. model_dump() -> dict
# 把模型转回字典（v1 中叫 dict()）
d = item.model_dump()
# {"name": "iPhone", "price": 999.0, "tags": ["phone"]}

# 2. model_dump_json() -> str
# 直接转 JSON 字符串
s = item.model_dump_json()
# '{"name":"iPhone","price":999.0,"tags":["phone"]}'

# 3. model_validate(dict) -> Model
# 从字典创建模型（带校验）
item2 = Item.model_validate({"name": "iPad", "price": 799})
# 等价于 Item(name="iPad", price=799)

# 4. model_validate_json(str) -> Model
# 从 JSON 字符串创建模型
item3 = Item.model_validate_json('{"name":"Mac", "price":1999}')

# 5. model_copy(update={...}) -> Model
# 复制模型并更新部分字段
item4 = item.model_copy(update={"price": 899})
# item4.price == 899，item.price 仍是 999（不修改原对象）
\`\`\`

## 十、请求体校验失败的错误结构

请求体校验失败返回 422，错误结构比路径/查询参数更复杂（因为字段可能嵌套）。

\`\`\`json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "price"],
      "msg": "Field required",
      "input": {"name": "iPhone"}
    },
    {
      "type": "greater_than",
      "loc": ["body", "items", 0, "quantity"],
      "msg": "Input should be greater than 0",
      "input": -1,
      "ctx": {"gt": 0}
    }
  ]
}
\`\`\`

\`loc\` 数组的含义：
- 第 1 个元素：参数位置（\`body\`、\`query\`、\`path\`）。
- 第 2 个元素：字段名。
- 后续元素：嵌套路径（如列表索引、嵌套字段名）。

前端可以遍历 \`detail\`，根据 \`loc\` 高亮对应输入框。

## 十一、本章小结

- 请求体用 Pydantic \`BaseModel\` 定义，FastAPI 自动校验 + 文档。
- \`Field()\` 给字段加约束（\`gt\`/\`min_length\`/\`pattern\` 等）和文档。
- 模型可嵌套、可含列表和字典，表达任意复杂结构。
- 三种"可选"写法中，推荐 \`str | None = None\`。
- \`Body()\` 用于声明额外字段或控制嵌套（\`embed=True\`）。
- FastAPI 按规则自动识别路径参数/请求体/查询参数，可自由混合。
- Pydantic v2 模型方法：\`model_dump()\` 转 dict、\`model_validate()\` 从 dict 创建、\`model_copy(update=)\` 复制更新。

下一章我们处理表单和文件上传——这是与 JSON 请求体完全不同的另一套机制，涉及 multipart/form-data 编码。
`
  },

  {
    id: "fp-form-files",
    group: "路由与请求",
    icon: "📎",
    title: "表单、文件上传与多部分数据",
    content: `# 表单、文件上传与多部分数据

到目前为止我们处理的请求体都是 JSON。但 Web 应用中还有两类常见场景需要"非 JSON"的请求体：**表单提交**（HTML form）和**文件上传**。它们使用 \`application/x-www-form-urlencoded\` 或 \`multipart/form-data\` 编码，不能用 Pydantic BaseModel 接收。本章会讲清 \`Form()\`、\`File()\`、\`UploadFile\` 的用法，以及大文件流式读取、多文件上传、文件校验等实战技巧。

## 一、为什么需要 Form()

HTML 的 \`<form>\` 默认提交格式是 \`application/x-www-form-urlencoded\`，数据形如 \`name=Alice&age=30\`。这与 JSON 不同，FastAPI 不能用 BaseModel 接收——必须用 \`Form()\`。

### Demo 1: 最基础的表单

\`\`\`python
# form_basic.py
from fastapi import FastAPI, Form

app = FastAPI()

@app.post("/login")
def login(
    # Form() 声明表单字段
    username: str = Form(...),
    password: str = Form(...),
):
    # 客户端发送：
    #   POST /login
    #   Content-Type: application/x-www-form-urlencoded
    #   Body: username=alice&password=secret
    return {"username": username}

# 重要：表单字段不能用 BaseModel 接收！
# 错误写法：def login(creds: LoginCreds):  # 这样 FastAPI 会当成 JSON body
# 正确写法：用 Form() 一个个声明字段
\`\`\`

\`\`\`bash
# 用 curl 测试表单接口
curl -X POST http://127.0.0.1:8000/login \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=alice&password=secret"
\`\`\`

## 二、Form() 与 Query/Path 的区别

\`Form()\`、\`Query()\`、\`Path()\`、\`Body()\` 的 API 几乎一样（都支持 \`...\`、\`default\`、\`min_length\`、\`pattern\` 等参数），区别在于**数据来源**：

\`\`\`text
Path()  -> 从 URL 路径解析
Query() -> 从 URL query string 解析
Form()  -> 从请求体 form-encoded 解析
Body()  -> 从请求体 JSON 解析
File()  -> 从请求体 multipart 文件部分解析
\`\`\`

### Demo 2: Form() 的校验

\`\`\`python
# form_validate.py
from fastapi import FastAPI, Form

app = FastAPI()

@app.post("/register")
def register(
    # 字符串校验
    username: str = Form(..., min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$"),
    email: str = Form(..., pattern=r"^[^@]+@[^@]+\\.[^@]+$"),
    # 数值校验
    age: int = Form(..., ge=0, le=150),
    # 可选字段
    invite_code: str | None = Form(None, max_length=10),
):
    return {
        "username": username,
        "email": email,
        "age": age,
        "invite_code": invite_code,
    }
\`\`\`

## 三、文件上传：File() 与 UploadFile

FastAPI 提供两种文件上传方式：

1. **\`File()\`**：接收 \`bytes\`，整个文件读进内存，适合小文件。
2. **\`UploadFile\`**：包装的文件对象，支持流式读取，适合大文件。

### Demo 3: 用 File() 上传小文件

\`\`\`python
# file_bytes.py
from fastapi import FastAPI, File

app = FastAPI()

@app.post("/upload")
def upload_file(file: bytes = File(...)):
    # file 是 bytes，整个文件内容已经在内存
    # 适合小文件（几 KB ~ 几 MB）
    return {
        "size": len(file),
        "preview": file[:50],   # 前 50 字节预览
    }

# 客户端发送：
#   POST /upload
#   Content-Type: multipart/form-data
#   Body 中包含一个文件部分
#
# curl 测试：
# curl -X POST http://127.0.0.1:8000/upload -F "file=@photo.jpg"
\`\`\`

### Demo 4: 用 UploadFile 上传（推荐）

\`\`\`python
# file_upload.py
from fastapi import FastAPI, UploadFile

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile):
    # UploadFile 比 bytes 更强大：
    #   file.filename      原始文件名
    #   file.content_type  MIME 类型，如 "image/jpeg"
    #   file.size          文件大小（字节）
    #   await file.read()  读取全部内容（异步）
    #   await file.seek(0) 重置读取位置
    #   file.file          底层 SpooledTemporaryFile 对象

    content = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
    }

# UploadFile 默认用 SpooledTemporaryFile：
#   文件 < 1MB 时存在内存
#   文件 >= 1MB 时自动滚动到磁盘
# 所以即使上传大文件，内存也不会爆
\`\`\`

## 四、UploadFile 对象详解

\`UploadFile\` 是 FastAPI 对上传文件的封装，提供以下属性和方法。

### Demo 5: UploadFile 的完整用法

\`\`\`python
# uploadfile_detail.py
from fastapi import FastAPI, UploadFile
import shutil
from pathlib import Path

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile):
    # 1. 属性
    filename = file.filename        # 客户端传来的文件名（注意：可能含路径，要清理）
    content_type = file.content_type  # MIME 类型，如 "image/png"
    size = file.size                # 文件大小（字节）

    # 2. 读取
    content = await file.read()     # 一次读完（适合小文件）

    # 3. 重置读取位置（读完后再读需要 seek）
    await file.seek(0)

    # 4. 流式分块读取（适合大文件，不占内存）
    chunks = []
    while chunk := await file.read(1024 * 1024):  # 每次读 1MB
        chunks.append(chunk)
    total = sum(len(c) for c in chunks)

    # 5. 写入磁盘
    save_path = Path("uploads") / filename
    save_path.parent.mkdir(exist_ok=True)
    with save_path.open("wb") as f:
        # 用 file.file 配合 shutil.copyfileobj 更高效
        shutil.copyfileobj(file.file, f)

    return {
        "filename": filename,
        "content_type": content_type,
        "size": total,
        "saved_to": str(save_path),
    }
\`\`\`

## 五、多文件上传

把参数声明为 \`list[UploadFile]\`，客户端就能上传多个同名文件。

### Demo 6: 多文件上传

\`\`\`python
# multi_upload.py
from fastapi import FastAPI, UploadFile

app = FastAPI()

@app.post("/upload-multiple")
async def upload_multiple(files: list[UploadFile]):
    # 客户端发送多个同名 file 字段
    # curl -F "files=@a.jpg" -F "files=@b.jpg" http://...
    results = []
    for f in files:
        # 逐个处理
        content = await f.read()
        results.append({
            "filename": f.filename,
            "size": len(content),
            "content_type": f.content_type,
        })
    return {
        "count": len(files),
        "files": results,
    }

# 也可以混合表单字段和文件
@app.post("/upload-with-meta")
async def upload_with_meta(
    files: list[UploadFile],
    title: str = Form(...),           # 表单字段
    description: str | None = Form(None),
):
    return {
        "title": title,
        "description": description,
        "file_count": len(files),
    }
\`\`\`

## 六、文件大小与类型校验

FastAPI 没有内置的"文件大小/类型"校验参数，需要自己实现。下面是一个生产级校验示例。

### Demo 7: 完整的文件校验

\`\`\`python
# file_validate.py
from fastapi import FastAPI, UploadFile, HTTPException, status
from pathlib import Path

app = FastAPI()

# 允许的文件类型和扩展名
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB

@app.post("/upload")
async def upload_file(file: UploadFile):
    # 1. 校验文件类型（MIME）
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"不支持的文件类型: {file.content_type}",
        )

    # 2. 校验扩展名（双保险，因为 MIME 可被伪造）
    ext = Path(file.filename or "").suffix.lower()
    expected_ext = ALLOWED_TYPES[file.content_type]
    if ext != expected_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"扩展名 {ext} 与类型 {file.content_type} 不匹配",
        )

    # 3. 流式读取并校验大小（防止超大文件耗尽内存）
    total = 0
    chunks = []
    while chunk := await file.read(1024 * 1024):  # 每次读 1MB
        total += len(chunk)
        if total > MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"文件超过 {MAX_SIZE // 1024 // 1024} MB 限制",
            )
        chunks.append(chunk)

    # 4. 拼接内容
    content = b"".join(chunks)

    return {
        "filename": file.filename,
        "size": total,
        "content_type": file.content_type,
    }
\`\`\`

**关键技巧**：流式读取 + 边读边判断大小，避免把整个超大文件读进内存才报错。

## 七、流式读取大文件的最佳实践

对于 GB 级大文件，绝不能 \`await file.read()\` 一次读完，要分块处理。

### Demo 8: 流式写入磁盘

\`\`\`python
# stream_large.py
from fastapi import FastAPI, UploadFile, HTTPException
from pathlib import Path

app = FastAPI()

@app.post("/upload-large")
async def upload_large(file: UploadFile):
    # 安全的大文件处理：分块读取 + 直接写磁盘
    save_path = Path("uploads") / (file.filename or "unnamed")
    save_path.parent.mkdir(exist_ok=True)

    # 用分块写入，内存占用恒定（约 chunk_size）
    chunk_size = 1024 * 1024  # 1 MB
    total = 0
    with save_path.open("wb") as f:
        while chunk := await file.read(chunk_size):
            f.write(chunk)
            total += len(chunk)

    return {
        "filename": file.filename,
        "size": total,
        "saved_to": str(save_path),
    }

# 为什么不直接 file.write_to_disk()？
# 因为 UploadFile 提供的 .file 是 SpooledTemporaryFile
# 你也可以用 shutil.copyfileobj(file.file, f) 同步写
# 但在 async 路由里，用 await file.read() 更协调
\`\`\`

## 八、表单 + 文件 + JSON 混合的限制

一个**重要限制**：**表单和 JSON 不能在同一个请求里同时使用**。因为它们的 Content-Type 互斥（\`multipart/form-data\` vs \`application/json\`）。

\`\`\`python
# Demo 9: 错误示范
from fastapi import FastAPI, Form
from pydantic import BaseModel

app = FastAPI()

class Metadata(BaseModel):
    category: str

# @app.post("/upload")
# def upload(file: UploadFile, meta: Metadata, tag: str = Form(...)):
#     # 错误！meta 是 JSON body，tag 是 form
#     # FastAPI 会报错：cannot have both JSON body and form body
#     pass

# 正确做法：把所有字段都用 Form() 声明
@app.post("/upload")
def upload_correct(
    file: UploadFile,
    category: str = Form(...),
    tag: str = Form(...),
):
    # 所有非文件字段都用 Form()，整个请求是 multipart
    return {"category": category, "tag": tag, "file": file.filename}
\`\`\`

## 九、安装 python-multipart

处理表单和文件需要 \`python-multipart\` 库。如果你装的是 \`fastapi[standard]\`，它已经包含。否则需要单独装：

\`\`\`bash
# 安装
pip install python-multipart

# 不装的话，启动时访问表单接口会报错：
# Form data requires "python-multipart" to be installed.
\`\`\`

## 十、用 TestClient 测试文件上传

测试上传接口时，用 \`TestClient\` 配合 \`files\` 参数。

\`\`\`python
# test_upload.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload():
    # files 参数格式：{"字段名": ("文件名", 文件内容, "MIME 类型")}
    response = client.post(
        "/upload",
        files={"file": ("test.txt", b"hello world", "text/plain")},
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "test.txt"

def test_upload_multiple():
    response = client.post(
        "/upload-multiple",
        files=[
            ("files", ("a.txt", b"aaa", "text/plain")),
            ("files", ("b.txt", b"bbb", "text/plain")),
        ],
    )
    assert response.status_code == 200
    assert response.json()["count"] == 2
\`\`\`

## 十一、安全注意事项

文件上传是 Web 安全的高危区域，务必注意：

1. **永远不要信任 \`file.filename\`**：客户端可以伪造任意文件名，可能含路径遍历（\`../../etc/passwd\`）。保存前用 \`Path(filename).name\` 取纯文件名。
2. **不要保留原始扩展名执行**：上传 \`.php\`、\`.jsp\` 到 web 目录会变成可执行脚本。要么重命名，要么存到非 web 目录。
3. **限制大小**：未限制大小会被恶意上传超大文件耗尽磁盘/内存。
4. **校验类型**：MIME 类型可伪造，最好结合文件头（magic number）判断。
5. **不要直接用 filename 拼路径**：用 \`uuid\` 或 \`hash\` 生成存储文件名。

### Demo 10: 安全的文件保存

\`\`\`python
# safe_save.py
import uuid
from pathlib import Path
from fastapi import FastAPI, UploadFile, HTTPException

app = FastAPI()

ALLOWED_EXT = {".jpg", ".png", ".pdf"}
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload")
async def upload_safe(file: UploadFile):
    # 1. 取纯文件名（去掉路径部分）
    original_name = Path(file.filename or "").name
    ext = Path(original_name).suffix.lower()

    # 2. 校验扩展名
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"扩展名 {ext} 不被允许")

    # 3. 生成随机文件名，避免冲突和路径注入
    safe_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / safe_name

    # 4. 写入（流式）
    with save_path.open("wb") as f:
        while chunk := await file.read(1024 * 1024):
            f.write(chunk)

    return {
        "original_name": original_name,
        "stored_name": safe_name,
        "size": save_path.stat().st_size,
    }
\`\`\`

## 十二、本章小结

- 表单字段用 \`Form()\` 接收，不能用 BaseModel。
- 文件上传有两种：\`File()\` 接收 bytes（小文件）、\`UploadFile\` 流式处理（大文件，推荐）。
- \`UploadFile\` 提供 \`filename\`/\`content_type\`/\`size\`/\`read()\`/\`seek()\` 等方法。
- 多文件上传用 \`list[UploadFile]\`。
- 文件校验（类型、大小、扩展名）要自己实现，流式读取 + 边读边判断大小防内存爆炸。
- **表单和 JSON 不能在同一请求共存**（Content-Type 互斥），混合时全用 Form()。
- 安全要点：不信任 filename、用 uuid 重命名、限制大小和类型、避免上传到可执行目录。

至此，"路由与请求"分组的 4 章结束。你已经掌握了路径参数、查询参数、请求体、表单与文件上传——这些是 FastAPI 处理输入的全部基础。下一分组我们会进入 Pydantic 数据校验的深水区：模型配置、自定义校验器、字段类型、序列化控制。
`
  }
];
