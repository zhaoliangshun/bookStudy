// =============================================================
// C# 从入门到精通大全（全新版）—— 第 5 批章节
// 第三部分 面向对象 下（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章（正文讲次编号 = id + 1，因数组章占第 12 讲）：
//   csharp5-ch23 : 第二十四章 继承
//   csharp5-ch24 : 第二十五章 多态与虚方法
//   csharp5-ch25 : 第二十六章 抽象类与接口
//   csharp5-ch26 : 第二十七章 密封类与扩展方法
//   csharp5-ch27 : 第二十八章 命名空间与作用域
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十三章：继承
  // ============================================================
  {
    id: 'csharp5-ch23',
    group: '第三部分 面向对象',
    icon: '🌱',
    title: '继承',
    content: `## 第二十四章　继承

继承是面向对象的三大特性之一。它让你可以基于一个已有类（基类）派生出新类（派生类），自动获得基类的所有非私有成员，并可以扩展或修改其行为。

### 一、为什么需要继承 ⭐

假设你要建模"动物"体系：狗会叫、猫会抓老鼠、鸟会飞——但它们都有名字、年龄、都会呼吸。如果每个类都重新写一遍这些公共字段和方法，代码会重复且难以维护。继承的作用就是**抽取共性、复用代码、表达 is-a 关系**。

\`\`\`csharp
// 基类（父类）：包含所有动物共有的成员
class Animal
{
    public string Name { get; set; }
    public int Age { get; set; }

    public void Breathe() => Console.WriteLine($"{Name} 在呼吸");
}

// 派生类（子类）：用 : 表示继承
class Dog : Animal
{
    public void Bark() => Console.WriteLine($"{Name}：汪汪！");
}

// Dog 自动拥有 Name、Age、Breathe()
var dog = new Dog { Name = "旺财", Age = 3 };
dog.Breathe();  // 调用从基类继承的方法
dog.Bark();     // 调用自己的方法
\`\`\`

### 二、C# 只支持单继承

C# 不支持类的多继承——一个类只能有一个直接基类。如果你想"组合多种能力"，应该用接口（接口可以多实现，下一章讲）。这个设计避免了"菱形继承"问题，让类型关系更清晰。

\`\`\`csharp
class A { }
class B { }
// class C : A, B { }  // ❌ 编译错误，类不能多继承
class C : A { }        // ✅ 单继承合法
\`\`\`

### 三、所有类的根：object

C# 中所有类型都最终继承自 \`System.Object\`（关键字 \`object\`）。即使你没写 \`: object\`，编译器也会自动加上。这意味着所有对象都拥有 \`ToString()\`、\`Equals()\`、\`GetHashCode()\`、\`GetType()\` 这四个方法。

### 四、base 关键字与构造函数链

派生类的构造函数默认会先调用基类的无参构造函数。如果基类没有无参构造函数，就必须在派生类构造函数后用 \`: base(...)\` 显式调用。

\`\`\`csharp
class Animal
{
    public string Name { get; }
    public Animal(string name) => Name = name;  // 自定义构造函数
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }  // 用 base 调用基类构造
}

// base 关键字还能在方法中调用基类的成员
// base.MethodName() 表示"执行基类版本的方法"
\`\`\`

### 五、protected 访问修饰符

\`protected\` 表示"对当前类和派生类可见，但对外部不可见"。它是继承体系内共享实现细节的关键工具。

| 修饰符 | 类内 | 派生类 | 外部 |
| --- | --- | --- | --- |
| private | ✅ | ❌ | ❌ |
| protected | ✅ | ✅ | ❌ |
| internal | ✅（同程序集） | ✅（同程序集） | ✅（同程序集） |
| public | ✅ | ✅ | ✅ |

### 六、virtual 与 override：虚方法与重写

基类用 \`virtual\` 声明一个"可以被改写"的方法，派生类用 \`override\` 真正改写它。这是**运行时多态**的基础（下一章详讲）。

\`\`\`csharp
class Animal
{
    public virtual void Speak() => Console.WriteLine("动物发出声音");
}

class Dog : Animal
{
    public override void Speak() => Console.WriteLine("汪汪！");  // 重写
}
\`\`\`

### 七、new 关键字：方法隐藏（method hiding）

如果你不想重写基类方法，只是想定义一个"同名但无关"的方法，用 \`new\` 修饰符。这叫**方法隐藏**，与 \`override\` 的语义完全不同：override 是多态，new 是切断联系。

\`\`\`csharp
class Base { public void Hi() => Console.WriteLine("Base.Hi"); }
class Derived : Base
{
    public new void Hi() => Console.WriteLine("Derived.Hi");  // 隐藏基类方法
}

Base b = new Derived();
b.Hi();  // 输出 Base.Hi（隐藏不参与多态）
\`\`\`

### 八、sealed：密封方法

\`sealed override\` 表示"这个虚方法到此为止，不能再被子类重写"。这能防止继承层次被过度改写，也能让编译器做内联优化。

### 九、is-a vs has-a：何时用继承

- **is-a（是一个）**：Dog is an Animal → 用继承。
- **has-a（有一个）**：Car has an Engine → 用组合（把 Engine 作为字段）。

新手最大的坑就是滥用继承。原则：只有当派生类真的是基类的一种特化时才用继承；否则用组合更灵活。

### 十、Object 的常用方法

| 方法 | 用途 |
| --- | --- |
| ToString() | 返回对象的字符串表示，默认是类名，常重写 |
| Equals(object) | 判断是否相等，默认比较引用 |
| GetHashCode() | 返回哈希码，重写 Equals 时必须一起重写 |
| GetType() | 返回运行时类型信息（反射用） |

本章 demo 演示 Animal → Dog → Cat 三层结构，覆盖 base、virtual、override、new、ToString 重写。

### 十一、record 继承、sealed、\`base()\` 与脆弱基类

record 可以继承 record（\`record Student : Person\`），编译器继续生成拷贝构造 / \`with\` / 值相等——**相等会包含运行时类型**，\`Person\` 与 \`Student\` 即使字段碰巧一样也不相等。\`sealed record\` 阻止再派生。

构造链必须落到 \`base(...)\`（或主构造函数转发）。忘记传基类必填项会编译失败，这是好事。

**脆弱基类**：基类「随便加一个 virtual、改一下方法顺序」就可能让十年前的派生类行为改变。能 \`sealed\` 就封；必须开放继承时，virtual 点要少、契约要写清、用测试锁行为。\`new\` 隐藏不是多态，基类引用会走基类方法，团队里视为味道。

### 十二、new vs override 再钉一次

\`override\`：基类引用也走派生实现，这是多态。\`new\`：只是派生类型自己的另一套方法，基类引用仍走基类——调用方换个变量类型行为就变，极难查。看到编译器提示「隐藏了基类成员」不要随手加 \`new\` 消警告，先问该不该 \`override\`，或不该用同一个名字。

\`base()\` 必须是构造函数体之前的第一件事（或主构造转发）。派生类字段初始器在基类构造**之后**跑，所以基类构造里调用 virtual，派生字段还是默认值——这是继承里最阴的坑之一。

继承深度建议不超过两层业务基类。再深，优先组合（字段里握一个策略对象）而不是继续 : Base。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「继承」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第二十四章 继承层次
// 演示：base 构造、virtual/override、new 隐藏、ToString/Equals/GetHashCode
// 适用：.NET 8 / C# 12 顶级语句（类型声明必须在可执行语句之后）
// 版本：模式匹配 is Dog d（C# 7）；HashCode.Combine（.NET Core 2.1+ / .NET 8）
// 陷阱：new 隐藏没有多态；基类引用调用的仍是基类 Describe。Equals 与 == 默认不是一回事
// ===========================================================

using System;

// ---------- 1. 构造链：派生类必须先 : base(...) 让基类完成自己的字段 ----------
var dog = new Dog("旺财", 3, "中华田园犬");

var cat = new Cat("咪咪", 2, true);

Console.WriteLine($"狗的名字：{dog.Name}");

Console.WriteLine($"猫的年龄：{cat.Age}");

// ---------- 2. override 后的虚调用：编译期类型不重要，跑的是对象真实类型 ----------
dog.Speak();

cat.Speak();

Animal a1 = dog;

Animal a2 = cat;

a1.Speak();

a2.Speak();

// ---------- 3. new 隐藏：用基类引用调用时，隐藏方法「看不见」 ----------
dog.Describe();

a1.Describe();

Console.WriteLine(dog);

Console.WriteLine(cat);

// ---------- 4. Equals 按值；== 对 class 默认按引用，所以这里一个 true 一个 false ----------
var dog2 = new Dog("旺财", 3, "不同品种");

Console.WriteLine($"dog.Equals(dog2) = {dog.Equals(dog2)}");

Console.WriteLine($"dog == dog2 = {dog == dog2}");

Console.WriteLine($"a1 的运行时类型：{a1.GetType().Name}");

Console.WriteLine($"a2 的运行时类型：{a2.GetType().Name}");

// ---------- 5. is 模式：判断成功才引入变量 d，避免先 as 再判空 ----------
if (a1 is Dog d)
{
    Console.WriteLine($"a1 是 Dog，品种：{d.Breed}");
}

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Animal
{
    // get-only：只能在构造里赋；子类改年龄走 protected set
    public string Name { get; }
    public int Age { get; protected set; }  // 子类可改，外部仍不能 a.Age = 1

    // 一旦写了带参构造，编译器不再生成无参构造；子类必须显式 : base(...)
    public Animal(string name, int age)
    {
        Name = name;
        Age = age;
    }

    // virtual：调用点按运行时类型分发；不标 virtual 就不能 override
    public virtual void Speak()
    {
        Console.WriteLine($"{Name} 发出某种声音");
    }

    // 非虚方法：子类只能 new 隐藏，不能 override——这是刻意关掉多态
    public void Describe()
    {
        Console.WriteLine($"[Animal] 名字={Name}, 年龄={Age}");
    }

    // 默认 ToString 是运行时类型名，日志/调试几乎没用，建议按领域重写
    public override string ToString() => $"{Name}({Age}岁)";

    // 值相等：没重写时 Equals 是引用相等。这里故意忽略 Breed，所以两只不同品种的旺财仍 Equal
    public override bool Equals(object? obj) =>
        obj is Animal other && other.Name == Name && other.Age == Age;

    // Equals 与 GetHashCode 必须一致，否则 Dictionary/HashSet 会丢数据
    public override int GetHashCode() => HashCode.Combine(Name, Age);
}

class Dog : Animal
{
    public string Breed { get; }  // 派生类新增状态；基类 Equals 没用到它

    // 派生构造的第一件事是 base(...)；不能先用 Name 再调 base
    public Dog(string name, int age, string breed) : base(name, age)
    {
        Breed = breed;
    }

    // override 签名必须与虚方法一致（包括返回类型，协变返回除外）
    public override void Speak()
    {
        // 需要复用基类逻辑时写 base.Speak()；这里完全替换
        Console.WriteLine($"{Name}（{Breed}）：汪汪汪！");
    }

    // new：同名新方法，与基类 Describe 无继承关系。Animal 引用走基类版
    public new void Describe()
    {
        Console.WriteLine($"[Dog] 名字={Name}, 年龄={Age}, 品种={Breed}");
    }
}

class Cat : Animal
{
    public bool IsIndoor { get; }  // Cat 独有；不 override Describe 就沿用基类

    public Cat(string name, int age, bool isIndoor) : base(name, age)
    {
        IsIndoor = isIndoor;
    }

    public override void Speak()
    {
        Console.WriteLine($"{Name}：喵～");
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第二十四章：多态与虚方法
  // ============================================================
  {
    id: 'csharp5-ch24',
    group: '第三部分 面向对象',
    icon: '🎭',
    title: '多态与虚方法',
    content: `## 第二十五章　多态与虚方法

多态（Polymorphism）是面向对象最强大的特性。它让"同一个调用"在不同对象上表现出不同行为。C# 的多态分两种：**编译时多态**（方法重载、运算符重载）和**运行时多态**（虚方法 + 重写）。本章重点讲运行时多态。

### 一、什么是多态 ⭐

一句话：**父类引用指向子类对象，调用同名方法时执行的是子类的版本**。

\`\`\`csharp
Animal a = new Dog();
a.Speak();  // 输出"汪汪"，而不是 Animal 的默认声音
\`\`\`

这种"在运行时根据实际对象类型决定调用哪个方法"的机制，就是运行时多态。它的价值在于：调用方只关心接口（基类约定），不关心具体实现。

### 二、virtual 与 override

- \`virtual\`：基类声明"这个方法可以被子类改写"。
- \`override\`：子类真正改写它。签名必须完全匹配。

\`\`\`csharp
class Shape
{
    public virtual double Area() => 0;
}
class Circle : Shape
{
    public override double Area() => Math.PI * r * r;
}
\`\`\`

注意：只能 override 基类中标记为 virtual / abstract / override 的方法。普通方法不能被 override。

### 三、new 隐藏：不是多态

\`new\` 修饰符表示"我定义一个同名新方法，与基类方法无关"。它不参与多态——用基类引用调用时，执行的是基类版本。

\`\`\`csharp
class Base { public virtual void Hi() => Console.WriteLine("Base"); }
class Derived : Base
{
    public new void Hi() => Console.WriteLine("Derived");  // 隐藏，不是重写
}

Base b = new Derived();
b.Hi();  // Base（如果是 override 会输出 Derived）
\`\`\`

### 四、运行时多态 vs 编译时多态

| 类型 | 机制 | 决定时机 |
| --- | --- | --- |
| 编译时多态 | 方法重载（overload）、运算符重载 | 编译期 |
| 运行时多态 | virtual + override | 运行期 |

重载是"同名不同参"，编译器根据参数类型选一个；重写是"同签名"，运行时根据对象类型选一个。

### 五、抽象方法

\`abstract\` 方法没有实现，强制子类必须 override。它只能出现在抽象类中（下一章详讲）。

\`\`\`csharp
abstract class Animal
{
    public abstract void Speak();  // 没有方法体
}
class Dog : Animal
{
    public override void Speak() { ... }  // 必须实现
}
\`\`\`

### 六、虚属性与虚索引器

属性和索引器也可以是 virtual 的，子类可以 override 单独的 get / set。

\`\`\`csharp
class Base
{
    public virtual int Value { get; set; } = 10;
}
class Derived : Base
{
    public override int Value
    {
        get => base.Value * 2;       // 读时翻倍
        set => base.Value = value;   // 写时正常
    }
}
\`\`\`

### 七、协变返回类型（C# 9+）

从 C# 9 开始，override 方法的返回类型可以是基类方法返回类型的派生类型。这叫**协变返回类型**，对工厂模式、克隆方法特别有用。

\`\`\`csharp
class Base
{
    public virtual Animal Clone() => new Animal();
}
class Derived : Base
{
    // 返回 Dog（Animal 的子类）也合法
    public override Dog Clone() => new Dog();
}
\`\`\`

### 八、base.Method()：调用基类版本

在 override 方法里，可以用 \`base.Method()\` 调用基类版本。常用于"在基类行为基础上加一点"。

\`\`\`csharp
class Dog : Animal
{
    public override void Speak()
    {
        base.Speak();  // 先执行基类声音
        Console.WriteLine("汪汪！");
    }
}
\`\`\`

### 九、多态的实际应用：策略模式

策略模式是运行时多态最经典的用法：定义一族算法，封装成不同类，调用方在运行时切换。比如电商的折扣计算——满减、打折、阶梯优惠——每种一个类，调用方传入对应策略即可。

\`\`\`csharp
interface IDiscount
{
    decimal Calculate(decimal price);
}
class PercentDiscount : IDiscount
{
    private readonly decimal _percent;
    public PercentDiscount(decimal percent) => _percent = percent;
    public decimal Calculate(decimal price) => price * _percent;
}
class FixedDiscount : IDiscount
{
    private readonly decimal _amount;
    public FixedDiscount(decimal amount) => _amount = amount;
    public decimal Calculate(decimal price) => Math.Max(0, price - _amount);
}
// 调用方只依赖 IDiscount，不关心具体实现
\`\`\`

本章 demo 完整演示运行时多态 + 策略模式：定义一组支付方式，运行时切换。

### 十、虚分派、sealed override、何时不要 virtual

调用 \`animal.Speak()\` 时，CLR 查对象**真实类型**的虚表，不是变量的静态类型。这就是运行时多态。\`sealed override\` 允许你重写一次后禁止孙子再重写，既保留对基类的多态，又锁住后续继承。

**协变返回**（C# 9）：重写方法可以返回更派生的类型，\`override Student Clone()\` 替代 \`object Clone()\`。

不要默认 virtual：

- 没有第二处实现就不要虚——虚方法不能内联、契约永久化。
- 构造函数里不要调 virtual：派生字段还没初始化。
- 安全 / 不变式关键路径宁可模板方法 + protected abstract，也不要开放任意 override。

### 十一、虚方法清单（写进设计评审）

开放一个 virtual 等于公开一份**永久契约**：签名、线程安全、是否可重入、失败时对象是否半残。能 \`sealed class\` 就封类；只能封方法就 \`sealed override\`。模板方法模式：基类 \`public void Run()\` 非虚，里面调 \`protected abstract void Step()\`，比整条链路 virtual 安全。协变返回用来收窄工厂/Clone，不要用来隐藏失败类型。

测多态请用基类引用调方法：\`Animal a = new Dog(); a.Speak();\`。用派生变量调用证明不了虚分派。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「多态与虚方法」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第二十五章 多态与策略模式
// 演示：virtual/override/new、工厂方法协变返回、策略接口替换算法
// 适用：.NET 8 / C# 12 顶级语句
// 版本：协变返回类型（C# 9）、范围索引 [^4]（C# 8）、:C 货币格式跟当前区域性走
// 陷阱：new 隐藏的 Receipt 在基类引用上看不到；策略对象应无状态或只读配置，别偷偷改共享字段
// ===========================================================

using System;

var cashier = new Cashier();

// ---------- 1. 声明类型是 Payment，实际对象是派生类：Pay 走虚分发 ----------
Payment p1 = new CashPayment(100m);

Payment p2 = new CardPayment(500m, "6222021234567890");

Payment p3 = new Payment(50m);

cashier.Process(p1);

cashier.Process(p2);

cashier.Process(p3);

Console.WriteLine();

// ---------- 2. 非虚 Receipt：基类引用永远调用基类版本，必须转型才看到 new 版 ----------
Console.WriteLine("p2.Receipt() (基类引用): " + p2.Receipt());

CardPayment card = (CardPayment)p2;

Console.WriteLine("card.Receipt() (派生类引用): " + card.Receipt());

Console.WriteLine();

// ---------- 3. 工厂方法：override 返回更具体的类型（C# 9 协变返回） ----------
PaymentFactory factory = new CashFactory();

Payment created = factory.Create(200m);

Console.WriteLine($"工厂创建的类型：{created.GetType().Name}");

created.Pay();

Console.WriteLine();

// ---------- 4. 策略模式：算法做成对象，收银逻辑不必 if-else 卡种/折扣 ----------
cashier.Checkout(1000m, new NoDiscount());

cashier.Checkout(1000m, new PercentDiscount(0.8m));

cashier.Checkout(1000m, new FixedDiscount(100m));

IDiscount[] strategies = {
    new NoDiscount(),
    new PercentDiscount(0.9m),
    new FixedDiscount(50m),
};

Console.WriteLine("\\n批量计算：");

foreach (var s in strategies)
{
    cashier.Checkout(800m, s);
}

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Payment
{
    public decimal Amount { get; }
    public Payment(decimal amount) => Amount = amount;

    // virtual：同一 Process(Payment) 能跑出现金/刷卡/默认三种行为
    public virtual void Pay()
    {
        Console.WriteLine($"支付 {Amount:C}（默认方式）");
    }

    // 非虚：想多态请改成 virtual。这里故意留下 new 的对比
    public string Receipt() => $"收据：{Amount:C}";
}

class CashPayment : Payment
{
    public CashPayment(decimal amount) : base(amount) { }

    public override void Pay()
    {
        // base.Pay() 先复用基类输出，再补现金特有步骤
        base.Pay();
        Console.WriteLine("  → 已收到现金");
    }
}

class CardPayment : Payment
{
    public string CardNumber { get; }
    public CardPayment(decimal amount, string card) : base(amount)
    {
        CardNumber = card;
    }

    public override void Pay()
    {
        Console.WriteLine($"支付 {Amount:C}（卡号 ...{CardNumber[^4..]}）");  // [^4..]：C# 8 从后往前 4 位
        Console.WriteLine("  → 信用卡扣款成功");
    }

    // new 不是 override：Payment 引用上的 Receipt() 仍是基类字符串
    public new string Receipt() => $"信用卡收据：{Amount:C}, 卡尾号 {CardNumber[^4..]}";
}

class PaymentFactory
{
    public virtual Payment Create(decimal amount) => new Payment(amount);
}

class CashFactory : PaymentFactory
{
    // C# 9：override 返回值可以是基类返回类型的派生类，调用方仍可当 Payment 用
    public override CashPayment Create(decimal amount) => new CashPayment(amount);
}

interface IDiscount
{
    decimal Calculate(decimal price);  // 接口是契约：策略之间只保证这个形状
    string Name { get; }
}

class PercentDiscount : IDiscount
{
    private readonly decimal _percent;  // 配置不可变，策略实例才线程安全可共享
    public PercentDiscount(decimal percent) => _percent = percent;
    public string Name => $"打{_percent * 10}折";
    public decimal Calculate(decimal price) => price * _percent;
}

class FixedDiscount : IDiscount
{
    private readonly decimal _amount;  // 立减；Calculate 用 Max 避免减成负数
    public FixedDiscount(decimal amount) => _amount = amount;
    public string Name => $"立减{_amount:C}";
    public decimal Calculate(decimal price) => Math.Max(0, price - _amount);
}

class NoDiscount : IDiscount
{
    public string Name => "无折扣";
    public decimal Calculate(decimal price) => price;
}

class Cashier
{
    // 依赖基类：新支付方式不必改 Cashier，这是开闭原则的最小例子
    public void Process(Payment payment)
    {
        Console.WriteLine($"--- 处理 {payment.GetType().Name} ---");
        payment.Pay();  // 虚分发：编译期只知道 Payment，运行时才绑定到 override
    }

    // 依赖接口：折扣算法可热替换，Cashier 不知道打几折
    public void Checkout(decimal price, IDiscount discount)
    {
        decimal final = discount.Calculate(price);
        Console.WriteLine($"原价 {price:C} | {discount.Name} | 实付 {final:C}");
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第二十五章：抽象类与接口
  // ============================================================
  {
    id: 'csharp5-ch25',
    group: '第三部分 面向对象',
    icon: '📐',
    title: '抽象类与接口',
    content: `## 第二十六章　抽象类与接口

抽象类和接口是面向对象设计的两大支柱。它们都用于"定义契约"，但语义和使用场景有明显差异。掌握它们的区别是高级 C# 开发者的必修课。

### 一、抽象类 abstract class ⭐

用 \`abstract\` 修饰的类不能被实例化，只能被继承。它可以包含：已实现的成员、抽象成员（无实现）、字段、构造函数。

\`\`\`csharp
abstract class Animal
{
    public string Name { get; }
    protected Animal(string name) => Name = name;

    public abstract void Speak();          // 抽象方法：无实现，子类必须 override
    public virtual void Breathe() => ...;  // 已实现的虚方法
}
\`\`\`

要点：
- 抽象类不能 \`new\`。
- 抽象方法只能存在于抽象类中。
- 子类必须 override 所有抽象成员，否则子类也得是 abstract。

### 二、抽象属性

属性也可以是 abstract 的，子类必须实现 get / set。

\`\`\`csharp
abstract class Shape
{
    public abstract double Area { get; }   // 抽象只读属性
    public abstract double Perimeter { get; }
}
\`\`\`

### 三、接口 interface ⭐

接口是一组**纯契约**：定义成员签名，但不带实现（C# 8 之前）。一个类可以实现多个接口——这就是 C# 解决"多继承"问题的方式。

\`\`\`csharp
interface IShape
{
    double Area();                  // 接口方法（默认 public，不能加修饰符）
    double Perimeter { get; }       // 接口属性
}

class Circle : IShape
{
    public double Area() => ...;
    public double Perimeter => ...;
}
\`\`\`

接口成员默认就是 public 和 abstract，不能加访问修饰符（C# 8 之前）。

### 四、默认接口方法（C# 8+ DIM）

从 C# 8 开始，接口方法可以带默认实现。这解决了"给接口加方法会破坏所有实现类"的问题。

\`\`\`csharp
interface ILogger
{
    void Log(string msg);
    // 默认实现：实现类可以不重写也能用
    void LogError(string msg) => Log("[ERROR] " + msg);
}

class ConsoleLogger : ILogger
{
    public void Log(string msg) => Console.WriteLine(msg);
    // 不实现 LogError 也能调用 —— 用默认实现
}
\`\`\`

注意：默认方法只能通过接口引用调用，且实现类不"继承"它。

### 五、接口多继承

一个类/结构可以实现多个接口：

\`\`\`csharp
class Foo : IComparable<Foo>, IDisposable, ICloneable { ... }
\`\`\`

接口之间也可以继承多个接口：

\`\`\`csharp
interface IReadWrite : IRead, IWrite { }
\`\`\`

### 六、显式接口实现

当一个类实现了两个接口，且两个接口有同名方法，或者你想让某个接口方法只能通过接口引用调用时，用**显式实现**。

\`\`\`csharp
interface IReader { void Read(); }
interface IFile { void Read(); }

class Document : IReader, IFile
{
    void IReader.Read() { ... }  // 显式实现：只能通过 IReader 引用调用
    void IFile.Read()   { ... }  // 显式实现：只能通过 IFile 引用调用
}
\`\`\`

显式实现的优点：隐藏实现细节、解决命名冲突、强制调用方使用接口。

### 七、is / as 转换接口

\`\`\`csharp
object o = new Circle();
if (o is IShape shape) { ... }   // 模式匹配：安全转换
IShape s = o as IShape;          // as：转换失败返回 null
\`\`\`

### 八、抽象类 vs 接口：怎么选？

| 对比项 | 抽象类 | 接口 |
| --- | --- | --- |
| 继承数量 | 单继承 | 多实现 |
| 字段 | 可以有 | 不能有实例字段（C# 8 默认接口成员只是方法/属性/静态成员，不是字段） |
| 构造函数 | 有 | 无 |
| 已实现成员 | 默认可以 | C# 8+ 才可以（默认方法） |
| 表达关系 | is-a（特化） | can-do（能力） |

经验法则：
- **共享实现 + 字段 + 构造函数** → 抽象类。
- **跨类型族的共同能力**（如 IDisposable、IComparable）→ 接口。
- 不确定时优先接口——接口更灵活。

### 九、常用框架接口简介

| 接口 | 用途 |
| --- | --- |
| IEnumerable<T> | 可遍历（foreach 支持） |
| IDisposable | 资源释放（using 支持） |
| IComparable<T> | 自然排序 |
| IEquatable<T> | 类型安全的相等比较 |
| ICloneable | 克隆（已不推荐，但常见） |
| ICollection<T> / IList<T> / IDictionary<K,V> | 集合族 |

### 十、record 与接口

record 是 C# 9 引入的引用类型（也有 record struct），基于值相等。它也可以实现接口，常用于 DTO + 能力组合。

\`\`\`csharp
record Point(double X, double Y) : IComparable<Point>
{
    public int CompareTo(Point other) => X.CompareTo(other.X);
}
\`\`\`

本章 demo 定义 IShape 接口 + 抽象类 Shape + Circle / Square 实现，演示默认方法、显式实现、is/as 转换。

### 十一、IDisposable 与「接口 vs 抽象类」再表

持有文件、连接、\`CancellationTokenSource\` 的类型实现 \`IDisposable\`，调用方 \`using\`。接口可以继承 \`IDisposable\` 强制实现者释放。抽象类适合「已有部分实现 + 身份层次」；接口适合「能力」（能比较、能释放、能异步枚举）。

| 问题 | 偏接口 | 偏抽象类 |
| --- | --- | --- |
| 需要多能力组合 | ✅ | ❌ 单继承 |
| 要共享字段 / 构造逻辑 | 默认接口方法只能到方法 | ✅ |
| 版本升级加方法 | DIM 可加默认体 | 加具体方法也行 |
| 表示 is-a 家族 | 谨慎 | ✅ |

DIM（默认接口方法）让你能给接口加方法而不打碎旧实现；显式接口实现用于两个接口同名方法冲突，或故意把实现藏到接口背后。

### 十二、显式实现与 IDisposable 组合

\`void IDisposable.Dispose()\` 显式实现时，类自己还应有 \`public void Dispose()\` 或 \`Close()\`，否则 \`using\` 可以、直接 \`obj.Dispose()\` 却找不到。多个接口撞名（\`IEnumerable.GetEnumerator\` vs 泛型版）几乎总是显式实现非泛型那份。抽象类已经实现接口时，派生类只 override 抽象钩子即可，不必再写一遍接口成员。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「抽象类与接口」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第二十六章 抽象类与接口
// 演示：abstract 成员、接口默认方法、多接口、is/as、IComparable 排序
// 适用：.NET 8 / C# 12 顶级语句
// 版本：默认接口方法（C# 8）；is not null（C# 9）；抽象类可有已实现成员和构造函数
// 陷阱：默认接口方法只能通过接口引用调用；隐式实现可同时满足多个同名接口方法
// ===========================================================

using System;

// ---------- 1. 接口引用：Draw 走各自实现，Describe 走 IShape 默认方法 ----------
var circle = new Circle(3);

var square = new Square(4);

IShape[] shapes = { circle, square };

foreach (var s in shapes)
{
    s.Draw();         // 接口槽：Circle/Square 各自的 Draw
    s.Describe();     // 默认接口方法：实现类没重写也能用，但必须用 IShape 引用
}

Console.WriteLine();

// ---------- 2. 抽象类引用：不能 new Shape，但可以装派生实例，ToString 用的是抽象属性 Area ----------
Shape[] absShapes = { circle, square };

foreach (var s in absShapes)
{
    Console.WriteLine(s);  // 调用 ToString
}

Console.WriteLine();

// ---------- 3. is 引入变量 / as 失败返回 null：不要用强制转换碰不确定类型 ----------
object obj = circle;

if (obj is IShape shape)
{
    Console.WriteLine($"obj 是 IShape, 面积={shape.Area:F2}");
}

var asCircle = obj as Circle;

if (asCircle is not null)
{
    Console.WriteLine($"obj 转为 Circle 成功, 半径={asCircle.Radius}");
}

if (obj is Square) { Console.WriteLine("是 Square"); }
else { Console.WriteLine("obj 不是 Square"); }

Console.WriteLine();

// ---------- 4. IComparable：Sort 的比较器走 CompareTo，按面积排 ----------
var list = new List<IShape> { square, circle };

list.Sort((a, b) => a.Area.CompareTo(b.Area));

Console.WriteLine("按面积排序后：");

foreach (var s in list) Console.WriteLine($"  {s.GetType().Name}: {s.Area:F2}");

Console.WriteLine();

IShape ish = circle;

ish.Describe();

// ============ 类型声明（必须放在所有顶级语句之后） ============

interface IShape
{
    double Area { get; }          // 接口属性：实现类必须提供 get
    double Perimeter { get; }
    void Draw();                  // 接口方法默认 public abstract

    // C# 8 默认接口方法：加新成员不必炸所有实现类；实现类里同名方法会隐藏它
    void Describe()
    {
        Console.WriteLine($"面积={Area:F2}, 周长={Perimeter:F2}");
    }
}

interface IDrawable
{
    void Draw();   // 与 IShape.Draw 同名：隐式实现一份即可同时满足两个接口
}

abstract class Shape
{
    public string Name { get; }                  // 抽象类可以有字段/属性和构造，接口不行
    protected Shape(string name) => Name = name; // 抽象类不能 new，但派生类要 : base(...)

    // 抽象属性：没有实现，派生类必须 override，否则自己也得是 abstract
    public abstract double Area { get; }
    public abstract double Perimeter { get; }

    // 已实现成员可以调用抽象属性——运行时绑定到派生类
    public override string ToString() => $"{Name}(面积={Area:F2})";
}

class Circle : Shape, IShape, IDrawable, IComparable<IShape>
{
    public double Radius { get; }

    public Circle(double radius) : base("圆形") => Radius = radius;

    // override 同时满足抽象类槽；接口 Area 由同一属性隐式实现
    public override double Area => Math.PI * Radius * Radius;
    public override double Perimeter => 2 * Math.PI * Radius;

    // 隐式实现：这一份 Draw 既是 IShape.Draw 也是 IDrawable.Draw
    public void Draw() => Console.WriteLine($"画一个半径 {Radius} 的圆");

    // 若两个接口语义不同，才需要显式实现 void IDrawable.Draw() { ... }
    // void IDrawable.Draw() => Console.WriteLine("[IDrawable] 画圆");

    // 返回值约定与 IComparable：<0 小于、0 等于、>0 大于；null 通常视为最小或最大，这里当较小
    public int CompareTo(IShape? other)
    {
        if (other is null) return 1;
        return Area.CompareTo(other.Area);
    }
}

class Square : Shape, IShape
{
    public double Side { get; }
    public Square(double side) : base("正方形") => Side = side;

    public override double Area => Side * Side;
    public override double Perimeter => 4 * Side;

    public void Draw() => Console.WriteLine($"画一个边长 {Side} 的正方形");
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第二十六章：密封类与扩展方法
  // ============================================================
  {
    id: 'csharp5-ch26',
    group: '第三部分 面向对象',
    icon: '🔒',
    title: '密封类与扩展方法',
    content: `## 第二十七章　密封类与扩展方法

密封类（sealed）和扩展方法（extension method）看似无关，实则都在解决同一个问题：**如何在不修改原类型的前提下控制或扩展它的能力**。密封类"关闭继承"，扩展方法"添加方法"。

### 一、密封类 sealed class ⭐

\`sealed\` 修饰的类不能被继承。它相当于继承层次的"终点站"。

\`\`\`csharp
sealed class Token { ... }
// class AdminToken : Token { }  // ❌ 编译错误
\`\`\`

### 二、为什么需要密封

三个理由：

1. **性能**：密封类的虚方法调用可以被编译器优化为直接调用（去虚化 devirtualization）。JIT 也更容易内联。
2. **安全**：防止恶意代码通过继承改写关键行为。比如 \`string\` 是 sealed，避免有人派生 \`EvilString\` 篡改比较逻辑。
3. **设计**：明确告诉使用者"这个类的行为到此为止，不要试图扩展它"。

### 三、string 是密封类

\`System.String\` 就是 sealed。这也是为什么扩展方法在 C# 里这么重要——你不能继承 string 加方法，只能用扩展方法"假装"给它加。

### 四、密封方法 sealed override

\`sealed\` 也能修饰 override 方法，表示"这次重写到此为止，更深层的子类不能再 override"。

\`\`\`csharp
class Base { public virtual void Hi() { } }
class Mid : Base { public override void Hi() { } }
class Derived : Mid
{
    public sealed override void Hi() { }  // 再下层不能 override Hi 了
}
\`\`\`

### 五、密封类最佳实践

- **默认 sealed**（与现代分析器 CA1852 一致）：只有真正设计了继承扩展点的类才开放；不是为继承而写的类，密封可以防误用、帮 JIT 优化（去虚化）。
- value type（struct）天然"密封"——不能被继承。
- 库的边界类型（DTO、值对象、安全敏感类型）必须密封。

### 六、扩展方法详解 ⭐

扩展方法让你**在不修改原类型源码的情况下给它添加方法**。语法：在 static 类里定义 static 方法，第一个参数加 \`this\`。

\`\`\`csharp
public static class StringExtensions
{
    // this string 表示"给 string 加一个 Repeat 方法"
    public static string Repeat(this string s, int n)
        => string.Concat(Enumerable.Repeat(s, n));
}

// 用起来就像 string 自带的方法
string result = "ab".Repeat(3);  // "ababab"
\`\`\`

扩展方法的本质是**编译器的语法糖**：编译后等价于 \`StringExtensions.Repeat("ab", 3)\`。它不能访问私有成员，也不能被派生类 override。

### 七、链式调用

扩展方法如果返回同类型，就能链式调用：

\`\`\`csharp
public static string Wrap(this string s, string tag)
    => $"<{tag}>{s}</{tag}>";

string html = "hi".Wrap("b").Wrap("p");  // "<p><b>hi</b></p>"
\`\`\`

### 八、扩展方法与接口

扩展方法最常见的应用就是给 IEnumerable<T> 加方法——LINQ 本身就是一堆扩展方法！

\`\`\`csharp
public static class EnumerableExtensions
{
    public static void Print<T>(this IEnumerable<T> source)
    {
        foreach (var item in source) Console.WriteLine(item);
    }
}

new[] { 1, 2, 3 }.Print();  // 给数组加 Print
\`\`\`

### 九、命名空间约定

扩展方法必须放在**非泛型静态类**里，且必须 using 该静态类所在的命名空间才能用。这就是为什么 \`using System.Linq;\` 之后数组突然就有了 Where / Select 等方法。

约定：扩展方法类放 \`XxxExtensions\` 命名，放独立命名空间，避免全局污染。

### 十、扩展方法陷阱

1. **与实例方法冲突时，实例方法优先**：如果 string 自带了 Repeat，扩展方法就被忽略。
2. **null 也能调用扩展方法**：因为本质是静态调用。要在方法内判空。
3. **不要滥用**：扩展方法过多会让代码"看起来能调用却找不到定义"。

\`\`\`csharp
string? s = null;
s.SafeLen();  // 不报错，但要在 SafeLen 内部判 null
\`\`\`

### 十一、扩展属性？没有

C# 不支持扩展属性。但可以模拟：写一个返回值的扩展方法当"属性"用，或者用 expression-bodied 的方式接近属性语法。

本章 demo 演示 sealed 类 + 扩展方法（给 string 加 Repeat、给 IEnumerable<T> 加 Print、链式调用）。

### 十二、为什么要封、扩展解析、\`[Obsolete]\`

密封默认好处：虚表更稳、JIT 更好内联、没人能覆写你的安全检查。框架里 \`string\` / \`int\` 装箱类型都是 sealed 思路（值类型本就不能继承）。只有真正设计了扩展点才打开。

扩展方法解析：1) 实例方法；2) 当前命名空间的扩展；3) using 进来的命名空间。两个扩展同样「合适」会 \`CS0121\` 歧义。**不要**给 \`object\` / \`T\` 无约束扩展。

\`[Obsolete("用 Bar 代替", error: true)]\` 让调用方编译失败。公开库改名先 \`error: false\` 警告一个版本。

### 十三、C# 14 扩展成员（标注）

本章旧文写「没有扩展属性」——在 **C# 14** 里过时了：可以用扩展成员声明扩展属性/方法块。本教程交互 demo 仍是 C# 12，请继续写 \`public static class XxxExtensions { public static T M(this T x) }\`。升级 \`<LangVersion>14</LangVersion>\` 后再用新语法，解析规则仍然是「实例成员优先」。

### 十四、扩展方法解析四规则

1. 实例方法永远赢。2. 更具体的接收者类型赢（\`this string\` 优于 \`this object\`）。3. 内层命名空间优于外层。4. 同样合适 → 歧义错误，用静态方法调用消歧：\`FooExt.Bar(x)\`。

\`[Obsolete]\` 可以打在扩展方法上，引导人去新扩展。C# 14 扩展成员只是换皮，解析顺序不变。给接口写扩展（\`this IEnumerable<T>\`）是 LINQ 的路子，很强大，也很容易把 IntelliSense 变成一页清单——请放进专门的 \`MyApp.Linq\` 命名空间，按需 using。

### 十五、什么时候不该写扩展

类型是你自己能改的，优先加实例方法。扩展留给：密封类型（string）、接口补能力、以及不想引入依赖的跨层语法糖。扩展方法看不到 \`private\`，所以它不能替代子类。单元测试里为了 mock 而给一切加扩展，通常是设计味道，应改接口。\`[Obsolete]\` 迁移期可以让新旧扩展并存一个版本，下个版本再删旧名。公开库的扩展要放在独立程序集，避免为了一个 \`TrimToNull\` 拖进整个 Web 栈。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「密封类与扩展方法」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第二十七章 密封类与扩展方法
// 演示：sealed 类、sealed override、string/IEnumerable 扩展、链式调用、null 接收者
// 适用：.NET 8 / C# 12 顶级语句
// 版本：扩展方法（C# 3）；Range [1..]（C# 8）；可空引用类型下 this string? 允许对 null 调用
// 陷阱：扩展方法是静态调用，s.Foo() 在 s==null 时不会 NRE（除非方法体自己解引用）；实例方法优先于扩展
// ===========================================================

using System;

using System.Collections.Generic;

using System.Linq;

// ---------- 1. sealed 类：别人不能继承 ApiToken，避免令牌类型被派生篡改 ----------
var token = new ApiToken("abcdef123456");

Console.WriteLine(token);

// ---------- 2. sealed override：Leaf.Hi 到此封口，再派生不能 override ----------
Base b = new Leaf();

b.Hi();

Console.WriteLine();

// ---------- 3. 扩展方法链式：返回 string 就能继续接其它 string 扩展 ----------
string s = "ab";

Console.WriteLine(s.Repeat(3));

Console.WriteLine(s.Repeat(2).Wrap("i"));

string html = "hi".Wrap("b").Wrap("p");

Console.WriteLine(html);

string? maybe = null;

Console.WriteLine($"null.IsNullOrEmpty: {maybe.IsNullOrEmpty()}");

Console.WriteLine($"null.SafeLen: {maybe.SafeLen()}");

Console.WriteLine("hello WORLD".ToTitle());

Console.WriteLine();

// ---------- 4. IEnumerable 扩展：WhereNot 是延迟执行，Print 才真正遍历 ----------
int[] nums = { 1, 2, 3, 4, 5, 6 };

nums.Print("原始数组: ");

nums.WhereNot(x => x % 2 == 0).Print("奇数: ");

nums.Where(x => x > 2).WhereNot(x => x > 4).Print("大于2且不大于4: ");

new[] { "apple", "banana", "cherry" }

.Where(f => f.StartsWith('b'))
    .Print("以 b 开头的水果: ");

Console.WriteLine();

double[] scores = { 90.5, 85.0, 92.3, 78.8 };

Console.WriteLine($"平均分: {scores.AverageOrZero():F2}");

Console.WriteLine($"空数组平均: {Array.Empty<double>().AverageOrZero()}");

Console.WriteLine();

// ---------- 5. 扩展方法等价于静态调用，发现性靠 using 命名空间 ----------
string test = "hello";

Console.WriteLine($"test.IsNullOrEmpty(): {test.IsNullOrEmpty()}");

Console.WriteLine($"等价调用: {StringExtensions.IsNullOrEmpty(test)}");

// ============ 类型声明（必须放在所有顶级语句之后） ============

sealed class ApiToken
{
    public string Value { get; }
    public ApiToken(string value) => Value = value;

    public override string ToString() => $"Token({Value[..Math.Min(4, Value.Length)]}***)";
}

class Base
{
    public virtual void Hi() => Console.WriteLine("Base.Hi");
}

class Mid : Base
{
    public override void Hi() => Console.WriteLine("Mid.Hi");
}

class Leaf : Mid
{
    // sealed override：允许再派生 Leaf2，但不允许再改 Hi 的虚槽
    public sealed override void Hi() => Console.WriteLine("Leaf.Hi");
}

static class StringExtensions
{
    // this 参数是语法糖；Repeat 内部会解引用 s，所以 null 必须先拒
    public static string Repeat(this string s, int n)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));  // 扩展方法不会自动帮你判空
        return string.Concat(Enumerable.Repeat(s, n));
    }

    // 返回新 string，原 s 不变——字符串本身不可变
    public static string Wrap(this string s, string tag) => $"<{tag}>{s}</{tag}>";

    // this string?：允许 maybe.IsNullOrEmpty()；本质是静态调用，不会先对 maybe 解引用
    public static bool IsNullOrEmpty(this string? s) => string.IsNullOrEmpty(s);

    public static int SafeLen(this string? s) => s?.Length ?? 0;

    public static string ToTitle(this string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        return char.ToUpper(s[0]) + s[1..].ToLower();  // [1..] 空串时是空，单字符也不会越界
    }
}

static class EnumerableExtensions
{
    // 泛型扩展：给所有 IEnumerable<T> 加能力；约束越少越容易污染 IntelliSense
    public static void Print<T>(this IEnumerable<T> source, string? prefix = null)
    {
        if (source is null) throw new ArgumentNullException(nameof(source));
        if (prefix is not null) Console.Write(prefix);
        foreach (var item in source)
        {
            Console.Write(item + " ");
        }
        Console.WriteLine();
    }

    // yield：返回的是迭代器，调用 WhereNot() 本身不跑谓词
    public static IEnumerable<T> WhereNot<T>(this IEnumerable<T> source, Func<T, bool> predicate)
    {
        foreach (var item in source)
        {
            if (!predicate(item)) yield return item;
        }
    }

    // ToList() 会立刻枚举；空序列 Average() 会抛，这里用 0 做业务默认
    public static double AverageOrZero(this IEnumerable<double> source)
    {
        var list = source.ToList();
        return list.Count == 0 ? 0 : list.Average();
    }
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第二十七章：命名空间与作用域
  // ============================================================
  {
    id: 'csharp5-ch27',
    group: '第三部分 面向对象',
    icon: '🗂️',
    title: '命名空间与作用域',
    content: `## 第二十八章　命名空间与作用域

命名空间（namespace）是 C# 组织类型的容器，类似 Java 的 package、JS 的模块。它解决两个问题：**类型名冲突** 和 **类型查找的可读性**。本章覆盖 namespace、using、global using、file-scoped namespace 等核心机制。

### 一、namespace 声明 ⭐

\`\`\`csharp
namespace MyApp.Services
{
    public class UserService { ... }
}
\`\`\`

类型全名是 \`MyApp.Services.UserService\`。命名空间可以嵌套，也可以用点号简写——\`namespace MyApp.Services { }\` 等价于 \`namespace MyApp { namespace Services { } }\`。

### 二、文件作用域命名空间（C# 10+）⭐

传统 namespace 要包一对大括号，缩进很烦。C# 10 引入**文件作用域命名空间**：

\`\`\`csharp
namespace MyApp.Services;  // 末尾加分号，整个文件都属于这个命名空间

public class UserService { ... }  // 不需要再缩进
\`\`\`

一个文件只能有一个文件作用域命名空间，且必须放在所有顶级语句/类型之前。这是现代 C# 项目的默认风格。

### 三、using 指令

\`using\` 导入其他命名空间，让你直接用其中的类型名而不写全名。

\`\`\`csharp
using System.Collections.Generic;  // 导入后可直接写 List<int>

List<int> nums = new();  // 否则要写 System.Collections.Generic.List<int>
\`\`\`

### 四、global using（C# 10+）⭐

\`global using\` 让一个命名空间对整个项目所有文件都生效，写一次即可。

\`\`\`csharp
// 在某个文件（通常是 Program.cs 或专门的 Usings.cs）写一次：
global using System.Collections.Generic;
// 之后所有文件都能直接用 List<T>，不用每个文件再 using
\`\`\`

### 五、隐式 using（ImplicitUsings）⭐

在 .csproj 里启用 \`<ImplicitUsings>enable</ImplicitUsings>\`，SDK 会自动 global using 一批常用命名空间（System、System.Linq、System.Collections.Generic 等）。这就是为什么 .NET 6+ 的 Program.cs 可以不写任何 using 就能用 Console / List / LINQ。

### 六、using 别名

给长命名空间或类型起短名：

\`\`\`csharp
using Dict = System.Collections.Generic.Dictionary<int, string>;

Dict d = new Dict();  // 直接用别名
\`\`\`

别名也能是 \`global using\`：

\`\`\`csharp
global using Dict = System.Collections.Generic.Dictionary<int, string>;
\`\`\`

### 七、嵌套 using 别名

可以给命名空间起别名，再用别名访问其中类型：

\`\`\`csharp
using Coll = System.Collections.Generic;
Coll.List<int> list = new();
\`\`\`

### 八、命名空间与程序集

**命名空间是逻辑组织，程序集是物理打包（.dll）**。两者没有强制对应关系：
- 一个 .dll 可以包含多个命名空间的类型。
- 一个命名空间的类型可以分布在多个 .dll 中。

但实践中通常**一个程序集对应一个根命名空间**，方便管理。

### 九、命名空间命名规范

惯例：\`公司.产品.模块.子模块\`

\`\`\`csharp
namespace Contoso.Shop.Orders;    // Contoso 公司 Shop 产品 Orders 模块
namespace Contoso.Shop.Payments;
\`\`\`

### 十、命名空间冲突解决

当两个命名空间有同名类型时，用别名消歧：

\`\`\`csharp
using MyTimer = System.Timers.Timer;     // System.Timers 的 Timer
using ThreadingTimer = System.Threading.Timer;  // 另一个 Timer

MyTimer t1 = new();        // 明确是哪个
ThreadingTimer t2 = new();
\`\`\`

也可以用完全限定名消歧：\`System.Timers.Timer t = new();\`

### 十一、命名空间与文件夹结构

C# 项目默认会按文件夹结构生成命名空间（SDK 风格项目）。比如文件 \`Services/UserService.cs\` 默认命名空间是 \`项目根命名空间.Services\`。也可以用 \`<RootNamespace>\` 自定义。

### 十二、internal vs public：跨程序集可见性

- \`public\`：任何程序集都能访问。
- \`internal\`：仅当前程序集可见（默认！）。

这是组件化的关键：你可以在程序集内自由共享类型，对外只暴露 \`public\` API。要让其他程序集访问 internal 类型，需要 \`[InternalsVisibleTo]\` 特性。

\`\`\`csharp
[assembly: InternalsVisibleTo("MyApp.Tests")]  // 让测试项目能访问 internal
\`\`\`

本章 demo 演示 namespace、file-scoped namespace、using 别名、自定义命名空间层次、internal 跨程序集可见性（注释说明）。

### 十三、using static、extern alias、命名空间 ≠ 文件夹

\`using static System.Math;\` 后可直接写 \`Sin(x)\`。适合数学/常量多的文件；不要 using static 一个什么都有的上帝类。

\`extern alias\` 极少用：两个程序集有同名类型时，在 csproj 给引用起别名，源里 \`extern alias OldLib;\` 再 \`OldLib::Foo.Bar\`。先考虑改包，而不是 alias。

命名空间**不必**等于文件夹，但约定 \`MyApp/Services/Foo.cs\` → \`namespace MyApp.Services\`。file-scoped namespace（\`namespace MyApp.Services;\`）减少一层缩进。\`global using\` 放在 \`GlobalUsings.cs\`，团队共享；隐式 using 由 SDK 注入，关掉就自己写。

### 十四、global using 与文件作用域的落地约定

一个仓库只放一份 \`GlobalUsings.cs\`（或 csproj \`<Using Include="..." />\`），写 \`System\` / \`System.Linq\` / 项目内最常用命名空间。测试项目不要继承生产 global using 里的 Web 类型。file-scoped namespace 与文件夹同名；偶尔为了和旧程序集对齐可以不一致，但要在 README 写一句。\`extern alias\` 出现就记一条债：计划合并重复类型。

文件夹改名时一并改 namespace，避免 \`MyApp.Old\` 物理上躺在 \`New/\` 下。CI 可用简单脚本抽查。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「命名空间与作用域」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第二十八章 命名空间与作用域
// 演示：传统 namespace 块、internal/public、嵌套命名空间、using 别名、同名类型消歧
// 适用：.NET 8 / C# 12 顶级语句文件本身位于全局命名空间，不能再写 file-scoped namespace
// 版本：file-scoped namespace（C# 10）本文件故意不用；using 别名可绑类型或命名空间
// 陷阱：internal 只挡外程序集；同程序集测试项目要 InternalsVisibleTo。别名不要跟常用类型同名
// ===========================================================

using System;

using System.Collections.Generic;

using Dict = System.Collections.Generic.Dictionary<int, string>;

using Coll = System.Collections.Generic;

// ---------- 1. 命名空间是类型全名的前缀，不是磁盘文件夹（只是约定一致） ----------
Console.WriteLine("=== 1. 命名空间基本使用 ===");

var user = new MyApp.Models.User { Id = 1, Name = "张三" };

Console.WriteLine(user);

// ---------- 2. 跨命名空间调用（同程序集 internal 可见） ----------
Console.WriteLine("\\n=== 2. 跨命名空间调用（同程序集 internal 可见）===");

var svc = new MyApp.Services.UserService();

svc.Add(new MyApp.Models.User { Id = 2, Name = "李四" });

svc.Add(new MyApp.Models.User { Id = 3, Name = "王五" });

svc.PrintAll();

// ---------- 3. public API 跨命名空间调用 ----------
Console.WriteLine("\\n=== 3. public API 跨命名空间调用 ===");

var api = new MyApp.Services.UserApi();

Console.WriteLine(api.GetInfo(2));

Console.WriteLine(api.GetInfo(99));

// ---------- 4. 嵌套命名空间 ----------
Console.WriteLine("\\n=== 4. 嵌套命名空间 ===");

MyApp.Utils.Logging.Logger.Log("这是一条日志");

Console.WriteLine($"名字 '张三' 是否合法: {MyApp.Utils.Validation.Validator.IsValidName("张三")}");

Console.WriteLine($"空名字是否合法: {MyApp.Utils.Validation.Validator.IsValidName("")}");

// ---------- 5. using 别名 ----------
Console.WriteLine("\\n=== 5. using 别名 ===");

Dict dict = new Dict();

dict[1] = "one";

dict[2] = "two";

foreach (var kv in dict) Console.WriteLine($"  {kv.Key} => {kv.Value}");

Coll.List<int> list = new Coll.List<int> { 10, 20, 30 };

Console.WriteLine($"Coll.List: {string.Join(", ", list)}");

// ---------- 6. 同名类型消歧 ----------
Console.WriteLine("\\n=== 6. 同名类型消歧 ===");

var td = new Demo.TimerDemo();

td.Show();

// ---------- 7. 类型全名与命名空间关系 ----------
Console.WriteLine("\\n=== 7. 类型全名与命名空间关系 ===");

Console.WriteLine($"User 全名: {typeof(MyApp.Models.User).FullName}");

Console.WriteLine($"UserApi 全名: {typeof(MyApp.Services.UserApi).FullName}");

Console.WriteLine($"Logger 全名: {typeof(MyApp.Utils.Logging.Logger).FullName}");

// ---------- 8. internal 可见性说明 ----------
Console.WriteLine("\\n=== 8. internal 可见性说明 ===");

Console.WriteLine("UserService 是 internal，仅当前程序集可见");

Console.WriteLine("UserApi 是 public，可被其他程序集引用");

Console.WriteLine("若要让其他程序集访问 internal，需在 csproj 加:");

Console.WriteLine("  [assembly: InternalsVisibleTo(\\"MyApp.Tests\\")]");

// ============ 类型声明（必须放在所有顶级语句之后） ============

namespace MyApp.Models
{
    // 完全限定名 = 命名空间 + 类型名；using MyApp.Models 后才能写短名 User
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public override string ToString() => $"User({Id}, {Name})";
    }
}

namespace MyApp.Services
{
    // 不写修饰符的顶层类默认 internal；同程序集可见，换个 csproj 就编译失败
    internal class UserService
    {
        private readonly List<MyApp.Models.User> _users = new();

        public void Add(MyApp.Models.User user) => _users.Add(user);

        public MyApp.Models.User? Find(int id) =>
            _users.FirstOrDefault(u => u.Id == id);

        public void PrintAll()
        {
            foreach (var u in _users) Console.WriteLine(u);
        }
    }

    // public 是跨程序集契约；内部仍可组合 internal 类型，外面看不到 UserService
    public class UserApi
    {
        private readonly UserService _svc = new();  // 同程序集：internal 对 UserApi 可见

        public string GetInfo(int id)
        {
            var u = _svc.Find(id);
            return u?.ToString() ?? $"未找到 Id={id}";
        }
    }
}

namespace MyApp.Utils
{
    namespace Logging
    {
        public static class Logger
        {
            public static void Log(string msg) => Console.WriteLine($"[LOG] {msg}");
        }
    }

    namespace Validation
    {
        public static class Validator
        {
            public static bool IsValidName(string? name)
                => !string.IsNullOrWhiteSpace(name) && name.Length <= 50;
        }
    }
}

namespace Demo
{
    using Timer1 = System.Timers.Timer;       // 两个 Timer 同名，不用别名会二义
    using Timer2 = System.Threading.Timer;    // 别名作用域只在本 namespace 块内

    public class TimerDemo
    {
        public void Show()
        {
            // System.Timers.Timer 无参可 new；Threading.Timer 必须给回调，这里只 typeof
            Timer1 t1 = new Timer1();  // System.Timers.Timer
            Console.WriteLine($"Timer1 类型: {t1.GetType().FullName}");

            Console.WriteLine($"Timer2 类型全名: {typeof(Timer2).FullName}");
        }
    }
}
`,
    lang: 'cs',
  },
];

export { chapters };
