// =============================================================
// C# 从入门到精通大全 - 第四批章节（第四部分 面向对象进阶，共 5 章）
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
Animal a = new Dog();
Animal b = new Cat();
// 同样的 Say() 调用，结果不同
a.Say();  // 汪汪
b.Say();  // 喵喵
\`\`\`

> 多态的威力：调用方只关心父类接口，不关心具体子类。新增子类不用改调用代码——**对扩展开放，对修改关闭**（开闭原则）。

### 二、virtual 方法

父类用 \`virtual\` 标记一个方法，表示「子类可以重写我」：

\`\`\`csharp
class Animal {
    public string Name { get; set; }

    // virtual 表示这是个「可被重写」的方法
    // 不写 virtual 默认是非虚方法，子类不能 override
    public virtual void Say() {
        Console.WriteLine($"{Name} 发出声音");
    }
}

class Dog : Animal {
    // override 重写父类的 virtual 方法
    public override void Say() {
        Console.WriteLine($"{Name}：汪汪！");
    }
}

class Cat : Animal {
    public override void Say() {
        Console.WriteLine($"{Name}：喵喵～");
    }
}

// 调用
Animal a = new Dog { Name = "旺财" };
Animal b = new Cat { Name = "橘猫" };
a.Say();  // 旺财：汪汪！
b.Say();  // 橘猫：喵喵～
\`\`\`

> ⭐ 多态的三个要素：① 父类方法 \`virtual\` ② 子类方法 \`override\` ③ 用父类类型变量调用。

### 三、override 重写

\`override\` 是「真正替换」父类方法——运行时根据实际对象类型调用：

\`\`\`csharp
class Shape {
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

// 关键：用父类变量接收子类对象，调用 Area() 自动分发到子类
Shape s1 = new Circle { Radius = 2 };
Shape s2 = new Rectangle { Width = 3, Height = 4 };
Console.WriteLine($"圆面积：{s1.Area():F2}");      // 12.57
Console.WriteLine($"矩形面积：{s2.Area():F2}");    // 12.00
\`\`\`

> ⭐ \`override\` 是动态分发的。看变量声明类型没用，看的是对象实际类型。

### 四、new 隐藏方法

如果子类方法**同名**但不想重写（不想参与多态），用 \`new\` 隐藏父类方法：

\`\`\`csharp
class Base {
    public virtual void Hello() => Console.WriteLine("Base.Hello");
}

class Derived : Base {
    // new 隐藏：这是个「全新方法」，跟父类没关系
    // 调用结果取决于变量声明类型！
    public new void Hello() => Console.WriteLine("Derived.Hello");
}

Base b = new Derived();
b.Hello();  // Base.Hello ← 看声明类型 Base

Derived d = new Derived();
d.Hello();  // Derived.Hello ← 看声明类型 Derived
\`\`\`

> ⚠️ \`new\` 隐藏是「静态绑定」——根据变量声明类型决定调用谁。这通常**不是你想要的**，绝大多数场景应该用 \`override\`。\`new\` 主要用于：父类新增了同名方法，子类不想破坏现有代码。

### 五、多态的实际价值

**多态最大的价值：解耦调用方与实现方**。

\`\`\`csharp
// 调用方只依赖父类/接口，不依赖具体子类
void PrintArea(Shape s) {
    Console.WriteLine($"面积 = {s.Area():F2}");
}

// 不管传什么形状都能算——未来新增 Triangle 也不用改这函数
PrintArea(new Circle { Radius = 1 });
PrintArea(new Rectangle { Width = 2, Height = 3 });
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
class Bird {
    public virtual void Fly() => Console.WriteLine("飞翔");
}

// ❌ 违反 LSP：企鹅是鸟但不会飞，重写后抛异常
class Penguin : Bird {
    public override void Fly() => throw new NotSupportedException("企鹅不会飞");
}

void MakeFly(Bird b) => b.Fly();

MakeFly(new Bird());     // 正常
// MakeFly(new Penguin()); // 运行时崩！调用方没法预料
\`\`\`

正确做法：把「飞行」拆到 \`FlyingBird\` 子类，企鹅不继承它。LSP 提醒你**继承要表达"是一个"的真实关系**，不是单纯复用代码。

### 七、实战 demo：图形面积计算

\`\`\`csharp
// 综合运用：多态 + 继承 + virtual/override
abstract class Shape {
    public string Name { get; set; }
    public abstract double Area();   // 抽象方法，子类必须实现
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
    // 重写 Print 加点额外信息
    public override void Print() => Console.WriteLine($"△ {Name} 底{Base} 高{Height} → 面积 {Area():F2}");
}

// 用父类数组统一管理
Shape[] shapes = {
    new Circle(2),
    new Rectangle(3, 4),
    new Triangle(5, 6)
};

double total = 0;
foreach (var s in shapes) {
    s.Print();           // 多态调用
    total += s.Area();
}
Console.WriteLine($"总面积：{total:F2}");
\`\`\`

### 八、实战 demo：动物叫声

\`\`\`csharp
class Animal {
    public string Name { get; set; }
    public Animal(string name) => Name = name;
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

// 多态：调用方完全不关心具体动物类型
void MakeSound(Animal a) => a.Speak();

MakeSound(new Dog("旺财"));
MakeSound(new Cat("橘猫"));
MakeSound(new Duck("唐老鸭"));
\`\`\`

### 九、小结

- 多态 = 同一调用，不同行为。前提是父类 \`virtual\` + 子类 \`override\`。
- \`override\` 是动态绑定（看实际类型），\`new\` 是静态绑定（看声明类型）。**优先 \`override\`**。
- 多态的价值：调用方解耦实现方，新增子类不改调用代码。
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
abstract class Animal {
    public string Name { get; set; }

    // 普通方法：可以有实现
    public void Sleep() => Console.WriteLine($"{Name} 在睡觉");

    // 抽象方法：没有实现，子类必须 override
    public abstract void Speak();
}

// Animal a = new Animal(); // ❌ 错误：抽象类不能实例化
Animal dog = new Dog { Name = "旺财" };  // ✅ 用子类实例化
\`\`\`

> 抽象类适合：**有共同成员、有部分实现可以复用，但有些行为必须由子类各自实现**。

### 二、abstract 抽象方法

\`abstract\` 方法只有签名没有实现，**非抽象子类必须 override**：

\`\`\`csharp
abstract class Shape {
    public string Name { get; set; }
    // 抽象方法：子类必须实现，不实现就不能 new
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

var shapes = new Shape[] { new Circle(2), new Square(3) };
foreach (var s in shapes) s.Print();
\`\`\`

> ⭐ 抽象方法相当于「**强制子类实现的契约**」，比 \`virtual\` 更严格——\`virtual\` 可以不重写，\`abstract\` 必须重写。

### 三、interface 接口定义

接口是**纯契约**：只定义方法/属性签名，不包含实现（C# 8 之前）。

\`\`\`csharp
// 接口命名约定 I 开头
interface IShape {
    double Area();          // 默认 public abstract，不用写修饰符
    double Perimeter();
}

interface IComparable {
    int CompareTo(object other);  // 返回负数/0/正数
}
\`\`\`

> 接口成员默认就是 \`public\` 且 \`abstract\`，不能写访问修饰符（C# 8 之前）。接口不能有字段、不能有构造函数。

### 四、接口实现

类用 \`:\` 实现接口，必须实现所有成员：

\`\`\`csharp
interface IShape {
    double Area();
    double Perimeter();
}

class Circle : IShape {
    public double Radius { get; set; }
    public Circle(double r) => Radius = r;
    // 实现接口方法：用 public
    public double Area() => Math.PI * Radius * Radius;
    public double Perimeter() => 2 * Math.PI * Radius;
}

// 用接口类型变量接收
IShape s = new Circle { Radius = 2 };
Console.WriteLine($"面积：{s.Area():F2}");
\`\`\`

> ⭐ 接口变量只能调用接口声明的方法，看不到类的其他成员。这就是「面向接口编程」——降低耦合。

### 五、接口多实现 ⭐

C# 类**只能单继承**（一个父类），但可以**实现多个接口**——这是接口最大的优势：

\`\`\`csharp
interface IDrawable {
    void Draw();
}

interface IResizable {
    void Resize(double factor);
}

interface IComparable<T> {
    int CompareTo(T other);
}

// 一个类实现多个接口
class Image : IDrawable, IResizable, IComparable<Image> {
    public int Width { get; set; }
    public int Height { get; set; }

    public void Draw() => Console.WriteLine($"绘制 {Width}x{Height} 图片");
    public void Resize(double f) { Width = (int)(Width * f); Height = (int)(Height * f); }
    public int CompareTo(Image other) => (Width * Height).CompareTo(other.Width * other.Height);
}

var img = new Image { Width = 100, Height = 50 };

// 不同接口视角看同一对象
IDrawable d = img;
d.Draw();

IResizable r = img;
r.Resize(2);
d.Draw();  // 200x100

Image other = new Image { Width = 50, Height = 30 };
Console.WriteLine($"比较结果：{img.CompareTo(other)}");  // 正数（img 大）
\`\`\`

> ⭐ 多实现是 C# 解决「单继承限制」的关键。一个对象可以是多种「角色」（IDrawable、IResizable...）。

### 六、默认接口方法（C# 8+）

C# 8 起接口可以提供默认实现，不破坏旧代码：

\`\`\`csharp
interface ILogger {
    void Log(string msg);

    // 默认实现：实现类不写也能用
    void LogError(string msg) => Log($"[ERROR] {msg}");
    void LogInfo(string msg) => Log($"[INFO] {msg}");
}

class ConsoleLogger : ILogger {
    // 只实现 Log，其他两个用默认实现
    public void Log(string msg) => Console.WriteLine(msg);
}

var logger = new ConsoleLogger();
logger.Log("普通日志");
logger.LogError("出错了");  // 调用默认实现
logger.LogInfo("提示信息");
\`\`\`

> 默认接口方法主要用于**接口扩展不破坏兼容**：给老接口加新方法，旧实现类不用改。

### 七、抽象类 vs 接口选择 ⭐

| 维度 | 抽象类 abstract class | 接口 interface |
| --- | --- | --- |
| 继承 | 单继承（只能一个父类） | 多实现（可多个接口） |
| 字段 | ✅ 可有 | ❌ 不能有 |
| 构造函数 | ✅ 有 | ❌ 没有 |
| 方法实现 | ✅ 可有抽象+普通方法 | 默认接口方法（C# 8+） |
| 访问修饰符 | 任意 | 默认 public（C# 8+ 可有其他） |
| 表达关系 | **"是一个"**（is-a） | **"能做"**（can-do） |

**选择原则**：
- 有共享字段、共享实现代码、构造逻辑 → **抽象类**。
- 只定义行为契约、需要多实现 → **接口**。
- 不确定？优先接口——更灵活，不占唯一继承名额。

### 八、IShape / IComparable 实例

\`\`\`csharp
// IShape：经典几何接口
interface IShape {
    double Area();
    double Perimeter();
}

// IComparable<T>：.NET 内置接口，用于排序
interface IComparable<T> {
    int CompareTo(T other);
}

class Rectangle : IShape, IComparable<Rectangle> {
    public double Width { get; set; }
    public double Height { get; set; }

    public double Area() => Width * Height;
    public double Perimeter() => 2 * (Width + Height);

    // 按面积比较，用于排序
    public int CompareTo(Rectangle other) => Area().CompareTo(other.Area());
}

var rects = new List<Rectangle> {
    new Rectangle { Width = 3, Height = 4 },
    new Rectangle { Width = 2, Height = 5 },
    new Rectangle { Width = 1, Height = 10 }
};

// List.Sort 依赖 IComparable<T>
rects.Sort();

foreach (var r in rects) {
    Console.WriteLine($"面积 {r.Area():F2}");
}
\`\`\`

> ⭐ \`IComparable<T>\` 是 .NET 排序的基础。实现了它，你的类就能放进 \`List<T>.Sort()\`、\`OrderBy\` 等。

### 九、实战 demo：日志系统

\`\`\`csharp
// 综合运用：接口 + 抽象类 + 多态
interface ILogger {
    void Log(string level, string msg);
    void Info(string msg) => Log("INFO", msg);     // 默认实现
    void Error(string msg) => Log("ERROR", msg);
}

abstract class LoggerBase : ILogger {
    protected abstract void Write(string text);    // 子类决定怎么写
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

// 调用方只依赖接口
void DoWork(ILogger logger) {
    logger.Info("开始处理");
    logger.Error("发生异常");
}

DoWork(new ConsoleLogger());
DoWork(new FileLogger("app.log"));
\`\`\`

### 十、小结

- 抽象类 \`abstract class\` 不能实例化，可有字段、构造、普通方法+抽象方法。
- 抽象方法 \`abstract\` 子类必须 \`override\` 实现。
- 接口 \`interface\` 是纯契约，C# 8+ 支持默认方法。
- 类可单继承父类+多实现接口——接口是 C# 解决单继承的关键。
- 选择：有共享状态/实现用抽象类，纯行为契约用接口。
- \`IComparable<T>\` 是 .NET 排序基础设施，实现它就能用 \`Sort\`。`,
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

- **栈（Stack）**：自动分配释放，速度快，空间小（通常 1MB）。存方法调用、局部变量。
- **堆（Heap）**：手动管理（.NET 由 GC 管理），空间大。存对象数据。

| 类型 | 存哪 | 内容 |
| --- | --- | --- |
| **值类型** | 栈（局部变量） | 数据本身 |
| **引用类型** | 栈存引用，堆存数据 | 数据的地址 |

### 二、值类型：传值拷贝

**值类型**包括：所有数值类型（int/double/bool/char）、结构体 \`struct\`、枚举 \`enum\`。

赋值时**复制数据**，互不影响：

\`\`\`csharp
int a = 10;
int b = a;   // 复制一份给 b
b = 99;
Console.WriteLine($"a={a}, b={b}");  // a=10, b=99 ← a 没变

// 结构体也是值类型
struct Point {
    public int X, Y;
}

Point p1 = new Point { X = 1, Y = 2 };
Point p2 = p1;   // 复制一份
p2.X = 999;
Console.WriteLine($"p1.X={p1.X}, p2.X={p2.X}");  // p1.X=1, p2.X=999
\`\`\`

> ⭐ 值类型赋值 = 拷贝。修改副本不影响原件。这是理解值类型的「一句话」。

### 三、引用类型：传引用

**引用类型**包括：类 \`class\`、数组 \`[]\`、字符串 \`string\`（特殊）、接口、委托。

赋值时**复制引用**（地址），两个变量指向同一对象：

\`\`\`csharp
class Person {
    public string Name { get; set; }
    public int Age { get; set; }
}

Person p1 = new Person { Name = "张三", Age = 25 };
Person p2 = p1;   // 只复制引用，p1 和 p2 指向同一对象
p2.Name = "李四";

Console.WriteLine($"p1.Name={p1.Name}");  // 李四 ← 改了 p2 影响了 p1
Console.WriteLine(ReferenceEquals(p1, p2));  // True ← 同一对象
\`\`\`

> ⭐ 引用类型赋值 = 复制地址。两个变量指向同一对象，改一个都看到。

**数组也是引用类型**：

\`\`\`csharp
int[] arr1 = { 1, 2, 3 };
int[] arr2 = arr1;   // 复制引用
arr2[0] = 999;
Console.WriteLine(arr1[0]);  // 999 ← arr1 也被改了

// 想真正复制数组
int[] copy = (int[])arr1.Clone();
copy[0] = 0;
Console.WriteLine(arr1[0]);  // 999 ← arr1 不受影响
\`\`\`

### 四、ref / out 传递

默认值类型按值传递（方法内修改不影响外面）。用 \`ref\` / \`out\` 强制按引用传：

\`\`\`csharp
// ref：传入前必须已赋值，方法内可改可不改
void Double(ref int n) => n *= 2;

int x = 10;
Double(ref x);
Console.WriteLine(x);  // 20 ← 改了外面

// out：传入前不需要赋值，方法内必须赋值
bool TryParseInt(string s, out int result) {
    if (int.TryParse(s, out result)) return true;
    result = 0;
    return false;
}

if (TryParseInt("42", out int num)) {
    Console.WriteLine($"解析成功：{num}");  // 42
}

// in：只读引用传入（避免值类型大对象复制开销）
void Print(in Point p) => Console.WriteLine($"({p.X}, {p.Y})");
\`\`\`

> ⭐ \`out\` 最常见的用途：\`TryParse\`、\`Dictionary.TryGetValue\`——返回 bool 表示成功，同时输出值。

### 五、装箱拆箱

**装箱（Boxing）**：值类型 → object/接口，复制到堆上。
**拆箱（Unboxing）**：object → 值类型，从堆拷回栈。

\`\`\`csharp
int n = 42;
object box = n;       // 装箱：在堆上创建一个 int 对象
int m = (int)box;    // 拆箱：拷回栈

Console.WriteLine(box);  // 42
Console.WriteLine(m);    // 42

// 装箱的代价：分配堆内存 + GC 压力
ArrayList list = new ArrayList();  // 旧式集合，存 object
list.Add(1);   // 装箱
list.Add(2);   // 装箱
list.Add(3);   // 装箱
// 每次添加都创建堆对象——性能差

// 泛型集合不装箱 ⭐
List<int> nums = new() { 1, 2, 3 };  // 直接存 int，无装箱
\`\`\`

> ⭐ **避免频繁装箱**。用泛型集合 \`List<int>\` 替代 \`ArrayList\`，用 \`Dictionary<int, T>\` 替代 \`Hashtable\`。

### 六、内存示意图

值类型变量直接存数据，引用类型变量存地址：

\`\`\`
栈                        堆
┌─────────────┐
│ int a = 10  │            （无）
└─────────────┘

┌─────────────┐         ┌─────────────────┐
│ Person p1   │ ──────►  │ Person 对象     │
│ (引用地址)  │          │ Name="张三"     │
└─────────────┘          │ Age=25          │
┌─────────────┐          └─────────────────┘
│ Person p2   │ ──────┘   ↑ p1 和 p2 指向同一对象
└─────────────┘
\`\`\`

### 七、string 是特殊的引用类型

\`string\` 是引用类型，但**不可变**（immutable），表现像值类型：

\`\`\`csharp
string s1 = "abc";
string s2 = s1;    // 看起来像复制
s2 = "xyz";        // 实际是 s2 指向新对象
Console.WriteLine(s1);  // abc ← 没变

// 但 string 是引用类型，看 == 比较的是内容
string a = "hello", b = "hello";
Console.WriteLine(a == b);               // True ← 重写了 ==
Console.WriteLine(ReferenceEquals(a, b)); // 不一定 True ← 可能不同对象
\`\`\`

> \`string\` 不可变是为了线程安全、字符串驻留优化。修改字符串实际是创建新对象。

### 八、何时用 struct

\`struct\` 是值类型 \`class\`。适合**小型、不可变、逻辑上是值**的数据：

✅ 适合 struct：
- 几何点 \`Point\`、颜色 \`Color\`、复数。
- 小于 16 字节。
- 不可变（readonly struct）。

❌ 不适合 struct：
- 大对象（>16 字节）——赋值复制开销大。
- 需要继承（struct 不能被继承）。
- 频繁装箱场景。

\`\`\`csharp
// 经典值类型用法
readonly struct Money {
    public decimal Amount { get; }
    public string Currency { get; }
    public Money(decimal amount, string currency) {
        Amount = amount;
        Currency = currency;
    }
    public Money Add(Money other) {
        if (Currency != other.Currency) throw new ArgumentException("币种不同");
        return new Money(Amount + other.Amount, Currency);
    }
    public override string ToString() => $"{Amount:F2} {Currency}";
}

Money m1 = new(100, "CNY");
Money m2 = new(50, "CNY");
Money m3 = m1.Add(m2);
Console.WriteLine(m3);  // 150.00 CNY
\`\`\`

### 九、实战 demo：值 vs 引用对比

\`\`\`csharp
// struct（值类型）vs class（引用类型）行为对比
struct PointS { public int X, Y; }
class PointC { public int X, Y; }

PointS s1 = new PointS { X = 1, Y = 2 };
PointS s2 = s1;
s2.X = 999;
Console.WriteLine($"struct: s1.X={s1.X}");  // 1 ← 不影响

PointC c1 = new PointC { X = 1, Y = 2 };
PointC c2 = c1;
c2.X = 999;
Console.WriteLine($"class:  c1.X={c1.X}");  // 999 ← 影响了

// 方法参数：默认值类型按值传
void Modify(int n) => n = 999;
int num = 1;
Modify(num);
Console.WriteLine($"int 默认传值：{num}");  // 1 ← 不影响

void ModifyRef(ref int n) => n = 999;
ModifyRef(ref num);
Console.WriteLine($"int ref 传引用：{num}");  // 999 ← 影响

// 引用类型默认也是按值传递引用
void ChangeName(Person p) => p.Name = "改了";
Person person = new() { Name = "原名" };
ChangeName(person);
Console.WriteLine(person.Name);  // 改了 ← 影响了对象内部
\`\`\`

### 十、小结

- 值类型存栈，赋值复制数据；引用类型存堆，赋值复制地址。
- 值类型：基本类型、struct、enum；引用类型：class、数组、string、接口。
- \`ref\` 强制按引用传，\`out\` 用于输出参数，\`in\` 只读引用。
- 装箱有性能开销，用泛型集合避免。
- \`string\` 是引用类型但不可变，行为像值类型。
- struct 适合小型、不可变、值语义的数据。`,
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

\`enum\` 是一组命名常量，让代码可读性大增：

\`\`\`csharp
enum Color { Red, Green, Blue }            // 默认 int，从 0 开始
enum DayOfWeek { Mon, Tue, Wed, Thu, Fri, Sat, Sun }
enum HttpStatus {
    Ok = 200,
    NotFound = 404,
    ServerError = 500
}

// 用法：变量类型是 Color，值是命名常量
Color c = Color.Green;
Console.WriteLine(c);  // Green ← 输出名字不是数字

// 比较用 == 即可
if (c == Color.Red) Console.WriteLine("红色");
else if (c == Color.Green) Console.WriteLine("绿色");

// switch 配合 enum 最舒服
DayOfWeek today = DayOfWeek.Fri;
string mood = today switch {
    DayOfWeek.Mon => "周一困",
    DayOfWeek.Fri => "周五嗨",
    DayOfWeek.Sat or DayOfWeek.Sun => "周末躺",
    _ => "工作日"
};
Console.WriteLine(mood);
\`\`\`

> ⭐ enum 配合 switch 是最经典用法，编译器会提醒你是否覆盖所有值。比裸用 \`int\` 状态码可读性强 10 倍。

### 二、Flags 特性 ⭐

普通 enum 一个变量只能取一个值。加 \`[Flags]\` 后可以做位运算，组合多个值：

\`\`\`csharp
[Flags]
enum Permission {
    None    = 0,
    Read    = 1,
    Write   = 2,
    Execute = 4,
    Delete  = 8
}

// 用 | 组合多个权限
Permission p = Permission.Read | Permission.Write;
Console.WriteLine(p);  // Read, Write ← 自动拼接显示

// 用 & 判断是否包含
if ((p & Permission.Read) != 0) Console.WriteLine("有读权限");
if ((p & Permission.Execute) == 0) Console.WriteLine("无执行权限");

// 用 HasFlag 更直观（C# 4+）
if (p.HasFlag(Permission.Write)) Console.WriteLine("有写权限");

// 用 ~ 移除某个权限
p &= ~Permission.Write;
Console.WriteLine(p);  // Read

// 用 ^= 切换权限
p ^= Permission.Execute;  // 加上 Execute
Console.WriteLine(p);  // Read, Execute
\`\`\`

> ⭐ \`[Flags]\` 配合位运算是权限系统、选项组合的经典方案。注意值要按 2 的幂（1, 2, 4, 8, 16...）。

### 三、enum 转换

enum 底层是整数，可以和数字、字符串互转：

\`\`\`csharp
enum HttpStatus { Ok = 200, NotFound = 404, ServerError = 500 }

HttpStatus s = HttpStatus.NotFound;

// 1. enum → int
int code = (int)s;
Console.WriteLine(code);  // 404

// 2. int → enum
HttpStatus parsed = (HttpStatus)200;
Console.WriteLine(parsed);  // Ok

// 不存在的数字也能转（不报错！）
HttpStatus bad = (HttpStatus)999;
Console.WriteLine(bad);  // 999 ← 危险

// 3. enum → string
string name = s.ToString();
Console.WriteLine(name);  // NotFound

// 4. string → enum
HttpStatus parsed2 = (HttpStatus)Enum.Parse(typeof(HttpStatus), "Ok");
Console.WriteLine(parsed2);  // Ok

// 5. TryParse（推荐，安全）
if (Enum.TryParse<HttpStatus>("NotFound", out HttpStatus result)) {
    Console.WriteLine($"解析成功：{result} ({(int)result})");
}

// 6. 遍历所有值
foreach (HttpStatus v in Enum.GetValues(typeof(HttpStatus))) {
    Console.WriteLine($"{(int)v} - {v}");
}

// 泛型版本
foreach (HttpStatus v in Enum.GetValues<HttpStatus>()) {
    Console.WriteLine(v);
}
\`\`\`

> ⭐ 配置文件、URL 参数解析经常要把字符串转 enum——\`Enum.TryParse<T>\` 是首选。

### 四、struct 定义

\`struct\` 是值类型的「轻量类」。语法和 class 几乎一样，但行为是值类型：

\`\`\`csharp
struct Point {
    public int X { get; set; }
    public int Y { get; set; }

    public Point(int x, int y) {
        X = x;
        Y = y;
    }

    public double DistanceTo(Point other) {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public override string ToString() => $"({X}, {Y})";
}

Point p1 = new Point(0, 0);
Point p2 = new Point(3, 4);
Console.WriteLine(p1.DistanceTo(p2));  // 5
Console.WriteLine(p2);  // (3, 4)
\`\`\`

> struct 不能被继承（只能实现接口），不能有无参构造函数（C# 10 之前）。它的字段在构造完成前必须全部赋值。

### 五、struct vs class ⭐

| 维度 | struct（值类型） | class（引用类型） |
| --- | --- | --- |
| 赋值 | 复制数据 | 复制引用 |
| 存储 | 栈（局部变量） | 堆 |
| 继承 | 不能被继承，可继承接口 | 可单继承 |
| null | 不可为 null（除非 \`Nullable\`） | 可为 null |
| 默认值 | \`default\`（字段全 0） | null |
| 装箱 | 装到 object 时装箱 | 不会装箱 |
| 用途 | 小型不可变数据 | 大对象、需要继承的场景 |

\`\`\`csharp
struct PointS { public int X, Y; }
class PointC { public int X, Y; }

// 赋值行为对比
PointS s1 = new() { X = 1, Y = 2 };
PointS s2 = s1;     // 复制
s2.X = 999;
Console.WriteLine(s1.X);  // 1 ← 不变

PointC c1 = new() { X = 1, Y = 2 };
PointC c2 = c1;     // 复制引用
c2.X = 999;
Console.WriteLine(c1.X);  // 999 ← 改了
\`\`\`

> ⭐ 选择原则：**小型（<16字节）、不可变、值语义（如 Point、Color、DateTime）**用 struct。其他全用 class。

### 六、readonly struct

C# 7.2 引入 \`readonly struct\`，强制整个结构体不可变：

\`\`\`csharp
readonly struct Vector {
    public double X { get; }
    public double Y { get; }
    public double Z { get; }

    public Vector(double x, double y, double z) {
        X = x; Y = y; Z = z;
    }

    public double Length => Math.Sqrt(X * X + Y * Y + Z * Z);

    public static Vector operator +(Vector a, Vector b) =>
        new(a.X + b.X, a.Y + b.Y, a.Z + b.Z);

    public override string ToString() => $"({X}, {Y}, {Z})";
}

var v1 = new Vector(1, 0, 0);
var v2 = new Vector(0, 1, 0);
var sum = v1 + v2;
Console.WriteLine(sum);        // (1, 1, 0)
Console.WriteLine(sum.Length); // 1.4142...
\`\`\`

> \`readonly struct\` 让编译器做更多优化（避免不必要的防御性拷贝），同时保证不可变语义。

### 七、record struct（C# 10+）

\`record struct\` = struct + 自动生成相等比较 + 解构 + with 表达式：

\`\`\`csharp
record struct Point(int X, int Y);

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);

// 自动生成相等比较（按值）
Console.WriteLine(p1 == p2);  // True ← 按值比较

// with 表达式：基于原对象创建新副本，修改部分字段
var p3 = p1 with { X = 99 };
Console.WriteLine(p3);    // Point { X = 99, Y = 2 }
Console.WriteLine(p1);    // Point { X = 1, Y = 2 } ← 原对象不变

// 自动解构
var (x, y) = p1;
Console.WriteLine($"{x}, {y}");  // 1, 2
\`\`\`

> ⭐ \`record struct\` 是 C# 10 起处理小型数据的最优选择——比 struct 简洁，自带相等、解构、with。日常 DTO/VO 直接用。

### 八、实战 demo：权限系统

\`\`\`csharp
// 综合运用 enum Flags
[Flags]
enum Permission {
    None    = 0,
    Read    = 1,
    Write   = 2,
    Delete  = 4,
    Admin   = Read | Write | Delete  // 组合权限
}

class User {
    public string Name { get; set; }
    public Permission Perms { get; set; }

    public bool Can(Permission action) => Perms.HasFlag(action);
}

var user = new User { Name = "张三", Perms = Permission.Read | Permission.Write };

Console.WriteLine($"{user.Name} 权限：{user.Perms}");
Console.WriteLine($"能读？{user.Can(Permission.Read)}");    // True
Console.WriteLine($"能写？{user.Can(Permission.Write)}");   // True
Console.WriteLine($"能删？{user.Can(Permission.Delete)}");  // False

// 升级权限
user.Perms |= Permission.Delete;
Console.WriteLine($"升级后：{user.Perms}");  // Read, Write, Delete

// 设为管理员
user.Perms = Permission.Admin;
Console.WriteLine($"管理员权限：{user.Perms}");  // Admin（自动是组合）
Console.WriteLine($"能删？{user.Can(Permission.Delete)}");  // True
\`\`\`

### 九、实战 demo：几何点

\`\`\`csharp
// 综合运用 struct + readonly + 运算符重载
readonly struct Point {
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y) => (X, Y) = (x, y);

    public static Point operator +(Point a, Point b) => new(a.X + b.X, a.Y + b.Y);
    public static Point operator -(Point a, Point b) => new(a.X - b.X, a.Y - b.Y);
    public static bool operator ==(Point a, Point b) => a.X == b.X && a.Y == b.Y;
    public static bool operator !=(Point a, Point b) => !(a == b);
    public override bool Equals(object obj) => obj is Point p && this == p;
    public override int GetHashCode() => HashCode.Combine(X, Y);

    public double DistanceTo(Point other) {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public void Deconstruct(out double x, out double y) => (x, y) = (X, Y);
    public override string ToString() => $"({X}, {Y})";
}

Point a = new(0, 0);
Point b = new(3, 4);
Point c = a + b;

Console.WriteLine($"a + b = {c}");
Console.WriteLine($"a 到 b 距离：{a.DistanceTo(b)}");
Console.WriteLine($"a == new(0,0)？{a == new Point(0, 0)}");
var (x, y) = c;
Console.WriteLine($"解构：x={x}, y={y}");
\`\`\`

### 十、小结

- enum 是命名常量集合，配合 switch 是状态码最佳实践。
- \`[Flags]\` + 位运算做权限/选项组合，值要 2 的幂。
- \`Enum.TryParse<T>\` 字符串转 enum 首选。
- struct 是值类型的类，赋值复制数据，适合小型不可变数据。
- \`readonly struct\` 强制不可变，编译器优化更好。
- \`record struct\`（C# 10+）= struct + 自动相等/解构/with，日常 DTO 首选。`,
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

\`null\` 表示「没有引用任何对象」。引用类型默认可以是 null：

\`\`\`csharp
string name = null;        // 引用类型可以是 null
Person p = null;           // 类对象可以是 null
int[] arr = null;          // 数组可以是 null

// int n = null;  // ❌ 错误：值类型不能是 null
int n = 0;                 // 值类型必须有值
\`\`\`

> 值类型（int/bool/struct 等）**不能为 null**，因为它们直接存数据，没有「地址」概念。

### 二、Nullable&lt;T&gt;

\`Nullable<T>\` 是个包装结构体，让值类型也能表示 null：

\`\`\`csharp
// 完整写法
Nullable<int> n1 = null;
Nullable<int> n2 = 42;

Console.WriteLine(n1.HasValue);  // False
Console.WriteLine(n2.HasValue);  // True
Console.WriteLine(n2.Value);    // 42

// 取值前必须判断 HasValue，否则抛异常
if (n1.HasValue) {
    Console.WriteLine(n1.Value);
} else {
    Console.WriteLine("n1 是 null");
}
\`\`\`

> \`Nullable<T>\` 是个值类型包装器，内部存一个 bool 标志 + T 值。所以 nullable int 仍然是值类型。

### 三、int? 语法糖 ⭐

\`int?\` 是 \`Nullable<int>\` 的简写，最常用：

\`\`\`csharp
int? a = null;        // 等同 Nullable<int> a = null;
int? b = 42;
int? c = default;     // default(int?) = null

double? d = null;
bool? flag = null;
DateTime? birthday = null;

Console.WriteLine(a.HasValue);  // False
Console.WriteLine(b.Value);     // 42
\`\`\`

> ⭐ \`T?\` 是处理「值类型可能没值」的标准写法，比用 -1 / 0 / 魔数表示「没有」清晰得多。

### 四、HasValue / Value

\`\`\`csharp
int? age = null;

// 方式 1：HasValue + Value
if (age.HasValue) {
    Console.WriteLine($"年龄：{age.Value}");
} else {
    Console.WriteLine("未知年龄");
}

// 方式 2：GetValueOrDefault
Console.WriteLine(age.GetValueOrDefault());     // 0 ← null 返回默认值
Console.WriteLine(age.GetValueOrDefault(-1));   // -1 ← 自定义默认

// 方式 3：== null 判断（更简洁）
if (age == null) Console.WriteLine("未知");

// ⚠️ 直接 .Value 在 null 时会抛异常
// int v = age.Value;  // 抛 InvalidOperationException
\`\`\`

> ⭐ 取值前**永远先判 HasValue 或 == null**，别直接 \`.Value\`。

### 五、?? 空合并运算符 ⭐

\`??\` 是处理 null 的「兜底」运算符，左侧 null 就用右侧：

\`\`\`csharp
int? age = null;
int realAge = age ?? 18;   // null → 用 18
Console.WriteLine(realAge);  // 18

int? count = 5;
int real = count ?? 0;     // 非 null → 用本身值
Console.WriteLine(real);   // 5

// 链式使用
string name = null;
string nickname = null;
string display = name ?? nickname ?? "匿名";
Console.WriteLine(display);  // 匿名

// ??= 空合并赋值（C# 8+）：左侧 null 才赋值
string? userName = null;
userName ??= "默认用户";
Console.WriteLine(userName);  // 默认用户

userName ??= "另一个名字";  // 已经有值，不赋
Console.WriteLine(userName);  // 默认用户
\`\`\`

> ⭐ \`??\` 和 \`??=\` 是处理 null 的神器，日常高频。配置加载、字典取值带默认都靠它。

### 六、可空引用类型 ?（C# 8+）⭐

C# 8 引入**可空引用类型**（NRT）——给引用类型加 \`?\` 表示「明确可以为 null」：

\`\`\`csharp
#nullable enable  // 开启可空警告（C# 8+，.NET 6+ 项目默认开启）

string name = "张三";     // 非 null，编译器保证
string? maybeName = null; // 可 null，明确告诉编译器这可以是 null

// name.Length;    // ✅ 安全
// maybeName.Length;  // ⚠️ 警告：可能为 null

// 安全写法：先判空
if (maybeName is not null) {
    Console.WriteLine(maybeName.Length);  // ✅ 编译器知道这里非 null
}

// 或者用 ! 强制告诉编译器「我确定不是 null」（慎用）
// string forced = maybeName!;
\`\`\`

> ⭐ NRT 是 .NET 6+ 项目的**默认开启**特性。它不改变运行时行为，只做编译期检查，帮你避免 \`NullReferenceException\`。

### 七、启用可空警告

在 \`.csproj\` 里启用：

\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
\`\`\`

或代码顶部加：

\`\`\`csharp
#nullable enable
// 这之后开启可空检查
\`\`\`

开启后编译器会警告：

| 警告 | 含义 |
| --- | --- |
| \`CS8600\` | 把 null 赋给非可空类型 |
| \`CS8602\` | 解引用可能为 null 的引用 |
| \`CS8603\` | 返回可能为 null 但声明非 null |
| \`CS8625\` | 把 null 字面量赋给非可空类型 |

\`\`\`csharp
#nullable enable

string GetGreeting(string name) {
    // return null;  // ⚠️ CS8603
    return $"你好，{name}";
}

string? GetName(bool hasUser) {
    return hasUser ? "张三" : null;  // ✅ 返回类型是 string?
}

void Process(string? data) {
    // Console.WriteLine(data.Length);  // ⚠️ CS8602 可能空引用
    if (data != null) {
        Console.WriteLine(data.Length);  // ✅ 编译器知道这里非空
    }
}
\`\`\`

> ⭐ 启用 NRT 后，整个代码库的 null 安全性大幅提升。新项目必开。

### 八、null 检查模式

C# 提供多种 null 检查方式：

\`\`\`csharp
string? name = "张三";

// 1. 经典 != null
if (name != null) { /* ... */ }

// 2. is not null 模式（C# 9+）⭐
if (name is not null) { /* ... */ }

// 3. is null 模式
if (name is null) { /* ... */ }

// 4. 模式匹配 + 声明
if (name is { Length: > 0 }) {
    Console.WriteLine("非空且非空字符串");
}

// 5. ArgumentNullException.ThrowIfNull（.NET 6+）⭐
void Process(string data) {
    ArgumentNullException.ThrowIfNull(data);  // null 抛异常，自带参数名
    Console.WriteLine(data.Length);
}

// 6. ?? 兜底
string displayName = name ?? "匿名";

// 7. ?. 安全导航（章节后讲，但很常用）
// int? len = name?.Length;
\`\`\`

> ⭐ \`ArgumentNullException.ThrowIfNull\` 是 .NET 6+ 推荐写法，比手写 \`if (data == null) throw\` 简洁且参数名准确。

### 九、实战 demo：用户信息查询

\`\`\`csharp
#nullable enable

// 模拟数据库实体：有些字段可能为 null
class User {
    public int Id { get; set; }
    public string Name { get; set; } = "";        // 非空
    public string? Email { get; set; }            // 可空
    public DateTime? Birthday { get; set; }       // 可空
    public string? Avatar { get; set; }           // 可空
}

// 模拟数据库查询
User? FindUser(int id) => id == 1
    ? new User { Id = 1, Name = "张三", Email = "zhangsan@example.com", Birthday = null }
    : null;  // 用户不存在

void PrintUserInfo(int id) {
    User? user = FindUser(id);

    // 用 ?? 处理 null
    string name = user?.Name ?? "未知用户";
    Console.WriteLine($"--- {name} ---");

    if (user is null) return;

    // Email 可能 null，用 ?? 兜底
    Console.WriteLine($"邮箱：{user.Email ?? "未填写"}");

    // Birthday 是 DateTime?，用模式匹配
    if (user.Birthday is DateTime birth) {
        int age = DateTime.Now.Year - birth.Year;
        Console.WriteLine($"年龄：{age}");
    } else {
        Console.WriteLine("年龄：未知");
    }

    // Avatar 用 ?? 提供默认头像
    Console.WriteLine($"头像：{user.Avatar ?? "/default.png"}");
}

PrintUserInfo(1);  // 找到
PrintUserInfo(99);  // 没找到
\`\`\`

### 十、实战 demo：可空算术

\`\`\`csharp
// 可空类型参与算术：只要有一个 null，结果就是 null
int? a = 5;
int? b = null;
int? c = 10;

Console.WriteLine(a + b);  // (null)
Console.WriteLine(a + c);  // 15
Console.WriteLine(a - c);  // -5

// 比较：有 null 时结果是 false（除了 !=）
Console.WriteLine(a > b);    // False（null 不参与比较）
Console.WriteLine(a == b);   // False
Console.WriteLine(a != b);   // True

// 转换：用 ?? 给默认值再算
int safeB = b ?? 0;
Console.WriteLine(a + safeB);  // 5

// 统计平均分场景
double? Sum(List<double?> scores) {
    double total = 0;
    foreach (var s in scores) {
        total += s ?? 0;  // null 当 0 处理
    }
    return scores.Count > 0 ? total : null;
}

var scores = new List<double?> { 80.5, null, 90, 75.5, null };
double? avg = Sum(scores);
Console.WriteLine($"总分：{avg}");
\`\`\`

### 十一、小结

- 值类型不能为 null，用 \`Nullable<T>\` 或 \`T?\` 表示「可能没值」。
- \`HasValue\` 判断、\`Value\` 取值（取前必须判断）。
- \`??\` 兜底默认值，\`??=\` 空合并赋值，处理 null 神器。
- C# 8+ 引入**可空引用类型** \`string?\`，编译期检查 null，新项目默认开启。
- \`ArgumentNullException.ThrowIfNull\` 是参数校验推荐写法。
- 可空类型参与算术：有 null 结果就是 null，用 \`??\` 转安全值。`,
  },
];

export { chapters };
