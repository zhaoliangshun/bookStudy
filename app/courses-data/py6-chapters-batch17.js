export const chapters = [
  {
    id: "py6-typing-advanced2",
    group: "现代库与框架",
    icon: "🏷️",
    title: "typing 模块进阶（泛型/TypeVar/ParamSpec）",
    content: `## typing 模块进阶：泛型、TypeVar、ParamSpec 与现代类型工具

### 一、为什么需要进阶类型工具

Python 类型提示（PEP 484）从 3.5 起逐步成为生态标准，但基础类型注解只能描述"这个变量是什么类型"。当我们要描述**类型之间的约束关系**（比如函数返回类型与参数类型一致）、**函数签名透传**（装饰器不破坏被装饰函数的参数类型）、**结构化字典**、**字面量取值**时，基础注解就力不从心了。

\`typing\` 模块进阶工具正是为解决这些问题而生：

- \`TypeVar\` + \`Generic\`：泛型，让容器与函数保持类型一致性
- \`ParamSpec\`：参数说明符，透传函数的参数签名（装饰器必备）
- \`TypeAlias\` / \`TypeAliasType\`：类型别名
- \`NewType\`：语义化新类型
- \`Literal\`：字面量类型
- \`Final\`：不可变注解
- \`TypedDict\`：结构化字典
- \`Protocol\`：结构化子类型（鸭子类型的形式化）

### 二、TypeVar 泛型类型变量

\`TypeVar\` 是泛型的核心。它表示一个"待确定的类型"，在具体调用时被实例化。

\`\`\`python
from typing import TypeVar, Generic

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

# 调用 first([1, 2, 3]) 时 T 被绑定为 int，返回 int
# 调用 first(["a", "b"]) 时 T 被绑定为 str，返回 str
\`\`\`

TypeVar 还支持约束（constraints）和边界（bound）：

\`\`\`python
from typing import TypeVar
# 约束：T 只能是 str 或 bytes
TStrOrBytes = TypeVar("TStrOrBytes", str, bytes)

# 边界：T 必须是 Number 的子类
from numbers import Number
TNum = TypeVar("TNum", bound=Number)
\`\`\`

> ⚠️ **避坑**：约束（逗号分隔类型）与边界（\`bound=\`）语义完全不同。约束表示"必须是这几个之一"，边界表示"必须是其子类"。混用会导致类型检查行为异常。

### 三、Generic 基类

\`Generic[T]\` 让类成为泛型容器：

\`\`\`python
from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()

# 显式声明类型
s: Stack[int] = Stack()
s.push(1)
# s.push("x")  # mypy 报错
\`\`\`

泛型类的类型变量在实例化时绑定，所有方法共享同一类型变量。

### 四、ParamSpec：透传参数签名（Python 3.10+）

装饰器是 Python 的常见模式，但传统装饰器会丢失被装饰函数的类型信息：

\`\`\`python
def log(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@log
def add(a: int, b: int) -> int:
    return a + b
# mypy 不知道 add 的真实签名，只能推断为 (*args: Any, **kwargs: Any) -> Any
\`\`\`

\`ParamSpec\` 解决了这个问题。它捕获函数的参数签名（位置参数 + 关键字参数）并完整透传：

\`\`\`python
from typing import ParamSpec, TypeVar, Callable
import functools

P = ParamSpec("P")     # 表示参数签名
R = TypeVar("R")       # 表示返回类型

def log(func: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@log
def add(a: int, b: int) -> int:
    return a + b
# add 的签名被完整保留：mypy 仍知道 add(a: int, b: int) -> int
\`\`\`

\`P.args\` 和 \`P.kwargs\` 是 ParamSpec 的两个特殊属性，只能用在 \`*args\` 和 \`**kwargs\` 位置。

### 五、TypeAlias 与 TypeAliasType

\`TypeAlias\`（3.10+）显式声明类型别名，解决歧义：

\`\`\`python
from typing import TypeAlias

# 不用 TypeAlias，无法区分"别名"和"普通变量"
UserId = int

# 显式声明为别名
UserId: TypeAlias = int
Config: TypeAlias = dict[str, list[int]]
\`\`\`

Python 3.12 引入 \`TypeAliasType\`（PEP 695 之外的惰性别名），支持递归别名：

\`\`\`python
from typing import TypeAliasType

# 递归 JSON 类型
Json = TypeAliasType("Json", "dict[str, Json] | list[Json] | str | int | float | bool | None")
\`\`\`

### 六、NewType：语义化新类型

\`NewType\` 创建一个运行时不变、静态检查有别的"新类型"：

\`\`\`python
from typing import NewType

UserId = NewType("UserId", int)
OrderId = NewType("OrderId", int)

def get_user(uid: UserId) -> None: ...

get_user(UserId(42))   # 正确
get_user(OrderId(42))  # mypy 报错：类型不匹配
get_user(42)           # mypy 报错：缺少 UserId 包装
\`\`\`

> 💡 **原理**：\`NewType\` 运行时是一个无操作的函数（\`lambda x: x\`），仅作为静态检查的标记。它不带来运行时开销，却能防止"用户 ID 和订单 ID 混用"这类逻辑错误。

### 七、Literal 字面量类型

\`Literal\` 限定变量只能取特定字面值：

\`\`\`python
from typing import Literal

def set_mode(mode: Literal["r", "w", "a"]) -> None: ...

set_mode("r")   # 正确
set_mode("x")   # mypy 报错
\`\`\`

常用于状态机、配置枚举、API 参数校验。\`Literal\` 与 \`Enum\` 的区别：\`Literal\` 无需定义枚举类，更轻量；\`Enum\` 提供运行时检查和迭代能力。

### 八、Final 不可变注解

\`Final\` 声明"这个名字不应被重新赋值"：

\`\`\`python
from typing import Final

MAX_SIZE: Final[int] = 100
# MAX_SIZE = 200  # mypy 报错

class Config:
    TIMEOUT: Final[int] = 30
\`\`\`

\`Final\` 是静态检查约束，运行时不强制（不同于 \`const\`）。它常用于模块级常量、配置默认值。

### 九、TypedDict 结构化字典

普通 \`dict[str, Any]\` 丢失了字段信息。\`TypedDict\` 描述"键值类型固定的字典"：

\`\`\`python
from typing import TypedDict

class UserDict(TypedDict):
    id: int
    name: str
    email: str | None  # 可选字段

u: UserDict = {"id": 1, "name": "Alice", "email": None}
# u["id"] = "x"  # mypy 报错
\`\`\`

支持 \`total=False\`（所有字段可选）和 \`Required\` / \`NotRequired\`（3.11+）细粒度控制。

### 十、Protocol 协议（结构化子类型）

\`Protocol\` 形式化"鸭子类型"——不要求继承，只要有对应方法就算符合：

\`\`\`python
from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def cleanup(resource: SupportsClose) -> None:
    resource.close()

class FileLike:
    def close(self) -> None: ...

cleanup(FileLike())  # 正确，无需继承 SupportsClose
\`\`\`

\`Protocol\` 与 \`ABC\` 的区别：

| 特性 | Protocol | ABC |
|------|----------|-----|
| 子类型方式 | 结构化（鸭子） | 名义化（继承） |
| 是否需继承 | 否 | 是 |
| 适合场景 | 第三方类型适配 | 框架内部接口 |
| 运行时检查 | \`isinstance\` 需 \`runtime_checkable\` | 原生支持 |

### 十一、业务场景

- **API 层 DTO**：用 \`TypedDict\` 描述请求/响应结构，\`Pydantic\` 做运行时校验
- **泛型仓库**：\`Repository[T]\` 统一数据访问层，避免每个实体重复代码
- **装饰器**：\`ParamSpec\` 让日志/重试/缓存装饰器保留原函数类型
- **领域建模**：\`NewType\` 区分 \`UserId\` / \`OrderId\`，防止 ID 混用

### 十二、避坑提示

1. **ParamSpec 不能与 TypeVar 混用 args/kwargs**：\`P.args\` 必须配合 \`P.kwargs\`，不能单独使用
2. **Generic 的类型变量在继承时绑定**：\`class IntStack(Stack[int])\` 后 IntStack 不再是泛型
3. **TypedDict 运行时是普通 dict**：\`isinstance\` 检查无效，需要 mypy 或 pydantic 校验
4. **Protocol 默认不支持 isinstance**：需加 \`@runtime_checkable\`，但只检查方法存在性，不检查签名
5. **Literal 不能用变量**：\`Literal[MODE]\` 无效，\`MODE\` 必须是字面量

### 十三、原理深入

类型提示在运行时被存储在 \`__annotations__\` 属性中，但 Python 解释器**不主动检查**。类型检查由 mypy、pyright 等外部工具完成。

\`typing\` 模块的核心机制：
- \`TypeVar\` 是一个特殊对象，记录名字、约束、边界
- \`Generic\` 通过 \`__class_getitem__\` 实现 \`Stack[int]\` 语法
- \`ParamSpec\` 内部维护参数签名占位符，\`P.args\` / \`P.kwargs\` 是其组件属性
- \`Protocol\` 的 \`_is_protocol=True\` 标记，配合 \`runtime_checkable\` 装饰器实现 \`isinstance\` 支持

mypy 的工作流程：解析 AST → 收集注解 → 类型推断（沿控制流传播）→ 子类型判断 → 报告错误。

### 十四、最佳实践

- 优先使用 \`TypeVar\` 让函数保持类型一致性，而非 \`Any\`
- 装饰器一律用 \`ParamSpec\`，避免类型丢失
- 用 \`Protocol\` 定义接口，比 \`ABC\` 更灵活
- 用 \`TypedDict\` 替代 \`dict[str, Any]\` 描述结构化数据
- 用 \`Literal\` 限定取值范围，比 \`Enum\` 更轻量
- 用 \`Final\` 标记常量，配合 mypy 防止误改
- \`NewType\` 用于区分语义相同但用途不同的基础类型`,
    code: `# typing 进阶演示：全部使用标准库 typing 模块
# 演示 TypeVar / Generic / ParamSpec / NewType / Literal / Final / TypedDict / Protocol

import sys
print("=== typing 模块进阶演示 ===")
print(f"Python 版本: {sys.version.split()[0]}\\n")

# --- 1. TypeVar 泛型 ---
print("--- 1. TypeVar 泛型类型变量 ---")
from typing import TypeVar, Generic

T = TypeVar("T")

def first(items):
    """运行时不强制类型，仅演示概念"""
    return items[0] if items else None

# 模拟 mypy 推断：根据入参类型推断返回类型
samples = [[1, 2, 3], ["a", "b"], [3.14, 2.71]]
for s in samples:
    val = first(s)
    print(f"  first({s}) = {val!r}, 推断返回类型 = {type(val).__name__}")

# --- 2. Generic 泛型类 ---
print("\\n--- 2. Generic 泛型容器 ---")

class Stack(Generic[T]):
    """模拟泛型栈"""
    def __init__(self):
        self._items = []
    def push(self, item):
        self._items.append(item)
    def pop(self):
        return self._items.pop() if self._items else None
    def __len__(self):
        return len(self._items)

int_stack = Stack()
int_stack.push(1)
int_stack.push(2)
print(f"  int_stack 弹出: {int_stack.pop()} (期望 int)")
str_stack = Stack()
str_stack.push("hello")
print(f"  str_stack 弹出: {int_stack.pop() if False else str_stack.pop()!r} (期望 str)")

# --- 3. ParamSpec 概念演示 ---
print("\\n--- 3. ParamSpec 装饰器签名透传 ---")
import functools

if sys.version_info >= (3, 10):
    from typing import ParamSpec, TypeVar as _TV, Callable
    P = ParamSpec("P")
    R = _TV("R")

    def log(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"    [log] 调用 {func.__name__}(args={args}, kwargs={kwargs})")
            return func(*args, **kwargs)
        return wrapper

    @log
    def add(a, b):
        return a + b

    print(f"  add(2, 3) = {add(2, 3)}")
    print(f"  add 的签名保留: {add.__wrapped__.__name__ if hasattr(add, '__wrapped__') else 'N/A'}")
else:
    print("  Python < 3.10，跳过 ParamSpec 实例，演示概念：装饰器透传 (*args, **kwargs)")

# --- 4. NewType 语义化类型 ---
print("\\n--- 4. NewType 语义化新类型 ---")
from typing import NewType

UserId = NewType("UserId", int)
OrderId = NewType("OrderId", int)

def get_user(uid):
    """参数语义为 UserId，运行时仍是 int"""
    return f"用户#{uid}"

# NewType 运行时是恒等函数
print(f"  UserId(42) 运行时值: {UserId(42)}, 类型: {type(UserId(42)).__name__}")
print(f"  get_user(UserId(42)) = {get_user(UserId(42))}")
print("  静态检查：get_user(OrderId(42)) 会报类型不匹配")

# --- 5. Literal 字面量类型 ---
print("\\n--- 5. Literal 字面量类型 ---")
from typing import Literal, get_args

Mode = Literal["r", "w", "a"]
allowed_modes = get_args(Mode)
print(f"  Literal 允许的值: {allowed_modes}")

def set_mode(mode):
    if mode not in allowed_modes:
        raise ValueError(f"非法模式: {mode}")
    return f"模式设为 {mode}"

for m in ["r", "w", "x"]:
    try:
        print(f"  set_mode({m!r}) = {set_mode(m)}")
    except ValueError as e:
        print(f"  set_mode({m!r}) -> 错误: {e}")

# --- 6. Final 不可变注解 ---
print("\\n--- 6. Final 不可变注解 ---")
from typing import Final, get_type_hints

class Config:
    TIMEOUT: Final = 30
    MAX_CONN: Final = 100
    name: str = "default"  # 非 Final

hints = get_type_hints(Config, include_extras=True)
print(f"  Config 注解: {hints}")
print("  Final 是静态约束，运行时不强制（需 mypy 检查）")

# --- 7. TypedDict 结构化字典 ---
print("\\n--- 7. TypedDict 结构化字典 ---")
from typing import TypedDict

class UserDict(TypedDict):
    id: int
    name: str
    email: "str | None"

u = {"id": 1, "name": "Alice", "email": None}
print(f"  UserDict 实例: {u}")
print(f"  运行时类型: {type(u).__name__} (TypedDict 运行时就是 dict)")
print(f"  字段注解: {UserDict.__annotations__}")

# --- 8. Protocol 协议 ---
print("\\n--- 8. Protocol 结构化子类型 ---")
from typing import Protocol, runtime_checkable

@runtime_checkable
class SupportsClose(Protocol):
    def close(self) -> None: ...

class FileLike:
    def close(self):
        return "已关闭"

class Resource:
    def release(self):
        return "已释放"

f = FileLike()
r = Resource()
print(f"  FileLike 是否符合 SupportsClose: {isinstance(f, SupportsClose)}")
print(f"  Resource 是否符合 SupportsClose: {isinstance(r, SupportsClose)}")

# --- 9. TypeAlias ---
print("\\n--- 9. TypeAlias 类型别名 ---")
try:
    from typing import TypeAlias
    Json: TypeAlias = "dict[str, 'Json'] | list | str | int | float | bool | None"
    print(f"  Json 别名定义: {Json}")
    print("  TypeAlias 显式标记别名，消除与普通赋值的歧义")
except ImportError:
    print("  TypeAlias 不可用（Python < 3.10）")

print("\\n=== typing 进阶演示结束 ===")`
  },
  {
    id: "py6-pydantic",
    group: "现代库与框架",
    icon: "📋",
    title: "Pydantic 数据验证",
    content: `## Pydantic 数据验证：Rust 引擎驱动的现代数据建模

### 一、Pydantic 是什么

Pydantic 是 Python 生态最流行的数据验证库，广泛用于 FastAPI、SQLModel、LangChain 等框架。它基于类型注解自动生成验证逻辑，将"原始数据"（JSON、表单、环境变量）转换为"类型安全的 Python 对象"。

Pydantic v2 是一次重大重写：
- **核心用 Rust 编写**（pydantic-core），性能比 v1 快 5-50 倍
- 验证逻辑从"装饰器 + 反射"改为"代码生成 + 编译期优化"
- API 更清晰，移除了 v1 的隐式行为

### 二、BaseModel 基础

\`\`\`python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str | None = None
    age: int = 0

# 从字典构造（自动类型转换与验证）
u = User(id="42", name="Alice", age="30")
print(u.id)    # 42 (int，字符串被转换)
print(u.age)   # 30

# 序列化
print(u.model_dump())          # {"id": 42, "name": "Alice", "email": None, "age": 30}
print(u.model_dump_json())     # JSON 字符串
\`\`\`

### 三、字段类型与验证

Pydantic 支持丰富的字段类型：

\`\`\`python
from pydantic import BaseModel, EmailStr, HttpUrl, Field
from datetime import datetime

class Article(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str
    tags: list[str] = Field(default_factory=list, max_length=10)
    published_at: datetime
    url: HttpUrl | None = None
    views: int = Field(ge=0)  # >= 0
\`\`\`

\`Field\` 提供约束：\`ge\` / \`gt\` / \`le\` / \`lt\`（大小比较）、\`min_length\` / \`max_length\`（长度）、\`pattern\`（正则）。

### 四、@field_validator 自定义验证

\`\`\`python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    age: int

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("姓名不能为空")
        return v.strip()

    @field_validator("age")
    @classmethod
    def age_must_be_reasonable(cls, v):
        if v < 0 or v > 150:
            raise ValueError("年龄不合理")
        return v
\`\`\`

\`@field_validator\` 在字段赋值后触发，可抛出 \`ValueError\` 或返回转换后的值。\`mode="before"\` 可在类型转换前介入。

### 五、@model_validator 模型级验证

当验证依赖多个字段时，用 \`@model_validator\`：

\`\`\`python
from pydantic import BaseModel, model_validator

class Order(BaseModel):
    quantity: int
    price: float
    discount: float = 0.0

    @model_validator(mode="after")
    def check_discount(self):
        if self.discount > self.price * self.quantity:
            raise ValueError("折扣不能超过总价")
        return self
\`\`\`

### 六、序列化：model_dump / model_validate

\`\`\`python
# 从字典/JSON 构造
u = User.model_validate({"name": "Bob", "age": 25})
u = User.model_validate_json('{"name": "Bob", "age": 25}')

# 导出字典/JSON
u.model_dump()                      # 全部字段
u.model_dump(include={"name"})      # 只含 name
u.model_dump(exclude={"age"})       # 排除 age
u.model_dump_json(indent=2)         # JSON 字符串
\`\`\`

### 七、ConfigDict 配置

\`\`\`python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        strict=True,              # 严格模式，不做隐式转换
        frozen=True,              # 不可变
        extra="forbid",           # 禁止多余字段
        str_strip_whitespace=True,# 字符串去空白
        populate_by_name=True,    # 允许用字段名赋值（配合 alias）
    )
    name: str
\`\`\`

常用配置：

| 配置 | 含义 | 默认 |
|------|------|------|
| strict | 严格类型，不转换 "1" -> 1 | False |
| frozen | 实例不可变 | False |
| extra | 多余字段处理 ("ignore"/"forbid"/"allow") | "ignore" |
| populate_by_name | 允许字段名赋值 | False |
| str_strip_whitespace | 字符串去两端空白 | False |

### 八、业务场景

- **API 请求/响应模型**：FastAPI 用 Pydantic 自动校验请求体、生成 OpenAPI 文档
- **配置文件加载**：YAML/TOML 反序列化为强类型对象
- **外部数据集成**：第三方 API 返回 JSON，用 Pydantic 校验后使用
- **数据库模型**：SQLModel = SQLAlchemy + Pydantic

### 九、vs dataclass / attrs

| 维度 | Pydantic | dataclass | attrs |
|------|----------|-----------|-------|
| 运行时验证 | ✅ 内置 | ❌ 需手写 | ✅ validator |
| 序列化 | ✅ model_dump | ❌ 需 asdict | ✅ asdict |
| 性能 | Rust 核心，极快 | 原生，最快 | C 扩展，快 |
| 不可变 | frozen=True | frozen=True | slots=True |
| 适合场景 | API/外部数据 | 内部数据结构 | 领域模型 |
| 依赖 | 第三方 | 标准库 | 第三方 |

> 💡 **选择建议**：外部边界（API、配置、数据库）用 Pydantic；内部数据传递用 dataclass；需要复杂验证和转换的领域模型用 attrs。

### 十、避坑提示

1. **v1 → v2 迁移**：\`.dict()\` → \`.model_dump()\`，\`.parse_obj()\` → \`.model_validate()\`，\`@validator\` → \`@field_validator\`
2. **strict 模式**：开启后 \`User(id="42")\` 会报错，需显式转换
3. **Optional 字段默认值**：\`email: str | None = None\` 正确；\`email: str | None\` 必须提供值
4. **可变默认值**：用 \`Field(default_factory=list)\`，不能用 \`[]\`
5. **继承时字段覆盖**：子类可覆盖父类字段，但类型必须兼容

### 十一、原理深入

Pydantic v2 的核心是 \`pydantic-core\`（Rust 实现）：
1. **Schema 构建**：Python 层解析类型注解，生成 JSON Schema 表示
2. **验证器编译**：Rust 根据 Schema 编译出高效的验证函数
3. **运行时验证**：数据传入 Rust 验证器，逐字段校验、转换
4. **错误收集**：验证失败时收集所有错误（而非首个），返回结构化错误

这种"Python 定义 + Rust 执行"的架构兼顾了开发体验与性能。

### 十二、最佳实践

- 公共 API 模型用 \`strict=False\`（容忍输入），内部模型用 \`strict=True\`
- 用 \`Field\` 约束替代手写 validator（如 \`ge=0\` 替代"必须非负"的 validator）
- 错误信息本地化：实现 \`get_error_message\` 自定义提示
- 大型项目抽取 BaseSchema，统一 \`model_config\`
- 配合 mypy：开启 \`plugin = pydantic.mypy\` 获得更精确的类型推断`,
    code: `# Pydantic 概念演示：用标准库 dataclasses + 手动验证模拟 Pydantic 核心能力
# 不依赖 pydantic，演示模型定义/验证/序列化的核心思想

from dataclasses import dataclass, field, asdict, fields, MISSING
from typing import Any

print("=== Pydantic 数据验证概念演示 ===\\n")

# --- 1. BaseModel 基础：模拟数据模型 ---
print("--- 1. BaseModel 基础（用 dataclass 模拟） ---")

@dataclass
class User:
    id: int
    name: str
    email: str | None = None
    age: int = 0

    @classmethod
    def model_validate(cls, data: dict) -> "User":
        """模拟 Pydantic 的 model_validate：从字典构造并验证"""
        validated = {}
        for f in fields(cls):
            name = f.name
            if name in data:
                raw = data[name]
                # 模拟类型转换（Pydantic 会做严格的转换）
                try:
                    if f.type is int or f.type == "int":
                        converted = int(raw)
                    elif f.type is str or f.type == "str":
                        converted = str(raw)
                    else:
                        converted = raw
                except (ValueError, TypeError) as e:
                    raise ValueError(f"字段 '{name}' 类型转换失败: {e}")
                validated[name] = converted
            elif f.default is not MISSING:
                validated[name] = f.default
            elif f.default_factory is not MISSING:
                validated[name] = f.default_factory()
            else:
                raise ValueError(f"缺少必填字段 '{name}'")
        return cls(**validated)

    def model_dump(self) -> dict:
        return asdict(self)

# 测试：字符串自动转 int
u = User.model_validate({"id": "42", "name": "Alice", "age": "30"})
print(f"  构造结果: {u}")
print(f"  id 类型: {type(u.id).__name__} (字符串 '42' 被转为 int)")

# --- 2. Field 约束：模拟字段校验 ---
print("\\n--- 2. Field 约束验证 ---")

@dataclass
class Article:
    title: str
    views: int

    @classmethod
    def model_validate(cls, data: dict) -> "Article":
        title = data.get("title", "")
        if len(title) < 1 or len(title) > 200:
            raise ValueError(f"标题长度需在 1-200 之间，当前 {len(title)}")
        views = data.get("views", 0)
        if views < 0:
            raise ValueError(f"views 必须 >= 0，当前 {views}")
        return cls(title=title, views=views)

tests = [
    {"title": "Hello", "views": 10},
    {"title": "", "views": 5},          # 标题过短
    {"title": "OK", "views": -1},       # views 负数
]
for t in tests:
    try:
        a = Article.model_validate(t)
        print(f"  通过: {a}")
    except ValueError as e:
        print(f"  失败: {e}")

# --- 3. 自定义 validator ---
print("\\n--- 3. @field_validator 概念 ---")

@dataclass
class User2:
    name: str
    age: int

    def __post_init__(self):
        # 模拟 field_validator：在初始化后校验
        if not self.name.strip():
            raise ValueError("姓名不能为空")
        self.name = self.name.strip()  # 转换
        if self.age < 0 or self.age > 150:
            raise ValueError(f"年龄不合理: {self.age}")

for name, age in [("Alice", 30), ("  Bob  ", 25), ("", 20), ("X", 200)]:
    try:
        u = User2(name=name, age=age)
        print(f"  通过: User2(name={u.name!r}, age={u.age})")
    except ValueError as e:
        print(f"  失败: {e}")

# --- 4. 模型级 validator ---
print("\\n--- 4. @model_validator 概念（多字段联合校验） ---")

@dataclass
class Order:
    quantity: int
    price: float
    discount: float = 0.0

    def __post_init__(self):
        total = self.quantity * self.price
        if self.discount > total:
            raise ValueError(f"折扣 {self.discount} 超过总价 {total}")

for q, p, d in [(2, 50, 30), (1, 10, 20)]:
    try:
        o = Order(quantity=q, price=p, discount=d)
        print(f"  通过: {o}")
    except ValueError as e:
        print(f"  失败: {e}")

# --- 5. 序列化 ---
print("\\n--- 5. 序列化 model_dump ---")

u = User(id=1, name="Alice", email="a@x.com", age=30)
dumped = u.model_dump()
print(f"  model_dump(): {dumped}")
print(f"  类型: {type(dumped).__name__}")

# 模拟 include/exclude
include = {"id", "name"}
filtered = {k: v for k, v in dumped.items() if k in include}
print(f"  include={{id,name}}: {filtered}")

exclude = {"email"}
filtered2 = {k: v for k, v in dumped.items() if k not in exclude}
print(f"  exclude={{email}}: {filtered2}")

# --- 6. ConfigDict 概念 ---
print("\\n--- 6. ConfigDict 配置概念 ---")

class StrictUser:
    """模拟 strict=True, extra='forbid', frozen=True"""
    __slots__ = ("name", "age", "_frozen")

    def __init__(self, name: str, age: int):
        if not isinstance(name, str):
            raise TypeError(f"strict 模式：name 必须是 str，不是 {type(name).__name__}")
        if not isinstance(age, int):
            raise TypeError(f"strict 模式：age 必须是 int，不是 {type(age).__name__}")
        object.__setattr__(self, "name", name)
        object.__setattr__(self, "age", age)
        object.__setattr__(self, "_frozen", True)

    def __setattr__(self, key, value):
        if getattr(self, "_frozen", False):
            raise AttributeError("frozen=True，实例不可变")
        super().__setattr__(key, value)

try:
    su = StrictUser(name="Alice", age=30)
    print(f"  构造成功: {su.name}, {su.age}")
except TypeError as e:
    print(f"  失败: {e}")

try:
    su = StrictUser(name=123, age=30)  # strict 模式拒绝
    print(f"  构造成功: {su.name}")
except TypeError as e:
    print(f"  strict 拒绝非 str: {e}")

try:
    su = StrictUser(name="Alice", age=30)
    su.age = 31  # frozen 拒绝
except AttributeError as e:
    print(f"  frozen 拒绝修改: {e}")

# --- 7. 性能对比概念 ---
print("\\n--- 7. Pydantic v2 性能优势（概念） ---")
import time

# 模拟大量数据验证
data_list = [{"id": str(i), "name": f"user{i}", "age": str(i % 80)}
             for i in range(10000)]

start = time.perf_counter()
for d in data_list:
    User.model_validate(d)
elapsed = time.perf_counter() - start
print(f"  纯 Python 验证 10000 条: {elapsed*1000:.1f} ms")
print("  Pydantic v2 (Rust 核心) 通常快 5-50 倍")

# --- 8. vs dataclass 对比 ---
print("\\n--- 8. Pydantic vs dataclass 对比 ---")
comparison = [
    ("运行时验证", "✅ 内置", "❌ 需手写 __post_init__"),
    ("类型转换", "✅ '42' -> 42", "❌ 不转换"),
    ("序列化", "✅ model_dump", "需 asdict"),
    ("JSON 支持", "✅ 原生", "需 json.dumps"),
    ("错误收集", "✅ 多错误", "单错误抛出"),
    ("性能", "Rust 核心", "纯 Python"),
]
for feat, pyd, dc in comparison:
    print(f"  {feat}: Pydantic {pyd} | dataclass {dc}")

print("\\n=== Pydantic 概念演示结束 ===")`
  },
  {
    id: "py6-attrs",
    group: "现代库与框架",
    icon: "🔧",
    title: "attrs 与 dataclass 对比",
    content: `## attrs 与 dataclass 对比：领域建模的两种选择

### 一、attrs 简介与历史

\`attrs\` 是 Python 生态中最早的"类构建器"库，由 Hynek Schlawack 创建，早于标准库 \`dataclass\`（PEP 557）。它解决的核心问题：手写 \`__init__\` / \`__repr__\` / \`__eq__\` 太繁琐。

\`dataclass\` 在 Python 3.7 引入时大量借鉴了 \`attrs\` 的设计，但 \`attrs\` 仍保留了许多高级特性：
- 验证器（validator）
- 转换器（converter）
- slots 优化
- 不可变实例
- 更细粒度的字段控制

### 二、@define vs @attrs

attrs 提供两套 API：

\`\`\`python
import attrs

# 新风格（推荐，3.0+）
@attrs.define
class User:
    name: str
    age: int = 0

# 老风格
@attrs.attrs
class UserOld:
    name = attrs.field()
    age = attrs.field(default=0)
\`\`\`

\`@define\` 默认开启 \`slots=True\`、\`eq=True\`，比 \`@attrs\` 更现代。

### 三、字段定义与默认值

\`\`\`python
import attrs

@attrs.define
class Article:
    title: str
    tags: list[str] = attrs.field(factory=list)  # 可变默认值用 factory
    views: int = 0
    published: bool = False
\`\`\`

> ⚠️ **避坑**：可变默认值（list、dict、set）必须用 \`attrs.field(factory=list)\`，直接写 \`[]\` 会导致所有实例共享同一对象（Python 函数默认参数的经典陷阱）。

### 四、验证器 validator

attrs 验证器在赋值时触发：

\`\`\`python
import attrs
from attrs import validators

@attrs.define
class User:
    name: str = attrs.field(validator=validators.instance_of(str))
    age: int = attrs.field(
        validator=[
            validators.instance_of(int),
            validators.ge(0),
            validators.le(150),
        ]
    )
    email: str = attrs.field(validator=validators.matches_re(r"^[^@]+@[^@]+$"))

# User(name=123)        # 抛 TypeError
# User(name="A", age=-1)  # 抛 ValueError
\`\`\`

内置验证器：\`instance_of\`、\`in_\`、\`ge/gt/le/lt\`、\`matches_re\`、\`deep_iterable\`、\`deep_mapping\`。

### 五、转换器 converter

converter 在验证前转换数据：

\`\`\`python
import attrs

@attrs.define
class Product:
    name: str = attrs.field(converter=str.strip)
    price: float = attrs.field(converter=float)
    tags: list = attrs.field(converter=list, factory=list)

p = Product(name="  Book  ", price="9.99", tags="python")
print(p)  # Product(name='Book', price=9.99, tags=['p', 'y', 't', 'h', 'o', 'n'])
\`\`\`

converter 接收原始值，返回转换后的值。常用于"容错输入"（接受字符串数字、单值转列表）。

### 六、slots=True 内存优化

\`\`\`python
@attrs.define(slots=True)  # @define 默认就是 slots=True
class Point:
    x: int
    y: int
\`\`\`

slots 的好处：
- **内存占用减少**：无 \`__dict__\`，每个实例节省约 100 字节
- **属性访问更快**：描述符比字典查找快
- **防止动态属性**：无法添加未声明字段（避免拼写错误）

代价：无法动态添加属性，不能多重继承另一个非 slots 类。

### 七、不可变实例 frozen

\`\`\`python
@attrs.define(frozen=True)
class Config:
    host: str
    port: int

c = Config(host="localhost", port=8080)
# c.host = "x"  # 抛 FrozenInstanceError
\`\`\`

frozen 适合配置对象、值对象（value object）、缓存键。

### 八、vs dataclass 对比

| 特性 | attrs | dataclass |
|------|-------|-----------|
| 标准库 | ❌ 第三方 | ✅ 内置 |
| 验证器 | ✅ 内置 | ❌ 需 __post_init__ |
| 转换器 | ✅ converter | ✅ __post_init__ 手动 |
| slots | ✅ 默认/可选 | ✅ slots=True (3.10+) |
| frozen | ✅ | ✅ |
| 继承 | ✅ 灵活 | ⚠️ 有坑 |
| 性能 | C 扩展 | 纯 Python |
| 生态 | attrs/structlog/... | 主流 |
| 类型注解 | ✅ | ✅ |

### 九、何时选 attrs / dataclass / pydantic

- **attrs**：领域模型，需要验证/转换/slots，但不需要序列化到 JSON
- **dataclass**：内部数据结构，无需复杂验证，依赖少
- **pydantic**：外部数据边界（API、配置、数据库），需要序列化和严格验证

### 十、业务场景

- **领域驱动设计**：用 \`attrs(frozen=True)\` 定义值对象（Money、Address）
- **配置对象**：\`attrs.define\` + 验证器，启动时校验配置合法性
- **数据管道中间态**：转换器容错输入，验证器保证不变量
- **游戏/物理引擎**：slots 减少内存，提升高频对象创建性能

### 十一、避坑提示

1. **继承顺序**：attrs 子类字段不能有默认值时父类已有默认值，需用 \`kw_only=True\`
2. **slots 与 pickle**：slots 类默认不支持 pickle，需用 \`@attrs.define(slots=False)\` 或实现 \`__getstate__\`
3. **validator 异常类型**：抛 \`ValueError\` 或 \`TypeError\`，attrs 会包装为 \`ValueError\`
4. **converter 顺序**：converter 在 validator 之前执行
5. **frozen 不等于深拷贝**：frozen 阻止属性重新赋值，但不阻止可变属性内部修改

### 十二、原理深入

attrs 的核心机制：
1. **类装饰器**：\`@define\` 扫描类的 \`__annotations__\` 和 \`attrs.field()\` 调用
2. **代码生成**：动态生成 \`__init__\` / \`__repr__\` / \`__eq__\` / \`__hash__\` 方法
3. **slots 实现**：创建新类，设置 \`__slots__\`，移除 \`__dict__\`
4. **frozen 实现**：重写 \`__setattr__\` / \`__delattr__\`，抛出 \`FrozenInstanceError\`
5. **验证器链**：每个字段维护验证器列表，赋值时依次调用

attrs 用 C 扩展（\`_attr.c\`）加速核心路径，性能优于纯 Python 的 dataclass。

### 十三、最佳实践

- 新项目用 \`@attrs.define\`（现代 API），不用 \`@attrs.attrs\`
- 可变默认值一律用 \`factory=\`
- 高频创建的对象用 \`slots=True\`（默认已开启）
- 配置/值对象用 \`frozen=True\`
- 验证逻辑放 validator，转换逻辑放 converter，职责分离
- 配合 \`cattrs\` 库实现结构化数据与 attrs 对象的互转`,
    code: `# attrs 概念演示：用标准库 dataclasses 模拟 attrs 的核心能力
# 演示字段/默认值/验证器/转换器/slots/frozen

from dataclasses import dataclass, field, fields
from typing import Any, Callable
import sys

print("=== attrs 与 dataclass 对比演示 ===\\n")

# --- 1. 基础：用 dataclass 模拟 attrs.define ---
print("--- 1. 字段定义与默认值 ---")

@dataclass
class Article:
    title: str
    tags: list = field(default_factory=list)  # 模拟 attrs.field(factory=list)
    views: int = 0
    published: bool = False

a1 = Article(title="Hello")
a2 = Article(title="World", tags=["python"])
print(f"  a1 = {a1}")
print(f"  a2 = {a2}")
print(f"  a1.tags is a2.tags: {a1.tags is a2.tags} (factory 保证独立)")

# --- 2. 验证器 validator ---
print("\\n--- 2. 验证器（用 __post_init__ 模拟） ---")

def validate_instance_of(typ):
    """模拟 attrs.validators.instance_of"""
    def validator(instance, attribute, value):
        if not isinstance(value, typ):
            raise TypeError(
                f"{attribute.name} 必须是 {typ.__name__}, 不是 {type(value).__name__}"
            )
    return validator

def validate_ge(min_val):
    """模拟 attrs.validators.ge"""
    def validator(instance, attribute, value):
        if value < min_val:
            raise ValueError(f"{attribute.name} 必须 >= {min_val}, 当前 {value}")
    return validator

@dataclass
class User:
    name: str
    age: int
    _validators = {
        "name": [validate_instance_of(str)],
        "age": [validate_instance_of(int), validate_ge(0)],
    }

    def __post_init__(self):
        for name, validators in self._validators.items():
            value = getattr(self, name)
            attr = type("Attr", (), {"name": name})()
            for v in validators:
                v(self, attr, value)

for name, age in [("Alice", 30), ("Bob", -5), (123, 30)]:
    try:
        u = User(name=name, age=age)
        print(f"  通过: User(name={u.name!r}, age={u.age})")
    except (TypeError, ValueError) as e:
        print(f"  失败: {e}")

# --- 3. 转换器 converter ---
print("\\n--- 3. 转换器（在验证前转换） ---")

def converter_strip(value):
    return str(value).strip()

def converter_float(value):
    return float(value)

def converter_list(value):
    if isinstance(value, list):
        return value
    return [value]

@dataclass
class Product:
    name: str = field(default="")
    price: float = field(default=0.0)
    tags: list = field(default_factory=list)
    _converters = {"name": converter_strip, "price": converter_float, "tags": converter_list}

    def __post_init__(self):
        # converter 先执行（模拟 attrs 顺序：converter -> validator）
        for name, conv in self._converters.items():
            setattr(self, name, conv(getattr(self, name)))

p = Product(name="  Book  ", price="9.99", tags="python")
print(f"  Product(name={p.name!r}, price={p.price}, tags={p.tags})")
print("  注意 tags='python' 被 converter_list 转为 ['python']")

# --- 4. slots 内存优化 ---
print("\\n--- 4. slots 内存优化 ---")

@dataclass(slots=True)
class Point:
    x: int
    y: int

@dataclass
class PointDict:
    x: int
    y: int

p1 = Point(1, 2)
p2 = PointDict(1, 2)
print(f"  Point(slots) 有 __dict__: {hasattr(p1, '__dict__')}")
print(f"  PointDict 有 __dict__: {hasattr(p2, '__dict__')}")
print(f"  Point(slots) 有 __slots__: {hasattr(Point, '__slots__')}")

try:
    p1.z = 3  # slots 阻止动态属性
except AttributeError as e:
    print(f"  slots 阻止动态属性: {e}")

p2.z = 3  # 非 slots 允许
print(f"  非 slots 允许动态属性: p2.z = {p2.z}")

# 内存占用对比
import sys
print(f"  Point(slots) 实例大小: {sys.getsizeof(p1)} bytes")
print(f"  PointDict 实例大小: {sys.getsizeof(p2)} bytes (不含 __dict__ 内部)")

# --- 5. frozen 不可变 ---
print("\\n--- 5. frozen 不可变 ---")

@dataclass(frozen=True)
class Config:
    host: str
    port: int

c = Config(host="localhost", port=8080)
print(f"  Config: {c}")
try:
    c.port = 9090
except Exception as e:
    print(f"  frozen 拒绝修改: {type(e).__name__}: {e}")

# frozen 不阻止可变属性内部修改（陷阱）
@dataclass(frozen=True)
class HasList:
    items: list

hl = HasList(items=[1, 2])
hl.items.append(3)  # 这是允许的！
print(f"  frozen 但内部可变: {hl} (注意 items 变了)")
print("  避坑：frozen 不等于深拷贝，可变属性仍可内部修改")

# --- 6. attrs vs dataclass 特性对比 ---
print("\\n--- 6. attrs vs dataclass 特性对比 ---")

features = [
    ("标准库", "❌ 第三方", "✅ 内置"),
    ("验证器", "✅ 内置 validators", "❌ 需 __post_init__"),
    ("转换器", "✅ converter 参数", "❌ 需手动"),
    ("slots", "✅ 默认开启", "✅ slots=True (3.10+)"),
    ("frozen", "✅", "✅"),
    ("继承灵活性", "✅ kw_only", "⚠️ 默认参数顺序坑"),
    ("性能", "C 扩展加速", "纯 Python"),
    ("生态", "structlog/cattrs", "主流"),
]
print(f"  {'特性':<14} {'attrs':<22} {'dataclass'}")
for feat, a, d in features:
    print(f"  {feat:<14} {a:<22} {d}")

# --- 7. 何时选择 ---
print("\\n--- 7. 选择建议 ---")
advice = [
    "attrs: 领域模型，需验证/转换/slots，无需 JSON 序列化",
    "dataclass: 内部数据结构，依赖少，无需复杂验证",
    "pydantic: 外部边界 (API/配置/DB)，需序列化 + 严格验证",
]
for a in advice:
    print(f"  - {a}")

# --- 8. 继承的坑 ---
print("\\n--- 8. 继承顺序的坑 ---")

@dataclass
class Base:
    a: int = 1  # 有默认值

try:
    @dataclass
    class Child(Base):
        b: int  # 无默认值，但父类有默认值 -> 报错

    Child(b=2)
except TypeError as e:
    print(f"  继承坑: {e}")
    print("  解决：用 kw_only=True 或调整字段顺序")

# 正确做法：kw_only
@dataclass(kw_only=True)
class ChildOK(Base):
    b: int

c2 = ChildOK(b=2)
print(f"  kw_only 解决: {c2}")

print("\\n=== attrs 与 dataclass 演示结束 ===")`
  },
  {
    id: "py6-sqlalchemy",
    group: "现代库与框架",
    icon: "🗄️",
    title: "SQLAlchemy ORM",
    content: `## SQLAlchemy ORM：Python 生态最成熟的数据库抽象层

### 一、SQLAlchemy 2.0 概述

SQLAlchemy 是 Python 生态中最成熟的数据库工具包与 ORM，支持 PostgreSQL、MySQL、SQLite、Oracle 等主流数据库。2.0 版本是一次重大升级：

- **统一 API**：合并 1.x 的 "Classic" 和 "2.0 style"，统一使用 \`select()\` 语法
- **类型注解**：原生支持类型提示，配合 mypy 获得精确类型推断
- **异步支持**：原生 \`asyncio\` 支持，无需额外封装
- **性能优化**：核心查询构建更高效

### 二、Engine 与连接

Engine 是 SQLAlchemy 的入口，管理连接池：

\`\`\`python
from sqlalchemy import create_engine

# SQLite
engine = create_engine("sqlite:///app.db", echo=True)

# PostgreSQL
engine = create_engine(
    "postgresql+psycopg://user:pass@localhost/db",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# 异步
from sqlalchemy.ext.asyncio import create_async_engine
engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
\`\`\`

常用参数：
- \`echo=True\`：打印 SQL 日志
- \`pool_size\`：连接池大小
- \`max_overflow\`：超出 pool_size 的最大连接数
- \`pool_pre_ping=True\`：连接前检测可用性（防止数据库断连）

### 三、Declarative 模型定义

2.0 推荐用 \`DeclarativeBase\`：

\`\`\`python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(200), unique=True)
    age: Mapped[int] = mapped_column(default=0)
\`\`\`

\`Mapped[T]\` 是 2.0 的类型注解容器，\`mapped_column\` 定义列属性。这种写法让 IDE 和 mypy 能推断属性类型。

### 四、Session 会话管理

Session 是工作单元（Unit of Work）的核心：

\`\`\`python
from sqlalchemy.orm import Session

# 创建表
Base.metadata.create_all(engine)

# 使用 Session
with Session(engine) as session:
    user = User(name="Alice", email="a@x.com", age=30)
    session.add(user)
    session.commit()  # 提交事务
    print(user.id)    # 提交后才有 id
\`\`\`

更推荐用 \`sessionmaker\` 工厂：

\`\`\`python
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind=engine)
with SessionLocal() as session:
    ...
\`\`\`

### 五、查询 select API

2.0 统一用 \`select()\`：

\`\`\`python
from sqlalchemy import select

with Session(engine) as session:
    # 查询所有
    stmt = select(User).where(User.age >= 18)
    users = session.scalars(stmt).all()

    # 查询单个
    stmt = select(User).where(User.id == 1)
    user = session.scalars(stmt).one_or_none()

    # 排序与分页
    stmt = select(User).order_by(User.name).limit(10).offset(20)

    # 聚合
    from sqlalchemy import func, count
    stmt = select(func.count(User.id))
    total = session.scalar(stmt)

    # 更新与删除
    from sqlalchemy import update, delete
    session.execute(update(User).where(User.id == 1).values(age=31))
    session.execute(delete(User).where(User.age < 18))
    session.commit()
\`\`\`

### 六、关系 relationship

\`\`\`python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="posts")

class User(Base):
    __tablename__ = "users"
    ...
    posts: Mapped[list["Post"]] = relationship(back_populates="user")

# 使用
with Session(engine) as session:
    user = session.scalars(select(User).where(User.id == 1)).one()
    for post in user.posts:  # 懒加载
        print(post.title)
\`\`\`

关系类型：一对多（\`relationship\`）、多对一、多对多（\`secondary\` 关联表）。

### 七、业务场景

- **Web 后端数据层**：FastAPI + SQLAlchemy 是黄金组合
- **数据分析 ETL**：用 Core（非 ORM）批量读写，性能更高
- **多租户系统**：通过 Engine 多数据库切换
- **微服务**：每个服务独立 Engine，共享数据库或独立数据库

### 八、vs Django ORM

| 维度 | SQLAlchemy | Django ORM |
|------|------------|------------|
| 独立性 | 独立库，可脱离框架 | 绑定 Django |
| 查询构建 | 显式 select，灵活 | 链式 QuerySet，简洁 |
| 原生 SQL | 完整支持 | 较弱 |
| 异步 | 2.0 原生支持 | 4.0+ 支持 |
| 迁移 | Alembic（独立） | 内置 migrations |
| 学习曲线 | 陡峭 | 平缓 |
| 适合场景 | 复杂查询、多数据库 | Django 全栈 |

### 九、避坑提示

1. **N+1 查询**：循环访问关系属性会触发多次查询，用 \`selectinload\` / \`joinedload\` 预加载
2. **Session 生命周期**：每个请求一个 Session，用完即关，避免长生命周期 Session 缓存膨胀
3. **commit 时机**：在业务逻辑完成后 commit，避免中途 commit 导致状态不一致
4. **异步陷阱**：异步 Session 不能在同步代码中使用，需 \`await session.execute()\`
5. **类型注解陷阱**：\`Mapped[str | None]\` 表示可空，\`Mapped[str]\` 表示 NOT NULL

### 十、原理深入

SQLAlchemy 分两层：
- **Core**：SQL 表达式语言，构建 SQL 的 Pythonic API
- **ORM**：在 Core 之上的对象关系映射

工作流程：
1. 模型类注册到 \`MetaData\`，记录表结构
2. \`select()\` 构建 SQL 表达式树（AST）
3. Engine 编译 AST 为目标数据库方言的 SQL
4. 执行 SQL，结果映射回对象（ORM 层）
5. Session 维护"身份映射"（Identity Map），同一主键返回同一对象

### 十一、最佳实践

- 用 \`DeclarativeBase\` + \`Mapped\` 2.0 风格定义模型
- 用 \`sessionmaker\` 工厂管理 Session，配合上下文管理器
- 查询统一用 \`select()\`，避免 1.x 的 \`query()\`
- 关系查询用 \`selectinload\` 避免 N+1
- 生产环境开启 \`pool_pre_ping\` 防止断连
- 配合 Alembic 做版本化迁移，不要手动改表`,
    code: `# SQLAlchemy ORM 概念演示：用 dataclass + dict + session 模拟 ORM 核心概念
# 不依赖 sqlalchemy，演示模型定义/Session/select/relationship

from dataclasses import dataclass, field
from typing import Any

print("=== SQLAlchemy ORM 概念演示 ===\\n")

# --- 1. 模拟 DeclarativeBase 与模型定义 ---
print("--- 1. 模型定义（用 dataclass 模拟 Declarative） ---")

# 模拟 MetaData：记录所有表结构
metadata = {}

def register_model(cls):
    """模拟 DeclarativeBase.__init_subclass__"""
    tablename = getattr(cls, "__tablename__", None)
    if tablename:
        columns = {}
        for name, typ in getattr(cls, "__annotations__", {}).items():
            if not name.startswith("_"):
                columns[name] = typ
        metadata[tablename] = {"cls": cls, "columns": columns}
    return cls

@dataclass
@register_model
class User:
    __tablename__ = "users"
    id: int = None
    name: str = ""
    email: str | None = None
    age: int = 0

@dataclass
@register_model
class Post:
    __tablename__ = "posts"
    id: int = None
    title: str = ""
    user_id: int = None

print("  注册的表结构:")
for table, info in metadata.items():
    print(f"    {table}: {list(info['columns'].keys())}")

# --- 2. 模拟 Session（工作单元） ---
print("\\n--- 2. Session 会话管理 ---")

class Session:
    """模拟 SQLAlchemy Session：身份映射 + 事务"""
    def __init__(self):
        self._identity_map = {}  # (table, id) -> 对象
        self._new = []           # 待新增
        self._deleted = []       # 待删除
        self._storage = {        # 模拟数据库存储
            "users": {},
            "posts": {},
        }
        self._next_id = {"users": 1, "posts": 1}

    def add(self, obj):
        """注册到待新增列表"""
        self._new.append(obj)

    def delete(self, obj):
        self._deleted.append(obj)

    def commit(self):
        """提交事务：把待操作写入存储"""
        for obj in self._new:
            table = obj.__tablename__
            obj.id = self._next_id[table]
            self._next_id[table] += 1
            self._storage[table][obj.id] = obj
            self._identity_map[(table, obj.id)] = obj
        for obj in self._deleted:
            table = obj.__tablename__
            self._storage[table].pop(obj.id, None)
        self._new.clear()
        self._deleted.clear()
        print(f"    [commit] 事务已提交")

    def scalars(self, stmt):
        """模拟 session.scalars(stmt).all()"""
        return ScalarResult(stmt.execute(self._storage))

    def scalar(self, stmt):
        """返回单个值"""
        result = stmt.execute(self._storage)
        return result[0] if result else None

class ScalarResult:
    def __init__(self, items):
        self._items = items
    def all(self):
        return self._items
    def one_or_none(self):
        return self._items[0] if self._items else None
    def one(self):
        if not self._items:
            raise Exception("No row found")
        return self._items[0]

# --- 3. 模拟 select API ---
print("\\n--- 3. select 查询 API ---")

class Select:
    """模拟 sqlalchemy.select"""
    def __init__(self, model_cls):
        self._model = model_cls
        self._where = None
        self._order_by = None
        self._limit = None
        self._offset = None

    def where(self, condition):
        self._where = condition
        return self

    def order_by(self, key):
        self._order_by = key
        return self

    def limit(self, n):
        self._limit = n
        return self

    def offset(self, n):
        self._offset = n
        return self

    def execute(self, storage):
        table = self._model.__tablename__
        rows = list(storage[table].values())
        if self._where:
            rows = [r for r in rows if self._where(r)]
        if self._order_by:
            key = self._order_by
            reverse = False
            if isinstance(key, str) and key.startswith("-"):
                key = key[1:]
                reverse = True
            rows.sort(key=lambda r: getattr(r, key, None) or "", reverse=reverse)
        if self._offset:
            rows = rows[self._offset:]
        if self._limit:
            rows = rows[:self._limit]
        return rows

# 使用 Session
session = Session()

# 新增
u1 = User(name="Alice", email="a@x.com", age=30)
u2 = User(name="Bob", email="b@x.com", age=25)
u3 = User(name="Charlie", age=20)
session.add(u1)
session.add(u2)
session.add(u3)
session.commit()

# 查询所有
stmt = Select(User)
users = session.scalars(stmt).all()
print(f"  所有用户: {[(u.name, u.age) for u in users]}")

# 条件查询
stmt = Select(User).where(lambda u: u.age >= 25)
users = session.scalars(stmt).all()
print(f"  age >= 25: {[(u.name, u.age) for u in users]}")

# 排序与分页
stmt = Select(User).order_by("-age").limit(2)
users = session.scalars(stmt).all()
print(f"  按 age 降序前 2: {[(u.name, u.age) for u in users]}")

# 单个查询
stmt = Select(User).where(lambda u: u.id == 1)
user = session.scalars(stmt).one_or_none()
print(f"  id=1: {user.name if user else None}")

# --- 4. 模拟 relationship ---
print("\\n--- 4. relationship 关系 ---")

class UserWithPosts(User):
    __tablename__ = "users"
    posts: list = field(default_factory=list)

    def __post_init__(self):
        # 模拟 relationship 的懒加载
        pass

# 在 Session 中查询关系
session2 = Session()
alice = User(name="Alice", age=30)
session2.add(alice)
session2.commit()

# 添加 posts
p1 = Post(title="Hello", user_id=alice.id)
p2 = Post(title="World", user_id=alice.id)
session2.add(p1)
session2.add(p2)
session2.commit()

# 查询 alice 的 posts
stmt = Select(Post).where(lambda p: p.user_id == alice.id)
alice_posts = session2.scalars(stmt).all()
print(f"  Alice 的文章: {[p.title for p in alice_posts]}")

# --- 5. 聚合查询 ---
print("\\n--- 5. 聚合查询 ---")

total = len(session._storage["users"])
avg_age = sum(u.age for u in session._storage["users"].values()) / total
print(f"  用户总数: {total}")
print(f"  平均年龄: {avg_age:.1f}")

# --- 6. 更新与删除 ---
print("\\n--- 6. 更新与删除 ---")

# 更新
alice_in_storage = session._storage["users"][1]
alice_in_storage.age = 31
print(f"  更新 Alice age -> 31: {alice_in_storage}")

# 删除
charlie = session._storage["users"][3]
session.delete(charlie)
session.commit()
remaining = session.scalars(Select(User)).all()
print(f"  删除后剩余: {[u.name for u in remaining]}")

# --- 7. N+1 查询问题演示 ---
print("\\n--- 7. N+1 查询问题 ---")
print("  错误：循环访问关系属性，每次触发一次查询")
print("    for user in users:")
print("        print(user.posts)  # N 次查询")
print("  正确：用 selectinload 预加载")
print("    stmt = select(User).options(selectinload(User.posts))")

# --- 8. vs Django ORM ---
print("\\n--- 8. vs Django ORM ---")
comparison = [
    ("独立性", "独立库", "绑定 Django"),
    ("查询风格", "select() 显式", "QuerySet 链式"),
    ("原生 SQL", "完整支持", "较弱"),
    ("异步", "2.0 原生", "4.0+ 支持"),
    ("迁移", "Alembic 独立", "内置 migrations"),
    ("学习曲线", "陡峭", "平缓"),
]
for feat, sa, dj in comparison:
    print(f"  {feat}: SQLAlchemy {sa} | Django ORM {dj}")

print("\\n=== SQLAlchemy ORM 演示结束 ===")`
  },
  {
    id: "py6-alembic",
    group: "现代库与框架",
    icon: "🐍",
    title: "Alembic 数据库迁移",
    content: `## Alembic 数据库迁移：版本化的数据库管理

### 一、为什么需要数据库迁移

应用演进过程中，数据库 schema 会不断变化：新增表、加字段、改索引、删列。手动改表有几个致命问题：

- **环境不一致**：开发、测试、生产数据库结构可能不同步
- **无法回滚**：改错了无法撤销
- **协作困难**：多人改表冲突难解决
- **部署风险**：忘记在生产执行 SQL 导致线上故障

数据库迁移工具解决这些问题：把每次 schema 变更记录为"迁移文件"，按顺序执行，支持回滚和版本追踪。Alembic 是 SQLAlchemy 生态的官方迁移工具。

### 二、Alembic 初始化

\`\`\`bash
pip install alembic
cd your-project
alembic init migrations
\`\`\`

生成的目录结构：

\`\`\`
migrations/
├── env.py          # 运行环境配置
├── script.py.mako  # 迁移模板
├── versions/       # 迁移文件存放处
└── alembic.ini     # 全局配置（在根目录）
\`\`\`

### 三、配置 alembic.ini

\`\`\`ini
[alembic]
script_location = migrations
sqlalchemy.url = postgresql://user:pass@localhost/db

# 配合环境变量
# sqlalchemy.url = %(DATABASE_URL)s
\`\`\`

更推荐在 \`env.py\` 中动态读取：

\`\`\`python
import os
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])
\`\`\`

### 四、revision 创建迁移

\`\`\`bash
# 手动创建空迁移
alembic revision -m "create users table"

# 自动检测模型变化生成迁移（需配置 target_metadata）
alembic revision --autogenerate -m "add age column to users"
\`\`\`

生成的迁移文件：

\`\`\`python
"""create users table

Revision ID: a1b2c3d4
Revises:
Create Date: 2024-01-01 12:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4"
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(200), unique=True),
    )

def downgrade() -> None:
    op.drop_table("users")
\`\`\`

### 五、upgrade / downgrade

\`\`\`bash
# 升级到最新
alembic upgrade head

# 升级到指定版本
alembic upgrade a1b2c3d4

# 升级 N 步
alembic upgrade +2

# 降级一步
alembic downgrade -1

# 降级到指定版本
alembic downgrade a1b2c3d4

# 降级到初始
alembic downgrade base

# 查看当前版本
alembic current

# 查看历史
alembic history
\`\`\`

### 六、autogenerate 自动检测

在 \`env.py\` 配置 \`target_metadata\`：

\`\`\`python
from myapp.models import Base
target_metadata = Base.metadata
\`\`\`

之后 \`alembic revision --autogenerate\` 会对比数据库当前结构和模型定义，自动生成迁移。但 autogenerate 有局限：

- ✅ 检测：新增/删除表、列、索引、外键
- ❌ 不检测：列名修改、约束语义变化、数据迁移
- ⚠️ 需人工检查：autogenerate 生成的迁移不能直接信任

### 七、常用 op 操作

\`\`\`python
def upgrade():
    # 表操作
    op.create_table("users", ...)
    op.drop_table("old_users")
    op.rename_table("users", "members")

    # 列操作
    op.add_column("users", sa.Column("age", sa.Integer, default=0))
    op.drop_column("users", "temp_field")
    op.alter_column("users", "name", nullable=False, type_=sa.String(200))

    # 索引
    op.create_index("idx_email", "users", ["email"], unique=True)
    op.drop_index("idx_email", table_name="users")

    # 数据迁移
    users = op.get_bind().execute(sa.text("SELECT id, name FROM users"))
    for row in users:
        op.execute(sa.text("UPDATE users SET name = :name WHERE id = :id"),
                   {"name": row.name.strip(), "id": row.id})
\`\`\`

### 八、业务场景

- **Web 应用演进**：每次发版附带迁移，部署时自动执行
- **多环境同步**：开发/测试/生产用同一套迁移文件
- **团队协作**：迁移文件纳入版本控制，PR review
- **数据修复**：用迁移执行数据修正 SQL，可回滚

### 九、vs Django migrations

| 维度 | Alembic | Django migrations |
|------|---------|-------------------|
| 独立性 | 独立工具 | 绑定 Django |
| ORM | SQLAlchemy | Django ORM |
| autogenerate | 支持，需配置 | 内置，开箱即用 |
| 迁移文件 | 手写 + 自动 | 系统自动生成 |
| 学习曲线 | 较陡 | 平缓 |
| 灵活性 | 高（任意 SQL） | 中等 |
| 适合场景 | SQLAlchemy 项目 | Django 项目 |

### 十、避坑提示

1. **迁移文件必须可逆**：每个 upgrade 都要有对应的 downgrade
2. **不要修改已发布的迁移**：已应用到生产的迁移文件不可改，新建迁移修正
3. **autogenerate 不可全信**：必须人工检查，特别是数据相关操作
4. **大表加列**：MySQL 加列会锁表，用 \`op.add_column\` 配合 \`server_default\` 或分步迁移
5. **多分支合并**：迁移链可能分叉，用 \`alembic merge\` 合并
6. **生产回滚风险**：destructive 操作（删列、删表）回滚会丢数据，提前备份

### 十一、原理深入

Alembic 在数据库中维护一张 \`alembic_version\` 表，记录当前版本号。迁移流程：

1. 读取 \`alembic_version\` 获取当前版本
2. 计算从当前版本到目标版本的迁移链（图遍历）
3. 依次执行迁移的 \`upgrade\` 或 \`downgrade\`
4. 每步执行后更新 \`alembic_version\`

迁移文件通过 \`revision\` / \`down_revision\` 形成有向链（或图）。每个迁移知道它的前驱，Alembic 据此构建迁移历史。

### 十二、最佳实践

- 迁移文件命名清晰：\`-m "add user age column"\` 而非 \`-m "update"\`
- 每次迁移只做一件事，便于回滚
- 数据迁移和 schema 迁移分开文件
- 生产执行前在测试环境演练
- 配合 CI：拉取最新代码后自动 \`alembic upgrade head\`
- 重要操作前备份：\`pg_dump\` / \`mysqldump\`
- 用 \`alembic stamp\` 标记版本而不执行（用于"对齐"已有数据库）`,
    code: `# Alembic 概念演示：用 print + 文件操作模拟数据库迁移流程
# 不依赖 alembic，演示 revision/upgrade/downgrade/autogenerate 核心概念

import os
import json
from pathlib import Path

print("=== Alembic 数据库迁移概念演示 ===\\n")

# --- 1. 模拟 alembic_version 表 ---
print("--- 1. 模拟 alembic_version 表 ---")

class Database:
    """模拟数据库，包含 schema 和 alembic_version"""
    def __init__(self):
        self.schema = {}        # table -> list of columns
        self.version = None     # 当前迁移版本
        self.data = {}          # table -> list of rows

db = Database()

# --- 2. 模拟迁移文件 ---
print("\\n--- 2. 迁移文件结构 ---")

class Migration:
    """模拟一个 Alembic 迁移文件"""
    def __init__(self, revision, down_revision, message, upgrade_fn, downgrade_fn):
        self.revision = revision
        self.down_revision = down_revision
        self.message = message
        self.upgrade = upgrade_fn
        self.downgrade = downgrade_fn

    def __repr__(self):
        return f"Migration({self.revision}: {self.message})"

# 定义迁移链
def upgrade_001(db):
    db.schema["users"] = ["id", "name", "email"]
    print("    [upgrade] 创建 users 表 (id, name, email)")

def downgrade_001(db):
    db.schema.pop("users", None)
    print("    [downgrade] 删除 users 表")

def upgrade_002(db):
    if "users" in db.schema:
        db.schema["users"].append("age")
    print("    [upgrade] 给 users 表添加 age 列")

def downgrade_002(db):
    if "users" in db.schema and "age" in db.schema["users"]:
        db.schema["users"].remove("age")
    print("    [downgrade] 删除 users.age 列")

def upgrade_003(db):
    db.schema["posts"] = ["id", "title", "user_id"]
    print("    [upgrade] 创建 posts 表 (id, title, user_id)")

def downgrade_003(db):
    db.schema.pop("posts", None)
    print("    [downgrade] 删除 posts 表")

migrations = [
    Migration("001", None, "create users table", upgrade_001, downgrade_001),
    Migration("002", "001", "add age to users", upgrade_002, downgrade_002),
    Migration("003", "002", "create posts table", upgrade_003, downgrade_003),
]

print("  迁移链:")
for m in migrations:
    print(f"    {m.revision} (after {m.down_revision}): {m.message}")

# --- 3. 模拟 alembic upgrade ---
print("\\n--- 3. alembic upgrade head ---")

class AlembicRunner:
    def __init__(self, db, migrations):
        self.db = db
        self.migrations = {m.revision: m for m in migrations}
        # 构建顺序链
        self.order = self._build_order()

    def _build_order(self):
        """根据 down_revision 构建迁移顺序"""
        order = []
        current = None
        # 找到起点（down_revision is None）
        by_down = {}
        for m in self.migrations.values():
            by_down.setdefault(m.down_revision, []).append(m)
        queue = by_down.get(None, [])
        while queue:
            m = queue.pop(0)
            order.append(m)
            queue.extend(by_down.get(m.revision, []))
        return order

    def current(self):
        return self.db.version

    def upgrade(self, target="head"):
        """升级到目标版本"""
        if target == "head":
            target = self.order[-1].revision
        current_idx = self._idx(self.db.version)
        target_idx = self._idx(target)
        if target_idx <= current_idx:
            print(f"    已在 {self.db.version}，无需升级")
            return
        for m in self.order[current_idx+1:target_idx+1]:
            m.upgrade(self.db)
            self.db.version = m.revision
            print(f"    [stamp] 版本更新为 {m.revision}")

    def downgrade(self, target="-1"):
        """降级"""
        current_idx = self._idx(self.db.version)
        if target == "-1":
            target_idx = current_idx - 1
        elif target == "base":
            target_idx = -1
        else:
            target_idx = self._idx(target)
        if target_idx >= current_idx:
            print(f"    已在 {self.db.version}，无需降级")
            return
        for m in reversed(self.order[target_idx+1:current_idx+1]):
            m.downgrade(self.db)
            new_version = self.order[target_idx].revision if target_idx >= 0 else None
            self.db.version = new_version
            print(f"    [stamp] 版本回退为 {new_version}")

    def _idx(self, revision):
        if revision is None:
            return -1
        for i, m in enumerate(self.order):
            if m.revision == revision:
                return i
        return -1

    def history(self):
        print("  迁移历史:")
        for m in self.order:
            marker = " <- current" if m.revision == self.db.version else ""
            print(f"    {m.revision}: {m.message}{marker}")

runner = AlembicRunner(db, migrations)
print(f"  当前版本: {runner.current()}")
print("  执行 upgrade head...")
runner.upgrade("head")
print(f"  当前版本: {runner.current()}")
print(f"  当前 schema: {db.schema}")

# --- 4. 查看历史 ---
print("\\n--- 4. alembic history ---")
runner.history()

# --- 5. 模拟 downgrade ---
print("\\n--- 5. alembic downgrade -1 ---")
runner.downgrade("-1")
print(f"  当前版本: {runner.current()}")
print(f"  当前 schema: {db.schema}")

print("\\n--- 6. alembic downgrade base ---")
runner.downgrade("base")
print(f"  当前版本: {runner.current()}")
print(f"  当前 schema: {db.schema}")

# --- 6. 重新升级 ---
print("\\n--- 7. 重新 upgrade head ---")
runner.upgrade("head")
print(f"  当前版本: {runner.current()}")

# --- 7. autogenerate 概念 ---
print("\\n--- 8. autogenerate 自动检测 ---")
print("  原理：对比模型 metadata 与数据库当前 schema")
print("  示例：模型定义 users 有 'phone' 列，数据库无 -> 生成 add_column")
print("  局限：")
print("    - 不检测列重命名")
print("    - 不检测约束语义变化")
print("    - 数据迁移需手写")

# 模拟 autogenerate
model_schema = {
    "users": ["id", "name", "email", "age", "phone"],  # 模型有 phone
    "posts": ["id", "title", "user_id"],
}
db_schema = {
    "users": ["id", "name", "email", "age"],  # 数据库无 phone
    "posts": ["id", "title", "user_id"],
}
print("  模型 schema:", model_schema["users"])
print("  数据库 schema:", db_schema["users"])
diff = set(model_schema["users"]) - set(db_schema["users"])
print(f"  检测到差异: 新增列 {diff}")
print("  生成迁移: op.add_column('users', sa.Column('phone', sa.String(20)))")

# --- 8. vs Django migrations ---
print("\\n--- 9. vs Django migrations ---")
comparison = [
    ("独立性", "独立工具", "绑定 Django"),
    ("ORM", "SQLAlchemy", "Django ORM"),
    ("autogenerate", "需配置 target_metadata", "开箱即用"),
    ("灵活性", "高（任意 SQL）", "中等"),
    ("学习曲线", "较陡", "平缓"),
]
for feat, al, dj in comparison:
    print(f"  {feat}: Alembic {al} | Django {dj}")

# --- 9. 最佳实践 ---
print("\\n--- 10. 最佳实践 ---")
practices = [
    "迁移文件必须可逆（upgrade + downgrade）",
    "不修改已发布的迁移，新建迁移修正",
    "autogenerate 后必须人工检查",
    "大表加列用 server_default 避免锁表",
    "多分支用 alembic merge 合并",
    "生产回滚前备份，destructive 操作有风险",
    "CI 中自动执行 alembic upgrade head",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== Alembic 演示结束 ===")`
  },
  {
    id: "py6-click-typer",
    group: "现代库与框架",
    icon: "💻",
    title: "Click 与 Typer CLI 框架",
    content: `## Click 与 Typer CLI 框架：构建专业命令行工具

### 一、Python CLI 生态概览

Python 构建 CLI 工具的库众多：

- **argparse**：标准库，功能全但代码冗长
- **Click**：第三方，装饰器风格，生态成熟（Flask 作者出品）
- **Typer**：基于 Click + 类型注解，更现代（FastAPI 作者出品）
- **fire**：Google 出品，把函数/对象自动转为 CLI
- **docopt**：从文档字符串解析参数

现代项目首选 **Click**（生态成熟）或 **Typer**（开发体验最佳）。

### 二、Click 装饰器风格

\`\`\`python
import click

@click.command()
@click.option("--name", "-n", default="World", help="问候对象")
@click.option("--count", "-c", default=1, type=int, help="重复次数")
@click.option("--shout", is_flag=True, help="大写输出")
def hello(name, count, shout):
    """简单问候程序"""
    msg = f"Hello, {name}!"
    if shout:
        msg = msg.upper()
    for _ in range(count):
        click.echo(msg)

if __name__ == "__main__":
    hello()
\`\`\`

运行：

\`\`\`bash
$ python hello.py --name Alice --count 2 --shout
HELLO, ALICE!
HELLO, ALICE!

$ python hello.py --help
Usage: hello.py [OPTIONS]

  简单问候程序

Options:
  -n, --name TEXT    问候对象
  -c, --count INTEGER  重复次数
  --shout            大写输出
  --help             Show this help message
\`\`\`

### 三、Click 参数类型

\`\`\`python
@click.command()
@click.option("--port", type=int, required=True, help="端口号")
@click.option("--mode", type=click.Choice(["dev", "prod"]), default="dev")
@click.option("--path", type=click.Path(exists=True), help="必须存在的路径")
@click.option("--verbose", "-v", count=True, help="-v/-vv 控制详细度")
@click.option("--names", multiple=True, help="可多次指定")
@click.argument("src")  # 位置参数
def serve(port, mode, path, verbose, names, src):
    ...
\`\`\`

内置类型：\`int\` / \`float\` / \`str\` / \`bool\` / \`Choice\` / \`Path\` / \`File\` / \`UUID\` / \`DateTime\`。

### 四、Click 子命令 group

\`\`\`python
@click.group()
def cli():
    """Git-like 子命令工具"""
    pass

@cli.command()
@click.argument("name")
def init(name):
    """初始化项目"""
    click.echo(f"初始化 {name}")

@cli.command()
@click.option("--all", is_flag=True)
def clean(all):
    """清理缓存"""
    click.echo(f"清理 {'全部' if all else '默认'}")

@cli.command()
@click.argument("src")
@click.argument("dst")
def move(src, dst):
    """移动文件"""
    click.echo(f"{src} -> {dst}")

if __name__ == "__main__":
    cli()
\`\`\`

运行：\`python tool.py init myapp\` / \`python tool.py clean --all\` / \`python tool.py move a b\`。

### 五、Typer：基于类型注解的 CLI

Typer 用类型注解自动生成 CLI，更现代：

\`\`\`python
import typer

app = typer.Typer()

@app.command()
def hello(name: str = "World", count: int = 1, shout: bool = False):
    """简单问候"""
    msg = f"Hello, {name}!"
    if shout:
        msg = msg.upper()
    for _ in range(count):
        print(msg)

@app.command()
def serve(port: int = 8000, mode: typer.Option(["dev"], help="模式") = ...):
    """启动服务"""
    print(f"端口 {port}, 模式 {mode}")

if __name__ == "__main__":
    app()
\`\`\`

Typer 的优势：
- 类型注解即参数定义，减少样板代码
- 自动从类型推断参数类型（int/str/bool）
- bool 类型自动映射为 \`--flag/--no-flag\`
- 配合 mypy 获得类型检查
- 复用 FastAPI 的设计哲学

### 六、Typer 子命令

\`\`\`python
app = typer.Typer()

@app.command()
def init(name: str):
    """初始化"""
    print(f"init {name}")

@app.command()
def clean(all: bool = False):
    """清理"""
    print(f"clean all={all}")

# 单命令时直接运行，多命令时自动生成子命令
if __name__ == "__main__":
    app()
\`\`\`

### 七、业务场景

- **DevOps 工具**：部署脚本、数据库管理、日志分析
- **数据处理 CLI**：ETL 工具、批处理入口
- **微服务管理**：服务启停、配置生成、健康检查
- **开发者工具**：项目脚手架、代码生成器
- **运维自动化**：批量执行、配置分发

### 八、对比 argparse / Click / Typer / fire

| 维度 | argparse | Click | Typer | fire |
|------|----------|-------|-------|------|
| 标准库 | ✅ | ❌ | ❌ | ❌ |
| 风格 | 命令式 | 装饰器 | 类型注解 | 自动反射 |
| 子命令 | 繁琐 | 优雅 | 优雅 | 自动 |
| 类型检查 | ❌ | ❌ | ✅ | ❌ |
| 帮助生成 | 基础 | 优秀 | 优秀 | 一般 |
| 学习曲线 | 平缓 | 中等 | 平缓 | 极低 |
| 生态 | 内置 | 成熟 | 新兴 | 小众 |
| 适合 | 简单工具 | 复杂 CLI | 现代项目 | 快速原型 |

### 九、避坑提示

1. **Click 的 callback 与 nargs**：\`nargs=-1\` 收集剩余参数，但会消费所有位置参数
2. **Typer 的 Optional 默认值**：\`name: str = "x"\` 是有默认值的选项；\`name: str\` 是必填选项
3. **Typer 单命令行为**：只有一个 \`@app.command()\` 时，Typer 直接运行该命令；多个时才生成子命令
4. **环境变量**：Click 用 \`envvar="DB_URL"\`，Typer 用 \`typer.Option(envvar="DB_URL")\`
5. **类型注解顺序**：Typer 中 \`Optional[str]\` 与 \`str | None\` 都表示可选，但默认值决定是否必填

### 十、原理深入

**Click 的核心机制**：
1. \`@click.command()\` 装饰器把函数包装为 \`Command\` 对象
2. \`@click.option()\` 把参数注册到 Command 的 \`params\` 列表
3. 调用时，Click 解析 \`sys.argv\`，根据 params 定义做类型转换
4. 转换后的值作为关键字参数调用原函数

**Typer 的核心机制**：
1. \`@app.command()\` 用 \`inspect.signature\` 读取函数签名
2. 根据类型注解生成 Click 的 \`Option\` / \`Argument\`
3. 内部仍调用 Click，所以完全兼容 Click 生态

### 十一、最佳实践

- 简单脚本用 argparse（无依赖）；中大型 CLI 用 Click 或 Typer
- 公共工具用 Click（生态成熟，插件多）；新项目用 Typer（开发体验好）
- 子命令用 \`group\` 组织，命名用动词（init/serve/build/deploy）
- 每个命令写 docstring，自动生成帮助
- 用 \`click.echo\` 而非 \`print\`（处理编码、终端检测）
- 错误退出用 \`raise click.ClickException\`，自动打印到 stderr 并退出码 1
- 配合 \`rich\` 美化输出，\`click-repl\` 实现交互式 shell`,
    code: `# Click 与 Typer 概念演示：用标准库 argparse 演示 CLI 框架核心概念
# 不依赖 click/typer，演示命令/选项/子命令/类型转换

import argparse
import sys

print("=== Click 与 Typer CLI 框架概念演示 ===\\n")

# --- 1. argparse 基础（对比 Click 的 @command + @option） ---
print("--- 1. 基础命令与选项（argparse 模拟 Click） ---")

def make_hello_parser():
    """模拟 Click 的 @click.command + @click.option"""
    parser = argparse.ArgumentParser(
        prog="hello",
        description="简单问候程序（模拟 Click）",
    )
    parser.add_argument("--name", "-n", default="World", help="问候对象")
    parser.add_argument("--count", "-c", type=int, default=1, help="重复次数")
    parser.add_argument("--shout", action="store_true", help="大写输出")
    return parser

# 模拟命令行调用
parser = make_hello_parser()
args = parser.parse_args(["--name", "Alice", "--count", "2", "--shout"])
print(f"  解析参数: {args}")
msg = f"Hello, {args.name}!"
if args.shout:
    msg = msg.upper()
for _ in range(args.count):
    print(f"  {msg}")

# --- 2. 参数类型 ---
print("\\n--- 2. 参数类型（模拟 Click 类型系统） ---")

def make_typed_parser():
    parser = argparse.ArgumentParser(prog="serve", description="服务启动")
    parser.add_argument("--port", type=int, required=True, help="端口号")
    parser.add_argument("--mode", choices=["dev", "prod"], default="dev")
    parser.add_argument("--verbose", "-v", action="count", default=0, help="-v/-vv")
    parser.add_argument("--names", action="append", default=[], help="可多次指定")
    parser.add_argument("src", nargs="?", help="位置参数")
    return parser

parser = make_typed_parser()
args = parser.parse_args(["--port", "8080", "--mode", "prod", "-vv", "--names", "a", "--names", "b", "input.txt"])
print(f"  port: {args.port} (类型 {type(args.port).__name__})")
print(f"  mode: {args.mode} (Choice 限制)")
print(f"  verbose: {args.verbose} (count 模式)")
print(f"  names: {args.names} (multiple)")
print(f"  src: {args.src} (位置参数)")

# --- 3. 子命令 group ---
print("\\n--- 3. 子命令 group（模拟 Click.group） ---")

def cmd_init(args):
    print(f"    [init] 初始化项目: {args.name}")

def cmd_clean(args):
    target = "全部" if args.all else "默认"
    print(f"    [clean] 清理 {target}")

def cmd_move(args):
    print(f"    [move] {args.src} -> {args.dst}")

# 模拟 click.group()
main_parser = argparse.ArgumentParser(prog="tool", description="Git-like 工具")
subparsers = main_parser.add_subparsers(dest="command", required=True)

# init 子命令
p_init = subparsers.add_parser("init", help="初始化项目")
p_init.add_argument("name", help="项目名")
p_init.set_defaults(func=cmd_init)

# clean 子命令
p_clean = subparsers.add_parser("clean", help="清理缓存")
p_clean.add_argument("--all", action="store_true", help="清理全部")
p_clean.set_defaults(func=cmd_clean)

# move 子命令
p_move = subparsers.add_parser("move", help="移动文件")
p_move.add_argument("src")
p_move.add_argument("dst")
p_move.set_defaults(func=cmd_move)

# 模拟调用各子命令
for argv in [["init", "myapp"], ["clean", "--all"], ["move", "a.txt", "b.txt"]]:
    args = main_parser.parse_args(argv)
    print(f"  $ tool {' '.join(argv)}")
    args.func(args)

# --- 4. 模拟 Typer 类型注解风格 ---
print("\\n--- 4. Typer 类型注解风格（概念演示） ---")

def typer_like_command(name: str = "World", count: int = 1, shout: bool = False):
    """模拟 Typer：从类型注解自动生成 CLI"""
    msg = f"Hello, {name}!"
    if shout:
        msg = msg.upper()
    for _ in range(count):
        print(f"    {msg}")

# 模拟 Typer 内部：用 inspect 读取签名生成参数
import inspect
sig = inspect.signature(typer_like_command)
print("  Typer 从函数签名自动推断参数:")
for pname, param in sig.parameters.items():
    typ = param.annotation.__name__ if hasattr(param.annotation, '__name__') else str(param.annotation)
    default = param.default if param.default is not inspect.Parameter.empty else "必填"
    print(f"    {pname}: {typ} = {default}")

print("  调用 typer_like_command(name='Alice', count=2, shout=True):")
typer_like_command(name="Alice", count=2, shout=True)

# --- 5. 环境变量支持 ---
print("\\n--- 5. 环境变量支持 ---")
import os
os.environ["DB_URL"] = "postgresql://localhost/db"

parser = argparse.ArgumentParser()
parser.add_argument("--db-url", default=os.environ.get("DB_URL", "sqlite://"), help="数据库 URL")
args = parser.parse_args([])  # 不传参数，从环境变量读取
print(f"  未传参，从 DB_URL 读取: {args.db_url}")

# --- 6. 错误处理 ---
print("\\n--- 6. 错误处理与退出码 ---")
parser = make_typed_parser()
try:
    # 缺少必填参数
    parser.parse_args(["--mode", "dev"])
except SystemExit as e:
    print(f"  缺少 --port，argparse 退出码: {e.code}")

try:
    # 非法 choice
    parser.parse_args(["--port", "8080", "--mode", "staging"])
except SystemExit as e:
    print(f"  非法 mode，argparse 退出码: {e.code}")

# --- 7. 帮助信息 ---
print("\\n--- 7. 帮助信息（模拟 --help） ---")
parser = make_hello_parser()
help_text = parser.format_help()
print(help_text)

# --- 8. 对比表 ---
print("--- 8. argparse / Click / Typer / fire 对比 ---")
comparison = [
    ("标准库", "✅", "❌", "❌", "❌"),
    ("风格", "命令式", "装饰器", "类型注解", "自动反射"),
    ("子命令", "繁琐", "优雅", "优雅", "自动"),
    ("类型检查", "❌", "❌", "✅", "❌"),
    ("学习曲线", "平缓", "中等", "平缓", "极低"),
    ("生态", "内置", "成熟", "新兴", "小众"),
]
headers = ["维度", "argparse", "Click", "Typer", "fire"]
print(f"  {'维度':<10} {'argparse':<10} {'Click':<10} {'Typer':<10} {'fire'}")
for row in comparison:
    print(f"  {row[0]:<10} {row[1]:<10} {row[2]:<10} {row[3]:<10} {row[4]}")

print("\\n=== Click 与 Typer 演示结束 ===")`
  },
  {
    id: "py6-rich",
    group: "现代库与框架",
    icon: "🎨",
    title: "Rich 终端美化",
    content: `## Rich 终端美化：让 CLI 输出赏心悦目

### 一、Rich 是什么

Rich 是 Will McGugan 开发的终端格式化库，能让 Python CLI 输出彩色文本、表格、面板、进度条、语法高亮、Markdown 渲染等。它解决了"CLI 工具输出难看"的痛点，被 Black、pip、Pytest、FastAPI 等知名项目采用。

Rich 的核心能力：
- **彩色文本**：跨平台 ANSI 颜色（Windows 也支持）
- **表格**：自动列宽、对齐、换行
- **面板 Panel**：带边框的文本块
- **进度条 Progress**：多任务并发进度
- **语法高亮 Syntax**：Pygments 集成
- **Markdown 渲染**：终端显示 Markdown
- **树形 Tree**：目录结构、调用链
- **日志 Live**：动态刷新输出

### 二、Console 对象

\`\`\`python
from rich.console import Console

console = Console()
console.print("普通文本")
console.print("[red]红色文本[/red]")
console.print("[bold yellow]加粗黄色[/bold yellow]")
console.print("[blue on white]蓝字白底[/blue on white]")
\`\`\`

Console 是 Rich 的核心，所有渲染都通过它。它自动检测终端能力（是否支持颜色、宽度），在不支持时降级为纯文本。

### 三、颜色与样式

\`\`\`python
from rich.console import Console
from rich.style import Style

console = Console()
# 内置颜色名
console.print("red green yellow blue magenta cyan white", style="red")

# 自定义样式
error_style = Style(color="white", bgcolor="red", bold=True, italic=True)
console.print("错误信息", style=error_style)

# hex 颜色
console.print("[#ff0000]十六进制红色[/#ff0000]")
\`\`\`

Rich 支持 256 色、TrueColor（24 位），样式可通过 \`Style\` 对象或标记字符串指定。

### 四、Table 表格

\`\`\`python
from rich.console import Console
from rich.table import Table

table = Table(title="用户列表")
table.add_column("ID", style="cyan", justify="right")
table.add_column("姓名", style="magenta")
table.add_column("年龄", justify="center")
table.add_column("邮箱", style="green")

table.add_row("1", "Alice", "30", "alice@example.com")
table.add_row("2", "Bob", "25", "bob@example.com")
table.add_row("3", "Charlie", "35", "charlie@example.com")

console = Console()
console.print(table)
\`\`\`

Table 自动计算列宽，支持换行、对齐、样式。

### 五、Panel 面板

\`\`\`python
from rich.panel import Panel
from rich.console import Console

console = Console()
console.print(Panel(
    "这是一段重要信息，被面板包围。",
    title="提示",
    border_style="blue",
    expand=False,
))
\`\`\`

Panel 用于突出显示内容，支持自定义边框样式、标题、副标题。

### 六、Progress 进度条

\`\`\`python
from rich.progress import Progress
import time

with Progress() as progress:
    task1 = progress.add_task("[red]下载...", total=100)
    task2 = progress.add_task("[green]处理...", total=200)

    while not progress.finished:
        progress.update(task1, advance=1)
        progress.update(task2, advance=2)
        time.sleep(0.02)
\`\`\`

Progress 支持多任务并发、自定义列、ETA 计算等。

### 七、Syntax 语法高亮

\`\`\`python
from rich.syntax import Syntax
from rich.console import Console

code = '''
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
'''

syntax = Syntax(code, "python", theme="monokai", line_numbers=True)
console = Console()
console.print(syntax)
\`\`\`

Syntax 基于 Pygments，支持 500+ 语言的语法高亮。

### 八、业务场景

- **CLI 工具美化**：数据查询结果用 Table 展示，错误用红色 Panel 突出
- **长任务进度**：批处理、下载、部署用 Progress 显示进度
- **日志系统**：配合 \`rich.logging.RichHandler\` 美化标准 logging
- **文档输出**：Markdown 渲染、代码高亮，提升文档可读性
- **调试输出**：\`console.print(...)\` 自动美化 dict/list/对象

### 九、vs colorama / blessed

| 维度 | Rich | colorama | blessed |
|------|------|----------|---------|
| 主要功能 | 综合格式化 | ANSI 跨平台 | 终端控制 |
| 表格/面板 | ✅ | ❌ | ❌ |
| 进度条 | ✅ | ❌ | ❌ |
| 语法高亮 | ✅ | ❌ | ❌ |
| Markdown | ✅ | ❌ | ❌ |
| 学习曲线 | 平缓 | 极低 | 中等 |
| 适合 | 现代 CLI | 仅需颜色 | 全屏 TUI |

### 十、避坑提示

1. **重定向到文件**：管道或重定向时 Rich 自动降级为纯文本，但表格可能错乱
2. **性能**：大量输出时 Rich 比 print 慢，用 \`console.file\` 直接写或减少样式
3. **Windows 兼容**：旧版 Windows 需 \`colorama.init()\`，新版（Win10+）原生支持
4. **样式嵌套**：\`[red][bold]文本[/bold][/red]\` 正确，\`[red][bold]文本[/red][/bold]\` 错误
5. **Jupyter 兼容**：Rich 在 Jupyter 中输出 HTML，部分功能受限

### 十一、原理深入

Rich 的渲染流程：
1. **Console** 接收"可渲染对象"（实现 \`__rich_console__\` 协议）
2. 调用对象的渲染方法，生成 \`Segment\` 序列（文本 + 样式）
3. Console 根据终端能力（宽度、颜色支持）布局 Segment
4. 转换为 ANSI 转义码输出到终端

关键设计：
- **协议而非继承**：任何实现 \`__rich_console__\` 的类都可被 Console 渲染
- **Segment 抽象**：把"文本+样式"拆分为最小单元，便于布局和裁剪
- **主题系统**：\`Theme\` 对象统一管理样式，避免硬编码颜色

### 十二、最佳实践

- 用 \`console.print\` 替代 \`print\`，自动美化复杂对象
- 表格列指定 \`style\` 和 \`justify\`，提升可读性
- 长任务必用 \`Progress\`，提升用户体验
- 配合 \`rich.logging.RichHandler\` 美化日志
- 错误信息用 \`Panel(border_style="red")\` 突出
- 用 \`Live\` 实现动态刷新（如监控面板）
- 避免在热路径过度使用样式，影响性能`,
    code: `# Rich 终端美化概念演示：用 ANSI 转义码模拟 Rich 核心能力
# 不依赖 rich，演示 Console/Table/Panel/Progress/Syntax 概念

import sys
import time

print("=== Rich 终端美化概念演示 ===\\n")

# --- 1. ANSI 转义码基础 ---
print("--- 1. ANSI 颜色转义码 ---")

# ANSI 颜色码
COLORS = {
    "red": 31, "green": 32, "yellow": 33,
    "blue": 34, "magenta": 35, "cyan": 36, "white": 37,
}

def colorize(text, color=None, bold=False, bg=None):
    """模拟 Rich 的样式标记"""
    codes = []
    if bold:
        codes.append("1")
    if color and color in COLORS:
        codes.append(str(COLORS[color]))
    if bg and bg in COLORS:
        codes.append(str(COLORS[bg] + 10))
    if not codes:
        return text
    prefix = "\\033[" + ";".join(codes) + "m"
    suffix = "\\033[0m"
    return f"{prefix}{text}{suffix}"

# 演示各种颜色
for color in ["red", "green", "yellow", "blue", "magenta", "cyan"]:
    print(f"  {colorize(color + ' 文本', color=color)}", end="")
print()
print(f"  {colorize('加粗文本', bold=True)}")
print(f"  {colorize('红底白字', color='white', bg='red')}")

# --- 2. 模拟 Console ---
print("\\n--- 2. Console 对象 ---")

class SimpleConsole:
    """模拟 rich.Console"""
    def print(self, text, style=None):
        if style:
            # 简单解析 style 字符串
            parts = style.split()
            color = None
            bold = False
            for p in parts:
                if p == "bold":
                    bold = True
                elif p in COLORS:
                    color = p
            print(colorize(text, color=color, bold=bold))
        else:
            print(text)

console = SimpleConsole()
console.print("普通文本")
console.print("红色文本", style="red")
console.print("加粗黄色", style="bold yellow")
console.print("蓝字", style="blue")

# --- 3. 模拟 Table ---
print("\\n--- 3. Table 表格 ---")

class SimpleTable:
    """模拟 rich.table.Table"""
    def __init__(self, title=""):
        self.title = title
        self.columns = []  # (name, style, align)
        self.rows = []

    def add_column(self, name, style="", justify="left"):
        self.columns.append((name, style, justify))

    def add_row(self, *cells):
        self.rows.append(cells)

    def render(self):
        if self.title:
            print(f"  {colorize(self.title, bold=True)}")
        # 计算列宽
        widths = [len(c[0]) for c in self.columns]
        for row in self.rows:
            for i, cell in enumerate(row):
                widths[i] = max(widths[i], len(str(cell)))
        # 表头
        header = " | ".join(
            str(c[0]).ljust(widths[i]) for i, c in enumerate(self.columns)
        )
        print(f"  {colorize(header, bold=True)}")
        print(f"  {'-' * len(header)}")
        # 行
        for row in self.rows:
            cells = []
            for i, cell in enumerate(row):
                cell_str = str(cell).ljust(widths[i])
                style = self.columns[i][1]
                if style and style in COLORS:
                    cell_str = colorize(cell_str, color=style)
                cells.append(cell_str)
            print(f"  {' | '.join(cells)}")

table = SimpleTable(title="用户列表")
table.add_column("ID", style="cyan", justify="right")
table.add_column("姓名", style="magenta")
table.add_column("年龄")
table.add_column("邮箱", style="green")
table.add_row("1", "Alice", "30", "alice@x.com")
table.add_row("2", "Bob", "25", "bob@x.com")
table.add_row("3", "Charlie", "35", "charlie@x.com")
table.render()

# --- 4. 模拟 Panel ---
print("\\n--- 4. Panel 面板 ---")

class SimplePanel:
    """模拟 rich.panel.Panel"""
    def __init__(self, content, title="", border_style="blue"):
        self.content = content
        self.title = title
        self.border_style = border_style

    def render(self):
        lines = self.content.split("\\n")
        width = max(len(self.title) + 4, max(len(l) for l in lines) + 4, 30)
        border_char = "*"
        border_color = self.border_style if self.border_style in COLORS else "blue"
        # 顶边
        top = border_char * width
        print(f"  {colorize(top, color=border_color)}")
        # 标题
        if self.title:
            title_line = f"{border_char} {self.title} ".ljust(width - 1) + border_char
            print(f"  {colorize(title_line, color=border_color)}")
            print(f"  {colorize(top, color=border_color)}")
        # 内容
        for line in lines:
            content_line = f"{border_char} {line}".ljust(width - 1) + border_char
            print(f"  {colorize(content_line, color=border_color)}")
        # 底边
        print(f"  {colorize(top, color=border_color)}")

panel = SimplePanel("这是一段重要信息，被面板包围。\\n可以有多行内容。", title="提示", border_style="blue")
panel.render()

# --- 5. 模拟 Progress 进度条 ---
print("\\n--- 5. Progress 进度条 ---")

class SimpleProgress:
    """模拟 rich.progress.Progress"""
    def __init__(self):
        self.tasks = {}

    def add_task(self, description, total):
        task_id = len(self.tasks)
        self.tasks[task_id] = {
            "desc": description,
            "total": total,
            "completed": 0,
        }
        return task_id

    def update(self, task_id, advance=1):
        self.tasks[task_id]["completed"] += advance

    @property
    def finished(self):
        return all(t["completed"] >= t["total"] for t in self.tasks.values())

    def render(self):
        for tid, task in self.tasks.items():
            pct = task["completed"] / task["total"] * 100
            bar_len = 20
            filled = int(bar_len * task["completed"] / task["total"])
            bar = "█" * filled + "-" * (bar_len - filled)
            print(f"  {task['desc']} |{colorize(bar, color='green')}| {pct:5.1f}% ({task['completed']}/{task['total']})")

# 模拟进度
progress = SimpleProgress()
t1 = progress.add_task("[red]下载", 50)
t2 = progress.add_task("[green]处理", 80)

# 模拟任务推进（缩短为几步演示）
for step in range(5):
    progress.update(t1, advance=10)
    progress.update(t2, advance=16)
progress.render()

# --- 6. 模拟 Syntax 高亮 ---
print("\\n--- 6. Syntax 语法高亮（简化） ---")

code = '''def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)'''

# 简单的关键字高亮
keywords = {"def", "if", "return", "for", "while", "class", "import", "from"}
lines = code.split("\\n")
for line in lines:
    colored = line
    for kw in keywords:
        colored = colored.replace(kw, colorize(kw, color="magenta", bold=True))
    # 函数名着色
    if "def " in line:
        colored = colored.replace("def ", colorize("def ", color="magenta", bold=True))
    print(f"  {colored}")

# --- 7. vs colorama / blessed ---
print("\\n--- 7. vs colorama / blessed ---")
comparison = [
    ("主要功能", "综合格式化", "ANSI 跨平台", "终端控制"),
    ("表格/面板", "✅", "❌", "❌"),
    ("进度条", "✅", "❌", "❌"),
    ("语法高亮", "✅ (Pygments)", "❌", "❌"),
    ("Markdown", "✅", "❌", "❌"),
    ("学习曲线", "平缓", "极低", "中等"),
]
print(f"  {'维度':<12} {'Rich':<16} {'colorama':<16} {'blessed'}")
for row in comparison:
    print(f"  {row[0]:<12} {row[1]:<16} {row[2]:<16} {row[3]}")

# --- 8. 最佳实践 ---
print("\\n--- 8. 最佳实践 ---")
practices = [
    "用 console.print 替代 print，自动美化复杂对象",
    "表格列指定 style 和 justify 提升可读性",
    "长任务必用 Progress 提升用户体验",
    "配合 RichHandler 美化 logging",
    "错误信息用 Panel(border_style='red') 突出",
    "避免在热路径过度使用样式影响性能",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== Rich 演示结束 ===")`
  },
  {
    id: "py6-structlog",
    group: "现代库与框架",
    icon: "📜",
    title: "structlog 结构化日志",
    content: `## structlog 结构化日志：为可观测性而生

### 一、为什么需要结构化日志

传统日志是"人类可读的字符串"：

\`\`\`
2024-01-01 12:00:00 INFO User alice logged in from 1.2.3.4
\`\`\`

这对人友好，但对机器不友好。在微服务、ELK、CloudWatch 时代，日志需要被机器解析、检索、聚合。字符串日志的痛点：

- **解析脆弱**：正则提取字段，格式一改就崩
- **字段丢失**：\`alice\` 是用户名还是邮箱？没有键名
- **难以聚合**：统计"某用户操作次数"需要解析所有日志
- **上下文散落**：request_id、user_id 没有结构化绑定

结构化日志（通常是 JSON）解决这些问题：

\`\`\`json
{"timestamp": "2024-01-01T12:00:00Z", "level": "info", "event": "user.login", "user": "alice", "ip": "1.2.3.4", "request_id": "abc123"}
\`\`\`

### 二、structlog 配置

\`\`\`python
import structlog
import logging

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    logger_factory=structlog.PrintLoggerFactory(),
)
\`\`\`

配置后，\`structlog.get_logger()\` 返回的 logger 会输出 JSON。

### 三、基本使用

\`\`\`python
log = structlog.get_logger()

log.info("user.login", user="alice", ip="1.2.3.4")
# {"event": "user.login", "user": "alice", "ip": "1.2.3.4", "level": "info", "timestamp": "..."}

log.warning("rate_limit.exceeded", user="alice", limit=100)
log.error("db.connection_failed", host="db1", port=5432)
\`\`\`

第一个参数是事件名（event），后续是键值对上下文。

### 四、上下文绑定 bind

\`bind\` 把上下文绑定到 logger，后续日志自动携带：

\`\`\`python
log = structlog.get_logger()

# 绑定请求级上下文
request_log = log.bind(request_id="abc123", user_id=42)
request_log.info("request.start")
# {"event": "request.start", "request_id": "abc123", "user_id": 42, ...}

request_log.info("request.processed", duration_ms=120)
# {"event": "request.processed", "request_id": "abc123", "user_id": 42, "duration_ms": 120, ...}

# 进一步绑定
db_log = request_log.bind(db="users")
db_log.info("db.query", sql="SELECT * FROM users")
# 包含 request_id, user_id, db
\`\`\`

### 五、contextvars 异步上下文

在异步/多线程环境，用 \`contextvars\` 绑定请求级上下文：

\`\`\`python
import structlog

# 中间件中设置
structlog.contextvars.bind_contextvars(request_id=req.id, user_id=user.id)

# 任何地方获取 logger 都会自动带上
log = structlog.get_logger()
log.info("some.event", extra="data")  # 自动含 request_id, user_id

# 请求结束清除
structlog.contextvars.clear_contextvars()
\`\`\`

这避免了手动传递 logger 的繁琐。

### 六、处理器链 processor

structlog 的核心是"处理器链"：日志事件经过一系列函数处理，最终输出。

\`\`\`python
def add_app_name(logger, method_name, event_dict):
    event_dict["app"] = "my-service"
    return event_dict

structlog.configure(
    processors=[
        add_app_name,                           # 自定义处理器
        structlog.processors.add_log_level,     # 添加 level
        structlog.processors.TimeStamper(),     # 添加时间戳
        structlog.processors.JSONRenderer(),    # 输出 JSON
    ],
)
\`\`\`

每个处理器接收 \`event_dict\`，可修改后传给下一个。常见内置处理器：
- \`add_log_level\`：添加 level 字段
- \`TimeStamper\`：添加时间戳
- \`StackInfoRenderer\`：堆栈信息
- \`format_exc_info\`：异常格式化
- \`JSONRenderer\` / \`ConsoleRenderer\`：输出格式
- \`CallsiteParameterAdder\`：添加调用位置（文件、行号）

### 七、与 logging 模块集成

structlog 可与标准 logging 集成，让第三方库的日志也变结构化：

\`\`\`python
import logging
import structlog

# 配置标准 logging
logging.basicConfig(level=logging.INFO)

# 配置 structlog 输出到 logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
)

# 统一格式化
formatter = structlog.stdlib.ProcessorFormatter(
    processor=structlog.processors.JSONRenderer(),
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
root_logger = logging.getLogger()
root_logger.addHandler(handler)
\`\`\`

### 八、业务场景

- **微服务日志**：每个服务输出 JSON 日志，ELK 统一采集
- **请求追踪**：request_id 贯穿整个请求链路
- **审计日志**：用户操作记录为结构化数据，便于查询
- **性能监控**：记录耗时、QPS 等指标到日志
- **错误诊断**：异常堆栈 + 上下文字段，快速定位

### 九、vs 标准 logging

| 维度 | structlog | logging |
|------|-----------|---------|
| 输出格式 | 结构化 (JSON) | 字符串 |
| 字段绑定 | bind/contextvars | 无 |
| 处理器链 | 显式可定制 | Handler/Formatter |
| 性能 | 略低（JSON 序列化） | 高 |
| 机器解析 | ✅ 友好 | ❌ 需正则 |
| 生态 | 新兴 | 标准库 |
| 适合 | 微服务/云原生 | 传统应用 |

### 十、避坑提示

1. **不要在日志放敏感信息**：密码、token、身份证号必须脱敏
2. **JSON 序列化性能**：高频日志场景，考虑用 \`orjson\` 或 msgpack
3. **contextvars 泄漏**：异步任务结束需 \`clear_contextvars\`，否则上下文残留
4. **日志级别滥用**：INFO 用于业务事件，DEBUG 用于调试，ERROR 用于系统错误
5. **大对象日志**：避免 log 整个 request body / response，截断或采样

### 十一、原理深入

structlog 的设计哲学："日志是事件流，不是字符串"。

核心机制：
1. **BoundLogger**：包装器，维护绑定的上下文
2. **processor chain**：事件经过处理器链，每步可修改 event_dict
3. **LoggerFactory**：底层日志输出（PrintLogger / stdlib Logger）
4. **contextvars**：基于 Python \`contextvars\` 模块，实现协程安全的上下文传递

调用 \`log.info("event", k=v)\` 的流程：
1. 构造 \`event_dict = {"event": "event", "k": v, ...绑定上下文}\`
2. 依次调用 processor chain，每个 processor 接收并返回 event_dict
3. 最后一个 processor（Renderer）把 event_dict 转为字符串
4. 字符串交给 LoggerFactory 输出

### 十二、最佳实践

- 生产用 \`JSONRenderer\`，开发用 \`ConsoleRenderer\`（彩色可读）
- 用 \`bind\` 绑定请求/用户上下文，避免每条日志重复传
- 异步环境用 \`contextvars\`，配合中间件自动设置/清除
- 自定义 processor 添加业务字段（app 名、环境、版本）
- 与标准 logging 集成，统一第三方库日志格式
- 敏感字段用 processor 脱敏（如 \`mask_password\`）
- 配合 ELK/Loki/Datadog，让日志真正可观测`,
    code: `# structlog 概念演示：用标准库 logging + json 模拟结构化日志
# 不依赖 structlog，演示 bind/contextvars/processor chain/JSON 输出

import logging
import json
import sys
import contextvars
from datetime import datetime, timezone

print("=== structlog 结构化日志概念演示 ===\\n")

# --- 1. 传统日志 vs 结构化日志 ---
print("--- 1. 传统日志 vs 结构化日志 ---")

# 传统字符串日志
traditional = "2024-01-01 12:00:00 INFO User alice logged in from 1.2.3.4"
print(f"  传统日志: {traditional}")
print("  问题：解析需正则，字段无键名")

# 结构化 JSON 日志
structured = {
    "timestamp": "2024-01-01T12:00:00Z",
    "level": "info",
    "event": "user.login",
    "user": "alice",
    "ip": "1.2.3.4",
    "request_id": "abc123",
}
print(f"  结构化日志: {json.dumps(structured, ensure_ascii=False)}")
print("  优势：JSON 解析，字段有键名，可检索聚合")

# --- 2. 模拟 structlog 配置 ---
print("\\n--- 2. 模拟 structlog 配置（processor chain） ---")

def add_log_level(logger, method_name, event_dict):
    """添加 level 字段"""
    event_dict["level"] = method_name
    return event_dict

def add_timestamp(logger, method_name, event_dict):
    """添加 ISO 时间戳"""
    event_dict["timestamp"] = datetime.now(timezone.utc).isoformat()
    return event_dict

def add_app_name(logger, method_name, event_dict):
    """自定义 processor：添加应用名"""
    event_dict["app"] = "my-service"
    return event_dict

def json_renderer(logger, method_name, event_dict):
    """渲染为 JSON 字符串"""
    return json.dumps(event_dict, ensure_ascii=False)

processors = [add_app_name, add_log_level, add_timestamp, json_renderer]
print(f"  processor chain: {[p.__name__ for p in processors]}")

# --- 3. 模拟 BoundLogger ---
print("\\n--- 3. BoundLogger 与 bind 上下文 ---")

class BoundLogger:
    """模拟 structlog.BoundLogger"""
    def __init__(self, processors, context=None):
        self._processors = processors
        self._context = context or {}

    def bind(self, **kwargs):
        """绑定上下文，返回新 logger"""
        new_context = {**self._context, **kwargs}
        return BoundLogger(self._processors, new_context)

    def _log(self, method, event, **kwargs):
        event_dict = {"event": event, **self._context, **kwargs}
        for processor in self._processors:
            event_dict = processor(self, method, event_dict)
        print(f"  {event_dict}")
        return event_dict

    def info(self, event, **kwargs):
        return self._log("info", event, **kwargs)

    def warning(self, event, **kwargs):
        return self._log("warning", event, **kwargs)

    def error(self, event, **kwargs):
        return self._log("error", event, **kwargs)

# 创建 logger
log = BoundLogger(processors)

# 基本日志
log.info("user.login", user="alice", ip="1.2.3.4")
log.warning("rate_limit.exceeded", user="alice", limit=100)
log.error("db.connection_failed", host="db1", port=5432)

# --- 4. bind 上下文绑定 ---
print("\\n--- 4. bind 上下文绑定 ---")

# 绑定请求级上下文
request_log = log.bind(request_id="abc123", user_id=42)
request_log.info("request.start")
request_log.info("request.processed", duration_ms=120)

# 进一步绑定
db_log = request_log.bind(db="users")
db_log.info("db.query", sql="SELECT * FROM users")
db_log.error("db.error", code="timeout")

# --- 5. contextvars 异步上下文 ---
print("\\n--- 5. contextvars 异步上下文 ---")

request_id_var = contextvars.ContextVar("request_id", default=None)
user_id_var = contextvars.ContextVar("user_id", default=None)

def add_contextvars(logger, method_name, event_dict):
    """从 contextvars 读取上下文"""
    rid = request_id_var.get()
    uid = user_id_var.get()
    if rid:
        event_dict["request_id"] = rid
    if uid:
        event_dict["user_id"] = uid
    return event_dict

# 带 contextvars 的 processor chain
cv_processors = [add_app_name, add_log_level, add_timestamp, add_contextvars, json_renderer]
cv_log = BoundLogger(cv_processors)

# 模拟请求中间件设置上下文
token1 = request_id_var.set("req-001")
token2 = user_id_var.set(99)
print("  设置 request_id=req-001, user_id=99")
cv_log.info("request.start")
cv_log.info("db.query", table="orders")

# 清除上下文
request_id_var.reset(token1)
user_id_var.reset(token2)
print("  清除上下文后:")
cv_log.info("background.task", name="cleanup")

# --- 6. 与标准 logging 集成 ---
print("\\n--- 6. 与标准 logging 集成概念 ---")
print("  structlog 可配置为输出到标准 logging，统一第三方库日志")
print("  配置 wrapper_class=structlog.stdlib.BoundLogger")
print("  processor 末尾用 wrap_for_formatter 桥接")

# 模拟：用标准 logging 输出 JSON
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "event": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        return json.dumps(log_dict, ensure_ascii=False)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
std_logger = logging.getLogger("demo")
std_logger.addHandler(handler)
std_logger.setLevel(logging.INFO)
std_logger.info("third.party.log", extra={"user": "bob"})
# 注意：标准 logging 的 extra 在 record 上，简化演示直接打印
print(f"  (简化) 第三方库日志经 JSON 格式化输出")

# --- 7. 敏感信息脱敏 ---
print("\\n--- 7. 敏感信息脱敏 processor ---")

def mask_sensitive(logger, method_name, event_dict):
    """脱敏 processor：隐藏密码、token"""
    sensitive_keys = {"password", "token", "secret", "api_key"}
    for key in list(event_dict.keys()):
        if key.lower() in sensitive_keys and isinstance(event_dict[key], str):
            event_dict[key] = "***MASKED***"
    return event_dict

mask_processors = [mask_sensitive, add_log_level, json_renderer]
mask_log = BoundLogger(mask_processors)
mask_log.info("user.auth", user="alice", password="supersecret", token="abc123")
mask_log.info("api.call", endpoint="/login", api_key="sk-xxxxx")

# --- 8. vs 标准 logging ---
print("\\n--- 8. vs 标准 logging ---")
comparison = [
    ("输出格式", "结构化 (JSON)", "字符串"),
    ("字段绑定", "bind / contextvars", "无"),
    ("处理器链", "显式可定制", "Handler/Formatter"),
    ("机器解析", "✅ 友好", "❌ 需正则"),
    ("生态", "新兴", "标准库"),
    ("适合", "微服务/云原生", "传统应用"),
]
print(f"  {'维度':<12} {'structlog':<20} {'logging'}")
for row in comparison:
    print(f"  {row[0]:<12} {row[1]:<20} {row[2]}")

# --- 9. 最佳实践 ---
print("\\n--- 9. 最佳实践 ---")
practices = [
    "生产用 JSONRenderer，开发用 ConsoleRenderer（彩色可读）",
    "用 bind 绑定请求/用户上下文，避免每条日志重复传",
    "异步环境用 contextvars，配合中间件设置/清除",
    "自定义 processor 添加 app 名、环境、版本",
    "敏感字段用 mask_sensitive processor 脱敏",
    "配合 ELK/Loki/Datadog 实现可观测性",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== structlog 演示结束 ===")`
  },
  {
    id: "py6-tenacity",
    group: "现代库与框架",
    icon: "🔁",
    title: "Tenacity 重试库",
    content: `## Tenacity 重试库：优雅处理瞬时失败

### 一、为什么需要重试

分布式系统中，瞬时失败无处不在：

- 网络抖动导致请求超时
- 数据库连接池耗尽
- 第三方 API 限流（429）
- 服务短暂不可用（503）

直接抛错给用户体验差，简单的 \`while True\` 重试又可能雪崩。需要一个**可控、可观测、可配置**的重试机制。Tenacity 是 Python 生态最流行的重试库，由 OpenStack 项目演化而来。

### 二、@retry 装饰器基础

\`\`\`python
from tenacity import retry

@retry
def fetch_data():
    response = requests.get("https://api.example.com/data")
    return response.json()
\`\`\`

默认配置：重试无限次、不等待、捕获所有异常。这显然不实用，需要定制。

### 三、stop 条件：何时停止

\`\`\`python
from tenacity import retry, stop_after_attempt, stop_after_delay

# 最多重试 3 次
@retry(stop=stop_after_attempt(3))
def fetch(): ...

# 最多重试 10 秒
@retry(stop=stop_after_delay(10))
def fetch(): ...

# 组合：3 次或 10 秒，先到为准
@retry(stop=stop_after_attempt(3) | stop_after_delay(10))
def fetch(): ...
\`\`\`

stop 条件可组合（\`|\` 表示或）。

### 四、wait 策略：等待多久

\`\`\`python
from tenacity import retry, wait_fixed, wait_exponential, wait_random

# 固定等待 1 秒
@retry(wait=wait_fixed(1))
def fetch(): ...

# 指数退避：1s, 2s, 4s, 8s...
@retry(wait=wait_exponential(multiplier=1, max=60))
def fetch(): ...

# 指数退避 + 随机抖动（避免惊群）
@retry(wait=wait_exponential() + wait_random(0, 2))
def fetch(): ...
\`\`\`

指数退避 + 抖动是生产推荐策略，避免重试风暴同步发生。

### 五、retry 异常类型

\`\`\`python
from tenacity import retry, retry_if_exception_type, retry_if_result
import requests

# 只重试网络错误和超时
@retry(
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
    stop=stop_after_attempt(3),
)
def fetch(): ...

# 重试特定返回值（如 None 或 False）
@retry(retry=retry_if_result(lambda x: x is None), stop=stop_after_attempt(5))
def get_resource(): ...
\`\`\`

不指定 \`retry\` 默认重试所有异常。生产应明确指定，避免重试不可恢复的错误（如参数错误）。

### 六、before / after 回调

\`\`\`python
from tenacity import retry, before_log, after_log
import logging

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARNING),
)
def fetch(): ...
\`\`\`

回调用于日志记录、指标上报、告警。也可自定义：

\`\`\`python
def log_retry(retry_state):
    print(f"第 {retry_state.attempt_number} 次重试，等待 {retry_state.next_action.sleep}s")

@retry(before=log_retry)
def fetch(): ...
\`\`\`

### 七、重试异常与 Reraise

默认情况下，重试耗尽后抛出 \`RetryError\`。如需抛出原始异常：

\`\`\`python
from tenacity import retry, stop_after_attempt, retry_if_exception_type, RetryError

@retry(
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(ConnectionError),
    reraise=True,  # 重试耗尽后抛原始异常
)
def fetch(): ...

try:
    fetch()
except ConnectionError as e:
    # 重试耗尽后抛原始 ConnectionError
    print(f"最终失败: {e}")
\`\`\`

### 八、业务场景

- **HTTP 请求**：重试 5xx、超时、连接错误
- **数据库操作**：死锁、连接断开重试
- **消息队列**：消费失败重试，配合死信队列
- **外部服务集成**：第三方 API 不稳定时容错
- **资源初始化**：启动时等待依赖就绪（如数据库）

### 九、vs 自定义重试

| 维度 | Tenacity | 自定义 while + try |
|------|----------|-------------------|
| 配置灵活 | stop/wait/retry 组合 | 需手写逻辑 |
| 退避策略 | 内置指数/抖动 | 手写 |
| 可观测性 | before/after 回调 | 手写日志 |
| 异常处理 | 精细控制重试类型 | 容易漏 |
| 代码简洁 | 装饰器一行 | 十几行 |
| 测试性 | 易 mock | 难 |
| 适合 | 生产级 | 简单场景 |

### 十、避坑提示

1. **不要重试不可恢复错误**：参数错误、权限拒绝（401/403）重试无用
2. **重试不是幂等性保证**：POST 请求重试可能重复创建，需配合幂等键
3. **重试 + 超时叠加**：每次重试 30s 超时 × 3 次 = 90s，可能拖垮调用方
4. **死循环风险**：不设 \`stop\` 会无限重试，务必设置上限
5. **重试风暴**：服务恢复时所有客户端同时重试，用抖动分散

### 十一、原理深入

Tenacity 的核心是"重试策略对象"的组合：

1. **Retrying 对象**：装饰器内部创建，封装 stop/wait/retry 策略
2. **RetryCallState**：每次调用维护状态（attempt_number、outcome、next_action）
3. **策略协议**：stop/wait/retry 都是可调用对象，接收 RetryCallState 返回决策
4. **装饰器机制**：包装原函数，捕获异常后询问 retry 策略，决定是否继续

调用流程：
\`\`\`
调用 fn() -> 异常 -> 询问 retry_if_exception_type -> 是
          -> 询问 stop_after_attempt -> 否（未达上限）
          -> 询问 wait_exponential -> sleep(2s)
          -> 再次调用 fn() -> ... 循环
          -> stop 触发 -> reraise 抛出原始异常
\`\`\`

策略可组合（\`|\` 表示任一满足即停止，\`+\` 表示等待时间相加），体现了"组合优于继承"的设计。

### 十二、最佳实践

- 重试必须设 \`stop\` 上限，避免无限循环
- 用 \`wait_exponential + wait_random\` 退避 + 抖动，防止重试风暴
- 明确 \`retry_if_exception_type\`，只重试可恢复错误
- 非幂等操作（POST）配合幂等键，避免重复副作用
- 用 \`before\` 回调记录重试日志，便于排查
- 配合熔断器（circuit breaker），防止持续重试拖垮系统
- 重试耗尽用 \`reraise=True\` 抛原始异常，便于上层处理`,
    code: `# Tenacity 概念演示：用 while + try 模拟重试库核心能力
# 不依赖 tenacity，演示 stop/wait/retry/reraise 概念

import time
import random
from functools import wraps

print("=== Tenacity 重试库概念演示 ===\\n")

# --- 1. 模拟 stop 策略 ---
print("--- 1. stop 停止策略 ---")

def stop_after_attempt(max_attempts):
    """模拟 stop_after_attempt"""
    def stop(retry_state):
        return retry_state["attempt"] >= max_attempts
    return stop

def stop_after_delay(max_seconds):
    """模拟 stop_after_delay"""
    def stop(retry_state):
        return retry_state["elapsed"] >= max_seconds
    return stop

# --- 2. 模拟 wait 策略 ---
print("--- 2. wait 等待策略 ---")

def wait_fixed(seconds):
    """模拟 wait_fixed"""
    def wait(retry_state):
        return seconds
    return wait

def wait_exponential(multiplier=1, max=60):
    """模拟 wait_exponential"""
    def wait(retry_state):
        delay = multiplier * (2 ** (retry_state["attempt"] - 1))
        return min(delay, max)
    return wait

def wait_random(min_sec, max_sec):
    """模拟 wait_random"""
    def wait(retry_state):
        return random.uniform(min_sec, max_sec)
    return wait

# 演示等待时间
print("  指数退避等待时间序列:")
for attempt in range(1, 6):
    state = {"attempt": attempt, "elapsed": 0}
    delay = wait_exponential(multiplier=1, max=60)(state)
    print(f"    第 {attempt} 次重试等待: {delay}s")

# --- 3. 模拟 retry 策略 ---
print("\\n--- 3. retry 重试条件 ---")

def retry_if_exception_type(exception_types):
    """模拟 retry_if_exception_type"""
    def retry(retry_state):
        exc = retry_state.get("exception")
        if exc is None:
            return False
        return isinstance(exc, exception_types)
    return retry

def retry_if_result(predicate):
    """模拟 retry_if_result"""
    def retry(retry_state):
        result = retry_state.get("result")
        if result is None:
            return False
        return predicate(result)
    return retry

# --- 4. 模拟 @retry 装饰器 ---
print("\\n--- 4. @retry 装饰器实现 ---")

def retry(stop=stop_after_attempt(10), wait=wait_fixed(0),
          retry=retry_if_exception_type(Exception), reraise=False,
          before=None, after=None):
    """模拟 tenacity.retry 装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retry_state = {"attempt": 0, "elapsed": 0, "exception": None, "result": None}
            start_time = time.time()
            while True:
                retry_state["attempt"] += 1
                retry_state["elapsed"] = time.time() - start_time
                if before:
                    before(retry_state)
                try:
                    result = func(*args, **kwargs)
                    retry_state["result"] = result
                    retry_state["exception"] = None
                    if not retry(retry_state):
                        if after:
                            after(retry_state)
                        return result
                except Exception as e:
                    retry_state["exception"] = e
                    retry_state["result"] = None
                    if not retry(retry_state):
                        if after:
                            after(retry_state)
                        raise
                if stop(retry_state):
                    if after:
                        after(retry_state)
                    if reraise and retry_state["exception"]:
                        raise retry_state["exception"]
                    raise RetryError(f"重试 {retry_state['attempt']} 次后仍失败", retry_state["exception"])
                delay = wait(retry_state)
                time.sleep(delay)
        return wrapper
    return decorator

class RetryError(Exception):
    def __init__(self, msg, cause):
        super().__init__(msg)
        self.__cause__ = cause

# --- 5. 演示：模拟不稳定的服务调用 ---
print("\\n--- 5. 模拟不稳定服务调用 ---")

call_count = 0

@retry(stop=stop_after_attempt(5), wait=wait_fixed(0.01),
       retry=retry_if_exception_type(ConnectionError), reraise=True,
       before=lambda s: print(f"    [before] 第 {s['attempt']} 次尝试"))
def fetch_data():
    global call_count
    call_count += 1
    if call_count < 3:
        raise ConnectionError(f"连接失败 (第 {call_count} 次)")
    return f"成功获取数据 (第 {call_count} 次调用)"

result = fetch_data()
print(f"  最终结果: {result}")

# --- 6. 演示：重试耗尽抛异常 ---
print("\\n--- 6. 重试耗尽 ---")

call_count2 = 0

@retry(stop=stop_after_attempt(3), wait=wait_fixed(0.01),
       retry=retry_if_exception_type(ConnectionError), reraise=True)
def always_fail():
    global call_count2
    call_count2 += 1
    raise ConnectionError(f"总是失败 (第 {call_count2} 次)")

try:
    always_fail()
except ConnectionError as e:
    print(f"  重试耗尽，抛原始异常: {e}")
    print(f"  总调用次数: {call_count2}")

# --- 7. 演示：不重试不可恢复错误 ---
print("\\n--- 7. 不重试不可恢复错误 ---")

call_count3 = 0

@retry(stop=stop_after_attempt(5), wait=wait_fixed(0.01),
       retry=retry_if_exception_type(ConnectionError))  # 只重试 ConnectionError
def raise_value_error():
    global call_count3
    call_count3 += 1
    raise ValueError("参数错误（不可恢复）")

try:
    raise_value_error()
except ValueError as e:
    print(f"  ValueError 不重试，直接抛出: {e}")
    print(f"  总调用次数: {call_count3} (应=1)")

# --- 8. 演示：retry_if_result ---
print("\\n--- 8. retry_if_result 按返回值重试 ---")

call_count4 = 0

@retry(stop=stop_after_attempt(5), wait=wait_fixed(0.01),
       retry=retry_if_result(lambda x: x is None))
def get_resource():
    global call_count4
    call_count4 += 1
    if call_count4 < 3:
        return None  # 模拟资源未就绪
    return "resource-ready"

result = get_resource()
print(f"  结果: {result} (调用 {call_count4} 次)")

# --- 9. 指数退避 + 抖动 ---
print("\\n--- 9. 指数退避 + 抖动 ---")
print("  退避序列（前 6 次）:")
for attempt in range(1, 7):
    state = {"attempt": attempt, "elapsed": 0}
    base = wait_exponential(multiplier=1, max=60)(state)
    jitter = wait_random(0, 1)(state)
    total = base + jitter
    print(f"    第 {attempt} 次: base={base:.0f}s, jitter={jitter:.2f}s, total={total:.2f}s")

# --- 10. vs 自定义重试 ---
print("\\n--- 10. vs 自定义重试 ---")
comparison = [
    ("配置灵活", "stop/wait/retry 组合", "需手写逻辑"),
    ("退避策略", "内置指数/抖动", "手写"),
    ("可观测性", "before/after 回调", "手写日志"),
    ("异常处理", "精细控制", "容易漏"),
    ("代码简洁", "装饰器一行", "十几行"),
    ("测试性", "易 mock", "难"),
]
print(f"  {'维度':<12} {'Tenacity':<22} {'自定义'}")
for row in comparison:
    print(f"  {row[0]:<12} {row[1]:<22} {row[2]}")

# --- 11. 最佳实践 ---
print("\\n--- 11. 最佳实践 ---")
practices = [
    "重试必须设 stop 上限，避免无限循环",
    "用 wait_exponential + wait_random 退避+抖动",
    "明确 retry_if_exception_type，只重试可恢复错误",
    "非幂等操作配合幂等键，避免重复副作用",
    "用 before 回调记录重试日志",
    "配合熔断器，防止持续重试拖垮系统",
    "重试耗尽用 reraise=True 抛原始异常",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== Tenacity 演示结束 ===")`
  },
  {
    id: "py6-pydantic-settings",
    group: "现代库与框架",
    icon: "⚙️",
    title: "Pydantic Settings 配置管理",
    content: `## Pydantic Settings 配置管理：12-Factor 应用的配置方案

### 一、配置管理的挑战

应用的配置来源多样：环境变量、.env 文件、命令行参数、配置中心。手动管理这些来源容易出错：

- 类型转换缺失（环境变量都是字符串）
- 默认值散落各处
- 配置项无文档
- 敏感信息（密码、密钥）硬编码

**12-Factor App** 原则提倡"配置存储在环境中"。Pydantic Settings 把环境变量加载为强类型对象，解决上述问题。

### 二、BaseSettings 基础

\`\`\`python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "MyApp"
    debug: bool = False
    database_url: str
    port: int = 8000
    max_connections: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

# 自动从环境变量和 .env 加载
settings = Settings()
print(settings.database_url)  # 从 APP_DATABASE_URL 读取
\`\`\`

\`BaseSettings\` 继承自 \`BaseModel\`，自动从环境变量加载值。\`env_prefix\` 给所有变量加前缀，避免命名冲突。

### 三、环境变量加载

环境变量名映射规则：
- 字段名大写：\`database_url\` → \`DATABASE_URL\`
- 加前缀：\`env_prefix="APP_"\` → \`APP_DATABASE_URL\`
- 大小写不敏感（默认）：\`app_database_url\` 也能匹配

\`\`\`python
# 环境变量优先级：环境变量 > .env 文件 > 默认值
import os
os.environ["APP_DATABASE_URL"] = "postgresql://localhost/db"

settings = Settings()  # 自动读取
\`\`\`

### 四、.env 文件支持

\`\`\`bash
# .env 文件
APP_NAME=ProductionApp
APP_DEBUG=false
APP_DATABASE_URL=postgresql://user:pass@db:5432/prod
APP_PORT=5432
\`\`\`

\`\`\`python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
\`\`\`

.env 文件不提交到版本控制（加入 .gitignore），生产用真实环境变量覆盖。

### 五、嵌套配置

复杂配置需要嵌套结构：

\`\`\`python
from pydantic_settings import BaseSettings

class DatabaseConfig(BaseModel):
    url: str
    pool_size: int = 10
    timeout: int = 30

class RedisConfig(BaseModel):
    url: str = "redis://localhost"
    db: int = 0

class Settings(BaseSettings):
    database: DatabaseConfig
    redis: RedisConfig = RedisConfig(url="redis://localhost")
    model_config = SettingsConfigDict(env_nested_delimiter="__")

# 环境变量：APP_DATABASE__URL, APP_DATABASE__POOL_SIZE
\`\`\`

\`env_nested_delimiter="__"\` 让 \`DATABASE__URL\` 映射到 \`database.url\`。

### 六、字段类型与验证

\`\`\`python
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    port: int = Field(ge=1, le=65535)
    allowed_origins: list[str] = Field(default_factory=list)
    secret_key: str = Field(min_length=32)

    @field_validator("allowed_origins")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
\`\`\`

环境变量 \`ALLOWED_ORIGINS="a.com,b.com"\` 会被 validator 解析为列表。

### 七、业务场景

- **Web 应用配置**：FastAPI 启动时加载 Settings，依赖注入到路由
- **微服务配置**：每个服务独立 Settings，从 K8s ConfigMap/Secret 注入
- **多环境管理**：dev/staging/prod 用不同 .env 文件
- **数据库连接**：URL、连接池、超时统一管理
- **第三方凭证**：API key、OAuth secret 安全加载

### 八、vs python-decouple / dynaconf

| 维度 | Pydantic Settings | python-decouple | dynaconf |
|------|-------------------|-----------------|----------|
| 类型验证 | ✅ 强类型 | ❌ 手动转换 | ✅ 部分 |
| .env 支持 | ✅ | ✅ | ✅ |
| 嵌套配置 | ✅ | ❌ | ✅ |
| 多环境 | ✅ env_file | ❌ | ✅ 强 |
| 生态 | Pydantic 系 | 独立 | 独立 |
| 学习曲线 | 低 | 极低 | 中 |
| 适合 | FastAPI/现代 | 简单项目 | 复杂多环境 |

### 九、避坑提示

1. **敏感信息不入库**：.env 文件加入 .gitignore，生产用 Secret Manager
2. **环境变量覆盖 .env**：环境变量优先级更高，CI/CD 中用环境变量覆盖
3. **类型转换陷阱**：\`debug: bool\` 会把 \`"false"\` 字符串转为 \`False\`，但 \`"False"\`（大写）需注意
4. **必填字段缺失**：未提供必填配置会启动失败，错误信息要清晰
5. **热更新**：Settings 实例化后不会自动刷新，需重新创建实例

### 十、原理深入

\`BaseSettings\` 的加载流程：
1. **收集字段**：扫描类的类型注解，确定配置项
2. **多源加载**：按优先级从环境变量、.env 文件、默认值读取
3. **名称映射**：字段名 → 环境变量名（大写、加前缀、嵌套分隔符）
4. **类型转换**：调用 Pydantic 验证器转换字符串为目标类型
5. **校验**：运行 field_validator 和 model_validator

\`SettingsConfigDict\` 控制加载行为：\`env_file\`、\`env_prefix\`、\`env_nested_delimiter\`、\`case_sensitive\` 等。

### 十一、最佳实践

- 用 \`env_prefix\` 避免环境变量命名冲突
- 嵌套配置用 \`env_nested_delimiter="__"\`
- 敏感字段加 \`Field(min_length=...) 约束，启动时校验
- 配合 FastAPI 依赖注入：\`def get_settings() -> Settings\`
- 多环境用多个 .env 文件：\`.env.dev\` / \`.env.prod\`
- 文档化配置项：每个字段加注释说明用途
- 单例模式：Settings 只实例化一次，全局共享`,
    code: `# Pydantic Settings 概念演示：用 os.environ + dataclass 模拟配置管理
# 不依赖 pydantic-settings，演示环境变量加载/.env/嵌套配置/类型转换

import os
from dataclasses import dataclass, field, fields
from typing import Any

print("=== Pydantic Settings 配置管理概念演示 ===\\n")

# --- 1. 模拟 BaseSettings ---
print("--- 1. BaseSettings 基础（环境变量加载） ---")

# 模拟环境变量
os.environ["APP_DATABASE_URL"] = "postgresql://localhost/db"
os.environ["APP_PORT"] = "8000"
os.environ["APP_DEBUG"] = "false"

class BaseSettingsSim:
    """模拟 pydantic_settings.BaseSettings"""
    _env_prefix = "APP_"
    _env_file = None

    @classmethod
    def _get_env_name(cls, field_name):
        return cls._env_prefix + field_name.upper()

    @classmethod
    def load(cls):
        """从环境变量加载配置"""
        kwargs = {}
        for f in fields(cls):
            env_name = cls._get_env_name(f.name)
            if env_name in os.environ:
                raw = os.environ[env_name]
                kwargs[f.name] = cls._convert(raw, f.type)
            elif hasattr(cls, f.name):
                kwargs[f.name] = getattr(cls, f.name)
            else:
                raise ValueError(f"缺少必填配置: {env_name}")
        return cls(**kwargs)

    @staticmethod
    def _convert(raw, typ):
        """模拟 Pydantic 的类型转换"""
        if typ is int or typ == "int":
            return int(raw)
        elif typ is bool or typ == "bool":
            return raw.lower() in ("true", "1", "yes")
        elif typ is float or typ == "float":
            return float(raw)
        return raw

@dataclass
class Settings(BaseSettingsSim):
    app_name: str = "MyApp"
    debug: bool = False
    database_url: str = None
    port: int = 8000
    max_connections: int = 10

settings = Settings.load()
print(f"  app_name: {settings.app_name}")
print(f"  database_url: {settings.database_url}")
print(f"  port: {settings.port} (类型 {type(settings.port).__name__})")
print(f"  debug: {settings.debug} (字符串 'false' 转为 bool)")

# --- 2. .env 文件解析 ---
print("\\n--- 2. .env 文件解析 ---")

def parse_env_file(path):
    """模拟 .env 文件解析"""
    result = {}
    content = """APP_NAME=EnvApp
APP_DEBUG=true
APP_DATABASE_URL=mysql://localhost/envdb
APP_PORT=3306"""
    for line in content.strip().split("\\n"):
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            result[key.strip()] = value.strip()
    return result

env_vars = parse_env_file(".env")
print(f"  解析 .env 文件: {env_vars}")

# --- 3. 嵌套配置 ---
print("\\n--- 3. 嵌套配置 ---")

@dataclass
class DatabaseConfig:
    url: str = ""
    pool_size: int = 10
    timeout: int = 30

@dataclass
class RedisConfig:
    url: str = "redis://localhost"
    db: int = 0

@dataclass
class NestedSettings(BaseSettingsSim):
    _env_prefix = "APP_"
    _env_nested_delimiter = "__"

    @classmethod
    def _get_env_name(cls, field_name):
        # 支持嵌套：DATABASE__URL -> database.url
        if "__" in field_name:
            return cls._env_prefix + field_name.upper()
        return cls._env_prefix + field_name.upper()

# 模拟嵌套环境变量
os.environ["APP_DATABASE__URL"] = "postgresql://nested/db"
os.environ["APP_DATABASE__POOL_SIZE"] = "20"
os.environ["APP_REDIS__URL"] = "redis://nested-redis"

# 手动解析嵌套
def load_nested_settings(env_prefix="APP_", delimiter="__"):
    db_url = os.environ.get(f"{env_prefix}DATABASE__URL", "")
    db_pool = int(os.environ.get(f"{env_prefix}DATABASE__POOL_SIZE", "10"))
    redis_url = os.environ.get(f"{env_prefix}REDIS__URL", "redis://localhost")
    return {
        "database": DatabaseConfig(url=db_url, pool_size=db_pool),
        "redis": RedisConfig(url=redis_url),
    }

config = load_nested_settings()
print(f"  database: {config['database']}")
print(f"  redis: {config['redis']}")

# --- 4. 类型转换 ---
print("\\n--- 4. 类型转换演示 ---")

conversions = [
    ("8000", int, 8000),
    ("3.14", float, 3.14),
    ("true", bool, True),
    ("false", bool, False),
    ("1", bool, True),
    ("0", bool, False),
    ("hello", str, "hello"),
]
print(f"  {'原始值':<10} {'目标类型':<8} {'转换结果'}")
for raw, typ, expected in conversions:
    result = BaseSettingsSim._convert(raw, typ)
    print(f"  {raw:<10} {typ.__name__:8} {result!r} (期望 {expected!r})")

# --- 5. 字段验证 ---
print("\\n--- 5. 字段约束验证 ---")

def validate_port(value):
    if not (1 <= value <= 65535):
        raise ValueError(f"port 需在 1-65535 之间，当前 {value}")
    return value

def validate_secret_key(value):
    if len(value) < 32:
        raise ValueError(f"secret_key 至少 32 字符，当前 {len(value)}")
    return value

for port in [80, 0, 70000]:
    try:
        validate_port(port)
        print(f"  port={port} 通过")
    except ValueError as e:
        print(f"  port={port} 失败: {e}")

for key in ["a" * 32, "short"]:
    try:
        validate_secret_key(key)
        print(f"  secret_key(len={len(key)}) 通过")
    except ValueError as e:
        print(f"  secret_key(len={len(key)}) 失败: {e}")

# --- 6. 多环境配置 ---
print("\\n--- 6. 多环境配置 ---")

envs = {
    "dev": {"APP_DEBUG": "true", "APP_PORT": "8000"},
    "staging": {"APP_DEBUG": "false", "APP_PORT": "8080"},
    "prod": {"APP_DEBUG": "false", "APP_PORT": "80"},
}
for env_name, env_vars in envs.items():
    print(f"  {env_name}: {env_vars}")

# --- 7. vs python-decouple / dynaconf ---
print("\\n--- 7. vs python-decouple / dynaconf ---")
comparison = [
    ("类型验证", "✅ 强类型", "❌ 手动", "✅ 部分"),
    (".env 支持", "✅", "✅", "✅"),
    ("嵌套配置", "✅", "❌", "✅"),
    ("多环境", "✅ env_file", "❌", "✅ 强"),
    ("生态", "Pydantic 系", "独立", "独立"),
    ("学习曲线", "低", "极低", "中"),
]
print(f"  {'维度':<10} {'Pydantic Settings':<20} {'decouple':<10} {'dynaconf'}")
for row in comparison:
    print(f"  {row[0]:<10} {row[1]:<20} {row[2]:<10} {row[3]}")

# --- 8. 最佳实践 ---
print("\\n--- 8. 最佳实践 ---")
practices = [
    "用 env_prefix 避免环境变量命名冲突",
    "嵌套配置用 env_nested_delimiter='__'",
    "敏感字段加 Field 约束，启动时校验",
    "配合 FastAPI 依赖注入",
    "多环境用多个 .env 文件",
    ".env 文件加入 .gitignore",
    "Settings 单例模式，全局共享",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== Pydantic Settings 演示结束 ===")`
  },
  {
    id: "py6-httpx",
    group: "现代库与框架",
    icon: "🌐",
    title: "httpx 现代 HTTP 客户端",
    content: `## httpx 现代 HTTP 客户端：同步与异步的统一

### 一、httpx 简介

httpx 是 Python 生态的现代 HTTP 客户端，被誉为"下一代 requests"。它由 encode 团队（FastAPI、uvicorn 同团队）开发，核心特点：

- **同步 + 异步双模式**：同一 API 支持两种调用方式
- **HTTP/2 支持**：原生支持 HTTP/2 多路复用
- **连接池**：Client 对象复用连接，性能更优
- **超时与重试**：细粒度超时控制
- **类型注解**：完整的类型提示，IDE 体验好
- **API 兼容 requests**：迁移成本低

### 二、基本用法

\`\`\`python
import httpx

# 同步请求（类似 requests）
response = httpx.get("https://api.example.com/users")
print(response.status_code)
print(response.json())

# 带参数
response = httpx.get("https://api.example.com/users", params={"page": 1, "limit": 20})

# POST 请求
response = httpx.post("https://api.example.com/users", json={"name": "Alice"})

# 自定义头
response = httpx.get("https://api.example.com/data", headers={"Authorization": "Bearer token"})
\`\`\`

### 三、Client 连接池

每次 \`httpx.get()\` 会创建新连接。用 \`Client\` 复用连接：

\`\`\`python
with httpx.Client(base_url="https://api.example.com", timeout=10) as client:
    # 所有请求共享连接池
    r1 = client.get("/users")
    r2 = client.get("/users/1")
    r3 = client.post("/users", json={"name": "Bob"})
\`\`\`

\`base_url\` 让后续请求用相对路径，\`timeout\` 全局生效。

### 四、异步请求

\`\`\`python
import httpx
import asyncio

async def fetch_all():
    async with httpx.AsyncClient(base_url="https://api.example.com") as client:
        r1 = await client.get("/users")
        r2 = await client.get("/posts")
        # 并发请求
        import asyncio
        results = await asyncio.gather(
            client.get("/users/1"),
            client.get("/users/2"),
            client.get("/users/3"),
        )
        return results

asyncio.run(fetch_all())
\`\`\`

\`AsyncClient\` 与 \`Client\` API 几乎一致，区别是方法需 \`await\`。

### 五、HTTP/2 支持

\`\`\`python
# 安装：pip install httpx[http2]
with httpx.Client(http2=True) as client:
    response = client.get("https://http2.example.com")
\`\`\`

HTTP/2 的优势：多路复用（一个连接多个请求）、头部压缩、服务端推送。适合高并发场景。

### 六、超时与重试

\`\`\`python
# 细粒度超时
timeout = httpx.Timeout(
    connect=5.0,      # 连接超时
    read=30.0,        # 读取超时
    write=5.0,        # 写入超时
    pool=10.0,        # 连接池等待超时
)
with httpx.Client(timeout=timeout) as client:
    response = client.get("https://slow.example.com")

# 重试（需配合 tenacity）
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential())
def fetch_with_retry(url):
    with httpx.Client() as client:
        return client.get(url)
\`\`\`

### 七、Response 对象

\`\`\`python
response = httpx.get("https://api.example.com/data")
response.status_code      # 200
response.headers          # 响应头
response.text             # 文本内容
response.json()           # JSON 解析
response.content          # 二进制内容
response.elapsed          # 耗时 timedelta
response.url              # 最终 URL（重定向后）
response.history          # 重定向历史
\`\`\`

### 八、业务场景

- **API 客户端封装**：封装第三方 API，复用连接池
- **微服务间调用**：服务 A 调用服务 B，用 AsyncClient 异步
- **爬虫**：并发抓取页面，HTTP/2 提升效率
- **Webhook**：发送通知到外部服务
- **API 测试**：测试 FastAPI/Flask 应用（ASGITransport）

### 九、vs requests / aiohttp

| 维度 | httpx | requests | aiohttp |
|------|-------|----------|---------|
| 同步 | ✅ | ✅ | ❌ |
| 异步 | ✅ | ❌ | ✅ |
| HTTP/2 | ✅ | ❌ | ❌ |
| 连接池 | ✅ Client | ✅ Session | ✅ |
| 类型注解 | ✅ | ❌ | 部分 |
| API 风格 | requests 兼容 | 经典 | 独立 |
| 生态 | 新兴 | 成熟 | 成熟 |
| 适合 | 现代项目 | 传统同步 | 纯异步 |

### 十、避坑提示

1. **连接泄漏**：务必用 \`with\` 上下文管理器，否则连接不释放
2. **超时默认值**：httpx 默认 5 秒，比 requests 的无限制更安全但可能意外超时
3. **异步/同步混用**：\`Client\` 和 \`AsyncClient\` 不能混用
4. **HTTP/2 依赖**：需额外安装 \`httpx[http2]\`，否则 \`http2=True\` 报错
5. **重定向**：默认跟随重定向，用 \`follow_redirects=False\` 关闭

### 十一、原理深入

httpx 的架构：
- **传输层**：抽象 \`Transport\` 接口，支持 \`HTTPTransport\`（urllib3）、\`ASGITransport\`（测试用）
- **连接池**：\`PoolManager\` 管理连接，\`Client\` 持有池
- **同步/异步**：核心逻辑共享，通过 \`sync\` / \`async\` 后端切换
- **HTTP/2**：基于 \`h2\` 库，多路复用通过单连接流式发送

\`AsyncClient\` 内部用 \`anyio\`（AnyIO 抽象层），支持 asyncio 和 trio 后端。

### 十二、最佳实践

- 用 \`Client\`/\`AsyncClient\` 复用连接，避免每次创建
- 设置合理超时（connect 5s, read 30s）
- 高并发用 \`AsyncClient\` + \`asyncio.gather\`
- 需要时开启 HTTP/2 提升性能
- 重试用 \`tenacity\`，httpx 不内置重试
- 测试用 \`ASGITransport\` 直接测 ASGI 应用，无需启动服务器
- 长连接场景用 \`keepalive_expiry\` 调整保活`,
    code: `# httpx 概念演示：用 urllib.request 演示 HTTP 客户端核心概念
# 不依赖 httpx，演示同步/异步/连接池/超时/重试概念

import urllib.request
import urllib.error
import json
from io import BytesIO

print("=== httpx 现代 HTTP 客户端概念演示 ===\\n")

# --- 1. 模拟 HTTP 请求 ---
print("--- 1. HTTP 请求基础（用 urllib 模拟） ---")

def http_get(url, params=None, headers=None):
    """模拟 httpx.get"""
    if params:
        query = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{url}?{query}"
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return {
                "status_code": resp.status,
                "headers": dict(resp.headers),
                "text": resp.read().decode("utf-8"),
                "url": resp.url,
            }
    except urllib.error.HTTPError as e:
        return {"status_code": e.code, "text": e.read().decode("utf-8"), "url": url}

# 演示概念（不实际请求）
print("  httpx.get(url) 等价于 urllib.request.urlopen(url)")
print("  httpx.post(url, json=data) 等价于 Request(url, data=json.dumps(data))")
print("  response.json() 等价于 json.loads(response.text)")

# 模拟响应对象
class MockResponse:
    """模拟 httpx.Response"""
    def __init__(self, status_code, json_data, headers=None):
        self.status_code = status_code
        self._json = json_data
        self.text = json.dumps(json_data)
        self.headers = headers or {"content-type": "application/json"}
        self.url = "https://api.example.com/users"

    def json(self):
        return self._json

    @property
    def content(self):
        return self.text.encode("utf-8")

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")

resp = MockResponse(200, {"id": 1, "name": "Alice"})
print(f"  模拟响应: status={resp.status_code}, json={resp.json()}")

# --- 2. Client 连接池概念 ---
print("\\n--- 2. Client 连接池 ---")

class HttpClient:
    """模拟 httpx.Client"""
    def __init__(self, base_url="", timeout=5, max_connections=10):
        self.base_url = base_url
        self.timeout = timeout
        self.max_connections = max_connections
        self._pool = []  # 模拟连接池
        self._active = 0

    def __enter__(self):
        print(f"    [Client] 创建连接池 (max={self.max_connections})")
        return self

    def __exit__(self, *args):
        print(f"    [Client] 关闭连接池，释放 {self._active} 个连接")

    def get(self, path, **kwargs):
        url = self.base_url + path
        print(f"    [GET] {url} (复用连接)")
        return MockResponse(200, {"path": path})

    def post(self, path, json=None, **kwargs):
        url = self.base_url + path
        print(f"    [POST] {url} body={json}")
        return MockResponse(201, {"created": True, "data": json})

with HttpClient(base_url="https://api.example.com", timeout=10) as client:
    r1 = client.get("/users")
    r2 = client.get("/users/1")
    r3 = client.post("/users", json={"name": "Bob"})
    print(f"  结果: {r1.json()}, {r2.json()}, {r3.json()}")

# --- 3. 异步请求概念 ---
print("\\n--- 3. 异步请求概念 ---")

class AsyncHttpClient:
    """模拟 httpx.AsyncClient"""
    def __init__(self, base_url=""):
        self.base_url = base_url

    async def __aenter__(self):
        print(f"    [AsyncClient] 创建异步连接池")
        return self

    async def __aexit__(self, *args):
        print(f"    [AsyncClient] 关闭异步连接池")

    async def get(self, path):
        url = self.base_url + path
        print(f"    [Async GET] {url}")
        return MockResponse(200, {"async": True, "path": path})

import asyncio

async def fetch_concurrent():
    """模拟并发请求"""
    async with AsyncHttpClient(base_url="https://api.example.com") as client:
        # 模拟 asyncio.gather 并发
        print("    并发发起 3 个请求:")
        results = []
        for path in ["/users/1", "/users/2", "/users/3"]:
            r = await client.get(path)
            results.append(r.json())
        return results

# 运行异步函数
results = asyncio.run(fetch_concurrent())
print(f"  并发结果: {results}")

# --- 4. 超时控制 ---
print("\\n--- 4. 超时控制 ---")

class TimeoutConfig:
    """模拟 httpx.Timeout"""
    def __init__(self, connect=5.0, read=30.0, write=5.0, pool=10.0):
        self.connect = connect
        self.read = read
        self.write = write
        self.pool = pool

    def __repr__(self):
        return f"Timeout(connect={self.connect}, read={self.read}, write={self.write}, pool={self.pool})"

timeout = TimeoutConfig(connect=5.0, read=30.0, write=5.0, pool=10.0)
print(f"  超时配置: {timeout}")
print("  各阶段超时含义:")
print("    connect: TCP 连接建立超时")
print("    read: 等待响应数据超时")
print("    write: 发送请求数据超时")
print("    pool: 从连接池获取连接超时")

# --- 5. 重试概念 ---
print("\\n--- 5. 重试配合 ---")

def fetch_with_retry(url, max_retries=3):
    """模拟 tenacity + httpx 重试"""
    for attempt in range(1, max_retries + 1):
        print(f"    第 {attempt} 次请求 {url}")
        # 模拟偶尔失败
        if attempt < 3:
            print(f"    失败，重试...")
            continue
        print(f"    成功")
        return MockResponse(200, {"attempt": attempt})
    raise Exception("重试耗尽")

result = fetch_with_retry("https://api.example.com/data")
print(f"  最终结果: {result.json()}")

# --- 6. HTTP/2 概念 ---
print("\\n--- 6. HTTP/2 多路复用 ---")
print("  HTTP/1.1: 每个请求需独立连接（或 keep-alive 串行）")
print("  HTTP/2: 一个连接可并发多个请求（多路复用）")
print("  httpx 开启: Client(http2=True)，需安装 httpx[http2]")

# 模拟多路复用
print("  模拟一个连接上的 3 个并发流:")
for stream_id in [1, 3, 5]:
    print(f"    stream {stream_id}: 请求 /users/{stream_id}")

# --- 7. vs requests / aiohttp ---
print("\\n--- 7. vs requests / aiohttp ---")
comparison = [
    ("同步", "✅", "✅", "❌"),
    ("异步", "✅", "❌", "✅"),
    ("HTTP/2", "✅", "❌", "❌"),
    ("连接池", "✅ Client", "✅ Session", "✅"),
    ("类型注解", "✅", "❌", "部分"),
    ("API 风格", "requests 兼容", "经典", "独立"),
    ("生态", "新兴", "成熟", "成熟"),
]
print(f"  {'维度':<10} {'httpx':<12} {'requests':<12} {'aiohttp'}")
for row in comparison:
    print(f"  {row[0]:<10} {row[1]:<12} {row[2]:<12} {row[3]}")

# --- 8. 最佳实践 ---
print("\\n--- 8. 最佳实践 ---")
practices = [
    "用 Client/AsyncClient 复用连接，避免每次创建",
    "设置合理超时 (connect 5s, read 30s)",
    "高并发用 AsyncClient + asyncio.gather",
    "需要时开启 HTTP/2 提升性能",
    "重试用 tenacity，httpx 不内置重试",
    "测试用 ASGITransport 直接测 ASGI 应用",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== httpx 演示结束 ===")`
  },
  {
    id: "py6-anyio",
    group: "现代库与框架",
    icon: "🔀",
    title: "AnyIO 异步抽象层",
    content: `## AnyIO 异步抽象层：跨后端的异步编程统一

### 一、为什么需要 AnyIO

Python 异步生态有两大后端：
- **asyncio**：标准库，Python 3.4+ 引入
- **trio**：第三方，提出"结构化并发"理念

两者 API 不兼容，库作者需选择支持哪个。AnyIO 提供统一抽象层，一套代码同时支持 asyncio 和 trio，降低生态碎片化。

AnyIO 的价值：
- **库作者**：写一次，支持两个后端
- **应用开发者**：可切换后端而不改代码
- **结构化并发**：引入 TaskGroup 等理念（asyncio 3.11+ 才原生支持）

### 二、基本使用

\`\`\`python
import anyio

async def main():
    await anyio.sleep(1)
    print("Hello, AnyIO!")

# 默认用 asyncio 后端
anyio.run(main)

# 指定 trio 后端
anyio.run(main, backend="trio")
\`\`\`

\`anyio.run()\` 替代 \`asyncio.run()\`，通过 \`backend\` 参数切换后端。

### 三、异步原语统一接口

AnyIO 提供与后端无关的异步原语：

\`\`\`python
import anyio

async def producer(send_stream):
    for i in range(5):
        await send_stream.send(i)
    await send_stream.aclose()

async def consumer(receive_stream):
    async for item in receive_stream:
        print(f"收到: {item}")

async def main():
    # 内存对象流（类似 asyncio.Queue）
    send, receive = anyio.create_memory_object_stream(10)
    async with anyio.create_task_group() as tg:
        tg.start_soon(producer, send)
        tg.start_soon(consumer, receive)

anyio.run(main)
\`\`\`

常用原语：\`create_task_group\`、\`create_memory_object_stream\`、\`create_event\`、\`create_lock\`、\`create_semaphore\`、\`create_capacity_limiter\`。

### 四、TaskGroup 结构化并发

\`\`\`python
import anyio

async def task(name, delay):
    await anyio.sleep(delay)
    print(f"{name} 完成")

async def main():
    async with anyio.create_task_group() as tg:
        tg.start_soon(task, "A", 1)
        tg.start_soon(task, "B", 2)
        tg.start_soon(task, "C", 0.5)
    print("所有任务完成")  # 退出 with 块时等待所有任务

anyio.run(main)
\`\`\`

TaskGroup 是结构化并发的核心：
- 任务生命周期绑定到 \`with\` 块
- 退出块时自动等待所有任务
- 任一任务异常会取消其他任务

### 五、Cancellation 取消机制

\`\`\`python
import anyio

async def long_task():
    try:
        await anyio.sleep(100)
    except anyio.get_cancelled_exc_class():
        print("任务被取消")
        raise  # 必须重新抛出

async def main():
    with anyio.move_on_after(2):  # 2 秒后取消
        await long_task()
    print("主流程继续")

anyio.run(main)
\`\`\`

\`move_on_after\` 超时后取消内部任务，\`fail_after\` 超时抛出 \`TimeoutError\`。

### 六、同步原语

\`\`\`python
import anyio

async def worker(lock, worker_id):
    async with lock:
        print(f"worker {worker_id} 获得锁")
        await anyio.sleep(0.5)

async def main():
    lock = anyio.Lock()
    async with anyio.create_task_group() as tg:
        for i in range(3):
            tg.start_soon(worker, lock, i)

anyio.run(main)
\`\`\`

AnyIO 的 \`Lock\`、\`Semaphore\`、\`Event\`、\`Condition\` API 与 asyncio 类似但后端无关。

### 七、I/O 抽象

\`\`\`python
import anyio

async def read_file(path):
    async with await anyio.open_file(path) as f:
        content = await f.read()
    return content

# 网络
async def fetch(host, port):
    stream = await anyio.connect_tcp(host, port)
    await stream.send(b"GET / HTTP/1.0\\r\\n\\r\\n")
    response = await stream.receive()
    await stream.aclose()
\`\`\`

\`anyio.open_file\` 替代 \`aiofiles\`，\`connect_tcp\` 提供跨后端网络 I/O。

### 八、业务场景

- **库开发**：写异步库时用 AnyIO，同时支持 asyncio 和 trio 用户
- **Web 框架**：Starlette、FastAPI 内部用 AnyIO
- **HTTP 客户端**：httpx 的 AsyncClient 基于 AnyIO
- **跨后端应用**：需要 trio 的结构化并发但保持 asyncio 兼容
- **测试**：用 AnyIO 写测试，可在两个后端运行

### 九、vs asyncio / trio

| 维度 | AnyIO | asyncio | trio |
|------|-------|---------|------|
| 后端支持 | asyncio + trio | 仅 asyncio | 仅 trio |
| 结构化并发 | ✅ TaskGroup | ✅ 3.11+ | ✅ 原生 |
| 标准库 | ❌ 第三方 | ✅ | ❌ |
| 生态 | 增长中 | 最大 | 小众 |
| 学习曲线 | 中等 | 平缓 | 中等 |
| 适合 | 库作者/跨后端 | 应用开发 | 研究型项目 |

### 十、避坑提示

1. **取消异常必须重新抛出**：捕获 \`CancelledError\` 后必须 \`raise\`，否则破坏取消机制
2. **不要混用后端原语**：AnyIO 代码中不要直接用 \`asyncio.Lock\`，用 \`anyio.Lock\`
3. **TaskGroup 异常传播**：任一任务异常会取消所有任务并向上传播
4. **move_on_after vs fail_after**：前者超时静默继续，后者抛 TimeoutError
5. **后端差异**：trio 不支持 \`asyncio.Future\`，迁移需注意

### 十一、原理深入

AnyIO 的核心设计是"后端抽象"：

1. **Backend 抽象**：定义异步原语接口，asyncio 和 trio 各有实现
2. **Token 机制**：\`anyio.get_current_runvar_token()\` 跟踪当前后端
3. **取消传播**：基于后端的取消机制（asyncio 用 CancelledError，trio 用 Cancel）
4. **结构化并发**：TaskGroup 通过 \`__aexit__\` 等待所有任务，异常时取消

\`anyio.run()\` 根据后端参数选择 \`asyncio.run\` 或 \`trio.run\`，注入后端实现。

### 十二、最佳实践

- 库作者优先用 AnyIO，应用可用原生 asyncio
- 用 TaskGroup 替代 \`gather\`，获得结构化并发
- 取消异常捕获后必须重新抛出
- 用 \`move_on_after\`/\`fail_after\` 控制超时
- I/O 用 \`anyio.open_file\`/\`connect_tcp\`，保持后端无关
- 测试用 \`anyio.run\` 配合参数化，覆盖两个后端
- 新项目用 Python 3.11+ 可直接用原生 TaskGroup，减少依赖`,
    code: `# AnyIO 概念演示：用 asyncio 演示异步抽象层核心概念
# 不依赖 anyio，演示 TaskGroup/取消/流/同步原语

import asyncio
import sys

print("=== AnyIO 异步抽象层概念演示 ===\\n")

# --- 1. anyio.run 概念 ---
print("--- 1. anyio.run 后端切换 ---")

async def hello():
    await asyncio.sleep(0.01)
    return "Hello from async!"

# 模拟 anyio.run(main, backend="asyncio")
result = asyncio.run(hello())
print(f"  asyncio 后端: {result}")
print("  anyio.run(main, backend='trio') 会切换到 trio 后端")
print("  库代码无需改动，只需切换 backend 参数")

# --- 2. TaskGroup 结构化并发 ---
print("\\n--- 2. TaskGroup 结构化并发 ---")

async def task(name, delay):
    await asyncio.sleep(delay)
    print(f"    任务 {name} 完成 (延迟 {delay}s)")
    return f"{name}_result"

# Python 3.11+ 有原生 TaskGroup
if sys.version_info >= (3, 11):
    async def main_with_tg():
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(task("A", 0.1))
            t2 = tg.create_task(task("B", 0.05))
            t3 = tg.create_task(task("C", 0.15))
        # 退出 with 块时所有任务完成
        print(f"    所有任务完成: {t1.result()}, {t2.result()}, {t3.result()}")
    asyncio.run(main_with_tg())
else:
    # 模拟 TaskGroup
    async def main_simulated_tg():
        results = await asyncio.gather(
            task("A", 0.1),
            task("B", 0.05),
            task("C", 0.15),
        )
        print(f"    所有任务完成: {results}")
    asyncio.run(main_simulated_tg())

print("  TaskGroup 特点: 生命周期绑定 with 块，任一异常取消全部")

# --- 3. 取消机制 ---
print("\\n--- 3. 取消机制 ---")

async def long_task():
    try:
        await asyncio.sleep(100)
    except asyncio.CancelledError:
        print("    任务被取消")
        raise  # 必须重新抛出

async def main_cancel():
    # 模拟 move_on_after
    try:
        await asyncio.wait_for(long_task(), timeout=0.1)
    except asyncio.TimeoutError:
        print("    超时，主流程继续（move_on_after 行为）")

asyncio.run(main_cancel())

# --- 4. fail_after 概念 ---
print("\\n--- 4. fail_after vs move_on_after ---")

async def main_fail_after():
    # fail_after 超时抛 TimeoutError
    try:
        await asyncio.wait_for(asyncio.sleep(100), timeout=0.1)
    except asyncio.TimeoutError as e:
        print(f"    fail_after 抛异常: {type(e).__name__}")

asyncio.run(main_fail_after())
print("  move_on_after: 超时静默继续")
print("  fail_after: 超时抛 TimeoutError")

# --- 5. 内存对象流 ---
print("\\n--- 5. 内存对象流（类似 Queue） ---")

async def producer(queue):
    for i in range(3):
        await queue.put(i)
        print(f"    生产: {i}")
    await queue.put(None)  # 结束信号

async def consumer(queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"    消费: {item}")

async def main_stream():
    queue = asyncio.Queue(10)
    await asyncio.gather(producer(queue), consumer(queue))

asyncio.run(main_stream())
print("  anyio.create_memory_object_stream 提供类似能力，跨后端")

# --- 6. 同步原语 ---
print("\\n--- 6. 同步原语（Lock/Semaphore/Event） ---")

async def worker(lock, wid):
    async with lock:
        print(f"    worker {wid} 获得锁")
        await asyncio.sleep(0.05)
        print(f"    worker {wid} 释放锁")

async def main_lock():
    lock = asyncio.Lock()
    await asyncio.gather(
        worker(lock, 1),
        worker(lock, 2),
        worker(lock, 3),
    )

asyncio.run(main_lock())
print("  anyio.Lock/Semaphore/Event API 类似但跨后端")

# --- 7. 容量限制器 ---
print("\\n--- 7. 容量限制器（CapacityLimiter） ---")

async def limited_task(limiter, tid):
    async with limiter:
        print(f"    任务 {tid} 执行（占用槽位）")
        await asyncio.sleep(0.05)

async def main_limiter():
    # 模拟 CapacityLimiter，限制并发数
    limiter = asyncio.Semaphore(2)
    await asyncio.gather(*[limited_task(limiter, i) for i in range(5)])

asyncio.run(main_limiter())
print("  anyio.create_capacity_limiter 限制并发连接数")

# --- 8. 跨后端价值 ---
print("\\n--- 8. 跨后端价值 ---")
print("  库作者: 写一次，支持 asyncio + trio")
print("  应用: 可切换后端不改代码")
print("  httpx/Starlette/FastAPI 内部用 AnyIO")

# --- 9. vs asyncio / trio ---
print("\\n--- 9. vs asyncio / trio ---")
comparison = [
    ("后端支持", "asyncio + trio", "仅 asyncio", "仅 trio"),
    ("结构化并发", "✅ TaskGroup", "✅ 3.11+", "✅ 原生"),
    ("标准库", "❌ 第三方", "✅", "❌"),
    ("生态", "增长中", "最大", "小众"),
    ("学习曲线", "中等", "平缓", "中等"),
    ("适合", "库作者/跨后端", "应用开发", "研究型"),
]
print(f"  {'维度':<12} {'AnyIO':<16} {'asyncio':<14} {'trio'}")
for row in comparison:
    print(f"  {row[0]:<12} {row[1]:<16} {row[2]:<14} {row[3]}")

# --- 10. 最佳实践 ---
print("\\n--- 10. 最佳实践 ---")
practices = [
    "库作者优先用 AnyIO，应用可用原生 asyncio",
    "用 TaskGroup 替代 gather，获得结构化并发",
    "取消异常捕获后必须重新抛出",
    "用 move_on_after/fail_after 控制超时",
    "I/O 用 anyio.open_file/connect_tcp 保持后端无关",
    "测试覆盖 asyncio 和 trio 两个后端",
]
for i, p in enumerate(practices, 1):
    print(f"  {i}. {p}")

print("\\n=== AnyIO 演示结束 ===")`
  }
];