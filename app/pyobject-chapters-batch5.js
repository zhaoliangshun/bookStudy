// =============================================================
// Python 面向对象教程（pyobject）—— 第五批章节
// -------------------------------------------------------------
// 实战项目（20-24章）
//   第 20 章：实战项目 1：银行账户系统
//   第 21 章：实战项目 2：图形渲染器
//   第 22 章：实战项目 3：购物车
//   第 23 章：实战项目 4：插件系统
//   第 24 章：实战项目 5：OOP 最佳实践与常见陷阱
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十章：实战项目 1：银行账户系统
  // =========================================================
  {
    id: "po-20",
    group: "实战项目",
    icon: "🏦",
    title: "实战项目 1：银行账户系统",
    content: `## 一、项目目标

用 OOP 实现一个简单的银行账户系统，涵盖：
- 封装
- 继承
- 多态
- 魔术方法
- property
- dataclass

## 二、需求分析

1. 多种账户类型：储蓄账户、信用卡账户
2. 操作：存款、取款、转账
3. 利率：储蓄账户有利息
4. 透支：信用卡可以透支
5. 记录：交易历史
6. 报告：月度对账单

## 三、类设计

\`\`\`
Account（基类）
├── SavingsAccount（储蓄账户，有利息）
└── CreditCardAccount（信用卡，有透支额度）
\`\`\`

## 四、核心功能

- 存款（deposit）
- 取款（withdraw）
- 转账（transfer）
- 查询余额
- 交易历史
- 月度对账单

## 五、关键 OOP 知识点

- **封装**：用 property 控制余额访问
- **继承**：SavingsAccount 和 CreditCardAccount 继承 Account
- **多态**：withdraw 行为不同
- **魔术方法**：\__str__\、\__repr__\、\__eq__\

## 六、本章 demo

完整实现一个银行账户系统。
`,
    code: `"""
第二十章 demo：银行账户系统
演示完整的 OOP 项目：
  - 基类 Account
  - 子类 SavingsAccount、CreditCardAccount
  - 转账功能
  - 交易历史
  - 月度报告

OOP 知识点：
  - 封装（property + __）
  - 继承（Account 基类）
  - 多态（不同 withdraw 行为）
  - 魔术方法（__str__、__repr__、__add__）
"""
from datetime import datetime
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


# ===== 交易记录 =====
@dataclass
class Transaction:
    """交易记录"""
    type: str          # 存款/取款/转账
    amount: float
    timestamp: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    note: str = ""


# ===== 账户基类 =====
class Account(ABC):
    """账户基类（抽象）"""

    def __init__(self, owner, account_no, balance=0):
        self._owner = owner
        self._account_no = account_no
        self._balance = balance
        self._history = []
        self._created_at = datetime.now()

    # ---- property 受控访问 ----
    @property
    def owner(self):
        return self._owner

    @property
    def account_no(self):
        return self._account_no

    @property
    def balance(self):
        return self._balance

    @property
    def history(self):
        return tuple(self._history)  # 返回只读视图

    # ---- 通用操作 ----
    def deposit(self, amount):
        """存款"""
        if amount <= 0:
            raise ValueError("存款必须为正")
        self._balance += amount
        self._record("存款", amount)
        return self

    @abstractmethod
    def withdraw(self, amount):
        """取款（子类必须实现）"""
        pass

    def transfer(self, other, amount):
        """转账给另一个账户"""
        if not isinstance(other, Account):
            raise TypeError("目标必须是账户")
        self.withdraw(amount)
        other.deposit(amount)
        self._record("转出", amount, f"转给 {other._owner}")
        other._record("转入", amount, f"来自 {self._owner}")
        return self

    def _record(self, type_, amount, note=""):
        """记录交易"""
        self._history.append(Transaction(type_, amount, note=note))

    def statement(self, month=None):
        """月度对账单"""
        print(f"  对账单 - {self._owner} ({self._account_no})")
        print(f"  当前余额: ¥{self._balance:.2f}")
        if not self._history:
            print("  无交易记录")
            return
        print(f"  交易记录:")
        for t in self._history:
            print(f"    {t.timestamp} {t.type}: ¥{t.amount:.2f} {t.note}")

    # ---- 魔术方法 ----
    def __repr__(self):
        return f"{type(self).__name__}({self._owner!r}, {self._account_no!r}, balance={self._balance})"

    def __str__(self):
        return f"{self._owner} 的{type(self).__name__}：¥{self._balance:.2f}"

    def __eq__(self, other):
        return isinstance(other, Account) and self._account_no == other._account_no

    def __lt__(self, other):
        return self._balance < other._balance


# ===== 储蓄账户 =====
class SavingsAccount(Account):
    """储蓄账户：有利息"""

    interest_rate = 0.03  # 年利率 3%

    def __init__(self, owner, account_no, balance=0):
        super().__init__(owner, account_no, balance)
        self._interest_accrued = 0

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("取款必须为正")
        if amount > self._balance:
            raise ValueError("余额不足")
        self._balance -= amount
        self._record("取款", amount)
        return self

    def apply_interest(self):
        """结算利息"""
        interest = self._balance * self.interest_rate / 12  # 月利息
        self._balance += interest
        self._interest_accrued += interest
        self._record("利息", interest, f"月利率 {self.interest_rate/12:.4f}")
        return interest


# ===== 信用卡账户 =====
class CreditCardAccount(Account):
    """信用卡：有透支额度"""

    def __init__(self, owner, account_no, credit_limit=10000):
        super().__init__(owner, account_no, 0)  # 余额初始为 0
        self._credit_limit = credit_limit
        self._debt = 0  # 欠款

    @property
    def credit_limit(self):
        return self._credit_limit

    @property
    def available_credit(self):
        """可用额度"""
        return self._credit_limit - self._debt

    def withdraw(self, amount):
        """取现（信用卡是取现）"""
        if amount <= 0:
            raise ValueError("金额必须为正")
        if amount > self.available_credit:
            raise ValueError(f"超过可用额度 ¥{self.available_credit:.2f}")
        self._debt += amount
        self._balance -= amount
        self._record("取现", amount, f"欠款 ¥{self._debt:.2f}")
        return self

    def repay(self, amount):
        """还款"""
        if amount <= 0:
            raise ValueError("金额必须为正")
        if amount > self._debt:
            amount = self._debt
        self._debt -= amount
        self._balance += amount
        self._record("还款", amount, f"剩余欠款 ¥{self._debt:.2f}")
        return self


# ===== 测试 =====
print("=== 银行账户系统 ===")
print()

# 创建账户
savings = SavingsAccount("Alice", "S001", 1000)
credit = CreditCardAccount("Bob", "C001", 5000)

# 储蓄账户操作
print("--- 储蓄账户 ---")
savings.deposit(500)
savings.withdraw(200)
savings.apply_interest()
print(f"  {savings}")
print()

# 信用卡操作
print("--- 信用卡 ---")
credit.withdraw(2000)  # 取现
print(f"  可用额度: ¥{credit.available_credit:.2f}")
credit.repay(500)  # 还款
print(f"  {credit}")
print()

# 转账
print("--- 转账 ---")
savings.transfer(credit, 300)
print(f"  Alice: {savings}")
print(f"  Bob:   {credit}")
print()

# 对账单
print("--- 对账单 ---")
savings.statement()
print()
credit.statement()
print()

# 多态演示
print("--- 多态 ---")
accounts = [savings, credit]
for acc in accounts:
    try:
        acc.withdraw(100)
        print(f"  {acc.owner}: 成功取款，余额 ¥{acc.balance:.2f}")
    except ValueError as e:
        print(f"  {acc.owner}: {e}")
print()

# 排序（__lt__）
print("--- 排序 ---")
accounts.sort()
for acc in accounts:
    print(f"  {acc}")
`,
  },

  // =========================================================
  // 第二十一章：实战项目 2：图形渲染器
  // =========================================================
  {
    id: "po-21",
    group: "实战项目",
    icon: "🎨",
    title: "实战项目 2：图形渲染器",
    content: `## 一、项目目标

实现一个简单的图形渲染系统，支持：
- 多种图形（圆形、矩形、三角形）
- 渲染到不同格式（文本、SVG）
- 颜色、位置等属性
- 图形组合

## 二、类设计

\`\`\`
Shape（抽象基类）
├── Circle
├── Rectangle
├── Triangle
└── Group（组合）

Renderer
├── TextRenderer
└── SVGRenderer
\`\`\`

## 三、OOP 知识点

- **抽象基类**：Shape
- **多态**：不同 Shape 的 render
- **组合**：Group 包含多个 Shape
- **魔术方法**：\_\_len\_\_、\_\_iter\_\_
- **描述符**：可选：颜色验证

## 四、本章 demo

完整实现图形渲染器。
`,
    code: `"""
第二十一章 demo：图形渲染器
演示：
  - 抽象基类 Shape
  - 具体图形：Circle、Rectangle、Triangle
  - 组合：Group
  - 多种渲染器：Text、SVG
  - 颜色和变换

OOP 知识点：
  - 抽象基类（ABC）
  - 多态
  - 组合（has-a）
  - 魔术方法
"""
import math
from abc import ABC, abstractmethod
from dataclasses import dataclass


# ===== 颜色 =====
@dataclass(frozen=True)
class Color:
    """颜色"""
    r: int  # 0-255
    g: int
    b: int

    def __post_init__(self):
        if not all(0 <= v <= 255 for v in (self.r, self.g, self.b)):
            raise ValueError("RGB 必须在 0-255")

    def to_hex(self):
        return f"#{self.r:02x}{self.g:02x}{self.b:02x}"

    def __str__(self):
        return self.to_hex()


# 预定义颜色
RED = Color(255, 0, 0)
GREEN = Color(0, 255, 0)
BLUE = Color(0, 0, 255)
BLACK = Color(0, 0, 0)
WHITE = Color(255, 255, 255)


# ===== 图形基类 =====
class Shape(ABC):
    """图形（抽象）"""

    def __init__(self, color=BLACK):
        self.color = color

    @abstractmethod
    def area(self):
        """计算面积"""
        pass

    @abstractmethod
    def perimeter(self):
        """计算周长"""
        pass

    @abstractmethod
    def accept(self, renderer):
        """接受访问者（渲染器）"""
        pass

    def __repr__(self):
        return f"{type(self).__name__}(area={self.area():.2f})"


# ===== 圆形 =====
class Circle(Shape):
    """圆形"""

    def __init__(self, radius, color=BLACK):
        super().__init__(color)
        if radius < 0:
            raise ValueError("半径不能为负")
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def perimeter(self):
        return 2 * math.pi * self.radius

    def accept(self, renderer):
        return renderer.visit_circle(self)


# ===== 矩形 =====
class Rectangle(Shape):
    """矩形"""

    def __init__(self, width, height, color=BLACK):
        super().__init__(color)
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def accept(self, renderer):
        return renderer.visit_rectangle(self)


# ===== 三角形 =====
class Triangle(Shape):
    """三角形"""

    def __init__(self, base, height, color=BLACK):
        super().__init__(color)
        self.base = base
        self.height = height

    def area(self):
        return 0.5 * self.base * self.height

    def perimeter(self):
        # 等腰三角形估算
        side = math.sqrt((self.base / 2) ** 2 + self.height ** 2)
        return self.base + 2 * side

    def accept(self, renderer):
        return renderer.visit_triangle(self)


# ===== 组合 =====
class Group(Shape):
    """图形组合"""

    def __init__(self, *shapes, color=BLACK):
        super().__init__(color)
        self.shapes = list(shapes)

    def add(self, shape):
        self.shapes.append(shape)
        return self

    def area(self):
        return sum(s.area() for s in self.shapes)

    def perimeter(self):
        return sum(s.perimeter() for s in self.shapes)

    def __len__(self):
        return len(self.shapes)

    def __iter__(self):
        return iter(self.shapes)

    def __getitem__(self, i):
        return self.shapes[i]

    def accept(self, renderer):
        return renderer.visit_group(self)


# ===== 渲染器：访问者模式 =====
class Renderer(ABC):
    """渲染器（抽象）"""

    @abstractmethod
    def visit_circle(self, shape): pass

    @abstractmethod
    def visit_rectangle(self, shape): pass

    @abstractmethod
    def visit_triangle(self, shape): pass

    def visit_group(self, group):
        # 默认实现：递归
        results = []
        for shape in group:
            results.append(shape.accept(self))
        return results


class TextRenderer(Renderer):
    """文本渲染器"""

    def visit_circle(self, c):
        return f"圆形(半径={c.radius:.1f}, 颜色={c.color}, 面积={c.area():.2f})"

    def visit_rectangle(self, r):
        return f"矩形({r.width}x{r.height}, 颜色={r.color}, 面积={r.area():.2f})"

    def visit_triangle(self, t):
        return f"三角形(底={t.base}, 高={t.height}, 颜色={t.color}, 面积={t.area():.2f})"


class SVGRenderer(Renderer):
    """SVG 渲染器"""

    def visit_circle(self, c):
        return f'<circle r="{c.radius}" fill="{c.color}"/>'

    def visit_rectangle(self, r):
        return f'<rect width="{r.width}" height="{r.height}" fill="{r.color}"/>'

    def visit_triangle(self, t):
        points = f"0,{t.height} {t.base/2},0 {t.base},{t.height}"
        return f'<polygon points="{points}" fill="{t.color}"/>'


# ===== 测试 =====
print("=== 图形渲染器 ===")
print()

# 创建图形
shapes = [
    Circle(5, RED),
    Rectangle(4, 6, GREEN),
    Triangle(3, 8, BLUE),
]

# 文本渲染
print("--- 文本渲染 ---")
text_renderer = TextRenderer()
for shape in shapes:
    print(f"  {shape.accept(text_renderer)}")
print()

# 图形组合
print("--- 图形组合 ---")
group = Group(
    Circle(3, RED),
    Rectangle(2, 4, GREEN),
)
group.add(Triangle(5, 5, BLUE))
print(f"  组合: {group}")
print(f"  元素数: {len(group)}")
print(f"  总面积: {group.area():.2f}")
print()

# 渲染组合
print("--- 渲染组合 ---")
for shape in group:
    print(f"  {shape.accept(text_renderer)}")
print()

# SVG 渲染
print("--- SVG 片段 ---")
svg = SVGRenderer()
for shape in shapes:
    print(f"  {shape.accept(svg)}")
print()

# 多态
print("--- 多态 ---")
shapes_all = [
    Circle(2, RED),
    Rectangle(3, 3, GREEN),
    Triangle(4, 4, BLUE),
    Group(Circle(1), Rectangle(1, 1)),
]
for shape in shapes_all:
    print(f"  {shape.accept(text_renderer)}")
`,
  },

  // =========================================================
  // 第二十二章：实战项目 3：购物车
  // =========================================================
  {
    id: "po-22",
    group: "实战项目",
    icon: "🛒",
    title: "实战项目 3：购物车",
    content: `## 一、项目目标

实现一个完整的购物车系统：
- 商品类（Product）
- 购物车类（Cart）
- 用户类（User）
- 订单类（Order）
- 优惠策略

## 二、类设计

\`\`\`
Product      商品
Cart         购物车
User         用户
Discount     优惠（策略模式）
Order        订单
\`\`\`

## 三、OOP 知识点

- **组合**：Cart 包含 Product
- **策略模式**：不同 Discount
- **dataclass**：数据类简化
- **property**：计算总价
- **魔术方法**：\_\_len\_\_、\_\_iter\_\_、\_\_contains\_\_

## 四、核心功能

- 添加商品
- 删除商品
- 改数量
- 计算总价
- 应用优惠
- 生成订单

## 五、本章 demo

完整实现购物车。
`,
    code: `"""
第二十二章 demo：购物车系统
演示：
  - Product（商品）
  - Discount（优惠策略）
  - Cart（购物车）
  - User（用户）
  - Order（订单）

OOP 知识点：
  - 组合（has-a）
  - 策略模式
  - 抽象基类
  - property
  - dataclass
  - 容器协议
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List


# ===== 商品 =====
@dataclass
class Product:
    """商品"""
    name: str
    price: float
    stock: int = 0

    def __post_init__(self):
        if self.price < 0:
            raise ValueError("价格不能为负")
        if self.stock < 0:
            raise ValueError("库存不能为负")

    def __repr__(self):
        return f"Product({self.name!r}, ¥{self.price}, 库存 {self.stock})"


# ===== 购物车项 =====
@dataclass
class CartItem:
    """购物车项"""
    product: Product
    quantity: int = 1

    def __post_init__(self):
        if self.quantity <= 0:
            raise ValueError("数量必须为正")
        if self.quantity > self.product.stock:
            raise ValueError(f"{self.product.name} 库存不足")

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def __repr__(self):
        return f"CartItem({self.product.name} x {self.quantity} = ¥{self.subtotal})"


# ===== 优惠策略 =====
class Discount(ABC):
    """优惠基类"""

    @abstractmethod
    def apply(self, amount):
        """应用优惠，返回优惠后金额"""
        pass

    @abstractmethod
    def describe(self):
        """优惠说明"""
        pass


class NoDiscount(Discount):
    """无优惠"""
    def apply(self, amount):
        return amount

    def describe(self):
        return "无优惠"


class PercentageDiscount(Discount):
    """百分比折扣"""

    def __init__(self, percent):
        if not 0 <= percent <= 100:
            raise ValueError("百分比必须在 0-100")
        self.percent = percent

    def apply(self, amount):
        return amount * (1 - self.percent / 100)

    def describe(self):
        return f"{self.percent}% 折扣"


class FixedAmountDiscount(Discount):
    """满减"""

    def __init__(self, threshold, amount):
        self.threshold = threshold
        self.amount = amount

    def apply(self, amount):
        if amount >= self.threshold:
            return amount - self.amount
        return amount

    def describe(self):
        return f"满 ¥{self.threshold} 减 ¥{self.amount}"


# ===== 购物车 =====
class Cart:
    """购物车"""

    def __init__(self, owner):
        self.owner = owner
        self._items: List[CartItem] = []

    def add(self, product, quantity=1):
        """添加商品"""
        # 检查是否已经在购物车
        for item in self._items:
            if item.product == product:
                new_qty = item.quantity + quantity
                if new_qty > product.stock:
                    raise ValueError(f"{product.name} 库存不足")
                item.quantity = new_qty
                return self
        # 新商品
        self._items.append(CartItem(product, quantity))
        return self

    def remove(self, product):
        """删除商品"""
        self._items = [i for i in self._items if i.product != product]
        return self

    def clear(self):
        self._items.clear()

    def __len__(self):
        return len(self._items)

    def __iter__(self):
        return iter(self._items)

    def __getitem__(self, i):
        return self._items[i]

    def __contains__(self, product):
        return any(item.product == product for item in self._items)

    @property
    def subtotal(self):
        """原价"""
        return sum(item.subtotal for item in self._items)

    def total(self, discount=NoDiscount()):
        """应用优惠后"""
        amount = self.subtotal
        return discount.apply(amount)

    def checkout(self, discount=NoDiscount()):
        """结算，生成订单"""
        if not self._items:
            raise ValueError("购物车为空")
        order = Order(self.owner, list(self._items), discount)
        # 减少库存
        for item in self._items:
            item.product.stock -= item.quantity
        self.clear()
        return order

    def __repr__(self):
        return f"Cart({self.owner}, {len(self)} 项, 小计 ¥{self.subtotal})"


# ===== 用户 =====
@dataclass
class User:
    """用户"""
    name: str
    email: str
    is_member: bool = False


# ===== 订单 =====
@dataclass
class Order:
    """订单"""
    user: User
    items: list
    discount: Discount
    order_no: str = field(default_factory=lambda: datetime.now().strftime("%Y%m%d%H%M%S%f"))
    created_at: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items)

    @property
    def total(self):
        return self.discount.apply(self.subtotal)

    @property
    def saved(self):
        return self.subtotal - self.total

    def print_receipt(self):
        """打印小票"""
        print(f"  ===== 订单 {self.order_no} =====")
        print(f"  用户: {self.user.name}")
        print(f"  时间: {self.created_at}")
        print(f"  优惠: {self.discount.describe()}")
        print(f"  ----- 商品 -----")
        for item in self.items:
            print(f"    {item.product.name} x {item.quantity} = ¥{item.subtotal:.2f}")
        print(f"  ----- 合计 -----")
        print(f"    原价: ¥{self.subtotal:.2f}")
        print(f"    优惠: -¥{self.saved:.2f}")
        print(f"    实付: ¥{self.total:.2f}")


# ===== 测试 =====
print("=== 购物车系统 ===")
print()

# 创建商品
iphone = Product("iPhone 15", 6999, stock=10)
ipad = Product("iPad", 5999, stock=5)
macbook = Product("MacBook", 12999, stock=3)
airpods = Product("AirPods", 1299, stock=20)

# 创建用户
alice = User("Alice", "alice@example.com", is_member=True)

# 购物
cart = Cart(alice)
cart.add(iphone).add(ipad, 2).add(airpods, 3)
print(f"  购物车: {cart}")
print(f"  商品数: {len(cart)}")
print(f"  含 iPhone: {iphone in cart}")
print(f"  商品列表:")
for item in cart:
    print(f"    {item}")
print()

# 应用优惠
print("--- 优惠测试 ---")
discounts = [
    NoDiscount(),
    PercentageDiscount(10),
    FixedAmountDiscount(10000, 1000),
]
for d in discounts:
    print(f"  {d.describe()}: ¥{cart.subtotal} -> ¥{cart.total(d):.2f}")
print()

# 结算
print("--- 结算 ---")
order = cart.checkout(FixedAmountDiscount(10000, 1000))
order.print_receipt()
print()

# 库存变化
print("--- 库存变化 ---")
print(f"  iPhone 库存: {iphone.stock}")
print(f"  iPad 库存: {ipad.stock}")
print(f"  AirPods 库存: {airpods.stock}")
`,
  },

  // =========================================================
  // 第二十三章：实战项目 4：插件系统
  // =========================================================
  {
    id: "po-23",
    group: "实战项目",
    icon: "🔌",
    title: "实战项目 4：插件系统",
    content: `## 一、项目目标

实现一个可扩展的插件系统：
- 定义插件接口
- 自动发现/注册插件
- 通过配置启用/禁用插件
- 插件生命周期管理

## 二、类设计

\`\`\`
Plugin（抽象基类）
├── HelloPlugin
├── UpperPlugin
└── CountPlugin

PluginManager
Config
\`\`\`

## 三、OOP 知识点

- **抽象基类**：Plugin
- **元类**：自动注册
- **策略模式**：插件即策略
- **配置对象**：Config 类
- **依赖注入**：插件接收配置

## 四、核心功能

1. 插件接口统一
2. 自动注册（用 metaclass 或 \`__init_subclass__\`）
3. 插件查询
4. 启用/禁用
5. 链式调用

## 五、本章 demo

完整实现插件系统。
`,
    code: `"""
第二十三章 demo：插件系统
演示：
  - Plugin 抽象基类
  - 自动注册（__init_subclass__）
  - 多种插件实现
  - PluginManager 管理
  - 配置文件

OOP 知识点：
  - 抽象基类
  - __init_subclass__ 自动注册
  - 策略模式
  - 配置管理
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional


# ===== 配置 =====
@dataclass
class PluginConfig:
    """插件配置"""
    enabled_plugins: List[str] = field(default_factory=lambda: ["hello", "upper"])
    plugin_options: Dict[str, dict] = field(default_factory=dict)


# ===== 插件基类 =====
class Plugin(ABC):
    """插件基类"""

    # 注册表
    registry: Dict[str, "Plugin"] = {}

    def __init_subclass__(cls, **kwargs):
        """子类创建时自动注册"""
        super().__init_subclass__(**kwargs)
        if hasattr(cls, "name") and cls.name:
            instance = cls()
            Plugin.registry[cls.name] = instance
            print(f"  [注册插件] {cls.name}")

    @property
    @abstractmethod
    def name(self):
        pass

    @abstractmethod
    def run(self, *args, **kwargs):
        pass


# ===== 具体插件 =====
class HelloPlugin(Plugin):
    """问候插件"""

    @property
    def name(self):
        return "hello"

    def run(self, *args, **kwargs):
        name = args[0] if args else "World"
        return f"Hello, {name}!"


class UpperPlugin(Plugin):
    """转大写插件"""

    @property
    def name(self):
        return "upper"

    def run(self, *args, **kwargs):
        text = args[0] if args else ""
        return text.upper()


class ReversePlugin(Plugin):
    """反转插件"""

    @property
    def name(self):
        return "reverse"

    def run(self, *args, **kwargs):
        text = args[0] if args else ""
        return text[::-1]


class CountPlugin(Plugin):
    """计数插件"""

    @property
    def name(self):
        return "count"

    def run(self, *args, **kwargs):
        text = args[0] if args else ""
        return f"长度: {len(text)}"


class TemplatePlugin(Plugin):
    """模板插件"""

    def __init__(self):
        self.template = "[{name}] {message}"

    @property
    def name(self):
        return "template"

    def run(self, *args, **kwargs):
        name = kwargs.get("name", "System")
        message = args[0] if args else ""
        return self.template.format(name=name, message=message)


# ===== 插件管理器 =====
class PluginManager:
    """插件管理器"""

    def __init__(self, config: Optional[PluginConfig] = None):
        self.config = config or PluginConfig()
        self._enabled: Dict[str, bool] = {}
        self._update_enabled()

    def _update_enabled(self):
        self._enabled = {name: name in self.config.enabled_plugins
                         for name in Plugin.registry}

    def list_all(self):
        """列出所有插件"""
        return list(Plugin.registry.keys())

    def list_enabled(self):
        """列出启用的插件"""
        return [n for n, e in self._enabled.items() if e]

    def enable(self, name):
        if name not in Plugin.registry:
            raise ValueError(f"未知插件: {name}")
        self._enabled[name] = True

    def disable(self, name):
        if name not in Plugin.registry:
            raise ValueError(f"未知插件: {name}")
        self._enabled[name] = False

    def run(self, name, *args, **kwargs):
        """运行指定插件"""
        if name not in Plugin.registry:
            return f"[错误] 插件 {name} 未注册"
        if not self._enabled.get(name):
            return f"[跳过] 插件 {name} 已禁用"
        return Plugin.registry[name].run(*args, **kwargs)

    def run_pipeline(self, text, plugins: List[str]):
        """通过多个插件处理"""
        result = text
        for name in plugins:
            result = self.run(name, result)
        return result


# ===== 测试 =====
print("=== 插件系统 ===")
print()

# 列出所有注册的插件
print("--- 已注册插件 ---")
print(f"  {list(Plugin.registry.keys())}")
print()

# 创建管理器
config = PluginConfig(
    enabled_plugins=["hello", "upper", "template"],
    plugin_options={}
)
manager = PluginManager(config)
print()

# 列出启用的插件
print(f"  启用的: {manager.list_enabled()}")
print(f"  全部: {manager.list_all()}")
print()

# 运行单个插件
print("--- 运行单个插件 ---")
print(f"  hello('Alice'): {manager.run('hello', 'Alice')}")
print(f"  upper('hello'): {manager.run('upper', 'hello')}")
print(f"  count('hello'): {manager.run('count', 'hello')}")
print(f"  reverse('abc'): {manager.run('reverse', 'abc')}")
print(f"  template('msg', name='系统'): {manager.run('template', 'msg', name='系统')}")
print()

# 禁用插件
print("--- 禁用插件 ---")
manager.disable("upper")
print(f"  upper('hello') [已禁用]: {manager.run('upper', 'hello')}")
print()

# 启用
manager.enable("upper")
print(f"  upper('hello') [重新启用]: {manager.run('upper', 'hello')}")
print()

# 管道处理
print("--- 管道处理 ---")
result = manager.run_pipeline(
    "hello world",
    ["upper", "reverse"]
)
print(f"  'hello world' -> upper -> reverse: {result}")
print()

# 不同组合
print("--- 多种组合 ---")
pipelines = [
    (["upper"], "Hello World"),
    (["reverse", "upper"], "Hello World"),
    (["upper", "reverse", "count"], "Hello World"),
]
for plugins, text in pipelines:
    result = manager.run_pipeline(text, plugins)
    print(f"  {text} -> {plugins}: {result}")
`,
  },

  // =========================================================
  // 第二十四章：实战项目 5：OOP 最佳实践与常见陷阱
  // =========================================================
  {
    id: "po-24",
    group: "实战项目",
    icon: "🎓",
    title: "实战项目 5：OOP 最佳实践与常见陷阱",
    content: `## 一、OOP 的 5 大原则（S.O.L.I.D）

### S - Single Responsibility（单一职责）
一个类只做一件事。

### O - Open/Closed（开闭原则）
对扩展开放，对修改关闭。

### L - Liskov Substitution（里氏替换）
子类可以替换父类。

### I - Interface Segregation（接口隔离）
接口要小而专。

### D - Dependency Inversion（依赖倒置）
依赖抽象，不依赖具体。

## 二、Pythonic OOP

1. **少用复杂继承**：优先组合
2. **用 mixin**：横切关注点
3. **用 dataclass**：数据类简化
4. **鸭子类型**：别过度类型检查
5. **EAFP**：异常处理优于检查

## 三、OOP 常见陷阱

### 1. 钻石继承
\`\`\`
A
├── B
└── C
    └── D(B, C)
\`\`\`

### 2. 可变默认值
\`\`\`python
def __init__(self, items=[]):  # 危险！
    self.items = items
\`\`\`

### 3. 循环引用
A 持有 B，B 持有 A。

### 4. 过度设计
所有东西都搞成类。

### 5. 太深的继承
超过 3 层就难维护。

## 四、OOP vs 函数式

- OOP：实体多、状态多
- 函数式：纯计算、数据流

## 五、OOP 性能 tips

1. **__slots__**：节省内存
2. **避免深度继承**：方法查找慢
3. **用 dataclass(frozen=True)**：哈希更快

## 六、什么时候不用 OOP？

- 小脚本（<100 行）
- 纯数据处理
- 纯算法

## 七、OOP 进阶路径

1. 基础语法 ✅
2. 三大特性 ✅
3. 魔术方法 ✅
4. property + dataclass ✅
5. 描述符 + 元类（高级）
6. 设计模式（熟练）

## 八、本章 demo

展示各种 OOP 最佳实践和常见陷阱。
`,
    code: `"""
第二十四章 demo：OOP 最佳实践与常见陷阱
演示：
  1. 单一职责原则
  2. 开闭原则
  3. 可变默认值的陷阱
  4. __slots__ 优化
  5. 钻石继承的 MRO
  6. 组合优于继承
  7. 实战：用户认证系统
"""


# ===== 1. 单一职责原则 =====
class UserAuth:
    """只管认证"""
    def authenticate(self, username, password):
        return username == "admin" and password == "123456"


class UserLogger:
    """只管日志"""
    def log(self, message):
        print(f"  [LOG] {message}")


class UserNotifier:
    """只管通知"""
    def notify(self, message):
        print(f"  [NOTIFY] {message}")


print("=== 1. 单一职责 ===")
auth = UserAuth()
logger = UserLogger()
notifier = UserNotifier()
if auth.authenticate("admin", "123456"):
    logger.log("登录成功")
    notifier.notify("欢迎回来")
print()


# ===== 2. 开闭原则 =====
class DiscountStrategy(ABC):
    """折扣策略（对扩展开放）"""
    @abstractmethod
    def apply(self, amount):
        pass


class VIPDiscount(DiscountStrategy):
    def apply(self, amount):
        return amount * 0.8


class NewUserDiscount(DiscountStrategy):
    """新增策略，不修改原代码（对修改关闭）"""
    def apply(self, amount):
        return amount * 0.9


# ===== 3. 可变默认值的陷阱 =====
print("=== 3. 可变默认值的陷阱 ===")
print("  ❌ 错误写法：")
print("    def __init__(self, items=[]):")
print("        self.items = items")
print("    所有实例共享同一个列表！")
print()
print("  ✅ 正确写法：")

class Team:
    def __init__(self, members=None):
        self.members = members if members is not None else []
        # 或 self.members = list(members) if members else []
        # 或用 dataclass + field(default_factory=list)


t1 = Team()
t2 = Team()
t1.members.append("Alice")
print(f"  t1.members = {t1.members}")
print(f"  t2.members = {t2.members}（独立）")
print()


# ===== 4. __slots__ 优化 =====
class Point3D:
    """普通类：实例有 __dict__"""
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


class Point3DSlots:
    """用 __slots__：省内存，速度快"""
    __slots__ = ("x", "y", "z")

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z


print("=== 4. __slots__ 优化 ===")
p1 = Point3D(1, 2, 3)
p2 = Point3DSlots(1, 2, 3)
print(f"  普通类有 __dict__: {hasattr(p1, '__dict__')}")
print(f"  slots 类有 __dict__: {hasattr(p2, '__dict__')}")
print(f"  都可以访问: p2.x = {p2.x}")
try:
    p2.w = 10  # 不能加新属性
except AttributeError as e:
    print(f"  slots 类不能加新属性: {e}")
print()


# ===== 5. 钻石继承的 MRO =====
class A:
    def hello(self):
        return "A"


class B(A):
    def hello(self):
        return "B"


class C(A):
    def hello(self):
        return "C"


class D(B, C):
    pass


print("=== 5. 钻石继承 MRO ===")
d = D()
print(f"  D().hello() = {d.hello()}（B 优先）")
print(f"  MRO: {[c.__name__ for c in D.__mro__]}")
print()


# ===== 6. 组合优于继承 =====
class Engine:
    """引擎（独立组件）"""
    def start(self):
        return "Engine started"


class Wheel:
    """轮子（独立组件）"""
    def rotate(self):
        return "Wheel rotating"


# 用继承
class CarByInheritance(Engine):
    def drive(self):
        return f"{self.start()} and driving"


# 用组合（推荐）
class CarByComposition:
    def __init__(self):
        self.engine = Engine()
        self.wheels = [Wheel() for _ in range(4)]

    def start(self):
        return self.engine.start()

    def drive(self):
        return f"{self.start()} and {self.wheels[0].rotate()}"


print("=== 6. 组合优于继承 ===")
car1 = CarByInheritance()
car2 = CarByComposition()
print(f"  继承: {car1.drive()}")
print(f"  组合: {car2.drive()}")
print(f"  组合的好处: car2.engine = {type(car2.engine).__name__}（灵活替换）")
print()


# ===== 7. 实战：用户认证系统 =====
from dataclasses import dataclass, field
from typing import List


@dataclass
class User7:
    name: str
    email: str
    roles: List[str] = field(default_factory=list)


class AuthService:
    """认证服务：组合多个职责"""

    def __init__(self):
        self.users = {}  # email -> User
        self.logger = UserLogger()

    def register(self, name, email, roles=None):
        if email in self.users:
            raise ValueError("邮箱已注册")
        user = User7(name, email, roles or [])
        self.users[email] = user
        self.logger.log(f"注册用户: {name}")
        return user

    def has_role(self, email, role):
        user = self.users.get(email)
        return user and role in user.roles


print("=== 7. 实战：用户认证 ===")
auth_svc = AuthService()
admin = auth_svc.register("Alice", "alice@example.com", roles=["admin", "user"])
guest = auth_svc.register("Bob", "bob@example.com", roles=["user"])
print(f"  Alice is admin: {auth_svc.has_role('alice@example.com', 'admin')}")
print(f"  Bob is admin:   {auth_svc.has_role('bob@example.com', 'admin')}")
print()


# ===== 8. 总结 =====
print("=== 8. OOP 最佳实践总结 ===")
print("""
  1. 优先组合，少用继承
  2. 用 dataclass 简化数据类
  3. 用 property 控制访问
  4. 用 ABC 定义接口
  5. 用 Mixin 复用横切逻辑
  6. 避免可变默认值
  7. 用 __slots__ 优化性能
  8. 单一职责
  9. 依赖抽象
 10. 别为了 OOP 而 OOP
""")
`,
  },
];
