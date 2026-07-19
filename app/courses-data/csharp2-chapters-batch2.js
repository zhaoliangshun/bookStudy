// =============================================================
// C# 大全 - 第二部分 面向对象编程（第 11-20 章）
// -------------------------------------------------------------
// 本批包含 10 章：
//   csharp2-ch11 : 类与对象基础
//   csharp2-ch12 : 构造函数与析构函数
//   csharp2-ch13 : 属性与字段
//   csharp2-ch14 : 方法深入
//   csharp2-ch15 : 继承
//   csharp2-ch16 : 多态
//   csharp2-ch17 : 抽象类与接口
//   csharp2-ch18 : 静态类与扩展方法
//   csharp2-ch19 : 枚举与结构体
//   csharp2-ch20 : 记录类型与模式匹配
//
// 风格：demo 驱动，每章直接上手写代码，多注释，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第十一章：类与对象基础
  // ============================================================
  {
    id: 'csharp2-ch11',
    group: '第二部分 面向对象编程',
    icon: '🏗️',
    title: '类与对象基础',
    content: `## 类与对象基础

### 一、什么是类和对象

\`\`\`csharp
// 类：对象的蓝图/模板
// 对象：类的实例

// 定义一个类
class Person
{
    // 字段：存储数据
    public string Name;
    public int Age;
    
    // 方法：定义行为
    public void SayHello()
    {
        Console.WriteLine($"你好，我叫 {Name}，今年 {Age} 岁");
    }
}

// 创建对象（实例化）
var person1 = new Person();
person1.Name = "张三";
person1.Age = 25;
person1.SayHello();

var person2 = new Person();
person2.Name = "李四";
person2.Age = 30;
person2.SayHello();

// 对象是引用类型
var person3 = person1;  // 复制引用，不是复制对象
person3.Name = "王五";
Console.WriteLine($"person1.Name: {person1.Name}");  // 王五（同一个对象）
\`\`\`

### 二、访问修饰符

\`\`\`csharp
// 访问修饰符控制成员的可访问性
class BankAccount
{
    // public: 任何地方都可以访问
    public string AccountNumber;
    
    // private: 只能在类内部访问（默认）
    private decimal _balance;
    
    // protected: 类内部和子类可以访问
    protected string Owner;
    
    // internal: 同一个程序集内可以访问
    internal string Branch;
    
    public void Deposit(decimal amount)
    {
        if (amount > 0)
        {
            _balance += amount;  // 可以访问私有字段
            Console.WriteLine($"存款 {amount}，余额 {_balance}");
        }
    }
    
    public void ShowBalance()
    {
        Console.WriteLine($"账户 {AccountNumber} 余额：{_balance}");
    }
}

var account = new BankAccount();
account.AccountNumber = "123456";  // 可以访问
// account._balance = 1000;  // 编译错误！私有成员不能外部访问
account.Deposit(1000);  // 通过公共方法操作
account.ShowBalance();
\`\`\`

### 三、this 关键字

\`\`\`csharp
// this：引用当前对象实例
class Student
{
    public string Name;
    public int Age;
    
    // 当参数名与字段名相同时，用 this 区分
    public void SetInfo(string Name, int Age)
    {
        this.Name = Name;  // this.Name 是字段，Name 是参数
        this.Age = Age;
    }
    
    public void Introduce()
    {
        Console.WriteLine($"我是 {Name}，今年 {Age} 岁");
    }
    
    // this 可以作为参数传递
    public void CompareWith(Student other)
    {
        if (this.Age > other.Age)
        {
            Console.WriteLine($"{this.Name} 比 {other.Name} 大");
        }
        else
        {
            Console.WriteLine($"{other.Name} 比 {this.Name} 大");
        }
    }
}

var student1 = new Student();
student1.SetInfo("张三", 20);
student1.Introduce();

var student2 = new Student();
student2.SetInfo("李四", 22);
student2.Introduce();

student1.CompareWith(student2);
\`\`\`

### 四、对象初始化器

\`\`\`csharp
// 对象初始化器：创建对象时直接赋值
class Product
{
    public string Name;
    public decimal Price;
    public int Stock;
}

// 传统方式
var product1 = new Product();
product1.Name = "iPhone";
product1.Price = 5999;
product1.Stock = 100;

// 对象初始化器（推荐）
var product2 = new Product
{
    Name = "iPad",
    Price = 3999,
    Stock = 50
};

Console.WriteLine($"{product2.Name}，价格 {product2.Price}，库存 {product2.Stock}");

// 集合初始化器
var products = new List<Product>
{
    new Product { Name = "iPhone", Price = 5999, Stock = 100 },
    new Product { Name = "iPad", Price = 3999, Stock = 50 },
    new Product { Name = "MacBook", Price = 9999, Stock = 30 }
};

foreach (var p in products)
{
    Console.WriteLine($"{p.Name}: {p.Price} 元");
}
\`\`\`

### 五、嵌套类

\`\`\`csharp
// 嵌套类：在类内部定义的类
class OuterClass
{
    private int outerField = 100;
    
    // 嵌套类
    public class NestedClass
    {
        public void AccessOuter()
        {
            // 嵌套类可以访问外层类的静态成员
            // 但不能直接访问实例成员，需要外层类实例
            var outer = new OuterClass();
            Console.WriteLine($"外层字段：{outer.outerField}");
        }
    }
    
    public void UseNested()
    {
        var nested = new NestedClass();
        nested.AccessOuter();
    }
}

// 使用嵌套类
var outer = new OuterClass();
outer.UseNested();

var nested = new OuterClass.NestedClass();
nested.AccessOuter();

// 嵌套类常用于：辅助类、工厂模式、构建器模式
class Order
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    
    // 嵌套类作为构建器
    public class Builder
    {
        private Order _order = new Order();
        
        public Builder SetId(int id)
        {
            _order.Id = id;
            return this;
        }
        
        public Builder SetDate(DateTime date)
        {
            _order.Date = date;
            return this;
        }
        
        public Order Build()
        {
            return _order;
        }
    }
}

var order = new Order.Builder()
    .SetId(1001)
    .SetDate(DateTime.Now)
    .Build();

Console.WriteLine($"订单 ID: {order.Id}, 日期: {order.Date}");
\`\`\`

### 六、partial 类

\`\`\`csharp
// partial 类：将一个类分散到多个文件中
// 编译器会自动合并

// 文件 1：Person.cs
partial class Person2
{
    public string Name { get; set; }
    public int Age { get; set; }
    
    public void SayHello()
    {
        Console.WriteLine($"Hello, {Name}");
    }
}

// 文件 2：Person.Extensions.cs（实际项目中）
partial class Person2
{
    public void ShowInfo()
    {
        Console.WriteLine($"Name: {Name}, Age: {Age}");
    }
}

// 使用
var person = new Person2 { Name = "张三", Age = 25 };
person.SayHello();
person.ShowInfo();

// partial 类的常见用途：
// 1. 大型项目中的代码组织
// 2. 代码生成器生成的代码（如 EF Core、WPF）
// 3. 将自动生成的代码和手动编写的代码分离
\`\`\`

### 七、小结

本章学到了：
- 类和对象的概念
- 访问修饰符：\`public\`、\`private\`、\`protected\`、\`internal\`
- \`this\` 关键字的用法
- 对象初始化器和集合初始化器
- 嵌套类的应用场景
- \`partial\` 类的作用

下一章我们学习构造函数与析构函数。`,
  },

  // ============================================================
  // 第十二章：构造函数与析构函数
  // ============================================================
  {
    id: 'csharp2-ch12',
    group: '第二部分 面向对象编程',
    icon: '🔧',
    title: '构造函数与析构函数',
    content: `## 构造函数与析构函数

### 一、构造函数基础

\`\`\`csharp
// 构造函数：创建对象时自动调用的特殊方法
// 用于初始化对象的状态

class Car
{
    public string Brand;
    public string Model;
    public int Year;
    
    // 构造函数：方法名与类名相同，没有返回类型
    public Car()
    {
        // 默认构造函数
        Brand = "Unknown";
        Model = "Unknown";
        Year = 2024;
        Console.WriteLine("Car 对象已创建");
    }
}

var car1 = new Car();  // 自动调用构造函数
Console.WriteLine($"{car1.Brand} {car1.Model} {car1.Year}");

// 带参数的构造函数
class Person
{
    public string Name;
    public int Age;
    
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
        Console.WriteLine($"创建 Person: {Name}, {Age} 岁");
    }
}

var person = new Person("张三", 25);
Console.WriteLine($"{person.Name}, {person.Age} 岁");
\`\`\`

### 二、构造函数重载

\`\`\`csharp
// 构造函数重载：多个构造函数，参数列表不同
class Rectangle
{
    public double Width;
    public double Height;
    public string Color;
    
    // 默认构造函数
    public Rectangle()
    {
        Width = 1.0;
        Height = 1.0;
        Color = "White";
    }
    
    // 指定宽高
    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
        Color = "White";
    }
    
    // 指定所有属性
    public Rectangle(double width, double height, string color)
    {
        Width = width;
        Height = height;
        Color = color;
    }
    
    public double GetArea()
    {
        return Width * Height;
    }
}

var rect1 = new Rectangle();
var rect2 = new Rectangle(10, 5);
var rect3 = new Rectangle(10, 5, "Red");

Console.WriteLine($"rect1 面积：{rect1.GetArea()}");
Console.WriteLine($"rect2 面积：{rect2.GetArea()}");
Console.WriteLine($"rect3 面积：{rect3.GetArea()}，颜色：{rect3.Color}");
\`\`\`

### 三、构造函数链

\`\`\`csharp
// 构造函数链：一个构造函数调用另一个
class Employee
{
    public string Name;
    public string Department;
    public decimal Salary;
    
    // 主构造函数
    public Employee(string name, string department, decimal salary)
    {
        Name = name;
        Department = department;
        Salary = salary;
    }
    
    // 调用主构造函数
    public Employee(string name, string department) 
        : this(name, department, 5000)  // 默认薪资
    {
    }
    
    // 调用主构造函数
    public Employee(string name) 
        : this(name, "General", 5000)  // 默认部门和薪资
    {
    }
}

var emp1 = new Employee("张三", "IT", 10000);
var emp2 = new Employee("李四", "HR");
var emp3 = new Employee("王五");

Console.WriteLine($"{emp1.Name}, {emp1.Department}, {emp1.Salary}");
Console.WriteLine($"{emp2.Name}, {emp2.Department}, {emp2.Salary}");
Console.WriteLine($"{emp3.Name}, {emp3.Department}, {emp3.Salary}");
\`\`\`

### 四、静态构造函数

\`\`\`csharp
// 静态构造函数：初始化静态成员，只执行一次
class Database
{
    public static string ConnectionString;
    public static int MaxConnections;
    
    // 静态构造函数：没有访问修饰符，没有参数
    static Database()
    {
        ConnectionString = "Server=localhost;Database=mydb";
        MaxConnections = 100;
        Console.WriteLine("静态构造函数执行（只执行一次）");
    }
    
    // 实例构造函数
    public Database()
    {
        Console.WriteLine("实例构造函数执行");
    }
}

// 第一次访问静态成员时，静态构造函数执行
Console.WriteLine($"连接字符串：{Database.ConnectionString}");
Console.WriteLine($"最大连接数：{Database.MaxConnections}");

// 创建实例时，静态构造函数不会再次执行
var db1 = new Database();
var db2 = new Database();

// 静态构造函数常用于：
// 1. 初始化静态配置
// 2. 读取配置文件
// 3. 初始化日志
\`\`\`

### 五、私有构造函数

\`\`\`csharp
// 私有构造函数：防止外部创建实例
// 常用于单例模式、工具类

// 单例模式
class Logger
{
    // 静态实例
    private static Logger _instance;
    
    // 私有构造函数
    private Logger()
    {
        Console.WriteLine("Logger 实例已创建");
    }
    
    // 公共访问点
    public static Logger Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new Logger();
            }
            return _instance;
        }
    }
    
    public void Log(string message)
    {
        Console.WriteLine($"[LOG] {message}");
    }
}

// 使用单例
Logger.Instance.Log("第一条日志");
Logger.Instance.Log("第二条日志");

// 工具类（只包含静态方法）
class MathHelper
{
    // 私有构造函数，防止实例化
    private MathHelper() { }
    
    public static double Add(double a, double b) => a + b;
    public static double Multiply(double a, double b) => a * b;
}

double result = MathHelper.Add(10, 20);
Console.WriteLine($"10 + 20 = {result}");
\`\`\`

### 六、主构造函数（C# 12）

\`\`\`csharp
// 主构造函数：C# 12 新特性，简化构造函数定义
// 在类名后的括号中定义参数

// 传统方式
class ProductOld
{
    public string Name { get; }
    public decimal Price { get; }
    
    public ProductOld(string name, decimal price)
    {
        Name = name;
        Price = price;
    }
}

// 主构造函数方式（推荐）
class Product(string name, decimal price)
{
    public string Name { get; } = name;
    public decimal Price { get; } = price;
    
    // 可以直接使用构造函数参数
    public void ShowInfo()
    {
        Console.WriteLine($"{Name}: {Price} 元");
    }
}

var product = new Product("iPhone", 5999);
product.ShowInfo();

// 结构体也支持主构造函数
struct Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
}

var point = new Point(10, 20);
Console.WriteLine($"Point: ({point.X}, {point.Y})");
\`\`\`

### 七、析构函数（终结器）

\`\`\`csharp
// 析构函数：对象被垃圾回收前调用
// 用于释放非托管资源（文件句柄、网络连接等）

class FileHandler
{
    private string _fileName;
    
    public FileHandler(string fileName)
    {
        _fileName = fileName;
        Console.WriteLine($"打开文件：{_fileName}");
    }
    
    // 析构函数：~ 类名
    ~FileHandler()
    {
        Console.WriteLine($"关闭文件：{_fileName}");
        // 释放资源
    }
    
    public void ReadFile()
    {
        Console.WriteLine($"读取文件：{_fileName}");
    }
}

// 使用
var handler = new FileHandler("test.txt");
handler.ReadFile();

// 析构函数由垃圾回收器自动调用，不需要手动调用
// 实际开发中，推荐使用 IDisposable 接口管理资源

// IDisposable 模式
class ResourceHandler : IDisposable
{
    private bool _disposed = false;
    
    public void DoWork()
    {
        if (_disposed)
            throw new ObjectDisposedException(nameof(ResourceHandler));
        Console.WriteLine("执行工作");
    }
    
    public void Dispose()
    {
        if (!_disposed)
        {
            Console.WriteLine("释放资源");
            _disposed = true;
        }
    }
}

// 使用 using 语句自动调用 Dispose
using (var resource = new ResourceHandler())
{
    resource.DoWork();
}
// resource.Dispose() 自动调用
\`\`\`

### 八、小结

本章学到了：
- 构造函数的定义和调用
- 构造函数重载和构造函数链
- 静态构造函数和私有构造函数
- 主构造函数（C# 12）
- 析构函数和 \`IDisposable\` 接口

下一章我们学习属性与字段。`,
  },

  // ============================================================
  // 第十三章：属性与字段
  // ============================================================
  {
    id: 'csharp2-ch13',
    group: '第二部分 面向对象编程',
    icon: '📋',
    title: '属性与字段',
    content: `## 属性与字段

### 一、属性基础

\`\`\`csharp
// 属性：封装字段，提供受控访问
class Person
{
    // 私有字段（后备字段）
    private string _name;
    private int _age;
    
    // 属性：通过 get/set 访问器控制
    public string Name
    {
        get { return _name; }  // 读取
        set { _name = value; }  // 写入，value 是隐式参数
    }
    
    public int Age
    {
        get { return _age; }
        set
        {
            if (value >= 0 && value <= 150)
            {
                _age = value;
            }
            else
            {
                Console.WriteLine("年龄无效");
            }
        }
    }
}

var person = new Person();
person.Name = "张三";  // 调用 set
person.Age = 25;
Console.WriteLine($"姓名：{person.Name}，年龄：{person.Age}");  // 调用 get

person.Age = 200;  // 年龄无效
\`\`\`

### 二、自动属性

\`\`\`csharp
// 自动属性：编译器自动生成后备字段
class Product
{
    // 自动属性（推荐）
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    
    // 带默认值的自动属性
    public string Category { get; set; } = "General";
    public bool IsActive { get; set; } = true;
}

var product = new Product
{
    Name = "iPhone",
    Price = 5999,
    Stock = 100
};

Console.WriteLine($"{product.Name}, {product.Price}, {product.Stock}");
Console.WriteLine($"分类：{product.Category}, 激活：{product.IsActive}");

// 自动属性 vs 手动属性
// 自动属性：简单数据封装
// 手动属性：需要验证、计算、通知等逻辑
\`\`\`

### 三、只读和只写属性

\`\`\`csharp
// 只读属性：只有 get 访问器
class Circle
{
    public double Radius { get; }
    
    public Circle(double radius)
    {
        Radius = radius;  // 只能在构造函数中赋值
    }
    
    // 计算属性
    public double Area
    {
        get { return Math.PI * Radius * Radius; }
    }
    
    public double Circumference
    {
        get { return 2 * Math.PI * Radius; }
    }
}

var circle = new Circle(5);
Console.WriteLine($"半径：{circle.Radius}");
Console.WriteLine($"面积：{circle.Area:F2}");
Console.WriteLine($"周长：{circle.Circumference:F2}");

// circle.Radius = 10;  // 编译错误！只读属性不能赋值

// 只写属性：只有 set 访问器（很少用）
class PasswordChanger
{
    public string Password { private get; set; }
    
    public void ChangePassword()
    {
        Console.WriteLine($"密码已更改为：{Password}");
    }
}

var changer = new PasswordChanger();
changer.Password = "newpassword";
changer.ChangePassword();
// Console.WriteLine(changer.Password);  // 编译错误！外部不能读取
\`\`\`

### 四、不同访问级别的属性

\`\`\`csharp
// 属性访问器可以有不同的访问级别
class BankAccount
{
    // 公共读取，私有写入
    public decimal Balance { get; private set; }
    
    // 公共读取，保护写入
    public string AccountNumber { get; protected set; }
    
    public BankAccount(string accountNumber, decimal initialBalance)
    {
        AccountNumber = accountNumber;
        Balance = initialBalance;
    }
    
    public void Deposit(decimal amount)
    {
        if (amount > 0)
        {
            Balance += amount;  // 类内部可以写入
        }
    }
    
    public void Withdraw(decimal amount)
    {
        if (amount > 0 && amount <= Balance)
        {
            Balance -= amount;  // 类内部可以写入
        }
    }
}

var account = new BankAccount("123456", 1000);
account.Deposit(500);
Console.WriteLine($"余额：{account.Balance}");  // 可以读取
// account.Balance = 5000;  // 编译错误！外部不能写入
\`\`\`

### 五、计算属性

\`\`\`csharp
// 计算属性：不存储数据，动态计算返回值
class Rectangle
{
    public double Width { get; set; }
    public double Height { get; set; }
    
    // 计算属性
    public double Area
    {
        get { return Width * Height; }
    }
    
    public double Perimeter
    {
        get { return 2 * (Width + Height); }
    }
    
    // 表达式体属性（C# 6+）
    public double Diagonal => Math.Sqrt(Width * Width + Height * Height);
}

var rect = new Rectangle { Width = 10, Height = 5 };
Console.WriteLine($"面积：{rect.Area}");
Console.WriteLine($"周长：{rect.Perimeter}");
Console.WriteLine($"对角线：{rect.Diagonal:F2}");

// 表达式体属性 vs 计算属性
// 两者等价，表达式体更简洁
class Temperature
{
    public double Celsius { get; set; }
    
    // 表达式体
    public double Fahrenheit => Celsius * 9 / 5 + 32;
    public double Kelvin => Celsius + 273.15;
}

var temp = new Temperature { Celsius = 25 };
Console.WriteLine($"华氏：{temp.Fahrenheit}°F");
Console.WriteLine($"开尔文：{temp.Kelvin}K");
\`\`\`

### 六、init 访问器（C# 9+）

\`\`\`csharp
// init 访问器：只能在对象初始化时赋值
class ImmutablePoint
{
    public double X { get; init; }
    public double Y { get; init; }
    
    // 表达式体属性
    public double DistanceFromOrigin => Math.Sqrt(X * X + Y * Y);
}

// 对象初始化时可以赋值
var point = new ImmutablePoint { X = 3, Y = 4 };
Console.WriteLine($"Point: ({point.X}, {point.Y})");
Console.WriteLine($"距离原点：{point.DistanceFromOrigin}");

// point.X = 10;  // 编译错误！init 属性只能在初始化时赋值

// 常用于不可变对象
class Configuration
{
    public string Host { get; init; }
    public int Port { get; init; }
    public bool UseSsl { get; init; }
    public string ConnectionString => $"Host={Host},Port={Port},SSL={UseSsl}";
}

var config = new Configuration
{
    Host = "localhost",
    Port = 8080,
    UseSsl = true
};

Console.WriteLine(config.ConnectionString);
// config.Host = "example.com";  // 编译错误！
\`\`\`

### 七、字段 vs 属性

\`\`\`csharp
// 字段：直接存储数据
// 属性：封装字段，提供受控访问

class MyClass
{
    // 字段：直接访问，无验证
    public string PublicField;
    
    // 属性：可以添加验证逻辑
    private string _property;
    public string Property
    {
        get => _property;
        set
        {
            if (!string.IsNullOrEmpty(value))
            {
                _property = value;
            }
        }
    }
    
    // 自动属性：推荐用于简单封装
    public string AutoProperty { get; set; }
}

// 最佳实践：
// 1. 不要使用公共字段（破坏封装）
// 2. 使用属性代替公共字段
// 3. 简单封装用自动属性
// 4. 需要验证或计算逻辑用手动属性

// 错误示例
class BadClass
{
    public string Name;  // 不推荐：公共字段
}

// 正确示例
class GoodClass
{
    public string Name { get; set; }  // 推荐：自动属性
}
\`\`\`

### 八、小结

本章学到了：
- 属性的定义和访问器
- 自动属性和带默认值的属性
- 只读属性和只写属性
- 不同访问级别的属性访问器
- 计算属性和表达式体属性
- \`init\` 访问器（C# 9+）
- 字段与属性的区别和最佳实践

下一章我们学习方法深入。`,
  },

  // ============================================================
  // 第十四章：方法深入
  // ============================================================
  {
    id: 'csharp2-ch14',
    group: '第二部分 面向对象编程',
    icon: '⚙️',
    title: '方法深入',
    content: `## 方法深入

### 一、表达式体方法

\`\`\`csharp
// 表达式体方法：单行方法可以用 => 简化
class Calculator
{
    // 传统方式
    public int Add(int a, int b)
    {
        return a + b;
    }
    
    // 表达式体（推荐）
    public int Subtract(int a, int b) => a - b;
    public int Multiply(int a, int b) => a * b;
    public double Divide(int a, int b) => b != 0 ? (double)a / b : 0;
}

var calc = new Calculator();
Console.WriteLine($"10 + 20 = {calc.Add(10, 20)}");
Console.WriteLine($"10 - 20 = {calc.Subtract(10, 20)}");
Console.WriteLine($"10 * 20 = {calc.Multiply(10, 20)}");
Console.WriteLine($"10 / 20 = {calc.Divide(10, 20)}");

// 表达式体也适用于属性、索引器等
class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    
    // 表达式体属性
    public string FullName => $"{FirstName} {LastName}";
    
    // 表达式体方法
    public void Greet() => Console.WriteLine($"Hello, {FullName}");
}

var person = new Person { FirstName = "三", LastName = "张" };
person.Greet();
\`\`\`

### 二、方法重载深入

\`\`\`csharp
// 方法重载：同名方法，参数列表不同
class Printer
{
    // 参数数量不同
    public void Print(string message)
    {
        Console.WriteLine(message);
    }
    
    public void Print(string message, int times)
    {
        for (int i = 0; i < times; i++)
        {
            Console.WriteLine(message);
        }
    }
    
    // 参数类型不同
    public void Print(int number)
    {
        Console.WriteLine($"数字：{number}");
    }
    
    public void Print(double number)
    {
        Console.WriteLine($"小数：{number:F2}");
    }
    
    // 参数顺序不同（不推荐，容易混淆）
    public void Format(string text, int width)
    {
        Console.WriteLine(text.PadLeft(width));
    }
    
    public void Format(int width, string text)
    {
        Console.WriteLine(text.PadRight(width));
    }
}

var printer = new Printer();
printer.Print("Hello");
printer.Print("Hello", 3);
printer.Print(42);
printer.Print(3.14159);
printer.Format("Test", 10);
printer.Format(10, "Test");
\`\`\`

### 三、可选参数与命名参数

\`\`\`csharp
// 可选参数：参数有默认值
void CreateReport(string title, string author = "Anonymous", int pages = 10)
{
    Console.WriteLine($"标题：{title}");
    Console.WriteLine($"作者：{author}");
    Console.WriteLine($"页数：{pages}");
}

CreateReport("C# 教程");
CreateReport("C# 教程", "张三");
CreateReport("C# 教程", "张三", 100);

// 命名参数：可以指定参数名
CreateReport("C# 教程", pages: 200);  // 跳过 author
CreateReport(pages: 50, title: "C# 教程");  // 改变顺序

// 可选参数必须从右到左连续
// void Bad(int a = 1, int b, int c = 3) {}  // 编译错误！
void Good(int a, int b = 2, int c = 3) {}

Good(1);
Good(1, 2);
Good(1, 2, 3);

// 命名参数常用于提高代码可读性
void ConfigureServer(string host, int port, bool useSsl, int timeout)
{
    Console.WriteLine($"Host: {host}, Port: {port}, SSL: {useSsl}, Timeout: {timeout}");
}

// 使用命名参数，一目了然
ConfigureServer(
    host: "localhost",
    port: 8080,
    useSsl: true,
    timeout: 30
);
\`\`\`

### 四、out 和 ref 参数

\`\`\`csharp
// ref：传递引用，可以读写
// out：传递引用，必须写入

// ref 示例
void Swap(ref int a, ref int b)
{
    int temp = a;
    a = b;
    b = temp;
}

int x = 10, y = 20;
Console.WriteLine($"交换前：x={x}, y={y}");
Swap(ref x, ref y);
Console.WriteLine($"交换后：x={x}, y={y}");

// out 示例：返回多个值
bool TryParse(string input, out int result)
{
    try
    {
        result = int.Parse(input);
        return true;
    }
    catch
    {
        result = 0;
        return false;
    }
}

if (TryParse("123", out int number))
{
    Console.WriteLine($"解析成功：{number}");
}

if (!TryParse("abc", out int number2))
{
    Console.WriteLine("解析失败");
}

// C# 7+ 可以在调用时声明 out 变量
if (int.TryParse("456", out int parsed))
{
    Console.WriteLine($"解析成功：{parsed}");
}
\`\`\`

### 五、params 参数

\`\`\`csharp
// params：可变参数，可以传递任意数量的参数
int Sum(params int[] numbers)
{
    int total = 0;
    foreach (int num in numbers)
    {
        total += num;
    }
    return total;
}

Console.WriteLine($"Sum() = {Sum()}");
Console.WriteLine($"Sum(1) = {Sum(1)}");
Console.WriteLine($"Sum(1, 2, 3) = {Sum(1, 2, 3)}");
Console.WriteLine($"Sum(1, 2, 3, 4, 5) = {Sum(1, 2, 3, 4, 5)}");

// params 必须是最后一个参数
void PrintInfo(string prefix, params string[] items)
{
    Console.Write($"{prefix}: ");
    Console.WriteLine(string.Join(", ", items));
}

PrintInfo("水果", "苹果", "香蕉", "橙子");
PrintInfo("颜色", "红色", "蓝色");

// params 也可以传递数组
int[] values = { 10, 20, 30 };
Console.WriteLine($"Sum(values) = {Sum(values)}");
\`\`\`

### 六、局部函数

\`\`\`csharp
// 局部函数：在方法内部定义的函数
void ProcessData(int[] data)
{
    // 局部函数：验证数据
    bool IsValid(int[] arr)
    {
        return arr != null && arr.Length > 0;
    }
    
    // 局部函数：计算平均值
    double CalculateAverage(int[] arr)
    {
        if (!IsValid(arr)) return 0;
        return arr.Average();
    }
    
    // 局部函数：格式化输出
    string FormatResult(double value)
    {
        return $"结果：{value:F2}";
    }
    
    // 使用局部函数
    if (IsValid(data))
    {
        double avg = CalculateAverage(data);
        Console.WriteLine(FormatResult(avg));
    }
    else
    {
        Console.WriteLine("数据无效");
    }
}

ProcessData(new[] { 10, 20, 30, 40, 50 });
ProcessData(new int[0]);

// 局部函数的优势：
// 1. 封装辅助逻辑，不污染类的作用域
// 2. 可以访问外层方法的变量
// 3. 提高代码可读性
\`\`\`

### 七、小结

本章学到了：
- 表达式体方法
- 方法重载的深入用法
- 可选参数和命名参数
- \`out\` 和 \`ref\` 参数
- \`params\` 可变参数
- 局部函数

下一章我们学习继承。`,
  },

  // ============================================================
  // 第十五章：继承
  // ============================================================
  {
    id: 'csharp2-ch15',
    group: '第二部分 面向对象编程',
    icon: '🧬',
    title: '继承',
    content: `## 继承

### 一、继承基础

\`\`\`csharp
// 继承：子类继承父类的成员，实现代码复用

// 父类（基类）
class Animal
{
    public string Name { get; set; }
    public int Age { get; set; }
    
    public void Eat()
    {
        Console.WriteLine($"{Name} 正在吃东西");
    }
    
    public void Sleep()
    {
        Console.WriteLine($"{Name} 正在睡觉");
    }
}

// 子类（派生类）：继承 Animal
class Dog : Animal
{
    public string Breed { get; set; }
    
    public void Bark()
    {
        Console.WriteLine($"{Name} 在叫：汪汪汪！");
    }
}

class Cat : Animal
{
    public bool IsIndoor { get; set; }
    
    public void Meow()
    {
        Console.WriteLine($"{Name} 在叫：喵喵喵！");
    }
}

// 使用
var dog = new Dog { Name = "旺财", Age = 3, Breed = "金毛" };
dog.Eat();  // 继承自 Animal
dog.Sleep();  // 继承自 Animal
dog.Bark();  // Dog 自己的方法

var cat = new Cat { Name = "咪咪", Age = 2, IsIndoor = true };
cat.Eat();
cat.Meow();
\`\`\`

### 二、base 关键字

\`\`\`csharp
// base：引用父类
class Vehicle
{
    public string Brand { get; set; }
    public int Year { get; set; }
    
    public Vehicle(string brand, int year)
    {
        Brand = brand;
        Year = year;
    }
    
    public void ShowInfo()
    {
        Console.WriteLine($"品牌：{Brand}，年份：{Year}");
    }
}

class Car : Vehicle
{
    public int Doors { get; set; }
    
    // 调用父类构造函数
    public Car(string brand, int year, int doors) : base(brand, year)
    {
        Doors = doors;
    }
    
    public void ShowCarInfo()
    {
        base.ShowInfo();  // 调用父类方法
        Console.WriteLine($"车门数：{Doors}");
    }
}

var car = new Car("Toyota", 2024, 4);
car.ShowCarInfo();
\`\`\`

### 三、方法重写（virtual 和 override）

\`\`\`csharp
// virtual：标记方法可以被子类重写
// override：重写父类方法

class Shape
{
    public string Color { get; set; }
    
    // virtual 方法：可以被子类重写
    public virtual double GetArea()
    {
        return 0;
    }
    
    public virtual void Draw()
    {
        Console.WriteLine($"绘制 {Color} 色的图形");
    }
}

class Circle : Shape
{
    public double Radius { get; set; }
    
    // override：重写父类方法
    public override double GetArea()
    {
        return Math.PI * Radius * Radius;
    }
    
    public override void Draw()
    {
        Console.WriteLine($"绘制 {Color} 色的圆形，半径 {Radius}");
    }
}

class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }
    
    public override double GetArea()
    {
        return Width * Height;
    }
    
    public override void Draw()
    {
        Console.WriteLine($"绘制 {Color} 色的矩形，{Width} x {Height}");
    }
}

// 多态：父类引用指向子类对象
Shape shape1 = new Circle { Color = "Red", Radius = 5 };
Shape shape2 = new Rectangle { Color = "Blue", Width = 10, Height = 5 };

shape1.Draw();  // 调用 Circle 的 Draw
shape2.Draw();  // 调用 Rectangle 的 Draw

Console.WriteLine($"圆形面积：{shape1.GetArea():F2}");
Console.WriteLine($"矩形面积：{shape2.GetArea():F2}");
\`\`\`

### 四、sealed 关键字

\`\`\`csharp
// sealed：密封类不能被继承
// sealed 方法不能被重写

sealed class FinalClass
{
    public void Method()
    {
        Console.WriteLine("FinalClass.Method");
    }
}

// class DerivedClass : FinalClass {}  // 编译错误！不能继承密封类

class BaseClass
{
    public virtual void Method1()
    {
        Console.WriteLine("BaseClass.Method1");
    }
    
    public virtual void Method2()
    {
        Console.WriteLine("BaseClass.Method2");
    }
}

class MiddleClass : BaseClass
{
    public override void Method1()
    {
        Console.WriteLine("MiddleClass.Method1");
    }
    
    // sealed：子类不能重写这个方法
    public sealed override void Method2()
    {
        Console.WriteLine("MiddleClass.Method2");
    }
}

class FinalDerivedClass : MiddleClass
{
    public override void Method1()  // 可以重写
    {
        Console.WriteLine("FinalDerivedClass.Method1");
    }
    
    // public override void Method2() {}  // 编译错误！Method2 是 sealed 的
}
\`\`\`

### 五、继承中的构造函数

\`\`\`csharp
// 继承中的构造函数调用顺序：
// 1. 父类构造函数
// 2. 子类构造函数

class Parent
{
    public Parent()
    {
        Console.WriteLine("Parent 构造函数");
    }
    
    public Parent(string message)
    {
        Console.WriteLine($"Parent 构造函数：{message}");
    }
}

class Child : Parent
{
    public Child() : base("来自 Child")  // 调用父类带参构造函数
    {
        Console.WriteLine("Child 构造函数");
    }
}

var child = new Child();
// 输出：
// Parent 构造函数：来自 Child
// Child 构造函数

// 如果没有显式调用 base()，默认调用父类无参构造函数
class Parent2
{
    public Parent2()
    {
        Console.WriteLine("Parent2 无参构造函数");
    }
}

class Child2 : Parent2
{
    public Child2()
    {
        Console.WriteLine("Child2 构造函数");
    }
}

var child2 = new Child2();
// 输出：
// Parent2 无参构造函数
// Child2 构造函数
\`\`\`

### 六、小结

本章学到了：
- 继承的概念和语法
- \`base\` 关键字的使用
- \`virtual\` 和 \`override\` 实现方法重写
- \`sealed\` 密封类和方法
- 继承中的构造函数调用顺序

下一章我们学习多态。`,
  },

  // ============================================================
  // 第十六章：多态
  // ============================================================
  {
    id: 'csharp2-ch16',
    group: '第二部分 面向对象编程',
    icon: '🎭',
    title: '多态',
    content: `## 多态

### 一、多态基础

\`\`\`csharp
// 多态：同一操作作用于不同对象，产生不同行为

class Employee
{
    public string Name { get; set; }
    
    public Employee(string name)
    {
        Name = name;
    }
    
    public virtual void CalculateSalary()
    {
        Console.WriteLine($"{Name} 的基本工资：5000");
    }
}

class Manager : Employee
{
    public int TeamSize { get; set; }
    
    public Manager(string name, int teamSize) : base(name)
    {
        TeamSize = teamSize;
    }
    
    public override void CalculateSalary()
    {
        int salary = 10000 + TeamSize * 1000;
        Console.WriteLine($"{Name} 的管理工资：{salary}");
    }
}

class Developer : Employee
{
    public int ProjectCount { get; set; }
    
    public Developer(string name, int projectCount) : base(name)
    {
        ProjectCount = projectCount;
    }
    
    public override void CalculateSalary()
    {
        int salary = 8000 + ProjectCount * 2000;
        Console.WriteLine($"{Name} 的开发工资：{salary}");
    }
}

// 多态：父类引用指向子类对象
Employee emp1 = new Manager("张三", 10);
Employee emp2 = new Developer("李四", 3);
Employee emp3 = new Employee("王五");

emp1.CalculateSalary();  // 调用 Manager 的方法
emp2.CalculateSalary();  // 调用 Developer 的方法
emp3.CalculateSalary();  // 调用 Employee 的方法

// 多态的实际应用
void ProcessPayroll(Employee[] employees)
{
    foreach (var emp in employees)
    {
        emp.CalculateSalary();  // 运行时决定调用哪个方法
    }
}

Employee[] staff = { emp1, emp2, emp3 };
ProcessPayroll(staff);
\`\`\`

### 二、类型转换

\`\`\`csharp
// 向上转型：子类转父类（自动）
// 向下转型：父类转子类（需要强制转换）

class Animal2
{
    public string Name { get; set; }
    public virtual void MakeSound() => Console.WriteLine("...");
}

class Dog2 : Animal2
{
    public override void MakeSound() => Console.WriteLine("汪汪汪！");
    public void Fetch() => Console.WriteLine("捡球");
}

class Cat2 : Animal2
{
    public override void MakeSound() => Console.WriteLine("喵喵喵！");
    public void Climb() => Console.WriteLine("爬树");
}

// 向上转型（自动）
Animal2 animal1 = new Dog2 { Name = "旺财" };
Animal2 animal2 = new Cat2 { Name = "咪咪" };

animal1.MakeSound();  // 汪汪汪！
animal2.MakeSound();  // 喵喵喵！

// 向下转型（需要强制转换）
Dog2 dog = (Dog2)animal1;
dog.Fetch();  // 可以调用 Dog 的方法

// 使用 as 运算符（安全转换）
Cat2 cat = animal2 as Cat2;
if (cat != null)
{
    cat.Climb();
}

// 使用 is 运算符（类型检查）
if (animal1 is Dog2 d)
{
    d.Fetch();  // 类型检查成功后可以直接使用
}

// 使用 pattern matching（C# 7+）
if (animal2 is Cat2 c)
{
    c.Climb();
}
\`\`\`

### 三、抽象类

\`\`\`csharp
// 抽象类：不能被实例化，只能被继承
// 抽象方法：没有实现，必须由子类实现

abstract class Shape2
{
    public string Color { get; set; }
    
    // 抽象方法：没有方法体
    public abstract double GetArea();
    public abstract double GetPerimeter();
    
    // 普通方法：有实现
    public void ShowInfo()
    {
        Console.WriteLine($"颜色：{Color}");
        Console.WriteLine($"面积：{GetArea():F2}");
        Console.WriteLine($"周长：{GetPerimeter():F2}");
    }
}

class Circle2 : Shape2
{
    public double Radius { get; set; }
    
    // 必须实现抽象方法
    public override double GetArea()
    {
        return Math.PI * Radius * Radius;
    }
    
    public override double GetPerimeter()
    {
        return 2 * Math.PI * Radius;
    }
}

class Rectangle2 : Shape2
{
    public double Width { get; set; }
    public double Height { get; set; }
    
    public override double GetArea()
    {
        return Width * Height;
    }
    
    public override double GetPerimeter()
    {
        return 2 * (Width + Height);
    }
}

// var shape = new Shape2();  // 编译错误！不能实例化抽象类

Shape2 circle = new Circle2 { Color = "Red", Radius = 5 };
circle.ShowInfo();

Shape2 rectangle = new Rectangle2 { Color = "Blue", Width = 10, Height = 5 };
rectangle.ShowInfo();
\`\`\`

### 四、接口

\`\`\`csharp
// 接口：定义契约，类可以实现多个接口

// 定义接口
interface IRunnable
{
    void Run();
}

interface ISwimmable
{
    void Swim();
}

interface IFlyable
{
    void Fly();
}

// 类可以实现多个接口
class Athlete : IRunnable, ISwimmable
{
    public string Name { get; set; }
    
    public void Run()
    {
        Console.WriteLine($"{Name} 在跑步");
    }
    
    public void Swim()
    {
        Console.WriteLine($"{Name} 在游泳");
    }
}

class Bird : IRunnable, IFlyable
{
    public string Name { get; set; }
    
    public void Run()
    {
        Console.WriteLine($"{Name} 在地上跑");
    }
    
    public void Fly()
    {
        Console.WriteLine($"{Name} 在天上飞");
    }
}

// 使用接口
IRunnable runner1 = new Athlete { Name = "张三" };
IRunnable runner2 = new Bird { Name = "麻雀" };

runner1.Run();
runner2.Run();

// 接口多态
void MakeRun(IRunnable runnable)
{
    runnable.Run();
}

MakeRun(new Athlete { Name = "李四" });
MakeRun(new Bird { Name = "老鹰" });
\`\`\`

### 五、接口 vs 抽象类

\`\`\`csharp
// 接口 vs 抽象类

// 接口：
// - 只能定义方法、属性、事件、索引器（不能有字段）
// - 所有成员默认公开，不能有访问修饰符
// - 类可以实现多个接口
// - 适合定义"能做什么"

// 抽象类：
// - 可以有字段、构造函数、普通方法
// - 成员可以有各种访问修饰符
// - 类只能继承一个抽象类
// - 适合定义"是什么"

// 示例：定义动物
abstract class Animal3
{
    // 可以有字段
    protected int _age;
    
    // 构造函数
    public Animal3(int age)
    {
        _age = age;
    }
    
    // 抽象方法
    public abstract void MakeSound();
    
    // 普通方法
    public void Eat()
    {
        Console.WriteLine("吃东西");
    }
}

interface IPet
{
    string Name { get; set; }
    void Play();
}

// 继承抽象类 + 实现接口
class Dog3 : Animal3, IPet
{
    public string Name { get; set; }
    
    public Dog3(int age, string name) : base(age)
    {
        Name = name;
    }
    
    public override void MakeSound()
    {
        Console.WriteLine("汪汪汪！");
    }
    
    public void Play()
    {
        Console.WriteLine($"{Name} 在玩耍");
    }
}
\`\`\`

### 六、小结

本章学到了：
- 多态的概念和应用
- 类型转换：向上转型和向下转型
- 抽象类和抽象方法
- 接口的定义和实现
- 接口与抽象类的区别

下一章我们学习抽象类与接口。`,
  },

  // ============================================================
  // 第十七章：抽象类与接口
  // ============================================================
  {
    id: 'csharp2-ch17',
    group: '第二部分 面向对象编程',
    icon: '📐',
    title: '抽象类与接口',
    content: `## 抽象类与接口

### 一、抽象类深入

\`\`\`csharp
// 抽象类：不能实例化，用于被继承

abstract class Document
{
    // 可以有字段
    protected string _content;
    
    // 构造函数
    protected Document(string content)
    {
        _content = content;
    }
    
    // 抽象属性
    public abstract string Title { get; }
    
    // 抽象方法
    public abstract void Render();
    
    // 普通方法
    public void Print()
    {
        Console.WriteLine($"打印文档：{Title}");
        Render();
    }
    
    // 虚方法
    public virtual void Save()
    {
        Console.WriteLine("保存文档");
    }
}

class PdfDocument : Document
{
    public override string Title => "PDF 文档";
    
    public PdfDocument(string content) : base(content) { }
    
    public override void Render()
    {
        Console.WriteLine("渲染 PDF 格式");
    }
    
    public override void Save()
    {
        base.Save();
        Console.WriteLine("保存为 .pdf 文件");
    }
}

class WordDocument : Document
{
    public override string Title => "Word 文档";
    
    public WordDocument(string content) : base(content) { }
    
    public override void Render()
    {
        Console.WriteLine("渲染 Word 格式");
    }
}

// 使用
Document doc1 = new PdfDocument("PDF 内容");
doc1.Print();
doc1.Save();

Document doc2 = new WordDocument("Word 内容");
doc2.Print();
\`\`\`

### 二、接口深入

\`\`\`csharp
// 接口：定义契约

// 接口可以包含：
// - 方法
// - 属性
// - 事件
// - 索引器

// C# 8+ 接口可以有默认实现
interface ILogger
{
    // 抽象成员
    void Log(string message);
    
    // 属性
    string LogLevel { get; set; }
    
    // 默认实现（C# 8+）
    void LogInfo(string message)
    {
        LogLevel = "INFO";
        Log($"[INFO] {message}");
    }
    
    void LogError(string message)
    {
        LogLevel = "ERROR";
        Log($"[ERROR] {message}");
    }
}

class ConsoleLogger : ILogger
{
    public string LogLevel { get; set; }
    
    public void Log(string message)
    {
        Console.WriteLine($"[{LogLevel}] {message}");
    }
}

class FileLogger : ILogger
{
    public string LogLevel { get; set; }
    private string _filePath;
    
    public FileLogger(string filePath)
    {
        _filePath = filePath;
    }
    
    public void Log(string message)
    {
        // 实际项目中会写入文件
        Console.WriteLine($"写入文件 {_filePath}: [{LogLevel}] {message}");
    }
}

// 使用
ILogger logger1 = new ConsoleLogger();
logger1.LogInfo("程序启动");
logger1.LogError("发生错误");

ILogger logger2 = new FileLogger("app.log");
logger2.LogInfo("程序启动");
\`\`\`

### 三、显式接口实现

\`\`\`csharp
// 显式接口实现：接口成员只能通过接口访问

interface IEnglish
{
    void Greet();
}

interface IChinese
{
    void Greet();
}

class BilingualPerson : IEnglish, IChinese
{
    // 显式实现接口
    void IEnglish.Greet()
    {
        Console.WriteLine("Hello!");
    }
    
    void IChinese.Greet()
    {
        Console.WriteLine("你好！");
    }
}

var person = new BilingualPerson();

// 必须通过接口引用调用
IEnglish english = person;
english.Greet();

IChinese chinese = person;
chinese.Greet();

// person.Greet();  // 编译错误！不能直接调用
\`\`\`

### 四、接口继承

\`\`\`csharp
// 接口可以继承其他接口

interface IShape
{
    double GetArea();
}

interface IColoredShape : IShape
{
    string Color { get; }
}

interface IResizableShape : IShape
{
    void Resize(double factor);
}

interface IColoredResizableShape : IColoredShape, IResizableShape
{
    void ShowInfo();
}

class Circle3 : IColoredResizableShape
{
    public string Color { get; set; }
    public double Radius { get; set; }
    
    public double GetArea() => Math.PI * Radius * Radius;
    
    public void Resize(double factor)
    {
        Radius *= factor;
    }
    
    public void ShowInfo()
    {
        Console.WriteLine($"颜色：{Color}，半径：{Radius}，面积：{GetArea():F2}");
    }
}

IColoredResizableShape shape = new Circle3 { Color = "Red", Radius = 5 };
shape.ShowInfo();
\`\`\`

### 五、小结

本章学到了：
- 抽象类的深入用法
- 接口的默认实现（C# 8+）
- 显式接口实现
- 接口继承

下一章我们学习静态类与扩展方法。`,
  },

  // ============================================================
  // 第十八章：静态类与扩展方法
  // ============================================================
  {
    id: 'csharp2-ch18',
    group: '第二部分 面向对象编程',
    icon: '🔌',
    title: '静态类与扩展方法',
    content: `## 静态类与扩展方法

### 一、静态类

\`\`\`csharp
// 静态类：只能包含静态成员，不能实例化

static class MathHelper
{
    // 静态字段
    public const double PI = 3.14159265358979;
    
    // 静态方法
    public static double Add(double a, double b) => a + b;
    public static double Multiply(double a, double b) => a * b;
    
    public static int Factorial(int n)
    {
        if (n <= 1) return 1;
        return n * Factorial(n - 1);
    }
}

// 使用：直接通过类名调用
Console.WriteLine($"PI: {MathHelper.PI}");
Console.WriteLine($"5! = {MathHelper.Factorial(5)}");

// 静态类的特点：
// 1. 不能实例化
// 2. 只能包含静态成员
// 3. 自动密封，不能被继承
// 4. 常用于工具类、辅助类
\`\`\`

### 二、静态成员

\`\`\`csharp
// 静态成员：属于类，不属于对象

class Counter
{
    // 静态字段：所有对象共享
    private static int _count = 0;
    
    // 实例字段：每个对象独立
    private int _id;
    
    public Counter()
    {
        _count++;
        _id = _count;
    }
    
    // 静态属性
    public static int Count => _count;
    
    // 实例属性
    public int Id => _id;
    
    // 静态方法
    public static void ResetCount()
    {
        _count = 0;
    }
}

var c1 = new Counter();
var c2 = new Counter();
var c3 = new Counter();

Console.WriteLine($"c1.Id: {c1.Id}");
Console.WriteLine($"c2.Id: {c2.Id}");
Console.WriteLine($"c3.Id: {c3.Id}");
Console.WriteLine($"总计数：{Counter.Count}");

Counter.ResetCount();
Console.WriteLine($"重置后计数：{Counter.Count}");
\`\`\`

### 三、扩展方法

\`\`\`csharp
// 扩展方法：为现有类型添加方法，无需修改原类型
// 必须定义在静态类中，第一个参数用 this 修饰

static class StringExtensions
{
    // 判断字符串是否为空或空白
    public static bool IsBlank(this string str)
    {
        return string.IsNullOrWhiteSpace(str);
    }
    
    // 反转字符串
    public static string Reverse(this string str)
    {
        char[] chars = str.ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }
    
    // 统计单词数
    public static int WordCount(this string str)
    {
        if (str.IsBlank()) return 0;
        return str.Split(new[] { ' ', '\\t', '\\n', '\\r' },
                        StringSplitOptions.RemoveEmptyEntries).Length;
    }
    
    // 截断字符串
    public static string Truncate(this string str, int maxLength)
    {
        if (string.IsNullOrEmpty(str)) return str;
        return str.Length <= maxLength ? str : str.Substring(0, maxLength) + "...";
    }
}

// 使用扩展方法
string text = "  Hello World  ";
Console.WriteLine($"IsBlank: {text.IsBlank()}");
Console.WriteLine($"Reverse: {text.Trim().Reverse()}");
Console.WriteLine($"WordCount: {"Hello World from C#".WordCount()}");
Console.WriteLine($"Truncate: {"这是一个很长的字符串".Truncate(10)}");

// 链式调用
string result = "  Hello World  ".Trim().Reverse().ToUpper();
Console.WriteLine($"链式调用：{result}");
\`\`\`

### 四、为其他类型添加扩展方法

\`\`\`csharp
static class IntExtensions
{
    // 判断是否为偶数
    public static bool IsEven(this int number) => number % 2 == 0;
    
    // 判断是否为正数
    public static bool IsPositive(this int number) => number > 0;
    
    // 转换为字节大小
    public static string ToFileSize(this long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double size = bytes;
        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }
        return $"{size:0.##} {sizes[order]}";
    }
    
    // 执行多次
    public static void Times(this int count, Action action)
    {
        for (int i = 0; i < count; i++)
        {
            action();
        }
    }
}

// 使用
int num = 10;
Console.WriteLine($"{num}.IsEven(): {num.IsEven()}");
Console.WriteLine($"{num}.IsPositive(): {num.IsPositive()}");

long fileSize = 1536;
Console.WriteLine($"文件大小：{fileSize.ToFileSize()}");

// 执行多次
3.Times(() => Console.WriteLine("Hello!"));
\`\`\`

### 五、扩展方法注意事项

\`\`\`csharp
// 扩展方法注意事项：

// 1. 扩展方法不能访问原类的私有成员
static class PersonExtensions
{
    // 错误示例：
    // public static void AccessPrivate(this Person p)
    // {
    //     Console.WriteLine(p._privateField);  // 编译错误！
    // }
}

// 2. 实例方法优先级高于扩展方法
class MyClass
{
    public void Print() => Console.WriteLine("实例方法");
}

static class MyClassExtensions
{
    public static void Print(this MyClass obj) => Console.WriteLine("扩展方法");
}

var obj = new MyClass();
obj.Print();  // 输出：实例方法（实例方法优先）

// 3. 扩展方法应该放在有意义的命名空间中
namespace MyCompany.Extensions
{
    static class DateTimeExtensions
    {
        public static string ToChineseDate(this DateTime date)
        {
            return $"{date.Year}年{date.Month}月{date.Day}日";
        }
    }
}

// 使用时需要 using 对应的命名空间
using MyCompany.Extensions;
Console.WriteLine(DateTime.Now.ToChineseDate());
\`\`\`

### 六、小结

本章学到了：
- 静态类和静态成员
- 扩展方法的定义和使用
- 为不同类型添加扩展方法
- 扩展方法的注意事项

下一章我们学习枚举与结构体。`,
  },

  // ============================================================
  // 第十九章：枚举与结构体
  // ============================================================
  {
    id: 'csharp2-ch19',
    group: '第二部分 面向对象编程',
    icon: '📊',
    title: '枚举与结构体',
    content: `## 枚举与结构体

### 一、枚举基础

\`\`\`csharp
// 枚举：一组命名的常量

// 定义枚举
enum Season
{
    Spring,  // 0
    Summer,  // 1
    Autumn,  // 2
    Winter   // 3
}

enum DayOfWeek2
{
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

// 使用枚举
Season currentSeason = Season.Autumn;
Console.WriteLine($"当前季节：{currentSeason}");
Console.WriteLine($"数值：{(int)currentSeason}");

DayOfWeek2 today = DayOfWeek2.Friday;
Console.WriteLine($"今天：{today}");

// 枚举转换
int seasonValue = (int)Season.Summer;
Season seasonFromValue = (Season)2;
Console.WriteLine($"Summer 的值：{seasonValue}");
Console.WriteLine($"值 2 对应的季节：{seasonFromValue}");
\`\`\`

### 二、枚举与 switch

\`\`\`csharp
enum OrderStatus
{
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled
}

class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    
    public void ShowStatus()
    {
        string statusText = Status switch
        {
            OrderStatus.Pending => "待处理",
            OrderStatus.Processing => "处理中",
            OrderStatus.Shipped => "已发货",
            OrderStatus.Delivered => "已送达",
            OrderStatus.Cancelled => "已取消",
            _ => "未知状态"
        };
        
        Console.WriteLine($"订单 {Id}：{statusText}");
    }
}

var order1 = new Order { Id = 1001, Status = OrderStatus.Pending };
var order2 = new Order { Id = 1002, Status = OrderStatus.Shipped };

order1.ShowStatus();
order2.ShowStatus();
\`\`\`

### 三、标志枚举

\`\`\`csharp
// 标志枚举：用 [Flags] 标记，可以组合多个值

[Flags]
enum FileAccess
{
    None = 0,       // 0000
    Read = 1,       // 0001
    Write = 2,      // 0010
    Execute = 4,    // 0100
    Delete = 8      // 1000
}

// 组合标志
FileAccess permission = FileAccess.Read | FileAccess.Write;
Console.WriteLine($"权限：{permission}");

// 检查是否包含某个标志
bool canRead = (permission & FileAccess.Read) == FileAccess.Read;
bool canWrite = (permission & FileAccess.Write) == FileAccess.Write;
bool canExecute = (permission & FileAccess.Execute) == FileAccess.Execute;

Console.WriteLine($"可读：{canRead}");
Console.WriteLine($"可写：{canWrite}");
Console.WriteLine($"可执行：{canExecute}");

// 添加标志
permission |= FileAccess.Execute;
Console.WriteLine($"添加执行权限后：{permission}");

// 移除标志
permission &= ~FileAccess.Write;
Console.WriteLine($"移除写入权限后：{permission}");

// C# 4+ 可以使用 HasFlag 方法
if (permission.HasFlag(FileAccess.Read))
{
    Console.WriteLine("有读取权限");
}
\`\`\`

### 四、结构体基础

\`\`\`csharp
// 结构体：值类型，适合小型数据结构

struct Point
{
    public double X;
    public double Y;
    
    // 构造函数
    public Point(double x, double y)
    {
        X = x;
        Y = y;
    }
    
    // 方法
    public double DistanceTo(Point other)
    {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }
    
    // 重写 ToString
    public override string ToString()
    {
        return $"({X}, {Y})";
    }
}

// 使用结构体
var p1 = new Point(3, 4);
var p2 = new Point(6, 8);

Console.WriteLine($"p1: {p1}");
Console.WriteLine($"p2: {p2}");
Console.WriteLine($"距离：{p1.DistanceTo(p2)}");

// 结构体是值类型
var p3 = p1;  // 复制值，不是复制引用
p3.X = 100;
Console.WriteLine($"p1.X: {p1.X}");  // 3（未改变）
Console.WriteLine($"p3.X: {p3.X}");  // 100
\`\`\`

### 五、结构体 vs 类

\`\`\`csharp
// 结构体 vs 类

// 结构体：
// - 值类型（存储在栈上）
// - 赋值时复制值
// - 不能继承
// - 适合小型、频繁创建的数据结构

// 类：
// - 引用类型（存储在堆上）
// - 赋值时复制引用
// - 可以继承
// - 适合复杂、需要共享的数据

struct Size
{
    public double Width;
    public double Height;
    
    public double Area => Width * Height;
}

class RectangleData
{
    public double Width;
    public double Height;
    
    public double Area => Width * Height;
}

// 结构体赋值
Size s1 = new Size { Width = 10, Height = 5 };
Size s2 = s1;  // 复制值
s2.Width = 20;
Console.WriteLine($"s1.Area: {s1.Area}");  // 50
Console.WriteLine($"s2.Area: {s2.Area}");  // 100

// 类赋值
var r1 = new RectangleData { Width = 10, Height = 5 };
var r2 = r1;  // 复制引用
r2.Width = 20;
Console.WriteLine($"r1.Area: {r1.Area}");  // 100
Console.WriteLine($"r2.Area: {r2.Area}");  // 100

// 何时使用结构体：
// 1. 逻辑上表示单个值（如坐标、颜色、矩形）
// 2. 实例较小（通常 < 16 字节）
// 3. 不需要继承
// 4. 频繁创建和销毁

// 何时使用类：
// 1. 需要继承
// 2. 实例较大
// 3. 需要引用语义
\`\`\`

### 六、record 结构体（C# 10+）

\`\`\`csharp
// record struct：不可变结构体

record struct Temperature(double Celsius)
{
    public double Fahrenheit => Celsius * 9 / 5 + 32;
    public double Kelvin => Celsius + 273.15;
}

var temp1 = new Temperature(25);
var temp2 = temp1 with { Celsius = 30 };  // with 表达式

Console.WriteLine($"temp1: {temp1.Celsius}°C");
Console.WriteLine($"temp2: {temp2.Celsius}°C");
Console.WriteLine($"temp1 华氏：{temp1.Fahrenheit}°F");
Console.WriteLine($"temp1 开尔文：{temp1.Kelvin}K");

// record struct 自动实现值相等性
var temp3 = new Temperature(25);
Console.WriteLine($"temp1 == temp3: {temp1 == temp3}");  // true
\`\`\`

### 七、小结

本章学到了：
- 枚举的定义和使用
- 枚举与 switch 表达式
- 标志枚举（\`[Flags]\`）
- 结构体的基础用法
- 结构体与类的区别
- \`record struct\`（C# 10+）

下一章我们学习记录类型与模式匹配。`,
  },

  // ============================================================
  // 第二十章：记录类型与模式匹配
  // ============================================================
  {
    id: 'csharp2-ch20',
    group: '第二部分 面向对象编程',
    icon: '📝',
    title: '记录类型与模式匹配',
    content: `## 记录类型与模式匹配

### 一、record 类型

\`\`\`csharp
// record：不可变数据载体，自动实现值相等性

// record class（引用类型）
record Person(string Name, int Age)
{
    // 可以添加方法
    public void Greet()
    {
        Console.WriteLine($"Hello, I'm {Name}, {Age} years old");
    }
}

var person1 = new Person("张三", 25);
var person2 = new Person("张三", 25);
var person3 = new Person("李四", 30);

Console.WriteLine($"person1 == person2: {person1 == person2}");  // true（值相等）
Console.WriteLine($"person1 == person3: {person1 == person3}");  // false

// with 表达式：创建副本并修改部分属性
var person4 = person1 with { Age = 26 };
Console.WriteLine($"person4: {person4}");  // Person { Name = 张三, Age = 26 }

// 解构
var (name, age) = person1;
Console.WriteLine($"Name: {name}, Age: {age}");

// record 的继承
record Animal(string Name, string Species);
record Dog(string Name, string Breed) : Animal(Name, "Dog");

var dog = new Dog("旺财", "金毛");
Console.WriteLine($"Dog: {dog}");
\`\`\`

### 二、record struct

\`\`\`csharp
// record struct：值类型的 record

record struct Point(double X, double Y)
{
    public double DistanceTo(Point other)
    {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }
}

var p1 = new Point(3, 4);
var p2 = new Point(3, 4);
var p3 = p1 with { X = 6 };

Console.WriteLine($"p1 == p2: {p1 == p2}");  // true
Console.WriteLine($"p3: {p3}");
Console.WriteLine($"距离：{p1.DistanceTo(p3)}");

// readonly record struct：完全不可变
readonly record struct Color(byte R, byte G, byte B)
{
    public string ToHex() => $"#{R:X2}{G:X2}{B:X2}";
}

var red = new Color(255, 0, 0);
Console.WriteLine($"Red: {red.ToHex()}");
\`\`\`

### 三、模式匹配深入

\`\`\`csharp
// 模式匹配：C# 7+ 引入，C# 9/10/11 不断增强

// 1. 类型模式
object obj = "Hello";

if (obj is string s)
{
    Console.WriteLine($"字符串：{s}");
}

// 2. 常量模式
int? nullable = 42;

if (nullable is 42)
{
    Console.WriteLine("值是 42");
}

// 3. 关系模式
int score = 85;

string grade = score switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _ => "F"
};

Console.WriteLine($"分数 {score}，等级 {grade}");

// 4. 逻辑模式
int temperature = 25;

string comfort = temperature switch
{
    < 0 or > 40 => "极端温度",
    >= 0 and < 10 => "寒冷",
    >= 10 and < 20 => "凉爽",
    >= 20 and <= 30 => "舒适",
    > 30 and <= 40 => "炎热"
};

Console.WriteLine($"温度 {temperature}°C，{comfort}");

// 5. 属性模式
record User(string Name, int Age, string City);

var user = new User("张三", 25, "北京");

string greeting = user switch
{
    { Age: < 18 } => $"未成年用户 {user.Name}",
    { Age: >= 18 and < 60, City: "北京" } => $"北京成年用户 {user.Name}",
    { Age: >= 60 } => $"老年用户 {user.Name}",
    _ => $"用户 {user.Name}"
};

Console.WriteLine(greeting);
\`\`\`

### 四、列表模式（C# 11+）

\`\`\`csharp
// 列表模式：匹配数组或列表的元素

int[] numbers = { 1, 2, 3, 4, 5 };

string result = numbers switch
{
    [1, 2, ..] => "以 1, 2 开头",
    [_, _, _, ..] => "至少有 3 个元素",
    [] => "空数组",
    _ => "其他"
};

Console.WriteLine(result);

// 匹配特定长度
int[] array = { 10, 20, 30 };

string desc = array switch
{
    [var a] => $"单元素：{a}",
    [var a, var b] => $"双元素：{a}, {b}",
    [var a, var b, var c] => $"三元素：{a}, {b}, {c}",
    _ => "更多元素"
};

Console.WriteLine(desc);

// 结合其他模式
int[] values = { 1, 2, 3 };

bool match = values is [1, >= 2, < 5];
Console.WriteLine($"匹配：{match}");  // true
\`\`\`

### 五、模式匹配实战

\`\`\`csharp
// 模式匹配在实际开发中的应用

// 1. 解析命令
string command = "GET /api/users";

var result = command.Split(' ') switch
{
    ["GET", var path] => $"获取资源：{path}",
    ["POST", var path] => $"创建资源：{path}",
    ["PUT", var path] => $"更新资源：{path}",
    ["DELETE", var path] => $"删除资源：{path}",
    _ => "未知命令"
};

Console.WriteLine(result);

// 2. 数据验证
record Request(string Method, string Path, int Port);

string ValidateRequest(Request request) => request switch
{
    { Method: "GET" or "POST", Path: not null, Port: >= 80 and <= 65535 } => "有效请求",
    { Method: null } => "方法不能为空",
    { Path: null } => "路径不能为空",
    { Port: < 80 or > 65535 } => "端口无效",
    _ => "无效请求"
};

var req1 = new Request("GET", "/api/users", 8080);
var req2 = new Request(null, "/api/users", 8080);
var req3 = new Request("GET", "/api/users", 70000);

Console.WriteLine(ValidateRequest(req1));
Console.WriteLine(ValidateRequest(req2));
Console.WriteLine(ValidateRequest(req3));

// 3. 状态机
enum State { Idle, Running, Paused, Stopped }
enum Event { Start, Pause, Resume, Stop }

State HandleEvent(State current, Event evt) => (current, evt) switch
{
    (State.Idle, Event.Start) => State.Running,
    (State.Running, Event.Pause) => State.Paused,
    (State.Running, Event.Stop) => State.Stopped,
    (State.Paused, Event.Resume) => State.Running,
    (State.Paused, Event.Stop) => State.Stopped,
    _ => current
};

State state = State.Idle;
state = HandleEvent(state, Event.Start);
Console.WriteLine($"状态：{state}");  // Running
state = HandleEvent(state, Event.Pause);
Console.WriteLine($"状态：{state}");  // Paused
\`\`\`

### 六、小结

本章学到了：
- \`record\` 类型和值相等性
- \`record struct\` 和 \`readonly record struct\`
- 模式匹配的各种形式：类型、常量、关系、逻辑、属性、列表
- 模式匹配在实际开发中的应用

第二部分面向对象编程到此结束！接下来我们进入第三部分：集合与泛型。`,
  },
];

export { chapters };
