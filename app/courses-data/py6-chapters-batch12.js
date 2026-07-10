export const chapters = [
  {
    id: "py6-abc",
    group: "面向对象进阶",
    icon: "📐",
    title: "抽象基类 ABC",
    content: `## 抽象基类 ABC（abc 模块 / abstractmethod / register / 接口契约）

### 什么是抽象基类？

抽象基类（Abstract Base Class，简称 ABC）是一种**不能被实例化**的类，它定义了一组**接口契约**（方法签名），子类必须实现这些抽象方法才能被实例化。ABC 是面向对象中"接口"概念在 Python 中的体现，主要用于：

- **定义接口规范**：明确告知调用者"这个类必须有什么方法"
- **强制子类实现**：忘记实现就在实例化时报错，而不是运行时才发现
- **支持虚拟子类**：通过 \`register()\` 让无关类"假装"是子类
- **提供通用 API**：标准库 \`collections.abc\` 大量使用

### 两种定义 ABC 的方式

#### 方式 1：继承 \`abc.ABC\`（推荐，Python 3.4+）

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):
        ...
\`\`\`

#### 方式 2：使用 \`metaclass=ABCMeta\`（老写法）

\`\`\`python
from abc import ABCMeta, abstractmethod

class Animal(metaclass=ABCMeta):
    @abstractmethod
    def speak(self):
        ...
\`\`\`

两种写法效果相同，推荐用继承 \`ABC\` 的方式，更简洁直观。

### @abstractmethod 装饰器

\`@abstractmethod\` 标记一个方法为抽象方法，子类**必须**重写。抽象方法体可以写 \`...\` 或 \`raise NotImplementedError\`，也可以提供默认实现（子类通过 \`super()\` 调用）。

### 抽象方法族（已废弃的简写）

- \`@abstractclassmethod\`：抽象类方法（Python 3.3 引入，**3.4 后已废弃**，改用 \`@classmethod\` + \`@abstractmethod\` 组合）
- \`@abstractstaticmethod\`：抽象静态方法（同样已废弃）
- \`@abstractproperty\`：抽象属性（同样已废弃，改用 \`@property\` + \`@abstractmethod\`）

> 💡 **最佳实践**：永远用 \`@abstractmethod\` 配合普通装饰器，不要用 \`@abstractclassmethod\` 等已废弃写法，避免 3.x 后续版本兼容问题。

### 不能实例化抽象类

\`\`\`python
animal = Animal()  # TypeError: Can't instantiate abstract class Animal with abstract method speak
\`\`\`

### 子类必须实现所有抽象方法

只要有一个抽象方法没实现，子类依然是抽象类，无法实例化。这强制开发者**完整实现接口**。

### 业务场景：插件系统

ABC 是插件系统的基石。框架定义 \`Plugin\` 抽象基类，要求每个插件实现 \`load()\` / \`run()\` / \`unload()\`，第三方按契约写插件，框架不用关心具体实现。

### 业务场景：模板方法模式

ABC 中**普通方法**调用**抽象方法**，子类只重写抽象方法，骨架由父类控制：

\`\`\`python
from abc import abstractmethod
from abc import ABC
class DataPipeline(ABC):
    def run(self):              # 模板方法（普通方法）
        data = self.fetch()
        cleaned = self.clean(data)
        self.save(cleaned)

    @abstractmethod
    def fetch(self): ...
    @abstractmethod
    def clean(self, data): ...
    @abstractmethod
    def save(self, data): ...
\`\`\`

### register() 虚拟子类

\`register()\` 让一个**没有继承关系**的类注册为 ABC 的虚拟子类，主要用于让 \`isinstance\` / \`issubclass\` 通过。这是 Python 独有的"鸭子类型 + 接口"混合机制。

\`\`\`python
class MyList:
    def __len__(self): return 0

# 注册为 Sequence 的虚拟子类（虽然没继承 Sequence）
from collections.abc import Sequence
Sequence.register(MyList)
issubclass(MyList, Sequence)  # True
\`\`\`

### 标准库中的 ABC：collections.abc

\`collections.abc\` 模块提供大量常用 ABC：

| ABC | 必须实现的方法 | 增量方法（自动获得） |
|-----|----------------|----------------------|
| \`Iterable\` | \`__iter__\` | — |
| \`Iterator\` | \`__next__\` + \`__iter__\` | — |
| \`Container\` | \`__contains__\` | — |
| \`Sized\` | \`__len__\` | — |
| \`Sequence\` | \`__getitem__\` + \`__len__\` | \`__contains__\` / \`index\` / \`count\` / \`__reversed__\` |
| \`Mapping\` | \`__getitem__\` + \`__len__\` + \`__iter__\` | \`keys\` / \`values\` / \`items\` / \`get\` |
| \`Set\` / \`MutableSet\` | 抽象集合操作 | \`&\` / \`|\` / \`-\` / \`^\` |

实现 ABC 后，会自动获得 ABC 提供的"mixin 方法"，避免重复造轮子。

### 对比 Java / C++ 的 abstract / interface

| 特性 | Python ABC | Java interface | Java abstract | C++ 纯虚函数 |
|------|-----------|----------------|---------------|---------------|
| 多继承 | 支持 | 类单继承接口多实现 | 单继承 | 支持多继承 |
| 默认实现 | 抽象方法可有默认实现 | interface 有 default 方法 | 普通方法 | 可有实现 |
| 实例化 | 报 TypeError | 编译错 | 编译错 | 编译错/链接错 |
| 强制实现 | 运行时检查 | 编译时检查 | 编译时检查 | 编译时检查 |
| 虚拟子类 | register() 支持 | 不支持 | 不支持 | 不支持 |

> ⚠️ **避坑提示**：
> 1. ABC 的 \`@abstractmethod\` 在**实例化时**才检查，类定义时不报错。如果你写了子类忘记实现方法，到 \`MyClass()\` 那一刻才崩。
> 2. \`register()\` 只让 \`isinstance\` 通过，**不会**让虚拟子类获得 ABC 的 mixin 方法。
> 3. 不要为了"规范"过度使用 ABC。Python 鸭子类型足够灵活，ABC 适合**框架对外的扩展点**和**需要 isinstance 校验的场景**。
> 4. 抽象方法体里不要写 \`pass\`，写 \`...\`（更明确表示"占位"），或写 \`raise NotImplementedError\` 防止子类通过 \`super().method()\` 误调用。

### 最佳实践总结

1. 框架对外暴露扩展点优先用 ABC + \`@abstractmethod\`
2. 用 \`__init_subclass__\` 配合 ABC 做更严格的子类校验（如检查类属性）
3. 抽象方法体写 \`raise NotImplementedError("子类必须实现")\` 而非 \`pass\`
4. 模板方法模式：父类普通方法调度抽象方法，子类只填空
5. 标准库 \`collections.abc\` 优先复用，别自己造轮子
6. ABC 不是越多越好，鸭子类型依然是 Python 的灵魂`,
    code: `from abc import ABC, abstractmethod
from collections.abc import Sequence

print("=== 抽象基类 ABC 演示 ===\\n")

print("--- 1. 基础：定义 ABC 与抽象方法 ---")

class Animal(ABC):
    """动物抽象基类：定义所有动物必须能 speak"""

    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def speak(self) -> str:
        """抽象方法：子类必须实现"""
        raise NotImplementedError("子类必须实现 speak()")

    @abstractmethod
    def legs(self) -> int:
        raise NotImplementedError("子类必须实现 legs()")

    def describe(self):
        """普通方法：复用抽象方法，这是模板方法思想"""
        return f"{self.name} 有 {self.legs()} 条腿，叫声是 '{self.speak()}'"

# 尝试实例化抽象类会报错
try:
    a = Animal("无名")
except TypeError as e:
    print(f"Animal() 实例化失败: {e}")

print("\\n--- 2. 子类必须实现所有抽象方法才能实例化 ---")

class Dog(Animal):
    def speak(self):
        return "汪汪汪"
    def legs(self):
        return 4

class Spider(Animal):
    def speak(self):
        return "..."
    def legs(self):
        return 8

dog = Dog("旺财")
spider = Spider("小蛛")
print(f"狗: {dog.describe()}")
print(f"蜘蛛: {spider.describe()}")

# 只实现部分抽象方法，仍然无法实例化
class BadAnimal(Animal):
    def speak(self):
        return "?"
    # 缺少 legs() 实现

try:
    BadAnimal("坏动物")
except TypeError as e:
    print(f"\\nBadAnimal 缺少 legs() 实现: {e}")

print("\\n--- 3. 模板方法模式：父类骨架调度抽象方法 ---")

class DataPipeline(ABC):
    """数据处理流水线骨架"""
    def run(self, source):
        # 模板方法：固定流程，子类只填空
        print(f"  [Pipeline] 开始处理: {source}")
        raw = self.fetch(source)
        cleaned = self.clean(raw)
        result = self.save(cleaned)
        print(f"  [Pipeline] 完成: {result}")
        return result

    @abstractmethod
    def fetch(self, source): ...
    @abstractmethod
    def clean(self, raw): ...
    @abstractmethod
    def save(self, cleaned): ...

class CsvPipeline(DataPipeline):
    def fetch(self, source):
        print(f"    [Csv] 读取 {source}")
        return ["row1", "row2", "row3"]
    def clean(self, raw):
        print(f"    [Csv] 清洗 {len(raw)} 行")
        return [r.upper() for r in raw]
    def save(self, cleaned):
        print(f"    [Csv] 保存 {len(cleaned)} 行")
        return f"CSV 处理 {len(cleaned)} 行"

CsvPipeline().run("data.csv")

print("\\n--- 4. 虚拟子类 register() ---")

class MyList:
    """自定义列表，没继承 Sequence"""
    def __init__(self, items):
        self._items = list(items)
    def __getitem__(self, index):
        return self._items[index]
    def __len__(self):
        return len(self._items)

# register 让 MyList 成为 Sequence 的"虚拟子类"
Sequence.register(MyList)
ml = MyList([1, 2, 3])
print(f"MyList 注册为 Sequence 后:")
print(f"  isinstance(ml, Sequence) = {isinstance(ml, Sequence)}")
print(f"  issubclass(MyList, Sequence) = {issubclass(MyList, Sequence)}")
print(f"  (注意：register 只让 isinstance 通过，不获得 mixin 方法)")

print("\\n--- 5. collections.abc 复用 ABC ---")
from collections.abc import Mapping

class Config(Mapping):
    """实现 Mapping 三个抽象方法，自动获得 keys/values/items/get 等"""
    def __init__(self, data):
        self._data = dict(data)
    def __getitem__(self, key):
        return self._data[key]
    def __len__(self):
        return len(self._data)
    def __iter__(self):
        return iter(self._data)

cfg = Config({"host": "localhost", "port": 8080, "debug": True})
print(f"Config 实现 Mapping 三个方法后自动获得:")
print(f"  len(cfg) = {len(cfg)}")
print(f"  list(cfg.keys()) = {list(cfg.keys())}")
print(f"  list(cfg.values()) = {list(cfg.values())}")
print(f"  cfg.get('host') = {cfg.get('host')}")
print(f"  'port' in cfg = {'port' in cfg}")

print("\\n--- 6. 抽象属性/类方法/静态方法（推荐组合写法）---")

class Plugin(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """抽象属性：子类必须提供 name 属性"""
        ...

    @classmethod
    @abstractmethod
    def from_config(cls, config: dict):
        """抽象类方法"""
        ...

    @staticmethod
    @abstractmethod
    def version() -> str:
        """抽象静态方法"""
        ...

class MyPlugin(Plugin):
    name = "我的插件"   # 实现抽象属性（类属性形式）
    @classmethod
    def from_config(cls, config):
        return cls()
    @staticmethod
    def version():
        return "1.0.0"

p = MyPlugin()
print(f"插件名: {p.name}")
print(f"版本: {MyPlugin.version()}")
print(f"from_config: {MyPlugin.from_config({}) is not None}")

print("\\n=== ABC 总结 ===")
print("1. ABC 定义接口契约，@abstractmethod 强制子类实现")
print("2. 继承 abc.ABC 即可，不用 metaclass=ABCMeta")
print("3. 抽象方法体写 raise NotImplementedError，不要写 pass")
print("4. 模板方法模式：父类普通方法调度抽象方法")
print("5. register() 让无关类成为虚拟子类（仅 isinstance 通过）")
print("6. collections.abc 提供大量可复用 ABC，实现少量方法获得大量功能")
print("7. 框架扩展点、插件接口、isinstance 校验场景优先用 ABC")
print("8. 业务代码不必处处 ABC，鸭子类型才是 Python 风格")
`,
  },
  {
    id: "py6-enum-advanced",
    group: "面向对象进阶",
    icon: "🏷️",
    title: "枚举类 Enum 详解",
    content: `## 枚举类 Enum 详解（Enum / IntEnum / auto / @unique / Flag / IntFlag）

### 为什么需要枚举？

不用枚举时，状态码通常写成字符串或魔法数字：

\`\`\`python
# ❌ 反例：魔法字符串散落代码各处
if order.status == "paid":
    ...
# 拼写错误 "Paid" 难以发现，重构时改名要全局搜索替换
\`\`\`

枚举类把**有限集合的常量**集中到一个类里，提供：

- **类型安全**：\`Status.PAID\` 比 \`"paid"\` 更难写错
- **命名空间**：所有相关常量放一起，IDE 自动补全
- **不可变**：枚举成员是单例，全局唯一
- **可迭代**：可遍历所有取值
- **可比较**：成员是身份相等，不会出现两个 \`PAID\`

### Enum 基础

\`\`\`python
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3
\`\`\`

- \`Color.RED\`：成员访问
- \`Color["RED"]\`：按名字访问
- \`Color(1)\`：按值访问
- \`Color.RED.value\` → 1
- \`Color.RED.name\` → "RED"

### IntEnum 与 IntStrEnum

\`IntEnum\` 同时是 \`int\` 子类，可以和整数比较、参与运算：

\`\`\`python
from enum import IntEnum
class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

Priority.HIGH > 2  # True，可与 int 比较
\`\`\`

\`IntStrEnum\`（Python 3.11+）既是 int 又是 str，比较少见。

> ⚠️ **避坑**：\`IntEnum\` 破坏了枚举的"封闭性"——\`Priority.LOW == 1 == HttpStatus.OK\` 都为 True，容易混淆。如果不是真的需要和 int 混用，用普通 \`Enum\` 更安全。

### auto() 自动赋值

\`\`\`python
from enum import Enum, auto

class Direction(Enum):
    UP = auto()
    DOWN = auto()
    LEFT = auto()
    RIGHT = auto()
\`\`\`

\`auto()\` 默认从 1 递增。可重写 \`_generate_next_value_\` 自定义规则。

### @unique 唯一性保证

\`\`\`python
from enum import Enum, unique

@unique
class Status(Enum):
    NEW = 1
    PAID = 2
    # SHIPPED = 2  # ValueError: 重复值
\`\`\`

不加 \`@unique\`，相同值会变成别名（\`Status.SHIPPED is Status.PAID\`），这通常是 bug。

### 枚举的迭代、成员访问、按值查找

\`\`\`python
for s in Status:               # 迭代所有成员
    print(s.name, s.value)

Status["PAID"]                 # 按名字（字符串）找
Status(2)                      # 按值找
len(Status)                    # 成员数
\`\`\`

### 自定义 __str__ / __repr__

默认 \`__str__\` 显示 \`Status.PAID\`，可重写为只显示名字或值：

\`\`\`python
from enum import Enum
class Status(Enum):
    NEW = 1
    PAID = 2
    def __str__(self):
        return self.name       # 显示 "PAID" 而非 "Status.PAID"
\`\`\`

### 枚举的相等性：身份相等

枚举成员是**单例**，全程序唯一：

\`\`\`python
a = Status.PAID
b = Status.PAID
a is b          # True，是同一对象
a == b          # True
hash(a) == hash(b)  # True，可做字典 key
\`\`\`

### Flag 和 IntFlag（位运算枚举）

\`Flag\` 用于权限标志，支持 \`&\` \`|\` \`~\` \`^\` 位运算：

\`\`\`python
from enum import Flag, auto

class Permission(Flag):
    READ = auto()      # 1
    WRITE = auto()     # 2
    EXECUTE = auto()   # 4
    ALL = READ | WRITE | EXECUTE  # 7

p = Permission.READ | Permission.WRITE
Permission.READ in p   # True
\`\`\`

\`IntFlag\` 是 \`int + Flag\`，可和整数混用。

### 业务场景

- **状态码**：订单状态、HTTP 状态、任务状态
- **权限标志**：用户权限用 \`Flag\` 位运算组合
- **配置常量**：日志级别、缓存策略、重试策略
- **领域枚举**：性别、币种、语言、星期

### 枚举 vs 字符串常量 vs 字典

| 方案 | 类型安全 | 可迭代 | IDE 补全 | 可比较 | 推荐场景 |
|------|---------|--------|---------|--------|---------|
| 字符串常量 \`"paid"\` | ❌ 易拼错 | ❌ | ❌ | ✅ | 简单脚本、临时用 |
| 模块常量 \`PAID = "paid"\` | ⚠️ 仍可被覆盖 | ❌ | 部分 | ✅ | 小项目 |
| 字典 \`{"PAID": 1}\` | ❌ 可改 | ✅ | ❌ | ❌ | 配置数据 |
| **Enum** | ✅ 单例不可变 | ✅ | ✅ | ✅ | **业务状态首选** |
| IntEnum | ✅ | ✅ | ✅ | ✅ + 可与 int 比 | 与旧 int 系统兼容 |
| Flag | ✅ + 位运算 | ✅ | ✅ | ✅ | 权限/标志位 |

> 💡 **最佳实践**：
> 1. 业务状态码、领域枚举一律用 \`Enum\`，不要用字符串/数字
> 2. 加 \`@unique\` 防止别名 bug
> 3. 值不重要时用 \`auto()\`，重要时显式赋值
> 4. 与 int 混用的旧系统兼容用 \`IntEnum\`，新系统优先纯 \`Enum\`
> 5. 权限位运算用 \`Flag\`，组合权限清晰表达
> 6. 枚举值写到数据库时统一存 \`name\`（字符串）或 \`value\`（int），别混
> 7. API 返回枚举时序列化为 \`name\`（更稳定，重排 value 不会破坏 API）

### 原理深入

枚举类在创建时由 \`EnumMeta\` 元类处理：
1. 把类属性变成 \`EnumMember\` 实例
2. 同名成员变单例，全局唯一
3. 自动建立 \`_value2member_map_\`（按值找）和 \`_member_map_\`（按名找）
4. 禁止实例化（\`__new__\` 后被冻结）

所以枚举成员本质是类级别的单例对象，不是简单常量。`,
    code: `from enum import Enum, IntEnum, Flag, auto, unique

print("=== 枚举类 Enum 详解演示 ===\\n")

print("--- 1. Enum 基础 ---")

class Color(Enum):
    RED = "#FF0000"
    GREEN = "#00FF00"
    BLUE = "#0000FF"

print(f"Color.RED       = {Color.RED}")
print(f"Color.RED.name  = {Color.RED.name}")
print(f"Color.RED.value = {Color.RED.value}")

# 三种访问方式
print(f"\\n三种访问方式:")
print(f"  Color['RED']     = {Color['RED']}   (按名找)")
print(f"  Color('#FF0000') = {Color('#FF0000')} (按值找)")
print(f"  Color.RED        = {Color.RED}    (直接访问)")

print("\\n--- 2. 迭代与成员数 ---")
print("所有成员:")
for c in Color:
    print(f"  {c.name} = {c.value}")
print(f"成员数: len(Color) = {len(Color)}")

print("\\n--- 3. @unique 唯一性保证 ---")

@unique
class OrderStatus(Enum):
    NEW = 1
    PAID = 2
    SHIPPED = 3
    COMPLETED = 4
    CANCELLED = 5

# 故意尝试创建重复值的枚举
try:
    @unique
    class BadStatus(Enum):
        A = 1
        B = 1   # 重复值
except ValueError as e:
    print(f"@unique 拒绝重复值: {e}")

# 不加 @unique 时，重复值会变成别名
class AliasStatus(Enum):
    A = 1
    B = 1   # B 是 A 的别名
print(f"\\n不加@unique，重复值变别名: AliasStatus.B is AliasStatus.A = {AliasStatus.B is AliasStatus.A}")

print("\\n--- 4. auto() 自动赋值 ---")

class Direction(Enum):
    UP = auto()
    DOWN = auto()
    LEFT = auto()
    RIGHT = auto()

print("auto() 自动赋值:")
for d in Direction:
    print(f"  {d.name} = {d.value}")

print("\\n--- 5. IntEnum：可与 int 比较 ---")

class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4

print(f"Priority.HIGH = {Priority.HIGH}")
print(f"Priority.HIGH > 2        = {Priority.HIGH > 2}  (可与 int 比较)")
print(f"Priority.HIGH == 3       = {Priority.HIGH == 3}")
print(f"int(Priority.URGENT)     = {int(Priority.URGENT)} (可转 int)")
print(f"sorted([Priority.HIGH, Priority.LOW, Priority.MEDIUM]) = {sorted([Priority.HIGH, Priority.LOW, Priority.MEDIUM])}")

print("\\n--- 6. 业务场景：订单状态机 ---")

def process_order(status: OrderStatus) -> str:
    """根据订单状态返回下一步操作"""
    # 用枚举做 dispatch，比 if status == "paid" 安全
    actions = {
        OrderStatus.NEW: "等待付款",
        OrderStatus.PAID: "准备发货",
        OrderStatus.SHIPPED: "运输中",
        OrderStatus.COMPLETED: "已完成，可评价",
        OrderStatus.CANCELLED: "已取消",
    }
    return actions[status]

print("订单状态处理:")
for s in OrderStatus:
    print(f"  {s.name:12} → {process_order(s)}")

print("\\n--- 7. Flag 位运算枚举：权限系统 ---")

class Permission(Flag):
    """用户权限标志，支持位运算组合"""
    NONE = 0
    READ = auto()       # 1
    WRITE = auto()      # 2
    DELETE = auto()     # 4
    ADMIN = auto()      # 8
    ALL = READ | WRITE | DELETE | ADMIN  # 15

# 不同角色组合权限
guest = Permission.READ
editor = Permission.READ | Permission.WRITE
manager = Permission.READ | Permission.WRITE | Permission.DELETE
root = Permission.ALL

print("权限分配:")
print(f"  游客    : {guest.value:4d} -> {[p.name for p in guest]}")
print(f"  编辑    : {editor.value:4d} -> {[p.name for p in editor if p.name != 'ALL' and p.name != 'NONE']}")
print(f"  管理员  : {manager.value:4d} -> {[p.name for p in manager if p.name != 'ALL' and p.name != 'NONE']}")
print(f"  超管    : {root.value:4d} -> 所有权限")

# 权限检查
print(f"\\n权限检查:")
print(f"  编辑能写?   {bool(editor & Permission.WRITE)}")
print(f"  编辑能删?   {bool(editor & Permission.DELETE)}")
print(f"  READ in 编辑? {Permission.READ in editor}")

# 权限移除
new_perm = manager & ~Permission.DELETE  # 移除删除权限
print(f"  管理员去掉删除权限后能删? {bool(new_perm & Permission.DELETE)}")

print("\\n--- 8. 自定义 __str__ ---")

class HttpMethod(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"

    def __str__(self):
        # 自定义字符串表示，日志更简洁
        return f"<HTTP {self.value}>"

    def __repr__(self):
        return f"HttpMethod.{self.name}"

print(f"str(HttpMethod.GET)  = {str(HttpMethod.GET)}")
print(f"repr(HttpMethod.GET) = {repr(HttpMethod.GET)}")
print(f"在 f-string 中: {HttpMethod.POST}")

print("\\n--- 9. 枚举成员是单例，可做 dict key ---")
d = {OrderStatus.NEW: "新订单", OrderStatus.PAID: "已付款"}
print(f"dict[OrderStatus.PAID] = {d[OrderStatus.PAID]}")
print(f"OrderStatus.PAID is OrderStatus.PAID = {OrderStatus.PAID is OrderStatus.PAID}")

print("\\n=== 枚举总结 ===")
print("1. 业务状态码、领域枚举一律用 Enum，不要用魔法字符串")
print("2. @unique 防止重复值变别名 bug")
print("3. 值不重要用 auto()，重要时显式赋值")
print("4. IntEnum 与 int 互通，兼容旧系统；新系统用纯 Enum")
print("5. Flag/IntFlag 做权限位运算，组合权限清晰")
print("6. 枚举成员是单例，可哈希，可做 dict key")
print("7. API 序列化优先存 name（字符串）而非 value")
print("8. 枚举值写到数据库要统一存 name 或 value，别混用")
`,
  },
  {
    id: "py6-slots",
    group: "面向对象进阶",
    icon: "🪧",
    title: "__slots__ 内存优化",
    content: `## __slots__ 内存优化（限制属性 / 省内存 / 继承 / 实测对比）

### 默认情况下：对象用 __dict__ 存属性

Python 中普通对象的实例属性存在 \`__dict__\` 里——一个字典：

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(p.__dict__)  # {'x': 1, 'y': 2}
\`\`\`

**字典的代价**：每个字典本身就有显著内存开销（哈希表结构、键值对指针）。一个 \`Point\` 实例光 \`__dict__\` 就要占用 ~100 字节，对于只有两个属性的小对象来说**内存浪费严重**。

### __slots__ 限制属性集合

\`__slots__\` 是类属性，告诉 Python"这个类的实例只能有这些属性"：

\`\`\`python
class Point:
    __slots__ = ('x', 'y')  # 元组或列表都可
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
p.z = 3  # AttributeError: 'Point' object has no attribute 'z'
\`\`\`

启用了 \`__slots__\` 后：

1. **没有 \`__dict__\`**：实例属性用**描述符**（slot descriptor）直接存到固定位置，省去字典
2. **不能动态加属性**：只能用 \`__slots__\` 中列出的名字
3. **省内存**：访问更快（少一次字典查找），内存占用大幅减少

### 内存对比演示

\`\`\`python
import sys

class PointDict:
    def __init__(self, x, y):
        self.x = x; self.y = y

class PointSlots:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x; self.y = y

p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)

print(sys.getsizeof(p1.__dict__))  # ~104 字节（dict 本身）
print(sys.getsizeof(p2))            # ~48 字节（实例本身，无 dict）
\`\`\`

实测单个对象节省约 50%，**百万级对象场景下节省数百 MB**。

### __slots__ 的继承

\`\`\`python
class Base:
    __slots__ = ('a',)

class Child(Base):
    __slots__ = ('b',)
\`\`\`

要点：

- **子类也要定义 \`__slots__\`**，否则子类实例会有 \`__dict__\`，前功尽弃
- 子类的 \`__slots__\` **只列自己新增的**属性，父类的会自动合并
- 多继承时 \`__slots__\` 容易冲突（同名 slot 重复定义会报错），需要小心

### __slots__ 与 __dict__ 共存

如果父类没有 \`__slots__\`，子类即使定义 \`__slots__\` 也会继承 \`__dict__\`：

\`\`\`python
class NoSlots:
    pass   # 默认有 __dict__

class WithSlots(NoSlots):
    __slots__ = ('x',)

o = WithSlots()
o.x = 1
o.y = 2  # 可以！因为有继承自父类的 __dict__
\`\`\`

要享受 \`__slots__\` 的好处，**整个继承链都要有 \`__slots__\`**。

### __slots__ 的限制

| 限制 | 说明 |
|------|------|
| 不能动态加属性 | 只能用 \`__slots__\` 中列出的名字 |
| 影响弱引用 | 默认没有 \`__weakref__\`，需要时加进 \`__slots__\` |
| 影响 pickle | pickle 默认依赖 \`__dict__\`，需要自定义 \`__getstate__\` / \`__setstate__\` |
| 影响多重继承 | 多继承时多个 \`__slots__\` 同名冲突 |
| 难以做 ORM 代理 | Django ORM / SQLAlchemy 用 \`__dict__\` 存字段，冲突时麻烦 |
| 影响类属性 | 同名类属性会覆盖 slot 描述符 |

### 业务场景

- **大量对象**：游戏 NPC、粒子系统、社交图谱节点、爬虫 URL 队列
- **数据容器**：替代 \`namedtuple\` / \`dataclass\` 做高性能数据载体
- **缓存键对象**：高频创建销毁的小对象
- **数值计算**：向量、矩阵元素（百万级时省内存明显）

### 实测：百万对象的内存节省

\`\`\`python
import sys

# 模拟 100 万个点
class P1: pass    # 用 __dict__
class P2:
    __slots__ = ('x', 'y')

# 估算：100 万个 P1 实例 vs P2 实例
# P1: ~150 字节/个 = 150 MB
# P2: ~56 字节/个  = 56 MB
# 节省约 100 MB
\`\`\`

### __slots__ vs dataclass vs namedtuple

| 方案 | 可变 | 类型提示 | 内存 | 可继承 | 可动态加属性 |
|------|------|---------|------|--------|-------------|
| \`class + __dict__\` | ✅ | ✅ | 大 | ✅ | ✅ |
| \`class + __slots__\` | ✅ | ✅ | **小** | ✅（需注意） | ❌ |
| \`@dataclass(slots=True)\`（3.10+） | ✅ | ✅ | 小 | ✅ | ❌ |
| \`namedtuple\` | ❌ | 部分 | 小 | ❌ | ❌ |

> 💡 **最佳实践**：
> 1. **不要在所有类上加 \`__slots__\`**——只在大量实例的类上加
> 2. 普通业务对象、需要 pickle、需要动态加属性的不要用
> 3. Python 3.10+ 用 \`@dataclass(slots=True)\` 一键启用，比手写 \`__slots__\` 更方便
> 4. 继承链必须**全部**有 \`__slots__\`，否则失效
> 5. 需要弱引用时把 \`'__weakref__'\` 加入 \`__slots__\`
> 6. 需要支持 pickle 时实现 \`__getstate__\` / \`__setstate__\`

### 原理深入

\`__slots__\` 的本质：类创建时，Python 为每个 slot 名字生成一个**数据描述符**（\`member_descriptor\`），存到类的 \`__dict__\` 中。访问 \`obj.x\` 时：

1. 查找 \`type(obj).__dict__['x']\`，发现是数据描述符
2. 数据描述符的 \`__get__\` / \`__set__\` 直接读写实例内存中**固定偏移**位置的指针
3. 没有字典查找，没有哈希计算，访问速度更快

数据描述符的优先级高于实例 \`__dict__\`，所以即使父类有 \`__dict__\`，slot 仍然生效。

> ⚠️ **避坑提示**：
> 1. 不要为了"看起来高级"就给所有类加 \`__slots__\`，过早优化是万恶之源
> 2. 实测前不要假设一定省内存——某些场景提升不明显
> 3. \`__slots__ = ()\`（空元组）创建完全无属性的"标记类"，可用于 Mixin
> 4. 子类不能重新定义父类已有的 slot 名字，会报 \`ValueError\`
> 5. 加 \`__slots__\` 后 \`__dict__\` 消失，依赖 \`obj.__dict__\` 的代码会崩`,
    code: `import sys

print("=== __slots__ 内存优化演示 ===\\n")

print("--- 1. 默认对象用 __dict__ 存属性 ---")

class PointDict:
    """普通类，用 __dict__ 存属性"""
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = PointDict(1, 2)
print(f"p1.__dict__ = {p1.__dict__}")
print(f"p1.__dict__ 占用内存: {sys.getsizeof(p1.__dict__)} 字节")
print(f"p1 本身占用: {sys.getsizeof(p1)} 字节")

# 可以动态加属性
p1.z = 3
print(f"动态加 p1.z = 3，现在 __dict__ = {p1.__dict__}")

print("\\n--- 2. __slots__ 限制属性集合 ---")

class PointSlots:
    """使用 __slots__，无 __dict__"""
    __slots__ = ('x', 'y')   # 元组或列表都可
    def __init__(self, x, y):
        self.x = x
        self.y = y

p2 = PointSlots(1, 2)
print(f"p2.x = {p2.x}, p2.y = {p2.y}")
print(f"p2 本身占用: {sys.getsizeof(p2)} 字节")

# 没有 __dict__
print(f"p2 有 __dict__ 吗? {hasattr(p2, '__dict__')}")

# 不能动态加属性
try:
    p2.z = 3
except AttributeError as e:
    print(f"动态加 p2.z 失败: {e}")

print("\\n--- 3. 内存对比：单实例 vs 百万实例 ---")

p_dict = PointDict(1, 2)
p_slot = PointSlots(1, 2)

size_dict = sys.getsizeof(p_dict) + sys.getsizeof(p_dict.__dict__)
size_slot = sys.getsizeof(p_slot)

print(f"PointDict  单实例估算: {size_dict} 字节 (对象 {sys.getsizeof(p_dict)} + dict {sys.getsizeof(p_dict.__dict__)})")
print(f"PointSlots 单实例估算: {size_slot} 字节 (无 __dict__)")
print(f"单实例节省: {size_dict - size_slot} 字节 ({(size_dict - size_slot)/size_dict*100:.1f}%)")

N = 1_000_000
print(f"\\n推算 {N:,} 个实例:")
print(f"  PointDict : {N * size_dict / 1024 / 1024:.1f} MB")
print(f"  PointSlots: {N * size_slot / 1024 / 1024:.1f} MB")
print(f"  节省      : {(N * size_dict - N * size_slot) / 1024 / 1024:.1f} MB")

print("\\n--- 4. __slots__ 的继承 ---")

class Animal:
    __slots__ = ('name',)

class Dog(Animal):
    # 子类只列自己新增的，父类的会自动合并
    __slots__ = ('breed',)

d = Dog()
d.name = "旺财"   # 继承自父类的 slot
d.breed = "金毛"  # 子类自己的 slot
print(f"Dog 实例: name={d.name}, breed={d.breed}")
print(f"Dog 有 __dict__? {hasattr(d, '__dict__')}")

print("\\n--- 5. 父类没 __slots__，子类 __slots__ 失效 ---")

class NoSlots:
    pass   # 默认有 __dict__

class WithSlots(NoSlots):
    __slots__ = ('x',)

o = WithSlots()
o.x = 1
o.y = 2   # 居然可以！因为继承自父类的 __dict__
print(f"父类无 __slots__，子类有 __slots__:")
print(f"  o.x = {o.x}, o.y = {o.y} (y 不在 __slots__ 但能加)")
print(f"  o 有 __dict__? {hasattr(o, '__dict__')}  (slots 失效)")

print("\\n--- 6. __slots__ 限制：弱引用 ---")

class WithSlotsNoWeak:
    __slots__ = ('x',)

import weakref
obj = WithSlotsNoWeak()
try:
    r = weakref.ref(obj)
except TypeError as e:
    print(f"默认 __slots__ 不支持弱引用: {e}")

class WithSlotsAndWeak:
    # 显式加上 __weakref__ 才支持弱引用
    __slots__ = ('x', '__weakref__')

obj2 = WithSlotsAndWeak()
r = weakref.ref(obj2)
print(f"加上 '__weakref__' 后支持弱引用: {r() is obj2}")

print("\\n--- 7. __slots__ 影响 pickle ---")
import pickle

class Point:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
# 默认 pickle 失败：没有 __dict__
try:
    data = pickle.dumps(p)
    print("默认 pickle 成功（新版本可能已支持）")
except (TypeError, pickle.PicklingError) as e:
    print(f"默认 pickle 失败: {e}")

# 实现 __getstate__ / __setstate__ 支持 pickle
class PickleablePoint:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __getstate__(self):
        # 返回可序列化的状态
        return {'x': self.x, 'y': self.y}
    def __setstate__(self, state):
        self.x = state['x']
        self.y = state['y']

pp = PickleablePoint(3, 4)
data = pickle.dumps(pp)
pp2 = pickle.loads(data)
print(f"实现 __getstate__/__setstate__ 后 pickle 成功: {pp2.x}, {pp2.y}")

print("\\n--- 8. dataclass + slots=True（Python 3.10+）---")
try:
    from dataclasses import dataclass

    @dataclass(slots=True)
    class Point3D:
        x: int
        y: int
        z: int

    p3d = Point3D(1, 2, 3)
    print(f"dataclass(slots=True): {p3d}")
    print(f"有 __dict__? {hasattr(p3d, '__dict__')}")
    try:
        p3d.w = 4
    except AttributeError as e:
        print(f"动态加属性失败（slots 生效）: {e}")
except ImportError:
    print("dataclass slots 需要 Python 3.10+")

print("\\n=== __slots__ 总结 ===")
print("1. __slots__ 限制属性集合，去掉 __dict__，省内存")
print("2. 单实例省 ~50%，百万级对象节省上百 MB")
print("3. 整个继承链都要有 __slots__，否则失效")
print("4. 限制：不能动态加属性、影响弱引用/pickle/多继承")
print("5. 只在大量实例的类上用，业务对象不必用")
print("6. Python 3.10+ 用 @dataclass(slots=True) 最方便")
print("7. 需要弱引用把 '__weakref__' 加入 __slots__")
print("8. 不要过度优化，先 profile 找瓶颈再决定")
`,
  },
  {
    id: "py6-mixin",
    group: "面向对象进阶",
    icon: "🧩",
    title: "Mixin 混入模式",
    content: `## Mixin 混入模式（可组合功能 / 多继承 / MRO / DRF Mixin）

### 什么是 Mixin？

Mixin 是一种**小的、单一职责的可组合类**，提供一项独立功能，**不单独使用**，而是和主类通过多继承组合：

\`\`\`python
class JSONMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__)

class User(JSONMixin):  # 组合 JSONMixin，获得 to_json 能力
    pass
\`\`\`

Mixin 的本质：**通过多继承实现功能组合**，避免单一继承链的僵硬。它和"工具函数"的区别是 Mixin 有状态、可重写、可链式组合。

### Mixin 的核心特征

1. **单一职责**：每个 Mixin 只做一件事（如序列化、日志、缓存）
2. **不单独使用**：Mixin 自身实例化没意义
3. **不依赖具体类**：Mixin 调用 \`self.xxx\` 但不假设 \`self\` 是什么
4. **可叠加组合**：多个 Mixin 一起用，互不冲突
5. **优先级清晰**：通过 MRO 决定方法查找顺序

### 经典 Mixin 示例

\`\`\`python
# 1. 序列化 Mixin
class JSONMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__)
    @classmethod
    def from_json(cls, json_str):
        import json
        obj = cls.__new__(cls)
        obj.__dict__.update(json.loads(json_str))
        return obj

# 2. 日志 Mixin
class LogMixin:
    def log(self, msg):
        print(f"[{type(self).__name__}] {msg}")

# 3. 比较 Mixin（实现 __eq__ 和 __lt__ 自动获得其他比较）
class ComparableMixin:
    def __lt__(self, other):
        return self._compare_key() < other._compare_key()
    # 定义 __lt__ 后 functools.total_ordering 可补全其他

# 4. 缓存 Mixin
class CacheMixin:
    _cache = {}
    def get_cached(self, key):
        if key in self._cache:
            return self._cache[key]
        value = self._compute(key)
        self._cache[key] = value
        return value
\`\`\`

### 多继承顺序与 MRO

Python 用 **C3 线性化算法**计算方法解析顺序（MRO）：

\`\`\`python
class A: def f(self): print("A")
class B(A): def f(self): print("B"); super().f()
class C(A): def f(self): print("C"); super().f()
class D(B, C): def f(self): print("D"); super().f()

D().f()
# 输出: D B C A
# MRO: D -> B -> C -> A -> object

print(D.__mro__)
\`\`\`

**写 Mixin 的关键技巧**：用 \`super().method()\` 而非直接调用，让方法沿 MRO 链传递，多个 Mixin 才能协作。

### Mixin vs 装饰器 vs 组合

| 方案 | 优点 | 缺点 | 适用 |
|------|------|------|------|
| **Mixin（多继承）** | 简洁、IDE 友好、可重写 | 多继承复杂、MRO 难调 | 横切关注点 |
| **装饰器** | 灵活、可叠加 | 难共享状态、难继承 | 函数/类增强 |
| **组合（has-a）** | 解耦、运行时可换 | 需写转发方法、啰嗦 | 强依赖、需要切换 |

> 💡 **GoF 原则**："组合优于继承"。但 Mixin 介于两者之间——更轻的继承，适合**横切关注点**（日志、序列化、缓存）。

### Django Rest Framework 的 Mixin 设计

DRF 把视图功能拆成多个 Mixin，按需组合：

\`\`\`python
# DRF 风格
from rest_framework.mixins import (
    ListModelMixin,      # 提供 list()
    CreateModelMixin,    # 提供 create()
    RetrieveModelMixin,  # 提供 retrieve()
    UpdateModelMixin,    # 提供 update()
    DestroyModelMixin,   # 提供 destroy()
)

class UserViewSet(
    ListModelMixin,
    CreateModelMixin,
    GenericViewSet,
):
    # 只组合需要的 Mixin，不写一行代码就有 list/create
    pass
\`\`\`

每个 Mixin 只关心一个动作，组合出 CRUD 视图。这是 Mixin 模式的教科书级应用。

### 业务场景：可组合功能

- **日志**：\`LogMixin\` 给类加日志能力
- **序列化**：\`JSONMixin\` / \`XMLMixin\` / \`YAMLMixin\`
- **缓存**：\`CacheMixin\` 缓存方法结果
- **权限**：\`PermissionMixin\` 校验权限
- **打印**：\`PrintableMixin\` 美化 \`__str__\`
- **审计**：\`TimestampMixin\` 自动维护 created_at/updated_at
- **软删除**：\`SoftDeleteMixin\` 标记删除而非物理删除

### 反模式：过度使用 Mixin

\`\`\`python
# ❌ 反模式：5+ 个 Mixin 叠加
class User(
    LogMixin, CacheMixin, JSONMixin, PermissionMixin,
    SoftDeleteMixin, TimestampMixin, ValidateMixin,
    EventEmitterMixin, SerializableMixin, BaseUser
):
    pass
\`\`\`

问题：

- **MRO 复杂**：方法查找难追踪
- **状态污染**：多个 Mixin 共享 \`self\`，意外覆盖
- **菱形继承**：多个父类有同名方法，行为难以预测
- **调试困难**：bug 出在哪一层 Mixin？

### Mixin 设计原则

1. **小而专一**：一个 Mixin 一个功能
2. **不持有状态**：Mixin 不应该有 \`__init__\`（或只调 \`super().__init__()\`）
3. **用 \`super()\` 协作**：让方法沿 MRO 传递
4. **命名清晰**：\`XxxMixin\` 后缀
5. **不单独实例化**：Mixin 设计上就没意义单独用
6. **避免同名方法**：多个 Mixin 同名方法导致 MRO 陷阱

### 原理深入

Python 的 \`super()\` 不是简单的"父类方法"，而是按 \`__mro__\` 顺序的下一个类。多个 Mixin 都调 \`super().__init__()\` 时，会沿 MRO 链依次调用，最终到达 \`object.__init__\`。

\`\`\`python
class MixinA:
    def __init__(self, **kwargs):
        print("A init")
        super().__init__(**kwargs)   # 不是父类！是 MRO 下一个

class MixinB:
    def __init__(self, **kwargs):
        print("B init")
        super().__init__(**kwargs)

class Base:
    def __init__(self, **kwargs):
        print("Base init")
        super().__init__()   # object.__init__

class Foo(MixinA, MixinB, Base): pass

Foo()  # 输出: A init → B init → Base init
\`\`\`

这种"kwargs 透传 + super() 链"是写 Mixin 的标准范式。

> ⚠️ **避坑提示**：
> 1. Mixin 不要写 \`__init__\` 带必填参数——会破坏其他 Mixin 的 \`super().__init__()\` 链
> 2. Mixin 之间不要相互依赖（除非组成"插件包"）
> 3. 类继承顺序：**Mixin 在前，主类在后**（\`class User(JSONMixin, LogMixin, BaseModel)\`）
> 4. 调试 Mixin 时打印 \`type(self).__mro__\` 看清方法查找顺序
> 5. 不要用 Mixin 替代组合——Mixin 适合横切关注点，不适合核心业务逻辑

### 最佳实践总结

1. Mixin 用于**横切关注点**：日志、序列化、缓存、权限等可叠加功能
2. 一个 Mixin 只做一件事，命名 \`XxxMixin\`
3. Mixin 不写 \`__init__\`，需要时用 \`**kwargs\` 透传给 \`super().__init__()\`
4. 用 \`super().method()\` 让方法沿 MRO 链协作
5. 类继承顺序：\`class User(Mixin1, Mixin2, BaseModel)\`
6. Mixin 数量控制在 3-4 个，超过就用组合重构
7. 参考 DRF 的 Mixin 设计，业界标杆`,
    code: `print("=== Mixin 混入模式演示 ===\\n")

print("--- 1. Mixin 基础：可组合的横切功能 ---")

class JSONMixin:
    """序列化 Mixin：提供 to_json / from_json"""
    def to_json(self):
        import json
        return json.dumps(self.__dict__, ensure_ascii=False)

    @classmethod
    def from_json(cls, json_str):
        import json
        obj = cls.__new__(cls)
        obj.__dict__.update(json.loads(json_str))
        return obj

class LogMixin:
    """日志 Mixin：给类加 log 能力"""
    def log(self, msg, level="INFO"):
        print(f"  [{level}] {type(self).__name__}: {msg}")

class User(JSONMixin, LogMixin):
    """主类组合两个 Mixin"""
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("张三", 25)
u.log("用户创建成功")
print(f"序列化: {u.to_json()}")
u2 = User.from_json('{"name": "李四", "age": 30}')
print(f"反序列化: {u2.name}, {u2.age} 岁")

print("\\n--- 2. 多个 Mixin 协作：super() 链 ---")

class TimestampMixin:
    """时间戳 Mixin"""
    def __init__(self, *args, **kwargs):
        from datetime import datetime
        self.created_at = datetime.now()
        # 关键：调用 super().__init__ 让链继续传递
        super().__init__(*args, **kwargs)

class ValidateMixin:
    """校验 Mixin"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 在 __init__ 之后做校验
        if not self.name:
            raise ValueError("name 不能为空")

class BaseModel:
    """主类基类"""
    def __init__(self, name):
        self.name = name

class Product(TimestampMixin, ValidateMixin, BaseModel):
    """组合多个 Mixin + 基类"""
    pass

p = Product("手机")
print(f"产品名: {p.name}")
print(f"创建时间: {p.created_at}")

try:
    Product("")  # 触发 ValidateMixin 校验
except ValueError as e:
    print(f"校验失败: {e}")

print("\\n--- 3. MRO 方法解析顺序 ---")

class A:
    def hello(self):
        return "A"

class B(A):
    def hello(self):
        return "B -> " + super().hello()

class C(A):
    def hello(self):
        return "C -> " + super().hello()

class D(B, C):
    def hello(self):
        return "D -> " + super().hello()

d = D()
print(f"D().hello() = {d.hello()}")
print(f"D.__mro__:")
for cls in D.__mro__:
    print(f"  {cls.__name__}")

print("\\n--- 4. 经典 Mixin：ComparableMixin ---")
from functools import total_ordering

@total_ordering
class ComparableMixin:
    """只实现 __eq__ 和 __lt__，total_ordering 自动补全 __le__/__gt__/__ge__"""
    def _compare_key(self):
        raise NotImplementedError
    def __eq__(self, other):
        return self._compare_key() == other._compare_key()
    def __lt__(self, other):
        return self._compare_key() < other._compare_key()

class Student(ComparableMixin):
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def _compare_key(self):
        return self.score   # 按 score 比较
    def __repr__(self):
        return f"Student({self.name}, {self.score})"

students = [
    Student("张三", 85),
    Student("李四", 92),
    Student("王五", 78),
]
print("排序前:", students)
print("排序后:", sorted(students))
print(f"max: {max(students)}")
print(f"min: {min(students)}")

print("\\n--- 5. 业务场景：DRF 风格的 Mixin 组合 ---")

# 模拟 Django Rest Framework 的 Mixin 设计
class ListMixin:
    """列表查询 Mixin"""
    def list(self):
        items = self.get_queryset()
        return [self.serialize(item) for item in items]

class CreateMixin:
    """创建 Mixin"""
    def create(self, data):
        item = self.perform_create(data)
        return self.serialize(item)

class RetrieveMixin:
    """详情查询 Mixin"""
    def retrieve(self, pk):
        item = self.get_object(pk)
        return self.serialize(item)

class UserViewSet(ListMixin, CreateMixin, RetrieveMixin):
    """组合 Mixin，得到 list/create/retrieve 三个能力"""
    _data = {1: {"id": 1, "name": "张三"}, 2: {"id": 2, "name": "李四"}}
    _next_id = 3

    def get_queryset(self):
        return list(self._data.values())
    def get_object(self, pk):
        return self._data.get(pk)
    def perform_create(self, data):
        item = {"id": self._next_id, **data}
        self._data[self._next_id] = item
        self._next_id += 1
        return item
    def serialize(self, item):
        return dict(item)

vs = UserViewSet()
print(f"list: {vs.list()}")
print(f"retrieve(1): {vs.retrieve(1)}")
print(f"create: {vs.create({'name': '王五'})}")
print(f"list after create: {vs.list()}")

print("\\n--- 6. 业务场景：缓存 Mixin ---")

class CacheMixin:
    """方法结果缓存 Mixin"""
    _cache = None

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._cache = {}

    def cached(self, key, computer):
        if key not in self._cache:
            self._cache[key] = computer()
        return self._cache[key]

class DataProvider(CacheMixin):
    """带缓存的数据提供者"""
    def get_user(self, user_id):
        return self.cached(f"user:{user_id}", lambda: self._fetch_user(user_id))
    def _fetch_user(self, user_id):
        print(f"    [DB] 查询用户 {user_id}")
        return {"id": user_id, "name": f"用户{user_id}"}

provider = DataProvider()
print(f"第一次 get_user(1): {provider.get_user(1)}")
print(f"第二次 get_user(1): {provider.get_user(1)} (命中缓存)")
print(f"get_user(2): {provider.get_user(2)}")

print("\\n--- 7. 反模式：过度使用 Mixin ---")
print("""
❌ 反例：10 个 Mixin 叠加
class User(
    LogMixin, CacheMixin, JSONMixin, PermissionMixin,
    SoftDeleteMixin, TimestampMixin, ValidateMixin,
    EventEmitterMixin, SerializableMixin, BaseUser
):
    pass

问题：
1. MRO 复杂，方法查找难追踪
2. 多个 Mixin 共享 self，状态污染
3. 菱形继承时行为难以预测
4. 调试时不知道 bug 出在哪一层

正确做法：
- Mixin 数量控制在 3-4 个
- 超过就用组合（has-a）重构
- 横切关注点用 Mixin，核心业务用组合
""")

print("\\n=== Mixin 总结 ===")
print("1. Mixin 是小的可组合类，提供单一功能")
print("2. 用于横切关注点：日志/序列化/缓存/权限/审计")
print("3. 用 super().__init__(**kwargs) 让方法沿 MRO 协作")
print("4. 类继承顺序：Mixin 在前，主类在后")
print("5. 一个 Mixin 只做一件事，不写复杂 __init__")
print("6. Mixin 数量控制 3-4 个，超过就用组合")
print("7. 参考 DRF Mixin 设计，业界标杆")
print("8. Mixin 不是替代组合，是补充——核心业务用组合")
`,
  },
  {
    id: "py6-solid",
    group: "面向对象进阶",
    icon: "🏛️",
    title: "SOLID 设计原则",
    content: `## SOLID 设计原则（SRP / OCP / LSP / ISP / DIP）

### 什么是 SOLID？

SOLID 是面向对象设计的五大基本原则（Robert C. Martin 总结），是写出可维护、可扩展、低耦合代码的指导：

| 字母 | 原则 | 中文 | 一句话总结 |
|------|------|------|----------|
| **S** | Single Responsibility | 单一职责 | 一个类只有一个变化的理由 |
| **O** | Open/Closed | 开闭原则 | 对扩展开放，对修改关闭 |
| **L** | Liskov Substitution | 里氏替换 | 子类能无感替换父类 |
| **I** | Interface Segregation | 接口隔离 | 不要强迫依赖不用的方法 |
| **D** | Dependency Inversion | 依赖倒置 | 依赖抽象，不依赖具体 |

### S - 单一职责原则（SRP）

**定义**：一个类应该只有一个变化的理由。如果一个类承担多个职责，任何一个职责变化都会修改这个类，引发其他职责的 bug。

#### ❌ 反例：一个类干所有事

\`\`\`python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def save_to_db(self): ...      # 职责1：持久化
    def send_email(self): ...      # 职责2：通知
    def validate_email(self): ...  # 职责3：校验
    def to_json(self): ...         # 职责4：序列化
\`\`\`

数据库改、邮件服务改、序列化格式改，都要改 \`User\` 类。

#### ✅ 正例：拆分职责

\`\`\`python
class User: ...                    # 只关心数据
class UserRepository: ...          # 只关心持久化
class EmailService: ...            # 只关心发邮件
class UserSerializer: ...          # 只关心序列化
\`\`\`

### O - 开闭原则（OCP）

**定义**：软件实体应该**对扩展开放，对修改关闭**——加新功能不改老代码。

#### ❌ 反例：每次加类型都改 if-else

\`\`\`python
class PaymentProcessor:
    def pay(self, method, amount):
        if method == "alipay":
            self._pay_alipay(amount)
        elif method == "wechat":
            self._pay_wechat(amount)
        elif method == "card":
            self._pay_card(amount)
        # 加新支付方式要改这里！
\`\`\`

#### ✅ 正例：抽象 + 多态

\`\`\`python
from abc import ABC, abstractmethod

class Payment(ABC):
    @abstractmethod
    def pay(self, amount): ...

class AlipayPayment(Payment):
    def pay(self, amount): ...

class WechatPayment(Payment):
    def pay(self, amount): ...

class PaymentProcessor:
    def __init__(self, payment: Payment):
        self._payment = payment   # 依赖抽象
    def process(self, amount):
        self._payment.pay(amount)
# 加新支付方式：写新类，不改老代码
\`\`\`

### L - 里氏替换原则（LSP）

**定义**：子类对象必须能替换掉所有父类对象，程序行为不变。

#### ❌ 反例：经典 Rectangle / Square

\`\`\`python
class Rectangle:
    def set_width(self, w): self.width = w
    def set_height(self, h): self.height = h
    def area(self): return self.width * self.height

class Square(Rectangle):
    def set_width(self, w):       # 重写破坏父类约定
        self.width = self.height = w
    def set_height(self, h):
        self.width = self.height = h

def use_rect(r: Rectangle):
    r.set_width(5)
    r.set_height(10)
    assert r.area() == 50   # Square 会失败！违反 LSP
\`\`\`

Square 不能无感替换 Rectangle。**修复**：不要让 Square 继承 Rectangle，它们是不同概念，用更抽象的 \`Shape\` 接口。

### I - 接口隔离原则（ISP）

**定义**：客户端不应被迫依赖它不使用的方法——接口要小而专。

#### ❌ 反例：胖接口

\`\`\`python
from abc import abstractmethod
from abc import ABC
class Machine(ABC):
    @abstractmethod
    def print(self): ...
    @abstractmethod
    def scan(self): ...
    @abstractmethod
    def fax(self): ...

class SimplePrinter(Machine):
    def print(self): ...
    def scan(self): raise NotImplementedError  # 被迫实现
    def fax(self): raise NotImplementedError    # 用不到还要实现
\`\`\`

#### ✅ 正例：拆分接口

\`\`\`python
from abc import abstractmethod
from abc import ABC
class Printer(ABC):
    @abstractmethod
    def print(self): ...

class Scanner(ABC):
    @abstractmethod
    def scan(self): ...

class SimplePrinter(Printer):     # 只实现需要的
    def print(self): ...

class MultiFunction(Printer, Scanner, ...):  # 按需组合
    ...
\`\`\`

Python 因为鸭子类型，ISP 不像 Java 那么硬性，但**接口设计仍然要小而专**。

### D - 依赖倒置原则（DIP）

**定义**：
1. 高层模块不应依赖低层模块，二者都应依赖抽象
2. 抽象不应依赖细节，细节应依赖抽象

#### ❌ 反例：高层依赖低层具体类

\`\`\`python
class MySQLDatabase:
    def query(self, sql): ...

class UserService:
    def __init__(self):
        self.db = MySQLDatabase()   # 直接依赖具体类
    def get_user(self, id):
        return self.db.query(f"SELECT * FROM users WHERE id={id}")

# 换 PostgreSQL 要改 UserService
\`\`\`

#### ✅ 正例：依赖抽象

\`\`\`python
from abc import ABC, abstractmethod

class Database(ABC):
    @abstractmethod
    def query(self, sql): ...

class MySQLDatabase(Database): ...
class PostgreSQLDatabase(Database): ...

class UserService:
    def __init__(self, db: Database):   # 依赖抽象
        self.db = db
    def get_user(self, id):
        return self.db.query("...")

# 换数据库：注入不同实现即可，不改 UserService
\`\`\`

这就是**依赖注入（DI）** 的本质。

### 业务场景：电商订单系统

把 SOLID 应用到电商订单系统：**SRP** 让 \`Order\` 只管数据，\`OrderRepository\` 管持久化，\`OrderProcessor\` 管业务流程；**OCP** 加新促销策略 \`PromotionStrategy\` 不改 \`OrderProcessor\`；**LSP** 让 \`DiscountOrder\` 继承 \`Order\` 不破坏 \`total()\`；**ISP** 把 \`Payable\` / \`Shippable\` / \`Refundable\` 分离，虚拟订单不必实现 \`Payable\`；**DIP** 让 \`OrderProcessor\` 依赖 \`PaymentGateway\` 抽象，可注入 Stripe / PayPal / 支付宝。

### SOLID vs 过度设计

判断标准：**业务复杂度匹配**（简单 CRUD 不需要 SOLID 全套）、**变化方向明确**（知道哪里会变才抽象）、**YAGNI 原则**（用不到的接口别提前造）、**三次法则**（第三次重复时再抽象）。

> ⚠️ **避坑提示**：
> 1. 不要为了 SOLID 而 SOLID，简单业务过度设计比代码烂还糟糕
> 2. 抽象要基于**真实需求**而非想象，否则维护成本更高
> 3. 接口设计要小，但不要碎（一个接口一个方法也是过度）
> 4. LSP 违反常出现在子类"加强约束"或"减弱约束"时，留心
> 5. DI 框架能帮管理复杂依赖，但小项目不必上

### 最佳实践总结

1. **SRP**：一个类一个变化的理由，职责清晰
2. **OCP**：用抽象 + 多态扩展，少用 if-else 分支
3. **LSP**：子类不破坏父类契约，行为兼容
4. **ISP**：接口小而专，不强迫实现用不到的方法
5. **DIP**：依赖抽象（ABC / Protocol），用依赖注入
6. 实战：先写代码再重构到 SOLID，不要一上来就抽象
7. YAGNI + 三次法则：第三次重复才抽象`,
    code: `from abc import ABC, abstractmethod

print("=== SOLID 设计原则演示 ===\\n")

print("--- S - 单一职责原则（SRP）---")
print("一个类只有一个变化的理由\\n")

# ❌ 反例：一个类干所有事
class BadUser:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    def save_to_db(self): print(f"  保存 {self.name} 到数据库")
    def send_email(self): print(f"  发邮件到 {self.email}")
    def to_json(self): return f'{{"name":"{self.name}"}}'

print("反例 BadUser 类干了：持久化+通知+序列化 三件事")
print("  数据库改、邮件服务改、JSON 改都要修改 BadUser")

# ✅ 正例：拆分职责
class User:
    """只关心用户数据"""
    def __init__(self, name, email):
        self.name = name
        self.email = email

class UserRepository:
    """只关心持久化"""
    def save(self, user):
        print(f"  [Repo] 保存用户 {user.name}")

class EmailService:
    """只关心发邮件"""
    def send(self, user, content):
        print(f"  [Email] 发送邮件到 {user.email}: {content}")

class UserSerializer:
    """只关心序列化"""
    def to_json(self, user):
        return f'{{"name":"{user.name}", "email":"{user.email}"}}'

print("\\n正例：职责拆分到独立类")
u = User("张三", "z****@example.com")
UserRepository().save(u)
EmailService().send(u, "欢迎注册")
print(f"  序列化: {UserSerializer().to_json(u)}")

print("\\n--- O - 开闭原则（OCP）---")
print("对扩展开放，对修改关闭\\n")

# ❌ 反例：if-else 分支
class BadPaymentProcessor:
    def pay(self, method, amount):
        if method == "alipay":
            print(f"  支付宝支付 {amount} 元")
        elif method == "wechat":
            print(f"  微信支付 {amount} 元")
        # 加新支付方式必须改这个方法

# ✅ 正例：抽象 + 多态
class Payment(ABC):
    @abstractmethod
    def pay(self, amount: float): ...

class AlipayPayment(Payment):
    def pay(self, amount):
        print(f"  [支付宝] 支付 {amount} 元")

class WechatPayment(Payment):
    def pay(self, amount):
        print(f"  [微信] 支付 {amount} 元")

class CardPayment(Payment):  # 新增支付方式：不改老代码
    def pay(self, amount):
        print(f"  [银行卡] 支付 {amount} 元")

class PaymentProcessor:
    def __init__(self, payment: Payment):
        self._payment = payment
    def process(self, amount):
        self._payment.pay(amount)

print("正例：新支付方式只加新类，不改老代码")
PaymentProcessor(AlipayPayment()).process(100)
PaymentProcessor(WechatPayment()).process(50)
PaymentProcessor(CardPayment()).process(200)

print("\\n--- L - 里氏替换原则（LSP）---")
print("子类能无感替换父类\\n")

# ❌ 反例：Square 破坏 Rectangle 行为
class Rectangle:
    def __init__(self, w, h):
        self.width = w
        self.height = h
    def set_width(self, w): self.width = w
    def set_height(self, h): self.height = h
    def area(self): return self.width * self.height

class BadSquare(Rectangle):
    """子类加强约束，破坏父类行为"""
    def set_width(self, w):
        self.width = self.height = w   # 改一个变两个
    def set_height(self, h):
        self.width = self.height = h

def use_rect(r: Rectangle):
    r.set_width(5)
    r.set_height(10)
    return r.area()  # 期望 50

rect = Rectangle(2, 3)
print(f"Rectangle: set_width(5) set_height(10) → area={use_rect(rect)} (期望50)")
sq = BadSquare(2, 2)
print(f"BadSquare: set_width(5) set_height(10) → area={use_rect(sq)} (期望50但失败！违反LSP)")

# ✅ 正例：不强行继承
class Shape(ABC):
    @abstractmethod
    def area(self): ...

class Rect(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self): return self.w * self.h

class Square(Shape):
    def __init__(self, side):
        self.side = side
    def area(self): return self.side ** 2

print(f"\\n正例：用共同抽象 Shape，不强行继承")
print(f"  Rect(5,10).area() = {Rect(5, 10).area()}")
print(f"  Square(7).area() = {Square(7).area()}")

print("\\n--- I - 接口隔离原则（ISP）---")
print("不要强迫依赖不用的方法\\n")

# ❌ 反例：胖接口
class FatMachine(ABC):
    @abstractmethod
    def print(self): ...
    @abstractmethod
    def scan(self): ...
    @abstractmethod
    def fax(self): ...

class BadSimplePrinter(FatMachine):
    def print(self): print("  打印")
    def scan(self): raise NotImplementedError("用不到")
    def fax(self): raise NotImplementedError("用不到")

print("反例：简单打印机被迫实现 scan/fax")

# ✅ 正例：拆分接口
class Printer(ABC):
    @abstractmethod
    def print(self): ...

class Scanner(ABC):
    @abstractmethod
    def scan(self): ...

class Fax(ABC):
    @abstractmethod
    def fax(self): ...

class SimplePrinter(Printer):  # 只实现需要的
    def print(self): print("  [简单打印机] 打印")

class MultiFunction(Printer, Scanner, Fax):
    def print(self): print("  [多功能] 打印")
    def scan(self): print("  [多功能] 扫描")
    def fax(self): print("  [多功能] 传真")

print("正例：按需组合接口")
SimplePrinter().print()
mf = MultiFunction()
mf.print(); mf.scan(); mf.fax()

print("\\n--- D - 依赖倒置原则（DIP）---")
print("依赖抽象，不依赖具体\\n")

# ❌ 反例：高层依赖低层具体类
class BadMySQL:
    def query(self, sql): return f"MySQL 执行 {sql}"

class BadUserService:
    def __init__(self):
        self.db = BadMySQL()   # 硬编码依赖具体
    def get_user(self, uid):
        return self.db.query(f"SELECT * FROM users WHERE id={uid}")

print("反例：BadUserService 硬编码依赖 MySQL，换库要改类")

# ✅ 正例：依赖抽象 + 注入
class Database(ABC):
    @abstractmethod
    def query(self, sql): ...

class MySQL(Database):
    def query(self, sql): return f"MySQL 执行 {sql}"

class PostgreSQL(Database):
    def query(self, sql): return f"PostgreSQL 执行 {sql}"

class UserService:
    def __init__(self, db: Database):   # 依赖抽象
        self.db = db
    def get_user(self, uid):
        return self.db.query(f"SELECT * FROM users WHERE id={uid}")

print("正例：依赖 Database 抽象，注入不同实现")
svc1 = UserService(MySQL())
print(f"  MySQL: {svc1.get_user(1)}")
svc2 = UserService(PostgreSQL())  # 换库不改 UserService
print(f"  PostgreSQL: {svc2.get_user(1)}")

print("\\n--- 业务场景：电商订单系统应用 SOLID ---")
print("""
SRP: Order 只管订单数据
    OrderRepository 管持久化
    OrderProcessor 管业务流程
    OrderNotifier 管通知

OCP: 加新促销策略写新类，不改 OrderProcessor
    class DiscountPromotion(Promotion): ...
    class FullReductionPromotion(Promotion): ...

LSP: DiscountOrder 继承 Order 不破坏 total() 行为

ISP: Payable / Shippable / Refundable 接口分离
    虚拟订单不必实现 Payable

DIP: OrderProcessor 依赖 PaymentGateway 抽象
    注入 Stripe / PayPal / 支付宝 不同实现
""")

print("--- SOLID vs 过度设计 ---")
print("""
判断标准：
1. 业务复杂度匹配：简单 CRUD 不需要 SOLID 全套
2. 变化方向明确：知道哪里会变才抽象
3. YAGNI 原则：用不到的接口别提前造
4. 三次法则：第三次重复时再抽象

反例（过度设计）：
- 简单 hello world 也搞抽象工厂
- 单一实现就建接口
- 5 层继承只为加一个方法

正例（适度设计）：
- 业务有真实多变的支付/通知/存储 → 抽象
- 有 3+ 个相似类 → 提取基类
- 跨模块依赖 → 依赖抽象而非具体
""")

print("=== SOLID 总结 ===")
print("1. S: 一个类一个变化理由，职责清晰")
print("2. O: 用抽象+多态扩展，少用 if-else 分支")
print("3. L: 子类不破坏父类契约，行为兼容")
print("4. I: 接口小而专，不强迫实现用不到的方法")
print("5. D: 依赖抽象（ABC/Protocol），用依赖注入")
print("6. 先写直白代码，发现重复/耦合再重构到 SOLID")
print("7. YAGNI+三次法则：第三次重复才抽象")
print("8. SOLID 是指南不是教条，业务第一")
`,
  },
  {
    id: "py6-protocol-class",
    group: "面向对象进阶",
    icon: "📜",
    title: "Protocol 协议类与结构化类型",
    content: `## Protocol 协议类与结构化类型（typing.Protocol / runtime_checkable / 鸭子类型静态版）

### 什么是 Protocol？

\`typing.Protocol\`（PEP 544，Python 3.8+）是 Python 的**结构化类型**机制，俗称"鸭子类型的静态版"。传统鸭子类型在**运行时**才检查方法是否存在（\`AttributeError\`）。Protocol 让你在**类型注解**里声明"我需要一个有 \`draw()\` 方法的对象"，mypy 等类型检查器在**静态检查**时验证。

> "如果一个对象走起来像鸭子、叫起来像鸭子，那它就是鸭子。"

### Protocol 定义

\`\`\`python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None:
        ...

class Circle:
    def draw(self) -> None:
        print("画圆")

def render(obj: Drawable) -> None:
    obj.draw()

render(Circle())   # ✅ Circle 有 draw 方法，符合 Drawable 协议
\`\`\`

注意：\`Circle\` **没有继承** \`Drawable\`，但因为有 \`draw()\` 方法就被认为符合协议——这就是**结构化类型**。

### 隐式实现：只要有同名方法就符合

与 ABC 不同，Protocol 不需要 \`register()\` 或继承，**结构匹配就算实现**：

\`\`\`python
class Rectangle:
    def draw(self) -> None: ...

class Printer:
    def draw(self) -> None: ...   # 完全不同的"画"，但符合 Drawable

# 两者都能传给 render(obj: Drawable)
\`\`\`

这是 Protocol 与 ABC 的根本区别：ABC 是**名义类型**（必须继承才算），Protocol 是**结构化类型**（结构匹配就算）。

### @runtime_checkable 装饰器

默认 Protocol 只能用于静态检查（mypy），\`isinstance\` 不支持。加 \`@runtime_checkable\` 后可以做 \`isinstance\` 检查：

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class SizedProtocol(Protocol):
    def __len__(self) -> int: ...

isinstance([1,2,3], SizedProtocol)   # True
isinstance("abc", SizedProtocol)     # True
isinstance(42, SizedProtocol)        # False
\`\`\`

> ⚠️ **避坑**：\`runtime_checkable\` 只检查**方法是否存在**，不检查方法签名。即使方法签名不对，\`isinstance\` 也返回 True。静态检查（mypy）才检查签名。

### Protocol vs ABC：结构化 vs 名义类型

| 特性 | Protocol | ABC |
|------|---------|-----|
| 类型系统 | 结构化（鸭子类型静态版） | 名义化（继承才算） |
| 实现方式 | 隐式（结构匹配） | 显式继承或 register() |
| 类型检查 | 静态（mypy）+ 可选运行时 | 运行时（实例化时） |
| 解耦程度 | 完全解耦 | 需要知道 ABC 才能继承 |
| 适合场景 | 接口/协议定义、第三方解耦 | 框架扩展点、模板方法 |

> 💡 **选择**：定义接口契约优先 Protocol；需要 \`@abstractmethod\` 强制子类实现、模板方法模式时用 ABC；两者也可以结合使用。

### 业务场景：插件接口

\`\`\`python
from typing import Protocol
class Plugin(Protocol):
    name: str
    def load(self) -> None: ...
    def run(self, ctx: dict) -> dict: ...

def install_plugin(plugin: Plugin) -> None:
    print(f"安装插件 {plugin.name}")
    plugin.load()
    # ...

# 第三方插件无需继承 Protocol
class MyPlugin:
    name = "我的插件"
    def load(self): ...
    def run(self, ctx): return {}

install_plugin(MyPlugin())   # ✅ 结构匹配
\`\`\`

第三方开发者不需要 import 你的 \`Plugin\` 基类，只要结构对就行，**彻底解耦**。

### 业务场景：第三方库解耦

不希望业务代码强依赖某个具体库（如 \`requests\`），可以定义 Protocol：

\`\`\`python
from typing import Protocol
class HTTPClient(Protocol):
    def get(self, url: str) -> "Response": ...

class Service:
    def __init__(self, client: HTTPClient):
        self._client = client   # 可注入 requests / httpx / aiohttp

# 切换 HTTP 库不动 Service 代码
\`\`\`

### 与 isinstance 配合

加 \`@runtime_checkable\` 后可以做运行时类型检查：

\`\`\`python
from typing import Protocol
from typing import runtime_checkable
@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

def safe_close(obj):
    if isinstance(obj, Closeable):
        obj.close()
\`\`\`

### 常用内置 Protocol

\`typing\` 模块和 \`collections.abc\` 提供大量常用 Protocol：\`Iterable[T]\`（\`__iter__\`）、\`Iterator[T]\`（\`__next__\` + \`__iter__\`）、\`Sized\`（\`__len__\`）、\`Container[T]\`（\`__contains__\`）、\`Hashable\`（\`__hash__\`）、\`Callable\`（\`__call__\`）、\`Awaitable[T]\`（\`__await__\`）、\`ContextManager\`（\`__enter__\` + \`__exit__\`）。这些都可以直接用作类型注解：

\`\`\`python
from typing import Iterable, Callable

def process(items: Iterable[int]) -> None: ...
def apply(fn: Callable[[int], int], x: int) -> int: ...
\`\`\`

### mypy 类型检查演示

\`\`\`python
# demo.py
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None: pass   # ✅ 有 draw，符合

class Square:
    def paint(self) -> None: pass   # ❌ 不是 draw！

def render(obj: Drawable) -> None:
    obj.draw()

render(Circle())   # ✅ OK
render(Square())   # ❌ mypy 报错：Square 不符合 Drawable
\`\`\`

运行 \`mypy demo.py\`，第二行报错：\`Argument 1 to "render" has incompatible type "Square"; expected "Drawable"\`。

### Protocol 的高级用法

#### 1. 泛型 Protocol

\`\`\`python
from typing import Protocol, TypeVar
T = TypeVar("T")

class Box(Protocol[T]):
    def get(self) -> T: ...
    def put(self, item: T) -> None: ...

# Box[int] 表示装 int 的盒子
\`\`\`

#### 2. Protocol 继承

\`\`\`python
from typing import Protocol
class Readable(Protocol):
    def read(self) -> str: ...

class Writable(Protocol):
    def write(self, data: str) -> None: ...

class ReadWrite(Readable, Writable, Protocol):
    """组合多个协议"""
    pass
\`\`\`

### 原理深入

Protocol 类由 \`_ProtocolMeta\` 元类创建，标记为 \`_is_protocol = True\`。mypy 等类型检查器识别这个标记，按结构匹配判断类型。运行时 Protocol 本身不强制行为，只是 \`isinstance\`（需 \`@runtime_checkable\`）做方法存在性检查。

> ⚠️ **避坑提示**：
> 1. \`runtime_checkable\` 的 \`isinstance\` **只检查方法名存在**，不检查签名。要严格类型用 mypy
> 2. Protocol 不能实例化（除非加方法体并显式继承）
> 3. Protocol 与 ABC 选择：纯接口定义优先 Protocol；模板方法/扩展点用 ABC
> 4. 不要给 Protocol 加 \`@abstractmethod\`——Protocol 方法本身就是"协议"，没必要
> 5. 第三方库适配老代码用 Protocol 比改继承链更优雅

### 最佳实践总结

1. 定义接口契约优先用 Protocol，比 ABC 更解耦
2. 静态检查用 mypy，运行时检查加 \`@runtime_checkable\`
3. 给第三方库做适配器时，定义 Protocol 而非要求继承具体类
4. 内置 Protocol（Iterable/Callable/Sized 等）直接用作类型注解
5. Protocol 可继承、可泛型、可组合，灵活强大
6. Protocol + mypy 是 Python 静态类型的最佳实践之一
7. Protocol 不强制实现，靠"结构匹配"，与 Python 鸭子类型哲学一致`,
    code: `from typing import Protocol, runtime_checkable, TypeVar, Iterable, Callable
from abc import ABC, abstractmethod

print("=== Protocol 协议类与结构化类型演示 ===\\n")

print("--- 1. Protocol 基础：结构化类型 ---")

class Drawable(Protocol):
    """Drawable 协议：只要有 draw() 方法就算实现"""
    def draw(self) -> None:
        ...

class Circle:
    """没有继承 Drawable，但有 draw() 方法"""
    def draw(self):
        print("  画圆 ●")

class Rectangle:
    def draw(self):
        print("  画矩形 ▭")

def render(obj: Drawable) -> None:
    """参数类型是 Drawable，但传入任意有 draw() 的对象都行"""
    obj.draw()

print("Circle 和 Rectangle 都没继承 Drawable，但有 draw() 方法")
render(Circle())
render(Rectangle())

print("\\n--- 2. Protocol vs ABC：结构化 vs 名义类型 ---")

# ABC 必须显式继承
class AnimalABC(ABC):
    @abstractmethod
    def speak(self): ...

class Dog(AnimalABC):  # 显式继承
    def speak(self): return "汪汪"

# Protocol 隐式实现
class Speaker(Protocol):
    def speak(self) -> str: ...

class Cat:   # 没继承任何东西
    def speak(self): return "喵喵"

class Robot:  # 完全不同的类，但有 speak()
    def speak(self): return "Beep"

def make_sound(s: Speaker) -> str:
    return s.speak()

print(f"Cat 声音: {make_sound(Cat())}")
print(f"Robot 声音: {make_sound(Robot())}")
print("→ Protocol 完全解耦，无需继承")

print("\\n--- 3. @runtime_checkable：运行时 isinstance 检查 ---")

@runtime_checkable
class Sized(Protocol):
    def __len__(self) -> int: ...

print("isinstance 检查（只看方法是否存在）:")
print(f"  isinstance([1,2,3], Sized) = {isinstance([1,2,3], Sized)}")
print(f"  isinstance('abc', Sized) = {isinstance('abc', Sized)}")
print(f"  isinstance({{1:2}}, Sized) = {isinstance({1:2}, Sized)}")
print(f"  isinstance(42, Sized) = {isinstance(42, Sized)}")

print("\\n--- 4. 业务场景：插件接口 ---")

class Plugin(Protocol):
    """插件协议：第三方插件按此结构实现"""
    name: str
    def load(self) -> bool: ...
    def run(self, ctx: dict) -> dict: ...

class AnalyticsPlugin:
    """分析插件：无需继承 Plugin"""
    name = "analytics"
    def load(self):
        print(f"  加载 {self.name} 插件")
        return True
    def run(self, ctx):
        return {"event": "tracked", "user": ctx.get("user")}

class LoggerPlugin:
    name = "logger"
    def load(self):
        print(f"  加载 {self.name} 插件")
        return True
    def run(self, ctx):
        print(f"  [日志] {ctx}")
        return {"logged": True}

def install_plugin(plugin: Plugin) -> None:
    """插件管理器：依赖 Plugin 协议，不依赖具体插件"""
    if plugin.load():
        result = plugin.run({"user": "张三"})
        print(f"  结果: {result}")

print("安装插件（第三方插件无需 import Protocol 基类）:")
install_plugin(AnalyticsPlugin())
install_plugin(LoggerPlugin())

print("\\n--- 5. 业务场景：第三方库解耦 ---")

class HTTPClient(Protocol):
    """HTTP 客户端协议：解耦具体库"""
    def get(self, url: str) -> dict: ...

class RequestsLike:
    """模拟 requests 库"""
    def get(self, url):
        return {"lib": "requests", "url": url, "status": 200}

class HttpxLike:
    """模拟 httpx 库"""
    def get(self, url):
        return {"lib": "httpx", "url": url, "status": 200}

class Service:
    """业务服务：依赖 HTTPClient 协议，可注入任意实现"""
    def __init__(self, client: HTTPClient):
        self._client = client
    def fetch_data(self, url):
        return self._client.get(url)

print("注入不同 HTTP 实现，不改 Service:")
svc1 = Service(RequestsLike())
print(f"  requests: {svc1.fetch_data('https://api.example.com')}")
svc2 = Service(HttpxLike())  # 换库不动 Service
print(f"  httpx:    {svc2.fetch_data('https://api.example.com')}")

print("\\n--- 6. 常用内置 Protocol ---")

# Iterable: 任何可迭代的
def count_items(items: Iterable) -> int:
    return sum(1 for _ in items)

print(f"count_items([1,2,3]) = {count_items([1,2,3])}")
print(f"count_items('hello') = {count_items('hello')}")
print(f"count_items({{1,2,3}}) = {count_items({1,2,3})}")

# Callable: 任何可调用的
def apply(fn: Callable[[int], int], x: int) -> int:
    return fn(x)

print(f"\\napply(lambda x: x*2, 5) = {apply(lambda x: x*2, 5)}")
print(f"apply(abs, -7) = {apply(abs, -7)}")

print("\\n--- 7. Protocol 高级用法：泛型 ---")

T = TypeVar("T")

class Box(Protocol[T]):
    """泛型 Protocol：盒子协议"""
    def get(self) -> T: ...
    def put(self, item: T) -> None: ...

class IntBox:
    """装 int 的盒子"""
    def __init__(self):
        self._item = 0
    def get(self) -> int:
        return self._item
    def put(self, item: int) -> None:
        self._item = item

class StrBox:
    """装 str 的盒子"""
    def __init__(self):
        self._item = ""
    def get(self) -> str:
        return self._item
    def put(self, item: str) -> None:
        self._item = item

def use_box(box: Box) -> None:
    print(f"  从盒子取出: {box.get()!r}")

ib = IntBox(); ib.put(42)
sb = StrBox(); sb.put("hello")
print("泛型 Protocol（运行时不检查泛型参数，mypy 才检查）:")
use_box(ib)
use_box(sb)

print("\\n--- 8. Protocol 继承：组合协议 ---")

class Readable(Protocol):
    def read(self) -> str: ...

class Writable(Protocol):
    def write(self, data: str) -> None: ...

class ReadWrite(Readable, Writable, Protocol):
    """组合多个协议"""
    pass

class FileLike:
    """实现 ReadWrite 协议"""
    def read(self): return "文件内容"
    def write(self, data): print(f"  写入: {data}")

def copy(src: Readable, dst: Writable) -> None:
    data = src.read()
    dst.write(data)

print("Protocol 组合：Readable + Writable = ReadWrite")
src = FileLike()
dst = FileLike()
copy(src, dst)

print("\\n--- 9. mypy 静态检查演示（概念说明）---")
print("""
# demo_protocol.py
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None: pass

class Square:
    def paint(self) -> None: pass   # 不是 draw！

def render(obj: Drawable) -> None:
    obj.draw()

render(Circle())   # ✅ mypy 通过
render(Square())   # ❌ mypy 报错:
# error: Argument 1 to "render" has incompatible type "Square";
#        expected "Drawable"  [arg-type]

运行: mypy demo_protocol.py
""")

print("\\n=== Protocol 总结 ===")
print("1. Protocol 是结构化类型，鸭子类型的静态版")
print("2. 隐式实现：结构匹配就算，无需继承")
print("3. @runtime_checkable 让 isinstance 可用（只查方法名存在）")
print("4. Protocol vs ABC: 结构化解耦 vs 名义化强制")
print("5. 业务场景：插件接口、第三方库解耦、依赖注入")
print("6. 内置 Protocol: Iterable/Callable/Sized/Hashable 等")
print("7. Protocol 可泛型、可继承、可组合，灵活强大")
print("8. 配合 mypy 静态检查，Python 也能享受静态类型安全")
print("9. Protocol + ABC 可结合使用，按场景选择")
print("10. 不强制实现，符合 Python 鸭子类型哲学")
`,
  },
];
