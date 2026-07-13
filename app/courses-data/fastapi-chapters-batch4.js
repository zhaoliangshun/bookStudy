// =============================================================
// FastAPI 应用开发实战教程 - 第 4 批章节（Pydantic 数据校验 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-pydantic    : Pydantic 基础
//   fa-types       : 字段类型与校验
//   fa-validators  : 自定义校验器
//   fa-model-config: 模型配置与高级特性
// ============================================================

export const chapters = [
  // ============================================================
  // 第 13 章：Pydantic 基础
  // ============================================================
  {
    id: "fa-pydantic",
    group: "Pydantic 数据校验",
    icon: "🛡️",
    title: "Pydantic 基础",
    content: `# Pydantic 基础

## Pydantic 是什么

**Pydantic** 是 Python 生态中最流行的数据校验与序列化库，它基于 Python 的类型注解（type hints）自动完成数据校验、类型转换、序列化与文档生成。FastAPI 之所以能在 Web 框架中脱颖而出，核心原因之一就是把 Pydantic 作为数据层的基石。

Pydantic 解决了一类非常普遍的问题：**当数据从外部进入程序时（HTTP 请求、配置文件、数据库读取、消息队列），如何保证它的结构和类型是正确的？** 传统做法是手写大量 \`if ... else ...\` 校验代码，既冗长又容易遗漏。Pydantic 的思路是：你只要用类型注解声明数据的形状，剩下的校验、转换、报错、文档生成全部由库自动完成。

一个最小的 Pydantic 模型示例：

\`\`\`python
# 从 pydantic 库导入 BaseModel 基类
from pydantic import BaseModel

# 定义一个用户模型，继承自 BaseModel
class User(BaseModel):
    # 字段 id，类型为整数 int
    id: int
    # 字段 name，类型为字符串 str
    name: str
    # 字段 age，类型为整数或 None，默认值为 None
    age: int | None = None

# 用字典实例化模型，Pydantic 会自动做类型校验和转换
user = User(id=1, name="alice", age="30")
# 即使 age 传了字符串 "30"，Pydantic 也会自动转成 int 30
print(user.age)        # 输出: 30，类型是 int
print(type(user.age))  # 输出: <class 'int'>
\`\`\`

可以看到，我们并没有写任何 \`if not isinstance(age, int)\` 这样的校验代码，Pydantic 就完成了类型转换。这就是它的核心价值：**声明式数据建模**。

## Pydantic v1 vs v2 的区别

Pydantic 在 2023 年发布了 v2 版本，这是一次重大重写。FastAPI 从 0.100 版本开始支持 Pydantic v2，目前新项目应该一律使用 v2。两者在 API 上有不少差异，理解这些差异对阅读老代码和迁移很重要。

### 核心性能差异

v2 的核心校验逻辑用 Rust 重写（pydantic-core），性能比 v1 快 5~50 倍。这意味着在处理大量数据（如批量导入、大体积 JSON）时，v2 能显著降低 CPU 开销。

### API 变更对照

| 功能 | v1 写法 | v2 写法 |
|------|---------|---------|
| 序列化为字典 | \`obj.dict()\` | \`obj.model_dump()\` |
| 序列化为 JSON 字符串 | \`obj.json()\` | \`obj.model_dump_json()\` |
| 从字典创建模型 | \`Model.parse_obj(d)\` | \`Model.model_validate(d)\` |
| 从 JSON 字符串创建 | \`Model.parse_raw(s)\` | \`Model.model_validate_json(s)\` |
| 字段校验器 | \`@validator\` | \`@field_validator\` |
| 模型校验器 | \`@root_validator\` | \`@model_validator\` |
| 配置类 | \`class Config: ...\` | \`model_config = ConfigDict(...)\` |
| ORM 模式 | \`class Config: orm_mode = True\` | \`model_config = ConfigDict(from_attributes=True)\` |
| 字段定义 | \`Field(...)\` | \`Field(...)\`（增强） |
| 允许额外字段 | \`class Config: extra = 'forbid'\` | \`model_config = ConfigDict(extra='forbid')\` |

下面通过代码对比两者的差异：

\`\`\`python
# === Pydantic v1 写法（已过时，仅作了解） ===
# from pydantic import BaseModel, validator
#
# class UserV1(BaseModel):
#     name: str
#     age: int
#
#     class Config:
#         orm_mode = True        # 允许从 ORM 对象创建
#         extra = 'forbid'       # 禁止多余字段
#
#     @validator('age')
#     def check_age(cls, v):
#         if v < 0:
#             raise ValueError('age must be positive')
#         return v
#
# u = UserV1(name='a', age=10)
# u.dict()              # 序列化为字典
# u.json()              # 序列化为 JSON 字符串
# UserV1.parse_obj({...})  # 从字典创建

# === Pydantic v2 写法（推荐） ===
# 从 pydantic 导入 BaseModel、field_validator、ConfigDict
from pydantic import BaseModel, field_validator, ConfigDict

# 定义用户模型 UserV2，继承 BaseModel
class UserV2(BaseModel):
    # 模型配置：允许从 ORM 对象读取属性；禁止额外字段
    model_config = ConfigDict(from_attributes=True, extra='forbid')
    # 字段 name，类型为 str
    name: str
    # 字段 age，类型为 int
    age: int

    # 字段校验器：校验 age 字段
    # @field_validator('age') 是 Pydantic v2 的字段校验器装饰器
    # 参数 'age' 指定校验哪个字段，可以传多个：@field_validator('a', 'b')
    # 它在 Pydantic 完成基础类型校验后执行自定义校验逻辑
    @field_validator('age')
    # @classmethod 把方法变成类方法
    # v2 要求字段校验器必须是类方法（v1 也建议加）
    # 第一个参数是 cls（类本身），不是 self（实例）
    # 因为校验发生在实例化过程中，此时实例还没创建
    @classmethod
    def check_age(cls, v: int) -> int:
        # cls 是模型类本身（这里是 UserV2）
        # v 是已经过基础类型校验的值（已经是 int 类型）
        # 如果年龄小于 0，抛出 ValueError
        # Pydantic 会把 ValueError 包装成 ValidationError
        if v < 0:
            raise ValueError('age must be positive')
        # 校验通过，返回值会被赋给字段
        # 必须返回值，不返回相当于赋 None
        return v

# 实例化模型
u = UserV2(name='a', age=10)
# 序列化为字典（v2 新 API）
print(u.model_dump())         # 输出: {'name': 'a', 'age': 10}
# 序列化为 JSON 字符串
print(u.model_dump_json())    # 输出: {"name":"a","age":10}
# 从字典创建模型
u2 = UserV2.model_validate({'name': 'b', 'age': 20})
print(u2)                     # 输出: name='b' age=20
\`\`\`

**学习建议**：如果是新项目，直接学 v2；如果维护老项目，可以借助 \`bump-pydantic\` 工具半自动迁移 v1 到 v2。FastAPI 现在同时支持 v1 和 v2，但混用会让代码变复杂，建议统一到 v2。

## BaseModel 基础

\`BaseModel\` 是 Pydantic 的核心类，所有数据模型都继承自它。一个 BaseModel 子类定义了字段、类型、默认值、校验逻辑，Pydantic 在实例化时自动校验输入数据。

### 字段定义规则

字段定义遵循 Python 类型注解语法：

\`\`\`python
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 定义商品模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 id，类型为 int，必填（无默认值）
    id: int
    # 字段 name，类型为 str，必填
    name: str
    # 字段 price，类型为 float，必填，并通过 Field 添加约束
    # gt=0 表示 price 必须 > 0
    price: float = Field(gt=0, description="商品价格，必须大于 0")
    # 字段 description，类型为 str，可选，默认空字符串
    description: str = ""
    # 字段 tags，类型为 list[str]，默认空列表
    tags: list[str] = []
    # 字段 in_stock，类型为 bool，默认 True
    in_stock: bool = True

# 实例化：传入符合结构的字典或关键字参数
p = Product(
    id=101,
    name="手机",
    price=1999.0,
    description="新款智能手机",
    tags=["电子", "通讯"],
)
# 访问字段就像普通属性
print(p.name)       # 输出: 手机
print(p.price)      # 输出: 1999.0
print(p.tags)       # 输出: ['电子', '通讯']
\`\`\`

**关键规则**：
1. **无默认值的字段是必填**，实例化时必须提供。
2. **有默认值的字段是可选**，可以省略。
3. **可变默认值要小心**：v2 中 Pydantic 会深拷贝默认值，所以 \`tags: list[str] = []\` 是安全的（不像普通 Python 类那样共享同一个列表）。
4. **Field(...) 用于添加约束**，比如 \`gt\`、\`ge\`、\`lt\`、\`le\`、\`min_length\`、\`max_length\` 等。

### 实例化失败的报错

当输入数据不符合模型定义时，Pydantic 抛出 \`ValidationError\`，错误信息非常详细：

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ValidationError
from pydantic import BaseModel, ValidationError

# 定义模型 Person
class Person(BaseModel):
    # 字段 name，类型 str
    name: str
    # 字段 age，类型 int，必须 >= 0
    age: int

# 故意传入非法数据：age 是负数
try:
    # 这会抛出 ValidationError
    p = Person(name="bob", age=-5)
except ValidationError as e:
    # 打印错误信息，包含错误类型、位置、消息
    print(e.errors())
    # 输出大致是：
    # [{
    #   'type': 'greater_than_equal',
    #   'loc': ('age',),
    #   'msg': 'Input should be greater than or equal to 0',
    #   'input': -5,
    #   'ctx': {'ge': 0}
    # }]
\`\`\`

在 FastAPI 中，请求体校验失败时，FastAPI 自动捕获 \`ValidationError\` 并返回 HTTP 422 响应，body 里就是类似的错误详情。

## 模型实例化和序列化

### 实例化的几种方式

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义模型 Article
class Article(BaseModel):
    # 字段 title，类型 str
    title: str
    # 字段 views，类型 int，默认 0
    views: int = 0

# 方式 1：关键字参数（最常用）
# 直接传字段名=值，最直观，适合手写少量字段
a1 = Article(title="hello", views=10)
# 方式 2：解包字典
# **data 是字典解包，等价于 Article(title="world", views=5)
# 适合从外部数据（如 request.json()）构造模型
data = {"title": "world", "views": 5}
a2 = Article(**data)
# 方式 3：model_validate（从字典创建，会触发完整校验）
# v2 推荐用法，等价于 v1 的 parse_obj
# 适合从 yaml.load、json.loads 等拿到字典后转模型
a3 = Article.model_validate({"title": "pydantic", "views": 100})
# 方式 4：model_validate_json（从 JSON 字符串创建）
# 直接从 JSON 字符串创建，跳过 json.loads 步骤
# 性能比 json.loads + model_validate 快 20%~30%
# 适合直接处理 HTTP 请求体等 JSON 字符串场景
a4 = Article.model_validate_json('{"title": "json", "views": 1}')

# 四种方式等价，都会触发校验
print(a1.title, a2.title, a3.title, a4.title)
# 输出: hello world pydantic json
\`\`\`

### 序列化的几种方式

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义模型 Article
class Article(BaseModel):
    # 字段 title，类型 str
    title: str
    # 字段 views，类型 int
    views: int

# 实例化
a = Article(title="hello", views=10)

# 方式 1：model_dump() —— 转为 Python 字典
# 返回的字典里 datetime、UUID 等保持原生 Python 类型
# 适合需要在 Python 中继续操作的场景（如传给模板引擎）
d = a.model_dump()
print(d)            # 输出: {'title': 'hello', 'views': 10}
print(type(d))      # 输出: <class 'dict'>

# 方式 2：model_dump_json() —— 转为 JSON 字符串
# datetime、UUID 等会被自动转成字符串（JSON 不支持这些类型）
# 适合作为 HTTP 响应体返回给前端
s = a.model_dump_json()
print(s)            # 输出: {"title":"hello","views":10}
print(type(s))      # 输出: <class 'str'>

# 方式 3：选择性序列化（include / exclude）
# include 只保留指定字段（白名单模式）
# 适合响应模型只暴露部分字段的场景
# 只包含 title 字段
print(a.model_dump(include={"title"}))   # 输出: {'title': 'hello'}
# exclude 排除指定字段（黑名单模式）
# 适合隐藏敏感字段（如 password、token）
# 排除 views 字段
print(a.model_dump(exclude={"views"}))   # 输出: {'title': 'hello'}

# 方式 4：排除默认值未设置的字段
a2 = Article(title="world")  # views 用默认值
# exclude_defaults=True 会排除使用默认值的字段
# 适合只返回用户显式设置的字段，减少响应体积
print(a2.model_dump(exclude_defaults=True))  # 输出: {'title': 'world'}
\`\`\`

**model_dump vs model_dump_json 的区别**：
- \`model_dump()\` 返回 Python 对象（dict、list、datetime 等），可以继续在 Python 中操作。
- \`model_dump_json()\` 返回 JSON 字符串，可以直接作为 HTTP 响应体。JSON 不支持 datetime、UUID 等类型，Pydantic 会自动把它们转成字符串。

## model_dump() 与 model_dump_json() 详解

这两个方法是 v2 的核心序列化 API，参数非常丰富。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 datetime 模块导入 datetime
from datetime import datetime

# 定义模型 Event
class Event(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 time，类型 datetime
    time: datetime
    # 字段 tags，类型 list[str]
    tags: list[str] = []

# 实例化
e = Event(
    id=1,
    name="click",
    time=datetime(2026, 7, 11, 12, 0, 0),
    tags=["ui", "btn"],
)

# 1. model_dump() 默认包含所有字段
print(e.model_dump())
# 输出: {'id': 1, 'name': 'click', 'time': datetime.datetime(2026, 7, 11, 12, 0), 'tags': ['ui', 'btn']}

# 2. model_dump_json() 把 datetime 自动转成 ISO 格式字符串
# JSON 标准不支持 datetime 对象，必须转成字符串
# ISO 8601 格式：YYYY-MM-DDTHH:MM:SS，是国际标准日期时间格式
print(e.model_dump_json())
# 输出: {"id":1,"name":"click","time":"2026-07-11T12:00:00","tags":["ui","btn"]}

# 3. exclude 参数：排除指定字段
# exclude={"tags"} 表示序列化时排除 tags 字段
# 适合响应模型需要隐藏某些字段的场景
print(e.model_dump(exclude={"tags"}))
# 输出: {'id': 1, 'name': 'click', 'time': datetime.datetime(2026, 7, 11, 12, 0)}

# 4. include 参数：只包含指定字段
# include={"id", "name"} 表示只序列化 id 和 name
# 和 exclude 互补，适合只暴露部分字段的场景
print(e.model_dump(include={"id", "name"}))
# 输出: {'id': 1, 'name': 'click'}

# 5. by_alias 参数：使用别名序列化（配合 alias 定义）
# 默认是 False，设为 True 时使用字段的 alias 作为键
# 例如字段 user_id 有 alias='userId'，by_alias=True 时输出 {'userId': ...}

# 6. exclude_unset=True：只包含实例化时显式传入的字段
# "显式传入"指创建实例时传了该字段，而不是用默认值
# e2 没传 tags，所以 exclude_unset=True 不包含 tags
# 这在 PATCH 更新场景很有用：只更新用户传了的字段
e2 = Event(id=2, name="view", time=datetime(2026, 7, 11, 13, 0))
print(e2.model_dump(exclude_unset=True))
# 输出: {'id': 2, 'name': 'view', 'time': datetime.datetime(2026, 7, 11, 13, 0)}（没有 tags）

# 7. exclude_defaults=True：排除使用默认值的字段
# 和 exclude_unset 的区别：
# - exclude_unset：排除"没传"的字段（即使该字段有非默认值）
# - exclude_defaults：排除"值等于默认值"的字段（传了但等于默认值也排除）
# e2 的 tags 没传，用默认值 []，被排除
print(e2.model_dump(exclude_defaults=True))
# 输出: {'id': 2, 'name': 'view', 'time': ...}（tags 用了默认值 []，被排除）

# 8. exclude_none=True：排除值为 None 的字段
# 适用于可选字段较多的场景
# 例如 {"name": "alice", "age": None} → {"name": "alice"}
\`\`\`

**实战技巧**：在 FastAPI 中，路由函数返回模型实例时，FastAPI 自动调用 \`model_dump()\`（通过 \`response_model\` 控制），所以你不需要手动序列化。但在写测试、日志、缓存时，这两个方法用得非常频繁。

## model_validate() 与 model_validate_json()

这两个方法是 v2 的反序列化 API（从外部数据创建模型）。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ValidationError
from pydantic import BaseModel, ValidationError

# 定义模型 Config
class Config(BaseModel):
    # 字段 host，类型 str
    host: str
    # 字段 port，类型 int
    port: int
    # 字段 debug，类型 bool，默认 False
    debug: bool = False

# === model_validate：从 Python 字典创建 ===
# 适合从 yaml.load、json.loads、数据库行等拿到字典后转模型
d = {"host": "localhost", "port": 8080, "debug": True}
c1 = Config.model_validate(d)
print(c1)  # 输出: host='localhost' port=8080 debug=True

# === model_validate_json：从 JSON 字符串直接创建 ===
# 比 json.loads + model_validate 更快，因为跳过中间的 dict 构造
# 性能提示：model_validate_json 内部直接用 Rust 解析 JSON 并校验
# 而 json.loads + model_validate 是两步：先解析成 dict，再校验 dict
# 前者省去了构造中间 dict 的开销，快 20%~30%
# 在处理大量 JSON 数据（如批量导入）时性能差异明显
json_str = '{"host": "127.0.0.1", "port": 3306}'
c2 = Config.model_validate_json(json_str)
print(c2)  # 输出: host='127.0.0.1' port=3306 debug=False

# === 校验失败时的错误处理 ===
try:
    # port 不是 int 也不是能转成 int 的字符串
    Config.model_validate({"host": "x", "port": "not-a-number"})
except ValidationError as e:
    # 错误信息会指明哪个字段、什么原因
    print(e.errors())
    # 输出包含: {'type': 'int_parsing', 'loc': ('port',), 'msg': 'Input should be a valid integer...'}
\`\`\`

**性能提示**：如果你手里已经是 JSON 字符串，用 \`model_validate_json\` 比 \`json.loads\` + \`model_validate\` 快 20%~30%，因为前者直接用 Rust 解析 + 校验，省去了构造中间 dict 的开销。

## 从 ORM 对象创建模型（from_attributes）

实际项目中，数据通常存在数据库里，用 SQLAlchemy 或类似 ORM 读取后是 ORM 对象（不是字典）。Pydantic 支持直接从 ORM 对象创建模型，只要开启 \`from_attributes=True\` 配置。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# === 模拟一个 SQLAlchemy ORM 模型 ===
# 真实项目中这是 class User(Base) 这种 ORM 类
class FakeORMUser:
    # 构造函数：初始化 ORM 对象的属性
    def __init__(self, id: int, name: str, email: str):
        # 设置属性 id
        self.id = id
        # 设置属性 name
        self.name = name
        # 设置属性 email
        self.email = email

# === 定义 Pydantic 模型，开启 from_attributes ===
# from_attributes=True 允许从任意对象创建模型，只要对象有对应属性
# 工作原理：Pydantic 用 getattr(obj, field_name) 逐个读取字段
# 而不是用 obj[field_name]（字典方式）
# 这就是为什么 ORM 对象（如 SQLAlchemy 模型实例）能直接传入
class UserOut(BaseModel):
    # 关键配置：允许从任意对象的属性创建模型
    model_config = ConfigDict(from_attributes=True)
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 email，类型 str
    email: str

# === 从 ORM 对象创建 Pydantic 模型 ===
# 模拟从数据库读取到的 ORM 对象
orm_user = FakeORMUser(id=1, name="alice", email="a@x.com")
# 用 model_validate 直接传入 ORM 对象
# Pydantic 会读取 orm_user.id / .name / .email 属性
user = UserOut.model_validate(orm_user)
print(user)        # 输出: id=1 name='alice' email='a@x.com'
print(user.model_dump())  # 输出: {'id': 1, 'name': 'alice', 'email': 'a@x.com'}
\`\`\`

**工作原理**：当 \`from_attributes=True\` 时，\`model_validate\` 收到一个非字典对象后，会用 \`getattr(obj, field_name)\` 逐个读取字段，而不是 \`obj[field_name]\`。这就是为什么 ORM 对象能直接传入。

在 FastAPI 中，这个特性常用于：从数据库查到 ORM 对象后，直接返回为响应模型，FastAPI 会自动转换。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# 创建 FastAPI 应用
app = FastAPI()

# 定义响应模型 UserOut
class UserOut(BaseModel):
    # 开启从属性创建
    model_config = ConfigDict(from_attributes=True)
    # 字段 id
    id: int
    # 字段 name
    name: str

# 模拟数据库查询函数
def get_user_from_db(user_id: int):
    # 返回一个 ORM-like 对象（带属性）
    class FakeORM:
        # 构造函数
        def __init__(self):
            # 设置 id 属性
            self.id = user_id
            # 设置 name 属性
            self.name = "alice"
    # 返回 ORM 对象
    return FakeORM()

# 定义路由：response_model 指定响应结构
@app.get("/users/{user_id}", response_model=UserOut)
def read_user(user_id: int):
    # 从数据库读取 ORM 对象
    db_user = get_user_from_db(user_id)
    # 直接返回 ORM 对象，FastAPI 用 UserOut.model_validate 转换
    return db_user
\`\`\`

## 模型的不可变性（frozen）

默认情况下，Pydantic 模型实例的字段是可修改的。但在某些场景（缓存键、配置对象、函数参数防篡改），我们希望模型一旦创建就不可变。v2 提供 \`frozen=True\` 配置实现这一点。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# === 默认可变 ===
# 定义可变模型 MutablePoint
class MutablePoint(BaseModel):
    # 字段 x，类型 float
    x: float
    # 字段 y，类型 float
    y: float

# 实例化
p = MutablePoint(x=1.0, y=2.0)
# 可以修改字段
p.x = 10.0
print(p.x)  # 输出: 10.0

# === 不可变模型（frozen=True） ===
# 定义不可变模型 FrozenPoint
class FrozenPoint(BaseModel):
    # 配置：冻结模型，禁止修改字段
    model_config = ConfigDict(frozen=True)
    # 字段 x，类型 float
    x: float
    # 字段 y，类型 float
    y: float

# 实例化
fp = FrozenPoint(x=1.0, y=2.0)
# 尝试修改会抛出 ValidationError
try:
    fp.x = 10.0  # 这会失败
except Exception as e:
    print(type(e).__name__)  # 输出: ValidationError

# === frozen 的额外好处：可哈希，能作为 dict 的键或集合元素 ===
# "可哈希"是指对象实现了 __hash__ 方法，能计算出一个固定哈希值
# Python 要求 dict 的键和 set 的元素必须可哈希
# 可变对象（如 list、dict、普通 BaseModel）不可哈希，因为内容变化后哈希值会变
# frozen=True 的模型不可变，内容固定，所以可以安全哈希
p1 = FrozenPoint(x=1.0, y=2.0)
p2 = FrozenPoint(x=1.0, y=2.0)
# 两个值相同的不可变模型被视为相等
# frozen=True 同时启用了 __eq__ 和 __hash__，基于字段值比较和计算哈希
print(p1 == p2)  # 输出: True
# 可以放进集合
# set 用哈希值去重，p1 和 p2 哈希值相同且相等，所以只保留一个
s = {p1, p2}
print(len(s))    # 输出: 1（因为相等）
# 可以作为字典键
# dict 用哈希值查找，p2 的哈希值和 p1 相同，所以 d[p2] 能找到 p1 的值
d = {p1: "value"}
print(d[p2])     # 输出: value
\`\`\`

**使用场景**：在函数式编程风格中，不可变数据更安全；在多线程环境下，不可变对象天然线程安全；在缓存场景，不可变对象作为缓存值不会意外被修改。

## 模型继承

Pydantic 支持模型继承，子类继承父类的所有字段，并可以添加新字段或覆盖父类字段。这在设计层次化数据模型时非常有用。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# === 基础模型：包含所有模型共有的字段 ===
# 定义基类 BaseUser
class BaseUser(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 email，类型 str
    email: str

# === 子类 1：创建用户的请求模型 ===
# 继承 BaseUser，添加 password 字段
class UserCreate(BaseUser):
    # 新增字段 password，类型 str
    password: str

# === 子类 2：返回给前端的响应模型 ===
# 继承 BaseUser，不添加敏感字段
class UserOut(BaseUser):
    # 新增字段 is_active，类型 bool，默认 True
    is_active: bool = True

# === 子类 3：数据库存储模型 ===
# 继承 BaseUser，添加 created_at
class UserDB(BaseUser):
    # 新增字段 created_at，类型 str（简化演示）
    created_at: str = ""

# 实例化 UserCreate（继承父类的 id/name/email，加自己的 password）
uc = UserCreate(id=1, name="alice", email="a@x.com", password="secret")
print(uc.model_dump())
# 输出: {'id': 1, 'name': 'alice', 'email': 'a@x.com', 'password': 'secret'}

# 实例化 UserOut
uo = UserOut(id=1, name="alice", email="a@x.com")
print(uo.model_dump())
# 输出: {'id': 1, 'name': 'alice', 'email': 'a@x.com', 'is_active': True}

# 检查继承关系
print(isinstance(uc, BaseUser))  # 输出: True（子类实例也是父类实例）
\`\`\`

**设计模式**：在实际项目中，常见做法是定义一个 \`BaseUser\` 包含公共字段，然后派生出 \`UserCreate\`（请求）、\`UserUpdate\`（部分更新）、\`UserOut\`（响应）、\`UserInDB\`（数据库）等多个模型，避免重复定义。这就是 DRY（Don't Repeat Yourself）原则在数据建模中的体现。

## 实战：用户数据模型设计

综合运用本章知识，设计一套完整的用户数据模型，覆盖请求、响应、数据库三个场景。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ConfigDict
from pydantic import BaseModel, Field, ConfigDict
# 从 datetime 模块导入 datetime
from datetime import datetime
# 从 typing 模块导入 Optional
from typing import Optional

# === 1. 基础用户模型（公共字段） ===
# 所有用户相关模型的父类
class UserBase(BaseModel):
    # 字段 username，类型 str，长度 3~20
    username: str = Field(min_length=3, max_length=20, description="用户名，3-20 字符")
    # 字段 email，类型 str
    email: str = Field(description="邮箱地址")

# === 2. 创建用户请求模型 ===
# 继承 UserBase，添加密码字段
class UserCreate(UserBase):
    # 字段 password，类型 str，最少 8 位
    password: str = Field(min_length=8, description="密码，至少 8 位")
    # 字段 age，类型 Optional[int]，可选
    age: Optional[int] = Field(default=None, ge=0, le=150, description="年龄，0-150")

# === 3. 更新用户请求模型（所有字段可选） ===
# 继承 UserBase，但所有字段改为可选
class UserUpdate(BaseModel):
    # 字段 username，可选
    username: Optional[str] = Field(default=None, min_length=3, max_length=20)
    # 字段 email，可选
    email: Optional[str] = None
    # 字段 age，可选
    age: Optional[int] = Field(default=None, ge=0, le=150)

# === 4. 用户响应模型（不含密码） ===
# 继承 UserBase，添加系统字段，开启 from_attributes
class UserOut(UserBase):
    # 配置：允许从 ORM 对象创建
    model_config = ConfigDict(from_attributes=True)
    # 字段 id，类型 int
    id: int
    # 字段 is_active，类型 bool，默认 True
    is_active: bool = True
    # 字段 created_at，类型 datetime
    created_at: datetime

# === 5. 数据库存储模型（含密码哈希） ===
class UserInDB(UserBase):
    # 字段 id，类型 int
    id: int
    # 字段 hashed_password，类型 str（存储哈希后的密码）
    hashed_password: str
    # 字段 is_active，类型 bool
    is_active: bool = True
    # 字段 created_at，类型 datetime
    created_at: datetime

# === 使用示例 ===
# 模拟创建用户
create_data = {
    "username": "alice",
    "email": "alice@example.com",
    "password": "supersecret",
    "age": 25,
}
# 用 UserCreate 校验请求
user_in = UserCreate(**create_data)
print("创建请求:", user_in.model_dump())

# 模拟存入数据库（实际项目用 SQLAlchemy）
user_in_db = UserInDB(
    id=1,
    username=user_in.username,
    email=user_in.email,
    hashed_password="hashed_" + user_in.password,  # 简化演示
    is_active=True,
    created_at=datetime.now(),
)
print("数据库模型:", user_in_db.model_dump())

# 返回给前端时用 UserOut（不含密码）
# 因为 UserOut 开启了 from_attributes，可以直接从 user_in_db 转换
user_out = UserOut.model_validate(user_in_db)
print("响应模型:", user_out.model_dump_json())
# 输出里没有 password 和 hashed_password，安全
\`\`\`

## 小结

本章介绍了 Pydantic 的核心概念：

1. **Pydantic 是基于类型注解的数据校验库**，FastAPI 用它处理请求体和响应。
2. **v2 相比 v1 性能提升 5~50 倍**，API 命名更统一（都加 \`model_\` 前缀）。
3. **BaseModel 是所有模型的基类**，字段用类型注解声明，有默认值则可选。
4. **model_dump() 转字典，model_dump_json() 转 JSON 字符串**，支持 include/exclude 等精细控制。
5. **model_validate() 从字典创建，model_validate_json() 从 JSON 字符串创建**，后者更快。
6. **from_attributes=True 允许从 ORM 对象创建模型**，配合 FastAPI 的 response_model 无缝衔接数据库。
7. **frozen=True 让模型不可变**，可哈希、线程安全。
8. **模型继承** 实现 DRY，把公共字段抽到基类。
9. **实战模式**：为同一实体定义 Create/Update/Out/InDB 多个模型，区分请求、响应、存储场景。

下一章我们会深入 Pydantic 的字段类型系统，学习日期时间、UUID、Decimal、集合类型、Optional、Literal、EmailStr 等丰富类型，以及类型转换的规则。
`
  },

  // ============================================================
  // 第 14 章：字段类型与校验
  // ============================================================
  {
    id: "fa-types",
    group: "Pydantic 数据校验",
    icon: "🔢",
    title: "字段类型与校验",
    content: `# 字段类型与校验

## 基本类型

Pydantic 支持所有 Python 内置基本类型，并在数据传入时做类型校验和转换。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义基础类型演示模型 BasicTypes
class BasicTypes(BaseModel):
    # 字段 name，类型 str（字符串）
    name: str
    # 字段 age，类型 int（整数）
    age: int
    # 字段 height，类型 float（浮点数）
    height: float
    # 字段 is_active，类型 bool（布尔）
    is_active: bool
    # 字段 data，类型 bytes（字节串）
    data: bytes

# 实例化：传符合类型的值
b = BasicTypes(
    name="alice",
    age=25,
    height=1.65,
    is_active=True,
    data=b"hello",
)
print(b.model_dump())
# 输出: {'name': 'alice', 'age': 25, 'height': 1.65, 'is_active': True, 'data': b'hello'}

# === 类型转换演示 ===
# Pydantic 会尝试把传入的值转换成声明类型
b2 = BasicTypes(
    name="bob",        # str 正常
    age="30",          # 字符串 "30" 会被转成 int 30
    height="1.80",     # 字符串 "1.80" 会被转成 float 1.80
    is_active="yes",   # 字符串 "yes" 会被转成 bool（注意规则）
    data="hello",      # 字符串 "hello" 会被编码成 bytes
)
print(b2.age)          # 输出: 30（int）
print(b2.height)       # 输出: 1.8（float）
print(b2.is_active)    # 输出: True
print(b2.data)         # 输出: b'hello'
\`\`\`

**bool 类型的转换规则**（容易踩坑）：
- \`True\`、\`"True"\`、\`"true"\`、\`"1"\`、\`1\`、\`"yes"\`、\`"on"\` → \`True\`
- \`False\`、\`"False"\`、\`"false"\`、\`"0"\`、\`0\`、\`"no"\`、\`"off"\` → \`False\`
- 其他字符串会报错

**bytes 类型的转换规则**：字符串会被 UTF-8 编码成 bytes，数值类型不能转 bytes。

## 日期时间类型

日期时间在 API 开发中非常常见（创建时间、过期时间、生日等）。Pydantic 支持 \`datetime\`、\`date\`、\`time\`、\`timedelta\` 四种类型。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 datetime 模块导入 datetime、date、time、timedelta
from datetime import datetime, date, time, timedelta

# 定义日期时间模型 DateTimeDemo
class DateTimeDemo(BaseModel):
    # 字段 created_at，类型 datetime（完整日期+时间）
    created_at: datetime
    # 字段 birthday，类型 date（仅日期）
    birthday: date
    # 字段 alarm，类型 time（仅时间）
    alarm: time
    # 字段 duration，类型 timedelta（时间间隔）
    duration: timedelta

# 实例化：用 Python 原生对象
d = DateTimeDemo(
    created_at=datetime(2026, 7, 11, 12, 0, 0),
    birthday=date(1995, 5, 20),
    alarm=time(8, 30, 0),
    duration=timedelta(hours=2),
)
print(d.model_dump())
# 输出: {'created_at': datetime.datetime(2026, 7, 11, 12, 0), 'birthday': datetime.date(1995, 5, 20),
#        'alarm': datetime.time(8, 30), 'duration': datetime.timedelta(seconds=7200)}

# === 从字符串创建（自动解析） ===
# Pydantic 能解析 ISO 8601 格式的字符串
d2 = DateTimeDemo(
    created_at="2026-07-11T12:00:00",  # ISO 格式 datetime 字符串
    birthday="1995-05-20",              # ISO 格式 date 字符串
    alarm="08:30:00",                   # ISO 格式 time 字符串
    duration="PT2H",                    # ISO 8601 duration 格式（2 小时）
)
print(d2.created_at)  # 输出: 2026-07-11 12:00:00（datetime 对象）
print(d2.duration)    # 输出: 2:00:00（timedelta 对象）

# === 序列化为 JSON 时的格式 ===
print(d2.model_dump_json())
# 输出: {"created_at":"2026-07-11T12:00:00","birthday":"1995-05-20","alarm":"08:30:00","duration":"PT2H"}
# datetime/date/time/timedelta 都被转成 ISO 格式字符串
\`\`\`

**实战提示**：在 API 中接收日期字符串时，推荐用 ISO 8601 格式（\`YYYY-MM-DDTHH:MM:SS\`），这是国际标准，前端 JavaScript 的 \`Date.toISOString()\` 也是这个格式，前后端对接最顺畅。

## UUID 类型

UUID（通用唯一标识符）常用于主键、令牌、会话 ID。Pydantic 直接支持 Python 的 \`uuid.UUID\` 类型。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 uuid 模块导入 UUID
# UUID 是通用唯一标识符类，uuid4 是生成随机 UUID 的函数
# UUID 有 5 个版本：
# - uuid1：基于 MAC 地址和时间戳（可能泄露物理位置）
# - uuid3：基于名字和 MD5 哈希
# - uuid4：完全随机（最常用，无泄露风险）
# - uuid5：基于名字和 SHA-1 哈希
from uuid import UUID, uuid4

# 定义模型 Resource
class Resource(BaseModel):
    # 字段 id，类型 UUID
    # UUID 是 128 位标识符，通常表示为 36 字符字符串
    # 格式：8-4-4-4-12 十六进制，如 "550e8400-e29b-41d4-a716-446655440000"
    id: UUID
    # 字段 name，类型 str
    name: str

# 实例化方式 1：用 UUID 对象
# uuid4() 生成一个随机 UUID 对象
r1 = Resource(id=uuid4(), name="res1")
print(r1.id)         # 输出: 类似 550e8400-e29b-41d4-a716-446655440000
print(type(r1.id))   # 输出: <class 'uuid.UUID'>

# 实例化方式 2：用 UUID 字符串
r2 = Resource(id="550e8400-e29b-41d4-a716-446655440000", name="res2")
print(r2.id)         # 输出: 550e8400-e29b-41d4-a716-446655440000
print(type(r2.id))   # 输出: <class 'uuid.UUID'>（自动转成 UUID 对象）

# 序列化为 JSON 时，UUID 被转成字符串
print(r2.model_dump_json())
# 输出: {"id":"550e8400-e29b-41d4-a716-446655440000","name":"res2"}

# 非法 UUID 字符串会报错
try:
    Resource(id="not-a-uuid", name="res3")
except Exception as e:
    print("校验失败:", e.__class__.__name__)  # 输出: 校验失败: ValidationError
\`\`\`

**使用场景**：在分布式系统中，UUID 作为主键避免自增 ID 的冲突问题；JWT、API Key 等令牌常用 UUID 生成。

## Decimal 类型

\`decimal.Decimal\` 用于需要高精度十进制计算的场景，比如金融金额。Python 的 \`float\` 有精度问题（\`0.1 + 0.2 != 0.3\`），处理钱相关数据时必须用 \`Decimal\`。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 decimal 模块导入 Decimal
from decimal import Decimal

# 定义金额模型 Money
class Money(BaseModel):
    # 字段 amount，类型 Decimal（金额）
    amount: Decimal
    # 字段 currency，类型 str（货币代码）
    currency: str = "CNY"

# 实例化方式 1：用 Decimal 对象
# Decimal("99.99") 从字符串构造 Decimal，精度完整
# 适合代码里直接定义常量金额
m1 = Money(amount=Decimal("99.99"))
print(m1.amount)        # 输出: 99.99
print(type(m1.amount))  # 输出: <class 'decimal.Decimal'>

# 实例化方式 2：用字符串（推荐，避免 float 精度问题）
# Pydantic 会把字符串自动转成 Decimal
# 推荐原因：JSON 里的数字如果用 float 传输会有精度丢失
# 用字符串传输 "123.45" 能完整保留精度
# 这也是为什么 API 文档常建议金额用字符串传
m2 = Money(amount="123.45")
print(m2.amount)        # 输出: 123.45

# 实例化方式 3：用 int
# int 没有精度问题，Pydantic 直接转成 Decimal
# 适合金额是整数的情况（如分）
m3 = Money(amount=100)
print(m3.amount)        # 输出: 100

# 实例化方式 4：用 float（不推荐，会有精度问题）
# float 在二进制里无法精确表示 0.1
# 就像十进制无法精确表示 1/3 一样
# 所以 0.1 会变成一长串小数，金融计算不能接受
# 如果从外部接收到 float，应先转成字符串再传给 Decimal
m4 = Money(amount=0.1)
print(m4.amount)        # 输出: 0.1000000000000000055511151231257827021181583404541015625

# === Decimal 的精度优势 ===
# float 计算 0.1 + 0.2 不等于 0.3
# 原因：float 用二进制浮点数表示，0.1 在二进制里是无限循环小数
# 存储时被截断，导致微小误差，金融计算不能接受
print(0.1 + 0.2)              # 输出: 0.30000000000000004
# Decimal 计算 0.1 + 0.2 等于 0.3
# Decimal 用十进制存储，精确表示 0.1 这种十进制小数
# 适合金融场景，不会累积误差
print(Decimal("0.1") + Decimal("0.2"))  # 输出: 0.3

# 序列化为 JSON：Decimal 被转成字符串（避免精度丢失）
# JSON 标准没有 Decimal 类型，如果转成 float 会丢失精度
# 所以 Pydantic 默认把 Decimal 序列化成字符串
print(m2.model_dump_json())  # 输出: {"amount":"123.45","currency":"CNY"}
\`\`\`

**金融场景最佳实践**：
1. 模型字段用 \`Decimal\` 类型。
2. 从外部接收时用字符串传值（\`"123.45"\`），不要用 \`float\`。
3. 数据库用 \`NUMERIC\`/\`DECIMAL\` 类型存储，不用 \`FLOAT\`。

## 集合类型

Pydantic 完整支持 Python 的集合类型：\`list\`、\`dict\`、\`set\`、\`tuple\`。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义集合类型模型 Collections
class Collections(BaseModel):
    # 字段 tags，类型 list[str]（字符串列表）
    # list[str] 是 Python 3.9+ 的泛型写法，等价于 List[str]
    tags: list[str]
    # 字段 scores，类型 list[int]（整数列表）
    scores: list[int]
    # 字段 metadata，类型 dict[str, str]（字符串到字符串的字典）
    # dict[键类型, 值类型]，Pydantic 会递归校验键和值
    metadata: dict[str, str]
    # 字段 unique_tags，类型 set[str]（字符串集合，自动去重）
    # set 是无序集合，重复元素会被自动去重
    # 传入 ["a", "a", "b"] 会变成 {"a", "b"}
    unique_tags: set[str]
    # 字段 point，类型 tuple[int, int]（固定长度元组）
    # tuple[int, int] 表示正好 2 个元素，都是 int
    # 传 3 个或 1 个会报错
    point: tuple[int, int]
    # 字段 coords，类型 tuple[float, ...]（变长元组，全 float）
    # tuple[float, ...] 中的 ... 表示任意长度
    # 所有元素必须是 float，但数量不限
    coords: tuple[float, ...]

# 实例化
c = Collections(
    tags=["a", "b", "c"],
    scores=[90, 85, 95],
    metadata={"key": "value", "env": "prod"},
    unique_tags=["a", "a", "b"],  # 重复的会被去重
    point=(10, 20),                # 必须正好 2 个元素
    coords=(1.0, 2.0, 3.0),        # 变长元组，任意数量 float
)
print(c.model_dump())
# 输出: {'tags': ['a', 'b', 'c'], 'scores': [90, 85, 95],
#        'metadata': {'key': 'value', 'env': 'prod'},
#        'unique_tags': {'a', 'b'}, 'point': (10, 20), 'coords': (1.0, 2.0, 3.0)}

# === tuple 长度校验 ===
# point: tuple[int, int] 要求正好 2 个 int
# 传 3 个会报错
try:
    Collections(
        tags=[], scores=[], metadata={}, unique_tags=[],
        point=(1, 2, 3),  # 错误：长度不对
        coords=(1.0,),
    )
except Exception as e:
    print("校验失败")  # 输出: 校验失败

# === set 自动去重 ===
c2 = Collections(
    tags=["a"],
    scores=[1],
    metadata={},
    unique_tags=["x", "x", "y", "y", "z"],  # 5 个元素，去重后 3 个
    point=(0, 0),
    coords=(0.0,),
)
print(c2.unique_tags)  # 输出: {'x', 'y', 'z'}
\`\`\`

**嵌套模型**：集合类型里也可以放 Pydantic 模型，实现复杂嵌套结构。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义内部模型 OrderItem（订单项）
class OrderItem(BaseModel):
    # 字段 product_id，类型 int
    product_id: int
    # 字段 quantity，类型 int
    quantity: int
    # 字段 price，类型 float
    price: float

# 定义外部模型 Order（订单）
class Order(BaseModel):
    # 字段 order_id，类型 int
    order_id: int
    # 字段 items，类型 list[OrderItem]（嵌套模型列表）
    items: list[OrderItem]

# 实例化：items 是字典列表，Pydantic 递归校验
order = Order(
    order_id=1001,
    items=[
        {"product_id": 1, "quantity": 2, "price": 9.9},
        {"product_id": 2, "quantity": 1, "price": 19.9},
    ],
)
# items 里的每个字典都被转成 OrderItem 实例
print(order.items[0].product_id)  # 输出: 1
print(type(order.items[0]))       # 输出: <class 'OrderItem'>
print(order.model_dump_json())
# 输出: {"order_id":1001,"items":[{"product_id":1,"quantity":2,"price":9.9},{"product_id":2,"quantity":1,"price":19.9}]}
\`\`\`

## Optional 和 Union 类型

\`Optional[T]\` 表示字段可以是 \`T\` 或 \`None\`，等价于 \`T | None\`。\`Union[A, B]\` 表示字段可以是 A 或 B 类型，等价于 \`A | B\`。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Optional、Union
from typing import Optional, Union

# 定义模型 Flexible
class Flexible(BaseModel):
    # 字段 name，类型 str（必填，不能是 None）
    name: str
    # 字段 age，类型 Optional[int]（可以省略，可以是 None，可以是 int）
    age: Optional[int] = None
    # 字段 score，类型 Union[int, str]（可以是 int 也可以是 str）
    score: Union[int, str]
    # 字段 alias，类型 int | str | None（Python 3.10+ 语法）
    alias: int | str | None = None

# 实例化
f1 = Flexible(name="alice", score=100)  # age 和 alias 用默认 None
print(f1.age)     # 输出: None
print(f1.score)   # 输出: 100（int）
print(f1.alias)   # 输出: None

# score 可以是 int 或 str
f2 = Flexible(name="bob", score="A+")  # score 是 str
print(f2.score)   # 输出: A+（str）

# age 可以显式传 None
f3 = Flexible(name="carol", age=None, score=80)
print(f3.age)     # 输出: None

# === Optional vs 默认值 None 的区别 ===
# Optional[int] = None  → 可选字段，默认 None，可以传 None 或 int 或不传
# Optional[int]         → 可选字段但无默认值？不！Optional 不等于可省略
# 实际上 Optional[int] 没有 = None 时仍然是必填，只是允许传 None
class Demo(BaseModel):
    # 字段 a，Optional[int] = None，可省略
    a: Optional[int] = None
    # 字段 b，Optional[int]（无默认值），必须传，但可以传 None
    b: Optional[int]

# Demo(a=1, b=None)  ✓
# Demo(b=None)       ✓（a 用默认值）
# Demo(a=1)          ✗（b 是必填）
try:
    Demo(a=1)  # 缺少 b
except Exception:
    print("b 是必填字段")  # 输出: b 是必填字段
\`\`\`

**Union 的匹配顺序**：Pydantic 会按声明顺序尝试匹配类型。比如 \`Union[int, str]\` 会先尝试转 int，转不了才用 str。这意味着 \`Union[int, str]\` 接收 \`"123"\` 会得到 \`int(123)\`，如果想保留字符串，应该声明为 \`Union[str, int]\`。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Union
from typing import Union

# 定义模型 A
class A(BaseModel):
    # 字段 x，类型 Union[int, str]（先试 int）
    # Union[int, str] 表示 x 可以是 int 或 str
    # Pydantic 按声明顺序尝试匹配：先试 int，转不了才用 str
    # 注意：这意味着 "123" 会被转成 int 123，而不是保留字符串
    x: Union[int, str]

# 定义模型 B
class B(BaseModel):
    # 字段 x，类型 Union[str, int]（先试 str）
    # Union[str, int] 先试 str，"123" 能转成 str 所以保留为字符串
    # 声明顺序很重要：想保留字符串就写 Union[str, int]
    x: Union[str, int]

# 输入 "123"
a = A(x="123")
print(a.x, type(a.x))  # 输出: 123 <class 'int'>（先匹配 int，转成 123）
b = B(x="123")
print(b.x, type(b.x))  # 输出: 123 <class 'str'>（先匹配 str，保留字符串）
\`\`\`

## Literal 枚举类型

\`Literal\` 用于限定字段只能取几个固定值之一，相当于枚举的轻量版。常用于状态、类型、级别等有限选项。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Literal
from typing import Literal

# 定义模型 Task
class Task(BaseModel):
    # 字段 status，类型 Literal，只能是这 4 个字符串之一
    status: Literal["pending", "running", "done", "failed"]
    # 字段 priority，类型 Literal，只能是 1/2/3 之一
    priority: Literal[1, 2, 3] = 2
    # 字段 env，类型 Literal，只能是指定的几个字符串
    env: Literal["dev", "test", "prod"] = "dev"

# 合法值
t1 = Task(status="running")
print(t1.status)    # 输出: running
print(t1.priority)  # 输出: 2（默认值）

# 非法值
try:
    Task(status="sleeping")  # status 不在允许列表里
except Exception as e:
    print("status 非法")  # 输出: status 非法

try:
    Task(status="done", priority=5)  # priority 不是 1/2/3
except Exception:
    print("priority 非法")  # 输出: priority 非法

# === Literal vs Enum ===
# Literal 更轻量，适合简单场景
# Enum 更强大，支持方法、循环、成员访问
from enum import Enum

# 定义枚举 Color
class Color(str, Enum):
    # 成员 RED
    RED = "red"
    # 成员 GREEN
    GREEN = "green"
    # 成员 BLUE
    BLUE = "blue"

# 定义模型 Pixel
class Pixel(BaseModel):
    # 字段 color，类型 Color（枚举）
    color: Color

# 实例化
p = Pixel(color="red")
print(p.color)        # 输出: Color.RED
print(p.color.value)  # 输出: red
\`\`\`

## EmailStr、HttpUrl 等特殊类型

Pydantic 提供了一系列特殊类型，开箱即用解决常见校验需求。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 pydantic 导入 EmailStr、HttpUrl、AnyUrl、FilePath、DirectoryPath
from pydantic import EmailStr, HttpUrl, AnyUrl, FilePath, DirectoryPath

# === EmailStr：自动校验邮箱格式 ===
# 需要安装: pip install email-validator
class Contact(BaseModel):
    # 字段 email，类型 EmailStr（自动校验邮箱格式）
    email: EmailStr
    # 字段 website，类型 HttpUrl（必须是 http/https URL）
    website: HttpUrl

# 合法邮箱
c = Contact(email="alice@example.com", website="https://example.com")
print(c.email)     # 输出: alice@example.com
print(c.website)   # 输出: https://example.com/
# website 是 UrlType 对象，不是普通字符串
print(type(c.website))  # 输出: <class 'pydantic.networks.HttpUrl'>

# 非法邮箱
try:
    Contact(email="not-an-email", website="https://x.com")
except Exception:
    print("邮箱格式错误")  # 输出: 邮箱格式错误

# 非法 URL（必须是 http/https）
try:
    Contact(email="a@b.com", website="ftp://x.com")  # ftp 不是 http
except Exception:
    print("URL 协议错误")  # 输出: URL 协议错误

# === AnyUrl：任意协议的 URL ===
class Link(BaseModel):
    # 字段 url，类型 AnyUrl
    url: AnyUrl

# AnyUrl 支持各种协议
l = Link(url="ftp://files.example.com")
print(l.url)  # 输出: ftp://files.example.com/

# === FilePath / DirectoryPath：校验文件/目录存在 ===
# FilePath 校验路径必须是已存在的文件
# DirectoryPath 校验路径必须是已存在的目录
# 这两个类型会在校验时检查文件系统
class FileConfig(BaseModel):
    # 字段 path，类型 FilePath（必须是真实存在的文件）
    path: FilePath

# 假设存在 /tmp/test.txt 文件
# f = FileConfig(path="/tmp/test.txt")  # 校验通过
# f = FileConfig(path="/nonexistent.txt")  # 校验失败，文件不存在
\`\`\`

**HttpUrl 的额外功能**：解析后的 URL 对象有 \`scheme\`、\`host\`、\`path\`、\`query\` 等属性，方便提取 URL 的各个部分。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 HttpUrl
from pydantic import BaseModel, HttpUrl

# 定义模型 Bookmark
class Bookmark(BaseModel):
    # 字段 url，类型 HttpUrl
    url: HttpUrl

# 实例化
b = Bookmark(url="https://api.example.com/v1/users?page=1&size=10")
# 访问 URL 的各个部分
print(b.url.scheme)  # 输出: https
print(b.url.host)    # 输出: api.example.com
print(b.url.path)    # 输出: /v1/users
print(b.url.query)   # 输出: page=1&size=10
\`\`\`

## 自定义类型

当内置类型不够用时，可以用以下方式创建自定义类型：

1. 继承 \`str\`/\`int\` 等基础类型加约束
2. 用 \`Annotated\` + \`AfterValidator\` 包装
3. 实现 \`__get_pydantic_core_schema__\`（高级，本章略）

\`\`\`python
# 从 pydantic 导入 BaseModel、AfterValidator
from pydantic import BaseModel, AfterValidator
# 从 typing 导入 Annotated
from typing import Annotated

# === 方式 1：用 Annotated + AfterValidator 创建自定义类型 ===
# Annotated 是 Python 3.9+ 的类型注解工具，给类型附加额外元数据
# 语法：Annotated[基础类型, 元数据1, 元数据2, ...]
# 这里 Annotated[str, AfterValidator(to_lower)] 表示：
# - 基础类型是 str
# - 附加一个 AfterValidator 校验器
# AfterValidator 在 Pydantic 完成基础校验后执行自定义函数
# "After" 指在类型转换之后执行，此时 v 已经是 str 类型
def to_lower(v: str) -> str:
    # 转成小写后返回
    return v.lower()

# 定义自定义类型 LowerStr（str 基础 + 转小写校验）
# 这样 LowerStr 就像一个新类型，可以在多个模型里复用
# 比每个字段都写 @field_validator 更简洁
LowerStr = Annotated[str, AfterValidator(to_lower)]

# 定义模型 User
class User(BaseModel):
    # 字段 name，类型 LowerStr（自动转小写）
    name: LowerStr

# 实例化：传大写也会被转成小写
u = User(name="ALICE")
print(u.name)  # 输出: alice

# === 方式 2：多个校验器组合 ===
# 定义校验函数：去掉首尾空格
def strip_space(v: str) -> str:
    # 去掉首尾空格
    return v.strip()

# 定义校验函数：长度必须 >= 2
def min_two(v: str) -> str:
    # 检查长度
    if len(v) < 2:
        raise ValueError("长度至少 2")
    # 返回校验后的值
    return v

# 组合多个校验器（按顺序执行）
CleanStr = Annotated[str, AfterValidator(strip_space), AfterValidator(min_two)]

# 定义模型 Product
class Product(BaseModel):
    # 字段 code，类型 CleanStr
    code: CleanStr

# 实例化
p = Product(code="  ABC  ")
print(p.code)        # 输出: ABC（去空格后长度 3，校验通过）
print(repr(p.code))  # 输出: 'ABC'
\`\`\`

**Annotated 的优势**：自定义类型可以复用，一处定义多处使用，比 \`@field_validator\` 更适合通用校验逻辑（比如手机号、身份证号、统一社会信用代码等）。

## 类型转换规则详解

Pydantic 默认是"宽松模式"（不是严格模式），会尽力把输入值转换成声明类型。理解转换规则能帮你避免意外行为。

### 转换规则总览

| 声明类型 | 接受的输入 | 转换行为 |
|---------|-----------|---------|
| \`int\` | int、float（截断小数）、数字字符串 | 转成 int |
| \`float\` | int、float、数字字符串 | 转成 float |
| \`str\` | str、int、float、bool 等 | 调用 \`str()\` |
| \`bool\` | bool、特定字符串（"true"/"false"等）、0/1 | 按规则转 bool |
| \`list[T]\` | list、tuple、set | 转成 list，递归校验元素 |
| \`dict[K, V]\` | dict | 递归校验键值 |
| \`datetime\` | datetime、ISO 字符串、时间戳 | 解析成 datetime |

### strict 模式

如果想禁止类型转换，要求严格匹配，可以用 \`Strict\` 系列类型或 \`strict=True\`。

\`\`\`python
# 从 pydantic 导入 BaseModel、StrictInt、StrictStr
from pydantic import BaseModel, StrictInt, StrictStr
# 从 typing 导入 Annotated
from typing import Annotated
# 从 pydantic 导入 Field
from pydantic import Field

# === 默认宽松模式 ===
class Loose(BaseModel):
    # 字段 x，类型 int（宽松）
    x: int

# 宽松模式下，字符串 "123" 会被转成 int 123
l = Loose(x="123")
print(l.x, type(l.x))  # 输出: 123 <class 'int'>

# === StrictInt 严格模式 ===
# StrictInt 是 Pydantic 提供的严格整数类型
# 普通 int 会自动把 "123" 转成 123，StrictInt 不接受字符串
# 类似的还有 StrictStr、StrictFloat、StrictBool
class Strict(BaseModel):
    # 字段 x，类型 StrictInt（严格，必须是 int，不接受字符串）
    # 严格模式下，只有真正的 int 类型才能通过校验
    # 避免 "123" 被自动转换成 123 这种意外行为
    x: StrictInt

# 严格模式下，字符串会报错
try:
    Strict(x="123")  # 字符串不行
except Exception:
    print("严格模式：字符串不能转 int")  # 输出

# 严格模式下，必须是真正的 int
s = Strict(x=123)
print(s.x)  # 输出: 123

# === 用 Field(strict=True) 也能开启严格模式 ===
class Strict2(BaseModel):
    # 字段 y，类型 int，开启严格模式
    y: int = Field(strict=True)

try:
    Strict2(y="123")  # 严格模式下字符串报错
except Exception:
    print("Field strict 也拒绝字符串")
\`\`\`

### model_config 中的 strict

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义严格模型 StrictModel
class StrictModel(BaseModel):
    # 整个模型开启严格模式
    model_config = ConfigDict(strict=True)
    # 字段 x，类型 int
    x: int
    # 字段 name，类型 str
    name: str

# 严格模式下，所有字段都要求类型精确匹配
try:
    StrictModel(x="123", name=456)  # 类型不对
except Exception:
    print("全局严格模式拒绝类型转换")  # 输出

# 正确用法：类型必须完全匹配
m = StrictModel(x=123, name="alice")
print(m.x, m.name)  # 输出: 123 alice
\`\`\`

**何时用严格模式**：
- 安全敏感场景：避免意外的类型转换导致逻辑错误。
- API 对接外部系统：要求对方严格按类型传值。
- 大多数场景：默认宽松模式更友好，前端传 \`"30"\` 也能用。

## 实战：电商商品数据模型

综合本章知识，设计一个电商商品的数据模型，覆盖多种类型。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field
from pydantic import BaseModel, Field
# 从 datetime 模块导入 datetime
from datetime import datetime
# 从 decimal 模块导入 Decimal
from decimal import Decimal
# 从 uuid 模块导入 UUID
from uuid import UUID, uuid4
# 从 typing 导入 Optional、Literal
from typing import Optional, Literal

# 定义商品变体模型 Variant（SKU）
# SKU = Stock Keeping Unit（库存量单位），是商品的最小可售卖单元
# 如同一款手机有"128G 黑色"、"256G 白色"等多个 SKU
class Variant(BaseModel):
    # 字段 sku_id，类型 str
    # SKU 编码，全局唯一，用于库存管理和订单处理
    sku_id: str
    # 字段 name，类型 str（变体名，如"红色 64G"）
    # 显示给用户的变体名称，通常由规格组合而成
    name: str
    # 字段 price，类型 Decimal（变体价格）
    # 用 Decimal 而非 float，避免金融计算精度问题
    # gt=0 表示价格必须大于 0，防止设置 0 元或负数价格
    price: Decimal = Field(gt=0, description="价格，必须大于 0")
    # 字段 stock，类型 int（库存）
    # ge=0 表示库存不能为负数
    # 库存为 0 时前端应显示"售罄"
    stock: int = Field(ge=0, description="库存，>= 0")

# 定义商品模型 Product
class Product(BaseModel):
    # 字段 id，类型 UUID
    id: UUID = Field(default_factory=uuid4, description="商品 ID")
    # 字段 name，类型 str，长度 1~100
    name: str = Field(min_length=1, max_length=100)
    # 字段 description，类型 Optional[str]，可选
    description: Optional[str] = None
    # 字段 base_price，类型 Decimal，必须 > 0
    base_price: Decimal = Field(gt=0, description="基础价格")
    # 字段 currency，类型 Literal，限定货币
    currency: Literal["CNY", "USD", "EUR"] = "CNY"
    # 字段 status，类型 Literal，限定状态
    status: Literal["draft", "on_sale", "off_shelf"] = "draft"
    # 字段 tags，类型 list[str]，最多 10 个标签
    tags: list[str] = Field(default_factory=list, max_length=10)
    # 字段 variants，类型 list[Variant]（变体列表）
    variants: list[Variant] = []
    # 字段 metadata，类型 dict[str, str]（额外信息）
    metadata: dict[str, str] = {}
    # 字段 created_at，类型 datetime
    created_at: datetime = Field(default_factory=datetime.now)
    # 字段 weight，类型 Optional[float]，可选重量（kg）
    weight: Optional[float] = Field(default=None, gt=0)

# === 实例化演示 ===
product = Product(
    name="iPhone 16",
    description="苹果新款手机",
    base_price="7999.00",  # 字符串自动转 Decimal
    status="on_sale",
    tags=["手机", "苹果", "5G"],
    variants=[
        {"sku_id": "iphone16-128", "name": "128G 黑色", "price": "7999", "stock": 100},
        {"sku_id": "iphone16-256", "name": "256G 黑色", "price": "8999", "stock": 50},
    ],
    metadata={"brand": "Apple", "origin": "中国"},
    weight=0.2,
)

# 序列化
print(product.model_dump_json(indent=2))
# 输出包含所有字段，UUID/datetime/Decimal 都被转成字符串

# === 校验失败演示 ===
# 价格为 0 会报错（gt=0）
try:
    Product(name="test", base_price=0)
except Exception:
    print("价格必须大于 0")

# 状态不在限定范围会报错
try:
    Product(name="test", base_price=10, status="invalid")
except Exception:
    print("状态非法")
\`\`\`

## 小结

本章深入介绍了 Pydantic 的字段类型系统：

1. **基本类型**：str、int、float、bool、bytes，支持自动类型转换。
2. **日期时间**：datetime、date、time、timedelta，支持 ISO 8601 字符串解析。
3. **UUID**：用于唯一标识符，字符串自动转 UUID 对象。
4. **Decimal**：金融场景必备，避免 float 精度问题。
5. **集合类型**：list、dict、set、tuple，支持嵌套模型。
6. **Optional/Union**：处理可选值和多类型字段，注意 Union 的匹配顺序。
7. **Literal**：限定字段值为固定选项，轻量级枚举。
8. **特殊类型**：EmailStr、HttpUrl、FilePath 等，开箱即用。
9. **自定义类型**：用 Annotated + AfterValidator 复用校验逻辑。
10. **类型转换**：默认宽松，可用 StrictInt 或 strict=True 开启严格模式。

下一章我们将学习自定义校验器，用 \`@field_validator\` 和 \`@model_validator\` 实现复杂的业务校验逻辑。
`
  },

  // ============================================================
  // 第 15 章：自定义校验器
  // ============================================================
  {
    id: "fa-validators",
    group: "Pydantic 数据校验",
    icon: "⚙️",
    title: "自定义校验器",
    content: `# 自定义校验器

## @field_validator 装饰器（v2 语法）

Pydantic 内置的约束（\`min_length\`、\`gt\`、\`ge\` 等）只能做简单的数值和长度校验。当校验逻辑涉及业务规则时（密码强度、用户名敏感词、邮箱域名白名单），需要用 \`@field_validator\` 编写自定义校验逻辑。

\`@field_validator\` 是 Pydantic v2 的字段级校验器装饰器，替代了 v1 的 \`@validator\`。它在某个字段完成基础类型校验后执行自定义函数。

### 基本用法

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# 定义用户模型 User
class User(BaseModel):
    # 字段 name，类型 str
    name: str
    # 字段 age，类型 int
    age: int

    # 用 @field_validator 装饰一个类方法，校验 age 字段
    @field_validator('age')
    @classmethod
    def age_must_be_positive(cls, v: int) -> int:
        # cls 是模型类本身（因为是类方法）
        # v 是已经过基础类型校验的值
        # 如果 age < 0，抛出 ValueError
        if v < 0:
            # 抛出 ValueError，Pydantic 会包装成 ValidationError
            raise ValueError('age 必须是非负数')
        # 校验通过，必须返回值（返回值会赋给字段）
        return v

# 正常实例化
u = User(name='alice', age=25)
print(u.age)  # 输出: 25

# 校验失败
try:
    User(name='bob', age=-1)
except Exception as e:
    print("校验失败")  # 输出: 校验失败
\`\`\`

**关键点**：
1. \`@field_validator('字段名')\` 指定校验哪个字段，可以同时校验多个：\`@field_validator('a', 'b')\`。
2. 必须加 \`@classmethod\`（v2 要求，即使不显式加也会被自动处理，但显式更清晰）。
3. 第一个参数是 \`cls\`（类本身），第二个参数是字段值 \`v\`。
4. **必须返回值**，返回值会赋给字段；不返回相当于赋 None。
5. 校验失败抛出 \`ValueError\` 或 \`AssertionError\`，Pydantic 自动包装成 \`ValidationError\`。

### mode 参数：before / after / wrap

\`@field_validator\` 有一个重要参数 \`mode\`，控制校验器在何时执行：

- \`mode='after'\`（默认）：在 Pydantic 完成基础类型校验和转换**之后**执行，\`v\` 是已转换类型的值。
- \`mode='before'\`：在 Pydantic 基础校验**之前**执行，\`v\` 是原始输入值（可能是任意类型）。
- \`mode='wrap'\`：包裹 Pydantic 的默认校验，可以手动调用默认校验或跳过。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator
# 从 typing 导入 Any
from typing import Any

# 定义模型 Demo
class Demo(BaseModel):
    # 字段 value，类型 str
    value: str

    # mode='after'：默认，v 已经是 str
    # 执行时机：Pydantic 类型校验和转换之后
    # 此时 v 已经是声明类型的值，可以安全地按 str 操作
    @field_validator('value')
    @classmethod
    def after_check(cls, v: str) -> str:
        # 此时 v 一定是 str（Pydantic 已经转好了）
        print(f"after: {v!r} (type={type(v).__name__})")
        # 必须返回
        return v

    # mode='before'：v 是原始输入，可能是任意类型
    # 执行时机：Pydantic 类型校验之前
    # 此时 v 是原始输入值，可能是任意类型（str、int、None、dict 等）
    # 适合预处理：把 None 转默认值、字符串去空格、多种格式统一等
    @field_validator('value', mode='before')
    @classmethod
    def before_check(cls, v: Any) -> Any:
        # 此时 v 可能是 str、int、None 等任意类型
        print(f"before: {v!r} (type={type(v).__name__})")
        # 必须返回值（可以是任意类型，Pydantic 会继续做类型转换）
        # 例如这里可以把 None 转成空字符串
        if v is None:
            return ""
        # 返回原始值，让 Pydantic 继续处理
        return v

# 实例化观察执行顺序
d = Demo(value=123)
# 输出顺序：
# before: 123 (type=int)   ← 先执行 before
# after: '123' (type=str)  ← Pydantic 把 123 转成 '123'，再执行 after
print(d.value)  # 输出: 123

# 传 None 时，before 把它转成空字符串
d2 = Demo(value=None)
# 输出：before: None (type=NoneType)
# 输出：after: '' (type=str)
print(d2.value)  # 输出: （空字符串）
\`\`\`

**before 模式的典型用途**：
- 预处理输入数据（如 None 转默认值、字符串去空格）。
- 处理多种输入格式（如日期字符串支持多种格式）。
- 在类型转换前拦截特殊值。

### 校验多个字段

一个 \`@field_validator\` 可以同时校验多个字段。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# 定义模型 Rectangle
class Rectangle(BaseModel):
    # 字段 width，类型 float
    width: float
    # 字段 height，类型 float
    height: float

    # 同时校验 width 和 height
    @field_validator('width', 'height')
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        # v 依次是 width 和 height 的值
        if v <= 0:
            raise ValueError('边长必须大于 0')
        # 返回校验后的值
        return v

# 正常
r = Rectangle(width=10, height=20)
print(r.model_dump())  # 输出: {'width': 10.0, 'height': 20.0}

# width 非法
try:
    Rectangle(width=-1, height=20)
except Exception:
    print("width 非法")  # 输出

# height 非法
try:
    Rectangle(width=10, height=0)
except Exception:
    print("height 非法")  # 输出
\`\`\`

## @model_validator 装饰器

字段级校验器只能访问单个字段，当校验逻辑涉及多个字段之间的关系时（密码确认、开始时间 < 结束时间、字段互斥），需要用 \`@model_validator\`。

\`@model_validator\` 是模型级校验器，替代 v1 的 \`@root_validator\`。它有三种模式：

### mode='after'：最常用

在所有字段都校验完成后执行，\`self\` 是已校验的模型实例，可以访问所有字段。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 model_validator
from pydantic import BaseModel, model_validator

# 定义模型 DateRange
class DateRange(BaseModel):
    # 字段 start，类型 str（开始日期，简化演示）
    start: str
    # 字段 end，类型 str（结束日期）
    end: str

    # 模型级校验器，mode='after'
    @model_validator(mode='after')
    def check_date_order(self) -> 'DateRange':
        # self 是已校验的模型实例，所有字段都已就位
        # 校验 start 必须小于 end（字符串比较，简化演示）
        if self.start > self.end:
            # 抛出 ValueError，可以指明错误字段
            raise ValueError(f'开始日期 {self.start} 不能晚于结束日期 {self.end}')
        # 必须返回 self
        return self

# 正常
dr = DateRange(start="2026-01-01", end="2026-12-31")
print(dr)  # 输出: start='2026-01-01' end='2026-12-31'

# 校验失败
try:
    DateRange(start="2026-12-31", end="2026-01-01")
except Exception as e:
    print("日期顺序错误")  # 输出
\`\`\`

**关键点**：
1. \`mode='after'\` 时，方法是实例方法（不是类方法），第一个参数是 \`self\`。
2. 必须返回 \`self\`。
3. 抛出 ValueError 时，错误信息会附在模型级别（loc 是 ()）。

### mode='before'：处理原始输入

在 Pydantic 校验之前执行，收到的是原始输入数据（通常是字典）。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 model_validator
from pydantic import BaseModel, model_validator
# 从 typing 导入 Any
from typing import Any

# 定义模型 User
class User(BaseModel):
    # 字段 name，类型 str
    name: str
    # 字段 age，类型 int
    age: int

    # mode='before'：处理原始输入
    @model_validator(mode='before')
    @classmethod
    def preprocess(cls, data: Any) -> Any:
        # data 通常是字典，但也可能是其他类型
        if isinstance(data, dict):
            # 把 name 字段去空格
            if 'name' in data and isinstance(data['name'], str):
                data['name'] = data['name'].strip()
            # 支持 age 字段传 "二十" 这种中文数字（简化演示）
            if data.get('age') == '二十':
                data['age'] = 20
        # 返回处理后的数据，Pydantic 继续校验
        return data

# 实例化
u = User(name="  alice  ", age="二十")
print(u.name)  # 输出: alice（去空格了）
print(u.age)   # 输出: 20（中文转数字）
\`\`\`

### mode='wrap'：完全控制

\`\`\`python
# 从 pydantic 导入 BaseModel、model_validator
from pydantic import BaseModel, model_validator
# 从 typing 导入 Any
from typing import Any

# 定义模型 Flexible
class Flexible(BaseModel):
    # 字段 value，类型 int
    value: int

    # mode='wrap'：可以调用 handler 执行默认校验，或跳过
    @model_validator(mode='wrap')
    @classmethod
    def custom_validate(cls, data: Any, handler) -> Any:
        # handler 是 Pydantic 的默认校验函数
        # 可以选择调用它，也可以跳过
        # 场景：特殊值直接返回，不走默认校验
        if data == 'skip':
            # 跳过默认校验，直接构造一个实例（简化演示）
            # 实际中这种用法较少，主要用于兼容老代码
            return cls.model_construct(value=0)
        # 调用默认校验流程
        return handler(data)

# 正常调用
f = Flexible(value=123)
print(f.value)  # 输出: 123

# 特殊值跳过校验
f2 = Flexible('skip')
print(f2.value)  # 输出: 0
\`\`\`

**wrap 模式的典型用途**：
- 兼容 v1 的校验逻辑。
- 在校验前后添加日志、监控。
- 根据输入选择不同的校验路径。

## 校验器返回值和异常

### 返回值规则

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# 定义模型 Transform
class Transform(BaseModel):
    # 字段 name，类型 str
    name: str

    # 校验器可以修改值（数据清洗）
    @field_validator('name')
    @classmethod
    def normalize_name(cls, v: str) -> str:
        # 去空格 + 转小写
        cleaned = v.strip().lower()
        # 返回清洗后的值，会赋给 name 字段
        return cleaned

# 实例化
t = Transform(name="  ALICE  ")
print(t.name)  # 输出: alice（被清洗了）
\`\`\`

### 异常规则

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# 定义模型 StrictName
class StrictName(BaseModel):
    # 字段 name，类型 str
    name: str

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        # 方式 1：抛 ValueError（推荐）
        if len(v) < 2:
            raise ValueError('名字至少 2 个字符')
        # 方式 2：抛 AssertionError（也可以）
        assert len(v) <= 20, '名字最多 20 个字符'
        # 方式 3：抛 PydanticCustomError（更灵活，能自定义错误类型）
        # from pydantic_core import PydanticCustomError
        # if 'bad' in v:
        #     raise PydanticCustomError('bad_word', '名字包含敏感词')
        # 返回值
        return v

# 测试各种异常
try:
    StrictName(name="a")  # 太短
except Exception as e:
    # 错误信息里会有 '名字至少 2 个字符'
    print("太短")

try:
    StrictName(name="a" * 21)  # 太长
except Exception:
    print("太长")  # 输出
\`\`\`

## 多字段联合校验

实际业务中，很多校验逻辑涉及多个字段的组合。比如：
- 开始时间 < 结束时间
- 折扣价 < 原价
- 字段 A 和字段 B 不能同时为空
- 选择某选项时，另一字段必填

\`\`\`python
# 从 pydantic 导入 BaseModel 和 model_validator
from pydantic import BaseModel, model_validator
# 从 typing 导入 Optional
from typing import Optional

# 定义模型 Order
class Order(BaseModel):
    # 字段 original_price，类型 float（原价）
    original_price: float
    # 字段 discount_price，类型 Optional[float]（折扣价，可选）
    discount_price: Optional[float] = None
    # 字段 quantity，类型 int（数量）
    quantity: int

    # 多字段联合校验
    @model_validator(mode='after')
    def check_prices(self) -> 'Order':
        # 如果设置了折扣价，必须小于原价
        if self.discount_price is not None:
            # 折扣价必须 > 0
            if self.discount_price <= 0:
                raise ValueError('折扣价必须大于 0')
            # 折扣价必须 < 原价
            if self.discount_price >= self.original_price:
                raise ValueError('折扣价必须小于原价')
        # 返回 self
        return self

    # 另一个联合校验：总价计算
    @model_validator(mode='after')
    def check_total(self) -> 'Order':
        # 计算总价，校验是否合理
        unit_price = self.discount_price if self.discount_price else self.original_price
        total = unit_price * self.quantity
        # 总价不能超过 100 万（业务规则）
        if total > 1_000_000:
            raise ValueError(f'总价 {total} 超过上限 100 万')
        return self

# 正常订单
o = Order(original_price=100, discount_price=80, quantity=2)
print(o.model_dump())  # 输出: {'original_price': 100.0, 'discount_price': 80.0, 'quantity': 2}

# 折扣价 >= 原价，报错
try:
    Order(original_price=100, discount_price=100, quantity=1)
except Exception:
    print("折扣价不能 >= 原价")  # 输出

# 总价超限
try:
    Order(original_price=100, quantity=20000)  # 总价 200 万
except Exception:
    print("总价超限")  # 输出
\`\`\`

## 密码确认校验

用户注册时通常需要输入两次密码确认，这是多字段校验的经典场景。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 model_validator
from pydantic import BaseModel, model_validator, Field

# 定义用户注册模型 UserRegister
class UserRegister(BaseModel):
    # 字段 username，类型 str，长度 3~20
    username: str = Field(min_length=3, max_length=20)
    # 字段 password，类型 str，最少 8 位
    password: str = Field(min_length=8)
    # 字段 password_confirm，类型 str（确认密码）
    password_confirm: str

    # 校验两次密码是否一致
    # @model_validator(mode='after') 是模型级校验器
    # mode='after' 在所有字段校验完成后执行
    # 此时 self 是已校验的模型实例，所有字段都已就位
    # 适合跨字段校验（如密码确认、日期范围、字段互斥等）
    @model_validator(mode='after')
    def passwords_match(self) -> 'UserRegister':
        # self 是模型实例，可以访问所有字段
        # 比较 password 和 password_confirm
        if self.password != self.password_confirm:
            # 抛出 ValueError，指明是 password_confirm 字段的问题
            # Pydantic 会把 ValueError 包装成 ValidationError
            # 错误信息会附在模型级别（loc 是 ()）
            raise ValueError('两次输入的密码不一致')
        # 一致则返回 self
        # mode='after' 的校验器必须返回 self
        # 返回值就是最终的模型实例
        return self

# 正常注册
u = UserRegister(username="alice", password="12345678", password_confirm="12345678")
print(u.username)  # 输出: alice

# 密码不一致
try:
    UserRegister(username="bob", password="12345678", password_confirm="87654321")
except Exception as e:
    print("密码不一致")  # 输出
\`\`\`

## 数据清洗和标准化

校验器不仅能校验，还能在返回前修改值，实现数据清洗和标准化。这是 Pydantic 的一个重要特性。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# 定义用户模型 User
class User(BaseModel):
    # 字段 name，类型 str
    name: str
    # 字段 email，类型 str
    email: str
    # 字段 phone，类型 str
    phone: str

    # name：去空格 + 首字母大写
    @field_validator('name')
    @classmethod
    def normalize_name(cls, v: str) -> str:
        # 去首尾空格
        v = v.strip()
        # 每个单词首字母大写
        v = v.title()
        # 返回标准化后的值
        return v

    # email：去空格 + 转小写
    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        # 去空格 + 转小写
        return v.strip().lower()

    # phone：去掉所有非数字字符
    @field_validator('phone')
    @classmethod
    def clean_phone(cls, v: str) -> str:
        # 只保留数字
        digits = ''.join(c for c in v if c.isdigit())
        # 中国手机号：11 位，前面加 +86
        if len(digits) == 11:
            return f"+86{digits}"
        # 返回纯数字
        return digits

# 实例化：传入未规范化的数据
u = User(
    name="  alice wang  ",
    email="  ALICE@EXAMPLE.COM  ",
    phone="138-1234-5678",
)
print(u.name)   # 输出: Alice Wang（首字母大写）
print(u.email)  # 输出: alice@example.com（小写）
print(u.phone)  # 输出: +8613812345678（格式化）
\`\`\`

**清洗 vs 校验的区别**：
- 校验：判断值是否合法，不合法就报错。
- 清洗：把不规范的值转成规范形式，不报错。

实际项目中，通常先清洗再校验。比如先去空格，再判断长度。

## @field_serializer 自定义序列化

默认情况下，\`model_dump()\` 和 \`model_dump_json()\` 按字段原值序列化。当需要自定义序列化输出时（比如隐藏部分内容、格式化日期、计算派生值），用 \`@field_serializer\`。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_serializer
from pydantic import BaseModel, field_serializer
# 从 datetime 模块导入 datetime
from datetime import datetime

# 定义用户模型 User
class User(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 password，类型 str
    password: str
    # 字段 created_at，类型 datetime
    created_at: datetime

    # 自定义 password 的序列化：永远输出 ******
    # @field_serializer('password') 装饰实例方法
    # 只影响 model_dump() / model_dump_json() 的输出
    # 不影响字段实际值（u.password 还是原值）
    @field_serializer('password')
    def serialize_password(self, value: str) -> str:
        # self 是模型实例
        # value 是字段的原始值（这里是 password 的真实值）
        # 返回值就是序列化时的输出
        # 返回脱敏后的值
        return "******"

    # 自定义 created_at 的序列化：格式化为 YYYY-MM-DD
    @field_serializer('created_at')
    def serialize_created_at(self, value: datetime) -> str:
        # value 是 datetime 对象
        # strftime 是 datetime 的方法，按格式化字符串转字符串
        # %Y 年（4位）、%m 月（2位）、%d 日（2位）
        # 如 datetime(2026, 7, 11) → "2026-07-11"
        return value.strftime("%Y-%m-%d")

# 实例化
u = User(
    id=1,
    name="alice",
    password="supersecret",
    created_at=datetime(2026, 7, 11, 12, 0, 0),
)

# model_dump 时，序列化器生效
print(u.model_dump())
# 输出: {'id': 1, 'name': 'alice', 'password': '******', 'created_at': '2026-07-11'}

# model_dump_json 时也生效
print(u.model_dump_json())
# 输出: {"id":1,"name":"alice","password":"******","created_at":"2026-07-11"}

# 注意：直接访问属性还是原始值
print(u.password)      # 输出: supersecret（原始值）
print(u.created_at)    # 输出: 2026-07-11 12:00:00（datetime 对象）
\`\`\`

**关键点**：
1. \`@field_serializer('字段名')\` 装饰实例方法。
2. 第一个参数是 \`self\`，第二个参数是 \`value\`（字段原始值）。
3. 返回值就是序列化时的输出。
4. **只影响序列化输出，不影响字段实际值**（\`u.password\` 还是原值）。

## @model_serializer

\`@model_serializer\` 是模型级序列化器，可以完全控制整个模型的序列化过程。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 model_serializer
from pydantic import BaseModel, model_serializer

# 定义用户模型 User
class User(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 password，类型 str
    password: str
    # 字段 is_admin，类型 bool
    is_admin: bool = False

    # 模型级序列化器
    @model_serializer
    def serialize_model(self) -> dict:
        # 完全控制输出字典的内容
        # 这里隐藏 password，并根据 is_admin 决定是否输出
        result = {
            "id": self.id,
            "name": self.name,
        }
        # 只有 admin 才输出 is_admin 字段
        if self.is_admin:
            result["is_admin"] = self.is_admin
        # 永远不输出 password
        return result

# 实例化普通用户
u1 = User(id=1, name="alice", password="secret")
print(u1.model_dump())
# 输出: {'id': 1, 'name': 'alice'}（没有 password，也没有 is_admin）

# 实例化管理员
u2 = User(id=2, name="admin", password="root", is_admin=True)
print(u2.model_dump())
# 输出: {'id': 2, 'name': 'admin', 'is_admin': True}
\`\`\`

**field_serializer vs model_serializer**：
- \`field_serializer\`：针对单个字段，简单场景用这个。
- \`model_serializer\`：控制整个模型输出，适合需要根据条件决定输出哪些字段的复杂场景。

## 实战：用户注册校验

综合运用本章知识，实现一个完整的用户注册校验，包含密码强度、邮箱域名白名单、用户名敏感词过滤。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、field_validator、model_validator
from pydantic import BaseModel, Field, field_validator, model_validator
# 从 typing 导入 Optional
from typing import Optional
# 导入 re 模块（正则表达式）
import re

# 定义敏感词列表（实际项目从数据库或配置读取）
SENSITIVE_WORDS = ["admin", "root", "system", "fuck", "shit"]
# 定义允许的邮箱域名白名单
ALLOWED_EMAIL_DOMAINS = ["gmail.com", "outlook.com", "example.com", "qq.com", "163.com"]

# 定义用户注册模型 UserRegister
class UserRegister(BaseModel):
    # 字段 username，类型 str，长度 3~20
    username: str = Field(min_length=3, max_length=20, description="用户名")
    # 字段 email，类型 str
    email: str = Field(description="邮箱")
    # 字段 password，类型 str，最少 8 位
    password: str = Field(min_length=8, description="密码")
    # 字段 password_confirm，类型 str
    password_confirm: str = Field(description="确认密码")
    # 字段 age，类型 Optional[int]，可选
    age: Optional[int] = Field(default=None, ge=0, le=150)

    # === 1. 用户名校验：不能包含敏感词 ===
    @field_validator('username')
    @classmethod
    def check_username_sensitive(cls, v: str) -> str:
        # 转小写后检查
        v_lower = v.lower()
        # 遍历敏感词列表
        for word in SENSITIVE_WORDS:
            # 如果用户名包含敏感词
            if word in v_lower:
                # 抛出 ValueError
                raise ValueError(f'用户名包含敏感词: {word}')
        # 校验通过，返回原值
        return v

    # === 2. 邮箱校验：格式 + 域名白名单 ===
    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        # 去空格 + 转小写
        v = v.strip().lower()
        # 简单格式校验：必须包含 @
        if '@' not in v:
            raise ValueError('邮箱格式错误：缺少 @')
        # 提取域名（@ 后面的部分）
        domain = v.split('@')[-1]
        # 校验域名是否在白名单里
        if domain not in ALLOWED_EMAIL_DOMAINS:
            raise ValueError(f'不支持的邮箱域名: {domain}，允许的域名: {ALLOWED_EMAIL_DOMAINS}')
        # 返回清洗后的邮箱
        return v

    # === 3. 密码强度校验 ===
    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        # 规则 1：长度 >= 8（Field 已经保证，这里再检查）
        if len(v) < 8:
            raise ValueError('密码至少 8 位')
        # 规则 2：必须包含数字
        if not re.search(r'[0-9]', v):
            raise ValueError('密码必须包含数字')
        # 规则 3：必须包含字母
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('密码必须包含字母')
        # 规则 4：必须包含特殊字符
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('密码必须包含特殊字符')
        # 规则 5：不能包含用户名（这一步在 model_validator 里做，因为需要同时访问 username）
        # 校验通过
        return v

    # === 4. 模型级校验：密码确认 + 密码不含用户名 ===
    @model_validator(mode='after')
    def validate_password(self) -> 'UserRegister':
        # 两次密码必须一致
        if self.password != self.password_confirm:
            raise ValueError('两次输入的密码不一致')
        # 密码不能包含用户名
        if self.username.lower() in self.password.lower():
            raise ValueError('密码不能包含用户名')
        # 返回 self
        return self

# === 测试 ===
# 正常注册
user = UserRegister(
    username="alice2026",
    email="alice@gmail.com",
    password="Secure@123",
    password_confirm="Secure@123",
    age=25,
)
print("注册成功:", user.username, user.email)

# 测试各种错误
def test_invalid(name, **kwargs):
    # 尝试创建，捕获异常
    try:
        UserRegister(**kwargs)
        print(f"{name}: 通过（不应该）")
    except Exception as e:
        print(f"{name}: 失败（预期）")

# 用户名含敏感词
test_invalid("敏感词", username="admin_user", email="a@gmail.com", password="Xx@1234", password_confirm="Xx@1234")
# 邮箱域名不在白名单
test_invalid("域名", username="alice", email="a@unknown.com", password="Xx@1234", password_confirm="Xx@1234")
# 密码没有特殊字符
test_invalid("密码强度", username="alice", email="a@gmail.com", password="Xx12345678", password_confirm="Xx12345678")
# 两次密码不一致
test_invalid("密码确认", username="alice", email="a@gmail.com", password="Xx@1234", password_confirm="Yy@5678")
# 密码包含用户名
test_invalid("密码含用户名", username="alice", email="a@gmail.com", password="alice@123", password_confirm="alice@123")
\`\`\`

## 在 FastAPI 中使用

把上面的校验模型用在 FastAPI 路由里：

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel、Field、field_validator、model_validator
from pydantic import BaseModel, Field, field_validator, model_validator

# 创建 FastAPI 应用
app = FastAPI()

# 定义注册请求模型（带校验）
class RegisterRequest(BaseModel):
    # 字段 username
    username: str = Field(min_length=3, max_length=20)
    # 字段 password
    password: str = Field(min_length=8)
    # 字段 password_confirm
    password_confirm: str

    # 校验密码一致
    @model_validator(mode='after')
    def passwords_match(self) -> 'RegisterRequest':
        # 比较密码
        if self.password != self.password_confirm:
            raise ValueError('两次密码不一致')
        # 返回 self
        return self

# 定义注册响应模型
class RegisterResponse(BaseModel):
    # 字段 id
    id: int
    # 字段 username
    username: str
    # 字段 message
    message: str

# 注册路由
@app.post("/register", response_model=RegisterResponse)
def register(req: RegisterRequest):
    # 走到这里说明校验全部通过
    # 实际项目：存数据库、发邮件等
    return RegisterResponse(
        id=1,
        username=req.username,
        message="注册成功",
    )

# 当请求体校验失败时，FastAPI 自动返回 422 + 错误详情
# 客户端收到的响应类似：
# {
#   "detail": [
#     {
#       "type": "value_error",
#       "loc": ["body", "password_confirm"],
#       "msg": "Value error, 两次密码不一致",
#       "input": ...
#     }
#   ]
# }
\`\`\`

## 小结

本章介绍了 Pydantic 的自定义校验与序列化机制：

1. **@field_validator**：字段级校验器，支持 \`mode='before'/'after'/'wrap'\`。
2. **@model_validator**：模型级校验器，用于多字段联合校验。
3. **mode='after'**（默认）：在 Pydantic 基础校验后执行，值已转换类型。
4. **mode='before'**：在基础校验前执行，可预处理原始输入。
5. **返回值**：校验器必须返回值，返回值会赋给字段（可用来清洗数据）。
6. **异常**：抛出 ValueError/AssertionError 会被包装成 ValidationError。
7. **密码确认**：用 model_validator 比较两个字段。
8. **数据清洗**：在校验器里去空格、转大小写、格式化。
9. **@field_serializer**：自定义单个字段的序列化输出。
10. **@model_serializer**：完全控制整个模型的序列化。

下一章我们将学习模型配置与高级特性，包括 ConfigDict、别名、计算字段、JSON Schema 自定义、泛型模型等。
`
  },

  // ============================================================
  // 第 16 章：模型配置与高级特性
  // ============================================================
  {
    id: "fa-model-config",
    group: "Pydantic 数据校验",
    icon: "⚙️",
    title: "模型配置与高级特性",
    content: `# 模型配置与高级特性

## model_config = ConfigDict(...)

Pydantic v2 用 \`model_config = ConfigDict(...)\` 配置模型行为，替代了 v1 的 \`class Config:\` 内部类写法。ConfigDict 是一个 TypedDict，所有可配置项都有类型提示，IDE 能自动补全。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义模型 User
class User(BaseModel):
    # 模型配置
    # ConfigDict 是 TypedDict，所有配置项都有类型提示
    # IDE 能自动补全配置项名称，写错会报错
    model_config = ConfigDict(
        # 允许从 ORM 对象创建模型
        # 开启后 model_validate 能接受 ORM 对象（用 getattr 读属性）
        # 等价于 v1 的 orm_mode=True
        from_attributes=True,
        # 禁止额外字段（默认是 'ignore'，会忽略多余字段）
        # 'forbid'：传未定义字段会报错，防止客户端传错字段
        # 'ignore'：静默忽略（默认）
        # 'allow'：保留额外字段
        extra='forbid',
        # 字符串自动去首尾空格
        # 实例化时所有 str 字段会自动调用 .strip()
        # 避免用户输入 "alice " 这种带空格的值
        str_strip_whitespace=True,
        # 字段名大小写不敏感（'Name' 也能匹配 'name'）
        str_to_lower=False,
        # 验证赋值（修改字段时也触发校验）
        # 默认 False：u.id = "abc" 不会校验类型
        # 设为 True：u.id = "abc" 会触发类型校验，报错
        # 适合需要保证数据一致性的场景
        validate_assignment=True,
        # 允许使用枚举的值（而不只是枚举成员）
        # 设为 True 后，字段存储的是枚举的 .value（如 "pending"）
        # 而不是枚举成员（如 OrderStatus.pending）
        # 方便序列化，但失去枚举方法
        use_enum_values=True,
    )
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str

# 实例化
u = User(id=1, name="  alice  ")
# str_strip_whitespace 生效，name 自动去空格
print(u.name)  # 输出: alice

# 传额外字段会报错（extra='forbid'）
try:
    User(id=1, name="a", extra_field="x")  # 多了 extra_field
except Exception:
    print("禁止额外字段")  # 输出

# validate_assignment 生效：修改字段时也校验
try:
    u.id = "not an int"  # 赋值时校验
except Exception:
    print("赋值校验失败")  # 输出
\`\`\`

### 常用配置项一览

| 配置项 | 默认值 | 说明 |
|-------|--------|------|
| \`extra\` | \`'ignore'\` | 处理额外字段：\`'ignore'\`忽略 / \`'forbid'\`报错 / \`'allow'\`保留 |
| \`from_attributes\` | \`False\` | 是否允许从 ORM 对象创建 |
| \`frozen\` | \`False\` | 模型是否不可变 |
| \`str_strip_whitespace\` | \`False\` | 字符串字段自动去首尾空格 |
| \`str_min_length\` | \`None\` | 字符串字段全局最小长度 |
| \`str_max_length\` | \`None\` | 字符串字段全局最大长度 |
| \`validate_assignment\` | \`False\` | 赋值时是否触发校验 |
| \`use_enum_values\` | \`False\` | 枚举字段存值还是存枚举成员 |
| \`populate_by_name\` | \`False\` | 允许用字段名（而非别名）实例化 |
| \`json_schema_extra\` | \`None\` | 自定义 JSON Schema |
| \`alias_generator\` | \`None\` | 自动生成别名 |

## str_strip_whitespace 等全局配置

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# === 不配置：字符串不去空格 ===
class User1(BaseModel):
    # 字段 name，类型 str
    name: str

u1 = User1(name="  alice  ")
print(repr(u1.name))  # 输出: '  alice  '（保留空格）

# === 配置 str_strip_whitespace=True ===
class User2(BaseModel):
    # 配置：全局字符串去空格
    model_config = ConfigDict(str_strip_whitespace=True)
    # 字段 name，类型 str
    name: str

u2 = User2(name="  alice  ")
print(repr(u2.name))  # 输出: 'alice'（空格被去掉）

# === 配置 str_min_length / str_max_length ===
class User3(BaseModel):
    # 配置：所有字符串字段最小长度 2，最大长度 50
    model_config = ConfigDict(
        str_strip_whitespace=True,  # 先去空格
        str_min_length=2,           # 去空格后长度必须 >= 2
        str_max_length=50,
    )
    # 字段 name，类型 str
    name: str
    # 字段 bio，类型 str
    bio: str

# 长度 1 会报错
try:
    User3(name="a", bio="hello")  # name 去空格后长度 1
except Exception:
    print("name 太短")  # 输出

# 长度 0 会报错
try:
    User3(name="   ", bio="x")  # name 去空格后是空字符串
except Exception:
    print("name 不能为空")  # 输出

# 正常
u3 = User3(name="alice", bio="hello world")
print(u3.name, u3.bio)  # 输出: alice hello world
\`\`\`

## extra='forbid' / 'ignore' / 'allow'

控制如何处理输入数据中**模型未定义的字段**。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# === extra='ignore'（默认）：忽略额外字段 ===
class IgnoreModel(BaseModel):
    # 配置：忽略额外字段
    model_config = ConfigDict(extra='ignore')
    # 字段 name，类型 str
    name: str

# 传入额外字段 age，会被静默忽略
m1 = IgnoreModel(name="alice", age=30)
print(m1.model_dump())  # 输出: {'name': 'alice'}（没有 age）
# 不会报错

# === extra='forbid'：禁止额外字段 ===
class ForbidModel(BaseModel):
    # 配置：禁止额外字段
    model_config = ConfigDict(extra='forbid')
    # 字段 name，类型 str
    name: str

# 传入额外字段会报错
try:
    ForbidModel(name="alice", age=30)  # age 是额外字段
except Exception:
    print("禁止额外字段")  # 输出

# === extra='allow'：允许并保留额外字段 ===
class AllowModel(BaseModel):
    # 配置：允许额外字段
    model_config = ConfigDict(extra='allow')
    # 字段 name，类型 str
    name: str

# 额外字段会被保留
m3 = AllowModel(name="alice", age=30, city="北京")
print(m3.model_dump())  # 输出: {'name': 'alice', 'age': 30, 'city': '北京'}
# 额外字段存储在 __pydantic_extra__ 里
print(m3.__pydantic_extra__)  # 输出: {'age': 30, 'city': '北京'}

# 额外字段也可以直接访问
print(m3.age)   # 输出: 30
print(m3.city)  # 输出: 北京
\`\`\`

**选择建议**：
- 大多数场景用 \`'ignore'\`（默认），宽松处理。
- API 请求体用 \`'forbid'\`，防止客户端传错误字段。
- 需要保留任意扩展字段时用 \`'allow'\`（少见，比如动态配置）。

## alias 别名（AliasChoices、AliasPath）

实际项目中，外部数据源的字段名经常和 Python 命名规范冲突。比如：
- 前端传 \`userName\`，Python 习惯 \`user_name\`
- 数据库列名是 \`user_id\`，Python 用 \`id\`
- JSON 用 \`createdAt\`，Python 用 \`created_at\`

Pydantic 的 \`alias\` 解决这种命名不一致问题。

### 基本别名

\`\`\`python
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 定义模型 User
class User(BaseModel):
    # 字段 user_id，类型 int，别名为 'userId'
    # 外部数据用 'userId'，Python 内部用 'user_id'
    user_id: int = Field(alias='userId')
    # 字段 created_at，类型 str，别名为 'createdAt'
    created_at: str = Field(alias='createdAt')

# 实例化：必须用别名
# 定义了 alias 后，实例化时必须用 alias 作为关键字参数
# 不能用字段名 user_id，要用 userId
u = User(userId=1, createdAt="2026-07-11")
print(u.user_id)      # 输出: 1（用字段名访问）
print(u.created_at)   # 输出: 2026-07-11

# 序列化：默认用别名
# model_dump() 默认 by_alias=False，用字段名
# 但 Pydantic v2 改变了默认行为，定义了 alias 后默认用别名
print(u.model_dump())
# 输出: {'userId': 1, 'createdAt': '2026-07-11'}（键是别名）
# 用 model_dump(by_alias=False) 可以用字段名
# by_alias=False 强制使用字段名而非别名
print(u.model_dump(by_alias=False))
# 输出: {'user_id': 1, 'created_at': '2026-07-11'}
\`\`\`

### populate_by_name：允许用字段名实例化

默认情况下，定义了 alias 后必须用 alias 实例化。开启 \`populate_by_name=True\` 后，字段名和 alias 都能用。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ConfigDict
from pydantic import BaseModel, Field, ConfigDict

# 定义模型 User
class User(BaseModel):
    # 配置：允许用字段名实例化
    model_config = ConfigDict(populate_by_name=True)
    # 字段 user_id，别名为 'userId'
    user_id: int = Field(alias='userId')

# 方式 1：用别名实例化
u1 = User(userId=1)
# 方式 2：用字段名实例化（因为开启了 populate_by_name）
u2 = User(user_id=2)
print(u1.user_id)  # 输出: 1
print(u2.user_id)  # 输出: 2
\`\`\`

### AliasChoices：多个别名

一个字段可以接受多个别名，用 \`AliasChoices\`。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、AliasChoices
from pydantic import BaseModel, Field, AliasChoices

# 定义模型 User
class User(BaseModel):
    # 字段 user_id，接受多个别名：'userId'、'user_id'、'id'
    user_id: int = Field(
        validation_alias=AliasChoices('userId', 'user_id', 'id')
    )

# 三个别名都能用
u1 = User(userId=1)
u2 = User(user_id=2)
u3 = User(id=3)
print(u1.user_id, u2.user_id, u3.user_id)  # 输出: 1 2 3
\`\`\`

### AliasPath：嵌套路径别名

当数据是嵌套结构时，可以用 \`AliasPath\` 从嵌套字段取值。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、AliasPath
from pydantic import BaseModel, Field, AliasPath

# 定义模型 User
class User(BaseModel):
    # 字段 city，从嵌套的 address.city 取值
    city: str = Field(validation_alias=AliasPath('address', 'city'))
    # 字段 zip_code，从 address.zip 取值
    zip_code: str = Field(validation_alias=AliasPath('address', 'zip'))

# 实例化：传入嵌套数据
u = User(address={"city": "北京", "zip": "100000"})
print(u.city)      # 输出: 北京
print(u.zip_code)  # 输出: 100000
\`\`\`

### serialization_alias：序列化别名

\`alias\` 同时影响输入和输出，如果只想影响其中一个，用 \`validation_alias\` 和 \`serialization_alias\`。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 定义模型 User
class User(BaseModel):
    # 字段 user_id
    # 输入用 'userId'，输出用 'id'
    user_id: int = Field(
        validation_alias='userId',    # 输入时的别名
        serialization_alias='id',     # 序列化时的别名
    )

# 输入用 validation_alias
u = User(userId=1)
# 输出用 serialization_alias
print(u.model_dump(by_alias=True))  # 输出: {'id': 1}
\`\`\`

## 计算字段 computed_field

有时我们需要一个字段是基于其他字段计算出来的（比如全名 = 姓 + 名，总价 = 单价 × 数量）。用 \`@computed_field\` 装饰器定义。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 computed_field
from pydantic import BaseModel, computed_field

# 定义用户模型 User
class User(BaseModel):
    # 字段 first_name，类型 str
    first_name: str
    # 字段 last_name，类型 str
    last_name: str
    # 字段 age，类型 int
    age: int

    # 计算字段：全名（基于 first_name 和 last_name）
    @computed_field
    def full_name(self) -> str:
        # 返回姓 + 名
        return f"{self.last_name}{self.first_name}"

    # 计算字段：年龄段
    @computed_field
    def age_group(self) -> str:
        # 根据年龄返回段位
        if self.age < 18:
            return "未成年"
        elif self.age < 60:
            return "成年"
        else:
            return "老年"

# 实例化（不需要传 full_name 和 age_group）
u = User(first_name="三", last_name="张", age=25)

# 访问计算字段就像普通字段
print(u.full_name)   # 输出: 张三
print(u.age_group)   # 输出: 成年

# 计算字段会出现在 model_dump 里
print(u.model_dump())
# 输出: {'first_name': '三', 'last_name': '张', 'age': 25, 'full_name': '张三', 'age_group': '成年'}

# 计算字段也会出现在 JSON Schema 里
# 这意味着 FastAPI 的 OpenAPI 文档会显示这些字段
\`\`\`

**computed_field 的特点**：
1. 是只读的，不能在实例化时传值。
2. 每次访问都会重新计算（不缓存）。
3. 出现在 \`model_dump()\` 和 JSON Schema 里。
4. 可以指定返回类型（\`-> str\`），影响 Schema 生成。

### 计算字段带别名

\`\`\`python
# 从 pydantic 导入 BaseModel 和 computed_field
from pydantic import BaseModel, computed_field

# 定义模型 Product
class Product(BaseModel):
    # 字段 price，类型 float
    price: float
    # 字段 quantity，类型 int
    quantity: int

    # 计算字段：总价，带别名
    @computed_field(alias="totalAmount")
    def total_amount(self) -> float:
        # 单价 × 数量
        return self.price * self.quantity

# 实例化
p = Product(price=9.9, quantity=3)
print(p.total_amount)  # 输出: 29.7
# 用别名序列化
print(p.model_dump(by_alias=True))
# 输出: {'price': 9.9, 'quantity': 3, 'totalAmount': 29.7}
\`\`\`

## model_fields 和 model_fields_set

Pydantic v2 提供了两个有用的属性来检查模型信息。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 定义模型 User
class User(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 age，类型 int，默认 0
    age: int = 0
    # 字段 bio，类型 str，默认空
    bio: str = ""

# === model_fields：查看模型定义的所有字段 ===
print(User.model_fields)
# 输出一个字典，键是字段名，值是 FieldInfo 对象
# 包含每个字段的类型、默认值、约束等元信息
for name, info in User.model_fields.items():
    # 打印字段名、类型、默认值
    print(f"{name}: type={info.annotation}, default={info.default}")

# === model_fields_set：实例化时显式传入的字段集合 ===
u = User(id=1, name="alice")  # age 和 bio 用默认值
print(u.model_fields_set)  # 输出: {'id', 'name'}（只包含显式传入的字段）

u2 = User(id=2, name="bob", age=30, bio="hello")
print(u2.model_fields_set)  # 输出: {'id', 'name', 'age', 'bio'}

# === 用途：区分"未传值"和"传了默认值" ===
# 在 PATCH 更新场景，只更新用户传了哪些字段
def update_user(user_id: int, update_data: dict):
    # 假设 update_data 是请求体
    user = User(id=user_id, name="default", **update_data)
    # 只遍历用户显式传入的字段
    fields_to_update = user.model_fields_set - {"id"}  # 排除 id
    print(f"需要更新的字段: {fields_to_update}")
    # 实际项目：只把这些字段写入数据库

# 模拟 PATCH 请求：只更新 age
update_user(1, {"age": 25})
# 输出: 需要更新的字段: {'age'}
\`\`\`

**model_fields_set 的典型应用**：FastAPI 的 PATCH 接口，前端只传需要更新的字段，后端用 \`model_fields_set\` 判断哪些字段是用户主动传的，只更新这些字段，避免用默认值覆盖已有数据。

## 模型的深拷贝和浅拷贝（model_copy）

Pydantic 模型可以用 \`model_copy()\` 方法复制，支持浅拷贝和指定字段更新。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义模型 User
class User(BaseModel):
    # 字段 id，类型 int
    id: int
    # 字段 name，类型 str
    name: str
    # 字段 tags，类型 list[str]
    tags: list[str] = []

# 实例化
u = User(id=1, name="alice", tags=["a", "b"])

# === 浅拷贝 ===
u_copy = u.model_copy()
print(u_copy == u)       # 输出: True（值相同）
print(u_copy is u)       # 输出: False（不是同一个对象）
# 浅拷贝：tags 列表是共享的
print(u_copy.tags is u.tags)  # 输出: True（同一个 list 对象）

# 修改 u_copy.tags 会影响 u.tags（浅拷贝的特性）
u_copy.tags.append("c")
print(u.tags)  # 输出: ['a', 'b', 'c']（也被改了）

# === 拷贝时更新部分字段 ===
u2 = User(id=1, name="alice", tags=["x"])
# 拷贝并更新 id 和 name
u2_copy = u2.model_copy(update={"id": 2, "name": "bob"})
print(u2_copy.id)    # 输出: 2（被更新）
print(u2_copy.name)  # 输出: bob（被更新）
print(u2_copy.tags)  # 输出: ['x']（未更新）

# === 深拷贝：用 copy.deepcopy ===
import copy
u3 = User(id=3, name="carol", tags=["a", "b"])
# 深拷贝：所有嵌套对象都复制一份
u3_deep = copy.deepcopy(u3)
print(u3_deep.tags is u3.tags)  # 输出: False（不同的 list 对象）
# 修改 u3_deep.tags 不影响 u3.tags
u3_deep.tags.append("c")
print(u3.tags)  # 输出: ['a', 'b']（不受影响）
\`\`\`

**model_copy(update={...}) 的典型用途**：在业务逻辑中基于一个模型实例创建一个略有不同的副本，避免手动重新构造所有字段。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义模型 User
class User(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str
    # 字段 status
    status: str = "active"

# 原始用户
u = User(id=1, name="alice", status="active")
# 创建一个禁用状态的副本（不改原对象）
u_banned = u.model_copy(update={"status": "banned"})
print(u.status)       # 输出: active（原对象不变）
print(u_banned.status)  # 输出: banned
\`\`\`

## JSON Schema 自定义

Pydantic 自动为每个模型生成 JSON Schema，FastAPI 用它生成 OpenAPI 文档。可以用 \`json_schema_extra\` 添加自定义信息。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ConfigDict
from pydantic import BaseModel, Field, ConfigDict

# 定义模型 User
class User(BaseModel):
    # 模型配置：添加自定义 Schema 信息
    model_config = ConfigDict(
        json_schema_extra={
            # 自定义 examples（FastAPI 文档会显示）
            "examples": [
                {"id": 1, "name": "alice", "age": 25},
                {"id": 2, "name": "bob", "age": 30},
            ]
        }
    )
    # 字段 id，类型 int，带描述和示例
    id: int = Field(description="用户 ID", examples=[1, 2, 3])
    # 字段 name，类型 str，带描述、示例、最小长度
    name: str = Field(
        description="用户名",
        min_length=2,
        max_length=20,
        examples=["alice", "bob"],
    )
    # 字段 age，类型 int，带约束
    age: int = Field(ge=0, le=150, description="年龄", examples=[25, 30])

# 获取 JSON Schema
import json
schema = User.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
# 输出包含:
# {
#   "properties": {
#     "id": {"description": "用户 ID", "examples": [1, 2, 3], "type": "integer"},
#     "name": {"description": "用户名", "examples": ["alice", "bob"], ...},
#     "age": {"description": "年龄", "examples": [25, 30], ...}
#   },
#   "examples": [{"id": 1, "name": "alice", "age": 25}, ...]
# }
\`\`\`

### 用 Field 的 json_schema_extra

\`\`\`python
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 定义模型 Product
class Product(BaseModel):
    # 字段 id，带字段级别的 json_schema_extra
    id: int = Field(
        json_schema_extra={
            "x-order": 1,  # 自定义 OpenAPI 扩展字段
            "x-readOnly": True,  # 标记为只读（响应里有，请求里没有）
        }
    )
    # 字段 name
    name: str = Field(json_schema_extra={"x-order": 2})

# 在 FastAPI 中，这些自定义字段会出现在 OpenAPI 文档里
# 前端可以根据 x-order 控制字段显示顺序
\`\`\`

## Generic 泛型模型

泛型模型允许定义可复用的数据结构，类型参数在实例化时确定。最经典的场景是分页响应：\`Page[User]\`、\`Page[Product]\` 用同一个分页模型。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Generic、TypeVar
# Generic 是泛型基类，继承后类变成泛型类
# TypeVar 是类型变量，表示一个"待确定的类型"
from typing import Generic, TypeVar

# 定义类型变量 T，表示泛型类型参数
# T 是一个占位符，实例化时用具体类型替换
# 如 Response[User] 中 T 被替换为 User，Response[str] 中 T 被替换为 str
# TypeVar('T') 中的 'T' 是名字，约定用大写字母
T = TypeVar('T')

# 定义泛型响应包装模型 Response
# 继承 BaseModel 和 Generic[T]，表示这是一个泛型模型
# Generic[T] 让 Response 变成"参数化类型"，可以用 Response[具体类型] 实例化
class Response(BaseModel, Generic[T]):
    # 字段 code，类型 int（状态码）
    code: int
    # 字段 message，类型 str（消息）
    message: str
    # 字段 data，类型 T（泛型数据）
    # T 是类型变量，实例化时确定具体类型
    # Response[User] 时 data 是 User 类型
    # Response[str] 时 data 是 str 类型
    data: T

# 定义用户模型
class User(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str

# 实例化：Response[User]，data 是 User 类型
resp = Response[User](code=200, message="ok", data={"id": 1, "name": "alice"})
# data 自动转成 User 实例
print(resp.data)        # 输出: id=1 name='alice'
print(type(resp.data))  # 输出: <class 'User'>

# 实例化：Response[str]，data 是 str 类型
resp2 = Response[str](code=200, message="ok", data="hello")
print(resp2.data)       # 输出: hello
print(type(resp2.data)) # 输出: <class 'str'>

# 序列化
print(resp.model_dump_json())
# 输出: {"code":200,"message":"ok","data":{"id":1,"name":"alice"}}
\`\`\`

### 泛型模型的类型检查

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Generic、TypeVar、list
from typing import Generic, TypeVar, list

# 定义类型变量 T
T = TypeVar('T')

# 定义泛型列表响应模型 ListResponse
class ListResponse(BaseModel, Generic[T]):
    # 字段 items，类型 list[T]
    items: list[T]
    # 字段 total，类型 int
    total: int

# 定义产品模型
class Product(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str

# 用 ListResponse[Product] 包装产品列表
products = [
    Product(id=1, name="手机"),
    Product(id=2, name="电脑"),
]
# 实例化泛型响应
resp = ListResponse[Product](items=products, total=2)
print(resp.model_dump_json())
# 输出: {"items":[{"id":1,"name":"手机"},{"id":2,"name":"电脑"}],"total":2}

# data 类型校验：传错类型会报错
try:
    # Product 要求 id 是 int，传字符串 "abc" 会失败
    ListResponse[Product](items=[{"id": "abc", "name": "x"}], total=1)
except Exception:
    print("类型校验失败")  # 输出
\`\`\`

## 实战：通用分页响应模型

综合本章知识，实现一个完整的通用分页响应模型，包含泛型数据、计算字段、JSON Schema 自定义。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ConfigDict、computed_field
from pydantic import BaseModel, Field, ConfigDict, computed_field
# 从 typing 导入 Generic、TypeVar、list
from typing import Generic, TypeVar, list

# 定义类型变量 T
T = TypeVar('T')

# 定义分页请求参数模型 PageParams
class PageParams(BaseModel):
    # 字段 page，类型 int，默认 1，最小 1
    page: int = Field(default=1, ge=1, description="页码，从 1 开始")
    # 字段 size，类型 int，默认 10，范围 1~100
    size: int = Field(default=10, ge=1, le=100, description="每页数量，1-100")

# 定义通用分页响应模型 PageResponse
class PageResponse(BaseModel, Generic[T]):
    # 泛型基类
    # 模型配置
    model_config = ConfigDict(
        # 自定义 Schema 示例
        json_schema_extra={
            "examples": [
                {
                    "items": [{"id": 1, "name": "alice"}],
                    "total": 100,
                    "page": 1,
                    "size": 10,
                    "total_pages": 10,
                    "has_next": True,
                }
            ]
        }
    )
    # 字段 items，类型 list[T]（当前页的数据列表）
    items: list[T] = Field(description="当前页数据")
    # 字段 total，类型 int（总记录数）
    total: int = Field(ge=0, description="总记录数")
    # 字段 page，类型 int（当前页码）
    page: int = Field(ge=1, description="当前页码")
    # 字段 size，类型 int（每页数量）
    size: int = Field(ge=1, description="每页数量")

    # 计算字段：总页数
    # @computed_field 装饰的方法会作为字段出现在 model_dump() 里
    # 但它是只读的，不能在实例化时传值
    @computed_field
    def total_pages(self) -> int:
        # 总页数 = 向上取整(总数 / 每页大小)
        # (self.total + self.size - 1) // self.size 是整数向上取整除法
        # 例如 total=23, size=10 → (23+9)//10 = 32//10 = 3 页
        # 等价于 math.ceil(self.total / self.size)，但用整数运算避免浮点误差
        # 注意：total=0 时返回 0，不会出现负数
        return (self.total + self.size - 1) // self.size

    # 计算字段：是否有下一页
    @computed_field
    def has_next(self) -> bool:
        # 当前页 < 总页数 → 有下一页
        # 例如 page=1, total_pages=10 → True（有下一页）
        # 例如 page=10, total_pages=10 → False（最后一页）
        return self.page < self.total_pages

    # 计算字段：是否有上一页
    @computed_field
    def has_prev(self) -> bool:
        # 当前页 > 1 → 有上一页
        # 例如 page=1 → False（第一页没上一页）
        # 例如 page=2 → True
        return self.page > 1

# === 在 FastAPI 中使用 ===
from fastapi import FastAPI, Query

# 创建 FastAPI 应用
app = FastAPI()

# 定义用户模型 User
class User(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str

# 模拟数据库
MOCK_USERS = [
    User(id=i, name=f"user_{i}") for i in range(1, 101)
]  # 100 个用户

# 定义路由：分页查询用户
# response_model=PageResponse[User] 指定响应为分页模型，数据是 User 类型
# FastAPI 支持 response_model 用泛型模型参数化，会正确生成 OpenAPI 文档
@app.get("/users", response_model=PageResponse[User])
def list_users(
    # 查询参数 page，默认 1，最小 1
    # Query(default=1, ge=1) 表示默认值 1，必须 >= 1
    # 查询参数通过 URL 传递：/users?page=2&size=20
    page: int = Query(default=1, ge=1, description="页码"),
    # 查询参数 size，默认 10，范围 1~100
    # le=100 限制每页最多 100 条，防止客户端请求过多数据拖垮服务器
    size: int = Query(default=10, ge=1, le=100, description="每页数量"),
):
    # 计算分页起始位置
    # page=1 时 start=0，page=2 时 start=size，依此类推
    # 这是分页的标准公式：start = (page - 1) * size
    start = (page - 1) * size
    # 计算结束位置
    # end = start + size，切片时超出列表长度不会报错
    end = start + size
    # 切片获取当前页数据
    # MOCK_USERS[start:end] 是 Python 列表切片
    # 例如 MOCK_USERS[0:10] 取索引 0-9 的元素（共 10 个）
    # 切片是浅拷贝，返回新列表
    items = MOCK_USERS[start:end]
    # 构造分页响应
    # PageResponse[User] 实例化泛型模型，items 必须是 User 实例列表
    # total 是数据库总数，不是 len(items)（最后一页 items 可能少于 size）
    return PageResponse[User](
        items=items,
        total=len(MOCK_USERS),
        page=page,
        size=size,
    )

# 访问 /users?page=1&size=10 返回:
# {
#   "items": [{"id": 1, "name": "user_1"}, ..., {"id": 10, "name": "user_10"}],
#   "total": 100,
#   "page": 1,
#   "size": 10,
#   "total_pages": 10,
#   "has_next": true,
#   "has_prev": false
# }
\`\`\`

### 测试分页模型

\`\`\`python
# 直接测试（不通过 HTTP）
# 假设上面的模型已定义

# 构造第一页
resp1 = PageResponse[User](
    items=MOCK_USERS[0:10],
    total=100,
    page=1,
    size=10,
)
print("第 1 页:")
print("  总页数:", resp1.total_pages)  # 输出: 10
print("  有下一页:", resp1.has_next)   # 输出: True
print("  有上一页:", resp1.has_prev)   # 输出: False
print("  本页数量:", len(resp1.items)) # 输出: 10

# 构造最后一页
resp_last = PageResponse[User](
    items=MOCK_USERS[90:100],
    total=100,
    page=10,
    size=10,
)
print("第 10 页:")
print("  总页数:", resp_last.total_pages)  # 输出: 10
print("  有下一页:", resp_last.has_next)   # 输出: False
print("  有上一页:", resp_last.has_prev)   # 输出: True

# 边界情况：total=0
resp_empty = PageResponse[User](
    items=[],
    total=0,
    page=1,
    size=10,
)
print("空结果:")
print("  总页数:", resp_empty.total_pages)  # 输出: 0
print("  有下一页:", resp_empty.has_next)   # 输出: False

# 序列化为 JSON
import json
print(json.dumps(resp1.model_dump(), indent=2, ensure_ascii=False, default=str))
\`\`\`

## 其他高级特性

### 私有字段

以**下划线开头**的字段是私有的，不会出现在 model_dump 里。

\`\`\`python
# 从 pydantic 导入 BaseModel 和 PrivateAttr
from pydantic import BaseModel, PrivateAttr

# 定义模型 Counter
class Counter(BaseModel):
    # 公开字段 count
    # 公开字段会出现在 model_dump() 输出里，也能从外部输入设置
    count: int = 0
    # 私有字段 _secret（用 PrivateAttr 声明）
    # PrivateAttr 声明的字段特点：
    # - 不会出现在 model_dump() 输出里（不参与序列化）
    # - 不能从外部输入设置（防止客户端注入）
    # - 只能在代码内部修改（如 self._secret = "new_value"）
    # 适合存储缓存、内部状态、敏感中间数据
    _secret: str = PrivateAttr(default="hidden")
    # 私有字段 _cache（可变默认值）
    # 用 default_factory=dict 而非 default={}
    # 因为可变默认值必须用 factory，每次实例化生成新对象
    # 避免多个实例共享同一个 dict 的问题
    _cache: dict = PrivateAttr(default_factory=dict)

# 实例化
c = Counter(count=10)
# 私有字段可以访问
print(c._secret)  # 输出: hidden
print(c._cache)   # 输出: {}
# 但不会出现在 model_dump 里
print(c.model_dump())  # 输出: {'count': 10}（没有 _secret 和 _cache）

# 私有字段不会被外部输入影响
c2 = Counter(count=1, _secret="hack")  # _secret 不会被设置
print(c2._secret)  # 输出: hidden（还是默认值）
\`\`\`

### 模型嵌套与递归

Pydantic 支持模型自引用（递归）和相互嵌套。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Optional、list
from typing import Optional, list

# 定义树节点模型 TreeNode（自引用）
class TreeNode(BaseModel):
    # 字段 value，类型 int
    value: int
    # 字段 left，类型 Optional[TreeNode]（左子树，递归引用）
    left: Optional['TreeNode'] = None
    # 字段 right，类型 Optional[TreeNode]（右子树）
    right: Optional['TreeNode'] = None

# 构造一棵树
#     1
#    / \\
#   2   3
tree = TreeNode(
    value=1,
    left=TreeNode(value=2),
    right=TreeNode(value=3),
)
print(tree.model_dump())
# 输出: {'value': 1, 'left': {'value': 2, 'left': None, 'right': None},
#        'right': {'value': 3, 'left': None, 'right': None}}

# 访问嵌套字段
print(tree.left.value)   # 输出: 2
print(tree.right.value)  # 输出: 3
\`\`\`

### 模型方法与类方法

Pydantic 模型可以像普通类一样定义方法。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 定义模型 User
class User(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str
    # 字段 age
    age: int

    # 实例方法
    def greet(self) -> str:
        # 返回问候语
        return f"Hello, I'm {self.name}, {self.age} years old."

    # 类方法：替代构造函数
    @classmethod
    def from_string(cls, s: str) -> 'User':
        # 从 "id,name,age" 格式字符串创建
        parts = s.split(',')
        # 调用 cls 构造
        return cls(id=int(parts[0]), name=parts[1], age=int(parts[2]))

    # 静态方法
    @staticmethod
    def is_adult(age: int) -> bool:
        # 判断是否成年
        return age >= 18

# 使用实例方法
u = User(id=1, name="alice", age=25)
print(u.greet())  # 输出: Hello, I'm alice, 25 years old.

# 使用类方法
u2 = User.from_string("2,bob,30")
print(u2.model_dump())  # 输出: {'id': 2, 'name': 'bob', 'age': 30}

# 使用静态方法
print(User.is_adult(25))  # 输出: True
print(User.is_adult(15))  # 输出: False
\`\`\`

## 小结

本章介绍了 Pydantic 的模型配置与高级特性：

1. **model_config = ConfigDict(...)**：统一配置模型，替代 v1 的 class Config。
2. **全局配置**：str_strip_whitespace、str_min_length、validate_assignment 等。
3. **extra 模式**：'ignore'（默认）/ 'forbid' / 'allow'。
4. **alias 别名**：解决命名冲突，AliasChoices 支持多别名，AliasPath 支持嵌套路径。
5. **computed_field**：基于其他字段计算得出的只读字段，出现在序列化结果中。
6. **model_fields / model_fields_set**：查看模型字段定义和实例化时显式传入的字段集合。
7. **model_copy**：浅拷贝并支持 update 参数更新部分字段。
8. **JSON Schema 自定义**：用 json_schema_extra 添加 examples、description 等。
9. **Generic 泛型模型**：定义可复用的数据结构，如 PageResponse[T]。
10. **私有字段**：PrivateAttr 声明的字段不参与序列化和外部输入。
11. **递归模型**：支持自引用，实现树形结构。
12. **实战**：通用分页响应模型，结合泛型、计算字段、Schema 自定义。

至此，Pydantic 数据校验的 4 章内容已经全部完成。你现在已经掌握了 Pydantic 的核心用法，能够用它定义复杂的数据模型、编写自定义校验逻辑、配置模型行为，并与 FastAPI 无缝集成。下一批章节我们将进入 FastAPI 的依赖注入系统，学习如何组织可复用的业务逻辑。
`
  }
];
