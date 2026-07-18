// =============================================================
// C# 从入门到精通大全 - 第三批章节（第三部分 面向对象基础，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp2-ch10 : 第十章 类与对象入门
//   csharp2-ch11 : 第十一章 字段、属性与方法
//   csharp2-ch12 : 第十二章 构造函数与对象初始化
//   csharp2-ch13 : 第十三章 静态成员与静态类
//   csharp2-ch14 : 第十四章 继承基础
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例可在顶级语句中同时定义类与调用。
// =============================================================

const chapters = [
  // ============================================================
  // 第十章：类与对象入门
  // ============================================================
  {
    id: 'csharp2-ch10',
    group: '第三部分 面向对象基础',
    icon: '🏛️',
    title: '第十章 类与对象入门',
    content: `## 第十章　类与对象入门

从这一章开始进入 **面向对象编程（OOP）**。这一章讲清类是什么、怎么定义、怎么 new 对象、访问修饰符怎么用。掌握后你就能写出自定义类型。

### 一、为什么需要类

前 9 章你用 \`int\`、\`string\`、\`double\` 这些**内置类型**写代码。但现实世界的事物很复杂——一个「学生」有姓名、年龄、成绩、班级，没法用一个 \`string\` 表达。

**类（class）就是自定义类型**：把相关数据和行为打包到一起。

\`\`\`csharp
// 没有类之前：用一堆散变量描述一个学生
string name1 = "张三"; int age1 = 20; double score1 = 85.5;
string name2 = "李四"; int age2 = 21; double score2 = 92.0;
// 10 个学生就要 30 个变量，根本管不过来

// 有了类之后：一个变量装所有信息
class Student {
    public string Name;
    public int Age;
    public double Score;
}

// 顶级语句里直接用
var s1 = new Student { Name = "张三", Age = 20, Score = 85.5 };
var s2 = new Student { Name = "李四", Age = 21, Score = 92.0 };
Console.WriteLine($"{s1.Name} {s1.Age}岁 成绩{s1.Score}");
\`\`\`

> 类是**图纸**，对象是按图纸造出来的**实物**。一张图纸可以造无数个对象。

### 二、定义类 ⭐

\`\`\`csharp
// 最简单的类
class Dog {
    // 字段：存数据
    public string Name;
    public int Age;

    // 方法：定义行为
    public void Bark() {
        Console.WriteLine($"{Name} 汪汪叫！");
    }
}

// 使用
var dog = new Dog();
dog.Name = "旺财";
dog.Age = 3;
dog.Bark();  // 旺财 汪汪叫！
\`\`\`

类成员分两类：

- **字段（field）**：存数据，类似变量。
- **方法（method）**：定义行为，类似函数。
- 还有属性、构造函数、事件等，后续章节细讲。

> ⭐ 类名用 **PascalCase**（首字母大写），如 \`Student\`、\`OrderService\`。字段、方法同理。

### 三、创建对象：new 关键字 ⭐

\`new\` 按类图纸在堆上创建对象，返回引用：

\`\`\`csharp
class Point {
    public double X;
    public double Y;
}

// 1. new + 字段赋值（最常用）
var p1 = new Point { X = 3.0, Y = 4.0 };

// 2. new 后逐个赋值
var p2 = new Point();
p2.X = 1.0;
p2.Y = 2.0;

// 3. 显式类型（不常用 var）
Point p3 = new Point { X = 5, Y = 5 };

// C# 9+ 目标类型 new：左边已声明类型，右边可省略
Point p4 = new();

Console.WriteLine($"p1=({p1.X},{p1.Y})");
Console.WriteLine($"p4=({p4.X},{p4.Y})");  // 0,0 默认值
\`\`\`

> ⭐ \`var p = new Student();\` 是日常最常用写法。\`Point p4 = new();\` 在已知类型时更简洁。

### 四、成员默认值

字段不显式赋值时，C# 给默认值：

\`\`\`csharp
class Defaults {
    public int Count;          // 0
    public double Price;       // 0.0
    public bool IsActive;      // false
    public string Name;        // null ⚠️
    public DateTime Created;   // 0001-01-01
}

var d = new Defaults();
Console.WriteLine($"int: {d.Count}");      // 0
Console.WriteLine($"double: {d.Price}");   // 0
Console.WriteLine($"bool: {d.IsActive}");  // False
Console.WriteLine($"string: {d.Name}");    // (空，实际是 null)
Console.WriteLine($"DateTime: {d.Created:yyyy-MM-dd}");  // 0001-01-01
\`\`\`

> ⚠️ **引用类型（string、对象）默认是 \`null\`**，访问其成员会抛 \`NullReferenceException\`。后续章节讲可空引用类型解决这问题。

### 五、字段 vs 属性（先建立概念）

这章先用**字段**讲类，下一章细讲属性。先看个对比例子：

\`\`\`csharp
class PersonBad {
    // 字段：直接暴露，外部可随意改
    public int Age;
}

class PersonGood {
    // 属性：通过 get/set 控制
    public int Age { get; set; }
}

var p1 = new PersonBad { Age = -100 };  // 居然能成功！不合法
var p2 = new PersonGood { Age = -100 }; // 也能成功，但可以在 set 里加校验
Console.WriteLine($"Bad: {p1.Age}, Good: {p2.Age}");
\`\`\`

字段像「直接打开冰箱拿东西」，属性像「通过售货员拿东西，可以加规则」。**实战中 99% 用属性**，字段只在私有内部状态用。

### 六、方法

方法是类里的函数，描述「这个对象能做什么」：

\`\`\`csharp
class Calculator {
    // 实例方法：通过对象调用
    public int Add(int a, int b) {
        return a + b;
    }

    // 带默认参数
    public int Multiply(int a, int b = 2) {
        return a * b;
    }
}

var calc = new Calculator();
Console.WriteLine($"1+2 = {calc.Add(1, 2)}");
Console.WriteLine($"3*2 = {calc.Multiply(3)}");     // b 用默认值 2
Console.WriteLine($"3*4 = {calc.Multiply(3, 4)}");  // 覆盖默认值
\`\`\`

### 七、this 关键字 ⭐

\`this\` 指向**当前对象自己**。参数和字段同名时必须用 \`this\` 区分：

\`\`\`csharp
class User {
    public string Name;
    public string Email;

    // 参数名和字段同名：用 this.Name 区分
    public void SetInfo(string Name, string Email) {
        this.Name = Name;     // this.Name 是字段，Name 是参数
        this.Email = Email;
    }

    // 用 this 调本类其他方法
    public void Print() {
        Console.WriteLine($"{this.Name} <{this.Email}>");
        this.Log("打印完成");  // this 可省略，写出来表达"调本类的"
    }

    private void Log(string msg) {
        Console.WriteLine($"[LOG] {msg}");
    }
}

var u = new User();
u.SetInfo("张三", "zs@example.com");
u.Print();
\`\`\`

> ⭐ 参数名和字段同名是**好习惯**——参数名清晰表达意图，靠 \`this\` 消歧义。

### 八、访问修饰符 ⭐

控制成员的**可见性**，是封装的基础：

| 修饰符 | 谁能访问 |
| --- | --- |
| \`public\` | 任何地方 |
| \`private\` | 只有本类内部 |
| \`protected\` | 本类 + 子类 |
| \`internal\` | 同一程序集（项目） |
| \`protected internal\` | 同程序集 或 子类 |
| \`private protected\` | 同程序集 且 子类 |

\`\`\`csharp
class BankAccount {
    public string Owner;          // 公开：外部可读可写
    private decimal balance;      // 私有：只有本类能访问
    protected string Currency;    // 受保护：本类和子类

    public BankAccount(string owner, decimal initial) {
        Owner = owner;
        balance = initial;
        Currency = "CNY";
    }

    // 公开方法：提供受控的访问入口
    public decimal GetBalance() => balance;

    public void Deposit(decimal amount) {
        if (amount <= 0) {
            Console.WriteLine("存款必须为正");
            return;
        }
        balance += amount;  // 内部能改 balance
        Console.WriteLine($"{Owner} 存入 {amount}，余额 {balance}");
    }
}

var acc = new BankAccount("张三", 1000m);
Console.WriteLine($"户主：{acc.Owner}");
Console.WriteLine($"余额：{acc.GetBalance()}");
// Console.WriteLine(acc.balance);  // ❌ 编译错误：private 不可访问
acc.Deposit(500);
\`\`\`

> ⭐ **默认就是 private**（不写修饰符时）。实战经验：字段一律 private，通过公开方法/属性暴露。

### 九、实战 demo：简易图书管理

\`\`\`csharp
class Book {
    public string Title;
    public string Author;
    public decimal Price;
    public int Stock;

    public void Display() {
        Console.WriteLine($"《{Title}》- {Author} | ￥{Price:F2} | 库存{Stock}");
    }

    public bool TryBuy(int qty) {
        if (qty <= 0) {
            Console.WriteLine("数量必须为正");
            return false;
        }
        if (qty > Stock) {
            Console.WriteLine($"库存不足，仅剩 {Stock} 本");
            return false;
        }
        Stock -= qty;
        Console.WriteLine($"成功购买 {qty} 本，花费 ￥{Price * qty:F2}");
        return true;
    }
}

// 顶级语句使用
var book = new Book {
    Title = "C# 从入门到精通",
    Author = "微软",
    Price = 89.9m,
    Stock = 10
};

book.Display();
book.TryBuy(3);
book.TryBuy(20);  // 库存不足
book.TryBuy(-1);  // 参数非法
book.Display();
\`\`\`

### 十、小结

- 类是自定义类型，把数据和行为打包。
- \`new\` 创建对象，\`var p = new Person();\` 最常用。
- 字段有默认值，**引用类型默认 null**。
- 字段像直接暴露数据，属性像带控制的入口——实战用属性。
- \`this\` 指向当前对象，参数和字段同名时消歧义。
- 访问修饰符控制可见性：\`public\` 全开、\`private\` 全关、\`protected\` 留给子类、\`internal\` 限程序集。
- 默认就是 \`private\`，字段一律设私有。`,
  },

  // ============================================================
  // 第十一章：字段、属性与方法
  // ============================================================
  {
    id: 'csharp2-ch11',
    group: '第三部分 面向对象基础',
    icon: '🔧',
    title: '第十一章 字段、属性与方法',
    content: `## 第十一章　字段、属性与方法

上一章建立了类的概念，这章把成员讲透——字段什么时候用、属性怎么写、方法怎么重载、静态和实例的区别。

### 一、字段：私有数据存储 ⭐

字段是类里直接声明的变量。**好习惯：字段一律私有**，用 \`_\` 前缀或驼峰命名：

\`\`\`csharp
class Temperature {
    // 私有字段：用 _ 前缀，标识"内部状态"
    private double _celsius;

    // 常量字段：用 PascalCase
    private const double AbsoluteZero = -273.15;

    // 只读字段：构造时赋值，之后不能改
    private readonly string _sensorId;

    public Temperature(string sensorId, double initialCelsius) {
        _sensorId = sensorId;
        _celsius = initialCelsius;
    }

    public void Show() {
        Console.WriteLine($"传感器 {_sensorId}：{_celsius}°C（绝对零度 {AbsoluteZero}°C）");
    }
}

var t = new Temperature("S001", 25.5);
t.Show();
\`\`\`

> ⭐ 字段命名：私有用 \`_camelCase\`，公开（少用）用 \`PascalCase\`。\`const\` 编译期常量，\`readonly\` 运行时常量（构造后不可变）。

### 二、属性：受控访问 ⭐

属性是「看起来像字段，本质是方法」的成员。基础语法：

\`\`\`csharp
class Product {
    private string _name;  // 后备字段

    // 完整属性：自定义 get/set 逻辑
    public string Name {
        get { return _name; }
        set {
            if (string.IsNullOrEmpty(value))
                throw new ArgumentException("名称不能为空");
            _name = value;  // value 是 set 的隐式参数
        }
    }

    private decimal _price;
    public decimal Price {
        get => _price;
        set {
            if (value < 0) {
                Console.WriteLine("价格不能为负，已设为 0");
                _price = 0;
            } else {
                _price = value;
            }
        }
    }
}

var p = new Product();
p.Name = "鼠标";
p.Price = 99.9m;
Console.WriteLine($"{p.Name}：￥{p.Price}");

// p.Name = "";  // ❌ 抛异常
p.Price = -10;   // 触发校验，价格变 0
Console.WriteLine($"修正后价格：{p.Price}");
\`\`\`

> ⭐ \`value\` 是 set 访问器的隐式参数，代表外部传入的值。属性的核心价值：**在 set 里加校验，挡住非法数据**。

### 三、自动属性 ⭐⭐

写完整属性太啰嗦。如果不需要校验，用**自动属性**让编译器自动生成后备字段：

\`\`\`csharp
class User {
    // 自动属性：编译器自动生成私有后备字段
    public string Name { get; set; }

    // 只读自动属性：set 设为 private，只能在构造函数或本类方法里赋值
    public DateTime CreatedAt { get; private set; }

    public User(string name) {
        Name = name;
        CreatedAt = DateTime.Now;
    }
}

var u = new User("张三");
Console.WriteLine($"{u.Name} 创建于 {u.CreatedAt:yyyy-MM-dd HH:mm}");
// u.CreatedAt = DateTime.Now;  // ❌ 编译错误：set 是 private
\`\`\`

> ⭐⭐ **日常开发 80% 用自动属性**——简洁、安全、可后期升级成完整属性而不破坏调用方。

### 四、init 只读属性（C# 9+）⭐

\`init\` 关键字：属性只能在**对象初始化时**赋值，之后不可改。介于 \`set\`（任意时刻可改）和 \`private set\`（仅本类可改）之间：

\`\`\`csharp
class Order {
    public int Id { get; init; }
    public string Customer { get; init; }
    public decimal Total { get; init; }

    public void Show() => Console.WriteLine($"订单 #{Id}：{Customer} ￥{Total}");
}

// init 属性只能在初始化器里赋值
var order = new Order { Id = 1001, Customer = "李四", Total = 250m };
order.Show();

// order.Id = 1002;  // ❌ 编译错误：init 后不可修改
\`\`\`

> ⭐ \`init\` 适合**不可变数据对象**——DTO、配置、值对象。配合对象初始化器写法清爽，又保证了不可变性。

### 五、required 必填属性（C# 11+）⭐

\`required\` 强制调用方在初始化时必须赋值，否则编译报错：

\`\`\`csharp
class Account {
    public required string Username { get; set; }    // 必须赋值
    public required string Email { get; set; }        // 必须赋值
    public string? Nickname { get; set; }             // 可选
}

// ✅ 正确：必填属性都赋值了
var acc = new Account { Username = "zhangsan", Email = "zs@x.com" };
Console.WriteLine($"{acc.Username} / {acc.Email} / {acc.Nickname ?? "无"}");

// ❌ 编译错误：少 Email
// var bad = new Account { Username = "zhangsan" };

// ❌ 编译错误：必须用初始化器
// var bad2 = new Account();
// bad2.Username = "zhangsan";  // 也不行
\`\`\`

> ⭐ \`required\` 解决了「对象创建后才发现忘了设关键字段」的痛点，编译期就拦截。

### 六、表达式体属性

属性只有一行时，用 \`=>\` 简写：

\`\`\`csharp
class Rectangle {
    public double Width { get; set; }
    public double Height { get; set; }

    // 只读计算属性，用表达式体
    public double Area => Width * Height;

    public bool IsSquare => Width == Height;
}

var r = new Rectangle { Width = 4, Height = 5 };
Console.WriteLine($"面积：{r.Area}");
Console.WriteLine($"是正方形：{r.IsSquare}");
\`\`\`

> 计算属性（不存数据，根据其他属性算出来）用 \`=>\` 写最简洁。

### 七、方法重载 ⭐

同名方法，参数列表不同（个数/类型/顺序），让调用方根据数据自动选合适版本：

\`\`\`csharp
class Printer {
    // 重载 1：打印字符串
    public void Print(string s) {
        Console.WriteLine($"[文本] {s}");
    }

    // 重载 2：打印整数
    public void Print(int n) {
        Console.WriteLine($"[数字] {n}");
    }

    // 重载 3：打印多个值
    public void Print(string label, int value) {
        Console.WriteLine($"[{label}] {value}");
    }

    // 重载 4：可选参数（小心与重载冲突）
    public void Print(string s, int times = 1) {
        for (int i = 0; i < times; i++) {
            Console.WriteLine($"[重复] {s}");
        }
    }
}

var p = new Printer();
p.Print("hello");        // 调重载 1
p.Print(42);             // 调重载 2
p.Print("分数", 95);     // 调重载 3
p.Print("hi", 3);        // ⚠️ 有歧义！编译器选最近的，可能调重载 4
\`\`\`

> ⭐ 方法重载让 API 简洁——一个 \`Print\` 名字搞定多种输入。但**可选参数 + 重载容易产生歧义**，避免同时用。

### 八、静态方法 vs 实例方法 ⭐

- **实例方法**：通过对象调用，能访问实例字段。
- **静态方法**：通过类名调用，**不能访问实例成员**，只访问静态成员。

\`\`\`csharp
class MathHelper {
    // 静态方法：不依赖对象状态，用类名调用
    public static double Square(double x) => x * x;

    public static int Max(int a, int b) => a > b ? a : b;

    // 实例方法：依赖对象状态
    public string Formatter { get; set; } = "F2";

    public string Format(double value) {
        return value.ToString(Formatter);
    }
}

// 静态方法：类名.方法名
Console.WriteLine($"3 的平方：{MathHelper.Square(3)}");
Console.WriteLine($"max(5,8)：{MathHelper.Max(5, 8)}");

// 实例方法：对象.方法名
var helper = new MathHelper { Formatter = "P1" };
Console.WriteLine($"格式化：{helper.Format(0.856)}");
\`\`\`

> ⭐ 判断标准：**方法是否依赖对象状态**。\`Math.Sqrt\` 不依赖任何对象，静态；\`student.GetGPA()\` 依赖具体学生，实例。

### 九、实战 demo：商品库存系统

\`\`\`csharp
class Product {
    // 私有字段
    private int _stock;

    // 自动属性
    public required string Sku { get; init; }
    public required string Name { get; init; }

    // 带校验的属性
    public decimal Price { get; set; }

    // 只读计算属性
    public decimal StockValue => Price * _stock;

    // init 只读：库存只能初始化或通过方法改
    public int Stock {
        get => _stock;
        init => _stock = value >= 0 ? value : throw new ArgumentException("库存不能为负");
    }

    // 方法重载：补货
    public void Restock(int qty) {
        if (qty <= 0) {
            Console.WriteLine("补货数量必须为正");
            return;
        }
        _stock += qty;
        Console.WriteLine($"{Name} 补货 {qty}，当前库存 {_stock}");
    }

    public void Restock(int qty, string note) {
        Restock(qty);
        Console.WriteLine($"  备注：{note}");
    }

    public bool Sell(int qty) {
        if (qty > _stock) {
            Console.WriteLine($"{Name} 库存不足");
            return false;
        }
        _stock -= qty;
        Console.WriteLine($"售出 {qty} 件 {Name}，收入 ￥{Price * qty:F2}");
        return true;
    }
}

// 顶级语句使用
var p = new Product {
    Sku = "P001",
    Name = "无线鼠标",
    Price = 99m,
    Stock = 50
};

Console.WriteLine($"初始库存价值：￥{p.StockValue:F2}");
p.Sell(10);
p.Restock(20, "周一批次");
p.Sell(100);  // 库存不足
Console.WriteLine($"最终库存价值：￥{p.StockValue:F2}");
\`\`\`

### 十、小结

- 字段一律私有，命名 \`_camelCase\`；\`const\` 编译期、\`readonly\` 运行期。
- 属性是带控制的入口，\`value\` 是 set 隐式参数。
- **自动属性**日常最常用，简洁可升级。
- \`init\` 让属性只在初始化时赋值，适合不可变对象。
- \`required\`（C# 11+）强制必填，编译期拦截。
- 计算属性用 \`=>\` 表达式体简写。
- 方法重载让 API 简洁，但避免与可选参数冲突。
- 静态方法不依赖对象，类名调用；实例方法依赖对象状态。`,
  },

  // ============================================================
  // 第十二章：构造函数与对象初始化
  // ============================================================
  {
    id: 'csharp2-ch12',
    group: '第三部分 面向对象基础',
    icon: '🏗️',
    title: '第十二章 构造函数与对象初始化',
    content: `## 第十二章　构造函数与对象初始化

构造函数是对象诞生时执行的代码，负责初始化字段。这一章讲透默认构造、重载、链式调用、对象初始化器、析构函数。

### 一、默认构造函数 ⭐

如果你**不写任何构造函数**，编译器自动生成一个无参的「默认构造函数」，把字段设为默认值：

\`\`\`csharp
class Point {
    public double X;
    public double Y;
}

// 编译器自动给了无参构造
var p = new Point();
Console.WriteLine($"({p.X}, {p.Y})");  // (0, 0)
\`\`\`

**一旦你写了任何构造函数，默认构造函数就消失了**：

\`\`\`csharp
class Point {
    public double X;
    public double Y;

    // 自定义带参构造
    public Point(double x, double y) {
        X = x;
        Y = y;
    }
}

var p1 = new Point(3, 4);   // ✅
// var p2 = new Point();    // ❌ 编译错误：无参构造已消失
\`\`\`

> ⭐ 想保留无参构造，必须显式写出来。这是常见陷阱。

### 二、带参构造函数 ⭐

构造函数名和类名相同，无返回类型，参数用于接收初始化数据：

\`\`\`csharp
class User {
    public string Name { get; }
    public string Email { get; }
    public DateTime CreatedAt { get; }

    // 带参构造：强制创建时提供必要信息
    public User(string name, string email) {
        if (string.IsNullOrEmpty(name))
            throw new ArgumentException("名称不能为空");
        if (string.IsNullOrEmpty(email))
            throw new ArgumentException("邮箱不能为空");

        Name = name;
        Email = email;
        CreatedAt = DateTime.Now;
    }
}

var u = new User("张三", "zs@example.com");
Console.WriteLine($"{u.Name} <{u.Email}> 创建于 {u.CreatedAt:yyyy-MM-dd}");
// var bad = new User();  // ❌ 必须传参
\`\`\`

> ⭐ 构造函数的核心价值：**保证对象一创建就处于合法状态**。把校验放构造函数里，避免「创建后忘记设置」的 bug。

### 三、构造函数重载 ⭐

像方法一样，构造函数也能重载，提供多种初始化方式：

\`\`\`csharp
class Order {
    public int OrderId { get; }
    public string Customer { get; }
    public decimal Amount { get; }
    public string? Note { get; }

    // 重载 1：完整参数
    public Order(int id, string customer, decimal amount, string? note) {
        OrderId = id;
        Customer = customer;
        Amount = amount;
        Note = note;
    }

    // 重载 2：省略备注
    public Order(int id, string customer, decimal amount)
        : this(id, customer, amount, null) { }  // 链式调重载 1

    // 重载 3：默认金额 0
    public Order(int id, string customer)
        : this(id, customer, 0, null) { }
}

var o1 = new Order(1001, "张三", 250m, "加急");
var o2 = new Order(1002, "李四", 180m);
var o3 = new Order(1003, "王五");
Console.WriteLine($"{o1.OrderId} {o1.Customer} ￥{o1.Amount} 备注:{o1.Note ?? "无"}");
Console.WriteLine($"{o2.OrderId} {o2.Customer} ￥{o2.Amount}");
Console.WriteLine($"{o3.OrderId} {o3.Customer} ￥{o3.Amount}");
\`\`\`

> ⭐ 重载构造函数时，**用 \`: this(...)\` 链式调用**避免重复代码。把主逻辑放在参数最全的那个构造里。

### 四、this() 链式调用 ⭐

\`this(...)\` 在构造函数初始化器里调用本类其他构造函数：

\`\`\`csharp
class Logger {
    public string Target { get; }
    public LogLevel Level { get; }

    // 主构造：参数最全
    public Logger(string target, LogLevel level) {
        Target = target;
        Level = level;
        Console.WriteLine($"[初始化] 目标={target}, 级别={level}");
    }

    // 链式：只指定 target，level 默认 Info
    public Logger(string target) : this(target, LogLevel.Info) { }

    // 链式：全默认值
    public Logger() : this("console", LogLevel.Info) { }
}

enum LogLevel { Debug, Info, Warning, Error }

// 调用时按需选择
var l1 = new Logger("file.log", LogLevel.Error);
var l2 = new Logger("console");
var l3 = new Logger();
\`\`\`

> ⭐ 链式调用的执行顺序：**先执行被引用的构造（this 后面的），再执行当前构造体**。所以基础初始化先跑，再跑专属逻辑。

### 五、base() 调用父类构造（先建立概念，下章细讲）

子类构造函数默认调用父类无参构造。如果父类没有无参构造，必须显式用 \`base(...)\` 指定：

\`\`\`csharp
class Animal {
    public string Name { get; }

    public Animal(string name) {
        Name = name;
        Console.WriteLine($"[Animal] 创建 {name}");
    }
}

class Dog : Animal {
    public string Breed { get; }

    // : base(name) 调用父类带参构造
    public Dog(string name, string breed) : base(name) {
        Breed = breed;
        Console.WriteLine($"[Dog] 创建 {breed} 犬 {name}");
    }
}

var d = new Dog("旺财", "金毛");
// 输出顺序：
// [Animal] 创建 旺财
// [Dog] 创建 金毛犬 旺财
\`\`\`

> 构造顺序：**父类先构造，子类后构造**。就像盖楼，先打地基再起上层。

### 六、对象初始化器 {} ⭐

用 \`{}\` 在创建对象时一次性给属性赋值，无需写一堆构造函数重载：

\`\`\`csharp
class Product {
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }
    public bool InStock { get; set; }
}

// 用初始化器：可设任意属性组合
var p = new Product {
    Name = "键盘",
    Price = 199m,
    Category = "外设",
    InStock = true
};

// 等价于：
var p2 = new Product();
p2.Name = "键盘";
p2.Price = 199m;
p2.Category = "外设";
p2.InStock = true;

Console.WriteLine($"{p.Name} {p.Category} ￥{p.Price}");
\`\`\`

> ⭐ 对象初始化器是日常最常用的创建对象方式——**不用为每种属性组合写构造重载**，灵活又清晰。

### 七、集合初始化器 ⭐

List、Dictionary 等集合也能用 \`{}\` 初始化：

\`\`\`csharp
using System.Collections.Generic;

// List 初始化器
var names = new List<string> { "张三", "李四", "王五" };

// Dictionary 初始化器
var scores = new Dictionary<string, int> {
    ["张三"] = 85,
    ["李四"] = 92,
    ["王五"] = 78
};

// 旧写法（仍然支持）
var scores2 = new Dictionary<string, int> {
    { "张三", 85 },
    { "李四", 92 }
};

foreach (var n in names) {
    Console.WriteLine($"{n}: {scores[n]}");
}
\`\`\`

> ⭐ \`["key"] = value\` 是 C# 6+ 推荐写法，更直观，且支持索引器初始化。

### 八、with 表达式（record 专用，C# 9+）⭐

\`with\` 表达式基于现有对象创建一个**修改部分属性**的副本，**仅限 record 类型**：

\`\`\`csharp
// record 类型：值语义的不可变对象（第十七章详讲）
public record Point(double X, double Y);

var p1 = new Point(3, 4);
Console.WriteLine($"原始：{p1}");

// with 表达式：基于 p1 创建副本，只改 X
var p2 = p1 with { X = 10 };
Console.WriteLine($"修改后：{p2}");
Console.WriteLine($"原对象不变：{p1}");
\`\`\`

> ⭐ \`with\` 在不可变数据流（DTO 转换、状态更新）里极其方便，比手动 clone + 修改简洁太多。

### 九、析构函数（少用）

析构函数在对象被垃圾回收时调用，C# 用 \`~类名\` 语法。**绝大多数情况不需要写**：

\`\`\`csharp
class TempFile {
    public string Path { get; }

    public TempFile(string path) {
        Path = path;
        Console.WriteLine($"[构造] 创建临时文件 {path}");
    }

    // 析构函数：GC 回收时调用，时机不确定
    ~TempFile() {
        Console.WriteLine($"[析构] 清理 {Path}");
        // 实际清理逻辑（如关闭文件句柄）应实现 IDisposable，下章/后续讲
    }
}

// 注意：析构时机由 GC 决定，不能依赖它清理关键资源
{
    var f = new TempFile("/tmp/a.tmp");
    Console.WriteLine("使用文件中...");
}  // 离开作用域，f 无引用，等待 GC
Console.WriteLine("方法结束");

// 主动触发 GC（仅演示用，生产环境别这么干）
GC.Collect();
GC.WaitForPendingFinalizers();
Console.WriteLine("GC 完成");
\`\`\`

> ⚠️ **析构函数有性能开销**，会让对象多活一代。**清理非托管资源请用 \`IDisposable\` + \`using\`**（后续章节详讲），不要用析构函数。

### 十、实战 demo：员工管理系统

\`\`\`csharp
class Employee {
    // init 属性：创建后不变
    public int Id { get; init; }
    public string Name { get; init; }

    // 可变属性
    public decimal Salary { get; set; }
    public string Department { get; set; }

    // 只读计算属性
    public string Display => $"#{Id} {Name} ({Department}) ￥{Salary:N0}";

    // 主构造：必填字段
    public Employee(int id, string name, decimal salary, string department) {
        Id = id;
        Name = name;
        Salary = salary;
        Department = department;
    }

    // 链式：默认部门
    public Employee(int id, string name, decimal salary)
        : this(id, name, salary, "未分配") { }

    // 升职加薪
    public void Raise(decimal percent) {
        Salary *= 1 + percent / 100;
        Console.WriteLine($"{Name} 加薪 {percent}%，新薪资 ￥{Salary:N0}");
    }

    public void Transfer(string newDept) {
        Department = newDept;
        Console.WriteLine($"{Name} 调岗至 {newDept}");
    }
}

// 顶级语句使用
var emp1 = new Employee(1, "张三", 15000m, "技术部");
var emp2 = new Employee(2, "李四", 12000m);  // 用默认部门

Console.WriteLine(emp1.Display);
Console.WriteLine(emp2.Display);

emp1.Raise(15);
emp1.Transfer("架构组");
emp2.Raise(10);
emp2.Transfer("市场部");

Console.WriteLine(emp1.Display);
Console.WriteLine(emp2.Display);
\`\`\`

### 十一、小结

- 不写构造函数，编译器给无参默认构造；写了任何构造，默认消失。
- 构造函数核心价值：**保证对象一出生就合法**。
- 重载构造用 \`: this(...)\` 链式调用，避免重复。
- 子类用 \`: base(...)\` 调父类构造，**先父后子**。
- 对象初始化器 \`{}\` 是日常最常用创建方式，灵活。
- 集合初始化器：\`["k"] = v\` 是 C# 6+ 推荐写法。
- \`with\` 表达式仅限 record，做不可变副本。
- 析构函数少用，清理资源请用 \`IDisposable\`。`,
  },

  // ============================================================
  // 第十三章：静态成员与静态类
  // ============================================================
  {
    id: 'csharp2-ch13',
    group: '第三部分 面向对象基础',
    icon: '⚙️',
    title: '第十三章 静态成员与静态类',
    content: `## 第十三章　静态成员与静态类

\`static\` 关键字让成员属于「类本身」而非「某个对象」。这一章讲清静态字段、静态方法、静态类、单例模式、const vs readonly、扩展方法。

### 一、static 字段/属性/方法 ⭐

加 \`static\` 后，成员属于类，不依赖任何对象：

\`\`\`csharp
class Counter {
    // 静态字段：所有实例共享
    private static int _totalCount = 0;

    // 静态属性
    public static int TotalCount => _totalCount;

    // 实例字段：每个对象独立
    public string Name { get; }

    public Counter(string name) {
        Name = name;
        _totalCount++;  // 每创建一个对象，共享计数 +1
        Console.WriteLine($"创建 {name}，当前总数 {_totalCount}");
    }
}

// 通过类名访问静态成员
Console.WriteLine($"初始总数：{Counter.TotalCount}");

var c1 = new Counter("A");
var c2 = new Counter("B");
var c3 = new Counter("C");

Console.WriteLine($"最终总数：{Counter.TotalCount}");
\`\`\`

> ⭐ 静态成员的生命周期：**程序运行期间一直存在**，不随对象销毁。所有实例共享同一份数据。

### 二、静态方法 ⭐

静态方法不依赖对象状态，通过类名调用。\`Math\`、\`Console\`、\`Convert\` 都是经典例子：

\`\`\`csharp
class StringUtils {
    // 静态方法：纯函数，输入决定输出
    public static bool IsNullOrEmpty(string s) {
        return s == null || s.Length == 0;
    }

    public static string Reverse(string s) {
        if (s == null) return null;
        var chars = s.ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }

    public static string Repeat(string s, int times) {
        if (times <= 0) return "";
        return string.Concat(Enumerable.Repeat(s, times));
    }
}

// 类名.方法名
Console.WriteLine($"null 空？{StringUtils.IsNullOrEmpty(null)}");
Console.WriteLine($"反转：{StringUtils.Reverse("hello")}");
Console.WriteLine($"重复：{StringUtils.Repeat("AB", 3)}");
\`\`\`

> ⭐ **判断标准**：方法不访问实例字段 → 静态。这样调用更直观（\`StringUtils.Reverse\`），也省去 new 对象的开销。

### 三、静态构造函数

静态构造函数在**类首次被使用时**执行一次，用于初始化静态成员：

\`\`\`csharp
class AppConfig {
    // 静态字段
    public static string Version;
    public static DateTime StartTime;

    // 静态构造函数：无参、无访问修饰符、不能手动调用
    static AppConfig() {
        Version = "1.0.0";
        StartTime = DateTime.Now;
        Console.WriteLine($"[静态构造] 应用启动于 {StartTime:HH:mm:ss}");
    }

    public static void ShowInfo() {
        Console.WriteLine($"版本 {Version}，已运行 {(DateTime.Now - StartTime).TotalSeconds:F1} 秒");
    }
}

// 第一次访问类的任何成员，触发静态构造
AppConfig.ShowInfo();
Thread.Sleep(500);
AppConfig.ShowInfo();  // 不会再触发静态构造
\`\`\`

> 静态构造函数**只执行一次**，时机由运行时决定。常用于加载配置、初始化静态字典等。

### 四、静态类 ⭐

加 \`static\` 修饰的类：**不能实例化、不能有实例成员、必须全部静态**。是工具类的标准写法：

\`\`\`csharp
static class MathUtils {
    // 静态字段
    public const double Pi = 3.14159265358979;
    public static readonly double E = Math.E;

    // 静态方法
    public static double CircleArea(double r) => Pi * r * r;
    public static double CirclePerimeter(double r) => 2 * Pi * r;

    public static int Factorial(int n) {
        if (n < 0) throw new ArgumentException("n 不能为负");
        return n <= 1 ? 1 : n * Factorial(n - 1);
    }
}

// var m = new MathUtils();  // ❌ 编译错误：静态类不能实例化
Console.WriteLine($"π = {MathUtils.Pi}");
Console.WriteLine($"半径 5 的圆面积：{MathUtils.CircleArea(5):F2}");
Console.WriteLine($"5! = {MathUtils.Factorial(5)}");
\`\`\`

> ⭐ **工具类一律用静态类**：\`Math\`、\`Convert\`、\`File\`、\`Path\`、\`JsonSerializer\` 等。一看 \`static class\` 就知道是工具，不会误 new。

### 五、单例模式 ⭐

单例（Singleton）：保证一个类只有一个实例，全局访问点。是静态 + 惰性创建的经典应用：

\`\`\`csharp
class Logger {
    private static Logger _instance;
    private static readonly object _lock = new();

    // 构造函数私有：外部不能 new
    private Logger() {
        Console.WriteLine("[Logger] 初始化");
    }

    // 静态属性：惰性创建唯一实例
    public static Logger Instance {
        get {
            if (_instance == null) {  // 双重检查锁，提升性能
                lock (_lock) {
                    if (_instance == null) {
                        _instance = new Logger();
                    }
                }
            }
            return _instance;
        }
    }

    public void Log(string msg) {
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {msg}");
    }
}

// 使用
Logger.Instance.Log("应用启动");
Logger.Instance.Log("处理请求");
Logger.Instance.Log("应用结束");
// 全程只创建一个 Logger 实例
\`\`\`

> ⭐ 单例的两个核心：**私有构造**（挡住外部 new）+ **静态属性**（提供全局访问点）。后续会讲更简洁的依赖注入方式替代手写单例。

### 六、const vs static readonly ⭐

两者都像「常量」，但本质不同：

\`\`\`csharp
class Constants {
    // const：编译期常量，编译时替换为字面值
    public const double Pi = 3.14159;
    public const string AppName = "我的应用";
    public const int MaxRetry = 3;

    // static readonly：运行时常量，运行时读取
    public static readonly DateTime BuildTime = DateTime.Now;
    public static readonly Guid AppId = Guid.NewGuid();
    public static readonly int[] Primes = { 2, 3, 5, 7, 11 };
}

Console.WriteLine($"π = {Constants.Pi}");
Console.WriteLine($"应用：{Constants.AppName}");
Console.WriteLine($"构建时间：{Constants.BuildTime:yyyy-MM-dd HH:mm:ss}");
Console.WriteLine($"AppId：{Constants.AppId}");
Console.WriteLine($"质数：{string.Join(", ", Constants.Primes)}");
\`\`\`

| 对比 | \`const\` | \`static readonly\` |
| --- | --- | --- |
| 时机 | 编译期 | 运行时 |
| 类型 | 仅内置简单类型 | 任意类型 |
| 分配 | 不分配字段，编译替换 | 分配字段 |
| 跨程序集 | 改值需重编译所有引用 | 改值只重启即可 |

> ⭐ **简单数值用 \`const\`，复杂类型或运行时值用 \`static readonly\`**。跨程序集的常量更要小心：const 改了不重编译引用方会用到旧值。

### 七、扩展方法简介 ⭐

扩展方法让你**给已有类型添加方法，而不修改其源码**。语法：静态类 + 静态方法 + \`this\` 参数：

\`\`\`csharp
// 定义扩展方法（必须放在静态类里）
static class StringExtensions {
    // this string 表示给 string 扩展一个方法
    public static bool IsEmail(this string s) {
        if (string.IsNullOrEmpty(s)) return false;
        return s.Contains('@') && s.Contains('.');
    }

    public static string Truncate(this string s, int maxLen) {
        if (s == null) return null;
        return s.Length <= maxLen ? s : s.Substring(0, maxLen) + "...";
    }
}

// 顶级语句使用
string email = "zs@example.com";
Console.WriteLine($"是邮箱？{email.IsEmail()}");

string longText = "这是一段很长的文本需要截断处理";
Console.WriteLine($"截断：{longText.Truncate(10)}");
\`\`\`

> ⭐ 扩展方法在 LINQ 里被大量使用（\`.Where()\`、\`.Select()\` 都是扩展方法）。日常写工具方法优先考虑扩展方法，让调用更自然。

### 八、实战 demo：配置类与工具类

\`\`\`csharp
// 1. 静态配置类
static class AppSettings {
    // 编译期常量
    public const string AppName = "订单系统";
    public const int Version = 1;

    // 运行时常量
    public static readonly Guid AppId = Guid.NewGuid();
    public static readonly DateTime StartedAt = DateTime.Now;

    // 静态字段（运行时可变）
    public static string Environment = "Development";

    // 静态方法
    public static bool IsProduction => Environment == "Production";

    public static void PrintBanner() {
        Console.WriteLine("====== 应用信息 ======");
        Console.WriteLine($"名称：{AppName} v{Version}");
        Console.WriteLine($"AppId：{AppId}");
        Console.WriteLine($"环境：{Environment}");
        Console.WriteLine($"启动：{StartedAt:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine($"生产：{IsProduction}");
        Console.WriteLine("======================");
    }
}

// 2. 单例日志类
class AppLogger {
    private static AppLogger _instance;
    private static readonly object _lock = new();
    private int _count = 0;

    private AppLogger() { }

    public static AppLogger Instance {
        get {
            if (_instance == null) {
                lock (_lock) {
                    _instance ??= new AppLogger();
                }
            }
            return _instance;
        }
    }

    public void Info(string msg) {
        _count++;
        Console.WriteLine($"[INFO #{_count}] {msg}");
    }
}

// 3. 扩展方法工具类
static class DateTimeExtensions {
    public static string ToRelative(this DateTime dt) {
        var diff = DateTime.Now - dt;
        if (diff.TotalSeconds < 60) return $"{(int)diff.TotalSeconds} 秒前";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} 分钟前";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} 小时前";
        return $"{(int)diff.TotalDays} 天前";
    }
}

// === 顶级语句使用 ===
AppSettings.PrintBanner();

AppSettings.Environment = "Production";
Console.WriteLine($"切换后是生产：{AppSettings.IsProduction}");

AppLogger.Instance.Info("应用启动");
AppLogger.Instance.Info("处理订单");
AppLogger.Instance.Info("订单完成");

DateTime past = DateTime.Now.AddHours(-3);
Console.WriteLine($"3 小时前 = {past.ToRelative()}");
\`\`\`

### 九、小结

- \`static\` 成员属于类本身，所有实例共享。
- 静态方法不依赖对象状态，\`Math.Sqrt\`、\`Console.WriteLine\` 都是。
- 静态构造函数在类首次使用时执行一次。
- 静态类不能实例化，是工具类的标准写法。
- 单例：私有构造 + 静态属性，保证全局唯一实例。
- \`const\` 编译期、仅简单类型；\`static readonly\` 运行期、任意类型。
- 扩展方法：静态类 + \`this\` 参数，给已有类型加方法。`,
  },

  // ============================================================
  // 第十四章：继承基础
  // ============================================================
  {
    id: 'csharp2-ch14',
    group: '第三部分 面向对象基础',
    icon: '🧬',
    title: '第十四章 继承基础',
    content: `## 第十四章　继承基础

继承是 OOP 三大特性之一（封装、继承、多态）。这一章讲透继承语法、\`base\` 关键字、\`protected\`、\`virtual/override\`、\`sealed\`、\`Object\` 基类。

### 一、为什么需要继承

写多个相似类时，重复代码是灾难：

\`\`\`csharp
// 不用继承：每个类都重复 Name、Age
class Student { public string Name; public int Age; public string School; }
class Teacher { public string Name; public int Age; public decimal Salary; }
class Employee { public string Name; public int Age; public string Department; }
// 改一个字段（如 Name 改成 FullName）要改 3 个类

// 用继承：提取公共部分到父类
class Person {
    public string Name { get; set; }
    public int Age { get; set; }
    public void Introduce() => Console.WriteLine($"我叫 {Name}，{Age} 岁");
}

class Student2 : Person { public string School { get; set; } }
class Teacher2 : Person { public decimal Salary { get; set; } }
class Employee2 : Person { public string Department { get; set; } }

// 子类自动有父类的成员
var s = new Student2 { Name = "张三", Age = 20, School = "清华" };
s.Introduce();  // 调父类方法
Console.WriteLine($"学校：{s.School}");
\`\`\`

> 继承的核心价值：**代码复用 + 建立类型层次**。\`Student2 is-a Person\`，子类是父类的特化。

### 二、继承语法 ⭐

C# 用 \`:\` 表示继承，**只能单继承**（一个类只能有一个父类）：

\`\`\`csharp
class Vehicle {
    public string Brand { get; set; }
    public int Speed { get; set; }

    public void Start() {
        Console.WriteLine($"{Brand} 启动，速度 {Speed}");
    }
}

// Car 继承 Vehicle
class Car : Vehicle {
    public int Doors { get; set; }

    public void Honk() {
        Console.WriteLine($"{Brand} 嘀嘀！");
    }
}

// ElectricCar 继承 Car，间接继承 Vehicle
class ElectricCar : Car {
    public double Battery { get; set; }

    public void Charge() {
        Console.WriteLine($"{Brand} 充电中，电量 {Battery}%");
    }
}

// 使用：ElectricCar 拥有 Vehicle + Car + 自己的成员
var tesla = new ElectricCar {
    Brand = "Tesla",
    Speed = 0,
    Doors = 4,
    Battery = 80
};
tesla.Start();   // 父类方法
tesla.Honk();    // Car 方法
tesla.Charge();  // 自己的方法
\`\`\`

> ⭐ C# 只能单继承，但可以多层继承（A→B→C）。需要"多继承"功能时用接口（第十六章讲）。

### 三、base 关键字 ⭐

\`base\` 指向父类，用于调用父类的构造函数和方法：

\`\`\`csharp
class Animal {
    public string Name { get; set; }

    public Animal(string name) {
        Name = name;
    }

    public virtual void Speak() {
        Console.WriteLine($"{Name} 发出声音");
    }
}

class Cat : Animal {
    public string Color { get; set; }

    // 调父类构造
    public Cat(string name, string color) : base(name) {
        Color = color;
    }

    public override void Speak() {
        base.Speak();  // 调父类方法
        Console.WriteLine($"{Name}（{Color}）喵喵叫");
    }
}

var cat = new Cat("咪咪", "橘色");
cat.Speak();
\`\`\`

> ⭐ \`base(...)\` 调父类构造，**必须在子类构造函数初始化器里**（紧跟参数列表后）。\`base.方法()\` 在子类方法里调父类版本。

### 四、protected 访问 ⭐

\`protected\` 修饰的成员：**本类 + 子类**可见，外部不可见。是继承场景的关键修饰符：

\`\`\`csharp
class Shape {
    // protected：子类能用，外部不能用
    protected double Width;
    protected double Height;

    public Shape(double width, double height) {
        Width = width;
        Height = height;
    }

    public virtual double Area() => Width * Height;
}

class Rectangle : Shape {
    public Rectangle(double w, double h) : base(w, h) { }

    public override double Area() => Width * Height;  // 能访问 protected 字段
}

class Triangle : Shape {
    public Triangle(double w, double h) : base(w, h) { }

    public override double Area() => Width * Height / 2;  // 三角形面积
}

Shape r = new Rectangle(4, 5);
Shape t = new Triangle(4, 5);
Console.WriteLine($"矩形面积：{r.Area()}");
Console.WriteLine($"三角形面积：{t.Area()}");
// Console.WriteLine(r.Width);  // ❌ protected 不可访问
\`\`\`

> ⭐ \`protected\` 让子类能复用父类内部数据，又不暴露给外部。**字段建议 private，子类需要时改 protected 或通过 protected 属性暴露**。

### 五、virtual 与 override ⭐

\`virtual\` 标记父类方法「可被重写」，\`override\` 在子类里实际重写。这是多态的基础：

\`\`\`csharp
class Animal {
    public string Name { get; }

    public Animal(string name) {
        Name = name;
    }

    // virtual：标记可重写
    public virtual void Speak() {
        Console.WriteLine($"{Name} 发出声音");
    }

    public virtual string Sound => "某种声音";
}

class Dog : Animal {
    public Dog(string name) : base(name) { }

    // override：实际重写父类方法
    public override void Speak() {
        Console.WriteLine($"{Name} 汪汪叫！");
    }

    public override string Sound => "汪汪";
}

class Cat : Animal {
    public Cat(string name) : base(name) { }

    public override void Speak() {
        Console.WriteLine($"{Name} 喵喵叫！");
    }

    public override string Sound => "喵喵";
}

// 多态：父类引用指向子类对象，调子类方法
Animal[] animals = { new Dog("旺财"), new Cat("咪咪"), new Animal("未知") };
foreach (var a in animals) {
    a.Speak();  // 运行时根据实际类型调对应方法
    Console.WriteLine($"  声音：{a.Sound}");
}
\`\`\`

> ⭐ 多态是 OOP 的精髓：**同一句代码 \`a.Speak()\`，运行时根据对象实际类型调不同实现**。前提是父类 \`virtual\` + 子类 \`override\`。

> 注意：不加 \`virtual\` 的方法，子类用 \`new\` 关键字隐藏（不推荐，失去多态性）。

### 六、sealed 密封 ⭐

\`sealed\` 阻止类被继承，或方法被进一步重写：

\`\`\`csharp
class Base {
    public virtual void DoWork() {
        Console.WriteLine("Base 工作");
    }
}

class Derived : Base {
    // sealed 方法：不能再被孙类重写
    public sealed override void DoWork() {
        Console.WriteLine("Derived 工作");
    }
}

// ❌ 编译错误：Derived 是 sealed，不能再继承
// class SubDerived : Derived { }

// 如果 Derived 不是 sealed 类，但 DoWork 是 sealed 方法：
class SubDerived : Base {
    // ❌ 编译错误：DoWork 在 Derived 已 sealed
    // public override void DoWork() { }
}
\`\`\`

\`\`\`csharp
// sealed 类：完全不可继承
sealed class FinalClass {
    public void DoSomething() { }
}

// ❌ 编译错误
// class TryExtend : FinalClass { }
\`\`\`

> ⭐ \`sealed\` 用于：① 防止关键类被误继承破坏不变式；② 性能优化（JIT 可内联 sealed 方法）；③ 框架设计。日常少主动用，但 .NET BCL 很多类是 sealed（如 \`string\`）。

### 七、Object 基类 ⭐

C# 所有类型最终都继承自 \`System.Object\`。不写 \`:\` 也默认继承：

\`\`\`csharp
// 这两个写法等价
class Foo { }
class Foo2 : object { }

// Object 提供 4 个关键方法，所有类都有：
object obj = new Foo();
Console.WriteLine($"类型：{obj.GetType()}");           // 类型信息
Console.WriteLine($"哈希码：{obj.GetHashCode()}");     // 哈希码
Console.WriteLine($"转字符串：{obj.ToString()}");      // 默认返回类名
Console.WriteLine($"等于自己：{obj.Equals(obj)}");     // 引用相等
\`\`\`

> ⭐ \`GetType()\`、\`ToString()\`、\`Equals()\`、\`GetHashCode()\` 是 \`Object\` 提供的四个虚方法，可被重写以自定义行为（下一节演示）。

### 八、重写 ToString / Equals / GetHashCode ⭐

默认 \`ToString()\` 返回类全名，\`Equals()\` 比较引用。日常开发常重写它们：

\`\`\`csharp
class Money {
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency) {
        Amount = amount;
        Currency = currency;
    }

    // 重写 ToString：让打印更友好
    public override string ToString() {
        return $"{Amount:F2} {Currency}";
    }

    // 重写 Equals：值相等（金额 + 币种都相同）
    public override bool Equals(object obj) {
        if (obj is Money other) {
            return Amount == other.Amount && Currency == other.Currency;
        }
        return false;
    }

    // 重写 GetHashCode：Equals 相等的对象必须哈希码相等
    public override int GetHashCode() {
        return HashCode.Combine(Amount, Currency);
    }

    // == 运算符重载（可选，让 == 走 Equals）
    public static bool operator ==(Money a, Money b) =>
        a?.Equals(b) ?? b is null;
    public static bool operator !=(Money a, Money b) => !(a == b);
}

var m1 = new Money(99.9m, "CNY");
var m2 = new Money(99.9m, "CNY");
var m3 = new Money(99.9m, "USD");

Console.WriteLine($"m1: {m1}");  // 99.90 CNY
Console.WriteLine($"m1 == m2: {m1 == m2}");  // True（值相等）
Console.WriteLine($"m1 == m3: {m1 == m3}");  // False（币种不同）

// 放进字典：依赖 GetHashCode + Equals
var dict = new Dictionary<Money, string>();
dict[m1] = "第一笔";
Console.WriteLine($"查 m2：{dict.TryGetValue(m2, out var v) ? v : "无"}");
\`\`\`

> ⭐ **重写 \`Equals\` 必须同时重写 \`GetHashCode\`**——否则放进 Dictionary/HashSet 会出 bug（值相等的对象哈希码不同，找不到）。C# 12 用 \`HashCode.Combine\` 简化哈希码生成。

### 九、实战 demo：图形体系

\`\`\`csharp
// 抽象基类（其实这里用普通类也行，第十五章讲 abstract）
class Shape {
    public string Name { get; }

    public Shape(string name) {
        Name = name;
    }

    // 虚方法：子类可重写
    public virtual double Area() => 0;

    public virtual double Perimeter() => 0;

    // 重写 ToString，统一打印格式
    public override string ToString() {
        return $"{Name}：面积 {Area():F2}，周长 {Perimeter():F2}";
    }
}

class Circle : Shape {
    public double Radius { get; }

    public Circle(double r) : base("圆形") {
        Radius = r;
    }

    public override double Area() => Math.PI * Radius * Radius;
    public override double Perimeter() => 2 * Math.PI * Radius;
}

class Rectangle : Shape {
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double w, double h) : base("矩形") {
        Width = w;
        Height = h;
    }

    public override double Area() => Width * Height;
    public override double Perimeter() => 2 * (Width + Height);
}

class Square : Rectangle {
    public Square(double side) : base(side, side) {
        // 注意：基类构造时传了 name="矩形"，这里要改
    }

    // 重写 ToString 改名字
    public override string ToString() {
        return $"正方形（边长 {Width}）：面积 {Area():F2}，周长 {Perimeter():F2}";
    }
}

// === 顶级语句使用 ===
Shape[] shapes = {
    new Circle(5),
    new Rectangle(4, 6),
    new Square(3)
};

// 多态：遍历统一调 Area/Perimeter，运行时走对应实现
foreach (var s in shapes) {
    Console.WriteLine(s);
}

// 计算总面积
double total = shapes.Sum(s => s.Area());
Console.WriteLine($"总面积：{total:F2}");
\`\`\`

### 十、小结

- 继承用 \`:\`，单继承，可多层。
- \`base\` 调父类构造和方法，\`base(...)\` 必须在初始化器。
- \`protected\`：本类 + 子类可见，是继承场景的关键修饰符。
- \`virtual\` 标记可重写，\`override\` 实际重写——这是多态的基础。
- \`sealed\` 阻止继承或重写，性能优化或保护不变式时用。
- 所有类型继承 \`Object\`，提供 \`ToString\`/\`Equals\`/\`GetHashCode\`/\`GetType\`。
- 重写 \`Equals\` **必须同时重写 \`GetHashCode\`**，否则哈希集合出错。
- 多态：父类引用指向子类对象，调子类实现——OOP 的精髓。`,
  },
];

export { chapters };
