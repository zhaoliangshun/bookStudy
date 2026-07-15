/**
 * 《Python工作实战手册》第六批章节数据
 * 主题：面向对象与高级特性 · 代码组织的艺术
 * 共8章：类与对象基础、继承与多态、魔法方法、属性封装、类方法/静态方法、装饰器、生成器迭代器、上下文管理器
 */

export const chapters = [
  {
    id: "py-class-basic",
    group: "第六篇：面向对象与高级特性",
    icon: "🏛️",
    title: "类与对象基础",
    content: `# 🏛️ 类与对象基础

## 核心概念

**类（Class）** 是创建对象的蓝图/模板，**对象（Object）** 是类的具体实例。Python中"万物皆对象"。

\`\`\`python
# 定义类用class关键字
class User:
    # __init__是构造方法，创建对象时自动调用
    # self必须作为第一个参数，指向实例本身
    def __init__(self, name, age):
        self.name = name  # 实例属性
        self.age = age

    # 实例方法，第一个参数永远是self
    def greet(self):
        return f"大家好，我是{self.name}"

# 创建实例（对象）
user = User("张三", 28)
print(user.greet())
\`\`\`

## 工作场景

- **业务模型**：User、Order、Product、Employee等业务实体
- **数据封装**：把相关数据和操作绑定在一起
- **代码复用**：同一类对象共享方法定义

## 关键要点

| 概念 | 说明 |
|------|------|
| \`self\` | 指向实例本身，类似Java/C#的this，但必须显式写出 |
| \`__init__\` | 构造方法，初始化对象属性，不是真正的构造（真正的是__new__） |
| 实例属性 | 在\`__init__\`中通过\`self.xxx\`定义，每个实例独有 |
| \`__str__\` | print()时调用，给用户看的字符串表示 |
| \`__repr__\` | 调试时显示，给开发者看的字符串表示 |
`,
    code: `"""
Python工作实战手册 - 类与对象基础
工作场景：电商系统的用户模型定义
为什么用类：将数据（属性）和操作数据的方法封装在一起，符合现实世界建模
坑点：忘记self参数、在__init__外定义实例属性、类和对象概念混淆
"""


class Product:
    """商品类 - 电商系统中的核心业务模型

    为什么要定义Product类？
    - 每个商品都有名称、价格、库存这些属性
    - 每个商品都有计算折扣、更新库存这些行为
    - 用类把数据和操作绑定，比散落在各处的字典和函数更易维护
    """

    def __init__(self, product_id, name, price, stock=0):
        """构造方法 - 创建Product实例时自动调用

        为什么需要__init__？
        - 确保每个对象创建时就有必要的属性（初始状态合法）
        - 避免创建出"半成品"对象

        参数说明：
            self: 固定第一个参数，指向刚创建的实例本身，Python自动传入
            product_id: 商品ID（必填）
            name: 商品名称（必填）
            price: 商品价格（必填）
            stock: 库存数量，默认0（选填参数）

        坑点：
            1. 忘记写self参数 → 创建实例时会报TypeError
            2. 把属性名写错（如self.Name vs self.name）→ 后续访问找不到
            3. 参数名和属性名同名没问题，self.price = price是标准写法
        """
        self.product_id = product_id
        self.name = name
        self.price = price
        self.stock = stock
        self.created_at = "2024-01-01 00:00:00"

    def get_info(self):
        """获取商品信息 - 实例方法

        为什么用实例方法？
        - 方法需要访问实例的属性（self.name, self.price等）
        - 不同实例调用，返回各自的数据
        """
        return f"[{self.product_id}] {self.name} - ¥{self.price:.2f} (库存: {self.stock})"

    def apply_discount(self, discount_rate):
        """应用折扣 - 修改实例属性的方法

        工作场景：促销活动打折
        坑点：折扣率应该在0-1之间，需要校验
        """
        if not 0 < discount_rate <= 1:
            raise ValueError("折扣率必须在0到1之间")
        discounted_price = self.price * (1 - discount_rate)
        return round(discounted_price, 2)

    def reduce_stock(self, quantity):
        """减少库存 - 下单时调用

        工作场景：用户下单后扣减库存
        返回：True扣减成功，False库存不足
        """
        if quantity <= 0:
            raise ValueError("数量必须大于0")
        if self.stock >= quantity:
            self.stock -= quantity
            return True
        return False

    def __str__(self):
        """__str__方法 - print()或str()时调用

        为什么要写__str__？
        - 默认打印对象是<__main__.Product object at 0x...>，用户看不懂
        - 定义__str__后可以友好显示，给用户看的
        """
        return f"Product(name='{self.name}', price={self.price})"

    def __repr__(self):
        """__repr__方法 - 开发者调试时显示（repr()或控制台直接输出）

        和__str__的区别：
        - __str__：给用户看的，简洁友好
        - __repr__：给开发者看的，最好能还原对象，通常更详细
        - 如果只定义一个，优先定义__repr__（__str__会默认用__repr__）
        """
        return f"Product(product_id={self.product_id!r}, name={self.name!r}, price={self.price!r}, stock={self.stock!r})"


class Order:
    """订单类 - 另一个业务模型示例

    演示：类可以包含其他类的对象（组合关系）
    """

    def __init__(self, order_id, user_id):
        self.order_id = order_id
        self.user_id = user_id
        self.items = []
        self.total_amount = 0.0
        self.status = "待支付"

    def add_item(self, product, quantity):
        """添加商品到订单

        参数product是Product类的实例！
        这就是"对象之间的交互"
        """
        if product.reduce_stock(quantity):
            self.items.append({"product": product, "quantity": quantity})
            self.total_amount += product.price * quantity
            return True
        print(f"添加失败：{product.name}库存不足")
        return False

    def get_order_detail(self):
        """获取订单详情"""
        lines = [f"订单号: {self.order_id}", f"用户ID: {self.user_id}"]
        lines.append("-" * 40)
        for item in self.items:
            p = item["product"]
            lines.append(f"{p.name} x {item['quantity']} = ¥{p.price * item['quantity']:.2f}")
        lines.append("-" * 40)
        lines.append(f"总计: ¥{self.total_amount:.2f}")
        lines.append(f"状态: {self.status}")
        return "\\n".join(lines)


def main():
    """主函数 - 演示类和对象的使用"""

    print("=" * 50)
    print("1. 创建类的实例（对象）")
    print("=" * 50)

    laptop = Product("P001", "MacBook Pro 14寸", 14999.0, stock=10)
    phone = Product("P002", "iPhone 15 Pro", 8999.0, stock=25)
    mouse = Product("P003", "无线鼠标", 199.0, stock=100)

    print(f"laptop类型: {type(laptop)}")
    print(f"laptop是Product的实例吗？{isinstance(laptop, Product)}")

    print("\\n" + "=" * 50)
    print("2. 访问对象属性和调用实例方法")
    print("=" * 50)

    print(laptop.get_info())
    print(phone.get_info())
    print(mouse.get_info())

    print("\\n" + "=" * 50)
    print("3. __str__和__repr__的区别")
    print("=" * 50)

    print(f"str(laptop): {str(laptop)}")
    print(f"repr(laptop): {repr(laptop)}")
    print(f"print(laptop):", end=" ")
    print(laptop)

    print("\\n" + "=" * 50)
    print("4. 调用修改对象状态的方法")
    print("=" * 50)

    print(f"原始价格: ¥{laptop.price:.2f}")
    price_8zhe = laptop.apply_discount(0.2)
    print(f"8折后价格: ¥{price_8zhe:.2f}")

    print(f"\\n购买前库存: {phone.stock}")
    success = phone.reduce_stock(2)
    print(f"购买2台是否成功: {success}")
    print(f"购买后库存: {phone.stock}")

    print("\\n" + "=" * 50)
    print("5. 对象之间的交互（组合）：创建订单")
    print("=" * 50)

    order = Order("ORD20240101001", "U001")
    order.add_item(laptop, 1)
    order.add_item(phone, 2)
    order.add_item(mouse, 1)

    print(order.get_order_detail())

    print("\\n" + "=" * 50)
    print("6. 类 vs 对象的关系演示")
    print("=" * 50)

    p1 = Product("P004", "商品A", 100.0, stock=5)
    p2 = Product("P005", "商品B", 200.0, stock=3)

    print(f"p1和p2都是Product类的实例，但属性不同：")
    print(f"  p1: {p1.name} - ¥{p1.price}")
    print(f"  p2: {p2.name} - ¥{p2.price}")
    print(f"类是蓝图，对象是根据蓝图造出的具体房子！")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-class-advanced",
    group: "第六篇：面向对象与高级特性",
    icon: "🏗️",
    title: "类的进阶：继承与多态",
    content: `# 🏗️ 类的进阶：继承与多态

## 继承（Inheritance）

继承让子类复用父类的属性和方法，实现代码复用。

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("子类必须实现")

class Dog(Animal):
    def speak(self):
        return f"{self.name}：汪汪！"

class Cat(Animal):
    def speak(self):
        return f"{self.name}：喵～"
\`\`\`

## 多态（Polymorphism）

Python的多态基于"鸭子类型"：如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。

\`\`\`python
def make_speak(animal):
    print(animal.speak())

make_speak(Dog("阿黄"))  # 阿黄：汪汪！
make_speak(Cat("小花"))  # 小花：喵～
\`\`\`

## 关键要点

| 概念 | 说明 |
|------|------|
| \`class Child(Parent):\` | 单继承，括号里写父类名 |
| \`super()\` | 调用父类的方法，特别是\`__init__\` |
| 方法重写 | 子类定义和父类同名的方法 |
| \`isinstance()\` | 判断对象是否是某类（或其父类）的实例 |
| MRO | Method Resolution Order，多继承时方法解析顺序 |

⚠️ **坑点**：子类\`__init__\`一定要调用\`super().__init__()\`，否则父类初始化逻辑不会执行！
`,
    code: `"""
Python工作实战手册 - 继承与多态
工作场景：电商系统支付方式、员工类型、通知渠道等"通用基类+多种具体实现"的场景
为什么用继承：复用公共代码，统一接口规范，扩展新类型时不用改现有代码（开闭原则）
坑点：忘记调用super().__init__、过度使用继承、多继承导致MRO混乱
"""


class PaymentMethod:
    """支付方式基类（抽象概念）

    为什么要基类？
    - 所有支付方式都有支付、退款这些共同行为
    - 但具体实现不同（微信走微信API，支付宝走支付宝API）
    - 基类定义"接口规范"，子类负责具体实现
    - 这就是"面向接口编程"思想
    """

    def __init__(self, name, enabled=True):
        """基类初始化方法

        坑点：子类__init__必须调用super().__init__()！
        否则父类定义的属性（name, enabled）不会初始化，后续调用方法会报错
        """
        self.name = name
        self.enabled = enabled
        self.payment_count = 0

    def pay(self, amount, order_id):
        """支付方法 - 基类定义接口，子类必须实现

        为什么这里抛出异常而不是pass？
        - 强制子类必须重写这个方法，防止忘记
        - 如果子类没实现，调用时会给出明确错误，而不是静默失败
        """
        raise NotImplementedError(f"{self.__class__.__name__} 必须实现 pay() 方法")

    def refund(self, amount, order_id):
        """退款方法 - 基类定义接口"""
        raise NotImplementedError(f"{self.__class__.__name__} 必须实现 refund() 方法")

    def get_status(self):
        """获取支付方式状态 - 所有子类通用，不需要重写（复用！）

        这就是继承的好处：公共逻辑只写一遍，所有子类自动拥有
        """
        status = "启用" if self.enabled else "禁用"
        return f"{self.name} [{status}] | 已处理{self.payment_count}笔"


class WeChatPay(PaymentMethod):
    """微信支付 - 继承PaymentMethod

    为什么不需要写__init__？
    - 如果子类不需要额外属性，可以不重写__init__
    - Python会自动调用父类的__init__
    - 如果子类有自己的初始化逻辑，才需要重写并调用super()
    """

    def pay(self, amount, order_id):
        """实现微信支付逻辑

        这就是"方法重写（Override）"：子类提供自己的实现
        """
        if not self.enabled:
            return False, "微信支付已禁用"
        print(f"[微信支付] 订单{order_id} 支付¥{amount:.2f}")
        print(f"  → 调用微信API...")
        print(f"  → 生成付款二维码...")
        self.payment_count += 1
        return True, "微信支付成功"

    def refund(self, amount, order_id):
        print(f"[微信退款] 订单{order_id} 退款¥{amount:.2f}")
        print(f"  → 调用微信退款API...")
        return True, "微信退款成功"


class Alipay(PaymentMethod):
    """支付宝支付 - 另一个子类"""

    def __init__(self, name="支付宝", enabled=True, app_id=None):
        """支付宝有额外的app_id参数，所以需要重写__init__

        坑点：必须先调用super().__init__()！
        顺序：先初始化父类部分，再初始化子类自己的属性
        """
        super().__init__(name, enabled)
        self.app_id = app_id or "default_app_id"
        self.promotion_discount = 0.0

    def pay(self, amount, order_id):
        if not self.enabled:
            return False, "支付宝已禁用"
        actual_amount = amount * (1 - self.promotion_discount)
        print(f"[支付宝] 订单{order_id} 支付¥{actual_amount:.2f} (原价¥{amount:.2f})")
        print(f"  → AppID: {self.app_id}")
        print(f"  → 跳转支付宝页面...")
        self.payment_count += 1
        return True, f"支付宝支付成功，优惠¥{amount - actual_amount:.2f}"

    def refund(self, amount, order_id):
        print(f"[支付宝退款] 订单{order_id} 退款¥{amount:.2f}")
        return True, "支付宝退款成功"

    def set_promotion(self, discount_rate):
        """支付宝专属方法：设置促销折扣

        子类可以有自己独有的方法，父类没有
        """
        self.promotion_discount = discount_rate
        print(f"[支付宝] 设置促销折扣：{discount_rate*100:.0f}%")


class BankCardPay(PaymentMethod):
    """银行卡支付 - 演示isinstance和多继承注意点"""

    def __init__(self, name="银行卡支付", enabled=True, bank_name="工商银行"):
        super().__init__(name, enabled)
        self.bank_name = bank_name

    def pay(self, amount, order_id):
        if not self.enabled:
            return False, "银行卡支付已禁用"
        print(f"[{self.bank_name}银行卡] 订单{order_id} 支付¥{amount:.2f}")
        print(f"  → 验证银行卡信息...")
        print(f"  → 输入密码...")
        self.payment_count += 1
        return True, "银行卡支付成功"

    def refund(self, amount, order_id):
        print(f"[{self.bank_name}银行卡退款] 订单{order_id} 退款¥{amount:.2f}")
        print(f"  → 退款将在1-3个工作日到账")
        return True, "银行卡退款受理成功"


def process_payment(payment_method, amount, order_id):
    """处理支付 - 多态的体现！

    关键：这个函数不知道也不关心payment_method具体是什么类型
    只要它有pay()方法就行（鸭子类型）
    以后新增CreditCardPay、ApplePay...都不用改这个函数！

    这就是多态的威力：新增类型不影响现有代码
    """
    print(f"\\n{'─' * 50}")
    print(f"正在处理支付：{payment_method.get_status()}")
    print(f"{'─' * 50}")
    success, message = payment_method.pay(amount, order_id)
    print(f"结果：{message}")
    return success


def main():
    """主函数 - 演示继承、多态、类型检查"""

    print("=" * 60)
    print("1. 创建各种支付方式实例")
    print("=" * 60)

    wechat = WeChatPay("微信支付")
    alipay = Alipay(app_id="2021000123456789")
    alipay.set_promotion(0.05)
    icbc = BankCardPay(bank_name="工商银行")
    abc = BankCardPay(name="农行卡支付", bank_name="农业银行")

    payments = [wechat, alipay, icbc, abc]

    print("\\n各支付方式状态：")
    for p in payments:
        print(f"  {p.get_status()}")

    print("\\n" + "=" * 60)
    print("2. 多态演示：同一函数处理不同类型的对象")
    print("=" * 60)

    process_payment(wechat, 199.0, "ORD001")
    process_payment(alipay, 299.0, "ORD002")
    process_payment(icbc, 599.0, "ORD003")

    print("\\n支付后状态：")
    for p in payments:
        print(f"  {p.get_status()}")

    print("\\n" + "=" * 60)
    print("3. isinstance类型检查")
    print("=" * 60)

    print(f"wechat是WeChatPay吗？{isinstance(wechat, WeChatPay)}")
    print(f"wechat是PaymentMethod吗？{isinstance(wechat, PaymentMethod)}")
    print(f"alipay是BankCardPay吗？{isinstance(alipay, BankCardPay)}")
    print(f"alipay是PaymentMethod吗？{isinstance(alipay, PaymentMethod)}")

    print("\\n为什么isinstance(wechat, PaymentMethod)是True？")
    print("→ 因为WeChatPay继承自PaymentMethod，子类实例也是父类的实例")
    print("→ 这就是'是一个（is-a）'关系：微信支付是一种支付方式")

    print("\\n" + "=" * 60)
    print("4. 类变量 vs 实例变量演示")
    print("=" * 60)

    class TestClass:
        class_var = "我是类变量（所有实例共享）"

        def __init__(self, value):
            self.instance_var = value

    t1 = TestClass("实例1的值")
    t2 = TestClass("实例2的值")

    print(f"t1.class_var = {t1.class_var}")
    print(f"t2.class_var = {t2.class_var}")
    print(f"TestClass.class_var = {TestClass.class_var}")

    TestClass.class_var = "修改类变量"
    print(f"\\n修改后：")
    print(f"t1.class_var = {t1.class_var}")
    print(f"t2.class_var = {t2.class_var}")

    t1.class_var = "t1给同名属性赋值（这不是类变量！）"
    print(f"\\nt1给class_var赋值后：")
    print(f"t1.class_var = {t1.class_var}  ← 这是t1的实例变量，遮蔽了类变量")
    print(f"t2.class_var = {t2.class_var}  ← t2不受影响")
    print(f"TestClass.class_var = {TestClass.class_var}")

    print("\\n" + "=" * 60)
    print("5. 多继承MRO简单提示（谨慎使用！）")
    print("=" * 60)

    class A:
        def greet(self):
            return "A"

    class B(A):
        def greet(self):
            return "B" + super().greet()

    class C(A):
        def greet(self):
            return "C" + super().greet()

    class D(B, C):
        def greet(self):
            return "D" + super().greet()

    d = D()
    print(f"D类MRO: {[c.__name__ for c in D.__mro__]}")
    print(f"d.greet() = {d.greet()}  ← D→B→C→A的顺序执行")
    print("⚠️  多继承容易搞混，实际工作中尽量用单继承或组合！")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-dunder",
    group: "第六篇：面向对象与高级特性",
    icon: "✨",
    title: "魔法方法（特殊方法）",
    content: `# ✨ 魔法方法（特殊方法）

魔法方法是Python中以双下划线包围的方法（\`__xxx__\`），可以让自定义类像内置类型一样好用！

\`\`\`python
class MyList:
    def __init__(self, data):
        self.data = list(data)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):
        return self.data[index]

    def __contains__(self, item):
        return item in self.data

ml = MyList([1, 2, 3])
len(ml)      # 自动调用__len__ → 3
ml[0]        # 自动调用__getitem__ → 1
2 in ml      # 自动调用__contains__ → True
\`\`\`

## 常用魔法方法

| 魔法方法 | 触发时机 | 作用 |
|----------|----------|------|
| \`__str__(self)\` | \`str(obj)\`, \`print(obj)\` | 用户友好的字符串表示 |
| \`__repr__(self)\` | \`repr(obj)\`, 交互式环境 | 开发者调试用的字符串 |
| \`__len__(self)\` | \`len(obj)\` | 返回长度 |
| \`__getitem__(self, key)\` | \`obj[key]\` | 索引访问 |
| \`__setitem__(self, key, value)\` | \`obj[key] = value\` | 索引赋值 |
| \`__contains__(self, item)\` | \`item in obj\` | 成员判断 |
| \`__eq__(self, other)\` | \`obj == other\` | 相等比较 |
| \`__lt__(self, other)\` | \`obj < other\` | 小于比较（支持排序） |
| \`__call__(self, *args)\` | \`obj(args)\` | 让实例可以像函数一样调用 |
`,
    code: `"""
Python工作实战手册 - 魔法方法（特殊方法）
工作场景：让自定义的类像Python内置类型（list、dict、str）一样自然使用
为什么用魔法方法：符合Pythonic风格，不用记住.method()名字，用熟悉的运算符和语法
坑点：不要自己发明__xxx__名字、__eq__和__hash__要同时考虑、__getitem__要支持切片
"""


class ShoppingCart:
    """购物车类 - 演示各种魔法方法的实际应用

    目标：让购物车用起来像Python内置的容器一样自然：
        cart = ShoppingCart()
        len(cart)         # 商品数量
        cart[0]           # 第1个商品
        product in cart   # 某商品是否在购物车
        cart + product    # 添加商品
        for item in cart  # 遍历商品
        cart == other     # 判断购物车是否相同
        cart()            # 结账
    """

    def __init__(self, user_id=None):
        self.user_id = user_id
        self.items = []
        self.created_at = "2024-01-01"

    def __len__(self):
        """__len__ - 支持len()函数

        工作场景：用户问"购物车里有几件商品？"
        应该返回商品种类数还是总件数？这里返回商品种类数
        """
        return len(self.items)

    def __getitem__(self, index):
        """__getitem__ - 支持索引访问cart[index]和切片cart[1:3]

        工作场景：
        - cart[0]获取第一个商品
        - for item in cart: 遍历（Python会自动调用__getitem__从0开始索引直到IndexError）
        - cart[:3]切片获取前3个商品

        坑点：要同时处理整数索引和切片对象！
        """
        if isinstance(index, slice):
            new_cart = ShoppingCart(self.user_id)
            new_cart.items = self.items[index]
            return new_cart
        return self.items[index]

    def __setitem__(self, index, value):
        """__setitem__ - 支持cart[index] = value赋值

        工作场景：修改购物车中某个位置的商品（不常见，但支持总没坏处）
        """
        self.items[index] = value

    def __delitem__(self, index):
        """__delitem__ - 支持del cart[index]删除商品"""
        del self.items[index]

    def __contains__(self, product_name):
        """__contains__ - 支持in运算符

        工作场景：判断某个商品是否已在购物车里（防止重复添加）
        为什么不用Product实例而是用名字判断？实际场景用户传名字更方便
        """
        for item in self.items:
            if item["name"] == product_name:
                return True
        return False

    def __add__(self, product):
        """__add__ - 支持+运算符 cart + product

        工作场景：用cart + product语法添加商品，看起来很直观
        但更推荐用add_item方法，运算符重载容易让代码难懂，这里只是演示
        """
        self.add_item(product["name"], product["price"], product.get("quantity", 1))
        return self

    def __iadd__(self, product):
        """__iadd__ - 支持+=运算符 cart += product

        __add__返回新对象，__iadd__是原地修改（推荐）
        """
        self.add_item(product["name"], product["price"], product.get("quantity", 1))
        return self

    def __eq__(self, other):
        """__eq__ - 支持==比较

        什么时候两个购物车相等？
        比较：用户相同、商品列表相同（顺序可能不同，用集合或排序后比较）

        坑点：
        - 重写__eq__后，__hash__会被设为None，对象不能放入set/dict
        - 如果需要作为dict key，也要重写__hash__
        - 必须判断other是不是同一个类型，否则和无关类型比较会报错
        """
        if not isinstance(other, ShoppingCart):
            return NotImplemented
        if self.user_id != other.user_id:
            return False
        if len(self) != len(other):
            return False
        self_names = sorted(item["name"] for item in self.items)
        other_names = sorted(item["name"] for item in other.items)
        return self_names == other_names

    def __lt__(self, other):
        """__lt__ - 支持<比较，定义后自动支持>、排序sorted()

        工作场景：比较两个购物车哪个总价低
        定义了__lt__，Python会自动推导出>（__gt__），但<=、>=需要其他方法
        """
        if not isinstance(other, ShoppingCart):
            return NotImplemented
        return self.get_total() < other.get_total()

    def __str__(self):
        """__str__ - print友好显示"""
        total = self.get_total()
        lines = [f"购物车（共{len(self)}种商品，总计¥{total:.2f}）"]
        for i, item in enumerate(self.items, 1):
            lines.append(f"  {i}. {item['name']} x{item['quantity']} = ¥{item['price']*item['quantity']:.2f}")
        return "\\n".join(lines)

    def __repr__(self):
        return f"ShoppingCart(user_id={self.user_id!r}, items={self.items!r})"

    def __call__(self, *args, **kwargs):
        """__call__ - 让实例可以像函数一样被调用 cart()

        工作场景：购物车对象()就执行结账流程，简单直观
        """
        print(f"\\n🔔 购物车{self.user_id} 正在结账...")
        total = self.get_total()
        print(f"   共{len(self)}种商品，总计¥{total:.2f}")
        print(f"   ✓ 订单创建成功！")
        return {"total": total, "items": len(self), "status": "已下单"}

    def __iter__(self):
        """__iter__ - 支持for循环遍历（如果定义了__iter__优先用这个而不是__getitem__）

        返回一个迭代器，这里直接用列表的迭代器
        """
        return iter(self.items)

    def add_item(self, name, price, quantity=1):
        """普通方法：添加商品"""
        if name in self:
            for item in self.items:
                if item["name"] == name:
                    item["quantity"] += quantity
                    return
        self.items.append({"name": name, "price": price, "quantity": quantity})

    def get_total(self):
        """计算总价"""
        return sum(item["price"] * item["quantity"] for item in self.items)


class Timer:
    """计时器类 - 演示__enter__和__exit__（上下文管理器，第8章详细讲）

    with Timer("耗时统计"):
        做些事情
    会自动打印执行花费的时间
    """

    def __init__(self, name):
        self.name = name

    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.end = time.time()
        print(f"[{self.name}] 耗时: {self.end - self.start:.4f}秒")
        return False


def main():
    """主函数 - 演示各种魔法方法的效果"""

    print("=" * 60)
    print("1. __len__, __str__, __getitem__ 基础魔法方法")
    print("=" * 60)

    cart = ShoppingCart("U001")
    cart.add_item("MacBook Pro", 14999, 1)
    cart.add_item("无线鼠标", 199, 2)
    cart.add_item("键盘", 599, 1)

    print(cart)
    print(f"\\nlen(cart) = {len(cart)}  ← 调用__len__")
    print(f"cart[0] = {cart[0]}  ← 调用__getitem__")
    print(f"cart[-1] = {cart[-1]}")

    print("\\n遍历购物车 for item in cart:")
    for item in cart:
        print(f"  - {item['name']}")

    print("\\n" + "=" * 60)
    print("2. __contains__ (in), __setitem__, __delitem__")
    print("=" * 60)

    print(f"'键盘' in cart = {'键盘' in cart}  ← 调用__contains__")
    print(f"'显示器' in cart = {'显示器' in cart}")

    print(f"\\n修改第一个商品前: {cart[0]['name']}")
    cart[0] = {"name": "MacBook Air", "price": 8999, "quantity": 1}
    print(f"修改第一个商品后: {cart[0]['name']}")

    print(f"\\n删除前商品数: {len(cart)}")
    del cart[1]
    print(f"删除第2个商品后: {len(cart)}种商品")
    print(cart)

    print("\\n" + "=" * 60)
    print("3. __add__, __iadd__ 运算符重载")
    print("=" * 60)

    cart2 = ShoppingCart("U002")
    cart2 += {"name": "iPhone", "price": 8999, "quantity": 1}
    cart2 += {"name": "手机壳", "price": 99, "quantity": 2}
    print("cart2 += 商品后:")
    print(cart2)

    print("\\n" + "=" * 60)
    print("4. __eq__, __lt__ 比较运算")
    print("=" * 60)

    cart_a = ShoppingCart("U001")
    cart_a.add_item("苹果", 5, 3)
    cart_a.add_item("香蕉", 3, 5)

    cart_b = ShoppingCart("U001")
    cart_b.add_item("香蕉", 3, 5)
    cart_b.add_item("苹果", 5, 3)

    cart_c = ShoppingCart("U002")
    cart_c.add_item("苹果", 5, 3)

    print(f"cart_a == cart_b = {cart_a == cart_b}  ← 用户相同且商品相同（顺序无关）")
    print(f"cart_a == cart_c = {cart_a == cart_c}  ← 用户不同")

    cart_cheap = ShoppingCart()
    cart_cheap.add_item("铅笔", 2, 3)

    cart_expensive = ShoppingCart()
    cart_expensive.add_item("电脑", 10000, 1)

    print(f"\\ncart_cheap < cart_expensive = {cart_cheap < cart_expensive}")
    print(f"购物车列表排序（按总价）:")
    carts = [cart, cart2, cart_cheap, cart_expensive]
    for i, c in enumerate(sorted(carts), 1):
        print(f"  {i}. ¥{c.get_total():.2f} - {len(c)}种商品")

    print("\\n" + "=" * 60)
    print("5. __call__ 让实例可调用")
    print("=" * 60)

    result = cart2()
    print(f"结账结果: {result}")

    print("\\n" + "=" * 60)
    print("6. 切片支持")
    print("=" * 60)

    big_cart = ShoppingCart("U003")
    for i in range(10):
        big_cart.add_item(f"商品{i+1}", (i+1)*10, 1)

    print(f"大车共{len(big_cart)}件商品")
    sub_cart = big_cart[:3]
    print(f"big_cart[:3] 切片后是新购物车，共{len(sub_cart)}件:")
    for item in sub_cart:
        print(f"  - {item['name']}")

    print("\\n" + "=" * 60)
    print("7. __dict__ 查看对象所有属性")
    print("=" * 60)

    print("cart2.__dict__ =")
    for k, v in cart2.__dict__.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-properties",
    group: "第六篇：面向对象与高级特性",
    icon: "🔐",
    title: "属性封装与property",
    content: `# 🔐 属性封装与property

## 为什么要封装？

- **隐藏内部实现**：内部怎么存的外部不用关心
- **数据校验**：赋值时检查合法性，防止脏数据
- **计算属性**：属性值是动态计算出来的
- **只读属性**：创建后不能修改

## Python的封装约定

| 命名 | 含义 | 强制程度 |
|------|------|----------|
| \`name\` | 公开属性 | 可以随便访问 |
| \`_name\` | 受保护属性（约定） | 外部可以访问，但"请不要直接碰" |
| \`__name\` | 私有属性（名称改写） | 外部不能直接访问（实际是改名了） |

\`\`\`python
class User:
    def __init__(self, name, age):
        self.name = name
        self._internal = "内部用"
        self.__secret = "私有"  # 实际被改名为_User__secret

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0 or value > 150:
            raise ValueError("年龄不合法")
        self._age = value
\`\`\`
`,
    code: `"""
Python工作实战手册 - 属性封装与property
工作场景：数据校验（年龄/价格/邮箱格式）、计算属性（总价=单价×数量）、只读字段（创建时间）
为什么用property：保持"属性访问"的简洁语法，同时添加校验逻辑，不破坏已有调用代码
坑点：setter里不要给self.xxx赋值（死递归）、双下划线不是真正的私有、不要过度封装
"""


class BankAccount:
    """银行账户类 - 演示属性封装和property的实际用法

    封装什么？
    - 余额不能随便改（必须通过存/取方法）
    - 账号创建后不能改（只读）
    - 交易密码不能明文存储
    - 取款金额需要校验（不能为负、不能超过余额）
    """

    def __init__(self, account_number, owner_name, initial_balance=0.0):
        """初始化账户

        注意：
        - __account_number：双下划线开头，私有属性（名称改写）
        - _balance：单下划线开头，受保护（约定）
        - 为什么不直接让外部改？因为钱的事必须走流程！
        """
        self.__account_number = account_number
        self._owner_name = owner_name
        self._balance = 0.0
        self.__password = None
        self._transaction_count = 0
        self._created_at = "2024-01-01 10:00:00"

        if initial_balance > 0:
            self.deposit(initial_balance)

    @property
    def account_number(self):
        """账号 - 只读属性（只有getter没有setter）

        工作场景：账号创建后就不能改了
        @property把方法变成"属性"访问方式
        外部用account.account_number就能访问，不用写account.get_account_number()
        """
        return self.__account_number

    @property
    def owner_name(self):
        return self._owner_name

    @owner_name.setter
    def owner_name(self, value):
        """户主名 - 可修改，但需要验证"""
        if not isinstance(value, str) or len(value.strip()) == 0:
            raise ValueError("户主名不能为空")
        self._owner_name = value.strip()

    @property
    def balance(self):
        """余额 - 只读（只能通过deposit/withdraw修改）

        为什么余额要只读？
        - 如果外部能直接account.balance = 1000000，银行就乱套了
        - 必须走存款、取款流程，这些方法里有记录、校验
        """
        return self._balance

    @property
    def created_at(self):
        return self._created_at

    @property
    def is_locked(self):
        """计算属性（只读）- 账户是否被冻结

        不是存的值，是根据条件计算出来的
        比如交易次数异常、余额长期为负可能被冻结（这里简单演示）
        """
        return self._balance < -10000

    @property
    def info(self):
        """组合属性 - 返回账户摘要信息"""
        status = "🔴 已冻结" if self.is_locked else "🟢 正常"
        return f"账号{self.__account_number} | {self._owner_name} | 余额¥{self._balance:.2f} | {status}"

    def set_password(self, password):
        """设置密码 - 不通过property，因为密码只写一次而且要加密"""
        if len(password) < 6:
            raise ValueError("密码至少6位")
        self.__password = self._encrypt(password)

    def verify_password(self, password):
        """验证密码"""
        if self.__password is None:
            return False
        return self._encrypt(password) == self.__password

    def _encrypt(self, plain):
        """简单加密（实际工作用bcrypt等库）
        单下划线开头：内部方法，外部不要调用
        """
        return f"enc_{len(plain)}_{sum(ord(c) for c in plain)}"

    def deposit(self, amount):
        """存款"""
        if amount <= 0:
            raise ValueError("存款金额必须大于0")
        self._balance += amount
        self._transaction_count += 1
        print(f"[存款] +¥{amount:.2f}，当前余额¥{self._balance:.2f}")

    def withdraw(self, amount):
        """取款"""
        if self.is_locked:
            raise RuntimeError("账户已冻结，无法取款")
        if amount <= 0:
            raise ValueError("取款金额必须大于0")
        if amount > self._balance:
            raise ValueError(f"余额不足，当前余额¥{self._balance:.2f}")
        self._balance -= amount
        self._transaction_count += 1
        print(f"[取款] -¥{amount:.2f}，当前余额¥{self._balance:.2f}")
        return True

    def __str__(self):
        return self.info


class Product2:
    """商品类 - 演示@property做数据校验"""

    def __init__(self, name, price, stock=0, discount=1.0):
        self.name = name
        self.price = price
        self.stock = stock
        self.discount = discount

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        """价格setter - 赋值时自动校验

        坑点：这里不能写self.price = value！
        因为self.price = ...会再次调用这个setter，无限递归！
        必须存到self._price（下划线开头的内部属性）
        """
        if not isinstance(value, (int, float)):
            raise TypeError("价格必须是数字")
        if value < 0:
            raise ValueError("价格不能为负")
        self._price = float(value)

    @property
    def stock(self):
        return self._stock

    @stock.setter
    def stock(self, value):
        if not isinstance(value, int):
            raise TypeError("库存必须是整数")
        if value < 0:
            raise ValueError("库存不能为负")
        self._stock = value

    @property
    def discount(self):
        return self._discount

    @discount.setter
    def discount(self, value):
        """折扣校验：0 < 折扣 ≤ 1"""
        if not 0 < value <= 1:
            raise ValueError("折扣必须在(0,1]之间")
        self._discount = value

    @property
    def current_price(self):
        """计算属性：折后价"""
        return round(self._price * self._discount, 2)

    @property
    def total_value(self):
        """计算属性：库存总价值"""
        return round(self.current_price * self._stock, 2)


class Temperature:
    """温度类 - 演示读写属性和单位转换

    工作场景：可以设置摄氏度，也可以设置华氏度，自动转换
    """

    def __init__(self, celsius=0):
        self.celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        self._celsius = float(value)

    @property
    def fahrenheit(self):
        """华氏度 = 摄氏度 × 9/5 + 32"""
        return self._celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        """设置华氏度时，反算出摄氏度存储"""
        self._celsius = (float(value) - 32) * 5 / 9

    def __str__(self):
        return f"{self.celsius:.1f}°C / {self.fahrenheit:.1f}°F"


def main():
    """主函数 - 演示封装和property"""

    print("=" * 60)
    print("1. 只读属性和受保护属性")
    print("=" * 60)

    acc = BankAccount("62220001", "张三", initial_balance=1000)
    print(acc.info)

    print(f"\\n账号（只读）: {acc.account_number}")
    print(f"户主（可改）: {acc.owner_name}")
    print(f"余额（只读）: ¥{acc.balance:.2f}")

    print("\\n尝试修改户主名:")
    acc.owner_name = "张三丰"
    print(f"修改后: {acc.info}")

    print("\\n尝试直接修改余额会报错吗？")
    try:
        acc.balance = 999999
        print("居然修改成功了？不，不会走到这")
    except AttributeError as e:
        print(f"报错了（只读属性没有setter）: {e}")

    print("\\n" + "=" * 60)
    print("2. 通过方法修改余额（正确流程）")
    print("=" * 60)

    acc.deposit(500)
    acc.withdraw(200)
    print(f"\\n最终状态: {acc.info}")

    print("\\n" + "=" * 60)
    print("3. 数据校验（价格、库存、折扣）")
    print("=" * 60)

    p = Product2("笔记本电脑", 8999, stock=10, discount=0.9)
    print(f"商品: {p.name}")
    print(f"原价: ¥{p.price:.2f}")
    print(f"折扣: {p.discount*100:.0f}%")
    print(f"折后价: ¥{p.current_price}")
    print(f"库存总价值: ¥{p.total_value}")

    print("\\n尝试设置负价格:")
    try:
        p.price = -100
    except ValueError as e:
        print(f"校验失败: {e}")

    print("\\n尝试设置1.2的折扣（超过100%）:")
    try:
        p.discount = 1.2
    except ValueError as e:
        print(f"校验失败: {e}")

    print("\\n正常修改价格为7999，折扣85折:")
    p.price = 7999
    p.discount = 0.85
    print(f"折后价: ¥{p.current_price}")
    print(f"库存总价值: ¥{p.total_value}")

    print("\\n" + "=" * 60)
    print("4. 双下划线私有属性的"名称改写"本质")
    print("=" * 60)

    print("__开头的属性不是真的私有，只是改名了:")
    print(f"acc.__dict__ 里可以看到:")
    for k, v in acc.__dict__.items():
        if "account" in k or "password" in k:
            print(f"  {k}")
    print(f"\\n所以acc._BankAccount__account_number = {acc._BankAccount__account_number}")
    print("⚠️  不要在外部访问_或__开头的属性，这是约定！")

    print("\\n" + "=" * 60)
    print("5. 双向绑定属性：摄氏度/华氏度")
    print("=" * 60)

    t = Temperature(25)
    print(f"初始温度: {t}")

    t.celsius = 100
    print(f"设置摄氏度为100: {t}")

    t.fahrenheit = 32
    print(f"设置华氏度为32（冰点）: {t}")

    t.fahrenheit = 212
    print(f"设置华氏度为212（沸点）: {t}")

    print("\\n" + "=" * 60)
    print("6. getter/setter方法 vs property 风格对比")
    print("=" * 60)

    print("传统Java风格:")
    print("  acc.set_owner_name('李四')    # 方法调用，啰嗦")
    print("  print(acc.get_balance())      # 方法调用")
    print("Python风格（property）:")
    print("  acc.owner_name = '李四'       # 像属性一样赋值，简洁")
    print("  print(acc.balance)            # 像属性一样访问")
    print("\\n→ property保持了语法简洁，同时有校验能力，两全其美！")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-classmethods",
    group: "第六篇：面向对象与高级特性",
    icon: "📌",
    title: "类方法、静态方法与特殊方法",
    content: `# 📌 类方法、静态方法与特殊方法

## 三种方法类型对比

| 类型 | 装饰器 | 第一个参数 | 能访问 | 使用场景 |
|------|--------|-----------|--------|----------|
| 实例方法 | 无 | \`self\` | 实例属性+类属性 | 操作实例状态 |
| 类方法 | \`@classmethod\` | \`cls\` | 类属性 | 备选构造方法、工厂方法 |
| 静态方法 | \`@staticmethod\` | 无 | 不能直接访问 | 工具函数，放在类里组织代码 |

\`\`\`python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, s):
        y, m, d = map(int, s.split('-'))
        return cls(y, m, d)  # 用cls创建实例，子类也能用

    @staticmethod
    def is_valid_date(s):
        # 不需要self/cls，和普通函数一样
        parts = s.split('-')
        return len(parts) == 3
\`\`\`
`,
    code: `"""
Python工作实战手册 - 类方法、静态方法
工作场景：多种方式创建对象（from_dict/from_json/from_string）、工具方法归类、单例模式
为什么区分类方法/静态方法/实例方法：语义清晰，明确这个方法需要什么数据、操作什么层次
坑点：@classmethod忘了写cls参数、@staticmethod不需要但写了self、用类名硬编码而不是cls
"""


class Employee:
    """员工类 - 演示三种方法类型和备选构造方法

    为什么需要多种创建方式？
    - 正常创建：Employee("张三", 30, 20000)
    - 从字典创建：员工数据来自CSV/Excel/数据库，读出来是dict
    - 从字符串创建："张三,30,20000"格式解析
    - 这就是"工厂方法"模式，用@classmethod实现
    """

    _raise_rate = 1.05

    def __init__(self, name, age, salary, department="未分配"):
        """标准构造方法"""
        self.name = name
        self.age = age
        self.salary = salary
        self.department = department
        self._id = None

    def __str__(self):
        return f"{self.name} | {self.age}岁 | {self.department} | ¥{self.salary:.0f}"

    def give_raise(self):
        """实例方法：给这个员工涨薪

        为什么是实例方法？
        - 操作的是具体某个员工的薪资（实例属性）
        - 第一个参数self指向当前员工实例
        """
        self.salary = self.salary * self._raise_rate
        print(f"{self.name} 涨薪后: ¥{self.salary:.0f}")

    @classmethod
    def from_dict(cls, data):
        """类方法：从字典创建Employee

        为什么用@classmethod而不是@staticmethod？
        - 需要创建cls()的实例，如果是子类调用，会创建子类实例而不是硬编码Employee
        - 第一个参数cls是"当前类"，类似self但指向类而不是实例

        工作场景：从API返回的JSON、CSV读出来的dict创建对象
        """
        return cls(
            name=data["name"],
            age=data.get("age", 18),
            salary=data.get("salary", 5000),
            department=data.get("department", "未分配")
        )

    @classmethod
    def from_csv_line(cls, line):
        """类方法：从CSV行字符串创建

        工作场景：批量导入员工数据，每行是"姓名,年龄,薪资,部门"
        """
        parts = [p.strip() for p in line.split(",")]
        name = parts[0]
        age = int(parts[1]) if len(parts) > 1 else 18
        salary = float(parts[2]) if len(parts) > 2 else 5000
        dept = parts[3] if len(parts) > 3 else "未分配"
        return cls(name, age, salary, dept)

    @classmethod
    def create_intern(cls, name):
        """类方法：创建实习生（预定义属性）

        工作场景：某些"类型"的员工属性是固定的，用工厂方法创建更方便
        """
        return cls(name=name, age=22, salary=3000, department="实习生")

    @classmethod
    def set_raise_rate(cls, rate):
        """类方法：修改全员涨薪比例

        为什么用类方法？
        - _raise_rate是类变量，所有员工共享
        - 不需要具体员工实例就能调用：Employee.set_raise_rate(1.1)
        """
        if rate < 1.0:
            raise ValueError("涨薪比例不能小于1")
        cls._raise_rate = rate
        print(f"全员涨薪比例调整为: {rate*100:.0f}%")

    @staticmethod
    def is_valid_age(age):
        """静态方法：验证年龄是否合法

        为什么是静态方法？
        - 不需要self（实例）也不需要cls（类）
        - 和员工相关，但不依赖员工的具体数据
        - 逻辑上属于Employee类，所以放在类里而不是模块级函数

        和普通函数唯一的区别：调用方式是Employee.is_valid_age()，有命名空间
        """
        return isinstance(age, int) and 18 <= age <= 65

    @staticmethod
    def calc_bonus(salary, performance_rating):
        """静态方法：计算年终奖

        公式：薪资 × 绩效系数 × 月份
        这个计算不依赖某个具体员工实例，输入参数足够
        """
        multiplier = {
            "S": 3.0,
            "A": 2.0,
            "B": 1.0,
            "C": 0.5
        }.get(performance_rating, 0)
        return salary * multiplier


class Singleton:
    """单例模式演示 - 一个类只能创建一个实例

    工作场景：配置类、日志类、数据库连接池（全局只需要一个实例）
    实现方式：重写__new__方法（真正创建对象的方法，比__init__早）
    """

    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        """__new__是真正创建实例的方法（__init__是初始化）

        为什么很少重写__new__？
        - 绝大多数情况只需要__init__初始化就行
        - 只有单例、元类等特殊场景需要控制对象创建过程
        """
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, config=None):
        if self._initialized:
            return
        self.config = config or {}
        self._initialized = True


class RetryDecorator:
    """类作为装饰器 - 演示__call__的高级用法

    @RetryDecorator(max_times=3)
    def func():
        ...
    """

    def __init__(self, max_times=3):
        self.max_times = max_times

    def __call__(self, func):
        """实例可调用，返回包装后的函数"""
        import functools

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(self.max_times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"  第{i+1}次尝试失败: {e}")
                    if i == self.max_times - 1:
                        raise
            return None
        return wrapper


@RetryDecorator(max_times=3)
def unstable_network_call():
    """模拟不稳定的网络请求（前两次失败）"""
    import random
    if random.random() < 0.7:
        raise ConnectionError("网络超时")
    return "请求成功"


def main():
    """主函数 - 演示类方法、静态方法、单例、类装饰器"""

    print("=" * 60)
    print("1. 实例方法 vs 类方法 vs 静态方法创建对象")
    print("=" * 60)

    e1 = Employee("张三", 30, 20000, "技术部")
    print(f"标准构造: {e1}")

    e2 = Employee.from_dict({
        "name": "李四",
        "age": 28,
        "salary": 18000,
        "department": "产品部"
    })
    print(f"from_dict: {e2}")

    e3 = Employee.from_csv_line("王五, 25, 15000, 设计部")
    print(f"from_csv_line: {e3}")

    e4 = Employee.create_intern("赵六")
    print(f"create_intern: {e4}")

    print("\\n" + "=" * 60)
    print("2. 静态方法验证和计算")
    print("=" * 60)

    test_ages = [17, 18, 25, 65, 66, 30.5]
    for age in test_ages:
        valid = Employee.is_valid_age(age)
        print(f"  年龄{age}是否合法: {valid}")

    print("\\n年终奖计算（静态方法）:")
    for rating in ["S", "A", "B", "C", "D"]:
        bonus = Employee.calc_bonus(20000, rating)
        print(f"  绩效{rating}: ¥{bonus:.0f}")

    print("\\n" + "=" * 60)
    print("3. 类方法修改类变量（全员涨薪比例）")
    print("=" * 60)

    employees = [e1, e2, e3]
    print("涨薪前:")
    for e in employees:
        print(f"  {e}")

    Employee.set_raise_rate(1.15)

    print("\\n涨薪后（每个员工都受影响，因为类变量变了）:")
    for e in employees:
        e.give_raise()

    print("\\n" + "=" * 60)
    print("4. 单例模式测试")
    print("=" * 60)

    s1 = Singleton({"db": "localhost"})
    s2 = Singleton({"db": "192.168.1.1"})
    print(f"s1.config = {s1.config}")
    print(f"s2.config = {s2.config}")
    print(f"s1 is s2 = {s1 is s2}  ← True！是同一个实例，第二次创建没有覆盖config")
    print("单例模式：全局只有一个实例，节省资源，保持状态一致")

    print("\\n" + "=" * 60)
    print("5. 类装饰器演示（重试装饰器）")
    print("=" * 60)

    print("调用不稳定网络函数（最多重试3次）:")
    try:
        result = unstable_network_call()
        print(f"结果: {result}")
    except ConnectionError:
        print("重试3次后仍然失败")

    print("\\n" + "=" * 60)
    print("三种方法总结")
    print("=" * 60)
    print("""
实例方法（最常用）：
    def method(self, ...):
    第一个参数self是实例本身
    可以访问：self.xxx实例属性、self.__class__.yyy类属性
    调用：obj.method()
    场景：操作某个具体对象的数据

类方法：
    @classmethod
    def method(cls, ...):
    第一个参数cls是类本身
    可以访问：cls.xxx类属性
    调用：Class.method() 或 obj.method()
    场景：备选构造方法（from_xxx）、修改类级别的配置

静态方法：
    @staticmethod
    def method(...):
    没有self/cls参数，和普通函数一样
    不能访问实例/类属性（除非硬编码类名）
    调用：Class.method() 或 obj.method()
    场景：和类相关的工具函数，不需要类/实例数据
    选择困难时：如果不需要self，优先考虑@staticmethod；如果需要cls或要创建实例，用@classmethod
""")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-decorators",
    group: "第六篇：面向对象与高级特性",
    icon: "🎀",
    title: "装饰器：增强函数功能",
    content: `# 🎀 装饰器：增强函数功能

装饰器可以在**不修改原函数代码**的前提下，给函数增加额外功能（日志、计时、重试、权限校验等）。

## 基础原理

函数是"一等公民"：可以作为参数传递、作为返回值返回、赋值给变量。

\`\`\`python
def timer(func):
    import functools, time
    @functools.wraps(func)  # 重要！保留原函数信息
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时: {time.time()-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.1)

slow_function()  # 自动计时
\`\`\`

## 常用场景

| 场景 | 作用 |
|------|------|
| 计时 | \`time.time()\`统计执行时间 |
| 日志 | 记录函数调用、参数、返回值 |
| 缓存 | \`functools.lru_cache\`缓存结果 |
| 重试 | 失败自动重试 |
| 权限 | 调用前检查登录状态 |
`,
    code: `"""
Python工作实战手册 - 装饰器
工作场景：日志记录、性能计时、结果缓存、自动重试、权限校验、参数验证
为什么用装饰器：AOP（面向切面编程）思想，把通用逻辑抽离出来，不侵入业务代码
坑点：忘记@functools.wraps导致原函数元信息丢失、装饰器执行时机理解错误、带参装饰器多层嵌套
"""

import time
import functools
import random


def log_calls(func):
    """最简单的装饰器：记录函数调用日志

    原理：
    1. log_calls接收一个函数func作为参数
    2. 定义一个wrapper函数，在调用func前后加逻辑
    3. 返回wrapper替换原来的func
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[LOG] 调用 {func.__name__}()")
        print(f"      参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"[LOG] {func.__name__}() 返回: {result}")
        return result

    return wrapper


def timer(func):
    """计时装饰器：统计函数执行耗时

    工作场景：找出慢函数、性能优化时测量代码块执行时间
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            elapsed = time.perf_counter() - start
            print(f"[TIMER] {func.__name__} 执行耗时: {elapsed*1000:.2f}ms")

    return wrapper


def retry(max_attempts=3, delay=0.5, exceptions=(Exception,)):
    """带参数的装饰器：失败自动重试

    为什么是三层嵌套？
    - 第一层retry：接收装饰器参数（max_attempts, delay...）
    - 第二层decorator：接收被装饰的函数func
    - 第三层wrapper：实际执行逻辑

    工作场景：
    - 网络请求（可能超时）
    - 数据库操作（可能死锁）
    - 调用第三方API（可能限流）

    参数：
        max_attempts: 最多重试几次
        delay: 每次重试间隔秒数
        exceptions: 哪些异常才重试（默认所有异常）
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        print(f"[RETRY] {func.__name__} 第{attempt}次失败: {e}，{delay}秒后重试...")
                        time.sleep(delay)
                    else:
                        print(f"[RETRY] {func.__name__} 已重试{max_attempts}次，全部失败")
            raise last_exception
        return wrapper
    return decorator


def cache_result(func):
    """简单的结果缓存装饰器

    工作场景：
    - 计算密集型函数（同样参数结果不变，不用重复计算）
    - 重复调用的数据库查询
    Python内置了functools.lru_cache，这里手写理解原理

    注意：只适用于纯函数（相同输入永远得到相同输出）
    """
    cache = {}

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key not in cache:
            print(f"[CACHE] {func.__name__}{args} 未命中缓存，计算中...")
            cache[key] = func(*args, **kwargs)
        else:
            print(f"[CACHE] {func.__name__}{args} 命中缓存!")
        return cache[key]

    wrapper.cache_clear = lambda: cache.clear()
    return wrapper


def require_auth(role=None):
    """权限校验装饰器（模拟）

    工作场景：Web接口需要登录/特定角色才能访问
    这里用全局变量模拟登录状态
    """
    current_user = {"name": None, "role": None}

    def set_user(name, user_role):
        current_user["name"] = name
        current_user["role"] = user_role

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if not current_user["name"]:
                raise PermissionError("请先登录！")
            if role and current_user["role"] != role:
                raise PermissionError(f"需要{role}权限，当前是{current_user['role']}")
            print(f"[AUTH] 用户{current_user['name']}({current_user['role']}) 授权通过")
            return func(*args, **kwargs)

        wrapper.set_user = set_user
        return wrapper
    return decorator


def deprecated(message=""):
    """标记函数已废弃的装饰器

    工作场景：重构时旧接口暂时保留，但调用时警告用户
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            warn_msg = f"[DEPRECATED] {func.__name__}() 已废弃"
            if message:
                warn_msg += f"：{message}"
            print(warn_msg)
            return func(*args, **kwargs)
        return wrapper
    return decorator


@log_calls
def add(a, b):
    return a + b


@timer
def slow_calc(n):
    """模拟耗时计算"""
    total = 0
    for i in range(n):
        total += i ** 2
        time.sleep(0.0001)
    return total


@retry(max_attempts=3, delay=0.2, exceptions=(ConnectionError,))
def fetch_data_from_api(endpoint):
    """模拟不稳定的API调用"""
    if random.random() < 0.6:
        raise ConnectionError(f"请求{endpoint}超时")
    return {"data": f"来自{endpoint}的数据", "status": 200}


@cache_result
def fibonacci(n):
    """斐波那契数列（经典递归，缓存后性能提升巨大）"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


@deprecated(message="请使用new_add()函数")
def old_add(a, b):
    return a + b


def new_add(a, b):
    """新版本加法"""
    print(f"使用新版本计算: {a} + {b}")
    return a + b


admin_required = require_auth(role="admin")


@admin_required
def delete_user(user_id):
    """删除用户（需要管理员权限）"""
    print(f"已删除用户: {user_id}")
    return True


@require_auth()
def view_profile():
    """查看个人资料（只需要登录）"""
    print("查看个人资料页面")
    return True


@log_calls
@timer
@cache_result
def expensive_computation(n):
    """多个装饰器叠加

    执行顺序：从上到下包裹，从外到内执行
    相当于: log_calls(timer(cache_result(func)))
    调用顺序：log→timer→cache→实际函数→cache→timer→log
    """
    time.sleep(0.1)
    return n * n * n


def main():
    """主函数 - 演示各种装饰器"""

    print("=" * 60)
    print("1. 日志装饰器 @log_calls")
    print("=" * 60)

    result = add(3, 5)
    print(f"add(3,5) = {result}")

    print("\\n" + "=" * 60)
    print("2. 计时装饰器 @timer")
    print("=" * 60)

    slow_calc(1000)

    print("\\n" + "=" * 60)
    print("3. 带参数的重试装饰器 @retry")
    print("=" * 60)

    try:
        data = fetch_data_from_api("/api/user/list")
        print(f"API返回: {data}")
    except ConnectionError as e:
        print(f"最终失败: {e}")

    print("\\n" + "=" * 60)
    print("4. 缓存装饰器 @cache_result（斐波那契）")
    print("=" * 60)

    print("计算fibonacci(20):")
    t1 = time.perf_counter()
    r1 = fibonacci(20)
    print(f"结果: {r1}, 耗时: {(time.perf_counter()-t1)*1000:.2f}ms")

    print("\\n再次计算fibonacci(20):")
    t1 = time.perf_counter()
    r2 = fibonacci(20)
    print(f"结果: {r2}, 耗时: {(time.perf_counter()-t1)*1000:.2f}ms")
    print("→ 第二次几乎瞬间完成，因为缓存了！")

    print("\\n" + "=" * 60)
    print("5. 废弃警告装饰器 @deprecated")
    print("=" * 60)

    old_add(1, 2)
    new_add(1, 2)

    print("\\n" + "=" * 60)
    print("6. 权限校验装饰器")
    print("=" * 60)

    print("未登录时调用view_profile():")
    try:
        view_profile()
    except PermissionError as e:
        print(f"  ❌ {e}")

    print("\\n登录为普通用户后:")
    view_profile.set_user("张三", "user")
    view_profile()

    print("\\n普通用户调用delete_user():")
    try:
        delete_user()
    except PermissionError as e:
        print(f"  ❌ {e}")

    print("\\n登录为管理员后:")
    delete_user.set_user("管理员", "admin")
    delete_user("U001")

    print("\\n" + "=" * 60)
    print("7. 多个装饰器叠加")
    print("=" * 60)

    print("第一次调用expensive_computation(5):")
    r1 = expensive_computation(5)
    print(f"结果: {r1}")

    print("\\n第二次调用expensive_computation(5):")
    r2 = expensive_computation(5)
    print(f"结果: {r2}")
    print("→ 第二次timer显示几乎不耗时，因为cache层直接返回了")

    print("\\n" + "=" * 60)
    print("8. functools.wraps的重要性")
    print("=" * 60)

    def without_wraps(func):
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper

    def with_wraps(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper

    @without_wraps
    def hello():
        """这是hello函数的文档"""
        pass

    @with_wraps
    def world():
        """这是world函数的文档"""
        pass

    print(f"没用@functools.wraps: hello.__name__ = {hello.__name__}")
    print(f"用了@functools.wraps: world.__name__ = {world.__name__}")
    print("⚠️  一定要加@functools.wraps！否则调试、文档生成都会出错")

    print("\\n" + "=" * 60)
    print("装饰器执行时机提醒")
    print("=" * 60)
    print("""
装饰器在"模块加载时"就执行了（不是函数调用时！）
@timer
def f():
    pass
# ↑ 这行等价于 f = timer(f)，模块import时就执行了timer函数
wrapper函数里的代码才是"每次调用f时"执行的
这点很容易搞错！
""")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-generators",
    group: "第六篇：面向对象与高级特性",
    icon: "⚡",
    title: "生成器与迭代器",
    content: `# ⚡ 生成器与迭代器

生成器是**惰性计算**的：一次只生成一个值，不会一次性把所有数据加载到内存。处理大数据时节省内存！

\`\`\`python
# 列表推导式：一次性生成所有，占内存
nums_list = [x * x for x in range(1000000)]  # 占很多内存

# 生成器表达式：用的时候才算
nums_gen = (x * x for x in range(1000000))   # 几乎不占内存

# yield生成器函数
def countdown(n):
    while n > 0:
        yield n  # 暂停，返回n，下次从这里继续
        n -= 1

for num in countdown(5):
    print(num)  # 5,4,3,2,1
\`\`\`

## 核心要点

| 特性 | 列表 | 生成器 |
|------|------|--------|
| 内存 | 一次性全部加载 | 惰性，一次一个 |
| 索引 | 支持\`[0]\` | 不支持（一次性） |
| 遍历次数 | 可反复遍历 | 只能遍历一次 |
| 速度 | 创建慢，访问快 | 创建快，逐个取 |

**工作场景**：读大文件、处理大数据流、流水线数据处理
`,
    code: `"""
Python工作实战手册 - 生成器与迭代器
工作场景：处理GB级大文件（不能一次性读入内存）、流式数据处理、无限序列、数据管道
为什么用生成器：惰性计算节省内存、代码简洁、可以表示无限序列
坑点：生成器是一次性的（遍历完就没了）、不能索引/切片、不小心就消费掉了
"""

import sys
import time


def fibonacci_gen(limit=None):
    """斐波那契数列生成器

    为什么不用列表返回？
    - 如果要前100万项，列表占大量内存
    - 生成器一次只算一项，内存占用O(1)常数级
    - 甚至可以表示无限序列（limit=None时）

    yield工作原理：
    1. 调用函数不会执行，返回生成器对象
    2. next(生成器)时，执行到yield暂停，把值返回
    3. 再次next()从暂停处继续执行
    4. 函数结束/return时抛出StopIteration
    """
    a, b = 0, 1
    count = 0
    while True:
        yield b
        a, b = b, a + b
        count += 1
        if limit is not None and count >= limit:
            break


def read_large_file_line_by_line(filepath):
    """逐行读取大文件（生成器方式）

    工作场景：日志文件可能几GB，绝对不能read()一次性读进来
    用yield一行一行返回，内存里永远只有一行

    对比：
    - 错误方式：lines = open(f).readlines() → 内存爆了
    - 正确方式：for line in 生成器 → 内存恒定
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            yield line.strip()


def number_generator(n):
    """简单数字生成器 - 演示yield暂停/恢复"""
    print("  生成器启动")
    for i in range(n):
        print(f"  准备yield {i}")
        yield i
        print(f"  yield {i}之后恢复执行")
    print("  生成器结束")


class BatchProcessor:
    """批量数据处理器 - 用生成器实现数据管道

    数据处理流水线：
    1. 读取原始数据 → 2. 过滤无效数据 → 3. 数据转换 → 4. 批量聚合

    每一步都是生成器，数据"流"过管道，内存里永远只有一小批
    """

    def __init__(self, data_source):
        self.data_source = data_source

    def read_data(self):
        """第一步：读取数据"""
        for item in self.data_source:
            print(f"    [读取] {item}")
            yield item

    @staticmethod
    def filter_valid(data_gen):
        """第二步：过滤None和负数"""
        for item in data_gen:
            if item is not None and item >= 0:
                print(f"    [过滤] {item} ✓")
                yield item
            else:
                print(f"    [过滤] {item} ✗ 丢弃")

    @staticmethod
    def transform(data_gen):
        """第三步：转换（平方）"""
        for item in data_gen:
            result = item * item
            print(f"    [转换] {item} → {result}")
            yield result

    @staticmethod
    def batch(data_gen, batch_size=3):
        """第四步：按批次聚合"""
        batch_list = []
        for item in data_gen:
            batch_list.append(item)
            if len(batch_list) >= batch_size:
                print(f"    [批处理] 产出批次: {batch_list}")
                yield batch_list
                batch_list = []
        if batch_list:
            print(f"    [批处理] 产出最后一批: {batch_list}")
            yield batch_list

    def process(self):
        """组装管道并执行"""
        pipeline = self.read_data()
        pipeline = self.filter_valid(pipeline)
        pipeline = self.transform(pipeline)
        pipeline = self.batch(pipeline, batch_size=3)
        return pipeline


def countdown(n):
    """倒计时生成器 - 演示send()和throw()（高级用法）"""
    print("倒计时开始!")
    while n > 0:
        try:
            received = yield n
            if received is not None:
                print(f"  收到外部发送的值: {received}，重置倒计时为{received}")
                n = received
            else:
                n -= 1
        except Exception as e:
            print(f"  收到异常: {e}，继续倒计时")
            n -= 1
    yield "BOOM!"


def flatten(nested_list):
    """yield from 扁平化嵌套列表

    yield from 后面接可迭代对象/生成器，相当于for x in gen: yield x
    但更强大：可以双向传递send/throw，调用子生成器时用
    """
    for item in nested_list:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item


def main():
    """主函数 - 演示生成器和迭代器"""

    print("=" * 60)
    print("1. 生成器基础：yield暂停和恢复")
    print("=" * 60)

    gen = number_generator(3)
    print("创建生成器对象，但函数体还没执行！")
    print(f"gen类型: {type(gen)}")

    print("\\n第一次next():")
    val = next(gen)
    print(f"得到: {val}")

    print("\\n第二次next():")
    val = next(gen)
    print(f"得到: {val}")

    print("\\n第三次next():")
    val = next(gen)
    print(f"得到: {val}")

    print("\\n第四次next()应该StopIteration:")
    try:
        next(gen)
    except StopIteration:
        print("生成器已耗尽，抛出StopIteration")

    print("\\n" + "=" * 60)
    print("2. 内存对比：列表 vs 生成器")
    print("=" * 60)

    n = 1000000
    list_nums = [x ** 2 for x in range(n)]
    gen_nums = (x ** 2 for x in range(n))

    print(f"列表大小: {sys.getsizeof(list_nums) / 1024 / 1024:.2f} MB")
    print(f"生成器大小: {sys.getsizeof(gen_nums)} bytes（几乎不占内存！）")

    print("\\n遍历前5个:")
    for i, num in enumerate(gen_nums):
        if i >= 5:
            break
        print(f"  {num}")

    print("\\n生成器是一次性的！前面已经消费了5个，继续遍历:")
    remaining = list(gen_nums)
    print(f"剩下{len(remaining)}个，第一个是{remaining[0]}")

    print("\\n" + "=" * 60)
    print("3. 斐波那契生成器（惰性计算）")
    print("=" * 60)

    print("前10个斐波那契数:")
    fib = fibonacci_gen(limit=10)
    print(list(fib))

    print("\\n斐波那契数超过1000的第一个数:")
    for num in fibonacci_gen():
        if num > 1000:
            print(f"  第一个超过1000的: {num}")
            break

    print("→ 没有用limit，但找到就break了，不会无限执行")

    print("\\n" + "=" * 60)
    print("4. 数据管道（生成器流水线）")
    print("=" * 60)

    raw_data = [5, -2, 3, None, 8, 0, -1, 7, 4, None, 9]
    print(f"原始数据: {raw_data}")
    print("\\n处理流程:")

    processor = BatchProcessor(raw_data)
    for batch in processor.process():
        print(f"  → 批次结果: 总和={sum(batch)}, 个数={len(batch)}")

    print("\\n" + "=" * 60)
    print("5. yield from 扁平化嵌套列表")
    print("=" * 60)

    nested = [1, 2, [3, 4, [5, 6], 7], 8, [9, [10, [11, 12]]]]
    print(f"嵌套列表: {nested}")
    flat = list(flatten(nested))
    print(f"扁平化后: {flat}")

    print("\\n" + "=" * 60)
    print("6. send()向生成器发送值（高级）")
    print("=" * 60)

    cd = countdown(5)
    print("启动倒计时:")
    val = next(cd)
    print(f"当前: {val}")

    val = next(cd)
    print(f"当前: {val}")

    print("\\n发送值10，重置倒计时!")
    val = cd.send(10)
    print(f"当前: {val}")

    for _ in range(3):
        val = next(cd)
        print(f"当前: {val}")

    print("\\n抛出异常进去:")
    val = cd.throw(ValueError("测试异常"))
    print(f"当前: {val}")

    try:
        while True:
            val = next(cd)
            print(f"当前: {val}")
    except StopIteration:
        print("倒计时结束!")

    print("\\n" + "=" * 60)
    print("7. 迭代器协议 __iter__/__next__")
    print("=" * 60)

    class RangeIterator:
        """自己实现一个简单的range迭代器"""
        def __init__(self, start, end):
            self.current = start
            self.end = end

        def __iter__(self):
            return self

        def __next__(self):
            if self.current >= self.end:
                raise StopIteration
            val = self.current
            self.current += 1
            return val

    print("自定义RangeIterator(2, 7):")
    for num in RangeIterator(2, 7):
        print(f"  {num}")

    print("\\n实际上生成器自动实现了这个协议，不用自己写class")

    print("\\n" + "=" * 60)
    print("生成器vs列表 场景选择")
    print("=" * 60)
    print("""
用列表当：
  - 数据量小（几千几万条无所谓）
  - 需要随机访问（索引、切片）
  - 需要多次遍历
  - 需要修改元素

用生成器当：
  - 数据量大或不确定多大（GB级文件、无限序列）
  - 只需要遍历一次
  - 流水线数据处理（管道串联）
  - 内存有限
  - 数据不需要同时存在（用一个算一个）
""")


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-context-manager",
    group: "第六篇：面向对象与高级特性",
    icon: "🚪",
    title: "上下文管理器with语句",
    content: `# 🚪 上下文管理器with语句

\`with\`语句用于自动管理资源：进入时获取，退出时（无论是否异常）自动释放。

\`\`\`python
# 文件操作（已经见过的）
with open("file.txt") as f:
    data = f.read()
# 离开with块，文件自动关闭，即使中间发生异常
\`\`\`

## 两种实现方式

### 1. 类方式：实现\`__enter__\`和\`__exit__\`
\`\`\`python
class MyContext:
    def __enter__(self):
        print("进入")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("退出（总会执行）")
        return False  # 返回True吞异常，False不吞
\`\`\`

### 2. contextlib方式（更简单）
\`\`\`python
from contextlib import contextmanager

@contextmanager
def my_context():
    print("进入")
    yield "资源"  # yield前面是__enter__，后面是__exit__
    print("退出")
\`\`\`

**常见场景**：文件操作、数据库连接、线程锁、临时修改环境、计时统计
`,
    code: `"""
Python工作实战手册 - 上下文管理器with语句
工作场景：数据库连接管理、文件操作、线程锁、临时环境变量切换、计时统计、事务处理
为什么用with：保证资源一定会被释放/清理，即使发生异常也不泄漏，代码更简洁
坑点：__exit__返回值含义（True吞异常很危险）、contextmanager里yield后必须处理异常、忘记资源释放
"""

import time
from contextlib import contextmanager


class DatabaseConnection:
    """模拟数据库连接 - 类方式实现上下文管理器

    为什么数据库连接必须用with？
    - 数据库连接数是有限的（默认可能只有100个）
    - 如果忘记关闭，连接泄漏，很快数据库就拒绝新连接了
    - 用with保证一定会关闭（即使查询出错）

    with的工作流程：
    1. 执行__enter__方法，返回值赋给as后的变量
    2. 执行with块内代码
    3. 无论块内是否异常，都执行__exit__方法
    """

    def __init__(self, host, database):
        self.host = host
        self.database = database
        self.connected = False
        self.transaction_count = 0

    def __enter__(self):
        """__enter__：进入with块时调用

        返回值会赋给 as conn 里的conn
        通常返回self或者某个资源对象
        """
        print(f"[DB] 连接数据库 {self.host}/{self.database}...")
        time.sleep(0.1)
        self.connected = True
        print(f"[DB] 连接成功")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """__exit__：离开with块时调用（无论是否异常都会到这里！）

        三个参数：
        - exc_type: 异常类型（没异常就是None）
        - exc_val: 异常对象（没异常就是None）
        - exc_tb: 异常栈追踪（没异常就是None）

        返回值含义：
        - True: 吞掉异常，with外代码继续执行（危险！）
        - False/None: 异常继续向上抛出（正常行为）
        """
        print(f"[DB] 关闭数据库连接")
        self.connected = False

        if exc_type is not None:
            print(f"[DB] 发生异常: {exc_type.__name__}: {exc_val}")
            print(f"[DB] 执行回滚操作")
        else:
            if self.transaction_count > 0:
                print(f"[DB] 提交事务")

        print(f"[DB] 连接已释放")
        return False

    def execute(self, sql):
        """执行SQL"""
        if not self.connected:
            raise RuntimeError("数据库未连接")
        print(f"[SQL] 执行: {sql}")
        self.transaction_count += 1
        if "ERROR" in sql.upper():
            raise RuntimeError(f"SQL语法错误: {sql}")
        return [{"id": 1, "name": "测试数据"}]


class TimerCM:
    """计时器上下文管理器 - with块代码执行计时

    比装饰器更灵活：可以给任意代码块计时，不用包装成函数
    """

    def __init__(self, name="计时器"):
        self.name = name

    def __enter__(self):
        self.start = time.perf_counter()
        print(f"[{self.name}] 开始计时")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.perf_counter()
        self.elapsed = self.end - self.start
        print(f"[{self.name}] 耗时: {self.elapsed*1000:.2f}ms")
        return False


@contextmanager
def temporary_attribute(obj, attr_name, value):
    """contextmanager实现：临时修改对象属性，之后自动恢复

    工作场景：
    - 测试时临时改配置
    - 临时切换日志级别
    - 临时修改全局状态

    @contextmanager装饰器把生成器变成上下文管理器：
    - yield前面的代码 → __enter__
    - yield返回值 → as变量的值
    - yield后面的代码 → __exit__
    """
    old_value = getattr(obj, attr_name, None)
    existed = hasattr(obj, attr_name)
    print(f"[临时修改] {attr_name}: {old_value} → {value}")
    setattr(obj, attr_name, value)
    try:
        yield old_value
    finally:
        if existed:
            setattr(obj, attr_name, old_value)
            print(f"[恢复] {attr_name} = {old_value}")
        else:
            delattr(obj, attr_name)
            print(f"[恢复] 删除临时属性 {attr_name}")


@contextmanager
def temp_chdir(path):
    """临时切换工作目录"""
    import os
    old_cwd = os.getcwd()
    print(f"[目录切换] {old_cwd} → {path}")
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old_cwd)
        print(f"[目录恢复] 回到 {old_cwd}")


@contextmanager
def open_and_write_log(filepath):
    """写日志上下文管理器（演示异常处理）"""
    f = open(filepath, 'w', encoding='utf-8')
    print(f"[日志] 打开文件 {filepath}")
    try:
        yield f
    except Exception as e:
        f.write(f"[ERROR] {e}\\n")
        print(f"[日志] 写入异常信息")
        raise
    finally:
        f.close()
        print(f"[日志] 文件已关闭")


class Indenter:
    """缩进打印器 - 有趣的上下文管理器应用

    with Indenter() as indent:
        indent.print("level1")
        with indent:
            indent.print("level2")
    自动管理缩进层级
    """

    def __init__(self):
        self.level = 0

    def __enter__(self):
        self.level += 1
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.level -= 1
        return False

    def print(self, text):
        print("  " * self.level + text)


def main():
    """主函数 - 演示上下文管理器"""

    print("=" * 60)
    print("1. 数据库连接上下文管理器（类方式）")
    print("=" * 60)

    print("正常查询场景:")
    with DatabaseConnection("localhost", "mydb") as conn:
        result = conn.execute("SELECT * FROM users")
        print(f"查询结果: {result}")
        conn.execute("UPDATE users SET last_login=NOW()")

    print("\\n异常场景（SQL写错了）:")
    try:
        with DatabaseConnection("localhost", "mydb") as conn:
            conn.execute("SELECT * FROM users")
            conn.execute("SELEC ERROR SYNTAX")
    except RuntimeError as e:
        print(f"with外捕获到异常: {e}")
    print("注意：即使异常了，__exit__还是执行了，连接关闭了！")

    print("\\n" + "=" * 60)
    print("2. 计时器上下文管理器")
    print("=" * 60)

    with TimerCM("耗时操作"):
        total = 0
        for i in range(1000000):
            total += i
        print(f"计算结果: {total}")

    print("\\n嵌套计时器:")
    with TimerCM("外层"):
        time.sleep(0.1)
        with TimerCM("内层"):
            time.sleep(0.05)

    print("\\n" + "=" * 60)
    print("3. @contextmanager方式：临时修改属性")
    print("=" * 60)

    class Config:
        DEBUG = False
        TIMEOUT = 30

    print(f"修改前: DEBUG={Config.DEBUG}, TIMEOUT={Config.TIMEOUT}")

    with temporary_attribute(Config, "DEBUG", True):
        print(f"with块内: DEBUG={Config.DEBUG}")
        with temporary_attribute(Config, "TIMEOUT", 60):
            print(f"嵌套块内: TIMEOUT={Config.TIMEOUT}")
        print(f"退出内层: TIMEOUT={Config.TIMEOUT}")

    print(f"退出外层: DEBUG={Config.DEBUG}, TIMEOUT={Config.TIMEOUT}")
    print("→ 所有临时修改都自动恢复了，即使嵌套！")

    print("\\n" + "=" * 60)
    print("4. 缩进打印器（有趣的应用）")
    print("=" * 60)

    with Indenter() as indent:
        indent.print("项目结构")
        with indent:
            indent.print("src/")
            with indent:
                indent.print("main.py")
                indent.print("utils.py")
            indent.print("tests/")
            with indent:
                indent.print("test_main.py")
        indent.print("README.md")

    print("\\n" + "=" * 60)
    print("5. 文件操作是最常见的上下文管理器")
    print("=" * 60)

    import os
    import tempfile
    test_dir = tempfile.mkdtemp()
    test_file = os.path.join(test_dir, "test.txt")

    print(f"写入测试文件: {test_file}")
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write("第一行\\n")
        f.write("第二行\\n")
        f.write("第三行\\n")
    print("离开with块，文件自动关闭")

    print("\\n读取并打印:")
    with open(test_file, 'r', encoding='utf-8') as f:
        for line in f:
            print(f"  {line.rstrip()}")

    print("\\n" + "=" * 60)
    print("6. 不使用with的危险（对比）")
    print("=" * 60)

    print("错误方式（不推荐）:")
    print("""
    f = open("file.txt")
    data = f.read()
    # 如果这里抛出异常，f.close()永远不会执行！
    f.close()  # 可能执行不到，文件句柄泄漏
    """)

    print("\\n正确方式（用with）:")
    print("""
    with open("file.txt") as f:
        data = f.read()
    # 不管中间出不出错，文件一定关闭
    """)

    print("\\n" + "=" * 60)
    print("7. 多个上下文管理器同时用")
    print("=" * 60)

    file1 = os.path.join(test_dir, "a.txt")
    file2 = os.path.join(test_dir, "b.txt")

    with open(file1, 'w') as f1, open(file2, 'w') as f2:
        f1.write("文件A内容")
        f2.write("文件B内容")
    print("同时打开多个文件，退出时全部关闭")

    print("\\n" + "=" * 60)
    print("8. contextmanager异常处理注意事项")
    print("=" * 60)

    log_file = os.path.join(test_dir, "app.log")
    try:
        with open_and_write_log(log_file) as log:
            log.write("程序启动\\n")
            log.write("处理中...\\n")
            raise ValueError("模拟业务错误")
    except ValueError:
        print("异常被外层捕获，但日志文件已正确关闭")

    with open(log_file, 'r') as f:
        print("日志文件内容:")
        print(f.read())

    print("\\n" + "=" * 60)
    print("上下文管理器总结")
    print("=" * 60)
    print("""
什么时候用with？
  1. 需要"获取/打开/加锁"然后必须"释放/关闭/解锁"的资源
  2. 进入前做准备，退出后做清理
  3. 即使异常也要保证清理执行

两种实现方式怎么选？
  - 简单场景（前后逻辑少）：用@contextmanager + yield，代码短
  - 复杂场景（需要维护状态、多个方法）：用class实现__enter__/__exit__

常见内置上下文管理器：
  - open() 文件
  - threading.Lock() 线程锁
  - decimal.localcontext() 小数精度
  - warnings.catch_warnings() 警告捕获
  - 数据库连接、HTTP会话等第三方库大多支持

__exit__返回True=吞异常：几乎不要这么做！
  异常被吞掉你根本不知道出错了，除非你明确知道要处理所有异常
""")

    import shutil
    shutil.rmtree(test_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
`,
  },
];
