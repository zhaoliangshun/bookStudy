// =============================================================
// C# 从入门到精通大全（终极版）—— 第5批章节
// 第五部分 面向对象基础（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp3-ch19    : 第十九章 类与对象
//   csharp3-ch20    : 第二十章 字段与属性
//   csharp3-ch21    : 第二十一章 构造函数与析构函数
//   csharp3-ch22    : 第二十二章 静态成员与静态类
//   csharp3-ch23    : 第二十三章 继承
//   csharp3-ch24    : 第二十四章 多态
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第十九章：类与对象
  // ============================================================
  {
    id: 'csharp3-ch19',
    group: '第五部分 面向对象基础',
    icon: '🏛️',
    title: '第十九章 类与对象',
    content: `## 第十九章　类与对象

类是 C# 中最核心的概念，对象是类的实例。本章讲解类的定义、创建对象、字段与属性、访问修饰符、this 关键字和对象初始化器。

### 一、类的定义与对象创建 ⭐

\`\`\`csharp
// 类定义：class 关键字，类名通常用 PascalCase（首字母大写）
// 类是创建对象的"蓝图"或"模板"

// 定义一个简单的 Person 类
class Person
{
    // 字段（Field）：存储数据
    public string Name;     // public 表示可以从外部访问
    public int Age;         // 年龄字段
    public string City;     // 城市字段

    // 方法（Method）：定义行为
    public void Introduce()
    {
        // this 关键字：引用当前对象实例
        // 当字段名和参数名不冲突时，this 可以省略
        Console.WriteLine($"大家好，我叫 {Name}，今年 {Age} 岁，来自 {City}");
    }
}

// 创建对象：使用 new 关键字
// Person 是类（类型），person1 是对象（实例）
Person person1 = new Person();  // 创建一个 Person 对象

// 给对象的字段赋值
person1.Name = "张三";    // 通过"对象名.字段名"访问
person1.Age = 25;
person1.City = "北京";

// 调用对象的方法
person1.Introduce();  // 输出：大家好，我叫 张三，今年 25 岁，来自 北京

// 可以创建多个对象，每个对象有自己的数据
Person person2 = new Person();
person2.Name = "李四";
person2.Age = 30;
person2.City = "上海";
person2.Introduce();

// 每个对象相互独立
Console.WriteLine($"person1 的年龄：{person1.Age}");  // 25
Console.WriteLine($"person2 的年龄：{person2.Age}");  // 30
\`\`\`

### 二、字段 vs 属性 ⭐

\`\`\`csharp
// 字段（Field）：直接存储数据的变量，通常用 private 修饰
// 属性（Property）：封装字段的访问器，提供 get/set 逻辑

class Product
{
    // 字段：通常 private，外部不能直接访问
    private string _name;   // 私有字段命名约定：下划线开头
    private double _price;

    // 属性：提供对字段的受控访问
    public string Name
    {
        get { return _name; }   // get 访问器：读取时执行
        set { _name = value; }  // set 访问器：赋值时执行，value 是传入的值
    }

    public double Price
    {
        get { return _price; }
        set
        {
            // 在 set 中可以添加验证逻辑
            if (value < 0)
            {
                throw new ArgumentException("价格不能为负数");
            }
            _price = value;
        }
    }

    // 自动实现的属性（Auto-implemented Property）：最简洁
    // 编译器自动生成隐藏的 backing field
    public string Category { get; set; }  // 自动属性，不需要手动写字段

    public void Display()
    {
        Console.WriteLine($"商品：{Name}，价格：{Price:C}，分类：{Category}");
    }
}

var product = new Product();
product.Name = "笔记本电脑";    // 通过属性赋值（调用 set）
product.Price = 5999.99;
product.Category = "电子产品";
product.Display();
Console.WriteLine($"商品名：{product.Name}");  // 通过属性读取（调用 get）
\`\`\`

### 三、访问修饰符 ⭐

\`\`\`csharp
// 访问修饰符控制类成员的可见性

class AccessDemo
{
    public int PublicField = 1;        // public：任何地方都能访问
    private int PrivateField = 2;      // private：仅当前类内部能访问
    protected int ProtectedField = 3;  // protected：当前类 + 子类能访问
    internal int InternalField = 4;    // internal：同一程序集内能访问
    protected internal int ProtInternalField = 5; // protected OR internal
    private protected int PrivProtField = 6;      // protected AND internal（C# 7.2+）

    public void ShowPrivate()
    {
        Console.WriteLine($"私有字段：{PrivateField}");  // 类内部可以访问
    }
}

var demo = new AccessDemo();
Console.WriteLine($"public 字段：{demo.PublicField}");   // 可以访问
// Console.WriteLine(demo.PrivateField);  // 编译错误！外部不能访问 private
demo.ShowPrivate();  // 通过公有方法间接访问私有字段

// 类的默认访问修饰符是 internal
// 类成员的默认访问修饰符是 private
\`\`\`

| 修饰符 | 访问范围 | 使用场景 |
| --- | --- | --- |
| \`public\` | 任何地方 | 对外 API |
| \`private\` | 仅当前类 | 内部实现细节 |
| \`protected\` | 当前类 + 子类 | 供子类使用的成员 |
| \`internal\` | 同一程序集 | 模块内部共享 |
| \`protected internal\` | 子类 OR 同程序集 | 两者之一满足即可 |
| \`private protected\` | 子类 AND 同程序集 | 两者都满足 |

### 四、this 关键字

\`\`\`csharp
// this：引用当前对象实例
// 常用于：区分字段和参数、调用其他构造函数、传递当前对象

class Student
{
    private string name;
    private int age;

    // 场景1：区分字段和参数（参数名和字段名相同时）
    public void SetName(string name)
    {
        // this.name 是字段，name 是参数
        this.name = name;  // 左边是字段，右边是参数
    }

    // 场景2：返回当前对象（链式调用）
    public Student SetAge(int age)
    {
        this.age = age;
        return this;  // 返回当前对象，支持链式调用
    }

    public void Display()
    {
        Console.WriteLine($"姓名：{this.name}，年龄：{this.age}");
    }
}

var student = new Student();
student.SetName("张三");
student.SetAge(20).Display();  // 链式调用

// 当字段名和参数名不冲突时，this 可以省略
// 但为了代码清晰，有些团队要求在访问实例成员时始终使用 this
\`\`\`

### 五、对象初始化器 ⭐

\`\`\`csharp
// 对象初始化器：在创建对象时直接设置属性值
// 语法：new 类名 { 属性名 = 值, 属性名 = 值, ... }

class Book
{
    public string Title { get; set; }
    public string Author { get; set; }
    public double Price { get; set; }
    public int Pages { get; set; }

    public void Display()
    {
        Console.WriteLine($"《{Title}》作者：{Author}，价格：{Price:C}，页数：{Pages}");
    }
}

// 传统方式：逐行赋值
var book1 = new Book();
book1.Title = "C# 编程指南";
book1.Author = "张三";
book1.Price = 79.99;
book1.Pages = 500;

// 对象初始化器：一行搞定（推荐）
var book2 = new Book
{
    Title = "C# 编程指南",
    Author = "张三",
    Price = 79.99,
    Pages = 500
};

// 可以只设置部分属性
var book3 = new Book
{
    Title = "C# 入门",
    Price = 29.99
    // Author 和 Pages 使用默认值
};

book2.Display();
book3.Display();

// 对象初始化器可以嵌套
class Library
{
    public string Name { get; set; }
    public Book FeaturedBook { get; set; }
}

var library = new Library
{
    Name = "城市图书馆",
    FeaturedBook = new Book  // 嵌套初始化
    {
        Title = "C# 高级编程",
        Author = "李四",
        Price = 99.99
    }
};
\`\`\`

### 六、实战 demo：银行账户类

\`\`\`csharp
// 综合运用：一个简单的银行账户类
class BankAccount
{
    // 私有字段（外部不能直接访问，保证数据安全）
    private string _accountNumber;  // 账号
    private string _ownerName;      // 户主名
    private decimal _balance;       // 余额（用 decimal 保证精度）

    // 公共属性（只读属性，只能通过方法修改余额）
    public string AccountNumber => _accountNumber;  // 表达式体属性（只读）
    public string OwnerName => _ownerName;
    public decimal Balance => _balance;  // 余额只能读，不能直接改

    // 构造函数：创建对象时初始化
    public BankAccount(string accountNumber, string ownerName, decimal initialBalance)
    {
        _accountNumber = accountNumber;  // 设置账号
        _ownerName = ownerName;          // 设置户主名
        _balance = initialBalance;       // 设置初始余额
    }

    // 存款方法
    public void Deposit(decimal amount)
    {
        if (amount <= 0)  // 验证存款金额
        {
            Console.WriteLine("存款金额必须大于 0");
            return;
        }
        _balance += amount;  // 增加余额
        Console.WriteLine($"存款 {amount:C} 成功，当前余额：{_balance:C}");
    }

    // 取款方法
    public bool Withdraw(decimal amount)
    {
        if (amount <= 0)  // 验证取款金额
        {
            Console.WriteLine("取款金额必须大于 0");
            return false;
        }
        if (amount > _balance)  // 验证余额是否足够
        {
            Console.WriteLine($"余额不足！当前余额：{_balance:C}");
            return false;
        }
        _balance -= amount;  // 扣减余额
        Console.WriteLine($"取款 {amount:C} 成功，当前余额：{_balance:C}");
        return true;
    }

    // 显示账户信息
    public void DisplayInfo()
    {
        Console.WriteLine($"账号：{_accountNumber}");
        Console.WriteLine($"户主：{_ownerName}");
        Console.WriteLine($"余额：{_balance:C}");
    }
}

// 使用银行账户类
var account = new BankAccount("6222021234567890", "张三", 10000m);
account.DisplayInfo();
account.Deposit(5000m);     // 存款 5000
account.Withdraw(3000m);    // 取款 3000
account.Withdraw(20000m);   // 余额不足
\`\`\`

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| 类定义 | class 关键字，字段 + 属性 + 方法 |
| 创建对象 | new 关键字，每个对象独立 |
| 字段 vs 属性 | 字段存储数据，属性封装访问 |
| 访问修饰符 | public/private/protected/internal |
| this 关键字 | 引用当前实例，区分字段和参数 |
| 对象初始化器 | new 类名 { 属性 = 值 } |

> 类是面向对象编程的基础。下一章我们深入学习字段与属性的各种用法。`,
  },

  // ============================================================
  // 第二十章：字段与属性
  // ============================================================
  {
    id: 'csharp3-ch20',
    group: '第五部分 面向对象基础',
    icon: '📋',
    title: '第二十章 字段与属性',
    content: `## 第二十章　字段与属性

字段是存储数据的变量，属性是封装字段的访问器。本章深入讲解自动属性、get/set 访问器、init-only 属性、计算属性、表达式体属性、required 关键字。

### 一、后台字段与完整属性 ⭐

\`\`\`csharp
// 完整属性：手动定义后台字段（backing field）和 get/set 访问器
// 适合需要在访问时添加逻辑（验证、计算、通知等）的场景

class Temperature
{
    // 后台字段：私有，命名约定 _camelCase
    private double _celsius;

    // 完整属性：封装后台字段
    public double Celsius
    {
        get
        {
            // get 访问器：读取时执行
            return _celsius;  // 返回后台字段的值
        }
        set
        {
            // set 访问器：赋值时执行
            // value 是隐式参数，类型与属性类型相同
            if (value < -273.15)  // 绝对零度检查
            {
                throw new ArgumentException("温度不能低于绝对零度（-273.15°C）");
            }
            _celsius = value;  // 给后台字段赋值
        }
    }

    // 只读属性（只有 get，没有 set）：从其他属性计算得出
    public double Fahrenheit
    {
        get
        {
            // 华氏度 = 摄氏度 × 9/5 + 32
            return _celsius * 9 / 5 + 32;
        }
        // 没有 set，所以 Fahrenheit 是只读的
    }

    // 只写属性（只有 set，没有 get）：少见
    private string _log;
    public string WriteOnlyLog
    {
        set { _log = value; }  // 只能写入，不能读取
    }
}

var temp = new Temperature();
temp.Celsius = 25;  // 调用 set 访问器
Console.WriteLine($"摄氏度：{temp.Celsius}");       // 调用 get：25
Console.WriteLine($"华氏度：{temp.Fahrenheit}");    // 调用 get：77

// temp.Celsius = -300;  // 抛出异常：温度不能低于绝对零度
\`\`\`

### 二、自动实现的属性 ⭐⭐

\`\`\`csharp
// 自动属性：编译器自动生成后台字段
// 最简洁的写法，日常开发中最常用

class Person
{
    // 自动属性：读写的
    public string Name { get; set; }  // 编译器生成私有后台字段
    public int Age { get; set; }

    // 自动属性：只读的（只能在构造函数中赋值）
    public string Id { get; }  // 只有 get，没有 set

    // 自动属性：只写的（少见）
    // public string Password { set; }  // 只有 set

    // 自动属性可以有不同的访问级别
    public int Score { get; private set; }  // 公共读，私有写
    // 外部可以读取 Score，但只能在类内部修改

    public Person(string id)
    {
        Id = id;  // 只读自动属性只能在构造函数中赋值
    }

    public void UpdateScore(int newScore)
    {
        Score = newScore;  // private set 允许在类内部修改
    }
}

var person = new Person("P001");
person.Name = "张三";  // 自动属性：直接赋值
person.Age = 25;
// person.Id = "P002";        // 编译错误！只读属性不能赋值
// person.Score = 100;        // 编译错误！Score 的 set 是 private
person.UpdateScore(95);       // 通过方法间接修改
Console.WriteLine($"{person.Name}，ID：{person.Id}，分数：{person.Score}");
\`\`\`

### 三、init-only 属性（C# 9+）⭐

\`\`\`csharp
// init 访问器：只能在对象初始化时赋值，之后不可修改
// 比 private set 更严格：初始化后完全不可变

class ImmutablePerson
{
    public string Name { get; init; }  // init 替代 set
    public int Age { get; init; }
    public string City { get; init; }

    public void Display()
    {
        Console.WriteLine($"{Name}，{Age} 岁，{City}");
    }
}

// 对象初始化时可以赋值
var person = new ImmutablePerson
{
    Name = "张三",
    Age = 25,
    City = "北京"
};

// person.Name = "李四";  // 编译错误！init 属性只能在初始化时赋值
// person.Age = 30;       // 编译错误！
person.Display();

// init 属性也可以在构造函数中赋值
class Employee
{
    public string Name { get; init; }
    public string Department { get; init; }

    public Employee(string name, string department)
    {
        Name = name;           // 构造函数中可以给 init 属性赋值
        Department = department;
    }
}

var emp = new Employee("李四", "研发部");
// emp.Name = "王五";  // 编译错误！对象创建后不可修改
\`\`\`

### 四、计算属性

\`\`\`csharp
// 计算属性：不存储数据，而是根据其他数据计算得出
// 只有 get 访问器（或 get + private set）

class Rectangle
{
    public double Width { get; set; }   // 宽度
    public double Height { get; set; }  // 高度

    // 计算属性：面积 = 宽度 × 高度
    public double Area
    {
        get { return Width * Height; }  // 每次读取时动态计算
        // 没有 set，因为面积由宽高决定
    }

    // 计算属性：周长 = 2 × (宽 + 高)
    public double Perimeter => 2 * (Width + Height);  // 表达式体写法

    // 带缓存的属性（兼顾性能和正确性）
    private double? _cachedArea;  // 缓存字段
    private double _cachedWidth, _cachedHeight;

    public double CachedArea
    {
        get
        {
            // 如果宽高变了，重新计算
            if (Width != _cachedWidth || Height != _cachedHeight)
            {
                _cachedArea = Width * Height;
                _cachedWidth = Width;
                _cachedHeight = Height;
            }
            return _cachedArea ?? 0;
        }
    }
}

var rect = new Rectangle { Width = 5, Height = 3 };
Console.WriteLine($"矩形：{rect.Width} × {rect.Height}");
Console.WriteLine($"面积：{rect.Area}");       // 15
Console.WriteLine($"周长：{rect.Perimeter}");  // 16

rect.Width = 10;  // 修改宽度
Console.WriteLine($"修改后面积：{rect.Area}");  // 30（自动重新计算）
\`\`\`

### 五、表达式体属性

\`\`\`csharp
// 表达式体属性：用 => 简化单行属性
// 适合只读计算属性、转换属性

class User
{
    public string FirstName { get; set; }
    public string LastName { get; set; }

    // 表达式体属性：只读计算属性
    public string FullName => $"{FirstName} {LastName}";

    // 表达式体属性：带逻辑
    public string DisplayName =>
        string.IsNullOrEmpty(FullName) ? "匿名用户" : FullName;

    // 表达式体属性：bool 类型
    public bool HasName => !string.IsNullOrEmpty(FirstName);

    // 表达式体属性：从其他数据计算
    public string Initials =>
        $"{FirstName?[0]}{LastName?[0]}".ToUpper();  // 首字母缩写
}

var user = new User { FirstName = "张", LastName = "三" };
Console.WriteLine($"全名：{user.FullName}");       // 张 三
Console.WriteLine($"显示名：{user.DisplayName}"); // 张 三
Console.WriteLine($"有名字：{user.HasName}");      // True
Console.WriteLine($"缩写：{user.Initials}");       // ZS
\`\`\`

### 六、required 关键字（C# 11+）⭐

\`\`\`csharp
// required：标记属性为必须初始化
// 编译器强制在对象创建时提供值，防止忘记设置重要属性

class Product
{
    public required string Name { get; set; }  // 必须设置
    public required decimal Price { get; set; } // 必须设置
    public string? Description { get; set; }   // 可选
    public int Stock { get; set; } = 0;        // 有默认值，可选

    public void Display()
    {
        Console.WriteLine($"商品：{Name}，价格：{Price:C}，库存：{Stock}");
    }
}

// 必须提供 Name 和 Price
var product = new Product
{
    Name = "笔记本电脑",  // 必须设置
    Price = 5999.99m      // 必须设置
    // Description 和 Stock 可选
};
product.Display();

// 没有 required 的类，可能忘记设置重要属性
// 有了 required，编译器会在编译时检查
// var p2 = new Product { Name = "手机" };  // 编译错误！缺少 Price

// 通过构造函数设置 required 属性
class Order
{
    public required string OrderId { get; init; }  // required + init 组合
    public required decimal Amount { get; init; }

    // 使用 SetsRequiredMembers 特性标记构造函数
    [System.Diagnostics.CodeAnalysis.SetsRequiredMembers]
    public Order(string orderId, decimal amount)
    {
        OrderId = orderId;
        Amount = amount;
    }
}

var order = new Order("ORD-001", 999.99m);  // 通过构造函数设置
Console.WriteLine($"订单：{order.OrderId}，金额：{order.Amount:C}");
\`\`\`

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| 完整属性 | get/set 访问器 + 后台字段 + 验证逻辑 |
| 自动属性 | { get; set; } 编译器自动生成字段 |
| 只读自动属性 | { get; } 只能在构造函数中赋值 |
| init 属性 | C# 9+，只能在初始化时赋值 |
| 计算属性 | 不存储数据，动态计算 |
| 表达式体属性 | => 简化单行属性 |
| required | C# 11+，强制初始化 |

> 属性是 C# 封装的核心机制。下一章我们学习构造函数与析构函数。`,
  },

  // ============================================================
  // 第二十一章：构造函数与析构函数
  // ============================================================
  {
    id: 'csharp3-ch21',
    group: '第五部分 面向对象基础',
    icon: '🏗️',
    title: '第二十一章 构造函数与析构函数',
    content: `## 第二十一章　构造函数与析构函数

构造函数在对象创建时初始化对象，析构函数在对象销毁时清理资源。本章涵盖默认构造函数、参数化构造函数、重载、链式调用、主构造函数（C# 12）、静态构造函数。

### 一、默认构造函数 ⭐

\`\`\`csharp
// 默认构造函数：无参数的构造函数
// 如果没有定义任何构造函数，编译器会自动生成一个无参构造函数
// 如果定义了任何构造函数，编译器不再自动生成

class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    // 默认构造函数（无参）
    public Person()
    {
        // 构造函数体：初始化对象
        Name = "未知";      // 设置默认值
        Age = 0;
        Console.WriteLine("Person 对象已创建（默认构造函数）");
    }

    public void Display()
    {
        Console.WriteLine($"姓名：{Name}，年龄：{Age}");
    }
}

var person = new Person();  // 调用默认构造函数
person.Display();  // 姓名：未知，年龄：0

// 如果没有定义构造函数，编译器生成类似这样的默认构造函数：
// public Person() { }

// 注意：如果定义了带参数的构造函数，默认构造函数不再自动生成
// 如果需要，必须显式声明
\`\`\`

### 二、参数化构造函数 ⭐

\`\`\`csharp
// 参数化构造函数：接受参数，在创建对象时直接初始化

class Student
{
    public string Name { get; set; }
    public int Age { get; set; }
    public string Grade { get; set; }

    // 参数化构造函数：创建对象时必须提供参数
    public Student(string name, int age, string grade)
    {
        Name = name;      // 用参数初始化属性
        Age = age;
        Grade = grade;
        Console.WriteLine($"学生 {Name} 已创建");
    }

    public void Display()
    {
        Console.WriteLine($"学生：{Name}，{Age} 岁，{Grade} 年级");
    }
}

// 创建对象时必须传参
var student1 = new Student("张三", 18, "高三");
student1.Display();

var student2 = new Student("李四", 16, "高一");
student2.Display();

// var student3 = new Student();  // 编译错误！没有无参构造函数
\`\`\`

### 三、构造函数重载 ⭐

\`\`\`csharp
// 构造函数可以重载：提供多个不同参数版本的构造函数
// 让用户可以根据需要选择不同的初始化方式

class Product
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }

    // 重载1：只需要名称和价格
    public Product(string name, decimal price)
    {
        Name = name;
        Price = price;
        Category = "未分类";  // 默认分类
    }

    // 重载2：名称、价格、分类
    public Product(string name, decimal price, string category)
    {
        Name = name;
        Price = price;
        Category = category;
    }

    // 重载3：只需要名称
    public Product(string name)
    {
        Name = name;
        Price = 0;
        Category = "未分类";
    }

    public void Display()
    {
        Console.WriteLine($"商品：{Name}，价格：{Price:C}，分类：{Category}");
    }
}

var p1 = new Product("笔记本", 5999.99m);
var p2 = new Product("鼠标", 199.99m, "外设");
var p3 = new Product("待定商品");

p1.Display();  // 商品：笔记本，价格：¥5,999.99，分类：未分类
p2.Display();  // 商品：鼠标，价格：¥199.99，分类：外设
p3.Display();  // 商品：待定商品，价格：¥0.00，分类：未分类
\`\`\`

### 四、this() 构造函数链式调用

\`\`\`csharp
// this()：一个构造函数调用另一个构造函数
// 避免重复代码，所有构造函数最终调用一个"主构造函数"

class Employee
{
    public string Name { get; set; }
    public int Age { get; set; }
    public string Department { get; set; }
    public decimal Salary { get; set; }

    // 主构造函数：参数最全的版本
    public Employee(string name, int age, string department, decimal salary)
    {
        Name = name;
        Age = age;
        Department = department;
        Salary = salary;
        Console.WriteLine($"员工 {Name} 已创建（完整信息）");
    }

    // 简化构造函数：只提供姓名和部门，年龄和薪资使用默认值
    // this() 调用主构造函数，传递默认值
    public Employee(string name, string department)
        : this(name, 0, department, 0)  // 调用主构造函数
    {
        Console.WriteLine($"  （年龄和薪资使用默认值）");
    }

    // 最简构造函数：只需要姓名
    public Employee(string name)
        : this(name, 0, "未分配", 0)  // 调用主构造函数
    {
        Console.WriteLine($"  （使用最小默认值）");
    }

    public void Display()
    {
        Console.WriteLine($"员工：{Name}，{Age}岁，{Department}，薪资：{Salary:C}");
    }
}

var emp1 = new Employee("张三", 30, "研发部", 15000m);
var emp2 = new Employee("李四", "市场部");
var emp3 = new Employee("王五");

emp1.Display();
emp2.Display();
emp3.Display();
\`\`\`

### 五、主构造函数（C# 12）⭐⭐

\`\`\`csharp
// 主构造函数：C# 12 引入的简洁语法
// 参数直接写在类名后面，编译器自动生成对应的属性

// 传统写法（旧）
class OldPerson
{
    public string Name { get; }
    public int Age { get; }

    public OldPerson(string name, int age)
    {
        Name = name;
        Age = age;
    }
}

// 主构造函数写法（C# 12，新）
// 语法：class 类名(参数列表) { 成员 }
class Person(string name, int age)
{
    // 主构造函数参数在整个类体中可用
    public string Name => name;  // 使用主构造函数参数
    public int Age => age;

    // 可以初始化其他属性
    public string DisplayName => $"{name} ({age}岁)";

    public void Introduce()
    {
        // 主构造函数参数在方法中也可用
        Console.WriteLine($"你好，我是 {name}，{age} 岁");
    }
}

var person = new Person("张三", 25);
person.Introduce();
Console.WriteLine($"显示名：{person.DisplayName}");

// 主构造函数 + 属性初始化
class Product(string name, decimal price, string category = "未分类")
{
    public string Name { get; set; } = name;     // 用主构造函数参数初始化
    public decimal Price { get; set; } = price;
    public string Category { get; set; } = category;

    public void Display()
    {
        Console.WriteLine($"{Name} - {Price:C} [{Category}]");
    }
}

var p1 = new Product("笔记本", 5999.99m);
var p2 = new Product("鼠标", 199.99m, "外设");
p1.Display();
p2.Display();
\`\`\`

### 六、静态构造函数

\`\`\`csharp
// 静态构造函数：在类第一次被使用前自动调用一次
// 无参、无访问修饰符、不能直接调用
// 用于初始化静态成员

class DatabaseConfig
{
    // 静态字段
    public static string ConnectionString;
    public static int MaxConnections;
    public static DateTime InitializedTime;

    // 静态构造函数
    // 无参、无访问修饰符，只执行一次
    static DatabaseConfig()
    {
        Console.WriteLine("静态构造函数被调用（只执行一次）");
        // 初始化静态成员（如从配置文件读取）
        ConnectionString = "Server=localhost;Database=MyDB;";
        MaxConnections = 100;
        InitializedTime = DateTime.Now;
    }

    // 实例构造函数
    public DatabaseConfig()
    {
        Console.WriteLine("实例构造函数被调用");
    }

    public static void DisplayConfig()
    {
        Console.WriteLine($"连接字符串：{ConnectionString}");
        Console.WriteLine($"最大连接数：{MaxConnections}");
        Console.WriteLine($"初始化时间：{InitializedTime}");
    }
}

// 第一次使用类时触发静态构造函数
Console.WriteLine("程序开始");
DatabaseConfig.DisplayConfig();  // 触发静态构造函数
Console.WriteLine("---");

var config1 = new DatabaseConfig();  // 触发实例构造函数
var config2 = new DatabaseConfig();  // 不再触发静态构造函数
\`\`\`

### 七、析构函数（Finalizer）

\`\`\`csharp
// 析构函数（终结器）：对象被 GC 回收前调用
// 语法：~类名() { }
// 不能有参数、不能有访问修饰符、不能手动调用
// ⚠️ 绝大多数情况下不需要写析构函数，用 IDisposable 代替

class ResourceHolder
{
    private string _resourceName;

    public ResourceHolder(string name)
    {
        _resourceName = name;
        Console.WriteLine($"资源 {_resourceName} 已分配");
    }

    // 析构函数
    ~ResourceHolder()
    {
        // 清理非托管资源（如文件句柄、数据库连接等）
        Console.WriteLine($"资源 {_resourceName} 被回收");
        // ⚠️ GC 调用的时机不确定，不要依赖析构函数
    }

    // 推荐方式：实现 IDisposable 接口
    public void Dispose()
    {
        Console.WriteLine($"资源 {_resourceName} 被主动释放");
        // 主动释放资源
        GC.SuppressFinalize(this);  // 告知 GC 不需要再调用析构函数
    }
}

// 使用 using 语句自动调用 Dispose
using (var resource = new ResourceHolder("文件句柄"))
{
    Console.WriteLine("使用资源...");
}  // 离开 using 块时自动调用 Dispose
Console.WriteLine("资源已释放");

// 析构函数 vs IDisposable
// 析构函数：GC 自动调用，时机不确定，仅用于兜底
// IDisposable：用户主动调用，时机确定，推荐方式
\`\`\`

### 八、小结

| 知识点 | 关键内容 |
| --- | --- |
| 默认构造函数 | 无参，编译器自动生成（如果没有其他构造函数） |
| 参数化构造函数 | 创建对象时初始化数据 |
| 构造函数重载 | 多个构造函数，不同参数 |
| this() 链式调用 | 一个构造函数调用另一个，减少重复 |
| 主构造函数 | C# 12，类名后直接写参数 |
| 静态构造函数 | 类首次使用前执行一次，初始化静态成员 |
| 析构函数 | GC 回收前调用，推荐用 IDisposable 代替 |

> 构造函数是对象初始化的关键。下一章我们学习静态成员与静态类。`,
  },

  // ============================================================
  // 第二十二章：静态成员与静态类
  // ============================================================
  {
    id: 'csharp3-ch22',
    group: '第五部分 面向对象基础',
    icon: '🧊',
    title: '第二十二章 静态成员与静态类',
    content: `## 第二十二章　静态成员与静态类

静态成员属于类本身，不属于任何实例。本章讲解静态字段、静态方法、静态属性、静态类、静态构造函数以及何时使用静态。

### 一、静态字段 ⭐

\`\`\`csharp
// 静态字段：属于类本身，所有实例共享同一个值
// 用 static 关键字修饰
// 通过 类名.字段名 访问

class Counter
{
    // 实例字段：每个对象有自己的副本
    public int InstanceId;

    // 静态字段：所有对象共享一个副本
    public static int TotalCount = 0;  // 静态字段初始化

    public Counter()
    {
        TotalCount++;           // 每次创建对象时，静态计数加 1
        InstanceId = TotalCount; // 给当前实例分配 ID
    }
}

// 通过类名访问静态字段（不需要创建对象）
Console.WriteLine($"初始计数：{Counter.TotalCount}");  // 0

var c1 = new Counter();  // TotalCount = 1
var c2 = new Counter();  // TotalCount = 2
var c3 = new Counter();  // TotalCount = 3

Console.WriteLine($"总创建数：{Counter.TotalCount}");  // 3
Console.WriteLine($"c1 的 ID：{c1.InstanceId}");       // 1
Console.WriteLine($"c2 的 ID：{c2.InstanceId}");       // 2
Console.WriteLine($"c3 的 ID：{c3.InstanceId}");       // 3

// 静态字段 vs 实例字段
// 实例字段：每个对象独立，通过 对象名.字段名 访问
// 静态字段：所有对象共享，通过 类名.字段名 访问
\`\`\`

### 二、静态方法 ⭐

\`\`\`csharp
// 静态方法：属于类本身，不依赖于任何实例
// 不能在静态方法中访问实例成员（this 不可用）

class MathHelper
{
    // 静态方法：通过类名调用
    public static int Add(int a, int b)
    {
        return a + b;
    }

    public static double Average(params double[] numbers)
    {
        if (numbers.Length == 0) return 0;
        double sum = 0;
        foreach (double n in numbers)
            sum += n;
        return sum / numbers.Length;
    }

    public static bool IsPrime(int number)
    {
        // 判断质数：不需要任何实例数据，适合作为静态方法
        if (number < 2) return false;
        for (int i = 2; i <= Math.Sqrt(number); i++)
        {
            if (number % i == 0) return false;
        }
        return true;
    }

    // 实例方法：需要对象实例
    private double _factor = 1.0;
    public void SetFactor(double factor)
    {
        _factor = factor;  // 访问实例字段
    }
}

// 通过类名直接调用静态方法（不需要创建对象）
Console.WriteLine($"Add(3, 5) = {MathHelper.Add(3, 5)}");  // 8
Console.WriteLine($"Average = {MathHelper.Average(85, 92, 78, 95)}");  // 87.5
Console.WriteLine($"7 是质数？{MathHelper.IsPrime(7)}");  // True

// 实例方法需要先创建对象
var helper = new MathHelper();
helper.SetFactor(2.0);  // 通过对象调用实例方法

// ⚠️ 静态方法不能访问实例成员
// 静态方法中不能使用 this 关键字
\`\`\`

### 三、静态属性

\`\`\`csharp
// 静态属性：属于类的属性，通过类名访问
// 常用于配置、全局状态、单例模式等

class AppConfig
{
    // 静态属性（自动属性）
    public static string AppName { get; set; } = "MyApp";
    public static string Version { get; set; } = "1.0.0";
    public static bool IsDebugMode { get; set; } = false;

    // 静态只读属性（计算属性）
    public static string AppInfo => $"{AppName} v{Version}";

    // 静态属性 + 私有 set
    public static int ActiveUsers { get; private set; } = 0;

    public static void UserLoggedIn()
    {
        ActiveUsers++;  // 静态方法修改静态属性
    }

    public static void Display()
    {
        Console.WriteLine($"应用：{AppInfo}");
        Console.WriteLine($"调试模式：{IsDebugMode}");
        Console.WriteLine($"在线用户：{ActiveUsers}");
    }
}

// 通过类名访问静态属性
Console.WriteLine($"应用名：{AppConfig.AppName}");
AppConfig.AppName = "新应用名";  // 修改静态属性
AppConfig.UserLoggedIn();
AppConfig.UserLoggedIn();
AppConfig.Display();

// 静态属性常用于：
// 1. 全局配置（AppConfig.ConnectionString）
// 2. 计数器（UserManager.TotalUsers）
// 3. 缓存（CacheManager.Instance）
// 4. 单例模式（Singleton.Instance）
\`\`\`

### 四、静态类 ⭐

\`\`\`csharp
// 静态类：所有成员都是静态的，不能实例化
// 用 static class 声明
// 适合工具类、扩展方法容器

// 静态类：工具方法集合
public static class StringUtils
{
    // 所有方法必须是静态的
    public static bool IsNullOrEmpty(string? value)
    {
        return string.IsNullOrEmpty(value);
    }

    public static string Truncate(string value, int maxLength)
    {
        // 截断字符串并添加省略号
        if (string.IsNullOrEmpty(value)) return value ?? "";
        return value.Length <= maxLength ? value : value[..maxLength] + "...";
    }

    public static string Reverse(string value)
    {
        // 反转字符串
        if (string.IsNullOrEmpty(value)) return value ?? "";
        char[] chars = value.ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }

    // 静态属性
    public static string DefaultEncoding { get; set; } = "UTF-8";
}

// 使用静态类（不需要创建对象）
Console.WriteLine(StringUtils.IsNullOrEmpty(""));      // True
Console.WriteLine(StringUtils.Truncate("Hello World", 8));  // Hello Wo...
Console.WriteLine(StringUtils.Reverse("C#编程"));       // 程编#C

// 常见的 .NET 静态类
// Math.Sqrt(), Math.PI, Math.Max()
// Console.WriteLine(), Console.ReadLine()
// File.ReadAllText(), File.WriteAllText()
// Path.Combine(), Path.GetExtension()

// var utils = new StringUtils();  // 编译错误！静态类不能实例化
\`\`\`

### 五、静态构造函数

\`\`\`csharp
// 静态构造函数：在类第一次被使用前自动调用一次
// 无参、无访问修饰符、不能手动调用

public static class DatabaseHelper
{
    // 静态字段
    public static string ConnectionString;
    public static int Timeout;

    // 静态构造函数：初始化静态成员
    static DatabaseHelper()
    {
        Console.WriteLine("DatabaseHelper 静态构造函数被调用");
        // 模拟从配置文件读取
        ConnectionString = "Server=localhost;Database=MyApp;";
        Timeout = 30;
    }

    public static void Connect()
    {
        Console.WriteLine($"连接数据库：{ConnectionString}（超时：{Timeout}秒）");
    }
}

// 第一次使用类时触发静态构造函数
Console.WriteLine("程序启动");
DatabaseHelper.Connect();  // 触发静态构造函数
DatabaseHelper.Connect();  // 不再触发

// 静态构造函数的执行时机：
// 1. 在创建第一个实例之前
// 2. 在引用任何静态成员之前
// 3. 只执行一次
// 4. 线程安全（CLR 保证只执行一次）
\`\`\`

### 六、Math 类实战 demo

\`\`\`csharp
// Math 类是 .NET 中最常用的静态类之一
// 无需创建对象，直接通过 Math.xxx 调用

Console.WriteLine("=== Math 静态类常用方法 ===");

// 常量
Console.WriteLine($"π = {Math.PI}");           // 3.14159265358979
Console.WriteLine($"e = {Math.E}");            // 2.71828182845905

// 舍入
Console.WriteLine($"Round(3.5) = {Math.Round(3.5)}");       // 4（银行家舍入）
Console.WriteLine($"Round(3.5, MidpointRounding.AwayFromZero) = {Math.Round(3.5, MidpointRounding.AwayFromZero)}"); // 4
Console.WriteLine($"Ceiling(3.1) = {Math.Ceiling(3.1)}");   // 4（向上取整）
Console.WriteLine($"Floor(3.9) = {Math.Floor(3.9)}");       // 3（向下取整）
Console.WriteLine($"Truncate(3.9) = {Math.Truncate(3.9)}"); // 3（截断小数）

// 最大最小值
Console.WriteLine($"Max(10, 20) = {Math.Max(10, 20)}");      // 20
Console.WriteLine($"Min(10, 20) = {Math.Min(10, 20)}");      // 10

// 幂运算
Console.WriteLine($"Pow(2, 10) = {Math.Pow(2, 10)}");        // 1024（2^10）
Console.WriteLine($"Sqrt(144) = {Math.Sqrt(144)}");          // 12（平方根）

// 绝对值
Console.WriteLine($"Abs(-42) = {Math.Abs(-42)}");            // 42

// 三角函数
double angle = Math.PI / 4;  // 45°
Console.WriteLine($"Sin(45°) = {Math.Sin(angle):F4}");       // 0.7071
Console.WriteLine($"Cos(45°) = {Math.Cos(angle):F4}");       // 0.7071

// 限制范围（Clamp）
Console.WriteLine($"Clamp(150, 0, 100) = {Math.Clamp(150, 0, 100)}");  // 100
Console.WriteLine($"Clamp(-10, 0, 100) = {Math.Clamp(-10, 0, 100)}");  // 0
\`\`\`

### 七、何时使用静态

\`\`\`csharp
// 静态 vs 实例：选择指南

// ✅ 适合用静态的场景：
// 1. 工具方法（Math、StringUtils）
// 2. 无状态的纯函数（输入确定，输出确定）
// 3. 全局配置、常量
// 4. 工厂方法（创建对象的静态方法）

// ❌ 不适合用静态的场景：
// 1. 需要维护状态（每个对象有不同数据）
// 2. 需要多态（子类重写行为）
// 3. 需要依赖注入（单元测试 mock）
// 4. 需要实现接口

// 静态方法示例：工厂方法
class User
{
    public string Name { get; set; }
    public string Role { get; set; }

    private User(string name, string role)
    {
        Name = name;
        Role = role;
    }

    // 静态工厂方法
    public static User CreateAdmin(string name)
        => new User(name, "管理员");

    public static User CreateMember(string name)
        => new User(name, "普通成员");

    public static User CreateGuest()
        => new User("游客", "访客");
}

var admin = User.CreateAdmin("张三");
var member = User.CreateMember("李四");
var guest = User.CreateGuest();
Console.WriteLine($"{admin.Name}：{admin.Role}");
Console.WriteLine($"{member.Name}：{member.Role}");
Console.WriteLine($"{guest.Name}：{guest.Role}");
\`\`\`

### 八、小结

| 知识点 | 关键内容 |
| --- | --- |
| 静态字段 | 所有实例共享，通过类名访问 |
| 静态方法 | 不依赖实例，不能访问 this |
| 静态属性 | 配置、计数器、单例 |
| 静态类 | 所有成员静态，不能实例化，工具类 |
| 静态构造函数 | 首次使用前执行一次 |
| 使用场景 | 工具方法、工厂、配置 |

> 静态成员是 C# 中重要的组织方式。下一章我们将学习面向对象的核心——继承。`,
  },

  // ============================================================
  // 第二十三章：继承
  // ============================================================
  {
    id: 'csharp3-ch23',
    group: '第五部分 面向对象基础',
    icon: '🧬',
    title: '第二十三章 继承',
    content: `## 第二十三章　继承

继承是面向对象编程的核心特性之一，允许子类复用父类的代码。本章讲解继承基础、base 关键字、方法隐藏、sealed 类、is/as 运算符和 object 基类。

### 一、继承基础 ⭐⭐

\`\`\`csharp
// 继承：子类（派生类）获得父类（基类）的所有非私有成员
// 语法：class 子类 : 父类
// C# 只支持单继承（一个类只能继承一个父类）

// 基类（父类）
class Animal
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Animal(string name, int age)
    {
        Name = name;
        Age = age;
    }

    public void Eat()
    {
        Console.WriteLine($"{Name} 正在吃东西");
    }

    public void Sleep()
    {
        Console.WriteLine($"{Name} 正在睡觉");
    }
}

// 派生类（子类）：继承 Animal
class Dog : Animal  // Dog 继承 Animal
{
    public string Breed { get; set; }  // 子类特有的属性

    // 子类构造函数：需要调用父类构造函数
    public Dog(string name, int age, string breed)
        : base(name, age)  // base() 调用父类构造函数
    {
        Breed = breed;
    }

    // 子类特有的方法
    public void Bark()
    {
        Console.WriteLine($"{Name}（{Breed}）汪汪叫！");
    }
}

// 另一个子类
class Cat : Animal
{
    public string Color { get; set; }

    public Cat(string name, int age, string color)
        : base(name, age)
    {
        Color = color;
    }

    public void Meow()
    {
        Console.WriteLine($"{Name}（{Color}色）喵喵叫！");
    }
}

// 使用继承
var dog = new Dog("旺财", 3, "金毛");
dog.Eat();    // 继承自 Animal 的方法
dog.Sleep();  // 继承自 Animal 的方法
dog.Bark();   // Dog 特有的方法

var cat = new Cat("小花", 2, "白");
cat.Eat();    // 继承自 Animal 的方法
cat.Meow();   // Cat 特有的方法

// 多态：用父类变量引用子类对象
Animal animal = new Dog("小黑", 1, "泰迪");
animal.Eat();  // 可以调用 Animal 的方法
// animal.Bark();  // 编译错误！Animal 类型没有 Bark 方法
\`\`\`

### 二、base 关键字 ⭐

\`\`\`csharp
// base：引用父类（基类）的成员
// 用于：调用父类构造函数、访问父类成员

class Vehicle
{
    public string Brand { get; set; }
    public int Year { get; set; }

    public Vehicle(string brand, int year)
    {
        Brand = brand;
        Year = year;
    }

    public virtual void DisplayInfo()
    {
        Console.WriteLine($"品牌：{Brand}，年份：{Year}");
    }
}

class Car : Vehicle
{
    public int Doors { get; set; }

    // 调用父类构造函数
    public Car(string brand, int year, int doors)
        : base(brand, year)  // base() 调用父类构造函数
    {
        Doors = doors;
    }

    public override void DisplayInfo()
    {
        // base.方法名 调用父类的方法
        base.DisplayInfo();  // 先调用父类的显示逻辑
        Console.WriteLine($"车门数：{Doors}");  // 再添加子类特有的信息
    }
}

var car = new Car("丰田", 2024, 4);
car.DisplayInfo();
// 输出：
// 品牌：丰田，年份：2024
// 车门数：4
\`\`\`

### 三、方法隐藏（new 关键字）

\`\`\`csharp
// 方法隐藏：子类用 new 关键字隐藏父类的同名方法
// 与 virtual/override 不同，new 是"切断"继承链

class Parent
{
    public void Show()
    {
        Console.WriteLine("父类的 Show 方法");
    }

    public virtual void Greet()
    {
        Console.WriteLine("父类的 Greet 方法");
    }
}

class Child : Parent
{
    // 方法隐藏：用 new 关键字
    // 如果不用 new，编译器会警告
    public new void Show()
    {
        Console.WriteLine("子类的 Show 方法（隐藏了父类）");
    }

    // 方法重写：用 override 关键字
    public override void Greet()
    {
        Console.WriteLine("子类的 Greet 方法（重写了父类）");
    }
}

// 隐藏 vs 重写的区别
Child child = new Child();
child.Show();   // 子类的 Show（隐藏）
child.Greet();  // 子类的 Greet（重写）

Parent parent = child;  // 用父类引用指向子类对象
parent.Show();  // 父类的 Show！隐藏方法根据引用类型决定调用哪个
parent.Greet(); // 子类的 Greet！重写方法根据实际对象类型决定调用哪个

// 结论：
// new（隐藏）：根据引用类型决定调用哪个方法
// override（重写）：根据实际对象类型决定调用哪个方法
// 绝大多数情况下，应该用 virtual/override 而不是 new
\`\`\`

### 四、sealed 类与方法

\`\`\`csharp
// sealed 类：不能被继承的类
// sealed 方法：不能被进一步重写的方法

// sealed 类：阻止继承
sealed class FinalClass
{
    public void DoSomething()
    {
        Console.WriteLine("FinalClass 的方法");
    }
}

// class Derived : FinalClass { }  // 编译错误！不能继承 sealed 类

// 正常类中的 sealed 方法
class BaseClass
{
    public virtual void Method1() { }
    public virtual void Method2() { }
}

class MiddleClass : BaseClass
{
    // sealed override：重写后阻止进一步重写
    public sealed override void Method1()
    {
        Console.WriteLine("MiddleClass 的 Method1（已加 sealed）");
    }

    public override void Method2()
    {
        Console.WriteLine("MiddleClass 的 Method2（可继续重写）");
    }
}

class FinalDerived : MiddleClass
{
    // public override void Method1() { }  // 编译错误！Method1 是 sealed

    public override void Method2()  // 可以重写 Method2
    {
        Console.WriteLine("FinalDerived 的 Method2");
    }
}

// 使用 sealed 的场景：
// 1. 不希望类被继承（如 String、Math 等）
// 2. 不希望某个虚方法被进一步重写
// 3. 安全考虑，防止意外扩展
\`\`\`

### 五、is 与 as 运算符 ⭐

\`\`\`csharp
// is：检查对象是否是某个类型，返回 bool
// as：尝试将对象转换为某个类型，失败返回 null

// 类型层次
class Animal { }
class Dog : Animal { public void Bark() => Console.WriteLine("汪汪！"); }
class Cat : Animal { public void Meow() => Console.WriteLine("喵喵！"); }

// 创建对象
Animal animal1 = new Dog();   // 用父类引用指向子类对象
Animal animal2 = new Cat();

// --- is 运算符 ---
// 检查类型 + 声明变量（C# 7+ 模式匹配）
if (animal1 is Dog dog)  // 检查 animal1 是否是 Dog 类型
{
    dog.Bark();  // 可以直接使用 dog 变量
    Console.WriteLine("animal1 是 Dog");
}

if (animal2 is Cat cat)
{
    cat.Meow();
    Console.WriteLine("animal2 是 Cat");
}

// 传统 is 用法（只返回 bool）
if (animal1 is Dog)
{
    Console.WriteLine("animal1 是 Dog");
}

// --- as 运算符 ---
// 尝试转换，失败返回 null
Dog? dog2 = animal1 as Dog;  // 转换成功，dog2 不为 null
if (dog2 != null)
{
    dog2.Bark();
}

Cat? cat2 = animal1 as Cat;  // 转换失败，cat2 为 null
Console.WriteLine($"animal1 是 Cat？{cat2 != null}");  // False

// is vs as 对比
// is：只检查类型，C# 7+ 可以同时声明变量
// as：同时转换类型，失败返回 null
// 推荐用 is 模式匹配（更简洁、更安全）
\`\`\`

### 六、继承链与 object 类

\`\`\`csharp
// 所有类最终都继承自 System.Object
// object 提供了所有类共有的基本方法：
// ToString(), Equals(), GetHashCode(), GetType()

class MyClass
{
    // 隐式继承自 object
}

// 继承链示例
class A { }
class B : A { }
class C : B { }

// 完整继承链：C → B → A → object

var obj = new C();

// object 类的方法
Console.WriteLine($"ToString：{obj.ToString()}");  // 默认返回类型名
Console.WriteLine($"GetType：{obj.GetType()}");    // 获取运行时类型
Console.WriteLine($"GetHashCode：{obj.GetHashCode()}");  // 哈希码

// 重写 ToString()
class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    // 重写 ToString() 提供有意义的字符串表示
    public override string ToString()
    {
        return $"Person(Name={Name}, Age={Age})";
    }

    // 重写 Equals() 提供值相等比较
    public override bool Equals(object? obj)
    {
        if (obj is Person other)
        {
            return Name == other.Name && Age == other.Age;
        }
        return false;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Name, Age);  // 组合哈希码
    }
}

var p1 = new Person { Name = "张三", Age = 25 };
var p2 = new Person { Name = "张三", Age = 25 };
Console.WriteLine(p1.ToString());  // Person(Name=张三, Age=25)
Console.WriteLine($"p1 == p2：{p1.Equals(p2)}");  // True（值相等）
\`\`\`

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| 继承语法 | class 子类 : 父类，单继承 |
| base 关键字 | 调用父类构造函数、访问父类成员 |
| 方法隐藏 | new 关键字，根据引用类型调用 |
| sealed | 阻止继承或进一步重写 |
| is 运算符 | 类型检查 + 模式匹配 |
| as 运算符 | 类型转换，失败返回 null |
| object 类 | 所有类的基类，ToString/Equals/GetHashCode |

> 继承是代码复用的强大工具。下一章我们学习多态——面向对象编程的精髓。`,
  },

  // ============================================================
  // 第二十四章：多态
  // ============================================================
  {
    id: 'csharp3-ch24',
    group: '第五部分 面向对象基础',
    icon: '🎭',
    title: '第二十四章 多态',
    content: `## 第二十四章　多态

多态（Polymorphism）是面向对象编程的三大特性之一，让同一个方法调用可以表现出不同的行为。本章讲解 virtual、override、多态实战、以及实际设计模式。

### 一、virtual 与 override ⭐⭐

\`\`\`csharp
// virtual：标记方法为"虚方法"，允许子类重写
// override：子类重写父类的虚方法
// 多态的核心：通过父类引用调用子类的方法

// 基类：定义虚方法
class Shape
{
    public string Name { get; set; }

    public Shape(string name)
    {
        Name = name;
    }

    // virtual：子类可以重写这个方法
    public virtual double CalculateArea()
    {
        // 基类提供默认实现
        Console.WriteLine("Shape.CalculateArea() — 基类实现");
        return 0;
    }

    public virtual void Draw()
    {
        Console.WriteLine($"绘制 {Name}");
    }
}

// 子类 1：圆形
class Circle : Shape
{
    public double Radius { get; set; }

    public Circle(string name, double radius) : base(name)
    {
        Radius = radius;
    }

    // override：重写父类的虚方法
    public override double CalculateArea()
    {
        // 圆面积 = π × r²
        return Math.PI * Radius * Radius;
    }

    public override void Draw()
    {
        Console.WriteLine($"绘制圆形 {Name}（半径：{Radius}）");
    }
}

// 子类 2：矩形
class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }

    public Rectangle(string name, double width, double height) : base(name)
    {
        Width = width;
        Height = height;
    }

    public override double CalculateArea()
    {
        // 矩形面积 = 宽 × 高
        return Width * Height;
    }

    public override void Draw()
    {
        Console.WriteLine($"绘制矩形 {Name}（{Width} × {Height}）");
    }
}

// 子类 3：三角形
class Triangle : Shape
{
    public double Base { get; set; }
    public double Height { get; set; }

    public Triangle(string name, double b, double h) : base(name)
    {
        Base = b;
        Height = h;
    }

    public override double CalculateArea()
    {
        // 三角形面积 = 底 × 高 / 2
        return Base * Height / 2;
    }

    public override void Draw()
    {
        Console.WriteLine($"绘制三角形 {Name}（底：{Base}，高：{Height}）");
    }
}
\`\`\`

### 二、多态实战 ⭐⭐

\`\`\`csharp
// 多态的核心价值：用父类引用操作不同的子类对象
// 同一个方法调用表现出不同的行为

// 创建不同类型的形状
Shape[] shapes = new Shape[]
{
    new Circle("圆形1", 5),           // 半径 5 的圆
    new Rectangle("矩形1", 4, 6),    // 4×6 的矩形
    new Triangle("三角形1", 3, 8),   // 底 3 高 8 的三角形
    new Circle("圆形2", 3),           // 半径 3 的圆
    new Rectangle("矩形2", 5, 5)     // 5×5 的正方形
};

// 多态：同一个方法调用，不同对象表现出不同行为
Console.WriteLine("=== 计算所有形状的面积 ===");
double totalArea = 0;
foreach (Shape shape in shapes)
{
    // shape 是 Shape 类型，但实际调用的是具体子类的方法
    double area = shape.CalculateArea();  // 多态调用！
    Console.WriteLine($"{shape.Name} 的面积：{area:F2}");
    totalArea += area;
}
Console.WriteLine($"总面积：{totalArea:F2}");

// 多态方法调用
Console.WriteLine("\\n=== 绘制所有形状 ===");
foreach (Shape shape in shapes)
{
    shape.Draw();  // 多态调用：不同的形状有不同的绘制方式
}

// 多态的本质：
// 编译时：根据声明类型（Shape）检查方法是否存在
// 运行时：根据实际类型（Circle/Rectangle/Triangle）决定调用哪个方法
\`\`\`

### 三、virtual vs 非 virtual

\`\`\`csharp
// 非虚方法（Non-virtual）：不能被子类重写
// 虚方法（Virtual）：可以被子类重写
// 关键区别：调用时的方法选择机制不同

class Base
{
    // 非虚方法：根据引用类型决定调用
    public void NonVirtualMethod()
    {
        Console.WriteLine("Base.NonVirtualMethod()");
    }

    // 虚方法：根据实际对象类型决定调用
    public virtual void VirtualMethod()
    {
        Console.WriteLine("Base.VirtualMethod()");
    }
}

class Derived : Base
{
    // 隐藏非虚方法（new）
    public new void NonVirtualMethod()
    {
        Console.WriteLine("Derived.NonVirtualMethod()");
    }

    // 重写虚方法（override）
    public override void VirtualMethod()
    {
        Console.WriteLine("Derived.VirtualMethod()");
    }
}

// 用父类引用指向子类对象
Base baseRef = new Derived();

// 非虚方法：调用 Base 的版本（根据引用类型）
baseRef.NonVirtualMethod();  // 输出：Base.NonVirtualMethod()

// 虚方法：调用 Derived 的版本（根据实际对象类型）
baseRef.VirtualMethod();     // 输出：Derived.VirtualMethod()

// 用子类引用
Derived derivedRef = new Derived();
derivedRef.NonVirtualMethod();  // 输出：Derived.NonVirtualMethod()
derivedRef.VirtualMethod();     // 输出：Derived.VirtualMethod()
\`\`\`

| 调用方式 | 非虚方法 (new) | 虚方法 (override) |
| --- | --- | --- |
| 父类引用 | 调用父类版本 | 调用子类版本 |
| 子类引用 | 调用子类版本 | 调用子类版本 |
| 多态行为 | 不支持 | 支持 |

### 四、何时使用 virtual

\`\`\`csharp
// virtual 的设计原则：
// 1. 方法的行为可能在子类中有所不同
// 2. 你希望子类能够定制或扩展该方法
// 3. 方法代表了"可扩展点"

// ✅ 适合用 virtual 的场景
class Document
{
    // 导出文档：不同文档格式有不同的导出方式
    public virtual void Export(string path)
    {
        Console.WriteLine($"导出文档到 {path}（默认格式）");
    }

    // 验证文档：不同文档有不同的验证规则
    public virtual bool Validate()
    {
        return true;  // 默认验证通过
    }

    // 获取文档大小：不同文档大小计算方式不同
    public virtual long GetSize()
    {
        return 0;
    }
}

class PdfDocument : Document
{
    public override void Export(string path)
    {
        Console.WriteLine($"导出 PDF 文档到 {path}（含页眉页脚）");
    }

    public override bool Validate()
    {
        // PDF 特有的验证逻辑
        Console.WriteLine("验证 PDF 格式...");
        return true;
    }

    public override long GetSize()
    {
        return 1024 * 100;  // 100KB
    }
}

class WordDocument : Document
{
    public override void Export(string path)
    {
        Console.WriteLine($"导出 Word 文档到 {path}（含样式）");
    }

    public override long GetSize()
    {
        return 1024 * 500;  // 500KB
    }
}

// 多态处理
void ProcessDocument(Document doc)
{
    if (doc.Validate())
    {
        doc.Export("/output/");
        Console.WriteLine($"文件大小：{doc.GetSize()} 字节");
    }
}

ProcessDocument(new PdfDocument());
ProcessDocument(new WordDocument());

// ❌ 不适合用 virtual 的场景
// 1. 方法行为固定，不会变化（如简单的 getter/setter）
// 2. 性能敏感的方法（虚方法调用有微小开销）
// 3. 构造函数（构造函数不能是 virtual）
\`\`\`

### 五、实际场景：支付系统

\`\`\`csharp
// 实际案例：支付系统，不同支付方式有不同的处理逻辑

// 支付基类
abstract class PaymentMethod
{
    public string MethodName { get; set; }

    protected PaymentMethod(string name)
    {
        MethodName = name;
    }

    // 虚方法：验证支付信息
    public virtual bool Validate(decimal amount)
    {
        if (amount <= 0)
        {
            Console.WriteLine("支付金额必须大于 0");
            return false;
        }
        return true;
    }

    // 虚方法：处理支付
    public virtual bool ProcessPayment(decimal amount)
    {
        Console.WriteLine($"使用 {MethodName} 支付 {amount:C}");
        return true;
    }

    // 虚方法：退款
    public virtual bool Refund(decimal amount, string transactionId)
    {
        Console.WriteLine($"通过 {MethodName} 退款 {amount:C}（交易号：{transactionId}）");
        return true;
    }
}

// 信用卡支付
class CreditCardPayment : PaymentMethod
{
    public string CardNumber { get; set; }

    public CreditCardPayment(string cardNumber)
        : base("信用卡")
    {
        CardNumber = MaskCardNumber(cardNumber);
    }

    public override bool Validate(decimal amount)
    {
        // 先调用基类验证
        if (!base.Validate(amount)) return false;

        // 信用卡特有验证：金额不能超过 50000
        if (amount > 50000)
        {
            Console.WriteLine("信用卡单笔支付不能超过 ¥50,000");
            return false;
        }
        return true;
    }

    public override bool ProcessPayment(decimal amount)
    {
        Console.WriteLine($"信用卡 {CardNumber} 支付 {amount:C}");
        Console.WriteLine("  调用银行接口...");
        Console.WriteLine("  支付成功！");
        return true;
    }

    private static string MaskCardNumber(string card)
    {
        // 信用卡号脱敏：只显示后 4 位
        return card.Length > 4 ? $"****{card[^4..]}" : card;
    }
}

// 微信支付
class WeChatPayment : PaymentMethod
{
    public string OpenId { get; set; }

    public WeChatPayment(string openId)
        : base("微信支付")
    {
        OpenId = openId;
    }

    public override bool ProcessPayment(decimal amount)
    {
        Console.WriteLine($"微信支付（用户：{OpenId}）支付 {amount:C}");
        Console.WriteLine("  调用微信支付接口...");
        Console.WriteLine("  支付成功！");
        return true;
    }

    public override bool Refund(decimal amount, string transactionId)
    {
        Console.WriteLine($"微信支付退款 {amount:C}");
        Console.WriteLine($"  原交易号：{transactionId}");
        Console.WriteLine("  退款处理中...");
        return true;
    }
}

// 支付宝支付
class AlipayPayment : PaymentMethod
{
    public AlipayPayment() : base("支付宝") { }

    public override bool ProcessPayment(decimal amount)
    {
        Console.WriteLine($"支付宝支付 {amount:C}");
        Console.WriteLine("  生成支付二维码...");
        Console.WriteLine("  等待用户扫码...");
        Console.WriteLine("  支付成功！");
        return true;
    }
}

// 支付处理器（多态的核心优势）
class PaymentProcessor
{
    public void ProcessOrder(PaymentMethod method, decimal amount)
    {
        Console.WriteLine($"\\n===== 处理订单 =====");

        // 验证
        if (!method.Validate(amount))
        {
            Console.WriteLine("支付验证失败，订单取消");
            return;
        }

        // 处理支付（多态调用）
        if (method.ProcessPayment(amount))
        {
            Console.WriteLine("订单支付成功！");
        }
        else
        {
            Console.WriteLine("支付失败，请重试");
        }
    }
}

// 使用支付系统
var processor = new PaymentProcessor();

// 不同支付方式，相同的处理逻辑
processor.ProcessOrder(new CreditCardPayment("1234567890123456"), 1500.00m);
processor.ProcessOrder(new WeChatPayment("wx_openid_12345"), 299.99m);
processor.ProcessOrder(new AlipayPayment(), 5999.00m);

// 信用卡超额测试
processor.ProcessOrder(new CreditCardPayment("1234567890123456"), 60000.00m);
\`\`\`

### 六、小结

| 知识点 | 关键内容 |
| --- | --- |
| virtual | 标记方法为虚方法，允许子类重写 |
| override | 子类重写父类虚方法 |
| 多态原理 | 编译时检查，运行时决定调用 |
| virtual vs 非 virtual | 虚方法根据对象类型调用，非虚根据引用类型 |
| 设计原则 | 可扩展点用 virtual，固定行为不用 |
| 实际场景 | 支付系统、文档处理、图形绘制 |

> 多态是面向对象编程的精髓，让代码更灵活、更易扩展。至此，你已经完成了第五部分的学习，掌握了面向对象编程的核心概念。`,
  },
];

export { chapters };