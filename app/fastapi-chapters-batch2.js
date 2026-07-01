// =============================================================
// FastAPI 应用开发实战教程 - 第 2 批章节（路径与查询参数 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-path-params     : 路径参数
//   fa-query-params    : 查询参数
//   fa-params-validate : 参数校验 Path/Query
//   fa-request-context : Request 对象与元数据
// =============================================================

export const chapters = [
  // ============================================================
  // 第 5 章：路径参数
  // ============================================================
  {
    id: "fa-path-params",
    group: "路径与查询参数",
    icon: "🛤️",
    title: "路径参数",
    content: `# 路径参数

## 什么是路径参数

RESTful API 里，经常把资源的标识放在 URL 路径里，比如：

- \`GET /users/42\` —— 查询 ID 为 42 的用户
- \`GET /articles/2024/07\` —— 查询 2024 年 7 月的文章

这些 \`42\`、\`2024\`、\`07\` 就是**路径参数**（path parameter）。它们是 URL 的一部分，用花括号 \`{}\` 在路由里声明，FastAPI 会把它们提取出来传给处理函数。

## 基本语法

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# {item_id} 是路径参数占位符
@app.get("/items/{item_id}")
def read_item(item_id):
    # item_id 默认是字符串，因为没声明类型
    return {"item_id": item_id}
\`\`\`

访问 \`/items/42\`，FastAPI 把字符串 \`"42"\` 传给 \`item_id\`，返回 \`{"item_id": "42"}\`。

注意函数参数名 \`item_id\` 必须和路径里的 \`{item_id}\` 一致，FastAPI 靠名字匹配。

## 类型声明与自动转换

光传字符串还不够，实际接口里我们通常要数字、UUID。在参数后加类型注解，FastAPI 会做类型校验和转换：

\`\`\`python
@app.get("/items/{item_id}")
def read_item(item_id: int):
    # 声明 int 后：
    # 1. 访问 /items/42 → item_id 自动转成 int 42
    # 2. 访问 /items/abc → 类型不匹配，返回 422 错误
    return {"item_id": item_id, "type": type(item_id).__name__}
\`\`\`

访问 \`/items/42\`：

\`\`\`json
{"item_id": 42, "type": "int"}
\`\`\`

访问 \`/items/hello\`，因为 \`"hello"\` 转不成 int，FastAPI 返回 422 校验错误：

\`\`\`json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "hello"
    }
  ]
}
\`\`\`

这种"传错类型直接 422"的机制，把脏数据挡在业务逻辑之外，不用自己写 \`if not item_id.isdigit()\` 之类的判断。

## 支持的路径参数类型

| 类型 | 说明 | 示例路径 |
|------|------|----------|
| \`str\` | 字符串（默认） | \`/items/{item_id}\` |
| \`int\` | 整数 | \`/users/{user_id}\` |
| \`float\` | 浮点数 | \`/price/{amount}\` |
| \`bool\` | 布尔值 | \`/flag/{active}\`（1/true/yes/...） |
| \`uuid.UUID\` | UUID | \`/orders/{order_id}\` |
| \`Enum\` | 枚举 | \`/models/{model_name}\` |
| \`path\` 转换器 | 匹配含斜杠 | \`/files/{file_path:path}\` |

\`\`\`python
from uuid import UUID
from enum import Enum

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    # 枚举类型：访问 /models/alexnet → model_name == ModelName.alexnet
    # 访问 /models/foo → 不在枚举里，422
    return {"model": model_name, "value": model_name.value}

@app.get("/orders/{order_id}")
def get_order(order_id: UUID):
    # UUID 类型校验
    # /orders/3fa85f64-5717-4562-b3fc-2c963f66afa6 → 合法
    # /orders/not-a-uuid → 422
    return {"order_id": order_id}
\`\`\`

## 路由顺序：固定路径要在动态路径前

这是新手最常踩的坑。FastAPI 按代码顺序匹配路由，第一个匹配的就执行。所以固定路径（如 \`/users/me\`）必须写在动态路径（如 \`/users/{user_id}\`）前面：

\`\`\`python
# ✅ 正确顺序：固定路径在前
@app.get("/users/me")
def read_me():
    return {"user": "当前登录用户"}

@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}
\`\`\`

如果反过来写：

\`\`\`python
# ❌ 错误顺序：动态路径会先匹配上 /users/me
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

@app.get("/users/me")  # 永远到不了这里！
def read_me():
    return {"user": "当前登录用户"}
\`\`\`

访问 \`/users/me\` 时，\`{user_id}\` 会匹配上 \`"me"\`，然后尝试转 int 失败返回 422。后一个 \`/users/me\` 永远不会被调用，因为前面的路由先匹配上了。

记住原则：**越具体的路径越靠前**。

## 路径转换器：匹配含斜杠的路径

普通 \`{item_id}\` 不能匹配含 \`/\` 的路径——因为 \`/\` 是路径分隔符。比如访问 \`/files/a/b/c.txt\`，普通 \`{file_path}\` 只能拿到 \`a\`。

用 Starlette 的 path 转换器 \`{file_path:path}\` 可以匹配含斜杠的部分：

\`\`\`python
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    # /files/a/b/c.txt → file_path == "a/b/c.txt"
    # /files/report.pdf → file_path == "report.pdf"
    return {"file_path": file_path}
\`\`\`

注意：\`:path\` 后面没有空格，直接连着写。这是 Starlette 的 URL 路由转换器语法，FastAPI 继承自它。

## 多路径参数

一个路径可以有多个路径参数：

\`\`\`python
@app.get("/users/{user_id}/items/{item_id}")
def read_user_item(user_id: int, item_id: int):
    # /users/42/items/100 → user_id=42, item_id=100
    return {"user_id": user_id, "item_id": item_id}
\`\`\`

## 预设值 vs 路径参数

如果路径参数只想接受几个预设值，用 Enum（见上）或 Literal：

\`\`\`python
from typing import Literal

@app.get("/colors/{color}")
def get_color(color: Literal["red", "green", "blue"]):
    # 只接受 red/green/blue，其他值 422
    return {"color": color}
\`\`\`

## 路径参数 vs 查询参数的区分

FastAPI 区分路径参数和查询参数的规则很简单：

- **在路径字符串 \`{}\` 里声明的** → 路径参数
- **函数参数里但不在路径里的** → 查询参数

\`\`\`python
@app.get("/items/{item_id}")  # 路径里有 {item_id}
def read_item(item_id: int, q: str | None = None):
    # item_id 是路径参数（路径里声明了）
    # q 是查询参数（路径里没有，靠 URL ?q=xxx 传）
    return {"item_id": item_id, "q": q}
\`\`\`

访问 \`/items/42?q=hello\`，\`item_id=42\`，\`q="hello"\`。

## 易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 路由顺序错 | 动态路径挡住固定路径 | 固定路径写在动态路径前 |
| 参数名不匹配 | 路径 \`{id}\` 函数写 \`item_id\` | 名字必须一致 |
| 类型转换失败 | 访问 \`/items/{item_id:int}\` 但传非数字 | 传符合类型的值，会自动 422 |
| 忘记类型注解 | \`def f(item_id)\` → item_id 是 str | 需要数字加 \`: int\` |
| 含斜杠路径匹配错 | \`{file}\` 拿不到 \`a/b/c\` | 用 \`{file:path}\` |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 声明 | 路径里 \`{param}\`，函数同名参数 |
| 类型转换 | 加类型注解自动转换，失败 422 |
| 支持类型 | str/int/float/bool/UUID/Enum |
| 路由顺序 | 固定路径在动态路径前 |
| path 转换器 | \`{file:path}\` 匹配含斜杠 |
| 多参数 | \`/users/{uid}/items/{iid}\` |
| 与查询参数区分 | 路径里声明的是路径参数，否则查询参数 |

下一章我们看查询参数——那些跟在 \`?\` 后面的参数怎么用、怎么设默认值。`
  },

  // ============================================================
  // 第 6 章：查询参数
  // ============================================================
  {
    id: "fa-query-params",
    group: "路径与查询参数",
    icon: "🔍",
    title: "查询参数",
    content: `# 查询参数

## 什么是查询参数

查询参数是 URL 中 \`?\` 之后、用 \`&\` 分隔的键值对，通常用来表达"过滤、排序、分页"等非资源标识的信息：

- \`GET /items?skip=0&limit=10\` —— 分页，跳过 0 条，取 10 条
- \`GET /users?role=admin&active=true\` —— 过滤
- \`GET /articles?sort=created_at\` —— 排序

这些不是 URL 路径的一部分，是放在 query string 里的。FastAPI 会自动把"函数参数里有、但路径里没声明的参数"当作查询参数。

## 基本语法

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 假数据
items = [{"name": f"商品{i}"} for i in range(100)]

# skip 和 limit 不在路径里，自动当成查询参数
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10):
    # /items → skip=0, limit=10（用默认值）
    # /items?skip=20 → skip=20, limit=10
    # /items?skip=20&limit=5 → skip=20, limit=5
    return items[skip : skip + limit]
\`\`\`

规则：

1. 参数不在路径的 \`{}\` 里 → 查询参数
2. 有默认值 → 可选（不传就用默认值）
3. 无默认值 → 必填（不传就 422）

## 必选 vs 可选

\`\`\`python
@app.get("/search")
def search(keyword: str, category: str = "all"):
    # keyword 没默认值 → 必填
    # category 有默认值 → 可选
    # /search → 422（缺 keyword）
    # /search?keyword=phone → keyword="phone", category="all"
    return {"keyword": keyword, "category": category}
\`\`\`

访问 \`/search\`（不带 keyword）返回 422：

\`\`\`json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["query", "keyword"],
      "msg": "Field required",
      "input": null
    }
  ]
}
\`\`\`

## 用 Optional / None 显式表示可选

有两种写法表达"可选参数"：

\`\`\`python
from typing import Optional

# 写法一：默认值 None（推荐，简洁）
@app.get("/items")
def list_items(q: str | None = None):
    # q 可不传，不传时 q 是 None
    if q:
        return {"q": q}
    return {"msg": "无搜索词"}

# 写法二：Optional（老写法，3.9 以下用）
@app.get("/items2")
def list_items2(q: Optional[str] = None):
    return {"q": q}
\`\`\`

\`str | None\`（Python 3.10+）和 \`Optional[str]\` 是等价的，都表示"要么字符串，要么 None"。推荐用 \`|\` 语法，更简洁。

⚠️ 注意一个常见误区：**只写 \`q: str | None\` 但不给默认值，它仍然是必填的**。类型注解 \`str | None\` 只是说"值可以是 None"，但没默认值就是必填，必须传 \`?q=\`（哪怕是空）。要可选，必须有 \`= None\`。

## 默认值

\`\`\`python
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10, q: str | None = None):
    # 分页查询的典型用法
    return {"skip": skip, "limit": limit, "q": q}
\`\`\`

访问各种 URL 的结果：

| URL | skip | limit | q |
|-----|------|-------|---|
| \`/items\` | 0 | 10 | None |
| \`/items?skip=5\` | 5 | 10 | None |
| \`/items?skip=5&limit=20\` | 5 | 20 | None |
| \`/items?q=phone\` | 0 | 10 | "phone" |
| \`/items?limit=20&q=phone\` | 0 | 20 | "phone" |

## bool 类型的自动转换

bool 类型查询参数，FastAPI 会把多种形式都转成 bool：

\`\`\`python
@app.get("/items")
def list_items(active: bool = False):
    return {"active": active}
\`\`\`

这些都会被转成 \`True\`：

- \`/items?active=true\`（小写）
- \`/items?active=True\`（首字母大写）
- \`/items?active=1\`
- \`/items?active=yes\`
- \`/items?active=on\`

这些转成 \`False\`：\`false\`、\`False\`、\`0\`、\`no\`、\`off\`、\`''\`（空）。

传别的值（如 \`/items?active=maybe\`）会 422，因为转不成 bool。

## 参数顺序规则

Python 函数参数有个规则：**有默认值的参数不能放在无默认值的前面**。所以路径参数（无默认值）和查询参数（常有默认值）混在一起时，要按 Python 规则排序。

\`\`\`python
# ✅ 正确：无默认值（路径参数 item_id）在前，有默认值（查询参数 q）在后
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

# ❌ 错误：有默认值的 q 放在无默认值的 item_id 前，Python 直接报语法错
@app.get("/items/{item_id}")
def read_item(q: str | None = None, item_id: int):
    ...
\`\`\`

记住：路径参数（路径里声明的，通常无默认值）放函数签名前面，查询参数（常有默认值）放后面。这其实不是 FastAPI 的规则，是 Python 函数定义的硬性要求。

## 必填参数的顺序

多个必填查询参数无顺序要求（因为都无默认值）：

\`\`\`python
@app.get("/search")
def search(keyword: str, city: str):
    # keyword 和 city 都必填，顺序无所谓
    # /search?keyword=x&city=y 或 /search?city=y&keyword=x 都行
    return {"keyword": keyword, "city": city}
\`\`\`

URL 里参数顺序不影响，FastAPI 按名字匹配，不是按位置。

## 分页查询实战

把前面知识点串起来，写一个带分页和过滤的列表接口：

\`\`\`python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# 模拟数据
products = [
    {"id": i, "name": f"商品{i}", "price": i * 10, "category": "电子" if i % 2 == 0 else "服装"}
    for i in range(1, 101)
]

@app.get("/products")
def list_products(
    skip: int = 0,            # 跳过多少条，默认 0
    limit: int = 10,         # 取多少条，默认 10
    category: Optional[str] = None,  # 按类目过滤，默认不过滤
    min_price: float = 0.0,  # 最低价
    max_price: float = 9999.0  # 最高价
):
    # 先过滤
    result = products
    if category:
        result = [p for p in result if p["category"] == category]
    result = [p for p in result if min_price <= p["price"] <= max_price]
    # 再分页
    total = len(result)
    page = result[skip : skip + limit]
    return {"total": total, "items": page}
\`\`\`

访问 \`/products?category=电子&min_price=50&skip=0&limit=5\` 拿到价格≥50 的电子产品前 5 条。

## 用 Query 增强（预告）

光给默认值还不够：你可能想限制 \`limit\` 不能超过 100、\`q\` 至少 2 个字符。这要靠下一章的 \`Query()\`，这里先看个预告：

\`\`\`python
from fastapi import Query

@app.get("/items")
def list_items(
    q: str | None = Query(None, min_length=2, max_length=50),
    limit: int = Query(10, ge=1, le=100)
):
    # q 长度 2~50，limit 在 1~100 之间
    return {"q": q, "limit": limit}
\`\`\`

## 易错点小结

| 易错点 | 说明 | 正确做法 |
|--------|------|----------|
| 可选忘加默认值 | \`q: str | None\` 无默认值仍必填 | 加 \`= None\` |
| bool 传错值 | \`?active=maybe\` 转 422 | 用 true/false/1/0 |
| 参数顺序错 | 有默认值的放无默认值前 | 路径参数（无默认值）在前 |
| 必填没传 | 漏传必填查询参数 | 看清哪些没默认值 |
| 想校验长度/范围 | 光默认值做不到 | 用 Query()（下章） |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 判定 | 不在路径 \`{}\` 里的函数参数 = 查询参数 |
| 必填 | 无默认值 |
| 可选 | 有默认值（常 = None） |
| bool 转换 | true/1/yes/on → True，false/0/no/off → False |
| 参数顺序 | 无默认值在前（Python 规则） |
| 多个查询参数 | URL 里顺序无关，按名字匹配 |
| 校验增强 | 用 Query()（下一章详解） |

下一章我们深入参数校验——用 Path() 和 Query() 给参数加约束、加文档。`
  },

  // ============================================================
  // 第 7 章：参数校验：Path/Query
  // ============================================================
  {
    id: "fa-params-validate",
    group: "路径与查询参数",
    icon: "✅",
    title: "参数校验：Path/Query",
    content: `# 参数校验：Path/Query

## 为什么需要额外校验

上一章用类型注解和默认值能做基础校验（类型转换、必填可选）。但实际接口要的约束更多：

- \`limit\` 不能超过 100（防止一次拉太多数据）
- \`q\` 至少 2 个字符（避免单字符搜索把数据库拖垮）
- \`user_id\` 必须 ≥ 1（ID 不能是负数）
- 查询参数在 URL 里叫 \`user-id\`，但 Python 变量想叫 \`user_id\`（带连字符的变量名非法）

这些靠光声明类型做不到，要用 \`Path()\` 和 \`Query()\`。

## Query() 给查询参数加约束

\`Query()\` 用作参数的默认值，传入校验规则和元数据：

\`\`\`python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
def list_items(
    # q 是可选字符串，长度 3~50
    q: str | None = Query(None, min_length=3, max_length=50),
    # limit 必填，范围 1~100
    limit: int = Query(..., ge=1, le=100),
    # skip 默认 0，≥ 0
    skip: int = Query(0, ge=0)
):
    return {"q": q, "limit": limit, "skip": skip}
\`\`\`

\`Query()\` 的第一参数是默认值：

- \`None\` → 可选，默认 None
- \`...\`（Ellipsis）→ 必填，没有默认值
- 具体值 → 用该值作默认

### 字符串校验规则

| 参数 | 作用 |
|------|------|
| \`min_length\` | 最小长度 |
| \`max_length\` | 最大长度 |
| \`pattern\` | 正则（旧名 \`regex\`，已废弃） |
| \`max_length\` | 最大长度 |

\`\`\`python
# 用户名：3~20 字符，只能字母数字下划线
username: str = Query(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
\`\`\`

### 数字校验规则

| 参数 | 作用 |
|------|------|
| \`ge\` | ≥ greater than or equal |
| \`gt\` | > greater than |
| \`le\` | ≤ less than or equal |
| \`lt\` | < less than |
| \`multiple_of\` | 必须是某数的倍数 |

\`\`\`python
# 年龄 18~120
age: int = Query(..., ge=18, le=120)
# 价格 > 0
price: float = Query(..., gt=0)
# 数量必须是 5 的倍数
count: int = Query(..., multiple_of=5)
\`\`\`

记忆技巧：\`g\` = greater（大），\`l\` = less（小），\`e\` = equal（等于）。ge=大于等于，gt=大于（无等于）。

## Path() 给路径参数加约束

路径参数用 \`Path()\`，用法和 \`Query()\` 几乎一样。区别是路径参数**总是必填**（URL 里必须有），所以不需要 \`...\` 表示必填：

\`\`\`python
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(
    # 路径参数 item_id，必须 ≥ 1
    item_id: int = Path(..., ge=1, description="商品 ID，正整数"),
    # 查询参数 q
    q: str | None = Query(None, max_length=20)
):
    return {"item_id": item_id, "q": q}
\`\`\`

⚠️ 注意一个 Python 语法陷阱：如果路径参数有 \`Path()\` 默认值，而后面有**无默认值**的查询参数，Python 会报"有默认值参数在无默认值参数前"的错。解决办法：给查询参数也加默认值，或用 \`*\` 分隔。

\`\`\`python
# ❌ 报错：item_id 有 Path() 默认值，q 无默认值
@app.get("/items/{item_id}")
def read_item(item_id: int = Path(..., ge=1), q: str):
    ...

# ✅ 用 * 把后续参数都标记为关键字参数，绕过顺序限制
@app.get("/items/{item_id}")
def read_item(*, item_id: int = Path(..., ge=1), q: str):
    # * 之后全是关键字参数，顺序无关紧要
    return {"item_id": item_id, "q": q}
\`\`\`

加 \`*\` 是惯用法，表示"后面都是关键字参数"，这样能任意排列路径参数和查询参数，绕开 Python 的默认值顺序限制。

## 列表查询参数：接收多个值

有时一个查询参数要传多个值，比如 \`?q=a&q=b&q=c\`。用 \`list\` 类型 + \`Query()\`：

\`\`\`python
@app.get("/items")
def list_items(q: list[str] | None = Query(None)):
    # /items?q=a&q=b&q=c → q == ["a", "b", "c"]
    # /items → q == None
    return {"q": q}
\`\`\`

访问 \`/items?q=a&q=b\`：

\`\`\`json
{"q": ["a", "b"]}
\`\`\`

也可以给默认值（列表）：

\`\`\`python
# 默认 ["default"]
tags: list[str] = Query(default=["default"])
\`\`\`

列表参数常用于"多选过滤"，比如 \`?category=电子&category=服装\`。

## 别名 alias

URL 查询参数名和 Python 变量名不想一样时用 \`alias\`。典型场景：URL 用连字符风格 \`user-id\`，但 Python 变量不能用连字符（语法非法），用 \`user_id\`：

\`\`\`python
@app.get("/items")
def list_items(
    # URL 里是 ?user-id=42，Python 里用 user_id
    user_id: int = Query(..., alias="user-id")
):
    return {"user_id": user_id}
# 访问 /items?user-id=42 → user_id=42
\`\`\`

\`alias\` 在对接前端已定的命名规范（如 camelCase）时很有用，不用改 Python 变量名。

## 弃用标记 deprecated

接口演进中，有些参数想标注"已废弃但还能用"，提示调用方迁移。用 \`deprecated=True\`：

\`\`\`python
@app.get("/items")
def list_items(
    q: str | None = Query(None, deprecated=True, description="已废弃，请用 search 代替"),
    search: str | None = None
):
    return {"q": q, "search": search}
\`\`\`

Swagger 文档里 \`q\` 会显示删除线和"deprecated"标记，提醒别再用。

## 参数元数据：title/description/example

给参数加文档和示例，让自动文档更丰富：

\`\`\`python
@app.get("/items")
def list_items(
    limit: int = Query(
        10,
        title="每页数量",
        description="分页大小，最大 100。超过 100 按 100 算。",
        ge=1,
        le=100,
        example=20
    )
):
    return {"limit": limit}
\`\`\`

- \`title\`：参数标题（短）
- \`description\`：详细说明（支持 Markdown）
- \`example\`：示例值，Swagger 里会预填这个值

## 综合示例

把校验、别名、元数据全用上：

\`\`\`python
from fastapi import FastAPI, Query, Path

app = FastAPI()

@app.get("/users/{user_id}/orders")
def list_user_orders(
    user_id: int = Path(..., ge=1, description="用户 ID"),
    *,
    status: str | None = Query(
        None,
        pattern="^(pending|paid|shipped|done)$",
        description="订单状态过滤"
    ),
    min_amount: float = Query(0, ge=0, description="最低金额"),
    max_amount: float = Query(99999, gt=0, description="最高金额"),
    sort_by: str = Query("created_at", alias="sort-by"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100, alias="page-size", deprecated=False)
):
    return {
        "user_id": user_id,
        "status": status,
        "amount_range": [min_amount, max_amount],
        "sort_by": sort_by,
        "page": page,
        "page_size": page_size
    }
\`\`\`

访问 \`/users/42/orders?status=paid&min-amount=100&sort-by=amount&page=2\`，所有参数按 alias 正确解析，校验通过。

## 校验失败返回 422

任何校验不过，FastAPI 返回 422 + 详细错误：

\`\`\`json
{
  "detail": [
    {
      "type": "less_than_equal",
      "loc": ["query", "limit"],
      "msg": "Input should be less than or equal to 100",
      "input": "200",
      "ctx": {"le": 100}
    }
  ]
}
\`\`\`

\`loc\` 告诉你哪个参数错了（\`["query", "limit"]\` 表示查询参数 limit），\`msg\` 是原因，前端能据此提示用户。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| 默认值顺序错 | Path() 在无默认值参数前 | 加 \`*\` 让后续全关键字参数 |
| 必填用 None | \`Query(None)\` 是可选不是必填 | 必填用 \`Query(...)\` |
| 记混 ge/le | ge=≥, le=≤, gt=>, lt=< | g=greater, l=less, e=equal |
| 别名忘加 | URL 用 \`user-id\` 但变量 \`user_id\` | 用 \`alias="user-id"\` |
| 列表参数 | 想传多值但只收到最后一个 | 声明 \`list[str]\` |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| Query() | 查询参数校验 + 元数据 |
| Path() | 路径参数校验 + 元数据 |
| 默认值位置 | 第一个参数：None/.../具体值 |
| 数字校验 | ge/gt/le/lt/multiple_of |
| 字符串校验 | min_length/max_length/pattern |
| 列表参数 | \`list[str]\` 接收 ?q=a&q=b |
| alias | URL 名 ≠ 变量名 |
| deprecated | 标记废弃参数 |
| 元数据 | title/description/example |
| 顺序陷阱 | 用 \`*\` 解决默认值顺序限制 |

下一章我们看 Request 对象——当你需要读原始请求头、客户端 IP 这些时，直接拿 Request 对象最方便。`
  },

  // ============================================================
  // 第 8 章：Request 对象与元数据
  // ============================================================
  {
    id: "fa-request-context",
    group: "路径与查询参数",
    icon: "📋",
    title: "Request 对象与元数据",
    content: `# Request 对象与元数据

## Request 对象是什么

前面几章，FastAPI 把参数从 URL、query、body 里提取出来，自动传给函数。但有时你需要直接拿到**原始请求对象**——读请求头、获取客户端 IP、访问完整 URL、读 Cookie。

FastAPI 基于 Starlette，提供了 \`Request\` 对象。在函数参数里声明 \`request: Request\`，FastAPI 会注入当前请求对象：

\`\`\`python
from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/info")
def get_info(request: Request):
    return {
        "client_host": request.client.host,  # 客户端 IP
        "method": request.method,           # HTTP 方法
        "url": str(request.url)             # 完整 URL
    }
\`\`\`

\`Request\` 是 Starlette 的 \`starlette.requests.Request\`，FastAPI 直接复用。声明 \`request: Request\` 后，FastAPI 不会把它当查询参数或路径参数，而是识别为特殊注入对象直接传进来。

## Request 对象的核心属性

### 1. request.headers —— 请求头

请求头是大小写不敏感的字典（\`Headers\` 对象）：

\`\`\`python
@app.get("/headers")
def get_headers(request: Request):
    # 大小写不敏感，都行
    user_agent = request.headers.get("user-agent")
    auth = request.headers.get("Authorization")
    content_type = request.headers["content-type"]  # 直接取，没有会 KeyError
    return {"ua": user_agent, "auth": auth}
\`\`\`

用 \`.get()\` 更安全，没有该头返回 None 而不是抛错。直接 \`request.headers["xxx"]\` 没有 KeyError。

### 2. request.query_params —— 查询参数

返回不可变的多值字典（\`QueryParams\`）：

\`\`\`python
@app.get("/")
def root(request: Request):
    # ?skip=0&limit=10
    skip = request.query_params.get("skip", "0")
    limit = request.query_params.get("limit", "10")
    return {"skip": skip, "limit": limit}
\`\`\`

通常我们用 FastAPI 的查询参数声明（带校验），更优雅。但在某些通用中间件、动态场景下，直接读 query_params 更灵活。

### 3. request.path_params —— 路径参数

\`\`\`python
@app.get("/items/{item_id}")
def read_item(item_id: int, request: Request):
    # request.path_params == {"item_id": "42"}
    # 注意：是字符串形式，类型转换是 FastAPI 在传给 item_id 时做的
    return {"item_id": item_id, "raw_path_params": request.path_params}
\`\`\`

### 4. request.client —— 客户端信息

\`request.client\` 是一个 \`HostPort\` 命名元组，含 \`.host\`（IP）和 \`.port\`：

\`\`\`python
@app.get("/ip")
def get_client_ip(request: Request):
    # request.client.host 是客户端 IP
    # 但注意：如果有反向代理（nginx），这里拿到的是代理的 IP
    return {"client_ip": request.client.host if request.client else None}
\`\`\`

⚠️ 生产环境通常前面有 nginx/CDN，\`request.client.host\` 拿到的是代理 IP 不是真实用户 IP。真实 IP 在 \`X-Forwarded-For\` 头里：

\`\`\`python
@app.get("/real-ip")
def get_real_ip(request: Request):
    # 优先从 X-Forwarded-For 取真实 IP
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # X-Forwarded-For: client, proxy1, proxy2 → 取第一个
        real_ip = xff.split(",")[0].strip()
    else:
        real_ip = request.client.host if request.client else None
    return {"real_ip": real_ip}
\`\`\`

### 5. request.method —— HTTP 方法

\`\`\`python
@app.api_route("/items", methods=["GET", "POST"])
def handle_items(request: Request):
    # 同一路由处理多种方法
    if request.method == "GET":
        return {"action": "list"}
    elif request.method == "POST":
        return {"action": "create"}
\`\`\`

\`@app.api_route\` 能同时注册多个方法，用 \`request.method\` 区分。但更推荐分开写 \`@app.get\` 和 \`@app.post\`，清晰且能各自定义校验。

### 6. request.url —— 完整 URL

\`request.url\` 是 \`URL\` 对象，支持各种分解：

\`\`\`python
@app.get("/url-info")
def url_info(request: Request):
    # 假设访问 http://localhost:8000/url-info?x=1
    return {
        "full": str(request.url),          # http://localhost:8000/url-info?x=1
        "scheme": request.url.scheme,      # http
        "host": request.url.hostname,      # localhost
        "port": request.url.port,          # 8000
        "path": request.url.path,          # /url-info
        "query": request.url.query,        # x=1
        "is_secure": request.url.is_secure # False（非 https）
    }
\`\`\`

### 7. request.cookies —— Cookie

\`\`\`python
@app.get("/profile")
def profile(request: Request):
    # 读 Cookie
    session = request.cookies.get("session_id")
    if not session:
        return {"error": "未登录"}
    return {"session": session}
\`\`\`

FastAPI 也有专门的 \`Cookie()\` 参数声明方式做校验，但直接读 \`request.cookies\` 在动态场景下方便。

### 8. request.state —— 请求级共享状态

\`request.state\` 是一个可以挂任意属性的"口袋"，在中间件和路由之间传值：

\`\`\`python
from fastapi import FastAPI, Request
import time

app = FastAPI()

@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.time()
    # 中间件里往 state 写值
    request.state.request_id = f"req-{int(start*1000)}"
    response = await call_next(request)
    duration = time.time() - start
    # 响应头里带上请求 ID 和耗时
    response.headers["X-Request-Id"] = request.state.request_id
    response.headers["X-Process-Time"] = f"{duration:.3f}s"
    return response

@app.get("/items")
def list_items(request: Request):
    # 路由里读中间件写的值
    return {"request_id": request.state.request_id}
\`\`\`

\`request.state\` 的生命周期是一次请求，请求结束就没了。适合在一次请求的处理链路里传值（如 trace_id、当前用户、权限信息）。

## 异步路由里读 body

\`Request\` 对象的方法大多是异步的（要 await），因为读 body 涉及 I/O：

\`\`\`python
@app.post("/raw")
async def read_raw(request: Request):
    # 读原始 body 字节（不解析 JSON）
    body = await request.body()
    # 读 JSON
    data = await request.json()
    return {"body_size": len(body), "data": data}
\`\`\`

⚠️ 注意：一旦在路由里用 \`request.body()\` 或 \`request.json()\` 读了 body，就不能再让 FastAPI 用 Pydantic 模型解析同一个 body 了（body 流已被消费）。要么用 Pydantic 模型（推荐），要么手动读 \`Request\`，二选一。

## 什么时候用 Request 对象

| 场景 | 用什么 |
|------|--------|
| 读查询参数（带校验） | 声明查询参数（Query） |
| 读路径参数 | 路径参数声明 |
| 读 JSON body | Pydantic 模型（推荐） |
| 读请求头（特定几个） | Header() 参数声明 |
| 读 Cookie（特定几个） | Cookie() 参数声明 |
| 拿原始请求 / 客户端 IP / 完整 URL | Request 对象 |
| 中间件里传值给路由 | request.state |
| 读非标准请求头 / 动态参数 | Request 对象 |

原则：**能用 FastAPI 声明式参数（带类型校验和文档）就别用 Request**。声明式参数有校验、有文档、可读性好。Request 对象是"逃生舱"，用于声明式覆盖不到的场景。

## Request 和声明式参数混用

可以同时声明 \`request: Request\` 和其他参数：

\`\`\`python
from fastapi import FastAPI, Request, Query

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(
    item_id: int,                         # 路径参数（声明式）
    q: str | None = Query(None),          # 查询参数（声明式）
    request: Request = None               # 原始请求对象
):
    # 既有声明式参数的校验，又能拿原始请求
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return {
        "item_id": item_id,
        "q": q,
        "client_ip": client_ip,
        "user_agent": user_agent
    }
\`\`\`

FastAPI 会自动识别 \`Request\` 类型并注入，不会把它当查询参数。

## 直接返回 vs response_model

最后提一个相关概念：\`response_model\`。

普通返回（返回 dict）时，FastAPI 不过滤字段，你返回啥前端拿啥：

\`\`\`python
class User(BaseModel):
    id: int
    name: str
    password: str  # 敏感字段！

@app.get("/users/{id}", response_model=UserOut)
def get_user(id: int):
    user = get_from_db(id)  # 含 password
    return user  # 没有 response_model 时，password 会被返回！
\`\`\`

用 \`response_model\` 指定输出模型，FastAPI 会按模型过滤字段：

\`\`\`python
class UserOut(BaseModel):
    id: int
    name: str
    # 没有 password，输出时会被过滤掉

@app.get("/users/{id}", response_model=UserOut)
def get_user(id: int):
    user = get_from_db(id)  # 含 password
    return user  # 实际返回前会被 UserOut 过滤，password 不会泄漏
\`\`\`

\`response_model\` 的作用：**定义响应结构 + 自动过滤字段 + 生成响应文档**。涉及敏感字段时一定要用，避免把内部字段泄漏给前端。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| body 读两次 | Request.json() 和 Pydantic 模型都用 | 二选一 |
| 代理后 IP 错 | request.client.host 是代理 IP | 读 X-Forwarded-For |
| state 滥用 | 什么都塞 state | 只放请求级共享数据 |
| 忽略 response_model | 敏感字段泄漏 | 用 response_model 过滤 |
| headers 大小写 | 担心拿不到 | Headers 大小写不敏感 |

---

## 本章小结

| 属性/方法 | 用途 |
|-----------|------|
| request.headers | 请求头（大小写不敏感） |
| request.query_params | 查询参数 |
| request.path_params | 路径参数 |
| request.client | 客户端 IP/端口 |
| request.method | HTTP 方法 |
| request.url | 完整 URL |
| request.cookies | Cookie |
| request.state | 请求级共享状态 |
| await request.body() | 原始 body 字节 |
| await request.json() | 解析 JSON body |
| response_model | 过滤响应字段 |

到这儿，路径与查询参数这块讲完了。你已经能处理 URL 里的各种参数、做校验、读原始请求。下一批章节进入请求体——用 Pydantic 模型接收 JSON body，这是构建真正业务接口的关键。`
  }
];
