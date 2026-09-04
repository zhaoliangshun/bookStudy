// =============================================================
// C# 从入门到精通大全（全新版）—— 第 5 批章节
// 第三部分 面向对象 下（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp4-ch23 : 第二十三章 继承
//   csharp4-ch24 : 第二十四章 多态与虚方法
//   csharp4-ch25 : 第二十五章 抽象类与接口
//   csharp4-ch26 : 第二十六章 密封类与扩展方法
//   csharp4-ch27 : 第二十七章 命名空间与作用域
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十三章：继承
  // ============================================================
  {
    id: 'csharp4-ch23',
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

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「继承」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 继承层次演示（Animal → Dog → Cat）
// 演示：base 调用基类构造、virtual/override、new 方法隐藏、ToString 重写

using System;

var dog = new Dog("旺财", 3, "中华田园犬");

var cat = new Cat("咪咪", 2, true);

Console.WriteLine($"狗的名字：{dog.Name}");

Console.WriteLine($"猫的年龄：{cat.Age}");

dog.Speak();

cat.Speak();

Animal a1 = dog;

Animal a2 = cat;

a1.Speak();

a2.Speak();

dog.Describe();

a1.Describe();

Console.WriteLine(dog);

Console.WriteLine(cat);

var dog2 = new Dog("旺财", 3, "不同品种");

Console.WriteLine($"dog.Equals(dog2) = {dog.Equals(dog2)}");

Console.WriteLine($"dog == dog2 = {dog == dog2}");

Console.WriteLine($"a1 的运行时类型：{a1.GetType().Name}");

Console.WriteLine($"a2 的运行时类型：{a2.GetType().Name}");

if (a1 is Dog d)
{
    Console.WriteLine($"a1 是 Dog，品种：{d.Breed}");
}

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Animal
{
    // 只读属性：只能在构造函数中赋值
    public string Name { get; }
    public int Age { get; protected set; }  // protected set：子类可以改

    // 基类构造函数：要求传入 name
    // 注意：一旦定义了带参构造，默认无参构造就没了
    public Animal(string name, int age)
    {
        Name = name;
        Age = age;
    }

    // virtual 方法：允许子类 override 改写
    public virtual void Speak()
    {
        Console.WriteLine($"{Name} 发出某种声音");
    }

    // 普通方法：子类不能 override（但可以 new 隐藏）
    public void Describe()
    {
        Console.WriteLine($"[Animal] 名字={Name}, 年龄={Age}");
    }

    // 重写 Object.ToString：返回有意义的字符串
    // 默认 ToString 返回类全名，毫无用处，强烈建议重写
    public override string ToString() => $"{Name}({Age}岁)";

    // 重写 Equals：按值比较 Name 和 Age
    public override bool Equals(object? obj) =>
        obj is Animal other && other.Name == Name && other.Age == Age;

    // 重写 Equals 必须重写 GetHashCode（哈希表一致性）
    public override int GetHashCode() => HashCode.Combine(Name, Age);
}

class Dog : Animal
{
    public string Breed { get; }  // 狗的品种（Dog 独有）

    // : base(...) 调用基类构造函数
    // 派生类构造函数必须先让基类完成初始化
    public Dog(string name, int age, string breed) : base(name, age)
    {
        Breed = breed;
    }

    // override：重写基类的虚方法 Speak
    // 注意签名必须与基类完全一致（包括返回类型）
    public override void Speak()
    {
        // base.Speak() 可以调用基类版本（这里不需要）
        Console.WriteLine($"{Name}（{Breed}）：汪汪汪！");
    }

    // new：隐藏基类的 Describe 方法
    // 这表示"我定义了一个全新的同名方法"，与基类的 Describe 无多态关系
    public new void Describe()
    {
        Console.WriteLine($"[Dog] 名字={Name}, 年龄={Age}, 品种={Breed}");
    }
}

class Cat : Animal
{
    public bool IsIndoor { get; }  // 是否家猫

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
    id: 'csharp4-ch24',
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

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「多态与虚方法」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 多态与策略模式演示
// 演示：virtual/override/new、运行时多态、base.Method()、策略模式

using System;

var cashier = new Cashier();

Payment p1 = new CashPayment(100m);

Payment p2 = new CardPayment(500m, "6222021234567890");

Payment p3 = new Payment(50m);

cashier.Process(p1);

cashier.Process(p2);

cashier.Process(p3);

Console.WriteLine();

Console.WriteLine("p2.Receipt() (基类引用): " + p2.Receipt());

CardPayment card = (CardPayment)p2;

Console.WriteLine("card.Receipt() (派生类引用): " + card.Receipt());

Console.WriteLine();

PaymentFactory factory = new CashFactory();

Payment created = factory.Create(200m);

Console.WriteLine($"工厂创建的类型：{created.GetType().Name}");

created.Pay();

Console.WriteLine();

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

    // virtual：允许子类 override
    public virtual void Pay()
    {
        Console.WriteLine($"支付 {Amount:C}（默认方式）");
    }

    // 普通方法：可被 new 隐藏，但不能被 override
    public string Receipt() => $"收据：{Amount:C}";
}

class CashPayment : Payment
{
    public CashPayment(decimal amount) : base(amount) { }

    public override void Pay()
    {
        // base.Pay() 调用基类版本（这里演示一下）
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
        Console.WriteLine($"支付 {Amount:C}（卡号 ...{CardNumber[^4..]}）");
        Console.WriteLine("  → 信用卡扣款成功");
    }

    // new：隐藏基类的 Receipt（与基类无关的新方法）
    public new string Receipt() => $"信用卡收据：{Amount:C}, 卡尾号 {CardNumber[^4..]}";
}

class PaymentFactory
{
    public virtual Payment Create(decimal amount) => new Payment(amount);
}

class CashFactory : PaymentFactory
{
    // override 返回 CashPayment（Payment 的子类），这是 C# 9 协变返回
    public override CashPayment Create(decimal amount) => new CashPayment(amount);
}

interface IDiscount
{
    decimal Calculate(decimal price);  // 接口方法
    string Name { get; }
}

class PercentDiscount : IDiscount
{
    private readonly decimal _percent;  // 折扣比例（0.8 = 八折）
    public PercentDiscount(decimal percent) => _percent = percent;
    public string Name => $"打{_percent * 10}折";
    public decimal Calculate(decimal price) => price * _percent;
}

class FixedDiscount : IDiscount
{
    private readonly decimal _amount;  // 立减金额
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
    // 接收基类 Payment 引用 —— 多态的核心
    public void Process(Payment payment)
    {
        Console.WriteLine($"--- 处理 {payment.GetType().Name} ---");
        payment.Pay();  // 运行时根据对象类型调用对应版本
    }

    // 接收 IDiscount 引用 —— 策略模式的核心
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
    id: 'csharp4-ch25',
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
| 字段 | 可以有 | 不能有（C# 8 前完全不行） |
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

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「抽象类与接口」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 抽象类与接口完整演示
// 演示：abstract class、abstract property、接口、默认接口方法、显式实现、is/as

using System;

var circle = new Circle(3);

var square = new Square(4);

IShape[] shapes = { circle, square };

foreach (var s in shapes)
{
    s.Draw();         // 调用各自实现
    s.Describe();     // 调用默认接口方法（IShape.Describe）
}

Console.WriteLine();

Shape[] absShapes = { circle, square };

foreach (var s in absShapes)
{
    Console.WriteLine(s);  // 调用 ToString
}

Console.WriteLine();

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
    double Area { get; }          // 接口属性
    double Perimeter { get; }
    void Draw();                  // 接口方法

    // C# 8+ 默认接口方法：实现类可以不重写也能用
    void Describe()
    {
        Console.WriteLine($"面积={Area:F2}, 周长={Perimeter:F2}");
    }
}

interface IDrawable
{
    void Draw();   // 与 IShape.Draw 同名
}

abstract class Shape
{
    public string Name { get; }                  // 普通属性
    protected Shape(string name) => Name = name; // 构造函数（抽象类可以有）

    // 抽象属性：子类必须实现
    public abstract double Area { get; }
    public abstract double Perimeter { get; }

    // 已实现的虚方法
    public override string ToString() => $"{Name}(面积={Area:F2})";
}

class Circle : Shape, IShape, IDrawable, IComparable<IShape>
{
    public double Radius { get; }

    // 调用基类构造函数
    public Circle(double radius) : base("圆形") => Radius = radius;

    // 实现抽象属性
    public override double Area => Math.PI * Radius * Radius;
    public override double Perimeter => 2 * Math.PI * Radius;

    // IShape.Draw 的实现（隐式实现）
    public void Draw() => Console.WriteLine($"画一个半径 {Radius} 的圆");

    // IDrawable.Draw 显式实现 —— 注意：与上面同名，编译器会合并？
    // 实际上隐式实现已经满足了两个接口的 Draw，这里演示显式写法
    // void IDrawable.Draw() => Console.WriteLine("[IDrawable] 画圆");

    // IComparable<IShape>：按面积排序
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
    id: 'csharp4-ch26',
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

- 默认不密封，需要时再密封（继承是常见扩展点）。
- value type（struct）天然"密封"——不能被继承。
- 库的边界类型（DTO、值对象、安全敏感类型）建议密封。

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

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「密封类与扩展方法」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 密封类与扩展方法演示
// 演示：sealed 类、sealed override、扩展方法（string/IEnumerable）、链式调用

using System;

using System.Collections.Generic;

using System.Linq;

var token = new ApiToken("abcdef123456");

Console.WriteLine(token);

Base b = new Leaf();

b.Hi();

Console.WriteLine();

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
    // sealed override：再下层不能再 override Hi
    public sealed override void Hi() => Console.WriteLine("Leaf.Hi");
}

static class StringExtensions
{
    // this string s：表示给 string 类型扩展一个方法
    public static string Repeat(this string s, int n)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));  // 注意判空
        return string.Concat(Enumerable.Repeat(s, n));
    }

    // 链式调用：返回 string，可继续接 string 的方法
    public static string Wrap(this string s, string tag) => $"<{tag}>{s}</{tag}>";

    // 模拟扩展属性：用无参方法当"属性"
    public static bool IsNullOrEmpty(this string? s) => string.IsNullOrEmpty(s);

    // 安全调用：null 也能用（本质是静态调用）
    public static int SafeLen(this string? s) => s?.Length ?? 0;

    // 转换为标题大小写
    public static string ToTitle(this string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        return char.ToUpper(s[0]) + s[1..].ToLower();
    }
}

static class EnumerableExtensions
{
    // 泛型扩展方法：给所有 IEnumerable<T> 加 Print
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

    // 链式调用：返回 IEnumerable<T>
    public static IEnumerable<T> WhereNot<T>(this IEnumerable<T> source, Func<T, bool> predicate)
    {
        foreach (var item in source)
        {
            if (!predicate(item)) yield return item;
        }
    }

    // 求和扩展（演示，实际 LINQ 已有 Sum）
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
    id: 'csharp4-ch27',
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

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「命名空间与作用域」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - 命名空间与作用域演示
// 注意：顶级语句文件本身就在全局命名空间，不能再用 file-scoped namespace
// 这里用传统 namespace + 嵌套演示

using System;

using System.Collections.Generic;

using Dict = System.Collections.Generic.Dictionary<int, string>;

using Coll = System.Collections.Generic;

Console.WriteLine("=== 1. 命名空间基本使用 ===");

var user = new MyApp.Models.User { Id = 1, Name = "张三" };

Console.WriteLine(user);

Console.WriteLine("\\n=== 2. 跨命名空间调用（同程序集 internal 可见）===");

var svc = new MyApp.Services.UserService();

svc.Add(new MyApp.Models.User { Id = 2, Name = "李四" });

svc.Add(new MyApp.Models.User { Id = 3, Name = "王五" });

svc.PrintAll();

Console.WriteLine("\\n=== 3. public API 跨命名空间调用 ===");

var api = new MyApp.Services.UserApi();

Console.WriteLine(api.GetInfo(2));

Console.WriteLine(api.GetInfo(99));

Console.WriteLine("\\n=== 4. 嵌套命名空间 ===");

MyApp.Utils.Logging.Logger.Log("这是一条日志");

Console.WriteLine($"名字 '张三' 是否合法: {MyApp.Utils.Validation.Validator.IsValidName("张三")}");

Console.WriteLine($"空名字是否合法: {MyApp.Utils.Validation.Validator.IsValidName("")}");

Console.WriteLine("\\n=== 5. using 别名 ===");

Dict dict = new Dict();

dict[1] = "one";

dict[2] = "two";

foreach (var kv in dict) Console.WriteLine($"  {kv.Key} => {kv.Value}");

Coll.List<int> list = new Coll.List<int> { 10, 20, 30 };

Console.WriteLine($"Coll.List: {string.Join(", ", list)}");

Console.WriteLine("\\n=== 6. 同名类型消歧 ===");

var td = new Demo.TimerDemo();

td.Show();

Console.WriteLine("\\n=== 7. 类型全名与命名空间关系 ===");

Console.WriteLine($"User 全名: {typeof(MyApp.Models.User).FullName}");

Console.WriteLine($"UserApi 全名: {typeof(MyApp.Services.UserApi).FullName}");

Console.WriteLine($"Logger 全名: {typeof(MyApp.Utils.Logging.Logger).FullName}");

Console.WriteLine("\\n=== 8. internal 可见性说明 ===");

Console.WriteLine("UserService 是 internal，仅当前程序集可见");

Console.WriteLine("UserApi 是 public，可被其他程序集引用");

Console.WriteLine("若要让其他程序集访问 internal，需在 csproj 加:");

Console.WriteLine("  [assembly: InternalsVisibleTo(\\"MyApp.Tests\\")]");

// ============ 类型声明（必须放在所有顶级语句之后） ============

namespace MyApp.Models
{
    // 这个类全名是 MyApp.Models.User
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public override string ToString() => $"User({Id}, {Name})";
    }
}

namespace MyApp.Services
{
    // internal 类：仅当前程序集可见（默认访问级别）
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

    // public 类：跨程序集可见
    public class UserApi
    {
        private readonly UserService _svc = new();  // 同程序集内可用 internal

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
    using Timer1 = System.Timers.Timer;       // System.Timers.Timer
    using Timer2 = System.Threading.Timer;    // System.Threading.Timer

    public class TimerDemo
    {
        public void Show()
        {
            // 用别名明确指定哪个 Timer
            Timer1 t1 = new Timer1();  // System.Timers.Timer
            Console.WriteLine($"Timer1 类型: {t1.GetType().FullName}");

            // 不创建 Timer2 实例（它需要回调参数），只演示类型存在
            Console.WriteLine($"Timer2 类型全名: {typeof(Timer2).FullName}");
        }
    }
}
`,
    lang: 'cs',
  },
];

export { chapters };
