// =============================================================
// FastAPI 应用开发实战教程 - 第 4 批章节（Pydantic 数据校验 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   pyd-basics     : Pydantic 基础
//   pyd-types      : 字段类型与校验
//   pyd-validators : 自定义校验器
//   pyd-config     : 模型配置与高级特性
// =============================================================

export const chapters = [
  // ============================================================
  // 第 13 章：Pydantic 基础
  // ============================================================
  {
    id: "pyd-basics",
    group: "Pydantic 数据校验",
    icon: "🧬",
    title: "Pydantic 基础",
    content: `# Pydantic 基础

## Pydantic 是什么

Pydantic 是 Python 的数据校验库，核心思想是**用类型注解定义数据模型，自动做类型校验和转换**。它由 Samuel Colvin 创建，是 FastAPI 的两大基石之一（另一个是 Starlette）。

一句话理解 Pydantic：你声明"这个字段应该是 int"，传进来个字符串 \`"42"\`，Pydantic 自动转成 int 42；传进来 \`"abc"\` 转不了，直接报错。

这和 Python 原生的动态类型相反——Python 默认不校验类型，Pydantic 把类型声明变成运行时的强约束。

## BaseModel 定义数据模型

Pydantic 的核心是 \`BaseModel\` 类。继承它，用类型注解定义字段，就得到一个数据模型：

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 name，类型: str
    name: str
    # 字段 email，类型: str
    email: str
    is_active: bool = True   # 有默认值，可选
    age: int | None = None   # 可选，可以是 None
\`\`\`

这个 \`User\` 模型描述了"一个用户对象长什么样"：必须有 id（int）、name（str）、email（str），is_active 默认 True，age 可选。

## 自动校验类型

实例化模型时，Pydantic 自动校验每个字段的类型：

\`\`\`python
# ✅ 正确：类型匹配
# 定义变量 user，赋值为 User(id=1, name="alice", email="a@x.com")
user = User(id=1, name="alice", email="a@x.com")
# 调用 print()
print(user)
# id=1 name='alice' email='a@x.com' is_active=True age=None

# ✅ 自动转换：字符串 "42" 能转 int，所以接受
# 定义变量 user2，赋值为 User(id="42", name="bob", email="b@x.com")
user2 = User(id="42", name="bob", email="b@x.com")
print(user2.id, type(user2.id))  # 42 <class 'int'>

# ❌ 校验失败：name 给了 int 且转不了 str... 其实能转
# 真正失败的是这种：
# 从 pydantic 导入 ValidationError
from pydantic import ValidationError
# 尝试执行，捕获异常
try:
    # 调用 User()
    User(id="not_a_number", name="x", email="x@x.com")
# 捕获 ValidationError 异常，赋值为 e
except ValidationError as e:
    # 调用 print()
    print(e)
# 输出：id 输入 'not_a_number' 不是合法 int
\`\`\`

注意 Pydantic 默认是**宽松模式**：能转就转（\`"42"\` → 42），转不了才报错。这是为了兼容 HTTP 来的数据（URL/body 里全是字符串）。

## 自动转换的细节

\`\`\`python
# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float
    # 字段 in_stock，类型: bool
    in_stock: bool

# 字符串 "9.9" → float 9.9
# 定义变量 p，赋值为 Product(name="book", price="9.9", in_stock="t...
p = Product(name="book", price="9.9", in_stock="true")
print(p.price, type(p.price))       # 9.9 <class 'float'>
# 调用 print()
print(p.in_stock, type(p.in_stock)) # True <class 'bool'>

# int 42 → str "42"（int 能转 str）
# 定义变量 p2，赋值为 Product(name=42, price=10, in_stock=1)
p2 = Product(name=42, price=10, in_stock=1)
print(p2.name, type(p2.name))  # 42 <class 'str'>（注意是字符串！）
\`\`\`

这种"能转就转"的行为有时会带来意外（\`name=42\` 变成字符串 \`"42"\`）。如果要严格只接受声明类型，用严格类型（下一章讲 \`StrictStr\` 等）。

## 模型实例化

\`\`\`python
# 关键字参数实例化
# 定义变量 user，赋值为 User(id=1, name="alice", email="a@x.com", age...
user = User(id=1, name="alice", email="a@x.com", age=25)

# 访问字段
print(user.name)    # alice
print(user.age)     # 25

# 修改字段（默认模型可变）
# user.age = 26
user.age = 26

# 校验失败抛 ValidationError
# 从 pydantic 导入 ValidationError
from pydantic import ValidationError
# 尝试执行，捕获异常
try:
    # 调用 User()
    User(id="x", name="a", email="a@b.com")
# 捕获 ValidationError 异常，赋值为 e
except ValidationError as e:
    # e.errors() 返回错误列表
    # 遍历 e.errors()，取 err
    for err in e.errors():
        # 调用 print()
        print(err)
\`\`\`

\`ValidationError\` 的 \`.errors()\` 返回结构化错误列表，每条含 \`type\`（错误类型）、\`loc\`（位置）、\`msg\`（信息）、\`input\`（输入值）。FastAPI 捕获这个异常，转成 422 响应返回前端。

## 序列化：dict / json

模型可以转成字典或 JSON 字符串：

\`\`\`python
# 定义变量 user，赋值为 User(id=1, name="alice", email="a@x.com")
user = User(id=1, name="alice", email="a@x.com")

# 转字典
# 定义变量 d，赋值为 user.model_dump()
d = user.model_dump()
print(d)  # {'id': 1, 'name': 'alice', 'email': 'a@x.com', 'is_active': True, 'age': None}

# 转 JSON 字符串
# 定义变量 j，赋值为 user.model_dump_json()
j = user.model_dump_json()
print(j)  # '{"id":1,"name":"alice","email":"a@x.com","is_active":true,"age":null}'

# 部分字段序列化
user.model_dump(include={"id", "name"})     # 只含 id 和 name
user.model_dump(exclude={"email"})           # 排除 email
user.model_dump(exclude_none=True)           # 排除值为 None 的字段
\`\`\`

\`include\`/\`exclude\` 在控制返回给前端的字段时很有用（比如不返回密码字段）。

## Pydantic v1 vs v2

Pydantic 在 2023 年发布了 v2，是重写版本（用 Rust 实现核心，性能快 5-50 倍）。FastAPI 0.100+ 默认用 v2。v1 和 v2 的主要 API 差异：

| 操作 | Pydantic v1 | Pydantic v2 |
|------|-------------|-------------|
| 转字典 | \`.dict()\` | \`.model_dump()\` |
| 转 JSON | \`.json()\` | \`.model_dump_json()\` |
| 从字典创建 | \`.parse_obj()\` | \`.model_validate()\` |
| 从 JSON 创建 | \`.parse_raw()\` | \`.model_validate_json()\` |
| 从 ORM 创建 | \`.from_orm()\` | \`.model_validate()\`（配合 from_attributes） |
| 配置 | 内部 \`class Config:\` | \`model_config = ConfigDict(...)\` |
| 校验器 | \`@validator\` | \`@field_validator\` |
| 字段约束 | \`Field(..., regex=)\` | \`Field(..., pattern=)\` |

⚠️ 兼容性提醒：FastAPI 仍兼容 v1 的部分写法（通过 \`pydantic.v1\` 兼容层），但新项目应该用 v2 API。本教程一律用 v2。

## 为什么 FastAPI 选 Pydantic

理解这个"为什么"，能帮你理解 FastAPI 的设计哲学：

1. **类型安全**：请求体进来就用 Pydantic 校验，脏数据进不到业务逻辑。少写一堆 \`if not isinstance(x, int)\`。
2. **自动文档**：Pydantic 模型能生成 JSON Schema，FastAPI 拿来生成 OpenAPI 文档。模型定义 = 文档定义，无需额外维护。
3. **校验和转换一体**：声明类型的同时得到校验和转换，不用分开写。
4. **性能**：Pydantic v2 用 Rust 实现核心，校验速度快，不拖累请求。
5. **生态统一**：FastAPI 全栈用 Pydantic——请求体、响应模型、依赖注入、配置都基于它，学一套通吃。

可以说，没有 Pydantic 就没有 FastAPI 的"类型注解驱动一切"特性。

## 在 FastAPI 里用 Pydantic

回顾一下 Pydantic 在 FastAPI 里的角色：

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 1. 定义模型（Pydantic）
# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 定义 POST 路由：访问 /items 时触发
@app.post("/items")
def create_item(item: Item):   # 2. 作请求体参数
    # item 已是 Item 实例，字段已校验
    return item.model_dump()   # 3. 序列化返回
\`\`\`

整个流程：HTTP body (JSON) → Pydantic 解析校验 → Item 实例 → 业务逻辑 → 序列化 → HTTP 响应。Pydantic 在两端都参与。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| v1/v2 方法混用 | \`.dict()\` v2 弃用警告 | v2 用 model_dump() |
| 宽松转换意外 | \`name=42\` 变成 "42" | 用 StrictStr 严格类型 |
| 忘捕获 ValidationError | 直接抛出 500 | FastAPI 自动捕获转 422 |
| None vs 缺字段 | 有默认值 None 不传是 None，无默认值不传是 422 | 看清必填规则 |
| 模型可变 | 默认能改字段 | 需要 frozen=True（下章讲） |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| Pydantic | 基于类型注解的数据校验库 |
| BaseModel | 定义数据模型的基类 |
| 自动校验 | 类型不符报 ValidationError |
| 自动转换 | "42" → 42 等宽松转换 |
| 实例化 | User(id=1, name="a", ...) |
| 序列化 | model_dump() / model_dump_json() |
| v1 vs v2 | v2 用 model_ 前缀方法，性能更好 |
| FastAPI 关系 | 请求体校验 + 响应模型 + 文档都靠它 |

下一章深入 Pydantic 的类型系统——基础类型、日期、UUID、严格类型、枚举，掌握这些能精确表达数据结构。`
  },

  // ============================================================
  // 第 14 章：字段类型与校验
  // ============================================================
  {
    id: "pyd-types",
    group: "Pydantic 数据校验",
    icon: "🎯",
    title: "字段类型与校验",
    content: `# 字段类型与校验

## 为什么要精通类型系统

Pydantic 的核心是类型注解。类型用得准，校验就准；类型用得糙，校验就漏。比如用 \`str\` 接收邮箱，Pydantic 只校验"是字符串"，不校验"是合法邮箱"。要校验邮箱格式，得用 \`EmailStr\`。

这一章把 Pydantic 支持的类型系统过一遍，让你知道什么场景用什么类型。

## 基础类型

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义 Pydantic 数据模型 Demo，继承 BaseModel
class Demo(BaseModel):
    name: str          # 字符串
    age: int           # 整数
    score: float       # 浮点
    is_vip: bool       # 布尔
    raw: bytes         # 字节串（二进制）
\`\`\`

这些是最基础的。Pydantic 会做宽松转换：

- \`age="18"\` → 18（字符串转 int）
- \`is_vip="true"\` → True
- \`score=10\` → 10.0（int 转 float）

\`bytes\` 用于二进制数据（如文件内容、加密后的密文）。

## 日期时间类型

处理时间是后端常见需求。Pydantic 内置支持：

\`\`\`python
# 从 datetime 导入 datetime, date, time, timedelta
from datetime import datetime, date, time, timedelta
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义 Pydantic 数据模型 Event，继承 BaseModel
class Event(BaseModel):
    created_at: datetime      # 完整时间戳
    birthday: date            # 仅日期
    alarm: time               # 仅时间
    duration: timedelta       # 时间段

# 各种格式的字符串都能解析（ISO 8601 最稳）
# 定义变量 e，赋值为 Event(
e = Event(
    created_at="2024-07-01T10:30:00",   # ISO 格式
    # 定义变量 birthday，赋值为 "1990-05-20",
    birthday="1990-05-20",
    # 定义变量 alarm，赋值为 "08:00:00",
    alarm="08:00:00",
    duration="PT1H30M"                  # ISO 8601 时长
# )
)
print(e.created_at)  # 2024-07-01 10:30:00
print(e.duration)    # 1:30:00
\`\`\`

Pydantic 能解析多种日期格式字符串，但生产中建议统一用 ISO 8601（\`YYYY-MM-DDTHH:MM:SS\`），避免歧义。前端传时间戳（int 秒/毫秒）也能转 datetime。

## UUID 类型

\`\`\`python
# 从 uuid 导入 UUID
from uuid import UUID
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义 Pydantic 数据模型 Record，继承 BaseModel
class Record(BaseModel):
    # 字段 id，类型: UUID
    id: UUID

# 字符串自动转 UUID
# 定义变量 r，赋值为 Record(id="3fa85f64-5717-4562-b3fc-2c963f66af...
r = Record(id="3fa85f64-5717-4562-b3fc-2c963f66afa6")
print(r.id, type(r.id))  # 3fa85f64-... <class 'uuid.UUID'>

# 非法 UUID 报错
# Record(id="not-uuid") → ValidationError
\`\`\`

UUID 用于全局唯一标识（数据库主键、分布式 ID）。用 \`UUID\` 类型比 \`str\` 安全——格式错了直接拦。

## URL 与特殊字符串类型

Pydantic 提供一批"带格式校验的字符串类型"：

\`\`\`python
# 从 pydantic 导入 BaseModel, HttpUrl, EmailStr, AnyUrl, AnyHttpUrl
from pydantic import BaseModel, HttpUrl, EmailStr, AnyUrl, AnyHttpUrl

# 定义 Pydantic 数据模型 Profile，继承 BaseModel
class Profile(BaseModel):
    website: HttpUrl      # 必须是 http/https URL
    email: EmailStr       # 必须是合法邮箱（需装 email-validator）
    api: AnyHttpUrl      # 任意 http URL

# 定义变量 p，赋值为 Profile(
p = Profile(
    # 定义变量 website，赋值为 "https://example.com",
    website="https://example.com",
    # 定义变量 email，赋值为 "alice@example.com",
    email="alice@example.com",
    # 定义变量 api，赋值为 "http://api.example.com"
    api="http://api.example.com"
# )
)
print(p.website)  # https://example.com/ （注意末尾补了 /）
\`\`\`

| 类型 | 校验 |
|------|------|
| \`HttpUrl\` | http/https URL，自动规范化 |
| \`AnyHttpUrl\` | http/https URL |
| \`AnyUrl\` | 任意 URL（含 ftp 等） |
| \`EmailStr\` | 邮箱格式（需 \`pip install email-validator\`） |
| \`IPvAnyAddress\` | IPv4/IPv6 地址 |
| \`IPv4Address\` / \`IPv6Address\` | 具体版本 IP |

⚠️ \`EmailStr\` 需要额外装 \`email-validator\` 包，否则导入报错。

## 严格类型 strict

默认 Pydantic 是宽松模式（能转就转）。如果不想转换、要求"必须是这个类型本身"，用严格类型：

\`\`\`python
# 从 pydantic 导入 BaseModel, StrictStr, StrictInt
from pydantic import BaseModel, StrictStr, StrictInt

# 定义 Pydantic 数据模型 StrictDemo，继承 BaseModel
class StrictDemo(BaseModel):
    name: StrictStr    # 必须是 str，不接受 int 转的
    age: StrictInt     # 必须是 int，不接受 "18" 转的

# StrictDemo(name=42, age=18) → name 报错（42 是 int 不是 str）
# StrictDemo(name="a", age="18") → age 报错（"18" 是 str 不是 int）
\`\`\`

严格类型家族：\`StrictStr\`、\`StrictInt\`、\`StrictFloat\`、\`StrictBool\`、\`StrictBytes\`。

什么时候用严格类型？当你确定数据源就是该类型（比如内部系统调用，不希望任何隐式转换），用它防止意外转换。HTTP API 对外通常用宽松模式（兼容前端各种传法）。

也可以整个模型开严格模式（下一章 model_config 里讲）。

## 集合类型

### List 列表

\`\`\`python
# 定义 Pydantic 数据模型 Cart，继承 BaseModel
class Cart(BaseModel):
    item_ids: list[int]          # 整数列表（Python 3.9+）
    # 老写法
    # 从 typing 导入 List
    from typing import List
    # 字段 tags，类型: List[str]
    tags: List[str]
\`\`\`

### Tuple 元组

\`\`\`python
# 定义 Pydantic 数据模型 Point，继承 BaseModel
class Point(BaseModel):
    # 定长定类型：(float, float)
    # 字段 coords，类型: tuple[float, float]
    coords: tuple[float, float]
    # 变长同类型：tuple[int, ...] 表示任意长度 int 元组
    # 字段 ids，类型: tuple[int, ...]
    ids: tuple[int, ...]
\`\`\`

### Set 集合

\`\`\`python
# 定义 Pydantic 数据模型 Tags，继承 BaseModel
class Tags(BaseModel):
    # 自动去重
    # 字段 tags，类型: set[str]
    tags: set[str]
# Tags(tags=["a", "a", "b"]).tags == {"a", "b"}
\`\`\`

### Dict 字典

\`\`\`python
# 从 typing 导入 Dict, Any
from typing import Dict, Any

# 定义 Pydantic 数据模型 Config，继承 BaseModel
class Config(BaseModel):
    # 键 str，值 int
    # 字段 counts，类型: dict[str, int]
    counts: dict[str, int]
    # 键 str，值任意类型
    # 字段 extra，类型: Dict[str, Any]
    extra: Dict[str, Any]
\`\`\`

## Optional 与可空类型

表示"可以是某类型，也可以是 None"：

\`\`\`python
# 从 typing 导入 Optional
from typing import Optional

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # Python 3.10+ 语法（推荐）
    # 字段 age，类型: int | None，默认值: None
    age: int | None = None
    # 老语法（3.9 以下）
    # 字段 age2，类型: Optional[int]，默认值: None
    age2: Optional[int] = None

# age 不传 → None
# age=25 → 25
# age=null → None
\`\`\`

⚠️ 再强调：\`int | None\` 只是说"值可以是 None"，但**没默认值仍是必填**（必须传，哪怕是 null）。要可选（不传也行），必须加 \`= None\`。

## Union 多类型

一个字段可以是多种类型之一：

\`\`\`python
# 从 typing 导入 Union
from typing import Union

# 定义 Pydantic 数据模型 Value，继承 BaseModel
class Value(BaseModel):
    # 可以是 int 或 str
    # 字段 id，类型: Union[int, str]
    id: Union[int, str]
    # Python 3.10+ 简写
    # 字段 id2，类型: int | str
    id2: int | str

# Value(id=42)       → id=42 (int)
# Value(id="abc")    → id="abc" (str)
# Value(id=3.14)     → 报错（不是 int 也不是 str）
\`\`\`

Union 按顺序匹配：\`Union[int, str]\` 会先试 int，能转就转成 int。所以 \`Value(id="42")\` 会得到 \`id=42\`（int），不是字符串 "42"。要想保留字符串，把顺序写成 \`Union[str, int]\`。

## Literal 字面量类型

限定字段只能是几个特定值之一（比 Enum 轻量）：

\`\`\`python
# 从 typing 导入 Literal
from typing import Literal

# 定义 Pydantic 数据模型 Config，继承 BaseModel
class Config(BaseModel):
    # 只能是这三个字符串之一
    # 字段 env，类型: Literal["dev", "staging", "prod"]
    env: Literal["dev", "staging", "prod"]
    # 数字字面量
    # 字段 level，类型: Literal[1, 2, 3]
    level: Literal[1, 2, 3]

# Config(env="dev", level=1)      ✅
# Config(env="test", level=1)     ❌（env 不在允许值里）
\`\`\`

Literal 适合少量固定值（环境、状态枚举）。值多或要带额外属性时用 Enum。

## Enum 枚举

\`\`\`python
# 从 enum 导入 Enum
from enum import Enum

# 定义类 Color，继承 str, Enum
class Color(str, Enum):
    # 定义变量 red，赋值为 "red"
    red = "red"
    # 定义变量 green，赋值为 "green"
    green = "green"
    # 定义变量 blue，赋值为 "blue"
    blue = "blue"

# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 color，类型: Color
    color: Color

# 定义变量 p，赋值为 Product(color="red")
p = Product(color="red")
print(p.color)        # Color.red
print(p.color.value)  # red
print(p.color.name)   # red

# Product(color="purple") → 报错（不在枚举里）
\`\`\`

继承 \`str, Enum\` 让枚举值能像字符串用（JSON 序列化时输出字符串值）。也可以继承 \`int, Enum\`。

## Any 类型（慎用）

\`Any\` 表示任意类型，不做校验：

\`\`\`python
# 从 typing 导入 Any
from typing import Any

# 定义 Pydantic 数据模型 Bag，继承 BaseModel
class Bag(BaseModel):
    anything: Any  # 接受任何值，不校验

# Bag(anything=123) ✅
# Bag(anything=[1,2,{3:4}]) ✅
# Bag(anything="anything") ✅
\`\`\`

慎用 \`Any\`——它等于关掉校验，失去了 Pydantic 的核心价值。只在确实无法预知类型（如透传字段）时用，且要在业务代码里自己保证安全。

## 严格模式 vs 宽松模式

可以在模型级配置严格模式：

\`\`\`python
# 从 pydantic 导入 BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义 Pydantic 数据模型 StrictModel，继承 BaseModel
class StrictModel(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(strict=True)
    model_config = ConfigDict(strict=True)
    # 字段 name，类型: str
    name: str
    # 字段 age，类型: int
    age: int

# strict=True 后，整个模型所有字段都严格校验
# StrictModel(name=42, age="18") → name 和 age 都报错
\`\`\`

也可以单字段严格（用 StrictStr 等）或单次校验严格（\`Model.model_validate(data, strict=True)\`），灵活控制。

## 类型选择速查表

| 需求 | 推荐类型 |
|------|----------|
| 普通字符串 | \`str\` |
| 邮箱 | \`EmailStr\` |
| URL | \`HttpUrl\` |
| 整数 ID | \`int\`（或 \`conint(ge=1)\`） |
| 全局唯一 ID | \`UUID\` |
| 时间 | \`datetime\` |
| 几个固定值 | \`Literal\` 或 \`Enum\` |
| 多类型 | \`Union\` / \`X \| Y\` |
| 可空 | \`X \| None\` + \`= None\` |
| 任意值 | \`Any\`（慎用） |

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| 邮箱用 str | 不校验格式 | 用 EmailStr |
| Optional 忘默认值 | 仍必填 | 加 \`= None\` |
| Union 顺序 | int 在前会吞掉字符串数字 | 想保留 str 把 str 放前 |
| Any 滥用 | 失去校验 | 尽量用具体类型 |
| EmailStr 没装包 | 导入报错 | pip install email-validator |
| 时间格式乱 | 各地格式不一 | 统一 ISO 8601 |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 基础类型 | str/int/float/bool/bytes |
| 日期时间 | datetime/date/time/timedelta |
| UUID | 全局唯一标识 |
| URL/邮箱 | HttpUrl/EmailStr（带格式校验） |
| 严格类型 | StrictStr 等，不转换 |
| 集合 | list/tuple/set/dict |
| Optional | X \| None = None |
| Union | 多类型，按顺序匹配 |
| Literal | 固定几个值 |
| Enum | 枚举，可带属性 |
| Any | 任意，慎用 |

下一章讲自定义校验器——当内置类型和 Field 约束不够用时，写自己的校验逻辑。`
  },

  // ============================================================
  // 第 15 章：自定义校验器
  // ============================================================
  {
    id: "pyd-validators",
    group: "Pydantic 数据校验",
    icon: "🔬",
    title: "自定义校验器",
    content: `# 自定义校验器

## 什么时候需要自定义校验

前面用类型注解和 \`Field()\` 能覆盖大部分校验：类型、长度、范围、正则。但有些校验逻辑无法用类型表达：

- 密码必须含字母和数字（复杂规则，正则能写但难读）
- 两个字段联动：\`password\` 必须等于 \`password_confirm\`
- 用户名不能是黑名单里的词
- 金额 = 单价 × 数量（动态计算）

这些要写代码逻辑，Pydantic 提供 \`field_validator\`（单字段）和 \`model_validator\`（整模型）两个装饰器。

## field_validator 单字段校验

\`@field_validator("字段名")\` 装饰一个方法，在校验该字段时调用：

\`\`\`python
# 从 pydantic 导入 BaseModel, field_validator
from pydantic import BaseModel, field_validator

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 password，类型: str
    password: str

    # 校验 username：不能含空格
    # 装饰器：field_validator
    @field_validator("username")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 validate_username，返回: str
    def validate_username(cls, v: str) -> str:
        # 条件判断：如果 " " in v
        if " " in v:
            # 抛出 ValueError 异常: "用户名不能含空格"
            raise ValueError("用户名不能含空格")
        # 返回 v
        return v

    # 校验 password：至少 8 位，含字母和数字
    # 装饰器：field_validator
    @field_validator("password")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 validate_password，返回: str
    def validate_password(cls, v: str) -> str:
        # 条件判断：如果 len(v) < 8
        if len(v) < 8:
            # 抛出 ValueError 异常: "密码至少 8 位"
            raise ValueError("密码至少 8 位")
        # 条件判断：如果 not any(c.isalpha() for c in v)
        if not any(c.isalpha() for c in v):
            # 抛出 ValueError 异常: "密码必须含字母"
            raise ValueError("密码必须含字母")
        # 条件判断：如果 not any(c.isdigit() for c in v)
        if not any(c.isdigit() for c in v):
            # 抛出 ValueError 异常: "密码必须含数字"
            raise ValueError("密码必须含数字")
        # 返回 v
        return v
\`\`\`

要点：

1. \`@field_validator("字段名")\` 指定校验哪个字段。可一次校验多个：\`@field_validator("a", "b")\`。
2. 必须加 \`@classmethod\`（v2 要求，因为是类方法）。
3. 方法名随意（建议语义化）。
4. 参数 \`v\` 是该字段已经过类型转换后的值。
5. **返回值就是最终存入模型的值**——可以转换它（如去空格、规范化）。
6. 校验失败抛 \`ValueError\`，Pydantic 自动转成 ValidationError → FastAPI 转成 422。

## 校验器是转换器：返回值是最终值

校验器不只是"判断对错"，还能"修改值"。返回值会替换原值：

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str

    # 装饰器：field_validator
    @field_validator("username")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 lower_username，返回: str
    def lower_username(cls, v: str) -> str:
        # 用户名统一小写存
        # 返回 v.lower()
        return v.lower()

    # 装饰器：field_validator
    @field_validator("email")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 strip_email，返回: str
    def strip_email(cls, v: str) -> str:
        # 去首尾空格
        # 返回 v.strip()
        return v.strip()

# 定义变量 u，赋值为 User(username="Alice", email="  a@x.com  ")
u = User(username="Alice", email="  a@x.com  ")
print(u.username)  # alice（被转小写）
print(u.email)     # a@x.com（被去空格）
\`\`\`

这是校验器的强大之处：既校验又规范化数据。

## mode="before" vs mode="after"

校验器可以指定执行时机——在类型转换前还是后：

\`\`\`python
# 从 pydantic 导入 BaseModel, field_validator
from pydantic import BaseModel, field_validator

# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 price，类型: float
    price: float

    # after（默认）：类型转换后执行，v 已经是 float
    # 装饰器：field_validator
    @field_validator("price")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 check_after，返回: float
    def check_after(cls, v: float) -> float:
        # v 是 float（"9.9" 已转成 9.9）
        # 返回 v
        return v

    # before：类型转换前执行，v 是原始值
    # 装饰器：field_validator
    @field_validator("price", mode="before")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 check_before，参数: cls, v
    def check_before(cls, v):
        # v 是原始值（可能是字符串 "9.9" 或数字）
        # 条件判断：如果 isinstance(v, str) and "￥" in v
        if isinstance(v, str) and "￥" in v:
            v = v.replace("￥", "")  # 去掉货币符号再让 Pydantic 转 float
        # 返回 v
        return v
\`\`\`

| mode | 时机 | v 的类型 | 用途 |
|------|------|----------|------|
| \`"after"\`（默认） | 类型转换后 | 声明的类型 | 大部分校验，v 已是目标类型 |
| \`"before"\` | 类型转换前 | 原始输入 | 预处理原始数据（清洗、格式转换） |

\`before\` 适合"原始数据不规范，先清洗再转"，比如去掉货币符号、统一日期格式。\`after\` 适合"已是正确类型，做业务校验"。

## model_validator 整模型校验

跨字段校验（一个字段的校验依赖另一个字段）用 \`@model_validator\`：

\`\`\`python
# 从 pydantic 导入 BaseModel, model_validator
from pydantic import BaseModel, model_validator

# 定义 Pydantic 数据模型 RegisterForm，继承 BaseModel
class RegisterForm(BaseModel):
    # 字段 password，类型: str
    password: str
    # 字段 password_confirm，类型: str
    password_confirm: str

    # 整模型校验：两次密码必须一致
    # 装饰器：model_validator
    @model_validator(mode="after")
    # 定义函数 passwords_match，参数: self
    def passwords_match(self):
        # mode="after" 时 self 是已校验的模型实例
        # 条件判断：如果 self.password != self.password_confirm
        if self.password != self.password_confirm:
            # 抛出 ValueError 异常: "两次密码不一致"
            raise ValueError("两次密码不一致")
        return self  # 必须返回 self
\`\`\`

\`@model_validator(mode="after")\` 的方法接收 \`self\`（已实例化的模型），可以访问所有字段。校验失败抛 ValueError，返回 \`self\` 继续。

### model_validator 的两种 mode

\`\`\`python
# 定义 Pydantic 数据模型 Demo，继承 BaseModel
class Demo(BaseModel):
    # 字段 a，类型: int
    a: int
    # 字段 b，类型: int
    b: int

    # before：在字段校验前，data 是原始字典
    # 装饰器：model_validator
    @model_validator(mode="before")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 pre_validate，参数: cls, data
    def pre_validate(cls, data):
        # data 是原始输入字典（可能含多余字段、类型未转）
        # 条件判断：如果 isinstance(data, dict)
        if isinstance(data, dict):
            # 示例：默认值处理
            # 调用 data.setdefault()
            data.setdefault("b", 0)
        return data  # 必须返回 data

    # after：在字段校验后，self 是模型实例
    # 装饰器：model_validator
    @model_validator(mode="after")
    # 定义函数 post_validate，参数: self
    def post_validate(self):
        # 跨字段校验
        # 条件判断：如果 self.a > self.b
        if self.a > self.b:
            # 抛出 ValueError 异常: "a 不能大于 b"
            raise ValueError("a 不能大于 b")
        # 返回 self
        return self
\`\`\`

| mode | 时机 | 参数 | 用途 |
|------|------|------|------|
| \`"before"\` | 字段校验前 | 原始 data（dict） | 预处理输入、设默认值、删多余字段 |
| \`"after"\` | 字段校验后 | self（模型实例） | 跨字段校验、联动逻辑 |

## 校验器在 FastAPI 里的作用

关键点：**FastAPI 接到请求时，会自动实例化 Pydantic 模型，触发所有校验器**。校验失败自动返回 422，业务代码根本看不到脏数据。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel, field_validator, model_validator
from pydantic import BaseModel, field_validator, model_validator

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 RegisterForm，继承 BaseModel
class RegisterForm(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 password，类型: str
    password: str
    # 字段 password_confirm，类型: str
    password_confirm: str
    # 字段 age，类型: int
    age: int

    # 装饰器：field_validator
    @field_validator("username")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 no_space_in_username，参数: cls, v
    def no_space_in_username(cls, v):
        # 条件判断：如果 " " in v
        if " " in v:
            # 抛出 ValueError 异常: "用户名不能含空格"
            raise ValueError("用户名不能含空格")
        # 返回 v
        return v

    # 装饰器：field_validator
    @field_validator("password")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 strong_password，参数: cls, v
    def strong_password(cls, v):
        # 条件判断：如果 len(v) < 8 or not any(c.isdigit() for c in v)
        if len(v) < 8 or not any(c.isdigit() for c in v):
            # 抛出 ValueError 异常: "密码至少 8 位且含数字"
            raise ValueError("密码至少 8 位且含数字")
        # 返回 v
        return v

    # 装饰器：model_validator
    @model_validator(mode="after")
    # 定义函数 passwords_match，参数: self
    def passwords_match(self):
        # 条件判断：如果 self.password != self.password_confirm
        if self.password != self.password_confirm:
            # 抛出 ValueError 异常: "两次密码不一致"
            raise ValueError("两次密码不一致")
        # 返回 self
        return self

# 定义 POST 路由：访问 /register 时触发
@app.post("/register")
# 定义函数 register，参数: form: RegisterForm
def register(form: RegisterForm):
    # 走到这里时，form 已经过所有校验
    # 业务代码完全不用写校验逻辑
    # 返回 {"username": form.username, "msg": "注册成功"}
    return {"username": form.username, "msg": "注册成功"}
\`\`\`

请求示例：

\`\`\`bash
# ✅ 合法
# 发送 POST 请求
curl -X POST http://localhost:8000/register \\
  # -H "Content-Type: application/json" \\
  -H "Content-Type: application/json" \\
  # -d '{"username":"alice","password":"pass1234","pas
  -d '{"username":"alice","password":"pass1234","password_confirm":"pass1234","age":25}'

# ❌ 密码不一致 → 422
# 发送 POST 请求
curl -X POST http://localhost:8000/register \\
  # -H "Content-Type: application/json" \\
  -H "Content-Type: application/json" \\
  # -d '{"username":"alice","password":"pass1234","pas
  -d '{"username":"alice","password":"pass1234","password_confirm":"pass4321","age":25}'
\`\`\`

第二个请求返回 422，\`detail\` 里会指出哪个校验器失败：

\`\`\`json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body"],
      "msg": "Value error, 两次密码不一致",
      "ctx": {"error": "..."}
    }
  ]
}
\`\`\`

## 实战：用户注册完整校验

把所有校验技巧用上，写一个生产级的注册模型：

\`\`\`python
# 从 pydantic 导入 BaseModel, field_validator, model_validator, EmailStr, Field
from pydantic import BaseModel, field_validator, model_validator, EmailStr, Field

# 定义字典 FORBIDDEN_NAMES
FORBIDDEN_NAMES = {"admin", "root", "system", "null"}

# 定义 Pydantic 数据模型 UserRegister，继承 BaseModel
class UserRegister(BaseModel):
    # 字段 username，类型: str，默认值: Field(..., min_length=3, max_length=20)
    username: str = Field(..., min_length=3, max_length=20)
    # 字段 email，类型: EmailStr
    email: EmailStr
    # 字段 password，类型: str，默认值: Field(..., min_length=8)
    password: str = Field(..., min_length=8)
    # 字段 password_confirm，类型: str
    password_confirm: str
    # 字段 age，类型: int，默认值: Field(..., ge=0, le=150)
    age: int = Field(..., ge=0, le=150)
    # 字段 accept_terms，类型: bool
    accept_terms: bool

    # before：预处理
    # 装饰器：field_validator
    @field_validator("username", mode="before")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 strip_username，参数: cls, v
    def strip_username(cls, v):
        # 条件判断：如果 isinstance(v, str)
        if isinstance(v, str):
            return v.strip().lower()  # 去空格 + 转小写
        # 返回 v
        return v

    # after：业务校验
    # 装饰器：field_validator
    @field_validator("username")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 check_username，返回: str
    def check_username(cls, v: str) -> str:
        # 条件判断：如果 v in FORBIDDEN_NAMES
        if v in FORBIDDEN_NAMES:
            # 抛出 ValueError 异常: "用户名被禁用"
            raise ValueError("用户名被禁用")
        # 返回 v
        return v

    # 装饰器：field_validator
    @field_validator("password")
    # 装饰器：classmethod
    @classmethod
    # 定义函数 check_password，返回: str
    def check_password(cls, v: str) -> str:
        # 定义变量 has_letter，赋值为 any(c.isalpha() for c in v)
        has_letter = any(c.isalpha() for c in v)
        # 定义变量 has_digit，赋值为 any(c.isdigit() for c in v)
        has_digit = any(c.isdigit() for c in v)
        # 条件判断：如果 not (has_letter and has_digit)
        if not (has_letter and has_digit):
            # 抛出 ValueError 异常: "密码必须含字母和数字"
            raise ValueError("密码必须含字母和数字")
        # 返回 v
        return v

    # 跨字段校验
    # 装饰器：model_validator
    @model_validator(mode="after")
    # 定义函数 validate_form，参数: self
    def validate_form(self):
        # 条件判断：如果 self.password != self.password_confirm
        if self.password != self.password_confirm:
            # 抛出 ValueError 异常: "两次密码不一致"
            raise ValueError("两次密码不一致")
        # 条件判断：如果 not self.accept_terms
        if not self.accept_terms:
            # 抛出 ValueError 异常: "必须接受条款才能注册"
            raise ValueError("必须接受条款才能注册")
        # 返回 self
        return self
\`\`\`

这个模型把所有校验集中在模型层，路由里只剩业务逻辑（存库、发邮件）。校验逻辑可复用（别的接口用同样的模型）、可测试（不依赖 FastAPI）、文档清晰（Swagger 能展示部分约束）。

## 校验器注意事项

1. **校验器顺序**：Field 约束 → field_validator(before) → 类型转换 → field_validator(after) → model_validator(after)。了解顺序避免意外。
2. **不要在校验器里做重 I/O**：校验器同步执行，做数据库查询会阻塞。涉及数据库的校验放路由里（或用依赖注入）。
3. **before 校验器返回值要小心**：返回的值会进类型转换，返回错类型可能报错。
4. **抛 ValueError 而非 Exception**：Pydantic 捕获 ValueError 转 ValidationError。抛别的异常会变成 500。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| 忘 @classmethod | v2 要求类方法 | 加 @classmethod |
| 忘 return | 返回 None 覆盖原值 | 校验器必须返回值 |
| model_validator 忘 return self | 模型变 None | 返回 self |
| before 返回错类型 | 类型转换失败 | before 处理后返回可转换的值 |
| 校验器做 I/O | 阻塞请求 | I/O 校验放路由/依赖 |
| 抛 Exception | 变 500 | 抛 ValueError |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| field_validator | 单字段校验 |
| model_validator | 跨字段/整模型校验 |
| @classmethod | v2 校验器必须加 |
| 返回值 | 是最终存入的值（可转换） |
| mode="before" | 类型转换前，预处理原始值 |
| mode="after" | 类型转换后，业务校验 |
| 抛 ValueError | 自动转 422 |
| FastAPI 集成 | 自动触发，业务代码零校验 |

下一章讲模型配置——用 model_config 统一设置模型行为，以及别名、ORM 模式、不可变、计算属性等高级特性。`
  },

  // ============================================================
  // 第 16 章：模型配置与高级特性
  // ============================================================
  {
    id: "pyd-config",
    group: "Pydantic 数据校验",
    icon: "⚙️",
    title: "模型配置与高级特性",
    content: `# 模型配置与高级特性

## 模型配置：Config 到 model_config

Pydantic 模型的行为可以用配置调整。v1 用内部 \`class Config:\`，v2 用 \`model_config\`（推荐，类型安全）：

\`\`\`python
# 从 pydantic 导入 BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # v2 写法（推荐）
    # 定义变量 model_config，赋值为 ConfigDict(
    model_config = ConfigDict(
        str_strip_whitespace=True,  # 字符串自动去首尾空格
        extra="forbid",              # 禁止额外字段
        str_max_length=1000          # 字符串默认最大长度
    # )
    )

    # 字段 name，类型: str
    name: str
    # 字段 email，类型: str
    email: str

# v1 老写法（仍能用，但不推荐）
# 定义 Pydantic 数据模型 UserV1，继承 BaseModel
class UserV1(BaseModel):
    # 字段 name，类型: str
    name: str
    # 定义类 Config
    class Config:
        # 定义变量 str_strip_whitespace，赋值为 True
        str_strip_whitespace = True
        # 定义变量 extra，赋值为 "forbid"
        extra = "forbid"
\`\`\`

\`ConfigDict\` 本质是 TypedDict，IDE 能自动补全键名、检查拼写，比 v1 的裸字典安全。

## 常用配置项

| 配置 | 作用 | 示例 |
|------|------|------|
| \`str_strip_whitespace\` | 字符串去首尾空格 | \`True\` |
| \`str_max_length\` | 字符串默认最大长度 | \`1000\` |
| \`extra\` | 额外字段处理 | \`"forbid"\` / \`"ignore"\` / \`"allow"\` |
| \`frozen\` | 模型不可变 | \`True\` |
| \`populate_by_name\` | 允许用字段名或别名 | \`True\` |
| \`from_attributes\` | 从 ORM 对象创建 | \`True\` |
| \`str_to_lower\` / \`str_to_upper\` | 字符串转大小写 | \`True\` |
| \`use_enum_values\` | 枚举字段存值而非枚举 | \`True\` |

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(
    model_config = ConfigDict(
        # 定义变量 str_strip_whitespace，赋值为 True,
        str_strip_whitespace=True,
        str_to_lower=True,        # 字符串统一小写
        # 定义变量 extra，赋值为 "forbid"
        extra="forbid"
    # )
    )
    # 字段 name，类型: str
    name: str

# User(name="  Alice  ").name == "alice"
\`\`\`

## 字段别名 alias

实际场景：JSON 用 camelCase（前端习惯 \`userId\`），Python 用 snake_case（\`user_id\`）。用 \`alias\` 桥接：

\`\`\`python
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # JSON 里是 userId，Python 里用 user_id
    # 字段 user_id，类型: int，默认值: Field(..., alias="userId")
    user_id: int = Field(..., alias="userId")
    # 字段 order_name，类型: str，默认值: Field(..., alias="orderName")
    order_name: str = Field(..., alias="orderName")

# 用别名实例化
# 定义变量 o，赋值为 Order(userId=42, orderName="book")
o = Order(userId=42, orderName="book")
print(o.user_id)     # 42
print(o.order_name)  # book
\`\`\`

但默认情况下，实例化时**必须用别名**（\`userId=42\`），不能用字段名（\`user_id=42\` 会报错）。想两者都行，开 \`populate_by_name\`：

\`\`\`python
# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(populate_by_name=True)
    model_config = ConfigDict(populate_by_name=True)
    # 字段 user_id，类型: int，默认值: Field(..., alias="userId")
    user_id: int = Field(..., alias="userId")

# 两种写法都行
# 调用 Order()
Order(userId=42)
Order(user_id=42)  # 配合 populate_by_name=True 才行
\`\`\`

### 序列化时的别名

\`model_dump()\` 默认用字段名序列化，想用别名序列化（输出给前端 camelCase）：

\`\`\`python
# 定义变量 o，赋值为 Order(userId=42, orderName="book")
o = Order(userId=42, orderName="book")

# 默认用字段名
# 调用 o.model_dump()
o.model_dump()
# {'user_id': 42, 'order_name': 'book'}

# 用别名（输出 camelCase，给前端）
# 调用 o.model_dump()
o.model_dump(by_alias=True)
# {'userId': 42, 'orderName': 'book'}
\`\`\`

在 FastAPI 里，响应模型默认用字段名。要响应时用别名，给路由加 \`response_model_by_alias=True\`：

\`\`\`python
# 定义 GET 路由：访问 /orders/{id} 时触发
@app.get("/orders/{id}", response_model=Order, response_model_by_alias=True)
# 定义函数 get_order，参数: id: int
def get_order(id: int):
    # ...
    ...
# 响应体是 {"userId": 42, "orderName": "book"}
\`\`\`

## 从 ORM 创建：from_attributes

数据库 ORM（如 SQLAlchemy）的对象不是 dict，不能直接塞给 BaseModel。开 \`from_attributes=True\`，Pydantic 会从对象的属性读取：

\`\`\`python
# 从 pydantic 导入 BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict

# SQLAlchemy 模型（伪代码）
# 定义类 UserORM
class UserORM:
    # 定义函数 __init__，参数: self
    def __init__(self):
        # self.id = 1
        self.id = 1
        # self.name = "alice"
        self.name = "alice"
        # self.email = "a@x.com"
        self.email = "a@x.com"

# Pydantic 模型
# 定义 Pydantic 数据模型 UserSchema，继承 BaseModel
class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # 关键配置

    # 字段 id，类型: int
    id: int
    # 字段 name，类型: str
    name: str
    # 字段 email，类型: str
    email: str

# 定义变量 orm_user，赋值为 UserORM()
orm_user = UserORM()
# 从 ORM 对象创建（不用手动转 dict）
# 定义变量 schema，赋值为 UserSchema.model_validate(orm_user)
schema = UserSchema.model_validate(orm_user)
print(schema.name)  # alice
\`\`\`

\`from_attributes\`（v1 叫 \`orm_mode\`）让 Pydantic 能从任意有属性的对象创建模型，是配合 SQLAlchemy 等 ORM 的关键。FastAPI 路由返回 ORM 对象时，配合 \`response_model\` 会自动用这个机制转换。

## JSON Schema 定制

Pydantic 模型生成的 JSON Schema 可以定制，给文档加示例：

\`\`\`python
# 从 pydantic 导入 BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(
    model_config = ConfigDict(
        # 定义字典 json_schema_extra
        json_schema_extra={
            # "examples": [
            "examples": [
                # {"id": 1, "name": "alice", "email": "a@x.com"}
                {"id": 1, "name": "alice", "email": "a@x.com"}
            # ]
            ]
        # }
        }
    # )
    )
    # 字段 id，类型: int
    id: int
    # 字段 name，类型: str
    name: str
    # 字段 email，类型: str
    email: str

# 生成的 schema 带 examples，Swagger 里会预填
# 调用 print()
print(User.model_json_schema())
\`\`\`

\`json_schema_extra\` 接收一个字典，会合并到生成的 schema 里。常用来加示例、自定义标题、说明文档级信息。

也可以用 \`model_config\` 的 \`json_schema_extra\` 传一个函数，动态修改 schema：

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(json_schema_extra=lambda schema: s...
    model_config = ConfigDict(json_schema_extra=lambda schema: schema.pop("title"))
    # ...
    ...
\`\`\`

## frozen=True 不可变模型

默认模型可变（能改字段）。需要不可变（如配置、值对象）时用 \`frozen=True\`：

\`\`\`python
# 定义 Pydantic 数据模型 Config，继承 BaseModel
class Config(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(frozen=True)
    model_config = ConfigDict(frozen=True)
    # 字段 debug，类型: bool，默认值: False
    debug: bool = False
    # 字段 port，类型: int，默认值: 8000
    port: int = 8000

# 定义变量 c，赋值为 Config(debug=True)
c = Config(debug=True)
# c.port = 9000  → 报错！不可变
# c == Config(debug=True, port=8000) → True（可哈希、可比较）
\`\`\`

\`frozen=True\` 的好处：

1. **不可变**：修改字段抛错，防止意外篡改。
2. **可哈希**：能当字典 key、放集合里（普通模型不可哈希）。
3. **值相等比较**：两个实例字段全相同则 \`==\` 为 True。

适合配置、DTO、值对象等"创建后不该变"的数据。

## computed_field 计算属性

字段值由其他字段算出来时，用 \`@computed_field\`：

\`\`\`python
# 从 pydantic 导入 BaseModel, computed_field
from pydantic import BaseModel, computed_field

# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 price，类型: float
    price: float
    # 字段 quantity，类型: int
    quantity: int

    # 计算属性：总价
    # 装饰器：computed_field
    @computed_field
    # 装饰器：property
    @property
    # 定义函数 total，返回: float
    def total(self) -> float:
        # 返回 self.price * self.quantity
        return self.price * self.quantity

# 定义变量 p，赋值为 Product(price=10.5, quantity=3)
p = Product(price=10.5, quantity=3)
print(p.total)  # 31.5
# 序列化时也带上计算属性
print(p.model_dump())  # {'price': 10.5, 'quantity': 3, 'total': 31.5}
\`\`\`

\`@computed_field\` 配合 \`@property\`，让计算属性像普通字段一样出现在序列化结果和 Swagger 文档里。比手写方法 (\`def get_total(self)\`) 更优雅，前端拿到的 JSON 自动含计算字段。

## 综合实战：配置模型

把配置、别名、计算属性用起来：

\`\`\`python
# 从 pydantic 导入 BaseModel, Field, ConfigDict, computed_field
from pydantic import BaseModel, Field, ConfigDict, computed_field

# 定义 Pydantic 数据模型 ProductOut，继承 BaseModel
class ProductOut(BaseModel):
    # 定义变量 model_config，赋值为 ConfigDict(
    model_config = ConfigDict(
        from_attributes=True,        # 支持从 ORM 创建
        populate_by_name=True,        # 字段名和别名都行
        frozen=False,                 # 可变
        # 定义字典 json_schema_extra
        json_schema_extra={
            # "examples": [{"productId": 1, "name": "phone", "pr
            "examples": [{"productId": 1, "name": "phone", "price": 5999}]
        # }
        }
    # )
    )

    # 字段 id，类型: int，默认值: Field(..., alias="productId")
    id: int = Field(..., alias="productId")
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float
    discount: float = 0.0  # 折扣 0~1

    # 装饰器：computed_field
    @computed_field
    # 装饰器：property
    @property
    # 定义函数 final_price，返回: float
    def final_price(self) -> float:
        # 折后价
        # 返回 round(self.price * (1 - self.discount), 2)
        return round(self.price * (1 - self.discount), 2)

# 用别名创建
# 定义变量 p，赋值为 ProductOut(productId=1, name="phone", price=5...
p = ProductOut(productId=1, name="phone", price=5999, discount=0.1)
# 序列化用别名
# 调用 print()
print(p.model_dump(by_alias=True))
# {'productId': 1, 'name': 'phone', 'price': 5999.0, 'discount': 0.1, 'final_price': 5399.1}
\`\`\`

在 FastAPI 里作为响应模型：

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /products/{pid} 时触发
@app.get("/products/{pid}", response_model=ProductOut, response_model_by_alias=True)
# 定义函数 get_product，参数: pid: int
def get_product(pid: int):
    # 假设从数据库拿到 ORM 对象
    # 定义类 FakeORM
    class FakeORM:
        # 定义函数 __init__，参数: self
        def __init__(self):
            # self.id = pid
            self.id = pid
            # self.name = "phone"
            self.name = "phone"
            # self.price = 5999
            self.price = 5999
            # self.discount = 0.1
            self.discount = 0.1
    # from_attributes=True 让这里自动转换
    # 返回 FakeORM()
    return FakeORM()
\`\`\`

返回的 JSON 自动是 camelCase（\`productId\`），且含计算字段 \`final_price\`，文档里有示例。前端拿到格式统一、字段完整的数据。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| v1 Config 写法 | 新项目应统一 v2 | 用 model_config = ConfigDict(...) |
| alias 实例化报错 | 默认只能用别名 | 加 populate_by_name=True |
| 序列化不带别名 | model_dump 默认字段名 | 用 by_alias=True |
| ORM 对象传不进 | 默认只接 dict | 加 from_attributes=True |
| frozen 模型改字段 | 抛错 | 需要 frozen 时别改，或去掉配置 |
| computed_field 不出现 | 忘加 @property | computed_field 要配 @property |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| model_config | v2 配置方式（ConfigDict） |
| 常用配置 | str_strip/extra/frozen/populate_by_name |
| alias | JSON 名 ≠ Python 变量名 |
| populate_by_name | 允许字段名或别名实例化 |
| from_attributes | 从 ORM 对象创建 |
| json_schema_extra | 定制 schema 示例 |
| frozen | 不可变模型，可哈希 |
| computed_field | 计算属性，序列化带出 |
| response_model_by_alias | 响应用别名序列化 |

到这里，Pydantic 数据校验这块讲完了。你已经掌握 BaseModel、类型系统、自定义校验器、模型配置——这是写出健壮 API 的核心内功。后续章节会进入响应处理、依赖注入、数据库集成，把 Pydantic 和 FastAPI 的其他能力串起来。`
  }
];
