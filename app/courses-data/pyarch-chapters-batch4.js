// =============================================================
// Python 设计思想与架构教程 - 第 4 批章节(设计模式 · 结构型)
// -------------------------------------------------------------
// 1. pyarch-dp-adapter     适配器模式(Adapter)
// 2. pyarch-dp-decorator   装饰器模式(Decorator)
// 3. pyarch-dp-facade      外观模式(Facade)
// 4. pyarch-dp-composite   组合模式(Composite)
// 5. pyarch-dp-proxy       代理模式(Proxy)
// =============================================================

export const chapters = [
  {
    id: "pyarch-dp-adapter",
    icon: "🔌",
    title: "适配器模式(Adapter)",
    group: "设计模式 · 结构型",
    content: `# 适配器模式(Adapter)

## 一、适配器定义

适配器模式是一种**结构型设计模式**,它**将一个类的接口转换成客户端期望的另一个接口**。适配器让原本因为接口不兼容而无法一起工作的类可以协同工作。

> 一句话定义:**让接口不兼容的类能够合作无间。**

GoF《设计模式》中的标准定义:适配器模式「将一个类的接口转换成客户希望的另外一个接口。Adapter 模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。」

\`\`\`text
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client     │ ──────► │   Adapter    │ ──────► │   Adaptee    │
│  (期望目标   │ target  │  (实现 Target │ adaptee │  (被适配的   │
│   接口)      │ 接口    │   接口,持有  │ 调用    │   旧类)     │
│              │         │   Adaptee)   │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
\`\`\`

## 二、直觉理解

### 2.1 现实世界的插头转换器

这是最直观的类比。你有一个**国标两脚插头**(中国的电器),但你要插到**欧标插座**(欧洲的墙)上。两者的物理接口不兼容,怎么办?

- ❌ 错误做法:把插头剪断重新接线(修改电器源码,风险大)
- ❌ 错误做法:把墙上的插座撬掉换成国标(修改环境,不现实)
- ✅ 正确做法:买一个**插头转换器**,一头是欧标插头(适配墙),一头是国标插座(适配电器)

这个转换器就是**适配器**。它不改变电器,也不改变墙,只在中间做一次「接口转换」。

### 2.2 USB 转串口

老式设备只有 RS-232 串口,新电脑只有 USB 口。你买一个「USB 转串口」线,就能用 USB 口操作串口设备。这根线就是适配器。

### 2.3 读卡器

相机用 SD 卡,笔记本只有 USB 口。你用一个 USB 读卡器,就能通过 USB 读 SD 卡。读卡器是适配器。

**适配器的本质**:在不修改现有两个类的前提下,在中间加一层「翻译」,让它们能对话。

## 三、为什么需要适配器

### 3.1 现实痛点

在真实工程中,你几乎不可能控制所有代码:

| 场景 | 你想用的接口 | 实际存在的接口 | 冲突 |
|-----|-------------|---------------|------|
| 集成第三方库 | \`pay(amount)\` | 第三方是 \`charge(money)\` | 方法名不同 |
| 迁移老系统 | 新系统用 dict | 老系统返回 XML 字符串 | 数据格式不同 |
| 统一多个 SDK | \`PaymentProcessor.pay()\` | PayPal 用 \`PayPalClient.execute()\` | 接口形状不同 |
| 单位换算 | 米 | 英尺 | 单位不同 |
| 日志框架 | 你的 \`log(msg)\` | 第三方是 \`Logger.write(level, text)\` | 参数不同 |

如果没有适配器,你会怎么干?
- 直接改第三方库源码?❌ 升级时冲突,且很多库是编译好的
- 改自己的代码去迎合第三方?❌ 每接一个第三方就改一遍,代码被污染
- 在调用处写一堆 if/else?❌ 调用处膨胀,无法扩展

适配器的价值:**把「接口转换」的逻辑收敛到一个独立类里**,业务代码只面向统一的目标接口。

### 3.2 适配器的核心价值

1. **开闭原则**:不修改 Adaptee(被适配者),也不修改 Client(调用方)
2. **单一职责**:转换逻辑集中在适配器里,不散落在业务代码中
3. **可替换**:换掉第三方库时,只改适配器,业务代码不动
4. **可测试**:Mock 目标接口即可测试,不需要真连第三方

## 四、两种实现方式

适配器有两种经典实现,区别在于「适配器如何获得 Adaptee 的能力」:

| 维度 | 类适配器(Class Adapter) | 对象适配器(Object Adapter) |
|------|------------------------|---------------------------|
| 实现方式 | **多继承**:继承 Adaptee + 实现 Target | **组合**:持有 Adaptee 实例 |
| UML 关系 | Adapter is-a Adaptee | Adapter has-a Adaptee |
| 能否覆盖 Adaptee 方法 | 能(直接 override) | 不能(只能调用) |
| 适配多个 Adaptee | 不能(单继承限制) | 能(持有多个实例) |
| Python 是否推荐 | 一般(受 MRO 影响) | ✅ 推荐(组合优于继承) |
| 灵活性 | 低(编译期绑定) | 高(运行时可换 Adaptee) |

**口诀**:**类适配器靠继承,对象适配器靠组合。Python 里优先用组合。**

### 4.1 类适配器(多继承)

\`\`\`python
class Target:
    """客户端期望的接口"""
    def request(self) -> str:
        return "Target: 默认行为"


class Adaptee:
    """被适配的旧类,接口不兼容"""
    def specific_request(self) -> str:
        # 注意:返回的字符串是倒序的,客户端无法直接用
        return ".eetpadA eht fo roivaheb laicepS"


class Adapter(Adaptee, Target):
    """类适配器:继承 Adaptee,实现 Target 接口"""
    def request(self) -> str:
        # 调用父类 Adaptee 的方法,然后做转换(反转字符串)
        return f"Adapter: (TRANSLATED) {self.specific_request()[::-1]}"


def client_code(target: Target) -> None:
    """客户端代码:只认 Target 接口,不关心具体实现"""
    print(target.request())


if __name__ == "__main__":
    target = Target()
    client_code(target)              # Target: 默认行为

    adapter = Adapter()
    client_code(adapter)             # Adapter: (TRANSLATED) Special behavior of the Adaptee.
\`\`\`

**关键点**:
- \`Adapter\` 同时继承 \`Adaptee\` 和 \`Target\`,既是 Adaptee 又是 Target
- \`request()\` 内部调用继承来的 \`specific_request()\`,再做转换
- 客户端 \`client_code\` 只面向 \`Target\`,完全不知道 \`Adaptee\` 的存在

**缺点**:Python 虽然支持多继承,但 \`Adapter\` 继承 \`Adaptee\` 意味着它「是一个」Adaptee,这在语义上往往不合理(适配器不应该「是」被适配者)。而且继承绑定死了具体的 Adaptee 类,无法在运行时换。

### 4.2 对象适配器(组合)—— 推荐

\`\`\`python
class Target:
    """客户端期望的接口"""
    def request(self) -> str:
        return "Target: 默认行为"


class Adaptee:
    """被适配的旧类"""
    def specific_request(self) -> str:
        return ".eetpadA eht fo roivaheb laicepS"


class Adapter(Target):
    """对象适配器:实现 Target 接口,组合 Adaptee"""
    def __init__(self, adaptee: Adaptee) -> None:
        self._adaptee = adaptee          # 持有 Adaptee 的引用(组合)

    def request(self) -> str:
        # 委托给 Adaptee,再做转换
        return f"Adapter: (TRANSLATED) {self._adaptee.specific_request()[::-1]}"


def client_code(target: Target) -> None:
    print(target.request())


if __name__ == "__main__":
    adaptee = Adaptee()
    adapter = Adapter(adaptee)           # 运行时注入具体的 Adaptee
    client_code(adapter)                 # Adapter: (TRANSLATED) Special behavior of the Adaptee.
\`\`\`

**关键点**:
- \`Adapter\` 只实现 \`Target\`,内部**组合**一个 \`Adaptee\` 实例
- Adaptee 通过构造函数注入,运行时可替换(比如换成 Adaptee 的子类)
- 符合「组合优于继承」原则,是 Python 推荐写法

### 4.3 用 __getattr__ 实现动态适配器

有时候 Adaptee 有几十个方法,你只想转换其中几个,其他方法直接转发。手写转发太累,用 \`__getattr__\` 自动转发:

\`\`\`python
class Adaptee:
    """被适配的类,有大量方法"""
    def specific_request(self) -> str:
        return ".eetpadA eht fo roivaheb laicepS"

    def helper_a(self) -> str:
        return "helper_a"

    def helper_b(self) -> str:
        return "helper_b"


class Target:
    """目标接口只关心 request"""
    def request(self) -> str:
        return "Target"


class Adapter(Target):
    """动态适配器:显式转换 request,其他属性自动转发给 Adaptee"""
    def __init__(self, adaptee: Adaptee) -> None:
        self._adaptee = adaptee

    def request(self) -> str:
        # 只转换需要的方法
        return f"Adapter: {self._adaptee.specific_request()[::-1]}"

    def __getattr__(self, name: str):
        # 注意:__getattr__ 只在正常属性查找失败时才调用
        # 所以不会拦截 self.request 和 self._adaptee
        # 把对 helper_a / helper_b 等的访问转发给 _adaptee
        return getattr(self._adaptee, name)


if __name__ == "__main__":
    adapter = Adapter(Adaptee())
    print(adapter.request())        # Adapter: Special behavior of the Adaptee.
    print(adapter.helper_a())       # helper_a  (自动转发)
    print(adapter.helper_b())       # helper_b  (自动转发)
\`\`\`

**\`__getattr__\` 的陷阱**:
- \`__getattr__\` 只在**正常查找失败**时才触发,所以已定义的 \`request\` 和 \`_adaptee\` 不会被转发
- 千万不要在 \`__getattr__\` 里访问 \`self._adaptee\` 之前用 \`self.xxx\`,否则可能无限递归。如果 \`_adaptee\` 还没设置就调用 \`__getattr__\`,会触发 \`AttributeError\`
- 更安全的写法是先用 \`object.__getattribute__(self, "_adaptee")\` 获取

## 五、应用场景

### 5.1 何时该用适配器

| 场景 | 例子 | 是否适合 |
|-----|------|---------|
| 集成第三方库 | 把 \`requests\` 适配成你的 \`HttpClient\` 接口 | ✅ 非常适合 |
| 迁移老系统 | 老系统返回 XML,新系统期望 dict | ✅ 非常适合 |
| 统一不一致的接口 | PayPal/Stripe/Alipay 接口各异,统一成 \`pay()\` | ✅ 经典场景 |
| 单位/格式转换 | 摄氏度转华氏度、时间戳转日期 | ✅ 适合 |
| 包装遗留类 | 老类没有实现 Iterable,套一层适配器 | ✅ 适合 |
| 增加新功能 | 给对象加日志/缓存 | ❌ 该用装饰器 |
| 简化复杂子系统 | 把 10 个类的调用收敛成 1 个 | ❌ 该用外观 |
| 控制访问 | 加权限校验、延迟加载 | ❌ 该用代理 |

### 5.2 Python 标准库里的适配器

Python 内置就有很多适配器思想的体现:

\`\`\`python
import json
# 1. list() 适配任意可迭代对象
d = {"a": 1, "b": 2}
print(list(d))              # ['a', 'b']  —— dict 适配成 list

# 2. dict.items() 把 dict 适配成可迭代的 (key, value) 序列
for k, v in d.items():
    print(k, v)

# 3. enumerate() 把可迭代对象适配成 (index, value) 序列
for i, ch in enumerate("abc"):
    print(i, ch)            # 0 a / 1 b / 2 c

# 4. io.StringIO 把字符串适配成文件接口(有 read/write)
import io
f = io.StringIO("hello world")
print(f.read(5))            # hello

# 5. json.load 接受「文件对象」,但你也可以传 StringIO
data = json.loads('{"x": 1}')   # 直接传字符串
\`\`\`

这些「转换接口」的工具本质都是适配器:\`StringIO\` 让字符串拥有文件的接口,\`enumerate\` 让可迭代对象拥有「带索引」的接口。

## 六、实战:支付系统集成

这是适配器最经典的应用场景。你的电商系统要支持 PayPal、Stripe、Alipay 三家支付,但它们的 SDK 接口完全不同:

\`\`\`text
你的系统期望:           PayPal SDK:              Stripe SDK:              Alipay SDK:
payment.pay(amount)     paypal.charge(amount)    Stripe.create_charge()   alipay.trade_pay(money)
返回 {success, txn_id}  返回 {status, id}        返回 Charge 对象         返回 XML 字符串
\`\`\`

不用适配器,你的业务代码里会塞满 if/else:

\`\`\`python
# ❌ 反面教材:业务代码被第三方接口污染
def checkout(order, gateway):
    if gateway == "paypal":
        result = paypal_client.charge(order.amount)
        return {"success": result["status"] == "ok", "txn_id": result["id"]}
    elif gateway == "stripe":
        charge = stripe.Charge.create(amount=order.amount)
        return {"success": charge.paid, "txn_id": charge.id}
    elif gateway == "alipay":
        xml = alipay_client.trade_pay(order.amount)
        # 解析 XML...
    # 每加一个支付渠道就要改这里,违反开闭原则
\`\`\`

用适配器,把每个第三方 SDK 包一层,对外统一接口:

\`\`\`python
from abc import ABC, abstractmethod
from dataclasses import dataclass


# ============ 1. 定义统一的目标接口 ============
@dataclass
class PaymentResult:
    success: bool
    txn_id: str
    message: str = ""


class PaymentProcessor(ABC):
    """支付处理器统一接口(目标接口 Target)"""
    @abstractmethod
    def pay(self, amount: float) -> PaymentResult:
        """支付指定金额,返回统一结果"""
        ...


# ============ 2. 模拟三个第三方 SDK(Adaptee) ============
class PayPalSDK:
    """PayPal 的真实 SDK,接口与我们的不同"""
    def charge(self, amount: float, currency: str = "USD") -> dict:
        # 模拟调用 PayPal API
        return {"status": "ok", "id": "PAYPAL-TXN-001", "currency": currency}


class StripeSDK:
    """Stripe 的真实 SDK"""
    class _Charge:
        def __init__(self, charge_id: str, paid: bool):
            self.id = charge_id
            self.paid = paid

    def create_charge(self, amount: float) -> "_Charge":
        return self._Charge("stripe_ch_001", True)


class AlipaySDK:
    """支付宝的真实 SDK,返回 XML"""
    def trade_pay(self, amount: float) -> str:
        return f'<alipay><txn_id>ALIPAY-001</txn_id><amount>{amount}</amount><code>10000</code></alipay>'


# ============ 3. 三个适配器,各自适配一个 SDK ============
class PayPalAdapter(PaymentProcessor):
    """把 PayPalSDK 适配成 PaymentProcessor"""
    def __init__(self, sdk: PayPalSDK, currency: str = "USD"):
        self._sdk = sdk
        self._currency = currency

    def pay(self, amount: float) -> PaymentResult:
        raw = self._sdk.charge(amount, self._currency)
        return PaymentResult(
            success=raw["status"] == "ok",
            txn_id=raw["id"],
            message=f"PayPal 支付 {amount} {self._currency}",
        )


class StripeAdapter(PaymentProcessor):
    """把 StripeSDK 适配成 PaymentProcessor"""
    def __init__(self, sdk: StripeSDK):
        self._sdk = sdk

    def pay(self, amount: float) -> PaymentResult:
        charge = self._sdk.create_charge(amount)
        return PaymentResult(
            success=charge.paid,
            txn_id=charge.id,
            message=f"Stripe 支付 {amount}",
        )


class AlipayAdapter(PaymentProcessor):
    """把 AlipaySDK 适配成 PaymentProcessor(还要解析 XML)"""
    def __init__(self, sdk: AlipaySDK):
        self._sdk = sdk

    def pay(self, amount: float) -> PaymentResult:
        xml = self._sdk.trade_pay(amount)
        # 简化的 XML 解析
        txn_id = xml.split("<txn_id>")[1].split("</txn_id>")[0]
        code = xml.split("<code>")[1].split("</code>")[0]
        return PaymentResult(
            success=(code == "10000"),
            txn_id=txn_id,
            message=f"Alipay 支付 {amount}",
        )


# ============ 4. 业务代码只面向 PaymentProcessor ============
class OrderService:
    """订单服务,只依赖 PaymentProcessor 接口"""
    def __init__(self, processor: PaymentProcessor):
        self._processor = processor

    def checkout(self, amount: float) -> None:
        result = self._processor.pay(amount)
        if result.success:
            print(f"✅ 支付成功: {result.message}, 交易号: {result.txn_id}")
        else:
            print(f"❌ 支付失败: {result.message}")


# ============ 5. 运行 ============
if __name__ == "__main__":
    # 想换支付渠道,只需换适配器,OrderService 一行不改
    payers = [
        PayPalAdapter(PayPalSDK()),
        StripeAdapter(StripeSDK()),
        AlipayAdapter(AlipaySDK()),
    ]
    for payer in payers:
        OrderService(payer).checkout(99.9)

# 输出:
# ✅ 支付成功: PayPal 支付 99.9 USD, 交易号: PAYPAL-TXN-001
# ✅ 支付成功: Stripe 支付 99.9, 交易号: stripe_ch_001
# ✅ 支付成功: Alipay 支付 99.9, 交易号: ALIPAY-001
\`\`\`

**这个设计的优雅之处**:
- \`OrderService\` 完全不知道 PayPal/Stripe/Alipay 的存在,只认 \`PaymentProcessor\`
- 新增「微信支付」时,只需写一个 \`WeChatPayAdapter\`,业务代码零改动(开闭原则)
- 测试 \`OrderService\` 时,可以 Mock 一个 \`PaymentProcessor\`,不依赖真实 SDK
- 每个 SDK 的脏活(解析 XML、转换字段)都封在自己的适配器里,互不污染

## 七、适配器 vs 外观 vs 代理

这三个模式都是「包装」,初学者很容易混淆。区分的关键是**意图**:

| 维度 | 适配器 Adapter | 外观 Facade | 代理 Proxy |
|------|---------------|------------|-----------|
| **意图** | 转换接口,让不兼容的类合作 | 简化复杂子系统的访问 | 控制对对象的访问 |
| **解决的问题** | 接口不兼容 | 接口太复杂/太多 | 需要中间层(延迟、权限、缓存) |
| **改变接口吗** | ✅ 改变(把 A 接口转成 B 接口) | ✅ 提供新的简化接口 | ❌ 不改变(接口与原对象一致) |
| **包装几个对象** | 1 个(被适配者) | 多个(整个子系统) | 1 个(被代理对象) |
| **客户端知道吗** | 不知 Adaptee 存在 | 不知子系统细节 | 不知(以为是真实对象) |
| **典型例子** | USB 转串口 | 一键启动家庭影院 | 明星经纪人 |
| **方向** | 适配器 → Adaptee | 外观 → 子系统多个对象 | 代理 → 真实对象 |

**一句话区分**:
- **适配器**:接口对不上,中间翻译一下(A 接口 → B 接口)
- **外观**:子系统太复杂,给你一个简单入口(多 → 1)
- **代理**:同样的接口,但中间加一层控制(同接口 + 控制)

## 八、适配器模式的优缺点

### 优点

1. **符合单一职责**:接口转换逻辑集中在适配器,业务类只管业务
2. **符合开闭原则**:新增适配器不用改现有代码
3. **提高复用性**:让原本不能合作的类合作
4. **解耦**:客户端与具体 Adaptee 解耦,面向目标接口编程
5. **灵活**:对象适配器可在运行时替换 Adaptee

### 缺点

1. **增加复杂度**:多了一层类,小项目可能过度设计
2. **类适配器理解成本**:多继承在 Python 里涉及 MRO,新手难懂
3. **过度使用**:如果只是简单调用,直接用更简单,不必套适配器

## 九、实现细节与陷阱

### 9.1 适配器要实现「目标接口」,不是「继承 Adaptee」

新手常犯的错:让适配器继承 Adaptee,然后客户端直接用适配器当 Adaptee 用。这就违背了适配器的初衷——**客户端应该面向 Target 接口,而不是 Adaptee**。

\`\`\`python
# ❌ 错误:客户端还是要知道 Adaptee 的方法
class BadAdapter(Adaptee):
    pass

client(BadAdapter().specific_request())   # 客户端被迫知道 specific_request

# ✅ 正确:适配器实现 Target,客户端只调 request
class GoodAdapter(Target):
    def __init__(self, adaptee): self._adaptee = adaptee
    def request(self): return self._adaptee.specific_request()[::-1]

client(GoodAdapter(Adaptee()).request())  # 客户端只知 request
\`\`\`

### 9.2 双向适配器

有时你需要双向转换(A 接口 ↔ B 接口),可以写一个双向适配器,同时实现两个接口:

\`\`\`python
class BiAdapter(Target, AdapteeInterface):
    """既能当 Target 用,又能当 AdapteeInterface 用"""
    def request(self): ...        # 满足 Target
    def specific_request(self): ...  # 满足 AdapteeInterface
\`\`\`

但这种情况少见,且容易让类的职责模糊,慎用。

### 9.3 适配器 vs 直接修改 Adaptee

如果 Adaptee 是你自己的代码,且改动成本很低,直接改接口比加适配器更好。适配器适用于**「无法修改或不愿修改 Adaptee」**的场景(第三方库、遗留代码、跨团队协作)。

### 9.4 defaultdict 是适配器思想的体现

\`\`\`python
from collections import defaultdict

# 普通 dict 访问不存在的 key 会 KeyError
d = {}
# d["x"]  # KeyError

# defaultdict 适配了这个接口:访问不存在的 key 时自动创建
dd = defaultdict(list)
dd["x"].append(1)      # 不报错,自动把 dd["x"] 初始化为 []
print(dd)              # defaultdict(<class 'list'>, {'x': [1]})
\`\`\`

\`defaultdict\` 把「会报错的 dict 接口」适配成「自动初始化的 dict 接口」,这就是适配器思想。

## 十、真实框架中的适配器

适配器在主流框架里无处不在,识别它们能帮你加深理解:

### 10.1 Django REST Framework 的 Serializer

DRF 的 \`Serializer\` 本质就是把 ORM 模型(Adaptee)适配成 JSON 可序列化的 dict(Target):

\`\`\`python
from rest_framework import serializers
from myapp.models import User

class UserSerializer(serializers.ModelSerializer):
    """把 User 模型适配成 JSON 序列化接口"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# ORM 模型(Adaptee) → Serializer(Adapter) → JSON dict(Target)
user = User.objects.get(id=1)        # Adaptee
data = UserSerializer(user).data     # 适配成 dict
# {'id': 1, 'username': 'alice', 'email': 'alice@x.com'}
\`\`\`

\`UserSerializer\` 把 ORM 对象的复杂接口(查询集、外键、多对多)适配成简单的 dict 接口,前端直接拿 JSON 用。

### 10.2 SQLAlchemy 的 Engine 适配不同数据库

SQLAlchemy 的 \`Engine\` 适配不同数据库驱动(MySQLdb、psycopg2、sqlite3),对外提供统一的 \`execute()\` 接口:

\`\`\`python
from sqlalchemy import create_engine

# 不同的 Adaptee(DBAPI 驱动),通过 URL 指定
engine_mysql = create_engine("mysql+pymysql://user:pass@host/db")
engine_pg = create_engine("postgresql+psycopg2://user:pass@host/db")
engine_sqlite = create_engine("sqlite:///app.db")

# 对外都是统一的 Engine 接口(Target)
for eng in [engine_mysql, engine_pg, engine_sqlite]:
    with eng.connect() as conn:
        conn.execute("SELECT 1")   # 统一接口,不用管底层驱动
\`\`\`

\`create_engine\` 内部根据 URL 创建对应的 \`Dialect\`(适配器),把不同 DBAPI 驱动的差异屏蔽掉。

### 10.3 Python 的 collections.abc

\`collections.abc\` 定义了一系列抽象基类(Iterable、Sequence、Mapping),它们是「目标接口」。任何实现了对应方法的类,即使不继承 ABC,也能被适配成对应接口:

\`\`\`python
from collections.abc import Iterable

class MyRange:
    """自定义可迭代对象,适配成 Iterable 接口"""
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        for i in range(self.n):
            yield i

r = MyRange(5)
print(isinstance(r, Iterable))   # True(鸭子类型适配)
print(list(r))                   # [0, 1, 2, 3, 4](list 适配 Iterable)
\`\`\`

Python 的鸭子类型天然支持适配器思想——只要实现目标接口的方法,就能被当作目标接口使用。

### 10.4 logging 模块的 Handler 适配

\`logging\` 模块的 \`Handler\`(FileHandler、StreamHandler、SocketHandler)都是把「日志记录」适配成不同的输出目标:

\`\`\`python
import logging

logger = logging.getLogger("app")
logger.addHandler(logging.FileHandler("app.log"))      # 适配成文件输出
logger.addHandler(logging.StreamHandler())              # 适配成控制台输出
logger.addHandler(logging.handlers.SocketHandler(...))  # 适配成网络输出

logger.info("hello")  # 同一个接口,适配到多个目标
\`\`\`

每个 Handler 是一个适配器,把统一的 \`emit(record)\` 接口适配成不同的物理输出。

## 十一、与其他模式的关系

- **适配器 + 外观**:外观模式内部常用适配器来统一不同子系统的接口
- **适配器 + 装饰器**:装饰器不改变接口(同接口加功能),适配器改变接口
- **适配器 + 桥接**:桥接分离抽象与实现,适配器转换接口,关注点不同
- **适配器 + 策略**:策略模式选择不同算法,适配器统一不同接口,可组合使用

## 十二、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
|-------|---------|---------|------|
| 适配器不实现 Target | 只继承 Adaptee | 实现 Target 接口 | 客户端要面向 Target |
| 类适配器乱用多继承 | 继承一堆无关类 | 只继承 Adaptee + Target | 多继承要克制 |
| __getattr__ 无限递归 | \`__getattr__\` 里访问 \`self._adaptee\` | 用 \`object.__getattribute__\` | 防止属性未初始化时递归 |
| 在适配器里加新功能 | 加日志、加缓存 | 那是装饰器的活 | 适配器只做接口转换 |
| 适配器改变 Adaptee | 修改 Adaptee 源码 | 组合 Adaptee,只调用 | 不应修改被适配者 |
| 客户端依赖具体适配器 | \`client(PayPalAdapter())\` | \`client(PaymentProcessor)\` | 面向接口编程 |
| 适配器包装多个对象 | 一个适配器适配一堆类 | 那是外观模式 | 适配器只适配 1 个 |
| 忘记处理 Adaptee 异常 | 直接抛原始异常 | 转换成目标接口的异常 | 异常也要适配 |
| 过度设计 | 1:1 转发也套适配器 | 直接调用更简单 | 简单场景别加层 |
| 单元测试连真实 SDK | 测试时调真实支付 | Mock 目标接口 | 适配器本身单独测 |

## 十三、本章小结

适配器模式的核心思想是**「不修改现有代码,在中间加一层翻译」**。它解决的是**接口不兼容**问题,让你能在不改动 Adaptee 和 Client 的前提下让它们协作。

记住三个要点:
1. **客户端面向 Target 接口**,不知道 Adaptee 存在
2. **Python 优先用对象适配器**(组合优于继承)
3. **适配器只做接口转换**,不要塞额外功能(那是装饰器的活)

下次遇到「第三方 SDK 接口和我们不一样」「老系统返回的格式要转一下」「多个同类服务接口要统一」,第一反应就应该是:这里该上适配器了。`,
  },
  {
    id: "pyarch-dp-decorator",
    icon: "🎁",
    title: "装饰器模式(Decorator)",
    group: "设计模式 · 结构型",
    content: `# 装饰器模式(Decorator)

## 一、装饰器定义

装饰器模式是一种**结构型设计模式**,它**动态地给一个对象添加额外的职责**,而不改变其接口。装饰器是继承的替代方案,通过组合而非继承来扩展功能。

> 一句话定义:**动态地给对象加职责,比继承更灵活。**

GoF 定义:装饰器模式「动态地给一个对象添加一些额外的职责。就增加功能来说,Decorator 模式相比生成子类更加灵活。」

\`\`\`text
                ┌───────────────────────────┐
                │      Component (接口)      │
                │   operation()             │
                └─────────────┬─────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────────┐
    │  ConcreteComponent│             │     Decorator       │
    │  operation()     │             │  - component: Component│
    │  (被装饰对象)    │             │  operation() {       │
    │                  │             │    component.operation()│
    └─────────────────┘             │    + 加点料          │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    ▼                     ▼
                            ┌──────────────┐      ┌──────────────┐
                            │  ConcreteDecA │      │  ConcreteDecB │
                            │  日志/计时    │      │  缓存/重试    │
                            └──────────────┘      └──────────────┘
\`\`\`

## 二、直觉理解

### 2.1 给手机贴膜、加壳

你买了一部手机(ConcreteComponent),它能打电话。你想给它加「防摔」功能,不必买一部新手机,套个手机壳(DecoratorA)就行。又想加「防水」功能,贴个防水膜(DecoratorB)。手机本身没变,但功能被一层层「装饰」上去。

\`\`\`text
[防水膜 [手机壳 [手机]]]  ← 装饰器可以嵌套
\`\`\`

### 2.2 咖啡加料

星巴克式的点单:基础咖啡(Espresso),加牛奶(+2 元),加糖(+1 元),加奶泡(+3 元)。每加一种配料就是一层装饰,最终价格是所有层累加。

\`\`\`text
[奶泡 [糖 [牛奶 [Espresso]]]].cost() = 3 + 1 + 2 + 15 = 21
\`\`\`

### 2.3 快递包装

你寄一个东西,先装盒子,再套防水袋,再贴易碎标签。每层包装都是装饰,不改变「里面是个东西」这个本质,但加了保护属性。

**装饰器的本质**:**用「包装」代替「继承」来扩展功能,且包装可以层层嵌套。**

## 三、装饰器模式 vs Python 的 @decorator

**这是初学者最大的混淆点**,必须先讲清楚:

| 维度 | 装饰器模式(设计模式) | Python @decorator(语法糖) |
|------|---------------------|--------------------------|
| 是什么 | GoF 结构型模式 | Python 语法特性 |
| 作用对象 | 对象(运行时包装) | 函数/类(定义时包装) |
| 实现方式 | 类 + 组合 | 函数/类,通过 @ 语法应用 |
| 关系 | 设计模式 | 语法糖是设计模式的一种应用 |
| 典型例子 | Coffee + MilkDecorator | \`@staticmethod\` \`@functools.wraps\` |

**联系**:Python 的 @decorator 语法糖**是装饰器模式的应用**——它把一个函数「装饰」成另一个函数,加了新职责。但 Python 的 @decorator 主要用于函数/类,而 GoF 装饰器模式更通用(装饰任意对象)。

本章两个都讲,先讲 GoF 经典装饰器(对象级),再讲 Python @decorator(函数级,更常用)。

## 四、为什么用装饰器而不是继承

### 4.1 继承的问题

假设你要给「窗口」加功能:滚动条、边框、阴影。用继承会怎样?

\`\`\`text
Window
├── WindowWithScrollbar
├── WindowWithBorder
├── WindowWithShadow
├── WindowWithScrollbarAndBorder
├── WindowWithScrollbarAndShadow
├── WindowWithBorderAndShadow
└── WindowWithScrollbarAndBorderAndShadow  ← 组合爆炸!
\`\`\`

3 个功能要 7 个子类(\`2^3 - 1\`),4 个功能要 15 个子类。这是**类爆炸**问题。

### 4.2 装饰器的解法

用装饰器,只需 3 个装饰器类,任意组合:

\`\`\`text
window = ShadowDecorator(BorderDecorator(ScrollbarDecorator(SimpleWindow())))
window.draw()   # 依次调用: Shadow -> Border -> Scrollbar -> SimpleWindow
\`\`\`

**对比表**:

| 维度 | 继承 | 装饰器 |
|------|------|--------|
| 扩展方式 | 编译期固定 | 运行时动态组合 |
| 类数量 | 组合爆炸(2^n) | 线性(n) |
| 灵活性 | 低(改要重新编译) | 高(运行时拆装) |
| 单一职责 | 差(子类承担多个功能) | 好(每个装饰器一个功能) |
| 复杂度 | 类多但简单 | 类少但要理解嵌套 |

## 五、GoF 经典装饰器:咖啡示例

\`\`\`python
from abc import ABC, abstractmethod


# ============ 1. 抽象组件 ============
class Beverage(ABC):
    """饮料抽象基类(Component)"""
    @abstractmethod
    def cost(self) -> float:
        ...

    @abstractmethod
    def description(self) -> str:
        ...


# ============ 2. 具体组件 ============
class Espresso(Beverage):
    """浓缩咖啡(ConcreteComponent)"""
    def cost(self) -> float:
        return 15.0

    def description(self) -> str:
        return "浓缩咖啡"


class HouseBlend(Beverage):
    """综合咖啡"""
    def cost(self) -> float:
        return 12.0

    def description(self) -> str:
        return "综合咖啡"


# ============ 3. 抽象装饰器 ============
class CondimentDecorator(Beverage):
    """调料装饰器基类(Decorator),继承 Beverage 并组合一个 Beverage"""
    def __init__(self, beverage: Beverage):
        self._beverage = beverage      # 组合被装饰对象

    # 注意:不实现 cost/description,留给子类


# ============ 4. 具体装饰器 ============
class Milk(CondimentDecorator):
    """牛奶装饰器"""
    def cost(self) -> float:
        return self._beverage.cost() + 2.0      # 加 2 元

    def description(self) -> str:
        return f"{self._beverage.description()} + 牛奶"


class Sugar(CondimentDecorator):
    """糖装饰器"""
    def cost(self) -> float:
        return self._beverage.cost() + 1.0

    def description(self) -> str:
        return f"{self._beverage.description()} + 糖"


class Whip(CondimentDecorator):
    """奶泡装饰器"""
    def cost(self) -> float:
        return self._beverage.cost() + 3.0

    def description(self) -> str:
        return f"{self._beverage.description()} + 奶泡"


# ============ 5. 使用:层层装饰 ============
if __name__ == "__main__":
    # 一杯浓缩咖啡
    coffee: Beverage = Espresso()
    print(coffee.description(), coffee.cost())   # 浓缩咖啡 15.0

    # 加牛奶
    coffee = Milk(coffee)
    print(coffee.description(), coffee.cost())   # 浓缩咖啡 + 牛奶 17.0

    # 再加糖
    coffee = Sugar(coffee)
    print(coffee.description(), coffee.cost())   # 浓缩咖啡 + 牛奶 + 糖 18.0

    # 再加奶泡
    coffee = Whip(coffee)
    print(coffee.description(), coffee.cost())   # 浓缩咖啡 + 牛奶 + 糖 + 奶泡 21.0
\`\`\`

**关键点**:
- \`CondimentDecorator\` **既继承 Beverage 又组合 Beverage**——继承是为了「是 Beverage」,组合是为了「包装 Beverage」
- 每个装饰器调用 \`self._beverage.xxx()\` 时,先把责任委派给被装饰对象,再加自己的料
- 装饰器可以任意嵌套,顺序不同结果可能不同(糖+奶 vs 奶+糖,描述顺序不同)

## 六、Python @decorator(语法糖)

这是 Python 工程中最常用的「装饰器」。它本质是个**接收函数、返回函数**的高阶函数。

### 6.1 函数装饰器(最常见)

\`\`\`python
import functools
import time


def log(func):
    """日志装饰器:在函数调用前后打印日志"""
    @functools.wraps(func)          # 保留原函数的 __name__、__doc__
    def wrapper(*args, **kwargs):
        print(f"[LOG] 调用 {func.__name__}, 参数={args}, {kwargs}")
        result = func(*args, **kwargs)
        print(f"[LOG] {func.__name__} 返回 {result!r}")
        return result
    return wrapper


@log                                # 等价于 add = log(add)
def add(a, b):
    """两数相加"""
    return a + b


add(1, 2)
# [LOG] 调用 add, 参数=(1, 2), {}
# [LOG] add 返回 3
print(add.__name__)                 # add(functools.wraps 的功劳,否则是 wrapper)
\`\`\`

**\`@functools.wraps\` 为什么重要**:
- 不加的话,\`add.__name__\` 会变成 \`wrapper\`,文档也丢了
- 调试时看不出原始函数名,反射也会出错
- **写装饰器永远要加 @functools.wraps**

### 6.2 带参数的装饰器

如果装饰器自己也要参数(比如 \`@retry(times=3)\`),需要**三层嵌套**:

\`\`\`python
import functools
import time
import random


def retry(times: int = 3, delay: float = 1.0):
    """重试装饰器:失败时重试 times 次,每次间隔 delay 秒"""
    def decorator(func):            # 第二层:接收被装饰函数
        @functools.wraps(func)
        def wrapper(*args, **kwargs):  # 第三层:实际执行的包装函数
            last_exc = None
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    print(f"[RETRY] {func.__name__} 第 {i+1} 次失败: {e}")
                    time.sleep(delay)
            raise last_exc           # 重试耗尽,抛最后一次异常
        return wrapper
    return decorator


@retry(times=3, delay=0.5)
def unstable_task():
    """模拟不稳定的任务,有 70% 概率失败"""
    if random.random() < 0.7:
        raise RuntimeError("随机失败")
    return "成功"


try:
    print(unstable_task())
except RuntimeError as e:
    print(f"最终失败: {e}")
\`\`\`

**三层结构解析**:
1. \`retry(times=3)\` —— 最外层,**接收装饰器参数**,返回真正的 decorator
2. \`decorator(func)\` —— 中间层,**接收被装饰函数**,返回 wrapper
3. \`wrapper(*args, **kwargs)\` —— 最内层,**实际替换原函数**的包装

口诀:**「带参装饰器三层套,最外收参中收函,最里干活」。**

### 6.3 类装饰器(用类实现装饰器)

除了用函数写装饰器,还可以用类(利用 \`__call__\`):

\`\`\`python
import functools


class CountCalls:
    """统计函数被调用次数的类装饰器"""
    def __init__(self, func):
        functools.update_wrapper(self, func)   # 等价于 @functools.wraps
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"[COUNT] {self.func.__name__} 第 {self.count} 次调用")
        return self.func(*args, **kwargs)


@CountCalls
def say_hi(name):
    print(f"Hi, {name}")


say_hi("Alice")    # [COUNT] say_hi 第 1 次调用 / Hi, Alice
say_hi("Bob")      # [COUNT] say_hi 第 2 次调用 / Hi, Bob
print(say_hi.count)  # 2
\`\`\`

**类装饰器的好处**:可以保存状态(如调用次数),比闭包更清晰。

### 6.4 装饰类(给类加方法)

装饰器不仅能装饰函数,还能装饰**整个类**:

\`\`\`python
import functools
def singleton(cls):
    """单例装饰器:让一个类只有一个实例"""
    instances = {}

    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance


@singleton
class Database:
    def __init__(self):
        print("初始化数据库连接...")
        self.conn = "db-connection"


db1 = Database()    # 初始化数据库连接...
db2 = Database()    # (不再初始化)
print(db1 is db2)   # True
\`\`\`

**注意**:装饰类后,\`Database\` 实际上是 \`get_instance\` 函数,不再是类。这在某些场景(如 isinstance 检查)会有问题,慎用。

## 七、嵌套装饰器与执行顺序

多个装饰器可以叠加,执行顺序是**「从下往上装饰,从上往下执行」**:

\`\`\`python
@decorator_a      # 后装饰(外层)
@decorator_b      # 先装饰(内层)
def func():
    pass

# 等价于:func = decorator_a(decorator_b(func))
\`\`\`

\`\`\`python
def decorator_a(func):
    print("A: 装饰中")
    def wrapper(*args, **kwargs):
        print("A: before")
        result = func(*args, **kwargs)
        print("A: after")
        return result
    return wrapper


def decorator_b(func):
    print("B: 装饰中")
    def wrapper(*args, **kwargs):
        print("B: before")
        result = func(*args, **kwargs)
        print("B: after")
        return result
    return wrapper


@decorator_a
@decorator_b
def hello():
    print("hello")

# 定义时输出(装饰阶段,从下往上):
# B: 装饰中
# A: 装饰中

hello()
# 调用时输出(执行阶段,从外到内):
# A: before
# B: before
# hello
# B: after
# A: after
\`\`\`

**记忆口诀**:**装饰时「离函数近的先上」,执行时「离函数远的先跑」**。就像穿衣服:内衣先穿(离身体近),外套后穿(离身体远);脱的时候反过来。

## 八、实战:三个实用装饰器

### 8.1 日志装饰器 + 计时装饰器

\`\`\`python
import functools
import time
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def log_call(func):
    """记录函数调用的日志"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        args_str = ", ".join([repr(a) for a in args] + [f"{k}={v!r}" for k, v in kwargs.items()])
        logger.info(f"调用 {func.__name__}({args_str})")
        try:
            result = func(*args, **kwargs)
            logger.info(f"{func.__name__} 返回 {result!r}")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} 抛出 {type(e).__name__}: {e}")
            raise
    return wrapper


def timer(func):
    """统计函数执行耗时"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"{func.__name__} 耗时 {elapsed:.4f}s")
        return result
    return wrapper


@log_call
@timer
def slow_sum(n):
    """计算 1+2+...+n,故意慢"""
    time.sleep(0.5)
    return sum(range(n + 1))


slow_sum(100)
# INFO 调用 slow_sum(100)
# INFO slow_sum 耗时 0.5008s
# INFO slow_sum 返回 5050
\`\`\`

### 8.2 Flask/FastAPI 路由装饰器原理

Web 框架的路由装饰器是装饰器的经典应用:

\`\`\`python
# 简化版 Flask 路由装饰器原理
class FlaskMini:
    def __init__(self):
        self.routes = {}          # path -> function

    def route(self, path):
        """路由装饰器工厂"""
        def decorator(func):
            self.routes[path] = func      # 注册路由
            return func                   # 注意:原样返回,不包装
        return decorator

    def run(self, path):
        if path in self.routes:
            return self.routes[path]()
        return "404 Not Found"


app = FlaskMini()

@app.route("/hello")
def hello():
    return "Hello, World!"

@app.route("/bye")
def bye():
    return "Goodbye!"

print(app.run("/hello"))   # Hello, World!
print(app.routes)          # {'/hello': <function hello>, '/bye': <function bye>}
\`\`\`

**关键点**:路由装饰器**不改变函数行为,只是把函数注册到路由表**。这是「注册型装饰器」,与「包装型装饰器」不同——它原样返回函数,副作用是注册。

### 8.3 functools.lru_cache 源码思路

\`functools.lru_cache\` 是标准库最有名的装饰器之一,用 LRU(最近最少使用)策略缓存函数结果:

\`\`\`python
import functools

@functools.lru_cache(maxsize=128)
def fib(n):
    """斐波那契数列,带缓存"""
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

print(fib(100))     # 瞬间算出 354224848179261915075
print(fib.cache_info())   # CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)
\`\`\`

简化版实现思路:

\`\`\`python
import functools
from collections import OrderedDict


def my_lru_cache(maxsize=128):
    """简化版 lru_cache"""
    def decorator(func):
        cache = OrderedDict()       # 有序字典,模拟 LRU

        @functools.wraps(func)
        def wrapper(*args):
            if args in cache:
                cache.move_to_end(args)    # 命中,移到末尾(最近使用)
                return cache[args]
            result = func(*args)
            if len(cache) >= maxsize:
                cache.popitem(last=False)  # 满了,弹出头部(最久未用)
            cache[args] = result
            return result

        wrapper.cache = cache              # 暴露缓存供调试
        return wrapper
    return decorator


@my_lru_cache(maxsize=3)
def square(x):
    print(f"  计算 {x}^2")
    return x * x

print(square(2))   #   计算 2^2 / 4
print(square(2))   # 4(命中缓存,不打印"计算")
print(square.cache)  # {(2,): 4}
\`\`\`

## 九、装饰器 vs 继承

| 维度 | 继承 | 装饰器 |
|------|------|--------|
| 扩展时机 | 编译期/定义时 | 运行时 |
| 接口 | 子类有父类全部接口 | 装饰器与组件同接口 |
| 类数量 | 功能组合时爆炸 | 线性增长 |
| 灵活性 | 低(改要改类层次) | 高(运行时拆装) |
| 状态共享 | 子类可访问父类 protected | 装饰器不访问被装饰者内部 |
| 性能 | 直接方法调用快 | 多层委托有开销 |
| 适用 | 功能固定、层次清晰 | 功能可组合、需动态增减 |

**选择建议**:
- 功能**固定且简单**:用继承
- 功能**需要任意组合**:用装饰器
- 功能**运行时才决定**:用装饰器

## 十、Python 装饰器常见陷阱

### 10.1 忘记 @functools.wraps

\`\`\`python
# ❌ 错误
def log(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@log
def add(a, b): return a + b

print(add.__name__)   # wrapper  ← 丢了原函数名!

# ✅ 正确
def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

### 10.2 装饰器有副作用

\`\`\`python
# ❌ 错误:装饰器在导入时就执行了副作用
def register(func):
    print(f"注册 {func}")     # 导入模块时就打印!
    return func

@register
def view(): pass
\`\`\`

如果副作用只想在调用时发生,要放到 wrapper 里。

### 10.3 类装饰器破坏 isinstance

\`\`\`python
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Foo: pass

f = Foo()
isinstance(f, Foo)   # False!因为 Foo 现在是函数,不是类
\`\`\`

### 10.4 装饰器顺序搞反

\`\`\`python
# 顺序不同,行为不同
@auth        # 先鉴权
@cache       # 再查缓存
def view(): pass

# vs

@cache       # 先查缓存(可能缓存了未鉴权的结果!)
@auth
def view(): pass   # 危险:鉴权结果被缓存
\`\`\`

## 十一、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
|-------|---------|---------|------|
| 忘记 wraps | 不加 @functools.wraps | 必须加 | 保留原函数元信息 |
| 带参装饰器层数错 | 写成两层 | 三层 | 最外层收装饰器参数 |
| 装饰顺序混淆 | 以为从上往下装饰 | 从下往上装饰,从上往下执行 | 像穿衣服 |
| 类装饰器丢 isinstance | 装饰后 isinstance 失效 | 用 __init_subclass__ 或不装饰类 | 慎用类装饰器 |
| 装饰器有导入副作用 | 装饰阶段执行业务逻辑 | 副作用放 wrapper 里 | 装饰阶段只包装 |
| GoF 装饰器不继承 Component | 装饰器不实现同一接口 | 必须继承/实现 Component | 客户端要透明 |
| 装饰器改变接口 | 返回不同类型的方法 | 保持接口一致 | 装饰器不改接口 |
| wrapper 不返回值 | 漏写 return func(...) | return func(*args, **kwargs) | 否则原函数返回值丢失 |
| 缓存装饰器不处理 kwargs | 只用 args 当 key | 用 (args, tuple(sorted(kwargs.items()))) | kwargs 也要参与 key |
| 装饰 staticmethod | 直接 @decorator @staticmethod | 顺序要对,且 staticmethod 在最下 | staticmethod 返回的是描述符 |

## 十二、本章小结

装饰器模式的核心是**「用组合代替继承来扩展功能,且可层层嵌套」**。在 Python 中,它有两个层次:

1. **GoF 经典装饰器**:用类 + 组合装饰对象(咖啡示例)
2. **Python @decorator**:语法糖,装饰函数/类(更常用)

记住三个要点:
1. **装饰器不改接口**(GoF)/**装饰器包装函数**(Python)
2. **写 Python 装饰器永远加 @functools.wraps**
3. **带参数的装饰器要三层嵌套**

装饰器是 Python 工程中最实用的设计模式,日志、缓存、重试、权限、路由都靠它。掌握装饰器,你的代码会优雅很多——把横切关注点(cross-cutting concerns)从业务逻辑里抽出来,业务代码只管业务。`,
  },
  {
    id: "pyarch-dp-facade",
    icon: "🏛️",
    title: "外观模式(Facade)",
    group: "设计模式 · 结构型",
    content: `# 外观模式(Facade)

## 一、外观定义

外观模式是一种**结构型设计模式**,它**为复杂的子系统提供一个统一的高层接口**。外观通过定义一个高层接口,让子系统更容易使用。

> 一句话定义:**给复杂子系统一个简单入口,客户端只跟这个入口打交道。**

GoF 定义:外观模式「为子系统中的一组接口提供一个一致的界面,Facade 模式定义了一个高层接口,这个接口使得这一子系统更加容易使用。」

\`\`\`text
        ┌─────────────┐
        │   Client    │  ← 客户端只跟 Facade 打交道
        └──────┬──────┘
               │  调用 Facade 的简单方法
               ▼
        ┌─────────────┐
        │   Facade    │  ← 外观:把子系统的复杂调用打包成简单方法
        └──────┬──────┘
               │  内部协调多个子系统
   ┌───────────┼───────────┐
   ▼           ▼           ▼
┌──────┐  ┌──────┐  ┌──────┐
│子系统A│  │子系统B│  │子系统C│  ← 复杂的子系统,客户端不需要知道
└──────┘  └──────┘  └──────┘
\`\`\`

## 二、直觉理解

### 2.1 一键启动

你按电脑的电源键,电脑内部要做一连串事:
1. CPU 初始化
2. 内存自检
3. 加载 BIOS
4. 启动引导程序
5. 加载操作系统内核
6. 启动系统服务
7. 显示登录界面

但你只按了一个键。这个「电源键」就是外观——它把背后十几个子系统的复杂协作,封装成一个简单的「开机」动作。

### 2.2 餐厅点套餐

去餐厅,菜单上有 200 道菜,你选困难症犯了。服务员说:「我们有 A 套餐(前菜+主菜+甜点+饮料),88 元」。你点了个 A 套餐,不用纠结。「套餐」就是外观,把复杂的点菜决策简化成一个选择。

### 2.3 客服一键转接

你打电话给运营商,听到「宽带故障请按 1,话费查询请按 2...」。你按了 1,系统自动把你转到宽带部门,同时调出你的宽带信息。这个 IVR(交互式语音应答)就是外观,把背后多个系统的协作打包。

### 2.4 编译器一键 build

\`npm run build\` 一条命令,背后做了:lint 检查、类型检查、转译、打包、压缩、生成 source map、复制静态资源... \`build\` 命令就是外观。

**外观的本质**:**把「多个子系统的多步协调」收敛成「外观的一个方法调用」,客户端不用知道子系统。**

## 三、为什么需要外观

### 3.1 现实痛点

假设你做一个「家庭智能中控」,要控制 TV、音响、投影仪、窗帘、灯光、空调。每个设备都有自己的类和接口:

\`\`\`python
# 不用外观,客户端要这么干才能"看电影":
def watch_movie_manual():
    tv = TV()
    tv.on()
    tv.set_source("HDMI1")
    tv.set_volume(30)

    amp = Amplifier()
    amp.on()
    amp.set_surround_sound()
    amp.set_volume(25)

    projector = Projector()
    projector.on()
    projector.set_widescreen()

    curtain = Curtain()
    curtain.close()

    light = Light()
    light.dim(10)

    player = MediaPlayer()
    player.on()
    player.play("movie.mp4")
\`\`\`

问题:
- **客户端要记住 6 个类的调用顺序**,任何一个顺序错了都可能出问题
- **每个客户端都要重复这套代码**,改一个设备接口就要改所有客户端
- **客户端与 6 个子系统强耦合**,换一个设备就要改客户端

### 3.2 外观的解法

外观把这些步骤打包成一个方法:

\`\`\`python
class HomeTheaterFacade:
    def __init__(self, tv, amp, projector, curtain, light, player):
        self.tv = tv
        self.amp = amp
        self.projector = projector
        self.curtain = curtain
        self.light = light
        self.player = player

    def watch_movie(self, movie):
        """一键看电影"""
        self.curtain.close()
        self.light.dim(10)
        self.projector.on()
        self.projector.set_widescreen()
        self.amp.on()
        self.amp.set_surround_sound()
        self.tv.on()
        self.tv.set_source("HDMI1")
        self.player.on()
        self.player.play(movie)

# 客户端只跟 Facade 打交道
facade = HomeTheaterFacade(tv, amp, projector, curtain, light, player)
facade.watch_movie("movie.mp4")   # 一行搞定
\`\`\`

### 3.3 外观的核心价值

1. **简化复杂度**:把 N 步操作收敛成 1 步
2. **解耦**:客户端只依赖 Facade,不直接依赖子系统
3. **分层**:Facade 是「应用层」与「子系统层」之间的缓冲
4. **不影响子系统**:子系统本身不变,Facade 只是加了一层包装

## 四、外观 vs 适配器 vs 中介者

这三个模式都涉及「中间层」,容易混淆。区分的关键是**意图**和**方向**:

| 维度 | 外观 Facade | 适配器 Adapter | 中介者 Mediator |
|------|------------|---------------|----------------|
| **意图** | 简化子系统访问 | 转换不兼容接口 | 解耦对象间直接通信 |
| **解决的问题** | 子系统太复杂 | 接口对不上 | 对象间网状依赖 |
| **方向** | 单向(Facade → 子系统) | 单向(Adapter → Adaptee) | 双向(对象 ↔ Mediator) |
| **包装几个对象** | 多个(整个子系统) | 1 个(被适配者) | 多个(同事对象) |
| **改变接口吗** | 提供新的简化接口 | 转换成目标接口 | 提供通信枢纽 |
| **子系统知道 Facade 吗** | 不知道 | Adaptee 不知道 Adapter | 同事知道 Mediator |
| **典型例子** | 一键开机 | USB 转串口 | 机场塔台调度 |

**一句话区分**:
- **外观**:子系统太复杂,给你一个简单入口(**多 → 1**)
- **适配器**:接口对不上,中间翻译一下(**A 接口 → B 接口**)
- **中介者**:对象之间互相调用太乱,中间加个调度(**网状 → 星形**)

## 五、外观的应用场景

### 5.1 何时该用外观

| 场景 | 例子 | 是否适合 |
|-----|------|---------|
| 封装复杂库 | 把 PIL 的几十个调用打包成 resize_image() | ✅ 非常适合 |
| API 网关 | 微服务网关聚合多个后端服务 | ✅ 经典场景 |
| SDK 设计 | 给复杂库提供简单 API | ✅ 非常适合 |
| 分层架构 | 业务层通过 Facade 访问数据层 | ✅ 适合 |
| 重构遗留代码 | 用 Facade 包住老代码,逐步迁移 | ✅ 适合 |
| 给单个对象转换接口 | 一个类的接口不兼容 | ❌ 该用适配器 |
| 控制对象访问 | 加权限、延迟加载 | ❌ 该用代理 |
| 对象间通信解耦 | 多个对象互相调用 | ❌ 该用中介者 |

### 5.2 生活中的外观

- **银行柜员**:你不用知道银行内部有哪些系统(核心、风控、清算),柜员帮你处理
- **旅行社**:你不用分别订机票、酒店、门票,旅行社打包成「自由行套餐」
- **政务服务大厅**:「一件事一次办」,内部协调多个部门,你只交一次材料

### 5.3 Python 标准库里的外观

\`\`\`python
# 1. urllib.request.urlopen 是外观
#    内部协调了:DNS 解析、TCP 连接、TLS 握手、HTTP 协议、响应解析
from urllib.request import urlopen
resp = urlopen("https://example.com")   # 一行,背后几十步

# 2. subprocess.run 是外观
#    内部协调了 fork/exec、管道、信号、等待
import subprocess
result = subprocess.run(["ls", "-l"], capture_output=True, text=True)

# 3. pathlib 是外观
#    把 os.path / os.makedirs / open 等打包成面向对象的路径操作
from pathlib import Path
p = Path("a/b/c.txt")
p.parent.mkdir(parents=True, exist_ok=True)   # 等价于 os.makedirs(..., exist_ok=True)
p.write_text("hello")                         # 等价于 open + write + close

# 4. csv.DictReader 是外观
#    把文件打开、行分割、字段解析打包
import csv
with open("data.csv") as f:
    for row in csv.DictReader(f):
        print(row)   # row 已经是 dict
\`\`\`

\`pathlib\` 是最典型的外观:它把 \`os.path\`、\`os.makedirs\`、\`open\` 等散落的函数,统一成一个 \`Path\` 对象的接口,使用起来更直观。

## 六、实战:家庭影院 Facade

完整实现「一键看电影 / 一键关机」:

\`\`\`python
# ============ 1. 子系统类 ============
class TV:
    def on(self): print("📺 电视开机")
    def off(self): print("📺 电视关机")
    def set_source(self, src): print(f"📺 切换到 {src}")
    def set_volume(self, v): print(f"📺 音量 {v}")


class Amplifier:
    def on(self): print("🔊 功放开机")
    def off(self): print("🔊 功放关机")
    def set_surround_sound(self): print("🔊 环绕声模式")
    def set_volume(self, v): print(f"🔊 音量 {v}")


class Projector:
    def on(self): print("📽️ 投影仪开机")
    def off(self): print("📽️ 投影仪关机")
    def set_widescreen(self): print("📽️ 宽屏模式")
    def set_input(self, src): print(f"📽️ 输入源 {src}")


class Curtain:
    def up(self): print("🪟 窗帘升起")
    def down(self): print("🪟 窗帘放下")


class Light:
    def on(self): print("💡 灯亮起")
    def off(self): print("💡 灯关闭")
    def dim(self, level): print(f"💡 调暗到 {level}%")


class MediaPlayer:
    def on(self): print("🎬 播放器开机")
    def off(self): print("🎬 播放器关机")
    def play(self, movie): print(f"🎬 播放 {movie}")
    def stop(self): print("🎬 停止播放")


class AirConditioner:
    def on(self): print("❄️ 空调开机")
    def off(self): print("❄️ 空调关机")
    def set_temp(self, t): print(f"❄️ 温度 {t}°C")


# ============ 2. 外观类 ============
class HomeTheaterFacade:
    """家庭影院外观:把 7 个子系统的复杂调用打包成简单方法"""
    def __init__(self, tv, amp, projector, curtain, light, player, ac):
        self.tv = tv
        self.amp = amp
        self.projector = projector
        self.curtain = curtain
        self.light = light
        self.player = player
        self.ac = ac

    def watch_movie(self, movie: str) -> None:
        """一键看电影"""
        print(f"\n===== 开始观看 {movie} =====")
        self.ac.on()
        self.ac.set_temp(24)
        self.curtain.down()
        self.light.off()
        self.projector.on()
        self.projector.set_widescreen()
        self.projector.set_input("HDMI1")
        self.amp.on()
        self.amp.set_surround_sound()
        self.amp.set_volume(25)
        self.tv.on()
        self.tv.set_source("HDMI1")
        self.player.on()
        self.player.play(movie)

    def end_movie(self) -> None:
        """一键关机"""
        print("\n===== 结束观看 =====")
        self.player.stop()
        self.player.off()
        self.amp.off()
        self.projector.off()
        self.tv.off()
        self.light.on()
        self.curtain.up()
        self.ac.off()


# ============ 3. 客户端:只跟 Facade 打交道 ============
if __name__ == "__main__":
    # 组装子系统(可以注入不同的具体实现,比如测试用 Mock)
    facade = HomeTheaterFacade(
        tv=TV(),
        amp=Amplifier(),
        projector=Projector(),
        curtain=Curtain(),
        light=Light(),
        player=MediaPlayer(),
        ac=AirConditioner(),
    )

    # 客户端只调两个方法,完全不知道背后 7 个子系统的存在
    facade.watch_movie("星际穿越")
    facade.end_movie()

# 输出:
# ===== 开始观看 星际穿越 =====
# ❄️ 空调开机
# ❄️ 温度 24°C
# 🪟 窗帘放下
# 💡 灯关闭
# 📽️ 投影仪开机
# 📽️ 宽屏模式
# 📽️ 输入源 HDMI1
# 🔊 功放开机
# 🔊 环绕声模式
# 🔊 音量 25
# 📺 电视开机
# 📺 切换到 HDMI1
# 🎬 播放器开机
# 🎬 播放 星际穿越
#
# ===== 结束观看 =====
# 🎬 停止播放
# 🎬 播放器关机
# 🔊 功放关机
# 📽️ 投影仪关机
# 📺 电视关机
# 💡 灯亮起
# 🪟 窗帘升起
# ❄️ 空调关机
\`\`\`

**这个设计的价值**:
- 客户端只调 \`watch_movie\` / \`end_movie\`,完全不知道背后 7 个子系统
- 子系统之间没有直接依赖,都通过 Facade 协调
- 想换设备(比如换投影仪型号),只改 Facade 内部,客户端无感
- 想加新场景(比如「听音乐」),在 Facade 加方法即可

## 七、用 dataclass + 方法组合实现 Facade

Python 的 \`dataclass\` 让 Facade 写起来更简洁:

\`\`\`python
from dataclasses import dataclass


@dataclass
class UserService:
    """子系统:用户服务"""
    def get_user(self, uid): return {"id": uid, "name": "Alice"}


@dataclass
class OrderService:
    """子系统:订单服务"""
    def get_orders(self, uid): return [{"id": 1, "uid": uid}]


@dataclass
class PaymentService:
    """子系统:支付服务"""
    def get_payments(self, uid): return [{"id": 1, "amount": 99}]


@dataclass
class UserCenterFacade:
    """用户中心外观:聚合用户/订单/支付信息"""
    user_service: UserService
    order_service: OrderService
    payment_service: PaymentService

    def get_user_profile(self, uid: int) -> dict:
        """一键获取用户完整档案"""
        user = self.user_service.get_user(uid)
        orders = self.order_service.get_orders(uid)
        payments = self.payment_service.get_payments(uid)
        return {
            "user": user,
            "orders": orders,
            "payments": payments,
            "order_count": len(orders),
            "total_paid": sum(p["amount"] for p in payments),
        }


if __name__ == "__main__":
    facade = UserCenterFacade(
        user_service=UserService(),
        order_service=OrderService(),
        payment_service=PaymentService(),
    )
    print(facade.get_user_profile(1))
    # {'user': {'id': 1, 'name': 'Alice'}, 'orders': [{'id': 1, 'uid': 1}],
    #  'payments': [{'id': 1, 'amount': 99}], 'order_count': 1, 'total_paid': 99}
\`\`\`

这模拟了「API 网关聚合多个微服务」的场景——前端一次请求拿到所有需要的数据,不用分别调 3 个服务。

## 八、外观的层次结构

大型系统里,外观可以分层:

\`\`\`text
┌──────────────────────────────────────┐
│        Web API Controller (外观1)    │  ← 给前端用的外观
│  /api/user/profile  →  profile()    │
└──────────────┬───────────────────────┘
               ▼
┌──────────────────────────────────────┐
│      Application Service (外观2)     │  ← 给业务层用的外观
│        UserProfileService             │
└──┬───────────┬───────────┬───────────┘
   ▼           ▼           ▼
┌──────┐  ┌──────┐  ┌──────────┐
│UserRepo│ │OrderRepo│ │PaymentRepo│  ← 数据访问层(子系统)
└──────┘  └──────┘  └──────────┘
\`\`\`

每层都是一个外观,把下层的复杂度封装起来。这就是**分层架构**的本质——每层都是下层的 Facade。

## 九、外观 vs 适配器:微妙的区别

外观和适配器都是「包装 + 简化」,但:

\`\`\`python
# 适配器:1对1,转换接口,客户端原本想用 Target 接口
class PayPalAdapter(PaymentProcessor):     # 转换成 PaymentProcessor 接口
    def __init__(self, paypal: PayPalSDK): # 只包装 1 个对象
        self._paypal = paypal
    def pay(self, amount):                 # 把 charge() 转成 pay()
        return self._paypal.charge(amount)

# 外观:1对多,简化多个子系统的协作,客户端原本不知道怎么用这些子系统
class HomeTheaterFacade:                   # 不实现某个既定接口
    def __init__(self, tv, amp, projector, curtain, ...):  # 包装多个对象
        ...
    def watch_movie(self, movie):          # 提供新的简化方法
        # 协调多个子系统
        ...
\`\`\`

**核心区别**:
- 适配器是「**接口转换**」,1 对 1,有明确的目标接口
- 外观是「**复杂度收敛**」,1 对多,提供新的简化接口

## 十、外观模式的优缺点

### 优点

1. **简化客户端**:复杂操作变一行
2. **解耦**:客户端与子系统解耦,只依赖 Facade
3. **分层清晰**:Facade 是自然的分层边界
4. **不影响子系统**:子系统照常工作,Facade 是可选的额外层
5. **可渐进迁移**:用 Facade 包住老系统,逐步替换

### 缺点

1. **可能成为上帝对象**:Facade 啥都管,容易膨胀
2. **加层有成本**:简单场景过度设计
3. **不强制单入口**:子系统仍可直接被访问(Facade 不是必须的)
4. **改动蔓延**:子系统接口变化要改 Facade

## 十一、外观的实现细节

### 11.1 Facade 不应该包含业务逻辑

Facade 只做「协调」,业务逻辑应该在各子系统里。如果 Facade 里写满了 if/else 和计算,它就变成了「上帝对象」。

\`\`\`python
# ❌ 错误:Facade 里写业务逻辑
class BadFacade:
    def process(self, data):
        cleaned = self.clean(data)        # 业务逻辑不该在 Facade
        result = self.calculate(cleaned)  # 业务逻辑不该在 Facade
        return self.format(result)

# ✅ 正确:Facade 只协调,业务在子系统
class GoodFacade:
    def process(self, data):
        cleaned = self.cleaner.clean(data)
        result = self.calculator.calc(cleaned)
        return self.formatter.format(result)
\`\`\`

### 11.2 Facade 与子系统的依赖方向

Facade 依赖子系统,子系统**不**依赖 Facade。如果子系统反过来调用 Facade,就形成了循环依赖,架构会乱。

### 11.3 多个 Facade

一个子系统可以有多个 Facade,针对不同客户端提供不同视图:

\`\`\`python
class AdminFacade:        # 给管理员用,暴露所有功能
    def manage_users(self): ...
    def view_logs(self): ...

class UserFacade:         # 给普通用户用,只暴露基本功能
    def view_profile(self): ...
    def edit_profile(self): ...
\`\`\`

### 11.4 Facade 与依赖注入

Facade 的子系统应该通过构造函数注入,便于测试时替换为 Mock:

\`\`\`python
class HomeTheaterFacade:
    def __init__(self, tv, amp, projector, ...):
        self.tv = tv          # 注入,可替换为 MockTV
        ...

# 测试时
facade = HomeTheaterFacade(
    tv=MockTV(), amp=MockAmp(), ...   # 全用 Mock
)
facade.watch_movie("test")            # 验证协调顺序
\`\`\`

## 十二、真实框架中的外观

外观模式在主流框架里随处可见,识别它们能加深理解:

### 12.1 Django 的 ORM Manager

Django 的 \`Model.objects\` 是一个外观,把「数据库连接 + SQL 生成 + 结果映射」打包成简单的链式调用:

\`\`\`python
# 不用外观,你要手写:
# conn = psycopg2.connect(...)
# cursor = conn.cursor()
# cursor.execute("SELECT * FROM users WHERE age > %s", [18])
# rows = cursor.fetchall()
# users = [User(**row) for row in rows]

# 用 Django ORM 外观:
users = User.objects.filter(age__gt=18).order_by("-name")[:10]
# 一行搞定,背后协调了连接池、SQL 生成、参数绑定、结果映射
\`\`\`

\`Model.objects\`(Manager)就是外观,把数据库操作的复杂步骤收敛成简单的链式 API。

### 12.2 requests 库

\`requests.get()\` 是 Python 最经典的外观之一,把 urllib 的繁琐调用打包:

\`\`\`python
# 不用 requests,用标准库 urllib:
import urllib.request
import urllib.parse
req = urllib.request.Request("https://api.example.com", method="POST")
req.add_header("Content-Type", "application/json")
data = urllib.parse.urlencode({"key": "value"}).encode()
with urllib.request.urlopen(req, data=data) as resp:
    body = resp.read().decode()

# 用 requests 外观:
import requests
resp = requests.post("https://api.example.com", json={"key": "value"})
print(resp.json())   # 一行拿到解析后的 JSON
\`\`\`

\`requests\` 把「连接管理、Header 设置、编码、JSON 序列化、错误处理」全部打包,这就是外观的价值。

### 12.3 FastAPI 的应用实例

FastAPI 的 \`FastAPI()\` 实例是一个外观,聚合了路由、依赖注入、OpenAPI 文档生成、参数校验等子系统:

\`\`\`python
from fastapi import FastAPI

app = FastAPI()   # 外观:内部聚合了路由器、依赖注入容器、校验器、文档生成器

@app.get("/users/{uid}")
def get_user(uid: int):    # 参数校验、类型转换由外观协调的子系统自动完成
    return {"id": uid}

# 访问 /docs 自动生成 Swagger 文档,这也是外观协调的子系统之一
\`\`\`

### 12.4 pandas 的 read_csv

\`pandas.read_csv()\` 是一个函数级外观,把「打开文件、编码检测、分隔符解析、类型推断、缺失值处理、构建 DataFrame」打包成一个调用:

\`\`\`python
import pandas as pd
df = pd.read_csv("data.csv", encoding="utf-8", na_values=["NA", "null"])
# 一行,背后协调了 io、codecs、csv、numpy 等多个子系统
\`\`\`

这种「一个函数打包多个子系统」的函数级外观,在数据科学库(pandas、scikit-learn)里非常常见。

## 十三、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
|-------|---------|---------|------|
| Facade 写业务逻辑 | 在 Facade 里写算法 | Facade 只协调,逻辑在子系统 | 否则变上帝对象 |
| Facade 实现目标接口 | 实现某个既定接口 | Facade 提供新接口 | 那是适配器的特征 |
| 子系统依赖 Facade | 子系统反向调 Facade | 子系统不知道 Facade | 避免循环依赖 |
| Facade 包单个对象 | 只包装 1 个类 | 那是适配器/代理 | Facade 包装多个 |
| Facade 改变子系统 | 修改子系统代码 | 子系统不变,只加 Facade | Facade 是加层 |
| Facade 强制单入口 | 禁止直接访问子系统 | 子系统仍可直接访问 | Facade 是可选便利 |
| Facade 方法太多 | 几十个方法 | 按职责拆多个 Facade | 单一职责 |
| 不用依赖注入 | Facade 内部 new 子系统 | 构造函数注入 | 便于测试 |
| 把 Facade 当服务层 | Facade 里写事务/事务编排 | 那是 Application Service | 职责要分清 |
| 简单系统也套 Facade | 一个类的调用也包一层 | 直接调用即可 | 避免过度设计 |

## 十四、本章小结

外观模式的核心是**「给复杂子系统一个简单入口」**。它不改变子系统,只是加一层协调,让客户端不用关心子系统细节。

记住三个要点:
1. **Facade 包装多个子系统**,不是单个(单个是适配器/代理)
2. **Facade 只协调,不写业务逻辑**(否则变上帝对象)
3. **Facade 是可选便利**,子系统仍可直接访问

外观在工程里无处不在:API 网关、SDK 简化 API、分层架构的服务层、编译器的 build 命令。当你发现「调用一个功能要 new 5 个对象、调 10 个方法、按特定顺序」时,就该上外观模式了——把这 10 步打包成一个方法,客户端调一次就完事。`,
  },
  {
    id: "pyarch-dp-composite",
    icon: "🌳",
    title: "组合模式(Composite)",
    group: "设计模式 · 结构型",
    content: `# 组合模式(Composite)

## 一、组合定义

组合模式是一种**结构型设计模式**,它**将对象组合成树形结构以表示「部分-整体」的层次结构**。组合模式让客户端可以**统一地对待单个对象和组合对象**。

> 一句话定义:**树形结构里,叶子节点和容器节点用同一个接口,客户端不用区分。**

GoF 定义:组合模式「将对象组合成树形结构以表示『部分-整体』的层次结构。Composite 使得用户对单个对象和组合对象的使用具有一致性。」

\`\`\`text
              ┌──────────────────────┐
              │   Component (接口)    │
              │   operation()        │
              │   add(child)         │
              │   remove(child)      │
              │   get_children()     │
              └──────────┬───────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
  ┌────────────────┐           ┌──────────────────┐
  │   Leaf (叶子)   │           │  Composite (容器) │
  │  operation()   │           │  - children: []  │
  │  (无子节点)    │           │  add/remove/get  │
  │  add() 报错    │           │  operation() {   │
  │                │           │    for c in children:│
  │                │           │      c.operation()│
  └────────────────┘           │  }               │
                               └──────────────────┘
\`\`\`

## 二、直觉理解

### 2.1 文件系统

这是组合模式最经典的例子。文件系统里有「文件」和「文件夹」:
- 文件夹可以包含文件,也可以包含子文件夹
- 文件夹的「大小」是所有子项大小之和
- 你统计一个文件夹大小时,不用区分里面是文件还是子文件夹——递归往下算就行

\`\`\`text
📁 project
├── 📁 src
│   ├── 📄 main.py        (3 KB)
│   ├── 📄 utils.py       (2 KB)
│   └── 📁 tests
│       ├── 📄 test_a.py  (1 KB)
│       └── 📄 test_b.py  (1 KB)
├── 📄 README.md          (5 KB)
└── 📄 setup.py           (2 KB)

总大小 = 3+2+1+1+5+2 = 14 KB
\`\`\`

无论是文件还是文件夹,都能「算大小」,这就是组合模式——统一对待叶子(文件)和容器(文件夹)。

### 2.2 UI 组件树

前端 UI 是一棵树:
- \`<div>\` 可以包含 \`<span>\`、\`<button>\`,也可以包含其他 \`<div>\`
- 渲染时,每个节点都调 \`render()\`,容器节点的 \`render()\` 会递归调用子节点的 \`render()\`
- 你不用区分「叶子组件」和「容器组件」,统一调 \`render()\` 即可

\`\`\`text
<div>
  <h1>标题</h1>          ← 叶子
  <div>                   ← 容器
    <span>文字</span>     ← 叶子
    <button>按钮</button> ← 叶子
  </div>
</div>
\`\`\`

### 2.3 组织架构

公司里:
- 部门可以包含员工,也可以包含子部门
- 算「部门总人数」时,叶子(员工)算 1,容器(部门)算所有子项之和
- 算「部门总工资」同理,递归累加

### 2.4 菜单

菜单项可以是「可点击的链接」(叶子),也可以是「子菜单」(容器,展开后还有菜单项)。渲染菜单时统一调 \`render()\`。

**组合模式的本质**:**用同一个接口表示「个体」和「组合」,客户端用递归统一处理,不用 if 判断节点类型。**

## 三、为什么需要组合模式

### 3.1 不用组合模式的痛苦

假设你要算文件系统的大小,不用组合模式:

\`\`\`python
class File:
    def __init__(self, name, size):
        self.name = name
        self.size = size

class Directory:
    def __init__(self, name):
        self.name = name
        self.files = []        # 文件列表
        self.subdirs = []      # 子目录列表

def total_size(node):
    """计算大小:要 if 判断类型"""
    if isinstance(node, File):
        return node.size
    elif isinstance(node, Directory):
        total = 0
        for f in node.files:
            total += f.size
        for d in node.subdirs:
            total += total_size(d)    # 递归
        return total
\`\`\`

问题:
- \`total_size\` 里要 \`isinstance\` 判断类型,**违反开闭原则**(新增节点类型要改这里)
- \`Directory\` 里要分别维护 \`files\` 和 \`subdirs\` 两个列表,代码重复
- 如果再加「软链接」「压缩包」等节点类型,\`total_size\` 里 if 越来越多
- 客户端必须知道节点类型,无法统一处理

### 3.2 组合模式的解法

让 File 和 Directory 实现**同一个接口**,Directory 持有子节点列表(子节点可能是 File 也可能是 Directory):

\`\`\`python
class FileSystemNode:        # 统一接口
    def size(self): ...
    def list(self): ...

class File(FileSystemNode):  # 叶子
    def size(self): return self._size

class Directory(FileSystemNode):  # 容器
    def __init__(self):
        self._children = []        # 统一列表,不区分类型
    def size(self):
        return sum(c.size() for c in self._children)  # 递归
\`\`\`

现在客户端 \`node.size()\` 不用判断类型——叶子返回自己的大小,容器递归求和。

### 3.3 组合模式的核心价值

1. **统一接口**:叶子和容器同接口,客户端不区分
2. **递归处理**:容器自然地递归调用子节点
3. **开闭原则**:新增节点类型不用改客户端
4. **简化客户端**:不用 if/else 判断类型

## 四、组合模式的三种角色

| 角色 | 职责 | 例子 |
|------|------|------|
| **Component** | 抽象组件,定义统一接口 | FileSystemNode |
| **Leaf** | 叶子节点,无子节点 | File |
| **Composite** | 容器节点,持有子组件,递归处理 | Directory |

### 4.1 透明式 vs 安全式

关于 \`add/remove\` 这些「容器才有的方法」放哪里,有两种风格:

| 风格 | add/remove 放哪 | 优点 | 缺点 |
|------|----------------|------|------|
| **透明式** | 放在 Component 接口里 | 客户端完全不用区分类型 | Leaf 也要实现(通常报错) |
| **安全式** | 只放在 Composite 里 | Leaf 不会有 add 方法 | 客户端可能要类型判断 |

\`\`\`python
# 透明式:Component 声明 add,Leaf 报错
class Component:
    def operation(self): ...
    def add(self, child): ...
    def remove(self, child): ...

class Leaf(Component):
    def operation(self): ...
    def add(self, child): raise NotImplementedError("叶子不能 add")

# 安全式:add 只在 Composite 里
class Component:
    def operation(self): ...

class Composite(Component):
    def add(self, child): ...
    def remove(self, child): ...
\`\`\`

GoF 原书用透明式,Python 里两种都常见。**推荐安全式**——避免在 Leaf 里写无意义的方法。

## 五、实战:文件系统

完整实现 File + Directory,统一 \`size()\` / \`list()\` 接口:

\`\`\`python
from abc import ABC, abstractmethod
from typing import List


# ============ 1. 抽象组件 ============
class FileSystemNode(ABC):
    """文件系统节点统一接口(Component)"""
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def size(self) -> int:
        """返回节点大小(KB)"""
        ...

    @abstractmethod
    def list(self, indent: int = 0) -> str:
        """返回节点的树形展示"""
        ...


# ============ 2. 叶子:文件 ============
class File(FileSystemNode):
    """文件(Leaf),没有子节点"""
    def __init__(self, name: str, size: int):
        super().__init__(name)
        self._size = size

    def size(self) -> int:
        return self._size              # 文件直接返回自己的大小

    def list(self, indent: int = 0) -> str:
        return "  " * indent + f"📄 {self.name} ({self._size}KB)"


# ============ 3. 容器:目录 ============
class Directory(FileSystemNode):
    """目录(Composite),可以包含 File 和 Directory"""
    def __init__(self, name: str):
        super().__init__(name)
        self._children: List[FileSystemNode] = []   # 统一列表,不区分类型

    def add(self, child: FileSystemNode) -> "Directory":
        self._children.append(child)
        return self                      # 链式调用

    def remove(self, child: FileSystemNode) -> None:
        self._children.remove(child)

    def size(self) -> int:
        # 关键:递归求和,不管子节点是 File 还是 Directory
        return sum(child.size() for child in self._children)

    def list(self, indent: int = 0) -> str:
        lines = ["  " * indent + f"📁 {self.name}/"]
        for child in self._children:
            lines.append(child.list(indent + 1))   # 递归,缩进+1
        return "\\n".join(lines)


# ============ 4. 客户端:统一对待 File 和 Directory ============
if __name__ == "__main__":
    # 构建树
    root = Directory("project")
    src = Directory("src").add(
        File("main.py", 3)
    ).add(
        File("utils.py", 2)
    ).add(
        Directory("tests").add(
            File("test_a.py", 1)
        ).add(
            File("test_b.py", 1)
        )
    )
    root.add(src)
    root.add(File("README.md", 5))
    root.add(File("setup.py", 2))

    # 统一调用,不用区分类型
    print(root.list())
    print(f"\\n总大小: {root.size()} KB")

# 输出:
# 📁 project/
#   📁 src/
#     📄 main.py (3KB)
#     📄 utils.py (2KB)
#     📁 tests/
#       📄 test_a.py (1KB)
#       📄 test_b.py (1KB)
#   📄 README.md (5KB)
#   📄 setup.py (2KB)
#
# 总大小: 14 KB
\`\`\`

**这个设计的精妙之处**:
- \`Directory.size()\` 里 \`sum(child.size() for child in self._children)\` —— 完全不用判断 child 是 File 还是 Directory,递归自然处理
- \`Directory.list()\` 里递归调用 \`child.list(indent+1)\` —— 叶子和容器都用同一个方法
- 客户端调 \`root.size()\` 和 \`root.list()\`,完全不知道树内部结构
- 想加「软链接」类型?实现 \`FileSystemNode\` 即可,客户端零改动

## 六、组合模式与递归

组合模式天生与递归相伴。理解组合模式,关键是理解**「递归是容器节点的自然行为」**:

\`\`\`text
Directory.size() 调用:
  ├── File1.size()        → 3       (叶子,直接返回)
  ├── File2.size()        → 2       (叶子,直接返回)
  └── SubDir.size() 调用:           (容器,递归)
        ├── File3.size()  → 1
        └── File4.size()  → 1
        返回 1+1 = 2
  返回 3+2+2 = 7
\`\`\`

**递归的两个基准**:
- **叶子节点**:直接返回值(终止递归)
- **容器节点**:递归调用所有子节点(继续递归)

只要叶子能终止,递归就能正常工作。组合模式的优雅就在于:这个递归逻辑写在容器里,客户端完全不用写递归。

\`\`\`python
# 客户端:一行搞定,不管树有多深
total = root.size()

# 对比:不用组合模式,客户端要自己写递归
def total_size(node):
    if isinstance(node, File):
        return node.size
    elif isinstance(node, Directory):
        return sum(total_size(c) for c in node.children)
    elif isinstance(node, Symlink):    # 新增类型要改这里
        return total_size(node.target)
    # ... 每加一个类型就要改这个函数
\`\`\`

## 七、组合模式与树形数据

任何「树形数据」都适合用组合模式。判断标准:
1. 数据是**树形结构**(有父子关系)
2. **叶子和容器有共同的操作**(算大小、渲染、统计)
3. 客户端想**统一处理**(不想写 if 判断类型)

### 7.1 UI 组件树

\`\`\`python
from abc import ABC, abstractmethod
from typing import List


class UIComponent(ABC):
    """UI 组件统一接口"""
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def render(self, indent: int = 0) -> str:
        ...


class Leaf(UIComponent):
    """叶子组件:文本、按钮、图片等"""
    def render(self, indent: int = 0) -> str:
        return "  " * indent + f"<{self.name} />"


class Container(UIComponent):
    """容器组件:div、section、form 等"""
    def __init__(self, name: str):
        super().__init__(name)
        self._children: List[UIComponent] = []

    def add(self, child: UIComponent) -> "Container":
        self._children.append(child)
        return self

    def render(self, indent: int = 0) -> str:
        lines = ["  " * indent + f"<{self.name}>"]
        for child in self._children:
            lines.append(child.render(indent + 1))   # 递归渲染子组件
        lines.append("  " * indent + f"</{self.name}>")
        return "\\n".join(lines)


if __name__ == "__main__":
    page = Container("div").add(
        Leaf("h1")
    ).add(
        Container("div").add(
            Leaf("span")
        ).add(
            Leaf("button")
        )
    )
    print(page.render())

# 输出:
# <div>
#   <h1 />
#   <div>
#     <span />
#     <button />
#   </div>
# </div>
\`\`\`

这就是 React/Vue 组件树的简化模型——每个组件都能 \`render()\`,容器递归渲染子组件。

### 7.2 组织架构

\`\`\`python
class Employee:
    """员工(叶子)"""
    def __init__(self, name: str, salary: float):
        self.name = name
        self.salary = salary

    def count(self) -> int:
        return 1

    def total_salary(self) -> float:
        return self.salary

    def list(self, indent: int = 0) -> str:
        return "  " * indent + f"👤 {self.name} ({self.salary})"


class Department:
    """部门(容器)"""
    def __init__(self, name: str):
        self.name = name
        self._members = []        # 可以是 Employee 或 Department

    def add(self, member):
        self._members.append(member)
        return self

    def count(self) -> int:
        return sum(m.count() for m in self._members)        # 递归数人数

    def total_salary(self) -> float:
        return sum(m.total_salary() for m in self._members)  # 递归算工资

    def list(self, indent: int = 0) -> str:
        lines = ["  " * indent + f"🏢 {self.name}"]
        for m in self._members:
            lines.append(m.list(indent + 1))
        return "\\n".join(lines)


if __name__ == "__main__":
    company = Department("总公司")
    tech = Department("技术部").add(
        Employee("张三", 20000)
    ).add(
        Employee("李四", 25000)
    ).add(
        Department("前端组").add(
            Employee("王五", 18000)
        ).add(
            Employee("赵六", 22000)
        )
    )
    company.add(tech)
    company.add(Employee("CEO", 100000))

    print(company.list())
    print(f"总人数: {company.count()}, 总工资: {company.total_salary()}")
\`\`\`

\`count()\` 和 \`total_salary()\` 统一接口,员工返回自己的值,部门递归求和。

## 八、组合模式与访问者模式

组合模式常与访问者模式搭配——当你需要对树做「不同维度的统计」(算大小、算文件数、找特定文件),访问者模式让你不用每次都改 Component 类。

\`\`\`python
# 简化示意:访问者遍历组合树
class Visitor:
    def visit_file(self, file): ...
    def visit_directory(self, dir): ...

class File:
    def accept(self, visitor):
        visitor.visit_file(self)      # 双分派

class Directory:
    def accept(self, visitor):
        visitor.visit_directory(self)
        for c in self._children:
            c.accept(visitor)          # 递归 accept
\`\`\`

这样,新增「统计文件数」的访问者不用改 File/Directory,符合开闭原则。

## 九、组合模式的优缺点

### 优点

1. **统一接口**:叶子和容器同接口,客户端不区分
2. **开闭原则**:新增节点类型不改客户端
3. **递归自然**:容器天然递归处理子节点
4. **简化客户端**:不用 if 判断类型
5. **灵活组合**:可任意构建树形结构

### 缺点

1. **设计过度**:叶子和容器差异很大时,强行统一接口会别扭
2. **类型安全**:透明式下 Leaf 要实现 add(报错),不够安全
3. **难限制类型**:Component 接口很难在编译期限制子节点类型
4. **递归深度**:树太深可能栈溢出(改用迭代)

## 十、实现细节与陷阱

### 10.1 父节点引用

有时子节点需要访问父节点(比如删除自己)。可以在 \`add\` 时设置父引用:

\`\`\`python
class Directory(FileSystemNode):
    def __init__(self, name):
        super().__init__(name)
        self._children = []
        self._parent = None          # 父节点引用

    def add(self, child):
        self._children.append(child)
        if isinstance(child, Directory):
            child._parent = self     # 设置父引用
        return self
\`\`\`

注意:父引用会引入双向依赖,管理时要小心(删除时要清理)。

### 10.2 缓存计算结果

\`size()\` 每次都递归求和,树大时慢。可以缓存:

\`\`\`python
class Directory(FileSystemNode):
    def __init__(self, name):
        super().__init__(name)
        self._children = []
        self._size_cache = None      # 缓存

    def add(self, child):
        self._children.append(child)
        self._size_cache = None      # 失效缓存
        return self

    def size(self) -> int:
        if self._size_cache is None:
            self._size_cache = sum(c.size() for c in self._children)
        return self._size_cache
\`\`\`

这是「缓存/失效」模式——修改时失效,查询时重算。

### 10.3 透明式 add 的实现

如果用透明式,Leaf 的 \`add\` 通常抛异常:

\`\`\`python
class File(FileSystemNode):
    def add(self, child):
        raise TypeError("文件不能添加子节点")
    def remove(self, child):
        raise TypeError("文件不能移除子节点")
\`\`\`

这样客户端如果误调,会立即报错而不是静默失败。

### 10.4 不要在 Component 里放 children 列表

\`\`\`python
# ❌ 错误:Component 里放 children
class FileSystemNode:
    def __init__(self):
        self.children = []      # 叶子也有 children?不合理

# ✅ 正确:children 只在 Composite 里
class Directory(FileSystemNode):
    def __init__(self):
        self._children = []     # 只有容器有
\`\`\`

## 十一、组合模式与其他模式的关系

- **组合 + 访问者**:对树做多种统计操作,访问者避免改 Component
- **组合 + 迭代器**:给组合结构实现迭代器,统一遍历
- **组合 + 装饰器**:装饰器可以装饰组合里的节点(给 File 加压缩装饰)
- **组合 + 责任链**:树形结构里传递请求(如 DOM 事件冒泡)

## 十二、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
|-------|---------|---------|------|
| Leaf 有 children | Component 里放 children 列表 | children 只在 Composite | 叶子不该有子节点 |
| 透明式不报错 | Leaf.add 静默忽略 | 抛 TypeError | 让错误尽早暴露 |
| 不递归 | 容器只算直接子节点 | 递归调用子节点 | 否则深层节点漏算 |
| 缓存不失效 | add 后不重置缓存 | 修改时失效缓存 | 否则结果过期 |
| 客户端判断类型 | if isinstance(node, Directory) | 统一调接口 | 组合模式的核心是统一 |
| 树太深递归 | 深度 1000+ 还用递归 | 改用迭代+栈 | 防止栈溢出 |
| 强行统一不相关接口 | 叶子和容器差异大还硬统一 | 拆分接口 | 避免设计过度 |
| 父引用不清理 | 删子节点不清理父引用 | 删除时置 _parent = None | 避免内存泄漏 |
| 忘记链式返回 | add 不返回 self | return self | 便于链式构建 |
| 容器方法放 Component | 安全式却把 add 放 Component | 安全式 add 只在 Composite | 区分两种风格 |

## 十三、本章小结

组合模式的核心是**「树形结构里,叶子和容器用同一接口,客户端统一处理」**。它把「个体」和「整体」抽象成同一种东西,让递归处理变得自然。

记住三个要点:
1. **Component 定义统一接口**,Leaf 和 Composite 都实现它
2. **Composite 持有子组件列表**,递归委派操作
3. **客户端不区分类型**,统一调接口方法

组合模式在工程里无处不在:文件系统、UI 组件树、组织架构、菜单、AST(抽象语法树)、JSON/YAML 数据结构。当你遇到「树形数据 + 叶子和容器有共同操作」时,组合模式几乎是唯一的选择——它让递归逻辑收敛到容器里,客户端代码变得异常简洁。`,
  },
  {
    id: "pyarch-dp-proxy",
    icon: "🛡️",
    title: "代理模式(Proxy)",
    group: "设计模式 · 结构型",
    content: `# 代理模式(Proxy)

## 一、代理定义

代理模式是一种**结构型设计模式**,它**为其他对象提供一种代理以控制对这个对象的访问**。代理对象与被代理对象实现相同的接口,客户端通过代理间接访问真实对象。

> 一句话定义:**同样的接口,中间加一层,控制对真实对象的访问。**

GoF 定义:代理模式「为其他对象提供一种代理以控制对这个对象的访问。」

\`\`\`text
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client     │ ──────► │   Proxy      │ ──────► │  RealSubject │
│  (调用方)    │ 同接口  │  (代理,持有  │ 委托    │  (真实对象)  │
│              │         │   RealSubject)│        │              │
└──────────────┘         └──────────────┘         └──────────────┘
                              │
                              │ 控制访问:延迟加载/权限/缓存/日志
                              ▼
                         (额外逻辑)
\`\`\`

**关键**:代理与真实对象**实现相同接口**,客户端分不清自己用的是代理还是真实对象。

## 二、直觉理解

### 2.1 明星经纪人

你想请明星拍广告,不能直接联系明星本人,要先联系经纪人。经纪人帮你:
- **筛选客户**(权限控制:小广告不接)
- **安排档期**(延迟:明星没空就排队)
- **谈价格**(额外逻辑:加价)
- **记录每次合作**(日志)

经纪人就是明星的「代理」。你(客户端)只跟经纪人打交道,但最终干活的还是明星。经纪人和明星对外提供「商演」这个相同的服务(同接口)。

### 2.2 信用卡

你买东西,可以直接付现金(直接访问真实对象),也可以刷信用卡(通过代理)。信用卡和现金都能「支付」(同接口),但信用卡额外提供了:账单记录(日志)、积分(额外功能)、额度控制(权限)、延期还款(延迟)。

### 2.3 缓存代理

你访问一个慢速数据库,加一层缓存代理:第一次查询时,代理去查数据库并缓存;后续相同查询,代理直接返回缓存,不碰数据库。代理与数据库接口相同(都有 \`get(key)\`),但行为更高效。

### 2.4 远程代理(RPC)

你调一个远程服务的方法,本地没有真实对象,只有一个「远程代理」。代理把你的方法调用序列化成网络请求,发给远程服务器,再把结果反序列化返回。你以为在调本地对象,其实在调远程——这就是 RPC 的本质。

**代理的本质**:**同接口 + 中间层 + 控制访问**。客户端透明地使用代理,代理在中间加各种控制逻辑。

## 三、代理的种类

按用途,代理分为四类:

| 代理种类 | 别名 | 作用 | 典型例子 |
|---------|------|------|---------|
| **虚拟代理** | Virtual Proxy | 延迟加载,用到才创建真实对象 | 大图片懒加载、ORM 延迟加载关联对象 |
| **远程代理** | Remote Proxy | 代表远程对象,处理网络通信 | RPC stub、gRPC client |
| **保护代理** | Protection Proxy | 权限控制,校验访问权限 | 管理员才能调的方法 |
| **智能引用** | Smart Reference | 加额外逻辑(计数、缓存、日志) | 引用计数、缓存代理、日志代理 |

还有衍生:
- **缓存代理**(Cache Proxy):缓存方法结果
- **防火墙代理**(Firewall Proxy):过滤恶意请求
- **写时复制代理**(Copy-on-Write):修改时才复制

## 四、代理 vs 装饰器 vs 适配器

这三个模式都是「包装」,区分的关键是**意图**:

| 维度 | 代理 Proxy | 装饰器 Decorator | 适配器 Adapter |
|------|-----------|-----------------|---------------|
| **意图** | 控制对对象的访问 | 动态加职责 | 转换不兼容接口 |
| **接口** | 与被代理对象**相同** | 与被装饰对象**相同** | 转换成**不同**接口 |
| **生命周期** | 代理常在客户端之前就存在 | 装饰器运行时层层叠加 | 适配器适配已有对象 |
| **关注点** | 访问控制(谁、何时、如何) | 功能增强(加什么) | 接口兼容(怎么转) |
| **客户端感知** | 不感知(以为是真实对象) | 不感知(接口没变) | 不感知(以为是目标接口) |
| **典型例子** | 明星经纪人 | 给咖啡加牛奶 | USB 转串口 |

**一句话区分**:
- **代理**:**同接口**,控制访问(延迟、权限、缓存、远程)
- **装饰器**:**同接口**,加功能(日志、计时、重试)
- **适配器**:**不同接口**,做转换(A 接口 → B 接口)

**微妙区别**:代理和装饰器结构几乎一样(都是包装 + 委托),区别在意图——代理侧重「控制访问」,装饰器侧重「增强功能」。代理往往在「客户端不关心真实对象」时使用,装饰器在「客户端主动叠加功能」时使用。

## 五、应用场景

| 场景 | 代理种类 | 例子 | 是否适合 |
|-----|---------|------|---------|
| 大对象延迟加载 | 虚拟代理 | 图片懒加载、ORM 关联对象 | ✅ 非常适合 |
| 远程方法调用 | 远程代理 | RPC、gRPC、REST client | ✅ 经典场景 |
| 权限控制 | 保护代理 | 管理员才能删除 | ✅ 适合 |
| 方法结果缓存 | 缓存代理 | @lru_cache 的对象版 | ✅ 适合 |
| 访问日志 | 智能引用 | 记录每次方法调用 | ✅ 适合 |
| 引用计数 | 智能引用 | 没人引用时释放资源 | ✅ 适合 |
| 给对象加新功能 | - | 加日志/重试 | ❌ 该用装饰器 |
| 转换接口 | - | A 接口转 B 接口 | ❌ 该用适配器 |
| 简化子系统 | - | 多个对象打包 | ❌ 该用外观 |

## 六、Python 实战

### 6.1 静态代理(显式 Proxy 类)

最直白的写法:手写一个 Proxy 类,实现与真实对象相同的接口,内部持有真实对象:

\`\`\`python
from abc import ABC, abstractmethod


class Image(ABC):
    """图片接口(Subject)"""
    @abstractmethod
    def display(self) -> None:
        ...


class RealImage(Image):
    """真实图片(RealSubject),加载很慢"""
    def __init__(self, filename: str):
        self._filename = filename
        self._load_from_disk()      # 构造时就读盘,慢

    def _load_from_disk(self) -> None:
        print(f"📂 从磁盘加载 {self._filename}...(耗时操作)")

    def display(self) -> None:
        print(f"🖼️ 显示图片 {self._filename}")


class ProxyImage(Image):
    """图片代理(Proxy):延迟加载,用到才读盘"""
    def __init__(self, filename: str):
        self._filename = filename
        self._real_image: RealImage | None = None    # 一开始不加载

    def display(self) -> None:
        # 第一次 display 时才创建 RealImage(延迟加载)
        if self._real_image is None:
            self._real_image = RealImage(self._filename)
        self._real_image.display()


if __name__ == "__main__":
    # 加载代理,不读盘(快)
    print("=== 创建代理 ===")
    image = ProxyImage("photo.jpg")
    print("代理创建完成,还没读盘")

    # 第一次 display,才读盘
    print("\\n=== 第一次 display ===")
    image.display()

    # 第二次 display,不重复读盘
    print("\\n=== 第二次 display ===")
    image.display()

# 输出:
# === 创建代理 ===
# 代理创建完成,还没读盘
#
# === 第一次 display ===
# 📂 从磁盘加载 photo.jpg...(耗时操作)
# 🖼️ 显示图片 photo.jpg
#
# === 第二次 display ===
# 🖼️ 显示图片 photo.jpg
\`\`\`

**关键点**:
- \`ProxyImage\` 与 \`RealImage\` 都实现 \`Image\` 接口,客户端分不清
- 代理在构造时不加载图片,只在 \`display()\` 第一次调用时才创建真实对象(虚拟代理)
- 后续调用复用已创建的真实对象

### 6.2 用 __getattr__ 实现动态代理

静态代理的缺点:真实对象有 N 个方法,代理要手写 N 个转发方法。用 \`__getattr__\` 自动转发:

\`\`\`python
class RealService:
    """真实服务,有很多方法"""
    def query(self, sql): return f"查询 {sql}"
    def update(self, sql): return f"更新 {sql}"
    def delete(self, sql): return f"删除 {sql}"


class LoggingProxy:
    """日志代理:自动转发所有方法,并记录调用日志"""
    def __init__(self, real: RealService):
        # 注意:用 object.__setattr__ 避免触发 __setattr__ 的递归
        object.__setattr__(self, "_real", real)

    def __getattr__(self, name: str):
        """访问任何属性/方法时,转发给真实对象"""
        attr = getattr(self._real, name)
        if callable(attr):
            # 如果是方法,包一层日志
            def wrapper(*args, **kwargs):
                print(f"[LOG] 调用 {name}({args}, {kwargs})")
                result = attr(*args, **kwargs)
                print(f"[LOG] {name} 返回 {result!r}")
                return result
            return wrapper
        return attr       # 非方法属性,直接返回


if __name__ == "__main__":
    proxy = LoggingProxy(RealService())
    print(proxy.query("SELECT * FROM users"))
    print(proxy.update("UPDATE users SET name='x'"))

# 输出:
# [LOG] 调用 query(('SELECT * FROM users',), {})
# [LOG] query 返回 '查询 SELECT * FROM users'
# 查询 SELECT * FROM users
# [LOG] 调用 update(('UPDATE users SET name=\\'x\\'',), {})
# [LOG] update 返回 '更新 UPDATE users SET name=\\'x\\''
# 更新 UPDATE users SET name='x'
\`\`\`

**\`__getattr__\` 代理的陷阱**:
- \`__getattr__\` 只在正常查找失败时触发,所以 \`_real\` 不会被转发
- 构造函数里赋值 \`self._real = real\` 可能触发 \`__setattr__\`,所以用 \`object.__setattr__\` 绕过
- 不能代理魔术方法(\`__len__\`、\`__iter__\` 等),因为魔术方法走的是 \`type.__getattribute__\`,不触发 \`__getattr__\`。要代理魔术方法,得在 Proxy 类里显式定义

### 6.3 用描述符/property 实现属性代理

Python 的 \`property\` 内置就是代理思想的体现——它代理对属性的访问,在中间加控制:

\`\`\`python
class Temperature:
    """温度类,用 property 代理 _celsius 的访问"""
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def celsius(self) -> float:
        """读代理:读取时加日志"""
        print(f"[LOG] 读取 celsius = {self._celsius}")
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        """写代理:写入时做校验"""
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度")
        print(f"[LOG] 设置 celsius = {value}")
        self._celsius = value


if __name__ == "__main__":
    t = Temperature(25)
    print(t.celsius)        # 读代理触发
    t.celsius = 30          # 写代理触发
    # t.celsius = -300      # ValueError
\`\`\`

\`property\` 就是属性的「保护代理」——读取时可以加日志/缓存,写入时可以加校验/权限。这是 Python 内置的代理机制。

## 七、实战:三种代理

### 7.1 延迟加载代理(虚拟代理)

模拟 ORM 的关联对象延迟加载:

\`\`\`python
class Database:
    """模拟数据库,查询很慢"""
    @staticmethod
    def query_user(uid: int) -> dict:
        print(f"  [DB] 查询用户 {uid}...(耗时)")
        return {"id": uid, "name": "Alice", "age": 30}


class UserProxy:
    """用户代理:用到 user 数据时才查库"""
    def __init__(self, uid: int):
        self._uid = uid
        self._data: dict | None = None     # 延迟加载标志

    def _ensure_loaded(self) -> None:
        if self._data is None:
            self._data = Database.query_user(self._uid)

    def __getattr__(self, name: str):
        # 访问任何属性时,先确保已加载,再转发
        self._ensure_loaded()
        return self._data[name]


class Order:
    """订单,关联一个用户(用代理延迟加载)"""
    def __init__(self, order_id: int, user_id: int):
        self.order_id = order_id
        self.user = UserProxy(user_id)      # 不立即查库


if __name__ == "__main__":
    order = Order(1, 100)
    print("订单创建完成,用户数据还没查")
    print(f"订单 ID: {order.order_id}")     # 不触发查库

    print("\\n=== 访问用户数据 ===")
    print(f"用户名: {order.user.name}")      # 触发查库

# 输出:
# 订单创建完成,用户数据还没查
# 订单 ID: 1
#
# === 访问用户数据 ===
#   [DB] 查询用户 100...(耗时)
# 用户名: Alice
\`\`\`

这是 Django/SQLAlchemy ORM 的 \`lazy="select"\` 策略——关联对象用代理包装,访问时才查库,避免不必要的查询。

### 7.2 权限代理(保护代理)

控制谁能调用哪些方法:

\`\`\`python
from abc import ABC, abstractmethod


class AdminService(ABC):
    """管理员服务接口"""
    @abstractmethod
    def delete_user(self, uid: int) -> str: ...
    @abstractmethod
    def view_logs(self) -> str: ...
    @abstractmethod
    def get_user(self, uid: int) -> str: ...


class RealAdminService(AdminService):
    """真实服务"""
    def delete_user(self, uid: int) -> str:
        return f"删除了用户 {uid}"

    def view_logs(self) -> str:
        return "日志: ..."

    def get_user(self, uid: int) -> str:
        return f"用户 {uid} 信息"


class Permission:
    """权限枚举"""
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class PermissionProxy(AdminService):
    """权限代理:根据角色控制方法访问"""
    # 权限矩阵:方法 → 允许的角色
    PERMISSIONS = {
        "delete_user": {Permission.ADMIN},
        "view_logs": {Permission.ADMIN},
        "get_user": {Permission.ADMIN, Permission.USER},
    }

    def __init__(self, real: RealAdminService, role: str):
        self._real = real
        self._role = role

    def _check(self, method: str) -> None:
        allowed = self.PERMISSIONS.get(method, set())
        if self._role not in allowed:
            raise PermissionError(f"角色 {self._role} 无权调用 {method}")

    def delete_user(self, uid: int) -> str:
        self._check("delete_user")
        return self._real.delete_user(uid)

    def view_logs(self) -> str:
        self._check("view_logs")
        return self._real.view_logs()

    def get_user(self, uid: int) -> str:
        self._check("get_user")
        return self._real.get_user(uid)


if __name__ == "__main__":
    real = RealAdminService()

    # 管理员:全部能调
    admin_proxy = PermissionProxy(real, Permission.ADMIN)
    print(admin_proxy.get_user(1))        # 用户 1 信息
    print(admin_proxy.delete_user(1))     # 删除了用户 1

    # 普通用户:只能 get_user
    user_proxy = PermissionProxy(real, Permission.USER)
    print(user_proxy.get_user(1))         # 用户 1 信息
    try:
        user_proxy.delete_user(1)         # PermissionError
    except PermissionError as e:
        print(e)                          # 角色 user 无权调用 delete_user
\`\`\`

### 7.3 Python 的 property 内置代理思想

回顾 \`property\` 的本质——它是属性的代理:

\`\`\`python
# property 等价于这样的代理
class PropertyLike:
    """模拟 property 的代理思想"""
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("不可读")
        return self.fget(obj)           # 代理读操作

    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("不可写")
        self.fset(obj, value)           # 代理写操作

    def setter(self, fset):
        return PropertyLike(self.fget, fset, self.fdel)


class MyClass:
    def __init__(self):
        self._x = 0

    @PropertyLike
    def x(self):
        return self._x

    @x.setter
    def x(self, value):
        if value < 0:
            raise ValueError("x 不能为负")
        self._x = value


obj = MyClass()
print(obj.x)        # 0
obj.x = 5
print(obj.x)        # 5
# obj.x = -1        # ValueError
\`\`\`

\`property\` 是**描述符协议**的应用,描述符本质上就是「属性代理」——拦截对属性的访问,在中间加控制。Python 的 \`classmethod\`、\`staticmethod\`、\`super\` 都基于描述符,都是代理思想的体现。

## 八、远程代理与 RPC

远程代理是代理模式的重要应用。客户端调本地代理的方法,代理把请求序列化发给远程服务器:

\`\`\`python
import json
import socket


class RemoteCalculatorProxy:
    """远程计算器代理:把方法调用转发给远程服务器"""
    def __init__(self, host: str, port: int):
        self._host = host
        self._port = port

    def _call_remote(self, method: str, *args) -> object:
        """把方法调用序列化,发给远程,接收结果"""
        request = json.dumps({"method": method, "args": list(args)})
        with socket.socket() as s:
            s.connect((self._host, self._port))
            s.sendall(request.encode())
            response = s.recv(4096).decode()
        return json.loads(response)["result"]

    def add(self, a, b):
        return self._call_remote("add", a, b)      # 看起来像本地调用

    def multiply(self, a, b):
        return self._call_remote("multiply", a, b)


# 客户端用法:跟本地对象一模一样
calc = RemoteCalculatorProxy("127.0.0.1", 5000)
print(calc.add(1, 2))            # 3(实际走了网络)
print(calc.multiply(3, 4))       # 12
\`\`\`

这就是 RPC(Remote Procedure Call)的本质——**让远程调用看起来像本地调用**。gRPC、Thrift、XML-RPC 都是这个原理。

## 九、缓存代理

缓存代理缓存方法结果,相同参数不重复计算:

\`\`\`python
import functools
import time


class CachedProxy:
    """缓存代理:缓存方法结果"""
    def __init__(self, real):
        object.__setattr__(self, "_real", real)
        object.__setattr__(self, "_cache", {})

    def __getattr__(self, name: str):
        attr = getattr(self._real, name)
        if not callable(attr):
            return attr

        @functools.wraps(attr)
        def wrapper(*args, **kwargs):
            key = (name, args, tuple(sorted(kwargs.items())))
            if key not in self._cache:
                self._cache[key] = attr(*args, **kwargs)
            return self._cache[key]

        return wrapper


class SlowCalculator:
    """慢速计算器"""
    def fibonacci(self, n: int) -> int:
        time.sleep(0.5)      # 模拟慢
        if n < 2:
            return n
        return self.fibonacci(n-1) + self.fibonacci(n-2)   # 注意:这里调的是 self 的方法,不会被代理

    def square(self, x: int) -> int:
        time.sleep(0.3)
        return x * x


if __name__ == "__main__":
    proxy = CachedProxy(SlowCalculator())

    start = time.time()
    print(proxy.square(5))      # 慢(0.3s)
    print(f"第一次: {time.time()-start:.2f}s")

    start = time.time()
    print(proxy.square(5))      # 快(命中缓存)
    print(f"第二次: {time.time()-start:.2f}s")
\`\`\`

注意:这个简化版有局限——\`SlowCalculator\` 内部调 \`self.fibonacci\` 时走的是真实对象的方法,不会被代理拦截。完整方案要让真实对象也通过代理调自己(或用方法级缓存装饰器)。

## 十、智能引用代理

智能引用代理在访问对象时加额外逻辑,最典型的是「引用计数」:

\`\`\`python
class ReferenceCountingProxy:
    """引用计数代理:记录对象被访问次数,没人用时释放"""
    def __init__(self, real):
        object.__setattr__(self, "_real", real)
        object.__setattr__(self, "_ref_count", 0)

    def __getattr__(self, name):
        self._ref_count += 1
        print(f"[REF] 引用计数 +1,当前 {self._ref_count}")
        return getattr(self._real, name)

    def release(self):
        self._ref_count -= 1
        print(f"[REF] 引用计数 -1,当前 {self._ref_count}")
        if self._ref_count <= 0:
            print("[REF] 释放资源")
            # 释放真实对象的资源...
\`\`\`

这模拟了 C++ 智能指针的思想。Python 有 GC 自动管理内存,所以这种代理主要用于「连接池」「文件句柄」等需要显式释放的资源。

## 十一、代理模式的实现细节

### 11.1 代理必须与真实对象同接口

这是代理与适配器的根本区别。代理实现与 RealSubject 相同的接口,客户端才能透明使用:

\`\`\`python
from abc import abstractmethod
from abc import ABC
# ✅ 正确:Proxy 与 Real 都实现 Image
class Image(ABC):
    @abstractmethod
    def display(self): ...

class RealImage(Image):
    def display(self): ...

class ProxyImage(Image):        # 实现同一接口
    def display(self): ...

# ❌ 错误:Proxy 暴露了不同的接口
class BadProxy:
    def display_image(self):    # 方法名都不一样,客户端怎么透明用?
        ...
\`\`\`

### 11.2 代理何时创建真实对象

- **虚拟代理**:第一次访问时创建(延迟加载)
- **远程代理**:代理创建时就连接远程(或首次调用时连接)
- **保护代理**:代理不创建真实对象,只控制访问(真实对象由外部注入)
- **缓存代理**:代理不创建真实对象,只缓存结果

### 11.3 代理与单例

有时真实对象是单例,代理也要保证只有一个真实对象:

\`\`\`python
class SingletonProxy:
    _real = None

    def __getattr__(self, name):
        if SingletonProxy._real is None:
            SingletonProxy._real = RealService()    # 单例
        return getattr(SingletonProxy._real, name)
\`\`\`

### 11.4 代理的嵌套

代理可以嵌套(代理的代理),但要注意顺序:

\`\`\`python
# 缓存代理包着权限代理,权限代理包着真实对象
proxy = CacheProxy(PermissionProxy(RealService(), role="admin"))
# 调用顺序:Cache → Permission → Real
\`\`\`

顺序很重要——比如「权限代理应该在外层」(先鉴权再缓存),否则可能缓存了无权限的结果。

## 十二、代理模式的优缺点

### 优点

1. **延迟加载**:虚拟代理让大对象按需创建
2. **访问控制**:保护代理统一管理权限
3. **远程透明**:远程代理让远程调用像本地调用
4. **性能优化**:缓存代理减少重复计算
5. **开闭原则**:不修改真实对象就能加控制

### 缺点

1. **增加复杂度**:多了一层类
2. **性能开销**:代理转发有额外调用开销
3. **调试困难**:客户端分不清是代理还是真实对象
4. **响应延迟**:代理可能引入额外延迟(如远程代理的网络延迟)

## 十三、Python 标准库里的代理

\`\`\`python
# 1. weakref.proxy —— 弱引用代理,不增加引用计数
import weakref
class Obj: pass
obj = Obj()
proxy = weakref.proxy(obj)     # 代理,不阻止 obj 被 GC
print(proxy)                   # 像直接用 obj

# 2. functools.partial —— 方法代理,固定部分参数
from functools import partial
def f(a, b, c): return a + b + c
f1 = partial(f, 1)             # 代理,固定 a=1
print(f1(2, 3))                # 6

# 3. property —— 属性代理(前文已讲)

# 4. __getattr__ / __getattribute__ —— 动态代理的基础

# 5. unittest.mock.Mock —— 测试用的代理对象
from unittest.mock import Mock
m = Mock()
m.method.return_value = 42
print(m.method())              # 42
\`\`\`

\`weakref.proxy\` 是标准库现成的代理——它代理对象访问,但不增加引用计数,让对象可以被 GC 回收。

## 十四、易错点小结

| 易错点 | 错误写法 | 正确写法 | 说明 |
|-------|---------|---------|------|
| 代理改接口 | Proxy 方法名与 Real 不同 | 实现相同接口 | 客户端要透明 |
| __getattr__ 递归 | 构造里 self._real = ... | 用 object.__setattr__ | 避免触发 __setattr__ |
| 代理魔术方法 | 以为 __getattr__ 能代理 __len__ | 在 Proxy 类显式定义 __len__ | 魔术方法不走 __getattr__ |
| 缓存代理内部调用 | Real 内部 self.xxx 不被代理 | 用代理调或方法级装饰器 | self 调用绕过代理 |
| 代理当装饰器用 | 代理里加大量功能 | 那是装饰器 | 代理侧重控制,非增强 |
| 延迟加载重复创建 | 每次访问都 new Real | 用 _real is None 判断 | 只创建一次 |
| 权限代理漏校验 | 漏写某个方法的 _check | 统一在 __getattr__ 校验 | 避免遗漏 |
| 远程代理不处理异常 | 网络异常直接抛 | 转换成业务异常 | 客户端不关心网络细节 |
| 代理嵌套顺序错 | 缓存在外权限在内 | 权限在外缓存在内 | 防止缓存越权结果 |
| 静态代理手写转发 | N 个方法手写 N 个转发 | 用 __getattr__ 动态转发 | 减少重复代码 |

## 十五、本章小结

代理模式的核心是**「同接口 + 中间层 + 控制访问」**。它让客户端透明地使用代理,代理在中间加各种控制逻辑。

记住三个要点:
1. **代理与真实对象实现相同接口**(这是与适配器的根本区别)
2. **代理侧重「控制访问」**,不是「增强功能」(那是装饰器)
3. **Python 用 \`__getattr__\` 实现动态代理**,但魔术方法要显式定义

代理在工程里无处不在:ORM 的延迟加载、RPC 的远程调用、权限控制、缓存、\`property\` 描述符、\`weakref.proxy\`。当你遇到「想控制对对象的访问,但又不想改真实对象」时,就该上代理模式——延迟、权限、缓存、日志,都靠这层中间层来实现。

## 十六、四种结构型模式横向对比

学完适配器、装饰器、外观、组合、代理,做个总对比:

| 模式 | 意图 | 接口变化 | 包装数量 | 典型场景 |
|------|------|---------|---------|---------|
| **适配器** | 转换接口 | ✅ 改变 | 1 个 | 集成第三方库 |
| **装饰器** | 加职责 | ❌ 不变 | 1 个(可嵌套) | 日志/缓存/重试 |
| **外观** | 简化子系统 | ✅ 新接口 | 多个 | API 网关/SDK |
| **组合** | 统一树形结构 | ❌ 统一 | 多个(树) | 文件系统/UI 树 |
| **代理** | 控制访问 | ❌ 不变 | 1 个 | 延迟加载/权限 |

**记忆口诀**:
- 接口不对找**适配器**
- 要加功能找**装饰器**
- 系统太繁找**外观**
- 树形结构找**组合**
- 控制访问找**代理**

结构型模式的本质都是「**如何组合对象以形成更大的结构**」,只是各自的侧重点不同。理解了它们的意图差异,你在设计时就能准确选择。`,
  },
];
