// =============================================================
// C# 教程 - 第三批章节（第三部分 面向对象，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp-ch09 : 第九章 类与对象——面向对象的基石
//   csharp-ch10 : 第十章 继承与多态——代码复用与扩展
//   csharp-ch11 : 第十一章 接口与抽象类——契约与设计
//   csharp-ch12 : 第十二章 属性、索引器与运算符重载
//
// 所有 C# 代码示例均可在交互式编辑器中运行（基于顶级语句）。
// 适用版本：C# 12 / .NET 8 LTS
// =============================================================

const chapters = [
  // ============================================================
  // 第九章：类与对象——面向对象的基石
  // ============================================================
  {
    id: 'csharp-ch09',
    group: '第三部分 面向对象',
    icon: '🧱',
    title: '类与对象——面向对象的基石',
    content: `## 第九章　类与对象——面向对象的基石

### 一、为什么需要面向对象

前八章我们写的都是"过程式"代码——把数据和方法分开，按顺序执行。这在小型脚本里没问题，但当程序规模扩大，就会出现两个痛点：

- **数据和操作数据的方法分散**：维护时要满文件找相关逻辑。
- **复用困难**：相似结构在不同地方重复定义，改一处要改多处。

面向对象编程（OOP）的核心思想是：**把数据和对数据的操作封装成一个整体——"对象"**。它有四大特性：

| 特性 | 含义 | 解决的问题 |
|------|------|-----------|
| 封装 | 数据与方法绑定，对外隐藏内部细节 | 防止外部直接篡改内部状态 |
| 继承 | 子类自动获得父类的成员 | 代码复用、建立类型层次 |
| 多态 | 同一接口、不同实现 | 解耦调用方与实现方 |
| 抽象 | 提取共性、忽略细节 | 控制复杂度 |

C# 从一开始就是"纯面向对象"语言——所有代码都必须放在类（或类型）里，不像 Java 留下了基本类型的"裂缝"（C# 的基本类型在统一类型系统里也有对应的方法）。

### 二、定义类：class 关键字

类是"蓝图"，对象是按蓝图造出的"实例"。定义类使用 \`class\` 关键字：

\`\`\`csharp
// 定义一个"人"类
public class Person
{
    // 字段（Field）：类内部存储数据的地方
    public string Name;
    public int Age;

    // 方法（Method）：类能做的事
    public void Introduce()
    {
        Console.WriteLine($"我叫{Name}，今年{Age}岁。");
    }
}

// 使用类：创建对象
Person p = new Person();
p.Name = "张三";
p.Age = 25;
p.Introduce();  // 我叫张三，今年25岁。
\`\`\`

几个要点：

- **类名**：通常用 PascalCase（每个单词首字母大写），如 \`Person\`、\`OrderService\`。
- **访问修饰符**：\`public\` 表示外部可见，\`private\` 仅类内部可见（默认）。
- **字段**：直接暴露字段不好（破坏封装），后面会用"属性"替代。
- **创建对象**：\`new Person()\` 在堆上分配内存并初始化。

### 三、构造函数：对象的"出生初始化"

构造函数（constructor）是创建对象时自动调用的特殊方法，用于初始化对象状态。它的名字必须与类名相同，没有返回类型。

\`\`\`csharp
public class Person
{
    public string Name;
    public int Age;

    // 无参构造函数
    public Person()
    {
        Name = "匿名";
        Age = 0;
    }

    // 带参构造函数（重载）
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

    public void Introduce() => Console.WriteLine($"我叫{Name}，今年{Age}岁。");
}

// 使用
var p1 = new Person();
var p2 = new Person("李四", 30);
p1.Introduce();  // 我叫匿名，今年0岁。
p2.Introduce();  // 我叫李四，今年30岁。
\`\`\`

**几个关键点：**

1. **如果你没有定义任何构造函数**，编译器会自动生成一个无参构造函数。
2. **如果你定义了带参构造函数**，编译器就**不再**生成无参构造函数——想要无参构造必须显式写出。
3. **构造函数可以重载**：多个构造函数参数不同，调用方按需选择。
4. **构造函数之间可以互相调用**，使用 \`: this(...)\`：

\`\`\`csharp
public class Person
{
    public string Name;
    public int Age;
    public string? Email;

    // 主构造函数：做完整初始化
    public Person(string name, int age, string? email)
    {
        Name = name;
        Age = age;
        Email = email;
    }

    // 复用主构造函数
    public Person(string name, int age) : this(name, age, null) { }

    // 复用带 age 的构造
    public Person(string name) : this(name, 0) { }
}

new Person("王五");  // age=0, email=null
\`\`\`

#### C# 12 主构造函数（Primary Constructor）

C# 12 引入了"主构造函数"语法，可以把构造参数直接写在类名后面，省去字段赋值的样板代码：

\`\`\`csharp
// C# 12 主构造函数
public class Person(string name, int age)
{
    public string Name => name;   // 通过属性暴露
    public int Age => age;

    public void Introduce() => Console.WriteLine($"我叫{Name}，今年{Age}岁。");
}

new Person("赵六", 40).Introduce();
\`\`\`

主构造函数的参数在类的整个作用域内可用，可以赋给字段、属性，或直接在方法中使用。它适合"数据传递型"的类（如 DTO、配置类），不适合需要复杂初始化逻辑的场景。

### 四、字段 vs 属性：封装的演进

直接暴露字段是反模式——外部可以随意赋任何值，没有校验。C# 用"属性"（property）解决这个问题。

#### 完整属性（带 backing field）

\`\`\`csharp
public class Account
{
    private decimal balance;  // 私有字段

    public decimal Balance   // 公开属性
    {
        get { return balance; }
        set
        {
            if (value < 0)
                throw new ArgumentException("余额不能为负");
            balance = value;
        }
    }
}

var acc = new Account();
acc.Balance = 1000;     // 走 set
Console.WriteLine(acc.Balance);  // 1000，走 get
// acc.Balance = -1;    // 抛异常
\`\`\`

- \`value\` 是 set 访问器里的隐式参数，代表外部传入的值。
- 在 set 里可以加校验、记录日志、触发事件。
- 外部读写属性看起来像字段，但底层走方法调用。

#### 自动属性（Auto Property）

如果暂时不需要校验，可以用"自动属性"省去字段声明：

\`\`\`csharp
public class Person
{
    public string Name { get; set; }  // 编译器自动生成私有字段
    public int Age { get; set; }
}
\`\`\`

编译器会自动生成一个匿名的私有字段。需要加校验时再改成完整属性即可，调用方代码不变——这是属性设计的关键优势。

#### 只读属性与 init

\`\`\`csharp
public class Point
{
    // 方式一：只 get，没有 set
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }
}

// C# 9+ 引入 init：只能在对象初始化时赋值，之后不可改
public class Config
{
    public string Host { get; init; } = "localhost";
    public int Port { get; init; } = 8080;
}

var c = new Config { Host = "0.0.0.0", Port = 3306 };
// c.Port = 80;  // 编译错误：init 属性初始化后不能再赋值
\`\`\`

\`init\` 适合"对象一旦创建就不可变"的场景（不可变数据更易推理、更安全）。

### 五、this 关键字

\`this\` 指向当前对象实例。常见用途：

1. **区分参数与字段同名**：
\`\`\`csharp
public Person(string name, int age)
{
    this.name = name;     // this.name 是字段，name 是参数
    this.age = age;
}
private string name;
private int age;
\`\`\`

2. **在方法中传递当前对象**：
\`\`\`csharp
public void Register(Registry r) => r.Add(this);
\`\`\`

3. **链式调用**：
\`\`\`csharp
public class StringBuilder
{
    public StringBuilder Append(string s) { /* ... */ return this; }
}
new StringBuilder().Append("a").Append("b").Append("c");
\`\`\`

4. **构造函数之间调用**（前面已介绍 \`: this(...)\`）。

### 六、static：属于类型，不属于实例

普通成员属于对象实例（每个对象有自己的一份）。\`static\` 成员属于类型本身，所有实例共享一份。

\`\`\`csharp
public class Counter
{
    private static int total = 0;   // 静态字段：所有实例共享

    public int Id { get; }
    public Counter()
    {
        total++;
        Id = total;
    }

    // 静态方法：不依赖实例
    public static int GetTotal() => total;

    // 静态构造函数：类型初始化时调用一次
    static Counter()
    {
        Console.WriteLine("Counter 类型首次被使用");
    }
}

var c1 = new Counter();
var c2 = new Counter();
Console.WriteLine(c1.Id);  // 1
Console.WriteLine(c2.Id);  // 2
Console.WriteLine(Counter.GetTotal());  // 2，用类名调用
\`\`\`

**典型场景：**

- 配置类：\`static class Config { public static string DbHost = "..."; }\`
- 工具类：\`static class MathUtil { public static int Add(int a, int b) => a + b; }\`
- 工厂方法：\`public static Person Create(...) { ... }\`
- 单例模式：\`public static Instance { get; } = new ...\`

#### static class

\`static class\` 修饰的类**不能被实例化**，只能包含 static 成员。常用作工具方法容器：

\`\`\`csharp
public static class StringHelper
{
    public static bool IsNullOrEmpty(string? s) => string.IsNullOrEmpty(s);
    public static string Reverse(string s) => new string(s.Reverse().ToArray());
}

StringHelper.Reverse("abc");  // cba
\`\`\`

### 七、对象初始化器与集合初始化器

C# 提供"对象初始化器"语法，可以在 \`new\` 后用 \`{}\` 一次性给多个属性赋值：

\`\`\`csharp
public class Person
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public List<string> Hobbies { get; set; } = new();
}

var p = new Person
{
    Name = "张三",
    Age = 25,
    Hobbies = { "阅读", "编程" }  // 集合初始化器
};
\`\`\`

集合初始化器 \`{ "a", "b" }\` 会调用集合的 \`Add\` 方法。任何实现了 \`IEnumerable\` 且有 \`Add\` 方法的类型都支持。

### 八、record 类型（C# 9+）

\`record\` 是 C# 9 引入的"不可变引用类型"，专为"数据载体"设计：

\`\`\`csharp
public record Person(string Name, int Age);

var p1 = new Person("张三", 25);
var p2 = new Person("张三", 25);
Console.WriteLine(p1 == p2);  // True，基于值相等

// 不可变：不能改 p1.Name
// 但可以用 with 表达式生成副本并修改
var p3 = p1 with { Age = 26 };
Console.WriteLine(p3);  // Person { Name = 张三, Age = 26 }
\`\`\`

\`record\` 的特点：

- **基于值的相等**：两个 record 字段相同则相等（class 默认是引用相等）。
- **不可变**：属性是只读的。
- **\`with\` 表达式**：基于原对象生成副本并修改部分字段。
- **自动生成** \`ToString()\`、\`Equals\`、\`GetHashCode\`。
- **解构**：\`var (name, age) = p1;\`

**对比 class 与 record：**

| 维度 | class | record |
|------|-------|--------|
| 相等性 | 引用相等（默认） | 值相等 |
| 可变性 | 可变（默认） | 不可变 |
| 典型用途 | 行为对象（服务、控制器） | 数据对象（DTO、领域值） |
| with 表达式 | 不支持 | 支持 |

C# 10 还引入了 \`record struct\`（可变的值类型 record），C# 11 引入了 \`file\` 修饰符限制类型作用域。

### 九、可空引用类型（C# 8+）

C# 8 起引入"可空引用类型"特性，让编译器在编译期检查空引用风险。开启后：

- \`string\` 默认不可空，赋值 \`null\` 会有警告。
- \`string?\` 显式声明可空，使用前必须检查。

\`\`\`csharp
#nullable enable
public class User
{
    public string Name { get; set; }      // 不可空：必须赋非 null 值
    public string? Email { get; set; }   // 可空：可以赋 null

    public string GetEmailOrEmpty() => Email ?? "";
}

var u = new User { Name = "张三" };
// u.Name = null;  // 警告：不能赋 null 给不可空属性
Console.WriteLine(u.GetEmailOrEmpty());  // ""
\`\`\`

可空引用类型不是运行时特性，而是**编译期的"静态分析"**——通过警告帮你提前发现 \`NullReferenceException\` 风险。新项目都建议开启 \`#nullable enable\`。

### 十、本章小结

- 面向对象的四大特性：封装、继承、多态、抽象。
- 类是蓝图，对象是实例；\`class\` 定义类型，\`new\` 创建实例。
- 构造函数用于初始化，可以重载、可以互相调用；C# 12 主构造函数简化了样板代码。
- 字段直接暴露破坏封装，应使用属性（自动属性或完整属性）；\`init\` 用于不可变场景。
- \`this\` 指向当前实例；\`static\` 成员属于类型本身。
- \`record\` 是不可变数据载体，基于值相等，配合 \`with\` 表达式修改副本。
- 可空引用类型在编译期检查 \`null\` 风险，是 C# 防御性编程的重要工具。
`,
  },

  // ============================================================
  // 第十章：继承与多态——代码复用与扩展
  // ============================================================
  {
    id: 'csharp-ch10',
    group: '第三部分 面向对象',
    icon: '🧬',
    title: '继承与多态——代码复用与扩展',
    content: `## 第十章　继承与多态——代码复用与扩展

### 一、继承的本质

继承（Inheritance）让一个类获得另一个类的所有成员（字段、属性、方法），并可以在其基础上扩展或改写。

- **基类（base class / 父类）**：被继承的类。
- **派生类（derived class / 子类）**：继承自基类的类。

C# 用 \`: base\` 语法表示继承（不像 Java 用 \`extends\`）：

\`\`\`csharp
public class Animal
{
    public string Name { get; set; }

    public void Eat()
    {
        Console.WriteLine($"{Name} 在吃东西");
    }
}

// Dog 继承 Animal
public class Dog : Animal
{
    public void Bark()
    {
        Console.WriteLine($"{Name} 汪汪叫");
    }
}

var d = new Dog { Name = "旺财" };
d.Eat();   // 继承自 Animal
d.Bark();   // Dog 自己的方法
\`\`\`

**关键规则：**

1. **C# 是单继承**：一个类只能有一个直接基类（不像 C++ 支持多继承）。
2. **所有类的"祖宗"是 \`object\`**（即 \`System.Object\`）——不写 \`: base\` 时隐式继承 \`object\`。
3. **构造函数不被继承**：派生类要自己定义构造函数，可以通过 \`base(...)\` 调用父类构造。
4. **私有成员能继承但不能访问**：派生类"拥有"父类的 private 字段，但代码里访问不了。

### 二、base 关键字

\`base\` 类似 \`this\`，但指向基类部分。两种典型用法：

#### 1. 调用基类构造函数

\`\`\`csharp
public class Animal
{
    public string Name { get; }
    public Animal(string name) => Name = name;
}

public class Dog : Animal
{
    public string Breed { get; }
    // 派生类构造函数通过 : base(...) 调用父类构造
    public Dog(string name, string breed) : base(name)
    {
        Breed = breed;
    }
}

var d = new Dog("旺财", "柴犬");
Console.WriteLine($"{d.Name} - {d.Breed}");  // 旺财 - 柴犬
\`\`\`

**为什么必须 \`base\`？** 因为基类没有无参构造函数时，派生类必须显式调用一个带参构造，否则编译器不知道父类部分怎么初始化。

#### 2. 调用基类方法（多态相关）

\`\`\`csharp
public class Base
{
    public virtual void Show() => Console.WriteLine("Base.Show");
}

public class Derived : Base
{
    public override void Show()
    {
        base.Show();  // 调用父类版本
        Console.WriteLine("Derived.Show");
    }
}

new Derived().Show();
// Base.Show
// Derived.Show
\`\`\`

### 三、virtual 与 override：实现多态

多态（Polymorphism）是 OOP 的精髓——"同一接口、不同实现"。C# 用 \`virtual\` 和 \`override\` 实现：

- \`virtual\`：在基类标记方法"可被改写"。
- \`override\`：在派生类改写基类的 \`virtual\` 方法。

\`\`\`csharp
public class Animal
{
    public string Name { get; set; }
    public virtual void Speak()  // virtual：子类可改写
    {
        Console.WriteLine("动物发出声音");
    }
}

public class Dog : Animal
{
    public override void Speak()  // override：改写父类方法
    {
        Console.WriteLine($"{Name} 汪汪汪");
    }
}

public class Cat : Animal
{
    public override void Speak()
    {
        Console.WriteLine($"{Name} 喵喵喵");
    }
}

// 多态：用父类引用调用，实际执行子类版本
Animal[] animals = { new Dog { Name = "旺财" }, new Cat { Name = "咪咪" } };
foreach (var a in animals)
{
    a.Speak();
}
// 旺财 汪汪汪
// 咪咪 喵喵喵
\`\`\`

**多态的威力：**

调用方 \`foreach\` 里的代码完全不需要知道 \`a\` 具体是 \`Dog\` 还是 \`Cat\`，运行时根据对象的**实际类型**调用对应的方法。新增动物类型时，主逻辑不用改——这就是"对扩展开放、对修改关闭"（开闭原则）。

#### 注意：不写 virtual/override 的"陷阱"

\`\`\`csharp
public class Animal
{
    public void Speak() { Console.WriteLine("Animal.Speak"); }  // 没有 virtual
}

public class Dog : Animal
{
    public new void Speak() { Console.WriteLine("Dog.Speak"); }  // new：隐藏父类方法
}

Animal a = new Dog();
a.Speak();  // Animal.Speak——按声明类型调用，不是多态！

Dog d = new Dog();
d.Speak();  // Dog.Speak——按 Dog 调用
\`\`\`

如果不写 \`virtual\`，子类用 \`new\` 只是"隐藏"父类方法，不是真正的多态。**绝大多数情况下你想要的是 \`virtual\` + \`override\`，慎用 \`new\`**。

### 四、abstract：抽象方法与抽象类

\`virtual\` 提供了"可选改写"的能力——基类有默认实现，子类可改可不改。但有时基类本身**不应该有实现**（比如"动物"不知道怎么叫），这时用 \`abstract\`：

- \`abstract class\`：抽象类，**不能被实例化**，只能被继承。
- \`abstract\` 方法：抽象方法，**没有方法体**，必须在派生类中 override 实现。

\`\`\`csharp
public abstract class Shape  // 抽象类：不能 new Shape()
{
    public string Name { get; set; }

    // 抽象方法：没有方法体，子类必须实现
    public abstract double Area();

    // 抽象类里也可以有普通方法（用到子类实现的 Area）
    public void PrintArea()
    {
        Console.WriteLine($"{Name} 的面积 = {Area():F2}");
    }
}

public class Circle : Shape
{
    public double Radius { get; set; }
    public override double Area() => Math.PI * Radius * Radius;
}

public class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public override double Area() => Width * Height;
}

Shape[] shapes = {
    new Circle { Name = "圆A", Radius = 3 },
    new Rectangle { Name = "矩形B", Width = 4, Height = 5 }
};
foreach (var s in shapes) s.PrintArea();
// 圆A 的面积 = 28.27
// 矩形B 的面积 = 20.00
\`\`\`

**abstract 与 virtual 的对比：**

| 特性 | abstract | virtual |
|------|----------|---------|
| 适用 | 类、方法、属性、索引器 | 方法、属性、索引器 |
| 是否有方法体 | 无（必须由子类实现） | 有（子类可改可不改） |
| 是否必须被 override | 是（除非子类也是 abstract） | 否 |
| 类的限制 | 所在类必须 abstract | 所在类可以是普通类 |

### 五、sealed：禁止再继承

\`sealed\` 关键字用于"封死"继承链：

- \`sealed class\`：不能被继承（如 \`string\`、\`DateTime\` 都是 sealed）。
- \`sealed override\` 方法：子类不能继续 override 这个方法。

\`\`\`csharp
public sealed class FinalClass { }  // 不能被继承
// public class Sub : FinalClass { }  // 编译错误

public class Base
{
    public virtual void Show() => Console.WriteLine("Base");
}

public class Mid : Base
{
    public sealed override void Show() => Console.WriteLine("Mid");  // 封死
}

public class Leaf : Mid
{
    // public override void Show() => ...  // 编译错误：sealed 不能再 override
}
\`\`\`

**何时用 sealed：**

1. **保护设计**：不希望别人继承破坏逻辑（如框架的内部类型）。
2. **性能优化**：sealed 类的方法调用可以做"非虚调用"优化，编译器能内联。

### 六、里氏替换原则（LSP）

继承的多态有一个基本原则叫**里氏替换原则**：**子类对象必须能完全替换父类对象，而程序行为不变**。

违反 LSP 的典型例子：

\`\`\`csharp
// 错误示范：经典的"鸟"问题
public class Bird
{
    public virtual void Fly() => Console.WriteLine("飞翔");
}

public class Penguin : Bird
{
    public override void Fly() => throw new NotSupportedException("企鹅不会飞");
}

void MakeFly(Bird b) => b.Fly();

MakeFly(new Penguin());  // 运行时抛异常，违反 LSP
\`\`\`

**修复方法**：调整继承层次，把 \`Fly\` 移到 \`FlyableBird\` 子类，企鹅不继承它能飞的方法。

判断是否符合 LSP 的简单准则：

- 子类不能**加强**前置条件（参数更严）。
- 子类不能**削弱**后置条件（返回值更弱）。
- 子类不能抛出**新的异常**（除非是父类声明过的）。

### 七、协变与逆变（了解）

C# 4 引入的泛型协变/逆变，让泛型类型之间也能反映继承关系。这里只做概念介绍：

- **协变（out）**：\`IEnumerable<Dog>\` 可以赋给 \`IEnumerable<Animal>\`（子到父）。
- **逆变（in）**：\`Action<Animal>\` 可以赋给 \`Action<Dog>\`（父到子）。

\`\`\`csharp
// 协变示例
IEnumerable<Dog> dogs = new List<Dog>();
IEnumerable<Animal> animals = dogs;  // OK：协变

// 逆变示例
Action<Animal> animalAction = a => Console.WriteLine(a.Name);
Action<Dog> dogAction = animalAction;  // OK：逆变
\`\`\`

日常业务代码用得不多，主要在框架/库设计时考虑。

### 八、组合 vs 继承

继承容易被滥用。"Is-a" 关系用继承（狗是一种动物），"Has-a" 关系用组合（汽车有引擎）。

**继承的代价：**

- 强耦合：父类改了，所有子类都受影响。
- 编译期固定：继承关系在编译时就确定了，运行时不能改。
- 爆炸式膨胀：功能多时容易形成深层继承链。

**组合（Composition）：** 把功能拆成独立对象，作为字段持有，运行时可替换。

\`\`\`csharp
// 继承方式（不推荐）
public class FlyableBird : Bird { public void Fly() { } }
public class SwimmerBird : Bird { public void Swim() { } }
// 如果有鸟既能飞又能游，就要多继承，但 C# 不支持

// 组合方式（推荐）
public interface IFlyBehavior { void Fly(); }
public interface ISwimBehavior { void Swim(); }

public class Bird
{
    public IFlyBehavior? FlyBehavior { get; set; }
    public ISwimBehavior? SwimBehavior { get; set; }

    public void TryFly() => FlyBehavior?.Fly();
    public void TrySwim() => SwimBehavior?.Swim();
}

// 行为可在运行时替换（策略模式）
var duck = new Bird
{
    FlyBehavior = new SimpleFly(),
    SwimBehavior = new FloatSwim()
};
duck.TryFly();
duck.TrySwim();
\`\`\`

设计原则：**"多用组合，少用继承"**。优先用接口 + 组合，能解耦；继承适合真正的类型层次（is-a）。

### 九、综合示例：员工系统

\`\`\`csharp
public abstract class Employee
{
    public string Name { get; }
    public decimal BaseSalary { get; }

    protected Employee(string name, decimal baseSalary)
    {
        Name = name;
        BaseSalary = baseSalary;
    }

    public abstract decimal CalculatePay();  // 子类各自实现

    public virtual string GetInfo() => $"{Name}（基本工资 {BaseSalary:C}）";
}

public class FullTimeEmployee : Employee
{
    public decimal Bonus { get; }

    public FullTimeEmployee(string name, decimal salary, decimal bonus)
        : base(name, salary)
    {
        Bonus = bonus;
    }

    public override decimal CalculatePay() => BaseSalary + Bonus;

    public override string GetInfo() => $"全职员工 {base.GetInfo()}，奖金 {Bonus:C}";
}

public class Contractor : Employee
{
    public int Hours { get; }
    public decimal HourlyRate { get; }

    public Contractor(string name, int hours, decimal rate)
        : base(name, 0)
    {
        Hours = hours;
        HourlyRate = rate;
    }

    public override decimal CalculatePay() => Hours * HourlyRate;

    public override string GetInfo() => $"外包员工 {Name}（{Hours} 小时 × {HourlyRate:C}）";
}

Employee[] employees = {
    new FullTimeEmployee("张三", 20000, 5000),
    new Contractor("李四", 80, 300),
};

foreach (var e in employees)
{
    Console.WriteLine($"{e.GetInfo()}，应发 {e.CalculatePay():C}");
}
// 全职员工 张三（基本工资 ¥20,000.00），奖金 ¥5,000.00，应发 ¥25,000.00
// 外包员工 李四（80 小时 × ¥300.00），应发 ¥24,000.00
\`\`\`

这个例子综合体现了：

- **抽象类**：\`Employee\` 提供共同字段和方法骨架。
- **抽象方法**：\`CalculatePay\` 强制子类实现。
- **virtual 方法**：\`GetInfo\` 提供默认实现，子类选择性 override。
- **\`base\` 调用**：子类的 \`GetInfo\` 复用父类版本。
- **多态**：循环里用父类引用，调用的是各自子类版本。

### 十、本章小结

- 继承用 \`: base\` 语法，单继承，所有类最终继承 \`object\`。
- \`base\` 关键字用于调用父类构造和方法。
- \`virtual\` + \`override\` 实现多态：父类声明类型，子类提供实现。
- \`abstract\` 类不能实例化，抽象方法必须被子类实现。
- \`sealed\` 阻止继续继承。
- 里氏替换原则：子类必须能完全替换父类，不破坏程序预期。
- 优先组合而非继承，保持低耦合。
`,
  },

  // ============================================================
  // 第十一章：接口与抽象类——契约与设计
  // ============================================================
  {
    id: 'csharp-ch11',
    group: '第三部分 面向对象',
    icon: '🤝',
    title: '接口与抽象类——契约与设计',
    content: `## 第十一章　接口与抽象类——契约与设计

### 一、接口是什么

接口（Interface）是一种"契约"——它定义了一组方法/属性的签名，但**不提供实现**。任何实现接口的类，必须提供这些方法的具体实现。

接口与抽象类的最大区别：

| 维度 | 接口（interface） | 抽象类（abstract class） |
|------|------------------|------------------------|
| 实现 | 不能有字段、不能有具体方法（C# 8 前完全无实现） | 可以有字段、构造、具体方法 |
| 多继承 | 一个类可同时实现多个接口 | 只能继承一个抽象类 |
| 表达 | "能做什么"（Can-do） | "是什么"（Is-a） |
| 字段 | 不允许 | 允许 |
| 构造函数 | 不允许 | 允许 |
| 访问修饰符 | 默认 public（不能改） | 任意 |

**核心心法：** 接口表示能力/契约，抽象类表示类型层次。优先用接口，需要共享代码时才用抽象类。

### 二、定义与实现接口

接口用 \`interface\` 关键字定义，习惯上以 \`I\` 开头（如 \`IDisposable\`、\`IEnumerable\`、\`IComparable\`）：

\`\`\`csharp
// 定义接口
public interface IComparable
{
    int CompareTo(object? obj);
}

public interface IDisposable
{
    void Dispose();
}

// 实现接口
public class FileResource : IDisposable
{
    public void Dispose()
    {
        Console.WriteLine("释放文件资源");
    }
}

var r = new FileResource();
r.Dispose();
\`\`\`

**接口实现的两种方式：**

1. **隐式实现**：上面这种 \`public void Dispose()\`，可以通过类引用或接口引用调用。
2. **显式实现**：用 \`void IDisposable.Dispose()\` 形式，**只能通过接口引用调用**，不能通过类引用调用。

\`\`\`csharp
public class FileResource : IDisposable
{
    // 显式实现
    void IDisposable.Dispose()
    {
        Console.WriteLine("释放资源");
    }
}

var r = new FileResource();
// r.Dispose();  // 编译错误：显式实现必须通过接口调用
((IDisposable)r).Dispose();  // OK
\`\`\`

**显式实现的使用场景：**

- 接口方法名与类已有方法冲突，避免歧义。
- 不希望接口方法出现在类的公共 API 中（强制调用方用接口引用）。

### 三、一个类实现多个接口

接口的"多继承"特性是它比抽象类的最大优势：

\`\`\`csharp
public interface IComparable
{
    int CompareTo(object? obj);
}

public interface ICloneable
{
    object Clone();
}

public interface IFormattable
{
    string ToString(string? format, IFormatProvider? provider);
}

public class Money : IComparable, ICloneable, IFormattable
{
    public decimal Amount { get; }

    public Money(decimal amount) => Amount = amount;

    public int CompareTo(object? obj)
    {
        if (obj is Money m) return Amount.CompareTo(m.Amount);
        throw new ArgumentException("类型不匹配");
    }

    public object Clone() => new Money(Amount);

    public string ToString(string? format, IFormatProvider? provider)
    {
        return format == "C" ? Amount.ToString("C", provider) : Amount.ToString();
    }
}

var m1 = new Money(100);
var m2 = (Money)m1.Clone();
Console.WriteLine(m1.CompareTo(m2));  // 0
Console.WriteLine(m1.ToString("C", null));  // ¥100.00
\`\`\`

### 四、接口的属性与索引器

接口不仅能定义方法，还能定义属性和索引器（签名 + getter/setter）：

\`\`\`csharp
public interface INamed
{
    string Name { get; set; }     // 属性
    string Id { get; }            // 只读属性
}

public interface IStringList
{
    string this[int index] { get; set; }  // 索引器
}

public class MyList : IStringList
{
    private string[] _data = new string[10];

    public string this[int index]
    {
        get => _data[index];
        set => _data[index] = value;
    }
}
\`\`\`

### 五、默认接口方法（C# 8+）

C# 8 引入"默认接口方法"——接口可以提供方法的默认实现，实现类不强制 override：

\`\`\`csharp
public interface ILogger
{
    void Log(string message);

    // 默认实现
    void LogError(string message) => Log($"[ERROR] {message}");
    void LogWarning(string message) => Log($"[WARN] {message}");
}

public class ConsoleLogger : ILogger
{
    public void Log(string message) => Console.WriteLine(message);
    // 不实现 LogError / LogWarning，用默认版本
}

var logger = new ConsoleLogger();
logger.Log("普通日志");
logger.LogError("出错了");  // 调用接口的默认实现
// ConsoleLogger 没有定义 LogError，但接口提供了默认
\`\`\`

**注意陷阱：** 默认方法只能通过接口引用调用：

\`\`\`csharp
ILogger logger = new ConsoleLogger();
logger.LogError("xxx");  // OK：通过接口引用

ConsoleLogger cl = new ConsoleLogger();
// cl.LogError("xxx");  // 编译错误：ConsoleLogger 类没有公开 LogError 方法
\`\`\`

**默认接口方法的设计意图：**

- **API 演进**：给已发布的接口添加新方法，不破坏现有实现（Java 8 的 \`default\` 方法同样目的）。
- **混入（Mixin）**：把多个方法的默认实现组合在一起。

但日常业务代码中要谨慎使用——它让接口"半像抽象类"，复杂度上升。

### 六、抽象类 vs 接口：怎么选

什么时候用抽象类，什么时候用接口？给一个简单决策原则：

**用抽象类当：**

- 一组相关的类型需要共享**代码实现**（不只是签名）。
- 需要字段、构造函数、访问修饰符。
- 类型之间是"Is-a"关系（动物 → 狗）。

**用接口当：**

- 想表达"能力"而非"是什么"（可比较、可释放、可枚举）。
- 类型之间没有共同祖先，但都"能做某事"。
- 需要多继承。

#### 例子：抽象类与接口共存

\`\`\`csharp
// 抽象类：共享代码
public abstract class Animal
{
    public string Name { get; set; }
    public void Breathe() => Console.WriteLine($"{Name} 呼吸");
    public abstract void Speak();
}

// 接口：表达能力
public interface ITrainable
{
    void Train(string command);
}

// 接口：表达"能被收养"
public interface IAdoptable
{
    bool IsAdopted { get; set; }
}

public class Dog : Animal, ITrainable, IAdoptable
{
    public override void Speak() => Console.WriteLine("汪汪");
    public void Train(string command) => Console.WriteLine($"学会：{command}");
    public bool IsAdopted { get; set; }
}
\`\`\`

这里 \`Animal\` 是"是什么"（共享代码），\`ITrainable\` / \`IAdoptable\` 是"能做什么"（不同能力组合）。

### 七、依赖倒置原则（DIP）

接口的另一大价值：**解耦**。SOLID 中的 D（依赖倒置原则）说：

> 高层模块不应该依赖低层模块，两者都应该依赖抽象。

**反例（依赖具体类）：**

\`\`\`csharp
public class MySQLDatabase
{
    public void Save(User u) { /* 写 MySQL */ }
}

public class UserService
{
    private MySQLDatabase _db = new MySQLDatabase();  // 直接依赖具体类

    public void Register(User u) => _db.Save(u);
}

// 问题：换 PostgreSQL 要改 UserService
\`\`\`

**改进（依赖接口）：**

\`\`\`csharp
public interface IUserRepository
{
    void Save(User u);
    User? Find(int id);
}

public class MySQLUserRepo : IUserRepository
{
    public void Save(User u) { Console.WriteLine("写入 MySQL"); }
    public User? Find(int id) => null;
}

public class PostgresUserRepo : IUserRepository
{
    public void Save(User u) { Console.WriteLine("写入 Postgres"); }
    public User? Find(int id) => null;
}

public class UserService
{
    private readonly IUserRepository _repo;

    // 通过构造函数注入
    public UserService(IUserRepository repo) => _repo = repo;

    public void Register(User u) => _repo.Save(u);
}

// 切换实现只需换注入的实例
var svc1 = new UserService(new MySQLUserRepo());
var svc2 = new UserService(new PostgresUserRepo());
\`\`\`

\`UserService\` 只依赖 \`IUserRepository\` 接口，不关心底层是 MySQL 还是 Postgres。这就是"面向接口编程"——也是 DI（依赖注入）的基础。

### 八、接口的多态

接口本身也是多态的工具。多个不相关的类实现同一接口，可以统一处理：

\`\`\`csharp
public interface IDrawable
{
    void Draw();
}

public class Circle : IDrawable { public void Draw() => Console.WriteLine("画圆"); }
public class Square : IDrawable { public void Draw() => Console.WriteLine("画方"); }
public class Triangle : IDrawable { public void Draw() => Console.WriteLine("画三角"); }

IDrawable[] shapes = {
    new Circle(),
    new Square(),
    new Triangle()
};

foreach (var s in shapes) s.Draw();
\`\`\`

\`Circle\` / \`Square\` / \`Triangle\` 没有继承关系，但都"能画"，可以通过 \`IDrawable\` 接口统一管理。

### 九、常用 .NET 接口速览

.NET BCL 内置了大量接口，掌握几个常用的：

| 接口 | 用途 | 主要方法 |
|------|------|---------|
| \`IEnumerable<T>\` | 可枚举（支持 foreach） | \`GetEnumerator()\` |
| \`IQueryable<T>\` | 可查询表达式树（LINQ Provider） | - |
| \`ICollection<T>\` | 可增删的集合 | \`Add\`, \`Remove\`, \`Count\` |
| \`IList<T>\` | 可索引的集合 | \`this[int]\`, \`IndexOf\` |
| \`IDictionary<K,V>\` | 键值对集合 | \`this[K]\`, \`Keys\`, \`Values\` |
| \`IComparable<T>\` | 可比较（排序） | \`CompareTo(T)\` |
| \`IComparer<T>\` | 比较器（外部） | \`Compare(T, T)\` |
| \`IEquatable<T>\` | 类型安全的相等判断 | \`Equals(T)\` |
| \`IDisposable\` | 可释放资源 | \`Dispose()\` |
| \`ICloneable\` | 可克隆 | \`Clone()\` |
| \`IFormattable\` | 自定义格式化 | \`ToString(string, IFormatProvider)\` |
| \`IConvertible\` | 类型转换 | \`ToType(Type, IFormatProvider)\` |

实际开发中你会反复遇到这些接口——比如写 \`foreach\` 就是在用 \`IEnumerable\`，写 LINQ 的 \`Where\` 也是。

### 十、本章小结

- 接口是契约，定义"能做什么"；抽象类是基类，定义"是什么 + 共享代码"。
- 一个类只能继承一个基类，但可以实现多个接口——这是接口最大的优势。
- 显式实现让接口方法不暴露在类 API 中，强制通过接口引用调用。
- C# 8+ 默认接口方法支持 API 演进和混入模式，但增加了复杂度。
- 依赖倒置原则：高层模块和低层模块都依赖抽象（接口），不直接依赖具体类。
- 掌握 .NET BCL 的常用接口（IEnumerable、IDisposable、IComparable 等），是阅读和编写 C# 代码的基础。
`,
  },

  // ============================================================
  // 第十二章：属性、索引器与运算符重载
  // ============================================================
  {
    id: 'csharp-ch12',
    group: '第三部分 面向对象',
    icon: '🔑',
    title: '属性、索引器与运算符重载',
    content: `## 第十二章　属性、索引器与运算符重载

### 一、属性回顾与进阶

属性（Property）是 C# 实现"封装"的核心机制。第九章已介绍过基础用法，这里补充更多进阶内容。

#### 三种属性形态对比

\`\`\`csharp
public class Sample
{
    // 1. 自动属性：最简形式，编译器生成 backing field
    public string AutoName { get; set; }

    // 2. 完整属性：手动控制 get/set
    private int _age;
    public int Age
    {
        get => _age;
        set
        {
            if (value < 0 || value > 150)
                throw new ArgumentOutOfRangeException(nameof(value));
            _age = value;
        }
    }

    // 3. 只读属性（计算属性）：只有 get
    public bool IsAdult => Age >= 18;

    // 4. init 属性（C# 9+）：初始化后不可变
    public string ReadOnlyAfterInit { get; init; } = "";
}
\`\`\`

**表达体属性（Expression-bodied）**：用 \`=>\` 简化单行 get/set：

\`\`\`csharp
private string _name;
public string Name
{
    get => _name;
    set => _name = value ?? throw new ArgumentNullException();
}
\`\`\`

#### required 关键字（C# 11+）

\`required\` 修饰符要求构造对象时必须显式赋值：

\`\`\`csharp
public class User
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }  // 可选
}

// 必须赋值 Name 和 Email
var u = new User { Name = "张三", Email = "zs@example.com" };
// var u2 = new User { Email = "..." };  // 编译警告：未赋值 Name
\`\`\`

\`required\` 比"在构造函数里强制传参"更灵活——可以配合对象初始化器使用，常用于 DTO、配置类。

### 二、属性的最佳实践

#### 1. 校验与通知

属性 setter 是天然的校验位置：

\`\`\`csharp
public class Temperature
{
    private decimal _celsius;
    public decimal Celsius
    {
        get => _celsius;
        set
        {
            if (value < -273.15m)
                throw new ArgumentOutOfRangeException("绝对零度不可达");
            var old = _celsius;
            _celsius = value;
            OnTemperatureChanged(old, value);
        }
    }

    public event Action<decimal, decimal>? TemperatureChanged;

    protected virtual void OnTemperatureChanged(decimal old, decimal @new)
        => TemperatureChanged?.Invoke(old, @new);
}

var t = new Temperature();
t.TemperatureChanged += (o, n) => Console.WriteLine($"温度变化 {o} → {n}");
t.Celsius = 25;
t.Celsius = 30;
// 温度变化 0 → 25
// 温度变化 25 → 30
\`\`\`

#### 2. 派生属性 vs 缓存属性

\`\`\`csharp
public class Rectangle
{
    public double Width { get; set; }
    public double Height { get; set; }

    // 计算属性：每次访问都计算
    public double Area => Width * Height;

    // 缓存：Width/Height 变化时重新计算（略复杂）
    // 适合计算成本高的场景
}
\`\`\`

#### 3. 不要在 get/set 里做副作用大的事

属性本质是"像字段一样访问的成员"，使用者期望它快、纯、可预测。所以：

- ❌ 不要在 get 里做数据库查询
- ❌ 不要在 set 里做 IO、网络请求
- ✅ 加校验、触发事件、维护不变量（invariant）是 OK 的

需要复杂操作时，应该用方法（如 \`CalculateTotal()\`）而不是属性。

### 三、索引器（Indexer）

索引器让对象可以像数组一样用 \`obj[index]\` 访问。语法类似属性，但用 \`this[...]\`：

#### 简单示例

\`\`\`csharp
public class StringCollection
{
    private string[] _items = new string[10];

    public string this[int index]
    {
        get => _items[index];
        set => _items[index] = value;
    }

    public int Length => _items.Length;
}

var col = new StringCollection();
col[0] = "hello";
col[1] = "world";
Console.WriteLine(col[0]);   // hello
Console.WriteLine(col[1]);   // world
\`\`\`

#### 字典式索引器（多参数）

索引器可以接受多个参数，常用于实现矩阵、字典：

\`\`\`csharp
public class Matrix
{
    private double[,] _data = new double[3, 3];

    public double this[int row, int col]
    {
        get => _data[row, col];
        set => _data[row, col] = value;
    }
}

var m = new Matrix();
m[0, 0] = 1;
m[1, 1] = 1;
m[2, 2] = 1;
Console.WriteLine(m[0, 0]);  // 1
\`\`\`

#### 字符串索引器

索引器的参数类型不限于 int，也可以是 string：

\`\`\`csharp
public class HttpHeader
{
    private Dictionary<string, string> _headers = new();

    public string this[string name]
    {
        get => _headers.TryGetValue(name, out var v) ? v : "";
        set => _headers[name] = value;
    }

    public IEnumerable<string> Keys => _headers.Keys;
}

var h = new HttpHeader();
h["Content-Type"] = "application/json";
h["Authorization"] = "Bearer abc123";

Console.WriteLine(h["Content-Type"]);  // application/json
\`\`\`

#### 索引器与接口

索引器可以定义在接口里：

\`\`\`csharp
public interface ILookup
{
    object? this[string key] { get; set; }
}

public class Config : ILookup
{
    private Dictionary<string, object> _data = new();

    public object? this[string key]
    {
        get => _data.TryGetValue(key, out var v) ? v : null;
        set => _data[key] = value!;
    }
}
\`\`\`

### 四、运算符重载

C# 允许给自定义类型定义运算符的行为。比如让 \`Money + Money\`、\`Vector * scalar\` 都能用符号表达，代码更直观。

#### 一元与二元运算符

\`\`\`csharp
public struct Vector
{
    public double X { get; }
    public double Y { get; }

    public Vector(double x, double y) { X = x; Y = y; }

    // 二元 + 运算符
    public static Vector operator +(Vector a, Vector b)
        => new Vector(a.X + b.X, a.Y + b.Y);

    // 二元 - 运算符
    public static Vector operator -(Vector a, Vector b)
        => new Vector(a.X - b.X, a.Y - b.Y);

    // 标量乘法（Vector * double）
    public static Vector operator *(Vector v, double s)
        => new Vector(v.X * s, v.Y * s);

    // 标量乘法（double * Vector，需要再定义一次）
    public static Vector operator *(double s, Vector v) => v * s;

    // 一元取反
    public static Vector operator -(Vector v) => new Vector(-v.X, -v.Y);

    public override string ToString() => $"({X}, {Y})";
}

var v1 = new Vector(1, 2);
var v2 = new Vector(3, 4);

Console.WriteLine(v1 + v2);    // (4, 6)
Console.WriteLine(v1 - v2);    // (-2, -2)
Console.WriteLine(v1 * 3);     // (3, 6)
Console.WriteLine(3 * v1);     // (3, 6)
Console.WriteLine(-v1);        // (-1, -2)
\`\`\`

**规则：**

1. 运算符重载必须是 \`public static\`。
2. 参数类型中至少有一个是定义该运算符的类型。
3. C# 不允许重载 \`=\`、\`&&\`、\`||\`（但 \`&&\` / \`||\` 通过 \`&\` / \`|\` + \`true\` / \`false\` 运算符推导）。

#### 比较运算符

\`\`\`csharp
public struct Money : IComparable<Money>
{
    public decimal Amount { get; }
    public Money(decimal amount) => Amount = amount;

    public static bool operator ==(Money a, Money b) => a.Amount == b.Amount;
    public static bool operator !=(Money a, Money b) => !(a == b);
    public static bool operator <(Money a, Money b) => a.Amount < b.Amount;
    public static bool operator >(Money a, Money b) => a.Amount > b.Amount;
    public static bool operator <=(Money a, Money b) => a.Amount <= b.Amount;
    public static bool operator >=(Money a, Money b) => a.Amount >= b.Amount;

    public int CompareTo(Money other) => Amount.CompareTo(other.Amount);

    // 重写 == 必须同时重写 Equals 和 GetHashCode
    public override bool Equals(object? obj) => obj is Money m && Amount == m.Amount;
    public override int GetHashCode() => Amount.GetHashCode();
}

var a = new Money(100);
var b = new Money(100);
var c = new Money(200);

Console.WriteLine(a == b);   // True
Console.WriteLine(a < c);    // True
Console.WriteLine(a != c);   // True
\`\`\`

**重要：** 重载 \`==\` 必须同时：

- 重载 \`!=\`
- 重写 \`Equals(object)\` 和 \`GetHashCode()\`（保持一致性）

否则会出现 \`a == b\` 为 true 但 \`a.Equals(b)\` 为 false 的混乱情况。

#### 转换运算符

可以定义自定义类型之间的隐式/显式转换：

\`\`\`csharp
public struct Celsius
{
    public double Value { get; }
    public Celsius(double v) => Value = v;
}

public struct Fahrenheit
{
    public double Value { get; }
    public Fahrenheit(double v) => Value = v;

    // 显式转换（可能有精度损失或异常时用）
    public static explicit operator Celsius(Fahrenheit f)
        => new Celsius((f.Value - 32) * 5 / 9);

    // 显式转换（反向）
    public static explicit operator Fahrenheit(Celsius c)
        => new Fahrenheit(c.Value * 9 / 5 + 32);
}

var f = new Fahrenheit(100);
Celsius c = (Celsius)f;  // 显式转换
Console.WriteLine(c.Value);  // 37.777...

var c2 = new Celsius(37);
Fahrenheit f2 = (Fahrenheit)c2;
Console.WriteLine(f2.Value);  // 98.6
\`\`\`

**隐式转换：** 用 \`implicit operator\`，调用方不需要写 \`()\`：

\`\`\`csharp
public struct Meter
{
    public double Value { get; }
    public Meter(double v) => Value = v;

    // 隐式：double → Meter
    public static implicit operator Meter(double d) => new Meter(d);
    // 隐式：Meter → double
    public static implicit operator double(Meter m) => m.Value;
}

Meter m = 3.5;        // double → Meter
double d = m;         // Meter → double
\`\`\`

**隐式 vs 显式的选择原则：**

- 转换**永不失败、不丢精度**：用隐式（如 \`Meter → double\`）。
- 转换**可能失败或丢精度**：用显式，强制调用方写 \`()\` 提醒（如 \`double → int\`、\`string → int\`）。

#### true / false 运算符

比较少用，但可以让对象在 \`if (obj)\` 上下文使用：

\`\`\`csharp
public struct DBBool
{
    public static readonly DBBool True = new(1);
    public static readonly DBBool False = new(-1);
    public static readonly DBBool Null = new(0);

    private readonly int _value;
    private DBBool(int v) => _value = v;

    public static bool operator true(DBBool x) => x._value > 0;
    public static bool operator false(DBBool x) => x._value < 0;
}

DBBool b = DBBool.True;
if (b) Console.WriteLine("yes");  // 输出 yes
\`\`\`

### 五、综合示例：自定义集合

把属性、索引器、运算符结合起来，实现一个简化的列表类型：

\`\`\`csharp
public class Vector<T> : IEnumerable<T>
{
    private T[] _items;
    public int Count { get; private set; }
    public int Capacity => _items.Length;

    public Vector() : this(4) { }
    public Vector(int capacity) { _items = new T[capacity]; }

    // 索引器
    public T this[int index]
    {
        get
        {
            if (index < 0 || index >= Count)
                throw new IndexOutOfRangeException();
            return _items[index];
        }
        set
        {
            if (index < 0 || index >= Count)
                throw new IndexOutOfRangeException();
            _items[index] = value;
        }
    }

    public void Add(T item)
    {
        if (Count == _items.Length)
        {
            var newArray = new T[_items.Length * 2];
            Array.Copy(_items, newArray, _items.Length);
            _items = newArray;
        }
        _items[Count++] = item;
    }

    // 运算符：Vector + Vector = 合并后的新 Vector
    public static Vector<T> operator +(Vector<T> a, Vector<T> b)
    {
        var result = new Vector<T>(a.Count + b.Count);
        for (int i = 0; i < a.Count; i++) result.Add(a[i]);
        for (int i = 0; i < b.Count; i++) result.Add(b[i]);
        return result;
    }

    public IEnumerator<T> GetEnumerator()
    {
        for (int i = 0; i < Count; i++) yield return _items[i];
    }

    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        => GetEnumerator();

    public override string ToString() => $"[{string.Join(", ", this)}]";
}

var v1 = new Vector<int> { 1, 2, 3 };
var v2 = new Vector<int> { 4, 5 };
var v3 = v1 + v2;
Console.WriteLine(v3);  // [1, 2, 3, 4, 5]
Console.WriteLine(v3[2]);  // 3
\`\`\`

这里融合了：泛型、索引器、运算符重载、IEnumerable、yield、对象初始化器——是面向对象特性的综合演练。

### 六、本章小结

- 属性是封装的核心：自动属性、完整属性、init、required 满足不同场景。
- 索引器让对象可以像数组/字典一样用 \`obj[index]\` 访问。
- 运算符重载让自定义类型支持 \`+\`、\`-\`、\`*\` 等运算，让代码更直观。
- 重载 \`==\` 时必须同时重载 \`!=\`、重写 \`Equals\` 和 \`GetHashCode\`，保持一致性。
- 隐式转换用于无精度损失的转换，显式转换用于可能失败的场景。
- 综合运用属性、索引器、运算符、接口，能写出非常优雅的领域类型。
`,
  },
];

export { chapters };
