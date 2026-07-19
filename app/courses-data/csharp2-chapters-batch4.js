// =============================================================
// C# 大全 - 第四批章节（第四部分 面向对象进阶，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp2-ch15 : 第十五章 多态：virtual 与 override
//   csharp2-ch16 : 第十六章 抽象类与接口
//   csharp2-ch17 : 第十七章 值类型与引用类型
//   csharp2-ch18 : 第十八章 枚举与结构体
//   csharp2-ch19 : 第十九章 可空类型 Nullable
//
// 风格：demo 驱动，每节可运行 C# 代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句 + 类/接口定义。
// 注意：顶级语句中类型声明（class/struct/interface/enum/record/delegate）
//       必须放在所有可执行代码之后，否则编译错误 CS8803。
//       局部函数不属于类型声明，可以放在可执行代码区域的任意位置。
// =============================================================

const chapters = [
  // ============================================================
  // 第十五章：多态：virtual 与 override
  // ============================================================
  {
    id: 'csharp2-ch15',
    group: '第四部分 面向对象进阶',
    icon: '🎭',
    title: '第十五章 多态：virtual 与 override',
    content: `## 第十五章　多态：virtual 与 override

继承解决「代码复用」，多态解决「同一调用、不同行为」。这是 OOP 最强大的特性之一。

### 一、什么是多态

**多态（Polymorphism）**：同一条方法调用，根据对象的实际类型，执行不同的实现。

\`\`\`csharp
// 父类引用指向子类对象——多态的前提
// Animal a = new Dog();
// Animal b = new Cat();
// 同样的 Say() 调用，结果不同
// a.Say();  // 汪汪
// b.Say();  // 喵喵
// （下面的 demo 中会完整定义 Animal/Dog/Cat 并演示这段代码）
\`\`\`

> 多态的威力：调用方只关心父类接口，不关心具体子类。新增子类不用改调用代码——**对扩展开放，对修改关闭**（开闭原则）。
>
> **多态原理**：C# 编译器为每个包含 virtual 方法的类创建一个**虚方法表（vtable）**，记录每个虚方法的实际实现地址。运行时通过对象的实际类型查找 vtable，动态分发到正确的重写方法。这就是为什么 override 能「替换」父类行为——它在 vtable 中覆盖了对应的函数指针。

### 二、virtual 方法

父类用 \`virtual\` 标记一个方法，表示「子类可以重写我」：

\`\`\`csharp
// ===== 可执行代码（顶级语句区域）=====
// 为什么用 virtual 而不是 new？
// virtual + override = 动态绑定：运行时根据对象「实际类型」决定调用谁（真正的多态）
// new 隐藏 = 静态绑定：编译时根据「变量声明类型」决定调用谁（不参与多态）
// 绝大多数场景你需要 virtual+override，因为你希望父类引用调用子类实现。

Animal a = new Dog { Name = "旺财" };
Animal b = new Cat { Name = "橘猫" };
a.Say();  // 旺财：汪汪！← 运行时发现实际是 Dog，调用 Dog.Say
b.Say();  // 橘猫：喵喵～← 运行时发现实际是 Cat，调用 Cat.Say

// ===== 类型声明（必须放在可执行代码之后，CS8803 规则）=====
class Animal {
    public string Name { get; set; }

    // virtual 表示这是个「可被重写」的方法
    // 不写 virtual 默认是非虚方法，子类不能 override（只能 new 隐藏）
    // 为什么设计成默认非虚？因为虚方法有性能开销（vtable 查找），
    // 且类设计者需要显式决定哪些方法允许被重写——这是「开闭原则」的体现。
    public virtual void Say() {
        Console.WriteLine($"{Name} 发出声音");
    }
}

class Dog : Animal {
    // override 重写父类的 virtual 方法
    // override 必须与父类 virtual/abstract 方法签名完全匹配（方法名、参数、返回类型）
    public override void Say() {
        Console.WriteLine($"{Name}：汪汪！");
    }
}

class Cat : Animal {
    public override void Say() {
        Console.WriteLine($"{Name}：喵喵～");
    }
}
\`\`\`

> ⭐ 多态的三个要素：① 父类方法 \`virtual\` ② 子类方法 \`override\` ③ 用父类类型变量调用。

### 三、override 重写

\`override\` 是「真正替换」父类方法——运行时根据实际对象类型调用：

\`\`\`csharp
// 关键：用父类变量接收子类对象，调用 Area() 自动分发到子类
Shape s1 = new Circle { Radius = 2 };
Shape s2 = new Rectangle { Width = 3, Height = 4 };
Console.WriteLine($"圆面积：{s1.Area():F2}");      // 12.57
Console.WriteLine($"矩形面积：{s2.Area():F2}");    // 12.00

// 这就是动态分发：s1 声明为 Shape，但实际是 Circle，
// 运行时沿着对象的类型指针找到 Circle 的 vtable，调用 Circle.Area()

class Shape {
    // virtual 提供默认实现，子类可以不重写（直接继承此默认值）
    public virtual double Area() => 0;
}

class Circle : Shape {
    public double Radius { get; set; }
    // override：完全替换父类实现
    public override double Area() => Math.PI * Radius * Radius;
}

class Rectangle : Shape {
    public double Width { get; set; }
    public double Height { get; set; }
    public override double Area() => Width * Height;
}
\`\`\`

> ⭐ \`override\` 是动态分发的。看变量声明类型没用，看的是对象实际类型。
> 父类 \`virtual\` 方法可以给出默认实现，子类可以选择是否 \`override\`。

### 四、new 隐藏方法

如果子类方法**同名**但不想重写（不想参与多态），用 \`new\` 隐藏父类方法：

\`\`\`csharp
Base b = new Derived();
b.Hello();  // Base.Hello ← 看声明类型 Base，静态绑定到 Base.Hello

Derived d = new Derived();
d.Hello();  // Derived.Hello ← 看声明类型 Derived

// ⚠️ new 隐藏是「静态绑定」——编译时根据变量声明类型决定调用谁。
// 这通常不是你想要的！为什么？因为如果用父类引用，调用的还是父类版本，
// 多态失效了。new 的典型使用场景：父类后来新增了一个同名方法，
// 子类已经有这个方法了，用 new 显式标记「这不是重写，是两个不同方法」，
// 避免编译器警告。绝大多数业务场景请用 virtual+override。

class Base {
    public virtual void Hello() => Console.WriteLine("Base.Hello");
}

class Derived : Base {
    // new 隐藏：这是个「全新方法」，跟父类没关系
    // 不会覆盖 vtable 中的 Base.Hello 条目
    public new void Hello() => Console.WriteLine("Derived.Hello");
}
\`\`\`

> ⚠️ \`new\` 隐藏是「静态绑定」——根据变量声明类型决定调用谁。这通常**不是你想要的**，绝大多数场景应该用 \`override\`。\`new\` 主要用于：父类新增了同名方法，子类不想破坏现有代码。

### 五、多态的实际价值

**多态最大的价值：解耦调用方与实现方**。

\`\`\`csharp
// 调用方只依赖父类/接口，不依赖具体子类
// 注意：PrintArea 是局部函数（不是类型声明），不需要移到代码后面。
// 局部函数在顶级语句中是「Main 方法内的方法」，不受 CS8803 约束。
void PrintArea(Shape s) {
    Console.WriteLine($"面积 = {s.Area():F2}");
}

// 不管传什么形状都能算——未来新增 Triangle 也不用改这函数
// PrintArea(new Circle { Radius = 1 });
// PrintArea(new Rectangle { Width = 2, Height = 3 });
// （Shape/Circle/Rectangle 已在前面 demo 中定义，此处展示调用方解耦思想）
\`\`\`

实际开发中多态的典型应用：
- **策略模式**：不同支付方式（支付宝/微信/银行卡）实现同一接口。
- **工厂模式**：不同产品继承同一基类。
- **事件处理**：不同事件处理器实现同一接口。
- **框架扩展点**：ASP.NET Core 的 \`IActionResult\` 有 ViewResult、JsonResult 等多种实现。

### 六、里氏替换原则简介

**里氏替换原则（LSP）**：所有引用父类的地方，必须能透明地使用子类对象替换，程序行为不变。

简单说：**子类不能让父类原本能做的事变得不能做**。

\`\`\`csharp
MakeFly(new Bird());     // 正常：飞翔

// MakeFly(new Penguin()); // 运行时抛 NotSupportedException！
// 调用方写的是 void MakeFly(Bird b)，传入 Bird 子类却崩溃了，
// 这就违反了 LSP——调用方无法预料子类会破坏父类承诺的行为。

// 局部函数
void MakeFly(Bird b) => b.Fly();

// ❌ 违反 LSP：企鹅是鸟但不会飞，重写后抛异常
class Bird {
    public virtual void Fly() => Console.WriteLine("飞翔");
}

class Penguin : Bird {
    public override void Fly() => throw new NotSupportedException("企鹅不会飞");
}
\`\`\`

正确做法：把「飞行」拆到 \`FlyingBird\` 子类，企鹅不继承它。LSP 提醒你**继承要表达"是一个"的真实关系**，不是单纯复用代码。

### 七、实战 demo：图形面积计算

\`\`\`csharp
// 综合运用：多态 + 继承 + virtual/override
// 为什么用 abstract？因为「形状」本身是个抽象概念，计算不出面积，
// 必须由具体子类（圆、矩形、三角形）实现。abstract 强制子类必须实现，
// 比 virtual 更严格——virtual 可以不重写（用默认值），abstract 必须重写。

Shape[] shapes = {
    new Circle(2),
    new Rectangle(3, 4),
    new Triangle(5, 6)
};

double total = 0;
foreach (var s in shapes) {
    s.Print();           // 多态调用：运行时根据实际类型分发
    total += s.Area();   // Triangle.Print 重写了，Circle/Rectangle 用基类 Print
}
Console.WriteLine($"总面积：{total:F2}");

abstract class Shape {
    public string Name { get; set; } = "";
    public abstract double Area();   // 抽象方法：子类必须 override，没有方法体
    public virtual void Print() => Console.WriteLine($"{Name} 面积 = {Area():F2}");
}

class Circle : Shape {
    public double Radius { get; set; }
    public Circle(double r) { Name = "圆形"; Radius = r; }
    public override double Area() => Math.PI * Radius * Radius;
}

class Rectangle : Shape {
    public double W { get; set; }
    public double H { get; set; }
    public Rectangle(double w, double h) { Name = "矩形"; W = w; H = h; }
    public override double Area() => W * H;
}

class Triangle : Shape {
    public double Base { get; set; }
    public double Height { get; set; }
    public Triangle(double b, double h) { Name = "三角形"; Base = b; Height = h; }
    public override double Area() => 0.5 * Base * Height;
    // 重写 Print 加点额外信息——Triangle 特有输出
    public override void Print() => Console.WriteLine($"△ {Name} 底{Base} 高{Height} → 面积 {Area():F2}");
}
\`\`\`

### 八、实战 demo：动物叫声

\`\`\`csharp
// 多态：调用方完全不关心具体动物类型
// MakeSound 只依赖 Animal 父类，传任何 Animal 子类都能工作——开闭原则
MakeSound(new Dog("旺财"));
MakeSound(new Cat("橘猫"));
MakeSound(new Duck("唐老鸭"));

// 局部函数
void MakeSound(Animal a) => a.Speak();

class Animal {
    public string Name { get; set; }
    public Animal(string name) => Name = name;
    // virtual 给默认实现（省略号），子类可以 override 替换
    public virtual void Speak() => Console.WriteLine($"{Name}：...");
}

class Dog : Animal {
    public Dog(string name) : base(name) { }
    public override void Speak() => Console.WriteLine($"{Name}：汪汪汪！");
}

class Cat : Animal {
    public Cat(string name) : base(name) { }
    public override void Speak() => Console.WriteLine($"{Name}：喵～");
}

class Duck : Animal {
    public Duck(string name) : base(name) { }
    public override void Speak() => Console.WriteLine($"{Name}：嘎嘎嘎！");
}
\`\`\`

### 九、小结

- 多态 = 同一调用，不同行为。前提是父类 \`virtual\` + 子类 \`override\` + 父类引用。
- 多态原理：虚方法表（vtable）动态分发，运行时根据对象实际类型查找方法。
- \`override\` 是动态绑定（看实际类型），\`new\` 是静态绑定（看声明类型）。**优先 \`override\`**。
- 多态的价值：调用方解耦实现方，新增子类不改调用代码（开闭原则）。
- 里氏替换原则：子类必须能完整替代父类，不要破坏父类承诺的行为。
- 实战模式：策略模式、工厂模式、事件处理都依赖多态。`,
  },

  // ============================================================
  // 第十六章：抽象类与接口
  // ============================================================
  {
    id: 'csharp2-ch16',
    group: '第四部分 面向对象进阶',
    icon: '📐',
    title: '第十六章 抽象类与接口',
    content: `## 第十六章　抽象类与接口

继承到一定程度会遇到「这个方法父类没法实现，必须让子类自己写」——这就需要抽象类和接口。

### 一、abstract 抽象类

\`abstract class\` 不能被实例化，只能被继承。它表达「这是一个不完整的概念」：

\`\`\`csharp
// 抽象类不能直接 new
// Animal a = new Animal(); // ❌ 编译错误：无法创建抽象类的实例

// ✅ 只能通过子类实例化
Animal dog = new Dog { Name = "旺财" };
dog.Sleep();    // 旺财 在睡觉（继承的普通方法，可直接用）
dog.Speak();    // 旺财：汪汪！（调用子类 override 的抽象方法）

abstract class Animal {
    public string Name { get; set; } = "";

    // 普通方法：抽象类可以有实现，子类直接继承复用
    public void Sleep() => Console.WriteLine($"{Name} 在睡觉");

    // 抽象方法：没有方法体（连 {} 都不能有），非抽象子类必须 override
    // 为什么要有抽象方法？因为「动物怎么叫」这个行为 Animal 无法给出通用实现，
    // 但又要求所有动物都必须「能叫」——抽象方法就是强制子类实现的契约。
    public abstract void Speak();
}

class Dog : Animal {
    public override void Speak() => Console.WriteLine($"{Name}：汪汪！");
}
\`\`\`

> 抽象类适合：**有共同成员、有部分实现可以复用，但有些行为必须由子类各自实现**。

### 二、abstract 抽象方法

\`abstract\` 方法只有签名没有实现，**非抽象子类必须 override**：

\`\`\`csharp
var shapes = new Shape[] { new Circle(2), new Square(3) };
foreach (var s in shapes) s.Print();
// 圆：面积=12.57，周长=12.57
// 正方形：面积=9.00，周长=12.00

// 注意 Print() 是普通方法，它调用了 Area() 和 Perimeter() 两个抽象方法。
// 这就是「模板方法模式」：父类定义算法骨架（Print），子类填充具体步骤（Area/Perimeter）。
// Print 内调用的 Area() 多态分发到子类实现——多态在抽象类中同样生效。

abstract class Shape {
    public string Name { get; set; } = "";
    // 抽象方法：子类必须实现，不实现就不能实例化（子类也必须声明为 abstract）
    public abstract double Area();
    public abstract double Perimeter();

    // 普通方法可以调用抽象方法（多态生效）
    public void Print() => Console.WriteLine($"{Name}：面积={Area():F2}，周长={Perimeter():F2}");
}

class Circle : Shape {
    public double Radius { get; set; }
    public Circle(double r) { Name = "圆"; Radius = r; }
    public override double Area() => Math.PI * Radius * Radius;
    public override double Perimeter() => 2 * Math.PI * Radius;
}

class Square : Shape {
    public double Side { get; set; }
    public Square(double s) { Name = "正方形"; Side = s; }
    public override double Area() => Side * Side;
    public override double Perimeter() => 4 * Side;
}
\`\`\`

> ⭐ 抽象方法相当于「**强制子类实现的契约**」，比 \`virtual\` 更严格——\`virtual\` 可以不重写，\`abstract\` 必须重写。

### 三、interface 接口定义

接口是**纯契约**：只定义方法/属性签名，不包含实现（C# 8 之前）。

\`\`\`csharp
// 接口命名约定：I 开头（IShape, IComparable, IDisposable...）
// 接口只定义「能做什么」，不定义「怎么做」。
// 接口成员默认 public abstract，不能写访问修饰符（C# 8 之前）。
// 接口不能有字段、不能有实例构造函数。

interface IShape {
    double Area();          // 无需写 public abstract，编译器自动加上
    double Perimeter();
}
\`\`\`

> 接口成员默认就是 \`public\` 且 \`abstract\`，不能写访问修饰符（C# 8 之前）。接口不能有字段、不能有构造函数。

### 四、接口实现

类用 \`:\` 实现接口，必须实现所有成员：

\`\`\`csharp
// 用接口类型变量接收——「面向接口编程」
IShape s = new Circle { Radius = 2 };
Console.WriteLine($"面积：{s.Area():F2}");  // 12.57
// s.Radius = 5;  // ❌ 编译错误：IShape 没有 Radius 属性，接口变量只能看到接口成员

// 为什么用接口变量？因为它强制你只依赖契约，不依赖具体实现，
// 切换实现类（比如 Circle 换成 Square）时调用代码不用改——这就是「依赖倒置原则」。

interface IShape {
    double Area();
    double Perimeter();
}

class Circle : IShape {
    public double Radius { get; set; }
    public Circle(double r) => Radius = r;
    // 实现接口方法：必须 public（接口成员都是 public 的）
    public double Area() => Math.PI * Radius * Radius;
    public double Perimeter() => 2 * Math.PI * Radius;
}
\`\`\`

> ⭐ 接口变量只能调用接口声明的方法，看不到类的其他成员。这就是「面向接口编程」——降低耦合。

### 五、接口多实现 ⭐

C# 类**只能单继承**（一个父类），但可以**实现多个接口**——这是接口最大的优势：

\`\`\`csharp
var img = new Image { Width = 100, Height = 50 };

// 不同接口视角看同一对象——一个对象可以扮演多种「角色」
IDrawable d = img;
d.Draw();          // 绘制 100x50 图片

IResizable r = img;
r.Resize(2);       // 放大 2 倍
d.Draw();          // 绘制 200x100 图片 ← Resize 改了同一对象

Console.WriteLine($"比较结果：{img.CompareTo(new Image { Width = 50, Height = 30 })}");  // 正数（img 大）

// 为什么不用抽象类做多实现？
// 因为 C# 不支持多继承（一个类只能有一个父类），这是为了避免「菱形继承」的复杂性。
// 但接口只有方法签名（没有状态/字段），多实现不会有菱形问题——
// 接口只规定「要做什么」，不关心「怎么做」，冲突时由实现类解决。

interface IDrawable {
    void Draw();
}

interface IResizable {
    void Resize(double factor);
}

// 注意：使用 .NET 内置的 System.IComparable<T>，不自定义同名接口避免冲突
class Image : IDrawable, IResizable, IComparable<Image> {
    public int Width { get; set; }
    public int Height { get; set; }

    public void Draw() => Console.WriteLine($"绘制 {Width}x{Height} 图片");
    public void Resize(double f) { Width = (int)(Width * f); Height = (int)(Height * f); }
    public int CompareTo(Image? other) => other == null ? 1 : (Width * Height).CompareTo(other.Width * other.Height);
}
\`\`\`

> ⭐ 多实现是 C# 解决「单继承限制」的关键。一个对象可以是多种「角色」（IDrawable、IResizable...）。

### 六、默认接口方法（C# 8+）

C# 8 起接口可以提供默认实现，不破坏旧代码：

\`\`\`csharp
var logger = new ConsoleLogger();
logger.Log("普通日志");
logger.LogError("出错了");  // 调用默认实现——ConsoleLogger 没有自己写 LogError
logger.LogInfo("提示信息"); // 同样调用默认实现

// 默认接口方法解决的问题：接口演化。
// 比如 ILogger 最初只有 Log()，后来想加 LogError()/LogInfo()，
// 如果没有默认实现，所有已有的实现类（ConsoleLogger、FileLogger...）都必须改，
// 这违反开闭原则。有了默认实现，旧实现类不用改就能用新方法。

interface ILogger {
    void Log(string msg);

    // 默认实现：实现类不重写就用这个
    void LogError(string msg) => Log($"[ERROR] {msg}");
    void LogInfo(string msg) => Log($"[INFO] {msg}");
}

class ConsoleLogger : ILogger {
    // 只实现 Log，其他两个用默认实现
    public void Log(string msg) => Console.WriteLine(msg);
}
\`\`\`

> 默认接口方法主要用于**接口扩展不破坏兼容**：给老接口加新方法，旧实现类不用改。

### 七、抽象类 vs 接口选择 ⭐

| 维度 | 抽象类 abstract class | 接口 interface |
| --- | --- | --- |
| 继承 | 单继承（只能一个父类） | 多实现（可多个接口） |
| 字段 | ✅ 可有（实例状态） | ❌ 不能有实例字段 |
| 构造函数 | ✅ 有 | ❌ 没有 |
| 方法实现 | ✅ 可有抽象+普通方法 | 默认接口方法（C# 8+） |
| 访问修饰符 | 任意 | 默认 public（C# 8+ 可有其他） |
| 表达关系 | **"是一个"**（is-a） | **"能做"**（can-do） |

**选择原则——为什么用抽象类？什么时候用接口？**

- 🟢 **用抽象类的场景**：多个实现类之间**有共享的状态（字段）**或**有大量共用的实现代码**，需要通过构造函数初始化共同状态。例如：LoggerBase 有 \`_path\` 字段和通用格式化逻辑，FileLogger 和 ConsoleLogger 继承复用。
- 🟢 **用接口的场景**：只定义**行为契约**，不需要共享状态；一个类需要**扮演多种角色**（多实现）；跨继承层次的能力定义。例如：IComparable 定义「可比较」能力，不管什么类型都可以实现。
- 💡 **不确定时优先接口**——更灵活，不占用唯一的继承名额。需要共享代码时可以配一个抽象基类实现接口（如 LoggerBase : ILogger）。

### 八、IShape / IComparable 实例

\`\`\`csharp
var rects = new List<Rectangle> {
    new Rectangle { Width = 3, Height = 4 },  // 面积 12
    new Rectangle { Width = 2, Height = 5 },  // 面积 10
    new Rectangle { Width = 1, Height = 10 }  // 面积 10
};

// List.Sort() 依赖 IComparable<T>——实现了它就能排序
// Sort 内部通过 CompareTo 返回值（负数/0/正数）判断大小关系
rects.Sort();

foreach (var r in rects) {
    Console.WriteLine($"面积 {r.Area():F2}");
}

// IShape：经典几何接口
interface IShape {
    double Area();
    double Perimeter();
}

// Rectangle 同时实现两个接口——既是形状（可计算面积周长），又是可比较的（可排序）
class Rectangle : IShape, IComparable<Rectangle> {
    public double Width { get; set; }
    public double Height { get; set; }

    public double Area() => Width * Height;
    public double Perimeter() => 2 * (Width + Height);

    // 按面积比较，用于排序
    public int CompareTo(Rectangle? other) => other == null ? 1 : Area().CompareTo(other.Area());
}
\`\`\`

> ⭐ \`IComparable<T>\` 是 .NET 排序的基础。实现了它，你的类就能放进 \`List<T>.Sort()\`、\`OrderBy\` 等。
> 注意使用 \`IComparable<T>\`（来自 System 命名空间），不是自定义接口，这是 .NET 标准约定。

### 九、实战 demo：日志系统

\`\`\`csharp
// 综合运用：接口 + 抽象类 + 多态
// 设计思路：
// 1. ILogger 定义「日志能做什么」（接口 = 契约）
// 2. LoggerBase 复用通用逻辑（抽象类 = 模板），格式化日志前缀 [LEVEL]
// 3. ConsoleLogger/FileLogger 只实现 Write 这一个差异点（具体实现）
// 这是典型的「接口 + 抽象基类」组合：接口对外暴露契约，抽象类做模板方法复用。

DoWork(new ConsoleLogger());
DoWork(new FileLogger("app.log"));

void DoWork(ILogger logger) {
    // 调用方只依赖 ILogger 接口，完全不知道也不关心是控制台还是文件
    logger.Info("开始处理");
    logger.Error("发生异常");
    // 将来新增 DatabaseLogger、ElasticsearchLogger 都不用改 DoWork
}

interface ILogger {
    void Log(string level, string msg);
    void Info(string msg) => Log("INFO", msg);     // 默认实现
    void Error(string msg) => Log("ERROR", msg);
}

abstract class LoggerBase : ILogger {
    // 为什么 Write 是 protected abstract？
    // 因为「写往哪里」是子类的差异点（控制台/文件/数据库），
    // 但日志格式化（[LEVEL] 前缀）是通用逻辑——放在基类 Log 方法中复用。
    // protected 表示只有子类能看到 Write，外部调用者只看到 ILogger 的 Info/Error/Log。
    protected abstract void Write(string text);
    public void Log(string level, string msg) => Write($"[{level}] {msg}");
}

class ConsoleLogger : LoggerBase {
    protected override void Write(string text) => Console.WriteLine(text);
}

class FileLogger : LoggerBase {
    private readonly string _path;
    public FileLogger(string path) => _path = path;
    protected override void Write(string text) {
        // 真实场景用 File.AppendAllText
        Console.WriteLine($"[写入 {_path}] {text}");
    }
}
\`\`\`

### 十、小结

- 抽象类 \`abstract class\` 不能实例化，可有字段、构造、普通方法+抽象方法。
- 抽象方法 \`abstract\` 非抽象子类必须 \`override\` 实现。
- 接口 \`interface\` 是纯契约，C# 8+ 支持默认方法用于接口演化。
- 类可单继承父类+多实现接口——接口是 C# 解决单继承限制的关键。
- **选择**：有共享字段/构造逻辑/复用代码用抽象类（is-a），纯行为契约/多角色用接口（can-do）。
- \`IComparable<T>\` 是 .NET 内置排序接口，实现它就能用 \`Sort\`/OrderBy。
- 组合模式：接口对外暴露契约 + 抽象基类做模板复用 = 灵活又不失复用。`,
  },

  // ============================================================
  // 第十七章：值类型与引用类型
  // ============================================================
  {
    id: 'csharp2-ch17',
    group: '第四部分 面向对象进阶',
    icon: '⚖️',
    title: '第十七章 值类型与引用类型',
    content: `## 第十七章　值类型与引用类型

这是 C# 最容易踩坑的概念之一。理解了值类型 vs 引用类型，调试内存相关 bug 会轻松很多。

### 一、栈 vs 堆

内存分两块：

- **栈（Stack）**：自动分配释放，速度快，空间小（通常 1MB~4MB）。存方法调用帧、局部变量。方法返回时栈帧自动弹出，无需 GC 干预。
- **堆（Heap）**：由 CLR/GC 管理，空间大。存引用类型对象实例，需要垃圾回收。

| 类型 | 存哪 | 内容 | 回收时机 |
| --- | --- | --- | --- |
| **值类型** | 栈（局部变量） | 数据本身 | 方法结束自动释放 |
| **引用类型** | 栈存引用（地址），堆存数据 | 数据的地址 | GC 回收 |

### 二、值类型：传值拷贝

**值类型**包括：所有数值类型（int/double/bool/char/decimal）、结构体 \`struct\`、枚举 \`enum\`。

赋值时**复制数据**，互不影响：

\`\`\`csharp
// ===== 可执行代码（顶级语句）=====
// int 是值类型，赋值 = 拷贝数据
int a = 10;
int b = a;   // 将 a 的值 10 复制一份给 b，a 和 b 是两个独立的存储位置
b = 99;
Console.WriteLine($"a={a}, b={b}");  // a=10, b=99 ← a 没变，因为改的是副本

// struct 也是值类型——赋值时逐字段复制
Point p1 = new Point { X = 1, Y = 2 };
Point p2 = p1;   // 将 p1 的 X=1, Y=2 复制一份给 p2
p2.X = 999;      // 只改 p2 的副本
Console.WriteLine($"p1.X={p1.X}, p2.X={p2.X}");  // p1.X=1, p2.X=999

// 内存视角：p1 和 p2 在栈上各占 8 字节（两个 int），互不干扰。
// 这和你复印一份文件类似——改复印件不影响原件。

// ===== 类型声明（放在可执行代码之后）=====
struct Point {
    public int X, Y;
}
\`\`\`

> ⭐ 值类型赋值 = 拷贝。修改副本不影响原件。这是理解值类型的「一句话」。
> 值类型变量直接包含数据，没有额外的堆分配和 GC 压力——性能更好。

### 三、引用类型：传引用

**引用类型**包括：类 \`class\`、数组 \`[]\`、字符串 \`string\`（特殊）、接口、委托。

赋值时**复制引用**（地址），两个变量指向同一对象：

\`\`\`csharp
Person p1 = new Person { Name = "张三", Age = 25 };
Person p2 = p1;   // 复制的是「引用」（堆上对象的地址），p1 和 p2 指向同一个 Person 对象
p2.Name = "李四"; // 改的是堆上那个对象，p1 看到的也是它

Console.WriteLine($"p1.Name={p1.Name}");  // 李四 ← 改了 p2 影响了 p1
Console.WriteLine(ReferenceEquals(p1, p2));  // True ← 确认为同一对象

// 内存视角：栈上 p1 和 p2 各存一个地址（8 字节），都指向堆上同一个 Person 实例。
// 类似你给房子配了两把钥匙——用其中一把开门换了家具，另一把钥匙开门看到同样的变化。

class Person {
    public string Name { get; set; } = "";
    public int Age { get; set; }
}
\`\`\`

> ⭐ 引用类型赋值 = 复制地址。两个变量指向同一对象，改一个都看到。

**数组也是引用类型**：

\`\`\`csharp
int[] arr1 = { 1, 2, 3 };
int[] arr2 = arr1;   // 复制引用，指向同一数组
arr2[0] = 999;
Console.WriteLine(arr1[0]);  // 999 ← arr1 也被改了

// 想真正独立复制数组（深拷贝/浅拷贝）
int[] copy = (int[])arr1.Clone();
copy[0] = 0;
Console.WriteLine(arr1[0]);  // 999 ← arr1 不受影响
\`\`\`

### 四、ref / out 传递

默认值类型按值传递（方法内修改不影响外面）。用 \`ref\` / \`out\` 强制按引用传：

\`\`\`csharp
// ref：传入前必须已赋值，方法内可改可不改
// 为什么用 ref？大值类型（如很大的 struct）按值传会产生拷贝开销，ref 只传地址（8字节）；
// 或者需要方法修改外部变量。
int x = 10;
Double(ref x);
Console.WriteLine(x);  // 20 ← 改了外面

// out：传入前不需要赋值，方法内必须赋值（编译器保证）
// 为什么用 out？一个方法需要返回多个值的经典模式——bool 表示成功，out 输出结果。
// TryParse、Dictionary.TryGetValue 都是这个模式。
if (TryParseInt("42", out int num)) {
    Console.WriteLine($"解析成功：{num}");  // 42
}

// in：只读引用传入（避免值类型大对象复制开销，但方法内不能修改）
Point origin = new Point { X = 0, Y = 0 };
Print(origin);  // (0, 0)

void Double(ref int n) => n *= 2;

bool TryParseInt(string s, out int result) {
    if (int.TryParse(s, out result)) return true;
    result = 0;
    return false;
}

void Print(in Point p) => Console.WriteLine($"({p.X}, {p.Y})");

struct Point {
    public int X, Y;
}
\`\`\`

> ⭐ \`out\` 最常见的用途：\`TryParse\`、\`Dictionary.TryGetValue\`——返回 bool 表示成功，同时输出值。
> \`in\` 适合大的 readonly struct，避免拷贝同时保证不被修改。

### 五、装箱拆箱

**装箱（Boxing）**：值类型 → object/接口，复制到堆上并包装。
**拆箱（Unboxing）**：object → 值类型，从堆拷回栈，需要显式类型转换。

\`\`\`csharp
using System.Collections;  // ArrayList 需要此命名空间（不在隐式 using 中）

int n = 42;
object box = n;       // 装箱：在堆上分配一个对象，把 42 复制进去，栈上存对象引用
int m = (int)box;    // 拆箱：类型检查 + 从堆复制回栈

Console.WriteLine(box);  // 42
Console.WriteLine(m);    // 42

// 装箱的代价：① 堆内存分配 ② GC 压力 ③ 类型检查开销
// 频繁装箱是性能陷阱——比如循环中百万次装箱会产生大量堆垃圾。

ArrayList list = new ArrayList();  // 旧式非泛型集合，存 object
list.Add(1);   // int → object，装箱！
list.Add(2);   // 装箱！
list.Add(3);   // 装箱！
// 每次添加都创建堆对象——性能差，类型不安全（取出时需要强转）

// ✅ 泛型集合不装箱 ⭐
List<int> nums = new() { 1, 2, 3 };  // 直接存 int，栈上/数组中无装箱
// List<int> 内部用 int[] 存储，没有 object 包装——零装箱，类型安全
\`\`\`

> ⭐ **避免频繁装箱**。用泛型集合 \`List<int>\` 替代 \`ArrayList\`，用 \`Dictionary<int, T>\` 替代 \`Hashtable\`。
> 这也是为什么 .NET 2.0 引入泛型后，非泛型集合（ArrayList、Hashtable）基本被淘汰。

### 六、内存示意图

值类型变量直接存数据，引用类型变量存地址：

\`\`\`
栈                        堆
┌─────────────┐
│ int a = 10  │            （无，值类型直接在栈上）
└─────────────┘

┌─────────────┐         ┌─────────────────┐
│ Person p1   │ ──────►  │ Person 对象     │
│ (引用地址)  │          │ Name="张三"     │
└─────────────┘          │ Age=25          │
┌─────────────┐          └─────────────────┘
│ Person p2   │ ──────┘   ↑ p1 和 p2 指向同一对象
│ (引用地址)  │
└─────────────┘

struct 赋值时：
┌─────────────┐
│ Point p1    │  (1, 2)     ← 栈上独立内存
└─────────────┘
┌─────────────┐
│ Point p2    │  (1, 2)     ← p2 = p1 复制后独立
└─────────────┘
\`\`\`

### 七、string 是特殊的引用类型

\`string\` 是引用类型，但**不可变**（immutable），表现常被误认为值类型：

\`\`\`csharp
string s1 = "abc";
string s2 = s1;    // 复制引用，s1 和 s2 指向同一个 "abc" 对象
s2 = "xyz";        // 不是修改原对象！而是让 s2 指向一个新的 string 对象 "xyz"
Console.WriteLine(s1);  // abc ← s1 仍然指向原来的 "abc"，没变

// string 的 == 被重写为「值比较」（比较内容），而不是引用比较
string a = "hello", b = "hello";
Console.WriteLine(a == b);               // True ← 内容相同
Console.WriteLine(ReferenceEquals(a, b)); // True（字符串驻留优化，可能是同一实例）
// 注意：ReferenceEquals 不一定总是 True（动态拼接的字符串可能不在驻留池中），
// 但 == 比较内容始终正确。

// 为什么 string 设计为不可变？
// 1. 线程安全：不可变对象多线程访问无需加锁
// 2. 字符串驻留（interning）：相同内容共享同一实例，节省内存
// 3. 安全：字符串作为参数传递不用担心被意外修改（如文件路径、SQL等）
// 代价：每次 "修改" 字符串实际创建新对象，大量拼接用 StringBuilder 避免反复分配。
\`\`\`

> \`string\` 不可变是为了线程安全、字符串驻留优化和安全性。修改字符串实际是创建新对象。频繁拼接请用 \`StringBuilder\`。

### 八、何时用 struct

\`struct\` 是值类型的「轻量类」。适合**小型、不可变、逻辑上是值**的数据：

✅ 适合 struct：
- 几何点 \`Point\`、颜色 \`Color\`、复数、坐标、金额（Money）。
- 小于 16 字节（拷贝成本低）。
- 不可变（\`readonly struct\`）——值语义：赋值就是拷贝，不应该可变。
- 不需要继承（struct 隐式密封，不能被继承）。

❌ 不适合 struct：
- 大对象（>16 字节）——赋值复制开销大，甚至比引用类型还慢。
- 需要继承多态（struct 不能被继承，也不能继承类，只能实现接口）。
- 需要被多个引用共享修改（值类型赋值是拷贝，改副本不影响原件）。
- 频繁装箱场景（如放进非泛型集合）。

\`\`\`csharp
// 经典值类型用法：金额 Money
// 为什么用 decimal 而不是 double 存金额？
// double 是二进制浮点数，0.1 在二进制中是无限循环小数，无法精确表示。
// 0.1 + 0.2 在 double 中 = 0.30000000000000004，金额计算会出大问题！
// decimal 是 128 位高精度十进制浮点数，专为金融/货币设计，精确表示十进制小数。
// 原则：金额、利率、税率等需要精确十进制计算的场景，一律用 decimal，不用 double/float。

Money m1 = new(100.00m, "CNY");
Money m2 = new(50.00m, "CNY");
Money m3 = m1.Add(m2);
Console.WriteLine(m3);  // 150.00 CNY

readonly struct Money {
    public decimal Amount { get; }
    public string Currency { get; }
    public Money(decimal amount, string currency) {
        Amount = amount;
        Currency = currency;
    }
    public Money Add(Money other) {
        if (Currency != other.Currency) throw new ArgumentException("币种不同，无法相加");
        return new Money(Amount + other.Amount, Currency);
    }
    public override string ToString() => $"{Amount:F2} {Currency}";
}
\`\`\`

### 九、实战 demo：值 vs 引用对比

\`\`\`csharp
// struct（值类型）vs class（引用类型）行为对比
PointS s1 = new PointS { X = 1, Y = 2 };
PointS s2 = s1;     // 值类型：复制整个数据（8 字节拷贝）
s2.X = 999;
Console.WriteLine($"struct: s1.X={s1.X}");  // 1 ← 不影响 s1

PointC c1 = new PointC { X = 1, Y = 2 };
PointC c2 = c1;     // 引用类型：复制引用（8 字节地址拷贝），指向同一对象
c2.X = 999;
Console.WriteLine($"class:  c1.X={c1.X}");  // 999 ← c1 和 c2 指向同一对象

// 方法参数：值类型默认按值传递（拷贝）
int num = 1;
Modify(num);       // 传递 num 的副本
Console.WriteLine($"int 默认传值：{num}");  // 1 ← 不影响外部

ModifyRef(ref num);  // 传递 num 的地址（引用）
Console.WriteLine($"int ref 传引用：{num}");  // 999 ← 影响外部

// 引用类型默认也是「按值传递引用」——传递的是引用的副本
// 但副本和原件指向同一对象，所以修改对象内容会生效
Person person = new() { Name = "原名" };
ChangeName(person);
Console.WriteLine(person.Name);  // 改了 ← 对象内容被修改

void Modify(int n) => n = 999;       // n 是 num 的副本，改 n 不影响 num
void ModifyRef(ref int n) => n = 999; // n 是 num 的引用（别名），改 n 就是改 num
void ChangeName(Person p) => p.Name = "改了"; // p 是引用的副本，但指向同一堆对象

struct PointS { public int X, Y; }
class PointC { public int X, Y; }
class Person { public string Name = ""; }
\`\`\`

### 十、小结

- 值类型（int/struct/enum/bool/char/decimal）存栈上，赋值**复制数据**，方法结束自动释放。
- 引用类型（class/数组/string/接口/委托）栈上存引用、堆上存数据，赋值**复制地址**，GC 回收。
- \`ref\` 强制按引用传（需先赋值），\`out\` 输出参数（方法内必须赋值），\`in\` 只读引用（避免大 struct 拷贝）。
- 装箱（值类型→object）有堆分配+GC 开销，用**泛型集合**避免。
- \`string\` 是引用类型但**不可变**（immutable），== 比较内容，频繁拼接用 StringBuilder。
- **金额用 decimal，不用 double**——double 二进制浮点精度丢失，decimal 精确十进制。
- struct 适合：小型（<16字节）、不可变、值语义的数据（Point、Color、Money、DateTime）。
- 值类型性能优势：无堆分配、无 GC 压力、缓存友好（数据紧凑在栈上）。`,
  },

  // ============================================================
  // 第十八章：枚举与结构体
  // ============================================================
  {
    id: 'csharp2-ch18',
    group: '第四部分 面向对象进阶',
    icon: '🔢',
    title: '第十八章 枚举与结构体',
    content: `## 第十八章　枚举与结构体

枚举和结构体都是值类型，但用途完全不同：枚举定义「有限的命名常量」，结构体定义「轻量数据容器」。

### 一、enum 定义使用

\`enum\` 是一组命名常量，让代码可读性大增——为什么不用数字或字符串？

1. **类型安全**：编译器检查，不能传错值（比 int 状态码安全）
2. **可读性**：\`Color.Red\` 比 \`0\` 清晰10倍
3. **IDE友好**：自动补全、重构重命名一处改全
4. **可维护**：加新成员只需改 enum 定义

\`\`\`csharp
// 为什么不用 const int Red = 0, Green = 1...？
// 因为 const int 没有类型边界——任何 int 都能传进来（传 999 也不报错），
// enum 是真正的类型，方法参数声明为 Color 就只能传 Color 成员。

Color c = Color.Green;
Console.WriteLine(c);  // Green ← ToString() 输出名字，不是数字

// 比较用 == 即可，比整数比较语义清晰
if (c == Color.Red) Console.WriteLine("红色");
else if (c == Color.Green) Console.WriteLine("绿色");

// switch 配合 enum 最舒服——编译器会提醒你是否覆盖了所有值
WeekDay today = WeekDay.Fri;
string mood = today switch {
    WeekDay.Mon => "周一困",
    WeekDay.Fri => "周五嗨",
    WeekDay.Sat or WeekDay.Sun => "周末躺",
    _ => "工作日"
};
Console.WriteLine(mood);  // 周五嗨

// 注意：枚举值默认从 0 开始递增，可以手动指定数值（如 HTTP 状态码）
enum Color { Red, Green, Blue }            // 默认 int，从 0 开始：Red=0, Green=1, Blue=2
enum WeekDay { Mon, Tue, Wed, Thu, Fri, Sat, Sun }  // 不用 DayOfWeek 避免和 System.DayOfWeek 冲突
enum HttpStatus {
    Ok = 200,
    NotFound = 404,
    ServerError = 500
}
\`\`\`

> ⭐ enum 配合 switch 是最经典用法，编译器会提醒你是否覆盖所有值。比裸用 \`int\` 状态码可读性强 10 倍。

### 二、Flags 特性 ⭐

普通 enum 一个变量只能取一个值。加 \`[Flags]\` 后可以做位运算，组合多个值：

\`\`\`csharp
// [Flags] 标记告诉编译器和调试器：这个 enum 支持位运算组合
// 值必须是 2 的幂（1, 2, 4, 8, 16, 32...），因为每个 bit 位代表一个开关。
// 这就是「位掩码」——用一个整数的不同二进制位表示多个布尔选项，
// 比 List<Permission> 高效得多（一个 int 就能存 32 个权限）。

Permission p = Permission.Read | Permission.Write;  // 按位 OR 组合
Console.WriteLine(p);  // Read, Write ← [Flags] 让 ToString() 自动拼接显示

// 按位 AND 判断是否包含某权限
if ((p & Permission.Read) != 0) Console.WriteLine("有读权限");
if ((p & Permission.Execute) == 0) Console.WriteLine("无执行权限");

// HasFlag 方法更直观（C# 4+），等价于 (p & flag) != 0
if (p.HasFlag(Permission.Write)) Console.WriteLine("有写权限");

// 移除权限：AND ~
p &= ~Permission.Write;
Console.WriteLine(p);  // Read

// 切换权限：XOR
p ^= Permission.Execute;  // 如果有就移除，没有就加上
Console.WriteLine(p);  // Read, Execute

[Flags]
enum Permission {
    None    = 0,         // 0 表示无权限（必须有，所有位都是 0）
    Read    = 1 << 0,    // 1  = 0001
    Write   = 1 << 1,    // 2  = 0010
    Execute = 1 << 2,    // 4  = 0100
    Delete  = 1 << 3     // 8  = 1000
    // 用 << 位移运算符比直接写 1,2,4,8 更清晰，不容易写错
}
\`\`\`

> ⭐ \`[Flags]\` 配合位运算是权限系统、选项组合的经典方案。值要按 2 的幂（用 \`1 << n\` 最清晰）。

### 三、enum 转换

enum 底层是整数，可以和数字、字符串互转：

\`\`\`csharp
HttpStatus s = HttpStatus.NotFound;

// 1. enum → int：显式强转
int code = (int)s;
Console.WriteLine(code);  // 404

// 2. int → enum：显式强转（不做范围检查！）
HttpStatus parsed = (HttpStatus)200;
Console.WriteLine(parsed);  // Ok

// ⚠️ 不存在的数字也能转成功——这是 C# enum 的一个坑
HttpStatus bad = (HttpStatus)999;
Console.WriteLine(bad);  // 999 ← 不会报错！变量值是 999，但不对应任何枚举成员
// 为什么？因为 enum 本质就是整数，CLR 不验证值是否在定义范围内（性能考虑）。
// 防护方法：用 Enum.IsDefined() 检查，或用 switch/exhaustive pattern matching 覆盖。

// 3. enum → string：ToString()
string name = s.ToString();
Console.WriteLine(name);  // NotFound

// 4. string → enum：Enum.Parse（不推荐，可能抛异常）
HttpStatus parsed2 = (HttpStatus)Enum.Parse(typeof(HttpStatus), "Ok");
Console.WriteLine(parsed2);  // Ok

// 5. TryParse（推荐，安全）——不抛异常，返回 bool
if (Enum.TryParse<HttpStatus>("NotFound", out HttpStatus result)) {
    Console.WriteLine($"解析成功：{result} ({(int)result})");
}

// 6. 遍历所有值
foreach (HttpStatus v in Enum.GetValues<HttpStatus>()) {
    Console.WriteLine($"{(int)v} - {v}");
}
// 200 - Ok
// 404 - NotFound
// 500 - ServerError

enum HttpStatus { Ok = 200, NotFound = 404, ServerError = 500 }
\`\`\`

> ⭐ 配置文件、URL 参数解析经常要把字符串转 enum——\`Enum.TryParse<T>\` 是首选。
> ⚠️ 注意 int→enum 不做范围验证，来自外部输入（API/数据库）的值务必用 \`Enum.IsDefined\` 校验。

### 四、struct 定义

\`struct\` 是值类型的「轻量类」。语法和 class 几乎一样，但行为是值类型：

\`\`\`csharp
Point p1 = new Point(0, 0);
Point p2 = new Point(3, 4);
Console.WriteLine(p1.DistanceTo(p2));  // 5（勾股定理：√(3²+4²) = 5）
Console.WriteLine(p2);  // (3, 4)

struct Point {
    public int X { get; set; }
    public int Y { get; set; }

    // struct 可以有构造函数，但必须给所有字段赋值
    // C# 10 之前 struct 不能有无参构造函数，C# 10+ 可以但要小心
    public Point(int x, int y) {
        X = x;
        Y = y;
    }

    // struct 可以有方法
    public double DistanceTo(Point other) {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public override string ToString() => $"({X}, {Y})";
}
\`\`\`

> struct 隐式密封（不能被继承），可实现接口。struct 不能有显式无参构造函数（C# 10 前），有参构造函数必须给所有字段赋值。

### 五、struct vs class ⭐

| 维度 | struct（值类型） | class（引用类型） |
| --- | --- | --- |
| 赋值 | 复制数据（拷贝整个对象） | 复制引用（拷贝地址） |
| 存储 | 栈（局部变量）或内联（作为字段） | 托管堆 |
| 继承 | 隐式 sealed，不能被继承，可实现接口 | 可单继承、多实现接口 |
| null | 不可为 null（除非 \`Nullable<T>\`） | 可为 null |
| 默认值 | \`default\`（所有字段 0/null） | null |
| 装箱 | 转换为 object/接口时装箱 | 不涉及装箱 |
| GC 压力 | 无（栈上自动管理） | 有（堆分配，需要 GC 回收） |
| 用途 | 小型不可变值（Point、Color、Money） | 大对象、需要继承、需要共享引用 |

\`\`\`csharp
PointS s1 = new() { X = 1, Y = 2 };
PointS s2 = s1;     // 值类型：复制 8 字节数据
s2.X = 999;
Console.WriteLine(s1.X);  // 1 ← 不变，s1 和 s2 是独立的

PointC c1 = new() { X = 1, Y = 2 };
PointC c2 = c1;     // 引用类型：复制 8 字节地址（指向同一堆对象）
c2.X = 999;
Console.WriteLine(c1.X);  // 999 ← 改了，c1 和 c2 指向同一对象

struct PointS { public int X, Y; }
class PointC { public int X, Y; }
\`\`\`

> ⭐ 选择原则：**小型（<16字节）、不可变、值语义（如 Point、Color、DateTime、decimal）**用 struct。需要继承、多态、共享引用、大对象用 class。

### 六、readonly struct

C# 7.2 引入 \`readonly struct\`，强制整个结构体不可变：

\`\`\`csharp
var v1 = new Vector(1, 0, 0);
var v2 = new Vector(0, 1, 0);
var sum = v1 + v2;
Console.WriteLine(sum);        // (1, 1, 0)
Console.WriteLine(sum.Length); // 1.4142...（√2）

// 为什么用 readonly struct？
// 1. 语义明确：声明这个类型是不可变的值——创建后不能修改，线程安全。
// 2. 编译器优化：避免不必要的「防御性拷贝」——编译器知道它不会变，
//    传 in 参数时不需要复制副本保护，可以直接传引用。
// 3. 防止意外修改：编译器阻止你对 readonly 字段赋值，从源头避免 bug。

readonly struct Vector {
    public double X { get; }
    public double Y { get; }
    public double Z { get; }

    public Vector(double x, double y, double z) {
        X = x; Y = y; Z = z;
    }

    // 计算属性：Length 是计算值，不是状态
    public double Length => Math.Sqrt(X * X + Y * Y + Z * Z);

    // 运算符重载：让 + 可以直接用于 Vector
    public static Vector operator +(Vector a, Vector b) =>
        new(a.X + b.X, a.Y + b.Y, a.Z + b.Z);

    public override string ToString() => $"({X}, {Y}, {Z})";
}
\`\`\`

> \`readonly struct\` 让编译器做更多优化（避免防御性拷贝），同时保证不可变语义。日常新建 struct 请默认加 \`readonly\`。

### 七、record struct（C# 10+）

\`record struct\` = struct + 自动生成相等比较 + 解构 + with 表达式：

\`\`\`csharp
var p1 = new Point(1, 2);
var p2 = new Point(1, 2);

// 自动生成值相等比较（struct 默认也有值相等，但 record struct 实现更高效、包含所有字段）
Console.WriteLine(p1 == p2);  // True ← 按值比较，X 和 Y 都相等

// with 表达式：基于原对象创建新副本，只修改指定字段
var p3 = p1 with { X = 99 };
Console.WriteLine(p3);    // Point { X = 99, Y = 2 }
Console.WriteLine(p1);    // Point { X = 1, Y = 2 } ← 原对象不变（不可变语义）

// 自动解构：可以直接拆包到变量
var (x, y) = p1;
Console.WriteLine($"{x}, {y}");  // 1, 2

// record struct vs struct 的区别：
// record struct 自动生成：构造函数、Equals、GetHashCode、ToString、==/!=、Deconstruct
// 手写这些代码量大且容易出错，record struct 一行搞定。
// 适合：DTO（数据传输对象）、VO（值对象）、API 返回模型等「数据+值语义」场景。

record struct Point(int X, int Y);
\`\`\`

> ⭐ \`record struct\` 是 C# 10 起处理小型数据的最优选择——比 struct 简洁，自带值相等、解构、with。日常 DTO/VO 直接用。

### 八、实战 demo：权限系统

\`\`\`csharp
var user = new User { Name = "张三", Perms = Permission.Read | Permission.Write };

Console.WriteLine($"{user.Name} 权限：{user.Perms}");
Console.WriteLine($"能读？{user.Can(Permission.Read)}");    // True
Console.WriteLine($"能写？{user.Can(Permission.Write)}");   // True
Console.WriteLine($"能删？{user.Can(Permission.Delete)}");  // False

// 升级权限：OR 添加
user.Perms |= Permission.Delete;
Console.WriteLine($"升级后：{user.Perms}");  // Read, Write, Delete

// 设为管理员：直接赋值组合权限
user.Perms = Permission.Admin;
Console.WriteLine($"管理员权限：{user.Perms}");  // Admin（[Flags] 自动解析命名组合）
Console.WriteLine($"能删？{user.Can(Permission.Delete)}");  // True

[Flags]
enum Permission {
    None    = 0,
    Read    = 1 << 0,
    Write   = 1 << 1,
    Delete  = 1 << 2,
    Admin   = Read | Write | Delete  // 组合权限：管理员拥有所有权限
}

class User {
    public string Name { get; set; } = "";
    public Permission Perms { get; set; }

    // HasFlag 检查是否包含指定权限
    public bool Can(Permission action) => Perms.HasFlag(action);
}
\`\`\`

### 九、实战 demo：几何点

\`\`\`csharp
Point a = new(0, 0);
Point b = new(3, 4);
Point c = a + b;  // (3, 4)

Console.WriteLine($"a + b = {c}");
Console.WriteLine($"a 到 b 距离：{a.DistanceTo(b)}");  // 5.0
Console.WriteLine($"a == new(0,0)？{a == new Point(0, 0)}");  // True
var (x, y) = c;
Console.WriteLine($"解构：x={x}, y={y}");  // 3, 4

readonly struct Point {
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y) => (X, Y) = (x, y);

    // 运算符重载：让 + 和 == 可以自然地用于 Point
    public static Point operator +(Point a, Point b) => new(a.X + b.X, a.Y + b.Y);
    public static Point operator -(Point a, Point b) => new(a.X - b.X, a.Y - b.Y);
    public static bool operator ==(Point a, Point b) => a.X == b.X && a.Y == b.Y;
    public static bool operator !=(Point a, Point b) => !(a == b);

    // 重载 == 时必须同时重载 Equals 和 GetHashCode（编译器警告）
    public override bool Equals(object? obj) => obj is Point p && this == p;
    public override int GetHashCode() => HashCode.Combine(X, Y);

    public double DistanceTo(Point other) {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    // Deconstruct 支持解构
    public void Deconstruct(out double x, out double y) => (x, y) = (X, Y);
    public override string ToString() => $"({X}, {Y})";
}
\`\`\`

### 十、小结

- enum 是命名整数常量集合，比魔数（magic number）类型安全、可读性强。
- \`[Flags]\` + 位运算（\`|\` 组合、\`&\` 判断、\`~\` 移除、\`^\` 切换）做权限/选项组合，值用 \`1 << n\`。
- \`Enum.TryParse<T>\` 字符串转 enum 首选，int 转 enum 注意用 \`IsDefined\` 校验。
- struct 是值类型，赋值复制数据；适合小型不可变值；隐式 sealed 不能继承。
- \`readonly struct\` 强制不可变，编译器优化更多，新建 struct 请默认加 readonly。
- \`record struct\`（C# 10+）= struct + 自动 Equals/GetHashCode/ToString/==/with/Deconstruct，DTO/VO 首选。
- struct 和 class 核心区别：值语义 vs 引用语义，选哪个看数据大小、是否需要继承/共享。`,
  },

  // ============================================================
  // 第十九章：可空类型 Nullable
  // ============================================================
  {
    id: 'csharp2-ch19',
    group: '第四部分 面向对象进阶',
    icon: '❓',
    title: '第十九章 可空类型 Nullable',
    content: `## 第十九章　可空类型 Nullable

数据库字段可能没值、API 返回可能为空、配置项可能没填——这些场景需要表达「没有值」。C# 用 \`Nullable\` 处理。

### 一、null 概念

\`null\` 表示「没有引用任何对象」。引用类型默认可以是 null，值类型不能：

\`\`\`csharp
// 引用类型可以是 null——因为引用类型变量存的是地址，null 表示不指向任何对象
string name = null;
Person? p = null;           // 类对象可以是 null
int[]? arr = null;          // 数组可以是 null

// int n = null;  // ❌ 编译错误：值类型不能是 null
int n = 0;                 // 值类型必须有值——它直接存数据，没有「地址」概念，null 无从谈起

// 为什么值类型不能为 null？
// null 表示「不指向任何对象」，但值类型变量本身就是数据，不是引用（地址）。
// 就像你不能说「这个数字不存在」——数字就是数字，0 也是一个值。
// 如果业务上确实需要表达「没有值」（如年龄未知），用 Nullable<T>。

class Person { public string Name = ""; }
\`\`\`

> 值类型（int/bool/struct 等）**不能为 null**，因为它们直接存数据，没有「地址」概念。需要「没值」语义用 \`Nullable<T>\` 或 \`T?\`。

### 二、Nullable&lt;T&gt;

\`Nullable<T>\` 是个包装结构体，让值类型也能表示 null：

\`\`\`csharp
// Nullable<T> 的本质：一个 struct，包含两个字段——bool hasValue 和 T value。
// 它仍然是值类型（栈上分配），只是多了一个「有没有值」的标志位。
// 为什么不直接给值类型加 null 支持？因为会破坏所有现有值类型的语义
// （比如 int 的默认值是 0，如果变成 null，大量已有的代码就会出问题）。

// 完整写法
Nullable<int> n1 = null;
Nullable<int> n2 = 42;

Console.WriteLine(n1.HasValue);  // False
Console.WriteLine(n2.HasValue);  // True
Console.WriteLine(n2.Value);    // 42

// ⚠️ 取值前必须判断 HasValue！否则 null 时访问 .Value 抛 InvalidOperationException
if (n1.HasValue) {
    Console.WriteLine(n1.Value);
} else {
    Console.WriteLine("n1 是 null");
}
\`\`\`

> \`Nullable<T>\` 是个值类型包装器，内部存一个 bool 标志 + T 值。nullable int 仍然是值类型，无堆分配。

### 三、int? 语法糖 ⭐

\`int?\` 是 \`Nullable<int>\` 的简写，最常用：

\`\`\`csharp
int? a = null;        // 等同 Nullable<int> a = null;
int? b = 42;
int? c = default;     // default(int?) = null，与 default(int) = 0 不同

// 任何值类型都可以加 ?：double?, bool?, DateTime?, Guid?, long? 等
double? d = null;
bool? flag = null;
DateTime? birthday = null;

Console.WriteLine(a.HasValue);  // False
Console.WriteLine(b.Value);     // 42

// 为什么用 T? 而不是用魔数表示「无值」？
// 比如用 -1 表示未知年龄——但 -1 本身可能是合法值（虽然年龄不会是-1，但其他场景会）。
// null 语义明确：不是「值为-1」，而是「根本没有值」。编译器也能帮助检查。
\`\`\`

> ⭐ \`T?\` 是处理「值类型可能没值」的标准写法，比用 -1 / 0 / DateTime.MinValue 等魔数表示「没有」清晰、安全得多。

### 四、HasValue / Value

\`\`\`csharp
int? age = null;

// 方式 1：HasValue + Value（最基础）
if (age.HasValue) {
    Console.WriteLine($"年龄：{age.Value}");
} else {
    Console.WriteLine("未知年龄");
}

// 方式 2：GetValueOrDefault——null 时返回默认值，不用判断
Console.WriteLine(age.GetValueOrDefault());     // 0 ← null 返回 default(int)
Console.WriteLine(age.GetValueOrDefault(-1));   // -1 ← 自定义默认值

// 方式 3：== null 判断（语法糖，编译器翻译为 !HasValue）
if (age == null) Console.WriteLine("未知");

// ⚠️ 直接 .Value 在 null 时会抛 InvalidOperationException！
// int v = age.Value;  // 抛异常！这是 Nullable 最常见的 bug
// 永远先判 HasValue 或用 GetValueOrDefault() / ?? 运算符
\`\`\`

> ⭐ 取值前**永远先判 HasValue 或 == null**，别直接 \`.Value\`。推荐用 \`??\` 或 \`GetValueOrDefault\` 更简洁安全。

### 五、?? 空合并运算符 ⭐

\`??\` 是处理 null 的「兜底」运算符，左侧 null 就用右侧：

\`\`\`csharp
int? age = null;
int realAge = age ?? 18;   // age 是 null → 用右侧 18；非 null → 用 age.Value
Console.WriteLine(realAge);  // 18

int? count = 5;
int real = count ?? 0;     // count 非 null → 用 count.Value（即 5）
Console.WriteLine(real);   // 5

// 链式使用：从左到右，第一个非 null 的值胜出
string? name = null;
string? nickname = null;
string display = name ?? nickname ?? "匿名";  // name null → nickname null → "匿名"
Console.WriteLine(display);  // 匿名

// ??= 空合并赋值（C# 8+）：左侧为 null 才赋值，已有值就跳过
string? userName = null;
userName ??= "默认用户";     // null，赋值
Console.WriteLine(userName);  // 默认用户

userName ??= "另一个名字";  // 已有值，不赋值
Console.WriteLine(userName);  // 默认用户 ← 没变

// ?? 非常适合：配置读取（null 用默认值）、数据库字段（null 显示为"未填写"）、
// API 响应（null 给默认头像）等「缺省值」场景，比 if-else 简洁得多。
\`\`\`

> ⭐ \`??\` 和 \`??=\` 是处理 null 的神器，日常高频。配置加载、字典取值带默认、API 缺省值都靠它。

### 六、可空引用类型 ?（C# 8+）⭐

C# 8 引入**可空引用类型**（NRT）——给引用类型加 \`?\` 表示「明确可以为 null」：

\`\`\`csharp
#nullable enable  // 开启可空引用类型检查（.NET 6+ 项目默认开启）

string name = "张三";      // 非空引用类型：编译器认为它永远不会是 null
string? maybeName = null;  // 可空引用类型：明确告诉编译器这个可能是 null

// Console.WriteLine(name.Length);    // ✅ 安全：name 声明为非 null
// Console.WriteLine(maybeName.Length); // ⚠️ CS8602 警告：解引用可能为 null 的引用

// 安全写法：先判空，编译器通过流分析知道 if 内非 null
if (maybeName is not null) {
    Console.WriteLine(maybeName.Length);  // ✅ 编译器知道这里 maybeName 不为 null
}

// ! 空原谅运算符（null-forgiving）：告诉编译器「我确定它不是 null」，跳过检查
// string forced = maybeName!;  // ⚠️ 慎用！如果运行时真的是 null，还是会抛 NullReferenceException
// ! 只是告诉编译器闭嘴，不做任何运行时检查——只在你 100% 确定时用。

// NRT 的本质是编译期静态分析，不改变运行时行为。
// 它帮助你在编译时发现潜在的 NullReferenceException，而不是等线上崩了才知道。
\`\`\`

> ⭐ NRT 是 .NET 6+ 项目的**默认开启**特性。它不改变运行时行为，只做编译期检查，帮你在写代码时就发现 null 风险。新项目务必开启。

### 七、启用可空警告

在 \`.csproj\` 里启用（项目级别，推荐）：

\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>
\`\`\`

或代码顶部加（文件级别）：

\`\`\`csharp
#nullable enable
// 这之后开启可空检查
// #nullable disable 可以在文件内局部关闭
\`\`\`

开启后编译器会警告：

| 警告 | 含义 | 场景 |
| --- | --- | --- |
| \`CS8600\` | 把 null 赋给非可空类型 | \`string s = GetNull();\` |
| \`CS8602\` | 解引用可能为 null 的引用 | \`maybeName.Length\` 未判空 |
| \`CS8603\` | 返回可能为 null 但声明非 null | 方法返回 string 但可能 return null |
| \`CS8625\` | 把 null 字面量赋给非可空类型 | \`string s = null;\` |

\`\`\`csharp
#nullable enable

// 示例 1：非空返回不能返回 null
string GetGreeting(string name) {
    // return null;  // ⚠️ CS8603：返回类型是 string（非空），不能返回 null
    return $"你好，{name}";
}

// 示例 2：可空返回用 string?
string? GetName(bool hasUser) {
    return hasUser ? "张三" : null;  // ✅ 返回类型是 string?，可以 null
}

// 示例 3：接收可空参数必须判空
void Process(string? data) {
    // Console.WriteLine(data.Length);  // ⚠️ CS8602：data 可能 null
    if (data != null) {
        Console.WriteLine(data.Length);  // ✅ 判空后编译器确认非 null
    }
}

// 调用示例
Console.WriteLine(GetGreeting("张三"));
Console.WriteLine(GetName(true) ?? "未知");
Process("测试");
\`\`\`

> ⭐ 启用 NRT 后，编译器帮你把 NullReferenceException 从「运行时 bug」变成「编译时警告」，整个代码库的 null 安全性大幅提升。新项目必开。

### 八、null 检查模式

C# 提供多种 null 检查方式，从传统到现代：

\`\`\`csharp
#nullable enable
using System.Diagnostics.CodeAnalysis;

string? name = "张三";

// 1. 经典 != null（所有 C# 版本通用）
if (name != null) {
    Console.WriteLine(name.Length);
}

// 2. is not null 模式（C# 9+）⭐ 推荐，更符合现代 C# 风格
if (name is not null) {
    Console.WriteLine(name.Length);
}

// 3. is null 模式（判断为 null）
if (name is null) {
    Console.WriteLine("名字为空");
}

// 4. 模式匹配 + 属性匹配（C# 8+）：同时检查非 null 和属性条件
if (name is { Length: > 0 }) {
    Console.WriteLine("非空且非空字符串");
}

// 5. ArgumentNullException.ThrowIfNull（.NET 6+）⭐ 参数校验推荐写法
void Process(string data) {
    ArgumentNullException.ThrowIfNull(data);  // null 时抛 ArgumentNullException，自带参数名
    Console.WriteLine(data.Length);  // 到这里编译器知道 data 不为 null
}

// 6. ?? 空合并运算符提供默认值
string displayName = name ?? "匿名";
Console.WriteLine(displayName);
\`\`\`

> ⭐ \`ArgumentNullException.ThrowIfNull(data)\` 是 .NET 6+ 参数校验推荐写法，比手写 \`if (data == null) throw new ArgumentNullException(nameof(data))\` 简洁且自动包含参数名。

### 九、实战 demo：用户信息查询

\`\`\`csharp
#nullable enable

PrintUserInfo(1);   // 找到用户
PrintUserInfo(99);  // 用户不存在

// 模拟数据库查询：id 为 1 返回张三，其他返回 null（用户不存在）
User? FindUser(int id) => id == 1
    ? new User { Id = 1, Name = "张三", Email = "zhangsan@example.com", Birthday = null }
    : null;

void PrintUserInfo(int id) {
    User? user = FindUser(id);

    // ?. 安全导航：user 为 null 则整个表达式为 null，不抛异常
    // ?? 兜底：null 时显示「未知用户」
    string name = user?.Name ?? "未知用户";
    Console.WriteLine($"--- {name} ---");

    if (user is null) return;  // 早返回：后面代码 user 不为 null

    // Email 是 string?，可能为 null，用 ?? 兜底显示「未填写」
    Console.WriteLine($"邮箱：{user.Email ?? "未填写"}");

    // Birthday 是 DateTime?，用模式匹配 is DateTime birth 同时判断非 null 并拆包
    if (user.Birthday is DateTime birth) {
        int age = DateTime.Now.Year - birth.Year;
        Console.WriteLine($"年龄：{age}");
    } else {
        Console.WriteLine("年龄：未知");
    }

    // Avatar 可能 null，用 ?? 提供默认头像路径
    Console.WriteLine($"头像：{user.Avatar ?? "/default.png"}");
}

class User {
    public int Id { get; set; }
    public string Name { get; set; } = "";        // 非空：构造时必须赋值
    public string? Email { get; set; }            // 可空：可能没填邮箱
    public DateTime? Birthday { get; set; }       // 可空：生日可能未知
    public string? Avatar { get; set; }           // 可空：可能没上传头像
}
\`\`\`

### 十、实战 demo：可空算术

\`\`\`csharp
// 可空类型参与算术运算：只要有一个操作数是 null，结果就是 null
// 这叫「null 传播」——null 像病毒一样传染给运算结果
int? a = 5;
int? b = null;
int? c = 10;

Console.WriteLine(a + b);  // 空（null）— 5 + null = null，因为不知道 null 代表多少
Console.WriteLine(a + c);  // 15 — 两个都有值，正常计算
Console.WriteLine(a - c);  // -5

// 比较运算：有 null 参与时结果大多是 false（除了 !=）
Console.WriteLine(a > b);    // False — null 不大于任何数
Console.WriteLine(a == b);   // False
Console.WriteLine(a != b);   // True — 有 null 参与 != 特殊处理为 true

// 实际场景：统计成绩（null 表示缺考，缺考不算入平均分）
// 用 ?? 把 null 转换为安全值再参与计算
int safeB = b ?? 0;
Console.WriteLine(a + safeB);  // 5 — null 当作 0 处理

// 统计总分场景：缺考当 0 分
double? Sum(List<double?> scores) {
    double total = 0;
    foreach (var s in scores) {
        total += s ?? 0;  // null（缺考）按 0 分算
    }
    return scores.Count > 0 ? total : null;  // 空列表返回 null（没有成绩）
}

var scores = new List<double?> { 80.5, null, 90, 75.5, null };
double? total = Sum(scores);
Console.WriteLine($"总分：{total}");  // 246（80.5 + 0 + 90 + 75.5 + 0 = 246）
// 注意：这里变量名是 total 不是 avg，Sum 计算的是总分不是平均分
\`\`\`

### 十一、小结

- 值类型不能为 null（直接存数据，无地址概念），用 \`Nullable<T>\` 或 \`T?\` 表示「可能没值」。
- Nullable&lt;T&gt; 本质是 bool hasValue + T value 的 struct，仍是值类型，无堆分配。
- \`HasValue\` 判断是否有值，\`Value\` 取值（取前必须判断），\`GetValueOrDefault()\` 安全取值。
- \`??\` 空合并运算符提供默认值，\`??=\` 空合并赋值，处理 null 神器。
- C# 8+ 引入**可空引用类型**（NRT）：\`string?\` 表示可空，\`string\` 表示非空，编译期检查 null 安全。
- \`#nullable enable\` 开启检查；.NET 6+ 项目默认开启；新项目必开。
- null 检查：\`is not null\` 模式匹配、\`ArgumentNullException.ThrowIfNull\` 参数校验、\`??\` 默认值。
- 可空算术：有 null 传播结果为 null，用 \`??\` 转安全值再计算。
- 金额用 decimal（精确十进制），不用 double（二进制浮点精度丢失）。
- 核心原则：**让 null 成为显式的、编译器可检查的概念**，而不是隐藏的运行时炸弹。`,
  },
];

export { chapters };
