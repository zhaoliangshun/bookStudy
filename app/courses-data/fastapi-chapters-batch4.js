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

## 生活类比：Pydantic 像海关检查站

把数据流入程序想象成旅客入境，Pydantic 就是海关检查站，分多道关卡：

| 关卡 | 海关对应 | Pydantic 对应 | 作用 |
|------|---------|--------------|------|
| 第一道 | 查验护照是否齐全 | **必填字段检查** | 缺字段就拒绝入境 |
| 第二道 | X 光机扫描行李 | **类型校验与转换** | "30" 字符串自动转成 30 数字 |
| 第三道 | 限重 / 限尺寸 | **Field 约束**（gt/ge/lt/le/min_length） | 数值范围、长度限制 |
| 第四道 | 海关人员人工问询 | **自定义校验器** | 业务规则（如年龄不能为负） |
| 第五道 | 盖章放行 / 拒绝入境 | **实例化成功 / 抛 ValidationError** | 通过就得到模型实例 |

记住这个比喻：**类型注解是护照，Field 是限重牌，校验器是海关人员，ValidationError 是遣返通知**。后面学到类型、约束、校验器时都可以对应起来理解。

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

## 渐进式 Demo：配置文件加载（环境变量 + 字典）

实际项目里，配置来源五花八门：环境变量、YAML、JSON、命令行参数。用 Pydantic 模型统一管理配置，可以让校验和默认值都在一处定义。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ConfigDict
from pydantic import BaseModel, Field, ConfigDict
# 导入 os 模块，用于读取环境变量
import os

# 定义数据库配置模型 DatabaseConfig
class DatabaseConfig(BaseModel):
    # 模型配置：禁止额外字段，防止配置文件写错键名
    model_config = ConfigDict(extra='forbid')
    # 字段 host，类型 str，默认 'localhost'
    host: str = "localhost"
    # 字段 port，类型 int，默认 5432，范围 1~65535
    # 端口号范围是 0~65535，但 0 被 OS 保留，实际可用 1~65535
    port: int = Field(default=5432, ge=1, le=65535)
    # 字段 username，类型 str
    username: str
    # 字段 password，类型 str
    password: str
    # 字段 pool_size，类型 int，默认 5，范围 1~100
    # 连接池大小，太小会频繁建连，太大会占用数据库连接
    pool_size: int = Field(default=5, ge=1, le=100)

# 定义应用配置模型 AppConfig
class AppConfig(BaseModel):
    # 字段 app_name，类型 str
    app_name: str
    # 字段 debug，类型 bool，默认 False
    debug: bool = False
    # 字段 database，类型 DatabaseConfig（嵌套模型）
    database: DatabaseConfig
    # 字段 allowed_origins，类型 list[str]，默认值用 default_factory
    # 可变默认值必须用 default_factory，否则多个实例会共享同一个 list
    allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

# === 从字典加载配置（模拟从 YAML 读取） ===
config_dict = {
    "app_name": "my-api",
    "debug": True,
    "database": {
        "host": "db.example.com",
        "port": 5432,
        "username": "admin",
        "password": "secret",
        "pool_size": 20,
    },
    "allowed_origins": ["https://example.com"],
}
# 用 model_validate 从字典创建配置对象
# 如果配置里有多余字段会报错（extra='forbid'）
config = AppConfig.model_validate(config_dict)
print(config.app_name)                  # 输出: my-api
print(config.database.host)             # 输出: db.example.com
print(config.database.pool_size)        # 输出: 20
# 嵌套模型也被自动校验和创建
print(type(config.database))            # 输出: <class 'DatabaseConfig'>

# === 从环境变量加载配置（简化演示） ===
# 实际项目推荐用 pydantic-settings 库，能自动读环境变量
os.environ["APP_NAME"] = "prod-api"
os.environ["DB_HOST"] = "prod-db.internal"
os.environ["DB_PORT"] = "6543"

# 手动从环境变量构造字典
env_config = {
    "app_name": os.environ.get("APP_NAME", "default"),
    "database": {
        "host": os.environ.get("DB_HOST", "localhost"),
        "port": int(os.environ.get("DB_PORT", "5432")),  # 环境变量是 str，要转 int
        "username": os.environ.get("DB_USER", "root"),
        "password": os.environ.get("DB_PASSWORD", ""),
    },
}
config_from_env = AppConfig.model_validate(env_config)
print(config_from_env.app_name)            # 输出: prod-api
print(config_from_env.database.port)       # 输出: 6543

# === 校验失败演示：端口超出范围 ===
try:
    AppConfig.model_validate({
        "app_name": "x",
        "database": {
            "username": "u",
            "password": "p",
            "port": 99999,  # 超出 65535
        },
    })
except Exception as e:
    print("端口超出范围")  # 输出
\`\`\`

**要点**：嵌套模型（\`database: DatabaseConfig\`）会被递归校验，无需手写嵌套字典的校验逻辑。这是 Pydantic 的"声明式"威力的体现。

## 渐进式 Demo：数据迁移工具（CSV 行 → 模型）

数据迁移是 Pydantic 的经典应用：从老系统导出的 CSV/JSON 数据往往是"脏"的（类型混乱、字段缺失、有空格），用 Pydantic 模型一次性完成清洗和校验。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ConfigDict、field_validator
from pydantic import BaseModel, Field, ConfigDict, field_validator
# 从 datetime 导入 datetime
from datetime import datetime

# 定义用户导入模型 UserImport
class UserImport(BaseModel):
    # 模型配置：自动去字符串首尾空格
    model_config = ConfigDict(str_strip_whitespace=True)
    # 字段 id，类型 int（CSV 里是字符串，会自动转）
    id: int
    # 字段 name，类型 str，长度 1~50
    name: str = Field(min_length=1, max_length=50)
    # 字段 email，类型 str
    email: str
    # 字段 age，类型 int，范围 0~150
    age: int = Field(ge=0, le=150)
    # 字段 created_at，类型 datetime
    # CSV 里日期通常是字符串，Pydantic 会自动解析 ISO 格式
    created_at: datetime

    # 字段校验器：清洗 email（去空格 + 转小写）
    # mode='after' 表示在类型转换后执行，此时 v 已经是 str
    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        # 去空格 + 转小写，统一格式
        return v.strip().lower()

# === 模拟从 CSV 读取的脏数据 ===
# 实际项目用 csv.DictReader 读取，每行是一个字典
csv_rows = [
    # 正常数据
    {"id": "1", "name": "  Alice  ", "email": "  ALICE@Example.COM  ", "age": "25", "created_at": "2026-01-15T10:00:00"},
    # 年龄是字符串
    {"id": "2", "name": "Bob", "email": "bob@test.com", "age": "30", "created_at": "2026-02-20T08:30:00"},
    # 邮箱带空格
    {"id": "3", "name": "  Carol  ", "email": "  carol@x.com  ", "age": "28", "created_at": "2026-03-10T14:00:00"},
]

# === 批量转换 + 收集错误 ===
# 迁移工具的经典模式：成功的入库，失败的记录错误日志
success_users = []    # 成功转换的用户列表
failed_rows = []      # 失败的行（带错误信息）

for i, row in enumerate(csv_rows, start=1):
    try:
        # model_validate 会做：类型转换 + 约束校验 + 自定义校验器
        user = UserImport.model_validate(row)
        success_users.append(user)
    except Exception as e:
        # 失败的行不影响其他行，继续处理
        failed_rows.append({"row": i, "error": str(e), "data": row})

# 检查成功转换的结果
print(f"成功: {len(success_users)} 条, 失败: {len(failed_rows)} 条")
for u in success_users:
    # email 已被清洗（去空格 + 转小写）
    print(f"  id={u.id}, name={u.name!r}, email={u.email!r}")

# === 模拟脏数据导致失败的行 ===
bad_rows = [
    # 年龄超出范围
    {"id": "10", "name": "X", "email": "x@x.com", "age": "200", "created_at": "2026-01-01"},
    # 缺少必填字段
    {"id": "11", "name": "Y", "email": "y@y.com", "created_at": "2026-01-01"},
    # 日期格式错误
    {"id": "12", "name": "Z", "email": "z@z.com", "age": "20", "created_at": "not-a-date"},
]

for i, row in enumerate(bad_rows, start=1):
    try:
        UserImport.model_validate(row)
        print(f"行 {i}: 通过（不应该）")
    except Exception as e:
        # 错误信息会指明具体哪个字段、什么原因
        print(f"行 {i}: 失败（预期）")
\`\`\`

**迁移工具的核心思想**：**逐行处理 + 错误隔离**。一行失败不影响其他行，最后生成报告。Pydantic 让"校验 + 清洗 + 转换"三件事在一次 \`model_validate\` 调用里完成。

## 渐进式 Demo：统一 API 响应包装

实际项目中，API 响应通常需要统一的包装格式（code + message + data）。用 Pydantic 模型定义响应包装，能让所有接口的响应结构一致。

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Generic、TypeVar（用于泛型响应）
from typing import Generic, TypeVar

# 定义类型变量 T，表示响应数据的类型
# TypeVar 是类型占位符，实例化时用具体类型替换
T = TypeVar('T')

# 定义统一响应模型 ApiResponse
# 继承 BaseModel 和 Generic[T]，让它成为泛型模型
class ApiResponse(BaseModel):
    # 字段 code，类型 int（业务状态码，200 表示成功）
    code: int
    # 字段 message，类型 str（提示信息）
    message: str
    # 字段 data，类型 T（泛型数据）
    # T 在实例化时确定：ApiResponse[User] 的 data 是 User 类型
    data: T

# 定义用户模型 User
class User(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str

# 定义商品模型 Product
class Product(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str
    # 字段 price
    price: float

# === 包装用户数据 ===
# ApiResponse[User] 表示 data 字段是 User 类型
user = User(id=1, name="alice")
resp = ApiResponse[User](code=200, message="success", data=user)
print(resp.model_dump_json())
# 输出: {"code":200,"message":"success","data":{"id":1,"name":"alice"}}

# === 包装商品数据 ===
# 同一个 ApiResponse 模型可以包装不同类型的数据
product = Product(id=101, name="手机", price=1999.0)
resp2 = ApiResponse[Product](code=200, message="success", data=product)
print(resp2.model_dump_json())
# 输出: {"code":200,"message":"success","data":{"id":101,"name":"手机","price":1999.0}}

# === 包装列表数据 ===
# data 也可以是列表，用 list[User] 作为类型参数
users = [User(id=1, name="alice"), User(id=2, name="bob")]
resp3 = ApiResponse[list[User]](code=200, message="success", data=users)
print(resp3.model_dump_json())
# 输出: {"code":200,"message":"success","data":[{"id":1,"name":"alice"},{"id":2,"name":"bob"}]}

# === 错误响应 ===
# data 为 None 时表示错误
resp_err = ApiResponse[None](code=404, message="用户不存在", data=None)
print(resp_err.model_dump_json())
# 输出: {"code":404,"message":"用户不存在","data":null}
\`\`\`

**泛型响应的价值**：定义一次 \`ApiResponse[T]\`，所有接口复用，前端拿到统一结构，便于封装 HTTP 客户端。FastAPI 的 \`response_model=ApiResponse[User]\` 还能自动生成正确的 OpenAPI 文档。

## 常见错误

### 错误 1：忘记 \`@classmethod\`

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# ❌ 错误写法：忘记加 @classmethod
# class Bad(BaseModel):
#     age: int
#     @field_validator('age')
#     def check_age(v: int) -> int:  # 缺少 cls 参数和 @classmethod
#         if v < 0:
#             raise ValueError('负数')
#         return v
# 报错：field_validator 必须是类方法

# ✅ 正确写法：加 @classmethod，第一个参数是 cls
class Good(BaseModel):
    # 字段 age
    age: int
    # @field_validator 装饰器
    @field_validator('age')
    # @classmethod 必须紧贴在方法上方
    @classmethod
    # 第一个参数是 cls（类本身），第二个是字段值 v
    def check_age(cls, v: int) -> int:
        # 校验逻辑
        if v < 0:
            raise ValueError('年龄不能为负')
        # 必须返回值
        return v
\`\`\`

### 错误 2：校验器忘记 return

\`\`\`python
# 从 pydantic 导入 BaseModel 和 field_validator
from pydantic import BaseModel, field_validator

# ❌ 错误写法：校验通过但没返回值
# class Bad(BaseModel):
#     name: str
#     @field_validator('name')
#     @classmethod
#     def check(cls, v: str) -> str:
#         if len(v) < 2:
#             raise ValueError('太短')
#         # 忘记 return v，结果 name 变成 None
# 结果：u.name 是 None，而不是原值

# ✅ 正确写法：所有路径都要返回值
class Good(BaseModel):
    # 字段 name
    name: str
    # 校验器
    @field_validator('name')
    @classmethod
    def check(cls, v: str) -> str:
        # 校验失败抛异常
        if len(v) < 2:
            raise ValueError('太短')
        # 校验通过必须返回值
        return v
\`\`\`

### 错误 3：可变默认值共享

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# Pydantic v2 会深拷贝默认值，所以这个写法是安全的
class SafeModel(BaseModel):
    # 字段 tags，默认空列表
    tags: list[str] = []

# 两个实例的 tags 是不同的 list 对象
m1 = SafeModel()
m2 = SafeModel()
m1.tags.append("a")
print(m2.tags)  # 输出: []（不受影响，因为 Pydantic 深拷贝了默认值）

# 但如果用 default_factory 传可调用对象更明确
from pydantic import Field
class BetterModel(BaseModel):
    # 用 default_factory=list 更清晰，明确表示每次实例化都生成新 list
    tags: list[str] = Field(default_factory=list)
\`\`\`

### 错误 4：混淆 model_dump 和 dict()

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

u = User(name="alice", age=25)

# ✅ v2 用 model_dump()
print(u.model_dump())  # 输出: {'name': 'alice', 'age': 25}

# ❌ v1 的 dict() 在 v2 中已废弃（虽然还能用，但会有警告）
# u.dict()  # DeprecationWarning
\`\`\`

## 动手实验

### 实验 1：定义一个书籍模型

定义一个 \`Book\` 模型，包含：\`title\`（str，必填）、\`author\`（str，必填）、\`price\`（float，必须 > 0）、\`isbn\`（str，可选）、\`tags\`（list[str]，默认空列表）。实例化并序列化为 JSON。

参考答案：

\`\`\`python
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 定义书籍模型 Book
class Book(BaseModel):
    # 字段 title，类型 str，必填
    title: str
    # 字段 author，类型 str，必填
    author: str
    # 字段 price，类型 float，必须 > 0
    # gt=0 表示严格大于 0，不接受 0
    price: float = Field(gt=0, description="价格，必须大于 0")
    # 字段 isbn，类型 Optional[str]，可选
    isbn: str | None = None
    # 字段 tags，类型 list[str]，默认空列表
    tags: list[str] = Field(default_factory=list)

# 实例化
book = Book(
    title="Python 入门",
    author="Guido",
    price=59.9,
    isbn="978-7-111-12345-6",
    tags=["编程", "Python"],
)
# 序列化为 JSON
print(book.model_dump_json())
# 输出: {"title":"Python 入门","author":"Guido","price":59.9,"isbn":"978-7-111-12345-6","tags":["编程","Python"]}
\`\`\`

### 实验 2：从字典创建模型并处理错误

写一段代码，从外部字典创建 \`User\` 模型，捕获 \`ValidationError\` 并打印出每个错误的 \`loc\` 和 \`msg\`。

参考答案：

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、ValidationError
from pydantic import BaseModel, Field, ValidationError

# 定义用户模型 User
class User(BaseModel):
    # 字段 name，长度 2~20
    name: str = Field(min_length=2, max_length=20)
    # 字段 age，范围 0~150
    age: int = Field(ge=0, le=150)
    # 字段 email
    email: str

# 模拟外部输入（有多处错误）
bad_data = {
    "name": "a",         # 太短
    "age": 200,          # 太大
    "email": "not-email" # 这个字段没有约束，不会报错
}

# 捕获 ValidationError 并打印详细信息
try:
    User.model_validate(bad_data)
except ValidationError as e:
    # e.errors() 返回错误列表，每个错误是一个字典
    for err in e.errors():
        # loc 是错误位置（元组），如 ('name',)
        # msg 是错误消息
        # type 是错误类型
        loc = '.'.join(str(x) for x in err['loc'])  # 把元组拼成字符串
        print(f"字段: {loc}, 错误: {err['msg']}")
# 输出:
# 字段: name, 错误: String should have at least 2 characters
# 字段: age, 错误: Input should be less than or equal to 150
\`\`\`

### 实验 3：实现不可变配置模型

定义一个 \`ServerConfig\` 模型，开启 \`frozen=True\`，包含 \`host\` 和 \`port\`。尝试创建实例后修改字段，观察错误。再把两个相同值的实例放进 set，观察去重效果。

参考答案：

\`\`\`python
# 从 pydantic 导入 BaseModel 和 ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义不可变配置模型
class ServerConfig(BaseModel):
    # 开启 frozen，模型不可变
    model_config = ConfigDict(frozen=True)
    # 字段 host
    host: str
    # 字段 port
    port: int

# 创建实例
c1 = ServerConfig(host="localhost", port=8080)
c2 = ServerConfig(host="localhost", port=8080)
c3 = ServerConfig(host="remote", port=9000)

# 尝试修改字段会失败
try:
    c1.port = 9090  # frozen 模型不能修改
except Exception as e:
    print("修改失败:", type(e).__name__)  # 输出: ValidationError

# 相同值的实例被视为相等
print(c1 == c2)  # 输出: True

# 放进 set 自动去重
configs = {c1, c2, c3}
print(len(configs))  # 输出: 2（c1 和 c2 相等，去重后剩 2 个）

# 可以作为字典键
cache = {c1: "running", c3: "stopped"}
print(cache[c2])  # 输出: running（c2 和 c1 相等，能查到）
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
10. **配置加载、数据迁移、API 响应包装** 是 Pydantic 在实战中的三大经典场景。

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

## 生活类比：类型校验像安检仪器

继续用海关的比喻：上一章的 BaseModel 是海关入口，本章的字段类型就是各种**安检仪器**：

| 安检仪器 | Pydantic 类型 | 检查内容 |
|---------|--------------|---------|
| 身份证扫描仪 | \`str\` / \`int\` / \`float\` | 基础身份（数字、字符串） |
| 指纹识别 | \`bool\` | 二值判断（是/否） |
| 时间戳读卡器 | \`datetime\` / \`date\` | 时间合法性 |
| 唯一编号扫描 | \`UUID\` | 全球唯一标识 |
| 精密天平 | \`Decimal\` | 高精度金额（不能有误差） |
| 行李分拣机 | \`list\` / \`dict\` / \`set\` / \`tuple\` | 集合类内容 |
| 选项卡 | \`Literal\` / \`Enum\` | 只能选预设选项 |
| 多功能检测仪 | \`Union\` / \`Optional\` | 多种类型都能接受 |

**核心理念**：选对仪器（类型），数据合法性自动得到保证。声明 \`port: int\` 就是在说"这个字段过的是整数安检仪"。

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

## 渐进式 Demo：订单状态枚举实战

电商系统里订单状态流转是经典场景：待支付 → 已支付 → 已发货 → 已签收 / 已取消。用 \`Enum\` 定义状态，用 \`Literal\` 定义事件，实现状态机校验。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field
from pydantic import BaseModel, Field
# 从 enum 导入 Enum
from enum import Enum
# 从 datetime 导入 datetime
from datetime import datetime
# 从 uuid 导入 UUID, uuid4
from uuid import UUID, uuid4

# === 用 Enum 定义订单状态 ===
# 继承 str 让枚举成员本身是字符串，方便 JSON 序列化
class OrderStatus(str, Enum):
    # 待支付
    PENDING = "pending"
    # 已支付
    PAID = "paid"
    # 已发货
    SHIPPED = "shipped"
    # 已签收
    DELIVERED = "delivered"
    # 已取消
    CANCELLED = "cancelled"

# 定义订单模型 Order
class Order(BaseModel):
    # 字段 id，类型 UUID，自动生成
    id: UUID = Field(default_factory=uuid4)
    # 字段 status，类型 OrderStatus（枚举）
    # 传入字符串 "paid" 会自动转成 OrderStatus.PAID
    status: OrderStatus = OrderStatus.PENDING
    # 字段 amount，类型 float，必须 > 0
    amount: float = Field(gt=0)
    # 字段 created_at，类型 datetime，自动生成
    created_at: datetime = Field(default_factory=datetime.now)
    # 字段 paid_at，类型 Optional[datetime]，支付后才有
    paid_at: datetime | None = None

# 实例化：用字符串创建（自动转枚举）
order = Order(amount=99.9)
print(order.status)               # 输出: OrderStatus.PENDING
print(order.status.value)         # 输出: pending
print(order.status == "pending")  # 输出: True（因为继承 str）

# 用字符串修改状态
order.status = "paid"  # 自动转枚举
print(order.status)    # 输出: OrderStatus.PAID

# 序列化时枚举自动转成字符串
print(order.model_dump_json())
# 输出类似: {"id":"...","status":"paid","amount":99.9,"created_at":"...","paid_at":null}

# === 非法状态校验 ===
try:
    Order(amount=10, status="unknown")  # 不在枚举里
except Exception:
    print("状态非法")  # 输出

# === 遍历枚举所有成员 ===
# Enum 支持循环，Literal 不支持
for s in OrderStatus:
    print(s.name, "->", s.value)
# 输出:
# PENDING -> pending
# PAID -> paid
# ...
\`\`\`

**Enum vs Literal 的选择**：状态少且固定用 \`Literal\`（简单）；状态多、需要遍历、需要方法用 \`Enum\`（强大）。

## 渐进式 Demo：自定义手机号 / 身份证号类型复用

用 \`Annotated + AfterValidator\` 定义可复用的自定义类型，比每个字段都写校验器更优雅。

\`\`\`python
# 从 pydantic 导入 BaseModel、AfterValidator
from pydantic import BaseModel, AfterValidator
# 从 typing 导入 Annotated
from typing import Annotated
# 导入 re 模块（正则表达式）
import re

# === 自定义中国手机号类型 ===
# 校验函数：校验 11 位手机号
def validate_phone(v: str) -> str:
    # 去空格
    v = v.strip()
    # 中国手机号正则：1 开头，第二位 3-9，共 11 位数字
    if not re.match(r'^1[3-9]\d{9}$', v):
        raise ValueError(f'手机号格式错误: {v}')
    # 返回校验后的值
    return v

# 定义自定义类型 PhoneNumber
# Annotated[str, AfterValidator(validate_phone)] 表示：
# 基础类型 str + 校验函数 validate_phone
PhoneNumber = Annotated[str, AfterValidator(validate_phone)]

# === 自定义身份证号类型（简化版） ===
def validate_id_card(v: str) -> str:
    # 去空格并转大写（身份证号最后一位可能是 X）
    v = v.strip().upper()
    # 18 位身份证号正则：前 17 位数字，最后一位数字或 X
    if not re.match(r'^\d{17}[\dX]$', v):
        raise ValueError(f'身份证号格式错误: {v}')
    # 返回校验后的值
    return v

# 定义自定义类型 IDCard
IDCard = Annotated[str, AfterValidator(validate_id_card)]

# === 自定义非负整数类型 ===
def validate_non_negative(v: int) -> int:
    # 必须非负
    if v < 0:
        raise ValueError(f'必须是非负数: {v}')
    return v

# 定义自定义类型 NonNegInt
NonNegInt = Annotated[int, AfterValidator(validate_non_negative)]

# === 在多个模型中复用 ===
class User(BaseModel):
    # 字段 name，类型 str
    name: str
    # 字段 phone，类型 PhoneNumber（复用自定义类型）
    phone: PhoneNumber
    # 字段 id_card，类型 IDCard
    id_card: IDCard
    # 字段 age，类型 NonNegInt
    age: NonNegInt

class Employee(BaseModel):
    # 字段 name
    name: str
    # 字段 phone，复用同一个 PhoneNumber 类型
    phone: PhoneNumber
    # 字段 employee_id
    employee_id: str
    # 字段 salary，复用 NonNegInt
    salary: NonNegInt

# 实例化：合法数据
u = User(
    name="alice",
    phone="13812345678",
    id_card="110101199001011234",
    age=25,
)
print(u.phone)    # 输出: 13812345678
print(u.id_card)  # 输出: 110101199001011234

# 身份证号带 x 也会被转大写
u2 = User(
    name="bob",
    phone="13987654321",
    id_card="11010119900101123x",  # 小写 x
    age=30,
)
print(u2.id_card)  # 输出: 11010119900101123X（转大写了）

# === 错误数据 ===
# 手机号格式错
try:
    User(name="x", phone="12345", id_card="110101199001011234", age=20)
except Exception:
    print("手机号格式错")  # 输出

# 身份证号位数不对
try:
    User(name="x", phone="13812345678", id_card="123", age=20)
except Exception:
    print("身份证号格式错")  # 输出

# 年龄为负
try:
    User(name="x", phone="13812345678", id_card="110101199001011234", age=-5)
except Exception:
    print("年龄不能为负")  # 输出
\`\`\`

**复用价值**：\`PhoneNumber\`、\`IDCard\`、\`NonNegInt\` 三个类型在 User、Employee、Customer、Vendor 等多个模型里都能直接用，校验逻辑只写一次。

## 渐进式 Demo：复杂嵌套商品评论

电商商品常有"商品 → 变体 → 评论 → 评论回复"的多层嵌套结构。用 Pydantic 嵌套模型可以优雅地表达。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field
from pydantic import BaseModel, Field
# 从 datetime 导入 datetime
from datetime import datetime
# 从 typing 导入 Optional
from typing import Optional

# === 第 1 层：评论回复模型 ===
class Reply(BaseModel):
    # 字段 id
    reply_id: int
    # 字段 content，类型 str，长度 1~500
    content: str = Field(min_length=1, max_length=500)
    # 字段 author
    author: str
    # 字段 created_at，默认当前时间
    created_at: datetime = Field(default_factory=datetime.now)

# === 第 2 层：评论模型 ===
class Review(BaseModel):
    # 字段 id
    review_id: int
    # 字段 rating，类型 int，范围 1~5（星级）
    rating: int = Field(ge=1, le=5, description="评分 1-5 星")
    # 字段 content，类型 str，长度 1~1000
    content: str = Field(min_length=1, max_length=1000)
    # 字段 author
    author: str
    # 字段 created_at
    created_at: datetime = Field(default_factory=datetime.now)
    # 字段 replies，类型 list[Reply]（嵌套模型列表）
    # 评论的回复列表，默认空列表
    replies: list[Reply] = Field(default_factory=list)

# === 第 3 层：商品变体模型 ===
class Variant(BaseModel):
    # 字段 sku_id
    sku_id: str
    # 字段 name（如"红色 64G"）
    name: str
    # 字段 price，类型 float，必须 > 0
    price: float = Field(gt=0)
    # 字段 stock，类型 int，必须 >= 0
    stock: int = Field(ge=0)

# === 第 4 层：商品模型 ===
class Product(BaseModel):
    # 字段 id
    product_id: int
    # 字段 name，类型 str，长度 1~100
    name: str = Field(min_length=1, max_length=100)
    # 字段 description，可选
    description: Optional[str] = None
    # 字段 variants，类型 list[Variant]（变体列表）
    variants: list[Variant] = Field(default_factory=list)
    # 字段 reviews，类型 list[Review]（评论列表）
    reviews: list[Review] = Field(default_factory=list)

# === 实例化：构造一个完整商品 ===
product = Product(
    product_id=1001,
    name="iPhone 16",
    description="新款智能手机",
    variants=[
        {"sku_id": "iphone16-128", "name": "128G 黑色", "price": 7999.0, "stock": 100},
        {"sku_id": "iphone16-256", "name": "256G 黑色", "price": 8999.0, "stock": 50},
    ],
    reviews=[
        {
            "review_id": 1,
            "rating": 5,
            "content": "很好用",
            "author": "alice",
            "replies": [
                {"reply_id": 1, "content": "感谢支持", "author": "官方"},
            ],
        },
        {
            "review_id": 2,
            "rating": 4,
            "content": "价格有点贵",
            "author": "bob",
            "replies": [],
        },
    ],
)

# 访问嵌套字段
print(product.name)                              # 输出: iPhone 16
print(product.variants[0].name)                  # 输出: 128G 黑色
print(product.reviews[0].rating)                 # 输出: 5
# 深层嵌套访问
print(product.reviews[0].replies[0].author)      # 输出: 官方

# 序列化为 JSON（嵌套结构完整保留）
print(product.model_dump_json())
# 输出包含所有层级的数据

# === 校验失败：评分超出范围 ===
try:
    Product(
        product_id=1,
        name="x",
        reviews=[{"review_id": 1, "rating": 6, "content": "x", "author": "y"}],  # rating 最大 5
    )
except Exception:
    print("评分超出范围")  # 输出

# === 校验失败：嵌套结构字段缺失 ===
try:
    Product(
        product_id=1,
        name="x",
        variants=[
            {"sku_id": "x", "name": "y"},  # 缺少 price 和 stock
        ],
    )
except Exception:
    print("变体字段缺失")  # 输出
\`\`\`

**嵌套模型的威力**：4 层嵌套结构，只需声明字段类型，Pydantic 自动递归校验所有层级。如果手写校验代码，需要递归遍历每个字典，代码量是声明式的 10 倍以上。

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

## 常见错误

### 错误 1：Optional 不等于可省略

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Optional
from typing import Optional

# ❌ 常见误解：以为 Optional[int] 就是可选字段
class Bad(BaseModel):
    # Optional[int] 没有 = None，仍然是必填！
    age: Optional[int]

# 必须传 age（可以是 None，但不能不传）
try:
    Bad()  # 不传 age 会报错
except Exception:
    print("age 是必填")  # 输出

# ✅ 正确写法：Optional + 默认值 None
class Good(BaseModel):
    # Optional[int] = None 才是真正的可选字段
    age: Optional[int] = None

# 现在可以不传 age
g = Good()
print(g.age)  # 输出: None
\`\`\`

### 错误 2：Union 顺序导致意外转换

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 typing 导入 Union
from typing import Union

# ❌ 想保留字符串却声明成 Union[int, str]
class Bad(BaseModel):
    # 先试 int，"123" 会被转成 int 123
    code: Union[int, str]

b = Bad(code="123")
print(type(b.code))  # 输出: <class 'int'>（不是想要的 str）

# ✅ 想保留字符串就声明成 Union[str, int]
class Good(BaseModel):
    # 先试 str，"123" 能转成 str，保留字符串
    code: Union[str, int]

g = Good(code="123")
print(type(g.code))  # 输出: <class 'str'>
\`\`\`

### 错误 3：float 用于金额

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 decimal 导入 Decimal
from decimal import Decimal

# ❌ 用 float 存金额，会有精度问题
class BadMoney(BaseModel):
    amount: float

b1 = BadMoney(amount=0.1)
b2 = BadMoney(amount=0.2)
# float 计算 0.1 + 0.2 不等于 0.3
print(b1.amount + b2.amount)  # 输出: 0.30000000000000004

# ✅ 用 Decimal 存金额
class GoodMoney(BaseModel):
    amount: Decimal

g1 = GoodMoney(amount="0.1")  # 用字符串传值
g2 = GoodMoney(amount="0.2")
# Decimal 计算精确
print(g1.amount + g2.amount)  # 输出: 0.3
\`\`\`

### 错误 4：tuple 长度不匹配

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

class Point(BaseModel):
    # 要求正好 2 个 int
    coord: tuple[int, int]

# ✅ 2 个元素
p = Point(coord=(1, 2))

# ❌ 传 3 个元素会报错
try:
    Point(coord=(1, 2, 3))
except Exception:
    print("长度不对")  # 输出

# 如果需要变长元组，用 tuple[int, ...]
class Coords(BaseModel):
    # ... 表示任意长度
    points: tuple[int, ...]

c = Coords(points=(1, 2, 3, 4, 5))  # 任意数量都行
\`\`\`

## 动手实验

### 实验 1：定义一个会议模型

定义一个 \`Meeting\` 模型，包含：\`title\`（str）、\`start_time\`（datetime）、\`end_time\`（datetime）、\`location\`（str）、\`attendees\`（list[str]）。从 JSON 字符串创建实例并序列化。

参考答案：

\`\`\`python
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 datetime 导入 datetime
from datetime import datetime

# 定义会议模型 Meeting
class Meeting(BaseModel):
    # 字段 title
    title: str
    # 字段 start_time，类型 datetime
    start_time: datetime
    # 字段 end_time，类型 datetime
    end_time: datetime
    # 字段 location
    location: str
    # 字段 attendees，类型 list[str]
    attendees: list[str]

# 从 JSON 字符串创建实例
json_str = '''
{
    "title": "项目评审会",
    "start_time": "2026-07-15T14:00:00",
    "end_time": "2026-07-15T15:30:00",
    "location": "会议室 A",
    "attendees": ["alice", "bob", "carol"]
}
'''
# model_validate_json 直接从 JSON 字符串创建
m = Meeting.model_validate_json(json_str)
print(m.title)                  # 输出: 项目评审会
print(m.start_time)             # 输出: 2026-07-15 14:00:00（datetime 对象）
print(m.attendees)              # 输出: ['alice', 'bob', 'carol']

# 序列化回 JSON
print(m.model_dump_json())
# 输出: {"title":"项目评审会","start_time":"2026-07-15T14:00:00","end_time":"2026-07-15T15:30:00","location":"会议室 A","attendees":["alice","bob","carol"]}
\`\`\`

### 实验 2：自定义邮政编码类型

用 \`Annotated + AfterValidator\` 定义一个中国邮政编码类型（6 位数字），并在地址模型中使用。

参考答案：

\`\`\`python
# 从 pydantic 导入 BaseModel、AfterValidator
from pydantic import BaseModel, AfterValidator
# 从 typing 导入 Annotated
from typing import Annotated
# 导入 re
import re

# 校验函数：6 位数字
def validate_zip_code(v: str) -> str:
    # 去空格
    v = v.strip()
    # 中国邮编：6 位数字
    if not re.match(r'^\d{6}$', v):
        raise ValueError(f'邮编必须是 6 位数字: {v}')
    return v

# 定义自定义类型 ZipCode
ZipCode = Annotated[str, AfterValidator(validate_zip_code)]

# 定义地址模型 Address
class Address(BaseModel):
    # 字段 province
    province: str
    # 字段 city
    city: str
    # 字段 zip_code，类型 ZipCode（复用自定义类型）
    zip_code: ZipCode

# 合法邮编
addr = Address(province="北京", city="北京", zip_code="100000")
print(addr.zip_code)  # 输出: 100000

# 非法邮编
try:
    Address(province="北京", city="北京", zip_code="123")
except Exception:
    print("邮编格式错误")  # 输出

try:
    Address(province="北京", city="北京", zip_code="abcdef")
except Exception:
    print("邮编必须是数字")  # 输出
\`\`\`

### 实验 3：枚举 + Literal 混合使用

定义一个任务模型，\`priority\` 用 \`Literal\`（1/2/3），\`status\` 用 \`Enum\`（pending/running/done），\`env\` 用 \`Literal\`（dev/test/prod）。

参考答案：

\`\`\`python
# 从 pydantic 导入 BaseModel、Field
from pydantic import BaseModel, Field
# 从 enum 导入 Enum
from enum import Enum
# 从 typing 导入 Literal
from typing import Literal

# 定义任务状态枚举
class TaskStatus(str, Enum):
    # 待处理
    PENDING = "pending"
    # 运行中
    RUNNING = "running"
    # 已完成
    DONE = "done"
    # 失败
    FAILED = "failed"

# 定义任务模型 Task
class Task(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str
    # 字段 priority，类型 Literal，只能是 1/2/3
    # 1=低，2=中，3=高
    priority: Literal[1, 2, 3] = Field(default=2, description="优先级 1低 2中 3高")
    # 字段 status，类型 TaskStatus（枚举）
    status: TaskStatus = TaskStatus.PENDING
    # 字段 env，类型 Literal，环境
    env: Literal["dev", "test", "prod"] = "dev"

# 实例化
t = Task(id=1, name="test task", priority=3, status="running")
print(t.priority)            # 输出: 3
print(t.status)              # 输出: TaskStatus.RUNNING
print(t.status.value)        # 输出: running

# 遍历所有状态
for s in TaskStatus:
    print(s.name, s.value)

# 错误：优先级非法
try:
    Task(id=1, name="x", priority=5)
except Exception:
    print("优先级非法")  # 输出

# 错误：状态非法
try:
    Task(id=1, name="x", status="unknown")
except Exception:
    print("状态非法")  # 输出
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
11. **实战场景**：订单状态枚举、手机号/身份证号复用类型、商品评论多层嵌套。

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

## 生活类比：自定义校验像人工查验

继续海关比喻：内置类型是 X 光机，\`Field\` 约束是限重牌，但有些检查机器做不了，必须靠**海关人员人工问询**——这就是自定义校验器：

| 检查方式 | 海关对应 | Pydantic 对应 | 例子 |
|---------|---------|--------------|------|
| 机器自动扫描 | 类型校验 | \`int\` / \`str\` / \`datetime\` | 数字、字符串、日期 |
| 限重牌 | 字段约束 | \`Field(gt=0, min_length=3)\` | 范围、长度 |
| 单个海关人员检查 | 字段校验器 | \`@field_validator\` | 密码强度、邮箱域名 |
| 多人联合问询 | 模型校验器 | \`@model_validator\` | 密码确认、日期顺序 |
| 问询前先填表 | 预处理 | \`mode='before'\` | 去空格、None 转默认 |
| 问询后盖戳 | 后处理 | \`mode='after'\` | 标准化格式 |
| 特殊通道 | 完全控制 | \`mode='wrap'\` | 兼容老格式、跳过校验 |

**核心区别**：\`@field_validator\` 是"单兵作战"（只能看一个字段），\`@model_validator\` 是"协同问询"（能看所有字段）。

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

## 渐进式 Demo：mode='wrap' 兼容旧格式数据

项目升级时经常遇到老数据格式和新格式并存的情况。\`mode='wrap'\` 可以根据输入格式选择不同的处理路径。

\`\`\`python
# 从 pydantic 导入 BaseModel、model_validator
from pydantic import BaseModel, model_validator
# 从 typing 导入 Any
from typing import Any
# 从 datetime 导入 datetime
from datetime import datetime

# 定义用户模型 User（支持新老两种格式）
class User(BaseModel):
    # 字段 id
    id: int
    # 字段 name
    name: str
    # 字段 created_at，类型 datetime
    created_at: datetime

    # mode='wrap'：根据输入格式选择处理路径
    # 老格式：{"id": 1, "name": "alice", "created_at": "2026/01/15"}
    # 新格式：{"id": 1, "name": "alice", "created_at": "2026-01-15T10:00:00"}
    @model_validator(mode='wrap')
    @classmethod
    def compat_validate(cls, data: Any, handler) -> Any:
        # 如果是字典，先做兼容处理
        if isinstance(data, dict) and 'created_at' in data:
            # 老格式用 / 分隔日期，转成 ISO 格式
            old_date = data['created_at']
            if isinstance(old_date, str) and '/' in old_date:
                # "2026/01/15" → "2026-01-15T00:00:00"
                data['created_at'] = old_date.replace('/', '-') + 'T00:00:00'
        # 调用默认校验流程处理转换后的数据
        return handler(data)

# 新格式数据（直接通过）
u1 = User(id=1, name="alice", created_at="2026-01-15T10:00:00")
print(u1.created_at)  # 输出: 2026-01-15 10:00:00

# 老格式数据（被 wrap 转换后通过）
u2 = User(id=2, name="bob", created_at="2026/01/15")
print(u2.created_at)  # 输出: 2026-01-15 00:00:00

# 用 datetime 对象也行
u3 = User(id=3, name="carol", created_at=datetime(2026, 3, 20, 14, 30))
print(u3.created_at)  # 输出: 2026-03-20 14:30:00
\`\`\`

**wrap 模式的价值**：在不修改模型字段定义的前提下，灵活兼容多种输入格式。这比 \`mode='before'\` 更强大，因为可以完全跳过默认校验或选择性调用。

## 渐进式 Demo：库存扣减业务校验

电商下单场景需要校验：库存足够、数量合法、不能超卖。这是 \`@model_validator\` 的经典应用。

\`\`\`python
# 从 pydantic 导入 BaseModel、Field、model_validator、field_validator
from pydantic import BaseModel, Field, model_validator, field_validator

# 模拟数据库的库存表
PRODUCT_STOCK = {
    1001: 50,  # 商品 1001 有 50 件库存
    1002: 10,  # 商品 1002 有 10 件库存
    1003: 0,   # 商品 1003 已售罄
}

# 定义下单请求模型 OrderRequest
class OrderRequest(BaseModel):
    # 字段 product_id，类型 int
    product_id: int
    # 字段 quantity，类型 int，必须 >= 1
    quantity: int = Field(ge=1, description="购买数量，至少 1")
    # 字段 user_id，类型 int
    user_id: int

    # 字段校验：商品 ID 必须存在
    @field_validator('product_id')
    @classmethod
    def check_product_exists(cls, v: int) -> int:
        # 检查商品是否在库存表里
        if v not in PRODUCT_STOCK:
            raise ValueError(f'商品 {v} 不存在')
        return v

    # 模型校验：库存是否足够
    @model_validator(mode='after')
    def check_stock(self) -> 'OrderRequest':
        # 获取当前库存
        stock = PRODUCT_STOCK[self.product_id]
        # 检查库存是否足够
        if stock < self.quantity:
            raise ValueError(
                f'库存不足：需要 {self.quantity}，当前库存 {stock}'
            )
        # 库存为 0 时给出更明确的提示
        if stock == 0:
            raise ValueError('商品已售罄')
        # 校验通过
        return self

# === 测试各种下单场景 ===
# 正常下单
order1 = OrderRequest(product_id=1001, quantity=5, user_id=1)
print(f"下单成功：商品 {order1.product_id}，数量 {order1.quantity}")

# 库存不足
try:
    OrderRequest(product_id=1001, quantity=100, user_id=2)
except Exception:
    print("库存不足")  # 输出

# 商品已售罄
try:
    OrderRequest(product_id=1003, quantity=1, user_id=3)
except Exception:
    print("已售罄")  # 输出

# 商品不存在
try:
    OrderRequest(product_id=9999, quantity=1, user_id=4)
except Exception:
    print("商品不存在")  # 输出

# 数量非法（Field 约束拦截）
try:
    OrderRequest(product_id=1001, quantity=0, user_id=5)
except Exception:
    print("数量必须 >= 1")  # 输出
\`\`\`

**业务校验的分层**：\`@field_validator\` 负责单字段合法性（商品是否存在），\`@model_validator\` 负责跨字段业务规则（库存是否足够）。这种分层让校验逻辑清晰可维护。

## 渐进式 Demo：跨字段日期范围校验

预订系统常见校验：入住时间 < 退房时间、开始时间在结束时间之前、活动时间不冲突等。

\`\`\`python
# 从 pydantic 导入 BaseModel、model_validator
from pydantic import BaseModel, model_validator
# 从 datetime 导入 datetime, timedelta
from datetime import datetime, timedelta

# 定义酒店预订模型 HotelBooking
class HotelBooking(BaseModel):
    # 字段 guest_name，类型 str
    guest_name: str
    # 字段 check_in，类型 datetime（入住时间）
    check_in: datetime
    # 字段 check_out，类型 datetime（退房时间）
    check_out: datetime
    # 字段 room_count，类型 int，默认 1
    room_count: int = 1

    # 模型校验 1：退房时间必须晚于入住时间
    @model_validator(mode='after')
    def check_date_order(self) -> 'HotelBooking':
        # 退房必须晚于入住
        if self.check_out <= self.check_in:
            raise ValueError(
                f'退房时间 {self.check_out} 必须晚于入住时间 {self.check_in}'
            )
        return self

    # 模型校验 2：入住时间不能是过去
    @model_validator(mode='after')
    def check_not_past(self) -> 'HotelBooking':
        # 当前时间
        now = datetime.now()
        # 入住时间不能早于现在
        if self.check_in < now:
            raise ValueError(f'入住时间 {self.check_in} 不能是过去的时间')
        return self

    # 模型校验 3：住宿天数不能超过 30 天
    @model_validator(mode='after')
    def check_max_stay(self) -> 'HotelBooking':
        # 计算住宿天数
        stay_duration = self.check_out - self.check_in
        # 超过 30 天报错
        if stay_duration > timedelta(days=30):
            raise ValueError(
                f'住宿天数 {stay_duration.days} 超过 30 天上限'
            )
        return self

# === 测试 ===
# 正常预订（用未来时间）
now = datetime.now()
booking = HotelBooking(
    guest_name="alice",
    check_in=now + timedelta(days=1),      # 明天入住
    check_out=now + timedelta(days=3),     # 后天退房
)
print(f"预订成功：{booking.guest_name}，{booking.check_in} 到 {booking.check_out}")

# 退房时间早于入住时间
try:
    HotelBooking(
        guest_name="bob",
        check_in=now + timedelta(days=3),
        check_out=now + timedelta(days=1),  # 退房比入住早
    )
except Exception:
    print("退房时间必须晚于入住时间")  # 输出

# 住宿时间过长
try:
    HotelBooking(
        guest_name="carol",
        check_in=now + timedelta(days=1),
        check_out=now + timedelta(days=60),  # 60 天，超过 30 天
    )
except Exception:
    print("住宿超过 30 天上限")  # 输出
\`\`\`

**多个 model_validator 的执行顺序**：按定义顺序从上到下执行。如果前一个校验失败，后面的不会执行。所以把最基础的校验放在前面（如日期顺序），业务校验放在后面（如最大天数）。

## 常见错误

### 错误 1：忘记 @classmethod 装饰器

Pydantic v2 的 \`@field_validator\` 和 \`@model_validator\` 默认是类方法，必须加 \`@classmethod\`（Pydantic v2 也支持写成实例方法的形式，但官方推荐类方法）。如果忘记加，会得到警告或运行时错误。

\`\`\`python
from pydantic import BaseModel, field_validator

class Wrong(BaseModel):
    name: str

    # ❌ 错误写法：缺少 @classmethod
    @field_validator('name')
    def validate_name(cls, v):  # Pydantic 会警告：should be a classmethod
        return v.upper()

class Right(BaseModel):
    name: str

    # ✅ 正确写法：先 @field_validator，再 @classmethod
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.upper()

# 测试
print(Right(name="alice").name)  # 输出 ALICE
\`\`\`

### 错误 2：校验器忘记 return

校验器必须有返回值，否则该字段会变成 \`None\`，引发后续业务错误。这是最隐蔽的 bug 之一。

\`\`\`python
from pydantic import BaseModel, field_validator

class Bad(BaseModel):
    age: int

    @field_validator('age')
    @classmethod
    def check_age(cls, v: int) -> int:
        if v < 0:
            raise ValueError('年龄不能为负')
        # ❌ 忘记 return！年龄会变成 None，下游使用会崩溃
        # 下游代码 user.age + 1 会抛 TypeError

class Good(BaseModel):
    age: int

    @field_validator('age')
    @classmethod
    def check_age(cls, v: int) -> int:
        if v < 0:
            raise ValueError('年龄不能为负')
        # ✅ 必须 return 处理后的值
        return v

# 对比测试
try:
    b = Bad(age=18)
    print(b.age + 1)  # TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
except Exception as e:
    print(f"Bad 模型出错：{type(e).__name__}")

g = Good(age=18)
print(f"Good 模型年龄+1：{g.age + 1}")  # 输出 19
\`\`\`

### 错误 3：model_validator 返回 None 而不是 self

\`@model_validator(mode='after')\` 必须返回 \`self\`，返回 \`None\` 会导致模型实例本身变成 \`None\`。

\`\`\`python
from pydantic import BaseModel, model_validator

class Wrong(BaseModel):
    start: int
    end: int

    @model_validator(mode='after')
    def check_order(self):
        if self.start > self.end:
            raise ValueError('start 不能大于 end')
        # ❌ 忘记 return self，使用方拿到的对象会是 None
        # 调用 Wrong(start=1, end=2).start 会抛 AttributeError

class Right(BaseModel):
    start: int
    end: int

    @model_validator(mode='after')
    def check_order(self) -> 'Right':
        if self.start > self.end:
            raise ValueError('start 不能大于 end')
        # ✅ 必须 return self
        return self

# 对比测试
try:
    w = Wrong(start=1, end=2)
    print(w.start)  # AttributeError: 'NoneType' object has no attribute 'start'
except Exception as e:
    print(f"Wrong 模型出错：{type(e).__name__}")

r = Right(start=1, end=2)
print(f"Right 模型 start={r.start}")  # 输出 start=1
\`\`\`

### 错误 4：mode 参数使用错误

\`mode='before'\` 接收的是原始输入（未经类型转换），\`mode='after'\` 接收的是已转换后的值。混淆两者会导致类型处理错误。

\`\`\`python
from pydantic import BaseModel, field_validator

class Bad(BaseModel):
    age: int

    # ❌ 错误：用 mode='after' 处理字符串，但此时 v 已经是 int 了
    # 如果输入 "18"，到 after 时已经被转成 18（int），不会有原始字符串
    @field_validator('age', mode='after')
    @classmethod
    def clean(cls, v: int) -> int:
        # 这里 v 已经是 int，不会有字符串相关的问题
        return v

class Good(BaseModel):
    age: int

    # ✅ 正确：用 mode='before' 在类型转换前清洗原始输入
    @field_validator('age', mode='before')
    @classmethod
    def clean(cls, v):
        # 此时 v 是原始输入，可能是字符串 " 18 " 这种带空格的
        if isinstance(v, str):
            v = v.strip()  # 去除空格
        return v  # 返回清洗后的值，Pydantic 再做类型转换

# 测试：mode='before' 能处理带空格的字符串
print(Good(age=" 18 "))  # 输出 age=18
\`\`\`

## 动手实验

### 实验 1：实现密码强度校验器

要求：实现一个 \`@field_validator\`，校验密码必须满足：
- 至少 8 位
- 至少包含 1 个大写字母
- 至少包含 1 个小写字母
- 至少包含 1 个数字
- 至少包含 1 个特殊字符（\`!@#$%^&*\`）

\`\`\`python
import re
from pydantic import BaseModel, field_validator

# 预编译正则，提升性能
HAS_UPPER = re.compile(r'[A-Z]')          # 大写字母
HAS_LOWER = re.compile(r'[a-z]')          # 小写字母
HAS_DIGIT = re.compile(r'[0-9]')          # 数字
HAS_SPECIAL = re.compile(r'[!@#$%^&*]')   # 特殊字符

class User(BaseModel):
    username: str
    password: str

    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        # 一一检查强度规则
        if len(v) < 8:
            raise ValueError('密码至少 8 位')
        if not HAS_UPPER.search(v):
            raise ValueError('密码必须包含至少 1 个大写字母')
        if not HAS_LOWER.search(v):
            raise ValueError('密码必须包含至少 1 个小写字母')
        if not HAS_DIGIT.search(v):
            raise ValueError('密码必须包含至少 1 个数字')
        if not HAS_SPECIAL.search(v):
            raise ValueError('密码必须包含至少 1 个特殊字符 (!@#$%^&*)')
        return v

# 测试各种密码
test_cases = [
    ("alice", "Abc123!@#"),    # 合法
    ("bob", "weak"),            # 太短
    ("carol", "abcdefgh"),     # 无大写无数字无特殊
    ("dave", "ABCDEFGH1!"),    # 无小写
]
for username, pwd in test_cases:
    try:
        u = User(username=username, password=pwd)
        print(f"✅ {username} 密码通过：{pwd}")
    except Exception as e:
        print(f"❌ {username} 密码不合法：{e}")
\`\`\`

### 实验 2：跨字段校验 - 订单折扣不能超过总价

要求：实现一个 \`@model_validator\`，校验 \`discount\` 字段不能大于 \`price * quantity\`。

\`\`\`python
from pydantic import BaseModel, model_validator

class Order(BaseModel):
    product_name: str
    price: float        # 单价
    quantity: int       # 数量
    discount: float     # 折扣金额

    @model_validator(mode='after')
    def check_discount(self) -> 'Order':
        # 计算订单总价
        total = self.price * self.quantity
        if self.discount > total:
            raise ValueError(
                f'折扣 {self.discount} 不能超过订单总价 {total}'
            )
        return self

# 测试
# 合法订单
o1 = Order(product_name="书", price=50, quantity=3, discount=20)
print(f"订单 1 合法：总价 {o1.price * o1.quantity}，折扣 {o1.discount}")

# 非法订单：折扣超过总价
try:
    o2 = Order(product_name="笔", price=5, quantity=2, discount=100)
except Exception as e:
    print(f"订单 2 非法：{e}")
\`\`\`

### 实验 3：自定义序列化器 - 隐藏手机号中间 4 位

要求：实现一个 \`@field_serializer\`，在 \`model_dump()\` 时自动把手机号中间 4 位替换为 \`****\`。

\`\`\`python
from pydantic import BaseModel, field_serializer

class Contact(BaseModel):
    name: str
    phone: str  # 11 位手机号

    # 自定义序列化器：调用 model_dump() 时触发
    @field_serializer('phone')
    def mask_phone(self, v: str) -> str:
        # 13812345678 -> 138****5678
        if len(v) == 11:
            return v[:3] + '****' + v[7:]
        return v

c = Contact(name="张三", phone="13812345678")

# 序列化时自动脱敏
dumped = c.model_dump()
print(f"序列化结果：{dumped}")
# 输出：{'name': '张三', 'phone': '138****5678'}

# 原始值仍然保留在实例上
print(f"原始手机号：{c.phone}")  # 输出 13812345678
\`\`\`

## 小结

本章深入讲解了 Pydantic v2 的自定义校验机制，核心知识点：

1. **\`@field_validator\`**：字段级校验，单个字段的复杂规则。
2. **\`@model_validator\`**：模型级校验，跨字段依赖和业务规则。
3. **三种 mode**：
   - \`before\`：类型转换前，处理原始输入（清洗、格式化）
   - \`after\`：类型转换后，处理已转换值（业务规则）
   - \`wrap\`：包裹默认校验，可完全接管流程
4. **\`@field_serializer\`**：自定义字段序列化输出（脱敏、格式化）。
5. **\`@model_serializer\`**：自定义整个模型的序列化流程。
6. **常见实战场景**：用户注册校验、库存扣减、日期范围、敏感词过滤。
7. **常见错误**：忘记 \`@classmethod\`、忘记 \`return\`、\`model_validator\` 忘记返回 \`self\`、\`mode\` 参数误用。

**校验器选择策略**：
- 单字段规则 → \`@field_validator\`
- 跨字段规则 → \`@model_validator\`
- 输入清洗 → \`mode='before'\`
- 业务校验 → \`mode='after'\`
- 兼容旧格式 → \`mode='wrap'\`

下一章我们将学习 Pydantic 模型配置与高级特性，包括 \`model_config\`、别名系统、计算字段、泛型模型等，让数据模型更灵活、更强大。
`
  },

  // ============================================================
  // 第 16 章：模型配置与高级特性
  // ============================================================
  {
    id: "fa-model-config",
    group: "Pydantic 数据校验",
    icon: "🔧",
    title: "模型配置与高级特性",
    content: `# 模型配置与高级特性

## 生活类比：规则定制

想象你经营一家**海关检查站**，不同的货物通道需要不同的检查规则：

- **免税通道**：什么都不查，直接放行（\`extra='allow'\`）
- **申报通道**：没申报的物品一律没收（\`extra='forbid'\`）
- **普通通道**：没申报的物品直接忽略（\`extra='ignore'\`）
- **严格通道**：类型必须完全匹配，\`"1"\` 不能当 \`1\` 用（\`strict=True\`）
- **宽松通道**：\`"1"\` 自动转成 \`1\`（默认行为）
- **VIP 通道**：物品可以用化名申报（\`alias\`）

Pydantic 的 \`model_config\` 就是这个"通道规则定制系统"，你可以为每个模型设定不同的检查策略。而高级特性如**计算字段**（computed_field）、**别名生成器**（alias_generator）、**私有字段**（PrivateAttr）、**泛型模型**（Generic）等，则像是海关里的各种高级设备，让数据处理更智能、更灵活。

## model_config 配置总览

\`model_config\` 是 Pydantic v2 的核心配置入口，使用 \`ConfigDict\` 类型注解声明。它替代了 v1 的 \`class Config:\` 内部类写法。

\`\`\`python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    # model_config 是类属性，用 ConfigDict 声明配置
    model_config = ConfigDict(
        # === 字符串处理 ===
        str_strip_whitespace=True,      # 自动去除字符串两端空白
        str_min_length=1,               # 字符串最小长度
        str_max_length=100,             # 字符串最大长度

        # === 额外字段处理 ===
        extra='ignore',                 # 'ignore'(默认) | 'forbid' | 'allow'

        # === 类型严格模式 ===
        strict=False,                   # True 开启严格模式，"1" 不能转 int

        # === 别名相关 ===
        populate_by_name=True,          # 允许用字段名赋值（默认只能用 alias）
        from_attributes=True,            # 允许从 ORM 对象属性读取

        # === 不可变模型 ===
        frozen=False,                   # True 则模型实例不可修改

        # === 文档生成 ===
        json_schema_extra={             # 自定义 JSON Schema 额外信息
            "examples": [
                {"name": "alice", "age": 18}
            ]
        }
    )

    name: str
    age: int

# 测试：字符串自动去空格
u = User(name="  alice  ", age=18)
print(f"name='{u.name}'")  # 输出 name='alice'（两端空格被去除）
\`\`\`

## extra 三种模式详解

\`extra\` 控制如何处理传入的多余字段（未在模型中定义的字段）。

\`\`\`python
from pydantic import BaseModel, ConfigDict

# === 1. extra='ignore'（默认）：多余字段被丢弃 ===
class IgnoreModel(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str

m1 = IgnoreModel(name="alice", age=18, city="北京")
# age 和 city 未定义，会被静默丢弃
print(m1.model_dump())  # 输出 {'name': 'alice'}

# === 2. extra='forbid'：多余字段直接报错 ===
class ForbidModel(BaseModel):
    model_config = ConfigDict(extra='forbid')
    name: str

try:
    ForbidModel(name="alice", age=18)  # age 是多余字段
except Exception as e:
    print(f"Forbid 报错：{e}")  # Extra inputs are not permitted

# === 3. extra='allow'：多余字段被保留 ===
class AllowModel(BaseModel):
    model_config = ConfigDict(extra='allow')
    name: str

m3 = AllowModel(name="alice", age=18, city="北京")
# age 和 city 被保留在 __pydantic_extra__ 中
print(m3.model_dump())  # 输出 {'name': 'alice', 'age': 18, 'city': '北京'}
print(f"额外字段：{m3.__pydantic_extra__}")  # {'age': 18, 'city': '北京'}
\`\`\`

**使用场景**：
- API 请求体 → \`extra='forbid'\`（防止客户端传未知字段，可能是拼写错误）
- 配置文件 → \`extra='ignore'\`（兼容旧版本字段）
- 动态属性 → \`extra='allow'\`（需要保留所有字段）

## frozen 不可变模型

设置 \`frozen=True\` 后，模型实例创建后不能修改任何字段，类似 \`dataclass(frozen=True)\`。

\`\`\`python
from pydantic import BaseModel, ConfigDict

class Point(BaseModel):
    model_config = ConfigDict(frozen=True)  # 不可变
    x: float
    y: float

p = Point(x=1.0, y=2.0)

# 尝试修改字段会报错
try:
    p.x = 10.0
except Exception as e:
    print(f"修改失败：{type(e).__name__}")  # 输出 ValidationError

# 不可变模型可以作为字典的 key 或集合元素
# 可变模型不行，因为它们不可哈希
points = {Point(x=1, y=2), Point(x=1, y=2), Point(x=3, y=4)}
print(f"去重后集合：{points}")  # 只有两个元素（重复的被合并）
\`\`\`

**使用场景**：配置对象、值对象（DDD 中的 Value Object）、需要哈希的场景。

## str_strip_whitespace 全局字符串处理

\`str_strip_whitespace=True\` 会自动去除所有字符串字段两端的空白，省去为每个字段单独写校验器。

\`\`\`python
from pydantic import BaseModel, ConfigDict

class Form(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,  # 所有 str 字段自动 strip
    )
    name: str
    email: str

# 用户输入带前后空格
f = Form(name="  张三  ", email="  zhangsan@example.com  ")
print(f"name='{f.name}'")    # 输出 name='张三'
print(f"email='{f.email}'")  # 输出 email='zhangsan@example.com'
\`\`\`

## alias 别名系统

别名系统允许字段在**输入/输出**时使用不同的名字。常见于：
- 数据库字段是蛇形（\`user_name\`），API 响应是驼峰（\`userName\`）
- 兼容旧版本字段名（\`name\` → \`fullName\`）
- 处理保留字（\`class\`、\`import\`）

\`\`\`python
from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)  # 允许用字段名赋值

    # 字段名是 user_name（Python 代码中用）
    # alias 是 userName（外部数据用）
    user_name: str = Field(alias="userName")
    age: int = Field(alias="userAge")

# 用 alias 赋值
u1 = User(userName="alice", userAge=18)
print(u1.user_name)  # 输出 alice（用字段名访问）

# 用字段名赋值（需要 populate_by_name=True）
u2 = User(user_name="bob", age=20)
print(u2.user_name)  # 输出 bob

# 序列化时默认用 alias
print(u1.model_dump())        # 输出 {'userName': 'alice', 'userAge': 18}
print(u1.model_dump(by_alias=True))   # 输出 {'userName': 'alice', 'userAge': 18}
print(u1.model_dump(by_alias=False))  # 输出 {'user_name': 'alice', 'age': 18}
\`\`\`

### AliasChoices 多别名

一个字段可以有多个别名，按顺序尝试匹配。

\`\`\`python
from pydantic import BaseModel, Field, AliasChoices

class User(BaseModel):
    # name 字段可以接受：name / fullName / full_name 三种输入
    name: str = Field(
        validation_alias=AliasChoices('name', 'fullName', 'full_name')
    )

# 三种输入都能解析
print(User(name="alice").name)        # 输出 alice
print(User(fullName="bob").name)      # 输出 bob
print(User(full_name="carol").name)   # 输出 carol
\`\`\`

### AliasPath 嵌套别名

\`AliasPath\` 可以从嵌套结构中提取值。

\`\`\`python
from pydantic import BaseModel, Field, AliasPath

class User(BaseModel):
    # 从嵌套的 user.info.name 路径提取
    name: str = Field(validation_alias=AliasPath('user', 'info', 'name'))
    # 从 user.info.age 路径提取
    age: int = Field(validation_alias=AliasPath('user', 'info', 'age'))

# 输入是嵌套结构
data = {
    "user": {
        "info": {
            "name": "alice",
            "age": 18
        }
    }
}

u = User.model_validate(data)
print(u.name)  # 输出 alice
print(u.age)   # 输出 18
\`\`\`

### alias_generator 别名生成器

当模型有很多字段时，手动为每个字段设置 alias 很繁琐。\`alias_generator\` 可以批量生成别名。

\`\`\`python
from pydantic import BaseModel, ConfigDict

# 驼峰转蛇形的函数
def to_snake_case(field_name: str) -> str:
    """将驼峰命名转为蛇形命名
    例：userName -> user_name
    """
    result = []
    for char in field_name:
        if char.isupper():
            result.append('_')
            result.append(char.lower())
        else:
            result.append(char)
    return ''.join(result)

class User(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_snake_case,  # 自动为所有字段生成 alias
        populate_by_name=True,           # 同时允许用字段名
    )
    userName: str       # alias 自动变成 user_name
    userAge: int        # alias 自动变成 user_age
    emailAddress: str   # alias 自动变成 email_address

# 用蛇形 alias 输入（适合数据库字段）
u = User(user_name="alice", user_age=18, email_address="a@b.com")
# 用驼峰字段名访问（适合 Python 代码）
print(u.userName)       # 输出 alice
print(u.userAge)        # 输出 18
print(u.emailAddress)   # 输出 a@b.com
\`\`\`

## computed_field 计算字段

\`@computed_field\` 让一个**属性方法**出现在 \`model_dump()\` 的输出中，但不是真实存储的字段。

\`\`\`python
from pydantic import BaseModel, computed_field

class Product(BaseModel):
    name: str
    price: float          # 单价
    quantity: int         # 数量

    # 计算字段：总价 = 单价 * 数量
    @computed_field
    @property
    def total_price(self) -> float:
        """自动计算总价，不需要用户输入"""
        return self.price * self.quantity

    # 计算字段：折扣价
    @computed_field
    @property
    def discount_price(self) -> float:
        """打 8 折后的价格"""
        return round(self.total_price * 0.8, 2)

p = Product(name="书", price=50, quantity=3)

# 计算字段会出现在序列化结果中
print(p.model_dump())
# 输出 {'name': '书', 'price': 50.0, 'quantity': 3, 'total_price': 150.0, 'discount_price': 120.0}

# 但计算字段不能作为输入
try:
    Product(name="书", price=50, quantity=3, total_price=999)
except Exception as e:
    print("total_price 是计算字段，不能作为输入")  # 输出
\`\`\`

**使用场景**：派生数据（总价、全名、年龄）、状态标识（is_active）、格式化输出（带货币符号的字符串）。

## model_fields 和模型信息

\`model_fields\` 是一个字典，包含所有字段的元信息（类型、默认值、别名等）。

\`\`\`python
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str = Field(description="用户名", examples=["alice"])
    age: int = Field(default=0, ge=0, le=150, description="年龄")
    email: str | None = None

# 查看所有字段信息
for field_name, field_info in User.model_fields.items():
    print(f"字段：{field_name}")
    print(f"  类型：{field_info.annotation}")
    print(f"  默认值：{field_info.default}")
    print(f"  描述：{field_info.description}")
    print()

# 输出 JSON Schema
import json
schema = User.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
\`\`\`

## model_copy 模型复制

\`model_copy()\` 用于复制模型实例，可以同时修改部分字段。

\`\`\`python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    email: str

u = User(name="alice", age=18, email="a@b.com")

# 1. 浅拷贝（默认）
u2 = u.model_copy()
print(u2 is u)  # False（不同对象）
print(u2 == u)  # True（值相等）

# 2. 拷贝时修改部分字段
u3 = u.model_copy(update={"age": 20})
print(u3.age)   # 输出 20
print(u.age)    # 输出 18（原对象不变）

# 3. 深拷贝（deep=True）
u4 = u.model_copy(deep=True)
print(u4 is u)  # False
\`\`\`

**注意**：\`model_copy(update={...})\` 不会触发校验器，适用于高性能批量更新场景。

## JSON Schema 自定义

Pydantic 自动生成 JSON Schema，可以通过 \`json_schema_extra\` 添加自定义信息。

\`\`\`python
from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {"name": "alice", "age": 18},
                {"name": "bob", "age": 20}
            ],
            "description": "用户信息模型"
        }
    )
    name: str = Field(description="用户名", examples=["alice"])
    age: int = Field(description="年龄", ge=0, le=150)

# 生成的 Schema 会包含 examples 和 description
import json
schema = User.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
\`\`\`

FastAPI 会自动用这些 Schema 生成 OpenAPI 文档（访问 \`/docs\` 查看）。

## from_attributes ORM 集成

\`from_attributes=True\` 允许从 ORM 对象（如 SQLAlchemy 模型）的**属性**读取数据，而不需要先转成字典。

\`\`\`python
from pydantic import BaseModel, ConfigDict

# 模拟一个 SQLAlchemy ORM 模型
class ORMUser:
    """模拟数据库 ORM 对象"""
    def __init__(self, name, age, email):
        self.name = name      # 属性名必须和 Pydantic 字段名一致
        self.age = age
        self.email = email

# Pydantic 响应模型
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # 开启 ORM 模式
    name: str
    age: int
    email: str

# 创建 ORM 对象（模拟数据库查询结果）
db_user = ORMUser(name="alice", age=18, email="a@b.com")

# 直接从 ORM 对象创建 Pydantic 模型
u = UserResponse.model_validate(db_user)
print(u.model_dump())  # 输出 {'name': 'alice', 'age': 18, 'email': 'a@b.com'}
\`\`\`

**在 FastAPI 中**：响应模型设置 \`from_attributes=True\` 后，可以直接返回 ORM 对象，FastAPI 自动转换。

## strict 严格模式实战

默认情况下，Pydantic 会做"宽松"类型转换（\`"1"\` → \`1\`）。开启 \`strict=True\` 后，类型必须完全匹配。

\`\`\`python
from pydantic import BaseModel, ConfigDict, StrictInt, StrictStr

# === 1. 全局严格模式 ===
class StrictModel(BaseModel):
    model_config = ConfigDict(strict=True)
    age: int
    name: str

try:
    StrictModel(age="18", name="alice")  # "18" 是字符串，不是 int
except Exception as e:
    print(f"严格模式拒绝：{type(e).__name__}")  # 输出 ValidationError

# === 2. 单字段严格模式 ===
class MixedModel(BaseModel):
    age: StrictInt      # 这个字段严格
    name: str           # 这个字段宽松

# age 必须是 int，name 可以是任意可转 str 的类型
m = MixedModel(age=18, name=123)  # name=123 会被转成 "123"
print(m.model_dump())  # 输出 {'age': 18, 'name': '123'}

try:
    MixedModel(age="18", name="alice")  # age 严格，拒绝字符串
except Exception as e:
    print(f"age 字段严格：{type(e).__name__}")
\`\`\`

**使用场景**：
- 金融系统：金额必须是 \`Decimal\`，不能让字符串悄悄转换
- 安全敏感场景：ID 必须是 \`int\`，防止注入
- API 契约严格：避免意外的类型 coercion

## PrivateAttr 私有字段

\`PrivateAttr\` 定义模型实例的**私有属性**，不会出现在 \`model_dump()\` 中，也不参与校验。

\`\`\`python
from pydantic import BaseModel, PrivateAttr
import time

class Cache(BaseModel):
    key: str
    value: str

    # 私有字段：不会出现在 model_dump() 中
    _created_at: float = PrivateAttr(default_factory=time.time)
    _access_count: int = PrivateAttr(default=0)

    def touch(self):
        """访问时计数 +1"""
        self._access_count += 1

    @property
    def age(self):
        """缓存存活时间"""
        return time.time() - self._created_at

c = Cache(key="user:1", value="alice")

# 私有字段不在序列化结果中
print(c.model_dump())  # 输出 {'key': 'user:1', 'value': 'alice'}

# 但可以正常访问
print(f"访问次数：{c._access_count}")  # 输出 0
c.touch()
c.touch()
print(f"访问次数：{c._access_count}")  # 输出 2
print(f"创建时间：{c._created_at}")
\`\`\`

### PrivateAttr 缓存实战

利用私有字段实现计算结果缓存，避免重复计算。

\`\`\`python
from pydantic import BaseModel, PrivateAttr

class ExpensiveModel(BaseModel):
    data: list[int]

    # 缓存私有字段
    _cache: dict = PrivateAttr(default_factory=dict)

    def get_max(self) -> int:
        """获取最大值，带缓存"""
        if 'max' not in self._cache:
            print("（首次计算 max）")
            self._cache['max'] = max(self.data)
        return self._cache['max']

    def get_sum(self) -> int:
        """获取总和，带缓存"""
        if 'sum' not in self._cache:
            print("（首次计算 sum）")
            self._cache['sum'] = sum(self.data)
        return self._cache['sum']

m = ExpensiveModel(data=list(range(1000000)))

# 第一次调用：会计算
print(m.get_max())  # 输出 （首次计算 max） 999999
print(m.get_sum())  # 输出 （首次计算 sum） 499999500000

# 第二次调用：直接读缓存
print(m.get_max())  # 直接输出 999999，没有"首次计算"
print(m.get_sum())  # 直接输出 499999500000，没有"首次计算"
\`\`\`

## Generic 泛型模型

泛型模型允许定义**通用容器**，处理任意类型的数据。最典型的应用是**统一分页响应**。

\`\`\`python
from typing import Generic, TypeVar
from pydantic import BaseModel

# TypeVar 是类型变量，代表"任意类型"
T = TypeVar('T')

# Generic[T] 让模型支持泛型
class PageResponse(BaseModel, Generic[T]):
    """通用分页响应模型
    T 是数据项的类型，可以是 User、Order、Product 等
    """
    items: list[T]          # 数据列表
    total: int              # 总数
    page: int               # 当前页码
    page_size: int          # 每页数量

    @property
    def total_pages(self) -> int:
        """总页数"""
        return (self.total + self.page_size - 1) // self.page_size

# 使用：指定 T 为 User
class User(BaseModel):
    name: str
    age: int

# 创建 User 类型的分页响应
user_page: PageResponse[User] = PageResponse[User](
    items=[
        User(name="alice", age=18),
        User(name="bob", age=20),
    ],
    total=100,
    page=1,
    page_size=2
)

# items 自动是 User 类型
print(user_page.items[0].name)  # 输出 alice
print(f"总页数：{user_page.total_pages}")  # 输出 50

# 同一个模型可以复用
class Product(BaseModel):
    name: str
    price: float

product_page: PageResponse[Product] = PageResponse[Product](
    items=[Product(name="书", price=50)],
    total=50,
    page=1,
    page_size=10
)
print(product_page.items[0].price)  # 输出 50.0
\`\`\`

**在 FastAPI 中**：\`response_model=PageResponse[User]\` 让 API 文档自动展示正确类型。

## 模型嵌套与递归

Pydantic 模型可以嵌套，甚至支持递归引用（树形结构）。

\`\`\`python
from pydantic import BaseModel

class Comment(BaseModel):
    """评论模型"""
    author: str
    content: str

class Article(BaseModel):
    """文章模型，嵌套 Comment"""
    title: str
    content: str
    comments: list[Comment] = []   # 嵌套模型列表

# 嵌套模型会自动校验子对象
a = Article(
    title="Pydantic 教程",
    content="...",
    comments=[
        {"author": "alice", "content": "好文章"},   # 字典会自动转 Comment
        {"author": "bob", "content": "学到了"},
    ]
)
# comments 中的字典被自动转成 Comment 对象
print(a.comments[0].author)  # 输出 alice
\`\`\`

### 递归模型（树形结构）

\`\`\`python
from typing import Optional
from pydantic import BaseModel

class TreeNode(BaseModel):
    """树形节点，可以递归引用自己"""
    name: str
    children: list['TreeNode'] = []   # 递归引用，需要用字符串前向引用

# 构建文件树
tree = TreeNode(
    name="root",
    children=[
        TreeNode(
            name="src",
            children=[
                TreeNode(name="main.py"),
                TreeNode(name="utils.py"),
            ]
        ),
        TreeNode(
            name="tests",
            children=[
                TreeNode(name="test_main.py"),
            ]
        ),
    ]
)

# 递归遍历
def print_tree(node: TreeNode, indent: int = 0):
    """递归打印树形结构"""
    print("  " * indent + f"- {node.name}")
    for child in node.children:
        print_tree(child, indent + 1)

print_tree(tree)
# 输出：
# - root
#   - src
#     - main.py
#     - utils.py
#   - tests
#     - test_main.py
\`\`\`

## 模型方法与类方法

Pydantic 模型提供丰富的内置方法。

\`\`\`python
from pydantic import BaseModel
import json

class User(BaseModel):
    name: str
    age: int

u = User(name="alice", age=18)

# === 1. 序列化方法 ===
print(u.model_dump())           # 转 dict：{'name': 'alice', 'age': 18}
print(u.model_dump_json())      # 转 JSON 字符串：{"name":"alice","age":18}
print(u.model_dump_json(indent=2))  # 格式化的 JSON

# === 2. 反序列化方法（类方法） ===
# 从 dict 创建
u2 = User.model_validate({"name": "bob", "age": 20})
# 从 JSON 字符串创建
u3 = User.model_validate_json('{"name": "carol", "age": 22}')
print(u2.name, u3.name)  # 输出 bob carol

# === 3. 字段集合 ===
# 返回实例化时明确传入的字段（排除默认值字段）
u4 = User(name="dave")  # age 用默认值
print(u4.model_fields_set)  # 输出 {'name'}，age 没传入

# === 4. JSON Schema ===
print(User.model_json_schema())  # 输出 JSON Schema 字典
\`\`\`

## 实战：通用分页响应模型

结合泛型、计算字段、模型配置，实现一个生产级分页响应。

\`\`\`python
from typing import Generic, TypeVar
from pydantic import BaseModel, Field, computed_field, ConfigDict

T = TypeVar('T')

class PageResponse(BaseModel, Generic[T]):
    """通用分页响应模型
    - 泛型 T：数据项类型
    - 计算字段：total_pages、has_next、has_prev
    - 配置：populate_by_name 允许字段名赋值
    """
    model_config = ConfigDict(populate_by_name=True)

    items: list[T] = Field(description="数据列表")
    total: int = Field(description="总记录数", ge=0)
    page: int = Field(description="当前页码", ge=1)
    page_size: int = Field(description="每页数量", ge=1, le=100)

    @computed_field
    @property
    def total_pages(self) -> int:
        """总页数"""
        return (self.total + self.page_size - 1) // self.page_size

    @computed_field
    @property
    def has_next(self) -> bool:
        """是否有下一页"""
        return self.page < self.total_pages

    @computed_field
    @property
    def has_prev(self) -> bool:
        """是否有上一页"""
        return self.page > 1

# 使用示例
class User(BaseModel):
    name: str
    age: int

# 模拟数据库查询结果
response: PageResponse[User] = PageResponse[User](
    items=[
        User(name="alice", age=18),
        User(name="bob", age=20),
    ],
    total=100,
    page=1,
    page_size=10,
)

# 序列化（包含计算字段）
import json
print(json.dumps(response.model_dump(), indent=2, ensure_ascii=False))
# 输出：
# {
#   "items": [{"name": "alice", "age": 18}, {"name": "bob", "age": 20}],
#   "total": 100,
#   "page": 1,
#   "page_size": 10,
#   "total_pages": 10,
#   "has_next": true,
#   "has_prev": false
# }
\`\`\`

## 常见错误

### 错误 1：frozen 模型尝试修改

\`\`\`python
from pydantic import BaseModel, ConfigDict

class Config(BaseModel):
    model_config = ConfigDict(frozen=True)
    name: str

c = Config(name="alice")

# ❌ 错误：frozen 模型不能修改
try:
    c.name = "bob"
except Exception as e:
    print(f"frozen 模型不可修改：{type(e).__name__}")

# ✅ 正确：用 model_copy(update=...) 创建新实例
c2 = c.model_copy(update={"name": "bob"})
print(c2.name)  # 输出 bob
\`\`\`

### 错误 2：alias 赋值忘记 populate_by_name

\`\`\`python
from pydantic import BaseModel, Field, ConfigDict

class WithoutFlag(BaseModel):
    # 没有 populate_by_name=True
    name: str = Field(alias="fullName")

class WithFlag(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    name: str = Field(alias="fullName")

# ❌ 错误：没有 populate_by_name，不能用字段名赋值
try:
    WithoutFlag(name="alice")  # name 是字段名，不是 alias
except Exception as e:
    print(f"不能用字段名赋值：{type(e).__name__}")

# ✅ 正确：用 alias 赋值
u1 = WithoutFlag(fullName="alice")
print(u1.name)  # 输出 alice

# ✅ 正确：有 populate_by_name=True，两者都行
u2 = WithFlag(name="alice")
u3 = WithFlag(fullName="bob")
print(u2.name, u3.name)  # 输出 alice bob
\`\`\`

### 错误 3：extra='forbid' 在 FastAPI 中过于严格

\`\`\`python
from pydantic import BaseModel, ConfigDict

# ❌ 问题：extra='forbid' 会拒绝所有未定义字段
# 客户端传了多余字段就报错，可能只是拼写错误
class StrictUser(BaseModel):
    model_config = ConfigDict(extra='forbid')
    name: str
    age: int

try:
    StrictUser(name="alice", age=18, emial="a@b.com")  # emial 拼写错误
except Exception as e:
    print(f"extra='forbid' 拒绝：{e}")

# ✅ 建议：内部 API 用 forbid，公开 API 用 ignore
class LooseUser(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: str
    age: int

u = LooseUser(name="alice", age=18, emial="a@b.com")  # emial 被忽略
print(u.model_dump())  # 输出 {'name': 'alice', 'age': 18}
\`\`\`

### 错误 4：from_attributes 没开启

\`\`\`python
from pydantic import BaseModel, ConfigDict

class ORMUser:
    """模拟 ORM 对象"""
    def __init__(self, name, age):
        self.name = name
        self.age = age

class WithoutFlag(BaseModel):
    # 没有开启 from_attributes
    name: str
    age: int

class WithFlag(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    age: int

db_user = ORMUser(name="alice", age=18)

# ❌ 错误：没开启 from_attributes，不能从 ORM 对象创建
try:
    WithoutFlag.model_validate(db_user)
except Exception as e:
    print(f"未开启 from_attributes：{type(e).__name__}")

# ✅ 正确：开启 from_attributes
u = WithFlag.model_validate(db_user)
print(u.model_dump())  # 输出 {'name': 'alice', 'age': 18}
\`\`\`

## 动手实验

### 实验 1：实现驼峰蛇形互转的别名生成器

要求：实现一个 \`alias_generator\`，让模型同时支持驼峰和蛇形两种命名。

\`\`\`python
from pydantic import BaseModel, ConfigDict

def to_camel(field_name: str) -> str:
    """蛇形转驼峰：user_name -> userName"""
    parts = field_name.split('_')
    return parts[0] + ''.join(p.title() for p in parts[1:])

class User(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )
    user_name: str
    user_age: int

# 用蛇形字段名输入
u1 = User(user_name="alice", user_age=18)
print(u1.user_name)  # 输出 alice

# 用驼峰 alias 输入
u2 = User(userName="bob", userAge=20)
print(u2.user_name)  # 输出 bob

# 序列化时用驼峰 alias
print(u1.model_dump(by_alias=True))
# 输出 {'userName': 'alice', 'userAge': 18}
\`\`\`

### 实验 2：实现带缓存的计算模型

要求：用 \`PrivateAttr\` 缓存计算结果，避免重复计算。

\`\`\`python
from pydantic import BaseModel, PrivateAttr

class Stats(BaseModel):
    """统计数据模型，带计算缓存"""
    numbers: list[int]

    # 私有缓存字段
    _cache: dict = PrivateAttr(default_factory=dict)

    def get_mean(self) -> float:
        """平均值（带缓存）"""
        if 'mean' not in self._cache:
            print("（计算 mean）")
            self._cache['mean'] = sum(self.numbers) / len(self.numbers)
        return self._cache['mean']

    def get_variance(self) -> float:
        """方差（带缓存）"""
        if 'variance' not in self._cache:
            print("（计算 variance）")
            mean = self.get_mean()  # 复用 mean 缓存
            self._cache['variance'] = sum(
                (x - mean) ** 2 for x in self.numbers
            ) / len(self.numbers)
        return self._cache['variance']

s = Stats(numbers=[1, 2, 3, 4, 5])

# 第一次计算
print(f"mean: {s.get_mean()}")          # 输出 （计算 mean） mean: 3.0
print(f"variance: {s.get_variance()}")  # 输出 （计算 variance） variance: 2.0

# 第二次调用（走缓存）
print(f"mean: {s.get_mean()}")          # 直接输出 3.0
print(f"variance: {s.get_variance()}")  # 直接输出 2.0
\`\`\`

### 实验 3：实现通用 API 响应包装模型

要求：用泛型实现统一的 API 响应格式，包含 \`code\`、\`message\`、\`data\` 字段。

\`\`\`python
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, Field

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    """通用 API 响应模型
    code: 业务状态码（0 表示成功）
    message: 提示消息
    data: 业务数据（泛型）
    """
    code: int = Field(default=0, description="业务状态码，0 表示成功")
    message: str = Field(default="success", description="提示消息")
    data: Optional[T] = Field(default=None, description="业务数据")

    @classmethod
    def success(cls, data: T, message: str = "success") -> 'ApiResponse[T]':
        """快速创建成功响应"""
        return cls(code=0, message=message, data=data)

    @classmethod
    def error(cls, message: str, code: int = -1) -> 'ApiResponse[T]':
        """快速创建错误响应"""
        return cls(code=code, message=message, data=None)

# 使用示例
class User(BaseModel):
    name: str
    age: int

# 成功响应
resp1: ApiResponse[User] = ApiResponse.success(
    User(name="alice", age=18)
)
print(resp1.model_dump_json())
# 输出 {"code":0,"message":"success","data":{"name":"alice","age":18}}

# 错误响应
resp2: ApiResponse[User] = ApiResponse.error("用户不存在")
print(resp2.model_dump_json())
# 输出 {"code":-1,"message":"用户不存在","data":null}

# 列表数据
resp3: ApiResponse[list[User]] = ApiResponse.success(
    [User(name="alice", age=18), User(name="bob", age=20)]
)
print(resp3.model_dump_json())
# 输出 {"code":0,"message":"success","data":[{"name":"alice","age":18},{"name":"bob","age":20}]}
\`\`\`

## 小结

本章深入讲解了 Pydantic v2 的模型配置与高级特性，核心知识点：

1. **\`model_config = ConfigDict(...)\`**：统一配置入口，替代 v1 的 \`class Config:\`。
2. **\`extra\` 三种模式**：\`ignore\`（丢弃）、\`forbid\`（报错）、\`allow\`（保留）。
3. **\`frozen=True\`**：不可变模型，可哈希，可作为字典 key。
4. **\`str_strip_whitespace\`**：全局字符串清洗。
5. **\`alias\` 系统**：\`Field(alias=...)\`、\`AliasChoices\`（多别名）、\`AliasPath\`（嵌套路径）、\`alias_generator\`（批量生成）。
6. **\`computed_field\`**：计算字段，自动出现在序列化结果中。
7. **\`model_fields\`**：字段元信息字典。
8. **\`model_copy(update=...)\`**：高效复制并修改。
9. **\`json_schema_extra\`**：自定义 JSON Schema。
10. **\`from_attributes=True\`**：ORM 集成模式。
11. **\`strict=True\`**：严格类型模式，拒绝隐式转换。
12. **\`PrivateAttr\`**：私有字段，不参与序列化和校验，适合缓存。
13. **\`Generic[T]\`**：泛型模型，实现通用容器（分页、响应包装）。
14. **嵌套与递归**：模型可嵌套，支持树形结构。

**配置选择策略**：
- 公开 API → \`extra='ignore'\`，宽容客户端错误
- 内部 API → \`extra='forbid'\`，严格契约
- 金融系统 → \`strict=True\`，防止类型意外转换
- 响应模型 → \`from_attributes=True\`，配合 ORM
- 通用容器 → \`Generic[T]\`，复用代码
- 计算字段 → \`computed_field\`，避免冗余存储
- 缓存场景 → \`PrivateAttr\`，隐藏内部状态

**Pydantic v2 vs v1 关键差异**：
- \`model_config = ConfigDict(...)\` 替代 \`class Config:\`
- \`model_dump()\` 替代 \`.dict()\`
- \`model_validate()\` 替代 \`.parse_obj()\`
- \`model_validate_json()\` 替代 \`.parse_raw()\`
- \`@field_validator\` 替代 \`@validator\`
- \`@model_validator\` 替代 \`@root_validator\`
- \`model_config\` 替代 \`Config\` 内部类

到这里，Pydantic 数据校验的 4 章内容就全部讲完了。从基础的 \`BaseModel\` 到高级的泛型模型和私有字段，你已经掌握了 FastAPI 数据层的全部核心知识。接下来我们将进入 FastAPI 的其他主题，如数据库集成、认证授权、部署运维等。
`
  },
];