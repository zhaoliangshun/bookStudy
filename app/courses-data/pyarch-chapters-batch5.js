// =============================================================
// Python 设计思想与架构教程 - 第 5 批章节(设计模式 · 行为型)
// =============================================================

export const chapters = [
  {
    id: "pyarch-dp-strategy",
    icon: "♟️",
    title: "策略模式(Strategy)",
    group: "设计模式 · 行为型",
    content: `# 策略模式(Strategy)

## 一、策略模式定义

策略模式(Strategy Pattern)是一种行为型设计模式,其核心定义是:

> 定义一系列算法,将每一个算法封装起来,并使它们可以互相替换。策略模式使得算法可以独立于使用它的客户端而变化。

用一句话概括:**「同一接口,不同实现,运行时切换」**。

### 1.1 经典 UML 类图

\`\`\`
           ┌─────────────────────┐
           │      Context        │
           ├─────────────────────┤
           │ - strategy: Strategy│
           ├─────────────────────┤
           │ + setStrategy(s)    │
           │ + doSomething()     │
           └─────────┬───────────┘
                     │ holds
                     ▼
           ┌─────────────────────┐
           │     <<interface>>   │
           │      Strategy       │
           ├─────────────────────┤
           │ + execute(data): T  │
           └─────────┬───────────┘
                     ▲ implements
        ┌────────────┼────────────┐
        │            │            │
┌───────────────┐ ┌──────────┐ ┌──────────────┐
│ConcreteStratA │ │ConcreteB │ │ConcreteStratC│
├───────────────┤ ├──────────┤ ├──────────────┤
│+execute(data) │ │+execute()│ │+execute(data)│
└───────────────┘ └──────────┘ └──────────────┘
\`\`\`

### 1.2 最简代码骨架

\`\`\`python
from abc import ABC, abstractmethod
from typing import Any

class Strategy(ABC):
    """策略抽象基类,所有具体策略必须实现 execute。"""
    @abstractmethod
    def execute(self, data: Any) -> Any:
        ...

class ConcreteStrategyA(Strategy):
    def execute(self, data: Any) -> Any:
        return f"A 处理 {data}"

class ConcreteStrategyB(Strategy):
    def execute(self, data: Any) -> Any:
        return f"B 处理 {data}"

class Context:
    def __init__(self, strategy: Strategy) -> None:
        self._strategy = strategy

    def set_strategy(self, strategy: Strategy) -> None:
        self._strategy = strategy

    def do_something(self, data: Any) -> Any:
        # Context 把具体算法委托给策略对象
        return self._strategy.execute(data)

ctx = Context(ConcreteStrategyA())
print(ctx.do_something("订单"))   # A 处理 订单
ctx.set_strategy(ConcreteStrategyB())
print(ctx.do_something("订单"))   # B 处理 订单
\`\`\`

---

## 二、直觉理解:为什么需要策略模式

### 2.1 痛点:if/else 地狱

假设你在写一个电商系统的折扣计算逻辑。最初只有一种折扣:原价。后来产品经理说:

- 要支持打八折
- 要支持满 300 减 50
- 要支持阶梯折扣(买得越多越便宜)
- 节假日要叠加优惠券

一个新手程序员会这么写:

\`\`\`python
def calculate_price(price: float, discount_type: str) -> float:
    if discount_type == "normal":
        return price
    elif discount_type == "0.8":
        return price * 0.8
    elif discount_type == "full_reduction":
        return price - 50 if price >= 300 else price
    elif discount_type == "tiered":
        if price >= 1000:
            return price * 0.7
        elif price >= 500:
            return price * 0.8
        else:
            return price * 0.9
    else:
        raise ValueError(f"未知折扣类型: {discount_type}")
\`\`\`

这段代码的问题:

1. **违反 OCP(开闭原则)**:每加一种折扣,都要修改这个函数
2. **函数越来越长**:从 4 行变成 40 行,可读性骤降
3. **难以单元测试**:每个分支都要测,组合爆炸
4. **难以复用**:折扣逻辑被锁死在这个函数里,其他模块想用拿不到
5. **难以扩展**:如果想给折扣加参数(比如满减阈值),函数签名要变

### 2.2 策略模式的解法

把每一种折扣算法封装成一个独立的类(或函数),它们实现同一个接口。调用方只需要持有一个策略对象,运行时可以切换:

\`\`\`python
# 不再写一坨 if/else,而是:
order = Order(price=1000, strategy=TieredDiscountStrategy())
print(order.final_price())  # 700

order.strategy = NormalDiscountStrategy()
print(order.final_price())  # 1000
\`\`\`

### 2.3 类比:象棋棋子

策略模式的名字来自象棋。每种棋子(车、马、炮)走法不同,但都是「棋子」这个抽象。下棋时你可以选择不同的棋子(切换策略),不需要修改棋盘的规则。

| 棋子 | 走法策略 |
|------|----------|
| 车 | 直线 |
| 马 | 日字 |
| 炮 | 直线 + 隔山打牛 |

「棋盘」= Context,「棋子」= Strategy,「走法」= execute()。

---

## 三、策略模式与 OCP 的关系

开闭原则(Open-Closed Principle, OCP)说:**软件实体应该对扩展开放,对修改关闭**。

策略模式是 OCP 的经典应用:

- **对扩展开放**:加新策略时,只需新增一个类,实现 Strategy 接口
- **对修改关闭**:Context 代码、已有策略代码都不需要改

对比 if/else 写法:加新折扣要改 \`calculate_price\` 函数 → 违反 OCP。

### 3.1 OCP 检查清单

| 检查项 | if/else 写法 | 策略模式 |
|--------|--------------|----------|
| 加新折扣是否改老代码? | 是 ❌ | 否 ✅ |
| 新人能否独立加策略? | 难(要读懂整坨 if) | 能(只写一个新类) |
| 单元测试是否隔离? | 否 | 是 |
| 策略能否运行时切换? | 否(硬编码) | 是 |

---

## 四、应用场景

策略模式在工程中极其常见:

### 4.1 折扣/促销策略
电商系统的优惠计算、满减、阶梯折扣、优惠券叠加。

### 4.2 排序算法
Python 的 \`sorted(iterable, key=...)\` 就是用策略模式:\`key\` 函数就是策略。

\`\`\`python
students = [("Alice", 90), ("Bob", 85), ("Charlie", 95)]
# 策略 1:按分数升序
sorted(students, key=lambda s: s[1])
# 策略 2:按名字长度
sorted(students, key=lambda s: len(s[0]))
\`\`\`

### 4.3 支付方式
支付宝、微信、银行卡、Apple Pay,每种都是一种支付策略。

### 4.4 日志格式
JSON 格式、纯文本格式、ELK 格式,日志格式策略可切换。

### 4.5 路由算法
负载均衡器中的轮询、随机、加权、最少连接,都是路由策略。

### 4.6 压缩算法
gzip / bzip2 / lz4 / zstd,选择不同的压缩策略。

### 4.7 数据库方言
SQLAlchemy 的 Dialect 就是策略:同一套 ORM 代码,底层可以跑 MySQL / PostgreSQL / SQLite。

---

## 五、Python 实战:三种实现风格

Python 实现策略模式有三种主流风格,各有适用场景。

### 5.1 风格一:经典 OOP(抽象基类 + 具体策略)

这是最「教科书」的写法,适合需要状态、需要复杂逻辑的策略。

\`\`\`python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

class DiscountStrategy(ABC):
    """折扣策略抽象基类。"""
    @abstractmethod
    def apply(self, price: float) -> float:
        """返回折扣后的价格。"""
        ...

class NormalDiscount(DiscountStrategy):
    """原价,不打折。"""
    def apply(self, price: float) -> float:
        return price

class PercentageDiscount(DiscountStrategy):
    """百分比折扣,例如打八折传 0.8。"""
    def __init__(self, rate: float) -> None:
        assert 0 < rate <= 1, "折扣率必须在 (0, 1]"
        self.rate = rate

    def apply(self, price: float) -> float:
        return price * self.rate

class FullReductionDiscount(DiscountStrategy):
    """满减:满 threshold 减 reduction。"""
    def __init__(self, threshold: float, reduction: float) -> None:
        self.threshold = threshold
        self.reduction = reduction

    def apply(self, price: float) -> float:
        if price >= self.threshold:
            return price - self.reduction
        return price

class TieredDiscount(DiscountStrategy):
    """阶梯折扣:不同价格区间不同折扣。"""
    def __init__(self, tiers: list[tuple[float, float]]) -> None:
        # tiers: [(最低价, 折扣率), ...],按最低价降序
        self.tiers = sorted(tiers, key=lambda t: t[0], reverse=True)

    def apply(self, price: float) -> float:
        for threshold, rate in self.tiers:
            if price >= threshold:
                return price * rate
        return price  # 不满足任何阶梯,原价
\`\`\`

### 5.2 风格二:Pythonic(函数作为策略 + dataclass)

Python 函数是一等公民,可以直接当策略用。这种写法更简洁,适合无状态策略。

\`\`\`python
from dataclasses import dataclass, field
from typing import Callable

# 策略类型:接收原价,返回折扣后价格
DiscountFn = Callable[[float], float]

def normal(price: float) -> float:
    return price

def off_20(percent: float = 0.8):
    """工厂函数,返回一个打八折策略。"""
    def _inner(price: float) -> float:
        return price * percent
    return _inner

def full_reduction(threshold: float, reduction: float):
    def _inner(price: float) -> float:
        return price - reduction if price >= threshold else price
    return _inner

@dataclass
class Order:
    price: float
    discount: DiscountFn = normal  # 默认原价

    def final_price(self) -> float:
        return self.discount(self.price)

# 使用
order = Order(price=1000, discount=off_20(0.8))
print(order.final_price())  # 800.0

order.discount = full_reduction(threshold=300, reduction=50)
print(order.final_price())  # 950.0
\`\`\`

### 5.3 风格三:用 typing.Callable 类型注解 + 注册表

当策略很多、需要动态注册时,用注册表模式:

\`\`\`python
from typing import Callable, Protocol

class DiscountProto(Protocol):
    def __call__(self, price: float) -> float: ...

_REGISTRY: dict[str, DiscountProto] = {}

def register(name: str):
    """装饰器:把策略函数注册到注册表。"""
    def decorator(fn: DiscountProto) -> DiscountProto:
        _REGISTRY[name] = fn
        return fn
    return decorator

@register("normal")
def _normal(price: float) -> float:
    return price

@register("vip")
def _vip(price: float) -> float:
    return price * 0.7

@register("black_friday")
def _black_friday(price: float) -> float:
    return price * 0.5 if price > 100 else price

# 根据配置字符串动态选策略
def get_discount(name: str) -> DiscountProto:
    return _REGISTRY.get(name, _normal)

order = Order(price=200, discount=get_discount("vip"))
print(order.final_price())  # 140.0
\`\`\`

### 5.4 三种风格对比

| 风格 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 经典 OOP | 类型安全、可带状态、IDE 提示好 | 代码多、啰嗦 | 复杂策略、需要状态 |
| 函数式 | 简洁、Pythonic | 难带状态、调试难 | 无状态简单策略 |
| 注册表 | 动态、可配置 | 运行时才知道有哪些 | 插件系统、配置驱动 |

---

## 六、完整 Demo:电商折扣系统

下面是一个完整的电商折扣系统,综合使用 OOP 风格 + dataclass + 类型注解。

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# ====== 1. 策略抽象层 ======

class DiscountStrategy(ABC):
    """所有折扣策略的抽象基类。

    设计要点:
    1. 用 ABC 强制子类实现 apply,避免「忘写」
    2. apply 返回 float,不修改 price(纯函数风格)
    3. 提供 describe() 用于日志和调试
    """
    @abstractmethod
    def apply(self, price: float) -> float:
        ...

    def describe(self) -> str:
        return self.__class__.__name__

# ====== 2. 具体策略 ======

class NormalDiscount(DiscountStrategy):
    """原价。"""
    def apply(self, price: float) -> float:
        return price

@dataclass
class PercentageDiscount(DiscountStrategy):
    """百分比折扣。rate=0.8 表示打八折。"""
    rate: float = 1.0

    def __post_init__(self):
        if not 0 < self.rate <= 1:
            raise ValueError(f"折扣率 {self.rate} 必须在 (0, 1]")

    def apply(self, price: float) -> float:
        discounted = price * self.rate
        logger.debug(f"百分比折扣: {price} * {self.rate} = {discounted}")
        return discounted

@dataclass
class FullReductionDiscount(DiscountStrategy):
    """满减:满 threshold 减 reduction。"""
    threshold: float = 0.0
    reduction: float = 0.0

    def apply(self, price: float) -> float:
        if price >= self.threshold:
            result = price - self.reduction
            logger.debug(f"满减: {price} - {self.reduction} = {result}")
            return result
        logger.debug(f"未满 {self.threshold},不优惠")
        return price

@dataclass
class TieredDiscount(DiscountStrategy):
    """阶梯折扣。tiers: [(最低价, 折扣率), ...]"""
    tiers: list[tuple[float, float]] = field(default_factory=list)

    def apply(self, price: float) -> float:
        # 按门槛降序排,找第一个满足的
        for threshold, rate in sorted(self.tiers, key=lambda t: -t[0]):
            if price >= threshold:
                result = price * rate
                logger.debug(f"阶梯折扣: 满 {threshold} 打 {rate} = {result}")
                return result
        return price

@dataclass
class CompositeDiscount(DiscountStrategy):
    """组合折扣:多个策略依次应用(注意顺序敏感)。"""
    strategies: list[DiscountStrategy] = field(default_factory=list)

    def apply(self, price: float) -> float:
        for s in self.strategies:
            price = s.apply(price)
        return price

    def describe(self) -> str:
        names = [s.describe() for s in self.strategies]
        return f"Composite[{', '.join(names)}]"

# ====== 3. Context:订单 ======

@dataclass
class Order:
    """订单,持有价格和折扣策略。

    策略通过构造函数注入,也可通过 setter 运行时切换。
    """
    price: float
    discount: DiscountStrategy = field(default_factory=NormalDiscount)

    @property
    def final_price(self) -> float:
        if self.price < 0:
            raise ValueError("价格不能为负")
        return self.discount.apply(self.price)

    def set_discount(self, strategy: DiscountStrategy) -> None:
        logger.info(f"切换折扣策略: {self.discount.describe()} -> {strategy.describe()}")
        self.discount = strategy

# ====== 4. 客户端使用 ======

def main():
    logging.basicConfig(level=logging.DEBUG)

    # 场景 1:原价
    order = Order(price=100)
    print(f"原价: {order.final_price}")  # 100

    # 场景 2:打八折
    order.set_discount(PercentageDiscount(rate=0.8))
    print(f"打八折: {order.final_price}")  # 80

    # 场景 3:满 300 减 50
    order = Order(price=400, discount=FullReductionDiscount(threshold=300, reduction=50))
    print(f"满减: {order.final_price}")  # 350

    # 场景 4:阶梯折扣
    tiers = [(1000, 0.7), (500, 0.8), (100, 0.9)]
    order = Order(price=1200, discount=TieredDiscount(tiers=tiers))
    print(f"阶梯: {order.final_price}")  # 840

    # 场景 5:组合折扣(先打八折,再满减)
    composite = CompositeDiscount([
        PercentageDiscount(rate=0.8),
        FullReductionDiscount(threshold=300, reduction=50),
    ])
    order = Order(price=500, discount=composite)
    print(f"组合: {order.final_price}")  # (500*0.8) - 50 = 350
    print(f"策略描述: {order.discount.describe()}")

if __name__ == "__main__":
    main()
\`\`\`

运行结果:

\`\`\`
原价: 100
打八折: 80.0
满减: 350.0
阶梯: 840.0
组合: 350.0
策略描述: Composite[PercentageDiscount, FullReductionDiscount]
\`\`\`

---

## 七、策略 vs 状态 vs 模板方法

这三个模式都是行为型,容易混淆。核心区别:

| 维度 | 策略模式 | 状态模式 | 模板方法 |
|------|----------|----------|----------|
| **核心目的** | 算法可替换 | 行为随状态变 | 算法骨架固定 |
| **谁决定切换?** | 客户端外部注入 | 状态自己切换(内部) | 框架控制流程 |
| **实现方式** | 组合 | 组合 + 状态机 | 继承 |
| **关系数量** | 通常 1 个策略 | 多个状态轮换 | 1 个模板 |
| **OCP 体现** | 加策略不改 Context | 加状态要改状态机 | 加子类不改模板 |
| **典型场景** | 折扣、排序 | 订单状态机 | 数据流水线 |

### 7.1 通俗类比

- **策略**:你选哪把刀切菜(水果刀/菜刀/剁骨刀),刀本身不会变
- **状态**:红绿灯(红→绿→黄),灯自己按规则切换
- **模板方法**:做菜模板(备料→炒→装盘),每步可换做法但顺序固定

### 7.2 代码结构差异

\`\`\`python
from abc import ABC
# 策略:外部注入,Context 不主动切换
class Order:
    def __init__(self, strategy: DiscountStrategy):
        self.strategy = strategy  # 客户端决定

# 状态:状态对象内部触发切换
class OrderState:
    def pay(self, order):
        order.state = PaidState()  # 状态自己切

# 模板方法:基类定流程,子类填步骤
class DataPipeline(ABC):
    def run(self):  # 模板方法,final
        self.parse()
        self.validate()
        self.transform()
        self.persist()
\`\`\`

---

## 八、高级话题

### 8.1 策略与函数式编程

Python 的策略模式天然契合函数式。如果一个策略无状态,直接用函数即可,无需类:

\`\`\`python
# 等价于 PercentageDiscount(rate=0.8)
def off_20(price: float) -> float:
    return price * 0.8

# 使用
sorted(prices, key=off_20)  # 传入函数即策略
\`\`\`

Python 标准库大量使用这种「函数即策略」:
- \`sorted(key=...)\
- \`functools.reduce(function=...)\
- \`filter(function=...)\
- \`map(function=...)\

### 8.2 策略与依赖注入

大型项目用依赖注入容器管理策略:

\`\`\`python
from dependency_injector import containers, providers

class Container(containers.DeclarativeContainer):
    discount_strategy = providers.Factory(PercentageDiscount, rate=0.8)

# 业务代码不直接 new,而是从容器取
order = Order(price=100, discount=Container.discount_strategy())
\`\`\`

### 8.3 策略的单元测试

策略模式让单元测试变得简单:每个策略独立测试,不需要 mock Context。

\`\`\`python
import pytest

class TestPercentageDiscount:
    def test_normal(self):
        s = PercentageDiscount(rate=0.8)
        assert s.apply(100) == 80

    def test_invalid_rate(self):
        with pytest.raises(ValueError):
            PercentageDiscount(rate=1.5)

    def test_zero_price(self):
        s = PercentageDiscount(rate=0.8)
        assert s.apply(0) == 0

class TestTieredDiscount:
    def test_high_tier(self):
        s = TieredDiscount(tiers=[(1000, 0.7), (500, 0.8)])
        assert s.apply(1200) == 840

    def test_low_tier(self):
        s = TieredDiscount(tiers=[(1000, 0.7), (500, 0.8)])
        assert s.apply(600) == 480

    def test_no_tier(self):
        s = TieredDiscount(tiers=[(1000, 0.7)])
        assert s.apply(100) == 100  # 不满足,原价
\`\`\`

### 8.4 策略与配置驱动

生产环境常把策略选择做成配置:

\`\`\`yaml
# config.yaml
discount:
  strategy: tiered
  params:
    tiers:
      - [1000, 0.7]
      - [500, 0.8]
      - [100, 0.9]
\`\`\`

\`\`\`python
import yaml

def build_strategy_from_config(config: dict) -> DiscountStrategy:
    name = config["strategy"]
    params = config.get("params", {})
    if name == "normal":
        return NormalDiscount()
    elif name == "percentage":
        return PercentageDiscount(**params)
    elif name == "tiered":
        return TieredDiscount(**params)
    else:
        raise ValueError(f"未知策略: {name}")

with open("config.yaml") as f:
    cfg = yaml.safe_load(f)
strategy = build_strategy_from_config(cfg["discount"])
\`\`\`

---

## 九、易错点小结

| # | 易错点 | 后果 | 正确做法 |
|---|--------|------|----------|
| 1 | 策略类没继承 ABC | 子类可能漏实现 apply | 用 \`@abstractmethod\` 强制 |
| 2 | 策略内部修改 Context 状态 | 副作用难追踪 | 策略做成纯函数,只读 price |
| 3 | 切换策略时忘了通知相关方 | 数据不一致 | 加观察者或事件 |
| 4 | 策略对象带可变状态且被共享 | 并发安全问题 | 每次新建或加锁 |
| 5 | 把所有策略硬编码在 if/else | 退化成非策略模式 | 用注册表或工厂 |
| 6 | 策略 apply 返回 None | 调用方拿不到结果 | 强制返回值,加类型注解 |
| 7 | 折扣后价格为负没校验 | 商家亏钱 | 加 \`max(0, result)\` 或抛异常 |
| 8 | 组合折扣顺序随意 | 结果不符合预期 | 文档说明顺序,加测试 |
| 9 | 用继承实现策略切换 | 违反「组合优于继承」 | 用组合持有策略对象 |
| 10 | 策略类直接依赖 IO(打印/写文件) | 难测试、难复用 | 策略只算逻辑,IO 交给 Context |

---

## 十、本章总结

策略模式的本质是**「把变化的部分抽出来,用统一接口封装」**:

1. **抽象**:定义 Strategy 接口,只声明 \`execute\` 方法
2. **封装**:每个具体算法一个类
3. **替换**:Context 持有 Strategy 引用,可运行时切换
4. **解耦**:Context 不关心具体算法,只调接口

掌握策略模式后,你会发现 Python 标准库里到处都是它(\`sorted(key=)\`、\`functools\`、\`logging\` 的 Handler)。策略模式是行为型模式里最基础、最常用的一个,务必吃透。
`,
  },
  {
    id: "pyarch-dp-observer",
    icon: "👁️",
    title: "观察者模式(Observer)",
    group: "设计模式 · 行为型",
    content: `# 观察者模式(Observer)

## 一、观察者模式定义

观察者模式(Observer Pattern)是一种行为型设计模式,定义如下:

> 定义对象间一种一对多的依赖关系,当一个对象的状态发生改变时,所有依赖于它的对象都得到通知并被自动更新。

又称:**发布-订阅(Publish-Subscribe)、模型-视图(Model-View)、源-监听器(Source-Listener)**。

用一句话概括:**「一方变化,多方响应」**。

### 1.1 经典 UML 类图

\`\`\`
   ┌──────────────────────┐         notify()          ┌────────────────────┐
   │       Subject        │ ─────────────────────────▶ │     Observer       │
   ├──────────────────────┤                            │ <<interface>>      │
   │ - observers: list    │                            ├────────────────────┤
   ├──────────────────────┤                            │ + update(s: Subject)│
   │ + attach(o)          │                            └─────────▲──────────┘
   │ + detach(o)          │                                      │ implements
   │ + notify()           │                       ┌──────────────┼──────────────┐
   └──────────┬───────────┘                       │              │              │
              │ inherited                         │              │              │
   ┌──────────▼───────────┐              ┌────────┴─────┐ ┌──────┴──────┐ ┌─────┴──────┐
   │  ConcreteSubject     │              │   ObserverA  │ │  ObserverB  │ │ ObserverC  │
   ├──────────────────────┤              ├──────────────┤ ├─────────────┤ ├────────────┤
   │ - state              │              │ + update()   │ │ + update()  │ │ + update() │
   ├──────────────────────┤              └──────────────┘ └─────────────┘ └────────────┘
   │ + getState()         │
   │ + setState(s)        │
   └──────────────────────┘
\`\`\`

### 1.2 最简代码骨架

\`\`\`python
from abc import ABC, abstractmethod
from typing import Any

class Observer(ABC):
    @abstractmethod
    def update(self, subject: "Subject") -> None:
        ...

class Subject:
    def __init__(self) -> None:
        self._observers: list[Observer] = []
        self._state: Any = None

    def attach(self, observer: Observer) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        self._observers.remove(observer)

    def notify(self) -> None:
        for observer in self._observers:
            observer.update(self)

    @property
    def state(self) -> Any:
        return self._state

    @state.setter
    def state(self, value: Any) -> None:
        self._state = value
        self.notify()  # 状态变化即通知

class ConcreteObserver(Observer):
    def __init__(self, name: str) -> None:
        self.name = name

    def update(self, subject: Subject) -> None:
        print(f"[{self.name}] 收到通知,state = {subject.state}")

# 使用
s = Subject()
s.attach(ConcreteObserver("A"))
s.attach(ConcreteObserver("B"))
s.state = "hello"  # 触发通知
# [A] 收到通知,state = hello
# [B] 收到通知,state = hello
\`\`\`

---

## 二、直觉理解:为什么需要观察者

### 2.1 痛点:轮询与耦合

假设股票系统里有多个客户端(手机 App、网页、邮件提醒)都想实时知道某只股票的价格变化。最笨的两种做法:

**做法一:轮询**

\`\`\`python
while True:
    price = stock.get_price()
    if price != last_price:
        notify_apps(price)
        notify_web(price)
        notify_email(price)
    sleep(1)
\`\`\`

问题:浪费 CPU、延迟大、客户端数量固定写死。

**做法二:被观察者直接调用每个客户端**

\`\`\`python
class Stock:
    def set_price(self, p):
        self.price = p
        app.update(p)        # 硬编码依赖 App
        web.update(p)        # 硬编码依赖 Web
        email.send(p)        # 硬编码依赖 Email
\`\`\`

问题:\`Stock\` 类耦合了所有客户端,加一个客户端要改 Stock 源码,违反 OCP。

### 2.2 观察者模式的解法

\`Stock\` 只维护一个观察者列表,不关心具体是谁:

\`\`\`python
class Stock(Subject):
    def set_price(self, p):
        self.price = p
        self.notify()  # 通知所有观察者,不关心是谁

# 客户端自己注册
stock.attach(app)
stock.attach(web)
stock.attach(email)
\`\`\`

Stock 与客户端**松耦合**:
- Stock 不知道客户端具体是谁,只知道它们实现了 \`update\`
- 加新客户端:只需新建一个 Observer 并 attach,Stock 不用改
- 删客户端:detach 即可

### 2.3 类比:微信公众号

观察者模式最贴切的类比就是微信公众号订阅:

- **公众号 = Subject**:发布文章
- **粉丝 = Observer**:订阅公众号
- **订阅 = attach**:粉丝关注公众号
- **取消关注 = detach**
- **推送 = notify**:公众号发文,所有粉丝收到

粉丝不关心公众号后台怎么运营,公众号也不关心粉丝是谁(只要关注了就推)。

---

## 三、推模式(push)vs 拉模式(pull)

观察者模式有两种通知风格,这是个常考点。

### 3.1 推模式(Push)

Subject 主动把数据「推」给 Observer:

\`\`\`python
class Subject:
    def notify(self):
        for o in self._observers:
            o.update(self._state)  # 推送完整状态

class Observer:
    def update(self, state):  # 直接收到数据
        print(f"state = {state}")
\`\`\`

**优点**:Observer 不用反查 Subject,简洁。
**缺点**:所有 Observer 收到相同数据,即使有些不需要;数据量大时浪费。

### 3.2 拉模式(Pull)

Subject 只通知「我变了」,Observer 自己来「拉」需要的数据:

\`\`\`python
class Subject:
    def notify(self):
        for o in self._observers:
            o.update(self)  # 只传自身引用

class Observer:
    def update(self, subject):
        # Observer 按需拉取
        price = subject.get_price()
        volume = subject.get_volume()
        print(f"price={price}, volume={volume}")
\`\`\`

**优点**:Observer 按需取数据,灵活。
**缺点**:Observer 要知道 Subject 的接口,耦合稍高;多次 getter 调用。

### 3.3 对比

| 维度 | 推模式 | 拉模式 |
|------|--------|--------|
| 数据流向 | Subject → Observer | Observer ← Subject |
| 参数 | update(data) | update(subject) |
| 灵活性 | 低(数据固定) | 高(按需拉) |
| 耦合 | 低 | 中(需知道 Subject 接口) |
| 性能 | 数据大时浪费 | 按需,省 |
| 适用 | 数据小、所有 Observer 都要 | 数据大、Observer 需求不同 |

**经验法则**:数据小且统一用推,数据大或 Observer 需求差异大用拉。

---

## 四、应用场景

观察者模式无处不在:

### 4.1 GUI 事件系统
按钮点击、鼠标移动、键盘输入。MVC 中的 View 监听 Model 变化。

### 4.2 消息总线
进程内的事件总线(EventBus),模块间解耦通信。

### 4.3 数据绑定
Vue/React 的响应式系统、Angular 的双向绑定,本质都是观察者。

### 4.4 RSS 订阅
RSS 阅读器订阅博客,博客更新自动推送给订阅者。

### 4.5 股票行情
股票价格变动,推送给出价方、报警系统、图表组件。

### 4.6 日志系统
logging 模块的 Handler 就是观察者:Logger 是 Subject,Handler 是 Observer。

### 4.7 数据库触发器
数据库的 AFTER INSERT/UPDATE/DELETE 触发器,本质是观察者。

### 4.8 Celery 任务事件
Celery 的 \`events\` 机制,任务状态变化通知监控端。

---

## 五、Python 实战

### 5.1 经典实现:Subject + Observer

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Optional
from weakref import WeakMethod, ref, ReferenceType
import logging

logger = logging.getLogger(__name__)

class Observer(ABC):
    """观察者抽象基类。"""
    @abstractmethod
    def update(self, subject: Subject) -> None:
        ...

class Subject:
    """被观察者基类,管理观察者列表。

    注意:
    - attach/detach 应该是 O(1) 或 O(n),这里用 list
    - notify 顺序即 attach 顺序
    - 使用弱引用避免内存泄漏(见 5.2)
    """
    def __init__(self) -> None:
        self._observers: list[Observer] = []

    def attach(self, observer: Observer) -> None:
        if observer not in self._observers:
            self._observers.append(observer)
            logger.debug(f"attach: {observer}")

    def detach(self, observer: Observer) -> None:
        try:
            self._observers.remove(observer)
            logger.debug(f"detach: {observer}")
        except ValueError:
            pass  # 不在列表中,忽略

    def notify(self) -> None:
        # 复制一份,避免迭代中观察者 detach 导致问题
        for observer in list(self._observers):
            try:
                observer.update(self)
            except Exception as e:
                logger.error(f"观察者 {observer} 异常: {e}", exc_info=True)

    @property
    def observers(self) -> list[Observer]:
        return list(self._observers)
\`\`\`

### 5.2 弱引用版本:避免内存泄漏

如果 Subject 长期存在,而 Observer 是临时对象(比如短生命周期的 UI 组件),Observer 被 attach 后,Subject 会一直持有它的引用,导致 Observer 无法被 GC 回收 → 内存泄漏。

解法:用 \`weakref\` 持有观察者。

\`\`\`python
from weakref import ref, WeakMethod, ReferenceType
import types

class WeakSubject:
    """使用弱引用持有观察者,避免内存泄漏。

    - 普通函数对象用 ref
    - 绑定方法用 WeakMethod(因为绑定方法每次访问都是新对象)
    """
    def __init__(self) -> None:
        self._observers: list[ReferenceType] = []

    def attach(self, observer) -> None:
        if isinstance(observer, types.MethodType):
            wr = WeakMethod(observer)
        else:
            wr = ref(observer)
        self._observers.append(wr)

    def notify(self, *args, **kwargs):
        # 先清理已失效的弱引用
        alive = []
        for wr in self._observers:
            obj = wr()
            if obj is not None:
                alive.append(wr)
                obj(*args, **kwargs)
        self._observers = alive

class ShortLivedUI:
    """短生命周期 UI 组件。"""
    def on_event(self, data):
        print(f"UI 收到: {data}")

subject = WeakSubject()
ui = ShortLivedUI()
subject.attach(ui.on_event)
subject.notify("hello")  # UI 收到: hello

del ui  # ui 被回收
subject.notify("world")  # 无输出,弱引用已失效
\`\`\`

### 5.3 异步观察者(asyncio)

同步 notify 会阻塞 Subject,且一个观察者慢会拖累所有人。异步版:

\`\`\`python
import asyncio
from typing import Coroutine

class AsyncSubject:
    def __init__(self) -> None:
        self._observers: list = []

    def attach(self, observer) -> None:
        self._observers.append(observer)

    async def notify(self, data):
        # 并发通知所有观察者,不互相阻塞
        tasks = [self._safe_call(o, data) for o in self._observers]
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _safe_call(self, observer, data):
        try:
            if asyncio.iscoroutinefunction(observer):
                await observer(data)
            else:
                observer(data)
        except Exception as e:
            print(f"观察者异常: {e}")

# 使用
async def slow_email(data):
    await asyncio.sleep(1)
    print(f"邮件: {data}")

def fast_log(data):
    print(f"日志: {data}")

async def main():
    s = AsyncSubject()
    s.attach(slow_email)
    s.attach(fast_log)
    await s.notify("price up")
    # 日志: price up(立即)
    # 邮件: price up(1秒后)

asyncio.run(main())
\`\`\`

### 5.4 函数式风格:回调即观察者

Python 中观察者不一定要是类,任何 callable 都行:

\`\`\`python
class SimpleEvent:
    def __init__(self):
        self._handlers: list[callable] = []

    def on(self, handler):
        self._handlers.append(handler)
        return handler  # 支持装饰器用法

    def emit(self, *args, **kwargs):
        for h in self._handlers:
            h(*args, **kwargs)

event = SimpleEvent()

@event.on
def handler1(data):
    print(f"h1: {data}")

event.on(lambda d: print(f"lambda: {d}"))

event.emit("test")
# h1: test
# lambda: test
\`\`\`

---

## 六、完整 Demo:股票价格提醒系统

下面是一个完整的股票价格提醒系统,包含多种观察者。

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional, Callable
from datetime import datetime
import logging
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

# ====== 1. Subject ======

@dataclass
class Stock:
    """股票,被观察者。

    持有价格,价格变化时通知所有观察者。
    """
    symbol: str
    _price: float = 0.0
    _observers: list["StockObserver"] = field(default_factory=list)

    def attach(self, observer: "StockObserver") -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: "StockObserver") -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    @property
    def price(self) -> float:
        return self._price

    @price.setter
    def price(self, value: float) -> None:
        old = self._price
        self._price = value
        if old != value:
            self._notify(old, value)

    def _notify(self, old: float, new: float) -> None:
        event = {
            "symbol": self.symbol,
            "old": old,
            "new": new,
            "change": new - old,
            "pct": (new - old) / old * 100 if old else 0,
            "time": datetime.now(),
        }
        for observer in list(self._observers):  # 复制防迭代中修改
            try:
                observer.update(event)
            except Exception as e:
                logger.error(f"观察者 {observer} 异常: {e}")

# ====== 2. Observer 抽象 ======

class StockObserver(ABC):
    """股票观察者抽象基类。"""
    def __init__(self, name: str) -> None:
        self.name = name

    @abstractmethod
    def update(self, event: dict) -> None:
        ...

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} {self.name}>"

# ====== 3. 具体观察者 ======

class EmailAlertObserver(StockObserver):
    """邮件提醒:涨跌超过阈值发邮件。"""
    def __init__(self, name: str, threshold_pct: float = 5.0,
                 email: str = "trader@example.com") -> None:
        super().__init__(name)
        self.threshold_pct = threshold_pct
        self.email = email

    def update(self, event: dict) -> None:
        if abs(event["pct"]) >= self.threshold_pct:
            self._send_email(event)

    def _send_email(self, event: dict) -> None:
        # 实际项目用 smtplib / SendGrid / 钉钉机器人
        msg = EmailMessage()
        msg["Subject"] = f"[股票提醒] {event['symbol']} {'涨' if event['change']>0 else '跌'} {abs(event['pct']):.2f}%"
        msg["To"] = self.email
        msg.set_content(
            f"股票 {event['symbol']} 价格变动\\n"
            f"旧价: {event['old']}\\n"
            f"新价: {event['new']}\\n"
            f"涨跌: {event['change']:+.2f} ({event['pct']:+.2f}%)\\n"
            f"时间: {event['time']}"
        )
        logger.info(f"[Email] 模拟发送给 {self.email}: {msg['Subject']}")
        # 真实发送:
        # with smtplib.SMTP("smtp.example.com") as s:
        #     s.send_message(msg)

class SMSAlertObserver(StockObserver):
    """短信提醒:大跌预警。"""
    def __init__(self, name: str, phone: str, drop_threshold: float = -3.0) -> None:
        super().__init__(name)
        self.phone = phone
        self.drop_threshold = drop_threshold  # 跌幅超此值发短信

    def update(self, event: dict) -> None:
        if event["pct"] <= self.drop_threshold:
            logger.info(
                f"[SMS] 发送 {self.phone}: {event['symbol']} 跌 {event['pct']:.2f}%"
            )

class LogObserver(StockObserver):
    """日志观察者:记录所有变动,用于审计。"""
    def update(self, event: dict) -> None:
        logger.info(
            f"[LOG] {event['time']} {event['symbol']} "
            f"{event['old']} -> {event['new']} ({event['pct']:+.2f}%)"
        )

class WebSocketPushObserver(StockObserver):
    """WebSocket 推送:实时推给前端。"""
    def __init__(self, name: str, clients: list[str]) -> None:
        super().__init__(name)
        self.clients = clients  # 模拟的 ws client id 列表

    def update(self, event: dict) -> None:
        # 实际用 websockets / Socket.IO 推 JSON
        payload = {
            "type": "price_update",
            "data": event,
        }
        for client in self.clients:
            logger.debug(f"[WS] push to {client}: {payload}")

class ThresholdObserver(StockObserver):
    """条件观察者:价格触及目标价时通知。"""
    def __init__(self, name: str, target_price: float,
                 direction: str = "up") -> None:
        super().__init__(name)
        self.target = target_price
        self.direction = direction  # "up" 或 "down"

    def update(self, event: dict) -> None:
        new = event["new"]
        if self.direction == "up" and new >= self.target:
            logger.info(f"[Threshold] {event['symbol']} 突破 {self.target}!")
        elif self.direction == "down" and new <= self.target:
            logger.info(f"[Threshold] {event['symbol']} 跌破 {self.target}!")

# ====== 4. 客户端 ======

def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    stock = Stock(symbol="AAPL", _price=150.0)

    # 注册各种观察者
    stock.attach(EmailAlertObserver("邮件提醒", threshold_pct=5.0))
    stock.attach(SMSAlertObserver("短信提醒", phone="13800000000", drop_threshold=-3.0))
    stock.attach(LogObserver("审计日志"))
    stock.attach(WebSocketPushObserver("WS推送", clients=["web-1", "mobile-2"]))
    stock.attach(ThresholdObserver("目标价160", target_price=160, direction="up"))

    # 模拟价格变化
    print("--- 价格小涨 1% ---")
    stock.price = 151.5  # +1%,只触发日志和 WS

    print("\\n--- 价格大跌 4% ---")
    stock.price = 145.44  # -4%,触发短信 + 日志 + WS

    print("\\n--- 价格大涨 6% ---")
    stock.price = 154.16  # +6%,触发邮件 + 日志 + WS

    print("\\n--- 价格突破 160 ---")
    stock.price = 162.0  # 触发阈值 + 邮件 + 日志 + WS

if __name__ == "__main__":
    main()
\`\`\`

---

## 七、观察者 vs 发布订阅

这两个模式极其相似,但有关键区别:有无中间 broker。

### 7.1 架构对比

\`\`\`
【观察者模式】                【发布订阅模式】
  Subject ──▶ Observer         Publisher ──▶ Broker ──▶ Subscriber
  (直接耦合)                    (完全解耦,通过中间件)
\`\`\`

### 7.2 详细对比

| 维度 | 观察者模式 | 发布订阅模式 |
|------|-----------|--------------|
| **耦合** | Subject 知道 Observer(直接调) | Publisher/Subscriber 互不知道 |
| **中间件** | 无 | 有(EventBus / Message Queue) |
| **同异步** | 通常同步 | 通常异步 |
| **跨进程** | 否(同进程) | 是(可跨进程跨机器) |
| **典型实现** | Java Listener、Python 信号 | Kafka、RabbitMQ、Redis Pub/Sub |
| **过滤** | Subject 决定通知谁 | Broker 按 topic 路由 |
| **可靠性** | Observer 异常会传染 | Broker 可重试、持久化 |

### 7.3 代码对比

\`\`\`python
from typing import Callable
# 观察者:Subject 直接持有 Observer
class Subject:
    def notify(self):
        for o in self._observers:
            o.update(self)  # 直接调用

# 发布订阅:通过中间 Broker
class EventBus:
    def __init__(self):
        self._subscribers: dict[str, list[Callable]] = {}

    def subscribe(self, topic: str, handler: Callable):
        self._subscribers.setdefault(topic, []).append(handler)

    def publish(self, topic: str, data):
        for h in self._subscribers.get(topic, []):
            h(data)

bus = EventBus()
bus.subscribe("price_changed", lambda d: print(f"订阅者1: {d}"))
bus.subscribe("price_changed", lambda d: print(f"订阅者2: {d}"))
bus.publish("price_changed", {"symbol": "AAPL", "price": 200})
\`\`\`

---

## 八、高级话题

### 8.1 防止通知风暴

如果 notify 内部又会改 state,会无限递归:

\`\`\`python
class BadObserver(Observer):
    def update(self, subject):
        subject.state += 1  # 又改 state → 又 notify → 死循环
\`\`\`

解法:
1. 加 \`_notifying\` 标志,递归时跳过
2. 用队列:notify 把事件入队,异步处理
3. 设计上禁止观察者修改 Subject

\`\`\`python
class SafeSubject(Subject):
    def __init__(self):
        super().__init__()
        self._notifying = False

    def notify(self):
        if self._notifying:
            return  # 防重入
        self._notifying = True
        try:
            super().notify()
        finally:
            self._notifying = False
\`\`\`

### 8.2 观察者顺序问题

观察者通知顺序通常是 attach 顺序,但业务不应依赖顺序。如果必须有顺序(比如日志要在最后),用优先级:

\`\`\`python
import heapq

class PrioritySubject:
    def __init__(self):
        self._observers: list[tuple[int, int, Observer]] = []
        self._counter = 0

    def attach(self, observer, priority=0):
        self._counter += 1
        heapq.heappush(self._observers, (priority, self._counter, observer))

    def notify(self):
        for _, _, o in sorted(self._observers):
            o.update(self)
\`\`\`

### 8.3 与 asyncio.Queue 结合做事件流

生产环境常用 asyncio.Queue 做异步事件流:

\`\`\`python
import asyncio

class AsyncEventBus:
    def __init__(self):
        self._queues: dict[str, list[asyncio.Queue]] = {}

    def subscribe(self, topic: str) -> asyncio.Queue:
        q = asyncio.Queue()
        self._queues.setdefault(topic, []).append(q)
        return q

    async def publish(self, topic: str, data):
        for q in self._queues.get(topic, []):
            await q.put(data)

async def consumer(name, q):
    while True:
        data = await q.get()
        print(f"{name}: {data}")
        q.task_done()

async def main():
    bus = AsyncEventBus()
    q1 = bus.subscribe("news")
    q2 = bus.subscribe("news")
    asyncio.create_task(consumer("c1", q1))
    asyncio.create_task(consumer("c2", q2))
    await bus.publish("news", "hello")
    await asyncio.sleep(0.1)

asyncio.run(main())
\`\`\`

---

## 九、易错点小结

| # | 易错点 | 后果 | 正确做法 |
|---|--------|------|----------|
| 1 | 观察者没 detach 就销毁 | 内存泄漏 | 用弱引用,或显式 detach |
| 2 | notify 中迭代 _observers 同时修改 | ConcurrentModification | 迭代 \`list(self._observers)\` 副本 |
| 3 | 观察者抛异常不捕获 | 整条链断裂 | try/except 包住每个 update |
| 4 | 观察者在 update 中改 Subject state | 无限递归 | 加重入保护或设计禁止 |
| 5 | 推模式推了 Observer 不需要的数据 | 性能浪费 | 改拉模式或精细化事件 |
| 6 | 同步 notify 阻塞 Subject | 慢观察者拖累全部 | 用异步或线程池 |
| 7 | 依赖通知顺序 | 业务脆弱 | 用优先级或不依赖顺序 |
| 8 | Subject 销毁没通知观察者 | 悬空引用 | 提供 dispose 方法 |
| 9 | 把观察者当回调滥用 | 系统难追踪 | 控制观察者数量,文档化 |
| 10 | 跨线程通知没加锁 | 数据竞争 | 加锁或用线程安全队列 |

---

## 十、本章总结

观察者模式的本质是**「一对多的松耦合通信」**:

1. **抽象**:Observer 接口只声明 \`update\`
2. **解耦**:Subject 不关心观察者是谁
3. **广播**:一次状态变化,多方响应
4. **灵活**:运行时增删观察者

掌握推/拉模式、弱引用防泄漏、异步通知这三点,基本能在生产环境用好观察者模式。Python 的 \`logging\`、\`asyncio\`、\`PyQt\` 信号槽都基于此模式,值得深入源码学习。
`,
  },
  {
    id: "pyarch-dp-command",
    icon: "📨",
    title: "命令模式(Command)",
    group: "设计模式 · 行为型",
    content: `# 命令模式(Command)

## 一、命令模式定义

命令模式(Command Pattern)是一种行为型设计模式,定义如下:

> 将一个请求封装为一个对象,从而让你可以用不同的请求对客户进行参数化;对请求排队或记录请求日志,以及支持撤销操作。

用一句话概括:**「把『动作』变成对象」**。

### 1.1 经典 UML 类图

\`\`\`
   ┌──────────────┐  invokes    ┌──────────────────┐  executes   ┌──────────────┐
   │   Invoker    │ ──────────▶ │    Command       │ ──────────▶ │   Receiver   │
   ├──────────────┤             │ <<interface>>    │             ├──────────────┤
   │ - commands   │             ├──────────────────┤             │ action()     │
   ├──────────────┤             │ + execute()      │             └──────────────┘
   │ + setCmd(c)  │             │ + undo()         │                    ▲
   │ + run()      │             └────────┬─────────┘                    │
   └──────────────┘                      │ inherits                    │
                                         ▼                              │
                          ┌──────────────────────────────┐              │
                          │     ConcreteCommand          │  holds ref   │
                          ├──────────────────────────────├──────────────┘
                          │ - receiver: Receiver         │
                          │ - state: 备忘录              │
                          ├──────────────────────────────┤
                          │ + execute()                  │
                          │ + undo()                     │
                          └──────────────────────────────┘

   ┌──────────────┐
   │   Client     │  创建 Command,装配 Receiver
   └──────────────┘
\`\`\`

### 1.2 五个角色

| 角色 | 职责 | 类比 |
|------|------|------|
| **Command** | 命令接口,声明 execute/undo | 点餐单 |
| **ConcreteCommand** | 具体命令,持有 Receiver | 「来份宫保鸡丁」单子 |
| **Receiver** | 实际执行者 | 厨师 |
| **Invoker** | 调用命令的发起者 | 服务员 |
| **Client** | 装配 Command 和 Receiver | 顾客 |

### 1.3 最简代码骨架

\`\`\`python
from abc import ABC, abstractmethod
from typing import Any

class Command(ABC):
    @abstractmethod
    def execute(self) -> Any:
        ...

class Receiver:
    """实际干活的人。"""
    def action(self, msg: str) -> str:
        print(f"Receiver 执行: {msg}")
        return f"done: {msg}"

class ConcreteCommand(Command):
    def __init__(self, receiver: Receiver, msg: str) -> None:
        self.receiver = receiver
        self.msg = msg

    def execute(self) -> Any:
        return self.receiver.action(self.msg)

class Invoker:
    def __init__(self) -> None:
        self._command: Command | None = None

    def set_command(self, cmd: Command) -> None:
        self._command = cmd

    def run(self) -> Any:
        if self._command:
            return self._command.execute()

# 使用
receiver = Receiver()
cmd = ConcreteCommand(receiver, "hello")
invoker = Invoker()
invoker.set_command(cmd)
invoker.run()  # Receiver 执行: hello
\`\`\`

---

## 二、直觉理解:为什么需要命令模式

### 2.1 痛点:动作无法「保存」

假设你在做一个 GUI 编辑器,有点击按钮「复制」「粘贴」「删除」的功能。最直接的写法:

\`\`\`python
class Button:
    def __init__(self, label):
        self.label = label

    def click(self):
        if self.label == "复制":
            editor.copy()
        elif self.label == "粘贴":
            editor.paste()
        elif self.label == "删除":
            editor.delete()
\`\`\`

问题:
1. **Button 类耦合了 Editor** 的所有方法
2. **无法撤销** —— click 完就完了,没保存「我做了什么」
3. **无法排队** —— 想把多个操作排队执行做不到
4. **无法记录日志** —— 想审计谁点了什么按钮做不到
5. **无法宏** —— 想把「复制+粘贴」打包成一个操作做不到

### 2.2 命令模式的解法

把每个动作封装成对象:

\`\`\`python
class CopyCommand(Command):
    def __init__(self, editor):
        self.editor = editor
        self.backup = None  # 用于 undo

    def execute(self):
        self.backup = self.editor.selection  # 备份
        self.editor.copy()

    def undo(self):
        # copy 是只读的,undo 其实没影响,但保留接口
        pass

button = Button()
button.command = CopyCommand(editor)
button.click()  # 内部调 command.execute()
\`\`\`

现在:
- Button 不认识 Editor,只调 \`command.execute()\`
- 每个 command 自带 \`undo()\`,可撤销
- command 是对象,可入队、可记录日志、可组合成宏

### 2.3 类比:餐厅点餐

命令模式最经典的类比是餐厅:

- **顾客(Client)**:想吃饭,下单
- **订单(Command)**:写着「宫保鸡丁,微辣」
- **服务员(Invoker)**:接订单,递给厨房,不关心菜怎么做
- **厨师(Receiver)**:看订单做菜
- **订单可排队**:多个订单排队执行
- **订单可撤销**:顾客取消订单
- **订单可记账**:晚上统计卖了多少菜

订单是「动作的对象化」,这正是命令模式的核心。

---

## 三、应用场景

### 3.1 GUI 按钮/菜单
每个按钮绑定一个 Command,点击即 execute。

### 3.2 宏命令
把多个命令组合成一个,一键执行多步操作(Photoshop 动作、Excel 宏)。

### 3.3 事务
数据库事务:一组操作要么全成功要么全回滚。每个操作是 Command,失败时 undo。

### 3.4 任务队列
Celery 任务、消息队列消费者,每个任务是一个 Command 对象。

### 3.5 撤销重做(Undo/Redo)
编辑器、绘图软件的撤销栈,核心就是 Command 的 undo。

### 3.6 操作日志/审计
每个 Command execute 时记录日志,可重放恢复状态。

### 3.7 远程调用
RPC 把方法调用序列化成 Command 对象传输,接收端执行。

### 3.8 游戏输入
游戏手柄按键映射成 Command,玩家可自定义键位。

---

## 四、Python 实战

### 4.1 经典实现:Command + Invoker + Receiver

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

class Command(ABC):
    """命令抽象基类。

    设计要点:
    - execute 执行
    - undo 撤销(可选,不支持撤销的命令抛 NotImplementedError)
    """
    @abstractmethod
    def execute(self) -> Any:
        ...

    def undo(self) -> Any:
        raise NotImplementedError(f"{self.__class__.__name__} 不支持撤销")

class Receiver:
    """实际执行者。命令模式不要求 Receiver 必须是某个基类。"""
    pass
\`\`\`

### 4.2 用闭包/lambda 简化

Python 函数是一等公民,简单命令不需要类:

\`\`\`python
from typing import Callable, Optional

class LambdaCommand:
    """用闭包包装的轻量命令。"""
    def __init__(self, execute_fn: Callable, undo_fn: Optional[Callable] = None):
        self._execute = execute_fn
        self._undo = undo_fn

    def execute(self):
        return self._execute()

    def undo(self):
        if self._undo:
            return self._undo()
        raise NotImplementedError("无 undo")

# 使用
counter = {"value": 0}
cmd = LambdaCommand(
    execute_fn=lambda: counter.__setitem__("value", counter["value"] + 1) or counter["value"],
    undo_fn=lambda: counter.__setitem__("value", counter["value"] - 1) or counter["value"],
)
cmd.execute()  # 1
cmd.execute()  # 2
cmd.undo()     # 1
\`\`\`

### 4.3 宏命令(组合)

把多个命令组合成一个:

\`\`\`python
class MacroCommand(Command):
    """宏命令:顺序执行多个子命令。"""
    def __init__(self, commands: list[Command]):
        self._commands = commands

    def execute(self):
        results = []
        for cmd in self._commands:
            results.append(cmd.execute())
        return results

    def undo(self):
        # 注意:undo 要逆序
        for cmd in reversed(self._commands):
            try:
                cmd.undo()
            except NotImplementedError:
                logger.warning(f"{cmd} 不支持 undo,跳过")
\`\`\`

### 4.4 命令历史栈(撤销重做)

\`\`\`python
class CommandHistory:
    """命令历史,支持撤销重做。

    - undo_stack:已执行,可撤销
    - redo_stack:已撤销,可重做
    """
    def __init__(self, max_size: int = 100):
        self._undo_stack: list[Command] = []
        self._redo_stack: list[Command] = []
        self.max_size = max_size

    def execute(self, cmd: Command):
        result = cmd.execute()
        self._undo_stack.append(cmd)
        # 新执行清空 redo 栈
        self._redo_stack.clear()
        # 限制大小
        if len(self._undo_stack) > self.max_size:
            self._undo_stack.pop(0)
        return result

    def undo(self):
        if not self._undo_stack:
            return None
        cmd = self._undo_stack.pop()
        cmd.undo()
        self._redo_stack.append(cmd)
        return cmd

    def redo(self):
        if not self._redo_stack:
            return None
        cmd = self._redo_stack.pop()
        cmd.execute()
        self._undo_stack.append(cmd)
        return cmd

    def can_undo(self) -> bool:
        return bool(self._undo_stack)

    def can_redo(self) -> bool:
        return bool(self._redo_stack)
\`\`\`

---

## 五、完整 Demo:文本编辑器

下面是一个支持撤销重做的文本编辑器。

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# ====== 1. Receiver: 文本编辑器 ======

class TextEditor:
    """文本编辑器,Receiver 角色。

    维护文本内容和光标位置。
    """
    def __init__(self, initial: str = ""):
        self._text = initial
        self._cursor = len(initial)

    @property
    def text(self) -> str:
        return self._text

    @property
    def cursor(self) -> int:
        return self._cursor

    def insert(self, text: str, pos: Optional[int] = None) -> None:
        """在 pos 位置插入 text。"""
        if pos is None:
            pos = self._cursor
        self._text = self._text[:pos] + text + self._text[pos:]
        self._cursor = pos + len(text)
        logger.debug(f"insert '{text}' at {pos}, now: {self._text!r}")

    def delete(self, length: int, pos: Optional[int] = None) -> str:
        """从 pos 删除 length 个字符,返回被删的文本。"""
        if pos is None:
            pos = self._cursor - length
            if pos < 0:
                pos = 0
                length = self._cursor
        deleted = self._text[pos:pos+length]
        self._text = self._text[:pos] + self._text[pos+length:]
        self._cursor = pos
        logger.debug(f"delete {length} at {pos} ('{deleted}'), now: {self._text!r}")
        return deleted

    def __repr__(self) -> str:
        return f"TextEditor({self._text!r})"

# ====== 2. Command 抽象 ======

class EditorCommand(ABC):
    @abstractmethod
    def execute(self) -> None:
        ...

    @abstractmethod
    def undo(self) -> None:
        ...

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}>"

# ====== 3. 具体命令 ======

@dataclass
class InsertCommand(EditorCommand):
    """插入文本命令。"""
    editor: TextEditor
    text: str
    pos: Optional[int] = None
    _executed_pos: int = 0  # 记录实际插入位置,供 undo 用

    def execute(self) -> None:
        actual_pos = self.pos if self.pos is not None else self.editor.cursor
        self._executed_pos = actual_pos
        self.editor.insert(self.text, actual_pos)

    def undo(self) -> None:
        # 撤销插入 = 删除刚插入的文本
        self.editor.delete(len(self.text), self._executed_pos)

@dataclass
class DeleteCommand(EditorCommand):
    """删除文本命令。"""
    editor: TextEditor
    length: int
    pos: Optional[int] = None
    _deleted_text: str = ""  # 备份被删文本,供 undo 用
    _executed_pos: int = 0

    def execute(self) -> None:
        actual_pos = self.pos
        self._deleted_text = self.editor.delete(self.length, actual_pos)
        self._executed_pos = self.editor.cursor

    def undo(self) -> None:
        # 撤销删除 = 把删掉的文本插回去
        self.editor.insert(self._deleted_text, self._executed_pos)

@dataclass
class ReplaceCommand(EditorCommand):
    """替换命令 = 删除 + 插入(组合)。"""
    editor: TextEditor
    old_length: int
    new_text: str
    pos: Optional[int] = None
    _deleted_text: str = ""
    _executed_pos: int = 0

    def execute(self) -> None:
        actual_pos = self.pos if self.pos is not None else self.editor.cursor
        self._executed_pos = actual_pos
        self._deleted_text = self.editor.delete(self.old_length, actual_pos)
        self.editor.insert(self.new_text, actual_pos)

    def undo(self) -> None:
        # 先删掉新文本,再插回旧文本
        self.editor.delete(len(self.new_text), self._executed_pos)
        self.editor.insert(self._deleted_text, self._executed_pos)

# ====== 4. Invoker: 命令历史 ======

class EditorInvoker:
    """编辑器调用者,管理命令历史。"""
    def __init__(self, editor: TextEditor, max_history: int = 1000):
        self.editor = editor
        self._undo_stack: list[EditorCommand] = []
        self._redo_stack: list[EditorCommand] = []
        self.max_history = max_history

    def execute(self, cmd: EditorCommand) -> None:
        cmd.execute()
        self._undo_stack.append(cmd)
        self._redo_stack.clear()
        if len(self._undo_stack) > self.max_history:
            self._undo_stack.pop(0)
        logger.info(f"执行 {cmd}, 文本: {self.editor.text!r}")

    def undo(self) -> Optional[EditorCommand]:
        if not self._undo_stack:
            logger.info("无可撤销")
            return None
        cmd = self._undo_stack.pop()
        cmd.undo()
        self._redo_stack.append(cmd)
        logger.info(f"撤销 {cmd}, 文本: {self.editor.text!r}")
        return cmd

    def redo(self) -> Optional[EditorCommand]:
        if not self._redo_stack:
            logger.info("无可重做")
            return None
        cmd = self._redo_stack.pop()
        cmd.execute()
        self._undo_stack.append(cmd)
        logger.info(f"重做 {cmd}, 文本: {self.editor.text!r}")
        return cmd

    @property
    def can_undo(self) -> bool:
        return bool(self._undo_stack)

    @property
    def can_redo(self) -> bool:
        return bool(self._redo_stack)

# ====== 5. 客户端演示 ======

def main():
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    editor = TextEditor()
    invoker = EditorInvoker(editor)

    # 输入 "Hello"
    invoker.execute(InsertCommand(editor, "Hello"))
    # 输入 " World"
    invoker.execute(InsertCommand(editor, " World"))
    print(f"当前文本: {editor.text!r}")  # 'Hello World'

    # 撤销一次
    invoker.undo()  # 撤销 ' World'
    print(f"撤销后: {editor.text!r}")  # 'Hello'

    # 重做
    invoker.redo()
    print(f"重做后: {editor.text!r}")  # 'Hello World'

    # 删除 5 个字符
    invoker.execute(DeleteCommand(editor, length=5, pos=6))  # 删 'World'
    print(f"删除后: {editor.text!r}")  # 'Hello '

    # 撤销删除
    invoker.undo()
    print(f"撤销删除: {editor.text!r}")  # 'Hello World'

    # 替换
    invoker.execute(ReplaceCommand(editor, old_length=5, new_text="Python", pos=6))
    print(f"替换后: {editor.text!r}")  # 'Hello Python'

    # 多次撤销
    while invoker.can_undo:
        invoker.undo()
    print(f"全部撤销: {editor.text!r}")  # ''

if __name__ == "__main__":
    main()
\`\`\`

运行结果:

\`\`\`
执行 <InsertCommand>, 文本: 'Hello'
执行 <InsertCommand>, 文本: 'Hello World'
当前文本: 'Hello World'
撤销 <InsertCommand>, 文本: 'Hello'
重做 <InsertCommand>, 文本: 'Hello World'
执行 <DeleteCommand>, 文本: 'Hello '
撤销 <DeleteCommand>, 文本: 'Hello World'
执行 <ReplaceCommand>, 文本: 'Hello Python'
撤销 <ReplaceCommand>, 文本: 'Hello World'
撤销 <InsertCommand>, 文本: 'Hello'
撤销 <InsertCommand>, 文本: ''
全部撤销: ''
\`\`\`

---

## 六、命令 vs 策略

命令模式和策略模式结构很像(都是「接口 + 具体实现 + 调用方持有」),但目的不同。

### 6.1 核心区别

| 维度 | 命令模式 | 策略模式 |
|------|----------|----------|
| **核心目的** | 封装请求,支持撤销/排队/日志 | 算法可替换 |
| **生命周期** | 一次性的,执行完可保留 | 长期持有,反复使用 |
| **是否关心执行结果** | 是 | 是 |
| **是否关心撤销** | 是(核心特性) | 否 |
| **是否可入队** | 是 | 一般不 |
| **是否可组合(宏)** | 是 | 否 |
| **调用方关系** | Invoker 触发,不关心何时执行 | Context 直接调 |
| **典型场景** | 撤销重做、任务队列、宏 | 折扣、排序、支付 |

### 6.2 通俗类比

- **命令**:你写了一张订单,服务员拿去厨房。订单是对象,可以排队、取消、记账
- **策略**:你选了一种支付方式(支付宝/微信)。支付方式是策略,选完就用,不存在「撤销」

### 6.3 代码对比

\`\`\`python
# 命令:有 undo,可入队
class CopyCommand(Command):
    def execute(self): ...
    def undo(self): ...  # 命令特有

history = CommandHistory()
history.execute(CopyCommand(editor))
history.undo()

# 策略:无 undo,直接替换
order = Order(price=100, discount=PercentageDiscount(0.8))
order.discount = NormalDiscount()  # 切换,不关心之前
\`\`\`

---

## 七、高级话题

### 7.1 命令序列化与重放

命令可序列化保存,用于崩溃恢复或重放:

\`\`\`python
from dataclasses import dataclass
import json
import pickle

@dataclass
class SerializableInsertCommand(EditorCommand):
    editor: TextEditor
    text: str
    pos: Optional[int] = None

    def execute(self): ...
    def undo(self): ...

    def to_dict(self) -> dict:
        return {"type": "insert", "text": self.text, "pos": self.pos}

    @classmethod
    def from_dict(cls, data: dict, editor: TextEditor):
        return cls(editor=editor, text=data["text"], pos=data["pos"])

# 保存历史
history_data = [cmd.to_dict() for cmd in invoker._undo_stack]
with open("history.json", "w") as f:
    json.dump(history_data, f)

# 重放恢复
with open("history.json") as f:
    data = json.load(f)
new_editor = TextEditor()
for item in data:
    if item["type"] == "insert":
        SerializableInsertCommand.from_dict(item, new_editor).execute()
\`\`\`

### 7.2 命令与异步任务

命令天然适配异步任务队列:

\`\`\`python
from abc import abstractmethod
from abc import ABC
import asyncio
from typing import Awaitable

class AsyncCommand(ABC):
    @abstractmethod
    async def execute(self) -> Any:
        ...

class AsyncTaskQueue:
    def __init__(self, workers: int = 4):
        self._queue: asyncio.Queue[AsyncCommand] = asyncio.Queue()
        self._workers = workers

    async def submit(self, cmd: AsyncCommand):
        await self._queue.put(cmd)

    async def _worker(self, name: str):
        while True:
            cmd = await self._queue.get()
            try:
                await cmd.execute()
            except Exception as e:
                logger.error(f"worker {name} 执行失败: {e}")
            finally:
                self._queue.task_done()

    async def start(self):
        tasks = [asyncio.create_task(self._worker(f"w{i}"))
                 for i in range(self._workers)]
        return tasks
\`\`\`

### 7.3 命令与事务

数据库事务的回滚本质是命令 undo:

\`\`\`python
class Transaction:
    def __init__(self):
        self._commands: list[Command] = []
        self._executed: list[Command] = []

    def add(self, cmd: Command):
        self._commands.append(cmd)

    def commit(self):
        try:
            for cmd in self._commands:
                cmd.execute()
                self._executed.append(cmd)
        except Exception as e:
            # 失败回滚:已执行的逆序 undo
            for cmd in reversed(self._executed):
                try:
                    cmd.undo()
                except Exception:
                    pass
            raise
\`\`\`

---

## 八、易错点小结

| # | 易错点 | 后果 | 正确做法 |
|---|--------|------|----------|
| 1 | undo 忘记备份执行前的状态 | 无法撤销 | execute 时保存备份 |
| 2 | undo/redo 栈管理混乱 | 撤销重做错乱 | 严格执行清空 redo 时机 |
| 3 | 命令持有 Receiver 强引用不释放 | 内存泄漏 | 命令生命周期结束即释放 |
| 4 | 命令 execute 有副作用且不可逆 | 无法 undo | 设计上保证可逆 |
| 5 | 宏命令 undo 顺序写错 | 状态错乱 | 宏 undo 必须逆序 |
| 6 | 命令在多线程下共享状态 | 数据竞争 | 命令设计成不可变或加锁 |
| 7 | 命令历史无限增长 | 内存爆炸 | 设 max_size,旧的下标丢弃 |
| 8 | 命令直接调用 Receiver 多个方法 | 命令职责不清 | 一个命令一个原子操作 |
| 9 | 把简单操作也封装成命令 | 过度设计 | 只在需要撤销/排队时用 |
| 10 | redo 没清空 redo 栈 | redo 执行旧命令 | 新 execute 必清 redo 栈 |

---

## 九、本章总结

命令模式的本质是**「请求的对象化」**:

1. **封装**:把动作、参数、Receiver 打包成对象
2. **解耦**:Invoker 不认识 Receiver,只调 execute
3. **可撤销**:每个命令自带 undo
4. **可排队**:命令对象可入队,异步执行
5. **可组合**:宏命令组合多个原子命令

撤销重做是命令模式最经典的应用,文本编辑器、绘图软件、IDE 的 Ctrl+Z 都靠它。掌握命令模式后,你会对「操作日志」「事务回滚」「任务队列」有更深的理解。
`,
  },
  {
    id: "pyarch-dp-template-method",
    icon: "📐",
    title: "模板方法模式(Template Method)",
    group: "设计模式 · 行为型",
    content: `# 模板方法模式(Template Method)

## 一、模板方法模式定义

模板方法模式(Template Method Pattern)是一种行为型设计模式,定义如下:

> 定义一个操作中算法的骨架,而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。

用一句话概括:**「父类定流程,子类填细节」**。

### 1.1 经典 UML 类图

\`\`\`
   ┌──────────────────────────────────┐
   │       AbstractClass              │
   ├──────────────────────────────────┤
   │ + template_method()   [final]    │  ← 算法骨架,不可重写
   │ # primitive_op_1()   [abstract]  │  ← 子类必须实现
   │ # primitive_op_2()   [abstract]  │
   │ # hook()              [optional] │  ← 钩子,子类可选重写
   └──────────────┬───────────────────┘
                  │ extends
                  ▼
   ┌──────────────────────────────────┐
   │       ConcreteClass              │
   ├──────────────────────────────────┤
   │ # primitive_op_1()  [实现]        │
   │ # primitive_op_2()  [实现]        │
   │ # hook()            [可选重写]    │
   └──────────────────────────────────┘

   template_method() 内部调用 primitive_op_1() / primitive_op_2() / hook()
\`\`\`

### 1.2 两个核心概念

| 概念 | 说明 | Python 实现 |
|------|------|-------------|
| **模板方法** | 定义算法骨架的方法,通常不可重写 | 普通方法,约定不 override |
| **基本方法** | 骨架中的各步骤,分三类 | 见下表 |

基本方法三类:

| 类型 | 说明 | Python |
|------|------|--------|
| **抽象方法** | 子类必须实现 | \`@abstractmethod\` |
| **具体方法** | 父类已实现,子类可用可重写 | 普通方法 |
| **钩子方法** | 父类给默认空实现,子类可选重写 | 默认 \`pass\` 或返回默认值 |

### 1.3 最简代码骨架

\`\`\`python
from abc import ABC, abstractmethod

class AbstractClass(ABC):
    """抽象类,定义模板。"""

    def template_method(self) -> None:
        """模板方法:定义算法骨架。

        注意:这个方法不应该是 abstract,且约定子类不重写。
        Python 没有 final 关键字,靠约定。
        """
        self.step_1()
        self.step_2()
        if self.hook():  # 钩子控制流程
            self.step_3()

    @abstractmethod
    def step_1(self) -> None:
        """抽象步骤,子类必须实现。"""
        ...

    @abstractmethod
    def step_2(self) -> None:
        ...

    def step_3(self) -> None:
        """具体步骤,子类可重写。"""
        print("AbstractClass.step_3 默认实现")

    def hook(self) -> bool:
        """钩子,默认返回 True,子类可重写控制流程。"""
        return True

class ConcreteClass(AbstractClass):
    def step_1(self) -> None:
        print("ConcreteClass.step_1")

    def step_2(self) -> None:
        print("ConcreteClass.step_2")

    # 不重写 step_3,用父类默认
    # 不重写 hook,默认 True

# 使用
obj = ConcreteClass()
obj.template_method()
# ConcreteClass.step_1
# ConcreteClass.step_2
# AbstractClass.step_3 默认实现
\`\`\`

---

## 二、直觉理解:为什么需要模板方法

### 2.1 痛点:重复的流程骨架

假设你在写一个数据导入框架,支持 CSV、JSON、XML 三种格式。流程都是:

1. 读取文件
2. 解析成记录列表
3. 校验每条记录
4. 转换数据
5. 持久化到数据库

如果不复用,你会写三份几乎一样的代码:

\`\`\`python
class CSVImporter:
    def import_file(self, path):
        raw = self.read_file(path)
        records = self.parse_csv(raw)
        for r in records:
            if not self.validate(r):
                continue
            transformed = self.transform(r)
            self.persist(transformed)

class JSONImporter:
    def import_file(self, path):
        raw = self.read_file(path)
        records = self.parse_json(raw)
        for r in records:
            if not self.validate(r):
                continue
            transformed = self.transform(r)
            self.persist(transformed)

class XMLImporter:
    def import_file(self, path):
        raw = self.read_file(path)
        records = self.parse_xml(raw)
        for r in records:
            if not self.validate(r):
                continue
            transformed = self.transform(r)
            self.persist(transformed)
\`\`\`

问题:
1. **大量重复**:\`import_file\` 的骨架在三份代码里几乎一样
2. **修改难**:流程要加一步「去重」,要改三处
3. **不一致风险**:三处流程可能演化得不一样,产生 bug
4. **新人难上手**:不知道标准流程长什么样

### 2.2 模板方法的解法

把流程骨架抽到父类,子类只填差异化的步骤:

\`\`\`python
from abc import abstractmethod
from abc import ABC
class DataImporter(ABC):
    def import_file(self, path):  # 模板方法
        raw = self.read_file(path)
        records = self.parse(raw)  # 抽象,子类实现
        for r in records:
            if not self.validate(r):
                self.on_invalid(r)
                continue
            transformed = self.transform(r)
            self.persist(transformed)

    def read_file(self, path):  # 具体方法,共用
        with open(path) as f:
            return f.read()

    @abstractmethod
    def parse(self, raw):  # 抽象,子类必须实现
        ...

    def validate(self, r):  # 具体方法,可重写
        return True

    def transform(self, r):  # 具体方法,可重写
        return r

    def persist(self, r):  # 具体方法,可重写
        ...

    def on_invalid(self, r):  # 钩子
        pass

class CSVImporter(DataImporter):
    def parse(self, raw):
        import csv, io
        return list(csv.DictReader(io.StringIO(raw)))

class JSONImporter(DataImporter):
    def parse(self, raw):
        import json
        return json.loads(raw)
\`\`\`

现在:
- 流程骨架只一份,改一处全生效
- 子类只关心「怎么解析」,代码量从 30 行降到 3 行
- 新加 XML 格式,只写一个 \`XMLImporter\` 类即可

### 2.3 类比:做菜模板

模板方法最贴切的类比是菜谱:

> 麻婆豆腐做法:
> 1. 备料:豆腐、肉末、豆瓣酱 ← 步骤固定,配料可变
> 2. 焯水:豆腐切块下锅 ← 步骤固定
> 3. 炒香:肉末 + 豆瓣酱 ← 步骤固定
> 4. 烧制:加水 + 豆腐 + 调料 ← 调料可变(盐/糖/花椒粉)
> 5. 勾芡:水淀粉 ← 步骤固定
> 6. 装盘:撒葱花 ← 钩子,可省略

菜谱是「模板方法」,每一步的具体配料(豆腐嫩不嫩、豆瓣酱放多少)是「基本方法」。换一道菜(水煮鱼),菜谱骨架不变,但每步的实现变了。

---

## 三、应用场景

### 3.1 框架钩子
Django 的 \`get_object_or_404\`、\`dispatch\` 方法;Flask 的 \`before_request\` / \`after_request\`。

### 3.2 生命周期方法
React 的 \`componentDidMount\` / \`componentWillUnmount\`;Android Activity 的 \`onCreate\` / \`onPause\`。

### 3.3 数据处理流水线
ETL 工具:Extract → Transform → Load,每步可定制。

### 3.4 算法骨架
排序算法的骨架(分治、比较、合并),具体比较函数可定制。

### 3.5 测试框架
unittest 的 \`setUp\` / \`test_*\` / \`tearDown\` 是典型模板方法。

### 3.6 报表生成
报表流程:取数 → 计算 → 格式化 → 输出,每步可定制。

### 3.7 爬虫框架
Scrapy 的爬虫流程:start_requests → parse → pipeline,模板方法。

### 3.8 数据库迁移
Alembic 的 \`upgrade\` / \`downgrade\`,框架调,用户填。

---

## 四、Python 实战

### 4.1 用 abc.ABC + @abstractmethod

\`\`\`python
from abc import ABC, abstractmethod
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

class DataImporter(ABC):
    """数据导入框架,模板方法模式。

    流程:
    1. read_file: 读取文件
    2. parse: 解析成记录列表 [抽象]
    3. validate: 校验
    4. transform: 转换
    5. persist: 持久化 [抽象]
    钩子:
    - on_invalid: 校验失败回调
    - before_import / after_import: 前后置钩子
    """

    def import_file(self, path: str) -> int:
        """模板方法:定义导入流程。返回导入条数。"""
        self.before_import(path)
        raw = self.read_file(path)
        records = self.parse(raw)
        count = 0
        for r in records:
            if not self.validate(r):
                self.on_invalid(r)
                continue
            transformed = self.transform(r)
            self.persist(transformed)
            count += 1
        self.after_import(path, count)
        return count

    # ===== 模板方法调用的步骤 =====

    def read_file(self, path: str) -> str:
        """具体方法:读取文件。子类可重写以支持远程文件。"""
        logger.debug(f"读取文件: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    @abstractmethod
    def parse(self, raw: str) -> list[dict]:
        """抽象方法:解析原始文本为记录列表。子类必须实现。"""
        ...

    def validate(self, record: dict) -> bool:
        """具体方法:默认校验通过。子类可重写。"""
        return True

    def transform(self, record: dict) -> dict:
        """具体方法:默认不转换。子类可重写。"""
        return record

    @abstractmethod
    def persist(self, record: dict) -> None:
        """抽象方法:持久化记录。子类必须实现。"""
        ...

    # ===== 钩子方法 =====

    def before_import(self, path: str) -> None:
        """钩子:导入前调用。默认空。"""
        pass

    def after_import(self, path: str, count: int) -> None:
        """钩子:导入后调用。默认空。"""
        pass

    def on_invalid(self, record: dict) -> None:
        """钩子:校验失败时调用。默认记日志。"""
        logger.warning(f"无效记录: {record}")
\`\`\`

### 4.2 钩子方法的作用

钩子让子类可以「插入」逻辑而不重写整个模板:

\`\`\`python
class LoggedCSVImporter(DataImporter):
    """带详细日志的 CSV 导入器。"""

    def parse(self, raw: str) -> list[dict]:
        import csv, io
        return list(csv.DictReader(io.StringIO(raw)))

    def persist(self, record: dict) -> None:
        # 模拟持久化
        pass

    # 重写钩子,加日志
    def before_import(self, path: str) -> None:
        logger.info(f"开始导入 {path}")

    def after_import(self, path: str, count: int) -> None:
        logger.info(f"导入完成,共 {count} 条")

    def on_invalid(self, record: dict) -> None:
        logger.error(f"记录无效,跳过: {record}")
        # 还可以发告警邮件
\`\`\`

### 4.3 钩子控制流程

钩子可以返回值影响模板流程:

\`\`\`python
class ConditionalImporter(DataImporter):
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run

    def parse(self, raw: str) -> list[dict]:
        return []

    def persist(self, record: dict) -> None:
        if self.dry_run:
            logger.info(f"[dry-run] 将写入: {record}")
        else:
            # 真实写入
            pass

    def should_skip(self, record: dict) -> bool:
        """钩子:是否跳过该记录。"""
        return False
\`\`\`

修改模板方法用钩子控制:

\`\`\`python
def import_file(self, path: str) -> int:
    raw = self.read_file(path)
    records = self.parse(raw)
    count = 0
    for r in records:
        if self.should_skip(r):  # 钩子控制
            continue
        if not self.validate(r):
            self.on_invalid(r)
            continue
        transformed = self.transform(r)
        self.persist(transformed)
        count += 1
    return count
\`\`\`

### 4.4 用「约定」实现 final

Python 没有 \`final\` 关键字,模板方法靠约定不重写。可以用装饰器或命名约定:

\`\`\`python
from abc import abstractmethod
from abc import ABC
def final(method):
    """标记方法为 final,子类重写时警告。"""
    method.__is_final__ = True
    return method

class Base(ABC):
    @final
    def template_method(self):
        self.step()

    @abstractmethod
    def step(self): ...

# 检测子类是否重写了 final 方法
def check_final(cls):
    for name, method in cls.__dict__.items():
        if callable(method):
            base_method = getattr(cls.__mro__[1], name, None)
            if base_method and getattr(base_method, "__is_final__", False):
                raise TypeError(f"{cls.__name__} 不能重写 final 方法 {name}")
    return cls

@check_final
class Sub(Base):
    def step(self):
        print("step")
    # 如果重写 template_method 会报错
\`\`\`

---

## 五、完整 Demo:数据导入框架

下面是一个完整的数据导入框架,支持 CSV/JSON/XML。

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional, Iterator
import csv
import io
import json
import logging
import re
import xml.etree.ElementTree as ET
from datetime import datetime

logger = logging.getLogger(__name__)

# ====== 1. 抽象模板 ======

class DataImporter(ABC):
    """数据导入框架。

    模板流程:
      read → parse → [validate → transform → persist] × N → report

    抽象方法(子类必须实现):
      - parse(raw) -> list[dict]
      - persist(record)

    可重写方法:
      - read_file(path)
      - validate(record) -> bool
      - transform(record) -> dict
      - should_skip(record) -> bool

    钩子:
      - before_import(path)
      - after_import(path, count)
      - on_invalid(record)
      - on_error(record, exc)
    """

    def __init__(self, batch_size: int = 100):
        self.batch_size = batch_size
        self._stats = {"total": 0, "imported": 0, "skipped": 0, "invalid": 0}

    # ===== 模板方法 =====

    def import_file(self, path: str) -> dict:
        """模板方法:整个导入流程。"""
        self.before_import(path)
        try:
            raw = self.read_file(path)
            records = self.parse(raw)
            self._stats["total"] = len(records)
            batch: list[dict] = []
            for record in records:
                if self.should_skip(record):
                    self._stats["skipped"] += 1
                    continue
                if not self.validate(record):
                    self._stats["invalid"] += 1
                    self.on_invalid(record)
                    continue
                try:
                    transformed = self.transform(record)
                    batch.append(transformed)
                    if len(batch) >= self.batch_size:
                        self._persist_batch(batch)
                        self._stats["imported"] += len(batch)
                        batch.clear()
                except Exception as e:
                    self._stats["invalid"] += 1
                    self.on_error(record, e)
            # 处理剩余
            if batch:
                self._persist_batch(batch)
                self._stats["imported"] += len(batch)
        finally:
            self.after_import(path, self._stats)
        return self._stats

    # ===== 抽象方法 =====

    @abstractmethod
    def parse(self, raw: str) -> list[dict]:
        """解析原始内容为记录列表。"""
        ...

    @abstractmethod
    def persist(self, record: dict) -> None:
        """持久化单条记录(批量模式下由 _persist_batch 调用)。"""
        ...

    # ===== 具体方法(可重写) =====

    def read_file(self, path: str) -> str:
        logger.debug(f"读取文件: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def validate(self, record: dict) -> bool:
        """默认校验:必须有 id 字段。"""
        return "id" in record

    def transform(self, record: dict) -> dict:
        """默认不转换。"""
        return record

    def should_skip(self, record: dict) -> bool:
        """默认不跳过。"""
        return False

    def _persist_batch(self, batch: list[dict]) -> None:
        """批量持久化,默认逐条调 persist。子类可重写以批量插入。"""
        for record in batch:
            self.persist(record)

    # ===== 钩子 =====

    def before_import(self, path: str) -> None:
        logger.info(f"===== 开始导入 {path} =====")

    def after_import(self, path: str, stats: dict) -> None:
        logger.info(f"===== 导入完成 {path} =====")
        logger.info(f"统计: {stats}")

    def on_invalid(self, record: dict) -> None:
        logger.warning(f"无效记录: {record}")

    def on_error(self, record: dict, exc: Exception) -> None:
        logger.error(f"处理记录异常: {record}, 错误: {exc}", exc_info=True)

# ====== 2. CSV 导入器 ======

class CSVImporter(DataImporter):
    """CSV 导入器。"""

    def parse(self, raw: str) -> list[dict]:
        reader = csv.DictReader(io.StringIO(raw))
        return list(reader)

    def persist(self, record: dict) -> None:
        # 模拟写入数据库
        logger.debug(f"[CSV] 写入: {record}")

    def transform(self, record: dict) -> dict:
        # 类型转换:把字符串年龄转 int
        if "age" in record:
            record["age"] = int(record["age"])
        return record

    def validate(self, record: dict) -> bool:
        # CSV 特有校验:id 必须是数字
        return super().validate(record) and str(record.get("id", "")).isdigit()

# ====== 3. JSON 导入器 ======

class JSONImporter(DataImporter):
    """JSON 导入器。JSON 可能是数组或 {"data": [...]} 结构。"""

    def parse(self, raw: str) -> list[dict]:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "data" in data:
            return data["data"]
        else:
            return [data]

    def persist(self, record: dict) -> None:
        logger.debug(f"[JSON] 写入: {record}")

    def validate(self, record: dict) -> bool:
        return super().validate(record) and "name" in record

# ====== 4. XML 导入器 ======

class XMLImporter(DataImporter):
    """XML 导入器。期望结构:
    <records>
      <record id="1"><name>Alice</name></record>
      ...
    </records>
    """

    def parse(self, raw: str) -> list[dict]:
        root = ET.fromstring(raw)
        records = []
        for elem in root.findall("record"):
            record = {"id": elem.get("id")}
            for child in elem:
                record[child.tag] = child.text
            records.append(record)
        return records

    def persist(self, record: dict) -> None:
        logger.debug(f"[XML] 写入: {record}")

# ====== 5. 带重写的增强版 ======

class LoggedJSONImporter(JSONImporter):
    """带日志和过滤的 JSON 导入器,演示钩子和重写。"""

    def __init__(self, min_age: int = 0, **kwargs):
        super().__init__(**kwargs)
        self.min_age = min_age

    def should_skip(self, record: dict) -> bool:
        age = record.get("age", 0)
        return age < self.min_age  # 年龄太小跳过

    def before_import(self, path: str) -> None:
        logger.info(f">>> 开始导入 {path}, 最小年龄 {self.min_age}")

    def after_import(self, path: str, stats: dict) -> None:
        logger.info(f">>> 完成,统计: {stats}")
        # 可以发邮件、写监控

    def on_invalid(self, record: dict) -> None:
        logger.error(f"!!! 无效记录: {record}")
        # 实际项目可写死信队列

    def _persist_batch(self, batch: list[dict]) -> None:
        """重写为真正的批量 INSERT。"""
        logger.info(f"批量写入 {len(batch)} 条")
        # 模拟:INSERT INTO ... VALUES (...), (...), ...
        for r in batch:
            self.persist(r)

# ====== 6. 客户端 ======

def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    # 模拟 CSV 文件
    csv_content = "id,name,age\\n1,Alice,30\\n2,Bob,25\\n3,Charlie,abc\\n,xxx,40\\n"
    with open("/tmp/users.csv", "w") as f:
        f.write(csv_content)

    # 模拟 JSON 文件
    json_content = json.dumps([
        {"id": 1, "name": "Alice", "age": 30},
        {"id": 2, "name": "Bob", "age": 25},
        {"id": 3, "age": 40},  # 缺 name,校验失败
    ])
    with open("/tmp/users.json", "w") as f:
        f.write(json_content)

    # 模拟 XML 文件
    xml_content = """<?xml version="1.0"?>
    <records>
      <record id="1"><name>Alice</name><age>30</age></record>
      <record id="2"><name>Bob</name><age>25</age></record>
    </records>"""
    with open("/tmp/users.xml", "w") as f:
        f.write(xml_content)

    print("--- 导入 CSV ---")
    CSVImporter().import_file("/tmp/users.csv")

    print("\\n--- 导入 JSON ---")
    JSONImporter().import_file("/tmp/users.json")

    print("\\n--- 导入 XML ---")
    XMLImporter().import_file("/tmp/users.xml")

    print("\\n--- 导入 JSON(带过滤, min_age=28) ---")
    LoggedJSONImporter(min_age=28).import_file("/tmp/users.json")

if __name__ == "__main__":
    main()
\`\`\`

---

## 六、模板方法 vs 策略

这两个模式都用于「让算法可定制」,但机制完全不同:继承 vs 组合。

### 6.1 核心区别

| 维度 | 模板方法 | 策略模式 |
|------|----------|----------|
| **机制** | 继承 | 组合 |
| **复用方式** | 子类重写方法 | 注入策略对象 |
| **耦合** | 高(继承强耦合) | 低(组合松耦合) |
| **运行时切换** | 否(子类编译时定) | 是(可运行时换策略) |
| **代码复用** | 强(父类代码自动复用) | 弱(策略各干各的) |
| **灵活性** | 中(受限于继承层次) | 高(任意组合) |
| **典型场景** | 框架骨架 | 算法替换 |

### 6.2 通俗类比

- **模板方法**:你继承老爸的餐厅,菜单流程不变(点单→做菜→上菜),但每道菜的做法你改了
- **策略**:你开了餐厅,厨具(策略)可以换,今天是中厨明天换西厨

### 6.3 代码对比

\`\`\`python
# 模板方法:继承
class CSVImporter(DataImporter):
    def parse(self, raw): ...  # 重写父类方法

# 策略:组合
class DataImporter:
    def __init__(self, parser: ParserStrategy):
        self.parser = parser  # 注入策略

    def import_file(self, path):
        raw = self.read(path)
        records = self.parser.parse(raw)  # 委托给策略
\`\`\`

### 6.4 如何选择

| 场景 | 推荐 |
|------|------|
| 流程骨架固定,部分步骤可变 | 模板方法 |
| 整个算法可替换 | 策略 |
| 需要运行时切换 | 策略 |
| 子类需要复用父类大量代码 | 模板方法 |
| 多个维度独立变化 | 策略(避免类爆炸) |

经验:**优先用策略(组合优于继承),只有当复用是主要诉求时才用模板方法**。

---

## 七、高级话题

### 7.1 钩子方法设计原则

钩子方法的设计要点:

1. **默认实现应该是「最安全」的**:不做事(\`pass\`)或返回默认值
2. **钩子命名清晰**:\`before_xxx\` / \`after_xxx\` / \`on_xxx\`
3. **钩子参数足够**:让子类能拿到上下文信息
4. **钩子可控制流程**:返回 bool 或抛异常影响主流程

\`\`\`python
class Template:
    def run(self):
        if not self.before_run():  # 钩子可阻止
            return
        try:
            self.do_work()
        except Exception as e:
            self.on_error(e)  # 钩子可处理异常
            raise
        self.after_run()  # 钩子可收尾

    def before_run(self) -> bool:
        return True  # 默认继续

    def on_error(self, e): pass

    def after_run(self): pass

    def do_work(self): ...  # 抽象
\`\`\`

### 7.2 模板方法与上下文管理器

Python 的 \`contextlib\` 可视为模板方法的另一种实现:

\`\`\`python
from contextlib import abstractcontextmanager

class TemplateContext:
    @abstractcontextmanager
    def session(self):
        # 子类实现具体 session
        yield

    def run(self):
        with self.session():
            self.do_work()

# 对比模板方法:contextmanager 也是「父类定流程,子类填细节」
\`\`\`

### 7.3 模板方法与 Mixin

Python 的 Mixin 机制常与模板方法结合:

\`\`\`python
class LogMixin:
    """日志 Mixin,提供钩子实现。"""
    def before_import(self, path):
        logger.info(f"开始: {path}")

    def after_import(self, path, stats):
        logger.info(f"结束: {stats}")

class LoggedCSVImporter(LogMixin, CSVImporter):
    """多重继承:CSVImporter 提供骨架,LogMixin 提供钩子。"""
    pass
\`\`\`

### 7.4 模板方法的单元测试

测试模板方法:
1. **测试父类骨架**:用一个最小的子类(只实现抽象方法)验证流程
2. **测试子类重写**:验证重写后的行为
3. **测试钩子**:验证钩子被正确调用

\`\`\`python
import pytest

class DummyImporter(DataImporter):
    """最小实现,用于测试骨架。"""
    def __init__(self):
        super().__init__()
        self.persisted = []

    def parse(self, raw):
        return [{"id": "1", "name": "x"}, {"id": "2", "name": "y"}]

    def persist(self, record):
        self.persisted.append(record)

class TestTemplateMethod:
    def test_skeleton(self):
        imp = DummyImporter()
        stats = imp.import_file("/tmp/test.csv")
        assert stats["imported"] == 2
        assert len(imp.persisted) == 2

    def test_validate_called(self):
        class StrictImporter(DummyImporter):
            def validate(self, r):
                return r["id"] == "1"
        imp = StrictImporter()
        stats = imp.import_file("/tmp/test.csv")
        assert stats["imported"] == 1
        assert stats["invalid"] == 1

    def test_hook_called(self):
        class HookImporter(DummyImporter):
            def __init__(self):
                super().__init__()
                self.before_called = False
            def before_import(self, path):
                self.before_called = True
        imp = HookImporter()
        imp.import_file("/tmp/test.csv")
        assert imp.before_called
\`\`\`

---

## 八、易错点小结

| # | 易错点 | 后果 | 正确做法 |
|---|--------|------|----------|
| 1 | 子类重写了模板方法 | 破坏骨架一致性 | 用 final 装饰器或文档约定 |
| 2 | 抽象方法写成普通方法 | 子类可不实现,运行时才报错 | 用 \`@abstractmethod\` |
| 3 | 钩子默认实现有副作用 | 子类不重写也受影响 | 钩子默认 \`pass\` 或返回默认值 |
| 4 | 模板方法调用了未定义的钩子 | AttributeError | 父类提供默认实现 |
| 5 | 子类重写方法忘调 super() | 复用代码丢失 | 关键方法显式调 super |
| 6 | 继承层次过深 | 难维护 | 超过 3 层考虑改用策略 |
| 7 | 模板方法太长 | 难理解 | 拆成多个小方法 |
| 8 | 步骤顺序敏感但没文档 | 子类误改顺序 | 文档标注「勿改顺序」 |
| 9 | 用模板方法替代策略 | 强耦合难切换 | 评估场景再选模式 |
| 10 | 子类只为了改一个钩子而存在 | 类爆炸 | 用组合或 lambda 注入 |

---

## 九、本章总结

模板方法的本质是**「继承复用流程骨架」**:

1. **骨架**:父类的模板方法定义流程,不可重写
2. **步骤**:抽象方法子类必须实现,具体方法可重写
3. **钩子**:可选重写,影响流程或注入逻辑
4. **复用**:子类自动获得父类代码

模板方法是「继承派」的代表,策略是「组合派」的代表。Python 中因为多重继承和 duck typing,模板方法用得不如策略多,但在框架设计(Django、Flask、unittest)中仍极其重要。掌握模板方法,你会更理解「框架 vs 库」的区别:框架用模板方法控制流程,你填空;库是你控制流程,调库的函数。
`,
  },
  {
    id: "pyarch-dp-chain",
    icon: "⛓️",
    title: "责任链模式(Chain of Responsibility)",
    group: "设计模式 · 行为型",
    content: `# 责任链模式(Chain of Responsibility)

## 一、责任链模式定义

责任链模式(Chain of Responsibility Pattern)是一种行为型设计模式,定义如下:

> 使多个对象都有机会处理请求,从而避免请求的发送者和接收者之间的耦合关系。将这些对象连成一条链,并沿着这条链传递请求,直到有一个对象处理它为止。

用一句话概括:**「请求沿链传递,逐个尝试处理」**。

### 1.1 经典 UML 类图

\`\`\`
   ┌───────────────────────┐
   │     Handler           │
   │    <<abstract>>       │
   ├───────────────────────┤
   │ # next: Handler       │  ← 持有下一个处理者
   ├───────────────────────┤
   │ + set_next(h): Handler│  ← 链接方法
   │ + handle(req)         │  ← 处理入口(模板方法)
   │ # _handle(req)        │  ← 子类实现具体处理
   └───────────┬───────────┘
               │ extends
   ┌───────────┴───────────┐
   │                       │
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ ConcreteA    │───▶│ ConcreteB    │───▶│ ConcreteC    │
├──────────────┤    ├──────────────┤    ├──────────────┤
│#_handle(req) │    │#_handle(req) │    │#_handle(req) │
└──────────────┘    └──────────────┘    └──────────────┘

请求从 A 进入,A 不处理就传给 B,B 不处理传给 C...
\`\`\`

### 1.2 最简代码骨架

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Optional

class Handler(ABC):
    """处理者抽象基类。

    设计要点:
    - handle 是模板方法,定义「尝试处理 → 不行则传给下一个」
    - _handle 是抽象方法,子类实现具体处理逻辑
    - set_next 返回 next,方便链式调用
    """

    def __init__(self) -> None:
        self._next: Optional[Handler] = None

    def set_next(self, handler: "Handler") -> "Handler":
        """设置下一个处理者,返回 handler 以便链式。"""
        self._next = handler
        return handler  # 返回 handler 方便 a.set_next(b).set_next(c)

    def handle(self, request: Any) -> Optional[Any]:
        """模板方法:先自己处理,不行传给下一个。"""
        result = self._handle(request)
        if result is not None:
            return result
        if self._next:
            return self._next.handle(request)
        return None  # 链尾,无人处理

    @abstractmethod
    def _handle(self, request: Any) -> Optional[Any]:
        """子类实现:能处理返回结果,不能返回 None。"""
        ...

class ConcreteHandlerA(Handler):
    def _handle(self, request: Any) -> Optional[Any]:
        if request == "A":
            return f"A 处理了 {request}"
        return None

class ConcreteHandlerB(Handler):
    def _handle(self, request: Any) -> Optional[Any]:
        if request == "B":
            return f"B 处理了 {request}"
        return None

# 组装链
a = ConcreteHandlerA()
b = ConcreteHandlerB()
a.set_next(b)

print(a.handle("A"))  # A 处理了 A
print(a.handle("B"))  # B 处理了 B
print(a.handle("C"))  # None(无人处理)
\`\`\`

---

## 二、直觉理解:为什么需要责任链

### 2.1 痛点:发送者要知道接收者

假设一个 Web 请求需要经过:认证 → 限流 → 日志 → 业务处理。最直接的写法:

\`\`\`python
def handle_request(request):
    # 认证
    if not authenticate(request):
        return "401"
    # 限流
    if is_rate_limited(request):
        return "429"
    # 日志
    log_request(request)
    # 业务
    return business_logic(request)
\`\`\`

问题:
1. **耦合**:这个函数耦合了所有处理步骤
2. **顺序硬编码**:改顺序要改函数
3. **加新步骤要改老代码**:违反 OCP
4. **无法复用**:认证逻辑锁死在这里,其他地方想用拿不到
5. **无法动态配置**:不同路由要不同处理链做不到

### 2.2 责任链的解法

每个处理者独立成对象,串成链:

\`\`\`python
auth = AuthHandler()
rate_limit = RateLimitHandler()
log = LogHandler()
business = BusinessHandler()

auth.set_next(rate_limit).set_next(log).set_next(business)

# 不同路由可配不同链
api_chain = auth.set_next(rate_limit).set_next(business)
static_chain = log  # 静态资源只记日志

response = api_chain.handle(request)
\`\`\`

现在:
- 每个处理者独立,可单元测试
- 链可动态组装,不同场景不同链
- 加新处理者:新建类,插入链即可,不改老代码

### 2.3 类比:公司审批流

责任链最贴切的类比是公司审批:

> 报销 500 元:组长审批
> 报销 5000 元:组长 → 经理审批
> 报销 50000 元:组长 → 经理 → 总监审批
> 报销 500000 元:组长 → 经理 → 总监 → CEO 审批

- 每级审批者只关心「我能不能批」
- 能批就批,不能批就上报
- 申请人不关心最终谁批,只提交申请
- 审批链可调整(比如临时让副总监也能批)

---

## 三、应用场景

### 3.1 审批流
请假、报销、采购审批,逐级上报。

### 3.2 Web 中间件
Django/Flask 的中间件、Express 的 middleware,本质是责任链。

### 3.3 异常处理
异常沿调用栈传播,直到被某个 except 捕获,本质是责任链。

### 3.4 过滤器
Servlet 的 Filter Chain、Apache 的 mod_filter。

### 3.5 事件冒泡
DOM 事件冒泡,从子元素到父元素逐个尝试处理。

### 3.6 日志级别
logging 模块的 Handler 链:DEBUG 走一个 Handler,ERROR 走另一个。

### 3.7 机器人客服
客服机器人:简单问题机器人答,复杂转人工,人工解决不了转专家。

### 3.8 安全检查
请求经过:IP 黑名单 → 频率限制 → 签名校验 → 权限校验 → 业务。

---

## 四、Python 实战

### 4.1 经典实现:Handler 抽象 + set_next + handle

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Optional, Callable
import logging

logger = logging.getLogger(__name__)

class Handler(ABC):
    """处理者基类。

    模板方法 handle:先 _handle,不行传 next。
    子类只需实现 _handle。
    """

    def __init__(self) -> None:
        self._next: Optional[Handler] = None

    @property
    def next_handler(self) -> Optional[Handler]:
        return self._next

    def set_next(self, handler: "Handler") -> "Handler":
        self._next = handler
        return handler

    def handle(self, request: Any) -> Any:
        # 先尝试自己处理
        result = self._handle(request)
        if result is not None:
            return result
        # 传给下一个
        if self._next is not None:
            return self._next.handle(request)
        # 链尾,返回默认(可自定义)
        return self._default_response(request)

    @abstractmethod
    def _handle(self, request: Any) -> Optional[Any]:
        """尝试处理。返回非 None 表示已处理,返回 None 表示传递。"""
        ...

    def _default_response(self, request: Any) -> Any:
        """链尾无人处理的默认响应。"""
        return None
\`\`\`

### 4.2 链式组装

\`\`\`python
class A(Handler):
    def _handle(self, req):
        if req == "A":
            return "A handled"
        return None

class B(Handler):
    def _handle(self, req):
        if req == "B":
            return "B handled"
        return None

class C(Handler):
    def _handle(self, req):
        if req == "C":
            return "C handled"
        return None

# 链式组装:返回 handler 本身,可连续 set_next
chain = A()
chain.set_next(B()).set_next(C())

# 或者用辅助函数
def build_chain(*handlers: Handler) -> Handler:
    """工具函数:把多个 handler 串成链,返回链头。"""
    if not handlers:
        raise ValueError("至少需要一个 handler")
    for i in range(len(handlers) - 1):
        handlers[i].set_next(handlers[i + 1])
    return handlers[0]

chain = build_chain(A(), B(), C())
\`\`\`

### 4.3 装饰器/中间件风格

Python 中常用装饰器实现责任链,更 Pythonic:

\`\`\`python
from typing import Callable, Any
from functools import wraps

def middleware(handler: Callable):
    """中间件装饰器,把函数变成可链接的处理者。"""
    handler._is_middleware = True
    return handler

class MiddlewareChain:
    """函数式中间件链。"""

    def __init__(self):
        self._middlewares: list[Callable] = []

    def use(self, mw: Callable) -> "MiddlewareChain":
        self._middlewares.append(mw)
        return self

    def run(self, request: Any, final: Callable) -> Any:
        """执行链。final 是最终处理函数。"""
        def make_next(idx):
            if idx >= len(self._middlewares):
                return final
            mw = self._middlewares[idx]
            @wraps(mw)
            def next_fn(req):
                return mw(req, make_next(idx + 1))
            return next_fn
        return make_next(0)(request)

# 使用
def auth(req, next):
    if not req.get("token"):
        return "401 Unauthorized"
    return next(req)

def rate_limit(req, next):
    if req.get("count", 0) > 100:
        return "429 Too Many Requests"
    return next(req)

def logger_mw(req, next):
    print(f"请求: {req}")
    result = next(req)
    print(f"响应: {result}")
    return result

def business(req):
    return f"业务处理: {req.get('action')}"

chain = MiddlewareChain()
chain.use(logger_mw).use(auth).use(rate_limit)

print(chain.run({"token": "x", "action": "get_data"}, business))
# 请求: {...}
# 响应: 业务处理: get_data
# 业务处理: get_data
\`\`\`

### 4.4 中断 vs 全执行

责任链有两种语义:
- **中断式**:某个处理者处理了就停(经典 CoR)
- **全执行式**:每个处理者都执行,只是顺序传递(中间件风格)

\`\`\`python
class InterruptHandler(Handler):
    """经典:处理了就返回,不传 next。"""
    def _handle(self, req):
        if self.can_handle(req):
            return self.do_handle(req)
        return None  # 传给 next

class PassThroughHandler(Handler):
    """中间件式:总是执行,然后传 next。"""
    def _handle(self, req):
        self.do_something(req)  # 总是执行
        return None  # 总是传给 next
\`\`\`

---

## 五、完整 Demo:Web 请求中间件链

下面是一个完整的 Web 请求处理链:认证 → 限流 → 日志 → 业务。

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Optional, Callable
from collections import defaultdict, deque
from time import time, monotonic
import logging
import threading

logger = logging.getLogger(__name__)

# ====== 1. 请求/响应对象 ======

@dataclass
class Request:
    """HTTP 请求(简化版)。"""
    method: str = "GET"
    path: str = "/"
    headers: dict[str, str] = field(default_factory=dict)
    query: dict[str, str] = field(default_factory=dict)
    body: Any = None
    ip: str = "0.0.0.0"
    user: Optional[str] = None  # 认证后填充
    _meta: dict = field(default_factory=dict)  # 中间件间传递数据

@dataclass
class Response:
    """HTTP 响应(简化版)。"""
    status: int = 200
    body: Any = None
    headers: dict[str, str] = field(default_factory=dict)

    @property
    def is_error(self) -> bool:
        return self.status >= 400

# ====== 2. Handler 抽象 ======

class Middleware(ABC):
    """中间件抽象基类。

    设计:
    - process 是入口,返回 Response 表示拦截,返回 None 表示放行
    - 子类实现 process
    - 链尾默认 404
    """

    def __init__(self) -> None:
        self._next: Optional[Middleware] = None

    def set_next(self, mw: "Middleware") -> "Middleware":
        self._next = mw
        return mw

    def process(self, request: Request) -> Optional[Response]:
        """处理请求。返回 Response 表示已处理(拦截),返回 None 表示放行。"""
        response = self._process(request)
        if response is not None:
            return response
        if self._next is not None:
            return self._next.process(request)
        return Response(status=404, body={"error": "Not Found"})

    @abstractmethod
    def _process(self, request: Request) -> Optional[Response]:
        ...

# ====== 3. 具体中间件 ======

class AuthMiddleware(Middleware):
    """认证中间件:校验 token。"""

    VALID_TOKENS = {"abc123": "alice", "def456": "bob"}

    def _process(self, request: Request) -> Optional[Response]:
        token = request.headers.get("Authorization", "").removeprefix("Bearer ")
        if not token:
            return Response(401, {"error": "Missing token"})
        user = self.VALID_TOKENS.get(token)
        if not user:
            return Response(401, {"error": "Invalid token"})
        request.user = user  # 后续中间件可用
        request._meta["auth_time"] = time()
        logger.debug(f"认证通过: {user}")
        return None  # 放行

class RateLimitMiddleware(Middleware):
    """限流中间件:每 IP 每分钟最多 N 次。"""

    def __init__(self, max_per_minute: int = 100) -> None:
        super().__init__()
        self.max = max_per_minute
        self._buckets: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def _process(self, request: Request) -> Optional[Response]:
        now = monotonic()
        ip = request.ip
        with self._lock:
            bucket = self._buckets[ip]
            # 清理 60 秒前的
            while bucket and bucket[0] < now - 60:
                bucket.popleft()
            if len(bucket) >= self.max:
                return Response(429, {
                    "error": "Too Many Requests",
                    "retry_after": int(60 - (now - bucket[0]))
                })
            bucket.append(now)
        logger.debug(f"限流通过: {ip} ({len(bucket)}/{self.max})")
        return None

class LoggingMiddleware(Middleware):
    """日志中间件:记录请求和响应。"""

    def _process(self, request: Request) -> Optional[Response]:
        start = time()
        logger.info(f"--> {request.method} {request.path} from {request.ip} user={request.user}")
        # 这里无法直接拿到下游 response(经典 CoR 限制)
        # 中间件风格需要包装 next,见 5.2 装饰器版
        request._meta["start_time"] = start
        return None  # 放行

class CORSMiddleware(Middleware):
    """CORS 中间件:加跨域头。"""

    def __init__(self, allow_origins: list[str] = None) -> None:
        super().__init__()
        self.allow_origins = allow_origins or ["*"]

    def _process(self, request: Request) -> Optional[Response]:
        # 预检请求直接返回
        if request.method == "OPTIONS":
            return Response(204, headers={
                "Access-Control-Allow-Origin": ",".join(self.allow_origins),
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
            })
        return None

class BusinessMiddleware(Middleware):
    """业务中间件:实际处理请求。"""

    def __init__(self, routes: dict[str, Callable] = None) -> None:
        super().__init__()
        self.routes = routes or {}

    def _process(self, request: Request) -> Optional[Response]:
        handler = self.routes.get(f"{request.method} {request.path}")
        if handler is None:
            return None  # 让链尾返回 404
        try:
            body = handler(request)
            return Response(200, body)
        except Exception as e:
            logger.exception("业务异常")
            return Response(500, {"error": str(e)})

# ====== 4. 应用 ======

class Application:
    """Web 应用,组装中间件链。"""

    def __init__(self):
        self._chain_head: Optional[Middleware] = None

    def use(self, mw: Middleware) -> "Application":
        if self._chain_head is None:
            self._chain_head = mw
        else:
            # 找到链尾
            tail = self._chain_head
            while tail._next is not None:
                tail = tail._next
            tail.set_next(mw)
        return self

    def handle(self, request: Request) -> Response:
        if self._chain_head is None:
            return Response(500, {"error": "No middleware"})
        return self._chain_head.process(request)

# ====== 5. 业务路由 ======

def get_profile(req: Request) -> dict:
    return {"user": req.user, "profile": "..."}

def get_orders(req: Request) -> list:
    return [{"id": 1, "user": req.user}]

# ====== 6. 客户端 ======

def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    app = Application()
    # 组装链:CORS → Auth → RateLimit → Logging → Business
    app.use(CORSMiddleware(["https://example.com"]))
    app.use(AuthMiddleware())
    app.use(RateLimitMiddleware(max_per_minute=1000))
    app.use(LoggingMiddleware())
    app.use(BusinessMiddleware({
        "GET /profile": get_profile,
        "GET /orders": get_orders,
    }))

    # 测试 1:正常请求
    req = Request(
        method="GET", path="/profile",
        headers={"Authorization": "Bearer abc123"},
        ip="1.2.3.4",
    )
    resp = app.handle(req)
    print(f"测试1: {resp.status} {resp.body}")

    # 测试 2:无 token
    req = Request(method="GET", path="/profile", ip="1.2.3.4")
    resp = app.handle(req)
    print(f"测试2: {resp.status} {resp.body}")

    # 测试 3:错误 token
    req = Request(
        method="GET", path="/profile",
        headers={"Authorization": "Bearer wrong"},
        ip="1.2.3.4",
    )
    resp = app.handle(req)
    print(f"测试3: {resp.status} {resp.body}")

    # 测试 4:404
    req = Request(
        method="GET", path="/unknown",
        headers={"Authorization": "Bearer abc123"},
        ip="1.2.3.4",
    )
    resp = app.handle(req)
    print(f"测试4: {resp.status} {resp.body}")

    # 测试 5:限流(模拟大量请求)
    print("\\n--- 限流测试 ---")
    rl_app = Application()
    rl_app.use(RateLimitMiddleware(max_per_minute=3))
    for i in range(5):
        req = Request(method="GET", path="/test", ip="5.6.7.8")
        resp = rl_app.handle(req)
        print(f"请求{i+1}: {resp.status}")

if __name__ == "__main__":
    main()
\`\`\`

运行结果:

\`\`\`
INFO --> GET /profile from 1.2.3.4 user=alice
测试1: 200 {'user': 'alice', 'profile': '...'}
测试2: 401 {'error': 'Missing token'}
测试3: 401 {'error': 'Invalid token'}
INFO --> GET /unknown from 1.2.3.4 user=alice
测试4: 404 {'error': 'Not Found'}

--- 限流测试 ---
请求1: 404
请求2: 404
请求3: 404
请求4: 429 {'error': 'Too Many Requests', 'retry_after': 60}
请求5: 429 {'error': 'Too Many Requests', 'retry_after': 60}
\`\`\`

---

## 六、责任链 vs 装饰器

责任链和装饰器结构几乎一样(都是「持有下一个引用,转发请求」),但语义不同。

### 6.1 核心区别

| 维度 | 责任链 | 装饰器 |
|------|--------|--------|
| **核心目的** | 找一个处理者 | 给对象加功能 |
| **链上对象** | 不同类,各管一段 | 同接口,层层包装 |
| **是否中断** | 可中断(处理了就停) | 一般全执行 |
| **顺序敏感** | 是(认证必须在业务前) | 较弱(都是增强) |
| **典型场景** | 中间件、审批 | 加日志、加缓存、加重试 |

### 6.2 通俗类比

- **责任链**:医院分诊台 → 挂号 → 诊室 → 药房,每个环节处理一部分,处理完传给下一个
- **装饰器**:给咖啡加奶 → 加糖 → 加奶泡,每一层都是「装饰」原来的咖啡,层层包裹

### 6.3 代码对比

\`\`\`python
# 责任链:每个 handler 处理不同的事,可中断
class AuthHandler(Handler):
    def _handle(self, req):
        if not req.token:
            return Response(401)  # 中断
        return None  # 传给 next

# 装饰器:每个装饰器都执行,层层增强
def log_decorator(fn):
    def wrapper(*args):
        print("before")
        result = fn(*args)
        print("after")
        return result
    return wrapper

def cache_decorator(fn):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper

@log_decorator
@cache_decorator
def expensive(x):
    return x * 2
\`\`\`

### 6.4 如何选择

| 场景 | 推荐 |
|------|------|
| 请求要被「某个」处理者处理 | 责任链 |
| 请求要被「所有」处理者增强 | 装饰器 |
| 处理者职责不同 | 责任链 |
| 处理者职责相同(都是增强) | 装饰器 |
| 需要中断 | 责任链 |
| 需要包装(前后增强) | 装饰器 |

---

## 七、高级话题

### 7.1 双向链与洋葱模型

经典责任链是单向的:请求进 → 处理 → 传 next。但中间件常需要「请求前做事,响应后做事」(洋葱模型):

\`\`\`
请求 → [Auth 前] → [Log 前] → [Business] → [Log 后] → [Auth 后] → 响应
\`\`\`

\`\`\`python
class OnionMiddleware:
    """洋葱模型中间件。"""
    def __init__(self):
        self._middlewares: list[Callable] = []

    def use(self, mw):
        self._middlewares.append(mw)

    def run(self, request, final):
        def make_next(idx):
            if idx >= len(self._middlewares):
                return final
            mw = self._middlewares[idx]
            def next_fn(req):
                # mw 接收 req 和 next,内部决定何时调 next
                return mw(req, make_next(idx + 1))
            return next_fn
        return make_next(0)(request)

def auth(req, next):
    print("auth 前")
    if not req.get("token"):
        return "401"
    resp = next(req)
    print("auth 后")
    return resp

def log(req, next):
    print("log 前")
    resp = next(req)
    print("log 后")
    return resp

def biz(req):
    print("biz 处理")
    return "ok"

app = OnionMiddleware()
app.use(auth)
app.use(log)
print(app.run({"token": "x"}, biz))
# auth 前
# log 前
# biz 处理
# log 后
# auth 后
# ok
\`\`\`

Koa、Redux、Django middleware 都是洋葱模型。

### 7.2 责任链与 asyncio

异步责任链:

\`\`\`python
from abc import abstractmethod
from abc import ABC
import asyncio

class AsyncHandler(ABC):
    def __init__(self):
        self._next = None

    def set_next(self, h):
        self._next = h
        return h

    async def handle(self, request):
        result = await self._handle(request)
        if result is not None:
            return result
        if self._next:
            return await self._next.handle(request)
        return None

    @abstractmethod
    async def _handle(self, request):
        ...

class AsyncAuth(AsyncHandler):
    async def _handle(self, req):
        await asyncio.sleep(0.01)  # 模拟查库
        if not req.get("token"):
            return "401"
        return None

class AsyncBiz(AsyncHandler):
    async def _handle(self, req):
        await asyncio.sleep(0.01)
        return "ok"

chain = AsyncAuth()
chain.set_next(AsyncBiz())
print(asyncio.run(chain.handle({"token": "x"})))  # ok
\`\`\`

### 7.3 责任链与配置化

生产环境常把链配置化:

\`\`\`yaml
# middleware.yaml
chain:
  - cors
  - auth
  - rate_limit:
      max: 1000
  - logging
  - business
\`\`\`

\`\`\`python
import yaml

MIDDLEWARE_MAP = {
    "cors": CORSMiddleware,
    "auth": AuthMiddleware,
    "rate_limit": RateLimitMiddleware,
    "logging": LoggingMiddleware,
    "business": BusinessMiddleware,
}

def build_from_config(config_path: str) -> Application:
    with open(config_path) as f:
        cfg = yaml.safe_load(f)
    app = Application()
    for item in cfg["chain"]:
        if isinstance(item, str):
            name, params = item, {}
        else:
            name, params = next(iter(item.items()))
        cls = MIDDLEWARE_MAP[name]
        app.use(cls(**params))
    return app
\`\`\`

---

## 八、易错点小结

| # | 易错点 | 后果 | 正确做法 |
|---|--------|------|----------|
| 1 | 忘了传 next(漏调 \`self._next.handle\`) | 链断裂,后续不执行 | 模板方法统一处理 |
| 2 | 处理了却返回 None | 被当成「未处理」继续传 | 明确返回值约定 |
| 3 | 链成环(A→B→A) | 无限递归 | 组装时检查 |
| 4 | handler 共享可变状态且无线程安全 | 并发问题 | 加锁或无状态设计 |
| 5 | 链太长 | 性能差 | 控制链长度,或改用路由表 |
| 6 | set_next 返回错对象 | 链式调用断 | 返回 handler 本身 |
| 7 | 链尾没默认处理 | 返回 None 空响应 | 提供 _default_response |
| 8 | 中间件顺序写错 | 安全漏洞(认证在业务后) | 文档说明顺序语义 |
| 9 | handler 抛异常不处理 | 整条链断 | try/except 包住 _handle |
| 10 | 责任链当普通 if/else 用 | 没发挥模式价值 | 评估是否真需要链 |

---

## 九、本章总结

责任链模式的本质是**「请求的逐级传递」**:

1. **抽象**:Handler 定义 set_next + handle 接口
2. **解耦**:发送者不关心谁处理,只管提交
3. **灵活**:链可动态组装,处理者可增删
4. **可中断**:处理了就停,未处理才传

责任链在 Web 框架(Django/Flask 中间件)、审批流、异常处理中无处不在。掌握责任链后,你会更理解「中间件」「过滤器」「拦截器」这些概念的统一本质。注意区分责任链(可中断)与装饰器(全执行)的语义差异,这是面试和实战的高频考点。
`,
  },
  {
    id: "pyarch-dp-state",
    icon: "🔀",
    title: "状态模式(State)",
    group: "设计模式 · 行为型",
    content: `# 状态模式(State)

## 一、状态模式定义

状态模式(State Pattern)是一种行为型设计模式,定义如下:

> 允许一个对象在其内部状态改变时改变它的行为。对象看起来似乎修改了它的类。

用一句话概括:**「对象的行为随状态变化,状态用类表示」**。

### 1.1 经典 UML 类图

\`\`\`
   ┌──────────────────────┐  holds ref   ┌──────────────────────┐
   │      Context         │ ───────────▶ │     State            │
   ├──────────────────────┤              │   <<abstract>>       │
   │ - state: State       │              ├──────────────────────┤
   ├──────────────────────┤              │ + handle(ctx)        │
   │ + request()          │              └──────────┬───────────┘
   │ + change_state(s)    │                         │ inherits
   └──────────────────────┘                         ▼
                              ┌─────────────────────┼─────────────────────┐
                              │                     │                     │
                       ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
                       │ ConcreteStateA│     │ ConcreteStateB│     │ ConcreteStateC│
                       ├──────────────┤      ├──────────────┤      ├──────────────┤
                       │ + handle(ctx)│      │ + handle(ctx)│      │ + handle(ctx)│
                       └──────────────┘      └──────────────┘      └──────────────┘

   Context 把请求委托给当前 State 对象,State 在 handle 中可调 ctx.change_state 切换状态
\`\`\`

### 1.2 最简代码骨架

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional

class State(ABC):
    """状态抽象基类。"""
    @abstractmethod
    def handle(self, context: "Context") -> None:
        ...

class Context:
    """上下文,持有当前状态。"""
    def __init__(self, state: State) -> None:
        self._state: Optional[State] = None
        self.transition_to(state)  # 用方法初始化,便于记日志

    def transition_to(self, state: State) -> None:
        print(f"Context: 状态切换 -> {state.__class__.__name__}")
        self._state = state

    def request(self) -> None:
        # 把请求委托给当前状态
        self._state.handle(self)

# 具体状态
class ConcreteStateA(State):
    def handle(self, context: Context) -> None:
        print("StateA: 处理请求,切换到 B")
        context.transition_to(ConcreteStateB())

class ConcreteStateB(State):
    def handle(self, context: Context) -> None:
        print("StateB: 处理请求,切换到 A")
        context.transition_to(ConcreteStateA())

# 使用
ctx = Context(ConcreteStateA())
ctx.request()  # A -> B
ctx.request()  # B -> A
ctx.request()  # A -> B
\`\`\`

---

## 二、直觉理解:为什么需要状态模式

### 2.1 痛点:if/else 状态地狱

假设你在写一个订单系统,订单有多个状态:新建、已支付、已发货、已完成、已取消。每个状态下能做的操作不同:

- 新建:可以支付、取消,不能发货
- 已支付:可以发货、取消,不能支付
- 已发货:可以确认收货,不能取消
- 已完成:什么都不能做
- 已取消:什么都不能做

最直接的写法:

\`\`\`python
class Order:
    def __init__(self):
        self.state = "new"
        self.paid = False
        self.shipped = False

    def pay(self):
        if self.state == "new":
            self.state = "paid"
            print("支付成功")
        elif self.state == "paid":
            print("已支付,不能重复支付")
        elif self.state == "shipped":
            print("已发货,不能支付")
        # ... 每个状态都要判断

    def ship(self):
        if self.state == "new":
            print("未支付,不能发货")
        elif self.state == "paid":
            self.state = "shipped"
            print("发货成功")
        elif self.state == "shipped":
            print("已发货,不能重复发货")
        # ...

    def cancel(self):
        if self.state == "new":
            self.state = "cancelled"
        elif self.state == "paid":
            self.state = "cancelled"
            print("退款中")
        elif self.state == "shipped":
            print("已发货,不能取消")
        # ...
\`\`\`

问题:
1. **方法爆炸**:每个操作都要 if 判断所有状态
2. **状态多了灾难**:5 个状态 × 4 个操作 = 20 个分支
3. **加状态要改所有方法**:违反 OCP
4. **状态转换规则散落**:难维护,容易出 bug
5. **难画状态图**:转换逻辑藏在 if 里

### 2.2 状态模式的解法

把每个状态封装成类,状态类自己决定能做什么、怎么切换:

\`\`\`python
from abc import abstractmethod
from abc import ABC
class OrderState(ABC):
    @abstractmethod
    def pay(self, order): ...
    @abstractmethod
    def ship(self, order): ...
    @abstractmethod
    def cancel(self, order): ...

class NewState(OrderState):
    def pay(self, order):
        order.state = PaidState()
        print("支付成功")
    def ship(self, order):
        print("未支付,不能发货")
    def cancel(self, order):
        order.state = CancelledState()

class Order:
    def __init__(self):
        self.state = NewState()
    def pay(self):
        self.state.pay(self)  # 委托给状态
    def ship(self):
        self.state.ship(self)
\`\`\`

现在:
- 每个状态类只关心「我这个状态能做什么」
- 加新状态:新建一个状态类,不改其他
- 状态转换规则集中在状态类里,清晰

### 2.3 类比:红绿灯

状态模式最经典的类比是红绿灯:

- **红灯状态**:车停,倒计时结束切到绿灯
- **绿灯状态**:车行,倒计时结束切到黄灯
- **黄灯状态**:车准备停,切到红灯

灯(Context)本身不决定亮什么颜色,由当前状态(红/绿/黄)决定。状态自己知道「我该显示什么、何时切到下一个」。

\`\`\`
   红 ─────▶ 绿 ─────▶ 黄 ─────▶ 红
   (停)     (行)      (慢)      (停)
\`\`\`

---

## 三、应用场景

### 3.1 订单状态机
电商订单:新建 → 已支付 → 已发货 → 已完成 / 已取消。

### 3.2 游戏角色状态
角色:站立 → 走 → 跑 → 跳 → 蹲,每种状态下按键行为不同。

### 3.3 工作流引擎
审批流:起草 → 提交 → 审批中 → 通过 / 驳回。

### 3.4 网络连接
TCP 连接:CLOSED → LISTEN → SYN_SENT → ESTABLISHED → CLOSE_WAIT → CLOSED。

### 3.5 文档审批
文档:草稿 → 待审 → 审核中 → 发布 / 退回。

### 3.6 播放器
播放器:停止 → 播放 → 暂停,每个状态下按播放键行为不同。

### 3.7 售货机
投币 → 选商品 → 出货 → 找零,每步是一个状态。

### 3.8 电梯
电梯:开门 → 关门 → 运行 → 停止 → 故障,状态间转换有严格规则。

---

## 四、Python 实战

### 4.1 经典实现:State 抽象 + Context

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional, TYPE_CHECKING
import logging

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

class State(ABC):
    """状态抽象基类。

    设计要点:
    - 每个状态相关的操作都定义在这里
    - handle 接收 context,可调 context.change_state 切换
    - 状态类应无状态(纯行为),状态数据存在 Context
    """
    @abstractmethod
    def handle(self, context: "Context") -> None:
        ...

class Context:
    """上下文,持有当前状态。

    把请求委托给当前状态对象。
    """
    def __init__(self, initial_state: State) -> None:
        self._state: Optional[State] = None
        self.transition_to(initial_state)

    @property
    def state(self) -> State:
        return self._state

    def transition_to(self, state: State) -> None:
        """切换状态。"""
        if self._state is not None:
            logger.debug(f"{self._state.__class__.__name__} -> {state.__class__.__name__}")
        self._state = state

    def request(self) -> None:
        """请求委托给状态。"""
        self._state.handle(self)
\`\`\`

### 4.2 状态转换图

状态机的核心是状态转换图。先画图再写代码:

\`\`\`
                  pay()
   ┌─────────┐ ─────────▶ ┌─────────┐
   │  New    │             │  Paid   │
   └────┬────┘ ◀───────── └────┬────┘
        │ cancel()        ship() │
        ▼                        ▼
   ┌─────────┐             ┌─────────┐
   │Cancelled│             │ Shipped │
   └─────────┘             └────┬────┘
                                │ confirm()
                                ▼
                           ┌─────────┐
                           │ Completed│
                           └─────────┘
\`\`\`

### 4.3 状态类设计原则

1. **状态类无状态**:不存数据,数据在 Context
2. **状态类可复用**:用单例或享元(状态对象本身没数据)
3. **转换规则集中**:状态类内部决定切到哪个状态
4. **非法操作友好**:不支持的操作返回提示,不抛异常(或抛特定异常)

\`\`\`python
class SingletonState(State):
    """状态单例:所有 Context 共享同一个状态对象。"""
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
\`\`\`

---

## 五、完整 Demo:订单状态机

下面是一个完整的订单状态机。

\`\`\`python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ====== 1. Context: 订单 ======

@dataclass
class Order:
    """订单,Context 角色。

    持有状态和订单数据。状态对象决定能做什么。
    """
    order_id: str
    amount: float
    items: list[str] = field(default_factory=list)
    _state: "OrderState" = field(default=None, repr=False)
    created_at: datetime = field(default_factory=datetime.now)
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    def __post_init__(self):
        if self._state is None:
            self._state = NewState()

    @property
    def state(self) -> "OrderState":
        return self._state

    def _change_state(self, new_state: "OrderState") -> None:
        logger.info(f"订单 {self.order_id}: {self._state.name} -> {new_state.name}")
        self._state = new_state

    # 业务操作委托给状态
    def pay(self) -> str:
        return self._state.pay(self)

    def ship(self) -> str:
        return self._state.ship(self)

    def confirm_receipt(self) -> str:
        return self._state.confirm_receipt(self)

    def cancel(self) -> str:
        return self._state.cancel(self)

    def status(self) -> str:
        return self._state.name

# ====== 2. State 抽象 ======

class OrderState(ABC):
    """订单状态抽象基类。"""
    name: str = "Unknown"

    @abstractmethod
    def pay(self, order: Order) -> str:
        """支付。"""
        ...

    @abstractmethod
    def ship(self, order: Order) -> str:
        """发货。"""
        ...

    @abstractmethod
    def confirm_receipt(self, order: Order) -> str:
        """确认收货。"""
        ...

    @abstractmethod
    def cancel(self, order: Order) -> str:
        """取消。"""
        ...

    def _not_allowed(self, action: str) -> str:
        return f"当前状态[{self.name}]不允许操作: {action}"

# ====== 3. 具体状态 ======

class NewState(OrderState):
    """新建状态:可支付、可取消,不可发货。"""
    name = "新建"

    def pay(self, order: Order) -> str:
        order.paid_at = datetime.now()
        order._change_state(PaidState())
        return f"订单 {order.order_id} 支付成功,金额 {order.amount}"

    def ship(self, order: Order) -> str:
        return self._not_allowed("发货(未支付)")

    def confirm_receipt(self, order: Order) -> str:
        return self._not_allowed("确认收货(未支付)")

    def cancel(self, order: Order) -> str:
        order.cancelled_at = datetime.now()
        order._change_state(CancelledState())
        return f"订单 {order.order_id} 已取消"

class PaidState(OrderState):
    """已支付状态:可发货、可取消(退款),不可支付。"""
    name = "已支付"

    def pay(self, order: Order) -> str:
        return self._not_allowed("重复支付")

    def ship(self, order: Order) -> str:
        order.shipped_at = datetime.now()
        order._change_state(ShippedState())
        return f"订单 {order.order_id} 已发货"

    def confirm_receipt(self, order: Order) -> str:
        return self._not_allowed("确认收货(未发货)")

    def cancel(self, order: Order) -> str:
        order.cancelled_at = datetime.now()
        order._change_state(CancelledState())
        return f"订单 {order.order_id} 已取消,退款处理中"

class ShippedState(OrderState):
    """已发货状态:可确认收货,不可支付/发货/取消。"""
    name = "已发货"

    def pay(self, order: Order) -> str:
        return self._not_allowed("支付(已发货)")

    def ship(self, order: Order) -> str:
        return self._not_allowed("重复发货")

    def confirm_receipt(self, order: Order) -> str:
        order.completed_at = datetime.now()
        order._change_state(CompletedState())
        return f"订单 {order.order_id} 已确认收货,交易完成"

    def cancel(self, order: Order) -> str:
        return self._not_allowed("取消(已发货,需走售后)")

class CompletedState(OrderState):
    """已完成状态:终态,所有操作都禁止。"""
    name = "已完成"

    def pay(self, order: Order) -> str:
        return self._not_allowed("支付(已完成)")

    def ship(self, order: Order) -> str:
        return self._not_allowed("发货(已完成)")

    def confirm_receipt(self, order: Order) -> str:
        return self._not_allowed("重复确认")

    def cancel(self, order: Order) -> str:
        return self._not_allowed("取消(已完成,需走售后)")

class CancelledState(OrderState):
    """已取消状态:终态,所有操作都禁止。"""
    name = "已取消"

    def pay(self, order: Order) -> str:
        return self._not_allowed("支付(已取消)")

    def ship(self, order: Order) -> str:
        return self._not_allowed("发货(已取消)")

    def confirm_receipt(self, order: Order) -> str:
        return self._not_allowed("确认收货(已取消)")

    def cancel(self, order: Order) -> str:
        return self._not_allowed("重复取消")

# ====== 4. 客户端 ======

def main():
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    # 创建订单
    order = Order(order_id="ORD-001", amount=299.0, items=["书", "笔"])
    print(f"初始状态: {order.status()}")  # 新建

    # 尝试发货(未支付,应失败)
    print(order.ship())  # 不允许

    # 支付
    print(order.pay())   # 支付成功
    print(f"当前状态: {order.status()}")  # 已支付

    # 重复支付(应失败)
    print(order.pay())   # 不允许

    # 发货
    print(order.ship())  # 已发货
    print(f"当前状态: {order.status()}")  # 已发货

    # 尝试取消(已发货,应失败)
    print(order.cancel())  # 不允许

    # 确认收货
    print(order.confirm_receipt())  # 交易完成
    print(f"当前状态: {order.status()}")  # 已完成

    print("\\n--- 测试取消流程 ---")
    order2 = Order(order_id="ORD-002", amount=100.0)
    print(order2.cancel())  # 取消
    print(f"当前状态: {order2.status()}")  # 已取消
    print(order2.pay())  # 不允许

if __name__ == "__main__":
    main()
\`\`\`

运行结果:

\`\`\`
初始状态: 新建
当前状态[新建]不允许操作: 发货(未支付)
订单 ORD-001 支付成功,金额 299.0
订单 ORD-001: 新建 -> 已支付
当前状态: 已支付
当前状态[已支付]不允许操作: 重复支付
订单 ORD-001 已发货
订单 ORD-001: 已支付 -> 已发货
当前状态: 已发货
当前状态[已发货]不允许操作: 取消(已发货,需走售后)
订单 ORD-001 已确认收货,交易完成
订单 ORD-001: 已发货 -> 已完成
当前状态: 已完成

--- 测试取消流程 ---
订单 ORD-002 已取消
订单 ORD-002: 新建 -> 已取消
当前状态: 已取消
当前状态[已取消]不允许操作: 支付(已取消)
\`\`\`

---

## 六、状态 vs 策略

状态模式和策略模式结构几乎一样(都是「Context 持有对象,委托执行」),但语义和用途不同。

### 6.1 核心区别

| 维度 | 状态模式 | 策略模式 |
|------|----------|----------|
| **核心目的** | 行为随状态变 | 算法可替换 |
| **谁决定切换** | 状态自己切换(内部) | 客户端注入(外部) |
| **切换时机** | 运行时自动切换 | 客户端主动选 |
| **状态数量** | 通常多个,有转换规则 | 通常 1 个,随意换 |
| **状态关系** | 有转换图,相互关联 | 互相独立 |
| **典型场景** | 订单状态机 | 折扣、排序 |
| **生命周期** | 状态长期存在,轮换 | 策略用完可弃 |

### 6.2 通俗类比

- **状态**:红绿灯,红→绿→黄是自动按规则切换,你不能随意选
- **策略**:你选交通工具(公交/地铁/打车),你想换就换,没有固定规则

### 6.3 代码对比

\`\`\`python
# 状态:状态自己切换
class PaidState(OrderState):
    def ship(self, order):
        order._change_state(ShippedState())  # 内部切换

# 策略:客户端切换
order = Order(price=100, discount=PercentageDiscount(0.8))
order.discount = NormalDiscount()  # 客户端决定
\`\`\`

### 6.4 如何选择

| 场景 | 推荐 |
|------|------|
| 行为随状态变化,状态有转换规则 | 状态模式 |
| 算法可替换,客户端选 | 策略模式 |
| 状态会自动切换 | 状态模式 |
| 策略是外部决定的 | 策略模式 |
| 有「状态图」 | 状态模式 |
| 有「算法菜单」 | 策略模式 |

---

## 七、高级话题

### 7.1 状态机与 transitions 库

Python 有专门的状态机库 \`transitions\`,声明式定义状态:

\`\`\`python
from transitions import Machine

class Order:
    pass

states = ['new', 'paid', 'shipped', 'completed', 'cancelled']
transitions = [
    {'trigger': 'pay', 'source': 'new', 'dest': 'paid'},
    {'trigger': 'ship', 'source': 'paid', 'dest': 'shipped'},
    {'trigger': 'confirm', 'source': 'shipped', 'dest': 'completed'},
    {'trigger': 'cancel', 'source': ['new', 'paid'], 'dest': 'cancelled'},
]

machine = Machine(Order(), states=states, transitions=transitions, initial='new')
order = Order()
order.pay()       # new -> paid
print(order.state)  # paid
order.ship()      # paid -> shipped
order.cancel()    # 抛异常,shipped 不能 cancel
\`\`\`

### 7.2 状态持久化

订单状态需要持久化到数据库,下次加载恢复:

\`\`\`python
STATE_MAP = {
    "new": NewState,
    "paid": PaidState,
    "shipped": ShippedState,
    "completed": CompletedState,
    "cancelled": CancelledState,
}

def save_order(order: Order) -> dict:
    return {
        "order_id": order.order_id,
        "amount": order.amount,
        "state": order.state.name,
    }

def load_order(data: dict) -> Order:
    order = Order(order_id=data["order_id"], amount=data["amount"])
    state_cls = STATE_MAP[data["state"]]
    order._state = state_cls()
    return order
\`\`\`

### 7.3 状态模式与事件驱动

状态转换可触发事件:

\`\`\`python
class OrderWithEvents(Order):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._listeners = []

    def on_transition(self, listener):
        self._listeners.append(listener)

    def _change_state(self, new_state):
        old = self._state
        super()._change_state(new_state)
        for listener in self._listeners:
            listener(old, new_state, self)

def audit_log(old, new, order):
    print(f"[审计] {order.order_id}: {old.name} -> {new.name}")

order = OrderWithEvents(order_id="X", amount=100)
order.on_transition(audit_log)
order.pay()  # 触发审计日志
\`\`\`

### 7.4 状态模式的单元测试

\`\`\`python
import pytest

class TestOrderStateMachine:
    def test_new_can_pay(self):
        order = Order(order_id="1", amount=100)
        result = order.pay()
        assert "支付成功" in result
        assert order.status() == "已支付"

    def test_new_cannot_ship(self):
        order = Order(order_id="1", amount=100)
        result = order.ship()
        assert "不允许" in result
        assert order.status() == "新建"

    def test_paid_can_ship(self):
        order = Order(order_id="1", amount=100)
        order.pay()
        result = order.ship()
        assert "已发货" in result
        assert order.status() == "已发货"

    def test_shipped_cannot_cancel(self):
        order = Order(order_id="1", amount=100)
        order.pay()
        order.ship()
        result = order.cancel()
        assert "不允许" in result

    def test_full_flow(self):
        order = Order(order_id="1", amount=100)
        order.pay()
        order.ship()
        order.confirm_receipt()
        assert order.status() == "已完成"
        # 终态不能操作
        assert "不允许" in order.pay()
        assert "不允许" in order.cancel()
\`\`\`

---

## 八、易错点小结

| # | 易错点 | 后果 | 正确做法 |
|---|--------|------|----------|
| 1 | 状态类持有可变数据 | 状态共享出问题 | 数据存 Context,状态无状态 |
| 2 | Context 直接改 _state 不走方法 | 跳过转换日志/事件 | 用 _change_state 方法 |
| 3 | 状态转换规则散落在 Context | 失去模式意义 | 转换在状态类内部 |
| 4 | 状态对象每次新建 | 内存浪费 | 用单例或享元 |
| 5 | 非法操作抛异常导致流程中断 | 用户体验差 | 返回提示字符串 |
| 6 | 状态机有环没终止条件 | 死循环 | 终态设计 + 测试 |
| 7 | 忘记持久化状态 | 重启状态丢失 | state.name 序列化 |
| 8 | 状态类相互 import | 循环依赖 | 用 TYPE_CHECKING 或字符串引用 |
| 9 | 用 if/else 替代状态类 | 退化为非模式 | 状态多于 3 个就用模式 |
| 10 | 状态和策略混淆 | 设计错误 | 记住:状态自动切换,策略外部注入 |

---

## 九、本章总结

状态模式的本质是**「用类表示状态,行为随状态变」**:

1. **抽象**:State 接口声明所有状态相关操作
2. **封装**:每个状态一个类,自己决定能做什么
3. **委托**:Context 把请求转给当前状态
4. **转换**:状态类内部决定何时切到哪个状态

状态模式是状态机(Model-View-Controller 中的 Model)的面向对象实现。当你发现代码里有一堆 \`if state == "xxx"\` 时,就该考虑状态模式了。订单、工作流、游戏角色、网络连接,这些有「生命周期」的对象都适合用状态模式。掌握状态模式,你会对「有限状态机 FSM」这个计算机科学基础概念有更深的工程理解。
`,
  },
];
