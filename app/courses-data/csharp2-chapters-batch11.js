// =============================================================
// C# 大全 - 第十批章节（补充：现代语法与工程化入门，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp2-ch54 : 现代 C# 语法精要（C# 12）
//   csharp2-ch55 : 依赖注入（DI）入门
//   csharp2-ch56 : 单元测试入门
//   csharp2-ch57 : ASP.NET Core 入门
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句（可在线运行）。
// =============================================================

const chapters = [
  // ============================================================
  // 第五十四章：现代 C# 语法精要（C# 12）
  // ============================================================
  {
    id: "csharp2-ch54",
    group: '第九部分 工程化与实战',
    icon: '✨',
    title: '现代 C# 语法精要（C# 12）',
    content: `## 第五十四章　现代 C# 语法精要（C# 12）

C# 12 带来了大量让代码更简洁的现代语法。本章集中讲解生产开发中最常用的新特性，每个都有可运行 demo。

### 一、集合表达式 ⭐⭐⭐

C# 12 之前，初始化集合要写一长串语法。现在统一用方括号 \`[]\`：

\`\`\`csharp
// ===== 旧写法 vs 新写法 =====

// 数组
int[] oldArr = new int[] { 1, 2, 3 };       // 旧
int[] newArr = [1, 2, 3];                     // 新 ✅

// List<T>
List<string> oldList = new List<string> { "A", "B" };  // 旧
List<string> newList = ["A", "B"];                      // 新 ✅

// Span<T> 和 ReadOnlySpan<T>
Span<int> span = [10, 20, 30];               // 新 ✅

// 嵌套
int[][] nested = [[1, 2], [3, 4], [5, 6]];  // 新 ✅

Console.WriteLine(\$"arr={string.Join(",", newArr)}, list={string.Join(",", newList)}");
Console.WriteLine(\$"nested[1]={string.Join(",", nested[1])}");

// 展开运算符（spread operator）：用 .. 展开另一个集合
int[] a = [1, 2, 3];
int[] b = [..a, 4, 5];  // [1, 2, 3, 4, 5]
Console.WriteLine(\$"b={string.Join(",", b)}");

// 实战：合并两个列表
List<int> list1 = [1, 2, 3];
List<int> list2 = [..list1, 4, 5, 6];
Console.WriteLine(\$"合并: {string.Join(",", list2)}");
\`\`\`

### 二、主构造函数（Primary Constructor） ⭐⭐⭐

C# 12 允许在类/结构体声明时直接写构造函数参数，省掉样板代码：

\`\`\`csharp-snippet
// ===== 旧写法 =====
class OldPerson
{
    private string _name;
    private int _age;

    public OldPerson(string name, int age)
    {
        _name = name;
        _age = age;
    }

    public void Print() => Console.WriteLine(\$"{_name}, {_age}");
}

// ===== 新写法：主构造函数 =====
class NewPerson(string name, int age)
{
    // 主构造函数参数在整个类体内可用
    public void Print() => Console.WriteLine(\$"{name}, {age}");

    // 可以在其他构造函数中调用主构造函数
    public NewPerson(string name) : this(name, 0) { }
}

var p1 = new OldPerson("张三", 25);
var p2 = new NewPerson("李四", 30);
var p3 = new NewPerson("王五");
p1.Print();  // 张三, 25
p2.Print();  // 李四, 30
p3.Print();  // 王五, 0

// 结构体也支持主构造函数
struct Point(double x, double y)
{
    public double X => x;
    public double Y => y;
    public double Distance => Math.Sqrt(x * x + y * y);

    public override string ToString() => \$"({x}, {y}), distance={Distance:F2}";
}

var pt = new Point(3, 4);
Console.WriteLine(pt);  // (3, 4), distance=5.00
\`\`\`

> **注意**：主构造函数参数默认是 \`private\` 的。如果需要公开，要显式声明属性。主构造函数参数是可变的（不是 \`readonly\`），所以不要在多线程场景直接暴露。

### 三、init 只读设置器与 required 修饰符 ⭐⭐⭐

\`\`\`csharp-snippet
// init：只能在构造时赋值，之后只读
class Config
{
    // init 保证属性初始化后不可变
    public string Name { get; init; } = "";
    public int Port { get; init; } = 80;

    // required：必须由调用方初始化（C# 11+）
    // 不赋值会编译报错 CS9035
    public required string ConnectionString { get; init; }
}

// ✅ 正确用法：对象初始化器 + required
var cfg = new Config
{
    Name = "Production",
    Port = 443,
    ConnectionString = "Server=...;Database=...;"
};

Console.WriteLine(\$"{cfg.Name}:{cfg.Port}");
// cfg.Name = "Test";  // ❌ 编译错误：init 属性只能在初始化时赋值

// 实战：不可变配置对象
class DatabaseSettings
{
    public required string Host { get; init; }
    public required string Database { get; init; }
    public int Port { get; init; } = 5432;
    public int TimeoutSeconds { get; init; } = 30;

    public string GetConnectionString() =>
        \$"Host={Host};Database={Database};Port={Port};Timeout={TimeoutSeconds}";
}

var db = new DatabaseSettings { Host = "localhost", Database = "MyApp" };
Console.WriteLine(db.GetConnectionString());
\`\`\`

### 四、record 类型精要 ⭐⭐⭐

\`\`\`csharp-snippet
// record class（引用类型，不可变，值相等语义）
record class Point2D(double X, double Y);

// record struct（值类型，可变，值相等语义）
record struct Point3D(double X, double Y, double Z);

// record 与 with 表达式（非破坏性修改）
var p1 = new Point2D(1, 2);
var p2 = p1 with { X = 10 };  // 创建副本，只改 X
Console.WriteLine(\$"{p1}, {p2}");  // Point2D { X = 1, Y = 2 }, Point2D { X = 10, Y = 2 }
Console.WriteLine(\$"p1 == p2? {p1 == p2}");  // False

// 值相等
var p3 = new Point2D(1, 2);
Console.WriteLine(\$"p1 == p3? {p1 == p3}");  // True（值相等）

// record struct 可变
var pt3d = new Point3D(1, 2, 3);
pt3d.X = 100;  // record struct 允许修改
Console.WriteLine(pt3d);  // Point3D { X = 100, Y = 2, Z = 3 }

// 复杂 record：带验证逻辑
record class Money(decimal Amount, string Currency)
{
    // 静态工厂 + 验证
    public static Money Create(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentException("金额不能为负");
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("币种不能为空");
        return new Money(amount, currency.ToUpper());
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("币种不一致");
        return this with { Amount = Amount + other.Amount };
    }

    public override string ToString() => \$"{Amount:F2} {Currency}";
}

var price = Money.Create(99.50m, "CNY");
var shipping = Money.Create(12.00m, "CNY");
var total = price.Add(shipping);
Console.WriteLine(\$"{price} + {shipping} = {total}");  // 99.50 CNY + 12.00 CNY = 111.50 CNY
\`\`\`

### 五、global using 与文件范围命名空间 ⭐⭐

\`\`\`csharp-snippet
// 在项目文件或单独的 .cs 文件顶部声明全局 using
// 编译器会自动应用到所有文件
// global using System;
// global using System.Collections.Generic;
// global using System.Linq;
// global using System.Threading.Tasks;

// 文件范围命名空间（C# 10+）：少一层缩进
// 旧写法：
// namespace MyApp.Services
// {
//     class UserService { }
// }

// 新写法（推荐）：
// namespace MyApp.Services;
// class UserService { }

// 实战：一个完整文件
\`\`\`
\`\`\`csharp-snippet-snippet
// GlobalUsings.cs（项目级别全局 using）
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Threading.Tasks;
global using System.Text.Json;

// UserService.cs
namespace MyApp.Services;

public class UserService
{
    private readonly List<string> _users = ["Alice", "Bob", "Charlie"];

    public IEnumerable<string> GetActiveUsers() =>
        _users.Where(u => u.Length > 3);

    public void AddUser(string name) => _users.Add(name);
}
\`\`\`

### 六、模式匹配增强 ⭐⭐

\`\`\`csharp-snippet
// 列表模式：匹配数组/集合的头部和尾部
int[] numbers = [1, 2, 3, 4, 5];

// 匹配前两个元素和剩余
var result = numbers switch
{
    [0, ..] => "以 0 开头",
    [1, 2, ..] => "以 1, 2 开头",
    [.., 5] => "以 5 结尾",
    [1, 2, 3, 4, 5] => "完全匹配",
    _ => "其他"
};
Console.WriteLine(\$"匹配: {result}");

// 属性模式增强
class Order(decimal amount, string status, string customer)
{
    public decimal Amount => amount;
    public string Status => status;
    public string Customer => customer;
}

var order = new Order(1500, "Paid", "VIP");
var desc = order switch
{
    { Status: "Paid", Amount: > 1000, Customer: "VIP" } => "大额 VIP 已付款",
    { Status: "Paid", Amount: > 1000 } => "大额已付款",
    { Status: "Paid" } => "已付款",
    { Status: "Pending" } => "待付款",
    _ => "未知状态"
};
Console.WriteLine(\$"订单: {desc}");

// 模式组合：and / or / not
int score = 85;
var grade = score switch
{
    >= 90 and <= 100 => "A",
    >= 80 and < 90 => "B",
    >= 60 and < 80 => "C",
    >= 0 and < 60 => "D",
    < 0 or > 100 => "无效",
    _ => "未知"
};
Console.WriteLine(\$"成绩 {score} -> {grade}");
\`\`\`

### 七、默认 Lambda 参数 ⭐

\`\`\`csharp-snippet
// C# 12 支持 Lambda 默认参数
var greet = (string name, string greeting = "你好") =>
    \$"{greeting}, {name}!";

Console.WriteLine(greet("张三"));            // 你好, 张三!
Console.WriteLine(greet("李四", "嗨"));      // 嗨, 李四!

// 实战：带默认参数的配置函数
var formatPrice = (decimal price, string currency = "CNY", int decimals = 2) =>
    \$"{price.ToString(\$"F{decimals}")} {currency}";

Console.WriteLine(formatPrice(99.5));                    // 99.50 CNY
Console.WriteLine(formatPrice(99.5, "USD"));             // 99.50 USD
Console.WriteLine(formatPrice(99.5, "EUR", 0));         // 100 EUR
\`\`\`

### 八、内插字符串增强 ⭐

\`\`\`csharp
// 字符串内插可以跨多行
string name = "张三";
int age = 25;

string text = \$"""
    姓名：{name}
    年龄：{age}
    状态：{(age >= 18 ? "成年" : "未成年")}
    """;
Console.WriteLine(text);

// 内插表达式中的条件
string status = age switch
{
    < 12 => "儿童",
    < 18 => "少年",
    < 60 => "成人",
    _ => "老人"
};
Console.WriteLine(\$"状态: {status}");

// @ 内插字符串（保留特殊字符）
string json = \$@"{{
    ""name"": ""{name}"",
    ""age"": {age}
}}";
Console.WriteLine(json);
\`\`\`

### 九、关键总结

| 特性 | 版本 | 用途 | 重要度 |
| --- | --- | --- | --- |
| 集合表达式 \`[]\` | C# 12 | 统一集合初始化 | ⭐⭐⭐ |
| 展开运算符 \`..\` | C# 12 | 合并集合 | ⭐⭐⭐ |
| 主构造函数 | C# 12 | 简化类定义 | ⭐⭐⭐ |
| \`init\` 设置器 | C# 9 | 不可变属性 | ⭐⭐⭐ |
| \`required\` 修饰符 | C# 11 | 强制初始化 | ⭐⭐⭐ |
| \`record\` / \`record struct\` | C# 9/10 | 值类型不可变 | ⭐⭐⭐ |
| \`with\` 表达式 | C# 9 | 非破坏性修改 | ⭐⭐⭐ |
| \`global using\` | C# 10 | 全局导入 | ⭐⭐ |
| 文件范围命名空间 | C# 10 | 减少缩进 | ⭐⭐ |
| 列表模式 | C# 11 | 集合匹配 | ⭐⭐ |
| 默认 Lambda 参数 | C# 12 | 简化 Lambda | ⭐ |

> **生产建议**：新项目直接用 C# 12 + .NET 8 LTS。集合表达式、主构造函数、\`init\`/\`required\` 是现代 C# 代码的标配。旧项目逐步迁移，不必一次到位。

`,
  },

  // ============================================================
  // 第五十五章：依赖注入（DI）入门
  // ============================================================
  {
    id: "csharp2-ch55",
    group: '第九部分 工程化与实战',
    icon: '💉',
    title: '依赖注入（DI）入门',
    content: `## 第五十五章　依赖注入（DI）入门

**依赖注入（Dependency Injection, DI）** 是现代 C# 工程的核心模式。.NET 内置了完整的 DI 容器，几乎所有生产项目都依赖它。本章从零讲透 DI 的概念、用法和陷阱。

### 一、为什么需要 DI ⭐⭐⭐

\`\`\`csharp-snippet
// ===== 反面教材：硬编码依赖 =====
class BadOrderService
{
    // 直接 new 一个依赖——耦合死了，测试无法替换
    private readonly BadEmailService _email = new BadEmailService();

    public void PlaceOrder(string email)
    {
        // ... 订单逻辑 ...
        _email.Send(email, "订单已创建");
    }
}

class BadEmailService
{
    public void Send(string to, string body) =>
        Console.WriteLine(\$"发邮件给 {to}: {body}");
}

// 问题：
// 1. 想换邮件实现（如改用短信）必须改 OrderService 源码
// 2. 单元测试无法 mock 邮件发送
// 3. OrderService 自己负责创建依赖，职责混乱

// ===== 正面教材：通过构造函数注入 =====
interface IEmailService
{
    void Send(string to, string body);
}

class GoodOrderService
{
    private readonly IEmailService _email;

    // 依赖通过构造函数传入——不关心具体实现
    public GoodOrderService(IEmailService email)
    {
        _email = email ?? throw new ArgumentNullException(nameof(email));
    }

    public void PlaceOrder(string email)
    {
        // ... 订单逻辑 ...
        _email.Send(email, "订单已创建");
    }
}

class SmtpEmailService : IEmailService
{
    public void Send(string to, string body) =>
        Console.WriteLine(\$"SMTP 发邮件给 {to}: {body}");
}

// 使用：手动注入
var service = new GoodOrderService(new SmtpEmailService());
service.PlaceOrder("user@example.com");

// 测试：轻松替换为 mock
class MockEmailService : IEmailService
{
    public string LastTo { get; private set; } = "";
    public string LastBody { get; private set; } = "";

    public void Send(string to, string body)
    {
        LastTo = to;
        LastBody = body;
    }
}

var mock = new MockEmailService();
var testService = new GoodOrderService(mock);
testService.PlaceOrder("test@test.com");
Console.WriteLine(\$"Mock 收到: {mock.LastTo} -> {mock.LastBody}");
\`\`\`

### 二、.NET 内置 DI 容器 ⭐⭐⭐

\`\`\`csharp-snippet
using Microsoft.Extensions.DependencyInjection;

// 1. 创建容器
var services = new ServiceCollection();

// 2. 注册服务（三种生命周期）
// --- Transient：每次解析都创建新实例 ---
services.AddTransient<IEmailService, SmtpEmailService>();

// --- Scoped：同一作用域内复用（如一个 HTTP 请求）---
services.AddScoped<IOrderRepository, SqlOrderRepository>();

// --- Singleton：全局唯一实例 ---
services.AddSingleton<ILogger, ConsoleLogger>();

// 也可以直接注册实例
services.AddSingleton(new AppConfig { ApiKey = "key-123" });

// 3. 构建 ServiceProvider
using var provider = services.BuildServiceProvider();

// 4. 解析服务
var email = provider.GetRequiredService<IEmailService>();
email.Send("user@example.com", "Hello DI!");

var logger = provider.GetRequiredService<ILogger>();
logger.Log("应用启动");

// --- 接口定义 ---
interface IEmailService { void Send(string to, string body); }
interface IOrderRepository { void Save(string order); }
interface ILogger { void Log(string message); }

class SmtpEmailService : IEmailService
{
    public void Send(string to, string body) =>
        Console.WriteLine(\$"SMTP -> {to}: {body}");
}

class SqlOrderRepository : IOrderRepository
{
    public void Save(string order) =>
        Console.WriteLine(\$"SQL 保存订单: {order}");
}

class ConsoleLogger : ILogger
{
    public void Log(string message) =>
        Console.WriteLine(\$"[LOG] {DateTime.Now:HH:mm:ss} {message}");
}

class AppConfig
{
    public string ApiKey { get; set; } = "";
}
\`\`\`

### 三、三种生命周期详解 ⭐⭐⭐

\`\`\`csharp-snippet
using Microsoft.Extensions.DependencyInjection;

// 演示三种生命周期的区别
interface IGuidProvider { Guid Id { get; } }

class TransientProvider : IGuidProvider
{
    public Guid Id { get; } = Guid.NewGuid();
}

class ScopedProvider : IGuidProvider
{
    public Guid Id { get; } = Guid.NewGuid();
}

class SingletonProvider : IGuidProvider
{
    public Guid Id { get; } = Guid.NewGuid();
}

var services = new ServiceCollection();
services.AddTransient<TransientProvider>();
services.AddScoped<ScopedProvider>();
services.AddSingleton<SingletonProvider>();

using var provider = services.BuildServiceProvider();

// Transient：每次都不同
var t1 = provider.GetRequiredService<TransientProvider>();
var t2 = provider.GetRequiredService<TransientProvider>();
Console.WriteLine(\$"Transient:  {t1.Id} vs {t2.Id} -> {(t1.Id == t2.Id ? "同" : "不同")}");  // 不同

// Singleton：全局唯一
var s1 = provider.GetRequiredService<SingletonProvider>();
var s2 = provider.GetRequiredService<SingletonProvider>();
Console.WriteLine(\$"Singleton: {s1.Id} vs {s2.Id} -> {(s1.Id == s2.Id ? "同" : "不同")}");  // 同

// Scoped：同一作用域内相同
using (var scope = provider.CreateScope())
{
    var sc1 = scope.ServiceProvider.GetRequiredService<ScopedProvider>();
    var sc2 = scope.ServiceProvider.GetRequiredService<ScopedProvider>();
    Console.WriteLine(\$"Scoped(同域): {sc1.Id} vs {sc2.Id} -> {(sc1.Id == sc2.Id ? "同" : "不同")}");  // 同
}
using (var scope2 = provider.CreateScope())
{
    var sc3 = scope2.ServiceProvider.GetRequiredService<ScopedProvider>();
    Console.WriteLine(\$"Scoped(异域): 新实例 -> {sc3.Id}");
}
\`\`\`

### 四、构造函数注入实战 ⭐⭐⭐

\`\`\`csharp-snippet
using Microsoft.Extensions.DependencyInjection;

// 多层依赖：DI 容器自动解析整条依赖链
interface IProductRepository { List<string> GetAll(); }
interface IPriceCalculator { decimal Calculate(string productId); }
interface ICartService { void Checkout(List<string> productIds); }

class ProductRepository : IProductRepository
{
    public List<string> GetAll() => ["P001", "P002", "P003"];
}

class PriceCalculator : IPriceCalculator
{
    private readonly IProductRepository _repo;

    // 注入 IProductRepository
    public PriceCalculator(IProductRepository repo)
    {
        _repo = repo;
    }

    public decimal Calculate(string productId) => productId switch
    {
        "P001" => 99.00m,
        "P002" => 199.00m,
        "P003" => 299.00m,
        _ => 0m
    };
}

class CartService : ICartService
{
    private readonly IProductRepository _repo;
    private readonly IPriceCalculator _calculator;

    // 注入两个依赖
    public CartService(IProductRepository repo, IPriceCalculator calculator)
    {
        _repo = repo;
        _calculator = calculator;
    }

    public void Checkout(List<string> productIds)
    {
        decimal total = 0;
        foreach (var id in productIds)
        {
            total += _calculator.Calculate(id);
        }
        Console.WriteLine(\$"结账: {productIds.Count} 件商品, 总价 {total:F2}");
    }
}

// 注册到 DI 容器
var services = new ServiceCollection();
services.AddSingleton<IProductRepository, ProductRepository>();
services.AddSingleton<IPriceCalculator, PriceCalculator>();
services.AddSingleton<ICartService, CartService>();

using var provider = services.BuildServiceProvider();

// 解析 CartService，DI 自动注入所有依赖
var cart = provider.GetRequiredService<ICartService>();
cart.Checkout(["P001", "P002", "P003"]);  // 结账: 3 件商品, 总价 597.00
\`\`\`

### 五、Options 模式（配置注入） ⭐⭐

\`\`\`csharp-snippet
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

// 配置类
class DatabaseOptions
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 5432;
    public string Database { get; set; } = "";
}

class DatabaseService
{
    private readonly DatabaseOptions _options;

    // 通过 IOptions<T> 注入配置
    public DatabaseService(IOptions<DatabaseOptions> options)
    {
        _options = options.Value;
    }

    public string GetConnectionString() =>
        \$"Host={_options.Host};Port={_options.Port};Database={_options.Database}";
}

var services = new ServiceCollection();

// 注册配置（模拟从 appsettings.json 读取）
services.Configure<DatabaseOptions>(opts =>
{
    opts.Host = "192.168.1.100";
    opts.Port = 5432;
    opts.Database = "Production";
});

services.AddSingleton<DatabaseService>();

using var provider = services.BuildServiceProvider();
var db = provider.GetRequiredService<DatabaseService>();
Console.WriteLine(db.GetConnectionString());
\`\`\`

### 六、DI 常见陷阱与最佳实践 ⭐⭐

\`\`\`csharp-snippet
using Microsoft.Extensions.DependencyInjection;

// ===== 陷阱 1：Captured Singleton =====
class BadCache
{
    // ❌ 不要在 Singleton 中持有 Scoped 服务的引用
    // public BadCache(ScopedService scoped) { }  // 会导致 Scoped 变成事实上的 Singleton
}

// ✅ 正确做法：在 Singleton 中使用 IServiceScopeFactory
class GoodCache
{
    private readonly IServiceScopeFactory _scopeFactory;

    public GoodCache(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public void DoWork()
    {
        // 每次操作创建新的 scope
        using var scope = _scopeFactory.CreateScope();
        // var repo = scope.ServiceProvider.GetRequiredService<IScopedRepo>();
        Console.WriteLine("在独立 scope 中执行操作");
    }
}

// ===== 陷阱 2：服务定位器反模式 =====
class BadService
{
    private readonly IServiceProvider _provider;

    // ❌ 不要注入 IServiceProvider 然后到处 GetService
    // public BadService(IServiceProvider provider) { _provider = provider; }
    // public void DoSomething() {
    //     var dep = _provider.GetService<ISomeService>();
    // }
    // ✅ 应该通过构造函数显式注入依赖
}

// ===== 最佳实践汇总 =====
Console.WriteLine("""
DI 最佳实践：
1. 依赖通过接口注册，而非具体类
2. 构造函数注入是首选，避免 [FromServices] / ServiceLocator
3. Singleton 不依赖 Scoped/Transient（用 IServiceScopeFactory）
4. 配置用 IOptions<T> 模式，不要自己读 appsettings.json
5. 注册有顺序：先注册被依赖的，后注册依赖方（DI 容器会自动排序）
6. 测试时用相同接口注册 Mock 实现
""");
\`\`\`

### 七、关键总结

| 概念 | 要点 | 生命周期 |
| --- | --- | --- |
| Transient | 每次解析新建，轻量服务用 | 无状态服务 |
| Scoped | 同一作用域复用 | 数据库连接、请求上下文 |
| Singleton | 全局唯一，线程安全 | 配置、缓存、连接池 |
| 构造函数注入 | 首选方式，依赖显式 | 所有服务 |
| IOptions<T> | 配置注入 | 配置类 |
| IServiceScopeFactory | Singleton 中用 Scoped | 后台服务 |

> **生产建议**：所有服务通过接口注册 + 构造函数注入。配置用 IOptions 模式。测试时替换接口为 Mock。.NET 的 DI 容器性能很好，不需要第三方容器。
`,
  },

  // ============================================================
  // 第五十六章：单元测试入门
  // ============================================================
  {
    id: "csharp2-ch56",
    group: '第九部分 工程化与实战',
    icon: '🧪',
    title: '单元测试入门',
    content: `## 第五十六章　单元测试入门

单元测试是生产开发的基石。本章讲解 xUnit + 断言 + Mock，让你能写出可测试的代码和测试用例。

### 一、为什么需要测试 ⭐⭐⭐

\`\`\`csharp-snippet
// ===== 被测代码：一个价格计算器 =====
class PriceCalculator
{
    // 计算折扣后价格
    public decimal ApplyDiscount(decimal price, decimal discountRate)
    {
        if (price < 0) throw new ArgumentException("价格不能为负");
        if (discountRate < 0 || discountRate > 1)
            throw new ArgumentException("折扣率必须在 0~1 之间");
        return price * (1 - discountRate);
    }

    // 计算含税价
    public decimal AddTax(decimal price, decimal taxRate) =>
        price * (1 + taxRate);

    // 批量计算总价
    public decimal CalculateTotal(List<(decimal price, int qty)> items) =>
        items.Sum(i => i.price * i.qty);
}

// ===== 手动验证（不推荐）=====
var calc = new PriceCalculator();
var result = calc.ApplyDiscount(100m, 0.2m);  // 期望 80
if (result == 80m)
    Console.WriteLine("✅ 折扣测试通过");
else
    Console.WriteLine(\$"❌ 期望 80，实际 {result}");

// 问题：手动验证不可复现、不可回归、无法统计覆盖率
\`\`\`

### 二、xUnit 测试框架 ⭐⭐⭐

\`\`\`csharp-snippet-snippet
// 安装 xUnit（在测试项目中）：
//   dotnet add package xunit
//   dotnet add package xunit.runner.visualstudio
//   dotnet add package Microsoft.NET.Test.Sdk
//
// 测试项目结构：
//   MyProject/
//   MyProject.Tests/
//     -- 引用 MyProject
//     -- 引用 xunit

// ===== 测试文件：PriceCalculatorTests.cs =====
//using Xunit;
//using MyProject;

//public class PriceCalculatorTests
//{
//    private readonly PriceCalculator _calc = new();

//    [Fact]  // 标记为单个测试
//    public void ApplyDiscount_正常折扣_返回折扣价()
//    {
//        // Arrange
//        var calc = new PriceCalculator();
//        // Act
//        var result = calc.ApplyDiscount(100m, 0.2m);
//        // Assert
//        Assert.Equal(80m, result);
//    }

//    [Fact]
//    public void ApplyDiscount_负价格_抛异常()
//    {
//        var calc = new PriceCalculator();
//        Assert.Throws<ArgumentException>(
//            () => calc.ApplyDiscount(-100m, 0.2m)
//        );
//    }

//    [Fact]
//    public void ApplyDiscount_折扣率超出范围_抛异常()
//    {
//        var calc = new PriceCalculator();
//        Assert.Throws<ArgumentException>(
//            () => calc.ApplyDiscount(100m, 1.5m)
//        );
//    }

//    [Theory]  // 参数化测试
//    [InlineData(100, 0, 100)]     // 无折扣
//    [InlineData(100, 0.1, 90)]    // 9折
//    [InlineData(100, 0.5, 50)]    // 5折
//    [InlineData(100, 1, 0)]        // 免费
//    public void ApplyDiscount_多种折扣率_计算正确(
//        decimal price, decimal discount, decimal expected)
//    {
//        var calc = new PriceCalculator();
//        var result = calc.ApplyDiscount(price, discount);
//        Assert.Equal(expected, result);
//    }
//}

// 运行测试：
//   dotnet test
\`\`\`

### 三、AAA 模式（Arrange-Act-Assert） ⭐⭐⭐

\`\`\`csharp-snippet-snippet
//using Xunit;

//public class CartServiceTests
//{
//    [Fact]
//    public void Checkout_有商品_计算总价正确()
//    {
//        // Arrange（准备）
//        var repo = new MockProductRepository();
//        var calc = new PriceCalculator();
//        var cart = new CartService(repo, calc);
//        var items = new List<(decimal, int)>
//        {
//            (99.0m, 2),   // 99元 x 2 = 198
//            (50.0m, 3),   // 50元 x 3 = 150
//        };

//        // Act（执行）
//        var total = cart.CalculateTotal(items);

//        // Assert（断言）
//        Assert.Equal(348m, total);
//    }
//}

//class MockProductRepository : IProductRepository
//{
//    public List<string> GetAll() => ["P001", "P002"];
//}

//interface IProductRepository { List<string> GetAll(); }
//class PriceCalculator
//{
//    public decimal CalculateTotal(List<(decimal price, int qty)> items) =>
//        items.Sum(i => i.price * i.qty);
//}
//class CartService(IProductRepository repo, PriceCalculator calc)
//{
//    public decimal CalculateTotal(List<(decimal price, int qty)> items) =>
//        calc.CalculateTotal(items);
//}
\`\`\`

### 四、Mock 与依赖隔离 ⭐⭐⭐

\`\`\`csharp-snippet-snippet
// 安装：dotnet add package Moq

//using Moq;
//using Xunit;

// 被测代码
//interface IEmailService { bool Send(string to, string body); }
//interface IProductRepository { string GetName(int id); }

//class OrderService(IEmailService email, IProductRepository repo)
//{
//    public bool PlaceOrder(int productId, string customerEmail)
//    {
//        var name = repo.GetName(productId);
//        if (string.IsNullOrEmpty(name)) return false;
//        return email.Send(customerEmail, $"订单: {name}");
//    }
//}

//public class OrderServiceTests
//{
//    [Fact]
//    public void PlaceOrder_产品存在_发送邮件()
//    {
//        // Arrange：用 Moq 创建 Mock
//        var mockEmail = new Mock<IEmailService>();
//        var mockRepo = new Mock<IProductRepository>();
//
//        // 设置 Mock 行为
//        mockRepo.Setup(r => r.GetName(1)).Returns("iPhone");
//        mockEmail.Setup(e => e.Send("a@b.com", It.Is<string>(s => s.Contains("iPhone"))))
//                .Returns(true);
//
//        var service = new OrderService(mockEmail.Object, mockRepo.Object);
//
//        // Act
//        var result = service.PlaceOrder(1, "a@b.com");
//
//        // Assert
//        Assert.True(result);
//        mockEmail.Verify(e => e.Send("a@b.com", It.IsAny<string>()), Times.Once);
//        mockRepo.Verify(r => r.GetName(1), Times.Once);
//    }
//
//    [Fact]
//    public void PlaceOrder_产品不存在_不发邮件()
//    {
//        var mockEmail = new Mock<IEmailService>();
//        var mockRepo = new Mock<IProductRepository>();
//
//        mockRepo.Setup(r => r.GetName(99)).Returns("");  // 返回空
//
//        var service = new OrderService(mockEmail.Object, mockRepo.Object);
//        var result = service.PlaceOrder(99, "a@b.com");
//
//        Assert.False(result);
//        mockEmail.Verify(e => e.Send(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
//    }
//}
\`\`\`

### 五、可运行 demo：MiniTestRunner ⭐⭐

下面是一个完整可运行的测试框架模拟，让你在浏览器中体验单元测试：

\`\`\`csharp-snippet
// MiniTestRunner：一个极简测试框架
class TestResult(string name, bool passed, string? error = null)
{
    public string Name => name;
    public bool Passed => passed;
    public string? Error => error;

    public override string ToString() =>
        passed ? \$/"  ✅ {name}" : \$/"  ❌ {name}\\n     {error}";
}

class TestRunner
{
    private readonly List<TestResult> _results = [];

    // 注册并执行单个测试
    public void Run(string name, Action test)
    {
        try
        {
            test();
            _results.Add(new TestResult(name, true));
        }
        catch (Exception ex)
        {
            _results.Add(new TestResult(name, false, ex.Message));
        }
    }

    // 断言方法
    public static void AssertEqual<T>(T expected, T actual)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
            throw new Exception(\$"期望 {expected}，实际 {actual}");
    }

    public static void AssertTrue(bool condition, string message = "条件为 false")
    {
        if (!condition) throw new Exception(message);
    }

    public static void AssertThrows<T>(Action action) where T : Exception
    {
        try
        {
            action();
            throw new Exception(\$"期望抛出 {typeof(T).Name}，但没有");
        }
        catch (T) { /* 预期异常 */ }
        catch (Exception ex) when (ex.Message.Contains("期望抛出"))
        {
            throw;  // 重新抛出"未抛出异常"的断言失败
        }
    }

    public void PrintReport()
    {
        int passed = _results.Count(r => r.Passed);
        int failed = _results.Count - passed;
        Console.WriteLine(\$"\\n=== 测试报告 ===\\n通过: {passed} / 失败: {failed} / 总计: {_results.Count}\\n");
        foreach (var r in _results)
            Console.WriteLine(r);
        Console.WriteLine(failed == 0 ? "\\n🎉 全部通过！" : \$"\\n⚠️ {failed} 个测试失败");
    }
}

// ===== 被测代码 =====
class MathHelper
{
    public int Add(int a, int b) => a + b;
    public int Divide(int a, int b) =>
        b == 0 ? throw new DivideByZeroException() : a / b;
    public bool IsPrime(int n)
    {
        if (n < 2) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
        for (int i = 3; i * i <= n; i += 2)
            if (n % i == 0) return false;
        return true;
    }
}

// ===== 运行测试 =====
var runner = new TestRunner();
var math = new MathHelper();

// 正常用例
runner.Run("Add_两个正数", () =>
    TestRunner.AssertEqual(5, math.Add(2, 3)));

runner.Run("Add_负数", () =>
    TestRunner.AssertEqual(-1, math.Add(2, -3)));

runner.Run("Divide_正常", () =>
    TestRunner.AssertEqual(5, math.Divide(20, 4)));

runner.Run("Divide_除零异常", () =>
    TestRunner.AssertThrows<DivideByZeroException>(
        () => math.Divide(10, 0)));

// 参数化测试模拟
int[] primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
foreach (var p in primes)
{
    var num = p;
    runner.Run(\$"IsPrime_{num}", () =>
        TestRunner.AssertTrue(math.IsPrime(num), \$"{num} 应该是质数"));
}

int[] nonPrimes = [0, 1, 4, 6, 8, 9, 10, 12, 15, 21];
foreach (var np in nonPrimes)
{
    var num = np;
    runner.Run(\$"NotPrime_{num}", () =>
        TestRunner.AssertTrue(!math.IsPrime(num), \$"{num} 不应该是质数"));
}

runner.PrintReport();
\`\`\`

### 六、测试最佳实践 ⭐⭐

\`\`\`csharp-snippet
// ===== 好的测试：命名清晰、单一职责 =====
class GoodTests
{
    // ✅ 命名：方法_条件_期望
    public void ApplyDiscount_Price100_Discount20_Returns80() { }
    public void ApplyDiscount_NegativePrice_ThrowsException() { }
    public void AddTax_PriceZero_ReturnsZero() { }

    // ✅ 每个测试只验证一件事
    // ✅ 测试不依赖执行顺序
    // ✅ 测试不依赖外部状态（数据库、文件、网络）
}

// ===== 测试反模式 =====
class BadTests
{
    // ❌ 测试多个不相关的东西
    public void TestEverything()
    {
        // 测了 Add 又测 Divide 又测 IsPrime
        // 失败时不知道哪个逻辑有问题
    }

    // ❌ 依赖共享状态
    // private static int _counter = 0;
    // public void TestCounter() { _counter++; AssertEqual(1, _counter); }

    // ❌ 依赖网络/文件系统
    // public void TestFromFile() { var data = File.ReadAllText("data.txt"); }
}

Console.WriteLine("""
测试最佳实践：
1. 命名：Method_Condition_Expected
2. 每个 [Fact] 只测一件事
3. 测试不依赖执行顺序和共享状态
4. 不依赖外部资源（DB/文件/网络）
5. 用 [Theory] + [InlineData] 做参数化
6. Mock 外部依赖，测自己的逻辑
7. 先写测试（TDD），或至少改代码后立即跑测试
8. 目标覆盖率 70%+，核心逻辑 90%+
""");
\`\`\`

### 七、关键总结

| 概念 | 工具/库 | 用途 |
| --- | --- | --- |
| xUnit | \`dotnet add package xunit\` | 测试框架 |
| \`[Fact]\` | xUnit | 标记单个测试 |
| \`[Theory]\` + \`[InlineData]\` | xUnit | 参数化测试 |
| \`Assert.Equal\` | xUnit | 相等断言 |
| \`Assert.Throws\` | xUnit | 异常断言 |
| Moq | \`dotnet add package Moq\` | Mock 框架 |
| AAA 模式 | Arrange-Act-Assert | 测试结构 |
| \`dotnet test\` | CLI | 运行测试 |

> **生产建议**：测试项目与主项目分离。每个公开方法至少有正常路径 + 边界 + 异常三类测试。改代码后先跑 \`dotnet test\` 再提交。CI/CD 中测试不过禁止合并。
`,
  },

  // ============================================================
  // 第五十七章：ASP.NET Core 入门
  // ============================================================
  {
    id: "csharp2-ch57",
    group: '第九部分 工程化与实战',
    icon: '🌐',
    title: 'ASP.NET Core 入门',
    content: `## 第五十七章　ASP.NET Core 入门

ASP.NET Core 是 .NET 的 Web 框架。本章用 Minimal API 讲解路由、请求响应、中间件和 DI 整合，让你写出第一个 Web API。

### 一、第一个 Web API ⭐⭐⭐

\`\`\`csharp-snippet-snippet
// Program.cs（.NET 8 Minimal API）
// 需要安装：dotnet new web -n MyApi

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 最简单的路由：GET /
app.MapGet("/", () => "Hello, ASP.NET Core!");

// 路由参数
app.MapGet("/users/{id:int}", (int id) =>
    Results.Ok(new { Id = id, Name = "张三" }));

// POST 接收 JSON
app.MapPost("/users", (CreateUserRequest req) =>
{
    var user = new { Id = Random.Shared.Next(1, 1000), req.Name, req.Email };
    return Results.Created(\$"/users/{user.Id}", user);
});

app.Run();

// 请求/响应模型
record CreateUserRequest(string Name, string Email);

// 运行：dotnet run
// 测试：
//   curl http://localhost:5000/
//   curl http://localhost:5000/users/42
//   curl -X POST http://localhost:5000/users \\
//     -H "Content-Type: application/json" \\
//     -d '{"name":"李四","email":"li@example.com"}'
\`\`\`

### 二、路由详解 ⭐⭐⭐

\`\`\`csharp-snippet-snippet
// 各种路由约束
app.MapGet("/products/{id:int}", (int id) => \$/"产品 {id}");
app.MapGet("/orders/{id:guid}", (Guid id) => \$/"订单 {id}");
app.MapGet("/search/{query:minlength(2)}", (string query) => \$/"搜索: {query}");
app.MapGet("/page/{page:int:min(1)}", (int page) => \$/"第 {page} 页");

// 可选路由参数
app.MapGet("/items/{id?}", (int? id) =>
    id is null ? "所有商品" : \$/"商品 {id}");

// 通配路由
app.MapGet("/files/{**path}", (string path) => \$/"文件: {path}");

// 查询参数
app.MapGet("/search", (string? q, int? page, int? size) =>
    Results.Ok(new { q, page = page ?? 1, size = size ?? 20 }));

// 多个 HTTP 方法
app.MapGet("/api/users", () => "GET");
app.MapPost("/api/users", () => "POST");
app.MapPut("/api/users/{id}", (int id) => \$/"PUT {id}");
app.MapDelete("/api/users/{id}", (int id) => \$/"DELETE {id}");

// 从 Header 读取
app.MapGet("/auth", (string? authorization) =>
    authorization ?? "无 Authorization 头");
\`\`\`

### 三、请求模型与验证 ⭐⭐⭐

\`\`\`csharp-snippet-snippet
// 请求模型
record CreateProductRequest(
    string Name,
    decimal Price,
    int Stock,
    string? Category);

app.MapPost("/products", (CreateProductRequest req) =>
{
    // 手动验证
    var errors = new Dictionary<string, string[]>();
    if (string.IsNullOrWhiteSpace(req.Name))
        errors["name"] = ["名称不能为空"];
    if (req.Price <= 0)
        errors["price"] = ["价格必须大于 0"];
    if (req.Stock < 0)
        errors["stock"] = ["库存不能为负"];

    if (errors.Count > 0)
        return Results.ValidationProblem(errors);

    var product = new
    {
        Id = Random.Shared.Next(1, 1000),
        req.Name,
        req.Price,
        req.Stock,
        req.Category
    };
    return Results.Created(\$/"/products/{product.Id}", product);
});

// 响应模型
record ProductResponse(int Id, string Name, decimal Price, int Stock, string? Category);

// 返回类型化结果
app.MapGet("/products/{id}", (int id) =>
    Results.Ok(new ProductResponse(id, "测试产品", 99.00m, 100, "电子")));
\`\`\`

### 四、中间件管道 ⭐⭐⭐

\`\`\`csharp-snippet-snippet
// 中间件按注册顺序执行，形成管道
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 自定义中间件
app.Use(async (context, next) =>
{
    // 请求前
    Console.WriteLine(\$"→ {context.Request.Method} {context.Request.Path}");

    await next();  // 调用下一个中间件

    // 响应后
    Console.WriteLine(\$"← {context.Response.StatusCode}");
});

// 异常处理中间件（放在最前面）
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(\$"{{\\"error\\": \\"{ex.Message}\\"}}");
    }
});

// 路由中间件
app.MapGet("/", () => "Hello!");
app.MapGet("/error", () => { throw new Exception("手动抛出"); });

app.Run();
\`\`\`

### 五、整合 DI + 配置 ⭐⭐⭐

\`\`\`csharp-snippet-snippet
var builder = WebApplication.CreateBuilder(args);

// 1. 注册服务到 DI
builder.Services.AddSingleton<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// 2. 配置 Options
builder.Services.Configure<ApiOptions>(builder.Configuration.GetSection("Api"));

var app = builder.Build();

// 3. 通过 DI 注入到路由处理函数
app.MapGet("/products", (IProductService svc) =>
    Results.Ok(svc.GetAll()));

app.MapPost("/orders", (IOrderService svc, CreateOrderRequest req) =>
{
    var id = svc.Create(req);
    return Results.Created(\$/"/orders/{id}", new { id });
});

app.Run();

// 服务定义
interface IProductService { List<string> GetAll(); }
class ProductService : IProductService
{
    public List<string> GetAll() => ["P1", "P2", "P3"];
}

interface IOrderService { int Create(CreateOrderRequest req); }
class OrderService : IOrderService
{
    public int Create(CreateOrderRequest req) => Random.Shared.Next(1, 1000);
}

record CreateOrderRequest(string ProductId, int Quantity);

class ApiOptions { public int MaxItems { get; set; } = 100; }
\`\`\`

### 六、可运行 demo：内存版 Mini API ⭐⭐

下面是一个完整可运行的内存版 Web API 模拟器（不依赖真实 HTTP）：

\`\`\`csharp-snippet
// MiniApi：模拟 ASP.NET Core 的路由和请求处理
class HttpRequest(string method, string path, string? body = null)
{
    public string Method => method;
    public string Path => path;
    public string? Body => body;
}

class HttpResponse(int statusCode, string body)
{
    public int StatusCode => statusCode;
    public string Body => body;
}

class MiniApi
{
    private readonly List<(string method, string path, Func<HttpRequest, HttpResponse> handler)> _routes = [];

    // 注册路由
    public void MapGet(string path, Func<HttpRequest, HttpResponse> handler) =>
        _routes.Add(("GET", path, handler));

    public void MapPost(string path, Func<HttpRequest, HttpResponse> handler) =>
        _routes.Add(("POST", path, handler));

    // 处理请求
    public HttpResponse Send(HttpRequest request)
    {
        foreach (var (method, path, handler) in _routes)
        {
            if (method == request.Method && path == request.Path)
                return handler(request);
        }
        return new HttpResponse(404, \$/"{request.Method} {request.Path} 未找到");
    }
}

// ===== 搭建 API =====
var api = new MiniApi();
var products = new List<(int Id, string Name, decimal Price)>
{
    (1, "iPhone", 7999m),
    (2, "iPad", 4999m),
    (3, "MacBook", 12999m)
};

// GET /products — 获取所有产品
api.MapGet("/products", _ =>
    new HttpResponse(200, string.Join("\\n",
        products.Select(p => \$/"[{p.Id}] {p.Name} ¥{p.Price}"))));

// GET /products/{id} — 获取单个产品（简化版）
api.MapGet("/products/1", _ =>
    new HttpResponse(200, \$/"产品: {products[0].Name} ¥{products[0].Price}"));
api.MapGet("/products/2", _ =>
    new HttpResponse(200, \$/"产品: {products[1].Name} ¥{products[1].Price}"));
api.MapGet("/products/3", _ =>
    new HttpResponse(200, \$/"产品: {products[2].Name} ¥{products[2].Price}"));

// POST /products — 创建产品
api.MapPost("/products", req =>
{
    // 简化：解析 body "name,price"
    var parts = (req.Body ?? "").Split(',');
    if (parts.Length < 2)
        return new HttpResponse(400, "格式: name,price");
    var name = parts[0].Trim();
    if (!decimal.TryParse(parts[1].Trim(), out var price))
        return new HttpResponse(400, "价格格式错误");
    if (price <= 0)
        return new HttpResponse(400, "价格必须大于 0");

    var newId = products.Max(p => p.Id) + 1;
    products.Add((newId, name, price));
    return new HttpResponse(201, \$/"创建成功: [{newId}] {name} ¥{price}");
});

// ===== 测试 API =====
Console.WriteLine("=== 测试 MiniApi ===\\n");

// 获取所有产品
var r1 = api.Send(new HttpRequest("GET", "/products"));
Console.WriteLine(\$"GET /products -> {r1.StatusCode}\\n{r1.Body}\\n");

// 获取单个产品
var r2 = api.Send(new HttpRequest("GET", "/products/2"));
Console.WriteLine(\$"GET /products/2 -> {r2.StatusCode}\\n{r2.Body}\\n");

// 创建产品（正常）
var r3 = api.Send(new HttpRequest("POST", "/products", "AirPods, 1999"));
Console.WriteLine(\$"POST /products (正常) -> {r3.StatusCode}\\n{r3.Body}\\n");

// 创建产品（验证失败）
var r4 = api.Send(new HttpRequest("POST", "/products", "Test, -100"));
Console.WriteLine(\$"POST /products (验证失败) -> {r4.StatusCode}\\n{r4.Body}\\n");

// 验证创建成功
var r5 = api.Send(new HttpRequest("GET", "/products"));
Console.WriteLine(\$"再次 GET /products -> {r5.StatusCode}\\n{r5.Body}\\n");

// 404 测试
var r6 = api.Send(new HttpRequest("DELETE", "/products/1"));
Console.WriteLine(\$"DELETE /products/1 -> {r6.StatusCode}\\n{r6.Body}");
\`\`\`

### 七、关键总结

| 概念 | API | 用途 |
| --- | --- | --- |
| Minimal API | \`MapGet/MapPost/MapPut/MapDelete\` | 路由注册 |
| 路由约束 | \`{id:int}\`, \`{id:guid}\` | 参数验证 |
| \`Results.Ok()\` | 200 | 成功响应 |
| \`Results.Created()\` | 201 | 创建响应 |
| \`Results.ValidationProblem()\` | 400 | 验证错误 |
| 中间件 | \`app.Use(async (ctx, next) => ...)\` | 请求管道 |
| DI 注入 | 路由参数 | 服务注入 |
| Options | \`IOptions<T>\` | 配置注入 |

> **生产建议**：新项目用 Minimal API + DI + IOptions。API 版本化从第一天就规划。验证用 Problem Details 标准格式。中间件只放跨切面逻辑（日志、异常、认证）。
`,
  },
];

export { chapters };
