// =============================================================
// FastAPI 现代开发全书 - 第 3 批章节（Pydantic 数据校验 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fp-pydantic-basic  : Pydantic v2 基础：模型定义与字段约束
//   fp-validators      : 校验器：before/after/wrap 模式
//   fp-model-advanced  : 模型继承、嵌套与泛型
//   fp-serialization   : 序列化与别名机制
// ============================================================

export const chapters = [
  // ============================================================
  // 第 9 章：Pydantic v2 基础：模型定义与字段约束
  // ============================================================
  {
    id: "fp-pydantic-basic",
    group: "Pydantic 数据校验",
    icon: "🛡️",
    title: "Pydantic v2 基础：模型定义与字段约束",
    content: `# Pydantic v2 基础：模型定义与字段约束

## 一、Pydantic 是什么

如果把 FastAPI 比作一辆汽车，那么 Pydantic 就是它的发动机。FastAPI 表面上那些"自动校验参数""自动生成文档""自动转换类型"的能力，底层几乎全部由 Pydantic 提供。不理解 Pydantic，就不可能真正掌握 FastAPI。

Pydantic 是一个基于 Python 类型注解（type hints）的数据校验和序列化库。它的核心思想非常简单却极其强大：**你用类型注解声明数据结构，Pydantic 负责校验数据、转换类型、序列化输出**。

举个最直观的例子。假设你要接收一个用户注册请求，要求：用户名非空且长度 3-20，年龄 18-120，邮箱格式合法。如果手写校验，代码会是这样：

\`\`\`python
# 手写校验的痛苦：又长又容易漏
def validate_user(data):
    username = data.get("username")
    if not username:
        raise ValueError("用户名不能为空")
    if len(username) < 3 or len(username) > 20:
        raise ValueError("用户名长度必须在 3-20 之间")

    age = data.get("age")
    if age is None:
        raise ValueError("年龄不能为空")
    try:
        age = int(age)
    except (TypeError, ValueError):
        raise ValueError("年龄必须是整数")
    if age < 18 or age > 120:
        raise ValueError("年龄必须在 18-120 之间")

    email = data.get("email", "")
    if "@" not in email:
        raise ValueError("邮箱格式不合法")

    return {"username": username, "age": age, "email": email}
\`\`\`

这段代码又臭又长，而且每加一个字段就要再写一堆 if。用 Pydantic，同样的事情只需要：

\`\`\`python
# Pydantic 写法：声明一次，校验、转换、文档全有了
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    # 用户名：最小 3 字符，最大 20 字符
    username: str = Field(min_length=3, max_length=20)
    # 年龄：大于等于 18，小于等于 120
    age: int = Field(ge=18, le=120)
    # 邮箱：用正则约束格式
    email: str = Field(pattern=r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")

# 实例化时自动校验，不合法直接抛异常
user = UserCreate(username="alice", age=25, email="alice@example.com")
print(user.username)  # alice
\`\`\`

声明 4 行，抵过手写 20 行。而且校验逻辑集中、可读、可维护。这就是 Pydantic 的价值。

## 二、v1 vs v2：一次脱胎换骨的升级

Pydantic v2 于 2023 年 6 月正式发布，是一次几乎完全重写的升级。理解 v1 和 v2 的区别非常重要，因为你可能在老项目里遇到 v1 写法，而新项目必须用 v2。

### 性能：核心用 Rust 重写

v2 的校验核心用 Rust 语言重写（项目名叫 pydantic-core），性能比 v1 提升 5-50 倍。对于高并发 API，这意味着同样的服务器能扛住更多请求。

打个比方：v1 像是自行车，v2 像是摩托车。同样是"校验数据"这件事，v2 快了一个数量级。这对 FastAPI 应用的整体吞吐量影响巨大，因为请求校验是每个请求都要做的事。

### API 变化要点

v2 改了大量 API，以下是高频出现的几个：

| 功能 | v1 写法 | v2 写法 |
|------|---------|---------|
| 字段约束 | \`Field(..., min_length=3)\` 内部用 validator | \`Field(min_length=3)\` 原生支持 |
| 校验器 | \`@validator\` | \`@field_validator\` |
| 模型校验器 | \`@root_validator\` | \`@model_validator\` |
| 转字典 | \`.dict()\` | \`.model_dump()\` |
| 转 JSON | \`.json()\` | \`.model_dump_json()\` |
| 从字典创建 | \`Model.parse_obj(d)\` | \`Model.model_validate(d)\` |
| 从 JSON 创建 | \`Model.parse_raw(s)\` | \`Model.model_validate_json(s)\` |
| 配置类 | \`class Config:\` 内部类 | \`model_config = ConfigDict(...)\` |
| 字段类型 | \`Optional[str] = None\` | \`str | None = None\`（推荐新语法）|

v2 还把很多以前需要写校验器才能做的事，变成了 Field 的内置参数。比如 \`Field(pattern=r"...")\` 直接做正则校验，不用再写 validator。

### 兼容层：pydantic.v1

如果你的老代码迁移成本太高，Pydantic v2 提供了兼容层：

\`\`\`python
# v2 里仍然可以用 v1 的 API（不推荐，仅供过渡）
from pydantic.v1 import BaseModel
\`\`\`

但官方强烈建议迁移到 v2 原生 API，因为兼容层没有性能优势，也无法享受新特性。

## 三、BaseModel：一切的起点

所有 Pydantic 模型都继承自 \`BaseModel\`。继承之后，这个类就获得了校验、序列化、JSON Schema 生成等能力。

\`\`\`python
# demo 1：最基础的模型定义
from pydantic import BaseModel

# 定义一个 Book 模型
class Book(BaseModel):
    # 每个类属性都是一个字段，类型注解是必须的
    title: str        # 书名，字符串，必填
    author: str       # 作者，字符串，必填
    pages: int        # 页数，整数，必填
    price: float      # 价格，浮点数，必填

# 用关键字参数实例化
book = Book(title="Python 入门", author="张三", pages=300, price=59.9)
print(book.title)     # Python 入门
print(book.author)    # 张三
print(book.pages)     # 300
print(book.price)     # 59.9

# 模型实例的属性可以直接访问，类型已经转换好
print(type(book.pages))  # <class 'int'>
print(type(book.price))  # <class 'float'>
\`\`\`

注意几个要点：

1. **类型注解是必须的**：\`title: str\` 里的 \`str\` 不能省。Pydantic 靠它知道这个字段是什么类型。
2. **必填字段**：只写类型、不写默认值的字段是必填的。实例化时不传会报错。
3. **自动类型转换**：传 \`pages="300"\`（字符串），Pydantic 会尝试转成 int。转不了才报错。

## 四、字段类型注解

Pydantic 支持几乎所有 Python 类型，包括内置类型、标准库类型、第三方库类型。以下是常用类型：

\`\`\`python
# demo 2：各种字段类型演示
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from pathlib import Path

class DemoModel(BaseModel):
    # 基础类型
    name: str                    # 字符串
    count: int                   # 整数
    score: float                 # 浮点
    is_active: bool              # 布尔
    tags: list[str]              # 字符串列表（Python 3.9+ 语法）
    metadata: dict[str, Any]     # 字典，值可以是任意类型

    # 时间类型
    created_at: datetime         # 自动解析 ISO 格式时间
    birthday: date               # 日期

    # 特殊类型
    user_id: UUID                # UUID，自动解析
    filepath: Path               # 路径对象

# 注意：字符串 "true" 会被转成 bool True
m = DemoModel(
    name="测试",
    count=42,
    score=95.5,
    is_active="true",            # 字符串会被转成 True
    tags=["a", "b", "c"],
    metadata={"key": "value"},
    created_at="2024-01-15T10:30:00",   # ISO 字符串转 datetime
    birthday="2024-01-15",              # 日期字符串转 date
    user_id="12345678-1234-1234-1234-123456789012",  # 字符串转 UUID
    filepath="/tmp/test.txt",           # 字符串转 Path
)
print(m.created_at)  # 2024-01-15 10:30:00
print(m.user_id)     # 12345678-1234-1234-1234-123456789012
\`\`\`

类型注解的力量在于：**你声明一次，Pydantic 在校验时自动做类型转换**。传字符串 "42" 给 int 字段，它会转成 42；传 ISO 字符串给 datetime 字段，它会转成 datetime 对象。这省去了大量手动转换代码。

## 五、Field() 约束：精细化控制

\`Field()\` 是 Pydantic 提供的字段约束函数，让你在不写校验器的情况下，对字段值做各种限制。这是日常开发用得最多的功能。

### 数值约束

\`\`\`python
# demo 3：数值字段约束
from pydantic import BaseModel, Field

class Product(BaseModel):
    # gt：大于（great than），price 必须 > 0
    price: float = Field(gt=0, description="价格必须大于 0")
    # lt：小于（less than），discount 必须 < 1
    discount: float = Field(lt=1, description="折扣必须小于 1")
    # ge：大于等于（great equal），stock 必须 >= 0
    stock: int = Field(ge=0, description="库存不能为负")
    # le：小于等于（less equal），rating 必须 <= 5
    rating: float = Field(le=5, description="评分最高 5 分")
    # 可以组合使用：multiple_of 要求是某数的倍数
    quantity: int = Field(gt=0, multiple_of=5, description="数量必须是 5 的倍数")

# 合法数据
p = Product(price=99.9, discount=0.8, stock=100, rating=4.5, quantity=25)
print(p.quantity)  # 25

# 非法数据会抛 ValidationError
# from pydantic import ValidationError
# try:
#     Product(price=-1, discount=0.8, stock=100, rating=4.5, quantity=25)
# except ValidationError as e:
#     print(e.errors())  # 会显示 price 字段 gt 校验失败
\`\`\`

记忆口诀：**gt/lt 是开区间（不包含），ge/le 是闭区间（包含）**。就像数学里的 > 和 >=、< 和 <=。

### 字符串约束

\`\`\`python
# demo 4：字符串字段约束
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    # min_length：最小长度，max_length：最大长度
    username: str = Field(min_length=3, max_length=20)
    # pattern：正则表达式校验
    # 这个正则要求：字母开头，只含字母数字下划线
    code: str = Field(pattern=r"^[a-zA-Z][a-zA-Z0-9_]*$")
    # 邮箱格式约束（用正则）
    email: str = Field(pattern=r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")
    # 手机号约束：1 开头的 11 位数字
    phone: str = Field(pattern=r"^1[3-9]\\d{9}$")

# 合法数据
profile = UserProfile(
    username="alice",
    code="user_001",
    email="alice@example.com",
    phone="13800138000",
)
print(profile.username)  # alice
\`\`\`

\`pattern\` 参数是 v2 新增的（v1 里叫 \`regex\`），它让你用正则表达式做格式校验。这是替代校验器最常用的方式——能写正则就别写 validator。

### 集合约束

\`\`\`python
# demo 5：列表和字典的约束
from pydantic import BaseModel, Field

class Course(BaseModel):
    # min_length/max_length 也可以约束列表长度
    tags: list[str] = Field(min_length=1, max_length=5, description="至少 1 个标签")
    # 约束列表里每个元素的最大长度（v2 不直接支持，要用 list[Annotated[str, Field(...)]])
    # 这里先演示列表长度约束
    chapters: list[int] = Field(min_length=1)
    # 字典的约束：min_items/max_items 在 v2 改成了 min_length/max_length
    config: dict[str, str] = Field(min_length=1)

course = Course(
    tags=["python", "fastapi"],
    chapters=[1, 2, 3],
    config={"level": "beginner"},
)
print(course.tags)  # ['python', 'fastapi']
\`\`\`

## 六、默认值与 Optional

字段分三种：必填、有默认值、可选（Optional）。理解三者的区别很重要。

\`\`\`python
# demo 6：默认值与 Optional 的区别
from pydantic import BaseModel, Field
from typing import Optional

class Article(BaseModel):
    # 必填字段：只写类型，不写默认值
    title: str

    # 有默认值的字段：用 = 赋默认值
    status: str = "draft"             # 默认是草稿
    view_count: int = 0               # 默认 0

    # Optional 字段：允许为 None
    # 注意：Optional[str] 只表示"可以是 None"，不自动有默认值
    # 下面这行如果不传 summary，会报错（因为没默认值）
    # summary: Optional[str]

    # 正确写法：Optional + 默认值 None
    summary: Optional[str] = None     # 可选，默认 None

    # 用 Field 提供默认值
    # default=... 表示用 ... 作为默认值（... 是 Pydantic 的特殊标记，表示"必填"）
    # default_factory 表示用工厂函数生成默认值（每次实例化都调用）
    tags: list[str] = Field(default_factory=list)  # 默认空列表
    # 注意：不要用 tags: list[str] = []，因为可变默认值会被所有实例共享！

# 实例化
a1 = Article(title="Hello")  # 只传必填字段
print(a1.status)      # draft
print(a1.summary)     # None
print(a1.tags)        # []

a2 = Article(title="World", summary="摘要", tags=["a", "b"])
print(a2.summary)     # 摘要
print(a2.tags)        # ['a', 'b']
\`\`\`

关键区别要记住：

1. **\`x: str\`**：必填，必须传值，不能是 None。
2. **\`x: str = "default"\`**：有默认值，不传就用默认值。
3. **\`x: Optional[str] = None\`**：可选，可以不传（默认 None），也可以传 None。
4. **\`x: Optional[str]\`**：理论上还是必填（必须传），只是允许传 None。实际开发中几乎总是配合 \`= None\` 使用。

关于可变默认值的坑：在普通 Python 类里，\`def func(items=[])\` 是经典陷阱（所有调用共享同一个列表）。Pydantic 的 BaseModel 也有类似问题，所以列表、字典这类可变默认值，一定要用 \`Field(default_factory=list)\` 或 \`default_factory=dict\`，而不是直接 \`=[]\`。

\`\`\`python
# demo 7：可变默认值的坑与正确写法
from pydantic import BaseModel, Field

# ❌ 错误写法：所有实例共享同一个列表（Pydantic 会警告）
# class Bad(BaseModel):
#     tags: list[str] = []

# ✅ 正确写法：用 default_factory 每次生成新列表
class Good(BaseModel):
    tags: list[str] = Field(default_factory=list)
    config: dict[str, int] = Field(default_factory=dict)

g1 = Good()
g2 = Good()
g1.tags.append("a")
print(g1.tags)  # ['a']
print(g2.tags)  # []  —— 互不影响，因为 default_factory 每次生成新列表
\`\`\`

## 七、模型实例化与属性访问

\`\`\`python
# demo 8：模型实例化的多种方式和属性访问
from pydantic import BaseModel
from typing import Optional

class Person(BaseModel):
    name: str
    age: int
    email: Optional[str] = None

# 方式 1：关键字参数实例化（最常用）
p1 = Person(name="Alice", age=30)
print(p1.name)   # Alice
print(p1.age)    # 30
print(p1.email)  # None

# 方式 2：用 ** 解包字典
data = {"name": "Bob", "age": 25, "email": "bob@test.com"}
p2 = Person(**data)
print(p2.name)   # Bob

# 属性访问：直接用点号
print(p2.name.upper())  # BOB

# 模型实例是不可变的吗？默认不是，可以修改属性
p2.age = 26
print(p2.age)  # 26

# 如果想让模型不可变，用 model_config
from pydantic import ConfigDict

class FrozenPerson(BaseModel):
    model_config = ConfigDict(frozen=True)  # 冻结，不可修改
    name: str
    age: int

fp = FrozenPerson(name="Carol", age=28)
# fp.age = 29  # 这会抛出 ValidationError
\`\`\`

## 八、校验失败的错误信息

当数据不合法时，Pydantic 抛出 \`ValidationError\`，里面包含详细的错误信息。这在 FastAPI 里会被自动转成 422 响应返回给客户端。

\`\`\`python
# demo 9：捕获校验错误并查看详情
from pydantic import BaseModel, Field, ValidationError

class Account(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    age: int = Field(ge=18, le=120)
    email: str = Field(pattern=r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")

# 故意传非法数据
bad_data = {
    "username": "ab",           # 太短
    "age": 15,                  # 太小
    "email": "not-an-email",    # 格式错
}

try:
    Account(**bad_data)
except ValidationError as e:
    # e.errors() 返回错误列表，每个错误是一个字典
    for error in e.errors():
        print(f"字段: {error['loc']}")           # 错误位置，如 ('username',)
        print(f"类型: {error['type']}")          # 错误类型，如 'string_too_short'
        print(f"信息: {error['msg']}")           # 错误信息
        print("---")
    # 输出示例：
    # 字段: ('username',)
    # 类型: string_too_short
    # 信息: String should have at least 3 characters
    # ---
    # 字段: ('age',)
    # 类型: less_than_equal
    # 信息: Input should be a valid integer, ...
    # ---
\`\`\`

错误信息里的 \`type\` 字段很有用，它是标准化的错误类型标识（如 \`string_too_short\`、\`greater_than_equal\`），前端可以据此做国际化翻译。

## 九、小结

这一章我们打下了 Pydantic 的地基：

- **Pydantic 是什么**：基于类型注解的校验序列化库，FastAPI 的发动机。
- **v1 vs v2**：v2 用 Rust 重写核心，性能提升 5-50 倍，API 大改（\`.dict()\` → \`.model_dump()\` 等）。
- **BaseModel**：所有模型的基类，继承后获得校验能力。
- **类型注解**：str/int/float/bool/list/dict/datetime/UUID 等都支持，自动类型转换。
- **Field() 约束**：gt/lt/ge/le 约束数值，min_length/max_length/pattern 约束字符串，避免手写校验器。
- **默认值**：\`= "default"\` 给定默认值，\`Optional[str] = None\` 表示可选，可变默认值用 \`default_factory\`。
- **实例化**：关键字参数或 \`**dict\` 解包，属性用点号访问。

下一章我们会学习校验器——当 Field() 的内置约束不够用时，如何用 \`@field_validator\` 和 \`@model_validator\` 写自定义校验逻辑。
`
  },

  // ============================================================
  // 第 10 章：校验器：before/after/wrap 模式
  // ============================================================
  {
    id: "fp-validators",
    group: "Pydantic 数据校验",
    icon: "🔍",
    title: "校验器：before/after/wrap 模式",
    content: `# 校验器：before/after/wrap 模式

## 一、为什么需要校验器

上一章我们学了 \`Field()\` 的内置约束：\`gt\`、\`min_length\`、\`pattern\` 等。这些覆盖了 80% 的常见校验场景。但有些校验逻辑无法用简单的约束表达，比如：

- 密码强度：要求"至少包含大写字母、小写字母、数字、特殊字符各一个"，这需要遍历字符做判断，正则也能写但很丑。
- 跨字段校验：要求 \`start_date < end_date\`，这涉及两个字段的关系，单字段约束无能为力。
- 数据清洗：用户传的字符串带前后空格，想自动 trim；传的手机号带空格和横线，想自动去掉。
- 业务规则：用户名不能是敏感词（需要查数据库或词库）；优惠券码需要调用外部接口验证。

这些场景就需要**校验器（validator）**。Pydantic v2 提供了两个装饰器：

- \`@field_validator\`：字段级校验器，针对单个字段。
- \`@model_validator\`：模型级校验器，可以访问所有字段。

## 二、@field_validator 基础

\`@field_validator\` 用来给某个字段加自定义校验逻辑。基本用法：

\`\`\`python
# demo 1：最简单的 field_validator
from pydantic import BaseModel, field_validator

class User(BaseModel):
    username: str

    # 用 @field_validator 装饰一个方法，方法名随意
    # 参数是要校验的字段名
    @field_validator("username")
    @classmethod  # 必须是类方法，Pydantic 要求
    def username_must_not_contain_space(cls, v):
        # v 是字段的值（已经经过类型转换）
        if " " in v:
            raise ValueError("用户名不能包含空格")
        return v  # 必须返回值，返回的值会成为字段的最终值

# 合法
u = User(username="alice")
print(u.username)  # alice

# 非法
# User(username="ali ce")  # 抛 ValidationError: 用户名不能包含空格
\`\`\`

几个要点：

1. **\`@classmethod\` 必须加**：Pydantic v2 要求校验器是类方法。第一个参数是 \`cls\`（类本身），不是 \`self\`。
2. **参数 \`v\` 是字段值**：在默认 mode（after）下，\`v\` 已经经过类型转换。比如字段是 \`int\`，传 \`"42"\`，校验器收到的 \`v\` 是 \`42\`。
3. **必须 return**：校验器返回的值会成为字段的最终值。如果忘了 return，字段会变成 None。你可以在这里修改值（比如 trim 空格）。
4. **抛 ValueError 表示校验失败**：Pydantic 会把 ValueError 转成 ValidationError。

## 三、三种 mode：before / after / wrap

这是 v2 校验器最核心的概念。\`@field_validator\` 有一个 \`mode\` 参数，控制校验器在类型转换的哪个阶段执行。

### 校验的三个阶段

Pydantic 处理一个字段值的过程是：

1. **接收原始输入**（raw value）：用户传的可能是字符串 "42"、整数 42、甚至 "  42  "。
2. **类型转换**（validation/coercion）：把原始值转成字段声明的类型，比如 "42" → 42。
3. **约束检查**（constraints）：检查 gt/lt/min_length 等 Field 约束。
4. **输出最终值**：赋给字段。

三种 mode 对应不同的执行时机：

- **\`mode='after'\`**（默认）：在类型转换和约束检查**之后**执行。校验器收到的 \`v\` 是已经转换好、约束检查过的值。适合做业务逻辑校验。
- **\`mode='before'\`**：在类型转换**之前**执行。校验器收到的是原始输入。适合做数据清洗（trim、去符号、格式统一）。
- **\`mode='wrap'\`**：包裹整个校验流程。你可以决定何时调用默认校验（通过 \`handler\` 参数），可以在前后插入自定义逻辑。

### mode='after'：最常用

\`\`\`python
# demo 2：mode='after'（默认）
from pydantic import BaseModel, field_validator

class Product(BaseModel):
    name: str
    price: float

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        # v 已经是 float 类型（类型转换已完成）
        # 这里做业务校验：价格必须是正数
        if v <= 0:
            raise ValueError("价格必须大于 0")
        return v

# 合法
p = Product(name="书", price=59.9)
print(p.price)  # 59.9

# 非法
# Product(name="书", price=-1)  # 价格必须大于 0
# Product(name="书", price=0)   # 价格必须大于 0
\`\`\`

after 模式的特点是：你拿到的 \`v\` 是"干净"的（已转换、已约束检查），可以放心做业务判断。大多数校验器都用这个模式。

### mode='before'：数据清洗利器

\`\`\`python
# demo 3：mode='before' 做数据清洗
from pydantic import BaseModel, field_validator

class User(BaseModel):
    username: str
    phone: str

    # before 模式：在类型转换前处理
    # 典型用途：trim 空格、统一格式
    @field_validator("username", mode="before")
    @classmethod
    def trim_username(cls, v):
        # v 是原始输入，可能是 "  alice  "
        if isinstance(v, str):
            return v.strip()  # 去掉前后空格
        return v

    # 手机号清洗：去掉空格、横线、括号
    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v):
        if isinstance(v, str):
            # 去掉所有非数字字符
            cleaned = "".join(c for c in v if c.isdigit())
            return cleaned
        return v

# 用户传了带空格和横线的手机号
u = User(username="  alice  ", phone="138-0013-8000")
print(u.username)  # alice（已 trim）
print(u.phone)     # 13800138000（已清洗）
\`\`\`

before 模式的价值在于：**在类型转换前"清洗"数据**。如果你在 after 模式里 trim，万一字段是 int，转换已经发生（可能失败）了。before 模式让你先处理原始输入，再交给 Pydantic 转换。

before 模式收到的 \`v\` 类型不确定（可能是 str、int、None），所以通常要先用 \`isinstance\` 判断。

### mode='wrap'：完全控制

\`\`\`python
# demo 4：mode='wrap' 完全控制校验流程
from pydantic import BaseModel, field_validator

class Config(BaseModel):
    port: int

    # wrap 模式：handler 是默认的校验函数
    # 你可以决定是否调用它、何时调用它
    @field_validator("port", mode="wrap")
    @classmethod
    def handle_port(cls, v, handler):
        # v 是原始输入
        # handler 是 Pydantic 默认的校验函数（类型转换 + 约束检查）

        # 自定义前置处理：支持 "default" 关键字
        if v == "default":
            return 8080  # 直接返回，跳过默认校验

        # 调用默认校验（类型转换 + 约束）
        try:
            result = handler(v)
        except Exception:
            # 默认校验失败时的兜底逻辑
            # 比如把 "端口必须是整数" 转成更友好的提示
            raise ValueError(f"端口格式不合法: {v}")

        # 自定义后置处理：端口范围检查
        if result < 0 or result > 65535:
            raise ValueError("端口必须在 0-65535 之间")
        return result

# 测试
c1 = Config(port="default")
print(c1.port)  # 8080

c2 = Config(port="3000")  # 字符串会被 handler 转成 int
print(c2.port)  # 3000

# c3 = Config(port=70000)  # 端口必须在 0-65535 之间
\`\`\`

wrap 模式最灵活也最复杂。它的 \`handler\` 参数是 Pydantic 内置的校验函数，调用它会执行类型转换和约束检查。你可以：

- 在调用 handler 前做预处理（类似 before）。
- 在调用 handler 后做后处理（类似 after）。
- 捕获 handler 的异常做兜底。
- 完全不调用 handler，自己接管全部逻辑。

日常开发中，90% 的场景用 before 或 after 就够了，wrap 主要用于框架开发或非常特殊的场景。

## 四、@model_validator：跨字段校验

\`@field_validator\` 只能访问一个字段。当你需要同时检查多个字段的关系时（比如 \`start_date < end_date\`），就用 \`@model_validator\`。

\`\`\`python
# demo 5：model_validator 做跨字段校验
from pydantic import BaseModel, model_validator
from datetime import date

class DateRange(BaseModel):
    start_date: date
    end_date: date

    # @model_validator(mode='after')：在所有字段校验完成后执行
    # 参数是 self（模型实例），可以访问所有字段
    @model_validator(mode="after")
    def check_date_order(self):
        # self 已经是校验过的实例，所有字段都已赋值
        if self.start_date >= self.end_date:
            # 抛 ValueError，Pydantic 会转成 ValidationError
            raise ValueError("开始日期必须早于结束日期")
        return self  # model_validator(after) 必须返回 self

# 合法
dr = DateRange(start_date="2024-01-01", end_date="2024-12-31")
print(dr.start_date, dr.end_date)

# 非法
# DateRange(start_date="2024-12-31", end_date="2024-01-01")
# # ValueError: 开始日期必须早于结束日期
\`\`\`

\`@model_validator(mode='after')\` 是最常用的模型校验器形式。它接收 \`self\`，此时所有字段都已校验并赋值，你可以自由访问 \`self.field1\`、\`self.field2\` 做跨字段检查。注意必须 \`return self\`。

\`@model_validator\` 也有 \`mode='before'\` 和 \`mode='wrap'\`：

\`\`\`python
# demo 6：model_validator 的 before 模式
from pydantic import BaseModel, model_validator

class User(BaseModel):
    name: str
    age: int

    # before 模式：接收原始输入字典
    # 参数是 data（dict 或其他原始类型），不是 self
    @model_validator(mode="before")
    @classmethod
    def check_input(cls, data):
        # data 是原始输入，通常是字典
        # 这里可以做字段名映射、添加默认值等
        if isinstance(data, dict):
            # 示例：兼容旧版 API 的字段名
            if "user_name" in data and "name" not in data:
                data["name"] = data.pop("user_name")
            # 示例：根据某个字段推断另一个
            if data.get("age", 0) < 18:
                data.setdefault("is_minor", True)
        return data

    is_minor: bool = False

u = User(user_name="Alice", age=15)
print(u.name)       # Alice（从 user_name 映射过来）
print(u.is_minor)   # True（年龄 < 18 自动设置）
\`\`\`

\`model_validator(mode='before')\` 接收的是**原始输入**（通常是字典），在字段校验之前执行。适合做字段名兼容、数据预处理。注意它也是 \`@classmethod\`，参数是 \`cls\` 和 \`data\`。

## 五、实战场景：手机号、邮箱、密码强度

下面用几个实战例子巩固理解。

### 密码强度校验

\`\`\`python
# demo 7：密码强度校验（after 模式）
from pydantic import BaseModel, field_validator
import re

class PasswordUser(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        # 密码强度规则：
        # 1. 至少 8 位
        # 2. 包含大写字母
        # 3. 包含小写字母
        # 4. 包含数字
        # 5. 包含特殊字符
        if len(v) < 8:
            raise ValueError("密码至少 8 位")
        if not re.search(r"[A-Z]", v):
            raise ValueError("密码必须包含大写字母")
        if not re.search(r"[a-z]", v):
            raise ValueError("密码必须包含小写字母")
        if not re.search(r"\\d", v):
            raise ValueError("密码必须包含数字")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("密码必须包含特殊字符")
        return v

# 合法密码
u = PasswordUser(username="alice", password="Abc123!@#")
print(u.username)  # alice

# 非法密码（缺特殊字符）
# PasswordUser(username="alice", password="Abc12345")
# # 密码必须包含特殊字符
\`\`\`

### 手机号归属地校验（before + after 组合）

\`\`\`python
# demo 8：组合 before 和 after 校验器
from pydantic import BaseModel, field_validator
import re

class PhoneUser(BaseModel):
    phone: str

    # before：清洗输入（去空格、横线，统一格式）
    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v):
        if isinstance(v, str):
            # 去掉所有非数字
            cleaned = re.sub(r"\\D", "", v)
            # 如果是 86 开头，去掉国际区号
            if cleaned.startswith("86") and len(cleaned) == 13:
                cleaned = cleaned[2:]
            return cleaned
        return v

    # after：校验格式（此时已是纯数字）
    @field_validator("phone")
    @classmethod
    def validate_phone_format(cls, v):
        # v 已经是 after 模式，且经过上面的 before 清洗
        if not re.match(r"^1[3-9]\\d{9}$", v):
            raise ValueError("手机号格式不正确")
        return v

# 测试各种输入格式
u1 = PhoneUser(phone="138-0013-8000")
print(u1.phone)  # 13800138000

u2 = PhoneUser(phone="86 138 0013 8000")
print(u2.phone)  # 13800138000

u3 = PhoneUser(phone="13800138000")
print(u3.phone)  # 13800138000

# 非法
# PhoneUser(phone="123456")  # 手机号格式不正确
\`\`\`

这个例子展示了 before 和 after 的配合：before 负责"把脏数据洗干净"，after 负责"验证干净数据的合法性"。职责分明，逻辑清晰。

### 用户注册：多字段联合校验

\`\`\`python
# demo 9：用户注册的完整校验
from pydantic import BaseModel, Field, field_validator, model_validator
import re

class RegisterUser(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    email: str
    password: str
    confirm_password: str
    age: int = Field(ge=0, le=150)

    # 字段级：邮箱格式
    @field_validator("email")
    @classmethod
    def email_format(cls, v):
        if not re.match(r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$", v):
            raise ValueError("邮箱格式不正确")
        return v.lower()  # 顺便统一成小写

    # 字段级：密码强度
    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("密码至少 8 位")
        if not re.search(r"[A-Z]", v):
            raise ValueError("密码必须包含大写字母")
        return v

    # 模型级：两次密码必须一致
    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("两次输入的密码不一致")
        return self

    # 模型级：未成年人不能注册（业务规则）
    @model_validator(mode="after")
    def check_age_permission(self):
        if self.age < 18:
            raise ValueError("未成年人不能注册")
        return self

# 合法注册
user = RegisterUser(
    username="alice",
    email="Alice@Example.com",
    password="Abc12345",
    confirm_password="Abc12345",
    age=25,
)
print(user.email)  # alice@example.com（已转小写）
\`\`\`

这个例子综合运用了 Field 约束、field_validator、model_validator，是实际项目里用户注册的典型写法。注意几个 model_validator 可以叠加，分别检查不同的业务规则。

## 六、校验器的注意事项

### 1. 性能考虑

校验器在每个请求里都会执行，要注意性能。不要在校验器里做耗时操作（查数据库、调外部接口）。如果必须做，考虑放到路由函数里用依赖注入处理。

### 2. 异常类型

校验器里抛 \`ValueError\` 或 \`AssertionError\`，Pydantic 都会捕获并转成 \`ValidationError\`。但抛其他异常（如 \`RuntimeError\`）不会被捕获，会直接冒泡。

\`\`\`python
# demo 10：异常类型说明
from pydantic import BaseModel, field_validator

class Demo(BaseModel):
    value: int

    @field_validator("value")
    @classmethod
    def check(cls, v):
        if v < 0:
            raise ValueError("不能为负")  # ✅ 会被捕获，转成 ValidationError
        if v > 100:
            raise AssertionError("太大了")  # ✅ AssertionError 也会被捕获
        if v == 50:
            raise RuntimeError("不允许 50")  # ❌ 不会被捕获，直接抛出
        return v
\`\`\`

### 3. 校验器顺序

多个 \`@field_validator\` 装饰同一个字段时，执行顺序是**从下到上**（即代码里靠下的先执行）。这和 Python 装饰器的语义一致。为了避免混淆，尽量一个字段只用一个校验器，复杂逻辑写在一个函数里。

## 七、小结

- **\`@field_validator\`**：字段级校验，三种 mode：
  - \`after\`（默认）：类型转换后执行，最常用。
  - \`before\`：类型转换前执行，做数据清洗。
  - \`wrap\`：包裹整个流程，通过 \`handler\` 控制何时调用默认校验。
- **\`@model_validator\`**：模型级校验，做跨字段检查：
  - \`mode='after'\`：接收 \`self\`，所有字段已就绪，最常用。
  - \`mode='before'\`：接收原始字典，做字段映射、预处理。
- **异常**：抛 \`ValueError\` 或 \`AssertionError\` 表示校验失败。
- **职责**：before 清洗数据，after 校验业务逻辑，model_validator 检查字段关系。

校验器是 Pydantic 的"杀手锏"，让你在不牺牲类型安全的前提下，表达任意复杂的校验逻辑。下一章我们学习模型的继承、嵌套和泛型，构建更复杂的数据结构。
`
  },

  // ============================================================
  // 第 11 章：模型继承、嵌套与泛型
  // ============================================================
  {
    id: "fp-model-advanced",
    group: "Pydantic 数据校验",
    icon: "🧬",
    title: "模型继承、嵌套与泛型",
    content: `# 模型继承、嵌套与泛型

## 一、为什么需要更复杂的模型结构

前两章的模型都是"扁平"的：一个 BaseModel 里全是基本类型字段。但真实世界的数据结构远比这复杂：

- 一个订单包含用户信息、商品列表、收货地址——这是**嵌套**。
- 用户、管理员、VIP 用户有很多公共字段——这是**继承**。
- 一个通用响应结构，有时返回 User，有时返回 Order——这是**泛型**。

这一章我们学习如何用 Pydantic 构建这些复杂结构。掌握之后，你就能用类型系统表达任意复杂的数据模型。

## 二、模型继承：复用字段定义

模型继承和普通 Python 类继承一样：子类继承父类的所有字段，可以添加新字段或覆盖父类字段。

\`\`\`python
# demo 1：模型继承基础
from pydantic import BaseModel
from typing import Optional

# 基类：包含所有用户的公共字段
class BaseUser(BaseModel):
    id: int
    username: str
    email: str

# 普通用户：继承 BaseUser，增加注册时间
class RegularUser(BaseUser):
    registered_at: str
    # 继承的 id、username、email 自动存在

# 管理员：继承 BaseUser，增加权限字段
class AdminUser(BaseUser):
    is_superuser: bool = True
    permissions: list[str] = []  # 默认空列表

# VIP 用户：继承 BaseUser，增加会员信息
class VIPUser(BaseModel):
    # 注意：这里演示不继承，作为对比
    id: int
    username: str
    email: str
    vip_level: int
    points: int

# 实例化
regular = RegularUser(id=1, username="alice", email="a@b.com", registered_at="2024-01-01")
print(regular.username)       # alice
print(regular.registered_at)  # 2024-01-01

admin = AdminUser(id=2, username="admin", email="admin@b.com", permissions=["read", "write"])
print(admin.is_superuser)     # True（用了默认值）
print(admin.permissions)      # ['read', 'write']
\`\`\`

继承的好处是**消除重复**。BaseUser 的三个字段（id、username、email）只定义一次，子类自动拥有。如果将来要加一个"手机号"字段，只需要改 BaseUser，所有子类都自动获得。

### 继承的字段顺序

Pydantic v2 中，字段的顺序是"父类字段在前，子类字段在后"。这影响序列化输出和文档生成的字段顺序。

\`\`\`python
# demo 2：继承的字段顺序
from pydantic import BaseModel

class A(BaseModel):
    a: int

class B(BaseModel):
    b: int

class C(A, B):
    c: int

# C 的字段顺序：a, b, c（父类在前，按继承顺序）
c = C(a=1, b=2, c=3)
print(c.model_dump())  # {'a': 1, 'b': 2, 'c': 3}
\`\`\`

### 覆盖父类字段

子类可以用不同的类型或约束覆盖父类字段。

\`\`\`python
# demo 3：覆盖父类字段
from pydantic import BaseModel, Field

class BaseProduct(BaseModel):
    name: str
    price: float = Field(gt=0)

class DiscountProduct(BaseProduct):
    # 覆盖 price，加更严格的约束
    price: float = Field(gt=0, lt=1000)  # 折扣商品价格上限 1000
    # 添加折扣字段
    discount_rate: float = Field(ge=0, le=1)

p = DiscountProduct(name="书", price=99.9, discount_rate=0.8)
print(p.price)  # 99.9
\`\`\`

注意：覆盖字段时要小心类型兼容性。如果父类是 \`str\`，子类改成 \`int\`，可能导致混乱。一般只在"加约束"或"细化类型"时覆盖。

## 三、嵌套模型：模型中包含模型

嵌套是表达复杂数据结构的核心手段。一个模型的字段类型可以是另一个模型。

\`\`\`python
# demo 4：最基础的嵌套模型
from pydantic import BaseModel

# 内层模型：地址
class Address(BaseModel):
    province: str   # 省
    city: str       # 市
    street: str     # 街道
    zip_code: str   # 邮编

# 外层模型：用户，包含地址
class User(BaseModel):
    name: str
    age: int
    # address 字段的类型是 Address 模型
    address: Address

# 实例化：嵌套用字典传入
user = User(
    name="Alice",
    age=30,
    address={
        "province": "广东",
        "city": "深圳",
        "street": "科技园路 1 号",
        "zip_code": "518000",
    },
)
# 访问嵌套字段：用点号层层访问
print(user.name)              # Alice
print(user.address.city)      # 深圳
print(user.address.zip_code)  # 518000

# 也可以先实例化内层模型，再传给外层
addr = Address(province="北京", city="北京", street="长安街 1 号", zip_code="100000")
user2 = User(name="Bob", age=25, address=addr)
print(user2.address.city)  # 北京
\`\`\`

嵌套的关键点：

1. **声明**：字段类型就是内层模型类名，如 \`address: Address\`。
2. **实例化**：可以传字典（Pydantic 自动转成模型），也可以传已实例化的模型对象。
3. **访问**：用点号 \`user.address.city\` 层层访问，每一层都是模型实例。

Pydantic 会递归校验整个嵌套结构。如果内层模型的字段不合法，会报错并指出具体位置。

\`\`\`python
# demo 5：嵌套模型的校验
from pydantic import BaseModel, ValidationError

class Item(BaseModel):
    name: str
    price: float

class Order(BaseModel):
    order_id: int
    item: Item  # 嵌套

# 内层 item 的 price 是负数，会校验失败
try:
    Order(order_id=1, item={"name": "书", "price": -10})
except ValidationError as e:
    for err in e.errors():
        print(err["loc"])  # ('item', 'price') —— 错误位置精确到嵌套字段
        # 输出: ('item', 'price')
\`\`\`

错误信息的 \`loc\` 是元组，表示错误的"路径"。\`('item', 'price')\` 表示 \`order.item.price\` 字段出错。这对前端定位错误很有帮助。

## 四、列表和字典嵌套

实际项目中，一对多关系非常常见：一个订单有多个商品，一个用户有多个收货地址。这就要用列表嵌套。

\`\`\`python
# demo 6：列表嵌套模型
from pydantic import BaseModel

class OrderItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

class Order(BaseModel):
    order_id: int
    customer_name: str
    # items 是 OrderItem 列表
    items: list[OrderItem]

# 实例化：items 传一个字典列表
order = Order(
    order_id=1001,
    customer_name="Alice",
    items=[
        {"product_id": 1, "name": "Python 书", "quantity": 2, "price": 59.9},
        {"product_id": 2, "name": "键盘", "quantity": 1, "price": 199.0},
        {"product_id": 3, "name": "鼠标", "quantity": 3, "price": 49.9},
    ],
)

# 访问列表元素
print(order.items[0].name)  # Python 书
print(len(order.items))     # 3

# 遍历
total = sum(item.quantity * item.price for item in order.items)
print(f"总价: {total}")  # 总价: 407.6
\`\`\`

\`list[OrderItem]\` 表示"OrderItem 模型的列表"。Pydantic 会校验列表里的每个元素都符合 OrderItem 的结构。这比手写 \`list[dict]\` 安全得多——dict 没有类型约束，而模型有。

字典嵌套也类似：

\`\`\`python
# demo 7：字典嵌套模型
from pydantic import BaseModel

class Score(BaseModel):
    subject: str
    score: float

class Student(BaseModel):
    name: str
    # 字典：键是字符串，值是 Score 模型
    scores: dict[str, Score]

student = Student(
    name="张三",
    scores={
        "math": {"subject": "数学", "score": 95.5},
        "english": {"subject": "英语", "score": 88.0},
    },
)
print(student.scores["math"].score)  # 95.5
\`\`\`

## 五、泛型模型：类型参数化

泛型（Generic）让你定义"类型参数化"的模型。最常见的应用是**统一响应结构**：API 返回的数据结构是 \`{code, message, data}\`，但 \`data\` 的类型因接口而异——用户接口返回 User，商品接口返回 Product。

不用泛型的话，你得为每种 data 类型写一个响应模型：

\`\`\`python
# 不用泛型：重复定义
class UserResponse(BaseModel):
    code: int
    message: str
    data: User

class ProductResponse(BaseModel):
    code: int
    message: str
    data: Product
\`\`\`

用泛型，定义一次即可。

\`\`\`python
# demo 8：泛型响应模型
from pydantic import BaseModel
from typing import Generic, TypeVar

# 1. 定义类型变量 TypeVar
T = TypeVar("T")

# 2. 用 Generic[T] 让模型成为泛型类
class ApiResponse(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: T  # data 的类型是 T，由实例化时指定

# 3. 使用时指定具体类型
class User(BaseModel):
    id: int
    name: str

class Product(BaseModel):
    id: int
    name: str
    price: float

# 用 ApiResponse[User] 创建"数据是 User 的响应模型"
UserResponse = ApiResponse[User]
# 用 ApiResponse[Product] 创建"数据是 Product 的响应模型"
ProductResponse = ApiResponse[Product]

# 实例化
user_resp = UserResponse(data={"id": 1, "name": "Alice"})
print(user_resp.code)      # 200
print(user_resp.data.name)  # Alice

product_resp = ProductResponse(data={"id": 1, "name": "书", "price": 59.9})
print(product_resp.data.price)  # 59.9

# 也可以直接实例化
resp = ApiResponse[User](data={"id": 2, "name": "Bob"})
print(resp.data.name)  # Bob
\`\`\`

泛型的几个步骤：

1. **定义 TypeVar**：\`T = TypeVar("T")\`。名字通常用 T（Type 的首字母）。
2. **继承 Generic[T]**：\`class ApiResponse(BaseModel, Generic[T])\`，同时继承 BaseModel 和 Generic。
3. **用 T 作为字段类型**：\`data: T\`。
4. **实例化时指定类型**：\`ApiResponse[User]\` 会创建一个 data 类型为 User 的具体模型。

泛型在 FastAPI 里非常实用。配合 \`response_model=ApiResponse[User]\`，你可以让每个接口的响应结构统一，同时 data 部分的类型又精确到具体模型。文档也会正确显示 data 的结构。

### 泛型列表响应

\`\`\`python
# demo 9：泛型列表响应
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    total: int           # 总数
    page: int            # 当前页
    page_size: int       # 每页大小
    data: list[T]        # 数据列表，类型是 T 的列表

class Article(BaseModel):
    id: int
    title: str

# 分页查询文章列表
ArticlePage = PageResponse[Article]
page = ArticlePage(
    total=100,
    page=1,
    page_size=10,
    data=[
        {"id": 1, "title": "Python 入门"},
        {"id": 2, "title": "FastAPI 实战"},
    ],
)
print(page.total)          # 100
print(page.data[0].title)  # Python 入门
print(len(page.data))      # 2
\`\`\`

## 六、model_dump() 与 model_validate()

这两个方法是序列化和反序列化的核心，日常开发高频使用。

\`\`\`python
# demo 10：model_dump 和 model_validate
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

# model_validate：从字典创建模型（反序列化）
data = {"id": 1, "name": "Alice", "email": "a@b.com"}
user = User.model_validate(data)  # 字典 → 模型
print(user.name)  # Alice

# model_dump：模型转字典（序列化）
dumped = user.model_dump()
print(dumped)  # {'id': 1, 'name': 'Alice', 'email': 'a@b.com'}
print(type(dumped))  # <class 'dict'>

# 嵌套模型也会递归转换
class Order(BaseModel):
    order_id: int
    user: User

order = Order(order_id=100, user={"id": 1, "name": "Alice", "email": "a@b.com"})
print(order.model_dump())
# {'order_id': 100, 'user': {'id': 1, 'name': 'Alice', 'email': 'a@b.com'}}
# 嵌套的 User 也被转成字典

# model_dump_json：直接转 JSON 字符串
print(order.model_dump_json())
# {"order_id":100,"user":{"id":1,"name":"Alice","email":"a@b.com"}}
\`\`\`

记忆方式：

- **model_validate**：验证并创建模型。输入字典/对象，输出模型实例。"读进来"。
- **model_dump**：转储为字典。输入模型实例，输出字典。"写出去"。
- **model_dump_json**：转储为 JSON 字符串。

## 七、别名 alias 与 populate_by_name

有时候，外部数据的字段名和 Python 模型的字段名不一致。比如数据库字段是 \`user_name\`，但 Python 里你想用 \`username\`；或者 JSON 用驼峰 \`userName\`，Python 用下划线 \`user_name\`。这时用别名（alias）。

\`\`\`python
# demo 11：别名的使用
from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):
    # 让 username 字段接受 "user_name" 这个别名
    # alias 是输入时识别的名字
    username: str = Field(alias="user_name")
    age: int

# 实例化时用别名
user = User(user_name="Alice", age=30)
print(user.username)  # Alice（注意：访问属性还是用字段名 username）

# 默认情况下，用字段名实例化会报错
# User(username="Alice", age=30)  # ❌ 报错，因为默认只接受 alias

# 如果想同时支持字段名和 alias，用 populate_by_name
class User2(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    username: str = Field(alias="user_name")
    age: int

# 现在 alias 和字段名都能用
u1 = User2(user_name="Alice", age=30)  # ✅ 用 alias
u2 = User2(username="Bob", age=25)      # ✅ 用字段名
print(u1.username, u2.username)  # Alice Bob
\`\`\`

别名的工作机制：

- **输入**（model_validate / 实例化）：默认只认 alias。\`populate_by_name=True\` 后，alias 和字段名都认。
- **输出**（model_dump）：默认用字段名。加 \`by_alias=True\` 才用 alias。

\`\`\`python
# demo 12：别名在序列化时的行为
from pydantic import BaseModel, Field

class User(BaseModel):
    username: str = Field(alias="user_name")
    age: int

user = User(user_name="Alice", age=30)

# 默认 model_dump 用字段名
print(user.model_dump())
# {'username': 'Alice', 'age': 30}

# by_alias=True 用 alias
print(user.model_dump(by_alias=True))
# {'user_name': 'Alice', 'age': 30}
\`\`\`

这在对接外部 API 时很有用：接收数据时用对方的字段名（alias），内部处理用 Python 风格的字段名，返回响应时再用 \`by_alias=True\` 转回对方的字段名。

### 驼峰转下划线的实战

\`\`\`python
# demo 13：驼峰转下划线（常见于对接前端 JS 风格）
from pydantic import BaseModel, Field
from pydantic.alias_generators import to_snake

# 配置 alias_generator 自动生成别名
class User(BaseModel):
    model_config = {"alias_generator": to_snake, "populate_by_name": True}
    userId: int       # 别名自动是 user_id
    userName: str     # 别名自动是 user_name
    isActive: bool    # 别名自动是 is_active

# 用下划线别名接收
user = User(user_id=1, user_name="Alice", is_active=True)
# 用驼峰字段名也能访问
print(user.userId)     # 1
print(user.userName)   # Alice

# 序列化时用别名
print(user.model_dump(by_alias=True))
# {'user_id': 1, 'user_name': 'Alice', 'is_active': True}
\`\`\`

\`alias_generator\` 是批量生成别名的高级功能。\`to_snake\` 是 Pydantic 内置的转换函数，把驼峰转下划线。这样你不用手动给每个字段写 alias，一行配置搞定。

## 八、小结

- **继承**：子类继承父类字段，消除重复。字段顺序是父类在前。
- **嵌套**：字段类型是另一个模型，表达"包含"关系。递归校验，错误 loc 精确定位。
- **列表/字典嵌套**：\`list[Model]\`、\`dict[str, Model]\`，表达一对多关系。
- **泛型**：\`Generic[T]\` + \`TypeVar\`，类型参数化。最常用于统一响应结构 \`ApiResponse[T]\`。
- **model_dump / model_validate**：序列化与反序列化的核心方法。
- **别名**：\`Field(alias="...")\` 解决字段名不一致，\`populate_by_name\` 允许同时用字段名和别名，\`alias_generator\` 批量生成别名。

这一章让你的模型从"单层扁平"进化到"多层复杂结构"。下一章我们深入序列化，学习 model_dump 的各种参数、自定义序列化器和计算字段。
`
  },

  // ============================================================
  // 第 12 章：序列化与别名机制
  // ============================================================
  {
    id: "fp-serialization",
    group: "Pydantic 数据校验",
    icon: "📦",
    title: "序列化与别名机制",
    content: `# 序列化与别名机制

## 一、序列化是什么，为什么重要

序列化（serialization）是把内存中的对象转换成可以传输或存储的格式（通常是 JSON 或字典）的过程。反序列化（deserialization）则是相反的过程。

在 Web API 开发中，序列化无处不在：

- **请求进来**：客户端发来 JSON，框架要把它反序列化成 Python 对象（Pydantic 模型）。
- **响应出去**：你的函数返回 Python 对象，框架要把它序列化成 JSON 发给客户端。

FastAPI 把这两件事都交给 Pydantic 处理。理解 Pydantic 的序列化 API，你就能精确控制"数据怎么进来、怎么出去"。

这一章我们深入学习：

- \`model_dump()\` 的各种参数，控制输出哪些字段、用什么格式。
- \`model_dump_json()\` 直接输出 JSON 字符串。
- \`model_validate()\` 和 \`model_validate_json()\` 从不同来源创建模型。
- \`@field_serializer\` / \`@model_serializer\` 自定义序列化逻辑。
- \`@computed_field\` 添加计算字段到序列化输出。

## 二、model_dump() 参数详解

\`model_dump()\` 把模型转成字典。它有很多参数控制输出行为，这是日常开发最常用的方法。

\`\`\`python
# demo 1：model_dump 的基础用法
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool = True

user = User(id=1, name="Alice", email="a@b.com")
print(user.model_dump())
# {'id': 1, 'name': 'Alice', 'email': 'a@b.com', 'is_active': True}
\`\`\`

### exclude / include：控制输出哪些字段

\`\`\`python
# demo 2：exclude 和 include
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    password_hash: str

user = User(id=1, name="Alice", email="a@b.com", password_hash="xxxxx")

# exclude：排除指定字段（常用于隐藏敏感字段）
print(user.model_dump(exclude={"password_hash"}))
# {'id': 1, 'name': 'Alice', 'email': 'a@b.com'}

# include：只包含指定字段（白名单模式）
print(user.model_dump(include={"id", "name"}))
# {'id': 1, 'name': 'Alice'}

# 嵌套模型的 exclude
class Post(BaseModel):
    title: str
    content: str
    author: User

post = Post(
    title="Hello",
    content="World",
    author={"id": 1, "name": "Alice", "email": "a@b.com", "password_hash": "xxx"},
)
# 排除嵌套字段：用字典指定路径
print(post.model_dump(exclude={"author": {"password_hash"}}))
# {'title': 'Hello', 'content': 'World', 'author': {'id': 1, 'name': 'Alice', 'email': 'a@b.com'}}
\`\`\`

\`exclude\` 和 \`include\` 在 API 开发中极常用。比如返回用户信息时，绝不能把 \`password_hash\` 暴露出去——用 \`exclude={"password_hash"}\` 就能安全过滤。FastAPI 的 \`response_model\` 底层也是靠类似机制实现的。

### exclude_unset：只输出明确设置过的字段

\`\`\`python
# demo 3：exclude_unset 的作用
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str = "default@example.com"  # 有默认值
    is_active: bool = True              # 有默认值

# 只传必填字段，email 和 is_active 用默认值
user = User(id=1, name="Alice")
print(user.model_dump())
# {'id': 1, 'name': 'Alice', 'email': 'default@example.com', 'is_active': True}

# exclude_unset=True：只输出"实例化时明确传入"的字段
print(user.model_dump(exclude_unset=True))
# {'id': 1, 'name': 'Alice'}
# email 和 is_active 没传，用默认值，所以不输出

# 对比：如果明确传了 email
user2 = User(id=2, name="Bob", email="bob@test.com")
print(user2.model_dump(exclude_unset=True))
# {'id': 2, 'name': 'Bob', 'email': 'bob@test.com'}
# is_active 没传，不输出
\`\`\`

\`exclude_unset\` 的用途：PATCH 请求（部分更新）。客户端只发想更新的字段，服务器用 \`exclude_unset=True\` 拿到"客户端实际想改的字段"，避免把没传的字段误更新成默认值。

\`\`\`python
# demo 4：exclude_unset 在 PATCH 更新中的应用
from pydantic import BaseModel

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    age: int | None = None

def update_user(user_id: int, update_data: dict):
    # 模拟数据库里的用户
    db_user = {"id": user_id, "name": "Alice", "email": "a@b.com", "age": 30}

    # 用 UserUpdate 校验输入
    update = UserUpdate(**update_data)

    # exclude_unset=True：只拿到客户端实际传入的字段
    # 这样不会把没传的字段（None）误更新进数据库
    update_dict = update.model_dump(exclude_unset=True)
    print(f"要更新的字段: {update_dict}")

    # 应用更新
    db_user.update(update_dict)
    return db_user

# 客户端只想改名字
result = update_user(1, {"name": "NewName"})
# 输出: 要更新的字段: {'name': 'NewName'}
print(result)
# {'id': 1, 'name': 'NewName', 'email': 'a@b.com', 'age': 30}
# email 和 age 没被误改成 None
\`\`\`

### exclude_none：排除值为 None 的字段

\`\`\`python
# demo 5：exclude_none
from pydantic import BaseModel

class Article(BaseModel):
    title: str
    summary: str | None = None
    cover_url: str | None = None
    content: str

article = Article(title="标题", content="正文", summary="摘要")
# cover_url 没传，是 None
print(article.model_dump())
# {'title': '标题', 'summary': '摘要', 'cover_url': None, 'content': '正文'}

# exclude_none=True：去掉值为 None 的字段
print(article.model_dump(exclude_none=True))
# {'title': '标题', 'summary': '摘要', 'content': '正文'}
# cover_url 是 None，被排除了
\`\`\`

\`exclude_none\` 适合"可选字段可能为空"的场景。比如文章的封面图，没上传时是 None，输出时去掉比留着 \`null\` 更干净。

### by_alias：用别名输出

\`\`\`python
# demo 6：by_alias
from pydantic import BaseModel, Field

class User(BaseModel):
    user_id: int = Field(alias="userId")
    user_name: str = Field(alias="userName")

user = User(userId=1, userName="Alice")

# 默认用字段名
print(user.model_dump())
# {'user_id': 1, 'user_name': 'Alice'}

# by_alias=True 用别名
print(user.model_dump(by_alias=True))
# {'userId': 1, 'userName': 'Alice'}
\`\`\`

对接前端 JS（驼峰命名）时，\`by_alias=True\` 让输出符合对方的命名习惯。

## 三、model_dump_json()：直接输出 JSON 字符串

\`model_dump()\` 输出字典，\`model_dump_json()\` 输出 JSON 字符串。参数和 \`model_dump()\` 基本一致。

\`\`\`python
# demo 7：model_dump_json
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

user = User(id=1, name="Alice", email="a@b.com")

# 直接输出 JSON 字符串
json_str = user.model_dump_json()
print(json_str)
# {"id":1,"name":"Alice","email":"a@b.com"}
print(type(json_str))  # <class 'str'>

# 同样支持 exclude/include/by_alias 等参数
print(user.model_dump_json(exclude={"email"}, indent=2))
# {
#   "id": 1,
#   "name": "Alice"
# }

# indent 参数控制缩进，便于阅读
\`\`\`

\`model_dump_json()\` 比 \`json.dumps(model.dump())\` 更高效，因为 Pydantic 内部直接生成 JSON，不经过中间字典。对于大对象，性能差异明显。

## 四、model_validate() 与 model_validate_json()

这两个方法用于"反序列化"——从外部数据创建模型。

\`\`\`python
# demo 8：model_validate vs model_validate_json
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

# model_validate：从 Python 对象（字典）创建
data = {"id": 1, "name": "Alice", "email": "a@b.com"}
user1 = User.model_validate(data)
print(user1.name)  # Alice

# model_validate_json：从 JSON 字符串创建
json_str = '{"id": 2, "name": "Bob", "email": "b@b.com"}'
user2 = User.model_validate_json(json_str)
print(user2.name)  # Bob
\`\`\`

两者的区别：

- **model_validate**：接收 Python 对象（通常是 dict）。如果你已经有 dict（比如 FastAPI 帮你解析好的请求体），用这个。
- **model_validate_json**：接收 JSON 字符串。如果你拿到的是原始 JSON 文本（比如从 Redis 读取的缓存），用这个——它跳过了"先 json.loads 成 dict 再校验"的中间步骤，更快。

\`\`\`python
# demo 9：实际应用场景对比
import json
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str

# 场景 1：从 HTTP 请求体解析（FastAPI 帮你做了这步）
# 通常你不需要手动调用，FastAPI 自动用 model_validate
request_body = {"id": 1, "name": "Alice"}
user = User.model_validate(request_body)

# 场景 2：从 Redis 读取缓存的 JSON 字符串
cached_json = '{"id": 2, "name": "Bob"}'
# 用 model_validate_json 直接解析，跳过 json.loads
user = User.model_validate_json(cached_json)
print(user.name)  # Bob

# 对比：不用 model_validate_json 的话，要两步
# user = User(**json.loads(cached_json))  # 多一次 json.loads
\`\`\`

## 五、@field_serializer：自定义字段序列化

有时候，默认的序列化行为不符合需求。比如 datetime 默认序列化成 ISO 字符串，但你想要自定义格式；或者你想把某个枚举序列化成中文名。这时用 \`@field_serializer\`。

\`\`\`python
# demo 10：自定义字段序列化
from pydantic import BaseModel, field_serializer
from datetime import datetime

class Event(BaseModel):
    name: str
    # datetime 默认序列化成 ISO 格式 "2024-01-15T10:30:00"
    timestamp: datetime

    # @field_serializer 装饰器，参数是字段名
    # 方法接收两个参数：self 和 value（字段的值）
    @field_serializer("timestamp")
    def serialize_timestamp(self, value: datetime) -> str:
        # 自定义：格式化成 "2024-01-15 10:30:00"
        return value.strftime("%Y-%m-%d %H:%M:%S")

event = Event(name="登录", timestamp="2024-01-15T10:30:00")
print(event.timestamp)  # 2024-01-15 10:30:00（datetime 对象）

# 序列化时用自定义格式
print(event.model_dump())
# {'name': '登录', 'timestamp': '2024-01-15 10:30:00'}

print(event.model_dump_json())
# {"name":"登录","timestamp":"2024-01-15 10:30:00"}
\`\`\`

\`@field_serializer\` 的返回值就是该字段在序列化结果中的值。你可以返回任何 JSON 可序列化的类型（str/int/float/bool/list/dict/None）。

### 枚举的自定义序列化

\`\`\`python
# demo 11：枚举字段的自定义序列化
from pydantic import BaseModel, field_serializer
from enum import Enum

class Status(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Order(BaseModel):
    id: int
    status: Status

    # 把枚举值序列化成中文
    STATUS_LABELS = {
        Status.PENDING: "待审核",
        Status.APPROVED: "已通过",
        Status.REJECTED: "已拒绝",
    }

    @field_serializer("status")
    def serialize_status(self, value: Status) -> str:
        return self.STATUS_LABELS.get(value, value.value)

order = Order(id=1, status="approved")
print(order.status)  # Status.APPROVED（内部还是枚举）
print(order.model_dump())
# {'id': 1, 'status': '已通过'}（序列化时变成中文）
\`\`\`

## 六、@model_serializer：自定义整个模型的序列化

如果你要控制整个模型的序列化逻辑（不只是单个字段），用 \`@model_serializer\`。

\`\`\`python
# demo 12：model_serializer
from pydantic import BaseModel, model_serializer

class User(BaseModel):
    id: int
    name: str
    email: str

    # @model_serializer 装饰的方法接收 self
    # handler 是默认的序列化函数，调用它会得到默认的字典
    @model_serializer
    def custom_serialize(self, handler):
        # 先调用默认序列化
        result = handler(self)
        # 添加额外字段
        result["display_name"] = f"用户:{self.name}"
        # 可以修改或删除字段
        result["email"] = result["email"].lower()
        return result

user = User(id=1, name="Alice", email="A@B.COM")
print(user.model_dump())
# {'id': 1, 'name': 'Alice', 'email': 'a@b.com', 'display_name': '用户:Alice'}
\`\`\`

\`@model_serializer\` 通过 \`handler\` 参数让你访问默认的序列化结果，然后在此基础上修改。这比 \`@field_serializer\` 更灵活，但也更"全局"——影响整个模型的所有字段。一般优先用 \`@field_serializer\`，只有需要跨字段操作时才用 \`@model_serializer\`。

## 七、@computed_field：计算字段

计算字段（computed field）是一种特殊的"字段"：它不是存储的值，而是根据其他字段计算出来的。但它会出现在序列化结果里。

\`\`\`python
# demo 13：computed_field 计算字段
from pydantic import BaseModel, computed_field

class Product(BaseModel):
    name: str
    price: float          # 单价
    quantity: int          # 数量

    # @computed_field 装饰一个 @property
    # 它会出现在 model_dump() 和 model_dump_json() 里
    @computed_field
    @property
    def total(self) -> float:
        # 根据单价和数量计算总价
        return self.price * self.quantity

    # 也可以返回复杂类型
    @computed_field
    @property
    def summary(self) -> str:
        return f"{self.name} x {self.quantity} = {self.total}"

product = Product(name="书", price=59.9, quantity=3)

# 计算字段自动出现在序列化结果里
print(product.model_dump())
# {'name': '书', 'price': 59.9, 'quantity': 3, 'total': 179.7, 'summary': '书 x 3 = 179.7'}

# JSON 序列化也包含计算字段
print(product.model_dump_json())
# {"name":"书","price":59.9,"quantity":3,"total":179.7,"summary":"书 x 3 = 179.7"}

# 但计算字段不是真实字段，不能在实例化时传入
# Product(name="书", price=59.9, quantity=3, total=100)  # ❌ 报错
\`\`\`

计算字段的要点：

1. **必须配合 \`@property\`**：\`@computed_field\` 装饰器要放在 \`@property\` 上面。
2. **返回类型注解建议写**：\`-> float\` 让文档和类型检查器知道返回类型。
3. **只读**：计算字段不能赋值，因为它是由其他字段算出来的。
4. **自动序列化**：默认出现在 \`model_dump()\` 和 \`model_dump_json()\` 里。
5. **不参与校验**：计算字段不是输入字段，实例化时不能传。

计算字段的典型应用：

- 派生数据：总价 = 单价 × 数量；全名 = 姓 + 名；年龄 = 由生日计算。
- 格式化数据：\`display_url\` 由 \`scheme + host + path\` 拼接。
- 状态判断：\`is_adult\` 由 \`age >= 18\` 计算。

### 计算字段与别名

\`\`\`python
# demo 14：计算字段也可以有别名
from pydantic import BaseModel, computed_field, Field
from typing import Optional

class Rectangle(BaseModel):
    width: float
    height: float

    @computed_field(alias="area")
    @property
    def computed_area(self) -> float:
        return self.width * self.height

    @computed_field
    @property
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

rect = Rectangle(width=3, height=4)
# 默认用方法名作为字段名
print(rect.model_dump())
# {'width': 3.0, 'height': 4.0, 'computed_area': 12.0, 'perimeter': 14.0}

# by_alias=True 用别名
print(rect.model_dump(by_alias=True))
# {'width': 3.0, 'height': 4.0, 'area': 12.0, 'perimeter': 14.0}
\`\`\`

## 八、综合实战：用户信息接口的序列化控制

\`\`\`python
# demo 15：综合实战
from pydantic import BaseModel, Field, field_serializer, computed_field
from datetime import datetime

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str  # 内部字段，不能暴露
    created_at: datetime
    is_active: bool = True
    login_count: int = 0

    # 自定义时间序列化
    @field_serializer("created_at")
    def serialize_time(self, value: datetime) -> str:
        return value.strftime("%Y-%m-%d %H:%M:%S")

    # 计算字段：账号年龄（天数）
    @computed_field
    @property
    def account_age_days(self) -> int:
        return (datetime.now() - self.created_at).days

    # 计算字段：状态描述
    @computed_field
    @property
    def status_label(self) -> str:
        return "活跃" if self.is_active else "禁用"

# 模拟从数据库取出的用户
user = UserResponse(
    id=1,
    username="alice",
    email="alice@example.com",
    password_hash="$2b$12$xxxxx",
    created_at="2024-01-01T00:00:00",
    login_count=42,
)

# 公开 API：隐藏密码，用别名
public_data = user.model_dump(exclude={"password_hash"}, by_alias=False)
print(public_data)
# {'id': 1, 'username': 'alice', 'email': 'alice@example.com',
#  'created_at': '2024-01-01 00:00:00', 'is_active': True, 'login_count': 42,
#  'account_age_days': ..., 'status_label': '活跃'}

# 内部 API：包含所有字段
internal_data = user.model_dump()
print("password_hash" in internal_data)  # True
\`\`\`

这个例子综合运用了 \`exclude\`、\`@field_serializer\`、\`@computed_field\`，是实际项目里"同一模型不同场景不同输出"的典型实现。通过参数控制，一个模型能灵活适配多种序列化需求，而不是定义多个模型。

## 九、小结

- **model_dump()**：模型转字典，核心参数：
  - \`exclude\` / \`include\`：排除/包含指定字段。
  - \`exclude_unset\`：只输出实例化时明确传入的字段（PATCH 更新利器）。
  - \`exclude_none\`：排除 None 值字段。
  - \`by_alias\`：用别名输出。
- **model_dump_json()**：直接输出 JSON 字符串，比 \`json.dumps(dump())\` 高效。
- **model_validate()**：从 dict 创建模型。
- **model_validate_json()**：从 JSON 字符串创建模型，跳过 json.loads。
- **@field_serializer**：自定义单个字段的序列化逻辑。
- **@model_serializer**：自定义整个模型的序列化逻辑。
- **@computed_field**：添加计算字段，根据其他字段算出来，自动出现在序列化结果里。

序列化是 API 的"出口控制"。掌握了这些工具，你就能精确决定"给客户端看什么、不看什么、怎么看"。下一批章节我们将进入响应处理，学习 FastAPI 如何用 \`response_model\` 在框架层面控制响应。
`
  }
];
