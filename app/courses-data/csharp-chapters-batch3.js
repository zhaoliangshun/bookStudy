// =============================================================
// C# 实战教程 - 第三批章节（第三部分面向对象，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp-ch09 : 第九章 类与对象入门
//   csharp-ch10 : 第十章 继承与多态
//   csharp-ch11 : 第十一章 接口与抽象类
//   csharp-ch12 : 第十二章 属性、索引器与运算符重载
//
// 风格：demo 驱动，每章直接上手写代码，多注释。
// 注意：顶级语句 → 本地函数 → 类型声明的顺序，确保示例可直接运行。
// 适用版本：.NET 8 LTS / C# 12。
// =============================================================

const chapters = [
  // ============================================================
  // 第九章：类与对象入门
  // ============================================================
  {
    id: 'csharp-ch09',
    group: '第三部分 面向对象',
    icon: '🎯',
    title: '类与对象入门',
    content: `## 第九章　类与对象入门

类是面向对象的基石——把数据和操作打包在一起。这一章讲类的定义、属性、构造函数、方法——这些是你写任何 C# 业务代码的基础。

### 一、最简单的类

\`\`\`csharp
// 创建对象（顶级语句）
var p = new Person("张三", 25);
Console.WriteLine(p.Introduce());

// 类型声明（放最后）
class Person
{
    // 字段：存储数据
    public string Name;
    public int Age;

    // 构造函数：创建对象时初始化
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

    // 方法：对象的行为
    public string Introduce()
    {
        return $"我叫 {Name}，今年 {Age} 岁";
    }
}
\`\`\`

### 二、属性：字段的升级版 ⭐

直接用 \`public\` 字段不优雅——无法控制读写、无法做校验。C# 用**属性**替代字段：

\`\`\`csharp
// 创建
var u = new User();
u.Name = "李四";        // 调用 set
u.Age = 25;            // 调用 set（含校验）
Console.WriteLine(u.Name);  // 调用 get
Console.WriteLine(u.Age);

// u.Age = -5;  // 会抛异常：年龄不能为负

class User
{
    // 自动属性：编译器自动生成私有字段 ⭐
    public string Name { get; set; }

    // 完整属性：自定义 get/set 逻辑
    private int _age;  // 私有字段
    public int Age
    {
        get { return _age; }
        set
        {
            if (value < 0)  // value 是 set 的隐式参数
                throw new ArgumentException("年龄不能为负");
            _age = value;
        }
    }

    // 只读属性（只有 get）：只能在构造函数里赋值
    public string Id { get; }

    // 表达式体属性
    public bool IsAdult => Age >= 18;

    // 计算属性
    public string Summary => $"{Name}({Age}岁, {(IsAdult ? "成年" : "未成年")})";
}
\`\`\`

> ⭐ **永远用属性，不要用 public 字段**。属性能控制读写权限、做校验、做计算，且不影响调用代码（\`obj.Name\` 语法相同）。

### 三、构造函数 ⭐

\`\`\`csharp
// 创建
var e1 = new Employee("张三", 5000);
Console.WriteLine(e1);

var e2 = new Employee("李四");  // 用默认工资
Console.WriteLine(e2);

class Employee
{
    public string Name { get; set; }
    public decimal Salary { get; set; }

    // 主构造函数（C# 12 特性：参数直接成为字段）⭐
    // 等价于传统写法：public Employee(string name, decimal salary) { Name = name; Salary = salary; }
    public Employee(string name, decimal salary = 8000)
    {
        Name = name;
        Salary = salary;
    }

    public override string ToString() => $"{Name}: ¥{Salary:N0}";
}
\`\`\`

> ⭐ C# 12 的"主构造函数"让类的定义更简洁：\`class Point(int X, int Y);\` 一行搞定。

### 四、this 关键字

\`\`\`csharp
// 使用
var r = new Rectangle(10, 20);
Console.WriteLine(r.Area);  // 200

class Rectangle
{
    public int Width { get; set; }
    public int Height { get; set; }

    public Rectangle(int width, int height)
    {
        // this 区分字段与参数（参数同名时必须用 this）
        this.Width = width;
        this.Height = height;
    }

    // this 串联调用其他构造函数
    public Rectangle(int size) : this(size, size) { }  // 正方形

    public int Area => Width * Height;
}
\`\`\`

### 五、静态成员 ⭐

\`static\` 成员属于类本身，不属于某个对象——所有对象共享一份。

\`\`\`csharp
// 使用
Console.WriteLine(MathHelper.Pi);        // 3.14159（静态字段）
Console.WriteLine(MathHelper.Add(2, 3));  // 5（静态方法）

// 静态类不能实例化
// var m = new MathHelper();  // 编译错误

// 静态构造函数：第一次访问类时执行（只一次）
Console.WriteLine("再次访问 Pi:");
Console.WriteLine(MathHelper.Pi);  // 不会再次触发静态构造函数

static class MathHelper
{
    // 静态字段
    public static readonly double Pi = 3.14159265;

    // 静态方法
    public static int Add(int a, int b) => a + b;

    public static int Square(int x) => x * x;
}
\`\`\`

> ⭐ \`static\` 类常用作工具方法集合（如 \`Math\`、\`Convert\`、\`File\`）。不能 \`new\`，不能有实例成员。

### 六、对象初始化器 ⭐

\`\`\`csharp
// 使用
var p = new Product
{
    Name = "蓝牙耳机",
    Price = 199.99m,
    Stock = 50
};
Console.WriteLine(p);

// 等价于
var p2 = new Product();
p2.Name = "蓝牙耳机";
p2.Price = 199.99m;
p2.Stock = 50;

class Product
{
    public string Name { get; set; } = "";  // 属性默认值
    public decimal Price { get; set; }
    public int Stock { get; set; }

    public override string ToString() => $"{Name} - ¥{Price:F2} (库存 {Stock})";
}
\`\`\`

### 七、null 与可空引用类型 ⭐

\`\`\`csharp
// 创建
var order = new OrderItem { ProductName = "耳机", Quantity = 2 };
Console.WriteLine(order.Discount ?? 0);  // null 合并：null 时用 0
Console.WriteLine(order.Discount?.ToString() ?? "无折扣");  // 空条件 + 合并

class OrderItem
{
    public string ProductName { get; set; }
    public int Quantity { get; set; }

    // 可空引用类型：表示 Discount 可能为 null（C# 8+ 默认开启）
    public decimal? Discount { get; set; }  // 注意 ? 表示可空
}
\`\`\`

> ⭐ \`?\` 后缀表示可空：\`int?\` 是可空 int，\`string?\` 是可空 string。处理可空用 \`?.\`（空条件）和 \`??\`（合并）。

### 八、实战 demo：学生成绩管理

\`\`\`csharp
// === 学生成绩管理 ===
// 演示：类、属性、构造函数、静态成员、集合

// 创建学生列表
var students = new List<Student>
{
    new Student("张三", new[] { 85, 92, 78 }),
    new Student("李四", new[] { 76, 88, 95 }),
    new Student("王五", new[] { 92, 85, 88 }),
};

Console.WriteLine($"共 {Student.TotalCount} 名学生");
Console.WriteLine();

// 输出每个学生信息
foreach (var s in students)
{
    Console.WriteLine(s);
}

// 计算班级平均分
double classAvg = students.Average(s => s.Average);
Console.WriteLine($"\\n班级平均分：{classAvg:F2}");

// 找最高分学生
var top = students.OrderByDescending(s => s.Average).First();
Console.WriteLine($"最高分：{top.Name}（{top.Average:F1}）");

class Student
{
    // 静态字段：所有对象共享，记录总数
    public static int TotalCount = 0;

    // 实例属性
    public string Name { get; set; }
    public int[] Scores { get; set; }

    // 构造函数
    public Student(string name, int[] scores)
    {
        Name = name;
        Scores = scores;
        TotalCount++;  // 每创建一个学生，总数 +1
    }

    // 计算属性
    public double Average => Scores.Average();
    public int Max => Scores.Max();
    public int Total => Scores.Sum();

    // 重写 ToString
    public override string ToString()
    {
        var scoresStr = string.Join(", ", Scores);
        return $"{Name,-6} 成绩：[{scoresStr}] 平均：{Average:F1} 最高：{Max}";
    }
}
\`\`\`

输出：
\`\`\`
共 3 名学生

张三   成绩：[85, 92, 78] 平均：85.0 最高：92
李四   成绩：[76, 88, 95] 平均：86.3 最高：95
王五   成绩：[92, 85, 88] 平均：88.3 最高：92

班级平均分：86.56
最高分：王五（88.3）
\`\`\`

### 九、本章小结

- ⭐ 类用 \`class\` 定义，包含字段/属性/方法/构造函数。
- ⭐ **永远用属性，不用 public 字段**：\`public string Name { get; set; }\`。
- ⭐ 自动属性 \`{ get; set; }\` 最常用；自定义属性可加校验逻辑。
- ⭐ 只读属性 \`{ get; }\` 只能在构造函数赋值。
- ⭐ 静态成员属于类本身：\`static\` 字段/方法/类，用 \`类名.成员\` 访问。
- ⭐ 对象初始化器 \`new T { Prop = val }\` 简洁地初始化多个属性。
- ⭐ 可空类型 \`int?\` / \`string?\`：用 \`?.\` 和 \`??\` 安全处理 null。

下一章讲继承与多态——代码复用与扩展的核心机制。`,
  },

  // ============================================================
  // 第十章：继承与多态
  // ============================================================
  {
    id: 'csharp-ch10',
    group: '第三部分 面向对象',
    icon: '🌳',
    title: '继承与多态',
    content: `## 第十章　继承与多态

继承让子类复用父类的代码，多态让同一调用走不同实现。这是面向对象的灵魂——这一章讲透 \`virtual/override/abstract\`、\`base\` 关键字、里氏替换原则。

### 一、基础继承

\`\`\`csharp
// 使用：子类继承父类，自动拥有父类的成员
var dog = new Dog("旺财");
dog.Eat();      // 继承自 Animal
dog.Bark();     // Dog 自己的方法
dog.Name = "大黄";  // 继承自 Animal 的属性
Console.WriteLine(dog.Name);

class Animal
{
    public string Name { get; set; }

    public Animal(string name) => Name = name;

    public void Eat() => Console.WriteLine($"{Name} 在吃东西");
}

class Dog : Animal  // : 表示继承
{
    public Dog(string name) : base(name) { }  // base 调用父类构造函数

    public void Bark() => Console.WriteLine($"{Name} 汪汪汪！");
}
\`\`\`

> ⭐ C# 是**单继承**：一个类只能继承一个父类。\`class Dog : Animal\`。\`base\` 关键字调用父类成员。

### 二、virtual 与 override：多态 ⭐

\`virtual\` 标记可被重写的方法，\`override\` 重写父类方法。**这是多态的核心**。

\`\`\`csharp
// 使用：同一个变量调用同一方法，行为不同
Animal a = new Cat("咪咪");
Animal b = new Dog("旺财");
a.MakeSound();  // 咪咪 喵喵喵（调用 Cat 的版本）
b.MakeSound();  // 旺财 汪汪汪（调用 Dog 的版本）

class Animal
{
    public string Name { get; set; }
    public Animal(string name) => Name = name;

    // virtual：标记为可重写
    public virtual void MakeSound() => Console.WriteLine($"{Name} 发出声音");
}

class Cat : Animal
{
    public Cat(string name) : base(name) { }
    // override：重写父类方法
    public override void MakeSound() => Console.WriteLine($"{Name} 喵喵喵");
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override void MakeSound() => Console.WriteLine($"{Name} 汪汪汪");
}
\`\`\`

> ⭐ 多态：父类变量引用子类对象，调用重写方法时执行子类版本。这是 OOP 的精髓——"同一接口，不同行为"。

### 三、里氏替换原则（LSP）

\`\`\`csharp
// 使用：父类能出现的地方，子类一定能用
var shapes = new Shape[]
{
    new Circle(5),
    new Rectangle(4, 6),
    new Triangle(3, 4, 5),
};

foreach (var s in shapes)
{
    Console.WriteLine($"面积：{s.Area():F2}");
}

abstract class Shape
{
    // abstract：强制子类实现
    public abstract double Area();
}

class Circle : Shape
{
    public double Radius { get; set; }
    public Circle(double r) => Radius = r;
    public override double Area() => Math.PI * Radius * Radius;
}

class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public Rectangle(double w, double h) { Width = w; Height = h; }
    public override double Area() => Width * Height;
}

class Triangle : Shape
{
    public double Base { get; set; }
    public double Height { get; set; }
    public Triangle(double b, double h) { Base = b; Height = h; }
    public override double Area() => 0.5 * Base * Height;
}
\`\`\`

> ⭐ LSP：子类必须能完全替换父类，不破坏程序正确性。重写方法时不要改变预期的行为契约。

### 四、base 调用父类方法 ⭐

\`\`\`csharp
// 使用
var m = new Manager("张三", 50000, 10);
m.Work();  // 调用父类 + 扩展

class Employee
{
    public string Name { get; set; }
    public decimal Salary { get; set; }

    public Employee(string name, decimal salary)
    {
        Name = name;
        Salary = salary;
    }

    public virtual void Work() => Console.WriteLine($"{Name} 在工作");
}

class Manager : Employee
{
    public int TeamSize { get; set; }

    public Manager(string name, decimal salary, int teamSize)
        : base(name, salary)  // 调用父类构造函数
    {
        TeamSize = teamSize;
    }

    public override void Work()
    {
        base.Work();  // 先执行父类逻辑
        Console.WriteLine($"{Name} 还在管理 {TeamSize} 人团队");
    }
}
\`\`\`

### 五、sealed：禁止继承

\`\`\`csharp
// 使用
var s = new Safe("金库");
s.Lock();

// 类型声明
sealed class Safe  // sealed：这个类不能被继承
{
    public string Name { get; set; }
    public Safe(string name) => Name = name;
    public void Lock() => Console.WriteLine($"{Name} 已锁定");
}

// class StrongSafe : Safe { }  // 编译错误：sealed 类不能继承
\`\`\`

> \`sealed\` 用于防止关键类被继承（安全、性能、设计）。也可单独标记方法 \`sealed override\` 阻止子类再重写。

### 六、is 与 as：类型判断与转换 ⭐

\`\`\`csharp
// 使用
object obj = "Hello";

// is：判断类型
if (obj is string)
{
    Console.WriteLine("是字符串");
}

// is + 模式匹配（C# 7+）：判断并赋值 ⭐
if (obj is string s)
{
    Console.WriteLine($"长度：{s.Length}");
}

// as：安全转换，失败返回 null
object n = 42;
string str = n as string;  // 转换失败，str = null
Console.WriteLine(str is null ? "null" : str);

// 类型转换的几种方式
Animal a = new Dog("旺财");
Dog d = (Dog)a;        // 强转：失败抛异常
Dog d2 = a as Dog;     // as：失败返回 null
bool isDog = a is Dog;  // is：判断
\`\`\`

> ⭐ \`is\` 判断类型，\`as\` 安全转换。优先用 \`is + 模式匹配\`：\`if (obj is string s)\`，一行搞定判断+赋值。

### 七、多态实战：策略模式雏形

\`\`\`csharp
// === 折扣策略 ===
// 演示：多态实现策略模式

// 使用
var cart = 100m;

// 不同折扣策略
DiscountStrategy noDiscount = new NoDiscount();
DiscountStrategy tenPercent = new PercentageDiscount(0.1m);
DiscountStrategy fullReduction = new FullReduction(100, 20);

Console.WriteLine($"原价 {cart:C}");
Console.WriteLine($"无折扣：{noDiscount.Apply(cart):C}");
Console.WriteLine($"9 折：{tenPercent.Apply(cart):C}");
Console.WriteLine($"满 100 减 20：{fullReduction.Apply(cart):C}");

// 策略可切换
DiscountStrategy current = tenPercent;
Console.WriteLine($"当前策略：{current.Apply(cart):C}");

// 类型声明
abstract class DiscountStrategy
{
    public abstract decimal Apply(decimal original);
}

class NoDiscount : DiscountStrategy
{
    public override decimal Apply(decimal original) => original;
}

class PercentageDiscount : DiscountStrategy
{
    private readonly decimal _rate;
    public PercentageDiscount(decimal rate) => _rate = rate;
    public override decimal Apply(decimal original) => original * (1 - _rate);
}

class FullReduction : DiscountStrategy
{
    private readonly decimal _threshold;
    private readonly decimal _reduction;
    public FullReduction(decimal threshold, decimal reduction)
    {
        _threshold = threshold;
        _reduction = reduction;
    }
    public override decimal Apply(decimal original)
    {
        return original >= _threshold ? original - _reduction : original;
    }
}
\`\`\`

### 八、本章小结

- ⭐ \`class Sub : Base\` 表示继承，C# 单继承。
- ⭐ \`virtual\` 标记可重写，\`override\` 重写父类方法——**这是多态的核心**。
- ⭐ \`base.Method()\` 调用父类方法，\`base(...)\` 调用父类构造函数。
- ⭐ \`abstract\` 强制子类实现（抽象类不能实例化）。
- ⭐ \`sealed\` 禁止继承。
- ⭐ \`is\` 判断类型，\`as\` 安全转换，\`is + 模式匹配\` 一行判断+赋值。
- 里氏替换：子类替换父类不破坏程序。

下一章讲接口与抽象类——面向对象设计的两大基石。`,
  },

  // ============================================================
  // 第十一章：接口与抽象类
  // ============================================================
  {
    id: 'csharp-ch11',
    group: '第三部分 面向对象',
    icon: '🔌',
    title: '接口与抽象类',
    content: `## 第十一章　接口与抽象类

接口定义"能做什么"，抽象类提供"是什么"的共用实现。这一章讲两者的区别、何时用哪个，以及默认接口方法、多接口实现等实战技巧。

### 一、接口：能力的契约 ⭐

\`\`\`csharp
// 使用
var f = new FileLogger("app.log");
f.Log("服务启动");
f.Log("收到请求");

var c = new ConsoleLogger();
c.Log("控制台输出");

// 用接口类型引用（多态）
ILogger logger = new FileLogger("error.log");
logger.Log("接口引用调用");

// 类型声明
interface ILogger
{
    // 接口方法：只有声明，没有实现（C# 8 之前）
    void Log(string message);

    // 接口属性
    string Name { get; }
}

class FileLogger : ILogger
{
    private readonly string _filename;
    public string Name => $"FileLogger:{_filename}";

    public FileLogger(string filename) => _filename = filename;

    public void Log(string message)
    {
        // 真实场景写文件，这里模拟
        Console.WriteLine($"[{_filename}] {DateTime.Now:HH:mm:ss} - {message}");
    }
}

class ConsoleLogger : ILogger
{
    public string Name => "ConsoleLogger";
    public void Log(string message) => Console.WriteLine($"[Console] {message}");
}
\`\`\`

> ⭐ 接口是"能力契约"：实现接口 = 承诺提供某种能力。\`class X : IA, IB\` 可以实现多个接口（弥补单继承）。

### 二、接口的多实现 ⭐

\`\`\`csharp
// 使用
var doc = new Document("readme.md");
doc.Print();     // IPrintable
doc.Save();      // ISaveable
doc.Search("关键词");  // ISearchable

// 用接口变量引用
IPrintable printable = doc;
printable.Print();

ISaveable saveable = doc;
saveable.Save();

// 类型声明
interface IPrintable { void Print(); }
interface ISaveable { void Save(); }
interface ISearchable { void Search(string keyword); }

class Document : IPrintable, ISaveable, ISearchable  // 实现多个接口
{
    public string Name { get; set; }
    public Document(string name) => Name = name;

    public void Print() => Console.WriteLine($"打印 {Name}");
    public void Save() => Console.WriteLine($"保存 {Name}");
    public void Search(string keyword) => Console.WriteLine($"在 {Name} 中搜索 '{keyword}'");
}
\`\`\`

> ⭐ 一个类可以实现多个接口——这是 C# 解决"多继承"需求的标准方式。

### 三、接口的默认实现（C# 8+）

\`\`\`csharp
// 使用
var repo = new UserRepository();
repo.Add(new User2 { Id = 1, Name = "张三" });  // 实现的方法
repo.Log("添加用户");  // 默认实现的方法

// 类型声明
interface IRepository<T>
{
    void Add(T item);
    T Get(int id);

    // 默认实现：接口可以提供方法体（C# 8+）
    void Log(string msg)
    {
        Console.WriteLine($"[Repo] {DateTime.Now:HH:mm:ss} {msg}");
    }
}

class User2
{
    public int Id { get; set; }
    public string Name { get; set; }
}

class UserRepository : IRepository<User2>
{
    public void Add(User2 item) => Console.WriteLine($"添加 {item.Name}");
    public User2 Get(int id) => new User2 { Id = id, Name = "默认" };
}
\`\`\`

> ⭐ 默认接口方法让接口能升级而不破坏老实现。但实现类可以重写默认方法。

### 四、抽象类：共享实现 ⭐

抽象类介于"接口"和"普通类"之间——可以包含实现，也能定义抽象方法强制子类实现。

\`\`\`csharp
// 使用
var rect = new Rectangle2(5, 3);
var circ = new Circle2(4);

Console.WriteLine($"矩形：{rect}, 面积={rect.Area():F2}, 周长={rect.Perimeter():F2}");
Console.WriteLine($"圆形：{circ}, 面积={circ.Area():F2}, 周长={circ.Perimeter():F2}");

// 类型声明
abstract class Shape2
{
    // 抽象方法：只有声明，强制子类实现
    public abstract double Area();
    public abstract double Perimeter();

    // 具体方法：子类直接复用
    public override string ToString() => $"{GetType().Name}";
}

class Rectangle2 : Shape2
{
    public double Width { get; set; }
    public double Height { get; set; }
    public Rectangle2(double w, double h) { Width = w; Height = h; }
    public override double Area() => Width * Height;
    public override double Perimeter() => 2 * (Width + Height);
}

class Circle2 : Shape2
{
    public double Radius { get; set; }
    public Circle2(double r) => Radius = r;
    public override double Area() => Math.PI * Radius * Radius;
    public override double Perimeter() => 2 * Math.PI * Radius;
}
\`\`\`

### 五、接口 vs 抽象类：怎么选 ⭐

| 维度 | 接口（interface） | 抽象类（abstract class） |
| --- | --- | --- |
| 继承 | 可多实现 | 只能单继承 |
| 字段 | 不能有 | 可以有 |
| 构造函数 | 没有 | 有 |
| 方法实现 | 默认方法（C# 8+） | 可以混合抽象+具体 |
| 适用 | 定义"能力" | 共享"是什么" |

**经验法则**：
- 多个不相关类有相同能力 → **接口**（如 \`IComparable\`、\`IDisposable\`）。
- 一组相关类共享实现 → **抽象类**（如 \`Animal\` → \`Dog\`/\`Cat\`）。
- 不确定时**优先用接口**——更灵活，不占继承位。

### 六、接口组合实战

\`\`\`csharp
// === 接口组合 ===
// 演示：通过接口组合实现灵活设计

// 使用
var handlers = new IHandler[]
{
    new HttpHandler(),
    new DbHandler(),
    new CacheHandler(),
};

foreach (var h in handlers)
{
    h.Handle("request-001");
}

// 类型声明
interface IHandler
{
    string Name { get; }
    void Handle(string request);
}

class HttpHandler : IHandler
{
    public string Name => "HTTP";
    public void Handle(string request) => Console.WriteLine($"[{Name}] 处理 HTTP 请求：{request}");
}

class DbHandler : IHandler
{
    public string Name => "DB";
    public void Handle(string request) => Console.WriteLine($"[{Name}] 处理数据库请求：{request}");
}

class CacheHandler : IHandler
{
    public string Name => "Cache";
    public void Handle(string request) => Console.WriteLine($"[{Name}] 处理缓存请求：{request}");
}
\`\`\`

### 七、本章小结

- ⭐ 接口是"能力契约"：\`interface ILogger { void Log(string msg); }\`。
- ⭐ 一个类可以实现多个接口：\`class X : IA, IB, IC\`。
- ⭐ 抽象类可以混合抽象方法+具体方法，子类复用具体实现。
- ⭐ 默认接口方法（C# 8+）让接口可升级不破坏老代码。
- ⭐ 选择：定义"能力"用接口，共享"是什么"用抽象类。
- 接口不能有字段、构造函数；抽象类可以。

下一章讲属性、索引器与运算符重载——让自定义类型用起来更自然。`,
  },

  // ============================================================
  // 第十二章：属性、索引器与运算符重载
  // ============================================================
  {
    id: 'csharp-ch12',
    group: '第三部分 面向对象',
    icon: '⚙️',
    title: '属性、索引器与运算符重载',
    content: `## 第十二章　属性、索引器与运算符重载

这一章讲让自定义类型用起来更顺手的高级特性：属性的进阶用法、索引器（像数组一样访问对象）、运算符重载（自定义 + - * /）。

### 一、属性进阶

#### 1. init 只读属性（C# 9+）⭐

\`\`\`csharp
// 使用
var p = new Point2D { X = 3, Y = 4 };  // 初始化时可赋值
// p.X = 5;  // 编译错误：init 只能在初始化时赋值
Console.WriteLine(p);

// 类型声明
class Point2D
{
    // init：只能在对象初始化时赋值，之后只读
    public int X { get; init; }
    public int Y { get; init; }

    public override string ToString() => $"({X}, {Y})";
}
\`\`\`

> ⭐ \`init\` 是"初始化后只读"——比 \`set\` 安全（创建后不可改），比纯 \`get\` 灵活（可在初始化器赋值）。

#### 2. required 属性（C# 11+）⭐

\`\`\`csharp
// 使用
var cfg = new Config { Host = "localhost", Port = 8080 };
// var cfg2 = new Config();  // 编译错误：Port 未设置
Console.WriteLine(cfg);

// 类型声明
class Config
{
    // required：必须在初始化时设置
    public required string Host { get; set; }
    public required int Port { get; set; }
    public string? Database { get; set; }  // 可选

    public override string ToString() => $"{Host}:{Port}/{Database ?? "(无数据库)"}";
}
\`\`\`

> ⭐ \`required\` 强制调用者在初始化时设置该属性，避免忘记赋值导致 bug。

### 二、索引器：像数组一样访问对象 ⭐

\`\`\`csharp
// 使用
var list = new SimpleList();
list[0] = "张三";
list[1] = "李四";
Console.WriteLine(list[0]);  // 张三
Console.WriteLine(list[1]);  // 李四

// 类型声明
class SimpleList
{
    private string[] _items = new string[10];

    // 索引器：this[参数] 像属性一样定义
    public string this[int index]
    {
        get => _items[index];
        set => _items[index] = value;
    }
}
\`\`\`

#### 字典式索引器

\`\`\`csharp
// 使用
var dict = new SimpleDict();
dict["apple"] = "苹果";
dict["banana"] = "香蕉";
Console.WriteLine(dict["apple"]);  // 苹果

// 类型声明
class SimpleDict
{
    private Dictionary<string, string> _data = new();

    public string this[string key]
    {
        get => _data.TryGetValue(key, out var v) ? v : "(未找到)";
        set => _data[key] = value;
    }
}
\`\`\`

> ⭐ 索引器让自定义类型能用 \`obj[key]\` 语法——\`Dictionary\`、\`List\`、\`Array\` 都是用索引器实现的。

### 三、运算符重载 ⭐

让自定义类型支持 \`+\`、\`-\`、\`==\` 等运算符，用起来像内置类型一样自然：

\`\`\`csharp
// 使用
var v1 = new Vector(3, 4);
var v2 = new Vector(1, 2);

var sum = v1 + v2;        // 调用 operator +
var diff = v1 - v2;       // 调用 operator -
var neg = -v1;            // 调用 operator -（一元）
Console.WriteLine($"{v1} + {v2} = {sum}");
Console.WriteLine($"{v1} - {v2} = {diff}");
Console.WriteLine($"-{v1} = {neg}");

Console.WriteLine(v1 == v2);  // false（调用重载的 ==）
Console.WriteLine(v1 != v2);  // true

// 类型声明
class Vector
{
    public double X { get; set; }
    public double Y { get; set; }

    public Vector(double x, double y) { X = x; Y = y; }

    // 重载 + 运算符
    public static Vector operator +(Vector a, Vector b)
        => new Vector(a.X + b.X, a.Y + b.Y);

    // 重载 - 运算符
    public static Vector operator -(Vector a, Vector b)
        => new Vector(a.X - b.X, a.Y - b.Y);

    // 重载一元 - 运算符（取反）
    public static Vector operator -(Vector v)
        => new Vector(-v.X, -v.Y);

    // 重载 == 运算符（必须同时重载 !=）
    public static bool operator ==(Vector a, Vector b)
        => a.X == b.X && a.Y == b.Y;

    public static bool operator !=(Vector a, Vector b) => !(a == b);

    // 重写 Equals 和 GetHashCode（重载 == 时必须）
    public override bool Equals(object obj)
        => obj is Vector v && this == v;

    public override int GetHashCode() => HashCode.Combine(X, Y);

    public override string ToString() => $"({X}, {Y})";
}
\`\`\`

> ⭐ 重载 \`==\` 必须同时重载 \`!=\`，并重写 \`Equals\` 和 \`GetHashCode\`——否则编译警告。

### 四、类型转换运算符

\`\`\`csharp
// 使用
Money m = 100m;          // implicit：自动转换
decimal amount = m;       // implicit：自动转换
Console.WriteLine(m);

// 类型声明
class Money
{
    public decimal Amount { get; set; }
    public Money(decimal amount) => Amount = amount;

    // implicit：自动转换（安全、不丢数据）
    public static implicit operator Money(decimal d) => new Money(d);
    public static implicit operator decimal(Money m) => m.Amount;

    public override string ToString() => $"¥{Amount:N2}";
}
\`\`\`

### 五、实战 demo：温度类

\`\`\`csharp
// === 温度类：属性 + 运算符重载 ===
// 演示：让 Temperature 用起来像内置数值类型

// 使用
var t1 = new Temperature(25, TemperatureUnit.Celsius);
var t2 = new Temperature(77, TemperatureUnit.Fahrenheit);

Console.WriteLine($"t1 = {t1}");
Console.WriteLine($"t2 = {t2}");
Console.WriteLine($"t1 摄氏值：{t1.Celsius:F1}°C");
Console.WriteLine($"t2 摄氏值：{t2.Celsius:F1}°C");
Console.WriteLine($"t1 + t2 = {t1 + t2}");
Console.WriteLine($"t1 升高 5°：{t1 + 5}");

// 类型声明
enum TemperatureUnit { Celsius, Fahrenheit }

class Temperature
{
    public double Value { get; set; }
    public TemperatureUnit Unit { get; set; }

    public Temperature(double value, TemperatureUnit unit)
    {
        Value = value;
        Unit = unit;
    }

    // 统一转成摄氏度
    public double Celsius => Unit == TemperatureUnit.Celsius
        ? Value
        : (Value - 32) * 5 / 9;

    // 重载 + 运算符：温度 + 数字
    public static Temperature operator +(Temperature t, double delta)
        => new Temperature(t.Value + delta, t.Unit);

    // 重载 + 运算符：温度 + 温度（统一为摄氏度）
    public static Temperature operator +(Temperature a, Temperature b)
        => new Temperature(a.Celsius + b.Celsius, TemperatureUnit.Celsius);

    public override string ToString() => $"{Value:F1}°{(Unit == TemperatureUnit.Celsius ? "C" : "F")}";
}
\`\`\`

### 六、本章小结

- ⭐ \`init\` 属性：初始化时可赋值，之后只读——比 \`set\` 安全。
- ⭐ \`required\` 属性：强制初始化时设置（C# 11+）。
- ⭐ 索引器 \`this[key]\`：让对象像数组/字典一样访问。
- ⭐ 运算符重载 \`public static T operator +(T a, T b)\`：让自定义类型支持 \`+ - * /\`。
- ⭐ 重载 \`==\` 必须同时重载 \`!=\`、\`Equals\`、\`GetHashCode\`。
- \`implicit operator\` 实现类型自动转换。

下一章进入第四部分，讲泛型——类型安全的复用。`,
  },
];

export { chapters };
