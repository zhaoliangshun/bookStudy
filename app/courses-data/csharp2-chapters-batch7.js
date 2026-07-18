// =============================================================
// C# 从入门到精通大全 - 第七批章节（第七部分 高级特性，共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp2-ch33 : 第三十三章 模式匹配
//   csharp2-ch34 : 第三十四章 record 记录类型
//   csharp2-ch35 : 第三十五章 反射
//   csharp2-ch36 : 第三十六章 特性 Attribute
//   csharp2-ch37 : 第三十七章 匿名类型与 dynamic
//   csharp2-ch38 : 第三十八章 协变与逆变
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// ⭐ 标记为日常开发高频知识点；模式匹配与 record 是现代 C# 高频核心。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十三章：模式匹配
  // ============================================================
  {
    id: 'csharp2-ch33',
    group: '第七部分 高级特性',
    icon: '🧩',
    title: '第三十三章 模式匹配',
    content: `## 第三十三章　模式匹配

模式匹配（Pattern Matching）让「检查数据形状 + 提取数据」合二为一，取代繁琐的 \`if-else + as\` 组合。C# 7 起引入，C# 8+ 大幅扩展，到 C# 11/12 已是日常开发核心语法。

> ⭐ 模式匹配是现代 C# 高频特性，写业务代码几乎每天用。本章为重点。

### 一、为什么需要模式匹配

先看传统写法 vs 模式匹配的对比：

\`\`\`csharp
object obj = "hello";

// 传统写法：判断类型 + 强转，啰嗦还容易出错
if (obj is string)
{
    string s = (string)obj;
    Console.WriteLine($"长度 {s.Length}");
}

// 模式匹配：声明+类型检查+赋值一步到位
if (obj is string s2)
{
    Console.WriteLine($"长度 {s2.Length}");
}
\`\`\`

模式匹配的本质：**用一个表达式同时回答两个问题**——「数据是不是这个形状」+「如果是，把内部数据提取出来」。

### 二、is 表达式与类型模式 ⭐

\`\`\`csharp
// is 类型模式：检查并赋值
object[] things = { 42, "hi", 3.14, true, null };
foreach (var o in things)
{
    // 类型模式：匹配类型并把值绑定到变量
    if (o is int n) Console.WriteLine($"整数 {n}");
    else if (o is string s) Console.WriteLine($"字符串长度 {s.Length}");
    else if (o is double d) Console.WriteLine($"浮点 {d:F2}");
    else if (o is bool b) Console.WriteLine($"布尔 {b}");
    else if (o is null) Console.WriteLine("空值");
}
\`\`\`

要点：
- \`o is int n\` 等价于「o 是 int 吗？是则赋值给 n」。
- 在 if 分支里 n 已是 int 类型，编译器保证。
- 链式 if-else 在 C# 8 后可改成 \`switch\` 更清晰。

### 三、switch 表达式（C# 8+）⭐

switch 表达式是「表达式」而非「语句」，能直接返回值，是模式匹配主战场。

\`\`\`csharp
// 传统 switch 语句：啰嗦，每个 case 都要 return/break
string Describe(object o)
{
    switch (o)
    {
        case int n when n > 0: return "正整数";
        case int n when n < 0: return "负整数";
        case int n: return "零";
        case string s: return $"字符串：{s}";
        case null: return "空";
        default: return "其他";
    }
}

// switch 表达式：表达式化、模式化，紧凑直观
string Describe2(object o) => o switch
{
    int n when n > 0 => "正整数",
    int n when n < 0 => "负整数",
    int => "零",                        // 丢弃变量名，只关心类型
    string s => $"字符串：{s}",
    null => "空",
    _ => "其他"                          // _ 默认分支，必须放最后
};

Console.WriteLine(Describe2(42));     // 正整数
Console.WriteLine(Describe2(-7));     // 负整数
Console.WriteLine(Describe2(0));      // 零
Console.WriteLine(Describe2("hi"));   // 字符串：hi
\`\`\`

要点：
- \`=>\` 后跟表达式，多个分支用逗号分隔。
- \`_\` 是「丢弃模式」，等价 default，必须放最后。
- 编译器会检查穷尽性（enum 缺分支会警告）。

### 四、属性模式 ⭐

按对象属性的形状匹配：

\`\`\`csharp
public record Point(double X, double Y);

string Classify(Point p) => p switch
{
    { X: 0, Y: 0 } => "原点",
    { X: 0 } => "Y 轴上",
    { Y: 0 } => "X 轴上",
    { X: var x, Y: var y } when x == y => "对角线上",
    { X: > 0, Y: > 0 } => "第一象限",
    { X: < 0, Y: > 0 } => "第二象限",
    { X: < 0, Y: < 0 } => "第三象限",
    { X: > 0, Y: < 0 } => "第四象限",
    _ => "未知"
};

Console.WriteLine(Classify(new Point(0, 0)));     // 原点
Console.WriteLine(Classify(new Point(3, 3)));     // 对角线上
Console.WriteLine(Classify(new Point(-1, 2)));    // 第二象限
\`\`\`

属性模式语法：\`{ 属性名: 模式, 属性名: 模式 }\`，可嵌套。

### 五、位置模式

配合 \`Deconstruct\` 解构方法（record 自动生成），按位置匹配：

\`\`\`csharp
public record Size(int Width, int Height);

string Describe(Size s) => s switch
{
    (0, 0) => "空",
    ( > 0, > 0) => $"正常 {s.Width}x{s.Height}",
    (var w, var h) => $"异常 w={w} h={h}"
};

Console.WriteLine(Describe(new Size(800, 600)));  // 正常 800x600
Console.WriteLine(Describe(new Size(0, 0)));      // 空
\`\`\`

位置模式按解构顺序匹配，每个位置可以是常量、关系（>0）、变量绑定。

### 六、when 守卫

模式之后追加条件，类似 SQL 的 WHERE：

\`\`\`csharp
decimal CalcDiscount(int points, bool vip) => (points, vip) switch
{
    ( >= 1000, true) => 0.7m,    // 满千且 VIP：7 折
    ( >= 1000, false) => 0.8m,
    ( >= 500, true) => 0.85m,
    ( >= 500, false) => 0.9m,
    (_, true) => 0.95m,
    _ => 1.0m
};

Console.WriteLine(CalcDiscount(1200, true));   // 0.7
Console.WriteLine(CalcDiscount(600, false));  // 0.9
\`\`\`

\`when\` 用于复杂条件，让模式更精确。

### 七、元组模式

直接对元组做模式匹配，避免一堆 if：

\`\`\`csharp
string ClassifyHttp(int code, string method) => (code, method) switch
{
    (200, "GET") => "OK 取到了",
    (200, "POST") => "创建成功",
    (404, _) => "资源不存在",
    (500, _) => "服务器错误",
    (_, "DELETE") => "删除结果",
    _ => "其他"
};
\`\`\`

元组模式在状态机、规则引擎中极常用。

### 八、列表模式（C# 11+）⭐

按数组/列表的结构匹配：

\`\`\`csharp
string Describe(int[] arr) => arr switch
{
    [] => "空数组",
    [var single] => $"单元素 {single}",
    [var first, var last] => $"两元素 {first},{last}",
    [0, .., 0] => "首尾都是 0",                    // .. 切片模式
    [var first, .. var middle, var last] => $"头={first} 尾={last} 中间{middle.Length}个"
};

Console.WriteLine(Describe(new[] { 1, 2, 3, 4 }));  // 头=1 尾=4 中间2个
Console.WriteLine(Describe(new[] { 0, 1, 0 }));     // 首尾都是 0
Console.WriteLine(Describe(Array.Empty<int>()));    // 空数组
\`\`\`

\`..\` 是切片模式，匹配「零或多个元素」，配合 var 可绑定到中间部分。

### 九、模式匹配 vs if-else

\`\`\`csharp
// 传统 if-else 风格：可读性差，分支多了就乱
string OldWay(int n)
{
    if (n > 100) return "大";
    else if (n > 50) return "中";
    else if (n > 10) return "小";
    else return "微";
}

// 模式匹配：声明式，逻辑一目了然
string NewWay(int n) => n switch
{
    > 100 => "大",
    > 50 => "中",
    > 10 => "小",
    _ => "微"
};
\`\`\`

模式匹配优势：
1. **可读性**：分支结构清晰，每条规则一个箭头。
2. **不可变性**：表达式无副作用，便于函数式编程。
3. **编译器检查**：穷尽性、未使用分支会警告。
4. **可组合**：嵌套模式层层解构。

### 十、实战 demo：简易 HTTP 路由分发

\`\`\`csharp
public record Request(string Method, string Path, string Body);

string Dispatch(Request req) => req switch
{
    { Method: "GET", Path: "/" } => "首页",
    { Method: "GET", Path: "/users" } => "用户列表",
    { Method: "GET", Path: var p } when p.StartsWith("/users/") => $"用户详情 {p[7..]}",
    { Method: "POST", Path: "/users", Body: var b } => $"创建用户：{b}",
    { Method: "DELETE", Path: var p } when p.StartsWith("/users/") => $"删除用户 {p[7..]}",
    _ => "404 未找到"
};

Console.WriteLine(Dispatch(new Request("GET", "/", "")));              // 首页
Console.WriteLine(Dispatch(new Request("GET", "/users/42", "")));     // 用户详情 42
Console.WriteLine(Dispatch(new Request("POST", "/users", "张三")));    // 创建用户：张三
Console.WriteLine(Dispatch(new Request("DELETE", "/users/1", "")));   // 删除用户 1
\`\`\`

### 小结

- 模式匹配 = 检查形状 + 提取数据，一个表达式干两件事。
- \`is 类型 变量\` 取代 \`is + as\`；\`switch 表达式\` 取代繁琐的 switch 语句。
- 关键模式：类型、属性、位置、元组、列表、关系（>0）、\`when\` 守卫。
- 列表模式 + 切片（\`..\`）是 C# 11 新增，处理数组结构超方便。
- ⭐ 现代 C# 业务代码大量使用模式匹配——尤其是路由分发、状态机、规则引擎。`,
  },

  // ============================================================
  // 第三十四章：record 记录类型
  // ============================================================
  {
    id: 'csharp2-ch34',
    group: '第七部分 高级特性',
    icon: '🏷️',
    title: '第三十四章 record 记录类型',
    content: `## 第三十四章　record 记录类型

record（记录类型，C# 9 引入）是为「数据建模」量身打造的引用类型——它默认提供值相等、不可变性、\`with\` 表达式、解构等功能，写 DTO/值对象/消息体**几乎必选**。

> ⭐ record 是现代 C# 高频特性。但凡你写「数据载体」，第一选择就是 record。

### 一、为什么需要 record

先用传统 class 写一个数据类，看啰嗦在哪：

\`\`\`csharp
// 传统 class 写一个数据类：要重写 Equals/GetHashCode/ToString，否则按引用比较
public class PointClass
{
    public int X { get; init; }
    public int Y { get; init; }

    public PointClass(int x, int y) { X = x; Y = y; }

    public override bool Equals(object? obj) =>
        obj is PointClass p && X == p.X && Y == p.Y;

    public override int GetHashCode() => HashCode.Combine(X, Y);

    public override string ToString() => $"Point({X}, {Y})";
}

// record 一行搞定：上面那些方法编译器自动生成
public record PointRecord(int X, int Y);

var p1 = new PointRecord(1, 2);
var p2 = new PointRecord(1, 2);
Console.WriteLine(p1 == p2);   // True —— 值相等，不是引用相等
Console.WriteLine(p1);         // PointRecord { X = 1, Y = 2 }
\`\`\`

record 自动生成：构造函数、\`Equals\`/\`GetHashCode\`（按所有字段值比较）、\`ToString\`（漂亮打印）、\`Deconstruct\`（解构）。

### 二、record 定义：主构造函数 ⭐

\`\`\`csharp
// 最常用：主构造函数形式，参数即属性
public record User(string Name, int Age);

var u = new User("张三", 28);
Console.WriteLine(u.Name);          // 张三
Console.WriteLine(u.Age);           // 28
Console.WriteLine(u);               // User { Name = 张三, Age = 28 }

// 也可加额外成员
public record Product(int Id, string Name, decimal Price)
{
    public string DisplayName => $"{Name} - ¥{Price}";   // 计算属性
    public decimal DiscountedPrice => Price * 0.9m;
}

var p = new Product(1, "鼠标", 100);
Console.WriteLine(p.DisplayName);          // 鼠标 - ¥100
Console.WriteLine(p.DiscountedPrice);      // 90
\`\`\`

主构造函数参数自动转成 \`init\` 只读属性，外部无法修改。

### 三、with 表达式：不可变修改 ⭐

record 是不可变的——要「修改」用 \`with\` 创建副本：

\`\`\`csharp
public record Point(int X, int Y);

var p1 = new Point(3, 4);
// var p2 = new Point(10, 4);  // 传统写法要全参数
var p2 = p1 with { X = 10 };    // 只改 X，Y 保持不变
Console.WriteLine(p2);          // Point { X = 10, Y = 4 }

// 嵌套 record：with 也要嵌套修改
public record Box(Point TopLeft, Point BottomRight);

var b1 = new Box(new Point(0, 0), new Point(100, 100));
var b2 = b1 with { TopLeft = b1.TopLeft with { X = 10 } };
Console.WriteLine(b2);
// Box { TopLeft = Point { X = 10, Y = 0 }, BottomRight = Point { X = 100, Y = 100 } }
\`\`\`

\`with\` 创建新对象，**原对象保持不变**——这是函数式编程的核心思想，并发安全。

### 四、值相等 ⭐

record 的相等按字段值，不按引用：

\`\`\`csharp
public record Money(decimal Amount, string Currency);

var m1 = new Money(100, "CNY");
var m2 = new Money(100, "CNY");
var m3 = new Money(200, "CNY");

Console.WriteLine(m1 == m2);     // True —— 值相等
Console.WriteLine(m1.Equals(m2)); // True
Console.WriteLine(m1 == m3);     // False —— 金额不同
Console.WriteLine(m1 != m3);     // True

// 对比 class
public class MoneyClass { public decimal Amount; public string Currency; }
var c1 = new MoneyClass { Amount = 100, Currency = "CNY" };
var c2 = new MoneyClass { Amount = 100, Currency = "CNY" };
Console.WriteLine(c1 == c2);     // False —— class 默认按引用比较
\`\`\`

record 默认实现值相等，无需手写 \`Equals\`/\`GetHashCode\`。

### 五、init 属性：只读初始化

\`\`\`csharp
public record Person
{
    public string Name { get; init; } = "";
    public int Age { get; init; }
}

var p = new Person { Name = "李四", Age = 25 };
// p.Name = "王五";  // 编译错误！init 只能在构造时赋值
var p2 = p with { Name = "王五" };   // OK，with 创建新对象
\`\`\`

\`init\` 介于 \`set\` 和 \`get\` 之间：构造期可写，构造完只读——不可变性的关键。

### 六、record struct（C# 10）

普通 record 是引用类型（堆上分配），\`record struct\` 是值类型：

\`\`\`csharp
// 引用类型 record：分配在堆上
public record class PointRef(int X, int Y);

// 值类型 record：分配在栈上
public record struct PointStruct(int X, int Y);

var pr = new PointRef(1, 2);
var ps = new PointStruct(1, 2);

// 值相等：两种 record 都按值比较
Console.WriteLine(new PointStruct(1, 2) == new PointStruct(1, 2));  // True

// with 也都支持
var ps2 = ps with { X = 10 };
\`\`\`

何时用 \`record struct\`？数据小（< 16 字节）、需要按值传递、不需要堆分配——比如 Point、Size、Color。

### 七、record class

\`record\` 默认就是 \`record class\`，可显式写出：

\`\`\`csharp
public record class Animal(string Name);    // 显式 class
public record Animal2(string Name);        // 简写，等价

// 继承：record class 可继承另一个 record class
public record Dog(string Name, string Breed) : Animal(Name);

var d = new Dog("旺财", "拉布拉多");
Console.WriteLine(d);    // Dog { Name = 旺财, Breed = 拉布拉多 }
\`\`\`

注意：record struct 不可继承，只能继承 record class。

### 八、主构造函数与 init-only

\`\`\`csharp
// 主构造函数参数自动成为 init 属性
public record Order(int Id, string Customer, List<OrderLine> Lines)
{
    public decimal Total => Lines.Sum(l => l.Subtotal);
}

public record OrderLine(string Product, int Qty, decimal Price)
{
    public decimal Subtotal => Qty * Price;
}

var order = new Order(1, "张三", new List<OrderLine>
{
    new("鼠标", 2, 100),
    new("键盘", 1, 200)
});

Console.WriteLine(order.Total);   // 400
\`\`\`

注意：record 的「只读」只针对 init 属性本身，**集合内部仍可变**——若要完全不可变，集合要包成 \`IReadOnlyList\` 或用 \`ImmutableList\`。

### 九、Deconstruct 解构

record 自动生成 \`Deconstruct\`，可直接解构成元组：

\`\`\`csharp
public record Point(int X, int Y);

var p = new Point(3, 4);
var (x, y) = p;                  // 调用 Deconstruct
Console.WriteLine($@"{x},{y}");  // 3,4

// 多个变量同时解构
var (px, py) = new Point(10, 20);
Console.WriteLine($@"{px},{py}");  // 10,20
\`\`\`

解构让 record 在元组场景、模式匹配中无缝对接。

### 十、实战 demo：消息体建模

\`\`\`csharp
// 用 record 建模事件总线消息：不可变 + 值相等 + 解构
public record UserCreated(Guid Id, string Name, string Email, DateTime CreatedAt);
public record UserRenamed(Guid Id, string OldName, string NewName);
public record UserDeleted(Guid Id, DateTime DeletedAt);

void PublishEvent<T>(T evt) where T : notnull
{
    // record 的 ToString 自动漂亮打印
    Console.WriteLine($"[事件] {DateTime.Now:HH:mm:ss} {evt}");
}

PublishEvent(new UserCreated(Guid.NewGuid(), "张三", "zs@x.com", DateTime.Now));
PublishEvent(new UserRenamed(Guid.NewGuid(), "张三", "张老三"));
PublishEvent(new UserDeleted(Guid.NewGuid(), DateTime.Now));

// 输出：
// [事件] 14:30:15 UserCreated { Id = ..., Name = 张三, Email = zs@x.com, CreatedAt = ... }
// ...

// 状态机示例
public record State(string Name);
public static readonly State Idle = new("Idle");
public static readonly State Running = new("Running");
public static readonly State Stopped = new("Stopped");

State next = Idle switch
{
    _ when Idle == Idle => Running,    // 这里用模式匹配跳转状态
    _ => Stopped
};
\`\`\`

### 小结

- record 是「数据为王」的类型：自动生成构造、Equals、GetHashCode、ToString、Deconstruct。
- ⭐ \`with\` 表达式 + init 属性 = 不可变修改，并发安全。
- 值相等：record 按字段值比较，class 按引用比较。
- \`record struct\`（C# 10）适合小数据、栈分配。
- 主构造函数参数即 init 属性，最常用写法。
- record class 可继承；record struct 不可继承。
- ⭐ DTO、值对象、事件、消息、配置——首选 record。`,
  },

  // ============================================================
  // 第三十五章：反射
  // ============================================================
  {
    id: 'csharp2-ch35',
    group: '第七部分 高级特性',
    icon: '🪞',
    title: '第三十五章 反射',
    content: `## 第三十五章　反射

反射（Reflection）让程序在运行时**查看自己的类型信息**——类有什么字段、方法、属性？还能动态创建实例、调用方法、读写字段。框架（序列化、ORM、DI 容器）几乎全靠反射实现。

### 一、Type 类：类型的元数据

每个类型在运行时都对应一个 \`Type\` 对象——它是「类型的身份证」：

\`\`\`csharp
public class User
{
    public string Name { get; set; }
    public int Age;
    public void SayHi() => Console.WriteLine($"Hi, {Name}");
}

// 三种获取 Type 对象
Type t1 = typeof(User);                   // 编译期已知类型
Type t2 = new User().GetType();           // 运行时实例获取
Type t3 = Type.GetType("MyApp.User")!;    // 按字符串名获取

Console.WriteLine(t1 == t2);              // True，同一类型同一 Type 对象
Console.WriteLine(t1.Name);               // User
Console.WriteLine(t1.FullName);           // MyApp.User
Console.WriteLine(t1.IsClass);            // True
Console.WriteLine(t1.IsAbstract);        // False
\`\`\`

\`Type\` 是反射的入口：拿到它就能查这个类型的所有信息。

### 二、获取成员：FieldInfo / MethodInfo / PropertyInfo

\`\`\`csharp
using System.Reflection;

public class Sample
{
    public int Field;
    private string _secret = "hidden";
    public string Name { get; set; } = "";
    public void Hello() => Console.WriteLine("Hello");
    private void Secret() => Console.WriteLine("psst");
}

Type t = typeof(Sample);

// 所有公共字段
foreach (FieldInfo f in t.GetFields())
    Console.WriteLine($"字段：{f.Name} 类型={f.FieldType.Name}");
// 字段：Field 类型=Int32

// 所有公共属性
foreach (PropertyInfo p in t.GetProperties())
    Console.WriteLine($"属性：{p.Name} 类型={p.PropertyType.Name}");
// 属性：Name 类型=String

// 所有公共方法（包含 object 继承的）
foreach (MethodInfo m in t.GetMethods())
    Console.WriteLine($"方法：{m.Name} 返回={m.ReturnType.Name}");

// 按名字获取特定方法
MethodInfo? hello = t.GetMethod("Hello");
Console.WriteLine(hello?.Name);   // Hello
\`\`\`

\`GetFields\`/\`GetProperties\`/\`GetMethods\` 默认只返回公共成员，加 \`BindingFlags.NonPublic | BindingFlags.Instance\` 可拿到私有成员。

### 三、动态创建实例

\`\`\`csharp
public class Product
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public Product() { }
    public Product(string name, decimal price) { Name = name; Price = price; }
}

Type t = typeof(Product);

// 1. 无参构造：Activator.CreateInstance
object? obj1 = Activator.CreateInstance(t);
Console.WriteLine(obj1?.GetType().Name);   // Product

// 2. 有参构造：通过构造函数信息
ConstructorInfo? ctor = t.GetConstructor(new[] { typeof(string), typeof(decimal) });
object? obj2 = ctor?.Invoke(new object[] { "鼠标", 99 });
Console.WriteLine(obj2);   // Product { ... Name=鼠标 Price=99 }

// 3. 泛型版本（类型安全）
Product p = (Product)Activator.CreateInstance(typeof(Product), "键盘", 199)!;
Console.WriteLine(p.Name);    // 键盘
\`\`\`

\`Activator.CreateInstance\` 是反射创建实例的入口，框架 DI 容器靠它实例化服务。

### 四、动态调用方法

\`\`\`csharp
public class Calculator
{
    public int Add(int a, int b) => a + b;
    private void Hidden() => Console.WriteLine("私有方法被调用");
}

object calc = new Calculator();
Type t = calc.GetType();

// 公共方法
MethodInfo? add = t.GetMethod("Add");
object? result = add?.Invoke(calc, new object[] { 3, 4 });
Console.WriteLine(result);   // 7

// 私有方法：BindingFlags.NonPublic
MethodInfo? hidden = t.GetMethod("Hidden",
    BindingFlags.NonPublic | BindingFlags.Instance);
hidden?.Invoke(calc, null);   // 私有方法被调用
\`\`\`

\`Invoke\` 第一个参数是实例（静态方法传 null），第二个是参数数组。

### 五、动态读写字段与属性

\`\`\`csharp
public class Box
{
    public int Width;
    public int Height { get; set; }
}

object box = new Box();
Type t = box.GetType();

// 字段读写
FieldInfo? w = t.GetField("Width");
w?.SetValue(box, 100);
Console.WriteLine(w?.GetValue(box));   // 100

// 属性读写
PropertyInfo? h = t.GetProperty("Height");
h?.SetValue(box, 200);
Console.WriteLine(h?.GetValue(box));   // 200
\`\`\`

### 六、读取特性（下一章详讲）

\`\`\`csharp
[AttributeUsage(AttributeTargets.Property)]
public class RequiredAttribute : Attribute { }

public class LoginForm
{
    [Required] public string Username { get; set; } = "";
    [Required] public string Password { get; set; } = "";
    public string? RememberMe { get; set; }
}

// 通过反射读取特性
Type t = typeof(LoginForm);
foreach (PropertyInfo p in t.GetProperties())
{
    bool required = p.IsDefined(typeof(RequiredAttribute), false);
    Console.WriteLine($@"{p.Name} 必填={required}");
}
// Username 必填=True
// Password 必填=True
// RememberMe 必填=False
\`\`\`

\`IsDefined\` 只判断是否有特性，\`GetCustomAttribute\` 还能拿到特性实例读其属性。

### 七、反射应用场景 ⭐

#### 1. JSON 序列化（Newtonsoft.Json / System.Text.Json）

序列化库遍历对象所有公共属性，反射读取名字和值：

\`\`\`csharp
public class User { public string Name { get; set; } = ""; public int Age { get; set; } }

var u = new User { Name = "张三", Age = 28 };
// 序列化库内部用反射读 Name/Age 的值，拼成 JSON
string json = System.Text.Json.JsonSerializer.Serialize(u);
Console.WriteLine(json);   // {"Name":"张三","Age":28}
\`\`\`

#### 2. ORM（Entity Framework / Dapper）

ORM 把数据库表的列名映射到类属性，全靠反射：

\`\`\`csharp
// Dapper 查询时：根据 SELECT 列名，反射找到匹配属性，赋值
var users = connection.Query<User>("SELECT Name, Age FROM Users");
\`\`\`

#### 3. 依赖注入容器

ASP.NET Core 的 DI 容器：扫描程序集，发现带特性或实现接口的类，反射创建实例注册：

\`\`\`csharp
// 简化版 DI 原理
IServiceCollection services = new ServiceCollection();
services.AddTransient<IUserRepo, UserRepo>();   // 内部记录接口→实现类型
// 解析时：反射 typeof(UserRepo)，调用构造函数，注入依赖
\`\`\`

#### 4. 插件系统

主程序运行时加载 DLL，反射扫描所有实现 \`IPlugin\` 接口的类，实例化并调用：

\`\`\`csharp
Assembly asm = Assembly.LoadFrom("MyPlugin.dll");
foreach (Type type in asm.GetTypes())
{
    if (typeof(IPlugin).IsAssignableFrom(type) && !type.IsAbstract)
    {
        var plugin = (IPlugin)Activator.CreateInstance(type)!;
        plugin.Run();
    }
}

public interface IPlugin { void Run(); }
\`\`\`

### 八、性能注意 ⭐

反射比直接调用慢 100-1000 倍：

\`\`\`csharp
public class Foo { public int Bar() => 42; }

var foo = new Foo();
var sw = System.Diagnostics.Stopwatch.StartNew();

// 直接调用：极快
for (int i = 0; i < 1_000_000; i++) foo.Bar();
sw.Stop();
Console.WriteLine($"直接：{sw.ElapsedMilliseconds} ms");

// 反射调用：慢得多
MethodInfo? m = typeof(Foo).GetMethod("Bar");
sw.Restart();
for (int i = 0; i < 1_000_000; i++) m?.Invoke(foo, null);
sw.Stop();
Console.WriteLine($"反射：{sw.ElapsedMilliseconds} ms");
\`\`\`

性能优化手段：
1. **缓存 MemberInfo**：不要每次循环都 \`GetMethod\`，存起来重复用。
2. **委托缓存**：用 \`Delegate.CreateDelegate\` 把反射方法转成委托，调用接近直接速度。
3. **表达式树**：用 \`Expression\` 编译成委托，编译一次反复用。
4. **源生成器（Source Generator）**：.NET 6+ 编译期生成序列化代码，零运行时反射开销。

> 实战经验：业务代码不要为「少写代码」滥用反射——能编译期确定就别拖到运行时。框架内部用反射通常已做缓存。

### 九、实战 demo：迷你 ORM

\`\`\`csharp
using System.Reflection;
using System.Data;

public class ColumnAttribute(string Name) : Attribute
{
    public string Name { get; } = Name;
}

public class TableAttribute(string Name) : Attribute
{
    public string Name { get; } = Name;
}

[Table("users")]
public class UserEntity
{
    [Column("user_name")] public string Name { get; set; } = "";
    [Column("age")] public int Age { get; set; }
}

// 简化 ORM：读 DataRow 生成实体
T Map<T>(DataRow row) where T : new()
{
    var obj = new T();
    Type t = typeof(T);
    string tableName = (t.GetCustomAttribute<TableAttribute>()?.Name) ?? t.Name;
    foreach (PropertyInfo p in t.GetProperties())
    {
        string col = p.GetCustomAttribute<ColumnAttribute>()?.Name ?? p.Name;
        if (row.Table.Columns.Contains(col))
        {
            object? val = row[col] == DBNull.Value ? null : row[col];
            p.SetValue(obj, val);
        }
    }
    return obj;
}

// 假装有 DataRow
var dt = new DataTable();
dt.Columns.Add("user_name"); dt.Columns.Add("age");
dt.Rows.Add("张三", 28);

var user = Map<UserEntity>(dt.Rows[0]);
Console.WriteLine(user.Name);    // 张三
Console.WriteLine(user.Age);     // 28
\`\`\`

### 小结

- 反射 = 运行时探查类型信息，入口是 \`typeof\`/\`GetType()\`，核心是 \`Type\` 对象。
- \`Type\` 拿成员：\`GetFields\`/\`GetProperties\`/\`GetMethods\`/\`GetConstructors\`。
- 动态能力：\`Activator.CreateInstance\` 创建实例，\`MethodInfo.Invoke\` 调用方法，\`SetValue\`/\`GetValue\` 读写成员。
- 三大应用：序列化、ORM、DI 容器；插件系统也常用。
- ⭐ 反射性能远低于直接调用——能缓存就缓存，能编译期就别拖运行时。
- 高频面试点：「反射是什么」「应用场景」「如何优化」。`,
  },

  // ============================================================
  // 第三十六章：特性 Attribute
  // ============================================================
  {
    id: 'csharp2-ch36',
    group: '第七部分 高级特性',
    icon: '✨',
    title: '第三十六章 特性 Attribute',
    content: `## 第三十六章　特性 Attribute

特性（Attribute）是给代码元素（类、方法、属性等）贴的「元数据标签」——本身不执行任何逻辑，但反射能读到它，从而驱动其他行为（验证、序列化、ORM 映射、文档生成）。是「声明式编程」的核心机制。

### 一、特性是什么

特性本质是个类，继承 \`System.Attribute\`，编译后**作为元数据存在程序集中**，运行时通过反射读取。

\`\`\`csharp
// 看看最常见的特性：Obsolete
[Obsolete("请改用 NewMethod()", error: false)]
public void OldMethod() => Console.WriteLine("旧");

public void NewMethod() => Console.WriteLine("新");

// 调用 OldMethod 会编译警告 CS0618
OldMethod();   // IDE 黄色波浪线提示
\`\`\`

特性「什么也不做」，但编译器/工具/框架看到它会做对应的事——\`Obsolete\` 让编译器发警告，\`Serializable\` 让序列化器认可这个类，\`Route\` 让 ASP.NET Core 注册路由。

### 二、内置常用特性

#### 1. Obsolete：标记过时

\`\`\`csharp
public class Api
{
    [Obsolete("V1 已废弃，请用 GetV2", error: false)]   // 警告
    public void GetV1() { }

    [Obsolete("V0 完全移除，禁止使用", error: true)]    // 编译错误
    public void GetV0() { }
}
\`\`\`

\`error: true\` 直接编译失败，强制迁移。

#### 2. Serializable：可序列化

\`\`\`csharp
[Serializable]
public class Config
{
    public string Host = "";
    public int Port;
}
// 二进制序列化器看到 [Serializable] 才允许序列化
\`\`\`

#### 3. Conditional：条件编译

\`\`\`csharp
#define DEBUG   // 顶部定义（或编译参数 /define:DEBUG）

public class Logger
{
    [Conditional("DEBUG")]
    public static void Debug(string msg) => Console.WriteLine($"[DEBUG] {msg}");

    [Conditional("RELEASE")]
    public static void Audit(string msg) => Console.WriteLine($"[RELEASE] {msg}");
}

Logger.Debug("启动中");   // DEBUG 模式下输出
Logger.Audit("用户登录");  // DEBUG 模式下不调用，连参数表达式都不求值
\`\`\`

\`Conditional\` 让调用「按编译常量条件编译」，比 \`#if\` 包调用更干净。

#### 4. 其他常用

\`\`\`csharp
[System.Runtime.InteropServices.DllImport("user32.dll")]
static extern int MessageBox(IntPtr h, string text, string caption, int type);

[ThreadStatic]                          // 每线程独立静态变量
static int _counter;

[System.Text.Json.Serialization.JsonPropertyName("user_name")]
public string Name { get; set; } = "";  // JSON 序列化用此名字
\`\`\`

### 三、自定义特性 ⭐

#### 步骤 1：定义特性类

\`\`\`csharp
// 1. 必须继承 Attribute
// 2. 类名习惯以 Attribute 结尾（使用时可省略）
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class RequiredAttribute : Attribute
{
    public string ErrorMessage { get; set; } = "必填";
    public RequiredAttribute() { }
    public RequiredAttribute(string msg) { ErrorMessage = msg; }
}
\`\`\`

\`AttributeUsage\` 限定此特性可贴的目标：类、方法、属性等。\`AllowMultiple\` 控制能否贴多次。

#### 步骤 2：使用特性

\`\`\`csharp
public class LoginDto
{
    [Required]
    public string Username { get; set; } = "";

    [Required("密码必填")]
    [MinLength(6)]
    public string Password { get; set; } = "";

    [Range(0, 120)]
    public int Age { get; set; }
}

public class MinLengthAttribute(int min) : Attribute
{
    public int Min { get; } = min;
}

public class RangeAttribute(int min, int max) : Attribute
{
    public int Min { get; } = min;
    public int Max { get; } = max;
}
\`\`\`

特性参数分两种：
- **位置参数**：构造函数参数，如 \`Required("密码必填")\`。
- **命名参数**：可选属性赋值，如 \`[Required(ErrorMessage = "必填")]\`。

### 四、命名参数

\`\`\`csharp
public class DisplayAttribute : Attribute
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int Order { get; set; } = 0;
}

public class Form
{
    [Display(Name = "用户名", Description = "登录账号", Order = 1)]
    public string Username { get; set; } = "";

    [Display(Name = "密码", Order = 2)]
    public string Password { get; set; } = "";
}
\`\`\`

命名参数是「属性名 = 值」语法，可省略（用默认值），任意顺序。

### 五、通过反射读特性 ⭐

特性本身不做事，靠反射读取才发挥作用：

\`\`\`csharp
using System.Reflection;

public class RequiredAttribute(string? msg = null) : Attribute
{
    public string Message { get; } = msg ?? "必填";
}

public class UserDto
{
    [Required("用户名必填")] public string Name { get; set; } = "";
    [Required] public string Email { get; set; } = "";
    public string? Phone { get; set; }   // 非必填
}

// 反射读取：IsDefined / GetCustomAttribute / GetCustomAttributes
void Validate(object obj)
{
    foreach (PropertyInfo p in obj.GetType().GetProperties())
    {
        // 判断是否有 Required 特性
        if (p.GetCustomAttribute<RequiredAttribute>() is { } req)
        {
            object? val = p.GetValue(obj);
            if (val is null or "")
                Console.WriteLine($@"{p.Name} 验证失败：{req.Message}");
            else
                Console.WriteLine($@"{p.Name} 验证通过");
        }
    }
}

var u = new UserDto { Name = "", Email = "a@b.com", Phone = null };
Validate(u);
// Name 验证失败：用户名必填
// Email 验证通过
// Phone 没贴 Required，跳过
\`\`\`

三种读取方法：
- \`IsDefined(typeof(X))\`：只判断是否存在，最轻量。
- \`GetCustomAttribute<T>()\`：取单个（重复时取第一个）。
- \`GetCustomAttributes<T>()\`：取所有，返回数组。

### 六、实战 demo：数据验证框架

\`\`\`csharp
using System.Reflection;
using System.Text.RegularExpressions;

[AttributeUsage(AttributeTargets.Property)]
public abstract class ValidationAttribute : Attribute
{
    public string ErrorMessage { get; set; } = "校验失败";
    public abstract bool IsValid(object? value);
}

public class RequiredAttribute : ValidationAttribute
{
    public RequiredAttribute() => ErrorMessage = "必填";
    public override bool IsValid(object? v) => v is string s ? !string.IsNullOrWhiteSpace(s) : v is not null;
}

public class EmailAttribute : ValidationAttribute
{
    public EmailAttribute() => ErrorMessage = "邮箱格式错误";
    public override bool IsValid(object? v) =>
        v is string s && Regex.IsMatch(s, @"^[\\w.-]+@[\\w.-]+\\.\\w+$");
}

public class RangeAttribute(double min, double max) : ValidationAttribute
{
    public override bool IsValid(object? v) =>
        v is IConvertible c && Convert.ToDouble(c) is var x && x >= min && x <= max;
}

public class RegisterDto
{
    [Required] public string Name { get; set; } = "";
    [Required][Email] public string Email { get; set; } = "";
    [Range(0, 120)] public int Age { get; set; }
}

List<string> Validate(object obj)
{
    var errors = new List<string>();
    foreach (PropertyInfo p in obj.GetType().GetProperties())
    {
        foreach (var attr in p.GetCustomAttributes<ValidationAttribute>())
        {
            if (!attr.IsValid(p.GetValue(obj)))
                errors.Add($@"{p.Name}: {attr.ErrorMessage}");
        }
    }
    return errors;
}

var dto = new RegisterDto { Name = "", Email = "bad", Age = 200 };
foreach (var e in Validate(dto)) Console.WriteLine(e);
// Name: 必填
// Email: 邮箱格式错误
// Age: 校验失败
\`\`\`

这就是 ASP.NET Core \`[Required]\`/\`[EmailAddress]\`/\`[Range]\` 等数据注解的本质——你自己也能写。

### 七、实战 demo：表映射（迷你 EF）

\`\`\`csharp
[AttributeUsage(AttributeTargets.Class)]
public class TableAttribute(string Name) : Attribute
{
    public string Name { get; } = Name;
}

[AttributeUsage(AttributeTargets.Property)]
public class ColumnAttribute(string Name) : Attribute
{
    public string Name { get; } = Name;
}

[AttributeUsage(AttributeTargets.Property)]
public class KeyAttribute : Attribute { }

[Table("t_user")]
public class User
{
    [Key][Column("id")] public int Id { get; set; }
    [Column("user_name")] public string Name { get; set; } = "";
    [Column("email_addr")] public string Email { get; set; } = "";
}

// 反射生成 SQL
string BuildSelectSql<T>()
{
    Type t = typeof(T);
    var tableAttr = t.GetCustomAttribute<TableAttribute>();
    string table = tableAttr?.Name ?? t.Name;

    var cols = t.GetProperties()
        .Select(p => new
        {
            Prop = p,
            Col = p.GetCustomAttribute<ColumnAttribute>()?.Name ?? p.Name,
            IsKey = p.IsDefined(typeof(KeyAttribute))
        });
    string columnList = string.Join(", ", cols.Select(c => c.Col));
    string where = string.Join(" AND ",
        cols.Where(c => c.IsKey).Select(c => $@"{c.Col}=@{c.Prop.Name}"));
    return $@"SELECT {columnList} FROM {table} WHERE {where}";
}

Console.WriteLine(BuildSelectSql<User>());
// SELECT id, user_name, email_addr FROM t_user WHERE id=@Id
\`\`\`

EF Core、Dapper Contrib 都是这套机制——读特性生成 SQL。

### 小结

- 特性 = 给代码贴「元数据标签」，本身不执行逻辑，靠反射读取。
- 内置高频：\`Obsolete\`（过时警告）、\`Serializable\`、\`Conditional\`、\`DllImport\`、\`JsonPropertyName\`。
- 自定义：继承 \`Attribute\`，加 \`AttributeUsage\` 限定目标，命名参数用 \`属性 = 值\`。
- ⭐ 反射读特性三招：\`IsDefined\` 判存在、\`GetCustomAttribute<T>\` 取单个、\`GetCustomAttributes<T>\` 取全部。
- 应用场景：数据验证（ASP.NET Core Model 验证）、ORM 表/列映射、序列化字段重命名、API 文档生成（Swagger 读特性生成说明）。
- 高频面试点：「特性是什么」「和注释区别」「怎么自己写」。`,
  },

  // ============================================================
  // 第三十七章：匿名类型与 dynamic
  // ============================================================
  {
    id: 'csharp2-ch37',
    group: '第七部分 高级特性',
    icon: '🎭',
    title: '第三十七章 匿名类型与 dynamic',
    content: `## 第三十七章　匿名类型与 dynamic

C# 有两种「不显式定义类型」的写法：**匿名类型**（编译期生成类型，强类型）和 **dynamic**（运行时绑定，弱类型）。两者本质完全不同，本章讲清边界。

### 一、匿名类型：var x = new { ... } ⭐

匿名类型让编译器**自动生成一个 class**，属性按初始化推导：

\`\`\`csharp
// 不定义类，直接 new 一个对象
var p = new { Name = "张三", Age = 28 };
Console.WriteLine(p.Name);      // 张三
Console.WriteLine(p.Age);       // 28
Console.WriteLine(p.GetType().Name);  // <>f__AnonymousType0\`2 之类的内部名

// 属性只读，不可改
// p.Age = 29;   // 编译错误
\`\`\`

要点：
- \`var\` 推导，写起来跟 JS 对象字面量差不多。
- 属性是只读的（init 都不是），匿名类型本身不可变。
- 编译器生成内部 class，**强类型**——拼写错编译失败。

### 二、匿名类型的值相等

匿名类型自动实现 \`Equals\`/\`GetHashCode\`——按属性值：

\`\`\`csharp
var a = new { Name = "张三", Age = 28 };
var b = new { Name = "张三", Age = 28 };
var c = new { Name = "李四", Age = 28 };

Console.WriteLine(a == b);   // True，值相等
Console.WriteLine(a == c);   // False
Console.WriteLine(a.Equals(b));  // True

// 同一编译单元里，属性名+顺序相同的匿名对象是同一类型
Console.WriteLine(a.GetType() == b.GetType());   // True
\`\`\`

注意：「同类型」要求属性名+顺序+类型完全一致—— \`new { X = 1, Y = 2 }\` 和 \`new { Y = 2, X = 1 }\` 是两个不同类型。

### 三、匿名类型与 LINQ ⭐

匿名类型是 LINQ 投影的标配——只取需要的字段：

\`\`\`csharp
var users = new[]
{
    new { Name = "张三", Age = 28, Salary = 8000m },
    new { Name = "李四", Age = 35, Salary = 15000m },
    new { Name = "王五", Age = 22, Salary = 5000m }
};

// 只取名字和工资
var summary = users.Select(u => new { u.Name, u.Salary });
foreach (var s in summary)
    Console.WriteLine($@"{s.Name}: {s.Salary}");
// 张三: 8000 / 李四: 15000 / 王五: 5000

// 分组聚合
var byAge = users.GroupBy(u => u.Age > 30 ? "老" : "少")
    .Select(g => new { Group = g.Key, Count = g.Count(), Avg = g.Average(u => u.Salary) });
foreach (var g in byAge)
    Console.WriteLine($@"{g.Group}: {g.Count} 人，平均 {g.Avg}");
\`\`\`

LINQ + 匿名类型 = 函数式数据变换，写法非常简洁。

### 四、dynamic 动态类型

\`dynamic\` 关键字告诉编译器「类型到运行时再绑」：

\`\`\`csharp
dynamic d = 42;
Console.WriteLine(d);          // 42
d = "hello";                    // 类型可以变
Console.WriteLine(d.Length);    // 5，运行时才知道是字符串

dynamic e = new System.Text.StringBuilder();
e.Append("a").Append("b");      // 编译器不检查，运行时绑定
Console.WriteLine(e.ToString());  // ab
\`\`\`

要点：
- 编译器放弃类型检查——成员是否存在、参数是否匹配，**都推迟到运行时**。
- 类型可在运行时变（本质是 \`object\` + 动态绑定）。
- 找不到成员抛 \`RuntimeBinderException\`。

### 五、dynamic vs var vs object ⭐

三者容易混淆，区别是「什么时候确定类型」：

\`\`\`csharp
// var：编译期确定类型，强类型，仅是简写
var s1 = "hi";      // s1 是 string
// s1 = 42;          // 编译错误，类型固定为 string

// object：编译期是 object，运行时本是别的类型，但要用得强转
object o = "hi";
// o.Length;          // 编译错误，object 没有 Length
Console.WriteLine(((string)o).Length);

// dynamic：编译期不检查，运行时绑定
dynamic d = "hi";
Console.WriteLine(d.Length);    // OK，运行时发现是 string，调用 Length
d = 42;
Console.WriteLine(d.ToString());  // OK
\`\`\`

对比表：

| 关键字 | 编译期类型检查 | 运行时绑定 | 性能 |
|--------|---------------|-----------|------|
| var | 有 | 否 | 与显式类型相同 |
| object | 有（但只能用 object 成员） | 装拆箱/强转 | 装拆箱开销 |
| dynamic | 无 | 是 | 慢（运行时查找） |

### 六、ExpandoObject：动态对象

\`ExpandoObject\` 是「可在运行时增删成员」的对象：

\`\`\`csharp
using System.Dynamic;

dynamic eo = new ExpandoObject();
eo.Name = "张三";
eo.Age = 28;
eo.SayHi = (Action)(() => Console.WriteLine($@"Hi, {eo.Name}"));

eo.SayHi();      // Hi, 张三
Console.WriteLine(eo.Age);  // 28

// 动态添加属性集合
eo.Tags = new List<string> { "vip", "active" };
Console.WriteLine(string.Join(",", eo.Tags));   // vip,active

// 也能当字典用
var dict = (IDictionary<string, object?>)eo;
foreach (var kv in dict)
    Console.WriteLine($@"{kv.Key} = {kv.Value}");
\`\`\`

\`ExpandoObject\` 适合处理「结构未知的数据」——比如读 JSON 没有对应类、配置文件解析。

### 七、反射 vs dynamic

很多场景两者都能做，但 dynamic 简洁得多：

\`\`\`csharp
public class Foo { public string Bar() => "baz"; }

object obj = new Foo();

// 反射写法：啰嗦
var method = obj.GetType().GetMethod("Bar");
string? result1 = (string?)method?.Invoke(obj, null);
Console.WriteLine(result1);   // baz

// dynamic 写法：简洁
dynamic d = obj;
string result2 = d.Bar();      // 运行时绑定
Console.WriteLine(result2);   // baz
\`\`\`

何时选哪个：
- 已知类型用 \`dynamic\`（编译器帮你找方法）。
- 需要枚举类型所有成员（如 ORM/序列化框架）—— 必须反射。
- 性能敏感：反射缓存 + 委托比 dynamic 略快。

### 八、实战 demo：动态 JSON 处理

\`\`\`csharp
using System.Dynamic;
using System.Text.Json;

// JSON 没有对应类，用 dynamic 风格访问
string json = """{"name":"张三","age":28,"address":{"city":"北京"}}""";

// System.Text.Json 推荐用 JsonDocument / JsonSerializer + ExpandoObject
dynamic data = JsonSerializer.Deserialize<ExpandoObject>(json)!;
Console.WriteLine(data.name);          // 张三
Console.WriteLine(data.age);           // 28
Console.WriteLine(data.address.city);  // 北京

// 动态修改后序列化回去
data.age = 29;
data.email = "zs@x.com";    // 添加新字段
string newJson = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
Console.WriteLine(newJson);
// {
//   "name": "张三",
//   "age": 29,
//   "address": { "city": "北京" },
//   "email": "zs@x.com"
// }
\`\`\`

### 九、实战 demo：动态包装器

\`\`\`csharp
// 用 dynamic 包装一个字典，像访问属性一样访问键值
public class DynDict : DynamicObject
{
    private readonly Dictionary<string, object?> _data = new();

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        if (_data.TryGetValue(binder.Name, out result)) return true;
        result = null;
        return false;
    }

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        _data[binder.Name] = value;
        return true;
    }

    public override IEnumerable<string> GetDynamicMemberNames() => _data.Keys;
}

dynamic d = new DynDict();
d.Name = "张三";
d.Age = 28;
Console.WriteLine(d.Name);    // 张三
Console.WriteLine(d.Age);     // 28

// 自定义 DynamicObject：实现动态方法、动态属性，DSL/构建器常用
\`\`\`

继承 \`DynamicObject\` 重写 \`TryGetMember\`/\`TrySetMember\`/\`TryInvokeMember\`，可定制 dynamic 行为——FluentInterface、XML/HTML 构建器常这么写。

### 小结

- 匿名类型 \`new { Name = "..." }\`：编译期生成 class，强类型，只读，LINQ 投影必备。
- 匿名类型值相等：相同属性/顺序/值即相等，自动生成 \`Equals\`。
- ⭐ \`dynamic\`：放弃编译期检查，运行时绑定，比 \`var\`/\`object\` 慢。
- 三者区别：var 编译期已知、object 强转才能用、dynamic 完全动态。
- \`ExpandoObject\` 可动态增删成员，处理结构未知数据（JSON、配置）。
- \`DynamicObject\` 自定义重写，DSL/构建器场景。
- 反射 vs dynamic：已知类型用 dynamic 简洁；枚举成员必反射。
- ⭐ 实战建议：业务代码优先强类型（var/匿名类型），dynamic 留给「跨语言互操作/动态数据」场景。`,
  },

  // ============================================================
  // 第三十八章：协变与逆变
  // ============================================================
  {
    id: 'csharp2-ch38',
    group: '第七部分 高级特性',
    icon: '🔄',
    title: '第三十八章 协变与逆变',
    content: `## 第三十八章　协变与逆变

协变（Covariance）和逆变（Contravariance）解决一个问题：**「子类型对象」能不能赋值给「父类型泛型参数」的容器/委托**。听起来绕，看完代码就懂。

### 一、问题背景：泛型默认不兼容

\`\`\`csharp
public class Animal { }
public class Dog : Animal { }

Dog d = new Dog();
Animal a = d;          // OK：Dog 是 Animal

// 但是！
List<Dog> dogs = new List<Dog>();
// List<Animal> animals = dogs;   // 编译错误！List<Dog> 不能赋值给 List<Animal>
\`\`\`

为什么不兼容？因为如果允许，下面这种情况就出问题：

\`\`\`csharp
// 假设允许：List<Animal> animals = dogs;
// animals.Add(new Cat());   // 灾难！往 Dog 列表里塞了 Cat
\`\`\`

\`List<T>\` 既能读又能写，所以不能协变。但**只读\`IEnumerable<T>\` 就可以**。

### 二、协变 out：子类型 → 父类型 ⭐

\`out\` 关键字声明「T 只能出现在输出位置（返回值）」，编译器因此允许子类型泛型参数赋值给父类型：

\`\`\`csharp
// .NET 内置 IEnumerable<out T>：声明 T 只能用于输出
IEnumerable<Dog> dogs = new List<Dog> { new Dog(), new Dog() };
IEnumerable<Animal> animals = dogs;   // OK！协变

foreach (Animal a in animals)         // 取出来当 Animal 用
    Console.WriteLine(a.GetType().Name);
\`\`\`

原理：\`IEnumerable<Animal>\` 只能**取出**元素，不能添加——既然取出来都是 \`Animal\`，那么 \`IEnumerable<Dog>\` 当然也是 \`IEnumerable<Animal>\`（取出的是 Animal 的子类 Dog，安全）。

自定义协变接口：

\`\`\`csharp
public interface IProducer<out T>     // out 标记协变
{
    T Produce();                      // T 只能用作返回值
}

public class DogProducer : IProducer<Dog>
{
    public Dog Produce() => new Dog();
}

IProducer<Dog> dp = new DogProducer();
IProducer<Animal> ap = dp;             // OK，协变
Animal produced = ap.Produce();        // 取出来是 Dog，当 Animal 用没问题
\`\`\`

\`out\` 约束：T 只能用在返回值、属性 getter，**不能用于参数**。

### 三、逆变 in：父类型 → 子类型 ⭐

\`in\` 关键字声明「T 只能出现在输入位置（参数）」，允许父类型泛型参数赋值给子类型——方向反过来：

\`\`\`csharp
// .NET 内置 Action<in T>：声明 T 只能用于参数
Action<Animal> animalAction = a => Console.WriteLine("处理 Animal");

// 反过来：把处理 Animal 的 Action 当成处理 Dog 的 Action
Action<Dog> dogAction = animalAction;   // OK！逆变

dogAction(new Dog());    // 调用：传入 Dog，被当作 Animal 处理（Dog 是 Animal，安全）
\`\`\`

原理：\`Action<Dog>\` 期望接收 \`Dog\` 调用，传入 \`Dog\`。而 \`animalAction\` 能处理任何 \`Animal\`——既然 Dog 是 Animal，自然也能处理。所以「能处理 Animal 的处理器」可以赋值给「需要处理 Dog 的变量」。

自定义逆变接口：

\`\`\`csharp
public interface IConsumer<in T>     // in 标记逆变
{
    void Consume(T item);              // T 只能用作参数
}

public class AnimalConsumer : IConsumer<Animal>
{
    public void Consume(Animal a) => Console.WriteLine("消费 Animal");
}

IConsumer<Animal> ac = new AnimalConsumer();
IConsumer<Dog> dc = ac;                // OK，逆变
dc.Consume(new Dog());                 // 传入 Dog，按 Animal 处理
\`\`\`

\`in\` 约束：T 只能用在方法参数，**不能用于返回值**。

### 四、为何需要协变逆变

#### 协变价值：通用集合/产出接口

\`\`\`csharp
// 没有协变：返回不同具体类型的同类，调用者要处理很多类型
public IEnumerable<Animal> GetAllAnimals()
{
    List<Dog> dogs = GetDogs();
    List<Cat> cats = GetCats();
    List<Bird> birds = GetBirds();
    var all = new List<Animal>();
    all.AddRange(dogs);    // 协变允许：IEnumerable<Dog> 当 IEnumerable<Animal>
    all.AddRange(cats);    // AddRange 接受 IEnumerable<Animal>，因为协变
    all.AddRange(birds);
    return all;
}

public record Cat : Animal { }
public record Bird : Animal { }
public List<Dog> GetDogs() => new() { new Dog() };
public List<Cat> GetCats() => new() { new Cat() };
public List<Bird> GetBirds() => new() { new Bird() };
\`\`\`

没有协变，\`AddRange\` 就得为每个具体类型写一遍，或大量强转。

#### 逆变价值：通用处理器/事件

\`\`\`csharp
// 事件处理器：处理基类的处理器可以接收所有子类事件
public delegate void Handler<in T>(T args);

public class AnimalEventArgs : EventArgs { public string? Name; }
public class DogEventArgs : AnimalEventArgs { public string? Breed; }

Handler<AnimalEventArgs> animalHandler = args =>
    Console.WriteLine($@"处理动物事件：{args.Name}");

Handler<DogEventArgs> dogHandler = animalHandler;  // 逆变
dogHandler(new DogEventArgs { Name = "旺财", Breed = "拉布拉多" });
// 输出：处理动物事件：旺财（Dog 事件被 Animal 处理器处理）
\`\`\`

ASP.NET Core 中间件、事件总线大量用逆变。

### 五、类型安全

协变逆变通过 \`out\`/\`in\` 让编译器**保证类型安全**：

\`\`\`csharp
// out T 接口里 T 不能用作参数：编译错误
public interface IBad<out T>
{
    // void Take(T item);     // 编译错误！out T 不能做参数
    T Give();                  // OK，只能做返回值
}

// in T 接口里 T 不能用作返回值
public interface IBad2<in T>
{
    void Take(T item);         // OK
    // T Give();                // 编译错误！in T 不能做返回值
}

// 编译器禁止危险操作后，协变/逆变才能在运行时安全
\`\`\`

类型安全口诀：
- **协变 out**：「\`IProducer<子>\` 当 \`IProducer<父>\` 用」——只读，安全。
- **逆变 in**：「\`IConsumer<父>\` 当 \`IConsumer<子>\` 用」——只写，安全。
- **不变（无修饰）**：「\`List<T>\` 既读又写」，不兼容。

### 六、Func / Action 的协变逆变

.NET 内置 \`Func<in T1, out TResult>\` 同时用了 in/out：

\`\`\`csharp
// Func<T, TResult>：参数 T 是逆变，返回 TResult 是协变
Func<Animal, Dog> factory = a => new Dog();   // 给 Animal 产出 Dog

// 协变 + 逆变：Func<Animal, Dog> 当 Func<Dog, Animal> 用
Func<Dog, Animal> generalized = factory;
// 因为：传入 Dog（比 Animal 更具体，可作 Animal），返回 Dog（是 Animal，可作 Animal）
// 两个方向都安全！

Animal result = generalized(new Dog());
\`\`\`

记住：参数逆变、返回协变是函数式编程的天然规律——「函数类型」的子类型关系正好和参数反着、和返回顺着。

### 七、实战 demo：事件总线

\`\`\`csharp
public abstract record DomainEvent(DateTime OccurredAt);
public record UserCreated(string Name) : DomainEvent(DateTime.Now);
public record UserDeleted(string Name) : DomainEvent(DateTime.Now);

// 处理器接口：in 逆变
public interface IHandler<in TEvent> where TEvent : DomainEvent
{
    void Handle(TEvent evt);
}

public class GenericEventLogger : IHandler<DomainEvent>
{
    public void Handle(DomainEvent evt) =>
        Console.WriteLine($@"[{evt.OccurredAt:HH:mm:ss}] 收到事件 {evt.GetType().Name}");
}

// 注册到具体事件类型：DomainEvent 处理器可用作任何子事件处理器
IHandler<UserCreated> userCreatedHandler = new GenericEventLogger();
IHandler<UserDeleted> userDeletedHandler = new GenericEventLogger();

userCreatedHandler.Handle(new UserCreated("张三"));
userDeletedHandler.Handle(new UserDeleted("李四"));
// 两个事件都被通用 Logger 处理了
\`\`\`

### 八、实战 demo：协变工厂与仓库

\`\`\`csharp
public interface IEntity { int Id { get; } }
public record User(int Id, string Name) : IEntity;
public record Order(int Id, decimal Total) : IEntity;

// 协变工厂：返回 IEntity，能接受任何具体工厂
public interface IRepository<out T> where T : IEntity
{
    T GetById(int id);
    IEnumerable<T> GetAll();
}

public class UserRepository : IRepository<User>
{
    public User GetById(int id) => new User(id, "用户" + id);
    public IEnumerable<User> GetAll() => new[]
    {
        new User(1, "张三"),
        new User(2, "李四")
    };
}

IRepository<User> userRepo = new UserRepository();
IRepository<IEntity> entityRepo = userRepo;   // 协变：User -> IEntity

foreach (var e in entityRepo.GetAll())
    Console.WriteLine($@"[{e.Id}] {e}");
\`\`\`

### 九、记忆口诀

- **协变 out**：顺着走，\`IEnumerable<子>\` 当 \`IEnumerable<父>\`，\`Func<out T>\` 返回值。
- **逆变 in**：反着走，\`Action<父>\` 当 \`Action<子>\`，\`Func<in T>\` 参数。
- **out 只输出**：返回值、属性 get、不能做参数。
- **in 只输入**：方法参数、不能做返回值。
- **不变**：\`List<T>\`/\`IList<T>\` 既读又写，不能协变也不能逆变。

### 小结

- 协变（out）：子类型泛型参数可赋值给父类型——只读场景（\`IEnumerable<out T>\`）。
- 逆变（in）：父类型泛型参数可赋值给子类型——只写场景（\`Action<in T>\`、\`IHandler<in T>\`）。
- ⭐ \`out\`/\`in\` 修饰让编译器保证类型安全，否则默认泛型是不变（\`List<T>\`）。
- 应用场景：通用集合（\`IEnumerable\`）、事件处理器（\`EventHandler\`）、Func/Action、DI 容器、仓储模式。
- ⭐ 高频面试点：「为什么 \`List<Dog>\` 不能赋值给 \`List<Animal>\`」「协变逆变区别」「Func 协变逆变」。
- 现代业务代码：理解 \`IEnumerable\`/\`Action\` 的协变逆变即可，自定义协变接口主要给框架作者用。`,
  },
];

export { chapters };
