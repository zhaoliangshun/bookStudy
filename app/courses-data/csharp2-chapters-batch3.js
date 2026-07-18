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
// 重要：C# 顶级语句中，类型声明（class/struct/interface/record/enum/delegate）
//       必须放在所有可执行代码之后，否则编译报错 CS8803。
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
// ==============================================
// C# 顶级语句规则：
// 1. using 指令 → 可执行代码 → 类型声明（class/struct/enum等）
// 2. 类型声明必须放在所有可执行语句之后，否则 CS8803 编译错误
// ==============================================

// ---------- 可执行代码（顶级语句）----------
// 没有类之前：用一堆散变量描述一个学生
string name1 = "张三"; int age1 = 20; double score1 = 85.5;
string name2 = "李四"; int age2 = 21; double score2 = 92.0;
// 10 个学生就要 30 个变量，根本管不过来
Console.WriteLine("=== 没有类的散变量写法（不推荐）===");
Console.WriteLine($"{name1} {age1}岁 成绩{score1}");

// 有了类之后：一个变量装所有信息
var s1 = new Student { Name = "张三", Age = 20, Score = 85.5 };
var s2 = new Student { Name = "李四", Age = 21, Score = 92.0 };
Console.WriteLine("\\n=== 用类封装后（推荐）===");
Console.WriteLine($"{s1.Name} {s1.Age}岁 成绩{s1.Score}");
Console.WriteLine($"{s2.Name} {s2.Age}岁 成绩{s2.Score}");

// ---------- 类型声明（放在执行代码之后！）----------
// 为什么用 class？把数据（Name/Age/Score）和行为打包在一起，形成自定义类型
// public：访问修饰符，表示公开，外部可以访问
class Student {
    public string Name;   // 字段：存姓名数据，public 表示外部可读可写
    public int Age;       // 字段：存年龄
    public double Score;  // 字段：存成绩
}
\`\`\`

> 类是**图纸**，对象是按图纸造出来的**实物**。一张图纸可以造无数个对象。

### 二、定义类 ⭐

\`\`\`csharp
// ---------- 可执行代码（顶级语句）----------
// 使用类创建对象
var dog = new Dog();
dog.Name = "旺财";  // 给字段赋值
dog.Age = 3;
dog.Bark();         // 调用方法：旺财 汪汪叫！

// ---------- 类型声明（放在执行代码之后）----------
// 最简单的类：包含字段（数据）和方法（行为）
class Dog {
    // 字段（field）：类的成员变量，用于存储对象的数据/状态
    // public：公开访问，任何地方都能读写
    public string Name;  // 狗的名字
    public int Age;      // 狗的年龄

    // 方法（method）：类的成员函数，定义对象能执行的行为
    // public void Bark()：void 表示无返回值
    public void Bark() {
        // 方法内部可以直接访问同类的字段（Name）
        Console.WriteLine($"{Name} 汪汪叫！");
    }
}
\`\`\`

类成员分两类：

- **字段（field）**：存数据，类似变量。
- **方法（method）**：定义行为，类似函数。
- 还有属性、构造函数、事件等，后续章节细讲。

> ⭐ 类名用 **PascalCase**（首字母大写），如 \`Student\`、\`OrderService\`。字段、方法同理。

### 三、创建对象：new 关键字 ⭐

\`new\` 按类图纸在堆上创建对象，返回引用：

\`\`\`csharp
// ---------- 可执行代码（顶级语句）----------
// 1. new + 对象初始化器（最常用）：创建同时给字段赋值
var p1 = new Point { X = 3.0, Y = 4.0 };

// 2. new 后逐个赋值
var p2 = new Point();
p2.X = 1.0;
p2.Y = 2.0;

// 3. 显式类型声明（不常用 var）
Point p3 = new Point { X = 5, Y = 5 };

// 4. C# 9+ 目标类型 new：左边已声明类型，右边可省略类名
Point p4 = new();

Console.WriteLine($"p1=({p1.X},{p1.Y})");
Console.WriteLine($"p4=({p4.X},{p4.Y})");  // 字段默认值 0,0

// ---------- 类型声明 ----------
class Point {
    public double X;  // x坐标，默认值 0.0
    public double Y;  // y坐标，默认值 0.0
}
\`\`\`

> ⭐ \`var p = new Student();\` 是日常最常用写法。\`Point p4 = new();\` 在已知类型时更简洁。

### 四、成员默认值

字段不显式赋值时，C# 给默认值：

\`\`\`csharp
// ---------- 可执行代码 ----------
var d = new Defaults();
Console.WriteLine($"int: {d.Count}");           // 0（值类型默认）
Console.WriteLine($"double: {d.Price}");        // 0
Console.WriteLine($"bool: {d.IsActive}");       // False
Console.WriteLine($"string: {d.Name}");         // 空（实际是 null，引用类型默认）
Console.WriteLine($"DateTime: {d.Created:yyyy-MM-dd}");  // 0001-01-01

// ---------- 类型声明 ----------
class Defaults {
    public int Count;          // int 默认 0
    public double Price;       // double 默认 0.0
    public bool IsActive;      // bool 默认 false
    public string Name;        // string 默认 null ⚠️ 引用类型！
    public DateTime Created;   // DateTime 默认 0001-01-01
}
\`\`\`

> ⚠️ **引用类型（string、对象）默认是 \`null\`**，访问其成员会抛 \`NullReferenceException\`。后续章节讲可空引用类型解决这问题。

### 五、字段 vs 属性（先建立概念）

这章先用**字段**讲类，下一章细讲属性。先看个对比例子：

\`\`\`csharp
// ---------- 可执行代码 ----------
var p1 = new PersonBad { Age = -100 };  // 居然能成功！不合法数据直接进来了
var p2 = new PersonGood { Age = -100 }; // 也能成功，但属性可以在 set 里加校验挡住
Console.WriteLine($"Bad（直接字段暴露）: {p1.Age}");
Console.WriteLine($"Good（属性封装）: {p2.Age}");
// 为什么属性更好？字段像「直接打开冰箱拿东西」，外部随便改
// 属性像「通过售货员拿东西，可以加规则校验」，能挡住非法数据

// ---------- 类型声明 ----------
class PersonBad {
    // 字段直接 public：外部可随意读写，无法校验
    public int Age;
}

class PersonGood {
    // 自动属性：{ get; set; } 编译器自动生成后备字段
    // get：读访问器；set：写访问器
    // 属性本质是方法（get_Age/set_Age），看起来像字段，用起来像字段
    public int Age { get; set; }
}
\`\`\`

字段像「直接打开冰箱拿东西」，属性像「通过售货员拿东西，可以加规则」。**实战中 99% 用属性**，字段只在私有内部状态用。

### 六、方法

方法是类里的函数，描述「这个对象能做什么」：

\`\`\`csharp
// ---------- 可执行代码 ----------
var calc = new Calculator();
Console.WriteLine($"1+2 = {calc.Add(1, 2)}");
Console.WriteLine($"3*2 = {calc.Multiply(3)}");     // b 用默认值 2
Console.WriteLine($"3*4 = {calc.Multiply(3, 4)}");  // 覆盖默认值，传 4

// ---------- 类型声明 ----------
class Calculator {
    // 实例方法：需要先 new 对象，通过对象调用
    // 能访问实例的字段/属性
    public int Add(int a, int b) {
        return a + b;  // return 返回计算结果
    }

    // 带默认参数的方法：调用时不传就用默认值
    // int b = 2：参数 b 默认值是 2
    public int Multiply(int a, int b = 2) {
        return a * b;
    }
}
\`\`\`

### 七、this 关键字 ⭐

\`this\` 指向**当前对象自己**。参数和字段同名时必须用 \`this\` 区分：

\`\`\`csharp
// ---------- 可执行代码 ----------
var u = new User();
u.SetInfo("张三", "z*@***********");
u.Print();

// ---------- 类型声明 ----------
class User {
    public string Name;   // 字段：Name
    public string Email;  // 字段：Email

    // 为什么参数名和字段同名？
    // 这是 C# 好习惯：参数名清晰表达意图（一看就知道传 name/email）
    // 重名时用 this. 区分：this.Name 是字段，Name 是参数
    public void SetInfo(string Name, string Email) {
        this.Name = Name;      // this.Name 指当前对象的字段，= Name 是把参数值赋给字段
        this.Email = Email;
    }

    // this 还能调用本类其他方法
    public void Print() {
        Console.WriteLine($"{this.Name} <{this.Email}>");
        this.Log("打印完成");  // this. 可省略，写出来表达"调用本类的方法"
    }

    // private：私有访问修饰符，只有本类内部能调用，外部看不到
    // 为什么 Log 设 private？因为这是内部实现细节，不需要暴露给外部
    private void Log(string msg) {
        Console.WriteLine($"[LOG] {msg}");
    }
}
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
// ---------- 可执行代码 ----------
var acc = new BankAccount("张三", 1000m);
Console.WriteLine($"户主：{acc.Owner}");
Console.WriteLine($"余额：{acc.GetBalance()}");
// Console.WriteLine(acc.balance);  // ❌ 编译错误：balance 是 private，外部访问不到
acc.Deposit(500);  // 通过公开方法存钱，内部会校验
acc.Deposit(-100); // 非法金额，方法内部挡住了

// ---------- 类型声明 ----------
// 为什么需要访问修饰符？封装！隐藏内部实现细节，只暴露必要的接口
// 防止外部直接改内部状态导致数据不一致
class BankAccount {
    public string Owner;           // public：公开，外部可读可写（户主名字允许改）
    private decimal balance;       // private：私有！只有本类能直接访问余额
                                   // 为什么余额要 private？防止外部直接改成负数
    protected string Currency;     // protected：本类和未来的子类（如 SavingsAccount）能访问

    // 构造函数：创建对象时自动调用，用于初始化对象状态
    // 下一章细讲构造函数
    public BankAccount(string owner, decimal initial) {
        Owner = owner;
        balance = initial;  // 构造函数内部能访问 private 字段
        Currency = "CNY";
    }

    // public 方法：提供受控的访问入口（"只读"余额）
    // 为什么不直接 public balance？因为你只想让外部看，不想让外部直接改
    public decimal GetBalance() => balance;  // 表达式体方法，=> 后面直接返回

    // public 方法：存钱，内部做校验
    public void Deposit(decimal amount) {
        if (amount <= 0) {
            Console.WriteLine("存款必须为正");
            return;  // 非法金额，直接返回不执行
        }
        balance += amount;  // 内部才能改 balance，因为方法在类里面
        Console.WriteLine($"{Owner} 存入 {amount}，余额 {balance}");
    }
}
\`\`\`

> ⭐ **默认就是 private**（不写修饰符时）。实战经验：字段一律 private，通过公开方法/属性暴露。

### 九、实战 demo：简易图书管理

\`\`\`csharp
// ---------- 可执行代码 ----------
var book = new Book {
    Title = "C# 从入门到精通",
    Author = "微软",
    Price = 89.9m,
    Stock = 10
};

book.Display();
book.TryBuy(3);    // 正常购买
book.TryBuy(20);   // 库存不足
book.TryBuy(-1);   // 参数非法
book.Display();

// ---------- 类型声明 ----------
class Book {
    // 公开字段（这个 demo 先用字段，下一章会改成属性）
    public string Title;   // 书名
    public string Author;  // 作者
    public decimal Price;  // 价格
    public int Stock;      // 库存

    // 显示图书信息
    public void Display() {
        Console.WriteLine($"《{Title}》- {Author} | ￥{Price:F2} | 库存{Stock}");
    }

    // 尝试购买：返回 bool 表示成功/失败
    // 为什么要返回 bool？让调用方知道操作结果，做后续处理
    public bool TryBuy(int qty) {
        if (qty <= 0) {
            Console.WriteLine("数量必须为正");
            return false;  // 失败返回 false
        }
        if (qty > Stock) {
            Console.WriteLine($"库存不足，仅剩 {Stock} 本");
            return false;
        }
        Stock -= qty;  // 扣减库存
        Console.WriteLine($"成功购买 {qty} 本，花费 ￥{Price * qty:F2}");
        return true;   // 成功返回 true
    }
}
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
// ---------- 可执行代码 ----------
var t = new Temperature("S001", 25.5);
t.Show();

// ---------- 类型声明 ----------
class Temperature {
    // 私有字段：用 _camelCase 前缀，C# 约定俗成
    // 为什么字段要 private？封装！内部状态不外露，外部只能通过公开方法/属性访问
    private double _celsius;

    // const 常量字段：编译期就确定值，不能改
    // 为什么用 const？魔法数字直接写死在代码里难维护，定义成常量有名字有含义
    private const double AbsoluteZero = -273.15;

    // readonly 只读字段：构造函数里赋值后，后面就不能改了
    // 和 const 区别：const 编译期定，readonly 运行时构造时定
    private readonly string _sensorId;

    // 构造函数：创建对象时初始化 readonly 字段
    public Temperature(string sensorId, double initialCelsius) {
        _sensorId = sensorId;   // readonly 字段只能在构造里赋值
        _celsius = initialCelsius;
    }

    public void Show() {
        // 方法内部能访问私有字段
        Console.WriteLine($"传感器 {_sensorId}：{_celsius}°C（绝对零度 {AbsoluteZero}°C）");
    }
}
\`\`\`

> ⭐ 字段命名：私有用 \`_camelCase\`，公开（少用）用 \`PascalCase\`。\`const\` 编译期常量，\`readonly\` 运行时常量（构造后不可变）。

### 二、属性：受控访问 ⭐

属性是「看起来像字段，本质是方法」的成员。基础语法：

\`\`\`csharp
// ---------- 可执行代码 ----------
var p = new Product();
p.Name = "鼠标";
p.Price = 99.9m;
Console.WriteLine($"{p.Name}：￥{p.Price}");

// p.Name = "";  // ❌ 抛异常：名称不能为空，set 里的校验挡住了
p.Price = -10;   // 触发校验逻辑，自动修正为 0
Console.WriteLine($"修正后价格：{p.Price}");

// ---------- 类型声明 ----------
class Product {
    private string _name;  // 后备字段（backing field）：属性真正存数据的地方
                           // 为什么要后备字段？因为 get/set 需要一个地方存值

    // 完整属性：手写 get 和 set，能加自定义逻辑
    public string Name {
        get {
            // get 访问器：读属性时执行，返回 _name
            return _name;
        }
        set {
            // set 访问器：写属性时执行
            // value 是 C# 关键字，代表外部传入的值（隐式参数）
            if (string.IsNullOrEmpty(value))
                throw new ArgumentException("名称不能为空");  // 校验不通过抛异常
            _name = value;  // 校验通过才赋值给后备字段
        }
    }

    // 价格字段，带另一种校验逻辑（不抛异常，自动修正）
    private decimal _price;

    public decimal Price {
        get => _price;  // 表达式体 get：=> 直接返回，简洁
        set {
            if (value < 0) {
                Console.WriteLine("价格不能为负，已设为 0");
                _price = 0;       // 非法值给个默认值
            } else {
                _price = value;   // 合法值正常赋值
            }
        }
    }
}
\`\`\`

> ⭐ \`value\` 是 set 访问器的隐式参数，代表外部传入的值。属性的核心价值：**在 set 里加校验，挡住非法数据**。

### 三、自动属性 ⭐⭐

写完整属性太啰嗦。如果不需要校验，用**自动属性**让编译器自动生成后备字段：

\`\`\`csharp
// ---------- 可执行代码 ----------
var u = new User("张三");
Console.WriteLine($"{u.Name} 创建于 {u.CreatedAt:yyyy-MM-dd HH:mm}");
// u.CreatedAt = DateTime.Now;  // ❌ 编译错误：set 是 private，外部不能改

// ---------- 类型声明 ----------
class User {
    // 自动属性：{ get; set; }
    // 编译器自动在背后生成一个私有后备字段，不用你手写
    // 为什么日常用自动属性？① 简洁 ② 以后要加校验时，改成完整属性不影响外部调用代码
    public string Name { get; set; }

    // 只读自动属性：set 前面加 private
    // 意思是：外部能 get（读），但只有本类内部能 set（写）
    // 为什么这么做？CreatedAt 创建时间设了就不该改，防止外部误改
    public DateTime CreatedAt { get; private set; }

    // 构造函数：内部能调用 private set
    public User(string name) {
        Name = name;
        CreatedAt = DateTime.Now;  // 构造函数在类内部，能访问 private set
    }
}
\`\`\`

> ⭐⭐ **日常开发 80% 用自动属性**——简洁、安全、可后期升级成完整属性而不破坏调用方。

### 四、init 只读属性（C# 9+）⭐

\`init\` 关键字：属性只能在**对象初始化时**赋值，之后不可改。介于 \`set\`（任意时刻可改）和 \`private set\`（仅本类可改）之间：

\`\`\`csharp
// ---------- 可执行代码 ----------
// init 属性只能在 new { ... } 对象初始化器里赋值
var order = new Order { Id = 1001, Customer = "李四", Total = 250m };
order.Show();

// order.Id = 1002;  // ❌ 编译错误：init-only 属性只能在初始化时赋值，之后改不了
// 为什么用 init？创建不可变对象——数据一旦设好就不能被意外修改，更安全

// ---------- 类型声明 ----------
class Order {
    // { get; init; }：只能初始化时赋值，之后只读
    // 和 private set 区别：private set 类内部方法还能改；init 连类内部过了构造都改不了
    public int Id { get; init; }
    public string Customer { get; init; }
    public decimal Total { get; init; }

    public void Show() => Console.WriteLine($"订单 #{Id}：{Customer} ￥{Total}");
}
\`\`\`

> ⭐ \`init\` 适合**不可变数据对象**——DTO、配置、值对象。配合对象初始化器写法清爽，又保证了不可变性。

### 五、required 必填属性（C# 11+）⭐

\`required\` 强制调用方在初始化时必须赋值，否则编译报错：

\`\`\`csharp
// ---------- 可执行代码 ----------
// ✅ 正确：必填属性 Username 和 Email 都赋值了
var acc = new Account { Username = "zhangsan", Email = "z*@*.com" };
Console.WriteLine($"{acc.Username} / {acc.Email} / {acc.Nickname ?? "无昵称"}");

// ❌ 编译错误：少了 Email，required 强制必须赋值
// var bad = new Account { Username = "zhangsan" };

// ❌ 编译错误：required 属性必须用初始化器赋值，不能先 new() 再单独设
// var bad2 = new Account();
// bad2.Username = "zhangsan";  // 这也不行，必须在初始化器里

// ---------- 类型声明 ----------
class Account {
    // required：强制调用方创建对象时必须给这个属性赋值
    // 为什么需要 required？防止忘记给关键字段赋值，编译期就检查出来，不用等运行时 NullReferenceException
    public required string Username { get; set; }
    public required string Email { get; set; }

    // string?：可空引用类型，表示 Nickname 可以是 null（可选字段）
    public string? Nickname { get; set; }
}
\`\`\`

> ⭐ \`required\` 解决了「对象创建后才发现忘了设关键字段」的痛点，编译期就拦截。

### 六、表达式体属性

属性只有一行时，用 \`=>\` 简写：

\`\`\`csharp
// ---------- 可执行代码 ----------
var r = new Rectangle { Width = 4, Height = 5 };
Console.WriteLine($"面积：{r.Area}");          // 计算属性：4*5=20
Console.WriteLine($"是正方形：{r.IsSquare}");  // 4≠5，False

// ---------- 类型声明 ----------
class Rectangle {
    // 普通自动属性：存数据
    public double Width { get; set; }
    public double Height { get; set; }

    // 只读计算属性：用 => 表达式体
    // 为什么是计算属性？Area 不存数据，每次访问时根据 Width*Height 现算
    // 好处：Width/Height 改了，Area 自动跟着变，不会有数据不一致
    public double Area => Width * Height;

    public bool IsSquare => Width == Height;  // 宽高相等就是正方形
}
\`\`\`

> 计算属性（不存数据，根据其他属性算出来）用 \`=>\` 写最简洁。

### 七、方法重载 ⭐

同名方法，参数列表不同（个数/类型/顺序），让调用方根据数据自动选合适版本：

\`\`\`csharp
// ---------- 可执行代码 ----------
var p = new Printer();
p.Print("hello");         // 编译器根据参数类型选重载 1（string版本）
p.Print(42);              // 选重载 2（int版本）
p.Print("分数", 95);      // 选重载 3（两个参数版本）
p.Print("hi", 3);         // ⚠️ 注意这里有歧义！可选参数让编译器可能选错重载

// ---------- 类型声明 ----------
class Printer {
    // 重载 1：接收 string 参数
    // 方法重载规则：方法名相同，参数列表不同（类型/个数/顺序不同）
    public void Print(string s) {
        Console.WriteLine($"[文本] {s}");
    }

    // 重载 2：接收 int 参数
    public void Print(int n) {
        Console.WriteLine($"[数字] {n}");
    }

    // 重载 3：接收两个参数
    public void Print(string label, int value) {
        Console.WriteLine($"[{label}] {value}");
    }

    // 重载 4：带可选参数（times 默认 1）
    // ⚠️ 小心：可选参数容易和其他重载产生歧义，编译器按"最近匹配"选，结果可能不是你想要的
    public void Print(string s, int times = 1) {
        for (int i = 0; i < times; i++) {
            Console.WriteLine($"[重复] {s}");
        }
    }
}
\`\`\`

> ⭐ 方法重载让 API 简洁——一个 \`Print\` 名字搞定多种输入。但**可选参数 + 重载容易产生歧义**，避免同时用。

### 八、静态方法 vs 实例方法 ⭐

- **实例方法**：通过对象调用，能访问实例字段。
- **静态方法**：通过类名调用，**不能访问实例成员**，只访问静态成员。

\`\`\`csharp
// ---------- 可执行代码 ----------
// 静态方法：直接用 类名.方法名() 调用，不需要 new 对象
// 为什么？因为静态方法不依赖对象状态，不需要创建对象就能用
Console.WriteLine($"3 的平方：{MathHelper.Square(3)}");
Console.WriteLine($"max(5,8)：{MathHelper.Max(5, 8)}");

// 实例方法：必须先 new 出对象，再用 对象.方法名()
var helper = new MathHelper { Formatter = "P1" };  // P1 = 百分比格式，1位小数
Console.WriteLine($"格式化：{helper.Format(0.856)}");  // 85.6%
// 为什么 Format 是实例？因为它依赖 Formatter 这个实例状态，不同对象 Formatter 可能不同

// ---------- 类型声明 ----------
class MathHelper {
    // static 关键字：静态成员属于类本身，所有对象共享同一份
    // 为什么 Square/Max 设成 static？它们只是纯计算，不依赖任何对象状态
    public static double Square(double x) => x * x;
    public static int Max(int a, int b) => a > b ? a : b;

    // 实例属性：每个对象有自己的 Formatter 值
    public string Formatter { get; set; } = "F2";  // 默认 F2（2位小数）

    // 实例方法：依赖 Formatter 这个实例属性
    public string Format(double value) {
        return value.ToString(Formatter);
    }
}
\`\`\`

> ⭐ 判断标准：**方法是否依赖对象状态**。\`Math.Sqrt\` 不依赖任何对象，静态；\`student.GetGPA()\` 依赖具体学生，实例。

### 九、实战 demo：商品库存系统

\`\`\`csharp
// ---------- 可执行代码 ----------
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

// ---------- 类型声明 ----------
class Product {
    // 私有字段：真正存库存数据的地方
    private int _stock;

    // required + init：必填，且创建后 Sku/Name 不能改（商品编码/名称不会变）
    public required string Sku { get; init; }
    public required string Name { get; init; }

    // 自动属性：价格可改
    public decimal Price { get; set; }

    // 计算属性：库存价值 = 单价 * 库存，每次访问现算
    public decimal StockValue => Price * _stock;

    // init 访问器：库存只能初始化时设，之后只能通过 Restock/Sell 方法改
    // 为什么这样？防止外部直接把库存改成负数，必须走业务方法
    public int Stock {
        get => _stock;
        init => _stock = value >= 0
            ? value
            : throw new ArgumentException("库存不能为负");  // 初始化时也要校验
    }

    // 方法重载：补货（单参数版本）
    public void Restock(int qty) {
        if (qty <= 0) {
            Console.WriteLine("补货数量必须为正");
            return;
        }
        _stock += qty;
        Console.WriteLine($"{Name} 补货 {qty}，当前库存 {_stock}");
    }

    // 重载：带备注的补货
    public void Restock(int qty, string note) {
        Restock(qty);  // 复用上面的逻辑，不重复写代码
        Console.WriteLine($"  备注：{note}");
    }

    // 卖出：返回 bool 表示是否成功
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
// ---------- 可执行代码 ----------
// 因为 Point 没写构造函数，编译器自动给了一个无参构造
var p = new Point();
Console.WriteLine($"({p.X}, {p.Y})");  // (0, 0) 值类型默认值

// ---------- 类型声明 ----------
class Point {
    public double X;
    public double Y;
    // 编译器偷偷加了：public Point() { } （默认无参构造）
}
\`\`\`

**一旦你写了任何构造函数，默认构造函数就消失了**：

\`\`\`csharp
// ---------- 可执行代码 ----------
var p1 = new Point(3, 4);   // ✅ 调用我们写的带参构造
// var p2 = new Point();    // ❌ 编译错误：我们写了带参构造，默认无参构造没了
Console.WriteLine($"p1=({p1.X}, {p1.Y})");

// ---------- 类型声明 ----------
class Point {
    public double X;
    public double Y;

    // 自定义带参构造函数
    // 构造函数特点：① 方法名和类名一样 ② 没有返回类型（连 void 都不写）
    public Point(double x, double y) {
        X = x;
        Y = y;
    }
    // 写了这个之后，编译器就不再自动生成无参构造了
    // 如果还想保留无参构造，必须自己显式写一个 public Point() { }
}
\`\`\`

> ⭐ 想保留无参构造，必须显式写出来。这是常见陷阱。

### 二、带参构造函数 ⭐

构造函数名和类名相同，无返回类型，参数用于接收初始化数据：

\`\`\`csharp
// ---------- 可执行代码 ----------
var u = new User("张三", "z*@***********");
Console.WriteLine($"{u.Name} <{u.Email}> 创建于 {u.CreatedAt:yyyy-MM-dd}");
// var bad = new User();  // ❌ 必须传 name 和 email 参数，不然创建不了
// 构造函数的核心意义：保证对象一创建出来就是合法状态，不会有"忘记设必填字段"的问题

// ---------- 类型声明 ----------
class User {
    // { get; } 只读属性：构造时赋值后，外部和内部都不能改了
    public string Name { get; }
    public string Email { get; }
    public DateTime CreatedAt { get; }

    // 带参构造：强制调用方创建对象时必须提供必要信息
    // 为什么用构造函数而不是对象初始化器？
    // 因为初始化器可以漏赋值，构造函数是"强制性"的——不传参编译都过不去
    public User(string name, string email) {
        // 构造里也能加校验！不合法直接抛异常，根本不让对象创建出来
        if (string.IsNullOrEmpty(name))
            throw new ArgumentException("名称不能为空");
        if (string.IsNullOrEmpty(email))
            throw new ArgumentException("邮箱不能为空");

        Name = name;
        Email = email;
        CreatedAt = DateTime.Now;  // 创建时间自动设为当前时间，不用外部传
    }
}
\`\`\`

> ⭐ 构造函数的核心价值：**保证对象一创建就处于合法状态**。把校验放构造函数里，避免「创建后忘记设置」的 bug。

### 三、构造函数重载 ⭐

像方法一样，构造函数也能重载，提供多种初始化方式：

\`\`\`csharp
// ---------- 可执行代码 ----------
var o1 = new Order(1001, "张三", 250m, "加急");   // 传全部参数
var o2 = new Order(1002, "李四", 180m);           // 省略备注
var o3 = new Order(1003, "王五");                 // 用默认金额 0
Console.WriteLine($"{o1.OrderId} {o1.Customer} ￥{o1.Amount} 备注:{o1.Note ?? "无"}");
Console.WriteLine($"{o2.OrderId} {o2.Customer} ￥{o2.Amount}");
Console.WriteLine($"{o3.OrderId} {o3.Customer} ￥{o3.Amount}");

// ---------- 类型声明 ----------
class Order {
    public int OrderId { get; }
    public string Customer { get; }
    public decimal Amount { get; }
    public string? Note { get; }  // string? 备注可选，可以 null

    // 主构造函数：参数最全，包含所有初始化逻辑
    public Order(int id, string customer, decimal amount, string? note) {
        OrderId = id;
        Customer = customer;
        Amount = amount;
        Note = note;
    }

    // 重载 2：省略备注，用 : this(...) 链式调用主构造
    // : this(...) 叫构造函数初始化器，在执行当前构造体之前，先调用另一个构造
    // 为什么用链式调用？避免重复写赋值逻辑，代码不重复
    public Order(int id, string customer, decimal amount)
        : this(id, customer, amount, null) { }  // 把 note 传 null，复用主构造逻辑

    // 重载 3：只给 id 和 customer，金额默认 0
    public Order(int id, string customer)
        : this(id, customer, 0, null) { }  // 继续链式调用
}
\`\`\`

> ⭐ 重载构造函数时，**用 \`: this(...)\` 链式调用**避免重复代码。把主逻辑放在参数最全的那个构造里。

### 四、this() 链式调用 ⭐

\`this(...)\` 在构造函数初始化器里调用本类其他构造函数：

\`\`\`csharp
// ---------- 可执行代码 ----------
var l1 = new Logger("file.log", LogLevel.Error);  // 指定文件和级别
var l2 = new Logger("console");                     // 只指定目标，级别默认 Info
var l3 = new Logger();                              // 全默认
// 注意输出顺序：链式调用先执行主构造，再执行当前构造体

// ---------- 类型声明（放在执行代码之后）----------
class Logger {
    public string Target { get; }
    public LogLevel Level { get; }

    // 主构造：参数最全，所有实际初始化逻辑都在这里
    public Logger(string target, LogLevel level) {
        Target = target;
        Level = level;
        Console.WriteLine($"[初始化] 目标={target}, 级别={level}");
    }

    // 只传 target，用 : this(...) 调主构造，level 默认 Info
    public Logger(string target) : this(target, LogLevel.Info) {
        // 这里还能加额外逻辑，this(...) 先执行，再执行这里
    }

    // 全默认：目标默认 console，级别默认 Info
    public Logger() : this("console", LogLevel.Info) { }
}

// enum 也要放在所有可执行代码之后！
// enum 是值类型，定义一组命名常量
enum LogLevel {
    Debug,    // 0
    Info,     // 1
    Warning,  // 2
    Error     // 3
}
\`\`\`

> ⭐ 链式调用的执行顺序：**先执行被引用的构造（this 后面的），再执行当前构造体**。所以基础初始化先跑，再跑专属逻辑。

### 五、base() 调用父类构造（先建立概念，下章细讲）

子类构造函数默认调用父类无参构造。如果父类没有无参构造，必须显式用 \`base(...)\` 指定：

\`\`\`csharp
// ---------- 可执行代码 ----------
var d = new Dog("旺财", "金毛");
// 输出顺序：
// [Animal] 创建 旺财    ← 先执行父类构造
// [Dog] 创建 金毛犬 旺财 ← 再执行子类构造

// ---------- 类型声明 ----------
// 父类（基类）
class Animal {
    public string Name { get; }

    // 父类只有带参构造，没有无参构造
    public Animal(string name) {
        Name = name;
        Console.WriteLine($"[Animal] 创建 {name}");
    }
}

// 子类（派生类）: 用 : 表示继承
class Dog : Animal {
    public string Breed { get; }

    // : base(name) 调用父类的带参构造
    // 为什么必须写 base？因为父类没有无参构造，子类必须显式告诉它调哪个父类构造
    public Dog(string name, string breed) : base(name) {
        Breed = breed;
        Console.WriteLine($"[Dog] 创建 {breed} 犬 {name}");
    }
}
\`\`\`

> 构造顺序：**父类先构造，子类后构造**。就像盖楼，先打地基再起上层。

### 六、对象初始化器 {} ⭐

用 \`{}\` 在创建对象时一次性给属性赋值，无需写一堆构造函数重载：

\`\`\`csharp
// ---------- 可执行代码 ----------
// 用对象初始化器：可灵活给任意属性组合赋值
var p = new Product {
    Name = "键盘",
    Price = 199m,
    Category = "外设",
    InStock = true
};

// 等价于（老写法，啰嗦）：
var p2 = new Product();
p2.Name = "键盘";
p2.Price = 199m;
p2.Category = "外设";
p2.InStock = true;

Console.WriteLine($"{p.Name} {p.Category} ￥{p.Price}");
// 为什么初始化器好用？不用为每种属性组合写构造重载——
// 一个无参构造 + 初始化器，想设几个属性设几个

// ---------- 类型声明 ----------
class Product {
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; }
    public bool InStock { get; set; }
}
\`\`\`

> ⭐ 对象初始化器是日常最常用的创建对象方式——**不用为每种属性组合写构造重载**，灵活又清晰。

### 七、集合初始化器 ⭐

List、Dictionary 等集合也能用 \`{}\` 初始化：

\`\`\`csharp
// using 指令放最前面！
using System.Collections.Generic;
using System.Linq;

// ---------- 可执行代码（这个块没有自定义类型，只有BCL的List/Dictionary，顺序没问题）----------
// List 初始化器：创建时直接加元素
var names = new List<string> { "张三", "李四", "王五" };

// Dictionary 初始化器：C# 6 推荐用 ["key"] = value
var scores = new Dictionary<string, int> {
    ["张三"] = 85,
    ["李四"] = 92,
    ["王五"] = 78
};

// 旧写法（仍然兼容）
var scores2 = new Dictionary<string, int> {
    { "张三", 85 },
    { "李四", 92 }
};

foreach (var n in names) {
    Console.WriteLine($"{n}: {scores[n]}");
}
// 注意：这个代码块没有自定义 class/struct/enum，所以不需要移动类型声明
\`\`\`

> ⭐ \`["key"] = value\` 是 C# 6+ 推荐写法，更直观，且支持索引器初始化。

### 八、with 表达式（record 专用，C# 9+）⭐

\`with\` 表达式基于现有对象创建一个**修改部分属性**的副本，**仅限 record 类型**：

\`\`\`csharp
// ---------- 可执行代码 ----------
var p1 = new Point(3, 4);
Console.WriteLine($"原始：{p1}");

// with 表达式：基于 p1 创建一个新对象，只改 X，Y 保持不变
// 为什么用 with？因为 record 是不可变的，不能直接 p1.X = 10
// with 不修改原对象，返回一个新副本
var p2 = p1 with { X = 10 };
Console.WriteLine($"修改后：{p2}");
Console.WriteLine($"原对象不变：{p1}");  // p1 还是 (3, 4)，没被改

// ---------- 类型声明（record 也要放在执行代码后！）----------
// record 类型：C# 9 引入，用于值语义的不可变数据对象
// 主构造器语法 (double X, double Y) 自动生成只读属性
public record Point(double X, double Y);
// record 适合：DTO、数据传输、消息、不可变值对象
\`\`\`

> ⭐ \`with\` 在不可变数据流（DTO 转换、状态更新）里极其方便，比手动 clone + 修改简洁太多。

### 九、析构函数（少用）

析构函数在对象被垃圾回收时调用，C# 用 \`~类名\` 语法。**绝大多数情况不需要写**：

\`\`\`csharp
// ---------- 可执行代码 ----------
{
    var f = new TempFile("/tmp/a.tmp");
    Console.WriteLine("使用文件中...");
}  // 离开作用域，f 没有引用了，等着 GC 回收

Console.WriteLine("方法结束，等GC...");

// 主动触发 GC（仅演示用！生产环境千万别手动调 GC.Collect）
GC.Collect();
GC.WaitForPendingFinalizers();
Console.WriteLine("GC 完成");

// ---------- 类型声明 ----------
class TempFile {
    public string Path { get; }

    public TempFile(string path) {
        Path = path;
        Console.WriteLine($"[构造] 创建临时文件 {path}");
    }

    // 析构函数（终结器）：GC 回收对象时调用
    // 语法：~类名()，无参数，无访问修饰符
    // ⚠️ 析构时机不确定！由 GC 决定，你不知道它什么时候跑
    // ⚠️ 不要在析构函数里处理关键资源释放（文件、数据库连接等）
    ~TempFile() {
        Console.WriteLine($"[析构] 清理 {Path}");
        // 正确的资源清理方式是实现 IDisposable + using 语句（后续章节讲）
    }
}
\`\`\`

> ⚠️ **析构函数有性能开销**，会让对象多活一代。**清理非托管资源请用 \`IDisposable\` + \`using\`**（后续章节详讲），不要用析构函数。

### 十、实战 demo：员工管理系统

\`\`\`csharp
// ---------- 可执行代码 ----------
var emp1 = new Employee(1, "张三", 15000m, "技术部");
var emp2 = new Employee(2, "李四", 12000m);  // 用链式构造，部门默认"未分配"

Console.WriteLine(emp1.Display);
Console.WriteLine(emp2.Display);

emp1.Raise(15);              // 加薪 15%
emp1.Transfer("架构组");     // 调岗
emp2.Raise(10);
emp2.Transfer("市场部");

Console.WriteLine(emp1.Display);
Console.WriteLine(emp2.Display);

// ---------- 类型声明 ----------
class Employee {
    // init：创建后 Id/Name 不变（员工号和姓名不会变）
    public int Id { get; init; }
    public string Name { get; init; }

    // set：薪资和部门可以变
    public decimal Salary { get; set; }
    public string Department { get; set; }

    // 计算属性：格式化显示字符串
    public string Display => $"#{Id} {Name} ({Department}) ￥{Salary:N0}";

    // 主构造函数：必填字段都通过构造传
    public Employee(int id, string name, decimal salary, string department) {
        Id = id;
        Name = name;
        Salary = salary;
        Department = department;
    }

    // 链式重载：默认部门是"未分配"
    public Employee(int id, string name, decimal salary)
        : this(id, name, salary, "未分配") { }

    // 加薪方法：percent 是百分比，如 10 表示加 10%
    public void Raise(decimal percent) {
        Salary *= 1 + percent / 100;  // 复合赋值：Salary = Salary * (1 + percent/100)
        Console.WriteLine($"{Name} 加薪 {percent}%，新薪资 ￥{Salary:N0}");
    }

    // 调岗方法
    public void Transfer(string newDept) {
        Department = newDept;
        Console.WriteLine($"{Name} 调岗至 {newDept}");
    }
}
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
// ---------- 可执行代码 ----------
// 静态成员用 类名.成员名 访问，不需要 new
Console.WriteLine($"初始总数：{Counter.TotalCount}");  // 0，还没创建对象

var c1 = new Counter("A");
var c2 = new Counter("B");
var c3 = new Counter("C");

Console.WriteLine($"最终总数：{Counter.TotalCount}");  // 3，三个对象共享同一个计数器
// 为什么？静态字段 _totalCount 属于 Counter 类本身，所有 Counter 实例共享一份
// 不管 new 多少个 Counter，_totalCount 只有一个，加的是同一个数

// ---------- 类型声明 ----------
class Counter {
    // 静态字段：用 static 修饰，所有对象共享同一份内存
    // 生命周期：从程序启动到程序结束，一直存在
    private static int _totalCount = 0;

    // 静态属性：也是类级别，返回静态字段
    public static int TotalCount => _totalCount;

    // 实例属性：每个对象有自己的 Name
    public string Name { get; }

    // 实例构造函数：每创建一个对象执行一次
    public Counter(string name) {
        Name = name;
        _totalCount++;  // 每创建一个，共享计数器 +1
                        // 实例构造里既能访问实例成员，也能访问静态成员
        Console.WriteLine($"创建 {name}，当前总数 {_totalCount}");
    }
}
\`\`\`

> ⭐ 静态成员的生命周期：**程序运行期间一直存在**，不随对象销毁。所有实例共享同一份数据。

### 二、静态方法 ⭐

静态方法不依赖对象状态，通过类名调用。\`Math\`、\`Console\`、\`Convert\` 都是经典例子：

\`\`\`csharp
// ---------- 可执行代码 ----------
// 静态方法：类名.方法名()，不用 new 对象
Console.WriteLine($"null 空？{StringUtils.IsNullOrEmpty(null)}");  // True
Console.WriteLine($"反转 hello：{StringUtils.Reverse("hello")}");   // olleh
Console.WriteLine($"重复 AB 3 次：{StringUtils.Repeat("AB", 3)}");  // ABABAB

// 为什么这些方法是静态？因为它们不依赖任何对象状态——
// 输入什么就输出什么，是"纯函数"，不需要保存状态

// ---------- 类型声明 ----------
class StringUtils {
    // 静态方法：纯计算，不访问任何实例字段（因为没有实例）
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
\`\`\`

> ⭐ **判断标准**：方法不访问实例字段 → 静态。这样调用更直观（\`StringUtils.Reverse\`），也省去 new 对象的开销。

### 三、静态构造函数

静态构造函数在**类首次被使用时**执行一次，用于初始化静态成员：

\`\`\`csharp
// 需要加 using，放最前面
using System.Threading;

// ---------- 可执行代码 ----------
// 第一次访问 AppConfig 类的任何成员，自动触发静态构造函数
AppConfig.ShowInfo();
Thread.Sleep(500);  // 等半秒
AppConfig.ShowInfo();  // 不会再触发静态构造了！静态构造只执行一次

// ---------- 类型声明 ----------
class AppConfig {
    // 静态字段
    public static string Version;
    public static DateTime StartTime;

    // 静态构造函数：特点
    // ① 无访问修饰符（不能加 public/private）
    // ② 无参数
    // ③ 不能手动调用，由 CLR 在类第一次被使用时自动调用
    // ④ 整个程序生命周期只执行一次
    static AppConfig() {
        Version = "1.0.0";
        StartTime = DateTime.Now;
        Console.WriteLine($"[静态构造] 应用启动于 {StartTime:HH:mm:ss}，只执行一次");
    }

    public static void ShowInfo() {
        Console.WriteLine($"版本 {Version}，已运行 {(DateTime.Now - StartTime).TotalSeconds:F1} 秒");
    }
}
\`\`\`

> 静态构造函数**只执行一次**，时机由运行时决定。常用于加载配置、初始化静态字典等。

### 四、静态类 ⭐

加 \`static\` 修饰的类：**不能实例化、不能有实例成员、必须全部静态**。是工具类的标准写法：

\`\`\`csharp
// ---------- 可执行代码 ----------
// var m = new MathUtils();  // ❌ 编译错误：静态类不能 new
Console.WriteLine($"π = {MathUtils.Pi}");
Console.WriteLine($"半径 5 的圆面积：{MathUtils.CircleArea(5):F2}");
Console.WriteLine($"5! = {MathUtils.Factorial(5)}");  // 5*4*3*2*1 = 120

// ---------- 类型声明 ----------
// static class：静态类，不能被实例化，不能被继承
// 所有成员都必须是 static
// 为什么用静态类？一眼就知道这是工具类，不会误去 new 对象
static class MathUtils {
    // const 常量：默认就是静态的，不用显式加 static
    public const double Pi = 3.14159265358979;

    // static readonly 运行时常量
    public static readonly double E = Math.E;

    // 静态方法：计算圆面积
    public static double CircleArea(double r) => Pi * r * r;
    public static double CirclePerimeter(double r) => 2 * Pi * r;

    // 递归计算阶乘
    public static int Factorial(int n) {
        if (n < 0) throw new ArgumentException("n 不能为负");
        return n <= 1 ? 1 : n * Factorial(n - 1);
    }
}
\`\`\`

> ⭐ **工具类一律用静态类**：\`Math\`、\`Convert\`、\`File\`、\`Path\`、\`JsonSerializer\` 等。一看 \`static class\` 就知道是工具，不会误 new。

### 五、单例模式 ⭐

单例（Singleton）：保证一个类只有一个实例，全局访问点。是静态 + 惰性创建的经典应用：

\`\`\`csharp
// ---------- 可执行代码 ----------
// 全程通过 Logger.Instance 访问那个唯一实例
Logger.Instance.Log("应用启动");
Logger.Instance.Log("处理请求");
Logger.Instance.Log("应用结束");
// 注意："[Logger] 初始化"只打印一次，说明只创建了一个 Logger 对象

// ---------- 类型声明 ----------
class Logger {
    // 静态字段：存那个唯一的实例
    private static Logger _instance;

    // 锁对象：用于多线程环境下保证只创建一个实例
    private static readonly object _lock = new();

    // 私有构造函数：关键！把构造设为 private，外部就 new 不了了
    private Logger() {
        Console.WriteLine("[Logger] 初始化（整个程序只打印一次）");
    }

    // 静态属性：提供全局访问点
    // 双重检查锁（Double-Check Locking）：线程安全的惰性初始化
    public static Logger Instance {
        get {
            if (_instance == null) {       // 第一次检查：无锁快速路径
                lock (_lock) {             // 加锁，只让一个线程进来
                    if (_instance == null) {  // 第二次检查：锁内再判断，防止多个线程排队进来重复创建
                        _instance = new Logger();
                    }
                }
            }
            return _instance;
        }
    }

    // 实例方法：真正打日志
    public void Log(string msg) {
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {msg}");
    }
}
\`\`\`

> ⭐ 单例的两个核心：**私有构造**（挡住外部 new）+ **静态属性**（提供全局访问点）。后续会讲更简洁的依赖注入方式替代手写单例。

### 六、const vs static readonly ⭐

两者都像「常量」，但本质不同：

\`\`\`csharp
// ---------- 可执行代码 ----------
Console.WriteLine($"π = {Constants.Pi}");
Console.WriteLine($"应用：{Constants.AppName}");
Console.WriteLine($"构建时间：{Constants.BuildTime:yyyy-MM-dd HH:mm:ss}");
Console.WriteLine($"AppId：{Constants.AppId}");
Console.WriteLine($"质数：{string.Join(", ", Constants.Primes)}");

// ---------- 类型声明 ----------
class Constants {
    // const：编译期常量
    // ① 编译时就被替换成字面值（3.14159 直接写进调用处）
    // ② 只能是内置简单类型（数字、bool、string、null）
    // ③ 跨程序集引用时，改了 const 值不重编译引用方，会用到旧值！
    public const double Pi = 3.14159;
    public const string AppName = "我的应用";
    public const int MaxRetry = 3;

    // static readonly：运行时常量
    // ① 运行时读取字段值
    // ② 可以是任意类型（DateTime、Guid、数组、自定义类型）
    // ③ 跨程序集改了值，重启就生效，不用重编译引用方
    public static readonly DateTime BuildTime = DateTime.Now;  // 程序启动时的时间
    public static readonly Guid AppId = Guid.NewGuid();         // 每次启动生成新的 Guid
    public static readonly int[] Primes = { 2, 3, 5, 7, 11 };
}
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
// ---------- 可执行代码 ----------
string email = "z*@***********";
// 扩展方法调用：就像 string 原生就有 IsEmail() 方法一样
Console.WriteLine($"是邮箱？{email.IsEmail()}");

string longText = "这是一段很长的文本需要截断处理";
Console.WriteLine($"截断：{longText.Truncate(10)}");  // 这是一段很长的...

// ---------- 类型声明（扩展方法必须在静态类里）----------
// 静态类：扩展方法必须定义在顶层静态类中
static class StringExtensions {
    // 扩展方法语法：静态方法 + 第一个参数前加 this
    // this string s：表示给 string 类型"扩展"一个 IsEmail 方法
    // 为什么叫扩展？不修改 string 源码（也改不了，BCL的类），但能像调用实例方法一样调用
    public static bool IsEmail(this string s) {
        if (string.IsNullOrEmpty(s)) return false;
        return s.Contains('@') && s.Contains('.');
    }

    // 给 string 加 Truncate 截断方法
    public static string Truncate(this string s, int maxLen) {
        if (s == null) return null;
        return s.Length <= maxLen ? s : s.Substring(0, maxLen) + "...";
    }
}
\`\`\`

> ⭐ 扩展方法在 LINQ 里被大量使用（\`.Where()\`、\`.Select()\` 都是扩展方法）。日常写工具方法优先考虑扩展方法，让调用更自然。

### 八、实战 demo：配置类与工具类

\`\`\`csharp
// ---------- 可执行代码 ----------
AppSettings.PrintBanner();

AppSettings.Environment = "Production";  // 静态字段可改
Console.WriteLine($"切换后是生产环境：{AppSettings.IsProduction}");

AppLogger.Instance.Info("应用启动");
AppLogger.Instance.Info("处理订单");
AppLogger.Instance.Info("订单完成");

DateTime past = DateTime.Now.AddHours(-3);
Console.WriteLine($"3 小时前 = {past.ToRelative()}");  // 调用扩展方法

// ---------- 类型声明（全部放执行代码后）----------
// 1. 静态配置类
static class AppSettings {
    public const string AppName = "订单系统";   // 编译期常量
    public const int Version = 1;

    public static readonly Guid AppId = Guid.NewGuid();       // 运行时常量
    public static readonly DateTime StartedAt = DateTime.Now;

    public static string Environment = "Development";  // 静态字段：运行时可变

    // 静态计算属性
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
    private int _count = 0;  // 实例字段：记录日志条数

    private AppLogger() { }  // 私有构造，外部 new 不了

    public static AppLogger Instance {
        get {
            if (_instance == null) {
                lock (_lock) {
                    _instance ??= new AppLogger();  // ??= 如果左边是 null 才赋值
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

// 3. 扩展方法类：给 DateTime 加相对时间
static class DateTimeExtensions {
    // this DateTime dt：扩展 DateTime 类型
    public static string ToRelative(this DateTime dt) {
        var diff = DateTime.Now - dt;
        if (diff.TotalSeconds < 60) return $"{(int)diff.TotalSeconds} 秒前";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} 分钟前";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} 小时前";
        return $"{(int)diff.TotalDays} 天前";
    }
}
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
// ---------- 可执行代码 ----------
Console.WriteLine("=== 不用继承（反例，代码重复）===");
// Student/Teacher/Employee 各自有 Name/Age，重复定义
var stuNoInherit = new Student { Name = "小明", Age = 18, School = "一中" };
Console.WriteLine($"{stuNoInherit.Name} {stuNoInherit.Age}岁 在{stuNoInherit.School}上学");

Console.WriteLine("\\n=== 用继承（推荐，代码复用）===");
// 子类自动拥有父类的 Name/Age/Introduce()
var s = new Student2 { Name = "张三", Age = 20, School = "清华" };
s.Introduce();  // 调用父类 Person 的方法
Console.WriteLine($"学校：{s.School}");

var t = new Teacher2 { Name = "王老师", Age = 45, Salary = 15000m };
t.Introduce();
Console.WriteLine($"薪资：{t.Salary:C}");

// ---------- 类型声明 ----------
// 不用继承：每个类都重复写 Name/Age，改起来要改 N 处
class Student { public string Name; public int Age; public string School; }
class Teacher { public string Name; public int Age; public decimal Salary; }
class Employee { public string Name; public int Age; public string Department; }

// 用继承：提取公共部分到父类 Person
// Person 是基类（父类），定义共有的姓名、年龄、自我介绍方法
class Person {
    public string Name { get; set; }
    public int Age { get; set; }
    public void Introduce() => Console.WriteLine($"我叫 {Name}，{Age} 岁");
}

// Student2/Teacher2/Employee2 是派生类（子类），用 : 继承 Person
// : Person 表示"是一个 Person"，自动拥有 Person 的所有成员
class Student2 : Person { public string School { get; set; } }   // 只加自己特有的 School
class Teacher2 : Person { public decimal Salary { get; set; } }  // 只加自己特有的 Salary
class Employee2 : Person { public string Department { get; set; } }
\`\`\`

> 继承的核心价值：**代码复用 + 建立类型层次**。\`Student2 is-a Person\`，子类是父类的特化。

### 二、继承语法 ⭐

C# 用 \`:\` 表示继承，**只能单继承**（一个类只能有一个父类）：

\`\`\`csharp
// ---------- 可执行代码 ----------
// ElectricCar 继承链：ElectricCar → Car → Vehicle
// 所以它拥有 Vehicle 的 Brand/Speed/Start()，Car 的 Doors/Honk()，还有自己的 Battery/Charge()
var tesla = new ElectricCar {
    Brand = "Tesla",
    Speed = 0,
    Doors = 4,
    Battery = 80
};
tesla.Start();   // 调用 Vehicle 的方法（祖父类）
tesla.Honk();    // 调用 Car 的方法（父类）
tesla.Charge();  // 调用自己的方法

// ---------- 类型声明 ----------
// 基类：交通工具，定义所有交通工具共有的属性和方法
class Vehicle {
    public string Brand { get; set; }  // 品牌
    public int Speed { get; set; }     // 速度

    public void Start() {
        Console.WriteLine($"{Brand} 启动，速度 {Speed}");
    }
}

// Car 继承 Vehicle：汽车是一种交通工具
// 单继承：C# 一个类只能有一个父类（不能同时继承多个类）
class Car : Vehicle {
    public int Doors { get; set; }  // 车门数，Car 特有的

    public void Honk() {
        Console.WriteLine($"{Brand} 嘀嘀！");
    }
}

// ElectricCar 继承 Car：电动车是一种汽车
// 多层继承：A→B→C 是允许的，这是间接继承 Vehicle
class ElectricCar : Car {
    public double Battery { get; set; }  // 电量百分比，电动车特有

    public void Charge() {
        Console.WriteLine($"{Brand} 充电中，电量 {Battery}%");
    }
}
\`\`\`

> ⭐ C# 只能单继承，但可以多层继承（A→B→C）。需要"多继承"功能时用接口（第十六章讲）。

### 三、base 关键字 ⭐

\`base\` 指向父类，用于调用父类的构造函数和方法：

\`\`\`csharp
// ---------- 可执行代码 ----------
var cat = new Cat("咪咪", "橘色");
cat.Speak();
// 输出：
// 咪咪 发出声音    ← base.Speak() 调用父类版本
// 咪咪（橘色）喵喵叫 ← 然后执行自己的逻辑

// ---------- 类型声明 ----------
class Animal {
    public string Name { get; set; }

    public Animal(string name) {
        Name = name;
    }

    // virtual：标记这个方法可以被子类重写（下一节细讲）
    public virtual void Speak() {
        Console.WriteLine($"{Name} 发出声音");
    }
}

class Cat : Animal {
    public string Color { get; set; }

    // : base(name) 调用父类的构造函数
    // 为什么必须调？因为父类 Animal 没有无参构造，只有带 name 的构造
    // 子类必须告诉父类怎么构造
    public Cat(string name, string color) : base(name) {
        Color = color;
    }

    // override：重写父类的 virtual 方法
    public override void Speak() {
        base.Speak();  // base.Speak() 调用父类版本，先做父类的事
        Console.WriteLine($"{Name}（{Color}）喵喵叫");  // 再做自己的扩展
    }
}
\`\`\`

> ⭐ \`base(...)\` 调父类构造，**必须在子类构造函数初始化器里**（紧跟参数列表后）。\`base.方法()\` 在子类方法里调父类版本。

### 四、protected 访问 ⭐

\`protected\` 修饰的成员：**本类 + 子类**可见，外部不可见。是继承场景的关键修饰符：

\`\`\`csharp
using System.Linq;

// ---------- 可执行代码 ----------
Shape r = new Rectangle(4, 5);
Shape t = new Triangle(4, 5);
Console.WriteLine($"矩形面积：{r.Area()}");     // 20
Console.WriteLine($"三角形面积：{t.Area()}");   // 10
// Console.WriteLine(r.Width);  // ❌ 编译错误：Width 是 protected，外部访问不到
// 为什么 Width/Height 设 protected？
// 因为子类（Rectangle/Triangle）需要访问它们来计算面积，但外部不需要也不应该直接改宽高

// ---------- 类型声明 ----------
class Shape {
    // protected：访问修饰符，只有这个类和它的子类能访问
    // 对比：private 子类都访问不了；public 外部都能访问
    // protected 是为继承设计的：让子类能复用父类内部数据，又不暴露给外部
    protected double Width;
    protected double Height;

    public Shape(double width, double height) {
        Width = width;
        Height = height;
    }

    // virtual：子类可重写
    public virtual double Area() => Width * Height;
}

class Rectangle : Shape {
    // : base(w, h) 调父类构造，给 Width/Height 赋值
    public Rectangle(double w, double h) : base(w, h) { }

    // 子类能访问 protected 的 Width/Height
    public override double Area() => Width * Height;
}

class Triangle : Shape {
    public Triangle(double w, double h) : base(w, h) { }

    // 三角形面积 = 底*高/2，重写计算逻辑
    public override double Area() => Width * Height / 2;
}
\`\`\`

> ⭐ \`protected\` 让子类能复用父类内部数据，又不暴露给外部。**字段建议 private，子类需要时改 protected 或通过 protected 属性暴露**。

### 五、virtual 与 override ⭐

\`virtual\` 标记父类方法「可被重写」，\`override\` 在子类里实际重写。这是多态的基础：

\`\`\`csharp
using System.Linq;

// ---------- 可执行代码 ----------
// 多态演示：父类引用指向子类对象
Animal[] animals = { new Dog("旺财"), new Cat("咪咪"), new Animal("未知") };
foreach (var a in animals) {
    a.Speak();  // 同一句 a.Speak()，运行时根据对象实际类型调用不同实现！
    Console.WriteLine($"  声音：{a.Sound}");
}
// 输出：
// 旺财 汪汪叫！
//  声音：汪汪
// 咪咪 喵喵叫！
//  声音：喵喵
// 未知 发出声音
//  声音：某种声音
// 这就是多态：同一调用，不同表现

// ---------- 类型声明 ----------
class Animal {
    public string Name { get; }

    public Animal(string name) {
        Name = name;
    }

    // virtual：关键字，表示这个方法"可以"被子类重写
    // 不加 virtual 的方法子类不能 override（只能用 new 隐藏，不推荐）
    public virtual void Speak() {
        Console.WriteLine($"{Name} 发出声音");
    }

    // virtual 属性也能被重写
    public virtual string Sound => "某种声音";
}

class Dog : Animal {
    public Dog(string name) : base(name) { }

    // override：关键字，表示"我要重写"父类的 virtual 方法
    // 签名必须和父类一致（返回类型、方法名、参数列表都一样）
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
\`\`\`

> ⭐ 多态是 OOP 的精髓：**同一句代码 \`a.Speak()\`，运行时根据对象实际类型调不同实现**。前提是父类 \`virtual\` + 子类 \`override\`。

> 注意：不加 \`virtual\` 的方法，子类用 \`new\` 关键字隐藏（不推荐，失去多态性）。

###